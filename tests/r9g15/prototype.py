#!/usr/bin/env python3
import copy
import hashlib
import importlib.util
import json
import os
import re
import stat
import sys

sys.dont_write_bytecode = True
HERE = "/mnt/Cursor/PuppetMaster/tests/r9g15"
RECIPE_PATH = HERE + "/prototype_recipe.json"
RECIPE_BYTES = 3193
RECIPE_SHA256 = "7452939ebde1ab82080d9b3c3889c8b276199a2ee948292142b945820c476db6"
ROUTES = ("slot-alpha", "slot-bravo", "slot-charlie")
EXPECTED_ROSTER = [
    {"model": "gpt-5.4-mini", "reasoning_effort": "xhigh", "route": "slot-alpha", "route_code": "a"},
    {"model": "gpt-5.4-mini", "reasoning_effort": "medium", "route": "slot-bravo", "route_code": "b"},
    {"model": "gpt-5.6-luna", "reasoning_effort": "medium", "route": "slot-charlie", "route_code": "c"},
]
HEX_RE = re.compile(r"^[0-9a-f]{64}$")
UUID_RE = re.compile(r"^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$")
TOKEN_RE = re.compile(r"^[A-Za-z0-9._:-]{1,48}$")


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


def parse(raw):
    return json.loads(raw.decode("utf-8"), object_pairs_hook=pairs, parse_constant=lambda value: (_ for _ in ()).throw(Invalid("nonfinite:" + value)))


def canonical(value):
    return json.dumps(value, ensure_ascii=False, allow_nan=False, sort_keys=True, separators=(",", ":")).encode("utf-8")


def sha(raw):
    return hashlib.sha256(raw).hexdigest()


def metadata(info):
    return (info.st_dev, info.st_ino, info.st_mode, info.st_uid, info.st_nlink, info.st_size, info.st_mtime_ns)


def read_bound(path, mode, cap, expected_bytes=None, expected_sha=None):
    before = os.lstat(path)
    require(stat.S_ISREG(before.st_mode) and stat.S_IMODE(before.st_mode) == mode, "read-custody:" + path)
    require(before.st_uid == os.getuid() and before.st_nlink == 1 and before.st_size <= cap, "read-size:" + path)
    if expected_bytes is not None:
        require(before.st_size == expected_bytes, "read-bytes:" + path)
    fd = os.open(path, os.O_RDONLY | os.O_NOFOLLOW | os.O_CLOEXEC)
    try:
        require(metadata(os.fstat(fd)) == metadata(before), "read-race:" + path)
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
    require(recipe["schema_id"] == "pw-r9-codex-native-goal-skill-aligned-blocking-mailbox-prototype-recipe-v8", "recipe-schema")
    require(recipe["status"] == "DATA_ONLY_PROTOTYPE_ZERO_CREDIT_NO_LAUNCH_AUTHORITY", "recipe-status")
    require(recipe["authority"] == {"canary_launch": False, "implementation_freeze": False, "matrix_launch": False, "qualification": False, "release": False, "subject_launch": False}, "recipe-authority")
    require(recipe["qualification"] == {"canary_credit": 0, "clean_full_matrix_streak": 0, "credit": "0/2", "required_consecutive_clean_full_matrices": 2, "sequence": ["C04", "015", "016"]}, "recipe-qualification")
    require(recipe["roster"] == EXPECTED_ROSTER, "recipe-roster")
    require(all(recipe["failure_contract"][key] == 0 for key in ("best_of", "relaunch", "replacement", "resend", "retry", "reuse")), "recipe-no-retry")
    for binding in recipe["bindings"].values():
        read_bound(binding["path"], int(binding["mode"], 8), binding["bytes"], binding["bytes"], binding["sha256"])
    base = load_module("r9g15_base_v7_prototype", recipe["bindings"]["base_v7_prototype"])
    _, source, source_recipe, public = base.load()
    return recipe, source, source_recipe, public


