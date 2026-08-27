#!/usr/bin/env python3
import argparse
import hashlib
import json
import os
import stat
import sys
from pathlib import Path

PARENT_THREAD_ID = "01a00b52-4879-7c41-a826-7b4609ad3c3b"
PARENT_LINES = {
    61376: (1448, "bbdf4efa0c10cda240e4a173cec4628b1f616c23f3d59c693b827c0a7b2590f4"),
    61378: (409, "7a38d2b0bc35638234f8e8b78d17ece5011d7045ff9c7f4a5ddf67ea67d42abe"),
    61401: (1240, "ab3c021930f89b5594aa3c6655eb6f60cf259e02fd4ebd99d41c59dd8c19c4f0"),
    61403: (394, "6b2fb6eb4da9906c775247df5729b1780dd3733ad1094aaa53fe15394d600210"),
    63631: (1273, "6d5bebb8da5609c0e3c350be0bc30f43eeccee2a25508e6e94fa0df7c739353b"),
    63633: (381, "69388700eaef6e10e2378b78fed74a627569d4e7903204c073486d8cd0abf425"),
}
ROUTES = {
    "alpha": {
        "call_id": "call_ltMcyZNQIZZ7iBqnCnc7ni8X",
        "call_line": 61401,
        "effort": "xhigh",
        "model": "gpt-5.4-mini",
        "output_line": 61403,
        "task_name": "goal_raw_broker_canary006_alpha",
        "task_path": "/root/goal_raw_broker_canary006_alpha",
        "thread_id": "01a02ffd-f74b-7e32-9352-eba12eed7e19",
        "trace_bytes": 159755,
        "trace_sha256": "b0cc634b81904014216e40bd0f17039f373c63288bbb95c177393702d8103f17",
    },
    "bravo": {
        "call_id": "call_WjuGyBwE3oM11h05CvJslNRi",
        "call_line": 63631,
        "effort": "medium",
        "model": "gpt-5.4-mini",
        "output_line": 63633,
        "task_name": "sealed_selector_002",
        "task_path": "/root/sealed_selector_002",
        "thread_id": "01a03051-6fef-7531-a81b-95d7afc11956",
        "trace_bytes": 117209,
        "trace_sha256": "8d8f34cdf86d0cb801895206e3a55fd09be4ecb3f822c80ab8b474640ffe3786",
    },
    "charlie": {
        "call_id": "call_fSu69wtBv1Pk2LOFOkEowWgG",
        "call_line": 61376,
        "effort": "medium",
        "model": "gpt-5.6-luna",
        "output_line": 61378,
        "task_name": "goal_raw_broker_canary006_admission_review_001",
        "task_path": "/root/goal_raw_broker_canary006_admission_review_001",
        "thread_id": "01a02ffd-5d8a-7cc0-b0d9-c9359976cdb0",
        "trace_bytes": 95046,
        "trace_sha256": "4209d487dc563c377f1ad9cea72c275e05c2afea8913c0d481e5642b0727ecef",
    },
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


def identity(info):
    return (info.st_dev, info.st_ino, info.st_mode, info.st_uid)


def parent_prefix(path):
    before = path.stat(follow_symlinks=False)
    if not stat.S_ISREG(before.st_mode) or stat.S_IMODE(before.st_mode) != 0o664 or before.st_uid != os.getuid():
        raise Invalid("parent-custody")
    flags = os.O_RDONLY | os.O_CLOEXEC
    if hasattr(os, "O_NOFOLLOW"):
        flags |= os.O_NOFOLLOW
    fd = os.open(path, flags)
    try:
        opened = os.fstat(fd)
        if identity(opened) != identity(before):
            raise Invalid("parent-open-binding")
        found = {}
        with os.fdopen(os.dup(fd), "rb") as stream:
            for number, raw in enumerate(stream, 1):
                if number in PARENT_LINES:
                    found[number] = raw
                if number >= max(PARENT_LINES):
                    break
        after = os.fstat(fd)
        if identity(after) != identity(before):
            raise Invalid("parent-post-binding")
    finally:
        os.close(fd)
    if set(found) != set(PARENT_LINES):
        raise Invalid("parent-prefix-lines")
    values = {}
    for number, raw in found.items():
        expected_bytes, expected_sha = PARENT_LINES[number]
        if len(raw) != expected_bytes or hashlib.sha256(raw).hexdigest() != expected_sha or not raw.endswith(b"\n"):
            raise Invalid("parent-line-identity:" + str(number))
        values[number] = parse_json(raw[:-1], "parent-line:" + str(number))
    return values


def child_trace(path, spec):
    before = path.stat(follow_symlinks=False)
    if not stat.S_ISREG(before.st_mode) or stat.S_IMODE(before.st_mode) != 0o664 or before.st_uid != os.getuid():
        raise Invalid("child-custody:" + spec["task_name"])
    raw = path.read_bytes()
    after = path.stat(follow_symlinks=False)
    if (before.st_dev, before.st_ino, before.st_mode, before.st_uid, before.st_size, before.st_mtime_ns) != (after.st_dev, after.st_ino, after.st_mode, after.st_uid, after.st_size, after.st_mtime_ns):
        raise Invalid("child-read-drift:" + spec["task_name"])
    if len(raw) != spec["trace_bytes"] or hashlib.sha256(raw).hexdigest() != spec["trace_sha256"]:
        raise Invalid("child-identity:" + spec["task_name"])
    if not raw.endswith(b"\n") or b"\r" in raw:
        raise Invalid("child-framing:" + spec["task_name"])
    events = []
    for index, line in enumerate(raw.splitlines(keepends=True)):
        if line == b"\n" or not line.endswith(b"\n"):
            raise Invalid("child-line:" + spec["task_name"] + ":" + str(index))
        events.append(parse_json(line[:-1], "child:" + spec["task_name"] + ":" + str(index)))
    return events


def payloads(events, event_type):
    return [event["payload"] for event in events if event.get("type") == event_type and isinstance(event.get("payload"), dict)]


def check(parent_path, child_paths):
    c = Counter()
    lines = parent_prefix(parent_path)
    c.require(set(lines) == set(PARENT_LINES), "parent-line-set")
    c.require(set(child_paths) == set(ROUTES), "child-slot-set")
    observed = []
    for slot in ["alpha", "bravo", "charlie"]:
        spec = ROUTES[slot]
        call = lines[spec["call_line"]]
        output = lines[spec["output_line"]]
        c.require(call["type"] == "response_item" and call["payload"]["type"] == "function_call" and call["payload"]["name"] == "spawn_agent" and call["payload"].get("namespace") == "collaboration", "parent-call:" + slot)
        c.require(call["payload"]["call_id"] == spec["call_id"], "parent-call-id:" + slot)
        arguments = json.loads(call["payload"]["arguments"])
        c.require(set(arguments) == {"fork_turns", "message", "model", "reasoning_effort", "task_name"}, "parent-argument-shape:" + slot)
        c.require(arguments["task_name"] == spec["task_name"] and arguments["fork_turns"] == "none", "parent-task:" + slot)
        c.require(arguments["model"] == spec["model"] and arguments["reasoning_effort"] == spec["effort"], "parent-requested-route:" + slot)
        c.require(isinstance(arguments["message"], str) and len(arguments["message"]) > 100, "parent-message-present:" + slot)
        c.require(output["type"] == "response_item" and output["payload"]["type"] == "function_call_output" and output["payload"]["call_id"] == spec["call_id"], "parent-output:" + slot)
        c.require(json.loads(output["payload"]["output"]) == {"task_name": spec["task_path"]}, "parent-task-result:" + slot)
        c.require(call["timestamp"] < output["timestamp"], "parent-call-order:" + slot)
        events = child_trace(child_paths[slot], spec)
        sessions = payloads(events, "session_meta")
        contexts = payloads(events, "turn_context")
        completions = [payload for payload in payloads(events, "event_msg") if payload.get("type") == "task_complete"]
        c.require(len(sessions) == 1, "child-session-count:" + slot)
        session = sessions[0]
        c.require(session["id"] == spec["thread_id"] and session["parent_thread_id"] == PARENT_THREAD_ID and session["agent_path"] == spec["task_path"], "child-session:" + slot)
        c.require(len(contexts) == 1 and contexts[0]["model"] == spec["model"] and contexts[0]["effort"] == spec["effort"], "child-actual-route:" + slot)
        c.require(len(completions) == 1, "child-terminal:" + slot)
        observed.append({"actual_model": contexts[0]["model"], "actual_reasoning_effort": contexts[0]["effort"], "requested_model": arguments["model"], "requested_reasoning_effort": arguments["reasoning_effort"], "slot": slot, "task_path": spec["task_path"], "thread_id": spec["thread_id"]})
    c.require(observed == [
        {"actual_model": "gpt-5.4-mini", "actual_reasoning_effort": "xhigh", "requested_model": "gpt-5.4-mini", "requested_reasoning_effort": "xhigh", "slot": "alpha", "task_path": "/root/goal_raw_broker_canary006_alpha", "thread_id": "01a02ffd-f74b-7e32-9352-eba12eed7e19"},
        {"actual_model": "gpt-5.4-mini", "actual_reasoning_effort": "medium", "requested_model": "gpt-5.4-mini", "requested_reasoning_effort": "medium", "slot": "bravo", "task_path": "/root/sealed_selector_002", "thread_id": "01a03051-6fef-7531-a81b-95d7afc11956"},
        {"actual_model": "gpt-5.6-luna", "actual_reasoning_effort": "medium", "requested_model": "gpt-5.6-luna", "requested_reasoning_effort": "medium", "slot": "charlie", "task_path": "/root/goal_raw_broker_canary006_admission_review_001", "thread_id": "01a02ffd-5d8a-7cc0-b0d9-c9359976cdb0"},
    ], "exact-roster")
    return c.value, observed


def emit(status, mismatch, assertions=0, routes=None):
    value = {
        "assertion_count": assertions,
        "first_mismatch": mismatch,
        "qualification_credit": 0,
        "routes": routes,
        "schema_id": "pw-r9-codex-native-goal-exact-roster-route-capability-check-v1",
        "status": status,
        "workspace_writes": 0,
    }
    sys.stdout.write(json.dumps(value, sort_keys=True, separators=(",", ":")) + "\n")


def main():
    parser = argparse.ArgumentParser(add_help=False)
    parser.add_argument("--parent-trace")
    parser.add_argument("--alpha-trace")
    parser.add_argument("--bravo-trace")
    parser.add_argument("--charlie-trace")
    parser.add_argument("--check", action="store_true")
    args, extras = parser.parse_known_args()
    paths = [args.parent_trace, args.alpha_trace, args.bravo_trace, args.charlie_trace]
    if extras or not args.check or not all(paths) or not all(os.path.isabs(value) for value in paths):
        emit("FAIL", "CLI must be --parent-trace ABS --alpha-trace ABS --bravo-trace ABS --charlie-trace ABS --check")
        return 1
    try:
        assertions, routes = check(Path(args.parent_trace), {"alpha": Path(args.alpha_trace), "bravo": Path(args.bravo_trace), "charlie": Path(args.charlie_trace)})
    except (Invalid, OSError, KeyError, IndexError, TypeError, ValueError, json.JSONDecodeError) as exc:
        emit("FAIL", str(exc))
        return 1
    emit("PASS_MECHANICAL_EXACT_ROSTER_ROUTE_CAPABILITY_ZERO_CREDIT", None, assertions, routes)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
