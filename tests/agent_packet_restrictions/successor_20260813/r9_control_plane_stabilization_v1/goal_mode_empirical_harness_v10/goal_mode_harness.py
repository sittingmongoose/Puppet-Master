#!/usr/bin/env python3
"""Fresh native Goal row with a scored turn and same-task non-scored closure turn."""

from __future__ import annotations

import argparse
import ast
import errno
import json
import os
from pathlib import Path
import re
import signal
import sqlite3
import stat
import subprocess
import sys
import threading
import time
from typing import Any

import goal_mode_terminal_closure_attestor as ga


ADMISSION_SCHEMA = "pw-r9-goal-mode-row-admission-v10"
ADAPTER = ga.ADAPTER
DEFAULT_TIMEOUT_SECONDS = 3600
MAX_SUBJECT_BYTES = 8_000_000
ROOT = Path(__file__).resolve().parent
BASE = ROOT.parent
READER = BASE / "goal_mode_empirical_harness_v4" / "read_goal_subject.py"
DESIGN = BASE / "r9_goal_mode_v10_same_task_terminal_closure_design_v1.json"
MATRIX_005_FAILURE = BASE / "r9_goal_mode_v9_causal_matrix_005_runtime_failure_receipt_v1.json"
PER_TEST_TAKER = BASE / "r9_goal_mode_per_test_taker_binding_correction_v2.json"
OMP_CLARIFICATION = BASE / "r9_goal_mode_omp_windows_transport_clarification_v3.json"
SOURCES = (
    ("goal_mode_empirical_harness_v10/goal_mode_contract.json", ROOT / "goal_mode_contract.json"),
    ("goal_mode_empirical_harness_v10/goal_mode_harness.py", ROOT / "goal_mode_harness.py"),
    ("goal_mode_empirical_harness_v10/goal_mode_terminal_closure_attestor.py", ROOT / "goal_mode_terminal_closure_attestor.py"),
    ("goal_mode_empirical_harness_v4/read_goal_subject.py", READER),
    (DESIGN.name, DESIGN),
    (MATRIX_005_FAILURE.name, MATRIX_005_FAILURE),
    (PER_TEST_TAKER.name, PER_TEST_TAKER),
    (OMP_CLARIFICATION.name, OMP_CLARIFICATION),
)
RESULT_SCHEMA = "pw-r9-goal-mode-v10-row-result-v1"
STDERR_SCHEMA = "pw-r9-goal-mode-v10-stderr-classification-v1"
ROUTER_STDERR_RE = re.compile(
    r"^(?P<timestamp>[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}\.[0-9]{6}Z) "
    r"ERROR codex_core::tools::router: error=collab spawn failed: no thread with id: "
    r"(?P<thread_id>[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})\n$"
)
_ACTIVE: list[subprocess.Popen[bytes]] = []


class LaunchFailure(ga.Invalid):
    pass


def _write_exclusive(path: Path, raw: bytes, mode: int = 0o600) -> None:
    path.parent.mkdir(mode=0o700, parents=True, exist_ok=True)
    fd = os.open(path, os.O_WRONLY | os.O_CREAT | os.O_EXCL | getattr(os, "O_CLOEXEC", 0), mode)
    try:
        offset = 0
        while offset < len(raw):
            offset += os.write(fd, raw[offset:])
        os.fsync(fd)
    finally:
        os.close(fd)
    os.chmod(path, mode)
    ga.require(ga.base._read_regular(path, max(len(raw), 1)) == raw, f"exclusive write reopen: {path.name}")
    dfd = os.open(path.parent, os.O_RDONLY | getattr(os, "O_DIRECTORY", 0) | getattr(os, "O_CLOEXEC", 0))
    try:
        os.fsync(dfd)
    finally:
        os.close(dfd)


def _write_json(path: Path, value: Any, mode: int = 0o600) -> None:
    _write_exclusive(path, ga.canon(value), mode)


def _identity(label: str, path: Path, limit: int = 32_000_000) -> dict[str, Any]:
    raw = ga.base._read_regular(path, limit)
    return {
        "bytes": len(raw),
        "mode": f"{stat.S_IMODE(os.lstat(path).st_mode):04o}",
        "path": label,
        "sha256": ga.sha256(raw),
    }


def _bindings() -> list[dict[str, Any]]:
    return [_identity(label, path) for label, path in SOURCES]


