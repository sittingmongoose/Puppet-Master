#!/usr/bin/env python3
"""Independent exact-argv check for the V12 Goal canary controller."""

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


SCHEMA = "pw-r9-goal-mode-v12-exact-row-argv-prefix-aware-terminal-closure-route-canary-controller-independent-check-v1"
CONTROLLER_NAME = "r9_goal_mode_v12_prefix_aware_terminal_closure_route_canary_controller_v1.py"
CONTROLLER_BYTES = 18825
CONTROLLER_SHA256 = "ac40afc7285d67b1802bb7ee8f65721e4d008b639852ede39784236bcc6dee88"
RUN_ID = "goal-mode-v12-prefix-aware-terminal-closure-canary-001"


class Invalid(RuntimeError):
    pass


def require(ok: bool, message: str) -> None:
    if not ok:
        raise Invalid(message)


def pairs(items: list[tuple[str, Any]]) -> dict[str, Any]:
    result: dict[str, Any] = {}
    for key, value in items:
        require(key not in result, f"duplicate JSON key:{key}")
        result[key] = value
    return result


def canon(value: Any) -> bytes:
    return json.dumps(value, ensure_ascii=False, allow_nan=False, sort_keys=True, separators=(",", ":")).encode() + b"\n"


def sha(raw: bytes) -> str:
    return hashlib.sha256(raw).hexdigest()


def read_regular(path: Path, limit: int = 64_000_000) -> bytes:
    before = os.lstat(path)
    require(stat.S_ISREG(before.st_mode) and not path.is_symlink() and before.st_size <= limit, f"unsafe file:{path}")
    raw = path.read_bytes()
    after = os.lstat(path)
    require(
        (before.st_dev, before.st_ino, before.st_size, before.st_mtime_ns)
        == (after.st_dev, after.st_ino, after.st_size, after.st_mtime_ns)
        and len(raw) == before.st_size,
        f"changing file:{path}",
    )
    return raw


def load_controller(path: Path) -> Any:
    spec = importlib.util.spec_from_file_location("_r9_v12_canary_controller_check_target", path)
    require(spec is not None and spec.loader is not None, "controller loader")
    module = importlib.util.module_from_spec(spec)
    sys.modules[spec.name] = module
    spec.loader.exec_module(module)
    return module


def audit_source(text: str) -> dict[str, Any]:
    tree = ast.parse(text, filename=CONTROLLER_NAME)
    functions = {node.name: node for node in tree.body if isinstance(node, ast.FunctionDef)}
    require({"row_argv", "launch_one", "run", "check", "main"} <= set(functions), "required functions")
    popens = [
        node
        for node in ast.walk(tree)
        if isinstance(node, ast.Call)
        and isinstance(node.func, ast.Attribute)
        and isinstance(node.func.value, ast.Name)
        and node.func.value.id == "subprocess"
        and node.func.attr == "Popen"
    ]
    require(len(popens) == 1, "Popen cardinality")
    require(any(isinstance(node, ast.Break) for node in ast.walk(functions["run"])), "fail-fast break")
    for marker in (
        'f"r9_goal_mode_v12_prefix_aware_terminal_closure_canary_001_row_{index:03d}_admission_v1.json"',
        'and len(argv) == 20',
        '"v10_terminal_closure_canary" not in joined',
        '"v11_prefix_aware_terminal_closure_canary_001_row" not in joined',
        '"v11_canary": "PERMANENT_FAIL_ZERO_CREDIT"',
        "MAX_PARALLEL = 1",
        '"max_parallel": 1',
        '"retry": False',
    ):
        require(marker in text, f"source marker:{marker}")
    require("r9_goal_mode_v10_terminal_closure_canary_001_row_{index" not in text, "V10 admission path")
    require("r9_goal_mode_v11_prefix_aware_terminal_closure_canary_001_row_{index" not in text, "V11 admission path")
    return {"ast": "PASS", "fail_fast_break": "PASS", "popen_sites": 1}


def source_mutations(raw: bytes) -> list[str]:
    text = raw.decode("utf-8")
    mutations = {
        "admission_v11": text.replace("r9_goal_mode_v12_prefix_aware_terminal_closure_canary_001_row_{index:03d}_admission_v1.json", "r9_goal_mode_v11_prefix_aware_terminal_closure_canary_001_row_{index:03d}_admission_v1.json", 1),
        "argv_length": text.replace("and len(argv) == 20", "and len(argv) == 22", 1),
        "drop_fail_fast": text.replace('        if receipt["status"] != "PASS":\n            break\n', '        if receipt["status"] != "PASS":\n            pass\n', 1),
        "drop_v10_rejection": text.replace('"v10_terminal_closure_canary" not in joined', 'True', 1),
        "drop_v11_rejection": text.replace('"v11_prefix_aware_terminal_closure_canary_001_row" not in joined', 'True', 1),
        "parallel_two": text.replace("MAX_PARALLEL = 1", "MAX_PARALLEL = 2", 1),
    }
    rejected: list[str] = []
    for name, mutant in mutations.items():
        require(mutant != text, f"mutation not applied:{name}")
        try:
            audit_source(mutant)
        except (Invalid, SyntaxError):
            rejected.append(name)
        else:
            raise Invalid(f"source mutation accepted:{name}")
    return rejected


