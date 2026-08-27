#!/usr/bin/env python3
"""Read-only attestor for a scored Goal turn followed by same-task terminal closure."""

from __future__ import annotations

import json
import os
from pathlib import Path
import re
import stat
import sys
from typing import Any, Iterable


ROOT = Path(__file__).resolve().parent
BASE = ROOT.parent
V8_ROOT = BASE / "goal_mode_empirical_harness_v8"
sys.path.insert(0, str(V8_ROOT))
import goal_mode_single_process_attestor as prior  # noqa: E402


base = prior.base
ADAPTER = "CODEX_NATIVE_GOAL_SCORED_TURN_THEN_SAME_TASK_TERMINAL_CLOSURE_V1"
ROW_SCHEMA = "pw-r9-goal-mode-row-spec-v10"
SCORED_ATTESTATION_SCHEMA = "pw-r9-goal-mode-scored-active-goal-attestation-v1"
FINAL_ATTESTATION_SCHEMA = "pw-r9-goal-mode-same-task-terminal-closure-attestation-v1"
SCORED_LAUNCH_SCHEMA = "pw-r9-goal-mode-scored-process-launch-receipt-v1"
CLOSURE_LAUNCH_SCHEMA = "pw-r9-goal-mode-closure-process-launch-receipt-v1"
SCORED_PROCESS_SCHEMA = "pw-r9-goal-mode-scored-process-receipt-v1"
CLOSURE_PROCESS_SCHEMA = "pw-r9-goal-mode-closure-process-receipt-v1"
SNAPSHOT_SCHEMA = "pw-r9-goal-mode-terminal-closure-prelaunch-snapshot-v1"
RELEASE_SCHEMA = "pw-r9-goal-mode-terminal-closure-active-goal-release-gate-v1"
DELIVERY_SCHEMA = "pw-r9-goal-mode-terminal-closure-subject-delivery-v1"
CLOSURE_MARKER = "GOAL_TERMINAL_CLOSURE_COMPLETE_NO_SUBJECT_REPLAY"
DIRECT_NATIVE = prior.DIRECT_NATIVE
NESTED_CODE = prior.NESTED_CODE
UUID_RE = prior.UUID_RE
HEX64_RE = prior.HEX64_RE


Invalid = prior.Invalid
require = prior.require
canon = prior.canon
sha256 = prior.sha256
load_json = prior.load_json
get_goal_code = prior.get_goal_code
create_goal_code = prior.create_goal_code
update_goal_code = prior.update_goal_code
reader_code = prior.reader_code
reader_command = prior.reader_command


def _exact_keys(value: dict[str, Any], keys: Iterable[str], label: str) -> None:
    base._exact_keys(value, keys, label)


def _read_regular(path: Path, limit: int) -> bytes:
    return base._read_regular(path, limit)


def _expected_objective(row: dict[str, Any]) -> str:
    criteria_hash = sha256(canon(row["criteria"], newline=False))
    control_hash = sha256(canon(row["control_envelope"], newline=False))
    return (
        f"R9 Goal Mode test taker {row['run_id']}/{row['row_id']}/0; "
        f"criteria_sha256={criteria_hash}; control_envelope_sha256={control_hash}; "
        f"subject_commitment_sha256={row['subject_utf8_sha256']}; execute exactly one gated "
        "subject inside a fresh native Goal, freeze its scored answer, then settle that same "
        "Goal only in a same-task non-scored terminal-closure continuation."
    )


