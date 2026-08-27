#!/usr/bin/env python3
"""Emit, create once, or check the canonical expanded seal relation."""

import argparse
import hashlib
import json
import os
import stat
import sys

import seal_truth_source


EXPECTED_BASENAME = "seal_transition_table.json"


def canonical_bytes():
    value = seal_truth_source.build_relation()
    raw = json.dumps(value, ensure_ascii=False, allow_nan=False, separators=(",", ":"), sort_keys=True).encode("utf-8") + b"\n"
    lowered = raw.lower()
    for forbidden in (b"guard", b"priority", b"decision", b"outcome", b"wildcard", b"default", b"callback", b"classifier"):
        if forbidden in lowered:
            raise AssertionError("forbidden vocabulary present: " + forbidden.decode("ascii"))
    if len(value["rows"]) != 13027:
        raise AssertionError("row count mismatch")
    if [row["ordinal"] for row in value["rows"]] != ["tr%05d" % index for index in range(13027)]:
        raise AssertionError("ordinal sequence mismatch")
    return raw


def require_absolute_table(path):
    if not os.path.isabs(path):
        raise ValueError("table path must be absolute")
    if os.path.basename(path) != EXPECTED_BASENAME:
        raise ValueError("table basename mismatch")
    expected_parent = os.path.dirname(os.path.abspath(__file__))
    if os.path.dirname(path) != expected_parent:
        raise ValueError("table parent mismatch")


def create_once(path, raw):
    require_absolute_table(path)
    descriptor = os.open(path, os.O_WRONLY | os.O_CREAT | os.O_EXCL, 0o644)
    try:
        with os.fdopen(descriptor, "wb", closefd=True) as handle:
            handle.write(raw)
            handle.flush()
            os.fsync(handle.fileno())
    except BaseException:
        raise
    reopened = os.open(path, os.O_RDONLY)
    try:
        observed = b""
        while True:
            part = os.read(reopened, 1024 * 1024)
            if not part:
                break
            observed += part
        mode = stat.S_IMODE(os.fstat(reopened).st_mode)
    finally:
        os.close(reopened)
    if observed != raw or mode != 0o644:
        raise AssertionError("create/reopen verification mismatch")
    print("CREATED bytes=%d sha256=%s mode=%04o" % (len(raw), hashlib.sha256(raw).hexdigest(), mode))


def check(path, raw):
    require_absolute_table(path)
    try:
        with open(path, "rb") as handle:
            observed = handle.read()
    except OSError as exc:
        print("CHECK_FAIL read=" + str(exc))
        return 1
    limit = min(len(raw), len(observed))
    mismatch = next((index for index in range(limit) if raw[index] != observed[index]), None)
    if mismatch is None and len(raw) != len(observed):
        mismatch = limit
    mode = stat.S_IMODE(os.stat(path).st_mode)
    if mismatch is not None or mode != 0o644:
        print("CHECK_FAIL first_mismatch=%s expected_bytes=%d observed_bytes=%d expected_mode=0644 observed_mode=%04o" %
              ("NONE" if mismatch is None else str(mismatch), len(raw), len(observed), mode))
        return 1
    print("CHECK_OK bytes=%d sha256=%s mode=%04o rows=13027 first_mismatch=NONE" %
          (len(raw), hashlib.sha256(raw).hexdigest(), mode))
    return 0


def main(argv=None):
    parser = argparse.ArgumentParser()
    group = parser.add_mutually_exclusive_group(required=True)
    group.add_argument("--emit", action="store_true")
    group.add_argument("--check", action="store_true")
    group.add_argument("--output", metavar="ABS")
    parser.add_argument("--table", metavar="ABS")
    args = parser.parse_args(argv)
    if args.check and not args.table:
        parser.error("--check requires --table ABS")
    if not args.check and args.table:
        parser.error("--table is valid only with --check")
    raw = canonical_bytes()
    if args.emit:
        sys.stdout.buffer.write(raw)
        return 0
    if args.output:
        create_once(args.output, raw)
        return 0
    return check(args.table, raw)


if __name__ == "__main__":
    raise SystemExit(main())
