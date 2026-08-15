#!/usr/bin/env python3
"""Independent authority and material verifier for R8 candidate-16.

Candidate-16 changes only freeze/run authority construction.  All semantic,
transaction, evidence-chain, and causal-prefix decisions remain delegated to
the preserved candidate-15 independent verifier, never to the controller.
"""
from __future__ import annotations

import argparse
import hashlib
import importlib.util
import json
import os
from pathlib import Path
import re
import stat
import subprocess
import sys
from types import ModuleType
from typing import Any, Callable

sys.dont_write_bytecode = True

CANDIDATE_ID = "PW-R8-ITERATIVE-FIX-TWO-CLEAN-RUNS-20260815.CANDIDATE-16"
PARENT_CANDIDATE_ID = "PW-R8-ITERATIVE-FIX-TWO-CLEAN-RUNS-20260815.CANDIDATE-15"
IDENTITY_FAMILY = "PW-R8-ITERATIVE-FIX-TWO-CLEAN-RUNS-20260815"
REPO = Path("/mnt/Cursor/PuppetMaster")
SUCCESSOR = REPO / "tests/agent_packet_restrictions/successor_20260813"
ROOT = SUCCESSOR / "model_retest_r8_candidate_v16"
V15_ROOT = SUCCESSOR / "model_retest_r8_candidate_v15"
V15_VERIFIER = V15_ROOT / "r8_run_verifier.py"
V15_PREFLIGHT = V15_ROOT / "deterministic_preflight_report.json"
GOAL_ADDENDUM = SUCCESSOR / "r8_goal_loop_buster_addendum_v1.json"
V15_FREEZE_FAILURE = SUCCESSOR / "r8_candidate_v15_freeze_constructibility_failure_v1.json"
V15_FREEZE_PROGRESS = SUCCESSOR / "r8_progress_assessment_candidate_v15_freeze_fail_v2.json"
FREEZE_RELATIVE_PATH = "tests/agent_packet_restrictions/successor_20260813/r8_candidate_v16_freeze_manifest.json"
AUDIT_RELATIVE_PATH = "tests/agent_packet_restrictions/successor_20260813/model_retest_r8_candidate_v16/independent_preseal_audit.json"
PROGRESS_RELATIVE_PATH = "tests/agent_packet_restrictions/successor_20260813/r8_progress_assessment_candidate_v16_pre_freeze_v1.json"

SLOTS = ("slot-alpha", "slot-bravo", "slot-charlie")
ROUTES = {
    "slot-alpha": ("gpt-5.4-mini", "xhigh"),
    "slot-bravo": ("gpt-5.4-mini", "medium"),
    "slot-charlie": ("gpt-5.6-luna", "medium"),
}
RUN_KINDS = ("ZERO_CREDIT_THREE_ROUTE_CANARY", "QUALIFICATION_MATRIX")
RUN_ID_RE = re.compile(r"^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$")
HEX40_RE = re.compile(r"^[0-9a-f]{40}$")
HEX64_RE = re.compile(r"^[0-9a-f]{64}$")

PRE_AUDIT_FILES = (
    "README.md", "architecture_contract.json", "controller_contract.json",
    "deterministic_preflight_report.json", "process_completion_contract.json",
    "r8_clean_room_controller.py", "r8_run_verifier.py",
)
POST_AUDIT_FILES = PRE_AUDIT_FILES + ("independent_preseal_audit.json",)

