#!/usr/bin/env python3
import hashlib
import importlib.util
import json
import math
import os
import re
import stat
import sys

sys.dont_write_bytecode = True
HERE = "/mnt/Cursor/PuppetMaster/tests/r9g17"
ROOT = HERE + "/r"
RECIPE = "/mnt/Cursor/PuppetMaster/tests/r9g16/review_recipe.json"
RECIPE_BYTES = 7936
RECIPE_SHA256 = "100386642d6680db468c1e9a0ddf7c2c774728f4444e540ca2d655fe8669f690"
ARCH = "/mnt/Cursor/PuppetMaster/tests/agent_packet_restrictions/successor_20260813/r9_control_plane_stabilization_v1/r9_codex_native_goal_observed_envelope_atomic_review_v10.json"
ARCH_BYTES = 3783
ARCH_SHA256 = "c7851a467a2328707e8ebfd2b31db5865543d82193ec5ded195903a5929aab71"
SKILL = "/mnt/Cursor/PuppetMaster/.agents/skills/r9-goal-atom-bootstrap/SKILL.md"
SKILL_BYTES = 1327
SKILL_SHA256 = "7fba245c05b7fb104054ea18af4d0a2fd90d4f28f295c94f7c12b699b343d8b4"
WAITER = HERE + "/wait.py"
WAITER_BYTES = 7317
WAITER_SHA256 = "58dad14f0ef52f37d3599e84ffd522b4150930537c380d658d15657e1830ab53"
RUNTIME = HERE + "/review_runtime_v10.py"
RUNTIME_BYTES = 16571
RUNTIME_SHA256 = "66857262aede083617bb24dd7a4af42eee85f7e147b8d0a0dbdd42053a46854b"
CODEC = HERE + "/native_envelope.py"
CODEC_BYTES = 4661
CODEC_SHA256 = "d2aef9d619f6c4ec779e6d2dce2d1b6fc89282fd91cc4b9f56bc82490df0f246"
CODEC_CHECK = HERE + "/native_envelope_check.py"
CODEC_CHECK_BYTES = 9771
CODEC_CHECK_SHA256 = "9a1ba80c2c97344cbd5655f9313d3a404f3e2d8e45301e2b10fbdf06b6151487"
CORPUS_CHECK = "/mnt/Cursor/PuppetMaster/tests/r9g16/review_corpus_check.py"
CORPUS_CHECK_BYTES = 12544
CORPUS_CHECK_SHA256 = "7bc8ec049d04d5ec6ac58797e72523df790ebe2d04905d0b50e33f0f6ea5bfcb"
V9_FAILURE = "/mnt/Cursor/PuppetMaster/tests/agent_packet_restrictions/successor_20260813/r9_control_plane_stabilization_v1/r9_codex_native_goal_atomic_architecture_review_v9_a01_runtime_failure_receipt_v1.json"
V9_FAILURE_BYTES = 3712
V9_FAILURE_SHA256 = "66b274e690eaada233dfc7465fc0c406397ce01cf7ff55211ab625465bcefc58"
VALIDATION = "/mnt/Cursor/PuppetMaster/tests/agent_packet_restrictions/successor_20260813/r9_control_plane_stabilization_v1/r9_codex_native_goal_observed_envelope_atomic_review_v10_data_only_validation_v2.json"
ADMISSION = "/mnt/Cursor/PuppetMaster/tests/agent_packet_restrictions/successor_20260813/r9_control_plane_stabilization_v1/r9_codex_native_goal_observed_envelope_atomic_review_v10_launch_admission_v1.json"
PARENT = "01a00b52-4879-7c41-a826-7b4609ad3c3b"
MODEL = "gpt-5.6-luna"
EFFORT = "medium"
UUID = re.compile(r"^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$")
HEX = re.compile(r"^[0-9a-f]{64}$")
TOKEN = re.compile(r"^[A-Z0-9_]{1,48}$")
ROW_FILES = sorted(["active.json", "active_trace.jsonl", "goal_receipt.json", "predeclaration.json", "ready.json", "result.txt", "spawn_prompt.txt", "subject.txt", "terminal_trace.jsonl", "wait.py"])
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
    require(stat.S_ISREG(before.st_mode) and stat.S_IMODE(before.st_mode) == mode and before.st_uid == os.getuid() and before.st_nlink == 1 and before.st_size <= cap, "read-custody:" + path)
    if expected_bytes is not None:
        require(before.st_size == expected_bytes, "read-bytes:" + path)
    fd = os.open(path, os.O_RDONLY | os.O_NOFOLLOW | os.O_CLOEXEC)
    try:
        require(metadata(os.fstat(fd)) == metadata(before), "read-race:" + path)
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
    require(raw == canonical(value), "canonical:" + path)
    return value, raw


def identity(path, mode, cap):
    raw = read_bound(path, mode, cap)
    return {"bytes": len(raw), "mode": "{:04o}".format(mode), "path": path, "sha256": sha(raw)}


