#!/usr/bin/env python3
import argparse
import json
from pathlib import Path

AUDIT_ROOT = Path(__file__).resolve().parents[3]
REPO_ROOT = AUDIT_ROOT.parents[2]
PACKET = AUDIT_ROOT / "assignments" / "runner-09.jsonl"
REQUIRED_ARRAYS = ("observations", "candidate_findings", "explicit_non_gaps", "unknowns", "exact_evidence_refs")

def normalized(value: str) -> str:
    return " ".join(value.split())

parser = argparse.ArgumentParser()
parser.add_argument("result_path", type=Path)
parser.add_argument("assignment_id")
args = parser.parse_args()
assignments = {row["assignment_id"]: row for row in (json.loads(line) for line in PACKET.read_text().splitlines() if line.strip())}
assignment = assignments[args.assignment_id]
capsule = json.loads((REPO_ROOT / assignment["capsule_ref"]).read_text())
raw = json.loads(args.result_path.read_text())
issues = []

for field in ("assignment_id", "runner_id", "role", "role_key", "window_id", "doc_id", "document_path", "core_range", "source_sha256", "capsule_ref", "capsule_sha256", "source_excerpt_ref", "source_excerpt_sha256"):
    if raw.get(field) != assignment.get(field):
        issues.append(f"{field} mismatch")
if raw.get("context_ranges") != capsule.get("context_ranges", []):
    issues.append("context_ranges mismatch")
for field in REQUIRED_ARRAYS:
    if not isinstance(raw.get(field), list):
        issues.append(f"{field} must be an array")
att = raw.get("agent_attestation", {})
if att.get("model") != "gpt-5.6-sol": issues.append("wrong model attestation")
if att.get("reasoning_effort") != "ultra": issues.append("wrong reasoning effort attestation")
if att.get("prior_substantive_assignment_count") != 0: issues.append("prior assignment count must be zero")
if att.get("terminal_after_result") is not True: issues.append("terminal attestation missing")
if att.get("no_followup_reuse") is not True: issues.append("no-followup attestation missing")
scope = raw.get("scope_attestation", {})
required_scope = {"files_read", "read_only", "prior_audits_read", "other_results_read", "unrelated_windows_read", "external_research_used", "within_capsule_only"}
if not required_scope <= set(scope): issues.append("scope_attestation keys missing")
if scope.get("read_only") is not True or scope.get("within_capsule_only") is not True: issues.append("scope positive attestations invalid")
for field in ("prior_audits_read", "other_results_read", "unrelated_windows_read", "external_research_used"):
    if scope.get(field) is not False: issues.append(f"{field} must be false")
expected_files = {assignment["capsule_ref"], assignment["source_excerpt_ref"], assignment["document_path"]}
if set(scope.get("files_read", [])) != expected_files: issues.append("files_read mismatch")

source_lines = (REPO_ROOT / assignment["document_path"]).read_text().splitlines()
allowed = [assignment["core_range"], *capsule.get("context_ranges", [])]
evidence = {}
for index, ref in enumerate(raw.get("exact_evidence_refs", [])):
    if not isinstance(ref, dict):
        issues.append(f"evidence[{index}] not object"); continue
    eid = ref.get("evidence_id")
    if not isinstance(eid, str) or not eid or eid in evidence: issues.append(f"evidence[{index}] invalid id")
    start, end = ref.get("line_start"), ref.get("line_end")
    if ref.get("path") != assignment["document_path"]: issues.append(f"evidence[{index}] path mismatch")
    if not isinstance(start, int) or not isinstance(end, int) or start > end:
        issues.append(f"evidence[{index}] invalid range"); continue
    if not any(start >= low and end <= high for low, high in allowed): issues.append(f"evidence[{index}] outside assigned range")
    if start < 1 or end > len(source_lines): issues.append(f"evidence[{index}] outside canonical source"); continue
    quote = ref.get("quote")
    if not isinstance(quote, str) or not quote.strip():
        issues.append(f"evidence[{index}] quote missing")
    elif normalized(quote) not in normalized("\n".join(source_lines[start-1:end])):
        issues.append(f"evidence[{index}] exact quote mismatch")
    evidence[eid] = ref

def validate_claims(name, require_evidence):
    for index, claim in enumerate(raw.get(name, [])):
        if not isinstance(claim, dict): issues.append(f"{name}[{index}] not object"); continue
        if not isinstance(claim.get("id"), str) or not claim.get("id"): issues.append(f"{name}[{index}] id missing")
        if not isinstance(claim.get("statement"), str) or not claim.get("statement", "").strip(): issues.append(f"{name}[{index}] statement missing")
        refs = claim.get("evidence_ids")
        if not isinstance(refs, list): issues.append(f"{name}[{index}] evidence_ids invalid"); continue
        if require_evidence and not refs: issues.append(f"{name}[{index}] evidence required")
        if any(ref not in evidence for ref in refs): issues.append(f"{name}[{index}] unknown evidence id")

validate_claims("observations", True)
validate_claims("candidate_findings", True)
validate_claims("explicit_non_gaps", True)
validate_claims("unknowns", False)
core_start, core_end = assignment["core_range"]
for index, finding in enumerate(raw.get("candidate_findings", [])):
    refs = [evidence.get(ref) for ref in finding.get("evidence_ids", [])]
    if not any(ref and not (ref["line_end"] < core_start or ref["line_start"] > core_end) for ref in refs):
        issues.append(f"candidate_findings[{index}] lacks core evidence")

print(json.dumps({"assignment_id": args.assignment_id, "validation_passed": not issues, "issues": issues, "counts": {field: len(raw.get(field, [])) if isinstance(raw.get(field), list) else None for field in REQUIRED_ARRAYS}}, sort_keys=True))
raise SystemExit(0 if not issues else 1)
