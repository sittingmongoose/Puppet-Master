#!/usr/bin/env python3
import hashlib
import json
import os
import re
import stat
import sys
import time

sys.dont_write_bytecode = True
HERE = os.path.dirname(os.path.realpath(__file__))
UUID = re.compile(r"[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}")


def fail(message):
    raise SystemExit("FAIL:" + message)


def raw(name, maximum, mode):
    path = os.path.join(HERE, name)
    try:
        before = os.lstat(path)
    except OSError:
        fail("missing:" + name)
    if not stat.S_ISREG(before.st_mode) or stat.S_IMODE(before.st_mode) != mode:
        fail("custody:" + name)
    fd = os.open(path, os.O_RDONLY | os.O_NOFOLLOW)
    try:
        opened = os.fstat(fd)
        if (opened.st_dev, opened.st_ino) != (before.st_dev, before.st_ino):
            fail("race:" + name)
        data = b""
        while True:
            chunk = os.read(fd, min(65536, maximum + 1 - len(data)))
            if not chunk:
                break
            data += chunk
            if len(data) > maximum:
                fail("oversize:" + name)
    finally:
        os.close(fd)
    after = os.lstat(path)
    if (after.st_dev, after.st_ino, after.st_size, after.st_mtime_ns) != (
        before.st_dev,
        before.st_ino,
        before.st_size,
        before.st_mtime_ns,
    ):
        fail("drift:" + name)
    return data


def obj(name, maximum, mode):
    data = raw(name, maximum, mode)
    if not data.endswith(b"\n") or b"\n" in data[:-1]:
        fail("json-framing:" + name)
    try:
        value = json.loads(data)
    except Exception:
        fail("json:" + name)
    if not isinstance(value, dict):
        fail("json-object:" + name)
    canonical = json.dumps(value, ensure_ascii=False, allow_nan=False, separators=(",", ":"), sort_keys=True).encode() + b"\n"
    if canonical != data:
        fail("json-canonical:" + name)
    return value


def main():
    if len(sys.argv) != 3 or sys.argv[1] not in {"control", "subject"} or not UUID.fullmatch(sys.argv[2]):
        fail("argv")
    phase, thread_id = sys.argv[1], sys.argv[2]
    pre = obj("predeclaration.json", 8192, 0o444)
    expected_pre = {
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
    if set(pre) != expected_pre or pre["schema_id"] != "pw-r9-goal-event-gate-predeclaration-v1":
        fail("predeclaration-shape")
    deadline = time.monotonic() + 120.0
    while not os.path.exists(os.path.join(HERE, "release.json")):
        if time.monotonic() >= deadline:
            fail("release-timeout")
        time.sleep(0.02)
    release = obj("release.json", 8192, 0o444)
    expected_release = {
        "active_receipt_sha256",
        "case_id",
        "goal_thread_id",
        "objective",
        "phase_files",
        "schema_id",
        "task_path",
        "trace_path",
    }
    if set(release) != expected_release or release["schema_id"] != "pw-r9-goal-event-gate-release-v1":
        fail("release-shape")
    if release["case_id"] != pre["case_id"] or release["goal_thread_id"] != thread_id:
        fail("release-identity")
    if release["objective"] != pre["derived_goal_objective"] or release["task_path"] != pre["planned_task_path"]:
        fail("release-binding")
    spec = release["phase_files"].get(phase)
    if not isinstance(spec, dict) or set(spec) != {"bytes", "path", "sha256"} or spec["path"] != phase + ".txt":
        fail("phase-spec")
    if spec["bytes"] != pre[phase + "_bytes"] or spec["sha256"] != pre[phase + "_sha256"]:
        fail("phase-predeclaration")
    data = raw(spec["path"], 512, 0o444)
    if len(data) != spec["bytes"] or hashlib.sha256(data).hexdigest() != spec["sha256"]:
        fail("phase-bytes")
    sys.stdout.buffer.write(data)
    sys.stdout.buffer.flush()


if __name__ == "__main__":
    main()
