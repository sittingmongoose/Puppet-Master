#!/usr/bin/env python3
"""Independent static/mutation check for the V10 terminal-closure canary controller."""

from __future__ import annotations

import argparse
import ast
import copy
import hashlib
import json
import os
from pathlib import Path
import stat
import subprocess
import sys
from typing import Any


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


def load(path: Path) -> Any:
    raw = path.read_bytes()
    value = json.loads(raw, object_pairs_hook=pairs, parse_constant=lambda item: (_ for _ in ()).throw(Invalid(item)))
    require(raw == canon(value), f"noncanonical:{path}")
    return value


def identity(path: Path, label: str) -> dict[str, Any]:
    before = os.lstat(path)
    require(stat.S_ISREG(before.st_mode) and not path.is_symlink(), f"unsafe:{label}")
    raw = path.read_bytes()
    after = os.lstat(path)
    require((before.st_dev, before.st_ino, before.st_size, before.st_mtime_ns) == (after.st_dev, after.st_ino, after.st_size, after.st_mtime_ns), f"changed:{label}")
    return {"bytes": len(raw), "mode": f"{stat.S_IMODE(before.st_mode):04o}", "path": label, "sha256": hashlib.sha256(raw).hexdigest()}


def functions(tree: ast.AST) -> dict[str, ast.FunctionDef | ast.AsyncFunctionDef]:
    return {node.name: node for node in ast.walk(tree) if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef))}


def segment(text: str, tree: ast.AST, name: str) -> str:
    node = functions(tree).get(name)
    require(node is not None, f"missing function:{name}")
    result = ast.get_source_segment(text, node)
    require(isinstance(result, str), f"source segment:{name}")
    return result


def validate(controller: str, manifest: dict[str, Any]) -> None:
    tree = ast.parse(controller)
    require('RUN_ID = "goal-mode-v10-terminal-closure-canary-001"' in controller, "run ID")
    require("ROW_COUNT = 3" in controller and "MAX_PARALLEL = 1" in controller, "controller cardinality")
    require(
        manifest.get("schema_id") == "pw-r9-goal-mode-v10-terminal-closure-route-canary-input-manifest-v1"
        and manifest.get("status") == "PREDECLARED_ZERO_CREDIT_NO_LAUNCH"
        and manifest.get("run_id") == "goal-mode-v10-terminal-closure-canary-001"
        and manifest.get("row_count") == 3
        and manifest.get("max_parallel") == 1,
        "manifest envelope",
    )
    require(
        manifest.get("authority")
        == {"canary_launch": False, "matrix_launch": False, "qualification_credit": 0, "qualification_streak_clean_matrices": 0},
        "manifest authority",
    )
    require(
        manifest.get("isolation")
        == {
            "between_rows": "FULL_SCORED_AND_CLOSURE_PROCESS_EXIT_CAPTURE_CLOSE_READER_QUIESCENCE",
            "fail_fast": True,
            "max_parallel": 1,
            "mode": "SERIAL_FRESH_TASK_FRESH_GOAL_PER_ROW",
            "retry": False,
            "subject_deliveries_per_row": 1,
        },
        "manifest isolation",
    )
    require(manifest.get("lineage", {}).get("matrix_006") == "INVALIDATED_NO_LAUNCH_AUTHORITY", "Matrix006")
    require(
        manifest.get("omp_boundary")
        == {
            "duplicate_launch": False,
            "existing_launch": "omp --cwd P:\\",
            "linux_process_inference": False,
            "native_goal_required_per_fresh_omp_test_taker": True,
            "status": "PRESERVED_UNTOUCHED",
        },
        "OMP boundary",
    )
    routes = [("slot-alpha", "gpt-5.4-mini", "xhigh"), ("slot-bravo", "gpt-5.4-mini", "medium"), ("slot-charlie", "gpt-5.6-luna", "medium")]
    require(
        [(row["route"], row["model"], row["reasoning_effort"]) for row in manifest["rows"]] == routes,
        "route roster",
    )
    popen_calls = [
        node
        for node in ast.walk(tree)
        if isinstance(node, ast.Call) and isinstance(node.func, ast.Attribute) and node.func.attr == "Popen"
    ]
    require(len(popen_calls) == 1, "Popen site cardinality")
    row_argv = segment(controller, tree, "row_argv")
    require(
        'HARNESS / "goal_mode_harness.py"' in row_argv
        and '"run-codex-row"' in row_argv
        and '"--admission"' in row_argv
        and "omp" not in row_argv.lower(),
        "closed row launch",
    )
    quiescent = segment(controller, tree, "capture_quiescent")
    require(
        "scored_process_receipt.json" in quiescent
        and "closure_process_receipt.json" in quiescent
        and "goal_mode_attestation.json" in quiescent
        and 'attestation.get("goal", {}).get("status") == "complete"' in quiescent
        and '"processes": 2' in quiescent
        and 'not (capture / "subject.fifo").exists()' in quiescent,
        "two-phase quiescence",
    )
    launch = segment(controller, tree, "launch_one")
    require(
        'parsed.get("status") == "PASS_NATIVE_GOAL_SCORED_TURN_SAME_TASK_TERMINAL_CLOSURE_ZERO_CREDIT"' in launch
        and 'parsed["attestation"].get("status") == "PASS_SAME_TASK_TWO_TURN_NATIVE_GOAL_TERMINAL_CLOSURE_ZERO_CREDIT"' in launch
        and 'parsed["stderr_classification"].get("scored", {}).get("accepted") is True' in launch
        and 'parsed["stderr_classification"].get("closure", {}).get("accepted") is True' in launch
        and '"qualification_credit": 0' in launch,
        "closed row acceptance",
    )
    run = segment(controller, tree, "run")
    require(
        "for index in range(ROW_COUNT)" in run
        and 'if receipt["status"] != "PASS":\n            break' in run
        and 'args.max_parallel == MAX_PARALLEL' in run
        and '"retries": 0' in run
        and '"qualification_credit": 0' in run,
        "serialized fail-fast accounting",
    )
    check = segment(controller, tree, "check")
    require("Popen" not in check and '"canary_launch": False' in check and '"matrix_launch": False' in check, "check zero launch")


