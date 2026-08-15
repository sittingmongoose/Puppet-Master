#!/usr/bin/env python3
"""Independent read-only full-material verifier for R8 candidate-14.

This module does not import the controller and exposes no subject-call path.\nIt independently parses and recomputes every authoritative evidence decision.
"""
from __future__ import annotations

import argparse
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

CANDIDATE_ID = "PW-R8-ITERATIVE-FIX-TWO-CLEAN-RUNS-20260815.CANDIDATE-14"
IDENTITY_FAMILY = "PW-R8-ITERATIVE-FIX-TWO-CLEAN-RUNS-20260815"
REPO = Path("/mnt/Cursor/PuppetMaster")
SUCCESSOR = REPO / "tests/agent_packet_restrictions/successor_20260813"
ROOT = SUCCESSOR / "model_retest_r8_candidate_v14"
V9_ROOT = SUCCESSOR / "model_retest_r8_candidate_v9"
V9_HARNESS = V9_ROOT / "r8_harness.py"
V9_DRIVER = V9_ROOT / "r8_subject_task_driver.py"
V12_PREFLIGHT = SUCCESSOR / "model_retest_r8_candidate_v12/deterministic_preflight_report.json"
V12_PROCESS_CONTRACT = SUCCESSOR / "model_retest_r8_candidate_v12/process_completion_contract.json"
V12_A02_RENDER = SUCCESSOR / "model_retest_r8_candidate_v12_run_01/slot-alpha/rendered/S10A_DECISION_A02.txt"
V12_A02_RECEIPT = SUCCESSOR / "model_retest_r8_candidate_v12_run_01/direct_appserver_receipts/slot-alpha_S10A_DECISION_A02.json"
GOAL_ADDENDUM = SUCCESSOR / "r8_goal_loop_buster_addendum_v1.json"
DIAGNOSIS = SUCCESSOR / "r8_clean_room_execution_controller_diagnosis_v1.json"
C13_AUDIT = SUCCESSOR / "model_retest_r8_candidate_v13/independent_preseal_audit.json"
C13_PROGRESS = SUCCESSOR / "r8_progress_assessment_candidate_v13_preseal_fail_v1.json"
CHECKPOINT_COMMIT = "847e6ffea55027e6f3985141b4ab37a90bc4f8ad"

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
    "goal_loop_buster_addendum", "c13_failed_audit", "c13_progress_assessment",
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
        "schema_id": "pw-r8-qualification-contract-v14",
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
        "schema_id": "pw-r8-candidate-freeze-manifest-v14", "candidate_id": CANDIDATE_ID,
        "status": "FROZEN", "parent_candidate_id": "PW-R8-ITERATIVE-FIX-TWO-CLEAN-RUNS-20260815.CANDIDATE-13",
        "checkpoint_commit": CHECKPOINT_COMMIT,
        "goal_loop_buster_addendum": _lineage_binding(
            "tests/agent_packet_restrictions/successor_20260813/r8_goal_loop_buster_addendum_v1.json",
            "d3f901e724d785ba3d053a961a8559b6f5b5add7e7b660a9fbb503586ad822d0", 4468),
        "c13_failed_audit": _lineage_binding(
            "tests/agent_packet_restrictions/successor_20260813/model_retest_r8_candidate_v13/independent_preseal_audit.json",
            "8c05e9baf27e31f007ea1fb4cf80f6d1f02eede3bb3e1f2dbcb83b0c14566299", 18343),
        "c13_progress_assessment": _lineage_binding(
            "tests/agent_packet_restrictions/successor_20260813/r8_progress_assessment_candidate_v13_preseal_fail_v1.json",
            "b8623cbadc6b40c74c46e315011f779ee717355e6386ac475339495f1853dfb7", 4863),
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
    if Path(manifest_rel).is_absolute() or manifest_rel != "tests/agent_packet_restrictions/successor_20260813/r8_candidate_v14_freeze_manifest.json":
        raise Invalid("freeze manifest path is not the single predeclared v14 authority")
    storage, freeze, _ = exact_file(REPO / manifest_rel, "candidate-v14 freeze manifest")
    if (sha(storage), len(storage)) != (expected_sha, expected_bytes):
        raise Invalid("freeze manifest storage binding mismatch")
    _validate_freeze_static_authority(freeze)
    exact = {
        "schema_id": "pw-r8-candidate-freeze-manifest-v14", "candidate_id": CANDIDATE_ID,
        "status": "FROZEN", "parent_candidate_id": "PW-R8-ITERATIVE-FIX-TWO-CLEAN-RUNS-20260815.CANDIDATE-13",
        "checkpoint_commit": CHECKPOINT_COMMIT,
        "goal_loop_buster_addendum": _lineage_binding(
            "tests/agent_packet_restrictions/successor_20260813/r8_goal_loop_buster_addendum_v1.json",
            "d3f901e724d785ba3d053a961a8559b6f5b5add7e7b660a9fbb503586ad822d0", 4468),
        "c13_failed_audit": _lineage_binding(
            "tests/agent_packet_restrictions/successor_20260813/model_retest_r8_candidate_v13/independent_preseal_audit.json",
            "8c05e9baf27e31f007ea1fb4cf80f6d1f02eede3bb3e1f2dbcb83b0c14566299", 18343),
        "c13_progress_assessment": _lineage_binding(
            "tests/agent_packet_restrictions/successor_20260813/r8_progress_assessment_candidate_v13_preseal_fail_v1.json",
            "b8623cbadc6b40c74c46e315011f779ee717355e6386ac475339495f1853dfb7", 4863),
        "qualification_contract": _qualification_contract(),
    }
    for key, value in exact.items():
        if freeze.get(key) != value:
            raise Invalid(f"freeze manifest exact authority mismatch: {key}")
    audit_binding = freeze.get("independent_preseal_audit")
    if not isinstance(audit_binding, dict) or tuple(audit_binding) != ("path", "storage_sha256", "storage_bytes", "verdict", "independent_decision", "loop_broken"):
        raise Invalid("freeze audit binding shape invalid")
    audit_rel = f"tests/agent_packet_restrictions/successor_20260813/model_retest_r8_candidate_v14/independent_preseal_audit.json"
    if audit_binding.get("path") != audit_rel or audit_binding.get("verdict") != "PRESEAL_PASS" or audit_binding.get("independent_decision") != "LOOP_BROKEN" or audit_binding.get("loop_broken") is not True:
        raise Invalid("freeze requires PRESEAL_PASS plus LOOP_BROKEN")
    audit_storage, audit, _ = exact_file(REPO / audit_rel, "independent PRESEAL_PASS audit")
    if (sha(audit_storage), len(audit_storage)) != (audit_binding.get("storage_sha256"), audit_binding.get("storage_bytes")):
        raise Invalid("freeze audit hash/bytes mismatch")
    if tuple(audit) != AUDIT_KEYS or audit.get("schema_id") != "pw-r8-independent-preseal-audit-v14" or audit.get("candidate_id") != CANDIDATE_ID:
        raise Invalid("independent audit outside exact v14 schema")
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
        "failed_c13_audit": freeze["c13_failed_audit"],
        "c13_progress_assessment": freeze["c13_progress_assessment"],
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
    if tuple(run) != RUN_KEYS or run.get("schema_id") != "pw-r8-run-contract-v14":
        raise Invalid("run contract keys/order outside exact v14 closed world")
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

