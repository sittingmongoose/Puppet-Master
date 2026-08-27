#!/usr/bin/env python3
import hashlib
import json
import os
import re
import stat
import sys

CASE_DIR = "/mnt/Cursor/PuppetMaster/tests/r9_goal_packet/q11"
PACKET_BYTES = 394
PACKET_SHA256 = "3f227a4511b808e1efc984d477da44b785db7f3f54f657925f40a531450d1ed1"
CONTROL = b"WORK|v2|case=c005b00003|task=extract_x_from_p|reply=python3_-B_submit.py_<TOKEN>|token=^[A-Za-z0-9._:-]{1,48}$"
SUBJECT_BYTES = 282
SUBJECT_SHA256 = "a241f880aa450f7d90586ce289b1232592e172376700ba7f26f77dcf6e88e31f"


class Invalid(Exception):
    pass


def require(condition, mismatch):
    if not condition:
        raise Invalid(mismatch)


def _constant(value):
    raise Invalid("nonfinite-json:" + value)


def _pairs(items):
    result = {}
    for key, value in items:
        if key in result:
            raise Invalid("duplicate-key:" + key)
        result[key] = value
    return result


def parse(raw, name):
    try:
        return json.loads(raw.decode("utf-8"), object_pairs_hook=_pairs, parse_constant=_constant)
    except (UnicodeDecodeError, json.JSONDecodeError, Invalid) as exc:
        raise Invalid("json:" + name) from exc


def metadata(info):
    return (info.st_dev, info.st_ino, info.st_mode, info.st_uid, info.st_size, info.st_mtime_ns)


def read_bound(path, size):
    before = os.lstat(path)
    require(stat.S_ISREG(before.st_mode) and stat.S_IMODE(before.st_mode) == 0o444, "packet-custody")
    require(before.st_uid == os.getuid() and before.st_nlink == 1 and before.st_size == size, "packet-identity")
    flags = os.O_RDONLY | os.O_CLOEXEC
    if hasattr(os, "O_NOFOLLOW"):
        flags |= os.O_NOFOLLOW
    fd = os.open(path, flags)
    try:
        require(metadata(os.fstat(fd)) == metadata(before), "packet-open-binding")
        chunks = []
        while True:
            chunk = os.read(fd, 4096)
            if not chunk:
                break
            chunks.append(chunk)
        raw = b"".join(chunks)
    finally:
        os.close(fd)
    require(metadata(os.lstat(path)) == metadata(before), "packet-read-drift")
    return raw


def validate(raw):
    require(len(raw) == PACKET_BYTES and hashlib.sha256(raw).hexdigest() == PACKET_SHA256, "packet-bytes")
    require(b"\r" not in raw and raw.endswith(b"\n") and raw.count(b"\n") == 2, "packet-framing")
    control, subject, terminal = raw.split(b"\n")
    require(control == CONTROL and terminal == b"", "control")
    require(len(subject) == SUBJECT_BYTES and hashlib.sha256(subject).hexdigest() == SUBJECT_SHA256, "subject-binding")
    value = parse(subject, "subject")
    require(set(value) == {"a", "i", "k", "n", "p", "ph", "v"}, "subject-keys")
    require(value["a"] == "57ca7d8258c2e8110c7f4ab5" and value["i"] == "n00003", "subject-attempt")
    require(value["k"] == "subject" and value["n"] == "ede2ea93c74734e834809f507e54ab92762cc818d2c444fa0f5806ae38f48b2e" and value["v"] == 1, "subject-node")
    payload_raw = value["p"].encode("utf-8")
    require(hashlib.sha256(payload_raw).hexdigest() == value["ph"], "payload-hash")
    payload = parse(payload_raw, "payload")
    require(set(payload) == {"op", "t", "x"} and payload["op"] == "label" and payload["t"] == "options", "payload-shape")
    require(isinstance(payload["x"], str) and re.fullmatch(r"[A-Za-z0-9._:-]{1,48}", payload["x"]) is not None, "payload-token")


def main():
    try:
        require(sys.argv == ["read_packet.py"], "argv")
        require(os.getcwd() == CASE_DIR and os.path.abspath(__file__) == CASE_DIR + "/read_packet.py", "location")
        root = os.lstat(CASE_DIR)
        require(stat.S_ISDIR(root.st_mode) and stat.S_IMODE(root.st_mode) == 0o700 and root.st_uid == os.getuid(), "case-custody")
        require(sorted(os.listdir(CASE_DIR)) == ["packet.txt", "read_packet.py", "submit.py"], "case-inventory")
        for name in ["read_packet.py", "submit.py"]:
            info = os.lstat(CASE_DIR + "/" + name)
            require(stat.S_ISREG(info.st_mode) and stat.S_IMODE(info.st_mode) == 0o644 and info.st_uid == os.getuid() and info.st_nlink == 1, "script-custody:" + name)
        raw = read_bound(CASE_DIR + "/packet.txt", PACKET_BYTES)
        validate(raw)
        require(read_bound(CASE_DIR + "/packet.txt", PACKET_BYTES) == raw, "packet-reopen")
    except (Invalid, OSError, KeyError, TypeError, ValueError) as exc:
        sys.stderr.write("FAIL:" + str(exc) + "\n")
        return 1
    return 0 if os.write(1, raw) == len(raw) else 1


if __name__ == "__main__":
    raise SystemExit(main())
