#!/usr/bin/env python3
import fcntl
import hashlib
import importlib.util
import json
import math
import os
import re
import stat
import sys
import time

sys.dont_write_bytecode = True
HERE = "/mnt/Cursor/PuppetMaster/tests/r9g14"
ROOT = HERE + "/r"
RUNTIME_PATH = HERE + "/runtime.py"
VERIFIER_PATH = HERE + "/offline_verify.py"
MODEL_CHECK_PATH = HERE + "/runtime_model_check.py"
PROTOTYPE_PATH = HERE + "/prototype.py"
PROTOTYPE_BYTES = 36666
PROTOTYPE_SHA256 = "aa7d48a8fc6f8ffb933a98fb6063fa8202646c1648f81b69a41613b9e2cd90ea"
ARCHITECTURE_PATH = "/mnt/Cursor/PuppetMaster/tests/agent_packet_restrictions/successor_20260813/r9_control_plane_stabilization_v1/r9_codex_native_goal_single_turn_blocking_mailbox_architecture_v7.json"
ARCHITECTURE_BYTES = 9166
ARCHITECTURE_SHA256 = "2976364b0f548d86ffb66c71e9a5b6526237a7df7839a833552580db698df53c"
REVIEW_PATH = "/mnt/Cursor/PuppetMaster/tests/agent_packet_restrictions/successor_20260813/r9_control_plane_stabilization_v1/r9_codex_native_goal_single_turn_blocking_mailbox_v7_architecture_review_002_success_receipt_v1.json"
REVIEW_BYTES = 2817
REVIEW_SHA256 = "52e978285e6184c71a403b5a4c0c4e595eacac5af22e0f06cc8d74b89ce68273"
DATA_VALIDATION_BYTES = 3026
DATA_VALIDATION_SHA256 = "d48db71f85b946c496eb41c7cb5f8ef32ea28d2a552a096fd9cd17fe0fa2f07f"
PARENT_THREAD_ID = "01a00b52-4879-7c41-a826-7b4609ad3c3b"
SESSION_PREFIX = "/home/sittingmongoose/.codex/sessions/"
CONTROL_ROOT = "/mnt/Cursor/PuppetMaster/tests/agent_packet_restrictions/successor_20260813/r9_control_plane_stabilization_v1"
DATA_VALIDATION_PATH = CONTROL_ROOT + "/r9_codex_native_goal_single_turn_blocking_mailbox_v7_data_only_validation_v1.json"
ROUTES = ("slot-alpha", "slot-bravo", "slot-charlie")
ROUTE_CODES = {"slot-alpha": "a", "slot-bravo": "b", "slot-charlie": "c"}
CODE_ROUTES = {value: key for key, value in ROUTE_CODES.items()}
HEX_RE = re.compile(r"^[0-9a-f]{64}$")
UUID_RE = re.compile(r"^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$")
TOKEN_RE = re.compile(r"^[A-Za-z0-9._:-]{1,48}$")
PREPARED = ["predeclaration.json", "spawn_prompt.txt", "wait.py"]
WAITING = ["predeclaration.json", "ready.json", "spawn_prompt.txt", "wait.py"]
ACTIVE = ["active.json", "active_trace.jsonl", "predeclaration.json", "ready.json", "spawn_prompt.txt", "subject.txt", "wait.py"]
TERMINAL = sorted(ACTIVE + ["goal_receipt.json", "result.txt", "subject_token.txt", "terminal_trace.jsonl"])
BASE_RUN = ["run.json", "run.lock", "schedule.jsonl", "schedule_offsets.json"]
SEQUENCE = ("C03", "013", "014")
GATE_NAMES = {
    "C03": "r9_codex_native_goal_single_turn_blocking_mailbox_v7_canary_003_launch_admission_v1.json",
    "013": "r9_codex_native_goal_single_turn_blocking_mailbox_v7_matrix_013_launch_admission_v1.json",
    "014": "r9_codex_native_goal_single_turn_blocking_mailbox_v7_matrix_014_launch_admission_v1.json",
}
GATE_SCHEMAS = {code: "pw-r9-codex-native-goal-single-turn-blocking-mailbox-v7-{}-launch-admission-v1".format(code.lower()) for code in SEQUENCE}
GATE_STATUSES = {code: "AUTHORIZE_EXACT_{}_SINGLE_LAUNCH_ZERO_CREDIT".format(code) for code in SEQUENCE}
PREDECESSOR_STATUSES = {
    "C03": "PASS_V7_IMPLEMENTATION_AND_CANARY_ADMISSION_ZERO_CREDIT",
    "013": "PASS_C03_CLEAN_AUTHORIZE_MATRIX_013_ZERO_CREDIT",
    "014": "PASS_MATRIX_013_CLEAN_AUTHORIZE_MATRIX_014_ZERO_CREDIT",
}


class Invalid(Exception):
    pass


def require(value, mismatch):
    if not value:
        raise Invalid(mismatch)


def pairs(items):
    output = {}
    for key, value in items:
        require(key not in output, "duplicate-key:" + key)
        output[key] = value
    return output


def parse(raw):
    return json.loads(raw.decode("utf-8"), object_pairs_hook=pairs, parse_constant=lambda value: (_ for _ in ()).throw(Invalid("nonfinite:" + value)))


def canonical(value, newline=True):
    raw = json.dumps(value, ensure_ascii=False, allow_nan=False, sort_keys=True, separators=(",", ":")).encode("utf-8")
    return raw + (b"\n" if newline else b"")


def sha(raw):
    return hashlib.sha256(raw).hexdigest()


def metadata(info):
    return (info.st_dev, info.st_ino, info.st_mode, info.st_uid, info.st_nlink, info.st_size, info.st_mtime_ns)


def read_bound(path, mode, cap, expected_bytes=None, expected_sha=None):
    before = os.lstat(path)
    require(stat.S_ISREG(before.st_mode) and stat.S_IMODE(before.st_mode) == mode, "read-custody:" + path)
    require(before.st_uid == os.getuid() and before.st_nlink == 1 and before.st_size <= cap, "read-owner-size:" + path)
    if expected_bytes is not None:
        require(before.st_size == expected_bytes, "read-bytes:" + path)
    fd = os.open(path, os.O_RDONLY | os.O_NOFOLLOW | os.O_CLOEXEC)
    try:
        require(metadata(os.fstat(fd)) == metadata(before), "read-open-race:" + path)
        raw = b""
        while len(raw) < before.st_size:
            chunk = os.read(fd, before.st_size - len(raw))
            require(bool(chunk), "read-short:" + path)
            raw += chunk
        require(os.read(fd, 1) == b"", "read-trailing:" + path)
    finally:
        os.close(fd)
    require(metadata(os.lstat(path)) == metadata(before), "read-drift:" + path)
    if expected_sha is not None:
        require(sha(raw) == expected_sha, "read-sha:" + path)
    return raw


def read_json(path, mode=0o444, cap=100000):
    raw = read_bound(path, mode, cap)
    value = parse(raw)
    require(raw == canonical(value), "json-canonical:" + path)
    return value, raw


def require_dir(path, mode=0o700):
    info = os.lstat(path)
    require(stat.S_ISDIR(info.st_mode) and not stat.S_ISLNK(info.st_mode), "dir-kind:" + path)
    require(stat.S_IMODE(info.st_mode) == mode and info.st_uid == os.getuid(), "dir-custody:" + path)
    return info


def fsync_dir(path):
    fd = os.open(path, os.O_RDONLY | os.O_DIRECTORY | os.O_NOFOLLOW | os.O_CLOEXEC)
    try:
        os.fsync(fd)
    finally:
        os.close(fd)


