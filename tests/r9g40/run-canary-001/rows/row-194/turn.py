#!/usr/bin/env python3
import hashlib
import json
import os
import re
import stat
import sys

SCHEMA = "pw-r9-codex-native-goal-turn-pull-row-plan-v1"
THREAD = re.compile(r"^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$")
HEX = re.compile(r"^[0-9a-f]{64}$")


class Invalid(Exception):
    pass


def pairs(items):
    out = {}
    for key, value in items:
        if key in out:
            raise Invalid("duplicate-key")
        out[key] = value
    return out


def canon(value):
    return json.dumps(value, sort_keys=True, separators=(",", ":"), ensure_ascii=False).encode()


def regular(path, mode):
    info = os.lstat(path)
    if not stat.S_ISREG(info.st_mode) or stat.S_IMODE(info.st_mode) != mode or info.st_uid != os.getuid():
        raise Invalid("file-custody")
    return info


def read_exact(path, mode):
    before = regular(path, mode)
    flags = os.O_RDONLY | getattr(os, "O_NOFOLLOW", 0)
    fd = os.open(path, flags)
    try:
        opened = os.fstat(fd)
        if (opened.st_dev, opened.st_ino) != (before.st_dev, before.st_ino):
            raise Invalid("file-drift")
        raw = b""
        while True:
            part = os.read(fd, 65536)
            if not part:
                break
            raw += part
    finally:
        os.close(fd)
    after = regular(path, mode)
    if (after.st_dev, after.st_ino, after.st_size) != (before.st_dev, before.st_ino, before.st_size):
        raise Invalid("file-drift")
    return raw


def load_plan():
    raw = read_exact("plan.json", 0o444)
    if not raw.endswith(b"\n") or raw[:-1].count(b"\n") or b"\r" in raw:
        raise Invalid("plan-framing")
    plan = json.loads(raw, object_pairs_hook=pairs, parse_constant=lambda _: (_ for _ in ()).throw(Invalid("nonfinite")))
    if raw != canon(plan) + b"\n" or plan.get("schema_id") != SCHEMA:
        raise Invalid("plan-canonical")
    if set(plan) != {"attempt_id", "capsules", "objective", "row_id", "schema_id", "source_row", "task_name"}:
        raise Invalid("plan-shape")
    if not re.fullmatch(r"[0-9a-f]{24}", plan["attempt_id"]):
        raise Invalid("attempt-id")
    if not isinstance(plan["capsules"], list) or len(plan["capsules"]) < 3:
        raise Invalid("capsules")
    expected_kinds = ["SUBJECT_CHUNK"] * (len(plan["capsules"]) - 2) + ["FINAL_TRIGGER", "CLOSURE"]
    for index, (capsule, kind) in enumerate(zip(plan["capsules"], expected_kinds)):
        if set(capsule) != {"bytes", "index", "kind", "sha256", "text"} or capsule["index"] != index or capsule["kind"] != kind:
            raise Invalid("capsule-shape")
        text = capsule["text"].encode()
        if capsule["bytes"] != len(text) or not HEX.fullmatch(capsule["sha256"]) or hashlib.sha256(text).hexdigest() != capsule["sha256"]:
            raise Invalid("capsule-identity")
        if len(text) > 512:
            raise Invalid("capsule-ceiling")
    return plan


def journal_entries():
    info = os.lstat("journal")
    if not stat.S_ISDIR(info.st_mode) or stat.S_IMODE(info.st_mode) != 0o700 or info.st_uid != os.getuid():
        raise Invalid("journal-custody")
    names = sorted(os.listdir("journal"))
    expected = [f"{index:03d}.json" for index in range(len(names))]
    if names != expected:
        raise Invalid("journal-prefix")
    return names


def publish(path, value):
    raw = canon(value) + b"\n"
    fd = os.open(path, os.O_WRONLY | os.O_CREAT | os.O_EXCL | getattr(os, "O_NOFOLLOW", 0), 0o444)
    try:
        view = memoryview(raw)
        while view:
            written = os.write(fd, view)
            if written <= 0:
                raise Invalid("short-write")
            view = view[written:]
        os.fsync(fd)
        os.fchmod(fd, 0o444)
    finally:
        os.close(fd)
    if read_exact(path, 0o444) != raw:
        raise Invalid("publish-reopen")
    directory = os.open(os.path.dirname(path), os.O_RDONLY | getattr(os, "O_DIRECTORY", 0))
    try:
        os.fsync(directory)
    finally:
        os.close(directory)


def main():
    if len(sys.argv) != 2 or not THREAD.fullmatch(sys.argv[1]):
        raise Invalid("argv")
    thread_id = sys.argv[1]
    plan = load_plan()
    names = journal_entries()
    if names:
        first = json.loads(read_exact("journal/000.json", 0o444), object_pairs_hook=pairs)
        if first.get("thread_id") != thread_id:
            raise Invalid("thread-mismatch")
    index = len(names)
    if index >= len(plan["capsules"]):
        raise Invalid("exhausted")
    capsule = plan["capsules"][index]
    receipt = {
        "attempt_id": plan["attempt_id"],
        "capsule_bytes": capsule["bytes"],
        "capsule_index": index,
        "capsule_kind": capsule["kind"],
        "capsule_sha256": capsule["sha256"],
        "schema_id": "pw-r9-codex-native-goal-turn-pull-release-v1",
        "thread_id": thread_id,
    }
    publish(f"journal/{index:03d}.json", receipt)
    sys.stdout.buffer.write(capsule["text"].encode())
    sys.stdout.buffer.flush()


if __name__ == "__main__":
    try:
        main()
    except (Invalid, OSError, ValueError, TypeError, UnicodeError):
        raise SystemExit(1)
