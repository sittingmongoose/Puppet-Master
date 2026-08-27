#!/usr/bin/env python3
import hashlib
import json
import math
import os
import re
import stat
import sys
import types

sys.dont_write_bytecode = True
HERE = "/mnt/Cursor/PuppetMaster/tests/r9g19"
ROOT = HERE + "/r"
ARCH = "/mnt/Cursor/PuppetMaster/tests/agent_packet_restrictions/successor_20260813/r9_control_plane_stabilization_v1/r9_codex_native_goal_self_attesting_packet_atomic_review_v12.json"
ARCH_BYTES = 2576
ARCH_SHA256 = "b31e34fe302c6c9b17478cea888c1c26beea4b26179daa9a0600572645335352"
COMPILER = HERE + "/packet_compiler.py"
COMPILER_BYTES = 6201
COMPILER_SHA256 = "ecdf00449c2a16c4b05e34cd7a1a03159ed5a3ba88cabe5f93fe8c7ac4a97011"
CROSSCHECK = HERE + "/packet_crosscheck.py"
CROSSCHECK_BYTES = 9780
CROSSCHECK_SHA256 = "51d363066f036142c5881fb47a3c3d0b585d1931f2e06c8870ff13524e64d758"
WAITER = HERE + "/wait.py"
WAITER_BYTES = 16299
WAITER_SHA256 = "9f7ae1067df99ed8ea2c53be0fd37ebb713b5225d474e61285f0b1dfe2c0318c"
CODEC = "/mnt/Cursor/PuppetMaster/tests/r9g17/native_envelope.py"
CODEC_BYTES = 4661
CODEC_SHA256 = "d2aef9d619f6c4ec779e6d2dce2d1b6fc89282fd91cc4b9f56bc82490df0f246"
RECIPE = "/mnt/Cursor/PuppetMaster/tests/r9g16/review_recipe.json"
RECIPE_BYTES = 7936
RECIPE_SHA256 = "100386642d6680db468c1e9a0ddf7c2c774728f4444e540ca2d655fe8669f690"
SKILL = "/mnt/Cursor/PuppetMaster/.agents/skills/r9-goal-atom-bootstrap/SKILL.md"
SKILL_BYTES = 1327
SKILL_SHA256 = "7fba245c05b7fb104054ea18af4d0a2fd90d4f28f295c94f7c12b699b343d8b4"
V11_FAILURE = "/mnt/Cursor/PuppetMaster/tests/agent_packet_restrictions/successor_20260813/r9_control_plane_stabilization_v1/r9_codex_native_goal_single_source_packet_atomic_review_v11_a01_runtime_failure_receipt_v1.json"
V11_FAILURE_BYTES = 4063
V11_FAILURE_SHA256 = "f59579798fc894d6bb582f193929daa57956f73ecac010b67fc4bc8167ffdbcb"
CHURN = "/mnt/Cursor/PuppetMaster/tests/agent_packet_restrictions/successor_20260813/r9_control_plane_stabilization_v1/r9_codex_native_goal_churn_audit_20260824t052021z_v1.json"
CHURN_BYTES = 3276
CHURN_SHA256 = "b0ba8ff2be803f20d19f2aed093803b6834a4406e34b12207bddb900fb4bdb4e"
VERIFIER = HERE + "/offline_verifier.py"
V1_GATE_FAILURE = "/mnt/Cursor/PuppetMaster/tests/agent_packet_restrictions/successor_20260813/r9_control_plane_stabilization_v1/r9_codex_native_goal_self_attesting_packet_atomic_review_v12_v1_prelaunch_gate_failure_receipt.json"
V1_GATE_FAILURE_BYTES = 2025
V1_GATE_FAILURE_SHA256 = "9b5f56f4c29fd6d4416790ecf051cd29b911679d58b3bc3646d80eb67b88565e"
VALIDATION = "/mnt/Cursor/PuppetMaster/tests/agent_packet_restrictions/successor_20260813/r9_control_plane_stabilization_v1/r9_codex_native_goal_self_attesting_packet_atomic_review_v12_data_only_validation_v2.json"
ADMISSION = "/mnt/Cursor/PuppetMaster/tests/agent_packet_restrictions/successor_20260813/r9_control_plane_stabilization_v1/r9_codex_native_goal_self_attesting_packet_atomic_review_v12_launch_admission_v2.json"
PARENT = "01a00b52-4879-7c41-a826-7b4609ad3c3b"
MODEL = "gpt-5.6-luna"
EFFORT = "medium"
SKILL_ARGS = {"cmd": "sed -n 1,80p .agents/skills/r9-goal-atom-bootstrap/SKILL.md", "max_output_tokens": 3000, "workdir": "/mnt/Cursor/PuppetMaster", "yield_time_ms": 10000}
UUID = re.compile(r"^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$")
HEX = re.compile(r"^[0-9a-f]{64}$")
TOKEN = re.compile(r"^[A-Za-z0-9._:-]{1,48}$")


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


