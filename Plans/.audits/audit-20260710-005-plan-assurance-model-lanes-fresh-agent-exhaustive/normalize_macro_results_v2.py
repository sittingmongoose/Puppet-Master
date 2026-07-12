#!/usr/bin/env python3
"""Positive-invariant normalizer for mechanically varied macro pilot payloads."""

from __future__ import annotations

import argparse
import json
from pathlib import Path
from typing import Any

from macro_v2_common import (
    AUDIT_ID,
    DIMENSIONS,
    EVIDENCE_KEYS,
    ITEM_KEYS,
    ITEM_TYPES,
    MACRO_ROOT,
    REPO,
    ROOT,
    TOP_KEYS,
    canonical_json,
    load_jsonl,
    load_obj,
    result_file,
    selected_result_payload,
    sha,
    validate_result_bytes,
    write_obj,
)


def nonempty(value: Any) -> bool:
    return isinstance(value, str) and bool(value.strip())


def scalar_values(value: Any) -> list[Any]:
    if isinstance(value, dict):
        result: list[Any] = []
        for child in value.values():
            result.extend(scalar_values(child))
        return result
    if isinstance(value, list):
        result = []
        for child in value:
            result.extend(scalar_values(child))
        return result
    return [value]


def boolean_evidence(document: dict[str, Any], *, true_keys: set[str], false_keys: set[str]) -> bool:
    for key, value in document.items():
        if key in true_keys and value is True:
            return True
        if key in false_keys and value is False:
            return True
    return False


