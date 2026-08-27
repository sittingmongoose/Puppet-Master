#!/usr/bin/env python3
import hashlib
import importlib.util
import json
import math
import os
import re
import shlex
import stat
import sys

sys.dont_write_bytecode = True
ROW = "/mnt/Cursor/PuppetMaster/tests/r9g22/r/CAP02/e340bb140e88bb12d09275e54cd6aebd036d9818e8cd53da901deaf1d9e99d58"
TRACE = "/home/sittingmongoose/.codex/sessions/2026/08/24/rollout-2026-08-24T06-16-41-01a03269-fcdf-7d41-bb4b-f03e11b229d1.jsonl"
TRACE_BYTES = 95773
TRACE_SHA256 = "e825abdb5dd77ad8112d6d802f9f5bb7a0cf1a61e31ef7c4f1ac7877544d2e2a"
CODEC = "/mnt/Cursor/PuppetMaster/tests/r9g17/native_envelope.py"
CODEC_BYTES = 4661
CODEC_SHA256 = "d2aef9d619f6c4ec779e6d2dce2d1b6fc89282fd91cc4b9f56bc82490df0f246"
SKILL = "/mnt/Cursor/PuppetMaster/.agents/skills/r9-goal-atom-bootstrap/SKILL.md"
SKILL_BYTES = 1327
SKILL_SHA256 = "7fba245c05b7fb104054ea18af4d0a2fd90d4f28f295c94f7c12b699b343d8b4"
TASK = "/root/r9_cg15cap_e340bb140e88bb12d09275e54cd6aebd036d9818e8cd53da901deaf1d9e99d58"
THREAD = "01a03269-fcdf-7d41-bb4b-f03e11b229d1"
TURN = "01a03269-fdb8-7361-87d8-97c620463e83"
OBJECTIVE = "CG15CAP|x=e340bb140e88bb12d09275e54cd6aebd036d9818e8cd53da901deaf1d9e99d58|once"
UUID = re.compile(r"^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$")


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


def read_bound(path, mode, size, digest):
    before = os.lstat(path)
    require(stat.S_ISREG(before.st_mode) and not stat.S_ISLNK(before.st_mode) and stat.S_IMODE(before.st_mode) == mode and before.st_uid == os.getuid() and before.st_nlink == 1 and before.st_size == size, "custody:" + path)
    fd = os.open(path, os.O_RDONLY | os.O_NOFOLLOW | os.O_CLOEXEC)
    try:
        require(metadata(os.fstat(fd)) == metadata(before), "race:" + path)
        raw = b""
        while len(raw) < size:
            part = os.read(fd, size - len(raw))
            require(bool(part), "short:" + path)
            raw += part
        require(os.read(fd, 1) == b"", "trailing:" + path)
    finally:
        os.close(fd)
    require(metadata(os.lstat(path)) == metadata(before) and sha(raw) == digest, "drift:" + path)
    return raw


def read_row(name, mode, size, digest):
    return read_bound(os.path.join(ROW, name), mode, size, digest)


def load_codec():
    raw = read_bound(CODEC, 0o644, CODEC_BYTES, CODEC_SHA256)
    spec = importlib.util.spec_from_file_location("r9g22_verify_codec", CODEC)
    require(spec is not None and spec.loader is not None, "codec-spec")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    require(module.__all__ == ("Invalid", "parse_call", "unwrap_output"), "codec-api")
    return module


def events(raw):
    result = []
    for line in raw.splitlines(keepends=True):
        require(line.endswith(b"\n") and line.count(b"\n") == 1 and b"\r" not in line, "trace-line")
        value = parse(line)
        require(isinstance(value, dict) and set(value) == {"payload", "timestamp", "type"} and isinstance(value["payload"], dict), "trace-event")
        result.append((line, value))
    require(bool(result), "trace-empty")
    return result


def typed(items, outer, inner):
    return [(index, value["payload"]) for index, (_, value) in enumerate(items) if value["type"] == outer and value["payload"].get("type") == inner]


