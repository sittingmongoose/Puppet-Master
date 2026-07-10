#!/usr/bin/env python3
import argparse
import hashlib
import json
from pathlib import Path

AUDIT_ID = "audit-20260709-004-plan-assurance-horizontally-sharded-fresh-agent-blind-exhaustive"
AUDIT = Path("Plans/.audits") / AUDIT_ID
ASSIGNMENTS = AUDIT / "assignments/runner-06.jsonl"


def load_assignments():
    return {
        row["assignment_id"]: row
        for row in (json.loads(line) for line in ASSIGNMENTS.read_text().splitlines() if line.strip())
    }


def inside_authorized(start, end, ranges):
    return any(lo <= start <= end <= hi for lo, hi in ranges)


def validate_result(path, expected_id=None):
    errors = []
    try:
        raw = path.read_bytes()
        result = json.loads(raw)
    except Exception as exc:
        return {"passed": False, "errors": [f"json_parse:{exc}"]}

    assignments = load_assignments()
    assignment_id = result.get("assignment_id")
    if expected_id and assignment_id != expected_id:
        errors.append("assignment_id_argument_mismatch")
    row = assignments.get(assignment_id)
    if row is None:
        return {"passed": False, "errors": errors + ["assignment_id_not_allocated_to_runner"]}
    capsule = json.loads(Path(row["capsule_ref"]).read_text())
    ranges = [row["core_range"], *capsule.get("context_ranges", [])]
    document_bytes = Path(row["document_path"]).read_bytes()
    if hashlib.sha256(document_bytes).hexdigest() != row["source_sha256"]:
        errors.append("source_document_hash_mismatch")
    document_lines = document_bytes.decode().splitlines()

    expected = {
        "assignment_id": row["assignment_id"],
        "role": row["role"],
        "window_id": row["window_id"],
        "document_path": row["document_path"],
        "core_range": row["core_range"],
        "context_ranges": capsule.get("context_ranges", []),
        "source_sha256": row["source_sha256"],
        "capsule_sha256": row["capsule_sha256"],
    }
    for key, value in expected.items():
        if result.get(key) != value:
            errors.append(f"metadata_mismatch:{key}")

    list_keys = ("observations", "candidate_findings", "explicit_non_gaps", "unknowns", "exact_evidence_refs")
    for key in list_keys:
        if not isinstance(result.get(key), list):
            errors.append(f"not_array:{key}")

    evidence_groups = []
    for key in ("observations", "candidate_findings", "explicit_non_gaps"):
        for index, item in enumerate(result.get(key, []) if isinstance(result.get(key), list) else []):
            refs = item.get("evidence_refs") if isinstance(item, dict) else None
            if not isinstance(refs, list) or not refs:
                errors.append(f"missing_evidence:{key}:{index}")
            else:
                evidence_groups.extend((f"{key}:{index}", ref) for ref in refs)
            if key == "candidate_findings" and isinstance(item, dict):
                for required in ("finding_id", "severity", "category", "title", "claim", "why_it_matters", "missing_contract", "primary_scope"):
                    if not item.get(required):
                        errors.append(f"finding_field_missing:{index}:{required}")
                if item.get("severity") not in {"critical", "high", "medium", "low"}:
                    errors.append(f"finding_severity_invalid:{index}")
                if item.get("primary_scope") not in {"core", "context"}:
                    errors.append(f"finding_scope_invalid:{index}")

    exact_refs = result.get("exact_evidence_refs", []) if isinstance(result.get("exact_evidence_refs"), list) else []
    if not exact_refs:
        errors.append("exact_evidence_refs_empty")
    evidence_groups.extend(("exact_evidence_refs", ref) for ref in exact_refs)
    for label, ref in evidence_groups:
        if not isinstance(ref, dict):
            errors.append(f"evidence_not_object:{label}")
            continue
        if ref.get("path") != row["document_path"]:
            errors.append(f"evidence_path_mismatch:{label}")
        start, end = ref.get("line_start"), ref.get("line_end")
        if not isinstance(start, int) or not isinstance(end, int) or not inside_authorized(start, end, ranges):
            errors.append(f"evidence_range_invalid:{label}:{start}:{end}")
        if not isinstance(ref.get("excerpt"), str) or not ref["excerpt"].strip():
            errors.append(f"evidence_excerpt_empty:{label}")
        elif isinstance(start, int) and isinstance(end, int) and inside_authorized(start, end, ranges):
            cited_source = "\n".join(document_lines[start - 1:end])
            if ref["excerpt"] not in cited_source:
                errors.append(f"evidence_excerpt_not_exact:{label}:{start}:{end}")

    att = result.get("scope_attestation")
    required_att = {
        "only_allowed_inputs_read": True,
        "prior_audits_read": False,
        "other_results_read": False,
        "canonical_document_read": False,
        "model": "gpt-5.6-sol",
        "reasoning_effort": "ultra",
        "prior_substantive_assignment_count": 0,
        "terminal_after_result": True,
    }
    if not isinstance(att, dict):
        errors.append("scope_attestation_missing")
    else:
        for key, value in required_att.items():
            if att.get(key) != value:
                errors.append(f"scope_attestation_mismatch:{key}")

    return {
        "passed": not errors,
        "assignment_id": assignment_id,
        "result_sha256": hashlib.sha256(raw).hexdigest(),
        "result_bytes": len(raw),
        "observation_count": len(result.get("observations", [])) if isinstance(result.get("observations"), list) else 0,
        "candidate_finding_count": len(result.get("candidate_findings", [])) if isinstance(result.get("candidate_findings"), list) else 0,
        "explicit_non_gap_count": len(result.get("explicit_non_gaps", [])) if isinstance(result.get("explicit_non_gaps"), list) else 0,
        "unknown_count": len(result.get("unknowns", [])) if isinstance(result.get("unknowns"), list) else 0,
        "exact_evidence_ref_count": len(exact_refs),
        "errors": errors,
    }


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("result", type=Path)
    parser.add_argument("--assignment-id")
    args = parser.parse_args()
    report = validate_result(args.result, args.assignment_id)
    print(json.dumps(report, indent=2, sort_keys=True))
    raise SystemExit(0 if report["passed"] else 1)


if __name__ == "__main__":
    main()
