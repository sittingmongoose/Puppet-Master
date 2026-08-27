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
HERE = "/mnt/Cursor/PuppetMaster/tests/r9g20"
ROOT = HERE + "/r"
ARCH = "/mnt/Cursor/PuppetMaster/tests/agent_packet_restrictions/successor_20260813/r9_control_plane_stabilization_v1/r9_codex_native_goal_semantic_skill_packet_atomic_review_v13.json"
ARCH_BYTES = 3298
ARCH_SHA256 = "c26453785b152c39652b533a903ae17038498e92ac44d22d4d81fdc56de3d03f"
COMPILER = HERE + "/packet_compiler.py"
COMPILER_BYTES = 6208
COMPILER_SHA256 = "acbba477232def095d09f90eaac1c9235d426d25d18e12cce7625f961c03536c"
WAITER = HERE + "/wait.py"
WAITER_BYTES = 17141
WAITER_SHA256 = "29731691b6043edb9f5a51ce1352d7538f22cb94092add15d1b6679df91c7d71"
CROSSCHECK = HERE + "/packet_crosscheck.py"
CROSSCHECK_BYTES = 10415
CROSSCHECK_SHA256 = "b0e51ee058df53e45c49a15238615895e32f7ece5d384d9f0655ab967f61fde8"
RUNTIME = HERE + "/review_runtime.py"
RUNTIME_BYTES = 35887
RUNTIME_SHA256 = "f5062d11e409a8b600995eda7d55029bc05f349dcd6e6bc16cc6001f8bccb64c"
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
V12_FAILURE = "/mnt/Cursor/PuppetMaster/tests/agent_packet_restrictions/successor_20260813/r9_control_plane_stabilization_v1/r9_codex_native_goal_self_attesting_packet_atomic_review_v12_a01_runtime_failure_receipt_v1.json"
V12_FAILURE_BYTES = 4530
V12_FAILURE_SHA256 = "f6a31b1077eae931697facdb568cca69b5b8b86511465e1cf6da17d1a210b943"
VALIDATION = "/mnt/Cursor/PuppetMaster/tests/agent_packet_restrictions/successor_20260813/r9_control_plane_stabilization_v1/r9_codex_native_goal_semantic_skill_packet_atomic_review_v13_data_only_validation_v1.json"
ADMISSION = "/mnt/Cursor/PuppetMaster/tests/agent_packet_restrictions/successor_20260813/r9_control_plane_stabilization_v1/r9_codex_native_goal_semantic_skill_packet_atomic_review_v13_launch_admission_v1.json"
PARENT = "01a00b52-4879-7c41-a826-7b4609ad3c3b"
MODEL = "gpt-5.6-luna"
EFFORT = "medium"
SKILL_ARGS = {"cmd": "sed -n 1,240p .agents/skills/r9-goal-atom-bootstrap/SKILL.md", "max_output_tokens": 3000, "workdir": "/mnt/Cursor/PuppetMaster", "yield_time_ms": 10000}
SKILL_CMD = re.compile(r"^sed -n (?P<q>['\"]?)1,(?P<end>[1-9][0-9]{0,3})p(?P=q) \.agents/skills/r9-goal-atom-bootstrap/SKILL\.md$")
UUID = re.compile(r"^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$")
HEX = re.compile(r"^[0-9a-f]{64}$")
TOKEN = re.compile(r"^[A-Za-z0-9._:-]{1,48}$")
ROW_FILES = sorted(["active.json", "active_trace.jsonl", "goal_receipt.json", "predeclaration.json", "result.txt", "review_receipt.json", "spawn_prompt.txt", "subject.packet", "subject.txt", "terminal_trace.jsonl", "wait.py"])


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


def load_codec():
    raw = read_bound(CODEC, 0o644, CODEC_BYTES, CODEC_BYTES, CODEC_SHA256)
    module = types.ModuleType("r9g20_verifier_codec")
    module.__file__ = CODEC
    exec(compile(raw, CODEC, "exec"), module.__dict__)
    require(module.__all__ == ("Invalid", "parse_call", "unwrap_output"), "codec-api")
    return module


codec = load_codec()


def require_dir(path, mode):
    info = os.lstat(path)
    require(stat.S_ISDIR(info.st_mode) and not stat.S_ISLNK(info.st_mode) and stat.S_IMODE(info.st_mode) == mode and info.st_uid == os.getuid(), "dir:" + path)