def exact_argv(module: Any, base: Path) -> list[dict[str, Any]]:
    args = argparse.Namespace(
        codex_home=Path("/accepted/codex-home"),
        codex=Path("/accepted/codex"),
        workspace=Path("/accepted/workspace"),
        row_timeout_seconds=1200,
    )
    inputs = base / "goal_mode_v12_prefix_aware_terminal_closure_canary_001_inputs"
    harness = base / "goal_mode_empirical_harness_v11" / "goal_mode_harness.py"
    projections: list[dict[str, Any]] = []
    for index in range(3):
        capture = Path("/accepted/capture") / f"row-{index:03d}"
        expected = [
            sys.executable,
            "-B",
            str(harness),
            "run-codex-row",
            "--row-spec",
            str(inputs / f"row-{index:03d}.row.json"),
            "--subject",
            str(inputs / f"row-{index:03d}.subject.txt"),
            "--admission",
            str(base / f"r9_goal_mode_v12_prefix_aware_terminal_closure_canary_001_row_{index:03d}_admission_v1.json"),
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
        require(actual == expected and len(actual) == 20, f"exact argv:{index}")
        joined = "\x00".join(actual)
        require("v10_terminal_closure_canary" not in joined and "v11_prefix_aware_terminal_closure_canary_001_row" not in joined, f"predecessor argv:{index}")
        raw = canon(actual)[:-1]
        projections.append({"bytes": len(raw), "index": index, "sha256": sha(raw)})
    return projections


def run_controller_check(base: Path, controller: Path) -> dict[str, Any]:
    process = subprocess.run(
        [sys.executable, "-B", str(controller), "check"],
        cwd=base.parents[3],
        stdin=subprocess.DEVNULL,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        env={**os.environ, "PYTHONDONTWRITEBYTECODE": "1"},
        check=False,
        timeout=60,
    )
    require(process.returncode == 0 and process.stderr == b"", "controller check process")
    result = json.loads(process.stdout, object_pairs_hook=pairs)
    require(process.stdout == canon(result), "controller check canonical")
    require(
        result.get("status") == "PASS_STATIC_EXACT_ROW_ARGV_ZERO_CREDIT_NO_LAUNCH"
        and result.get("authority") == {"canary_launch": False, "matrix_launch": False, "qualification_credit": 0}
        and len(result.get("checks", {}).get("exact_row_argv_projections", [])) == 3
        and result.get("checks", {}).get("v10_and_v11_failures_preserved") is True,
        "controller check result",
    )
    return {
        "rc": process.returncode,
        "stderr_bytes": len(process.stderr),
        "stderr_sha256": sha(process.stderr),
        "stdout_bytes": len(process.stdout),
        "stdout_sha256": sha(process.stdout),
    }


def check(base: Path) -> dict[str, Any]:
    controller = base / CONTROLLER_NAME
    raw = read_regular(controller)
    require(len(raw) == CONTROLLER_BYTES and sha(raw) == CONTROLLER_SHA256, "controller identity")
    require(stat.S_IMODE(os.lstat(controller).st_mode) == 0o644, "controller mode")
    source = audit_source(raw.decode("utf-8"))
    module = load_controller(controller)
    require(module.RUN_ID == RUN_ID, "run ID")
    require(not (base / "goal_mode_v12_prefix_aware_terminal_closure_canary_001_evidence").exists(), "fresh evidence root")
    return {
        "authority": {"canary_admission_eligible": True, "canary_launch": False, "matrix_launch": False, "qualification_credit": 0},
        "checks": {
            "controller_process": run_controller_check(base, controller),
            "exact_row_argv_projections": exact_argv(module, base),
            "source": source,
            "source_mutations_rejected": source_mutations(raw),
        },
        "controller": {"bytes": len(raw), "mode": "0644", "path": CONTROLLER_NAME, "sha256": sha(raw)},
        "first_mismatch": None,
        "lineage": {"v10_canary": "PERMANENT_FAIL_ZERO_CREDIT", "v11_canary": "PERMANENT_FAIL_ZERO_CREDIT"},
        "omp_lane": {"duplicate_spawn": False, "host": "WINDOWS", "launch_argv": ["omp", "--cwd", "P:\\"], "linux_process_inference": False},
        "schema_id": SCHEMA,
        "status": "PASS_INDEPENDENT_EXACT_ROW_ARGV_CHECK_ZERO_CREDIT_NO_LAUNCH",
    }


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--base", type=Path, required=True)
    parser.add_argument("--check", action="store_true")
    args = parser.parse_args()
    try:
        require(args.check and args.base.is_absolute(), "CLI")
        result, rc = check(args.base), 0
    except (Invalid, OSError, subprocess.SubprocessError, UnicodeError, json.JSONDecodeError) as exc:
        result = {"first_mismatch": str(exc), "schema_id": SCHEMA, "status": "FAIL_ZERO_CREDIT_NO_LAUNCH"}
        rc = 1
    sys.stdout.buffer.write(canon(result))
    return rc


if __name__ == "__main__":
    raise SystemExit(main())
