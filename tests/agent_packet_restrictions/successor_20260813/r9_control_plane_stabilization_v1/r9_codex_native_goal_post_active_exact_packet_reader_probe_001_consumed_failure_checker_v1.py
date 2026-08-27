#!/usr/bin/env python3
import argparse
import hashlib
import json
import os
import stat
import sys
from pathlib import Path

ADMISSION_BYTES = 4048
ADMISSION_SHA256 = "8060be2a39e2fafd154fe39d46bec4563f2a03233ad7e63459de126fafc2106e"
TRACE_BYTES = 220999
TRACE_SHA256 = "4c8e4a67c08217b352f8ea885712397980769e65b42a5637d9d8167951e9c1ea"
PACKET_BYTES = 486
PACKET_SHA256 = "0c9041ea70a5c97a785682402e22149c56a663fefae915f1a14500cc70463ee2"
READER_BYTES = 4830
READER_SHA256 = "5dd91d04f5a1a3ff831697a958d4b027c88a665329e4477a1bf549edb2d17e4a"
THREAD_ID = "01a03068-3ead-7560-b788-05b49ea34004"
TASK_PATH = "/root/sealed_packet_reader_001"
OBJECTIVE = "sealed:v3:c005b00002;no-retry"
EXPECTED = "invalidate_and_repeat_owner_checks"
ADMITTED_MODEL = "gpt-5.4-mini"
ACTUAL_MODEL = "gpt-5.4"
CASE_DIR = "/mnt/Cursor/PuppetMaster/tests/r9_goal_packet/q10"
FOLLOW = "RUN|v1|cmd=PYTHONDONTWRITEBYTECODE=1 python3 -B read_packet.py|cwd=/mnt/Cursor/PuppetMaster/tests/r9_goal_packet/q10|yield_ms=10000|login=false|max_output_tokens=4000|stdout_bytes=486|stdout_sha256=0c9041ea70a5c97a785682402e22149c56a663fefae915f1a14500cc70463ee2|then=solve_update_current_goal_complete_return_OUTCOME"


class Invalid(Exception):
    pass


class Counter:
    def __init__(self):
        self.value = 0

    def require(self, condition, mismatch):
        self.value += 1
        if not condition:
            raise Invalid(mismatch)


def _constant(value):
    raise Invalid("nonfinite-json:" + value)


def _pairs(items):
    value = {}
    for key, item in items:
        if key in value:
            raise Invalid("duplicate-key:" + key)
        value[key] = item
    return value


def parse_json(raw, name):
    try:
        return json.loads(raw.decode("utf-8"), object_pairs_hook=_pairs, parse_constant=_constant)
    except (UnicodeDecodeError, json.JSONDecodeError, Invalid) as exc:
        raise Invalid("json:" + name) from exc


def read_regular(path, expected_mode, expected_bytes, expected_sha256):
    before = path.stat(follow_symlinks=False)
    if not stat.S_ISREG(before.st_mode) or stat.S_IMODE(before.st_mode) != expected_mode or before.st_uid != os.getuid():
        raise Invalid("custody:" + path.name)
    raw = path.read_bytes()
    after = path.stat(follow_symlinks=False)
    identity = lambda info: (info.st_dev, info.st_ino, info.st_mode, info.st_uid, info.st_size, info.st_mtime_ns)
    if identity(before) != identity(after):
        raise Invalid("read-drift:" + path.name)
    if len(raw) != expected_bytes or hashlib.sha256(raw).hexdigest() != expected_sha256:
        raise Invalid("identity:" + path.name)
    return raw


def canonical(path):
    raw = read_regular(path, 0o644, ADMISSION_BYTES, ADMISSION_SHA256)
    if not raw.endswith(b"\n") or raw[:-1].find(b"\n") != -1 or b"\r" in raw:
        raise Invalid("admission-framing")
    value = parse_json(raw, "admission")
    encoded = json.dumps(value, sort_keys=True, separators=(",", ":"), ensure_ascii=False, allow_nan=False).encode() + b"\n"
    if encoded != raw:
        raise Invalid("admission-canonical")
    return value


def parse_trace(path):
    raw = read_regular(path, 0o664, TRACE_BYTES, TRACE_SHA256)
    if not raw.endswith(b"\n") or b"\r" in raw:
        raise Invalid("trace-framing")
    events = []
    for index, line in enumerate(raw.splitlines(keepends=True)):
        if line == b"\n" or not line.endswith(b"\n"):
            raise Invalid("trace-line:" + str(index))
        events.append(parse_json(line[:-1], "trace:" + str(index)))
    return events, raw


def payloads(events, event_type, payload_type=None):
    values = []
    for event in events:
        payload = event.get("payload")
        if event.get("type") != event_type or not isinstance(payload, dict):
            continue
        if payload_type is None or payload.get("type") == payload_type:
            values.append((event["timestamp"], payload))
    return values


def message_text(payload):
    return "".join(item.get("text", "") for item in payload.get("content", []) if item.get("type") in {"input_text", "output_text"})


