#!/usr/bin/env python3
"""Goal-per-test-taker harness.

`check` and `make-row-spec` make no model/provider calls.  `run-codex-row` is
fail-closed behind a separately written exact-identity admission and is the only
Codex subject-launch surface.  This file never launches OMP: the OMP Windows
controller already exists and is attested separately.
"""

from __future__ import annotations

import argparse
import ast
import errno
import hashlib
import json
import os
from pathlib import Path
import shlex
import signal
import sqlite3
import stat
import subprocess
import sys
import threading
import time
from typing import Any

import goal_mode_attestor as ga


ADMISSION_SCHEMA = "pw-r9-goal-mode-row-admission-v1"
LAUNCH_SCHEMA = ga.LAUNCH_SCHEMA
PROCESS_SCHEMA = ga.PROCESS_SCHEMA
ROW_SCHEMA = ga.ROW_SCHEMA
SNAPSHOT_SCHEMA = ga.SNAPSHOT_SCHEMA
ADAPTER = "CODEX_NATIVE_GOAL_GATED_FIFO_V1"
FILES = (
    "goal_mode_contract.json",
    "goal_mode_attestor.py",
    "goal_mode_harness.py",
    "read_goal_subject.py",
)
MAX_SUBJECT_BYTES = 8_000_000
DEFAULT_TIMEOUT_SECONDS = 3600
_ACTIVE_PROCESS: subprocess.Popen[bytes] | None = None


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
    reopened = path.read_bytes()
    if reopened != raw:
        raise LaunchFailure(f"exclusive write reopen mismatch: {path.name}")
    dfd = os.open(path.parent, os.O_RDONLY | getattr(os, "O_DIRECTORY", 0) | getattr(os, "O_CLOEXEC", 0))
    try:
        os.fsync(dfd)
    finally:
        os.close(dfd)


def _write_json(path: Path, value: Any, mode: int = 0o600) -> None:
    _write_exclusive(path, ga.canon(value), mode)


def _file_identity(path: Path) -> dict[str, Any]:
    raw = ga._read_regular(path, 16_000_000)
    return {
        "bytes": len(raw),
        "mode": f"{stat.S_IMODE(os.lstat(path).st_mode):04o}",
        "path": path.name,
        "sha256": ga.sha256(raw),
    }


def _source_root() -> Path:
    return Path(__file__).resolve().parent


def _expected_bindings() -> list[dict[str, Any]]:
    root = _source_root()
    return [_file_identity(root / name) for name in FILES]


def _load_admission(path: Path, row_path: Path, row: dict[str, Any]) -> dict[str, Any]:
    value = ga.load_json(path, 4_000_000)
    ga.require(isinstance(value, dict), "admission object")
    ga._exact_keys(value, {"schema_id", "status", "authority", "bindings", "row_spec"}, "admission")
    ga.require(value["schema_id"] == ADMISSION_SCHEMA, "admission schema")
    ga.require(value["status"] == "PASS_INDEPENDENT_GOAL_HARNESS_REVIEW", "admission status")
    authority = value["authority"]
    ga.require(authority == {
        "adapter": ADAPTER,
        "launch": True,
        "launch_count": 1,
        "qualification": False,
        "row_id": row["row_id"],
        "run_id": row["run_id"],
    }, "admission authority")
    ga.require(value["bindings"] == _expected_bindings(), "admission source bindings")
    row_raw = ga._read_regular(row_path, 2_000_000)
    ga.require(value["row_spec"] == {
        "bytes": len(row_raw),
        "sha256": ga.sha256(row_raw),
    }, "admission row binding")
    return value


def _db_snapshot(codex_home: Path) -> dict[str, Any]:
    state_path = ga._db_path(codex_home, "state")
    goal_path = ga._db_path(codex_home, "goals")
    with ga._connect_ro(state_path) as state:
        thread_ids = [row[0] for row in state.execute("SELECT id FROM threads ORDER BY id")]
    with ga._connect_ro(goal_path) as goals:
        goal_ids = [row[0] for row in goals.execute("SELECT goal_id FROM thread_goals ORDER BY goal_id")]
    return {
        "captured_at_ms": int(time.time() * 1000),
        "goal_ids": goal_ids,
        "schema_id": SNAPSHOT_SCHEMA,
        "thread_ids": thread_ids,
    }


