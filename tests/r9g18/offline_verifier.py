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
HERE = "/mnt/Cursor/PuppetMaster/tests/r9g18"
ROOT = HERE + "/r"
ARCH = "/mnt/Cursor/PuppetMaster/tests/agent_packet_restrictions/successor_20260813/r9_control_plane_stabilization_v1/r9_codex_native_goal_single_source_packet_atomic_review_v11.json"
ARCH_BYTES = 3621
ARCH_SHA256 = "331f6e3a3e2e5356b6e5d78d2bb5e3aa42cf189ace90ce07b05dd3c41a615537"
RECIPE = "/mnt/Cursor/PuppetMaster/tests/r9g16/review_recipe.json"
RECIPE_BYTES = 7936
RECIPE_SHA256 = "100386642d6680db468c1e9a0ddf7c2c774728f4444e540ca2d655fe8669f690"
SKILL = "/mnt/Cursor/PuppetMaster/.agents/skills/r9-goal-atom-bootstrap/SKILL.md"
SKILL_BYTES = 1327
SKILL_SHA256 = "7fba245c05b7fb104054ea18af4d0a2fd90d4f28f295c94f7c12b699b343d8b4"
COMPILER = HERE + "/packet_compiler.py"
COMPILER_BYTES = 6018
COMPILER_SHA256 = "bce30c334538d0d10c93fd6fa9d2c8ad2df9f6b4ceb43ddb776c6805018dfb31"
WAITER = HERE + "/wait.py"
WAITER_BYTES = 7771
WAITER_SHA256 = "d73b89f69cb4af3f531ab7bd3a1befe81354156f8587bd62a57d67af6cd9d438"
CROSSCHECK = HERE + "/packet_crosscheck.py"
CROSSCHECK_BYTES = 8740
CROSSCHECK_SHA256 = "56ce661d42315fce4183c48ac42f7a3a2f42e318dbcbe8886df5b95e401b4753"
RUNTIME = HERE + "/review_runtime.py"
RUNTIME_BYTES = 37626
RUNTIME_SHA256 = "582b1c67c24d1788fd8bb7e70863d3c36957fb13957ed7aac84941ea69191721"
CODEC = "/mnt/Cursor/PuppetMaster/tests/r9g17/native_envelope.py"
CODEC_BYTES = 4661
CODEC_SHA256 = "d2aef9d619f6c4ec779e6d2dce2d1b6fc89282fd91cc4b9f56bc82490df0f246"
V10_FAILURE = "/mnt/Cursor/PuppetMaster/tests/agent_packet_restrictions/successor_20260813/r9_control_plane_stabilization_v1/r9_codex_native_goal_observed_envelope_atomic_review_v10_a01_runtime_failure_receipt_v1.json"
V10_FAILURE_BYTES = 5030
V10_FAILURE_SHA256 = "2b26abc09086380bc865d51cdfa6b8db34f0873c884177bb0df2f083ad51d9de"
CHURN = "/mnt/Cursor/PuppetMaster/tests/agent_packet_restrictions/successor_20260813/r9_control_plane_stabilization_v1/r9_codex_native_goal_churn_audit_20260824t045223z_v1.json"
CHURN_BYTES = 3382
CHURN_SHA256 = "f02187ebb0a8f593895353c0b1a64574414e3042a6238d8f4e2b1f6209ec3196"
VALIDATION = "/mnt/Cursor/PuppetMaster/tests/agent_packet_restrictions/successor_20260813/r9_control_plane_stabilization_v1/r9_codex_native_goal_single_source_packet_atomic_review_v11_data_only_validation_v1.json"
ADMISSION = "/mnt/Cursor/PuppetMaster/tests/agent_packet_restrictions/successor_20260813/r9_control_plane_stabilization_v1/r9_codex_native_goal_single_source_packet_atomic_review_v11_launch_admission_v1.json"
PARENT = "01a00b52-4879-7c41-a826-7b4609ad3c3b"
MODEL = "gpt-5.6-luna"
EFFORT = "medium"
SKILL_ARGS = {"cmd": "sed -n 1,80p .agents/skills/r9-goal-atom-bootstrap/SKILL.md", "max_output_tokens": 3000, "workdir": "/mnt/Cursor/PuppetMaster", "yield_time_ms": 10000}
ROW_FILES = sorted(["active.json", "active_trace.jsonl", "goal_receipt.json", "predeclaration.json", "ready.json", "result.txt", "spawn_prompt.txt", "subject.txt", "terminal_trace.jsonl", "wait.py"])
UUID = re.compile(r"^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$")
HEX = re.compile(r"^[0-9a-f]{64}$")
TOKEN = re.compile(r"^[A-Z0-9_]{1,48}$")


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
    require(stat.S_ISREG(before.st_mode) and stat.S_IMODE(before.st_mode) == mode and before.st_uid == os.getuid() and before.st_nlink == 1 and before.st_size <= cap, "custody:" + path)
    if expected_bytes is not None:
        require(before.st_size == expected_bytes, "bytes:" + path)
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
    if expected_sha is not None:
        require(sha(raw) == expected_sha, "sha:" + path)
    return raw