def make_dir(path, parent):
    os.mkdir(path, 0o700)
    os.chmod(path, 0o700)
    require_dir(path)
    fsync_dir(parent)


def write_all(fd, raw):
    view = memoryview(raw)
    while view:
        count = os.write(fd, view)
        require(count > 0, "write")
        view = view[count:]


def publish(path, raw, mode=0o444):
    fd = os.open(path, os.O_WRONLY | os.O_CREAT | os.O_EXCL | os.O_NOFOLLOW | os.O_CLOEXEC, mode)
    try:
        os.fchmod(fd, mode)
        write_all(fd, raw)
        os.fsync(fd)
        info = os.fstat(fd)
        require(stat.S_ISREG(info.st_mode) and stat.S_IMODE(info.st_mode) == mode and info.st_uid == os.getuid(), "publish-custody")
        require(info.st_nlink == 1 and info.st_size == len(raw), "publish-size")
    finally:
        os.close(fd)
    fsync_dir(os.path.dirname(path))
    require(read_bound(path, mode, len(raw), len(raw), sha(raw)) == raw, "publish-reopen")


def identity(path, mode=0o644, cap=300000):
    raw = read_bound(path, mode, cap)
    return {"bytes": len(raw), "mode": "{:04o}".format(mode), "path": path, "sha256": sha(raw)}


def load_prototype():
    read_bound(PROTOTYPE_PATH, 0o644, PROTOTYPE_BYTES, PROTOTYPE_BYTES, PROTOTYPE_SHA256)
    spec = importlib.util.spec_from_file_location("r9g14_runtime_prototype", PROTOTYPE_PATH)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def load_control():
    prototype = load_prototype()
    recipe, source, source_recipe, public = prototype.load()
    architecture_raw = read_bound(ARCHITECTURE_PATH, 0o644, ARCHITECTURE_BYTES, ARCHITECTURE_BYTES, ARCHITECTURE_SHA256)
    review_raw = read_bound(REVIEW_PATH, 0o644, REVIEW_BYTES, REVIEW_BYTES, REVIEW_SHA256)
    architecture = parse(architecture_raw)
    review = parse(review_raw)
    require(architecture_raw == canonical(architecture) and architecture["status"] == "FROZEN_PROPOSED_IMPLEMENTATION_ZERO_CREDIT_NO_EMPIRICAL_AUTHORITY", "architecture")
    require(review_raw == canonical(review) and review["status"] == "PASS_FRESH_GOAL_NATIVE_ARCHITECTURE_REVIEW_IMPLEMENTATION_ONLY", "review")
    require(review["authority"] == {"canary_launch": False, "implementation": True, "matrix_launch": False, "qualification": False, "release": False, "review_pass": True, "subject_launch": False}, "review-authority")
    return prototype, recipe, source, source_recipe, public


def matrix_spec(recipe, code):
    require(code in recipe["matrix_map"], "matrix-code")
    return recipe["matrix_map"][code]


def run_root(code):
    return ROOT + "/" + code


def row_root(code, wave, route_code, nonce):
    return run_root(code) + "/{:04d}/{}/{}".format(wave, route_code, nonce)


def schedule_bytes(records):
    lines = []
    offsets = []
    offset = 0
    for record in records:
        line = canonical(record)
        lines.append(line)
        offsets.append([offset, len(line)])
        offset += len(line)
    raw = b"".join(lines)
    index = {
        "count": len(records),
        "entries": offsets,
        "schedule_bytes": len(raw),
        "schedule_sha256": sha(raw),
        "schema_id": "pw-r9-codex-native-goal-single-turn-blocking-schedule-offsets-v1",
    }
    return raw, canonical(index)


def load_run(code):
    root = run_root(code)
    require_dir(root)
    run, _ = read_json(root + "/run.json", 0o444, 100000)
    require(set(run) == {
        "components", "failure_contract", "launch_admission", "matrix_code", "matrix_id", "qualification", "schedule",
        "schedule_offsets", "schema_id", "status", "subject_task_count", "wave_count",
    }, "run-fields")
    require(run["schema_id"] == "pw-r9-codex-native-goal-single-turn-blocking-mailbox-run-v7", "run-schema")
    require(run["matrix_code"] == code and run["status"] == "OPEN_ZERO_CREDIT", "run-bind")
    require(run["components"] == component_identities(), "run-components")
    require(run["failure_contract"] == {"best_of": 0, "relaunch": 0, "replacement": 0, "resend": 0, "retry": 0, "reuse": 0}, "run-failure")
    require(run["qualification"] == {"canary_credit": 0, "clean_full_matrix_streak": 0, "credit": "0/2", "qualification_credit": 0}, "run-qualification")
    launch = run["launch_admission"]
    require(set(launch) == {"bytes", "mode", "path", "sha256", "status"} and launch["mode"] == "0644", "run-launch-fields")
    read_bound(launch["path"], 0o644, launch["bytes"], launch["bytes"], launch["sha256"])
    return root, run


def lock_run(code, exclusive):
    root, run = load_run(code)
    before = os.lstat(root + "/run.lock")
    require(stat.S_ISREG(before.st_mode) and stat.S_IMODE(before.st_mode) == 0o600 and before.st_uid == os.getuid(), "lock-custody")
    fd = os.open(root + "/run.lock", os.O_RDWR | os.O_NOFOLLOW | os.O_CLOEXEC)
    try:
        fcntl.flock(fd, (fcntl.LOCK_EX if exclusive else fcntl.LOCK_SH) | fcntl.LOCK_NB)
    except BaseException:
        os.close(fd)
        raise
    require((os.fstat(fd).st_dev, os.fstat(fd).st_ino) == (before.st_dev, before.st_ino), "lock-race")
    return root, run, fd


def schedule_record(root, run, wave, route_index):
    index, index_raw = read_json(root + "/schedule_offsets.json", 0o444, 1000000)
    require(run["schedule_offsets"] == {"bytes": len(index_raw), "sha256": sha(index_raw)}, "schedule-index-bind")
    require(index["count"] == run["subject_task_count"] and index["schedule_bytes"] == run["schedule"]["bytes"] and index["schedule_sha256"] == run["schedule"]["sha256"], "schedule-index-values")
    position = wave * 3 + route_index
    require(0 <= position < index["count"], "schedule-position")
    offset, length = index["entries"][position]
    path = root + "/schedule.jsonl"
    before = os.lstat(path)
    require(stat.S_ISREG(before.st_mode) and stat.S_IMODE(before.st_mode) == 0o444 and before.st_size == run["schedule"]["bytes"], "schedule-custody")
    fd = os.open(path, os.O_RDONLY | os.O_NOFOLLOW | os.O_CLOEXEC)
    try:
        raw = os.pread(fd, length, offset)
    finally:
        os.close(fd)
    require(metadata(os.lstat(path)) == metadata(before), "schedule-drift")
    require(len(raw) == length and raw.endswith(b"\n"), "schedule-read")
    record = parse(raw[:-1])
    require(raw == canonical(record) and record["wave_index"] == wave, "schedule-record")
    return record


def public_contract(source, source_recipe, record):
    cell, node = source.source_node(source_recipe, record)
    return source.result_contract(node, cell), cell, node