def _load_admission(path: Path, row_path: Path, row: dict[str, Any]) -> dict[str, Any]:
    value = ga.load_json(path, 8_000_000)
    ga.require(isinstance(value, dict), "admission object")
    ga.base._exact_keys(value, {"authority", "bindings", "review", "row_spec", "schema_id", "status"}, "admission")
    ga.require(value["schema_id"] == ADMISSION_SCHEMA and value["status"] == "PASS_INDEPENDENT_V10_TERMINAL_CLOSURE_HARNESS_REVIEW", "admission schema/status")
    ga.require(
        value["authority"]
        == {
            "adapter": ADAPTER,
            "canary_launch": True,
            "launch_count": 1,
            "matrix_launch": False,
            "qualification": False,
            "retry": False,
            "row_id": row["row_id"],
            "run_id": row["run_id"],
        },
        "admission authority",
    )
    ga.require(value["bindings"] == _bindings(), "admission bindings")
    review_ref = value["review"]
    ga.require(isinstance(review_ref, dict), "review reference")
    ga.base._exact_keys(review_ref, {"bytes", "mode", "path", "sha256"}, "review reference")
    ga.require(isinstance(review_ref["path"], str) and review_ref["path"] == Path(review_ref["path"]).name, "review basename")
    review_path = path.parent / review_ref["path"]
    ga.require(_identity(review_ref["path"], review_path) == review_ref, "review identity")
    review = ga.load_json(review_path, 16_000_000)
    ga.require(review.get("schema_id") == "pw-r9-goal-mode-harness-v10-independent-static-review-v1", "review schema")
    ga.require(
        review.get("status") == "PASS_INDEPENDENT_STATIC_REVIEW_V10_TERMINAL_CLOSURE_CANARY_ADMISSION_ELIGIBLE_ZERO_CREDIT_NO_LAUNCH"
        and review.get("first_mismatch") is None,
        "review status",
    )
    ga.require(
        review.get("authority")
        == {
            "canary_admission_eligible": True,
            "canary_launch": False,
            "matrix_launch": False,
            "qualification_credit": 0,
            "qualification_streak_clean_matrices": 0,
            "release": False,
        },
        "review authority",
    )
    ga.require(review.get("bindings") == _bindings(), "review bindings")
    raw = ga.base._read_regular(row_path, 2_000_000)
    ga.require(value["row_spec"] == {"bytes": len(raw), "sha256": ga.sha256(raw)}, "row binding")
    return value


def _snapshot(codex_home: Path) -> dict[str, Any]:
    with ga.base._connect_ro(ga.base._db_path(codex_home, "state")) as state:
        thread_ids = [row[0] for row in state.execute("SELECT id FROM threads ORDER BY id")]
    with ga.base._connect_ro(ga.base._db_path(codex_home, "goals")) as goals:
        goal_ids = [row[0] for row in goals.execute("SELECT goal_id FROM thread_goals ORDER BY goal_id")]
    return {
        "captured_at_ms": int(time.time() * 1000),
        "goal_ids": goal_ids,
        "schema_id": ga.SNAPSHOT_SCHEMA,
        "thread_ids": thread_ids,
    }


def make_row_spec(args: argparse.Namespace) -> dict[str, Any]:
    subject = ga.base._read_regular(args.subject, MAX_SUBJECT_BYTES)
    ga.require(subject and b"\x00" not in subject, "subject nonempty NUL-free")
    subject.decode("utf-8")
    criteria = ga.load_json(args.criteria, 2_000_000)
    control = ga.load_json(args.control_envelope, 2_000_000)
    ga.require(isinstance(criteria, dict) and isinstance(control, dict), "criteria/control objects")
    row: dict[str, Any] = {
        "adapter": ADAPTER,
        "attempt": 0,
        "cli_version": args.cli_version,
        "control_envelope": control,
        "criteria": criteria,
        "model": args.model,
        "objective": "",
        "reasoning_effort": args.reasoning_effort,
        "row_id": args.row_id,
        "run_id": args.run_id,
        "schema_id": ga.ROW_SCHEMA,
        "subject_utf8_bytes": len(subject),
        "subject_utf8_sha256": ga.sha256(subject),
    }
    row["objective"] = ga._expected_objective(row)
    _write_json(args.output, row, 0o644)
    return {"row_spec": _identity(args.output.name, args.output), "status": "ROW_SPEC_CREATED_ZERO_CREDIT_NO_LAUNCH"}


