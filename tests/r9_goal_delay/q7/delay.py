#!/usr/bin/env python3
import json
import os
import sys
import time

sys.dont_write_bytecode = True
HERE = os.path.dirname(os.path.realpath(__file__))


def main():
    if len(sys.argv) != 1:
        raise SystemExit("FAIL:argv")
    data = json.dumps(
        {"pid": os.getpid(), "schema_id": "pw-r9-goal-post-active-delay-ready-v1"},
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
    time.sleep(28.0)
    sys.stdout.write("READY")
    sys.stdout.flush()


if __name__ == "__main__":
    main()
