#!/usr/bin/env python3
"""Independent static checker for the V19 canary runtime verifier."""

from __future__ import annotations

import argparse
import ast
import hashlib
import json
import os
from pathlib import Path
import stat
import sys
from typing import Any


SCHEMA = "pw-r9-goal-mode-v19-three-turn-route-canary-runtime-verifier-independent-check-v1"
TARGET = "r9_goal_mode_v19_three_turn_route_canary_independent_runtime_verify_v1.py"
TARGET_BYTES = 19625
TARGET_SHA256 = "494a3369fc246d50938a4fd021c4f0d31e529b782e3f9ac6f251d98c81ff8888"


class Invalid(RuntimeError):
    pass


def require(ok: bool, message: str) -> None:
    if not ok:
        raise Invalid(message)


def canon(value: Any) -> bytes:
    return json.dumps(value, ensure_ascii=False, allow_nan=False, sort_keys=True, separators=(",", ":")).encode("utf-8") + b"\n"


def sha(raw: bytes) -> str:
    return hashlib.sha256(raw).hexdigest()


def dotted(node: ast.AST) -> str:
    if isinstance(node, ast.Name):
        return node.id
    if isinstance(node, ast.Attribute):
        prefix = dotted(node.value)
        return f"{prefix}.{node.attr}" if prefix else node.attr
    return ""


def read_regular(path: Path) -> bytes:
    before = os.lstat(path)
    require(stat.S_ISREG(before.st_mode) and not path.is_symlink() and before.st_size <= 64_000_000, "target custody")
    raw = path.read_bytes()
    after = os.lstat(path)
    require((before.st_dev, before.st_ino, before.st_size, before.st_mtime_ns) == (after.st_dev, after.st_ino, after.st_size, after.st_mtime_ns), "target drift")
    return raw


def audit_source(text: str) -> dict[str, Any]:
    tree = ast.parse(text)
    functions = {node.name for node in ast.walk(tree) if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef))}
    require({"connect_ro", "inventory", "load_attestor", "main", "verify", "verify_sources"} <= functions, "required functions")
    require('sqlite3.connect(f"file:{path}?mode=ro", uri=True, timeout=5)' in text, "read-only database")
    require("after = inventory(args.evidence)" in text and 'require(after == before, "evidence inventory drift")' in text, "before/after evidence")
    require('stored["bootstrap"]["goal"].get("goal_id_source") == "READ_ONLY_CODEX_GOALS_DATABASE_THREAD_GOALS.GOAL_ID"' in text, "Goal UUID source")
    require('stored["bootstrap"]["goal"].get("native_projection_identity_field") == "threadId"' in text, "native identity field")
    require('stored["bootstrap"]["goal"]["goal_id"] == stored["scored"]["goal"]["goal_id"] == goal["goal_id"]' in text, "same Goal all turns")
    require('stored.get("bootstrap", {}).get("goal", {}).get("status") == "active"' in text, "historical bootstrap phase")
    require('stored.get("scored", {}).get("goal", {}).get("status") == "active"' in text, "historical scored phase")
    require('isinstance(stored.get("scored", {}).get("reader_output_line"), int)' in text, "durable reader output")
    require('reopened = attestor.reopen_final(row_path, capture, args.codex_home)' in text, "pure sealed reopen entrypoint")
    require('attestor.attest_final' not in text, "stateful pre-final attestor forbidden")
    require('reopened == stored == harness_result.get("attestation")' in text, "independent attestation reopen")
    require('NESTED_CODE_EXACT_ORDERED_BATCH' in text and 'DIRECT_NATIVE_FUNCTION' in text, "closed Goal transport representations")
    require('"pre_model_runtime_preflight": {' in text and '"runtime_api_missing": []' in text and '"validated_rows": 3' in text, "executed pre-model runtime preflight terminal binding")
    require('goal.get("status") == "complete"' in text, "terminal Goal state")
    require('len(set(thread_ids)) == 3 and len(set(goal_ids)) == 3 and len(set(turn_ids)) == 9' in text, "cross-row uniqueness")
    require('"qualification_credit": 0' in text and '"matrix_launch": False' in text, "zero credit/launch")
    forbidden = []
    for node in ast.walk(tree):
        if not isinstance(node, ast.Call):
            continue
        qualified = dotted(node.func)
        name = node.func.attr if isinstance(node.func, ast.Attribute) else node.func.id if isinstance(node.func, ast.Name) else ""
        if name in {"Popen", "run", "write_bytes", "write_text", "unlink", "mkdir", "replace", "rename"}:
            forbidden.append(name)
        if name == "write" and qualified != "sys.stdout.buffer.write":
            forbidden.append(qualified or name)
        if name == "open" and len(node.args) >= 2 and isinstance(node.args[1], ast.Constant) and isinstance(node.args[1].value, str) and any(flag in node.args[1].value for flag in "wax+"):
            forbidden.append("open-write")
    require(not forbidden, f"mutation/process calls:{forbidden}")
    return {"functions": sorted(functions), "forbidden_calls": forbidden}