def load_row(path: Path) -> dict[str, Any]:
    row = load_json(path, 2_000_000)
    require(isinstance(row, dict), "row object")
    _exact_keys(
        row,
        {
            "adapter",
            "attempt",
            "cli_version",
            "control_envelope",
            "criteria",
            "model",
            "objective",
            "reasoning_effort",
            "row_id",
            "run_id",
            "schema_id",
            "subject_utf8_bytes",
            "subject_utf8_sha256",
        },
        "row",
    )
    require(row["schema_id"] == ROW_SCHEMA and row["adapter"] == ADAPTER, "row schema/adapter")
    require(
        row["attempt"] == 0
        and isinstance(row["run_id"], str)
        and row["run_id"]
        and isinstance(row["row_id"], str)
        and row["row_id"],
        "row identity",
    )
    require(isinstance(row["criteria"], dict) and isinstance(row["control_envelope"], dict), "row criteria/control")
    require(isinstance(row["model"], str) and row["model"], "row model")
    require(isinstance(row["reasoning_effort"], str) and row["reasoning_effort"], "row effort")
    require(row["cli_version"] == "0.148.0", "row CLI version")
    require(isinstance(row["subject_utf8_sha256"], str) and HEX64_RE.fullmatch(row["subject_utf8_sha256"]), "row subject hash")
    require(isinstance(row["subject_utf8_bytes"], int) and 0 < row["subject_utf8_bytes"] <= 8_000_000, "row subject bytes")
    require(row["objective"] == _expected_objective(row), "row objective derivation")
    require(row["criteria"].get("rule") == "EXACT_UTF8_NO_DECORATION" and isinstance(row["criteria"].get("expected_exact_utf8"), str), "row criteria")
    return row


def _capture_modes(capture: Path) -> None:
    root = os.lstat(capture)
    require(stat.S_ISDIR(root.st_mode) and not capture.is_symlink() and stat.S_IMODE(root.st_mode) == 0o700, "capture root mode")
    for path in capture.iterdir():
        st = os.lstat(path)
        if stat.S_ISREG(st.st_mode):
            require(not path.is_symlink() and stat.S_IMODE(st.st_mode) == 0o600, f"capture file mode: {path.name}")
        elif stat.S_ISFIFO(st.st_mode):
            require(path.name == "subject.fifo" and stat.S_IMODE(st.st_mode) == 0o600, "capture FIFO mode")
        else:
            raise Invalid(f"unexpected capture member: {path.name}")


def _scored_argv_identity(argv: Any, row: dict[str, Any], capture: Path) -> dict[str, str]:
    require(isinstance(argv, list) and all(isinstance(item, str) for item in argv), "scored argv type")
    require(len(argv) == 19, "scored argv length")
    require(argv[1:4] == ["exec", "--strict-config", "-C"], "scored argv prefix")
    require(argv[5:12] == ["--sandbox", "read-only", "--color", "never", "--json", "-m", row["model"]], "scored execution envelope")
    require(
        argv[12:17]
        == [
            "-c",
            f'model_reasoning_effort="{row["reasoning_effort"]}"',
            "-c",
            "suppress_unstable_features_warning=true",
            "-o",
        ],
        "scored config envelope",
    )
    require(Path(argv[17]) == capture / "scored_output_last_message.txt" and argv[18] == "-", "scored output/stdin")
    require("--ephemeral" not in argv and "resume" not in argv, "scored task freshness")
    return {"codex": argv[0], "workspace": argv[4]}


def _closure_argv_identity(
    argv: Any,
    row: dict[str, Any],
    capture: Path,
    scored: dict[str, Any],
) -> None:
    require(isinstance(argv, list) and all(isinstance(item, str) for item in argv), "closure argv type")
    require(len(argv) == 19, "closure argv length")
    require(
        argv[:6]
        == [
            scored["launch"]["codex"],
            "-C",
            scored["launch"]["workspace"],
            "--sandbox",
            "read-only",
            "exec",
        ],
        "closure global envelope",
    )
    require(argv[6:11] == ["resume", "--strict-config", "--json", "-m", row["model"]], "closure resume/model")
    require(
        argv[11:16]
        == [
            "-c",
            f'model_reasoning_effort="{row["reasoning_effort"]}"',
            "-c",
            "suppress_unstable_features_warning=true",
            "-o",
        ],
        "closure config envelope",
    )
    require(Path(argv[16]) == capture / "closure_output_last_message.txt", "closure last-message path")
    require(argv[17:] == [scored["goal"]["thread_id"], "-"], "closure task/stdin")
    require("--ephemeral" not in argv and argv.count("resume") == 1 and "--color" not in argv, "closure persistence/options")


