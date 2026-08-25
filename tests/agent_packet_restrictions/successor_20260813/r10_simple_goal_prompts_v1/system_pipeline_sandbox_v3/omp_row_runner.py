#!/usr/bin/env python3
"""Run exactly one frozen OMP row in one interactive PTY and preserve evidence."""

from __future__ import annotations

import argparse
import fcntl
import json
import os
import pty
import re
import select
import shutil
import signal
import struct
import subprocess
import sys
import termios
import time
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

import freeze_check
import omp_session
import pipeline


HERE = Path(__file__).resolve().parent
EVIDENCE = HERE / "evidence"
MAX_TRANSCRIPT_BYTES = 64 * 1024 * 1024
READY_TIMEOUT_SECONDS = 90
SESSION_STABILITY_SECONDS = 3
POST_RESULT_EXIT_SECONDS = 45
ROWS = 80
COLUMNS = 500
ANSI_CSI = re.compile(rb"\x1b\[[0-?]*[ -/]*[@-~]")
ANSI_OSC = re.compile(rb"\x1b\][^\x07]*(?:\x07|\x1b\\)")


class RunnerError(RuntimeError):
    pass


class PostPopenRunnerError(RunnerError):
    def __init__(self, pid: int, cause: BaseException):
        super().__init__(f"post-Popen failure for pid {pid}: {type(cause).__name__}: {cause}")
        self.pid = pid
        self.cause = cause


class ReservationConflict(RunnerError):
    pass


def require(condition: bool, message: str) -> None:
    if not condition:
        raise RunnerError(message)


def utc_now() -> str:
    return datetime.now(timezone.utc).isoformat(timespec="milliseconds").replace("+00:00", "Z")


def atomic_json(path: Path, value: Any) -> None:
    pipeline.atomic_write(path, pipeline.pretty_json(value))


def file_record(path: Path, root: Path) -> dict[str, Any]:
    require(path.is_file() and not path.is_symlink(), f"evidence file absent: {path.name}")
    return {
        "path": path.relative_to(root).as_posix(),
        "bytes": path.stat().st_size,
        "sha256": pipeline.sha256_file(path),
    }


def route_map() -> dict[str, dict[str, Any]]:
    matrix = pipeline.load_json(HERE / "matrix.json")
    return {row["id"]: row for row in matrix["ordered_routes"]}


def plan_rows() -> list[dict[str, Any]]:
    plan = pipeline.load_json(HERE / "launch_plan.json")
    require(plan.get("pass_order") == ["pass_01", "pass_02"], "launch plan pass order")
    require(plan.get("row_count") == 24 and len(plan.get("rows", [])) == 24, "launch plan rows")
    return plan["rows"]


def planned_row(pass_id: str, route_id: str) -> dict[str, Any]:
    matches = [row for row in plan_rows() if row["pass_id"] == pass_id and row["route_id"] == route_id]
    require(len(matches) == 1, "one planned row")
    return matches[0]


def journal_rows() -> list[dict[str, Any]]:
    path = EVIDENCE / "launch_journal.jsonl"
    if not path.exists():
        return []
    require(path.is_file() and not path.is_symlink(), "launch journal unsafe")
    return pipeline.load_jsonl(path)


def verify_next_row(planned: dict[str, Any]) -> list[dict[str, Any]]:
    journal = journal_rows()
    require(planned["ordinal"] == len(journal) + 1, "row is not the next frozen ordinal")
    frozen = plan_rows()
    for expected, actual in zip(frozen, journal, strict=False):
        for field in ("ordinal", "pass_id", "route_id", "attempt_id", "nonce"):
            require(actual.get(field) == expected[field], f"launch journal frozen join: {field}")
    if journal:
        import verify_matrix

        routes = route_map()
        verified_prefix = []
        for previous in frozen[: len(journal)]:
            report = verify_matrix.verify_row(previous["pass_id"], routes[previous["route_id"]])
            require(report.get("status") == "PASS", "previous row did not independently verify; fail-stop")
            verified_prefix.append(report)
        prefix_report = [{"rows": verified_prefix}]
        verify_matrix.verify_launch_journal(prefix_report)
        verify_matrix.verify_global_uniqueness(prefix_report)
    return journal


