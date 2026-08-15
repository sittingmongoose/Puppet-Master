#!/usr/bin/env python3
"""No-write clean-room cell state machine for R8 candidate-15.

The controller emits canonical storage proposals.  A separate trusted caller
may persist those bytes create-only with apply_patch and must reopen them before
the next transition.  This module never opens a filesystem path for writing.
Self-test is closed-world and makes no subject, provider, or network call.
"""
from __future__ import annotations

import argparse
import ast
import hashlib
import importlib.util
import json
import os
from pathlib import Path
import re
import secrets
import select
import signal
import stat
import subprocess
import sys
import time
from types import ModuleType
from typing import Any, Callable

sys.dont_write_bytecode = True

CANDIDATE_ID = "PW-R8-ITERATIVE-FIX-TWO-CLEAN-RUNS-20260815.CANDIDATE-15"
IDENTITY_FAMILY = "PW-R8-ITERATIVE-FIX-TWO-CLEAN-RUNS-20260815"
REPO = Path("/mnt/Cursor/PuppetMaster")
SUCCESSOR = REPO / "tests/agent_packet_restrictions/successor_20260813"
ROOT = SUCCESSOR / "model_retest_r8_candidate_v15"
V9_ROOT = SUCCESSOR / "model_retest_r8_candidate_v9"
V9_HARNESS = V9_ROOT / "r8_harness.py"
V9_DRIVER = V9_ROOT / "r8_subject_task_driver.py"
V12_PREFLIGHT = SUCCESSOR / "model_retest_r8_candidate_v12/deterministic_preflight_report.json"
V12_PROCESS_CONTRACT = SUCCESSOR / "model_retest_r8_candidate_v12/process_completion_contract.json"
V12_A02_RENDER = SUCCESSOR / "model_retest_r8_candidate_v12_run_01/slot-alpha/rendered/S10A_DECISION_A02.txt"
V12_A02_RECEIPT = SUCCESSOR / "model_retest_r8_candidate_v12_run_01/direct_appserver_receipts/slot-alpha_S10A_DECISION_A02.json"
V14_VERIFIER = SUCCESSOR / "model_retest_r8_candidate_v14/r8_run_verifier.py"
GOAL_ADDENDUM = SUCCESSOR / "r8_goal_loop_buster_addendum_v1.json"
DIAGNOSIS = SUCCESSOR / "r8_clean_room_execution_controller_diagnosis_v1.json"
C14_AUDIT = SUCCESSOR / "model_retest_r8_candidate_v14/independent_preseal_audit.json"
C14_PROGRESS = SUCCESSOR / "r8_progress_assessment_candidate_v14_preseal_fail_v1.json"
CHECKPOINT_COMMIT = "85c2d5fd5a537f514c3ce13d15d51353156c376d"

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
TRANSACTION_CLAIM_KEYS = (
    "schema_id", "candidate_id", "run_id", "slot", "cell", "execution_root",
    "process_instance_commitment", "dispatch_nonce", "status",
)
ACK_KEYS = (
    "schema_id", "candidate_id", "run_id", "slot", "cell",
    "transaction_claim_storage_sha256", "stage", "relative_path",
    "proposal_storage_sha256", "proposal_storage_bytes", "status",
)
FREEZE_KEYS = (
    "schema_id", "candidate_id", "status", "parent_candidate_id", "checkpoint_commit",
    "goal_loop_buster_addendum", "v14_failed_audit", "v14_progress_assessment",
    "independent_preseal_audit", "audited_candidate_bundle", "runtime_dependency_closure",
    "deterministic_preflight", "qualification_contract",
)
RUN_KEYS = (
    "schema_id", "candidate_id", "run_id", "run_kind", "subject_launch_authorized",
    "launch_authorized_task_ids", "routes", "ordered_schedule_path", "ordered_schedule_storage_sha256",
    "ordered_schedule_storage_bytes", "dispatch_schedule_path",
    "dispatch_schedule_storage_sha256", "dispatch_schedule_storage_bytes",
    "candidate_freeze_manifest_path", "candidate_freeze_manifest_storage_sha256",
    "candidate_freeze_manifest_storage_bytes", "qualification_contract", "run_inventory",
    "qualification_sequence", "predecessor_run_id",
)
POST_AUDIT_BUNDLE_FILES = (
    "README.md", "architecture_contract.json", "controller_contract.json",
    "deterministic_preflight_report.json", "process_completion_contract.json",
    "r8_clean_room_controller.py", "r8_run_verifier.py", "independent_preseal_audit.json",
)
AUDIT_KEYS = (
    "schema_id", "candidate_id", "status", "verdict", "independent_decision",
    "loop_broken", "freeze_authorized", "launch_authorized", "subject_calls",
    "provider_calls", "network_calls", "candidate_byte_identity", "source_bindings",
    "blocking_findings", "nonclaims",
)
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
    harness = _module(V9_HARNESS, "pw_r8_candidate_v9_semantics_for_v14")
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
        "claim": f"transaction_claims/{slot}_{cell}.json",
        "render": f"{slot}/rendered/{cell}.txt",
        "attempt": f"dispatch_attempts/{slot}_{cell}.json",
        "receipt": f"direct_appserver_receipts/{slot}_{cell}.json",
        "capture": f"{slot}/captures/{cell}.json",
        "score": f"{slot}/scores/{cell}.json",
        "completion": f"invocation_completions/{slot}_{cell}.json",
    }
    return {name: (rel, root / rel) for name, rel in rels.items()}


def _qualification_contract() -> dict[str, Any]:
    return {
        "schema_id": "pw-r8-qualification-contract-v15",
        "candidate_id": CANDIDATE_ID,
        "run_kind": "QUALIFICATION_MATRIX",
        "route_count": 3, "subject_cells_per_route": 97, "tasks_per_run": 291,
        "qualification_runs": 2, "qualification_credit_per_complete_matrix": 1,
        "routes": {slot: {"requested_model": model, "requested_thinking": effort}
                   for slot, (model, effort) in ROUTES.items()},
        "retry_count": 0, "best_of": False, "replacement_result": False,
        "controller_invalid_extras": 0,
        "schedule_identity": "FROZEN_97_CELL_ORDER",
        "semantic_identity": "97/97_RENDER_ORACLE_SCORER_REDUCER",
    }


def _lineage_binding(path: str, digest: str, size: int) -> dict[str, Any]:
    return {"path": path, "storage_sha256": digest, "storage_bytes": size}


def _validate_freeze_static_authority(freeze: dict[str, Any]) -> dict[str, Any]:
    if tuple(freeze) != FREEZE_KEYS:
        raise Invalid("freeze manifest keys/order outside exact closed world")
    static_exact = {
        "schema_id": "pw-r8-candidate-freeze-manifest-v15", "candidate_id": CANDIDATE_ID,
        "status": "FROZEN", "parent_candidate_id": "PW-R8-ITERATIVE-FIX-TWO-CLEAN-RUNS-20260815.CANDIDATE-14",
        "checkpoint_commit": CHECKPOINT_COMMIT,
        "goal_loop_buster_addendum": _lineage_binding(
            "tests/agent_packet_restrictions/successor_20260813/r8_goal_loop_buster_addendum_v1.json",
            "d3f901e724d785ba3d053a961a8559b6f5b5add7e7b660a9fbb503586ad822d0", 4468),
        "v14_failed_audit": _lineage_binding(
            "tests/agent_packet_restrictions/successor_20260813/model_retest_r8_candidate_v14/independent_preseal_audit.json",
            "fdec429e7b7773bfc6af8f2227fa780096bada40bfcfd0832fa58bbabbce2e80", 12444),
        "v14_progress_assessment": _lineage_binding(
            "tests/agent_packet_restrictions/successor_20260813/r8_progress_assessment_candidate_v14_preseal_fail_v1.json",
            "64665b2978248edbe94b265af9e97e8987c86694fca21fc674287c381f016b61", 4882),
        "qualification_contract": _qualification_contract(),
    }
    if any(freeze.get(key) != value for key, value in static_exact.items()):
        raise Invalid("freeze static authority is stale or retagged")
    audit = freeze.get("independent_preseal_audit")
    if not isinstance(audit, dict) or tuple(audit) != ("path", "storage_sha256", "storage_bytes", "verdict", "independent_decision", "loop_broken") or audit.get("verdict") != "PRESEAL_PASS" or audit.get("independent_decision") != "LOOP_BROKEN" or audit.get("loop_broken") is not True:
        raise Invalid("freeze requires exact PRESEAL_PASS plus LOOP_BROKEN authority")
    bundle = freeze.get("audited_candidate_bundle")
    rows = bundle.get("files") if isinstance(bundle, dict) else None
    if not isinstance(bundle, dict) or tuple(bundle) != ("schema_id", "candidate_id", "file_count", "files") or bundle.get("schema_id") != "pw-r8-post-audit-candidate-bundle-v1" or bundle.get("candidate_id") != CANDIDATE_ID or bundle.get("file_count") != 8 or not isinstance(rows, list) or [row.get("path") for row in rows if isinstance(row, dict)] != list(POST_AUDIT_BUNDLE_FILES) or any(not isinstance(row, dict) or tuple(row) != ("path", "sha256", "bytes") for row in rows):
        raise Invalid("freeze post-audit bundle missing/extra/reordered/retagged")
    for key in ("runtime_dependency_closure", "deterministic_preflight"):
        if not isinstance(freeze.get(key), dict):
            raise Invalid(f"freeze missing exact {key} authority")
    return {"status": "PASS_STATIC_FREEZE_AUTHORITY"}