def _assistant_messages(records: list[dict[str, Any]], turn_id: str) -> list[dict[str, Any]]:
    result: list[dict[str, Any]] = []
    turns = base._line_turns(records)
    for entry in records:
        payload = base._payload(entry)
        if payload.get("type") != "message" or payload.get("role") != "assistant" or turns.get(entry["line"]) != turn_id:
            continue
        text = "".join(
            item.get("text", "")
            for item in payload.get("content", [])
            if isinstance(item, dict) and item.get("type") in {"input_text", "output_text"}
        )
        result.append({"line": entry["line"], "phase": payload.get("phase"), "text": text})
    return result


def _common_scored(
    row: dict[str, Any],
    capture: Path,
    codex_home: Path,
    complete: bool,
) -> tuple[dict[str, Any], list[dict[str, Any]], dict[str, Any], bytes, int, dict[str, Any]]:
    _capture_modes(capture)
    prompt_raw = _read_regular(capture / "scored_prompt.txt", 2_000_000)
    prompt = prompt_raw.decode("utf-8")
    launch = load_json(capture / "scored_launch_receipt.json", 2_000_000)
    snapshot = load_json(capture / "prelaunch_snapshot.json", 32_000_000)
    _exact_keys(launch, {"argv", "phase", "pid", "schema_id", "started_at_ms", "stdin"}, "scored launch")
    _exact_keys(snapshot, {"captured_at_ms", "goal_ids", "schema_id", "thread_ids"}, "snapshot")
    require(launch["schema_id"] == SCORED_LAUNCH_SCHEMA and launch["phase"] == "SCORED", "scored launch schema")
    require(
        snapshot["schema_id"] == SNAPSHOT_SCHEMA
        and snapshot["thread_ids"] == sorted(set(snapshot["thread_ids"]))
        and snapshot["goal_ids"] == sorted(set(snapshot["goal_ids"])),
        "snapshot identity",
    )
    require(launch["stdin"] == {"bytes": len(prompt_raw), "sha256": sha256(prompt_raw)}, "scored stdin")
    argv_identity = _scored_argv_identity(launch["argv"], row, capture)
    lifecycle = base._stdout_lifecycle(_read_regular(capture / "scored_stdout.jsonl", 64_000_000), "scored", complete=complete)
    thread_id = lifecycle["thread_id"]
    require(thread_id not in snapshot["thread_ids"], "thread reused")
    _, goal, records, rollout_raw, logical = base._thread_goal(row, codex_home, thread_id)
    require(goal.get("goal_id") not in snapshot["goal_ids"], "Goal reused")
    prompt_lines = base._message_lines(records, "user", prompt)
    require(len(prompt_lines) == 1, "scored prompt cardinality")
    prompt_line = prompt_lines[0]
    calls = [call for call in prior._native_goal_calls(records) if call["call_line"] > prompt_line]
    require(len(calls) >= 3 and [call["method"] for call in calls[:3]] == ["get_goal", "create_goal", "get_goal"], "activation Goal sequence")
    require(
        len({call["representation"] for call in calls[:3]}) == 1
        and all(prior._exact_goal_invocation(call, row["objective"]) for call in calls[:3]),
        "activation Goal invocation",
    )
    require(base._goal_projection(calls[0]["output"]) is None, "initial get_goal non-null")
    created = base._goal_projection(calls[1]["output"])
    reopened = base._goal_projection(calls[2]["output"])
    require(isinstance(created, dict) and isinstance(reopened, dict), "active Goal projections")
    base._assert_goal(created, thread_id, row["objective"], "active")
    base._assert_goal(reopened, thread_id, row["objective"], "active")
    turns = base._line_turns(records)
    turn_id = turns.get(prompt_line)
    require(
        isinstance(turn_id, str)
        and all(turns.get(call["call_line"]) == turn_id and turns.get(call["output_line"]) == turn_id for call in calls[:3]),
        "Goal calls not in scored turn",
    )
    actions = base._action_calls(records, prompt_line, calls[2]["output_line"])
    require(len(actions) == 3 and [item["line"] for item in actions] == [call["call_line"] for call in calls[:3]], "pre-Goal action")
    workspace = Path(argv_identity["workspace"])
    command = reader_command(row, capture, workspace)
    code = reader_code(row, capture, workspace)
    reader = prior._reader_call(records, code, command, str(workspace))
    require(reader["line"] > calls[2]["output_line"] and turns.get(reader["line"]) == turn_id, "reader before active Goal")
    through_reader = base._action_calls(records, calls[2]["output_line"], reader["line"])
    require(len(through_reader) == 1 and through_reader[0]["line"] == reader["line"], "action before reader")
    pre_reader_messages = [
        base._payload(entry)
        for entry in records
        if prompt_line < entry["line"] < reader["line"]
        and turns.get(entry["line"]) == turn_id
        and base._payload(entry).get("type") == "message"
        and base._payload(entry).get("role") == "assistant"
    ]
    require(all(message.get("phase") == "commentary" for message in pre_reader_messages), "answer before reader")
    identity = {
        "goal_action_transport": calls[0]["representation"],
        "goal_id": goal["goal_id"],
        "thread_id": thread_id,
        "turn_id": turn_id,
    }
    return identity, records, goal, rollout_raw, prompt_line, {
        **reader,
        "argv_identity": argv_identity,
        "lifecycle": lifecycle,
        "logical_rollout": logical,
    }


