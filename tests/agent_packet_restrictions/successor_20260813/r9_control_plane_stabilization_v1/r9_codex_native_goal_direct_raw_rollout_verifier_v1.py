#!/usr/bin/env python3
import argparse
import hashlib
import json
import os
import re
import stat
import sys
from pathlib import Path


class Invalid(Exception):
    pass


def fail(message):
    raise Invalid(message)


def unique_object(pairs):
    out = {}
    for key, value in pairs:
        if key in out:
            fail(f"duplicate-key:{key}")
        out[key] = value
    return out


def parse_json(text, where):
    try:
        return json.loads(
            text,
            object_pairs_hook=unique_object,
            parse_constant=lambda value: fail(f"nonfinite:{where}:{value}"),
        )
    except Invalid:
        raise
    except Exception as exc:
        fail(f"json:{where}:{type(exc).__name__}")


def canonical(value):
    return json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(",", ":"))


def exact_keys(value, expected, where):
    if not isinstance(value, dict) or set(value) != set(expected):
        fail(f"fields:{where}")


def sha256(data):
    return hashlib.sha256(data).hexdigest()


def confined(root, relative, where):
    if not isinstance(relative, str) or not relative or os.path.isabs(relative):
        fail(f"path:{where}")
    root = root.resolve()
    path = (root / relative).resolve()
    try:
        path.relative_to(root)
    except ValueError:
        fail(f"escape:{where}")
    return path


def read_bound(path, binding, where):
    exact_keys(binding, ("bytes", "mode", "path", "sha256"), where)
    try:
        info = path.lstat()
    except OSError as exc:
        fail(f"stat:{where}:{type(exc).__name__}")
    if not stat.S_ISREG(info.st_mode):
        fail(f"nonregular:{where}")
    mode = f"{stat.S_IMODE(info.st_mode):04o}"
    if mode != binding["mode"]:
        fail(f"mode:{where}")
    try:
        data = path.read_bytes()
    except OSError as exc:
        fail(f"read:{where}:{type(exc).__name__}")
    if len(data) != binding["bytes"] or sha256(data) != binding["sha256"]:
        fail(f"identity:{where}")
    return data


def read_identity(path, binding, where):
    exact_keys(binding, ("bytes", "mode", "relative_path", "sha256"), where)
    adapted = {
        "bytes": binding["bytes"],
        "mode": binding["mode"],
        "path": binding["relative_path"],
        "sha256": binding["sha256"],
    }
    return read_bound(path, adapted, where)


def text_blocks(blocks, where):
    if not isinstance(blocks, list):
        fail(f"blocks:{where}")
    out = []
    for block in blocks:
        if not isinstance(block, dict) or block.get("type") not in ("input_text", "output_text"):
            fail(f"block:{where}")
        text = block.get("text")
        if not isinstance(text, str):
            fail(f"block-text:{where}")
        out.append(text)
    return "".join(out)


def strings(value):
    if isinstance(value, str):
        yield value
    elif isinstance(value, list):
        for item in value:
            yield from strings(item)
    elif isinstance(value, dict):
        for item in value.values():
            yield from strings(item)


def goal_receipt(event, where):
    output = event["output"]
    if event["encoding"] == "function_call_v1":
        if not isinstance(output, str):
            fail(f"goal-output:{where}")
        value = parse_json(output, where)
    else:
        joined = text_blocks(output, where)
        candidates = [line.strip() for line in joined.splitlines() if line.strip().startswith('{"goal":')]
        if len(candidates) != 1:
            fail(f"goal-output-lines:{where}")
        value = parse_json(candidates[0], where)
    if not isinstance(value, dict) or not isinstance(value.get("goal"), dict):
        fail(f"goal-receipt:{where}")
    return value["goal"]


def function_arguments(event, where):
    if event["encoding"] != "function_call_v1":
        return None
    arguments = event["input"]
    if not isinstance(arguments, str):
        fail(f"arguments:{where}")
    value = parse_json(arguments, where)
    if not isinstance(value, dict):
        fail(f"arguments-object:{where}")
    return value


def custom_kind(source):
    if not isinstance(source, str):
        fail("custom-input")
    needles = {
        "create_goal": "tools.create_goal(",
        "get_goal": "tools.get_goal(",
        "exec_command": "tools.exec_command(",
        "update_goal": "tools.update_goal(",
    }
    found = [name for name, needle in needles.items() if needle in source]
    if len(found) != 1 or source.count("tools.") != 1:
        fail("custom-tool-totality")
    return found[0]


