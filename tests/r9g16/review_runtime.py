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
HERE = "/mnt/Cursor/PuppetMaster/tests/r9g16"
ROOT = HERE + "/r"
RECIPE_PATH = HERE + "/review_recipe.json"
RECIPE_BYTES = 7936
RECIPE_SHA256 = "100386642d6680db468c1e9a0ddf7c2c774728f4444e540ca2d655fe8669f690"
CHECKER_PATH = HERE + "/review_corpus_check.py"
CHECKER_BYTES = 12544
CHECKER_SHA256 = "7bc8ec049d04d5ec6ac58797e72523df790ebe2d04905d0b50e33f0f6ea5bfcb"
WAITER_PATH = HERE + "/wait.py"
WAITER_BYTES = 7928
WAITER_SHA256 = "6dfb6378c9517fae3e88c79b560e1b2a7a06b8899695e0dc122798d7220aa1e1"
ARCHITECTURE_PATH = "/mnt/Cursor/PuppetMaster/tests/agent_packet_restrictions/successor_20260813/r9_control_plane_stabilization_v1/r9_codex_native_goal_atomic_architecture_review_v9.json"
ARCHITECTURE_BYTES = 4193
ARCHITECTURE_SHA256 = "7812fc265157e56707462c636e4d35f2bbf1f56e1c9079d10c07e7200d36c0a0"
ADMISSION_PATH = "/mnt/Cursor/PuppetMaster/tests/agent_packet_restrictions/successor_20260813/r9_control_plane_stabilization_v1/r9_codex_native_goal_atomic_architecture_review_v9_launch_admission_v1.json"
SKILL_PATH = "/mnt/Cursor/PuppetMaster/.agents/skills/r9-goal-atom-bootstrap/SKILL.md"
SKILL_BYTES = 1327
SKILL_SHA256 = "7fba245c05b7fb104054ea18af4d0a2fd90d4f28f295c94f7c12b699b343d8b4"
PROTOTYPE_PATH = "/mnt/Cursor/PuppetMaster/tests/r9g15/prototype.py"
PROTOTYPE_BYTES = 23847
PROTOTYPE_SHA256 = "0e48a0041cb7c4344f4d20ad7f0ada82fb83a7c660286078bf520222225adcba"
PARENT_THREAD_ID = "01a00b52-4879-7c41-a826-7b4609ad3c3b"
SESSION_PREFIX = "/home/sittingmongoose/.codex/sessions/"
MODEL = "gpt-5.6-luna"
EFFORT = "medium"
ATOM_RE = re.compile(r"^A(?:0[1-9]|1[0-8])$")
HEX_RE = re.compile(r"^[0-9a-f]{64}$")
UUID_RE = re.compile(r"^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$")
TOKEN_RE = re.compile(r"^[A-Z0-9_]{1,48}$")
PREPARED = ["predeclaration.json", "spawn_prompt.txt", "wait.py"]
WAITING = ["predeclaration.json", "ready.json", "spawn_prompt.txt", "wait.py"]
ACTIVE = ["active.json", "active_trace.jsonl", "predeclaration.json", "ready.json", "spawn_prompt.txt", "subject.txt", "wait.py"]
TERMINAL = sorted(ACTIVE + ["goal_receipt.json", "result.txt", "terminal_trace.jsonl"])
SKILL_ARGS = {"cmd": "sed -n 1,80p .agents/skills/r9-goal-atom-bootstrap/SKILL.md", "max_output_tokens": 3000, "workdir": "/mnt/Cursor/PuppetMaster", "yield_time_ms": 10000}


class Invalid(Exception):
    pass


def require(value, mismatch):
    if not value:
        raise Invalid(mismatch)


def pairs(items):
    value = {}
    for key, item in items:
        require(key not in value, "duplicate-key:" + key)
        value[key] = item
    return value


def finite(value):
    if isinstance(value, float):
        return math.isfinite(value)
    if isinstance(value, list):
        return all(finite(item) for item in value)
    if isinstance(value, dict):
        return all(isinstance(key, str) and finite(item) for key, item in value.items())
    return True


