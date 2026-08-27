#!/usr/bin/env python3
"""Serialized three-route canary controller for V10 Goal terminal closure."""

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
HARNESS = BASE / "goal_mode_empirical_harness_v10"
INPUTS = BASE / "goal_mode_v10_terminal_closure_canary_001_inputs"
MANIFEST = INPUTS / "manifest.json"
RUN_ID = "goal-mode-v10-terminal-closure-canary-001"
ROW_COUNT = 3
MAX_PARALLEL = 1
SCHEMA = "pw-r9-goal-mode-v10-terminal-closure-route-canary-controller-v1"
ADMISSION_SCHEMA = "pw-r9-goal-mode-v10-terminal-closure-route-canary-controller-admission-v1"
SOURCES = (
    ("r9_goal_mode_v10_terminal_closure_route_canary_controller_v1.py", Path(__file__).resolve()),
    ("goal_mode_v10_terminal_closure_canary_001_inputs/manifest.json", MANIFEST),
    ("goal_mode_empirical_harness_v10/goal_mode_contract.json", HARNESS / "goal_mode_contract.json"),
    ("goal_mode_empirical_harness_v10/goal_mode_harness.py", HARNESS / "goal_mode_harness.py"),
    ("goal_mode_empirical_harness_v10/goal_mode_terminal_closure_attestor.py", HARNESS / "goal_mode_terminal_closure_attestor.py"),
    ("goal_mode_empirical_harness_v4/read_goal_subject.py", BASE / "goal_mode_empirical_harness_v4" / "read_goal_subject.py"),
    ("r9_goal_mode_harness_v10_independent_static_review_v1.json", BASE / "r9_goal_mode_harness_v10_independent_static_review_v1.json"),
    ("r9_goal_mode_v10_same_task_terminal_closure_design_v1.json", BASE / "r9_goal_mode_v10_same_task_terminal_closure_design_v1.json"),
    ("r9_goal_mode_v9_causal_matrix_005_runtime_failure_receipt_v1.json", BASE / "r9_goal_mode_v9_causal_matrix_005_runtime_failure_receipt_v1.json"),
    ("r9_goal_mode_per_test_taker_binding_correction_v2.json", BASE / "r9_goal_mode_per_test_taker_binding_correction_v2.json"),
    ("r9_goal_mode_omp_windows_transport_clarification_v3.json", BASE / "r9_goal_mode_omp_windows_transport_clarification_v3.json"),
    ("r9_goal_mode_v10_terminal_closure_canary_001_row_000_admission_v1.json", BASE / "r9_goal_mode_v10_terminal_closure_canary_001_row_000_admission_v1.json"),
    ("r9_goal_mode_v10_terminal_closure_canary_001_row_001_admission_v1.json", BASE / "r9_goal_mode_v10_terminal_closure_canary_001_row_001_admission_v1.json"),
    ("r9_goal_mode_v10_terminal_closure_canary_001_row_002_admission_v1.json", BASE / "r9_goal_mode_v10_terminal_closure_canary_001_row_002_admission_v1.json"),
)


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
    require(raw.endswith(b"\n") and b"\r" not in raw and b"\x00" not in raw, f"JSON framing:{path}")
    try:
        value = json.loads(
            raw,
            object_pairs_hook=pairs,
            parse_constant=lambda item: (_ for _ in ()).throw(Invalid(f"nonfinite:{item}")),
        )
    except (json.JSONDecodeError, UnicodeDecodeError) as exc:
        raise Invalid(f"JSON:{path}:{exc}") from exc
    require(raw == canon(value), f"noncanonical:{path}")
    return value


def sha(raw: bytes) -> str:
    return hashlib.sha256(raw).hexdigest()


def identity(label: str, path: Path) -> dict[str, Any]:
    raw = read_regular(path)
    return {"bytes": len(raw), "mode": f"{stat.S_IMODE(os.lstat(path).st_mode):04o}", "path": label, "sha256": sha(raw)}


def bindings() -> list[dict[str, Any]]:
    return [identity(label, path) for label, path in SOURCES]


def load_manifest() -> dict[str, Any]:
    value = load(MANIFEST)
    require(
        value.get("schema_id") == "pw-r9-goal-mode-v10-terminal-closure-route-canary-input-manifest-v1"
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
            "adapter": "CODEX_NATIVE_GOAL_SCORED_TURN_THEN_SAME_TASK_TERMINAL_CLOSURE_V1",
            "closure": "SAME_TASK_DISTINCT_NON_SCORED_GOAL_TERMINAL_TURN",
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
        value.get("lineage") == {"matrix_005": "PERMANENT_FAIL_ZERO_CREDIT", "matrix_006": "INVALIDATED_NO_LAUNCH_AUTHORITY"},
        "manifest failed lineage",
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
        and value["status"] == "PASS_INDEPENDENT_V10_TERMINAL_CLOSURE_ROUTE_CANARY_CONTROLLER_REVIEW",
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
        review.get("schema_id") == "pw-r9-goal-mode-v10-terminal-closure-route-canary-controller-independent-static-review-v1"
        and review.get("status")
        == "PASS_INDEPENDENT_STATIC_REVIEW_V10_TERMINAL_CLOSURE_ROUTE_CANARY_ADMISSION_ELIGIBLE_ZERO_CREDIT_NO_LAUNCH"
        and review.get("first_mismatch") is None
        and review.get("bindings") == bindings(),
        "controller review verdict",
    )
    return value


