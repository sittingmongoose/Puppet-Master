#!/usr/bin/env python3
"""Serialized fresh three-route V11 Goal-prefix canary controller."""

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
V10_PATH = BASE / "r9_goal_mode_v10_terminal_closure_route_canary_controller_v1.py"
SPEC = importlib.util.spec_from_file_location("_r9_goal_mode_v10_canary_controller", V10_PATH)
if SPEC is None or SPEC.loader is None:
    raise RuntimeError("V10 controller loader unavailable")
v10 = importlib.util.module_from_spec(SPEC)
sys.modules[SPEC.name] = v10
SPEC.loader.exec_module(v10)


HARNESS = BASE / "goal_mode_empirical_harness_v11"
INPUTS = BASE / "goal_mode_v11_prefix_aware_terminal_closure_canary_001_inputs"
MANIFEST = INPUTS / "manifest.json"
RUN_ID = "goal-mode-v11-prefix-aware-terminal-closure-canary-001"
ROW_COUNT = 3
MAX_PARALLEL = 1
ADAPTER = "CODEX_NATIVE_GOAL_SCORED_TURN_THEN_SAME_TASK_TERMINAL_CLOSURE_PREFIX_AWARE_V2"
ADMISSION_SCHEMA = "pw-r9-goal-mode-v11-prefix-aware-terminal-closure-route-canary-controller-admission-v1"
SOURCES = (
    ("r9_goal_mode_v11_prefix_aware_terminal_closure_route_canary_controller_v1.py", Path(__file__).resolve()),
    ("goal_mode_v11_prefix_aware_terminal_closure_canary_001_inputs/manifest.json", MANIFEST),
    ("goal_mode_empirical_harness_v11/goal_mode_contract.json", HARNESS / "goal_mode_contract.json"),
    ("goal_mode_empirical_harness_v11/goal_mode_harness.py", HARNESS / "goal_mode_harness.py"),
    ("goal_mode_empirical_harness_v11/goal_mode_terminal_closure_attestor.py", HARNESS / "goal_mode_terminal_closure_attestor.py"),
    ("goal_mode_empirical_harness_v10/goal_mode_harness.py", BASE / "goal_mode_empirical_harness_v10" / "goal_mode_harness.py"),
    ("goal_mode_empirical_harness_v10/goal_mode_terminal_closure_attestor.py", BASE / "goal_mode_empirical_harness_v10" / "goal_mode_terminal_closure_attestor.py"),
    ("goal_mode_empirical_harness_v4/read_goal_subject.py", BASE / "goal_mode_empirical_harness_v4" / "read_goal_subject.py"),
    ("r9_goal_mode_harness_v11_independent_static_review_v1.json", BASE / "r9_goal_mode_harness_v11_independent_static_review_v1.json"),
    ("r9_goal_mode_v11_historical_scored_prefix_successor_design_v1.json", BASE / "r9_goal_mode_v11_historical_scored_prefix_successor_design_v1.json"),
    ("r9_goal_mode_v10_terminal_closure_canary_001_runtime_failure_receipt_v1.json", BASE / "r9_goal_mode_v10_terminal_closure_canary_001_runtime_failure_receipt_v1.json"),
    ("r9_goal_mode_per_test_taker_binding_correction_v2.json", BASE / "r9_goal_mode_per_test_taker_binding_correction_v2.json"),
    ("r9_goal_mode_omp_windows_transport_clarification_v3.json", BASE / "r9_goal_mode_omp_windows_transport_clarification_v3.json"),
    ("r9_goal_mode_v11_prefix_aware_terminal_closure_canary_001_row_000_admission_v1.json", BASE / "r9_goal_mode_v11_prefix_aware_terminal_closure_canary_001_row_000_admission_v1.json"),
    ("r9_goal_mode_v11_prefix_aware_terminal_closure_canary_001_row_001_admission_v1.json", BASE / "r9_goal_mode_v11_prefix_aware_terminal_closure_canary_001_row_001_admission_v1.json"),
    ("r9_goal_mode_v11_prefix_aware_terminal_closure_canary_001_row_002_admission_v1.json", BASE / "r9_goal_mode_v11_prefix_aware_terminal_closure_canary_001_row_002_admission_v1.json"),
)


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
    setattr(v10, name, value)


Invalid = v10.Invalid
require = v10.require
canon = v10.canon
load = v10.load
sha = v10.sha
identity = v10.identity
write = v10.write
write_json = v10.write_json
terminate_group = v10.terminate_group


def bindings() -> list[dict[str, Any]]:
    return [identity(label, path) for label, path in SOURCES]


v10.bindings = bindings


def load_manifest() -> dict[str, Any]:
    value = load(MANIFEST)
    require(
        value.get("schema_id") == "pw-r9-goal-mode-v11-prefix-aware-terminal-closure-route-canary-input-manifest-v1"
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
        == {"matrix_005": "PERMANENT_FAIL_ZERO_CREDIT", "matrix_006": "INVALIDATED_NO_LAUNCH_AUTHORITY", "v10_canary": "PERMANENT_FAIL_ZERO_CREDIT"},
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
        and value["status"] == "PASS_INDEPENDENT_V11_PREFIX_AWARE_TERMINAL_CLOSURE_ROUTE_CANARY_CONTROLLER_REVIEW",
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
        review.get("schema_id") == "pw-r9-goal-mode-v11-prefix-aware-terminal-closure-route-canary-controller-independent-static-review-v1"
        and review.get("status")
        == "PASS_INDEPENDENT_STATIC_REVIEW_V11_PREFIX_AWARE_TERMINAL_CLOSURE_ROUTE_CANARY_ADMISSION_ELIGIBLE_ZERO_CREDIT_NO_LAUNCH"
        and review.get("first_mismatch") is None
        and review.get("bindings") == bindings(),
        "controller review verdict",
    )
    return value


