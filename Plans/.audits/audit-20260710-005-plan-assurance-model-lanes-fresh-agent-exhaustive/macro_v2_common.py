#!/usr/bin/env python3
"""Shared, deliberately small contracts for Audit 005 macro-review v2."""

from __future__ import annotations

import hashlib
import json
import os
import stat
from pathlib import Path
from typing import Any, Iterable


ROOT = Path(__file__).resolve().parent
REPO = ROOT.parents[2]
AUDIT_ID = ROOT.name
MACRO_ROOT = ROOT / "master" / "macro"
TOTAL_MICRO_WINDOWS = 1269
GLOBAL_CONCURRENCY = 24
MAX_BUNDLE_TOKENS = 48_000
MAX_BUNDLE_WINDOWS = 8
CONTEXT_LINES = 12

DIMENSIONS = [
    "behavior",
    "capabilities",
    "inputs_outputs",
    "contracts",
    "states_transitions",
    "authority",
    "ownership",
    "consumers",
    "gui_truth",
    "failures_recovery",
    "security_privacy",
    "propagation",
    "operations",
    "scale_performance",
    "compatibility_migration",
    "acceptance_oracles",
    "builder_discretion",
    "ambiguity_unknowns",
    "missing_callers_consumers",
    "invalid_states_transitions",
    "concurrency_races",
    "partial_failure",
    "recovery_rollback",
    "authority_boundaries",
    "privacy_data_lifecycle",
    "untrusted_inputs",
    "gui_misleading_states",
    "offline_network_loss",
    "scale_limits",
    "accessibility",
    "localization",
    "observability_support",
    "destructive_actions",
    "cross_document_seams",
    "test_falsifiability",
    "unknown_unknowns",
]

ITEM_TYPES = {
    "feature",
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

TOP_KEYS = {
    "audit_id",
    "schema_version",
    "phase",
    "assignment_id",
    "attempt_id",
    "task_thread_id",
    "model",
    "reasoning_effort",
    "status",
    "source_binding",
    "coverage",
    "segments",
    "items",
    "synthesis",
    "self_attestation",
}
SOURCE_KEYS = {"bundle_id", "document_path", "source_sha256", "micro_window_ids"}
COVERAGE_KEYS = {
    "all_source_lines_reviewed",
    "all_micro_windows_reviewed",
    "all_source_units_accounted",
    "both_exact_and_adversarial_lenses_applied",
    "dimensions_checked",
}
SEGMENT_KEYS = {
    "window_id",
    "core_range",
    "reviewed",
    "covered_source_unit_refs",
    "item_ids",
    "summary",
}
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
    "dimensions",
    "source_unit_refs",
    "evidence",
}
EVIDENCE_KEYS = {"path", "line_start", "line_end", "exact_quote", "source_sha256"}
SYNTHESIS_KEYS = {"feature_family_keys", "cross_document_questions", "research_queries"}
ATTESTATION_KEYS = {
    "no_prior_audit_access",
    "no_peer_result_access",
    "no_unrelated_source_access",
    "no_external_research_during_blind_review",
    "no_canonical_writes",
    "terminal_after_submission",
}