def require_dir(path):
    info = os.lstat(path)
    require(stat.S_ISDIR(info.st_mode) and not stat.S_ISLNK(info.st_mode) and stat.S_IMODE(info.st_mode) == 0o700 and info.st_uid == os.getuid(), "dir:" + path)


def load_codec():
    raw = read_bound(CODEC, 0o644, CODEC_BYTES, CODEC_BYTES, CODEC_SHA256)
    spec = importlib.util.spec_from_file_location("r9g17_verifier_codec", CODEC)
    module = importlib.util.module_from_spec(spec)
    exec(compile(raw, CODEC, "exec"), module.__dict__)
    return module


def load_sources():
    recipe_raw = read_bound(RECIPE, 0o644, RECIPE_BYTES, RECIPE_BYTES, RECIPE_SHA256)
    recipe = parse(recipe_raw)
    require(recipe_raw == canonical(recipe) and recipe["status"] == "DATA_ONLY_REVIEW_CORPUS_ZERO_CREDIT_NO_LAUNCH_AUTHORITY", "recipe")
    arch_raw = read_bound(ARCH, 0o644, ARCH_BYTES, ARCH_BYTES, ARCH_SHA256)
    arch = parse(arch_raw)
    require(arch_raw == canonical(arch) and arch["status"] == "FROZEN_PROPOSED_OBSERVED_NATIVE_ENVELOPE_REVIEW_ZERO_CREDIT_NO_LAUNCH_AUTHORITY", "architecture")
    skill = read_bound(SKILL, 0o644, SKILL_BYTES, SKILL_BYTES, SKILL_SHA256)
    waiter = read_bound(WAITER, 0o644, WAITER_BYTES, WAITER_BYTES, WAITER_SHA256)
    read_bound(RUNTIME, 0o644, RUNTIME_BYTES, RUNTIME_BYTES, RUNTIME_SHA256)
    read_bound(CODEC_CHECK, 0o644, CODEC_CHECK_BYTES, CODEC_CHECK_BYTES, CODEC_CHECK_SHA256)
    read_bound(CORPUS_CHECK, 0o644, CORPUS_CHECK_BYTES, CORPUS_CHECK_BYTES, CORPUS_CHECK_SHA256)
    failure_raw = read_bound(V9_FAILURE, 0o644, V9_FAILURE_BYTES, V9_FAILURE_BYTES, V9_FAILURE_SHA256)
    failure = parse(failure_raw)
    require(failure_raw == canonical(failure) and failure["status"] == "FAIL_PERMANENT_V9_A01_ZERO_SUBJECT_ZERO_CREDIT_REMAINING_REVIEW_FROZEN", "failure")
    return recipe, arch, skill, waiter, load_codec()


def admission_components():
    return {
        "architecture": identity(ARCH, 0o644, ARCH_BYTES),
        "bootstrap_skill": identity(SKILL, 0o644, SKILL_BYTES),
        "data_only_validation": identity(VALIDATION, 0o644, 20000),
        "native_envelope": identity(CODEC, 0o644, CODEC_BYTES),
        "native_envelope_check": identity(CODEC_CHECK, 0o644, CODEC_CHECK_BYTES),
        "offline_verifier": identity(os.path.realpath(__file__), 0o644, 100000),
        "review_checker": identity(CORPUS_CHECK, 0o644, CORPUS_CHECK_BYTES),
        "review_recipe": identity(RECIPE, 0o644, RECIPE_BYTES),
        "review_runtime": identity(RUNTIME, 0o644, RUNTIME_BYTES),
        "review_waiter": identity(WAITER, 0o644, WAITER_BYTES),
        "v9_failure": identity(V9_FAILURE, 0o644, V9_FAILURE_BYTES),
    }


def validate_validation():
    receipt, _ = read_json(VALIDATION, 0o644, 20000)
    require(set(receipt) == {"authority", "bindings", "calls", "checked_at_utc", "checks", "first_mismatch", "lineage", "next", "qualification", "residual_risks", "schema_id", "status", "supersedes", "workspace"}, "validation-fields")
    require(receipt.get("schema_id") == "pw-r9-codex-native-goal-observed-envelope-atomic-review-v10-data-only-validation-v2" and receipt.get("status") == "PASS_DATA_ONLY_V10_REVIEW_BUNDLE_ZERO_CREDIT_ZERO_LAUNCH_AUTHORITY", "validation-status")
    require(receipt.get("authority") == {"canary_launch": False, "implementation": False, "matrix_launch": False, "qualification": False, "release": False, "review_launch": False, "subject_launch": False}, "validation-authority")
    require(receipt.get("qualification") == {"clean_full_matrix_streak": 0, "credit": "0/2", "qualification_credit": 0, "required_consecutive_clean_full_matrices": 2}, "validation-qualification")
    expected = admission_components()
    require(set(receipt.get("bindings", {})) == (set(expected) - {"data_only_validation"}) | {"v1_validation"}, "validation-binding-fields")
    require(all(receipt.get("bindings", {}).get(key) == value for key, value in expected.items() if key != "data_only_validation"), "validation-bindings")
    require(receipt.get("calls") == {"collaboration": 0, "goal": 0, "model": 0, "omp": 0, "provider": 0, "subject": 0} and receipt.get("first_mismatch") is None, "validation-zero-calls")
    require(set(receipt.get("checks", {})) == {"codec", "corpus", "runtime", "verifier"} and all(item.get("rc") == 0 and item.get("subject_calls") == 0 and item.get("workspace_writes") == 0 and item.get("mutation_count", 0) > 0 for item in receipt["checks"].values()), "validation-checks")
    require(receipt.get("workspace", {}).get("review_root_absent") is True and receipt["workspace"].get("pycache_count") == 0 and receipt["workspace"].get("inventory_before_sha256") == receipt["workspace"].get("inventory_after_sha256"), "validation-workspace")
    return receipt