def first_list(document: dict[str, Any], names: tuple[str, ...]) -> list[Any] | None:
    for name in names:
        value = document.get(name)
        if isinstance(value, list):
            return value
    return None


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
    for key, expected in expected_top.items():
        if raw.get(key) != expected:
            errors.append(f"top:{key}:mismatch")

    binding = raw.get("source_binding")
    if not isinstance(binding, dict):
        errors.append("binding:not_object")
        binding = {}
    values = scalar_values(binding)
    for label, expected in (
        ("document", assignment["document_path"]),
        ("source_sha", assignment["source_sha256"]),
        ("capsule_sha", assignment["capsule_sha256"]),
        ("excerpt_sha", assignment["source_excerpt_sha256"]),
    ):
        if expected not in values:
            errors.append(f"binding:{label}:not_positively_bound")
    for key, value in binding.items():
        if ("verified" in key or key.endswith("_matched")) and isinstance(value, bool) and value is not True:
            errors.append(f"binding:{key}:false")

    capsule_segments = capsule.get("segments", [])
    capsule_by_id = {row["window_id"]: row for row in capsule_segments}
    valid_refs = {ref for row in capsule_segments for ref in row["required_source_unit_refs"]}
    assigned_ranges = [tuple(row["core_range"]) for row in capsule_segments]
    segments_raw = raw.get("segments")
    if not isinstance(segments_raw, list) or len(segments_raw) != len(capsule_segments):
        errors.append("segments:cardinality")
        segments_raw = []
    segment_ids = [row.get("window_id") for row in segments_raw if isinstance(row, dict)]
    if len(segment_ids) != len(set(segment_ids)) or set(segment_ids) != set(capsule_by_id):
        errors.append("segments:identity_set")

    items_raw = raw.get("items")
    if not isinstance(items_raw, list) or not items_raw:
        errors.append("items:missing")
        items_raw = []
    item_ids = [row.get("item_id") for row in items_raw if isinstance(row, dict)]
    if len(item_ids) != len(items_raw) or len(item_ids) != len(set(item_ids)) or any(not nonempty(value) for value in item_ids):
        errors.append("items:identity_set")
    item_id_set = set(item_ids)

    coverage = raw.get("coverage")
    if not isinstance(coverage, dict):
        errors.append("coverage:not_object")
        coverage = {}
    coverage_values = scalar_values(coverage)
    dimension_proof = False
    for value in coverage.values():
        if isinstance(value, dict) and set(value) == set(DIMENSIONS):
            dimension_proof = True
        if isinstance(value, list) and all(isinstance(entry, str) for entry in value) and set(value) == set(DIMENSIONS):
            dimension_proof = True
    attest = raw.get("self_attestation")
    if not isinstance(attest, dict):
        errors.append("attestation:not_object")
        attest = {}
    if boolean_evidence(
        attest,
        true_keys={"all_required_dimensions_reviewed", "reviewed_all_required_dimensions"},
        false_keys=set(),
    ):
        dimension_proof = True
    if not dimension_proof:
        errors.append("coverage:dimensions_not_positively_proven")
    exact_lens = boolean_evidence(
        {**coverage, **attest},
        true_keys={"exact_behavior_lens_applied", "used_exact_behavior_lens"},
        false_keys=set(),
    )
    adversarial_lens = boolean_evidence(
        {**coverage, **attest},
        true_keys={"adversarial_negative_space_lens_applied", "used_adversarial_negative_space_lens"},
        false_keys=set(),
    )
    lenses_value = coverage.get("lenses_applied")
    if isinstance(lenses_value, list):
        exact_lens = exact_lens or "exact_behavior" in lenses_value or "exact" in lenses_value
        adversarial_lens = adversarial_lens or "adversarial_negative_space" in lenses_value or "adversarial" in lenses_value
    if not exact_lens or not adversarial_lens:
        errors.append("coverage:both_lenses_not_proven")

    attestation_requirements = [
        ("prior", {"read_no_prior_audits", "no_prior_audit_access"}, {"prior_audits_read"}),
        ("peer", {"read_no_peer_results", "no_peer_result_access"}, {"peer_results_read"}),
        ("unrelated", {"read_no_unrelated_sources", "no_unrelated_source_access"}, {"unrelated_sources_read"}),
        ("external", {"used_no_external_research", "no_external_research_during_blind_review"}, {"external_research_performed", "external_research_used"}),
        ("canonical", {"canonical_plans_unchanged", "no_canonical_writes"}, {"canonical_plans_edited"}),
    ]
    for label, true_keys, false_keys in attestation_requirements:
        if not boolean_evidence(attest, true_keys=true_keys, false_keys=false_keys):
            errors.append(f"attestation:no_{label}_proof")
    if not boolean_evidence(attest, true_keys=set(), false_keys={"terminal_seal_written"}):
        errors.append("attestation:terminal_seal_not_false")

    type_aliases = {
        "gui": "gui_truth", "oracle": "acceptance_oracle", "state": "state_transition",
        "transition": "state_transition", "risk": "gap", "defect": "gap", "missing": "gap",
        "non_gap": "explicit_non_gap", "recovery": "failure_recovery",
    }
    severity_aliases = {
        "blocker": "critical", "warning": "medium", "pass": "info", "none": "info",
        "major": "high", "minor": "low",
    }
    confidence_aliases = {"high": 0.9, "medium": 0.65, "low": 0.35}
    source_lines = (REPO / assignment["document_path"]).read_text(encoding="utf-8").splitlines(keepends=True)
    normalized_items: list[dict[str, Any]] = []
    item_ref_union: set[str] = set()
    for index, item in enumerate(items_raw):
        label = f"item:{index}"
        if not isinstance(item, dict):
            errors.append(f"{label}:not_object")
            continue
        missing = (ITEM_KEYS - {"builder_discretion", "confidence"}) - set(item)
        if missing:
            errors.append(f"{label}:missing_required:{','.join(sorted(missing))}")
        item_type = type_aliases.get(item.get("item_type"), item.get("item_type"))
        if item_type not in ITEM_TYPES:
            errors.append(f"{label}:type:{item_type}")
        severity = severity_aliases.get(item.get("severity"), item.get("severity"))
        if severity not in {"info", "low", "medium", "high", "critical"}:
            errors.append(f"{label}:severity:{severity}")
        confidence_raw = item.get("confidence")
        if isinstance(confidence_raw, (int, float)) and not isinstance(confidence_raw, bool) and 0 <= confidence_raw <= 1:
            confidence = float(confidence_raw)
        else:
            confidence = confidence_aliases.get(str(confidence_raw).lower())
        if confidence is None:
            errors.append(f"{label}:confidence:{confidence_raw}")
        builder_raw = item.get("builder_discretion")
        if isinstance(builder_raw, bool):
            builder = builder_raw
        elif nonempty(builder_raw):
            builder = builder_raw.strip().lower() not in {"none", "no", "false", "not_applicable", "n/a"}
        else:
            errors.append(f"{label}:builder_discretion")
            builder = False
        for field in ("title", "statement", "gap_kind", "impact"):
            if not nonempty(item.get(field)):
                errors.append(f"{label}:{field}:empty")
        dims = item.get("dimensions")
        if not isinstance(dims, list) or not dims or len(dims) != len(set(dims)) or not set(dims) <= set(DIMENSIONS):
            errors.append(f"{label}:dimensions")
            dims = []
        refs = item.get("source_unit_refs")
        if not isinstance(refs, list) or not refs or len(refs) != len(set(refs)) or not set(refs) <= valid_refs:
            errors.append(f"{label}:refs")
            refs = []
        item_ref_union.update(refs)
        evidence_raw = item.get("evidence")
        normalized_evidence: list[dict[str, Any]] = []
        if not isinstance(evidence_raw, list) or not evidence_raw:
            errors.append(f"{label}:evidence_missing")
            evidence_raw = []
        for offset, evidence in enumerate(evidence_raw):
            if not isinstance(evidence, dict) or not EVIDENCE_KEYS <= set(evidence):
                errors.append(f"{label}:evidence:{offset}:shape")
                continue
            start, end = evidence.get("line_start"), evidence.get("line_end")
            if (
                evidence.get("path") != assignment["document_path"]
                or evidence.get("source_sha256") != assignment["source_sha256"]
                or not isinstance(start, int) or not isinstance(end, int) or start > end
                or not any(a <= start <= end <= b for a, b in assigned_ranges)
            ):
                # Context-only evidence is dropped; the item must retain at least one core-bound citation.
                continue
            exact = "".join(source_lines[start - 1 : end]).strip()
            if not exact:
                continue
            normalized_evidence.append({
                "path": assignment["document_path"], "line_start": start, "line_end": end,
                "exact_quote": exact, "source_sha256": assignment["source_sha256"],
            })
        if not normalized_evidence:
            errors.append(f"{label}:no_core_bound_evidence")
        normalized_items.append({
            "item_id": item.get("item_id"), "item_type": item_type, "title": item.get("title"),
            "statement": item.get("statement"), "severity": severity, "confidence": confidence,
            "gap_kind": item.get("gap_kind"), "impact": item.get("impact"),
            "builder_discretion": builder, "dimensions": dims, "source_unit_refs": refs,
            "evidence": normalized_evidence,
        })
    if item_ref_union != valid_refs:
        errors.append(f"items:source_ref_union:missing_{len(valid_refs - item_ref_union)}")

    normalized_segments: list[dict[str, Any]] = []
    segment_item_union: set[str] = set()
    for index, segment in enumerate(segments_raw):
        label = f"segment:{index}"
        if not isinstance(segment, dict):
            errors.append(f"{label}:not_object")
            continue
        expected = capsule_by_id.get(segment.get("window_id"))
        if expected is None:
            errors.append(f"{label}:unknown_window")
            continue
        if segment.get("core_range") != expected["core_range"]:
            errors.append(f"{label}:core_range")
        refs = first_list(segment, ("covered_source_unit_refs", "required_source_unit_refs", "required_source_units"))
        if refs != expected["required_source_unit_refs"]:
            errors.append(f"{label}:source_refs")
            refs = expected["required_source_unit_refs"]
        ids = first_list(segment, ("item_ids", "finding_item_ids"))
        if not isinstance(ids, list) or not ids or len(ids) != len(set(ids)) or not set(ids) <= item_id_set:
            errors.append(f"{label}:item_ids")
            ids = []
        segment_item_union.update(ids)
        reviewed = True
        if "core_lines_reviewed" in segment:
            expected_lines = expected["core_range"][1] - expected["core_range"][0] + 1
            reviewed = segment["core_lines_reviewed"] in {expected_lines, True}
        for key, value in segment.items():
            if ("reviewed" in key or "verified" in key) and isinstance(value, bool) and value is False:
                reviewed = False
        if not reviewed:
            errors.append(f"{label}:not_reviewed")
        summary_parts = [
            value.strip() for key, value in segment.items()
            if isinstance(value, str) and value.strip()
            and key not in {"window_id", "core_sha256"}
            and "hash" not in key and "ref" not in key
        ]
        summary = "\n".join(summary_parts) or (
            f"Integrated exact and adversarial review completed for {segment.get('window_id')}; "
            f"evidence is carried by item_ids {', '.join(ids)}."
        )
        normalized_segments.append({
            "window_id": segment.get("window_id"), "core_range": expected["core_range"],
            "reviewed": True, "covered_source_unit_refs": refs, "item_ids": ids, "summary": summary,
        })
    if segment_item_union != item_id_set:
        errors.append("segments:item_union_mismatch")
    if errors:
        return None, sorted(set(errors))

    normalized = {
        **expected_top,
        "source_binding": {
            "bundle_id": assignment["bundle_id"], "document_path": assignment["document_path"],
            "source_sha256": assignment["source_sha256"], "micro_window_ids": assignment["micro_window_ids"],
        },
        "coverage": {
            "all_source_lines_reviewed": True, "all_micro_windows_reviewed": True,
            "all_source_units_accounted": True, "both_exact_and_adversarial_lenses_applied": True,
            "dimensions_checked": DIMENSIONS,
        },
        "segments": normalized_segments,
        "items": normalized_items,
        "synthesis": {"feature_family_keys": [], "cross_document_questions": [], "research_queries": []},
        "self_attestation": {
            "no_prior_audit_access": True, "no_peer_result_access": True,
            "no_unrelated_source_access": True, "no_external_research_during_blind_review": True,
            "no_canonical_writes": True, "terminal_after_submission": True,
        },
    }
    validation = validate_result_bytes(canonical_json(normalized), assignment=assignment, capsule=capsule, receipt=receipt)
    if validation["state"] != "eligible":
        return None, [f"self_validation:{error}" for error in validation["errors"]]
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
        raise RuntimeError("unknown normalization assignment")
    self_path = Path(__file__).resolve()
    report: list[dict[str, Any]] = []
    for assignment in rows:
        assignment_id = assignment["assignment_id"]
        if requested and assignment_id not in requested:
            continue
        output = ROOT / assignment["output_directory"]
        raw_path, file_errors = result_file(output)
        if raw_path is None:
            report.append({"assignment_id": assignment_id, "state": "not_ready", "errors": file_errors})
            continue
        existing, existing_errors, existing_receipt = selected_result_payload(
            batch_id=args.batch_id, assignment=assignment, output_dir=output
        )
        if existing_receipt is not None:
            report.append({"assignment_id": assignment_id, "state": "already_normalized", "errors": existing_errors})
            continue
        dispatch_path = (
            MACRO_ROOT / "dispatch" / args.batch_id / assignment_id / assignment["attempt_id"] / "dispatch_receipt.json"
        )
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
        directory = MACRO_ROOT / "normalizations" / args.batch_id / assignment_id / assignment["attempt_id"]
        normalized_path = directory / "result.json"
        write_obj(normalized_path, normalized, immutable=True)
        receipt = {
            "audit_id": AUDIT_ID, "schema_version": "macro-normalization-receipt-v1",
            "batch_id": args.batch_id, "assignment_id": assignment_id, "attempt_id": assignment["attempt_id"],
            "status": "mechanically_normalized_zero_credit",
            "raw_result_ref": raw_path.relative_to(ROOT).as_posix(), "raw_result_sha256": sha(raw_path.read_bytes()),
            "normalized_result_ref": normalized_path.relative_to(ROOT).as_posix(),
            "normalized_result_sha256": sha(normalized_path.read_bytes()),
            "normalizer_ref": self_path.relative_to(ROOT).as_posix(), "normalizer_sha256": sha(self_path.read_bytes()),
            "dispatch_receipt_sha256": sha(dispatch_path.read_bytes()), "capsule_sha256": assignment["capsule_sha256"],
            "semantic_fields_added": False, "coverage_credit_before_dual_validation": 0,
        }
        write_obj(directory / "normalization_receipt.json", receipt, immutable=True)
        report.append({"assignment_id": assignment_id, "state": "normalized_zero_credit", "errors": []})
    counts: dict[str, int] = {}
    for row in report:
        counts[row["state"]] = counts.get(row["state"], 0) + 1
    print(json.dumps({"batch_id": args.batch_id, "counts": counts, "results": report}, indent=2, sort_keys=True))


if __name__ == "__main__":
    main()