def mutations(text: str) -> list[dict[str, str]]:
    variants = {
        "drop_inventory_postflight": text.replace('require(after == before, "evidence inventory drift")', 'require(True, "evidence inventory drift")', 1),
        "goal_source_fabricated": text.replace("READ_ONLY_CODEX_GOALS_DATABASE_THREAD_GOALS.GOAL_ID", "CALLER_AUTHORED_GOAL_ID"),
        "historical_bootstrap_phase_unchecked": text.replace('stored.get("bootstrap", {}).get("goal", {}).get("status") == "active"', "True", 1),
        "independent_reopen_unbound": text.replace('reopened == stored == harness_result.get("attestation")', "True", 1),
        "stateful_pre_final_reopen": text.replace("attestor.reopen_final", "attestor.attest_final", 1),
        "runtime_preflight_unbound": text.replace('"pre_model_runtime_preflight": {', '"pre_model_runtime_preflight_removed": {', 1),
        "ordered_batch_transport_removed": text.replace('NESTED_CODE_EXACT_ORDERED_BATCH', 'NESTED_CODE_SINGLE_CALL_ONLY'),
        "qualification_one": text.replace('"qualification_credit": 0', '"qualification_credit": 1'),
        "reader_output_unbound": text.replace('isinstance(stored.get("scored", {}).get("reader_output_line"), int)', "True", 1),
        "sqlite_readwrite": text.replace("?mode=ro", "?mode=rw", 1),
    }
    result: list[dict[str, str]] = []
    for name, mutant in sorted(variants.items()):
        require(mutant != text, f"mutation applied:{name}")
        rejected = False
        try:
            audit_source(mutant)
        except (Invalid, SyntaxError):
            rejected = True
        require(rejected, f"mutation survived:{name}")
        result.append({"mutation": name, "status": "REJECTED"})
    return result


def check(base: Path) -> dict[str, Any]:
    path = base / TARGET
    raw = read_regular(path)
    require(len(raw) == TARGET_BYTES and sha(raw) == TARGET_SHA256 and stat.S_IMODE(os.lstat(path).st_mode) == 0o644, "target identity")
    text = raw.decode("utf-8")
    return {
        "authority": {"canary_launch": False, "matrix_launch": False, "qualification_credit": 0},
        "checks": {"mutation_self_test": mutations(text), "source": audit_source(text)},
        "first_mismatch": None,
        "schema_id": SCHEMA,
        "status": "PASS_INDEPENDENT_STATIC_CHECK_V19_READ_ONLY_RUNTIME_VERIFIER_ZERO_CREDIT_NO_LAUNCH",
        "target": {"bytes": len(raw), "mode": "0644", "path": TARGET, "sha256": sha(raw)},
    }


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--base", type=Path, required=True)
    parser.add_argument("--check", action="store_true")
    args = parser.parse_args()
    try:
        require(args.check and args.base.is_absolute(), "CLI")
        result, rc = check(args.base), 0
    except (Invalid, OSError, UnicodeError, SyntaxError) as exc:
        result = {"error": str(exc), "first_mismatch": str(exc), "schema_id": SCHEMA, "status": "FAIL_ZERO_CREDIT_NO_LAUNCH"}
        rc = 1
    sys.stdout.buffer.write(canon(result))
    return rc


if __name__ == "__main__":
    raise SystemExit(main())
