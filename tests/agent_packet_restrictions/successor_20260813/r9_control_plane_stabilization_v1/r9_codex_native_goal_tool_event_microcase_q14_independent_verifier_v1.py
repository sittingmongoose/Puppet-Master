#!/usr/bin/env python3
import argparse
import hashlib
import json
import os
import stat
import subprocess
import sys
from pathlib import Path

BASE = Path("/mnt/Cursor/PuppetMaster")
DIR = BASE / "tests/agent_packet_restrictions/successor_20260813/r9_control_plane_stabilization_v1"
ROOT = BASE / "tests/r9_goal_microcase/q14"
SOURCE = DIR / "codex_native_goal_direct_canary_002_public_plan_v1/cells/cell-006/slot-bravo.json"
TASK = "/root/sealed_microcase_q14_001"
PARENT = "01a00b52-4879-7c41-a826-7b4609ad3c3b"
THREAD = "01a0309d-c7b2-7d71-98e1-6022755812e2"
OBJECTIVE = "CASE|q14|show_record|once"
MODEL = "gpt-5.4-mini"
EFFORT = "medium"
ANSWER = "no_admission_needed_if_bytes_match"
CASE_SHA256 = "6bb9984e7ba354e27562e8b595afd4227626f4bc4dcde6dcdf00f8da0e985959"
BODY_SHA256 = "25e84cf98822203d3e0c3dcc20b104971a20573469ec204e364ca88863dcc932"
RESULT_SHA256 = "b245a9aed791585b5511bb88cd1b04e8832a914527e7eb33c09e0b0d8ca1c01b"
TRACE_SHA256 = "82c863ceecb9c9f1d9decbbe73cff583c40f242a283055c2b6ff6ce2dacd05dd"
ADMISSION_SHA256 = "8c4dbe960a30686400c546cc7d05d936690e9a889ea6a618febd939994cd55ed"
SUCCESS_SHA256 = "029ca283f93ba028de032e9476ab16e14bf1563f42ced47fe03af76fcd61f6d3"
SHOW = {"cmd": "PYTHONDONTWRITEBYTECODE=1 python3 -B show.py", "login": False, "max_output_tokens": 1000, "workdir": str(ROOT), "yield_time_ms": 10000}
RECORD = {"cmd": "PYTHONDONTWRITEBYTECODE=1 python3 -B record.py " + ANSWER, "login": False, "max_output_tokens": 1000, "workdir": str(ROOT), "yield_time_ms": 10000}


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
    raise Invalid("nonfinite:" + value)


def _pairs(items):
    value = {}
    for key, item in items:
        if key in value:
            raise Invalid("duplicate:" + key)
        value[key] = item
    return value


def parse(raw, name):
    try:
        return json.loads(raw.decode("utf-8"), object_pairs_hook=_pairs, parse_constant=_constant)
    except (UnicodeDecodeError, json.JSONDecodeError, Invalid) as exc:
        raise Invalid("json:" + name) from exc


def read(path, mode, size, digest):
    before = path.stat(follow_symlinks=False)
    if not stat.S_ISREG(before.st_mode) or stat.S_IMODE(before.st_mode) != mode or before.st_uid != os.getuid() or before.st_nlink != 1 or before.st_size != size:
        raise Invalid("custody:" + path.name)
    raw = path.read_bytes()
    after = path.stat(follow_symlinks=False)
    left = (before.st_dev, before.st_ino, before.st_mode, before.st_uid, before.st_size, before.st_mtime_ns)
    right = (after.st_dev, after.st_ino, after.st_mode, after.st_uid, after.st_size, after.st_mtime_ns)
    if left != right or len(raw) != size or hashlib.sha256(raw).hexdigest() != digest:
        raise Invalid("identity:" + path.name)
    return raw


def canonical(path, size, digest):
    raw = read(path, 0o644, size, digest)
    value = parse(raw[:-1], path.name)
    encoded = json.dumps(value, sort_keys=True, separators=(",", ":"), ensure_ascii=False, allow_nan=False).encode() + b"\n"
    if not raw.endswith(b"\n") or b"\r" in raw or raw[:-1].find(b"\n") != -1 or encoded != raw:
        raise Invalid("canonical:" + path.name)
    return value


