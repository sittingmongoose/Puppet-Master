#!/usr/bin/env python3
"""Deterministically validate Audit 005 assignment artifacts without editing them."""

from __future__ import annotations

import argparse
import hashlib
import json
import os
from collections import Counter
from pathlib import Path
from typing import Any


AUDIT_ROOT = Path(__file__).resolve().parent
REPO = AUDIT_ROOT.parents[2]
AUDIT_ID = AUDIT_ROOT.name
EPOCH_ID = os.environ.get("AUDIT005_EPOCH")
if not EPOCH_ID:
    raise SystemExit("AUDIT005_EPOCH is required; refusing to guess a frozen epoch")
EPOCH = AUDIT_ROOT / "master" / "frozen" / EPOCH_ID
LANE_SUBAGENT_MODE = int(EPOCH_ID.rsplit("-", 1)[1]) >= 3
SHA_KEYS = {"source_sha256", "core_sha256", "dispatch_receipt_sha256", "result_sha256"}

RESULT_KEYS = {
    "audit_id",
    "schema_version",
    "phase",
    "assignment_id",
    "attempt_id",
    "task_thread_id",
    "model",
    "reasoning_effort",
    "role",
    "status",
    "source_binding",
    "coverage",
    "items",
    "dimension_assessments",
    "self_attestation",
}
SOURCE_BINDING_KEYS = {"document_path", "source_sha256", "core_sha256", "core_range"}
COVERAGE_KEYS = {"all_core_lines_reviewed", "dimensions_checked"}
ITEM_KEYS = {
    "item_id",
    "item_type",
    "title",
    "statement",
    "severity",
    "confidence",
    "gap_kind",
    "impact",
    "builder_discretion",
    "feature_keys",
    "evidence",
}
ITEM_REQUIRED = {"item_id", "item_type", "title", "statement", "severity", "confidence", "evidence"}
EVIDENCE_KEYS = {"path", "line_start", "line_end", "exact_quote", "source_sha256"}
DIMENSION_KEYS = {"dimension", "status", "summary", "evidence_item_ids"}
ATTESTATION_KEYS = {
    "no_prior_audit_access",
    "no_peer_result_access",
    "no_unrelated_source_access",
    "no_canonical_writes",
    "terminal_after_submission",
}
TERMINAL_KEYS = {
    "audit_id",
    "schema_version",
    "assignment_id",
    "attempt_id",
    "task_thread_id",
    "dispatch_receipt_sha256",
    "result_sha256",
    "result_bytes",
    "status",
}
DISPATCH_KEYS = {
    "audit_id",
    "schema_version",
    "assignment_id",
    "attempt_id",
    "task_thread_id",
    "model",
    "reasoning_effort",
    "assignment_sha256",
    "capsule_ref",
    "capsule_sha256",
    "result_schema_ref",
    "terminal_schema_ref",
    "protocol_root_sha256",
    "output_directory",
}
if LANE_SUBAGENT_MODE:
    DISPATCH_KEYS |= {"lane_thread_id", "agent_path", "fresh_lane_subagent"}
else:
    DISPATCH_KEYS.add("fresh_top_level_thread")
ITEM_TYPES = {
    "behavior",
    "capability",
    "contract",
    "state_transition",
    "authority",
    "consumer",
    "gui_truth",
    "failure_recovery",
    "acceptance_oracle",
    "gap",
    "unknown",
    "explicit_non_gap",
}


