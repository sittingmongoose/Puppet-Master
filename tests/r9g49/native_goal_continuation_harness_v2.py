#!/usr/bin/env python3
"""Native `/goal` harness that waits through bounded automatic continuations."""

from __future__ import annotations

import argparse
import gzip
import hashlib
import importlib.util
import json
import os
import re
import secrets
import shlex
import stat
import subprocess
import sys
import tempfile
import time
from pathlib import Path

SCHEMA = "pw-r9-native-goal-continuation-harness-v2"
REPO = Path("/mnt/Cursor/PuppetMaster")
BASE_DIR = REPO / "tests/r9g48"
BASE_HARNESS = BASE_DIR / "native_goal_slash_harness_v1.py"
BASE_HARNESS_ID = {
    "bytes": 44090,
    "mode": "0644",
    "path": "tests/r9g48/native_goal_slash_harness_v1.py",
    "sha256": "a0a898f2cd64b63db2a2dd75a5adc524a64477cf2445f085dd49bdec7a55558a",
}
CODEX_REAL = Path(
    "/home/sittingmongoose/.codex/packages/standalone/releases/"
    "0.148.0-x86_64-unknown-linux-musl/bin/codex"
)
RUNTIME_ID = {
    "bytes": 251271488,
    "mode": "0755",
    "path": str(CODEX_REAL),
    "sha256": "ac2cfed85fb647d61e0150b8548102b330e4799d9d81ad5d354de701edf6b074",
    "version": "codex-cli 0.148.0",
}
MAX_GOAL_TURNS = 3


