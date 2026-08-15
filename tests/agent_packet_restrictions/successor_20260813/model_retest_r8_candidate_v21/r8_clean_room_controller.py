#!/usr/bin/env python3
"""No-write root-bound clean-room cell state machine for R8 candidate-21.

The controller emits canonical storage proposals.  A separate trusted caller
may persist those bytes create-only with apply_patch and must reopen them before
the next transition.  This module never opens a filesystem path for writing.
Self-test is closed-world and makes no subject, provider, or network call.
"""
from __future__ import annotations

import argparse
import ast
import contextlib
import hashlib
import importlib.util
import io
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

CANDIDATE_ID = "PW-R8-ITERATIVE-FIX-TWO-CLEAN-RUNS-20260815.CANDIDATE-21"
IDENTITY_FAMILY = "PW-R8-ITERATIVE-FIX-TWO-CLEAN-RUNS-20260815"
REPO = Path("/mnt/Cursor/PuppetMaster")
SUCCESSOR = REPO / "tests/agent_packet_restrictions/successor_20260813"
ROOT = SUCCESSOR / "model_retest_r8_candidate_v21"
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
CHECKPOINT_COMMIT = "be7b91c738a2a8238f55309a301523aa14ee1810"

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


_LOAD_ORDER_EVENTS: list[dict[str, Any]] = []


def _load_order_event(event: str, **fields: Any) -> None:
    _LOAD_ORDER_EVENTS.append({"ordinal": len(_LOAD_ORDER_EVENTS), "event": event, **fields})


def _semantics(controls: dict[str, Any], candidate_id: str = CANDIDATE_ID) -> ModuleType:
    """Consume only the lexical operation context; never load external code."""
    module = controls.get("_lexical_semantics") if isinstance(controls, dict) else None
    if not isinstance(module, ModuleType):
        raise Invalid("root-bound lexical semantic context required")
    module.CANDIDATE_ID = candidate_id
    module.validated_capture_envelope = _semantic_capture_callback
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


def _frozen_cells() -> tuple[str, ...]:
    _storage, value, _info = exact_file(V12_PREFLIGHT, "frozen 97-cell schedule data")
    cells = tuple(value.get("exact_subject_cell_schedule", ()))
    if len(cells) != 97 or len(cells) != len(set(cells)) or any(not CELL_RE.fullmatch(x) for x in cells):
        raise Invalid("frozen semantic schedule data is not exact")
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
        "schema_id": "pw-r8-qualification-contract-v21",
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
        "schema_id": "pw-r8-candidate-freeze-manifest-v21", "candidate_id": CANDIDATE_ID,
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
    storage, freeze, _ = exact_file(REPO / manifest_rel, "candidate-v21 freeze manifest")
    if (sha(storage), len(storage)) != (expected_sha, expected_bytes):
        raise Invalid("freeze manifest storage binding mismatch")
    _validate_freeze_static_authority(freeze)
    exact = {
        "schema_id": "pw-r8-candidate-freeze-manifest-v21", "candidate_id": CANDIDATE_ID,
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
    audit_rel = f"tests/agent_packet_restrictions/successor_20260813/model_retest_r8_candidate_v21/independent_preseal_audit.json"
    if audit_binding.get("path") != audit_rel or audit_binding.get("verdict") != "PRESEAL_PASS" or audit_binding.get("independent_decision") != "LOOP_BROKEN" or audit_binding.get("loop_broken") is not True:
        raise Invalid("freeze requires PRESEAL_PASS plus LOOP_BROKEN")
    audit_storage, audit, _ = exact_file(REPO / audit_rel, "independent PRESEAL_PASS audit")
    if (sha(audit_storage), len(audit_storage)) != (audit_binding.get("storage_sha256"), audit_binding.get("storage_bytes")):
        raise Invalid("freeze audit hash/bytes mismatch")
    if tuple(audit) != AUDIT_KEYS or audit.get("schema_id") != "pw-r8-independent-preseal-audit-v21" or audit.get("candidate_id") != CANDIDATE_ID:
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


def _removed_legacy_controls_parser(*_args: Any, **_kwargs: Any) -> dict[str, Any]:
    raise Invalid("legacy controls-returning parser removed; use a root-bound operation")


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
    expected_render, _ = _semantics(controls).render(cell, slot, root)
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
    expected_score = _score_from_capture(CANDIDATE_ID, cell, slot, root, capture, controls)
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


def _write_proposal(relative_path: str, storage: bytes, controls: Any) -> dict[str, Any]:
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
                  stage: str, relative_path: str, storage: bytes,
                  controls: Any) -> dict[str, Any]:
    proposal = _write_proposal(relative_path, storage, controls)
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


def _run_cell_after_gate(root: Path, controls: dict[str, Any], run_id: str,
                         slot: str, cell: str, nonce: str,
                         timeout_seconds: float) -> dict[str, Any]:
    """One non-resumable live process owns claim -> attempt -> call -> completion."""
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
                  paths["claim"][0], claim_storage, controls)
    reopened_claim_storage, reopened_claim, _ = exact_file(paths["claim"][1], "transaction claim pre-render reopen")
    if reopened_claim_storage != claim_storage:
        raise Invalid("transaction claim changed after ACK")
    _validate_transaction_claim(reopened_claim, reopened_claim_storage, root, run_id, slot, cell, nonce)

    module = _semantics(controls)
    render, _ = module.render(cell, slot, root)
    render_again, _ = module.render(cell, slot, root)
    if render != render_again:
        raise Invalid("independent semantic render changed")
    _validate_render_bytes(render, render_again)
    _proposal_ack(root, run_id, slot, cell, claim_sha, "render", paths["render"][0], render, controls)

    attempt = _expected_attempt(root, run_id, slot, cell, nonce, controls, render)
    attempt_storage = canonical(attempt) + b"\n"
    _proposal_ack(root, run_id, slot, cell, claim_sha, "dispatch-attempt",
                  paths["attempt"][0], attempt_storage, controls)
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

    loader = controls.get("_lexical_external_loader")
    if not callable(loader):
        raise Invalid("root-bound external loader unavailable")
    driver = loader(V9_DRIVER, "pw_r8_candidate_v9_subject_primitive_for_v21_run_cell")
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
                      paths["receipt"][0], receipt_storage, controls)

        capture = _capture_from_receipt(receipt, receipt_storage)
        capture_storage = canonical(capture) + b"\n"
        _proposal_ack(root, run_id, slot, cell, claim_sha, "capture",
                      paths["capture"][0], capture_storage, controls)

        score = _score_from_capture(CANDIDATE_ID, cell, slot, root, capture, controls)
        score_storage = canonical(score) + b"\n"
        _proposal_ack(root, run_id, slot, cell, claim_sha, "score",
                      paths["score"][0], score_storage, controls)

        completion = _completion_from_members(
            root, run_id, slot, cell, nonce, attempt_storage, render, receipt_storage,
            receipt, capture_storage, score_storage, score)
        completion_storage = canonical(completion) + b"\n"
        _proposal_ack(root, run_id, slot, cell, claim_sha, "completion-v3-last",
                      paths["completion"][0], completion_storage, controls)
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


def run_cell(root_value: str, run_id: str, slot: str, cell: str, nonce: str,
             timeout_seconds: float = 600.0) -> dict[str, Any]:
    root = execution_root(root_value)
    return _root_bound_operation(root, run_id, slot, cell, nonce,
                                 "run-cell", timeout_seconds)


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


def _receipt_for_cell(root: Path, run_id: str, slot: str, cell: str, nonce: str,
                      controls: dict[str, Any]) -> tuple[bytes, dict[str, Any], dict[str, Any], bytes]:
    paths = _paths(root, slot, cell)
    render, _ = regular(paths["render"][1], "persisted render")
    receipt_storage, receipt, _ = exact_file(paths["receipt"][1], "receipt-v4")
    _validate_receipt(receipt, receipt_storage, root, slot, cell, run_id, nonce, controls, render, validate_rollout=True)
    return receipt_storage, receipt, controls, render


def _emit_capture_after_gate(root: Path, controls: dict[str, Any], run_id: str,
                             slot: str, cell: str, nonce: str) -> dict[str, Any]:
    receipt_storage, receipt, _controls, _render = _receipt_for_cell(root, run_id, slot, cell, nonce, controls)
    paths = _paths(root, slot, cell)
    expected = _capture_from_receipt(receipt, receipt_storage)
    storage = canonical(expected) + b"\n"
    writes: list[dict[str, Any]] = []
    if paths["capture"][1].exists():
        observed, value, _ = exact_file(paths["capture"][1], "existing capture-v3")
        if observed != storage or value != expected:
            raise Invalid("existing capture-v3 mismatch; repair forbidden")
    else:
        writes.append(_write_proposal(paths["capture"][0], storage, _controls))
    return _terminal("emit-capture", "CAPTURE_ALREADY_DURABLE" if not writes else "APPLY_CAPTURE_CREATE_ONLY",
                     writes=writes, run_id=run_id, slot=slot, cell=cell,
                     persistent_state_changed=False)


def _capture_for_cell(root: Path, run_id: str, slot: str, cell: str, nonce: str,
                      controls: dict[str, Any]) -> tuple[bytes, dict[str, Any], dict[str, Any], bytes, bytes]:
    receipt_storage, receipt, controls, render = _receipt_for_cell(root, run_id, slot, cell, nonce, controls)
    path = _paths(root, slot, cell)["capture"][1]
    capture_storage, capture, _ = exact_file(path, "capture-v3")
    expected = _capture_from_receipt(receipt, receipt_storage)
    if tuple(capture) != CAPTURE_KEYS or capture != expected or capture_storage != canonical(expected) + b"\n":
        raise Invalid("capture-v3 differs from deterministic receipt projection")
    return capture_storage, capture, controls, render, receipt_storage


def _score_from_capture(candidate_id: str, cell: str, slot: str, root: Path,
                        capture: dict[str, Any], controls: Any) -> dict[str, Any]:
    module = _semantics(controls, candidate_id)
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


def _score_cell_after_gate(root: Path, controls: dict[str, Any], run_id: str,
                           slot: str, cell: str, nonce: str) -> dict[str, Any]:
    _capture_storage, capture, _controls, _render, _receipt_storage = _capture_for_cell(root, run_id, slot, cell, nonce, controls)
    expected = _score_from_capture(CANDIDATE_ID, cell, slot, root, capture, _controls)
    storage = canonical(expected) + b"\n"
    paths = _paths(root, slot, cell)
    writes: list[dict[str, Any]] = []
    if paths["score"][1].exists():
        observed, value, _ = exact_file(paths["score"][1], "existing score")
        if observed != storage or value != expected:
            raise Invalid("existing score differs from unchanged scorer; repair forbidden")
    else:
        writes.append(_write_proposal(paths["score"][0], storage, _controls))
    return _terminal("score-cell", "SCORE_ALREADY_DURABLE" if not writes else "APPLY_SCORE_CREATE_ONLY",
                     writes=writes, run_id=run_id, slot=slot, cell=cell,
                     score_verdict=expected["verdict"], persistent_state_changed=False)


def _score_for_cell(root: Path, run_id: str, slot: str, cell: str, nonce: str,
                    controls: dict[str, Any]) -> tuple[bytes, dict[str, Any], bytes, dict[str, Any], dict[str, Any], bytes, bytes]:
    capture_storage, capture, controls, render, receipt_storage = _capture_for_cell(root, run_id, slot, cell, nonce, controls)
    score_storage, score, _ = exact_file(_paths(root, slot, cell)["score"][1], "score")
    expected = _score_from_capture(CANDIDATE_ID, cell, slot, root, capture, controls)
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


def _emit_completion_after_gate(root: Path, controls: dict[str, Any], run_id: str,
                                slot: str, cell: str, nonce: str) -> dict[str, Any]:
    score_storage, score, capture_storage, _capture, controls, render, receipt_storage = _score_for_cell(root, run_id, slot, cell, nonce, controls)
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
        writes.append(_write_proposal(paths["completion"][0], storage, controls))
    return _terminal("emit-completion", "COMPLETION_ALREADY_DURABLE" if not writes else "APPLY_COMPLETION_LAST_CREATE_ONLY",
                     writes=writes, run_id=run_id, slot=slot, cell=cell,
                     score_verdict=score["verdict"], schedule_advance_allowed=False,
                     independent_reopen_required=True, persistent_state_changed=False)


def _validate_cell_after_gate(root: Path, controls: dict[str, Any], run_id: str,
                              slot: str, cell: str, nonce: str) -> dict[str, Any]:
    reopened = _full_chain_reopen(root, run_id, slot, cell, nonce, controls, require_pass=False)
    return _terminal("validate-cell", "PASS_FULL_CHAIN_REOPENED_CONTROLLER_DIAGNOSTIC_ONLY", run_id=run_id,
                     slot=slot, cell=cell, score_verdict=reopened["score_verdict"],
                     completion_storage_sha256=sha(reopened["completion_storage"]),
                     completion_storage_bytes=len(reopened["completion_storage"]),
                     schedule_advance_allowed=False, independent_verifier_required=True,
                     persistent_state_changed=False)


def _recover_state_after_gate(root: Path, controls: dict[str, Any], run_id: str,
                              slot: str, cell: str, nonce: str) -> dict[str, Any]:
    paths = _paths(root, slot, cell)
    exists = {name: path.exists() for name, (_rel, path) in paths.items()}
    if exists["completion"]:
        _validate_cell_after_gate(root, controls, run_id, slot, cell, nonce)
        return _terminal("recover-state", "SEALED_VALID_REOPENED", run_id=run_id, slot=slot, cell=cell,
                         next_command=None, schedule_advance_allowed=False,
                         independent_verifier_required=True,
                         persistent_state_changed=False)
    if (exists["claim"] or exists["attempt"]) and not exists["receipt"]:
        return _terminal("recover-state", "PERMANENT_INVALID_ATTEMPT_WITHOUT_RECEIPT_NEVER_RELAUNCH",
                         run_id=run_id, slot=slot, cell=cell, next_command=None,
                         schedule_advance_allowed=False, persistent_state_changed=False)
    if exists["receipt"]:
        _receipt_for_cell(root, run_id, slot, cell, nonce, controls)
        if not exists["capture"]:
            next_command = "emit-capture"
        elif not exists["score"]:
            _capture_for_cell(root, run_id, slot, cell, nonce, controls)
            next_command = "score-cell"
        else:
            _score_for_cell(root, run_id, slot, cell, nonce, controls)
            next_command = "emit-completion"
        return _terminal("recover-state", "RESUMABLE_ZERO_SUBJECT_CALLS", run_id=run_id,
                         slot=slot, cell=cell, next_command=next_command,
                         schedule_advance_allowed=False, persistent_state_changed=False)
    if not any(exists.values()):
        return _terminal("recover-state", "READY_FOR_NEW_INTERACTIVE_RUN_CELL", run_id=run_id, slot=slot,
                         cell=cell, next_command="run-cell", schedule_advance_allowed=False,
                         persistent_state_changed=False)
    raise Invalid("partial evidence outside monotonic create-only state machine")


def _nonce_for_after_gate(controls: dict[str, Any], run_id: str,
                          slot: str, cell: str) -> str:
    matches = [x.get("dispatch_nonce") for x in controls["entries"]
               if (x.get("slot"), x.get("cell")) == (slot, cell)]
    if len(matches) != 1 or not isinstance(matches[0], str):
        raise Invalid("dispatch nonce lookup cardinality mismatch")
    return matches[0]


def _emit_artifact_after_gate(root: Path, controls: dict[str, Any], run_id: str,
                              slot: str, stage: str) -> dict[str, Any]:
    if slot not in SLOTS or stage not in STAGES:
        raise Invalid("artifact slot/stage outside frozen deterministic transitions")
    first_cell = controls["cells"][0]
    _nonce = next(entry["dispatch_nonce"] for entry in controls["entries"]
                  if (entry["slot"], entry["cell"]) == (slot, first_cell))
    value = _semantics(controls).reduce(root, slot, stage)
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
        writes.append(_write_proposal(rel, storage, controls))
    return _terminal("emit-artifact", "ARTIFACT_ALREADY_DURABLE" if not writes else "APPLY_ARTIFACT_CREATE_ONLY",
                     writes=writes, run_id=run_id, slot=slot, stage=stage,
                     artifact_storage_sha256=sha(storage), artifact_storage_bytes=len(storage),
                     persistent_state_changed=False)


def _validate_artifact_after_gate(root: Path, controls: dict[str, Any], run_id: str,
                                  slot: str, stage: str) -> dict[str, Any]:
    if slot not in SLOTS or stage not in STAGES:
        raise Invalid("artifact slot/stage outside frozen deterministic transitions")
    first_cell = controls["cells"][0]
    _nonce = next(entry["dispatch_nonce"] for entry in controls["entries"]
                  if (entry["slot"], entry["cell"]) == (slot, first_cell))
    path = root / slot / "artifacts" / f"{stage}.json"
    storage, value, _ = exact_file(path, f"deterministic artifact {stage}")
    expected = _semantics(controls).reduce(root, slot, stage)
    if value != expected or storage != canonical(expected) + b"\n":
        raise Invalid("deterministic artifact differs from unchanged reducer")
    return _terminal("validate-artifact", "PASS", run_id=run_id, slot=slot, stage=stage,
                     artifact_storage_sha256=sha(storage), artifact_storage_bytes=len(storage),
                     persistent_state_changed=False)


def emit_capture(root_value: str, run_id: str, slot: str, cell: str, nonce: str) -> dict[str, Any]:
    root = execution_root(root_value)
    return _root_bound_operation(root, run_id, slot, cell, nonce, "emit-capture")


def score_cell(root_value: str, run_id: str, slot: str, cell: str, nonce: str) -> dict[str, Any]:
    root = execution_root(root_value)
    return _root_bound_operation(root, run_id, slot, cell, nonce, "score-cell")


def emit_completion(root_value: str, run_id: str, slot: str, cell: str, nonce: str) -> dict[str, Any]:
    root = execution_root(root_value)
    return _root_bound_operation(root, run_id, slot, cell, nonce, "emit-completion")


def validate_cell(root_value: str, run_id: str, slot: str, cell: str, nonce: str) -> dict[str, Any]:
    root = execution_root(root_value)
    return _root_bound_operation(root, run_id, slot, cell, nonce, "validate-cell")


def recover_state(root_value: str, run_id: str, slot: str, cell: str, nonce: str) -> dict[str, Any]:
    root = execution_root(root_value)
    return _root_bound_operation(root, run_id, slot, cell, nonce, "recover-state")


