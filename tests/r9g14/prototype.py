#!/usr/bin/env python3
import ast
import copy
import hashlib
import importlib.util
import itertools
import json
import math
import os
import re
import stat
import sys

sys.dont_write_bytecode = True
HERE = "/mnt/Cursor/PuppetMaster/tests/r9g14"
RECIPE_PATH = HERE + "/prototype_recipe.json"
RECIPE_BYTES = 3329
RECIPE_SHA256 = "9cf8fa1af560887dd1aff3a8a054e0f0bfddf87178acb32648df1a2a1ab8906b"
ROUTES = ("slot-alpha", "slot-bravo", "slot-charlie")
EXPECTED_ROSTER = [
    {"model": "gpt-5.4-mini", "reasoning_effort": "xhigh", "route": "slot-alpha", "route_code": "a"},
    {"model": "gpt-5.4-mini", "reasoning_effort": "medium", "route": "slot-bravo", "route_code": "b"},
    {"model": "gpt-5.6-luna", "reasoning_effort": "medium", "route": "slot-charlie", "route_code": "c"},
]
HEX_RE = re.compile(r"^[0-9a-f]{64}$")
UUID_RE = re.compile(r"^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$")
WRAPPER_PREFIX_RE = re.compile(r"\AScript completed\nWall time ([0-9]+(?:\.[0-9]+)?) seconds\nOutput:\n\Z")


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


def canonical(value):
    return json.dumps(value, ensure_ascii=False, allow_nan=False, sort_keys=True, separators=(",", ":")).encode("utf-8")


def sha(raw):
    return hashlib.sha256(raw).hexdigest()


def meta(info):
    return (info.st_dev, info.st_ino, info.st_mode, info.st_uid, info.st_nlink, info.st_size, info.st_mtime_ns)


def read_bound(path, mode, cap, expected_bytes=None, expected_sha=None):
    before = os.lstat(path)
    require(stat.S_ISREG(before.st_mode) and stat.S_IMODE(before.st_mode) == mode, "custody:" + path)
    require(before.st_uid == os.getuid() and before.st_nlink == 1 and before.st_size <= cap, "owner-size:" + path)
    if expected_bytes is not None:
        require(before.st_size == expected_bytes, "bytes:" + path)
    fd = os.open(path, os.O_RDONLY | os.O_NOFOLLOW | os.O_CLOEXEC)
    try:
        require(meta(os.fstat(fd)) == meta(before), "open-race:" + path)
        raw = b""
        while len(raw) < before.st_size:
            chunk = os.read(fd, before.st_size - len(raw))
            require(bool(chunk), "short-read:" + path)
            raw += chunk
        require(os.read(fd, 1) == b"", "trailing-read:" + path)
    finally:
        os.close(fd)
    require(meta(os.lstat(path)) == meta(before), "drift:" + path)
    if expected_sha is not None:
        require(sha(raw) == expected_sha, "sha:" + path)
    return raw


def load_module(name, binding):
    read_bound(binding["path"], int(binding["mode"], 8), binding["bytes"], binding["bytes"], binding["sha256"])
    spec = importlib.util.spec_from_file_location(name, binding["path"])
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def load():
    raw = read_bound(RECIPE_PATH, 0o644, RECIPE_BYTES, RECIPE_BYTES, RECIPE_SHA256)
    recipe = parse(raw)
    require(raw == canonical(recipe) + b"\n", "recipe-canonical")
    require(recipe["schema_id"] == "pw-r9-codex-native-goal-single-turn-blocking-mailbox-prototype-recipe-v7", "recipe-schema")
    require(recipe["status"] == "DATA_ONLY_PROTOTYPE_ZERO_CREDIT_NO_LAUNCH_AUTHORITY", "recipe-status")
    require(recipe["authority"] == {"canary_launch": False, "implementation_freeze": False, "matrix_launch": False, "qualification": False, "release": False, "subject_launch": False}, "recipe-authority")
    require(recipe["qualification"] == {"canary_credit": 0, "clean_full_matrix_streak": 0, "credit": "0/2", "required_consecutive_clean_full_matrices": 2, "sequence": ["C03", "013", "014"]}, "recipe-qualification")
    require(recipe["roster"] == EXPECTED_ROSTER, "recipe-roster")
    require(all(recipe["failure_contract"][key] == 0 for key in ("best_of", "relaunch", "replacement", "resend", "retry", "reuse")), "recipe-no-retry")
    for key, binding in recipe["bindings"].items():
        read_bound(binding["path"], int(binding["mode"], 8), binding["bytes"], binding["bytes"], binding["sha256"])
        require(key != "private_scorer", "private-binding")
    waiter_raw = read_bound(
        recipe["bindings"]["waiter"]["path"],
        0o644,
        recipe["bindings"]["waiter"]["bytes"],
        recipe["bindings"]["waiter"]["bytes"],
        recipe["bindings"]["waiter"]["sha256"],
    )
    ast.parse(waiter_raw, filename=recipe["bindings"]["waiter"]["path"])
    require(b"expected_result_sha256" not in waiter_raw and b"private_scorer" not in waiter_raw, "waiter-private")
    source = load_module("r9g14_source_materializer", recipe["bindings"]["source_materializer"])
    source_recipe, public = source.load_recipe()
    return recipe, source, source_recipe, public


