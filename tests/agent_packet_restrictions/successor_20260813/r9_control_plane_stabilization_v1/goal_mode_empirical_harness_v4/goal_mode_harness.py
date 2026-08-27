#!/usr/bin/env python3
"""Two-process, one-task native Goal harness with explicit Codex exec resume."""

from __future__ import annotations

import argparse
import ast
import errno
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


ADMISSION_SCHEMA = "pw-r9-goal-mode-row-admission-v4"
ADAPTER = ga.ADAPTER
FILES = ("check_goal_mode_harness.py", "goal_mode_attestor.py", "goal_mode_contract.json", "goal_mode_harness.py", "read_goal_subject.py")
MAX_SUBJECT_BYTES = 8_000_000
DEFAULT_TIMEOUT_SECONDS = 3600
READER_TIMEOUT_SECONDS = 20
READER_OUTER_TIMEOUT_SECONDS = 25
_ACTIVE_PROCESSES: list[subprocess.Popen[bytes]] = []


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
    ga.require(path.read_bytes() == raw, f"exclusive write reopen mismatch: {path.name}")
    dfd = os.open(path.parent, os.O_RDONLY | getattr(os, "O_DIRECTORY", 0) | getattr(os, "O_CLOEXEC", 0))
    try:
        os.fsync(dfd)
    finally:
        os.close(dfd)


def _write_json(path: Path, value: Any, mode: int = 0o600) -> None:
    _write_exclusive(path, ga.canon(value), mode)


def _file_identity(path: Path) -> dict[str, Any]:
    raw = ga._read_regular(path, 16_000_000)
    return {"bytes": len(raw), "mode": f"{stat.S_IMODE(os.lstat(path).st_mode):04o}", "path": path.name, "sha256": ga.sha256(raw)}


def _source_root() -> Path:
    return Path(__file__).resolve().parent


def _expected_bindings() -> list[dict[str, Any]]:
    return [_file_identity(_source_root() / name) for name in FILES]


def _load_admission(path: Path, row_path: Path, row: dict[str, Any]) -> dict[str, Any]:
    value = ga.load_json(path, 4_000_000)
    ga.require(isinstance(value, dict), "admission object")
    ga._exact_keys(value, {"authority", "bindings", "review", "row_spec", "schema_id", "status"}, "admission")
    ga.require(value["schema_id"] == ADMISSION_SCHEMA and value["status"] == "PASS_INDEPENDENT_GOAL_RESUME_HARNESS_REVIEW", "admission schema/status")
    ga.require(value["authority"] == {"adapter": ADAPTER, "canary_launch": True, "launch_count": 1, "matrix_launch": False, "qualification": False, "retry": False, "row_id": row["row_id"], "run_id": row["run_id"]}, "admission authority")
    ga.require(value["bindings"] == _expected_bindings(), "admission source bindings")
    review_ref = value["review"]
    ga.require(isinstance(review_ref, dict), "admission review reference")
    ga._exact_keys(review_ref, {"bytes", "mode", "path", "sha256"}, "admission review reference")
    ga.require(isinstance(review_ref["path"], str) and review_ref["path"] == Path(review_ref["path"]).name, "review path must be a basename")
    review_path = path.parent / review_ref["path"]
    ga.require(_file_identity(review_path) == review_ref, "admission review identity")
    review = ga.load_json(review_path, 8_000_000)
    ga.require(isinstance(review, dict) and review.get("schema_id") == "pw-r9-goal-mode-harness-v4-independent-static-review-v1", "review schema")
    ga.require(review.get("status") == "PASS_INDEPENDENT_STATIC_REVIEW_CANARY_ADMISSION_ELIGIBLE_ZERO_CREDIT_NO_LAUNCH" and review.get("first_mismatch") is None, "review verdict")
    ga.require(review.get("authority") == {"canary_admission_eligible": True, "canary_launch": False, "matrix_launch": False, "qualification_credit": 0, "qualification_streak_clean_matrices": 0, "release": False}, "review authority")
    expected_review_bindings = [{**item, "path": f"goal_mode_empirical_harness_v4/{item['path']}"} for item in _expected_bindings()]
    ga.require(review.get("bindings") == expected_review_bindings, "review did not bind current sources")
    row_raw = ga._read_regular(row_path, 2_000_000)
    ga.require(value["row_spec"] == {"bytes": len(row_raw), "sha256": ga.sha256(row_raw)}, "admission row binding")
    return value


