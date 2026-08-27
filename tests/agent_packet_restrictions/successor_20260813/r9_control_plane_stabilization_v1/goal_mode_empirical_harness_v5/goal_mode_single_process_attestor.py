#!/usr/bin/env python3
"""Read-only attestor for one-process Goal activation before subject release."""

from __future__ import annotations

import json
import os
from pathlib import Path
import re
import shlex
import stat
import sys
from typing import Any, Iterable


HERE = Path(__file__).resolve().parent
V4_ROOT = HERE.parent / "goal_mode_empirical_harness_v4"
sys.path.insert(0, str(V4_ROOT))
import goal_mode_attestor as base  # noqa: E402


ADAPTER = "CODEX_NATIVE_GOAL_SINGLE_PROCESS_ACTIVATE_THEN_FIFO_V1"
ROW_SCHEMA = "pw-r9-goal-mode-row-spec-v5"
ATTESTATION_SCHEMA = "pw-r9-codex-native-goal-single-process-row-attestation-v1"
LAUNCH_SCHEMA = "pw-r9-goal-mode-single-process-launch-receipt-v1"
PROCESS_SCHEMA = "pw-r9-goal-mode-single-process-process-receipt-v1"
SNAPSHOT_SCHEMA = "pw-r9-goal-mode-single-process-prelaunch-snapshot-v1"
RELEASE_SCHEMA = "pw-r9-goal-mode-single-process-active-goal-release-gate-v1"
DELIVERY_SCHEMA = "pw-r9-goal-mode-single-process-subject-delivery-v1"
UUID_RE = re.compile(r"^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$")
HEX64_RE = re.compile(r"^[0-9a-f]{64}$")


Invalid = base.Invalid
require = base.require
canon = base.canon
sha256 = base.sha256
load_json = base.load_json


def _exact_keys(value: dict[str, Any], keys: Iterable[str], label: str) -> None:
    base._exact_keys(value, keys, label)


def _read_regular(path: Path, limit: int) -> bytes:
    return base._read_regular(path, limit)


def _expected_objective(row: dict[str, Any]) -> str:
    criteria_hash = sha256(canon(row["criteria"], newline=False))
    control_hash = sha256(canon(row["control_envelope"], newline=False))
    return f"R9 Goal Mode test taker {row['run_id']}/{row['row_id']}/0; criteria_sha256={criteria_hash}; control_envelope_sha256={control_hash}; subject_commitment_sha256={row['subject_utf8_sha256']}; execute exactly one gated subject after native Goal activation and settle terminal Goal state."


def load_row(path: Path) -> dict[str, Any]:
    row = load_json(path, 2_000_000)
    require(isinstance(row, dict), "row object")
    _exact_keys(row, {"adapter", "attempt", "cli_version", "control_envelope", "criteria", "model", "objective", "reasoning_effort", "row_id", "run_id", "schema_id", "subject_utf8_bytes", "subject_utf8_sha256"}, "row")
    require(row["schema_id"] == ROW_SCHEMA and row["adapter"] == ADAPTER, "row schema/adapter")
    require(row["attempt"] == 0 and isinstance(row["run_id"], str) and row["run_id"] and isinstance(row["row_id"], str) and row["row_id"], "row identity")
    require(isinstance(row["criteria"], dict) and isinstance(row["control_envelope"], dict), "row criteria/control")
    require(isinstance(row["model"], str) and row["model"] and isinstance(row["reasoning_effort"], str) and row["reasoning_effort"], "row route")
    require(row["cli_version"] == "0.148.0", "row CLI version")
    require(isinstance(row["subject_utf8_sha256"], str) and HEX64_RE.fullmatch(row["subject_utf8_sha256"]), "row subject hash")
    require(isinstance(row["subject_utf8_bytes"], int) and 0 < row["subject_utf8_bytes"] <= 8_000_000, "row subject bytes")
    require(row["objective"] == _expected_objective(row), "row objective derivation")
    require(row["criteria"].get("rule") == "EXACT_UTF8_NO_DECORATION" and isinstance(row["criteria"].get("expected_exact_utf8"), str), "row exact criteria")
    return row


def reader_command(row: dict[str, Any], capture: Path, workspace: Path) -> str:
    reader = V4_ROOT / "read_goal_subject.py"
    fifo = capture / "subject.fifo"
    return shlex.join(["timeout", "--signal=TERM", "--kill-after=5s", "65s", "python3", "-B", str(reader), "--fifo", str(fifo), "--sha256", row["subject_utf8_sha256"], "--bytes", str(row["subject_utf8_bytes"]), "--timeout-seconds", "60"])


