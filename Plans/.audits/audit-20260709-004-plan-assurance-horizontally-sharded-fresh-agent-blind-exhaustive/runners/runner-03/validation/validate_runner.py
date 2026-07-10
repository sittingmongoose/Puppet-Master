#!/usr/bin/env python3
import argparse
import hashlib
import json
from pathlib import Path


HERE = Path(__file__).resolve()
RUNNER_DIR = HERE.parents[1]
AUDIT_DIR = HERE.parents[3]
ASSIGNMENTS_PATH = AUDIT_DIR / "assignments" / "runner-03.jsonl"
REGISTRY_PATH = RUNNER_DIR / "fresh_agent_assignment_registry.jsonl"
RESULT_MANIFEST_PATH = RUNNER_DIR / "result_manifest.jsonl"


def read_jsonl(path: Path):
    if not path.exists():
        return []
    rows = []
    for line_no, raw in enumerate(path.read_text(encoding="utf-8").splitlines(), 1):
        if not raw.strip():
            continue
        try:
            rows.append(json.loads(raw))
        except json.JSONDecodeError as exc:
            raise ValueError(f"{path}:{line_no}: invalid JSON: {exc}") from exc
    return rows


def sha256(path: Path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def evidence_refs(result):
    yield from result.get("exact_evidence_refs", [])
    for field in ("observations", "candidate_findings", "explicit_non_gaps", "unknowns"):
        for item in result.get(field, []):
            yield from item.get("evidence_refs", [])


def validate_result(result, assignment, errors):
    expected = {
        "assignment_id": assignment["assignment_id"],
        "role": assignment["role"],
        "window_id": assignment["window_id"],
        "doc_id": assignment["doc_id"],
        "document_path": assignment["document_path"],
        "core_range": assignment["core_range"],
        "terminal_after_result": True,
    }
    for field, value in expected.items():
        if result.get(field) != value:
            errors.append(f"{assignment['assignment_id']}: result {field} mismatch")
    if result.get("status") != "valid_result":
        errors.append(f"{assignment['assignment_id']}: status is not valid_result")
    for field in ("observations", "candidate_findings", "explicit_non_gaps", "unknowns", "exact_evidence_refs"):
        if not isinstance(result.get(field), list):
            errors.append(f"{assignment['assignment_id']}: {field} is not an array")
    capsule_validation = result.get("capsule_validation", {})
    expected_capsule = {
        "metadata_sha256": assignment["capsule_sha256"],
        "metadata_bytes": assignment["capsule_bytes"],
        "source_excerpt_sha256": assignment["source_excerpt_sha256"],
        "source_excerpt_bytes": assignment["source_excerpt_bytes"],
    }
    if capsule_validation != expected_capsule:
        errors.append(f"{assignment['assignment_id']}: capsule_validation mismatch")
    allowed_ranges = sorted([assignment["core_range"]] + assignment.get("overlap_ranges", []))
    merged_ranges = []
    for lo, hi in allowed_ranges:
        if merged_ranges and lo <= merged_ranges[-1][1] + 1:
            merged_ranges[-1][1] = max(merged_ranges[-1][1], hi)
        else:
            merged_ranges.append([lo, hi])
    for ref in evidence_refs(result):
        if not isinstance(ref, dict):
            errors.append(f"{assignment['assignment_id']}: non-object evidence ref")
            continue
        if ref.get("path") != assignment["document_path"]:
            errors.append(f"{assignment['assignment_id']}: evidence path spill")
            continue
        start, end = ref.get("line_start"), ref.get("line_end")
        if not isinstance(start, int) or not isinstance(end, int) or start > end:
            errors.append(f"{assignment['assignment_id']}: malformed evidence range")
            continue
        if not any(lo <= start and end <= hi for lo, hi in merged_ranges):
            errors.append(f"{assignment['assignment_id']}: evidence range {start}-{end} outside capsule")
    for field in ("observations", "candidate_findings", "explicit_non_gaps", "unknowns"):
        for index, item in enumerate(result.get(field, []), 1):
            if not isinstance(item, dict) or not item.get("evidence_refs"):
                errors.append(f"{assignment['assignment_id']}: {field}[{index}] lacks exact evidence")


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--final", action="store_true")
    args = parser.parse_args()
    errors = []
    assignments = read_jsonl(ASSIGNMENTS_PATH)
    assignment_by_id = {row["assignment_id"]: row for row in assignments}
    registry = read_jsonl(REGISTRY_PATH)
    result_manifest = read_jsonl(RESULT_MANIFEST_PATH)

    for field in ("attempt_id", "agent_instance_id", "agent_path"):
        values = [row.get(field) for row in registry]
        if len(values) != len(set(values)):
            errors.append(f"duplicate registry {field}")
    agent_assignment_pairs = {(row.get("agent_instance_id"), row.get("assignment_id")) for row in registry}
    if len(agent_assignment_pairs) != len(registry):
        errors.append("one agent identity appears on multiple registry rows")
    for row in registry:
        assignment = assignment_by_id.get(row.get("assignment_id"))
        if assignment is None:
            errors.append(f"unknown registry assignment {row.get('assignment_id')}")
            continue
        if row.get("model") != assignment["required_model"] or row.get("reasoning_effort") != assignment["required_reasoning_effort"]:
            errors.append(f"{assignment['assignment_id']}: model or effort mismatch")
        if row.get("prior_substantive_assignment_count") != 0:
            errors.append(f"{assignment['assignment_id']}: prior assignment count is not zero")
        if row.get("terminal_after_result") is not True or row.get("no_followup_reuse") is not True:
            errors.append(f"{assignment['assignment_id']}: terminal or reuse invariant mismatch")
        if row.get("attempt_state") in ("valid", "failed") and not row.get("agent_thread_id"):
            errors.append(f"{assignment['assignment_id']}: completed attempt lacks agent_thread_id")

    valid_ids = []
    for entry in result_manifest:
        assignment_id = entry.get("assignment_id")
        assignment = assignment_by_id.get(assignment_id)
        if assignment is None:
            errors.append(f"unknown result assignment {assignment_id}")
            continue
        raw_ref = entry.get("result_ref")
        raw_path = AUDIT_DIR / raw_ref if raw_ref else None
        if raw_path is None or not raw_path.is_file():
            errors.append(f"{assignment_id}: missing raw result")
            continue
        if sha256(raw_path) != entry.get("result_sha256"):
            errors.append(f"{assignment_id}: raw result hash mismatch")
            continue
        try:
            result = json.loads(raw_path.read_text(encoding="utf-8"))
        except json.JSONDecodeError as exc:
            errors.append(f"{assignment_id}: invalid result JSON: {exc}")
            continue
        enriched = dict(assignment)
        enriched["overlap_ranges"] = entry.get("overlap_ranges", [])
        validate_result(result, enriched, errors)
        valid_ids.append(assignment_id)

    if len(valid_ids) != len(set(valid_ids)):
        errors.append("multiple counted results for one assignment")
    if args.final and set(valid_ids) != set(assignment_by_id):
        errors.append("final coverage is incomplete")
    report = {
        "status": "pass" if not errors else "fail",
        "mode": "final" if args.final else "partial",
        "assignment_count": len(assignments),
        "registry_attempt_count": len(registry),
        "valid_result_count": len(valid_ids),
        "failed_attempt_count": sum(row.get("attempt_state") == "failed" for row in registry),
        "unique_agent_instance_count": len({row.get("agent_instance_id") for row in registry}),
        "duplicate_or_recycled_agent_count": 0 if len(registry) == len({row.get("agent_instance_id") for row in registry}) else 1,
        "multi_scope_agent_count": 0 if len(agent_assignment_pairs) == len(registry) else 1,
        "errors": errors,
    }
    print(json.dumps(report, indent=2, sort_keys=True))
    raise SystemExit(0 if not errors else 1)


if __name__ == "__main__":
    main()
