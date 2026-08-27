#!/usr/bin/env python3
import argparse
import datetime
import hashlib
import json
import math
import os
import stat
import sys
from pathlib import Path

sys.dont_write_bytecode = True
ROOT = Path("/mnt/Cursor/PuppetMaster")
MANIFEST_KEYS = {"architecture", "architecture_review", "authority", "case", "declared_spawn_prompt", "expected", "goal", "preservation", "schema_id", "status", "trace"}
PRE_KEYS = {"case_id", "expected_result_sha256", "fresh_run_id", "mailbox_relative_path", "objective", "requested_model", "requested_reasoning_effort", "schema_id", "subject_bytes", "subject_sha256", "task_path", "waiter_bytes", "waiter_sha256"}
READY_KEYS = {"case_id", "fresh_run_id", "goal_thread_id", "pid", "request_sha256", "schema_id", "waiter_sha256"}


class Invalid(Exception):
    pass


ASSERTIONS = 0


def require(condition, code):
    global ASSERTIONS
    ASSERTIONS += 1
    if not condition:
        raise Invalid(code)


def pairs(items):
    out = {}
    for key, value in items:
        if key in out:
            raise Invalid("DUPLICATE_KEY")
        out[key] = value
    return out


def finite(value):
    if isinstance(value, float) and not math.isfinite(value):
        return False
    if isinstance(value, dict):
        return all(isinstance(key, str) and finite(item) for key, item in value.items())
    if isinstance(value, list):
        return all(finite(item) for item in value)
    return True


def decode(raw, code):
    try:
        value = json.loads(raw.decode("utf-8"), object_pairs_hook=pairs, parse_constant=lambda token: (_ for _ in ()).throw(Invalid(code + "_NONFINITE")))
    except (UnicodeError, json.JSONDecodeError) as exc:
        raise Invalid(code + "_JSON") from exc
    require(finite(value), code + "_FINITE")
    return value


def canonical(value):
    return json.dumps(value, ensure_ascii=False, allow_nan=False, separators=(",", ":"), sort_keys=True).encode("utf-8") + b"\n"


def read_bound(path, expected, code):
    before = os.lstat(path)
    require(stat.S_ISREG(before.st_mode), code + "_REGULAR")
    require(not stat.S_ISLNK(before.st_mode), code + "_NONLINK")
    require(stat.S_IMODE(before.st_mode) == int(expected["mode"], 8), code + "_MODE")
    require(before.st_uid == os.getuid(), code + "_OWNER")
    require(before.st_nlink == 1, code + "_NLINK")
    flags = os.O_RDONLY | os.O_CLOEXEC
    if hasattr(os, "O_NOFOLLOW"):
        flags |= os.O_NOFOLLOW
    fd = os.open(path, flags)
    try:
        opened = os.fstat(fd)
        require((opened.st_dev, opened.st_ino, opened.st_size) == (before.st_dev, before.st_ino, before.st_size), code + "_OPEN_IDENTITY")
        raw = b""
        while True:
            chunk = os.read(fd, 1 << 20)
            if not chunk:
                break
            raw += chunk
            require(len(raw) <= expected["bytes"], code + "_BOUNDED")
    finally:
        os.close(fd)
    after = os.lstat(path)
    require((after.st_dev, after.st_ino, after.st_size, after.st_mtime_ns) == (before.st_dev, before.st_ino, before.st_size, before.st_mtime_ns), code + "_DRIFT")
    require(len(raw) == expected["bytes"], code + "_BYTES")
    require(hashlib.sha256(raw).hexdigest() == expected["sha256"], code + "_SHA256")
    if "mtime_ns" in expected:
        require(after.st_mtime_ns == expected["mtime_ns"], code + "_MTIME")
    return raw


def read_unbound(path, mode, limit, code):
    before = os.lstat(path)
    require(stat.S_ISREG(before.st_mode) and not stat.S_ISLNK(before.st_mode), code + "_REGULAR")
    require(stat.S_IMODE(before.st_mode) == mode and before.st_uid == os.getuid() and before.st_nlink == 1, code + "_CUSTODY")
    flags = os.O_RDONLY | os.O_CLOEXEC
    if hasattr(os, "O_NOFOLLOW"):
        flags |= os.O_NOFOLLOW
    fd = os.open(path, flags)
    try:
        opened = os.fstat(fd)
        require((opened.st_dev, opened.st_ino, opened.st_size) == (before.st_dev, before.st_ino, before.st_size), code + "_OPEN_IDENTITY")
        require(opened.st_size <= limit, code + "_BOUNDED")
        raw = b""
        while len(raw) < opened.st_size:
            chunk = os.read(fd, opened.st_size - len(raw))
            require(bool(chunk), code + "_SHORT_READ")
            raw += chunk
    finally:
        os.close(fd)
    after = os.lstat(path)
    require((after.st_dev, after.st_ino, after.st_size, after.st_mtime_ns) == (before.st_dev, before.st_ino, before.st_size, before.st_mtime_ns), code + "_DRIFT")
    return raw


