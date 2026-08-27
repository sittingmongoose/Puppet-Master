#!/usr/bin/env python3
import argparse
import hashlib
import json
import os
import stat
import sys
from pathlib import Path

SOURCE_BYTES = 101931
SOURCE_SHA256 = "c34ec8b9e2eba93560f3f5c8087b7e2e91cc467884d12000fdb83c6d338dfc7a"
SELECTION_BYTES = 3572
SELECTION_SHA256 = "a4c066fa712c76ee220c5c4332422f159fd99c32bd8022cfeace8bf6820a81db"
IMPLEMENTATION_BYTES = 4349
IMPLEMENTATION_SHA256 = "3f77464e28eb2b72e03856c5f6ccbc190df466626d89d735872f915da7918b20"
READER_BYTES = 4830
READER_SHA256 = "5dd91d04f5a1a3ff831697a958d4b027c88a665329e4477a1bf549edb2d17e4a"
PACKET_BYTES = 486
PACKET_SHA256 = "0c9041ea70a5c97a785682402e22149c56a663fefae915f1a14500cc70463ee2"
TASK_PATH = "/root/sealed_packet_reader_001"
OBJECTIVE = "sealed:v3:c005b00002;no-retry"
EXPECTED = "invalidate_and_repeat_owner_checks"
INITIAL = "Start one native Goal with objective `sealed:v3:c005b00002;no-retry` as your first tool call. Before ACTIVE, do not read files or use skills. After ACTIVE, reply exactly `ACTIVE` and wait for one follow-up."
FOLLOW = "RUN|v1|cmd=PYTHONDONTWRITEBYTECODE=1 python3 -B read_packet.py|cwd=/mnt/Cursor/PuppetMaster/tests/r9_goal_packet/q10|yield_ms=10000|login=false|max_output_tokens=4000|stdout_bytes=486|stdout_sha256=0c9041ea70a5c97a785682402e22149c56a663fefae915f1a14500cc70463ee2|then=solve_update_current_goal_complete_return_OUTCOME"
CASE_DIR = "/mnt/Cursor/PuppetMaster/tests/r9_goal_packet/q10"


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


def read_regular(path, expected_mode, maximum=None):
    before = path.stat(follow_symlinks=False)
    if not stat.S_ISREG(before.st_mode) or stat.S_IMODE(before.st_mode) != expected_mode or before.st_uid != os.getuid():
        raise Invalid("custody:" + path.name)
    if maximum is not None and before.st_size > maximum:
        raise Invalid("size-cap:" + path.name)
    raw = path.read_bytes()
    after = path.stat(follow_symlinks=False)
    identity = lambda info: (info.st_dev, info.st_ino, info.st_mode, info.st_uid, info.st_size, info.st_mtime_ns)
    if identity(before) != identity(after) or len(raw) != before.st_size:
        raise Invalid("read-drift:" + path.name)
    return raw


def exact_file(path, expected_bytes, expected_sha256, expected_mode):
    raw = read_regular(path, expected_mode)
    if len(raw) != expected_bytes or hashlib.sha256(raw).hexdigest() != expected_sha256:
        raise Invalid("identity:" + path.name)
    return raw


def canonical(path, expected_bytes=None, expected_sha256=None):
    raw = read_regular(path, 0o644, max(20000, expected_bytes or 0))
    if expected_bytes is not None and (len(raw) != expected_bytes or hashlib.sha256(raw).hexdigest() != expected_sha256):
        raise Invalid("identity:" + path.name)
    if not raw.endswith(b"\n") or raw[:-1].find(b"\n") != -1 or b"\r" in raw:
        raise Invalid("framing:" + path.name)
    value = parse_json(raw, path.name)
    encoded = json.dumps(value, sort_keys=True, separators=(",", ":"), ensure_ascii=False, allow_nan=False).encode() + b"\n"
    if encoded != raw:
        raise Invalid("canonical:" + path.name)
    return value, raw


def parse_trace(path):
    raw = read_regular(path, 0o664, 500000)
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
        if event.get("type") != event_type or not isinstance(event.get("payload"), dict):
            continue
        payload = event["payload"]
        if payload_type is None or payload.get("type") == payload_type:
            values.append((event["timestamp"], payload))
    return values