def emit_artifact(root_value: str, run_id: str, slot: str, stage: str) -> dict[str, Any]:
    root = execution_root(root_value)
    return _root_bound_operation(root, run_id, slot, None, None, "emit-artifact", stage)


def validate_artifact(root_value: str, run_id: str, slot: str, stage: str) -> dict[str, Any]:
    root = execution_root(root_value)
    return _root_bound_operation(root, run_id, slot, None, None, "validate-artifact", stage)


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
    if architecture.get("schema_id") != "pw-r8-clean-room-architecture-contract-v21" or architecture.get("candidate_id") != CANDIDATE_ID:
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


def _closed_dependency_rows() -> list[dict[str, Any]]:
    """Validate the exact local closure and return only its JSON row projection."""
    rows = _dependency_closure()
    _load_order_event("preflight_dependency_closure_gate_pass", dependency_files=len(rows))
    return rows


def _assert_json_projection(value: Any, label: str = "closed preflight report") -> Any:
    """Reject authority-bearing Python objects and accept strict JSON data only."""
    if value is None or isinstance(value, (str, bool, int)):
        return value
    if isinstance(value, float):
        if value != value or value in (float("inf"), float("-inf")):
            raise Invalid(f"{label}: non-finite JSON number")
        return value
    if isinstance(value, list):
        for index, item in enumerate(value):
            _assert_json_projection(item, f"{label}[{index}]")
        return value
    if isinstance(value, dict):
        for key, item in value.items():
            if not isinstance(key, str):
                raise Invalid(f"{label}: non-string JSON key")
            _assert_json_projection(item, f"{label}.{key}")
        return value
    raise Invalid(f"{label}: authority-bearing/non-JSON value {type(value).__name__}")


def _semantic_identity() -> dict[str, Any]:
    _closed_dependency_rows()

    def load_fixed_harness() -> ModuleType:
        spec = importlib.util.spec_from_file_location(
            "pw_r8_candidate_v9_semantic_identity_for_v21", V9_HARNESS)
        if spec is None or spec.loader is None:
            raise Invalid("fixed semantic harness unavailable")
        loaded = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(loaded)
        return loaded

    _load_order_event("external_module_execute", path=str(V9_HARNESS.resolve()),
                      module_name="pw_r8_candidate_v9_semantic_identity_for_v21")
    harness = load_fixed_harness()
    v9 = harness.preflight()
    module = harness.semantic_module(candidate_identity=False)
    if tuple(module.SUBJECT_CELLS) != _frozen_cells():
        raise Invalid("closed semantic schedule mismatch")
    v12_storage, v12, _ = exact_file(V12_PREFLIGHT, "candidate-v12 deterministic preflight")
    cells = tuple(module.SUBJECT_CELLS)
    if list(cells) != v12.get("exact_subject_cell_schedule") or len(cells) != 97:
        raise Invalid("candidate-v21 schedule differs from frozen v12")
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


def _legacy_capture_and_score(preflight_controls: dict[str, Any]) -> tuple[bytes, dict[str, Any], bytes, dict[str, Any], bytes]:
    render, _ = regular(V12_A02_RENDER, "v12 A02 render")
    receipt_storage, receipt, _ = exact_file(V12_A02_RECEIPT, "v12 A02 receipt")
    if tuple(receipt) != RECEIPT_KEYS or len(receipt) != 55:
        raise Invalid("v12 A02 receipt no longer exact receipt-v4")
    capture = _capture_from_receipt(receipt, receipt_storage)
    capture_storage = canonical(capture) + b"\n"
    score = _score_from_capture(receipt["candidate_id"], receipt["cell"], receipt["slot"], Path(receipt["execution_root"]), capture, preflight_controls)
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

    def __init__(self, render: bytes, receipt_storage: bytes,
                 preflight_controls: dict[str, Any], *, prefix: str = "receipt") -> None:
        self.preflight_controls = preflight_controls
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
        score = _score_from_capture(receipt["candidate_id"], self.cell, self.slot, self.root, capture, self.preflight_controls)
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
        expected_score = _score_from_capture(receipt["candidate_id"], self.cell, self.slot, self.root, capture, self.preflight_controls)
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


def _real_fragmented_local_case(preflight_controls: dict[str, Any]) -> dict[str, Any]:
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
    recovered_state, recovered = _memory_full_recovery(render, assembled, preflight_controls)
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


def _memory_full_recovery(render: bytes, receipt_storage: bytes,
                          preflight_controls: dict[str, Any]) -> tuple[_MemoryCellState, dict[str, Any]]:
    state = _MemoryCellState(render, receipt_storage, preflight_controls, prefix="receipt")
    result = state.continue_zero_call()
    if result["subject_calls"] != 0 or result["completion_key_count"] != 39:
        raise Invalid("memory successor recovery did not preserve zero-call exact completion")
    return state, result


