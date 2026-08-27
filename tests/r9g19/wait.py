#!/usr/bin/env python3
import glob
import hashlib
import json
import math
import os
import re
import stat
import sys
import time
import types

sys.dont_write_bytecode = True
ROOT = "/mnt/Cursor/PuppetMaster/tests/r9g19/r"
SESSION_GLOB = "/home/sittingmongoose/.codex/sessions/*/*/*/*-{}.jsonl"
CODEC_PATH = "/mnt/Cursor/PuppetMaster/tests/r9g17/native_envelope.py"
ARCH = "b31e34fe302c6c9b17478cea888c1c26beea4b26179daa9a0600572645335352"
COMPILER = "ecdf00449c2a16c4b05e34cd7a1a03159ed5a3ba88cabe5f93fe8c7ac4a97011"
RECIPE = "100386642d6680db468c1e9a0ddf7c2c774728f4444e540ca2d655fe8669f690"
SKILL = "7fba245c05b7fb104054ea18af4d0a2fd90d4f28f295c94f7c12b699b343d8b4"
CODEC_BYTES = 4661
CODEC_SHA256 = "d2aef9d619f6c4ec779e6d2dce2d1b6fc89282fd91cc4b9f56bc82490df0f246"
PARENT = "01a00b52-4879-7c41-a826-7b4609ad3c3b"
MODEL = "gpt-5.6-luna"
EFFORT = "medium"
SKILL_PATH = "/mnt/Cursor/PuppetMaster/.agents/skills/r9-goal-atom-bootstrap/SKILL.md"
SKILL_ARGS = {"cmd": "sed -n 1,80p .agents/skills/r9-goal-atom-bootstrap/SKILL.md", "max_output_tokens": 3000, "workdir": "/mnt/Cursor/PuppetMaster", "yield_time_ms": 10000}
PRE = {"architecture_sha256", "atom_id", "bootstrap_skill_sha256", "goal_objective", "model_requested", "native_envelope_bytes", "native_envelope_sha256", "packet_compiler_sha256", "reasoning_effort_requested", "recipe_sha256", "review_nonce", "schema_id", "subject_bytes", "subject_sha256", "subject_source_sha256", "task_path", "waiter_bytes", "waiter_sha256"}
UUID = re.compile(r"^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$")
HEX = re.compile(r"^[0-9a-f]{64}$")
ATOM = re.compile(r"^A(?:0[1-9]|1[0-8])$")


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


def read_path(path, mode, size, digest):
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


def read_file(dirfd, name, mode, limit):
    before = os.stat(name, dir_fd=dirfd, follow_symlinks=False)
    require(stat.S_ISREG(before.st_mode) and stat.S_IMODE(before.st_mode) == mode and before.st_uid == os.getuid() and before.st_nlink == 1 and before.st_size <= limit, "custody:" + name)
    fd = os.open(name, os.O_RDONLY | os.O_NOFOLLOW | os.O_CLOEXEC, dir_fd=dirfd)
    try:
        require(metadata(os.fstat(fd)) == metadata(before), "race:" + name)
        raw = b""
        while len(raw) < before.st_size:
            part = os.read(fd, before.st_size - len(raw))
            require(bool(part), "short:" + name)
            raw += part
        require(os.read(fd, 1) == b"", "trailing:" + name)
    finally:
        os.close(fd)
    require(metadata(os.stat(name, dir_fd=dirfd, follow_symlinks=False)) == metadata(before), "drift:" + name)
    return raw


def write_all(fd, raw):
    view = memoryview(raw)
    while view:
        count = os.write(fd, view)
        require(count > 0, "write")
        view = view[count:]


def publish_raw(dirfd, name, raw):
    fd = os.open(name, os.O_WRONLY | os.O_CREAT | os.O_EXCL | os.O_NOFOLLOW | os.O_CLOEXEC, 0o444, dir_fd=dirfd)
    try:
        os.fchmod(fd, 0o444)
        write_all(fd, raw)
        os.fsync(fd)
    finally:
        os.close(fd)
    os.fsync(dirfd)
    require(read_file(dirfd, name, 0o444, max(4096, len(raw))) == raw, "publish:" + name)


