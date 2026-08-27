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
import time

sys.dont_write_bytecode = True
HERE = "/mnt/Cursor/PuppetMaster/tests/r9g23"
ROOT = HERE + "/r"
RECIPE_PATH = HERE + "/review_recipe.json"
RECIPE_BYTES = 8282
RECIPE_SHA256 = "6fab5fa043ee7233f35842dcd7579fb853000e3677e57849ec5f20e61ef4f78d"
SKILL_PATH = "/mnt/Cursor/PuppetMaster/.agents/skills/r9-goal-atom-bootstrap/SKILL.md"
SKILL_BYTES = 1327
SKILL_SHA256 = "7fba245c05b7fb104054ea18af4d0a2fd90d4f28f295c94f7c12b699b343d8b4"
CODEC_PATH = "/mnt/Cursor/PuppetMaster/tests/r9g17/native_envelope.py"
CODEC_BYTES = 4661
CODEC_SHA256 = "d2aef9d619f6c4ec779e6d2dce2d1b6fc89282fd91cc4b9f56bc82490df0f246"
ARCH = "e2b0e0fe1863dc15025d1e10fee98e133646c96dda4f9c0dca43744931441f75"
PARENT = "01a00b52-4879-7c41-a826-7b4609ad3c3b"
MODEL = "gpt-5.6-luna"
EFFORT = "medium"
ATOM_RE = re.compile(r"^A(?:0[1-9]|1[0-8])$")
HEX_RE = re.compile(r"^[0-9a-f]{64}$")
UUID_RE = re.compile(r"^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$")
TOKEN_RE = re.compile(r"^[A-Z0-9_]{1,48}$")


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
    require(stat.S_ISREG(before.st_mode) and not stat.S_ISLNK(before.st_mode), "kind:" + path)
    require(stat.S_IMODE(before.st_mode) == mode and before.st_uid == os.getuid() and before.st_nlink == 1 and before.st_size <= cap, "custody:" + path)
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


def load_codec():
    raw = read_bound(CODEC_PATH, 0o644, CODEC_BYTES, CODEC_BYTES, CODEC_SHA256)
    spec = importlib.util.spec_from_file_location("r9g23_record_codec", CODEC_PATH)
    require(spec is not None and spec.loader is not None, "codec-spec")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    require(module.__all__ == ("Invalid", "parse_call", "unwrap_output"), "codec-api")
    return module


def load_recipe():
    raw = read_bound(RECIPE_PATH, 0o644, RECIPE_BYTES, RECIPE_BYTES, RECIPE_SHA256)
    value = parse(raw)
    require(raw == canonical(value) and len(value["atoms"]) == 18, "recipe")
    return value


def row_for(atom_id):
    require(ATOM_RE.fullmatch(atom_id or ""), "atom-id")
    atom_dir = ROOT + "/" + atom_id
    names = os.listdir(atom_dir)
    require(len(names) == 1 and HEX_RE.fullmatch(names[0]), "row-name")
    return atom_dir + "/" + names[0]


def events(raw):
    require(raw.endswith(b"\n") and b"\r" not in raw, "trace-framing")
    result = []
    for line in raw.splitlines(keepends=True):
        require(line.endswith(b"\n") and line.count(b"\n") == 1 and line != b"\n", "trace-line")
        value = parse(line)
        require(isinstance(value, dict) and set(value) == {"payload", "timestamp", "type"} and isinstance(value["payload"], dict), "trace-event")
        result.append(value)
    require(bool(result), "trace-empty")
    return result


def typed(items, outer, inner=None):
    return [(index, value["payload"]) for index, value in enumerate(items) if value["type"] == outer and (inner is None or value["payload"].get("type") == inner)]


def pair(codec, call, output, tool):
    require(call.get("call_id") == output.get("call_id") and call.get("name") == "exec" and call.get("type") == "custom_tool_call" and output.get("type") == "custom_tool_call_output", "pair:" + tool)
    decoded = codec.parse_call(call.get("input"))
    require(decoded["tool"] == tool, "tool:" + tool)
    return decoded["arguments"], codec.unwrap_output(output.get("output"))


def goal(text, thread, objective, status):
    value = parse(text.encode("utf-8"))
    require(set(value) == {"completionBudgetReport", "goal", "remainingTokens"} and value["remainingTokens"] is None, "goal-envelope")
    item = value["goal"]
    require(set(item) == {"createdAt", "objective", "status", "threadId", "timeUsedSeconds", "tokensUsed", "updatedAt"}, "goal-fields")
    require((item["threadId"], item["objective"], item["status"]) == (thread, objective, status), "goal-binding")
    require(UUID_RE.fullmatch(thread) and all(isinstance(item[key], int) and not isinstance(item[key], bool) and item[key] >= 0 for key in ("createdAt", "updatedAt", "timeUsedSeconds", "tokensUsed")), "goal-types")
    require(item["createdAt"] > 0 and item["updatedAt"] >= item["createdAt"], "goal-time")
    if status == "active":
        require(item["tokensUsed"] == 0 and item["timeUsedSeconds"] == 0 and value["completionBudgetReport"] is None, "goal-active")
    else:
        require(isinstance(value["completionBudgetReport"], str), "goal-complete")
    return item


