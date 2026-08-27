#!/usr/bin/env python3
import ast
import copy
import hashlib
import importlib.util
import json
import os
import stat
import sys


HERE = "/mnt/Cursor/PuppetMaster/tests/r9g12"
MATERIALIZER = HERE + "/materialize.py"
VERIFIER = HERE + "/verify.py"
RECIPE = HERE + "/closed_recipe.json"


class Failure(Exception):
    pass


def require(condition, mismatch):
    if not condition:
        raise Failure(mismatch)


def load_module(name, path):
    spec = importlib.util.spec_from_file_location(name, path)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def canonical_lines(events):
    return b"".join(json.dumps(event, ensure_ascii=False, allow_nan=False, sort_keys=True, separators=(",", ":")).encode("utf-8") + b"\n" for event in events)


def wrapper_output(text, call_id, turn_id, item_id):
    return {"type": "response_item", "payload": {"call_id": call_id, "id": item_id, "internal_chat_message_metadata_passthrough": {"turn_id": turn_id}, "output": [{"type": "input_text", "text": "Script completed\nWall time 0.1 seconds\nOutput:\n"}, {"type": "input_text", "text": text}], "type": "custom_tool_call_output"}}


def turn_events(turn_id, call_id, item_prefix, tool_input, tool_output, final_text, model, effort):
    return [
        {"type": "event_msg", "payload": {"type": "task_started", "turn_id": turn_id}},
        {"type": "turn_context", "payload": {"effort": effort, "model": model, "turn_id": turn_id}},
        {"type": "response_item", "payload": {"call_id": call_id, "id": item_prefix + "-call", "input": tool_input, "internal_chat_message_metadata_passthrough": {"turn_id": turn_id}, "name": "exec", "status": "completed", "type": "custom_tool_call"}},
        wrapper_output(tool_output, call_id, turn_id, item_prefix + "-output"),
        {"type": "response_item", "payload": {"content": [{"text": final_text, "type": "output_text"}], "phase": "final_answer", "role": "assistant", "turn_id": turn_id, "type": "message"}},
        {"type": "event_msg", "payload": {"message": final_text, "phase": "final_answer", "type": "agent_message"}},
        {"type": "event_msg", "payload": {"last_agent_message": final_text, "type": "task_complete", "turn_id": turn_id}},
    ]


def fixture(materializer, verifier):
    recipe, public = materializer.load_recipe()
    records = materializer.build_schedule(recipe, public, "C01")
    record = records[0]
    cell = verifier.build_schedule(recipe, public, "C01")[1][(record["route"], record["cell_index"])]
    node = cell["nodes"][record["node_index"]]
    admission, _ = verifier.expected_admission(recipe, record, cell, node)
    case_raw = verifier.expected_case(recipe, admission, cell, node, {})
    contract = admission["result_contract"]
    if contract["kind"] == "regex":
        token = "x"
    elif contract["token_mode"] == "ALIAS":
        token = "A"
    else:
        token = contract["values"][0]
    goal_id = "10000000-0000-0000-0000-000000000001"
    turns = ["20000000-0000-0000-0000-000000000001", "20000000-0000-0000-0000-000000000002", "20000000-0000-0000-0000-000000000003"]
    task_path = "/root/" + admission["task_name"]
    session = {"type": "session_meta", "payload": {"agent_path": task_path, "id": goal_id, "parent_thread_id": recipe["evidence_contract"]["parent_thread_id"], "source": {"subagent": {"thread_spawn": {"agent_path": task_path}}}}}
    active_goal = materializer.canon({"goal": {"objective": admission["goal_objective"], "status": "active", "threadId": goal_id}}).decode("utf-8")
    complete_goal = materializer.canon({"goal": {"objective": admission["goal_objective"], "status": "complete", "threadId": goal_id, "timeUsedSeconds": 1, "tokensUsed": 7}}).decode("utf-8")
    active_final = "A|{}|{}|active".format(admission["execution_nonce"], goal_id)
    result_final = "R|{}|{}".format(admission["execution_nonce"], token)
    terminal_final = "T|{}|{}|complete".format(admission["execution_nonce"], goal_id)
    events0 = [session] + turn_events(turns[0], "call-0", "i0", admission["activation_tool_input"], active_goal, active_final, admission["model_requested"], admission["reasoning_effort_requested"])
    events1 = events0 + turn_events(turns[1], "call-1", "i1", materializer.subject_tool_input("C01", 0, record["route_code"], goal_id), case_raw.decode("utf-8"), result_final, admission["model_requested"], admission["reasoning_effort_requested"])
    events2 = events1 + turn_events(turns[2], "call-2", "i2", materializer.completion_tool_input(), complete_goal, terminal_final, admission["model_requested"], admission["reasoning_effort_requested"])
    return recipe, admission, case_raw, goal_id, token, events0, events1, events2


def expect_reject(call, label):
    try:
        call()
    except Exception:
        return
    raise Failure("mutation-accepted:" + label)