def attest_release(row_path: Path, capture: Path, codex_home: Path) -> dict[str, Any]:
    row = load_row(row_path)
    identity, records, goal, rollout_raw, prompt_line, reader = _common_scored(row, capture, codex_home, complete=False)
    require(goal.get("status") == "active", "Goal not active at release gate")
    calls = [call for call in prior._native_goal_calls(records) if call["call_line"] > prompt_line]
    require([call["method"] for call in calls] == ["get_goal", "create_goal", "get_goal"], "Goal action before subject release")
    require(not (capture / "subject_input.txt").exists() and not (capture / "subject_delivery.json").exists(), "subject existed before release")
    return {
        "authority": {"qualification_credit": 0, "subject_release": True},
        "goal": identity,
        "reader": {
            "call_id": reader["call_id"],
            "call_line": reader["line"],
            "transport": reader["representation"],
        },
        "rollout_prefix": {
            "bytes": len(rollout_raw),
            "logical_path": reader["logical_rollout"],
            "sha256": sha256(rollout_raw),
        },
        "schema_id": RELEASE_SCHEMA,
        "status": "PASS_FRESH_NATIVE_GOAL_ACTIVE_SUBJECT_RELEASE_AUTHORIZED",
    }


def _process_scored(capture: Path) -> dict[str, Any]:
    receipt = load_json(capture / "scored_process_receipt.json", 4_000_000)
    _exact_keys(
        receipt,
        {
            "ended_at_ms",
            "goal_release_error",
            "pid",
            "rc",
            "reader_quiescence",
            "schema_id",
            "started_at_ms",
            "stdin_closed",
            "subject_delivery",
            "subject_fifo_removed",
            "subject_release",
            "timed_out",
        },
        "scored process",
    )
    require(receipt["schema_id"] == SCORED_PROCESS_SCHEMA, "scored process schema")
    require(receipt["rc"] == 0 and receipt["timed_out"] is False and receipt["stdin_closed"] is True, "scored process terminal")
    require(receipt["goal_release_error"] is None, "scored release error")
    require(receipt["subject_release"] == "AFTER_SAME_PROCESS_NATIVE_GOAL_ACTIVE_ATTESTATION", "scored release")
    require(receipt["subject_fifo_removed"] is True, "subject FIFO remains")
    require(receipt["reader_quiescence"] == {"detected_pids": [], "kill_sent": 0, "remaining_pids": [], "term_sent": 0}, "reader not quiescent")
    require(isinstance(receipt["started_at_ms"], int) and isinstance(receipt["ended_at_ms"], int) and receipt["ended_at_ms"] >= receipt["started_at_ms"], "scored time")
    return receipt


