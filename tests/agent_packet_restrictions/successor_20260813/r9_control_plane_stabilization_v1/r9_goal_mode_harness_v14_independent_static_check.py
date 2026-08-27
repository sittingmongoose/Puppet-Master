#!/usr/bin/env python3
"""Independent static checker for the V14 matrix-row Goal wrapper."""

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


SCHEMA = "pw-r9-goal-mode-harness-v14-independent-static-check-v1"
CONTRACT_SHA256 = "1cda52df95137a735bcdfd0deb72398ef08f3b8c5808486f1a0c2e8b762be76a"
CONTRACT_BYTES = 1168
HARNESS_SHA256 = "c0f147659ea0dc34bd2c8daf69fca6e51fba2396558312cad71b0bd51dbca3d4"
HARNESS_BYTES = 10096


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


def read_regular(path: Path, limit: int = 32_000_000) -> bytes:
    before = os.lstat(path)
    require(stat.S_ISREG(before.st_mode) and not path.is_symlink() and 0 <= before.st_size <= limit, f"unsafe file:{path}")
    raw = path.read_bytes()
    after = os.lstat(path)
    require((before.st_dev, before.st_ino, before.st_size, before.st_mtime_ns) == (after.st_dev, after.st_ino, after.st_size, after.st_mtime_ns), f"changing file:{path}")
    require(len(raw) == before.st_size, f"short read:{path}")
    return raw


def load_module(path: Path) -> Any:
    spec = importlib.util.spec_from_file_location("_r9_v14_harness_check_target", path)
    require(spec is not None and spec.loader is not None, "harness loader")
    module = importlib.util.module_from_spec(spec)
    sys.path.insert(0, str(path.parent))
    spec.loader.exec_module(module)
    return module


def audit_source(text: str) -> dict[str, Any]:
    tree = ast.parse(text)
    functions = {node.name for node in ast.walk(tree) if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef))}
    require({"_bindings", "_load_admission", "run_codex_row", "check", "main"} <= functions, "required functions")
    require('V13_ROOT = BASE / "goal_mode_empirical_harness_v13"' in text, "V13 base")
    require('return v13.make_row_spec(args)' in text and 'result = v13.run_codex_row(args)' in text, "V13 execution reuse")
    require(text.count('result = v13.run_codex_row(args)') == 1, "one V13 row execution")
    require('"canary_launch": False' in text and '"matrix_launch": True' in text, "matrix-only row admission")
    require('"launch_count": 1' in text and '"retry": False' in text and '"qualification": False' in text, "row admission limits")
    require('v13.v11.v10._load_admission = _load_admission' in text, "deep admission patch")
    require('PASS_INDEPENDENT_V14_MATRIX_ROW_NATIVE_GOAL_HARNESS_REVIEW' in text, "V14 admission status")
    require('PASS_NATIVE_GOAL_MATRIX_ROW_SCORED_TURN_SAME_TASK_TERMINAL_CLOSURE_PREFIX_AND_STRUCTURAL_CONTEXT_AWARE_ZERO_CREDIT' in text, "V14 result status")
    require('while v13.v11.v10._ACTIVE:' in text, "process cleanup")
    require('"omp", "--cwd", "P:\\\\"' in text and '"linux_process_inference": False' in text, "OMP boundary")
    require('subprocess.Popen' not in text and 'spawn_agent' not in text and 'create_thread' not in text, "no new execution adapter")
    return {"functions": sorted(functions), "v13_row_execution_calls": text.count('result = v13.run_codex_row(args)')}


def mutations(raw: bytes) -> list[dict[str, Any]]:
    text = raw.decode("utf-8")
    cases = {
        "canary_authority": text.replace('"canary_launch": False', '"canary_launch": True', 1),
        "matrix_denied": text.replace('"matrix_launch": True', '"matrix_launch": False', 1),
        "retry_enabled": text.replace('"retry": False', '"retry": True', 1),
        "v11_base": text.replace('V13_ROOT = BASE / "goal_mode_empirical_harness_v13"', 'V13_ROOT = BASE / "goal_mode_empirical_harness_v11"', 1),
        "v13_call_removed": text.replace('result = v13.run_codex_row(args)', 'result = {}', 1),
        "admission_patch_removed": text.replace('v13.v11.v10._load_admission = _load_admission', 'pass', 1),
    }
    result: list[dict[str, Any]] = []
    for name, changed in sorted(cases.items()):
        require(changed != text, f"mutation applied:{name}")
        rejected = False
        try:
            audit_source(changed)
        except (Invalid, SyntaxError):
            rejected = True
        require(rejected, f"mutation survived:{name}")
        result.append({"mutation": name, "status": "REJECTED"})
    return result