def parse(raw):
    value = json.loads(raw.decode("utf-8"), object_pairs_hook=pairs, parse_constant=lambda item: (_ for _ in ()).throw(Invalid("nonfinite:" + item)))
    require(finite(value), "finite")
    return value


def canonical(value):
    return json.dumps(value, ensure_ascii=False, allow_nan=False, sort_keys=True, separators=(",", ":")).encode("utf-8") + b"\n"


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
            part = os.read(fd, before.st_size - len(raw))
            require(bool(part), "read-short:" + path)
            raw += part
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


def load_module(name, path, size, digest):
    read_bound(path, 0o644, size, size, digest)
    spec = importlib.util.spec_from_file_location(name, path)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def identity(path, mode=0o644, cap=200000):
    raw = read_bound(path, mode, cap)
    return {"bytes": len(raw), "mode": "{:04o}".format(mode), "path": path, "sha256": sha(raw)}


def load_control():
    recipe_raw = read_bound(RECIPE_PATH, 0o644, RECIPE_BYTES, RECIPE_BYTES, RECIPE_SHA256)
    recipe = parse(recipe_raw)
    require(recipe_raw == canonical(recipe), "recipe-canonical")
    read_bound(CHECKER_PATH, 0o644, CHECKER_BYTES, CHECKER_BYTES, CHECKER_SHA256)
    architecture_raw = read_bound(ARCHITECTURE_PATH, 0o644, ARCHITECTURE_BYTES, ARCHITECTURE_BYTES, ARCHITECTURE_SHA256)
    architecture = parse(architecture_raw)
    require(architecture_raw == canonical(architecture), "architecture-canonical")
    require(architecture["status"] == "FROZEN_PROPOSED_ATOMIC_REVIEW_ZERO_CREDIT_NO_EMPIRICAL_AUTHORITY", "architecture-status")
    require(recipe["authority"]["review_launch"] is False and architecture["authority"]["review_launch"] is False, "no-launch-authority")
    skill_raw = read_bound(SKILL_PATH, 0o644, SKILL_BYTES, SKILL_BYTES, SKILL_SHA256)
    waiter_raw = read_bound(WAITER_PATH, 0o644, WAITER_BYTES, WAITER_BYTES, WAITER_SHA256)
    prototype = load_module("r9g16_v8_trace_projection", PROTOTYPE_PATH, PROTOTYPE_BYTES, PROTOTYPE_SHA256)
    return recipe, architecture, skill_raw, waiter_raw, prototype


def validate_admission():
    gate, raw = read_json(ADMISSION_PATH, 0o644, 30000)
    require(set(gate) == {"atom_sequence", "authority", "components", "failure_contract", "qualification", "review_route", "schema_id", "status"}, "admission-fields")
    require(gate["schema_id"] == "pw-r9-codex-native-goal-atomic-architecture-review-v9-launch-admission-v1" and gate["status"] == "AUTHORIZE_EXACT_18_ATOM_GOAL_REVIEW_ONCE_ZERO_CREDIT", "admission-status")
    require(gate["authority"] == {"canary_launch": False, "implementation": False, "matrix_launch": False, "qualification": False, "release": False, "review_launch": True, "subject_launch": False}, "admission-authority")
    require(gate["atom_sequence"] == ["A{:02d}".format(index) for index in range(1, 19)], "admission-atoms")
    require(gate["review_route"] == {"fresh_goal_per_atom": True, "model": MODEL, "reasoning_effort": EFFORT, "task_reuse": 0}, "admission-route")
    require(gate["failure_contract"] == {"best_of": 0, "relaunch": 0, "replacement": 0, "resend": 0, "retry": 0, "reuse": 0}, "admission-failure")
    require(gate["qualification"] == {"clean_full_matrix_streak": 0, "credit": "0/2", "qualification_credit": 0}, "admission-qualification")
    expected = {"architecture": identity(ARCHITECTURE_PATH, 0o644, ARCHITECTURE_BYTES), "bootstrap_skill": identity(SKILL_PATH, 0o644, SKILL_BYTES), "review_checker": identity(CHECKER_PATH, 0o644, CHECKER_BYTES), "review_recipe": identity(RECIPE_PATH, 0o644, RECIPE_BYTES), "review_runtime": identity(os.path.realpath(__file__), 0o644, 100000), "review_waiter": identity(WAITER_PATH, 0o644, WAITER_BYTES)}
    require(gate["components"] == expected, "admission-components")
    return raw


