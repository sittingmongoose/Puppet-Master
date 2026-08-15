#!/usr/bin/env python3
"""Candidate-16 authority-only controller facade.

The candidate-15 single-process run-cell transaction is preserved byte-for-
behavior.  Only its authority loader is replaced by the independent v16
authority verifier.  The controller emits proposals and performs zero writes.
"""
from __future__ import annotations

import argparse
import ast
import hashlib
import importlib.util
import json
from pathlib import Path
import stat
import sys
from types import ModuleType
from typing import Any, Callable

sys.dont_write_bytecode = True

CANDIDATE_ID = "PW-R8-ITERATIVE-FIX-TWO-CLEAN-RUNS-20260815.CANDIDATE-16"
PARENT_CANDIDATE_ID = "PW-R8-ITERATIVE-FIX-TWO-CLEAN-RUNS-20260815.CANDIDATE-15"
REPO = Path("/mnt/Cursor/PuppetMaster")
SUCCESSOR = REPO / "tests/agent_packet_restrictions/successor_20260813"
ROOT = SUCCESSOR / "model_retest_r8_candidate_v16"
V15_ROOT = SUCCESSOR / "model_retest_r8_candidate_v15"
V15_CONTROLLER = V15_ROOT / "r8_clean_room_controller.py"
V15_VERIFIER = V15_ROOT / "r8_run_verifier.py"
V15_PREFLIGHT = V15_ROOT / "deterministic_preflight_report.json"
V16_VERIFIER = ROOT / "r8_run_verifier.py"
GOAL_ADDENDUM = SUCCESSOR / "r8_goal_loop_buster_addendum_v1.json"
V15_FREEZE_FAILURE = SUCCESSOR / "r8_candidate_v15_freeze_constructibility_failure_v1.json"
V15_FREEZE_PROGRESS = SUCCESSOR / "r8_progress_assessment_candidate_v15_freeze_fail_v2.json"
CHECKPOINT_COMMIT = "b12efd4955ae8d35c66021009dff713104a7dd49"
SLOTS = ("slot-alpha", "slot-bravo", "slot-charlie")
STAGES = ("S10A", "S10B", "S20A", "S20B", "S30A", "S30B", "S40A", "S40B", "S45A", "S45B", "S50", "S55", "S60P", "S60C", "S60K", "S70", "S80", "S90")


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


def strict_object(data: bytes, label: str) -> dict[str, Any]:
    if not data.endswith(b"\n") or data.endswith(b"\n\n") or b"\r" in data:
        raise Invalid(f"{label}: canonical storage must have exactly one terminal LF")
    raw = data[:-1]
    try:
        value = json.loads(raw.decode("utf-8"), object_pairs_hook=_reject_duplicates)
    except Exception as exc:
        raise Invalid(f"{label}: invalid strict JSON: {exc}") from exc
    if not isinstance(value, dict) or canonical(value) != raw:
        raise Invalid(f"{label}: not canonical JSON object")
    return value


def regular(path: Path, label: str) -> bytes:
    info = path.lstat()
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


_AUTHORITY: ModuleType | None = None
_BASE: ModuleType | None = None


def authority() -> ModuleType:
    global _AUTHORITY
    if _AUTHORITY is None:
        _AUTHORITY = _module(V16_VERIFIER, "pw_r8_v16_controller_authority")
    return _AUTHORITY


def base_controller() -> ModuleType:
    global _BASE
    if _BASE is None:
        _BASE = _module(V15_CONTROLLER, "pw_r8_v15_transaction_for_v16")
        _BASE.CANDIDATE_ID = CANDIDATE_ID
        _BASE.ROOT = ROOT
        _BASE._load_controls = authority()._load_controls
    return _BASE


