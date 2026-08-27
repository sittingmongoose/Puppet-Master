#!/usr/bin/env python3
"""Serialized V14 291-row native-Goal matrix controller."""

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
CANARY_CONTROLLER = BASE / "r9_goal_mode_v13_structural_context_terminal_closure_route_canary_controller_v1.py"
SPEC = importlib.util.spec_from_file_location("_r9_v13_canary_controller_utilities", CANARY_CONTROLLER)
if SPEC is None or SPEC.loader is None:
    raise RuntimeError("V13 canary controller loader unavailable")
canary = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(canary)


HARNESS = BASE / "goal_mode_empirical_harness_v14"
PAIR_ROOT = BASE / "goal_mode_v14_structural_context_matrix_pair_001_002_inputs_v1"
MANIFEST = PAIR_ROOT / "manifest.json"
PAIR_REVIEW = BASE / "r9_goal_mode_v14_structural_context_matrix_pair_independent_review_v1.json"
CANARY_RECEIPT = BASE / "r9_goal_mode_v13_structural_context_terminal_closure_canary_001_success_receipt_v1.json"
MATRIX_001_RECEIPT = BASE / "r9_goal_mode_v14_structural_context_matrix_001_success_receipt_v1.json"
MATRIX_IDS = ("goal-mode-v14-structural-context-matrix-001", "goal-mode-v14-structural-context-matrix-002")
ROW_COUNT = 291
MAX_PARALLEL = 1
ROW_RESULT_SCHEMA = "pw-r9-goal-mode-v14-matrix-row-result-v1"
ROW_RESULT_STATUS = "PASS_NATIVE_GOAL_MATRIX_ROW_SCORED_TURN_SAME_TASK_TERMINAL_CLOSURE_PREFIX_AND_STRUCTURAL_CONTEXT_AWARE_ZERO_CREDIT"
ATTESTATION_STATUS = "PASS_SAME_TASK_TWO_TURN_NATIVE_GOAL_TERMINAL_CLOSURE_PREFIX_AND_STRUCTURAL_CONTEXT_AWARE_ZERO_CREDIT"
CONTEXT_CONTRACT = "STRUCTURAL_SOURCE_WRAPPER_EXACT_OBJECTIVE_ORDERED_SECTIONS_NO_PRIOR_WORK_V1"
SOURCES = (
    ("r9_goal_mode_v14_structural_context_matrix_controller_v1.py", Path(__file__).resolve()),
    ("r9_goal_mode_v13_structural_context_terminal_closure_route_canary_controller_v1.py", CANARY_CONTROLLER),
    ("goal_mode_v14_structural_context_matrix_pair_001_002_inputs_v1/manifest.json", MANIFEST),
    ("r9_goal_mode_v14_structural_context_matrix_pair_builder_v1.py", BASE / "r9_goal_mode_v14_structural_context_matrix_pair_builder_v1.py"),
    ("r9_goal_mode_v14_structural_context_matrix_pair_independent_review_v1.json", PAIR_REVIEW),
    ("goal_mode_empirical_harness_v14/goal_mode_contract.json", HARNESS / "goal_mode_contract.json"),
    ("goal_mode_empirical_harness_v14/goal_mode_harness.py", HARNESS / "goal_mode_harness.py"),
    ("r9_goal_mode_harness_v14_independent_static_review_v1.json", BASE / "r9_goal_mode_harness_v14_independent_static_review_v1.json"),
    ("r9_goal_mode_v13_structural_context_terminal_closure_canary_001_success_receipt_v1.json", CANARY_RECEIPT),
    ("r9_goal_mode_per_test_taker_binding_correction_v2.json", BASE / "r9_goal_mode_per_test_taker_binding_correction_v2.json"),
    ("r9_goal_mode_omp_windows_transport_clarification_v3.json", BASE / "r9_goal_mode_omp_windows_transport_clarification_v3.json"),
)


Invalid = canary.Invalid
require = canary.require
canon = canary.canon
sha = canary.sha
read_regular = canary.read_regular
load = canary.load
identity = canary.identity
write = canary.write
write_json = canary.write_json
terminate_group = canary.terminate_group
capture_quiescent = canary.capture_quiescent
pairs = canary.pairs


def bindings() -> list[dict[str, Any]]:
    return [identity(label, path) for label, path in SOURCES]


