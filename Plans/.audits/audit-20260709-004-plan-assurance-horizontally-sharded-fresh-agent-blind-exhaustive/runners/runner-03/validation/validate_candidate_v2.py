#!/usr/bin/env python3
import argparse
import hashlib
import json
from pathlib import Path


HERE = Path(__file__).resolve()
RUNNER_DIR = HERE.parents[1]
AUDIT_DIR = HERE.parents[3]
REPO_DIR = AUDIT_DIR.parents[2]
REQUIRED_ARRAYS = (
    "observations",
    "candidate_findings",
    "explicit_non_gaps",
    "unknowns",
    "exact_evidence_refs",
)


def load_jsonl(path):
    return [json.loads(line) for line in path.read_text(encoding="utf-8").splitlines() if line.strip()]


def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def normalized(value):
    return " ".join(value.split())


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("assignment_id")
    parser.add_argument("attempt_id")
    parser.add_argument("raw_result")
    args = parser.parse_args()
    errors = []
    assignments = {row["assignment_id"]: row for row in load_jsonl(AUDIT_DIR / "assignments" / "runner-03.jsonl")}
    assignment = assignments.get(args.assignment_id)
    if assignment is None:
        raise SystemExit("unknown assignment")
    dispatches = [
        row for row in load_jsonl(RUNNER_DIR / "fresh_agent_assignment_registry.jsonl")
        if row.get("assignment_id") == args.assignment_id and row.get("attempt_id") == args.attempt_id
    ]
    if len(dispatches) != 1:
        errors.append(f"expected one immutable prelaunch dispatch, found {len(dispatches)}")
        dispatch = dispatches[-1] if dispatches else {}
    else:
        dispatch = dispatches[0]
    raw_path = Path(args.raw_result)
    raw = json.loads(raw_path.read_text(encoding="utf-8"))
    capsule_path = REPO_DIR / assignment["capsule_ref"]
    capsule = json.loads(capsule_path.read_text(encoding="utf-8"))
    source_path = REPO_DIR / assignment["document_path"]
    source_lines = source_path.read_text(encoding="utf-8").splitlines()

    expected_fields = {
        "assignment_id": args.assignment_id,
        "attempt_id": args.attempt_id,
        "agent_instance_id": dispatch.get("agent_instance_id"),
        "agent_path": dispatch.get("agent_path"),
        "agent_thread_id": dispatch.get("agent_thread_id"),
        "status": "valid_result",
        "role": assignment["role"],
        "window_id": assignment["window_id"],
        "doc_id": assignment["doc_id"],
        "document_path": assignment["document_path"],
        "core_range": assignment["core_range"],
        "terminal_after_result": True,
    }
    for field, expected in expected_fields.items():
        if raw.get(field) != expected:
            errors.append(f"{field} mismatch")
    for field in REQUIRED_ARRAYS:
        if not isinstance(raw.get(field), list):
            errors.append(f"{field} must be an array")
    if digest(capsule_path) != assignment["capsule_sha256"] or capsule_path.stat().st_size != assignment["capsule_bytes"]:
        errors.append("capsule metadata hash or size mismatch")
    excerpt_path = REPO_DIR / assignment["source_excerpt_ref"]
    if digest(excerpt_path) != assignment["source_excerpt_sha256"] or excerpt_path.stat().st_size != assignment["source_excerpt_bytes"]:
        errors.append("source excerpt hash or size mismatch")
    if digest(source_path) != assignment["source_sha256"]:
        errors.append("canonical source hash mismatch")
    expected_capsule_validation = {
        "metadata_sha256": assignment["capsule_sha256"],
        "metadata_bytes": assignment["capsule_bytes"],
        "source_excerpt_sha256": assignment["source_excerpt_sha256"],
        "source_excerpt_bytes": assignment["source_excerpt_bytes"],
    }
    if raw.get("capsule_validation") != expected_capsule_validation:
        errors.append("capsule_validation mismatch")

    ranges = [assignment["core_range"], *capsule.get("context_ranges", [])]
    refs = []
    exact_refs = raw.get("exact_evidence_refs", [])
    if isinstance(exact_refs, list):
        refs.extend(("exact_evidence_refs", i, ref) for i, ref in enumerate(exact_refs))
    for field in ("observations", "candidate_findings", "explicit_non_gaps", "unknowns"):
        values = raw.get(field, [])
        if not isinstance(values, list):
            continue
        for item_index, item in enumerate(values):
            if not isinstance(item, dict) or not isinstance(item.get("evidence_refs"), list) or not item["evidence_refs"]:
                errors.append(f"{field}[{item_index}] lacks evidence_refs")
                continue
            refs.extend((f"{field}[{item_index}]", ref_index, ref) for ref_index, ref in enumerate(item["evidence_refs"]))
    for owner, index, ref in refs:
        label = f"{owner}.evidence_refs[{index}]" if owner != "exact_evidence_refs" else f"exact_evidence_refs[{index}]"
        if not isinstance(ref, dict):
            errors.append(f"{label} is not an object")
            continue
        if ref.get("path") != assignment["document_path"]:
            errors.append(f"{label} path mismatch")
        start, end, quote = ref.get("line_start"), ref.get("line_end"), ref.get("quote")
        if not isinstance(start, int) or not isinstance(end, int) or start > end:
            errors.append(f"{label} range invalid")
            continue
        if not any(low <= start and end <= high for low, high in ranges):
            errors.append(f"{label} outside one assigned range")
        if start < 1 or end > len(source_lines):
            errors.append(f"{label} outside canonical source")
            continue
        if not isinstance(quote, str) or not quote.strip():
            errors.append(f"{label} quote missing")
        elif normalized(quote) not in normalized("\n".join(source_lines[start - 1:end])):
            errors.append(f"{label} quote mismatch")
    if raw.get("candidate_findings") and not raw.get("exact_evidence_refs"):
        errors.append("candidate findings lack exact_evidence_refs")
    report = {
        "assignment_id": args.assignment_id,
        "attempt_id": args.attempt_id,
        "status": "pass" if not errors else "fail",
        "validation_passed": not errors,
        "result_ref": str(raw_path),
        "result_sha256": digest(raw_path),
        "result_bytes": raw_path.stat().st_size,
        "evidence_reference_count": len(refs),
        "errors": errors,
    }
    print(json.dumps(report, indent=2, sort_keys=True))
    raise SystemExit(0 if not errors else 1)


if __name__ == "__main__":
    main()
