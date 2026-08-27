#!/usr/bin/env python3
"""Read exactly one committed UTF-8 subject from a controller-owned FIFO."""

from __future__ import annotations

import argparse
import hashlib
import os
from pathlib import Path
import stat
import sys


MAX_SUBJECT_BYTES = 8_000_000


def fail(message: str) -> "NoReturn":  # type: ignore[name-defined]
    raise SystemExit(f"GOAL_SUBJECT_READER_FAIL:{message}")


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--fifo", type=Path, required=True)
    parser.add_argument("--sha256", required=True)
    parser.add_argument("--bytes", type=int, required=True)
    args = parser.parse_args()
    if not (0 < args.bytes <= MAX_SUBJECT_BYTES):
        fail("byte_count")
    if len(args.sha256) != 64 or any(ch not in "0123456789abcdef" for ch in args.sha256):
        fail("sha256")
    st = os.lstat(args.fifo)
    if not stat.S_ISFIFO(st.st_mode) or args.fifo.is_symlink():
        fail("not_private_fifo")
    if stat.S_IMODE(st.st_mode) & 0o077:
        fail("fifo_permissions")
    fd = os.open(args.fifo, os.O_RDONLY | getattr(os, "O_CLOEXEC", 0))
    try:
        chunks: list[bytes] = []
        remaining = args.bytes
        while remaining:
            chunk = os.read(fd, min(remaining, 65536))
            if not chunk:
                fail("premature_eof")
            chunks.append(chunk)
            remaining -= len(chunk)
        extra = os.read(fd, 1)
        if extra:
            fail("trailing_bytes")
    finally:
        os.close(fd)
    raw = b"".join(chunks)
    if hashlib.sha256(raw).hexdigest() != args.sha256:
        fail("digest_mismatch")
    try:
        raw.decode("utf-8")
    except UnicodeDecodeError:
        fail("not_utf8")
    if b"\x00" in raw:
        fail("nul_forbidden")
    sys.stdout.buffer.write(raw)
    sys.stdout.buffer.flush()
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
