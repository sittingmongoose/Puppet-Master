#!/usr/bin/env python3
import argparse
import copy
import hashlib
import json
import os
import re
import stat
import sys
from pathlib import Path

BASE = Path("/mnt/Cursor/PuppetMaster")
DIR = BASE / "tests/agent_packet_restrictions/successor_20260813/r9_control_plane_stabilization_v1"
ROOT = BASE / "tests/r9_goal_microcase/q13"
SOURCE = DIR / "codex_native_goal_direct_canary_002_public_plan_v1/cells/cell-006/slot-bravo.json"
TASK = "/root/sealed_microcase_q13_001"
PARENT = "01a00b52-4879-7c41-a826-7b4609ad3c3b"
MODEL = "gpt-5.4-mini"
EFFORT = "medium"
OBJECTIVE = "CASE|q13|show_record|once"
INITIAL = "First call create_goal with objective CASE|q13|show_record|once. After its ACTIVE result, in the same turn run PYTHONDONTWRITEBYTECODE=1 python3 -B show.py in /mnt/Cursor/PuppetMaster/tests/r9_goal_microcase/q13 with login=false, yield_time_ms=10000, and max_output_tokens=1000. Read the shown case and run PYTHONDONTWRITEBYTECODE=1 python3 -B record.py <TOKEN> with the same controls. Then call update_goal complete. Use exactly those four function calls."
SHOW = {"cmd": "PYTHONDONTWRITEBYTECODE=1 python3 -B show.py", "login": False, "max_output_tokens": 1000, "workdir": str(ROOT), "yield_time_ms": 10000}
RECORD_PREFIX = "PYTHONDONTWRITEBYTECODE=1 python3 -B record.py "
SOURCE_BYTES = 126606
SOURCE_SHA256 = "01a561826b9f249b8de13e9fa40d5cbfb18c6fef972b5eed768c0fe6b7770a9e"
FILES = {
    "case.txt": (408, 0o444, "a9d7ede45d433c9273015b44d6a47762d80eecfc6ff02d69cdd594964cf538dd"),
    "record.py": (2778, 0o644, "8b256a8250d6a2b71b7b4a4ec5192d573d9439284a66450bb91805d20e22fd59"),
    "show.py": (3975, 0o644, "b7ec671bc3e5745921d2b37cd9f362cb5ab5cfba2d7a291e05844a0fceb8b83e"),
}


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


def read_file(path, mode, cap, size=None, digest=None):
    before = path.stat(follow_symlinks=False)
    if not stat.S_ISREG(before.st_mode) or stat.S_IMODE(before.st_mode) != mode or before.st_uid != os.getuid() or before.st_nlink != 1 or before.st_size > cap:
        raise Invalid("custody:" + path.name)
    raw = path.read_bytes()
    after = path.stat(follow_symlinks=False)
    left = (before.st_dev, before.st_ino, before.st_mode, before.st_uid, before.st_size, before.st_mtime_ns)
    right = (after.st_dev, after.st_ino, after.st_mode, after.st_uid, after.st_size, after.st_mtime_ns)
    if left != right:
        raise Invalid("read-drift:" + path.name)
    if size is not None and (len(raw) != size or hashlib.sha256(raw).hexdigest() != digest):
        raise Invalid("identity:" + path.name)
    return raw


def canonical(path):
    raw = read_file(path, 0o644, 30000)
    if not raw.endswith(b"\n") or raw[:-1].find(b"\n") != -1 or b"\r" in raw:
        raise Invalid("admission-framing")
    value = parse(raw, "admission")
    encoded = json.dumps(value, sort_keys=True, separators=(",", ":"), ensure_ascii=False, allow_nan=False).encode() + b"\n"
    if encoded != raw:
        raise Invalid("admission-canonical")
    return value, raw


def trace(path):
    raw = read_file(path, 0o664, 500000)
    if not raw.endswith(b"\n") or b"\r" in raw:
        raise Invalid("trace-framing")
    events = []
    for index, line in enumerate(raw.splitlines(keepends=True)):
        if line == b"\n" or not line.endswith(b"\n"):
            raise Invalid("trace-line:" + str(index))
        events.append(parse(line[:-1], "trace:" + str(index)))
    return events, raw


def items(events, event_type, payload_type=None):
    result = []
    for index, event in enumerate(events):
        payload = event.get("payload")
        if event.get("type") == event_type and isinstance(payload, dict) and (payload_type is None or payload.get("type") == payload_type):
            result.append((index, event.get("timestamp"), payload))
    return result


def turn(payload):
    return payload.get("internal_chat_message_metadata_passthrough", {}).get("turn_id")


