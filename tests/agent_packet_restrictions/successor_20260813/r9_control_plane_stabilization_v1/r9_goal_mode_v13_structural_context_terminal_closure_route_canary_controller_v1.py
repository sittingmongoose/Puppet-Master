#!/usr/bin/env python3
"""Serialized V13 native-Goal canary controller with locally owned exact argv."""

from __future__ import annotations

import argparse
import hashlib
import json
import os
from pathlib import Path
import signal
import stat
import subprocess
import sys
import time
from typing import Any


BASE = Path(__file__).resolve().parent
HARNESS = BASE / "goal_mode_empirical_harness_v13"
INPUTS = BASE / "goal_mode_v13_structural_context_terminal_closure_canary_001_inputs"
MANIFEST = INPUTS / "manifest.json"
RUN_ID = "goal-mode-v13-structural-context-terminal-closure-canary-001"
ROW_COUNT = 3
MAX_PARALLEL = 1
ADAPTER = "CODEX_NATIVE_GOAL_SCORED_TURN_THEN_SAME_TASK_TERMINAL_CLOSURE_PREFIX_AND_STRUCTURAL_CONTEXT_AWARE_V3"
ADMISSION_SCHEMA = "pw-r9-goal-mode-v13-structural-context-terminal-closure-route-canary-controller-admission-v1"
ROW_ADMISSION_SCHEMA = "pw-r9-goal-mode-row-admission-v13"
ROW_ADMISSION_STATUS = "PASS_INDEPENDENT_V13_STRUCTURAL_GOAL_CONTEXT_PREFIX_AWARE_TERMINAL_CLOSURE_HARNESS_REVIEW"
ROW_RESULT_STATUS = "PASS_NATIVE_GOAL_SCORED_TURN_SAME_TASK_TERMINAL_CLOSURE_PREFIX_AND_STRUCTURAL_CONTEXT_AWARE_ZERO_CREDIT"
ATTESTATION_STATUS = "PASS_SAME_TASK_TWO_TURN_NATIVE_GOAL_TERMINAL_CLOSURE_PREFIX_AND_STRUCTURAL_CONTEXT_AWARE_ZERO_CREDIT"
CONTEXT_CONTRACT = "STRUCTURAL_SOURCE_WRAPPER_EXACT_OBJECTIVE_ORDERED_SECTIONS_NO_PRIOR_WORK_V1"
ROUTES = (
    ("slot-alpha", "gpt-5.4-mini", "xhigh"),
    ("slot-bravo", "gpt-5.4-mini", "medium"),
    ("slot-charlie", "gpt-5.6-luna", "medium"),
)
SOURCES = (
    ("r9_goal_mode_v13_structural_context_terminal_closure_route_canary_controller_v1.py", Path(__file__).resolve()),
    ("goal_mode_v13_structural_context_terminal_closure_canary_001_inputs/manifest.json", MANIFEST),
    ("goal_mode_empirical_harness_v13/goal_mode_contract.json", HARNESS / "goal_mode_contract.json"),
    ("goal_mode_empirical_harness_v13/goal_mode_harness.py", HARNESS / "goal_mode_harness.py"),
    ("goal_mode_empirical_harness_v13/goal_mode_terminal_closure_attestor.py", HARNESS / "goal_mode_terminal_closure_attestor.py"),
    ("goal_mode_empirical_harness_v11/goal_mode_harness.py", BASE / "goal_mode_empirical_harness_v11" / "goal_mode_harness.py"),
    ("goal_mode_empirical_harness_v11/goal_mode_terminal_closure_attestor.py", BASE / "goal_mode_empirical_harness_v11" / "goal_mode_terminal_closure_attestor.py"),
    ("goal_mode_empirical_harness_v10/goal_mode_harness.py", BASE / "goal_mode_empirical_harness_v10" / "goal_mode_harness.py"),
    ("goal_mode_empirical_harness_v10/goal_mode_terminal_closure_attestor.py", BASE / "goal_mode_empirical_harness_v10" / "goal_mode_terminal_closure_attestor.py"),
    ("goal_mode_empirical_harness_v4/read_goal_subject.py", BASE / "goal_mode_empirical_harness_v4" / "read_goal_subject.py"),
    ("r9_goal_mode_harness_v13_independent_static_review_v1.json", BASE / "r9_goal_mode_harness_v13_independent_static_review_v1.json"),
    ("r9_goal_mode_v13_structural_goal_context_successor_design_v1.json", BASE / "r9_goal_mode_v13_structural_goal_context_successor_design_v1.json"),
    ("r9_goal_mode_v10_terminal_closure_canary_001_runtime_failure_receipt_v1.json", BASE / "r9_goal_mode_v10_terminal_closure_canary_001_runtime_failure_receipt_v1.json"),
    ("r9_goal_mode_v11_prefix_aware_terminal_closure_canary_001_runtime_failure_receipt_v1.json", BASE / "r9_goal_mode_v11_prefix_aware_terminal_closure_canary_001_runtime_failure_receipt_v1.json"),
    ("r9_goal_mode_v12_prefix_aware_terminal_closure_canary_001_runtime_failure_receipt_v1.json", BASE / "r9_goal_mode_v12_prefix_aware_terminal_closure_canary_001_runtime_failure_receipt_v1.json"),
    ("r9_goal_mode_per_test_taker_binding_correction_v2.json", BASE / "r9_goal_mode_per_test_taker_binding_correction_v2.json"),
    ("r9_goal_mode_omp_windows_transport_clarification_v3.json", BASE / "r9_goal_mode_omp_windows_transport_clarification_v3.json"),
    ("r9_goal_mode_v13_structural_context_terminal_closure_canary_001_row_000_admission_v1.json", BASE / "r9_goal_mode_v13_structural_context_terminal_closure_canary_001_row_000_admission_v1.json"),
    ("r9_goal_mode_v13_structural_context_terminal_closure_canary_001_row_001_admission_v1.json", BASE / "r9_goal_mode_v13_structural_context_terminal_closure_canary_001_row_001_admission_v1.json"),
    ("r9_goal_mode_v13_structural_context_terminal_closure_canary_001_row_002_admission_v1.json", BASE / "r9_goal_mode_v13_structural_context_terminal_closure_canary_001_row_002_admission_v1.json"),
)


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


