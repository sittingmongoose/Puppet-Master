#!/usr/bin/env python3
"""Independent data-only checker for the V17 native Goal identity correction."""

from __future__ import annotations

import argparse
import ast
import hashlib
import importlib.util
import json
import os
from pathlib import Path
import stat
import subprocess
import sys
from typing import Any


SCHEMA = "pw-r9-goal-mode-v17-harness-independent-check-v1"
CONTRACT = ("goal_mode_empirical_harness_v17/goal_mode_contract.json", 1979, "4d55d2b1b3d73a89f33edb719d0e0b1d981b2d2ef25550ac39a2c295bbc9f211")
HARNESS = ("goal_mode_empirical_harness_v17/goal_mode_harness.py", 14208, "876b79a838df82e81c2e0a7f411fbf7a71a4c61534c3a443cc2aec1e6820b86d")
ATTESTOR = ("goal_mode_empirical_harness_v17/goal_mode_three_turn_attestor.py", 16134, "d35c2da52bce8d7843c16d473e3ad3ef62cc38159baa429a755d1cffde057978")
DESIGN = ("r9_goal_mode_v17_phase_aware_historical_bootstrap_reopen_successor_design_v1.json", 1999, "71a37c3a8a177ff43bdeb8bc77e6ffd44a5c32a66988f9f1a11e0632d24ab7f5")
V15_FAILURE = ("r9_goal_mode_v15_three_turn_canary_001_runtime_failure_receipt_v1.json", 5649, "16aa1f2bd263f069f1cfa9f4dadb5d366a2b628e137b50690e8185a08544b040")
V16_FAILURE = ("r9_goal_mode_v16_three_turn_canary_001_runtime_failure_receipt_v1.json", 5992, "e13569c3b63e7823902e0ba56a4ffbc9baf84d62415835181c19c59f2fe6960f")
V15_HARNESS = ("goal_mode_empirical_harness_v15/goal_mode_harness.py", 26904, "e6c9082ec03dccd47797f40e22e9e86fdcb2fedd7cbe1d02a4c3fd3076e44a48")
V3_ATTESTOR = ("goal_mode_empirical_harness_v3/goal_mode_attestor.py", None, None)
PROJECTION_KEYS = {"createdAt", "objective", "status", "threadId", "timeUsedSeconds", "tokensUsed", "updatedAt"}


class Invalid(RuntimeError):
    pass


def require(ok: bool, message: str) -> None:
    if not ok:
        raise Invalid(message)


def pairs(items: list[tuple[str, Any]]) -> dict[str, Any]:
    value: dict[str, Any] = {}
    for key, item in items:
        require(key not in value, f"duplicate JSON key:{key}")
        value[key] = item
    return value


def canon(value: Any, newline: bool = True) -> bytes:
    raw = json.dumps(value, ensure_ascii=False, allow_nan=False, sort_keys=True, separators=(",", ":")).encode("utf-8")
    return raw + (b"\n" if newline else b"")


def sha(raw: bytes) -> str:
    return hashlib.sha256(raw).hexdigest()


def read_regular(path: Path, limit: int = 64_000_000) -> bytes:
    before = os.lstat(path)
    require(stat.S_ISREG(before.st_mode) and not path.is_symlink() and 0 <= before.st_size <= limit, f"unsafe file:{path}")
    raw = path.read_bytes()
    after = os.lstat(path)
    require(
        (before.st_dev, before.st_ino, before.st_size, before.st_mtime_ns)
        == (after.st_dev, after.st_ino, after.st_size, after.st_mtime_ns)
        and len(raw) == before.st_size,
        f"changing file:{path}",
    )
    return raw


def identity(base: Path, item: tuple[str, int | None, str | None]) -> dict[str, Any]:
    rel, expected_bytes, expected_sha = item
    path = base / rel
    raw = read_regular(path)
    mode = f"{stat.S_IMODE(os.lstat(path).st_mode):04o}"
    require(mode == "0644", f"mode:{rel}")
    if expected_bytes is not None:
        require(len(raw) == expected_bytes, f"bytes:{rel}")
    if expected_sha is not None:
        require(sha(raw) == expected_sha, f"sha256:{rel}")
    return {"bytes": len(raw), "mode": mode, "path": rel, "sha256": sha(raw)}


def load_canonical(path: Path) -> dict[str, Any]:
    raw = read_regular(path)
    value = json.loads(raw, object_pairs_hook=pairs, parse_constant=lambda item: (_ for _ in ()).throw(Invalid(f"nonfinite:{item}")))
    require(isinstance(value, dict) and raw == canon(value), f"noncanonical JSON:{path}")
    return value