def mutate_text(text: str, old: str, new: str) -> str:
    require(old in text, f"mutation source absent:{old}")
    return text.replace(old, new, 1)


def run(args: argparse.Namespace) -> dict[str, Any]:
    base = args.base.resolve()
    controller_path = base / "r9_goal_mode_v10_terminal_closure_route_canary_controller_v1.py"
    manifest_path = base / "goal_mode_v10_terminal_closure_canary_001_inputs" / "manifest.json"
    controller = controller_path.read_text(encoding="utf-8")
    manifest = load(manifest_path)
    validate(controller, manifest)
    rejected: list[str] = []
    mutations = [
        ("parallelism", "MAX_PARALLEL = 1", "MAX_PARALLEL = 2"),
        ("row_count", "ROW_COUNT = 3", "ROW_COUNT = 2"),
        ("harness_surface", '"run-codex-row"', '"not-run-codex-row"'),
        ("fail_fast", 'if receipt["status"] != "PASS":\n            break', 'if False:\n            break'),
        ("scored_acceptance", 'parsed.get("status") == "PASS_NATIVE_GOAL_SCORED_TURN_SAME_TASK_TERMINAL_CLOSURE_ZERO_CREDIT"', "True"),
        ("closure_acceptance", 'parsed["attestation"].get("status") == "PASS_SAME_TASK_TWO_TURN_NATIVE_GOAL_TERMINAL_CLOSURE_ZERO_CREDIT"', "True"),
        ("scored_stderr", 'parsed["stderr_classification"].get("scored", {}).get("accepted") is True', "True"),
        ("closure_stderr", 'parsed["stderr_classification"].get("closure", {}).get("accepted") is True', "True"),
        ("goal_complete", 'attestation.get("goal", {}).get("status") == "complete"', "True"),
        ("subject_fifo", 'not (capture / "subject.fifo").exists()', "True"),
        (
            "qualification_credit",
            '{"external_matrix_qualification_required": True, "qualification_credit": 0}',
            '{"external_matrix_qualification_required": True, "qualification_credit": 1}',
        ),
    ]
    for name, old, new in mutations:
        try:
            validate(mutate_text(controller, old, new), manifest)
        except Invalid:
            rejected.append(name)
        else:
            raise Invalid(f"mutation accepted:{name}")
    manifest_mutations = [
        ("manifest_launch", ("authority", "canary_launch"), True),
        ("manifest_retry", ("isolation", "retry"), True),
        ("matrix006", ("lineage", "matrix_006"), "PENDING"),
        ("omp_duplicate", ("omp_boundary", "duplicate_launch"), True),
        ("omp_linux", ("omp_boundary", "linux_process_inference"), True),
    ]
    for name, path, value in manifest_mutations:
        mutated = copy.deepcopy(manifest)
        cursor = mutated
        for key in path[:-1]:
            cursor = cursor[key]
        cursor[path[-1]] = value
        try:
            validate(controller, mutated)
        except Invalid:
            rejected.append(name)
        else:
            raise Invalid(f"manifest mutation accepted:{name}")
    evidence = base / "goal_mode_v10_terminal_closure_canary_001_evidence"
    require(not evidence.exists(), "canary evidence already exists")
    env = dict(os.environ)
    env["PYTHONDONTWRITEBYTECODE"] = "1"
    completed = subprocess.run(
        [sys.executable, "-B", str(controller_path), "check"],
        cwd=base,
        stdin=subprocess.DEVNULL,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        check=False,
        timeout=30,
        env=env,
    )
    require(completed.returncode == 0 and completed.stderr == b"", "controller check execution")
    checked = json.loads(completed.stdout, object_pairs_hook=pairs)
    require(checked.get("status") == "PASS_STATIC_ZERO_CREDIT_NO_LAUNCH", "controller check status")
    require(not evidence.exists(), "controller check wrote evidence")
    return {
        "authority": {
            "canary_admission_eligible": True,
            "canary_launch": False,
            "matrix_launch": False,
            "qualification_credit": 0,
            "qualification_streak_clean_matrices": 0,
            "release": False,
        },
        "bindings": checked["bindings"],
        "checks": {
            "fail_fast": "PASS_STATIC",
            "goal_terminal_closure": "PASS_STATIC_TWO_PROCESSES_SAME_TASK_DISTINCT_TURNS",
            "matrix006_invalidated": True,
            "max_parallel": 1,
            "no_omp_launch_or_linux_inference": "PASS_STATIC",
            "no_retry": "PASS_STATIC",
            "popen_sites": 1,
            "routes": ["slot-alpha", "slot-bravo", "slot-charlie"],
        },
        "controller_check": {
            "rc": completed.returncode,
            "stderr_bytes": len(completed.stderr),
            "stderr_sha256": hashlib.sha256(completed.stderr).hexdigest(),
            "stdout_bytes": len(completed.stdout),
            "stdout_sha256": hashlib.sha256(completed.stdout).hexdigest(),
            "workspace_writes": 0,
        },
        "first_mismatch": None,
        "mutations_rejected": rejected,
        "schema_id": "pw-r9-goal-mode-v10-terminal-closure-route-canary-controller-independent-check-v1",
        "status": "PASS_INDEPENDENT_STATIC_CHECK_V10_TERMINAL_CLOSURE_ROUTE_CANARY_ZERO_CREDIT_NO_LAUNCH",
    }


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--base", type=Path, required=True)
    parser.add_argument("--check", action="store_true", required=True)
    args = parser.parse_args()
    try:
        result = run(args)
        rc = 0
    except (Invalid, OSError, UnicodeError, subprocess.SubprocessError) as exc:
        result = {
            "authority": {"canary_launch": False, "matrix_launch": False, "qualification_credit": 0},
            "error": str(exc),
            "first_mismatch": str(exc),
            "schema_id": "pw-r9-goal-mode-v10-terminal-closure-route-canary-controller-independent-check-v1",
            "status": "FAIL_INDEPENDENT_STATIC_CHECK_ZERO_CREDIT_NO_LAUNCH",
        }
        rc = 1
    sys.stdout.buffer.write(canon(result))
    return rc


if __name__ == "__main__":
    raise SystemExit(main())