def read_regular(path: Path, limit: int = 256_000_000) -> bytes:
    before = os.lstat(path)
    require(stat.S_ISREG(before.st_mode) and not path.is_symlink() and 0 <= before.st_size <= limit, f"unsafe file:{path}")
    raw = path.read_bytes()
    after = os.lstat(path)
    require(
        (before.st_dev, before.st_ino, before.st_size, before.st_mtime_ns)
        == (after.st_dev, after.st_ino, after.st_size, after.st_mtime_ns)
        and len(raw) == before.st_size,
        f"changing file:{path}",
    )
    return raw


def load(path: Path, limit: int = 32_000_000) -> Any:
    raw = read_regular(path, limit)
    require(raw.endswith(b"\n") and not raw.endswith(b"\n\n") and b"\r" not in raw and b"\x00" not in raw, f"JSON framing:{path}")
    try:
        value = json.loads(raw, object_pairs_hook=pairs, parse_constant=lambda item: (_ for _ in ()).throw(Invalid(f"nonfinite:{item}")))
    except (json.JSONDecodeError, UnicodeDecodeError) as exc:
        raise Invalid(f"JSON:{path}:{exc}") from exc
    require(raw == canon(value), f"noncanonical:{path}")
    return value


def identity(label: str, path: Path) -> dict[str, Any]:
    raw = read_regular(path)
    return {"bytes": len(raw), "mode": f"{stat.S_IMODE(os.lstat(path).st_mode):04o}", "path": label, "sha256": sha(raw)}


def bindings() -> list[dict[str, Any]]:
    return [identity(label, path) for label, path in SOURCES]


def write(path: Path, raw: bytes) -> None:
    fd = os.open(path, os.O_WRONLY | os.O_CREAT | os.O_EXCL | getattr(os, "O_CLOEXEC", 0), 0o600)
    try:
        os.fchmod(fd, 0o600)
        offset = 0
        while offset < len(raw):
            offset += os.write(fd, raw[offset:])
        os.fsync(fd)
    finally:
        os.close(fd)
    require(read_regular(path, max(len(raw), 1)) == raw, f"write reopen:{path}")