def transformed_record(source, record, matrix_code, spec):
    nonce = sha(b"pw-r9-skill-aligned-v8\0" + matrix_code.encode("ascii") + b"\0" + record["execution_nonce"].encode("ascii"))
    value = copy.deepcopy(record)
    value.update({
        "attempt_id": sha(b"pw-r9-skill-aligned-v8-attempt\0" + nonce.encode("ascii"))[:24],
        "execution_nonce": nonce,
        "goal_objective": "CG8|m={}|w={:04d}|r={}|x={}|once".format(matrix_code, record["wave_index"], record["route_code"], nonce),
        "matrix_code": matrix_code,
        "matrix_id": spec["matrix_id"],
        "schema_id": "pw-r9-codex-native-goal-skill-aligned-blocking-schedule-row-v1",
        "source_execution_nonce": record["execution_nonce"],
        "task_name": "r9_cg8_" + nonce,
    })
    require(len(value["goal_objective"].encode("utf-8")) <= 256 and HEX_RE.fullmatch(nonce), "record-objective")
    return value


def build_schedules(recipe, source, source_recipe, public):
    schedules = {}
    nonces = set()
    attempts = set()
    for code in recipe["qualification"]["sequence"]:
        spec = recipe["matrix_map"][code]
        records = [transformed_record(source, record, code, spec) for record in source.build_schedule(source_recipe, public, spec["source_matrix_code"])]
        require(len(records) == spec["subject_task_count"], "schedule-count:" + code)
        require([record["wave_index"] for record in records[::3]] == list(range(spec["wave_count"])), "schedule-waves:" + code)
        require(all(tuple(records[index + offset]["route"] for offset in range(3)) == ROUTES for index in range(0, len(records), 3)), "schedule-routes:" + code)
        roster = {item["route"]: item for item in recipe["roster"]}
        require(all((record["route_code"], record["model_requested"], record["reasoning_effort_requested"]) == (roster[record["route"]]["route_code"], roster[record["route"]]["model"], roster[record["route"]]["reasoning_effort"]) for record in records), "schedule-roster:" + code)
        local_nonces = {record["execution_nonce"] for record in records}
        local_attempts = {record["attempt_id"] for record in records}
        require(len(local_nonces) == len(records) and len(local_attempts) == len(records), "schedule-local-unique")
        require(nonces.isdisjoint(local_nonces) and attempts.isdisjoint(local_attempts), "schedule-global-unique")
        nonces.update(local_nonces)
        attempts.update(local_attempts)
        schedules[code] = records
    return schedules


def hint_for(node, contract):
    if contract["kind"] != "exact_set" or contract["token_mode"] != "ALIAS":
        return "direct"
    if node["kind"] in {"FINAL_OPTION_SELECTOR", "FINAL_EDGE_VERDICT", "FINAL_TENSION_VERDICT"}:
        return "/".join(chr(65 + index) for index in range(len(contract["values"]))) + "=index(p.o)"
    return ",".join("{}={}".format(chr(65 + index), value) for index, value in enumerate(contract["values"]))


def skill_arguments(recipe):
    return dict(recipe["skill_load"]["arguments"])


def spawn_prompt(record, matrix_code):
    workdir = "/mnt/Cursor/PuppetMaster/tests/r9g15/r/{}/{:04d}/{}/{}".format(matrix_code, record["wave_index"], record["route_code"], record["execution_nonce"])
    text = (
        "Use $r9-goal-atom-bootstrap; load once via exec_command cmd=" + json.dumps("sed -n 1,80p .agents/skills/r9-goal-atom-bootstrap/SKILL.md") +
        " workdir=/mnt/Cursor/PuppetMaster yield=10000 max=3000. objective=" + json.dumps(record["goal_objective"]) +
        " waiter=" + json.dumps(workdir) + ". Obey skill."
    )
    return text.encode("utf-8"), workdir


