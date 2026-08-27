#!/usr/bin/env python3
import argparse
import hashlib
import json
import os
import stat
import sys
from pathlib import Path

TASK_PATH = "/root/sealed_inline_control_002"
PARENT_ID = "01a00b52-4879-7c41-a826-7b4609ad3c3b"
MODEL = "gpt-5.4-mini"
EFFORT = "medium"
OBJECTIVE = "RUN|v2|cwd=/mnt/Cursor/PuppetMaster/tests/r9_goal_inline/p02|cmd=PYTHONDONTWRITEBYTECODE=1 python3 -B run.py|then=update_goal_complete_return_INLINE_READY_V2"
INITIAL = "First tool: create_goal with objective `RUN|v2|cwd=/mnt/Cursor/PuppetMaster/tests/r9_goal_inline/p02|cmd=PYTHONDONTWRITEBYTECODE=1 python3 -B run.py|then=update_goal_complete_return_INLINE_READY_V2` exactly. Commentary is permitted. After ACTIVE, remain in the same turn and run that objective command with login=false,yield_ms=10000,max_output_tokens=1000. Then update_goal complete and return exactly INLINE_READY_V2. No other tool, search, read, skill, turn, or parent follow-up."
TOKEN = "INLINE_READY_V2"
CASE_DIR = "/mnt/Cursor/PuppetMaster/tests/r9_goal_inline/p02"
SCRIPT_BYTES = 1258
SCRIPT_SHA256 = "f25a97bf4a1df81335b9c27fed546e2d4b0f18d3414bb656c78d12a81de03807"
ARCHITECTURE = {"bytes": 3090, "mode": "0644", "path": "r9_codex_native_goal_inline_control_probe_002_architecture_v1.json", "sha256": "3833443eb8dce115e181faae7cbf32ab7670b8f88b3d6dce12b2d63e092b96bf"}
FAILURE = {"bytes": 3740, "mode": "0644", "path": "r9_codex_native_goal_inline_control_probe_001_consumed_runtime_failure_receipt_v1.json", "sha256": "0ce5aaf02693168b3bcf073015a1771e214b4a58d971ed755c8c92ad5fe22f36"}


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
    left = (before.st_dev, before.st_ino, before.st_mode, before.st_uid, before.st_size, before.st_mtime_ns)
    right = (after.st_dev, after.st_ino, after.st_mode, after.st_uid, after.st_size, after.st_mtime_ns)
    if left != right:
        raise Invalid("read-drift:" + path.name)
    return raw


def canonical(path):
    raw = read_regular(path, 0o644, 20000)
    if not raw.endswith(b"\n") or raw[:-1].find(b"\n") != -1 or b"\r" in raw:
        raise Invalid("admission-framing")
    value = parse(raw, "admission")
    encoded = json.dumps(value, sort_keys=True, separators=(",", ":"), ensure_ascii=False, allow_nan=False).encode() + b"\n"
    if encoded != raw:
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


def item_turn(payload):
    return payload.get("internal_chat_message_metadata_passthrough", {}).get("turn_id")


