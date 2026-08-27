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
ROOT = "/mnt/Cursor/PuppetMaster/tests/r9g13/r"
PRE_KEYS = {
    "execution_nonce", "expected_result_sha256", "goal_objective", "matrix_code", "matrix_id",
    "model_requested", "reasoning_effort_requested", "route", "route_code", "schema_id",
    "subject_bytes", "subject_sha256", "task_path", "waiter_bytes", "waiter_sha256", "wave_index",
}
READY_KEYS = {
    "execution_nonce", "goal_thread_id", "matrix_code", "pid", "request_sha256", "route_code",
    "schema_id", "waiter_sha256", "wave_index",
}
THREAD_RE = re.compile(r"^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$")
HEX_RE = re.compile(r"^[0-9a-f]{64}$")


class Invalid(Exception):
    pass


def require(value, mismatch):
    if not value:
        raise Invalid(mismatch)


def pairs(items):
    value = {}
    for key, item in items:
        require(key not in value, "duplicate-key")
        value[key] = item
    return value


def finite(value):
    if isinstance(value, float):
        return math.isfinite(value)
    if isinstance(value, dict):
        return all(finite(key) and finite(item) for key, item in value.items())
    if isinstance(value, list):
        return all(finite(item) for item in value)
    return True


def canonical(value):
    return json.dumps(value, ensure_ascii=False, allow_nan=False, sort_keys=True, separators=(",", ":")).encode("utf-8") + b"\n"


def absent(dirfd, name):
    try:
        os.stat(name, dir_fd=dirfd, follow_symlinks=False)
    except FileNotFoundError:
        return True
    return False


def read_exact(dirfd, name, mode, limit):
    before = os.stat(name, dir_fd=dirfd, follow_symlinks=False)
    require(stat.S_ISREG(before.st_mode), name + "-regular")
    require(stat.S_IMODE(before.st_mode) == mode and before.st_uid == os.getuid() and before.st_nlink == 1, name + "-custody")
    require(0 <= before.st_size <= limit, name + "-limit")
    fd = os.open(name, os.O_RDONLY | os.O_NOFOLLOW | os.O_CLOEXEC, dir_fd=dirfd)
    try:
        opened = os.fstat(fd)
        require((opened.st_dev, opened.st_ino, opened.st_size) == (before.st_dev, before.st_ino, before.st_size), name + "-identity")
        chunks = []
        total = 0
        while True:
            chunk = os.read(fd, min(65536, limit + 1 - total))
            if not chunk:
                break
            chunks.append(chunk)
            total += len(chunk)
            require(total <= limit, name + "-oversize")
        raw = b"".join(chunks)
        require(len(raw) == opened.st_size, name + "-short-read")
    finally:
        os.close(fd)
    after = os.stat(name, dir_fd=dirfd, follow_symlinks=False)
    require((after.st_dev, after.st_ino, after.st_size, after.st_mtime_ns) == (before.st_dev, before.st_ino, before.st_size, before.st_mtime_ns), name + "-drift")
    return raw


def write_all(fd, raw):
    view = memoryview(raw)
    while view:
        count = os.write(fd, view)
        require(count > 0, "write")
        view = view[count:]


def write_ready(dirfd, value):
    require(set(value) == READY_KEYS, "ready-fields")
    raw = canonical(value)
    fd = os.open("ready.json", os.O_WRONLY | os.O_CREAT | os.O_EXCL | os.O_NOFOLLOW | os.O_CLOEXEC, 0o444, dir_fd=dirfd)
    try:
        os.fchmod(fd, 0o444)
        write_all(fd, raw)
        os.fsync(fd)
    finally:
        os.close(fd)
    os.fsync(dirfd)
    require(read_exact(dirfd, "ready.json", 0o444, 4096) == raw, "ready-reopen")


def main():
    require(len(sys.argv) == 2 and THREAD_RE.fullmatch(sys.argv[1]) is not None, "argv")
    cwd = os.getcwd()
    info = os.lstat(cwd)
    require(stat.S_ISDIR(info.st_mode) and stat.S_IMODE(info.st_mode) == 0o700 and info.st_uid == os.getuid(), "cwd-custody")
    dirfd = os.open(".", os.O_RDONLY | os.O_DIRECTORY | os.O_CLOEXEC)
    try:
        pre_raw = read_exact(dirfd, "predeclaration.json", 0o444, 8192)
        pre = json.loads(pre_raw.decode("utf-8"), object_pairs_hook=pairs, parse_constant=lambda _: (_ for _ in ()).throw(Invalid("nonfinite")))
        require(isinstance(pre, dict) and set(pre) == PRE_KEYS and finite(pre) and canonical(pre) == pre_raw, "predeclaration")
        require(pre["schema_id"] == "pw-r9-codex-native-goal-single-turn-blocking-predeclaration-v1", "pre-schema")
        require(pre["matrix_code"] in {"C02", "013", "014"}, "matrix-code")
        require(isinstance(pre["wave_index"], int) and 0 <= pre["wave_index"] < 5204, "wave")
        require(pre["route"] in {"slot-alpha", "slot-bravo", "slot-charlie"} and pre["route_code"] in {"a", "b", "c"}, "route")
        require(isinstance(pre["execution_nonce"], str) and HEX_RE.fullmatch(pre["execution_nonce"]) is not None, "nonce")
        require(isinstance(pre["subject_bytes"], int) and 1 <= pre["subject_bytes"] <= 512, "subject-size")
        require(isinstance(pre["subject_sha256"], str) and HEX_RE.fullmatch(pre["subject_sha256"]) is not None, "subject-sha")
        require(isinstance(pre["expected_result_sha256"], str) and HEX_RE.fullmatch(pre["expected_result_sha256"]) is not None, "result-sha")
        expected_cwd = os.path.join(ROOT, pre["matrix_code"], f"{pre['wave_index']:04d}", pre["route_code"], pre["execution_nonce"])
        require(os.path.realpath(cwd) == expected_cwd and cwd == expected_cwd, "cwd-bind")
        waiter = read_exact(dirfd, "wait.py", 0o444, 32768)
        require(len(waiter) == pre["waiter_bytes"] and hashlib.sha256(waiter).hexdigest() == pre["waiter_sha256"], "waiter-bind")
        require(absent(dirfd, "ready.json") and absent(dirfd, "subject.stage") and absent(dirfd, "subject.txt"), "prepublish-absence")
        write_ready(dirfd, {
            "execution_nonce": pre["execution_nonce"],
            "goal_thread_id": sys.argv[1],
            "matrix_code": pre["matrix_code"],
            "pid": os.getpid(),
            "request_sha256": hashlib.sha256(pre_raw).hexdigest(),
            "route_code": pre["route_code"],
            "schema_id": "pw-r9-codex-native-goal-single-turn-blocking-ready-v1",
            "waiter_sha256": pre["waiter_sha256"],
            "wave_index": pre["wave_index"],
        })
        deadline = time.monotonic() + 25.0
        while time.monotonic() < deadline:
            if not absent(dirfd, "subject.txt"):
                subject = read_exact(dirfd, "subject.txt", 0o444, 512)
                require(len(subject) == pre["subject_bytes"] and hashlib.sha256(subject).hexdigest() == pre["subject_sha256"], "subject-bind")
                require(subject.endswith(b"\n") and subject.count(b"\n") == 1 and b"\r" not in subject, "subject-framing")
                write_all(1, subject)
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
