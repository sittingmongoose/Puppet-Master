#!/usr/bin/env python3
import argparse
import hashlib
import json
import os
import stat
import sys
from pathlib import Path

ADMISSION_BYTES = 3406
ADMISSION_SHA256 = "687f49c80348deff8864ccec3eb02de80dda375139467833381b797d47ee81d2"
READY_BYTES = 67
READY_SHA256 = "08228aa15b823aae5071a730798f618f802454992962d17474b484e1ef37720b"
TRACE_BYTES = 117209
TRACE_SHA256 = "8d8f34cdf86d0cb801895206e3a55fd09be4ecb3f822c80ab8b474640ffe3786"
THREAD_ID = "01a03051-6fef-7531-a81b-95d7afc11956"
OBJECTIVE = "sealed:v2:c005b00000;no-retry"
EXPECTED = "A-S04"


class Invalid(Exception):
    pass


def require(value, mismatch):
    if not value:
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


def regular_bytes(path, expected_bytes, expected_sha256, expected_mode):
    info = path.stat(follow_symlinks=False)
    require(stat.S_ISREG(info.st_mode), "regular:" + path.name)
    require(stat.S_IMODE(info.st_mode) == expected_mode, "mode:" + path.name)
    raw = path.read_bytes()
    require(len(raw) == expected_bytes, "bytes:" + path.name)
    require(hashlib.sha256(raw).hexdigest() == expected_sha256, "sha256:" + path.name)
    return raw


def canonical_file(path, expected_bytes, expected_sha256, expected_mode=0o644):
    raw = regular_bytes(path, expected_bytes, expected_sha256, expected_mode)
    require(raw.endswith(b"\n") and raw[:-1].find(b"\n") == -1 and b"\r" not in raw, "framing:" + path.name)
    value = parse_json(raw, path.name)
    encoded = json.dumps(value, sort_keys=True, separators=(",", ":"), ensure_ascii=False, allow_nan=False).encode() + b"\n"
    require(encoded == raw, "canonical:" + path.name)
    return value


def parse_jsonl(path):
    raw = regular_bytes(path, TRACE_BYTES, TRACE_SHA256, 0o664)
    require(raw.endswith(b"\n") and b"\r" not in raw, "trace-framing")
    events = []
    for index, line in enumerate(raw.splitlines(keepends=True)):
        require(line.endswith(b"\n") and line != b"\n", "trace-line")
        events.append(parse_json(line[:-1], "trace:" + str(index)))
    return events


def payloads(events, event_type, payload_type=None):
    values = []
    for event in events:
        if event.get("type") != event_type:
            continue
        payload = event.get("payload")
        if not isinstance(payload, dict):
            continue
        if payload_type is None or payload.get("type") == payload_type:
            values.append((event["timestamp"], payload))
    return values


