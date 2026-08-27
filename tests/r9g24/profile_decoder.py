#!/usr/bin/env python3
import importlib.util
import json
import math
import os
import re
import shlex

CODEC_PATH = "/mnt/Cursor/PuppetMaster/tests/r9g17/native_envelope.py"
DIRECT_OUTPUT = re.compile(r"Chunk ID: [0-9a-f]+\nWall time: (?:0|[1-9][0-9]*)(?:\.[0-9]+)? seconds\nProcess exited with code (-?[0-9]+)\nOriginal token count: [0-9]+\nOutput:\n([\s\S]*)")
UUID = re.compile(r"^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$")
TOKEN = re.compile(r"^[A-Za-z0-9._:-]{1,48}$")


class Invalid(ValueError):
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
    if isinstance(raw, str):
        raw = raw.encode("utf-8")
    value = json.loads(raw.decode("utf-8"), object_pairs_hook=pairs, parse_constant=lambda item: (_ for _ in ()).throw(Invalid("nonfinite:" + item)))
    require(finite(value), "finite")
    return value


def decode_events(raw):
    require(isinstance(raw, bytes) and raw.endswith(b"\n") and b"\r" not in raw, "trace-framing")
    output = []
    for index, line in enumerate(raw.splitlines(keepends=True)):
        require(line.endswith(b"\n") and line.count(b"\n") == 1 and line != b"\n", "trace-line:" + str(index))
        event = parse(line)
        require(isinstance(event, dict) and set(event) == {"payload", "timestamp", "type"} and isinstance(event["payload"], dict) and isinstance(event["timestamp"], str) and isinstance(event["type"], str), "trace-event:" + str(index))
        output.append(event)
    require(bool(output), "trace-empty")
    return output


def typed(events, outer, inner=None):
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


def turn(payload):
    return payload.get("internal_chat_message_metadata_passthrough", {}).get("turn_id")


def load_codec():
    spec = importlib.util.spec_from_file_location("r9g24_profile_codec", CODEC_PATH)
    require(spec is not None and spec.loader is not None, "codec-spec")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    require(module.__all__ == ("Invalid", "parse_call", "unwrap_output"), "codec-api")
    return module


def profile(events, expected_turn):
    direct_calls = typed(events, "response_item", "function_call")
    direct_outputs = typed(events, "response_item", "function_call_output")
    wrapped_calls = typed(events, "response_item", "custom_tool_call")
    wrapped_outputs = typed(events, "response_item", "custom_tool_call_output")
    require(not (direct_calls and wrapped_calls) and not (direct_outputs and wrapped_outputs), "mixed-profile")
    if direct_calls:
        require(not wrapped_outputs, "mixed-direct")
        require(all(set(item) == {"arguments", "call_id", "id", "internal_chat_message_metadata_passthrough", "name", "type"} and item["type"] == "function_call" for _, item in direct_calls), "direct-call-shape")
        require(all(set(item) == {"call_id", "id", "internal_chat_message_metadata_passthrough", "output", "type"} and item["type"] == "function_call_output" for _, item in direct_outputs), "direct-output-shape")
        require({turn(item) for _, item in direct_calls + direct_outputs} <= {expected_turn}, "direct-turn")
        require(len({item["call_id"] for _, item in direct_calls}) == len(direct_calls) and len({item["id"] for _, item in direct_calls + direct_outputs}) == len(direct_calls) + len(direct_outputs), "direct-ids")
        return "DIRECT_FUNCTION_CALL_V1", direct_calls, direct_outputs
    require(bool(wrapped_calls) and not direct_outputs, "no-profile")
    require(all(set(item) == {"call_id", "id", "input", "internal_chat_message_metadata_passthrough", "name", "status", "type"} and item["name"] == "exec" and item["status"] == "completed" and item["type"] == "custom_tool_call" for _, item in wrapped_calls), "wrapped-call-shape")
    require(all(set(item) == {"call_id", "id", "internal_chat_message_metadata_passthrough", "output", "type"} and item["type"] == "custom_tool_call_output" for _, item in wrapped_outputs), "wrapped-output-shape")
    require({turn(item) for _, item in wrapped_calls + wrapped_outputs} <= {expected_turn}, "wrapped-turn")
    require(len({item["call_id"] for _, item in wrapped_calls}) == len(wrapped_calls) and len({item["id"] for _, item in wrapped_calls + wrapped_outputs}) == len(wrapped_calls) + len(wrapped_outputs), "wrapped-ids")
    return "NESTED_FUNCTIONS_EXEC_V1", wrapped_calls, wrapped_outputs