def _db_snapshot(codex_home: Path) -> dict[str, Any]:
    with ga._connect_ro(ga._db_path(codex_home, "state")) as state:
        thread_ids = [row[0] for row in state.execute("SELECT id FROM threads ORDER BY id")]
    with ga._connect_ro(ga._db_path(codex_home, "goals")) as goals:
        goal_ids = [row[0] for row in goals.execute("SELECT goal_id FROM thread_goals ORDER BY goal_id")]
    return {"captured_at_ms": int(time.time() * 1000), "goal_ids": goal_ids, "schema_id": ga.SNAPSHOT_SCHEMA, "thread_ids": thread_ids}


def _expected_objective(run_id: str, row_id: str, criteria: dict[str, Any], control: dict[str, Any], subject_hash: str) -> str:
    return f"R9 Goal Mode test taker {run_id}/{row_id}/0; criteria_sha256={ga.sha256(ga.canon(criteria, newline=False))}; control_envelope_sha256={ga.sha256(ga.canon(control, newline=False))}; subject_commitment_sha256={subject_hash}; execute exactly one gated subject after native Goal activation and settle terminal Goal state."


def make_row_spec(args: argparse.Namespace) -> dict[str, Any]:
    subject = ga._read_regular(args.subject, MAX_SUBJECT_BYTES)
    ga.require(subject and b"\x00" not in subject, "subject must be nonempty NUL-free UTF-8")
    subject.decode("utf-8")
    criteria = ga.load_json(args.criteria, 2_000_000); control = ga.load_json(args.control_envelope, 2_000_000)
    ga.require(isinstance(criteria, dict) and isinstance(control, dict), "criteria/control objects")
    subject_hash = ga.sha256(subject)
    row = {"adapter": ADAPTER, "attempt": 0, "cli_version": args.cli_version, "control_envelope": control, "criteria": criteria, "model": args.model, "objective": _expected_objective(args.run_id, args.row_id, criteria, control, subject_hash), "reasoning_effort": args.reasoning_effort, "row_id": args.row_id, "run_id": args.run_id, "schema_id": ga.ROW_SCHEMA, "subject_utf8_bytes": len(subject), "subject_utf8_sha256": subject_hash}
    _write_json(args.output, row, 0o644)
    return {"row_spec": _file_identity(args.output), "status": "ROW_SPEC_CREATED_ZERO_CREDIT_NO_LAUNCH"}


def _activation_prompt(row: dict[str, Any]) -> bytes:
    objective_json = json.dumps(row["objective"], ensure_ascii=False)
    prompt = f"""R9 NATIVE GOAL MODE ACTIVATION BOOTSTRAP — THE SCORED SUBJECT IS NOT PRESENT.

You are one fresh empirical test taker. This bootstrap contains only commitments. Before any file access, command, web request, collaboration action, or subject reasoning, execute exactly these three code-mode Goal calls as three separate calls:

1. `const r = await tools.get_goal({{}});\ntext(r);` and require `goal` null.
2. `const r = await tools.create_goal({{objective:{objective_json}}});\ntext(r);` and require this exact objective with status `active`.
3. `const r = await tools.get_goal({{}});\ntext(r);` and require the same Goal and status `active`.

Commitments: run_id={row['run_id']}; row_id={row['row_id']}; attempt=0; criteria_sha256={ga.sha256(ga.canon(row['criteria'], newline=False))}; control_envelope_sha256={ga.sha256(ga.canon(row['control_envelope'], newline=False))}; subject_commitment_sha256={row['subject_utf8_sha256']}; subject_utf8_bytes={row['subject_utf8_bytes']}.

After call 3 succeeds, perform no other tool call and no subject work. Emit exactly `GOAL_ACTIVE_READY_FOR_EXPLICIT_RESUME_HANDOFF` as the assistant message while leaving the Goal active. The controller will continue this exact task through the documented Codex exec resume surface. Do not try to find the subject, do not delegate, and do not complete or block the Goal.
"""
    raw = prompt.encode("utf-8")
    ga.require(row["subject_utf8_sha256"].encode() in raw and str(row["subject_utf8_bytes"]).encode() in raw, "activation commitments")
    return raw