def response_events(records, expected_encoding):
    items = []
    for record in records:
        if record.get("type") == "response_item":
            payload = record.get("payload")
            if not isinstance(payload, dict):
                fail("response-payload")
            items.append(payload)
    events = []
    paired_outputs = set()
    for index, payload in enumerate(items):
        ptype = payload.get("type")
        if ptype == "web_search_call":
            fail("web-search")
        if ptype == "function_call":
            if expected_encoding != "function_call_v1":
                fail("mixed-encoding")
            name = payload.get("name")
            call_id = payload.get("call_id")
            if not isinstance(name, str) or not isinstance(call_id, str):
                fail("function-call")
            output_type = "function_call_output"
            source = payload.get("arguments")
        elif ptype == "custom_tool_call":
            if expected_encoding != "custom_exec_v1" or payload.get("name") != "exec":
                fail("mixed-custom-encoding")
            name = custom_kind(payload.get("input"))
            call_id = payload.get("call_id")
            if not isinstance(call_id, str):
                fail("custom-call")
            output_type = "custom_tool_call_output"
            source = payload.get("input")
        else:
            if isinstance(ptype, str) and ptype.endswith("_call"):
                fail(f"unknown-call:{ptype}")
            continue
        if index + 1 >= len(items):
            fail(f"missing-output:{name}")
        output = items[index + 1]
        if output.get("type") != output_type or output.get("call_id") != call_id:
            fail(f"unpaired-output:{name}")
        paired_outputs.add(index + 1)
        events.append(
            {
                "encoding": expected_encoding,
                "index": index,
                "input": source,
                "name": name,
                "output": output.get("output"),
                "output_index": index + 1,
            }
        )
    for index, payload in enumerate(items):
        if payload.get("type") in ("function_call_output", "custom_tool_call_output") and index not in paired_outputs:
            fail("orphan-output")
    finals = [
        (index, payload)
        for index, payload in enumerate(items)
        if payload.get("type") == "message"
        and payload.get("role") == "assistant"
        and payload.get("phase") == "final_answer"
    ]
    if len(finals) != 1 or finals[0][0] != len(items) - 1:
        fail("final-position")
    content = finals[0][1].get("content")
    if not isinstance(content, list) or len(content) != 1:
        fail("final-content")
    if content[0].get("type") != "output_text" or not isinstance(content[0].get("text"), str):
        fail("final-text")
    return items, events, content[0]["text"]


def command_from_event(event):
    if event["encoding"] == "function_call_v1":
        arguments = function_arguments(event, "exec-command")
        command = arguments.get("cmd")
        if not isinstance(command, str):
            fail("exec-command-cmd")
        return command
    source = event["input"]
    match = re.search(r'tools\.exec_command\(\{cmd\s*:\s*("(?:\\.|[^"\\])*")', source)
    if not match:
        fail("custom-exec-command")
    command = parse_json(match.group(1), "custom-command-string")
    if not isinstance(command, str):
        fail("custom-command-type")
    return command


def output_from_event(event, where):
    if event["encoding"] == "function_call_v1":
        if not isinstance(event["output"], str):
            fail(f"output:{where}")
        return event["output"]
    return text_blocks(event["output"], where)


def check_command(command, relative, absolute):
    for path in (relative, absolute):
        quoted = re.escape(path)
        pattern = (
            rf"wc -c {quoted}(?P<sep> && |\n)"
            rf"sha256sum {quoted}(?P=sep)"
            rf"sed -n '1,[1-9][0-9]{{0,3}}p' {quoted}"
        )
        if re.fullmatch(pattern, command):
            return path
    fail("subject-command-grammar")


