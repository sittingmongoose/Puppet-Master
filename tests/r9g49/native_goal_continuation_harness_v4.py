#!/usr/bin/env python3
"""Stable-live-read adapter for the continuation-aware native Goal harness."""

from __future__ import annotations

import argparse
import hashlib
import importlib.util
import os
import stat
import subprocess
import sys
import time
from pathlib import Path

SCHEMA = "pw-r9-native-goal-continuation-harness-v4"
REPO = Path("/mnt/Cursor/PuppetMaster")
V3_PATH = REPO / "tests/r9g49/native_goal_continuation_harness_v3.py"
V3_ID = {
    "bytes": 16107,
    "mode": "0644",
    "path": "tests/r9g49/native_goal_continuation_harness_v3.py",
    "sha256": "faf09b0e3004fa51199c59236d0ae55c83fe51875ac6978e6ff4c40b29776d8c",
}


def sha(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def read(path: Path, label: str) -> bytes:
    before = path.lstat()
    if (
        path.resolve(strict=True) != path
        or not stat.S_ISREG(before.st_mode)
        or stat.S_IMODE(before.st_mode) != 0o644
    ):
        raise RuntimeError(f"custody:{label}")
    fd = os.open(path, os.O_RDONLY | getattr(os, "O_NOFOLLOW", 0))
    try:
        opened = os.fstat(fd)
        if (opened.st_dev, opened.st_ino) != (before.st_dev, before.st_ino):
            raise RuntimeError(f"race:{label}")
        chunks = []
        while True:
            chunk = os.read(fd, 1024 * 1024)
            if not chunk:
                break
            chunks.append(chunk)
    finally:
        os.close(fd)
    after = path.lstat()
    if (after.st_dev, after.st_ino, after.st_size, after.st_mtime_ns) != (
        before.st_dev,
        before.st_ino,
        before.st_size,
        before.st_mtime_ns,
    ):
        raise RuntimeError(f"drift:{label}")
    return b"".join(chunks)


_raw = read(V3_PATH, "v3")
if len(_raw) != V3_ID["bytes"] or sha(_raw) != V3_ID["sha256"]:
    raise RuntimeError("v3-identity")
_spec = importlib.util.spec_from_file_location("r9g49_continuation_harness_v3", V3_PATH)
if _spec is None or _spec.loader is None:
    raise RuntimeError("v3-import")
v3 = importlib.util.module_from_spec(_spec)
sys.modules[_spec.name] = v3
_spec.loader.exec_module(v3)
base = v3.base
Invalid = base.Invalid
fail = base.fail
canonical = base.canonical
ROUTES = base.ROUTES
RUNTIME_ID = v3.RUNTIME_ID
MAX_GOAL_TURNS = v3.MAX_GOAL_TURNS

_exact_trace_reader = base.read_trace_rows


def stable_trace_rows(path: Path):
    for _attempt in range(8):
        try:
            return _exact_trace_reader(path)
        except Invalid as exc:
            if str(exc) not in {"drift:trace", "race:trace", "trace-terminal-lf"}:
                raise
            time.sleep(0.01)
    fail("trace-terminal-lf")


base.read_trace_rows = stable_trace_rows
v3.v2.base.read_trace_rows = stable_trace_rows
v3.v2.verify_trace = v3.verify_trace
verify_trace = v3.verify_trace
launch_goal = v3.launch_goal


def self_identity() -> dict[str, object]:
    path = Path(__file__).resolve(strict=True)
    raw = read(path, "self")
    return {
        "bytes": len(raw),
        "mode": "0644",
        "path": str(path.relative_to(REPO)),
        "sha256": sha(raw),
    }


def check() -> dict[str, object]:
    v3.v2.runtime_check()
    if v3.self_identity() != V3_ID:
        fail("v3-self-identity")
    return {
        "authority": False,
        "first_mismatch": None,
        "harness": self_identity(),
        "live_trace_read_attempts": 8,
        "matrix_launch": False,
        "max_goal_turns": MAX_GOAL_TURNS,
        "qualification_credit": 0,
        "runtime": RUNTIME_ID,
        "schema_id": SCHEMA,
        "status": "PASS_STATIC_STABLE_LIVE_TRACE_ZERO_CREDIT_NO_LAUNCH_AUTHORITY",
        "subject_calls": 0,
        "v3": V3_ID,
        "workspace_writes": 0,
    }


def main() -> int:
    try:
        parser = argparse.ArgumentParser(add_help=False)
        parser.add_argument("command")
        parser.add_argument("--check", dest="confirmed", action="store_true")
        args, extra = parser.parse_known_args()
        if extra or args.command != "check" or not args.confirmed:
            fail("CLI")
        output = check()
        code = 0
    except (Invalid, OSError, RuntimeError, ValueError, TypeError, KeyError, subprocess.SubprocessError) as exc:
        output = {
            "authority": False,
            "first_mismatch": str(exc),
            "qualification_credit": 0,
            "schema_id": SCHEMA,
            "status": "FAIL_ZERO_CREDIT_NO_LAUNCH_AUTHORITY",
        }
        code = 1
    sys.stdout.buffer.write(canonical(output))
    return code


if __name__ == "__main__":
    raise SystemExit(main())