def _continuation_prompt(row: dict[str, Any], reader: Path, fifo: Path, workspace: Path) -> bytes:
    reader_cmd = shlex.join(["timeout", "--signal=TERM", "--kill-after=5s", f"{READER_OUTER_TIMEOUT_SECONDS}s", "python3", "-B", str(reader), "--fifo", str(fifo), "--sha256", row["subject_utf8_sha256"], "--bytes", str(row["subject_utf8_bytes"]), "--timeout-seconds", str(READER_TIMEOUT_SECONDS)])
    exec_code = "const r = await tools.exec_command({" + f"cmd:{json.dumps(reader_cmd)},workdir:{json.dumps(str(workspace))},yield_time_ms:30000,max_output_tokens:20000" + "});\nif (r.exit_code !== 0) throw new Error('subject reader failed');\ntext(r.output);"
    prompt = f"""R9 NATIVE GOAL MODE EXPLICIT RESUME BOOTSTRAP — THE SCORED SUBJECT IS NOT PRESENT.

This is the documented resume of the same fresh test-taker task. Before any file access, command, web request, collaboration action, or subject reasoning, execute exactly this code-mode call and inspect its JSON:

`const r = await tools.get_goal({{}});\ntext(r);`

Require the exact previously created objective and status `active`. If the Goal is absent, changed, or terminal, stop without opening the subject channel. After and only after that active Goal receipt, execute exactly this one code-mode call:

```javascript
{exec_code}
```

Treat the returned UTF-8 text as the sole scored subject prompt. Do not read another prompt source. Perform all subject reasoning in this resumed Goal turn. Do not retry, relaunch, replace, delegate, or reuse a different task. When the answer is fully determined, call `const r = await tools.update_goal({{status:"complete"}});\ntext(r);` exactly once, require the same Goal with status `complete`, and emit only the subject answer as the terminal assistant message.
"""
    return prompt.encode("utf-8")


def _parse_thread_started(line: bytes) -> str | None:
    try:
        value = json.loads(line)
    except json.JSONDecodeError:
        return None
    thread_id = value.get("thread_id") if isinstance(value, dict) and value.get("type") == "thread.started" else None
    return thread_id if isinstance(thread_id, str) else None


def _normalize_regular_if_present(path: Path) -> None:
    try:
        before = os.lstat(path)
    except FileNotFoundError:
        return
    ga.require(stat.S_ISREG(before.st_mode) and not path.is_symlink(), f"unsafe CLI output file: {path.name}")
    os.chmod(path, 0o600)
    after = os.lstat(path)
    ga.require((before.st_dev, before.st_ino) == (after.st_dev, after.st_ino) and stat.S_IMODE(after.st_mode) == 0o600, f"CLI output mode normalization: {path.name}")


def _matching_reader_pids(fifo: Path) -> list[int]:
    target = str(fifo).encode("utf-8")
    result: list[int] = []
    for member in Path("/proc").iterdir():
        if not member.name.isdigit():
            continue
        try:
            raw = (member / "cmdline").read_bytes()
        except FileNotFoundError:
            continue
        except (OSError, PermissionError) as exc:
            raise LaunchFailure(f"reader process census failed: {member.name}:{exc}") from exc
        if target in raw and b"read_goal_subject.py" in raw:
            result.append(int(member.name))
    return sorted(result)


def _signal_matching_readers(fifo: Path, pids: list[int], sig: signal.Signals) -> int:
    target = str(fifo).encode("utf-8")
    sent = 0
    for pid in pids:
        try:
            pidfd = os.pidfd_open(pid)
        except ProcessLookupError:
            continue
        try:
            try:
                raw = Path(f"/proc/{pid}/cmdline").read_bytes()
            except FileNotFoundError:
                continue
            ga.require(target in raw and b"read_goal_subject.py" in raw, "reader PID identity drift")
            signal.pidfd_send_signal(pidfd, sig)
            sent += 1
        finally:
            os.close(pidfd)
    return sent