def read_bound(path, mode, cap, size=None, digest=None):
    before = os.lstat(path)
    require(stat.S_ISREG(before.st_mode) and not stat.S_ISLNK(before.st_mode) and stat.S_IMODE(before.st_mode) == mode and before.st_uid == os.getuid() and before.st_nlink == 1 and before.st_size <= cap, "custody:" + path)
    if size is not None:
        require(before.st_size == size, "size:" + path)
    fd = os.open(path, os.O_RDONLY | os.O_NOFOLLOW | os.O_CLOEXEC)
    try:
        require(metadata(os.fstat(fd)) == metadata(before), "race:" + path)
        raw = b""
        while len(raw) < before.st_size:
            part = os.read(fd, before.st_size - len(raw))
            require(bool(part), "short:" + path)
            raw += part
        require(os.read(fd, 1) == b"", "trailing:" + path)
    finally:
        os.close(fd)
    require(metadata(os.lstat(path)) == metadata(before), "drift:" + path)
    if digest is not None:
        require(sha(raw) == digest, "sha:" + path)
    return raw


def read_json(path, mode=0o644, cap=100000):
    raw = read_bound(path, mode, cap)
    value = parse(raw)
    require(raw == canonical(value), "canonical:" + path)
    return value, raw


def identity(path, mode=0o644, cap=200000):
    raw = read_bound(path, mode, cap)
    return {"bytes": len(raw), "mode": "{:04o}".format(mode), "path": path, "sha256": sha(raw)}


def load_module(name, path, size, digest):
    raw = read_bound(path, 0o644, size, size, digest)
    module = types.ModuleType(name)
    module.__file__ = path
    exec(compile(raw, path, "exec"), module.__dict__)
    return module


compiler = load_module("r9g19_runtime_compiler", COMPILER, COMPILER_BYTES, COMPILER_SHA256)
codec = load_module("r9g19_runtime_codec", CODEC, CODEC_BYTES, CODEC_SHA256)


def require_dir(path, mode):
    info = os.lstat(path)
    require(stat.S_ISDIR(info.st_mode) and not stat.S_ISLNK(info.st_mode) and stat.S_IMODE(info.st_mode) == mode and info.st_uid == os.getuid(), "dir:" + path)


def fsync_dir(path):
    fd = os.open(path, os.O_RDONLY | os.O_DIRECTORY | os.O_NOFOLLOW | os.O_CLOEXEC)
    try:
        os.fsync(fd)
    finally:
        os.close(fd)


def make_dir(path, parent, mode=0o700):
    require(not os.path.lexists(path), "exists:" + path)
    os.mkdir(path, mode)
    os.chmod(path, mode, follow_symlinks=False)
    fsync_dir(parent)
    require_dir(path, mode)


def write_raw(path, raw, mode=0o444):
    require(not os.path.lexists(path), "exists:" + path)
    fd = os.open(path, os.O_WRONLY | os.O_CREAT | os.O_EXCL | os.O_NOFOLLOW | os.O_CLOEXEC, mode)
    try:
        os.fchmod(fd, mode)
        view = memoryview(raw)
        while view:
            count = os.write(fd, view)
            require(count > 0, "write:" + path)
            view = view[count:]
        os.fsync(fd)
    finally:
        os.close(fd)
    fsync_dir(os.path.dirname(path))
    require(read_bound(path, mode, max(1, len(raw)), len(raw), sha(raw)) == raw, "reopen:" + path)


def write_json(path, value):
    write_raw(path, canonical(value))


def load_control():
    architecture, architecture_raw = read_json(ARCH, 0o644, ARCH_BYTES)
    require(sha(architecture_raw) == ARCH_SHA256 and architecture["status"] == "FROZEN_PROPOSED_SELF_ATTESTING_PACKET_REVIEW_ZERO_CREDIT_NO_LAUNCH_AUTHORITY", "architecture")
    recipe, recipe_raw = read_json(RECIPE, 0o644, RECIPE_BYTES)
    require(sha(recipe_raw) == RECIPE_SHA256 and recipe["status"] == "DATA_ONLY_REVIEW_CORPUS_ZERO_CREDIT_NO_LAUNCH_AUTHORITY", "recipe")
    skill = read_bound(SKILL, 0o644, SKILL_BYTES, SKILL_BYTES, SKILL_SHA256)
    waiter = read_bound(WAITER, 0o644, WAITER_BYTES, WAITER_BYTES, WAITER_SHA256)
    failure, failure_raw = read_json(V11_FAILURE, 0o644, V11_FAILURE_BYTES)
    require(sha(failure_raw) == V11_FAILURE_SHA256 and failure["status"] == "FAIL_PERMANENT_V11_A01_ZERO_SUBJECT_ZERO_CREDIT_REMAINING_REVIEW_FROZEN", "v11-failure")
    require(architecture["runtime_contract"]["parent_actions_between_spawn_and_terminal"] == 0 and architecture["qualification"]["credit"] == "0/2", "architecture-contract")
    return architecture, recipe, skill, waiter