def arguments(kind, call, codec):
    if kind == "DIRECT_FUNCTION_CALL_V1":
        value = parse(call["arguments"])
        require(isinstance(value, dict), "direct-arguments")
        return call["name"], value
    decoded = codec.parse_call(call["input"])
    require(isinstance(decoded, dict) and isinstance(decoded.get("arguments"), dict), "wrapped-arguments")
    return decoded["tool"], decoded["arguments"]


def output(kind, call, item, codec):
    require(item["call_id"] == call["call_id"], "call-output-bind")
    if kind == "NESTED_FUNCTIONS_EXEC_V1":
        return codec.unwrap_output(item["output"])
    require(isinstance(item["output"], str), "direct-output-type")
    if call["name"] != "exec_command":
        return item["output"]
    match = DIRECT_OUTPUT.fullmatch(item["output"])
    require(match is not None and int(match.group(1)) == 0, "direct-exec-status")
    return match.group(2)


def safe_skill(args, body, skill_path, skill):
    allowed = {"cmd", "login", "max_output_tokens", "workdir", "yield_time_ms"}
    require({"cmd", "workdir"} <= set(args) <= allowed and args.get("login", False) is False and args["workdir"] == "/mnt/Cursor/PuppetMaster", "skill-fields")
    require("yield_time_ms" not in args or isinstance(args["yield_time_ms"], int), "skill-yield")
    require("max_output_tokens" not in args or isinstance(args["max_output_tokens"], int), "skill-output-budget")
    words = shlex.split(args["cmd"], posix=True)
    require(len(words) == 4 and words[:2] == ["sed", "-n"], "skill-program")
    match = re.fullmatch(r"1,([1-9][0-9]{0,3})p", words[2])
    require(match is not None and int(match.group(1)) >= skill.count(b"\n"), "skill-range")
    path = words[3] if os.path.isabs(words[3]) else os.path.join(args["workdir"], words[3])
    require(os.path.realpath(path) == skill_path and body.encode("utf-8") == skill, "skill-identity")


def goal(body, thread_id, objective, status):
    value = parse(body)
    require(set(value) == {"completionBudgetReport", "goal", "remainingTokens"} and value["remainingTokens"] is None, "goal-envelope")
    item = value["goal"]
    require(set(item) == {"createdAt", "objective", "status", "threadId", "timeUsedSeconds", "tokensUsed", "updatedAt"}, "goal-fields")
    require((item["threadId"], item["objective"], item["status"]) == (thread_id, objective, status), "goal-binding")
    require(all(isinstance(item[key], int) and not isinstance(item[key], bool) and item[key] >= 0 for key in ("createdAt", "updatedAt", "timeUsedSeconds", "tokensUsed")), "goal-types")
    if status == "active":
        require(item["tokensUsed"] == 0 and item["timeUsedSeconds"] == 0 and value["completionBudgetReport"] is None, "goal-active")
    else:
        require(isinstance(value["completionBudgetReport"], str), "goal-complete")
    return item


def context(events, control):
    sessions = typed(events, "session_meta")
    require(len(sessions) == 1 and sessions[0][0] == 0, "session-count")
    session = sessions[0][1]
    thread_id = session.get("id")
    require(UUID.fullmatch(thread_id or "") and thread_id == control["thread_id"], "session-thread")
    spawn = session.get("source", {}).get("subagent", {}).get("thread_spawn", {})
    require(session.get("parent_thread_id") == control["parent_thread_id"] and session.get("agent_path") == control["task_path"], "session-identity")
    require(spawn.get("parent_thread_id") == control["parent_thread_id"] and spawn.get("agent_path") == control["task_path"], "spawn-identity")
    turns = typed(events, "turn_context")
    require(len(turns) == 1 and UUID.fullmatch(turns[0][1].get("turn_id", "")), "turn-count")
    turn_id = turns[0][1]["turn_id"]
    require(turns[0][1].get("model") == control["model"] and turns[0][1].get("effort") == control["effort"] and turns[0][1].get("cwd") == "/mnt/Cursor/PuppetMaster", "turn-route")
    starts = typed(events, "event_msg", "task_started")
    require(len(starts) == 1 and starts[0][1].get("turn_id") == turn_id and starts[0][0] < turns[0][0], "task-start")
    return {"session": session, "thread_id": thread_id, "turn_id": turn_id, "turn_index": turns[0][0]}


def ordered_pairs(events, kind, calls, outputs, expected_names, allow_pending):
    require([call["name"] if kind == "DIRECT_FUNCTION_CALL_V1" else "exec" for _, call in calls] == ([name for name in expected_names] if kind == "DIRECT_FUNCTION_CALL_V1" else ["exec"] * len(expected_names)), "call-order")
    by_id = {item["call_id"]: (index, item) for index, item in outputs}
    require(len(by_id) == len(outputs), "output-call-ids")
    expected_output_count = len(calls) - (1 if allow_pending else 0)
    require(len(outputs) == expected_output_count and set(by_id) == {call["call_id"] for _, call in calls[:expected_output_count]}, "output-set")
    sequence = []
    for position, (index, call) in enumerate(calls):
        if position < expected_output_count:
            output_index, item = by_id[call["call_id"]]
            require(index < output_index, "pair-order")
            sequence.extend([index, output_index])
        else:
            sequence.append(index)
    require(sequence == sorted(sequence) and len(set(sequence)) == len(sequence), "tool-order")
    return by_id