def _scored_prompt(row: dict[str, Any], capture: Path, workspace: Path) -> bytes:
    get_code = ga.get_goal_code().rstrip("\n")
    create_code = ga.create_goal_code(row["objective"]).rstrip("\n")
    reader = ga.reader_code(row, capture, workspace).rstrip("\n")
    prompt = f"""R9 NATIVE GOAL MODE SCORED TURN BOOTSTRAP — THE SCORED SUBJECT IS NOT PRESENT.

You are one fresh empirical test taker. Before any file access, command, web request, collaboration action, or subject reasoning, invoke exactly three native Goal actions as separate calls: get_goal, create_goal, then get_goal. If the Goal tools are exposed directly, call them directly with exact arguments. Otherwise use the exact code-mode forms below. Bootstrap commentary is allowed but is not a subject answer.

1. {get_code}
Require goal null.
2. {create_code}
Require the exact objective and status active.
3. {get_code}
Require the same Goal and status active.

Commitments: run_id={row['run_id']}; row_id={row['row_id']}; attempt=0; criteria_sha256={ga.sha256(ga.canon(row['criteria'], newline=False))}; control_envelope_sha256={ga.sha256(ga.canon(row['control_envelope'], newline=False))}; subject_commitment_sha256={row['subject_utf8_sha256']}; subject_utf8_bytes={row['subject_utf8_bytes']}.

After and only after call 3 succeeds, invoke exactly this one reader action:

{reader}

The reader blocks while the controller independently proves this task's fresh active native Goal. Treat its returned UTF-8 text as the sole scored subject prompt. Perform all subject reasoning after that return, in this same task and this active Goal turn. Do not retry, relaunch, replace, delegate, or invoke any other tool. Do not call update_goal in this scored turn. Leave the same Goal active for a controller-authorized same-task terminal-closure continuation. Emit only the subject answer as the terminal assistant message.
"""
    raw = prompt.encode("utf-8")
    ga.require(row["subject_utf8_sha256"].encode() in raw and str(row["subject_utf8_bytes"]).encode() in raw, "scored prompt commitments")
    return raw


def _closure_prompt(row: dict[str, Any], scored_gate: dict[str, Any]) -> bytes:
    get_code = ga.get_goal_code().rstrip("\n")
    update_code = ga.update_goal_code().rstrip("\n")
    prompt = f"""R9 NATIVE GOAL MODE SAME-TASK TERMINAL CLOSURE — NO SCORED SUBJECT IS PRESENT.

This is the documented continuation of the same fresh test-taker task after its scored answer was durably captured. Do not repeat, revise, explain, replace, or re-answer the scored subject. The same native Goal must already be active. The scored-phase receipt commitment is sha256={scored_gate['sha256']}; bytes={scored_gate['bytes']}.

Before any other action, invoke exactly these three native Goal actions as separate calls. If the Goal tools are exposed directly, call them directly with exact arguments. Otherwise use the exact code-mode forms below.

1. {get_code}
Require the exact same Goal, objective, and status active.
2. {update_code}
Require the exact same Goal and status complete.
3. {get_code}
Require the exact same Goal, objective, and status complete.

Invoke no file, command, web, collaboration, memory, delegation, subject, or other tool. Perform no scored-subject reasoning. After call 3, emit exactly {ga.CLOSURE_MARKER} as the terminal assistant message with no decoration.
"""
    return prompt.encode("utf-8")


def _scored_argv(codex: Path, row: dict[str, Any], workspace: Path, last: Path) -> list[str]:
    return [
        str(codex),
        "exec",
        "--strict-config",
        "-C",
        str(workspace),
        "--sandbox",
        "read-only",
        "--color",
        "never",
        "--json",
        "-m",
        row["model"],
        "-c",
        f'model_reasoning_effort="{row["reasoning_effort"]}"',
        "-c",
        "suppress_unstable_features_warning=true",
        "-o",
        str(last),
        "-",
    ]


def _closure_argv(codex: Path, row: dict[str, Any], workspace: Path, last: Path, thread_id: str) -> list[str]:
    return [
        str(codex),
        "-C",
        str(workspace),
        "--sandbox",
        "read-only",
        "exec",
        "resume",
        "--strict-config",
        "--json",
        "-m",
        row["model"],
        "-c",
        f'model_reasoning_effort="{row["reasoning_effort"]}"',
        "-c",
        "suppress_unstable_features_warning=true",
        "-o",
        str(last),
        thread_id,
        "-",
    ]