def sha256(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def read_source(path: Path, label: str, mode: int = 0o644) -> bytes:
    before = path.lstat()
    if path.resolve(strict=True) != path or not stat.S_ISREG(before.st_mode):
        raise RuntimeError(f"type:{label}")
    if stat.S_IMODE(before.st_mode) != mode:
        raise RuntimeError(f"mode:{label}")
    fd = os.open(path, os.O_RDONLY | getattr(os, "O_NOFOLLOW", 0))
    try:
        opened = os.fstat(fd)
        if (opened.st_dev, opened.st_ino) != (before.st_dev, before.st_ino):
            raise RuntimeError(f"race:{label}")
        chunks = []
        while True:
            chunk = os.read(fd, 1024 * 1024)
            if not chunk:
                break
            chunks.append(chunk)
    finally:
        os.close(fd)
    after = path.lstat()
    if (after.st_dev, after.st_ino, after.st_size, after.st_mtime_ns) != (
        before.st_dev,
        before.st_ino,
        before.st_size,
        before.st_mtime_ns,
    ):
        raise RuntimeError(f"drift:{label}")
    return b"".join(chunks)


_base_raw = read_source(BASE_HARNESS, "base-harness")
if (
    len(_base_raw) != BASE_HARNESS_ID["bytes"]
    or sha256(_base_raw) != BASE_HARNESS_ID["sha256"]
):
    raise RuntimeError("base-harness-identity")
_spec = importlib.util.spec_from_file_location("r9g48_native_goal_base_v1", BASE_HARNESS)
if _spec is None or _spec.loader is None:
    raise RuntimeError("base-harness-import")
base = importlib.util.module_from_spec(_spec)
sys.modules[_spec.name] = base
_spec.loader.exec_module(base)
base.CODEX = CODEX_REAL

Invalid = base.Invalid
fail = base.fail
canonical = base.canonical
canonical_no_lf = base.canonical_no_lf
parse_json = base.parse_json
read_regular = base.read_regular
write_exact = base.write_exact
make_dir = base.make_dir
load_manifest = base.load_manifest
load_schedule = base.load_schedule
materialize_payload = base.materialize_payload
build_capsule = base.build_capsule
execution_id = base.execution_id
goal_objective = base.goal_objective
validate_result = base.validate_result
check_static_base = base.check_static
ROUTES = base.ROUTES
PROMPT_MAX = base.PROMPT_MAX
RESULT_MAX = base.RESULT_MAX
UUID_RE = base.UUID_RE


def runtime_check() -> None:
    raw = read_source(CODEX_REAL, "codex-runtime", 0o755)
    if len(raw) != RUNTIME_ID["bytes"] or sha256(raw) != RUNTIME_ID["sha256"]:
        fail("codex-runtime-identity")
    process = subprocess.run(
        [str(CODEX_REAL), "--version"],
        cwd=REPO,
        stdin=subprocess.DEVNULL,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        timeout=10,
        check=False,
    )
    if (
        process.returncode != 0
        or process.stderr
        or process.stdout != (RUNTIME_ID["version"] + "\n").encode("utf-8")
    ):
        fail("codex-runtime-version")


def verify_trace(
    rows: list[dict[str, object]],
    expected_cwd: Path,
    objective: str,
    model: str,
    effort: str,
    expected_result: str | None,
    terminal_goal: dict[str, object],
) -> dict[str, object]:
    if not rows or rows[0].get("type") != "session_meta":
        fail("session-meta")
    meta = rows[0].get("payload")
    if not isinstance(meta, dict):
        fail("session-meta-payload")
    session_id = meta.get("id")
    if (
        not isinstance(session_id, str)
        or not UUID_RE.fullmatch(session_id)
        or meta.get("session_id") != session_id
        or meta.get("cwd") != str(expected_cwd)
        or meta.get("originator") != "codex-tui"
        or meta.get("source") != "cli"
        or meta.get("cli_version") != "0.148.0"
        or meta.get("model_provider") != "openai"
        or meta.get("thread_source") != "user"
    ):
        fail("session-meta-fixed")
    active = []
    starts = []
    completes = []
    contexts = []
    assistant_messages = []
    calls = []
    outputs = {}
    developer_text = ""
    for row in rows:
        ordinal = row["ordinal"]
        payload = row.get("payload")
        if not isinstance(payload, dict):
            continue
        row_type = row.get("type")
        if row_type == "event_msg" and payload.get("type") == "thread_goal_updated":
            goal = payload.get("goal")
            if isinstance(goal, dict) and goal.get("status") == "active":
                active.append((ordinal, goal))
        elif row_type == "event_msg" and payload.get("type") == "task_started":
            starts.append((ordinal, payload.get("turn_id")))
        elif row_type == "event_msg" and payload.get("type") == "task_complete":
            completes.append((ordinal, payload.get("turn_id")))
        elif row_type == "turn_context":
            contexts.append((ordinal, payload))
        elif row_type == "response_item" and payload.get("type") in {
            "function_call",
            "custom_tool_call",
        }:
            calls.append((ordinal, payload))
        elif row_type == "response_item" and payload.get("type") in {
            "function_call_output",
            "custom_tool_call_output",
        }:
            call_id = payload.get("call_id")
            if not isinstance(call_id, str) or call_id in outputs:
                fail("tool-output-id")
            outputs[call_id] = (ordinal, payload)
        elif (
            row_type == "response_item"
            and payload.get("type") == "message"
            and payload.get("role") == "assistant"
        ):
            assistant_messages.append(
                (
                    ordinal,
                    payload.get("phase"),
                    base.content_text(payload.get("content"), {"output_text"}),
                )
            )
        elif (
            row_type == "response_item"
            and payload.get("type") == "message"
            and payload.get("role") == "developer"
        ):
            developer_text += base.content_text(payload.get("content"), {"input_text"})
    if len(active) != 1 or not starts or active[0][0] >= starts[0][0]:
        fail("goal-active-order")
    goal = active[0][1]
    if goal.get("threadId") != session_id or goal.get("objective") != objective:
        fail("goal-active-identity")
    if not 1 <= len(starts) <= MAX_GOAL_TURNS or len(completes) != len(starts):
        fail("goal-turn-cardinality")
    if len(contexts) != len(starts):
        fail("turn-context-count")
    for index, ((start_ordinal, start_id), (complete_ordinal, complete_id)) in enumerate(
        zip(starts, completes)
    ):
        context_ordinal, context = contexts[index]
        if (
            not isinstance(start_id, str)
            or start_id != complete_id
            or not start_ordinal < context_ordinal < complete_ordinal
            or context.get("model") != model
            or context.get("effort") != effort
            or context.get("cwd") != str(expected_cwd)
            or context.get("sandbox_policy") != {"type": "read-only"}
        ):
            fail("turn-context-fixed")
        if index and completes[index - 1][0] >= start_ordinal:
            fail("goal-turn-order")
    if "r9-goal-" in developer_text or "/mnt/Cursor/PuppetMaster/.agents/skills/" in developer_text:
        fail("project-goal-skill-visible")
    if len(calls) != 1 or len(outputs) != 1:
        fail(f"model-tool-call-count:{len(calls)}")
    call_ordinal, call = calls[0]
    call_id = call.get("call_id")
    if not isinstance(call_id, str) or call_id not in outputs:
        fail("completion-call-output")
    direct = call.get("type") == "function_call"
    if direct:
        if call.get("name") != "update_goal" or call.get("arguments") != '{"status":"complete"}':
            fail("direct-completion-call")
    else:
        source = call.get("input")
        if call.get("name") != "exec" or not isinstance(source, str):
            fail("nested-completion-call")
        compact = re.sub(r"\s+", "", source)
        if compact not in {
            'constr=awaittools.update_goal({status:"complete"});text(r)',
            'constr=awaittools.update_goal({status:"complete"});text(r);',
            'constr=awaittools.update_goal({status:"complete"});text("")',
            'constr=awaittools.update_goal({status:"complete"});text("");',
        }:
            fail("nested-completion-source")
    output_ordinal, output = outputs[call_id]
    if output_ordinal <= call_ordinal:
        fail("completion-output-order")
    if direct:
        completion = base.completion_from_output(output, True)
        embedded_goal = completion.get("goal")
        if (
            not isinstance(embedded_goal, dict)
            or embedded_goal.get("threadId") != session_id
            or embedded_goal.get("objective") != objective
            or embedded_goal.get("status") != "complete"
        ):
            fail("goal-tool-receipt-identity")
    if (
        not isinstance(terminal_goal, dict)
        or terminal_goal.get("threadId") != session_id
        or terminal_goal.get("objective") != objective
        or terminal_goal.get("status") != "complete"
    ):
        fail("goal-completion-identity")
    if len(assistant_messages) != len(starts) or any(
        phase != "final_answer" for _ordinal, phase, _text in assistant_messages
    ):
        fail("assistant-message-cardinality")
    finals = []
    for index, (start, complete) in enumerate(zip(starts, completes)):
        within = [
            (ordinal, text)
            for ordinal, _phase, text in assistant_messages
            if start[0] < ordinal < complete[0]
        ]
        if len(within) != 1:
            fail("turn-final-cardinality")
        finals.append(within[0])
    result = finals[0][1]
    if any(text not in {"", result} for _ordinal, text in finals[1:]):
        fail("continuation-result-drift")
    if not starts[-1][0] < call_ordinal < output_ordinal < finals[-1][0] < completes[-1][0]:
        fail("completion-terminal-order")
    if expected_result is not None and result != expected_result:
        fail("probe-result")
    if any(
        row.get("type") == "event_msg"
        and isinstance(row.get("payload"), dict)
        and row["payload"].get("type") in {"turn_aborted", "task_aborted"}
        for row in rows
    ):
        fail("abort-event")
    return {
        "active_goal_ordinal": active[0][0],
        "completion_call_ordinal": call_ordinal,
        "completion_final_ordinal": finals[-1][0],
        "completion_output_ordinal": output_ordinal,
        "completion_representation": (
            "DIRECT_FUNCTION_CALL" if direct else "NESTED_FUNCTIONS_EXEC"
        ),
        "completion_tool_receipt_preserved": direct,
        "final_ordinals": [ordinal for ordinal, _text in finals],
        "goal_receipt": terminal_goal,
        "result_final_ordinal": finals[0][0],
        "result_utf8": result,
        "session_id": session_id,
        "task_complete_ordinals": [ordinal for ordinal, _turn in completes],
        "task_started_ordinals": [ordinal for ordinal, _turn in starts],
        "task_turn_count": len(starts),
    }


def launch_goal(
    objective: str,
    model: str,
    effort: str,
    expected_result: str | None,
    timeout_seconds: int,
) -> dict[str, object]:
    before = base.session_files()
    temp_text = tempfile.mkdtemp(prefix="r9g49-native-goal-")
    cwd = Path(temp_text).resolve(strict=True)
    os.chmod(cwd, 0o700)
    args = [
        "--no-alt-screen",
        "--strict-config",
        "-C",
        str(cwd),
        "--sandbox",
        "read-only",
        "--ask-for-approval",
        "never",
        "--model",
        model,
        "-c",
        f'model_reasoning_effort="{effort}"',
        "-c",
        "suppress_unstable_features_warning=true",
        "-c",
        "notice.model_migrations={}",
    ]
    tmux_name = f"r9g49-{secrets.token_hex(8)}"
    shell_command = shlex.join(
        ["env", "PYTHONDONTWRITEBYTECODE=1", str(CODEX_REAL), *args]
    )

    def tmux_call(arguments: list[str], timeout: int = 10):
        return subprocess.run(
            ["tmux", *arguments],
            check=False,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            timeout=timeout,
        )

    def capture() -> str:
        value = tmux_call(["capture-pane", "-p", "-t", tmux_name, "-S", "-2000"])
        return value.stdout if value.returncode == 0 else ""

    def pane_value(format_string: str) -> str | None:
        value = tmux_call(["display-message", "-p", "-t", tmux_name, format_string])
        return value.stdout.strip() if value.returncode == 0 else None

    start = tmux_call(
        [
            "new-session",
            "-d",
            "-s",
            tmux_name,
            "-x",
            "120",
            "-y",
            "40",
            "-c",
            str(cwd),
            shell_command,
        ]
    )
    if start.returncode != 0:
        fail(f"tmux-start:{start.stderr.strip()}")
    retained = tmux_call(["set-option", "-w", "-t", tmux_name, "remain-on-exit", "on"])
    if retained.returncode != 0:
        tmux_call(["kill-session", "-t", tmux_name])
        fail("tmux-remain-on-exit")
    screen = ""
    trace = None
    terminal_goal = None
    observed_completes = 0
    loop_error = None
    started = time.monotonic()
    try:
        trust_sent = False
        while time.monotonic() - started < 30:
            screen = capture()
            if "Do you trust the contents of this directory?" in screen and not trust_sent:
                accepted = tmux_call(["send-keys", "-t", tmux_name, "Enter"])
                if accepted.returncode != 0:
                    fail("tmux-trust-enter")
                trust_sent = True
                time.sleep(0.1)
                continue
            if f"model:     {model} {effort}" in screen and re.search(r"(?:^|\n)›\s", screen):
                break
            if pane_value("#{pane_dead}") == "1":
                fail("tui-exited-before-ready")
            time.sleep(0.1)
        else:
            fail("tui-ready-timeout")
        typed = tmux_call(["send-keys", "-t", tmux_name, "-l", f"/goal {objective}"])
        entered = tmux_call(["send-keys", "-t", tmux_name, "Enter"])
        if typed.returncode != 0 or entered.returncode != 0:
            fail("tmux-send-keys")
        submit_deadline = time.monotonic() + 1
        while time.monotonic() < submit_deadline:
            trace = base.trace_for_cwd(base.session_files() - before, cwd)
            if trace is not None:
                break
            time.sleep(0.1)
        if trace is None:
            screen = capture()
            if f"› /goal x={objective.split(';', 1)[0].split('=', 1)[1]}" not in screen:
                fail("slash-goal-not-buffered-after-first-enter")
            submitted = tmux_call(["send-keys", "-t", tmux_name, "Enter"])
            if submitted.returncode != 0:
                fail("tmux-submit-enter")
        while time.monotonic() - started < timeout_seconds:
            screen = capture()
            if "Use existing model" in screen or "Switch to GPT" in screen:
                loop_error = "model-migration-interstitial"
                break
            if trace is None:
                trace = base.trace_for_cwd(base.session_files() - before, cwd)
            if trace is not None:
                try:
                    _raw, rows = base.read_trace_rows(trace)
                except Invalid as exc:
                    if str(exc) == "trace-terminal-lf":
                        time.sleep(0.1)
                        continue
                    raise
                starts = sum(
                    row.get("type") == "event_msg"
                    and isinstance(row.get("payload"), dict)
                    and row["payload"].get("type") == "task_started"
                    for row in rows
                )
                completes = sum(
                    row.get("type") == "event_msg"
                    and isinstance(row.get("payload"), dict)
                    and row["payload"].get("type") == "task_complete"
                    for row in rows
                )
                if starts > MAX_GOAL_TURNS:
                    loop_error = "goal-turn-limit"
                    break
                if completes > observed_completes:
                    meta = rows[0].get("payload")
                    if not isinstance(meta, dict) or not isinstance(meta.get("id"), str):
                        loop_error = "goal-get-session-meta"
                        break
                    terminal_goal = base.terminal_goal_get(meta["id"])
                    observed_completes = completes
                    if terminal_goal.get("status") in {"complete", "blocked", "paused"}:
                        break
            if pane_value("#{pane_dead}") == "1":
                loop_error = "tui-early-exit"
                break
            time.sleep(0.25)
        else:
            loop_error = "goal-terminal-timeout"
        if trace is None:
            trace = base.trace_for_cwd(base.session_files() - before, cwd)
        if trace is None:
            fail("trace-not-found")
        tmux_call(["send-keys", "-t", tmux_name, "C-c"])
        exit_deadline = time.monotonic() + 5
        while time.monotonic() < exit_deadline and pane_value("#{pane_dead}") != "1":
            time.sleep(0.1)
        process_exit = pane_value("#{pane_dead_status}")
        process_signal = pane_value("#{pane_dead_signal}")
        raw_trace, rows = base.read_trace_rows(trace)
        meta = rows[0].get("payload")
        if not isinstance(meta, dict) or not isinstance(meta.get("id"), str):
            fail("goal-get-session-meta")
        terminal_goal = base.terminal_goal_get(meta["id"])
        try:
            verified = verify_trace(
                rows,
                cwd,
                objective,
                model,
                effort,
                expected_result,
                terminal_goal,
            )
            verification_error = loop_error
        except Invalid as exc:
            verified = {"terminal_goal_receipt": terminal_goal}
            verification_error = loop_error or str(exc)
        screen = capture() or screen
        tui = screen.encode("utf-8", errors="replace")
        verified.update(
            {
                "cwd": str(cwd),
                "process_exit_status": (
                    int(process_exit) if process_exit and process_exit.isdigit() else None
                ),
                "process_signal_status": (
                    int(process_signal) if process_signal and process_signal.isdigit() else None
                ),
                "trace_bytes": len(raw_trace),
                "trace_path": str(trace),
                "trace_sha256": sha256(raw_trace),
                "trace_raw": raw_trace,
                "tui_bytes": len(tui),
                "tui_sha256": sha256(tui),
                "tui_raw": tui,
                "verification_error": verification_error,
            }
        )
        return verified
    finally:
        tmux_call(["kill-session", "-t", tmux_name])
        try:
            cwd.rmdir()
        except OSError:
            pass


def self_identity() -> dict[str, object]:
    path = Path(__file__).resolve(strict=True)
    raw = read_source(path, "self")
    return {
        "bytes": len(raw),
        "mode": "0644",
        "path": str(path.relative_to(REPO)),
        "sha256": sha256(raw),
    }


def check_static() -> dict[str, object]:
    runtime_check()
    base_check = check_static_base()
    return {
        "authority": False,
        "base_harness": BASE_HARNESS_ID,
        "base_status": base_check["status"],
        "first_mismatch": None,
        "harness": self_identity(),
        "matrix_launch": False,
        "max_goal_turns": MAX_GOAL_TURNS,
        "qualification_credit": 0,
        "runtime": RUNTIME_ID,
        "schema_id": SCHEMA,
        "status": "PASS_STATIC_CONTINUATION_HARNESS_ZERO_CREDIT_NO_LAUNCH_AUTHORITY",
        "subject_calls": 0,
        "workspace_writes": 0,
    }


def run_continuation_probe(output_root: Path, timeout_seconds: int) -> dict[str, object]:
    runtime_check()
    if output_root.exists() or output_root.resolve(strict=False) != output_root:
        fail("probe-output-root")
    make_dir(output_root)
    objective = (
        "x=continuation-canary-v2; First turn: answer Q without tools. "
        "On the next automatic Goal turn: complete Goal with update_goal and answer Q."
    )
    result = launch_goal(objective, "gpt-5.4-mini", "xhigh", None, timeout_seconds)
    trace_raw = result.pop("trace_raw")
    tui_raw = result.pop("tui_raw")
    trace_gzip = gzip.compress(trace_raw, compresslevel=9, mtime=0)
    tui_gzip = gzip.compress(tui_raw, compresslevel=9, mtime=0)
    write_exact(output_root / "rollout.jsonl.gz", trace_gzip)
    write_exact(output_root / "tui.txt.gz", tui_gzip)
    passed = (
        result.get("verification_error") is None
        and result.get("result_utf8") == "Q"
        and result.get("task_turn_count") == 2
    )
    first_mismatch = None if passed else result.get("verification_error") or "probe-contract"
    receipt = {
        "authority": False,
        "expected_result_utf8": "Q",
        "first_mismatch": first_mismatch,
        "goal_command_bytes": len(("/goal " + objective).encode("utf-8")),
        "goal_objective": objective,
        "harness": self_identity(),
        "model_requested": "gpt-5.4-mini",
        "qualification_credit": 0,
        "reasoning_effort_requested": "xhigh",
        "schema_id": SCHEMA,
        "status": (
            "PASS_CONTINUATION_PROBE_ONLY_ZERO_CREDIT_NO_MATRIX_AUTHORITY"
            if passed
            else "FAIL_CONTINUATION_PROBE_CONSUMED_ZERO_CREDIT_NO_RETRY"
        ),
        "trace_copy": {
            "bytes": len(trace_gzip),
            "raw_bytes": len(trace_raw),
            "raw_sha256": sha256(trace_raw),
            "sha256": sha256(trace_gzip),
        },
        "tui_copy": {
            "bytes": len(tui_gzip),
            "raw_bytes": len(tui_raw),
            "raw_sha256": sha256(tui_raw),
            "sha256": sha256(tui_gzip),
        },
        "verification": result,
    }
    receipt_path = output_root / ("receipt.json" if passed else "failure.json")
    write_exact(receipt_path, canonical(receipt))
    return {
        "artifact": {
            "bytes": receipt_path.stat().st_size,
            "sha256": sha256(read_source(receipt_path.resolve(strict=True), "probe-receipt")),
        },
        "authority": False,
        "first_mismatch": first_mismatch,
        "qualification_credit": 0,
        "schema_id": SCHEMA,
        "status": receipt["status"],
    }


def parser() -> argparse.ArgumentParser:
    result = argparse.ArgumentParser(add_help=False)
    sub = result.add_subparsers(dest="command", required=True)
    check = sub.add_parser("check", add_help=False)
    check.add_argument("--check", action="store_true")
    probe = sub.add_parser("probe-continuation", add_help=False)
    probe.add_argument("--output-root", required=True)
    probe.add_argument("--timeout-seconds", type=int, default=180)
    return result


def main() -> int:
    try:
        args, extra = parser().parse_known_args()
        if extra:
            fail("CLI-extra")
        if args.command == "check":
            if not args.check:
                fail("CLI-check")
            output = check_static()
        else:
            if args.timeout_seconds != 180:
                fail("probe-timeout")
            output = run_continuation_probe(
                Path(args.output_root).resolve(strict=False), args.timeout_seconds
            )
        code = 0 if output.get("first_mismatch") is None else 1
    except (Invalid, OSError, RuntimeError, ValueError, TypeError, KeyError, subprocess.SubprocessError) as exc:
        output = {
            "authority": False,
            "first_mismatch": str(exc),
            "qualification_credit": 0,
            "schema_id": SCHEMA,
            "status": "FAIL_ZERO_CREDIT_NO_LAUNCH_AUTHORITY",
        }
        code = 1
    sys.stdout.buffer.write(canonical(output))
    return code


if __name__ == "__main__":
    raise SystemExit(main())