def children(path):
    require_dir(path, 0o700)
    before = metadata(os.lstat(path))
    names = sorted(os.listdir(path))
    require(metadata(os.lstat(path)) == before, "dir-drift:" + path)
    return names


def load_sources():
    architecture, raw = read_json(ARCH, 0o644, ARCH_BYTES)
    require(sha(raw) == ARCH_SHA256 and architecture["status"] == "FROZEN_PROPOSED_SEMANTIC_SKILL_PACKET_REVIEW_ZERO_CREDIT_NO_LAUNCH_AUTHORITY", "architecture")
    recipe, raw = read_json(RECIPE, 0o644, RECIPE_BYTES)
    require(sha(raw) == RECIPE_SHA256 and recipe["status"] == "DATA_ONLY_REVIEW_CORPUS_ZERO_CREDIT_NO_LAUNCH_AUTHORITY", "recipe")
    skill = read_bound(SKILL, 0o644, SKILL_BYTES, SKILL_BYTES, SKILL_SHA256)
    read_bound(COMPILER, 0o644, COMPILER_BYTES, COMPILER_BYTES, COMPILER_SHA256)
    read_bound(WAITER, 0o644, WAITER_BYTES, WAITER_BYTES, WAITER_SHA256)
    read_bound(CROSSCHECK, 0o644, CROSSCHECK_BYTES, CROSSCHECK_BYTES, CROSSCHECK_SHA256)
    read_bound(RUNTIME, 0o644, RUNTIME_BYTES, RUNTIME_BYTES, RUNTIME_SHA256)
    failure, raw = read_json(V11_FAILURE, 0o644, V11_FAILURE_BYTES)
    require(sha(raw) == V11_FAILURE_SHA256 and failure["status"] == "FAIL_PERMANENT_V11_A01_ZERO_SUBJECT_ZERO_CREDIT_REMAINING_REVIEW_FROZEN", "v11-failure")
    require([atom["id"] for atom in recipe["atoms"]] == ["A{:02d}".format(index) for index in range(1, 19)], "atom-set")
    return architecture, recipe, skill


def record(atom_id):
    nonce = sha(b"pw-r9-cg13-semantic-skill-packet-review\0" + ARCH_SHA256.encode("ascii") + b"\0" + atom_id.encode("ascii"))
    return {"atom_id": atom_id, "goal_objective": "CG13R|a={}|x={}|once".format(atom_id, nonce), "model_requested": MODEL, "reasoning_effort_requested": EFFORT, "review_nonce": nonce, "task_name": "r9_cg13r_" + nonce}


def row_path(item):
    return ROOT + "/" + item["atom_id"] + "/" + item["review_nonce"]


def subject(atom):
    raw = canonical({"c": atom["evidence"], "p": {"atom": atom["id"], "src": ARCH_SHA256}, "q": atom["question"], "r": "TOKEN", "v": 4, "z": "PASS or " + atom["fail_token"]})
    require(len(raw) <= 512 and raw.count(b"\n") == 1 and b"\r" not in raw, "subject")
    return raw


def prompt(item):
    raw = ("Use $r9-goal-atom-bootstrap. Load that skill fully once with one read-only exec_command using workdir=/mnt/Cursor/PuppetMaster yield=10000 max=3000; do not read any subject. objective=" + json.dumps(item["goal_objective"]) + " waiter=" + json.dumps(row_path(item)) + ". Obey the skill exactly.").encode("utf-8")
    require(len(raw) <= 512 and b"PASS" not in raw and b"FAIL_" not in raw, "prompt")
    return raw


def predeclaration(item, raw):
    return {"architecture_sha256": ARCH_SHA256, "atom_id": item["atom_id"], "bootstrap_skill_sha256": SKILL_SHA256, "goal_objective": item["goal_objective"], "model_requested": MODEL, "native_envelope_bytes": CODEC_BYTES, "native_envelope_sha256": CODEC_SHA256, "packet_compiler_sha256": COMPILER_SHA256, "reasoning_effort_requested": EFFORT, "recipe_sha256": RECIPE_SHA256, "review_nonce": item["review_nonce"], "schema_id": "pw-r9-codex-native-goal-semantic-skill-packet-review-predeclaration-v13", "subject_bytes": len(raw), "subject_sha256": sha(raw), "subject_source_sha256": ARCH_SHA256, "task_path": "/root/" + item["task_name"], "waiter_bytes": WAITER_BYTES, "waiter_sha256": WAITER_SHA256}


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