def _parse_thread(line: bytes) -> str | None:
    try:
        value = json.loads(line)
    except json.JSONDecodeError:
        return None
    result = value.get("thread_id") if isinstance(value, dict) and value.get("type") == "thread.started" else None
    return result if isinstance(result, str) else None


def _pump(stream: Any, path: Path, thread_box: list[str], errors: list[str]) -> None:
    try:
        fd = os.open(path, os.O_WRONLY | os.O_CREAT | os.O_EXCL | getattr(os, "O_CLOEXEC", 0), 0o600)
        try:
            os.fchmod(fd, 0o600)
            while True:
                chunk = stream.readline()
                if not chunk:
                    break
                offset = 0
                while offset < len(chunk):
                    offset += os.write(fd, chunk[offset:])
                os.fsync(fd)
                thread_id = _parse_thread(chunk) if path.name.endswith("_stdout.jsonl") else None
                if thread_id:
                    if thread_box and thread_box[0] != thread_id:
                        errors.append("multiple thread ids")
                    elif not thread_box:
                        thread_box.append(thread_id)
        finally:
            os.close(fd)
    except BaseException as exc:
        errors.append(f"{path.name}:{type(exc).__name__}:{exc}")


def _start(
    argv: list[str],
    prompt: bytes,
    capture: Path,
    phase: str,
    schema_id: str,
    cwd: Path,
    scored_gate: dict[str, Any] | None = None,
) -> tuple[subprocess.Popen[bytes], list[threading.Thread], list[str], list[str], int]:
    started = int(time.time() * 1000)
    process = subprocess.Popen(argv, stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.PIPE, cwd=cwd, start_new_session=True)
    _ACTIVE.append(process)
    receipt: dict[str, Any] = {
        "argv": argv,
        "phase": phase.upper(),
        "pid": process.pid,
        "schema_id": schema_id,
        "started_at_ms": started,
        "stdin": {"bytes": len(prompt), "sha256": ga.sha256(prompt)},
    }
    if scored_gate is not None:
        receipt["scored_phase"] = scored_gate
    _write_json(capture / f"{phase}_launch_receipt.json", receipt)
    ga.require(process.stdin is not None and process.stdout is not None and process.stderr is not None, "process pipes")
    box: list[str] = []
    errors: list[str] = []
    out = threading.Thread(target=_pump, args=(process.stdout, capture / f"{phase}_stdout.jsonl", box, errors), daemon=True)
    err = threading.Thread(target=_pump, args=(process.stderr, capture / f"{phase}_stderr.bin", [], errors), daemon=True)
    out.start()
    err.start()
    process.stdin.write(prompt)
    process.stdin.close()
    return process, [out, err], box, errors, started


def _terminate(process: subprocess.Popen[bytes]) -> None:
    if process.poll() is None:
        try:
            os.killpg(process.pid, signal.SIGTERM)
        except ProcessLookupError:
            pass
        try:
            process.wait(timeout=5)
        except subprocess.TimeoutExpired:
            try:
                os.killpg(process.pid, signal.SIGKILL)
            except ProcessLookupError:
                pass
            try:
                process.wait(timeout=10)
            except subprocess.TimeoutExpired:
                pass


def _normalize(path: Path) -> None:
    before = os.lstat(path)
    ga.require(stat.S_ISREG(before.st_mode) and not path.is_symlink(), f"unsafe output: {path.name}")
    os.chmod(path, 0o600)
    after = os.lstat(path)
    ga.require((before.st_dev, before.st_ino) == (after.st_dev, after.st_ino) and stat.S_IMODE(after.st_mode) == 0o600, f"output normalization: {path.name}")


def _reader_pids(fifo: Path) -> list[int]:
    target = str(fifo).encode()
    result: list[int] = []
    for member in Path("/proc").iterdir():
        if not member.name.isdigit():
            continue
        try:
            raw = (member / "cmdline").read_bytes()
        except FileNotFoundError:
            continue
        except (OSError, PermissionError) as exc:
            raise LaunchFailure(f"reader census:{member.name}:{exc}") from exc
        if target in raw and b"read_goal_subject.py" in raw:
            result.append(int(member.name))
    return sorted(result)


def _signal_readers(fifo: Path, pids: list[int], sig: signal.Signals) -> int:
    target = str(fifo).encode()
    sent = 0
    for pid in pids:
        try:
            fd = os.pidfd_open(pid)
        except ProcessLookupError:
            continue
        try:
            try:
                raw = Path(f"/proc/{pid}/cmdline").read_bytes()
            except FileNotFoundError:
                continue
            ga.require(target in raw and b"read_goal_subject.py" in raw, "reader PID drift")
            signal.pidfd_send_signal(fd, sig)
            sent += 1
        finally:
            os.close(fd)
    return sent