def validate_admission():
    validate_validation()
    gate, _ = read_json(ADMISSION, 0o644, 30000)
    require(set(gate) == {"atom_sequence", "authority", "components", "failure_contract", "qualification", "review_route", "schema_id", "status"}, "admission-fields")
    require(gate["schema_id"] == "pw-r9-codex-native-goal-observed-envelope-atomic-review-v10-launch-admission-v1" and gate["status"] == "AUTHORIZE_EXACT_18_ATOM_V10_GOAL_REVIEW_ONCE_ZERO_CREDIT", "admission-status")
    require(gate["authority"] == {"canary_launch": False, "implementation": False, "matrix_launch": False, "qualification": False, "release": False, "review_launch": True, "subject_launch": False}, "admission-authority")
    require(gate["atom_sequence"] == ["A{:02d}".format(index) for index in range(1, 19)], "admission-atoms")
    require(gate["review_route"] == {"fresh_goal_per_atom": True, "model": MODEL, "reasoning_effort": EFFORT, "task_reuse": 0}, "admission-route")
    require(gate["failure_contract"] == {"best_of": 0, "relaunch": 0, "replacement": 0, "resend": 0, "retry": 0, "reuse": 0}, "admission-failure")
    require(gate["qualification"] == {"clean_full_matrix_streak": 0, "credit": "0/2", "qualification_credit": 0}, "admission-qualification")
    require(gate["components"] == admission_components(), "admission-components")
    return gate


def record(recipe, atom_id):
    atom = next((item for item in recipe["atoms"] if item["id"] == atom_id), None)
    require(atom is not None, "atom")
    nonce = sha(b"pw-r9-cg10-observed-envelope-review\0" + ARCH_SHA256.encode("ascii") + b"\0" + atom_id.encode("ascii"))
    return atom, {"atom_id": atom_id, "goal_objective": "CG10R|a={}|x={}|once".format(atom_id, nonce), "model_requested": MODEL, "reasoning_effort_requested": EFFORT, "review_nonce": nonce, "task_name": "r9_cg10r_" + nonce}


def row(record):
    return ROOT + "/" + record["atom_id"] + "/" + record["review_nonce"]


def subject(recipe, atom):
    raw = canonical({"c": atom["evidence"], "p": {"atom": atom["id"], "src": "8e06c4d3839681431b7d762068a6ce521d5dbf9c15e1894b7f6325c0e6497251"}, "q": atom["question"], "r": "TOKEN", "v": 2, "z": "PASS or " + atom["fail_token"]})
    require(len(raw) <= 512, "subject-size")
    return raw


def prompt(record):
    text = "Use $r9-goal-atom-bootstrap; load once via exec_command cmd=\"sed -n 1,80p .agents/skills/r9-goal-atom-bootstrap/SKILL.md\" workdir=/mnt/Cursor/PuppetMaster yield=10000 max=3000. objective=" + json.dumps(record["goal_objective"]) + " waiter=" + json.dumps(row(record)) + ". Obey skill."
    raw = text.encode("utf-8")
    require(len(raw) <= 512 and b"PASS" not in raw and b"FAIL_" not in raw, "prompt")
    return raw


def predeclaration(record, raw):
    return {"architecture_sha256": ARCH_SHA256, "atom_id": record["atom_id"], "bootstrap_skill_sha256": SKILL_SHA256, "goal_objective": record["goal_objective"], "model_requested": MODEL, "reasoning_effort_requested": EFFORT, "recipe_sha256": RECIPE_SHA256, "review_nonce": record["review_nonce"], "schema_id": "pw-r9-codex-native-goal-observed-envelope-review-predeclaration-v10", "subject_bytes": len(raw), "subject_sha256": sha(raw), "task_path": "/root/" + record["task_name"], "waiter_bytes": WAITER_BYTES, "waiter_sha256": WAITER_SHA256}


def decode_trace(raw):
    require(raw.endswith(b"\n") and b"\r" not in raw, "trace-framing")
    events = []
    for index, line in enumerate(raw.splitlines(keepends=True)):
        require(line.endswith(b"\n") and line != b"\n", "trace-line:" + str(index))
        event = parse(line[:-1])
        require(set(event) in ({"payload", "type"}, {"payload", "timestamp", "type"}) and isinstance(event["payload"], dict), "trace-envelope")
        events.append({"type": event["type"], "payload": event["payload"]})
    return events