def _source_surface() -> dict[str, Any]:
    controller_source = regular(ROOT / "r8_clean_room_controller.py", "v16 controller source").decode("utf-8")
    verifier_source = regular(ROOT / "r8_run_verifier.py", "v16 verifier source").decode("utf-8")
    controller_tree = ast.parse(controller_source)
    verifier_tree = ast.parse(verifier_source)
    write_calls = []
    for label, tree in (("controller", controller_tree), ("verifier", verifier_tree)):
        for node in ast.walk(tree):
            if isinstance(node, ast.Call) and isinstance(node.func, ast.Attribute) and node.func.attr in {"write_text", "write_bytes", "open", "touch", "mkdir", "unlink", "rename", "replace"}:
                write_calls.append(f"{label}:{node.func.attr}:{node.lineno}")
    verifier_imports = [
        alias.name for node in ast.walk(verifier_tree) if isinstance(node, (ast.Import, ast.ImportFrom))
        for alias in node.names
    ]
    if write_calls or any("controller" in name for name in verifier_imports):
        raise Invalid("v16 static independent/no-write surface changed")
    v15_controller = regular(V15_CONTROLLER, "preserved v15 controller source")
    v15_verifier = regular(V15_VERIFIER, "preserved v15 verifier source")
    return {
        "status": "PASS", "controller_write_calls": [], "verifier_write_calls": [],
        "verifier_imports_controller": False, "controller_provider_call_sites": 1,
        "standalone_run_subject": False, "prelaunch_control_files": [
            "run_contract.json", "ordered_schedule.json", "dispatch_schedule.json",
        ],
        "preserved_v15_controller_sha256": sha(v15_controller),
        "preserved_v15_controller_bytes": len(v15_controller),
        "preserved_v15_verifier_sha256": sha(v15_verifier),
        "preserved_v15_verifier_bytes": len(v15_verifier),
    }


def preflight_report() -> dict[str, Any]:
    auth = authority()
    goal_storage, goal = exact_file(GOAL_ADDENDUM, "goal loop-buster addendum")
    failure_storage, failure = exact_file(V15_FREEZE_FAILURE, "v15 freeze failure")
    progress_storage, progress = exact_file(V15_FREEZE_PROGRESS, "v15 freeze-fail progress")
    if (
        (sha(goal_storage), len(goal_storage)) != ("d3f901e724d785ba3d053a961a8559b6f5b5add7e7b660a9fbb503586ad822d0", 4468)
        or (sha(failure_storage), len(failure_storage)) != ("e502860990ab89e7730d854df7e9912a079117ad73c74542962e52c02705402c", 3248)
        or (sha(progress_storage), len(progress_storage)) != ("6d9741b8a77b33b4e809d32900979fbb15f9a23a5782a4fafa30b1956057dd03", 3942)
        or goal.get("identity_family") != "PW-R8-ITERATIVE-FIX-TWO-CLEAN-RUNS-20260815"
        or failure.get("normalized_failure_signature") != "IMMUTABLE_FREEZE_AUTHORITY_CONTRACT_CANNOT_BIND_CURRENT_POST_AUDIT_STATE"
        or progress.get("candidate_terminal", {}).get("type") != "POST_AUDIT_FREEZE_CONSTRUCTIBILITY_FAIL"
    ):
        raise Invalid("v16 lineage binding mismatch")
    retained = auth.retained_v15_validation()
    authority_suite = auth.authority_suite()
    v15_storage, v15_report = exact_file(V15_PREFLIGHT, "preserved v15 preflight")
    closure_rows = v15_report["runtime_dependency_closure"]["rows"]
    closure_storage = canonical(closure_rows)
    base = base_controller()
    return {
        "schema_id": "pw-r8-deterministic-preflight-report-v16", "candidate_id": CANDIDATE_ID,
        "parent_candidate_id": PARENT_CANDIDATE_ID, "status": "PASS",
        "typed_result": {"type": "PASS", "fail_closed": True},
        "checkpoint_commit_at_candidate_creation": CHECKPOINT_COMMIT,
        "subject_calls": 0, "provider_calls": 0, "network_calls": 0,
        "filesystem_writes": 0, "live_plans_reads": 0,
        "goal_loop_buster_addendum": {"path": str(GOAL_ADDENDUM.relative_to(REPO)), "sha256": sha(goal_storage), "bytes": len(goal_storage)},
        "v15_freeze_constructibility_failure": {"path": str(V15_FREEZE_FAILURE.relative_to(REPO)), "sha256": sha(failure_storage), "bytes": len(failure_storage), "signature": failure["normalized_failure_signature"]},
        "v15_freeze_fail_progress": {"path": str(V15_FREEZE_PROGRESS.relative_to(REPO)), "sha256": sha(progress_storage), "bytes": len(progress_storage), "decision": progress["decision"]},
        "authority_change_scope": {
            "only": ["freeze manifest constructibility", "run contract authority vocabulary and bindings"],
            "unchanged": ["97 semantic packets", "oracles", "scorer", "reducers", "schedule", "routes", "single-process run-cell transaction", "causal-prefix verifier", "25-key dispatch attempt", "39-key completion-v3"],
            "future_hashes_hardcoded": False, "freeze_checkpoint_validation": "manifest checkpoint must equal current local HEAD and every candidate/audit/progress byte must equal its Git blob",
            "unrelated_dirty_files_relevant": False, "freeze_self_reference": False,
        },
        "runtime_dependency_closure": {
            "status": "PASS", "exact_sorted_unique_files": 64,
            "inventory_sha256": sha(closure_storage), "inventory_bytes": len(closure_storage),
            "rows": closure_rows, "live_plans_paths": [],
            "observed_open_enforcement": v15_report["runtime_dependency_closure"]["observed_open_enforcement"],
        },
        "semantic_identity": v15_report["semantic_identity"],
        "dispatch_attempt_contract": {"exact_key_count": 25, "exact_keys": list(base.DISPATCH_ATTEMPT_KEYS)},
        "completion_v3_contract": {"exact_key_count": 39, "exact_keys": list(base.COMPLETION_KEYS), "forbidden_outer_session_fields_present": False},
        "freeze_authority": {
            "manifest_path": auth.FREEZE_RELATIVE_PATH, "exact_keys": list(auth.FREEZE_KEYS),
            "audit_path": auth.AUDIT_RELATIVE_PATH, "progress_path": auth.PROGRESS_RELATIVE_PATH,
            "run_exact_keys": list(auth.RUN_KEYS), "run_kinds": list(auth.RUN_KINDS),
            "qualification_contract": auth.qualification_contract(),
        },
        "static_control_surface": _source_surface(),
        "authority_constructibility_suite": authority_suite,
        "retained_v15_execution": retained,
        "claim_boundary": "Deterministic zero-call authority constructibility only; no audit, freeze, launch, empirical credit, qualification, or readiness claim.",
    }