def check(admission_path, trace_path):
    c = Counter()
    admission = canonical(admission_path)
    c.require(admission["schema_id"] == "pw-r9-codex-native-goal-post-active-exact-packet-reader-probe-admission-v1", "admission-schema")
    c.require(admission["launch"]["model"] == ADMITTED_MODEL and admission["launch"]["reasoning_effort"] == "medium", "admitted-route")
    c.require(admission["launch"]["task_name"] == "sealed_packet_reader_001" and admission["launch"]["fork_turns"] == "none", "admitted-task")
    c.require(admission["runtime_fail_closed"]["any_mismatch"] == "CONSUME THIS TASK AND ATOM PERMANENTLY WITH ZERO CREDIT", "fail-closed")
    c.require(admission["runtime_fail_closed"]["retry_relaunch_replacement_best_of_resend_substitution_or_reuse"] is False, "no-retry")
    c.require(admission["qualification"] == {"clean_full_matrix_streak": 0, "score": "0/2", "this_probe_cannot_increment_streak": True}, "qualification")
    base = admission_path.parent
    packet_path = Path(CASE_DIR) / "packet.txt"
    reader_path = Path(CASE_DIR) / "read_packet.py"
    packet = read_regular(packet_path, 0o444, PACKET_BYTES, PACKET_SHA256)
    read_regular(reader_path, 0o644, READER_BYTES, READER_SHA256)
    c.require(admission["bindings"]["packet"] == {"bytes": PACKET_BYTES, "mode": "0444", "path": "tests/r9_goal_packet/q10/packet.txt", "sha256": PACKET_SHA256}, "packet-binding")
    c.require(admission["bindings"]["reader"] == {"bytes": READER_BYTES, "mode": "0644", "path": "tests/r9_goal_packet/q10/read_packet.py", "sha256": READER_SHA256}, "reader-binding")
    c.require((base / admission["bindings"]["runtime_checker"]["path"]).is_file(), "original-runtime-checker-preserved")
    events, trace_raw = parse_trace(trace_path)
    sessions = payloads(events, "session_meta")
    c.require(len(sessions) == 1, "session-count")
    session = sessions[0][1]
    c.require(session["id"] == THREAD_ID and session["parent_thread_id"] == "01a00b52-4879-7c41-a826-7b4609ad3c3b", "session-identity")
    c.require(session["source"]["subagent"]["thread_spawn"]["agent_path"] == TASK_PATH, "task-path")
    contexts = payloads(events, "turn_context")
    c.require(len(contexts) == 2, "turn-context-count")
    c.require(all(value[1]["model"] == ACTUAL_MODEL and value[1]["effort"] == "medium" for value in contexts), "actual-route")
    c.require(ACTUAL_MODEL != ADMITTED_MODEL, "route-mismatch-present")
    calls = payloads(events, "response_item", "function_call")
    names = [payload["name"] for _, payload in calls]
    c.require(names == ["create_goal", "exec_command", "exec_command", "exec_command", "exec_command", "update_goal"], "call-sequence")
    create_time, create = calls[0]
    exec_calls = calls[1:5]
    update_time, update = calls[5]
    c.require(json.loads(create["arguments"]) == {"objective": OBJECTIVE}, "create-arguments")
    expected_exec = [
        {"cmd": "rg -n \"c005b00002|sealed:v3|no-retry\" /mnt/Cursor/PuppetMaster", "max_output_tokens": 12000, "workdir": "/mnt/Cursor/PuppetMaster", "yield_time_ms": 1000},
        {"cmd": "rg --files /mnt/Cursor/PuppetMaster | rg \"sealed|packet|goal|c005b\"", "max_output_tokens": 12000, "workdir": "/mnt/Cursor/PuppetMaster", "yield_time_ms": 1000},
        {"cmd": "sed -n '1,200p' /mnt/Cursor/PuppetMaster/tests/r9_goal_packet/q10/read_packet.py", "max_output_tokens": 4000, "workdir": "/mnt/Cursor/PuppetMaster", "yield_time_ms": 1000},
        {"cmd": "sed -n '1,120p' /mnt/Cursor/PuppetMaster/tests/r9_goal_packet/q10/packet.txt", "max_output_tokens": 4000, "workdir": "/mnt/Cursor/PuppetMaster", "yield_time_ms": 1000},
    ]
    c.require([json.loads(payload["arguments"]) for _, payload in exec_calls] == expected_exec, "autonomous-read-arguments")
    c.require(json.loads(update["arguments"]) == {"status": "complete"}, "update-arguments")
    outputs = {payload["call_id"]: (timestamp, payload["output"]) for timestamp, payload in payloads(events, "response_item", "function_call_output")}
    c.require(set(outputs) == {payload["call_id"] for _, payload in calls}, "output-correlation")
    active_time, active_raw = outputs[create["call_id"]]
    active = json.loads(active_raw)
    c.require(active["goal"]["threadId"] == THREAD_ID and active["goal"]["objective"] == OBJECTIVE and active["goal"]["status"] == "active", "active-receipt")
    complete_time, complete_raw = outputs[update["call_id"]]
    complete = json.loads(complete_raw)
    c.require(complete["goal"]["threadId"] == THREAD_ID and complete["goal"]["objective"] == OBJECTIVE and complete["goal"]["status"] == "complete", "complete-receipt")
    c.require(complete["goal"]["tokensUsed"] == 44463 and complete["goal"]["timeUsedSeconds"] == 20, "complete-usage")
    task_started = payloads(events, "event_msg", "task_started")
    task_complete = payloads(events, "event_msg", "task_complete")
    c.require(len(task_started) == 2 and len(task_complete) == 2, "goal-auto-continuation-turn-count")
    c.require(task_complete[0][1]["last_agent_message"] == "ACTIVE" and task_complete[1][1]["last_agent_message"] == "ABORTED", "turn-terminals")
    users = [(timestamp, payload) for timestamp, payload in payloads(events, "response_item", "message") if payload.get("role") == "user"]
    goal_contexts = [(timestamp, message_text(payload)) for timestamp, payload in users if '<codex_internal_context source="goal">' in message_text(payload)]
    c.require(len(goal_contexts) == 1 and "<objective>\n" + OBJECTIVE + "\n</objective>" in goal_contexts[0][1], "automatic-goal-context")
    root_messages = [(timestamp, payload) for timestamp, payload in payloads(events, "response_item", "agent_message") if payload.get("author") == "/root"]
    c.require(len(root_messages) == 2 and all(payload.get("recipient") == TASK_PATH for _, payload in root_messages), "root-message-count")
    c.require(all(any(item.get("type") == "encrypted_content" for item in payload.get("content", [])) for _, payload in root_messages), "encrypted-parent-messages")
    cleanup_time = root_messages[1][0]
    c.require(all(outputs[payload["call_id"]][0] < cleanup_time for _, payload in exec_calls), "reads-before-cleanup")
    c.require(create_time < active_time < task_complete[0][0] < task_started[1][0] <= goal_contexts[0][0] < exec_calls[0][0] < cleanup_time < update_time < complete_time, "lifecycle-order")
    fourth_output = outputs[exec_calls[3][1]["call_id"]][1]
    c.require("Output:\n" in fourth_output and fourth_output.split("Output:\n", 1)[1].encode("utf-8") == packet, "packet-exposed-exact")
    c.require(EXPECTED in trace_raw.decode("utf-8"), "scored-answer-visible")
    c.require(FOLLOW.encode("utf-8") not in trace_raw, "admitted-followup-not-delivered")
    finals = [(timestamp, payload["message"]) for timestamp, payload in payloads(events, "event_msg", "agent_message") if payload.get("phase") == "final_answer"]
    c.require([message for _, message in finals] == ["ACTIVE", "ABORTED"], "final-sequence")
    c.require(complete_time < finals[-1][0] <= task_complete[-1][0], "abort-terminal-order")
    return c.value, trace_raw, active_time, goal_contexts[0][0], cleanup_time, complete_time