def safe_skill(arguments, output, skill):
    allowed = {"cmd", "login", "max_output_tokens", "workdir", "yield_time_ms"}
    require(isinstance(arguments, dict) and {"cmd", "workdir"} <= set(arguments) <= allowed and arguments.get("login", False) is False and arguments["workdir"] == "/mnt/Cursor/PuppetMaster", "skill-fields")
    words = shlex.split(arguments["cmd"], posix=True)
    require(len(words) == 4 and words[:2] == ["sed", "-n"], "skill-program")
    match = re.fullmatch(r"1,([1-9][0-9]{0,3})p", words[2])
    require(match is not None and int(match.group(1)) >= skill.count(b"\n"), "skill-range")
    path = words[3] if os.path.isabs(words[3]) else os.path.join(arguments["workdir"], words[3])
    require(os.path.realpath(path) == SKILL_PATH and output.encode("utf-8") == skill, "skill-identity")


def validate(atom_id, row, recipe, raw, active_raw, pre, packet, active):
    require(raw.startswith(active_raw) and len(raw) > len(active_raw), "active-prefix")
    data = events(raw)
    sessions = typed(data, "session_meta")
    require(len(sessions) == 1 and sessions[0][0] == 0, "session-count")
    session = sessions[0][1]
    thread = active["goal_thread_id"]
    objective = pre["goal_objective"]
    require(session.get("id") == thread and session.get("agent_path") == pre["task_path"] and session.get("parent_thread_id") == PARENT, "session-identity")
    spawn = session.get("source", {}).get("subagent", {}).get("thread_spawn", {})
    require(spawn.get("agent_path") == pre["task_path"] and spawn.get("parent_thread_id") == PARENT, "spawn-identity")
    turns = typed(data, "turn_context")
    require(len(turns) == 1 and turns[0][1].get("turn_id") == active["turn_id"] and turns[0][1].get("model") == MODEL and turns[0][1].get("effort") == EFFORT and turns[0][1].get("cwd") == "/mnt/Cursor/PuppetMaster", "turn")
    direct = typed(data, "response_item", "function_call") + typed(data, "response_item", "function_call_output")
    wrapped = sorted(typed(data, "response_item", "custom_tool_call") + typed(data, "response_item", "custom_tool_call_output"))
    require(not direct and len(wrapped) == 8, "tool-profile")
    indexes = [index for index, _ in wrapped]
    require(indexes == sorted(indexes) and len(set(indexes)) == 8, "tool-order")
    values = [value for _, value in wrapped]
    codec = load_codec()
    skill = read_bound(SKILL_PATH, 0o644, SKILL_BYTES, SKILL_BYTES, SKILL_SHA256)
    args0, out0 = pair(codec, values[0], values[1], "exec_command")
    safe_skill(args0, out0, skill)
    args1, out1 = pair(codec, values[2], values[3], "create_goal")
    require(args1 == {"objective": objective}, "create-args")
    active_goal = goal(out1, thread, objective, "active")
    args2, out2 = pair(codec, values[4], values[5], "exec_command")
    require(args2 == {"cmd": "python3 -B wait.py " + thread, "max_output_tokens": 128, "workdir": row, "yield_time_ms": 30000} and out2.encode("utf-8") == packet, "waiter")
    args3, out3 = pair(codec, values[6], values[7], "update_goal")
    require(args3 == {"status": "complete"}, "update-args")
    complete_goal = goal(out3, thread, objective, "complete")
    finals = []
    for index, value in typed(data, "response_item", "message"):
        if value.get("phase") == "final_answer":
            content = value.get("content")
            require(isinstance(content, list) and len(content) == 1 and content[0].get("type") == "output_text" and isinstance(content[0].get("text"), str), "final-shape")
            finals.append((index, content[0]["text"]))
    require(len(finals) == 1 and TOKEN_RE.fullmatch(finals[0][1] or ""), "final-token")
    atom = next(item for item in recipe["atoms"] if item["id"] == atom_id)
    require(finals[0][1] in {"PASS", atom["fail_token"]}, "final-value")
    completes = typed(data, "event_msg", "task_complete")
    require(len(completes) == 1 and completes[0][0] == len(data) - 1 and completes[0][1].get("turn_id") == active["turn_id"] and completes[0][1].get("last_agent_message") == finals[0][1], "task-complete")
    require(wrapped[-1][0] < finals[0][0] < completes[0][0], "terminal-order")
    require(packet.decode("utf-8") not in active_raw.decode("utf-8"), "subject-before-active")
    return {"active_goal": active_goal, "complete_goal": complete_goal, "result": finals[0][1], "thread_id": thread, "turn_id": active["turn_id"]}


