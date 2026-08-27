#!/usr/bin/env python3
import glob
import hashlib
import json
import math
import os
import re
import stat
import sys

SELF = "/mnt/Cursor/PuppetMaster/tests/r9g33/notify_atom_reader.py"
ROOT_PREFIX = "/mnt/Cursor/PuppetMaster/tests/r9g33/"
SESSION_GLOB = "/home/sittingmongoose/.codex/sessions/*/*/*/*-{}.jsonl"
PREPARED = {
    "capsule-000.bin",
    "capsule-001.bin",
    "capsule-002.bin",
    "launch_intent.json",
    "predeclaration.json",
    "spawn_prompt.txt",
}
PRE_FIELDS = {
    "capsules",
    "goal_objective",
    "model_requested",
    "node_id",
    "parent_goal_thread_id",
    "plan_bytes",
    "plan_path",
    "plan_sha256",
    "reader_bytes",
    "reader_sha256",
    "reasoning_effort_requested",
    "review_nonce",
    "route",
    "schema_id",
    "skill_bytes",
    "skill_sha256",
    "task_path",
    "workdir",
}
UUID = re.compile(r"^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$")
HEX = re.compile(r"^[0-9a-f]{64}$")
TASK = re.compile(r"^/root/r9_cjn3_[0-9a-f]{64}$")


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
    value = json.loads(
        raw.decode("utf-8"),
        object_pairs_hook=pairs,
        parse_constant=lambda token: (_ for _ in ()).throw(Invalid("nonfinite:" + token)),
    )
    require(finite(value), "finite")
    return value


def canonical(value):
    return json.dumps(value, ensure_ascii=False, allow_nan=False, separators=(",", ":"), sort_keys=True).encode("utf-8") + b"\n"


def sha(raw):
    return hashlib.sha256(raw).hexdigest()


def meta(info):
    return (info.st_dev, info.st_ino, info.st_mode, info.st_uid, info.st_nlink, info.st_size, info.st_mtime_ns)


def read_exact(path, mode, size=None, digest=None, cap=None):
    before = os.lstat(path)
    require(stat.S_ISREG(before.st_mode) and not stat.S_ISLNK(before.st_mode), "kind:" + path)
    require(stat.S_IMODE(before.st_mode) == mode and before.st_uid == os.getuid() and before.st_nlink == 1, "custody:" + path)
    require(size is None or before.st_size == size, "size:" + path)
    require(cap is None or before.st_size <= cap, "cap:" + path)
    fd = os.open(path, os.O_RDONLY | os.O_NOFOLLOW | os.O_CLOEXEC)
    try:
        require(meta(os.fstat(fd)) == meta(before), "race:" + path)
        raw = b""
        while len(raw) < before.st_size:
            part = os.read(fd, before.st_size - len(raw))
            require(bool(part), "short:" + path)
            raw += part
        require(os.read(fd, 1) == b"", "trailing:" + path)
    finally:
        os.close(fd)
    require(meta(os.lstat(path)) == meta(before), "drift:" + path)
    require(digest is None or sha(raw) == digest, "digest:" + path)
    return raw


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


def trace(thread_id):
    paths = glob.glob(SESSION_GLOB.format(thread_id))
    require(len(paths) == 1, "trace-path")
    path = paths[0]
    raw = read_exact(path, 0o664, cap=2000000)
    require(raw.endswith(b"\n") and b"\r" not in raw, "trace-framing")
    events = []
    for line in raw.splitlines():
        value = parse(line)
        require(isinstance(value, dict) and set(value) == {"payload", "timestamp", "type"}, "trace-event")
        events.append(value)
    return path, raw, events


def load_pre(workdir):
    raw = read_exact(os.path.join(workdir, "predeclaration.json"), 0o444, cap=8192)
    value = parse(raw)
    require(raw == canonical(value) and isinstance(value, dict) and set(value) == PRE_FIELDS, "pre-shape")
    require(value["schema_id"] == "pw-r9-codex-native-goal-progressive-atom-predeclaration-v1", "pre-schema")
    require(value["workdir"] == workdir and TASK.fullmatch(value["task_path"] or ""), "pre-paths")
    require(UUID.fullmatch(value["parent_goal_thread_id"] or "") and HEX.fullmatch(value["review_nonce"] or ""), "pre-identity")
    require(value["route"] in {"alpha", "bravo", "charlie"} and isinstance(value["node_id"], str), "pre-row")
    require(isinstance(value["capsules"], list) and len(value["capsules"]) == 3, "pre-capsules")
    for index, record in enumerate(value["capsules"]):
        require(set(record) == {"bytes", "index", "sha256"} and record["index"] == index, "capsule-record")
        require(type(record["bytes"]) is int and 1 <= record["bytes"] <= 256 and HEX.fullmatch(record["sha256"] or ""), "capsule-limit")
        read_exact(os.path.join(workdir, "capsule-{:03d}.bin".format(index)), 0o444, record["bytes"], record["sha256"])
    return value