def canonical_result(token, contract):
    require(isinstance(token, str) and TOKEN_RE.fullmatch(token) is not None, "result-token")
    raw = token.encode("utf-8")
    require(1 <= len(raw) <= contract["max_bytes"], "result-size")
    if contract["kind"] == "regex":
        require(contract["min_bytes"] <= len(raw) and re.fullmatch(contract["pattern"], token), "result-regex")
        return token
    if contract["token_mode"] == "DIRECT":
        require(token in contract["values"], "result-direct")
        return token
    aliases = {chr(65 + index): value for index, value in enumerate(contract["values"])}
    require(token in aliases, "result-alias")
    return aliases[token]


def stored_result(token, contract):
    require(isinstance(token, str) and 1 <= len(token.encode("utf-8")) <= contract["max_bytes"], "stored-result-size")
    if contract["kind"] == "regex":
        require(contract["min_bytes"] <= len(token.encode("utf-8")) and re.fullmatch(contract["pattern"], token), "stored-result-regex")
    else:
        require(token in contract["values"], "stored-result-set")
    return token


def dependency_result(source, source_recipe, root, run, wave, route):
    route_index = ROUTES.index(route)
    record = schedule_record(root, run, wave, route_index)
    path = row_root(run["matrix_code"], wave, record["route_code"], record["execution_nonce"])
    require(sorted(os.listdir(path)) == TERMINAL, "dependency-terminal")
    pre, _ = read_json(path + "/predeclaration.json")
    contract, _, _ = public_contract(source, source_recipe, record)
    body = read_bound(path + "/result.txt", 0o444, 256)
    require(body.endswith(b"\n") and body.count(b"\n") == 1, "dependency-framing")
    value = body[:-1].decode("utf-8")
    require(value == stored_result(value, contract), "dependency-result")
    require(pre["matrix_id"] == run["matrix_id"], "dependency-matrix")
    return value


def derive_subject(prototype, recipe, source, source_recipe, root, run, record):
    contract, cell, node = public_contract(source, source_recipe, record)
    results = [dependency_result(source, source_recipe, root, run, wave, record["route"]) for wave in record["dependency_waves"]]
    if node["dynamic"]:
        payload = source.replace_template(node["subject_template"]["canonical_json_template"], results)
    else:
        require(not results, "static-dependencies")
        payload = source.static_payload(node)
    require(len(source.canon(payload)) <= recipe["limits"]["subject_payload_utf8_bytes_max"], "payload-limit")
    case = {
        "c": node["acceptance_criterion"]["utf8"],
        "p": payload,
        "q": node["output_contract"]["utf8"],
        "r": "TOKEN",
        "v": 2,
        "z": prototype.hint_for(node, contract),
    }
    raw = canonical(case)
    require(len(raw) <= recipe["limits"]["subject_line_utf8_bytes_max"], "subject-limit")
    return raw, contract


def decode_trace(raw):
    require(raw.endswith(b"\n") and b"\r" not in raw, "trace-framing")
    events = []
    for index, line in enumerate(raw.splitlines(keepends=True)):
        require(line.endswith(b"\n") and line != b"\n", "trace-line:" + str(index))
        event = parse(line[:-1])
        require(isinstance(event, dict) and set(event) in ({"payload", "type"}, {"payload", "timestamp", "type"}) and isinstance(event["payload"], dict), "trace-envelope:" + str(index))
        if "timestamp" in event:
            require(isinstance(event["timestamp"], str) and bool(event["timestamp"]), "trace-timestamp:" + str(index))
        events.append(event)
    require(bool(events), "trace-empty")
    return events


def event_items(events, outer_type, payload_type=None):
    output = []
    for index, event in enumerate(events):
        payload = event.get("payload")
        if event.get("type") == outer_type and isinstance(payload, dict) and (payload_type is None or payload.get("type") == payload_type):
            output.append((index, payload))
    return output


def all_strings(value):
    if isinstance(value, str):
        yield value
    elif isinstance(value, dict):
        for key, item in value.items():
            yield from all_strings(key)
            yield from all_strings(item)
    elif isinstance(value, list):
        for item in value:
            yield from all_strings(item)


def session_context(events, record):
    sessions = event_items(events, "session_meta")
    require(len(sessions) == 1 and sessions[0][0] == 0, "trace-session-count")
    session = sessions[0][1]
    thread_id = session.get("id")
    require(isinstance(thread_id, str) and UUID_RE.fullmatch(thread_id), "trace-thread")
    task_path = "/root/" + record["task_name"]
    spawn = session.get("source", {}).get("subagent", {}).get("thread_spawn", {})
    require(session.get("parent_thread_id") == PARENT_THREAD_ID and spawn.get("parent_thread_id") == PARENT_THREAD_ID, "trace-parent")
    require(session.get("agent_path") == task_path and spawn.get("agent_path") == task_path, "trace-task-path")
    contexts = event_items(events, "turn_context")
    require(len(contexts) == 1, "trace-turn-count")
    context = contexts[0][1]
    turn_id = context.get("turn_id")
    require(isinstance(turn_id, str) and UUID_RE.fullmatch(turn_id), "trace-turn")
    require(context.get("model") == record["model_requested"] and context.get("effort") == record["reasoning_effort_requested"], "trace-route")
    starts = event_items(events, "event_msg", "task_started")
    require(len(starts) == 1 and starts[0][1].get("turn_id") == turn_id and starts[0][0] < contexts[0][0], "trace-start")
    return {"session": session, "task_path": task_path, "thread_id": thread_id, "turn_id": turn_id, "turn_index": contexts[0][0], "start_index": starts[0][0]}


def trace_tools(events):
    direct_calls = event_items(events, "response_item", "function_call")
    direct_outputs = event_items(events, "response_item", "function_call_output")
    wrapped_calls = event_items(events, "response_item", "custom_tool_call")
    wrapped_outputs = event_items(events, "response_item", "custom_tool_call_output")
    if direct_calls or direct_outputs:
        require(not wrapped_calls and not wrapped_outputs, "trace-mixed-profile")
        return "DIRECT_NATIVE_V1", sorted(direct_calls + direct_outputs)
    require(bool(wrapped_calls) and not direct_calls and not direct_outputs, "trace-no-tools")
    return "EXEC_WRAPPED_V1", sorted(wrapped_calls + wrapped_outputs)


def wrapper_text(prototype, payload):
    return prototype.wrapper_text(payload)


def parse_goal(prototype, text, thread_id, objective, status):
    prototype.parse_goal(text, thread_id, objective, status)
    return parse(text.encode("utf-8"))["goal"]


def wait_arguments(record, thread_id):
    workdir = row_root(record["matrix_code"], record["wave_index"], record["route_code"], record["execution_nonce"])
    return {
        "cmd": "python3 -B wait.py " + thread_id,
        "max_output_tokens": 128,
        "workdir": workdir,
        "yield_time_ms": 30000,
    }


def require_call_input(prototype, payload, tool, arguments):
    require(payload.get("type") == "custom_tool_call" and payload.get("name") == "exec", "wrapped-call")
    require(payload.get("input") in {prototype.exec_input(tool, arguments, "canonical"), prototype.exec_input(tool, arguments, "observed")}, "wrapped-input:" + tool)