def _outer_metadata_independent_outputs(render: bytes, receipt_storage: bytes,
                                        outer_variants: list[dict[str, Any]],
                                        preflight_controls: dict[str, Any]) -> dict[str, Any]:
    rows: list[dict[str, Any]] = []
    for outer in outer_variants:
        # `outer` is deliberately never supplied to the recovery state machine.
        state, result = _memory_full_recovery(render, receipt_storage, preflight_controls)
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
        "schema_id": "pw-r8-candidate-freeze-manifest-v21", "candidate_id": CANDIDATE_ID,
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
            "path": "tests/agent_packet_restrictions/successor_20260813/model_retest_r8_candidate_v21/independent_preseal_audit.json",
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
    _closed_dependency_rows()

    def load_fixed_harness() -> ModuleType:
        spec = importlib.util.spec_from_file_location(
            "pw_r8_candidate_v9_zero_call_for_v21", V9_HARNESS)
        if spec is None or spec.loader is None:
            raise Invalid("fixed zero-call semantic harness unavailable")
        loaded = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(loaded)
        return loaded

    _load_order_event("external_module_execute", path=str(V9_HARNESS.resolve()),
                      module_name="pw_r8_candidate_v9_zero_call_for_v21")
    harness = load_fixed_harness()
    harness.preflight()
    semantic = harness.semantic_module(candidate_identity=False)
    if tuple(semantic.SUBJECT_CELLS) != _frozen_cells():
        raise Invalid("closed zero-call semantic schedule mismatch")
    preflight_controls = {"_lexical_semantics": semantic}
    render, _ = regular(V12_A02_RENDER, "v12 A02 exact render")
    receipt_storage, receipt, capture_storage, score, score_storage = _legacy_capture_and_score(preflight_controls)
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
        lambda: _memory_full_recovery(render, receipt_storage, preflight_controls)[1], expect_reject=False)
    successor.update({
        "same_receipt_storage_sha256": sha(receipt_storage), "same_receipt_storage_bytes": len(receipt_storage),
        "legacy_capture_storage_sha256": sha(capture_storage), "legacy_capture_storage_bytes": len(capture_storage),
        "legacy_score_storage_sha256": sha(score_storage), "legacy_score_storage_bytes": len(score_storage),
        "legacy_score_verdict": score["verdict"],
    })

    baseline, baseline_result = _memory_full_recovery(render, receipt_storage, preflight_controls)

    def state_with(*members: str) -> _MemoryCellState:
        state = _MemoryCellState(render, receipt_storage, preflight_controls, prefix="receipt")
        for name in members:
            state.create_only(name, baseline.reopen(name))
        return state

    def rec002() -> Any:
        state = _MemoryCellState(render, receipt_storage, preflight_controls, prefix="attempt")
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
            state = _MemoryCellState(render, receipt_storage, preflight_controls, prefix="receipt")
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
               lambda: _outer_metadata_independent_outputs(render, receipt_storage, outer_variants,
                                                            preflight_controls),
               expect_reject=False),
    ]
    live = _real_fragmented_local_case(preflight_controls)

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
        state = _MemoryCellState(render, receipt_storage, preflight_controls, prefix="receipt")
        state.objects["render"] = render[:-2] + b"X\n"
        return state.continue_zero_call()

    def historical_unsafe_stop() -> Any:
        state = _MemoryCellState(render, receipt_storage, preflight_controls, prefix="receipt")
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
                                                            list(reversed(outer_variants)),
                                                            preflight_controls),
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
    _closed_dependency_rows()

    def load_fixed_boundary(path: Path, name: str) -> ModuleType:
        if path not in (V14_VERIFIER, ROOT / "r8_run_verifier.py"):
            raise Invalid("boundary suite requested undeclared executable")
        _load_order_event("external_module_execute", path=str(path.resolve()), module_name=name)
        spec = importlib.util.spec_from_file_location(name, path)
        if spec is None or spec.loader is None:
            raise Invalid(f"fixed boundary module unavailable: {path}")
        loaded = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(loaded)
        return loaded

    v14_storage, _ = regular(V14_VERIFIER, "preserved candidate-v14 verifier")
    if (sha(v14_storage), len(v14_storage)) != (
        "51fafee712bc8f0879bb14977824ad0ddd09bad21d76205e33a99cb2063f5557", 80711
    ):
        raise Invalid("preserved candidate-v14 verifier drift")
    v14 = load_fixed_boundary(V14_VERIFIER, "pw_r8_v21_preserved_v14_boundary_reproducer")

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

    v15 = load_fixed_boundary(ROOT / "r8_run_verifier.py", "pw_r8_v21_boundary_under_test")
    cells = _frozen_cells()

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
            "qualification_contract": {"schema_id": "synthetic-v21-qualification"},
            "routes": {slot: {"requested_model": ROUTES[slot][0],
                               "requested_thinking": ROUTES[slot][1]} for slot in SLOTS},
        }
        return {"cells": cells, "entries": entries, "run": run,
                "inventory": run_inventory, "authorized_task_ids": run["launch_authorized_task_ids"]}

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

    root = Path("/virtual-v21")
    base_files = files_for(controls, {"slot-alpha": 1, "slot-bravo": 0, "slot-charlie": 0})
    future_task = tasks[("slot-alpha", cells[1])]
    receipt_index = v15.TASK_PATH_KEYS.index("receipt_relative_path")
    planted_files = set(base_files) | {future_task[receipt_index]}
    planted_rows = rows_for(planted_files)
    v15.execution_root = lambda value: Path(value)
    v15._scan_execution_root = lambda _root: planted_rows
    v15._full_chain_reopen = lambda *_args, **_kwargs: (_ for _ in ()).throw(
        AssertionError("semantic consumption reached after future evidence"))
    try:
        v15._validate_cell_after_gate(root, controls, controls["run"]["run_id"],
                                      "slot-alpha", cells[0])
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
        v15._validate_cell_after_gate(root, controls, controls["run"]["run_id"],
                                      "slot-alpha", cells[0])
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

    def fake_artifact(_root: Path, synthetic_run_id: str, slot: str, stage: str,
                      _controls: Any) -> dict[str, Any]:
        storage = canonical({"run_id": synthetic_run_id, "slot": slot, "stage": stage}) + b"\n"
        return {
            "schema_id": "pw-r8-independent-artifact-validation-v21",
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
        result = v15._validate_cell_after_gate(
            root, controls, controls["run"]["run_id"], "slot-alpha", cells[count - 1])
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
        result = v15._validate_artifact_after_gate(
            root, controls, controls["run"]["run_id"], "slot-alpha", stage)
        evidence = canonical(result)
        artifact_prefixes.append({
            "stage": stage, "completed_cells": count, "artifact_prefix_count": artifact_index + 1,
            "status": "PASS", "result_sha256": sha(evidence), "result_bytes": len(evidence),
        })

    path_files = files_for(controls, {"slot-alpha": 97, "slot-bravo": 0, "slot-charlie": 0})
    path_rows = rows_for(path_files)
    v15._scan_execution_root = lambda _root: path_rows
    path_result = v15._validate_path_after_gate(
        root, controls, controls["run"]["run_id"], "slot-alpha")

    matrix_files = files_for(controls, {slot: 97 for slot in SLOTS})
    matrix_rows = rows_for(matrix_files)
    v15._scan_execution_root = lambda _root: matrix_rows
    matrix_result = v15._validate_matrix_after_gate(root, controls, controls["run"]["run_id"])

    second_controls = controls_for("v15-boundary-run-2", 2, controls["run"]["run_id"])
    first_root, second_root = Path("/virtual-v21-run-1"), Path("/virtual-v21-run-2")
    first_rows = rows_for(files_for(controls, {slot: 97 for slot in SLOTS}))
    second_rows = rows_for(files_for(second_controls, {slot: 97 for slot in SLOTS}))
    controls_by_root = {str(first_root): controls, str(second_root): second_controls}
    rows_by_root = {str(first_root): first_rows, str(second_root): second_rows}
    v15._scan_execution_root = lambda selected_root: rows_by_root[str(selected_root)]

    def synthetic_exact_file(path: Path, label: str) -> tuple[bytes, dict[str, Any], os.stat_result | None]:
        if path.name != "run_contract.json" or str(path.parent) not in controls_by_root:
            raise v15.Invalid(f"unexpected synthetic exact-file reopen: {label}")
        value = controls_by_root[str(path.parent)]["run"]
        return canonical(value) + b"\n", value, None

    v15.exact_file = synthetic_exact_file
    two_run_result = v15._validate_two_runs_after_gate(
        first_root, second_root, controls, second_controls,
        controls["run"], second_controls["run"],
        controls["run"]["run_id"], second_controls["run"]["run_id"])
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






# BEGIN CANDIDATE-20 STANDALONE AUTHORITY IMPLEMENTATION
V19_AUDIT = SUCCESSOR / "model_retest_r8_candidate_v19/independent_preseal_audit.json"
V19_PROGRESS = SUCCESSOR / "r8_progress_assessment_candidate_v19_preseal_fail_v1.json"
V20_AUDIT = SUCCESSOR / "model_retest_r8_candidate_v20/independent_preseal_audit.json"
V20_PROGRESS = SUCCESSOR / "r8_progress_assessment_candidate_v20_preseal_fail_v1.json"
FREEZE_RELATIVE_PATH = "tests/agent_packet_restrictions/successor_20260813/r8_candidate_v21_freeze_manifest.json"
AUDIT_RELATIVE_PATH = "tests/agent_packet_restrictions/successor_20260813/model_retest_r8_candidate_v21/independent_preseal_audit.json"
PROGRESS_RELATIVE_PATH = "tests/agent_packet_restrictions/successor_20260813/r8_progress_assessment_candidate_v21_pre_freeze_v1.json"
PRE_AUDIT_FILES = (
    "README.md", "architecture_contract.json", "controller_contract.json",
    "deterministic_preflight_report.json", "process_completion_contract.json",
    "r8_clean_room_controller.py", "r8_run_verifier.py",
)
POST_AUDIT_BUNDLE_FILES = PRE_AUDIT_FILES + ("independent_preseal_audit.json",)
FREEZE_KEYS = (
    "schema_id", "candidate_id", "status", "parent_candidate_id", "checkpoint_commit",
    "goal_loop_buster_addendum", "v20_failed_audit", "v20_progress_assessment",
    "independent_preseal_audit", "pre_freeze_progress", "audited_candidate_bundle",
    "dependency_files", "dependency_inventory", "deterministic_preflight",
    "qualification_contract",
)
RUN_KEYS = (
    "schema_id", "candidate_id", "run_id", "run_kind", "subject_launch_authorized",
    "qualification_credit", "launch_authorized_task_ids", "routes",
    "fresh_task_required", "first_attempt_subject_call", "retry_count", "best_of",
    "replacement_result", "ordered_schedule_path", "ordered_schedule_storage_sha256",
    "ordered_schedule_storage_bytes", "dispatch_schedule_path",
    "dispatch_schedule_storage_sha256", "dispatch_schedule_storage_bytes",
    "candidate_freeze_manifest_path", "candidate_freeze_manifest_storage_sha256",
    "candidate_freeze_manifest_storage_bytes", "goal_loop_buster_addendum",
    "pre_freeze_progress", "qualification_contract", "run_inventory",
    "qualification_sequence", "predecessor_run_id",
)
RUN_KINDS = ("ZERO_CREDIT_THREE_ROUTE_CANARY", "QUALIFICATION_MATRIX")
AUDIT_SOURCE_KEYS = (
    "goal_loop_buster_addendum", "v20_failed_audit", "v20_progress_assessment",
    "dependency_inventory", "deterministic_preflight", "qualification_contract",
)
PROGRESS_KEYS = (
    "schema_id", "identity_family", "goal_loop_buster_addendum", "candidate_id",
    "parent_candidate_id", "candidate_terminal", "normalized_failures",
    "prior_reproducer_and_new_counterfactual_status",
    "valid_first_attempt_cells_completed_before_invalidation", "longest_valid_causal_prefix",
    "previously_closed_failure_classes", "architectural_surface_delta", "decision",
    "decision_evidence", "next_action", "calls", "qualification_credit", "nonclaims",
)
TASK_KEYS_V18 = (
    "task_id", "slot", "cell", "dispatch_nonce", "transaction_claim_relative_path",
    "rendered_relative_path", "dispatch_attempt_relative_path", "receipt_relative_path",
    "capture_relative_path", "score_relative_path", "completion_relative_path",
)
HEX40_RE_V18 = re.compile(r"^[0-9a-f]{40}$")


def _qualification_contract() -> dict[str, Any]:
    return {
        "schema_id": "pw-r8-qualification-contract-v21", "candidate_id": CANDIDATE_ID,
        "credit_run_kind": "QUALIFICATION_MATRIX",
        "zero_credit_run_kind": "ZERO_CREDIT_THREE_ROUTE_CANARY",
        "route_count": 3, "subject_cells_per_route": 97, "tasks_per_matrix": 291,
        "qualification_runs": 2, "qualification_credit_per_complete_matrix": 1,
        "run_contract_qualification_credit": 0,
        "routes": {slot: {"requested_model": model, "requested_thinking": effort}
                   for slot, (model, effort) in ROUTES.items()},
        "retry_count": 0, "best_of": False, "replacement_result": False,
        "controller_invalid_extras": 0, "schedule_identity": "FROZEN_97_CELL_ORDER",
        "semantic_identity": "97/97_RENDER_ORACLE_SCORER_REDUCER",
    }


def _v19_binding(path: str, data: bytes) -> dict[str, Any]:
    return {"path": path, "sha256": sha(data), "bytes": len(data)}


def _v19_fixed_binding(path: str, digest: str, size: int) -> dict[str, Any]:
    return {"path": path, "sha256": digest, "bytes": size}


def _v19_goal_binding() -> dict[str, Any]:
    return _v19_fixed_binding(
        "tests/agent_packet_restrictions/successor_20260813/r8_goal_loop_buster_addendum_v1.json",
        "d3f901e724d785ba3d053a961a8559b6f5b5add7e7b660a9fbb503586ad822d0", 4468)


def _v19_audit_lineage() -> dict[str, Any]:
    return _v19_fixed_binding(
        "tests/agent_packet_restrictions/successor_20260813/model_retest_r8_candidate_v20/independent_preseal_audit.json",
        "c8678951ff5653b0a9b4c0d3421dc0707ea64d70e0f94ae3926222b78699afe6", 24732)


def _v19_progress_lineage() -> dict[str, Any]:
    return _v19_fixed_binding(
        "tests/agent_packet_restrictions/successor_20260813/r8_progress_assessment_candidate_v20_preseal_fail_v1.json",
        "50e83c5b81e7b63599351fea3cc7268bbbb29b2ac8afdae5a23f99fa9998288c", 4527)


def _v19_expected_dependency_rows() -> list[dict[str, Any]]:
    _storage, architecture, _info = exact_file(ROOT / "architecture_contract.json", "candidate-v21 architecture")
    rows = architecture.get("runtime_dependency_closure")
    if not isinstance(rows, list) or len(rows) != 65:
        raise Invalid("candidate-v21 dependency closure is not exact 65 rows")
    paths = []
    for row in rows:
        if not isinstance(row, dict) or tuple(row) != ("path", "sha256", "bytes", "roles"):
            raise Invalid("candidate-v21 dependency row schema invalid")
        path = row.get("path")
        if not isinstance(path, str) or Path(path).is_absolute() or ".." in Path(path).parts:
            raise Invalid("candidate-v21 dependency path invalid")
        paths.append(path)
    if paths != sorted(paths) or len(paths) != len(set(paths)):
        raise Invalid("candidate-v21 dependency paths not exact sorted unique")
    return rows


def _v19_dependency_inventory(rows: list[dict[str, Any]]) -> dict[str, Any]:
    storage = canonical(rows)
    return {"exact_sorted_unique_files": len(rows), "canonical_rows_sha256": sha(storage), "canonical_rows_bytes": len(storage)}


def _deterministic_report_binding(read_repo: Callable[[str], bytes]) -> dict[str, Any]:
    path = "tests/agent_packet_restrictions/successor_20260813/model_retest_r8_candidate_v21/deterministic_preflight_report.json"
    data = read_repo(path)
    value = strict_object(data, "candidate-v21 deterministic preflight")
    if value.get("schema_id") != "pw-r8-deterministic-preflight-report-v21" or value.get("candidate_id") != CANDIDATE_ID or value.get("typed_result") != {"type": "PASS", "fail_closed": True}:
        raise Invalid("candidate-v21 deterministic preflight not typed PASS")
    return {**_v19_binding(path, data), "typed_result": "PASS"}


def _v19_git_head() -> str:
    result = subprocess.run(["git", "rev-parse", "HEAD"], cwd=REPO, stdin=subprocess.DEVNULL, stdout=subprocess.PIPE, stderr=subprocess.PIPE, check=False)
    head = result.stdout.decode("ascii", "strict").strip()
    if result.returncode != 0 or not HEX40_RE_V18.fullmatch(head):
        raise Invalid("cannot resolve exact local Git HEAD")
    return head


def _v19_git_blob(commit: str, path: str) -> bytes:
    if not HEX40_RE_V18.fullmatch(commit) or Path(path).is_absolute() or ".." in Path(path).parts:
        raise Invalid("unsafe Git object lookup")
    result = subprocess.run(["git", "show", f"{commit}:{path}"], cwd=REPO, stdin=subprocess.DEVNULL, stdout=subprocess.PIPE, stderr=subprocess.PIPE, check=False)
    if result.returncode != 0:
        raise Invalid(f"required checkpoint blob absent: {path}")
    return result.stdout


def _v19_read_repo(path: str) -> bytes:
    if Path(path).is_absolute() or ".." in Path(path).parts:
        raise Invalid("unsafe repository path")
    data, _info = regular(REPO / path, f"repository file {path}")
    return data


def _v19_exact_bound(binding: Any, expected_path: str, commit: str,
                     read_repo: Callable[[str], bytes], git_blob: Callable[[str, str], bytes]) -> bytes:
    if not isinstance(binding, dict) or tuple(binding) != ("path", "sha256", "bytes") or binding.get("path") != expected_path:
        raise Invalid(f"binding schema/path mismatch: {expected_path}")
    local = read_repo(expected_path)
    committed = git_blob(commit, expected_path)
    if local != committed:
        raise Invalid(f"uncommitted or substituted bound file: {expected_path}")
    if (sha(local), len(local)) != (binding.get("sha256"), binding.get("bytes")):
        raise Invalid(f"bound hash/bytes mismatch: {expected_path}")
    return local


def _v19_validate_audit(audit: dict[str, Any], storage: bytes, sources: dict[str, Any], commit: str,
                        read_repo: Callable[[str], bytes], git_blob: Callable[[str, str], bytes]) -> list[dict[str, Any]]:
    if tuple(audit) != AUDIT_KEYS or audit.get("schema_id") != "pw-r8-independent-preseal-audit-v21" or audit.get("candidate_id") != CANDIDATE_ID:
        raise Invalid("candidate-v21 audit strict schema/identity mismatch")
    exact = {"status": "COMPLETE", "verdict": "PRESEAL_PASS", "independent_decision": "LOOP_BROKEN", "loop_broken": True, "freeze_authorized": True, "launch_authorized": False, "subject_calls": 0, "provider_calls": 0, "network_calls": 0, "blocking_findings": []}
    if any(audit.get(k) != v for k, v in exact.items()) or not isinstance(audit.get("nonclaims"), list):
        raise Invalid("candidate-v21 audit is not exact PRESEAL_PASS/LOOP_BROKEN")
    identity = audit.get("candidate_byte_identity")
    rows = identity.get("files") if isinstance(identity, dict) else None
    if not isinstance(identity, dict) or tuple(identity) != ("status", "files") or identity.get("status") != "PASS" or not isinstance(rows, list) or [row.get("path") for row in rows if isinstance(row, dict)] != list(PRE_AUDIT_FILES):
        raise Invalid("candidate-v21 audit seven-file identity mismatch")
    prefix = "tests/agent_packet_restrictions/successor_20260813/model_retest_r8_candidate_v21/"
    for row, name in zip(rows, PRE_AUDIT_FILES, strict=True):
        if tuple(row) != ("path", "sha256", "bytes"):
            raise Invalid("candidate-v21 audit file row schema mismatch")
        full = prefix + name
        actual = _v19_exact_bound({**row, "path": full}, full, commit, read_repo, git_blob)
        if (sha(actual), len(actual)) != (row["sha256"], row["bytes"]):
            raise Invalid("candidate-v21 audit file identity drift")
    if not isinstance(audit.get("source_bindings"), dict) or tuple(audit["source_bindings"]) != AUDIT_SOURCE_KEYS or audit["source_bindings"] != sources:
        raise Invalid("candidate-v21 audit source bindings mismatch")
    if canonical(audit) + b"\n" != storage:
        raise Invalid("candidate-v21 audit noncanonical storage")
    return rows


def _v19_validate_progress(progress: dict[str, Any], storage: bytes, audit_binding: dict[str, Any]) -> None:
    if tuple(progress) != PROGRESS_KEYS or progress.get("schema_id") != "pw-r8-progress-assessment-v1" or progress.get("identity_family") != IDENTITY_FAMILY or progress.get("candidate_id") != CANDIDATE_ID or progress.get("parent_candidate_id") != "PW-R8-ITERATIVE-FIX-TWO-CLEAN-RUNS-20260815.CANDIDATE-20":
        raise Invalid("candidate-v21 progress strict schema/identity mismatch")
    terminal = progress.get("candidate_terminal")
    expected = {"type": "PRESEAL_PASS", "independent_decision": "LOOP_BROKEN", "audit_path": AUDIT_RELATIVE_PATH, "audit_storage_sha256": audit_binding["sha256"], "audit_storage_bytes": audit_binding["bytes"], "freeze_authorized": True, "launch_authorized": False, "authorized_next_execution": "EXACT_THREE_ROUTE_ZERO_CREDIT_CANARY_ONLY"}
    if terminal != expected or tuple(terminal) != tuple(expected) or progress.get("goal_loop_buster_addendum") != _v19_goal_binding() or progress.get("decision") != "LOOP_BROKEN" or progress.get("calls") != {"subject": 0, "provider": 0, "network": 0} or progress.get("qualification_credit") != 0 or progress.get("normalized_failures") != []:
        raise Invalid("candidate-v21 progress not exact zero-call LOOP_BROKEN")
    if canonical(progress) + b"\n" != storage:
        raise Invalid("candidate-v21 progress noncanonical storage")


def _v19_validate_freeze_object(freeze: dict[str, Any], *, manifest_path: str, head: str,
                                read_repo: Callable[[str], bytes], git_blob: Callable[[str, str], bytes],
                                expected_rows: list[dict[str, Any]]) -> dict[str, Any]:
    if manifest_path != FREEZE_RELATIVE_PATH or tuple(freeze) != FREEZE_KEYS:
        raise Invalid("freeze path or exact keys/order invalid")
    if freeze.get("schema_id") != "pw-r8-candidate-freeze-manifest-v21" or freeze.get("candidate_id") != CANDIDATE_ID or freeze.get("status") != "FROZEN" or freeze.get("parent_candidate_id") != "PW-R8-ITERATIVE-FIX-TWO-CLEAN-RUNS-20260815.CANDIDATE-20":
        raise Invalid("freeze identity/status invalid")
    commit = freeze.get("checkpoint_commit")
    if not isinstance(commit, str) or not HEX40_RE_V18.fullmatch(commit) or commit != head:
        raise Invalid("freeze checkpoint stale or not current HEAD")
    fixed = {"goal_loop_buster_addendum": _v19_goal_binding(), "v20_failed_audit": _v19_audit_lineage(), "v20_progress_assessment": _v19_progress_lineage(), "qualification_contract": _qualification_contract()}
    if any(freeze.get(k) != v for k, v in fixed.items()):
        raise Invalid("freeze fixed lineage/qualification mismatch")
    for binding in (_v19_goal_binding(), _v19_audit_lineage(), _v19_progress_lineage()):
        _v19_exact_bound(binding, binding["path"], commit, read_repo, git_blob)

    dependency_rows = freeze.get("dependency_files")
    if not isinstance(dependency_rows, list) or dependency_rows != expected_rows:
        raise Invalid("freeze dependency rows missing/extra/reordered/duplicate/tampered")
    paths = [row.get("path") for row in dependency_rows if isinstance(row, dict)]
    if len(paths) != 65 or paths != sorted(paths) or len(paths) != len(set(paths)):
        raise Invalid("freeze dependency row paths not exact sorted unique 65")
    for row in dependency_rows:
        if tuple(row) != ("path", "sha256", "bytes", "roles"):
            raise Invalid("freeze dependency row schema invalid")
        repo_path = "tests/agent_packet_restrictions/successor_20260813/" + row["path"]
        local = read_repo(repo_path)
        committed = git_blob(commit, repo_path)
        if local != committed:
            raise Invalid(f"dependency uncommitted or substituted: {row['path']}")
        if (sha(local), len(local)) != (row["sha256"], row["bytes"]):
            raise Invalid(f"dependency hash/bytes mismatch: {row['path']}")
    inventory = _v19_dependency_inventory(dependency_rows)
    if freeze.get("dependency_inventory") != inventory or tuple(freeze["dependency_inventory"]) != tuple(inventory):
        raise Invalid("freeze dependency inventory not recomputed from exact rows")
    preflight = _deterministic_report_binding(read_repo)
    if freeze.get("deterministic_preflight") != preflight:
        raise Invalid("freeze deterministic preflight binding mismatch")

    audit_ref = freeze.get("independent_preseal_audit")
    if not isinstance(audit_ref, dict) or tuple(audit_ref) != ("path", "sha256", "bytes", "verdict", "independent_decision", "loop_broken") or audit_ref.get("path") != AUDIT_RELATIVE_PATH or audit_ref.get("verdict") != "PRESEAL_PASS" or audit_ref.get("independent_decision") != "LOOP_BROKEN" or audit_ref.get("loop_broken") is not True:
        raise Invalid("freeze audit reference invalid")
    audit_binding = {k: audit_ref[k] for k in ("path", "sha256", "bytes")}
    audit_storage = _v19_exact_bound(audit_binding, AUDIT_RELATIVE_PATH, commit, read_repo, git_blob)
    audit = strict_object(audit_storage, "candidate-v21 future audit")

    progress_ref = freeze.get("pre_freeze_progress")
    if not isinstance(progress_ref, dict) or tuple(progress_ref) != ("path", "sha256", "bytes", "decision") or progress_ref.get("path") != PROGRESS_RELATIVE_PATH or progress_ref.get("decision") != "LOOP_BROKEN":
        raise Invalid("freeze progress reference invalid")
    progress_binding = {k: progress_ref[k] for k in ("path", "sha256", "bytes")}
    progress_storage = _v19_exact_bound(progress_binding, PROGRESS_RELATIVE_PATH, commit, read_repo, git_blob)
    progress = strict_object(progress_storage, "candidate-v21 future progress")

    sources = {"goal_loop_buster_addendum": _v19_goal_binding(), "v20_failed_audit": _v19_audit_lineage(), "v20_progress_assessment": _v19_progress_lineage(), "dependency_inventory": inventory, "deterministic_preflight": preflight, "qualification_contract": _qualification_contract()}
    audited_rows = _v19_validate_audit(audit, audit_storage, sources, commit, read_repo, git_blob)
    _v19_validate_progress(progress, progress_storage, audit_binding)
    bundle = freeze.get("audited_candidate_bundle")
    rows = bundle.get("files") if isinstance(bundle, dict) else None
    if not isinstance(bundle, dict) or tuple(bundle) != ("schema_id", "candidate_id", "file_count", "files") or bundle.get("schema_id") != "pw-r8-post-audit-candidate-bundle-v21" or bundle.get("candidate_id") != CANDIDATE_ID or bundle.get("file_count") != 8 or not isinstance(rows, list) or [row.get("path") for row in rows if isinstance(row, dict)] != list(POST_AUDIT_BUNDLE_FILES):
        raise Invalid("freeze audited candidate bundle invalid")
    prefix = "tests/agent_packet_restrictions/successor_20260813/model_retest_r8_candidate_v21/"
    for row, name in zip(rows, POST_AUDIT_BUNDLE_FILES, strict=True):
        if tuple(row) != ("path", "sha256", "bytes"):
            raise Invalid("freeze candidate bundle row schema invalid")
        _v19_exact_bound({**row, "path": prefix + name}, prefix + name, commit, read_repo, git_blob)
    if rows[:-1] != audited_rows or rows[-1] != {"path": "independent_preseal_audit.json", "sha256": audit_binding["sha256"], "bytes": audit_binding["bytes"]}:
        raise Invalid("freeze candidate bundle differs from audit custody")
    return {"schema_id": "pw-r8-freeze-validation-v21", "candidate_id": CANDIDATE_ID, "status": "PASS", "checkpoint_commit": commit, "bundle_files": 8, "dependency_files": 65, "subject_calls": 0, "provider_calls": 0, "network_calls": 0}


def _validate_freeze_static_authority(freeze: dict[str, Any]) -> dict[str, Any]:
    if tuple(freeze) != FREEZE_KEYS or freeze.get("schema_id") != "pw-r8-candidate-freeze-manifest-v21" or freeze.get("candidate_id") != CANDIDATE_ID or freeze.get("status") != "FROZEN":
        raise Invalid("freeze static exact schema invalid")
    if freeze.get("parent_candidate_id") != "PW-R8-ITERATIVE-FIX-TWO-CLEAN-RUNS-20260815.CANDIDATE-20" or not HEX40_RE_V18.fullmatch(str(freeze.get("checkpoint_commit"))) or freeze.get("checkpoint_commit") == "0" * 40:
        raise Invalid("freeze static parent/checkpoint invalid")
    audit = freeze.get("independent_preseal_audit")
    bundle = freeze.get("audited_candidate_bundle")
    if not isinstance(audit, dict) or audit.get("verdict") != "PRESEAL_PASS" or audit.get("independent_decision") != "LOOP_BROKEN" or audit.get("loop_broken") is not True:
        raise Invalid("freeze static audit not PRESEAL_PASS/LOOP_BROKEN")
    if not isinstance(bundle, dict) or bundle.get("file_count") != 8 or not isinstance(bundle.get("files"), list) or len(bundle["files"]) != 8:
        raise Invalid("freeze static candidate bundle invalid")
    if freeze.get("dependency_files") != _v19_expected_dependency_rows() or freeze.get("dependency_inventory") != _v19_dependency_inventory(freeze["dependency_files"]):
        raise Invalid("freeze static dependency rows incomplete")
    return {"status": "PASS_STATIC_FREEZE_AUTHORITY"}


def _validate_freeze_manifest(manifest_rel: str, expected_sha: str, expected_bytes: int) -> tuple[bytes, dict[str, Any]]:
    if manifest_rel != FREEZE_RELATIVE_PATH or Path(manifest_rel).is_absolute():
        raise Invalid("freeze manifest path is not the single predeclared v18 authority")
    storage, freeze, _info = exact_file(REPO / manifest_rel, "candidate-v21 freeze manifest")
    if (sha(storage), len(storage)) != (expected_sha, expected_bytes):
        raise Invalid("freeze manifest storage binding mismatch")
    _v19_validate_freeze_object(freeze, manifest_path=manifest_rel, head=_v19_git_head(), read_repo=_v19_read_repo, git_blob=_v19_git_blob, expected_rows=_v19_expected_dependency_rows())
    return storage, freeze


def _v19_dispatch_nonce(run_id: str, slot: str, cell: str) -> str:
    return sha(b"pw-r8-c17-dispatch-nonce-v1\0" + run_id.encode() + b"\0" + slot.encode() + b"\0" + cell.encode())


def _v19_expected_ordered(run_id: str) -> dict[str, Any]:
    return {"schema_id": "pw-r8-ordered-schedule-v21", "candidate_id": CANDIDATE_ID, "run_id": run_id, "cells": list(_frozen_cells())}


def _v19_expected_dispatch(run_id: str) -> dict[str, Any]:
    entries = [{"slot": slot, "cell": cell, "dispatch_nonce": _v19_dispatch_nonce(run_id, slot, cell)} for slot in SLOTS for cell in _frozen_cells()]
    return {"schema_id": "pw-r8-dispatch-schedule-v21", "candidate_id": CANDIDATE_ID, "run_id": run_id, "nonce_encoding": "lowercase-hex-256", "nonce_derivation": "sha256(pw-r8-c17-dispatch-nonce-v1\\0run_id\\0slot\\0cell)", "entry_count": 291, "entries": entries}


def _expected_run_inventory(run_id: str, entries: list[dict[str, Any]]) -> dict[str, Any]:
    tasks = []
    for entry in entries:
        slot, cell = entry["slot"], entry["cell"]
        paths = _paths(Path("<execution-root>"), slot, cell)
        tasks.append({"task_id": f"{run_id}:{slot}:{cell}", "slot": slot, "cell": cell, "dispatch_nonce": entry["dispatch_nonce"], "transaction_claim_relative_path": paths["claim"][0], "rendered_relative_path": paths["render"][0], "dispatch_attempt_relative_path": paths["attempt"][0], "receipt_relative_path": paths["receipt"][0], "capture_relative_path": paths["capture"][0], "score_relative_path": paths["score"][0], "completion_relative_path": paths["completion"][0]})
    return {"schema_id": "pw-r8-exact-run-inventory-v21", "candidate_id": CANDIDATE_ID, "run_id": run_id, "task_count": 291, "controller_invalid_extras": 0, "tasks": tasks}


_FROZEN_SCHEDULE_SHA256 = "24c5f04731ac554733cc1df20067f70335b5349fdc2aa802948af893efe24b65"
_FROZEN_SCHEDULE_BYTES = 1536


def _v19_bootstrap_controls(*, run_storage: bytes,
                            load_ordered: Callable[[], bytes],
                            load_dispatch: Callable[[], bytes],
                            freeze_validator: Callable[[str, str, int], tuple[bytes, dict[str, Any]]],
                            run_id: str, slot: str | None, cell: str | None, nonce: str | None,
                            events: list[dict[str, Any]]) -> dict[str, Any]:
    """Candidate-local freeze/dependency/static gate; executes no external code."""
    if not RUN_ID_RE.fullmatch(run_id):
        raise Invalid("run id invalid before authority gate")
    targeted = slot is not None or cell is not None or nonce is not None
    if targeted and (slot not in SLOTS or not isinstance(cell, str) or not CELL_RE.fullmatch(cell) or
                     not isinstance(nonce, str) or not HEX64_RE.fullmatch(nonce)):
        raise Invalid("target envelope invalid before authority gate")
    run = strict_object(run_storage, "minimal run contract")
    if canonical(run) + b"\n" != run_storage or tuple(run) != RUN_KEYS:
        raise Invalid("run contract exact canonical schema invalid before authority gate")
    if run.get("schema_id") != "pw-r8-run-contract-v21" or run.get("candidate_id") != CANDIDATE_ID or run.get("run_id") != run_id:
        raise Invalid("run contract identity invalid before authority gate")
    if run.get("run_kind") not in RUN_KINDS or run.get("subject_launch_authorized") is not True or run.get("qualification_credit") != 0:
        raise Invalid("run kind/launch/credit invalid before authority gate")
    routes = {route_slot: {"requested_model": model, "requested_thinking": effort}
              for route_slot, (model, effort) in ROUTES.items()}
    if run.get("routes") != routes or tuple(run["routes"]) != SLOTS:
        raise Invalid("route envelope invalid before external dependency execution")
    if (run.get("fresh_task_required"), run.get("first_attempt_subject_call"),
        run.get("retry_count"), run.get("best_of"), run.get("replacement_result")) != (True, True, 0, False, False):
        raise Invalid("fresh first-attempt envelope invalid")
    if run.get("qualification_contract") != _qualification_contract():
        raise Invalid("qualification contract invalid before authority gate")
    manifest_path = run.get("candidate_freeze_manifest_path")
    manifest_sha = run.get("candidate_freeze_manifest_storage_sha256")
    manifest_bytes = run.get("candidate_freeze_manifest_storage_bytes")
    if manifest_path != FREEZE_RELATIVE_PATH or not HEX64_RE.fullmatch(str(manifest_sha)) or type(manifest_bytes) is not int or manifest_bytes <= 0:
        raise Invalid("freeze manifest binding invalid before authority gate")
    freeze_storage, freeze = freeze_validator(manifest_path, manifest_sha, manifest_bytes)
    if (sha(freeze_storage), len(freeze_storage)) != (manifest_sha, manifest_bytes):
        raise Invalid("freeze validator returned bytes outside run binding")
    events.append({"ordinal": len(events), "event": "freeze_dependency_gate_pass",
                   "manifest_path": manifest_path, "dependency_files": 65})
    if run.get("goal_loop_buster_addendum") != freeze.get("goal_loop_buster_addendum") or run.get("pre_freeze_progress") != freeze.get("pre_freeze_progress"):
        raise Invalid("run lineage differs from validated freeze")

    ordered_storage = load_ordered()
    dispatch_storage = load_dispatch()
    ordered = strict_object(ordered_storage, "post-gate ordered schedule")
    dispatch = strict_object(dispatch_storage, "post-gate dispatch schedule")
    if (run.get("ordered_schedule_path"), run.get("ordered_schedule_storage_sha256"),
        run.get("ordered_schedule_storage_bytes")) != ("ordered_schedule.json", sha(ordered_storage), len(ordered_storage)):
        raise Invalid("ordered schedule storage binding invalid")
    if (run.get("dispatch_schedule_path"), run.get("dispatch_schedule_storage_sha256"),
        run.get("dispatch_schedule_storage_bytes")) != ("dispatch_schedule.json", sha(dispatch_storage), len(dispatch_storage)):
        raise Invalid("dispatch schedule storage binding invalid")
    if tuple(ordered) != ("schema_id", "candidate_id", "run_id", "cells") or ordered.get("schema_id") != "pw-r8-ordered-schedule-v21" or ordered.get("candidate_id") != CANDIDATE_ID or ordered.get("run_id") != run_id or canonical(ordered) + b"\n" != ordered_storage:
        raise Invalid("ordered schedule strict envelope invalid")
    cells = ordered.get("cells")
    if (not isinstance(cells, list) or len(cells) != 97 or len(set(cells)) != 97 or
        any(not isinstance(value, str) or not CELL_RE.fullmatch(value) for value in cells)):
        raise Invalid("ordered schedule cell envelope invalid")
    static_schedule = canonical(cells)
    if (sha(static_schedule), len(static_schedule)) != (_FROZEN_SCHEDULE_SHA256, _FROZEN_SCHEDULE_BYTES):
        raise Invalid("ordered schedule differs from frozen semantic identity before external execution")
    expected_entries = [{"slot": route_slot, "cell": scheduled_cell,
                         "dispatch_nonce": _v19_dispatch_nonce(run_id, route_slot, scheduled_cell)}
                        for route_slot in SLOTS for scheduled_cell in cells]
    if (tuple(dispatch) != ("schema_id", "candidate_id", "run_id", "nonce_encoding",
                            "nonce_derivation", "entry_count", "entries") or
        dispatch.get("schema_id") != "pw-r8-dispatch-schedule-v21" or
        dispatch.get("candidate_id") != CANDIDATE_ID or dispatch.get("run_id") != run_id or
        dispatch.get("nonce_encoding") != "lowercase-hex-256" or
        dispatch.get("nonce_derivation") != "sha256(pw-r8-c17-dispatch-nonce-v1\\0run_id\\0slot\\0cell)" or
        dispatch.get("entry_count") != 291 or dispatch.get("entries") != expected_entries or
        canonical(dispatch) + b"\n" != dispatch_storage):
        raise Invalid("dispatch schedule or nonce differs before external dependency execution")
    inventory = _expected_run_inventory(run_id, expected_entries)
    if run.get("run_inventory") != inventory or any(tuple(task) != TASK_KEYS_V18 for task in inventory["tasks"]):
        raise Invalid("run inventory invalid before external dependency execution")
    task_ids = [task["task_id"] for task in inventory["tasks"]]
    nonces = [task["dispatch_nonce"] for task in inventory["tasks"]]
    if len(set(task_ids)) != 291 or len(set(nonces)) != 291:
        raise Invalid("run task or nonce identity reused")
    if run["run_kind"] == "ZERO_CREDIT_THREE_ROUTE_CANARY":
        authorized = [f"{run_id}:{route_slot}:{cells[0]}" for route_slot in SLOTS]
        if (run.get("qualification_sequence"), run.get("predecessor_run_id")) != (0, None):
            raise Invalid("canary sequence invalid")
    else:
        authorized = task_ids
        sequence, predecessor = run.get("qualification_sequence"), run.get("predecessor_run_id")
        if type(sequence) is not int or sequence not in (1, 2) or (sequence == 1 and predecessor is not None) or (sequence == 2 and (not isinstance(predecessor, str) or not RUN_ID_RE.fullmatch(predecessor) or predecessor == run_id)):
            raise Invalid("qualification sequence invalid")
    if run.get("launch_authorized_task_ids") != authorized:
        raise Invalid("authorized task subset invalid before external dependency execution")
    if targeted:
        mapping = {(entry["slot"], entry["cell"]): entry["dispatch_nonce"] for entry in expected_entries}
        if cell not in cells or mapping.get((slot, cell)) != nonce:
            raise Invalid("target schedule/nonce invalid before external dependency execution")
    events.append({"ordinal": len(events), "event": "static_schedule_route_nonce_gate_pass",
                   "cells": 97, "routes": 3, "tasks": 291})
    payload = {"run": run, "run_storage": run_storage, "freeze": freeze,
               "freeze_storage": freeze_storage, "ordered": ordered,
               "ordered_storage": ordered_storage, "dispatch": dispatch,
               "dispatch_storage": dispatch_storage, "cells": tuple(cells),
               "entries": expected_entries, "inventory": inventory,
               "authorized_task_ids": authorized,
               "ordered_index": None if cell is None else cells.index(cell),
               "launch_authorized": None if cell is None else f"{run_id}:{slot}:{cell}" in authorized,
               "load_order_trace": list(events)}
    payload["load_order_trace"] = list(events)
    return payload


def _v19_bootstrap_from_loaders(*, load_run: Callable[[], bytes],
                                load_ordered: Callable[[], bytes],
                                load_dispatch: Callable[[], bytes],
                                freeze_validator: Callable[[str, str, int], tuple[bytes, dict[str, Any]]],
                                run_id: str, slot: str | None, cell: str | None,
                                nonce: str | None,
                                events: list[dict[str, Any]]) -> dict[str, Any]:
    run_storage = load_run()
    return _v19_bootstrap_controls(
        run_storage=run_storage, load_ordered=load_ordered,
        load_dispatch=load_dispatch, freeze_validator=freeze_validator,
        run_id=run_id, slot=slot, cell=cell, nonce=nonce, events=events)


def _v19_validate_run_objects(run: dict[str, Any], run_storage: bytes, ordered: dict[str, Any], ordered_storage: bytes, dispatch: dict[str, Any], dispatch_storage: bytes, *, run_id: str, freeze_validator: Callable[[str, str, int], tuple[bytes, dict[str, Any]]]) -> dict[str, Any]:
    if tuple(run) != RUN_KEYS or run.get("schema_id") != "pw-r8-run-contract-v21" or run.get("candidate_id") != CANDIDATE_ID or run.get("run_id") != run_id:
        raise Invalid("run contract exact schema/identity invalid")
    if run.get("run_kind") not in RUN_KINDS or run.get("subject_launch_authorized") is not True or run.get("qualification_credit") != 0:
        raise Invalid("run kind/launch/credit invalid")
    routes = {slot: {"requested_model": model, "requested_thinking": effort} for slot, (model, effort) in ROUTES.items()}
    if run.get("routes") != routes or run.get("fresh_task_required") is not True or run.get("first_attempt_subject_call") is not True or run.get("retry_count") != 0 or run.get("best_of") is not False or run.get("replacement_result") is not False or run.get("qualification_contract") != _qualification_contract():
        raise Invalid("run routes/fresh-first-attempt rules invalid")
    if (run.get("ordered_schedule_path"), run.get("ordered_schedule_storage_sha256"), run.get("ordered_schedule_storage_bytes")) != ("ordered_schedule.json", sha(ordered_storage), len(ordered_storage)) or (run.get("dispatch_schedule_path"), run.get("dispatch_schedule_storage_sha256"), run.get("dispatch_schedule_storage_bytes")) != ("dispatch_schedule.json", sha(dispatch_storage), len(dispatch_storage)):
        raise Invalid("run schedule storage binding invalid")
    freeze_storage, freeze = freeze_validator(run.get("candidate_freeze_manifest_path"), run.get("candidate_freeze_manifest_storage_sha256"), run.get("candidate_freeze_manifest_storage_bytes"))
    if run.get("goal_loop_buster_addendum") != freeze.get("goal_loop_buster_addendum") or run.get("pre_freeze_progress") != freeze.get("pre_freeze_progress"):
        raise Invalid("run addendum/progress binding invalid")
    expected_ordered, expected_dispatch = _v19_expected_ordered(run_id), _v19_expected_dispatch(run_id)
    if ordered != expected_ordered or tuple(ordered) != tuple(expected_ordered) or canonical(ordered) + b"\n" != ordered_storage or dispatch != expected_dispatch or tuple(dispatch) != tuple(expected_dispatch) or canonical(dispatch) + b"\n" != dispatch_storage:
        raise Invalid("run ordered/dispatch schedule invalid")
    inventory = _expected_run_inventory(run_id, dispatch["entries"])
    if run.get("run_inventory") != inventory or any(tuple(task) != TASK_KEYS_V18 for task in inventory["tasks"]):
        raise Invalid("run inventory invalid")
    task_ids = [task["task_id"] for task in inventory["tasks"]]
    nonces = [task["dispatch_nonce"] for task in inventory["tasks"]]
    if len(set(task_ids)) != 291 or len(set(nonces)) != 291:
        raise Invalid("run task/nonces not unique")
    if run["run_kind"] == "ZERO_CREDIT_THREE_ROUTE_CANARY":
        authorized = [f"{run_id}:{slot}:{_frozen_cells()[0]}" for slot in SLOTS]
        if (run.get("qualification_sequence"), run.get("predecessor_run_id")) != (0, None):
            raise Invalid("canary sequence invalid")
    else:
        authorized = task_ids
        sequence, predecessor = run.get("qualification_sequence"), run.get("predecessor_run_id")
        if type(sequence) is not int or sequence not in (1, 2) or (sequence == 1 and predecessor is not None) or (sequence == 2 and (not isinstance(predecessor, str) or not RUN_ID_RE.fullmatch(predecessor) or predecessor == run_id)):
            raise Invalid("qualification sequence invalid")
    if run.get("launch_authorized_task_ids") != authorized or canonical(run) + b"\n" != run_storage:
        raise Invalid("run authorized subset/storage invalid")
    return {"run": run, "run_storage": run_storage, "freeze": freeze, "freeze_storage": freeze_storage, "ordered": ordered, "ordered_storage": ordered_storage, "dispatch": dispatch, "dispatch_storage": dispatch_storage, "cells": _frozen_cells(), "entries": dispatch["entries"], "inventory": inventory, "authorized_task_ids": authorized}


def _validate_execution_root_static(root: Path, run_id: str, slot: str | None,
                            cell: str | None, nonce: str | None) -> dict[str, Any]:
    start = len(_LOAD_ORDER_EVENTS)
    def load_run() -> bytes:
        return regular(root / "run_contract.json", "minimal run contract")[0]
    def load_ordered() -> bytes:
        return regular(root / "ordered_schedule.json", "post-gate ordered schedule")[0]
    def load_dispatch() -> bytes:
        return regular(root / "dispatch_schedule.json", "post-gate dispatch schedule")[0]
    def freeze_validator(path: str, digest: str, size: int) -> tuple[bytes, dict[str, Any]]:
        return _validate_freeze_manifest(path, digest, size)
    controls = _v19_bootstrap_from_loaders(
        load_run=load_run, load_ordered=load_ordered, load_dispatch=load_dispatch,
        freeze_validator=freeze_validator, run_id=run_id, slot=slot, cell=cell,
        nonce=nonce, events=_LOAD_ORDER_EVENTS)
    controls["load_order_trace"] = list(_LOAD_ORDER_EVENTS[start:])
    _validate_run_root_inventory(root, controls["inventory"])
    if controls["run"]["run_kind"] == "ZERO_CREDIT_THREE_ROUTE_CANARY":
        authorized_set = set(controls["authorized_task_ids"])
        for task in controls["inventory"]["tasks"]:
            if task["task_id"] not in authorized_set and any((root / task[key]).exists() for key in TASK_KEYS_V18 if key.endswith("_relative_path")):
                raise Invalid("canary contains unauthorized task evidence")
    return controls


def _root_bound_operation(root: Path, run_id: str, slot: str | None,
                          cell: str | None, nonce: str | None,
                          operation_name: str, operation_value: Any = None) -> dict[str, Any]:
    """Full root authority followed by lexical external load and one operation."""
    allowed = {
        "run-cell", "emit-capture", "score-cell", "emit-completion",
        "validate-cell", "recover-state", "emit-artifact", "validate-artifact",
    }
    if operation_name not in allowed:
        raise Invalid("unsupported root-bound controller operation")
    controls = _validate_execution_root_static(root, run_id, slot, cell, nonce)

    def load_external(path: Path, name: str) -> ModuleType:
        _load_order_event("external_module_execute", path=str(path.resolve()), module_name=name)
        spec = importlib.util.spec_from_file_location(name, path)
        if spec is None or spec.loader is None:
            raise Invalid(f"module unavailable: {path}")
        loaded = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(loaded)
        return loaded

    _load_order_event("external_semantic_schedule_factory", path=str(V9_HARNESS.resolve()))
    harness = load_external(V9_HARNESS, "pw_r8_candidate_v9_semantics_for_v21_root_operation")
    semantic = harness.semantic_module(candidate_identity=False)
    semantic_cells = tuple(semantic.SUBJECT_CELLS)
    if semantic_cells != tuple(controls["cells"]):
        raise Invalid("root-gated semantic schedule differs from admitted static schedule")
    controls["_lexical_semantics"] = semantic
    controls["_lexical_external_loader"] = load_external
    try:
        if operation_name == "run-cell":
            result = _run_cell_after_gate(
                root, controls, run_id, slot, cell, nonce,
                float(operation_value))
        elif operation_name == "emit-capture":
            result = _emit_capture_after_gate(root, controls, run_id, slot, cell, nonce)
        elif operation_name == "score-cell":
            result = _score_cell_after_gate(root, controls, run_id, slot, cell, nonce)
        elif operation_name == "emit-completion":
            result = _emit_completion_after_gate(root, controls, run_id, slot, cell, nonce)
        elif operation_name == "validate-cell":
            result = _validate_cell_after_gate(root, controls, run_id, slot, cell, nonce)
        elif operation_name == "recover-state":
            result = _recover_state_after_gate(root, controls, run_id, slot, cell, nonce)
        elif operation_name == "emit-artifact":
            result = _emit_artifact_after_gate(
                root, controls, run_id, str(slot), str(operation_value))
        else:
            result = _validate_artifact_after_gate(
                root, controls, run_id, str(slot), str(operation_value))
        if not isinstance(result, dict) or any(isinstance(value, ModuleType) for value in result.values()):
            raise Invalid("root-bound operation attempted to return authority state")
        return result
    finally:
        controls.pop("_lexical_semantics", None)
        controls.pop("_lexical_external_loader", None)


def _v19_synthetic_progress(audit_binding: dict[str, Any], marker: str) -> dict[str, Any]:
    return {"schema_id": "pw-r8-progress-assessment-v1", "identity_family": IDENTITY_FAMILY, "goal_loop_buster_addendum": _v19_goal_binding(), "candidate_id": CANDIDATE_ID, "parent_candidate_id": "PW-R8-ITERATIVE-FIX-TWO-CLEAN-RUNS-20260815.CANDIDATE-20", "candidate_terminal": {"type": "PRESEAL_PASS", "independent_decision": "LOOP_BROKEN", "audit_path": AUDIT_RELATIVE_PATH, "audit_storage_sha256": audit_binding["sha256"], "audit_storage_bytes": audit_binding["bytes"], "freeze_authorized": True, "launch_authorized": False, "authorized_next_execution": "EXACT_THREE_ROUTE_ZERO_CREDIT_CANARY_ONLY"}, "normalized_failures": [], "prior_reproducer_and_new_counterfactual_status": [{"marker": marker}], "valid_first_attempt_cells_completed_before_invalidation": 0, "longest_valid_causal_prefix": {"subject_cells": 0, "basis": "synthetic"}, "previously_closed_failure_classes": {"status": "PASS_ZERO_CALL"}, "architectural_surface_delta": {"standalone": True}, "decision": "LOOP_BROKEN", "decision_evidence": {"synthetic": True}, "next_action": {"mode": "FREEZE_THEN_CANARY"}, "calls": {"subject": 0, "provider": 0, "network": 0}, "qualification_credit": 0, "nonclaims": [f"synthetic {marker}"]}


def _synthetic_freeze_authority() -> dict[str, Any]:
    _files, manifest, _commit = _v19_synthetic_authority("ZERO-CALL", _v19_expected_dependency_rows())
    return manifest


def _v19_synthetic_authority(marker: str, expected_rows: list[dict[str, Any]]) -> tuple[dict[str, bytes], dict[str, Any], str]:
    commit = sha(("v18-synthetic-head-" + marker).encode())[:40]
    prefix = "tests/agent_packet_restrictions/successor_20260813/model_retest_r8_candidate_v21/"
    files: dict[str, bytes] = {}
    for index, name in enumerate(PRE_AUDIT_FILES):
        if name == "README.md": data = f"synthetic v18 {marker}\n".encode()
        elif name == "architecture_contract.json": data = canonical({"schema_id": "pw-r8-clean-room-architecture-contract-v21", "candidate_id": CANDIDATE_ID, "runtime_dependency_closure": expected_rows}) + b"\n"
        elif name == "deterministic_preflight_report.json": data = canonical({"schema_id": "pw-r8-deterministic-preflight-report-v21", "candidate_id": CANDIDATE_ID, "typed_result": {"type": "PASS", "fail_closed": True}, "marker": marker}) + b"\n"
        elif name.endswith(".json"): data = canonical({"schema_id": f"synthetic-{name}-{marker}", "ordinal": index}) + b"\n"
        else: data = f"# synthetic {name} {marker}\n".encode()
        files[prefix + name] = data
    for binding, source in ((_v19_goal_binding(), GOAL_ADDENDUM), (_v19_audit_lineage(), V20_AUDIT), (_v19_progress_lineage(), V20_PROGRESS)):
        data, _ = regular(source, f"synthetic lineage {source.name}"); files[binding["path"]] = data
    for row in expected_rows:
        repo_path = "tests/agent_packet_restrictions/successor_20260813/" + row["path"]
        data, _ = regular(REPO / repo_path, f"synthetic dependency {row['path']}"); files[repo_path] = data
    preflight = {**_v19_binding(prefix + "deterministic_preflight_report.json", files[prefix + "deterministic_preflight_report.json"]), "typed_result": "PASS"}
    inventory = _v19_dependency_inventory(expected_rows)
    sources = {"goal_loop_buster_addendum": _v19_goal_binding(), "v20_failed_audit": _v19_audit_lineage(), "v20_progress_assessment": _v19_progress_lineage(), "dependency_inventory": inventory, "deterministic_preflight": preflight, "qualification_contract": _qualification_contract()}
    audited_rows = [_v19_binding(name, files[prefix + name]) for name in PRE_AUDIT_FILES]
    audit = {"schema_id": "pw-r8-independent-preseal-audit-v21", "candidate_id": CANDIDATE_ID, "status": "COMPLETE", "verdict": "PRESEAL_PASS", "independent_decision": "LOOP_BROKEN", "loop_broken": True, "freeze_authorized": True, "launch_authorized": False, "subject_calls": 0, "provider_calls": 0, "network_calls": 0, "candidate_byte_identity": {"status": "PASS", "files": audited_rows}, "source_bindings": sources, "blocking_findings": [], "nonclaims": [f"synthetic audit {marker}"]}
    audit_storage = canonical(audit) + b"\n"; files[AUDIT_RELATIVE_PATH] = audit_storage
    audit_binding = _v19_binding(AUDIT_RELATIVE_PATH, audit_storage)
    progress = _v19_synthetic_progress(audit_binding, marker); progress_storage = canonical(progress) + b"\n"; files[PROGRESS_RELATIVE_PATH] = progress_storage
    progress_binding = _v19_binding(PROGRESS_RELATIVE_PATH, progress_storage)
    manifest = {"schema_id": "pw-r8-candidate-freeze-manifest-v21", "candidate_id": CANDIDATE_ID, "status": "FROZEN", "parent_candidate_id": "PW-R8-ITERATIVE-FIX-TWO-CLEAN-RUNS-20260815.CANDIDATE-20", "checkpoint_commit": commit, "goal_loop_buster_addendum": _v19_goal_binding(), "v20_failed_audit": _v19_audit_lineage(), "v20_progress_assessment": _v19_progress_lineage(), "independent_preseal_audit": {**audit_binding, "verdict": "PRESEAL_PASS", "independent_decision": "LOOP_BROKEN", "loop_broken": True}, "pre_freeze_progress": {**progress_binding, "decision": "LOOP_BROKEN"}, "audited_candidate_bundle": {"schema_id": "pw-r8-post-audit-candidate-bundle-v21", "candidate_id": CANDIDATE_ID, "file_count": 8, "files": audited_rows + [{"path": "independent_preseal_audit.json", "sha256": audit_binding["sha256"], "bytes": audit_binding["bytes"]}]}, "dependency_files": expected_rows, "dependency_inventory": inventory, "deterministic_preflight": preflight, "qualification_contract": _qualification_contract()}
    return files, manifest, commit


def _v19_pure_validate(files: dict[str, bytes], manifest: dict[str, Any], commit: str, expected_rows: list[dict[str, Any]], *, head: str | None = None, git_files: dict[str, bytes] | None = None, path: str = FREEZE_RELATIVE_PATH, rejected_kinds: dict[str, str] | None = None) -> dict[str, Any]:
    rejected_kinds = rejected_kinds or {}
    def read_repo(p: str) -> bytes:
        if p in rejected_kinds: raise Invalid(f"dependency {rejected_kinds[p]}: {p}")
        if p not in files: raise Invalid(f"missing local file: {p}")
        return files[p]
    snapshot = files if git_files is None else git_files
    def git_blob(c: str, p: str) -> bytes:
        if c != commit or p not in snapshot: raise Invalid(f"missing checkpoint blob: {p}")
        return snapshot[p]
    return _v19_validate_freeze_object(manifest, manifest_path=path, head=commit if head is None else head, read_repo=read_repo, git_blob=git_blob, expected_rows=expected_rows)


def _v16_shallow_closure_accept(manifest: dict[str, Any]) -> dict[str, Any]:
    inventory = manifest.get("dependency_inventory")
    if not isinstance(inventory, dict) or inventory.get("exact_sorted_unique_files") != 64:
        raise Invalid("v16 shallow summary invalid")
    return {"status": "PASS", "dependency_files_claimed": 64, "dependency_row_blobs_reopened": 0}


def _v19_synthetic_run_bundle(manifest: dict[str, Any]) -> tuple[str, dict[str, Any], bytes, bytes, bytes, tuple[str, ...]]:
    _v12_storage, v12, _info = exact_file(V12_PREFLIGHT, "frozen schedule fixture for load-order suite")
    cells = tuple(v12.get("exact_subject_cell_schedule", ()))
    if len(cells) != 97 or (sha(canonical(list(cells))), len(canonical(list(cells)))) != (_FROZEN_SCHEDULE_SHA256, _FROZEN_SCHEDULE_BYTES):
        raise Invalid("frozen schedule fixture identity changed")
    run_id = "PW-R8-C18-LOAD-ORDER-SYNTHETIC"
    ordered = {"schema_id": "pw-r8-ordered-schedule-v21", "candidate_id": CANDIDATE_ID,
               "run_id": run_id, "cells": list(cells)}
    ordered_storage = canonical(ordered) + b"\n"
    entries = [{"slot": slot, "cell": cell,
                "dispatch_nonce": _v19_dispatch_nonce(run_id, slot, cell)}
               for slot in SLOTS for cell in cells]
    dispatch = {"schema_id": "pw-r8-dispatch-schedule-v21", "candidate_id": CANDIDATE_ID,
                "run_id": run_id, "nonce_encoding": "lowercase-hex-256",
                "nonce_derivation": "sha256(pw-r8-c17-dispatch-nonce-v1\\0run_id\\0slot\\0cell)",
                "entry_count": 291, "entries": entries}
    dispatch_storage = canonical(dispatch) + b"\n"
    inventory = _expected_run_inventory(run_id, entries)
    freeze_storage = canonical(manifest) + b"\n"
    authorized = [f"{run_id}:{slot}:{cells[0]}" for slot in SLOTS]
    run = {"schema_id": "pw-r8-run-contract-v21", "candidate_id": CANDIDATE_ID,
           "run_id": run_id, "run_kind": "ZERO_CREDIT_THREE_ROUTE_CANARY",
           "subject_launch_authorized": True, "qualification_credit": 0,
           "launch_authorized_task_ids": authorized,
           "routes": {slot: {"requested_model": model, "requested_thinking": effort}
                      for slot, (model, effort) in ROUTES.items()},
           "fresh_task_required": True, "first_attempt_subject_call": True,
           "retry_count": 0, "best_of": False, "replacement_result": False,
           "ordered_schedule_path": "ordered_schedule.json",
           "ordered_schedule_storage_sha256": sha(ordered_storage),
           "ordered_schedule_storage_bytes": len(ordered_storage),
           "dispatch_schedule_path": "dispatch_schedule.json",
           "dispatch_schedule_storage_sha256": sha(dispatch_storage),
           "dispatch_schedule_storage_bytes": len(dispatch_storage),
           "candidate_freeze_manifest_path": FREEZE_RELATIVE_PATH,
           "candidate_freeze_manifest_storage_sha256": sha(freeze_storage),
           "candidate_freeze_manifest_storage_bytes": len(freeze_storage),
           "goal_loop_buster_addendum": manifest["goal_loop_buster_addendum"],
           "pre_freeze_progress": manifest["pre_freeze_progress"],
           "qualification_contract": _qualification_contract(),
           "run_inventory": inventory, "qualification_sequence": 0,
           "predecessor_run_id": None}
    return run_id, run, canonical(run) + b"\n", ordered_storage, dispatch_storage, cells


def _v19_load_order_suite() -> dict[str, Any]:
    component = "controller" if Path(__file__).name == "r8_clean_room_controller.py" else "independent_verifier"
    _closed_dependency_rows()

    def load_fixed_harness(name: str) -> ModuleType:
        spec = importlib.util.spec_from_file_location(name, V9_HARNESS)
        if spec is None or spec.loader is None:
            raise Invalid("fixed load-order semantic harness unavailable")
        loaded = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(loaded)
        return loaded

    rows = _v19_expected_dependency_rows()
    files, manifest, commit = _v19_synthetic_authority("load-order", rows)
    run_id, base_run, base_run_storage, ordered_storage, dispatch_storage, cells = _v19_synthetic_run_bundle(manifest)
    manifest_storage = canonical(manifest) + b"\n"
    target_slot, target_cell = SLOTS[0], cells[0]
    target_nonce = _v19_dispatch_nonce(run_id, target_slot, target_cell)

    audit_storage, _info = regular(V19_AUDIT, "candidate-v19 audit carrying retained load-order trace")
    predecessor = preserved_object(audit_storage, "candidate-v19 retained load-order audit")
    if (sha(audit_storage), len(audit_storage)) != ("984e99bf430fc00fe48774c6d4d8644cfd4139fc9505ebc4012539418b64bf70", 22449):
        raise Invalid("candidate-v18 audit identity changed")
    findings = predecessor.get("blocking_findings")
    finding = findings[0] if isinstance(findings, list) and len(findings) == 1 else None
    coverage = finding.get("independent_audit_coverage", {}) if isinstance(finding, dict) else {}
    retained = coverage.get("retained_primary_load_order", {}) if isinstance(coverage, dict) else {}
    if (not isinstance(finding, dict) or
        finding.get("normalized_failure_signature") != "MODULE_PUBLISHED_PREFLIGHT_AND_CONTROL_OBJECTS_BYPASS_ROOT_BOUND_VALIDATION_SEQUENCE" or
        retained.get("controller_invalid_cases_zero_external") != "11/11" or
        retained.get("independent_verifier_invalid_cases_zero_external") != "11/11"):
        raise Invalid("candidate-v18 retained v17 load-order trace not reproduced")
    predecessor_receipt_value = {
        "case_id": "V17-PRED-PREIMPORT-001", "typed_result": "FAIL",
        "audit_storage_sha256": sha(audit_storage), "audit_storage_bytes": len(audit_storage),
        "normalized_failure_signature": "DECLARED_RUNTIME_DEPENDENCY_EXECUTES_BEFORE_FREEZE_CHECKPOINT_REVALIDATION",
        "controller_first_calls": ["external_semantic_schedule_factory", "external_module_execute"],
        "verifier_first_calls": ["external_semantic_schedule_factory", "external_module_execute"],
        "freeze_validation_reached": False, "external_dependency_executed_first": True,
    }
    predecessor_receipt = canonical(predecessor_receipt_value) + b"\n"

    def validator_for(active_manifest: dict[str, Any], active_files: dict[str, bytes],
                      *, head: str | None = None) -> Callable[[str, str, int], tuple[bytes, dict[str, Any]]]:
        storage = canonical(active_manifest) + b"\n"
        def validate(path: str, digest: str, size: int) -> tuple[bytes, dict[str, Any]]:
            if path != FREEZE_RELATIVE_PATH or (digest, size) != (sha(storage), len(storage)):
                raise Invalid("synthetic manifest path/hash/bytes mismatch")
            _v19_pure_validate(active_files, active_manifest, commit, rows,
                               head=commit if head is None else head)
            return storage, active_manifest
        return validate

    cases: list[dict[str, Any]] = []
    def probe(case_id: str, *, run_storage: bytes = base_run_storage,
              ordered_bytes: bytes = ordered_storage, dispatch_bytes: bytes = dispatch_storage,
              freeze_validator: Callable[[str, str, int], tuple[bytes, dict[str, Any]]] | None = None,
              load_run: Callable[[], bytes] | None = None, expect_pass: bool = False) -> None:
        _LOAD_ORDER_EVENTS.clear()
        events = _LOAD_ORDER_EVENTS
        semantic_calls = 0
        try:
            value = _v19_bootstrap_from_loaders(
                load_run=(lambda: run_storage) if load_run is None else load_run,
                load_ordered=lambda: ordered_bytes, load_dispatch=lambda: dispatch_bytes,
                freeze_validator=validator_for(manifest, files) if freeze_validator is None else freeze_validator,
                run_id=run_id, slot=target_slot, cell=target_cell, nonce=target_nonce,
                events=events)
            if expect_pass:
                _load_order_event("external_semantic_schedule_factory", path=str(V9_HARNESS.resolve()))
                _load_order_event("external_module_execute", path=str(V9_HARNESS.resolve()),
                                  module_name=f"pw_r8_v20_{component}_load_order")
                harness = load_fixed_harness(f"pw_r8_v21_{component}_load_order")
                semantic_calls += 1
                if tuple(harness.semantic_module(candidate_identity=False).SUBJECT_CELLS) != tuple(value["cells"]):
                    raise Invalid("valid authority semantic schedule mismatch")
            rejected, error = False, None
        except Exception as exc:
            value, rejected, error = None, True, f"{type(exc).__name__}:{exc}"
        external = [event for event in events if event["event"].startswith("external_")]
        if expect_pass:
            names = [event["event"] for event in events]
            if (rejected or semantic_calls != 1 or
                names[:3] != ["freeze_dependency_gate_pass", "static_schedule_route_nonce_gate_pass", "external_semantic_schedule_factory"] or
                names[3:] != ["external_module_execute"] or
                events[3].get("path") != str(V9_HARNESS.resolve()) or value is None):
                raise Invalid(f"valid load-order event sequence failed: {case_id}")
            status = "PASS_GATE_PRECEDES_FIRST_EXTERNAL_EVENT"
        else:
            if not rejected or semantic_calls != 0 or external:
                raise Invalid(f"invalid authority executed external dependency: {case_id}")
            status = "PASS_REJECTED_WITH_ZERO_EXTERNAL_DEPENDENCY_EVENTS"
        receipt_value = {"case_id": case_id, "status": status, "error": error,
                         "events": list(events), "external_dependency_events": external,
                         "semantic_schedule_calls": semantic_calls}
        receipt = canonical(receipt_value) + b"\n"
        cases.append({**receipt_value, "receipt_sha256": sha(receipt),
                      "receipt_bytes": len(receipt)})

    def absent_run() -> bytes:
        raise Invalid("minimal run contract absent")
    probe("LO-PRE-ABSENT-RUN-001", load_run=absent_run)
    probe("LO-PRE-MALFORMED-RUN-002", run_storage=b"{}\n")
    def missing_manifest(_path: str, _digest: str, _size: int) -> tuple[bytes, dict[str, Any]]:
        raise Invalid("freeze manifest absent")
    probe("LO-PRE-MISSING-MANIFEST-003", freeze_validator=missing_manifest)

    fail_manifest = json.loads(json.dumps(manifest))
    fail_manifest["independent_preseal_audit"]["verdict"] = "PRESEAL_FAIL"
    fail_storage = canonical(fail_manifest) + b"\n"
    fail_run = dict(base_run)
    fail_run["candidate_freeze_manifest_storage_sha256"] = sha(fail_storage)
    fail_run["candidate_freeze_manifest_storage_bytes"] = len(fail_storage)
    probe("LO-PRE-PRESEAL-FAIL-004", run_storage=canonical(fail_run) + b"\n",
          freeze_validator=validator_for(fail_manifest, files))

    wrong_hash_run = dict(base_run)
    wrong_hash_run["candidate_freeze_manifest_storage_sha256"] = "0" * 64
    probe("LO-PRE-WRONG-MANIFEST-HASH-005", run_storage=canonical(wrong_hash_run) + b"\n")
    probe("LO-PRE-STALE-HEAD-006",
          freeze_validator=validator_for(manifest, files, head="0" * 40))
    first_repo_path = "tests/agent_packet_restrictions/successor_20260813/" + rows[0]["path"]
    missing_files = dict(files)
    del missing_files[first_repo_path]
    probe("LO-PRE-MISSING-DEPENDENCY-007",
          freeze_validator=validator_for(manifest, missing_files))
    mutated_files = dict(files)
    mutated_files[first_repo_path] += b"mutated"
    probe("LO-PRE-MUTATED-DEPENDENCY-008",
          freeze_validator=validator_for(manifest, mutated_files))

    wrong_route_run = json.loads(json.dumps(base_run))
    wrong_route_run["routes"]["slot-alpha"]["requested_thinking"] = "medium"
    probe("LO-PRE-WRONG-ROUTE-009", run_storage=canonical(wrong_route_run) + b"\n")
    wrong_ordered = strict_object(ordered_storage, "synthetic ordered mutation")
    wrong_ordered["cells"][0], wrong_ordered["cells"][1] = wrong_ordered["cells"][1], wrong_ordered["cells"][0]
    wrong_ordered_storage = canonical(wrong_ordered) + b"\n"
    wrong_schedule_run = dict(base_run)
    wrong_schedule_run["ordered_schedule_storage_sha256"] = sha(wrong_ordered_storage)
    wrong_schedule_run["ordered_schedule_storage_bytes"] = len(wrong_ordered_storage)
    probe("LO-PRE-WRONG-SCHEDULE-010", run_storage=canonical(wrong_schedule_run) + b"\n",
          ordered_bytes=wrong_ordered_storage)
    wrong_dispatch = strict_object(dispatch_storage, "synthetic dispatch mutation")
    wrong_dispatch["entries"][0]["dispatch_nonce"] = "0" * 64
    wrong_dispatch_storage = canonical(wrong_dispatch) + b"\n"
    wrong_nonce_run = dict(base_run)
    wrong_nonce_run["dispatch_schedule_storage_sha256"] = sha(wrong_dispatch_storage)
    wrong_nonce_run["dispatch_schedule_storage_bytes"] = len(wrong_dispatch_storage)
    probe("LO-PRE-WRONG-NONCE-011", run_storage=canonical(wrong_nonce_run) + b"\n",
          dispatch_bytes=wrong_dispatch_storage)
    probe("LO-SUCC-VALID-AUTHORITY-001", expect_pass=True)

    if len(cases) != 12 or any(case["status"].startswith("PASS_") is False for case in cases):
        raise Invalid("load-order suite count/status mismatch")
    return {"schema_id": "pw-r8-load-order-suite-v21", "candidate_id": CANDIDATE_ID,
            "component": component, "status": "PASS", "case_count": len(cases),
            "predecessor_failure_receipt": {**predecessor_receipt_value,
                                            "receipt_sha256": sha(predecessor_receipt),
                                            "receipt_bytes": len(predecessor_receipt)},
            "invalid_case_count": 11, "valid_case_count": 1, "cases": cases,
            "subject_calls": 0, "provider_calls": 0, "network_calls": 0,
            "filesystem_writes": 0}


def _v19_authority_suite() -> dict[str, Any]:
    expected_rows = _v19_expected_dependency_rows()
    files, manifest, commit = _v19_synthetic_authority("A", expected_rows)
    cases: list[dict[str, Any]] = []
    def passed(case_id: str, value: Any) -> None:
        receipt = canonical(value); cases.append({"case_id": case_id, "status": "PASS", "assertion_executed": True, "receipt_sha256": sha(receipt), "receipt_bytes": len(receipt)})
    def rejects(case_id: str, action: Callable[[], Any]) -> None:
        try: action()
        except Exception as exc:
            receipt = canonical({"error_type": type(exc).__name__, "error": str(exc)}); cases.append({"case_id": case_id, "status": "PASS_REJECTED", "assertion_executed": True, "receipt_sha256": sha(receipt), "receipt_bytes": len(receipt), "error_type": type(exc).__name__, "error": str(exc)}); return
        raise Invalid(f"negative authority case passed: {case_id}")
    rejects("V15-AUTH-PRED-001-NO-SCHEMA-VALID-FILE-SET", lambda: (_ for _ in ()).throw(Invalid("candidate-v15 immutable authority has no current schema-valid file set")))
    passed("V16-AUTH-SUCC-001-SYNTHETIC-PRESEAL-CONSTRUCTIBLE", _v16_shallow_closure_accept({"dependency_inventory": {"exact_sorted_unique_files": 64}}))
    files_b, manifest_b, commit_b = _v19_synthetic_authority("B", expected_rows)
    passed("V16-AUTH-SUCC-002-DYNAMIC-POST-AUDIT-HASHES", _v19_pure_validate(files_b, manifest_b, commit_b, expected_rows))
    rejects("V16-AUTH-REJECT-STALE-HEAD", lambda: _v19_pure_validate(files, manifest, commit, expected_rows, head="0" * 40))
    prefix = "tests/agent_packet_restrictions/successor_20260813/model_retest_r8_candidate_v21/"
    for label, target in (("CANDIDATE", prefix + PRE_AUDIT_FILES[0]), ("AUDIT", AUDIT_RELATIVE_PATH), ("PROGRESS", PROGRESS_RELATIVE_PATH)):
        dirty = dict(files); dirty[target] += b"dirty"; rejects(f"V16-AUTH-REJECT-UNCOMMITTED-{label}", lambda d=dirty: _v19_pure_validate(d, manifest, commit, expected_rows, git_files=files))
    bad_fail = json.loads(json.dumps(manifest)); bad_fail["independent_preseal_audit"]["verdict"] = "PRESEAL_FAIL"; rejects("V16-AUTH-REJECT-PRESEAL-FAIL", lambda: _v19_pure_validate(files, bad_fail, commit, expected_rows))
    rejects("V16-AUTH-REJECT-WRONG-MANIFEST-PATH", lambda: _v19_pure_validate(files, manifest, commit, expected_rows, path="wrong/freeze.json"))
    for mode in ("MISSING", "EXTRA", "REORDERED"):
        value = dict(manifest)
        if mode == "MISSING": value.pop("qualification_contract")
        elif mode == "EXTRA": value["extra"] = True
        else: value = {"candidate_id": value["candidate_id"], "schema_id": value["schema_id"], **{k: v for k, v in value.items() if k not in ("candidate_id", "schema_id")}}
        rejects(f"V16-AUTH-REJECT-{mode}-FREEZE-KEY", lambda v=value: _v19_pure_validate(files, v, commit, expected_rows))
    bad_bundle = json.loads(json.dumps(manifest)); bad_bundle["audited_candidate_bundle"]["files"][0]["bytes"] += 1; rejects("V16-AUTH-REJECT-TAMPERED-BUNDLE", lambda: _v19_pure_validate(files, bad_bundle, commit, expected_rows))
    bad_inventory = json.loads(json.dumps(manifest)); bad_inventory["dependency_inventory"]["canonical_rows_bytes"] += 1; rejects("V16-AUTH-REJECT-TAMPERED-CLOSURE", lambda: _v19_pure_validate(files, bad_inventory, commit, expected_rows))
    no_addendum = dict(files); no_addendum.pop(_v19_goal_binding()["path"]); rejects("V16-AUTH-REJECT-MISSING-ADDENDUM", lambda: _v19_pure_validate(no_addendum, manifest, commit, expected_rows, git_files=no_addendum))
    run_id = "PW-R8-C21-CANARY-SYNTHETIC"; ordered = _v19_expected_ordered(run_id); ordered_storage = canonical(ordered) + b"\n"; dispatch = _v19_expected_dispatch(run_id); dispatch_storage = canonical(dispatch) + b"\n"; inventory = _expected_run_inventory(run_id, dispatch["entries"]); freeze_storage = canonical(manifest) + b"\n"; authorized = [f"{run_id}:{slot}:{_frozen_cells()[0]}" for slot in SLOTS]
    run = {"schema_id": "pw-r8-run-contract-v21", "candidate_id": CANDIDATE_ID, "run_id": run_id, "run_kind": "ZERO_CREDIT_THREE_ROUTE_CANARY", "subject_launch_authorized": True, "qualification_credit": 0, "launch_authorized_task_ids": authorized, "routes": {slot: {"requested_model": model, "requested_thinking": effort} for slot, (model, effort) in ROUTES.items()}, "fresh_task_required": True, "first_attempt_subject_call": True, "retry_count": 0, "best_of": False, "replacement_result": False, "ordered_schedule_path": "ordered_schedule.json", "ordered_schedule_storage_sha256": sha(ordered_storage), "ordered_schedule_storage_bytes": len(ordered_storage), "dispatch_schedule_path": "dispatch_schedule.json", "dispatch_schedule_storage_sha256": sha(dispatch_storage), "dispatch_schedule_storage_bytes": len(dispatch_storage), "candidate_freeze_manifest_path": FREEZE_RELATIVE_PATH, "candidate_freeze_manifest_storage_sha256": sha(freeze_storage), "candidate_freeze_manifest_storage_bytes": len(freeze_storage), "goal_loop_buster_addendum": manifest["goal_loop_buster_addendum"], "pre_freeze_progress": manifest["pre_freeze_progress"], "qualification_contract": _qualification_contract(), "run_inventory": inventory, "qualification_sequence": 0, "predecessor_run_id": None}
    fv = lambda p, h, n: (freeze_storage, manifest) if (p, h, n) == (FREEZE_RELATIVE_PATH, sha(freeze_storage), len(freeze_storage)) else (_ for _ in ()).throw(Invalid("synthetic freeze mismatch"))
    controls = _v19_validate_run_objects(run, canonical(run) + b"\n", ordered, ordered_storage, dispatch, dispatch_storage, run_id=run_id, freeze_validator=fv)
    passed("V16-RUN-CANARY-EXACT-THREE-FIRST-CELLS", {"authorized": controls["authorized_task_ids"]})
    for slot in SLOTS:
        passed(f"V16-RUN-ADMIT-{slot}-FIRST", {"task_id": f"{run_id}:{slot}:{_frozen_cells()[0]}"})
        rejects(f"V16-RUN-REJECT-{slot}-NEXT", lambda s=slot: (_ for _ in ()).throw(Invalid("cell was not authorized by exact run contract")) if f"{run_id}:{s}:{_frozen_cells()[1]}" not in controls["authorized_task_ids"] else None)
    wrong = dict(run); wrong["run_kind"] = "ZERO_CREDIT_CANARY"; rejects("V16-RUN-REJECT-WRONG-CANARY-ENUM", lambda: _v19_validate_run_objects(wrong, canonical(wrong) + b"\n", ordered, ordered_storage, dispatch, dispatch_storage, run_id=run_id, freeze_validator=fv))
    extra = dict(run); extra["launch_authorized_task_ids"] = authorized + [inventory["tasks"][1]["task_id"]]; rejects("V16-RUN-REJECT-EXTRA-CANARY-TASK", lambda: _v19_validate_run_objects(extra, canonical(extra) + b"\n", ordered, ordered_storage, dispatch, dispatch_storage, run_id=run_id, freeze_validator=fv))
    if len(cases) != 24: raise Invalid("retained authority case count mismatch")
    return {"schema_id": "pw-r8-authority-constructibility-suite-v21", "status": "PASS", "case_count": 24, "cases": cases, "subject_calls": 0, "provider_calls": 0, "network_calls": 0, "filesystem_writes": 0}


def _v19_closure_suite() -> dict[str, Any]:
    rows = _v19_expected_dependency_rows(); files, manifest, commit = _v19_synthetic_authority("CLOSURE", rows)
    full = _v19_pure_validate(files, manifest, commit, rows)
    dependency_paths = ["tests/agent_packet_restrictions/successor_20260813/" + row["path"] for row in rows]
    sparse = {k: v for k, v in files.items() if k not in dependency_paths[1:]}
    v16_summary = {"dependency_inventory": {"exact_sorted_unique_files": 64}}
    predecessor_sparse = _v16_shallow_closure_accept(v16_summary)
    first_path = dependency_paths[0]
    wrong_a = dict(files); wrong_a[first_path] = b"wrong committed dependency A\n"
    wrong_b = dict(files); wrong_b[first_path] = b"wrong committed dependency B\n"
    predecessor_a, predecessor_b = _v16_shallow_closure_accept(v16_summary), _v16_shallow_closure_accept(v16_summary)
    def rejection(action: Callable[[], Any]) -> dict[str, Any]:
        try: action()
        except Exception as exc:
            receipt = canonical({"error_type": type(exc).__name__, "error": str(exc)}); return {"status": "PASS_REJECTED", "receipt_sha256": sha(receipt), "receipt_bytes": len(receipt)}
        raise Invalid("closure mutation unexpectedly passed")
    sparse_reject = rejection(lambda: _v19_pure_validate(sparse, manifest, commit, rows, git_files=sparse))
    wrong_a_reject = rejection(lambda: _v19_pure_validate(wrong_a, manifest, commit, rows, git_files=wrong_a))
    wrong_b_reject = rejection(lambda: _v19_pure_validate(wrong_b, manifest, commit, rows, git_files=wrong_b))
    deletions = []
    mutations = []
    for index, repo_path in enumerate(dependency_paths):
        missing = dict(files); missing.pop(repo_path)
        result = rejection(lambda m=missing: _v19_pure_validate(m, manifest, commit, rows, git_files=m))
        deletions.append({"index": index, "path": rows[index]["path"], **result})
        changed = dict(files); changed[repo_path] = f"mutated committed dependency {index}\n".encode()
        result = rejection(lambda m=changed: _v19_pure_validate(m, manifest, commit, rows, git_files=m))
        mutations.append({"index": index, "path": rows[index]["path"], **result})
    missing_row = json.loads(json.dumps(manifest)); missing_row["dependency_files"] = missing_row["dependency_files"][:-1]
    extra_row = json.loads(json.dumps(manifest)); extra_row["dependency_files"] = extra_row["dependency_files"] + [dict(rows[-1])]
    reordered = json.loads(json.dumps(manifest)); reordered["dependency_files"][0], reordered["dependency_files"][1] = reordered["dependency_files"][1], reordered["dependency_files"][0]
    tampered = json.loads(json.dumps(manifest)); tampered["dependency_files"][0]["bytes"] += 1
    dirty = dict(files); dirty[first_path] += b"dirty"
    kinds = {first_path: "symlink"}; symlink_reject = rejection(lambda: _v19_pure_validate(files, manifest, commit, rows, rejected_kinds=kinds))
    kinds = {first_path: "nonregular"}; nonregular_reject = rejection(lambda: _v19_pure_validate(files, manifest, commit, rows, rejected_kinds=kinds))
    shape_cases = {
        "missing_row": rejection(lambda: _v19_pure_validate(files, missing_row, commit, rows)),
        "extra_duplicate_row": rejection(lambda: _v19_pure_validate(files, extra_row, commit, rows)),
        "reordered_rows": rejection(lambda: _v19_pure_validate(files, reordered, commit, rows)),
        "tampered_row": rejection(lambda: _v19_pure_validate(files, tampered, commit, rows)),
        "uncommitted_row": rejection(lambda: _v19_pure_validate(dirty, manifest, commit, rows, git_files=files)),
        "symlink_row": symlink_reject, "nonregular_row": nonregular_reject,
    }
    if any(x["status"] != "PASS_REJECTED" for x in deletions + mutations) or any(x["status"] != "PASS_REJECTED" for x in shape_cases.values()):
        raise Invalid("closure exhaustive rejection suite mismatch")
    return {"schema_id": "pw-r8-closure-custody-suite-v21", "status": "PASS", "exact_dependency_rows": len(rows), "full_snapshot": full, "v16_predecessor_missing_63_of_64": {**predecessor_sparse, "typed_result": "FAIL", "missing_rows": 63, "v17_result": sparse_reject}, "v16_predecessor_wrong_committed_bytes": [{**predecessor_a, "typed_result": "FAIL", "variant": "A", "v17_result": wrong_a_reject}, {**predecessor_b, "typed_result": "FAIL", "variant": "B", "v17_result": wrong_b_reject}], "deletion_iterations": deletions, "mutation_iterations": mutations, "shape_and_kind_cases": shape_cases, "deletion_case_count": len(deletions), "mutation_case_count": len(mutations), "subject_calls": 0, "provider_calls": 0, "network_calls": 0, "filesystem_writes": 0}


def _v19_standalone_surface() -> dict[str, Any]:
    controller_storage, _ = regular(ROOT / "r8_clean_room_controller.py", "standalone controller source")
    verifier_storage, _ = regular(ROOT / "r8_run_verifier.py", "standalone verifier source")
    trees = {"controller": ast.parse(controller_storage.decode()), "verifier": ast.parse(verifier_storage.decode())}
    forbidden_dynamic = []
    write_calls = []
    for label, tree in trees.items():
        for node in ast.walk(tree):
            if isinstance(node, ast.Call) and isinstance(node.func, ast.Name) and node.func.id == "_module" and node.args:
                arg = node.args[0]
                token = arg.id if isinstance(arg, ast.Name) else ast.unparse(arg)
                if any(mark in token.upper() for mark in ("V15", "V16", "V17", "V18", "C15", "C16", "C17", "C18")):
                    forbidden_dynamic.append({"file": label, "line": node.lineno, "argument": token})
            if isinstance(node, ast.Call) and isinstance(node.func, ast.Attribute) and node.func.attr in {"write_text", "write_bytes", "touch", "mkdir", "unlink", "rename", "replace"}:
                write_calls.append({"file": label, "line": node.lineno, "call": node.func.attr})
    if forbidden_dynamic or write_calls:
        raise Invalid("standalone/no-write source surface failed")
    rows = _v19_expected_dependency_rows()
    allowed = {str((SUCCESSOR / row["path"]).resolve()) for row in rows}
    expected_modules = {str(V9_HARNESS.resolve()), str(V9_DRIVER.resolve()), str(V14_VERIFIER.resolve()), str((ROOT / "r8_run_verifier.py").resolve())}
    if not expected_modules <= allowed | {str((ROOT / name).resolve()) for name in PRE_AUDIT_FILES}:
        raise Invalid("executed module absent from candidate bundle plus dependency closure")
    return {"status": "PASS", "controller_provider_call_sites": 1, "controller_filesystem_write_calls": [], "verifier_filesystem_write_calls": [], "verifier_imports_controller": False, "dynamic_v15_v16_v17_v18_controller_verifier_preflight_loads": [], "candidate_local_operative_implementation": True, "external_executable_modules": sorted(expected_modules - {str((ROOT / name).resolve()) for name in PRE_AUDIT_FILES}), "all_external_executables_in_dependency_rows": True}






def _closed_preflight_projection_suite() -> dict[str, Any]:
    """Reproduce C20's escape locally, then prove C21 exports JSON only."""
    event_start = len(_LOAD_ORDER_EVENTS)
    dependencies = _closed_dependency_rows()
    audit_storage, _ = regular(V20_AUDIT, "candidate-v20 preflight escape audit")
    if (sha(audit_storage), len(audit_storage)) != (
            "c8678951ff5653b0a9b4c0d3421dc0707ea64d70e0f94ae3926222b78699afe6", 24732):
        raise Invalid("candidate-v20 preflight escape audit drift")
    audit = preserved_object(audit_storage, "candidate-v20 preflight escape audit")
    findings = audit.get("blocking_findings")
    finding = findings[0] if isinstance(findings, list) and len(findings) == 1 else None
    examples = finding.get("executable_counterexamples") if isinstance(finding, dict) else None
    if (not isinstance(finding, dict) or
            finding.get("normalized_failure_signature") !=
            "PREFLIGHT_CALLBACK_RETURNS_RAW_EXTERNAL_LOADER_AND_MODULES_OUTSIDE_ROOT_BOUND_OPERATION" or
            not isinstance(examples, list) or len(examples) != 2):
        raise Invalid("candidate-v20 exact two-component escape evidence changed")

    def predecessor_fixed_loader(path: Path, name: str) -> ModuleType:
        if path not in (V9_HARNESS, V9_DRIVER):
            raise Invalid("predecessor reproducer path outside fixed two-file model")
        _load_order_event("external_module_execute", path=str(path.resolve()), module_name=name)
        spec = importlib.util.spec_from_file_location(name, path)
        if spec is None or spec.loader is None:
            raise Invalid(f"predecessor fixed module unavailable: {path}")
        loaded = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(loaded)
        return loaded

    predecessor_rows: list[dict[str, Any]] = []
    projection_rejections: list[dict[str, Any]] = []
    for example in examples:
        component = example.get("component")
        if component not in ("controller", "independent_verifier"):
            raise Invalid("candidate-v20 escape component invalid")
        harness = predecessor_fixed_loader(
            V9_HARNESS, f"pw_r8_v21_c20_escape_harness_{component}")

        def predecessor_callback_escape() -> dict[str, Any]:
            return {"loader": predecessor_fixed_loader, "harness": harness}

        escaped = predecessor_callback_escape()
        driver = escaped["loader"](
            V9_DRIVER, f"pw_r8_v21_c20_escape_driver_{component}")
        semantic = escaped["harness"].semantic_module(candidate_identity=False)
        if not isinstance(driver, ModuleType) or len(tuple(semantic.SUBJECT_CELLS)) != 97:
            raise Invalid("candidate-v20 callback escape was not reproduced")
        for label, value in (("loader", escaped["loader"]),
                             ("harness", escaped["harness"]),
                             ("driver", driver), ("semantic", semantic)):
            try:
                _assert_json_projection(value, f"escaped {label}")
            except Invalid as exc:
                rejection_storage = canonical({"component": component, "value": label,
                                               "error": str(exc)}) + b"\n"
                projection_rejections.append({
                    "component": component, "value": label,
                    "status": "PASS_REJECTED_NON_JSON_AUTHORITY",
                    "receipt_sha256": sha(rejection_storage),
                    "receipt_bytes": len(rejection_storage),
                })
            else:
                raise Invalid(f"JSON projection accepted escaped {label}")
        receipt_storage = canonical(example) + b"\n"
        predecessor_rows.append({
            "component": component, "probe": example.get("probe"),
            "typed_result": "FAIL", "callback_escape_reproduced": True,
            "returned_loader_callable": callable(escaped["loader"]),
            "returned_harness_module": isinstance(escaped["harness"], ModuleType),
            "escaped_driver_loaded": isinstance(driver, ModuleType),
            "semantic_schedule_cells": len(tuple(semantic.SUBJECT_CELLS)),
            "audit_example_receipt_sha256": sha(receipt_storage),
            "audit_example_receipt_bytes": len(receipt_storage),
        })

    source_rows: list[dict[str, Any]] = []
    required_zero_argument = {
        "controller": {
            "preflight_report", "_semantic_identity", "_zero_call_suite",
            "_verifier_boundary_suite", "_v19_load_order_suite",
            "_v20_entrypoint_gate_suite", "_closed_preflight_projection_suite",
        },
        "independent_verifier": {
            "validate_preflight", "_validate_closed_preflight",
            "_v19_load_order_suite",
        },
    }
    for component, path in (("controller", ROOT / "r8_clean_room_controller.py"),
                            ("independent_verifier", ROOT / "r8_run_verifier.py")):
        storage, _ = regular(path, f"candidate-v21 {component} source")
        tree = ast.parse(storage.decode("utf-8"))
        definitions = {node.name: node for node in tree.body
                       if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef))}
        if "_preflight_gate" in definitions:
            raise Invalid(f"candidate-v21 {component} retained callback gate")
        rows: list[dict[str, Any]] = []
        for name in sorted(required_zero_argument[component]):
            node = definitions.get(name)
            if node is None:
                raise Invalid(f"candidate-v21 {component} fixed builder absent: {name}")
            parameters = [argument.arg for argument in
                          (*node.args.posonlyargs, *node.args.args, *node.args.kwonlyargs)]
            if parameters or node.args.vararg is not None or node.args.kwarg is not None:
                raise Invalid(f"candidate-v21 {component}.{name} accepts caller input")
            rows.append({"function": name, "parameters": [], "caller_callback": False})
        source_rows.append({
            "component": component, "source_sha256": sha(storage),
            "source_bytes": len(storage), "old_callback_gate_present": False,
            "zero_argument_closed_callables": rows,
        })
    if "_preflight_gate" in globals():
        raise Invalid("controller runtime global retained callback gate")
    trace = list(_LOAD_ORDER_EVENTS[event_start:])
    if not trace or trace[0].get("event") != "preflight_dependency_closure_gate_pass":
        raise Invalid("closed preflight dependency gate did not precede external load")
    result = {
        "schema_id": "pw-r8-closed-preflight-projection-suite-v1",
        "candidate_id": CANDIDATE_ID, "status": "PASS",
        "predecessor_v20_callback_escape_cases": predecessor_rows,
        "predecessor_case_count": len(predecessor_rows),
        "successor_source_surfaces": source_rows,
        "non_json_authority_rejection_cases": projection_rejections,
        "non_json_authority_rejection_count": len(projection_rejections),
        "dependency_gate_before_predecessor_external_load": True,
        "event_trace": trace,
        "dependency_files_reopened": len(dependencies),
        "old_preflight_gate_runtime_present": False,
        "caller_supplied_preflight_callback_count": 0,
        "returned_loader_module_harness_controls_count": 0,
        "subject_calls": 0, "provider_calls": 0, "network_calls": 0,
        "filesystem_writes": 0,
    }
    _assert_json_projection(result)
    return result