def _run_controls(root: Path, run_id: str) -> dict[str, Any]:
    _storage, dispatch, _ = exact_file(root / "dispatch_schedule.json", "dispatch schedule lookup")
    entries = dispatch.get("entries")
    if not isinstance(entries, list) or not entries:
        raise Invalid("dispatch schedule entries absent")
    first = entries[0]
    return _load_controls(root, run_id, first["slot"], first["cell"], first["dispatch_nonce"])


def _run_identities(root: Path, controls: dict[str, Any]) -> dict[str, set[str]]:
    identities = {"thread_ids": set(), "turn_ids": set(), "rollout_paths": set()}
    for slot in SLOTS:
        for cell in controls["cells"]:
            path = _paths(root, slot, cell)["receipt"][1]
            if not path.exists():
                continue
            _storage, receipt, _ = exact_file(path, f"receipt identity {slot}/{cell}")
            values = {
                "thread_ids": receipt.get("thread_id"), "turn_ids": receipt.get("turn_id"),
                "rollout_paths": receipt.get("rollout_path"),
            }
            for key, value in values.items():
                if not isinstance(value, str) or not value or value in identities[key]:
                    raise Invalid(f"receipt {key} missing or replayed within run")
                identities[key].add(value)
    return identities


def validate_cell(run_id: str, root_value: str, slot: str, cell: str) -> dict[str, Any]:
    root = execution_root(root_value)
    controls = _run_controls(root, run_id)
    if slot not in SLOTS or cell not in controls["cells"]:
        raise Invalid("cell outside exact schedule")
    if f"{run_id}:{slot}:{cell}" not in controls["run"]["launch_authorized_task_ids"]:
        raise Invalid("cell was not authorized by exact run contract")
    index = controls["cells"].index(cell)
    nonce_map = {(row["slot"], row["cell"]): row["dispatch_nonce"] for row in controls["entries"]}
    for prior in controls["cells"][:index]:
        _full_chain_reopen(root, run_id, slot, prior, nonce_map[(slot, prior)], controls, require_pass=True)
    _run_identities(root, controls)
    row = _full_chain_reopen(root, run_id, slot, cell, nonce_map[(slot, cell)], controls, require_pass=False)
    return {
        "schema_id": "pw-r8-independent-cell-validation-v14", "candidate_id": CANDIDATE_ID,
        "status": "PASS_FULL_CHAIN_INDEPENDENTLY_RECOMPUTED", "run_id": run_id,
        "slot": slot, "cell": cell, "score_verdict": row["score_verdict"],
        "completion_storage_sha256": sha(row["completion_storage"]),
        "completion_storage_bytes": len(row["completion_storage"]),
        "prior_pass_count": index, "schedule_advance_allowed": row["score_verdict"] == "PASS",
        "subject_calls": 0, "provider_calls": 0, "network_calls": 0, "filesystem_writes": 0,
    }