def validate_live(prototype, raw, trace_path, ready, record, subject):
    events = decode_trace(raw)
    context = session_context(events, record)
    require(os.path.basename(trace_path).endswith("-" + context["thread_id"] + ".jsonl"), "trace-name")
    require(ready == {
        "execution_nonce": record["execution_nonce"],
        "goal_thread_id": context["thread_id"],
        "matrix_code": record["matrix_code"],
        "pid": ready.get("pid"),
        "request_sha256": ready.get("request_sha256"),
        "route_code": record["route_code"],
        "schema_id": "pw-r9-codex-native-goal-single-turn-blocking-ready-v2",
        "waiter_sha256": ready.get("waiter_sha256"),
        "wave_index": record["wave_index"],
    }, "ready-fields")
    require(isinstance(ready["pid"], int) and ready["pid"] > 1 and HEX_RE.fullmatch(ready["request_sha256"]) and HEX_RE.fullmatch(ready["waiter_sha256"]), "ready-values")
    require(not event_items(events, "event_msg", "task_complete"), "live-complete")
    require(not any(payload.get("phase") == "final_answer" for _, payload in event_items(events, "response_item", "message")), "live-final")
    profile, tools = trace_tools(events)
    require(len(tools) == 3, "live-tool-count")
    create_call, create_output, wait_call = [payload for _, payload in tools]
    create_args = {"objective": record["goal_objective"]}
    expected_wait = wait_arguments(record, context["thread_id"])
    if profile == "DIRECT_NATIVE_V1":
        require(create_call.get("type") == "function_call" and create_call.get("name") == "create_goal", "live-direct-create")
        require(create_output.get("type") == "function_call_output" and create_output.get("call_id") == create_call.get("call_id"), "live-direct-create-output")
        require(wait_call.get("type") == "function_call" and wait_call.get("name") == "exec_command", "live-direct-wait")
        require(parse(create_call["arguments"].encode("utf-8")) == create_args and parse(wait_call["arguments"].encode("utf-8")) == expected_wait, "live-direct-args")
        active_text = create_output["output"]
    else:
        require_call_input(prototype, create_call, "create_goal", create_args)
        require(create_output.get("type") == "custom_tool_call_output" and create_output.get("call_id") == create_call.get("call_id"), "live-wrapped-create-output")
        require_call_input(prototype, wait_call, "exec_command", expected_wait)
        active_text = wrapper_text(prototype, create_output)
    require(create_call.get("call_id") != wait_call.get("call_id"), "live-call-ids")
    require(context["start_index"] < context["turn_index"] < tools[0][0] < tools[1][0] < tools[2][0], "live-order")
    parse_goal(prototype, active_text, context["thread_id"], record["goal_objective"], "active")
    subject_text = subject.decode("utf-8")
    require(all(subject_text not in text for event in events for text in all_strings(event)), "live-subject-visible")
    return {"profile": profile, **context}


def direct_wait_output(payload):
    value = parse(payload["output"].encode("utf-8"))
    require(set(value).issubset({"chunk_id", "exit_code", "original_token_count", "output", "wall_time_seconds"}), "direct-wait-fields")
    require(value.get("exit_code") == 0 and "session_id" not in value, "direct-wait-status")
    return value["output"]


def final_message(events, turn_id):
    finals = []
    for index, payload in event_items(events, "response_item", "message"):
        if payload.get("phase") == "final_answer":
            content = payload.get("content")
            require(payload.get("role", "assistant") == "assistant" and isinstance(content, list) and len(content) == 1, "final-shape")
            require(content[0].get("type") == "output_text" and isinstance(content[0].get("text"), str), "final-text")
            finals.append((index, content[0]["text"]))
    require(len(finals) == 1, "final-count")
    completes = event_items(events, "event_msg", "task_complete")
    require(len(completes) == 1 and completes[0][1].get("turn_id") == turn_id and completes[0][1].get("last_agent_message") == finals[0][1], "task-complete")
    require(completes[0][0] == len(events) - 1 and finals[0][0] < completes[0][0], "terminal-order")
    return finals[0], completes[0]


def validate_terminal(prototype, raw, live_raw, record, subject, expected_profile, expected_thread, expected_turn):
    require(len(raw) > len(live_raw) and raw.startswith(live_raw), "terminal-live-prefix")
    events = decode_trace(raw)
    context = session_context(events, record)
    require(context["thread_id"] == expected_thread and context["turn_id"] == expected_turn, "terminal-context")
    profile, tools = trace_tools(events)
    require(profile == expected_profile and len(tools) == 6, "terminal-tools")
    create_call, create_output, wait_call, wait_output, update_call, update_output = [payload for _, payload in tools]
    create_args = {"objective": record["goal_objective"]}
    wait_args = wait_arguments(record, expected_thread)
    update_args = {"status": "complete"}
    if profile == "DIRECT_NATIVE_V1":
        require(create_call.get("name") == "create_goal" and wait_call.get("name") == "exec_command" and update_call.get("name") == "update_goal", "terminal-direct-names")
        require(all(call.get("type") == "function_call" for call in (create_call, wait_call, update_call)), "terminal-direct-calls")
        require(all(output.get("type") == "function_call_output" for output in (create_output, wait_output, update_output)), "terminal-direct-outputs")
        require(parse(create_call["arguments"].encode()) == create_args and parse(wait_call["arguments"].encode()) == wait_args and parse(update_call["arguments"].encode()) == update_args, "terminal-direct-args")
        active_text = create_output["output"]
        subject_text = direct_wait_output(wait_output)
        complete_text = update_output["output"]
    else:
        require_call_input(prototype, create_call, "create_goal", create_args)
        require_call_input(prototype, wait_call, "exec_command", wait_args)
        require_call_input(prototype, update_call, "update_goal", update_args)
        require(all(output.get("type") == "custom_tool_call_output" for output in (create_output, wait_output, update_output)), "terminal-wrapped-outputs")
        active_text = wrapper_text(prototype, create_output)
        subject_text = wrapper_text(prototype, wait_output)
        complete_text = wrapper_text(prototype, update_output)
    require([tools[index][1].get("call_id") for index in (0, 2, 4)] == [tools[index][1].get("call_id") for index in (1, 3, 5)], "terminal-call-bind")
    require(len({create_call["call_id"], wait_call["call_id"], update_call["call_id"]}) == 3, "terminal-call-unique")
    parse_goal(prototype, active_text, expected_thread, record["goal_objective"], "active")
    require(subject_text.encode("utf-8") == subject, "terminal-subject")
    terminal_goal = parse_goal(prototype, complete_text, expected_thread, record["goal_objective"], "complete")
    (final_index, result), complete = final_message(events, expected_turn)
    require(tools[-1][0] < final_index < complete[0] and TOKEN_RE.fullmatch(result), "terminal-result")
    return {"profile": profile, "result": result, "terminal_goal": terminal_goal, **context}


def read_trace(path):
    require(isinstance(path, str) and path.startswith(SESSION_PREFIX) and os.path.realpath(path) == path, "trace-path")
    return read_bound(path, 0o664, 2000000)


def component_identities():
    prototype = load_prototype()
    read_bound(DATA_VALIDATION_PATH, 0o644, DATA_VALIDATION_BYTES, DATA_VALIDATION_BYTES, DATA_VALIDATION_SHA256)
    return {
        "architecture": identity(ARCHITECTURE_PATH, 0o644, ARCHITECTURE_BYTES),
        "architecture_review": identity(REVIEW_PATH, 0o644, REVIEW_BYTES),
        "data_validation": identity(DATA_VALIDATION_PATH, 0o644, DATA_VALIDATION_BYTES),
        "offline_verifier": identity(VERIFIER_PATH, 0o644, 300000),
        "prototype": identity(PROTOTYPE_PATH, 0o644, PROTOTYPE_BYTES),
        "prototype_recipe": identity(prototype.RECIPE_PATH, 0o644, prototype.RECIPE_BYTES),
        "runtime": identity(RUNTIME_PATH, 0o644, 300000),
        "runtime_model_check": identity(MODEL_CHECK_PATH, 0o644, 300000),
        "waiter": identity(HERE + "/wait.py", 0o644, 32768),
        "waiter_model_check": identity(HERE + "/wait_model_check.py", 0o644, 32768),
    }