def output_text(codec, call, output, tool):
    require(call.get("call_id") == output.get("call_id") and call.get("name") == "exec" and call.get("type") == "custom_tool_call" and output.get("type") == "custom_tool_call_output", "pair:" + tool)
    decoded = codec.parse_call(call.get("input"))
    require(decoded["tool"] == tool, "tool:" + tool)
    return decoded["arguments"], codec.unwrap_output(output.get("output"))


def goal(raw, status):
    value = parse(raw.encode("utf-8"))
    require(set(value) == {"completionBudgetReport", "goal", "remainingTokens"} and value["remainingTokens"] is None, "goal-envelope")
    item = value["goal"]
    require(item["threadId"] == THREAD and item["objective"] == OBJECTIVE and item["status"] == status, "goal-binding")
    require(UUID.fullmatch(item["threadId"] or "") and all(isinstance(item[key], int) and not isinstance(item[key], bool) and item[key] >= 0 for key in ("createdAt", "updatedAt", "timeUsedSeconds", "tokensUsed")), "goal-types")
    if status == "active":
        require(item["tokensUsed"] == 0 and item["timeUsedSeconds"] == 0 and value["completionBudgetReport"] is None, "goal-active")
    else:
        require(item["tokensUsed"] == 1946 and item["timeUsedSeconds"] == 6 and isinstance(value["completionBudgetReport"], str), "goal-complete")
    return item


def safe_skill(arguments, output, skill):
    allowed = {"cmd", "login", "max_output_tokens", "workdir", "yield_time_ms"}
    require({"cmd", "workdir"} <= set(arguments) <= allowed and arguments.get("login", False) is False and arguments["workdir"] == "/mnt/Cursor/PuppetMaster", "skill-fields")
    words = shlex.split(arguments["cmd"], posix=True)
    require(len(words) == 4 and words[:2] == ["sed", "-n"], "skill-program")
    match = re.fullmatch(r"1,([1-9][0-9]{0,3})p", words[2])
    require(match is not None and int(match.group(1)) >= skill.count(b"\n"), "skill-range")
    path = words[3] if os.path.isabs(words[3]) else os.path.join(arguments["workdir"], words[3])
    require(os.path.realpath(path) == SKILL and output.encode("utf-8") == skill, "skill-identity")


