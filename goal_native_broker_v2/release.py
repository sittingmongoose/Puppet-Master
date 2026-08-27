#!/usr/bin/env python3
import argparse
import hashlib
import json
import os
import re
import stat
import sys

SCHEMA = "pw-codex-native-goal-subject-broker-corpus-v2"
RELEASE_SCHEMA = "pw-codex-native-goal-subject-release-v2"
UUID = re.compile(r"^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$")
CASE = re.compile(r"^[a-z0-9][a-z0-9_-]{0,63}$")


class Invalid(Exception):
    pass


def canonical(value):
    return json.dumps(value, ensure_ascii=False, allow_nan=False, sort_keys=True, separators=(",", ":")).encode("utf-8")


def read_regular(path):
    if not os.path.isabs(path):
        path = os.path.abspath(path)
    flags = os.O_RDONLY | getattr(os, "O_CLOEXEC", 0) | getattr(os, "O_NOFOLLOW", 0)
    fd = os.open(path, flags)
    try:
        before = os.fstat(fd)
        if not stat.S_ISREG(before.st_mode) or before.st_nlink != 1 or before.st_size > 1_000_000:
            raise Invalid("corpus-custody")
        chunks = []
        remaining = before.st_size
        while remaining:
            chunk = os.read(fd, min(remaining, 65536))
            if not chunk:
                raise Invalid("corpus-short-read")
            chunks.append(chunk)
            remaining -= len(chunk)
        if os.read(fd, 1):
            raise Invalid("corpus-growth")
        after = os.fstat(fd)
        if (before.st_dev, before.st_ino, before.st_size, before.st_mtime_ns) != (after.st_dev, after.st_ino, after.st_size, after.st_mtime_ns):
            raise Invalid("corpus-drift")
        return b"".join(chunks)
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
    seen = set()
    for item in value["cases"]:
        if not isinstance(item, dict) or set(item) != {"case_id", "subject_sha256", "subject_utf8"}:
            raise Invalid("case-shape")
        cid = item["case_id"]
        subject = item["subject_utf8"]
        if not isinstance(cid, str) or not CASE.fullmatch(cid) or cid in seen:
            raise Invalid("case-id")
        if not isinstance(subject, str) or not 1 <= len(subject.encode("utf-8")) <= 256 or "\r" in subject or "\n" in subject:
            raise Invalid("subject")
        digest = hashlib.sha256(subject.encode("utf-8")).hexdigest()
        if item["subject_sha256"] != digest:
            raise Invalid("subject-hash")
        seen.add(cid)
    return value


def main():
    parser = argparse.ArgumentParser(add_help=False)
    parser.add_argument("--corpus", required=True)
    parser.add_argument("--case", required=True)
    parser.add_argument("--thread", required=True)
    parser.add_argument("--release", action="store_true")
    args = parser.parse_args()
    if not args.release or not CASE.fullmatch(args.case) or not UUID.fullmatch(args.thread):
        raise Invalid("cli")
    corpus = load_corpus(args.corpus)
    matches = [item for item in corpus["cases"] if item["case_id"] == args.case]
    if len(matches) != 1:
        raise Invalid("case-missing")
    item = matches[0]
    result = {
        "case_id": item["case_id"],
        "goal_thread_id": args.thread,
        "schema_id": RELEASE_SCHEMA,
        "subject_sha256": item["subject_sha256"],
        "subject_utf8": item["subject_utf8"],
    }
    sys.stdout.buffer.write(canonical(result) + b"\n")


if __name__ == "__main__":
    try:
        main()
    except Invalid as exc:
        sys.stdout.write(canonical({"error": str(exc), "schema_id": RELEASE_SCHEMA, "status": "FAIL"}).decode("utf-8") + "\n")
        raise SystemExit(1)