def _wait_reader_quiescence(fifo: Path) -> dict[str, Any]:
    initial = _matching_reader_pids(fifo)
    deadline = time.monotonic() + 5
    while time.monotonic() < deadline and _matching_reader_pids(fifo):
        time.sleep(0.05)
    remaining = _matching_reader_pids(fifo)
    term_sent = _signal_matching_readers(fifo, remaining, signal.SIGTERM) if remaining else 0
    deadline = time.monotonic() + 5
    while time.monotonic() < deadline and _matching_reader_pids(fifo):
        time.sleep(0.05)
    remaining = _matching_reader_pids(fifo)
    kill_sent = _signal_matching_readers(fifo, remaining, signal.SIGKILL) if remaining else 0
    deadline = time.monotonic() + 5
    while time.monotonic() < deadline and _matching_reader_pids(fifo):
        time.sleep(0.05)
    final = _matching_reader_pids(fifo)
    return {"detected_pids": initial, "kill_sent": kill_sent, "remaining_pids": final, "term_sent": term_sent}


def _pump(stream: Any, path: Path, thread_event: threading.Event, thread_box: list[str], errors: list[str]) -> None:
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
                thread_id = _parse_thread_started(chunk) if path.name.endswith("stdout.jsonl") else None
                if thread_id:
                    if thread_box and thread_box[0] != thread_id:
                        errors.append("multiple thread ids")
                    elif not thread_box:
                        thread_box.append(thread_id); thread_event.set()
        finally:
            os.close(fd)
    except BaseException as exc:
        errors.append(f"{path.name}:{type(exc).__name__}:{exc}"); thread_event.set()


def _start_process(argv: list[str], prompt: bytes, capture: Path, phase: str, cwd: Path) -> tuple[subprocess.Popen[bytes], list[threading.Thread], list[str], list[str], int]:
    started_at_ms = int(time.time() * 1000)
    process = subprocess.Popen(argv, stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.PIPE, cwd=cwd, start_new_session=True)
    _ACTIVE_PROCESSES.append(process)
    _write_json(capture / f"{phase}_launch_receipt.json", {"argv": argv, "phase": phase.upper(), "pid": process.pid, "schema_id": ga.LAUNCH_SCHEMA, "started_at_ms": started_at_ms, "stdin": {"bytes": len(prompt), "sha256": ga.sha256(prompt)}})
    ga.require(process.stdin is not None and process.stdout is not None and process.stderr is not None, "process pipes")
    event = threading.Event(); box: list[str] = []; errors: list[str] = []
    out = threading.Thread(target=_pump, args=(process.stdout, capture / f"{phase}_stdout.jsonl", event, box, errors), daemon=True)
    err = threading.Thread(target=_pump, args=(process.stderr, capture / f"{phase}_stderr.bin", threading.Event(), [], errors), daemon=True)
    out.start(); err.start()
    process.stdin.write(prompt); process.stdin.close()
    return process, [out, err], box, errors, started_at_ms


def _terminate_group(process: subprocess.Popen[bytes], graceful: bool = False) -> str:
    if process.poll() is not None:
        return "PROCESS_EXITED_AFTER_GATE"
    try:
        os.killpg(process.pid, signal.SIGTERM if graceful else signal.SIGKILL)
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
    return "CONTROLLER_TERMINATED_AFTER_GATE"


