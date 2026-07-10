#!/usr/bin/env python3
"""Mechanical runner-11 identity, schema, hash, and evidence-range validator."""

from __future__ import annotations

import argparse
import hashlib
import json
import re
import sys
from collections import Counter, defaultdict
from pathlib import Path


AUDIT_ID = "audit-20260709-004-plan-assurance-horizontally-sharded-fresh-agent-blind-exhaustive"
RUNNER_ID = "runner-11"
EXPECTED_MODEL = "gpt-5.6-sol"
EXPECTED_EFFORT = "ultra"
REQUIRED_RESULT_ARRAYS = (
    "observations",
    "candidate_findings",
    "explicit_non_gaps",
    "unknowns",
    "exact_evidence_refs",
)
LINE_REF_RE = re.compile(r"^(Plans/[^:\n]+):(\d+)(?:-(\d+))?$")
INLINE_LINE_REF_RE = re.compile(r"(Plans/[^:\s\"']+):(\d+)(?:-(\d+))?")


def load_jsonl(path: Path) -> list[dict]:
    rows = []
    if not path.exists():
        return rows
    for line_no, line in enumerate(path.read_text(encoding="utf-8").splitlines(), 1):
        if not line.strip():
            continue
        value = json.loads(line)
        if not isinstance(value, dict):
            raise ValueError(f"{path}:{line_no}: row is not an object")
        rows.append(value)
    return rows


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for block in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(block)
    return digest.hexdigest()


def in_ranges(start: int, end: int, ranges: list[list[int]]) -> bool:
    merged: list[list[int]] = []
    for lo, hi in sorted(ranges):
        if not merged or lo > merged[-1][1] + 1:
            merged.append([lo, hi])
        else:
            merged[-1][1] = max(merged[-1][1], hi)
    return any(start >= lo and end <= hi for lo, hi in merged)


def has_evidence(item: object) -> bool:
    if not isinstance(item, dict):
        return False
    for key, value in item.items():
        if "evidence" not in key.lower():
            continue
        if isinstance(value, list) and value:
            return True
        if isinstance(value, str) and value.strip():
            return True
        if isinstance(value, dict) and value:
            return True
    return False


def exact_refs(result: dict) -> list[tuple[str, int, int]]:
    refs: list[tuple[str, int, int]] = []
    for entry in result.get("exact_evidence_refs", []):
        if isinstance(entry, dict):
            start_value = entry.get("line_start", entry.get("start_line"))
            if isinstance(entry.get("file"), str) and isinstance(start_value, int):
                start = start_value
                end = entry.get("line_end", entry.get("end_line", start))
                if isinstance(end, int):
                    refs.append((entry["file"], start, end))
            for key in ("ref", "evidence_ref", "location"):
                value = entry.get(key)
                if isinstance(value, str):
                    match = LINE_REF_RE.match(value)
                    if match:
                        refs.append((match.group(1), int(match.group(2)), int(match.group(3) or match.group(2))))
        elif isinstance(entry, str):
            match = LINE_REF_RE.match(entry)
            if match:
                refs.append((match.group(1), int(match.group(2)), int(match.group(3) or match.group(2))))
    return refs


