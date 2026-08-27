#!/usr/bin/env python3
import argparse
import hashlib
import json
import os
import re
import stat
import sys

SCHEMA = "pw-codex-native-goal-raw-subject-corpus-v1"
UUID = re.compile(r"^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$")
CASE = re.compile(r"^[a-z0-9][a-z0-9_-]{0,63}$")


class Invalid(Exception):
    pass


def canonical(value):
    return json.dumps(value, ensure_ascii=False, allow_nan=False, sort_keys=True, separators=(",", ":")).encode("utf-8")


def read_regular(path):
    path = os.path.abspath(path)
    fd = os.open(path, os.O_RDONLY | getattr(os, "O_CLOEXEC", 0) | getattr(os, "O_NOFOLLOW", 0))
    try:
        before = os.fstat(fd)
        if not stat.S_ISREG(before.st_mode) or before.st_nlink != 1 or before.st_size > 1_000_000:
            raise Invalid("corpus-custody")
        parts = []
        remaining = before.st_size
        while remaining:
            block = os.read(fd, min(remaining, 65536))
            if not block:
                raise Invalid("corpus-short-read")
            parts.append(block)
            remaining -= len(block)
        if os.read(fd, 1):
            raise Invalid("corpus-growth")
        after = os.fstat(fd)
        if (before.st_dev, before.st_ino, before.st_size, before.st_mtime_ns) != (after.st_dev, after.st_ino, after.st_size, after.st_mtime_ns):
            raise Invalid("corpus-drift")
        return b"".join(parts)
    finally:
        os.close(fd)


def load_corpus(path):
    raw = read_regular(path)
    if not raw.endswith(b"\n") or raw.count(b"\n") != 1:
        raise Invalid("corpus-framing")
    try:
        value = json.loads(raw)
    except Exception as exc:
        raise Invalid("corpus-json") from exc
    if canonical(value) + b"\n" != raw or not isinstance(value, dict) or set(value) != {"cases", "schema_id"}:
        raise Invalid("corpus-canonical")
    if value["schema_id"] != SCHEMA or not isinstance(value["cases"], list) or not value["cases"]:
        raise Invalid("corpus-schema")
    cases = {}
    for item in value["cases"]:
        if not isinstance(item, dict) or set(item) != {"case_id", "subject_sha256", "subject_utf8"}:
            raise Invalid("case-shape")
        cid, subject = item["case_id"], item["subject_utf8"]
        if not isinstance(cid, str) or not CASE.fullmatch(cid) or cid in cases:
            raise Invalid("case-id")
        if not isinstance(subject, str) or not 1 <= len(subject.encode("utf-8")) <= 256 or "\r" in subject or "\n" in subject:
            raise Invalid("subject")
        if item["subject_sha256"] != hashlib.sha256(subject.encode("utf-8")).hexdigest():
            raise Invalid("subject-hash")
        cases[cid] = item
    return cases


def main():
    parser = argparse.ArgumentParser(add_help=False)
    parser.add_argument("--corpus", required=True)
    parser.add_argument("--case", required=True)
    parser.add_argument("--thread", required=True)
    parser.add_argument("--emit", action="store_true")
    args = parser.parse_args()
    if not args.emit or not CASE.fullmatch(args.case) or not UUID.fullmatch(args.thread):
        raise Invalid("cli")
    cases = load_corpus(args.corpus)
    if args.case not in cases:
        raise Invalid("case-missing")
    sys.stdout.buffer.write(cases[args.case]["subject_utf8"].encode("utf-8") + b"\n")


if __name__ == "__main__":
    try:
        main()
    except Invalid as exc:
        sys.stdout.write(f"FAIL:{exc}\n")
        raise SystemExit(1)