def load_manifest() -> dict[str, Any]:
    value = load(MANIFEST, 64_000_000)
    require(
        value.get("schema_id") == "pw-r9-goal-mode-v14-structural-context-matrix-pair-input-manifest-v1"
        and value.get("status") == "PREDECLARED_INPUTS_ZERO_CREDIT_NO_LAUNCH"
        and value.get("pair_order") == list(MATRIX_IDS),
        "manifest schema/order",
    )
    require(
        value.get("architecture") == "V14_SERIAL_FRESH_TASK_FRESH_NATIVE_GOAL_SAME_TASK_TERMINAL_CLOSURE_STRUCTURAL_CONTEXT"
        and value.get("authority") == {"matrix_launch": False, "qualification_credit": 0, "qualification_streak_clean_matrices": 0, "release": False},
        "manifest architecture/authority",
    )
    require(len(value.get("subjects", [])) == 97 and len(value.get("matrices", [])) == 2, "manifest counts")
    for matrix_index, matrix_id in enumerate(MATRIX_IDS):
        matrix = value["matrices"][matrix_index]
        require(matrix.get("matrix_id") == matrix_id and matrix.get("row_count") == ROW_COUNT and len(matrix.get("rows", [])) == ROW_COUNT, "manifest matrix")
    return value


def matrix_projection(manifest: dict[str, Any], matrix_id: str) -> dict[str, Any]:
    values = [item for item in manifest["matrices"] if item.get("matrix_id") == matrix_id]
    require(len(values) == 1, "matrix projection cardinality")
    return values[0]


def predecessor(matrix_id: str) -> dict[str, Any]:
    if matrix_id == MATRIX_IDS[0]:
        value = load(CANARY_RECEIPT)
        require(value.get("status") == "PASS_V13_THREE_ROUTE_NATIVE_GOAL_STRUCTURAL_CONTEXT_CANARY_ZERO_CREDIT_MATRIX_HARNESS_WORK_ONLY" and value.get("authority", {}).get("matrix_launch") is False, "canary predecessor")
        return identity(CANARY_RECEIPT.name, CANARY_RECEIPT)
    require(matrix_id == MATRIX_IDS[1] and MATRIX_001_RECEIPT.exists(), "Matrix002 predecessor absent")
    value = load(MATRIX_001_RECEIPT, 256_000_000)
    require(value.get("status") == "PASS_CLEAN_FULL_V14_STRUCTURAL_CONTEXT_NATIVE_GOAL_MATRIX_STREAK_1_OF_2_ZERO_QUALIFICATION_CREDIT" and value.get("matrix_id") == MATRIX_IDS[0], "Matrix001 predecessor")
    return identity(MATRIX_001_RECEIPT.name, MATRIX_001_RECEIPT)


def load_admission(path: Path, manifest: dict[str, Any], matrix_id: str) -> dict[str, Any]:
    value = load(path, 32_000_000)
    require(set(value) == {"authority", "bindings", "manifest", "pair_review", "predecessor", "review", "schema_id", "status"}, "admission keys")
    number = "001" if matrix_id == MATRIX_IDS[0] else "002"
    require(value["schema_id"] == f"pw-r9-goal-mode-v14-structural-context-matrix-{number}-admission-v1" and value["status"] == f"PASS_INDEPENDENT_V14_STRUCTURAL_CONTEXT_NATIVE_GOAL_MATRIX_{number}_CONTROLLER_REVIEW", "admission schema/status")
    require(value["authority"] == {"canary_launch": False, "matrix_id": matrix_id, "matrix_launch": True, "max_parallel": 1, "qualification": False, "retry": False, "row_count": ROW_COUNT}, "admission authority")
    require(value["bindings"] == bindings(), "admission bindings")
    require(value["manifest"] == identity("goal_mode_v14_structural_context_matrix_pair_001_002_inputs_v1/manifest.json", MANIFEST), "admission manifest")
    require(value["pair_review"] == identity(PAIR_REVIEW.name, PAIR_REVIEW), "admission pair review")
    require(value["predecessor"] == predecessor(matrix_id), "admission predecessor")
    review_reference = value["review"]
    require(isinstance(review_reference, dict) and set(review_reference) == {"bytes", "mode", "path", "sha256"}, "controller review reference")
    review_path = path.parent / review_reference["path"]
    require(identity(review_reference["path"], review_path) == review_reference, "controller review identity")
    review = load(review_path, 32_000_000)
    require(
        review.get("schema_id") == "pw-r9-goal-mode-v14-structural-context-matrix-controller-independent-static-review-v1"
        and review.get("status") == "PASS_INDEPENDENT_STATIC_REVIEW_V14_STRUCTURAL_CONTEXT_MATRIX_001_ADMISSION_ELIGIBLE_ZERO_CREDIT_NO_LAUNCH"
        and review.get("first_mismatch") is None
        and review.get("bindings") == bindings(),
        "controller review verdict",
    )
    require(manifest.get("pair_order") == list(MATRIX_IDS), "admission manifest object")
    return value


