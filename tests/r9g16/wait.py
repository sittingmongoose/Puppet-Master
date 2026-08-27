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
ROOT = "/mnt/Cursor/PuppetMaster/tests/r9g16/r"
ARCHITECTURE_SHA256 = "7812fc265157e56707462c636e4d35f2bbf1f56e1c9079d10c07e7200d36c0a0"
RECIPE_SHA256 = "100386642d6680db468c1e9a0ddf7c2c774728f4444e540ca2d655fe8669f690"
SKILL_SHA256 = "7fba245c05b7fb104054ea18af4d0a2fd90d4f28f295c94f7c12b699b343d8b4"
PRE_KEYS = {"architecture_sha256", "atom_id", "bootstrap_skill_sha256", "goal_objective", "model_requested", "reasoning_effort_requested", "recipe_sha256", "review_nonce", "schema_id", "subject_bytes", "subject_sha256", "task_path", "waiter_bytes", "waiter_sha256"}
READY_KEYS = {"architecture_sha256", "atom_id", "bootstrap_skill_sha256", "goal_thread_id", "pid", "recipe_sha256", "request_sha256", "review_nonce", "schema_id", "waiter_sha256"}
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
        require(key not in value, "duplicate-key")
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


def compact(value):
    return json.dumps(value, ensure_ascii=False, allow_nan=False, sort_keys=True, separators=(",", ":")).encode("utf-8") + b"\n"


def metadata(info):
    return (info.st_dev, info.st_ino, info.st_mode, info.st_uid, info.st_nlink, info.st_size, info.st_mtime_ns)


def absent(dirfd, name):
    try:
        os.stat(name, dir_fd=dirfd, follow_symlinks=False)
    except FileNotFoundError:
        return True
    return False


def read_exact(dirfd, name, mode, limit):
    before = os.stat(name, dir_fd=dirfd, follow_symlinks=False)
    require(stat.S_ISREG(before.st_mode) and stat.S_IMODE(before.st_mode) == mode, name + "-mode")
    require(before.st_uid == os.getuid() and before.st_nlink == 1 and 0 <= before.st_size <= limit, name + "-custody")
    fd = os.open(name, os.O_RDONLY | os.O_NOFOLLOW | os.O_CLOEXEC, dir_fd=dirfd)
    try:
        require(metadata(os.fstat(fd)) == metadata(before), name + "-race")
        raw = b""
        while len(raw) < before.st_size:
            part = os.read(fd, before.st_size - len(raw))
            require(bool(part), name + "-short")
            raw += part
        require(os.read(fd, 1) == b"", name + "-trailing")
    finally:
        os.close(fd)
    require(metadata(os.stat(name, dir_fd=dirfd, follow_symlinks=False)) == metadata(before), name + "-drift")
    return raw


def write_all(fd, raw):
    view = memoryview(raw)
    while view:
        count = os.write(fd, view)
        require(count > 0, "write")
        view = view[count:]


def publish_ready(dirfd, value):
    require(set(value) == READY_KEYS, "ready-fields")
    raw = compact(value)
    fd = os.open("ready.json", os.O_WRONLY | os.O_CREAT | os.O_EXCL | os.O_NOFOLLOW | os.O_CLOEXEC, 0o444, dir_fd=dirfd)
    try:
        os.fchmod(fd, 0o444)
        write_all(fd, raw)
        os.fsync(fd)
    finally:
        os.close(fd)
    os.fsync(dirfd)
    require(read_exact(dirfd, "ready.json", 0o444, 4096) == raw, "ready-reopen")


def validate_subject(raw, pre):
    require(raw.endswith(b"\n") and raw.count(b"\n") == 1 and b"\r" not in raw and len(raw) <= 512, "subject-framing")
    value = json.loads(raw[:-1].decode("utf-8"), object_pairs_hook=pairs, parse_constant=lambda _: (_ for _ in ()).throw(Invalid("nonfinite")))
    require(isinstance(value, dict) and set(value) == {"c", "p", "q", "r", "v", "z"} and finite(value), "subject-shape")
    require(value["v"] == 2 and value["r"] == "TOKEN", "subject-version")
    require(isinstance(value["p"], dict) and value["p"] == {"atom": pre["atom_id"], "src": ARCHITECTURE_SHA256}, "subject-binding")
    require(all(isinstance(value[key], str) and value[key] for key in ("c", "q", "z")), "subject-text")
    require(len(json.dumps(value["p"], ensure_ascii=False, allow_nan=False, sort_keys=True, separators=(",", ":")).encode("utf-8")) <= 170, "subject-payload")