def items(events, outer, inner=None):
    return [(index, event["payload"]) for index, event in enumerate(events) if event["type"] == outer and (inner is None or event["payload"].get("type") == inner)]


def strings(value):
    if isinstance(value, str):
        yield value
    elif isinstance(value, dict):
        for key, item in value.items():
            yield from strings(key)
            yield from strings(item)
    elif isinstance(value, list):
        for item in value:
            yield from strings(item)


def context(events, record):
    sessions = items(events, "session_meta")
    require(len(sessions) == 1 and sessions[0][0] == 0, "session")
    session = sessions[0][1]
    thread = session.get("id")
    task = "/root/" + record["task_name"]
    spawn = session.get("source", {}).get("subagent", {}).get("thread_spawn", {})
    require(UUID.fullmatch(thread or "") and session.get("parent_thread_id") == PARENT and spawn.get("parent_thread_id") == PARENT, "session-parent")
    require(session.get("agent_path") == task and spawn.get("agent_path") == task, "session-task")
    turns = items(events, "turn_context")
    require(len(turns) == 1 and turns[0][1].get("model") == MODEL and turns[0][1].get("effort") == EFFORT and UUID.fullmatch(turns[0][1].get("turn_id", "")), "turn")
    turn = turns[0][1]["turn_id"]
    starts = items(events, "event_msg", "task_started")
    require(len(starts) == 1 and starts[0][1].get("turn_id") == turn and starts[0][0] < turns[0][0], "start")
    return {"task_path": task, "thread_id": thread, "turn_id": turn}


def tools(events):
    direct = items(events, "response_item", "function_call") + items(events, "response_item", "function_call_output")
    wrapped = sorted(items(events, "response_item", "custom_tool_call") + items(events, "response_item", "custom_tool_call_output"))
    require(not direct and bool(wrapped), "profile")
    return wrapped


def pair(codec, call, output, tool, arguments):
    require(call.get("call_id") == output.get("call_id") and call.get("name") == "exec" and call.get("type") == "custom_tool_call" and output.get("type") == "custom_tool_call_output", "pair:" + tool)
    decoded = codec.parse_call(call.get("input"))
    require(decoded["tool"] == tool and decoded["arguments"] == arguments, "semantics:" + tool)
    return codec.unwrap_output(output.get("output"))


def goal(text, thread, objective, status):
    value = parse(text.encode("utf-8"))
    require(set(value) == {"completionBudgetReport", "goal", "remainingTokens"}, "goal-envelope")
    item = value["goal"]
    require(set(item) == {"createdAt", "objective", "status", "threadId", "timeUsedSeconds", "tokensUsed", "updatedAt"}, "goal-fields")
    require((item["threadId"], item["objective"], item["status"]) == (thread, objective, status), "goal-bind")
    require(all(isinstance(item[key], int) and not isinstance(item[key], bool) and item[key] >= 0 for key in ("createdAt", "updatedAt", "timeUsedSeconds", "tokensUsed")), "goal-counters")
    require(item["createdAt"] > 0 and item["updatedAt"] >= item["createdAt"] and value["remainingTokens"] is None, "goal-clock-budget")
    if status == "active":
        require(item["tokensUsed"] == 0 and item["timeUsedSeconds"] == 0 and value["completionBudgetReport"] is None, "goal-active")
    else:
        require(item["tokensUsed"] > 0 and isinstance(value["completionBudgetReport"], str) and value["completionBudgetReport"], "goal-complete")
    return item


def wait_args(record, thread):
    return {"cmd": "python3 -B wait.py " + thread, "max_output_tokens": 128, "workdir": row(record), "yield_time_ms": 30000}