def _attest_scored(
    row_path: Path,
    capture: Path,
    codex_home: Path,
    expected_current_goal_status: str,
) -> dict[str, Any]:
    row = load_row(row_path)
    identity, records, goal, rollout_raw, prompt_line, reader = _common_scored(row, capture, codex_home, complete=True)
    require(expected_current_goal_status in {"active", "complete"}, "scored current Goal status selector")
    require(goal.get("status") == expected_current_goal_status, "unexpected current Goal state during scored proof")
    release = load_json(capture / "goal_active_subject_release_gate.json", 4_000_000)
    delivery = load_json(capture / "subject_delivery.json", 4_000_000)
    require(
        release.get("schema_id") == RELEASE_SCHEMA
        and release.get("status") == "PASS_FRESH_NATIVE_GOAL_ACTIVE_SUBJECT_RELEASE_AUTHORIZED"
        and release.get("authority") == {"qualification_credit": 0, "subject_release": True}
        and release.get("goal") == identity,
        "release gate",
    )
    require(
        release.get("reader")
        == {"call_id": reader["call_id"], "call_line": reader["line"], "transport": reader["representation"]},
        "release reader",
    )
    base._assert_rollout_prefix(codex_home, release.get("rollout_prefix"), "release")
    _exact_keys(delivery, {"bytes", "closed_at_ms", "schema_id", "sha256", "status"}, "delivery")
    require(
        delivery
        == {
            "bytes": row["subject_utf8_bytes"],
            "closed_at_ms": delivery["closed_at_ms"],
            "schema_id": DELIVERY_SCHEMA,
            "sha256": row["subject_utf8_sha256"],
            "status": "DELIVERED_ONCE_AFTER_ACTIVE_GOAL_GATE",
        }
        and isinstance(delivery["closed_at_ms"], int),
        "delivery binding",
    )
    subject = _read_regular(capture / "subject_input.txt", 8_000_000)
    require(len(subject) == row["subject_utf8_bytes"] and sha256(subject) == row["subject_utf8_sha256"], "subject capture")
    reader_result = prior._reader_result(
        records,
        reader,
        reader_command(row, capture, Path(reader["argv_identity"]["workspace"])),
        reader["argv_identity"]["workspace"],
        subject,
    )
    turns = base._line_turns(records)
    calls = [
        call
        for call in prior._native_goal_calls(records)
        if call["call_line"] > prompt_line and turns.get(call["call_line"]) == identity["turn_id"]
    ]
    require([call["method"] for call in calls] == ["get_goal", "create_goal", "get_goal"], "scored turn Goal sequence")
    actions = [
        item
        for item in base._action_calls(records, prompt_line, 1 << 62)
        if turns.get(item["line"]) == identity["turn_id"]
    ]
    expected_actions = [calls[0]["call_line"], calls[1]["call_line"], calls[2]["call_line"], *reader_result["action_lines"]]
    require([item["line"] for item in actions] == expected_actions, "unexpected scored action")
    require(all(turns.get(item["line"]) == identity["turn_id"] for item in actions), "scored action escaped turn")
    expected = row["criteria"]["expected_exact_utf8"]
    messages = _assistant_messages(records, identity["turn_id"])
    require(
        messages
        and messages[-1]["text"] == expected
        and messages[-1]["phase"] == "final_answer"
        and messages[-1]["line"] > reader_result["tool_output_line"],
        "scored answer phase/order",
    )
    require(sum(message["text"] == expected for message in messages) == 1, "scored answer cardinality")
    require(all(message["phase"] == "commentary" for message in messages[:-1]), "scored message phases")
    require(reader["lifecycle"]["thread_id"] == identity["thread_id"] and reader["lifecycle"]["messages"] == [message["text"] for message in messages], "scored stdout/rollout")
    require(_read_regular(capture / "scored_output_last_message.txt", 8_000_000) == expected.encode("utf-8"), "scored output-last-message")
    process = _process_scored(capture)
    message_projection = [{"phase": message["phase"], "sha256": sha256(message["text"].encode("utf-8"))} for message in messages]
    return {
        "answer": {"bytes": len(expected.encode("utf-8")), "sha256": sha256(expected.encode("utf-8"))},
        "authority": {"closure_launch_eligible": True, "qualification_credit": 0, "subject_release": False},
        "goal": {**identity, "status": "active"},
        "launch": reader["argv_identity"],
        "process": {"ended_at_ms": process["ended_at_ms"], "pid": process["pid"], "started_at_ms": process["started_at_ms"]},
        "reader": {**reader_result, "call_line": reader["line"]},
        "rollout": {
            "bytes": len(rollout_raw),
            "logical_path": reader["logical_rollout"],
            "sha256": sha256(rollout_raw),
        },
        "schema_id": SCORED_ATTESTATION_SCHEMA,
        "status": "PASS_SCORED_ANSWER_DURABLE_GOAL_ACTIVE_CLOSURE_ELIGIBLE_ZERO_CREDIT",
        "subject": {"bytes": len(subject), "sha256": sha256(subject)},
        "terminal": {
            "message_count": len(message_projection),
            "message_projection_sha256": sha256(canon(message_projection, newline=False)),
        },
        "transport": {"goal_actions": calls[0]["representation"], "reader": reader["representation"]},
    }