def row_preflight(row_dir: Path, planned: dict[str, Any], route: dict[str, Any]) -> dict[str, Any]:
    runtime = pipeline.load_json(HERE / "runtime_manifest.json")["omp"]
    binary = Path(runtime["binary"])
    require(binary.is_file() and not binary.is_symlink(), "OMP binary absent or unsafe")
    require(binary.stat().st_size == runtime["binary_bytes"], "OMP binary bytes drift")
    require(pipeline.sha256_file(binary) == runtime["binary_sha256"], "OMP binary hash drift")
    environment = dict(os.environ)
    environment["PI_CODING_AGENT_DIR"] = runtime["profile_dir"]
    version_process = subprocess.run(
        [str(binary), "--version"],
        check=False,
        capture_output=True,
        text=True,
        env=environment,
        timeout=30,
    )
    require(version_process.returncode == 0, "OMP version command")
    version = version_process.stdout.strip()
    require(version == runtime["version"], "OMP version drift")
    commands = []
    observed: dict[str, Any] = {}
    for key, expected in runtime["effective_config"].items():
        process = subprocess.run(
            [str(binary), "config", "get", key],
            check=False,
            capture_output=True,
            text=True,
            env=environment,
            timeout=30,
        )
        raw = process.stdout.strip()
        commands.append({
            "argv": [str(binary), "config", "get", key],
            "key": key,
            "exit_code": process.returncode,
            "stdout": raw,
        })
        require(process.returncode == 0, f"OMP config command: {key}")
        value = pipeline.strict_loads(raw) if raw in {"true", "false"} or raw.startswith(("{", "[", '"')) else raw
        require(value == expected, f"OMP effective config drift: {key}")
        observed[key] = value
    receipt = {
        "schema_id": "pm.r10.storage_pipeline.omp_preflight.v2",
        **{field: planned[field] for field in ("pass_id", "route_id", "ordinal", "attempt_id", "nonce")},
        "surface": route["surface"],
        "model": route["model"],
        "thinking": route["thinking"],
        "binary": str(binary),
        "binary_bytes": binary.stat().st_size,
        "binary_sha256": pipeline.sha256_file(binary),
        "version_stdout": version,
        "version_command": {
            "argv": [str(binary), "--version"],
            "exit_code": version_process.returncode,
            "stdout": version_process.stdout.strip(),
        },
        "profile_dir": runtime["profile_dir"],
        "config_commands": commands,
        "effective_config": observed,
        "observed_at_utc": utc_now(),
        "subject_calls": 0,
    }
    atomic_json(row_dir / "omp_preflight.json", receipt)
    return receipt


def expected_argv(route: dict[str, Any], planned: dict[str, Any]) -> list[str]:
    runtime = pipeline.load_json(HERE / "runtime_manifest.json")["omp"]
    return [
        runtime["binary"],
        "--session-dir",
        planned["session_dir"],
        "--no-title",
        "--no-tools",
        "--no-skills",
        "--no-rules",
        "--cwd",
        planned["cwd"],
        "--model",
        route["model"],
        "--thinking",
        route["thinking"],
    ]


def exact_result(text: str) -> None:
    matrix = pipeline.load_json(HERE / "matrix.json")
    oracle = pipeline.load_json(HERE / "oracle.json")
    oracle_text = (HERE / "oracle.json").read_text(encoding="utf-8").strip()
    require(len(text.encode("utf-8")) <= matrix["max_final_assistant_utf8_bytes"], "final byte ceiling")
    lines = [line for line in text.splitlines() if line.startswith(pipeline.RESULT_PREFIX)]
    require(len(lines) == 1, "exactly one PM_RESULT line")
    nonempty = [line for line in text.splitlines() if line.strip()]
    require(nonempty and nonempty[-1] == lines[0], "PM_RESULT terminal")
    require(lines[0] == pipeline.RESULT_PREFIX + oracle_text, "exact oracle line")
    require(pipeline.strict_loads(lines[0][len(pipeline.RESULT_PREFIX) :]) == oracle, "exact oracle object")


def strip_terminal(raw: bytes) -> bytes:
    return ANSI_CSI.sub(b"", ANSI_OSC.sub(b"", raw)).replace(b"\r", b"")


def session_file(session_dir: Path) -> Path | None:
    if not session_dir.is_dir() or session_dir.is_symlink():
        return None
    entries = list(session_dir.iterdir())
    if len(entries) != 1:
        return None
    session = entries[0]
    require(session.is_file() and not session.is_symlink() and session.suffix == ".jsonl", "OMP session dir entry unsafe")
    return session