def validate_artifact(run_id: str, root_value: str, slot: str, stage: str) -> dict[str, Any]:
    root = execution_root(root_value)
    _run_controls(root, run_id)
    if slot not in SLOTS or stage not in STAGES:
        raise Invalid("artifact outside exact route/stage set")
    storage, value, _ = exact_file(root / slot / "artifacts" / f"{stage}.json", f"artifact {slot}/{stage}")
    expected = semantic_module().reduce(root, slot, stage)
    if value != expected or storage != canonical(expected) + b"\n":
        raise Invalid("artifact differs from independent reducer recomputation")
    return {
        "schema_id": "pw-r8-independent-artifact-validation-v14", "candidate_id": CANDIDATE_ID,
        "status": "PASS", "run_id": run_id, "slot": slot, "stage": stage,
        "storage_sha256": sha(storage), "storage_bytes": len(storage),
    }


def validate_path(run_id: str, root_value: str, slot: str) -> dict[str, Any]:
    root = execution_root(root_value)
    controls = _run_controls(root, run_id)
    if slot not in SLOTS:
        raise Invalid("slot outside exact routes")
    if controls["run"]["run_kind"] != "QUALIFICATION_MATRIX":
        raise Invalid("complete path validation requires QUALIFICATION_MATRIX")
    _run_identities(root, controls)
    nonce_map = {(row["slot"], row["cell"]): row["dispatch_nonce"] for row in controls["entries"]}
    cells = [
        _full_chain_reopen(root, run_id, slot, cell, nonce_map[(slot, cell)], controls, require_pass=True)
        for cell in controls["cells"]
    ]
    artifacts = [validate_artifact(run_id, str(root), slot, stage) for stage in STAGES]
    inventory = canonical({
        "cells": [{"cell": cell, "completion_sha256": sha(row["completion_storage"]),
                   "completion_bytes": len(row["completion_storage"])}
                  for cell, row in zip(controls["cells"], cells, strict=True)],
        "artifacts": artifacts,
    })
    return {
        "schema_id": "pw-r8-independent-path-validation-v14", "candidate_id": CANDIDATE_ID,
        "status": "PASS_COMPLETE_CLEAN_PATH", "run_id": run_id, "slot": slot,
        "passed_cells": 97, "deterministic_artifacts": 18,
        "inventory_sha256": sha(inventory), "inventory_bytes": len(inventory),
    }


