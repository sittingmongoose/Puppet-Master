#!/usr/bin/env python3
import argparse
import json
from pathlib import Path

AUDIT_ROOT = Path(__file__).resolve().parents[3]
REPO_ROOT = AUDIT_ROOT.parents[2]
PACKET = AUDIT_ROOT / "assignments" / "runner-09.jsonl"

parser = argparse.ArgumentParser()
parser.add_argument("result_path", type=Path)
parser.add_argument("assignment_id")
args = parser.parse_args()
assignments = {row["assignment_id"]: row for row in (json.loads(line) for line in PACKET.read_text().splitlines() if line.strip())}
assignment = assignments[args.assignment_id]
result = json.loads(args.result_path.read_text())
capsule_path = REPO_ROOT / assignment["capsule_ref"]
capsule = json.loads(capsule_path.read_text())

required_keys = {
    "schema_version", "assignment_id", "runner_id", "agent_attestation", "role", "role_key",
    "window_id", "doc_id", "document_path", "core_range", "context_ranges", "source_sha256",
    "capsule_ref", "capsule_sha256", "source_excerpt_ref", "source_excerpt_sha256", "observations",
    "candidate_findings", "explicit_non_gaps", "unknowns", "exact_evidence_refs", "scope_attestation",
}
assert required_keys <= result.keys()
assert result["schema_version"] == "1.0"
for key in ("assignment_id", "runner_id", "role", "role_key", "window_id", "doc_id", "document_path", "core_range", "source_sha256", "capsule_ref", "capsule_sha256", "source_excerpt_ref", "source_excerpt_sha256"):
    assert result[key] == assignment[key], key
assert result["context_ranges"] == capsule["context_ranges"]
attestation = result["agent_attestation"]
assert attestation["model"] == "gpt-5.6-sol"
assert attestation["reasoning_effort"] == "ultra"
assert attestation["prior_substantive_assignment_count"] == 0
assert attestation["terminal_after_result"] is True
assert attestation["no_followup_reuse"] is True
scope = result["scope_attestation"]
assert set(scope["files_read"]) == {assignment["capsule_ref"], assignment["source_excerpt_ref"]}
assert len(scope["files_read"]) == 2
for key in ("read_only", "within_capsule_only"):
    assert scope[key] is True
for key in ("prior_audits_read", "other_results_read", "unrelated_windows_read", "external_research_used"):
    assert scope[key] is False
for key in ("observations", "candidate_findings", "explicit_non_gaps", "unknowns", "exact_evidence_refs"):
    assert isinstance(result[key], list), key

allowed_ranges = [tuple(assignment["core_range"])] + [tuple(pair) for pair in capsule["context_ranges"]]
core_start, core_end = assignment["core_range"]
evidence = {}
for item in result["exact_evidence_refs"]:
    assert set(("evidence_id", "path", "line_start", "line_end", "quote")) <= item.keys()
    evidence_id = item["evidence_id"]
    assert isinstance(evidence_id, str) and evidence_id and evidence_id not in evidence
    assert item["path"] == assignment["document_path"]
    start, end = item["line_start"], item["line_end"]
    assert isinstance(start, int) and isinstance(end, int) and start <= end
    assert any(start >= low and end <= high for low, high in allowed_ranges), (evidence_id, start, end)
    assert isinstance(item["quote"], str) and item["quote"].strip()
    evidence[evidence_id] = item

def validate_claims(items, require_evidence):
    seen = set()
    for item in items:
        assert isinstance(item, dict)
        local_id = item.get("id")
        assert isinstance(local_id, str) and local_id and local_id not in seen
        seen.add(local_id)
        assert isinstance(item.get("statement"), str) and item["statement"].strip()
        refs = item.get("evidence_ids")
        assert isinstance(refs, list)
        if require_evidence:
            assert refs
        assert len(refs) == len(set(refs))
        assert all(ref in evidence for ref in refs)
    return seen

validate_claims(result["observations"], True)
validate_claims(result["explicit_non_gaps"], True)
validate_claims(result["unknowns"], False)
finding_ids = validate_claims(result["candidate_findings"], True)
for finding in result["candidate_findings"]:
    assert any(not (evidence[ref]["line_end"] < core_start or evidence[ref]["line_start"] > core_end) for ref in finding["evidence_ids"])

print(json.dumps({
    "assignment_id": assignment["assignment_id"],
    "validation_passed": True,
    "observation_count": len(result["observations"]),
    "candidate_finding_count": len(result["candidate_findings"]),
    "explicit_non_gap_count": len(result["explicit_non_gaps"]),
    "unknown_count": len(result["unknowns"]),
    "exact_evidence_ref_count": len(result["exact_evidence_refs"]),
}, sort_keys=True))