def verify_traces(codec, skill, record, atom, subject_raw, live_raw, terminal_raw):
    require(len(terminal_raw) > len(live_raw) and terminal_raw.startswith(live_raw), "trace-prefix")
    live_events = decode_trace(live_raw)
    live_context = context(live_events, record)
    live_tools = tools(live_events)
    require(len(live_tools) == 5 and not items(live_events, "event_msg", "task_complete"), "live-tools")
    live_indexes = [index for index, _ in live_tools]
    require(live_indexes == sorted(live_indexes) and len(set(live_indexes)) == 5, "live-tool-index")
    turn_index = items(live_events, "turn_context")[0][0]
    require(turn_index < live_indexes[0] < live_indexes[1] < live_indexes[2] < live_indexes[3] < live_indexes[4] == len(live_events) - 1, "live-order")
    values = [item for _, item in live_tools]
    live_call_ids = [values[index].get("call_id") for index in (0, 2, 4)]
    require(all(isinstance(value, str) and value for value in live_call_ids) and len(set(live_call_ids)) == 3, "live-call-ids")
    require(pair(codec, values[0], values[1], "exec_command", SKILL_ARGS).encode("utf-8") == skill, "live-skill")
    active = pair(codec, values[2], values[3], "create_goal", {"objective": record["goal_objective"]})
    active_goal = goal(active, live_context["thread_id"], record["goal_objective"], "active")
    pending = codec.parse_call(values[4].get("input"))
    require(pending["tool"] == "exec_command" and pending["arguments"] == wait_args(record, live_context["thread_id"]), "pending")
    text = subject_raw.decode("utf-8")
    require(all(text not in item for event in live_events for item in strings(event)), "subject-before-active")
    terminal_events = decode_trace(terminal_raw)
    terminal_context = context(terminal_events, record)
    require(terminal_context == live_context, "terminal-context")
    terminal_tools = tools(terminal_events)
    require(len(terminal_tools) == 8, "terminal-tools")
    terminal_indexes = [index for index, _ in terminal_tools]
    require(terminal_indexes == sorted(terminal_indexes) and len(set(terminal_indexes)) == 8, "terminal-tool-index")
    values = [item for _, item in terminal_tools]
    call_ids = [values[index].get("call_id") for index in (0, 2, 4, 6)]
    require(all(isinstance(value, str) and value for value in call_ids) and len(set(call_ids)) == 4, "terminal-call-ids")
    require(pair(codec, values[0], values[1], "exec_command", SKILL_ARGS).encode("utf-8") == skill, "terminal-skill")
    goal(pair(codec, values[2], values[3], "create_goal", {"objective": record["goal_objective"]}), live_context["thread_id"], record["goal_objective"], "active")
    require(pair(codec, values[4], values[5], "exec_command", wait_args(record, live_context["thread_id"])).encode("utf-8") == subject_raw, "terminal-subject")
    terminal_goal = goal(pair(codec, values[6], values[7], "update_goal", {"status": "complete"}), live_context["thread_id"], record["goal_objective"], "complete")
    require(terminal_goal["createdAt"] == active_goal["createdAt"] and terminal_goal["updatedAt"] >= active_goal["updatedAt"], "goal-continuity")
    finals = [(index, payload) for index, payload in items(terminal_events, "response_item", "message") if payload.get("phase") == "final_answer"]
    completes = items(terminal_events, "event_msg", "task_complete")
    require(len(finals) == len(completes) == 1 and completes[0][0] == len(terminal_events) - 1, "terminal-final-count")
    assistant_messages = [(index, payload) for index, payload in items(terminal_events, "response_item", "message") if payload.get("role") == "assistant"]
    require(all(payload.get("phase") in {"commentary", "final_answer"} for _, payload in assistant_messages), "assistant-phase")
    require(all(index < terminal_indexes[0] for index, payload in assistant_messages if payload.get("phase") == "commentary"), "post-skill-commentary")
    require(terminal_indexes[-1] < finals[0][0] < completes[0][0], "terminal-order")
    content = finals[0][1].get("content")
    require(isinstance(content, list) and len(content) == 1 and content[0].get("type") == "output_text" and TOKEN.fullmatch(content[0].get("text", "")), "terminal-token")
    metadata_value = finals[0][1].get("internal_chat_message_metadata_passthrough", {})
    require(metadata_value.get("turn_id") == live_context["turn_id"], "terminal-message-turn")
    result = content[0]["text"]
    require(result in {"PASS", atom["fail_token"]} and completes[0][1].get("last_agent_message") == result and completes[0][1].get("turn_id") == live_context["turn_id"], "terminal-result")
    return {"goal": terminal_goal, "result": result, **live_context}


def inventory(path):
    records = []
    def visit(current, relative):
        info = os.lstat(current)
        require(not stat.S_ISLNK(info.st_mode) and info.st_uid == os.getuid(), "inventory-custody")
        if stat.S_ISDIR(info.st_mode):
            require(stat.S_IMODE(info.st_mode) == 0o700, "inventory-dir")
            records.append((relative, "dir", metadata(info)))
            for name in sorted(os.listdir(current)):
                visit(current + "/" + name, name if relative == "." else relative + "/" + name)
        else:
            require(stat.S_ISREG(info.st_mode) and stat.S_IMODE(info.st_mode) == 0o444 and info.st_nlink == 1, "inventory-file")
            raw = read_bound(current, 0o444, 5000000)
            records.append((relative, "file", len(raw), sha(raw), metadata(info)))
    visit(path, ".")
    return records