def _fifo_writer(fifo: Path, subject: bytes, process: subprocess.Popen[bytes], result: dict[str, Any], deadline: float) -> None:
    while time.monotonic() < deadline and process.poll() is None:
        try:
            fd = os.open(fifo, os.O_WRONLY | os.O_NONBLOCK | getattr(os, "O_CLOEXEC", 0))
        except OSError as exc:
            if exc.errno == errno.ENXIO:
                time.sleep(0.05); continue
            result["error"] = f"fifo_open:{exc}"; return
        try:
            offset = 0
            while offset < len(subject):
                offset += os.write(fd, subject[offset:])
            result.update({"bytes": len(subject), "closed_at_ms": int(time.time() * 1000), "sha256": ga.sha256(subject), "status": "DELIVERED_ONCE"}); return
        except OSError as exc:
            result["error"] = f"fifo_write:{exc}"; return
        finally:
            os.close(fd)
    result["error"] = "fifo_reader_never_opened"


def _activation_argv(codex: Path, row: dict[str, Any], workspace: Path, last: Path) -> list[str]:
    return [str(codex), "exec", "--strict-config", "-C", str(workspace), "--sandbox", "read-only", "--color", "never", "--json", "-m", row["model"], "-c", f'model_reasoning_effort="{row["reasoning_effort"]}"', "-c", "suppress_unstable_features_warning=true", "-o", str(last), "-"]


def _resume_argv(codex: Path, row: dict[str, Any], workspace: Path, last: Path, thread_id: str) -> list[str]:
    return [str(codex), "-C", str(workspace), "--sandbox", "read-only", "exec", "resume", "--strict-config", "--json", "-m", row["model"], "-c", f'model_reasoning_effort="{row["reasoning_effort"]}"', "-c", "suppress_unstable_features_warning=true", "-o", str(last), thread_id, "-"]