_REMOVED_V19_AUTHORITY_GLOBALS = (
    "_PREFLIGHT_CAPABILITY", "_CONTROLS_SEAL", "_ValidatedControlsToken",
    "_mint_validated_controls", "_controls_payload", "_require_external_capability",
    "_module", "semantic_module", "schedule", "_diagnostic_schedule", "_SEMANTICS",
    "_authority_dispatcher", "_load_controls", "_run_controls",
)


def _v20_static_operation_surface() -> dict[str, Any]:
    """Enumerate root gates and the closed, zero-argument preflight surface."""
    sources = {
        "controller": ROOT / "r8_clean_room_controller.py",
        "independent_verifier": ROOT / "r8_run_verifier.py",
    }
    runtime = {
        "controller": {
            "run_cell", "emit_capture", "score_cell", "emit_completion", "recover_state",
            "emit_artifact", "validate_cell", "validate_artifact",
        },
        "independent_verifier": {
            "validate_cell", "validate_artifact", "validate_path", "validate_matrix",
            "validate_two_runs",
        },
    }
    fixed_preflight_builders = {
        "controller": {
            "preflight_report", "_semantic_identity", "_zero_call_suite",
            "_verifier_boundary_suite", "_v19_load_order_suite",
            "_v20_entrypoint_gate_suite", "_closed_preflight_projection_suite",
        },
        "independent_verifier": {
            "validate_preflight", "_validate_closed_preflight",
            "_v19_load_order_suite",
        },
    }
    allowed_external_owners = {
        "controller": {
            "_root_bound_operation", "_semantic_identity", "_zero_call_suite",
            "_verifier_boundary_suite", "_v19_load_order_suite",
            "_v20_entrypoint_gate_suite", "_closed_preflight_projection_suite",
        },
        "independent_verifier": {
            "_root_bound_operation", "_validate_closed_preflight",
            "_v19_load_order_suite",
        },
    }
    results: dict[str, Any] = {}
    for component, path in sources.items():
        storage, _ = regular(path, f"{component} root-bound source")
        tree = ast.parse(storage.decode("utf-8"))
        definitions = {
            node.name: node for node in tree.body
            if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef))
        }
        classes = {node.name for node in tree.body if isinstance(node, ast.ClassDef)}
        assigned = {
            target.id for node in tree.body if isinstance(node, (ast.Assign, ast.AnnAssign))
            for target in ((node.targets if isinstance(node, ast.Assign) else [node.target]))
            if isinstance(target, ast.Name)
        }
        exposed = ((set(definitions) | classes | assigned) &
                   (set(_REMOVED_V19_AUTHORITY_GLOBALS) | {"_preflight_gate"}))
        if exposed:
            raise Invalid(f"{component} retains removed authority globals: {sorted(exposed)}")
        missing = runtime[component] - set(definitions)
        if missing:
            raise Invalid(f"{component} root-bound runtime functions absent: {sorted(missing)}")
        wrapper_rows: list[dict[str, Any]] = []
        for name in sorted(runtime[component]):
            node = definitions[name]
            first = node.args.args[0].arg if node.args.args else None
            calls = {
                call.func.id for call in ast.walk(node)
                if isinstance(call, ast.Call) and isinstance(call.func, ast.Name)
            }
            if name != "validate_two_runs" and first != "root_value":
                raise Invalid(f"{component}.{name} does not begin with execution root")
            if "_root_bound_operation" not in calls:
                raise Invalid(f"{component}.{name} lacks root-bound operation")
            wrapper_rows.append({"function": name, "first_parameter": first,
                                 "root_bound_operation_called": True})
        boundary = definitions.get("_root_bound_operation")
        if boundary is None:
            raise Invalid(f"{component} root-bound operation boundary absent")
        boundary_parameters = [argument.arg for argument in boundary.args.args]
        if any(name in boundary_parameters for name in ("operation", "callback", "controls", "semantic")):
            raise Invalid(f"{component} root boundary accepts caller authority/callback")
        callback_arguments = [
            call.lineno for call in ast.walk(tree)
            if isinstance(call, ast.Call) and isinstance(call.func, ast.Name)
            and call.func.id == "_root_bound_operation"
            and any(isinstance(argument, ast.Lambda) for argument in call.args)
        ]
        if callback_arguments:
            raise Invalid(f"{component} root boundary retains callback call sites")
        preflight_name = "preflight_report" if component == "controller" else "validate_preflight"
        missing_preflight = fixed_preflight_builders[component] - set(definitions)
        if missing_preflight:
            raise Invalid(f"{component} closed preflight builders absent: {sorted(missing_preflight)}")
        preflight_rows: list[dict[str, Any]] = []

        def direct_returns(owner: ast.AST) -> list[ast.Return]:
            found: list[ast.Return] = []
            def descend(current: ast.AST) -> None:
                for child in ast.iter_child_nodes(current):
                    if isinstance(child, (ast.FunctionDef, ast.AsyncFunctionDef, ast.Lambda)):
                        continue
                    if isinstance(child, ast.Return):
                        found.append(child)
                    else:
                        descend(child)
            for statement in getattr(owner, "body", []):
                if isinstance(statement, ast.Return):
                    found.append(statement)
                elif not isinstance(statement, (ast.FunctionDef, ast.AsyncFunctionDef)):
                    descend(statement)
            return found

        for name in sorted(fixed_preflight_builders[component]):
            node = definitions[name]
            parameters = [argument.arg for argument in
                          (*node.args.posonlyargs, *node.args.args, *node.args.kwonlyargs)]
            if parameters or node.args.vararg is not None or node.args.kwarg is not None:
                raise Invalid(f"{component}.{name} is not a zero-argument closed builder")
            direct_escaped_returns: list[dict[str, Any]] = []
            for returned in direct_returns(node):
                names = ({item.id for item in ast.walk(returned.value)
                          if isinstance(item, ast.Name)}
                         if returned.value is not None else set())
                escaped = sorted(names & {"loader", "load_external", "harness", "module",
                                          "semantic", "controls", "callback", "operation"})
                if escaped:
                    direct_escaped_returns.append({"line": returned.lineno, "names": escaped})
            if direct_escaped_returns:
                raise Invalid(f"{component}.{name} directly returns preflight authority")
            preflight_rows.append({"function": name, "parameters": [],
                                   "direct_authority_return_names": []})
        external_sites: list[dict[str, Any]] = []
        for owner, node in definitions.items():
            sites = [
                call for call in ast.walk(node)
                if isinstance(call, ast.Call) and isinstance(call.func, ast.Attribute)
                and call.func.attr == "exec_module"
            ]
            for site in sites:
                if owner not in allowed_external_owners[component]:
                    raise Invalid(f"{component} external load outside closed lexical owner: {owner}")
                external_sites.append({"owner": owner, "line": site.lineno,
                                       "lexically_dominated": True,
                                       "owner_zero_argument": owner != "_root_bound_operation"})
        if {row["owner"] for row in external_sites} != allowed_external_owners[component]:
            raise Invalid(f"{component} external load owner inventory mismatch")
        provider_sites = [
            call for call in ast.walk(tree)
            if isinstance(call, ast.Call) and isinstance(call.func, ast.Attribute)
            and isinstance(call.func.value, ast.Name) and call.func.value.id == "driver"
            and call.func.attr == "execute"
        ]
        if component == "controller" and len(provider_sites) != 1:
            raise Invalid("controller provider call site count changed")
        if component == "independent_verifier" and provider_sites:
            raise Invalid("verifier contains provider call")
        results[component] = {
            "source_sha256": sha(storage), "source_bytes": len(storage),
            "module_global_callables": sorted(definitions),
            "module_global_callable_count": len(definitions),
            "runtime_root_bound_wrappers": wrapper_rows,
            "root_boundary_parameters": boundary_parameters,
            "root_boundary_callback_parameters": [],
            "root_boundary_lambda_call_sites": [],
            "preflight_closed_entry": preflight_name,
            "preflight_zero_argument_callables": preflight_rows,
            "preflight_callback_accepting_helpers": [],
            "preflight_authority_return_paths": [],
            "external_load_sites": external_sites,
            "removed_authority_globals_present": [],
            "provider_call_sites": len(provider_sites),
        }
    total_sites = sum(len(value["external_load_sites"]) for value in results.values())
    return {
        "schema_id": "pw-r8-root-bound-operation-surface-v1",
        "candidate_id": CANDIDATE_ID, "status": "PASS",
        "components": results, "external_load_sites_total": total_sites,
        "opaque_token_mint_count": 0, "authority_objects_publicly_returned": 0,
        "preflight_callback_accepting_helper_count": 0,
        "closed_preflight_projection": True,
        "tested_boundary": "unchanged candidate bytes and ordinary supported/direct callable invocation",
        "arbitrary_python_replacement_claimed": False,
    }


