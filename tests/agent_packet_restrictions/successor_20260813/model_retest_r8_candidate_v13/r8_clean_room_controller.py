#!/usr/bin/env python3
"""No-write clean-room cell state machine for R8 candidate-13.

The controller emits canonical storage proposals.  A separate trusted caller
may persist those bytes create-only with apply_patch and must reopen them before
the next transition.  This module never opens a filesystem path for writing.
Self-test is closed-world and makes no subject, provider, or network call.
"""
from __future__ import annotations

import argparse
import hashlib
import importlib.util
import json
import os
from pathlib import Path
import re
import select
import signal
import stat
import subprocess
import sys
import time
from types import ModuleType
from typing import Any, Callable

sys.dont_write_bytecode = True

CANDIDATE_ID = "PW-R8-ITERATIVE-FIX-TWO-CLEAN-RUNS-20260815.CANDIDATE-13"
IDENTITY_FAMILY = "PW-R8-ITERATIVE-FIX-TWO-CLEAN-RUNS-20260815"
REPO = Path("/mnt/Cursor/PuppetMaster")
SUCCESSOR = REPO / "tests/agent_packet_restrictions/successor_20260813"
ROOT = SUCCESSOR / "model_retest_r8_candidate_v13"
V9_ROOT = SUCCESSOR / "model_retest_r8_candidate_v9"
V9_HARNESS = V9_ROOT / "r8_harness.py"
V9_DRIVER = V9_ROOT / "r8_subject_task_driver.py"
V12_PREFLIGHT = SUCCESSOR / "model_retest_r8_candidate_v12/deterministic_preflight_report.json"
V12_PROCESS_CONTRACT = SUCCESSOR / "model_retest_r8_candidate_v12/process_completion_contract.json"
V12_A02_RENDER = SUCCESSOR / "model_retest_r8_candidate_v12_run_01/slot-alpha/rendered/S10A_DECISION_A02.txt"
V12_A02_RECEIPT = SUCCESSOR / "model_retest_r8_candidate_v12_run_01/direct_appserver_receipts/slot-alpha_S10A_DECISION_A02.json"
GOAL_ADDENDUM = SUCCESSOR / "r8_goal_loop_buster_addendum_v1.json"
DIAGNOSIS = SUCCESSOR / "r8_clean_room_execution_controller_diagnosis_v1.json"

SLOTS = ("slot-alpha", "slot-bravo", "slot-charlie")
ROUTES = {
    "slot-alpha": ("gpt-5.4-mini", "xhigh"),
    "slot-bravo": ("gpt-5.4-mini", "medium"),
    "slot-charlie": ("gpt-5.6-luna", "medium"),
}
STAGES = ("S10A", "S10B", "S20A", "S20B", "S30A", "S30B", "S40A", "S40B", "S45A", "S45B", "S50", "S55", "S60P", "S60C", "S60K", "S70", "S80", "S90")
RUN_ID_RE = re.compile(r"^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$")
CELL_RE = re.compile(r"^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$")
HEX64_RE = re.compile(r"^[0-9a-f]{64}$")

DISPATCH_ATTEMPT_KEYS = (
    "schema_id", "candidate_id", "run_id", "slot", "cell", "execution_root",
    "ordered_index", "attempt_ordinal", "requested_model", "requested_thinking",
    "dispatch_nonce", "dispatch_schedule_sha256", "dispatch_schedule_bytes",
    "rendered_relative_path", "render_storage_sha256", "render_storage_bytes",
    "provider_visible_payload_sha256", "provider_visible_payload_bytes",
    "fresh_task_required", "first_attempt_subject_call", "subject_call_count_ceiling",
    "retry_count", "best_of", "replacement_result", "status",
)
COMPLETION_KEYS = (
    "schema_id", "candidate_id", "run_id", "slot", "cell", "execution_root",
    "status", "dispatch_attempt_relative_path", "dispatch_attempt_storage_sha256",
    "dispatch_attempt_storage_bytes", "rendered_relative_path", "render_storage_sha256",
    "render_storage_bytes", "provider_visible_payload_sha256",
    "provider_visible_payload_bytes", "receipt_relative_path", "receipt_storage_sha256", "receipt_storage_bytes",
    "capture_relative_path", "capture_storage_sha256", "capture_storage_bytes",
    "score_relative_path", "score_storage_sha256", "score_storage_bytes",
    "score_verdict", "dispatch_nonce", "thread_id", "turn_id", "rollout_path",
    "rollout_storage_sha256", "rollout_storage_bytes", "fresh_context",
    "first_attempt_subject_call", "retry_count", "best_of", "replacement_result",
    "material_validation_passed", "exact_chain_reopened", "stop_disposition",
)
RENDER_OBSERVATION_KEYS = (
    "schema_id", "candidate_id", "run_id", "slot", "cell", "execution_root",
    "rendered_relative_path", "storage_sha256", "storage_bytes",
    "provider_visible_payload_sha256", "provider_visible_payload_bytes",
    "lstat_dev", "lstat_ino", "lstat_size", "lstat_mtime_ns",
    "expected_storage_sha256", "expected_storage_bytes", "exact_one_terminal_lf",
    "regular_nonlink", "stable_across_independent_render", "observed_equals_expected",
    "observation_phase",
)
RECEIPT_KEYS = (
    "schema_id", "candidate_id", "run_id", "slot", "cell", "execution_root",
    "requested_model", "requested_thinking", "provider_effective_model",
    "provider_effective_thinking", "host_id", "thread_id", "turn_id",
    "fresh_task_identity_basis", "status", "subject_call_started", "fresh_context",
    "first_attempt_subject_call", "retry_count", "best_of", "replacement_result",
    "admission", "render_storage_sha256", "render_storage_bytes",
    "provider_visible_payload_sha256", "provider_visible_payload_bytes",
    "semantic_packet_sha256", "semantic_packet_bytes", "dispatch_schedule",
    "dispatch_nonce", "dispatch_binding", "dispatch_wrapper_sha256",
    "dispatch_wrapper_bytes", "rollout_path", "rollout_storage_sha256",
    "rollout_storage_bytes", "model_provider", "turn_context_model",
    "turn_context_effort", "started_at_epoch_seconds", "completed_at_epoch_seconds",
    "duration_ms", "assistant_final_messages", "assistant_final_messages_sha256",
    "assistant_final_messages_bytes", "single_text_output_utf8",
    "single_text_output_sha256", "single_text_output_bytes",
    "text_normalization_receipt", "prohibited_activity_items",
    "prohibited_activity_items_sha256", "prohibited_activity_items_bytes",
    "prohibited_activity_item_types", "conformance_observations", "identity_limitation",
)
CAPTURE_KEYS = (
    "schema_id", "candidate_id", "run_id", "slot", "cell",
    "subject_call_started", "subject_call_completed", "thread_id", "turn_id",
    "assistant_final_messages", "assistant_final_messages_sha256",
    "assistant_final_messages_bytes", "single_text_output_utf8",
    "single_text_output_sha256", "single_text_output_bytes",
    "text_normalization_receipt", "prohibited_activity_item_types",
    "conformance_observations", "driver_receipt_storage_sha256",
    "driver_receipt_storage_bytes",
)
FORBIDDEN_COMPLETION_FIELDS = frozenset({
    "outer_exec_live_session_observed", "outer_exec_session_id", "outer_exec_poll_count",
    "outer_exec_terminal_observed", "outer_exec_exit_code",
    "outer_exec_stdout_fully_captured", "driver_argv", "driver_argv_sha256",
    "driver_argv_bytes", "child_live_poll_observed", "child_poll_count",
    "cell_transaction_state", "persistence_method", "persisted_only_after_outer_exit",
})
HISTORICAL_SIGNATURES = (
    "SCHEMA_RECEIPT_V4_CAPTURE_V3_INTERFACE_MISMATCH",
    "PROCESS_SESSION_OUTER_LIVE_SESSION_NOT_POLLED_TO_TERMINAL_AND_INCOMPLETE_RECEIPT_PERSISTED",
    "CUSTODY_DECLARED_AUDITED_BUNDLE_MISSING_REQUIRED_FILES",
    "ADMISSION_WRONG_RENDER_DIRECTORY_RENDERS_INSTEAD_OF_RENDERED",
    "EVIDENCE_PERSISTENCE_RENDER_NOT_EXACTLY_ONE_TERMINAL_LF_BEFORE_DISPATCH",
    "EVIDENCE_PERSISTENCE_RENDER_BYTES_MUTATED_AFTER_SUBJECT_START",
    "TASK_LIFECYCLE_STOP_ACCEPTED_BEFORE_STARTED_CELL_EVIDENCE_CHAIN_SEALED",
    "EXTERNAL_OUTER_SESSION_COMPLETION_METADATA_DISCARDED_AFTER_TERMINAL_POLL_BEFORE_CELL_SEAL",
)
SAFE_NON_TOOL_RESPONSE_ITEM_TYPES = frozenset({"message", "reasoning"})
WRAPPER_SOURCE_THREAD_ID = "019ffbff-994a-76f0-9c06-57bab28b7ee3"


class Invalid(RuntimeError):
    pass