def prior_terminal(recipe, atom_id):
    index = int(atom_id[1:]) - 1
    if not os.path.lexists(ROOT):
        require(index == 0, "root-sequence")
        make_dir(ROOT, HERE)
    else:
        require_dir(ROOT, 0o700)
    for offset, atom in enumerate(recipe["atoms"]):
        _, record = compiler.compile_record(recipe, atom["id"])
        path = compiler.row_path(record)
        if offset < index:
            require(os.path.lexists(path + "/review_receipt.json"), "prior-terminal:" + atom["id"])
        elif offset >= index:
            require(not os.path.lexists(path), "future-row:" + atom["id"])


def prepare(atom_id):
    architecture, recipe, _, waiter = load_control()
    require(os.path.lexists(ADMISSION) and validate_admission(), "admission")
    atom, record = compiler.compile_record(recipe, atom_id)
    prior_terminal(recipe, atom_id)
    atom_dir = ROOT + "/" + atom_id
    make_dir(atom_dir, ROOT)
    row = compiler.row_path(record)
    make_dir(row, atom_dir)
    subject = compiler.subject_bytes(atom)
    pre = compiler.predeclaration(record, subject, COMPILER_SHA256, WAITER_BYTES, WAITER_SHA256)
    prompt = compiler.spawn_prompt(record)
    write_json(row + "/predeclaration.json", pre)
    write_raw(row + "/spawn_prompt.txt", prompt)
    write_raw(row + "/subject.packet", subject)
    write_raw(row + "/wait.py", waiter)
    return {"atom_id": atom_id, "goal_objective": record["goal_objective"], "model": MODEL, "prompt": prompt.decode("utf-8"), "qualification_credit": 0, "reasoning_effort": EFFORT, "review_nonce": record["review_nonce"], "schema_id": "pw-r9-codex-native-goal-self-attesting-packet-review-prepared-v12", "status": "PREPARED_CONTROL_ONLY_ZERO_CREDIT", "task_name": record["task_name"], "workdir": row}


def decode_trace(raw):
    require(raw.endswith(b"\n") and b"\r" not in raw, "trace-framing")
    events = []
    for line in raw.splitlines(keepends=True):
        require(line.endswith(b"\n") and line.count(b"\n") == 1, "trace-line")
        event = parse(line)
        require(isinstance(event, dict) and set(event) == {"payload", "timestamp", "type"} and isinstance(event["payload"], dict), "trace-event")
        events.append(event)
    return events


def items(events, outer, inner=None):
    return [(index, event["payload"]) for index, event in enumerate(events) if event.get("type") == outer and (inner is None or event["payload"].get("type") == inner)]


def context(events, record):
    sessions = items(events, "session_meta")
    require(len(sessions) == 1 and sessions[0][0] == 0, "session")
    session = sessions[0][1]
    task = "/root/" + record["task_name"]
    spawn = session.get("source", {}).get("subagent", {}).get("thread_spawn", {})
    require(UUID.fullmatch(session.get("id", "")) and session.get("parent_thread_id") == PARENT and session.get("agent_path") == task, "session-identity")
    require(spawn.get("parent_thread_id") == PARENT and spawn.get("agent_path") == task and session.get("thread_source") == "subagent" and session.get("cli_version") == "0.148.0", "session-source")
    turns = items(events, "turn_context")
    require(len(turns) == 1 and turns[0][1].get("model") == MODEL and turns[0][1].get("effort") == EFFORT and UUID.fullmatch(turns[0][1].get("turn_id", "")), "turn")
    starts = items(events, "event_msg", "task_started")
    require(len(starts) == 1 and starts[0][1].get("turn_id") == turns[0][1]["turn_id"] and starts[0][0] < turns[0][0], "start")
    return {"task_path": task, "thread_id": session["id"], "turn_id": turns[0][1]["turn_id"], "turn_index": turns[0][0]}


def tool_rows(events):
    direct = items(events, "response_item", "function_call") + items(events, "response_item", "function_call_output")
    wrapped = sorted(items(events, "response_item", "custom_tool_call") + items(events, "response_item", "custom_tool_call_output"))
    require(not direct and bool(wrapped), "tool-profile")
    return wrapped


def pair(call, output, tool, arguments):
    require(call.get("call_id") == output.get("call_id") and call.get("name") == "exec" and call.get("type") == "custom_tool_call" and output.get("type") == "custom_tool_call_output", "pair:" + tool)
    decoded = codec.parse_call(call.get("input"))
    require(decoded["tool"] == tool and decoded["arguments"] == arguments, "semantics:" + tool)
    return codec.unwrap_output(output.get("output"))