def read_json(path, mode=0o444, cap=100000):
    raw = read_bound(path, mode, cap)
    value = parse(raw)
    require(raw == canonical(value), "canonical:" + path)
    return value, raw


def load_module(name, path, size, digest):
    raw = read_bound(path, 0o644, size, size, digest)
    value = types.ModuleType(name)
    value.__file__ = path
    exec(compile(raw, path, "exec"), value.__dict__)
    return value


codec = load_module("r9g18_verifier_codec", CODEC, CODEC_BYTES, CODEC_SHA256)


def identity(path, mode=0o644, cap=200000):
    raw = read_bound(path, mode, cap)
    return {"bytes": len(raw), "mode": "{:04o}".format(mode), "path": path, "sha256": sha(raw)}


def load_sources():
    architecture_raw = read_bound(ARCH, 0o644, ARCH_BYTES, ARCH_BYTES, ARCH_SHA256)
    architecture = parse(architecture_raw)
    require(architecture_raw == canonical(architecture) and architecture["status"] == "FROZEN_PROPOSED_SINGLE_SOURCE_PACKET_REVIEW_ZERO_CREDIT_NO_LAUNCH_AUTHORITY", "architecture")
    recipe_raw = read_bound(RECIPE, 0o644, RECIPE_BYTES, RECIPE_BYTES, RECIPE_SHA256)
    recipe = parse(recipe_raw)
    require(recipe_raw == canonical(recipe) and [item["id"] for item in recipe["atoms"]] == ["A{:02d}".format(index) for index in range(1, 19)], "recipe")
    skill = read_bound(SKILL, 0o644, SKILL_BYTES, SKILL_BYTES, SKILL_SHA256)
    waiter = read_bound(WAITER, 0o644, WAITER_BYTES, WAITER_BYTES, WAITER_SHA256)
    read_bound(COMPILER, 0o644, COMPILER_BYTES, COMPILER_BYTES, COMPILER_SHA256)
    read_bound(CROSSCHECK, 0o644, CROSSCHECK_BYTES, CROSSCHECK_BYTES, CROSSCHECK_SHA256)
    read_bound(RUNTIME, 0o644, RUNTIME_BYTES, RUNTIME_BYTES, RUNTIME_SHA256)
    churn_raw = read_bound(CHURN, 0o644, CHURN_BYTES, CHURN_BYTES, CHURN_SHA256)
    churn = parse(churn_raw)
    require(churn_raw == canonical(churn) and churn["status"] == "NOT_CHURNING_DISTINCT_V11_SINGLE_SOURCE_PIVOT_MAKING_MEASURABLE_PROGRESS", "churn-audit")
    failure_raw = read_bound(V10_FAILURE, 0o644, V10_FAILURE_BYTES, V10_FAILURE_BYTES, V10_FAILURE_SHA256)
    failure = parse(failure_raw)
    require(failure_raw == canonical(failure) and failure["status"] == "FAIL_PERMANENT_V10_A01_ZERO_SUBJECT_ZERO_CREDIT_REMAINING_REVIEW_FROZEN", "v10-failure")
    return architecture, recipe, skill, waiter


def record(atom_id):
    nonce = sha(b"pw-r9-cg11-single-source-packet-review\0" + ARCH_SHA256.encode("ascii") + b"\0" + atom_id.encode("ascii"))
    return {"atom_id": atom_id, "goal_objective": "CG11R|a={}|x={}|once".format(atom_id, nonce), "model_requested": MODEL, "reasoning_effort_requested": EFFORT, "review_nonce": nonce, "task_name": "r9_cg11r_" + nonce}


def row(item):
    return ROOT + "/" + item["atom_id"] + "/" + item["review_nonce"]


def subject(atom):
    raw = canonical({"c": atom["evidence"], "p": {"atom": atom["id"], "src": ARCH_SHA256}, "q": atom["question"], "r": "TOKEN", "v": 3, "z": "PASS or " + atom["fail_token"]})
    require(len(raw) <= 512 and raw.count(b"\n") == 1, "subject")
    return raw


def prompt(item):
    raw = ("Use $r9-goal-atom-bootstrap; load once via exec_command cmd=\"sed -n 1,80p .agents/skills/r9-goal-atom-bootstrap/SKILL.md\" workdir=/mnt/Cursor/PuppetMaster yield=10000 max=3000. objective=" + json.dumps(item["goal_objective"]) + " waiter=" + json.dumps(row(item)) + ". Obey skill.").encode("utf-8")
    require(len(raw) <= 512 and b"PASS" not in raw and b"FAIL_" not in raw, "prompt")
    return raw