FREEZE_KEYS = (
    "schema_id", "candidate_id", "status", "parent_candidate_id", "checkpoint_commit",
    "goal_loop_buster_addendum", "v15_freeze_constructibility_failure",
    "v15_freeze_fail_progress", "independent_preseal_audit", "pre_freeze_progress",
    "audited_candidate_bundle", "runtime_dependency_closure",
    "deterministic_preflight", "qualification_contract",
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
AUDIT_KEYS = (
    "schema_id", "candidate_id", "status", "verdict", "independent_decision",
    "loop_broken", "freeze_authorized", "launch_authorized", "subject_calls",
    "provider_calls", "network_calls", "candidate_byte_identity", "source_bindings",
    "blocking_findings", "nonclaims",
)
PROGRESS_KEYS = (
    "schema_id", "identity_family", "goal_loop_buster_addendum", "candidate_id",
    "parent_candidate_id", "candidate_terminal", "normalized_failures",
    "prior_reproducer_and_new_counterfactual_status",
    "valid_first_attempt_cells_completed_before_invalidation", "longest_valid_causal_prefix",
    "previously_closed_failure_classes", "architectural_surface_delta", "decision",
    "decision_evidence", "next_action", "calls", "qualification_credit", "nonclaims",
)
AUDIT_SOURCE_KEYS = (
    "goal_loop_buster_addendum", "v15_freeze_constructibility_failure",
    "v15_freeze_fail_progress", "runtime_dependency_closure",
    "deterministic_preflight", "qualification_contract",
)
RUN_INVENTORY_KEYS = (
    "schema_id", "candidate_id", "run_id", "task_count",
    "controller_invalid_extras", "tasks",
)
TASK_KEYS = (
    "task_id", "slot", "cell", "dispatch_nonce", "transaction_claim_relative_path",
    "rendered_relative_path", "dispatch_attempt_relative_path", "receipt_relative_path",
    "capture_relative_path", "score_relative_path", "completion_relative_path",
)


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
    except Exception as exc:
        raise Invalid(f"{label}: invalid strict JSON: {exc}") from exc
    if not isinstance(value, dict) or canonical(value) != raw:
        raise Invalid(f"{label}: not one canonical JSON object")
    return value


def regular(path: Path, label: str) -> bytes:
    try:
        info = path.lstat()
    except FileNotFoundError as exc:
        raise Invalid(f"{label}: missing") from exc
    if stat.S_ISLNK(info.st_mode) or not stat.S_ISREG(info.st_mode):
        raise Invalid(f"{label}: nonregular or symlink")
    data = path.read_bytes()
    after = path.lstat()
    if (info.st_dev, info.st_ino, info.st_size, info.st_mtime_ns) != (after.st_dev, after.st_ino, after.st_size, after.st_mtime_ns):
        raise Invalid(f"{label}: changed while reopened")
    return data


def exact_file(path: Path, label: str) -> tuple[bytes, dict[str, Any]]:
    data = regular(path, label)
    return data, strict_object(data, label)


def _module(path: Path, name: str) -> ModuleType:
    spec = importlib.util.spec_from_file_location(name, path)
    if spec is None or spec.loader is None:
        raise Invalid(f"cannot load isolated module {path}")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


_BASE: ModuleType | None = None


def base_verifier() -> ModuleType:
    global _BASE
    if _BASE is None:
        _BASE = _module(V15_VERIFIER, "pw_r8_v15_material_verifier_for_v16")
        _BASE.CANDIDATE_ID = CANDIDATE_ID
        _BASE.ROOT = ROOT
        _BASE._load_controls = _load_controls
    return _BASE


def schedule() -> tuple[str, ...]:
    cells = tuple(base_verifier().schedule())
    if len(cells) != 97 or len(set(cells)) != 97:
        raise Invalid("frozen semantic schedule is not exact 97-cell closed world")
    return cells


def _binding(path: str, data: bytes) -> dict[str, Any]:
    return {"path": path, "storage_sha256": sha(data), "storage_bytes": len(data)}


def _fixed_binding(path: str, digest: str, size: int) -> dict[str, Any]:
    return {"path": path, "storage_sha256": digest, "storage_bytes": size}


def _goal_binding() -> dict[str, Any]:
    return _fixed_binding(
        "tests/agent_packet_restrictions/successor_20260813/r8_goal_loop_buster_addendum_v1.json",
        "d3f901e724d785ba3d053a961a8559b6f5b5add7e7b660a9fbb503586ad822d0", 4468)


def _v15_failure_binding() -> dict[str, Any]:
    return _fixed_binding(
        "tests/agent_packet_restrictions/successor_20260813/r8_candidate_v15_freeze_constructibility_failure_v1.json",
        "e502860990ab89e7730d854df7e9912a079117ad73c74542962e52c02705402c", 3248)


def _v15_progress_binding() -> dict[str, Any]:
    return _fixed_binding(
        "tests/agent_packet_restrictions/successor_20260813/r8_progress_assessment_candidate_v15_freeze_fail_v2.json",
        "6d9741b8a77b33b4e809d32900979fbb15f9a23a5782a4fafa30b1956057dd03", 3942)


def qualification_contract() -> dict[str, Any]:
    return {
        "schema_id": "pw-r8-qualification-contract-v16", "candidate_id": CANDIDATE_ID,
        "credit_run_kind": "QUALIFICATION_MATRIX", "zero_credit_run_kind": "ZERO_CREDIT_THREE_ROUTE_CANARY",
        "route_count": 3, "subject_cells_per_route": 97, "tasks_per_matrix": 291,
        "qualification_runs": 2, "qualification_credit_per_complete_matrix": 1,
        "run_contract_qualification_credit": 0,
        "routes": {slot: {"requested_model": model, "requested_thinking": effort}
                   for slot, (model, effort) in ROUTES.items()},
        "retry_count": 0, "best_of": False, "replacement_result": False,
        "controller_invalid_extras": 0, "schedule_identity": "FROZEN_97_CELL_ORDER",
        "semantic_identity": "97/97_RENDER_ORACLE_SCORER_REDUCER",
    }


def runtime_dependency_binding() -> dict[str, Any]:
    path = "tests/agent_packet_restrictions/successor_20260813/model_retest_r8_candidate_v15/architecture_contract.json"
    storage, value = exact_file(REPO / path, "preserved v15 architecture closure")
    rows = value.get("runtime_dependency_closure")
    if not isinstance(rows, list) or len(rows) != 64:
        raise Invalid("preserved semantic dependency closure is not exact 64 rows")
    row_bytes = canonical(rows)
    return {
        "source_path": path, "source_storage_sha256": sha(storage),
        "source_storage_bytes": len(storage), "exact_sorted_unique_files": 64,
        "canonical_rows_sha256": sha(row_bytes), "canonical_rows_bytes": len(row_bytes),
    }


def deterministic_preflight_binding(read_file: Callable[[str], bytes] | None = None) -> dict[str, Any]:
    path = "tests/agent_packet_restrictions/successor_20260813/model_retest_r8_candidate_v16/deterministic_preflight_report.json"
    data = read_file(path) if read_file else regular(REPO / path, "candidate-v16 deterministic preflight")
    value = strict_object(data, "candidate-v16 deterministic preflight")
    if value.get("schema_id") != "pw-r8-deterministic-preflight-report-v16" or value.get("candidate_id") != CANDIDATE_ID or value.get("typed_result") != {"type": "PASS", "fail_closed": True}:
        raise Invalid("candidate-v16 deterministic preflight is not typed PASS")
    return {"path": path, "storage_sha256": sha(data), "storage_bytes": len(data), "typed_result": "PASS"}


def _git_head() -> str:
    result = subprocess.run(
        ["git", "rev-parse", "HEAD"], cwd=REPO, stdin=subprocess.DEVNULL,
        stdout=subprocess.PIPE, stderr=subprocess.PIPE, check=False,
    )
    head = result.stdout.decode("ascii", "strict").strip()
    if result.returncode != 0 or not HEX40_RE.fullmatch(head):
        raise Invalid("cannot resolve exact local Git HEAD")
    return head


def _git_blob(commit: str, path: str) -> bytes:
    if not HEX40_RE.fullmatch(commit) or path.startswith("/") or ".." in Path(path).parts:
        raise Invalid("unsafe Git object lookup")
    result = subprocess.run(
        ["git", "show", f"{commit}:{path}"], cwd=REPO, stdin=subprocess.DEVNULL,
        stdout=subprocess.PIPE, stderr=subprocess.PIPE, check=False,
    )
    if result.returncode != 0:
        raise Invalid(f"required file absent from checkpoint HEAD: {path}")
    return result.stdout


def _read_repo_file(path: str) -> bytes:
    if path.startswith("/") or ".." in Path(path).parts:
        raise Invalid("unsafe repository path")
    return regular(REPO / path, f"repository file {path}")


def _exact_bound_bytes(binding: Any, expected_path: str, commit: str,
                       read_file: Callable[[str], bytes], git_blob: Callable[[str, str], bytes]) -> bytes:
    if not isinstance(binding, dict) or tuple(binding) != ("path", "storage_sha256", "storage_bytes") or binding.get("path") != expected_path:
        raise Invalid(f"binding path/schema mismatch: {expected_path}")
    local = read_file(expected_path)
    committed = git_blob(commit, expected_path)
    if local != committed:
        raise Invalid(f"required file is uncommitted or differs from checkpoint HEAD: {expected_path}")
    if (sha(local), len(local)) != (binding.get("storage_sha256"), binding.get("storage_bytes")):
        raise Invalid(f"binding hash/bytes mismatch: {expected_path}")
    return local


def _validate_audit(audit: dict[str, Any], audit_storage: bytes, expected_sources: dict[str, Any],
                    commit: str, read_file: Callable[[str], bytes],
                    git_blob: Callable[[str, str], bytes]) -> list[dict[str, Any]]:
    if tuple(audit) != AUDIT_KEYS or audit.get("schema_id") != "pw-r8-independent-preseal-audit-v16" or audit.get("candidate_id") != CANDIDATE_ID:
        raise Invalid("independent audit strict schema/identity mismatch")
    exact = {
        "status": "COMPLETE", "verdict": "PRESEAL_PASS", "independent_decision": "LOOP_BROKEN",
        "loop_broken": True, "freeze_authorized": True, "launch_authorized": False,
        "subject_calls": 0, "provider_calls": 0, "network_calls": 0, "blocking_findings": [],
    }
    if any(audit.get(k) != v for k, v in exact.items()) or not isinstance(audit.get("nonclaims"), list):
        raise Invalid("independent audit is not exact zero-call PRESEAL_PASS/LOOP_BROKEN")
    identities = audit.get("candidate_byte_identity")
    rows = identities.get("files") if isinstance(identities, dict) else None
    if not isinstance(identities, dict) or tuple(identities) != ("status", "files") or identities.get("status") != "PASS" or not isinstance(rows, list) or len(rows) != 7:
        raise Invalid("audit candidate-byte identity schema mismatch")
    expected_paths = [f"tests/agent_packet_restrictions/successor_20260813/model_retest_r8_candidate_v16/{name}" for name in PRE_AUDIT_FILES]
    if [row.get("path") for row in rows if isinstance(row, dict)] != expected_paths:
        raise Invalid("audit candidate rows missing/extra/reordered")
    for row, path in zip(rows, expected_paths, strict=True):
        _exact_bound_bytes(row, path, commit, read_file, git_blob)
    sources = audit.get("source_bindings")
    if not isinstance(sources, dict) or tuple(sources) != AUDIT_SOURCE_KEYS or sources != expected_sources:
        raise Invalid("audit source bindings missing/extra/reordered/stale")
    if canonical(audit) + b"\n" != audit_storage:
        raise Invalid("audit storage is not canonical")
    return rows


def _validate_progress(progress: dict[str, Any], progress_storage: bytes,
                       audit_binding: dict[str, Any]) -> None:
    if tuple(progress) != PROGRESS_KEYS or progress.get("schema_id") != "pw-r8-progress-assessment-v1" or progress.get("identity_family") != IDENTITY_FAMILY or progress.get("candidate_id") != CANDIDATE_ID or progress.get("parent_candidate_id") != PARENT_CANDIDATE_ID:
        raise Invalid("pre-freeze progress strict schema/identity mismatch")
    terminal = progress.get("candidate_terminal")
    expected_terminal = {
        "type": "PRESEAL_PASS", "independent_decision": "LOOP_BROKEN",
        "audit_path": AUDIT_RELATIVE_PATH,
        "audit_storage_sha256": audit_binding["storage_sha256"],
        "audit_storage_bytes": audit_binding["storage_bytes"],
        "freeze_authorized": True, "launch_authorized": False,
        "authorized_next_execution": "EXACT_THREE_ROUTE_ZERO_CREDIT_CANARY_ONLY",
    }
    if terminal != expected_terminal or tuple(terminal) != tuple(expected_terminal):
        raise Invalid("pre-freeze progress terminal does not bind exact passing audit")
    if progress.get("goal_loop_buster_addendum") != _goal_binding() or progress.get("decision") != "LOOP_BROKEN" or progress.get("calls") != {"subject": 0, "provider": 0, "network": 0} or progress.get("qualification_credit") != 0:
        raise Invalid("pre-freeze progress is not exact zero-call LOOP_BROKEN")
    if progress.get("normalized_failures") != [] or not isinstance(progress.get("nonclaims"), list):
        raise Invalid("pre-freeze progress contains failure or malformed nonclaims")
    if canonical(progress) + b"\n" != progress_storage:
        raise Invalid("pre-freeze progress storage is not canonical")


def _validate_freeze_object(
    freeze: dict[str, Any], *, expected_manifest_path: str, head: str,
    read_file: Callable[[str], bytes], git_blob: Callable[[str, str], bytes],
    closure_binding: dict[str, Any], preflight_binding: dict[str, Any],
) -> dict[str, Any]:
    if expected_manifest_path != FREEZE_RELATIVE_PATH:
        raise Invalid("freeze manifest path is not the single predeclared v16 authority")
    if tuple(freeze) != FREEZE_KEYS:
        raise Invalid("freeze manifest keys/order outside exact closed world")
    if freeze.get("schema_id") != "pw-r8-candidate-freeze-manifest-v16" or freeze.get("candidate_id") != CANDIDATE_ID or freeze.get("status") != "FROZEN" or freeze.get("parent_candidate_id") != PARENT_CANDIDATE_ID:
        raise Invalid("freeze identity/status mismatch")
    commit = freeze.get("checkpoint_commit")
    if not isinstance(commit, str) or not HEX40_RE.fullmatch(commit) or commit != head:
        raise Invalid("freeze checkpoint is stale or differs from current local HEAD")
    fixed = {
        "goal_loop_buster_addendum": _goal_binding(),
        "v15_freeze_constructibility_failure": _v15_failure_binding(),
        "v15_freeze_fail_progress": _v15_progress_binding(),
        "runtime_dependency_closure": closure_binding,
        "deterministic_preflight": preflight_binding,
        "qualification_contract": qualification_contract(),
    }
    if any(freeze.get(k) != v for k, v in fixed.items()):
        raise Invalid("freeze fixed authority missing/extra/stale")
    for key, binding in (("goal", _goal_binding()), ("v15 failure", _v15_failure_binding()), ("v15 progress", _v15_progress_binding())):
        _exact_bound_bytes(binding, binding["path"], commit, read_file, git_blob)
    closure_path = closure_binding["source_path"]
    closure_local = read_file(closure_path)
    if closure_local != git_blob(commit, closure_path) or (sha(closure_local), len(closure_local)) != (
        closure_binding["source_storage_sha256"], closure_binding["source_storage_bytes"],
    ):
        raise Invalid("dependency-closure source differs from exact checkpoint HEAD")

    audit_ref = freeze.get("independent_preseal_audit")
    if not isinstance(audit_ref, dict) or tuple(audit_ref) != ("path", "storage_sha256", "storage_bytes", "verdict", "independent_decision", "loop_broken") or audit_ref.get("path") != AUDIT_RELATIVE_PATH or audit_ref.get("verdict") != "PRESEAL_PASS" or audit_ref.get("independent_decision") != "LOOP_BROKEN" or audit_ref.get("loop_broken") is not True:
        raise Invalid("freeze audit authority schema/path/verdict mismatch")
    audit_binding = {k: audit_ref[k] for k in ("path", "storage_sha256", "storage_bytes")}
    audit_storage = _exact_bound_bytes(audit_binding, AUDIT_RELATIVE_PATH, commit, read_file, git_blob)
    audit = strict_object(audit_storage, "candidate-v16 independent audit")

    progress_ref = freeze.get("pre_freeze_progress")
    if not isinstance(progress_ref, dict) or tuple(progress_ref) != ("path", "storage_sha256", "storage_bytes", "decision") or progress_ref.get("path") != PROGRESS_RELATIVE_PATH or progress_ref.get("decision") != "LOOP_BROKEN":
        raise Invalid("freeze progress authority schema/path/decision mismatch")
    progress_binding = {k: progress_ref[k] for k in ("path", "storage_sha256", "storage_bytes")}
    progress_storage = _exact_bound_bytes(progress_binding, PROGRESS_RELATIVE_PATH, commit, read_file, git_blob)
    progress = strict_object(progress_storage, "candidate-v16 pre-freeze progress")

    expected_sources = {k: fixed[k] for k in AUDIT_SOURCE_KEYS}
    audit_rows = _validate_audit(audit, audit_storage, expected_sources, commit, read_file, git_blob)
    _validate_progress(progress, progress_storage, audit_binding)

    bundle = freeze.get("audited_candidate_bundle")
    rows = bundle.get("files") if isinstance(bundle, dict) else None
    if not isinstance(bundle, dict) or tuple(bundle) != ("schema_id", "candidate_id", "file_count", "files") or bundle.get("schema_id") != "pw-r8-post-audit-candidate-bundle-v16" or bundle.get("candidate_id") != CANDIDATE_ID or bundle.get("file_count") != 8 or not isinstance(rows, list):
        raise Invalid("freeze audited bundle strict schema/count mismatch")
    expected_paths = [f"tests/agent_packet_restrictions/successor_20260813/model_retest_r8_candidate_v16/{name}" for name in POST_AUDIT_FILES]
    if [row.get("path") for row in rows if isinstance(row, dict)] != expected_paths:
        raise Invalid("freeze audited bundle missing/extra/reordered")
    for row, path in zip(rows, expected_paths, strict=True):
        _exact_bound_bytes(row, path, commit, read_file, git_blob)
    if rows[:-1] != audit_rows or rows[-1] != audit_binding:
        raise Invalid("freeze bundle differs from exact audit custody chain")
    return {
        "schema_id": "pw-r8-freeze-validation-v16", "candidate_id": CANDIDATE_ID,
        "status": "PASS", "checkpoint_commit": commit, "bundle_files": 8,
        "dependency_files": 64, "audit_verdict": "PRESEAL_PASS",
        "progress_decision": "LOOP_BROKEN", "subject_calls": 0,
        "provider_calls": 0, "network_calls": 0,
    }


def validate_freeze_manifest(path: Path) -> dict[str, Any]:
    resolved = path.resolve()
    try:
        relative = str(resolved.relative_to(REPO))
    except ValueError as exc:
        raise Invalid("freeze manifest is outside repository") from exc
    storage, freeze = exact_file(resolved, "candidate-v16 freeze manifest")
    result = _validate_freeze_object(
        freeze, expected_manifest_path=relative, head=_git_head(),
        read_file=_read_repo_file, git_blob=_git_blob,
        closure_binding=runtime_dependency_binding(),
        preflight_binding=deterministic_preflight_binding(),
    )
    result["storage_sha256"] = sha(storage)
    result["storage_bytes"] = len(storage)
    return result


def _paths(slot: str, cell: str) -> dict[str, str]:
    return {
        "transaction_claim_relative_path": f"transaction_claims/{slot}_{cell}.json",
        "rendered_relative_path": f"{slot}/rendered/{cell}.txt",
        "dispatch_attempt_relative_path": f"dispatch_attempts/{slot}_{cell}.json",
        "receipt_relative_path": f"direct_appserver_receipts/{slot}_{cell}.json",
        "capture_relative_path": f"{slot}/captures/{cell}.json",
        "score_relative_path": f"{slot}/scores/{cell}.json",
        "completion_relative_path": f"invocation_completions/{slot}_{cell}.json",
    }


def dispatch_nonce(run_id: str, slot: str, cell: str) -> str:
    return sha(b"pw-r8-c16-dispatch-nonce-v1\0" + run_id.encode() + b"\0" + slot.encode() + b"\0" + cell.encode())


def expected_run_inventory(run_id: str, entries: list[dict[str, Any]]) -> dict[str, Any]:
    tasks = []
    for entry in entries:
        slot, cell, nonce = entry["slot"], entry["cell"], entry["dispatch_nonce"]
        tasks.append({
            "task_id": f"{run_id}:{slot}:{cell}", "slot": slot, "cell": cell,
            "dispatch_nonce": nonce, **_paths(slot, cell),
        })
    return {
        "schema_id": "pw-r8-exact-run-inventory-v16", "candidate_id": CANDIDATE_ID,
        "run_id": run_id, "task_count": 291, "controller_invalid_extras": 0,
        "tasks": tasks,
    }


def expected_dispatch_schedule(run_id: str) -> dict[str, Any]:
    entries = [
        {"slot": slot, "cell": cell, "dispatch_nonce": dispatch_nonce(run_id, slot, cell)}
        for slot in SLOTS for cell in schedule()
    ]
    return {
        "schema_id": "pw-r8-dispatch-schedule-v16", "candidate_id": CANDIDATE_ID,
        "run_id": run_id, "nonce_encoding": "lowercase-hex-256",
        "nonce_derivation": "sha256(pw-r8-c16-dispatch-nonce-v1\\0run_id\\0slot\\0cell)",
        "entry_count": 291, "entries": entries,
    }


def expected_ordered_schedule(run_id: str) -> dict[str, Any]:
    return {
        "schema_id": "pw-r8-ordered-schedule-v16", "candidate_id": CANDIDATE_ID,
        "run_id": run_id, "cells": list(schedule()),
    }


def _validate_run_objects(
    run: dict[str, Any], run_storage: bytes, ordered: dict[str, Any], ordered_storage: bytes,
    dispatch: dict[str, Any], dispatch_storage: bytes, *, run_id: str,
    freeze_validator: Callable[[str, str, int], tuple[bytes, dict[str, Any]]],
) -> dict[str, Any]:
    if tuple(run) != RUN_KEYS or run.get("schema_id") != "pw-r8-run-contract-v16" or run.get("candidate_id") != CANDIDATE_ID or run.get("run_id") != run_id:
        raise Invalid("run contract strict schema/identity mismatch")
    if run.get("run_kind") not in RUN_KINDS or run.get("subject_launch_authorized") is not True or run.get("qualification_credit") != 0:
        raise Invalid("run kind/launch/zero-credit authority invalid")
    expected_routes = {slot: {"requested_model": model, "requested_thinking": effort} for slot, (model, effort) in ROUTES.items()}
    if run.get("routes") != expected_routes or run.get("fresh_task_required") is not True or run.get("first_attempt_subject_call") is not True or run.get("retry_count") != 0 or run.get("best_of") is not False or run.get("replacement_result") is not False:
        raise Invalid("run route or fresh-first-attempt rules changed")
    if run.get("qualification_contract") != qualification_contract():
        raise Invalid("run qualification contract changed")
    if run.get("ordered_schedule_path") != "ordered_schedule.json" or (run.get("ordered_schedule_storage_sha256"), run.get("ordered_schedule_storage_bytes")) != (sha(ordered_storage), len(ordered_storage)):
        raise Invalid("run ordered-schedule binding mismatch")
    if run.get("dispatch_schedule_path") != "dispatch_schedule.json" or (run.get("dispatch_schedule_storage_sha256"), run.get("dispatch_schedule_storage_bytes")) != (sha(dispatch_storage), len(dispatch_storage)):
        raise Invalid("run dispatch-schedule binding mismatch")
    freeze_storage, freeze = freeze_validator(
        run.get("candidate_freeze_manifest_path"), run.get("candidate_freeze_manifest_storage_sha256"),
        run.get("candidate_freeze_manifest_storage_bytes"),
    )
    if run.get("goal_loop_buster_addendum") != freeze.get("goal_loop_buster_addendum") or run.get("pre_freeze_progress") != freeze.get("pre_freeze_progress"):
        raise Invalid("run does not bind frozen addendum/progress authority")
    expected_ordered = expected_ordered_schedule(run_id)
    if tuple(ordered) != tuple(expected_ordered) or ordered != expected_ordered or canonical(ordered) + b"\n" != ordered_storage:
        raise Invalid("ordered schedule changed from frozen exact 97 cells")
    expected_dispatch = expected_dispatch_schedule(run_id)
    if tuple(dispatch) != tuple(expected_dispatch) or dispatch != expected_dispatch or canonical(dispatch) + b"\n" != dispatch_storage:
        raise Invalid("dispatch schedule/nonces changed from exact deterministic inventory")
    entries = dispatch["entries"]
    inventory = expected_run_inventory(run_id, entries)
    if tuple(run.get("run_inventory", {})) != RUN_INVENTORY_KEYS or run.get("run_inventory") != inventory or any(tuple(task) != TASK_KEYS for task in inventory["tasks"]):
        raise Invalid("run inventory missing/extra/reordered/retagged/stale")
    task_ids = [task["task_id"] for task in inventory["tasks"]]
    nonces = [task["dispatch_nonce"] for task in inventory["tasks"]]
    if len(task_ids) != len(set(task_ids)) or len(nonces) != len(set(nonces)):
        raise Invalid("run task IDs/nonces are not unique")
    if run["run_kind"] == "ZERO_CREDIT_THREE_ROUTE_CANARY":
        expected_authorized = [f"{run_id}:{slot}:{schedule()[0]}" for slot in SLOTS]
        expected_sequence, expected_predecessor = 0, None
    else:
        expected_authorized = task_ids
        sequence = run.get("qualification_sequence")
        predecessor = run.get("predecessor_run_id")
        if type(sequence) is not int or sequence not in (1, 2) or (sequence == 1 and predecessor is not None) or (sequence == 2 and (not isinstance(predecessor, str) or not RUN_ID_RE.fullmatch(predecessor) or predecessor == run_id)):
            raise Invalid("qualification sequence/predecessor invalid")
        expected_sequence, expected_predecessor = sequence, predecessor
    if run.get("launch_authorized_task_ids") != expected_authorized:
        raise Invalid("run launch-authorized task subset missing/extra/reordered")
    if run["run_kind"] == "ZERO_CREDIT_THREE_ROUTE_CANARY" and (run.get("qualification_sequence"), run.get("predecessor_run_id")) != (expected_sequence, expected_predecessor):
        raise Invalid("canary sequence/predecessor invalid")
    if canonical(run) + b"\n" != run_storage:
        raise Invalid("run contract storage is not canonical")
    return {
        "run": run, "run_storage": run_storage, "freeze": freeze,
        "freeze_storage": freeze_storage, "ordered": ordered, "ordered_storage": ordered_storage,
        "dispatch": dispatch, "dispatch_storage": dispatch_storage, "cells": schedule(),
        "entries": entries, "inventory": inventory, "authorized_task_ids": expected_authorized,
    }


def _actual_freeze_validator(path: str, digest: str, size: int) -> tuple[bytes, dict[str, Any]]:
    if path != FREEZE_RELATIVE_PATH:
        raise Invalid("run freeze path changed")
    storage, freeze = exact_file(REPO / path, "run-bound candidate-v16 freeze")
    if (sha(storage), len(storage)) != (digest, size):
        raise Invalid("run freeze hash/bytes mismatch")
    validate_freeze_manifest(REPO / path)
    return storage, freeze


def _load_controls(root: Path, run_id: str, slot: str, cell: str, nonce: str) -> dict[str, Any]:
    if not RUN_ID_RE.fullmatch(run_id) or slot not in SLOTS or cell not in schedule() or not HEX64_RE.fullmatch(nonce):
        raise Invalid("invalid run/slot/cell/dispatch nonce")
    run_storage, run = exact_file(root / "run_contract.json", "run contract")
    ordered_storage, ordered = exact_file(root / "ordered_schedule.json", "ordered schedule")
    dispatch_storage, dispatch = exact_file(root / "dispatch_schedule.json", "dispatch schedule")
    value = _validate_run_objects(
        run, run_storage, ordered, ordered_storage, dispatch, dispatch_storage,
        run_id=run_id, freeze_validator=_actual_freeze_validator,
    )
    mapping = {(entry["slot"], entry["cell"]): entry["dispatch_nonce"] for entry in value["entries"]}
    if mapping[(slot, cell)] != nonce:
        raise Invalid("dispatch nonce differs from exact scheduled task")
    base_verifier()._validate_run_root_inventory(root, value["inventory"])
    authorized = f"{run_id}:{slot}:{cell}" in value["authorized_task_ids"]
    if run["run_kind"] == "ZERO_CREDIT_THREE_ROUTE_CANARY":
        authorized_set = set(value["authorized_task_ids"])
        for task in value["inventory"]["tasks"]:
            if task["task_id"] in authorized_set:
                continue
            if any((root / task[key]).exists() for key in TASK_KEYS if key.endswith("_relative_path")):
                raise Invalid("zero-credit canary contains evidence for unauthorized task")
    return {
        **value, "ordered_index": schedule().index(cell), "launch_authorized": authorized,
    }


def validate_admission(run_id: str, execution_root: str, slot: str, cell: str) -> dict[str, Any]:
    root = Path(execution_root).resolve()
    _storage, dispatch = exact_file(root / "dispatch_schedule.json", "admission dispatch schedule")
    entries = dispatch.get("entries")
    if not isinstance(entries, list):
        raise Invalid("admission dispatch entries missing")
    matches = [row for row in entries if isinstance(row, dict) and row.get("slot") == slot and row.get("cell") == cell]
    if len(matches) != 1:
        raise Invalid("admission task absent or duplicated")
    controls = _load_controls(root, run_id, slot, cell, matches[0].get("dispatch_nonce"))
    _assert_task_authorized(controls, run_id, slot, cell)
    return {
        "schema_id": "pw-r8-independent-prelaunch-admission-v16", "candidate_id": CANDIDATE_ID,
        "run_id": run_id, "run_kind": controls["run"]["run_kind"], "slot": slot,
        "cell": cell, "dispatch_nonce": matches[0]["dispatch_nonce"], "status": "PASS_AUTHORIZED",
        "qualification_credit": 0, "fresh_task_required": True,
        "first_attempt_subject_call": True, "subject_calls": 0, "provider_calls": 0,
        "network_calls": 0, "filesystem_writes": 0,
    }


def _assert_task_authorized(controls: dict[str, Any], run_id: str, slot: str, cell: str) -> None:
    if f"{run_id}:{slot}:{cell}" not in controls["authorized_task_ids"]:
        raise Invalid("cell was not authorized by exact run contract")


def _synthetic_progress(audit_binding: dict[str, Any], marker: str) -> dict[str, Any]:
    return {
        "schema_id": "pw-r8-progress-assessment-v1", "identity_family": IDENTITY_FAMILY,
        "goal_loop_buster_addendum": _goal_binding(), "candidate_id": CANDIDATE_ID,
        "parent_candidate_id": PARENT_CANDIDATE_ID,
        "candidate_terminal": {
            "type": "PRESEAL_PASS", "independent_decision": "LOOP_BROKEN",
            "audit_path": AUDIT_RELATIVE_PATH, "audit_storage_sha256": audit_binding["storage_sha256"],
            "audit_storage_bytes": audit_binding["storage_bytes"], "freeze_authorized": True,
            "launch_authorized": False, "authorized_next_execution": "EXACT_THREE_ROUTE_ZERO_CREDIT_CANARY_ONLY",
        },
        "normalized_failures": [], "prior_reproducer_and_new_counterfactual_status": [{"marker": marker}],
        "valid_first_attempt_cells_completed_before_invalidation": 0,
        "longest_valid_causal_prefix": {"subject_cells": 0, "basis": "synthetic authority witness"},
        "previously_closed_failure_classes": {"status": "PASS_ZERO_CALL"},
        "architectural_surface_delta": {"authority_only": True}, "decision": "LOOP_BROKEN",
        "decision_evidence": {"synthetic_witness": True},
        "next_action": {"mode": "FREEZE_THEN_EXACT_THREE_ROUTE_CANARY"},
        "calls": {"subject": 0, "provider": 0, "network": 0}, "qualification_credit": 0,
        "nonclaims": [f"synthetic witness {marker}; no audit or freeze"],
    }


def _synthetic_authority(marker: str = "A") -> tuple[dict[str, bytes], dict[str, Any], str]:
    commit = sha(("synthetic-head-" + marker).encode())[:40]
    prefix = "tests/agent_packet_restrictions/successor_20260813/model_retest_r8_candidate_v16/"
    files: dict[str, bytes] = {}
    for index, name in enumerate(PRE_AUDIT_FILES):
        if name == "README.md":
            data = f"synthetic candidate v16 {marker}\n".encode()
        elif name.endswith(".json"):
            value: dict[str, Any] = {"schema_id": f"synthetic-{name}-{marker}", "ordinal": index}
            if name == "deterministic_preflight_report.json":
                value = {"schema_id": "pw-r8-deterministic-preflight-report-v16", "candidate_id": CANDIDATE_ID, "typed_result": {"type": "PASS", "fail_closed": True}, "marker": marker}
            data = canonical(value) + b"\n"
        else:
            data = f"# synthetic source {name} {marker}\n".encode()
        files[prefix + name] = data
    files[_goal_binding()["path"]] = regular(GOAL_ADDENDUM, "goal addendum witness")
    files[_v15_failure_binding()["path"]] = regular(V15_FREEZE_FAILURE, "v15 failure witness")
    files[_v15_progress_binding()["path"]] = regular(V15_FREEZE_PROGRESS, "v15 progress witness")
    v15_arch_path = runtime_dependency_binding()["source_path"]
    files[v15_arch_path] = regular(REPO / v15_arch_path, "v15 architecture witness")
    preflight_binding = _binding(prefix + "deterministic_preflight_report.json", files[prefix + "deterministic_preflight_report.json"])
    preflight_binding["typed_result"] = "PASS"
    closure = runtime_dependency_binding()
    sources = {
        "goal_loop_buster_addendum": _goal_binding(),
        "v15_freeze_constructibility_failure": _v15_failure_binding(),
        "v15_freeze_fail_progress": _v15_progress_binding(),
        "runtime_dependency_closure": closure,
        "deterministic_preflight": preflight_binding,
        "qualification_contract": qualification_contract(),
    }
    rows = [_binding(prefix + name, files[prefix + name]) for name in PRE_AUDIT_FILES]
    audit = {
        "schema_id": "pw-r8-independent-preseal-audit-v16", "candidate_id": CANDIDATE_ID,
        "status": "COMPLETE", "verdict": "PRESEAL_PASS", "independent_decision": "LOOP_BROKEN",
        "loop_broken": True, "freeze_authorized": True, "launch_authorized": False,
        "subject_calls": 0, "provider_calls": 0, "network_calls": 0,
        "candidate_byte_identity": {"status": "PASS", "files": rows},
        "source_bindings": sources, "blocking_findings": [],
        "nonclaims": [f"synthetic PRESEAL_PASS witness {marker}"],
    }
    audit_storage = canonical(audit) + b"\n"
    files[AUDIT_RELATIVE_PATH] = audit_storage
    audit_binding = _binding(AUDIT_RELATIVE_PATH, audit_storage)
    progress = _synthetic_progress(audit_binding, marker)
    progress_storage = canonical(progress) + b"\n"
    files[PROGRESS_RELATIVE_PATH] = progress_storage
    progress_binding = _binding(PROGRESS_RELATIVE_PATH, progress_storage)
    manifest = {
        "schema_id": "pw-r8-candidate-freeze-manifest-v16", "candidate_id": CANDIDATE_ID,
        "status": "FROZEN", "parent_candidate_id": PARENT_CANDIDATE_ID,
        "checkpoint_commit": commit, "goal_loop_buster_addendum": _goal_binding(),
        "v15_freeze_constructibility_failure": _v15_failure_binding(),
        "v15_freeze_fail_progress": _v15_progress_binding(),
        "independent_preseal_audit": {**audit_binding, "verdict": "PRESEAL_PASS", "independent_decision": "LOOP_BROKEN", "loop_broken": True},
        "pre_freeze_progress": {**progress_binding, "decision": "LOOP_BROKEN"},
        "audited_candidate_bundle": {
            "schema_id": "pw-r8-post-audit-candidate-bundle-v16", "candidate_id": CANDIDATE_ID,
            "file_count": 8, "files": rows + [audit_binding],
        },
        "runtime_dependency_closure": closure, "deterministic_preflight": preflight_binding,
        "qualification_contract": qualification_contract(),
    }
    return files, manifest, commit


def _pure_validate(files: dict[str, bytes], manifest: dict[str, Any], commit: str,
                   *, path: str = FREEZE_RELATIVE_PATH, head: str | None = None,
                   git_files: dict[str, bytes] | None = None) -> dict[str, Any]:
    local = lambda p: files[p] if p in files else (_ for _ in ()).throw(Invalid(f"missing synthetic file: {p}"))
    snapshot = files if git_files is None else git_files
    git = lambda c, p: snapshot[p] if c == commit and p in snapshot else (_ for _ in ()).throw(Invalid(f"missing synthetic Git blob: {p}"))
    return _validate_freeze_object(
        manifest, expected_manifest_path=path, head=commit if head is None else head,
        read_file=local, git_blob=git, closure_binding=manifest["runtime_dependency_closure"],
        preflight_binding=manifest["deterministic_preflight"],
    )


def _synthetic_run(manifest: dict[str, Any], run_id: str, kind: str) -> tuple[dict[str, Any], bytes, dict[str, Any], bytes, dict[str, Any], bytes]:
    ordered = expected_ordered_schedule(run_id)
    ordered_storage = canonical(ordered) + b"\n"
    dispatch = expected_dispatch_schedule(run_id)
    dispatch_storage = canonical(dispatch) + b"\n"
    inventory = expected_run_inventory(run_id, dispatch["entries"])
    first = schedule()[0]
    authorized = [f"{run_id}:{slot}:{first}" for slot in SLOTS] if kind == "ZERO_CREDIT_THREE_ROUTE_CANARY" else [task["task_id"] for task in inventory["tasks"]]
    freeze_storage = canonical(manifest) + b"\n"
    run = {
        "schema_id": "pw-r8-run-contract-v16", "candidate_id": CANDIDATE_ID,
        "run_id": run_id, "run_kind": kind, "subject_launch_authorized": True,
        "qualification_credit": 0, "launch_authorized_task_ids": authorized,
        "routes": {slot: {"requested_model": model, "requested_thinking": effort} for slot, (model, effort) in ROUTES.items()},
        "fresh_task_required": True, "first_attempt_subject_call": True,
        "retry_count": 0, "best_of": False, "replacement_result": False,
        "ordered_schedule_path": "ordered_schedule.json", "ordered_schedule_storage_sha256": sha(ordered_storage),
        "ordered_schedule_storage_bytes": len(ordered_storage), "dispatch_schedule_path": "dispatch_schedule.json",
        "dispatch_schedule_storage_sha256": sha(dispatch_storage), "dispatch_schedule_storage_bytes": len(dispatch_storage),
        "candidate_freeze_manifest_path": FREEZE_RELATIVE_PATH,
        "candidate_freeze_manifest_storage_sha256": sha(freeze_storage),
        "candidate_freeze_manifest_storage_bytes": len(freeze_storage),
        "goal_loop_buster_addendum": manifest["goal_loop_buster_addendum"],
        "pre_freeze_progress": manifest["pre_freeze_progress"],
        "qualification_contract": qualification_contract(), "run_inventory": inventory,
        "qualification_sequence": 0 if kind == "ZERO_CREDIT_THREE_ROUTE_CANARY" else 1,
        "predecessor_run_id": None,
    }
    return run, canonical(run) + b"\n", ordered, ordered_storage, dispatch, dispatch_storage


def authority_suite() -> dict[str, Any]:
    cases: list[dict[str, Any]] = []

    def passed(case_id: str, payload: Any) -> None:
        data = canonical(payload)
        cases.append({"case_id": case_id, "status": "PASS", "assertion_executed": True, "receipt_sha256": sha(data), "receipt_bytes": len(data)})

    def rejects(case_id: str, action: Callable[[], Any]) -> None:
        try:
            action()
        except Exception as exc:
            payload = {"error_type": type(exc).__name__, "error": str(exc)}
            data = canonical(payload)
            cases.append({"case_id": case_id, "status": "PASS_REJECTED", "assertion_executed": True, "receipt_sha256": sha(data), "receipt_bytes": len(data), **payload})
            return
        raise Invalid(f"authority negative case unexpectedly passed: {case_id}")

    v15 = _module(V15_VERIFIER, "pw_r8_v15_authority_failure_reproducer")
    files, manifest, commit = _synthetic_authority("A")
    v15_attempt = dict(manifest)
    rejects("V15-AUTH-PRED-001-NO-SCHEMA-VALID-FILE-SET", lambda: v15._validate_freeze_static_authority(v15_attempt))
    first_result = _pure_validate(files, manifest, commit)
    passed("V16-AUTH-SUCC-001-SYNTHETIC-PRESEAL-CONSTRUCTIBLE", first_result)
    files_b, manifest_b, commit_b = _synthetic_authority("B")
    second_result = _pure_validate(files_b, manifest_b, commit_b)
    if manifest["independent_preseal_audit"]["storage_sha256"] == manifest_b["independent_preseal_audit"]["storage_sha256"] or manifest["pre_freeze_progress"]["storage_sha256"] == manifest_b["pre_freeze_progress"]["storage_sha256"]:
        raise Invalid("dynamic audit/progress witnesses did not vary")
    passed("V16-AUTH-SUCC-002-DYNAMIC-POST-AUDIT-HASHES", second_result)

    rejects("V16-AUTH-REJECT-STALE-HEAD", lambda: _pure_validate(files, manifest, commit, head="0" * 40))
    for label, path in (
        ("CANDIDATE", next(iter(files))), ("AUDIT", AUDIT_RELATIVE_PATH), ("PROGRESS", PROGRESS_RELATIVE_PATH),
    ):
        dirty = dict(files); dirty[path] += b"dirty"
        rejects(f"V16-AUTH-REJECT-UNCOMMITTED-{label}", lambda d=dirty: _pure_validate(d, manifest, commit, git_files=files))
    bad = json.loads(json.dumps(manifest)); bad_audit = strict_object(files[AUDIT_RELATIVE_PATH], "synthetic audit")
    bad_audit["verdict"] = "PRESEAL_FAIL"; bad_storage = canonical(bad_audit) + b"\n"
    bad_files = dict(files); bad_files[AUDIT_RELATIVE_PATH] = bad_storage
    bad["independent_preseal_audit"]["storage_sha256"] = sha(bad_storage); bad["independent_preseal_audit"]["storage_bytes"] = len(bad_storage); bad["independent_preseal_audit"]["verdict"] = "PRESEAL_FAIL"
    bad["audited_candidate_bundle"]["files"][-1] = _binding(AUDIT_RELATIVE_PATH, bad_storage)
    rejects("V16-AUTH-REJECT-PRESEAL-FAIL", lambda: _pure_validate(bad_files, bad, commit, git_files=bad_files))
    rejects("V16-AUTH-REJECT-WRONG-MANIFEST-PATH", lambda: _pure_validate(files, manifest, commit, path="wrong/freeze.json"))
    for mode in ("MISSING", "EXTRA", "REORDERED"):
        mutated = dict(manifest)
        if mode == "MISSING": mutated.pop("qualification_contract")
        elif mode == "EXTRA": mutated["extra"] = True
        else:
            mutated = {"candidate_id": mutated["candidate_id"], "schema_id": mutated["schema_id"], **{k: v for k, v in mutated.items() if k not in ("candidate_id", "schema_id")}}
        rejects(f"V16-AUTH-REJECT-{mode}-FREEZE-KEY", lambda m=mutated: _pure_validate(files, m, commit))
    tampered_bundle = json.loads(json.dumps(manifest)); tampered_bundle["audited_candidate_bundle"]["files"][0]["storage_bytes"] += 1
    rejects("V16-AUTH-REJECT-TAMPERED-BUNDLE", lambda: _pure_validate(files, tampered_bundle, commit))
    tampered_closure = json.loads(json.dumps(manifest)); tampered_closure["runtime_dependency_closure"]["canonical_rows_bytes"] += 1
    rejects("V16-AUTH-REJECT-TAMPERED-CLOSURE", lambda: _pure_validate(files, tampered_closure, commit))
    missing_addendum = dict(files); missing_addendum.pop(_goal_binding()["path"])
    rejects("V16-AUTH-REJECT-MISSING-ADDENDUM", lambda: _pure_validate(missing_addendum, manifest, commit, git_files=missing_addendum))

    run_id = "PW-R8-C16-CANARY-SYNTHETIC"
    run, run_storage, ordered, ordered_storage, dispatch, dispatch_storage = _synthetic_run(manifest, run_id, "ZERO_CREDIT_THREE_ROUTE_CANARY")
    freeze_storage = canonical(manifest) + b"\n"
    freeze_validator = lambda p, h, n: (freeze_storage, manifest) if (p, h, n) == (FREEZE_RELATIVE_PATH, sha(freeze_storage), len(freeze_storage)) else (_ for _ in ()).throw(Invalid("synthetic freeze binding mismatch"))
    controls = _validate_run_objects(run, run_storage, ordered, ordered_storage, dispatch, dispatch_storage, run_id=run_id, freeze_validator=freeze_validator)
    passed("V16-RUN-CANARY-EXACT-THREE-FIRST-CELLS", {"authorized": controls["authorized_task_ids"], "qualification_credit": 0})
    first, next_cell = schedule()[0], schedule()[1]
    for slot in SLOTS:
        _assert_task_authorized(controls, run_id, slot, first)
        passed(f"V16-RUN-ADMIT-{slot}-FIRST", {"task_id": f"{run_id}:{slot}:{first}", "dispatch_nonce": dispatch_nonce(run_id, slot, first)})
        rejects(f"V16-RUN-REJECT-{slot}-NEXT", lambda s=slot: _assert_task_authorized(controls, run_id, s, next_cell))
    wrong_enum = dict(run); wrong_enum["run_kind"] = "ZERO_CREDIT_CANARY"
    rejects("V16-RUN-REJECT-WRONG-CANARY-ENUM", lambda: _validate_run_objects(wrong_enum, canonical(wrong_enum) + b"\n", ordered, ordered_storage, dispatch, dispatch_storage, run_id=run_id, freeze_validator=freeze_validator))
    extra_task = dict(run); extra_task["launch_authorized_task_ids"] = run["launch_authorized_task_ids"] + [run["run_inventory"]["tasks"][1]["task_id"]]
    rejects("V16-RUN-REJECT-EXTRA-CANARY-TASK", lambda: _validate_run_objects(extra_task, canonical(extra_task) + b"\n", ordered, ordered_storage, dispatch, dispatch_storage, run_id=run_id, freeze_validator=freeze_validator))
    if len(cases) != 24 or any(not row["status"].startswith("PASS") for row in cases):
        raise Invalid("authority suite case count/status mismatch")
    return {
        "schema_id": "pw-r8-authority-constructibility-suite-v16", "status": "PASS",
        "case_count": len(cases), "cases": cases, "synthetic_audit_hashes_distinct": True,
        "synthetic_progress_hashes_distinct": True, "canary_authorized_tasks": 3,
        "subject_calls": 0, "provider_calls": 0, "network_calls": 0, "filesystem_writes": 0,
    }


def retained_v15_validation() -> dict[str, Any]:
    storage, report = exact_file(V15_PREFLIGHT, "preserved v15 deterministic preflight")
    v15 = _module(V15_VERIFIER, "pw_r8_v15_retained_independent_validation")
    result = v15.validate_preflight()
    boundary = report.get("verifier_boundary_suite", {})
    zero = report.get("zero_call_suite", {})
    semantic = report.get("semantic_identity", {})
    if result.get("status") != "PASS" or boundary.get("case_count") != 48 or zero.get("case_count") != 20 or semantic.get("render_identity") != "97/97" or semantic.get("oracle_identity") != "97/97" or semantic.get("schedule_identity") != "97/97":
        raise Invalid("preserved v15 executable regression suite changed")
    return {
        "schema_id": "pw-r8-retained-v15-validation-v16", "status": "PASS",
        "v15_preflight_sha256": sha(storage), "v15_preflight_bytes": len(storage),
        "prefix_boundary_cases": 48, "named_zero_call_cases": 20,
        "candidate_v13_blockers": 4, "historical_signatures": 8,
        "v14_blocker_reproduced": True, "terminal_constructibility": [97, 291, 582],
        "render_identity": "97/97", "oracle_identity": "97/97", "schedule_identity": "97/97",
        "dependency_files": 64, "live_plans_reads": 0, "subject_calls": 0,
        "provider_calls": 0, "network_calls": 0, "filesystem_writes": 0,
    }


def validate_preflight() -> dict[str, Any]:
    storage, report = exact_file(ROOT / "deterministic_preflight_report.json", "candidate-v16 deterministic preflight")
    if report.get("schema_id") != "pw-r8-deterministic-preflight-report-v16" or report.get("candidate_id") != CANDIDATE_ID or report.get("typed_result") != {"type": "PASS", "fail_closed": True}:
        raise Invalid("stored v16 preflight identity/result mismatch")
    authority = authority_suite()
    retained = retained_v15_validation()
    if report.get("authority_constructibility_suite") != authority or report.get("retained_v15_execution") != retained:
        raise Invalid("stored v16 preflight is not independently reproducible")
    return {
        "schema_id": "pw-r8-independent-preflight-validation-v16", "candidate_id": CANDIDATE_ID,
        "status": "PASS", "storage_sha256": sha(storage), "storage_bytes": len(storage),
        "authority_cases": authority["case_count"], "prefix_boundary_cases": 48,
        "named_zero_call_cases": 20, "semantic_cells": 97,
        "subject_calls": 0, "provider_calls": 0, "network_calls": 0, "filesystem_writes": 0,
    }


def validate_cell(run_id: str, execution_root: str, slot: str, cell: str) -> dict[str, Any]:
    return base_verifier().validate_cell(run_id, execution_root, slot, cell)


def validate_artifact(run_id: str, execution_root: str, slot: str, stage: str) -> dict[str, Any]:
    return base_verifier().validate_artifact(run_id, execution_root, slot, stage)


def validate_path(run_id: str, execution_root: str, slot: str) -> dict[str, Any]:
    return base_verifier().validate_path(run_id, execution_root, slot)


def validate_matrix(run_id: str, execution_root: str) -> dict[str, Any]:
    return base_verifier().validate_matrix(run_id, execution_root)


def validate_two_runs(first_execution_root: str, second_execution_root: str) -> dict[str, Any]:
    return base_verifier().validate_two_runs(first_execution_root, second_execution_root)


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
    q = sub.add_parser("validate-freeze"); q.add_argument("--manifest", required=True)
    q = sub.add_parser("validate-admission")
    for name in ("run-id", "execution-root", "slot", "cell"):
        q.add_argument(f"--{name}", required=True)
    sub.add_parser("validate-preflight")
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
            value = validate_freeze_manifest(Path(args.manifest))
        elif args.command == "validate-admission":
            value = validate_admission(args.run_id, args.execution_root, args.slot, args.cell)
        else:
            value = validate_preflight()
        sys.stdout.buffer.write(canonical(value) + b"\n")
        return 0
    except Exception as exc:
        value = {
            "schema_id": "pw-r8-independent-verifier-error-v16", "candidate_id": CANDIDATE_ID,
            "status": "INVALID_FAIL_CLOSED", "command": args.command,
            "error_type": type(exc).__name__, "error": str(exc),
            "schedule_advance_allowed": False, "qualification_credit": 0,
            "subject_calls": 0, "provider_calls": 0, "network_calls": 0,
            "filesystem_writes": 0,
        }
        sys.stdout.buffer.write(canonical(value) + b"\n")
        return 2


if __name__ == "__main__":
    raise SystemExit(main())
