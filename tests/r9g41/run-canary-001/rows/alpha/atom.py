#!/usr/bin/env python3
import hashlib
import json
import os
import re
import stat
import sys

THREAD = re.compile(r"^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$")


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


def read_exact(path, mode):
    before = os.lstat(path)
    if not stat.S_ISREG(before.st_mode) or stat.S_IMODE(before.st_mode) != mode or before.st_uid != os.getuid():
        raise Invalid("custody")
    fd = os.open(path, os.O_RDONLY | getattr(os, "O_NOFOLLOW", 0))
    try:
        opened = os.fstat(fd)
        if (opened.st_dev, opened.st_ino) != (before.st_dev, before.st_ino):
            raise Invalid("drift")
        raw = b""
        while True:
            part = os.read(fd, 65536)
            if not part:
                break
            raw += part
    finally:
        os.close(fd)
    after = os.lstat(path)
    if (after.st_dev, after.st_ino, after.st_size) != (before.st_dev, before.st_ino, before.st_size):
        raise Invalid("drift")
    return raw


def publish(path, value):
    raw = canon(value) + b"\n"
    fd = os.open(path, os.O_WRONLY | os.O_CREAT | os.O_EXCL | getattr(os, "O_NOFOLLOW", 0), 0o444)
    try:
        view = memoryview(raw)
        while view:
            count = os.write(fd, view)
            if count <= 0:
                raise Invalid("short-write")
            view = view[count:]
        os.fsync(fd)
        os.fchmod(fd, 0o444)
    finally:
        os.close(fd)
    if read_exact(path, 0o444) != raw:
        raise Invalid("reopen")
    parent = os.open(os.path.dirname(path), os.O_RDONLY | getattr(os, "O_DIRECTORY", 0))
    try:
        os.fsync(parent)
    finally:
        os.close(parent)


def main():
    if len(sys.argv) != 2 or not THREAD.fullmatch(sys.argv[1]):
        raise Invalid("argv")
    thread_id = sys.argv[1]
    plan_raw = read_exact("plan.json", 0o444)
    if not plan_raw.endswith(b"\n") or plan_raw[:-1].count(b"\n") or b"\r" in plan_raw:
        raise Invalid("plan-framing")
    plan = json.loads(plan_raw, object_pairs_hook=pairs, parse_constant=lambda _: (_ for _ in ()).throw(Invalid("nonfinite")))
    if plan_raw != canon(plan) + b"\n" or set(plan) != {"atom", "attempt_id", "expected_answer", "objective", "schema_id", "source_node", "task_name"}:
        raise Invalid("plan")
    if plan["schema_id"] != "pw-r9-codex-native-goal-terminal-atom-plan-v1" or not re.fullmatch(r"[0-9a-f]{24}", plan["attempt_id"]):
        raise Invalid("plan-id")
    journal = os.lstat("journal")
    if not stat.S_ISDIR(journal.st_mode) or stat.S_IMODE(journal.st_mode) != 0o700 or journal.st_uid != os.getuid() or os.listdir("journal"):
        raise Invalid("consumed-or-custody")
    atom = read_exact("atom.txt", 0o444)
    if len(atom) != plan["atom"]["bytes"] or len(atom) > 512 or hashlib.sha256(atom).hexdigest() != plan["atom"]["sha256"]:
        raise Invalid("atom")
    publish("journal/000.json", {"atom_bytes": len(atom), "atom_sha256": plan["atom"]["sha256"], "attempt_id": plan["attempt_id"], "schema_id": "pw-r9-codex-native-goal-terminal-atom-release-v1", "thread_id": thread_id})
    sys.stdout.buffer.write(atom)
    sys.stdout.buffer.flush()


if __name__ == "__main__":
    try:
        main()
    except (Invalid, OSError, ValueError, TypeError, UnicodeError):
        raise SystemExit(1)