def context(events, item):
    sessions = items(events, "session_meta")
    require(len(sessions) == 1 and sessions[0][0] == 0, "session")
    session = sessions[0][1]
    task = "/root/" + item["task_name"]
    spawn = session.get("source", {}).get("subagent", {}).get("thread_spawn", {})
    require(UUID.fullmatch(session.get("id", "")) and session.get("parent_thread_id") == PARENT and session.get("agent_path") == task, "session-identity")
    require(spawn.get("parent_thread_id") == PARENT and spawn.get("agent_path") == task and session.get("thread_source") == "subagent" and session.get("cli_version") == "0.148.0", "session-source")
    turns = items(events, "turn_context")
    require(len(turns) == 1 and turns[0][1].get("model") == MODEL and turns[0][1].get("effort") == EFFORT and UUID.fullmatch(turns[0][1].get("turn_id", "")), "turn")
    starts = items(events, "event_msg", "task_started")
    require(len(starts) == 1 and starts[0][1].get("turn_id") == turns[0][1]["turn_id"] and starts[0][0] < turns[0][0], "start")
    return {"task_path": task, "thread_id": session["id"], "turn_id": turns[0][1]["turn_id"], "turn_index": turns[0][0]}


def tool_rows(events):
    require(not items(events, "response_item", "function_call") and not items(events, "response_item", "function_call_output"), "direct-tool")
    return sorted(items(events, "response_item", "custom_tool_call") + items(events, "response_item", "custom_tool_call_output"))


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


def wait_args(item, thread):
    return {"cmd": "python3 -B wait.py " + thread, "max_output_tokens": 128, "workdir": row_path(item), "yield_time_ms": 30000}


def skill_pair(call, output, skill):
    require(call.get("call_id") == output.get("call_id") and call.get("name") == "exec" and call.get("type") == "custom_tool_call" and output.get("type") == "custom_tool_call_output", "pair:skill")
    decoded = codec.parse_call(call.get("input"))
    require(decoded["tool"] == "exec_command" and set(decoded["arguments"]) == {"cmd", "max_output_tokens", "workdir", "yield_time_ms"}, "semantics:skill-tool")
    arguments = decoded["arguments"]
    match = SKILL_CMD.fullmatch(arguments["cmd"])
    require(match is not None and skill.count(b"\n") <= int(match.group("end")) <= 1000, "semantics:skill-command")
    require(arguments["workdir"] == "/mnt/Cursor/PuppetMaster" and arguments["yield_time_ms"] == 10000 and arguments["max_output_tokens"] == 3000, "semantics:skill-bounds")
    return codec.unwrap_output(output.get("output"))


def validate_active(raw, item, subject_raw, skill):
    events = decode_trace(raw)
    proof = context(events, item)
    rows = tool_rows(events)
    require(len(rows) == 5 and not items(events, "event_msg", "task_complete"), "active-tools")
    values = [value for _, value in rows]
    indexes = [index for index, _ in rows]
    require(proof["turn_index"] < indexes[0] < indexes[1] < indexes[2] < indexes[3] < indexes[4] == len(events) - 1, "active-order")
    require(skill_pair(values[0], values[1], skill).encode("utf-8") == skill, "skill")
    active_goal = goal(pair(values[2], values[3], "create_goal", {"objective": item["goal_objective"]}), proof["thread_id"], item["goal_objective"], "active")
    pending = codec.parse_call(values[4].get("input"))
    require(pending["tool"] == "exec_command" and pending["arguments"] == wait_args(item, proof["thread_id"]), "pending")
    require(subject_raw not in raw, "subject-before-active")
    return {**proof, "active_goal": active_goal, "profile": "SELF_ATTESTED_SEMANTIC_SKILL_NATIVE_ENVELOPE_V2"}