def _validate_freeze_manifest(manifest_rel: str, expected_sha: str, expected_bytes: int) -> tuple[bytes, dict[str, Any]]:
    if Path(manifest_rel).is_absolute() or manifest_rel != "tests/agent_packet_restrictions/successor_20260813/r8_candidate_v15_freeze_manifest.json":
        raise Invalid("freeze manifest path is not the single predeclared v15 authority")
    storage, freeze, _ = exact_file(REPO / manifest_rel, "candidate-v15 freeze manifest")
    if (sha(storage), len(storage)) != (expected_sha, expected_bytes):
        raise Invalid("freeze manifest storage binding mismatch")
    _validate_freeze_static_authority(freeze)
    exact = {
        "schema_id": "pw-r8-candidate-freeze-manifest-v15", "candidate_id": CANDIDATE_ID,
        "status": "FROZEN", "parent_candidate_id": "PW-R8-ITERATIVE-FIX-TWO-CLEAN-RUNS-20260815.CANDIDATE-14",
        "checkpoint_commit": CHECKPOINT_COMMIT,
        "goal_loop_buster_addendum": _lineage_binding(
            "tests/agent_packet_restrictions/successor_20260813/r8_goal_loop_buster_addendum_v1.json",
            "d3f901e724d785ba3d053a961a8559b6f5b5add7e7b660a9fbb503586ad822d0", 4468),
        "v14_failed_audit": _lineage_binding(
            "tests/agent_packet_restrictions/successor_20260813/model_retest_r8_candidate_v14/independent_preseal_audit.json",
            "fdec429e7b7773bfc6af8f2227fa780096bada40bfcfd0832fa58bbabbce2e80", 12444),
        "v14_progress_assessment": _lineage_binding(
            "tests/agent_packet_restrictions/successor_20260813/r8_progress_assessment_candidate_v14_preseal_fail_v1.json",
            "64665b2978248edbe94b265af9e97e8987c86694fca21fc674287c381f016b61", 4882),
        "qualification_contract": _qualification_contract(),
    }
    for key, value in exact.items():
        if freeze.get(key) != value:
            raise Invalid(f"freeze manifest exact authority mismatch: {key}")
    audit_binding = freeze.get("independent_preseal_audit")
    if not isinstance(audit_binding, dict) or tuple(audit_binding) != ("path", "storage_sha256", "storage_bytes", "verdict", "independent_decision", "loop_broken"):
        raise Invalid("freeze audit binding shape invalid")
    audit_rel = f"tests/agent_packet_restrictions/successor_20260813/model_retest_r8_candidate_v15/independent_preseal_audit.json"
    if audit_binding.get("path") != audit_rel or audit_binding.get("verdict") != "PRESEAL_PASS" or audit_binding.get("independent_decision") != "LOOP_BROKEN" or audit_binding.get("loop_broken") is not True:
        raise Invalid("freeze requires PRESEAL_PASS plus LOOP_BROKEN")
    audit_storage, audit, _ = exact_file(REPO / audit_rel, "independent PRESEAL_PASS audit")
    if (sha(audit_storage), len(audit_storage)) != (audit_binding.get("storage_sha256"), audit_binding.get("storage_bytes")):
        raise Invalid("freeze audit hash/bytes mismatch")
    if tuple(audit) != AUDIT_KEYS or audit.get("schema_id") != "pw-r8-independent-preseal-audit-v15" or audit.get("candidate_id") != CANDIDATE_ID:
        raise Invalid("independent audit outside exact v15 schema")
    audit_exact = {
        "status": "COMPLETE", "verdict": "PRESEAL_PASS", "independent_decision": "LOOP_BROKEN",
        "loop_broken": True, "freeze_authorized": True, "launch_authorized": False,
        "subject_calls": 0, "provider_calls": 0, "network_calls": 0,
        "blocking_findings": [],
    }
    if any(audit.get(key) != value for key, value in audit_exact.items()):
        raise Invalid("independent audit is not exact zero-call PRESEAL_PASS/LOOP_BROKEN")
    audited_inputs = audit.get("candidate_byte_identity")
    audited_rows = audited_inputs.get("files") if isinstance(audited_inputs, dict) else None
    if (
        not isinstance(audited_inputs, dict)
        or tuple(audited_inputs) != ("status", "files")
        or audited_inputs.get("status") != "PASS"
        or not isinstance(audited_rows, list)
        or [row.get("path") for row in audited_rows if isinstance(row, dict)] != list(POST_AUDIT_BUNDLE_FILES[:-1])
    ):
        raise Invalid("independent audit does not bind exact seven-file pre-audit candidate")
    for row in audited_rows:
        if tuple(row) != ("path", "sha256", "bytes"):
            raise Invalid("independent audit candidate row schema invalid")
        data, _ = regular(ROOT / row["path"], f"independently audited candidate {row['path']}")
        if (sha(data), len(data)) != (row["sha256"], row["bytes"]):
            raise Invalid(f"independent audit candidate binding drift: {row['path']}")
    source_bindings = audit.get("source_bindings")
    expected_source_bindings = {
        "goal_loop_buster_addendum": freeze["goal_loop_buster_addendum"],
        "v14_failed_audit": freeze["v14_failed_audit"],
        "v14_progress_assessment": freeze["v14_progress_assessment"],
        "checkpoint_commit": CHECKPOINT_COMMIT,
        "runtime_dependency_closure": freeze["runtime_dependency_closure"],
        "deterministic_preflight": freeze["deterministic_preflight"],
        "qualification_contract": freeze["qualification_contract"],
    }
    if not isinstance(source_bindings, dict) or tuple(source_bindings) != tuple(expected_source_bindings) or source_bindings != expected_source_bindings:
        raise Invalid("independent audit exact source bindings missing/extra/stale")
    bundle = freeze.get("audited_candidate_bundle")
    if not isinstance(bundle, dict) or tuple(bundle) != ("schema_id", "candidate_id", "file_count", "files"):
        raise Invalid("freeze audited bundle shape invalid")
    rows = bundle.get("files")
    if bundle.get("schema_id") != "pw-r8-post-audit-candidate-bundle-v1" or bundle.get("candidate_id") != CANDIDATE_ID or bundle.get("file_count") != 8 or not isinstance(rows, list):
        raise Invalid("freeze audited bundle identity/count invalid")
    if [row.get("path") for row in rows if isinstance(row, dict)] != list(POST_AUDIT_BUNDLE_FILES):
        raise Invalid("freeze audited bundle path order missing/extra/retagged")
    for row in rows:
        if tuple(row) != ("path", "sha256", "bytes"):
            raise Invalid("freeze audited bundle row schema invalid")
        data, _ = regular(ROOT / row["path"], f"frozen candidate bundle {row['path']}")
        if (sha(data), len(data)) != (row["sha256"], row["bytes"]):
            raise Invalid(f"freeze audited bundle drift: {row['path']}")
    if (rows[-1]["sha256"], rows[-1]["bytes"]) != (sha(audit_storage), len(audit_storage)):
        raise Invalid("freeze audit row differs from independent audit binding")
    if rows[:-1] != audited_rows:
        raise Invalid("freeze post-audit bundle differs from audit pre-audit bytes")
    architecture_storage, architecture, _ = exact_file(ROOT / "architecture_contract.json", "v14 architecture contract")
    closure_rows = architecture.get("runtime_dependency_closure")
    if not isinstance(closure_rows, list):
        raise Invalid("architecture dependency closure absent")
    closure_storage = canonical(closure_rows)
    closure = freeze.get("runtime_dependency_closure")
    expected_closure = {
        "architecture_contract_storage_sha256": sha(architecture_storage),
        "architecture_contract_storage_bytes": len(architecture_storage),
        "exact_sorted_unique_files": len(closure_rows),
        "canonical_rows_sha256": sha(closure_storage), "canonical_rows_bytes": len(closure_storage),
    }
    if not isinstance(closure, dict) or tuple(closure) != tuple(expected_closure) or closure != expected_closure:
        raise Invalid("freeze exact dependency closure binding mismatch")
    preflight_storage, preflight, _ = exact_file(ROOT / "deterministic_preflight_report.json", "v14 deterministic preflight")
    preflight_binding = freeze.get("deterministic_preflight")
    expected_preflight = {
        "path": "deterministic_preflight_report.json", "storage_sha256": sha(preflight_storage),
        "storage_bytes": len(preflight_storage), "typed_result": "PASS",
    }
    if not isinstance(preflight_binding, dict) or tuple(preflight_binding) != tuple(expected_preflight) or preflight_binding != expected_preflight or preflight.get("typed_result") != {"type": "PASS", "fail_closed": True}:
        raise Invalid("freeze deterministic preflight binding mismatch")
    return storage, freeze


def _expected_run_inventory(run_id: str, entries: list[dict[str, Any]]) -> dict[str, Any]:
    tasks: list[dict[str, Any]] = []
    for entry in entries:
        slot, cell, nonce = entry["slot"], entry["cell"], entry["dispatch_nonce"]
        paths = _paths(Path("<execution-root>"), slot, cell)
        tasks.append({
            "task_id": f"{run_id}:{slot}:{cell}", "slot": slot, "cell": cell,
            "dispatch_nonce": nonce,
            "transaction_claim_relative_path": paths["claim"][0],
            "rendered_relative_path": paths["render"][0],
            "dispatch_attempt_relative_path": paths["attempt"][0],
            "receipt_relative_path": paths["receipt"][0],
            "capture_relative_path": paths["capture"][0],
            "score_relative_path": paths["score"][0],
            "completion_relative_path": paths["completion"][0],
        })
    return {
        "schema_id": "pw-r8-exact-run-inventory-v1", "candidate_id": CANDIDATE_ID,
        "run_id": run_id, "task_count": 291, "controller_invalid_extras": 0,
        "tasks": tasks,
    }


def _validate_run_root_inventory(root: Path, inventory: dict[str, Any]) -> None:
    allowed = {"run_contract.json", "ordered_schedule.json", "dispatch_schedule.json"}
    for task in inventory["tasks"]:
        allowed.update({
            task["transaction_claim_relative_path"], task["rendered_relative_path"],
            task["dispatch_attempt_relative_path"], task["receipt_relative_path"],
            task["capture_relative_path"], task["score_relative_path"],
            task["completion_relative_path"],
        })
    allowed.update(f"{slot}/artifacts/{stage}.json" for slot in SLOTS for stage in STAGES)
    observed: list[str] = []
    for path in root.rglob("*"):
        if path.is_symlink():
            raise Invalid("run root contains symlink")
        if path.is_file():
            observed.append(str(path.relative_to(root)))
    extras = sorted(set(observed) - allowed)
    if extras:
        raise Invalid(f"run root contains controller-invalid extras: {extras}")