def derive(source_raw, case_raw):
    source = parse(source_raw, "source")
    nodes = [node for node in source["nodes"] if node.get("atom_id") == "n00003"]
    if len(nodes) != 1:
        raise Invalid("source-node")
    node = nodes[0]
    if node.get("atom_nonce") != "2086cefe3e4aa1cb41aa4da9508035f51ac93d4cf6ea87756b83a1da4f8fcca4" or node.get("attempt_id") != "2389b5d3a920da3d3ab1a9ae":
        raise Invalid("source-id")
    body = node["subject_atom"]["utf8"].encode()
    if len(body) != 286 or hashlib.sha256(body).hexdigest() != "0bb8a633bc96451e95fb6f1af6fed622347c80a8f000602e0c3bd49b40a827db" or case_raw.split(b"\n")[1] != body:
        raise Invalid("source-case")
    wrapper = parse(body, "body")
    payload = parse(wrapper["p"].encode(), "payload")
    if set(payload) != {"op", "t", "x"} or payload["op"] != "label" or payload["t"] != "options" or not isinstance(payload["x"], str):
        raise Invalid("source-payload")
    if re.fullmatch(r"[A-Za-z0-9._:-]{1,48}", payload["x"]) is None:
        raise Invalid("source-token")
    return payload["x"], body


def event_contract(events, case_raw, answer):
    c = Counter()
    sessions = items(events, "session_meta")
    c.require(len(sessions) == 1, "session-count")
    session = sessions[0][2]
    thread_id = session["id"]
    c.require(session["parent_thread_id"] == PARENT and session["source"]["subagent"]["thread_spawn"]["agent_path"] == TASK, "session")
    contexts = items(events, "turn_context")
    c.require(len(contexts) == 1 and contexts[0][2]["model"] == MODEL and contexts[0][2]["effort"] == EFFORT, "route")
    started = items(events, "event_msg", "task_started")
    completed = items(events, "event_msg", "task_complete")
    c.require(len(started) == 1 and len(completed) == 1, "task-lifecycle")
    calls = items(events, "response_item", "function_call")
    c.require([payload["name"] for _, _, payload in calls] == ["create_goal", "exec_command", "exec_command", "update_goal"], "call-order")
    create_i, create_t, create = calls[0]
    show_i, show_t, show = calls[1]
    record_i, record_t, record = calls[2]
    update_i, update_t, update = calls[3]
    c.require(json.loads(create["arguments"]) == {"objective": OBJECTIVE}, "create-args")
    c.require(json.loads(show["arguments"]) == SHOW, "show-args")
    expected_record = {"cmd": RECORD_PREFIX + answer, "login": False, "max_output_tokens": 1000, "workdir": str(ROOT), "yield_time_ms": 10000}
    c.require(json.loads(record["arguments"]) == expected_record, "record-args")
    c.require(json.loads(update["arguments"]) == {"status": "complete"}, "update-args")
    turns = [turn(payload) for _, _, payload in calls]
    c.require(len(set(turns)) == 1 and turns[0] == contexts[0][2]["turn_id"], "same-turn")
    outputs = {payload["call_id"]: (index, timestamp, payload) for index, timestamp, payload in items(events, "response_item", "function_call_output")}
    c.require(set(outputs) == {payload["call_id"] for _, _, payload in calls}, "outputs")
    active_i, active_t, active_output = outputs[create["call_id"]]
    active = json.loads(active_output["output"])["goal"]
    c.require(active["threadId"] == thread_id and active["objective"] == OBJECTIVE and active["status"] == "active", "active")
    show_o_i, show_o_t, show_output = outputs[show["call_id"]]
    c.require("Output:\n" in show_output["output"] and show_output["output"].rsplit("Output:\n", 1)[1].encode() == case_raw, "show-output")
    record_o_i, record_o_t, record_output = outputs[record["call_id"]]
    c.require("Process exited with code 0" in record_output["output"] and record_output["output"].endswith("Output:\nDONE"), "record-output")
    complete_i, complete_t, complete_output = outputs[update["call_id"]]
    goal = json.loads(complete_output["output"])["goal"]
    c.require(goal["threadId"] == thread_id and goal["objective"] == OBJECTIVE and goal["status"] == "complete", "complete")
    c.require(create_i < active_i < show_i < show_o_i < record_i < record_o_i < update_i < complete_i < completed[0][0], "event-order")
    c.require(create_t < active_t < show_t < show_o_t < record_t < record_o_t < update_t < complete_t, "time-order")
    c.require(completed[0][2]["turn_id"] == contexts[0][2]["turn_id"] and completed[0][0] == len(events) - 1, "terminal-order")
    return c.value, thread_id, goal


