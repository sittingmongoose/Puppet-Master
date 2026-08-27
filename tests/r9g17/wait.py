#!/usr/bin/env python3
import hashlib
import json
import os
import re
import stat
import sys
import time

sys.dont_write_bytecode = True
ROOT = "/mnt/Cursor/PuppetMaster/tests/r9g17/r"
ARCH = "c7851a467a2328707e8ebfd2b31db5865543d82193ec5ded195903a5929aab71"
SOURCE = "8e06c4d3839681431b7d762068a6ce521d5dbf9c15e1894b7f6325c0e6497251"
RECIPE = "100386642d6680db468c1e9a0ddf7c2c774728f4444e540ca2d655fe8669f690"
SKILL = "7fba245c05b7fb104054ea18af4d0a2fd90d4f28f295c94f7c12b699b343d8b4"
PRE = {"architecture_sha256", "atom_id", "bootstrap_skill_sha256", "goal_objective", "model_requested", "reasoning_effort_requested", "recipe_sha256", "review_nonce", "schema_id", "subject_bytes", "subject_sha256", "task_path", "waiter_bytes", "waiter_sha256"}
READY = {"architecture_sha256", "atom_id", "bootstrap_skill_sha256", "goal_thread_id", "pid", "recipe_sha256", "request_sha256", "review_nonce", "schema_id", "waiter_sha256"}
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


def canonical(value):
    return json.dumps(value, ensure_ascii=False, allow_nan=False, sort_keys=True, separators=(",", ":")).encode("utf-8") + b"\n"


def meta(info):
    return (info.st_dev, info.st_ino, info.st_mode, info.st_uid, info.st_nlink, info.st_size, info.st_mtime_ns)


def absent(dirfd, name):
    try:
        os.stat(name, dir_fd=dirfd, follow_symlinks=False)
    except FileNotFoundError:
        return True
    return False


def read_file(dirfd, name, mode, limit):
    before = os.stat(name, dir_fd=dirfd, follow_symlinks=False)
    require(stat.S_ISREG(before.st_mode) and stat.S_IMODE(before.st_mode) == mode and before.st_uid == os.getuid() and before.st_nlink == 1 and before.st_size <= limit, name + "-custody")
    fd = os.open(name, os.O_RDONLY | os.O_NOFOLLOW | os.O_CLOEXEC, dir_fd=dirfd)
    try:
        require(meta(os.fstat(fd)) == meta(before), name + "-race")
        raw = b""
        while len(raw) < before.st_size:
            part = os.read(fd, before.st_size - len(raw))
            require(bool(part), name + "-short")
            raw += part
        require(os.read(fd, 1) == b"", name + "-trailing")
    finally:
        os.close(fd)
    require(meta(os.stat(name, dir_fd=dirfd, follow_symlinks=False)) == meta(before), name + "-drift")
    return raw


def write_all(fd, raw):
    view = memoryview(raw)
    while view:
        count = os.write(fd, view)
        require(count > 0, "write")
        view = view[count:]


def publish(dirfd, name, value):
    raw = canonical(value)
    fd = os.open(name, os.O_WRONLY | os.O_CREAT | os.O_EXCL | os.O_NOFOLLOW | os.O_CLOEXEC, 0o444, dir_fd=dirfd)
    try:
        os.fchmod(fd, 0o444)
        write_all(fd, raw)
        os.fsync(fd)
    finally:
        os.close(fd)
    os.fsync(dirfd)
    require(read_file(dirfd, name, 0o444, 4096) == raw, "publish-reopen")


def subject(raw, pre):
    require(raw.endswith(b"\n") and raw.count(b"\n") == 1 and b"\r" not in raw and len(raw) <= 512, "subject-framing")
    value = json.loads(raw[:-1].decode("utf-8"), object_pairs_hook=pairs, parse_constant=lambda _: (_ for _ in ()).throw(Invalid("nonfinite")))
    require(isinstance(value, dict) and set(value) == {"c", "p", "q", "r", "v", "z"}, "subject-shape")
    require(value["v"] == 2 and value["r"] == "TOKEN" and value["p"] == {"atom": pre["atom_id"], "src": SOURCE}, "subject-bind")
    require(all(isinstance(value[key], str) and value[key] for key in ("c", "q", "z")), "subject-text")
    require(len(json.dumps(value["p"], ensure_ascii=False, allow_nan=False, sort_keys=True, separators=(",", ":")).encode("utf-8")) <= 170, "subject-payload")