def predeclaration(recipe, record, matrix_code, contract_sha, subject):
    value = {
        "bootstrap_skill_bytes": recipe["bindings"]["bootstrap_skill"]["bytes"],
        "bootstrap_skill_sha256": recipe["bindings"]["bootstrap_skill"]["sha256"],
        "execution_nonce": record["execution_nonce"], "goal_objective": record["goal_objective"], "matrix_code": matrix_code,
        "matrix_id": record["matrix_id"], "model_requested": record["model_requested"],
        "reasoning_effort_requested": record["reasoning_effort_requested"], "result_contract_sha256": contract_sha,
        "route": record["route"], "route_code": record["route_code"],
        "schema_id": "pw-r9-codex-native-goal-skill-blocking-predeclaration-v3", "subject_bytes": len(subject),
        "subject_sha256": sha(subject), "task_path": "/root/" + record["task_name"],
        "waiter_bytes": recipe["bindings"]["waiter"]["bytes"], "waiter_sha256": recipe["bindings"]["waiter"]["sha256"],
        "wave_index": record["wave_index"],
    }
    require(sorted(value) == sorted(recipe["predeclaration_fields"]), "predeclaration-fields")
    require(not any("expected" in key or "answer" in key or "scorer" in key for key in value), "predeclaration-private")
    return value


def goal_output(thread_id, objective, status):
    complete = status == "complete"
    return canonical({
        "completionBudgetReport": "Goal achieved." if complete else None,
        "goal": {"createdAt": 100, "objective": objective, "status": status, "threadId": thread_id, "timeUsedSeconds": 1 if complete else 0, "tokensUsed": 17 if complete else 0, "updatedAt": 101 if complete else 100},
        "remainingTokens": None,
    }).decode("utf-8")


def exec_input(tool, arguments, style="canonical"):
    base = load_module("r9g15_exec_input_base", parse(read_bound(RECIPE_PATH, 0o644, RECIPE_BYTES))["bindings"]["base_v7_prototype"])
    return base.exec_input(tool, arguments, style)


def wrapped_output(text):
    return [{"type": "input_text", "text": "Script completed\nWall time 0.0 seconds\nOutput:\n"}, {"type": "input_text", "text": text}]


def direct_events(thread_id, turn_id, objective, skill_args, skill_text, wait_args, subject, result, model, effort):
    return [
        {"type": "session_meta", "payload": {"id": thread_id}},
        {"type": "event_msg", "payload": {"type": "task_started", "turn_id": turn_id}},
        {"type": "turn_context", "payload": {"effort": effort, "model": model, "turn_id": turn_id}},
        {"type": "response_item", "payload": {"arguments": canonical(skill_args).decode(), "call_id": "c0", "name": "exec_command", "type": "function_call"}},
        {"type": "response_item", "payload": {"call_id": "c0", "output": canonical({"exit_code": 0, "output": skill_text, "wall_time_seconds": 0.1}).decode(), "type": "function_call_output"}},
        {"type": "response_item", "payload": {"arguments": canonical({"objective": objective}).decode(), "call_id": "c1", "name": "create_goal", "type": "function_call"}},
        {"type": "response_item", "payload": {"call_id": "c1", "output": goal_output(thread_id, objective, "active"), "type": "function_call_output"}},
        {"type": "response_item", "payload": {"arguments": canonical(wait_args).decode(), "call_id": "c2", "name": "exec_command", "type": "function_call"}},
        {"type": "response_item", "payload": {"call_id": "c2", "output": canonical({"exit_code": 0, "output": subject.decode("utf-8"), "wall_time_seconds": 1.0}).decode(), "type": "function_call_output"}},
        {"type": "response_item", "payload": {"arguments": canonical({"status": "complete"}).decode(), "call_id": "c3", "name": "update_goal", "type": "function_call"}},
        {"type": "response_item", "payload": {"call_id": "c3", "output": goal_output(thread_id, objective, "complete"), "type": "function_call_output"}},
        {"type": "response_item", "payload": {"content": [{"text": result, "type": "output_text"}], "phase": "final_answer", "type": "message"}},
        {"type": "event_msg", "payload": {"last_agent_message": result, "turn_id": turn_id, "type": "task_complete"}},
    ]


