#!/usr/bin/env python3
"""Deterministically normalize the pilot's richer-but-mechanical result dialect."""

from __future__ import annotations

import argparse
import json
from pathlib import Path
from typing import Any

from macro_v2_common import (
    ATTESTATION_KEYS,
    AUDIT_ID,
    COVERAGE_KEYS,
    DIMENSIONS,
    EVIDENCE_KEYS,
    ITEM_KEYS,
    ITEM_TYPES,
    MACRO_ROOT,
    REPO,
    ROOT,
    SEGMENT_KEYS,
    SOURCE_KEYS,
    SYNTHESIS_KEYS,
    TOP_KEYS,
    canonical_json,
    load_jsonl,
    load_obj,
    result_file,
    sha,
    validate_result_bytes,
    write_obj,
)


RICH_SOURCE_KEYS = {
    "document_path", "intent_sha256", "assignment_record_sha256", "assignment_record_binding_status",
    "capsule_sha256_expected", "capsule_sha256_actual", "capsule_sha256_verified",
    "source_excerpt_sha256_expected", "source_excerpt_sha256_actual", "source_excerpt_sha256_verified",
    "source_sha256_declared", "result_schema_sha256", "core_sha256_verified", "identity_verified",
}
RICH_COVERAGE_KEYS = {
    "core_range", "core_lines_expected", "core_lines_reviewed", "context_ranges", "context_lines_reviewed",
    "required_source_unit_refs_expected", "required_source_unit_refs_reviewed", "micro_windows_expected",
    "micro_windows_reviewed", "dimensions",
}
RICH_SEGMENT_KEYS = {
    "window_id", "core_range", "core_sha256", "core_lines_reviewed", "required_source_unit_refs",
    "exact_behavior_lens", "adversarial_negative_space_lens", "item_ids",
}
RICH_ITEM_KEYS = ITEM_KEYS | {"lens"}
RICH_ATTESTATION_KEYS = {
    "read_scope", "every_core_line_reviewed", "every_required_source_unit_ref_reviewed",
    "exact_behavior_lens_applied", "adversarial_negative_space_lens_applied",
    "segment_hashes_recomputed_and_matched", "capsule_hash_recomputed_and_matched",
    "excerpt_hash_recomputed_and_matched", "identity_fields_matched", "external_research_performed",
    "peer_results_read", "prior_audits_read", "unrelated_sources_read", "canonical_plans_edited",
    "followup_messages_sent", "terminal_seal_written", "result_files_written",
}


def nonempty(value: Any) -> bool:
    return isinstance(value, str) and bool(value.strip())


