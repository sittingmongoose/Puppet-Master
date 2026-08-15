#!/usr/bin/env python3
"""No-write completion gate for candidate-10 subject-driver invocations.

The controller drains and polls the child until actual exit.  It emits one
canonical terminal envelope only after exit code zero and full validation of
the completed receipt stdout.  Evidence persistence is deliberately external:
the caller must also poll a yielded unified-exec session through terminal exit
before create-only apply_patch persistence of the receipt and observation.
"""
from __future__ import annotations

import argparse
import copy
import hashlib
import json
import os
from pathlib import Path
import re
import stat
import subprocess
import sys
from typing import Any

sys.dont_write_bytecode = True

REPO = Path("/mnt/Cursor/PuppetMaster")
SUCCESSOR = REPO / "tests/agent_packet_restrictions/successor_20260813"
ROOT = SUCCESSOR / "model_retest_r8_candidate_v11"
DRIVER = ROOT / "r8_subject_task_driver.py"
CANDIDATE_ID = "PW-R8-ITERATIVE-FIX-TWO-CLEAN-RUNS-20260815.CANDIDATE-11"
RECEIPT_SCHEMA_ID = "pw-r8-direct-appserver-subject-receipt-v4"
COMPLETION_SCHEMA_ID = "pw-r8-invocation-completion-observation-v1"
TERMINAL_ENVELOPE_SCHEMA_ID = "pw-r8-process-controller-terminal-envelope-v1"
RUN_ID_RE = re.compile(r"^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$")
SLOTS = ("slot-alpha", "slot-bravo", "slot-charlie")
POLL_SECONDS = 0.02

RECEIPT_KEYS = (
    "schema_id","candidate_id","run_id","slot","cell","execution_root",
    "requested_model","requested_thinking","provider_effective_model",
    "provider_effective_thinking","host_id","thread_id","turn_id",
    "fresh_task_identity_basis","status","subject_call_started","fresh_context",
    "first_attempt_subject_call","retry_count","best_of","replacement_result",
    "admission","render_storage_sha256","render_storage_bytes",
    "provider_visible_payload_sha256","provider_visible_payload_bytes",
    "semantic_packet_sha256","semantic_packet_bytes","dispatch_schedule",
    "dispatch_nonce","dispatch_binding","dispatch_wrapper_sha256",
    "dispatch_wrapper_bytes","rollout_path","rollout_storage_sha256",
    "rollout_storage_bytes","model_provider","turn_context_model",
    "turn_context_effort","started_at_epoch_seconds","completed_at_epoch_seconds",
    "duration_ms","assistant_final_messages","assistant_final_messages_sha256",
    "assistant_final_messages_bytes","single_text_output_utf8",
    "single_text_output_sha256","single_text_output_bytes",
    "text_normalization_receipt","prohibited_activity_items",
    "prohibited_activity_items_sha256","prohibited_activity_items_bytes",
    "prohibited_activity_item_types","conformance_observations","identity_limitation",
)
COMPLETION_KEYS = (
    "schema_id","candidate_id","run_id","slot","cell","execution_root","status",
    "driver_argv","driver_argv_sha256","driver_argv_bytes",
    "child_process_started","child_live_poll_observed","child_poll_count",
    "child_process_exited","child_exit_code","child_stdout_fully_captured",
    "child_stderr_sha256","child_stderr_bytes",
    "outer_exec_live_session_observed","outer_exec_session_id","outer_exec_poll_count",
    "outer_exec_terminal_observed","outer_exec_exit_code","outer_exec_stdout_fully_captured",
    "receipt_relative_path","receipt_storage_sha256","receipt_storage_bytes",
    "persistence_method","persisted_only_after_outer_exit",
)
SEED_KEYS = COMPLETION_KEYS[:18] + COMPLETION_KEYS[24:27]
TERMINAL_ENVELOPE_KEYS = (
    "schema_id","candidate_id","run_id","slot","cell","execution_root","status",
    "completion_seed","receipt_storage_utf8",
    "external_outer_exec_completion_fields_required","persistence_authority",
)


