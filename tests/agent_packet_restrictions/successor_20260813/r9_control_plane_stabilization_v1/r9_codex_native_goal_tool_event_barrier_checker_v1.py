#!/usr/bin/env python3
import argparse
import hashlib
import json
import os
import stat
import sys
from pathlib import Path

PARENT_ID = "01a00b52-4879-7c41-a826-7b4609ad3c3b"
CASE_PREFIX = "/mnt/Cursor/PuppetMaster/tests/r9_goal_inline/"


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


def canonical_spec(path):
    raw = read_regular(path, 0o644, 30000)
    if not raw.endswith(b"\n") or raw[:-1].find(b"\n") != -1 or b"\r" in raw:
        raise Invalid("spec-framing")
    value = parse(raw, "spec")
    expected = json.dumps(value, sort_keys=True, separators=(",", ":"), ensure_ascii=False, allow_nan=False).encode() + b"\n"
    if expected != raw:
        raise Invalid("spec-canonical")
    return value, raw


def trace_events(path):
    raw = read_regular(path, 0o664, 500000)
    if not raw.endswith(b"\n") or b"\r" in raw:
        raise Invalid("trace-framing")
    events = []
    for index, line in enumerate(raw.splitlines(keepends=True)):
        if line == b"\n" or not line.endswith(b"\n"):
            raise Invalid("trace-line:" + str(index))
        events.append(parse(line[:-1], "trace:" + str(index)))
    return events, raw


def selected(events, event_type, payload_type=None):
    result = []
    for index, event in enumerate(events):
        payload = event.get("payload")
        if event.get("type") != event_type or not isinstance(payload, dict):
            continue
        if payload_type is None or payload.get("type") == payload_type:
            result.append((index, event.get("timestamp"), payload))
    return result


def call_turn(payload):
    return payload.get("internal_chat_message_metadata_passthrough", {}).get("turn_id")


def exact_keys(value, keys):
    return isinstance(value, dict) and set(value) == set(keys)