def verify_case(case, workspace, session_root, all_subject_paths):
    exact_keys(
        case,
        (
            "case_id",
            "expected_result",
            "final_envelope",
            "goal_objective",
            "goal_thread_id",
            "physical_encoding",
            "requested_model",
            "requested_reasoning_effort",
            "semantic_tools",
            "slot",
            "spawn_message",
            "subject",
            "task_path",
            "trace",
        ),
        "case",
    )
    exact_keys(case["spawn_message"], ("bytes", "sha256"), "spawn-message")
    if case["spawn_message"]["bytes"] > 512 or not re.fullmatch(r"[0-9a-f]{64}", case["spawn_message"]["sha256"]):
        fail("spawn-message")
    exact_keys(case["subject"], ("bytes", "mode", "path", "sha256"), "subject")
    subject_path = confined(workspace, case["subject"]["path"], "subject")
    subject_data = read_bound(subject_path, case["subject"], "subject")
    try:
        subject_text = subject_data.decode("utf-8")
    except UnicodeDecodeError:
        fail("subject-utf8")
    if not subject_text.endswith("\n") or subject_text.count("\n") != 1:
        fail("subject-line")
    subject_value = parse_json(subject_text, "subject")
    if subject_value.get("case_id") != case["case_id"]:
        fail("subject-case-id")
    if subject_value.get("result_contract", {}).get("pass") != case["expected_result"]:
        fail("subject-result")
    exact_keys(case["trace"], ("bytes", "mode", "relative_path", "sha256"), "trace")
    trace_path = confined(session_root, case["trace"]["relative_path"], "trace")
    trace_data = read_identity(trace_path, case["trace"], "trace")
    if not trace_data.endswith(b"\n"):
        fail("trace-terminal-lf")
    records = []
    for number, raw in enumerate(trace_data.splitlines(), 1):
        if not raw:
            fail(f"trace-empty-line:{number}")
        try:
            text = raw.decode("utf-8")
        except UnicodeDecodeError:
            fail(f"trace-utf8:{number}")
        value = parse_json(text, f"trace-line-{number}")
        if not isinstance(value, dict):
            fail(f"trace-object:{number}")
        records.append(value)
    metas = [record.get("payload") for record in records if record.get("type") == "session_meta"]
    if len(metas) != 1 or not isinstance(metas[0], dict):
        fail("session-meta")
    meta = metas[0]
    if meta.get("id") != case["goal_thread_id"] or meta.get("agent_path") != case["task_path"]:
        fail("session-identity")
    source = meta.get("source", {}).get("subagent", {}).get("thread_spawn", {})
    if source.get("agent_path") != case["task_path"] or source.get("depth") != 1:
        fail("spawn-identity")
    items, events, final_text = response_events(records, case["physical_encoding"])
    names = [event["name"] for event in events]
    if names != case["semantic_tools"] or names not in (
        ["create_goal", "exec_command", "update_goal"],
        ["create_goal", "get_goal", "exec_command", "update_goal"],
    ):
        fail("semantic-tool-order")
    create = events[0]
    if create["encoding"] == "function_call_v1":
        if function_arguments(create, "create-goal") != {"objective": case["goal_objective"]}:
            fail("create-goal-arguments")
    else:
        if create["input"].count(case["goal_objective"]) != 1 or "token_budget" in create["input"]:
            fail("custom-create-goal-arguments")
    active = goal_receipt(create, "create-goal")
    if active.get("threadId") != case["goal_thread_id"] or active.get("objective") != case["goal_objective"] or active.get("status") != "active":
        fail("active-goal")
    cursor = 1
    if names[1] == "get_goal":
        get_event = events[1]
        if get_event["encoding"] == "function_call_v1" and function_arguments(get_event, "get-goal") != {}:
            fail("get-goal-arguments")
        reopened = goal_receipt(get_event, "get-goal")
        if reopened.get("threadId") != case["goal_thread_id"] or reopened.get("status") != "active":
            fail("reopened-goal")
        cursor = 2
    execute = events[cursor]
    command = command_from_event(execute)
    relative = case["subject"]["path"]
    absolute = str(subject_path)
    used_path = check_command(command, relative, absolute)
    for other in all_subject_paths:
        if other != relative and other in command:
            fail("other-subject-path")
    execution_output = output_from_event(execute, "subject-read")
    subject_line = subject_text[:-1]
    if execution_output.count(subject_line) != 1:
        fail("subject-output-content")
    if str(case["subject"]["bytes"]) not in execution_output or case["subject"]["sha256"] not in execution_output:
        fail("subject-output-identity")
    if used_path not in execution_output:
        fail("subject-output-path")
    occurrences = []
    for index, payload in enumerate(items):
        if any(subject_line in value for value in strings(payload)):
            occurrences.append(index)
    if not occurrences or min(occurrences) != execute["output_index"]:
        fail("subject-before-active-or-read")
    update = events[cursor + 1]
    if update["encoding"] == "function_call_v1":
        if function_arguments(update, "update-goal") != {"status": "complete"}:
            fail("update-goal-arguments")
    else:
        if not re.search(r'tools\.update_goal\(\{status\s*:\s*"complete"\}\)', update["input"]):
            fail("custom-update-goal-arguments")
    complete = goal_receipt(update, "update-goal")
    if complete.get("threadId") != case["goal_thread_id"] or complete.get("objective") != case["goal_objective"] or complete.get("status") != "complete":
        fail("complete-goal")
    if final_text != case["final_envelope"] or final_text != f"R|{case['expected_result']}|G|{case['goal_thread_id']}":
        fail("final-envelope")
    if execute["index"] <= create["output_index"] or update["index"] <= execute["output_index"]:
        fail("event-order")
    return {
        "case_id": case["case_id"],
        "encoding": case["physical_encoding"],
        "goal_thread_id": case["goal_thread_id"],
        "result": case["expected_result"],
        "slot": case["slot"],
        "status": "PASS",
        "task_path": case["task_path"],
    }