def _load_controls(root: Path, run_id: str, slot: str, cell: str, nonce: str) -> dict[str, Any]:
    if not RUN_ID_RE.fullmatch(run_id) or slot not in SLOTS or not CELL_RE.fullmatch(cell) or not HEX64_RE.fullmatch(nonce):
        raise Invalid("invalid run/slot/cell/dispatch nonce")
    run_storage, run, _ = exact_file(root / "run_contract.json", "run contract")
    ordered_storage, ordered, _ = exact_file(root / "ordered_schedule.json", "ordered schedule")
    dispatch_storage, dispatch, _ = exact_file(root / "dispatch_schedule.json", "dispatch schedule")
    if tuple(run) != RUN_KEYS or run.get("schema_id") != "pw-r8-run-contract-v15":
        raise Invalid("run contract keys/order outside exact v15 closed world")
    if run.get("candidate_id") != CANDIDATE_ID or run.get("run_id") != run_id or run.get("run_kind") not in ("ZERO_CREDIT_CANARY", "QUALIFICATION_MATRIX") or run.get("subject_launch_authorized") is not True:
        raise Invalid("run identity/kind/launch authority invalid")
    expected_routes = {s: {"requested_model": ROUTES[s][0], "requested_thinking": ROUTES[s][1]} for s in SLOTS}
    if run.get("routes") != expected_routes or run.get("qualification_contract") != _qualification_contract():
        raise Invalid("run route or qualification contract changed")
    if (run.get("ordered_schedule_path"), run.get("ordered_schedule_storage_sha256"), run.get("ordered_schedule_storage_bytes")) != ("ordered_schedule.json", sha(ordered_storage), len(ordered_storage)):
        raise Invalid("run ordered-schedule binding mismatch")
    if (run.get("dispatch_schedule_path"), run.get("dispatch_schedule_storage_sha256"), run.get("dispatch_schedule_storage_bytes")) != ("dispatch_schedule.json", sha(dispatch_storage), len(dispatch_storage)):
        raise Invalid("run dispatch-schedule binding mismatch")
    freeze_storage, freeze = _validate_freeze_manifest(
        run.get("candidate_freeze_manifest_path"),
        run.get("candidate_freeze_manifest_storage_sha256"),
        run.get("candidate_freeze_manifest_storage_bytes"),
    )
    cells = schedule()
    expected_ordered = {"schema_id": "pw-r8-ordered-schedule-v2", "candidate_id": CANDIDATE_ID, "run_id": run_id, "cells": list(cells)}
    if tuple(ordered) != tuple(expected_ordered) or ordered != expected_ordered:
        raise Invalid("ordered schedule changed from frozen exact 97 cells")
    if tuple(dispatch) != ("schema_id", "candidate_id", "run_id", "nonce_encoding", "entry_count", "entries"):
        raise Invalid("dispatch schedule keys/order changed")
    entries = dispatch.get("entries")
    pairs = [(s, c) for s in SLOTS for c in cells]
    if dispatch.get("schema_id") != "pw-r8-dispatch-schedule-v1" or dispatch.get("candidate_id") != CANDIDATE_ID or dispatch.get("run_id") != run_id or dispatch.get("nonce_encoding") != "lowercase-hex-256" or dispatch.get("entry_count") != 291 or not isinstance(entries, list) or len(entries) != 291:
        raise Invalid("dispatch schedule identity/count invalid")
    nonces: list[str] = []
    for entry, pair in zip(entries, pairs, strict=True):
        if not isinstance(entry, dict) or tuple(entry) != ("slot", "cell", "dispatch_nonce") or (entry.get("slot"), entry.get("cell")) != pair or not HEX64_RE.fullmatch(str(entry.get("dispatch_nonce"))):
            raise Invalid("dispatch schedule row/order/nonce invalid")
        nonces.append(entry["dispatch_nonce"])
    if len(nonces) != len(set(nonces)):
        raise Invalid("dispatch nonces are not unique within run")
    mapping = {(entry["slot"], entry["cell"]): entry["dispatch_nonce"] for entry in entries}
    if mapping[(slot, cell)] != nonce:
        raise Invalid("dispatch nonce differs from exact scheduled task")
    expected_inventory = _expected_run_inventory(run_id, entries)
    if run.get("run_inventory") != expected_inventory or tuple(run["run_inventory"]) != tuple(expected_inventory):
        raise Invalid("run inventory missing/extra/reordered/retagged/stale")
    task_ids = [task["task_id"] for task in expected_inventory["tasks"]]
    if len(task_ids) != len(set(task_ids)):
        raise Invalid("run task identities are not unique")
    if run["run_kind"] == "ZERO_CREDIT_CANARY":
        expected_authorized = [f"{run_id}:{slot}:{cells[0]}" for slot in SLOTS]
    else:
        expected_authorized = task_ids
    if run.get("launch_authorized_task_ids") != expected_authorized:
        raise Invalid("run launch-authorized task list missing/extra/reordered")
    authorized_set = set(expected_authorized)
    for task in expected_inventory["tasks"]:
        if task["task_id"] in authorized_set:
            continue
        evidence_paths = [root / value for key, value in task.items() if key.endswith("_relative_path")]
        if any(path.exists() for path in evidence_paths):
            raise Invalid("zero-credit canary contains evidence for unauthorized task")
    sequence, predecessor = run.get("qualification_sequence"), run.get("predecessor_run_id")
    if (
        type(sequence) is not int
        or (run["run_kind"] == "ZERO_CREDIT_CANARY" and (sequence != 0 or predecessor is not None))
        or (run["run_kind"] == "QUALIFICATION_MATRIX" and (sequence not in (1, 2) or (sequence == 1 and predecessor is not None) or (sequence == 2 and (not isinstance(predecessor, str) or not RUN_ID_RE.fullmatch(predecessor) or predecessor == run_id))))
    ):
        raise Invalid("qualification sequence/predecessor invalid")
    _validate_run_root_inventory(root, expected_inventory)
    return {
        "run": run, "run_storage": run_storage, "freeze": freeze, "freeze_storage": freeze_storage,
        "ordered": ordered, "ordered_storage": ordered_storage, "dispatch": dispatch,
        "dispatch_storage": dispatch_storage, "cells": cells, "entries": entries,
        "ordered_index": cells.index(cell),
        "launch_authorized": f"{run_id}:{slot}:{cell}" in expected_authorized,
    }


def _validate_transaction_claim(claim: dict[str, Any], storage: bytes, root: Path,
                                run_id: str, slot: str, cell: str, nonce: str) -> None:
    expected = {
        "schema_id": "pw-r8-run-cell-transaction-claim-v1", "candidate_id": CANDIDATE_ID,
        "run_id": run_id, "slot": slot, "cell": cell, "execution_root": str(root),
        "dispatch_nonce": nonce, "status": "SINGLE_LIVE_PROCESS_OWNS_LAUNCH",
    }
    if tuple(claim) != TRANSACTION_CLAIM_KEYS or canonical(claim) + b"\n" != storage:
        raise Invalid("transaction claim exact schema/storage mismatch")
    for key, value in expected.items():
        if claim.get(key) != value:
            raise Invalid(f"transaction claim field mismatch: {key}")
    if not HEX64_RE.fullmatch(str(claim.get("process_instance_commitment"))):
        raise Invalid("transaction claim process commitment invalid")


def _full_chain_reopen(root: Path, run_id: str, slot: str, cell: str, nonce: str,
                       controls: dict[str, Any], *, require_pass: bool) -> dict[str, Any]:
    paths = _paths(root, slot, cell)
    claim_storage, claim, _ = exact_file(paths["claim"][1], f"transaction claim {slot}/{cell}")
    _validate_transaction_claim(claim, claim_storage, root, run_id, slot, cell, nonce)
    render, _ = regular(paths["render"][1], f"render {slot}/{cell}")
    expected_render, _ = semantic_module().render(cell, slot, root)
    _validate_render_bytes(render, expected_render)
    attempt_storage, attempt, _ = exact_file(paths["attempt"][1], f"attempt {slot}/{cell}")
    _validate_attempt(attempt, attempt_storage, _expected_attempt(root, run_id, slot, cell, nonce, controls, render))
    receipt_storage, receipt, _ = exact_file(paths["receipt"][1], f"receipt {slot}/{cell}")
    _validate_receipt(receipt, receipt_storage, root, slot, cell, run_id, nonce, controls, render,
                      validate_rollout=True, validate_causal=False)
    capture_storage, capture, _ = exact_file(paths["capture"][1], f"capture {slot}/{cell}")
    expected_capture = _capture_from_receipt(receipt, receipt_storage)
    if tuple(capture) != CAPTURE_KEYS or capture != expected_capture or capture_storage != canonical(expected_capture) + b"\n":
        raise Invalid("full-chain capture-v3 recomputation mismatch")
    score_storage, score, _ = exact_file(paths["score"][1], f"score {slot}/{cell}")
    expected_score = _score_from_capture(CANDIDATE_ID, cell, slot, root, capture)
    if score != expected_score or score_storage != canonical(expected_score) + b"\n":
        raise Invalid("full-chain scorer recomputation mismatch")
    completion_storage, completion, _ = exact_file(paths["completion"][1], f"completion {slot}/{cell}")
    expected_completion = _completion_from_members(
        root, run_id, slot, cell, nonce, attempt_storage, render, receipt_storage,
        receipt, capture_storage, score_storage, score)
    if tuple(completion) != COMPLETION_KEYS or completion != expected_completion or completion_storage != canonical(expected_completion) + b"\n" or set(completion) & FORBIDDEN_COMPLETION_FIELDS:
        raise Invalid("full-chain completion-v3 recomputation mismatch")
    if require_pass and score.get("verdict") != "PASS":
        raise Invalid("causal prior cell is not a fully recomputed PASS")
    return {
        "completion": completion, "completion_storage": completion_storage,
        "score_verdict": score["verdict"], "thread_id": receipt["thread_id"],
        "turn_id": receipt["turn_id"], "rollout_path": receipt["rollout_path"],
        "dispatch_nonce": nonce, "claim_storage_sha256": sha(claim_storage),
    }


def _causal_admission(root: Path, run_id: str, slot: str, cell: str, controls: dict[str, Any], *, enforce_no_downstream: bool = True, include_current_receipt: bool = False) -> dict[str, Any]:
    index = controls["ordered_index"]
    cells = controls["cells"]
    nonce_map = {(row["slot"], row["cell"]): row["dispatch_nonce"] for row in controls["entries"]}
    for prior in cells[:index]:
        _full_chain_reopen(root, run_id, slot, prior, nonce_map[(slot, prior)], controls, require_pass=True)
    if enforce_no_downstream:
        for later in cells[index + 1:]:
            if any(path.exists() for _name, (_rel, path) in _paths(root, slot, later).items()):
                raise Invalid("downstream evidence exists before current scheduled cell")
    thread_ids: list[str] = []
    turn_ids: list[str] = []
    rollout_paths: list[str] = []
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
            rollout_path = value.get("rollout_path")
            if not isinstance(rollout_path, str) or not rollout_path:
                raise Invalid("existing receipt lacks rollout identity")
            rollout_paths.append(rollout_path)
    if len(thread_ids) != len(set(thread_ids)) or len(turn_ids) != len(set(turn_ids)) or len(rollout_paths) != len(set(rollout_paths)):
        raise Invalid("thread, turn, or rollout identity reused within run")
    return {"prior_pass_count": index, "thread_ids": thread_ids, "turn_ids": turn_ids,
            "rollout_paths": rollout_paths}


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




def _admission(root: Path, run_id: str, slot: str, cell: str, nonce: str, controls: dict[str, Any],
               *, causal_override: dict[str, Any] | None = None) -> dict[str, Any]:
    causal = _causal_admission(root, run_id, slot, cell, controls) if causal_override is None else causal_override
    return {
        "schema_id": "pw-r8-cell-admission-v5", "candidate_id": CANDIDATE_ID,
        "run_id": run_id, "candidate_freeze_manifest": {
            "path": controls["run"]["candidate_freeze_manifest_path"],
            "storage_sha256": controls["run"]["candidate_freeze_manifest_storage_sha256"],
            "storage_bytes": controls["run"]["candidate_freeze_manifest_storage_bytes"],
            "audited_candidate_bundle": controls["freeze"]["audited_candidate_bundle"],
        },
        "dispatch_schedule": {
            "path": "dispatch_schedule.json", "storage_sha256": sha(controls["dispatch_storage"]),
            "storage_bytes": len(controls["dispatch_storage"]),
        },
        "dispatch_nonce": nonce, "slot": slot, "cell": cell,
        "ordered_index": controls["ordered_index"], "status": "ADMIT_ONE_FRESH_FIRST_ATTEMPT",
        "prior_pass_count": causal["prior_pass_count"], "preserved_no_start_controller_invalid_count": 0,
        "other_slot_path_terminals_do_not_block": True, "root_terminal_phase_started": False,
        "retry": False, "best_of": False, "replacement": False,
    }


def _transaction_claim(root: Path, run_id: str, slot: str, cell: str, nonce: str,
                       process_secret: bytes) -> dict[str, Any]:
    commitment_input = process_secret + canonical({
        "candidate_id": CANDIDATE_ID, "run_id": run_id, "slot": slot, "cell": cell,
        "execution_root": str(root), "dispatch_nonce": nonce,
    })
    values = {
        "schema_id": "pw-r8-run-cell-transaction-claim-v1", "candidate_id": CANDIDATE_ID,
        "run_id": run_id, "slot": slot, "cell": cell, "execution_root": str(root),
        "process_instance_commitment": sha(commitment_input), "dispatch_nonce": nonce,
        "status": "SINGLE_LIVE_PROCESS_OWNS_LAUNCH",
    }
    return {key: values[key] for key in TRANSACTION_CLAIM_KEYS}


def _launch_prefix_guard(present: list[str]) -> dict[str, Any]:
    if present:
        if "attempt" in present and "receipt" not in present:
            raise Invalid("permanent invalid: durable attempt without receipt can never relaunch")
        raise Invalid("run-cell is new-cell-only; existing transaction/evidence must use zero-call recovery")
    return {"status": "PASS_NEW_CELL_NO_REUSABLE_LAUNCH_SURFACE"}


def _run_cell_entry_guard(root: Path, slot: str, cell: str) -> dict[str, Any]:
    paths = _paths(root, slot, cell)
    present = [name for name, (_rel, path) in paths.items() if path.exists()]
    return _launch_prefix_guard(present)


def _emit_interactive(value: dict[str, Any]) -> None:
    sys.stdout.buffer.write(canonical(value) + b"\n")
    sys.stdout.buffer.flush()