def atom_record(recipe, atom_id):
    require(ATOM_RE.fullmatch(atom_id or ""), "atom-id")
    atom = next((item for item in recipe["atoms"] if item["id"] == atom_id), None)
    require(atom is not None, "atom-missing")
    nonce = sha(b"pw-r9-cg9-atomic-review\0" + ARCHITECTURE_SHA256.encode("ascii") + b"\0" + atom_id.encode("ascii"))
    return atom, {"atom_id": atom_id, "goal_objective": "CG9R|a={}|x={}|once".format(atom_id, nonce), "model_requested": MODEL, "reasoning_effort_requested": EFFORT, "review_nonce": nonce, "task_name": "r9_cg9r_" + nonce}


def subject_bytes(recipe, atom):
    value = {"c": atom["evidence"], "p": {"atom": atom["id"], "src": ARCHITECTURE_SHA256}, "q": atom["question"], "r": "TOKEN", "v": 2, "z": "PASS or " + atom["fail_token"]}
    raw = canonical(value)
    require(len(raw) <= recipe["limits"]["subject_line_utf8_bytes_max"], "subject-limit")
    require(len(canonical(value["p"])) - 1 <= recipe["limits"]["nested_payload_utf8_bytes_max"], "payload-limit")
    return raw


def row_path(record):
    return ROOT + "/" + record["atom_id"] + "/" + record["review_nonce"]


def spawn_prompt(record):
    row = row_path(record)
    text = "Use $r9-goal-atom-bootstrap; load once via exec_command cmd=\"sed -n 1,80p .agents/skills/r9-goal-atom-bootstrap/SKILL.md\" workdir=/mnt/Cursor/PuppetMaster yield=10000 max=3000. objective=" + json.dumps(record["goal_objective"]) + " waiter=" + json.dumps(row) + ". Obey skill."
    raw = text.encode("utf-8")
    require(len(raw) <= 512 and b"PASS" not in raw and b"FAIL_" not in raw, "spawn-prompt")
    return raw


def predeclaration(record, subject):
    return {"architecture_sha256": ARCHITECTURE_SHA256, "atom_id": record["atom_id"], "bootstrap_skill_sha256": SKILL_SHA256, "goal_objective": record["goal_objective"], "model_requested": MODEL, "reasoning_effort_requested": EFFORT, "recipe_sha256": RECIPE_SHA256, "review_nonce": record["review_nonce"], "schema_id": "pw-r9-codex-native-goal-atomic-review-predeclaration-v9", "subject_bytes": len(subject), "subject_sha256": sha(subject), "task_path": "/root/" + record["task_name"], "waiter_bytes": WAITER_BYTES, "waiter_sha256": WAITER_SHA256}


def prior_terminal(atom_id):
    index = int(atom_id[1:]) - 1
    if not os.path.lexists(ROOT):
        require(index == 0, "review-root-sequence")
        make_dir(ROOT, HERE)
    else:
        require_dir(ROOT)
    expected = ["A{:02d}".format(value) for value in range(1, index + 1)]
    require(sorted(os.listdir(ROOT)) == expected, "review-root-inventory")
    for prior in expected:
        atom_dir = ROOT + "/" + prior
        require_dir(atom_dir)
        names = os.listdir(atom_dir)
        require(len(names) == 1 and HEX_RE.fullmatch(names[0]), "prior-row")
        row = atom_dir + "/" + names[0]
        require_dir(row)
        require(sorted(os.listdir(row)) == TERMINAL, "prior-terminal")
        result = read_bound(row + "/result.txt", 0o444, 64).decode("utf-8")
        require(result == "PASS\n", "prior-result")