def read_available(master_fd: int, output, transcript_bytes: int) -> tuple[int, bool]:
    closed = False
    while True:
        readable, _, _ = select.select([master_fd], [], [], 0)
        if not readable:
            break
        try:
            chunk = os.read(master_fd, 65536)
        except OSError:
            closed = True
            break
        if not chunk:
            closed = True
            break
        transcript_bytes += len(chunk)
        require(transcript_bytes <= MAX_TRANSCRIPT_BYTES, "OMP transcript byte ceiling")
        output.write(chunk)
        output.flush()
    return transcript_bytes, closed


def terminate_process(process: subprocess.Popen[bytes]) -> None:
    if process.poll() is not None:
        return
    try:
        os.killpg(process.pid, signal.SIGTERM)
    except OSError:
        pass
    try:
        process.wait(timeout=5)
        return
    except subprocess.TimeoutExpired:
        pass
    try:
        os.killpg(process.pid, signal.SIGKILL)
    except OSError:
        pass
    try:
        process.wait(timeout=5)
    except subprocess.TimeoutExpired:
        pass


def append_journal(existing: list[dict[str, Any]], launch: dict[str, Any], preflight: dict[str, Any], launch_path: Path) -> None:
    row = {
        "schema_id": "pm.r10.storage_pipeline.launch_journal.v2",
        **{field: launch[field] for field in ("ordinal", "pass_id", "route_id", "attempt_id", "nonce", "started_at_utc")},
        "launch_sha256": pipeline.sha256_file(launch_path),
        "omp_preflight_sha256": pipeline.sha256_file(launch_path.parent / "omp_preflight.json"),
        "popen_observed": True,
        "pid": launch["pid"],
    }
    pipeline.atomic_write(EVIDENCE / "launch_journal.jsonl", pipeline.jsonl_bytes([*existing, row]))


