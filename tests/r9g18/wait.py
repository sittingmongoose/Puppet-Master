#!/usr/bin/env python3
import hashlib
import json
import os
import re
import stat
import sys
import time

sys.dont_write_bytecode = True
ROOT = "/mnt/Cursor/PuppetMaster/tests/r9g18/r"
ARCH = "331f6e3a3e2e5356b6e5d78d2bb5e3aa42cf189ace90ce07b05dd3c41a615537"
COMPILER = "bce30c334538d0d10c93fd6fa9d2c8ad2df9f6b4ceb43ddb776c6805018dfb31"
RECIPE = "100386642d6680db468c1e9a0ddf7c2c774728f4444e540ca2d655fe8669f690"
SKILL = "7fba245c05b7fb104054ea18af4d0a2fd90d4f28f295c94f7c12b699b343d8b4"
PRE = {"architecture_sha256", "atom_id", "bootstrap_skill_sha256", "goal_objective", "model_requested", "packet_compiler_sha256", "reasoning_effort_requested", "recipe_sha256", "review_nonce", "schema_id", "subject_bytes", "subject_sha256", "subject_source_sha256", "task_path", "waiter_bytes", "waiter_sha256"}
READY = {"architecture_sha256", "atom_id", "bootstrap_skill_sha256", "goal_thread_id", "packet_compiler_sha256", "pid", "recipe_sha256", "request_sha256", "review_nonce", "schema_id", "subject_source_sha256", "waiter_sha256"}
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


def metadata(info):
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


def validate_subject(raw, pre):
    require(isinstance(pre, dict) and set(pre) == PRE, "subject-pre")
    require(raw.endswith(b"\n") and raw.count(b"\n") == 1 and b"\r" not in raw and len(raw) <= 512, "subject-framing")
    value = json.loads(raw[:-1].decode("utf-8"), object_pairs_hook=pairs, parse_constant=lambda _: (_ for _ in ()).throw(Invalid("nonfinite")))
    require(isinstance(value, dict) and set(value) == {"c", "p", "q", "r", "v", "z"}, "subject-shape")
    require(value["v"] == 3 and value["r"] == "TOKEN", "subject-version")
    require(pre["subject_source_sha256"] == pre["architecture_sha256"] == ARCH and value["p"] == {"atom": pre["atom_id"], "src": pre["subject_source_sha256"]}, "subject-bind")
    require(all(isinstance(value[key], str) and value[key] for key in ("c", "q", "z")), "subject-text")
    require((len(raw), hashlib.sha256(raw).hexdigest()) == (pre["subject_bytes"], pre["subject_sha256"]), "subject-identity")
    return value


def main(argv):
    require(len(argv) == 2 and UUID.fullmatch(argv[1]), "argv")
    cwd = os.getcwd()
    info = os.lstat(cwd)
    require(stat.S_ISDIR(info.st_mode) and stat.S_IMODE(info.st_mode) == 0o700 and info.st_uid == os.getuid(), "cwd")
    dirfd = os.open(".", os.O_RDONLY | os.O_DIRECTORY | os.O_NOFOLLOW | os.O_CLOEXEC)
    try:
        pre_raw = read_file(dirfd, "predeclaration.json", 0o444, 8192)
        pre = json.loads(pre_raw.decode("utf-8"), object_pairs_hook=pairs, parse_constant=lambda _: (_ for _ in ()).throw(Invalid("nonfinite")))
        require(isinstance(pre, dict) and set(pre) == PRE and canonical(pre) == pre_raw, "predeclaration")
        require(pre["schema_id"] == "pw-r9-codex-native-goal-single-source-packet-review-predeclaration-v11", "pre-schema")
        require(ATOM.fullmatch(pre["atom_id"] or "") and HEX.fullmatch(pre["review_nonce"] or ""), "pre-address")
        require((pre["architecture_sha256"], pre["subject_source_sha256"], pre["packet_compiler_sha256"], pre["recipe_sha256"], pre["bootstrap_skill_sha256"]) == (ARCH, ARCH, COMPILER, RECIPE, SKILL), "pre-bindings")
        require((pre["model_requested"], pre["reasoning_effort_requested"]) == ("gpt-5.6-luna", "medium"), "pre-route")
        objective = "CG11R|a={}|x={}|once".format(pre["atom_id"], pre["review_nonce"])
        require(pre["goal_objective"] == objective and pre["task_path"] == "/root/r9_cg11r_" + pre["review_nonce"], "pre-control")
        expected = os.path.join(ROOT, pre["atom_id"], pre["review_nonce"])
        require(cwd == expected and os.path.realpath(cwd) == expected, "cwd-path")
        waiter = read_file(dirfd, "wait.py", 0o444, 32768)
        require(len(waiter) == pre["waiter_bytes"] and hashlib.sha256(waiter).hexdigest() == pre["waiter_sha256"], "waiter")
        require(isinstance(pre["subject_bytes"], int) and not isinstance(pre["subject_bytes"], bool) and 1 <= pre["subject_bytes"] <= 512 and HEX.fullmatch(pre["subject_sha256"] or ""), "subject-pre-identity")
        require(absent(dirfd, "ready.json") and absent(dirfd, "subject.stage") and absent(dirfd, "subject.txt"), "subject-absence")
        ready = {"architecture_sha256": ARCH, "atom_id": pre["atom_id"], "bootstrap_skill_sha256": SKILL, "goal_thread_id": argv[1], "packet_compiler_sha256": COMPILER, "pid": os.getpid(), "recipe_sha256": RECIPE, "request_sha256": hashlib.sha256(pre_raw).hexdigest(), "review_nonce": pre["review_nonce"], "schema_id": "pw-r9-codex-native-goal-single-source-packet-review-ready-v11", "subject_source_sha256": ARCH, "waiter_sha256": pre["waiter_sha256"]}
        require(set(ready) == READY, "ready-fields")
        publish(dirfd, "ready.json", ready)
        deadline = time.monotonic() + 25.0
        while time.monotonic() < deadline:
            if not absent(dirfd, "subject.txt"):
                raw = read_file(dirfd, "subject.txt", 0o444, 512)
                validate_subject(raw, pre)
                write_all(1, raw)
                return 0
            time.sleep(0.02)
        raise Invalid("timeout")
    finally:
        os.close(dirfd)


def entry():
    try:
        return main(sys.argv)
    except (Invalid, OSError, UnicodeError, json.JSONDecodeError, KeyError, TypeError, ValueError) as error:
        os.write(2, ("FAIL:" + str(error) + "\n").encode("utf-8", "strict"))
        return 1


__all__ = ("Invalid", "PRE", "validate_subject")


if __name__ == "__main__":
    raise SystemExit(entry())
