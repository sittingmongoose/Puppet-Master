#!/usr/bin/env python3
"""No-write pre-dispatch and completion gate for candidate-12.

Before Popen, the controller independently renders the current cell and binds
the exact, stable, regular non-link rendered file.  After Popen, INT/TERM stop
requests are deferred: every exit path remains unsafe until the external
controller create-only persists and reopens the receipt, completion sidecar,
capture, score, and successful validate-cell chain.
"""
from __future__ import annotations

import argparse
import copy
import hashlib
import json
import os
from pathlib import Path
import re
import signal
import stat
import subprocess
import sys
from typing import Any

sys.dont_write_bytecode = True

REPO = Path("/mnt/Cursor/PuppetMaster")
SUCCESSOR = REPO / "tests/agent_packet_restrictions/successor_20260813"
ROOT = SUCCESSOR / "model_retest_r8_candidate_v12"
HARNESS = ROOT / "r8_harness.py"
DRIVER = ROOT / "r8_subject_task_driver.py"
CANDIDATE_ID = "PW-R8-ITERATIVE-FIX-TWO-CLEAN-RUNS-20260815.CANDIDATE-12"
RECEIPT_SCHEMA_ID = "pw-r8-direct-appserver-subject-receipt-v4"
COMPLETION_SCHEMA_ID = "pw-r8-invocation-completion-observation-v2"
RENDER_OBSERVATION_SCHEMA_ID = "pw-r8-pre-dispatch-render-observation-v1"
CELL_TRANSACTION_SCHEMA_ID = "pw-r8-cell-transaction-state-v1"
TERMINAL_ENVELOPE_SCHEMA_ID = "pw-r8-process-controller-terminal-envelope-v2"
RUN_ID_RE = re.compile(r"^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$")
CELL_RE = re.compile(r"^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$")
HEX64_RE = re.compile(r"^[0-9a-f]{64}$")
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
RENDER_OBSERVATION_KEYS = (
    "schema_id","candidate_id","run_id","slot","cell","execution_root",
    "rendered_relative_path","storage_sha256","storage_bytes",
    "provider_visible_payload_sha256","provider_visible_payload_bytes",
    "lstat_dev","lstat_ino","lstat_size","lstat_mtime_ns",
    "expected_storage_sha256","expected_storage_bytes","exact_one_terminal_lf",
    "regular_nonlink","stable_across_independent_render","observed_equals_expected",
    "observation_phase",
)
COMPLETION_KEYS = (
    "schema_id","candidate_id","run_id","slot","cell","execution_root","status",
    "pre_dispatch_render_observation",
    "driver_argv","driver_argv_sha256","driver_argv_bytes",
    "child_process_started","child_live_poll_observed","child_poll_count",
    "child_process_exited","child_exit_code","child_stdout_fully_captured",
    "child_stderr_sha256","child_stderr_bytes",
    "outer_exec_live_session_observed","outer_exec_session_id","outer_exec_poll_count",
    "outer_exec_terminal_observed","outer_exec_exit_code","outer_exec_stdout_fully_captured",
    "receipt_relative_path","receipt_storage_sha256","receipt_storage_bytes",
    "persistence_method","persisted_only_after_outer_exit",
    "cell_transaction_state","stop_disposition",
)
SEED_KEYS = (
    "schema_id","candidate_id","run_id","slot","cell","execution_root","status",
    "pre_dispatch_render_observation",
    "driver_argv","driver_argv_sha256","driver_argv_bytes",
    "child_process_started","child_live_poll_observed","child_poll_count",
    "child_process_exited","child_exit_code","child_stdout_fully_captured",
    "child_stderr_sha256","child_stderr_bytes",
    "receipt_relative_path","receipt_storage_sha256","receipt_storage_bytes",
    "cell_transaction_state","stop_disposition",
)
TERMINAL_ENVELOPE_KEYS = (
    "schema_id","candidate_id","run_id","slot","cell","execution_root","status",
    "completion_seed","receipt_storage_utf8","cell_transaction_state",
    "stop_disposition","deferred_stop_signal_names",
    "external_outer_exec_completion_fields_required","persistence_authority",
)
TRANSACTION_KEYS = (
    "schema_id","candidate_id","state","stop_disposition",
    "invocation_started","envelope_ready","receipt_persisted",
    "completion_persisted","capture_persisted","score_persisted",
    "validate_cell_passed","exact_chain_reopened","safe_boundary",
    "must_seal_current_cell",
)


class ProcessCompletionError(RuntimeError):
    def __init__(self, message: str, *, invocation_started: bool = False) -> None:
        super().__init__(message)
        self.invocation_started = invocation_started