def status_binding(binding, expected_status):
    require(isinstance(binding, dict) and set(binding) == {"bytes", "mode", "path", "sha256", "status"}, "binding-fields")
    require(binding["mode"] == "0644" and isinstance(binding["bytes"], int) and 1 <= binding["bytes"] <= 300000, "binding-size-mode")
    require(isinstance(binding["path"], str) and binding["path"].startswith(CONTROL_ROOT + "/") and os.path.realpath(binding["path"]) == binding["path"], "binding-path")
    require(isinstance(binding["sha256"], str) and HEX_RE.fullmatch(binding["sha256"]), "binding-sha")
    raw = read_bound(binding["path"], 0o644, binding["bytes"], binding["bytes"], binding["sha256"])
    value = parse(raw)
    require(raw == canonical(value) and value.get("status") == expected_status and binding["status"] == expected_status, "binding-status")
    return value


def validate_launch_gate(code, components):
    path = CONTROL_ROOT + "/" + GATE_NAMES[code]
    gate, raw = read_json(path, 0o644, 100000)
    require(set(gate) == {
        "authority", "components", "failure_contract", "launch_count", "matrix_code", "matrix_id",
        "predecessor", "qualification", "roster_capability", "schema_id", "status",
    }, "gate-fields")
    spec = matrix_spec(load_control()[1], code)
    require(gate["schema_id"] == GATE_SCHEMAS[code] and gate["status"] == GATE_STATUSES[code], "gate-status")
    require(gate["matrix_code"] == code and gate["matrix_id"] == spec["matrix_id"] and gate["launch_count"] == 1, "gate-address")
    require(gate["components"] == components, "gate-components")
    require(gate["authority"] == {
        "canary_launch": code == "C03", "matrix_launch": code != "C03", "qualification": False,
        "release": False, "subject_launch": True,
    }, "gate-authority")
    require(gate["failure_contract"] == {"best_of": 0, "relaunch": 0, "replacement": 0, "resend": 0, "retry": 0, "reuse": 0}, "gate-failure")
    require(gate["qualification"] == {"clean_full_matrix_streak": 0, "credit": "0/2", "qualification_credit": 0}, "gate-qualification")
    status_binding(gate["predecessor"], PREDECESSOR_STATUSES[code])
    status_binding(gate["roster_capability"], "PASS_FRESH_EXACT_ROSTER_ROUTE_CAPABILITY_ZERO_CREDIT")
    return path, gate, raw


def records_for(code, prototype, recipe, source, source_recipe, public):
    spec = matrix_spec(recipe, code)
    source_records = source.build_schedule(source_recipe, public, spec["source_matrix_code"])
    records = [prototype.transformed_record(source, record, code, spec) for record in source_records]
    require(len(records) == spec["subject_task_count"], "records-count")
    require([record["wave_index"] for record in records[::3]] == list(range(spec["wave_count"])), "records-waves")
    require(all(tuple(records[index + offset]["route"] for offset in range(3)) == ROUTES for index in range(0, len(records), 3)), "records-routes")
    require(len({record["execution_nonce"] for record in records}) == len(records), "records-nonces")
    require(len({record["attempt_id"] for record in records}) == len(records), "records-attempts")
    return records


def validate_prior_sealed(code):
    root, run = load_run(code)
    require("matrix_terminal.json" in os.listdir(root) and "matrix_accounting.json" in os.listdir(root), "prior-seal-files")
    terminal, terminal_raw = read_json(root + "/matrix_terminal.json", 0o444, 30000)
    accounting, _ = read_json(root + "/matrix_accounting.json", 0o444, 30000)
    require(terminal["status"] == "SEALED_EVIDENCE_ZERO_CREDIT_PENDING_INDEPENDENT_VERIFICATION", "prior-terminal-status")
    require(accounting["status"] == "SEALED_ZERO_CREDIT_PENDING_INDEPENDENT_VERIFICATION", "prior-accounting-status")
    require(accounting["matrix_terminal"] == {"bytes": len(terminal_raw), "sha256": sha(terminal_raw)}, "prior-terminal-bind")
    require(accounting["matrix_code"] == code and accounting["matrix_id"] == run["matrix_id"], "prior-accounting-bind")


def ensure_sequence_root(code):
    index = SEQUENCE.index(code)
    if not os.path.lexists(ROOT):
        require(code == "C03", "root-sequence")
        make_dir(ROOT, HERE)
    else:
        require_dir(ROOT)
    require(sorted(os.listdir(ROOT)) == sorted(SEQUENCE[:index]), "root-inventory-before-begin")
    for prior in SEQUENCE[:index]:
        validate_prior_sealed(prior)


def begin(code):
    prototype, recipe, source, source_recipe, public = load_control()
    require(code in SEQUENCE, "begin-code")
    components = component_identities()
    gate_path, gate, gate_raw = validate_launch_gate(code, components)
    records = records_for(code, prototype, recipe, source, source_recipe, public)
    schedule_raw, offsets_raw = schedule_bytes(records)
    spec = matrix_spec(recipe, code)
    ensure_sequence_root(code)
    root = run_root(code)
    require(not os.path.lexists(root), "begin-existing")
    make_dir(root, ROOT)
    publish(root + "/run.lock", b"", 0o600)
    publish(root + "/schedule.jsonl", schedule_raw)
    publish(root + "/schedule_offsets.json", offsets_raw)
    run = {
        "components": components,
        "failure_contract": {"best_of": 0, "relaunch": 0, "replacement": 0, "resend": 0, "retry": 0, "reuse": 0},
        "launch_admission": {"bytes": len(gate_raw), "mode": "0644", "path": gate_path, "sha256": sha(gate_raw), "status": gate["status"]},
        "matrix_code": code,
        "matrix_id": spec["matrix_id"],
        "qualification": {"canary_credit": 0, "clean_full_matrix_streak": 0, "credit": "0/2", "qualification_credit": 0},
        "schedule": {"bytes": len(schedule_raw), "records": len(records), "sha256": sha(schedule_raw)},
        "schedule_offsets": {"bytes": len(offsets_raw), "sha256": sha(offsets_raw)},
        "schema_id": "pw-r9-codex-native-goal-single-turn-blocking-mailbox-run-v7",
        "status": "OPEN_ZERO_CREDIT",
        "subject_task_count": spec["subject_task_count"],
        "wave_count": spec["wave_count"],
    }
    publish(root + "/run.json", canonical(run))
    require(sorted(os.listdir(root)) == BASE_RUN, "begin-inventory")
    sys.stdout.buffer.write(canonical(run))


def validate_predeclaration(prototype, recipe, source, source_recipe, root, run, record, pre):
    subject, contract = derive_subject(prototype, recipe, source, source_recipe, root, run, record)
    expected = prototype.predeclaration(recipe, record, run["matrix_code"], sha(canonical(contract, False)), subject)
    require(pre == expected, "predeclaration-exact")
    return subject, contract


def prior_wave_terminal(root, run, wave):
    wave_path = root + "/{:04d}".format(wave)
    require_dir(wave_path)
    require(sorted(os.listdir(wave_path)) == ["a", "b", "c"], "prior-wave-routes")
    for route_index, route in enumerate(ROUTES):
        record = schedule_record(root, run, wave, route_index)
        route_path = wave_path + "/" + record["route_code"]
        require_dir(route_path)
        require(sorted(os.listdir(route_path)) == [record["execution_nonce"]], "prior-route-row")
        row = route_path + "/" + record["execution_nonce"]
        require_dir(row)
        require(sorted(os.listdir(row)) == TERMINAL, "prior-row-terminal")