def _expected_objective(run_id: str, row_id: str, criteria: dict[str, Any], control: dict[str, Any], subject_hash: str) -> str:
    criteria_hash = ga.sha256(ga.canon(criteria, newline=False))
    control_hash = ga.sha256(ga.canon(control, newline=False))
    return (
        f"R9 Goal Mode test taker {run_id}/{row_id}/0; criteria_sha256={criteria_hash}; "
        f"control_envelope_sha256={control_hash}; subject_commitment_sha256={subject_hash}; "
        "execute exactly one gated subject after native Goal activation and settle terminal Goal state."
    )


def make_row_spec(args: argparse.Namespace) -> dict[str, Any]:
    subject = ga._read_regular(args.subject, MAX_SUBJECT_BYTES)
    ga.require(subject and b"\x00" not in subject, "subject must be nonempty NUL-free UTF-8")
    subject.decode("utf-8")
    criteria = ga.load_json(args.criteria, 2_000_000)
    control = ga.load_json(args.control_envelope, 2_000_000)
    ga.require(isinstance(criteria, dict) and isinstance(control, dict), "criteria/control must be objects")
    subject_hash = ga.sha256(subject)
    row = {
        "adapter": ADAPTER,
        "attempt": 0,
        "cli_version": args.cli_version,
        "control_envelope": control,
        "criteria": criteria,
        "model": args.model,
        "objective": _expected_objective(args.run_id, args.row_id, criteria, control, subject_hash),
        "reasoning_effort": args.reasoning_effort,
        "row_id": args.row_id,
        "run_id": args.run_id,
        "schema_id": ROW_SCHEMA,
        "subject_utf8_bytes": len(subject),
        "subject_utf8_sha256": subject_hash,
    }
    _write_json(args.output, row, 0o644)
    return {"row_spec": _file_identity(args.output), "status": "ROW_SPEC_CREATED_ZERO_CREDIT_NO_LAUNCH"}


def _bootstrap_prompt(row: dict[str, Any], reader: Path, fifo: Path, workspace: Path) -> bytes:
    reader_cmd = shlex.join([
        "python3", "-B", str(reader), "--fifo", str(fifo),
        "--sha256", row["subject_utf8_sha256"], "--bytes", str(row["subject_utf8_bytes"]),
    ])
    exec_code = (
        "const r = await tools.exec_command({"
        f"cmd:{json.dumps(reader_cmd)},workdir:{json.dumps(str(workspace))},"
        "yield_time_ms:30000,max_output_tokens:20000});\n"
        "if (r.exit_code !== 0) throw new Error('subject reader failed');\n"
        "text(r.output);"
    )
    objective_json = json.dumps(row["objective"], ensure_ascii=False)
    prompt = f"""R9 NATIVE GOAL MODE BOOTSTRAP — NO SUBJECT PROMPT IS PRESENT IN THIS MESSAGE.

You are one fresh empirical test taker. This bootstrap is not the scored subject. Before any file access, command, web request, collaboration action, or subject reasoning, execute exactly these three code-mode Goal calls as three separate calls and inspect each returned JSON object:

1. `const r = await tools.get_goal({{}});\ntext(r);`
   Require `goal` to be null. If it is not null, stop with a failure and do not read the subject FIFO.
2. `const r = await tools.create_goal({{objective:{objective_json}}});\ntext(r);`
   Require the returned Goal to have this exact objective and status `active`.
3. `const r = await tools.get_goal({{}});\ntext(r);`
   Require the same exact objective and status `active`.

Goal bindings (commitments only; not subject content):
- run_id: {row['run_id']}
- row_id: {row['row_id']}
- attempt: 0
- criteria_sha256: {ga.sha256(ga.canon(row['criteria'], newline=False))}
- control_envelope_sha256: {ga.sha256(ga.canon(row['control_envelope'], newline=False))}
- subject_commitment_sha256: {row['subject_utf8_sha256']}
- subject_utf8_bytes: {row['subject_utf8_bytes']}

After call 3 succeeds, do not read the subject in this activation turn. Emit exactly `GOAL_ACTIVE_AWAITING_NATIVE_CONTINUATION` as this turn's assistant message while leaving the Goal active. Native Goal Runtime continuation must start the next turn. In that later Goal continuation turn, execute exactly this code-mode call to receive the one-use subject from the controller's Goal-gated FIFO:

```javascript
{exec_code}
```

Treat the returned UTF-8 text as the sole scored subject prompt. Do not search for or read any alternate prompt source. Perform all subject work in this post-activation Goal continuation turn. Do not retry, relaunch, replace, delegate, or reuse another task. When the answer is fully determined, call `const r = await tools.update_goal({{status:"complete"}});\ntext(r);` exactly once, require the returned Goal status `complete`, then emit only the subject answer as the terminal assistant message. If native Goal Runtime does not produce a later continuation turn, or if any required Goal step or FIFO read fails, do not invent an answer and do not retry.
"""
    return prompt.encode("utf-8")