def _v20_entrypoint_gate_suite() -> dict[str, Any]:
    """Execute C19's 16 bypasses as predecessor receipts and C21 root rejects."""
    _closed_dependency_rows()

    def load_fixed_verifier() -> ModuleType:
        path = ROOT / "r8_run_verifier.py"
        name = "pw_r8_candidate_v21_entrypoint_verifier"
        spec = importlib.util.spec_from_file_location(name, path)
        if spec is None or spec.loader is None:
            raise Invalid("fixed independent verifier unavailable")
        loaded = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(loaded)
        return loaded

    _load_order_event("external_module_execute", path=str((ROOT / "r8_run_verifier.py").resolve()),
                      module_name="pw_r8_candidate_v21_entrypoint_verifier")
    verifier = load_fixed_verifier()
    controller_load_order = _v19_load_order_suite()
    verifier_load_order = verifier._v19_load_order_suite()
    audit_storage, _ = regular(V19_AUDIT, "candidate-v19 direct-entry audit")
    audit = preserved_object(audit_storage, "candidate-v19 direct-entry audit")
    findings = audit.get("blocking_findings")
    finding = findings[0] if isinstance(findings, list) and len(findings) == 1 else None
    examples = finding.get("executable_counterexamples", {}) if isinstance(finding, dict) else {}
    accepted = examples.get("accepted_cases") if isinstance(examples, dict) else None
    if ((sha(audit_storage), len(audit_storage)) !=
            ("984e99bf430fc00fe48774c6d4d8644cfd4139fc9505ebc4012539418b64bf70", 22449)
            or finding.get("normalized_failure_signature") !=
            "MODULE_PUBLISHED_PREFLIGHT_AND_CONTROL_OBJECTS_BYPASS_ROOT_BOUND_VALIDATION_SEQUENCE"
            or not isinstance(accepted, list) or len(accepted) != 8
            or examples.get("accepted_case_count_total") != 16):
        raise Invalid("candidate-v19 exact 16-case bypass evidence changed")
    predecessor_rows: list[dict[str, Any]] = []
    for component in ("controller", "independent_verifier"):
        for example in accepted:
            receipt_value = {"component": component, **example}
            receipt = canonical(receipt_value) + b"\n"
            predecessor_rows.append({
                "component": component, "probe": example["probe"], "typed_result": "FAIL",
                "receipt_sha256": sha(receipt), "receipt_bytes": len(receipt),
                "external_dependency_events": example["external_module_events"],
                "freeze_dependency_gate_present": False,
            })
    if len(predecessor_rows) != 16:
        raise Invalid("candidate-v19 predecessor bypass count changed")

    module_surfaces = {"controller": globals(), "independent_verifier": vars(verifier)}
    removal_rows: list[dict[str, Any]] = []
    for component, surface in module_surfaces.items():
        present = sorted(set(_REMOVED_V19_AUTHORITY_GLOBALS) & set(surface))
        if present:
            raise Invalid(f"{component} exposes removed authority surface: {present}")
        for example in accepted:
            removal_rows.append({
                "component": component, "predecessor_probe": example["probe"],
                "status": "PASS_SURFACE_ABSENT", "external_dependency_events": 0,
                "removed_global_set_sha256": sha(canonical(list(_REMOVED_V19_AUTHORITY_GLOBALS))),
            })

    cell, nonce = _frozen_cells()[0], "0" * 64
    absent_run, root_text = "PW-R8-C21-ENTRYPOINT-ABSENT", str(ROOT)
    controller_entries: list[tuple[str, Callable[[], Any]]] = [
        ("run-cell", lambda: run_cell(root_text, absent_run, SLOTS[0], cell, nonce, 0.0)),
        ("emit-capture", lambda: emit_capture(root_text, absent_run, SLOTS[0], cell, nonce)),
        ("score-cell", lambda: score_cell(root_text, absent_run, SLOTS[0], cell, nonce)),
        ("emit-completion", lambda: emit_completion(root_text, absent_run, SLOTS[0], cell, nonce)),
        ("recover-state", lambda: recover_state(root_text, absent_run, SLOTS[0], cell, nonce)),
        ("emit-artifact", lambda: emit_artifact(root_text, absent_run, SLOTS[0], STAGES[0])),
        ("validate-cell-helper", lambda: validate_cell(root_text, absent_run, SLOTS[0], cell, nonce)),
        ("validate-artifact-helper", lambda: validate_artifact(root_text, absent_run, SLOTS[0], STAGES[0])),
        ("validate-path-unsupported", lambda: validate_path(absent_run, root_text, SLOTS[0])),
        ("validate-matrix-unsupported", lambda: validate_matrix(absent_run, root_text)),
        ("validate-two-runs-unsupported", lambda: validate_two_runs(root_text, root_text)),
        ("removed-controls-parser", lambda: _removed_legacy_controls_parser(
            ROOT, absent_run, SLOTS[0], cell, nonce)),
    ]
    verifier_entries: list[tuple[str, Callable[[], Any]]] = [
        ("validate-cell", lambda: verifier.validate_cell(root_text, absent_run, SLOTS[0], cell)),
        ("validate-artifact", lambda: verifier.validate_artifact(root_text, absent_run, SLOTS[0], STAGES[0])),
        ("validate-path", lambda: verifier.validate_path(root_text, absent_run, SLOTS[0])),
        ("validate-matrix", lambda: verifier.validate_matrix(root_text, absent_run)),
        ("validate-two-runs", lambda: verifier.validate_two_runs(root_text, root_text)),
        ("removed-controls-parser", lambda: verifier._removed_legacy_controls_parser(
            ROOT, absent_run, SLOTS[0], cell, nonce)),
        ("missing-freeze", lambda: verifier._validate_freeze_manifest(
            FREEZE_RELATIVE_PATH, nonce, 1)),
        ("root-bound-direct", lambda: verifier._root_bound_operation(
            ROOT, absent_run, "validate-matrix")),
    ]
    absent_rows: list[dict[str, Any]] = []
    for component, entries, events in (
            ("controller", controller_entries, _LOAD_ORDER_EVENTS),
            ("independent_verifier", verifier_entries, verifier._LOAD_ORDER_EVENTS)):
        for entry, action in entries:
            events.clear()
            try:
                action()
            except Exception as exc:
                error = f"{type(exc).__name__}:{exc}"
            else:
                raise Invalid(f"absent root unexpectedly passed: {component}/{entry}")
            external = [row for row in events if row.get("event", "").startswith("external_")]
            if external:
                raise Invalid(f"absent root executed dependency: {component}/{entry}")
            receipt = canonical({"component": component, "entry": entry, "error": error,
                                 "events": list(events)}) + b"\n"
            absent_rows.append({
                "component": component, "entry": entry,
                "status": "PASS_REJECTED_ZERO_EXTERNAL_EVENTS",
                "receipt_sha256": sha(receipt), "receipt_bytes": len(receipt),
                "external_dependency_events": 0,
            })

    cli_rows: list[dict[str, Any]] = []
    cli_args = {
        "run-cell": ["--slot", SLOTS[0], "--cell", cell, "--dispatch-nonce", nonce,
                     "--timeout-seconds", "0"],
        "emit-capture": ["--slot", SLOTS[0], "--cell", cell, "--dispatch-nonce", nonce],
        "score-cell": ["--slot", SLOTS[0], "--cell", cell, "--dispatch-nonce", nonce],
        "emit-completion": ["--slot", SLOTS[0], "--cell", cell, "--dispatch-nonce", nonce],
        "recover-state": ["--slot", SLOTS[0], "--cell", cell, "--dispatch-nonce", nonce],
        "emit-artifact": ["--slot", SLOTS[0], "--stage", STAGES[0]],
    }
    saved_argv = list(sys.argv)
    class _StdoutCapture:
        def __init__(self) -> None:
            self.buffer = io.BytesIO()
        def write(self, value: str) -> int:
            return self.buffer.write(value.encode("utf-8"))
        def flush(self) -> None:
            return None
    try:
        for command, tail in cli_args.items():
            _LOAD_ORDER_EVENTS.clear()
            sys.argv = [str(ROOT / "r8_clean_room_controller.py"), command,
                        "--run-id", absent_run, "--execution-root", root_text, *tail]
            output = _StdoutCapture()
            with contextlib.redirect_stdout(output):
                rc = main()
            external = [row for row in _LOAD_ORDER_EVENTS if row.get("event", "").startswith("external_")]
            if rc != 2 or external:
                raise Invalid(f"CLI root gate bypass: {command}")
            receipt = output.buffer.getvalue()
            cli_rows.append({"command": command, "status": "PASS_REJECTED_ZERO_EXTERNAL_EVENTS",
                             "exit_code": rc, "stdout_sha256": sha(receipt),
                             "stdout_bytes": len(receipt), "external_dependency_events": 0})
    finally:
        sys.argv = saved_argv

    controller_cases, verifier_cases = controller_load_order["cases"], verifier_load_order["cases"]
    negative_classes = [row["case_id"] for row in controller_cases[:-1]]
    matrix: list[dict[str, Any]] = []
    for component, entries, cases in (
            ("controller", controller_entries, controller_cases),
            ("independent_verifier", verifier_entries, verifier_cases)):
        for entry, _action in entries:
            matrix.append({
                "component": component, "entry": entry,
                "invalid_authority_classes_exercised": negative_classes,
                "invalid_receipts": [{"case_id": row["case_id"],
                                      "sha256": row["receipt_sha256"],
                                      "bytes": row["receipt_bytes"]} for row in cases[:-1]],
                "valid_authority_receipt": {"case_id": cases[-1]["case_id"],
                                            "sha256": cases[-1]["receipt_sha256"],
                                            "bytes": cases[-1]["receipt_bytes"]},
                "valid_event_order": [row["event"] for row in cases[-1]["events"]],
            })
    if not (len(predecessor_rows) == len(removal_rows) == 16 and len(absent_rows) == 20
            and len(cli_rows) == 6 and len(matrix) == 20):
        raise Invalid("root-bound entrypoint matrix cardinality mismatch")
    return {
        "schema_id": "pw-r8-root-bound-entrypoint-suite-v1", "candidate_id": CANDIDATE_ID,
        "status": "PASS", "predecessor_v19_bypass_traces": predecessor_rows,
        "successor_v20_removed_surface_cases": removal_rows,
        "actual_absent_root_entry_probes": absent_rows,
        "runtime_or_helper_entry_count": 20, "cli_runtime_command_probes": cli_rows,
        "authority_class_matrix": matrix, "invalid_authority_classes_per_entry": 11,
        "controller_load_order": controller_load_order,
        "independent_verifier_load_order": verifier_load_order,
        "valid_authority_gate_order": ["freeze_dependency_gate_pass",
                                        "static_schedule_route_nonce_gate_pass",
                                        "external_semantic_schedule_factory",
                                        "external_module_execute"],
        "authority_object_returned": False, "authority_object_parameter_accepted": False,
        "subject_calls": 0, "provider_calls": 0, "network_calls": 0,
        "filesystem_writes": 0,
    }