def capture_quiescent(capture: Path) -> bool:
    try:
        scored = load(capture / "scored_process_receipt.json")
        closure = load(capture / "closure_process_receipt.json")
        attestation = load(capture / "goal_mode_attestation.json", 64_000_000)
    except (Invalid, OSError):
        return False
    quiet = scored.get("reader_quiescence")
    historical = attestation.get("historical_scored_rollout")
    return bool(
        isinstance(quiet, dict)
        and quiet.get("detected_pids") == []
        and quiet.get("term_sent") == 0
        and quiet.get("kill_sent") == 0
        and quiet.get("remaining_pids") == []
        and scored.get("subject_fifo_removed") is True
        and scored.get("stdin_closed") is True
        and scored.get("rc") == 0
        and closure.get("stdin_closed") is True
        and closure.get("timed_out") is False
        and closure.get("rc") == 0
        and attestation.get("status") == "PASS_SAME_TASK_TWO_TURN_NATIVE_GOAL_TERMINAL_CLOSURE_PREFIX_AWARE_ZERO_CREDIT"
        and attestation.get("goal", {}).get("status") == "complete"
        and attestation.get("process_accounting")
        == {"fresh_tasks": 1, "processes": 2, "resume_operations": 1, "retries": 0, "subject_deliveries": 1}
        and isinstance(historical, dict)
        and historical.get("strict_prefix") is True
        and isinstance(historical.get("bytes"), int)
        and isinstance(historical.get("final_bytes"), int)
        and historical["bytes"] < historical["final_bytes"]
        and not (capture / "subject.fifo").exists()
    )


v10.load_manifest = load_manifest
v10.load_controller_admission = load_controller_admission
v10.capture_quiescent = capture_quiescent


def launch_one(index: int, args: argparse.Namespace, capture: Path, results: Path) -> dict[str, Any]:
    argv = v10.row_argv(index, args, capture)
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
        parsed = json.loads(stdout, object_pairs_hook=v10.pairs)
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
        "schema_id": "pw-r9-goal-mode-v11-prefix-aware-terminal-closure-route-canary-row-process-receipt-v1",
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
    v10.validate_inputs(manifest)
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
        "schema_id": "pw-r9-goal-mode-v11-prefix-aware-terminal-closure-route-canary-controller-terminal-v1",
        "started_at_ms": started,
        "status": (
            "PASS_THREE_ROUTE_V11_GOAL_PREFIX_AWARE_TERMINAL_CLOSURE_CANARY_ZERO_CREDIT_PENDING_INDEPENDENT_VERIFY"
            if passed == ROW_COUNT
            else "FAIL_PERMANENT_ZERO_CREDIT_NO_RETRY"
        ),
    }
    write_json(args.output / "controller_terminal.json", terminal)
    return terminal, 0 if passed == ROW_COUNT else 1


def check() -> dict[str, Any]:
    manifest = load_manifest()
    v10.validate_inputs(manifest)
    for index in range(ROW_COUNT):
        admission = load(BASE / f"r9_goal_mode_v11_prefix_aware_terminal_closure_canary_001_row_{index:03d}_admission_v1.json")
        require(
            admission["schema_id"] == "pw-r9-goal-mode-row-admission-v11"
            and admission["authority"]["run_id"] == RUN_ID
            and admission["authority"]["row_id"] == f"row-{index:03d}"
            and admission["authority"]["retry"] is False,
            f"row admission:{index}",
        )
    return {
        "authority": {"canary_launch": False, "matrix_launch": False, "qualification_credit": 0},
        "bindings": bindings(),
        "checks": {
            "exact_historical_scored_rollout_prefix": "PASS_STATIC",
            "fail_fast_unlaunched_suffix": "PASS_STATIC",
            "goal_terminal_closure": "SAME_TASK_DISTINCT_NON_SCORED_TURN",
            "matrix006_invalidated": True,
            "max_parallel": 1,
            "no_retry": "PASS_STATIC",
            "omp_lane": "EXISTING_WINDOWS_OMP_CWD_P_DRIVE_NO_DUPLICATE",
            "processes_per_row": 2,
            "row_count": 3,
            "routes": ["slot-alpha", "slot-bravo", "slot-charlie"],
            "serialized_process_reap_and_reader_quiescence": "PASS_STATIC",
            "v10_failure_preserved": True,
        },
        "schema_id": "pw-r9-goal-mode-v11-prefix-aware-terminal-closure-route-canary-controller-check-v1",
        "status": "PASS_STATIC_ZERO_CREDIT_NO_LAUNCH",
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
            "schema_id": "pw-r9-goal-mode-v11-prefix-aware-terminal-closure-route-canary-controller-failure-v1",
            "status": "FAIL_ZERO_CREDIT_NO_RETRY",
        }
        rc = 1
    sys.stdout.buffer.write(canon(result))
    return rc


if __name__ == "__main__":
    raise SystemExit(main())