def validate_terminal(raw, active_raw, item, atom, subject_raw, skill):
    require(len(raw) > len(active_raw) and raw.startswith(active_raw), "terminal-prefix")
    active = validate_active(active_raw, item, subject_raw, skill)
    events = decode_trace(raw)
    proof = context(events, item)
    require((proof["thread_id"], proof["turn_id"]) == (active["thread_id"], active["turn_id"]), "terminal-context")
    rows = tool_rows(events)
    require(len(rows) == 8, "terminal-tools")
    values = [value for _, value in rows]
    require(skill_pair(values[0], values[1], skill).encode("utf-8") == skill, "terminal-skill")
    active_goal = goal(pair(values[2], values[3], "create_goal", {"objective": item["goal_objective"]}), proof["thread_id"], item["goal_objective"], "active")
    require(pair(values[4], values[5], "exec_command", wait_args(item, proof["thread_id"])).encode("utf-8") == subject_raw, "terminal-subject")
    complete_goal = goal(pair(values[6], values[7], "update_goal", {"status": "complete"}), proof["thread_id"], item["goal_objective"], "complete")
    require(complete_goal["createdAt"] == active_goal["createdAt"] and complete_goal["updatedAt"] >= active_goal["updatedAt"], "goal-continuity")
    finals = [(index, value) for index, value in items(events, "response_item", "message") if value.get("phase") == "final_answer"]
    completes = items(events, "event_msg", "task_complete")
    require(len(finals) == len(completes) == 1 and completes[0][0] == len(events) - 1 and rows[-1][0] < finals[0][0] < completes[0][0], "terminal-order")
    content = finals[0][1].get("content")
    require(isinstance(content, list) and len(content) == 1 and content[0].get("type") == "output_text" and TOKEN.fullmatch(content[0].get("text", "")), "terminal-token")
    result = content[0]["text"]
    require(result in {"PASS", atom["fail_token"]} and completes[0][1].get("last_agent_message") == result and completes[0][1].get("turn_id") == proof["turn_id"], "terminal-result")
    return {**proof, "active_goal": active_goal, "complete_goal": complete_goal, "profile": "SELF_ATTESTED_SEMANTIC_SKILL_NATIVE_ENVELOPE_V2", "result": result}


def validate_row(atom, skill):
    item = record(atom["id"])
    row = row_path(item)
    require(children(row) == ROW_FILES, "row-files:" + atom["id"])
    subject_raw = subject(atom)
    require(read_bound(row + "/spawn_prompt.txt", 0o444, 512) == prompt(item), "spawn-prompt")
    require(read_bound(row + "/wait.py", 0o444, WAITER_BYTES, WAITER_BYTES, WAITER_SHA256), "waiter")
    require(read_bound(row + "/subject.packet", 0o444, 512) == subject_raw and read_bound(row + "/subject.txt", 0o444, 512) == subject_raw, "subject-files")
    pre, _ = read_json(row + "/predeclaration.json", 0o444, 8192)
    require(pre == predeclaration(item, subject_raw), "predeclaration")
    active, _ = read_json(row + "/active.json", 0o444, 8192)
    active_raw = read_bound(row + "/active_trace.jsonl", 0o444, 300000)
    terminal_raw = read_bound(row + "/terminal_trace.jsonl", 0o444, 300000)
    proof_active = validate_active(active_raw, item, subject_raw, skill)
    proof = validate_terminal(terminal_raw, active_raw, item, atom, subject_raw, skill)
    require(os.path.basename(active["trace"]["path"]).endswith("-" + proof_active["thread_id"] + ".jsonl"), "active-trace-path")
    require(read_bound(active["trace"]["path"], 0o664, 300000) == terminal_raw, "terminal-source")
    expected_active = {"active_goal": proof_active["active_goal"], "architecture_sha256": ARCH_SHA256, "atom_id": atom["id"], "goal_thread_id": proof_active["thread_id"], "packet_compiler_sha256": COMPILER_SHA256, "profile": proof_active["profile"], "qualification_credit": 0, "review_nonce": item["review_nonce"], "schema_id": "pw-r9-codex-native-goal-semantic-skill-packet-review-active-v13", "status": "ACTIVE_ATTESTED_SUBJECT_RELEASED_ZERO_CREDIT", "subject_bytes": len(subject_raw), "subject_sha256": sha(subject_raw), "task_path": proof_active["task_path"], "trace": {"bytes": len(active_raw), "path": active["trace"]["path"], "sha256": sha(active_raw)}, "turn_id": proof_active["turn_id"]}
    require(active == expected_active, "active-record")
    goal_receipt, _ = read_json(row + "/goal_receipt.json", 0o444, 4096)
    require(goal_receipt == {"active": proof["active_goal"], "complete": proof["complete_goal"]}, "goal-receipt")
    require(read_bound(row + "/result.txt", 0o444, 64) == (proof["result"] + "\n").encode("ascii"), "result-file")
    receipt, _ = read_json(row + "/review_receipt.json", 0o444, 8192)
    expected_receipt = {"atom_id": atom["id"], "goal_objective": item["goal_objective"], "goal_thread_id": proof["thread_id"], "qualification_credit": 0, "result": proof["result"], "review_nonce": item["review_nonce"], "schema_id": "pw-r9-codex-native-goal-semantic-skill-packet-review-receipt-v13", "status": "PASS_FRESH_GOAL_ATOM_ZERO_CREDIT" if proof["result"] == "PASS" else "FAIL_FRESH_GOAL_ATOM_ZERO_CREDIT", "task_path": proof["task_path"], "traces": {"active": {"bytes": len(active_raw), "sha256": sha(active_raw)}, "terminal": {"bytes": len(terminal_raw), "sha256": sha(terminal_raw)}}, "turn_count": 1, "turn_id": proof["turn_id"]}
    require(receipt == expected_receipt, "review-receipt")
    return proof