def run_row(pass_id: str, route_id: str, max_seconds: int) -> dict[str, Any]:
    pipeline.verify()
    require(freeze_check.verify_freeze()["status"] == "PASS_FROZEN_ZERO_SUBJECT", "frozen package verification")
    routes = route_map()
    require(route_id in routes, "unknown route")
    route = routes[route_id]
    require(route["surface"] == "omp_tui", "runner accepts OMP rows only")
    planned = planned_row(pass_id, route_id)
    existing_journal = verify_next_row(planned)

    row_dir = EVIDENCE / pass_id / route_id
    if os.path.lexists(EVIDENCE):
        require(EVIDENCE.is_dir() and not EVIDENCE.is_symlink(), "evidence root unsafe")
    if os.path.lexists(row_dir):
        raise ReservationConflict("row already consumed or concurrently reserved")
    row_dir.parent.mkdir(parents=True, exist_ok=True)
    require(row_dir.parent.is_dir() and not row_dir.parent.is_symlink(), "pass evidence directory unsafe")
    try:
        row_dir.mkdir()
    except FileExistsError as exc:
        raise ReservationConflict("row concurrently reserved") from exc
    reservation = {
        "schema_id": "pm.r10.storage_pipeline.reservation.v2",
        **{field: planned[field] for field in ("pass_id", "route_id", "ordinal", "attempt_id", "nonce")},
        "reserved_at_utc": utc_now(),
        "retry_count": 0,
        "qualification_credit": 0,
    }
    atomic_json(row_dir / "reservation.json", reservation)

    cwd = Path(planned["cwd"])
    session_dir = Path(planned["session_dir"])
    require(str(cwd).startswith("/tmp/pm-r10-storage-v3-"), "frozen cwd scope")
    require(str(session_dir).startswith("/tmp/pm-r10-storage-v3-session-"), "frozen session-dir scope")
    require(not os.path.lexists(cwd) and not os.path.lexists(session_dir), "fresh cwd and session dir")
    cwd.mkdir(mode=0o700)
    require(not any(cwd.iterdir()), "empty cwd before launch")

    preflight = row_preflight(row_dir, planned, route)
    prompt_path = HERE / "prompts/omp.prompt.txt"
    prompt = prompt_path.read_bytes()
    require(prompt.startswith(b"/goal ") and b"\x00" not in prompt, "one OMP /goal prompt")
    try:
        objective = prompt[len(b"/goal ") :].decode("utf-8")
    except UnicodeDecodeError as exc:
        raise RunnerError("OMP prompt UTF-8") from exc
    submission = prompt + b"\r"
    pipeline.atomic_write(row_dir / "stdin_submission.raw", submission)

    argv = expected_argv(route, planned)
    environment = dict(os.environ)
    environment["PI_CODING_AGENT_DIR"] = pipeline.load_json(HERE / "runtime_manifest.json")["omp"]["profile_dir"]
    environment["TERM"] = "xterm-256color"
    master_fd, slave_fd = pty.openpty()
    fcntl.ioctl(slave_fd, termios.TIOCSWINSZ, struct.pack("HHHH", ROWS, COLUMNS, 0, 0))
    process: subprocess.Popen[bytes] | None = None
    output = None
    transcript_bytes = 0
    submitted = False
    control_sent = False
    started_at = utc_now()
    deadline = time.monotonic() + max_seconds
    try:
        output = (row_dir / "transcript.raw").open("xb")
        process = subprocess.Popen(
            argv,
            stdin=slave_fd,
            stdout=slave_fd,
            stderr=slave_fd,
            cwd=str(HERE),
            env=environment,
            start_new_session=True,
            close_fds=True,
        )
        os.close(slave_fd)
        slave_fd = -1
        launch = {
            "schema_id": "pm.r10.storage_pipeline.launch.v2",
            **{field: planned[field] for field in ("pass_id", "route_id", "ordinal", "attempt_id", "nonce")},
            "surface": route["surface"],
            "model": route["model"],
            "thinking": route["thinking"],
            "prompt_utf8_bytes": len(prompt),
            "prompt_sha256": pipeline.sha256_bytes(prompt),
            "external_prompt_count": 1,
            "started_at_utc": started_at,
            "pid": process.pid,
            "pty_rows": ROWS,
            "pty_columns": COLUMNS,
            "cwd": str(cwd),
            "cwd_entries_before": 0,
            "session_dir": str(session_dir),
            "session_dir_absent_before": True,
            "argv": argv,
            "advisor_enabled": False,
            "task_agent_advisor": {"task": "off"},
            "omp_preflight_bytes": (row_dir / "omp_preflight.json").stat().st_size,
            "omp_preflight_sha256": pipeline.sha256_file(row_dir / "omp_preflight.json"),
        }
        atomic_json(row_dir / "launch.json", launch)
        append_journal(existing_journal, launch, preflight, row_dir / "launch.json")
        print(pipeline.canonical_json({"status": "LAUNCHED", "pid": process.pid, "attempt_id": planned["attempt_id"]}), flush=True)

        ready_deadline = min(deadline, time.monotonic() + READY_TIMEOUT_SECONDS)
        recent = bytearray()
        while time.monotonic() < ready_deadline:
            transcript_bytes, _ = read_available(master_fd, output, transcript_bytes)
            if process.poll() is not None:
                raise RunnerError("OMP exited before prompt submission")
            if output.tell() > 0:
                with (row_dir / "transcript.raw").open("rb") as capture:
                    capture.seek(max(0, output.tell() - 262144))
                    recent = bytearray(capture.read())
            if b"for commands" in recent and "❯".encode("utf-8") in recent:
                break
            time.sleep(0.1)
        else:
            raise RunnerError("OMP TUI readiness timeout")

        written = os.write(master_fd, submission)
        require(written == len(submission), "exact prompt write")
        submitted = True
        input_receipt = {
            "schema_id": "pm.r10.storage_pipeline.input_write.v2",
            **{field: planned[field] for field in ("pass_id", "route_id", "ordinal", "attempt_id", "nonce")},
            "pid": process.pid,
            "submitted_at_utc": utc_now(),
            "path": "stdin_submission.raw",
            "bytes": len(submission),
            "sha256": pipeline.sha256_bytes(submission),
            "write_return_bytes": written,
            "submission_count": 1,
            "terminator_hex": "0d",
        }
        atomic_json(row_dir / "input_write.json", input_receipt)
        print(pipeline.canonical_json({"status": "SUBMITTED_ONCE", "bytes": written}), flush=True)

        stable_hash: str | None = None
        stable_since = 0.0
        pre_exit_projection: dict[str, Any] | None = None
        while time.monotonic() < deadline:
            transcript_bytes, _ = read_available(master_fd, output, transcript_bytes)
            if process.poll() is not None:
                raise RunnerError("OMP exited before verified terminal result")
            source_session = session_file(session_dir)
            if source_session is not None:
                try:
                    projection = omp_session.verify_session(
                        source_session,
                        expected_cwd=str(cwd),
                        expected_objective=objective,
                        expected_provider=route["model"].split("/", 1)[0],
                        expected_model=route["model"].split("/", 1)[1],
                        expected_selector=route["model"],
                        expected_thinking=route["thinking"],
                        require_exit=False,
                    )
                    exact_result(projection["final_text"])
                    digest = pipeline.sha256_file(source_session)
                    if digest != stable_hash:
                        stable_hash = digest
                        stable_since = time.monotonic()
                    elif time.monotonic() - stable_since >= SESSION_STABILITY_SECONDS:
                        pre_exit_projection = projection
                        break
                except (omp_session.OmpSessionError, RunnerError, OSError, ValueError, KeyError, TypeError):
                    stable_hash = None
                    stable_since = 0.0
            time.sleep(0.2)
        else:
            raise RunnerError("row time budget expired before exact Goal terminal result")
        require(pre_exit_projection is not None, "pre-exit session projection")

        control = b"\x04"
        pipeline.atomic_write(row_dir / "control.raw", control)
        written_control = os.write(master_fd, control)
        require(written_control == 1, "one Ctrl-D write")
        control_sent = True
        print(pipeline.canonical_json({"status": "TERMINAL_RESULT_STABLE", "control": "CTRL_D_ONCE"}), flush=True)
        exit_deadline = time.monotonic() + POST_RESULT_EXIT_SECONDS
        while time.monotonic() < exit_deadline and process.poll() is None:
            transcript_bytes, _ = read_available(master_fd, output, transcript_bytes)
            time.sleep(0.1)
        if process.poll() is None:
            raise RunnerError("OMP did not exit after terminal Ctrl-D")
        transcript_bytes, _ = read_available(master_fd, output, transcript_bytes)
        require(process.returncode == 0, "OMP process exit code")
    except BaseException as exc:
        if process is not None:
            try:
                terminate_process(process)
            except BaseException:
                pass
            raise PostPopenRunnerError(process.pid, exc) from exc
        raise
    finally:
        if slave_fd >= 0:
            try:
                os.close(slave_fd)
            except OSError:
                pass
        try:
            os.close(master_fd)
        except OSError:
            pass
        if output is not None:
            try:
                output.flush()
                os.fsync(output.fileno())
                output.close()
            except BaseException as cleanup_exc:
                try:
                    output.close()
                except BaseException:
                    pass
                if process is not None:
                    raise PostPopenRunnerError(process.pid, cleanup_exc) from cleanup_exc
                raise

    require(process is not None and process.returncode == 0, "OMP clean process")
    source_session = session_file(session_dir)
    require(source_session is not None, "one OMP persisted session")
    pipeline.atomic_write(row_dir / "session.raw.jsonl", source_session.read_bytes())
    projection = omp_session.verify_session(
        row_dir / "session.raw.jsonl",
        expected_cwd=str(cwd),
        expected_objective=objective,
        expected_provider=route["model"].split("/", 1)[0],
        expected_model=route["model"].split("/", 1)[1],
        expected_selector=route["model"],
        expected_thinking=route["thinking"],
        require_exit=True,
    )
    exact_result(projection["final_text"])
    require(not any(cwd.iterdir()), "empty cwd after launch")

    rendered = strip_terminal((row_dir / "transcript.raw").read_bytes())
    visual = {
        "goal_activation": "🎯 Goal".encode("utf-8") in rendered,
        "goal_complete": b"Goal: complete" in rendered,
        "pm_result_marker": b"PM_RESULT" in rendered,
    }
    require(all(visual.values()), "TUI Goal/result corroboration")
    evidence_paths = [
        row_dir / "reservation.json",
        row_dir / "omp_preflight.json",
        row_dir / "launch.json",
        row_dir / "stdin_submission.raw",
        row_dir / "input_write.json",
        row_dir / "transcript.raw",
        row_dir / "control.raw",
        row_dir / "session.raw.jsonl",
    ]
    terminal = {
        "schema_id": "pm.r10.storage_pipeline.terminal.v2",
        **{field: planned[field] for field in ("pass_id", "route_id", "ordinal", "attempt_id", "nonce")},
        "surface": route["surface"],
        "model": route["model"],
        "thinking": route["thinking"],
        "status": "PASS",
        "failure_code": None,
        "goal_activation_observed": True,
        "goal_complete_observed": True,
        "final_assistant_text": projection["final_text"],
        "observed_non_goal_tool_calls": projection["ordinary_tool_calls"],
        "no_retry": True,
        "cwd_entries_after": 0,
        "process_exit_code": process.returncode,
        "qualification_credit": 0,
        "observed_identity": projection["session_id"],
        "session_projection": {key: value for key, value in projection.items() if key != "final_text"},
        "tui_corroboration": visual,
        "submitted_once": submitted,
        "terminal_control_sent_once": control_sent,
        "finished_at_utc": utc_now(),
        "evidence": [file_record(path, row_dir) for path in evidence_paths],
    }
    atomic_json(row_dir / "terminal.json", terminal)
    return terminal