def _quiesce(fifo: Path) -> dict[str, Any]:
    deadline = time.monotonic() + 5
    while time.monotonic() < deadline and _reader_pids(fifo):
        time.sleep(0.05)
    detected = _reader_pids(fifo)
    term = _signal_readers(fifo, detected, signal.SIGTERM) if detected else 0
    deadline = time.monotonic() + 5
    while time.monotonic() < deadline and _reader_pids(fifo):
        time.sleep(0.05)
    remaining = _reader_pids(fifo)
    kill = _signal_readers(fifo, remaining, signal.SIGKILL) if remaining else 0
    deadline = time.monotonic() + 5
    while time.monotonic() < deadline and _reader_pids(fifo):
        time.sleep(0.05)
    return {"detected_pids": detected, "kill_sent": kill, "remaining_pids": _reader_pids(fifo), "term_sent": term}


def _deliver(fifo: Path, subject: bytes, process: subprocess.Popen[bytes], deadline: float) -> dict[str, Any]:
    while time.monotonic() < deadline and process.poll() is None:
        try:
            fd = os.open(fifo, os.O_WRONLY | os.O_NONBLOCK | getattr(os, "O_CLOEXEC", 0))
        except OSError as exc:
            if exc.errno == errno.ENXIO:
                time.sleep(0.02)
                continue
            return {"error": f"fifo_open:{exc}"}
        try:
            offset = 0
            while offset < len(subject):
                offset += os.write(fd, subject[offset:])
            return {
                "bytes": len(subject),
                "closed_at_ms": int(time.time() * 1000),
                "schema_id": ga.DELIVERY_SCHEMA,
                "sha256": ga.sha256(subject),
                "status": "DELIVERED_ONCE_AFTER_ACTIVE_GOAL_GATE",
            }
        except OSError as exc:
            return {"error": f"fifo_write:{exc}"}
        finally:
            os.close(fd)
    return {"error": "fifo_reader_never_opened"}


def _classify_stderr(raw: bytes, attestation: dict[str, Any], codex_home: Path, phase: str) -> dict[str, Any]:
    current = attestation["goal"]["thread_id"]
    if raw == b"":
        return {
            "accepted": True,
            "bytes": 0,
            "category": "EMPTY_STDERR",
            "current_thread_id": current,
            "phase": phase,
            "referenced_thread_id": None,
            "sha256": ga.sha256(raw),
            "status": "PASS_EXACT_EMPTY_STDERR",
        }
    try:
        text = raw.decode("utf-8")
    except UnicodeDecodeError as exc:
        raise LaunchFailure(f"{phase} stderr non-UTF8") from exc
    match = ROUTER_STDERR_RE.fullmatch(text)
    ga.require(match is not None, f"{phase} stderr outside exact classifier")
    referenced = match.group("thread_id")
    ga.require(referenced != current, f"{phase} router diagnostic references current task")
    rollout = ga.base._read_regular(codex_home / attestation["rollout"]["logical_path"], 256_000_000)
    ga.require(referenced.encode("ascii") not in rollout, f"{phase} router UUID appears in rollout")
    return {
        "accepted": True,
        "bytes": len(raw),
        "category": "ORPHANED_COLLAB_ROUTER_DIAGNOSTIC_NOT_SUBJECT_ACTION",
        "current_thread_id": current,
        "phase": phase,
        "referenced_thread_id": referenced,
        "sha256": ga.sha256(raw),
        "status": "PASS_EXACT_CAUSALLY_DISJOINT_INTERNAL_ROUTER_DIAGNOSTIC",
    }


def _file_identity(path: Path) -> dict[str, Any]:
    raw = ga.base._read_regular(path, 16_000_000)
    return {"bytes": len(raw), "sha256": ga.sha256(raw)}