def sha(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def canonical_json(value: Any) -> bytes:
    return (json.dumps(value, indent=2, sort_keys=True) + "\n").encode()


def load_obj(path: Path) -> dict[str, Any]:
    value = json.loads(path.read_bytes())
    if not isinstance(value, dict):
        raise ValueError(f"object required: {path}")
    return value


def load_jsonl(path: Path) -> list[dict[str, Any]]:
    rows: list[dict[str, Any]] = []
    for number, raw in enumerate(path.read_bytes().splitlines(), 1):
        if not raw.strip():
            continue
        value = json.loads(raw)
        if not isinstance(value, dict):
            raise ValueError(f"object required: {path}:{number}")
        rows.append(value)
    return rows


def write_obj(path: Path, value: Any, *, immutable: bool = False) -> None:
    data = canonical_json(value)
    if immutable and path.exists():
        if path.read_bytes() != data:
            raise RuntimeError(f"immutable artifact differs: {path}")
        return
    path.parent.mkdir(parents=True, exist_ok=True)
    temp = path.with_name(path.name + f".tmp.{os.getpid()}")
    temp.write_bytes(data)
    os.replace(temp, path)


def write_jsonl(path: Path, rows: Iterable[dict[str, Any]]) -> None:
    payload = b"\n".join(
        json.dumps(row, sort_keys=True, separators=(",", ":")).encode() for row in rows
    ) + b"\n"
    path.parent.mkdir(parents=True, exist_ok=True)
    temp = path.with_name(path.name + f".tmp.{os.getpid()}")
    temp.write_bytes(payload)
    os.replace(temp, path)


def root_hash(paths: Iterable[Path], base: Path) -> str:
    records = []
    for path in sorted(paths):
        records.append(
            f"{path.relative_to(base).as_posix()}\0{sha(path.read_bytes())}\0{path.stat().st_size}\n"
        )
    return sha("".join(records).encode())


def exact_keys(value: Any, expected: set[str], prefix: str) -> list[str]:
    if not isinstance(value, dict):
        return [f"{prefix}:object_required"]
    errors: list[str] = []
    extra = sorted(set(value) - expected)
    missing = sorted(expected - set(value))
    if extra:
        errors.append(f"{prefix}:extra_keys:{','.join(extra)}")
    if missing:
        errors.append(f"{prefix}:missing_keys:{','.join(missing)}")
    return errors


def nonempty(value: Any) -> bool:
    return isinstance(value, str) and bool(value.strip())


def result_file(output_dir: Path) -> tuple[Path | None, list[str]]:
    """Accept exactly one regular JSON payload; filename is intentionally irrelevant."""
    if not output_dir.is_dir():
        return None, ["output_directory_missing"]
    entries = sorted(output_dir.iterdir())
    errors: list[str] = []
    candidates: list[Path] = []
    for path in entries:
        if path.is_symlink():
            errors.append(f"output_symlink_forbidden:{path.name}")
            continue
        mode = path.stat().st_mode
        if not stat.S_ISREG(mode):
            errors.append(f"output_nonregular_forbidden:{path.name}")
            continue
        if path.suffix.lower() != ".json":
            errors.append(f"output_nonjson_forbidden:{path.name}")
            continue
        candidates.append(path)
    if len(candidates) != 1:
        errors.append(f"expected_exactly_one_json_payload:found_{len(candidates)}")
        return None, errors
    if candidates[0].stat().st_size > 2_000_000:
        errors.append("result_payload_exceeds_2mb")
    return candidates[0], errors


def selected_result_payload(
    *, batch_id: str, assignment: dict[str, Any], output_dir: Path
) -> tuple[Path | None, list[str], dict[str, Any] | None]:
    """Select raw output or a hash-bound deterministic normalization capture."""
    raw_path, errors = result_file(output_dir)
    normalization_dir = (
        MACRO_ROOT / "normalizations" / batch_id / assignment["assignment_id"] / assignment["attempt_id"]
    )
    receipt_path = normalization_dir / "normalization_receipt.json"
    normalized_path = normalization_dir / "result.json"
    if not receipt_path.exists() and not normalized_path.exists():
        return raw_path, errors, None
    if not receipt_path.is_file() or not normalized_path.is_file():
        return None, errors + ["normalization_capture_incomplete"], None
    try:
        receipt = load_obj(receipt_path)
    except Exception as exc:
        return None, errors + [f"normalization_receipt_parse:{type(exc).__name__}"], None
    expected_keys = {
        "audit_id", "schema_version", "batch_id", "assignment_id", "attempt_id", "status",
        "raw_result_ref", "raw_result_sha256", "normalized_result_ref", "normalized_result_sha256",
        "normalizer_ref", "normalizer_sha256", "dispatch_receipt_sha256", "capsule_sha256",
        "semantic_fields_added", "coverage_credit_before_dual_validation",
    }
    if set(receipt) != expected_keys:
        errors.append("normalization_receipt_key_set_mismatch")
    if raw_path is None:
        errors.append("normalization_raw_payload_missing")
    else:
        if receipt.get("raw_result_ref") != raw_path.relative_to(ROOT).as_posix():
            errors.append("normalization_raw_ref_mismatch")
        if receipt.get("raw_result_sha256") != sha(raw_path.read_bytes()):
            errors.append("normalization_raw_sha_mismatch")
    expected = {
        "audit_id": AUDIT_ID,
        "schema_version": "macro-normalization-receipt-v1",
        "batch_id": batch_id,
        "assignment_id": assignment["assignment_id"],
        "attempt_id": assignment["attempt_id"],
        "status": "mechanically_normalized_zero_credit",
        "normalized_result_ref": normalized_path.relative_to(ROOT).as_posix(),
        "normalized_result_sha256": sha(normalized_path.read_bytes()),
        "capsule_sha256": assignment["capsule_sha256"],
        "semantic_fields_added": False,
        "coverage_credit_before_dual_validation": 0,
    }
    for key, value in expected.items():
        if receipt.get(key) != value:
            errors.append(f"normalization_receipt:{key}:mismatch")
    normalizer = ROOT / str(receipt.get("normalizer_ref"))
    if not normalizer.is_file() or sha(normalizer.read_bytes()) != receipt.get("normalizer_sha256"):
        errors.append("normalizer_hash_mismatch")
    dispatch = (
        MACRO_ROOT / "dispatch" / batch_id / assignment["assignment_id"]
        / assignment["attempt_id"] / "dispatch_receipt.json"
    )
    if not dispatch.is_file() or sha(dispatch.read_bytes()) != receipt.get("dispatch_receipt_sha256"):
        errors.append("normalization_dispatch_receipt_hash_mismatch")
    return (normalized_path if not errors else None), errors, receipt


def source_unit_refs(segment: dict[str, Any]) -> list[str]:
    return (
        [f"PLANUNIT:{value}" for value in segment.get("plan_unit_ids", [])]
        + [f"SEMANTIC:{value}" for value in segment.get("semantic_block_ids", [])]
        + [f"STRUCTURAL:{value}" for value in segment.get("structural_paths", [])]
    )


def validate_result_bytes(
    result_bytes: bytes,
    *,
    assignment: dict[str, Any],
    capsule: dict[str, Any],
    receipt: dict[str, Any],
) -> dict[str, Any]:
    errors: list[str] = []
    try:
        result = json.loads(result_bytes)
    except Exception as exc:
        return {"state": "rejected", "errors": [f"json_parse:{type(exc).__name__}"]}
    errors += exact_keys(result, TOP_KEYS, "result")
    if not isinstance(result, dict):
        return {"state": "rejected", "errors": errors}

    expected_scalars = {
        "audit_id": AUDIT_ID,
        "schema_version": "macro-review-result-v1",
        "phase": "blind_macro_window_review",
        "assignment_id": assignment["assignment_id"],
        "attempt_id": assignment["attempt_id"],
        "task_thread_id": receipt.get("agent_path"),
        "model": "gpt-5.6-sol",
        "reasoning_effort": "xhigh",
        "status": "completed",
    }
    for key, expected in expected_scalars.items():
        if result.get(key) != expected:
            errors.append(f"{key}:expected:{expected!r}")

    binding = result.get("source_binding")
    errors += exact_keys(binding, SOURCE_KEYS, "source_binding")
    if isinstance(binding, dict):
        expected_binding = {
            "bundle_id": assignment["bundle_id"],
            "document_path": assignment["document_path"],
            "source_sha256": assignment["source_sha256"],
            "micro_window_ids": assignment["micro_window_ids"],
        }
        for key, expected in expected_binding.items():
            if binding.get(key) != expected:
                errors.append(f"source_binding:{key}:mismatch")

    coverage = result.get("coverage")
    errors += exact_keys(coverage, COVERAGE_KEYS, "coverage")
    if isinstance(coverage, dict):
        for key in COVERAGE_KEYS - {"dimensions_checked"}:
            if coverage.get(key) is not True:
                errors.append(f"coverage:{key}:must_be_true")
        if coverage.get("dimensions_checked") != DIMENSIONS:
            errors.append("coverage:dimensions_checked:mismatch")

    capsule_segments = capsule.get("segments", [])
    expected_segments = {row["window_id"]: row for row in capsule_segments}
    raw_segments = result.get("segments")
    if not isinstance(raw_segments, list):
        errors.append("segments:list_required")
        raw_segments = []
    if len(raw_segments) != len(expected_segments):
        errors.append("segments:cardinality_mismatch")
    segment_ids = [row.get("window_id") for row in raw_segments if isinstance(row, dict)]
    if len(segment_ids) != len(set(segment_ids)) or set(segment_ids) != set(expected_segments):
        errors.append("segments:identity_set_mismatch")

    raw_items = result.get("items")
    if not isinstance(raw_items, list) or not raw_items:
        errors.append("items:nonempty_list_required")
        raw_items = []
    item_by_id: dict[str, dict[str, Any]] = {}
    all_item_refs: set[str] = set()
    all_segment_item_ids: set[str] = set()
    assigned_ranges = [tuple(row["core_range"]) for row in capsule_segments]
    valid_refs = {ref for row in capsule_segments for ref in row["required_source_unit_refs"]}
    source_lines = (REPO / assignment["document_path"]).read_text(encoding="utf-8").splitlines(keepends=True)

    for index, item in enumerate(raw_items):
        prefix = f"item:{index}"
        errors += exact_keys(item, ITEM_KEYS, prefix)
        if not isinstance(item, dict):
            continue
        item_id = item.get("item_id")
        if not nonempty(item_id) or item_id in item_by_id:
            errors.append(f"{prefix}:invalid_or_duplicate_item_id")
            continue
        item_by_id[item_id] = item
        if item.get("item_type") not in ITEM_TYPES:
            errors.append(f"{prefix}:invalid_item_type")
        for key in ("title", "statement", "gap_kind", "impact"):
            if not nonempty(item.get(key)):
                errors.append(f"{prefix}:{key}:empty")
        if item.get("severity") not in {"info", "low", "medium", "high", "critical"}:
            errors.append(f"{prefix}:invalid_severity")
        confidence = item.get("confidence")
        if not isinstance(confidence, (int, float)) or isinstance(confidence, bool) or not 0 <= confidence <= 1:
            errors.append(f"{prefix}:invalid_confidence")
        if not isinstance(item.get("builder_discretion"), bool):
            errors.append(f"{prefix}:builder_discretion_boolean_required")
        dimensions = item.get("dimensions")
        if not isinstance(dimensions, list) or not dimensions or len(dimensions) != len(set(dimensions)):
            errors.append(f"{prefix}:invalid_dimensions")
        elif any(value not in DIMENSIONS for value in dimensions):
            errors.append(f"{prefix}:unknown_dimension")
        refs = item.get("source_unit_refs")
        if not isinstance(refs, list) or not refs or len(refs) != len(set(refs)):
            errors.append(f"{prefix}:invalid_source_unit_refs")
            refs = []
        if any(ref not in valid_refs for ref in refs):
            errors.append(f"{prefix}:unassigned_source_unit_ref")
        all_item_refs.update(refs)
        evidence = item.get("evidence")
        if not isinstance(evidence, list) or not evidence:
            errors.append(f"{prefix}:evidence_required")
            evidence = []
        for eindex, entry in enumerate(evidence):
            eprefix = f"{prefix}:evidence:{eindex}"
            errors += exact_keys(entry, EVIDENCE_KEYS, eprefix)
            if not isinstance(entry, dict):
                continue
            if entry.get("path") != assignment["document_path"]:
                errors.append(f"{eprefix}:path_mismatch")
            if entry.get("source_sha256") != assignment["source_sha256"]:
                errors.append(f"{eprefix}:source_sha_mismatch")
            start, end = entry.get("line_start"), entry.get("line_end")
            if not isinstance(start, int) or not isinstance(end, int) or start > end:
                errors.append(f"{eprefix}:invalid_range")
                continue
            if not any(core_start <= start <= end <= core_end for core_start, core_end in assigned_ranges):
                errors.append(f"{eprefix}:outside_assigned_core")
                continue
            quote = entry.get("exact_quote")
            selected = "".join(source_lines[start - 1 : end])
            if not nonempty(quote) or quote not in selected:
                errors.append(f"{eprefix}:exact_quote_mismatch")

    for index, segment in enumerate(raw_segments):
        prefix = f"segment:{index}"
        errors += exact_keys(segment, SEGMENT_KEYS, prefix)
        if not isinstance(segment, dict):
            continue
        expected = expected_segments.get(segment.get("window_id"))
        if expected is None:
            continue
        if segment.get("core_range") != expected["core_range"]:
            errors.append(f"{prefix}:core_range_mismatch")
        if segment.get("reviewed") is not True:
            errors.append(f"{prefix}:reviewed_must_be_true")
        if not nonempty(segment.get("summary")):
            errors.append(f"{prefix}:summary_empty")
        refs = segment.get("covered_source_unit_refs")
        if refs != expected["required_source_unit_refs"]:
            errors.append(f"{prefix}:covered_source_unit_refs_mismatch")
        item_ids = segment.get("item_ids")
        if not isinstance(item_ids, list) or not item_ids or len(item_ids) != len(set(item_ids)):
            errors.append(f"{prefix}:invalid_item_ids")
            item_ids = []
        all_segment_item_ids.update(item_ids)

    if set(item_by_id) != all_segment_item_ids:
        errors.append("segments:item_id_coverage_mismatch")
    if all_item_refs != valid_refs:
        missing = sorted(valid_refs - all_item_refs)
        errors.append(f"items:source_unit_coverage_mismatch:missing_{len(missing)}")

    synthesis = result.get("synthesis")
    errors += exact_keys(synthesis, SYNTHESIS_KEYS, "synthesis")
    if isinstance(synthesis, dict):
        for key in SYNTHESIS_KEYS:
            value = synthesis.get(key)
            if not isinstance(value, list) or len(value) != len(set(value)) or any(not nonempty(v) for v in value):
                errors.append(f"synthesis:{key}:invalid")

    attestation = result.get("self_attestation")
    errors += exact_keys(attestation, ATTESTATION_KEYS, "self_attestation")
    if isinstance(attestation, dict) and any(attestation.get(key) is not True for key in ATTESTATION_KEYS):
        errors.append("self_attestation:not_all_true")

    return {
        "state": "eligible" if not errors else "rejected",
        "errors": sorted(set(errors)),
        "result": result,
        "result_sha256": sha(result_bytes),
        "result_bytes": len(result_bytes),
        "item_count": len(raw_items),
        "segment_count": len(raw_segments),
    }


def result_schema() -> dict[str, Any]:
    """Complete strict schema matching the executable validator's nested contract."""
    string = {"type": "string", "minLength": 1}
    sha256 = {"type": "string", "pattern": "^[0-9a-f]{64}$"}
    string_array = {"type": "array", "items": string, "uniqueItems": True}
    evidence = {
        "type": "object",
        "required": sorted(EVIDENCE_KEYS),
        "properties": {
            "path": string,
            "line_start": {"type": "integer", "minimum": 1},
            "line_end": {"type": "integer", "minimum": 1},
            "exact_quote": string,
            "source_sha256": sha256,
        },
        "additionalProperties": False,
    }
    source_binding = {
        "type": "object",
        "required": sorted(SOURCE_KEYS),
        "properties": {
            "bundle_id": string,
            "document_path": string,
            "source_sha256": sha256,
            "micro_window_ids": {**string_array, "minItems": 1},
        },
        "additionalProperties": False,
    }
    coverage = {
        "type": "object",
        "required": sorted(COVERAGE_KEYS),
        "properties": {
            "all_source_lines_reviewed": {"const": True},
            "all_micro_windows_reviewed": {"const": True},
            "all_source_units_accounted": {"const": True},
            "both_exact_and_adversarial_lenses_applied": {"const": True},
            "dimensions_checked": {"const": DIMENSIONS},
        },
        "additionalProperties": False,
    }
    segment = {
        "type": "object",
        "required": sorted(SEGMENT_KEYS),
        "properties": {
            "window_id": string,
            "core_range": {
                "type": "array", "prefixItems": [
                    {"type": "integer", "minimum": 1}, {"type": "integer", "minimum": 1}
                ], "minItems": 2, "maxItems": 2,
            },
            "reviewed": {"const": True},
            "covered_source_unit_refs": {**string_array, "minItems": 1},
            "item_ids": {**string_array, "minItems": 1},
            "summary": string,
        },
        "additionalProperties": False,
    }
    item = {
        "type": "object",
        "required": sorted(ITEM_KEYS),
        "properties": {
            "item_id": string,
            "item_type": {"enum": sorted(ITEM_TYPES)},
            "title": string,
            "statement": string,
            "severity": {"enum": ["info", "low", "medium", "high", "critical"]},
            "confidence": {"type": "number", "minimum": 0, "maximum": 1},
            "gap_kind": string,
            "impact": string,
            "builder_discretion": {"type": "boolean"},
            "dimensions": {
                "type": "array", "items": {"enum": DIMENSIONS}, "minItems": 1, "uniqueItems": True,
            },
            "source_unit_refs": {**string_array, "minItems": 1},
            "evidence": {"type": "array", "minItems": 1, "items": evidence},
        },
        "additionalProperties": False,
    }
    synthesis = {
        "type": "object",
        "required": sorted(SYNTHESIS_KEYS),
        "properties": {key: string_array for key in SYNTHESIS_KEYS},
        "additionalProperties": False,
    }
    attestation = {
        "type": "object",
        "required": sorted(ATTESTATION_KEYS),
        "properties": {key: {"const": True} for key in ATTESTATION_KEYS},
        "additionalProperties": False,
    }
    return {
        "$schema": "https://json-schema.org/draft/2020-12/schema",
        "title": "Audit 005 macro review result v1",
        "type": "object",
        "required": sorted(TOP_KEYS),
        "properties": {
            "audit_id": {"const": AUDIT_ID},
            "schema_version": {"const": "macro-review-result-v1"},
            "phase": {"const": "blind_macro_window_review"},
            "assignment_id": string,
            "attempt_id": string,
            "task_thread_id": string,
            "model": {"const": "gpt-5.6-sol"},
            "reasoning_effort": {"const": "xhigh"},
            "status": {"const": "completed"},
            "source_binding": source_binding,
            "coverage": coverage,
            "segments": {"type": "array", "minItems": 1, "items": segment},
            "items": {"type": "array", "minItems": 1, "items": item},
            "synthesis": synthesis,
            "self_attestation": attestation,
        },
        "additionalProperties": False,
    }