def wrapped_events(thread_id, turn_id, objective, skill_args, skill_text, wait_args, subject, result, model, effort):
    calls = [("exec_command", skill_args, skill_text), ("create_goal", {"objective": objective}, goal_output(thread_id, objective, "active")), ("exec_command", wait_args, subject.decode("utf-8")), ("update_goal", {"status": "complete"}, goal_output(thread_id, objective, "complete"))]
    events = [
        {"type": "session_meta", "payload": {"id": thread_id}},
        {"type": "event_msg", "payload": {"type": "task_started", "turn_id": turn_id}},
        {"type": "turn_context", "payload": {"effort": effort, "model": model, "turn_id": turn_id}},
    ]
    for index, (tool, arguments, output) in enumerate(calls):
        call_id = "c" + str(index)
        events.append({"type": "response_item", "payload": {"call_id": call_id, "input": exec_input(tool, arguments, "observed"), "name": "exec", "type": "custom_tool_call"}})
        events.append({"type": "response_item", "payload": {"call_id": call_id, "output": wrapped_output(output), "type": "custom_tool_call_output"}})
    events.append({"type": "response_item", "payload": {"content": [{"text": result, "type": "output_text"}], "phase": "final_answer", "type": "message"}})
    events.append({"type": "event_msg", "payload": {"last_agent_message": result, "turn_id": turn_id, "type": "task_complete"}})
    return events


def wrapper_text(payload):
    output = payload.get("output")
    require(isinstance(output, list) and len(output) == 2 and output[0] == {"type": "input_text", "text": "Script completed\nWall time 0.0 seconds\nOutput:\n"}, "wrapper-prefix")
    require(isinstance(output[1], dict) and set(output[1]) == {"text", "type"} and output[1]["type"] == "input_text", "wrapper-output")
    return output[1]["text"]


def parse_goal(text, thread_id, objective, status):
    value = parse(text.encode("utf-8"))
    require(set(value) == {"completionBudgetReport", "goal", "remainingTokens"} and isinstance(value["goal"], dict), "goal-envelope")
    goal = value["goal"]
    require(set(goal) == {"createdAt", "objective", "status", "threadId", "timeUsedSeconds", "tokensUsed", "updatedAt"}, "goal-fields")
    require((goal["threadId"], goal["objective"], goal["status"]) == (thread_id, objective, status), "goal-bind")
    require(all(isinstance(goal[key], int) and not isinstance(goal[key], bool) and goal[key] >= 0 for key in ("createdAt", "updatedAt", "timeUsedSeconds", "tokensUsed")), "goal-counters")
    if status == "active":
        require(goal["tokensUsed"] == 0 and goal["timeUsedSeconds"] == 0 and value["completionBudgetReport"] is None, "goal-active")
    else:
        require(status == "complete" and isinstance(value["completionBudgetReport"], str) and value["completionBudgetReport"], "goal-complete")


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


