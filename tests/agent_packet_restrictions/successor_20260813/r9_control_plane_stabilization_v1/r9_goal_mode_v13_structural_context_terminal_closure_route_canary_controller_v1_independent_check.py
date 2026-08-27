#!/usr/bin/env python3
"""Independent static and exact-argv checker for the V13 Goal canary controller."""

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


SCHEMA = "pw-r9-goal-mode-v13-structural-context-route-canary-controller-independent-check-v1"
CONTROLLER_NAME = "r9_goal_mode_v13_structural_context_terminal_closure_route_canary_controller_v1.py"
CONTROLLER_SHA256 = "34d30bcb768734d970d49127ff153bd7979d2b69cf60f7a12e1c4d158b9d0521"
CONTROLLER_BYTES = 25059
RUN_ID = "goal-mode-v13-structural-context-terminal-closure-canary-001"
INPUTS = "goal_mode_v13_structural_context_terminal_closure_canary_001_inputs"
HARNESS = "goal_mode_empirical_harness_v13"


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


def load_controller(path: Path) -> Any:
    spec = importlib.util.spec_from_file_location("_r9_v13_canary_controller_check_target", path)
    require(spec is not None and spec.loader is not None, "controller loader")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def audit_source(text: str) -> dict[str, Any]:
    tree = ast.parse(text)
    functions = {node.name for node in ast.walk(tree) if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef))}
    require({"row_argv", "launch_one", "run", "check", "main", "capture_quiescent"} <= functions, "required functions")
    calls = [node for node in ast.walk(tree) if isinstance(node, ast.Call)]
    popen = [node for node in calls if isinstance(node.func, ast.Attribute) and node.func.attr == "Popen"]
    require(len(popen) == 1, "one controller Popen")
    require("ThreadPoolExecutor" not in text and "spawn_agent" not in text and "create_thread" not in text, "no parallel/delegated launch")
    require('RUN_ID = "goal-mode-v13-structural-context-terminal-closure-canary-001"' in text, "run ID")
    require('HARNESS = BASE / "goal_mode_empirical_harness_v13"' in text, "V13 harness")
    require('MAX_PARALLEL = 1' in text and 'ROW_COUNT = 3' in text, "serial cardinality")
    require('r9_goal_mode_v13_structural_context_terminal_closure_canary_001_row_{index:03d}_admission_v1.json' in text, "V13 row admission projection")
    require('CODEX_NATIVE_GOAL_SCORED_TURN_THEN_SAME_TASK_TERMINAL_CLOSURE_PREFIX_AND_STRUCTURAL_CONTEXT_AWARE_V3' in text, "V13 adapter")
    require('STRUCTURAL_SOURCE_WRAPPER_EXACT_OBJECTIVE_ORDERED_SECTIONS_NO_PRIOR_WORK_V1' in text, "structural context contract")
    require('if receipt["status"] != "PASS":\n            break' in text, "fail-fast break")
    require('"existing_launch": "omp --cwd P:\\\\"' in text and '"linux_process_inference": False' in text, "OMP boundary")
    require('subprocess.Popen(' in text and 'start_new_session=True' in text and 'stdin=subprocess.DEVNULL' in text, "bounded process launch")
    require('v12_prefix_aware_terminal_closure_canary_001_row_{index' not in text, "no V12 row argv")
    require('v11_prefix_aware_terminal_closure_canary_001_row_{index' not in text, "no V11 row argv")
    require('v10_terminal_closure_canary_001_row_{index' not in text, "no V10 row argv")
    require('["omp"' not in text and "Popen([\"omp\"" not in text, "no OMP launch")
    return {"functions": sorted(functions), "popen_sites": len(popen)}