def validate_active(raw, control, subject, skill):
    events = decode_events(raw)
    ctx = context(events, control)
    require(not typed(events, "event_msg", "task_complete") and not any(item.get("phase") == "final_answer" for _, item in typed(events, "response_item", "message")), "active-terminal")
    kind, calls, outputs = profile(events, ctx["turn_id"])
    require(len(calls) == 3, "active-call-count")
    by_id = ordered_pairs(events, kind, calls, outputs, ["exec_command", "create_goal", "exec_command"], True)
    codec = load_codec()
    tool0, args0 = arguments(kind, calls[0][1], codec); require(tool0 == "exec_command", "skill-tool")
    safe_skill(args0, output(kind, calls[0][1], by_id[calls[0][1]["call_id"]][1], codec), control["skill_path"], skill)
    tool1, args1 = arguments(kind, calls[1][1], codec); require(tool1 == "create_goal" and args1 == {"objective": control["objective"]}, "create-call")
    active_goal = goal(output(kind, calls[1][1], by_id[calls[1][1]["call_id"]][1], codec), ctx["thread_id"], control["objective"], "active")
    tool2, args2 = arguments(kind, calls[2][1], codec); require(tool2 == "exec_command" and args2 == control["wait_arguments"], "wait-call")
    text = subject.decode("utf-8")
    require(all(text not in item for event in events for item in strings(event)), "subject-before-active")
    return {"active_goal": active_goal, "profile": kind, **ctx}


def validate_terminal(raw, active_raw, control, subject, skill, allowed_tokens):
    require(raw.startswith(active_raw) and len(raw) > len(active_raw), "active-prefix")
    events = decode_events(raw)
    ctx = context(events, control)
    kind, calls, outputs = profile(events, ctx["turn_id"])
    require(len(calls) == 4, "terminal-call-count")
    by_id = ordered_pairs(events, kind, calls, outputs, ["exec_command", "create_goal", "exec_command", "update_goal"], False)
    codec = load_codec()
    tool0, args0 = arguments(kind, calls[0][1], codec); require(tool0 == "exec_command", "skill-tool")
    safe_skill(args0, output(kind, calls[0][1], by_id[calls[0][1]["call_id"]][1], codec), control["skill_path"], skill)
    tool1, args1 = arguments(kind, calls[1][1], codec); require(tool1 == "create_goal" and args1 == {"objective": control["objective"]}, "create-call")
    active_goal = goal(output(kind, calls[1][1], by_id[calls[1][1]["call_id"]][1], codec), ctx["thread_id"], control["objective"], "active")
    tool2, args2 = arguments(kind, calls[2][1], codec); require(tool2 == "exec_command" and args2 == control["wait_arguments"], "wait-call")
    require(output(kind, calls[2][1], by_id[calls[2][1]["call_id"]][1], codec).encode("utf-8") == subject, "wait-output")
    tool3, args3 = arguments(kind, calls[3][1], codec); require(tool3 == "update_goal" and args3 == {"status": "complete"}, "update-call")
    complete_goal = goal(output(kind, calls[3][1], by_id[calls[3][1]["call_id"]][1], codec), ctx["thread_id"], control["objective"], "complete")
    finals = []
    for index, item in typed(events, "response_item", "message"):
        if item.get("phase") == "final_answer":
            content = item.get("content")
            require(isinstance(content, list) and len(content) == 1 and content[0].get("type") == "output_text" and isinstance(content[0].get("text"), str), "final-shape")
            finals.append((index, content[0]["text"]))
    require(len(finals) == 1 and TOKEN.fullmatch(finals[0][1] or "") and finals[0][1] in allowed_tokens, "final-token")
    completes = typed(events, "event_msg", "task_complete")
    require(len(completes) == 1 and completes[0][0] == len(events) - 1 and completes[0][1].get("turn_id") == ctx["turn_id"] and completes[0][1].get("last_agent_message") == finals[0][1], "task-complete")
    require(calls[-1][0] < by_id[calls[-1][1]["call_id"]][0] < finals[0][0] < completes[0][0], "terminal-order")
    return {"active_goal": active_goal, "complete_goal": complete_goal, "result": finals[0][1], "profile": kind, **ctx}


__all__ = ("Invalid", "decode_events", "profile", "validate_active", "validate_terminal")