def _proposal_ack(root: Path, run_id: str, slot: str, cell: str, claim_sha: str,
                  stage: str, relative_path: str, storage: bytes) -> dict[str, Any]:
    proposal = _write_proposal(relative_path, storage)
    _emit_interactive({
        "schema_id": "pw-r8-run-cell-proposal-v1", "candidate_id": CANDIDATE_ID,
        "event": "CREATE_ONLY_APPLY_PATCH_PROPOSAL", "run_id": run_id, "slot": slot,
        "cell": cell, "transaction_claim_storage_sha256": claim_sha,
        "stage": stage, "proposal": proposal,
        "subject_calls": 0, "provider_calls": 0, "network_calls": 0, "filesystem_writes": 0,
    })
    line = sys.stdin.buffer.readline()
    if not line:
        raise Invalid(f"interactive ACK missing after {stage}")
    ack = strict_object(line, f"interactive {stage} ACK")
    expected = {
        "schema_id": "pw-r8-run-cell-apply-patch-ack-v1", "candidate_id": CANDIDATE_ID,
        "run_id": run_id, "slot": slot, "cell": cell,
        "transaction_claim_storage_sha256": claim_sha, "stage": stage,
        "relative_path": relative_path, "proposal_storage_sha256": sha(storage),
        "proposal_storage_bytes": len(storage), "status": "APPLIED_CREATE_ONLY_AND_REOPEN_REQUESTED",
    }
    if tuple(ack) != ACK_KEYS or ack != expected:
        raise Invalid(f"interactive {stage} ACK exact cryptographic contract mismatch")
    reopened, _ = regular(root / relative_path, f"interactive {stage} durable reopen")
    if reopened != storage or (sha(reopened), len(reopened)) != (ack["proposal_storage_sha256"], ack["proposal_storage_bytes"]):
        raise Invalid(f"interactive {stage} ACK does not match durable reopened bytes")
    return ack


def run_cell(run_id: str, root_value: str, slot: str, cell: str, nonce: str,
             timeout_seconds: float = 600.0) -> dict[str, Any]:
    """One non-resumable live process owns claim -> attempt -> call -> completion."""
    root = execution_root(root_value)
    controls = _load_controls(root, run_id, slot, cell, nonce)
    if controls["launch_authorized"] is not True:
        raise Invalid("exact run contract does not authorize this task")
    _run_cell_entry_guard(root, slot, cell)
    causal = _causal_admission(root, run_id, slot, cell, controls)
    paths = _paths(root, slot, cell)
    process_secret = secrets.token_bytes(32)
    claim = _transaction_claim(root, run_id, slot, cell, nonce, process_secret)
    claim_storage = canonical(claim) + b"\n"
    claim_sha = sha(claim_storage)
    _proposal_ack(root, run_id, slot, cell, claim_sha, "transaction-claim",
                  paths["claim"][0], claim_storage)
    reopened_claim_storage, reopened_claim, _ = exact_file(paths["claim"][1], "transaction claim pre-render reopen")
    if reopened_claim_storage != claim_storage:
        raise Invalid("transaction claim changed after ACK")
    _validate_transaction_claim(reopened_claim, reopened_claim_storage, root, run_id, slot, cell, nonce)

    module = semantic_module()
    render, _ = module.render(cell, slot, root)
    render_again, _ = module.render(cell, slot, root)
    if render != render_again:
        raise Invalid("independent semantic render changed")
    _validate_render_bytes(render, render_again)
    _proposal_ack(root, run_id, slot, cell, claim_sha, "render", paths["render"][0], render)

    attempt = _expected_attempt(root, run_id, slot, cell, nonce, controls, render)
    attempt_storage = canonical(attempt) + b"\n"
    _proposal_ack(root, run_id, slot, cell, claim_sha, "dispatch-attempt",
                  paths["attempt"][0], attempt_storage)
    reopened_attempt_storage, reopened_attempt, _ = exact_file(paths["attempt"][1], "attempt immediately before one call")
    _validate_attempt(reopened_attempt, reopened_attempt_storage, attempt)
    reopened_render, _ = regular(paths["render"][1], "render immediately before one call")
    _validate_render_bytes(reopened_render, render)
    _validate_transaction_claim(
        exact_file(paths["claim"][1], "claim immediately before one call")[1],
        regular(paths["claim"][1], "claim bytes immediately before one call")[0],
        root, run_id, slot, cell, nonce,
    )
    _causal_admission(root, run_id, slot, cell, controls)

    driver = _module(V9_DRIVER, "pw_r8_candidate_v9_subject_primitive_for_v14_run_cell")
    driver.CANDIDATE_ID = CANDIDATE_ID
    driver.ROUTES = dict(ROUTES)
    driver.render = lambda _slot, _cell, _root: (
        render[:-1].decode("utf-8"),
        {
            "render_storage_sha256": sha(render), "render_storage_bytes": len(render),
            "provider_visible_payload_sha256": sha(render[:-1]),
            "provider_visible_payload_bytes": len(render) - 1,
            "semantic_packet_sha256": sha(render[:-1]), "semantic_packet_bytes": len(render) - 1,
        },
    )
    driver.verify_admission = lambda *_args, **_kwargs: _admission(
        root, run_id, slot, cell, nonce, controls,
        causal_override={"prior_pass_count": causal["prior_pass_count"]},
    )
    ns = argparse.Namespace(
        run_id=run_id, execution_root=str(root), slot=slot, cell=cell,
        timeout_seconds=timeout_seconds, _phase="prestart_validated", _subject_call_started=False,
        _thread_id=None, _turn_id=None, _identities={}, _admission=None,
    )
    deferred: list[str] = []
    previous: dict[int, Any] = {}
    def handler(signum: int, _frame: Any) -> None:
        deferred.append(signal.Signals(signum).name)
    for sig in (signal.SIGINT, signal.SIGTERM):
        previous[sig] = signal.getsignal(sig)
        signal.signal(sig, handler)
    try:
        # This is the only provider-call site.  No callable resume or standalone launch exists.
        receipt = driver.execute(ns)
        receipt_storage = canonical(receipt) + b"\n"
        _validate_receipt(receipt, receipt_storage, root, slot, cell, run_id, nonce,
                          controls, render, validate_rollout=True)
        _proposal_ack(root, run_id, slot, cell, claim_sha, "receipt",
                      paths["receipt"][0], receipt_storage)

        capture = _capture_from_receipt(receipt, receipt_storage)
        capture_storage = canonical(capture) + b"\n"
        _proposal_ack(root, run_id, slot, cell, claim_sha, "capture",
                      paths["capture"][0], capture_storage)

        score = _score_from_capture(CANDIDATE_ID, cell, slot, root, capture)
        score_storage = canonical(score) + b"\n"
        _proposal_ack(root, run_id, slot, cell, claim_sha, "score",
                      paths["score"][0], score_storage)

        completion = _completion_from_members(
            root, run_id, slot, cell, nonce, attempt_storage, render, receipt_storage,
            receipt, capture_storage, score_storage, score)
        completion_storage = canonical(completion) + b"\n"
        _proposal_ack(root, run_id, slot, cell, claim_sha, "completion-v3-last",
                      paths["completion"][0], completion_storage)
        reopened = _full_chain_reopen(root, run_id, slot, cell, nonce, controls, require_pass=False)
    finally:
        for sig, old in previous.items():
            signal.signal(sig, old)
    return {
        **_terminal("run-cell", "FULL_CHAIN_ACKED_AND_REOPENED", run_id=run_id, slot=slot,
                    cell=cell, dispatch_nonce=nonce, transaction_claim_storage_sha256=claim_sha,
                    deferred_stop_signal_names=deferred, score_verdict=reopened["score_verdict"],
                    schedule_advance_allowed=False, independent_verifier_required=True,
                    persistent_state_changed=False),
        "subject_calls": 1, "provider_calls": 1, "network_calls": 1,
    }


def _validate_receipt(receipt: dict[str, Any], storage: bytes, root: Path, slot: str, cell: str,
                      run_id: str, nonce: str, controls: dict[str, Any], render: bytes,
                      *, validate_rollout: bool, validate_causal: bool = True) -> None:
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
    if validate_causal:
        causal = _causal_admission(root, run_id, slot, cell, controls, enforce_no_downstream=False)
        if receipt["thread_id"] in causal["thread_ids"] or receipt["turn_id"] in causal["turn_ids"] or receipt.get("rollout_path") in causal["rollout_paths"]:
            raise Invalid("receipt-v4 reuses a prior thread, turn, or rollout identity")
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
    expected_admission = _admission(
        root, run_id, slot, cell, nonce, controls,
        causal_override={"prior_pass_count": controls["ordered_index"]},
    )
    if receipt.get("dispatch_binding") != binding or not isinstance(admission, dict) or tuple(admission) != admission_keys or admission != expected_admission:
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
    controls = _load_controls(root, run_id, slot, cell, nonce)
    reopened = _full_chain_reopen(root, run_id, slot, cell, nonce, controls, require_pass=False)
    return _terminal("validate-cell", "PASS_FULL_CHAIN_REOPENED_CONTROLLER_DIAGNOSTIC_ONLY", run_id=run_id,
                     slot=slot, cell=cell, score_verdict=reopened["score_verdict"],
                     completion_storage_sha256=sha(reopened["completion_storage"]),
                     completion_storage_bytes=len(reopened["completion_storage"]),
                     schedule_advance_allowed=False, independent_verifier_required=True,
                     persistent_state_changed=False)


def recover_state(run_id: str, root_value: str, slot: str, cell: str, nonce: str) -> dict[str, Any]:
    root = execution_root(root_value)
    _load_controls(root, run_id, slot, cell, nonce)
    paths = _paths(root, slot, cell)
    exists = {name: path.exists() for name, (_rel, path) in paths.items()}
    if exists["completion"]:
        validated = validate_cell(run_id, str(root), slot, cell, nonce)
        return _terminal("recover-state", "SEALED_VALID_REOPENED", run_id=run_id, slot=slot, cell=cell,
                         next_command=None, schedule_advance_allowed=False,
                         independent_verifier_required=True,
                         persistent_state_changed=False)
    if (exists["claim"] or exists["attempt"]) and not exists["receipt"]:
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
    if not any(exists.values()):
        return _terminal("recover-state", "READY_FOR_NEW_INTERACTIVE_RUN_CELL", run_id=run_id, slot=slot,
                         cell=cell, next_command="run-cell", schedule_advance_allowed=False,
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
    raise Invalid("authoritative path validation exists only in independent r8_run_verifier.py")


def validate_matrix(run_id: str, root_value: str) -> dict[str, Any]:
    raise Invalid("authoritative matrix validation exists only in independent r8_run_verifier.py")


def validate_two_runs(first_root_value: str, second_root_value: str) -> dict[str, Any]:
    raise Invalid("authoritative two-run validation exists only in independent r8_run_verifier.py")


def _static_control_surface() -> dict[str, Any]:
    controller_storage, _ = regular(ROOT / "r8_clean_room_controller.py", "controller source")
    verifier_storage, _ = regular(ROOT / "r8_run_verifier.py", "independent verifier source")
    controller_tree = ast.parse(controller_storage.decode("utf-8"))
    verifier_tree = ast.parse(verifier_storage.decode("utf-8"))
    controller_defs = {node.name for node in controller_tree.body if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef))}
    verifier_defs = {node.name for node in verifier_tree.body if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef))}
    if "run_cell" not in controller_defs or {"run_subject", "prepare_cell", "validate_prestart"} & controller_defs:
        raise Invalid("controller exposes reusable or split launch surface")
    provider_sites = [
        node for node in ast.walk(controller_tree)
        if isinstance(node, ast.Call) and isinstance(node.func, ast.Attribute)
        and isinstance(node.func.value, ast.Name) and node.func.value.id == "driver"
        and node.func.attr == "execute"
    ]
    if len(provider_sites) != 1:
        raise Invalid("controller must contain exactly one provider-call site")
    required_verifier = {"validate_cell", "validate_artifact", "validate_path", "validate_matrix", "validate_two_runs"}
    if not required_verifier <= verifier_defs:
        raise Invalid("independent verifier decision functions absent")
    required_boundary = {
        "_scan_execution_root", "_assert_inventory_rows", "_terminal_inventory",
        "_confirm_inventory_stable", "_consume_inventory", "_recompute_artifact",
    }
    if not required_boundary <= verifier_defs:
        raise Invalid("independent exact-prefix verifier boundary functions absent")
    for node in ast.walk(verifier_tree):
        if isinstance(node, (ast.Import, ast.ImportFrom)):
            names = [alias.name for alias in node.names]
            if any("r8_clean_room_controller" in name for name in names) or (isinstance(node, ast.ImportFrom) and node.module and "r8_clean_room_controller" in node.module):
                raise Invalid("verifier imports controller")
    return {
        "status": "PASS", "controller_provider_call_sites": 1,
        "standalone_run_subject_present": False, "split_prepare_or_prestart_present": False,
        "verifier_imports_controller": False,
        "independent_authoritative_functions": sorted(required_verifier),
        "independent_exact_prefix_functions": sorted(required_boundary),
        "controller_source_sha256": sha(controller_storage), "controller_source_bytes": len(controller_storage),
        "verifier_source_sha256": sha(verifier_storage), "verifier_source_bytes": len(verifier_storage),
    }