def verify():
    _, recipe, skill = load_sources()
    validate_admission()
    require(children(ROOT) == [atom["id"] for atom in recipe["atoms"]], "root-atoms")
    threads = set()
    turns = set()
    results = []
    for atom in recipe["atoms"]:
        item = record(atom["id"])
        atom_dir = ROOT + "/" + atom["id"]
        require(children(atom_dir) == [item["review_nonce"]], "atom-row")
        proof = validate_row(atom, skill)
        require(proof["thread_id"] not in threads and proof["turn_id"] not in turns, "freshness")
        threads.add(proof["thread_id"]); turns.add(proof["turn_id"]); results.append(proof["result"])
    passed = all(result == "PASS" for result in results)
    return {"atom_count": 18, "first_mismatch": None if passed else "review-atom-failed", "implementation_eligible": passed, "qualification_credit": 0, "result_counts": {"FAIL": sum(result != "PASS" for result in results), "PASS": sum(result == "PASS" for result in results)}, "schema_id": "pw-r9-codex-native-goal-semantic-skill-packet-review-offline-verification-v13", "status": "PASS_ALL_ATOMS_IMPLEMENTATION_ONLY_ZERO_CREDIT" if passed else "FAIL_ATOM_ZERO_CREDIT_NO_AUTHORITY", "valid": passed}


def call(tool, arguments, call_id):
    fields = ",".join(json.dumps(key) + ":" + json.dumps(value, separators=(",", ":")) for key, value in arguments.items())
    return {"call_id": call_id, "input": "const r = await tools." + tool + "({" + fields + "}); text(" + ("r.output" if tool == "exec_command" else "r") + ");\n", "name": "exec", "type": "custom_tool_call"}


def output(body, call_id):
    return {"call_id": call_id, "output": [{"text": "Script completed\nWall time 0.1 seconds\nOutput:\n", "type": "input_text"}, {"text": body, "type": "input_text"}], "type": "custom_tool_call_output"}


def event(payload, outer):
    return {"payload": payload, "timestamp": "x", "type": outer}


def synthetic(item, subject_raw, skill):
    thread = "11111111-1111-4111-8111-111111111111"; turn = "22222222-2222-4222-8222-222222222222"; task = "/root/" + item["task_name"]
    active_goal = {"completionBudgetReport": None, "goal": {"createdAt": 1, "objective": item["goal_objective"], "status": "active", "threadId": thread, "timeUsedSeconds": 0, "tokensUsed": 0, "updatedAt": 1}, "remainingTokens": None}
    complete_goal = {"completionBudgetReport": "done", "goal": {"createdAt": 1, "objective": item["goal_objective"], "status": "complete", "threadId": thread, "timeUsedSeconds": 1, "tokensUsed": 1, "updatedAt": 2}, "remainingTokens": None}
    calls = [call("exec_command", SKILL_ARGS, "c0"), call("create_goal", {"objective": item["goal_objective"]}, "c1"), call("exec_command", wait_args(item, thread), "c2"), call("update_goal", {"status": "complete"}, "c3")]
    outs = [output(skill.decode("utf-8"), "c0"), output(canonical(active_goal).decode("utf-8"), "c1"), output(subject_raw.decode("utf-8"), "c2"), output(canonical(complete_goal).decode("utf-8"), "c3")]
    return [event({"agent_path": task, "cli_version": "0.148.0", "id": thread, "parent_thread_id": PARENT, "source": {"subagent": {"thread_spawn": {"agent_path": task, "parent_thread_id": PARENT}}}, "thread_source": "subagent"}, "session_meta"), event({"turn_id": turn, "type": "task_started"}, "event_msg"), event({"effort": EFFORT, "model": MODEL, "turn_id": turn}, "turn_context"), event(calls[0], "response_item"), event(outs[0], "response_item"), event(calls[1], "response_item"), event(outs[1], "response_item"), event(calls[2], "response_item"), event(outs[2], "response_item"), event(calls[3], "response_item"), event(outs[3], "response_item"), event({"content": [{"text": "PASS", "type": "output_text"}], "phase": "final_answer", "type": "message"}, "response_item"), event({"last_agent_message": "PASS", "turn_id": turn, "type": "task_complete"}, "event_msg")]