def prepare(code, wave_text):
    prototype, recipe, source, source_recipe, public = load_control()
    spec = matrix_spec(recipe, code)
    require(re.fullmatch(r"[0-9]{4}", wave_text) and int(wave_text) < spec["wave_count"], "prepare-wave")
    wave = int(wave_text)
    root, run, fd = lock_run(code, True)
    try:
        expected_root = BASE_RUN + ["{:04d}".format(index) for index in range(wave)]
        require(sorted(os.listdir(root)) == sorted(expected_root), "prepare-root-sequence")
        for prior in range(wave):
            prior_wave_terminal(root, run, prior)
        wave_path = root + "/" + wave_text
        make_dir(wave_path, root)
        output_rows = []
        waiter = read_bound(recipe["bindings"]["waiter"]["path"], 0o644, recipe["bindings"]["waiter"]["bytes"], recipe["bindings"]["waiter"]["bytes"], recipe["bindings"]["waiter"]["sha256"])
        for route_index, route in enumerate(ROUTES):
            record = schedule_record(root, run, wave, route_index)
            require(record["route"] == route, "prepare-route")
            route_path = wave_path + "/" + record["route_code"]
            make_dir(route_path, wave_path)
            row = route_path + "/" + record["execution_nonce"]
            make_dir(row, route_path)
            subject, contract = derive_subject(prototype, recipe, source, source_recipe, root, run, record)
            pre = prototype.predeclaration(recipe, record, code, sha(canonical(contract, False)), subject)
            prompt, workdir = prototype.spawn_prompt(record, code)
            require(workdir == row and len(prompt) <= recipe["limits"]["spawn_prompt_utf8_bytes_max"], "prepare-prompt")
            publish(row + "/predeclaration.json", canonical(pre))
            publish(row + "/spawn_prompt.txt", prompt)
            publish(row + "/wait.py", waiter)
            require(sorted(os.listdir(row)) == PREPARED, "prepare-row-inventory")
            output_rows.append({
                "model": record["model_requested"], "prompt": prompt.decode("utf-8"), "reasoning_effort": record["reasoning_effort_requested"],
                "route": route, "route_code": record["route_code"], "task_name": record["task_name"], "wave_index": wave,
            })
        output = {
            "matrix_code": code, "matrix_id": run["matrix_id"], "qualification_credit": 0, "rows": output_rows,
            "schema_id": "pw-r9-codex-native-goal-single-turn-blocking-mailbox-prepared-wave-v7", "status": "PREPARED_CONTROL_ONLY_ZERO_CREDIT", "wave_index": wave,
        }
        sys.stdout.buffer.write(canonical(output))
    finally:
        fcntl.flock(fd, fcntl.LOCK_UN)
        os.close(fd)


def publish_subject(row, raw):
    stage = row + "/subject.stage"
    final = row + "/subject.txt"
    require(not os.path.lexists(stage) and not os.path.lexists(final), "subject-absence")
    publish(stage, raw)
    stage_info = os.lstat(stage)
    os.link(stage, final, follow_symlinks=False)
    final_info = os.lstat(final)
    require((stage_info.st_dev, stage_info.st_ino) == (final_info.st_dev, final_info.st_ino) and final_info.st_nlink == 2, "subject-link")
    fd = os.open(final, os.O_RDONLY | os.O_NOFOLLOW | os.O_CLOEXEC)
    try:
        opened = os.fstat(fd)
        require((opened.st_dev, opened.st_ino, opened.st_nlink, opened.st_size) == (stage_info.st_dev, stage_info.st_ino, 2, len(raw)), "subject-link-open")
        reopened = b""
        while len(reopened) < len(raw):
            chunk = os.read(fd, len(raw) - len(reopened))
            require(bool(chunk), "subject-link-short")
            reopened += chunk
        require(os.read(fd, 1) == b"" and reopened == raw, "subject-link-reopen")
    finally:
        os.close(fd)
    fsync_dir(row)
    os.unlink(stage)
    fsync_dir(row)
    require(not os.path.lexists(stage), "subject-stage-residual")
    final_info = os.lstat(final)
    require(final_info.st_nlink == 1 and read_bound(final, 0o444, len(raw), len(raw), sha(raw)) == raw, "subject-final")


def read_active(row):
    active, _ = read_json(row + "/active.json", 0o444, 20000)
    require(set(active) == {
        "execution_nonce", "goal_objective", "goal_thread_id", "matrix_code", "matrix_id", "model", "profile",
        "qualification_credit", "reasoning_effort", "route", "schema_id", "status", "task_path", "trace", "turn_id", "wave_index",
    }, "active-fields")
    require(active["schema_id"] == "pw-r9-codex-native-goal-single-turn-blocking-mailbox-active-v7" and active["status"] == "ACTIVE_ATTESTED_SUBJECT_PUBLISHED_ZERO_CREDIT", "active-status")
    return active


def gate(code, wave_text, route_code, trace_path):
    prototype, recipe, source, source_recipe, public = load_control()
    spec = matrix_spec(recipe, code)
    require(re.fullmatch(r"[0-9]{4}", wave_text) and int(wave_text) < spec["wave_count"], "gate-wave")
    require(route_code in CODE_ROUTES, "gate-route")
    wave = int(wave_text)
    route_index = ROUTES.index(CODE_ROUTES[route_code])
    root, run, fd = lock_run(code, True)
    try:
        record = schedule_record(root, run, wave, route_index)
        row = row_root(code, wave, route_code, record["execution_nonce"])
        require_dir(row)
        require(sorted(os.listdir(row)) == WAITING, "gate-row-waiting")
        pre, pre_raw = read_json(row + "/predeclaration.json", 0o444, 10000)
        ready1, ready_raw1 = read_json(row + "/ready.json", 0o444, 10000)
        live1 = read_trace(trace_path)
        require(sorted(os.listdir(row)) == WAITING, "gate-row-stable-before")
        time.sleep(0.05)
        live2 = read_trace(trace_path)
        ready2, ready_raw2 = read_json(row + "/ready.json", 0o444, 10000)
        require(live1 == live2 and ready_raw1 == ready_raw2 and sorted(os.listdir(row)) == WAITING, "gate-stable-prefix")
        subject, contract = validate_predeclaration(prototype, recipe, source, source_recipe, root, run, record, pre)
        require(ready1 == ready2 and ready1["request_sha256"] == sha(pre_raw) and ready1["waiter_sha256"] == pre["waiter_sha256"], "gate-ready-bind")
        proof = validate_live(prototype, live1, trace_path, ready1, record, subject)
        publish(row + "/active_trace.jsonl", live1)
        active = {
            "execution_nonce": record["execution_nonce"], "goal_objective": record["goal_objective"], "goal_thread_id": proof["thread_id"],
            "matrix_code": code, "matrix_id": run["matrix_id"], "model": record["model_requested"], "profile": proof["profile"],
            "qualification_credit": 0, "reasoning_effort": record["reasoning_effort_requested"], "route": record["route"],
            "schema_id": "pw-r9-codex-native-goal-single-turn-blocking-mailbox-active-v7", "status": "ACTIVE_ATTESTED_SUBJECT_PUBLISHED_ZERO_CREDIT",
            "task_path": proof["task_path"], "trace": {"bytes": len(live1), "sha256": sha(live1)}, "turn_id": proof["turn_id"], "wave_index": wave,
        }
        publish(row + "/active.json", canonical(active))
        publish_subject(row, subject)
        require(sorted(os.listdir(row)) == ACTIVE, "gate-row-active")
        sys.stdout.buffer.write(canonical(active))
    finally:
        fcntl.flock(fd, fcntl.LOCK_UN)
        os.close(fd)