def predeclaration(item, raw):
    return {"architecture_sha256": ARCH_SHA256, "atom_id": item["atom_id"], "bootstrap_skill_sha256": SKILL_SHA256, "goal_objective": item["goal_objective"], "model_requested": MODEL, "packet_compiler_sha256": COMPILER_SHA256, "reasoning_effort_requested": EFFORT, "recipe_sha256": RECIPE_SHA256, "review_nonce": item["review_nonce"], "schema_id": "pw-r9-codex-native-goal-single-source-packet-review-predeclaration-v11", "subject_bytes": len(raw), "subject_sha256": sha(raw), "subject_source_sha256": ARCH_SHA256, "task_path": "/root/" + item["task_name"], "waiter_bytes": WAITER_BYTES, "waiter_sha256": WAITER_SHA256}


def decode_trace(raw):
    require(raw.endswith(b"\n") and b"\r" not in raw, "trace-framing")
    events = []
    for index, line in enumerate(raw.splitlines(keepends=True)):
        require(line.endswith(b"\n") and line != b"\n", "trace-line:" + str(index))
        event = parse(line[:-1])
        require(set(event) in ({"payload", "type"}, {"payload", "timestamp", "type"}) and isinstance(event["payload"], dict), "trace-envelope")
        events.append({"payload": event["payload"], "type": event["type"]})
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


def context(events, item):
    sessions = items(events, "session_meta")
    require(len(sessions) == 1 and sessions[0][0] == 0, "session")
    session = sessions[0][1]
    thread = session.get("id")
    task = "/root/" + item["task_name"]
    spawn = session.get("source", {}).get("subagent", {}).get("thread_spawn", {})
    require(UUID.fullmatch(thread or "") and session.get("parent_thread_id") == PARENT and spawn.get("parent_thread_id") == PARENT, "session-parent")
    require(session.get("agent_path") == task and spawn.get("agent_path") == task, "session-task")
    turns = items(events, "turn_context")
    require(len(turns) == 1 and turns[0][1].get("model") == MODEL and turns[0][1].get("effort") == EFFORT and UUID.fullmatch(turns[0][1].get("turn_id", "")), "turn")
    turn = turns[0][1]["turn_id"]
    starts = items(events, "event_msg", "task_started")
    require(len(starts) == 1 and starts[0][1].get("turn_id") == turn and starts[0][0] < turns[0][0], "start")
    return {"task_path": task, "thread_id": thread, "turn_id": turn, "turn_index": turns[0][0]}


def tools(events):
    direct = items(events, "response_item", "function_call") + items(events, "response_item", "function_call_output")
    wrapped = sorted(items(events, "response_item", "custom_tool_call") + items(events, "response_item", "custom_tool_call_output"))
    require(not direct and bool(wrapped), "tools")
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
    require(set(item) == {"createdAt", "objective", "status", "threadId", "timeUsedSeconds", "tokensUsed", "updatedAt"} and (item["threadId"], item["objective"], item["status"]) == (thread, objective, status), "goal-bind")
    require(all(isinstance(item[key], int) and not isinstance(item[key], bool) and item[key] >= 0 for key in ("createdAt", "updatedAt", "timeUsedSeconds", "tokensUsed")) and item["createdAt"] > 0 and item["updatedAt"] >= item["createdAt"], "goal-counters")
    if status == "active":
        require(item["tokensUsed"] == item["timeUsedSeconds"] == 0 and value["completionBudgetReport"] is None, "goal-active")
    else:
        require(item["tokensUsed"] > 0 and isinstance(value["completionBudgetReport"], str) and value["completionBudgetReport"], "goal-complete")
    return item


def wait_args(item, thread):
    return {"cmd": "python3 -B wait.py " + thread, "max_output_tokens": 128, "workdir": row(item), "yield_time_ms": 30000}


