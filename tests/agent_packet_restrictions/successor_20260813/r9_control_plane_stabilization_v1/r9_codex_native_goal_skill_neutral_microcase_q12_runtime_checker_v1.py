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
DIR = BASE / "tests/agent_packet_restrictions/successor_20260813/r9_control_plane_stabilization_v1"
ROOT = BASE / "tests/r9_goal_microcase/q12"
SOURCE = DIR / "codex_native_goal_direct_canary_002_public_plan_v1/cells/cell-005/slot-bravo.json"
TASK = "/root/sealed_microcase_q12_001"
PARENT = "01a00b52-4879-7c41-a826-7b4609ad3c3b"
MODEL = "gpt-5.4-mini"
EFFORT = "medium"
OBJECTIVE = "CASE|q12|show_record|terminal=DONE|once"
INITIAL = "First tool: create_goal objective `CASE|q12|show_record|terminal=DONE|once`. After ACTIVE, same turn, in /mnt/Cursor/PuppetMaster/tests/r9_goal_microcase/q12 run `PYTHONDONTWRITEBYTECODE=1 python3 -B show.py` with login=false,yield_ms=10000,max_output_tokens=1000. Solve the displayed microcase; run `PYTHONDONTWRITEBYTECODE=1 python3 -B record.py <TOKEN>` with the answer and same controls. Then update_goal complete and return DONE. Use only these four tools."
SHOW = {"cmd": "PYTHONDONTWRITEBYTECODE=1 python3 -B show.py", "login": False, "max_output_tokens": 1000, "workdir": str(ROOT), "yield_time_ms": 10000}
RECORD_PREFIX = "PYTHONDONTWRITEBYTECODE=1 python3 -B record.py "
TERMINAL = "DONE"
SOURCE_BYTES = 101931
SOURCE_SHA256 = "c34ec8b9e2eba93560f3f5c8087b7e2e91cc467884d12000fdb83c6d338dfc7a"
FILES = {
    "case.txt": (428, 0o444, "b4cf3ee65cb1a0b46caf286c4c1ca2f2a295c9ae95c4e12b4907a0cd663afc2f"),
    "record.py": (2778, 0o644, "bae5848ad552f9cda21f7b229c1d0326f5fe8d2b3c3b3af69f03de0d6690e56e"),
    "show.py": (3975, 0o644, "e36e36c98487d54aab17fe75c5b578c4b006fe84dd2f3b90ee83e1ead16068d5"),
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
    events, lines = [], raw.splitlines(keepends=True)
    for index, line in enumerate(lines):
        if line == b"\n" or not line.endswith(b"\n"):
            raise Invalid("trace-line:" + str(index))
        events.append(parse(line[:-1], "trace:" + str(index)))
    return events, lines, raw


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
    nodes = [node for node in source["nodes"] if node.get("atom_id") == "n00004"]
    if len(nodes) != 1:
        raise Invalid("source-node")
    node = nodes[0]
    if node.get("atom_nonce") != "a61802d7113b4d9771c1504898f492b3280f0455e0e88cf8c3cccc5af1d9d205" or node.get("attempt_id") != "3d74d2ed3feadbb93b901448":
        raise Invalid("source-id")
    body = node["subject_atom"]["utf8"].encode()
    if len(body) != 306 or hashlib.sha256(body).hexdigest() != "6f993f2eb36db35b4c4778874d2df749e8587e8bdab7dc9a39f267b8fdda391e" or case_raw.split(b"\n")[1] != body:
        raise Invalid("source-case")
    wrapper = parse(body, "body")
    payload = parse(wrapper["p"].encode(), "payload")
    if set(payload) != {"op", "t", "x"} or payload["op"] != "label" or not isinstance(payload["x"], str):
        raise Invalid("source-payload")
    return payload["x"], body


def check(admission_path, trace_path):
    c = Counter()
    admission, admission_raw = canonical(admission_path)
    c.require(admission["schema_id"] == "pw-r9-codex-native-goal-skill-neutral-microcase-q12-admission-v1", "admission-schema")
    c.require(admission["authority"] == {"canary_launch": False, "matrix_launch": False, "microcase_launch_exactly_once": True, "qualification": False, "qualification_credit": 0, "release": False}, "authority")
    expected_launch = {"fork_turns": "none", "initial_message": {"bytes": 461, "sha256": "325a9da0271c9c9e10a518fe57136bc54f2b529cd9fcf8c6bb2930fd2de3125d", "utf8": INITIAL}, "model": MODEL, "objective": {"bytes": 39, "sha256": "8bf927b3f4af5afe099b64d16f9caa00b2a7fb03c8450a6d94b662122c572271", "utf8": OBJECTIVE}, "reasoning_effort": EFFORT, "task_name": "sealed_microcase_q12_001"}
    c.require(admission["launch"] == expected_launch, "launch")
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
    events, lines, trace_raw = trace(trace_path)
    sessions = items(events, "session_meta")
    c.require(len(sessions) == 1, "session-count")
    session = sessions[0][2]
    thread_id = session["id"]
    c.require(session["parent_thread_id"] == PARENT and session["source"]["subagent"]["thread_spawn"]["agent_path"] == TASK, "session")
    contexts = items(events, "turn_context")
    c.require(len(contexts) == 1 and contexts[0][2]["model"] == MODEL and contexts[0][2]["effort"] == EFFORT, "route")
    started, completed = items(events, "event_msg", "task_started"), items(events, "event_msg", "task_complete")
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
    before = b"".join(lines[:active_i])
    c.require(body not in before and expected.encode() not in before and b"case.txt" not in before and b"r9-goal-atom-bootstrap" not in before, "pre-goal-boundary")
    show_o_i, show_o_t, show_output = outputs[show["call_id"]]
    c.require("Output:\n" in show_output["output"] and show_output["output"].rsplit("Output:\n", 1)[1].encode() == fixed["case.txt"], "show-output")
    record_o_i, record_o_t, record_output = outputs[record["call_id"]]
    c.require("Process exited with code 0" in record_output["output"] and record_output["output"].endswith("Output:\n" + TERMINAL), "record-output")
    complete_i, complete_t, complete_output = outputs[update["call_id"]]
    goal = json.loads(complete_output["output"])["goal"]
    c.require(goal["threadId"] == thread_id and goal["objective"] == OBJECTIVE and goal["status"] == "complete", "complete")
    c.require(create_i < active_i < show_i < show_o_i < record_i < record_o_i < update_i < complete_i < completed[0][0], "event-order")
    c.require(create_t < active_t < show_t < show_o_t < record_t < record_o_t < update_t < complete_t, "time-order")
    c.require(completed[0][2]["turn_id"] == contexts[0][2]["turn_id"] and completed[0][2]["last_agent_message"] == TERMINAL and completed[0][0] == len(events) - 1, "terminal")
    c.require(answer == expected, "score")
    return c.value, admission_raw, trace_raw, thread_id, answer, hashlib.sha256(body).hexdigest(), goal


def emit(status, mismatch, assertions=0, facts=None):
    value = {"assertion_count": assertions, "facts": facts, "first_mismatch": mismatch, "qualification_credit": 0, "schema_id": "pw-r9-codex-native-goal-skill-neutral-microcase-q12-runtime-check-v1", "status": status, "workspace_writes": 0}
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
        assertions, admission_raw, trace_raw, thread_id, answer, body_sha256, goal = check(Path(args.admission), Path(args.trace))
    except (Invalid, OSError, KeyError, IndexError, TypeError, ValueError, UnicodeDecodeError, json.JSONDecodeError) as exc:
        emit("FAIL", str(exc))
        return 1
    facts = {"answer_bytes": len(answer.encode()), "answer_sha256": hashlib.sha256(answer.encode()).hexdigest(), "body_bytes": 306, "body_sha256": body_sha256, "goal_thread_id": thread_id, "goal_time_used_seconds": goal["timeUsedSeconds"], "goal_tokens_used": goal["tokensUsed"], "score": "PASS", "trace_bytes": len(trace_raw), "trace_sha256": hashlib.sha256(trace_raw).hexdigest()}
    emit("PASS_ONE_FRESH_BITE_SIZE_GOAL_NATIVE_SKILL_NEUTRAL_MICROCASE_ZERO_QUALIFICATION_CREDIT", None, assertions, facts)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