def normalize(events, profile, expected, live=False):
    require(all(isinstance(event, dict) and set(event) == {"payload", "type"} and isinstance(event["payload"], dict) for event in events), "event-envelope")
    require(events[0] == {"type": "session_meta", "payload": {"id": expected["thread_id"]}}, "session")
    require(sum(event["type"] == "turn_context" for event in events) == 1, "turn-count")
    turn = next(event["payload"] for event in events if event["type"] == "turn_context")
    require((turn["turn_id"], turn["model"], turn["effort"]) == (expected["turn_id"], expected["model"], expected["effort"]), "turn")
    types = {"function_call", "function_call_output"} if profile == "DIRECT_NATIVE_V1" else {"custom_tool_call", "custom_tool_call_output"}
    tools = [event["payload"] for event in events if event["type"] == "response_item" and event["payload"].get("type") in types]
    require(len(tools) == (5 if live else 8), "tool-count")
    pairs_count = 2 if live else 4
    outputs = []
    names = ("exec_command", "create_goal", "exec_command", "update_goal")
    arguments = (expected["skill_args"], {"objective": expected["objective"]}, expected["wait_args"], {"status": "complete"})
    for index in range(pairs_count):
        call, output = tools[index * 2:index * 2 + 2]
        require(call["call_id"] == output["call_id"], "call-bind")
        if profile == "DIRECT_NATIVE_V1":
            require(call["name"] == names[index] and parse(call["arguments"].encode("utf-8")) == arguments[index], "direct-call")
            outputs.append(output["output"])
        else:
            require(call["name"] == "exec" and call["input"] in {exec_input(names[index], arguments[index], "canonical"), exec_input(names[index], arguments[index], "observed")}, "wrapped-call")
            outputs.append(wrapper_text(output))
    if live:
        pending = tools[-1]
        if profile == "DIRECT_NATIVE_V1":
            require(pending.get("type") == "function_call" and pending.get("name") == "exec_command" and parse(pending["arguments"].encode("utf-8")) == expected["wait_args"], "pending-direct")
        else:
            require(pending.get("type") == "custom_tool_call" and pending.get("name") == "exec" and pending.get("input") in {exec_input("exec_command", expected["wait_args"], "canonical"), exec_input("exec_command", expected["wait_args"], "observed")}, "pending-wrapped")
    require((parse(outputs[0].encode("utf-8"))["output"] if profile == "DIRECT_NATIVE_V1" else outputs[0]) == expected["skill_text"], "skill-output")
    parse_goal(outputs[1], expected["thread_id"], expected["objective"], "active")
    require(all(expected["subject"].decode("utf-8") not in item for event in events[:8] for item in strings(event)), "subject-before-wait")
    if live:
        require(not any(event["type"] == "event_msg" and event["payload"].get("type") == "task_complete" for event in events), "live-complete")
        return True
    if profile == "DIRECT_NATIVE_V1":
        require(parse(outputs[2].encode("utf-8"))["output"].encode("utf-8") == expected["subject"], "direct-subject")
    else:
        require(outputs[2].encode("utf-8") == expected["subject"], "wrapped-subject")
    parse_goal(outputs[3], expected["thread_id"], expected["objective"], "complete")
    require(events[-2]["payload"].get("phase") == "final_answer" and events[-2]["payload"]["content"] == [{"type": "output_text", "text": expected["result"]}], "final")
    require(events[-1]["payload"] == {"last_agent_message": expected["result"], "turn_id": expected["turn_id"], "type": "task_complete"}, "complete")
    return True


def expect_reject(callback, label):
    try:
        callback()
    except Exception:
        return
    raise Invalid("mutation-accepted:" + label)