def goal(text, thread, objective, status):
    value = parse(text.encode("utf-8"))
    require(set(value) == {"completionBudgetReport", "goal", "remainingTokens"} and value["remainingTokens"] is None, "goal-envelope")
    item = value["goal"]
    require(set(item) == {"createdAt", "objective", "status", "threadId", "timeUsedSeconds", "tokensUsed", "updatedAt"} and (item["threadId"], item["objective"], item["status"]) == (thread, objective, status), "goal-fields")
    require(all(isinstance(item[key], int) and not isinstance(item[key], bool) and item[key] >= 0 for key in ("createdAt", "updatedAt", "timeUsedSeconds", "tokensUsed")), "goal-counters")
    if status == "active":
        require(item["tokensUsed"] == item["timeUsedSeconds"] == 0 and value["completionBudgetReport"] is None, "goal-active")
    else:
        require(item["tokensUsed"] > 0 and isinstance(value["completionBudgetReport"], str) and value["completionBudgetReport"], "goal-complete")
    return item


def wait_args(record, thread):
    return {"cmd": "python3 -B wait.py " + thread, "max_output_tokens": 128, "workdir": compiler.row_path(record), "yield_time_ms": 30000}


def validate_active(raw, record, subject, skill):
    events = decode_trace(raw)
    proof = context(events, record)
    rows = tool_rows(events)
    require(len(rows) == 5 and not items(events, "event_msg", "task_complete"), "active-tools")
    values = [value for _, value in rows]
    indexes = [index for index, _ in rows]
    require(proof["turn_index"] < indexes[0] < indexes[1] < indexes[2] < indexes[3] < indexes[4] == len(events) - 1, "active-order")
    require(pair(values[0], values[1], "exec_command", SKILL_ARGS).encode("utf-8") == skill, "skill")
    active_goal = goal(pair(values[2], values[3], "create_goal", {"objective": record["goal_objective"]}), proof["thread_id"], record["goal_objective"], "active")
    pending = codec.parse_call(values[4].get("input"))
    require(pending["tool"] == "exec_command" and pending["arguments"] == wait_args(record, proof["thread_id"]), "pending")
    require(subject not in raw, "subject-before-active")
    return {**proof, "active_goal": active_goal, "profile": "SELF_ATTESTED_NATIVE_ENVELOPE_V1"}


def validate_terminal(raw, active_raw, record, atom, subject, skill):
    require(len(raw) > len(active_raw) and raw.startswith(active_raw), "terminal-prefix")
    active = validate_active(active_raw, record, subject, skill)
    events = decode_trace(raw)
    proof = context(events, record)
    require((proof["thread_id"], proof["turn_id"]) == (active["thread_id"], active["turn_id"]), "terminal-context")
    rows = tool_rows(events)
    require(len(rows) == 8, "terminal-tools")
    values = [value for _, value in rows]
    require(pair(values[0], values[1], "exec_command", SKILL_ARGS).encode("utf-8") == skill, "terminal-skill")
    active_goal = goal(pair(values[2], values[3], "create_goal", {"objective": record["goal_objective"]}), proof["thread_id"], record["goal_objective"], "active")
    require(pair(values[4], values[5], "exec_command", wait_args(record, proof["thread_id"])).encode("utf-8") == subject, "terminal-subject")
    complete_goal = goal(pair(values[6], values[7], "update_goal", {"status": "complete"}), proof["thread_id"], record["goal_objective"], "complete")
    require(complete_goal["createdAt"] == active_goal["createdAt"] and complete_goal["updatedAt"] >= active_goal["updatedAt"], "goal-continuity")
    finals = [(index, item) for index, item in items(events, "response_item", "message") if item.get("phase") == "final_answer"]
    completes = items(events, "event_msg", "task_complete")
    require(len(finals) == len(completes) == 1 and completes[0][0] == len(events) - 1 and rows[-1][0] < finals[0][0] < completes[0][0], "terminal-order")
    content = finals[0][1].get("content")
    require(isinstance(content, list) and len(content) == 1 and content[0].get("type") == "output_text" and TOKEN.fullmatch(content[0].get("text", "")), "terminal-token")
    result = content[0]["text"]
    require(result in {"PASS", atom["fail_token"]} and completes[0][1].get("last_agent_message") == result and completes[0][1].get("turn_id") == proof["turn_id"], "terminal-result")
    return {**proof, "active_goal": active_goal, "complete_goal": complete_goal, "profile": "SELF_ATTESTED_NATIVE_ENVELOPE_V1", "result": result}


