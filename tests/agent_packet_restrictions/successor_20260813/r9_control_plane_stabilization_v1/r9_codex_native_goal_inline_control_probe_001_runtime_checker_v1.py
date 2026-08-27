#!/usr/bin/env python3
import argparse
import hashlib
import json
import os
import stat
import sys
from pathlib import Path

TASK_PATH = "/root/sealed_inline_control_001"
MODEL = "gpt-5.4-mini"
EFFORT = "medium"
OBJECTIVE = "RUN|v1|cwd=/mnt/Cursor/PuppetMaster/tests/r9_goal_inline/p01|cmd=PYTHONDONTWRITEBYTECODE=1 python3 -B run.py|then=update_goal_complete_return_INLINE_READY"
INITIAL = "First tool: create_goal with objective `RUN|v1|cwd=/mnt/Cursor/PuppetMaster/tests/r9_goal_inline/p01|cmd=PYTHONDONTWRITEBYTECODE=1 python3 -B run.py|then=update_goal_complete_return_INLINE_READY` exactly. After ACTIVE, do not end the turn; immediately run that objective command with login=false,yield_ms=10000,max_output_tokens=1000. Then update_goal complete and return exactly INLINE_READY. No other tool, search, read, skill, or message."
TOKEN = "INLINE_READY"
CASE_DIR = "/mnt/Cursor/PuppetMaster/tests/r9_goal_inline/p01"
SCRIPT_BYTES = 1255
SCRIPT_SHA256 = "7a3615208f22407c6721a720c6ab9e4552a3408be5e01daeea2889f2c057ae0f"


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
    result = {}
    for key, value in items:
        if key in result:
            raise Invalid("duplicate-key:" + key)
        result[key] = value
    return result


def parse(raw, name):
    try:
        return json.loads(raw.decode("utf-8"), object_pairs_hook=_pairs, parse_constant=_constant)
    except (UnicodeDecodeError, json.JSONDecodeError, Invalid) as exc:
        raise Invalid("json:" + name) from exc


def read_regular(path, mode, cap):
    before = path.stat(follow_symlinks=False)
    if not stat.S_ISREG(before.st_mode) or stat.S_IMODE(before.st_mode) != mode or before.st_uid != os.getuid() or before.st_size > cap:
        raise Invalid("custody:" + path.name)
    raw = path.read_bytes()
    after = path.stat(follow_symlinks=False)
    if (before.st_dev, before.st_ino, before.st_mode, before.st_uid, before.st_size, before.st_mtime_ns) != (after.st_dev, after.st_ino, after.st_mode, after.st_uid, after.st_size, after.st_mtime_ns):
        raise Invalid("read-drift:" + path.name)
    return raw


def canonical(path):
    raw = read_regular(path, 0o644, 20000)
    if not raw.endswith(b"\n") or raw[:-1].find(b"\n") != -1 or b"\r" in raw:
        raise Invalid("admission-framing")
    value = parse(raw, "admission")
    if json.dumps(value, sort_keys=True, separators=(",", ":"), ensure_ascii=False, allow_nan=False).encode() + b"\n" != raw:
        raise Invalid("admission-canonical")
    return value, raw


def trace(path):
    raw = read_regular(path, 0o664, 500000)
    if not raw.endswith(b"\n") or b"\r" in raw:
        raise Invalid("trace-framing")
    events = []
    for index, line in enumerate(raw.splitlines(keepends=True)):
        if line == b"\n" or not line.endswith(b"\n"):
            raise Invalid("trace-line:" + str(index))
        events.append(parse(line[:-1], "trace:" + str(index)))
    return events, raw


def payloads(events, event_type, payload_type=None):
    values = []
    for index, event in enumerate(events):
        payload = event.get("payload")
        if event.get("type") != event_type or not isinstance(payload, dict):
            continue
        if payload_type is None or payload.get("type") == payload_type:
            values.append((index, event["timestamp"], payload))
    return values