def check(admission_path, trace_path):
    c = Counter()
    admission, admission_raw = canonical(admission_path)
    c.require(admission["schema_id"] == "pw-r9-codex-native-goal-inline-control-probe-002-admission-v1", "admission-schema")
    c.require(admission["authority"] == {"canary_launch": False, "control_probe_exactly_once": True, "empirical_subject_launch": False, "matrix_launch": False, "qualification": False, "qualification_credit": 0, "release": False, "subject_call_limit": 0}, "admission-authority")
    launch = {"fork_turns": "none", "initial_message": {"bytes": 482, "sha256": "d99182779204a39f8283afdaea8dc244514332c369dff1e1da1819963d5bb680", "utf8": INITIAL}, "model": MODEL, "objective": {"bytes": 157, "sha256": "cad246eb13689c3d835cd7fd2aaca97347ded02e42ef93ba017006dad61a60f0", "utf8": OBJECTIVE}, "reasoning_effort": EFFORT, "task_name": "sealed_inline_control_002"}
    c.require(admission["launch"] == launch, "admission-launch")
    c.require(admission["expected_stdout"] == {"bytes": 15, "sha256": "93d4927fd806d17cc3ad0075c6968eef065cca92efa985e4533ab369275d7aa4", "utf8": TOKEN}, "admission-output")
    c.require(admission["qualification"] == {"clean_full_matrix_streak": 0, "score": "0/2", "this_probe_cannot_increment_streak": True}, "admission-qualification")
    c.require(admission["bindings"]["architecture"] == ARCHITECTURE and admission["bindings"]["probe_001_failure"] == FAILURE, "lineage-bindings")
    self_raw = Path(__file__).read_bytes()
    expected_self = {"bytes": len(self_raw), "mode": "0644", "path": Path(__file__).name, "sha256": hashlib.sha256(self_raw).hexdigest()}
    c.require(admission["bindings"]["runtime_checker"] == expected_self, "checker-binding")
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
    source = session["source"]["subagent"]["thread_spawn"]
    c.require(source["agent_path"] == TASK_PATH and session["parent_thread_id"] == PARENT_ID, "session")
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
    expected_exec = {"cmd": "PYTHONDONTWRITEBYTECODE=1 python3 -B run.py", "login": False, "max_output_tokens": 1000, "workdir": CASE_DIR, "yield_time_ms": 10000}
    c.require(json.loads(execute["arguments"]) == expected_exec, "exec-arguments")
    c.require(json.loads(update["arguments"]) == {"status": "complete"}, "update-arguments")
    call_turns = [item_turn(payload) for _, _, payload in calls]
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
    messages = payloads(events, "response_item", "message")
    before_complete = [payload for index, _, payload in messages if index < complete_index]
    c.require(all(payload.get("role") == "assistant" and payload.get("phase") == "commentary" and item_turn(payload) == call_turns[0] for payload in before_complete), "commentary-only-before-complete")
    between = [payload for index, _, payload in messages if active_index < index < exec_index]
    c.require(all(payload.get("role") == "assistant" and payload.get("phase") == "commentary" for payload in between), "commentary-tolerated-between-active-and-exec")
    c.require(not any(payload.get("phase") == "final_answer" for index, _, payload in messages if index < complete_index), "no-final-before-complete")
    root_messages = [payload for _, _, payload in payloads(events, "response_item", "agent_message") if payload.get("author") == "/root"]
    c.require(len(root_messages) == 1 and root_messages[0].get("recipient") == TASK_PATH, "one-parent-message")
    c.require(any(item.get("type") == "encrypted_content" for item in root_messages[0].get("content", [])), "encrypted-initial-nonclaim")
    finals = [payload["message"] for _, _, payload in payloads(events, "event_msg", "agent_message") if payload.get("phase") == "final_answer"]
    c.require(finals == [TOKEN], "final")
    c.require(task_complete[0][2]["last_agent_message"] == TOKEN and complete_index < task_complete[0][0], "task-terminal")
    c.require(TOKEN.encode() in trace_raw and b"OUTCOME:" not in trace_raw and b"packet.txt" not in trace_raw, "zero-subject-trace")
    return c.value, admission_raw, trace_raw, thread_id, active_time, exec_time, complete_time, complete["goal"], len(between)


def emit(status, mismatch, assertions=0, facts=None):
    value = {"assertion_count": assertions, "facts": facts, "first_mismatch": mismatch, "qualification_credit": 0, "schema_id": "pw-r9-codex-native-goal-inline-control-probe-002-runtime-check-v1", "status": status, "workspace_writes": 0}
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
        assertions, admission_raw, trace_raw, thread_id, active_at, exec_at, complete_at, goal, commentary_count = check(Path(args.admission), Path(args.trace))
    except (Invalid, OSError, KeyError, IndexError, TypeError, ValueError, json.JSONDecodeError) as exc:
        emit("FAIL", str(exc))
        return 1
    facts = {"admission_bytes": len(admission_raw), "admission_sha256": hashlib.sha256(admission_raw).hexdigest(), "commentary_between_active_and_exec": commentary_count, "exec_at": exec_at, "goal_active_at": active_at, "goal_complete_at": complete_at, "goal_thread_id": thread_id, "goal_time_used_seconds": goal["timeUsedSeconds"], "goal_tokens_used": goal["tokensUsed"], "subject_bytes": 0, "trace_bytes": len(trace_raw), "trace_sha256": hashlib.sha256(trace_raw).hexdigest()}
    emit("PASS_MECHANICAL_INLINE_GOAL_CONTROL_002_RUNTIME_ZERO_CREDIT", None, assertions, facts)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