def projection_valid(value: dict[str, Any], thread_id: str, objective: str, status: str) -> bool:
    if set(value) != PROJECTION_KEYS:
        return False
    if value.get("threadId") != thread_id or value.get("objective") != objective or value.get("status") != status:
        return False
    for field in ("createdAt", "updatedAt", "tokensUsed", "timeUsedSeconds"):
        if not isinstance(value.get(field), int) or isinstance(value.get(field), bool) or value[field] < 0:
            return False
    return value["updatedAt"] >= value["createdAt"]


def projection_mutations() -> list[dict[str, str]]:
    base = {"createdAt": 10, "objective": "o", "status": "active", "threadId": "t", "timeUsedSeconds": 0, "tokensUsed": 0, "updatedAt": 10}
    require(projection_valid(base, "t", "o", "active"), "baseline projection rejected")
    variants = {
        "extra_goal_id": {**base, "goal_id": "fabricated"},
        "missing_created_at": {key: value for key, value in base.items() if key != "createdAt"},
        "negative_tokens": {**base, "tokensUsed": -1},
        "objective_mismatch": {**base, "objective": "wrong"},
        "status_mismatch": {**base, "status": "complete"},
        "thread_mismatch": {**base, "threadId": "wrong"},
        "timestamp_reverse": {**base, "updatedAt": 9},
        "tokens_bool": {**base, "tokensUsed": False},
    }
    result: list[dict[str, str]] = []
    for name, value in sorted(variants.items()):
        require(not projection_valid(value, "t", "o", "active"), f"projection mutant survived:{name}")
        result.append({"mutation": name, "status": "REJECTED"})
    return result


def audit_phase_source(text: str) -> None:
    ast.parse(text)
    required = (
        'require(historical_reopen, "subject existed during initial bootstrap")',
        '"historical bootstrap/release/delivery temporal order"',
        'current_status = "active" if require_active else "complete"',
        "v15.legacy._reader_result(",
        'reader = {**reader, "output_line": reader_result["tool_output_line"]}',
        "v15._scored_common = _scored_common",
    )
    require(all(item in text for item in required), "phase-aware source closure")


def phase_source_mutations(text: str) -> list[dict[str, str]]:
    variants = {
        "allow_initial_subject": text.replace('require(historical_reopen, "subject existed during initial bootstrap")', 'require(True, "subject existed during initial bootstrap")', 1),
        "drop_complete_status": text.replace('current_status = "active" if require_active else "complete"', 'current_status = "active"', 1),
        "drop_reader_result": text.replace("v15.legacy._reader_result(", "v15.legacy._reader_call(", 1),
        "drop_temporal_order": text.replace('"historical bootstrap/release/delivery temporal order"', '"different temporal label"', 1),
    }
    result: list[dict[str, str]] = []
    for name, mutant in sorted(variants.items()):
        require(mutant != text, f"phase mutation applied:{name}")
        rejected = False
        try:
            audit_phase_source(mutant)
        except (Invalid, SyntaxError):
            rejected = True
        require(rejected, f"phase mutation survived:{name}")
        result.append({"mutation": name, "status": "REJECTED"})
    return result


def tree_identity(root: Path) -> str:
    rows: list[dict[str, Any]] = []
    for path in sorted(root.rglob("*"), key=lambda item: item.as_posix()):
        relative = path.relative_to(root).as_posix()
        st = os.lstat(path)
        if stat.S_ISDIR(st.st_mode):
            rows.append({"mode": f"{stat.S_IMODE(st.st_mode):04o}", "path": relative, "type": "directory"})
        elif stat.S_ISREG(st.st_mode) and not path.is_symlink():
            raw = read_regular(path, 256_000_000)
            rows.append({"bytes": len(raw), "mode": f"{stat.S_IMODE(st.st_mode):04o}", "path": relative, "sha256": sha(raw), "type": "file"})
        else:
            raise Invalid(f"unsafe replay member:{relative}")
    return sha(canon(rows, newline=False))


def load_module(name: str, path: Path) -> Any:
    spec = importlib.util.spec_from_file_location(name, path)
    require(spec is not None and spec.loader is not None, f"module loader:{name}")
    module = importlib.util.module_from_spec(spec)
    sys.modules[name] = module
    sys.path.insert(0, str(path.parent))
    spec.loader.exec_module(module)
    return module