def publish_json(dirfd, name, value):
    publish_raw(dirfd, name, canonical(value))


def absent(dirfd, name):
    try:
        os.stat(name, dir_fd=dirfd, follow_symlinks=False)
    except FileNotFoundError:
        return True
    return False


def load_codec(pre):
    require((pre["native_envelope_bytes"], pre["native_envelope_sha256"]) == (CODEC_BYTES, CODEC_SHA256), "codec-pre")
    raw = read_path(CODEC_PATH, 0o644, CODEC_BYTES, CODEC_SHA256)
    module = types.ModuleType("r9g19_waiter_codec")
    module.__file__ = CODEC_PATH
    exec(compile(raw, CODEC_PATH, "exec"), module.__dict__)
    require(module.__all__ == ("Invalid", "parse_call", "unwrap_output"), "codec-api")
    return module


def read_trace(thread):
    paths = glob.glob(SESSION_GLOB.format(thread))
    require(len(paths) == 1 and os.path.basename(paths[0]).endswith("-" + thread + ".jsonl"), "trace-path")
    path = paths[0]
    before = os.lstat(path)
    require(stat.S_ISREG(before.st_mode) and not stat.S_ISLNK(before.st_mode) and stat.S_IMODE(before.st_mode) == 0o664 and before.st_uid == os.getuid() and before.st_nlink == 1 and 1 <= before.st_size <= 300000, "trace-custody")
    fd = os.open(path, os.O_RDONLY | os.O_NOFOLLOW | os.O_CLOEXEC)
    try:
        current = os.fstat(fd)
        require((current.st_dev, current.st_ino) == (before.st_dev, before.st_ino), "trace-race")
        raw = b""
        while len(raw) < before.st_size:
            part = os.read(fd, before.st_size - len(raw))
            require(bool(part), "trace-short")
            raw += part
        after = os.fstat(fd)
        require((after.st_dev, after.st_ino) == (before.st_dev, before.st_ino) and after.st_size >= before.st_size, "trace-inode")
    finally:
        os.close(fd)
    require(raw.endswith(b"\n") and b"\r" not in raw, "trace-framing")
    return path, raw


def decode_trace(raw):
    events = []
    for line in raw.splitlines(keepends=True):
        require(line.endswith(b"\n") and line.count(b"\n") == 1, "trace-line")
        event = parse(line)
        require(isinstance(event, dict) and set(event) == {"payload", "timestamp", "type"} and isinstance(event["payload"], dict), "trace-event")
        events.append(event)
    require(bool(events), "trace-empty")
    return events


def items(events, outer, inner=None, subtype=None):
    result = []
    for index, event in enumerate(events):
        if event.get("type") != outer:
            continue
        value = event.get("payload")
        if inner is not None and value.get("type") != inner:
            continue
        if subtype is not None and value.get("type") != subtype:
            continue
        result.append((index, value))
    return result


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


def goal(text, thread, objective):
    value = parse(text.encode("utf-8"))
    require(set(value) == {"completionBudgetReport", "goal", "remainingTokens"} and value["completionBudgetReport"] is None and value["remainingTokens"] is None, "goal-envelope")
    item = value["goal"]
    require(set(item) == {"createdAt", "objective", "status", "threadId", "timeUsedSeconds", "tokensUsed", "updatedAt"}, "goal-fields")
    require((item["threadId"], item["objective"], item["status"], item["tokensUsed"], item["timeUsedSeconds"]) == (thread, objective, "active", 0, 0), "goal-active")
    require(all(isinstance(item[key], int) and not isinstance(item[key], bool) and item[key] >= 0 for key in ("createdAt", "updatedAt", "timeUsedSeconds", "tokensUsed")) and item["createdAt"] > 0 and item["updatedAt"] >= item["createdAt"], "goal-counters")
    return item