def mutation_self_test(raw: bytes) -> list[dict[str, Any]]:
    text = raw.decode("utf-8")
    mutations = {
        "adapter_v2": text.replace("PREFIX_AND_STRUCTURAL_CONTEXT_AWARE_V3", "PREFIX_AWARE_V2", 1),
        "admission_v12": text.replace("r9_goal_mode_v13_structural_context_terminal_closure_canary_001_row_{index:03d}_admission_v1.json", "r9_goal_mode_v12_prefix_aware_terminal_closure_canary_001_row_{index:03d}_admission_v1.json", 1),
        "drop_fail_fast": text.replace('if receipt["status"] != "PASS":\n            break', 'if False:\n            break', 1),
        "harness_v11": text.replace('HARNESS = BASE / "goal_mode_empirical_harness_v13"', 'HARNESS = BASE / "goal_mode_empirical_harness_v11"', 1),
        "max_parallel_two": text.replace('MAX_PARALLEL = 1', 'MAX_PARALLEL = 2', 1),
        "run_id_v12": text.replace(RUN_ID, "goal-mode-v12-prefix-aware-terminal-closure-canary-001", 1),
        "structural_context_removed": text.replace("STRUCTURAL_SOURCE_WRAPPER_EXACT_OBJECTIVE_ORDERED_SECTIONS_NO_PRIOR_WORK_V1", "LEGACY_PROSE_SENTENCE", 1),
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


def exact_argv(module: Any, base: Path) -> list[dict[str, Any]]:
    args = argparse.Namespace(
        codex_home=Path("/accepted/codex-home"),
        codex=Path("/accepted/codex"),
        workspace=Path("/accepted/workspace"),
        row_timeout_seconds=1200,
    )
    projections: list[dict[str, Any]] = []
    for index in range(3):
        capture = Path("/accepted/capture") / f"row-{index:03d}"
        expected = [
            sys.executable,
            "-B",
            str(base / HARNESS / "goal_mode_harness.py"),
            "run-codex-row",
            "--row-spec",
            str(base / INPUTS / f"row-{index:03d}.row.json"),
            "--subject",
            str(base / INPUTS / f"row-{index:03d}.subject.txt"),
            "--admission",
            str(base / f"r9_goal_mode_v13_structural_context_terminal_closure_canary_001_row_{index:03d}_admission_v1.json"),
            "--capture-root",
            str(capture),
            "--codex-home",
            str(args.codex_home),
            "--codex",
            str(args.codex),
            "--workspace",
            str(args.workspace),
            "--timeout-seconds",
            "1200",
        ]
        actual = module.row_argv(index, args, capture)
        require(actual == expected, f"exact argv mismatch:{index}")
        raw = canon(actual)[:-1]
        projections.append({"bytes": len(raw), "index": index, "sha256": sha(raw)})
    return projections


def run_controller_check(base: Path, controller: Path) -> dict[str, Any]:
    process = subprocess.run(
        [sys.executable, "-B", str(controller), "check"],
        stdin=subprocess.DEVNULL,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        cwd=base,
        env={**os.environ, "PYTHONDONTWRITEBYTECODE": "1"},
        timeout=60,
        check=False,
    )
    require(process.returncode == 0 and process.stderr == b"", "controller check process")
    result = json.loads(process.stdout, object_pairs_hook=pairs)
    require(process.stdout == canon(result), "controller check canonical")
    require(
        result.get("schema_id") == "pw-r9-goal-mode-v13-structural-context-route-canary-controller-check-v1"
        and result.get("status") == "PASS_STATIC_V13_STRUCTURAL_GOAL_CONTEXT_EXACT_ROW_ARGV_ZERO_CREDIT_NO_LAUNCH"
        and len(result.get("checks", {}).get("exact_row_argv_projections", [])) == 3,
        "controller check result",
    )
    return {"rc": process.returncode, "stderr": {"bytes": len(process.stderr), "sha256": sha(process.stderr)}, "stdout": {"bytes": len(process.stdout), "sha256": sha(process.stdout)}}


def check(base: Path) -> dict[str, Any]:
    controller = base / CONTROLLER_NAME
    raw = read_regular(controller)
    require(len(raw) == CONTROLLER_BYTES and sha(raw) == CONTROLLER_SHA256, "controller identity")
    require(stat.S_IMODE(os.lstat(controller).st_mode) == 0o644, "controller mode")
    text = raw.decode("utf-8")
    source = audit_source(text)
    module = load_controller(controller)
    require(module.RUN_ID == RUN_ID and module.ROW_COUNT == 3 and module.MAX_PARALLEL == 1, "module constants")
    return {
        "authority": {"canary_admission_eligible": True, "canary_launch": False, "matrix_launch": False, "qualification_credit": 0},
        "checks": {
            "controller_process": run_controller_check(base, controller),
            "exact_row_argv_projections": exact_argv(module, base),
            "mutation_self_test": mutation_self_test(raw),
            "source": source,
        },
        "controller": {"bytes": len(raw), "mode": "0644", "path": CONTROLLER_NAME, "sha256": sha(raw)},
        "first_mismatch": None,
        "lineage": {"matrix005": "PERMANENT_FAIL", "matrix006": "INVALIDATED", "v10": "PERMANENT_FAIL", "v11": "PERMANENT_FAIL", "v12": "PERMANENT_FAIL"},
        "omp_lane": {"duplicate_launch": False, "launch_boundary": "omp --cwd P:\\", "linux_process_inference": False, "status": "UNTOUCHED"},
        "schema_id": SCHEMA,
        "status": "PASS_INDEPENDENT_STATIC_CHECK_V13_STRUCTURAL_GOAL_CONTEXT_EXACT_ROW_ARGV_ZERO_CREDIT_NO_LAUNCH",
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