def turn_id(payload):
    return payload.get("internal_chat_message_metadata_passthrough", {}).get("turn_id")


def check(admission_path, trace_path):
    c = Counter()
    admission, admission_raw = canonical(admission_path)
    c.require(admission["schema_id"] == "pw-r9-codex-native-goal-inline-control-probe-001-admission-v1", "admission-schema")
    c.require(admission["authority"] == {"canary_launch": False, "control_probe_exactly_once": True, "empirical_subject_launch": False, "matrix_launch": False, "qualification": False, "qualification_credit": 0, "release": False, "subject_call_limit": 0}, "admission-authority")
    c.require(admission["launch"] == {"fork_turns": "none", "initial_message": {"bytes": 441, "sha256": "b51b57793698af3a4b1cd09c0d031ae9ce16f6206ce3696286cc766cdea3eb9b", "utf8": INITIAL}, "model": MODEL, "objective": {"bytes": 154, "sha256": "1add5db74379387f26b594eedabe650a84e51d43f09d67018afd90785efb2778", "utf8": OBJECTIVE}, "reasoning_effort": EFFORT, "task_name": "sealed_inline_control_001"}, "admission-launch")
    c.require(admission["expected_stdout"] == {"bytes": 12, "sha256": "4bb014c8a11d13b08a9cf07035885ae4250af0bb80f6546cc2b6533d20b7a1a9", "utf8": TOKEN}, "admission-output")
    c.require(admission["qualification"] == {"clean_full_matrix_streak": 0, "score": "0/2", "this_probe_cannot_increment_streak": True}, "admission-qualification")
    self_raw = Path(__file__).read_bytes()
    c.require(admission["bindings"]["runtime_checker"] == {"bytes": len(self_raw), "mode": "0644", "path": Path(__file__).name, "sha256": hashlib.sha256(self_raw).hexdigest()}, "checker-binding")
    script = read_regular(Path(CASE_DIR) / "run.py", 0o644, SCRIPT_BYTES)
    c.require(len(script) == SCRIPT_BYTES and hashlib.sha256(script).hexdigest() == SCRIPT_SHA256, "script-identity")
    root = Path(CASE_DIR).stat(follow_symlinks=False)
    c.require(stat.S_ISDIR(root.st_mode) and stat.S_IMODE(root.st_mode) == 0o700 and root.st_uid == os.getuid(), "case-custody")
    c.require(os.listdir(CASE_DIR) == ["run.py"], "case-inventory")
    events, trace_raw = trace(trace_path)
    sessions = payloads(events, "session_meta")
    c.require(len(sessions) == 1, "session-count")
    session = sessions[0][2]
    thread_id = session["id"]
    c.require(session["source"]["subagent"]["thread_spawn"]["agent_path"] == TASK_PATH and session["parent_thread_id"] == "01a00b52-4879-7c41-a826-7b4609ad3c3b", "session")
    contexts = payloads(events, "turn_context")
    c.require(len(contexts) == 1 and contexts[0][2]["model"] == MODEL and contexts[0][2]["effort"] == EFFORT, "route")
    task_started = payloads(events, "event_msg", "task_started")
    task_complete = payloads(events, "event_msg", "task_complete")
    c.require(len(task_started) == 1 and len(task_complete) == 1, "single-turn")
    calls = payloads(events, "response_item", "function_call")
    c.require([payload["name"] for _, _, payload in calls] == ["create_goal", "exec_command", "update_goal"], "call-sequence")
    create_index, create_time, create = calls[0]
    exec_index, exec_time, execute = calls[1]
    update_index, update_time, update = calls[2]
    c.require(json.loads(create["arguments"]) == {"objective": OBJECTIVE}, "create-arguments")
    c.require(json.loads(execute["arguments"]) == {"cmd": "PYTHONDONTWRITEBYTECODE=1 python3 -B run.py", "login": False, "max_output_tokens": 1000, "workdir": CASE_DIR, "yield_time_ms": 10000}, "exec-arguments")
    c.require(json.loads(update["arguments"]) == {"status": "complete"}, "update-arguments")
    call_turns = [turn_id(payload) for _, _, payload in calls]
    c.require(len(set(call_turns)) == 1 and call_turns[0] == contexts[0][2]["turn_id"], "one-turn-id")
    outputs = {payload["call_id"]: (index, timestamp, payload) for index, timestamp, payload in payloads(events, "response_item", "function_call_output")}
    c.require(set(outputs) == {payload["call_id"] for _, _, payload in calls}, "outputs")
    active_index, active_time, active_payload = outputs[create["call_id"]]
    active = json.loads(active_payload["output"])
    c.require(active["goal"]["threadId"] == thread_id and active["goal"]["objective"] == OBJECTIVE and active["goal"]["status"] == "active", "active")
    exec_output_index, exec_output_time, exec_payload = outputs[execute["call_id"]]
    c.require("Process exited with code 0" in exec_payload["output"] and exec_payload["output"].endswith("Output:\n" + TOKEN), "exec-output")
    complete_index, complete_time, complete_payload = outputs[update["call_id"]]
    complete = json.loads(complete_payload["output"])
    c.require(complete["goal"]["threadId"] == thread_id and complete["goal"]["objective"] == OBJECTIVE and complete["goal"]["status"] == "complete", "complete")
    c.require(create_index < active_index < exec_index < exec_output_index < update_index < complete_index, "tool-order")
    c.require(create_time < active_time < exec_time < exec_output_time < update_time < complete_time, "time-order")
    messages_between = [payload for index, _, payload in payloads(events, "response_item", "message") if active_index < index < exec_index]
    c.require(messages_between == [], "no-message-between-active-and-exec")
    root_messages = [payload for _, _, payload in payloads(events, "response_item", "agent_message") if payload.get("author") == "/root"]
    c.require(len(root_messages) == 1 and root_messages[0].get("recipient") == TASK_PATH, "one-parent-message")
    c.require(any(item.get("type") == "encrypted_content" for item in root_messages[0].get("content", [])), "encrypted-initial-nonclaim")
    finals = [payload["message"] for _, _, payload in payloads(events, "event_msg", "agent_message") if payload.get("phase") == "final_answer"]
    c.require(finals == [TOKEN], "final")
    c.require(task_complete[0][2]["last_agent_message"] == TOKEN, "task-terminal")
    c.require(complete_index < task_complete[0][0], "complete-before-task-terminal")
    c.require(TOKEN.encode() in trace_raw and b"OUTCOME:" not in trace_raw, "zero-subject-trace")
    return c.value, admission_raw, trace_raw, thread_id, active_time, exec_time, complete_time, complete["goal"]