def main():
    require(len(sys.argv) == 2 and UUID.fullmatch(sys.argv[1]), "argv")
    cwd = os.getcwd()
    info = os.lstat(cwd)
    require(stat.S_ISDIR(info.st_mode) and stat.S_IMODE(info.st_mode) == 0o700 and info.st_uid == os.getuid(), "cwd-custody")
    dirfd = os.open(".", os.O_RDONLY | os.O_DIRECTORY | os.O_NOFOLLOW | os.O_CLOEXEC)
    try:
        pre_raw = read_exact(dirfd, "predeclaration.json", 0o444, 8192)
        pre = json.loads(pre_raw.decode("utf-8"), object_pairs_hook=pairs, parse_constant=lambda _: (_ for _ in ()).throw(Invalid("nonfinite")))
        require(isinstance(pre, dict) and set(pre) == PRE_KEYS and finite(pre) and compact(pre) == pre_raw, "predeclaration")
        require(pre["schema_id"] == "pw-r9-codex-native-goal-atomic-review-predeclaration-v9", "pre-schema")
        require(ATOM.fullmatch(pre["atom_id"] or "") and HEX.fullmatch(pre["review_nonce"] or ""), "pre-address")
        require((pre["architecture_sha256"], pre["recipe_sha256"], pre["bootstrap_skill_sha256"]) == (ARCHITECTURE_SHA256, RECIPE_SHA256, SKILL_SHA256), "pre-bindings")
        require(pre["model_requested"] == "gpt-5.6-luna" and pre["reasoning_effort_requested"] == "medium", "pre-route")
        objective = "CG9R|a={}|x={}|once".format(pre["atom_id"], pre["review_nonce"])
        task_path = "/root/r9_cg9r_" + pre["review_nonce"]
        require(pre["goal_objective"] == objective and pre["task_path"] == task_path and len(objective.encode("utf-8")) <= 256, "pre-control")
        expected = os.path.join(ROOT, pre["atom_id"], pre["review_nonce"])
        require(cwd == expected and os.path.realpath(cwd) == expected, "cwd")
        waiter = read_exact(dirfd, "wait.py", 0o444, 32768)
        require(len(waiter) == pre["waiter_bytes"] and hashlib.sha256(waiter).hexdigest() == pre["waiter_sha256"], "waiter")
        require(isinstance(pre["subject_bytes"], int) and not isinstance(pre["subject_bytes"], bool) and 1 <= pre["subject_bytes"] <= 512, "subject-bytes")
        require(HEX.fullmatch(pre["subject_sha256"] or ""), "subject-sha")
        require(absent(dirfd, "ready.json") and absent(dirfd, "subject.stage") and absent(dirfd, "subject.txt"), "pre-subject-absence")
        publish_ready(dirfd, {"architecture_sha256": ARCHITECTURE_SHA256, "atom_id": pre["atom_id"], "bootstrap_skill_sha256": SKILL_SHA256, "goal_thread_id": sys.argv[1], "pid": os.getpid(), "recipe_sha256": RECIPE_SHA256, "request_sha256": hashlib.sha256(pre_raw).hexdigest(), "review_nonce": pre["review_nonce"], "schema_id": "pw-r9-codex-native-goal-atomic-review-ready-v9", "waiter_sha256": pre["waiter_sha256"]})
        deadline = time.monotonic() + 25.0
        while time.monotonic() < deadline:
            if not absent(dirfd, "subject.txt"):
                subject = read_exact(dirfd, "subject.txt", 0o444, 512)
                require(len(subject) == pre["subject_bytes"] and hashlib.sha256(subject).hexdigest() == pre["subject_sha256"], "subject-identity")
                validate_subject(subject, pre)
                write_all(1, subject)
                return 0
            time.sleep(0.02)
        raise Invalid("timeout")
    finally:
        os.close(dirfd)


try:
    raise SystemExit(main())
except (Invalid, OSError, UnicodeError, json.JSONDecodeError, KeyError, TypeError, ValueError) as error:
    os.write(2, ("FAIL:" + str(error) + "\n").encode("utf-8", "strict"))
    raise SystemExit(1)