def sha(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def load_json(path: Path) -> dict[str, Any]:
    value = json.loads(path.read_text(encoding="utf-8"))
    if not isinstance(value, dict):
        raise ValueError("expected object")
    return value


def wave_rows_with_hashes(wave_id: str) -> list[tuple[dict[str, Any], str]]:
    wave_path = AUDIT_ROOT / "master" / "waves" / wave_id / "wave_assignment_manifest.jsonl"
    path = wave_path if wave_path.is_file() else EPOCH / "manifests" / "pilot_assignment_manifest.jsonl"
    rows = []
    for raw in path.read_bytes().splitlines():
        if raw.strip():
            rows.append((json.loads(raw), sha(raw)))
    return rows


def exact_keys(value: Any, expected: set[str], required: set[str] | None = None) -> list[str]:
    if not isinstance(value, dict):
        return ["expected JSON object"]
    required = expected if required is None else required
    errors = []
    extra = set(value) - expected
    missing = required - set(value)
    if extra:
        errors.append(f"undeclared fields: {sorted(extra)}")
    if missing:
        errors.append(f"missing fields: {sorted(missing)}")
    return errors


def string_ok(value: Any) -> bool:
    return isinstance(value, str) and bool(value.strip())


def validate_assignment(
    assignment: dict[str, Any],
    assignment_hash: str,
    wave_id: str,
    protocol_root: str,
) -> dict[str, Any]:
    assignment_id = assignment["assignment_id"]
    attempt_id = assignment["attempt_id"]
    output = AUDIT_ROOT / assignment["output_directory"]
    receipt_path = (
        AUDIT_ROOT
        / "master"
        / "dispatch"
        / wave_id
        / assignment_id
        / attempt_id
        / "dispatch_receipt.json"
    )
    result_path = output / "result.json"
    terminal_path = output / "terminal_seal.json"
    errors: list[str] = []
    if not receipt_path.is_file():
        errors.append("missing_dispatch_receipt")
        return {"assignment_id": assignment_id, "status": "pending", "errors": errors}
    try:
        receipt_bytes = receipt_path.read_bytes()
        receipt = json.loads(receipt_bytes)
        errors += [f"dispatch:{error}" for error in exact_keys(receipt, DISPATCH_KEYS)]
        expected_receipt = {
            "audit_id": AUDIT_ID,
            "schema_version": "dispatch-receipt-v1",
            "assignment_id": assignment_id,
            "attempt_id": attempt_id,
            "model": "gpt-5.6-sol",
            "reasoning_effort": "xhigh",
            "assignment_sha256": assignment_hash,
            "capsule_ref": str(EPOCH / assignment["capsule_ref"]),
            "capsule_sha256": assignment["capsule_sha256"],
            "result_schema_ref": str(EPOCH / "schemas" / "assignment_result.schema.json"),
            "terminal_schema_ref": str(EPOCH / "schemas" / "terminal_seal.schema.json"),
            "protocol_root_sha256": protocol_root,
            "output_directory": str(output),
        }
        if LANE_SUBAGENT_MODE:
            expected_receipt["lane_thread_id"] = receipt.get("lane_thread_id")
            expected_receipt["agent_path"] = receipt.get("agent_path")
            expected_receipt["fresh_lane_subagent"] = True
            if not string_ok(receipt.get("lane_thread_id")):
                errors.append("dispatch_invalid_lane_thread_id")
            if not string_ok(receipt.get("agent_path")):
                errors.append("dispatch_invalid_agent_path")
        else:
            expected_receipt["fresh_top_level_thread"] = True
        for key, expected in expected_receipt.items():
            if receipt.get(key) != expected:
                errors.append(f"dispatch_{key}_mismatch")
        task_thread_id = receipt.get("task_thread_id")
        if not string_ok(task_thread_id):
            errors.append("dispatch_invalid_task_thread_id")
    except Exception as exc:
        errors.append(f"dispatch_parse_error:{type(exc).__name__}")
        return {"assignment_id": assignment_id, "status": "quarantined", "errors": errors}

    if not result_path.is_file():
        return {"assignment_id": assignment_id, "status": "pending", "task_thread_id": task_thread_id, "errors": errors + ["missing_result"]}
    if not terminal_path.is_file():
        return {"assignment_id": assignment_id, "status": "pending", "task_thread_id": task_thread_id, "errors": errors + ["missing_terminal_seal"]}

    try:
        result_bytes = result_path.read_bytes()
        terminal_bytes = terminal_path.read_bytes()
        result = json.loads(result_bytes)
        terminal = json.loads(terminal_bytes)
    except Exception as exc:
        errors.append(f"artifact_parse_error:{type(exc).__name__}")
        return {"assignment_id": assignment_id, "status": "quarantined", "task_thread_id": task_thread_id, "errors": errors}

    errors += [f"result:{error}" for error in exact_keys(result, RESULT_KEYS)]
    errors += [f"terminal:{error}" for error in exact_keys(terminal, TERMINAL_KEYS)]
    expected_result = {
        "audit_id": AUDIT_ID,
        "schema_version": "assignment-result-v1",
        "phase": "blind_document_window_review",
        "assignment_id": assignment_id,
        "attempt_id": attempt_id,
        "task_thread_id": task_thread_id,
        "model": "gpt-5.6-sol",
        "reasoning_effort": "xhigh",
        "role": assignment["role"],
        "status": "completed",
    }
    for key, expected in expected_result.items():
        if result.get(key) != expected:
            errors.append(f"result_{key}_mismatch")
    expected_terminal = {
        "audit_id": AUDIT_ID,
        "schema_version": "terminal-seal-v1",
        "assignment_id": assignment_id,
        "attempt_id": attempt_id,
        "task_thread_id": task_thread_id,
        "dispatch_receipt_sha256": sha(receipt_bytes),
        "result_sha256": sha(result_bytes),
        "result_bytes": len(result_bytes),
        "status": "completed",
    }
    for key, expected in expected_terminal.items():
        if terminal.get(key) != expected:
            errors.append(f"terminal_{key}_mismatch")

    binding = result.get("source_binding")
    errors += [f"source_binding:{error}" for error in exact_keys(binding, SOURCE_BINDING_KEYS)]
    if isinstance(binding, dict):
        expected_binding = {
            "document_path": assignment["document_path"],
            "source_sha256": assignment["source_sha256"],
            "core_sha256": assignment["core_sha256"],
            "core_range": assignment["core_range"],
        }
        for key, expected in expected_binding.items():
            if binding.get(key) != expected:
                errors.append(f"source_binding_{key}_mismatch")

    coverage = result.get("coverage")
    errors += [f"coverage:{error}" for error in exact_keys(coverage, COVERAGE_KEYS)]
    required_dimensions = assignment["required_dimensions"]
    if isinstance(coverage, dict):
        if coverage.get("all_core_lines_reviewed") is not True:
            errors.append("coverage_all_core_lines_not_true")
        if not isinstance(coverage.get("dimensions_checked"), list) or set(coverage["dimensions_checked"]) != set(required_dimensions):
            errors.append("coverage_dimension_set_mismatch")

    source_path = REPO / assignment["document_path"]
    source_lines = source_path.read_text(encoding="utf-8").splitlines(keepends=True)
    core_start, core_end = assignment["core_range"]
    items = result.get("items")
    if not isinstance(items, list) or not items:
        errors.append("items_must_be_nonempty_array")
        items = []
    item_ids: set[str] = set()
    for index, item in enumerate(items):
        prefix = f"item_{index}"
        errors += [f"{prefix}:{error}" for error in exact_keys(item, ITEM_KEYS, ITEM_REQUIRED)]
        if not isinstance(item, dict):
            continue
        item_id = item.get("item_id")
        if not string_ok(item_id) or item_id in item_ids:
            errors.append(f"{prefix}_invalid_or_duplicate_id")
        else:
            item_ids.add(item_id)
        if item.get("item_type") not in ITEM_TYPES:
            errors.append(f"{prefix}_invalid_type")
        if item.get("severity") not in {"none", "low", "medium", "high", "critical"}:
            errors.append(f"{prefix}_invalid_severity")
        if item.get("confidence") not in {"low", "medium", "high"}:
            errors.append(f"{prefix}_invalid_confidence")
        for key in ("title", "statement"):
            if not string_ok(item.get(key)):
                errors.append(f"{prefix}_{key}_empty")
        evidence_rows = item.get("evidence")
        if not isinstance(evidence_rows, list) or not evidence_rows:
            errors.append(f"{prefix}_missing_evidence")
            continue
        for evidence_index, evidence in enumerate(evidence_rows):
            ep = f"{prefix}_evidence_{evidence_index}"
            errors += [f"{ep}:{error}" for error in exact_keys(evidence, EVIDENCE_KEYS)]
            if not isinstance(evidence, dict):
                continue
            if evidence.get("path") != assignment["document_path"]:
                errors.append(f"{ep}_path_mismatch")
            if evidence.get("source_sha256") != assignment["source_sha256"]:
                errors.append(f"{ep}_source_hash_mismatch")
            start, end = evidence.get("line_start"), evidence.get("line_end")
            if not isinstance(start, int) or not isinstance(end, int) or not (core_start <= start <= end <= core_end):
                errors.append(f"{ep}_range_outside_core")
                continue
            quote = evidence.get("exact_quote")
            selected = "".join(source_lines[start - 1:end])
            if not string_ok(quote) or quote not in selected:
                errors.append(f"{ep}_quote_not_exact")

    assessments = result.get("dimension_assessments")
    if not isinstance(assessments, list):
        errors.append("dimension_assessments_not_array")
        assessments = []
    assessment_dimensions: list[str] = []
    for index, assessment in enumerate(assessments):
        prefix = f"dimension_{index}"
        errors += [f"{prefix}:{error}" for error in exact_keys(assessment, DIMENSION_KEYS)]
        if not isinstance(assessment, dict):
            continue
        dimension = assessment.get("dimension")
        assessment_dimensions.append(dimension)
        status = assessment.get("status")
        if status not in {"addressed", "gap_found", "unknown", "not_applicable"}:
            errors.append(f"{prefix}_invalid_status")
        if not string_ok(assessment.get("summary")):
            errors.append(f"{prefix}_empty_summary")
        evidence_ids = assessment.get("evidence_item_ids")
        if not isinstance(evidence_ids, list) or len(evidence_ids) != len(set(evidence_ids)):
            errors.append(f"{prefix}_invalid_evidence_ids")
            evidence_ids = []
        if any(item_id not in item_ids for item_id in evidence_ids):
            errors.append(f"{prefix}_unknown_evidence_item_id")
        if status in {"addressed", "gap_found"} and not evidence_ids:
            errors.append(f"{prefix}_positive_status_without_evidence")
    if Counter(assessment_dimensions) != Counter(required_dimensions):
        errors.append("dimension_assessment_set_or_cardinality_mismatch")

    attestation = result.get("self_attestation")
    errors += [f"attestation:{error}" for error in exact_keys(attestation, ATTESTATION_KEYS)]
    if isinstance(attestation, dict) and any(attestation.get(key) is not True for key in ATTESTATION_KEYS):
        errors.append("attestation_not_all_true")

    serialized_lower = result_bytes.lower()
    for forbidden in (b"audit-20260709", b"runner-", b"plans/.audits/"):
        if forbidden in serialized_lower:
            errors.append(f"forbidden_prior_or_peer_reference:{forbidden.decode()}")

    return {
        "assignment_id": assignment_id,
        "attempt_id": attempt_id,
        "task_thread_id": task_thread_id,
        "status": "accepted" if not errors else "quarantined",
        "error_count": len(errors),
        "errors": errors,
        "result_sha256": sha(result_bytes),
        "terminal_seal_sha256": sha(terminal_bytes),
        "result_bytes": len(result_bytes),
        "item_count": len(items),
    }


def validate_wave(wave_id: str) -> dict[str, Any]:
    seal = load_json(EPOCH / "launch_seal.json")
    rows = wave_rows_with_hashes(wave_id)
    results = [
        validate_assignment(assignment, assignment_hash, wave_id, seal["protocol_root_sha256"])
        for assignment, assignment_hash in rows
    ]
    task_ids = [row.get("task_thread_id") for row in results if row.get("task_thread_id")]
    duplicate_task_ids = sorted(task_id for task_id, count in Counter(task_ids).items() if count > 1)
    if duplicate_task_ids:
        for row in results:
            if row.get("task_thread_id") in duplicate_task_ids:
                row["status"] = "quarantined"
                row.setdefault("errors", []).append("task_thread_identity_reused")
                row["error_count"] = len(row["errors"])
    counts = Counter(row["status"] for row in results)
    return {
        "audit_id": AUDIT_ID,
        "validator": "wave_primary_v1",
        "wave_id": wave_id,
        "status": "pass" if counts["accepted"] == len(results) else ("in_progress" if counts["pending"] else "fail"),
        "counts": {
            "assignments": len(results),
            "accepted": counts["accepted"],
            "pending": counts["pending"],
            "quarantined": counts["quarantined"],
        },
        "credited_assignment_ids": sorted(row["assignment_id"] for row in results if row["status"] == "accepted"),
        "results": results,
    }


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--wave-id", default="pilot-wave-0001")
    args = parser.parse_args()
    report = validate_wave(args.wave_id)
    print(json.dumps(report, indent=2, sort_keys=True))
    raise SystemExit(0 if report["status"] in {"pass", "in_progress"} else 1)


if __name__ == "__main__":
    main()