def transformed_record(source, record, matrix_code, spec):
    preimage = b"pw-r9-single-turn-blocking-v7\0" + matrix_code.encode("ascii") + b"\0" + record["execution_nonce"].encode("ascii")
    nonce = sha(preimage)
    attempt_id = sha(b"pw-r9-single-turn-blocking-v7-attempt\0" + nonce.encode("ascii"))[:24]
    objective = "CG7|m={}|w={:04d}|r={}|x={}|once".format(matrix_code, record["wave_index"], record["route_code"], nonce)
    value = copy.deepcopy(record)
    value.update({
        "attempt_id": attempt_id,
        "execution_nonce": nonce,
        "goal_objective": objective,
        "matrix_code": matrix_code,
        "matrix_id": spec["matrix_id"],
        "schema_id": "pw-r9-codex-native-goal-single-turn-blocking-schedule-row-v1",
        "source_execution_nonce": record["execution_nonce"],
        "task_name": "r9_cg7_" + nonce,
    })
    require(len(objective.encode("utf-8")) <= 256 and HEX_RE.fullmatch(nonce) is not None, "transformed-objective")
    return value


def build_schedules(recipe, source, source_recipe, public):
    schedules = {}
    all_nonces = set()
    all_attempts = set()
    for matrix_code in recipe["qualification"]["sequence"]:
        spec = recipe["matrix_map"][matrix_code]
        source_records = source.build_schedule(source_recipe, public, spec["source_matrix_code"])
        records = [transformed_record(source, record, matrix_code, spec) for record in source_records]
        require(len(records) == spec["subject_task_count"], "schedule-count:" + matrix_code)
        require([record["wave_index"] for record in records[::3]] == list(range(spec["wave_count"])), "schedule-waves:" + matrix_code)
        require(all(tuple(records[index + offset]["route"] for offset in range(3)) == ROUTES for index in range(0, len(records), 3)), "schedule-routes:" + matrix_code)
        roster = {item["route"]: item for item in recipe["roster"]}
        require(all(
            record["route_code"] == roster[record["route"]]["route_code"]
            and record["model_requested"] == roster[record["route"]]["model"]
            and record["reasoning_effort_requested"] == roster[record["route"]]["reasoning_effort"]
            for record in records
        ), "schedule-roster:" + matrix_code)
        local_nonces = {record["execution_nonce"] for record in records}
        local_attempts = {record["attempt_id"] for record in records}
        require(len(local_nonces) == len(records) and len(local_attempts) == len(records), "schedule-local-unique:" + matrix_code)
        require(not (all_nonces & local_nonces) and not (all_attempts & local_attempts), "schedule-global-unique:" + matrix_code)
        all_nonces |= local_nonces
        all_attempts |= local_attempts
        schedules[matrix_code] = records
    return schedules


def longest_result(contract):
    if contract["kind"] == "exact_set":
        return max(contract["values"], key=lambda value: len(value.encode("utf-8")))
    require(contract["kind"] == "regex" and contract["pattern"] == "[A-Za-z0-9._:-]+", "contract-regex")
    return "x" * contract["max_bytes"]


def hint_for(node, contract):
    if contract["kind"] != "exact_set" or contract["token_mode"] != "ALIAS":
        return "direct"
    if node["kind"] in {"FINAL_OPTION_SELECTOR", "FINAL_EDGE_VERDICT", "FINAL_TENSION_VERDICT"}:
        return "/".join(chr(65 + index) for index in range(len(contract["values"]))) + "=index(p.o)"
    return ",".join("{}={}".format(chr(65 + index), value) for index, value in enumerate(contract["values"]))