def run_codex_row(args: argparse.Namespace) -> dict[str, Any]:
    row = ga.load_row(args.row_spec)
    subject = ga.base._read_regular(args.subject, MAX_SUBJECT_BYTES)
    subject.decode("utf-8")
    ga.require(len(subject) == row["subject_utf8_bytes"] and ga.sha256(subject) == row["subject_utf8_sha256"], "subject identity")
    _load_admission(args.admission, args.row_spec, row)
    ga.require(args.capture_root.is_absolute() and not args.capture_root.exists(), "capture root must be absent absolute path")
    args.capture_root.mkdir(mode=0o700, parents=False)
    os.chmod(args.capture_root, 0o700)
    _write_json(args.capture_root / "prelaunch_snapshot.json", _snapshot(args.codex_home))
    fifo = args.capture_root / "subject.fifo"
    os.mkfifo(fifo, 0o600)
    os.chmod(fifo, 0o600)
    scored_prompt = _scored_prompt(row, args.capture_root, args.workspace.resolve())
    _write_exclusive(args.capture_root / "scored_prompt.txt", scored_prompt)
    scored_last = args.capture_root / "scored_output_last_message.txt"
    scored_process, scored_threads, scored_box, scored_errors, scored_started = _start(
        _scored_argv(args.codex.resolve(), row, args.workspace.resolve(), scored_last),
        scored_prompt,
        args.capture_root,
        "scored",
        ga.SCORED_LAUNCH_SCHEMA,
        args.workspace,
    )
    release: dict[str, Any] | None = None
    release_error = "active Goal release gate timeout"
    release_deadline = time.monotonic() + min(300, args.timeout_seconds)
    while time.monotonic() < release_deadline and scored_process.poll() is None:
        if scored_box and not scored_errors:
            try:
                release = ga.attest_release(args.row_spec, args.capture_root, args.codex_home)
                break
            except (ga.Invalid, OSError, sqlite3.Error, UnicodeError) as exc:
                release_error = str(exc)
        time.sleep(0.05)
    delivery: dict[str, Any] = {}
    scored_timed_out = False
    if release is not None:
        _write_json(args.capture_root / "goal_active_subject_release_gate.json", release)
        delivery = _deliver(fifo, subject, scored_process, time.monotonic() + 30)
        if delivery.get("status") == "DELIVERED_ONCE_AFTER_ACTIVE_GOAL_GATE":
            _write_json(args.capture_root / "subject_delivery.json", delivery)
            _write_exclusive(args.capture_root / "subject_input.txt", subject)
    if release is None or delivery.get("status") != "DELIVERED_ONCE_AFTER_ACTIVE_GOAL_GATE":
        _terminate(scored_process)
    else:
        try:
            scored_process.wait(timeout=max(0.1, args.timeout_seconds))
        except subprocess.TimeoutExpired:
            scored_timed_out = True
            _terminate(scored_process)
    for thread in scored_threads:
        thread.join(timeout=10)
    if scored_last.exists():
        _normalize(scored_last)
    quiescence = _quiesce(fifo)
    if not quiescence["remaining_pids"] and fifo.exists():
        fifo.unlink()
        fd = os.open(args.capture_root, os.O_RDONLY | getattr(os, "O_DIRECTORY", 0) | getattr(os, "O_CLOEXEC", 0))
        os.fsync(fd)
        os.close(fd)
    scored_receipt = {
        "ended_at_ms": int(time.time() * 1000),
        "goal_release_error": None if release is not None else release_error,
        "pid": scored_process.pid,
        "rc": scored_process.returncode,
        "reader_quiescence": quiescence,
        "schema_id": ga.SCORED_PROCESS_SCHEMA,
        "started_at_ms": scored_started,
        "stdin_closed": True,
        "subject_delivery": delivery,
        "subject_fifo_removed": not fifo.exists(),
        "subject_release": "AFTER_SAME_PROCESS_NATIVE_GOAL_ACTIVE_ATTESTATION" if release is not None else "NOT_RELEASED",
        "timed_out": scored_timed_out,
    }
    _write_json(args.capture_root / "scored_process_receipt.json", scored_receipt)
    if release is None:
        raise LaunchFailure(f"active Goal gate failed; subject withheld:{release_error}")
    if delivery.get("status") != "DELIVERED_ONCE_AFTER_ACTIVE_GOAL_GATE":
        raise LaunchFailure(f"subject delivery failed:{delivery}")
    if scored_process.returncode != 0 or scored_timed_out or scored_errors:
        raise LaunchFailure(f"scored process failure:rc={scored_process.returncode}:timeout={scored_timed_out}:pump={scored_errors}")
    if quiescence["term_sent"] or quiescence["kill_sent"] or quiescence["remaining_pids"]:
        raise LaunchFailure(f"reader forced cleanup:{quiescence}")
    scored_attestation = ga.attest_scored(args.row_spec, args.capture_root, args.codex_home)
    _write_json(args.capture_root / "scored_phase_attestation.json", scored_attestation)
    scored_gate = _file_identity(args.capture_root / "scored_phase_attestation.json")
    closure_prompt = _closure_prompt(row, scored_gate)
    ga.require(subject not in closure_prompt, "closure prompt contains subject")
    _write_exclusive(args.capture_root / "closure_prompt.txt", closure_prompt)
    closure_last = args.capture_root / "closure_output_last_message.txt"
    closure_process, closure_threads, closure_box, closure_errors, closure_started = _start(
        _closure_argv(args.codex.resolve(), row, args.workspace.resolve(), closure_last, scored_attestation["goal"]["thread_id"]),
        closure_prompt,
        args.capture_root,
        "closure",
        ga.CLOSURE_LAUNCH_SCHEMA,
        args.workspace,
        scored_gate,
    )
    closure_timed_out = False
    try:
        closure_process.wait(timeout=max(0.1, args.timeout_seconds))
    except subprocess.TimeoutExpired:
        closure_timed_out = True
        _terminate(closure_process)
    for thread in closure_threads:
        thread.join(timeout=10)
    if closure_last.exists():
        _normalize(closure_last)
    closure_receipt = {
        "ended_at_ms": int(time.time() * 1000),
        "pid": closure_process.pid,
        "rc": closure_process.returncode,
        "schema_id": ga.CLOSURE_PROCESS_SCHEMA,
        "started_at_ms": closure_started,
        "stdin_closed": True,
        "timed_out": closure_timed_out,
    }
    _write_json(args.capture_root / "closure_process_receipt.json", closure_receipt)
    if closure_process.returncode != 0 or closure_timed_out or closure_errors:
        raise LaunchFailure(f"closure process failure:rc={closure_process.returncode}:timeout={closure_timed_out}:pump={closure_errors}")
    ga.require(closure_box == [scored_attestation["goal"]["thread_id"]], "closure thread.started identity")
    final = ga.attest_final(args.row_spec, args.capture_root, args.codex_home)
    scored_class = _classify_stderr(
        ga.base._read_regular(args.capture_root / "scored_stderr.bin", 64_000_000),
        final,
        args.codex_home,
        "SCORED",
    )
    closure_class = _classify_stderr(
        ga.base._read_regular(args.capture_root / "closure_stderr.bin", 64_000_000),
        final,
        args.codex_home,
        "CLOSURE",
    )
    classifications = {
        "closure": closure_class,
        "schema_id": STDERR_SCHEMA,
        "scored": scored_class,
        "status": "PASS_EXACT_PHASE_STDERR_CLASSIFICATIONS_AFTER_FULL_ATTESTATION",
    }
    _write_json(args.capture_root / "goal_mode_attestation.json", final)
    _write_json(args.capture_root / "stderr_classification.json", classifications)
    return {
        "attestation": final,
        "schema_id": RESULT_SCHEMA,
        "status": "PASS_NATIVE_GOAL_SCORED_TURN_SAME_TASK_TERMINAL_CLOSURE_ZERO_CREDIT",
        "stderr_classification": classifications,
    }