def check(admission_path, trace_path):
    c = Counter()
    admission, admission_raw = canonical(admission_path)
    c.require(admission["schema_id"] == "pw-r9-codex-native-goal-post-active-exact-packet-reader-probe-admission-v1", "admission-schema")
    c.require(admission["authority"] == {"canary_launch": False, "matrix_launch": False, "qualification": False, "qualification_credit": 0, "release": False, "single_transport_probe_exactly_once": True, "subject_call_limit": 1}, "admission-authority")
    c.require(admission["launch"] == {"fork_turns": "none", "initial_message": {"bytes": 206, "sha256": "c86b05a4ed03a44ce8c2e3b76d679b64401ebc8d2872313fcd516abb993085f5", "utf8": INITIAL}, "model": "gpt-5.4-mini", "objective": {"bytes": 29, "sha256": "613a9c162e33a67fe1b3d522d39ecfd29c028df78e1e8a17ec2c23aff11bc4cc", "utf8": OBJECTIVE}, "reasoning_effort": "medium", "task_name": "sealed_packet_reader_001"}, "admission-launch")
    c.require(admission["followup"] == {"bytes": 317, "sha256": "bdafbb60b51588c01ca54747e0a582e3ee55d6c7e143d799686651e0c3e82081", "utf8": FOLLOW}, "admission-followup")
    c.require(admission["expected_outcome"] == {"bytes": 34, "sha256": "51dac067730f2f6f6d9d4c60c90ed523cfbee2b9320d390351f2d81e32c67c38", "utf8": EXPECTED}, "admission-expected")
    c.require(admission["qualification"] == {"clean_full_matrix_streak": 0, "score": "0/2", "this_probe_cannot_increment_streak": True}, "admission-qualification")
    base = admission_path.parent
    binding_specs = {
        "implementation_success": (base / "r9_codex_native_goal_post_active_exact_packet_reader_probe_001_implementation_success_receipt_v1.json", IMPLEMENTATION_BYTES, IMPLEMENTATION_SHA256, 0o644, "r9_codex_native_goal_post_active_exact_packet_reader_probe_001_implementation_success_receipt_v1.json"),
        "packet": (Path(CASE_DIR) / "packet.txt", PACKET_BYTES, PACKET_SHA256, 0o444, "tests/r9_goal_packet/q10/packet.txt"),
        "reader": (Path(CASE_DIR) / "read_packet.py", READER_BYTES, READER_SHA256, 0o644, "tests/r9_goal_packet/q10/read_packet.py"),
        "selection": (base / "r9_codex_native_goal_post_active_exact_packet_reader_probe_001_selection_v1.json", SELECTION_BYTES, SELECTION_SHA256, 0o644, "r9_codex_native_goal_post_active_exact_packet_reader_probe_001_selection_v1.json"),
        "source_cell": (base / "codex_native_goal_direct_canary_002_public_plan_v1/cells/cell-005/slot-bravo.json", SOURCE_BYTES, SOURCE_SHA256, 0o644, "codex_native_goal_direct_canary_002_public_plan_v1/cells/cell-005/slot-bravo.json"),
        "runtime_checker": (Path(__file__), len(Path(__file__).read_bytes()), hashlib.sha256(Path(__file__).read_bytes()).hexdigest(), 0o644, "r9_codex_native_goal_post_active_exact_packet_reader_probe_001_runtime_checker_v1.py"),
    }
    c.require(set(admission["bindings"]) == set(binding_specs), "admission-bindings")
    for name, (path, size, digest, mode, record_path) in binding_specs.items():
        expected = {"bytes": size, "mode": format(mode, "04o"), "path": record_path, "sha256": digest}
        c.require(admission["bindings"][name] == expected, "binding-record:" + name)
        exact_file(path, size, digest, mode)
        c.require(True, "binding-reopen:" + name)
    packet = exact_file(Path(CASE_DIR) / "packet.txt", PACKET_BYTES, PACKET_SHA256, 0o444)
    reader_raw = exact_file(Path(CASE_DIR) / "read_packet.py", READER_BYTES, READER_SHA256, 0o644)
    c.require(b"os.write(1, raw)" in reader_raw and b"validate(raw)" in reader_raw, "reader-stdout-path")
    events, trace_raw = parse_trace(trace_path)
    sessions = payloads(events, "session_meta")
    c.require(len(sessions) == 1, "session-count")
    session = sessions[0][1]
    thread_id = session["id"]
    c.require(session["source"]["subagent"]["thread_spawn"]["agent_path"] == TASK_PATH, "task-path")
    contexts = payloads(events, "turn_context")
    c.require(len(contexts) >= 2 and all(item[1]["model"] == "gpt-5.4-mini" and item[1]["effort"] == "medium" for item in contexts), "route")
    calls = payloads(events, "response_item", "function_call")
    c.require([payload["name"] for _, payload in calls] == ["create_goal", "exec_command", "update_goal"], "call-sequence")
    create_time, create = calls[0]
    reader_time, reader = calls[1]
    update_time, update = calls[2]
    c.require(json.loads(create["arguments"]) == {"objective": OBJECTIVE}, "create-arguments")
    c.require(json.loads(reader["arguments"]) == {"cmd": "PYTHONDONTWRITEBYTECODE=1 python3 -B read_packet.py", "login": False, "max_output_tokens": 4000, "workdir": CASE_DIR, "yield_time_ms": 10000}, "reader-arguments")
    c.require(json.loads(update["arguments"]) == {"status": "complete"}, "update-arguments")
    outputs = {payload["call_id"]: (timestamp, payload["output"]) for timestamp, payload in payloads(events, "response_item", "function_call_output")}
    c.require(set(outputs) == {create["call_id"], reader["call_id"], update["call_id"]}, "output-correlation")
    active_time, active_raw = outputs[create["call_id"]]
    reader_output_time, reader_output = outputs[reader["call_id"]]
    complete_time, complete_raw = outputs[update["call_id"]]
    active = json.loads(active_raw)
    complete = json.loads(complete_raw)
    c.require(active["goal"] == {"createdAt": active["goal"]["createdAt"], "objective": OBJECTIVE, "status": "active", "threadId": thread_id, "timeUsedSeconds": 0, "tokensUsed": 0, "updatedAt": active["goal"]["updatedAt"]}, "active-receipt")
    c.require(complete["goal"]["threadId"] == thread_id and complete["goal"]["objective"] == OBJECTIVE and complete["goal"]["status"] == "complete", "complete-receipt")
    c.require(isinstance(complete["goal"]["tokensUsed"], int) and complete["goal"]["tokensUsed"] > 0 and isinstance(complete["goal"]["timeUsedSeconds"], int) and complete["goal"]["timeUsedSeconds"] > 0, "complete-usage")
    c.require("Process exited with code 0" in reader_output and "Output:\n" in reader_output, "reader-wrapper")
    tool_visible = reader_output.split("Output:\n", 1)[1].encode("utf-8")
    c.require(tool_visible == packet, "packet-tool-visible-exact")
    root_messages = [(timestamp, payload) for timestamp, payload in payloads(events, "response_item", "agent_message") if payload.get("author") == "/root"]
    c.require(len(root_messages) == 2 and all(payload.get("recipient") == TASK_PATH for _, payload in root_messages), "root-messages")
    c.require(all(any(item.get("type") == "encrypted_content" for item in payload.get("content", [])) for _, payload in root_messages), "encrypted-parent-message-nonclaim")
    c.require(root_messages[0][0] < create_time < active_time < root_messages[1][0] < reader_time < reader_output_time < update_time < complete_time, "lifecycle-order")
    pre_reader = json.dumps([event for event in events if event["timestamp"] < reader_output_time], sort_keys=True, separators=(",", ":"), ensure_ascii=False)
    c.require(EXPECTED not in pre_reader and node_subject(packet) not in pre_reader, "no-scored-bytes-before-reader-output")
    finals = [(timestamp, payload["message"]) for timestamp, payload in payloads(events, "event_msg", "agent_message") if payload.get("phase") == "final_answer"]
    c.require(finals[-1][1].splitlines()[0] == "OUTCOME:" + EXPECTED, "terminal-outcome")
    c.require(any(message == "ACTIVE" for _, message in finals[:-1]), "active-turn-terminal")
    completions = payloads(events, "event_msg", "task_complete")
    c.require(completions and completions[-1][1]["last_agent_message"].splitlines()[0] == "OUTCOME:" + EXPECTED, "task-complete")
    c.require(complete_time < finals[-1][0] <= completions[-1][0], "terminal-order")
    c.require(len(("OUTCOME:" + EXPECTED).encode()) == 42 and hashlib.sha256(("OUTCOME:" + EXPECTED).encode()).hexdigest() == "a47a8a9871cc9c1ac12c888585b3c4bd48aeffa4b9d58a2d283713fb156e0fe6", "terminal-identity")
    return c.value, admission_raw, trace_raw, thread_id, active_time, complete_time, finals[-1][0], complete["goal"]