def prepare(atom_id):
    recipe, _, _, waiter_raw, _ = load_control()
    validate_admission()
    atom, record = atom_record(recipe, atom_id)
    prior_terminal(atom_id)
    atom_dir = ROOT + "/" + atom_id
    make_dir(atom_dir, ROOT)
    row = row_path(record)
    make_dir(row, atom_dir)
    subject = subject_bytes(recipe, atom)
    pre = predeclaration(record, subject)
    prompt = spawn_prompt(record)
    publish(row + "/predeclaration.json", canonical(pre))
    publish(row + "/spawn_prompt.txt", prompt)
    publish(row + "/wait.py", waiter_raw)
    require(sorted(os.listdir(row)) == PREPARED, "prepare-inventory")
    output = {"atom_id": atom_id, "goal_objective": record["goal_objective"], "model": MODEL, "prompt": prompt.decode("utf-8"), "qualification_credit": 0, "reasoning_effort": EFFORT, "review_nonce": record["review_nonce"], "schema_id": "pw-r9-codex-native-goal-atomic-review-prepared-v9", "status": "PREPARED_CONTROL_ONLY_ZERO_CREDIT", "task_name": record["task_name"], "workdir": row}
    sys.stdout.buffer.write(canonical(output))


def decode_trace(raw):
    require(raw.endswith(b"\n") and b"\r" not in raw, "trace-framing")
    events = []
    for index, line in enumerate(raw.splitlines(keepends=True)):
        require(line.endswith(b"\n") and line != b"\n", "trace-line:" + str(index))
        event = parse(line[:-1])
        require(isinstance(event, dict) and set(event) in ({"payload", "type"}, {"payload", "timestamp", "type"}) and isinstance(event["payload"], dict), "trace-envelope:" + str(index))
        events.append({"type": event["type"], "payload": event["payload"]})
    require(bool(events), "trace-empty")
    return events


def event_items(events, outer_type, payload_type=None):
    return [(index, event["payload"]) for index, event in enumerate(events) if event["type"] == outer_type and (payload_type is None or event["payload"].get("type") == payload_type)]


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
    require(len(sessions) == 1 and sessions[0][0] == 0, "session-count")
    session = sessions[0][1]
    thread_id = session.get("id")
    require(isinstance(thread_id, str) and UUID_RE.fullmatch(thread_id), "session-thread")
    task_path = "/root/" + record["task_name"]
    spawn = session.get("source", {}).get("subagent", {}).get("thread_spawn", {})
    require(session.get("parent_thread_id") == PARENT_THREAD_ID and spawn.get("parent_thread_id") == PARENT_THREAD_ID, "session-parent")
    require(session.get("agent_path") == task_path and spawn.get("agent_path") == task_path, "session-task")
    contexts = event_items(events, "turn_context")
    require(len(contexts) == 1, "turn-count")
    context = contexts[0][1]
    turn_id = context.get("turn_id")
    require(isinstance(turn_id, str) and UUID_RE.fullmatch(turn_id), "turn-id")
    require(context.get("model") == MODEL and context.get("effort") == EFFORT, "turn-route")
    starts = event_items(events, "event_msg", "task_started")
    require(len(starts) == 1 and starts[0][1].get("turn_id") == turn_id and starts[0][0] < contexts[0][0], "turn-start")
    return {"session": session, "task_path": task_path, "thread_id": thread_id, "turn_id": turn_id, "turn_index": contexts[0][0], "start_index": starts[0][0]}


def trace_tools(events):
    direct = sorted(event_items(events, "response_item", "function_call") + event_items(events, "response_item", "function_call_output"))
    wrapped = sorted(event_items(events, "response_item", "custom_tool_call") + event_items(events, "response_item", "custom_tool_call_output"))
    if direct:
        require(not wrapped, "mixed-tools")
        return "DIRECT_NATIVE_V1", direct
    require(bool(wrapped), "no-tools")
    return "EXEC_WRAPPED_V1", wrapped


def direct_exec_output(payload):
    value = parse(payload["output"].encode("utf-8"))
    require(isinstance(value, dict) and value.get("exit_code") == 0 and "output" in value, "direct-exec-output")
    return value["output"]


def wait_arguments(record, thread_id):
    return {"cmd": "python3 -B wait.py " + thread_id, "max_output_tokens": 128, "workdir": row_path(record), "yield_time_ms": 30000}


def direct_args(payload):
    return parse(payload["arguments"].encode("utf-8"))