def record_terminal(atom_id, task_path):
    _, recipe, skill, _ = load_control()
    atom, record = compiler.compile_record(recipe, atom_id)
    require(task_path == "/root/" + record["task_name"], "task-path")
    row = compiler.row_path(record)
    require_dir(row, 0o700)
    pre, _ = read_json(row + "/predeclaration.json", 0o444, 8192)
    subject = read_bound(row + "/subject.txt", 0o444, 512)
    packet = read_bound(row + "/subject.packet", 0o444, 512)
    require(subject == packet and (len(subject), sha(subject)) == (pre["subject_bytes"], pre["subject_sha256"]), "subject")
    active, _ = read_json(row + "/active.json", 0o444, 8192)
    active_raw = read_bound(row + "/active_trace.jsonl", 0o444, 300000)
    proof_active = validate_active(active_raw, record, subject, skill)
    require(os.path.basename(active["trace"]["path"]).endswith("-" + proof_active["thread_id"] + ".jsonl"), "active-trace-path")
    expected_active = {"active_goal": proof_active["active_goal"], "architecture_sha256": ARCH_SHA256, "atom_id": atom_id, "goal_thread_id": proof_active["thread_id"], "packet_compiler_sha256": COMPILER_SHA256, "profile": proof_active["profile"], "qualification_credit": 0, "review_nonce": record["review_nonce"], "schema_id": "pw-r9-codex-native-goal-self-attesting-packet-review-active-v12", "status": "ACTIVE_ATTESTED_SUBJECT_RELEASED_ZERO_CREDIT", "subject_bytes": len(subject), "subject_sha256": sha(subject), "task_path": task_path, "trace": {"bytes": len(active_raw), "path": active["trace"]["path"], "sha256": sha(active_raw)}, "turn_id": proof_active["turn_id"]}
    require(active == expected_active, "active-record")
    terminal_raw = read_bound(active["trace"]["path"], 0o664, 300000)
    proof = validate_terminal(terminal_raw, active_raw, record, atom, subject, skill)
    receipt = {"atom_id": atom_id, "goal_objective": record["goal_objective"], "goal_thread_id": proof["thread_id"], "qualification_credit": 0, "result": proof["result"], "review_nonce": record["review_nonce"], "schema_id": "pw-r9-codex-native-goal-self-attesting-packet-review-receipt-v12", "status": "PASS_FRESH_GOAL_ATOM_ZERO_CREDIT" if proof["result"] == "PASS" else "FAIL_FRESH_GOAL_ATOM_ZERO_CREDIT", "task_path": task_path, "traces": {"active": {"bytes": len(active_raw), "sha256": sha(active_raw)}, "terminal": {"bytes": len(terminal_raw), "sha256": sha(terminal_raw)}}, "turn_count": 1, "turn_id": proof["turn_id"]}
    write_raw(row + "/terminal_trace.jsonl", terminal_raw)
    write_json(row + "/goal_receipt.json", {"active": proof["active_goal"], "complete": proof["complete_goal"]})
    write_raw(row + "/result.txt", (proof["result"] + "\n").encode("ascii"))
    write_json(row + "/review_receipt.json", receipt)
    return receipt


def synthetic_call(tool, arguments, call_id):
    fields = ",".join(json.dumps(key) + ":" + json.dumps(value, separators=(",", ":")) for key, value in arguments.items())
    return {"call_id": call_id, "input": "const r = await tools." + tool + "({" + fields + "}); text(" + ("r.output" if tool == "exec_command" else "r") + ");\n", "name": "exec", "type": "custom_tool_call"}


def synthetic_output(body, call_id):
    return {"call_id": call_id, "output": [{"text": "Script completed\nWall time 0.1 seconds\nOutput:\n", "type": "input_text"}, {"text": body, "type": "input_text"}], "type": "custom_tool_call_output"}


def trace_raw(events):
    return b"".join(canonical(event) for event in events)