def attest_scored(row_path: Path, capture: Path, codex_home: Path) -> dict[str, Any]:
    return _attest_scored(row_path, capture, codex_home, "active")


def _file_identity(path: Path) -> dict[str, Any]:
    raw = _read_regular(path, 16_000_000)
    return {"bytes": len(raw), "sha256": sha256(raw)}


def _native_goal_context(
    records: list[dict[str, Any]],
    prompt_line: int,
    turn_id: str,
    objective: str,
) -> dict[str, Any]:
    turns = base._line_turns(records)
    prior_messages = [
        entry
        for entry in records
        if entry["line"] < prompt_line
        and turns.get(entry["line"]) == turn_id
        and base._payload(entry).get("type") == "message"
    ]
    require(len(prior_messages) == 1, "native Goal context cardinality")
    payload = base._payload(prior_messages[0])
    content = payload.get("content")
    require(
        payload.get("role") == "user"
        and isinstance(content, list)
        and len(content) == 1
        and isinstance(content[0], dict)
        and content[0].get("type") == "input_text"
        and isinstance(content[0].get("text"), str),
        "native Goal context envelope",
    )
    text = content[0]["text"]
    require(
        text.startswith('<codex_internal_context source="goal">\nContinue working toward the active thread goal.\n')
        and text.endswith("\n</codex_internal_context>"),
        "native Goal context framing",
    )
    require(
        text.count(f"<objective>\n{objective}\n</objective>") == 1
        and "This goal persists across turns." in text
        and "Only use status `blocked`" in text,
        "native Goal context lifecycle",
    )
    prior_reasoning = [
        entry
        for entry in records
        if entry["line"] < prompt_line and turns.get(entry["line"]) == turn_id and base._payload(entry).get("type") == "reasoning"
    ]
    prior_actions = [entry for entry in base._action_calls(records, 0, prompt_line) if turns.get(entry["line"]) == turn_id]
    require(not prior_reasoning and not prior_actions, "work preceded closure prompt")
    raw = text.encode("utf-8")
    return {"bytes": len(raw), "line": prior_messages[0]["line"], "objective_bound": True, "sha256": sha256(raw)}


def _process_closure(capture: Path) -> dict[str, Any]:
    receipt = load_json(capture / "closure_process_receipt.json", 4_000_000)
    _exact_keys(receipt, {"ended_at_ms", "pid", "rc", "schema_id", "started_at_ms", "stdin_closed", "timed_out"}, "closure process")
    require(receipt["schema_id"] == CLOSURE_PROCESS_SCHEMA, "closure process schema")
    require(receipt["rc"] == 0 and receipt["timed_out"] is False and receipt["stdin_closed"] is True, "closure process terminal")
    require(isinstance(receipt["started_at_ms"], int) and isinstance(receipt["ended_at_ms"], int) and receipt["ended_at_ms"] >= receipt["started_at_ms"], "closure time")
    return receipt