def verify():
    recipe, _, skill, waiter, codec = load_sources()
    validate_admission()
    require_dir(ROOT)
    before = inventory(ROOT)
    atom_ids = ["A{:02d}".format(index) for index in range(1, 19)]
    require(sorted(os.listdir(ROOT)) == atom_ids, "root-atoms")
    seen = {key: set() for key in ("goal_threads", "nonces", "task_paths", "trace_hashes", "turn_ids")}
    results = []
    for atom_id in atom_ids:
        atom, item = record(recipe, atom_id)
        atom_dir = ROOT + "/" + atom_id
        require_dir(atom_dir)
        require(os.listdir(atom_dir) == [item["review_nonce"]], "atom-row")
        path = row(item)
        require_dir(path)
        require(sorted(os.listdir(path)) == ROW_FILES, "row-files:" + atom_id)
        subject_raw = subject(recipe, atom)
        expected_pre = predeclaration(item, subject_raw)
        pre, pre_raw = read_json(path + "/predeclaration.json", 0o444, 8192)
        require(pre == expected_pre, "pre:" + atom_id)
        require(read_bound(path + "/spawn_prompt.txt", 0o444, 512) == prompt(item), "prompt:" + atom_id)
        require(read_bound(path + "/wait.py", 0o444, WAITER_BYTES, WAITER_BYTES, WAITER_SHA256) == waiter, "waiter:" + atom_id)
        ready, _ = read_json(path + "/ready.json", 0o444, 4096)
        require(set(ready) == {"architecture_sha256", "atom_id", "bootstrap_skill_sha256", "goal_thread_id", "pid", "recipe_sha256", "request_sha256", "review_nonce", "schema_id", "waiter_sha256"}, "ready-fields")
        require((ready["architecture_sha256"], ready["atom_id"], ready["bootstrap_skill_sha256"], ready["recipe_sha256"], ready["request_sha256"], ready["review_nonce"], ready["schema_id"], ready["waiter_sha256"]) == (ARCH_SHA256, atom_id, SKILL_SHA256, RECIPE_SHA256, sha(pre_raw), item["review_nonce"], "pw-r9-codex-native-goal-observed-envelope-review-ready-v10", WAITER_SHA256), "ready-bind")
        require(UUID.fullmatch(ready["goal_thread_id"] or "") and isinstance(ready["pid"], int) and ready["pid"] > 1, "ready-values")
        require(read_bound(path + "/subject.txt", 0o444, len(subject_raw), len(subject_raw), sha(subject_raw)) == subject_raw, "subject:" + atom_id)
        active, _ = read_json(path + "/active.json", 0o444, 8192)
        require(set(active) == {"atom_id", "goal_objective", "goal_thread_id", "profile", "qualification_credit", "review_nonce", "schema_id", "status", "task_path", "trace", "turn_id"}, "active-fields")
        require((active["atom_id"], active["goal_objective"], active["goal_thread_id"], active["profile"], active["qualification_credit"], active["review_nonce"], active["schema_id"], active["status"], active["task_path"]) == (atom_id, item["goal_objective"], ready["goal_thread_id"], "OBSERVED_NATIVE_ENVELOPE_V1", 0, item["review_nonce"], "pw-r9-codex-native-goal-atomic-review-active-v9", "ACTIVE_ATTESTED_SUBJECT_PUBLISHED_ZERO_CREDIT", "/root/" + item["task_name"]), "active-bind")
        live = read_bound(path + "/active_trace.jsonl", 0o444, 5000000, active["trace"]["bytes"], active["trace"]["sha256"])
        terminal = read_bound(path + "/terminal_trace.jsonl", 0o444, 5000000)
        proof = verify_traces(codec, skill, item, atom, subject_raw, live, terminal)
        require(active["goal_thread_id"] == proof["thread_id"] and active["turn_id"] == proof["turn_id"] and active["trace"] == {"bytes": len(live), "sha256": sha(live)}, "active-proof:" + atom_id)
        result_raw = read_bound(path + "/result.txt", 0o444, 64)
        require(result_raw == proof["result"].encode("ascii") + b"\n", "result-file")
        receipt, _ = read_json(path + "/goal_receipt.json", 0o444, 12000)
        expected_receipt = {"atom_id": atom_id, "goal_objective": item["goal_objective"], "goal_thread_id": proof["thread_id"], "qualification_credit": 0, "result": proof["result"], "review_nonce": item["review_nonce"], "schema_id": "pw-r9-codex-native-goal-atomic-review-receipt-v9", "status": "PASS_FRESH_GOAL_ATOM_ZERO_CREDIT" if proof["result"] == "PASS" else "FAIL_FRESH_GOAL_ATOM_ZERO_CREDIT", "task_path": proof["task_path"], "traces": {"active": {"bytes": len(live), "sha256": sha(live)}, "terminal": {"bytes": len(terminal), "sha256": sha(terminal)}}, "turn_count": 1, "turn_id": proof["turn_id"]}
        require(receipt == expected_receipt, "receipt:" + atom_id)
        for key, value in (("goal_threads", proof["thread_id"]), ("nonces", item["review_nonce"]), ("task_paths", proof["task_path"]), ("trace_hashes", sha(terminal)), ("turn_ids", proof["turn_id"])):
            require(value not in seen[key], "freshness:" + key)
            seen[key].add(value)
        results.append(proof["result"])
    require(inventory(ROOT) == before, "inventory-drift")
    passed = all(value == "PASS" for value in results)
    return {"atom_count": 18, "first_mismatch": None if passed else "review-atom-failed", "implementation_eligible": passed, "qualification_credit": 0, "result_counts": {"FAIL": sum(value != "PASS" for value in results), "PASS": sum(value == "PASS" for value in results)}, "schema_id": "pw-r9-codex-native-goal-observed-envelope-atomic-review-offline-verification-v10", "status": "PASS_ALL_ATOMS_IMPLEMENTATION_ONLY_ZERO_CREDIT" if passed else "FAIL_ATOM_ZERO_CREDIT_NO_AUTHORITY", "valid": passed}