def emit(status, mismatch, assertions=0, facts=None):
    value = {
        "assertion_count": assertions,
        "facts": facts,
        "first_mismatch": mismatch,
        "qualification_credit": 0,
        "schema_id": "pw-r9-codex-native-goal-post-active-exact-packet-reader-probe-consumed-failure-check-v1",
        "status": status,
        "workspace_writes": 0,
    }
    sys.stdout.write(json.dumps(value, sort_keys=True, separators=(",", ":")) + "\n")


def main():
    parser = argparse.ArgumentParser(add_help=False)
    parser.add_argument("--admission")
    parser.add_argument("--trace")
    parser.add_argument("--check", action="store_true")
    args, extras = parser.parse_known_args()
    if extras or not args.check or not args.admission or not args.trace or not os.path.isabs(args.admission) or not os.path.isabs(args.trace):
        emit("FAIL", "CLI must be --admission ABS --trace ABS --check")
        return 1
    try:
        assertions, trace_raw, active_at, continuation_at, cleanup_at, complete_at = check(Path(args.admission), Path(args.trace))
    except (Invalid, OSError, KeyError, IndexError, TypeError, ValueError, json.JSONDecodeError) as exc:
        emit("FAIL", str(exc))
        return 1
    facts = {
        "actual_model": ACTUAL_MODEL,
        "admitted_model": ADMITTED_MODEL,
        "admitted_subject_followup_delivered": False,
        "automatic_goal_continuation_at": continuation_at,
        "cleanup_at": cleanup_at,
        "goal_active_at": active_at,
        "goal_complete_at": complete_at,
        "goal_thread_id": THREAD_ID,
        "packet_subject_visible_before_cleanup": True,
        "task_path": TASK_PATH,
        "trace_bytes": len(trace_raw),
        "trace_sha256": hashlib.sha256(trace_raw).hexdigest(),
    }
    emit("PASS_MECHANICAL_CONSUMED_FAILURE_CONFIRMED_ZERO_CREDIT", "ROUTE_MISMATCH_THEN_GOAL_AUTOCONTINUATION_PRE_ADMITTED_PACKET_READ", assertions, facts)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