def node_subject(packet):
    return packet.split(b"\n")[1].decode("utf-8")


def emit(status, mismatch, assertions=0, facts=None):
    value = {"assertion_count": assertions, "facts": facts, "first_mismatch": mismatch, "message_plaintext_rederived": False, "schema_id": "pw-r9-codex-native-goal-post-active-exact-packet-reader-runtime-check-v1", "status": status, "workspace_writes": 0}
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
        assertions, admission_raw, trace_raw, thread_id, active_at, complete_at, final_at, goal = check(Path(args.admission), Path(args.trace))
        facts = {"admission_bytes": len(admission_raw), "admission_sha256": hashlib.sha256(admission_raw).hexdigest(), "goal_active_at": active_at, "goal_complete_at": complete_at, "goal_thread_id": thread_id, "goal_time_used_seconds": goal["timeUsedSeconds"], "goal_tokens_used": goal["tokensUsed"], "terminal_final_at": final_at, "trace_bytes": len(trace_raw), "trace_sha256": hashlib.sha256(trace_raw).hexdigest()}
    except (Invalid, OSError, KeyError, IndexError, TypeError, ValueError, json.JSONDecodeError) as exc:
        emit("FAIL", str(exc))
        return 1
    emit("PASS_MECHANICAL_RUNTIME_EXACT_PACKET_VISIBLE_ZERO_CREDIT", None, assertions, facts)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