def normalize_payload(
    raw_bytes: bytes,
    *,
    assignment: dict[str, Any],
    capsule: dict[str, Any],
    receipt: dict[str, Any],
) -> tuple[dict[str, Any] | None, list[str]]:
    errors: list[str] = []
    try:
        raw = json.loads(raw_bytes)
    except Exception as exc:
        return None, [f"raw_json_parse:{type(exc).__name__}"]
    if not isinstance(raw, dict) or set(raw) != TOP_KEYS:
        return None, ["raw_top_key_set_not_supported"]
    expected_top = {
        "audit_id": AUDIT_ID,
        "schema_version": "macro-review-result-v1",
        "phase": "blind_macro_window_review",
        "assignment_id": assignment["assignment_id"],
        "attempt_id": assignment["attempt_id"],
        "task_thread_id": receipt["agent_path"],
        "model": "gpt-5.6-sol",
        "reasoning_effort": "xhigh",
        "status": "completed",
    }
    for key, value in expected_top.items():
        if raw.get(key) != value:
            errors.append(f"raw_top:{key}:mismatch")

    binding = raw.get("source_binding")
    if not isinstance(binding, dict) or set(binding) != RICH_SOURCE_KEYS:
        errors.append("rich_source_binding_key_set")
        binding = {}
    if binding.get("document_path") != assignment["document_path"]:
        errors.append("rich_source_document")
    if binding.get("source_sha256_declared") != assignment["source_sha256"]:
        errors.append("rich_source_sha")
    for flag in ("capsule_sha256_verified", "source_excerpt_sha256_verified", "core_sha256_verified", "identity_verified"):
        if binding.get(flag) is not True:
            errors.append(f"rich_source:{flag}")
    if binding.get("capsule_sha256_expected") != assignment["capsule_sha256"] or binding.get("capsule_sha256_actual") != assignment["capsule_sha256"]:
        errors.append("rich_capsule_hash")
    if binding.get("source_excerpt_sha256_expected") != assignment["source_excerpt_sha256"] or binding.get("source_excerpt_sha256_actual") != assignment["source_excerpt_sha256"]:
        errors.append("rich_excerpt_hash")

    segments_raw = raw.get("segments")
    capsule_segments = capsule.get("segments", [])
    if not isinstance(segments_raw, list) or len(segments_raw) != len(capsule_segments):
        errors.append("rich_segment_cardinality")
        segments_raw = []
    capsule_by_id = {row["window_id"]: row for row in capsule_segments}
    segment_ids = [row.get("window_id") for row in segments_raw if isinstance(row, dict)]
    if len(segment_ids) != len(set(segment_ids)) or set(segment_ids) != set(capsule_by_id):
        errors.append("rich_segment_identity_set")

    items_raw = raw.get("items")
    if not isinstance(items_raw, list) or not items_raw:
        errors.append("rich_items_missing")
        items_raw = []
    raw_item_ids = [row.get("item_id") for row in items_raw if isinstance(row, dict)]
    if len(raw_item_ids) != len(items_raw) or len(raw_item_ids) != len(set(raw_item_ids)) or any(not nonempty(value) for value in raw_item_ids):
        errors.append("rich_item_identity_set")
    item_id_set = set(raw_item_ids)

    coverage = raw.get("coverage")
    if not isinstance(coverage, dict) or set(coverage) != RICH_COVERAGE_KEYS:
        errors.append("rich_coverage_key_set")
        coverage = {}
    expected_core_lines = sum(row["core_range"][1] - row["core_range"][0] + 1 for row in capsule_segments)
    expected_refs = sum(len(row["required_source_unit_refs"]) for row in capsule_segments)
    expected_windows = len(capsule_segments)
    if coverage.get("core_lines_expected") != expected_core_lines or coverage.get("core_lines_reviewed") != expected_core_lines:
        errors.append("rich_core_line_counts")
    if coverage.get("required_source_unit_refs_expected") != expected_refs or coverage.get("required_source_unit_refs_reviewed") != expected_refs:
        errors.append("rich_source_ref_counts")
    if coverage.get("micro_windows_expected") != expected_windows or coverage.get("micro_windows_reviewed") != expected_windows:
        errors.append("rich_window_counts")
    dimension_map = coverage.get("dimensions")
    if not isinstance(dimension_map, dict) or set(dimension_map) != set(DIMENSIONS):
        errors.append("rich_dimension_set")
    else:
        for dimension, ids in dimension_map.items():
            if not isinstance(ids, list) or not ids or len(ids) != len(set(ids)) or not set(ids) <= item_id_set:
                errors.append(f"rich_dimension_mapping:{dimension}")

    attest = raw.get("self_attestation")
    if not isinstance(attest, dict) or set(attest) != RICH_ATTESTATION_KEYS:
        errors.append("rich_attestation_key_set")
        attest = {}
    for flag in (
        "every_core_line_reviewed", "every_required_source_unit_ref_reviewed", "exact_behavior_lens_applied",
        "adversarial_negative_space_lens_applied", "segment_hashes_recomputed_and_matched",
        "capsule_hash_recomputed_and_matched", "excerpt_hash_recomputed_and_matched", "identity_fields_matched",
    ):
        if attest.get(flag) is not True:
            errors.append(f"rich_attestation:{flag}")
    for flag in (
        "external_research_performed", "peer_results_read", "prior_audits_read", "unrelated_sources_read",
        "canonical_plans_edited", "followup_messages_sent", "terminal_seal_written",
    ):
        if attest.get(flag) is not False:
            errors.append(f"rich_attestation:{flag}")
    if attest.get("result_files_written") != 1:
        errors.append("rich_attestation:result_files_written")

    aliases = {"gui": "gui_truth", "oracle": "acceptance_oracle", "state": "state_transition"}
    confidence_map = {"high": 0.9, "medium": 0.65, "low": 0.35}
    severity_map = {"blocker": "critical", "warning": "medium", "pass": "info"}
    normalized_items: list[dict[str, Any]] = []
    all_refs: set[str] = set()
    source_lines = (REPO / assignment["document_path"]).read_text(encoding="utf-8").splitlines(keepends=True)
    assigned_ranges = [tuple(row["core_range"]) for row in capsule_segments]
    valid_refs = {ref for row in capsule_segments for ref in row["required_source_unit_refs"]}
    for index, item in enumerate(items_raw):
        label = f"rich_item:{index}"
        if not isinstance(item, dict) or set(item) != RICH_ITEM_KEYS:
            errors.append(f"{label}:key_set")
            continue
        item_type = aliases.get(item.get("item_type"), item.get("item_type"))
        if item_type not in ITEM_TYPES:
            errors.append(f"{label}:type")
        confidence = confidence_map.get(item.get("confidence"))
        if confidence is None:
            errors.append(f"{label}:confidence")
        severity = severity_map.get(item.get("severity"), item.get("severity"))
        if severity not in {"info", "low", "medium", "high", "critical"}:
            errors.append(f"{label}:severity")
        for field in ("title", "statement", "gap_kind", "impact", "lens"):
            if not nonempty(item.get(field)):
                errors.append(f"{label}:{field}")
        refs = item.get("source_unit_refs")
        if not isinstance(refs, list) or not refs or len(refs) != len(set(refs)) or not set(refs) <= valid_refs:
            errors.append(f"{label}:refs")
            refs = []
        all_refs.update(refs)
        dims = item.get("dimensions")
        if not isinstance(dims, list) or not dims or len(dims) != len(set(dims)) or not set(dims) <= set(DIMENSIONS):
            errors.append(f"{label}:dimensions")
            dims = []
        evidence_raw = item.get("evidence")
        normalized_evidence: list[dict[str, Any]] = []
        if not isinstance(evidence_raw, list) or not evidence_raw:
            errors.append(f"{label}:evidence")
            evidence_raw = []
        for offset, evidence in enumerate(evidence_raw):
            if not isinstance(evidence, dict) or set(evidence) != EVIDENCE_KEYS:
                errors.append(f"{label}:evidence:{offset}:keys")
                continue
            start, end = evidence.get("line_start"), evidence.get("line_end")
            if (
                evidence.get("path") != assignment["document_path"]
                or evidence.get("source_sha256") != assignment["source_sha256"]
                or not isinstance(start, int) or not isinstance(end, int) or start > end
                or not any(a <= start <= end <= b for a, b in assigned_ranges)
            ):
                errors.append(f"{label}:evidence:{offset}:binding")
                continue
            exact = "".join(source_lines[start - 1 : end]).strip()
            if not exact:
                errors.append(f"{label}:evidence:{offset}:blank_source")
                continue
            normalized_evidence.append({
                "path": assignment["document_path"], "line_start": start, "line_end": end,
                "exact_quote": exact, "source_sha256": assignment["source_sha256"],
            })
        builder_value = item.get("builder_discretion")
        if not nonempty(builder_value):
            errors.append(f"{label}:builder_discretion")
        normalized_items.append({
            "item_id": item.get("item_id"),
            "item_type": item_type,
            "title": item.get("title"),
            "statement": item.get("statement"),
            "severity": severity,
            "confidence": confidence,
            "gap_kind": item.get("gap_kind"),
            "impact": item.get("impact"),
            "builder_discretion": builder_value != "none",
            "dimensions": dims,
            "source_unit_refs": refs,
            "evidence": normalized_evidence,
        })
    if all_refs != valid_refs:
        errors.append("rich_item_source_unit_union")

    normalized_segments: list[dict[str, Any]] = []
    segment_item_ids: set[str] = set()
    for index, segment in enumerate(segments_raw):
        label = f"rich_segment:{index}"
        if not isinstance(segment, dict) or set(segment) != RICH_SEGMENT_KEYS:
            errors.append(f"{label}:key_set")
            continue
        expected = capsule_by_id.get(segment.get("window_id"))
        if expected is None:
            continue
        if segment.get("core_range") != expected["core_range"] or segment.get("core_sha256") != expected["core_sha256"]:
            errors.append(f"{label}:core_binding")
        expected_lines = expected["core_range"][1] - expected["core_range"][0] + 1
        if segment.get("core_lines_reviewed") != expected_lines:
            errors.append(f"{label}:line_count")
        if segment.get("required_source_unit_refs") != expected["required_source_unit_refs"]:
            errors.append(f"{label}:source_refs")
        exact_lens, adversarial_lens = segment.get("exact_behavior_lens"), segment.get("adversarial_negative_space_lens")
        if not nonempty(exact_lens) or not nonempty(adversarial_lens):
            errors.append(f"{label}:lens_summary")
        ids = segment.get("item_ids")
        if not isinstance(ids, list) or not ids or len(ids) != len(set(ids)) or not set(ids) <= item_id_set:
            errors.append(f"{label}:item_ids")
            ids = []
        segment_item_ids.update(ids)
        normalized_segments.append({
            "window_id": segment.get("window_id"),
            "core_range": expected["core_range"],
            "reviewed": True,
            "covered_source_unit_refs": expected["required_source_unit_refs"],
            "item_ids": ids,
            "summary": f"Exact lens: {exact_lens}\nAdversarial lens: {adversarial_lens}",
        })
    if segment_item_ids != item_id_set:
        errors.append("rich_segment_item_union")
    if not isinstance(raw.get("synthesis"), dict):
        errors.append("rich_synthesis_not_object")
    if errors:
        return None, sorted(set(errors))

    normalized = {
        **expected_top,
        "source_binding": {
            "bundle_id": assignment["bundle_id"],
            "document_path": assignment["document_path"],
            "source_sha256": assignment["source_sha256"],
            "micro_window_ids": assignment["micro_window_ids"],
        },
        "coverage": {
            "all_source_lines_reviewed": True,
            "all_micro_windows_reviewed": True,
            "all_source_units_accounted": True,
            "both_exact_and_adversarial_lenses_applied": True,
            "dimensions_checked": DIMENSIONS,
        },
        "segments": normalized_segments,
        "items": normalized_items,
        "synthesis": {"feature_family_keys": [], "cross_document_questions": [], "research_queries": []},
        "self_attestation": {
            "no_prior_audit_access": True,
            "no_peer_result_access": True,
            "no_unrelated_source_access": True,
            "no_external_research_during_blind_review": True,
            "no_canonical_writes": True,
            "terminal_after_submission": True,
        },
    }
    validation = validate_result_bytes(canonical_json(normalized), assignment=assignment, capsule=capsule, receipt=receipt)
    if validation["state"] != "eligible":
        return None, [f"normalized_self_validation:{error}" for error in validation["errors"]]
    return normalized, []


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--batch-id", required=True)
    parser.add_argument("--assignment-id", action="append", default=[])
    args = parser.parse_args()
    batch = MACRO_ROOT / "batches" / args.batch_id
    authority = load_obj(batch / "batch_authority.json")
    epoch = MACRO_ROOT / "frozen" / authority["epoch_id"]
    rows = load_jsonl(batch / "batch_manifest.jsonl")
    requested = set(args.assignment_id)
    if requested and not requested <= {row["assignment_id"] for row in rows}:
        raise RuntimeError("normalization request contains unknown assignment")
    report: list[dict[str, Any]] = []
    self_path = Path(__file__).resolve()
    for assignment in rows:
        assignment_id = assignment["assignment_id"]
        if requested and assignment_id not in requested:
            continue
        output = ROOT / assignment["output_directory"]
        raw_path, file_errors = result_file(output)
        if raw_path is None:
            report.append({"assignment_id": assignment_id, "state": "not_ready", "errors": file_errors})
            continue
        dispatch_path = (
            MACRO_ROOT / "dispatch" / args.batch_id / assignment_id / assignment["attempt_id"] / "dispatch_receipt.json"
        )
        if not dispatch_path.is_file():
            report.append({"assignment_id": assignment_id, "state": "rejected", "errors": ["dispatch_receipt_missing"]})
            continue
        dispatch = load_obj(dispatch_path)
        capsule = load_obj(epoch / assignment["capsule_ref"])
        direct = validate_result_bytes(raw_path.read_bytes(), assignment=assignment, capsule=capsule, receipt=dispatch)
        if direct["state"] == "eligible":
            report.append({"assignment_id": assignment_id, "state": "already_canonical", "errors": []})
            continue
        normalized, errors = normalize_payload(
            raw_path.read_bytes(), assignment=assignment, capsule=capsule, receipt=dispatch
        )
        if normalized is None:
            report.append({"assignment_id": assignment_id, "state": "not_normalizable", "errors": errors})
            continue
        normalization_dir = (
            MACRO_ROOT / "normalizations" / args.batch_id / assignment_id / assignment["attempt_id"]
        )
        normalized_path = normalization_dir / "result.json"
        write_obj(normalized_path, normalized, immutable=True)
        receipt = {
            "audit_id": AUDIT_ID,
            "schema_version": "macro-normalization-receipt-v1",
            "batch_id": args.batch_id,
            "assignment_id": assignment_id,
            "attempt_id": assignment["attempt_id"],
            "status": "mechanically_normalized_zero_credit",
            "raw_result_ref": raw_path.relative_to(ROOT).as_posix(),
            "raw_result_sha256": sha(raw_path.read_bytes()),
            "normalized_result_ref": normalized_path.relative_to(ROOT).as_posix(),
            "normalized_result_sha256": sha(normalized_path.read_bytes()),
            "normalizer_ref": self_path.relative_to(ROOT).as_posix(),
            "normalizer_sha256": sha(self_path.read_bytes()),
            "dispatch_receipt_sha256": sha(dispatch_path.read_bytes()),
            "capsule_sha256": assignment["capsule_sha256"],
            "semantic_fields_added": False,
            "coverage_credit_before_dual_validation": 0,
        }
        write_obj(normalization_dir / "normalization_receipt.json", receipt, immutable=True)
        report.append({
            "assignment_id": assignment_id,
            "state": "normalized_zero_credit",
            "errors": [],
            "raw_result_sha256": receipt["raw_result_sha256"],
            "normalized_result_sha256": receipt["normalized_result_sha256"],
        })
    counts: dict[str, int] = {}
    for row in report:
        counts[row["state"]] = counts.get(row["state"], 0) + 1
    print(json.dumps({"batch_id": args.batch_id, "counts": counts, "results": report}, indent=2, sort_keys=True))


if __name__ == "__main__":
    main()