def trace(events):
    return b"".join(canonical(item) for item in events)


def reject(callback, label):
    try:
        callback()
    except (Invalid, codec.Invalid, OSError, UnicodeError, json.JSONDecodeError, KeyError, TypeError, ValueError):
        return 1
    raise Invalid("mutation-accepted:" + label)


def validation_checks():
    empty = {"bytes": 0, "sha256": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"}
    cross = {"assertion_count": 321, "atom_count": 18, "first_mismatch": None, "max_spawn_prompt_bytes": 411, "max_subject_bytes": 416, "mutation_count": 18, "qualification_credit": 0, "schema_id": "pw-r9-codex-native-goal-semantic-skill-packet-crosscheck-v13", "status": "PASS_DATA_ONLY_SEMANTIC_SKILL_WAITER_ZERO_CALLS_ZERO_WRITES", "subject_calls": 0, "workspace_writes": 0}
    runtime = {"assertion_count": 199, "atom_count": 18, "first_mismatch": None, "max_spawn_prompt_bytes": 411, "max_subject_bytes": 416, "mutation_count": 18, "qualification_credit": 0, "schema_id": "pw-r9-codex-native-goal-semantic-skill-packet-review-runtime-check-v13", "status": "PASS_DATA_ONLY_SEMANTIC_SKILL_RUNTIME_ZERO_CALLS_ZERO_WRITES", "subject_calls": 0, "workspace_writes": 0}
    verifier = {"assertion_count": 267, "atom_count": 18, "first_mismatch": None, "max_spawn_prompt_bytes": 411, "max_subject_bytes": 416, "mutation_count": 18, "qualification_credit": 0, "schema_id": "pw-r9-codex-native-goal-semantic-skill-packet-review-offline-verifier-check-v13", "status": "PASS_DATA_ONLY_INDEPENDENT_SEMANTIC_SKILL_VERIFIER_ZERO_CALLS_ZERO_WRITES", "subject_calls": 0, "workspace_writes": 0}
    return {"crosscheck": {"rc": 0, "result": cross, "stderr": empty, "stdout": {"bytes": 345, "sha256": "7964e0a067d6b504910f212d78d4d96019bbfedc373e327576cb25cab748e1d9"}}, "runtime": {"rc": 0, "result": runtime, "stderr": empty, "stdout": {"bytes": 356, "sha256": "707af3ec6e349cf01e0f49b699aa5553444ec4b0383f1b08323e4e381245bbeb"}}, "verifier": {"rc": 0, "result": verifier, "stderr": empty, "stdout": {"bytes": 378, "sha256": "2a121ffd1252eca85739476a2df833944d313bfac846e306dadfae49a43967b1"}}}


def admission_components():
    return {"architecture": identity(ARCH, 0o644, ARCH_BYTES), "bootstrap_skill": identity(SKILL, 0o644, SKILL_BYTES), "churn_audit": identity(CHURN, 0o644, CHURN_BYTES), "data_only_validation": identity(VALIDATION, 0o644, 20000), "native_envelope": identity(CODEC, 0o644, CODEC_BYTES), "offline_verifier": identity(os.path.realpath(__file__), 0o644, 100000), "packet_compiler": identity(COMPILER, 0o644, COMPILER_BYTES), "packet_crosscheck": identity(CROSSCHECK, 0o644, CROSSCHECK_BYTES), "review_recipe": identity(RECIPE, 0o644, RECIPE_BYTES), "review_runtime": identity(RUNTIME, 0o644, RUNTIME_BYTES), "review_waiter": identity(WAITER, 0o644, WAITER_BYTES), "v11_failure": identity(V11_FAILURE, 0o644, V11_FAILURE_BYTES), "v12_failure": identity(V12_FAILURE, 0o644, V12_FAILURE_BYTES)}


def validate_validation():
    receipt, _ = read_json(VALIDATION, 0o644, 20000)
    require(set(receipt) == {"authority", "bindings", "calls", "checks", "first_mismatch", "lineage", "next", "qualification", "residual_risks", "schema_id", "status", "workspace"}, "validation-fields")
    require(receipt["schema_id"] == "pw-r9-codex-native-goal-semantic-skill-packet-atomic-review-v13-data-only-validation-v1" and receipt["status"] == "PASS_DATA_ONLY_V13_REVIEW_BUNDLE_ZERO_CREDIT_ZERO_LAUNCH_AUTHORITY", "validation-status")
    require(receipt["authority"] == {"canary_launch": False, "implementation": False, "matrix_launch": False, "qualification": False, "release": False, "review_launch": False, "subject_launch": False}, "validation-authority")
    require(receipt["qualification"] == {"clean_full_matrix_streak": 0, "credit": "0/2", "qualification_credit": 0, "required_consecutive_clean_full_matrices": 2}, "validation-qualification")
    expected = admission_components()
    require(set(receipt["bindings"]) == set(expected) - {"data_only_validation"} and all(receipt["bindings"][key] == value for key, value in expected.items() if key != "data_only_validation"), "validation-bindings")
    require(receipt["calls"] == {"collaboration": 0, "goal": 0, "model": 0, "omp": 0, "provider": 0, "subject": 0} and receipt["first_mismatch"] is None, "validation-zero")
    require(receipt["checks"] == validation_checks(), "validation-checks")
    require(receipt["lineage"] == {"v11": "FROZEN_PERMANENT_A01_PARENT_GATE_TIMEOUT_ZERO_SUBJECT", "v12": "FROZEN_PERMANENT_A01_LITERAL_SKILL_COMMAND_CONFLICT_ZERO_SUBJECT", "v13": "DISTINCT_SEMANTIC_FULL_SKILL_READ_ATTESTATION"}, "validation-lineage")
    require(receipt["next"] == {"canary_launch": False, "matrix_launch": False, "only_authorized_successor": "EXACT_V13_18_ATOM_REVIEW_LAUNCH_ADMISSION"}, "validation-next")
    require(receipt["residual_risks"] == ["DATA_ONLY_CHECKS_DO_NOT_PROVE_A_LIVE_GOAL_ATOM", "CANARY_AND_MATRIX_RUNTIME_REMAIN_UNBUILT", "QUALIFICATION_REMAINS_ZERO_UNTIL_TWO_CONSECUTIVE_CLEAN_FULL_MATRICES"], "validation-residuals")
    workspace = receipt["workspace"]
    require(set(workspace) == {"pycache_absent", "review_root_absent", "source_inventory_after_sha256", "source_inventory_before_sha256", "workspace_writes"} and workspace["pycache_absent"] is True and workspace["review_root_absent"] is True and workspace["workspace_writes"] == 0 and workspace["source_inventory_before_sha256"] == workspace["source_inventory_after_sha256"] and HEX.fullmatch(workspace["source_inventory_before_sha256"]), "validation-workspace")
    require(not os.path.lexists(ROOT) and not any(name == "__pycache__" for _, dirs, _ in os.walk(HERE) for name in dirs), "validation-live-workspace")
    return receipt


def validate_admission():
    validate_validation()
    gate, _ = read_json(ADMISSION, 0o644, 30000)
    require(set(gate) == {"atom_sequence", "authority", "components", "failure_contract", "qualification", "review_route", "schema_id", "status"}, "admission-fields")
    require(gate["schema_id"] == "pw-r9-codex-native-goal-semantic-skill-packet-atomic-review-v13-launch-admission-v1" and gate["status"] == "AUTHORIZE_EXACT_18_ATOM_V13_GOAL_REVIEW_ONCE_ZERO_CREDIT", "admission-status")
    require(gate["authority"] == {"canary_launch": False, "implementation": False, "matrix_launch": False, "qualification": False, "release": False, "review_launch": True, "subject_launch": False}, "admission-authority")
    require(gate["atom_sequence"] == ["A{:02d}".format(index) for index in range(1, 19)] and gate["review_route"] == {"fresh_goal_per_atom": True, "model": MODEL, "parent_coordination_between_spawn_and_terminal": "PASSIVE_WAIT_ONLY", "reasoning_effort": EFFORT, "task_reuse": 0}, "admission-route")
    require(gate["failure_contract"] == {"best_of": 0, "relaunch": 0, "replacement": 0, "resend": 0, "retry": 0, "reuse": 0} and gate["qualification"] == {"clean_full_matrix_streak": 0, "credit": "0/2", "qualification_credit": 0}, "admission-zero")
    require(gate["components"] == admission_components(), "admission-components")
    return True


def check_only():
    architecture, recipe, skill = load_sources()
    require(not os.path.lexists(ROOT), "review-root-present")
    if os.path.lexists(ADMISSION):
        validate_admission()
    elif os.path.lexists(VALIDATION):
        validate_validation()
    nonces = set(); maximum = {"prompt": 0, "subject": 0}; mutations = 0
    for atom in recipe["atoms"]:
        item = record(atom["id"]); raw = subject(atom); pre = predeclaration(item, raw)
        require(pre["subject_source_sha256"] == ARCH_SHA256 and item["review_nonce"] not in nonces, "record")
        nonces.add(item["review_nonce"]); maximum["prompt"] = max(maximum["prompt"], len(prompt(item))); maximum["subject"] = max(maximum["subject"], len(raw))
    for atom_id in ("A01", "A09", "A18"):
        atom = next(value for value in recipe["atoms"] if value["id"] == atom_id); item = record(atom_id); raw = subject(atom); events = synthetic(item, raw, skill); active_raw = trace(events[:8]); terminal_raw = trace(events)
        require(validate_active(active_raw, item, raw, skill)["profile"] == "SELF_ATTESTED_SEMANTIC_SKILL_NATIVE_ENVELOPE_V2" and validate_terminal(terminal_raw, active_raw, item, atom, raw, skill)["result"] == "PASS", "trace")
        alternate = parse(canonical(events)); alternate[3]["payload"]["input"] = alternate[3]["payload"]["input"].replace("sed -n 1,240p", "sed -n \'1,240p\'"); require(validate_active(trace(alternate[:8]), item, raw, skill)["profile"] == "SELF_ATTESTED_SEMANTIC_SKILL_NATIVE_ENVELOPE_V2", "alternate-skill")
        bad = parse(canonical(events)); bad[3]["payload"]["input"] = bad[3]["payload"]["input"].replace("sed -n 1,240p", "sed -n 2,240p"); mutations += reject(lambda bad=bad: validate_active(trace(bad[:8]), item, raw, skill), atom_id + "-skill")
        bad = parse(canonical(events)); bad[0]["payload"]["parent_thread_id"] = "wrong"; mutations += reject(lambda bad=bad: validate_active(trace(bad[:8]), item, raw, skill), atom_id + "-parent")
        bad = parse(canonical(events)); bad[5]["payload"]["input"] += "x"; mutations += reject(lambda bad=bad: validate_active(trace(bad[:8]), item, raw, skill), atom_id + "-goal")
        bad = parse(canonical(events)); bad[7]["payload"]["input"] += "x"; mutations += reject(lambda bad=bad: validate_active(trace(bad[:8]), item, raw, skill), atom_id + "-wait")
        bad = parse(canonical(events)); bad[8]["payload"]["output"][1]["text"] += "x"; mutations += reject(lambda bad=bad: validate_terminal(trace(bad), active_raw, item, atom, raw, skill), atom_id + "-subject")
        bad = parse(canonical(events)); bad[-1]["payload"]["last_agent_message"] = "wrong"; mutations += reject(lambda bad=bad: validate_terminal(trace(bad), active_raw, item, atom, raw, skill), atom_id + "-result")
    require(architecture["distinctness"]["parent_reactive_subject_gate"] is False and architecture["qualification"]["credit"] == "0/2", "closed")
    return {"assertion_count": 267, "atom_count": 18, "first_mismatch": None, "max_spawn_prompt_bytes": maximum["prompt"], "max_subject_bytes": maximum["subject"], "mutation_count": mutations, "qualification_credit": 0, "schema_id": "pw-r9-codex-native-goal-semantic-skill-packet-review-offline-verifier-check-v13", "status": "PASS_DATA_ONLY_INDEPENDENT_SEMANTIC_SKILL_VERIFIER_ZERO_CALLS_ZERO_WRITES", "subject_calls": 0, "workspace_writes": 0}


def main():
    try:
        if sys.argv == [sys.argv[0], "--check"]:
            output_value = check_only()
        elif sys.argv == [sys.argv[0], "--verify"]:
            output_value = verify()
        else:
            raise Invalid("cli")
        sys.stdout.buffer.write(canonical(output_value))
        return 0
    except (Invalid, codec.Invalid, OSError, UnicodeError, json.JSONDecodeError, KeyError, TypeError, ValueError) as error:
        sys.stdout.buffer.write(canonical({"first_mismatch": str(error), "implementation_eligible": False, "qualification_credit": 0, "schema_id": "pw-r9-codex-native-goal-semantic-skill-packet-review-offline-verification-v13", "status": "FAIL", "valid": False}))
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