def run_codex_row(args: argparse.Namespace) -> dict[str, Any]:
    row = ga._load_row(args.row_spec); ga.require(row["adapter"] == ADAPTER, "row adapter")
    subject = ga._read_regular(args.subject, MAX_SUBJECT_BYTES); subject.decode("utf-8")
    ga.require(len(subject) == row["subject_utf8_bytes"] and ga.sha256(subject) == row["subject_utf8_sha256"], "subject identity")
    _load_admission(args.admission, args.row_spec, row)
    ga.require(not args.capture_root.exists(), "capture root must be absent")
    args.capture_root.mkdir(mode=0o700, parents=False); os.chmod(args.capture_root, 0o700)
    _write_json(args.capture_root / "prelaunch_snapshot.json", _db_snapshot(args.codex_home))
    activation_prompt = _activation_prompt(row); _write_exclusive(args.capture_root / "activation_prompt.txt", activation_prompt)
    activation_last = args.capture_root / "activation_output_last_message.txt"
    activation_process, activation_threads, activation_box, activation_errors, activation_started = _start_process(_activation_argv(args.codex.resolve(), row, args.workspace.resolve(), activation_last), activation_prompt, args.capture_root, "activation", args.workspace)
    activation_result: dict[str, Any] | None = None; activation_error = "activation gate timeout"
    activation_deadline = time.monotonic() + min(300, args.timeout_seconds)
    while time.monotonic() < activation_deadline and activation_process.poll() is None:
        if activation_box and not activation_errors:
            try:
                _normalize_regular_if_present(activation_last)
                activation_result = ga.attest_codex(args.row_spec, args.capture_root, args.codex_home, "activation"); break
            except (ga.Invalid, OSError, sqlite3.Error, UnicodeError) as exc:
                activation_error = str(exc)
        time.sleep(0.05)
    if activation_result is None and activation_process.poll() is not None and activation_box and not activation_errors:
        try:
            _normalize_regular_if_present(activation_last)
            activation_result = ga.attest_codex(args.row_spec, args.capture_root, args.codex_home, "activation")
        except (ga.Invalid, OSError, sqlite3.Error, UnicodeError) as exc:
            activation_error = str(exc)
    if activation_result is None:
        _terminate_group(activation_process)
    else:
        _write_json(args.capture_root / "activation_goal_active_gate.json", activation_result)
    handoff = _terminate_group(activation_process, graceful=True) if activation_result is not None else "NOT_REACHED"
    for thread in activation_threads:
        thread.join(timeout=10)
    _normalize_regular_if_present(activation_last)
    activation_ended = int(time.time() * 1000)
    _write_json(args.capture_root / "activation_process_receipt.json", {"ended_at_ms": activation_ended, "handoff": handoff, "pid": activation_process.pid, "rc": activation_process.returncode, "schema_id": ga.ACTIVATION_PROCESS_SCHEMA, "started_at_ms": activation_started, "stdin_closed": True, "timed_out": activation_result is None})
    if activation_result is None:
        raise LaunchFailure(f"activation failed; subject withheld: {activation_error}")
    activation_result = ga.attest_codex(args.row_spec, args.capture_root, args.codex_home, "activation")
    thread_id = activation_result["activation"]["thread_id"]

    fifo = args.capture_root / "subject.fifo"; os.mkfifo(fifo, 0o600); os.chmod(fifo, 0o600)
    continuation = _continuation_prompt(row, _source_root() / "read_goal_subject.py", fifo, args.workspace.resolve())
    _write_exclusive(args.capture_root / "continuation_prompt.txt", continuation)
    resume_last = args.capture_root / "resume_output_last_message.txt"
    resume_process, resume_threads, resume_box, resume_errors, resume_started = _start_process(_resume_argv(args.codex.resolve(), row, args.workspace.resolve(), resume_last, thread_id), continuation, args.capture_root, "resume", args.workspace)
    resume_result: dict[str, Any] | None = None; resume_error = "resume Goal gate timeout"
    resume_deadline = time.monotonic() + min(300, args.timeout_seconds)
    while time.monotonic() < resume_deadline and resume_process.poll() is None:
        if resume_box and not resume_errors:
            try:
                _normalize_regular_if_present(resume_last)
                resume_result = ga.attest_codex(args.row_spec, args.capture_root, args.codex_home, "resume"); break
            except (ga.Invalid, OSError, sqlite3.Error, UnicodeError) as exc:
                resume_error = str(exc)
        time.sleep(0.05)
    delivery: dict[str, Any] = {}; writer: threading.Thread | None = None
    terminal_deadline = time.monotonic() + args.timeout_seconds
    if resume_result is not None:
        _write_json(args.capture_root / "resume_goal_active_gate.json", resume_result)
        writer = threading.Thread(target=_fifo_writer, args=(fifo, subject, resume_process, delivery, terminal_deadline), daemon=True); writer.start()
    else:
        _terminate_group(resume_process)
    timed_out = False
    try:
        resume_process.wait(timeout=max(0.1, terminal_deadline - time.monotonic()))
    except subprocess.TimeoutExpired:
        timed_out = True; _terminate_group(resume_process)
    if writer is not None:
        writer.join(timeout=10)
    for thread in resume_threads:
        thread.join(timeout=10)
    _normalize_regular_if_present(resume_last)
    reader_quiescence = _wait_reader_quiescence(fifo)
    if not reader_quiescence["remaining_pids"] and fifo.exists():
        fifo.unlink()
        dfd = os.open(args.capture_root, os.O_RDONLY | getattr(os, "O_DIRECTORY", 0) | getattr(os, "O_CLOEXEC", 0)); os.fsync(dfd); os.close(dfd)
    if delivery.get("status") == "DELIVERED_ONCE":
        _write_exclusive(args.capture_root / "subject_input.txt", subject)
    _write_json(args.capture_root / "resume_process_receipt.json", {"ended_at_ms": int(time.time() * 1000), "goal_restore_error": None if resume_result is not None else resume_error, "pid": resume_process.pid, "rc": resume_process.returncode, "reader_quiescence": reader_quiescence, "schema_id": ga.RESUME_PROCESS_SCHEMA, "started_at_ms": resume_started, "stdin_closed": True, "subject_delivery": delivery, "subject_fifo_removed": not fifo.exists(), "subject_release": "AFTER_RESUMED_SAME_GOAL_ACTIVE_ATTESTATION" if resume_result is not None else "NOT_RELEASED", "timed_out": timed_out})
    if resume_result is None:
        raise LaunchFailure(f"same-task Goal restore failed; subject withheld: {resume_error}")
    if delivery.get("status") != "DELIVERED_ONCE":
        raise LaunchFailure(f"subject delivery failed: {delivery}")
    if reader_quiescence != {"detected_pids": [], "kill_sent": 0, "remaining_pids": [], "term_sent": 0}:
        raise LaunchFailure(f"reader required forced cleanup: {reader_quiescence}")
    attestation = ga.attest_codex(args.row_spec, args.capture_root, args.codex_home, "final")
    _write_json(args.capture_root / "goal_mode_attestation.json", attestation, 0o644)
    return attestation