def check(args: argparse.Namespace) -> dict[str, Any]:
    contract = ga.load_json(ROOT / "goal_mode_contract.json", 8_000_000)
    ga.require(
        contract["schema_id"] == "pw-r9-goal-mode-empirical-harness-contract-v10"
        and contract["authority"]
        == {
            "canary_launch": False,
            "matrix_launch": False,
            "qualification_credit": 0,
            "qualification_streak_clean_matrices": 0,
            "release": False,
        },
        "contract",
    )
    ga.require(
        contract["architecture"]["adapter"] == ADAPTER
        and contract["architecture"]["process_topology"] == "TWO_CODEX_PROCESSES_ONE_PERSISTED_FRESH_TASK_ONE_FRESH_GOAL_TWO_DISTINCT_TURNS",
        "contract architecture",
    )
    ga.require(
        contract["omp_lane"]
        == {
            "duplicate_spawn": False,
            "goal_mode_required_per_fresh_test_taker": True,
            "host": "WINDOWS",
            "launch_argv": ["omp", "--cwd", "P:\\"],
            "linux_process_inference": False,
            "status": "EXISTING_EXTERNAL_CONTROLLER_UNTOUCHED",
        },
        "OMP boundary",
    )
    for name in ("goal_mode_harness.py", "goal_mode_terminal_closure_attestor.py"):
        ast.parse((ROOT / name).read_text(encoding="utf-8"), filename=name)
    version = subprocess.run([str(args.codex), "--version"], stdin=subprocess.DEVNULL, stdout=subprocess.PIPE, stderr=subprocess.PIPE, check=False, timeout=10)
    ga.require(version.returncode == 0 and version.stderr == b"" and version.stdout.decode().strip() == "codex-cli 0.148.0", "Codex version")
    exec_help = subprocess.run([str(args.codex), "exec", "--help"], stdin=subprocess.DEVNULL, stdout=subprocess.PIPE, stderr=subprocess.PIPE, check=False, timeout=10)
    resume_help = subprocess.run([str(args.codex), "exec", "resume", "--help"], stdin=subprocess.DEVNULL, stdout=subprocess.PIPE, stderr=subprocess.PIPE, check=False, timeout=10)
    ga.require(exec_help.returncode == 0 and b"Run Codex non-interactively" in exec_help.stdout, "Codex exec surface")
    ga.require(
        resume_help.returncode == 0
        and resume_help.stderr == b""
        and b"Resume a previous session" in resume_help.stdout
        and b"read from stdin" in resume_help.stdout
        and b"--output-last-message" in resume_help.stdout
        and b"--json" in resume_help.stdout,
        "Codex resume surface",
    )
    return {
        "authority": {"canary_launch": False, "matrix_launch": False, "qualification_credit": 0},
        "bindings": _bindings(),
        "checks": {
            "causal_stderr_classifier": "PASS_STATIC_EXACT_TWO_CLASS_PER_PHASE_AFTER_FULL_ATTESTATION",
            "closure_action_sequence": ["get_goal", "update_goal", "get_goal"],
            "closure_prompt_has_subject": False,
            "codex_cli_version": "codex-cli 0.148.0",
            "omp_lane": "EXISTING_WINDOWS_OMP_CWD_P_DRIVE_NO_DUPLICATE",
            "resume_color_option_absent": True,
            "same_task_resume": "PASS_STATIC_SUPPORTED_SURFACE",
            "scored_answer_before_closure": "PASS_STATIC",
            "source_ast": "PASS",
        },
        "schema_id": "pw-r9-goal-mode-harness-check-v10",
        "status": "PASS_STATIC_DATA_ONLY_NO_MODEL_CALL_NO_LAUNCH_ZERO_CREDIT",
    }