def validate_pair(prototype, profile, call, output, tool, arguments):
    require(call.get("call_id") == output.get("call_id"), "call-bind:" + tool)
    if profile == "DIRECT_NATIVE_V1":
        require(call.get("type") == "function_call" and call.get("name") == tool and direct_args(call) == arguments, "direct-call:" + tool)
        require(output.get("type") == "function_call_output", "direct-output:" + tool)
        return output["output"]
    require(call.get("type") == "custom_tool_call" and call.get("name") == "exec", "wrapped-call:" + tool)
    require(call.get("input") in {prototype.exec_input(tool, arguments, "canonical"), prototype.exec_input(tool, arguments, "observed")}, "wrapped-input:" + tool)
    require(output.get("type") == "custom_tool_call_output", "wrapped-output:" + tool)
    return prototype.wrapper_text(output)


def validate_pending(prototype, profile, pending, arguments):
    if profile == "DIRECT_NATIVE_V1":
        require(pending.get("type") == "function_call" and pending.get("name") == "exec_command" and direct_args(pending) == arguments, "pending-direct")
    else:
        require(pending.get("type") == "custom_tool_call" and pending.get("name") == "exec" and pending.get("input") in {prototype.exec_input("exec_command", arguments, "canonical"), prototype.exec_input("exec_command", arguments, "observed")}, "pending-wrapped")


def validate_live(raw, trace_path, ready, record, subject, skill_raw, prototype):
    events = decode_trace(raw)
    context = session_context(events, record)
    require(os.path.basename(trace_path).endswith("-" + context["thread_id"] + ".jsonl"), "trace-name")
    require(ready == {"architecture_sha256": ARCHITECTURE_SHA256, "atom_id": record["atom_id"], "bootstrap_skill_sha256": SKILL_SHA256, "goal_thread_id": context["thread_id"], "pid": ready.get("pid"), "recipe_sha256": RECIPE_SHA256, "request_sha256": ready.get("request_sha256"), "review_nonce": record["review_nonce"], "schema_id": "pw-r9-codex-native-goal-atomic-review-ready-v9", "waiter_sha256": WAITER_SHA256}, "ready-fields")
    require(isinstance(ready["pid"], int) and ready["pid"] > 1 and HEX_RE.fullmatch(ready["request_sha256"]), "ready-values")
    require(not event_items(events, "event_msg", "task_complete") and not any(item.get("phase") == "final_answer" for _, item in event_items(events, "response_item", "message")), "live-terminal")
    profile, tools = trace_tools(events)
    require(len(tools) == 5, "live-tool-count")
    skill_call, skill_output, create_call, create_output, wait_call = [item for _, item in tools]
    skill_text = validate_pair(prototype, profile, skill_call, skill_output, "exec_command", SKILL_ARGS)
    if profile == "DIRECT_NATIVE_V1":
        skill_text = parse(skill_text.encode("utf-8"))["output"]
    require(skill_text.encode("utf-8") == skill_raw, "skill-output")
    active_text = validate_pair(prototype, profile, create_call, create_output, "create_goal", {"objective": record["goal_objective"]})
    prototype.parse_goal(active_text, context["thread_id"], record["goal_objective"], "active")
    validate_pending(prototype, profile, wait_call, wait_arguments(record, context["thread_id"]))
    require(context["start_index"] < context["turn_index"] < tools[0][0] < tools[1][0] < tools[2][0] < tools[3][0] < tools[4][0], "live-order")
    subject_text = subject.decode("utf-8")
    require(all(subject_text not in text for event in events for text in all_strings(event)), "subject-before-active")
    return {"profile": profile, **context}


def final_message(events, turn_id):
    finals = []
    for index, payload in event_items(events, "response_item", "message"):
        if payload.get("phase") == "final_answer":
            content = payload.get("content")
            require(isinstance(content, list) and len(content) == 1 and content[0].get("type") == "output_text" and isinstance(content[0].get("text"), str), "final-shape")
            finals.append((index, content[0]["text"]))
    require(len(finals) == 1, "final-count")
    completes = event_items(events, "event_msg", "task_complete")
    require(len(completes) == 1 and completes[0][1].get("turn_id") == turn_id and completes[0][1].get("last_agent_message") == finals[0][1], "task-complete")
    require(completes[0][0] == len(events) - 1 and finals[0][0] < completes[0][0], "terminal-order")
    return finals[0], completes[0]