def run():
    materializer = load_module("r9g12_materializer", MATERIALIZER)
    verifier = load_module("r9g12_verifier", VERIFIER)
    assertions = 0
    mutations = 0
    for path in (RECIPE, MATERIALIZER, VERIFIER, __file__):
        info = os.lstat(path)
        require(stat.S_ISREG(info.st_mode) and stat.S_IMODE(info.st_mode) == 0o644 and info.st_uid == os.getuid() and info.st_nlink == 1, "source-custody:" + path)
        assertions += 1
    recipe_raw = open(RECIPE, "rb").read()
    recipe = json.loads(recipe_raw)
    require(recipe_raw == json.dumps(recipe, ensure_ascii=False, allow_nan=False, sort_keys=True, separators=(",", ":")).encode("utf-8") + b"\n", "recipe-canonical")
    require(recipe["commands"] == ["check", "begin", "prepare", "show", "record-active", "record-result", "record-terminal", "seal"], "closed-commands")
    require(recipe["qualification"] == {"canary_credit": 0, "clean_full_matrix_streak": 0, "credit": "0/2", "required_consecutive_clean_full_matrices": 2, "sequence": ["C01", "011", "012"]}, "qualification-zero")
    assertions += 3
    for path in (MATERIALIZER, VERIFIER, __file__):
        tree = ast.parse(open(path, "rb").read())
        for node in ast.walk(tree):
            if isinstance(node, ast.Dict):
                keys = [key.value for key in node.keys if isinstance(key, ast.Constant)]
                require(not any(keys.count(key) > 1 for key in keys), "duplicate-literal-key:{}:{}".format(path, node.lineno))
        assertions += 1
    verifier_tree = ast.parse(open(VERIFIER, "rb").read())
    forbidden_writes = {"chmod", "fchmod", "link", "makedirs", "mkdir", "remove", "rename", "replace", "rmdir", "symlink", "truncate", "unlink", "write"}
    calls = [(node.lineno, node.func.attr) for node in ast.walk(verifier_tree) if isinstance(node, ast.Call) and isinstance(node.func, ast.Attribute) and isinstance(node.func.value, ast.Name) and node.func.value.id == "os" and node.func.attr in forbidden_writes]
    require(not calls, "verifier-mutation-calls")
    assertions += 1
    materializer_tree = ast.parse(open(MATERIALIZER, "rb").read())
    imports = {alias.name for node in ast.walk(materializer_tree) if isinstance(node, ast.Import) for alias in node.names}
    require(not ({"subprocess", "socket", "urllib", "requests"} & imports), "materializer-external-import")
    require("resume" not in recipe["commands"] and all(recipe["failure_contract"][key] == 0 for key in ("best_of", "relaunch", "replacement", "resend", "retry", "reuse")), "no-recovery")
    assertions += 2
    private_path = recipe["bindings"]["private_scorer"]["path"]
    materializer_reads = []
    verifier_reads = []
    original_materializer_read = materializer.read_bound
    original_verifier_read = verifier.read_bound
    materializer.read_bound = lambda path, *args, **kwargs: (materializer_reads.append(path), original_materializer_read(path, *args, **kwargs))[1]
    verifier.read_bound = lambda path, *args, **kwargs: (verifier_reads.append(path), original_verifier_read(path, *args, **kwargs))[1]
    try:
        materializer.load_recipe()
        verifier.load_sources()
    finally:
        materializer.read_bound = original_materializer_read
        verifier.read_bound = original_verifier_read
    require(private_path not in materializer_reads and private_path not in verifier_reads, "private-scorer-precomplete-read")
    assertions += 1
    recipe_value, admission, case_raw, goal_id, token, events0, events1, events2 = fixture(materializer, verifier)
    raw0, raw1, raw2 = map(canonical_lines, (events0, events1, events2))
    active_m = materializer.validate_trace(raw0, admission, "active")
    active_v = verifier.validate_trace(raw0, recipe_value, admission, "active")
    require(active_m["goal_thread_id"] == goal_id and active_v["goal_thread_id"] == goal_id, "active-fixture")
    active_value = {"goal_thread_id": goal_id}
    result_m = materializer.validate_trace(raw1, admission, "result", raw0, case_raw, active_value)
    result_v = verifier.validate_trace(raw1, recipe_value, admission, "result", raw0, case_raw, goal_id)
    require(result_m["result_token"] == token and result_v["result_token"] == token, "result-fixture")
    terminal_m = materializer.validate_trace(raw2, admission, "terminal", raw1, case_raw, active_value)
    terminal_v = verifier.validate_trace(raw2, recipe_value, admission, "terminal", raw1, case_raw, goal_id)
    require(terminal_m["terminal_goal"]["status"] == "complete" and terminal_v["terminal_goal"]["status"] == "complete", "terminal-fixture")
    assertions += 3
    wrong_input = copy.deepcopy(events1)
    wrong_input[-5]["payload"]["input"] += " "
    expect_reject(lambda: materializer.validate_trace(canonical_lines(wrong_input), admission, "result", raw0, case_raw, active_value), "wrong-input-materializer")
    expect_reject(lambda: verifier.validate_trace(canonical_lines(wrong_input), recipe_value, admission, "result", raw0, case_raw, goal_id), "wrong-input-verifier")
    mutations += 2
    extra_prose = copy.deepcopy(events1)
    extra_prose.insert(-1, {"type": "response_item", "payload": {"content": [{"text": "extra", "type": "output_text"}], "phase": "commentary", "role": "assistant", "turn_id": events1[-1]["payload"]["turn_id"], "type": "message"}})
    expect_reject(lambda: materializer.validate_trace(canonical_lines(extra_prose), admission, "result", raw0, case_raw, active_value), "extra-prose-materializer")
    expect_reject(lambda: verifier.validate_trace(canonical_lines(extra_prose), recipe_value, admission, "result", raw0, case_raw, goal_id), "extra-prose-verifier")
    mutations += 2
    bad_order = copy.deepcopy(events1)
    call_index = next(index for index, event in enumerate(bad_order) if event.get("payload", {}).get("call_id") == "call-1" and event.get("payload", {}).get("type") == "custom_tool_call")
    output_index = next(index for index, event in enumerate(bad_order) if event.get("payload", {}).get("call_id") == "call-1" and event.get("payload", {}).get("type") == "custom_tool_call_output")
    bad_order[call_index], bad_order[output_index] = bad_order[output_index], bad_order[call_index]
    expect_reject(lambda: materializer.validate_trace(canonical_lines(bad_order), admission, "result", raw0, case_raw, active_value), "causal-order-materializer")
    expect_reject(lambda: verifier.validate_trace(canonical_lines(bad_order), recipe_value, admission, "result", raw0, case_raw, goal_id), "causal-order-verifier")
    mutations += 2
    wrong_complete = copy.deepcopy(events2)
    complete_output = next(event for event in wrong_complete if event.get("payload", {}).get("call_id") == "call-2" and event.get("payload", {}).get("type") == "custom_tool_call_output")
    complete_output["payload"]["output"][1]["text"] = materializer.canon({"goal": {"objective": admission["goal_objective"], "status": "active", "threadId": goal_id, "timeUsedSeconds": 1, "tokensUsed": 7}}).decode("utf-8")
    expect_reject(lambda: materializer.validate_trace(canonical_lines(wrong_complete), admission, "terminal", raw1, case_raw, active_value), "terminal-state-materializer")
    expect_reject(lambda: verifier.validate_trace(canonical_lines(wrong_complete), recipe_value, admission, "terminal", raw1, case_raw, goal_id), "terminal-state-verifier")
    mutations += 2
    expect_reject(lambda: materializer.validate_trace(raw1, admission, "result", raw0 + b"x", case_raw, active_value), "prefix-materializer")
    expect_reject(lambda: verifier.validate_trace(raw1, recipe_value, admission, "result", raw0 + b"x", case_raw, goal_id), "prefix-verifier")
    mutations += 2
    expect_reject(lambda: materializer.validate_trace(raw1, admission, "result", None, case_raw, active_value), "missing-prefix-materializer")
    expect_reject(lambda: verifier.validate_trace(raw1, recipe_value, admission, "result", None, case_raw, goal_id), "missing-prefix-verifier")
    mutations += 2
    interleaved_turns = copy.deepcopy(events1)
    second_start = interleaved_turns.pop(len(events0))
    interleaved_turns.insert(len(events0) - 1, second_start)
    short_prior = canonical_lines(events0[:-1])
    expect_reject(lambda: materializer.validate_trace(canonical_lines(interleaved_turns), admission, "result", short_prior, case_raw, active_value), "cross-turn-order-materializer")
    expect_reject(lambda: verifier.validate_trace(canonical_lines(interleaved_turns), recipe_value, admission, "result", short_prior, case_raw, goal_id), "cross-turn-order-verifier")
    mutations += 2
    output = {"assertion_count": assertions, "evidence_writes": 0, "first_mismatch": None, "mutation_count": mutations, "private_scorer_reads": 0, "qualification_credit": 0, "schema_id": "pw-r9-codex-native-goal-jit-post-goal-delivery-protocol-test-v1", "status": "PASS_DATA_ONLY_SYNTHETIC_ZERO_CALLS_ZERO_WRITES", "subject_calls": 0}
    sys.stdout.buffer.write(json.dumps(output, sort_keys=True, separators=(",", ":")).encode("utf-8") + b"\n")


def main():
    try:
        require(sys.argv == [sys.argv[0], "--check"], "cli")
        run()
    except Exception as error:
        sys.stderr.write("FAIL:" + str(error) + "\n")
        raise SystemExit(1)


if __name__ == "__main__":
    main()