def _parse_thread_started(line: bytes) -> str | None:
    try:
        value = json.loads(line)
    except json.JSONDecodeError:
        return None
    if isinstance(value, dict) and value.get("type") == "thread.started" and isinstance(value.get("thread_id"), str):
        return value["thread_id"]
    return None


def _pump(stream: Any, path: Path, thread_event: threading.Event, thread_box: list[str], errors: list[str]) -> None:
    try:
        fd = os.open(path, os.O_WRONLY | os.O_CREAT | os.O_EXCL | getattr(os, "O_CLOEXEC", 0), 0o600)
        try:
            while True:
                chunk = stream.readline()
                if not chunk:
                    break
                offset = 0
                while offset < len(chunk):
                    offset += os.write(fd, chunk[offset:])
                os.fsync(fd)
                if path.name == "codex_stdout.jsonl":
                    thread_id = _parse_thread_started(chunk)
                    if thread_id:
                        if thread_box and thread_box[0] != thread_id:
                            errors.append("multiple thread ids")
                        elif not thread_box:
                            thread_box.append(thread_id)
                            thread_event.set()
        finally:
            os.close(fd)
    except BaseException as exc:  # captured into the terminal receipt
        errors.append(f"{path.name}:{type(exc).__name__}:{exc}")
        thread_event.set()


def _fifo_writer(fifo: Path, subject: bytes, process: subprocess.Popen[bytes], result: dict[str, Any], deadline: float) -> None:
    while time.monotonic() < deadline and process.poll() is None:
        try:
            fd = os.open(fifo, os.O_WRONLY | os.O_NONBLOCK | getattr(os, "O_CLOEXEC", 0))
        except OSError as exc:
            if exc.errno == errno.ENXIO:
                time.sleep(0.05)
                continue
            result["error"] = f"fifo_open:{exc}"
            return
        try:
            offset = 0
            while offset < len(subject):
                offset += os.write(fd, subject[offset:])
            result.update({"bytes": len(subject), "closed_at_ms": int(time.time() * 1000), "sha256": ga.sha256(subject), "status": "DELIVERED_ONCE"})
            return
        except OSError as exc:
            result["error"] = f"fifo_write:{exc}"
            return
        finally:
            os.close(fd)
    result["error"] = "fifo_reader_never_opened"


def _terminate_group(process: subprocess.Popen[bytes]) -> None:
    if process.poll() is not None:
        return
    try:
        os.killpg(process.pid, signal.SIGKILL)
    except ProcessLookupError:
        pass
    try:
        process.wait(timeout=10)
    except subprocess.TimeoutExpired:
        pass


def _codex_argv(codex: Path, row: dict[str, Any], workspace: Path, last_message: Path) -> list[str]:
    return [
        str(codex), "exec", "--strict-config", "-C", str(workspace), "--sandbox", "read-only",
        "--color", "never", "--json", "-m", row["model"], "-c",
        f'model_reasoning_effort="{row["reasoning_effort"]}"', "-c",
        "suppress_unstable_features_warning=true", "-o", str(last_message), "-",
    ]