def iso_epoch(text):
    require(isinstance(text, str) and text.endswith("Z"), "TRACE_TIMESTAMP")
    return datetime.datetime.fromisoformat(text[:-1] + "+00:00").timestamp()


def output_text(payload):
    output = payload.get("output")
    require(isinstance(output, list) and len(output) == 2, "TOOL_OUTPUT_SHAPE")
    require(output[0].get("type") == "input_text" and output[1].get("type") == "input_text", "TOOL_OUTPUT_TYPES")
    require(output[0].get("text", "").startswith("Script completed\nWall time "), "TOOL_OUTPUT_WRAPPER")
    return output[1].get("text")


def check(manifest_path):
    require(manifest_path.is_absolute(), "MANIFEST_ABSOLUTE")
    manifest_raw = read_unbound(manifest_path, 0o644, 16384, "MANIFEST")
    manifest = decode(manifest_raw, "MANIFEST")
    require(isinstance(manifest, dict) and set(manifest) == MANIFEST_KEYS, "MANIFEST_FIELDS")
    require(canonical(manifest) == manifest_raw, "MANIFEST_CANONICAL")
    require(manifest["schema_id"] == "pw-r9-codex-native-goal-blocking-mailbox-capability-001-manifest-v1", "MANIFEST_SCHEMA")
    require(manifest["status"] == "CAPABILITY_COMPLETED_PENDING_OFFLINE_VERIFICATION_ZERO_CREDIT", "MANIFEST_STATUS")
    require(manifest["authority"] == {"canary_launch": False, "matrix_launch": False, "offline_verification": True, "qualification": False, "release": False}, "AUTHORITY")
    require(manifest["preservation"] == {"clean_full_matrix_streak": 0, "failed_families": "UNCHANGED", "matrix_007": "UNLAUNCHED", "matrix_008": "UNLAUNCHED", "omp": "FROZEN_SEPARATE_COMPARATOR", "qualification": "0/2"}, "PRESERVATION")

    owner = manifest_path.parent
    for field, code in (("architecture", "ARCHITECTURE"), ("architecture_review", "ARCHITECTURE_REVIEW")):
        bound = manifest[field]
        require(set(bound) == {"bytes", "mode", "path", "sha256"}, code + "_FIELDS")
        require("/" not in bound["path"], code + "_BASENAME")
        read_bound(owner / bound["path"], bound, code)

    case = manifest["case"]
    require(set(case) == {"directory_mode", "directory_relative_path", "files", "inventory"}, "CASE_FIELDS")
    relative = case["directory_relative_path"]
    require(isinstance(relative, str) and not os.path.isabs(relative) and ".." not in relative.split("/"), "CASE_RELATIVE")
    case_dir = ROOT / relative
    case_stat = os.lstat(case_dir)
    require(stat.S_ISDIR(case_stat.st_mode) and not stat.S_ISLNK(case_stat.st_mode), "CASE_DIRECTORY")
    require(stat.S_IMODE(case_stat.st_mode) == int(case["directory_mode"], 8) and case_stat.st_uid == os.getuid(), "CASE_CUSTODY")
    inventory = sorted(entry.name for entry in os.scandir(case_dir))
    require(inventory == case["inventory"] == ["predeclaration.json", "ready.json", "subject.txt", "wait.py"], "CASE_INVENTORY")
    require(set(case["files"]) == set(inventory), "CASE_FILE_BINDINGS")
    case_raw = {}
    for name in inventory:
        case_raw[name] = read_bound(case_dir / name, case["files"][name], "CASE_" + name.upper().replace(".", "_"))

    pre = decode(case_raw["predeclaration.json"], "PREDECLARATION")
    require(isinstance(pre, dict) and set(pre) == PRE_KEYS and canonical(pre) == case_raw["predeclaration.json"], "PREDECLARATION_SHAPE")
    require(pre["schema_id"] == "pw-r9-codex-native-goal-blocking-mailbox-predeclaration-v1", "PREDECLARATION_SCHEMA")
    require(pre["mailbox_relative_path"] == relative, "PREDECLARATION_MAILBOX")
    require(pre["waiter_bytes"] == len(case_raw["wait.py"]) and pre["waiter_sha256"] == hashlib.sha256(case_raw["wait.py"]).hexdigest(), "PREDECLARATION_WAITER")
    require(pre["subject_bytes"] == len(case_raw["subject.txt"]) and pre["subject_sha256"] == hashlib.sha256(case_raw["subject.txt"]).hexdigest(), "PREDECLARATION_SUBJECT")

    ready = decode(case_raw["ready.json"], "READY")
    require(isinstance(ready, dict) and set(ready) == READY_KEYS and canonical(ready) == case_raw["ready.json"], "READY_SHAPE")
    require(ready["schema_id"] == "pw-r9-codex-native-goal-blocking-mailbox-ready-v1", "READY_SCHEMA")
    require(ready["case_id"] == pre["case_id"] and ready["fresh_run_id"] == pre["fresh_run_id"], "READY_CASE")
    require(ready["request_sha256"] == hashlib.sha256(case_raw["predeclaration.json"]).hexdigest() and ready["waiter_sha256"] == pre["waiter_sha256"], "READY_BINDINGS")
    require(isinstance(ready["pid"], int) and not isinstance(ready["pid"], bool) and ready["pid"] > 1, "READY_PID")

    goal = manifest["goal"]
    require(set(goal) == {"active_created_at", "complete_updated_at", "objective", "thread_id"}, "GOAL_FIELDS")
    require(goal["thread_id"] == ready["goal_thread_id"] and goal["objective"] == pre["objective"], "GOAL_BINDING")
    require(pre["task_path"] == "/root/goal_blocking_mailbox_capability_001", "TASK_PATH")
    require(pre["requested_model"] == "gpt-5.6-luna" and pre["requested_reasoning_effort"] == "medium", "REQUESTED_ROUTE")

    prompt = manifest["declared_spawn_prompt"]
    require(set(prompt) == {"bytes", "platform_plaintext_receipt", "sha256", "status", "utf8"}, "PROMPT_FIELDS")
    prompt_raw = prompt["utf8"].encode("utf-8")
    require(len(prompt_raw) == prompt["bytes"] <= 512 and hashlib.sha256(prompt_raw).hexdigest() == prompt["sha256"], "PROMPT_IDENTITY")
    require(prompt["platform_plaintext_receipt"] is False and prompt["status"] == "PARENT_DECLARED_ZERO_CREDIT_RESIDUAL", "PROMPT_NONCLAIM")

    expected = manifest["expected"]
    require(set(expected) == {"command", "final", "goal_tool_order", "max_output_tokens", "subject_stdout", "workdir", "yield_time_ms"}, "EXPECTED_FIELDS")
    require(expected["workdir"] == str(case_dir), "EXPECTED_WORKDIR")
    require(expected["command"] == "python3 -B wait.py " + goal["thread_id"], "EXPECTED_COMMAND")
    require(expected["goal_tool_order"] == ["create_goal", "exec_command", "update_goal"], "EXPECTED_ORDER")
    require(expected["yield_time_ms"] == 30000 and expected["max_output_tokens"] == 128, "EXPECTED_EXEC_OPTIONS")
    require(case_raw["subject.txt"].decode("utf-8") == expected["subject_stdout"], "SUBJECT_STDOUT")
    require(hashlib.sha256(expected["final"].encode("utf-8")).hexdigest() == pre["expected_result_sha256"], "EXPECTED_FINAL_HASH")
    require(expected["final"] not in prompt["utf8"] and expected["subject_stdout"].strip() not in prompt["utf8"], "SUBJECT_ABSENT_FROM_PROMPT")

    trace = manifest["trace"]
    require(set(trace) == {"bytes", "mode", "path", "sha256"}, "TRACE_FIELDS")
    trace_path = Path(trace["path"])
    require(trace_path.is_absolute(), "TRACE_ABSOLUTE")
    trace_raw = read_bound(trace_path, trace, "TRACE")
    require(trace_raw.endswith(b"\n") and b"\r" not in trace_raw, "TRACE_FRAMING")
    lines = trace_raw.splitlines()
    require(len(lines) > 0, "TRACE_NONEMPTY")
    events = [decode(line, "TRACE_LINE") for line in lines]
    session = events[0]
    require(session.get("type") == "session_meta", "SESSION_META_FIRST")
    session_payload = session.get("payload", {})
    require(session_payload.get("id") == goal["thread_id"], "SESSION_ID")
    spawn = session_payload.get("source", {}).get("subagent", {}).get("thread_spawn", {})
    require(spawn.get("agent_path") == pre["task_path"] and spawn.get("depth") == 1, "SESSION_TASK")

    calls = [event for event in events if event.get("type") == "response_item" and event.get("payload", {}).get("type") == "custom_tool_call"]
    outputs = [event for event in events if event.get("type") == "response_item" and event.get("payload", {}).get("type") == "custom_tool_call_output"]
    require(len(calls) == 3 and len(outputs) == 3, "TOOL_CARDINALITY")
    require(all(event["payload"].get("name") == "exec" for event in calls), "TOOL_WRAPPER")
    create_input = 'const r = await tools.create_goal({objective:"' + goal["objective"] + '"});\ntext(r);\n'
    exec_input = 'const r = await tools.exec_command({cmd:"' + expected["command"] + '",workdir:"' + expected["workdir"] + '",yield_time_ms:30000,max_output_tokens:128});\ntext(r.output);\nif (r.session_id) text(JSON.stringify(r));\n'
    update_input = 'const r = await tools.update_goal({status:"complete"});\ntext(r);\n'
    require([event["payload"].get("input") for event in calls] == [create_input, exec_input, update_input], "TOOL_ORDER_OR_INPUT")
    require([event["payload"].get("call_id") for event in calls] == [event["payload"].get("call_id") for event in outputs], "TOOL_CALL_BINDING")

    active = decode(output_text(outputs[0]["payload"]).encode("utf-8"), "ACTIVE_RECEIPT")
    complete = decode(output_text(outputs[2]["payload"]).encode("utf-8"), "COMPLETE_RECEIPT")
    require(active.get("goal", {}).get("threadId") == goal["thread_id"] and active.get("goal", {}).get("objective") == goal["objective"] and active.get("goal", {}).get("status") == "active", "ACTIVE_RECEIPT")
    require(active["goal"].get("createdAt") == goal["active_created_at"], "ACTIVE_TIME")
    require(complete.get("goal", {}).get("threadId") == goal["thread_id"] and complete.get("goal", {}).get("objective") == goal["objective"] and complete.get("goal", {}).get("status") == "complete", "COMPLETE_RECEIPT")
    require(complete["goal"].get("updatedAt") == goal["complete_updated_at"] and complete["goal"].get("tokensUsed", 0) > 0, "COMPLETE_TIME")
    require(output_text(outputs[1]["payload"]) == expected["subject_stdout"], "WAIT_OUTPUT")

    final_messages = [event for event in events if event.get("type") == "response_item" and event.get("payload", {}).get("type") == "message" and event.get("payload", {}).get("phase") == "final_answer"]
    require(len(final_messages) == 1, "FINAL_CARDINALITY")
    final_content = final_messages[0]["payload"].get("content")
    require(final_content == [{"type": "output_text", "text": expected["final"]}], "FINAL_EXACT")

    active_ts = iso_epoch(outputs[0]["timestamp"])
    wait_call_ts = iso_epoch(calls[1]["timestamp"])
    ready_ts = case["files"]["ready.json"]["mtime_ns"] / 1_000_000_000
    subject_ts = case["files"]["subject.txt"]["mtime_ns"] / 1_000_000_000
    wait_output_ts = iso_epoch(outputs[1]["timestamp"])
    update_call_ts = iso_epoch(calls[2]["timestamp"])
    final_ts = iso_epoch(final_messages[0]["timestamp"])
    require(active_ts < wait_call_ts <= ready_ts < subject_ts < wait_output_ts < update_call_ts < final_ts, "LIFECYCLE_ORDER")
    require(goal["active_created_at"] <= ready_ts and goal["complete_updated_at"] >= wait_output_ts, "GOAL_TIME_ENVELOPE")
    return {"assertion_count": ASSERTIONS, "canary_launch_authority": False, "check": "PASS", "first_mismatch": None, "matrix_launch_authority": False, "qualification_credit": 0, "schema_id": "pw-r9-codex-native-goal-blocking-mailbox-capability-check-v1", "workspace_writes": 0}


def main():
    parser = argparse.ArgumentParser(add_help=False)
    parser.add_argument("--manifest")
    parser.add_argument("--check", action="store_true")
    args, extra = parser.parse_known_args()
    try:
        require(not extra and args.check and args.manifest is not None, "CLI")
        result = check(Path(args.manifest))
        code = 0
    except (Invalid, OSError, ValueError, KeyError, TypeError) as exc:
        result = {"assertion_count": ASSERTIONS, "canary_launch_authority": False, "check": "FAIL", "first_mismatch": str(exc), "matrix_launch_authority": False, "qualification_credit": 0, "schema_id": "pw-r9-codex-native-goal-blocking-mailbox-capability-check-v1", "workspace_writes": 0}
        code = 1
    sys.stdout.buffer.write(canonical(result))
    raise SystemExit(code)


if __name__ == "__main__":
    main()