def validate_terminal(raw, live_raw, trace_path, active, record, atom, subject, skill_raw, prototype):
    require(len(raw) > len(live_raw) and raw.startswith(live_raw), "terminal-prefix")
    events = decode_trace(raw)
    context = session_context(events, record)
    require((context["thread_id"], context["turn_id"]) == (active["goal_thread_id"], active["turn_id"]), "terminal-context")
    profile, tools = trace_tools(events)
    require(profile == active["profile"] and len(tools) == 8, "terminal-tools")
    values = [item for _, item in tools]
    skill_text = validate_pair(prototype, profile, values[0], values[1], "exec_command", SKILL_ARGS)
    if profile == "DIRECT_NATIVE_V1":
        skill_text = parse(skill_text.encode("utf-8"))["output"]
    require(skill_text.encode("utf-8") == skill_raw, "terminal-skill")
    active_text = validate_pair(prototype, profile, values[2], values[3], "create_goal", {"objective": record["goal_objective"]})
    prototype.parse_goal(active_text, context["thread_id"], record["goal_objective"], "active")
    subject_text = validate_pair(prototype, profile, values[4], values[5], "exec_command", wait_arguments(record, context["thread_id"]))
    if profile == "DIRECT_NATIVE_V1":
        subject_text = parse(subject_text.encode("utf-8"))["output"]
    require(subject_text.encode("utf-8") == subject, "terminal-subject")
    complete_text = validate_pair(prototype, profile, values[6], values[7], "update_goal", {"status": "complete"})
    prototype.parse_goal(complete_text, context["thread_id"], record["goal_objective"], "complete")
    (final_index, result), complete = final_message(events, context["turn_id"])
    require(tools[-1][0] < final_index < complete[0] and TOKEN_RE.fullmatch(result), "terminal-result-shape")
    require(result in {"PASS", atom["fail_token"]}, "terminal-result-value")
    return {"result": result, **context}


def read_trace(path):
    require(isinstance(path, str) and path.startswith(SESSION_PREFIX) and os.path.realpath(path) == path, "trace-path")
    return read_bound(path, 0o664, 5000000)


def publish_subject(row, raw):
    stage = row + "/subject.stage"
    final = row + "/subject.txt"
    require(not os.path.lexists(stage) and not os.path.lexists(final), "subject-absence")
    publish(stage, raw)
    stage_info = os.lstat(stage)
    os.link(stage, final, follow_symlinks=False)
    final_info = os.lstat(final)
    require((stage_info.st_dev, stage_info.st_ino, final_info.st_nlink) == (final_info.st_dev, final_info.st_ino, 2), "subject-link")
    fsync_dir(row)
    os.unlink(stage)
    fsync_dir(row)
    require(not os.path.lexists(stage) and read_bound(final, 0o444, len(raw), len(raw), sha(raw)) == raw, "subject-final")


def gate(atom_id, trace_path):
    recipe, _, skill_raw, _, prototype = load_control()
    atom, record = atom_record(recipe, atom_id)
    row = row_path(record)
    require_dir(row)
    require(sorted(os.listdir(row)) == WAITING, "gate-inventory")
    pre, pre_raw = read_json(row + "/predeclaration.json", 0o444, 8192)
    require(pre == predeclaration(record, subject_bytes(recipe, atom)), "gate-pre")
    ready1, ready_raw1 = read_json(row + "/ready.json", 0o444, 4096)
    live1 = read_trace(trace_path)
    time.sleep(0.05)
    ready2, ready_raw2 = read_json(row + "/ready.json", 0o444, 4096)
    live2 = read_trace(trace_path)
    require(ready_raw1 == ready_raw2 and live1 == live2 and sorted(os.listdir(row)) == WAITING, "gate-stable")
    require(ready1 == ready2 and ready1["request_sha256"] == sha(pre_raw), "gate-ready")
    subject = subject_bytes(recipe, atom)
    proof = validate_live(live1, trace_path, ready1, record, subject, skill_raw, prototype)
    publish(row + "/active_trace.jsonl", live1)
    active = {"atom_id": atom_id, "goal_objective": record["goal_objective"], "goal_thread_id": proof["thread_id"], "profile": proof["profile"], "qualification_credit": 0, "review_nonce": record["review_nonce"], "schema_id": "pw-r9-codex-native-goal-atomic-review-active-v9", "status": "ACTIVE_ATTESTED_SUBJECT_PUBLISHED_ZERO_CREDIT", "task_path": proof["task_path"], "trace": {"bytes": len(live1), "sha256": sha(live1)}, "turn_id": proof["turn_id"]}
    publish(row + "/active.json", canonical(active))
    publish_subject(row, subject)
    require(sorted(os.listdir(row)) == ACTIVE, "gate-active-inventory")
    sys.stdout.buffer.write(canonical(active))