def _emit(value: dict[str, Any]) -> None:
    sys.stdout.buffer.write(ga.canon(value))


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser()
    sub = parser.add_subparsers(dest="command", required=True)
    pcheck = sub.add_parser("check")
    pcheck.add_argument("--codex", type=Path, required=True)
    make = sub.add_parser("make-row-spec")
    for flag in ("subject", "criteria", "control-envelope", "output"):
        make.add_argument(f"--{flag}", type=Path, required=True)
    for flag in ("run-id", "row-id", "model", "reasoning-effort"):
        make.add_argument(f"--{flag}", required=True)
    make.add_argument("--cli-version", default="0.148.0")
    run = sub.add_parser("run-codex-row")
    for flag in ("row-spec", "subject", "admission", "capture-root", "codex-home", "codex", "workspace"):
        run.add_argument(f"--{flag}", type=Path, required=True)
    run.add_argument("--timeout-seconds", type=int, default=DEFAULT_TIMEOUT_SECONDS)
    args = parser.parse_args(argv)
    try:
        if args.command == "check":
            result = check(args)
        elif args.command == "make-row-spec":
            result = make_row_spec(args)
        else:
            ga.require(60 <= args.timeout_seconds <= 7200, "timeout bounds")
            result = run_codex_row(args)
        _emit(result)
        return 0
    except (ga.Invalid, OSError, sqlite3.Error, UnicodeError, subprocess.SubprocessError) as exc:
        _emit(
            {
                "authority": {"qualification_credit": 0, "subject_release": False},
                "error": str(exc),
                "schema_id": "pw-r9-goal-mode-harness-failure-v10",
                "status": "FAIL_CLOSED_ZERO_CREDIT_NO_RETRY",
            }
        )
        return 1
    finally:
        while _ACTIVE:
            process = _ACTIVE.pop()
            _terminate(process)
            for stream in (process.stdin, process.stdout, process.stderr):
                try:
                    if stream is not None:
                        stream.close()
                except OSError:
                    pass


if __name__ == "__main__":
    raise SystemExit(main())
