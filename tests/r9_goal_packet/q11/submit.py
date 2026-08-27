#!/usr/bin/env python3
import hashlib
import os
import re
import stat
import sys

CASE_DIR = "/mnt/Cursor/PuppetMaster/tests/r9_goal_packet/q11"
PACKET_SHA256 = "3f227a4511b808e1efc984d477da44b785db7f3f54f657925f40a531450d1ed1"
TERMINAL = b"SUBMITTED"


class Invalid(Exception):
    pass


def require(condition, mismatch):
    if not condition:
        raise Invalid(mismatch)


def metadata(info):
    return (info.st_dev, info.st_ino, info.st_mode, info.st_uid, info.st_size, info.st_mtime_ns)


def read_bound(path, mode, cap):
    before = os.lstat(path)
    require(stat.S_ISREG(before.st_mode) and stat.S_IMODE(before.st_mode) == mode, "read-custody")
    require(before.st_uid == os.getuid() and before.st_nlink == 1 and before.st_size <= cap, "read-identity")
    flags = os.O_RDONLY | os.O_CLOEXEC
    if hasattr(os, "O_NOFOLLOW"):
        flags |= os.O_NOFOLLOW
    fd = os.open(path, flags)
    try:
        require(metadata(os.fstat(fd)) == metadata(before), "read-open-binding")
        raw = os.read(fd, cap + 1)
        require(os.read(fd, 1) == b"", "read-trailing")
    finally:
        os.close(fd)
    require(metadata(os.lstat(path)) == metadata(before), "read-drift")
    return raw


def publish(path, raw):
    flags = os.O_WRONLY | os.O_CREAT | os.O_EXCL | os.O_CLOEXEC
    if hasattr(os, "O_NOFOLLOW"):
        flags |= os.O_NOFOLLOW
    fd = os.open(path, flags, 0o444)
    try:
        os.fchmod(fd, 0o444)
        written = 0
        while written < len(raw):
            written += os.write(fd, raw[written:])
        os.fsync(fd)
        info = os.fstat(fd)
        require(stat.S_ISREG(info.st_mode) and stat.S_IMODE(info.st_mode) == 0o444 and info.st_uid == os.getuid() and info.st_nlink == 1 and info.st_size == len(raw), "answer-publish")
    finally:
        os.close(fd)
    directory = os.open(CASE_DIR, os.O_RDONLY | os.O_DIRECTORY | os.O_CLOEXEC)
    try:
        os.fsync(directory)
    finally:
        os.close(directory)
    require(read_bound(path, 0o444, 49) == raw, "answer-reopen")


def main():
    try:
        require(len(sys.argv) == 2 and re.fullmatch(r"[A-Za-z0-9._:-]{1,48}", sys.argv[1]) is not None, "answer-token")
        require(os.getcwd() == CASE_DIR and os.path.abspath(__file__) == CASE_DIR + "/submit.py", "location")
        root = os.lstat(CASE_DIR)
        require(stat.S_ISDIR(root.st_mode) and stat.S_IMODE(root.st_mode) == 0o700 and root.st_uid == os.getuid(), "case-custody")
        require(sorted(os.listdir(CASE_DIR)) == ["packet.txt", "read_packet.py", "submit.py"], "case-inventory")
        packet = read_bound(CASE_DIR + "/packet.txt", 0o444, 394)
        require(hashlib.sha256(packet).hexdigest() == PACKET_SHA256, "packet-binding")
        publish(CASE_DIR + "/answer.txt", sys.argv[1].encode("utf-8") + b"\n")
    except (Invalid, OSError) as exc:
        sys.stderr.write("FAIL:" + str(exc) + "\n")
        return 1
    return 0 if os.write(1, TERMINAL) == len(TERMINAL) else 1


if __name__ == "__main__":
    raise SystemExit(main())