def validate_inputs(manifest: dict[str, Any]) -> None:
    routes = (("slot-alpha", "gpt-5.4-mini", "xhigh"), ("slot-bravo", "gpt-5.4-mini", "medium"), ("slot-charlie", "gpt-5.6-luna", "medium"))
    for index, (route, model, effort) in enumerate(routes):
        item = manifest["rows"][index]
        require(
            item["index"] == index
            and item["row_id"] == f"row-{index:03d}"
            and (item["route"], item["model"], item["reasoning_effort"]) == (route, model, effort),
            f"route:{index}",
        )
        for key in ("control_envelope", "criteria", "row_spec", "subject"):
            reference = item[key]
            require(identity(reference["path"], INPUTS / reference["path"]) == reference, f"input identity:{index}:{key}")
        row = load(INPUTS / item["row_spec"]["path"])
        require(
            row["run_id"] == RUN_ID
            and row["row_id"] == item["row_id"]
            and row["model"] == model
            and row["reasoning_effort"] == effort,
            f"row projection:{index}",
        )
        require(
            row["control_envelope"] == load(INPUTS / item["control_envelope"]["path"])
            and row["criteria"] == load(INPUTS / item["criteria"]["path"]),
            f"row committed inputs:{index}",
        )
        require(
            row["control_envelope"]["max_parallel"] == 1
            and row["control_envelope"]["serialized"] is True
            and row["control_envelope"]["goal_terminal_closure"] is True
            and row["control_envelope"]["qualification_credit"] == 0,
            f"row isolation:{index}",
        )


def row_argv(index: int, args: argparse.Namespace, capture: Path) -> list[str]:
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
        str(BASE / f"r9_goal_mode_v10_terminal_closure_canary_001_row_{index:03d}_admission_v1.json"),
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
    require(read_regular(path, max(1, len(raw))) == raw, f"write reopen:{path}")


def write_json(path: Path, value: Any) -> None:
    write(path, canon(value))


def capture_quiescent(capture: Path) -> bool:
    try:
        scored = load(capture / "scored_process_receipt.json")
        closure = load(capture / "closure_process_receipt.json")
        attestation = load(capture / "goal_mode_attestation.json", 64_000_000)
    except (Invalid, OSError):
        return False
    quiet = scored.get("reader_quiescence")
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
        and attestation.get("status") == "PASS_SAME_TASK_TWO_TURN_NATIVE_GOAL_TERMINAL_CLOSURE_ZERO_CREDIT"
        and attestation.get("goal", {}).get("status") == "complete"
        and attestation.get("process_accounting")
        == {"fresh_tasks": 1, "processes": 2, "resume_operations": 1, "retries": 0, "subject_deliveries": 1}
        and not (capture / "subject.fifo").exists()
    )


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
        parsed = json.loads(stdout, object_pairs_hook=pairs)
    except (json.JSONDecodeError, UnicodeDecodeError, Invalid):
        pass
    quiescent = capture_quiescent(capture)
    ok = bool(
        not timed_out
        and process.returncode == 0
        and stderr == b""
        and quiescent
        and isinstance(parsed, dict)
        and parsed.get("status") == "PASS_NATIVE_GOAL_SCORED_TURN_SAME_TASK_TERMINAL_CLOSURE_ZERO_CREDIT"
        and isinstance(parsed.get("attestation"), dict)
        and parsed["attestation"].get("status") == "PASS_SAME_TASK_TWO_TURN_NATIVE_GOAL_TERMINAL_CLOSURE_ZERO_CREDIT"
        and parsed["attestation"].get("authority") == {"external_matrix_qualification_required": True, "qualification_credit": 0}
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
        "schema_id": "pw-r9-goal-mode-v10-terminal-closure-route-canary-row-process-receipt-v1",
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
    validate_inputs(manifest)
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
    aborted = ROW_COUNT - consumed
    terminal = {
        "accounting": {
            "aborted_unlaunched": aborted,
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
        "schema_id": "pw-r9-goal-mode-v10-terminal-closure-route-canary-controller-terminal-v1",
        "started_at_ms": started,
        "status": (
            "PASS_THREE_ROUTE_V10_GOAL_TERMINAL_CLOSURE_CANARY_ZERO_CREDIT_PENDING_INDEPENDENT_VERIFY"
            if passed == ROW_COUNT
            else "FAIL_PERMANENT_ZERO_CREDIT_NO_RETRY"
        ),
    }
    write_json(args.output / "controller_terminal.json", terminal)
    return terminal, 0 if passed == ROW_COUNT else 1


def check() -> dict[str, Any]:
    manifest = load_manifest()
    validate_inputs(manifest)
    for index in range(ROW_COUNT):
        admission = load(BASE / f"r9_goal_mode_v10_terminal_closure_canary_001_row_{index:03d}_admission_v1.json")
        require(
            admission["schema_id"] == "pw-r9-goal-mode-row-admission-v10"
            and admission["authority"]["run_id"] == RUN_ID
            and admission["authority"]["row_id"] == f"row-{index:03d}"
            and admission["authority"]["retry"] is False,
            f"row admission:{index}",
        )
    return {
        "authority": {"canary_launch": False, "matrix_launch": False, "qualification_credit": 0},
        "bindings": bindings(),
        "checks": {
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
        },
        "schema_id": "pw-r9-goal-mode-v10-terminal-closure-route-canary-controller-check-v1",
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
            "schema_id": "pw-r9-goal-mode-v10-terminal-closure-route-canary-controller-failure-v1",
            "status": "FAIL_ZERO_CREDIT_NO_RETRY",
        }
        rc = 1
    sys.stdout.buffer.write(canon(result))
    return rc


if __name__ == "__main__":
    raise SystemExit(main())