def reader_code(row: dict[str, Any], capture: Path, workspace: Path) -> str:
    command = reader_command(row, capture, workspace)
    return "const r = await tools.exec_command({" + f"cmd:{json.dumps(command)},workdir:{json.dumps(str(workspace))},yield_time_ms:30000,max_output_tokens:20000" + "});\nif (r.exit_code !== 0) throw new Error('subject reader failed');\ntext(r.output);\n"


def get_goal_code() -> str:
    return "const r = await tools.get_goal({});\ntext(r);\n"


def create_goal_code(objective: str) -> str:
    return f"const r = await tools.create_goal({{objective:{json.dumps(objective, ensure_ascii=False)}}});\ntext(r);\n"


def update_goal_code() -> str:
    return "const r = await tools.update_goal({status:\"complete\"});\ntext(r);\n"


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


def _launch_identity(argv: Any, row: dict[str, Any], capture: Path) -> dict[str, str]:
    require(isinstance(argv, list) and all(isinstance(item, str) for item in argv), "launch argv type")
    require(len(argv) == 19, "launch argv length")
    require(argv[1:4] == ["exec", "--strict-config", "-C"], "launch argv prefix")
    require(argv[5:12] == ["--sandbox", "read-only", "--color", "never", "--json", "-m", row["model"]], "launch execution envelope")
    require(argv[12:17] == ["-c", f'model_reasoning_effort="{row["reasoning_effort"]}"', "-c", "suppress_unstable_features_warning=true", "-o"], "launch config envelope")
    require(Path(argv[17]) == capture / "output_last_message.txt" and argv[18] == "-", "launch output/stdin")
    require("--ephemeral" not in argv and "resume" not in argv, "single fresh persistent task only")
    return {"codex": argv[0], "workspace": argv[4]}


def _reader_call(records: list[dict[str, Any]], code: str) -> dict[str, Any]:
    calls: list[dict[str, Any]] = []
    for entry in records:
        payload = base._payload(entry)
        if payload.get("type") == "custom_tool_call" and payload.get("name") == "exec" and payload.get("input") == code:
            require(isinstance(payload.get("call_id"), str) and payload["call_id"], "reader call id")
            calls.append({"call_id": payload["call_id"], "line": entry["line"], "payload": payload})
    require(len(calls) == 1, "reader call cardinality")
    return calls[0]


def _reader_result(records: list[dict[str, Any]], reader: dict[str, Any], command: str, workspace: str, subject: bytes) -> dict[str, Any]:
    outputs = [entry for entry in records if base._payload(entry).get("type") == "custom_tool_call_output" and base._payload(entry).get("call_id") == reader["call_id"]]
    require(len(outputs) == 1 and outputs[0]["line"] > reader["line"], "reader tool output")
    texts = base._texts(base._payload(outputs[0]).get("output"))
    require(sum(subject.decode("utf-8") in text for text in texts) == 1, "reader tool output subject binding")
    events: list[dict[str, Any]] = []
    for entry in records:
        record = entry["record"]
        payload = record.get("payload") if record.get("type") == "event_msg" else None
        item = payload.get("item") if isinstance(payload, dict) and payload.get("type") == "item_completed" else None
        if isinstance(item, dict) and item.get("type") == "CommandExecution" and item.get("command") == ["/bin/bash", "-lc", command]:
            events.append({"item": item, "line": entry["line"]})
    require(len(events) == 1 and events[0]["line"] > reader["line"], "reader command event cardinality")
    item = events[0]["item"]
    expected = subject.decode("utf-8")
    require(item.get("cwd") == f"file://{workspace}" and item.get("exit_code") == 0 and item.get("status") == "completed", "reader process terminal")
    require(item.get("stdout") == expected and item.get("stderr") == "" and item.get("aggregated_output") == expected, "reader process bytes")
    return {"command_event_line": events[0]["line"], "tool_output_line": outputs[0]["line"]}


