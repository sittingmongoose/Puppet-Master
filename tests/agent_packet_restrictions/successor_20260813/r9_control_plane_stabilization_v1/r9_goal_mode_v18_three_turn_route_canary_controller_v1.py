#!/usr/bin/env python3
"""Serialized three-route V18 native-Goal canary controller."""

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
HARNESS = BASE / "goal_mode_empirical_harness_v18"
INPUTS = BASE / "goal_mode_v18_three_turn_canary_001_inputs"
MANIFEST = INPUTS / "manifest.json"
RUNTIME_VERIFIER = BASE / "r9_goal_mode_v18_three_turn_route_canary_independent_runtime_verify_v1.py"
RUN_ID = "goal-mode-v18-three-turn-canary-001"
ROW_COUNT = 3
MAX_PARALLEL = 1
ADAPTER = "CODEX_NATIVE_GOAL_SUBJECT_FREE_ACTIVATION_EXACT_DIRECT_OR_ORDERED_BATCH_THEN_SCORED_RESUME_THEN_TERMINAL_CLOSURE_PURE_SEALED_REOPEN_V4"
ADMISSION_SCHEMA = "pw-r9-goal-mode-v18-three-turn-route-canary-controller-admission-v1"
ROW_ADMISSION_SCHEMA = "pw-r9-goal-mode-row-admission-v18"
ROW_ADMISSION_STATUS = "PASS_INDEPENDENT_V18_THREE_TURN_HARNESS_REVIEW"
ROW_RESULT_SCHEMA = "pw-r9-goal-mode-v18-row-result-v1"
ROW_RESULT_STATUS = "PASS_THREE_TURN_SAME_TASK_NATIVE_GOAL_SUBJECT_FREE_ACTIVATION_SCORED_RESUME_TERMINAL_CLOSURE_ZERO_CREDIT"
ATTESTATION_STATUS = "PASS_THREE_TURN_SAME_TASK_NATIVE_GOAL_SUBJECT_GATED_TERMINAL_CLOSURE_ZERO_CREDIT"
ROUTES = (
    ("slot-alpha", "gpt-5.4-mini", "xhigh"),
    ("slot-bravo", "gpt-5.4-mini", "medium"),
    ("slot-charlie", "gpt-5.6-luna", "medium"),
)
HARNESS_SOURCES = (
    ("goal_mode_empirical_harness_v18/goal_mode_contract.json", HARNESS / "goal_mode_contract.json"),
    ("goal_mode_empirical_harness_v18/goal_mode_harness.py", HARNESS / "goal_mode_harness.py"),
    ("goal_mode_empirical_harness_v18/goal_mode_three_turn_attestor.py", HARNESS / "goal_mode_three_turn_attestor.py"),
    ("goal_mode_empirical_harness_v17/goal_mode_contract.json", BASE / "goal_mode_empirical_harness_v17" / "goal_mode_contract.json"),
    ("goal_mode_empirical_harness_v17/goal_mode_harness.py", BASE / "goal_mode_empirical_harness_v17" / "goal_mode_harness.py"),
    ("goal_mode_empirical_harness_v17/goal_mode_three_turn_attestor.py", BASE / "goal_mode_empirical_harness_v17" / "goal_mode_three_turn_attestor.py"),
    ("goal_mode_empirical_harness_v15/goal_mode_contract.json", BASE / "goal_mode_empirical_harness_v15" / "goal_mode_contract.json"),
    ("goal_mode_empirical_harness_v15/goal_mode_harness.py", BASE / "goal_mode_empirical_harness_v15" / "goal_mode_harness.py"),
    ("goal_mode_empirical_harness_v15/goal_mode_three_turn_attestor.py", BASE / "goal_mode_empirical_harness_v15" / "goal_mode_three_turn_attestor.py"),
    ("goal_mode_empirical_harness_v10/goal_mode_harness.py", BASE / "goal_mode_empirical_harness_v10" / "goal_mode_harness.py"),
    ("goal_mode_empirical_harness_v13/goal_mode_terminal_closure_attestor.py", BASE / "goal_mode_empirical_harness_v13" / "goal_mode_terminal_closure_attestor.py"),
    ("goal_mode_empirical_harness_v4/read_goal_subject.py", BASE / "goal_mode_empirical_harness_v4" / "read_goal_subject.py"),
    ("r9_goal_mode_v18_exact_ordered_goal_batch_and_pure_reopen_successor_design_v1.json", BASE / "r9_goal_mode_v18_exact_ordered_goal_batch_and_pure_reopen_successor_design_v1.json"),
    ("r9_goal_mode_v14_structural_context_matrix_001_runtime_failure_receipt_v1.json", BASE / "r9_goal_mode_v14_structural_context_matrix_001_runtime_failure_receipt_v1.json"),
    ("r9_goal_mode_v15_three_turn_canary_001_runtime_failure_receipt_v1.json", BASE / "r9_goal_mode_v15_three_turn_canary_001_runtime_failure_receipt_v1.json"),
    ("r9_goal_mode_v16_three_turn_canary_001_runtime_failure_receipt_v1.json", BASE / "r9_goal_mode_v16_three_turn_canary_001_runtime_failure_receipt_v1.json"),
    ("r9_goal_mode_v17_three_turn_canary_001_runtime_failure_receipt_v1.json", BASE / "r9_goal_mode_v17_three_turn_canary_001_runtime_failure_receipt_v1.json"),
    ("r9_goal_mode_per_test_taker_binding_correction_v2.json", BASE / "r9_goal_mode_per_test_taker_binding_correction_v2.json"),
    ("r9_goal_mode_omp_windows_transport_clarification_v3.json", BASE / "r9_goal_mode_omp_windows_transport_clarification_v3.json"),
)
SOURCES = (
    ("r9_goal_mode_v18_three_turn_route_canary_controller_v1.py", Path(__file__).resolve()),
    ("goal_mode_v18_three_turn_canary_001_inputs/manifest.json", MANIFEST),
    *HARNESS_SOURCES,
    ("goal_mode_v18_three_turn_canary_001_inputs/r9_goal_mode_harness_v18_independent_static_review_v1.json", INPUTS / "r9_goal_mode_harness_v18_independent_static_review_v1.json"),
    *((f"goal_mode_v18_three_turn_canary_001_inputs/row-{index:03d}.admission.json", INPUTS / f"row-{index:03d}.admission.json") for index in range(ROW_COUNT)),
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


def canon(value: Any, newline: bool = True) -> bytes:
    raw = json.dumps(value, ensure_ascii=False, allow_nan=False, sort_keys=True, separators=(",", ":")).encode("utf-8")
    return raw + (b"\n" if newline else b"")


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


def load(path: Path, limit: int = 64_000_000) -> Any:
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


def harness_bindings() -> list[dict[str, Any]]:
    return [identity(label, path) for label, path in HARNESS_SOURCES]


def fsync_dir(path: Path) -> None:
    fd = os.open(path, os.O_RDONLY | getattr(os, "O_DIRECTORY", 0) | getattr(os, "O_CLOEXEC", 0))
    try:
        os.fsync(fd)
    finally:
        os.close(fd)


def write(path: Path, raw: bytes) -> None:
    fd = os.open(path, os.O_WRONLY | os.O_CREAT | os.O_EXCL | getattr(os, "O_CLOEXEC", 0), 0o600)
    try:
        os.fchmod(fd, 0o600)
        offset = 0
        while offset < len(raw):
            count = os.write(fd, raw[offset:])
            require(count > 0, f"short write:{path}")
            offset += count
        os.fsync(fd)
    finally:
        os.close(fd)
    fsync_dir(path.parent)
    require(read_regular(path, max(1, len(raw))) == raw, f"write reopen:{path}")


def write_json(path: Path, value: Any) -> None:
    write(path, canon(value))


def expected_row(index: int) -> dict[str, Any]:
    route, model, effort = ROUTES[index]
    return {"index": index, "model": model, "reasoning_effort": effort, "route": route, "row_id": f"row-{index:03d}"}


def validate_row_admission(index: int, row_path: Path) -> None:
    admission_path = INPUTS / f"row-{index:03d}.admission.json"
    value = load(admission_path)
    require(set(value) == {"authority", "bindings", "review", "row_spec", "schema_id", "status"}, f"row admission keys:{index}")
    require(value["schema_id"] == ROW_ADMISSION_SCHEMA and value["status"] == ROW_ADMISSION_STATUS, f"row admission status:{index}")
    require(
        value["authority"]
        == {
            "adapter": ADAPTER,
            "canary_launch": True,
            "launch_count": 1,
            "matrix_launch": False,
            "qualification": False,
            "retry": False,
            "row_id": f"row-{index:03d}",
            "run_id": RUN_ID,
        },
        f"row admission authority:{index}",
    )
    require(value["bindings"] == harness_bindings(), f"row admission harness bindings:{index}")
    review_ref = value["review"]
    require(review_ref == identity(review_ref["path"], INPUTS / review_ref["path"]), f"row admission review:{index}")
    review = load(INPUTS / review_ref["path"])
    require(
        review.get("schema_id") == "pw-r9-goal-mode-harness-v18-independent-static-review-v1"
        and review.get("status") == "PASS_INDEPENDENT_STATIC_REVIEW_V18_EXACT_ORDERED_GOAL_BATCH_PURE_SEALED_REOPEN_CANARY_ADMISSION_ELIGIBLE_ZERO_CREDIT_NO_LAUNCH"
        and review.get("first_mismatch") is None
        and review.get("bindings") == harness_bindings(),
        f"row admission review verdict:{index}",
    )
    raw = read_regular(row_path)
    require(value["row_spec"] == {"bytes": len(raw), "sha256": sha(raw)}, f"row admission row binding:{index}")


def load_manifest() -> dict[str, Any]:
    value = load(MANIFEST)
    require(
        value.get("schema_id") == "pw-r9-goal-mode-v18-three-turn-route-canary-input-manifest-v1"
        and value.get("status") == "PREDECLARED_ZERO_CREDIT_NO_LAUNCH",
        "manifest status",
    )
    require(value.get("run_id") == RUN_ID and value.get("row_count") == ROW_COUNT and value.get("max_parallel") == MAX_PARALLEL, "manifest envelope")
    require(value.get("authority") == {"canary_launch": False, "matrix_launch": False, "qualification_credit": 0, "qualification_streak_clean_matrices": 0}, "manifest authority")
    require(
        value.get("architecture")
        == {
            "activation": "SUBJECT_FREE_FRESH_TASK_NATIVE_GOAL_ACTIVATION_TURN",
            "adapter": ADAPTER,
            "closure": "SAME_TASK_SUBJECT_FREE_NATIVE_GOAL_TERMINAL_CLOSURE",
            "controller_row_argv": "LOCALLY_OWNED_EXACT_V18_PATH_PROJECTION",
            "goal_action_transport": {
                "direct": "EXACT_THREE_SEPARATE_NATIVE_CALLS",
                "nested": "EXACT_ONE_EXEC_BATCH_THREE_NATIVE_CALLS_THREE_DURABLE_PROJECTIONS",
                "other": "FAIL_CLOSED",
            },
            "processes_per_row": 3,
            "scored": "SAME_TASK_RESUME_ACTIVE_GOAL_FIRST_AND_ONLY_ACTION_BLOCKING_SUBJECT_READER_WITH_DURABLE_RESULT_REDERIVATION",
            "sealed_capture_reopen": "PURE_READ_ONLY_FINAL_REDERIVATION_ACCEPTS_EXACT_SEALED_INVENTORY",
        },
        "manifest architecture",
    )
    require(
        value.get("isolation")
        == {
            "between_rows": "FULL_BOOTSTRAP_SCORED_AND_CLOSURE_PROCESS_EXIT_CAPTURE_CLOSE_READER_QUIESCENCE",
            "fail_fast": True,
            "fresh_goals_per_row": 1,
            "fresh_tasks_per_row": 1,
            "goal_turns_per_row": 3,
            "max_parallel": 1,
            "mode": "SERIAL_FRESH_TASK_FRESH_GOAL_PER_ROW",
            "retry": False,
            "subject_deliveries_per_row": 1,
        },
        "manifest isolation",
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
    review_ref = value.get("harness_review")
    require(review_ref == identity(review_ref["path"], INPUTS / review_ref["path"]), "manifest harness review")
    rows = value.get("rows")
    require(isinstance(rows, list) and len(rows) == ROW_COUNT, "manifest rows")
    for index, declared in enumerate(rows):
        for key, item in expected_row(index).items():
            require(declared.get(key) == item, f"manifest row field:{index}:{key}")
        for field, suffix in (
            ("admission", "admission.json"),
            ("control_envelope", "control.json"),
            ("criteria", "criteria.json"),
            ("row_spec", "row.json"),
            ("subject", "subject.txt"),
        ):
            name = f"row-{index:03d}.{suffix}"
            require(declared.get(field) == identity(name, INPUTS / name), f"manifest identity:{index}:{field}")
        row_path = INPUTS / f"row-{index:03d}.row.json"
        row = load(row_path)
        require(
            row.get("schema_id") == "pw-r9-goal-mode-row-spec-v18"
            and row.get("adapter") == ADAPTER
            and row.get("run_id") == RUN_ID
            and row.get("row_id") == f"row-{index:03d}"
            and row.get("model") == ROUTES[index][1]
            and row.get("reasoning_effort") == ROUTES[index][2]
            and row.get("attempt") == 0,
            f"row spec envelope:{index}",
        )
        subject = read_regular(INPUTS / f"row-{index:03d}.subject.txt", 1_000_000)
        require(row.get("subject_utf8_bytes") == len(subject) and row.get("subject_utf8_sha256") == sha(subject), f"row subject binding:{index}")
        validate_row_admission(index, row_path)
    return value


def load_controller_admission(path: Path) -> dict[str, Any]:
    value = load(path)
    require(set(value) == {"authority", "bindings", "review", "runtime_verifier", "schema_id", "status"}, "controller admission keys")
    require(
        value["schema_id"] == ADMISSION_SCHEMA
        and value["status"] == "PASS_INDEPENDENT_V18_THREE_TURN_EXACT_ROW_ARGV_ROUTE_CANARY_CONTROLLER_REVIEW",
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
    require(reference["path"] == Path(reference["path"]).name, "controller review basename")
    review_path = path.parent / reference["path"]
    require(identity(reference["path"], review_path) == reference, "controller review identity")
    review = load(review_path)
    require(
        review.get("schema_id") == "pw-r9-goal-mode-v18-three-turn-route-canary-controller-independent-static-review-v1"
        and review.get("status") == "PASS_INDEPENDENT_STATIC_REVIEW_V18_THREE_TURN_EXACT_ROW_ARGV_ROUTE_CANARY_ADMISSION_ELIGIBLE_ZERO_CREDIT_NO_LAUNCH"
        and review.get("first_mismatch") is None
        and review.get("bindings") == bindings(),
        "controller review verdict",
    )
    verifier = value["runtime_verifier"]
    require(isinstance(verifier, dict) and set(verifier) == {"bytes", "mode", "path", "sha256"}, "runtime verifier reference")
    require(verifier["path"] == RUNTIME_VERIFIER.name and identity(verifier["path"], RUNTIME_VERIFIER) == verifier, "runtime verifier identity")
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
        str(INPUTS / f"row-{index:03d}.admission.json"),
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


def capture_attestation(capture: Path) -> dict[str, Any] | None:
    try:
        bootstrap = load(capture / "bootstrap_process_receipt.json")
        scored = load(capture / "scored_process_receipt.json")
        closure = load(capture / "closure_process_receipt.json")
        attestation = load(capture / "goal_mode_attestation.json", 128_000_000)
        answer = read_regular(capture / "scored_output_last_message.txt", 8_000_000)
    except (Invalid, OSError):
        return None
    quiet = scored.get("reader_quiescence")
    ok = bool(
        bootstrap.get("stdin_closed") is True
        and bootstrap.get("timed_out") is False
        and bootstrap.get("rc") == 0
        and isinstance(quiet, dict)
        and quiet.get("detected_pids") == []
        and quiet.get("term_sent") == 0
        and quiet.get("kill_sent") == 0
        and quiet.get("remaining_pids") == []
        and scored.get("subject_fifo_removed") is True
        and scored.get("stdin_closed") is True
        and scored.get("timed_out") is False
        and scored.get("rc") == 0
        and closure.get("stdin_closed") is True
        and closure.get("timed_out") is False
        and closure.get("rc") == 0
        and attestation.get("status") == ATTESTATION_STATUS
        and attestation.get("goal", {}).get("status") == "complete"
        and attestation.get("process_accounting") == {"fresh_tasks": 1, "processes": 3, "resume_operations": 2, "retries": 0, "subject_deliveries": 1}
        and attestation.get("authority") == {"external_matrix_qualification_required": True, "qualification_credit": 0}
        and attestation.get("scored", {}).get("answer") == {"bytes": len(answer), "sha256": sha(answer)}
        and not (capture / "subject.fifo").exists()
    )
    return attestation if ok else None


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
        stdout, stderr = process.communicate(timeout=args.row_timeout_seconds * 3 + 300)
    except subprocess.TimeoutExpired:
        timed_out = True
        terminate_group(process)
        stdout, stderr = process.communicate()
    write(results / f"row-{index:03d}.stdout", stdout)
    write(results / f"row-{index:03d}.stderr", stderr)
    parsed: Any = None
    try:
        parsed = json.loads(stdout, object_pairs_hook=pairs, parse_constant=lambda item: (_ for _ in ()).throw(Invalid(f"nonfinite:{item}")))
        require(stdout == canon(parsed), "row stdout canonical")
    except (json.JSONDecodeError, UnicodeDecodeError, Invalid):
        parsed = None
    stored = capture_attestation(capture)
    attestation = parsed.get("attestation") if isinstance(parsed, dict) else None
    row = load(INPUTS / f"row-{index:03d}.row.json")
    expected_answer = row["criteria"]["expected_exact_utf8"].encode("utf-8")
    actual_answer = b""
    try:
        actual_answer = read_regular(capture / "scored_output_last_message.txt", 8_000_000)
    except (Invalid, OSError):
        pass
    classifications = parsed.get("stderr_classification") if isinstance(parsed, dict) else None
    ok = bool(
        not timed_out
        and process.returncode == 0
        and stderr == b""
        and process.poll() is not None
        and stored is not None
        and isinstance(parsed, dict)
        and parsed.get("schema_id") == ROW_RESULT_SCHEMA
        and parsed.get("status") == ROW_RESULT_STATUS
        and attestation == stored
        and actual_answer == expected_answer
        and isinstance(classifications, dict)
        and classifications.get("status") == "PASS_EXACT_THREE_PHASE_STDERR_CLASSIFICATIONS_AFTER_FULL_ATTESTATION"
        and all(classifications.get(phase, {}).get("accepted") is True for phase in ("bootstrap", "scored", "closure"))
    )
    receipt = {
        "ended_at_ms": int(time.time() * 1000),
        "index": index,
        "pid": process.pid,
        "process_reaped": process.poll() is not None,
        "quiescent_before_next": stored is not None,
        "rc": process.returncode,
        "row_id": f"row-{index:03d}",
        "schema_id": "pw-r9-goal-mode-v18-three-turn-route-canary-row-process-receipt-v1",
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
    fsync_dir(args.output.parent)
    fsync_dir(args.output)
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
        "schema_id": "pw-r9-goal-mode-v18-three-turn-route-canary-controller-terminal-v1",
        "started_at_ms": started,
        "status": "PASS_THREE_ROUTE_V18_THREE_TURN_NATIVE_GOAL_CANARY_ZERO_CREDIT_PENDING_INDEPENDENT_VERIFY" if passed == ROW_COUNT else "FAIL_PERMANENT_ZERO_CREDIT_NO_RETRY",
    }
    write_json(args.output / "controller_terminal.json", terminal)
    return terminal, 0 if passed == ROW_COUNT else 1


def row_argv_projection(index: int) -> list[str]:
    args = argparse.Namespace(codex_home=Path("/accepted/codex-home"), codex=Path("/accepted/codex"), workspace=Path("/accepted/workspace"), row_timeout_seconds=1200)
    return row_argv(index, args, Path("/accepted/capture") / f"row-{index:03d}")


def check() -> dict[str, Any]:
    load_manifest()
    projections: list[dict[str, Any]] = []
    for index in range(ROW_COUNT):
        argv = row_argv_projection(index)
        require(
            argv[0:4] == [sys.executable, "-B", str(HARNESS / "goal_mode_harness.py"), "run-codex-row"]
            and argv[5] == str(INPUTS / f"row-{index:03d}.row.json")
            and argv[7] == str(INPUTS / f"row-{index:03d}.subject.txt")
            and argv[9] == str(INPUTS / f"row-{index:03d}.admission.json")
            and len(argv) == 20,
            f"exact row argv:{index}",
        )
        raw = canon(argv, newline=False)
        projections.append({"bytes": len(raw), "index": index, "sha256": sha(raw)})
    return {
        "authority": {"canary_launch": False, "matrix_launch": False, "qualification_credit": 0},
        "bindings": bindings(),
        "checks": {
            "exact_row_argv_projections": projections,
            "fail_fast_unlaunched_suffix": "PASS_STATIC",
            "fresh_goals_per_row": 1,
            "fresh_tasks_per_row": 1,
            "goal_turns_per_row": 3,
            "max_parallel": 1,
            "no_retry": "PASS_STATIC",
            "omp_lane": "EXISTING_WINDOWS_OMP_CWD_P_DRIVE_NO_DUPLICATE",
            "processes_per_row": 3,
            "row_count": 3,
            "serialized_process_reap_and_reader_quiescence": "PASS_STATIC",
            "subject_free_activation_before_release": "PASS_STATIC",
            "v14_matrix_001": "PERMANENT_FAIL_ZERO_CREDIT",
            "v15_canary_001": "PERMANENT_FAIL_ZERO_CREDIT_NO_RETRY",
            "v16_canary_001": "PERMANENT_FAIL_ZERO_CREDIT_NO_RETRY",
            "v17_canary_001": "PERMANENT_FAIL_ZERO_CREDIT_NO_RETRY",
        },
        "schema_id": "pw-r9-goal-mode-v18-three-turn-route-canary-controller-check-v1",
        "status": "PASS_STATIC_V18_THREE_TURN_EXACT_ROW_ARGV_ZERO_CREDIT_NO_LAUNCH",
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
    except (Invalid, OSError, UnicodeError, subprocess.SubprocessError, json.JSONDecodeError) as exc:
        result = {"authority": {"canary_launch": False, "matrix_launch": False, "qualification_credit": 0}, "error": str(exc), "schema_id": "pw-r9-goal-mode-v18-three-turn-route-canary-controller-failure-v1", "status": "FAIL_ZERO_CREDIT_NO_RETRY"}
        rc = 1
    sys.stdout.buffer.write(canon(result))
    return rc


if __name__ == "__main__":
    raise SystemExit(main())