def synthetic_events(record, subject, skill):
    thread = "11111111-1111-4111-8111-111111111111"
    turn = "22222222-2222-4222-8222-222222222222"
    task = "/root/" + record["task_name"]
    active_goal = {"completionBudgetReport": None, "goal": {"createdAt": 1, "objective": record["goal_objective"], "status": "active", "threadId": thread, "timeUsedSeconds": 0, "tokensUsed": 0, "updatedAt": 1}, "remainingTokens": None}
    complete_goal = {"completionBudgetReport": "done", "goal": {"createdAt": 1, "objective": record["goal_objective"], "status": "complete", "threadId": thread, "timeUsedSeconds": 1, "tokensUsed": 1, "updatedAt": 2}, "remainingTokens": None}
    calls = [synthetic_call("exec_command", SKILL_ARGS, "c0"), synthetic_call("create_goal", {"objective": record["goal_objective"]}, "c1"), synthetic_call("exec_command", wait_args(record, thread), "c2"), synthetic_call("update_goal", {"status": "complete"}, "c3")]
    outputs = [synthetic_output(skill.decode("utf-8"), "c0"), synthetic_output(canonical(active_goal).decode("utf-8"), "c1"), synthetic_output(subject.decode("utf-8"), "c2"), synthetic_output(canonical(complete_goal).decode("utf-8"), "c3")]
    return [
        {"payload": {"agent_path": task, "cli_version": "0.148.0", "id": thread, "parent_thread_id": PARENT, "source": {"subagent": {"thread_spawn": {"agent_path": task, "parent_thread_id": PARENT}}}, "thread_source": "subagent"}, "timestamp": "x", "type": "session_meta"},
        {"payload": {"turn_id": turn, "type": "task_started"}, "timestamp": "x", "type": "event_msg"},
        {"payload": {"cwd": "/mnt/Cursor/PuppetMaster", "effort": EFFORT, "model": MODEL, "turn_id": turn}, "timestamp": "x", "type": "turn_context"},
        {"payload": calls[0], "timestamp": "x", "type": "response_item"}, {"payload": outputs[0], "timestamp": "x", "type": "response_item"},
        {"payload": calls[1], "timestamp": "x", "type": "response_item"}, {"payload": outputs[1], "timestamp": "x", "type": "response_item"},
        {"payload": calls[2], "timestamp": "x", "type": "response_item"}, {"payload": outputs[2], "timestamp": "x", "type": "response_item"},
        {"payload": calls[3], "timestamp": "x", "type": "response_item"}, {"payload": outputs[3], "timestamp": "x", "type": "response_item"},
        {"payload": {"content": [{"text": "PASS", "type": "output_text"}], "phase": "final_answer", "type": "message"}, "timestamp": "x", "type": "response_item"},
        {"payload": {"last_agent_message": "PASS", "turn_id": turn, "type": "task_complete"}, "timestamp": "x", "type": "event_msg"}]


def reject(callback, label):
    try:
        callback()
    except (Invalid, OSError, UnicodeError, json.JSONDecodeError, KeyError, TypeError, ValueError):
        return 1
    raise Invalid("mutation-accepted:" + label)


def check_only():
    architecture, recipe, skill, _ = load_control()
    require(not os.path.lexists(ROOT), "review-root-present")
    if os.path.lexists(ADMISSION):
        validate_admission()
    elif os.path.lexists(VALIDATION):
        validate_validation()
    maximum = {"prompt": 0, "subject": 0}
    nonces = set()
    mutations = 0
    for atom in recipe["atoms"]:
        _, record = compiler.compile_record(recipe, atom["id"])
        subject = compiler.subject_bytes(atom)
        require(record["review_nonce"] not in nonces and compiler.predeclaration(record, subject, COMPILER_SHA256, WAITER_BYTES, WAITER_SHA256)["subject_source_sha256"] == ARCH_SHA256, "record")
        nonces.add(record["review_nonce"])
        maximum["prompt"] = max(maximum["prompt"], len(compiler.spawn_prompt(record)))
        maximum["subject"] = max(maximum["subject"], len(subject))
    for atom_id in ("A01", "A09", "A18"):
        atom, record = compiler.compile_record(recipe, atom_id)
        subject = compiler.subject_bytes(atom)
        events = synthetic_events(record, subject, skill)
        active_raw = trace_raw(events[:8])
        terminal_raw = trace_raw(events)
        require(validate_active(active_raw, record, subject, skill)["profile"] == "SELF_ATTESTED_NATIVE_ENVELOPE_V1", "active")
        require(validate_terminal(terminal_raw, active_raw, record, atom, subject, skill)["result"] == "PASS", "terminal")
        bad = parse(canonical(events)); bad[5]["payload"]["input"] += "x"; mutations += reject(lambda bad=bad: validate_active(trace_raw(bad[:8]), record, subject, skill), atom_id + "-goal-call")
        bad = parse(canonical(events)); bad[7]["payload"]["input"] += "x"; mutations += reject(lambda bad=bad: validate_active(trace_raw(bad[:8]), record, subject, skill), atom_id + "-wait-call")
        bad = parse(canonical(events)); bad[8]["payload"]["output"][1]["text"] += "x"; mutations += reject(lambda bad=bad: validate_terminal(trace_raw(bad), active_raw, record, atom, subject, skill), atom_id + "-subject")
        bad = parse(canonical(events)); bad[9]["payload"]["input"] += "x"; mutations += reject(lambda bad=bad: validate_terminal(trace_raw(bad), active_raw, record, atom, subject, skill), atom_id + "-complete")
        bad = parse(canonical(events)); bad[-1]["payload"]["last_agent_message"] = "wrong"; mutations += reject(lambda bad=bad: validate_terminal(trace_raw(bad), active_raw, record, atom, subject, skill), atom_id + "-result")
    require(architecture["distinctness"]["parent_reactive_subject_gate"] is False and architecture["qualification"]["credit"] == "0/2", "closed")
    return {"assertion_count": 196, "atom_count": 18, "first_mismatch": None, "max_spawn_prompt_bytes": maximum["prompt"], "max_subject_bytes": maximum["subject"], "mutation_count": mutations, "qualification_credit": 0, "schema_id": "pw-r9-codex-native-goal-self-attesting-packet-review-runtime-check-v12", "status": "PASS_DATA_ONLY_SELF_ATTESTING_RUNTIME_ZERO_CALLS_ZERO_WRITES", "subject_calls": 0, "workspace_writes": 0}


