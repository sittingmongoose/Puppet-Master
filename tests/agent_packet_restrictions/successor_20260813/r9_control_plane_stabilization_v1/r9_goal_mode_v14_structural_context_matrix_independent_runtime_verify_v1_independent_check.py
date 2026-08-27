#!/usr/bin/env python3
"""Independent static checker for the read-only V14 matrix runtime verifier."""

from __future__ import annotations

import argparse
import ast
import hashlib
import json
import os
from pathlib import Path
import stat
import subprocess
import sys
from typing import Any


SCHEMA = "pw-r9-goal-mode-v14-structural-context-matrix-runtime-verifier-independent-check-v1"
VERIFIER_NAME = "r9_goal_mode_v14_structural_context_matrix_independent_runtime_verify_v1.py"
VERIFIER_SHA256 = "6a738a2dd51ad56398bf3a2597d49cb84f5b927437e44113245eebee5f41aee3"
VERIFIER_BYTES = 26679


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


def canon(value: Any) -> bytes:
    return json.dumps(value, ensure_ascii=False, allow_nan=False, sort_keys=True, separators=(",", ":")).encode("utf-8") + b"\n"


def sha(raw: bytes) -> str:
    return hashlib.sha256(raw).hexdigest()


def read_regular(path: Path, limit: int = 64_000_000) -> bytes:
    before = os.lstat(path)
    require(stat.S_ISREG(before.st_mode) and not path.is_symlink() and 0 <= before.st_size <= limit, f"unsafe file:{path}")
    raw = path.read_bytes()
    after = os.lstat(path)
    require((before.st_dev, before.st_ino, before.st_size, before.st_mtime_ns) == (after.st_dev, after.st_ino, after.st_size, after.st_mtime_ns), f"changing file:{path}")
    require(len(raw) == before.st_size, f"short read:{path}")
    return raw


def audit_source(text: str) -> dict[str, Any]:
    tree = ast.parse(text)
    functions = {node.name for node in ast.walk(tree) if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef))}
    required = {"inventory", "load_attestor", "connect_ro", "source_preflight", "prior_identities", "verify", "check", "main"}
    require(required <= functions, "required functions")
    forbidden_attributes = {"chmod", "mkdir", "makedirs", "open", "remove", "rename", "replace", "rmdir", "unlink", "write_bytes", "write_text"}
    forbidden_calls: list[str] = []
    stdout_writes = 0
    for node in ast.walk(tree):
        if not isinstance(node, ast.Call):
            continue
        if isinstance(node.func, ast.Attribute) and node.func.attr in forbidden_attributes:
            forbidden_calls.append(node.func.attr)
        if isinstance(node.func, ast.Attribute) and node.func.attr == "write":
            if ast.unparse(node.func) == "sys.stdout.buffer.write":
                stdout_writes += 1
            else:
                forbidden_calls.append("write")
        if isinstance(node.func, ast.Name) and node.func.id in {"open"}:
            forbidden_calls.append(node.func.id)
    require(not forbidden_calls, f"filesystem mutation calls:{forbidden_calls}")
    require(stdout_writes == 1, "exact stdout emitter")
    require("subprocess" not in text and "Popen" not in text and "spawn_agent" not in text and "create_thread" not in text, "no process/delegation")
    require('MATRIX_IDS = (\n    "goal-mode-v14-structural-context-matrix-001",\n    "goal-mode-v14-structural-context-matrix-002",\n)' in text, "matrix IDs")
    require("ROW_COUNT = 291" in text and 'before["files"] == 6403 and before["directories"] == 293' in text, "matrix cardinality")
    require('sqlite3.connect(f"file:{path}?mode=ro"' in text, "read-only SQLite")
    require('reopened == stored == harness_result.get("attestation")' in text, "independent attestor reopen")
    require('thread_id not in prior_threads | current_threads' in text and 'goal_id not in prior_goals | current_goals' in text, "cross-run freshness")
    require('goal_rows[0]["status"] == "complete"' in text and 'goal_rows[0]["objective"] == row["objective"]' in text, "terminal Goal DB state")
    require('after == before' in text, "inventory postflight")
    require('qualification_credit = 0 if streak == 1 else 2' in text, "two-matrix qualification bar")
    require('"launch_argv": ["omp", "--cwd", "P:\\\\"]' in text and '"linux_process_inference": False' in text, "OMP boundary")
    require('"external_matrix_qualification_required": True, "qualification_credit": 0' in text, "row zero credit")
    return {"filesystem_mutation_calls": len(forbidden_calls), "functions": sorted(functions), "process_launch_calls": 0}