def reject(callback, label):
    try:
        callback()
    except (Invalid, OSError, UnicodeError, json.JSONDecodeError, KeyError, TypeError, ValueError):
        return 1
    raise Invalid("mutation-accepted:" + label)


def synthetic_call(tool, arguments, call_id):
    fields = ",".join(json.dumps(key) + ":" + json.dumps(value, separators=(",", ":")) for key, value in arguments.items())
    suffix = "r.output" if tool == "exec_command" else "r"
    return {"call_id": call_id, "input": "const r = await tools." + tool + "({" + fields + "}); text(" + suffix + ");\n", "name": "exec", "type": "custom_tool_call"}


def synthetic_output(call_id, body):
    return {"call_id": call_id, "output": [{"text": "Script completed\nWall time 0.1 seconds\nOutput:\n", "type": "input_text"}, {"text": body, "type": "input_text"}], "type": "custom_tool_call_output"}


def synthetic_goal(thread, objective, status):
    active = status == "active"
    value = {"completionBudgetReport": None if active else "complete", "goal": {"createdAt": 10, "objective": objective, "status": status, "threadId": thread, "timeUsedSeconds": 0 if active else 1, "tokensUsed": 0 if active else 7, "updatedAt": 10 if active else 11}, "remainingTokens": None}
    return canonical(value).decode("utf-8")


def synthetic_traces(record, subject_raw, skill):
    thread = "11111111-1111-4111-8111-111111111111"
    turn = "22222222-2222-4222-8222-222222222222"
    task = "/root/" + record["task_name"]
    skill_call = synthetic_call("exec_command", SKILL_ARGS, "c0")
    create_call = synthetic_call("create_goal", {"objective": record["goal_objective"]}, "c1")
    wait_call = synthetic_call("exec_command", wait_args(record, thread), "c2")
    complete_call = synthetic_call("update_goal", {"status": "complete"}, "c3")
    events = [
        {"payload": {"agent_path": task, "id": thread, "parent_thread_id": PARENT, "source": {"subagent": {"thread_spawn": {"agent_path": task, "parent_thread_id": PARENT}}}}, "type": "session_meta"},
        {"payload": {"turn_id": turn, "type": "task_started"}, "type": "event_msg"},
        {"payload": {"effort": EFFORT, "model": MODEL, "turn_id": turn}, "type": "turn_context"},
        {"payload": skill_call, "type": "response_item"},
        {"payload": synthetic_output("c0", skill.decode("utf-8")), "type": "response_item"},
        {"payload": create_call, "type": "response_item"},
        {"payload": synthetic_output("c1", synthetic_goal(thread, record["goal_objective"], "active")), "type": "response_item"},
        {"payload": wait_call, "type": "response_item"},
        {"payload": synthetic_output("c2", subject_raw.decode("utf-8")), "type": "response_item"},
        {"payload": complete_call, "type": "response_item"},
        {"payload": synthetic_output("c3", synthetic_goal(thread, record["goal_objective"], "complete")), "type": "response_item"},
        {"payload": {"content": [{"text": "PASS", "type": "output_text"}], "internal_chat_message_metadata_passthrough": {"turn_id": turn}, "phase": "final_answer", "role": "assistant", "type": "message"}, "type": "response_item"},
        {"payload": {"last_agent_message": "PASS", "turn_id": turn, "type": "task_complete"}, "type": "event_msg"},
    ]
    return b"".join(canonical(event) for event in events[:8]), b"".join(canonical(event) for event in events), events