def exhaustive_cases(recipe, source, source_recipe, public):
    public_dir = os.path.dirname(source_recipe["bindings"]["public_plan"]["path"])
    maximum_case = (0, None, None)
    maximum_payload = 0
    contracts = {}
    node_count = 0
    for entry in public["cells"]:
        binding = entry["cell_file"]
        raw = source.read_bound(public_dir + "/" + binding["path"], 0o644, 500000, binding["bytes"], binding["sha256"])
        cell = source.parse(raw)
        prior = {}
        for node in cell["nodes"]:
            results = [prior[item] for item in node["dependencies"]]
            payload = source.replace_template(node["subject_template"]["canonical_json_template"], results) if node["dynamic"] else source.static_payload(node)
            payload_bytes = len(source.canon(payload))
            maximum_payload = max(maximum_payload, payload_bytes)
            require(payload_bytes <= recipe["limits"]["subject_payload_utf8_bytes_max"], "payload-limit")
            contract = source.result_contract(node, cell)
            contract_raw = canonical(contract)
            contract_sha = sha(contract_raw)
            require(HEX_RE.fullmatch(contract_sha) is not None, "contract-sha")
            contracts[(cell["route"], cell["cell_index"], node["atom_id"])] = contract_sha
            case = {
                "c": node["acceptance_criterion"]["utf8"],
                "p": payload,
                "q": node["output_contract"]["utf8"],
                "r": "TOKEN",
                "v": 2,
                "z": hint_for(node, contract),
            }
            case_raw = canonical(case) + b"\n"
            require(case_raw.count(b"\n") == 1 and b"\r" not in case_raw, "case-framing")
            require(len(case_raw) <= recipe["limits"]["subject_line_utf8_bytes_max"], "case-limit")
            if len(case_raw) > maximum_case[0]:
                maximum_case = (len(case_raw), cell["cell"], node["atom_id"])
            prior[node["atom_id"]] = longest_result(contract)
            node_count += 1
    require(node_count == 15612 and maximum_case[0] <= 512 and maximum_payload <= 170, "case-total")
    return node_count, maximum_case, maximum_payload, contracts


def spawn_prompt(record, matrix_code):
    workdir = "/mnt/Cursor/PuppetMaster/tests/r9g14/r/{}/{:04d}/{}/{}".format(matrix_code, record["wave_index"], record["route_code"], record["execution_nonce"])
    text = (
        "create_goal objective=" + json.dumps(record["goal_objective"]) + " first; require ACTIVE. "
        "exec_command cmd=" + json.dumps("python3 -B wait.py THREAD_ID") + " workdir=" + json.dumps(workdir) +
        " yield=30000 max=128; replace THREAD_ID only. Use separate tool calls. No other tool/retry. Obey stdout; update_goal complete; final token only."
    )
    return text.encode("utf-8"), workdir


def predeclaration(recipe, record, matrix_code, contract_sha, subject):
    waiter = recipe["bindings"]["waiter"]
    value = {
        "execution_nonce": record["execution_nonce"],
        "goal_objective": record["goal_objective"],
        "matrix_code": matrix_code,
        "matrix_id": record["matrix_id"],
        "model_requested": record["model_requested"],
        "reasoning_effort_requested": record["reasoning_effort_requested"],
        "result_contract_sha256": contract_sha,
        "route": record["route"],
        "route_code": record["route_code"],
        "schema_id": "pw-r9-codex-native-goal-single-turn-blocking-predeclaration-v2",
        "subject_bytes": len(subject),
        "subject_sha256": sha(subject),
        "task_path": "/root/" + record["task_name"],
        "waiter_bytes": waiter["bytes"],
        "waiter_sha256": waiter["sha256"],
        "wave_index": record["wave_index"],
    }
    require(sorted(value) == sorted(recipe["predeclaration_fields"]), "predeclaration-fields")
    require(not any("expected" in key or "answer" in key or "scorer" in key for key in value), "predeclaration-private")
    require(HEX_RE.fullmatch(value["result_contract_sha256"]) is not None, "predeclaration-contract")
    return value


def goal_output(thread_id, objective, status):
    complete = status == "complete"
    value = {
        "goal": {
            "createdAt": 100,
            "objective": objective,
            "status": status,
            "threadId": thread_id,
            "timeUsedSeconds": 1 if complete else 0,
            "tokensUsed": 17 if complete else 0,
            "updatedAt": 101 if complete else 100,
        },
        "remainingTokens": None,
        "completionBudgetReport": "Goal achieved." if complete else None,
    }
    return canonical(value).decode("utf-8")