def write_json(path: Path, value: Any) -> None:
    write(path, canon(value))


def _expected_row(index: int) -> dict[str, Any]:
    route, model, effort = ROUTES[index]
    return {"index": index, "model": model, "reasoning_effort": effort, "route": route, "row_id": f"row-{index:03d}"}


def load_manifest() -> dict[str, Any]:
    value = load(MANIFEST)
    require(value.get("schema_id") == "pw-r9-goal-mode-v13-structural-context-terminal-closure-route-canary-input-manifest-v1" and value.get("status") == "PREDECLARED_ZERO_CREDIT_NO_LAUNCH", "manifest status")
    require(value.get("run_id") == RUN_ID and value.get("row_count") == ROW_COUNT and value.get("max_parallel") == MAX_PARALLEL, "manifest envelope")
    require(value.get("authority") == {"canary_launch": False, "matrix_launch": False, "qualification_credit": 0, "qualification_streak_clean_matrices": 0}, "manifest authority")
    require(
        value.get("architecture")
        == {
            "adapter": ADAPTER,
            "closure": "SAME_TASK_DISTINCT_NON_SCORED_GOAL_TERMINAL_TURN_WITH_VERIFIED_HISTORICAL_SCORED_PREFIX_AND_STRUCTURAL_NATIVE_GOAL_CONTEXT",
            "controller_row_argv": "LOCALLY_OWNED_EXACT_V13_PATH_PROJECTION",
            "goal_context": "STRUCTURAL_SOURCE_WRAPPER_EXACT_OBJECTIVE_ORDERED_SECTIONS_AND_NO_PRIOR_WORK",
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
            "v12_canary": "PERMANENT_FAIL_ZERO_CREDIT",
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
    rows = value.get("rows")
    require(isinstance(rows, list) and len(rows) == ROW_COUNT, "manifest rows")
    for index, declared in enumerate(rows):
        expected = _expected_row(index)
        for key, item in expected.items():
            require(declared.get(key) == item, f"manifest row field:{index}:{key}")
        for field, suffix in (("control_envelope", "control.json"), ("criteria", "criteria.json"), ("row_spec", "row.json"), ("subject", "subject.txt")):
            name = f"row-{index:03d}.{suffix}"
            require(declared.get(field) == identity(name, INPUTS / name), f"manifest identity:{index}:{field}")
        row = load(INPUTS / f"row-{index:03d}.row.json")
        require(
            row.get("schema_id") == "pw-r9-goal-mode-row-spec-v13"
            and row.get("adapter") == ADAPTER
            and row.get("run_id") == RUN_ID
            and row.get("row_id") == expected["row_id"]
            and row.get("model") == expected["model"]
            and row.get("reasoning_effort") == expected["reasoning_effort"]
            and row.get("attempt") == 0,
            f"row spec envelope:{index}",
        )
        subject = read_regular(INPUTS / f"row-{index:03d}.subject.txt", 1_000_000)
        require(row.get("subject_utf8_bytes") == len(subject) and row.get("subject_utf8_sha256") == sha(subject), f"row subject binding:{index}")
    return value


def load_controller_admission(path: Path) -> dict[str, Any]:
    value = load(path)
    require(set(value) == {"authority", "bindings", "review", "schema_id", "status"}, "controller admission keys")
    require(
        value["schema_id"] == ADMISSION_SCHEMA
        and value["status"] == "PASS_INDEPENDENT_V13_STRUCTURAL_GOAL_CONTEXT_EXACT_ROW_ARGV_ROUTE_CANARY_CONTROLLER_REVIEW",
        "controller admission status",
    )
    require(
        value["authority"]
        == {"canary_launch": True, "launch_count": 1, "max_parallel": 1, "qualification": False, "retry": False, "row_count": 3, "run_id": RUN_ID},
        "controller admission authority",
    )
    require(value["bindings"] == bindings(), "controller admission bindings")
    reference = value["review"]
    require(isinstance(reference, dict) and set(reference) == {"bytes", "mode", "path", "sha256"}, "controller review reference")
    review_path = path.parent / reference["path"]
    require(identity(reference["path"], review_path) == reference, "controller review identity")
    review = load(review_path)
    require(
        review.get("schema_id") == "pw-r9-goal-mode-v13-structural-context-route-canary-controller-independent-static-review-v1"
        and review.get("status") == "PASS_INDEPENDENT_STATIC_REVIEW_V13_STRUCTURAL_GOAL_CONTEXT_EXACT_ROW_ARGV_ROUTE_CANARY_ADMISSION_ELIGIBLE_ZERO_CREDIT_NO_LAUNCH"
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
        str(BASE / f"r9_goal_mode_v13_structural_context_terminal_closure_canary_001_row_{index:03d}_admission_v1.json"),
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


def terminate_group(process: subprocess.Popen[bytes]) -> None:
    if process.poll() is not None:
        return
    try:
        os.killpg(process.pid, signal.SIGTERM)
    except ProcessLookupError:
        pass
    try:
        process.wait(timeout=10)
        return
    except subprocess.TimeoutExpired:
        pass
    try:
        os.killpg(process.pid, signal.SIGKILL)
    except ProcessLookupError:
        pass
    try:
        process.wait(timeout=30)
    except subprocess.TimeoutExpired:
        pass


def capture_quiescent(capture: Path) -> bool:
    try:
        scored = load(capture / "scored_process_receipt.json")
        closure = load(capture / "closure_process_receipt.json")
        attestation = load(capture / "goal_mode_attestation.json", 64_000_000)
    except (Invalid, OSError):
        return False
    quiet = scored.get("reader_quiescence")
    historical = attestation.get("historical_scored_rollout")
    context = attestation.get("closure", {}).get("native_goal_context")
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
        and attestation.get("status") == ATTESTATION_STATUS
        and attestation.get("goal", {}).get("status") == "complete"
        and attestation.get("process_accounting") == {"fresh_tasks": 1, "processes": 2, "resume_operations": 1, "retries": 0, "subject_deliveries": 1}
        and isinstance(historical, dict)
        and historical.get("strict_prefix") is True
        and isinstance(historical.get("bytes"), int)
        and isinstance(historical.get("final_bytes"), int)
        and historical["bytes"] < historical["final_bytes"]
        and isinstance(context, dict)
        and context.get("contract") == CONTEXT_CONTRACT
        and context.get("objective_bound") is True
        and not (capture / "subject.fifo").exists()
    )


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
        parsed = json.loads(stdout, object_pairs_hook=pairs, parse_constant=lambda item: (_ for _ in ()).throw(Invalid(f"nonfinite:{item}")))
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
        and parsed.get("status") == ROW_RESULT_STATUS
        and isinstance(attestation, dict)
        and attestation.get("status") == ATTESTATION_STATUS
        and attestation.get("authority") == {"external_matrix_qualification_required": True, "qualification_credit": 0}
        and attestation.get("historical_scored_rollout", {}).get("strict_prefix") is True
        and isinstance(context, dict)
        and context.get("contract") == CONTEXT_CONTRACT
        and context.get("objective_bound") is True
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
        "schema_id": "pw-r9-goal-mode-v13-structural-context-route-canary-row-process-receipt-v1",
        "started_at_ms": started,
        "status": "PASS" if ok else "FAIL",
        "stderr": {"bytes": len(stderr), "sha256": sha(stderr)},
        "stdout": {"bytes": len(stdout), "sha256": sha(stdout)},
        "timed_out": timed_out,
    }
    write_json(results / f"row-{index:03d}.receipt.json", receipt)
    return receipt


def run(args: argparse.Namespace) -> tuple[dict[str, Any], int]:
    load_manifest()
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
        "accounting": {"aborted_unlaunched": ROW_COUNT - consumed, "consumed": consumed, "failed": consumed - passed, "passed": passed, "planned": ROW_COUNT, "qualification_credit": 0, "retries": 0},
        "first_failure": next(({"index": row["index"], "rc": row["rc"], "stderr_sha256": row["stderr"]["sha256"], "stdout_sha256": row["stdout"]["sha256"]} for row in receipts if row["status"] != "PASS"), None),
        "isolation": {"all_consumed_rows_quiescent_before_successor": all(row["quiescent_before_next"] for row in receipts), "max_parallel": 1, "serialized": True},
        "run_id": RUN_ID,
        "schema_id": "pw-r9-goal-mode-v13-structural-context-route-canary-controller-terminal-v1",
        "started_at_ms": started,
        "status": "PASS_THREE_ROUTE_V13_STRUCTURAL_GOAL_CONTEXT_TERMINAL_CLOSURE_CANARY_ZERO_CREDIT_PENDING_INDEPENDENT_VERIFY" if passed == ROW_COUNT else "FAIL_PERMANENT_ZERO_CREDIT_NO_RETRY",
    }
    write_json(args.output / "controller_terminal.json", terminal)
    return terminal, 0 if passed == ROW_COUNT else 1


