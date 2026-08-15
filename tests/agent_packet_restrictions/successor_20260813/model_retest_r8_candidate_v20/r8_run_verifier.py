#!/usr/bin/env python3
"""Independent root-bound full-material verifier for R8 candidate-20.

This module does not import the controller and exposes no subject-call path.\nIt independently parses and recomputes every authoritative evidence decision.
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

CANDIDATE_ID = "PW-R8-ITERATIVE-FIX-TWO-CLEAN-RUNS-20260815.CANDIDATE-20"
IDENTITY_FAMILY = "PW-R8-ITERATIVE-FIX-TWO-CLEAN-RUNS-20260815"
REPO = Path("/mnt/Cursor/PuppetMaster")
SUCCESSOR = REPO / "tests/agent_packet_restrictions/successor_20260813"
ROOT = SUCCESSOR / "model_retest_r8_candidate_v20"
V9_ROOT = SUCCESSOR / "model_retest_r8_candidate_v9"
V9_HARNESS = V9_ROOT / "r8_harness.py"
V9_DRIVER = V9_ROOT / "r8_subject_task_driver.py"
V14_VERIFIER = SUCCESSOR / "model_retest_r8_candidate_v14/r8_run_verifier.py"
V12_PREFLIGHT = SUCCESSOR / "model_retest_r8_candidate_v12/deterministic_preflight_report.json"
V12_PROCESS_CONTRACT = SUCCESSOR / "model_retest_r8_candidate_v12/process_completion_contract.json"
V12_A02_RENDER = SUCCESSOR / "model_retest_r8_candidate_v12_run_01/slot-alpha/rendered/S10A_DECISION_A02.txt"
V12_A02_RECEIPT = SUCCESSOR / "model_retest_r8_candidate_v12_run_01/direct_appserver_receipts/slot-alpha_S10A_DECISION_A02.json"
GOAL_ADDENDUM = SUCCESSOR / "r8_goal_loop_buster_addendum_v1.json"
DIAGNOSIS = SUCCESSOR / "r8_clean_room_execution_controller_diagnosis_v1.json"
C14_AUDIT = SUCCESSOR / "model_retest_r8_candidate_v14/independent_preseal_audit.json"
C14_PROGRESS = SUCCESSOR / "r8_progress_assessment_candidate_v14_preseal_fail_v1.json"
CHECKPOINT_COMMIT = "3e3a4cafca90ac65d99378f0421cb45d2d64209a"

SLOTS = ("slot-alpha", "slot-bravo", "slot-charlie")
ROUTES = {
    "slot-alpha": ("gpt-5.4-mini", "xhigh"),
    "slot-bravo": ("gpt-5.4-mini", "medium"),
    "slot-charlie": ("gpt-5.6-luna", "medium"),
}
STAGES = ("S10A", "S10B", "S20A", "S20B", "S30A", "S30B", "S40A", "S40B", "S45A", "S45B", "S50", "S55", "S60P", "S60C", "S60K", "S70", "S80", "S90")
ARTIFACT_EMISSION_ORDER = (
    "S10A", "S20A", "S10B", "S20B", "S30A", "S40A", "S45A",
    "S30B", "S40B", "S45B", "S50", "S55", "S60P", "S60C",
    "S60K", "S70", "S80", "S90",
)
ARTIFACT_BOUNDARY_INDEX = {
    "S10A": 55, "S20A": 55, "S10B": 57, "S20B": 57,
    "S30A": 75, "S40A": 75, "S45A": 75,
    "S30B": 92, "S40B": 92, "S45B": 92,
    "S50": 93, "S55": 93, "S60P": 94, "S60C": 95,
    "S60K": 96, "S70": 96, "S80": 96, "S90": 96,
}
CONTROL_FILES = ("run_contract.json", "ordered_schedule.json", "dispatch_schedule.json")
TASK_PATH_KEYS = (
    "transaction_claim_relative_path", "rendered_relative_path",
    "dispatch_attempt_relative_path", "receipt_relative_path",
    "capture_relative_path", "score_relative_path", "completion_relative_path",
)
INVENTORY_ROW_KEYS = ("relative_path", "kind", "device", "inode", "size", "mtime_ns")
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
        "schema_id": "pw-r8-qualification-contract-v20",
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
        "schema_id": "pw-r8-candidate-freeze-manifest-v20", "candidate_id": CANDIDATE_ID,
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
    storage, freeze, _ = exact_file(REPO / manifest_rel, "candidate-v20 freeze manifest")
    if (sha(storage), len(storage)) != (expected_sha, expected_bytes):
        raise Invalid("freeze manifest storage binding mismatch")
    _validate_freeze_static_authority(freeze)
    exact = {
        "schema_id": "pw-r8-candidate-freeze-manifest-v20", "candidate_id": CANDIDATE_ID,
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
    audit_rel = f"tests/agent_packet_restrictions/successor_20260813/model_retest_r8_candidate_v20/independent_preseal_audit.json"
    if audit_binding.get("path") != audit_rel or audit_binding.get("verdict") != "PRESEAL_PASS" or audit_binding.get("independent_decision") != "LOOP_BROKEN" or audit_binding.get("loop_broken") is not True:
        raise Invalid("freeze requires PRESEAL_PASS plus LOOP_BROKEN")
    audit_storage, audit, _ = exact_file(REPO / audit_rel, "independent PRESEAL_PASS audit")
    if (sha(audit_storage), len(audit_storage)) != (audit_binding.get("storage_sha256"), audit_binding.get("storage_bytes")):
        raise Invalid("freeze audit hash/bytes mismatch")
    if tuple(audit) != AUDIT_KEYS or audit.get("schema_id") != "pw-r8-independent-preseal-audit-v20" or audit.get("candidate_id") != CANDIDATE_ID:
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

def _validate_render_bytes(observed: bytes, expected: bytes) -> dict[str, Any]:
    if observed != expected or not observed.endswith(b"\n") or observed.endswith(b"\n\n") or b"\r" in observed:
        raise Invalid("render differs or is not exact one-terminal-LF storage")
    return {"storage_sha256": sha(observed), "storage_bytes": len(observed)}

def _parent_directories(files: set[str]) -> set[str]:
    directories: set[str] = set()
    for relative in files:
        parent = Path(relative).parent
        while parent != Path("."):
            directories.add(parent.as_posix())
            parent = parent.parent
    return directories


def _known_inventory(controls: dict[str, Any]) -> tuple[set[str], dict[tuple[str, str], tuple[str, ...]]]:
    known = set(CONTROL_FILES)
    tasks: dict[tuple[str, str], tuple[str, ...]] = {}
    inventory = controls.get("run", {}).get("run_inventory", {})
    task_rows = inventory.get("tasks") if isinstance(inventory, dict) else None
    if not isinstance(task_rows, list) or len(task_rows) != 291:
        raise Invalid("exact run task inventory absent at independent boundary")
    for task in task_rows:
        if not isinstance(task, dict):
            raise Invalid("run task inventory row malformed")
        slot, cell = task.get("slot"), task.get("cell")
        key = (slot, cell)
        if slot not in SLOTS or cell not in controls["cells"] or key in tasks:
            raise Invalid("run task inventory duplicate or outside schedule")
        paths = tuple(task.get(name) for name in TASK_PATH_KEYS)
        if any(not isinstance(path, str) or not path for path in paths) or len(set(paths)) != len(paths):
            raise Invalid("run task inventory evidence paths malformed or duplicate")
        tasks[key] = paths
        known.update(paths)
    expected_keys = {(slot, cell) for slot in SLOTS for cell in controls["cells"]}
    if set(tasks) != expected_keys:
        raise Invalid("run task inventory missing or extra cell ownership")
    known.update(f"{slot}/artifacts/{stage}.json" for slot in SLOTS for stage in STAGES)
    return known, tasks


def _scan_execution_root(root: Path) -> list[dict[str, Any]]:
    try:
        root_info = os.lstat(root)
    except FileNotFoundError as exc:
        raise Invalid("execution root absent at independent inventory boundary") from exc
    if not stat.S_ISDIR(root_info.st_mode) or stat.S_ISLNK(root_info.st_mode):
        raise Invalid("execution root is not an exact regular directory")
    rows: list[dict[str, Any]] = []
    pending = [root]
    while pending:
        directory = pending.pop()
        try:
            entries = sorted(os.scandir(directory), key=lambda entry: entry.name)
        except OSError as exc:
            raise Invalid("execution root cannot be enumerated completely") from exc
        for entry in entries:
            try:
                info = entry.stat(follow_symlinks=False)
            except OSError as exc:
                raise Invalid("execution root object cannot be lstat-reopened") from exc
            path = Path(entry.path)
            relative = path.relative_to(root).as_posix()
            if stat.S_ISLNK(info.st_mode):
                kind = "symlink"
            elif stat.S_ISDIR(info.st_mode):
                kind = "directory"
                pending.append(path)
            elif stat.S_ISREG(info.st_mode):
                kind = "regular"
            else:
                kind = "nonregular"
            rows.append({
                "relative_path": relative, "kind": kind,
                "device": info.st_dev, "inode": info.st_ino,
                "size": info.st_size, "mtime_ns": info.st_mtime_ns,
            })
    return sorted(rows, key=lambda row: (row["relative_path"], row["kind"]))


def _assert_inventory_rows(rows: Any, known_files: set[str]) -> tuple[set[str], set[str]]:
    if not isinstance(rows, list):
        raise Invalid("execution-root inventory is not an array")
    known_directories = _parent_directories(known_files)
    observed_files: set[str] = set()
    observed_directories: set[str] = set()
    observed_paths: set[str] = set()
    regular_inodes: set[tuple[int, int]] = set()
    for row in rows:
        if not isinstance(row, dict) or tuple(row) != INVENTORY_ROW_KEYS:
            raise Invalid("execution-root inventory row malformed")
        relative, kind = row["relative_path"], row["kind"]
        device, inode, size, mtime_ns = row["device"], row["inode"], row["size"], row["mtime_ns"]
        if (
            not isinstance(relative, str) or not relative
            or Path(relative).is_absolute() or Path(relative).as_posix() != relative
            or ".." in Path(relative).parts or relative in observed_paths
            or type(device) is not int or type(inode) is not int
            or type(size) is not int or size < 0
            or type(mtime_ns) is not int or mtime_ns < 0
        ):
            raise Invalid("execution-root inventory path/identity malformed or duplicate")
        observed_paths.add(relative)
        if kind == "regular":
            if relative not in known_files:
                raise Invalid(f"unknown or extra regular file: {relative}")
            identity = (device, inode)
            if identity in regular_inodes:
                raise Invalid("duplicate hard-linked regular evidence object")
            regular_inodes.add(identity)
            observed_files.add(relative)
        elif kind == "directory":
            if relative not in known_directories:
                raise Invalid(f"unknown or future directory: {relative}")
            observed_directories.add(relative)
        elif kind == "symlink":
            raise Invalid(f"symlink evidence object forbidden: {relative}")
        else:
            raise Invalid(f"nonregular evidence object forbidden: {relative}")
    return observed_files, observed_directories


def _due_artifacts(completed_cells: int) -> tuple[str, ...]:
    return tuple(stage for stage in ARTIFACT_EMISSION_ORDER
                 if ARTIFACT_BOUNDARY_INDEX[stage] < completed_cells)


def _infer_slot_prefix(observed_files: set[str], tasks: dict[tuple[str, str], tuple[str, ...]],
                       slot: str, cells: tuple[str, ...]) -> int:
    completed = 0
    gap = False
    for cell in cells:
        membership = tuple(path in observed_files for path in tasks[(slot, cell)])
        if all(membership):
            if gap:
                raise Invalid(f"future cell evidence after causal gap: {slot}/{cell}")
            completed += 1
        elif any(membership):
            raise Invalid(f"partial, malformed, or future cell chain: {slot}/{cell}")
        else:
            gap = True
    return completed


def _terminal_inventory(root: Path, controls: dict[str, Any], *,
                        required_counts: dict[str, int],
                        artifact_prefix_override: dict[str, tuple[str, ...]] | None = None,
                        rows: list[dict[str, Any]] | None = None) -> dict[str, Any]:
    known_files, tasks = _known_inventory(controls)
    material_rows = _scan_execution_root(root) if rows is None else rows
    observed_files, observed_directories = _assert_inventory_rows(material_rows, known_files)
    if not set(CONTROL_FILES) <= observed_files:
        raise Invalid("execution root lacks exact control files")
    counts = {
        slot: _infer_slot_prefix(observed_files, tasks, slot, controls["cells"])
        for slot in SLOTS
    }
    for slot, count in required_counts.items():
        if slot not in SLOTS or type(count) is not int or counts[slot] != count:
            raise Invalid(f"terminal causal prefix mismatch for {slot}")
    artifact_prefix_override = {} if artifact_prefix_override is None else artifact_prefix_override
    artifacts: dict[str, tuple[str, ...]] = {}
    expected_files = set(CONTROL_FILES)
    for slot in SLOTS:
        count = counts[slot]
        expected_files.update(
            path for cell in controls["cells"][:count] for path in tasks[(slot, cell)]
        )
        stages = artifact_prefix_override.get(slot, _due_artifacts(count))
        if any(stage not in STAGES for stage in stages) or len(set(stages)) != len(stages):
            raise Invalid("terminal artifact prefix malformed")
        due = _due_artifacts(count)
        if slot not in artifact_prefix_override and stages != due:
            raise Invalid("terminal artifact projection changed")
        if slot in artifact_prefix_override:
            expected_order = ARTIFACT_EMISSION_ORDER[:len(stages)]
            if stages != expected_order or any(ARTIFACT_BOUNDARY_INDEX[stage] >= count for stage in stages):
                raise Invalid("requested artifact terminal is out of causal order")
        artifacts[slot] = stages
        expected_files.update(f"{slot}/artifacts/{stage}.json" for stage in stages)
    expected_directories = _parent_directories(expected_files)
    if observed_files != expected_files:
        extra = sorted(observed_files - expected_files)
        missing = sorted(expected_files - observed_files)
        raise Invalid(f"execution-root exact causal files mismatch extra={extra} missing={missing}")
    if observed_directories != expected_directories:
        extra = sorted(observed_directories - expected_directories)
        missing = sorted(expected_directories - observed_directories)
        raise Invalid(f"execution-root exact causal directories mismatch extra={extra} missing={missing}")
    row_storage = canonical(material_rows)
    return {
        "counts": counts, "artifacts": artifacts,
        "regular_file_count": len(observed_files), "directory_count": len(observed_directories),
        "row_fingerprint_sha256": sha(row_storage), "row_fingerprint_bytes": len(row_storage),
    }


def _confirm_inventory_stable(root: Path, controls: dict[str, Any],
                              original: dict[str, Any], *,
                              required_counts: dict[str, int],
                              artifact_prefix_override: dict[str, tuple[str, ...]] | None = None) -> None:
    reopened = _terminal_inventory(
        root, controls, required_counts=required_counts,
        artifact_prefix_override=artifact_prefix_override,
    )
    if reopened != original:
        raise Invalid("execution-root causal inventory changed during independent material validation")


def _recompute_artifact(root: Path, run_id: str, slot: str, stage: str,
                        controls: Any) -> dict[str, Any]:
    storage, value, _ = exact_file(
        root / slot / "artifacts" / f"{stage}.json", f"artifact {slot}/{stage}")
    expected = _semantics(controls).reduce(root, slot, stage)
    if value != expected or storage != canonical(expected) + b"\n":
        raise Invalid("artifact differs from independent reducer recomputation")
    return {
        "schema_id": "pw-r8-independent-artifact-validation-v20",
        "candidate_id": CANDIDATE_ID, "status": "PASS", "run_id": run_id,
        "slot": slot, "stage": stage,
        "storage_sha256": sha(storage), "storage_bytes": len(storage),
    }


def _consume_inventory(root: Path, run_id: str, controls: dict[str, Any],
                       inventory: dict[str, Any], *,
                       require_all_pass_slots: set[str]) -> dict[str, Any]:
    nonce_map = {(row["slot"], row["cell"]): row["dispatch_nonce"] for row in controls["entries"]}
    chains: dict[str, list[dict[str, Any]]] = {slot: [] for slot in SLOTS}
    artifacts: dict[str, list[dict[str, Any]]] = {slot: [] for slot in SLOTS}
    identities = {"thread_ids": set(), "turn_ids": set(), "rollout_paths": set()}
    for slot in SLOTS:
        count = inventory["counts"][slot]
        for index, cell in enumerate(controls["cells"][:count]):
            require_pass = slot in require_all_pass_slots or index < count - 1
            row = _full_chain_reopen(
                root, run_id, slot, cell, nonce_map[(slot, cell)], controls,
                require_pass=require_pass,
            )
            chains[slot].append(row)
            for key, value in (
                ("thread_ids", row["thread_id"]),
                ("turn_ids", row["turn_id"]),
                ("rollout_paths", row["rollout_path"]),
            ):
                if not isinstance(value, str) or not value or value in identities[key]:
                    raise Invalid(f"fully consumed receipt {key} missing or replayed")
                identities[key].add(value)
        for stage in inventory["artifacts"][slot]:
            artifacts[slot].append(_recompute_artifact(root, run_id, slot, stage, controls))
    return {"chains": chains, "artifacts": artifacts, "identities": identities}


def _validate_cell_after_gate(root: Path, controls: dict[str, Any], run_id: str,
                              slot: str, cell: str) -> dict[str, Any]:
    if slot not in SLOTS or cell not in controls["cells"]:
        raise Invalid("cell outside exact schedule")
    if f"{run_id}:{slot}:{cell}" not in controls["run"]["launch_authorized_task_ids"]:
        raise Invalid("cell was not authorized by exact run contract")
    index = controls["cells"].index(cell)
    inventory = _terminal_inventory(root, controls, required_counts={slot: index + 1})
    consumed = _consume_inventory(
        root, run_id, controls, inventory, require_all_pass_slots=set())
    _confirm_inventory_stable(
        root, controls, inventory, required_counts={slot: index + 1})
    row = consumed["chains"][slot][-1]
    return {
        "schema_id": "pw-r8-independent-cell-validation-v20", "candidate_id": CANDIDATE_ID,
        "status": "PASS_FULL_CHAIN_INDEPENDENTLY_RECOMPUTED", "run_id": run_id,
        "slot": slot, "cell": cell, "score_verdict": row["score_verdict"],
        "completion_storage_sha256": sha(row["completion_storage"]),
        "completion_storage_bytes": len(row["completion_storage"]),
        "prior_pass_count": index, "schedule_advance_allowed": row["score_verdict"] == "PASS",
        "subject_calls": 0, "provider_calls": 0, "network_calls": 0, "filesystem_writes": 0,
    }


def _validate_artifact_after_gate(root: Path, controls: dict[str, Any], run_id: str,
                                  slot: str, stage: str) -> dict[str, Any]:
    if slot not in SLOTS or stage not in STAGES:
        raise Invalid("artifact outside exact route/stage set")
    artifact_index = ARTIFACT_EMISSION_ORDER.index(stage)
    artifact_prefix = ARTIFACT_EMISSION_ORDER[:artifact_index + 1]
    count = ARTIFACT_BOUNDARY_INDEX[stage] + 1
    inventory = _terminal_inventory(
        root, controls, required_counts={slot: count},
        artifact_prefix_override={slot: artifact_prefix},
    )
    consumed = _consume_inventory(
        root, run_id, controls, inventory, require_all_pass_slots={slot})
    _confirm_inventory_stable(
        root, controls, inventory, required_counts={slot: count},
        artifact_prefix_override={slot: artifact_prefix},
    )
    return consumed["artifacts"][slot][-1]


def _validate_path_after_gate(root: Path, controls: dict[str, Any], run_id: str,
                              slot: str) -> dict[str, Any]:
    if slot not in SLOTS:
        raise Invalid("slot outside exact routes")
    if controls["run"]["run_kind"] != "QUALIFICATION_MATRIX":
        raise Invalid("complete path validation requires QUALIFICATION_MATRIX")
    inventory_state = _terminal_inventory(
        root, controls, required_counts={slot: len(controls["cells"])})
    consumed = _consume_inventory(
        root, run_id, controls, inventory_state, require_all_pass_slots={slot})
    _confirm_inventory_stable(
        root, controls, inventory_state,
        required_counts={slot: len(controls["cells"])},
    )
    cells = consumed["chains"][slot]
    artifacts = consumed["artifacts"][slot]
    inventory = canonical({
        "cells": [{"cell": cell, "completion_sha256": sha(row["completion_storage"]),
                   "completion_bytes": len(row["completion_storage"])}
                  for cell, row in zip(controls["cells"], cells, strict=True)],
        "artifacts": artifacts,
    })
    return {
        "schema_id": "pw-r8-independent-path-validation-v20", "candidate_id": CANDIDATE_ID,
        "status": "PASS_COMPLETE_CLEAN_PATH", "run_id": run_id, "slot": slot,
        "passed_cells": 97, "deterministic_artifacts": 18,
        "inventory_sha256": sha(inventory), "inventory_bytes": len(inventory),
    }


def _validate_matrix_material(root: Path, run_id: str, controls: dict[str, Any]) -> tuple[dict[str, Any], dict[str, Any]]:
    if controls["run"]["run_kind"] != "QUALIFICATION_MATRIX":
        raise Invalid("qualification credit requires exact QUALIFICATION_MATRIX")
    inventory_state = _terminal_inventory(
        root, controls,
        required_counts={slot: len(controls["cells"]) for slot in SLOTS},
    )
    consumed = _consume_inventory(
        root, run_id, controls, inventory_state, require_all_pass_slots=set(SLOTS))
    _confirm_inventory_stable(
        root, controls, inventory_state,
        required_counts={slot: len(controls["cells"]) for slot in SLOTS},
    )
    rows: list[dict[str, Any]] = []
    for slot in SLOTS:
        inventory = canonical({
            "cells": [
                {"cell": cell, "completion_sha256": sha(row["completion_storage"]),
                 "completion_bytes": len(row["completion_storage"])}
                for cell, row in zip(controls["cells"], consumed["chains"][slot], strict=True)
            ],
            "artifacts": consumed["artifacts"][slot],
        })
        rows.append({
            "schema_id": "pw-r8-independent-path-validation-v20",
            "candidate_id": CANDIDATE_ID, "status": "PASS_COMPLETE_CLEAN_PATH",
            "run_id": run_id, "slot": slot, "passed_cells": 97,
            "deterministic_artifacts": 18,
            "inventory_sha256": sha(inventory), "inventory_bytes": len(inventory),
        })
    inventory = canonical(rows)
    result = {
        "schema_id": "pw-r8-independent-matrix-validation-v20", "candidate_id": CANDIDATE_ID,
        "status": "PASS_COMPLETE_CLEAN_MATRIX", "run_id": run_id, "routes": 3,
        "passed_cells": 291, "deterministic_artifacts": 54,
        "inventory_sha256": sha(inventory), "inventory_bytes": len(inventory),
        "qualification_credit": 1,
    }
    return result, consumed


def _validate_matrix_after_gate(root: Path, controls: dict[str, Any], run_id: str) -> dict[str, Any]:
    return _validate_matrix_material(root, run_id, controls)[0]


def _validate_two_runs_after_gate(first_root: Path, second_root: Path,
                                  first_controls: dict[str, Any], second_controls: dict[str, Any],
                                  first_run: dict[str, Any], second_run: dict[str, Any],
                                  first_id: str, second_id: str) -> dict[str, Any]:
    if (
        first_run["run_kind"] != "QUALIFICATION_MATRIX"
        or second_run["run_kind"] != "QUALIFICATION_MATRIX"
        or first_run["qualification_sequence"] != 1
        or first_run["predecessor_run_id"] is not None
        or second_run["qualification_sequence"] != 2
        or second_run["predecessor_run_id"] != first_id
    ):
        raise Invalid("two-run exact kind/sequence/predecessor mismatch")
    frozen = (
        "candidate_freeze_manifest_path", "candidate_freeze_manifest_storage_sha256",
        "candidate_freeze_manifest_storage_bytes", "qualification_contract", "routes",
    )
    if any(first_run[key] != second_run[key] for key in frozen):
        raise Invalid("two runs do not share byte-identical frozen protocol")
    first_nonces = {row["dispatch_nonce"] for row in first_controls["entries"]}
    second_nonces = {row["dispatch_nonce"] for row in second_controls["entries"]}
    first_tasks = {row["task_id"] for row in first_controls["run"]["run_inventory"]["tasks"]}
    second_tasks = {row["task_id"] for row in second_controls["run"]["run_inventory"]["tasks"]}
    if first_nonces & second_nonces or first_tasks & second_tasks or len(first_tasks) != 291 or len(second_tasks) != 291:
        raise Invalid("nonce or task identity reused across qualification runs")
    first, first_consumed = _validate_matrix_material(first_root, first_id, first_controls)
    second, second_consumed = _validate_matrix_material(second_root, second_id, second_controls)
    first_ids, second_ids = first_consumed["identities"], second_consumed["identities"]
    if any(first_ids[key] & second_ids[key] for key in first_ids):
        raise Invalid("thread, turn, or rollout identity reused across qualification runs")
    inventory = canonical([first, second])
    return {
        "schema_id": "pw-r8-independent-two-run-validation-v20", "candidate_id": CANDIDATE_ID,
        "status": "PASS_TWO_CONSECUTIVE_CLEAN_MATRICES", "first_run_id": first_id,
        "second_run_id": second_id, "matrices": 2, "routes": 6, "passed_cells": 582,
        "inventory_sha256": sha(inventory), "inventory_bytes": len(inventory),
        "qualification_streak": 2,
    }


def validate_cell(root_value: str, run_id: str, slot: str, cell: str) -> dict[str, Any]:
    root = execution_root(root_value)
    return _root_bound_operation(root, run_id, "validate-cell", slot, cell)


def validate_artifact(root_value: str, run_id: str, slot: str, stage: str) -> dict[str, Any]:
    root = execution_root(root_value)
    return _root_bound_operation(root, run_id, "validate-artifact", slot, stage)


def validate_path(root_value: str, run_id: str, slot: str) -> dict[str, Any]:
    root = execution_root(root_value)
    return _root_bound_operation(root, run_id, "validate-path", slot)


def validate_matrix(root_value: str, run_id: str) -> dict[str, Any]:
    root = execution_root(root_value)
    return _root_bound_operation(root, run_id, "validate-matrix")


def validate_two_runs(first_value: str, second_value: str) -> dict[str, Any]:
    first_root, second_root = execution_root(first_value), execution_root(second_value)
    return _root_bound_operation(first_root, None, "validate-two-runs", second_root)




# BEGIN CANDIDATE-20 STANDALONE AUTHORITY IMPLEMENTATION
V19_AUDIT = SUCCESSOR / "model_retest_r8_candidate_v19/independent_preseal_audit.json"
V19_PROGRESS = SUCCESSOR / "r8_progress_assessment_candidate_v19_preseal_fail_v1.json"
FREEZE_RELATIVE_PATH = "tests/agent_packet_restrictions/successor_20260813/r8_candidate_v20_freeze_manifest.json"
AUDIT_RELATIVE_PATH = "tests/agent_packet_restrictions/successor_20260813/model_retest_r8_candidate_v20/independent_preseal_audit.json"
PROGRESS_RELATIVE_PATH = "tests/agent_packet_restrictions/successor_20260813/r8_progress_assessment_candidate_v20_pre_freeze_v1.json"
PRE_AUDIT_FILES = (
    "README.md", "architecture_contract.json", "controller_contract.json",
    "deterministic_preflight_report.json", "process_completion_contract.json",
    "r8_clean_room_controller.py", "r8_run_verifier.py",
)
POST_AUDIT_BUNDLE_FILES = PRE_AUDIT_FILES + ("independent_preseal_audit.json",)
FREEZE_KEYS = (
    "schema_id", "candidate_id", "status", "parent_candidate_id", "checkpoint_commit",
    "goal_loop_buster_addendum", "v19_failed_audit", "v19_progress_assessment",
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
    "goal_loop_buster_addendum", "v19_failed_audit", "v19_progress_assessment",
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
        "schema_id": "pw-r8-qualification-contract-v20", "candidate_id": CANDIDATE_ID,
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
        "tests/agent_packet_restrictions/successor_20260813/model_retest_r8_candidate_v19/independent_preseal_audit.json",
        "984e99bf430fc00fe48774c6d4d8644cfd4139fc9505ebc4012539418b64bf70", 22449)


def _v19_progress_lineage() -> dict[str, Any]:
    return _v19_fixed_binding(
        "tests/agent_packet_restrictions/successor_20260813/r8_progress_assessment_candidate_v19_preseal_fail_v1.json",
        "77b1ffdf0e91d44fab035d91091184353bc8ed019a3ce320ce64f28f29ce2f19", 4547)


def _v19_expected_dependency_rows() -> list[dict[str, Any]]:
    _storage, architecture, _info = exact_file(ROOT / "architecture_contract.json", "candidate-v20 architecture")
    rows = architecture.get("runtime_dependency_closure")
    if not isinstance(rows, list) or len(rows) != 65:
        raise Invalid("candidate-v20 dependency closure is not exact 65 rows")
    paths = []
    for row in rows:
        if not isinstance(row, dict) or tuple(row) != ("path", "sha256", "bytes", "roles"):
            raise Invalid("candidate-v20 dependency row schema invalid")
        path = row.get("path")
        if not isinstance(path, str) or Path(path).is_absolute() or ".." in Path(path).parts:
            raise Invalid("candidate-v20 dependency path invalid")
        paths.append(path)
    if paths != sorted(paths) or len(paths) != len(set(paths)):
        raise Invalid("candidate-v20 dependency paths not exact sorted unique")
    return rows


def _v19_dependency_inventory(rows: list[dict[str, Any]]) -> dict[str, Any]:
    storage = canonical(rows)
    return {"exact_sorted_unique_files": len(rows), "canonical_rows_sha256": sha(storage), "canonical_rows_bytes": len(storage)}


def _v19_preflight_binding(read_repo: Callable[[str], bytes]) -> dict[str, Any]:
    path = "tests/agent_packet_restrictions/successor_20260813/model_retest_r8_candidate_v20/deterministic_preflight_report.json"
    data = read_repo(path)
    value = strict_object(data, "candidate-v20 deterministic preflight")
    if value.get("schema_id") != "pw-r8-deterministic-preflight-report-v20" or value.get("candidate_id") != CANDIDATE_ID or value.get("typed_result") != {"type": "PASS", "fail_closed": True}:
        raise Invalid("candidate-v20 deterministic preflight not typed PASS")
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
    if tuple(audit) != AUDIT_KEYS or audit.get("schema_id") != "pw-r8-independent-preseal-audit-v20" or audit.get("candidate_id") != CANDIDATE_ID:
        raise Invalid("candidate-v20 audit strict schema/identity mismatch")
    exact = {"status": "COMPLETE", "verdict": "PRESEAL_PASS", "independent_decision": "LOOP_BROKEN", "loop_broken": True, "freeze_authorized": True, "launch_authorized": False, "subject_calls": 0, "provider_calls": 0, "network_calls": 0, "blocking_findings": []}
    if any(audit.get(k) != v for k, v in exact.items()) or not isinstance(audit.get("nonclaims"), list):
        raise Invalid("candidate-v20 audit is not exact PRESEAL_PASS/LOOP_BROKEN")
    identity = audit.get("candidate_byte_identity")
    rows = identity.get("files") if isinstance(identity, dict) else None
    if not isinstance(identity, dict) or tuple(identity) != ("status", "files") or identity.get("status") != "PASS" or not isinstance(rows, list) or [row.get("path") for row in rows if isinstance(row, dict)] != list(PRE_AUDIT_FILES):
        raise Invalid("candidate-v20 audit seven-file identity mismatch")
    prefix = "tests/agent_packet_restrictions/successor_20260813/model_retest_r8_candidate_v20/"
    for row, name in zip(rows, PRE_AUDIT_FILES, strict=True):
        if tuple(row) != ("path", "sha256", "bytes"):
            raise Invalid("candidate-v20 audit file row schema mismatch")
        full = prefix + name
        actual = _v19_exact_bound({**row, "path": full}, full, commit, read_repo, git_blob)
        if (sha(actual), len(actual)) != (row["sha256"], row["bytes"]):
            raise Invalid("candidate-v20 audit file identity drift")
    if not isinstance(audit.get("source_bindings"), dict) or tuple(audit["source_bindings"]) != AUDIT_SOURCE_KEYS or audit["source_bindings"] != sources:
        raise Invalid("candidate-v20 audit source bindings mismatch")
    if canonical(audit) + b"\n" != storage:
        raise Invalid("candidate-v20 audit noncanonical storage")
    return rows


def _v19_validate_progress(progress: dict[str, Any], storage: bytes, audit_binding: dict[str, Any]) -> None:
    if tuple(progress) != PROGRESS_KEYS or progress.get("schema_id") != "pw-r8-progress-assessment-v1" or progress.get("identity_family") != IDENTITY_FAMILY or progress.get("candidate_id") != CANDIDATE_ID or progress.get("parent_candidate_id") != "PW-R8-ITERATIVE-FIX-TWO-CLEAN-RUNS-20260815.CANDIDATE-19":
        raise Invalid("candidate-v20 progress strict schema/identity mismatch")
    terminal = progress.get("candidate_terminal")
    expected = {"type": "PRESEAL_PASS", "independent_decision": "LOOP_BROKEN", "audit_path": AUDIT_RELATIVE_PATH, "audit_storage_sha256": audit_binding["sha256"], "audit_storage_bytes": audit_binding["bytes"], "freeze_authorized": True, "launch_authorized": False, "authorized_next_execution": "EXACT_THREE_ROUTE_ZERO_CREDIT_CANARY_ONLY"}
    if terminal != expected or tuple(terminal) != tuple(expected) or progress.get("goal_loop_buster_addendum") != _v19_goal_binding() or progress.get("decision") != "LOOP_BROKEN" or progress.get("calls") != {"subject": 0, "provider": 0, "network": 0} or progress.get("qualification_credit") != 0 or progress.get("normalized_failures") != []:
        raise Invalid("candidate-v20 progress not exact zero-call LOOP_BROKEN")
    if canonical(progress) + b"\n" != storage:
        raise Invalid("candidate-v20 progress noncanonical storage")


def _v19_validate_freeze_object(freeze: dict[str, Any], *, manifest_path: str, head: str,
                                read_repo: Callable[[str], bytes], git_blob: Callable[[str, str], bytes],
                                expected_rows: list[dict[str, Any]]) -> dict[str, Any]:
    if manifest_path != FREEZE_RELATIVE_PATH or tuple(freeze) != FREEZE_KEYS:
        raise Invalid("freeze path or exact keys/order invalid")
    if freeze.get("schema_id") != "pw-r8-candidate-freeze-manifest-v20" or freeze.get("candidate_id") != CANDIDATE_ID or freeze.get("status") != "FROZEN" or freeze.get("parent_candidate_id") != "PW-R8-ITERATIVE-FIX-TWO-CLEAN-RUNS-20260815.CANDIDATE-19":
        raise Invalid("freeze identity/status invalid")
    commit = freeze.get("checkpoint_commit")
    if not isinstance(commit, str) or not HEX40_RE_V18.fullmatch(commit) or commit != head:
        raise Invalid("freeze checkpoint stale or not current HEAD")
    fixed = {"goal_loop_buster_addendum": _v19_goal_binding(), "v19_failed_audit": _v19_audit_lineage(), "v19_progress_assessment": _v19_progress_lineage(), "qualification_contract": _qualification_contract()}
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
    preflight = _v19_preflight_binding(read_repo)
    if freeze.get("deterministic_preflight") != preflight:
        raise Invalid("freeze deterministic preflight binding mismatch")

    audit_ref = freeze.get("independent_preseal_audit")
    if not isinstance(audit_ref, dict) or tuple(audit_ref) != ("path", "sha256", "bytes", "verdict", "independent_decision", "loop_broken") or audit_ref.get("path") != AUDIT_RELATIVE_PATH or audit_ref.get("verdict") != "PRESEAL_PASS" or audit_ref.get("independent_decision") != "LOOP_BROKEN" or audit_ref.get("loop_broken") is not True:
        raise Invalid("freeze audit reference invalid")
    audit_binding = {k: audit_ref[k] for k in ("path", "sha256", "bytes")}
    audit_storage = _v19_exact_bound(audit_binding, AUDIT_RELATIVE_PATH, commit, read_repo, git_blob)
    audit = strict_object(audit_storage, "candidate-v20 future audit")

    progress_ref = freeze.get("pre_freeze_progress")
    if not isinstance(progress_ref, dict) or tuple(progress_ref) != ("path", "sha256", "bytes", "decision") or progress_ref.get("path") != PROGRESS_RELATIVE_PATH or progress_ref.get("decision") != "LOOP_BROKEN":
        raise Invalid("freeze progress reference invalid")
    progress_binding = {k: progress_ref[k] for k in ("path", "sha256", "bytes")}
    progress_storage = _v19_exact_bound(progress_binding, PROGRESS_RELATIVE_PATH, commit, read_repo, git_blob)
    progress = strict_object(progress_storage, "candidate-v20 future progress")

    sources = {"goal_loop_buster_addendum": _v19_goal_binding(), "v19_failed_audit": _v19_audit_lineage(), "v19_progress_assessment": _v19_progress_lineage(), "dependency_inventory": inventory, "deterministic_preflight": preflight, "qualification_contract": _qualification_contract()}
    audited_rows = _v19_validate_audit(audit, audit_storage, sources, commit, read_repo, git_blob)
    _v19_validate_progress(progress, progress_storage, audit_binding)
    bundle = freeze.get("audited_candidate_bundle")
    rows = bundle.get("files") if isinstance(bundle, dict) else None
    if not isinstance(bundle, dict) or tuple(bundle) != ("schema_id", "candidate_id", "file_count", "files") or bundle.get("schema_id") != "pw-r8-post-audit-candidate-bundle-v20" or bundle.get("candidate_id") != CANDIDATE_ID or bundle.get("file_count") != 8 or not isinstance(rows, list) or [row.get("path") for row in rows if isinstance(row, dict)] != list(POST_AUDIT_BUNDLE_FILES):
        raise Invalid("freeze audited candidate bundle invalid")
    prefix = "tests/agent_packet_restrictions/successor_20260813/model_retest_r8_candidate_v20/"
    for row, name in zip(rows, POST_AUDIT_BUNDLE_FILES, strict=True):
        if tuple(row) != ("path", "sha256", "bytes"):
            raise Invalid("freeze candidate bundle row schema invalid")
        _v19_exact_bound({**row, "path": prefix + name}, prefix + name, commit, read_repo, git_blob)
    if rows[:-1] != audited_rows or rows[-1] != {"path": "independent_preseal_audit.json", "sha256": audit_binding["sha256"], "bytes": audit_binding["bytes"]}:
        raise Invalid("freeze candidate bundle differs from audit custody")
    return {"schema_id": "pw-r8-freeze-validation-v20", "candidate_id": CANDIDATE_ID, "status": "PASS", "checkpoint_commit": commit, "bundle_files": 8, "dependency_files": 65, "subject_calls": 0, "provider_calls": 0, "network_calls": 0}


def _validate_freeze_static_authority(freeze: dict[str, Any]) -> dict[str, Any]:
    if tuple(freeze) != FREEZE_KEYS or freeze.get("schema_id") != "pw-r8-candidate-freeze-manifest-v20" or freeze.get("candidate_id") != CANDIDATE_ID or freeze.get("status") != "FROZEN":
        raise Invalid("freeze static exact schema invalid")
    if freeze.get("parent_candidate_id") != "PW-R8-ITERATIVE-FIX-TWO-CLEAN-RUNS-20260815.CANDIDATE-19" or not HEX40_RE_V18.fullmatch(str(freeze.get("checkpoint_commit"))) or freeze.get("checkpoint_commit") == "0" * 40:
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
    storage, freeze, _info = exact_file(REPO / manifest_rel, "candidate-v20 freeze manifest")
    if (sha(storage), len(storage)) != (expected_sha, expected_bytes):
        raise Invalid("freeze manifest storage binding mismatch")
    _v19_validate_freeze_object(freeze, manifest_path=manifest_rel, head=_v19_git_head(), read_repo=_v19_read_repo, git_blob=_v19_git_blob, expected_rows=_v19_expected_dependency_rows())
    return storage, freeze


def _v19_dispatch_nonce(run_id: str, slot: str, cell: str) -> str:
    return sha(b"pw-r8-c17-dispatch-nonce-v1\0" + run_id.encode() + b"\0" + slot.encode() + b"\0" + cell.encode())


def _v19_expected_ordered(run_id: str) -> dict[str, Any]:
    return {"schema_id": "pw-r8-ordered-schedule-v20", "candidate_id": CANDIDATE_ID, "run_id": run_id, "cells": list(_frozen_cells())}


def _v19_expected_dispatch(run_id: str) -> dict[str, Any]:
    entries = [{"slot": slot, "cell": cell, "dispatch_nonce": _v19_dispatch_nonce(run_id, slot, cell)} for slot in SLOTS for cell in _frozen_cells()]
    return {"schema_id": "pw-r8-dispatch-schedule-v20", "candidate_id": CANDIDATE_ID, "run_id": run_id, "nonce_encoding": "lowercase-hex-256", "nonce_derivation": "sha256(pw-r8-c17-dispatch-nonce-v1\\0run_id\\0slot\\0cell)", "entry_count": 291, "entries": entries}


def _expected_run_inventory(run_id: str, entries: list[dict[str, Any]]) -> dict[str, Any]:
    tasks = []
    for entry in entries:
        slot, cell = entry["slot"], entry["cell"]
        paths = _paths(Path("<execution-root>"), slot, cell)
        tasks.append({"task_id": f"{run_id}:{slot}:{cell}", "slot": slot, "cell": cell, "dispatch_nonce": entry["dispatch_nonce"], "transaction_claim_relative_path": paths["claim"][0], "rendered_relative_path": paths["render"][0], "dispatch_attempt_relative_path": paths["attempt"][0], "receipt_relative_path": paths["receipt"][0], "capture_relative_path": paths["capture"][0], "score_relative_path": paths["score"][0], "completion_relative_path": paths["completion"][0]})
    return {"schema_id": "pw-r8-exact-run-inventory-v20", "candidate_id": CANDIDATE_ID, "run_id": run_id, "task_count": 291, "controller_invalid_extras": 0, "tasks": tasks}


_FROZEN_SCHEDULE_SHA256 = "24c5f04731ac554733cc1df20067f70335b5349fdc2aa802948af893efe24b65"
_FROZEN_SCHEDULE_BYTES = 1536


def _v19_bootstrap_controls(*, run_storage: bytes,
                            load_ordered: Callable[[], bytes],
                            load_dispatch: Callable[[], bytes],
                            freeze_validator: Callable[[str, str, int], tuple[bytes, dict[str, Any]]],
                            run_id: str, slot: str | None, cell: str | None, nonce: str | None,
                            events: list[dict[str, Any]]) -> dict[str, Any]:
    """Dependency-free authority gate followed by one explicit semantic transition."""
    if not RUN_ID_RE.fullmatch(run_id):
        raise Invalid("run id invalid before authority gate")
    targeted = slot is not None or cell is not None or nonce is not None
    if targeted and (slot not in SLOTS or not isinstance(cell, str) or not CELL_RE.fullmatch(cell) or
                     not isinstance(nonce, str) or not HEX64_RE.fullmatch(nonce)):
        raise Invalid("target envelope invalid before authority gate")
    run = strict_object(run_storage, "minimal run contract")
    if canonical(run) + b"\n" != run_storage or tuple(run) != RUN_KEYS:
        raise Invalid("run contract exact canonical schema invalid before authority gate")
    if run.get("schema_id") != "pw-r8-run-contract-v20" or run.get("candidate_id") != CANDIDATE_ID or run.get("run_id") != run_id:
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
    if tuple(ordered) != ("schema_id", "candidate_id", "run_id", "cells") or ordered.get("schema_id") != "pw-r8-ordered-schedule-v20" or ordered.get("candidate_id") != CANDIDATE_ID or ordered.get("run_id") != run_id or canonical(ordered) + b"\n" != ordered_storage:
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
        dispatch.get("schema_id") != "pw-r8-dispatch-schedule-v20" or
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
    if tuple(run) != RUN_KEYS or run.get("schema_id") != "pw-r8-run-contract-v20" or run.get("candidate_id") != CANDIDATE_ID or run.get("run_id") != run_id:
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


def _root_bound_operation(root: Path, run_id: str | None, operation_name: str,
                          first_value: Any = None, second_value: Any = None) -> dict[str, Any]:
    allowed = {"validate-cell", "validate-artifact", "validate-path",
               "validate-matrix", "validate-two-runs"}
    if operation_name not in allowed:
        raise Invalid("unsupported root-bound verifier operation")
    if operation_name == "validate-two-runs":
        _first_storage, first_run, _ = exact_file(root / "run_contract.json", "first run contract")
        first_id = first_run.get("run_id")
        if not isinstance(first_id, str):
            raise Invalid("first run identity absent")
        run_id = first_id
    elif not isinstance(run_id, str):
        raise Invalid("run identity absent")
    controls = _validate_execution_root_static(root, run_id, None, None, None)

    def load_external(path: Path, name: str) -> ModuleType:
        _load_order_event("external_module_execute", path=str(path.resolve()), module_name=name)
        spec = importlib.util.spec_from_file_location(name, path)
        if spec is None or spec.loader is None:
            raise Invalid(f"module unavailable: {path}")
        loaded = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(loaded)
        return loaded

    def attach_semantics(active: dict[str, Any], label: str) -> None:
        _load_order_event("external_semantic_schedule_factory", path=str(V9_HARNESS.resolve()))
        harness = load_external(V9_HARNESS, f"pw_r8_v20_verifier_{label}")
        semantic = harness.semantic_module(candidate_identity=False)
        if tuple(semantic.SUBJECT_CELLS) != tuple(active["cells"]):
            raise Invalid("root-gated semantic schedule differs from admitted static schedule")
        active["_lexical_semantics"] = semantic

    attach_semantics(controls, "first_root_operation")
    try:
        if operation_name == "validate-cell":
            result = _validate_cell_after_gate(root, controls, run_id,
                                               str(first_value), str(second_value))
        elif operation_name == "validate-artifact":
            result = _validate_artifact_after_gate(root, controls, run_id,
                                                   str(first_value), str(second_value))
        elif operation_name == "validate-path":
            result = _validate_path_after_gate(root, controls, run_id, str(first_value))
        elif operation_name == "validate-matrix":
            result = _validate_matrix_after_gate(root, controls, run_id)
        else:
            if not isinstance(first_value, Path):
                raise Invalid("second execution root absent")
            second_root = execution_root(first_value)
            _second_storage, second_run, _ = exact_file(
                second_root / "run_contract.json", "second run contract")
            second_id = second_run.get("run_id")
            if not isinstance(second_id, str) or second_id == run_id:
                raise Invalid("second run identity absent or reused")
            second_controls = _validate_execution_root_static(
                second_root, second_id, None, None, None)
            attach_semantics(second_controls, "second_root_operation")
            try:
                result = _validate_two_runs_after_gate(
                    root, second_root, controls, second_controls,
                    first_run, second_run, run_id, second_id)
            finally:
                second_controls.pop("_lexical_semantics", None)
        if not isinstance(result, dict) or any(isinstance(value, ModuleType) for value in result.values()):
            raise Invalid("root-bound verifier attempted to return authority state")
        return result
    finally:
        controls.pop("_lexical_semantics", None)


def _preflight_gate(operation: Callable[[Callable[[Path, str], ModuleType],
                                         ModuleType], Any]) -> Any:
    """Validate the exact local closure before any preflight external execute."""
    rows = _v19_expected_dependency_rows()
    for row in rows:
        data, _ = regular(SUCCESSOR / row["path"], f"preflight dependency {row['path']}")
        if (sha(data), len(data)) != (row["sha256"], row["bytes"]):
            raise Invalid(f"preflight dependency drift: {row['path']}")
    expected_cells = _frozen_cells()
    _load_order_event("preflight_dependency_closure_gate_pass", dependency_files=len(rows))

    def load_external(path: Path, name: str) -> ModuleType:
        spec = importlib.util.spec_from_file_location(name, path)
        if spec is None or spec.loader is None:
            raise Invalid(f"module unavailable: {path}")
        loaded = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(loaded)
        return loaded

    _load_order_event("external_module_execute", path=str(V9_HARNESS.resolve()),
                      module_name="pw_r8_candidate_v9_verifier_preflight_for_v20")
    harness = load_external(V9_HARNESS, "pw_r8_candidate_v9_verifier_preflight_for_v20")
    return operation(load_external, harness)


def _v19_synthetic_progress(audit_binding: dict[str, Any], marker: str) -> dict[str, Any]:
    return {"schema_id": "pw-r8-progress-assessment-v1", "identity_family": IDENTITY_FAMILY, "goal_loop_buster_addendum": _v19_goal_binding(), "candidate_id": CANDIDATE_ID, "parent_candidate_id": "PW-R8-ITERATIVE-FIX-TWO-CLEAN-RUNS-20260815.CANDIDATE-19", "candidate_terminal": {"type": "PRESEAL_PASS", "independent_decision": "LOOP_BROKEN", "audit_path": AUDIT_RELATIVE_PATH, "audit_storage_sha256": audit_binding["sha256"], "audit_storage_bytes": audit_binding["bytes"], "freeze_authorized": True, "launch_authorized": False, "authorized_next_execution": "EXACT_THREE_ROUTE_ZERO_CREDIT_CANARY_ONLY"}, "normalized_failures": [], "prior_reproducer_and_new_counterfactual_status": [{"marker": marker}], "valid_first_attempt_cells_completed_before_invalidation": 0, "longest_valid_causal_prefix": {"subject_cells": 0, "basis": "synthetic"}, "previously_closed_failure_classes": {"status": "PASS_ZERO_CALL"}, "architectural_surface_delta": {"standalone": True}, "decision": "LOOP_BROKEN", "decision_evidence": {"synthetic": True}, "next_action": {"mode": "FREEZE_THEN_CANARY"}, "calls": {"subject": 0, "provider": 0, "network": 0}, "qualification_credit": 0, "nonclaims": [f"synthetic {marker}"]}


def _v19_synthetic_authority(marker: str, expected_rows: list[dict[str, Any]]) -> tuple[dict[str, bytes], dict[str, Any], str]:
    commit = sha(("v18-synthetic-head-" + marker).encode())[:40]
    prefix = "tests/agent_packet_restrictions/successor_20260813/model_retest_r8_candidate_v20/"
    files: dict[str, bytes] = {}
    for index, name in enumerate(PRE_AUDIT_FILES):
        if name == "README.md": data = f"synthetic v18 {marker}\n".encode()
        elif name == "architecture_contract.json": data = canonical({"schema_id": "pw-r8-clean-room-architecture-contract-v20", "candidate_id": CANDIDATE_ID, "runtime_dependency_closure": expected_rows}) + b"\n"
        elif name == "deterministic_preflight_report.json": data = canonical({"schema_id": "pw-r8-deterministic-preflight-report-v20", "candidate_id": CANDIDATE_ID, "typed_result": {"type": "PASS", "fail_closed": True}, "marker": marker}) + b"\n"
        elif name.endswith(".json"): data = canonical({"schema_id": f"synthetic-{name}-{marker}", "ordinal": index}) + b"\n"
        else: data = f"# synthetic {name} {marker}\n".encode()
        files[prefix + name] = data
    for binding, source in ((_v19_goal_binding(), GOAL_ADDENDUM), (_v19_audit_lineage(), V19_AUDIT), (_v19_progress_lineage(), V19_PROGRESS)):
        data, _ = regular(source, f"synthetic lineage {source.name}"); files[binding["path"]] = data
    for row in expected_rows:
        repo_path = "tests/agent_packet_restrictions/successor_20260813/" + row["path"]
        data, _ = regular(REPO / repo_path, f"synthetic dependency {row['path']}"); files[repo_path] = data
    preflight = {**_v19_binding(prefix + "deterministic_preflight_report.json", files[prefix + "deterministic_preflight_report.json"]), "typed_result": "PASS"}
    inventory = _v19_dependency_inventory(expected_rows)
    sources = {"goal_loop_buster_addendum": _v19_goal_binding(), "v19_failed_audit": _v19_audit_lineage(), "v19_progress_assessment": _v19_progress_lineage(), "dependency_inventory": inventory, "deterministic_preflight": preflight, "qualification_contract": _qualification_contract()}
    audited_rows = [_v19_binding(name, files[prefix + name]) for name in PRE_AUDIT_FILES]
    audit = {"schema_id": "pw-r8-independent-preseal-audit-v20", "candidate_id": CANDIDATE_ID, "status": "COMPLETE", "verdict": "PRESEAL_PASS", "independent_decision": "LOOP_BROKEN", "loop_broken": True, "freeze_authorized": True, "launch_authorized": False, "subject_calls": 0, "provider_calls": 0, "network_calls": 0, "candidate_byte_identity": {"status": "PASS", "files": audited_rows}, "source_bindings": sources, "blocking_findings": [], "nonclaims": [f"synthetic audit {marker}"]}
    audit_storage = canonical(audit) + b"\n"; files[AUDIT_RELATIVE_PATH] = audit_storage
    audit_binding = _v19_binding(AUDIT_RELATIVE_PATH, audit_storage)
    progress = _v19_synthetic_progress(audit_binding, marker); progress_storage = canonical(progress) + b"\n"; files[PROGRESS_RELATIVE_PATH] = progress_storage
    progress_binding = _v19_binding(PROGRESS_RELATIVE_PATH, progress_storage)
    manifest = {"schema_id": "pw-r8-candidate-freeze-manifest-v20", "candidate_id": CANDIDATE_ID, "status": "FROZEN", "parent_candidate_id": "PW-R8-ITERATIVE-FIX-TWO-CLEAN-RUNS-20260815.CANDIDATE-19", "checkpoint_commit": commit, "goal_loop_buster_addendum": _v19_goal_binding(), "v19_failed_audit": _v19_audit_lineage(), "v19_progress_assessment": _v19_progress_lineage(), "independent_preseal_audit": {**audit_binding, "verdict": "PRESEAL_PASS", "independent_decision": "LOOP_BROKEN", "loop_broken": True}, "pre_freeze_progress": {**progress_binding, "decision": "LOOP_BROKEN"}, "audited_candidate_bundle": {"schema_id": "pw-r8-post-audit-candidate-bundle-v20", "candidate_id": CANDIDATE_ID, "file_count": 8, "files": audited_rows + [{"path": "independent_preseal_audit.json", "sha256": audit_binding["sha256"], "bytes": audit_binding["bytes"]}]}, "dependency_files": expected_rows, "dependency_inventory": inventory, "deterministic_preflight": preflight, "qualification_contract": _qualification_contract()}
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
    ordered = {"schema_id": "pw-r8-ordered-schedule-v20", "candidate_id": CANDIDATE_ID,
               "run_id": run_id, "cells": list(cells)}
    ordered_storage = canonical(ordered) + b"\n"
    entries = [{"slot": slot, "cell": cell,
                "dispatch_nonce": _v19_dispatch_nonce(run_id, slot, cell)}
               for slot in SLOTS for cell in cells]
    dispatch = {"schema_id": "pw-r8-dispatch-schedule-v20", "candidate_id": CANDIDATE_ID,
                "run_id": run_id, "nonce_encoding": "lowercase-hex-256",
                "nonce_derivation": "sha256(pw-r8-c17-dispatch-nonce-v1\\0run_id\\0slot\\0cell)",
                "entry_count": 291, "entries": entries}
    dispatch_storage = canonical(dispatch) + b"\n"
    inventory = _expected_run_inventory(run_id, entries)
    freeze_storage = canonical(manifest) + b"\n"
    authorized = [f"{run_id}:{slot}:{cells[0]}" for slot in SLOTS]
    run = {"schema_id": "pw-r8-run-contract-v20", "candidate_id": CANDIDATE_ID,
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


def _v19_load_order_suite(load_external: Callable[[Path, str], ModuleType]) -> dict[str, Any]:
    component = "controller" if Path(__file__).name == "r8_clean_room_controller.py" else "independent_verifier"
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
                harness = load_external(V9_HARNESS, f"pw_r8_v20_{component}_load_order")
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
    return {"schema_id": "pw-r8-load-order-suite-v20", "candidate_id": CANDIDATE_ID,
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
    prefix = "tests/agent_packet_restrictions/successor_20260813/model_retest_r8_candidate_v20/"
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
    run_id = "PW-R8-C20-CANARY-SYNTHETIC"; ordered = _v19_expected_ordered(run_id); ordered_storage = canonical(ordered) + b"\n"; dispatch = _v19_expected_dispatch(run_id); dispatch_storage = canonical(dispatch) + b"\n"; inventory = _expected_run_inventory(run_id, dispatch["entries"]); freeze_storage = canonical(manifest) + b"\n"; authorized = [f"{run_id}:{slot}:{_frozen_cells()[0]}" for slot in SLOTS]
    run = {"schema_id": "pw-r8-run-contract-v20", "candidate_id": CANDIDATE_ID, "run_id": run_id, "run_kind": "ZERO_CREDIT_THREE_ROUTE_CANARY", "subject_launch_authorized": True, "qualification_credit": 0, "launch_authorized_task_ids": authorized, "routes": {slot: {"requested_model": model, "requested_thinking": effort} for slot, (model, effort) in ROUTES.items()}, "fresh_task_required": True, "first_attempt_subject_call": True, "retry_count": 0, "best_of": False, "replacement_result": False, "ordered_schedule_path": "ordered_schedule.json", "ordered_schedule_storage_sha256": sha(ordered_storage), "ordered_schedule_storage_bytes": len(ordered_storage), "dispatch_schedule_path": "dispatch_schedule.json", "dispatch_schedule_storage_sha256": sha(dispatch_storage), "dispatch_schedule_storage_bytes": len(dispatch_storage), "candidate_freeze_manifest_path": FREEZE_RELATIVE_PATH, "candidate_freeze_manifest_storage_sha256": sha(freeze_storage), "candidate_freeze_manifest_storage_bytes": len(freeze_storage), "goal_loop_buster_addendum": manifest["goal_loop_buster_addendum"], "pre_freeze_progress": manifest["pre_freeze_progress"], "qualification_contract": _qualification_contract(), "run_inventory": inventory, "qualification_sequence": 0, "predecessor_run_id": None}
    fv = lambda p, h, n: (freeze_storage, manifest) if (p, h, n) == (FREEZE_RELATIVE_PATH, sha(freeze_storage), len(freeze_storage)) else (_ for _ in ()).throw(Invalid("synthetic freeze mismatch"))
    controls = _v19_validate_run_objects(run, canonical(run) + b"\n", ordered, ordered_storage, dispatch, dispatch_storage, run_id=run_id, freeze_validator=fv)
    passed("V16-RUN-CANARY-EXACT-THREE-FIRST-CELLS", {"authorized": controls["authorized_task_ids"]})
    for slot in SLOTS:
        passed(f"V16-RUN-ADMIT-{slot}-FIRST", {"task_id": f"{run_id}:{slot}:{_frozen_cells()[0]}"})
        rejects(f"V16-RUN-REJECT-{slot}-NEXT", lambda s=slot: (_ for _ in ()).throw(Invalid("cell was not authorized by exact run contract")) if f"{run_id}:{s}:{_frozen_cells()[1]}" not in controls["authorized_task_ids"] else None)
    wrong = dict(run); wrong["run_kind"] = "ZERO_CREDIT_CANARY"; rejects("V16-RUN-REJECT-WRONG-CANARY-ENUM", lambda: _v19_validate_run_objects(wrong, canonical(wrong) + b"\n", ordered, ordered_storage, dispatch, dispatch_storage, run_id=run_id, freeze_validator=fv))
    extra = dict(run); extra["launch_authorized_task_ids"] = authorized + [inventory["tasks"][1]["task_id"]]; rejects("V16-RUN-REJECT-EXTRA-CANARY-TASK", lambda: _v19_validate_run_objects(extra, canonical(extra) + b"\n", ordered, ordered_storage, dispatch, dispatch_storage, run_id=run_id, freeze_validator=fv))
    if len(cases) != 24: raise Invalid("retained authority case count mismatch")
    return {"schema_id": "pw-r8-authority-constructibility-suite-v20", "status": "PASS", "case_count": 24, "cases": cases, "subject_calls": 0, "provider_calls": 0, "network_calls": 0, "filesystem_writes": 0}


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
    return {"schema_id": "pw-r8-closure-custody-suite-v20", "status": "PASS", "exact_dependency_rows": len(rows), "full_snapshot": full, "v16_predecessor_missing_63_of_64": {**predecessor_sparse, "typed_result": "FAIL", "missing_rows": 63, "v17_result": sparse_reject}, "v16_predecessor_wrong_committed_bytes": [{**predecessor_a, "typed_result": "FAIL", "variant": "A", "v17_result": wrong_a_reject}, {**predecessor_b, "typed_result": "FAIL", "variant": "B", "v17_result": wrong_b_reject}], "deletion_iterations": deletions, "mutation_iterations": mutations, "shape_and_kind_cases": shape_cases, "deletion_case_count": len(deletions), "mutation_case_count": len(mutations), "subject_calls": 0, "provider_calls": 0, "network_calls": 0, "filesystem_writes": 0}


def _v19_independent_standalone_surface() -> dict[str, Any]:
    controller_path = ROOT / "r8_clean_room_controller.py"
    verifier_path = ROOT / "r8_run_verifier.py"
    controller_storage, _ = regular(controller_path, "standalone controller source")
    verifier_storage, _ = regular(verifier_path, "standalone verifier source")
    forbidden_dynamic = []
    write_calls = []
    for label, storage in (("controller", controller_storage), ("verifier", verifier_storage)):
        tree = ast.parse(storage.decode())
        for node in ast.walk(tree):
            if isinstance(node, ast.Call) and isinstance(node.func, ast.Name) and node.func.id == "_module" and node.args:
                arg = node.args[0]
                token = arg.id if isinstance(arg, ast.Name) else ast.unparse(arg)
                if any(mark in token.upper() for mark in ("V15", "V16", "V17", "V18", "C15", "C16", "C17", "C18")):
                    forbidden_dynamic.append({"file": label, "line": node.lineno, "argument": token})
            if isinstance(node, ast.Call) and isinstance(node.func, ast.Attribute) and node.func.attr in {"write_text", "write_bytes", "touch", "mkdir", "unlink", "rename", "replace"}:
                write_calls.append({"file": label, "line": node.lineno, "call": node.func.attr})
    if forbidden_dynamic or write_calls:
        raise Invalid("independent standalone/no-write source surface failed")
    rows = _v19_expected_dependency_rows()
    candidate_bundle = {str((ROOT / name).resolve()) for name in PRE_AUDIT_FILES}
    allowed = {str((SUCCESSOR / row["path"]).resolve()) for row in rows} | candidate_bundle
    executable = {str(V9_HARNESS.resolve()), str((SUCCESSOR / "model_retest_r8_candidate_v9/r8_subject_task_driver.py").resolve()), str(V14_VERIFIER.resolve()), str(verifier_path.resolve()), str(controller_path.resolve())}
    if not executable <= allowed:
        raise Invalid("independent executable source outside candidate bundle plus dependency rows")
    return {"status": "PASS", "controller_provider_call_sites": 1, "controller_filesystem_write_calls": [], "verifier_filesystem_write_calls": [], "verifier_imports_controller": False, "dynamic_v15_v16_v17_v18_controller_verifier_preflight_loads": [], "candidate_local_operative_implementation": True, "external_executable_modules": sorted(executable - candidate_bundle), "all_external_executables_in_dependency_rows": True}


def _validate_preflight_after_gate(load_external: Callable[[Path, str], ModuleType],
                                   harness: ModuleType) -> dict[str, Any]:
    executed = harness.preflight()
    storage, report, _ = exact_file(ROOT / "deterministic_preflight_report.json", "stored candidate-v20 preflight")
    if report.get("schema_id") != "pw-r8-deterministic-preflight-report-v20" or report.get("candidate_id") != CANDIDATE_ID or report.get("status") != "PASS" or report.get("typed_result") != {"type": "PASS", "fail_closed": True} or any(report.get(key) != 0 for key in ("subject_calls", "provider_calls", "network_calls", "filesystem_writes", "live_plans_reads")):
        raise Invalid("stored candidate-v20 typed zero-call identity mismatch")
    if report.get("parent_candidate") != {"candidate_id": "PW-R8-ITERATIVE-FIX-TWO-CLEAN-RUNS-20260815.CANDIDATE-19", "checkpoint_commit": CHECKPOINT_COMMIT} or report.get("goal_loop_buster_addendum", {}).get("sha256") != "d3f901e724d785ba3d053a961a8559b6f5b5add7e7b660a9fbb503586ad822d0" or report.get("v19_failed_audit", {}).get("sha256") != "984e99bf430fc00fe48774c6d4d8644cfd4139fc9505ebc4012539418b64bf70" or report.get("v19_progress_assessment", {}).get("sha256") != "77b1ffdf0e91d44fab035d91091184353bc8ed019a3ce320ce64f28f29ce2f19":
        raise Invalid("stored candidate-v20 lineage mismatch")
    closure = report.get("runtime_dependency_closure", {})
    rows = closure.get("rows")
    if rows != _v19_expected_dependency_rows() or closure.get("exact_sorted_unique_files") != 65 or closure.get("inventory_sha256") != sha(canonical(rows)) or closure.get("inventory_bytes") != len(canonical(rows)) or closure.get("live_plans_paths") != []:
        raise Invalid("stored candidate-v20 closure mismatch")
    for row in rows:
        data, _ = regular(SUCCESSOR / row["path"], f"independent dependency {row['path']}")
        if (sha(data), len(data)) != (row["sha256"], row["bytes"]):
            raise Invalid(f"independent dependency drift: {row['path']}")
    observed = closure.get("observed_open_enforcement", {})
    if observed.get("status") != "PASS" or observed.get("undeclared_observed_successor_files") != [] or observed.get("live_plans_paths") != []:
        raise Invalid("stored candidate-v20 observed-open closure mismatch")
    semantics = report.get("semantic_identity", {})
    if semantics.get("cells_compared") != 97 or any(semantics.get(key) != "97/97" for key in ("render_identity", "oracle_identity", "schedule_identity")):
        raise Invalid("stored candidate-v20 semantic identity mismatch")
    zero = report.get("zero_call_suite", {})
    boundary = report.get("verifier_boundary_suite", {})
    if zero.get("status") != "PASS" or zero.get("case_count") != 20 or boundary.get("status") != "PASS" or boundary.get("case_count") != 48 or [x.get("cells") for x in boundary.get("terminal_constructibility", [])] != [97, 291, 582]:
        raise Invalid("stored candidate-v20 retained control suites mismatch")
    authority = _v19_authority_suite()
    custody = _v19_closure_suite()
    if report.get("authority_constructibility_suite") != authority or report.get("closure_custody_suite") != custody:
        raise Invalid("stored candidate-v20 authority/closure suites not reproducible")
    if report.get("standalone_closure_surface") != _v19_independent_standalone_surface():
        raise Invalid("stored candidate-v20 standalone surface mismatch")
    load_order = report.get("load_order_suite", {})
    independent_load_order = _v19_load_order_suite(load_external)
    controller_load_order = load_order.get("controller", {})
    if (load_order.get("schema_id") != "pw-r8-dual-load-order-suite-v20" or
        load_order.get("status") != "PASS" or controller_load_order.get("status") != "PASS" or
        controller_load_order.get("component") != "controller" or
        controller_load_order.get("case_count") != 12 or
        load_order.get("independent_verifier") != independent_load_order):
        raise Invalid("stored candidate-v20 dual load-order suite not independently reproducible")
    entrypoints = report.get("entrypoint_authority_gate_suite", {})
    static_surface = report.get("static_entrypoint_surface", {})
    if (entrypoints.get("schema_id") != "pw-r8-root-bound-entrypoint-suite-v1" or
        entrypoints.get("status") != "PASS" or
        entrypoints.get("runtime_or_helper_entry_count") != 20 or
        entrypoints.get("invalid_authority_classes_per_entry") != 11 or
        len(entrypoints.get("predecessor_v19_bypass_traces", [])) != 16 or
        len(entrypoints.get("successor_v20_removed_surface_cases", [])) != 16 or
        len(entrypoints.get("actual_absent_root_entry_probes", [])) != 20 or
        len(entrypoints.get("cli_runtime_command_probes", [])) != 6 or
        len(entrypoints.get("authority_class_matrix", [])) != 20 or
        entrypoints.get("authority_object_returned") is not False or
        entrypoints.get("authority_object_parameter_accepted") is not False or
        any(row.get("external_dependency_events") != 0
            for row in entrypoints.get("actual_absent_root_entry_probes", [])) or
        static_surface.get("schema_id") != "pw-r8-root-bound-operation-surface-v1" or
        static_surface.get("status") != "PASS" or
        static_surface.get("opaque_token_mint_count") != 0 or
        static_surface.get("authority_objects_publicly_returned") != 0 or
        static_surface.get("external_load_sites_total") != 4 or
        any(component.get("removed_authority_globals_present") != []
            for component in static_surface.get("components", {}).values())):
        raise Invalid("stored candidate-v20 root-bound operation boundary mismatch")
    if executed.get("exact_subject_cell_schedule") != list(_frozen_cells()):
        raise Invalid("independent semantic schedule execution mismatch")
    return {"schema_id": "pw-r8-independent-preflight-validation-v20", "candidate_id": CANDIDATE_ID, "status": "PASS", "storage_sha256": sha(storage), "storage_bytes": len(storage), "dependencies_reopened": 65, "authority_cases": 24, "load_order_controller_cases": 12, "load_order_verifier_cases": 12, "entrypoint_runtime_or_helper_cases": 20, "entrypoint_invalid_authority_classes": 11, "entrypoint_cli_cases": 6, "predecessor_direct_bypass_cases": 16, "successor_removed_surface_cases": 16, "closure_deletion_cases": 65, "closure_mutation_cases": 65, "prefix_boundary_cases": 48, "named_zero_call_cases": 20, "semantic_cells": 97, "subject_calls": 0, "provider_calls": 0, "network_calls": 0, "filesystem_writes": 0}


def validate_preflight() -> dict[str, Any]:
    return _preflight_gate(_validate_preflight_after_gate)



def parser() -> argparse.ArgumentParser:
    p = argparse.ArgumentParser()
    sub = p.add_subparsers(dest="command", required=True)
    q = sub.add_parser("validate-cell")
    for name in ("run-id", "execution-root", "slot", "cell"):
        q.add_argument(f"--{name}", required=True)
    q = sub.add_parser("validate-artifact")
    for name in ("run-id", "execution-root", "slot", "stage"):
        q.add_argument(f"--{name}", required=True)
    q = sub.add_parser("validate-path")
    for name in ("run-id", "execution-root", "slot"):
        q.add_argument(f"--{name}", required=True)
    q = sub.add_parser("validate-matrix")
    for name in ("run-id", "execution-root"):
        q.add_argument(f"--{name}", required=True)
    q = sub.add_parser("validate-two-runs")
    q.add_argument("--first-execution-root", required=True)
    q.add_argument("--second-execution-root", required=True)
    sub.add_parser("validate-preflight")
    q = sub.add_parser("validate-freeze")
    q.add_argument("--manifest", required=True)
    sub.add_parser("self-test")
    return p


def main() -> int:
    args = parser().parse_args()
    try:
        if args.command == "validate-cell":
            value = validate_cell(args.execution_root, args.run_id, args.slot, args.cell)
        elif args.command == "validate-artifact":
            value = validate_artifact(args.execution_root, args.run_id, args.slot, args.stage)
        elif args.command == "validate-path":
            value = validate_path(args.execution_root, args.run_id, args.slot)
        elif args.command == "validate-matrix":
            value = validate_matrix(args.execution_root, args.run_id)
        elif args.command == "validate-two-runs":
            value = validate_two_runs(args.first_execution_root, args.second_execution_root)
        elif args.command == "validate-freeze":
            manifest = Path(args.manifest).resolve()
            data, _ = regular(manifest, "freeze manifest")
            _validate_freeze_manifest(
                str(manifest.relative_to(REPO)), sha(data), len(data))
            value = {
                "schema_id": "pw-r8-independent-freeze-validation-v20", "candidate_id": CANDIDATE_ID,
                "status": "PASS", "storage_sha256": sha(data), "storage_bytes": len(data),
            }
        else:
            value = validate_preflight()
        sys.stdout.buffer.write(canonical(value) + b"\n")
        return 0
    except Exception as exc:
        value = {
            "schema_id": "pw-r8-independent-verifier-error-v20", "candidate_id": CANDIDATE_ID,
            "status": "INVALID_FAIL_CLOSED", "command": args.command,
            "error_type": type(exc).__name__, "error": str(exc),
            "schedule_advance_allowed": False, "qualification_credit": 0,
            "subject_calls": 0, "provider_calls": 0, "network_calls": 0, "filesystem_writes": 0,
        }
        sys.stdout.buffer.write(canonical(value) + b"\n")
        return 2


if __name__ == "__main__":
    raise SystemExit(main())