def _common(row: dict[str, Any], capture: Path, codex_home: Path, complete: bool) -> tuple[dict[str, Any], list[dict[str, Any]], dict[str, Any], bytes, int, dict[str, Any], dict[str, str]]:
    _capture_modes(capture)
    prompt_raw = _read_regular(capture / "bootstrap_prompt.txt", 2_000_000)
    prompt = prompt_raw.decode("utf-8")
    launch = load_json(capture / "launch_receipt.json", 2_000_000)
    snapshot = load_json(capture / "prelaunch_snapshot.json", 32_000_000)
    _exact_keys(launch, {"argv", "phase", "pid", "schema_id", "started_at_ms", "stdin"}, "launch")
    _exact_keys(snapshot, {"captured_at_ms", "goal_ids", "schema_id", "thread_ids"}, "snapshot")
    require(launch["schema_id"] == LAUNCH_SCHEMA and launch["phase"] == "SINGLE_PROCESS", "launch schema")
    require(snapshot["schema_id"] == SNAPSHOT_SCHEMA and snapshot["thread_ids"] == sorted(set(snapshot["thread_ids"])) and snapshot["goal_ids"] == sorted(set(snapshot["goal_ids"])), "snapshot identity")
    require(launch["stdin"] == {"bytes": len(prompt_raw), "sha256": sha256(prompt_raw)}, "launch stdin")
    argv_identity = _launch_identity(launch["argv"], row, capture)
    lifecycle = base._stdout_lifecycle(_read_regular(capture / "stdout.jsonl", 64_000_000), "single_process", complete=complete)
    thread_id = lifecycle["thread_id"]
    require(thread_id not in snapshot["thread_ids"], "thread reused")
    thread, goal, records, rollout_raw, logical = base._thread_goal(row, codex_home, thread_id)
    require(goal.get("goal_id") not in snapshot["goal_ids"], "Goal reused")
    prompt_lines = base._message_lines(records, "user", prompt)
    require(len(prompt_lines) == 1, "bootstrap prompt cardinality")
    prompt_line = prompt_lines[0]
    calls = [call for call in base._goal_calls(records) if call["call_line"] > prompt_line]
    require(len(calls) >= 3 and [call["method"] for call in calls[:3]] == ["get_goal", "create_goal", "get_goal"], "activation Goal sequence")
    require(calls[0]["code"] == get_goal_code() and calls[1]["code"] == create_goal_code(row["objective"]) and calls[2]["code"] == get_goal_code(), "activation Goal call bytes")
    require(base._goal_projection(calls[0]["output"]) is None, "initial get_goal non-null")
    created = base._goal_projection(calls[1]["output"]); reopened = base._goal_projection(calls[2]["output"])
    require(isinstance(created, dict) and isinstance(reopened, dict), "active Goal projections")
    base._assert_goal(created, thread_id, row["objective"], "active"); base._assert_goal(reopened, thread_id, row["objective"], "active")
    turns = base._line_turns(records)
    turn_id = turns.get(prompt_line)
    require(isinstance(turn_id, str) and all(turns.get(call["call_line"]) == turn_id and turns.get(call["output_line"]) == turn_id for call in calls[:3]), "Goal calls not in bootstrap turn")
    actions = base._action_calls(records, prompt_line, calls[2]["output_line"])
    require(len(actions) == 3 and [item["line"] for item in actions] == [call["call_line"] for call in calls[:3]], "pre-Goal action")
    workspace = Path(argv_identity["workspace"])
    code = reader_code(row, capture, workspace)
    reader = _reader_call(records, code)
    require(reader["line"] > calls[2]["output_line"] and turns.get(reader["line"]) == turn_id, "reader before active Goal or different turn")
    through_reader = base._action_calls(records, calls[2]["output_line"], reader["line"])
    require(len(through_reader) == 1 and through_reader[0]["line"] == reader["line"], "action before reader")
    require(not any(entry["line"] < reader["line"] and turns.get(entry["line"]) == turn_id and base._payload(entry).get("type") == "message" and base._payload(entry).get("role") == "assistant" for entry in records), "assistant answer before reader")
    identity = {"bytes": len(rollout_raw), "logical_path": logical, "sha256": sha256(rollout_raw)}
    return {"goal_id": goal["goal_id"], "thread_id": thread_id, "turn_id": turn_id}, records, goal, rollout_raw, prompt_line, reader, {**argv_identity, "rollout_logical_path": logical, "rollout_prefix_bytes": str(len(rollout_raw)), "rollout_prefix_sha256": identity["sha256"]}


def attest_release(row_path: Path, capture: Path, codex_home: Path) -> dict[str, Any]:
    row = load_row(row_path)
    identity, records, goal, rollout_raw, _, reader, argv = _common(row, capture, codex_home, complete=False)
    require(goal.get("status") == "active", "Goal not active at release gate")
    calls = base._goal_calls(records)
    require([call["method"] for call in calls] == ["get_goal", "create_goal", "get_goal"], "Goal action occurred before subject release")
    require(not (capture / "subject_input.txt").exists() and not (capture / "subject_delivery.json").exists(), "subject existed before release gate")
    return {"authority":{"qualification_credit":0,"subject_release":True},"goal":identity,"reader":{"call_id":reader["call_id"],"call_line":reader["line"]},"rollout_prefix":{"bytes":len(rollout_raw),"logical_path":argv["rollout_logical_path"],"sha256":sha256(rollout_raw)},"schema_id":RELEASE_SCHEMA,"status":"PASS_FRESH_NATIVE_GOAL_ACTIVE_SUBJECT_RELEASE_AUTHORIZED"}