class ProcessCompletionError(RuntimeError):
    pass


def canonical(value: Any) -> bytes:
    return json.dumps(value, ensure_ascii=False, separators=(",", ":")).encode("utf-8")


def sha(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def _execution_root(value: str | Path) -> Path:
    path = Path(value).resolve()
    if not path.is_relative_to(SUCCESSOR.resolve()):
        raise ProcessCompletionError("execution root must remain beneath successor_20260813")
    return path


def completion_path(execution_root: str | Path, slot: str, cell: str) -> Path:
    return _execution_root(execution_root) / "invocation_completions" / f"{slot}_{cell}.json"


def receipt_relative_path(slot: str, cell: str) -> str:
    return f"direct_appserver_receipts/{slot}_{cell}.json"


def receipt_path(execution_root: str | Path, slot: str, cell: str) -> Path:
    return _execution_root(execution_root) / receipt_relative_path(slot, cell)


def driver_argv(run_id: str, execution_root: Path, slot: str, cell: str) -> list[str]:
    return [
        str(Path(sys.executable).resolve()), "-B", str(DRIVER),
        "--run-id", run_id, "--execution-root", str(execution_root),
        "--slot", slot, "--cell", cell,
    ]


def _validate_receipt_storage(
    storage: bytes, run_id: str, execution_root: Path, slot: str, cell: str,
) -> dict[str, Any]:
    if not storage or storage in (b"\n", b"\r\n"):
        raise ProcessCompletionError("empty receipt stdout cannot be admitted")
    if not storage.endswith(b"\n") or storage.endswith(b"\n\n"):
        raise ProcessCompletionError("receipt stdout must have exactly one terminal LF")
    try:
        receipt = json.loads(storage[:-1])
    except (UnicodeDecodeError, json.JSONDecodeError) as exc:
        raise ProcessCompletionError("receipt stdout is incomplete or invalid JSON") from exc
    if not isinstance(receipt, dict) or tuple(receipt) != RECEIPT_KEYS:
        raise ProcessCompletionError("receipt stdout is outside the exact v4 closed world")
    if canonical(receipt) + b"\n" != storage:
        raise ProcessCompletionError("receipt stdout is not canonical completed storage")
    expected = {
        "schema_id": RECEIPT_SCHEMA_ID,
        "candidate_id": CANDIDATE_ID,
        "run_id": run_id,
        "slot": slot,
        "cell": cell,
        "execution_root": str(execution_root),
        "status": "completed",
        "subject_call_started": True,
        "first_attempt_subject_call": True,
        "retry_count": 0,
        "best_of": False,
        "replacement_result": False,
    }
    for key, value in expected.items():
        if type(receipt.get(key)) is not type(value) or receipt.get(key) != value:
            raise ProcessCompletionError(f"completed receipt binding mismatch: {key}")
    return receipt


def _run_child(
    argv: list[str], run_id: str, execution_root: Path, slot: str, cell: str,
) -> tuple[bytes, dict[str, Any]]:
    argv_storage = canonical(argv)
    process = subprocess.Popen(
        argv, cwd=REPO, stdin=subprocess.DEVNULL,
        stdout=subprocess.PIPE, stderr=subprocess.PIPE,
    )
    live_polls = 0
    while True:
        try:
            stdout, stderr = process.communicate(timeout=POLL_SECONDS)
            break
        except subprocess.TimeoutExpired:
            live_polls += 1
    exit_code = process.returncode
    if exit_code != 0:
        raise ProcessCompletionError(
            f"child process did not complete successfully: exit_code={exit_code}; stderr_sha256={sha(stderr)}; stderr_bytes={len(stderr)}"
        )
    _validate_receipt_storage(stdout, run_id, execution_root, slot, cell)
    seed_values = {
        "schema_id": COMPLETION_SCHEMA_ID,
        "candidate_id": CANDIDATE_ID,
        "run_id": run_id,
        "slot": slot,
        "cell": cell,
        "execution_root": str(execution_root),
        "status": "CHILD_COMPLETED_RECEIPT_READY_FOR_OUTER_TERMINAL_GATE",
        "driver_argv": argv,
        "driver_argv_sha256": sha(argv_storage),
        "driver_argv_bytes": len(argv_storage),
        "child_process_started": True,
        "child_live_poll_observed": live_polls > 0,
        "child_poll_count": live_polls,
        "child_process_exited": True,
        "child_exit_code": exit_code,
        "child_stdout_fully_captured": True,
        "child_stderr_sha256": sha(stderr),
        "child_stderr_bytes": len(stderr),
        "receipt_relative_path": receipt_relative_path(slot, cell),
        "receipt_storage_sha256": sha(stdout),
        "receipt_storage_bytes": len(stdout),
    }
    seed = {key: seed_values[key] for key in SEED_KEYS}
    return stdout, seed


def run(run_id: str, execution_root: str | Path, slot: str, cell: str) -> dict[str, Any]:
    if not RUN_ID_RE.fullmatch(run_id):
        raise ProcessCompletionError("invalid run id")
    if slot not in SLOTS or not cell:
        raise ProcessCompletionError("invalid slot or empty cell")
    root = _execution_root(execution_root)
    stdout, seed = _run_child(driver_argv(run_id, root, slot, cell), run_id, root, slot, cell)
    values = {
        "schema_id": TERMINAL_ENVELOPE_SCHEMA_ID,
        "candidate_id": CANDIDATE_ID,
        "run_id": run_id,
        "slot": slot,
        "cell": cell,
        "execution_root": str(root),
        "status": "TERMINAL_CHILD_EXIT_ZERO_FULL_RECEIPT_CAPTURED",
        "completion_seed": seed,
        "receipt_storage_utf8": stdout.decode("utf-8"),
        "external_outer_exec_completion_fields_required": list(COMPLETION_KEYS[18:24]),
        "persistence_authority": "external_apply_patch_only_after_outer_exec_terminal_exit_zero",
    }
    return {key: values[key] for key in TERMINAL_ENVELOPE_KEYS}


def _validate_completion_record(
    observation: Any, storage: bytes, execution_root: Path, slot: str, cell: str,
) -> dict[str, Any]:
    if not isinstance(observation, dict) or tuple(observation) != COMPLETION_KEYS:
        raise ProcessCompletionError("completion observation outside exact closed world")
    if not storage:
        raise ProcessCompletionError("empty receipt storage cannot be admitted")
    run_id = observation.get("run_id")
    if not isinstance(run_id, str) or not RUN_ID_RE.fullmatch(run_id):
        raise ProcessCompletionError("completion run id invalid")
    _validate_receipt_storage(storage, run_id, execution_root, slot, cell)
    exact = {
        "schema_id": COMPLETION_SCHEMA_ID,
        "candidate_id": CANDIDATE_ID,
        "slot": slot,
        "cell": cell,
        "execution_root": str(execution_root),
        "status": "COMPLETED_RECEIPT_PERSISTED_AFTER_OUTER_EXIT",
        "child_process_started": True,
        "child_process_exited": True,
        "child_exit_code": 0,
        "child_stdout_fully_captured": True,
        "outer_exec_terminal_observed": True,
        "outer_exec_exit_code": 0,
        "outer_exec_stdout_fully_captured": True,
        "receipt_relative_path": receipt_relative_path(slot, cell),
        "receipt_storage_sha256": sha(storage),
        "receipt_storage_bytes": len(storage),
        "persistence_method": "external_apply_patch_create_only",
        "persisted_only_after_outer_exit": True,
    }
    for key, value in exact.items():
        if type(observation.get(key)) is not type(value) or observation.get(key) != value:
            raise ProcessCompletionError(f"completion observation mismatch: {key}")
    argv = observation.get("driver_argv")
    argv_storage = canonical(argv)
    if not isinstance(argv, list) or any(not isinstance(x, str) or not x for x in argv):
        raise ProcessCompletionError("driver argv invalid")
    if argv != driver_argv(run_id, execution_root, slot, cell):
        raise ProcessCompletionError("driver argv binding mismatch")
    if (observation.get("driver_argv_sha256"), observation.get("driver_argv_bytes")) != (sha(argv_storage), len(argv_storage)):
        raise ProcessCompletionError("driver argv storage binding mismatch")
    child_live = observation.get("child_live_poll_observed")
    child_polls = observation.get("child_poll_count")
    if type(child_live) is not bool or type(child_polls) is not int or child_polls < 0 or child_live != (child_polls > 0):
        raise ProcessCompletionError("child polling observation invalid")
    stderr_hash = observation.get("child_stderr_sha256")
    stderr_bytes = observation.get("child_stderr_bytes")
    if not isinstance(stderr_hash, str) or not re.fullmatch(r"[0-9a-f]{64}", stderr_hash) or type(stderr_bytes) is not int or stderr_bytes < 0:
        raise ProcessCompletionError("child stderr binding invalid")
    outer_live = observation.get("outer_exec_live_session_observed")
    outer_session = observation.get("outer_exec_session_id")
    outer_polls = observation.get("outer_exec_poll_count")
    if type(outer_live) is not bool or type(outer_polls) is not int or outer_polls < 0:
        raise ProcessCompletionError("outer exec polling observation invalid")
    if outer_live:
        if (not isinstance(outer_session, (str, int)) or isinstance(outer_session, bool) or str(outer_session) == "" or outer_polls < 1):
            raise ProcessCompletionError("live outer exec was not polled through exit")
    elif outer_session is not None or outer_polls != 0:
        raise ProcessCompletionError("non-live outer exec has impossible session/poll evidence")
    return observation


def _regular(path: Path, label: str) -> bytes:
    try:
        before = os.lstat(path)
    except FileNotFoundError as exc:
        raise ProcessCompletionError(f"missing {label}") from exc
    if not stat.S_ISREG(before.st_mode) or stat.S_ISLNK(before.st_mode):
        raise ProcessCompletionError(f"{label} is not a regular non-link")
    flags = os.O_RDONLY | getattr(os, "O_NOFOLLOW", 0)
    fd = os.open(path, flags)
    try:
        opened = os.fstat(fd)
        chunks: list[bytes] = []
        while True:
            chunk = os.read(fd, 1 << 20)
            if not chunk:
                break
            chunks.append(chunk)
        after = os.fstat(fd)
    finally:
        os.close(fd)
    if (before.st_dev, before.st_ino, before.st_size, before.st_mtime_ns) != (opened.st_dev, opened.st_ino, opened.st_size, opened.st_mtime_ns) or (opened.st_size, opened.st_mtime_ns) != (after.st_size, after.st_mtime_ns):
        raise ProcessCompletionError(f"{label} changed during read")
    return b"".join(chunks)


def validate_persisted_completion(
    execution_root: str | Path, slot: str, cell: str, receipt_storage: bytes | None = None,
) -> dict[str, Any]:
    root = _execution_root(execution_root)
    sidecar_storage = _regular(completion_path(root, slot, cell), "invocation completion observation")
    if not sidecar_storage.endswith(b"\n") or sidecar_storage.endswith(b"\n\n"):
        raise ProcessCompletionError("completion observation must have exactly one terminal LF")
    try:
        observation = json.loads(sidecar_storage[:-1])
    except (UnicodeDecodeError, json.JSONDecodeError) as exc:
        raise ProcessCompletionError("completion observation is invalid JSON") from exc
    if canonical(observation) + b"\n" != sidecar_storage:
        raise ProcessCompletionError("completion observation is not canonical storage")
    actual_receipt = _regular(receipt_path(root, slot, cell), "completed driver receipt") if receipt_storage is None else receipt_storage
    return _validate_completion_record(observation, actual_receipt, root, slot, cell)


def _synthetic_receipt(root: Path, slot: str, cell: str, run_id: str) -> bytes:
    values = {key: None for key in RECEIPT_KEYS}
    values.update({
        "schema_id": RECEIPT_SCHEMA_ID, "candidate_id": CANDIDATE_ID,
        "run_id": run_id, "slot": slot, "cell": cell,
        "execution_root": str(root), "status": "completed",
        "subject_call_started": True, "first_attempt_subject_call": True,
        "retry_count": 0, "best_of": False, "replacement_result": False,
    })
    return canonical(values) + b"\n"


def _synthetic_observation(root: Path, slot: str, cell: str, run_id: str, receipt: bytes) -> dict[str, Any]:
    argv = driver_argv(run_id, root, slot, cell)
    argv_storage = canonical(argv)
    values = {
        "schema_id": COMPLETION_SCHEMA_ID, "candidate_id": CANDIDATE_ID,
        "run_id": run_id, "slot": slot, "cell": cell,
        "execution_root": str(root), "status": "COMPLETED_RECEIPT_PERSISTED_AFTER_OUTER_EXIT",
        "driver_argv": argv, "driver_argv_sha256": sha(argv_storage), "driver_argv_bytes": len(argv_storage),
        "child_process_started": True, "child_live_poll_observed": True, "child_poll_count": 2,
        "child_process_exited": True, "child_exit_code": 0, "child_stdout_fully_captured": True,
        "child_stderr_sha256": sha(b""), "child_stderr_bytes": 0,
        "outer_exec_live_session_observed": True, "outer_exec_session_id": 73, "outer_exec_poll_count": 2,
        "outer_exec_terminal_observed": True, "outer_exec_exit_code": 0, "outer_exec_stdout_fully_captured": True,
        "receipt_relative_path": receipt_relative_path(slot, cell),
        "receipt_storage_sha256": sha(receipt), "receipt_storage_bytes": len(receipt),
        "persistence_method": "external_apply_patch_create_only", "persisted_only_after_outer_exit": True,
    }
    return {key: values[key] for key in COMPLETION_KEYS}


def process_completion_holdouts() -> dict[str, Any]:
    root = SUCCESSOR / "synthetic-candidate-v11-process-root"
    slot, cell, run_id = "slot-alpha", "SYNTHETIC_CELL", "synthetic-c10-run"
    receipt = _synthetic_receipt(root, slot, cell, run_id)
    baseline = _synthetic_observation(root, slot, cell, run_id, receipt)
    results: list[dict[str, Any]] = []
    _validate_completion_record(baseline, receipt, root, slot, cell)
    results.append({"case_id": "CF-R8-72-valid-exited-zero-complete-stdout-observation-admitted", "result": "PASS"})

    def reject(case_id: str, observation: dict[str, Any], candidate_receipt: bytes) -> None:
        try:
            _validate_completion_record(observation, candidate_receipt, root, slot, cell)
        except ProcessCompletionError:
            results.append({"case_id": case_id, "result": "REJECT"})
        else:
            raise ProcessCompletionError(f"holdout admitted invalid completion: {case_id}")

    empty = copy.deepcopy(baseline)
    empty["receipt_storage_sha256"], empty["receipt_storage_bytes"] = sha(b""), 0
    reject("CF-R8-73-empty-driver-stdout-rejected", empty, b"")
    partial_bytes = receipt[: max(1, len(receipt) // 2)]
    partial = copy.deepcopy(baseline)
    partial["receipt_storage_sha256"], partial["receipt_storage_bytes"] = sha(partial_bytes), len(partial_bytes)
    reject("CF-R8-74-partial-driver-stdout-rejected", partial, partial_bytes)
    incomplete = copy.deepcopy(baseline)
    incomplete["child_process_exited"] = False
    incomplete["child_exit_code"] = None
    incomplete["child_stdout_fully_captured"] = False
    incomplete["outer_exec_terminal_observed"] = False
    incomplete["outer_exec_exit_code"] = None
    incomplete["outer_exec_stdout_fully_captured"] = False
    reject("CF-R8-75-unexited-driver-stdout-rejected", incomplete, receipt)
    return {
        "schema_id": "pw-r8-process-completion-holdouts-v1",
        "candidate_id": CANDIDATE_ID,
        "cases": 4,
        "results": results,
        "answer_cell_model_specific_logic": False,
        "subject_calls": 0,
        "provider_calls": 0,
    }


def delayed_process_holdouts() -> dict[str, Any]:
    root = SUCCESSOR / "synthetic-candidate-v11-process-root"
    slot, cell, run_id = "slot-alpha", "SYNTHETIC_CELL", "synthetic-c10-run"
    receipt = _synthetic_receipt(root, slot, cell, run_id)
    script = "import sys,time;time.sleep(.08);sys.stdout.buffer.write(%r)" % receipt
    stdout, seed = _run_child([str(Path(sys.executable).resolve()), "-B", "-c", script], run_id, root, slot, cell)
    if stdout != receipt or seed["child_live_poll_observed"] is not True or seed["child_poll_count"] < 1:
        raise ProcessCompletionError("delayed success did not prove live polling and full capture")
    results = [{"case": "delayed_complete_receipt", "result": "PASS", "live_polls": seed["child_poll_count"]}]
    bad_cases = (
        ("delayed_empty_stdout", "import time;time.sleep(.08)", "empty"),
        ("delayed_partial_stdout", "import sys,time;time.sleep(.08);sys.stdout.write('{')", "partial"),
        ("delayed_nonzero_after_receipt", script + ";sys.exit(7)", "nonzero"),
    )
    for name, child_script, _ in bad_cases:
        try:
            _run_child([str(Path(sys.executable).resolve()), "-B", "-c", child_script], run_id, root, slot, cell)
        except ProcessCompletionError:
            results.append({"case": name, "result": "REJECT"})
        else:
            raise ProcessCompletionError(f"delayed invalid child admitted: {name}")
    return {"schema_id": "pw-r8-delayed-process-holdouts-v1", "cases": 4, "results": results, "filesystem_writes": 0, "subject_calls": 0, "provider_calls": 0}


def self_test() -> dict[str, Any]:
    return {
        "schema_id": "pw-r8-process-controller-self-test-v1",
        "candidate_id": CANDIDATE_ID,
        "status": "PASS",
        "interface": process_completion_holdouts(),
        "delayed_process": delayed_process_holdouts(),
        "filesystem_writes": 0,
        "subject_calls": 0,
        "provider_calls": 0,
    }


def parser() -> argparse.ArgumentParser:
    p = argparse.ArgumentParser()
    sub = p.add_subparsers(dest="command", required=True)
    q = sub.add_parser("run")
    q.add_argument("--run-id", required=True)
    q.add_argument("--execution-root", required=True)
    q.add_argument("--slot", choices=SLOTS, required=True)
    q.add_argument("--cell", required=True)
    sub.add_parser("self-test")
    return p


def main() -> int:
    args = parser().parse_args()
    try:
        value = self_test() if args.command == "self-test" else run(args.run_id, args.execution_root, args.slot, args.cell)
    except ProcessCompletionError as exc:
        sys.stderr.write(canonical({"schema_id": "pw-r8-process-controller-error-v1", "candidate_id": CANDIDATE_ID, "status": "REJECT", "error": str(exc)}).decode("utf-8") + "\n")
        return 1
    sys.stdout.buffer.write(canonical(value) + b"\n")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