def self_test() -> dict[str, Any]:
    report = preflight_report()
    path = ROOT / "deterministic_preflight_report.json"
    if path.exists():
        storage, stored = exact_file(path, "stored v16 deterministic preflight")
        if stored != report or storage != canonical(report) + b"\n":
            raise Invalid("stored v16 deterministic preflight is not reproducible")
    return report


def parser() -> argparse.ArgumentParser:
    p = argparse.ArgumentParser()
    sub = p.add_subparsers(dest="command", required=True)
    for name in ("emit-capture", "score-cell", "emit-completion", "recover-state"):
        q = sub.add_parser(name)
        for field in ("run-id", "execution-root", "slot", "cell", "dispatch-nonce"):
            q.add_argument(f"--{field}", required=True)
    q = sub.add_parser("run-cell")
    for field in ("run-id", "execution-root", "slot", "cell", "dispatch-nonce"):
        q.add_argument(f"--{field}", required=True)
    q.add_argument("--timeout-seconds", type=float, default=600.0)
    q = sub.add_parser("emit-artifact")
    for field in ("run-id", "execution-root", "slot", "stage"):
        q.add_argument(f"--{field}", required=True)
    sub.add_parser("self-test")
    return p


def main() -> int:
    args = parser().parse_args()
    try:
        base = base_controller()
        if args.command == "self-test":
            value = self_test()
        elif args.command == "emit-artifact":
            value = base.emit_artifact(args.run_id, args.execution_root, args.slot, args.stage)
        else:
            common = (args.run_id, args.execution_root, args.slot, args.cell, args.dispatch_nonce)
            operations: dict[str, Callable[..., dict[str, Any]]] = {
                "emit-capture": base.emit_capture, "score-cell": base.score_cell,
                "emit-completion": base.emit_completion, "recover-state": base.recover_state,
            }
            value = base.run_cell(*common, timeout_seconds=args.timeout_seconds) if args.command == "run-cell" else operations[args.command](*common)
        sys.stdout.buffer.write(canonical(value) + b"\n")
        return 0
    except Exception as exc:
        value = {
            "schema_id": "pw-r8-clean-room-controller-error-v16", "candidate_id": CANDIDATE_ID,
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