def validate_matrix(run_id: str, root_value: str) -> dict[str, Any]:
    root = execution_root(root_value)
    controls = _run_controls(root, run_id)
    if controls["run"]["run_kind"] != "QUALIFICATION_MATRIX":
        raise Invalid("qualification credit requires exact QUALIFICATION_MATRIX")
    rows = [validate_path(run_id, str(root), slot) for slot in SLOTS]
    inventory = canonical(rows)
    return {
        "schema_id": "pw-r8-independent-matrix-validation-v14", "candidate_id": CANDIDATE_ID,
        "status": "PASS_COMPLETE_CLEAN_MATRIX", "run_id": run_id, "routes": 3,
        "passed_cells": 291, "deterministic_artifacts": 54,
        "inventory_sha256": sha(inventory), "inventory_bytes": len(inventory),
        "qualification_credit": 1,
    }


def validate_two_runs(first_value: str, second_value: str) -> dict[str, Any]:
    first_root, second_root = execution_root(first_value), execution_root(second_value)
    _first_storage, first_run, _ = exact_file(first_root / "run_contract.json", "first run contract")
    _second_storage, second_run, _ = exact_file(second_root / "run_contract.json", "second run contract")
    first_id, second_id = first_run.get("run_id"), second_run.get("run_id")
    if not isinstance(first_id, str) or not isinstance(second_id, str) or first_id == second_id:
        raise Invalid("two-run identities absent or reused")
    first_controls, second_controls = _run_controls(first_root, first_id), _run_controls(second_root, second_id)
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
    first_ids, second_ids = _run_identities(first_root, first_controls), _run_identities(second_root, second_controls)
    if any(first_ids[key] & second_ids[key] for key in first_ids):
        raise Invalid("thread, turn, or rollout identity reused across qualification runs")
    first = validate_matrix(first_id, str(first_root))
    second = validate_matrix(second_id, str(second_root))
    inventory = canonical([first, second])
    return {
        "schema_id": "pw-r8-independent-two-run-validation-v14", "candidate_id": CANDIDATE_ID,
        "status": "PASS_TWO_CONSECUTIVE_CLEAN_MATRICES", "first_run_id": first_id,
        "second_run_id": second_id, "matrices": 2, "routes": 6, "passed_cells": 582,
        "inventory_sha256": sha(inventory), "inventory_bytes": len(inventory),
        "qualification_streak": 2,
    }


