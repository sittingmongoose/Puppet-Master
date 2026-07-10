#!/usr/bin/env python3
from __future__ import annotations

import argparse
import hashlib
import json
import sys
from collections import Counter, defaultdict
from pathlib import Path
from typing import Any


AUDIT_ID = "audit-20260709-004-plan-assurance-horizontally-sharded-fresh-agent-blind-exhaustive"
RUNNER_ID = "runner-12"
MODEL = "gpt-5.6-sol"
EFFORT = "ultra"
ROLE = "adversarial_negative_space"
REQUIRED_RESULT_KEYS = {
    "assignment_id",
    "role",
    "status",
    "observations",
    "candidate_findings",
    "explicit_non_gaps",
    "unknowns",
    "exact_evidence_refs",
}


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def read_jsonl(path: Path) -> tuple[list[dict[str, Any]], list[str]]:
    rows: list[dict[str, Any]] = []
    errors: list[str] = []
    if not path.exists():
        return rows, errors
    for line_number, raw in enumerate(path.read_text(encoding="utf-8").splitlines(), 1):
        if not raw.strip():
            continue
        try:
            row = json.loads(raw)
        except json.JSONDecodeError as exc:
            errors.append(f"{path.name}:{line_number}:invalid_json:{exc.msg}")
            continue
        if not isinstance(row, dict):
            errors.append(f"{path.name}:{line_number}:not_object")
            continue
        rows.append(row)
    return rows, errors


def duplicates(rows: list[dict[str, Any]], key: str) -> list[str]:
    counts = Counter(str(row.get(key)) for row in rows if row.get(key) is not None)
    return sorted(value for value, count in counts.items() if count > 1)


def permitted_ranges(assignment: dict[str, Any], capsule: dict[str, Any]) -> list[tuple[int, int]]:
    ranges = [tuple(assignment["core_range"])]
    for item in capsule.get("context_ranges", []):
        if isinstance(item, list) and len(item) == 2:
            ranges.append((int(item[0]), int(item[1])))
    return ranges


def range_is_permitted(start: int, end: int, ranges: list[tuple[int, int]]) -> bool:
    if start > end:
        return False
    return any(start >= low and end <= high for low, high in ranges)


def evidence_key(ref: dict[str, Any]) -> tuple[Any, ...]:
    return (
        ref.get("document_path"),
        ref.get("line_start"),
        ref.get("line_end"),
        ref.get("excerpt"),
    )


def collect_nested_evidence(result: dict[str, Any]) -> list[dict[str, Any]]:
    refs: list[dict[str, Any]] = []
    for section in ("observations", "candidate_findings", "explicit_non_gaps", "unknowns"):
        items = result.get(section, [])
        if not isinstance(items, list):
            continue
        for item in items:
            if not isinstance(item, dict):
                continue
            evidence = item.get("evidence_refs", [])
            if isinstance(evidence, list):
                refs.extend(ref for ref in evidence if isinstance(ref, dict))
    return refs


def validate_evidence_ref(
    ref: dict[str, Any],
    assignment: dict[str, Any],
    ranges: list[tuple[int, int]],
    source_lines: list[str],
    prefix: str,
) -> list[str]:
    errors: list[str] = []
    required = {"document_path", "line_start", "line_end", "excerpt"}
    missing = sorted(required - set(ref))
    if missing:
        return [f"{prefix}:evidence_missing:{','.join(missing)}"]
    if ref.get("document_path") != assignment.get("document_path"):
        errors.append(f"{prefix}:evidence_document_path_mismatch")
    start, end = ref.get("line_start"), ref.get("line_end")
    if not isinstance(start, int) or not isinstance(end, int):
        errors.append(f"{prefix}:evidence_line_not_integer")
    elif not range_is_permitted(start, end, ranges):
        errors.append(f"{prefix}:evidence_range_spill:{start}-{end}")
    quote = ref.get("excerpt")
    if not isinstance(quote, str) or not quote.strip():
        errors.append(f"{prefix}:evidence_excerpt_empty")
    elif isinstance(start, int) and isinstance(end, int) and 1 <= start <= end <= len(source_lines):
        canonical = " ".join("\n".join(source_lines[start - 1:end]).split())
        normalized_quote = " ".join(quote.split())
        if normalized_quote not in canonical:
            errors.append(f"{prefix}:evidence_excerpt_not_in_canonical_lines")
    else:
        errors.append(f"{prefix}:evidence_excerpt_not_verbatim")
    return errors