def direct_events(thread_id, turn_id, objective, wait_args, subject, result, model, effort):
    return [
        {"type": "session_meta", "payload": {"id": thread_id}},
        {"type": "event_msg", "payload": {"type": "task_started"}},
        {"type": "turn_context", "payload": {"turn_id": turn_id, "model": model, "effort": effort}},
        {"type": "response_item", "payload": {"type": "function_call", "name": "create_goal", "call_id": "c1", "arguments": canonical({"objective": objective}).decode()}},
        {"type": "response_item", "payload": {"type": "function_call_output", "call_id": "c1", "output": goal_output(thread_id, objective, "active")}},
        {"type": "response_item", "payload": {"type": "function_call", "name": "exec_command", "call_id": "c2", "arguments": canonical(wait_args).decode()}},
        {"type": "response_item", "payload": {"type": "function_call_output", "call_id": "c2", "output": canonical({"exit_code": 0, "output": subject.decode("utf-8"), "wall_time_seconds": 1.0}).decode()}},
        {"type": "response_item", "payload": {"type": "function_call", "name": "update_goal", "call_id": "c3", "arguments": canonical({"status": "complete"}).decode()}},
        {"type": "response_item", "payload": {"type": "function_call_output", "call_id": "c3", "output": goal_output(thread_id, objective, "complete")}},
        {"type": "response_item", "payload": {"type": "message", "phase": "final_answer", "content": [{"type": "output_text", "text": result}]}},
        {"type": "event_msg", "payload": {"type": "task_complete", "last_agent_message": result}},
    ]


def exec_input(tool, arguments, style="canonical"):
    require(style in {"canonical", "observed"}, "exec-input-style")
    if style == "observed":
        if tool == "create_goal":
            return "const r = await tools.create_goal({objective:" + json.dumps(arguments["objective"], ensure_ascii=False, separators=(",", ":")) + "}); text(r);\n"
        if tool == "exec_command":
            body = "{cmd:" + json.dumps(arguments["cmd"], ensure_ascii=False, separators=(",", ":"))
            body += ",workdir:" + json.dumps(arguments["workdir"], ensure_ascii=False, separators=(",", ":"))
            body += ",yield_time_ms:" + str(arguments["yield_time_ms"])
            body += ",max_output_tokens:" + str(arguments["max_output_tokens"]) + "}"
            return "const r = await tools.exec_command(" + body + "); text(r.output); if (r.session_id) text(JSON.stringify(r));\n"
        require(tool == "update_goal", "exec-input-tool")
        return "const r = await tools.update_goal({status:" + json.dumps(arguments["status"]) + "}); text(r);\n"
    if tool == "create_goal":
        return "const r = await tools.create_goal(" + canonical(arguments).decode() + ");\ntext(r);\n"
    if tool == "exec_command":
        return "const r = await tools.exec_command(" + canonical(arguments).decode() + ");\ntext(r.output);\nif (r.session_id) text(JSON.stringify(r));\n"
    require(tool == "update_goal", "exec-input-tool")
    return "const r = await tools.update_goal(" + canonical(arguments).decode() + ");\ntext(r);\n"


def wrapped_output(text):
    return [{"type": "input_text", "text": "Script completed\nWall time 0.0 seconds\nOutput:\n"}, {"type": "input_text", "text": text}]


def wrapped_events(thread_id, turn_id, objective, wait_args, subject, result, model, effort):
    return [
        {"type": "session_meta", "payload": {"id": thread_id}},
        {"type": "event_msg", "payload": {"type": "task_started"}},
        {"type": "turn_context", "payload": {"turn_id": turn_id, "model": model, "effort": effort}},
        {"type": "response_item", "payload": {"type": "custom_tool_call", "name": "exec", "call_id": "c1", "input": exec_input("create_goal", {"objective": objective}, "observed")}},
        {"type": "response_item", "payload": {"type": "custom_tool_call_output", "call_id": "c1", "output": wrapped_output(goal_output(thread_id, objective, "active"))}},
        {"type": "response_item", "payload": {"type": "custom_tool_call", "name": "exec", "call_id": "c2", "input": exec_input("exec_command", wait_args, "observed")}},
        {"type": "response_item", "payload": {"type": "custom_tool_call_output", "call_id": "c2", "output": wrapped_output(subject.decode("utf-8"))}},
        {"type": "response_item", "payload": {"type": "custom_tool_call", "name": "exec", "call_id": "c3", "input": exec_input("update_goal", {"status": "complete"}, "observed")}},
        {"type": "response_item", "payload": {"type": "custom_tool_call_output", "call_id": "c3", "output": wrapped_output(goal_output(thread_id, objective, "complete"))}},
        {"type": "response_item", "payload": {"type": "message", "phase": "final_answer", "content": [{"type": "output_text", "text": result}]}},
        {"type": "event_msg", "payload": {"type": "task_complete", "last_agent_message": result}},
    ]