def run_codex_row(args: argparse.Namespace) -> dict[str, Any]:
    global _ACTIVE_PROCESS
    row = ga._load_row(args.row_spec)
    ga.require(row["adapter"] == ADAPTER, "row is not Codex Goal adapter")
    subject = ga._read_regular(args.subject, MAX_SUBJECT_BYTES)
    subject.decode("utf-8")
    ga.require(len(subject) == row["subject_utf8_bytes"] and ga.sha256(subject) == row["subject_utf8_sha256"], "subject identity differs from row")
    _load_admission(args.admission, args.row_spec, row)
    ga.require(not args.capture_root.exists(), "capture root must be absent")
    args.capture_root.mkdir(mode=0o700, parents=False)
    os.chmod(args.capture_root, 0o700)
    snapshot = _db_snapshot(args.codex_home)
    _write_json(args.capture_root / "prelaunch_snapshot.json", snapshot)
    fifo = args.capture_root / "subject.fifo"
    os.mkfifo(fifo, 0o600)
    os.chmod(fifo, 0o600)
    reader = _source_root() / "read_goal_subject.py"
    bootstrap = _bootstrap_prompt(row, reader, fifo, args.workspace.resolve())
    _write_exclusive(args.capture_root / "bootstrap_prompt.txt", bootstrap)
    last_message = args.capture_root / "output_last_message.txt"
    argv = _codex_argv(args.codex.resolve(), row, args.workspace.resolve(), last_message)
    started_at_ms = int(time.time() * 1000)
    process = subprocess.Popen(
        argv,
        stdin=subprocess.PIPE,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        cwd=args.workspace,
        start_new_session=True,
    )
    _ACTIVE_PROCESS = process
    launch = {
        "argv": argv,
        "pid": process.pid,
        "schema_id": LAUNCH_SCHEMA,
        "started_at_ms": started_at_ms,
        "stdin": {"bytes": len(bootstrap), "sha256": ga.sha256(bootstrap)},
    }
    _write_json(args.capture_root / "launch_receipt.json", launch)
    ga.require(process.stdin is not None and process.stdout is not None and process.stderr is not None, "process pipes")
    thread_event = threading.Event()
    thread_box: list[str] = []
    pump_errors: list[str] = []
    stdout_thread = threading.Thread(target=_pump, args=(process.stdout, args.capture_root / "codex_stdout.jsonl", thread_event, thread_box, pump_errors), daemon=True)
    stderr_thread = threading.Thread(target=_pump, args=(process.stderr, args.capture_root / "codex_stderr.bin", threading.Event(), [], pump_errors), daemon=True)
    stdout_thread.start(); stderr_thread.start()
    process.stdin.write(bootstrap)
    process.stdin.close()

    activation_result: dict[str, Any] | None = None
    activation_error = "thread.started timeout"
    activation_deadline = time.monotonic() + min(300, args.timeout_seconds)
    thread_event.wait(timeout=min(60, args.timeout_seconds))
    if thread_box and not pump_errors:
        while time.monotonic() < activation_deadline and process.poll() is None:
            try:
                activation_result = ga.attest_codex(args.row_spec, args.capture_root, args.codex_home, gate_only=True)
                break
            except (ga.Invalid, OSError, sqlite3.Error, UnicodeError) as exc:
                activation_error = str(exc)
                time.sleep(0.1)

    delivery: dict[str, Any] = {}
    writer: threading.Thread | None = None
    terminal_deadline = time.monotonic() + args.timeout_seconds
    if activation_result is not None:
        writer = threading.Thread(target=_fifo_writer, args=(fifo, subject, process, delivery, terminal_deadline), daemon=True)
        writer.start()
    else:
        _terminate_group(process)

    timed_out = False
    try:
        remaining = max(0.1, terminal_deadline - time.monotonic())
        process.wait(timeout=remaining)
    except subprocess.TimeoutExpired:
        timed_out = True
        _terminate_group(process)
    if writer is not None:
        writer.join(timeout=10)
    stdout_thread.join(timeout=10); stderr_thread.join(timeout=10)
    ended_at_ms = int(time.time() * 1000)
    if fifo.exists():
        fifo.unlink()
        dfd = os.open(args.capture_root, os.O_RDONLY | getattr(os, "O_DIRECTORY", 0) | getattr(os, "O_CLOEXEC", 0))
        try:
            os.fsync(dfd)
        finally:
            os.close(dfd)
    if delivery.get("status") == "DELIVERED_ONCE":
        _write_exclusive(args.capture_root / "subject_input.txt", subject)
    receipt = {
        "activation_error": None if activation_result is not None else activation_error,
        "ended_at_ms": ended_at_ms,
        "pid": process.pid,
        "processes": 1,
        "rc": process.returncode,
        "requests": 1,
        "retries": 0,
        "schema_id": PROCESS_SCHEMA,
        "started_at_ms": started_at_ms,
        "stdin_closed": True,
        "subject_fifo_removed": not fifo.exists(),
        "subject_delivery": delivery,
        "subject_release": "AFTER_NATIVE_GOAL_ACTIVE_ATTESTATION" if activation_result is not None else "NOT_RELEASED",
        "timed_out": timed_out,
    }
    _write_json(args.capture_root / "process_receipt.json", receipt)
    if activation_result is None:
        raise LaunchFailure(f"native Goal activation failed; subject withheld: {activation_error}")
    if delivery.get("status") != "DELIVERED_ONCE":
        raise LaunchFailure(f"subject FIFO delivery failed: {delivery}")
    attestation = ga.attest_codex(args.row_spec, args.capture_root, args.codex_home)
    _write_json(args.capture_root / "goal_mode_attestation.json", attestation, 0o644)
    return attestation