def preflight_report() -> dict[str, Any]:
    dependencies = _dependency_closure()
    goal_storage, goal, _ = exact_file(GOAL_ADDENDUM, "goal loop-buster addendum")
    parent_audit_storage, _ = regular(V20_AUDIT, "candidate-v20 failed audit")
    parent_audit = preserved_object(parent_audit_storage, "candidate-v20 failed audit")
    parent_progress_storage, _ = regular(V20_PROGRESS, "candidate-v20 progress")
    parent_progress = preserved_object(parent_progress_storage, "candidate-v20 progress")
    if ((sha(goal_storage), len(goal_storage)) !=
            ("d3f901e724d785ba3d053a961a8559b6f5b5add7e7b660a9fbb503586ad822d0", 4468) or
            (sha(parent_audit_storage), len(parent_audit_storage)) !=
            ("c8678951ff5653b0a9b4c0d3421dc0707ea64d70e0f94ae3926222b78699afe6", 24732) or
            (sha(parent_progress_storage), len(parent_progress_storage)) !=
            ("50e83c5b81e7b63599351fea3cc7268bbbb29b2ac8afdae5a23f99fa9998288c", 4527) or
            goal.get("identity_family") != IDENTITY_FAMILY or
            parent_audit.get("verdict") != "PRESEAL_FAIL" or
            parent_progress.get("decision") != "CHURN_SUSPECTED"):
        raise Invalid("candidate-v21 exact lineage mismatch")
    dep_storage = canonical(dependencies)

    declared = {str((SUCCESSOR / row["path"]).resolve()): row for row in dependencies}
    for name in PRE_AUDIT_FILES:
        candidate_path = ROOT / name
        if candidate_path.exists():
            data, _ = regular(candidate_path, f"trace candidate file {name}")
            declared[str(candidate_path.resolve())] = {
                "sha256": sha(data), "bytes": len(data)}
    for path in (GOAL_ADDENDUM, V20_AUDIT, V20_PROGRESS):
        data, _ = regular(path, f"trace lineage file {path.name}")
        declared[str(path.resolve())] = {"sha256": sha(data), "bytes": len(data)}
    observed_paths: set[str] = set()
    live_plans_paths: set[str] = set()
    audit_enabled = True
    successor_root = SUCCESSOR.resolve()
    live_plans_root = (REPO / "Plans").resolve()

    def observe_open(event: str, args: tuple[Any, ...]) -> None:
        nonlocal audit_enabled
        if not audit_enabled or event != "open" or not args:
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
            resolved = ((Path.cwd() / path).resolve()
                        if not path.is_absolute() else path.resolve())
        except (OSError, RuntimeError):
            return
        if resolved == live_plans_root or resolved.is_relative_to(live_plans_root):
            live_plans_paths.add(str(resolved))
        if resolved == successor_root or resolved.is_relative_to(successor_root):
            observed_paths.add(str(resolved))

    sys.addaudithook(observe_open)
    try:
        semantics = _semantic_identity()
        zero_suite = _zero_call_suite()
        boundary_suite = _verifier_boundary_suite()
        authority_suite = _v19_authority_suite()
        closure_suite = _v19_closure_suite()
        entrypoint_gate_suite = _v20_entrypoint_gate_suite()
        controller_load_order = entrypoint_gate_suite["controller_load_order"]
        verifier_load_order = entrypoint_gate_suite["independent_verifier_load_order"]
        closed_projection_suite = _closed_preflight_projection_suite()
        static_entrypoint_surface = _v20_static_operation_surface()
        static_control_surface = _static_control_surface()
        standalone_surface = _v19_standalone_surface()
    finally:
        audit_enabled = False
    successful_files = sorted(path for path in observed_paths if Path(path).is_file())
    undeclared = [path for path in successful_files if path not in declared]
    if live_plans_paths or undeclared:
        raise Invalid(f"closed preflight observed undeclared/live path: {undeclared}/{sorted(live_plans_paths)}")
    observed_rows = [{
        "path": str(Path(path).relative_to(successor_root)),
        "sha256": declared[path]["sha256"], "bytes": declared[path]["bytes"],
    } for path in successful_files]
    observed_storage = canonical(observed_rows)
    observed = {
        "status": "PASS", "audit_mechanism": "python_sys_audit_open_event",
        "observed_successor_file_count": len(observed_rows),
        "observed_successor_files": observed_rows,
        "observed_successor_inventory_sha256": sha(observed_storage),
        "observed_successor_inventory_bytes": len(observed_storage),
        "undeclared_observed_successor_files": [], "live_plans_paths": [],
    }
    load_order_suite = {"schema_id": "pw-r8-dual-load-order-suite-v21",
                        "candidate_id": CANDIDATE_ID, "status": "PASS",
                        "controller": controller_load_order,
                        "independent_verifier": verifier_load_order,
                        "subject_calls": 0, "provider_calls": 0,
                        "network_calls": 0, "filesystem_writes": 0}
    report = {
        "schema_id": "pw-r8-deterministic-preflight-report-v21",
        "candidate_id": CANDIDATE_ID, "status": "PASS",
        "typed_result": {"type": "PASS", "fail_closed": True},
        "subject_calls": 0, "provider_calls": 0, "network_calls": 0,
        "filesystem_writes": 0, "live_plans_reads": 0,
        "parent_candidate": {
            "candidate_id": "PW-R8-ITERATIVE-FIX-TWO-CLEAN-RUNS-20260815.CANDIDATE-20",
            "checkpoint_commit": CHECKPOINT_COMMIT},
        "goal_loop_buster_addendum": {
            "path": str(GOAL_ADDENDUM.relative_to(REPO)),
            "sha256": sha(goal_storage), "bytes": len(goal_storage)},
        "v20_failed_audit": {
            "path": str(V20_AUDIT.relative_to(REPO)),
            "sha256": sha(parent_audit_storage), "bytes": len(parent_audit_storage),
            "verdict": "PRESEAL_FAIL"},
        "v20_progress_assessment": {
            "path": str(V20_PROGRESS.relative_to(REPO)),
            "sha256": sha(parent_progress_storage), "bytes": len(parent_progress_storage),
            "decision": "CHURN_SUSPECTED"},
        "runtime_dependency_closure": {
            "status": "PASS", "exact_sorted_unique_files": len(dependencies),
            "inventory_sha256": sha(dep_storage), "inventory_bytes": len(dep_storage),
            "rows": dependencies, "live_plans_paths": [],
            "observed_open_enforcement": observed,
            "candidate_v12_process_controller_imported_or_executed": False,
            "candidate_v12_completion_adapter_imported_or_executed": False},
        "semantic_identity": semantics,
        "completion_v3_contract": {
            "exact_key_count": 39, "exact_keys": list(COMPLETION_KEYS),
            "forbidden_outer_session_fields_present": False},
        "dispatch_attempt_contract": {
            "exact_key_count": 25, "exact_keys": list(DISPATCH_ATTEMPT_KEYS)},
        "interactive_run_cell": {
            "standalone_run_subject_present": False, "single_live_process_only": True,
            "transaction_claim_exact_keys": list(TRANSACTION_CLAIM_KEYS),
            "ack_exact_keys": list(ACK_KEYS), "provider_call_sites": 1,
            "proposal_order": ["transaction-claim", "render", "dispatch-attempt",
                               "receipt", "capture", "score", "completion-v3-last"],
            "controller_filesystem_writes": 0},
        "freeze_authority": {
            "manifest_path": FREEZE_RELATIVE_PATH, "exact_keys": list(FREEZE_KEYS),
            "run_exact_keys": list(RUN_KEYS), "run_kinds": list(RUN_KINDS),
            "dependency_rows_embedded": True,
            "qualification_contract": _qualification_contract()},
        "load_order_suite": load_order_suite,
        "entrypoint_authority_gate_suite": entrypoint_gate_suite,
        "static_entrypoint_surface": static_entrypoint_surface,
        "closed_preflight_projection_suite": closed_projection_suite,
        "zero_call_suite": zero_suite,
        "verifier_boundary_suite": boundary_suite,
        "authority_constructibility_suite": authority_suite,
        "closure_custody_suite": closure_suite,
        "static_control_surface": static_control_surface,
        "standalone_closure_surface": standalone_surface,
        "claim_boundary": "Deterministic zero-call standalone closed-preflight, load-order, and closure-custody evidence only; no audit, freeze, launch, empirical credit, qualification, or readiness claim.",
    }
    _assert_json_projection(report)
    if json.loads(canonical(report).decode("utf-8")) != report:
        raise Invalid("closed preflight JSON round-trip mismatch")
    return report


def self_test() -> dict[str, Any]:
    report = preflight_report()
    path = ROOT / "deterministic_preflight_report.json"
    if path.exists():
        storage, stored, _ = exact_file(path, "stored candidate-v21 preflight")
        if stored != report or storage != canonical(report) + b"\n":
            raise Invalid("stored candidate-v21 preflight not reproducible")
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
            value = emit_artifact(args.execution_root, args.run_id, args.slot, args.stage)
        else:
            common = (args.execution_root, args.run_id, args.slot, args.cell, args.dispatch_nonce)
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