def validate_preflight() -> dict[str, Any]:
    storage, report, _ = exact_file(ROOT / "deterministic_preflight_report.json", "stored preflight")
    if (
        report.get("schema_id") != "pw-r8-deterministic-preflight-report-v14"
        or report.get("candidate_id") != CANDIDATE_ID
        or report.get("status") != "PASS"
        or report.get("typed_result") != {"type": "PASS", "fail_closed": True}
        or any(report.get(key) != 0 for key in (
            "subject_calls", "provider_calls", "network_calls", "filesystem_writes", "live_plans_reads"))
    ):
        raise Invalid("stored preflight typed zero-call identity mismatch")
    closure = report.get("runtime_dependency_closure")
    rows = closure.get("rows") if isinstance(closure, dict) else None
    if not isinstance(rows, list) or rows != sorted(rows, key=lambda row: row["path"]):
        raise Invalid("stored preflight dependency closure invalid")
    for row in rows:
        data, _ = regular(SUCCESSOR / row["path"], f"preflight dependency {row['path']}")
        if (sha(data), len(data)) != (row["sha256"], row["bytes"]):
            raise Invalid(f"preflight dependency drift: {row['path']}")
    semantics = report.get("semantic_identity", {})
    if semantics.get("cells_compared") != 97 or any(
        semantics.get(key) != "97/97" for key in ("render_identity", "oracle_identity", "schedule_identity")
    ):
        raise Invalid("stored preflight semantic identity mismatch")
    suite = report.get("zero_call_suite", {})
    expected = [f"ZC-REC-{index:03d}" for index in range(2, 11)]
    if (
        suite.get("status") != "PASS"
        or [row.get("case_id") for row in suite.get("recovery_cases", [])] != expected
        or suite.get("predecessor", {}).get("case_id") != "ZC-PRED-001"
        or suite.get("successor", {}).get("case_id") != "ZC-SUCC-001"
        or suite.get("live_case", {}).get("case_id") != "ZC-LIVE-001"
        or suite.get("live_case", {}).get("full_chain_reopen_status") != "PASS_FULL_CHAIN_REOPENED_SAFE"
    ):
        raise Invalid("stored preflight exact named zero-call suite mismatch")
    harness = _module(V9_HARNESS, "pw_r8_v14_independent_semantic_preflight")
    executed = harness.preflight()
    if executed.get("exact_subject_cell_schedule") != list(schedule()):
        raise Invalid("independent semantic schedule execution mismatch")
    return {
        "schema_id": "pw-r8-independent-preflight-validation-v14", "candidate_id": CANDIDATE_ID,
        "status": "PASS", "storage_sha256": sha(storage), "storage_bytes": len(storage),
        "dependencies_reopened": len(rows), "semantic_cells": 97, "named_zero_call_cases": 12,
        "subject_calls": 0, "provider_calls": 0, "network_calls": 0, "filesystem_writes": 0,
    }


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
            value = validate_cell(args.run_id, args.execution_root, args.slot, args.cell)
        elif args.command == "validate-artifact":
            value = validate_artifact(args.run_id, args.execution_root, args.slot, args.stage)
        elif args.command == "validate-path":
            value = validate_path(args.run_id, args.execution_root, args.slot)
        elif args.command == "validate-matrix":
            value = validate_matrix(args.run_id, args.execution_root)
        elif args.command == "validate-two-runs":
            value = validate_two_runs(args.first_execution_root, args.second_execution_root)
        elif args.command == "validate-freeze":
            manifest = Path(args.manifest).resolve()
            data, _ = regular(manifest, "freeze manifest")
            _validate_freeze_manifest(
                str(manifest.relative_to(REPO)), sha(data), len(data))
            value = {
                "schema_id": "pw-r8-independent-freeze-validation-v14", "candidate_id": CANDIDATE_ID,
                "status": "PASS", "storage_sha256": sha(data), "storage_bytes": len(data),
            }
        else:
            value = validate_preflight()
        sys.stdout.buffer.write(canonical(value) + b"\n")
        return 0
    except Exception as exc:
        value = {
            "schema_id": "pw-r8-independent-verifier-error-v14", "candidate_id": CANDIDATE_ID,
            "status": "INVALID_FAIL_CLOSED", "command": args.command,
            "error_type": type(exc).__name__, "error": str(exc),
            "schedule_advance_allowed": False, "qualification_credit": 0,
            "subject_calls": 0, "provider_calls": 0, "network_calls": 0, "filesystem_writes": 0,
        }
        sys.stdout.buffer.write(canonical(value) + b"\n")
        return 2


if __name__ == "__main__":
    raise SystemExit(main())