def validate_result(result: dict, assignment: dict, capsule: dict, errors: list[str]) -> None:
    aid = assignment["assignment_id"]
    if result.get("assignment_id") != aid:
        errors.append(f"{aid}: result assignment_id mismatch")
    for key in REQUIRED_RESULT_ARRAYS:
        if not isinstance(result.get(key), list):
            errors.append(f"{aid}: missing array {key}")
    if isinstance(result.get("exact_evidence_refs"), list) and not result["exact_evidence_refs"]:
        errors.append(f"{aid}: exact_evidence_refs is empty")
    for key in ("observations", "candidate_findings", "explicit_non_gaps", "unknowns"):
        for index, item in enumerate(result.get(key, [])):
            if not has_evidence(item):
                errors.append(f"{aid}: {key}[{index}] lacks an evidence field")

    allowed_ranges = [assignment["core_range"], *capsule.get("context_ranges", [])]
    parsed_refs = exact_refs(result)
    if not parsed_refs:
        errors.append(f"{aid}: no parseable exact evidence ranges")
    for path, start, end in parsed_refs:
        if path != assignment["document_path"]:
            errors.append(f"{aid}: exact evidence path spill {path}")
        if start > end or not in_ranges(start, end, allowed_ranges):
            errors.append(f"{aid}: exact evidence range spill {start}-{end}")

    serialized = json.dumps(result, ensure_ascii=False)
    for match in INLINE_LINE_REF_RE.finditer(serialized):
        path = match.group(1)
        start = int(match.group(2))
        end = int(match.group(3) or match.group(2))
        if path != assignment["document_path"]:
            errors.append(f"{aid}: inline evidence path spill {path}")
        if start > end or not in_ranges(start, end, allowed_ranges):
            errors.append(f"{aid}: inline evidence range spill {start}-{end}")


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--final", action="store_true", help="require all 211 assignments complete")
    args = parser.parse_args()

    runner_dir = Path(__file__).resolve().parents[1]
    audit_dir = runner_dir.parents[1]
    assignments_path = audit_dir / "assignments" / "runner-11.jsonl"
    registry_path = runner_dir / "fresh_agent_assignment_registry.jsonl"
    results_path = runner_dir / "result_manifest.jsonl"

    errors: list[str] = []
    assignments = load_jsonl(assignments_path)
    registry = load_jsonl(registry_path)
    result_manifest = load_jsonl(results_path)
    assignment_by_id = {row["assignment_id"]: row for row in assignments}

    if len(assignments) != 211 or len(assignment_by_id) != 211:
        errors.append("runner assignment packet must contain 211 unique assignments")
    for row in assignments:
        if row.get("audit_id") != AUDIT_ID or row.get("runner_id") != RUNNER_ID:
            errors.append(f"{row.get('assignment_id')}: wrong audit or runner")
        if row.get("required_model") != EXPECTED_MODEL or row.get("required_reasoning_effort") != EXPECTED_EFFORT:
            errors.append(f"{row.get('assignment_id')}: wrong required model or effort")
        if row.get("prior_substantive_assignment_count") != 0:
            errors.append(f"{row.get('assignment_id')}: nonzero prior assignment count")
        if row.get("terminal_after_result") is not True or row.get("followup_reuse_forbidden") is not True:
            errors.append(f"{row.get('assignment_id')}: terminal/no-reuse invariant missing")

    instance_counts = Counter(row.get("agent_instance_id") for row in registry)
    path_counts = Counter(row.get("agent_path") for row in registry)
    thread_counts = Counter(row.get("agent_thread_id") for row in registry if row.get("agent_thread_id"))
    for label, counts in (("agent_instance_id", instance_counts), ("agent_path", path_counts), ("agent_thread_id", thread_counts)):
        for identity, count in counts.items():
            if not identity or count != 1:
                errors.append(f"duplicate or missing {label}: {identity!r} count={count}")

    identity_assignments: dict[tuple, set[str]] = defaultdict(set)
    for row in registry:
        aid = row.get("assignment_id")
        assignment = assignment_by_id.get(aid)
        if assignment is None:
            errors.append(f"registry has unknown assignment {aid}")
            continue
        identity_assignments[(row.get("agent_instance_id"), row.get("agent_path"), row.get("agent_thread_id"))].add(aid)
        if row.get("model") != EXPECTED_MODEL or row.get("reasoning_effort") != EXPECTED_EFFORT:
            errors.append(f"{aid}: dispatched wrong model or effort")
        if row.get("prior_substantive_assignment_count") != 0:
            errors.append(f"{aid}: registry prior count is not zero")
        if row.get("terminal_after_result") is not True or row.get("no_followup_reuse") is not True:
            errors.append(f"{aid}: registry terminal/no-followup invariant missing")
        for key in ("runner_id", "role", "window_id", "doc_id", "document_path", "source_sha256", "capsule_ref", "capsule_sha256", "capsule_bytes"):
            expected = RUNNER_ID if key == "runner_id" else assignment.get(key)
            if row.get(key) != expected:
                errors.append(f"{aid}: registry mismatch for {key}")
    for identity, aids in identity_assignments.items():
        if len(aids) != 1:
            errors.append(f"identity assigned to multiple scopes: {identity!r} -> {sorted(aids)}")

    valid_by_assignment: dict[str, list[dict]] = defaultdict(list)
    for row in result_manifest:
        aid = row.get("assignment_id")
        assignment = assignment_by_id.get(aid)
        if assignment is None:
            errors.append(f"result manifest has unknown assignment {aid}")
            continue
        result_ref = row.get("result_ref")
        if not isinstance(result_ref, str):
            errors.append(f"{aid}: missing result_ref")
            continue
        result_path = Path.cwd() / result_ref
        if not result_path.is_file():
            errors.append(f"{aid}: result file missing {result_ref}")
            continue
        actual_hash = sha256(result_path)
        if row.get("result_sha256") != actual_hash:
            errors.append(f"{aid}: result hash mismatch")
        try:
            result = json.loads(result_path.read_text(encoding="utf-8"))
        except Exception as exc:
            errors.append(f"{aid}: malformed result JSON: {exc}")
            continue
        if row.get("valid_coverage") is True:
            capsule_path = Path.cwd() / assignment["capsule_ref"]
            capsule = json.loads(capsule_path.read_text(encoding="utf-8"))
            validate_result(result, assignment, capsule, errors)
            valid_by_assignment[aid].append(row)
        elif result.get("assignment_id") != aid:
            errors.append(f"{aid}: failed-attempt result assignment_id mismatch")

    for aid, rows in valid_by_assignment.items():
        if len(rows) != 1:
            errors.append(f"{aid}: valid result count is {len(rows)}, expected 1")
    if args.final:
        missing = sorted(set(assignment_by_id) - set(valid_by_assignment))
        if missing:
            errors.append(f"missing valid results for {len(missing)} assignments")
        if len(valid_by_assignment) != 211:
            errors.append(f"valid assignment count is {len(valid_by_assignment)}, expected 211")
        for row in registry:
            if not row.get("agent_thread_id"):
                errors.append(f"{row.get('assignment_id')}: completed attempt lacks agent_thread_id")

    report = {
        "audit_id": AUDIT_ID,
        "runner_id": RUNNER_ID,
        "mode": "final" if args.final else "incremental",
        "assignment_count": len(assignments),
        "attempt_count": len(registry),
        "result_manifest_count": len(result_manifest),
        "valid_assignment_count": len(valid_by_assignment),
        "duplicate_agent_instance_count": sum(1 for count in instance_counts.values() if count != 1),
        "duplicate_agent_path_count": sum(1 for count in path_counts.values() if count != 1),
        "duplicate_agent_thread_count": sum(1 for count in thread_counts.values() if count != 1),
        "multi_scope_identity_count": sum(1 for aids in identity_assignments.values() if len(aids) != 1),
        "errors": errors,
        "status": "pass" if not errors else "fail",
    }
    print(json.dumps(report, indent=2, sort_keys=True))
    return 0 if not errors else 1


if __name__ == "__main__":
    sys.exit(main())