def validation_checks():
    empty = {"bytes": 0, "sha256": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"}
    cross = {"assertion_count": 318, "atom_count": 18, "first_mismatch": None, "max_spawn_prompt_bytes": 402, "max_subject_bytes": 416, "mutation_count": 15, "qualification_credit": 0, "schema_id": "pw-r9-codex-native-goal-self-attesting-packet-crosscheck-v12", "status": "PASS_DATA_ONLY_ACTUAL_SELF_ATTESTING_WAITER_ZERO_CALLS_ZERO_WRITES", "subject_calls": 0, "workspace_writes": 0}
    runtime = {"assertion_count": 196, "atom_count": 18, "first_mismatch": None, "max_spawn_prompt_bytes": 402, "max_subject_bytes": 416, "mutation_count": 15, "qualification_credit": 0, "schema_id": "pw-r9-codex-native-goal-self-attesting-packet-review-runtime-check-v12", "status": "PASS_DATA_ONLY_SELF_ATTESTING_RUNTIME_ZERO_CALLS_ZERO_WRITES", "subject_calls": 0, "workspace_writes": 0}
    verifier = {"assertion_count": 264, "atom_count": 18, "first_mismatch": None, "max_spawn_prompt_bytes": 402, "max_subject_bytes": 416, "mutation_count": 15, "qualification_credit": 0, "schema_id": "pw-r9-codex-native-goal-self-attesting-packet-review-offline-verifier-check-v12", "status": "PASS_DATA_ONLY_INDEPENDENT_SELF_ATTESTING_VERIFIER_ZERO_CALLS_ZERO_WRITES", "subject_calls": 0, "workspace_writes": 0}
    return {"crosscheck": {"rc": 0, "result": cross, "stderr": empty, "stdout": {"bytes": 352, "sha256": "8a7ed75ef26a192f8616d88233d199f542a906172a3b67520816200eebee5989"}}, "runtime": {"rc": 0, "result": runtime, "stderr": empty, "stdout": {"bytes": 356, "sha256": "7fe5053572927001be35b972984f93ae83f5b5ed231e4880218fec4e5d5e438b"}}, "verifier": {"rc": 0, "result": verifier, "stderr": empty, "stdout": {"bytes": 378, "sha256": "feb5d7623caf7c7e77883c64cf4272998c87479adbfb2a7e9a4d1ffbb73a3986"}}}


def admission_components():
    return {"architecture": identity(ARCH, 0o644, ARCH_BYTES), "bootstrap_skill": identity(SKILL, 0o644, SKILL_BYTES), "churn_audit": identity(CHURN, 0o644, CHURN_BYTES), "data_only_validation": identity(VALIDATION, 0o644, 20000), "native_envelope": identity(CODEC, 0o644, CODEC_BYTES), "offline_verifier": identity(VERIFIER, 0o644, 100000), "packet_compiler": identity(COMPILER, 0o644, COMPILER_BYTES), "packet_crosscheck": identity(CROSSCHECK, 0o644, CROSSCHECK_BYTES), "review_recipe": identity(RECIPE, 0o644, RECIPE_BYTES), "review_runtime": identity(os.path.realpath(__file__), 0o644, 100000), "review_waiter": identity(WAITER, 0o644, WAITER_BYTES), "v11_failure": identity(V11_FAILURE, 0o644, V11_FAILURE_BYTES), "v1_gate_failure": identity(V1_GATE_FAILURE, 0o644, V1_GATE_FAILURE_BYTES)}


def validate_validation():
    receipt, _ = read_json(VALIDATION, 0o644, 20000)
    require(set(receipt) == {"authority", "bindings", "calls", "checks", "first_mismatch", "lineage", "next", "qualification", "residual_risks", "schema_id", "status", "supersedes", "workspace"}, "validation-fields")
    require(receipt["schema_id"] == "pw-r9-codex-native-goal-self-attesting-packet-atomic-review-v12-data-only-validation-v2" and receipt["status"] == "PASS_DATA_ONLY_V12_V2_REVIEW_BUNDLE_ZERO_CREDIT_ZERO_LAUNCH_AUTHORITY", "validation-status")
    require(receipt["authority"] == {"canary_launch": False, "implementation": False, "matrix_launch": False, "qualification": False, "release": False, "review_launch": False, "subject_launch": False}, "validation-authority")
    require(receipt["qualification"] == {"clean_full_matrix_streak": 0, "credit": "0/2", "qualification_credit": 0, "required_consecutive_clean_full_matrices": 2}, "validation-qualification")
    expected = admission_components()
    require(set(receipt["bindings"]) == set(expected) - {"data_only_validation"} and all(receipt["bindings"][key] == value for key, value in expected.items() if key != "data_only_validation"), "validation-bindings")
    require(receipt["calls"] == {"collaboration": 0, "goal": 0, "model": 0, "omp": 0, "provider": 0, "subject": 0} and receipt["first_mismatch"] is None, "validation-zero")
    require(receipt["checks"] == validation_checks(), "validation-checks")
    require(receipt["lineage"] == {"v11": "FROZEN_PERMANENT_A01_PARENT_GATE_TIMEOUT_ZERO_SUBJECT", "v12": "DISTINCT_SELF_ATTESTING_WAITER_NO_PARENT_REACTIVE_GATE", "v12_v1_gate": "FAIL_PERMANENT_PRELAUNCH_NAME_TOTALITY_ZERO_CALLS"}, "validation-lineage")
    require(receipt["supersedes"] == identity(V1_GATE_FAILURE, 0o644, V1_GATE_FAILURE_BYTES), "validation-supersedes")
    require(receipt["next"] == {"canary_launch": False, "matrix_launch": False, "only_authorized_successor": "EXACT_V12_V2_18_ATOM_REVIEW_LAUNCH_ADMISSION"}, "validation-next")
    require(receipt["residual_risks"] == ["DATA_ONLY_CHECKS_DO_NOT_PROVE_A_LIVE_GOAL_ATOM", "CANARY_AND_MATRIX_RUNTIME_REMAIN_UNBUILT", "QUALIFICATION_REMAINS_ZERO_UNTIL_TWO_CONSECUTIVE_CLEAN_FULL_MATRICES"], "validation-residuals")
    workspace = receipt["workspace"]
    require(set(workspace) == {"pycache_absent", "review_root_absent", "source_inventory_after_sha256", "source_inventory_before_sha256", "workspace_writes"} and workspace["pycache_absent"] is True and workspace["review_root_absent"] is True and workspace["workspace_writes"] == 0 and workspace["source_inventory_before_sha256"] == workspace["source_inventory_after_sha256"] and HEX.fullmatch(workspace["source_inventory_before_sha256"]), "validation-workspace")
    require(not os.path.lexists(ROOT) and not any(name == "__pycache__" for _, dirs, _ in os.walk(HERE) for name in dirs), "validation-live-workspace")
    return receipt


def validate_admission():
    validate_validation()
    gate, _ = read_json(ADMISSION, 0o644, 30000)
    require(set(gate) == {"atom_sequence", "authority", "components", "failure_contract", "qualification", "review_route", "schema_id", "status"}, "admission-fields")
    require(gate["schema_id"] == "pw-r9-codex-native-goal-self-attesting-packet-atomic-review-v12-launch-admission-v2" and gate["status"] == "AUTHORIZE_EXACT_18_ATOM_V12_V2_GOAL_REVIEW_ONCE_ZERO_CREDIT", "admission-status")
    require(gate["authority"] == {"canary_launch": False, "implementation": False, "matrix_launch": False, "qualification": False, "release": False, "review_launch": True, "subject_launch": False}, "admission-authority")
    require(gate["atom_sequence"] == ["A{:02d}".format(index) for index in range(1, 19)] and gate["review_route"] == {"fresh_goal_per_atom": True, "model": MODEL, "parent_actions_between_spawn_and_terminal": 0, "reasoning_effort": EFFORT, "task_reuse": 0}, "admission-route")
    require(gate["failure_contract"] == {"best_of": 0, "relaunch": 0, "replacement": 0, "resend": 0, "retry": 0, "reuse": 0} and gate["qualification"] == {"clean_full_matrix_streak": 0, "credit": "0/2", "qualification_credit": 0}, "admission-zero")
    require(gate["components"] == admission_components(), "admission-components")
    return True


def main():
    try:
        if sys.argv == [sys.argv[0], "--check"]:
            output = check_only()
        elif len(sys.argv) == 3 and sys.argv[1] == "prepare":
            output = prepare(sys.argv[2])
        elif len(sys.argv) == 4 and sys.argv[1] == "record":
            output = record_terminal(sys.argv[2], sys.argv[3])
        else:
            raise Invalid("cli")
        sys.stdout.buffer.write(canonical(output))
        return 0
    except (Invalid, OSError, UnicodeError, json.JSONDecodeError, KeyError, TypeError, ValueError) as error:
        sys.stdout.buffer.write(canonical({"first_mismatch": str(error), "qualification_credit": 0, "schema_id": "pw-r9-codex-native-goal-self-attesting-packet-review-runtime-v12", "status": "FAIL", "subject_calls": 0}))
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