def check_only():
    recipe, arch, skill, waiter, codec = load_sources()
    require(not os.path.lexists(ROOT), "workspace-review-root-present")
    if os.path.lexists(ADMISSION):
        validate_admission()
    elif os.path.lexists(VALIDATION):
        validate_validation()
    ids = ["A{:02d}".format(index) for index in range(1, 19)]
    nonces = set()
    maximum = {"prompt": 0, "subject": 0}
    assertions = 0
    for atom_id in ids:
        atom, item = record(recipe, atom_id)
        raw = subject(recipe, atom)
        pre = predeclaration(item, raw)
        require(pre["subject_sha256"] == sha(raw) and pre["waiter_sha256"] == WAITER_SHA256 and item["review_nonce"] not in nonces, "projection:" + atom_id)
        nonces.add(item["review_nonce"])
        maximum["prompt"] = max(maximum["prompt"], len(prompt(item)))
        maximum["subject"] = max(maximum["subject"], len(raw))
        assertions += 9
    require(len(nonces) == 18 and arch["review_contract"]["atom_ids"] == ids and arch["qualification"]["credit"] == "0/2", "closed-set")
    sample = 'const r = await tools.exec_command({cmd:"x",workdir:"/x",yield_time_ms:30000,max_output_tokens:128}); text(r.output);\n'
    decoded = codec.parse_call(sample)
    require(decoded == {"arguments": {"cmd": "x", "max_output_tokens": 128, "workdir": "/x", "yield_time_ms": 30000}, "output_mode": "output", "session_tail": False, "tool": "exec_command"}, "codec-integration")
    atom, item = record(recipe, "A01")
    raw = subject(recipe, atom)
    live, terminal, events = synthetic_traces(item, raw, skill)
    proof = verify_traces(codec, skill, item, atom, raw, live, terminal)
    require(proof["result"] == "PASS" and proof["thread_id"] == "11111111-1111-4111-8111-111111111111", "synthetic-valid")
    mutations = []
    mutations.append((live[:-1], terminal, "live-framing"))
    mutations.append((live, terminal[:-1], "terminal-framing"))
    bad = parse(canonical(events)); bad[2]["payload"]["model"] = "wrong"; mutations.append((b"".join(canonical(event) for event in bad[:8]), b"".join(canonical(event) for event in bad), "route"))
    bad = parse(canonical(events)); bad[0]["payload"]["parent_thread_id"] = "wrong"; mutations.append((b"".join(canonical(event) for event in bad[:8]), b"".join(canonical(event) for event in bad), "parent"))
    bad = parse(canonical(events)); bad[5]["payload"]["input"] = bad[5]["payload"]["input"].replace(item["goal_objective"], "wrong"); mutations.append((b"".join(canonical(event) for event in bad[:8]), b"".join(canonical(event) for event in bad), "goal-objective"))
    bad = parse(canonical(events)); bad[7]["payload"]["input"] = bad[7]["payload"]["input"].replace('"max_output_tokens":128', '"max_output_tokens":129'); mutations.append((b"".join(canonical(event) for event in bad[:8]), b"".join(canonical(event) for event in bad), "waiter-budget"))
    bad = parse(canonical(events)); bad[8]["payload"]["output"][1]["text"] = "wrong\n"; mutations.append((live, b"".join(canonical(event) for event in bad), "subject"))
    bad = parse(canonical(events)); bad[9]["payload"]["call_id"] = "c2"; mutations.append((live, b"".join(canonical(event) for event in bad), "call-id-reuse"))
    bad = parse(canonical(events)); bad[10]["payload"]["output"][1]["text"] = synthetic_goal("11111111-1111-4111-8111-111111111111", item["goal_objective"], "active"); mutations.append((live, b"".join(canonical(event) for event in bad), "goal-not-complete"))
    bad = parse(canonical(events)); bad[11]["payload"]["content"][0]["text"] = "WRONG"; mutations.append((live, b"".join(canonical(event) for event in bad), "result-token"))
    bad = parse(canonical(events)); bad[11]["payload"]["internal_chat_message_metadata_passthrough"]["turn_id"] = "wrong"; mutations.append((live, b"".join(canonical(event) for event in bad), "message-turn"))
    bad = parse(canonical(events)); bad.insert(11, {"payload": {"content": [{"text": "late", "type": "output_text"}], "phase": "commentary", "role": "assistant", "type": "message"}, "type": "response_item"}); mutations.append((live, b"".join(canonical(event) for event in bad), "post-skill-commentary"))
    rejected = sum(reject(lambda live_bad=live_bad, terminal_bad=terminal_bad: verify_traces(codec, skill, item, atom, raw, live_bad, terminal_bad), label) for live_bad, terminal_bad, label in mutations)
    assertions += 46
    return {"assertion_count": assertions, "first_mismatch": None, "max_spawn_prompt_bytes": maximum["prompt"], "max_subject_bytes": maximum["subject"], "mutation_count": rejected, "qualification_credit": 0, "schema_id": "pw-r9-codex-native-goal-observed-envelope-atomic-review-offline-verifier-check-v10", "status": "PASS_DATA_ONLY_INDEPENDENT_VERIFIER_ZERO_CALLS_ZERO_WRITES", "subject_calls": 0, "workspace_writes": 0}


def main():
    try:
        if sys.argv == [sys.argv[0], "--check"]:
            output = check_only()
        elif sys.argv == [sys.argv[0], "verify", ROOT]:
            output = verify()
        else:
            raise Invalid("cli")
        sys.stdout.buffer.write(canonical(output))
        return 0 if output.get("valid", True) else 1
    except (Invalid, OSError, UnicodeError, json.JSONDecodeError, KeyError, TypeError, ValueError) as error:
        sys.stdout.buffer.write(canonical({"first_mismatch": str(error), "implementation_eligible": False, "qualification_credit": 0, "schema_id": "pw-r9-codex-native-goal-observed-envelope-atomic-review-offline-verification-v10", "status": "FAIL", "valid": False}))
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