def run_preserved_v16_replay(base: Path) -> dict[str, Any]:
    evidence = base / "goal_mode_v16_three_turn_canary_001_evidence" / "rows" / "row-000"
    before = tree_identity(evidence)
    v17 = load_module("_r9_v17_independent_replay", base / ATTESTOR[0])
    v16 = load_module("_r9_v16_independent_replay", base / "goal_mode_empirical_harness_v16" / "goal_mode_three_turn_attestor.py")
    names = (
        "ADAPTER", "ROW_SCHEMA", "SNAPSHOT_SCHEMA", "BOOTSTRAP_LAUNCH_SCHEMA",
        "BOOTSTRAP_PROCESS_SCHEMA", "BOOTSTRAP_ATTESTATION_SCHEMA",
        "SCORED_LAUNCH_SCHEMA", "SCORED_PROCESS_SCHEMA", "RELEASE_SCHEMA",
        "DELIVERY_SCHEMA", "SCORED_ATTESTATION_SCHEMA", "CLOSURE_LAUNCH_SCHEMA",
        "CLOSURE_PROCESS_SCHEMA", "FINAL_ATTESTATION_SCHEMA", "BOOTSTRAP_MARKER",
    )
    for name in names:
        value = getattr(v16, name)
        setattr(v17, name, value)
        setattr(v17.v15, name, value)
    row_path = base / "goal_mode_v16_three_turn_canary_001_inputs" / "row-000.row.json"
    result = v17.attest_scored(row_path, evidence, Path("/home/sittingmongoose/.codex"))
    require(
        result["goal"]["goal_id"] == "a9dab016-208f-45b4-a589-ac85384f5444"
        and result["answer"] == {"bytes": 69, "sha256": "f01c609480b6cdfa8dfd77ec38115e08b4d9022d5c90ef731c591e2ef912554d"}
        and isinstance(result["reader_output_line"], int),
        "preserved V16 scored replay",
    )
    original = v17.v15._thread_goal
    def completed(*args: Any, **kwargs: Any) -> Any:
        goal, records, rollout, logical = original(*args, **kwargs)
        return {**goal, "status": "complete"}, records, rollout, logical
    v17.v15._thread_goal = completed
    stored = v17.load_json(evidence / "bootstrap_attestation.json", 8_000_000)
    reopened = v17._bootstrap_common(v17.load_row(row_path), evidence, Path("/home/sittingmongoose/.codex"), False, stored["rollout"])
    require(reopened == stored, "complete-state bootstrap projection changed")
    require(tree_identity(evidence) == before, "preserved V16 replay wrote evidence")
    return {"complete_status_injection": "PASS", "evidence_inventory_preserved": True, "goal_id": result["goal"]["goal_id"], "reader_output_line": result["reader_output_line"], "scored_reopen": "PASS"}


def run_target_check(base: Path) -> dict[str, Any]:
    target = base / HARNESS[0]
    process = subprocess.run(
        [sys.executable, "-B", str(target), "check", "--codex", "/home/sittingmongoose/.local/bin/codex"],
        stdin=subprocess.DEVNULL,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        cwd=base,
        env={**os.environ, "PYTHONDONTWRITEBYTECODE": "1"},
        timeout=60,
        check=False,
    )
    require(process.returncode == 0 and process.stderr == b"", "target check process")
    result = json.loads(process.stdout, object_pairs_hook=pairs, parse_constant=lambda item: (_ for _ in ()).throw(Invalid(f"nonfinite:{item}")))
    require(process.stdout == canon(result), "target check canonical")
    require(
        result.get("schema_id") == "pw-r9-goal-mode-harness-check-v17"
        and result.get("status") == "PASS_STATIC_V17_THREE_TURN_PHASE_AWARE_HISTORICAL_REOPEN_DATA_ONLY_NO_MODEL_CALL_NO_LAUNCH_ZERO_CREDIT"
        and result.get("authority") == {"canary_launch": False, "matrix_launch": False, "qualification_credit": 0},
        "target check result",
    )
    return {
        "rc": process.returncode,
        "stderr": {"bytes": len(process.stderr), "sha256": sha(process.stderr)},
        "stdout": {"bytes": len(process.stdout), "sha256": sha(process.stdout)},
    }