def parse_goal(raw, thread_id, objective, status):
    value = parse(raw.encode("utf-8"))
    require(isinstance(value, dict) and set(value) == {"goal", "remainingTokens", "completionBudgetReport"} and isinstance(value.get("goal"), dict), "goal-output")
    goal = value["goal"]
    require(set(goal) == {"createdAt", "objective", "status", "threadId", "timeUsedSeconds", "tokensUsed", "updatedAt"}, "goal-fields")
    require(goal.get("threadId") == thread_id and goal.get("objective") == objective and goal.get("status") == status, "goal-bind:" + status)
    require(all(isinstance(goal[key], int) and not isinstance(goal[key], bool) and goal[key] >= 0 for key in ("createdAt", "updatedAt", "timeUsedSeconds", "tokensUsed")), "goal-counters")
    require(goal["updatedAt"] >= goal["createdAt"] and value["remainingTokens"] is None, "goal-time")
    if status == "active":
        require(goal["tokensUsed"] == 0 and goal["timeUsedSeconds"] == 0 and value["completionBudgetReport"] is None, "goal-active-state")
    else:
        require(status == "complete" and isinstance(value["completionBudgetReport"], str) and bool(value["completionBudgetReport"]), "goal-complete-state")


def wrapper_text(payload):
    output = payload.get("output")
    require(isinstance(output, list) and len(output) == 2, "wrapper-output")
    require(isinstance(output[0], dict) and set(output[0]) == {"type", "text"} and output[0]["type"] == "input_text", "wrapper-prefix-shape")
    match = WRAPPER_PREFIX_RE.fullmatch(output[0]["text"])
    require(match is not None and float(match.group(1)) <= 300.0, "wrapper-prefix")
    require(isinstance(output[1], dict) and set(output[1]) == {"type", "text"} and output[1]["type"] == "input_text", "wrapper-text")
    return output[1]["text"]


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


def normalize_live(events, profile, expected):
    require(isinstance(events, list) and all(isinstance(event, dict) and set(event) == {"type", "payload"} and isinstance(event["payload"], dict) for event in events), "live-envelope")
    require(events[0] == {"type": "session_meta", "payload": {"id": expected["thread_id"]}}, "live-session")
    require(sum(event["type"] == "session_meta" for event in events) == 1, "live-session-count")
    require(sum(event["type"] == "event_msg" and event["payload"].get("type") == "task_started" for event in events) == 1, "live-task-start")
    require(sum(event["type"] == "turn_context" for event in events) == 1, "live-turn-count")
    require(not any(event["type"] == "event_msg" and event["payload"].get("type") == "task_complete" for event in events), "live-task-complete")
    require(not any(event["type"] == "response_item" and event["payload"].get("phase") == "final_answer" for event in events), "live-final")
    turn_index, turn = next((index, event["payload"]) for index, event in enumerate(events) if event["type"] == "turn_context")
    require(turn.get("turn_id") == expected["turn_id"] and turn.get("model") == expected["model"] and turn.get("effort") == expected["effort"], "live-turn")
    task_start_index = next(index for index, event in enumerate(events) if event["type"] == "event_msg" and event["payload"].get("type") == "task_started")
    indexed = [(index, event["payload"]) for index, event in enumerate(events) if event["type"] == "response_item" and event["payload"].get("type") in {"function_call", "function_call_output", "custom_tool_call", "custom_tool_call_output"}]
    require(len(indexed) == 3 and task_start_index < turn_index < indexed[0][0] < indexed[1][0] < indexed[2][0], "live-tool-order")
    create_call, create_output, wait_call = (item for _, item in indexed)
    if profile == "DIRECT_NATIVE_V1":
        require(create_call.get("type") == "function_call" and create_call.get("name") == "create_goal" and create_output.get("type") == "function_call_output", "live-direct-create")
        require(wait_call.get("type") == "function_call" and wait_call.get("name") == "exec_command", "live-direct-wait")
        require(parse(create_call["arguments"].encode("utf-8")) == expected["arguments"][0], "live-direct-create-args")
        require(parse(wait_call["arguments"].encode("utf-8")) == expected["arguments"][1], "live-direct-wait-args")
        active_text = create_output["output"]
    else:
        require(profile == "EXEC_WRAPPED_V1" and create_call.get("type") == "custom_tool_call" and create_call.get("name") == "exec" and create_output.get("type") == "custom_tool_call_output", "live-wrapped-create")
        require(wait_call.get("type") == "custom_tool_call" and wait_call.get("name") == "exec", "live-wrapped-wait")
        require(create_call["input"] in {exec_input("create_goal", expected["arguments"][0], "canonical"), exec_input("create_goal", expected["arguments"][0], "observed")}, "live-wrapped-create-input")
        require(wait_call["input"] in {exec_input("exec_command", expected["arguments"][1], "canonical"), exec_input("exec_command", expected["arguments"][1], "observed")}, "live-wrapped-wait-input")
        active_text = wrapper_text(create_output)
    require(create_call["call_id"] == create_output["call_id"] and create_call["call_id"] != wait_call["call_id"], "live-call-bind")
    parse_goal(active_text, expected["thread_id"], expected["objective"], "active")
    subject_text = expected["subject"].decode("utf-8")
    require(all(subject_text not in item for event in events for item in strings(event)), "live-subject-visible")
    return True