def check(args: argparse.Namespace) -> dict[str, Any]:
    root = _source_root(); contract = ga.load_json(root / "goal_mode_contract.json", 4_000_000)
    ga.require(contract["schema_id"] == "pw-r9-goal-mode-empirical-harness-contract-v4" and contract["authority"] == {"canary_launch": False, "matrix_launch": False, "qualification_credit": 0, "qualification_streak_clean_matrices": 0, "release": False}, "contract freeze")
    ga.require(contract["omp_lane"]["launch_argv"] == ["omp", "--cwd", "P:\\"] and contract["omp_lane"]["duplicate_spawn"] is False, "OMP boundary")
    for name in ("check_goal_mode_harness.py", "goal_mode_attestor.py", "goal_mode_harness.py", "read_goal_subject.py"):
        ast.parse((root / name).read_text(encoding="utf-8"), filename=name)
    version = subprocess.run([str(args.codex), "--version"], stdin=subprocess.DEVNULL, stdout=subprocess.PIPE, stderr=subprocess.PIPE, check=False, timeout=10)
    ga.require(version.returncode == 0 and version.stderr == b"" and version.stdout.decode().strip() == "codex-cli 0.148.0", "Codex version")
    help_run = subprocess.run([str(args.codex), "exec", "resume", "--help"], stdin=subprocess.DEVNULL, stdout=subprocess.PIPE, stderr=subprocess.PIPE, check=False, timeout=10)
    ga.require(help_run.returncode == 0 and b"Resume a previous session" in help_run.stdout and b"If `-` is used, read from stdin" in help_run.stdout, "Codex resume surface")
    return {"authority": {"canary_launch": False, "matrix_launch": False, "qualification_credit": 0}, "bindings": _expected_bindings(), "checks": {"codex_cli_version": "codex-cli 0.148.0", "explicit_same_task_resume": "PASS_STATIC", "native_goal_context_required": "PASS_STATIC", "omp_lane": "EXISTING_WINDOWS_CONTROLLER_ONLY_NO_DUPLICATE_SPAWN", "reader_bounded_quiescence": "PASS_STATIC", "resume_color_option_absent": "PASS_STATIC", "source_ast": "PASS"}, "schema_id": "pw-r9-goal-mode-harness-check-v4", "status": "PASS_STATIC_DATA_ONLY_NO_MODEL_CALL_NO_LAUNCH_ZERO_CREDIT"}


def _emit(value: dict[str, Any]) -> None:
    sys.stdout.buffer.write(ga.canon(value))


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(); sub = parser.add_subparsers(dest="command", required=True)
    pcheck = sub.add_parser("check"); pcheck.add_argument("--codex", type=Path, required=True)
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
        if args.command == "check": result = check(args)
        elif args.command == "make-row-spec": result = make_row_spec(args)
        else:
            ga.require(60 <= args.timeout_seconds <= 7200, "timeout bounds"); result = run_codex_row(args)
        _emit(result); return 0
    except (ga.Invalid, OSError, sqlite3.Error, UnicodeError, subprocess.SubprocessError) as exc:
        _emit({"authority": {"qualification_credit": 0, "subject_release": False}, "error": str(exc), "schema_id": "pw-r9-goal-mode-harness-failure-v4", "status": "FAIL_CLOSED_ZERO_CREDIT_NO_RETRY"}); return 1
    finally:
        while _ACTIVE_PROCESSES:
            process = _ACTIVE_PROCESSES.pop()
            _terminate_group(process)
            for stream in (process.stdin, process.stdout, process.stderr):
                try:
                    if stream is not None: stream.close()
                except OSError:
                    pass


if __name__ == "__main__":
    raise SystemExit(main())
