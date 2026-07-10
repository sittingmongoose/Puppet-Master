#!/usr/bin/env python3
"""Mechanical validator for runner-07 document-window result payloads.

This validator performs schema, identity, range, reference, and exact-excerpt
checks only. It does not accept, reject, rank, summarize, or adjudicate semantic
findings.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import pathlib
import re
import sys
from typing import Any


AUDIT_ID = "audit-20260709-004-plan-assurance-horizontally-sharded-fresh-agent-blind-exhaustive"
RUNNER_ID = "runner-07"
SCHEMA_VERSION = "audit004.document_window_result.v2"
ROLE = "contract_capability_exact_behavior"
ROLE_KEY = "exact"
REQUIRED_MODEL = "gpt-5.6-sol"
REQUIRED_EFFORT = "ultra"

REQUIRED_TOP = {
    "schema_version",
    "assignment_id",
    "assignment_attempt_number",
    "attempt_id",
    "runner_id",
    "agent_name",
    "model",
    "reasoning_effort",
    "role",
    "role_key",
    "window_id",
    "doc_id",
    "document_path",
    "core_range",
    "context_ranges",
    "source_sha256",
    "core_sha256",
    "capsule_ref",
    "capsule_sha256",
    "capsule_bytes",
    "source_excerpt_ref",
    "source_excerpt_sha256",
    "source_excerpt_bytes",
    "prior_substantive_assignment_count",
    "terminal_after_result",
    "no_followup_reuse",
    "observations",
    "candidate_findings",
    "explicit_non_gaps",
    "unknowns",
    "exact_evidence_refs",
    "scope_attestation",
    "result_status",
}

EXPECTED_ATTESTATION = {
    "read_only_named_capsule_and_excerpt": True,
    "no_prior_audits": True,
    "no_other_results": True,
    "no_unrelated_windows": True,
    "no_external_research": True,
    "context_not_promoted_to_core_finding": True,
}

ASSIGNMENT_COMPARE_FIELDS = (
    "assignment_id",
    "window_id",
    "doc_id",
    "document_path",
    "core_range",
    "source_sha256",
    "core_sha256",
    "capsule_ref",
    "capsule_sha256",
    "capsule_bytes",
    "source_excerpt_ref",
    "source_excerpt_sha256",
    "source_excerpt_bytes",
)

SEMANTIC_ARRAYS = (
    ("observations", "observation_id"),
    ("candidate_findings", "finding_id"),
    ("explicit_non_gaps", "non_gap_id"),
    ("unknowns", "unknown_id"),
)


def audit_root() -> pathlib.Path:
    here = pathlib.Path(__file__).resolve()
    for parent in here.parents:
        if (parent / "assignments" / "runner-07.jsonl").is_file():
            return parent
    raise RuntimeError("audit root not found")


def load_assignments(root: pathlib.Path) -> dict[str, dict[str, Any]]:
    packet = root / "assignments" / "runner-07.jsonl"
    rows = [json.loads(line) for line in packet.read_text().splitlines() if line.strip()]
    return {row["assignment_id"]: row for row in rows}


def validate(path: pathlib.Path, root: pathlib.Path, assignments: dict[str, dict[str, Any]]) -> dict[str, Any]:
    errors: list[str] = []
    raw = path.read_bytes()
    try:
        result = json.loads(raw)
    except Exception as exc:
        return {
            "result_ref": str(path),
            "validation_passed": False,
            "error_count": 1,
            "errors": [f"json_parse:{exc}"],
            "result_sha256": hashlib.sha256(raw).hexdigest(),
            "result_bytes": len(raw),
        }

    assignment_id = result.get("assignment_id")
    assignment = assignments.get(assignment_id)
    if assignment is None:
        errors.append("assignment_id_not_allocated")
    if not (
        path.name == f"{assignment_id}.json"
        or path.name.startswith(f"{assignment_id}.attempt-")
    ):
        errors.append("result_filename_assignment_mismatch")

    missing = REQUIRED_TOP - set(result)
    extra = set(result) - REQUIRED_TOP
    if missing:
        errors.append("missing_top_fields:" + ",".join(sorted(missing)))
    if extra:
        errors.append("extra_top_fields:" + ",".join(sorted(extra)))

    scalar_checks = {
        "schema_version": result.get("schema_version") == SCHEMA_VERSION,
        "runner_id": result.get("runner_id") == RUNNER_ID,
        "model": result.get("model") == REQUIRED_MODEL,
        "reasoning_effort": result.get("reasoning_effort") == REQUIRED_EFFORT,
        "role": result.get("role") == ROLE,
        "role_key": result.get("role_key") == ROLE_KEY,
        "prior_substantive_assignment_count": result.get("prior_substantive_assignment_count") == 0,
        "terminal_after_result": result.get("terminal_after_result") is True,
        "no_followup_reuse": result.get("no_followup_reuse") is True,
        "result_status": result.get("result_status") == "complete",
        "assignment_attempt_number": isinstance(result.get("assignment_attempt_number"), int)
        and result.get("assignment_attempt_number") >= 1,
        "attempt_id": isinstance(result.get("attempt_id"), str)
        and bool(result.get("attempt_id")),
        "agent_name": bool(
            re.fullmatch(r"a004_r07_exact_[0-9]{4}_[0-9a-f]{8}", str(result.get("agent_name", "")))
        ),
    }
    for field, passed in scalar_checks.items():
        if not passed:
            errors.append(f"invalid_{field}")

    if assignment is not None:
        for field in ASSIGNMENT_COMPARE_FIELDS:
            if result.get(field) != assignment.get(field):
                errors.append(f"assignment_mismatch:{field}")
        expected_agent_prefix = f"a004_r07_exact_{assignment['assignment_seq']:04d}_"
        if not str(result.get("agent_name", "")).startswith(expected_agent_prefix):
            errors.append("agent_name_assignment_seq_mismatch")

    capsule_path = root.parent.parent.parent / str(result.get("capsule_ref", ""))
    excerpt_path = root.parent.parent.parent / str(result.get("source_excerpt_ref", ""))
    try:
        capsule = json.loads(capsule_path.read_text())
    except Exception as exc:
        capsule = {}
        errors.append(f"capsule_read:{exc}")
    if result.get("context_ranges") != capsule.get("context_ranges"):
        errors.append("capsule_mismatch:context_ranges")

    try:
        excerpt = excerpt_path.read_text()
    except Exception as exc:
        excerpt = ""
        errors.append(f"excerpt_read:{exc}")
    canonical_path = root.parent.parent.parent / str(result.get("document_path", ""))
    try:
        canonical_lines = canonical_path.read_text().splitlines()
    except Exception as exc:
        canonical_lines = []
        errors.append(f"canonical_source_read:{exc}")

    allowed_ranges: list[tuple[str, list[int]]] = []
    core_range = result.get("core_range")
    if isinstance(core_range, list) and len(core_range) == 2:
        allowed_ranges.append(("core", core_range))
    else:
        errors.append("invalid_core_range")
    for context_range in result.get("context_ranges", []):
        if isinstance(context_range, list) and len(context_range) == 2:
            allowed_ranges.append(("context", context_range))
        else:
            errors.append("invalid_context_range")

    evidence = result.get("exact_evidence_refs")
    evidence_map: dict[str, dict[str, Any]] = {}
    exact_quote_present_count = 0
    if not isinstance(evidence, list) or not evidence:
        errors.append("exact_evidence_refs_empty_or_invalid")
        evidence = []
    for ref in evidence:
        ref_id = ref.get("evidence_ref_id") if isinstance(ref, dict) else None
        if not isinstance(ref_id, str) or not ref_id:
            errors.append("invalid_evidence_ref_id")
            continue
        if ref_id in evidence_map:
            errors.append(f"duplicate_evidence_ref_id:{ref_id}")
        evidence_map[ref_id] = ref
        if ref.get("document_path") != result.get("document_path"):
            errors.append(f"evidence_document_path_mismatch:{ref_id}")
        line_start = ref.get("line_start")
        line_end = ref.get("line_end")
        if not isinstance(line_start, int) or not isinstance(line_end, int) or line_start > line_end:
            errors.append(f"invalid_evidence_range:{ref_id}")
            continue
        matches = [
            range_class
            for range_class, (allowed_start, allowed_end) in allowed_ranges
            if allowed_start <= line_start <= line_end <= allowed_end
        ]
        if len(matches) != 1:
            errors.append(f"evidence_outside_capsule_ranges:{ref_id}")
        elif ref.get("range_class") != matches[0]:
            errors.append(f"evidence_range_class_mismatch:{ref_id}")
        exact_quote = ref.get("exact_quote")
        if not isinstance(exact_quote, str) or not exact_quote:
            errors.append(f"empty_exact_quote:{ref_id}")
        else:
            if exact_quote not in excerpt:
                errors.append(f"exact_quote_absent_from_excerpt:{ref_id}")
            if isinstance(line_start, int) and isinstance(line_end, int):
                if line_start < 1 or line_end > len(canonical_lines):
                    errors.append(f"canonical_evidence_range_invalid:{ref_id}")
                else:
                    canonical_slice = " ".join(
                        "\n".join(canonical_lines[line_start - 1 : line_end]).split()
                    )
                    normalized_quote = " ".join(exact_quote.split())
                    if normalized_quote not in canonical_slice:
                        errors.append(f"exact_quote_mismatch_canonical_lines:{ref_id}")
                    else:
                        exact_quote_present_count += 1

    for array_name, id_field in SEMANTIC_ARRAYS:
        items = result.get(array_name)
        if not isinstance(items, list):
            errors.append(f"invalid_array:{array_name}")
            continue
        seen_ids: set[str] = set()
        for item in items:
            item_id = item.get(id_field) if isinstance(item, dict) else None
            if not isinstance(item_id, str) or not item_id:
                errors.append(f"invalid_{id_field}")
                continue
            if item_id in seen_ids:
                errors.append(f"duplicate_{id_field}:{item_id}")
            seen_ids.add(item_id)
            refs = item.get("evidence_ref_ids")
            if not isinstance(refs, list) or not refs:
                errors.append(f"missing_evidence_refs:{array_name}:{item_id}")
                continue
            for ref_id in refs:
                if ref_id not in evidence_map:
                    errors.append(f"unresolved_evidence_ref:{array_name}:{item_id}:{ref_id}")
            if array_name == "candidate_findings" and not any(
                evidence_map.get(ref_id, {}).get("range_class") == "core" for ref_id in refs
            ):
                errors.append(f"candidate_finding_without_core_evidence:{item_id}")

    if result.get("scope_attestation") != EXPECTED_ATTESTATION:
        errors.append("scope_attestation_mismatch")

    return {
        "assignment_id": assignment_id,
        "result_ref": str(path),
        "validation_passed": not errors,
        "error_count": len(errors),
        "errors": errors,
        "result_sha256": hashlib.sha256(raw).hexdigest(),
        "result_bytes": len(raw),
        "observations_count": len(result.get("observations", [])),
        "candidate_findings_count": len(result.get("candidate_findings", [])),
        "explicit_non_gaps_count": len(result.get("explicit_non_gaps", [])),
        "unknowns_count": len(result.get("unknowns", [])),
        "exact_evidence_refs_count": len(evidence),
        "exact_quote_present_count": exact_quote_present_count,
        "scope_spill_count": sum(
            1 for error in errors if error.startswith("evidence_outside_capsule_ranges:")
        ),
        "wrong_model_or_effort_count": sum(
            1 for error in errors if error in {"invalid_model", "invalid_reasoning_effort"}
        ),
        "malformed_count": int(any(error.startswith("json_parse:") for error in errors)),
    }


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("results", nargs="*", type=pathlib.Path)
    parser.add_argument("--all", action="store_true")
    args = parser.parse_args()
    root = audit_root()
    assignments = load_assignments(root)
    if args.all:
        paths = sorted((root / "runners" / RUNNER_ID / "raw_results").glob("*.json"))
    else:
        paths = args.results
    if not paths:
        parser.error("provide result paths or --all")
    outputs = [validate(path.resolve(), root, assignments) for path in paths]
    for output in outputs:
        print(json.dumps(output, separators=(",", ":"), ensure_ascii=False))
    return 0 if all(output["validation_passed"] for output in outputs) else 1


if __name__ == "__main__":
    sys.exit(main())
