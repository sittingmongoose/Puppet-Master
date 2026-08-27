#!/usr/bin/env python3
import glob
import hashlib
import json
import os
import stat
import sys
import time

sys.dont_write_bytecode = True
HERE = os.path.dirname(os.path.realpath(__file__))
SESSION_GLOB = "/home/sittingmongoose/.codex/sessions/2026/08/23/*.jsonl"


def fail(message):
    raise SystemExit("FAIL:" + message)


def raw(path, maximum, mode):
    before = os.lstat(path)
    if not stat.S_ISREG(before.st_mode) or stat.S_IMODE(before.st_mode) != mode:
        fail("custody:" + path)
    fd = os.open(path, os.O_RDONLY | os.O_NOFOLLOW)
    try:
        opened = os.fstat(fd)
        if (opened.st_dev, opened.st_ino) != (before.st_dev, before.st_ino):
            fail("race:" + path)
        data = b""
        while True:
            chunk = os.read(fd, min(65536, maximum + 1 - len(data)))
            if not chunk:
                break
            data += chunk
            if len(data) > maximum:
                fail("oversize:" + path)
    finally:
        os.close(fd)
    return data


def canonical_object(path, maximum, mode):
    data = raw(path, maximum, mode)
    if not data.endswith(b"\n") or b"\n" in data[:-1]:
        fail("framing:" + path)
    value = json.loads(data)
    canonical = json.dumps(value, ensure_ascii=False, allow_nan=False, separators=(",", ":"), sort_keys=True).encode() + b"\n"
    if canonical != data or not isinstance(value, dict):
        fail("canonical:" + path)
    return value


def publish(name, data):
    path = os.path.join(HERE, name)
    fd = os.open(path, os.O_WRONLY | os.O_CREAT | os.O_EXCL | os.O_NOFOLLOW, 0o444)
    try:
        view = memoryview(data)
        while view:
            wrote = os.write(fd, view)
            if wrote <= 0:
                fail("write:" + name)
            view = view[wrote:]
        os.fsync(fd)
        os.fchmod(fd, 0o444)
    finally:
        os.close(fd)
    reopened = raw(path, len(data), 0o444)
    if reopened != data:
        fail("reopen:" + name)


def events(path):
    try:
        data = raw(path, 8_000_000, 0o664)
    except (FileNotFoundError, OSError):
        return []
    out = []
    for line in data.splitlines():
        try:
            value = json.loads(line)
        except Exception:
            continue
        if isinstance(value, dict):
            out.append(value)
    return out


def candidate(path, pre):
    rows = events(path)
    meta = next((x.get("payload") for x in rows if x.get("type") == "session_meta"), None)
    if not isinstance(meta, dict):
        return None
    agent_path = (((meta.get("source") or {}).get("subagent") or {}).get("thread_spawn") or {}).get("agent_path")
    if agent_path != pre["planned_task_path"]:
        return None
    turns = [x.get("payload") for x in rows if x.get("type") == "turn_context"]
    if not turns or turns[0].get("model") != pre["expected_model"] or (turns[0].get("reasoning_effort") or turns[0].get("effort")) != pre["expected_reasoning_effort"]:
        fail("route")
    calls = [x.get("payload") for x in rows if x.get("type") == "response_item" and (x.get("payload") or {}).get("type") == "function_call"]
    if not calls:
        return None
    if calls[0].get("name") != "create_goal":
        fail("first-tool")
    try:
        arguments = json.loads(calls[0].get("arguments"))
    except Exception:
        fail("goal-arguments")
    if arguments != {"objective": pre["derived_goal_objective"]}:
        fail("goal-objective")
    outputs = [x.get("payload") for x in rows if x.get("type") == "response_item" and (x.get("payload") or {}).get("type") == "function_call_output"]
    for output in outputs:
        try:
            value = json.loads(output.get("output"))
        except Exception:
            continue
        goal = value.get("goal") if isinstance(value, dict) else None
        if not isinstance(goal, dict) or goal.get("objective") != pre["derived_goal_objective"]:
            continue
        if goal.get("status") != "active" or goal.get("threadId") != meta.get("id"):
            fail("active-receipt")
        return meta.get("id"), output.get("output")
    return None


def main():
    pre_path = os.path.join(HERE, "predeclaration.json")
    pre = canonical_object(pre_path, 8192, 0o444)
    expected = {
        "case_id",
        "control_bytes",
        "control_sha256",
        "derived_goal_objective",
        "expected_model",
        "expected_reasoning_effort",
        "expected_result",
        "planned_task_path",
        "schema_id",
        "source_cell_bytes",
        "source_cell_path",
        "source_cell_sha256",
        "subject_bytes",
        "subject_sha256",
    }
    if set(pre) != expected or pre["schema_id"] != "pw-r9-goal-event-gate-predeclaration-v1":
        fail("predeclaration")
    source_path = os.path.join("/mnt/Cursor/PuppetMaster", pre["source_cell_path"])
    source_data = raw(source_path, pre["source_cell_bytes"], 0o644)
    if len(source_data) != pre["source_cell_bytes"] or hashlib.sha256(source_data).hexdigest() != pre["source_cell_sha256"]:
        fail("source")
    source = json.loads(source_data)
    node = source["nodes"][0]
    control = node["control_bind"]["utf8"].encode()
    subject = node["subject_atom"]["utf8"].encode()
    if len(control) != pre["control_bytes"] or hashlib.sha256(control).hexdigest() != pre["control_sha256"]:
        fail("control-source")
    if len(subject) != pre["subject_bytes"] or hashlib.sha256(subject).hexdigest() != pre["subject_sha256"]:
        fail("subject-source")
    baseline = set(glob.glob(SESSION_GLOB))
    deadline = time.monotonic() + 180.0
    while time.monotonic() < deadline:
        for path in sorted(set(glob.glob(SESSION_GLOB)) - baseline):
            found = candidate(path, pre)
            if found is None:
                continue
            thread_id, receipt = found
            publish("control.txt", control)
            publish("subject.txt", subject)
            release = {
                "active_receipt_sha256": hashlib.sha256(receipt.encode()).hexdigest(),
                "case_id": pre["case_id"],
                "goal_thread_id": thread_id,
                "objective": pre["derived_goal_objective"],
                "phase_files": {
                    "control": {"bytes": len(control), "path": "control.txt", "sha256": hashlib.sha256(control).hexdigest()},
                    "subject": {"bytes": len(subject), "path": "subject.txt", "sha256": hashlib.sha256(subject).hexdigest()},
                },
                "schema_id": "pw-r9-goal-event-gate-release-v1",
                "task_path": pre["planned_task_path"],
                "trace_path": path,
            }
            release_bytes = json.dumps(release, ensure_ascii=False, allow_nan=False, separators=(",", ":"), sort_keys=True).encode() + b"\n"
            publish("release.json", release_bytes)
            dirfd = os.open(HERE, os.O_RDONLY | os.O_DIRECTORY | os.O_NOFOLLOW)
            try:
                os.fsync(dirfd)
            finally:
                os.close(dirfd)
            print("RELEASED|" + thread_id, flush=True)
            return
        time.sleep(0.02)
    fail("active-timeout")


if __name__ == "__main__":
    main()