def emit(status, mismatch, assertions=0, facts=None):
    value = {"assertion_count": assertions, "facts": facts, "first_mismatch": mismatch, "qualification_credit": 0, "schema_id": "pw-r9-codex-native-goal-inline-control-probe-001-runtime-check-v1", "status": status, "workspace_writes": 0}
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
        assertions, admission_raw, trace_raw, thread_id, active_at, exec_at, complete_at, goal = check(Path(args.admission), Path(args.trace))
    except (Invalid, OSError, KeyError, IndexError, TypeError, ValueError, json.JSONDecodeError) as exc:
        emit("FAIL", str(exc))
        return 1
    facts = {"admission_bytes": len(admission_raw), "admission_sha256": hashlib.sha256(admission_raw).hexdigest(), "exec_at": exec_at, "goal_active_at": active_at, "goal_complete_at": complete_at, "goal_thread_id": thread_id, "goal_time_used_seconds": goal["timeUsedSeconds"], "goal_tokens_used": goal["tokensUsed"], "subject_bytes": 0, "trace_bytes": len(trace_raw), "trace_sha256": hashlib.sha256(trace_raw).hexdigest()}
    emit("PASS_MECHANICAL_INLINE_GOAL_CONTROL_RUNTIME_ZERO_CREDIT", None, assertions, facts)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