def attest_final(row_path: Path, capture: Path, codex_home: Path) -> dict[str, Any]:
    row = load_row(row_path)
    identity, records, goal, rollout_raw, prompt_line, reader, argv = _common(row, capture, codex_home, complete=True)
    require(goal.get("status") == "complete", "Goal not complete")
    release = load_json(capture / "goal_active_subject_release_gate.json", 4_000_000)
    delivery = load_json(capture / "subject_delivery.json", 4_000_000)
    require(isinstance(release, dict) and release.get("schema_id") == RELEASE_SCHEMA and release.get("status") == "PASS_FRESH_NATIVE_GOAL_ACTIVE_SUBJECT_RELEASE_AUTHORIZED", "release gate")
    require(release.get("authority") == {"qualification_credit":0,"subject_release":True} and release.get("goal") == identity, "release authority/identity")
    require(release.get("reader") == {"call_id":reader["call_id"],"call_line":reader["line"]}, "release reader binding")
    base._assert_rollout_prefix(codex_home, release.get("rollout_prefix"), "release")
    _exact_keys(delivery, {"bytes","closed_at_ms","schema_id","sha256","status"}, "delivery")
    require(delivery == {"bytes":row["subject_utf8_bytes"],"closed_at_ms":delivery["closed_at_ms"],"schema_id":DELIVERY_SCHEMA,"sha256":row["subject_utf8_sha256"],"status":"DELIVERED_ONCE_AFTER_ACTIVE_GOAL_GATE"}, "delivery binding")
    require(isinstance(delivery["closed_at_ms"], int) and delivery["closed_at_ms"] > 0, "delivery time")
    subject = _read_regular(capture / "subject_input.txt", 8_000_000)
    require(len(subject) == row["subject_utf8_bytes"] and sha256(subject) == row["subject_utf8_sha256"], "subject capture")
    reader_result = _reader_result(records, reader, reader_command(row, capture, Path(argv["workspace"])), argv["workspace"], subject)
    calls = [call for call in base._goal_calls(records) if call["call_line"] > prompt_line]
    require([call["method"] for call in calls] == ["get_goal","create_goal","get_goal","update_goal"], "terminal Goal sequence")
    require(calls[3]["code"] == update_goal_code() and calls[3]["call_line"] > reader_result["tool_output_line"], "update_goal ordering/code")
    terminal_projection = base._goal_projection(calls[3]["output"])
    require(isinstance(terminal_projection, dict), "terminal Goal projection")
    base._assert_goal(terminal_projection, identity["thread_id"], row["objective"], "complete")
    turns = base._line_turns(records)
    actions = base._action_calls(records, prompt_line, calls[3]["output_line"])
    require(len(actions) == 5 and [item["line"] for item in actions] == [calls[0]["call_line"],calls[1]["call_line"],calls[2]["call_line"],reader["line"],calls[3]["call_line"]], "unexpected subject action")
    require(all(turns.get(item["line"]) == identity["turn_id"] for item in actions), "multiple subject turns")
    expected = row["criteria"]["expected_exact_utf8"]
    messages = base._message_lines(records, "assistant", expected)
    require(len(messages) == 1 and messages[0] > calls[3]["output_line"] and turns.get(messages[0]) == identity["turn_id"], "terminal answer")
    lifecycle = base._stdout_lifecycle(_read_regular(capture / "stdout.jsonl", 64_000_000), "single_process", complete=True)
    require(lifecycle["thread_id"] == identity["thread_id"] and lifecycle["messages"] == [expected], "stdout terminal")
    require(_read_regular(capture / "output_last_message.txt", 8_000_000) == expected.encode("utf-8"), "output-last-message")
    return {"authority":{"external_matrix_qualification_required":True,"qualification_credit":0,"subject_release":False},"goal":{**identity,"status":"complete"},"reader":{**reader_result,"call_line":reader["line"]},"rollout":{"bytes":len(rollout_raw),"logical_path":argv["rollout_logical_path"],"sha256":sha256(rollout_raw)},"schema_id":ATTESTATION_SCHEMA,"status":"PASS_SINGLE_PROCESS_NATIVE_GOAL_LIFECYCLE_ZERO_CREDIT","subject":{"bytes":len(subject),"sha256":sha256(subject)},"terminal":{"answer_bytes":len(expected.encode("utf-8")),"answer_sha256":sha256(expected.encode("utf-8")),"update_goal_output_line":calls[3]["output_line"]}}


__all__ = ("ADAPTER","ATTESTATION_SCHEMA","DELIVERY_SCHEMA","Invalid","LAUNCH_SCHEMA","PROCESS_SCHEMA","RELEASE_SCHEMA","ROW_SCHEMA","SNAPSHOT_SCHEMA","attest_final","attest_release","base","canon","load_json","load_row","reader_code","reader_command","require","sha256")