def expected_launch():
    return {
        "fork_turns": "none",
        "initial_message": {"bytes": 456, "sha256": "4717df7017833b04d2e2379584fae0546c6d12a068521e2c8f9178c5550b261e", "utf8": INITIAL},
        "model": MODEL,
        "objective": {"bytes": 25, "sha256": "523dc39343d5514e0baeb1f6bd7b500e642c07c7a99f9cc14eb9123cef977fc1", "utf8": OBJECTIVE},
        "reasoning_effort": EFFORT,
        "task_name": "sealed_microcase_q13_001",
    }


def check(admission_path, trace_path):
    c = Counter()
    admission, admission_raw = canonical(admission_path)
    c.require(admission["schema_id"] == "pw-r9-codex-native-goal-tool-event-microcase-q13-admission-v1", "admission-schema")
    authority = {"canary_launch": False, "matrix_launch": False, "microcase_launch_exactly_once": True, "qualification": False, "qualification_credit": 0, "release": False}
    c.require(admission["authority"] == authority, "authority")
    c.require(admission["launch"] == expected_launch(), "launch")
    c.require(admission["qualification"] == {"clean_full_matrix_streak": 0, "credit": "0/2", "increment": False}, "qualification")
    self_raw = Path(__file__).read_bytes()
    c.require(admission["bindings"]["runtime_checker"] == {"bytes": len(self_raw), "mode": "0644", "sha256": hashlib.sha256(self_raw).hexdigest()}, "checker")
    source_raw = read_file(SOURCE, 0o644, SOURCE_BYTES, SOURCE_BYTES, SOURCE_SHA256)
    root = ROOT.stat(follow_symlinks=False)
    c.require(stat.S_ISDIR(root.st_mode) and stat.S_IMODE(root.st_mode) == 0o700 and root.st_uid == os.getuid(), "root")
    c.require(sorted(os.listdir(ROOT)) == ["case.txt", "record.py", "result.txt", "show.py"], "inventory")
    fixed = {}
    for name, (size, mode, digest) in FILES.items():
        fixed[name] = read_file(ROOT / name, mode, size, size, digest)
        c.require(True, "file:" + name)
    expected, body = derive(source_raw, fixed["case.txt"])
    result_raw = read_file(ROOT / "result.txt", 0o444, 49)
    c.require(result_raw.endswith(b"\n") and result_raw.count(b"\n") == 1, "result-framing")
    answer = result_raw[:-1].decode()
    c.require(re.fullmatch(r"[A-Za-z0-9._:-]{1,48}", answer) is not None, "result-token")
    events, trace_raw = trace(trace_path)
    runtime_assertions, thread_id, goal = event_contract(events, fixed["case.txt"], answer)
    c.value += runtime_assertions
    c.require(answer == expected, "score")
    facts = {
        "answer_bytes": len(answer.encode()),
        "answer_sha256": hashlib.sha256(answer.encode()).hexdigest(),
        "body_bytes": len(body),
        "body_sha256": hashlib.sha256(body).hexdigest(),
        "goal_thread_id": thread_id,
        "goal_time_used_seconds": goal["timeUsedSeconds"],
        "goal_tokens_used": goal["tokensUsed"],
        "score": "PASS",
        "trace_bytes": len(trace_raw),
        "trace_sha256": hashlib.sha256(trace_raw).hexdigest(),
    }
    return c.value, facts


def fixture(case_raw, answer):
    turn_id = "fixture-turn"
    thread_id = "fixture-thread"
    def call(name, call_id, arguments, timestamp):
        return {"timestamp": timestamp, "type": "response_item", "payload": {"type": "function_call", "name": name, "call_id": call_id, "arguments": json.dumps(arguments, separators=(",", ":")), "internal_chat_message_metadata_passthrough": {"turn_id": turn_id}}}
    def output(call_id, value, timestamp):
        return {"timestamp": timestamp, "type": "response_item", "payload": {"type": "function_call_output", "call_id": call_id, "output": value}}
    active = {"goal": {"threadId": thread_id, "objective": OBJECTIVE, "status": "active", "tokensUsed": 0, "timeUsedSeconds": 0}}
    complete = {"goal": {"threadId": thread_id, "objective": OBJECTIVE, "status": "complete", "tokensUsed": 1, "timeUsedSeconds": 1}}
    return [
        {"timestamp": 0, "type": "session_meta", "payload": {"id": thread_id, "parent_thread_id": PARENT, "source": {"subagent": {"thread_spawn": {"agent_path": TASK}}}}},
        {"timestamp": 1, "type": "event_msg", "payload": {"type": "task_started", "turn_id": turn_id}},
        {"timestamp": 2, "type": "turn_context", "payload": {"turn_id": turn_id, "model": MODEL, "effort": EFFORT}},
        call("create_goal", "c0", {"objective": OBJECTIVE}, 3),
        output("c0", json.dumps(active, separators=(",", ":")), 4),
        call("exec_command", "c1", SHOW, 5),
        output("c1", "Process exited with code 0\nOutput:\n" + case_raw.decode(), 6),
        call("exec_command", "c2", {"cmd": RECORD_PREFIX + answer, "login": False, "max_output_tokens": 1000, "workdir": str(ROOT), "yield_time_ms": 10000}, 7),
        output("c2", "Process exited with code 0\nOutput:\nDONE", 8),
        call("update_goal", "c3", {"status": "complete"}, 9),
        output("c3", json.dumps(complete, separators=(",", ":")), 10),
        {"timestamp": 11, "type": "event_msg", "payload": {"type": "task_complete", "turn_id": turn_id, "opaque_terminal_text": "arbitrary"}},
    ]


