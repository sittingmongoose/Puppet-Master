#!/usr/bin/env python3
import argparse
import hashlib
import json
import os
import stat
import sys
from pathlib import Path

CORPUS_SCHEMA = "pw-codex-native-goal-raw-subject-corpus-v1"
CELL_SCHEMA = "pw-r9-codex-native-goal-atomic-cell-dag-v1"
NODE_SCHEMA = "pw-r9-codex-native-goal-atomic-node-v1"
REPORT_SCHEMA = "pw-codex-native-goal-raw-broker-canary-006-derivation-check-v1"
MAPPING = (
    ("h", "cell-007", "slot-alpha", "n00004", "no"),
    ("i", "cell-008", "slot-bravo", "n00003", "explorer_direct_bash_direct"),
    ("j", "cell-009", "slot-charlie", "n00003", "route_child_run_without_persona_switch"),
)


class Invalid(Exception):
    pass


def canonical(value):
    return json.dumps(value, ensure_ascii=False, allow_nan=False, sort_keys=True, separators=(",", ":")).encode("utf-8") + b"\n"


def sha256(data):
    return hashlib.sha256(data).hexdigest()


def read_file(path, maximum):
    path = Path(path).resolve(strict=True)
    before = path.lstat()
    if not stat.S_ISREG(before.st_mode) or before.st_nlink != 1 or before.st_size > maximum:
        raise Invalid("custody")
    fd = os.open(path, os.O_RDONLY | getattr(os, "O_CLOEXEC", 0) | getattr(os, "O_NOFOLLOW", 0))
    try:
        parts = []
        while True:
            block = os.read(fd, 1_048_576)
            if not block:
                break
            parts.append(block)
    finally:
        os.close(fd)
    after = path.lstat()
    if (before.st_dev, before.st_ino, before.st_size, before.st_mtime_ns) != (after.st_dev, after.st_ino, after.st_size, after.st_mtime_ns):
        raise Invalid("drift")
    return path, b"".join(parts), f"{stat.S_IMODE(before.st_mode):04o}"


def parse(raw, where):
    try:
        value = json.loads(raw)
    except Exception as exc:
        raise Invalid(f"json:{where}") from exc
    if canonical(value) != raw:
        raise Invalid(f"canonical:{where}")
    return value


def main():
    parser = argparse.ArgumentParser(add_help=False)
    parser.add_argument("--workspace-root", required=True)
    parser.add_argument("--plan-root", required=True)
    parser.add_argument("--corpus", required=True)
    parser.add_argument("--check", action="store_true")
    args = parser.parse_args()
    if not args.check or not all(os.path.isabs(item) for item in (args.workspace_root, args.plan_root, args.corpus)):
        raise Invalid("cli")
    workspace = Path(args.workspace_root).resolve(strict=True)
    plan = Path(args.plan_root).resolve(strict=True)
    corpus_path = Path(args.corpus).resolve(strict=True)
    plan.relative_to(workspace)
    corpus_path.relative_to(workspace)
    _, corpus_raw, corpus_mode = read_file(corpus_path, 10_000)
    corpus = parse(corpus_raw, "corpus")
    if set(corpus) != {"cases", "schema_id"} or corpus["schema_id"] != CORPUS_SCHEMA or corpus_mode != "0644" or not isinstance(corpus["cases"], list):
        raise Invalid("corpus")
    cases = {item.get("case_id"): item for item in corpus["cases"] if isinstance(item, dict)}
    if len(cases) != 3 or set(cases) != {item[0] for item in MAPPING}:
        raise Invalid("case-set")
    sources = []
    expected_results = {}
    for case_id, cell, route, atom_id, expected_x in MAPPING:
        source = plan / "cells" / cell / f"{route}.json"
        source.relative_to(plan)
        _, raw, mode = read_file(source, 2_000_000)
        value = parse(raw, f"source:{case_id}")
        if mode != "0644" or value.get("schema_id") != CELL_SCHEMA or value.get("route") != route or not isinstance(value.get("nodes"), list):
            raise Invalid(f"cell:{case_id}")
        nodes = [node for node in value["nodes"] if node.get("atom_id") == atom_id]
        if len(nodes) != 1:
            raise Invalid(f"node-count:{case_id}")
        node = nodes[0]
        if node.get("schema_id") != NODE_SCHEMA or node.get("kind") != "EVIDENCE_SLICE_LABEL" or node.get("dynamic") is not False:
            raise Invalid(f"node:{case_id}")
        payload_field = node.get("subject_payload")
        if not isinstance(payload_field, dict) or set(payload_field) != {"bytes", "sha256", "utf8"}:
            raise Invalid(f"payload-field:{case_id}")
        payload = payload_field["utf8"]
        payload_raw = payload.encode("utf-8")
        if len(payload_raw) != payload_field["bytes"] or sha256(payload_raw) != payload_field["sha256"]:
            raise Invalid(f"payload-identity:{case_id}")
        payload_value = json.loads(payload)
        if payload_value != {"op": "label", "t": "options", "x": expected_x} or json.dumps(payload_value, sort_keys=True, separators=(",", ":")) != payload:
            raise Invalid(f"payload-value:{case_id}")
        subject = f"Read p={payload}. Return x only; 1-48 characters from A-Za-z0-9._:-."
        subject_hash = sha256(subject.encode("utf-8"))
        if cases[case_id] != {"case_id": case_id, "subject_sha256": subject_hash, "subject_utf8": subject}:
            raise Invalid(f"derived-case:{case_id}")
        expected_results[case_id] = expected_x
        sources.append({"atom_id": atom_id, "bytes": len(raw), "case_id": case_id, "mode": mode, "path": str(source.relative_to(workspace)), "sha256": sha256(raw)})
    report = {"case_count": 3, "corpus_bytes": len(corpus_raw), "corpus_sha256": sha256(corpus_raw), "expected_results": expected_results, "schema_id": REPORT_SCHEMA, "sources": sources, "status": "PASS", "workspace_writes": 0}
    sys.stdout.buffer.write(canonical(report))


if __name__ == "__main__":
    try:
        main()
    except (Invalid, OSError, ValueError) as exc:
        sys.stdout.buffer.write(canonical({"error": str(exc), "schema_id": REPORT_SCHEMA, "status": "FAIL", "workspace_writes": 0}))
        raise SystemExit(1)
