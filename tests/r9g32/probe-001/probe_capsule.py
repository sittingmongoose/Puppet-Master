#!/usr/bin/env python3
import glob
import hashlib
import json
import os
import re
import stat
import sys

PARENT = "01a00b52-4879-7c41-a826-7b4609ad3c3b"
NONCE = "1ac8242a616065a47afbe3072d1a377601948cc527d1302b3ec1eda93aa77129"
OBJECTIVE = "R9NP01|x=" + NONCE + "|once"
TASK_PATH = "/root/r9_np01_" + NONCE
WORKDIR = "/mnt/Cursor/PuppetMaster/tests/r9g32/probe-001"
CAPSULES = (
    'Read p={"op":"label","x":',
    '"notify_capsules_ok"}. Return x',
    ' only; no punctuation.',
)
UUID = re.compile(r"^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$")


class Invalid(Exception):
    pass


def require(value, mismatch):
    if not value:
        raise Invalid(mismatch)


def strings(value):
    if isinstance(value, str):
        yield value
    elif isinstance(value, dict):
        for key, item in value.items():
            yield from strings(key); yield from strings(item)
    elif isinstance(value, list):
        for item in value:
            yield from strings(item)


def trace(thread_id):
    paths = glob.glob("/home/sittingmongoose/.codex/sessions/*/*/*/*-{}.jsonl".format(thread_id))
    require(len(paths) == 1, "trace-path")
    path = paths[0]; before = os.lstat(path)
    require(stat.S_ISREG(before.st_mode) and not stat.S_ISLNK(before.st_mode)
            and stat.S_IMODE(before.st_mode) == 0o664 and before.st_uid == os.getuid()
            and before.st_nlink == 1 and 1 <= before.st_size <= 1000000, "trace-custody")
    fd = os.open(path, os.O_RDONLY | os.O_NOFOLLOW | os.O_CLOEXEC)
    try:
        raw = b""
        while len(raw) < before.st_size:
            part = os.read(fd, before.st_size - len(raw)); require(bool(part), "trace-short"); raw += part
        after = os.fstat(fd)
        require((after.st_dev, after.st_ino) == (before.st_dev, before.st_ino)
                and after.st_size >= before.st_size, "trace-drift")
    finally:
        os.close(fd)
    require(raw.endswith(b"\n") and b"\r" not in raw, "trace-framing")
    events = []
    for line in raw.splitlines():
        value = json.loads(line.decode("utf-8"))
        require(isinstance(value, dict) and set(value) == {"payload", "timestamp", "type"}, "trace-event")
        events.append(value)
    return path, raw, events


def validate(thread_id, index):
    path, raw, events = trace(thread_id)
    sessions = [(i, event["payload"]) for i, event in enumerate(events) if event["type"] == "session_meta"]
    require(len(sessions) == 1 and sessions[0][0] == 0, "session")
    session = sessions[0][1]
    spawn = session.get("source", {}).get("subagent", {}).get("thread_spawn", {})
    require(session.get("id") == thread_id and session.get("parent_thread_id") == PARENT
            and session.get("agent_path") == TASK_PATH and spawn.get("parent_thread_id") == PARENT
            and spawn.get("agent_path") == TASK_PATH, "session-binding")
    calls = [(i, event["payload"]) for i, event in enumerate(events)
             if event["type"] == "response_item" and event["payload"].get("type") == "custom_tool_call"]
    outputs = [(i, event["payload"]) for i, event in enumerate(events)
               if event["type"] == "response_item" and event["payload"].get("type") == "custom_tool_call_output"]
    create = [(i, item) for i, item in calls if "tools.create_goal" in item.get("input", "")
              and json.dumps(OBJECTIVE) in item.get("input", "")]
    driver = [(i, item) for i, item in calls if "probe_capsule.py" in item.get("input", "")
              and thread_id in item.get("input", "") and WORKDIR in item.get("input", "")]
    require(len(create) == len(driver) == 1 and create[0][0] < driver[0][0], "call-order")
    create_outputs = [(i, item) for i, item in outputs if item.get("call_id") == create[0][1].get("call_id")]
    require(len(create_outputs) == 1 and create[0][0] < create_outputs[0][0] < driver[0][0], "create-output")
    payload_strings = list(strings(create_outputs[0][1].get("output")))
    active = [text for text in payload_strings if text.startswith('{"goal":')]
    require(len(active) == 1, "active-envelope")
    goal = json.loads(active[0]); item = goal.get("goal", {})
    require(item.get("threadId") == thread_id and item.get("objective") == OBJECTIVE
            and item.get("status") == "active" and item.get("tokensUsed") == 0
            and item.get("timeUsedSeconds") == 0, "active-goal")
    subject = "".join(CAPSULES)
    for event in events[:create_outputs[0][0] + 1]:
        require(all(capsule not in text for text in strings(event) for capsule in CAPSULES)
                and subject not in list(strings(event)), "subject-before-active")
    releases = sorted(name for name in os.listdir(WORKDIR) if re.fullmatch(r"release-[0-9]{3}\.json", name))
    require(releases == ["release-{:03d}.json".format(value) for value in range(index)], "release-prefix")
    return path, raw


def publish(path, value):
    raw = (json.dumps(value, ensure_ascii=False, allow_nan=False,
                      separators=(",", ":"), sort_keys=True) + "\n").encode("utf-8")
    fd = os.open(path, os.O_WRONLY | os.O_CREAT | os.O_EXCL | os.O_NOFOLLOW | os.O_CLOEXEC, 0o444)
    try:
        os.write(fd, raw); os.fsync(fd)
    finally:
        os.close(fd)
    os.chmod(path, 0o444)
    parent = os.open(WORKDIR, os.O_RDONLY | os.O_DIRECTORY | os.O_NOFOLLOW | os.O_CLOEXEC)
    try:
        os.fsync(parent)
    finally:
        os.close(parent)


def main(argv):
    require(len(argv) == 3 and UUID.fullmatch(argv[1] or "")
            and re.fullmatch(r"[0-9]{3}", argv[2] or ""), "argv")
    index = int(argv[2]); require(0 <= index < len(CAPSULES), "index")
    path, raw = validate(argv[1], index)
    publish(os.path.join(WORKDIR, "release-{:03d}.json".format(index)),
            {"capsule_bytes": len(CAPSULES[index].encode("utf-8")), "capsule_index": index,
             "capsule_sha256": hashlib.sha256(CAPSULES[index].encode("utf-8")).hexdigest(),
             "goal_thread_id": argv[1], "qualification_credit": 0,
             "schema_id": "pw-r9-goal-notify-probe-release-v1", "status": "PASS_ZERO_CREDIT",
             "trace_path": path, "trace_prefix_bytes": len(raw),
             "trace_prefix_sha256": hashlib.sha256(raw).hexdigest()})
    sys.stdout.write(CAPSULES[index]); return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main(sys.argv))
    except (Invalid, OSError, UnicodeError, ValueError, json.JSONDecodeError) as error:
        sys.stdout.write("PROBE_FAILURE:" + str(error)); raise SystemExit(1)