def run_harness_check(harness: Path, codex: Path) -> dict[str, Any]:
    process = subprocess.run([sys.executable, "-B", str(harness), "check", "--codex", str(codex)], stdin=subprocess.DEVNULL, stdout=subprocess.PIPE, stderr=subprocess.PIPE, env={**os.environ, "PYTHONDONTWRITEBYTECODE": "1"}, timeout=60, check=False)
    require(process.returncode == 0 and process.stderr == b"", "harness check process")
    value = json.loads(process.stdout, object_pairs_hook=pairs)
    require(process.stdout == canon(value), "harness check canonical")
    require(value.get("schema_id") == "pw-r9-goal-mode-harness-check-v14" and value.get("status") == "PASS_STATIC_MATRIX_ROW_NATIVE_GOAL_WRAPPER_DATA_ONLY_NO_LAUNCH_ZERO_CREDIT", "harness check result")
    return {"rc": 0, "stderr": {"bytes": 0, "sha256": sha(b"")}, "stdout": {"bytes": len(process.stdout), "sha256": sha(process.stdout)}}


def check(base: Path, codex: Path) -> dict[str, Any]:
    root = base / "goal_mode_empirical_harness_v14"
    contract = root / "goal_mode_contract.json"
    harness = root / "goal_mode_harness.py"
    contract_raw = read_regular(contract)
    harness_raw = read_regular(harness)
    require(len(contract_raw) == CONTRACT_BYTES and sha(contract_raw) == CONTRACT_SHA256 and stat.S_IMODE(os.lstat(contract).st_mode) == 0o644, "contract identity")
    require(len(harness_raw) == HARNESS_BYTES and sha(harness_raw) == HARNESS_SHA256 and stat.S_IMODE(os.lstat(harness).st_mode) == 0o644, "harness identity")
    module = load_module(harness)
    source = audit_source(harness_raw.decode("utf-8"))
    bindings = module._bindings()
    require(len(bindings) == 14 and all(item["mode"] == "0644" for item in bindings), "binding custody")
    return {
        "authority": {"matrix_harness_admission_eligible": True, "matrix_launch": False, "qualification_credit": 0},
        "bindings": bindings,
        "checks": {"harness_process": run_harness_check(harness, codex), "mutations_rejected": mutations(harness_raw), "source": source},
        "first_mismatch": None,
        "omp_lane": {"duplicate_spawn": False, "host": "WINDOWS", "launch_argv": ["omp", "--cwd", "P:\\"], "linux_process_inference": False, "status": "EXISTING_EXTERNAL_CONTROLLER_UNTOUCHED"},
        "schema_id": SCHEMA,
        "status": "PASS_INDEPENDENT_STATIC_CHECK_V14_MATRIX_ROW_NATIVE_GOAL_HARNESS_ZERO_CREDIT_NO_LAUNCH",
    }


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--base", type=Path, required=True)
    parser.add_argument("--codex", type=Path, required=True)
    parser.add_argument("--check", action="store_true")
    args = parser.parse_args()
    try:
        require(args.check and args.base.is_absolute() and args.codex.is_absolute(), "CLI")
        result, rc = check(args.base, args.codex), 0
    except (Invalid, OSError, UnicodeError, subprocess.SubprocessError, json.JSONDecodeError) as exc:
        result = {"error": str(exc), "first_mismatch": str(exc), "schema_id": SCHEMA, "status": "FAIL_ZERO_CREDIT_NO_LAUNCH"}
        rc = 1
    sys.stdout.buffer.write(canon(result))
    return rc


if __name__ == "__main__":
    raise SystemExit(main())
