#!/usr/bin/env python3
"""Locate a caller-supplied exact quote in one assignment's canonical ranges.

This tool prints line-number matches only. It never prints canonical source text.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import sys
from pathlib import Path
from typing import Any


RUNNER_DIR = Path(__file__).resolve().parent
AUDIT_ROOT = RUNNER_DIR.parents[1]
WORKSPACE = RUNNER_DIR.parents[4]
PACKET = AUDIT_ROOT / "assignments" / "runner-08.jsonl"


def normalize(value: str) -> str:
    return " ".join(value.split())


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def load_assignment(assignment_id: str) -> dict[str, Any]:
    for line in PACKET.read_text(encoding="utf-8").splitlines():
        if not line.strip():
            continue
        row = json.loads(line)
        if row.get("assignment_id") == assignment_id:
            return row
    raise SystemExit("assignment_not_found")


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--assignment-id", required=True)
    parser.add_argument("--quote")
    parser.add_argument("--max-span-lines", type=int, default=20)
    args = parser.parse_args()
    quote = args.quote if args.quote is not None else sys.stdin.read()
    needle = normalize(quote)
    if not needle:
        raise SystemExit("empty_quote")

    assignment = load_assignment(args.assignment_id)
    capsule_path = WORKSPACE / assignment["capsule_ref"]
    capsule = json.loads(capsule_path.read_text(encoding="utf-8"))
    document_path = WORKSPACE / assignment["document_path"]
    if sha256(document_path) != assignment["source_sha256"]:
        raise SystemExit("canonical_source_hash_mismatch")
    lines = document_path.read_text(encoding="utf-8").splitlines()
    ranges = [assignment["core_range"], *capsule.get("context_ranges", [])]
    matches: list[dict[str, int]] = []

    for low, high in ranges:
        for start in range(low, high + 1):
            for end in range(start, min(high, start + args.max_span_lines - 1) + 1):
                candidate = normalize("\n".join(lines[start - 1 : end]))
                if needle in candidate:
                    matches.append({"line_start": start, "line_end": end})
                    break

    unique: list[dict[str, int]] = []
    seen: set[tuple[int, int]] = set()
    for match in matches:
        key = (match["line_start"], match["line_end"])
        if key not in seen:
            seen.add(key)
            unique.append(match)

    print(json.dumps({
        "assignment_id": args.assignment_id,
        "document_path": assignment["document_path"],
        "canonical_source_sha256_match": True,
        "quote_sha256": hashlib.sha256(quote.encode("utf-8")).hexdigest(),
        "matches": unique,
        "unique_match": len(unique) == 1,
    }, sort_keys=True))
    return 0 if unique else 2


if __name__ == "__main__":
    raise SystemExit(main())