def normalize(events, profile, expected, live_events=None):
    if live_events is not None:
        require(events[:len(live_events)] == live_events, "terminal-live-prefix")
    require(isinstance(events, list) and all(isinstance(event, dict) and set(event) == {"type", "payload"} and isinstance(event["payload"], dict) for event in events), "event-envelope")
    require(sum(event["type"] == "session_meta" for event in events) == 1, "session-count")
    require(sum(event["type"] == "event_msg" and event["payload"].get("type") == "task_started" for event in events) == 1, "task-start-count")
    require(sum(event["type"] == "turn_context" for event in events) == 1, "turn-count")
    require(sum(event["type"] == "event_msg" and event["payload"].get("type") == "task_complete" for event in events) == 1, "task-complete-count")
    require(events[0] == {"type": "session_meta", "payload": {"id": expected["thread_id"]}}, "session")
    turn_index, turn = next((index, event["payload"]) for index, event in enumerate(events) if event["type"] == "turn_context")
    require(turn.get("turn_id") == expected["turn_id"] and UUID_RE.fullmatch(turn["turn_id"]) is not None, "turn-id")
    require(turn.get("model") == expected["model"] and turn.get("effort") == expected["effort"], "turn-route")
    task_start_index = next(index for index, event in enumerate(events) if event["type"] == "event_msg" and event["payload"].get("type") == "task_started")
    indexed_tools = [(index, event["payload"]) for index, event in enumerate(events) if event["type"] == "response_item" and event["payload"].get("type") in {"function_call", "function_call_output", "custom_tool_call", "custom_tool_call_output"}]
    tools = [item for _, item in indexed_tools]
    require(len(tools) == 6 and len({item["call_id"] for item in tools}) == 3, "tool-cardinality")
    require(task_start_index < turn_index < indexed_tools[0][0] and all(indexed_tools[index][0] < indexed_tools[index + 1][0] for index in range(5)), "event-order-prefix")
    pairs_by_call = [(tools[index], tools[index + 1]) for index in range(0, 6, 2)]
    expected_names = ("create_goal", "exec_command", "update_goal")
    outputs = []
    for index, (call, output) in enumerate(pairs_by_call):
        require(call["call_id"] == output["call_id"], "call-pair")
        if profile == "DIRECT_NATIVE_V1":
            require(call["type"] == "function_call" and call["name"] == expected_names[index] and output["type"] == "function_call_output", "direct-profile")
            arguments = parse(call["arguments"].encode("utf-8"))
            outputs.append(output["output"])
        else:
            require(profile == "EXEC_WRAPPED_V1" and call["type"] == "custom_tool_call" and call["name"] == "exec" and output["type"] == "custom_tool_call_output", "wrapped-profile")
            arguments = expected["arguments"][index]
            require(call["input"] in {exec_input(expected_names[index], arguments, "canonical"), exec_input(expected_names[index], arguments, "observed")}, "wrapped-input")
            outputs.append(wrapper_text(output))
        require(arguments == expected["arguments"][index], "arguments")
    parse_goal(outputs[0], expected["thread_id"], expected["objective"], "active")
    if profile == "DIRECT_NATIVE_V1":
        wait_value = parse(outputs[1].encode("utf-8"))
        require(set(wait_value).issubset({"chunk_id", "exit_code", "original_token_count", "output", "wall_time_seconds"}), "direct-wait-fields")
        require({"exit_code", "output", "wall_time_seconds"}.issubset(wait_value), "direct-wait-required")
        require(wait_value.get("exit_code") == 0 and wait_value.get("output") == expected["subject"].decode("utf-8") and "session_id" not in wait_value, "direct-wait")
    else:
        require(outputs[1].encode("utf-8") == expected["subject"], "wrapped-wait")
    parse_goal(outputs[2], expected["thread_id"], expected["objective"], "complete")
    finals = [event["payload"] for event in events if event["type"] == "response_item" and event["payload"].get("type") == "message" and event["payload"].get("phase") == "final_answer"]
    require(len(finals) == 1 and finals[0]["content"] == [{"type": "output_text", "text": expected["result"]}], "final")
    final_index = next(index for index, event in enumerate(events) if event["type"] == "response_item" and event["payload"].get("type") == "message" and event["payload"].get("phase") == "final_answer")
    task_complete_index = next(index for index, event in enumerate(events) if event["type"] == "event_msg" and event["payload"].get("type") == "task_complete")
    require(indexed_tools[-1][0] < final_index < task_complete_index and task_complete_index == len(events) - 1, "event-order-terminal")
    require(events[task_complete_index]["payload"].get("last_agent_message") == expected["result"], "task-final")
    return True