def check(spec_path, trace_path):
    c = Counter()
    spec, spec_raw = canonical_spec(spec_path)
    top = {"authority", "call_order", "case", "checker", "effort", "exec", "model", "objective", "parent_thread_id", "purpose", "qualification", "schema_id", "task_path", "terminal", "trace_binding"}
    c.require(exact_keys(spec, top), "spec-keys")
    c.require(spec["schema_id"] == "pw-r9-codex-native-goal-tool-event-barrier-spec-v1", "spec-schema")
    c.require(spec["purpose"] in ["FROZEN_FAILURE_TRACE_PARSER_FIXTURE", "FRESH_ZERO_SUBJECT_CONTROL"], "purpose")
    c.require(spec["authority"] == {"canary_launch": False, "matrix_launch": False, "qualification": False, "subject_launch": False}, "authority")
    c.require(spec["qualification"] == {"clean_full_matrix_streak": 0, "credit": "0/2", "increment": False}, "qualification")
    c.require(spec["parent_thread_id"] == PARENT_ID, "parent")
    c.require(spec["call_order"] == ["create_goal", "exec_command", "update_goal"], "declared-call-order")
    c.require(spec["model"] == "gpt-5.4-mini" and spec["effort"] == "medium", "declared-route")
    c.require(isinstance(spec["task_path"], str) and spec["task_path"].startswith("/root/sealed_inline_control_"), "task-path")
    c.require(exact_keys(spec["objective"], {"bytes", "sha256", "utf8"}) and len(spec["objective"]["utf8"].encode()) == spec["objective"]["bytes"] and hashlib.sha256(spec["objective"]["utf8"].encode()).hexdigest() == spec["objective"]["sha256"], "objective-identity")
    c.require(exact_keys(spec["terminal"], {"bytes", "sha256", "utf8"}) and len(spec["terminal"]["utf8"].encode()) == spec["terminal"]["bytes"] and hashlib.sha256(spec["terminal"]["utf8"].encode()).hexdigest() == spec["terminal"]["sha256"], "terminal-identity")
    c.require(exact_keys(spec["exec"], {"cmd", "login", "max_output_tokens", "workdir", "yield_time_ms"}), "exec-shape")
    c.require(spec["exec"]["login"] is False and spec["exec"]["yield_time_ms"] == 10000 and spec["exec"]["max_output_tokens"] == 1000, "exec-controls")
    case_dir = spec["exec"]["workdir"]
    c.require(isinstance(case_dir, str) and case_dir.startswith(CASE_PREFIX) and spec["case"]["directory"] == case_dir, "case-path")
    c.require(spec["exec"]["cmd"] == "PYTHONDONTWRITEBYTECODE=1 python3 -B run.py", "exec-command")
    self_raw = Path(__file__).read_bytes()
    expected_self = {"bytes": len(self_raw), "mode": "0644", "sha256": hashlib.sha256(self_raw).hexdigest()}
    c.require(spec["checker"] == expected_self, "checker-binding")
    case_path = Path(case_dir)
    info = case_path.stat(follow_symlinks=False)
    c.require(stat.S_ISDIR(info.st_mode) and stat.S_IMODE(info.st_mode) == 0o700 and info.st_uid == os.getuid(), "case-custody")
    c.require(os.listdir(case_path) == ["run.py"], "case-inventory")
    script = read_regular(case_path / "run.py", 0o644, spec["case"]["script"]["bytes"])
    c.require(spec["case"]["script"] == {"bytes": len(script), "mode": "0644", "sha256": hashlib.sha256(script).hexdigest()}, "script-binding")
    events, trace_raw = trace_events(trace_path)
    binding = spec["trace_binding"]
    c.require(binding is None or binding == {"bytes": len(trace_raw), "mode": "0664", "sha256": hashlib.sha256(trace_raw).hexdigest()}, "trace-binding")
    sessions = selected(events, "session_meta")
    c.require(len(sessions) == 1, "session-count")
    session = sessions[0][2]
    thread_id = session["id"]
    source = session["source"]["subagent"]["thread_spawn"]
    c.require(session["parent_thread_id"] == PARENT_ID and source["agent_path"] == spec["task_path"], "session-route")
    contexts = selected(events, "turn_context")
    c.require(len(contexts) == 1, "one-turn-context")
    context = contexts[0][2]
    c.require(context["model"] == spec["model"] and context["effort"] == spec["effort"], "actual-route")
    task_started = selected(events, "event_msg", "task_started")
    task_complete = selected(events, "event_msg", "task_complete")
    c.require(len(task_started) == 1 and len(task_complete) == 1, "one-task-lifecycle")
    calls = selected(events, "response_item", "function_call")
    c.require([payload["name"] for _, _, payload in calls] == spec["call_order"], "actual-call-order")
    c.require(len(calls) == 3, "call-count")
    create_index, create_time, create = calls[0]
    exec_index, exec_time, execute = calls[1]
    update_index, update_time, update = calls[2]
    c.require(json.loads(create["arguments"]) == {"objective": spec["objective"]["utf8"]}, "create-arguments")
    c.require(json.loads(execute["arguments"]) == spec["exec"], "exec-arguments")
    c.require(json.loads(update["arguments"]) == {"status": "complete"}, "update-arguments")
    turn_ids = [call_turn(payload) for _, _, payload in calls]
    c.require(len(set(turn_ids)) == 1 and turn_ids[0] == context["turn_id"], "same-turn-tools")
    outputs = {payload["call_id"]: (index, timestamp, payload) for index, timestamp, payload in selected(events, "response_item", "function_call_output")}
    c.require(set(outputs) == {payload["call_id"] for _, _, payload in calls}, "exact-tool-outputs")
    active_index, active_time, active_output = outputs[create["call_id"]]
    active = json.loads(active_output["output"])["goal"]
    c.require(active["threadId"] == thread_id and active["objective"] == spec["objective"]["utf8"] and active["status"] == "active", "goal-active")
    exec_output_index, exec_output_time, exec_output = outputs[execute["call_id"]]
    c.require("Process exited with code 0" in exec_output["output"] and exec_output["output"].endswith("Output:\n" + spec["terminal"]["utf8"]), "exec-terminal")
    complete_index, complete_time, complete_output = outputs[update["call_id"]]
    complete = json.loads(complete_output["output"])["goal"]
    c.require(complete["threadId"] == thread_id and complete["objective"] == spec["objective"]["utf8"] and complete["status"] == "complete", "goal-complete")
    c.require(create_index < active_index < exec_index < exec_output_index < update_index < complete_index < task_complete[0][0], "event-order")
    c.require(create_time < active_time < exec_time < exec_output_time < update_time < complete_time, "timestamp-order")
    c.require(task_complete[0][2]["turn_id"] == context["turn_id"] and task_complete[0][2]["last_agent_message"] == spec["terminal"]["utf8"], "task-terminal")
    c.require(task_started[0][0] < create_index and task_complete[0][0] == len(events) - 1, "closed-trace")
    return c.value, spec_raw, trace_raw, thread_id, active, complete


def emit(status, mismatch, assertions=0, facts=None):
    value = {"assertion_count": assertions, "facts": facts, "first_mismatch": mismatch, "qualification_credit": 0, "schema_id": "pw-r9-codex-native-goal-tool-event-barrier-check-v1", "status": status, "workspace_writes": 0}
    sys.stdout.write(json.dumps(value, sort_keys=True, separators=(",", ":")) + "\n")


def main():
    parser = argparse.ArgumentParser(add_help=False)
    parser.add_argument("--spec")
    parser.add_argument("--trace")
    parser.add_argument("--check", action="store_true")
    args, extras = parser.parse_known_args()
    if extras or not args.check or not args.spec or not args.trace or not os.path.isabs(args.spec) or not os.path.isabs(args.trace):
        emit("FAIL", "CLI must be --spec ABS --trace ABS --check")
        return 1
    try:
        assertions, spec_raw, trace_raw, thread_id, active, complete = check(Path(args.spec), Path(args.trace))
    except (Invalid, OSError, KeyError, IndexError, TypeError, ValueError, json.JSONDecodeError) as exc:
        emit("FAIL", str(exc))
        return 1
    facts = {"goal_thread_id": thread_id, "goal_time_used_seconds": complete["timeUsedSeconds"], "goal_tokens_used": complete["tokensUsed"], "spec_bytes": len(spec_raw), "spec_sha256": hashlib.sha256(spec_raw).hexdigest(), "subject_bytes": 0, "trace_bytes": len(trace_raw), "trace_sha256": hashlib.sha256(trace_raw).hexdigest()}
    emit("PASS_TOOL_EVENT_GOAL_BARRIER_ZERO_CREDIT", None, assertions, facts)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