def check(admission_path, trace_path, ready_path):
    admission = canonical_file(admission_path, ADMISSION_BYTES, ADMISSION_SHA256)
    require(admission["schema_id"] == "pw-r9-codex-native-goal-parent-parsed-real-atom-admission-v1", "admission-schema")
    require(admission["authority"]["real_atom_launch_exactly_once"] is True, "launch-authority")
    require(admission["authority"]["qualification"] is False and admission["authority"]["qualification_credit"] == 0, "zero-credit")
    require(admission["qualification"] == {"clean_full_matrix_streak": 0, "score": "0/2", "this_atom_cannot_increment_streak": True}, "qualification")
    ready = canonical_file(ready_path, READY_BYTES, READY_SHA256, 0o444)
    require(ready["schema_id"] == "pw-r9-goal-post-active-delay-ready-v1", "ready-schema")
    require(isinstance(ready["pid"], int) and ready["pid"] > 1, "ready-pid")
    events = parse_jsonl(trace_path)
    sessions = payloads(events, "session_meta")
    require(len(sessions) == 1, "session-count")
    session = sessions[0][1]
    require(session["id"] == THREAD_ID, "session-id")
    require(session["source"]["subagent"]["thread_spawn"]["agent_path"] == "/root/sealed_selector_002", "task-path")
    contexts = payloads(events, "turn_context")
    require(contexts and contexts[0][1]["model"] == "gpt-5.4-mini", "model")
    require(contexts[0][1]["effort"] == "medium", "effort")
    calls = payloads(events, "response_item", "function_call")
    require([payload["name"] for _, payload in calls] == ["create_goal", "exec_command", "update_goal"], "call-sequence")
    create_time, create = calls[0]
    delay_time, delay = calls[1]
    update_time, update = calls[2]
    require(json.loads(create["arguments"]) == {"objective": OBJECTIVE}, "create-arguments")
    require(json.loads(delay["arguments"]) == {
        "cmd": "python3 -B delay.py",
        "login": False,
        "max_output_tokens": 4000,
        "workdir": "/mnt/Cursor/PuppetMaster/tests/r9_goal_delay/q9",
        "yield_time_ms": 30000,
    }, "delay-arguments")
    require(json.loads(update["arguments"]) == {"status": "complete"}, "update-arguments")
    outputs = {payload["call_id"]: (timestamp, payload["output"]) for timestamp, payload in payloads(events, "response_item", "function_call_output")}
    require(set(outputs) == {create["call_id"], delay["call_id"], update["call_id"]}, "output-correlation")
    active_time, active_raw = outputs[create["call_id"]]
    delay_output_time, delay_raw = outputs[delay["call_id"]]
    complete_time, complete_raw = outputs[update["call_id"]]
    active = json.loads(active_raw)
    complete = json.loads(complete_raw)
    require(active["goal"]["threadId"] == THREAD_ID and active["goal"]["status"] == "active", "active-receipt")
    require(active["goal"]["objective"] == OBJECTIVE, "active-objective")
    require(complete["goal"]["threadId"] == THREAD_ID and complete["goal"]["status"] == "complete", "complete-receipt")
    require(complete["goal"]["objective"] == OBJECTIVE, "complete-objective")
    require("Process exited with code 0" in delay_raw and delay_raw.endswith("Output:\nREADY"), "delay-output")
    root_messages = [(timestamp, payload) for timestamp, payload in payloads(events, "response_item", "agent_message") if payload.get("author") == "/root"]
    require(len(root_messages) == 3, "root-message-count")
    require([payload["recipient"] for _, payload in root_messages] == ["/root/sealed_selector_002"] * 3, "root-message-recipient")
    visible_headers = [[item["text"] for item in payload["content"] if item.get("type") == "input_text"] for _, payload in root_messages]
    require("Message Type: NEW_TASK" in visible_headers[0][0], "new-task-header")
    require(all("Message Type: MESSAGE" in values[0] for values in visible_headers[1:]), "queued-message-headers")
    require(all(any(item.get("type") == "encrypted_content" for item in payload["content"]) for _, payload in root_messages), "encrypted-message-binding")
    require(create_time < active_time < delay_time < root_messages[1][0] <= root_messages[2][0] < update_time < complete_time, "lifecycle-order")
    finals = [(timestamp, payload) for timestamp, payload in payloads(events, "event_msg", "agent_message") if payload.get("phase") == "final_answer"]
    require(len(finals) == 1 and finals[0][1]["message"] == "OUTCOME:" + EXPECTED, "final")
    completions = payloads(events, "event_msg", "task_complete")
    require(len(completions) == 1 and completions[0][1]["last_agent_message"] == "OUTCOME:" + EXPECTED, "task-complete")
    require(complete_time < finals[0][0] <= completions[0][0], "terminal-order")
    require(len(("OUTCOME:" + EXPECTED).encode()) == 13, "final-bytes")
    require(hashlib.sha256(("OUTCOME:" + EXPECTED).encode()).hexdigest() == "85a303b0ef09b2deff246df056a4064723784014a1124b586325e0ddcc3883a4", "final-sha256")
    return 34


def emit(status, mismatch, assertions=0):
    value = {
        "assertion_count": assertions,
        "first_mismatch": mismatch,
        "message_plaintext_rederived": False,
        "schema_id": "pw-r9-codex-native-goal-parent-parsed-real-atom-runtime-check-v1",
        "status": status,
        "workspace_writes": 0,
    }
    sys.stdout.write(json.dumps(value, sort_keys=True, separators=(",", ":")) + "\n")


def main():
    parser = argparse.ArgumentParser(add_help=False)
    parser.add_argument("--admission")
    parser.add_argument("--trace")
    parser.add_argument("--ready")
    parser.add_argument("--check", action="store_true")
    args, extras = parser.parse_known_args()
    if extras or not args.check or not all([args.admission, args.trace, args.ready]) or not all(os.path.isabs(value) for value in [args.admission, args.trace, args.ready]):
        emit("FAIL", "CLI must be --admission ABS --trace ABS --ready ABS --check")
        return 1
    try:
        assertions = check(Path(args.admission), Path(args.trace), Path(args.ready))
    except (Invalid, OSError, KeyError, IndexError, TypeError, json.JSONDecodeError) as exc:
        emit("FAIL", str(exc))
        return 1
    emit("PASS_MECHANICAL_RUNTIME_ZERO_CREDIT", None, assertions)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