def _row_argv_projection(index: int) -> list[str]:
    args = argparse.Namespace(codex_home=Path("/accepted/codex-home"), codex=Path("/accepted/codex"), workspace=Path("/accepted/workspace"), row_timeout_seconds=1200)
    return row_argv(index, args, Path("/accepted/capture") / f"row-{index:03d}")


def check() -> dict[str, Any]:
    load_manifest()
    argv_projections: list[dict[str, Any]] = []
    for index in range(ROW_COUNT):
        admission_name = f"r9_goal_mode_v13_structural_context_terminal_closure_canary_001_row_{index:03d}_admission_v1.json"
        admission = load(BASE / admission_name)
        require(
            admission.get("schema_id") == ROW_ADMISSION_SCHEMA
            and admission.get("status") == ROW_ADMISSION_STATUS
            and admission.get("authority", {}).get("run_id") == RUN_ID
            and admission.get("authority", {}).get("row_id") == f"row-{index:03d}"
            and admission.get("authority", {}).get("retry") is False,
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
        require(all(token not in joined for token in ("v10_terminal_closure_canary", "v11_prefix_aware_terminal_closure_canary_001_row", "v12_prefix_aware_terminal_closure_canary_001_row")), f"predecessor admission argv:{index}")
        raw = canon(argv)[:-1]
        argv_projections.append({"bytes": len(raw), "index": index, "sha256": sha(raw)})
    return {
        "authority": {"canary_launch": False, "matrix_launch": False, "qualification_credit": 0},
        "bindings": bindings(),
        "checks": {
            "exact_row_argv_projections": argv_projections,
            "fail_fast_unlaunched_suffix": "PASS_STATIC",
            "goal_context": CONTEXT_CONTRACT,
            "goal_terminal_closure": "SAME_TASK_DISTINCT_NON_SCORED_TURN",
            "max_parallel": 1,
            "no_predecessor_admission_paths": "PASS_STATIC",
            "no_retry": "PASS_STATIC",
            "omp_lane": "EXISTING_WINDOWS_OMP_CWD_P_DRIVE_NO_DUPLICATE",
            "processes_per_row": 2,
            "row_count": 3,
            "serialized_process_reap_and_reader_quiescence": "PASS_STATIC",
            "v10_v11_v12_failures_preserved": True,
        },
        "schema_id": "pw-r9-goal-mode-v13-structural-context-route-canary-controller-check-v1",
        "status": "PASS_STATIC_V13_STRUCTURAL_GOAL_CONTEXT_EXACT_ROW_ARGV_ZERO_CREDIT_NO_LAUNCH",
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
        result = {"authority": {"canary_launch": False, "matrix_launch": False, "qualification_credit": 0}, "error": str(exc), "schema_id": "pw-r9-goal-mode-v13-structural-context-route-canary-controller-failure-v1", "status": "FAIL_ZERO_CREDIT_NO_RETRY"}
        rc = 1
    sys.stdout.buffer.write(canon(result))
    return rc


if __name__ == "__main__":
    raise SystemExit(main())