def sha(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def canonical(value: Any) -> bytes:
    return json.dumps(value, ensure_ascii=False, separators=(",", ":")).encode("utf-8")


def _reject_duplicates(pairs: list[tuple[str, Any]]) -> dict[str, Any]:
    out: dict[str, Any] = {}
    for key, value in pairs:
        if key in out:
            raise Invalid(f"duplicate JSON key: {key}")
        out[key] = value
    return out


def strict_object(data: bytes, label: str, *, storage: bool = True) -> dict[str, Any]:
    raw = data
    if storage:
        if not raw.endswith(b"\n") or raw.endswith(b"\n\n") or b"\r" in raw:
            raise Invalid(f"{label}: canonical storage must have exactly one terminal LF")
        raw = raw[:-1]
    try:
        value = json.loads(raw.decode("utf-8"), object_pairs_hook=_reject_duplicates)
    except (UnicodeDecodeError, json.JSONDecodeError, Invalid) as exc:
        raise Invalid(f"{label}: invalid strict JSON: {exc}") from exc
    if not isinstance(value, dict):
        raise Invalid(f"{label}: top level must be object")
    if canonical(value) != raw:
        raise Invalid(f"{label}: JSON is not canonical minified UTF-8")
    return value


def preserved_object(data: bytes, label: str) -> dict[str, Any]:
    try:
        value = json.loads(data.decode("utf-8"), object_pairs_hook=_reject_duplicates)
    except (UnicodeDecodeError, json.JSONDecodeError, Invalid) as exc:
        raise Invalid(f"{label}: invalid preserved JSON: {exc}") from exc
    if not isinstance(value, dict):
        raise Invalid(f"{label}: top level must be object")
    return value


def regular(path: Path, label: str) -> tuple[bytes, os.stat_result]:
    try:
        before = os.lstat(path)
    except FileNotFoundError as exc:
        raise Invalid(f"{label}: absent") from exc
    if not stat.S_ISREG(before.st_mode) or stat.S_ISLNK(before.st_mode):
        raise Invalid(f"{label}: not a regular non-link")
    fd = os.open(path, os.O_RDONLY | getattr(os, "O_NOFOLLOW", 0))
    try:
        opened = os.fstat(fd)
        parts: list[bytes] = []
        while True:
            part = os.read(fd, 1 << 20)
            if not part:
                break
            parts.append(part)
        after = os.fstat(fd)
    finally:
        os.close(fd)
    identity = lambda item: (item.st_dev, item.st_ino, item.st_size, item.st_mtime_ns)
    if identity(before) != identity(opened) or identity(opened) != identity(after):
        raise Invalid(f"{label}: changed during reopen")
    return b"".join(parts), after


def exact_file(path: Path, label: str) -> tuple[bytes, dict[str, Any], os.stat_result]:
    storage, info = regular(path, label)
    return storage, strict_object(storage, label), info


def execution_root(value: str | Path) -> Path:
    path = Path(value).resolve()
    if not path.is_relative_to(SUCCESSOR.resolve()):
        raise Invalid("execution root must remain beneath successor_20260813")
    if not path.is_dir():
        raise Invalid("execution root must already exist")
    return path


def _module(path: Path, name: str) -> ModuleType:
    spec = importlib.util.spec_from_file_location(name, path)
    if spec is None or spec.loader is None:
        raise Invalid(f"module unavailable: {path}")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


_SEMANTICS: dict[str, ModuleType] = {}


def semantic_module(candidate_id: str = CANDIDATE_ID) -> ModuleType:
    if candidate_id in _SEMANTICS:
        return _SEMANTICS[candidate_id]
    harness = _module(V9_HARNESS, "pw_r8_candidate_v9_semantics_for_v13")
    module = harness.semantic_module(candidate_identity=False)
    module.CANDIDATE_ID = candidate_id
    module.validated_capture_envelope = _semantic_capture_callback
    _SEMANTICS[candidate_id] = module
    return module


def _semantic_capture_callback(exec_root: Path, slot: str, cell: str) -> tuple[bytes | None, dict[str, Any]]:
    root = Path(exec_root).resolve()
    receipt_storage, receipt, _ = exact_file(_paths(root, slot, cell)["receipt"][1], f"semantic prior receipt {slot}/{cell}")
    capture_storage, capture, _ = exact_file(_paths(root, slot, cell)["capture"][1], f"semantic prior capture {slot}/{cell}")
    expected = _capture_from_receipt(receipt, receipt_storage)
    if tuple(capture) != CAPTURE_KEYS or capture != expected or capture_storage != canonical(expected) + b"\n":
        raise Invalid("semantic prior capture differs from exact receipt projection")
    text = capture.get("text_normalization_receipt", {}).get("scoring_text_output_utf8")
    return (None if text is None else text.encode("utf-8")), capture


def schedule() -> tuple[str, ...]:
    module = semantic_module()
    cells = tuple(module.SUBJECT_CELLS)
    if len(cells) != 97 or len(cells) != len(set(cells)) or any(not CELL_RE.fullmatch(x) for x in cells):
        raise Invalid("frozen semantic schedule is not exact 97-cell closed world")
    return cells


def _paths(root: Path, slot: str, cell: str) -> dict[str, tuple[str, Path]]:
    rels = {
        "render": f"{slot}/rendered/{cell}.txt",
        "attempt": f"dispatch_attempts/{slot}_{cell}.json",
        "receipt": f"direct_appserver_receipts/{slot}_{cell}.json",
        "capture": f"{slot}/captures/{cell}.json",
        "score": f"{slot}/scores/{cell}.json",
        "completion": f"invocation_completions/{slot}_{cell}.json",
    }
    return {name: (rel, root / rel) for name, rel in rels.items()}


def _load_controls(root: Path, run_id: str, slot: str, cell: str, nonce: str) -> dict[str, Any]:
    if not RUN_ID_RE.fullmatch(run_id) or slot not in SLOTS or not CELL_RE.fullmatch(cell):
        raise Invalid("invalid run, slot, or cell identity")
    if not HEX64_RE.fullmatch(nonce):
        raise Invalid("dispatch nonce must be lowercase hex-256")
    run_storage, run, _ = exact_file(root / "run_contract.json", "run contract")
    ordered_storage, ordered, _ = exact_file(root / "ordered_schedule.json", "ordered schedule")
    dispatch_storage, dispatch, _ = exact_file(root / "dispatch_schedule.json", "dispatch schedule")
    run_keys = (
        "schema_id", "candidate_id", "run_id", "run_kind", "subject_launch_authorized",
        "launch_authorized_cells", "routes", "dispatch_schedule_path",
        "dispatch_schedule_storage_sha256", "dispatch_schedule_storage_bytes",
        "candidate_freeze_manifest_path", "candidate_freeze_manifest_storage_sha256",
        "candidate_freeze_manifest_storage_bytes", "goal_loop_buster_addendum",
        "audited_candidate_bundle", "qualification_sequence", "predecessor_run_id",
    )
    if tuple(run) != run_keys:
        raise Invalid("run contract keys/order outside exact v13 closed world")
    if run.get("candidate_id") != CANDIDATE_ID or run.get("run_id") != run_id:
        raise Invalid("run contract identity mismatch")
    if run.get("schema_id") != "pw-r8-run-contract-v7":
        raise Invalid("unsupported run contract schema")
    if run.get("run_kind") not in ("ZERO_CREDIT_CANARY", "QUALIFICATION_MATRIX") or type(run.get("subject_launch_authorized")) is not bool:
        raise Invalid("run contract kind/launch authority invalid")
    if run.get("routes") != {s: {"requested_model": ROUTES[s][0], "requested_thinking": ROUTES[s][1]} for s in SLOTS}:
        raise Invalid("run contract route map changed")
    goal = run.get("goal_loop_buster_addendum")
    if goal != {
        "path": "tests/agent_packet_restrictions/successor_20260813/r8_goal_loop_buster_addendum_v1.json",
        "storage_sha256": "d3f901e724d785ba3d053a961a8559b6f5b5add7e7b660a9fbb503586ad822d0",
        "storage_bytes": 4468,
    }:
        raise Invalid("run contract goal-addendum binding missing or changed")
    if (run.get("dispatch_schedule_path"), run.get("dispatch_schedule_storage_sha256"), run.get("dispatch_schedule_storage_bytes")) != (
        "dispatch_schedule.json", sha(dispatch_storage), len(dispatch_storage)
    ):
        raise Invalid("run contract dispatch-schedule binding mismatch")
    manifest_rel = run.get("candidate_freeze_manifest_path")
    if not isinstance(manifest_rel, str) or Path(manifest_rel).is_absolute() or not manifest_rel.startswith("tests/agent_packet_restrictions/successor_20260813/"):
        raise Invalid("run contract freeze-manifest path invalid")
    freeze_storage, freeze, _ = exact_file(REPO / manifest_rel, "candidate freeze manifest")
    if (sha(freeze_storage), len(freeze_storage)) != (
        run.get("candidate_freeze_manifest_storage_sha256"), run.get("candidate_freeze_manifest_storage_bytes")
    ):
        raise Invalid("run contract freeze-manifest storage binding mismatch")
    if freeze.get("candidate_id") != CANDIDATE_ID or freeze.get("status") != "FROZEN":
        raise Invalid("run contract freeze identity/status mismatch")
    if freeze.get("audited_candidate_bundle") != run.get("audited_candidate_bundle"):
        raise Invalid("run contract audited candidate bundle differs from freeze")
    sequence, predecessor = run.get("qualification_sequence"), run.get("predecessor_run_id")
    if type(sequence) is not int or sequence not in (1, 2):
        raise Invalid("qualification sequence must be 1 or 2")
    if (sequence == 1 and predecessor is not None) or (sequence == 2 and (not isinstance(predecessor, str) or not RUN_ID_RE.fullmatch(predecessor) or predecessor == run_id)):
        raise Invalid("qualification predecessor binding invalid")
    cells = schedule()
    if tuple(ordered) != ("schema_id", "candidate_id", "run_id", "cells"):
        raise Invalid("ordered schedule keys/order outside exact closed world")
    if ordered != {"schema_id": "pw-r8-ordered-schedule-v2", "candidate_id": CANDIDATE_ID, "run_id": run_id, "cells": list(cells)}:
        raise Invalid("ordered schedule changed from frozen 97-cell order")
    if tuple(dispatch) != ("schema_id", "candidate_id", "run_id", "nonce_encoding", "entry_count", "entries"):
        raise Invalid("dispatch schedule keys/order changed")
    entries = dispatch.get("entries")
    pairs = [(s, c) for s in SLOTS for c in cells]
    if (
        dispatch.get("schema_id") != "pw-r8-dispatch-schedule-v1"
        or dispatch.get("candidate_id") != CANDIDATE_ID
        or dispatch.get("run_id") != run_id
        or dispatch.get("nonce_encoding") != "lowercase-hex-256"
        or dispatch.get("entry_count") != 291
        or not isinstance(entries, list)
        or len(entries) != 291
    ):
        raise Invalid("dispatch schedule identity/count mismatch")
    mapping: dict[tuple[str, str], str] = {}
    nonces: list[str] = []
    for entry, pair in zip(entries, pairs, strict=True):
        if not isinstance(entry, dict) or tuple(entry) != ("slot", "cell", "dispatch_nonce"):
            raise Invalid("dispatch row outside exact three-key contract")
        if (entry.get("slot"), entry.get("cell")) != pair or not HEX64_RE.fullmatch(str(entry.get("dispatch_nonce"))):
            raise Invalid("dispatch schedule row/order/nonce mismatch")
        mapping[pair] = entry["dispatch_nonce"]
        nonces.append(entry["dispatch_nonce"])
    if len(nonces) != len(set(nonces)) or mapping[(slot, cell)] != nonce:
        raise Invalid("dispatch nonce reused or differs from predeclared row")
    authorized = run.get("launch_authorized_cells")
    if not isinstance(authorized, list) or any(not isinstance(row, dict) or tuple(row) != ("slot", "cell") for row in authorized):
        raise Invalid("run contract launch-authorized cell set malformed")
    authorized_pairs = [(row["slot"], row["cell"]) for row in authorized]
    if len(authorized_pairs) != len(set(authorized_pairs)) or any(pair not in pairs for pair in authorized_pairs):
        raise Invalid("run contract launch-authorized cell set is not unique schedule subset")
    if run["run_kind"] == "ZERO_CREDIT_CANARY" and len(authorized_pairs) != 3:
        raise Invalid("zero-credit canary must authorize exactly three predeclared cells")
    if run["run_kind"] == "QUALIFICATION_MATRIX" and authorized_pairs != pairs:
        raise Invalid("qualification matrix must authorize exact 291-row schedule")
    return {
        "run": run, "run_storage": run_storage, "ordered": ordered,
        "ordered_storage": ordered_storage, "dispatch": dispatch,
        "dispatch_storage": dispatch_storage, "cells": cells,
        "ordered_index": cells.index(cell),
        "launch_authorized": run["subject_launch_authorized"] and (slot, cell) in authorized_pairs,
    }


def _completion_shallow(root: Path, run_id: str, slot: str, cell: str) -> dict[str, Any]:
    paths = _paths(root, slot, cell)
    completion_storage, completion, _ = exact_file(paths["completion"][1], f"prior completion {slot}/{cell}")
    if tuple(completion) != COMPLETION_KEYS or len(completion) != 39 or set(completion) & FORBIDDEN_COMPLETION_FIELDS:
        raise Invalid(f"prior completion {slot}/{cell} not exact completion-v3")
    exact = {
        "schema_id": "pw-r8-invocation-completion-v3", "candidate_id": CANDIDATE_ID,
        "run_id": run_id, "slot": slot, "cell": cell, "execution_root": str(root),
        "status": "FULL_CHAIN_SEALED_SAFE", "score_verdict": "PASS",
        "fresh_context": True, "first_attempt_subject_call": True, "retry_count": 0,
        "best_of": False, "replacement_result": False, "material_validation_passed": True,
        "exact_chain_reopened": True, "stop_disposition": "SAFE_STOP_AFTER_CURRENT_CELL",
    }
    for key, value in exact.items():
        if type(completion.get(key)) is not type(value) or completion.get(key) != value:
            raise Invalid(f"prior completion {slot}/{cell} not sealed PASS: {key}")
    members = (
        ("attempt", "dispatch_attempt_relative_path", "dispatch_attempt_storage_sha256", "dispatch_attempt_storage_bytes"),
        ("render", "rendered_relative_path", "render_storage_sha256", "render_storage_bytes"),
        ("receipt", "receipt_relative_path", "receipt_storage_sha256", "receipt_storage_bytes"),
        ("capture", "capture_relative_path", "capture_storage_sha256", "capture_storage_bytes"),
        ("score", "score_relative_path", "score_storage_sha256", "score_storage_bytes"),
    )
    for name, rel_key, sha_key, bytes_key in members:
        rel, path = paths[name]
        data, _ = regular(path, f"prior chain {name} {slot}/{cell}")
        if completion.get(rel_key) != rel or (completion.get(sha_key), completion.get(bytes_key)) != (sha(data), len(data)):
            raise Invalid(f"prior completion member drift: {slot}/{cell}/{name}")
    if canonical(completion) + b"\n" != completion_storage:
        raise Invalid("prior completion canonical storage drift")
    return completion


def _causal_admission(root: Path, run_id: str, slot: str, cell: str, controls: dict[str, Any], *, enforce_no_downstream: bool = True, include_current_receipt: bool = False) -> dict[str, Any]:
    index = controls["ordered_index"]
    cells = controls["cells"]
    for prior in cells[:index]:
        _completion_shallow(root, run_id, slot, prior)
    if enforce_no_downstream:
        for later in cells[index + 1:]:
            if any(path.exists() for _name, (_rel, path) in _paths(root, slot, later).items()):
                raise Invalid("downstream evidence exists before current scheduled cell")
    thread_ids: list[str] = []
    turn_ids: list[str] = []
    for other_slot in SLOTS:
        for other_cell in cells:
            if not include_current_receipt and (other_slot, other_cell) == (slot, cell):
                continue
            receipt_path = _paths(root, other_slot, other_cell)["receipt"][1]
            if not receipt_path.exists():
                continue
            _storage, value, _ = exact_file(receipt_path, f"existing receipt identity {other_slot}/{other_cell}")
            thread_id, turn_id = value.get("thread_id"), value.get("turn_id")
            if not isinstance(thread_id, str) or not thread_id or not isinstance(turn_id, str) or not turn_id:
                raise Invalid("existing receipt lacks thread/turn identity")
            thread_ids.append(thread_id)
            turn_ids.append(turn_id)
    if len(thread_ids) != len(set(thread_ids)) or len(turn_ids) != len(set(turn_ids)):
        raise Invalid("thread or turn identity reused within run")
    return {"prior_pass_count": index, "thread_ids": thread_ids, "turn_ids": turn_ids}


def _write_proposal(relative_path: str, storage: bytes) -> dict[str, Any]:
    try:
        text = storage.decode("utf-8")
    except UnicodeDecodeError as exc:
        raise Invalid("proposed storage is not UTF-8") from exc
    return {
        "relative_path": relative_path,
        "create_only": True,
        "persistence_method": "external_apply_patch",
        "storage_utf8": text,
        "storage_sha256": sha(storage),
        "storage_bytes": len(storage),
    }


def _terminal(command: str, status: str, *, writes: list[dict[str, Any]] | None = None, **extra: Any) -> dict[str, Any]:
    return {
        "schema_id": "pw-r8-clean-room-controller-status-v1",
        "candidate_id": CANDIDATE_ID,
        "command": command,
        "status": status,
        "writes": [] if writes is None else writes,
        "subject_calls": 0,
        "provider_calls": 0,
        "network_calls": 0,
        "filesystem_writes": 0,
        **extra,
    }


def _attempt(values: dict[str, Any]) -> dict[str, Any]:
    if set(values) != set(DISPATCH_ATTEMPT_KEYS):
        raise Invalid("dispatch-attempt construction missing/extra key")
    return {key: values[key] for key in DISPATCH_ATTEMPT_KEYS}


def _expected_attempt(root: Path, run_id: str, slot: str, cell: str, nonce: str, controls: dict[str, Any], render: bytes) -> dict[str, Any]:
    model, effort = ROUTES[slot]
    payload = render[:-1]
    rel = _paths(root, slot, cell)["render"][0]
    return _attempt({
        "schema_id": "pw-r8-dispatch-attempt-v1", "candidate_id": CANDIDATE_ID,
        "run_id": run_id, "slot": slot, "cell": cell, "execution_root": str(root),
        "ordered_index": controls["ordered_index"], "attempt_ordinal": 1,
        "requested_model": model, "requested_thinking": effort,
        "dispatch_nonce": nonce,
        "dispatch_schedule_sha256": sha(controls["dispatch_storage"]),
        "dispatch_schedule_bytes": len(controls["dispatch_storage"]),
        "rendered_relative_path": rel, "render_storage_sha256": sha(render),
        "render_storage_bytes": len(render), "provider_visible_payload_sha256": sha(payload),
        "provider_visible_payload_bytes": len(payload), "fresh_task_required": True,
        "first_attempt_subject_call": True, "subject_call_count_ceiling": 1,
        "retry_count": 0, "best_of": False, "replacement_result": False,
        "status": "FIRST_ATTEMPT_FUSE_PERSISTED_BEFORE_SUBJECT_CALL",
    })


def _validate_attempt(attempt: dict[str, Any], storage: bytes, expected: dict[str, Any]) -> None:
    if tuple(attempt) != DISPATCH_ATTEMPT_KEYS or len(attempt) != 25:
        raise Invalid("dispatch attempt is not exact 25-key contract")
    if canonical(attempt) + b"\n" != storage or attempt != expected:
        raise Invalid("dispatch attempt differs from exact predeclared first attempt")


def _armed_fuse_launch_gate(attempt: dict[str, Any], *, launch_authorized: bool, continuous_prestart_transaction: bool) -> dict[str, Any]:
    if tuple(attempt) != DISPATCH_ATTEMPT_KEYS or len(attempt) != 25:
        raise Invalid("armed launch fuse is not exact dispatch-attempt contract")
    exact = {
        "attempt_ordinal": 1, "fresh_task_required": True,
        "first_attempt_subject_call": True, "subject_call_count_ceiling": 1,
        "retry_count": 0, "best_of": False, "replacement_result": False,
        "status": "FIRST_ATTEMPT_FUSE_PERSISTED_BEFORE_SUBJECT_CALL",
    }
    if any(type(attempt.get(key)) is not type(value) or attempt.get(key) != value for key, value in exact.items()):
        raise Invalid("armed launch fuse first-attempt invariants changed")
    if launch_authorized is not True or continuous_prestart_transaction is not True:
        raise Invalid("armed launch fuse may run only in authorized continuous prestart transaction")
    return {"status": "PASS_ARMED_FUSE_ADMITTED_ONCE", "subject_call_count_ceiling": 1}


def prepare_cell(run_id: str, root_value: str, slot: str, cell: str, nonce: str) -> dict[str, Any]:
    root = execution_root(root_value)
    controls = _load_controls(root, run_id, slot, cell, nonce)
    paths = _paths(root, slot, cell)
    if any(paths[name][1].exists() for name in ("receipt", "capture", "score", "completion")):
        raise Invalid("target already has post-start evidence; prepare cannot repair or overwrite")
    module = semantic_module()
    first, _ = module.render(cell, slot, root)
    second, _ = module.render(cell, slot, root)
    if first != second or not first.endswith(b"\n") or first.endswith(b"\n\n") or b"\r" in first:
        raise Invalid("independent frozen render is unstable or not exactly one-LF storage")
    expected_attempt = _expected_attempt(root, run_id, slot, cell, nonce, controls, first)
    attempt_storage = canonical(expected_attempt) + b"\n"
    writes: list[dict[str, Any]] = []
    render_path = paths["render"][1]
    if render_path.exists():
        observed, _ = regular(render_path, "existing rendered storage")
        if observed != first:
            raise Invalid("existing rendered storage differs; overwrite/repair forbidden")
    else:
        writes.append(_write_proposal(paths["render"][0], first))
    attempt_path = paths["attempt"][1]
    if attempt_path.exists():
        observed, value, _ = exact_file(attempt_path, "existing dispatch attempt")
        _validate_attempt(value, observed, expected_attempt)
    else:
        writes.append(_write_proposal(paths["attempt"][0], attempt_storage))
    status = "PRESTART_ALREADY_DURABLE" if not writes else "APPLY_PATCH_CREATE_ONLY_THEN_VALIDATE_PRESTART"
    return _terminal("prepare-cell", status, writes=writes, run_id=run_id, slot=slot, cell=cell,
                     dispatch_nonce=nonce, persistent_state_changed=False)


def validate_prestart(run_id: str, root_value: str, slot: str, cell: str, nonce: str) -> dict[str, Any]:
    root = execution_root(root_value)
    controls = _load_controls(root, run_id, slot, cell, nonce)
    paths = _paths(root, slot, cell)
    if any(paths[name][1].exists() for name in ("receipt", "capture", "score", "completion")):
        raise Invalid("prestart target already has post-start evidence")
    render, info = regular(paths["render"][1], "persisted rendered storage")
    expected, _ = semantic_module().render(cell, slot, root)
    if render != expected or not render.endswith(b"\n") or render.endswith(b"\n\n"):
        raise Invalid("persisted render is missing, drifted, or not exactly one terminal LF")
    attempt_storage, attempt, _ = exact_file(paths["attempt"][1], "dispatch attempt")
    _validate_attempt(attempt, attempt_storage, _expected_attempt(root, run_id, slot, cell, nonce, controls, render))
    causal = _causal_admission(root, run_id, slot, cell, controls)
    observation = _render_observation(root, run_id, slot, cell, render, info)
    return _terminal("validate-prestart", "PASS_PRESTART_ONE_CALL_MAY_BEGIN_ONLY_IN_CONTINUOUS_TRANSACTION",
                     run_id=run_id, slot=slot, cell=cell, dispatch_nonce=nonce,
                     render_observation=observation, prior_pass_count=causal["prior_pass_count"],
                     persistent_state_changed=False)


def _render_observation(root: Path, run_id: str, slot: str, cell: str, render: bytes, info: os.stat_result) -> dict[str, Any]:
    payload = render[:-1]
    values = {
        "schema_id": "pw-r8-pre-dispatch-render-observation-v1",
        "candidate_id": CANDIDATE_ID, "run_id": run_id, "slot": slot, "cell": cell,
        "execution_root": str(root), "rendered_relative_path": _paths(root, slot, cell)["render"][0],
        "storage_sha256": sha(render), "storage_bytes": len(render),
        "provider_visible_payload_sha256": sha(payload), "provider_visible_payload_bytes": len(payload),
        "lstat_dev": info.st_dev, "lstat_ino": info.st_ino, "lstat_size": info.st_size,
        "lstat_mtime_ns": info.st_mtime_ns, "expected_storage_sha256": sha(render),
        "expected_storage_bytes": len(render), "exact_one_terminal_lf": True,
        "regular_nonlink": True, "stable_across_independent_render": True,
        "observed_equals_expected": True, "observation_phase": "BEFORE_SUBJECT_PROCESS_START",
    }
    return {key: values[key] for key in RENDER_OBSERVATION_KEYS}


def _admission(root: Path, run_id: str, slot: str, cell: str, nonce: str, controls: dict[str, Any]) -> dict[str, Any]:
    causal = _causal_admission(root, run_id, slot, cell, controls)
    return {
        "schema_id": "pw-r8-cell-admission-v5", "candidate_id": CANDIDATE_ID,
        "run_id": run_id, "candidate_freeze_manifest": {
            "path": controls["run"].get("candidate_freeze_manifest_path"),
            "storage_sha256": controls["run"].get("candidate_freeze_manifest_storage_sha256"),
            "storage_bytes": controls["run"].get("candidate_freeze_manifest_storage_bytes"),
            "audited_candidate_bundle": controls["run"].get("audited_candidate_bundle"),
        },
        "dispatch_schedule": {"path": "dispatch_schedule.json", "storage_sha256": sha(controls["dispatch_storage"]), "storage_bytes": len(controls["dispatch_storage"])},
        "dispatch_nonce": nonce, "slot": slot, "cell": cell,
        "ordered_index": controls["ordered_index"], "status": "ADMIT_ONE_FRESH_FIRST_ATTEMPT",
        "prior_pass_count": causal["prior_pass_count"], "preserved_no_start_controller_invalid_count": 0,
        "other_slot_path_terminals_do_not_block": True, "root_terminal_phase_started": False,
        "retry": False, "best_of": False, "replacement": False,
    }


def run_subject(run_id: str, root_value: str, slot: str, cell: str, nonce: str) -> dict[str, Any]:
    root = execution_root(root_value)
    validate_prestart(run_id, str(root), slot, cell, nonce)
    paths = _paths(root, slot, cell)
    if paths["receipt"][1].exists():
        raise Invalid("receipt already exists; relaunch forbidden")
    controls = _load_controls(root, run_id, slot, cell, nonce)
    if controls["launch_authorized"] is not True:
        raise Invalid("exact run contract does not authorize this scheduled subject cell")
    _attempt_storage, armed_attempt, _ = exact_file(paths["attempt"][1], "armed dispatch attempt")
    _armed_fuse_launch_gate(armed_attempt, launch_authorized=controls["launch_authorized"],
                            continuous_prestart_transaction=True)
    render_storage, _ = regular(paths["render"][1], "persisted render")
    driver = _module(V9_DRIVER, "pw_r8_candidate_v9_subject_primitive_for_v13")
    driver.CANDIDATE_ID = CANDIDATE_ID
    driver.ROUTES = dict(ROUTES)
    driver.render = lambda _slot, _cell, _root: (
        render_storage[:-1].decode("utf-8"),
        {
            "render_storage_sha256": sha(render_storage), "render_storage_bytes": len(render_storage),
            "provider_visible_payload_sha256": sha(render_storage[:-1]), "provider_visible_payload_bytes": len(render_storage) - 1,
            "semantic_packet_sha256": sha(render_storage[:-1]), "semantic_packet_bytes": len(render_storage) - 1,
        },
    )
    driver.verify_admission = lambda *_args, **_kwargs: _admission(root, run_id, slot, cell, nonce, controls)
    ns = argparse.Namespace(run_id=run_id, execution_root=str(root), slot=slot, cell=cell,
                            timeout_seconds=600.0, _phase="prestart_validated", _subject_call_started=False,
                            _thread_id=None, _turn_id=None, _identities={}, _admission=None)
    deferred: list[str] = []
    previous: dict[int, Any] = {}
    def handler(signum: int, _frame: Any) -> None:
        deferred.append(signal.Signals(signum).name)
    for sig in (signal.SIGINT, signal.SIGTERM):
        previous[sig] = signal.getsignal(sig)
        signal.signal(sig, handler)
    try:
        receipt = driver.execute(ns)
    finally:
        for sig, old in previous.items():
            signal.signal(sig, old)
    storage = canonical(receipt) + b"\n"
    _validate_receipt(receipt, storage, root, slot, cell, run_id, nonce, controls, render_storage, validate_rollout=True)
    return {
        **_terminal("run-subject", "SUBJECT_COMPLETED_APPLY_RECEIPT_CREATE_ONLY", writes=[_write_proposal(paths["receipt"][0], storage)],
                    run_id=run_id, slot=slot, cell=cell, dispatch_nonce=nonce,
                    deferred_stop_signal_names=deferred, persistent_state_changed=False),
        "subject_calls": 1, "provider_calls": 1, "network_calls": 1,
    }


def _validate_receipt(receipt: dict[str, Any], storage: bytes, root: Path, slot: str, cell: str,
                      run_id: str, nonce: str, controls: dict[str, Any], render: bytes,
                      *, validate_rollout: bool) -> None:
    if tuple(receipt) != RECEIPT_KEYS or len(receipt) != 55 or canonical(receipt) + b"\n" != storage:
        raise Invalid("receipt-v4 exact closed world/canonical storage mismatch")
    model, effort = ROUTES[slot]
    expected = {
        "schema_id": "pw-r8-direct-appserver-subject-receipt-v4", "candidate_id": CANDIDATE_ID,
        "run_id": run_id, "slot": slot, "cell": cell, "execution_root": str(root),
        "requested_model": model, "requested_thinking": effort, "status": "completed",
        "subject_call_started": True, "fresh_context": True,
        "first_attempt_subject_call": True, "retry_count": 0, "best_of": False,
        "replacement_result": False, "fresh_task_identity_basis": "thread_id",
        "render_storage_sha256": sha(render), "render_storage_bytes": len(render),
        "provider_visible_payload_sha256": sha(render[:-1]), "provider_visible_payload_bytes": len(render) - 1,
        "semantic_packet_sha256": sha(render[:-1]), "semantic_packet_bytes": len(render) - 1,
        "dispatch_nonce": nonce, "model_provider": "openai", "turn_context_model": model,
        "turn_context_effort": effort, "provider_effective_model": None,
        "provider_effective_thinking": None, "host_id": "remote-ssh-discovered:pm-dev",
    }
    for key, value in expected.items():
        if type(receipt.get(key)) is not type(value) or receipt.get(key) != value:
            raise Invalid(f"receipt-v4 field mismatch: {key}")
    if not isinstance(receipt.get("thread_id"), str) or not receipt["thread_id"] or not isinstance(receipt.get("turn_id"), str) or not receipt["turn_id"]:
        raise Invalid("receipt-v4 thread/turn identity absent")
    causal = _causal_admission(root, run_id, slot, cell, controls, enforce_no_downstream=False)
    if receipt["thread_id"] in causal["thread_ids"] or receipt["turn_id"] in causal["turn_ids"]:
        raise Invalid("receipt-v4 reuses a prior thread or turn identity")
    schedule_binding = {"path": "dispatch_schedule.json", "storage_sha256": sha(controls["dispatch_storage"]), "storage_bytes": len(controls["dispatch_storage"])}
    if receipt.get("dispatch_schedule") != schedule_binding:
        raise Invalid("receipt-v4 dispatch-schedule binding mismatch")
    binding = {
        "schema_id": "pw-r8-dispatch-binding-v1", "candidate_id": CANDIDATE_ID,
        "run_id": run_id, "slot": slot, "cell": cell, "dispatch_nonce": nonce,
        "semantic_packet_sha256": sha(render[:-1]), "semantic_packet_bytes": len(render) - 1,
        "dispatch_schedule_sha256": schedule_binding["storage_sha256"],
        "dispatch_schedule_bytes": schedule_binding["storage_bytes"],
    }
    admission = receipt.get("admission")
    admission_keys = (
        "schema_id", "candidate_id", "run_id", "candidate_freeze_manifest",
        "dispatch_schedule", "dispatch_nonce", "slot", "cell", "ordered_index",
        "status", "prior_pass_count", "preserved_no_start_controller_invalid_count",
        "other_slot_path_terminals_do_not_block", "root_terminal_phase_started",
        "retry", "best_of", "replacement",
    )
    if receipt.get("dispatch_binding") != binding or not isinstance(admission, dict) or tuple(admission) != admission_keys or admission != _admission(root, run_id, slot, cell, nonce, controls):
        raise Invalid("receipt-v4 dispatch/admission binding mismatch")
    messages = receipt.get("assistant_final_messages")
    prohibited = receipt.get("prohibited_activity_items")
    if not isinstance(messages, list) or not isinstance(prohibited, list):
        raise Invalid("receipt-v4 raw evidence arrays invalid")
    if (receipt.get("assistant_final_messages_sha256"), receipt.get("assistant_final_messages_bytes")) != (sha(canonical(messages)), len(canonical(messages))):
        raise Invalid("receipt-v4 final-message storage binding mismatch")
    if (receipt.get("prohibited_activity_items_sha256"), receipt.get("prohibited_activity_items_bytes")) != (sha(canonical(prohibited)), len(canonical(prohibited))):
        raise Invalid("receipt-v4 prohibited-item storage binding mismatch")
    text = receipt.get("single_text_output_utf8")
    text_bytes = None if text is None else text.encode("utf-8") if isinstance(text, str) else None
    if text is not None and text_bytes is None:
        raise Invalid("receipt-v4 single text type invalid")
    if (receipt.get("single_text_output_sha256"), receipt.get("single_text_output_bytes")) != (
        None if text_bytes is None else sha(text_bytes), None if text_bytes is None else len(text_bytes)
    ):
        raise Invalid("receipt-v4 single text binding mismatch")
    types = receipt.get("prohibited_activity_item_types")
    observations = receipt.get("conformance_observations")
    if not isinstance(types, list) or any(not isinstance(x, str) or not x for x in types):
        raise Invalid("receipt-v4 prohibited activity type list invalid")
    if not isinstance(observations, list) or any(not isinstance(x, str) or not x for x in observations):
        raise Invalid("receipt-v4 conformance observations invalid")
    if receipt.get("text_normalization_receipt") != _expected_normalization(messages, text, types, observations):
        raise Invalid("receipt-v4 normalization derivation mismatch")
    timing = (receipt.get("started_at_epoch_seconds"), receipt.get("completed_at_epoch_seconds"), receipt.get("duration_ms"))
    if any(isinstance(x, bool) or not isinstance(x, (int, float)) for x in timing) or timing[1] < timing[0] or timing[2] < 0:
        raise Invalid("receipt-v4 timing fields invalid")
    wrapper = _dispatch_wrapper(render[:-1], binding)
    if (receipt.get("dispatch_wrapper_sha256"), receipt.get("dispatch_wrapper_bytes")) != (sha(wrapper), len(wrapper)):
        raise Invalid("receipt-v4 exact wrapper hash/bytes mismatch")
    if validate_rollout:
        _validate_rollout(receipt, render[:-1], binding, wrapper)


def _dispatch_wrapper(semantic: bytes, binding: dict[str, Any]) -> bytes:
    try:
        prompt = semantic.decode("utf-8")
    except UnicodeDecodeError as exc:
        raise Invalid("semantic provider payload is not UTF-8") from exc
    value = (
        "<codex_delegation>\n"
        f"  <source_thread_id>{WRAPPER_SOURCE_THREAD_ID}</source_thread_id>\n"
        f"  <dispatch_binding>{canonical(binding).decode('utf-8')}</dispatch_binding>\n"
        "  <dispatch_binding_semantics>Opaque transport identity only; ignore it when answering the semantic input.</dispatch_binding_semantics>\n"
        f"  <input>{prompt}</input>\n"
        "</codex_delegation>"
    )
    return value.encode("utf-8")


def _expected_normalization(finals: list[Any], single_text: str | None, prohibited_types: list[str], observations: list[str]) -> dict[str, Any]:
    count = len(finals)
    if count == 1:
        scoring_text, status, normalized_count, reasons = single_text, "NOT_APPLIED_SINGLE_FINAL", 0, []
    else:
        reason_set: set[str] = set()
        if prohibited_types:
            reason_set.add("prohibited_activity_present")
        if observations != ["assistant_final_message_count_not_one"]:
            reason_set.add("non_multiplicity_conformance_observation")
        texts: list[str] = []
        for final in finals:
            content = final.get("content") if isinstance(final, dict) else None
            if not isinstance(content, list) or len(content) != 1 or not isinstance(content[0], dict) or content[0].get("type") != "output_text" or not isinstance(content[0].get("text"), str):
                reason_set.add("final_content_not_single_output_text")
            else:
                texts.append(content[0]["text"])
        if len(texts) == count and len({x.encode("utf-8") for x in texts}) != 1:
            reason_set.add("final_text_bytes_not_identical")
        reasons = sorted(reason_set)
        if count >= 2 and not reasons:
            scoring_text, status, normalized_count = texts[0], "APPLIED_IDENTICAL_DUPLICATE_FINALS", count
        else:
            scoring_text, status, normalized_count = None, "REJECTED_MULTIPLE_FINALS", 0
    scoring_bytes = None if scoring_text is None else scoring_text.encode("utf-8")
    return {
        "schema_id": "pw-r8-idempotent-final-text-normalization-v1", "status": status,
        "assistant_final_message_count": count, "normalized_duplicate_count": normalized_count,
        "scoring_text_output_utf8": scoring_text,
        "scoring_text_output_sha256": None if scoring_bytes is None else sha(scoring_bytes),
        "scoring_text_output_bytes": None if scoring_bytes is None else len(scoring_bytes),
        "rejection_reasons": reasons,
    }


def _validate_rollout(receipt: dict[str, Any], semantic: bytes, binding: dict[str, Any], wrapper: bytes) -> None:
    raw_path = receipt.get("rollout_path")
    if not isinstance(raw_path, str) or not raw_path:
        raise Invalid("receipt rollout path absent")
    path = Path(raw_path)
    session_root = Path("/home/sittingmongoose/.codex/sessions").resolve()
    resolved = path.resolve(strict=True)
    if resolved != path or not resolved.is_relative_to(session_root):
        raise Invalid("rollout outside exact session custody root")
    storage, _ = regular(path, "primary rollout")
    if (receipt.get("rollout_storage_sha256"), receipt.get("rollout_storage_bytes")) != (sha(storage), len(storage)):
        raise Invalid("rollout hash/byte binding mismatch")
    rows: list[dict[str, Any]] = []
    for line in storage.splitlines():
        value = strict_object(line, "rollout row", storage=False)
        rows.append(value)
    thread_id, turn_id = receipt["thread_id"], receipt["turn_id"]
    metas = [r.get("payload") for r in rows if r.get("type") == "session_meta"]
    turns = [r.get("payload") for r in rows if r.get("type") == "turn_context" and r.get("payload", {}).get("turn_id") == turn_id]
    starts = [r.get("payload") for r in rows if r.get("type") == "event_msg" and r.get("payload", {}).get("type") == "task_started" and r.get("payload", {}).get("turn_id") == turn_id]
    completes = [r.get("payload") for r in rows if r.get("type") == "event_msg" and r.get("payload", {}).get("type") == "task_complete" and r.get("payload", {}).get("turn_id") == turn_id]
    if not (len(metas) == len(turns) == len(starts) == len(completes) == 1):
        raise Invalid("rollout is not one exact session/turn/start/completion")
    if (metas[0].get("id"), metas[0].get("session_id")) != (thread_id, thread_id) or not path.name.endswith(f"-{thread_id}.jsonl"):
        raise Invalid("rollout thread identity mismatch")
    model, effort = ROUTES[receipt["slot"]]
    turn = turns[0]
    settings = turn.get("collaboration_mode", {}).get("settings", {}) if isinstance(turn.get("collaboration_mode"), dict) else {}
    if metas[0].get("model_provider") != "openai" or metas[0].get("cwd") != str(REPO) or metas[0].get("thread_source") != "subagent":
        raise Invalid("rollout session provider/context mismatch")
    if turn.get("cwd") != str(REPO) or turn.get("model") != model or turn.get("effort") != effort or settings.get("model") != model or settings.get("reasoning_effort") != effort:
        raise Invalid("rollout exact requested route mismatch")
    users = [r.get("payload") for r in rows if r.get("type") == "response_item" and r.get("payload", {}).get("type") == "message" and r.get("payload", {}).get("role") == "user" and isinstance(r.get("payload", {}).get("content"), list)]
    expected_content = [{"type": "input_text", "text": wrapper.decode("utf-8")}]
    matching = [u for u in users if u.get("content") == expected_content]
    if len(matching) != 1 or matching[0].get("internal_chat_message_metadata_passthrough", {}).get("turn_id") != turn_id:
        raise Invalid("rollout lacks exactly one exact wrapper-bound user turn")
    finals = [r["payload"] for r in rows if r.get("type") == "response_item" and r.get("payload", {}).get("type") == "message" and r.get("payload", {}).get("role") == "assistant" and r.get("payload", {}).get("phase") == "final_answer"]
    if any(x.get("internal_chat_message_metadata_passthrough", {}).get("turn_id") != turn_id for x in finals):
        raise Invalid("rollout assistant final turn mismatch")
    prohibited: list[dict[str, Any]] = []
    prohibited_types: list[str] = []
    for row in rows:
        payload = row.get("payload")
        if row.get("type") != "response_item":
            continue
        item = payload if isinstance(payload, dict) else {"type": "<missing-or-invalid-response-item-type>", "raw_payload": payload}
        item_type = item.get("type") if isinstance(item.get("type"), str) and item.get("type") else "<missing-or-invalid-response-item-type>"
        if item_type not in SAFE_NON_TOOL_RESPONSE_ITEM_TYPES:
            prohibited.append(item)
            prohibited_types.append(item_type)
    final_bytes, prohibited_bytes = canonical(finals), canonical(prohibited)
    single_text: str | None = None
    if len(finals) == 1:
        content = finals[0].get("content")
        if isinstance(content, list) and len(content) == 1 and isinstance(content[0], dict) and isinstance(content[0].get("text"), str):
            single_text = content[0]["text"]
    observations: list[str] = []
    if len(finals) != 1:
        observations.append("assistant_final_message_count_not_one")
    elif not isinstance(finals[0].get("content"), list):
        observations.append("assistant_final_content_not_array")
    elif len(finals[0]["content"]) != 1:
        observations.append("assistant_final_content_item_count_not_one")
    elif not isinstance(finals[0]["content"][0], dict) or not isinstance(finals[0]["content"][0].get("text"), str):
        observations.append("assistant_final_content_item_not_text")
    text_bytes = None if single_text is None else single_text.encode("utf-8")
    derived = {
        "assistant_final_messages": finals, "assistant_final_messages_sha256": sha(final_bytes),
        "assistant_final_messages_bytes": len(final_bytes), "single_text_output_utf8": single_text,
        "single_text_output_sha256": None if text_bytes is None else sha(text_bytes),
        "single_text_output_bytes": None if text_bytes is None else len(text_bytes),
        "text_normalization_receipt": _expected_normalization(finals, single_text, prohibited_types, observations),
        "prohibited_activity_items": prohibited, "prohibited_activity_items_sha256": sha(prohibited_bytes),
        "prohibited_activity_items_bytes": len(prohibited_bytes),
        "prohibited_activity_item_types": prohibited_types, "conformance_observations": observations,
    }
    if any(receipt.get(key) != value for key, value in derived.items()):
        raise Invalid("receipt raw/normalized evidence differs from exact rollout derivation")
    start, complete = starts[0], completes[0]
    timing = (complete.get("started_at"), complete.get("completed_at"), complete.get("duration_ms"))
    if start.get("started_at") != complete.get("started_at") or (receipt.get("started_at_epoch_seconds"), receipt.get("completed_at_epoch_seconds"), receipt.get("duration_ms")) != timing:
        raise Invalid("receipt timing differs from rollout task lifecycle")


def _capture_from_receipt(receipt: dict[str, Any], storage: bytes) -> dict[str, Any]:
    values = {
        "schema_id": "pw-r8-subject-capture-envelope-v3", "candidate_id": receipt["candidate_id"],
        "run_id": receipt["run_id"], "slot": receipt["slot"], "cell": receipt["cell"],
        "subject_call_started": True, "subject_call_completed": True,
        "thread_id": receipt["thread_id"], "turn_id": receipt["turn_id"],
        "assistant_final_messages": receipt["assistant_final_messages"],
        "assistant_final_messages_sha256": receipt["assistant_final_messages_sha256"],
        "assistant_final_messages_bytes": receipt["assistant_final_messages_bytes"],
        "single_text_output_utf8": receipt["single_text_output_utf8"],
        "single_text_output_sha256": receipt["single_text_output_sha256"],
        "single_text_output_bytes": receipt["single_text_output_bytes"],
        "text_normalization_receipt": receipt["text_normalization_receipt"],
        "prohibited_activity_item_types": receipt["prohibited_activity_item_types"],
        "conformance_observations": receipt["conformance_observations"],
        "driver_receipt_storage_sha256": sha(storage), "driver_receipt_storage_bytes": len(storage),
    }
    return {key: values[key] for key in CAPTURE_KEYS}


def _receipt_for_cell(root: Path, run_id: str, slot: str, cell: str, nonce: str) -> tuple[bytes, dict[str, Any], dict[str, Any], bytes]:
    controls = _load_controls(root, run_id, slot, cell, nonce)
    paths = _paths(root, slot, cell)
    render, _ = regular(paths["render"][1], "persisted render")
    receipt_storage, receipt, _ = exact_file(paths["receipt"][1], "receipt-v4")
    _validate_receipt(receipt, receipt_storage, root, slot, cell, run_id, nonce, controls, render, validate_rollout=True)
    return receipt_storage, receipt, controls, render


def emit_capture(run_id: str, root_value: str, slot: str, cell: str, nonce: str) -> dict[str, Any]:
    root = execution_root(root_value)
    receipt_storage, receipt, _controls, _render = _receipt_for_cell(root, run_id, slot, cell, nonce)
    paths = _paths(root, slot, cell)
    expected = _capture_from_receipt(receipt, receipt_storage)
    storage = canonical(expected) + b"\n"
    writes: list[dict[str, Any]] = []
    if paths["capture"][1].exists():
        observed, value, _ = exact_file(paths["capture"][1], "existing capture-v3")
        if observed != storage or value != expected:
            raise Invalid("existing capture-v3 mismatch; repair forbidden")
    else:
        writes.append(_write_proposal(paths["capture"][0], storage))
    return _terminal("emit-capture", "CAPTURE_ALREADY_DURABLE" if not writes else "APPLY_CAPTURE_CREATE_ONLY",
                     writes=writes, run_id=run_id, slot=slot, cell=cell,
                     persistent_state_changed=False)


def _capture_for_cell(root: Path, run_id: str, slot: str, cell: str, nonce: str) -> tuple[bytes, dict[str, Any], dict[str, Any], bytes, bytes]:
    receipt_storage, receipt, controls, render = _receipt_for_cell(root, run_id, slot, cell, nonce)
    path = _paths(root, slot, cell)["capture"][1]
    capture_storage, capture, _ = exact_file(path, "capture-v3")
    expected = _capture_from_receipt(receipt, receipt_storage)
    if tuple(capture) != CAPTURE_KEYS or capture != expected or capture_storage != canonical(expected) + b"\n":
        raise Invalid("capture-v3 differs from deterministic receipt projection")
    return capture_storage, capture, controls, render, receipt_storage


def _score_from_capture(candidate_id: str, cell: str, slot: str, root: Path, capture: dict[str, Any]) -> dict[str, Any]:
    module = semantic_module(candidate_id)
    text = capture.get("text_normalization_receipt", {}).get("scoring_text_output_utf8")
    raw = None if text is None else text.encode("utf-8")
    want = module.expected(cell, slot, root)
    kind, lane, item_id = module.parse_cell(cell)
    options = module.decision_item(lane, item_id or "")[0]["options"] if kind in ("decision", "audit") else None
    verdict, actual, violations = module.assess_response(
        raw, want, kind, options, capture["prohibited_activity_item_types"],
        module.scoring_observations(capture),
    )
    exact = verdict == "PASS"
    diffs = [] if exact or actual is None else module.stable_structural_diffs(want, actual)
    capture_storage = canonical(capture) + b"\n"
    result = {
        "schema_id": "pw-r8-stage-score-v2", "candidate_id": candidate_id,
        "slot": slot, "cell": cell, "verdict": verdict, "exact": exact,
        "subject_failure_permanent": not exact, "conformance_violations": violations,
        "actual_payload_sha256": sha(raw) if raw is not None else None,
        "actual_payload_bytes": len(raw) if raw is not None else None,
        "expected_payload_sha256": sha(canonical(want)), "expected_payload_bytes": len(canonical(want)),
        "capture_envelope_storage_sha256": sha(capture_storage),
        "capture_envelope_storage_bytes": len(capture_storage),
        "driver_receipt_storage_sha256": capture["driver_receipt_storage_sha256"],
        "driver_receipt_storage_bytes": capture["driver_receipt_storage_bytes"],
        "assistant_final_message_count": len(capture["assistant_final_messages"]),
        "text_normalization_status": capture["text_normalization_receipt"]["status"],
        "text_normalization_receipt_sha256": sha(canonical(capture["text_normalization_receipt"])),
        "thread_id": capture["thread_id"], "turn_id": capture["turn_id"],
        "structural_diffs": diffs, "structural_diff_order": "stable_path_kind_canonical_row",
    }
    if result.get("verdict") not in ("PASS", "FAIL"):
        raise Invalid("unchanged frozen scorer returned INVALID")
    return result


def score_cell(run_id: str, root_value: str, slot: str, cell: str, nonce: str) -> dict[str, Any]:
    root = execution_root(root_value)
    _capture_storage, capture, _controls, _render, _receipt_storage = _capture_for_cell(root, run_id, slot, cell, nonce)
    expected = _score_from_capture(CANDIDATE_ID, cell, slot, root, capture)
    storage = canonical(expected) + b"\n"
    paths = _paths(root, slot, cell)
    writes: list[dict[str, Any]] = []
    if paths["score"][1].exists():
        observed, value, _ = exact_file(paths["score"][1], "existing score")
        if observed != storage or value != expected:
            raise Invalid("existing score differs from unchanged scorer; repair forbidden")
    else:
        writes.append(_write_proposal(paths["score"][0], storage))
    return _terminal("score-cell", "SCORE_ALREADY_DURABLE" if not writes else "APPLY_SCORE_CREATE_ONLY",
                     writes=writes, run_id=run_id, slot=slot, cell=cell,
                     score_verdict=expected["verdict"], persistent_state_changed=False)


def _score_for_cell(root: Path, run_id: str, slot: str, cell: str, nonce: str) -> tuple[bytes, dict[str, Any], bytes, dict[str, Any], dict[str, Any], bytes, bytes]:
    capture_storage, capture, controls, render, receipt_storage = _capture_for_cell(root, run_id, slot, cell, nonce)
    score_storage, score, _ = exact_file(_paths(root, slot, cell)["score"][1], "score")
    expected = _score_from_capture(CANDIDATE_ID, cell, slot, root, capture)
    if score != expected or score_storage != canonical(expected) + b"\n":
        raise Invalid("score differs from deterministic frozen scorer recomputation")
    return score_storage, score, capture_storage, capture, controls, render, receipt_storage


def _completion_from_members(root: Path, run_id: str, slot: str, cell: str, nonce: str,
                             attempt_storage: bytes, render: bytes,
                             receipt_storage: bytes, receipt: dict[str, Any], capture_storage: bytes,
                             score_storage: bytes, score: dict[str, Any]) -> dict[str, Any]:
    """Pure completion-v3 projection shared by durable and zero-call paths."""
    paths = _paths(root, slot, cell)
    values = {
        "schema_id": "pw-r8-invocation-completion-v3", "candidate_id": CANDIDATE_ID,
        "run_id": run_id, "slot": slot, "cell": cell, "execution_root": str(root),
        "status": "FULL_CHAIN_SEALED_SAFE", "dispatch_attempt_relative_path": paths["attempt"][0],
        "dispatch_attempt_storage_sha256": sha(attempt_storage), "dispatch_attempt_storage_bytes": len(attempt_storage),
        "rendered_relative_path": paths["render"][0],
        "render_storage_sha256": sha(render), "render_storage_bytes": len(render),
        "provider_visible_payload_sha256": sha(render[:-1]),
        "provider_visible_payload_bytes": len(render) - 1,
        "receipt_relative_path": paths["receipt"][0], "receipt_storage_sha256": sha(receipt_storage),
        "receipt_storage_bytes": len(receipt_storage), "capture_relative_path": paths["capture"][0],
        "capture_storage_sha256": sha(capture_storage), "capture_storage_bytes": len(capture_storage),
        "score_relative_path": paths["score"][0], "score_storage_sha256": sha(score_storage),
        "score_storage_bytes": len(score_storage), "score_verdict": score["verdict"], "dispatch_nonce": nonce,
        "thread_id": receipt["thread_id"], "turn_id": receipt["turn_id"],
        "rollout_path": receipt["rollout_path"],
        "rollout_storage_sha256": receipt["rollout_storage_sha256"],
        "rollout_storage_bytes": receipt["rollout_storage_bytes"],
        "fresh_context": receipt["fresh_context"], "first_attempt_subject_call": receipt["first_attempt_subject_call"],
        "retry_count": receipt["retry_count"], "best_of": receipt["best_of"],
        "replacement_result": receipt["replacement_result"], "material_validation_passed": True,
        "exact_chain_reopened": True, "stop_disposition": "SAFE_STOP_AFTER_CURRENT_CELL",
    }
    completion = {key: values[key] for key in COMPLETION_KEYS}
    if tuple(completion) != COMPLETION_KEYS or len(completion) != 39 or set(completion) & FORBIDDEN_COMPLETION_FIELDS:
        raise Invalid("completion-v3 exact 39-key contract violated")
    return completion


def _completion(root: Path, run_id: str, slot: str, cell: str, nonce: str,
                attempt_storage: bytes, render: bytes,
                receipt_storage: bytes, receipt: dict[str, Any], capture_storage: bytes,
                score_storage: bytes, score: dict[str, Any]) -> dict[str, Any]:
    return _completion_from_members(root, run_id, slot, cell, nonce, attempt_storage, render,
                                    receipt_storage, receipt, capture_storage, score_storage, score)


def emit_completion(run_id: str, root_value: str, slot: str, cell: str, nonce: str) -> dict[str, Any]:
    root = execution_root(root_value)
    score_storage, score, capture_storage, _capture, controls, render, receipt_storage = _score_for_cell(root, run_id, slot, cell, nonce)
    paths = _paths(root, slot, cell)
    attempt_storage, attempt, _ = exact_file(paths["attempt"][1], "dispatch attempt")
    _validate_attempt(attempt, attempt_storage, _expected_attempt(root, run_id, slot, cell, nonce, controls, render))
    receipt_storage_2, receipt, _ = exact_file(paths["receipt"][1], "receipt-v4")
    if receipt_storage_2 != receipt_storage:
        raise Invalid("receipt changed during completion construction")
    render_2, _ = regular(paths["render"][1], "rendered storage completion reopen")
    if render_2 != render:
        raise Invalid("render changed before completion construction")
    expected = _completion(root, run_id, slot, cell, nonce, attempt_storage, render,
                           receipt_storage, receipt, capture_storage, score_storage, score)
    if set(expected) & FORBIDDEN_COMPLETION_FIELDS or tuple(expected) != COMPLETION_KEYS or len(expected) != 39:
        raise Invalid("completion-v3 exact 39-key contract violated")
    storage = canonical(expected) + b"\n"
    writes: list[dict[str, Any]] = []
    if paths["completion"][1].exists():
        observed, value, _ = exact_file(paths["completion"][1], "existing completion-v3")
        if observed != storage or value != expected:
            raise Invalid("existing completion-v3 mismatch; overwrite/repair forbidden")
    else:
        writes.append(_write_proposal(paths["completion"][0], storage))
    return _terminal("emit-completion", "COMPLETION_ALREADY_DURABLE" if not writes else "APPLY_COMPLETION_LAST_CREATE_ONLY",
                     writes=writes, run_id=run_id, slot=slot, cell=cell,
                     score_verdict=score["verdict"], schedule_advance_allowed=False,
                     independent_reopen_required=True, persistent_state_changed=False)


def validate_cell(run_id: str, root_value: str, slot: str, cell: str, nonce: str) -> dict[str, Any]:
    root = execution_root(root_value)
    score_storage, score, capture_storage, _capture, controls, render, receipt_storage = _score_for_cell(root, run_id, slot, cell, nonce)
    paths = _paths(root, slot, cell)
    attempt_storage, attempt, _ = exact_file(paths["attempt"][1], "dispatch attempt")
    _validate_attempt(attempt, attempt_storage, _expected_attempt(root, run_id, slot, cell, nonce, controls, render))
    receipt_storage_2, receipt, _ = exact_file(paths["receipt"][1], "receipt-v4")
    render_2, _ = regular(paths["render"][1], "rendered storage final reopen")
    completion_storage, completion, _ = exact_file(paths["completion"][1], "completion-v3")
    expected = _completion(root, run_id, slot, cell, nonce, attempt_storage, render_2,
                           receipt_storage_2, receipt, capture_storage, score_storage, score)
    if receipt_storage_2 != receipt_storage or render_2 != render or tuple(completion) != COMPLETION_KEYS or len(completion) != 39 or completion != expected or completion_storage != canonical(expected) + b"\n":
        raise Invalid("completion-v3 or exact prior chain failed independent reopen")
    if set(completion) & FORBIDDEN_COMPLETION_FIELDS:
        raise Invalid("outer/session/poll field leaked into completion-v3")
    return _terminal("validate-cell", "PASS_FULL_CHAIN_REOPENED_SAFE", run_id=run_id,
                     slot=slot, cell=cell, score_verdict=score["verdict"],
                     completion_storage_sha256=sha(completion_storage),
                     completion_storage_bytes=len(completion_storage),
                     schedule_advance_allowed=score["verdict"] == "PASS",
                     persistent_state_changed=False)


def recover_state(run_id: str, root_value: str, slot: str, cell: str, nonce: str) -> dict[str, Any]:
    root = execution_root(root_value)
    _load_controls(root, run_id, slot, cell, nonce)
    paths = _paths(root, slot, cell)
    exists = {name: path.exists() for name, (_rel, path) in paths.items()}
    if exists["completion"]:
        validated = validate_cell(run_id, str(root), slot, cell, nonce)
        return _terminal("recover-state", "SEALED_VALID_REOPENED", run_id=run_id, slot=slot, cell=cell,
                         next_command=None, schedule_advance_allowed=validated["schedule_advance_allowed"],
                         persistent_state_changed=False)
    if exists["attempt"] and not exists["receipt"]:
        return _terminal("recover-state", "PERMANENT_INVALID_ATTEMPT_WITHOUT_RECEIPT_NEVER_RELAUNCH",
                         run_id=run_id, slot=slot, cell=cell, next_command=None,
                         schedule_advance_allowed=False, persistent_state_changed=False)
    if exists["receipt"]:
        _receipt_for_cell(root, run_id, slot, cell, nonce)
        if not exists["capture"]:
            next_command = "emit-capture"
        elif not exists["score"]:
            _capture_for_cell(root, run_id, slot, cell, nonce)
            next_command = "score-cell"
        else:
            _score_for_cell(root, run_id, slot, cell, nonce)
            next_command = "emit-completion"
        return _terminal("recover-state", "RESUMABLE_ZERO_SUBJECT_CALLS", run_id=run_id,
                         slot=slot, cell=cell, next_command=next_command,
                         schedule_advance_allowed=False, persistent_state_changed=False)
    if exists["render"] and not exists["attempt"]:
        return _terminal("recover-state", "EXACT_RENDER_MAY_CONTINUE_PREPARE", run_id=run_id,
                         slot=slot, cell=cell, next_command="prepare-cell",
                         schedule_advance_allowed=False, persistent_state_changed=False)
    if not any(exists.values()):
        return _terminal("recover-state", "READY_FOR_PREPARE", run_id=run_id, slot=slot,
                         cell=cell, next_command="prepare-cell", schedule_advance_allowed=False,
                         persistent_state_changed=False)
    raise Invalid("partial evidence outside monotonic create-only state machine")


def _controls_for(root: Path, run_id: str, slot: str, cell: str) -> tuple[str, dict[str, Any]]:
    _storage, dispatch, _ = exact_file(root / "dispatch_schedule.json", "dispatch schedule nonce lookup")
    entries = dispatch.get("entries")
    if not isinstance(entries, list):
        raise Invalid("dispatch schedule entries absent")
    matches = [x.get("dispatch_nonce") for x in entries if isinstance(x, dict) and (x.get("slot"), x.get("cell")) == (slot, cell)]
    if len(matches) != 1 or not isinstance(matches[0], str):
        raise Invalid("dispatch nonce lookup cardinality mismatch")
    return matches[0], _load_controls(root, run_id, slot, cell, matches[0])


def emit_artifact(run_id: str, root_value: str, slot: str, stage: str) -> dict[str, Any]:
    root = execution_root(root_value)
    if slot not in SLOTS or stage not in STAGES:
        raise Invalid("artifact slot/stage outside frozen deterministic transitions")
    first_cell = schedule()[0]
    _nonce, _controls = _controls_for(root, run_id, slot, first_cell)
    value = semantic_module().reduce(root, slot, stage)
    if not isinstance(value, dict) or value.get("candidate_id") != CANDIDATE_ID:
        raise Invalid("unchanged reducer produced invalid candidate artifact")
    storage = canonical(value) + b"\n"
    rel = f"{slot}/artifacts/{stage}.json"
    path = root / rel
    writes: list[dict[str, Any]] = []
    if path.exists():
        observed, existing, _ = exact_file(path, f"existing deterministic artifact {stage}")
        if observed != storage or existing != value:
            raise Invalid("existing deterministic artifact differs; repair forbidden")
    else:
        writes.append(_write_proposal(rel, storage))
    return _terminal("emit-artifact", "ARTIFACT_ALREADY_DURABLE" if not writes else "APPLY_ARTIFACT_CREATE_ONLY",
                     writes=writes, run_id=run_id, slot=slot, stage=stage,
                     artifact_storage_sha256=sha(storage), artifact_storage_bytes=len(storage),
                     persistent_state_changed=False)


def validate_artifact(run_id: str, root_value: str, slot: str, stage: str) -> dict[str, Any]:
    root = execution_root(root_value)
    if slot not in SLOTS or stage not in STAGES:
        raise Invalid("artifact slot/stage outside frozen deterministic transitions")
    first_cell = schedule()[0]
    _nonce, _controls = _controls_for(root, run_id, slot, first_cell)
    path = root / slot / "artifacts" / f"{stage}.json"
    storage, value, _ = exact_file(path, f"deterministic artifact {stage}")
    expected = semantic_module().reduce(root, slot, stage)
    if value != expected or storage != canonical(expected) + b"\n":
        raise Invalid("deterministic artifact differs from unchanged reducer")
    return _terminal("validate-artifact", "PASS", run_id=run_id, slot=slot, stage=stage,
                     artifact_storage_sha256=sha(storage), artifact_storage_bytes=len(storage),
                     persistent_state_changed=False)


def validate_path(run_id: str, root_value: str, slot: str) -> dict[str, Any]:
    root = execution_root(root_value)
    if slot not in SLOTS:
        raise Invalid("slot outside frozen routes")
    cells = schedule()
    score_rows: list[dict[str, Any]] = []
    for cell in cells:
        nonce, _controls = _controls_for(root, run_id, slot, cell)
        result = validate_cell(run_id, str(root), slot, cell, nonce)
        if result.get("score_verdict") != "PASS":
            raise Invalid(f"path has sealed semantic FAIL at {cell}")
        score_rows.append({"cell": cell, "completion_sha256": result["completion_storage_sha256"],
                           "completion_bytes": result["completion_storage_bytes"]})
    artifact_rows: list[dict[str, Any]] = []
    for stage in STAGES:
        result = validate_artifact(run_id, str(root), slot, stage)
        artifact_rows.append({"stage": stage, "sha256": result["artifact_storage_sha256"],
                              "bytes": result["artifact_storage_bytes"]})
    inventory = canonical({"scores": score_rows, "artifacts": artifact_rows})
    return _terminal("validate-path", "PASS_COMPLETE_CLEAN_PATH", run_id=run_id, slot=slot,
                     passed_cells=97, deterministic_artifacts=len(STAGES),
                     inventory_sha256=sha(inventory), inventory_bytes=len(inventory),
                     schedule_advance_allowed=True, persistent_state_changed=False)


def validate_matrix(run_id: str, root_value: str) -> dict[str, Any]:
    root = execution_root(root_value)
    rows = [validate_path(run_id, str(root), slot) for slot in SLOTS]
    inventory = canonical([{"slot": row["slot"], "sha256": row["inventory_sha256"], "bytes": row["inventory_bytes"]} for row in rows])
    return _terminal("validate-matrix", "PASS_COMPLETE_CLEAN_MATRIX", run_id=run_id,
                     routes=3, passed_cells=291, deterministic_artifacts=3 * len(STAGES),
                     inventory_sha256=sha(inventory), inventory_bytes=len(inventory),
                     qualification_credit=1, persistent_state_changed=False)


def validate_two_runs(first_root_value: str, second_root_value: str) -> dict[str, Any]:
    first_root, second_root = execution_root(first_root_value), execution_root(second_root_value)
    _first_storage, first_contract, _ = exact_file(first_root / "run_contract.json", "first run contract")
    _second_storage, second_contract, _ = exact_file(second_root / "run_contract.json", "second run contract")
    first_id, second_id = first_contract.get("run_id"), second_contract.get("run_id")
    if not isinstance(first_id, str) or not isinstance(second_id, str):
        raise Invalid("two-run contract identities absent")
    if first_contract.get("qualification_sequence") != 1 or first_contract.get("predecessor_run_id") is not None:
        raise Invalid("first qualification run sequence invalid")
    if second_contract.get("qualification_sequence") != 2 or second_contract.get("predecessor_run_id") != first_id:
        raise Invalid("second qualification run predecessor/sequence invalid")
    freeze_fields = ("candidate_freeze_manifest_path", "candidate_freeze_manifest_storage_sha256", "candidate_freeze_manifest_storage_bytes", "audited_candidate_bundle", "goal_loop_buster_addendum", "routes")
    if any(first_contract.get(key) != second_contract.get(key) for key in freeze_fields):
        raise Invalid("two runs do not use byte-identical frozen architecture/protocol")
    first = validate_matrix(first_id, str(first_root))
    second = validate_matrix(second_id, str(second_root))
    inventory = canonical([{"run_id": first_id, "sha256": first["inventory_sha256"], "bytes": first["inventory_bytes"]},
                           {"run_id": second_id, "sha256": second["inventory_sha256"], "bytes": second["inventory_bytes"]}])
    return _terminal("validate-two-runs", "PASS_TWO_CONSECUTIVE_CLEAN_MATRICES", first_run_id=first_id,
                     second_run_id=second_id, matrices=2, routes=6, passed_cells=582,
                     inventory_sha256=sha(inventory), inventory_bytes=len(inventory),
                     qualification_streak=2, persistent_state_changed=False)


def _dependency_closure() -> list[dict[str, Any]]:
    storage, architecture, _ = exact_file(ROOT / "architecture_contract.json", "architecture contract")
    if architecture.get("schema_id") != "pw-r8-clean-room-architecture-contract-v13" or architecture.get("candidate_id") != CANDIDATE_ID:
        raise Invalid("architecture contract identity mismatch")
    rows = architecture.get("runtime_dependency_closure")
    if not isinstance(rows, list) or not rows:
        raise Invalid("runtime dependency closure absent")
    paths: list[str] = []
    projected: list[dict[str, Any]] = []
    for row in rows:
        if not isinstance(row, dict) or tuple(row) != ("path", "sha256", "bytes", "roles"):
            raise Invalid("runtime dependency row shape/order mismatch")
        path = row.get("path")
        if not isinstance(path, str) or Path(path).is_absolute() or path.startswith("Plans/") or "/../" in f"/{path}/":
            raise Invalid("runtime dependency path escapes frozen closed world")
        data, _ = regular(SUCCESSOR / path, f"runtime dependency {path}")
        if (sha(data), len(data)) != (row.get("sha256"), row.get("bytes")):
            raise Invalid(f"runtime dependency binding drift: {path}")
        paths.append(path)
        projected.append({"path": path, "sha256": row["sha256"], "bytes": row["bytes"], "roles": row["roles"]})
    if paths != sorted(paths) or len(paths) != len(set(paths)):
        raise Invalid("runtime dependency closure is not exact sorted unique")
    forbidden = ("model_retest_r8_candidate_v12/r8_process_controller.py", "model_retest_r8_candidate_v12/r8_run_verifier.py")
    if any(path.endswith(forbidden) for path in paths):
        raise Invalid("candidate-v12 process/completion controller dependency forbidden")
    if sha(storage) == "":
        raise Invalid("unreachable architecture hash guard")
    return projected


def _with_observed_open_audit(dependencies: list[dict[str, Any]], operation: Callable[[], Any]) -> tuple[Any, dict[str, Any]]:
    """Observe runtime reads without modifying import or filesystem behavior."""
    declared = {str((SUCCESSOR / row["path"]).resolve()): row for row in dependencies}
    observed: set[str] = set()
    live_plans: set[str] = set()
    enabled = True
    successor_root = SUCCESSOR.resolve()
    live_plans_root = (REPO / "Plans").resolve()

    def audit(event: str, args: tuple[Any, ...]) -> None:
        nonlocal enabled
        if not enabled or event != "open" or not args:
            return
        raw = args[0]
        if isinstance(raw, bytes):
            try:
                raw = os.fsdecode(raw)
            except UnicodeDecodeError:
                return
        if not isinstance(raw, str):
            return
        try:
            path = Path(raw)
            resolved = (Path.cwd() / path).resolve() if not path.is_absolute() else path.resolve()
        except (OSError, RuntimeError):
            return
        resolved_text = str(resolved)
        if resolved == live_plans_root or resolved.is_relative_to(live_plans_root):
            live_plans.add(resolved_text)
        if resolved == successor_root or resolved.is_relative_to(successor_root):
            observed.add(resolved_text)

    sys.addaudithook(audit)
    try:
        value = operation()
    finally:
        enabled = False
    successful_files = sorted(path for path in observed if Path(path).is_file())
    undeclared = [path for path in successful_files if path not in declared]
    if live_plans:
        raise Invalid(f"observed live Plans read: {sorted(live_plans)}")
    if undeclared:
        raise Invalid(f"observed successor dependency outside declared closure: {undeclared}")
    rows = [
        {
            "path": str(Path(path).relative_to(successor_root)),
            "sha256": declared[path]["sha256"],
            "bytes": declared[path]["bytes"],
        }
        for path in successful_files
    ]
    inventory = canonical(rows)
    return value, {
        "status": "PASS", "audit_mechanism": "python_sys_audit_open_event",
        "observed_successor_file_count": len(rows), "observed_successor_files": rows,
        "observed_successor_inventory_sha256": sha(inventory),
        "observed_successor_inventory_bytes": len(inventory),
        "undeclared_observed_successor_files": [], "live_plans_paths": [],
    }


def _semantic_identity() -> dict[str, Any]:
    v12_storage, v12, _ = exact_file(V12_PREFLIGHT, "candidate-v12 deterministic preflight")
    harness = _module(V9_HARNESS, "pw_r8_candidate_v9_preflight_for_v13")
    v9 = harness.preflight()
    module = harness.semantic_module(candidate_identity=False)
    cells = tuple(module.SUBJECT_CELLS)
    if list(cells) != v12.get("exact_subject_cell_schedule") or len(cells) != 97:
        raise Invalid("candidate-v13 schedule differs from frozen v12")
    baseline = v12.get("candidate_v9_semantic_baseline")
    if not isinstance(baseline, dict):
        raise Invalid("candidate-v12 v9 semantic baseline absent")
    for name in ("provider_visible_prompt_identity", "semantic_oracle_identity", "schedule_identity"):
        row = baseline.get(name)
        if not isinstance(row, dict) or row.get("cells_compared") != 97 or row.get("byte_identical") is not True:
            raise Invalid(f"candidate-v12 semantic lineage baseline invalid: {name}")
    compare_fields = ("measurements", "exact_subject_cell_schedule", "expected_cell_payloads",
                      "candidate_v5_provider_visible_prompt_and_measurement_identity",
                      "candidate_v5_semantic_oracle_identity", "candidate_v5_schedule_identity")
    if any(v9.get(field) != v12.get(field) for field in compare_fields):
        raise Invalid("executed v9 pure semantic preflight differs from frozen v12 baseline")
    render_inventory = canonical(v9["measurements"])
    oracle_inventory = canonical({"expected_cell_payloads": v9["expected_cell_payloads"],
                                  "semantic_oracle_identity": v9["candidate_v5_semantic_oracle_identity"]})
    schedule_storage = canonical(list(cells))
    return {
        "status": "PASS", "cells_compared": 97, "render_identity": "97/97",
        "oracle_identity": "97/97", "schedule_identity": "97/97",
        "v12_preflight_sha256": sha(v12_storage), "v12_preflight_bytes": len(v12_storage),
        "render_inventory_sha256": sha(render_inventory), "render_inventory_bytes": len(render_inventory),
        "oracle_inventory_sha256": sha(oracle_inventory), "oracle_inventory_bytes": len(oracle_inventory),
        "schedule_sha256": sha(schedule_storage), "schedule_bytes": len(schedule_storage),
        "routes_unchanged": {slot: {"requested_model": model, "requested_thinking": effort} for slot, (model, effort) in ROUTES.items()},
    }


def _legacy_capture_and_score() -> tuple[bytes, dict[str, Any], bytes, dict[str, Any], bytes]:
    render, _ = regular(V12_A02_RENDER, "v12 A02 render")
    receipt_storage, receipt, _ = exact_file(V12_A02_RECEIPT, "v12 A02 receipt")
    if tuple(receipt) != RECEIPT_KEYS or len(receipt) != 55:
        raise Invalid("v12 A02 receipt no longer exact receipt-v4")
    capture = _capture_from_receipt(receipt, receipt_storage)
    capture_storage = canonical(capture) + b"\n"
    score = _score_from_capture(receipt["candidate_id"], receipt["cell"], receipt["slot"], Path(receipt["execution_root"]), capture)
    score_storage = canonical(score) + b"\n"
    return receipt_storage, receipt, capture_storage, score, score_storage


def _validate_preserved_receipt(receipt: dict[str, Any], storage: bytes, render: bytes) -> None:
    """Validate a preserved receipt using its own frozen candidate/run identity."""
    if tuple(receipt) != RECEIPT_KEYS or len(receipt) != 55 or canonical(receipt) + b"\n" != storage:
        raise Invalid("preserved receipt-v4 exact closed world/canonical storage mismatch")
    candidate_id, run_id, slot, cell = (receipt.get(key) for key in ("candidate_id", "run_id", "slot", "cell"))
    if not all(isinstance(value, str) and value for value in (candidate_id, run_id, slot, cell)) or slot not in SLOTS:
        raise Invalid("preserved receipt identity invalid")
    model, effort = ROUTES[slot]
    exact = {
        "schema_id": "pw-r8-direct-appserver-subject-receipt-v4",
        "requested_model": model, "requested_thinking": effort,
        "provider_effective_model": None, "provider_effective_thinking": None,
        "host_id": "remote-ssh-discovered:pm-dev", "fresh_task_identity_basis": "thread_id",
        "status": "completed", "subject_call_started": True, "fresh_context": True,
        "first_attempt_subject_call": True, "retry_count": 0, "best_of": False,
        "replacement_result": False, "render_storage_sha256": sha(render),
        "render_storage_bytes": len(render), "provider_visible_payload_sha256": sha(render[:-1]),
        "provider_visible_payload_bytes": len(render) - 1, "semantic_packet_sha256": sha(render[:-1]),
        "semantic_packet_bytes": len(render) - 1, "model_provider": "openai",
        "turn_context_model": model, "turn_context_effort": effort,
    }
    for key, value in exact.items():
        if type(receipt.get(key)) is not type(value) or receipt.get(key) != value:
            raise Invalid(f"preserved receipt field mismatch: {key}")
    for key in ("thread_id", "turn_id", "dispatch_nonce", "rollout_path"):
        if not isinstance(receipt.get(key), str) or not receipt[key]:
            raise Invalid(f"preserved receipt string identity absent: {key}")
    if not HEX64_RE.fullmatch(receipt["dispatch_nonce"]):
        raise Invalid("preserved receipt nonce invalid")
    schedule_binding = receipt.get("dispatch_schedule")
    if (
        not isinstance(schedule_binding, dict)
        or tuple(schedule_binding) != ("path", "storage_sha256", "storage_bytes")
        or schedule_binding.get("path") != "dispatch_schedule.json"
        or not HEX64_RE.fullmatch(str(schedule_binding.get("storage_sha256")))
        or type(schedule_binding.get("storage_bytes")) is not int
        or schedule_binding["storage_bytes"] <= 0
    ):
        raise Invalid("preserved receipt dispatch schedule binding invalid")
    binding = {
        "schema_id": "pw-r8-dispatch-binding-v1", "candidate_id": candidate_id,
        "run_id": run_id, "slot": slot, "cell": cell,
        "dispatch_nonce": receipt["dispatch_nonce"],
        "semantic_packet_sha256": sha(render[:-1]), "semantic_packet_bytes": len(render) - 1,
        "dispatch_schedule_sha256": schedule_binding["storage_sha256"],
        "dispatch_schedule_bytes": schedule_binding["storage_bytes"],
    }
    if receipt.get("dispatch_binding") != binding or tuple(receipt["dispatch_binding"]) != tuple(binding):
        raise Invalid("preserved receipt exact dispatch binding mismatch")
    admission = receipt.get("admission")
    admission_keys = (
        "schema_id", "candidate_id", "run_id", "candidate_freeze_manifest",
        "dispatch_schedule", "dispatch_nonce", "slot", "cell", "ordered_index",
        "status", "prior_pass_count", "preserved_no_start_controller_invalid_count",
        "other_slot_path_terminals_do_not_block", "root_terminal_phase_started",
        "retry", "best_of", "replacement",
    )
    if not isinstance(admission, dict) or tuple(admission) != admission_keys:
        raise Invalid("preserved receipt admission exact closed world mismatch")
    admission_exact = {
        "schema_id": "pw-r8-cell-admission-v5", "candidate_id": candidate_id,
        "run_id": run_id, "dispatch_schedule": schedule_binding,
        "dispatch_nonce": receipt["dispatch_nonce"], "slot": slot, "cell": cell,
        "status": "ADMIT_ONE_FRESH_FIRST_ATTEMPT",
        "preserved_no_start_controller_invalid_count": 0,
        "other_slot_path_terminals_do_not_block": True, "root_terminal_phase_started": False,
        "retry": False, "best_of": False, "replacement": False,
    }
    if any(type(admission.get(key)) is not type(value) or admission.get(key) != value for key, value in admission_exact.items()):
        raise Invalid("preserved receipt admission binding mismatch")
    if type(admission.get("ordered_index")) is not int or admission["ordered_index"] < 0 or type(admission.get("prior_pass_count")) is not int or admission["prior_pass_count"] != admission["ordered_index"]:
        raise Invalid("preserved receipt causal admission counts invalid")
    freeze = admission.get("candidate_freeze_manifest")
    if not isinstance(freeze, dict) or tuple(freeze) != ("path", "storage_sha256", "storage_bytes", "audited_candidate_bundle"):
        raise Invalid("preserved receipt freeze binding shape invalid")
    if not isinstance(freeze.get("path"), str) or not HEX64_RE.fullmatch(str(freeze.get("storage_sha256"))) or type(freeze.get("storage_bytes")) is not int or freeze["storage_bytes"] <= 0 or not isinstance(freeze.get("audited_candidate_bundle"), dict):
        raise Invalid("preserved receipt freeze binding values invalid")
    messages, prohibited = receipt.get("assistant_final_messages"), receipt.get("prohibited_activity_items")
    if not isinstance(messages, list) or not isinstance(prohibited, list):
        raise Invalid("preserved receipt raw evidence arrays invalid")
    if (receipt.get("assistant_final_messages_sha256"), receipt.get("assistant_final_messages_bytes")) != (sha(canonical(messages)), len(canonical(messages))):
        raise Invalid("preserved receipt final-message binding mismatch")
    if (receipt.get("prohibited_activity_items_sha256"), receipt.get("prohibited_activity_items_bytes")) != (sha(canonical(prohibited)), len(canonical(prohibited))):
        raise Invalid("preserved receipt prohibited-item binding mismatch")
    text = receipt.get("single_text_output_utf8")
    if text is not None and not isinstance(text, str):
        raise Invalid("preserved receipt normalized text type invalid")
    text_storage = None if text is None else text.encode("utf-8")
    if (receipt.get("single_text_output_sha256"), receipt.get("single_text_output_bytes")) != (
        None if text_storage is None else sha(text_storage), None if text_storage is None else len(text_storage)
    ):
        raise Invalid("preserved receipt normalized text binding mismatch")
    types, observations = receipt.get("prohibited_activity_item_types"), receipt.get("conformance_observations")
    if not isinstance(types, list) or any(not isinstance(value, str) or not value for value in types) or not isinstance(observations, list) or any(not isinstance(value, str) or not value for value in observations):
        raise Invalid("preserved receipt normalized evidence types invalid")
    if receipt.get("text_normalization_receipt") != _expected_normalization(messages, text, types, observations):
        raise Invalid("preserved receipt normalization derivation mismatch")
    timing = (receipt.get("started_at_epoch_seconds"), receipt.get("completed_at_epoch_seconds"), receipt.get("duration_ms"))
    if any(isinstance(value, bool) or not isinstance(value, (int, float)) for value in timing) or timing[1] < timing[0] or timing[2] < 0:
        raise Invalid("preserved receipt timing invalid")
    wrapper = _dispatch_wrapper(render[:-1], binding)
    if (receipt.get("dispatch_wrapper_sha256"), receipt.get("dispatch_wrapper_bytes")) != (sha(wrapper), len(wrapper)):
        raise Invalid("preserved receipt exact wrapper binding mismatch")
    _validate_rollout(receipt, render[:-1], binding, wrapper)


def _synthetic_preserved_attempt(render: bytes, receipt: dict[str, Any]) -> dict[str, Any]:
    root = Path(receipt["execution_root"])
    schedule_binding = receipt["dispatch_schedule"]
    return _attempt({
        "schema_id": "pw-r8-dispatch-attempt-v1", "candidate_id": CANDIDATE_ID,
        "run_id": "zero-call-successor", "slot": receipt["slot"], "cell": receipt["cell"],
        "execution_root": str(root), "ordered_index": receipt["admission"]["ordered_index"],
        "attempt_ordinal": 1, "requested_model": receipt["requested_model"],
        "requested_thinking": receipt["requested_thinking"], "dispatch_nonce": receipt["dispatch_nonce"],
        "dispatch_schedule_sha256": schedule_binding["storage_sha256"],
        "dispatch_schedule_bytes": schedule_binding["storage_bytes"],
        "rendered_relative_path": _paths(root, receipt["slot"], receipt["cell"])["render"][0],
        "render_storage_sha256": sha(render), "render_storage_bytes": len(render),
        "provider_visible_payload_sha256": sha(render[:-1]), "provider_visible_payload_bytes": len(render) - 1,
        "fresh_task_required": True, "first_attempt_subject_call": True,
        "subject_call_count_ceiling": 1, "retry_count": 0, "best_of": False,
        "replacement_result": False, "status": "FIRST_ATTEMPT_FUSE_PERSISTED_BEFORE_SUBJECT_CALL",
    })


class _MemoryCellState:
    """Isolated no-write create-only state used to execute recovery contracts."""

    def __init__(self, render: bytes, receipt_storage: bytes, *, prefix: str = "receipt") -> None:
        self.render_expected = render
        self.receipt_value = strict_object(receipt_storage, "memory receipt")
        self.root = Path(self.receipt_value["execution_root"])
        self.run_id = "zero-call-successor"
        self.slot = self.receipt_value["slot"]
        self.cell = self.receipt_value["cell"]
        self.nonce = self.receipt_value["dispatch_nonce"]
        self.paths = {name: rel for name, (rel, _path) in _paths(self.root, self.slot, self.cell).items()}
        self.objects: dict[str, bytes] = {}
        self.subject_calls = 0
        attempt = _synthetic_preserved_attempt(render, self.receipt_value)
        ordered = [
            ("render", render), ("attempt", canonical(attempt) + b"\n"),
            ("receipt", receipt_storage),
        ]
        prefix_names = {"empty": 0, "render": 1, "attempt": 2, "receipt": 3}
        if prefix not in prefix_names:
            raise Invalid("unknown memory prefix")
        for name, data in ordered[:prefix_names[prefix]]:
            self.create_only(name, data)

    def create_only(self, name: str, storage: bytes) -> None:
        if name not in self.paths or name in self.objects:
            raise Invalid(f"memory create-only collision or unknown member: {name}")
        if not isinstance(storage, bytes) or not storage:
            raise Invalid(f"memory storage invalid: {name}")
        self.objects[name] = storage

    def reopen(self, name: str) -> bytes:
        if name not in self.objects:
            raise Invalid(f"memory member absent: {name}")
        return bytes(self.objects[name])

    def classify(self) -> str:
        present = {name for name in self.paths if name in self.objects}
        if not present:
            return "READY_FOR_PREPARE"
        if "render" not in present:
            raise Invalid("out-of-order state lacks render")
        if "attempt" not in present:
            if present != {"render"}:
                raise Invalid("post-render evidence exists before attempt")
            return "NEED_DISPATCH_ATTEMPT"
        if "receipt" not in present:
            if present != {"render", "attempt"}:
                raise Invalid("post-attempt evidence exists before receipt")
            return "PERMANENT_INVALID_ATTEMPT_WITHOUT_RECEIPT_NEVER_RELAUNCH"
        if "capture" not in present:
            if present != {"render", "attempt", "receipt"}:
                raise Invalid("post-receipt evidence skipped capture")
            return "EMIT_CAPTURE_ZERO_CALL"
        if "score" not in present:
            if present != {"render", "attempt", "receipt", "capture"}:
                raise Invalid("post-capture evidence skipped score")
            return "SCORE_ZERO_CALL"
        if "completion" not in present:
            if present != {"render", "attempt", "receipt", "capture", "score"}:
                raise Invalid("pre-completion evidence outside exact prefix")
            return "EMIT_COMPLETION_ZERO_CALL"
        if present != set(self.paths):
            raise Invalid("completion exists outside full prefix")
        return "SEALED_REOPEN_REQUIRED"

    def _validate_render_attempt_receipt(self) -> tuple[bytes, bytes, dict[str, Any], bytes, dict[str, Any]]:
        render = self.reopen("render")
        _validate_render_bytes(render, self.render_expected)
        attempt_storage = self.reopen("attempt")
        attempt = strict_object(attempt_storage, "memory dispatch attempt")
        expected_attempt = _synthetic_preserved_attempt(render, self.receipt_value)
        _validate_attempt(attempt, attempt_storage, expected_attempt)
        receipt_storage = self.reopen("receipt")
        receipt = strict_object(receipt_storage, "memory receipt reopen")
        _validate_preserved_receipt(receipt, receipt_storage, render)
        if receipt["dispatch_nonce"] != attempt["dispatch_nonce"]:
            raise Invalid("memory attempt/receipt nonce mismatch")
        return render, attempt_storage, attempt, receipt_storage, receipt

    def derive_capture(self) -> bytes:
        _render, _attempt_storage, _attempt, receipt_storage, receipt = self._validate_render_attempt_receipt()
        capture = _capture_from_receipt(receipt, receipt_storage)
        storage = canonical(capture) + b"\n"
        self.create_only("capture", storage)
        return storage

    def derive_score(self) -> bytes:
        _render, _attempt_storage, _attempt, receipt_storage, receipt = self._validate_render_attempt_receipt()
        capture_storage = self.reopen("capture")
        capture = strict_object(capture_storage, "memory capture")
        expected_capture = _capture_from_receipt(receipt, receipt_storage)
        if tuple(capture) != CAPTURE_KEYS or capture != expected_capture or capture_storage != canonical(expected_capture) + b"\n":
            raise Invalid("memory capture differs from receipt projection")
        score = _score_from_capture(receipt["candidate_id"], self.cell, self.slot, self.root, capture)
        storage = canonical(score) + b"\n"
        self.create_only("score", storage)
        return storage

    def derive_completion(self) -> bytes:
        render, attempt_storage, _attempt, receipt_storage, receipt = self._validate_render_attempt_receipt()
        capture_storage = self.reopen("capture")
        score_storage = self.reopen("score")
        score = strict_object(score_storage, "memory score")
        completion = _completion_from_members(
            self.root, self.run_id, self.slot, self.cell, self.nonce,
            attempt_storage, render, receipt_storage, receipt, capture_storage, score_storage, score,
        )
        storage = canonical(completion) + b"\n"
        self.create_only("completion", storage)
        return storage

    def continue_zero_call(self) -> dict[str, Any]:
        initial = self.classify()
        if initial in ("READY_FOR_PREPARE", "NEED_DISPATCH_ATTEMPT", "PERMANENT_INVALID_ATTEMPT_WITHOUT_RECEIPT_NEVER_RELAUNCH"):
            raise Invalid(f"state cannot resume post-receipt without subject call: {initial}")
        transitions = [initial]
        while True:
            state = self.classify()
            if state == "EMIT_CAPTURE_ZERO_CALL":
                self.derive_capture()
            elif state == "SCORE_ZERO_CALL":
                self.derive_score()
            elif state == "EMIT_COMPLETION_ZERO_CALL":
                self.derive_completion()
            elif state == "SEALED_REOPEN_REQUIRED":
                break
            else:
                raise Invalid(f"unexpected continuation state: {state}")
            transitions.append(self.classify())
        validated = self.validate_chain()
        return {"initial_state": initial, "transitions": transitions, **validated}

    def validate_chain(self) -> dict[str, Any]:
        if self.classify() != "SEALED_REOPEN_REQUIRED":
            raise Invalid("memory chain is not complete")
        render, attempt_storage, _attempt, receipt_storage, receipt = self._validate_render_attempt_receipt()
        capture_storage = self.reopen("capture")
        capture = strict_object(capture_storage, "memory capture final reopen")
        expected_capture = _capture_from_receipt(receipt, receipt_storage)
        if tuple(capture) != CAPTURE_KEYS or capture != expected_capture or capture_storage != canonical(expected_capture) + b"\n":
            raise Invalid("memory capture final reopen mismatch")
        score_storage = self.reopen("score")
        score = strict_object(score_storage, "memory score final reopen")
        expected_score = _score_from_capture(receipt["candidate_id"], self.cell, self.slot, self.root, capture)
        if score != expected_score or score_storage != canonical(expected_score) + b"\n":
            raise Invalid("memory score final reopen mismatch")
        completion_storage = self.reopen("completion")
        completion = strict_object(completion_storage, "memory completion final reopen")
        expected_completion = _completion_from_members(
            self.root, self.run_id, self.slot, self.cell, self.nonce,
            attempt_storage, render, receipt_storage, receipt, capture_storage, score_storage, score,
        )
        if tuple(completion) != COMPLETION_KEYS or completion != expected_completion or completion_storage != canonical(expected_completion) + b"\n" or set(completion) & FORBIDDEN_COMPLETION_FIELDS:
            raise Invalid("memory completion-v3 exact reopen mismatch")
        return {
            "status": "PASS_FULL_CHAIN_REOPENED_SAFE", "subject_calls": self.subject_calls,
            "capture_storage_sha256": sha(capture_storage), "capture_storage_bytes": len(capture_storage),
            "score_storage_sha256": sha(score_storage), "score_storage_bytes": len(score_storage),
            "completion_storage_sha256": sha(completion_storage), "completion_storage_bytes": len(completion_storage),
            "score_verdict": score["verdict"], "completion_key_count": len(completion),
        }


def _real_fragmented_local_case() -> dict[str, Any]:
    receipt_storage, _ = regular(V12_A02_RECEIPT, "v12 A02 receipt for fragmented emitter")
    encoded = receipt_storage.hex()
    script = (
        "import sys,time,signal;seen=[];signal.signal(signal.SIGTERM,lambda s,f:seen.append(s));d=bytes.fromhex(" + repr(encoded) + ");"
        "n=len(d)//3;sys.stdout.buffer.write(d[:n]);sys.stdout.buffer.flush();"
        "deadline=time.monotonic()+5;"
        "\nwhile not seen and time.monotonic()<deadline: time.sleep(.005)"
        "\nif not seen: sys.exit(42)"
        "\nsys.stdout.buffer.write(d[n:2*n]);sys.stdout.buffer.flush();time.sleep(.04);"
        "sys.stdout.buffer.write(d[2*n:]);sys.stdout.buffer.flush()"
    )
    proc = subprocess.Popen([sys.executable, "-B", "-c", script], stdin=subprocess.DEVNULL,
                            stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    assert proc.stdout is not None
    fragments: list[bytes] = []
    live_polls = 0
    signal_sent = False
    while True:
        ready, _, _ = select.select([proc.stdout], [], [], 0.025)
        if ready:
            piece = os.read(proc.stdout.fileno(), max(1, len(receipt_storage) // 3))
            if piece:
                fragments.append(piece)
                if not signal_sent:
                    proc.send_signal(signal.SIGTERM)
                    signal_sent = True
        if proc.poll() is not None:
            tail = proc.stdout.read()
            if tail:
                fragments.append(tail)
            break
        live_polls += 1
    stderr = proc.stderr.read() if proc.stderr is not None else b""
    assembled = b"".join(fragments)
    if proc.returncode != 0 or assembled != receipt_storage or live_polls < 1 or len(fragments) < 3 or not signal_sent:
        raise Invalid("real delayed fragmented local receipt emitter failed")
    return {
        "case_id": "ZC-LIVE-001", "status": "PASS", "local_child_exit_code": proc.returncode,
        "stdout_fragment_count_at_least_three": len(fragments) >= 3,
        "internal_live_wait_observed": live_polls >= 1,
        "receipt_storage_sha256": sha(assembled), "receipt_storage_bytes": len(assembled),
        "stderr_sha256": sha(stderr), "stderr_bytes": len(stderr),
        "sigterm_injected_during_fragmented_lifetime": signal_sent,
        "sigterm_deferred_through_exact_receipt_completion": proc.returncode == 0 and assembled == receipt_storage,
        "outer_session_metadata_used": False, "subject_calls": 0, "provider_calls": 0,
        "network_calls": 0,
    }


def _probe(case_id: str, input_value: Any, operation: Callable[[], Any], *, expect_reject: bool) -> dict[str, Any]:
    input_storage = canonical(input_value)
    rejected = False
    error_class: str | None = None
    result: Any = None
    try:
        result = operation()
    except Invalid as exc:
        rejected = True
        error_class = type(exc).__name__
        result = {"error": str(exc)}
    if rejected is not expect_reject:
        raise Invalid(f"{case_id}: probe disposition mismatch")
    output_storage = canonical(result)
    return {
        "case_id": case_id, "status": "PASS", "assertion_executed": True,
        "expected_reject": expect_reject, "observed_reject": rejected,
        "error_class": error_class, "input_sha256": sha(input_storage),
        "input_bytes": len(input_storage), "output_sha256": sha(output_storage),
        "output_bytes": len(output_storage), "result": result,
        "subject_calls": 0, "provider_calls": 0,
        "network_calls": 0,
    }


def _require(condition: bool, message: str) -> dict[str, Any]:
    if not condition:
        raise Invalid(message)
    return {"assertion": "satisfied"}


def _validate_render_bytes(observed: bytes, expected: bytes) -> dict[str, Any]:
    if observed != expected or not observed.endswith(b"\n") or observed.endswith(b"\n\n") or b"\r" in observed:
        raise Invalid("render differs or is not exact one-terminal-LF storage")
    return {"storage_sha256": sha(observed), "storage_bytes": len(observed)}


def _validate_render_relative_path(observed: str, root: Path, slot: str, cell: str) -> dict[str, Any]:
    expected = _paths(root, slot, cell)["render"][0]
    if observed != expected or "/rendered/" not in f"/{observed}":
        raise Invalid("render relative path is not exact rendered/ custody path")
    return {"relative_path": observed}


def _validate_exact_declared_files(observed: list[str], declared: list[str]) -> dict[str, Any]:
    if observed != declared or len(observed) != len(set(observed)):
        raise Invalid("audited candidate bundle required-file set mismatch")
    return {"file_count": len(observed), "inventory_sha256": sha(canonical(observed))}


def _predecessor_outer_completion_probe(render: bytes, receipt_storage: bytes,
                                        process_contract: dict[str, Any], outer: dict[str, Any]) -> dict[str, Any]:
    receipt = strict_object(receipt_storage, "predecessor A02 receipt")
    _validate_preserved_receipt(receipt, receipt_storage, render)
    required = process_contract.get("completion_observation_exact_keys")
    if not isinstance(required, list):
        raise Invalid("predecessor completion-v2 contract unavailable")
    outer_required = [
        "outer_exec_live_session_observed", "outer_exec_session_id", "outer_exec_poll_count",
        "outer_exec_terminal_observed", "outer_exec_exit_code", "outer_exec_stdout_fully_captured",
    ]
    if any(key not in required for key in outer_required):
        raise Invalid("predecessor completion-v2 outer requirements changed")
    missing = [key for key in outer_required if key not in outer]
    if missing:
        raise Invalid("predecessor outer completion metadata missing: " + ",".join(missing))
    return {"status": "PREDECESSOR_COMPLETION_V2_ACCEPTED", "outer_fields": outer_required}


def _memory_full_recovery(render: bytes, receipt_storage: bytes) -> tuple[_MemoryCellState, dict[str, Any]]:
    state = _MemoryCellState(render, receipt_storage, prefix="receipt")
    result = state.continue_zero_call()
    if result["subject_calls"] != 0 or result["completion_key_count"] != 39:
        raise Invalid("memory successor recovery did not preserve zero-call exact completion")
    return state, result


def _outer_metadata_independent_outputs(render: bytes, receipt_storage: bytes,
                                        outer_variants: list[dict[str, Any]]) -> dict[str, Any]:
    rows: list[dict[str, Any]] = []
    for outer in outer_variants:
        # `outer` is deliberately never supplied to the recovery state machine.
        state, result = _memory_full_recovery(render, receipt_storage)
        completion = strict_object(state.reopen("completion"), "outer-independent completion")
        if set(completion) & (FORBIDDEN_COMPLETION_FIELDS | set(outer)):
            raise Invalid("outer metadata leaked into completion-v3")
        rows.append({
            "omitted_outer_keys": sorted(outer),
            "capture_storage_sha256": result["capture_storage_sha256"],
            "score_storage_sha256": result["score_storage_sha256"],
            "completion_storage_sha256": result["completion_storage_sha256"],
            "completion_storage_bytes": result["completion_storage_bytes"],
        })
    identities = {(row["capture_storage_sha256"], row["score_storage_sha256"], row["completion_storage_sha256"], row["completion_storage_bytes"]) for row in rows}
    if len(identities) != 1:
        raise Invalid("outer metadata variants changed zero-call output bytes")
    return {"variant_count": len(rows), "byte_identical_outputs": True, "rows": rows}


def _zero_call_suite() -> dict[str, Any]:
    render, _ = regular(V12_A02_RENDER, "v12 A02 exact render")
    receipt_storage, receipt, capture_storage, score, score_storage = _legacy_capture_and_score()
    process_storage, _ = regular(V12_PROCESS_CONTRACT, "v12 process completion contract")
    process_contract = preserved_object(process_storage, "v12 process completion contract")
    predecessor_input = {
        "render_storage_sha256": sha(render), "render_storage_bytes": len(render),
        "receipt_storage_sha256": sha(receipt_storage), "receipt_storage_bytes": len(receipt_storage),
        "process_contract_sha256": sha(process_storage), "process_contract_bytes": len(process_storage),
        "retained_outer_metadata": {"outer_exec_exit_code": 0, "outer_exec_stdout_fully_captured": True},
    }
    predecessor = _probe(
        "ZC-PRED-001", predecessor_input,
        lambda: _predecessor_outer_completion_probe(
            render, receipt_storage, process_contract,
            {"outer_exec_exit_code": 0, "outer_exec_stdout_fully_captured": True},
        ),
        expect_reject=True,
    )
    predecessor.update({
        "expected_failure_reproduced": "EXTERNAL_OUTER_SESSION_COMPLETION_METADATA_DISCARDED_AFTER_TERMINAL_POLL_BEFORE_CELL_SEAL",
        "receipt_preserved_byte_identical": True, "schedule_advanced": False, "retry": False,
    })

    successor_probe = _probe(
        "ZC-SUCC-001",
        {"render_sha256": sha(render), "render_bytes": len(render),
         "receipt_sha256": sha(receipt_storage), "receipt_bytes": len(receipt_storage)},
        lambda: _memory_full_recovery(render, receipt_storage)[1],
        expect_reject=False,
    )
    successor = {
        **successor_probe,
        "same_receipt_storage_sha256": sha(receipt_storage), "same_receipt_storage_bytes": len(receipt_storage),
        "legacy_capture_storage_sha256": sha(capture_storage), "legacy_capture_storage_bytes": len(capture_storage),
        "legacy_score_storage_sha256": sha(score_storage), "legacy_score_storage_bytes": len(score_storage),
        "legacy_score_verdict": score["verdict"], "schedule_advanced": False,
    }
    armed_values = _synthetic_preserved_attempt(render, receipt)
    successor["armed_fuse_v13_specific_admission_probe"] = _probe(
        "ZC-SUCC-ARMED-FUSE", armed_values,
        lambda: _armed_fuse_launch_gate(armed_values, launch_authorized=True,
                                        continuous_prestart_transaction=True),
        expect_reject=False,
    )

    def rec003() -> Any:
        state = _MemoryCellState(render, receipt_storage, prefix="attempt")
        if state.classify() != "PERMANENT_INVALID_ATTEMPT_WITHOUT_RECEIPT_NEVER_RELAUNCH":
            raise Invalid("attempt-without-receipt prefix misclassified")
        return state.continue_zero_call()

    def rec004() -> dict[str, Any]:
        state, result = _memory_full_recovery(render, receipt_storage)
        if state.classify() != "SEALED_REOPEN_REQUIRED":
            raise Invalid("deferred stop released before complete chain")
        return {"signal": "SIGTERM", "stop_deferred": True, **result}

    def rec005() -> dict[str, Any]:
        baseline, baseline_result = _memory_full_recovery(render, receipt_storage)
        rows: list[dict[str, Any]] = []
        for prefix, members in (("receipt", ()), ("capture", ("capture",)), ("score", ("capture", "score")), ("completion", ("capture", "score", "completion"))):
            state = _MemoryCellState(render, receipt_storage, prefix="receipt")
            for name in members:
                state.create_only(name, baseline.reopen(name))
            initial = state.classify()
            if initial == "SEALED_REOPEN_REQUIRED":
                result = state.validate_chain()
            else:
                result = state.continue_zero_call()
            if result["completion_storage_sha256"] != baseline_result["completion_storage_sha256"]:
                raise Invalid("prefix continuation changed completion bytes")
            rows.append({"prefix": prefix, "classified_state": initial,
                         "completion_storage_sha256": result["completion_storage_sha256"],
                         "completion_storage_bytes": result["completion_storage_bytes"]})
        return {"prefix_count": len(rows), "byte_identical_completion": True, "rows": rows}

    def rec006() -> dict[str, Any]:
        malformed = (b"", b"\n", b"{\n", b'{"schema_id":"partial"}\n', receipt_storage[:-7])
        rows: list[dict[str, Any]] = []
        for index, candidate in enumerate(malformed):
            state = _MemoryCellState(render, receipt_storage, prefix="attempt")
            if not candidate:
                try:
                    state.create_only("receipt", candidate)
                except Invalid:
                    rows.append({"variant": index, "classifier": state.classify(), "rejected": True})
                    continue
                raise Invalid("empty receipt unexpectedly created")
            state.create_only("receipt", candidate)
            classified = state.classify()
            try:
                state.continue_zero_call()
            except Invalid:
                rows.append({"variant": index, "classifier": classified, "rejected": True})
                continue
            raise Invalid("malformed/partial receipt unexpectedly resumed")
        if len(rows) != len(malformed):
            raise Invalid("not all malformed receipt variants exercised")
        return {"variant_count": len(rows), "all_rejected_before_score": True, "rows": rows}

    def mutated_receipt(**changes: Any) -> _MemoryCellState:
        state = _MemoryCellState(render, receipt_storage, prefix="receipt")
        value = dict(receipt)
        value.update(changes)
        state.objects["receipt"] = canonical(value) + b"\n"
        return state

    def rec009() -> Any:
        state = _MemoryCellState(render, receipt_storage, prefix="receipt")
        state.classify()
        state.create_only("receipt", receipt_storage)
        return {"unreachable": True}

    outer_variants = [
        {},
        {"outer_exec_session_id": 8421, "outer_exec_poll_count": 7},
        {"outer_exec_live_session_observed": True, "outer_exec_terminal_observed": True,
         "outer_exec_exit_code": 0, "outer_exec_stdout_fully_captured": True},
    ]
    recovery = [
        _probe("ZC-REC-002", {"mutation": "two_terminal_lf", "sha256": sha(render + b"\n"), "bytes": len(render) + 1},
               lambda: _validate_render_bytes(render + b"\n", render), expect_reject=True),
        _probe("ZC-REC-003", {"prefix": ["render", "attempt"], "receipt_present": False}, rec003, expect_reject=True),
        _probe("ZC-REC-004", {"signal": "SIGTERM", "prefix": ["render", "attempt", "receipt"]}, rec004, expect_reject=False),
        _probe("ZC-REC-005", {"interruption_prefixes": ["receipt", "capture", "score", "completion"]}, rec005, expect_reject=False),
        _probe("ZC-REC-006", {"invalid_receipt_forms": ["empty", "lf", "partial-json", "partial-object", "truncated"]}, rec006, expect_reject=False),
        _probe("ZC-REC-007", {"mutated_dispatch_nonce": "0" * 64},
               lambda: mutated_receipt(dispatch_nonce="0" * 64).continue_zero_call(), expect_reject=True),
        _probe("ZC-REC-008", {"mutated_rollout_storage_sha256": "0" * 64},
               lambda: mutated_receipt(rollout_storage_sha256="0" * 64).continue_zero_call(), expect_reject=True),
        _probe("ZC-REC-009", {"operation": "duplicate-create-only-receipt"}, rec009, expect_reject=True),
        _probe("ZC-REC-010", {"outer_metadata_variants": outer_variants},
               lambda: _outer_metadata_independent_outputs(render, receipt_storage, outer_variants), expect_reject=False),
    ]
    live = _real_fragmented_local_case()

    def historical_schema_mismatch() -> Any:
        state = _MemoryCellState(render, receipt_storage, prefix="receipt")
        state.derive_capture()
        capture = strict_object(state.reopen("capture"), "historical capture")
        capture["schema_id"] = "pw-r8-subject-capture-envelope-v2"
        state.objects["capture"] = canonical(capture) + b"\n"
        return state.derive_score()

    def historical_render_mutation() -> Any:
        state = _MemoryCellState(render, receipt_storage, prefix="receipt")
        state.objects["render"] = render[:-2] + b"X\n"
        return state.continue_zero_call()

    def historical_unsafe_stop() -> Any:
        state = _MemoryCellState(render, receipt_storage, prefix="receipt")
        classified = state.classify()
        if classified != "SEALED_REOPEN_REQUIRED":
            raise Invalid(f"stop rejected before seal at prefix: {classified}")
        return state.validate_chain()

    declared_bundle = ["README.md", "architecture_contract.json", "controller_contract.json",
                       "process_completion_contract.json", "r8_clean_room_controller.py", "r8_run_verifier.py"]
    historical_probes = [
        _probe("ZC-HIST-001-SCHEMA", {"capture_schema": "v2", "required": "v3"}, historical_schema_mismatch, expect_reject=True),
        _probe("ZC-HIST-002-OUTER-LIVE", predecessor_input,
               lambda: _predecessor_outer_completion_probe(render, receipt_storage, process_contract, {"outer_exec_exit_code": 0}), expect_reject=True),
        _probe("ZC-HIST-003-CUSTODY", {"declared": declared_bundle, "observed": declared_bundle[:-1]},
               lambda: _validate_exact_declared_files(declared_bundle[:-1], declared_bundle), expect_reject=True),
        _probe("ZC-HIST-004-RENDER-DIR", {"relative_path": f"{receipt['slot']}/renders/{receipt['cell']}.txt"},
               lambda: _validate_render_relative_path(f"{receipt['slot']}/renders/{receipt['cell']}.txt", Path(receipt["execution_root"]), receipt["slot"], receipt["cell"]), expect_reject=True),
        _probe("ZC-HIST-005-TERMINAL-LF", {"mutation": "missing_terminal_lf", "sha256": sha(render[:-1]), "bytes": len(render) - 1},
               lambda: _validate_render_bytes(render[:-1], render), expect_reject=True),
        _probe("ZC-HIST-006-POSTSTART-MUTATION", {"mutation": "render_byte_after_receipt"}, historical_render_mutation, expect_reject=True),
        _probe("ZC-HIST-007-EARLY-STOP", {"prefix": ["render", "attempt", "receipt"]}, historical_unsafe_stop, expect_reject=True),
        _probe("ZC-HIST-008-OUTER-DISCARD", {"outer_metadata_variants": list(reversed(outer_variants))},
               lambda: _outer_metadata_independent_outputs(render, receipt_storage, list(reversed(outer_variants))), expect_reject=False),
    ]
    historical = []
    for signature, source in zip(HISTORICAL_SIGNATURES, historical_probes, strict=True):
        evidence = canonical(source)
        historical.append({"signature": signature, "status": "PASS", "assertion_executed": True,
                           "probe_case_id": source["case_id"], "probe_sha256": sha(evidence),
                           "probe_bytes": len(evidence), "probe": source})
    return {
        "status": "PASS", "predecessor": predecessor, "successor": successor,
        "recovery_cases": recovery, "live_case": live,
        "historical_normalized_control_plane_signatures": historical,
        "case_count": 2 + len(recovery) + 1 + len(historical),
        "subject_calls": 0, "provider_calls": 0, "network_calls": 0,
        "filesystem_writes": 0,
    }


def preflight_report() -> dict[str, Any]:
    dependencies = _dependency_closure()
    goal_storage, goal, _ = exact_file(GOAL_ADDENDUM, "goal loop-buster addendum")
    diagnosis_storage, diagnosis, _ = exact_file(DIAGNOSIS, "clean-room diagnosis")
    if (
        sha(goal_storage) != "d3f901e724d785ba3d053a961a8559b6f5b5add7e7b660a9fbb503586ad822d0"
        or len(goal_storage) != 4468
        or goal.get("identity_family") != IDENTITY_FAMILY
        or diagnosis.get("decision") != "CLEAN_ROOM_CONTROLLER_REQUIRED"
    ):
        raise Invalid("goal-addendum or diagnosis lineage binding mismatch")
    dep_inventory = canonical(dependencies)
    (semantics, suite), observed_open = _with_observed_open_audit(
        dependencies, lambda: (_semantic_identity(), _zero_call_suite())
    )
    return {
        "schema_id": "pw-r8-deterministic-preflight-report-v13",
        "candidate_id": CANDIDATE_ID, "status": "PASS",
        "typed_result": {"type": "PASS", "fail_closed": True},
        "subject_calls": 0, "provider_calls": 0, "network_calls": 0,
        "filesystem_writes": 0, "live_plans_reads": 0,
        "goal_loop_buster_addendum": {"path": str(GOAL_ADDENDUM.relative_to(REPO)), "sha256": sha(goal_storage), "bytes": len(goal_storage)},
        "clean_room_diagnosis": {"path": str(DIAGNOSIS.relative_to(REPO)), "sha256": sha(diagnosis_storage), "bytes": len(diagnosis_storage)},
        "runtime_dependency_closure": {
            "status": "PASS", "exact_sorted_unique_files": len(dependencies),
            "inventory_sha256": sha(dep_inventory), "inventory_bytes": len(dep_inventory),
            "rows": dependencies, "live_plans_paths": [],
            "observed_open_enforcement": observed_open,
            "candidate_v12_process_controller_imported_or_executed": False,
            "candidate_v12_completion_adapter_imported_or_executed": False,
        },
        "semantic_identity": semantics,
        "completion_v3_contract": {"exact_key_count": 39, "exact_keys": list(COMPLETION_KEYS),
                                   "forbidden_outer_session_fields_present": False},
        "dispatch_attempt_contract": {"exact_key_count": 25, "exact_keys": list(DISPATCH_ATTEMPT_KEYS)},
        "zero_call_suite": suite,
        "claim_boundary": "Deterministic zero-call evidence only; no audit, freeze, launch, empirical credit, qualification, or readiness claim.",
    }


def self_test() -> dict[str, Any]:
    report = preflight_report()
    stored_path = ROOT / "deterministic_preflight_report.json"
    if stored_path.exists():
        stored, value, _ = exact_file(stored_path, "stored deterministic preflight report")
        if value != report or stored != canonical(report) + b"\n":
            raise Invalid("stored deterministic preflight report is not reproducible")
    return report


def parser() -> argparse.ArgumentParser:
    p = argparse.ArgumentParser()
    sub = p.add_subparsers(dest="command", required=True)
    for name in ("prepare-cell", "validate-prestart", "emit-capture", "score-cell", "emit-completion", "validate-cell", "recover-state"):
        q = sub.add_parser(name)
        q.add_argument("--run-id", required=True)
        q.add_argument("--execution-root", required=True)
        q.add_argument("--slot", choices=SLOTS, required=True)
        q.add_argument("--cell", required=True)
        q.add_argument("--dispatch-nonce", required=True)
    q = sub.add_parser("run-subject")
    q.add_argument("--run-id", required=True)
    q.add_argument("--execution-root", required=True)
    q.add_argument("--slot", choices=SLOTS, required=True)
    q.add_argument("--cell", required=True)
    q.add_argument("--dispatch-nonce", required=True)
    for name in ("emit-artifact", "validate-artifact"):
        q = sub.add_parser(name)
        q.add_argument("--run-id", required=True)
        q.add_argument("--execution-root", required=True)
        q.add_argument("--slot", choices=SLOTS, required=True)
        q.add_argument("--stage", choices=STAGES, required=True)
    q = sub.add_parser("validate-path")
    q.add_argument("--run-id", required=True)
    q.add_argument("--execution-root", required=True)
    q.add_argument("--slot", choices=SLOTS, required=True)
    q = sub.add_parser("validate-matrix")
    q.add_argument("--run-id", required=True)
    q.add_argument("--execution-root", required=True)
    q = sub.add_parser("validate-two-runs")
    q.add_argument("--first-execution-root", required=True)
    q.add_argument("--second-execution-root", required=True)
    sub.add_parser("self-test")
    return p


def main() -> int:
    args = parser().parse_args()
    try:
        if args.command == "self-test":
            value = self_test()
        elif args.command in ("emit-artifact", "validate-artifact"):
            value = (emit_artifact if args.command == "emit-artifact" else validate_artifact)(args.run_id, args.execution_root, args.slot, args.stage)
        elif args.command == "validate-path":
            value = validate_path(args.run_id, args.execution_root, args.slot)
        elif args.command == "validate-matrix":
            value = validate_matrix(args.run_id, args.execution_root)
        elif args.command == "validate-two-runs":
            value = validate_two_runs(args.first_execution_root, args.second_execution_root)
        else:
            common = (args.run_id, args.execution_root, args.slot, args.cell, args.dispatch_nonce)
            operations: dict[str, Callable[..., dict[str, Any]]] = {
                "prepare-cell": prepare_cell, "validate-prestart": validate_prestart,
                "emit-capture": emit_capture, "score-cell": score_cell,
                "emit-completion": emit_completion, "validate-cell": validate_cell,
                "recover-state": recover_state,
            }
            if args.command == "run-subject":
                value = run_subject(*common)
            else:
                value = operations[args.command](*common)
        sys.stdout.buffer.write(canonical(value) + b"\n")
        return 0
    except Exception as exc:
        value = {
            "schema_id": "pw-r8-clean-room-controller-error-v1", "candidate_id": CANDIDATE_ID,
            "status": "INVALID_FAIL_CLOSED", "command": args.command,
            "error_type": type(exc).__name__, "error": str(exc),
            "subject_calls": 0, "provider_calls": 0, "network_calls": 0,
            "filesystem_writes": 0, "schedule_advance_allowed": False,
            "retry_allowed": False, "replacement_allowed": False,
        }
        sys.stdout.buffer.write(canonical(value) + b"\n")
        return 2


if __name__ == "__main__":
    raise SystemExit(main())
