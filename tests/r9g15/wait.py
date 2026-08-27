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
ROOT = "/mnt/Cursor/PuppetMaster/tests/r9g15/r"
SKILL_BYTES = 1327
SKILL_SHA256 = "7fba245c05b7fb104054ea18af4d0a2fd90d4f28f295c94f7c12b699b343d8b4"
PRE_KEYS = {
    "bootstrap_skill_bytes", "bootstrap_skill_sha256", "execution_nonce", "goal_objective", "matrix_code", "matrix_id",
    "model_requested", "reasoning_effort_requested", "result_contract_sha256", "route", "route_code", "schema_id",
    "subject_bytes", "subject_sha256", "task_path", "waiter_bytes", "waiter_sha256", "wave_index",
}
READY_KEYS = {
    "bootstrap_skill_sha256", "execution_nonce", "goal_thread_id", "matrix_code", "pid", "request_sha256",
    "route_code", "schema_id", "waiter_sha256", "wave_index",
}
ROSTER = {
    "slot-alpha": ("a", "gpt-5.4-mini", "xhigh"),
    "slot-bravo": ("b", "gpt-5.4-mini", "medium"),
    "slot-charlie": ("c", "gpt-5.6-luna", "medium"),
}
MATRICES = {
    "C04": ("codex-native-goal-skill-blocking-mailbox-canary-004", 1),
    "015": ("codex-native-goal-skill-blocking-mailbox-matrix-015", 5204),
    "016": ("codex-native-goal-skill-blocking-mailbox-matrix-016", 5204),
}
UUID_RE = re.compile(r"^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$")
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


def canonical(value):
    return json.dumps(value, ensure_ascii=False, allow_nan=False, sort_keys=True, separators=(",", ":")).encode("utf-8") + b"\n"


def finite(value):
    if isinstance(value, float):
        return math.isfinite(value)
    if isinstance(value, dict):
        return all(finite(key) and finite(item) for key, item in value.items())
    if isinstance(value, list):
        return all(finite(item) for item in value)
    return True


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
        opened = os.fstat(fd)
        require((opened.st_dev, opened.st_ino, opened.st_size) == (before.st_dev, before.st_ino, before.st_size), name + "-identity")
        raw = b""
        while len(raw) < opened.st_size:
            chunk = os.read(fd, opened.st_size - len(raw))
            require(bool(chunk), name + "-short")
            raw += chunk
        require(os.read(fd, 1) == b"", name + "-trailing")
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


def publish_ready(dirfd, value):
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


def validate_subject(raw):
    require(raw.endswith(b"\n") and raw.count(b"\n") == 1 and b"\r" not in raw, "subject-framing")
    value = json.loads(raw[:-1].decode("utf-8"), object_pairs_hook=pairs, parse_constant=lambda _: (_ for _ in ()).throw(Invalid("nonfinite")))
    require(isinstance(value, dict) and set(value) == {"c", "p", "q", "r", "v", "z"} and finite(value), "subject-shape")
    require(value["v"] == 2 and value["r"] == "TOKEN", "subject-version")
    require(all(isinstance(value[key], str) and value[key] for key in ("c", "q", "z")), "subject-text")
    nested = json.dumps(value["p"], ensure_ascii=False, allow_nan=False, sort_keys=True, separators=(",", ":")).encode("utf-8")
    require(len(nested) <= 170, "subject-payload")


def main(root=ROOT):
    require(len(sys.argv) == 2 and UUID_RE.fullmatch(sys.argv[1]), "argv")
    cwd = os.getcwd()
    info = os.lstat(cwd)
    require(stat.S_ISDIR(info.st_mode) and stat.S_IMODE(info.st_mode) == 0o700 and info.st_uid == os.getuid(), "cwd-custody")
    dirfd = os.open(".", os.O_RDONLY | os.O_DIRECTORY | os.O_NOFOLLOW | os.O_CLOEXEC)
    try:
        pre_raw = read_exact(dirfd, "predeclaration.json", 0o444, 8192)
        pre = json.loads(pre_raw.decode("utf-8"), object_pairs_hook=pairs, parse_constant=lambda _: (_ for _ in ()).throw(Invalid("nonfinite")))
        require(isinstance(pre, dict) and set(pre) == PRE_KEYS and finite(pre) and canonical(pre) == pre_raw, "predeclaration")
        require(pre["schema_id"] == "pw-r9-codex-native-goal-skill-blocking-predeclaration-v3", "pre-schema")
        require(pre["matrix_code"] in MATRICES and pre["matrix_id"] == MATRICES[pre["matrix_code"]][0], "matrix")
        require(isinstance(pre["wave_index"], int) and not isinstance(pre["wave_index"], bool) and 0 <= pre["wave_index"] < MATRICES[pre["matrix_code"]][1], "wave")
        require(pre["route"] in ROSTER and (pre["route_code"], pre["model_requested"], pre["reasoning_effort_requested"]) == ROSTER[pre["route"]], "route")
        require(isinstance(pre["execution_nonce"], str) and HEX_RE.fullmatch(pre["execution_nonce"]), "nonce")
        require(isinstance(pre["result_contract_sha256"], str) and HEX_RE.fullmatch(pre["result_contract_sha256"]), "contract")
        require((pre["bootstrap_skill_bytes"], pre["bootstrap_skill_sha256"]) == (SKILL_BYTES, SKILL_SHA256), "skill")
        require(isinstance(pre["subject_bytes"], int) and not isinstance(pre["subject_bytes"], bool) and 1 <= pre["subject_bytes"] <= 512, "subject-size")
        require(isinstance(pre["subject_sha256"], str) and HEX_RE.fullmatch(pre["subject_sha256"]), "subject-sha")
        objective = "CG8|m={}|w={:04d}|r={}|x={}|once".format(pre["matrix_code"], pre["wave_index"], pre["route_code"], pre["execution_nonce"])
        require(pre["goal_objective"] == objective and pre["task_path"] == "/root/r9_cg8_" + pre["execution_nonce"], "control")
        expected = os.path.join(root, pre["matrix_code"], f"{pre['wave_index']:04d}", pre["route_code"], pre["execution_nonce"])
        require(cwd == expected and os.path.realpath(cwd) == expected, "cwd")
        waiter = read_exact(dirfd, "wait.py", 0o444, 32768)
        require(len(waiter) == pre["waiter_bytes"] and hashlib.sha256(waiter).hexdigest() == pre["waiter_sha256"], "waiter")
        require(absent(dirfd, "ready.json") and absent(dirfd, "subject.stage") and absent(dirfd, "subject.txt"), "absence")
        publish_ready(dirfd, {
            "bootstrap_skill_sha256": SKILL_SHA256, "execution_nonce": pre["execution_nonce"], "goal_thread_id": sys.argv[1],
            "matrix_code": pre["matrix_code"], "pid": os.getpid(), "request_sha256": hashlib.sha256(pre_raw).hexdigest(),
            "route_code": pre["route_code"], "schema_id": "pw-r9-codex-native-goal-skill-blocking-ready-v3",
            "waiter_sha256": pre["waiter_sha256"], "wave_index": pre["wave_index"],
        })
        deadline = time.monotonic() + 25.0
        while time.monotonic() < deadline:
            if not absent(dirfd, "subject.txt"):
                subject = read_exact(dirfd, "subject.txt", 0o444, 512)
                require(len(subject) == pre["subject_bytes"] and hashlib.sha256(subject).hexdigest() == pre["subject_sha256"], "subject-bind")
                validate_subject(subject)
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