def main(argv):
    require(argv == [sys.argv[0], "--check"], "argv")
    before = os.lstat(ROW)
    require(stat.S_ISDIR(before.st_mode) and stat.S_IMODE(before.st_mode) == 0o700 and before.st_uid == os.getuid(), "row-custody")
    require(sorted(os.listdir(ROW)) == ["active.json", "active_trace.jsonl", "predeclaration.json", "subject.packet", "subject.txt", "wait.py"], "row-inventory")
    pre_raw = read_row("predeclaration.json", 0o444, 1018, "114d2cc6e2129bb4e9ceee0e046281099b2c0d03ce30bd771a777e8d3d0b6110")
    packet = read_row("subject.packet", 0o444, 187, "9e8b0500829b2e44e9ae666f6e0717c4fa971b36932c5ccbe162cab478366e3d")
    require(read_row("subject.txt", 0o444, 187, "9e8b0500829b2e44e9ae666f6e0717c4fa971b36932c5ccbe162cab478366e3d") == packet, "subject-copy")
    read_row("wait.py", 0o444, 121, "845ec0bb3b95a2111d9ee815450c48fd3170caf93e5d9f0ab1ff3c2f83484cde")
    active_raw = read_row("active_trace.jsonl", 0o444, 86992, "116a1f4eb36d979fce650b51229085042ff9f4a79c4fdc200adf18c0a9c085a0")
    active = parse(read_row("active.json", 0o444, 653, "e27cabf76a935a7897e0d25d310a7edc171fa7fb31aad89a40ccb82154217a2d"))
    trace = read_bound(TRACE, 0o664, TRACE_BYTES, TRACE_SHA256)
    require(trace.startswith(active_raw), "active-prefix")
    pre = parse(pre_raw)
    require(pre["goal_objective"] == OBJECTIVE and pre["task_path"] == TASK and pre["subject_sha256"] == sha(packet), "pre-bindings")
    require(active == {"atom_id": "CAP02", "goal_thread_id": THREAD, "profile": "SAFE_SKILL_READ_SELF_ATTESTED_V15", "qualification_credit": 0, "schema_id": "pw-r9-codex-native-goal-safe-skill-read-capability-active-v15", "status": "ACTIVE_ATTESTED_SUBJECT_RELEASED_ZERO_CREDIT", "task_path": TASK, "trace": {"bytes": len(active_raw), "path": TRACE, "sha256": sha(active_raw)}, "turn_id": TURN}, "active-receipt")
    data = events(trace)
    sessions = [(i, e["payload"]) for i, (_, e) in enumerate(data) if e["type"] == "session_meta"]
    require(len(sessions) == 1 and sessions[0][0] == 0 and sessions[0][1]["id"] == THREAD and sessions[0][1]["agent_path"] == TASK and sessions[0][1]["parent_thread_id"] == "01a00b52-4879-7c41-a826-7b4609ad3c3b", "session")
    turns = [(i, e["payload"]) for i, (_, e) in enumerate(data) if e["type"] == "turn_context"]
    require(len(turns) == 1 and turns[0][1]["turn_id"] == TURN and turns[0][1]["model"] == "gpt-5.6-luna" and turns[0][1]["effort"] == "medium" and turns[0][1]["cwd"] == "/mnt/Cursor/PuppetMaster", "turn")
    direct = typed(data, "response_item", "function_call") + typed(data, "response_item", "function_call_output")
    wrapped = sorted(typed(data, "response_item", "custom_tool_call") + typed(data, "response_item", "custom_tool_call_output"))
    require(not direct and len(wrapped) == 8, "tool-count")
    indexes = [index for index, _ in wrapped]
    require(indexes == sorted(indexes) and len(set(indexes)) == 8, "tool-order")
    values = [value for _, value in wrapped]
    codec = load_codec()
    skill = read_bound(SKILL, 0o644, SKILL_BYTES, SKILL_SHA256)
    args0, out0 = output_text(codec, values[0], values[1], "exec_command")
    safe_skill(args0, out0, skill)
    args1, out1 = output_text(codec, values[2], values[3], "create_goal")
    require(args1 == {"objective": OBJECTIVE}, "create-args")
    goal(out1, "active")
    args2, out2 = output_text(codec, values[4], values[5], "exec_command")
    require(args2 == {"cmd": "python3 -B wait.py " + THREAD, "max_output_tokens": 128, "workdir": ROW, "yield_time_ms": 30000} and out2.encode("utf-8") == packet, "waiter")
    args3, out3 = output_text(codec, values[6], values[7], "update_goal")
    require(args3 == {"status": "complete"}, "update-args")
    goal(out3, "complete")
    require(packet.decode("utf-8") not in active_raw.decode("utf-8"), "subject-before-active")
    complete = typed(data, "event_msg", "task_complete")
    require(len(complete) == 1 and complete[0][1]["turn_id"] == TURN and complete[0][1]["last_agent_message"] == "OK", "task-complete")
    require(metadata(os.lstat(ROW)) == metadata(before), "row-drift")
    result = {"assertion_count": 35, "first_mismatch": None, "goal_thread_id": THREAD, "qualification_credit": 0, "schema_id": "pw-r9-codex-native-goal-safe-skill-read-capability-offline-check-v15", "status": "PASS_ONE_FRESH_GOAL_CAPABILITY_ZERO_CREDIT", "subject_calls": 1, "workspace_writes": 0}
    sys.stdout.buffer.write(canonical(result))
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main(sys.argv))
    except (Invalid, OSError, UnicodeError, KeyError, TypeError, ValueError) as error:
        sys.stderr.write("FAIL:" + str(error) + "\n")
        raise SystemExit(1)