def row_paths(manifest: dict[str, Any], matrix_id: str, index: int) -> tuple[Path, Path, Path, dict[str, Any]]:
    require(0 <= index < ROW_COUNT, "row index")
    item = matrix_projection(manifest, matrix_id)["rows"][index]
    require(item.get("index") == index and item.get("row_id") == f"row-{index:03d}", "row order")
    row = PAIR_ROOT / item["row_spec"]["path"]
    subject = PAIR_ROOT / item["subject"]["path"]
    admission = PAIR_ROOT / item["admission"]["path"]
    require(identity(item["row_spec"]["path"], row) == {**item["row_spec"], "mode": "0644"}, "row input identity")
    require(identity(item["subject"]["path"], subject) == {**item["subject"], "mode": "0644"}, "subject input identity")
    require(identity(item["admission"]["path"], admission) == {**item["admission"], "mode": "0644"}, "row admission identity")
    return row, subject, admission, item


def row_argv(index: int, args: argparse.Namespace, capture: Path, manifest: dict[str, Any]) -> list[str]:
    row, subject, admission, _ = row_paths(manifest, args.matrix_id, index)
    return [
        sys.executable,
        "-B",
        str(HARNESS / "goal_mode_harness.py"),
        "run-codex-row",
        "--row-spec",
        str(row),
        "--subject",
        str(subject),
        "--admission",
        str(admission),
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


def launch_one(index: int, args: argparse.Namespace, capture: Path, results: Path, manifest: dict[str, Any]) -> dict[str, Any]:
    argv = row_argv(index, args, capture, manifest)
    started = int(time.time() * 1000)
    process = subprocess.Popen(argv, stdin=subprocess.DEVNULL, stdout=subprocess.PIPE, stderr=subprocess.PIPE, cwd=args.workspace, start_new_session=True, env={**os.environ, "PYTHONDONTWRITEBYTECODE": "1"})
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
        parsed = json.loads(stdout, object_pairs_hook=pairs)
    except (json.JSONDecodeError, UnicodeDecodeError, Invalid):
        pass
    quiescent = capture_quiescent(capture)
    attestation = parsed.get("attestation") if isinstance(parsed, dict) else None
    context = attestation.get("closure", {}).get("native_goal_context") if isinstance(attestation, dict) else None
    ok = bool(
        not timed_out
        and process.returncode == 0
        and stderr == b""
        and quiescent
        and isinstance(parsed, dict)
        and parsed.get("schema_id") == ROW_RESULT_SCHEMA
        and parsed.get("status") == ROW_RESULT_STATUS
        and isinstance(attestation, dict)
        and attestation.get("status") == ATTESTATION_STATUS
        and attestation.get("authority") == {"external_matrix_qualification_required": True, "qualification_credit": 0}
        and attestation.get("historical_scored_rollout", {}).get("strict_prefix") is True
        and isinstance(context, dict)
        and context.get("contract") == CONTEXT_CONTRACT
        and context.get("objective_bound") is True
        and parsed.get("stderr_classification", {}).get("status") == "PASS_EXACT_PHASE_STDERR_CLASSIFICATIONS_AFTER_FULL_ATTESTATION"
        and parsed.get("stderr_classification", {}).get("scored", {}).get("accepted") is True
        and parsed.get("stderr_classification", {}).get("closure", {}).get("accepted") is True
    )
    receipt = {"ended_at_ms": int(time.time() * 1000), "index": index, "pid": process.pid, "process_reaped": process.poll() is not None, "quiescent_before_next": quiescent, "rc": process.returncode, "row_id": f"row-{index:03d}", "schema_id": "pw-r9-goal-mode-v14-structural-context-matrix-row-process-receipt-v1", "started_at_ms": started, "status": "PASS" if ok else "FAIL", "stderr": {"bytes": len(stderr), "sha256": sha(stderr)}, "stdout": {"bytes": len(stdout), "sha256": sha(stdout)}, "timed_out": timed_out}
    write_json(results / f"row-{index:03d}.receipt.json", receipt)
    return receipt


def run_matrix(args: argparse.Namespace) -> tuple[dict[str, Any], int]:
    manifest = load_manifest()
    load_admission(args.admission, manifest, args.matrix_id)
    require(args.matrix_id in MATRIX_IDS and args.max_parallel == MAX_PARALLEL, "matrix runtime envelope")
    require(args.output.is_absolute() and not args.output.exists() and args.output.parent.is_dir(), "matrix output absent root")
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
        receipt = launch_one(index, args, rows / f"row-{index:03d}", results, manifest)
        receipts.append(receipt)
        if receipt["status"] != "PASS":
            break
    consumed = len(receipts)
    passed = sum(row["status"] == "PASS" for row in receipts)
    terminal = {
        "accounting": {"aborted_unlaunched": ROW_COUNT - consumed, "consumed": consumed, "failed": consumed - passed, "passed": passed, "planned": ROW_COUNT, "qualification_credit": 0, "retries": 0},
        "first_failure": next(({"index": row["index"], "rc": row["rc"], "stderr_sha256": row["stderr"]["sha256"], "stdout_sha256": row["stdout"]["sha256"]} for row in receipts if row["status"] != "PASS"), None),
        "isolation": {"all_consumed_rows_quiescent_before_successor": all(row["quiescent_before_next"] for row in receipts), "max_parallel": 1, "serialized": True},
        "matrix_id": args.matrix_id,
        "schema_id": "pw-r9-goal-mode-v14-structural-context-matrix-controller-terminal-v1",
        "started_at_ms": started,
        "status": "PASS_ALL_ROWS_V14_STRUCTURAL_CONTEXT_NATIVE_GOALS_ZERO_CREDIT_PENDING_INDEPENDENT_VERIFY" if passed == ROW_COUNT else "FAIL_PERMANENT_ZERO_CREDIT_NO_RETRY",
    }
    write_json(args.output / "matrix_terminal.json", terminal)
    return terminal, 0 if passed == ROW_COUNT else 1


def _row_projection(matrix_id: str, index: int) -> list[str]:
    manifest = load_manifest()
    args = argparse.Namespace(matrix_id=matrix_id, codex_home=Path("/accepted/codex-home"), codex=Path("/accepted/codex"), workspace=Path("/accepted/workspace"), row_timeout_seconds=1200)
    return row_argv(index, args, Path("/accepted/capture") / matrix_id / f"row-{index:03d}", manifest)


def check() -> dict[str, Any]:
    manifest = load_manifest()
    projections: list[dict[str, Any]] = []
    for matrix_id in MATRIX_IDS:
        matrix = matrix_projection(manifest, matrix_id)
        for index in (0, 96, 97, 193, 194, 290):
            argv = _row_projection(matrix_id, index)
            require(argv[0:4] == [sys.executable, "-B", str(HARNESS / "goal_mode_harness.py"), "run-codex-row"] and len(argv) == 20, "row argv shape")
            item = matrix["rows"][index]
            require(argv[5] == str(PAIR_ROOT / item["row_spec"]["path"]) and argv[7] == str(PAIR_ROOT / item["subject"]["path"]) and argv[9] == str(PAIR_ROOT / item["admission"]["path"]), "row argv exact inputs")
            raw = canon(argv)[:-1]
            projections.append({"bytes": len(raw), "index": index, "matrix_id": matrix_id, "sha256": sha(raw)})
    return {
        "authority": {"matrix_launch": False, "qualification_credit": 0},
        "bindings": bindings(),
        "checks": {"fail_fast_unlaunched_suffix": "PASS_STATIC", "fresh_goal_per_row": "PASS_STATIC", "matrix_ids": list(MATRIX_IDS), "matrix_rows_each": ROW_COUNT, "max_parallel": 1, "no_retry": "PASS_STATIC", "omp_process_calls": 0, "pair_predeclared": True, "row_argv_boundary_projections": projections, "serialized_process_reap_and_reader_quiescence": "PASS_STATIC", "structural_goal_context": "PASS_REQUIRED"},
        "schema_id": "pw-r9-goal-mode-v14-structural-context-matrix-controller-check-v1",
        "status": "PASS_STATIC_DATA_ONLY_ZERO_CREDIT_NO_LAUNCH",
    }


def main() -> int:
    parser = argparse.ArgumentParser()
    sub = parser.add_subparsers(dest="command", required=True)
    sub.add_parser("check")
    matrix = sub.add_parser("run-matrix")
    matrix.add_argument("--matrix-id", required=True)
    matrix.add_argument("--admission", type=Path, required=True)
    matrix.add_argument("--output", type=Path, required=True)
    matrix.add_argument("--codex-home", type=Path, required=True)
    matrix.add_argument("--codex", type=Path, required=True)
    matrix.add_argument("--workspace", type=Path, required=True)
    matrix.add_argument("--max-parallel", type=int, required=True)
    matrix.add_argument("--row-timeout-seconds", type=int, required=True)
    args = parser.parse_args()
    try:
        if args.command == "check":
            result, rc = check(), 0
        else:
            require(args.matrix_id in MATRIX_IDS and 60 <= args.row_timeout_seconds <= 7200, "matrix envelope")
            result, rc = run_matrix(args)
    except (Invalid, OSError, UnicodeError, subprocess.SubprocessError, json.JSONDecodeError) as exc:
        result = {"authority": {"matrix_launch": False, "qualification_credit": 0}, "error": str(exc), "schema_id": "pw-r9-goal-mode-v14-structural-context-matrix-controller-failure-v1", "status": "FAIL_ZERO_CREDIT_NO_RETRY"}
        rc = 1
    sys.stdout.buffer.write(canon(result))
    return rc


if __name__ == "__main__":
    raise SystemExit(main())
