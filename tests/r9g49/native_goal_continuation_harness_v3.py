#!/usr/bin/env python3
"""Continuation-aware native `/goal` harness with first-final scoring."""

from __future__ import annotations

import argparse
import gzip
import hashlib
import importlib.util
import json
import os
import re
import stat
import subprocess
import sys
from pathlib import Path

SCHEMA = "pw-r9-native-goal-continuation-harness-v3"
REPO = Path("/mnt/Cursor/PuppetMaster")
V2_PATH = REPO / "tests/r9g49/native_goal_continuation_harness_v2.py"
V2_ID = {
    "bytes": 25416,
    "mode": "0644",
    "path": "tests/r9g49/native_goal_continuation_harness_v2.py",
    "sha256": "4ad331e6bc46524351ebdbc4838e71e05a2dff762c7eea19950e7874829d56ba",
}


def sha256(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def read_source(path: Path, label: str) -> bytes:
    before = path.lstat()
    if (
        path.resolve(strict=True) != path
        or not stat.S_ISREG(before.st_mode)
        or stat.S_IMODE(before.st_mode) != 0o644
    ):
        raise RuntimeError(f"custody:{label}")
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


_v2_raw = read_source(V2_PATH, "v2")
if len(_v2_raw) != V2_ID["bytes"] or sha256(_v2_raw) != V2_ID["sha256"]:
    raise RuntimeError("v2-identity")
_spec = importlib.util.spec_from_file_location("r9g49_continuation_v2", V2_PATH)
if _spec is None or _spec.loader is None:
    raise RuntimeError("v2-import")
v2 = importlib.util.module_from_spec(_spec)
sys.modules[_spec.name] = v2
_spec.loader.exec_module(v2)
base = v2.base
Invalid = base.Invalid
fail = base.fail
canonical = base.canonical
canonical_no_lf = base.canonical_no_lf
write_exact = base.write_exact
make_dir = base.make_dir
ROUTES = base.ROUTES
RUNTIME_ID = v2.RUNTIME_ID
MAX_GOAL_TURNS = v2.MAX_GOAL_TURNS


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
        or not base.UUID_RE.fullmatch(session_id)
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
            phase = payload.get("phase")
            text = base.content_text(payload.get("content"), {"output_text"})
            assistant_messages.append((ordinal, phase, text))
        elif (
            row_type == "response_item"
            and payload.get("type") == "message"
            and payload.get("role") == "developer"
        ):
            developer_text += base.content_text(payload.get("content"), {"input_text"})
    if len(active) != 1 or not starts or active[0][0] >= starts[0][0]:
        fail("goal-active-order")
    if (
        active[0][1].get("threadId") != session_id
        or active[0][1].get("objective") != objective
    ):
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
    if any(phase not in {"commentary", "final_answer"} for _ordinal, phase, _text in assistant_messages):
        fail("assistant-message-phase")
    commentary = [
        (ordinal, text)
        for ordinal, phase, text in assistant_messages
        if phase == "commentary"
    ]
    if len(commentary) > 2 * len(starts) or any(
        not 1 <= len(text.encode("utf-8")) <= 512 for _ordinal, text in commentary
    ):
        fail("commentary-bound")
    finals = []
    for start, complete in zip(starts, completes):
        within = [
            (ordinal, text)
            for ordinal, phase, text in assistant_messages
            if phase == "final_answer" and start[0] < ordinal < complete[0]
        ]
        if len(within) != 1:
            fail("turn-final-cardinality")
        finals.append(within[0])
    result = finals[0][1]
    if not 1 <= len(result.encode("utf-8")) <= base.RESULT_MAX:
        fail("result-byte-bound")
    if any(not 1 <= len(text.encode("utf-8")) <= 512 for _ordinal, text in finals[1:]):
        fail("continuation-final-bound")
    if expected_result is not None and result != expected_result:
        fail("probe-result")
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
        compact = re.sub(r"\s+", "", source) if isinstance(source, str) else None
        if call.get("name") != "exec" or compact not in {
            'constr=awaittools.update_goal({status:"complete"});text(r)',
            'constr=awaittools.update_goal({status:"complete"});text(r);',
            'constr=awaittools.update_goal({status:"complete"});text("")',
            'constr=awaittools.update_goal({status:"complete"});text("");',
        }:
            fail("nested-completion-call")
    output_ordinal, output = outputs[call_id]
    if not starts[-1][0] < call_ordinal < output_ordinal < finals[-1][0] < completes[-1][0]:
        fail("completion-terminal-order")
    if direct:
        embedded_goal = base.completion_from_output(output, True).get("goal")
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
    if any(
        row.get("type") == "event_msg"
        and isinstance(row.get("payload"), dict)
        and row["payload"].get("type") in {"turn_aborted", "task_aborted"}
        for row in rows
    ):
        fail("abort-event")
    commentary_projection = [
        {"ordinal": ordinal, "sha256": sha256(text.encode("utf-8"))}
        for ordinal, text in commentary
    ]
    continuation_finals = [
        {"bytes": len(text.encode("utf-8")), "ordinal": ordinal, "sha256": sha256(text.encode("utf-8"))}
        for ordinal, text in finals[1:]
    ]
    return {
        "active_goal_ordinal": active[0][0],
        "commentary": commentary_projection,
        "completion_call_ordinal": call_ordinal,
        "completion_final_ordinal": finals[-1][0],
        "completion_output_ordinal": output_ordinal,
        "completion_representation": (
            "DIRECT_FUNCTION_CALL" if direct else "NESTED_FUNCTIONS_EXEC"
        ),
        "completion_tool_receipt_preserved": direct,
        "continuation_finals": continuation_finals,
        "goal_receipt": terminal_goal,
        "result_final_ordinal": finals[0][0],
        "result_utf8": result,
        "session_id": session_id,
        "task_complete_ordinals": [ordinal for ordinal, _turn in completes],
        "task_started_ordinals": [ordinal for ordinal, _turn in starts],
        "task_turn_count": len(starts),
    }


v2.verify_trace = verify_trace
launch_goal = v2.launch_goal


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
    v2.runtime_check()
    return {
        "authority": False,
        "first_mismatch": None,
        "harness": self_identity(),
        "matrix_launch": False,
        "max_goal_turns": MAX_GOAL_TURNS,
        "qualification_credit": 0,
        "runtime": RUNTIME_ID,
        "schema_id": SCHEMA,
        "status": "PASS_STATIC_FIRST_FINAL_CONTINUATION_ZERO_CREDIT_NO_LAUNCH_AUTHORITY",
        "subject_calls": 0,
        "v2": V2_ID,
        "workspace_writes": 0,
    }


def run_probe(output_root: Path, timeout_seconds: int) -> dict[str, object]:
    v2.runtime_check()
    if output_root.exists() or output_root.resolve(strict=False) != output_root:
        fail("probe-output-root")
    make_dir(output_root)
    objective = (
        "x=cc3; Task: On the first turn output exactly Q without tools. "
        "On the automatic Goal continuation complete with update_goal and output exactly Q."
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
    raw = read_source(receipt_path.resolve(strict=True), "probe-receipt")
    return {
        "artifact": {"bytes": len(raw), "sha256": sha256(raw)},
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
            output = run_probe(
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