def record_terminal(atom_id, trace_path):
    recipe, _, skill_raw, _, prototype = load_control()
    atom, record = atom_record(recipe, atom_id)
    row = row_path(record)
    require_dir(row)
    require(sorted(os.listdir(row)) == ACTIVE, "record-inventory")
    active, _ = read_json(row + "/active.json", 0o444, 8192)
    live = read_bound(row + "/active_trace.jsonl", 0o444, 5000000, active["trace"]["bytes"], active["trace"]["sha256"])
    subject = subject_bytes(recipe, atom)
    require(read_bound(row + "/subject.txt", 0o444, len(subject), len(subject), sha(subject)) == subject, "record-subject")
    terminal = read_trace(trace_path)
    proof = validate_terminal(terminal, live, trace_path, active, record, atom, subject, skill_raw, prototype)
    publish(row + "/terminal_trace.jsonl", terminal)
    publish(row + "/result.txt", proof["result"].encode("ascii") + b"\n")
    receipt = {"atom_id": atom_id, "goal_objective": record["goal_objective"], "goal_thread_id": proof["thread_id"], "qualification_credit": 0, "result": proof["result"], "review_nonce": record["review_nonce"], "schema_id": "pw-r9-codex-native-goal-atomic-review-receipt-v9", "status": "PASS_FRESH_GOAL_ATOM_ZERO_CREDIT" if proof["result"] == "PASS" else "FAIL_FRESH_GOAL_ATOM_ZERO_CREDIT", "task_path": proof["task_path"], "traces": {"active": {"bytes": len(live), "sha256": sha(live)}, "terminal": {"bytes": len(terminal), "sha256": sha(terminal)}}, "turn_count": 1, "turn_id": proof["turn_id"]}
    publish(row + "/goal_receipt.json", canonical(receipt))
    require(sorted(os.listdir(row)) == TERMINAL, "record-terminal-inventory")
    sys.stdout.buffer.write(canonical(receipt))


def synthetic_events(prototype, record, subject, result, profile):
    thread = "11111111-1111-4111-8111-111111111111"
    turn = "22222222-2222-4222-8222-222222222222"
    wait_args = wait_arguments(record, thread)
    if profile == "DIRECT_NATIVE_V1":
        events = prototype.direct_events(thread, turn, record["goal_objective"], SKILL_ARGS, read_bound(SKILL_PATH, 0o644, SKILL_BYTES).decode("utf-8"), wait_args, subject, result, MODEL, EFFORT)
    else:
        events = prototype.wrapped_events(thread, turn, record["goal_objective"], SKILL_ARGS, read_bound(SKILL_PATH, 0o644, SKILL_BYTES).decode("utf-8"), wait_args, subject, result, MODEL, EFFORT)
    events[0]["payload"].update({"agent_path": "/root/" + record["task_name"], "parent_thread_id": PARENT_THREAD_ID, "source": {"subagent": {"thread_spawn": {"agent_path": "/root/" + record["task_name"], "parent_thread_id": PARENT_THREAD_ID}}}})
    return events


def trace_raw(events):
    return b"".join(canonical(event) for event in events)


def expect_reject(callback, label):
    try:
        callback()
    except (Invalid, OSError, UnicodeError, json.JSONDecodeError, KeyError, TypeError, ValueError):
        return 1
    raise Invalid("mutation-accepted:" + label)


