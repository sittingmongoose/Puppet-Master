#!/usr/bin/env python3
import argparse
import hashlib
import json
import os
import re
import stat
import sys
from pathlib import Path

BASE = Path("/mnt/Cursor/PuppetMaster")
ARTIFACT_DIR = BASE / "tests/agent_packet_restrictions/successor_20260813/r9_control_plane_stabilization_v1"
CASE_DIR = BASE / "tests/r9_goal_packet/q11"
SOURCE = ARTIFACT_DIR / "codex_native_goal_direct_canary_002_public_plan_v1/cells/cell-005/slot-bravo.json"
TASK_PATH = "/root/sealed_goal_atom_q11_001"
PARENT_ID = "01a00b52-4879-7c41-a826-7b4609ad3c3b"
MODEL = "gpt-5.4-mini"
EFFORT = "medium"
OBJECTIVE = "ATOM|q11|read_then_submit|terminal=SUBMITTED|no-retry"
INITIAL = "First tool: create_goal objective `ATOM|q11|read_then_submit|terminal=SUBMITTED|no-retry`. After ACTIVE, same turn, in /mnt/Cursor/PuppetMaster/tests/r9_goal_packet/q11 run `PYTHONDONTWRITEBYTECODE=1 python3 -B read_packet.py` with login=false,yield_ms=10000,max_output_tokens=1000. Solve that packet; run `PYTHONDONTWRITEBYTECODE=1 python3 -B submit.py <TOKEN>` with the answer and same controls. Then update_goal complete and return SUBMITTED. No other tool/turn/read/search/retry. Commentary allowed."
READ_ARGS = {"cmd": "PYTHONDONTWRITEBYTECODE=1 python3 -B read_packet.py", "login": False, "max_output_tokens": 1000, "workdir": str(CASE_DIR), "yield_time_ms": 10000}
SUBMIT_PREFIX = "PYTHONDONTWRITEBYTECODE=1 python3 -B submit.py "
TERMINAL = "SUBMITTED"
SOURCE_BYTES = 101931
SOURCE_SHA256 = "c34ec8b9e2eba93560f3f5c8087b7e2e91cc467884d12000fdb83c6d338dfc7a"
FILES = {
    "packet.txt": (394, 0o444, "3f227a4511b808e1efc984d477da44b785db7f3f54f657925f40a531450d1ed1"),
    "read_packet.py": (4489, 0o644, "a015231d346f3dd20ee06723b0f787f8532c0d2bd320df8f8c168cd475f7972f"),
    "submit.py": (3021, 0o644, "3e8ebf0a84d6083268e7d81521068e3e662c51c5cad4070960ef080f7a12bbdf"),
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


def read_regular(path, mode, cap, size=None, digest=None):
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
    raw = read_regular(path, 0o644, 30000)
    if not raw.endswith(b"\n") or raw[:-1].find(b"\n") != -1 or b"\r" in raw:
        raise Invalid("admission-framing")
    value = parse(raw, "admission")
    encoded = json.dumps(value, sort_keys=True, separators=(",", ":"), ensure_ascii=False, allow_nan=False).encode() + b"\n"
    if encoded != raw:
        raise Invalid("admission-canonical")
    return value, raw


def trace_events(path):
    raw = read_regular(path, 0o664, 500000)
    if not raw.endswith(b"\n") or b"\r" in raw:
        raise Invalid("trace-framing")
    events = []
    lines = raw.splitlines(keepends=True)
    for index, line in enumerate(lines):
        if line == b"\n" or not line.endswith(b"\n"):
            raise Invalid("trace-line:" + str(index))
        events.append(parse(line[:-1], "trace:" + str(index)))
    return events, lines, raw


def selected(events, event_type, payload_type=None):
    result = []
    for index, event in enumerate(events):
        payload = event.get("payload")
        if event.get("type") != event_type or not isinstance(payload, dict):
            continue
        if payload_type is None or payload.get("type") == payload_type:
            result.append((index, event.get("timestamp"), payload))
    return result


def item_turn(payload):
    return payload.get("internal_chat_message_metadata_passthrough", {}).get("turn_id")


def expected_from_source(raw, packet):
    source = parse(raw, "source")
    nodes = [node for node in source["nodes"] if node.get("atom_id") == "n00003"]
    if len(nodes) != 1:
        raise Invalid("source-node")
    node = nodes[0]
    if node.get("atom_nonce") != "ede2ea93c74734e834809f507e54ab92762cc818d2c444fa0f5806ae38f48b2e" or node.get("attempt_id") != "57ca7d8258c2e8110c7f4ab5":
        raise Invalid("source-identity")
    subject = node["subject_atom"]["utf8"].encode()
    if len(subject) != 282 or hashlib.sha256(subject).hexdigest() != "a241f880aa450f7d90586ce289b1232592e172376700ba7f26f77dcf6e88e31f":
        raise Invalid("source-subject")
    if packet.split(b"\n")[1] != subject:
        raise Invalid("packet-source-binding")
    wrapper = parse(subject, "subject")
    payload = parse(wrapper["p"].encode(), "payload")
    if set(payload) != {"op", "t", "x"} or payload["op"] != "label" or not isinstance(payload["x"], str):
        raise Invalid("expected-derivation")
    return payload["x"], subject


def check(admission_path, trace_path):
    c = Counter()
    admission, admission_raw = canonical(admission_path)
    c.require(admission["schema_id"] == "pw-r9-codex-native-goal-tool-event-atom-q11-admission-v1", "admission-schema")
    c.require(admission["authority"] == {"atom_launch_exactly_once": True, "canary_launch": False, "matrix_launch": False, "qualification": False, "qualification_credit": 0, "release": False}, "authority")
    expected_launch = {"fork_turns": "none", "initial_message": {"bytes": 503, "sha256": "ef7aafc34a45126cb6a598761ac1905e3435cfb4b4c4a58a655181a8a8dcae24", "utf8": INITIAL}, "model": MODEL, "objective": {"bytes": 53, "sha256": "75c5c50fe12335901ace47fb8f2a5da89616aad49fca08ce8f6409dd0f854210", "utf8": OBJECTIVE}, "reasoning_effort": EFFORT, "task_name": "sealed_goal_atom_q11_001"}
    c.require(admission["launch"] == expected_launch, "launch")
    c.require(admission["qualification"] == {"clean_full_matrix_streak": 0, "credit": "0/2", "increment": False}, "qualification")
    self_raw = Path(__file__).read_bytes()
    c.require(admission["bindings"]["runtime_checker"] == {"bytes": len(self_raw), "mode": "0644", "sha256": hashlib.sha256(self_raw).hexdigest()}, "checker-binding")
    source_raw = read_regular(SOURCE, 0o644, SOURCE_BYTES, SOURCE_BYTES, SOURCE_SHA256)
    root = CASE_DIR.stat(follow_symlinks=False)
    c.require(stat.S_ISDIR(root.st_mode) and stat.S_IMODE(root.st_mode) == 0o700 and root.st_uid == os.getuid(), "case-custody")
    c.require(sorted(os.listdir(CASE_DIR)) == ["answer.txt", "packet.txt", "read_packet.py", "submit.py"], "postrun-inventory")
    fixed = {}
    for name, (size, mode, digest) in FILES.items():
        fixed[name] = read_regular(CASE_DIR / name, mode, size, size, digest)
        c.require(True, "file:" + name)
    packet = fixed["packet.txt"]
    expected, subject = expected_from_source(source_raw, packet)
    answer_raw = read_regular(CASE_DIR / "answer.txt", 0o444, 49)
    c.require(answer_raw.endswith(b"\n") and answer_raw.count(b"\n") == 1, "answer-framing")
    answer = answer_raw[:-1].decode("utf-8")
    c.require(re.fullmatch(r"[A-Za-z0-9._:-]{1,48}", answer) is not None, "answer-token")
    events, lines, trace_raw = trace_events(trace_path)
    sessions = selected(events, "session_meta")
    c.require(len(sessions) == 1, "session-count")
    session = sessions[0][2]
    thread_id = session["id"]
    c.require(session["parent_thread_id"] == PARENT_ID and session["source"]["subagent"]["thread_spawn"]["agent_path"] == TASK_PATH, "session")
    contexts = selected(events, "turn_context")
    c.require(len(contexts) == 1 and contexts[0][2]["model"] == MODEL and contexts[0][2]["effort"] == EFFORT, "route")
    task_started = selected(events, "event_msg", "task_started")
    task_complete = selected(events, "event_msg", "task_complete")
    c.require(len(task_started) == 1 and len(task_complete) == 1, "task-lifecycle")
    calls = selected(events, "response_item", "function_call")
    c.require([payload["name"] for _, _, payload in calls] == ["create_goal", "exec_command", "exec_command", "update_goal"], "call-order")
    create_index, create_time, create = calls[0]
    read_index, read_time, read_call = calls[1]
    submit_index, submit_time, submit_call = calls[2]
    update_index, update_time, update = calls[3]
    c.require(json.loads(create["arguments"]) == {"objective": OBJECTIVE}, "create-arguments")
    c.require(json.loads(read_call["arguments"]) == READ_ARGS, "read-arguments")
    submit_args = json.loads(submit_call["arguments"])
    expected_submit = {"cmd": SUBMIT_PREFIX + answer, "login": False, "max_output_tokens": 1000, "workdir": str(CASE_DIR), "yield_time_ms": 10000}
    c.require(submit_args == expected_submit, "submit-arguments")
    c.require(json.loads(update["arguments"]) == {"status": "complete"}, "update-arguments")
    turns = [item_turn(payload) for _, _, payload in calls]
    c.require(len(set(turns)) == 1 and turns[0] == contexts[0][2]["turn_id"], "same-turn-tools")
    outputs = {payload["call_id"]: (index, timestamp, payload) for index, timestamp, payload in selected(events, "response_item", "function_call_output")}
    c.require(set(outputs) == {payload["call_id"] for _, _, payload in calls}, "tool-outputs")
    active_index, active_time, active_output = outputs[create["call_id"]]
    active = json.loads(active_output["output"])["goal"]
    c.require(active["threadId"] == thread_id and active["objective"] == OBJECTIVE and active["status"] == "active", "goal-active")
    before_active = b"".join(lines[:active_index])
    c.require(subject not in before_active and expected.encode() not in before_active and b"packet.txt" not in before_active, "subject-not-visible-before-active")
    read_output_index, read_output_time, read_output = outputs[read_call["call_id"]]
    marker = "Output:\n"
    c.require(marker in read_output["output"] and read_output["output"].rsplit(marker, 1)[1].encode() == packet, "packet-output")
    submit_output_index, submit_output_time, submit_output = outputs[submit_call["call_id"]]
    c.require("Process exited with code 0" in submit_output["output"] and submit_output["output"].endswith("Output:\n" + TERMINAL), "submit-output")
    complete_index, complete_time, complete_output = outputs[update["call_id"]]
    complete = json.loads(complete_output["output"])["goal"]
    c.require(complete["threadId"] == thread_id and complete["objective"] == OBJECTIVE and complete["status"] == "complete", "goal-complete")
    c.require(create_index < active_index < read_index < read_output_index < submit_index < submit_output_index < update_index < complete_index < task_complete[0][0], "event-order")
    c.require(create_time < active_time < read_time < read_output_time < submit_time < submit_output_time < update_time < complete_time, "time-order")
    c.require(task_complete[0][2]["turn_id"] == contexts[0][2]["turn_id"] and task_complete[0][2]["last_agent_message"] == TERMINAL and task_complete[0][0] == len(events) - 1, "task-terminal")
    c.require(answer == expected, "score")
    return c.value, admission_raw, trace_raw, thread_id, answer, hashlib.sha256(subject).hexdigest(), complete


def emit(status, mismatch, assertions=0, facts=None):
    value = {"assertion_count": assertions, "facts": facts, "first_mismatch": mismatch, "qualification_credit": 0, "schema_id": "pw-r9-codex-native-goal-tool-event-atom-q11-runtime-check-v1", "status": status, "workspace_writes": 0}
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
        assertions, admission_raw, trace_raw, thread_id, answer, subject_sha256, goal = check(Path(args.admission), Path(args.trace))
    except (Invalid, OSError, KeyError, IndexError, TypeError, ValueError, UnicodeDecodeError, json.JSONDecodeError) as exc:
        emit("FAIL", str(exc))
        return 1
    facts = {"answer_bytes": len(answer.encode()), "answer_sha256": hashlib.sha256(answer.encode()).hexdigest(), "goal_thread_id": thread_id, "goal_time_used_seconds": goal["timeUsedSeconds"], "goal_tokens_used": goal["tokensUsed"], "score": "PASS", "subject_bytes": 282, "subject_sha256": subject_sha256, "trace_bytes": len(trace_raw), "trace_sha256": hashlib.sha256(trace_raw).hexdigest()}
    emit("PASS_ONE_FRESH_BITE_SIZE_GOAL_NATIVE_ATOM_ZERO_QUALIFICATION_CREDIT", None, assertions, facts)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
