#!/usr/bin/env python3
import json
import os
import stat
import sys
import time

sys.dont_write_bytecode = True
HERE = os.path.dirname(os.path.realpath(__file__))


def fail(message):
    raise SystemExit("FAIL:" + message)


def publish_ready():
    data = json.dumps(
        {"pid": os.getpid(), "schema_id": "pw-r9-goal-content-free-hold-ready-v1"},
        separators=(",", ":"),
        sort_keys=True,
    ).encode() + b"\n"
    path = os.path.join(HERE, "ready.json")
    fd = os.open(path, os.O_WRONLY | os.O_CREAT | os.O_EXCL | os.O_NOFOLLOW, 0o444)
    try:
        os.write(fd, data)
        os.fsync(fd)
        os.fchmod(fd, 0o444)
    finally:
        os.close(fd)
    dirfd = os.open(HERE, os.O_RDONLY | os.O_DIRECTORY | os.O_NOFOLLOW)
    try:
        os.fsync(dirfd)
    finally:
        os.close(dirfd)


def main():
    if len(sys.argv) != 1:
        fail("argv")
    publish_ready()
    release = os.path.join(HERE, "release.txt")
    deadline = time.monotonic() + 180.0
    while True:
        try:
            info = os.lstat(release)
        except FileNotFoundError:
            if time.monotonic() >= deadline:
                fail("timeout")
            time.sleep(0.02)
            continue
        if not stat.S_ISREG(info.st_mode) or stat.S_IMODE(info.st_mode) != 0o444 or info.st_size != 3:
            fail("release-custody")
        fd = os.open(release, os.O_RDONLY | os.O_NOFOLLOW)
        try:
            value = os.read(fd, 4)
        finally:
            os.close(fd)
        if value != b"GO\n":
            fail("release-bytes")
        sys.stdout.write("GO")
        sys.stdout.flush()
        return


if __name__ == "__main__":
    main()