def _dependency_closure() -> list[dict[str, Any]]:
    storage, architecture, _ = exact_file(ROOT / "architecture_contract.json", "architecture contract")
    if architecture.get("schema_id") != "pw-r8-clean-room-architecture-contract-v15" or architecture.get("candidate_id") != CANDIDATE_ID:
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
    harness = _module(V9_HARNESS, "pw_r8_candidate_v9_preflight_for_v14")
    v9 = harness.preflight()
    module = harness.semantic_module(candidate_identity=False)
    cells = tuple(module.SUBJECT_CELLS)
    if list(cells) != v12.get("exact_subject_cell_schedule") or len(cells) != 97:
        raise Invalid("candidate-v15 schedule differs from frozen v12")
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
        self.paths = {name: rel for name, (rel, _path) in _paths(self.root, self.slot, self.cell).items() if name != "claim"}
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
    render, _ = regular(V12_A02_RENDER, "v12 A02 render for live outer session")
    receipt_storage, _ = regular(V12_A02_RECEIPT, "v12 A02 receipt for fragmented emitter")
    encoded = receipt_storage.hex()
    script = (
        "import sys,time,signal;seen=[];release=[];signal.signal(signal.SIGTERM,lambda s,f:seen.append(s));"
        "signal.signal(signal.SIGUSR1,lambda s,f:release.append(s));d=bytes.fromhex(" + repr(encoded) + ");"
        "n=len(d)//3;sys.stdout.buffer.write(d[:n]);sys.stdout.buffer.flush();"
        "deadline=time.monotonic()+5;"
        "\nwhile not seen and time.monotonic()<deadline: time.sleep(.005)"
        "\nif not seen: sys.exit(42)"
        "\nsys.stdout.buffer.write(d[n:2*n]);sys.stdout.buffer.flush();deadline=time.monotonic()+5;"
        "\nwhile not release and time.monotonic()<deadline: time.sleep(.005)"
        "\nif not release: sys.exit(43)"
        "\n"
        "sys.stdout.buffer.write(d[2*n:]);sys.stdout.buffer.flush()"
    )
    proc = subprocess.Popen([sys.executable, "-B", "-c", script], stdin=subprocess.DEVNULL,
                            stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    assert proc.stdout is not None
    fragments: list[bytes] = []
    live_polls = 0
    outer_yields = 0
    signal_sent = False
    release_sent = False
    while True:
        ready, _, _ = select.select([proc.stdout], [], [], 0.025)
        if ready:
            piece = os.read(proc.stdout.fileno(), max(1, len(receipt_storage) // 3))
            if piece:
                fragments.append(piece)
                if not signal_sent:
                    proc.send_signal(signal.SIGTERM)
                    signal_sent = True
        elif signal_sent and len(fragments) >= 2 and not release_sent and proc.poll() is None:
            outer_yields += 1
            proc.send_signal(signal.SIGUSR1)
            release_sent = True
        if proc.poll() is not None:
            tail = proc.stdout.read()
            if tail:
                fragments.append(tail)
            break
        live_polls += 1
    stderr = proc.stderr.read() if proc.stderr is not None else b""
    assembled = b"".join(fragments)
    if proc.returncode != 0 or assembled != receipt_storage or live_polls < 1 or outer_yields < 1 or len(fragments) < 3 or not signal_sent or not release_sent:
        raise Invalid("real delayed fragmented local receipt emitter failed")
    recovered_state, recovered = _memory_full_recovery(render, assembled)
    if recovered_state.classify() != "SEALED_REOPEN_REQUIRED" or recovered["subject_calls"] != 0:
        raise Invalid("live yielded outer session did not reach exact zero-call full-chain reopen")
    return {
        "case_id": "ZC-LIVE-001", "status": "PASS", "local_child_exit_code": proc.returncode,
        "stdout_fragment_count_at_least_three": len(fragments) >= 3,
        "internal_live_wait_observed": live_polls >= 1,
        "outer_exec_session_yielded_while_live": outer_yields >= 1,
        "outer_exec_session_yield_count_at_least_one": outer_yields >= 1,
        "outer_exec_terminal_observed_after_yield": proc.returncode == 0,
        "receipt_storage_sha256": sha(assembled), "receipt_storage_bytes": len(assembled),
        "stderr_sha256": sha(stderr), "stderr_bytes": len(stderr),
        "sigterm_injected_during_fragmented_lifetime": signal_sent,
        "sigterm_deferred_through_exact_receipt_completion": proc.returncode == 0 and assembled == receipt_storage,
        "capture_storage_sha256": recovered["capture_storage_sha256"],
        "capture_storage_bytes": recovered["capture_storage_bytes"],
        "score_storage_sha256": recovered["score_storage_sha256"],
        "score_storage_bytes": recovered["score_storage_bytes"],
        "completion_storage_sha256": recovered["completion_storage_sha256"],
        "completion_storage_bytes": recovered["completion_storage_bytes"],
        "full_chain_reopen_status": recovered["status"],
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


def _reject_receipt_identity_replay(receipt: dict[str, Any], *, thread_ids: set[str],
                                    turn_ids: set[str], rollout_paths: set[str]) -> dict[str, Any]:
    if receipt.get("thread_id") in thread_ids or receipt.get("turn_id") in turn_ids or receipt.get("rollout_path") in rollout_paths:
        raise Invalid("receipt thread/turn/rollout identity replay")
    return {"status": "PASS_UNIQUE_RECEIPT_IDENTITY"}


def _synthetic_freeze_authority() -> dict[str, Any]:
    rows = [{"path": name, "sha256": sha(name.encode("utf-8")), "bytes": len(name)}
            for name in POST_AUDIT_BUNDLE_FILES]
    return {
        "schema_id": "pw-r8-candidate-freeze-manifest-v15", "candidate_id": CANDIDATE_ID,
        "status": "FROZEN", "parent_candidate_id": "PW-R8-ITERATIVE-FIX-TWO-CLEAN-RUNS-20260815.CANDIDATE-14",
        "checkpoint_commit": CHECKPOINT_COMMIT,
        "goal_loop_buster_addendum": _lineage_binding(
            "tests/agent_packet_restrictions/successor_20260813/r8_goal_loop_buster_addendum_v1.json",
            "d3f901e724d785ba3d053a961a8559b6f5b5add7e7b660a9fbb503586ad822d0", 4468),
        "v14_failed_audit": _lineage_binding(
            "tests/agent_packet_restrictions/successor_20260813/model_retest_r8_candidate_v14/independent_preseal_audit.json",
            "fdec429e7b7773bfc6af8f2227fa780096bada40bfcfd0832fa58bbabbce2e80", 12444),
        "v14_progress_assessment": _lineage_binding(
            "tests/agent_packet_restrictions/successor_20260813/r8_progress_assessment_candidate_v14_preseal_fail_v1.json",
            "64665b2978248edbe94b265af9e97e8987c86694fca21fc674287c381f016b61", 4882),
        "independent_preseal_audit": {
            "path": "tests/agent_packet_restrictions/successor_20260813/model_retest_r8_candidate_v15/independent_preseal_audit.json",
            "storage_sha256": "1" * 64, "storage_bytes": 1, "verdict": "PRESEAL_PASS",
            "independent_decision": "LOOP_BROKEN", "loop_broken": True,
        },
        "audited_candidate_bundle": {
            "schema_id": "pw-r8-post-audit-candidate-bundle-v1", "candidate_id": CANDIDATE_ID,
            "file_count": 8, "files": rows,
        },
        "runtime_dependency_closure": {"synthetic_exact_projection": True},
        "deterministic_preflight": {"synthetic_exact_projection": True},
        "qualification_contract": _qualification_contract(),
    }


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
            {"outer_exec_exit_code": 0, "outer_exec_stdout_fully_captured": True}),
        expect_reject=True)
    predecessor.update({
        "expected_failure_reproduced": "EXTERNAL_OUTER_SESSION_COMPLETION_METADATA_DISCARDED_AFTER_TERMINAL_POLL_BEFORE_CELL_SEAL",
        "same_a02_receipt_preserved": True, "schedule_advanced": False,
    })
    successor = _probe(
        "ZC-SUCC-001",
        {"prefix": "receipt", "render_sha256": sha(render), "render_bytes": len(render),
         "receipt_sha256": sha(receipt_storage), "receipt_bytes": len(receipt_storage)},
        lambda: _memory_full_recovery(render, receipt_storage)[1], expect_reject=False)
    successor.update({
        "same_receipt_storage_sha256": sha(receipt_storage), "same_receipt_storage_bytes": len(receipt_storage),
        "legacy_capture_storage_sha256": sha(capture_storage), "legacy_capture_storage_bytes": len(capture_storage),
        "legacy_score_storage_sha256": sha(score_storage), "legacy_score_storage_bytes": len(score_storage),
        "legacy_score_verdict": score["verdict"],
    })

    baseline, baseline_result = _memory_full_recovery(render, receipt_storage)

    def state_with(*members: str) -> _MemoryCellState:
        state = _MemoryCellState(render, receipt_storage, prefix="receipt")
        for name in members:
            state.create_only(name, baseline.reopen(name))
        return state

    def rec002() -> Any:
        state = _MemoryCellState(render, receipt_storage, prefix="attempt")
        classified = state.classify()
        if classified != "PERMANENT_INVALID_ATTEMPT_WITHOUT_RECEIPT_NEVER_RELAUNCH":
            raise Invalid("attempt-only prefix not permanent invalid")
        return state.continue_zero_call()

    def prefix_continue(expected_state: str, *members: str) -> dict[str, Any]:
        state = state_with(*members)
        observed = state.classify()
        if observed != expected_state:
            raise Invalid(f"prefix classifier mismatch: {observed} != {expected_state}")
        result = state.continue_zero_call()
        if result["completion_storage_sha256"] != baseline_result["completion_storage_sha256"]:
            raise Invalid("prefix recovery changed completion bytes")
        return {"classified_state": observed, **result}

    def rec006() -> dict[str, Any]:
        state = state_with("capture", "score", "completion")
        if state.classify() != "SEALED_REOPEN_REQUIRED":
            raise Invalid("completion prefix did not classify sealed")
        return state.validate_chain()

    def rec007() -> Any:
        state = state_with("capture", "score", "completion")
        capture = strict_object(state.reopen("capture"), "REC-007 capture")
        capture["driver_receipt_storage_bytes"] += 1
        state.objects["capture"] = canonical(capture) + b"\n"
        return state.validate_chain()

    def rec009() -> dict[str, Any]:
        rows: list[dict[str, Any]] = []
        mutations = (
            ("nonce", {"dispatch_nonce": "0" * 64}),
            ("route", {"requested_model": "wrong-route"}),
            ("rollout", {"rollout_storage_sha256": "0" * 64}),
        )
        for name, changes in mutations:
            state = _MemoryCellState(render, receipt_storage, prefix="receipt")
            value = dict(receipt)
            value.update(changes)
            state.objects["receipt"] = canonical(value) + b"\n"
            try:
                state.continue_zero_call()
            except Invalid as exc:
                rows.append({"variant": name, "rejected": True, "error_sha256": sha(str(exc).encode())})
            else:
                raise Invalid(f"REC-009 {name} mismatch accepted")
        try:
            _reject_receipt_identity_replay(
                receipt, thread_ids={receipt["thread_id"]}, turn_ids=set(), rollout_paths=set())
        except Invalid as exc:
            rows.append({"variant": "thread", "rejected": True, "error_sha256": sha(str(exc).encode())})
        else:
            raise Invalid("REC-009 thread replay accepted")
        if [row["variant"] for row in rows] != ["nonce", "route", "rollout", "thread"]:
            raise Invalid("REC-009 exact replay/mismatch variants not all executed")
        return {"variant_count": 4, "all_rejected": True, "rows": rows}

    outer_variants = [
        {},
        {"outer_exec_session_id": 8421, "outer_exec_poll_count": 7},
        {"outer_exec_live_session_observed": True, "outer_exec_terminal_observed": True,
         "outer_exec_exit_code": 0, "outer_exec_stdout_fully_captured": True},
    ]
    recovery = [
        _probe("ZC-REC-002", {"prefix": ["render", "attempt"], "receipt_present": False},
               rec002, expect_reject=True),
        _probe("ZC-REC-003", {"prefix": ["render", "attempt", "receipt"]},
               lambda: prefix_continue("EMIT_CAPTURE_ZERO_CALL"), expect_reject=False),
        _probe("ZC-REC-004", {"prefix": ["render", "attempt", "receipt", "capture"]},
               lambda: prefix_continue("SCORE_ZERO_CALL", "capture"), expect_reject=False),
        _probe("ZC-REC-005", {"prefix": ["render", "attempt", "receipt", "capture", "score"]},
               lambda: prefix_continue("EMIT_COMPLETION_ZERO_CALL", "capture", "score"), expect_reject=False),
        _probe("ZC-REC-006", {"prefix": "exact-completion"},
               rec006, expect_reject=False),
        _probe("ZC-REC-007", {"mutation": "capture_receipt_byte_binding"},
               rec007, expect_reject=True),
        _probe("ZC-REC-008", {"mutation": "bad-render-two-terminal-lf",
                              "storage_sha256": sha(render + b"\n"), "storage_bytes": len(render) + 1},
               lambda: _validate_render_bytes(render + b"\n", render), expect_reject=True),
        _probe("ZC-REC-009", {"variants": ["nonce", "route", "rollout", "thread"]},
               rec009, expect_reject=False),
        _probe("ZC-REC-010", {"outer_metadata_variants": outer_variants},
               lambda: _outer_metadata_independent_outputs(render, receipt_storage, outer_variants),
               expect_reject=False),
    ]
    live = _real_fragmented_local_case()

    def launch_consumption_regression() -> dict[str, Any]:
        rejected: list[str] = []
        for prefix in (["claim"], ["claim", "render", "attempt"]):
            try:
                _launch_prefix_guard(prefix)
            except Invalid:
                rejected.append("+".join(prefix))
            else:
                raise Invalid("existing transaction prefix exposed reusable run-cell launch")
        root = Path(receipt["execution_root"])
        one = _transaction_claim(root, "zero-call", receipt["slot"], receipt["cell"],
                                 receipt["dispatch_nonce"], b"A" * 32)
        two = _transaction_claim(root, "zero-call", receipt["slot"], receipt["cell"],
                                 receipt["dispatch_nonce"], b"B" * 32)
        if one["process_instance_commitment"] == two["process_instance_commitment"]:
            raise Invalid("two process instances received reusable transaction commitment")
        return {"existing_prefixes_rejected": rejected, "distinct_process_commitments": True,
                "standalone_run_subject_surface_present": False}

    def freeze_authority_regression() -> dict[str, Any]:
        base = _synthetic_freeze_authority()
        _validate_freeze_static_authority(base)
        variants: list[tuple[str, dict[str, Any]]] = []
        value = json.loads(json.dumps(base)); value["independent_preseal_audit"]["verdict"] = "PRESEAL_FAIL"; variants.append(("PRESEAL_FAIL", value))
        value = dict(base); value.pop("goal_loop_buster_addendum"); variants.append(("missing", value))
        value = dict(base); value["attacker_extra"] = True; variants.append(("extra", value))
        value = dict(reversed(list(base.items()))); variants.append(("reordered", value))
        value = json.loads(json.dumps(base)); value["candidate_id"] = "retagged"; variants.append(("retagged", value))
        value = json.loads(json.dumps(base)); value["checkpoint_commit"] = "0" * 40; variants.append(("stale", value))
        value = json.loads(json.dumps(base)); value["audited_candidate_bundle"]["files"] = value["audited_candidate_bundle"]["files"][:-1]; variants.append(("bundle-row-missing", value))
        rows: list[dict[str, Any]] = []
        for name, value in variants:
            try:
                _validate_freeze_static_authority(value)
            except Invalid as exc:
                rows.append({"variant": name, "rejected": True, "error_sha256": sha(str(exc).encode())})
            else:
                raise Invalid(f"shallow freeze variant accepted: {name}")
        return {"valid_projection_passed": True, "mutation_count": len(rows),
                "all_mutations_rejected": True, "rows": rows}

    def forged_prior_chain_regression() -> Any:
        state = state_with("capture", "score", "completion")
        state.objects["attempt"] = b"forged-non-json-attempt\n"
        return state.validate_chain()

    blocker_regressions = [
        _probe("V13-BLOCK-001-LAUNCH-CONSUMPTION", {"prefixes": ["claim", "attempt"]},
               launch_consumption_regression, expect_reject=False),
        _probe("V13-BLOCK-002-EXACT-FREEZE-AUTHORITY", {"mutation_classes": 7},
               freeze_authority_regression, expect_reject=False),
        _probe("V13-BLOCK-003-FULL-PRIOR-CHAIN", {"forged_member": "attempt-non-json"},
               forged_prior_chain_regression, expect_reject=True),
        _probe("V13-BLOCK-004-EXACT-NAMED-LIVE-SUITE", {"named_cases": [row["case_id"] for row in recovery],
                                                       "live_case": live["case_id"]},
               lambda: _require(live["full_chain_reopen_status"] == "PASS_FULL_CHAIN_REOPENED_SAFE"
                                and live["outer_exec_session_yielded_while_live"], "live full recovery missing"),
               expect_reject=False),
    ]

    def historical_schema_mismatch() -> Any:
        state = state_with("capture")
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
        raise Invalid(f"stop rejected before seal at prefix: {state.classify()}")

    declared_bundle = list(POST_AUDIT_BUNDLE_FILES)
    historical_probes = [
        _probe("ZC-HIST-001-SCHEMA", {"capture_schema": "v2", "required": "v3"},
               historical_schema_mismatch, expect_reject=True),
        _probe("ZC-HIST-002-OUTER-LIVE", predecessor_input,
               lambda: _predecessor_outer_completion_probe(render, receipt_storage, process_contract,
                                                            {"outer_exec_exit_code": 0}), expect_reject=True),
        _probe("ZC-HIST-003-CUSTODY", {"declared": declared_bundle, "observed": declared_bundle[:-1]},
               lambda: _validate_exact_declared_files(declared_bundle[:-1], declared_bundle), expect_reject=True),
        _probe("ZC-HIST-004-RENDER-DIR", {"relative_path": f"{receipt['slot']}/renders/{receipt['cell']}.txt"},
               lambda: _validate_render_relative_path(f"{receipt['slot']}/renders/{receipt['cell']}.txt",
                                                       Path(receipt["execution_root"]), receipt["slot"], receipt["cell"]),
               expect_reject=True),
        _probe("ZC-HIST-005-TERMINAL-LF", {"mutation": "missing_terminal_lf"},
               lambda: _validate_render_bytes(render[:-1], render), expect_reject=True),
        _probe("ZC-HIST-006-POSTSTART-MUTATION", {"mutation": "render_byte_after_receipt"},
               historical_render_mutation, expect_reject=True),
        _probe("ZC-HIST-007-EARLY-STOP", {"prefix": ["render", "attempt", "receipt"]},
               historical_unsafe_stop, expect_reject=True),
        _probe("ZC-HIST-008-OUTER-DISCARD", {"outer_metadata_variants": list(reversed(outer_variants))},
               lambda: _outer_metadata_independent_outputs(render, receipt_storage,
                                                            list(reversed(outer_variants))),
               expect_reject=False),
    ]
    historical: list[dict[str, Any]] = []
    for signature, source in zip(HISTORICAL_SIGNATURES, historical_probes, strict=True):
        evidence = canonical(source)
        historical.append({
            "signature": signature, "status": "PASS", "assertion_executed": True,
            "probe_case_id": source["case_id"], "probe_sha256": sha(evidence),
            "probe_bytes": len(evidence), "probe": source,
        })
    return {
        "status": "PASS", "predecessor": predecessor, "successor": successor,
        "recovery_cases": recovery, "live_case": live, "blocker_regressions": blocker_regressions,
        "historical_normalized_control_plane_signatures": historical,
        "case_count": 2 + len(recovery) + 1 + len(historical),
        "blocker_regression_count": len(blocker_regressions),
        "subject_calls": 0, "provider_calls": 0, "network_calls": 0, "filesystem_writes": 0,
    }


def _verifier_boundary_suite() -> dict[str, Any]:
    """Execute the v14 reproducer and v15 exact-prefix boundary without writes."""
    v14_storage, _ = regular(V14_VERIFIER, "preserved candidate-v14 verifier")
    if (sha(v14_storage), len(v14_storage)) != (
        "51fafee712bc8f0879bb14977824ad0ddd09bad21d76205e33a99cb2063f5557", 80711
    ):
        raise Invalid("preserved candidate-v14 verifier drift")
    v14 = _module(V14_VERIFIER, "pw_r8_v15_preserved_v14_boundary_reproducer")

    class VirtualPath:
        def __init__(self, slot: str, cell: str, member: str) -> None:
            self.key = (slot, cell, member)

        def exists(self) -> bool:
            return self.key in virtual_receipts

        def __str__(self) -> str:
            return "/virtual-v14/" + "/".join(self.key)

    run_id = "v14-boundary-reproducer"
    current, future = "A", "B"
    v14_entries = [
        {"slot": "slot-alpha", "cell": current, "dispatch_nonce": "1" * 64},
        {"slot": "slot-alpha", "cell": future, "dispatch_nonce": "2" * 64},
    ]
    v14_controls = {
        "cells": (current, future), "entries": v14_entries,
        "run": {"launch_authorized_task_ids": [f"{run_id}:slot-alpha:{current}"]},
    }
    receipt_a = {"thread_id": "thread-A", "turn_id": "turn-A", "rollout_path": "/rollouts/A.jsonl"}
    receipt_b = {"thread_id": "thread-B", "turn_id": "turn-B", "rollout_path": "/rollouts/B.jsonl"}
    virtual_receipts = {
        ("slot-alpha", current, "receipt"): canonical(receipt_a) + b"\n",
        ("slot-alpha", future, "receipt"): canonical(receipt_b) + b"\n",
    }
    opened: list[str] = []
    full_chains: list[str] = []

    def v14_paths(_root: Path, slot: str, cell: str) -> dict[str, tuple[str, VirtualPath]]:
        return {
            name: (f"{name}/{slot}_{cell}", VirtualPath(slot, cell, name))
            for name in ("claim", "render", "attempt", "receipt", "capture", "score", "completion")
        }

    def v14_exact_file(path: VirtualPath, _label: str) -> tuple[bytes, dict[str, Any], os.stat_result | None]:
        storage = virtual_receipts[path.key]
        opened.append("/".join(path.key))
        return storage, strict_object(storage, "virtual v14 receipt"), None

    def v14_full_chain(_root: Path, _run_id: str, slot: str, cell: str, nonce: str,
                       _controls: dict[str, Any], *, require_pass: bool) -> dict[str, Any]:
        full_chains.append(f"{slot}/{cell}")
        return {
            "completion_storage": canonical({"cell": cell}) + b"\n", "score_verdict": "PASS",
            "thread_id": f"thread-{cell}", "turn_id": f"turn-{cell}",
            "rollout_path": f"/rollouts/{cell}.jsonl", "dispatch_nonce": nonce,
        }

    v14.execution_root = lambda _value: Path("/virtual-v14")
    v14._run_controls = lambda _root, _run_id: v14_controls
    v14._paths = v14_paths
    v14.exact_file = v14_exact_file
    v14._full_chain_reopen = v14_full_chain
    predecessor_result = v14.validate_cell(run_id, "/virtual-v14", "slot-alpha", current)
    if (
        predecessor_result.get("status") != "PASS_FULL_CHAIN_INDEPENDENTLY_RECOMPUTED"
        or predecessor_result.get("schedule_advance_allowed") is not True
        or full_chains != ["slot-alpha/A"]
        or "slot-alpha/B/receipt" not in opened
    ):
        raise Invalid("preserved v14 future-receipt acceptance was not reproduced")
    future_receipt_storage = canonical(receipt_b) + b"\n"
    predecessor_receipt = {
        "case_id": "V14-PRED-EXACT-PREFIX-001", "typed_result": "FAIL",
        "normalized_failure_signature": "INDEPENDENT_VALIDATE_CELL_ACCEPTS_DOWNSTREAM_EVIDENCE_SMUGGLING_AND_AUTHORIZES_SCHEDULE_ADVANCE",
        "v14_verifier_sha256": sha(v14_storage), "v14_verifier_bytes": len(v14_storage),
        "future_receipt_sha256": sha(future_receipt_storage),
        "future_receipt_bytes": len(future_receipt_storage),
        "future_receipt_opened_for_identity_only": True,
        "future_chain_recomputed": False,
        "observed_status": predecessor_result["status"],
        "observed_schedule_advance_allowed": True,
        "subject_calls": 0, "provider_calls": 0, "network_calls": 0,
        "filesystem_writes": 0,
    }

    v15 = _module(ROOT / "r8_run_verifier.py", "pw_r8_v15_boundary_under_test")
    cells = tuple(v15.schedule())

    def controls_for(synthetic_run_id: str, sequence: int, predecessor_id: str | None) -> dict[str, Any]:
        entries = [
            {"slot": slot, "cell": cell,
             "dispatch_nonce": sha(f"{synthetic_run_id}|{slot}|{cell}".encode("utf-8"))}
            for slot in SLOTS for cell in cells
        ]
        run_inventory = v15._expected_run_inventory(synthetic_run_id, entries)
        run = {
            "run_id": synthetic_run_id, "run_kind": "QUALIFICATION_MATRIX",
            "launch_authorized_task_ids": [task["task_id"] for task in run_inventory["tasks"]],
            "run_inventory": run_inventory, "qualification_sequence": sequence,
            "predecessor_run_id": predecessor_id,
            "candidate_freeze_manifest_path": "synthetic-freeze.json",
            "candidate_freeze_manifest_storage_sha256": "0" * 64,
            "candidate_freeze_manifest_storage_bytes": 1,
            "qualification_contract": {"schema_id": "synthetic-v15-qualification"},
            "routes": {slot: {"requested_model": ROUTES[slot][0],
                               "requested_thinking": ROUTES[slot][1]} for slot in SLOTS},
        }
        return {"cells": cells, "entries": entries, "run": run}

    controls = controls_for("v15-boundary-run-1", 1, None)
    known, tasks = v15._known_inventory(controls)

    def files_for(control: dict[str, Any], counts: dict[str, int],
                  artifacts: dict[str, tuple[str, ...]] | None = None) -> set[str]:
        _known, task_map = v15._known_inventory(control)
        files = set(v15.CONTROL_FILES)
        artifacts = {} if artifacts is None else artifacts
        for slot in SLOTS:
            count = counts.get(slot, 0)
            files.update(path for cell in cells[:count] for path in task_map[(slot, cell)])
            stages = artifacts.get(slot, v15._due_artifacts(count))
            files.update(f"{slot}/artifacts/{stage}.json" for stage in stages)
        return files

    def rows_for(files: set[str], *, kind_overrides: dict[str, str] | None = None,
                 duplicate_relative: str | None = None,
                 malformed: bool = False) -> list[dict[str, Any]]:
        kind_overrides = {} if kind_overrides is None else kind_overrides
        rows: list[dict[str, Any]] = []
        inode = 1000
        for relative in sorted(v15._parent_directories(files)):
            rows.append({"relative_path": relative, "kind": "directory", "device": 1,
                         "inode": inode, "size": 0, "mtime_ns": 1})
            inode += 1
        for relative in sorted(files):
            rows.append({
                "relative_path": relative, "kind": kind_overrides.get(relative, "regular"),
                "device": 1, "inode": inode, "size": len(relative.encode("utf-8")),
                "mtime_ns": 1,
            })
            inode += 1
        if duplicate_relative is not None:
            duplicate = next(dict(row) for row in rows if row["relative_path"] == duplicate_relative)
            rows.append(duplicate)
        if malformed:
            rows.append({"relative_path": "malformed.json", "kind": "regular", "device": 1})
        return sorted(rows, key=lambda row: (row.get("relative_path", ""), row.get("kind", "")))

    root = Path("/virtual-v15")
    base_files = files_for(controls, {"slot-alpha": 1, "slot-bravo": 0, "slot-charlie": 0})
    future_task = tasks[("slot-alpha", cells[1])]
    receipt_index = v15.TASK_PATH_KEYS.index("receipt_relative_path")
    planted_files = set(base_files) | {future_task[receipt_index]}
    planted_rows = rows_for(planted_files)
    v15.execution_root = lambda value: Path(value)
    v15._run_controls = lambda _root, _run_id: controls
    v15._scan_execution_root = lambda _root: planted_rows
    v15._full_chain_reopen = lambda *_args, **_kwargs: (_ for _ in ()).throw(
        AssertionError("semantic consumption reached after future evidence"))
    try:
        v15.validate_cell(controls["run"]["run_id"], str(root), "slot-alpha", cells[0])
    except v15.Invalid as exc:
        successor_error = str(exc)
    else:
        raise Invalid("v15 accepted preserved v14 future-receipt counterexample")
    successor_receipt = {
        "case_id": "V15-SUCC-EXACT-PREFIX-001", "typed_result": "PASS",
        "future_receipt_sha256": sha(future_receipt_storage),
        "future_receipt_bytes": len(future_receipt_storage),
        "rejected_before_identity_collection": True,
        "rejected_before_schedule_advance": True,
        "error_type": "Invalid", "error": successor_error,
        "subject_calls": 0, "provider_calls": 0, "network_calls": 0,
        "filesystem_writes": 0,
    }

    fault_rows: list[dict[str, Any]] = []

    def execute_fault(case_id: str, rows: list[dict[str, Any]]) -> None:
        storage = canonical(rows)
        try:
            v15._terminal_inventory(root, controls, required_counts={"slot-alpha": 1}, rows=rows)
        except v15.Invalid as exc:
            error = canonical({"error_type": type(exc).__name__, "error": str(exc)})
            fault_rows.append({
                "case_id": case_id, "status": "PASS_REJECTED",
                "assertion_executed": True, "input_sha256": sha(storage),
                "input_bytes": len(storage), "output_sha256": sha(error),
                "output_bytes": len(error), "error": str(exc),
            })
        else:
            raise Invalid(f"v15 boundary fault unexpectedly accepted: {case_id}")

    later_names = (
        "claim", "render", "attempt", "receipt", "capture", "score", "completion",
    )
    for name, path in zip(later_names, future_task, strict=True):
        execute_fault(f"V15-FUTURE-{name.upper()}-REJECT", rows_for(set(base_files) | {path}))
    execute_fault(
        "V15-PREMATURE-ARTIFACT-REJECT",
        rows_for(set(base_files) | {"slot-alpha/artifacts/S10A.json"}),
    )
    wrong_slot_path = tasks[("slot-bravo", cells[0])][0]
    execute_fault("V15-WRONG-SLOT-EVIDENCE-REJECT", rows_for(set(base_files) | {wrong_slot_path}))
    execute_fault("V15-UNKNOWN-REGULAR-FILE-REJECT", rows_for(set(base_files) | {"unknown.json"}))
    execute_fault("V15-MALFORMED-INVENTORY-ROW-REJECT", rows_for(set(base_files), malformed=True))
    execute_fault(
        "V15-DUPLICATE-PATH-REJECT",
        rows_for(set(base_files), duplicate_relative=v15.CONTROL_FILES[0]),
    )
    execute_fault(
        "V15-SYMLINK-REJECT",
        rows_for(set(base_files) | {future_task[0]}, kind_overrides={future_task[0]: "symlink"}),
    )
    execute_fault(
        "V15-NONREGULAR-REJECT",
        rows_for(set(base_files) | {future_task[0]}, kind_overrides={future_task[0]: "nonregular"}),
    )

    exact_base_rows = rows_for(set(base_files))
    v15._scan_execution_root = lambda _root: exact_base_rows
    v15._full_chain_reopen = lambda *_args, **_kwargs: (_ for _ in ()).throw(
        v15.Invalid("malformed current object rejected by full-chain parser"))
    try:
        v15.validate_cell(controls["run"]["run_id"], str(root), "slot-alpha", cells[0])
    except v15.Invalid as exc:
        malformed_error = canonical({"error_type": type(exc).__name__, "error": str(exc)})
        fault_rows.append({
            "case_id": "V15-MALFORMED-CURRENT-OBJECT-REJECT", "status": "PASS_REJECTED",
            "assertion_executed": True, "input_sha256": sha(canonical(exact_base_rows)),
            "input_bytes": len(canonical(exact_base_rows)),
            "output_sha256": sha(malformed_error), "output_bytes": len(malformed_error),
            "error": str(exc),
        })
    else:
        raise Invalid("v15 accepted malformed current object")

    def fake_full_chain(_root: Path, synthetic_run_id: str, slot: str, cell: str,
                        nonce: str, _controls: dict[str, Any], *, require_pass: bool) -> dict[str, Any]:
        completion = canonical({"run_id": synthetic_run_id, "slot": slot, "cell": cell}) + b"\n"
        return {
            "completion_storage": completion, "score_verdict": "PASS",
            "thread_id": f"thread:{synthetic_run_id}:{slot}:{cell}",
            "turn_id": f"turn:{synthetic_run_id}:{slot}:{cell}",
            "rollout_path": f"/rollouts/{synthetic_run_id}/{slot}/{cell}.jsonl",
            "dispatch_nonce": nonce,
        }

    def fake_artifact(_root: Path, synthetic_run_id: str, slot: str, stage: str) -> dict[str, Any]:
        storage = canonical({"run_id": synthetic_run_id, "slot": slot, "stage": stage}) + b"\n"
        return {
            "schema_id": "pw-r8-independent-artifact-validation-v15",
            "candidate_id": CANDIDATE_ID, "status": "PASS", "run_id": synthetic_run_id,
            "slot": slot, "stage": stage, "storage_sha256": sha(storage),
            "storage_bytes": len(storage),
        }

    v15._full_chain_reopen = fake_full_chain
    v15._recompute_artifact = fake_artifact
    prefix_counts = (1, 55, 56, 58, 76, 93, 94, 95, 96, 97)
    legitimate_prefixes: list[dict[str, Any]] = []
    for count in prefix_counts:
        files = files_for(controls, {"slot-alpha": count, "slot-bravo": 0, "slot-charlie": 0})
        rows = rows_for(files)
        v15._scan_execution_root = lambda _root, rows=rows: rows
        result = v15.validate_cell(
            controls["run"]["run_id"], str(root), "slot-alpha", cells[count - 1])
        if result.get("schedule_advance_allowed") is not True:
            raise Invalid("legitimate exact cell prefix did not remain constructible")
        evidence = canonical(result)
        legitimate_prefixes.append({
            "completed_cells": count, "due_artifacts": list(v15._due_artifacts(count)),
            "status": "PASS", "result_sha256": sha(evidence), "result_bytes": len(evidence),
        })

    artifact_prefixes: list[dict[str, Any]] = []
    for artifact_index, stage in enumerate(v15.ARTIFACT_EMISSION_ORDER):
        count = v15.ARTIFACT_BOUNDARY_INDEX[stage] + 1
        artifact_prefix = v15.ARTIFACT_EMISSION_ORDER[:artifact_index + 1]
        files = files_for(
            controls, {"slot-alpha": count, "slot-bravo": 0, "slot-charlie": 0},
            {"slot-alpha": artifact_prefix},
        )
        rows = rows_for(files)
        v15._scan_execution_root = lambda _root, rows=rows: rows
        result = v15.validate_artifact(
            controls["run"]["run_id"], str(root), "slot-alpha", stage)
        evidence = canonical(result)
        artifact_prefixes.append({
            "stage": stage, "completed_cells": count, "artifact_prefix_count": artifact_index + 1,
            "status": "PASS", "result_sha256": sha(evidence), "result_bytes": len(evidence),
        })

    path_files = files_for(controls, {"slot-alpha": 97, "slot-bravo": 0, "slot-charlie": 0})
    path_rows = rows_for(path_files)
    v15._scan_execution_root = lambda _root: path_rows
    path_result = v15.validate_path(controls["run"]["run_id"], str(root), "slot-alpha")

    matrix_files = files_for(controls, {slot: 97 for slot in SLOTS})
    matrix_rows = rows_for(matrix_files)
    v15._scan_execution_root = lambda _root: matrix_rows
    matrix_result = v15.validate_matrix(controls["run"]["run_id"], str(root))

    second_controls = controls_for("v15-boundary-run-2", 2, controls["run"]["run_id"])
    first_root, second_root = Path("/virtual-v15-run-1"), Path("/virtual-v15-run-2")
    first_rows = rows_for(files_for(controls, {slot: 97 for slot in SLOTS}))
    second_rows = rows_for(files_for(second_controls, {slot: 97 for slot in SLOTS}))
    controls_by_root = {str(first_root): controls, str(second_root): second_controls}
    rows_by_root = {str(first_root): first_rows, str(second_root): second_rows}
    v15._run_controls = lambda selected_root, _run_id: controls_by_root[str(selected_root)]
    v15._scan_execution_root = lambda selected_root: rows_by_root[str(selected_root)]

    def synthetic_exact_file(path: Path, label: str) -> tuple[bytes, dict[str, Any], os.stat_result | None]:
        if path.name != "run_contract.json" or str(path.parent) not in controls_by_root:
            raise v15.Invalid(f"unexpected synthetic exact-file reopen: {label}")
        value = controls_by_root[str(path.parent)]["run"]
        return canonical(value) + b"\n", value, None

    v15.exact_file = synthetic_exact_file
    two_run_result = v15.validate_two_runs(str(first_root), str(second_root))
    constructibility = [
        {"terminal": "path", "status": path_result["status"],
         "regular_files": len(path_files), "cells": 97, "artifacts": 18},
        {"terminal": "matrix", "status": matrix_result["status"],
         "regular_files": len(matrix_files), "cells": 291, "artifacts": 54,
         "qualification_credit": matrix_result["qualification_credit"]},
        {"terminal": "two-run", "status": two_run_result["status"],
         "regular_files": len(matrix_files) * 2, "cells": 582,
         "artifacts": 108, "qualification_streak": two_run_result["qualification_streak"]},
    ]
    return {
        "status": "PASS", "predecessor_failure_receipt": predecessor_receipt,
        "successor_pass_receipt": successor_receipt,
        "fault_injections": fault_rows,
        "legitimate_cell_prefixes": legitimate_prefixes,
        "legitimate_artifact_prefixes": artifact_prefixes,
        "terminal_constructibility": constructibility,
        "case_count": 2 + len(fault_rows) + len(legitimate_prefixes) + len(artifact_prefixes) + len(constructibility),
        "subject_calls": 0, "provider_calls": 0, "network_calls": 0,
        "filesystem_writes": 0,
    }


def preflight_report() -> dict[str, Any]:
    dependencies = _dependency_closure()
    goal_storage, goal, _ = exact_file(GOAL_ADDENDUM, "goal loop-buster addendum")
    diagnosis_storage, diagnosis, _ = exact_file(DIAGNOSIS, "clean-room diagnosis")
    c14_audit_storage, _ = regular(C14_AUDIT, "failed candidate-v14 audit")
    c14_audit = preserved_object(c14_audit_storage, "failed candidate-v14 audit")
    c14_progress_storage, _ = regular(C14_PROGRESS, "candidate-v14 progress assessment")
    c14_progress = preserved_object(c14_progress_storage, "candidate-v14 progress assessment")
    if (
        sha(goal_storage) != "d3f901e724d785ba3d053a961a8559b6f5b5add7e7b660a9fbb503586ad822d0"
        or len(goal_storage) != 4468
        or goal.get("identity_family") != IDENTITY_FAMILY
        or diagnosis.get("decision") != "CLEAN_ROOM_CONTROLLER_REQUIRED"
        or (sha(c14_audit_storage), len(c14_audit_storage)) != ("fdec429e7b7773bfc6af8f2227fa780096bada40bfcfd0832fa58bbabbce2e80", 12444)
        or c14_audit.get("verdict") != "PRESEAL_FAIL"
        or (sha(c14_progress_storage), len(c14_progress_storage)) != ("64665b2978248edbe94b265af9e97e8987c86694fca21fc674287c381f016b61", 4882)
        or c14_progress.get("decision") != "CHURN_SUSPECTED"
    ):
        raise Invalid("goal-addendum or diagnosis lineage binding mismatch")
    dep_inventory = canonical(dependencies)
    (semantics, suite, boundary_suite), observed_open = _with_observed_open_audit(
        dependencies, lambda: (_semantic_identity(), _zero_call_suite(), _verifier_boundary_suite())
    )
    static_surface = _static_control_surface()
    return {
        "schema_id": "pw-r8-deterministic-preflight-report-v15",
        "candidate_id": CANDIDATE_ID, "status": "PASS",
        "typed_result": {"type": "PASS", "fail_closed": True},
        "subject_calls": 0, "provider_calls": 0, "network_calls": 0,
        "filesystem_writes": 0, "live_plans_reads": 0,
        "parent_candidate": {"candidate_id": "PW-R8-ITERATIVE-FIX-TWO-CLEAN-RUNS-20260815.CANDIDATE-14",
                             "checkpoint_commit": CHECKPOINT_COMMIT},
        "goal_loop_buster_addendum": {"path": str(GOAL_ADDENDUM.relative_to(REPO)), "sha256": sha(goal_storage), "bytes": len(goal_storage)},
        "clean_room_diagnosis": {"path": str(DIAGNOSIS.relative_to(REPO)), "sha256": sha(diagnosis_storage), "bytes": len(diagnosis_storage)},
        "v14_failed_audit": {"path": str(C14_AUDIT.relative_to(REPO)), "sha256": sha(c14_audit_storage),
                             "bytes": len(c14_audit_storage), "verdict": "PRESEAL_FAIL"},
        "v14_progress_assessment": {"path": str(C14_PROGRESS.relative_to(REPO)), "sha256": sha(c14_progress_storage),
                                    "bytes": len(c14_progress_storage), "decision": "CHURN_SUSPECTED"},
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
        "interactive_run_cell": {
            "standalone_run_subject_present": False, "single_live_process_only": True,
            "transaction_claim_exact_keys": list(TRANSACTION_CLAIM_KEYS),
            "ack_exact_keys": list(ACK_KEYS), "provider_call_sites": 1,
            "proposal_order": ["transaction-claim", "render", "dispatch-attempt", "receipt", "capture", "score", "completion-v3-last"],
            "controller_filesystem_writes": 0,
        },
        "static_control_surface": static_surface,
        "freeze_authority": {"exact_keys": list(FREEZE_KEYS), "run_exact_keys": list(RUN_KEYS),
                             "qualification_contract": _qualification_contract()},
        "zero_call_suite": suite,
        "verifier_boundary_suite": boundary_suite,
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
    for name in ("emit-capture", "score-cell", "emit-completion", "recover-state"):
        q = sub.add_parser(name)
        q.add_argument("--run-id", required=True)
        q.add_argument("--execution-root", required=True)
        q.add_argument("--slot", choices=SLOTS, required=True)
        q.add_argument("--cell", required=True)
        q.add_argument("--dispatch-nonce", required=True)
    q = sub.add_parser("run-cell")
    q.add_argument("--run-id", required=True)
    q.add_argument("--execution-root", required=True)
    q.add_argument("--slot", choices=SLOTS, required=True)
    q.add_argument("--cell", required=True)
    q.add_argument("--dispatch-nonce", required=True)
    q.add_argument("--timeout-seconds", type=float, default=600.0)
    q = sub.add_parser("emit-artifact")
    q.add_argument("--run-id", required=True)
    q.add_argument("--execution-root", required=True)
    q.add_argument("--slot", choices=SLOTS, required=True)
    q.add_argument("--stage", choices=STAGES, required=True)
    sub.add_parser("self-test")
    return p


def main() -> int:
    args = parser().parse_args()
    try:
        if args.command == "self-test":
            value = self_test()
        elif args.command == "emit-artifact":
            value = emit_artifact(args.run_id, args.execution_root, args.slot, args.stage)
        else:
            common = (args.run_id, args.execution_root, args.slot, args.cell, args.dispatch_nonce)
            operations: dict[str, Callable[..., dict[str, Any]]] = {
                "emit-capture": emit_capture, "score-cell": score_cell,
                "emit-completion": emit_completion, "recover-state": recover_state,
            }
            if args.command == "run-cell":
                value = run_cell(*common, timeout_seconds=args.timeout_seconds)
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