def run(args):
    manifest_path = Path(args.manifest)
    workspace = Path(args.workspace_root)
    session_root = Path(args.session_root)
    for path, where in ((manifest_path, "manifest"), (workspace, "workspace"), (session_root, "session-root")):
        if not path.is_absolute():
            fail(f"absolute:{where}")
    manifest_info = manifest_path.lstat()
    if not stat.S_ISREG(manifest_info.st_mode) or stat.S_IMODE(manifest_info.st_mode) != 0o644:
        fail("manifest-mode")
    manifest_data = manifest_path.read_bytes()
    try:
        manifest_text = manifest_data.decode("utf-8")
    except UnicodeDecodeError:
        fail("manifest-utf8")
    manifest = parse_json(manifest_text, "manifest")
    if manifest_data != (canonical(manifest) + "\n").encode("utf-8"):
        fail("manifest-canonical")
    exact_keys(manifest, ("bindings", "cases", "qualification", "schema_id"), "manifest")
    if manifest["schema_id"] != "pw-r9-codex-native-goal-direct-first-tool-capability-canary-verifier-manifest-v1":
        fail("manifest-schema")
    if manifest["qualification"] != {"credit": 0, "current_streak": 0, "current_value": "0/2"}:
        fail("qualification")
    exact_keys(manifest["bindings"], ("canary", "projection_review", "protocol"), "bindings")
    base = manifest_path.parent.resolve()
    for name, binding in manifest["bindings"].items():
        path = confined(base, binding.get("path"), f"binding-{name}")
        read_bound(path, binding, f"binding-{name}")
    cases = manifest["cases"]
    if not isinstance(cases, list) or len(cases) != 3:
        fail("case-count")
    roster = [(case.get("slot"), case.get("requested_model"), case.get("requested_reasoning_effort")) for case in cases]
    if roster != [
        ("alpha", "gpt-5.4-mini", "xhigh"),
        ("bravo", "gpt-5.4-mini", "medium"),
        ("charlie", "gpt-5.6-luna", "medium"),
    ]:
        fail("route-roster")
    for field in ("case_id", "goal_thread_id", "task_path"):
        values = [case.get(field) for case in cases]
        if len(set(values)) != len(values):
            fail(f"reuse:{field}")
    subject_paths = [case.get("subject", {}).get("path") for case in cases]
    trace_paths = [case.get("trace", {}).get("relative_path") for case in cases]
    if len(set(subject_paths)) != 3 or len(set(trace_paths)) != 3:
        fail("path-reuse")
    results = [verify_case(case, workspace, session_root, subject_paths) for case in cases]
    return {
        "case_count": len(results),
        "cases": results,
        "first_mismatch": None,
        "qualification_credit": 0,
        "schema_id": "pw-r9-codex-native-goal-direct-raw-rollout-verifier-result-v1",
        "spawn_plaintext_trace_attested": False,
        "status": "PASS_ZERO_CREDIT",
        "workspace_writes": 0,
    }


def main():
    parser = argparse.ArgumentParser(add_help=False)
    parser.add_argument("--manifest", required=True)
    parser.add_argument("--workspace-root", required=True)
    parser.add_argument("--session-root", required=True)
    parser.add_argument("--check", action="store_true")
    args, extra = parser.parse_known_args()
    if extra or not args.check:
        result = {
            "case_count": 0,
            "first_mismatch": "CLI",
            "qualification_credit": 0,
            "schema_id": "pw-r9-codex-native-goal-direct-raw-rollout-verifier-result-v1",
            "status": "FAIL",
            "workspace_writes": 0,
        }
        print(canonical(result))
        return 1
    try:
        result = run(args)
        code = 0
    except (Invalid, OSError) as exc:
        result = {
            "case_count": 0,
            "first_mismatch": str(exc),
            "qualification_credit": 0,
            "schema_id": "pw-r9-codex-native-goal-direct-raw-rollout-verifier-result-v1",
            "status": "FAIL",
            "workspace_writes": 0,
        }
        code = 1
    print(canonical(result))
    return code


if __name__ == "__main__":
    sys.exit(main())