def record_terminal(code, wave_text, route_code, trace_path):
    prototype, recipe, source, source_recipe, public = load_control()
    spec = matrix_spec(recipe, code)
    require(re.fullmatch(r"[0-9]{4}", wave_text) and int(wave_text) < spec["wave_count"], "record-wave")
    require(route_code in CODE_ROUTES, "record-route")
    wave = int(wave_text)
    route_index = ROUTES.index(CODE_ROUTES[route_code])
    root, run, fd = lock_run(code, True)
    try:
        record = schedule_record(root, run, wave, route_index)
        row = row_root(code, wave, route_code, record["execution_nonce"])
        require(sorted(os.listdir(row)) == ACTIVE, "record-row-active")
        pre, _ = read_json(row + "/predeclaration.json", 0o444, 10000)
        subject, contract = validate_predeclaration(prototype, recipe, source, source_recipe, root, run, record, pre)
        require(read_bound(row + "/subject.txt", 0o444, 512, len(subject), sha(subject)) == subject, "record-subject")
        active = read_active(row)
        live = read_bound(row + "/active_trace.jsonl", 0o444, 2000000, active["trace"]["bytes"], active["trace"]["sha256"])
        terminal = read_trace(trace_path)
        proof = validate_terminal(prototype, terminal, live, record, subject, active["profile"], active["goal_thread_id"], active["turn_id"])
        token_raw = proof["result"].encode("utf-8") + b"\n"
        canonical_value = canonical_result(proof["result"], contract)
        result_raw = canonical_value.encode("utf-8") + b"\n"
        publish(row + "/terminal_trace.jsonl", terminal)
        publish(row + "/subject_token.txt", token_raw)
        publish(row + "/result.txt", result_raw)
        receipt = {
            "attempt_id": record["attempt_id"], "execution_nonce": record["execution_nonce"], "goal": proof["terminal_goal"],
            "goal_thread_id": proof["thread_id"], "matrix_code": code, "matrix_id": run["matrix_id"], "model": record["model_requested"],
            "qualification_credit": 0, "reasoning_effort": record["reasoning_effort_requested"],
            "result": {"bytes": len(result_raw) - 1, "sha256": sha(result_raw[:-1])}, "route": record["route"],
            "schema_id": "pw-r9-codex-native-goal-single-turn-blocking-mailbox-goal-receipt-v7",
            "status": "PASS_FRESH_NATIVE_GOAL_SINGLE_ATOM_ZERO_CREDIT", "task_path": proof["task_path"],
            "traces": {"active": {"bytes": len(live), "sha256": sha(live)}, "terminal": {"bytes": len(terminal), "sha256": sha(terminal)}},
            "turn_count": 1, "turn_id": proof["turn_id"], "wave_index": wave,
        }
        publish(row + "/goal_receipt.json", canonical(receipt))
        require(sorted(os.listdir(row)) == TERMINAL, "record-row-terminal")
        sys.stdout.buffer.write(canonical(receipt))
    finally:
        fcntl.flock(fd, fcntl.LOCK_UN)
        os.close(fd)


def inventory_projection(root, excluded):
    records = []
    total = 0

    def visit(path, relative):
        nonlocal total
        info = os.lstat(path)
        require(not stat.S_ISLNK(info.st_mode) and info.st_uid == os.getuid(), "inventory-custody")
        if stat.S_ISDIR(info.st_mode):
            require(stat.S_IMODE(info.st_mode) == 0o700, "inventory-dir-mode")
            records.append({"kind": "directory", "mode": "0700", "path": relative})
            for name in sorted(os.listdir(path)):
                child = name if relative == "." else relative + "/" + name
                if child not in excluded:
                    visit(path + "/" + name, child)
        else:
            require(stat.S_ISREG(info.st_mode), "inventory-kind")
            mode = 0o600 if relative == "run.lock" else 0o444
            raw = read_bound(path, mode, 30000000)
            records.append({"bytes": len(raw), "kind": "file", "mode": "{:04o}".format(mode), "path": relative, "sha256": sha(raw)})
            total += len(raw)

    visit(root, ".")
    raw = b"".join(canonical(record) for record in records)
    return {
        "directories": sum(record["kind"] == "directory" for record in records),
        "entries": len(records),
        "files": sum(record["kind"] == "file" for record in records),
        "projection_bytes": len(raw),
        "projection_sha256": sha(raw),
        "total_file_bytes": total,
    }


def scan_run(prototype, recipe, source, source_recipe, code, root, run, sealed):
    spec = matrix_spec(recipe, code)
    expected_top = BASE_RUN + ["{:04d}".format(index) for index in range(spec["wave_count"])]
    if sealed:
        expected_top += ["matrix_accounting.json", "matrix_terminal.json"]
    require(sorted(os.listdir(root)) == sorted(expected_top), "scan-root-inventory:" + code)
    sets = {key: set() for key in ("attempt_ids", "goal_threads", "nonces", "task_paths", "terminal_trace_hashes", "turn_ids")}
    count = 0
    receipt_fields = {
        "attempt_id", "execution_nonce", "goal", "goal_thread_id", "matrix_code", "matrix_id", "model", "qualification_credit",
        "reasoning_effort", "result", "route", "schema_id", "status", "task_path", "traces", "turn_count", "turn_id", "wave_index",
    }
    for wave in range(spec["wave_count"]):
        prior_wave_terminal(root, run, wave)
        for route_index, route in enumerate(ROUTES):
            record = schedule_record(root, run, wave, route_index)
            row = row_root(code, wave, record["route_code"], record["execution_nonce"])
            pre, _ = read_json(row + "/predeclaration.json", 0o444, 10000)
            contract, _, _ = public_contract(source, source_recipe, record)
            require(pre["result_contract_sha256"] == sha(canonical(contract, False)) and pre["task_path"] == "/root/" + record["task_name"], "scan-predeclaration")
            result_raw = read_bound(row + "/result.txt", 0o444, 256)
            require(result_raw.endswith(b"\n") and result_raw.count(b"\n") == 1, "scan-result-framing")
            stored_result(result_raw[:-1].decode("utf-8"), contract)
            active = read_active(row)
            receipt, _ = read_json(row + "/goal_receipt.json", 0o444, 30000)
            require(set(receipt) == receipt_fields, "scan-receipt-fields")
            require(receipt["schema_id"] == "pw-r9-codex-native-goal-single-turn-blocking-mailbox-goal-receipt-v7" and receipt["status"] == "PASS_FRESH_NATIVE_GOAL_SINGLE_ATOM_ZERO_CREDIT", "scan-receipt-status")
            require(receipt["attempt_id"] == record["attempt_id"] and receipt["execution_nonce"] == record["execution_nonce"], "scan-receipt-attempt")
            require(receipt["matrix_code"] == code and receipt["matrix_id"] == run["matrix_id"] and receipt["wave_index"] == wave and receipt["route"] == route, "scan-receipt-address")
            require(receipt["model"] == record["model_requested"] and receipt["reasoning_effort"] == record["reasoning_effort_requested"] and receipt["qualification_credit"] == 0, "scan-receipt-route")
            require(receipt["goal_thread_id"] == active["goal_thread_id"] and receipt["turn_id"] == active["turn_id"] and receipt["task_path"] == active["task_path"], "scan-receipt-active")
            require(receipt["goal"]["threadId"] == receipt["goal_thread_id"] and receipt["goal"]["objective"] == record["goal_objective"] and receipt["goal"]["status"] == "complete", "scan-goal")
            terminal = read_bound(row + "/terminal_trace.jsonl", 0o444, 2000000, receipt["traces"]["terminal"]["bytes"], receipt["traces"]["terminal"]["sha256"])
            active_raw = read_bound(row + "/active_trace.jsonl", 0o444, 2000000, receipt["traces"]["active"]["bytes"], receipt["traces"]["active"]["sha256"])
            require(terminal.startswith(active_raw) and len(terminal) > len(active_raw), "scan-trace-prefix")
            values = {
                "attempt_ids": record["attempt_id"], "goal_threads": receipt["goal_thread_id"], "nonces": record["execution_nonce"],
                "task_paths": receipt["task_path"], "terminal_trace_hashes": sha(terminal), "turn_ids": receipt["turn_id"],
            }
            for key, value in values.items():
                require(value not in sets[key], "scan-local-reuse:" + key)
                sets[key].add(value)
            count += 1
    require(count == spec["subject_task_count"] and all(len(values) == count for values in sets.values()), "scan-count")
    return sets


