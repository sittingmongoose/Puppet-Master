#!/usr/bin/env python3
import os
import stat
import sys

CASE_DIR = "/mnt/Cursor/PuppetMaster/tests/r9_goal_inline/p01"
TOKEN = b"INLINE_READY"


class Invalid(Exception):
    pass


def require(condition, mismatch):
    if not condition:
        raise Invalid(mismatch)


def main():
    try:
        require(sys.argv == ["run.py"], "argv")
        require(os.getcwd() == CASE_DIR, "cwd")
        require(os.environ.get("PYTHONDONTWRITEBYTECODE") == "1", "environment")
        root = os.lstat(CASE_DIR)
        require(stat.S_ISDIR(root.st_mode), "directory-kind")
        require(stat.S_IMODE(root.st_mode) == 0o700, "directory-mode")
        require(root.st_uid == os.getuid(), "directory-owner")
        require(os.listdir(CASE_DIR) == ["run.py"], "inventory")
        script = os.lstat(CASE_DIR + "/run.py")
        require(stat.S_ISREG(script.st_mode), "script-kind")
        require(stat.S_IMODE(script.st_mode) == 0o644, "script-mode")
        require(script.st_uid == os.getuid() and script.st_nlink == 1, "script-custody")
    except (Invalid, OSError) as exc:
        sys.stderr.write("FAIL:" + str(exc) + "\n")
        return 1
    return 0 if os.write(1, TOKEN) == len(TOKEN) else 1


if __name__ == "__main__":
    raise SystemExit(main())