def verify_traces(skill, item, atom, subject_raw, live_raw, terminal_raw):
    require(len(terminal_raw) > len(live_raw) and terminal_raw.startswith(live_raw), "trace-prefix")
    live_events = decode_trace(live_raw)
    live_context = context(live_events, item)
    live_tools = tools(live_events)
    require(len(live_tools) == 5 and not items(live_events, "event_msg", "task_complete"), "live-tools")
    live_indexes = [index for index, _ in live_tools]
    require(live_context["turn_index"] < live_indexes[0] < live_indexes[1] < live_indexes[2] < live_indexes[3] < live_indexes[4] == len(live_events) - 1, "live-order")
    values = [value for _, value in live_tools]
    call_ids = [values[index].get("call_id") for index in (0, 2, 4)]
    require(all(isinstance(value, str) and value for value in call_ids) and len(set(call_ids)) == 3, "live-call-ids")
    require(pair(values[0], values[1], "exec_command", SKILL_ARGS).encode("utf-8") == skill, "live-skill")
    active_goal = goal(pair(values[2], values[3], "create_goal", {"objective": item["goal_objective"]}), live_context["thread_id"], item["goal_objective"], "active")
    pending = codec.parse_call(values[4].get("input"))
    require(pending["tool"] == "exec_command" and pending["arguments"] == wait_args(item, live_context["thread_id"]), "pending")
    require(all(subject_raw.decode("utf-8") not in text for event in live_events for text in strings(event)), "subject-before-active")
    terminal_events = decode_trace(terminal_raw)
    terminal_context = context(terminal_events, item)
    require(terminal_context == live_context, "terminal-context")
    terminal_tools = tools(terminal_events)
    require(len(terminal_tools) == 8, "terminal-tools")
    indexes = [index for index, _ in terminal_tools]
    values = [value for _, value in terminal_tools]
    call_ids = [values[index].get("call_id") for index in (0, 2, 4, 6)]
    require(all(isinstance(value, str) and value for value in call_ids) and len(set(call_ids)) == 4, "terminal-call-ids")
    require(pair(values[0], values[1], "exec_command", SKILL_ARGS).encode("utf-8") == skill, "terminal-skill")
    goal(pair(values[2], values[3], "create_goal", {"objective": item["goal_objective"]}), live_context["thread_id"], item["goal_objective"], "active")
    require(pair(values[4], values[5], "exec_command", wait_args(item, live_context["thread_id"])).encode("utf-8") == subject_raw, "terminal-subject")
    complete_goal = goal(pair(values[6], values[7], "update_goal", {"status": "complete"}), live_context["thread_id"], item["goal_objective"], "complete")
    require(complete_goal["createdAt"] == active_goal["createdAt"] and complete_goal["updatedAt"] >= active_goal["updatedAt"], "goal-continuity")
    finals = [(index, value) for index, value in items(terminal_events, "response_item", "message") if value.get("phase") == "final_answer"]
    completes = items(terminal_events, "event_msg", "task_complete")
    require(len(finals) == len(completes) == 1 and completes[0][0] == len(terminal_events) - 1 and indexes[-1] < finals[0][0] < completes[0][0], "terminal-order")
    assistant = [(index, value) for index, value in items(terminal_events, "response_item", "message") if value.get("role") == "assistant"]
    require(all(value.get("phase") in {"commentary", "final_answer"} for _, value in assistant) and all(index < indexes[0] for index, value in assistant if value.get("phase") == "commentary"), "assistant-messages")
    content = finals[0][1].get("content")
    require(isinstance(content, list) and len(content) == 1 and content[0].get("type") == "output_text" and TOKEN.fullmatch(content[0].get("text", "")), "terminal-token")
    require(finals[0][1].get("internal_chat_message_metadata_passthrough", {}).get("turn_id") == live_context["turn_id"], "terminal-message-turn")
    result = content[0]["text"]
    require(result in {"PASS", atom["fail_token"]} and completes[0][1].get("last_agent_message") == result and completes[0][1].get("turn_id") == live_context["turn_id"], "terminal-result")
    return {"goal": complete_goal, "profile": "OBSERVED_NATIVE_ENVELOPE_V1", "result": result, **live_context}


def admission_components():
    return {"architecture": identity(ARCH, 0o644, ARCH_BYTES), "bootstrap_skill": identity(SKILL, 0o644, SKILL_BYTES), "churn_audit": identity(CHURN, 0o644, CHURN_BYTES), "data_only_validation": identity(VALIDATION, 0o644, 20000), "native_envelope": identity(CODEC, 0o644, CODEC_BYTES), "offline_verifier": identity(os.path.realpath(__file__), 0o644, 100000), "packet_compiler": identity(COMPILER, 0o644, COMPILER_BYTES), "packet_crosscheck": identity(CROSSCHECK, 0o644, CROSSCHECK_BYTES), "review_recipe": identity(RECIPE, 0o644, RECIPE_BYTES), "review_runtime": identity(RUNTIME, 0o644, RUNTIME_BYTES), "review_waiter": identity(WAITER, 0o644, WAITER_BYTES), "v10_failure": identity(V10_FAILURE, 0o644, V10_FAILURE_BYTES)}