def expect_reject(callback, label):
    try:
        callback()
    except Exception:
        return
    raise Invalid("mutation-accepted:" + label)


def run():
    recipe, source, source_recipe, public = load()
    assertions = 12
    schedules = build_schedules(recipe, source, source_recipe, public)
    assertions += 9
    node_count, maximum_case, maximum_payload, contracts = exhaustive_cases(recipe, source, source_recipe, public)
    assertions += node_count + 3
    maximum_spawn = 0
    for matrix_code, records in schedules.items():
        for record in records:
            raw, workdir = spawn_prompt(record, matrix_code)
            maximum_spawn = max(maximum_spawn, len(raw))
            require(len(raw) <= recipe["limits"]["spawn_prompt_utf8_bytes_max"], "spawn-limit")
            require(record["execution_nonce"] in workdir and record["goal_objective"] not in workdir, "spawn-bind")
        assertions += len(records)
    sample = schedules["C03"][0]
    key = (sample["route"], sample["cell_index"], sample["atom_id"])
    subject = canonical({"c": "Return one token.", "p": {"op": "label", "x": "amber"}, "q": "token", "r": "TOKEN", "v": 2, "z": "direct"}) + b"\n"
    pre = predeclaration(recipe, sample, "C03", contracts[key], subject)
    require(sorted(pre) == sorted(recipe["predeclaration_fields"]) and "expected_result_sha256" not in pre, "predeclaration-closed")
    assertions += 2
    thread_id = "10000000-0000-0000-0000-000000000001"
    turn_id = "20000000-0000-0000-0000-000000000001"
    wait_raw, workdir = spawn_prompt(sample, "C03")
    wait_args = {"cmd": "python3 -B wait.py " + thread_id, "workdir": workdir, "yield_time_ms": 30000, "max_output_tokens": 128}
    expected = {
        "arguments": ({"objective": sample["goal_objective"]}, wait_args, {"status": "complete"}),
        "effort": sample["reasoning_effort_requested"],
        "model": sample["model_requested"],
        "objective": sample["goal_objective"],
        "result": "amber",
        "subject": subject,
        "thread_id": thread_id,
        "turn_id": turn_id,
    }
    direct = direct_events(thread_id, turn_id, sample["goal_objective"], wait_args, subject, "amber", sample["model_requested"], sample["reasoning_effort_requested"])
    wrapped = wrapped_events(thread_id, turn_id, sample["goal_objective"], wait_args, subject, "amber", sample["model_requested"], sample["reasoning_effort_requested"])
    direct_live = copy.deepcopy(direct[:6])
    wrapped_live = copy.deepcopy(wrapped[:6])
    require(normalize_live(direct_live, "DIRECT_NATIVE_V1", expected) and normalize_live(wrapped_live, "EXEC_WRAPPED_V1", expected), "live-profile-pass")
    require(normalize(direct, "DIRECT_NATIVE_V1", expected, direct_live) and normalize(wrapped, "EXEC_WRAPPED_V1", expected, wrapped_live), "profile-pass")
    assertions += 4
    mutations = []
    extra = copy.deepcopy(direct)
    extra.insert(3, {"type": "response_item", "payload": {"type": "function_call", "name": "get_goal", "call_id": "x", "arguments": "{}"}})
    mutations.append((extra, "DIRECT_NATIVE_V1", "extra-get-goal"))
    second_turn = copy.deepcopy(wrapped)
    second_turn.insert(-1, {"type": "turn_context", "payload": {"turn_id": "30000000-0000-0000-0000-000000000001", "model": "gpt-5.6-luna", "effort": "medium"}})
    mutations.append((second_turn, "EXEC_WRAPPED_V1", "second-turn"))
    mixed = copy.deepcopy(direct)
    mixed[5:7] = wrapped[5:7]
    mutations.append((mixed, "DIRECT_NATIVE_V1", "mixed-profile"))
    wrong_thread = copy.deepcopy(direct)
    wrong_thread[4]["payload"]["output"] = goal_output("10000000-0000-0000-0000-000000000002", sample["goal_objective"], "active")
    mutations.append((wrong_thread, "DIRECT_NATIVE_V1", "wrong-thread"))
    yielded = copy.deepcopy(direct)
    yielded[6]["payload"]["output"] = canonical({"output": "", "session_id": 9}).decode()
    mutations.append((yielded, "DIRECT_NATIVE_V1", "session-yield"))
    wrong_subject = copy.deepcopy(wrapped)
    wrong_subject[6]["payload"]["output"][1]["text"] = "wrong\n"
    mutations.append((wrong_subject, "EXEC_WRAPPED_V1", "wrong-subject"))
    wrapper_drift = copy.deepcopy(wrapped)
    wrapper_drift[5]["payload"]["input"] += " "
    mutations.append((wrapper_drift, "EXEC_WRAPPED_V1", "wrapper-drift"))
    task_repeat = copy.deepcopy(direct) + [{"type": "event_msg", "payload": {"type": "task_complete", "last_agent_message": "amber"}}]
    mutations.append((task_repeat, "DIRECT_NATIVE_V1", "task-repeat"))
    wrong_route = copy.deepcopy(direct)
    wrong_route[2]["payload"]["effort"] = "medium"
    mutations.append((wrong_route, "DIRECT_NATIVE_V1", "wrong-route"))
    missing_start = copy.deepcopy(direct)
    del missing_start[1]
    mutations.append((missing_start, "DIRECT_NATIVE_V1", "missing-task-start"))
    terminal_reorder = copy.deepcopy(direct)
    terminal_reorder[-2], terminal_reorder[-1] = terminal_reorder[-1], terminal_reorder[-2]
    mutations.append((terminal_reorder, "DIRECT_NATIVE_V1", "terminal-reorder"))
    wrapper_time = copy.deepcopy(wrapped)
    wrapper_time[4]["payload"]["output"][0]["text"] = "Script completed\nWall time unknown\nOutput:\n"
    mutations.append((wrapper_time, "EXEC_WRAPPED_V1", "wrapper-time"))
    extra_goal = copy.deepcopy(direct)
    active_value = parse(extra_goal[4]["payload"]["output"].encode("utf-8"))
    active_value["goal"]["unbound"] = True
    extra_goal[4]["payload"]["output"] = canonical(active_value).decode("utf-8")
    mutations.append((extra_goal, "DIRECT_NATIVE_V1", "goal-extra-field"))
    for events, profile, label in mutations:
        expect_reject(lambda events=events, profile=profile: normalize(events, profile, expected), label)
    live_mutations = []
    live_output = copy.deepcopy(direct_live)
    live_output.append(copy.deepcopy(direct[6]))
    live_mutations.append((live_output, "DIRECT_NATIVE_V1", "live-wait-returned"))
    live_update = copy.deepcopy(wrapped_live)
    live_update.append(copy.deepcopy(wrapped[7]))
    live_mutations.append((live_update, "EXEC_WRAPPED_V1", "live-update"))
    live_route = copy.deepcopy(direct_live)
    live_route[2]["payload"]["model"] = "gpt-5.6-luna"
    live_mutations.append((live_route, "DIRECT_NATIVE_V1", "live-route"))
    live_subject = copy.deepcopy(wrapped_live)
    live_subject.insert(3, {"type": "response_item", "payload": {"type": "message", "phase": "commentary", "content": [{"type": "output_text", "text": subject.decode("utf-8")}]}})
    live_mutations.append((live_subject, "EXEC_WRAPPED_V1", "live-subject"))
    for events, profile, label in live_mutations:
        expect_reject(lambda events=events, profile=profile: normalize_live(events, profile, expected), label)
    output = {
        "assertion_count": assertions,
        "first_mismatch": None,
        "matrix_counts": {code: len(records) for code, records in schedules.items()},
        "max_complete_subject_line_bytes": maximum_case[0],
        "max_complete_subject_line_case": maximum_case[1] + "/" + maximum_case[2],
        "max_nested_payload_bytes": maximum_payload,
        "max_spawn_prompt_bytes": maximum_spawn,
        "mutation_count": len(mutations) + len(live_mutations),
        "node_count": node_count,
        "private_expected_answer_fields": 0,
        "qualification_credit": 0,
        "schema_id": "pw-r9-codex-native-goal-single-turn-blocking-mailbox-prototype-check-v7",
        "status": "PASS_DATA_ONLY_PROTOTYPE_ZERO_CALLS_ZERO_WRITES",
        "subject_calls": 0,
        "workspace_writes": 0,
    }
    sys.stdout.buffer.write(canonical(output) + b"\n")


def main():
    try:
        require(sys.argv == [sys.argv[0], "--check"], "cli")
        run()
    except Exception as exc:
        sys.stderr.write("FAIL:" + str(exc) + "\n")
        raise SystemExit(1)


if __name__ == "__main__":
    main()
