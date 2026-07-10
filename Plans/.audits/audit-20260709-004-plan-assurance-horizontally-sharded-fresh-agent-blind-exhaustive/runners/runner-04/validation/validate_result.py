#!/usr/bin/env python3
"""Structural, identity, hash, range, and exact-evidence validator for runner-04."""

from __future__ import annotations

import argparse
import hashlib
import json
import re
from pathlib import Path


AUDIT_ID = "audit-20260709-004-plan-assurance-horizontally-sharded-fresh-agent-blind-exhaustive"
RUNNER_ID = "runner-04"
MODEL = "gpt-5.6-sol"
REASONING_EFFORT = "ultra"


def sha256(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def require(condition: bool, message: str, errors: list[str]) -> None:
    if not condition:
        errors.append(message)


def canonical_evidence(ref: dict) -> tuple:
    return (
        ref.get("document_path"),
        ref.get("line_start"),
        ref.get("line_end"),
        ref.get("range_class"),
        ref.get("excerpt"),
    )


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--assignment-file", required=True)
    parser.add_argument("--assignment-id", required=True)
    parser.add_argument("--result", required=True)
    parser.add_argument("--agent-instance-id", required=True)
    parser.add_argument("--agent-path", required=True)
    args = parser.parse_args()

    errors: list[str] = []
    assignment_rows = [
        json.loads(line)
        for line in Path(args.assignment_file).read_text().splitlines()
        if line.strip()
    ]
    matches = [r for r in assignment_rows if r.get("assignment_id") == args.assignment_id]
    require(len(matches) == 1, "assignment_lookup_count", errors)
    if len(matches) != 1:
        print(json.dumps({"valid": False, "errors": errors}, sort_keys=True))
        return 1
    assignment = matches[0]

    capsule_path = Path(assignment["capsule_ref"])
    source_path = Path(assignment["source_excerpt_ref"])
    capsule_bytes = capsule_path.read_bytes()
    source_bytes = source_path.read_bytes()
    require(len(capsule_bytes) == assignment["capsule_bytes"], "capsule_bytes", errors)
    require(sha256(capsule_bytes) == assignment["capsule_sha256"], "capsule_sha256", errors)
    require(len(source_bytes) == assignment["source_excerpt_bytes"], "source_excerpt_bytes", errors)
    require(sha256(source_bytes) == assignment["source_excerpt_sha256"], "source_excerpt_sha256", errors)
    capsule = json.loads(capsule_bytes)

    result_bytes = Path(args.result).read_bytes()
    try:
        result = json.loads(result_bytes)
    except Exception as exc:
        print(json.dumps({"valid": False, "errors": [f"result_json:{exc}"]}, sort_keys=True))
        return 1
    require(isinstance(result, dict), "result_not_object", errors)
    if not isinstance(result, dict):
        print(json.dumps({"valid": False, "errors": errors}, sort_keys=True))
        return 1

    expected = {
        "schema_version": "1.0.0",
        "status": "valid_result",
        "assignment_id": assignment["assignment_id"],
        "runner_id": RUNNER_ID,
        "role": assignment["role"],
        "window_id": assignment["window_id"],
        "doc_id": assignment["doc_id"],
        "document_path": assignment["document_path"],
        "source_sha256": assignment["source_sha256"],
        "capsule_ref": assignment["capsule_ref"],
        "capsule_sha256": assignment["capsule_sha256"],
        "capsule_bytes": assignment["capsule_bytes"],
        "source_excerpt_ref": assignment["source_excerpt_ref"],
        "source_excerpt_sha256": assignment["source_excerpt_sha256"],
        "source_excerpt_bytes": assignment["source_excerpt_bytes"],
        "core_range": assignment["core_range"],
        "context_ranges": capsule.get("context_ranges", []),
        "model": MODEL,
        "reasoning_effort": REASONING_EFFORT,
        "prior_substantive_assignment_count": 0,
        "terminal_after_result": True,
        "no_followup_reuse": True,
        "agent_instance_id": args.agent_instance_id,
        "agent_path": args.agent_path,
    }
    for key, value in expected.items():
        require(result.get(key) == value, f"metadata:{key}", errors)
    thread_id = result.get("agent_thread_id")
    require(isinstance(thread_id, str) and bool(thread_id.strip()), "agent_thread_id", errors)

    core = tuple(assignment["core_range"])
    context = [tuple(r) for r in capsule.get("context_ranges", [])]
    allowed_ranges = [(core, "core"), *[(r, "context") for r in context]]
    included_lines = sorted(
        {
            line_no
            for line_range, _ in allowed_ranges
            for line_no in range(line_range[0], line_range[1] + 1)
        }
    )
    source_lines = source_bytes.decode("utf-8").splitlines()
    marker_re = re.compile(r"^<<< (CONTEXT_BEFORE|AUTHORITATIVE_CORE|CONTEXT_AFTER) (\d+)-(\d+) >>>$")
    line_map: dict[int, str] = {}
    cursor = 0
    parsed_ranges: list[tuple[int, int]] = []
    while cursor < len(source_lines):
        if source_lines[cursor] == "":
            cursor += 1
            continue
        match = marker_re.match(source_lines[cursor])
        require(match is not None, f"source_marker:{cursor + 1}", errors)
        if match is None:
            break
        start, end = int(match.group(2)), int(match.group(3))
        parsed_ranges.append((start, end))
        cursor += 1
        block = source_lines[cursor : cursor + (end - start + 1)]
        require(len(block) == end - start + 1, f"source_block:{start}-{end}", errors)
        for line_no, source_line in zip(range(start, end + 1), block):
            require(line_no not in line_map, f"source_duplicate_line:{line_no}", errors)
            line_map[line_no] = source_line
        cursor += end - start + 1
    require(sorted(line_map) == included_lines, "source_line_map", errors)
    require(sorted(parsed_ranges) == sorted([r for r, _ in allowed_ranges]), "source_range_map", errors)
    canonical_lines = Path(assignment["document_path"]).read_text(encoding="utf-8").splitlines()

    nested_refs: list[dict] = []
    for array_name in ("observations", "candidate_findings", "explicit_non_gaps", "unknowns"):
        items = result.get(array_name)
        require(isinstance(items, list), f"array:{array_name}", errors)
        if not isinstance(items, list):
            continue
        for index, item in enumerate(items):
            require(isinstance(item, dict), f"item:{array_name}:{index}", errors)
            if not isinstance(item, dict):
                continue
            refs = item.get("evidence_refs")
            require(isinstance(refs, list) and len(refs) > 0, f"evidence_required:{array_name}:{index}", errors)
            if not isinstance(refs, list):
                continue
            nested_refs.extend(refs)
            if array_name == "candidate_findings":
                require(any(isinstance(r, dict) and r.get("range_class") == "core" for r in refs), f"candidate_core_evidence:{index}", errors)

    for index, ref in enumerate(nested_refs):
        require(isinstance(ref, dict), f"evidence_object:{index}", errors)
        if not isinstance(ref, dict):
            continue
        require(ref.get("document_path") == assignment["document_path"], f"evidence_path:{index}", errors)
        start, end = ref.get("line_start"), ref.get("line_end")
        require(isinstance(start, int) and isinstance(end, int) and start <= end, f"evidence_line_shape:{index}", errors)
        if not (isinstance(start, int) and isinstance(end, int) and start <= end):
            continue
        matches_range = [
            range_class
            for (line_range, range_class) in allowed_ranges
            if start >= line_range[0] and end <= line_range[1]
        ]
        require(ref.get("range_class") in matches_range, f"evidence_range:{index}", errors)
        excerpt = ref.get("excerpt")
        require(isinstance(excerpt, str) and bool(excerpt), f"evidence_excerpt:{index}", errors)
        if isinstance(excerpt, str) and excerpt and start >= 1 and end <= len(canonical_lines):
            evidence_text = "\n".join(canonical_lines[start - 1 : end])
            require(excerpt in evidence_text, f"evidence_exactness:{index}", errors)

    exact_refs = result.get("exact_evidence_refs")
    require(isinstance(exact_refs, list), "exact_evidence_refs_array", errors)
    if isinstance(exact_refs, list):
        nested_set = {canonical_evidence(r) for r in nested_refs if isinstance(r, dict)}
        exact_set = {canonical_evidence(r) for r in exact_refs if isinstance(r, dict)}
        require(len(exact_set) == len(exact_refs), "exact_evidence_refs_duplicates", errors)
        require(exact_set == nested_set, "exact_evidence_refs_union", errors)

    report = {
        "valid": not errors,
        "assignment_id": assignment["assignment_id"],
        "agent_instance_id": args.agent_instance_id,
        "agent_path": args.agent_path,
        "agent_thread_id": thread_id,
        "result_sha256": sha256(result_bytes),
        "result_bytes": len(result_bytes),
        "observation_count": len(result.get("observations", [])) if isinstance(result.get("observations"), list) else 0,
        "candidate_finding_count": len(result.get("candidate_findings", [])) if isinstance(result.get("candidate_findings"), list) else 0,
        "explicit_non_gap_count": len(result.get("explicit_non_gaps", [])) if isinstance(result.get("explicit_non_gaps"), list) else 0,
        "unknown_count": len(result.get("unknowns", [])) if isinstance(result.get("unknowns"), list) else 0,
        "exact_evidence_ref_count": len(result.get("exact_evidence_refs", [])) if isinstance(result.get("exact_evidence_refs"), list) else 0,
        "errors": errors,
    }
    print(json.dumps(report, sort_keys=True))
    return 0 if not errors else 1


if __name__ == "__main__":
    raise SystemExit(main())