def attest_final(row_path: Path, capture: Path, codex_home: Path) -> dict[str, Any]:
    row = load_row(row_path)
    scored = _attest_scored(row_path, capture, codex_home, "complete")
    stored_scored = load_json(capture / "scored_phase_attestation.json", 16_000_000)
    require(stored_scored == scored, "scored attestation changed")
    closure_prompt_raw = _read_regular(capture / "closure_prompt.txt", 2_000_000)
    closure_prompt = closure_prompt_raw.decode("utf-8")
    subject = _read_regular(capture / "subject_input.txt", 8_000_000)
    require(subject not in closure_prompt_raw, "subject replayed in closure prompt")
    closure_launch = load_json(capture / "closure_launch_receipt.json", 4_000_000)
    _exact_keys(closure_launch, {"argv", "phase", "pid", "schema_id", "scored_phase", "started_at_ms", "stdin"}, "closure launch")
    require(closure_launch["schema_id"] == CLOSURE_LAUNCH_SCHEMA and closure_launch["phase"] == "CLOSURE", "closure launch schema")
    require(closure_launch["stdin"] == {"bytes": len(closure_prompt_raw), "sha256": sha256(closure_prompt_raw)}, "closure stdin")
    require(closure_launch["scored_phase"] == _file_identity(capture / "scored_phase_attestation.json"), "closure scored gate")
    _closure_argv_identity(closure_launch["argv"], row, capture, scored)
    lifecycle = base._stdout_lifecycle(_read_regular(capture / "closure_stdout.jsonl", 64_000_000), "closure", complete=True)
    require(lifecycle["thread_id"] == scored["goal"]["thread_id"], "closure changed task")
    _, goal, records, rollout_raw, logical = base._thread_goal(row, codex_home, lifecycle["thread_id"])
    require(goal.get("goal_id") == scored["goal"]["goal_id"] and goal.get("status") == "complete", "closure Goal identity/state")
    prompt_lines = base._message_lines(records, "user", closure_prompt)
    require(len(prompt_lines) == 1, "closure prompt cardinality")
    prompt_line = prompt_lines[0]
    turns = base._line_turns(records)
    closure_turn = turns.get(prompt_line)
    require(isinstance(closure_turn, str) and closure_turn != scored["goal"]["turn_id"], "closure turn identity")
    context = _native_goal_context(records, prompt_line, closure_turn, row["objective"])
    calls = [call for call in prior._native_goal_calls(records) if call["call_line"] > prompt_line]
    require([call["method"] for call in calls] == ["get_goal", "update_goal", "get_goal"], "closure Goal sequence")
    require(
        len({call["representation"] for call in calls}) == 1
        and all(prior._exact_goal_invocation(call, row["objective"]) for call in calls),
        "closure Goal invocation",
    )
    first = base._goal_projection(calls[0]["output"])
    updated = base._goal_projection(calls[1]["output"])
    final = base._goal_projection(calls[2]["output"])
    require(isinstance(first, dict) and isinstance(updated, dict) and isinstance(final, dict), "closure Goal outputs")
    base._assert_goal(first, lifecycle["thread_id"], row["objective"], "active")
    base._assert_goal(updated, lifecycle["thread_id"], row["objective"], "complete")
    base._assert_goal(final, lifecycle["thread_id"], row["objective"], "complete")
    require(
        all(turns.get(call["call_line"]) == closure_turn and turns.get(call["output_line"]) == closure_turn for call in calls),
        "closure Goal call escaped turn",
    )
    actions = [item for item in base._action_calls(records, prompt_line, 1 << 62) if turns.get(item["line"]) == closure_turn]
    require([item["line"] for item in actions] == [call["call_line"] for call in calls], "unexpected closure action")
    messages = _assistant_messages(records, closure_turn)
    require(
        messages
        and messages[-1]["text"] == CLOSURE_MARKER
        and messages[-1]["phase"] == "final_answer"
        and messages[-1]["line"] > calls[2]["output_line"],
        "closure marker phase/order",
    )
    require(all(message["phase"] == "commentary" for message in messages[:-1]), "closure message phases")
    expected = row["criteria"]["expected_exact_utf8"]
    require(all(message["text"] != expected and subject.decode("utf-8") not in message["text"] for message in messages), "closure subject replay")
    require(lifecycle["messages"] == [message["text"] for message in messages], "closure stdout/rollout")
    require(_read_regular(capture / "closure_output_last_message.txt", 8_000_000) == CLOSURE_MARKER.encode("utf-8"), "closure output-last-message")
    scored_prefix = base._assert_rollout_prefix(codex_home, scored["rollout"], "scored")
    require(scored_prefix < len(rollout_raw) and logical == scored["rollout"]["logical_path"], "closure rollout chronology")
    answer_lines = base._message_lines(records, "assistant", expected)
    require(len(answer_lines) == 1 and turns.get(answer_lines[0]) == scored["goal"]["turn_id"] and answer_lines[0] < prompt_line, "scored answer moved/replayed")
    closure_process = _process_closure(capture)
    scored_process = _process_scored(capture)
    require(scored_process["ended_at_ms"] <= closure_process["started_at_ms"], "closure preceded scored terminal")
    require(scored_process["pid"] != closure_process["pid"], "process identity reused")
    require(closure_launch["pid"] == closure_process["pid"] and closure_launch["started_at_ms"] == closure_process["started_at_ms"], "closure launch/process")
    return {
        "authority": {"external_matrix_qualification_required": True, "qualification_credit": 0},
        "closure": {
            "goal_actions": calls[0]["representation"],
            "marker": {"bytes": len(CLOSURE_MARKER.encode("utf-8")), "sha256": sha256(CLOSURE_MARKER.encode("utf-8"))},
            "native_goal_context": context,
            "prompt_line": prompt_line,
            "turn_id": closure_turn,
        },
        "goal": {
            "goal_id": scored["goal"]["goal_id"],
            "status": "complete",
            "thread_id": scored["goal"]["thread_id"],
            "turn_ids": [scored["goal"]["turn_id"], closure_turn],
        },
        "process_accounting": {"fresh_tasks": 1, "processes": 2, "resume_operations": 1, "retries": 0, "subject_deliveries": 1},
        "rollout": {"bytes": len(rollout_raw), "logical_path": logical, "sha256": sha256(rollout_raw)},
        "schema_id": FINAL_ATTESTATION_SCHEMA,
        "scored": scored,
        "status": "PASS_SAME_TASK_TWO_TURN_NATIVE_GOAL_TERMINAL_CLOSURE_ZERO_CREDIT",
        "subject": {"bytes": len(subject), "sha256": sha256(subject)},
    }


__all__ = (
    "ADAPTER",
    "CLOSURE_LAUNCH_SCHEMA",
    "CLOSURE_MARKER",
    "CLOSURE_PROCESS_SCHEMA",
    "DELIVERY_SCHEMA",
    "DIRECT_NATIVE",
    "FINAL_ATTESTATION_SCHEMA",
    "Invalid",
    "NESTED_CODE",
    "RELEASE_SCHEMA",
    "ROW_SCHEMA",
    "SCORED_ATTESTATION_SCHEMA",
    "SCORED_LAUNCH_SCHEMA",
    "SCORED_PROCESS_SCHEMA",
    "SNAPSHOT_SCHEMA",
    "attest_final",
    "attest_release",
    "attest_scored",
    "base",
    "canon",
    "create_goal_code",
    "get_goal_code",
    "load_json",
    "load_row",
    "reader_code",
    "reader_command",
    "require",
    "sha256",
    "update_goal_code",
)