def pair(codec, call, output, tool, arguments):
    require(call.get("call_id") == output.get("call_id") and call.get("name") == "exec" and call.get("type") == "custom_tool_call" and output.get("type") == "custom_tool_call_output", "pair:" + tool)
    decoded = codec.parse_call(call.get("input"))
    require(decoded["tool"] == tool and decoded["arguments"] == arguments, "semantics:" + tool)
    return codec.unwrap_output(output.get("output"))


def validate_active(raw, thread, pre, subject, skill, codec, cwd):
    events = decode_trace(raw)
    sessions = items(events, "session_meta")
    require(len(sessions) == 1 and sessions[0][0] == 0, "session")
    session = sessions[0][1]
    spawn = session.get("source", {}).get("subagent", {}).get("thread_spawn", {})
    require(session.get("id") == thread and session.get("parent_thread_id") == PARENT and session.get("agent_path") == pre["task_path"], "session-identity")
    require(spawn.get("parent_thread_id") == PARENT and spawn.get("agent_path") == pre["task_path"] and session.get("thread_source") == "subagent" and session.get("cli_version") == "0.148.0", "session-source")
    turns = items(events, "turn_context")
    require(len(turns) == 1 and turns[0][1].get("model") == MODEL and turns[0][1].get("effort") == EFFORT and turns[0][1].get("cwd") == "/mnt/Cursor/PuppetMaster" and UUID.fullmatch(turns[0][1].get("turn_id", "")), "turn")
    turn = turns[0][1]["turn_id"]
    starts = items(events, "event_msg", "task_started")
    require(len(starts) == 1 and starts[0][1].get("turn_id") == turn and starts[0][0] < turns[0][0], "start")
    direct = items(events, "response_item", "function_call") + items(events, "response_item", "function_call_output")
    wrapped = sorted(items(events, "response_item", "custom_tool_call") + items(events, "response_item", "custom_tool_call_output"))
    require(not direct and len(wrapped) == 5 and not items(events, "event_msg", "task_complete"), "tools")
    indexes = [index for index, _ in wrapped]
    require(turns[0][0] < indexes[0] < indexes[1] < indexes[2] < indexes[3] < indexes[4] == len(events) - 1, "active-order")
    values = [value for _, value in wrapped]
    require(len({values[index].get("call_id") for index in (0, 2, 4)}) == 3, "call-ids")
    require(pair(codec, values[0], values[1], "exec_command", SKILL_ARGS).encode("utf-8") == skill, "skill")
    active_goal = goal(pair(codec, values[2], values[3], "create_goal", {"objective": pre["goal_objective"]}), thread, pre["goal_objective"])
    pending = codec.parse_call(values[4].get("input"))
    expected_wait = {"cmd": "python3 -B wait.py " + thread, "max_output_tokens": 128, "workdir": cwd, "yield_time_ms": 30000}
    require(pending["tool"] == "exec_command" and pending["arguments"] == expected_wait, "pending-waiter")
    require(all(subject.decode("utf-8") not in text for event in events for text in strings(event)), "subject-before-goal")
    return {"active_goal": active_goal, "goal_thread_id": thread, "profile": "SELF_ATTESTED_NATIVE_ENVELOPE_V1", "task_path": pre["task_path"], "turn_id": turn}


def validate_subject(raw, pre):
    require(raw.endswith(b"\n") and raw.count(b"\n") == 1 and b"\r" not in raw and len(raw) <= 512, "subject-framing")
    value = parse(raw[:-1])
    require(isinstance(value, dict) and set(value) == {"c", "p", "q", "r", "v", "z"}, "subject-shape")
    require(value["v"] == 4 and value["r"] == "TOKEN" and value["p"] == {"atom": pre["atom_id"], "src": ARCH}, "subject-bind")
    require(all(isinstance(value[key], str) and value[key] for key in ("c", "q", "z")), "subject-text")
    require((len(raw), sha(raw)) == (pre["subject_bytes"], pre["subject_sha256"]), "subject-identity")
    return value


