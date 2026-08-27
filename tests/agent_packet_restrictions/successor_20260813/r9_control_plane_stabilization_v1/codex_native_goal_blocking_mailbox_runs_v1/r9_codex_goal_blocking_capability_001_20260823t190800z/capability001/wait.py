#!/usr/bin/env python3
import hashlib
import json
import math
import os
import re
import stat
import sys
import time

sys.dont_write_bytecode = True
ROOT = "/mnt/Cursor/PuppetMaster"
PRE_KEYS = {"case_id", "expected_result_sha256", "fresh_run_id", "mailbox_relative_path", "objective", "requested_model", "requested_reasoning_effort", "schema_id", "subject_bytes", "subject_sha256", "task_path", "waiter_bytes", "waiter_sha256"}
THREAD_RE = re.compile(r"^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$")


class Invalid(Exception):
    pass


def pairs(items):
    out = {}
    for key, value in items:
        if key in out:
            raise Invalid("duplicate key")
        out[key] = value
    return out


def finite(value):
    if isinstance(value, float) and not math.isfinite(value):
        raise Invalid("nonfinite")
    if isinstance(value, dict):
        return all(finite(key) and finite(item) for key, item in value.items())
    if isinstance(value, list):
        return all(finite(item) for item in value)
    return True


def read_exact(dirfd, name, mode, limit):
    before = os.stat(name, dir_fd=dirfd, follow_symlinks=False)
    if not stat.S_ISREG(before.st_mode) or stat.S_IMODE(before.st_mode) != mode or before.st_uid != os.getuid() or before.st_nlink != 1:
        raise Invalid(name + " custody")
    fd = os.open(name, os.O_RDONLY | os.O_NOFOLLOW | os.O_CLOEXEC, dir_fd=dirfd)
    try:
        opened = os.fstat(fd)
        if (opened.st_dev, opened.st_ino, opened.st_size) != (before.st_dev, before.st_ino, before.st_size):
            raise Invalid(name + " identity")
        raw = os.read(fd, limit + 1)
        if len(raw) > limit or len(raw) != opened.st_size:
            raise Invalid(name + " size")
    finally:
        os.close(fd)
    after = os.stat(name, dir_fd=dirfd, follow_symlinks=False)
    if (after.st_dev, after.st_ino, after.st_size, after.st_mtime_ns) != (before.st_dev, before.st_ino, before.st_size, before.st_mtime_ns):
        raise Invalid(name + " drift")
    return raw


def absent(dirfd, name):
    try:
        os.stat(name, dir_fd=dirfd, follow_symlinks=False)
    except FileNotFoundError:
        return True
    return False


def canonical(value):
    return json.dumps(value, ensure_ascii=False, allow_nan=False, separators=(",", ":"), sort_keys=True).encode("utf-8") + b"\n"


def write_ready(dirfd, value):
    raw = canonical(value)
    fd = os.open("ready.json", os.O_WRONLY | os.O_CREAT | os.O_EXCL | os.O_NOFOLLOW | os.O_CLOEXEC, 0o444, dir_fd=dirfd)
    try:
        os.fchmod(fd, 0o444)
        view = memoryview(raw)
        while view:
            written = os.write(fd, view)
            if written <= 0:
                raise Invalid("ready write")
            view = view[written:]
        os.fsync(fd)
    finally:
        os.close(fd)
    os.fsync(dirfd)


def main():
    if len(sys.argv) != 2 or not THREAD_RE.fullmatch(sys.argv[1]):
        raise Invalid("argv")
    dirfd = os.open(".", os.O_RDONLY | os.O_DIRECTORY | os.O_CLOEXEC)
    try:
        pre_raw = read_exact(dirfd, "predeclaration.json", 0o444, 8192)
        pre = json.loads(pre_raw.decode("utf-8"), object_pairs_hook=pairs, parse_constant=lambda value: (_ for _ in ()).throw(Invalid("nonfinite")))
        if not isinstance(pre, dict) or set(pre) != PRE_KEYS or not finite(pre) or canonical(pre) != pre_raw:
            raise Invalid("predeclaration")
        if pre["schema_id"] != "pw-r9-codex-native-goal-blocking-mailbox-predeclaration-v1":
            raise Invalid("schema")
        rel = pre["mailbox_relative_path"]
        if not isinstance(rel, str) or os.path.isabs(rel) or ".." in rel.split("/"):
            raise Invalid("mailbox path")
        if os.path.realpath(os.path.join(ROOT, rel)) != os.path.realpath(os.getcwd()):
            raise Invalid("mailbox cwd")
        waiter = read_exact(dirfd, "wait.py", 0o644, 32768)
        if len(waiter) != pre["waiter_bytes"] or hashlib.sha256(waiter).hexdigest() != pre["waiter_sha256"]:
            raise Invalid("waiter identity")
        if not absent(dirfd, "ready.json") or not absent(dirfd, "subject.stage") or not absent(dirfd, "subject.txt"):
            raise Invalid("prepublication absence")
        write_ready(dirfd, {"case_id": pre["case_id"], "fresh_run_id": pre["fresh_run_id"], "goal_thread_id": sys.argv[1], "pid": os.getpid(), "request_sha256": hashlib.sha256(pre_raw).hexdigest(), "schema_id": "pw-r9-codex-native-goal-blocking-mailbox-ready-v1", "waiter_sha256": pre["waiter_sha256"]})
        deadline = time.monotonic() + 25.0
        while time.monotonic() < deadline:
            if not absent(dirfd, "subject.txt"):
                subject = read_exact(dirfd, "subject.txt", 0o444, 4096)
                if len(subject) != pre["subject_bytes"] or hashlib.sha256(subject).hexdigest() != pre["subject_sha256"]:
                    raise Invalid("subject identity")
                if not subject.endswith(b"\n") or b"\n" in subject[:-1]:
                    raise Invalid("subject framing")
                os.write(1, subject)
                return 0
            time.sleep(0.02)
        raise Invalid("timeout")
    finally:
        os.close(dirfd)


try:
    raise SystemExit(main())
except (Invalid, OSError, UnicodeError, json.JSONDecodeError) as exc:
    os.write(2, ("FAIL:" + str(exc) + "\n").encode("utf-8", "strict"))
    raise SystemExit(1)