def validate_result(
    result_path: Path,
    assignment: dict[str, Any],
    capsule: dict[str, Any],
) -> list[str]:
    prefix = assignment["assignment_id"]
    errors: list[str] = []
    try:
        result = json.loads(result_path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as exc:
        return [f"{prefix}:result_invalid_json:{exc}"]
    if not isinstance(result, dict):
        return [f"{prefix}:result_not_object"]
    missing = sorted(REQUIRED_RESULT_KEYS - set(result))
    if missing:
        errors.append(f"{prefix}:result_missing_keys:{','.join(missing)}")
    if result.get("assignment_id") != assignment["assignment_id"]:
        errors.append(f"{prefix}:assignment_id_mismatch")
    if result.get("role") != ROLE:
        errors.append(f"{prefix}:role_mismatch")
    if result.get("status") != "completed":
        errors.append(f"{prefix}:status_not_completed")
    for key in ("observations", "candidate_findings", "explicit_non_gaps", "unknowns", "exact_evidence_refs"):
        if not isinstance(result.get(key), list):
            errors.append(f"{prefix}:{key}_not_array")
    top_refs = result.get("exact_evidence_refs", [])
    findings = result.get("candidate_findings", [])
    if isinstance(findings, list) and findings and isinstance(top_refs, list) and not top_refs:
        errors.append(f"{prefix}:candidate_findings_lack_exact_evidence_refs")
    ranges = permitted_ranges(assignment, capsule)
    source_path = Path(assignment["document_path"])
    source_lines = source_path.read_text(encoding="utf-8").splitlines()
    if isinstance(top_refs, list):
        top_dicts = [item for item in top_refs if isinstance(item, dict)]
        if len(top_dicts) != len(top_refs):
            errors.append(f"{prefix}:exact_evidence_ref_not_object")
        top_keys = [evidence_key(ref) for ref in top_dicts]
        if len(top_keys) != len(set(top_keys)):
            errors.append(f"{prefix}:exact_evidence_refs_not_deduplicated")
        for index, ref in enumerate(top_dicts):
            errors.extend(validate_evidence_ref(ref, assignment, ranges, source_lines, f"{prefix}:top_ref:{index}"))
        nested_refs = collect_nested_evidence(result)
        top_key_set = set(top_keys)
        for index, ref in enumerate(nested_refs):
            errors.extend(validate_evidence_ref(ref, assignment, ranges, source_lines, f"{prefix}:nested_ref:{index}"))
            if evidence_key(ref) not in top_key_set:
                errors.append(f"{prefix}:nested_ref_missing_from_exact_list:{index}")
    return errors


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--mode", choices=("partial", "final"), default="partial")
    parser.add_argument("--audit-root", default=f"Plans/.audits/{AUDIT_ID}")
    args = parser.parse_args()

    audit_root = Path(args.audit_root)
    runner_root = audit_root / "runners" / RUNNER_ID
    assignments, parse_errors = read_jsonl(audit_root / "assignments" / f"{RUNNER_ID}.jsonl")
    registry, registry_parse_errors = read_jsonl(runner_root / "fresh_agent_assignment_registry.jsonl")
    manifest, manifest_parse_errors = read_jsonl(runner_root / "result_manifest.jsonl")
    errors = parse_errors + registry_parse_errors + manifest_parse_errors

    assignment_by_id = {row.get("assignment_id"): row for row in assignments}
    if len(assignment_by_id) != len(assignments):
        errors.append("packet:duplicate_assignment_id")
    if any(row.get("runner_id") != RUNNER_ID for row in assignments):
        errors.append("packet:runner_id_mismatch")

    duplicate_agent_instances = duplicates(registry, "agent_instance_id")
    duplicate_agent_paths = duplicates(registry, "agent_path")
    duplicate_agent_threads = duplicates(registry, "agent_thread_id")
    duplicate_attempt_ids = duplicates(registry, "attempt_id")
    valid_manifest_rows = [row for row in manifest if row.get("validation_status") == "valid"]
    duplicate_manifest_assignments = duplicates(valid_manifest_rows, "assignment_id")
    duplicate_manifest_results = duplicates(manifest, "result_ref")
    for label, values in (
        ("agent_instance_id", duplicate_agent_instances),
        ("agent_path", duplicate_agent_paths),
        ("agent_thread_id", duplicate_agent_threads),
        ("attempt_id", duplicate_attempt_ids),
    ):
        for value in values:
            errors.append(f"registry:duplicate_{label}:{value}")
    for value in duplicate_manifest_assignments:
        errors.append(f"manifest:duplicate_assignment_id:{value}")
    for value in duplicate_manifest_results:
        errors.append(f"manifest:duplicate_result_ref:{value}")

    registry_by_attempt = {row.get("attempt_id"): row for row in registry}
    manifests_by_assignment: dict[str, list[dict[str, Any]]] = defaultdict(list)
    for row in manifest:
        manifests_by_assignment[str(row.get("assignment_id"))].append(row)

    for row in registry:
        assignment_id = row.get("assignment_id")
        assignment = assignment_by_id.get(assignment_id)
        prefix = str(assignment_id)
        if assignment is None:
            errors.append(f"{prefix}:registry_assignment_not_in_packet")
            continue
        expected_pairs = {
            "runner_id": RUNNER_ID,
            "model": MODEL,
            "reasoning_effort": EFFORT,
            "role": assignment.get("role"),
            "window_id": assignment.get("window_id"),
            "doc_id": assignment.get("doc_id"),
            "document_path": assignment.get("document_path"),
            "source_hash": assignment.get("source_sha256"),
            "core_hash": assignment.get("core_sha256"),
            "capsule_ref": assignment.get("capsule_ref"),
            "capsule_hash": assignment.get("capsule_sha256"),
            "capsule_bytes": assignment.get("capsule_bytes"),
            "capsule_package_bytes": assignment.get("capsule_package_bytes"),
            "source_excerpt_ref": assignment.get("source_excerpt_ref"),
            "source_excerpt_hash": assignment.get("source_excerpt_sha256"),
            "source_excerpt_bytes": assignment.get("source_excerpt_bytes"),
        }
        for key, expected in expected_pairs.items():
            if row.get(key) != expected:
                errors.append(f"{prefix}:registry_{key}_mismatch")
        if row.get("core_range") != assignment.get("core_range"):
            errors.append(f"{prefix}:registry_core_range_mismatch")
        if row.get("prior_substantive_assignment_count") != 0:
            errors.append(f"{prefix}:prior_assignment_count_nonzero")
        if row.get("terminal_after_result") is not True:
            errors.append(f"{prefix}:terminal_after_result_not_true")
        if row.get("no_followup_reuse") is not True:
            errors.append(f"{prefix}:no_followup_reuse_not_true")
        capsule_path = Path(assignment["capsule_ref"])
        excerpt_path = Path(assignment["source_excerpt_ref"])
        if not capsule_path.exists():
            errors.append(f"{prefix}:capsule_missing")
        else:
            if capsule_path.stat().st_size != assignment["capsule_bytes"]:
                errors.append(f"{prefix}:capsule_bytes_mismatch")
            if sha256(capsule_path) != assignment["capsule_sha256"]:
                errors.append(f"{prefix}:capsule_hash_mismatch")
        if not excerpt_path.exists():
            errors.append(f"{prefix}:source_excerpt_missing")
        else:
            if excerpt_path.stat().st_size != assignment["source_excerpt_bytes"]:
                errors.append(f"{prefix}:source_excerpt_bytes_mismatch")
            if sha256(excerpt_path) != assignment["source_excerpt_sha256"]:
                errors.append(f"{prefix}:source_excerpt_hash_mismatch")

    valid_assignment_ids: set[str] = set()
    failed_attempt_count = 0
    for row in manifest:
        assignment_id = str(row.get("assignment_id"))
        assignment = assignment_by_id.get(assignment_id)
        attempt = registry_by_attempt.get(row.get("attempt_id"))
        if assignment is None:
            errors.append(f"{assignment_id}:manifest_assignment_not_in_packet")
            continue
        if attempt is None:
            errors.append(f"{assignment_id}:manifest_attempt_missing_registry")
            continue
        if row.get("agent_instance_id") != attempt.get("agent_instance_id"):
            errors.append(f"{assignment_id}:manifest_agent_instance_mismatch")
        if row.get("agent_path") != attempt.get("agent_path"):
            errors.append(f"{assignment_id}:manifest_agent_path_mismatch")
        if row.get("agent_thread_id") != attempt.get("agent_thread_id"):
            errors.append(f"{assignment_id}:manifest_agent_thread_mismatch")
        result_ref = row.get("result_ref")
        result_path = Path(str(result_ref))
        if not result_path.exists():
            errors.append(f"{assignment_id}:result_missing")
            continue
        actual_result_hash = sha256(result_path)
        if row.get("result_hash") != actual_result_hash:
            errors.append(f"{assignment_id}:result_hash_mismatch")
        if row.get("validation_status") == "valid":
            capsule = json.loads(Path(assignment["capsule_ref"]).read_text(encoding="utf-8"))
            result_errors = validate_result(result_path, assignment, capsule)
            errors.extend(result_errors)
            if not result_errors:
                valid_assignment_ids.add(assignment_id)
        else:
            failed_attempt_count += 1

    expected_ids = set(assignment_by_id)
    missing_valid = sorted(expected_ids - valid_assignment_ids)
    extra_valid = sorted(valid_assignment_ids - expected_ids)
    if extra_valid:
        errors.extend(f"{assignment_id}:valid_not_expected" for assignment_id in extra_valid)
    if args.mode == "final" and missing_valid:
        errors.extend(f"{assignment_id}:missing_valid_result" for assignment_id in missing_valid)

    report = {
        "audit_id": AUDIT_ID,
        "runner_id": RUNNER_ID,
        "mode": args.mode,
        "validator_passed": not errors,
        "packet_assignment_count": len(assignments),
        "registry_attempt_count": len(registry),
        "manifest_result_count": len(manifest),
        "valid_assignment_count": len(valid_assignment_ids),
        "failed_attempt_count": failed_attempt_count,
        "missing_valid_assignment_count": len(missing_valid),
        "unique_agent_instance_count": len({row.get('agent_instance_id') for row in registry}),
        "duplicate_agent_instance_count": len(duplicate_agent_instances),
        "duplicate_agent_path_count": len(duplicate_agent_paths),
        "duplicate_agent_thread_count": len(duplicate_agent_threads),
        "duplicate_attempt_count": len(duplicate_attempt_ids),
        "duplicate_result_assignment_count": len(duplicate_manifest_assignments),
        "multi_scope_count": sum(1 for _, count in Counter(row.get("agent_instance_id") for row in registry).items() if count > 1),
        "recycled_identity_count": len(duplicate_agent_instances),
        "error_count": len(errors),
        "errors": errors,
    }
    print(json.dumps(report, indent=2, sort_keys=True))
    return 0 if not errors else 1


if __name__ == "__main__":
    sys.exit(main())