def check(base: Path) -> dict[str, Any]:
    bindings = [identity(base, item) for item in (CONTRACT, HARNESS, ATTESTOR, DESIGN, V15_FAILURE, V16_FAILURE, V15_HARNESS, V3_ATTESTOR)]
    contract = load_canonical(base / CONTRACT[0])
    design = load_canonical(base / DESIGN[0])
    failure = load_canonical(base / V16_FAILURE[0])
    require(contract["authority"] == {"canary_launch": False, "matrix_launch": False, "qualification_credit": 0, "qualification_streak_clean_matrices": 0, "release": False}, "contract authority")
    require(contract["architecture"]["goal_identity_proof"] == {"cross_binding": "NATIVE_THREADID_TO_FRESH_THREAD_GOALS_ROW_AFTER_EXACT_NATIVE_ACTION_SEQUENCE", "durable_goal_uuid_source": "READ_ONLY_CODEX_GOALS_DATABASE_THREAD_GOALS.GOAL_ID", "native_projection_identity_field": "threadId"}, "contract identity proof")
    require(design["failure_source"] == {"bytes": V16_FAILURE[1], "mode": "0644", "path": V16_FAILURE[0], "sha256": V16_FAILURE[2]}, "design failure binding")
    require(failure["status"] == "FAIL_PERMANENT_ZERO_CREDIT_NO_RETRY" and failure["diagnosis"]["family"] == "HISTORICAL_BOOTSTRAP_REOPEN_PHASE_UNAWARE_SUBJECT_ABSENCE", "V16 failure preservation")
    harness = read_regular(base / HARNESS[0]).decode("utf-8")
    attestor = read_regular(base / ATTESTOR[0]).decode("utf-8")
    v15_harness = read_regular(base / V15_HARNESS[0]).decode("utf-8")
    v3_attestor = read_regular(base / V3_ATTESTOR[0]).decode("utf-8")
    harness_tree = ast.parse(harness, filename=HARNESS[0]); audit_phase_source(attestor)
    require('created["goal_id"]' not in attestor and 'reopened["goal_id"]' not in attestor, "stale native goal_id projection")
    require('created["threadId"] == reopened["threadId"] == goal["thread_id"] == thread_id' in attestor, "projection/DB thread cross-binding")
    require('created["createdAt"] == reopened["createdAt"] == goal["created_at_ms"] // 1000' in attestor, "projection/DB creation cross-binding")
    require('goal["goal_id"] not in snapshot["goal_ids"]' in attestor and 'thread_id not in snapshot["thread_ids"]' in attestor, "freshness cross-binding")
    require('result["goal"]["goal_id"]\n        == result["bootstrap"]["goal"]["goal_id"]\n        == result["scored"]["goal"]["goal_id"]' in attestor, "cross-turn durable goal binding")
    require('sqlite3.connect(f"file:{path}?mode=ro", uri=True, timeout=5)' in v3_attestor and 'con.execute("PRAGMA query_only=ON")' in v3_attestor, "read-only Goal DB")
    require('SELECT * FROM thread_goals WHERE thread_id=?' in v3_attestor, "Goal DB thread lookup")
    require(v15_harness.index('"bootstrap_attestation.json"') < v15_harness.index("os.mkfifo") < v15_harness.index('"scored_prompt.txt"'), "subject release ordering")
    wrapper_popen = [node for node in ast.walk(harness_tree) if isinstance(node, ast.Call) and isinstance(node.func, ast.Attribute) and node.func.attr == "Popen"]
    require(not wrapper_popen and "create_thread" not in harness and "spawn_agent" not in harness, "wrapper process scope")
    require('v15._load_admission = _load_admission' in harness and 'v15.check = check' in harness, "V17 wrapper dispatch")
    return {
        "authority": {"canary_admission_eligible": True, "canary_launch": False, "matrix_launch": False, "qualification_credit": 0},
        "bindings": bindings,
        "checks": {
            "cross_turn_goal_id": "PASS_STATIC",
            "native_projection_closed_shape_mutations": projection_mutations(),
            "phase_aware_source_mutations": phase_source_mutations(attestor),
            "preserved_v16_read_only_replay": run_preserved_v16_replay(base),
            "read_only_goal_database": "PASS_STATIC_MODE_RO_QUERY_ONLY",
            "subject_release_order": "PASS_STATIC_AFTER_BOOTSTRAP_ATTESTATION",
            "target_check": run_target_check(base),
        },
        "first_mismatch": None,
        "lineage": {"qualification_streak_clean_matrices": 0, "v14_matrix_001": "PERMANENT_FAIL_ZERO_CREDIT", "v15_canary_001": "PERMANENT_FAIL_ZERO_CREDIT_NO_RETRY", "v16_canary_001": "PERMANENT_FAIL_ZERO_CREDIT_NO_RETRY"},
        "omp_lane": {"duplicate_spawn": False, "host": "WINDOWS", "launch_argv": ["omp", "--cwd", "P:\\"], "linux_process_inference": False, "status": "EXISTING_EXTERNAL_CONTROLLER_UNTOUCHED"},
        "schema_id": SCHEMA,
        "status": "PASS_INDEPENDENT_STATIC_CHECK_V17_PHASE_AWARE_HISTORICAL_REOPEN_ZERO_CREDIT_NO_LAUNCH",
    }


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--base", type=Path, required=True)
    parser.add_argument("--check", action="store_true")
    args = parser.parse_args()
    try:
        require(args.check and args.base.is_absolute(), "CLI")
        result, rc = check(args.base), 0
    except (Invalid, OSError, UnicodeError, subprocess.SubprocessError, json.JSONDecodeError) as exc:
        result = {"error": str(exc), "first_mismatch": str(exc), "schema_id": SCHEMA, "status": "FAIL_ZERO_CREDIT_NO_LAUNCH"}
        rc = 1
    sys.stdout.buffer.write(canon(result))
    return rc


if __name__ == "__main__":
    raise SystemExit(main())