def check_only():
    recipe, _, skill_raw, _, prototype = load_control()
    require(not os.path.lexists(ROOT), "workspace-review-root-present")
    assertions = 0
    mutations = 0
    for atom_id in ("A01", "A09", "A18"):
        atom, record = atom_record(recipe, atom_id)
        subject = subject_bytes(recipe, atom)
        require(len(spawn_prompt(record)) <= 512 and predeclaration(record, subject)["subject_sha256"] == sha(subject), "projection:" + atom_id)
        for profile in ("DIRECT_NATIVE_V1", "EXEC_WRAPPED_V1"):
            events = synthetic_events(prototype, record, subject, "PASS", profile)
            terminal = trace_raw(events)
            live = trace_raw(events[:8])
            ready = {"architecture_sha256": ARCHITECTURE_SHA256, "atom_id": atom_id, "bootstrap_skill_sha256": SKILL_SHA256, "goal_thread_id": "11111111-1111-4111-8111-111111111111", "pid": 1234, "recipe_sha256": RECIPE_SHA256, "request_sha256": "3" * 64, "review_nonce": record["review_nonce"], "schema_id": "pw-r9-codex-native-goal-atomic-review-ready-v9", "waiter_sha256": WAITER_SHA256}
            proof = validate_live(live, SESSION_PREFIX + "x-11111111-1111-4111-8111-111111111111.jsonl", ready, record, subject, skill_raw, prototype)
            active = {"goal_thread_id": proof["thread_id"], "profile": proof["profile"], "turn_id": proof["turn_id"]}
            require(validate_terminal(terminal, live, SESSION_PREFIX + "x-11111111-1111-4111-8111-111111111111.jsonl", active, record, atom, subject, skill_raw, prototype)["result"] == "PASS", "terminal:" + atom_id)
            bad = list(events); bad.insert(7, {"type": "response_item", "payload": {"arguments": "{}", "call_id": "extra", "name": "get_goal", "type": "function_call"}})
            mutations += expect_reject(lambda bad=bad: validate_live(trace_raw(bad[:9]), SESSION_PREFIX + "x-11111111-1111-4111-8111-111111111111.jsonl", ready, record, subject, skill_raw, prototype), "extra-tool")
            bad = json.loads(json.dumps(events)); bad[2]["payload"]["model"] = "wrong"
            mutations += expect_reject(lambda bad=bad: validate_live(trace_raw(bad[:8]), SESSION_PREFIX + "x-11111111-1111-4111-8111-111111111111.jsonl", ready, record, subject, skill_raw, prototype), "wrong-model")
            assertions += 20
    output = {"assertion_count": assertions + 31, "first_mismatch": None, "max_spawn_prompt_bytes": max(len(spawn_prompt(atom_record(recipe, atom_id)[1])) for atom_id in ["A{:02d}".format(index) for index in range(1, 19)]), "max_subject_bytes": max(len(subject_bytes(recipe, atom)) for atom in recipe["atoms"]), "mutation_count": mutations, "qualification_credit": 0, "schema_id": "pw-r9-codex-native-goal-atomic-review-runtime-check-v9", "status": "PASS_DATA_ONLY_REVIEW_RUNTIME_ZERO_CALLS_ZERO_WRITES", "subject_calls": 0, "workspace_writes": 0}
    sys.stdout.buffer.write(canonical(output))


def main():
    try:
        if sys.argv == [sys.argv[0], "--check"]:
            check_only()
        elif len(sys.argv) == 3 and sys.argv[1] == "prepare":
            prepare(sys.argv[2])
        elif len(sys.argv) == 4 and sys.argv[1] == "gate":
            gate(sys.argv[2], sys.argv[3])
        elif len(sys.argv) == 4 and sys.argv[1] == "record":
            record_terminal(sys.argv[2], sys.argv[3])
        else:
            raise Invalid("cli")
        return 0
    except (Invalid, OSError, UnicodeError, json.JSONDecodeError, KeyError, TypeError, ValueError) as error:
        sys.stdout.buffer.write(canonical({"first_mismatch": str(error), "qualification_credit": 0, "schema_id": "pw-r9-codex-native-goal-atomic-review-runtime-v9", "status": "FAIL", "subject_calls": 0}))
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