def main():
    require(len(sys.argv) == 2 and UUID.fullmatch(sys.argv[1]), "argv")
    cwd = os.getcwd()
    info = os.lstat(cwd)
    require(stat.S_ISDIR(info.st_mode) and stat.S_IMODE(info.st_mode) == 0o700 and info.st_uid == os.getuid(), "cwd")
    dirfd = os.open(".", os.O_RDONLY | os.O_DIRECTORY | os.O_NOFOLLOW | os.O_CLOEXEC)
    try:
        pre_raw = read_file(dirfd, "predeclaration.json", 0o444, 8192)
        pre = json.loads(pre_raw.decode("utf-8"), object_pairs_hook=pairs, parse_constant=lambda _: (_ for _ in ()).throw(Invalid("nonfinite")))
        require(isinstance(pre, dict) and set(pre) == PRE and canonical(pre) == pre_raw, "predeclaration")
        require(pre["schema_id"] == "pw-r9-codex-native-goal-observed-envelope-review-predeclaration-v10", "pre-schema")
        require(ATOM.fullmatch(pre["atom_id"] or "") and HEX.fullmatch(pre["review_nonce"] or ""), "pre-address")
        require((pre["architecture_sha256"], pre["recipe_sha256"], pre["bootstrap_skill_sha256"]) == (ARCH, RECIPE, SKILL), "pre-bindings")
        require((pre["model_requested"], pre["reasoning_effort_requested"]) == ("gpt-5.6-luna", "medium"), "pre-route")
        objective = "CG10R|a={}|x={}|once".format(pre["atom_id"], pre["review_nonce"])
        require(pre["goal_objective"] == objective and pre["task_path"] == "/root/r9_cg10r_" + pre["review_nonce"], "pre-control")
        expected = os.path.join(ROOT, pre["atom_id"], pre["review_nonce"])
        require(cwd == expected and os.path.realpath(cwd) == expected, "cwd-path")
        waiter = read_file(dirfd, "wait.py", 0o444, 32768)
        require(len(waiter) == pre["waiter_bytes"] and hashlib.sha256(waiter).hexdigest() == pre["waiter_sha256"], "waiter")
        require(isinstance(pre["subject_bytes"], int) and not isinstance(pre["subject_bytes"], bool) and 1 <= pre["subject_bytes"] <= 512 and HEX.fullmatch(pre["subject_sha256"] or ""), "subject-identity")
        require(absent(dirfd, "ready.json") and absent(dirfd, "subject.stage") and absent(dirfd, "subject.txt"), "subject-absence")
        ready = {"architecture_sha256": ARCH, "atom_id": pre["atom_id"], "bootstrap_skill_sha256": SKILL, "goal_thread_id": sys.argv[1], "pid": os.getpid(), "recipe_sha256": RECIPE, "request_sha256": hashlib.sha256(pre_raw).hexdigest(), "review_nonce": pre["review_nonce"], "schema_id": "pw-r9-codex-native-goal-observed-envelope-review-ready-v10", "waiter_sha256": pre["waiter_sha256"]}
        require(set(ready) == READY, "ready-fields")
        publish(dirfd, "ready.json", ready)
        deadline = time.monotonic() + 25.0
        while time.monotonic() < deadline:
            if not absent(dirfd, "subject.txt"):
                raw = read_file(dirfd, "subject.txt", 0o444, 512)
                require((len(raw), hashlib.sha256(raw).hexdigest()) == (pre["subject_bytes"], pre["subject_sha256"]), "subject-identity")
                subject(raw, pre)
                write_all(1, raw)
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
