#!/usr/bin/env python3
import hashlib
import json
import os
import stat
import sys

CASE_DIR = "/mnt/Cursor/PuppetMaster/tests/r9_goal_packet/q10"
PACKET_BYTES = 486
PACKET_SHA256 = "0c9041ea70a5c97a785682402e22149c56a663fefae915f1a14500cc70463ee2"
CONTROL = b"WORK|v1|case=c005b00002|subject=5ed267610e39358f0ea77c249c3290d99fe47ad1bb7206485d0e83d3e4a82ea5|criterion=extract_x_from_p|terminal=OUTCOME:<TOKEN>|token=^[A-Za-z0-9._:-]{1,48}$|ACK=BOUND"
SUBJECT_BYTES = 296
SUBJECT_SHA256 = "5ed267610e39358f0ea77c249c3290d99fe47ad1bb7206485d0e83d3e4a82ea5"


class Invalid(Exception):
    pass


def require(value, mismatch):
    if not value:
        raise Invalid(mismatch)


def _constant(value):
    raise Invalid("nonfinite-json:" + value)


def _pairs(items):
    value = {}
    for key, item in items:
        if key in value:
            raise Invalid("duplicate-key:" + key)
        value[key] = item
    return value


def parse_json(raw, name):
    try:
        return json.loads(raw.decode("utf-8"), object_pairs_hook=_pairs, parse_constant=_constant)
    except (UnicodeDecodeError, json.JSONDecodeError, Invalid) as exc:
        raise Invalid("json:" + name) from exc


def metadata(info):
    return (info.st_dev, info.st_ino, info.st_mode, info.st_uid, info.st_size, info.st_mtime_ns)


def read_bound(path, expected):
    before = os.lstat(path)
    require(stat.S_ISREG(before.st_mode), "packet-regular")
    require(stat.S_IMODE(before.st_mode) == 0o444, "packet-mode")
    require(before.st_uid == os.getuid(), "packet-owner")
    require(before.st_nlink == 1, "packet-nlink")
    require(before.st_size == expected, "packet-stat-size")
    flags = os.O_RDONLY | os.O_CLOEXEC
    if hasattr(os, "O_NOFOLLOW"):
        flags |= os.O_NOFOLLOW
    fd = os.open(path, flags)
    try:
        opened = os.fstat(fd)
        require(metadata(opened) == metadata(before), "packet-open-binding")
        chunks = []
        remaining = expected + 1
        while remaining:
            chunk = os.read(fd, remaining)
            if not chunk:
                break
            chunks.append(chunk)
            remaining -= len(chunk)
        raw = b"".join(chunks)
        require(os.read(fd, 1) == b"", "packet-trailing")
    finally:
        os.close(fd)
    after = os.lstat(path)
    require(metadata(after) == metadata(before), "packet-post-binding")
    return raw, before


def validate(raw):
    require(len(raw) == PACKET_BYTES, "packet-bytes")
    require(hashlib.sha256(raw).hexdigest() == PACKET_SHA256, "packet-sha256")
    require(b"\r" not in raw and raw.endswith(b"\n") and raw.count(b"\n") == 2, "packet-framing")
    control, subject, terminal = raw.split(b"\n")
    require(terminal == b"" and control == CONTROL, "control-line")
    require(len(subject) == SUBJECT_BYTES and hashlib.sha256(subject).hexdigest() == SUBJECT_SHA256, "subject-identity")
    value = parse_json(subject, "subject")
    require(set(value) == {"a", "i", "k", "n", "p", "ph", "v"}, "subject-keys")
    require(value["a"] == "41f1a4f799282ff5f1e4fb28" and value["i"] == "n00002", "subject-attempt")
    require(value["k"] == "subject" and value["n"] == "5663dc0529cc3b97650f700a2bb61a47ec70bd8f603d87a874c209ebb1333e4b", "subject-kind")
    require(value["ph"] == "242de204ab5cc7827ae65331fa27117d14c4a324bd1bceaee3ee518e6fb067e7" and value["v"] == 1, "subject-payload-binding")
    payload = parse_json(value["p"].encode("utf-8"), "payload")
    require(payload == {"op": "label", "t": "options", "x": "invalidate_and_repeat_owner_checks"}, "payload")


def main():
    try:
        require(sys.argv == ["read_packet.py"], "argv")
        require(os.getcwd() == CASE_DIR, "cwd")
        require(os.path.abspath(__file__) == CASE_DIR + "/read_packet.py", "script-path")
        root = os.lstat(CASE_DIR)
        require(stat.S_ISDIR(root.st_mode) and stat.S_IMODE(root.st_mode) == 0o700 and root.st_uid == os.getuid(), "case-directory")
        require(sorted(os.listdir(CASE_DIR)) == ["packet.txt", "read_packet.py"], "case-inventory")
        script = os.lstat(CASE_DIR + "/read_packet.py")
        require(stat.S_ISREG(script.st_mode) and stat.S_IMODE(script.st_mode) == 0o644 and script.st_uid == os.getuid() and script.st_nlink == 1, "script-custody")
        packet_path = CASE_DIR + "/packet.txt"
        raw, first = read_bound(packet_path, PACKET_BYTES)
        validate(raw)
        reopened, second = read_bound(packet_path, PACKET_BYTES)
        require(raw == reopened and metadata(first) == metadata(second), "packet-reopen")
    except (Invalid, OSError, KeyError, TypeError, ValueError) as exc:
        sys.stderr.write("FAIL:" + str(exc) + "\n")
        return 1
    written = os.write(1, raw)
    if written != len(raw):
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
