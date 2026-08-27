#!/usr/bin/env python3
import hashlib
import os
import re
import stat
import sys

ROOT = "/mnt/Cursor/PuppetMaster/tests/r9_goal_microcase/q12"
CASE_SHA256 = "b4cf3ee65cb1a0b46caf286c4c1ca2f2a295c9ae95c4e12b4907a0cd663afc2f"
TERMINAL = b"DONE"


class Invalid(Exception):
    pass


def require(condition, mismatch):
    if not condition:
        raise Invalid(mismatch)


def read_bound(path, mode, cap):
    before = os.lstat(path)
    require(stat.S_ISREG(before.st_mode) and stat.S_IMODE(before.st_mode) == mode, "read-custody")
    require(before.st_uid == os.getuid() and before.st_nlink == 1 and before.st_size <= cap, "read-identity")
    flags = os.O_RDONLY | os.O_CLOEXEC
    if hasattr(os, "O_NOFOLLOW"):
        flags |= os.O_NOFOLLOW
    fd = os.open(path, flags)
    try:
        raw = os.read(fd, cap + 1)
        require(os.read(fd, 1) == b"", "read-trailing")
    finally:
        os.close(fd)
    after = os.lstat(path)
    require((before.st_dev, before.st_ino, before.st_mode, before.st_uid, before.st_size, before.st_mtime_ns) == (after.st_dev, after.st_ino, after.st_mode, after.st_uid, after.st_size, after.st_mtime_ns), "read-drift")
    return raw


def publish(raw):
    path = ROOT + "/result.txt"
    flags = os.O_WRONLY | os.O_CREAT | os.O_EXCL | os.O_CLOEXEC
    if hasattr(os, "O_NOFOLLOW"):
        flags |= os.O_NOFOLLOW
    fd = os.open(path, flags, 0o444)
    try:
        os.fchmod(fd, 0o444)
        offset = 0
        while offset < len(raw):
            offset += os.write(fd, raw[offset:])
        os.fsync(fd)
        info = os.fstat(fd)
        require(stat.S_IMODE(info.st_mode) == 0o444 and info.st_size == len(raw) and info.st_nlink == 1, "publish")
    finally:
        os.close(fd)
    parent = os.open(ROOT, os.O_RDONLY | os.O_DIRECTORY | os.O_CLOEXEC)
    try:
        os.fsync(parent)
    finally:
        os.close(parent)
    require(read_bound(path, 0o444, 49) == raw, "result-reopen")


def main():
    try:
        require(len(sys.argv) == 2 and re.fullmatch(r"[A-Za-z0-9._:-]{1,48}", sys.argv[1]) is not None, "token")
        require(os.getcwd() == ROOT, "cwd")
        root = os.lstat(ROOT)
        require(stat.S_ISDIR(root.st_mode) and stat.S_IMODE(root.st_mode) == 0o700 and root.st_uid == os.getuid(), "root")
        require(sorted(os.listdir(ROOT)) == ["case.txt", "record.py", "show.py"], "inventory")
        case = read_bound(ROOT + "/case.txt", 0o444, 428)
        require(hashlib.sha256(case).hexdigest() == CASE_SHA256, "case-binding")
        publish(sys.argv[1].encode() + b"\n")
    except (Invalid, OSError) as exc:
        sys.stderr.write("FAIL:" + str(exc) + "\n")
        return 1
    return 0 if os.write(1, TERMINAL) == len(TERMINAL) else 1


if __name__ == "__main__":
    raise SystemExit(main())