def check(args: argparse.Namespace) -> dict[str, Any]:
    root = _source_root()
    contract = ga.load_json(root / "goal_mode_contract.json", 4_000_000)
    ga.require(contract.get("schema_id") == "pw-r9-goal-mode-empirical-harness-contract-v1", "contract schema")
    ga.require(contract.get("authority") == {
        "canary_launch": False,
        "matrix_launch": False,
        "qualification_credit": 0,
        "qualification_streak_clean_matrices": 0,
        "release": False,
    }, "contract authority not frozen")
    ga.require(contract["omp_lane"]["launch_argv"] == ["omp", "--cwd", "P:\\"], "OMP Windows boundary")
    for name in ("goal_mode_attestor.py", "goal_mode_harness.py", "read_goal_subject.py"):
        ast.parse((root / name).read_text(encoding="utf-8"), filename=name)
    version = subprocess.run([str(args.codex), "--version"], stdin=subprocess.DEVNULL, stdout=subprocess.PIPE, stderr=subprocess.PIPE, check=False, timeout=10)
    ga.require(version.returncode == 0 and version.stderr == b"", "Codex version command")
    version_text = version.stdout.decode("utf-8").strip()
    ga.require(version_text == "codex-cli 0.148.0", f"unsupported Codex CLI: {version_text}")
    help_run = subprocess.run([str(args.codex), "exec", "resume", "--help"], stdin=subprocess.DEVNULL, stdout=subprocess.PIPE, stderr=subprocess.PIPE, check=False, timeout=10)
    ga.require(help_run.returncode == 0 and b"Resume a previous session" in help_run.stdout and b"--ephemeral" in help_run.stdout, "Codex exec surface")
    return {
        "authority": {"canary_launch": False, "matrix_launch": False, "qualification_credit": 0},
        "bindings": _expected_bindings(),
        "checks": {
            "codex_cli_version": version_text,
            "codex_goal_lane": "ACTIVATION_TURN_THEN_NATIVE_GOAL_CONTINUATION_TURN_WITH_GATED_FIFO_IN_ONE_FRESH_TASK",
            "omp_lane": "EXISTING_WINDOWS_CONTROLLER_ONLY_NO_DUPLICATE_SPAWN",
            "source_ast": "PASS",
        },
        "schema_id": "pw-r9-goal-mode-harness-check-v1",
        "status": "PASS_STATIC_DATA_ONLY_NO_MODEL_CALL_NO_LAUNCH_ZERO_CREDIT",
    }


def _emit(value: dict[str, Any]) -> None:
    sys.stdout.buffer.write(ga.canon(value))


def main(argv: list[str] | None = None) -> int:
    global _ACTIVE_PROCESS
    parser = argparse.ArgumentParser()
    sub = parser.add_subparsers(dest="command", required=True)
    pcheck = sub.add_parser("check")
    pcheck.add_argument("--codex", type=Path, required=True)
    make = sub.add_parser("make-row-spec")
    make.add_argument("--subject", type=Path, required=True)
    make.add_argument("--criteria", type=Path, required=True)
    make.add_argument("--control-envelope", type=Path, required=True)
    make.add_argument("--run-id", required=True)
    make.add_argument("--row-id", required=True)
    make.add_argument("--model", required=True)
    make.add_argument("--reasoning-effort", required=True)
    make.add_argument("--cli-version", default="0.148.0")
    make.add_argument("--output", type=Path, required=True)
    run = sub.add_parser("run-codex-row")
    run.add_argument("--row-spec", type=Path, required=True)
    run.add_argument("--subject", type=Path, required=True)
    run.add_argument("--admission", type=Path, required=True)
    run.add_argument("--capture-root", type=Path, required=True)
    run.add_argument("--codex-home", type=Path, required=True)
    run.add_argument("--codex", type=Path, required=True)
    run.add_argument("--workspace", type=Path, required=True)
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
        _emit({
            "authority": {"qualification_credit": 0, "subject_release": False},
            "error": str(exc),
            "schema_id": "pw-r9-goal-mode-harness-failure-v1",
            "status": "FAIL_CLOSED_ZERO_CREDIT_NO_RETRY",
        })
        return 1
    finally:
        if _ACTIVE_PROCESS is not None:
            _terminate_group(_ACTIVE_PROCESS)
            for stream in (_ACTIVE_PROCESS.stdin, _ACTIVE_PROCESS.stdout, _ACTIVE_PROCESS.stderr):
                try:
                    if stream is not None:
                        stream.close()
                except OSError:
                    pass
            _ACTIVE_PROCESS = None


if __name__ == "__main__":
    raise SystemExit(main())