def main(argv):
    require(len(argv) == 2 and UUID.fullmatch(argv[1]), "argv")
    cwd = os.getcwd()
    info = os.lstat(cwd)
    require(stat.S_ISDIR(info.st_mode) and stat.S_IMODE(info.st_mode) == 0o700 and info.st_uid == os.getuid() and os.path.realpath(cwd) == cwd, "cwd")
    dirfd = os.open(".", os.O_RDONLY | os.O_DIRECTORY | os.O_NOFOLLOW | os.O_CLOEXEC)
    try:
        pre_raw = read_file(dirfd, "predeclaration.json", 0o444, 8192)
        pre = parse(pre_raw)
        require(isinstance(pre, dict) and set(pre) == PRE and canonical(pre) == pre_raw, "predeclaration")
        require(pre["schema_id"] == "pw-r9-codex-native-goal-self-attesting-packet-review-predeclaration-v12", "pre-schema")
        require(ATOM.fullmatch(pre["atom_id"] or "") and HEX.fullmatch(pre["review_nonce"] or ""), "pre-address")
        require((pre["architecture_sha256"], pre["subject_source_sha256"], pre["packet_compiler_sha256"], pre["recipe_sha256"], pre["bootstrap_skill_sha256"]) == (ARCH, ARCH, COMPILER, RECIPE, SKILL), "pre-bindings")
        require((pre["model_requested"], pre["reasoning_effort_requested"]) == (MODEL, EFFORT), "pre-route")
        require(pre["goal_objective"] == "CG12R|a={}|x={}|once".format(pre["atom_id"], pre["review_nonce"]) and pre["task_path"] == "/root/r9_cg12r_" + pre["review_nonce"], "pre-control")
        expected = os.path.join(ROOT, pre["atom_id"], pre["review_nonce"])
        require(cwd == expected and absent(dirfd, "active_trace.jsonl") and absent(dirfd, "active.json") and absent(dirfd, "subject.txt"), "row-state")
        waiter = read_file(dirfd, "wait.py", 0o444, 32768)
        require((len(waiter), sha(waiter)) == (pre["waiter_bytes"], pre["waiter_sha256"]), "waiter")
        skill = read_path(SKILL_PATH, 0o644, 1327, SKILL)
        codec = load_codec(pre)
        packet = read_file(dirfd, "subject.packet", 0o444, 512)
        validate_subject(packet, pre)
        deadline = time.monotonic() + 8.0
        while True:
            try:
                trace_path, trace_raw = read_trace(argv[1])
                proof = validate_active(trace_raw, argv[1], pre, packet, skill, codec, cwd)
                break
            except (Invalid, OSError, UnicodeError, json.JSONDecodeError, KeyError, TypeError, ValueError):
                if time.monotonic() >= deadline:
                    raise
                time.sleep(0.02)
        publish_raw(dirfd, "active_trace.jsonl", trace_raw)
        active = {"active_goal": proof["active_goal"], "architecture_sha256": ARCH, "atom_id": pre["atom_id"], "goal_thread_id": proof["goal_thread_id"], "packet_compiler_sha256": COMPILER, "profile": proof["profile"], "qualification_credit": 0, "review_nonce": pre["review_nonce"], "schema_id": "pw-r9-codex-native-goal-self-attesting-packet-review-active-v12", "status": "ACTIVE_ATTESTED_SUBJECT_RELEASED_ZERO_CREDIT", "subject_bytes": len(packet), "subject_sha256": sha(packet), "task_path": proof["task_path"], "trace": {"bytes": len(trace_raw), "path": trace_path, "sha256": sha(trace_raw)}, "turn_id": proof["turn_id"]}
        publish_json(dirfd, "active.json", active)
        publish_raw(dirfd, "subject.txt", packet)
        write_all(1, packet)
        return 0
    finally:
        os.close(dirfd)


def entry():
    try:
        return main(sys.argv)
    except (Invalid, OSError, UnicodeError, json.JSONDecodeError, KeyError, TypeError, ValueError) as error:
        os.write(2, ("FAIL:" + str(error) + "\n").encode("utf-8", "strict"))
        return 1


__all__ = ("Invalid", "PRE", "validate_active", "validate_subject")


if __name__ == "__main__":
    raise SystemExit(entry())