def run():
    recipe, source, source_recipe, public = load()
    base = load_module("r9g15_exhaustive_base", recipe["bindings"]["base_v7_prototype"])
    schedules = build_schedules(recipe, source, source_recipe, public)
    node_count, maximum_case, maximum_payload, contracts = base.exhaustive_cases(recipe, source, source_recipe, public)
    skill_raw = read_bound(recipe["bindings"]["bootstrap_skill"]["path"], 0o644, recipe["bindings"]["bootstrap_skill"]["bytes"], recipe["bindings"]["bootstrap_skill"]["bytes"], recipe["bindings"]["bootstrap_skill"]["sha256"])
    maximum_prompt = 0
    for code, records in schedules.items():
        for record in records:
            prompt, workdir = spawn_prompt(record, code)
            maximum_prompt = max(maximum_prompt, len(prompt))
            require(len(prompt) <= recipe["limits"]["spawn_prompt_utf8_bytes_max"] and record["goal_objective"] in prompt.decode("utf-8"), "prompt")
            require(record["execution_nonce"] in workdir, "workdir")
    sample = schedules["C04"][0]
    cell, node = source.source_node(source_recipe, sample)
    contract = source.result_contract(node, cell)
    subject = canonical({"c": "Return one token.", "p": {"op": "label", "x": "amber"}, "q": "token", "r": "TOKEN", "v": 2, "z": "direct"}) + b"\n"
    pre = predeclaration(recipe, sample, "C04", sha(canonical(contract)), subject)
    require(sorted(pre) == sorted(recipe["predeclaration_fields"]), "pre-fields")
    thread = "10000000-0000-0000-0000-000000000001"
    turn = "20000000-0000-0000-0000-000000000001"
    _, workdir = spawn_prompt(sample, "C04")
    wait_args = {"cmd": "python3 -B wait.py " + thread, "max_output_tokens": 128, "workdir": workdir, "yield_time_ms": 30000}
    expected = {"effort": sample["reasoning_effort_requested"], "model": sample["model_requested"], "objective": sample["goal_objective"], "result": "amber", "skill_args": skill_arguments(recipe), "skill_text": skill_raw.decode("utf-8"), "subject": subject, "thread_id": thread, "turn_id": turn, "wait_args": wait_args}
    direct = direct_events(thread, turn, expected["objective"], expected["skill_args"], expected["skill_text"], wait_args, subject, "amber", expected["model"], expected["effort"])
    wrapped = wrapped_events(thread, turn, expected["objective"], expected["skill_args"], expected["skill_text"], wait_args, subject, "amber", expected["model"], expected["effort"])
    require(normalize(direct[:8], "DIRECT_NATIVE_V1", expected, True) and normalize(wrapped[:8], "EXEC_WRAPPED_V1", expected, True), "live")
    require(normalize(direct, "DIRECT_NATIVE_V1", expected) and normalize(wrapped, "EXEC_WRAPPED_V1", expected), "terminal")
    mutations = []
    missing_skill = copy.deepcopy(direct[2:])
    mutations.append((missing_skill, "DIRECT_NATIVE_V1", "missing-skill"))
    wrong_skill = copy.deepcopy(direct)
    wrong_skill[4]["payload"]["output"] = canonical({"exit_code": 0, "output": "wrong", "wall_time_seconds": 0.1}).decode()
    mutations.append((wrong_skill, "DIRECT_NATIVE_V1", "skill-output"))
    get_goal = copy.deepcopy(wrapped)
    get_goal.insert(7, {"type": "response_item", "payload": {"call_id": "extra", "input": "x", "name": "exec", "type": "custom_tool_call"}})
    mutations.append((get_goal, "EXEC_WRAPPED_V1", "extra-get-goal"))
    result_record = copy.deepcopy(direct)
    result_record.insert(-2, copy.deepcopy(direct[3]))
    mutations.append((result_record, "DIRECT_NATIVE_V1", "result-record"))
    for events, profile, label in mutations:
        expect_reject(lambda events=events, profile=profile: normalize(events, profile, expected), label)
    output = {
        "assertion_count": node_count + sum(len(records) for records in schedules.values()) + 35,
        "first_mismatch": None,
        "matrix_counts": {code: len(records) for code, records in schedules.items()},
        "max_complete_subject_line_bytes": maximum_case[0], "max_nested_payload_bytes": maximum_payload,
        "max_spawn_prompt_bytes": maximum_prompt, "mutation_count": len(mutations), "node_count": node_count,
        "private_expected_answer_fields": 0, "qualification_credit": 0,
        "schema_id": "pw-r9-codex-native-goal-skill-aligned-blocking-mailbox-prototype-check-v8",
        "status": "PASS_DATA_ONLY_PROTOTYPE_ZERO_CALLS_ZERO_WRITES", "subject_calls": 0, "workspace_writes": 0,
    }
    sys.stdout.buffer.write(canonical(output) + b"\n")


def main():
    try:
        require(sys.argv == [sys.argv[0], "--check"], "cli")
        run()
    except Exception as error:
        sys.stderr.write("FAIL:" + str(error) + "\n")
        raise SystemExit(1)


if __name__ == "__main__":
    main()
