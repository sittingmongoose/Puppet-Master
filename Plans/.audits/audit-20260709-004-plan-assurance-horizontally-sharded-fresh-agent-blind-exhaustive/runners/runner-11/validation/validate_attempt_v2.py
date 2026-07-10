#!/usr/bin/env python3
"""Read-only runner-local preflight mirroring frozen postrun v2 evidence rules."""

from __future__ import annotations

import argparse
import hashlib
import json
import re
import sys
from datetime import datetime, timezone
from pathlib import Path
from typing import Any


REQUIRED_ARRAYS = (
    "observations",
    "candidate_findings",
    "explicit_non_gaps",
    "unknowns",
    "exact_evidence_refs",
)


def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def first(record: dict[str, Any], *names: str) -> Any:
    for name in names:
        if name in record:
            return record[name]
    return None


def normalized(value: str) -> str:
    return " ".join(value.split())


def evidence_parts(ref: dict[str, Any]) -> tuple[Any, Any, Any, Any]:
    path = first(ref, "path", "document_path", "file")
    start = first(ref, "line_start", "start_line")
    end = first(ref, "line_end", "end_line")
    quote = first(ref, "quote", "excerpt", "exact_excerpt", "exact_quote")
    compact = ref.get("ref")
    if (path is None or start is None) and isinstance(compact, str):
        match = re.fullmatch(r"(.+):(\d+)(?:-(\d+))?", compact.strip())
        if match:
            path = path or match.group(1)
            start = start or int(match.group(2))
            end = end or int(match.group(3) or match.group(2))
    return path, start, end, quote


def walk_dicts(value: Any):
    if isinstance(value, dict):
        yield value
        for nested in value.values():
            yield from walk_dicts(nested)
    elif isinstance(value, list):
        for nested in value:
            yield from walk_dicts(nested)


def evidence_issues(
    ref: Any,
    assignment: dict[str, Any],
    capsule: dict[str, Any],
    source_lines: list[str],
) -> list[str]:
    if not isinstance(ref, dict):
        return ["evidence reference is not an object"]
    path, start, end, quote = evidence_parts(ref)
    issues: list[str] = []
    if path != assignment["document_path"]:
        issues.append("evidence document path mismatch")
    if not isinstance(start, int):
        issues.append("evidence line_start missing or invalid")
        return issues
    if end is None:
        end = start
    if not isinstance(end, int) or start > end:
        issues.append("evidence line range invalid")
        return issues
    ranges = [assignment["core_range"], *capsule.get("context_ranges", [])]
    if not any(start >= low and end <= high for low, high in ranges):
        issues.append("evidence range outside assigned capsule")
    if start < 1 or end > len(source_lines):
        issues.append("evidence range outside canonical source")
        return issues
    if not isinstance(quote, str) or not quote.strip():
        issues.append("exact evidence quote missing")
    else:
        source_text = normalized("\n".join(source_lines[start - 1 : end]))
        if normalized(quote) not in source_text:
            issues.append("exact evidence quote mismatch")
    return issues


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("assignment_id")
    parser.add_argument("raw_result", type=Path)
    args = parser.parse_args()

    runner_dir = Path(__file__).resolve().parents[1]
    audit_dir = runner_dir.parents[1]
    repo = audit_dir.parents[2]
    assignments = [
        json.loads(line)
        for line in (audit_dir / "assignments" / "runner-11.jsonl")
        .read_text(encoding="utf-8")
        .splitlines()
        if line.strip()
    ]
    assignment = next(
        (row for row in assignments if row.get("assignment_id") == args.assignment_id),
        None,
    )
    errors: list[str] = []
    if assignment is None:
        errors.append("assignment not found")
        raw: dict[str, Any] = {}
        capsule: dict[str, Any] = {}
        source_lines: list[str] = []
    else:
        try:
            raw = json.loads(args.raw_result.read_text(encoding="utf-8"))
        except Exception as exc:
            raw = {}
            errors.append(f"raw result invalid JSON: {exc}")
        capsule_path = repo / assignment["capsule_ref"]
        capsule = json.loads(capsule_path.read_text(encoding="utf-8"))
        source_path = repo / assignment["document_path"]
        source_lines = source_path.read_text(encoding="utf-8").splitlines()
        if sha256(capsule_path) != assignment["capsule_sha256"]:
            errors.append("capsule hash mismatch")
        if sha256(source_path) != assignment["source_sha256"]:
            errors.append("canonical source hash mismatch")

    if raw.get("assignment_id") != args.assignment_id:
        errors.append("raw assignment_id mismatch")
    for name in REQUIRED_ARRAYS:
        if not isinstance(raw.get(name), list):
            errors.append(f"{name} must be an array")

    exact_refs = raw.get("exact_evidence_refs", [])
    evidence_ids: set[str] = set()
    if isinstance(exact_refs, list):
        for index, ref in enumerate(exact_refs):
            if isinstance(ref, dict):
                evidence_id = first(ref, "evidence_id", "ref_id", "id")
                if isinstance(evidence_id, str) and evidence_id:
                    if evidence_id in evidence_ids:
                        errors.append(f"duplicate exact evidence id {evidence_id}")
                    evidence_ids.add(evidence_id)
            for issue in evidence_issues(ref, assignment or {}, capsule, source_lines):
                errors.append(f"exact_evidence_refs[{index}]: {issue}")
    if raw.get("candidate_findings") and not exact_refs:
        errors.append("candidate findings lack exact_evidence_refs")

    for name in ("observations", "candidate_findings", "explicit_non_gaps", "unknowns"):
        for index, item in enumerate(raw.get(name, [])):
            if isinstance(item, str):
                refs = re.findall(r"\bE\d+\b", item)
            elif isinstance(item, dict):
                refs = first(item, "evidence_refs", "evidence_ids", "evidence")
            else:
                errors.append(f"{name}[{index}] is neither an object nor a string")
                continue
            if not isinstance(refs, list) or not refs:
                errors.append(f"{name}[{index}] lacks evidence IDs")
                continue
            for value in refs:
                if not isinstance(value, str) or value not in evidence_ids:
                    errors.append(f"{name}[{index}] references unknown evidence ID {value!r}")

    for value in walk_dicts(raw):
        if isinstance(exact_refs, list) and value in exact_refs:
            continue
        compact = value.get("ref")
        has_line_ref = any(key in value for key in ("line_start", "start_line")) or (
            isinstance(compact, str)
            and re.fullmatch(r".+:\d+(?:-\d+)?", compact.strip())
        )
        if has_line_ref:
            for issue in evidence_issues(value, assignment or {}, capsule, source_lines):
                errors.append(f"nested evidence: {issue}")

    report = {
        "audit_id": "audit-20260709-004-plan-assurance-horizontally-sharded-fresh-agent-blind-exhaustive",
        "runner_id": "runner-11",
        "assignment_id": args.assignment_id,
        "raw_result_ref": str(args.raw_result),
        "raw_result_sha256": sha256(args.raw_result) if args.raw_result.exists() else None,
        "validation_passed": not errors,
        "validation_status": "passed" if not errors else "failed",
        "required_arrays_present": all(isinstance(raw.get(name), list) for name in REQUIRED_ARRAYS),
        "exact_evidence_ref_count": len(exact_refs) if isinstance(exact_refs, list) else 0,
        "errors": errors,
        "validated_at": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "validator_authority_version": 2,
    }
    print(json.dumps(report, indent=2, sort_keys=True))
    return 0 if not errors else 1


if __name__ == "__main__":
    sys.exit(main())