def record_failure(pass_id: str, route_id: str, exc: BaseException) -> None:
    try:
        planned = planned_row(pass_id, route_id)
        route = route_map()[route_id]
        row_dir = EVIDENCE / pass_id / route_id
        if not row_dir.is_dir() or os.path.lexists(row_dir / "terminal.json"):
            return
        launch_path = row_dir / "launch.json"
        launch = pipeline.load_json(launch_path) if launch_path.is_file() else {}
        popen_observed = launch_path.is_file() or isinstance(exc, PostPopenRunnerError)
        observed_pid = launch.get("pid")
        if isinstance(exc, PostPopenRunnerError):
            observed_pid = exc.pid
        failure = {
            "schema_id": "pm.r10.storage_pipeline.runner_failure.v2",
            **{field: planned[field] for field in ("pass_id", "route_id", "ordinal", "attempt_id", "nonce")},
            "error": f"{type(exc).__name__}: {exc}",
            "popen_observed": popen_observed,
            "pid": observed_pid,
            "captured_at_utc": utc_now(),
            "qualification_credit": 0,
            "no_retry": True,
        }
        atomic_json(row_dir / "runner_failure.json", failure)
        evidence_paths = sorted(
            path
            for path in row_dir.iterdir()
            if path.is_file() and not path.is_symlink() and path.name != "terminal.json"
        )
        cwd = Path(planned["cwd"])
        terminal = {
            "schema_id": "pm.r10.storage_pipeline.terminal.v2",
            **{field: planned[field] for field in ("pass_id", "route_id", "ordinal", "attempt_id", "nonce")},
            "surface": route["surface"],
            "model": route["model"],
            "thinking": route["thinking"],
            "status": "FAIL",
            "failure_code": "RUNNER_OR_EVIDENCE_FAILURE",
            "goal_activation_observed": False,
            "goal_complete_observed": False,
            "final_assistant_text": "",
            "observed_non_goal_tool_calls": None,
            "no_retry": True,
            "cwd_entries_after": len(list(cwd.iterdir())) if cwd.is_dir() else None,
            "process_exit_code": None,
            "qualification_credit": 0,
            "observed_identity": None,
            "finished_at_utc": utc_now(),
            "evidence": [file_record(path, row_dir) for path in evidence_paths],
        }
        atomic_json(row_dir / "terminal.json", terminal)
    except BaseException as record_exc:
        print(
            pipeline.canonical_json(
                {
                    "status": "FAILURE_RECEIPT_LOST",
                    "original_error": f"{type(exc).__name__}: {exc}",
                    "receipt_error": f"{type(record_exc).__name__}: {record_exc}",
                    "qualification_credit": 0,
                }
            ),
            flush=True,
        )


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("pass_id", choices=("pass_01", "pass_02"))
    parser.add_argument("route_id")
    parser.add_argument("--max-seconds", type=int, default=3600)
    args = parser.parse_args()
    if args.max_seconds < 600 or args.max_seconds > 7200:
        print(pipeline.canonical_json({"status": "FAIL_PRELAUNCH", "error": "max-seconds outside 600..7200", "qualification_credit": 0}))
        return 1
    try:
        result = run_row(args.pass_id, args.route_id, args.max_seconds)
        print(pipeline.canonical_json({"status": "PASS_CAPTURED", "terminal": result, "qualification_credit": 0}))
        return 0
    except ReservationConflict as exc:
        print(
            pipeline.canonical_json(
                {
                    "status": "FAIL_ALREADY_CONSUMED_NO_MUTATION",
                    "error": f"{type(exc).__name__}: {exc}",
                    "qualification_credit": 0,
                }
            )
        )
        return 1
    except (
        RunnerError,
        omp_session.OmpSessionError,
        pipeline.PipelineError,
        subprocess.SubprocessError,
        OSError,
        ValueError,
        KeyError,
        TypeError,
        AssertionError,
    ) as exc:
        record_failure(args.pass_id, args.route_id, exc)
        print(pipeline.canonical_json({"status": "FAIL_CONSUMED_ZERO_CREDIT_NO_RETRY", "error": f"{type(exc).__name__}: {exc}", "qualification_credit": 0}))
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
