#!/usr/bin/env python3
"""Independent static checker for the V16 canary runtime verifier."""

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


SCHEMA = "pw-r9-goal-mode-v16-three-turn-route-canary-runtime-verifier-independent-check-v1"
TARGET = "r9_goal_mode_v16_three_turn_route_canary_independent_runtime_verify_v1.py"
TARGET_BYTES = 17585
TARGET_SHA256 = "9c912feaa2d8491bf169a5808f1e9957346de738ef44dd52e73b7c8dccbc1d76"


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
        "qualification_one": text.replace('"qualification_credit": 0', '"qualification_credit": 1'),
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
        "status": "PASS_INDEPENDENT_STATIC_CHECK_V16_READ_ONLY_RUNTIME_VERIFIER_ZERO_CREDIT_NO_LAUNCH",
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
