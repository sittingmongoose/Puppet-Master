#!/usr/bin/env python3
"""V12 serialized Goal canary controller with locally owned exact row argv."""

from __future__ import annotations

import argparse
import importlib.util
import json
import os
from pathlib import Path
import subprocess
import sys
import time
from typing import Any


BASE = Path(__file__).resolve().parent
V11_CONTROLLER = BASE / "r9_goal_mode_v11_prefix_aware_terminal_closure_route_canary_controller_v1.py"
SPEC = importlib.util.spec_from_file_location("_r9_goal_mode_v11_canary_controller_failed", V11_CONTROLLER)
if SPEC is None or SPEC.loader is None:
    raise RuntimeError("V11 controller loader unavailable")
v11 = importlib.util.module_from_spec(SPEC)
sys.modules[SPEC.name] = v11
SPEC.loader.exec_module(v11)


HARNESS = BASE / "goal_mode_empirical_harness_v11"
INPUTS = BASE / "goal_mode_v12_prefix_aware_terminal_closure_canary_001_inputs"
MANIFEST = INPUTS / "manifest.json"
RUN_ID = "goal-mode-v12-prefix-aware-terminal-closure-canary-001"
ROW_COUNT = 3
MAX_PARALLEL = 1
ADAPTER = "CODEX_NATIVE_GOAL_SCORED_TURN_THEN_SAME_TASK_TERMINAL_CLOSURE_PREFIX_AWARE_V2"
ADMISSION_SCHEMA = "pw-r9-goal-mode-v12-prefix-aware-terminal-closure-route-canary-controller-admission-v1"
SOURCES = (
    ("r9_goal_mode_v12_prefix_aware_terminal_closure_route_canary_controller_v1.py", Path(__file__).resolve()),
    ("goal_mode_v12_prefix_aware_terminal_closure_canary_001_inputs/manifest.json", MANIFEST),
    ("goal_mode_empirical_harness_v11/goal_mode_contract.json", HARNESS / "goal_mode_contract.json"),
    ("goal_mode_empirical_harness_v11/goal_mode_harness.py", HARNESS / "goal_mode_harness.py"),
    ("goal_mode_empirical_harness_v11/goal_mode_terminal_closure_attestor.py", HARNESS / "goal_mode_terminal_closure_attestor.py"),
    ("goal_mode_empirical_harness_v10/goal_mode_harness.py", BASE / "goal_mode_empirical_harness_v10" / "goal_mode_harness.py"),
    ("goal_mode_empirical_harness_v10/goal_mode_terminal_closure_attestor.py", BASE / "goal_mode_empirical_harness_v10" / "goal_mode_terminal_closure_attestor.py"),
    ("goal_mode_empirical_harness_v4/read_goal_subject.py", BASE / "goal_mode_empirical_harness_v4" / "read_goal_subject.py"),
    ("r9_goal_mode_harness_v11_independent_static_review_v1.json", BASE / "r9_goal_mode_harness_v11_independent_static_review_v1.json"),
    ("r9_goal_mode_v12_exact_row_argv_successor_design_v1.json", BASE / "r9_goal_mode_v12_exact_row_argv_successor_design_v1.json"),
    ("r9_goal_mode_v10_terminal_closure_canary_001_runtime_failure_receipt_v1.json", BASE / "r9_goal_mode_v10_terminal_closure_canary_001_runtime_failure_receipt_v1.json"),
    ("r9_goal_mode_v11_prefix_aware_terminal_closure_canary_001_runtime_failure_receipt_v1.json", BASE / "r9_goal_mode_v11_prefix_aware_terminal_closure_canary_001_runtime_failure_receipt_v1.json"),
    ("r9_goal_mode_per_test_taker_binding_correction_v2.json", BASE / "r9_goal_mode_per_test_taker_binding_correction_v2.json"),
    ("r9_goal_mode_omp_windows_transport_clarification_v3.json", BASE / "r9_goal_mode_omp_windows_transport_clarification_v3.json"),
    ("r9_goal_mode_v12_prefix_aware_terminal_closure_canary_001_row_000_admission_v1.json", BASE / "r9_goal_mode_v12_prefix_aware_terminal_closure_canary_001_row_000_admission_v1.json"),
    ("r9_goal_mode_v12_prefix_aware_terminal_closure_canary_001_row_001_admission_v1.json", BASE / "r9_goal_mode_v12_prefix_aware_terminal_closure_canary_001_row_001_admission_v1.json"),
    ("r9_goal_mode_v12_prefix_aware_terminal_closure_canary_001_row_002_admission_v1.json", BASE / "r9_goal_mode_v12_prefix_aware_terminal_closure_canary_001_row_002_admission_v1.json"),
)


