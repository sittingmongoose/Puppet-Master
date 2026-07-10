#!/usr/bin/env python3
"""Render one mechanically fixed, blind reviewer prompt from immutable metadata."""

import argparse
import hashlib
import json
from pathlib import Path


AUDIT_ID = "audit-20260709-004-plan-assurance-horizontally-sharded-fresh-agent-blind-exhaustive"
AUDIT = Path("Plans/.audits") / AUDIT_ID
ASSIGNMENTS = AUDIT / "assignments/runner-06.jsonl"


def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--assignment-id", required=True)
    args = parser.parse_args()

    rows = [
        json.loads(line)
        for line in ASSIGNMENTS.read_text().splitlines()
        if line.strip()
    ]
    matches = [row for row in rows if row["assignment_id"] == args.assignment_id]
    if len(matches) != 1:
        raise SystemExit(f"expected exactly one runner assignment, found {len(matches)}")
    row = matches[0]
    capsule_path = Path(row["capsule_ref"])
    capsule = json.loads(capsule_path.read_text())
    excerpt_path = Path(capsule["source_excerpt_ref"])

    checks = {
        "capsule_sha256": (sha256(capsule_path), row["capsule_sha256"]),
        "capsule_bytes": (capsule_path.stat().st_size, row["capsule_bytes"]),
        "source_excerpt_sha256": (
            sha256(excerpt_path),
            capsule["source_excerpt_sha256"],
        ),
        "source_excerpt_bytes": (
            excerpt_path.stat().st_size,
            capsule["source_excerpt_bytes"],
        ),
    }
    failures = [name for name, values in checks.items() if values[0] != values[1]]
    if failures:
        raise SystemExit("immutable capsule validation failed: " + ", ".join(failures))

    document_path = row["document_path"]
    prompt = f"""You are one fresh, terminal, read-only reviewer for exactly one immutable audit assignment. Your native configuration must be gpt-5.6-sol with reasoning_effort=ultra. Perform no other substantive assignment and do not delegate.

ASSIGNMENT
assignment_id: {row['assignment_id']}
runner_id: runner-06
role: {row['role']}
window_id: {row['window_id']}
doc_id: {row['doc_id']}
canonical document_path: {document_path}
core_range: {json.dumps(row['core_range'], separators=(',', ':'))}
context_ranges: {json.dumps(capsule['context_ranges'], separators=(',', ':'))}
source_sha256: {row['source_sha256']}
capsule_ref: {row['capsule_ref']}
capsule_sha256: {row['capsule_sha256']}
capsule_bytes: {row['capsule_bytes']}
source_excerpt_ref: {capsule['source_excerpt_ref']}
source_excerpt_sha256: {capsule['source_excerpt_sha256']}
source_excerpt_bytes: {capsule['source_excerpt_bytes']}
capsule_package_bytes: {row['capsule_package_bytes']}

ALLOWED INPUTS ONLY
Read only the capsule_ref and source_excerpt_ref above. You may hash/stat those two files. Do not read the canonical document itself, any other window or capsule, any result, any prior audit, or any unrelated file. Do not write files or mutate the repository.

ROLE CARD
{capsule['role_instructions']}

EVIDENCE RULES
Use canonical source line numbers encoded for the excerpt, never the physical line number of the excerpt file and never capsule/header line numbers. Each `<<< SECTION START-END >>>` marker is metadata, not a canonical source line. The first physical content line immediately after that marker is canonical START; each following physical content line, including blank lines, advances the canonical line by exactly one through END. A separator blank after END is not part of the section. Build and check this mapping mechanically before selecting evidence. Every cited range must lie wholly within the assigned core or context ranges. Every quote must be a contiguous, character-for-character substring of the canonical text on canonical line_start..line_end. Do not use ellipses, paraphrases, normalized punctuation, or invented whitespace in a quote. Recheck every quote and line range against the excerpt before returning.

Return exactly one JSON object and nothing else. Required top-level fields:
assignment_id, runner_id, role, window_id, doc_id, document_path, core_range, context_ranges, source_sha256, capsule_ref, capsule_sha256, capsule_bytes, source_excerpt_ref, source_excerpt_sha256, source_excerpt_bytes, capsule_package_bytes, observations, candidate_findings, explicit_non_gaps, unknowns, exact_evidence_refs, scope_attestation.

observations, candidate_findings, explicit_non_gaps, unknowns, exact_evidence_refs must all be JSON arrays. Each observation, finding, and non-gap that cites evidence must use evidence_refs as an array of FULL evidence objects, never strings, IDs, or JSON pointers. Every evidence object in every array must carry all six fields: {{"document_path":"{document_path}","path":"{document_path}","line_start":<int>,"line_end":<int>,"quote":"<exact contiguous quote>","excerpt":"<same exact contiguous quote>"}}. Include every such evidence object (deduplicated is fine) in top-level exact_evidence_refs. candidate_findings should use fields finding_id, severity, category, title, claim, why_it_matters, missing_contract, primary_scope, evidence_refs. `primary_scope` must be exactly the enum string `core` or `context`, never a prose scope description. unknowns should use question and reason. Empty arrays are permitted only when genuinely supported.

scope_attestation must be exactly compatible with: {{"only_allowed_inputs_read":true,"prior_audits_read":false,"other_results_read":false,"canonical_document_read":false,"model":"gpt-5.6-sol","reasoning_effort":"ultra","prior_substantive_assignment_count":0,"terminal_after_result":true}}.

After submitting the single JSON result, you are terminal. Do not accept or perform follow-up work."""
    print(prompt)


if __name__ == "__main__":
    main()