def trace(path):
    raw = read(path, 0o664, 116825, TRACE_SHA256)
    if not raw.endswith(b"\n") or b"\r" in raw:
        raise Invalid("trace-framing")
    events = []
    for index, line in enumerate(raw.splitlines(keepends=True)):
        if line == b"\n" or not line.endswith(b"\n"):
            raise Invalid("trace-line:" + str(index))
        events.append(parse(line[:-1], "trace:" + str(index)))
    return events


def items(events, event_type, payload_type=None):
    output = []
    for index, event in enumerate(events):
        payload = event.get("payload")
        if event.get("type") == event_type and isinstance(payload, dict) and (payload_type is None or payload.get("type") == payload_type):
            output.append((index, payload))
    return output


def tool_turn(payload):
    return payload.get("internal_chat_message_metadata_passthrough", {}).get("turn_id")


def check(admission_path, success_path, trace_path):
    c = Counter()
    admission = canonical(admission_path, 4368, ADMISSION_SHA256)
    success = canonical(success_path, 2797, SUCCESS_SHA256)
    c.require(admission["status"] == "ADMITTED_EXACTLY_ONE_FRESH_GOAL_NATIVE_TOOL_EVENT_ONLY_MICROCASE_ZERO_QUALIFICATION_CREDIT", "admission-status")
    c.require(admission["launch"]["model"] == MODEL and admission["launch"]["reasoning_effort"] == EFFORT and admission["launch"]["fork_turns"] == "none", "admission-route")
    c.require(admission["authority"] == {"canary_launch": False, "matrix_launch": False, "microcase_launch_exactly_once": True, "qualification": False, "qualification_credit": 0, "release": False}, "admission-authority")
    c.require(success["classification"]["canary_evidence_admission"] == "PENDING_INDEPENDENT_MECHANICAL_REVIEW", "success-pending")
    c.require(success["qualification"] == {"clean_full_matrix_count": 0, "credit": "0/2", "increment": False, "required_consecutive_clean_full_matrices": 2, "streak": 0}, "success-qualification")
    case_raw = read(ROOT / "case.txt", 0o444, 418, CASE_SHA256)
    result_raw = read(ROOT / "result.txt", 0o444, 35, RESULT_SHA256)
    c.require(result_raw == ANSWER.encode() + b"\n", "result")
    source_raw = read(SOURCE, 0o644, 126606, "01a561826b9f249b8de13e9fa40d5cbfb18c6fef972b5eed768c0fe6b7770a9e")
    source = parse(source_raw, "source")
    nodes = [value for value in source["nodes"] if value.get("atom_id") == "n00004"]
    c.require(len(nodes) == 1 and nodes[0]["atom_nonce"] == "3f0fc51c28ad07e8149bf24d4327c8b7c62dc893e1255e95de8b66724d89ce39" and nodes[0]["attempt_id"] == "4f162b4de6457777942b8b15", "source-node")
    body = nodes[0]["subject_atom"]["utf8"].encode()
    c.require(len(body) == 296 and hashlib.sha256(body).hexdigest() == BODY_SHA256 and case_raw.split(b"\n")[1] == body, "source-body")
    wrapper = parse(body, "body")
    payload = parse(wrapper["p"].encode(), "payload")
    c.require(payload == {"op": "label", "t": "options", "x": ANSWER}, "source-answer")
    events = trace(trace_path)
    sessions = items(events, "session_meta")
    c.require(len(sessions) == 1, "session-count")
    session = sessions[0][1]
    c.require(session["id"] == THREAD and session["parent_thread_id"] == PARENT and session["source"]["subagent"]["thread_spawn"]["agent_path"] == TASK, "session")
    contexts = items(events, "turn_context")
    c.require(len(contexts) == 1 and contexts[0][1]["model"] == MODEL and contexts[0][1]["effort"] == EFFORT, "route")
    started = items(events, "event_msg", "task_started")
    completed = items(events, "event_msg", "task_complete")
    c.require(len(started) == 1 and len(completed) == 1, "task-events")
    calls = items(events, "response_item", "function_call")
    c.require([payload["name"] for _, payload in calls] == ["create_goal", "exec_command", "exec_command", "update_goal"], "call-order")
    create_i, create = calls[0]
    show_i, show = calls[1]
    record_i, record = calls[2]
    update_i, update = calls[3]
    c.require(json.loads(create["arguments"]) == {"objective": OBJECTIVE}, "create")
    c.require(json.loads(show["arguments"]) == SHOW, "show")
    c.require(json.loads(record["arguments"]) == RECORD, "record")
    c.require(json.loads(update["arguments"]) == {"status": "complete"}, "update")
    turn_id = contexts[0][1]["turn_id"]
    c.require({tool_turn(payload) for _, payload in calls} == {turn_id}, "turn")
    outputs = {payload["call_id"]: (index, payload) for index, payload in items(events, "response_item", "function_call_output")}
    c.require(set(outputs) == {payload["call_id"] for _, payload in calls}, "outputs")
    active_i, active_output = outputs[create["call_id"]]
    active = json.loads(active_output["output"])["goal"]
    c.require(active["threadId"] == THREAD and active["objective"] == OBJECTIVE and active["status"] == "active", "goal-active")
    show_o_i, show_output = outputs[show["call_id"]]
    c.require(show_output["output"].rsplit("Output:\n", 1)[1].encode() == case_raw, "show-output")
    record_o_i, record_output = outputs[record["call_id"]]
    c.require(record_output["output"].endswith("Output:\nDONE"), "record-output")
    complete_i, complete_output = outputs[update["call_id"]]
    complete = json.loads(complete_output["output"])["goal"]
    c.require(complete["threadId"] == THREAD and complete["objective"] == OBJECTIVE and complete["status"] == "complete" and complete["tokensUsed"] == 2088 and complete["timeUsedSeconds"] == 10, "goal-complete")
    c.require(create_i < active_i < show_i < show_o_i < record_i < record_o_i < update_i < complete_i < completed[0][0], "causal-order")
    c.require(completed[0][1]["turn_id"] == turn_id and completed[0][0] == len(events) - 1, "terminal-order")
    found = subprocess.run(["rg", "-l", "sealed_microcase_q14_001", "/home/sittingmongoose/.codex/sessions/2026/08/23"], check=False, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    c.require(found.returncode == 0 and found.stderr == b"" and found.stdout.decode().splitlines() == [str(trace_path)], "fresh-task")
    c.require(success["proof"]["final_agent_message_used_as_authority"] is False and success["proof"]["raw_context_scanned_as_authority"] is False, "message-nonauthority")
    return c.value


def emit(status, mismatch, assertions=0):
    value = {"assertion_count": assertions, "canary_evidence_admissible": status.startswith("PASS"), "first_mismatch": mismatch, "qualification_credit": 0, "schema_id": "pw-r9-codex-native-goal-tool-event-microcase-q14-independent-verify-v1", "status": status, "workspace_writes": 0}
    sys.stdout.write(json.dumps(value, sort_keys=True, separators=(",", ":")) + "\n")


def main():
    parser = argparse.ArgumentParser(add_help=False)
    parser.add_argument("--admission")
    parser.add_argument("--success")
    parser.add_argument("--trace")
    parser.add_argument("--check", action="store_true")
    args, extras = parser.parse_known_args()
    if extras or not args.check or not args.admission or not args.success or not args.trace or not all(os.path.isabs(value) for value in [args.admission, args.success, args.trace]):
        emit("FAIL", "CLI")
        return 1
    try:
        assertions = check(Path(args.admission), Path(args.success), Path(args.trace))
    except (Invalid, OSError, KeyError, IndexError, TypeError, ValueError, UnicodeDecodeError, json.JSONDecodeError, subprocess.SubprocessError) as exc:
        emit("FAIL", str(exc))
        return 1
    emit("PASS_CANARY_EVIDENCE_ADMISSIBLE_ZERO_QUALIFICATION_CREDIT", None, assertions)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