for module in (v11, v11.v10):
    for name, value in {
        "BASE": BASE,
        "HARNESS": HARNESS,
        "INPUTS": INPUTS,
        "MANIFEST": MANIFEST,
        "RUN_ID": RUN_ID,
        "ROW_COUNT": ROW_COUNT,
        "MAX_PARALLEL": MAX_PARALLEL,
        "ADMISSION_SCHEMA": ADMISSION_SCHEMA,
        "SOURCES": SOURCES,
    }.items():
        setattr(module, name, value)


Invalid = v11.Invalid
require = v11.require
canon = v11.canon
load = v11.load
sha = v11.sha
identity = v11.identity
write = v11.write
write_json = v11.write_json
terminate_group = v11.terminate_group
capture_quiescent = v11.capture_quiescent


def bindings() -> list[dict[str, Any]]:
    return [identity(label, path) for label, path in SOURCES]


v11.bindings = bindings
v11.v10.bindings = bindings


def load_manifest() -> dict[str, Any]:
    value = load(MANIFEST)
    require(
        value.get("schema_id") == "pw-r9-goal-mode-v12-prefix-aware-terminal-closure-route-canary-input-manifest-v1"
        and value.get("status") == "PREDECLARED_ZERO_CREDIT_NO_LAUNCH",
        "manifest status",
    )
    require(
        value.get("run_id") == RUN_ID
        and value.get("row_count") == ROW_COUNT
        and value.get("max_parallel") == MAX_PARALLEL
        and len(value.get("rows", [])) == ROW_COUNT,
        "manifest envelope",
    )
    require(
        value.get("authority")
        == {"canary_launch": False, "matrix_launch": False, "qualification_credit": 0, "qualification_streak_clean_matrices": 0},
        "manifest authority",
    )
    require(
        value.get("architecture")
        == {
            "adapter": ADAPTER,
            "closure": "SAME_TASK_DISTINCT_NON_SCORED_GOAL_TERMINAL_TURN_WITH_VERIFIED_HISTORICAL_SCORED_PREFIX",
            "controller_row_argv": "LOCALLY_OWNED_EXACT_V12_PATH_PROJECTION",
            "processes_per_row": 2,
        },
        "manifest architecture",
    )
    require(
        value.get("isolation")
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
    require(
        value.get("lineage")
        == {
            "matrix_005": "PERMANENT_FAIL_ZERO_CREDIT",
            "matrix_006": "INVALIDATED_NO_LAUNCH_AUTHORITY",
            "v10_canary": "PERMANENT_FAIL_ZERO_CREDIT",
            "v11_canary": "PERMANENT_FAIL_ZERO_CREDIT",
        },
        "manifest lineage",
    )
    require(
        value.get("omp_boundary")
        == {
            "duplicate_launch": False,
            "existing_launch": "omp --cwd P:\\",
            "linux_process_inference": False,
            "native_goal_required_per_fresh_omp_test_taker": True,
            "status": "PRESERVED_UNTOUCHED",
        },
        "manifest OMP boundary",
    )
    review = BASE / value["harness_review"]["path"]
    require(identity(review.name, review) == value["harness_review"], "harness review identity")
    return value


def load_controller_admission(path: Path) -> dict[str, Any]:
    value = load(path)
    require(set(value) == {"authority", "bindings", "review", "schema_id", "status"}, "controller admission keys")
    require(
        value["schema_id"] == ADMISSION_SCHEMA
        and value["status"] == "PASS_INDEPENDENT_V12_EXACT_ROW_ARGV_PREFIX_AWARE_TERMINAL_CLOSURE_ROUTE_CANARY_CONTROLLER_REVIEW",
        "controller admission status",
    )
    require(
        value["authority"]
        == {
            "canary_launch": True,
            "launch_count": 1,
            "max_parallel": 1,
            "qualification": False,
            "retry": False,
            "row_count": 3,
            "run_id": RUN_ID,
        },
        "controller admission authority",
    )
    require(value["bindings"] == bindings(), "controller admission bindings")
    reference = value["review"]
    require(isinstance(reference, dict) and set(reference) == {"bytes", "mode", "path", "sha256"}, "controller review reference")
    review_path = path.parent / reference["path"]
    require(identity(reference["path"], review_path) == reference, "controller review identity")
    review = load(review_path)
    require(
        review.get("schema_id") == "pw-r9-goal-mode-v12-exact-row-argv-prefix-aware-terminal-closure-route-canary-controller-independent-static-review-v1"
        and review.get("status")
        == "PASS_INDEPENDENT_STATIC_REVIEW_V12_EXACT_ROW_ARGV_PREFIX_AWARE_TERMINAL_CLOSURE_ROUTE_CANARY_ADMISSION_ELIGIBLE_ZERO_CREDIT_NO_LAUNCH"
        and review.get("first_mismatch") is None
        and review.get("bindings") == bindings(),
        "controller review verdict",
    )
    return value


def row_argv(index: int, args: argparse.Namespace, capture: Path) -> list[str]:
    require(0 <= index < ROW_COUNT, "row argv index")
    return [
        sys.executable,
        "-B",
        str(HARNESS / "goal_mode_harness.py"),
        "run-codex-row",
        "--row-spec",
        str(INPUTS / f"row-{index:03d}.row.json"),
        "--subject",
        str(INPUTS / f"row-{index:03d}.subject.txt"),
        "--admission",
        str(BASE / f"r9_goal_mode_v12_prefix_aware_terminal_closure_canary_001_row_{index:03d}_admission_v1.json"),
        "--capture-root",
        str(capture),
        "--codex-home",
        str(args.codex_home),
        "--codex",
        str(args.codex),
        "--workspace",
        str(args.workspace),
        "--timeout-seconds",
        str(args.row_timeout_seconds),
    ]


v11.v10.row_argv = row_argv


def launch_one(index: int, args: argparse.Namespace, capture: Path, results: Path) -> dict[str, Any]:
    argv = row_argv(index, args, capture)
    started = int(time.time() * 1000)
    process = subprocess.Popen(
        argv,
        stdin=subprocess.DEVNULL,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        cwd=args.workspace,
        start_new_session=True,
        env={**os.environ, "PYTHONDONTWRITEBYTECODE": "1"},
    )
    timed_out = False
    try:
        stdout, stderr = process.communicate(timeout=args.row_timeout_seconds * 2 + 180)
    except subprocess.TimeoutExpired:
        timed_out = True
        terminate_group(process)
        stdout, stderr = process.communicate()
    write(results / f"row-{index:03d}.stdout", stdout)
    write(results / f"row-{index:03d}.stderr", stderr)
    parsed: Any = None
    try:
        parsed = json.loads(stdout, object_pairs_hook=v11.v10.pairs)
    except (json.JSONDecodeError, UnicodeDecodeError, Invalid):
        pass
    quiescent = capture_quiescent(capture)
    ok = bool(
        not timed_out
        and process.returncode == 0
        and stderr == b""
        and quiescent
        and isinstance(parsed, dict)
        and parsed.get("status") == "PASS_NATIVE_GOAL_SCORED_TURN_SAME_TASK_TERMINAL_CLOSURE_PREFIX_AWARE_ZERO_CREDIT"
        and isinstance(parsed.get("attestation"), dict)
        and parsed["attestation"].get("status")
        == "PASS_SAME_TASK_TWO_TURN_NATIVE_GOAL_TERMINAL_CLOSURE_PREFIX_AWARE_ZERO_CREDIT"
        and parsed["attestation"].get("authority") == {"external_matrix_qualification_required": True, "qualification_credit": 0}
        and parsed["attestation"].get("historical_scored_rollout", {}).get("strict_prefix") is True
        and isinstance(parsed.get("stderr_classification"), dict)
        and parsed["stderr_classification"].get("status") == "PASS_EXACT_PHASE_STDERR_CLASSIFICATIONS_AFTER_FULL_ATTESTATION"
        and parsed["stderr_classification"].get("scored", {}).get("accepted") is True
        and parsed["stderr_classification"].get("closure", {}).get("accepted") is True
    )
    receipt = {
        "ended_at_ms": int(time.time() * 1000),
        "index": index,
        "pid": process.pid,
        "process_reaped": process.poll() is not None,
        "quiescent_before_next": quiescent,
        "rc": process.returncode,
        "row_id": f"row-{index:03d}",
        "schema_id": "pw-r9-goal-mode-v12-prefix-aware-terminal-closure-route-canary-row-process-receipt-v1",
        "started_at_ms": started,
        "status": "PASS" if ok else "FAIL",
        "stderr": {"bytes": len(stderr), "sha256": sha(stderr)},
        "stdout": {"bytes": len(stdout), "sha256": sha(stdout)},
        "timed_out": timed_out,
    }
    write_json(results / f"row-{index:03d}.receipt.json", receipt)
    return receipt


def run(args: argparse.Namespace) -> tuple[dict[str, Any], int]:
    manifest = load_manifest()
    v11.v10.validate_inputs(manifest)
    load_controller_admission(args.admission)
    require(args.run_id == RUN_ID and args.max_parallel == MAX_PARALLEL, "runtime envelope")
    require(args.output.is_absolute() and not args.output.exists() and args.output.parent.is_dir(), "output root")
    args.output.mkdir(mode=0o700)
    os.chmod(args.output, 0o700)
    rows = args.output / "rows"
    results = args.output / "controller_results"
    rows.mkdir(mode=0o700)
    results.mkdir(mode=0o700)
    os.chmod(rows, 0o700)
    os.chmod(results, 0o700)
    started = int(time.time() * 1000)
    receipts: list[dict[str, Any]] = []
    for index in range(ROW_COUNT):
        receipt = launch_one(index, args, rows / f"row-{index:03d}", results)
        receipts.append(receipt)
        if receipt["status"] != "PASS":
            break
    consumed = len(receipts)
    passed = sum(row["status"] == "PASS" for row in receipts)
    terminal = {
        "accounting": {
            "aborted_unlaunched": ROW_COUNT - consumed,
            "consumed": consumed,
            "failed": consumed - passed,
            "passed": passed,
            "planned": ROW_COUNT,
            "qualification_credit": 0,
            "retries": 0,
        },
        "first_failure": next(
            (
                {"index": row["index"], "rc": row["rc"], "stderr_sha256": row["stderr"]["sha256"], "stdout_sha256": row["stdout"]["sha256"]}
                for row in receipts
                if row["status"] != "PASS"
            ),
            None,
        ),
        "isolation": {
            "all_consumed_rows_quiescent_before_successor": all(row["quiescent_before_next"] for row in receipts),
            "max_parallel": 1,
            "serialized": True,
        },
        "run_id": RUN_ID,
        "schema_id": "pw-r9-goal-mode-v12-prefix-aware-terminal-closure-route-canary-controller-terminal-v1",
        "started_at_ms": started,
        "status": (
            "PASS_THREE_ROUTE_V12_GOAL_PREFIX_AWARE_TERMINAL_CLOSURE_CANARY_ZERO_CREDIT_PENDING_INDEPENDENT_VERIFY"
            if passed == ROW_COUNT
            else "FAIL_PERMANENT_ZERO_CREDIT_NO_RETRY"
        ),
    }
    write_json(args.output / "controller_terminal.json", terminal)
    return terminal, 0 if passed == ROW_COUNT else 1


def _row_argv_projection(index: int) -> list[str]:
    args = argparse.Namespace(
        codex_home=Path("/accepted/codex-home"),
        codex=Path("/accepted/codex"),
        workspace=Path("/accepted/workspace"),
        row_timeout_seconds=1200,
    )
    capture = Path("/accepted/capture") / f"row-{index:03d}"
    return row_argv(index, args, capture)


def check() -> dict[str, Any]:
    manifest = load_manifest()
    v11.v10.validate_inputs(manifest)
    argv_projections: list[dict[str, Any]] = []
    for index in range(ROW_COUNT):
        admission_name = f"r9_goal_mode_v12_prefix_aware_terminal_closure_canary_001_row_{index:03d}_admission_v1.json"
        admission = load(BASE / admission_name)
        require(
            admission["schema_id"] == "pw-r9-goal-mode-row-admission-v11"
            and admission["authority"]["run_id"] == RUN_ID
            and admission["authority"]["row_id"] == f"row-{index:03d}"
            and admission["authority"]["retry"] is False,
            f"row admission:{index}",
        )
        argv = _row_argv_projection(index)
        require(
            argv[0:4] == [sys.executable, "-B", str(HARNESS / "goal_mode_harness.py"), "run-codex-row"]
            and argv[5] == str(INPUTS / f"row-{index:03d}.row.json")
            and argv[7] == str(INPUTS / f"row-{index:03d}.subject.txt")
            and argv[9] == str(BASE / admission_name)
            and len(argv) == 20,
            f"exact row argv:{index}",
        )
        joined = "\x00".join(argv)
        require("v10_terminal_closure_canary" not in joined and "v11_prefix_aware_terminal_closure_canary_001_row" not in joined, f"stale admission argv:{index}")
        argv_projections.append({"bytes": len(canon(argv)) - 1, "index": index, "sha256": sha(canon(argv)[:-1])})
    return {
        "authority": {"canary_launch": False, "matrix_launch": False, "qualification_credit": 0},
        "bindings": bindings(),
        "checks": {
            "exact_row_argv_projections": argv_projections,
            "fail_fast_unlaunched_suffix": "PASS_STATIC",
            "goal_terminal_closure": "SAME_TASK_DISTINCT_NON_SCORED_TURN",
            "max_parallel": 1,
            "no_predecessor_admission_paths": "PASS_STATIC",
            "no_retry": "PASS_STATIC",
            "omp_lane": "EXISTING_WINDOWS_OMP_CWD_P_DRIVE_NO_DUPLICATE",
            "processes_per_row": 2,
            "row_count": 3,
            "serialized_process_reap_and_reader_quiescence": "PASS_STATIC",
            "v10_and_v11_failures_preserved": True,
        },
        "schema_id": "pw-r9-goal-mode-v12-prefix-aware-terminal-closure-route-canary-controller-check-v1",
        "status": "PASS_STATIC_EXACT_ROW_ARGV_ZERO_CREDIT_NO_LAUNCH",
    }


def main() -> int:
    parser = argparse.ArgumentParser()
    sub = parser.add_subparsers(dest="command", required=True)
    sub.add_parser("check")
    run_parser = sub.add_parser("run-canary")
    run_parser.add_argument("--run-id", required=True)
    run_parser.add_argument("--admission", type=Path, required=True)
    run_parser.add_argument("--output", type=Path, required=True)
    run_parser.add_argument("--codex-home", type=Path, required=True)
    run_parser.add_argument("--codex", type=Path, required=True)
    run_parser.add_argument("--workspace", type=Path, required=True)
    run_parser.add_argument("--max-parallel", type=int, required=True)
    run_parser.add_argument("--row-timeout-seconds", type=int, required=True)
    args = parser.parse_args()
    try:
        if args.command == "check":
            result, rc = check(), 0
        else:
            require(60 <= args.row_timeout_seconds <= 1800, "timeout bounds")
            result, rc = run(args)
    except (Invalid, OSError, subprocess.SubprocessError) as exc:
        result = {
            "authority": {"canary_launch": False, "matrix_launch": False, "qualification_credit": 0},
            "error": str(exc),
            "schema_id": "pw-r9-goal-mode-v12-prefix-aware-terminal-closure-route-canary-controller-failure-v1",
            "status": "FAIL_ZERO_CREDIT_NO_RETRY",
        }
        rc = 1
    sys.stdout.buffer.write(canon(result))
    return rc


if __name__ == "__main__":
    raise SystemExit(main())