def canonical(value: Any) -> bytes:
    return json.dumps(value, ensure_ascii=False, separators=(",", ":")).encode("utf-8")


def sha(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def _execution_root(value: str | Path) -> Path:
    path = Path(value).resolve()
    if not path.is_relative_to(SUCCESSOR.resolve()):
        raise ProcessCompletionError("execution root must remain beneath successor_20260813")
    return path


def _validate_identity(run_id: str, slot: str, cell: str) -> None:
    if not RUN_ID_RE.fullmatch(run_id):
        raise ProcessCompletionError("invalid run id")
    if slot not in SLOTS or not CELL_RE.fullmatch(cell):
        raise ProcessCompletionError("invalid slot or cell")


def rendered_relative_path(slot: str, cell: str) -> str:
    return f"{slot}/rendered/{cell}.txt"


def rendered_path(execution_root: str | Path, slot: str, cell: str) -> Path:
    return _execution_root(execution_root) / rendered_relative_path(slot, cell)


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


def render_argv(execution_root: Path, slot: str, cell: str) -> list[str]:
    return [
        str(Path(sys.executable).resolve()), "-B", str(HARNESS), "render",
        "--execution-root", str(execution_root), "--slot", slot, "--cell", cell,
    ]


def _regular(path: Path, label: str) -> tuple[bytes, tuple[int, int, int, int]]:
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
    before_id = (before.st_dev, before.st_ino, before.st_size, before.st_mtime_ns)
    opened_id = (opened.st_dev, opened.st_ino, opened.st_size, opened.st_mtime_ns)
    after_id = (after.st_dev, after.st_ino, after.st_size, after.st_mtime_ns)
    if before_id != opened_id or opened_id != after_id:
        raise ProcessCompletionError(f"{label} changed during read")
    storage = b"".join(chunks)
    if len(storage) != opened.st_size:
        raise ProcessCompletionError(f"{label} byte count changed during read")
    return storage, after_id


def _validate_render_pair(
    observed: bytes | None, expected: bytes, *, regular_nonlink: bool, stable: bool,
) -> None:
    if observed is None:
        raise ProcessCompletionError("missing persisted rendered packet")
    if not regular_nonlink:
        raise ProcessCompletionError("persisted rendered packet is not a regular non-link")
    if not stable:
        raise ProcessCompletionError("persisted rendered packet changed across independent render")
    for label, storage in (("persisted", observed), ("expected", expected)):
        if not storage or not storage.endswith(b"\n") or storage.endswith(b"\n\n"):
            raise ProcessCompletionError(f"{label} rendered packet must have exactly one terminal LF")
    if observed != expected:
        raise ProcessCompletionError("persisted rendered packet differs from independent current render")


def _expected_render(execution_root: Path, slot: str, cell: str) -> bytes:
    completed = subprocess.run(
        render_argv(execution_root, slot, cell), cwd=REPO, stdin=subprocess.DEVNULL,
        stdout=subprocess.PIPE, stderr=subprocess.PIPE, check=False,
        env={**os.environ, "PYTHONDONTWRITEBYTECODE": "1"},
    )
    if completed.returncode != 0:
        raise ProcessCompletionError(
            "independent current-cell render failed: "
            f"exit_code={completed.returncode}; stderr_sha256={sha(completed.stderr)}; "
            f"stderr_bytes={len(completed.stderr)}"
        )
    return completed.stdout


def _render_observation(
    run_id: str, execution_root: Path, slot: str, cell: str,
    storage: bytes, identity: tuple[int, int, int, int], expected: bytes,
) -> dict[str, Any]:
    payload = storage[:-1]
    values = {
        "schema_id": RENDER_OBSERVATION_SCHEMA_ID,
        "candidate_id": CANDIDATE_ID,
        "run_id": run_id,
        "slot": slot,
        "cell": cell,
        "execution_root": str(execution_root),
        "rendered_relative_path": rendered_relative_path(slot, cell),
        "storage_sha256": sha(storage),
        "storage_bytes": len(storage),
        "provider_visible_payload_sha256": sha(payload),
        "provider_visible_payload_bytes": len(payload),
        "lstat_dev": identity[0],
        "lstat_ino": identity[1],
        "lstat_size": identity[2],
        "lstat_mtime_ns": identity[3],
        "expected_storage_sha256": sha(expected),
        "expected_storage_bytes": len(expected),
        "exact_one_terminal_lf": True,
        "regular_nonlink": True,
        "stable_across_independent_render": True,
        "observed_equals_expected": True,
        "observation_phase": "BEFORE_SUBJECT_PROCESS_START",
    }
    return {key: values[key] for key in RENDER_OBSERVATION_KEYS}


def validate_persisted_render(
    execution_root: str | Path, slot: str, cell: str, run_id: str,
) -> dict[str, Any]:
    """Reopen and independently render the exact persisted cell before Popen."""
    _validate_identity(run_id, slot, cell)
    root = _execution_root(execution_root)
    path = rendered_path(root, slot, cell)
    before, before_id = _regular(path, "persisted pre-dispatch rendered packet")
    expected = _expected_render(root, slot, cell)
    after, after_id = _regular(path, "persisted pre-dispatch rendered packet")
    stable = before_id == after_id and before == after
    _validate_render_pair(before, expected, regular_nonlink=True, stable=stable)
    return _render_observation(run_id, root, slot, cell, before, before_id, expected)


def _validate_render_observation_record(
    observation: Any, execution_root: Path, slot: str, cell: str, run_id: str,
    *, reopen: bool,
) -> dict[str, Any]:
    if not isinstance(observation, dict) or tuple(observation) != RENDER_OBSERVATION_KEYS:
        raise ProcessCompletionError("pre-dispatch render observation outside exact closed world")
    exact = {
        "schema_id": RENDER_OBSERVATION_SCHEMA_ID,
        "candidate_id": CANDIDATE_ID,
        "run_id": run_id,
        "slot": slot,
        "cell": cell,
        "execution_root": str(execution_root),
        "rendered_relative_path": rendered_relative_path(slot, cell),
        "exact_one_terminal_lf": True,
        "regular_nonlink": True,
        "stable_across_independent_render": True,
        "observed_equals_expected": True,
        "observation_phase": "BEFORE_SUBJECT_PROCESS_START",
    }
    for key, value in exact.items():
        if type(observation.get(key)) is not type(value) or observation.get(key) != value:
            raise ProcessCompletionError(f"pre-dispatch render observation mismatch: {key}")
    for key in ("storage_sha256", "provider_visible_payload_sha256", "expected_storage_sha256"):
        if not isinstance(observation.get(key), str) or not HEX64_RE.fullmatch(observation[key]):
            raise ProcessCompletionError(f"pre-dispatch render observation invalid: {key}")
    for key in (
        "storage_bytes","provider_visible_payload_bytes","lstat_dev","lstat_ino",
        "lstat_size","lstat_mtime_ns","expected_storage_bytes",
    ):
        if type(observation.get(key)) is not int or observation[key] < 0:
            raise ProcessCompletionError(f"pre-dispatch render observation invalid: {key}")
    if observation["lstat_size"] != observation["storage_bytes"]:
        raise ProcessCompletionError("pre-dispatch render lstat/storage byte mismatch")
    if observation["provider_visible_payload_bytes"] != observation["storage_bytes"] - 1:
        raise ProcessCompletionError("pre-dispatch provider payload byte mismatch")
    if (observation["storage_sha256"], observation["storage_bytes"]) != (
        observation["expected_storage_sha256"], observation["expected_storage_bytes"]
    ):
        raise ProcessCompletionError("pre-dispatch observed/expected binding mismatch")
    if reopen:
        current, current_id = _regular(
            rendered_path(execution_root, slot, cell), "persisted rendered packet at verifier admission"
        )
        expected = _expected_render(execution_root, slot, cell)
        _validate_render_pair(current, expected, regular_nonlink=True, stable=True)
        bound_id = tuple(observation[key] for key in ("lstat_dev","lstat_ino","lstat_size","lstat_mtime_ns"))
        if current_id != bound_id:
            raise ProcessCompletionError("rendered packet identity changed after pre-dispatch observation")
        payload = current[:-1]
        bindings = (
            sha(current), len(current), sha(payload), len(payload), sha(expected), len(expected)
        )
        observed = tuple(observation[key] for key in (
            "storage_sha256","storage_bytes","provider_visible_payload_sha256",
            "provider_visible_payload_bytes","expected_storage_sha256","expected_storage_bytes",
        ))
        if observed != bindings:
            raise ProcessCompletionError("rendered packet bytes changed after pre-dispatch observation")
    return observation


def _validate_receipt_storage(
    storage: bytes, run_id: str, execution_root: Path, slot: str, cell: str,
    render_observation: dict[str, Any] | None = None,
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
    if render_observation is not None:
        render_binding = (
            render_observation["storage_sha256"], render_observation["storage_bytes"],
            render_observation["provider_visible_payload_sha256"],
            render_observation["provider_visible_payload_bytes"],
        )
        receipt_binding = (
            receipt.get("render_storage_sha256"), receipt.get("render_storage_bytes"),
            receipt.get("provider_visible_payload_sha256"), receipt.get("provider_visible_payload_bytes"),
        )
        if receipt_binding != render_binding:
            raise ProcessCompletionError("receipt differs from pre-dispatch rendered observation")
        if (receipt.get("semantic_packet_sha256"), receipt.get("semantic_packet_bytes")) != render_binding[2:]:
            raise ProcessCompletionError("receipt semantic packet differs from pre-dispatch rendered observation")
    return receipt


def cell_transaction_state(
    *, invocation_started: bool, envelope_ready: bool, receipt_persisted: bool,
    completion_persisted: bool, capture_persisted: bool, score_persisted: bool,
    validate_cell_passed: bool, exact_chain_reopened: bool,
) -> dict[str, Any]:
    flags = (
        invocation_started,envelope_ready,receipt_persisted,completion_persisted,
        capture_persisted,score_persisted,validate_cell_passed,exact_chain_reopened,
    )
    if any(type(value) is not bool for value in flags):
        raise ProcessCompletionError("cell transaction flags must be booleans")
    if not invocation_started and any(flags[1:]):
        raise ProcessCompletionError("cell transaction has evidence before invocation")
    if envelope_ready and not invocation_started:
        raise ProcessCompletionError("cell transaction envelope precedes invocation")
    if (receipt_persisted or completion_persisted) and not envelope_ready:
        raise ProcessCompletionError("cell transaction persistence precedes envelope")
    if capture_persisted and not (receipt_persisted and completion_persisted):
        raise ProcessCompletionError("cell transaction capture precedes receipt/completion")
    if score_persisted and not capture_persisted:
        raise ProcessCompletionError("cell transaction score precedes capture")
    if validate_cell_passed and not score_persisted:
        raise ProcessCompletionError("cell transaction validation precedes score")
    if exact_chain_reopened and not validate_cell_passed:
        raise ProcessCompletionError("cell transaction reopen precedes validation")

    if not invocation_started:
        state, disposition, safe, must_seal = (
            "BEFORE_START_SAFE", "SAFE_STOP_BEFORE_START", True, False
        )
    elif all(flags):
        state, disposition, safe, must_seal = (
            "FULL_CHAIN_SEALED_SAFE", "SAFE_STOP_AFTER_CURRENT_CELL", True, False
        )
    elif not envelope_ready:
        state, disposition, safe, must_seal = (
            "CHILD_RUNNING_UNSEALED", "MUST_SEAL_CURRENT_CELL", False, True
        )
    elif not receipt_persisted and not completion_persisted:
        state, disposition, safe, must_seal = (
            "ENVELOPE_READY_UNSEALED", "MUST_SEAL_CURRENT_CELL", False, True
        )
    elif receipt_persisted and completion_persisted and not capture_persisted:
        state, disposition, safe, must_seal = (
            "RECEIPT_AND_COMPLETION_PERSISTED_UNSEALED",
            "MUST_SEAL_CURRENT_CELL", False, True
        )
    else:
        state, disposition, safe, must_seal = (
            "PERSISTENCE_IN_PROGRESS_UNSEALED", "MUST_SEAL_CURRENT_CELL", False, True
        )
    values = {
        "schema_id": CELL_TRANSACTION_SCHEMA_ID,
        "candidate_id": CANDIDATE_ID,
        "state": state,
        "stop_disposition": disposition,
        "invocation_started": invocation_started,
        "envelope_ready": envelope_ready,
        "receipt_persisted": receipt_persisted,
        "completion_persisted": completion_persisted,
        "capture_persisted": capture_persisted,
        "score_persisted": score_persisted,
        "validate_cell_passed": validate_cell_passed,
        "exact_chain_reopened": exact_chain_reopened,
        "safe_boundary": safe,
        "must_seal_current_cell": must_seal,
    }
    return {key: values[key] for key in TRANSACTION_KEYS}


def _run_child(
    argv: list[str], run_id: str, execution_root: Path, slot: str, cell: str,
    render_observation: dict[str, Any],
) -> tuple[bytes, dict[str, Any]]:
    argv_storage = canonical(argv)
    process = subprocess.Popen(
        argv, cwd=REPO, stdin=subprocess.DEVNULL,
        stdout=subprocess.PIPE, stderr=subprocess.PIPE, start_new_session=True,
        env={**os.environ, "PYTHONDONTWRITEBYTECODE": "1"},
    )
    try:
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
                f"child process did not complete successfully: exit_code={exit_code}; "
                f"stderr_sha256={sha(stderr)}; stderr_bytes={len(stderr)}"
            )
        _validate_receipt_storage(
            stdout, run_id, execution_root, slot, cell, render_observation=render_observation
        )
    except ProcessCompletionError as exc:
        exc.invocation_started = True
        raise
    transaction = cell_transaction_state(
        invocation_started=True, envelope_ready=True, receipt_persisted=False,
        completion_persisted=False, capture_persisted=False, score_persisted=False,
        validate_cell_passed=False, exact_chain_reopened=False,
    )
    seed_values = {
        "schema_id": COMPLETION_SCHEMA_ID,
        "candidate_id": CANDIDATE_ID,
        "run_id": run_id,
        "slot": slot,
        "cell": cell,
        "execution_root": str(execution_root),
        "status": "CHILD_COMPLETED_RECEIPT_READY_CURRENT_CELL_MUST_SEAL",
        "pre_dispatch_render_observation": render_observation,
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
        "cell_transaction_state": transaction["state"],
        "stop_disposition": transaction["stop_disposition"],
    }
    return stdout, {key: seed_values[key] for key in SEED_KEYS}


def run(run_id: str, execution_root: str | Path, slot: str, cell: str) -> dict[str, Any]:
    _validate_identity(run_id, slot, cell)
    root = _execution_root(execution_root)
    # This gate is intentionally before driver_argv is passed to Popen.
    render_observation = validate_persisted_render(root, slot, cell, run_id)
    stdout, seed = _run_child(
        driver_argv(run_id, root, slot, cell), run_id, root, slot, cell,
        render_observation,
    )
    transaction = cell_transaction_state(
        invocation_started=True, envelope_ready=True, receipt_persisted=False,
        completion_persisted=False, capture_persisted=False, score_persisted=False,
        validate_cell_passed=False, exact_chain_reopened=False,
    )
    values = {
        "schema_id": TERMINAL_ENVELOPE_SCHEMA_ID,
        "candidate_id": CANDIDATE_ID,
        "run_id": run_id,
        "slot": slot,
        "cell": cell,
        "execution_root": str(root),
        "status": "TERMINAL_CHILD_EXIT_ZERO_FULL_RECEIPT_CAPTURED_MUST_SEAL_CURRENT_CELL",
        "completion_seed": seed,
        "receipt_storage_utf8": stdout.decode("utf-8"),
        "cell_transaction_state": transaction["state"],
        "stop_disposition": transaction["stop_disposition"],
        "deferred_stop_signal_names": [],
        "external_outer_exec_completion_fields_required": [
            "outer_exec_live_session_observed","outer_exec_session_id","outer_exec_poll_count",
            "outer_exec_terminal_observed","outer_exec_exit_code","outer_exec_stdout_fully_captured",
        ],
        "persistence_authority": (
            "external_apply_patch_create_only_then_reopen_receipt_completion_capture_score_"
            "and_validate_cell_before_safe_stop"
        ),
    }
    return {key: values[key] for key in TERMINAL_ENVELOPE_KEYS}


def _validate_completion_record(
    observation: Any, storage: bytes, execution_root: Path, slot: str, cell: str,
    *, reopen_render: bool = True,
) -> dict[str, Any]:
    if not isinstance(observation, dict) or tuple(observation) != COMPLETION_KEYS:
        raise ProcessCompletionError("completion observation outside exact v2 closed world")
    run_id = observation.get("run_id")
    if not isinstance(run_id, str) or not RUN_ID_RE.fullmatch(run_id):
        raise ProcessCompletionError("completion run id invalid")
    render_observation = _validate_render_observation_record(
        observation.get("pre_dispatch_render_observation"), execution_root, slot, cell,
        run_id, reopen=reopen_render,
    )
    _validate_receipt_storage(
        storage, run_id, execution_root, slot, cell, render_observation=render_observation
    )
    exact = {
        "schema_id": COMPLETION_SCHEMA_ID,
        "candidate_id": CANDIDATE_ID,
        "slot": slot,
        "cell": cell,
        "execution_root": str(execution_root),
        "status": "COMPLETED_RECEIPT_PERSISTED_CURRENT_CELL_MUST_SEAL",
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
        "cell_transaction_state": "RECEIPT_AND_COMPLETION_PERSISTED_UNSEALED",
        "stop_disposition": "MUST_SEAL_CURRENT_CELL",
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
    if (observation.get("driver_argv_sha256"), observation.get("driver_argv_bytes")) != (
        sha(argv_storage), len(argv_storage)
    ):
        raise ProcessCompletionError("driver argv storage binding mismatch")
    child_live, child_polls = observation.get("child_live_poll_observed"), observation.get("child_poll_count")
    if type(child_live) is not bool or type(child_polls) is not int or child_polls < 0 or child_live != (child_polls > 0):
        raise ProcessCompletionError("child polling observation invalid")
    if not isinstance(observation.get("child_stderr_sha256"), str) or not HEX64_RE.fullmatch(observation["child_stderr_sha256"]):
        raise ProcessCompletionError("child stderr hash invalid")
    if type(observation.get("child_stderr_bytes")) is not int or observation["child_stderr_bytes"] < 0:
        raise ProcessCompletionError("child stderr bytes invalid")
    outer_live, outer_session, outer_polls = (
        observation.get("outer_exec_live_session_observed"),
        observation.get("outer_exec_session_id"), observation.get("outer_exec_poll_count"),
    )
    if type(outer_live) is not bool or type(outer_polls) is not int or outer_polls < 0:
        raise ProcessCompletionError("outer exec polling observation invalid")
    if outer_live:
        if not isinstance(outer_session, (str, int)) or isinstance(outer_session, bool) or str(outer_session) == "" or outer_polls < 1:
            raise ProcessCompletionError("live outer exec was not polled through exit")
    elif outer_session is not None or outer_polls != 0:
        raise ProcessCompletionError("non-live outer exec has impossible session/poll evidence")
    return observation


def validate_persisted_completion(
    execution_root: str | Path, slot: str, cell: str,
    receipt_storage: bytes | None = None,
) -> dict[str, Any]:
    if slot not in SLOTS or not CELL_RE.fullmatch(cell):
        raise ProcessCompletionError("invalid slot or cell")
    root = _execution_root(execution_root)
    sidecar_storage, _ = _regular(
        completion_path(root, slot, cell), "invocation completion observation"
    )
    if not sidecar_storage.endswith(b"\n") or sidecar_storage.endswith(b"\n\n"):
        raise ProcessCompletionError("completion observation must have exactly one terminal LF")
    try:
        observation = json.loads(sidecar_storage[:-1])
    except (UnicodeDecodeError, json.JSONDecodeError) as exc:
        raise ProcessCompletionError("completion observation is invalid JSON") from exc
    if canonical(observation) + b"\n" != sidecar_storage:
        raise ProcessCompletionError("completion observation is not canonical storage")
    actual_receipt = (
        _regular(receipt_path(root, slot, cell), "completed driver receipt")[0]
        if receipt_storage is None else receipt_storage
    )
    return _validate_completion_record(observation, actual_receipt, root, slot, cell)


def _synthetic_render_observation(
    root: Path, slot: str, cell: str, run_id: str, rendered: bytes,
) -> dict[str, Any]:
    return _render_observation(run_id, root, slot, cell, rendered, (1, 2, len(rendered), 3), rendered)


def _synthetic_receipt(
    root: Path, slot: str, cell: str, run_id: str, rendered: bytes,
) -> bytes:
    values = {key: None for key in RECEIPT_KEYS}
    payload = rendered[:-1]
    values.update({
        "schema_id": RECEIPT_SCHEMA_ID, "candidate_id": CANDIDATE_ID,
        "run_id": run_id, "slot": slot, "cell": cell,
        "execution_root": str(root), "status": "completed",
        "subject_call_started": True, "first_attempt_subject_call": True,
        "retry_count": 0, "best_of": False, "replacement_result": False,
        "render_storage_sha256": sha(rendered), "render_storage_bytes": len(rendered),
        "provider_visible_payload_sha256": sha(payload), "provider_visible_payload_bytes": len(payload),
        "semantic_packet_sha256": sha(payload), "semantic_packet_bytes": len(payload),
    })
    return canonical(values) + b"\n"


def _synthetic_observation(
    root: Path, slot: str, cell: str, run_id: str, receipt: bytes, rendered: bytes,
) -> dict[str, Any]:
    argv = driver_argv(run_id, root, slot, cell)
    argv_storage = canonical(argv)
    values = {
        "schema_id": COMPLETION_SCHEMA_ID, "candidate_id": CANDIDATE_ID,
        "run_id": run_id, "slot": slot, "cell": cell,
        "execution_root": str(root),
        "status": "COMPLETED_RECEIPT_PERSISTED_CURRENT_CELL_MUST_SEAL",
        "pre_dispatch_render_observation": _synthetic_render_observation(root, slot, cell, run_id, rendered),
        "driver_argv": argv, "driver_argv_sha256": sha(argv_storage), "driver_argv_bytes": len(argv_storage),
        "child_process_started": True, "child_live_poll_observed": True, "child_poll_count": 2,
        "child_process_exited": True, "child_exit_code": 0, "child_stdout_fully_captured": True,
        "child_stderr_sha256": sha(b""), "child_stderr_bytes": 0,
        "outer_exec_live_session_observed": True, "outer_exec_session_id": 73, "outer_exec_poll_count": 2,
        "outer_exec_terminal_observed": True, "outer_exec_exit_code": 0, "outer_exec_stdout_fully_captured": True,
        "receipt_relative_path": receipt_relative_path(slot, cell),
        "receipt_storage_sha256": sha(receipt), "receipt_storage_bytes": len(receipt),
        "persistence_method": "external_apply_patch_create_only", "persisted_only_after_outer_exit": True,
        "cell_transaction_state": "RECEIPT_AND_COMPLETION_PERSISTED_UNSEALED",
        "stop_disposition": "MUST_SEAL_CURRENT_CELL",
    }
    return {key: values[key] for key in COMPLETION_KEYS}


def process_completion_holdouts() -> dict[str, Any]:
    root = SUCCESSOR / "synthetic-candidate-v12-process-root"
    slot, cell, run_id = "slot-alpha", "SYNTHETIC_CELL", "synthetic-c12-run"
    rendered = b"synthetic semantic packet\n"
    receipt = _synthetic_receipt(root, slot, cell, run_id, rendered)
    baseline = _synthetic_observation(root, slot, cell, run_id, receipt, rendered)
    results: list[dict[str, Any]] = []
    _validate_completion_record(baseline, receipt, root, slot, cell, reopen_render=False)
    results.append({"case_id": "CF-R8-72-valid-exited-zero-complete-stdout-observation-admitted", "result": "PASS"})

    def reject(case_id: str, observation: dict[str, Any], candidate_receipt: bytes) -> None:
        try:
            _validate_completion_record(
                observation, candidate_receipt, root, slot, cell, reopen_render=False
            )
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
        "schema_id": "pw-r8-process-completion-holdouts-v2",
        "candidate_id": CANDIDATE_ID, "cases": 4, "results": results,
        "answer_cell_model_specific_logic": False,
        "subject_calls": 0, "provider_calls": 0,
    }


def predispatch_render_holdouts() -> dict[str, Any]:
    good = b"generic semantic packet\n"
    cases: list[tuple[str, bytes | None, bytes, bool, bool, str]] = [
        ("CF-R8-76-valid-persisted-render-admitted", good, good, True, True, "PASS"),
        ("CF-R8-77-missing-persisted-render-rejected-no-start", None, good, True, True, "REJECT"),
        ("CF-R8-78-two-terminal-lf-render-rejected-no-start", good + b"\n", good, True, True, "REJECT"),
        ("CF-R8-79-render-byte-drift-rejected-no-start", b"generic semantic packeu\n", good, True, True, "REJECT"),
        ("CF-R8-80-nonregular-render-rejected-no-start", good, good, False, True, "REJECT"),
        ("CF-R8-81-render-mutation-across-preflight-rejected-no-start", good, good, True, False, "REJECT"),
    ]
    results = []
    for case_id, observed, expected, regular, stable, wanted in cases:
        try:
            _validate_render_pair(observed, expected, regular_nonlink=regular, stable=stable)
        except ProcessCompletionError:
            actual = "REJECT"
        else:
            actual = "PASS"
        if actual != wanted:
            raise ProcessCompletionError(f"render holdout mismatch: {case_id}")
        results.append({"case_id": case_id, "result": actual, "subject_call_started": False})
    return {
        "schema_id": "pw-r8-pre-dispatch-render-holdouts-v1",
        "candidate_id": CANDIDATE_ID, "cases": len(results), "results": results,
        "answer_cell_model_specific_logic": False,
        "filesystem_writes": 0, "subject_calls": 0, "provider_calls": 0,
    }


def safe_boundary_holdouts() -> dict[str, Any]:
    vectors = (
        ("CF-R8-82-stop-before-start-safe", (False,False,False,False,False,False,False,False), "SAFE_STOP_BEFORE_START"),
        ("CF-R8-83-stop-during-child-must-seal", (True,False,False,False,False,False,False,False), "MUST_SEAL_CURRENT_CELL"),
        ("CF-R8-84-stop-after-envelope-before-persistence-must-seal", (True,True,False,False,False,False,False,False), "MUST_SEAL_CURRENT_CELL"),
        ("CF-R8-85-stop-after-full-chain-safe", (True,True,True,True,True,True,True,True), "SAFE_STOP_AFTER_CURRENT_CELL"),
    )
    results = []
    for case_id, flags, expected in vectors:
        state = cell_transaction_state(
            invocation_started=flags[0], envelope_ready=flags[1], receipt_persisted=flags[2],
            completion_persisted=flags[3], capture_persisted=flags[4], score_persisted=flags[5],
            validate_cell_passed=flags[6], exact_chain_reopened=flags[7],
        )
        if state["stop_disposition"] != expected:
            raise ProcessCompletionError(f"safe-boundary holdout mismatch: {case_id}")
        results.append({"case_id": case_id, "result": "PASS", "state": state["state"], "stop_disposition": expected})
    return {
        "schema_id": "pw-r8-safe-boundary-holdouts-v1",
        "candidate_id": CANDIDATE_ID, "cases": len(results), "results": results,
        "answer_cell_model_specific_logic": False,
        "filesystem_writes": 0, "subject_calls": 0, "provider_calls": 0,
    }


def delayed_process_holdouts() -> dict[str, Any]:
    root = SUCCESSOR / "synthetic-candidate-v12-process-root"
    slot, cell, run_id = "slot-alpha", "SYNTHETIC_CELL", "synthetic-c12-run"
    rendered = b"synthetic semantic packet\n"
    render_observation = _synthetic_render_observation(root, slot, cell, run_id, rendered)
    receipt = _synthetic_receipt(root, slot, cell, run_id, rendered)
    script = "import sys,time;time.sleep(.08);sys.stdout.buffer.write(%r)" % receipt
    stdout, seed = _run_child(
        [str(Path(sys.executable).resolve()), "-B", "-c", script],
        run_id, root, slot, cell, render_observation,
    )
    if stdout != receipt or seed["child_live_poll_observed"] is not True or seed["child_poll_count"] < 1:
        raise ProcessCompletionError("delayed success did not prove live polling and full capture")
    results = [{"case_id": "delayed_complete_receipt", "result": "PASS", "live_polls": seed["child_poll_count"]}]
    bad_cases = (
        ("delayed_empty_stdout", "import time;time.sleep(.08)"),
        ("delayed_partial_stdout", "import sys,time;time.sleep(.08);sys.stdout.write('{')"),
        ("delayed_nonzero_after_receipt", script + ";sys.exit(7)"),
    )
    for name, child_script in bad_cases:
        try:
            _run_child(
                [str(Path(sys.executable).resolve()), "-B", "-c", child_script],
                run_id, root, slot, cell, render_observation,
            )
        except ProcessCompletionError:
            results.append({"case_id": name, "result": "REJECT"})
        else:
            raise ProcessCompletionError(f"delayed invalid child admitted: {name}")
    return {
        "schema_id": "pw-r8-delayed-process-holdouts-v2", "cases": 4,
        "results": results, "filesystem_writes": 0, "subject_calls": 0, "provider_calls": 0,
    }


def self_test() -> dict[str, Any]:
    return {
        "schema_id": "pw-r8-process-controller-self-test-v2",
        "candidate_id": CANDIDATE_ID, "status": "PASS",
        "process_completion": process_completion_holdouts(),
        "pre_dispatch_render": predispatch_render_holdouts(),
        "safe_boundary": safe_boundary_holdouts(),
        "delayed_process": delayed_process_holdouts(),
        "filesystem_writes": 0, "subject_calls": 0, "provider_calls": 0,
    }


class _DeferredSignals:
    def __init__(self) -> None:
        self.names: list[str] = []

    def handler(self, signum: int, _frame: Any) -> None:
        name = signal.Signals(signum).name
        if name not in self.names:
            self.names.append(name)


def _install_deferred_stop_handlers() -> _DeferredSignals:
    tracker = _DeferredSignals()
    for signum in (signal.SIGINT, signal.SIGTERM):
        signal.signal(signum, tracker.handler)
    return tracker


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
    tracker = _install_deferred_stop_handlers()
    try:
        value = self_test() if args.command == "self-test" else run(
            args.run_id, args.execution_root, args.slot, args.cell
        )
        if args.command == "run":
            value["deferred_stop_signal_names"] = list(tracker.names)
    except ProcessCompletionError as exc:
        started = exc.invocation_started
        sys.stderr.write(canonical({
            "schema_id": "pw-r8-process-controller-error-v2",
            "candidate_id": CANDIDATE_ID, "status": "REJECT",
            "stop_disposition": (
                "MUST_SEAL_CURRENT_CELL" if started
                else "SAFE_STOP_BEFORE_START" if args.command == "run"
                else None
            ),
            "error": str(exc),
        }).decode("utf-8") + "\n")
        return 1
    sys.stdout.buffer.write(canonical(value) + b"\n")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