def validation_checks():
    empty = {"bytes": 0, "sha256": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"}
    cross = {"assertion_count": 329, "atom_count": 18, "first_mismatch": None, "max_spawn_prompt_bytes": 402, "max_subject_bytes": 416, "mutation_count": 15, "qualification_credit": 0, "schema_id": "pw-r9-codex-native-goal-single-source-packet-crosscheck-v11", "status": "PASS_DATA_ONLY_ACTUAL_WAITER_CROSS_COMPONENT_SUBJECT_IDENTITY_ZERO_CALLS_ZERO_WRITES", "subject_calls": 0, "workspace_writes": 0}
    runtime = {"assertion_count": 137, "first_mismatch": None, "max_spawn_prompt_bytes": 402, "max_subject_bytes": 411, "mutation_count": 15, "qualification_credit": 0, "schema_id": "pw-r9-codex-native-goal-single-source-packet-review-runtime-check-v11", "status": "PASS_DATA_ONLY_STANDALONE_REVIEW_RUNTIME_ZERO_CALLS_ZERO_WRITES", "subject_calls": 0, "workspace_writes": 0}
    verifier = {"assertion_count": 247, "first_mismatch": None, "max_spawn_prompt_bytes": 402, "max_subject_bytes": 416, "mutation_count": 10, "qualification_credit": 0, "schema_id": "pw-r9-codex-native-goal-single-source-packet-review-offline-verifier-check-v11", "status": "PASS_DATA_ONLY_INDEPENDENT_VERIFIER_ZERO_CALLS_ZERO_WRITES", "subject_calls": 0, "workspace_writes": 0}
    return {"crosscheck": {"rc": 0, "result": cross, "stderr": empty, "stdout": {"bytes": 369, "sha256": "468879d5972da7527297013c817305a9ba8d66c0c7cbafdb10ac12efb16466da"}}, "runtime": {"rc": 0, "result": runtime, "stderr": empty, "stdout": {"bytes": 342, "sha256": "40120e9757cd2e7ac6c21b77df3f13ed5069735d91910e6c69bd13157ec5e0b6"}}, "verifier": {"rc": 0, "result": verifier, "stderr": empty, "stdout": {"bytes": 346, "sha256": "532eecbc7fd5ec9f2eab5aa3e0aa799e5aeecee45fc9c1c046d9c981a759f9a6"}}}


def validate_validation():
    receipt, _ = read_json(VALIDATION, 0o644, 20000)
    require(set(receipt) == {"authority", "bindings", "calls", "checks", "first_mismatch", "lineage", "next", "qualification", "residual_risks", "schema_id", "status", "workspace"}, "validation-fields")
    require(receipt["schema_id"] == "pw-r9-codex-native-goal-single-source-packet-atomic-review-v11-data-only-validation-v1" and receipt["status"] == "PASS_DATA_ONLY_V11_REVIEW_BUNDLE_ZERO_CREDIT_ZERO_LAUNCH_AUTHORITY", "validation-status")
    require(receipt["authority"] == {"canary_launch": False, "implementation": False, "matrix_launch": False, "qualification": False, "release": False, "review_launch": False, "subject_launch": False}, "validation-authority")
    require(receipt["qualification"] == {"clean_full_matrix_streak": 0, "credit": "0/2", "qualification_credit": 0, "required_consecutive_clean_full_matrices": 2}, "validation-qualification")
    expected = admission_components()
    require(set(receipt["bindings"]) == set(expected) - {"data_only_validation"} and all(receipt["bindings"][key] == value for key, value in expected.items() if key != "data_only_validation"), "validation-bindings")
    require(receipt["calls"] == {"collaboration": 0, "goal": 0, "model": 0, "omp": 0, "provider": 0, "subject": 0} and receipt["first_mismatch"] is None, "validation-zero")
    require(receipt["checks"] == validation_checks(), "validation-checks")
    require(receipt["lineage"] == {"v10": "FROZEN_PERMANENT_A01_FAILURE_DIAGNOSTIC_ONLY", "v11": "DISTINCT_SINGLE_SOURCE_PACKET_FAMILY_NO_EXECUTABLE_INHERITANCE"}, "validation-lineage")
    require(receipt["next"] == {"canary_launch": False, "matrix_launch": False, "only_authorized_successor": "EXACT_V11_18_ATOM_REVIEW_LAUNCH_ADMISSION"}, "validation-next")
    require(receipt["residual_risks"] == ["DATA_ONLY_CHECKS_DO_NOT_PROVE_A_LIVE_GOAL_ATOM", "CANARY_AND_MATRIX_RUNTIME_REMAIN_UNBUILT", "QUALIFICATION_REMAINS_ZERO_UNTIL_TWO_CONSECUTIVE_CLEAN_FULL_MATRICES"], "validation-residuals")
    require(receipt["workspace"] == {"pycache_absent": True, "review_root_absent": True, "source_inventory_after_sha256": receipt["workspace"]["source_inventory_before_sha256"], "source_inventory_before_sha256": receipt["workspace"]["source_inventory_before_sha256"], "workspace_writes": 0} and HEX.fullmatch(receipt["workspace"]["source_inventory_before_sha256"]), "validation-workspace")
    require(not os.path.lexists(ROOT) and not any(name == "__pycache__" for _, dirs, _ in os.walk(HERE) for name in dirs), "validation-live-workspace")
    return receipt


def validate_admission():
    validate_validation()
    gate, _ = read_json(ADMISSION, 0o644, 30000)
    require(set(gate) == {"atom_sequence", "authority", "components", "failure_contract", "qualification", "review_route", "schema_id", "status"}, "admission-fields")
    require(gate["schema_id"] == "pw-r9-codex-native-goal-single-source-packet-atomic-review-v11-launch-admission-v1" and gate["status"] == "AUTHORIZE_EXACT_18_ATOM_V11_GOAL_REVIEW_ONCE_ZERO_CREDIT", "admission-status")
    require(gate["authority"] == {"canary_launch": False, "implementation": False, "matrix_launch": False, "qualification": False, "release": False, "review_launch": True, "subject_launch": False}, "admission-authority")
    require(gate["atom_sequence"] == ["A{:02d}".format(index) for index in range(1, 19)] and gate["review_route"] == {"fresh_goal_per_atom": True, "model": MODEL, "reasoning_effort": EFFORT, "task_reuse": 0}, "admission-route")
    require(gate["failure_contract"] == {"best_of": 0, "relaunch": 0, "replacement": 0, "resend": 0, "retry": 0, "reuse": 0} and gate["qualification"] == {"clean_full_matrix_streak": 0, "credit": "0/2", "qualification_credit": 0}, "admission-zero")
    require(gate["components"] == admission_components(), "admission-components")


def require_dir(path):
    info = os.lstat(path)
    require(stat.S_ISDIR(info.st_mode) and not stat.S_ISLNK(info.st_mode) and stat.S_IMODE(info.st_mode) == 0o700 and info.st_uid == os.getuid(), "dir:" + path)


def inventory(path):
    values = []
    def visit(current, relative):
        info = os.lstat(current)
        require(not stat.S_ISLNK(info.st_mode) and info.st_uid == os.getuid(), "inventory-custody")
        if stat.S_ISDIR(info.st_mode):
            require(stat.S_IMODE(info.st_mode) == 0o700, "inventory-dir")
            values.append((relative, "dir", metadata(info)))
            for name in sorted(os.listdir(current)):
                visit(current + "/" + name, name if relative == "." else relative + "/" + name)
        else:
            require(stat.S_ISREG(info.st_mode) and stat.S_IMODE(info.st_mode) == 0o444 and info.st_nlink == 1, "inventory-file")
            raw = read_bound(current, 0o444, 5000000)
            values.append((relative, "file", len(raw), sha(raw), metadata(info)))
    visit(path, ".")
    return values


def verify():
    _, recipe, skill, waiter = load_sources()
    validate_admission()
    require_dir(ROOT)
    before = inventory(ROOT)
    atom_ids = ["A{:02d}".format(index) for index in range(1, 19)]
    require(sorted(os.listdir(ROOT)) == atom_ids, "root-atoms")
    seen = {key: set() for key in ("threads", "nonces", "tasks", "turns", "traces")}
    results = []
    for atom, atom_id in zip(recipe["atoms"], atom_ids):
        item = record(atom_id)
        atom_dir = ROOT + "/" + atom_id
        require_dir(atom_dir)
        require(os.listdir(atom_dir) == [item["review_nonce"]], "atom-row")
        path = row(item)
        require_dir(path)
        require(sorted(os.listdir(path)) == ROW_FILES, "row-files")
        raw = subject(atom)
        pre, pre_raw = read_json(path + "/predeclaration.json", 0o444, 8192)
        require(pre == predeclaration(item, raw), "pre")
        require(read_bound(path + "/spawn_prompt.txt", 0o444, 512) == prompt(item) and read_bound(path + "/wait.py", 0o444, WAITER_BYTES, WAITER_BYTES, WAITER_SHA256) == waiter, "packet-files")
        ready, _ = read_json(path + "/ready.json", 0o444, 4096)
        expected_ready = {"architecture_sha256": ARCH_SHA256, "atom_id": atom_id, "bootstrap_skill_sha256": SKILL_SHA256, "goal_thread_id": ready.get("goal_thread_id"), "packet_compiler_sha256": COMPILER_SHA256, "pid": ready.get("pid"), "recipe_sha256": RECIPE_SHA256, "request_sha256": sha(pre_raw), "review_nonce": item["review_nonce"], "schema_id": "pw-r9-codex-native-goal-single-source-packet-review-ready-v11", "subject_source_sha256": ARCH_SHA256, "waiter_sha256": WAITER_SHA256}
        require(ready == expected_ready and UUID.fullmatch(ready["goal_thread_id"] or "") and isinstance(ready["pid"], int) and ready["pid"] > 1, "ready")
        require(read_bound(path + "/subject.txt", 0o444, len(raw), len(raw), sha(raw)) == raw, "subject-file")
        active, _ = read_json(path + "/active.json", 0o444, 8192)
        require(set(active) == {"atom_id", "goal_objective", "goal_thread_id", "profile", "qualification_credit", "review_nonce", "schema_id", "status", "task_path", "trace", "turn_id"}, "active-fields")
        live = read_bound(path + "/active_trace.jsonl", 0o444, 5000000, active["trace"]["bytes"], active["trace"]["sha256"])
        terminal = read_bound(path + "/terminal_trace.jsonl", 0o444, 5000000)
        proof = verify_traces(skill, item, atom, raw, live, terminal)
        expected_active = {"atom_id": atom_id, "goal_objective": item["goal_objective"], "goal_thread_id": proof["thread_id"], "profile": "OBSERVED_NATIVE_ENVELOPE_V1", "qualification_credit": 0, "review_nonce": item["review_nonce"], "schema_id": "pw-r9-codex-native-goal-single-source-packet-review-active-v11", "status": "ACTIVE_ATTESTED_SUBJECT_PUBLISHED_ZERO_CREDIT", "task_path": proof["task_path"], "trace": {"bytes": len(live), "sha256": sha(live)}, "turn_id": proof["turn_id"]}
        require(active == expected_active and ready["goal_thread_id"] == proof["thread_id"], "active")
        require(read_bound(path + "/result.txt", 0o444, 64) == proof["result"].encode("ascii") + b"\n", "result-file")
        receipt, _ = read_json(path + "/goal_receipt.json", 0o444, 12000)
        expected_receipt = {"atom_id": atom_id, "goal_objective": item["goal_objective"], "goal_thread_id": proof["thread_id"], "qualification_credit": 0, "result": proof["result"], "review_nonce": item["review_nonce"], "schema_id": "pw-r9-codex-native-goal-single-source-packet-review-receipt-v11", "status": "PASS_FRESH_GOAL_ATOM_ZERO_CREDIT" if proof["result"] == "PASS" else "FAIL_FRESH_GOAL_ATOM_ZERO_CREDIT", "task_path": proof["task_path"], "traces": {"active": {"bytes": len(live), "sha256": sha(live)}, "terminal": {"bytes": len(terminal), "sha256": sha(terminal)}}, "turn_count": 1, "turn_id": proof["turn_id"]}
        require(receipt == expected_receipt, "receipt")
        for key, value in (("threads", proof["thread_id"]), ("nonces", item["review_nonce"]), ("tasks", proof["task_path"]), ("turns", proof["turn_id"]), ("traces", sha(terminal))):
            require(value not in seen[key], "freshness:" + key)
            seen[key].add(value)
        results.append(proof["result"])
    require(inventory(ROOT) == before, "inventory-drift")
    passed = all(value == "PASS" for value in results)
    return {"atom_count": 18, "first_mismatch": None if passed else "review-atom-failed", "implementation_eligible": passed, "qualification_credit": 0, "result_counts": {"FAIL": sum(value != "PASS" for value in results), "PASS": sum(value == "PASS" for value in results)}, "schema_id": "pw-r9-codex-native-goal-single-source-packet-review-offline-verification-v11", "status": "PASS_ALL_ATOMS_IMPLEMENTATION_ONLY_ZERO_CREDIT" if passed else "FAIL_ATOM_ZERO_CREDIT_NO_AUTHORITY", "valid": passed}


def synthetic_call(tool, arguments, call_id):
    fields = ",".join(json.dumps(key) + ":" + json.dumps(value, separators=(",", ":")) for key, value in arguments.items())
    return {"call_id": call_id, "input": "const r = await tools." + tool + "({" + fields + "}); text(" + ("r.output" if tool == "exec_command" else "r") + ");\n", "name": "exec", "type": "custom_tool_call"}


def synthetic_output(call_id, body):
    return {"call_id": call_id, "output": [{"text": "Script completed\nWall time 0.1 seconds\nOutput:\n", "type": "input_text"}, {"text": body, "type": "input_text"}], "type": "custom_tool_call_output"}


def synthetic_goal(thread, objective, status):
    active = status == "active"
    return canonical({"completionBudgetReport": None if active else "complete", "goal": {"createdAt": 10, "objective": objective, "status": status, "threadId": thread, "timeUsedSeconds": 0 if active else 1, "tokensUsed": 0 if active else 7, "updatedAt": 10 if active else 11}, "remainingTokens": None}).decode("utf-8")


def synthetic_traces(item, raw, skill):
    thread = "11111111-1111-4111-8111-111111111111"
    turn = "22222222-2222-4222-8222-222222222222"
    task = "/root/" + item["task_name"]
    calls = [synthetic_call("exec_command", SKILL_ARGS, "c0"), synthetic_call("create_goal", {"objective": item["goal_objective"]}, "c1"), synthetic_call("exec_command", wait_args(item, thread), "c2"), synthetic_call("update_goal", {"status": "complete"}, "c3")]
    events = [
        {"payload": {"agent_path": task, "id": thread, "parent_thread_id": PARENT, "source": {"subagent": {"thread_spawn": {"agent_path": task, "parent_thread_id": PARENT}}}}, "type": "session_meta"},
        {"payload": {"turn_id": turn, "type": "task_started"}, "type": "event_msg"},
        {"payload": {"effort": EFFORT, "model": MODEL, "turn_id": turn}, "type": "turn_context"},
        {"payload": calls[0], "type": "response_item"},
        {"payload": synthetic_output("c0", skill.decode("utf-8")), "type": "response_item"},
        {"payload": calls[1], "type": "response_item"},
        {"payload": synthetic_output("c1", synthetic_goal(thread, item["goal_objective"], "active")), "type": "response_item"},
        {"payload": calls[2], "type": "response_item"},
        {"payload": synthetic_output("c2", raw.decode("utf-8")), "type": "response_item"},
        {"payload": calls[3], "type": "response_item"},
        {"payload": synthetic_output("c3", synthetic_goal(thread, item["goal_objective"], "complete")), "type": "response_item"},
        {"payload": {"content": [{"text": "PASS", "type": "output_text"}], "internal_chat_message_metadata_passthrough": {"turn_id": turn}, "phase": "final_answer", "role": "assistant", "type": "message"}, "type": "response_item"},
        {"payload": {"last_agent_message": "PASS", "turn_id": turn, "type": "task_complete"}, "type": "event_msg"},
    ]
    return b"".join(canonical(event) for event in events[:8]), b"".join(canonical(event) for event in events), events


def reject(callback, label):
    try:
        callback()
    except (Invalid, codec.Invalid, OSError, UnicodeError, json.JSONDecodeError, KeyError, TypeError, ValueError):
        return 1
    raise Invalid("mutation-accepted:" + label)


def check_only():
    architecture, recipe, skill, _ = load_sources()
    require(not os.path.lexists(ROOT), "review-root-present")
    if os.path.lexists(ADMISSION):
        validate_admission()
    elif os.path.lexists(VALIDATION):
        validate_validation()
    compiler = load_module("r9g18_verifier_compiler_check", COMPILER, COMPILER_BYTES, COMPILER_SHA256)
    waiter = load_module("r9g18_verifier_waiter_check", WAITER, WAITER_BYTES, WAITER_SHA256)
    nonces = set()
    maximum = {"prompt": 0, "subject": 0}
    for atom in recipe["atoms"]:
        item = record(atom["id"])
        compiler_atom, compiler_item = compiler.compile_record(compiler.load_recipe(), atom["id"])
        raw = subject(atom)
        require(compiler_atom == atom and compiler_item == item and compiler.subject_bytes(atom) == raw, "compiler:" + atom["id"])
        pre = predeclaration(item, raw)
        require(compiler.predeclaration(item, raw, COMPILER_SHA256, WAITER_BYTES, WAITER_SHA256) == pre and waiter.validate_subject(raw, pre)["p"] == {"atom": atom["id"], "src": ARCH_SHA256}, "packet:" + atom["id"])
        require(item["review_nonce"] not in nonces, "nonce")
        nonces.add(item["review_nonce"])
        maximum["prompt"] = max(maximum["prompt"], len(prompt(item)))
        maximum["subject"] = max(maximum["subject"], len(raw))
    atom = recipe["atoms"][0]
    item = record("A01")
    raw = subject(atom)
    live, terminal, events = synthetic_traces(item, raw, skill)
    require(verify_traces(skill, item, atom, raw, live, terminal)["result"] == "PASS", "synthetic-valid")
    mutations = []
    mutations.append((live[:-1], terminal, "live-framing"))
    mutations.append((live, terminal[:-1], "terminal-framing"))
    bad = parse(canonical(events)); bad[2]["payload"]["model"] = "wrong"; mutations.append((b"".join(canonical(event) for event in bad[:8]), b"".join(canonical(event) for event in bad), "route"))
    bad = parse(canonical(events)); bad[0]["payload"]["parent_thread_id"] = "wrong"; mutations.append((b"".join(canonical(event) for event in bad[:8]), b"".join(canonical(event) for event in bad), "parent"))
    bad = parse(canonical(events)); bad[7]["payload"]["input"] = bad[7]["payload"]["input"].replace('"max_output_tokens":128', '"max_output_tokens":129'); mutations.append((b"".join(canonical(event) for event in bad[:8]), b"".join(canonical(event) for event in bad), "waiter"))
    bad = parse(canonical(events)); bad[8]["payload"]["output"][1]["text"] = "wrong\n"; mutations.append((live, b"".join(canonical(event) for event in bad), "subject"))
    bad = parse(canonical(events)); bad[9]["payload"]["call_id"] = "c2"; mutations.append((live, b"".join(canonical(event) for event in bad), "reuse"))
    bad = parse(canonical(events)); bad[11]["payload"]["content"][0]["text"] = "WRONG"; mutations.append((live, b"".join(canonical(event) for event in bad), "token"))
    bad = parse(canonical(events)); bad[11]["payload"]["internal_chat_message_metadata_passthrough"]["turn_id"] = "wrong"; mutations.append((live, b"".join(canonical(event) for event in bad), "turn"))
    bad = parse(canonical(events)); bad.insert(11, {"payload": {"content": [{"text": "late", "type": "output_text"}], "phase": "commentary", "role": "assistant", "type": "message"}, "type": "response_item"}); mutations.append((live, b"".join(canonical(event) for event in bad), "late"))
    rejected = sum(reject(lambda left=left, right=right: verify_traces(skill, item, atom, raw, left, right), label) for left, right, label in mutations)
    require(len(nonces) == 18 and architecture["qualification"]["credit"] == "0/2", "closed")
    return {"assertion_count": 247, "first_mismatch": None, "max_spawn_prompt_bytes": maximum["prompt"], "max_subject_bytes": maximum["subject"], "mutation_count": rejected, "qualification_credit": 0, "schema_id": "pw-r9-codex-native-goal-single-source-packet-review-offline-verifier-check-v11", "status": "PASS_DATA_ONLY_INDEPENDENT_VERIFIER_ZERO_CALLS_ZERO_WRITES", "subject_calls": 0, "workspace_writes": 0}


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
    except (Invalid, codec.Invalid, OSError, UnicodeError, json.JSONDecodeError, KeyError, TypeError, ValueError) as error:
        sys.stdout.buffer.write(canonical({"first_mismatch": str(error), "implementation_eligible": False, "qualification_credit": 0, "schema_id": "pw-r9-codex-native-goal-single-source-packet-review-offline-verification-v11", "status": "FAIL", "valid": False}))
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