def self_test():
    case_raw = read_file(ROOT / "case.txt", 0o444, 408, 408, FILES["case.txt"][2])
    source_raw = read_file(SOURCE, 0o644, SOURCE_BYTES, SOURCE_BYTES, SOURCE_SHA256)
    answer, _ = derive(source_raw, case_raw)
    base = fixture(case_raw, answer)
    assertions, _, _ = event_contract(base, case_raw, answer)
    noisy = copy.deepcopy(base)
    noisy.insert(3, {"timestamp": 2.1, "type": "response_item", "payload": {"type": "message", "role": "developer", "content": [{"type": "input_text", "text": "untrusted injected context"}]}})
    event_contract(noisy, case_raw, answer)
    mutations = []
    value = copy.deepcopy(base); value[3]["payload"]["name"] = "get_goal"; mutations.append(value)
    value = copy.deepcopy(base); value[3]["payload"]["arguments"] = "{}"; mutations.append(value)
    value = copy.deepcopy(base); value[4]["payload"]["output"] = value[4]["payload"]["output"].replace('"status":"active"', '"status":"complete"'); mutations.append(value)
    value = copy.deepcopy(base); value[4], value[5] = value[5], value[4]; mutations.append(value)
    value = copy.deepcopy(base); value[7]["payload"]["arguments"] = value[7]["payload"]["arguments"].replace(answer, "wrong"); mutations.append(value)
    value = copy.deepcopy(base); value[10]["payload"]["output"] = value[10]["payload"]["output"].replace('"status":"complete"', '"status":"active"'); mutations.append(value)
    value = copy.deepcopy(base); value.pop(); mutations.append(value)
    value = copy.deepcopy(base); value.insert(-1, copy.deepcopy(value[5])); mutations.append(value)
    rejected = 0
    for value in mutations:
        try:
            event_contract(value, case_raw, answer)
        except (Invalid, KeyError, TypeError, ValueError, json.JSONDecodeError):
            rejected += 1
    if rejected != len(mutations):
        raise Invalid("mutation-self-test")
    return assertions, rejected


def emit(status, mismatch, assertions=0, facts=None, mutations=0):
    value = {"assertion_count": assertions, "facts": facts, "first_mismatch": mismatch, "mutation_count": mutations, "qualification_credit": 0, "schema_id": "pw-r9-codex-native-goal-tool-event-microcase-q13-runtime-check-v1", "status": status, "workspace_writes": 0}
    sys.stdout.write(json.dumps(value, sort_keys=True, separators=(",", ":")) + "\n")


def main():
    parser = argparse.ArgumentParser(add_help=False)
    parser.add_argument("--admission")
    parser.add_argument("--trace")
    parser.add_argument("--check", action="store_true")
    parser.add_argument("--self-test", action="store_true")
    args, extras = parser.parse_known_args()
    try:
        if extras or args.check == args.self_test:
            raise Invalid("CLI")
        if args.self_test:
            if args.admission or args.trace:
                raise Invalid("CLI")
            assertions, mutations = self_test()
            emit("PASS_TOOL_EVENT_ONLY_SELF_TEST_ZERO_CREDIT", None, assertions, None, mutations)
            return 0
        if not args.admission or not args.trace or not os.path.isabs(args.admission) or not os.path.isabs(args.trace):
            raise Invalid("CLI")
        assertions, facts = check(Path(args.admission), Path(args.trace))
    except (Invalid, OSError, KeyError, IndexError, TypeError, ValueError, UnicodeDecodeError, json.JSONDecodeError) as exc:
        emit("FAIL", str(exc))
        return 1
    emit("PASS_ONE_FRESH_BITE_SIZE_GOAL_NATIVE_TOOL_EVENT_ONLY_MICROCASE_ZERO_QUALIFICATION_CREDIT", None, assertions, facts)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