def merge_freshness(target, addition):
    for key in target:
        require(target[key].isdisjoint(addition[key]), "cross-run-reuse:" + key)
        target[key].update(addition[key])


def seal(code):
    prototype, recipe, source, source_recipe, public = load_control()
    require(code in SEQUENCE, "seal-code")
    root, run, fd = lock_run(code, True)
    try:
        require("matrix_terminal.json" not in os.listdir(root) and "matrix_accounting.json" not in os.listdir(root), "seal-absence")
        cumulative = {key: set() for key in ("attempt_ids", "goal_threads", "nonces", "task_paths", "terminal_trace_hashes", "turn_ids")}
        current = None
        for run_code in SEQUENCE[:SEQUENCE.index(code) + 1]:
            scan_root, scan_manifest = (root, run) if run_code == code else load_run(run_code)
            values = scan_run(prototype, recipe, source, source_recipe, run_code, scan_root, scan_manifest, run_code != code)
            merge_freshness(cumulative, values)
            if run_code == code:
                current = values
        require(current is not None, "seal-current")
        spec = matrix_spec(recipe, code)
        before_terminal = inventory_projection(root, {"matrix_accounting.json", "matrix_terminal.json"})
        terminal = {
            "fresh_attempt_ids": len(current["attempt_ids"]), "fresh_goal_threads": len(current["goal_threads"]),
            "fresh_task_paths": len(current["task_paths"]), "fresh_terminal_trace_hashes": len(current["terminal_trace_hashes"]),
            "fresh_turn_ids": len(current["turn_ids"]), "matrix_code": code, "matrix_id": run["matrix_id"],
            "preterminal_inventory": before_terminal, "qualification_credit": 0, "row_count": spec["subject_task_count"],
            "schema_id": "pw-r9-codex-native-goal-single-turn-blocking-mailbox-matrix-terminal-v7",
            "status": "SEALED_EVIDENCE_ZERO_CREDIT_PENDING_INDEPENDENT_VERIFICATION", "wave_count": spec["wave_count"],
        }
        terminal_raw = canonical(terminal)
        publish(root + "/matrix_terminal.json", terminal_raw)
        require(inventory_projection(root, {"matrix_accounting.json", "matrix_terminal.json"}) == before_terminal, "seal-preterminal-drift")
        before_accounting = inventory_projection(root, {"matrix_accounting.json"})
        accounting = {
            "failure_count": 0, "inventory_before_accounting": before_accounting, "matrix_code": code, "matrix_id": run["matrix_id"],
            "matrix_terminal": {"bytes": len(terminal_raw), "sha256": sha(terminal_raw)}, "qualification_credit": 0,
            "relaunch_count": 0, "replacement_count": 0, "resend_count": 0, "retry_count": 0, "reuse_count": 0,
            "schema_id": "pw-r9-codex-native-goal-single-turn-blocking-mailbox-matrix-accounting-v7",
            "status": "SEALED_ZERO_CREDIT_PENDING_INDEPENDENT_VERIFICATION", "subject_task_count": spec["subject_task_count"],
        }
        accounting_raw = canonical(accounting)
        publish(root + "/matrix_accounting.json", accounting_raw)
        require(inventory_projection(root, {"matrix_accounting.json"}) == before_accounting, "seal-accounting-drift")
        sys.stdout.buffer.write(accounting_raw)
    finally:
        fcntl.flock(fd, fcntl.LOCK_UN)
        os.close(fd)


def check():
    prototype, recipe, source, source_recipe, public = load_control()
    require(not os.path.lexists(ROOT), "check-run-root-present")
    schedules = prototype.build_schedules(recipe, source, source_recipe, public)
    components = component_identities()
    outputs = {}
    max_prompt = 0
    nonces = set()
    attempts = set()
    for code in SEQUENCE:
        records = schedules[code]
        raw, offsets = schedule_bytes(records)
        outputs[code] = {"bytes": len(raw), "offsets_bytes": len(offsets), "offsets_sha256": sha(offsets), "records": len(records), "sha256": sha(raw)}
        for record in records:
            prompt, workdir = prototype.spawn_prompt(record, code)
            max_prompt = max(max_prompt, len(prompt))
            require(len(prompt) <= recipe["limits"]["spawn_prompt_utf8_bytes_max"] and record["goal_objective"] in prompt.decode("utf-8"), "check-prompt")
            require(workdir == row_root(code, record["wave_index"], record["route_code"], record["execution_nonce"]), "check-workdir")
            require(record["execution_nonce"] not in nonces and record["attempt_id"] not in attempts, "check-global-unique")
            nonces.add(record["execution_nonce"])
            attempts.add(record["attempt_id"])
    output = {
        "assertion_count": sum(len(records) for records in schedules.values()) * 3 + 20,
        "components": components, "evidence_writes": 0, "first_mismatch": None, "matrices": outputs,
        "max_spawn_prompt_bytes": max_prompt, "qualification_credit": 0,
        "schema_id": "pw-r9-codex-native-goal-single-turn-blocking-mailbox-runtime-check-v7",
        "status": "PASS_RUNTIME_DATA_ONLY_ZERO_CALLS_ZERO_WRITES", "subject_calls": 0,
    }
    sys.stdout.buffer.write(canonical(output))


def main():
    try:
        require(len(sys.argv) >= 2, "cli")
        command = sys.argv[1]
        if command == "check":
            require(len(sys.argv) == 2, "cli-check")
            check()
        elif command == "begin":
            require(len(sys.argv) == 3, "cli-begin")
            begin(sys.argv[2])
        elif command == "prepare":
            require(len(sys.argv) == 4, "cli-prepare")
            prepare(sys.argv[2], sys.argv[3])
        elif command == "gate":
            require(len(sys.argv) == 6, "cli-gate")
            gate(sys.argv[2], sys.argv[3], sys.argv[4], sys.argv[5])
        elif command == "record-terminal":
            require(len(sys.argv) == 6, "cli-record-terminal")
            record_terminal(sys.argv[2], sys.argv[3], sys.argv[4], sys.argv[5])
        elif command == "seal":
            require(len(sys.argv) == 3, "cli-seal")
            seal(sys.argv[2])
        else:
            raise Invalid("cli-command")
    except (Invalid, OSError, ValueError, KeyError, IndexError, TypeError, UnicodeError, json.JSONDecodeError) as error:
        sys.stderr.write("FAIL:" + str(error) + "\n")
        raise SystemExit(1)


if __name__ == "__main__":
    main()