def fsync_dir(path):
    fd = os.open(path, os.O_RDONLY | os.O_DIRECTORY | os.O_NOFOLLOW | os.O_CLOEXEC)
    try:
        os.fsync(fd)
    finally:
        os.close(fd)


def write_all(fd, raw):
    view = memoryview(raw)
    while view:
        count = os.write(fd, view)
        require(count > 0, "write")
        view = view[count:]


def publish(path, raw):
    fd = os.open(path, os.O_WRONLY | os.O_CREAT | os.O_EXCL | os.O_NOFOLLOW | os.O_CLOEXEC, 0o444)
    try:
        os.fchmod(fd, 0o444)
        write_all(fd, raw)
        os.fsync(fd)
    finally:
        os.close(fd)
    fsync_dir(os.path.dirname(path))
    require(read_bound(path, 0o444, len(raw), len(raw), sha(raw)) == raw, "publish:" + path)


def record(atom_id):
    recipe = load_recipe()
    row = row_for(atom_id)
    require(sorted(os.listdir(row)) == ["active.json", "active_trace.jsonl", "predeclaration.json", "spawn_prompt.txt", "subject.packet", "subject.txt", "wait.py"], "row-state")
    pre_raw = read_bound(row + "/predeclaration.json", 0o444, 8192)
    pre = parse(pre_raw)
    require(pre_raw == canonical(pre) and pre["atom_id"] == atom_id and pre["architecture_sha256"] == ARCH, "pre")
    packet = read_bound(row + "/subject.packet", 0o444, 512, pre["subject_bytes"], pre["subject_sha256"])
    require(read_bound(row + "/subject.txt", 0o444, 512, len(packet), sha(packet)) == packet, "subject-copy")
    active_raw = read_bound(row + "/active_trace.jsonl", 0o444, 500000)
    active_json_raw = read_bound(row + "/active.json", 0o444, 8192)
    active = parse(active_json_raw)
    require(active_json_raw == canonical(active) and active["atom_id"] == atom_id and active["trace"]["bytes"] == len(active_raw) and active["trace"]["sha256"] == sha(active_raw), "active")
    trace_path = active["trace"]["path"]
    require(isinstance(trace_path, str) and trace_path.startswith("/home/sittingmongoose/.codex/sessions/") and os.path.realpath(trace_path) == trace_path, "trace-path")
    terminal1 = read_bound(trace_path, 0o664, 1000000)
    time.sleep(0.05)
    terminal2 = read_bound(trace_path, 0o664, 1000000)
    require(terminal1 == terminal2, "trace-stability")
    proof = validate(atom_id, row, recipe, terminal1, active_raw, pre, packet, active)
    publish(row + "/terminal_trace.jsonl", terminal1)
    publish(row + "/result.txt", proof["result"].encode("ascii") + b"\n")
    receipt = {"active_goal":proof["active_goal"],"atom_id":atom_id,"complete_goal":proof["complete_goal"],"goal_thread_id":proof["thread_id"],"qualification_credit":0,"result":proof["result"],"review_nonce":pre["review_nonce"],"schema_id":"pw-r9-codex-native-goal-current-contract-atomic-review-goal-receipt-v17","status":"PASS_FRESH_GOAL_ATOM_ZERO_CREDIT" if proof["result"] == "PASS" else "FAIL_FRESH_GOAL_ATOM_ZERO_CREDIT","task_path":pre["task_path"],"traces":{"active":{"bytes":len(active_raw),"sha256":sha(active_raw)},"terminal":{"bytes":len(terminal1),"sha256":sha(terminal1)}},"turn_count":1,"turn_id":proof["turn_id"]}
    publish(row + "/goal_receipt.json", canonical(receipt))
    sys.stdout.buffer.write(canonical(receipt))


def main(argv):
    require(len(argv) == 3 and argv[1] == "--record", "argv")
    record(argv[2])
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main(sys.argv))
    except (Invalid, OSError, UnicodeError, json.JSONDecodeError, KeyError, StopIteration, TypeError, ValueError) as error:
        sys.stderr.write("FAIL:" + str(error) + "\n")
        raise SystemExit(1)