def mutation_self_test(raw: bytes) -> list[dict[str, Any]]:
    text = raw.decode("utf-8")
    mutations = {
        "attestor_bypass": text.replace('reopened == stored == harness_result.get("attestation")', 'stored == harness_result.get("attestation")', 1),
        "evidence_files_6402": text.replace('before["files"] == 6403', 'before["files"] == 6402', 1),
        "goal_status_active": text.replace('goal_rows[0]["status"] == "complete"', 'goal_rows[0]["status"] == "active"', 1),
        "inventory_postflight_removed": text.replace("after == before", "True", 1),
        "matrix_002_reuse": text.replace("goal-mode-v14-structural-context-matrix-002", "goal-mode-v14-structural-context-matrix-001", 1),
        "prior_thread_check_removed": text.replace("thread_id not in prior_threads | current_threads", "thread_id not in current_threads", 1),
        "qualification_credit_one": text.replace("qualification_credit = 0 if streak == 1 else 2", "qualification_credit = 1", 1),
        "row_count_290": text.replace("ROW_COUNT = 291", "ROW_COUNT = 290", 1),
        "sqlite_rw": text.replace('?mode=ro"', '?mode=rw"', 1),
    }
    results: list[dict[str, Any]] = []
    for name, mutated in sorted(mutations.items()):
        require(mutated != text, f"mutation applied:{name}")
        rejected = False
        try:
            audit_source(mutated)
        except (Invalid, SyntaxError):
            rejected = True
        require(rejected, f"mutation survived:{name}")
        results.append({"mutation": name, "status": "REJECTED"})
    return results


def run_verifier_check(base: Path, verifier: Path) -> dict[str, Any]:
    process = subprocess.run(
        [sys.executable, "-B", str(verifier), "check"],
        stdin=subprocess.DEVNULL,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        cwd=base,
        env={**os.environ, "PYTHONDONTWRITEBYTECODE": "1"},
        timeout=60,
        check=False,
    )
    require(process.returncode == 0 and process.stderr == b"", "verifier check process")
    value = json.loads(process.stdout, object_pairs_hook=pairs)
    require(process.stdout == canon(value), "verifier check canonical")
    require(
        value.get("schema_id") == "pw-r9-goal-mode-v14-structural-context-matrix-independent-runtime-verifier-check-v1"
        and value.get("status") == "PASS_STATIC_DATA_ONLY_ZERO_CREDIT_NO_LAUNCH"
        and value.get("authority") == {"matrix_launch": False, "qualification_credit": 0, "release": False}
        and value.get("checks", {}).get("expected_files") == 6403
        and value.get("checks", {}).get("fresh_turn_ids_per_matrix") == 582,
        "verifier check result",
    )
    return {"rc": process.returncode, "stderr": {"bytes": len(process.stderr), "sha256": sha(process.stderr)}, "stdout": {"bytes": len(process.stdout), "sha256": sha(process.stdout)}}


def check(base: Path) -> dict[str, Any]:
    verifier = base / VERIFIER_NAME
    raw = read_regular(verifier)
    require(len(raw) == VERIFIER_BYTES and sha(raw) == VERIFIER_SHA256, "verifier identity")
    require(stat.S_IMODE(os.lstat(verifier).st_mode) == 0o644, "verifier mode")
    return {
        "authority": {"matrix_launch": False, "qualification_credit": 0, "runtime_verify_eligible": True},
        "checks": {
            "mutation_self_test": mutation_self_test(raw),
            "source": audit_source(raw.decode("utf-8")),
            "verifier_process": run_verifier_check(base, verifier),
        },
        "first_mismatch": None,
        "lineage": {"matrix005": "PERMANENT_FAIL", "matrix006": "INVALIDATED", "v13_canary": "PASS_ZERO_CREDIT"},
        "omp_lane": {"duplicate_launch": False, "launch_boundary": "omp --cwd P:\\", "linux_process_inference": False, "status": "UNTOUCHED"},
        "schema_id": SCHEMA,
        "status": "PASS_INDEPENDENT_STATIC_CHECK_V14_MATRIX_RUNTIME_VERIFIER_ZERO_CREDIT_NO_LAUNCH",
        "verifier": {"bytes": len(raw), "mode": "0644", "path": VERIFIER_NAME, "sha256": sha(raw)},
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