def validate(workdir, thread_id, index):
    require(os.path.isabs(workdir) and os.path.realpath(workdir) == workdir and workdir.startswith(ROOT_PREFIX), "workdir")
    pre = load_pre(workdir)
    path, raw, events = trace(thread_id)
    sessions = [(i, event["payload"]) for i, event in enumerate(events) if event["type"] == "session_meta"]
    require(len(sessions) == 1 and sessions[0][0] == 0, "session")
    session = sessions[0][1]
    spawn = session.get("source", {}).get("subagent", {}).get("thread_spawn", {})
    require(
        session.get("id") == thread_id
        and session.get("parent_thread_id") == pre["parent_goal_thread_id"]
        and session.get("agent_path") == pre["task_path"]
        and spawn.get("parent_thread_id") == pre["parent_goal_thread_id"]
        and spawn.get("agent_path") == pre["task_path"],
        "session-binding",
    )
    contexts = [event["payload"] for event in events if event["type"] == "turn_context"]
    require(len(contexts) == 1 and contexts[0].get("model") == pre["model_requested"] and contexts[0].get("effort") == pre["reasoning_effort_requested"], "route-binding")
    calls = [
        (i, event["payload"])
        for i, event in enumerate(events)
        if event["type"] == "response_item" and event["payload"].get("type") == "custom_tool_call"
    ]
    outputs = [
        (i, event["payload"])
        for i, event in enumerate(events)
        if event["type"] == "response_item" and event["payload"].get("type") == "custom_tool_call_output"
    ]
    create = [
        (i, item)
        for i, item in calls
        if "tools.create_goal" in item.get("input", "") and json.dumps(pre["goal_objective"]) in item.get("input", "")
    ]
    driver = [
        (i, item)
        for i, item in calls
        if SELF in item.get("input", "")
        and workdir in item.get("input", "")
        and thread_id in item.get("input", "")
        and 'padStart(3, "0")' in item.get("input", "")
    ]
    require(len(create) == len(driver) == 1 and create[0][0] < driver[0][0], "call-order")
    create_outputs = [(i, item) for i, item in outputs if item.get("call_id") == create[0][1].get("call_id")]
    require(len(create_outputs) == 1 and create[0][0] < create_outputs[0][0] < driver[0][0], "create-output")
    active = [text for text in strings(create_outputs[0][1].get("output")) if text.startswith('{"goal":')]
    require(len(active) == 1, "active-envelope")
    goal = parse(active[0].encode("utf-8")).get("goal", {})
    require(
        goal.get("threadId") == thread_id
        and goal.get("objective") == pre["goal_objective"]
        and goal.get("status") == "active"
        and goal.get("tokensUsed") == 0
        and goal.get("timeUsedSeconds") == 0,
        "active-goal",
    )
    capsules = [read_exact(os.path.join(workdir, "capsule-{:03d}.bin".format(value)), 0o444) for value in range(3)]
    before_active = events[: create_outputs[0][0] + 1]
    for capsule in capsules:
        text = capsule.decode("utf-8")
        require(all(text not in value for event in before_active for value in strings(event)), "subject-before-active")
    releases = sorted(name for name in os.listdir(workdir) if re.fullmatch(r"release-[0-9]{3}\.json", name))
    require(releases == ["release-{:03d}.json".format(value) for value in range(index)], "release-prefix")
    expected_inventory = PREPARED | set(releases)
    require(set(os.listdir(workdir)) == expected_inventory, "row-inventory")
    return pre, path, raw, capsules[index]


def write_all(fd, raw):
    view = memoryview(raw)
    while view:
        count = os.write(fd, view)
        require(count > 0, "write")
        view = view[count:]


def fsync_dir(path):
    fd = os.open(path, os.O_RDONLY | os.O_DIRECTORY | os.O_NOFOLLOW | os.O_CLOEXEC)
    try:
        os.fsync(fd)
    finally:
        os.close(fd)


def publish(path, raw):
    fd = os.open(path, os.O_WRONLY | os.O_CREAT | os.O_EXCL | os.O_NOFOLLOW | os.O_CLOEXEC, 0o444)
    try:
        os.fchmod(fd, 0o444)
        write_all(fd, raw)
        os.fsync(fd)
    finally:
        os.close(fd)
    fsync_dir(os.path.dirname(path))
    require(read_exact(path, 0o444, len(raw), sha(raw)) == raw, "publish")


def main(argv):
    require(
        len(argv) == 4
        and os.path.isabs(argv[1])
        and UUID.fullmatch(argv[2] or "")
        and re.fullmatch(r"[0-9]{3}", argv[3] or ""),
        "argv",
    )
    index = int(argv[3])
    require(0 <= index < 3, "index")
    pre, trace_path, trace_raw, capsule = validate(argv[1], argv[2], index)
    receipt = {
        "capsule_bytes": len(capsule),
        "capsule_index": index,
        "capsule_sha256": sha(capsule),
        "goal_thread_id": argv[2],
        "node_id": pre["node_id"],
        "qualification_credit": 0,
        "review_nonce": pre["review_nonce"],
        "route": pre["route"],
        "schema_id": "pw-r9-codex-native-goal-progressive-atom-release-v1",
        "status": "PASS_ACTIVE_GOAL_ATOM_CAPSULE_RELEASED_ZERO_CREDIT",
        "task_path": pre["task_path"],
        "trace_path": trace_path,
        "trace_prefix_bytes": len(trace_raw),
        "trace_prefix_sha256": sha(trace_raw),
    }
    publish(os.path.join(argv[1], "release-{:03d}.json".format(index)), canonical(receipt))
    sys.stdout.buffer.write(capsule)
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main(sys.argv))
    except (Invalid, OSError, UnicodeError, ValueError, KeyError, TypeError, json.JSONDecodeError) as error:
        sys.stdout.write("ATOM_READER_FAILURE:" + str(error))
        raise SystemExit(1)
