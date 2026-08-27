#!/usr/bin/env python3
import hashlib
import json
import os
import re
import stat
import sys

ROOT = "/mnt/Cursor/PuppetMaster/tests/r9_goal_microcase/q14"
CASE_BYTES = 418
CASE_SHA256 = "6bb9984e7ba354e27562e8b595afd4227626f4bc4dcde6dcdf00f8da0e985959"
HEADER = b"CASE|v1|id=c006b00004|instruction=read_p_then_return_x|record=python3_-B_record.py_<TOKEN>|token=^[A-Za-z0-9._:-]{1,48}$"
BODY_BYTES = 296
BODY_SHA256 = "25e84cf98822203d3e0c3dcc20b104971a20573469ec204e364ca88863dcc932"


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


def parse(raw):
    return json.loads(raw.decode("utf-8"), object_pairs_hook=_pairs, parse_constant=_constant)


def meta(info):
    return (info.st_dev, info.st_ino, info.st_mode, info.st_uid, info.st_size, info.st_mtime_ns)


def read_case():
    path = ROOT + "/case.txt"
    before = os.lstat(path)
    require(stat.S_ISREG(before.st_mode) and stat.S_IMODE(before.st_mode) == 0o444, "case-file")
    require(before.st_uid == os.getuid() and before.st_nlink == 1 and before.st_size == CASE_BYTES, "case-identity")
    flags = os.O_RDONLY | os.O_CLOEXEC
    if hasattr(os, "O_NOFOLLOW"):
        flags |= os.O_NOFOLLOW
    fd = os.open(path, flags)
    try:
        require(meta(os.fstat(fd)) == meta(before), "case-open")
        raw = os.read(fd, CASE_BYTES + 1)
        require(os.read(fd, 1) == b"", "case-trailing")
    finally:
        os.close(fd)
    require(meta(os.lstat(path)) == meta(before), "case-drift")
    return raw


def validate(raw):
    require(len(raw) == CASE_BYTES and hashlib.sha256(raw).hexdigest() == CASE_SHA256, "case-bytes")
    require(b"\r" not in raw and raw.endswith(b"\n") and raw.count(b"\n") == 2, "case-framing")
    header, body, terminal = raw.split(b"\n")
    require(header == HEADER and terminal == b"", "case-header")
    require(len(body) == BODY_BYTES and hashlib.sha256(body).hexdigest() == BODY_SHA256, "case-body")
    value = parse(body)
    require(set(value) == {"a", "i", "k", "n", "p", "ph", "v"}, "body-keys")
    require(value["a"] == "4f162b4de6457777942b8b15" and value["i"] == "n00004", "body-id")
    require(value["k"] == "subject" and value["n"] == "3f0fc51c28ad07e8149bf24d4327c8b7c62dc893e1255e95de8b66724d89ce39" and value["v"] == 1, "body-node")
    payload_raw = value["p"].encode()
    require(hashlib.sha256(payload_raw).hexdigest() == value["ph"], "payload-hash")
    payload = parse(payload_raw)
    require(set(payload) == {"op", "t", "x"} and payload["op"] == "label" and payload["t"] == "options", "payload")
    require(isinstance(payload["x"], str) and re.fullmatch(r"[A-Za-z0-9._:-]{1,48}", payload["x"]) is not None, "payload-token")


def main():
    try:
        require(sys.argv == ["show.py"] and os.getcwd() == ROOT, "invocation")
        root = os.lstat(ROOT)
        require(stat.S_ISDIR(root.st_mode) and stat.S_IMODE(root.st_mode) == 0o700 and root.st_uid == os.getuid(), "root")
        require(sorted(os.listdir(ROOT)) == ["case.txt", "record.py", "show.py"], "inventory")
        for name in ["show.py", "record.py"]:
            info = os.lstat(ROOT + "/" + name)
            require(stat.S_ISREG(info.st_mode) and stat.S_IMODE(info.st_mode) == 0o644 and info.st_uid == os.getuid() and info.st_nlink == 1, "script:" + name)
        raw = read_case()
        validate(raw)
        require(read_case() == raw, "reopen")
    except (Invalid, OSError, KeyError, TypeError, ValueError, UnicodeDecodeError, json.JSONDecodeError) as exc:
        sys.stderr.write("FAIL:" + str(exc) + "\n")
        return 1
    return 0 if os.write(1, raw) == len(raw) else 1


if __name__ == "__main__":
    raise SystemExit(main())
