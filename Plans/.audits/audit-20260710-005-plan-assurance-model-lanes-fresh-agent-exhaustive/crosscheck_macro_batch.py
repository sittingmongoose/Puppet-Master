#!/usr/bin/env python3
"""Structurally independent result cross-check for Audit 005 macro batches."""

from __future__ import annotations

import argparse
import importlib.util
import json
import sys
from collections import Counter
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
    load_jsonl,
    load_obj,
    canonical_json,
    result_file,
    selected_result_payload,
    sha,
)


def keys(value: Any, expected: set[str], label: str, issues: list[str]) -> bool:
    if not isinstance(value, dict):
        issues.append(f"{label}:not_object")
        return False
    if set(value) != expected:
        issues.append(f"{label}:key_set_mismatch")
    return True


def receipt_issues(
    receipt: Any,
    assignment: dict[str, Any],
    intent: dict[str, Any],
    batch_id: str,
    controller_thread_id: str,
) -> list[str]:
    issues: list[str] = []
    expected_keys = {
        "audit_id", "schema_version", "epoch_id", "batch_id", "assignment_id", "attempt_id",
        "controller_thread_id", "agent_path", "task_thread_id", "model", "reasoning_effort",
        "fresh_child", "fork_turns", "dispatch_intent_sha256", "capsule_sha256", "output_directory",
    }
    if not keys(receipt, expected_keys, "receipt", issues):
        return issues
    expectations = [
        ("audit_id", AUDIT_ID), ("schema_version", "macro-dispatch-receipt-v1"),
        ("epoch_id", intent["epoch_id"]), ("batch_id", batch_id),
        ("assignment_id", assignment["assignment_id"]), ("attempt_id", assignment["attempt_id"]),
        ("controller_thread_id", controller_thread_id),
        ("model", "gpt-5.6-sol"), ("reasoning_effort", "xhigh"),
        ("fresh_child", True), ("fork_turns", "none"),
        ("capsule_sha256", assignment["capsule_sha256"]),
        ("output_directory", intent["output_directory"]),
    ]
    for field, expected in expectations:
        if receipt.get(field) != expected:
            issues.append(f"receipt:{field}:wrong")
    if receipt.get("agent_path") != receipt.get("task_thread_id") or not isinstance(receipt.get("agent_path"), str):
        issues.append("receipt:identity_not_equal")
    return issues


def examine_payload(
    payload: bytes,
    assignment: dict[str, Any],
    capsule: dict[str, Any],
    receipt: dict[str, Any],
) -> list[str]:
    issues: list[str] = []
    try:
        value = json.loads(payload)
    except Exception:
        return ["payload:not_json"]
    if not keys(value, TOP_KEYS, "payload", issues):
        return issues
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
    for field, expected in expected_top.items():
        if value.get(field) != expected:
            issues.append(f"payload:{field}:wrong")
    binding = value.get("source_binding")
    if keys(binding, SOURCE_KEYS, "binding", issues):
        if binding != {
            "bundle_id": assignment["bundle_id"],
            "document_path": assignment["document_path"],
            "source_sha256": assignment["source_sha256"],
            "micro_window_ids": assignment["micro_window_ids"],
        }:
            issues.append("binding:value_mismatch")
    coverage = value.get("coverage")
    if keys(coverage, COVERAGE_KEYS, "coverage", issues):
        if any(coverage.get(field) is not True for field in COVERAGE_KEYS - {"dimensions_checked"}):
            issues.append("coverage:false_flag")
        if coverage.get("dimensions_checked") != DIMENSIONS:
            issues.append("coverage:dimension_order_or_set")

    capsule_segments = {row["window_id"]: row for row in capsule.get("segments", [])}
    result_segments = value.get("segments")
    if not isinstance(result_segments, list):
        issues.append("segments:not_list")
        result_segments = []
    if len(result_segments) != len(capsule_segments):
        issues.append("segments:wrong_count")
    segment_ids = [row.get("window_id") for row in result_segments if isinstance(row, dict)]
    if len(segment_ids) != len(set(segment_ids)) or set(segment_ids) != set(capsule_segments):
        issues.append("segments:wrong_id_universe")

    items = value.get("items")
    if not isinstance(items, list) or not items:
        issues.append("items:empty_or_not_list")
        items = []
    item_ids: set[str] = set()
    item_refs: set[str] = set()
    evidence_ranges: dict[str, list[tuple[int, int]]] = {
        window_id: [tuple(segment["core_range"])] for window_id, segment in capsule_segments.items()
    }
    all_ranges = [pair for pairs in evidence_ranges.values() for pair in pairs]
    all_valid_refs = {ref for segment in capsule_segments.values() for ref in segment["required_source_unit_refs"]}
    source_lines = (REPO / assignment["document_path"]).read_text(encoding="utf-8").splitlines(keepends=True)
    for number, item in enumerate(items):
        label = f"item:{number}"
        if not keys(item, ITEM_KEYS, label, issues):
            continue
        item_id = item.get("item_id")
        if not isinstance(item_id, str) or not item_id.strip() or item_id in item_ids:
            issues.append(f"{label}:bad_id")
        else:
            item_ids.add(item_id)
        if item.get("item_type") not in ITEM_TYPES:
            issues.append(f"{label}:bad_type")
        if item.get("severity") not in {"info", "low", "medium", "high", "critical"}:
            issues.append(f"{label}:bad_severity")
        if not isinstance(item.get("builder_discretion"), bool):
            issues.append(f"{label}:bad_builder_discretion")
        confidence = item.get("confidence")
        if not isinstance(confidence, (int, float)) or isinstance(confidence, bool) or confidence < 0 or confidence > 1:
            issues.append(f"{label}:bad_confidence")
        for field in ("title", "statement", "gap_kind", "impact"):
            if not isinstance(item.get(field), str) or not item[field].strip():
                issues.append(f"{label}:{field}:empty")
        dims = item.get("dimensions")
        if not isinstance(dims, list) or not dims or len(dims) != len(set(dims)) or not set(dims) <= set(DIMENSIONS):
            issues.append(f"{label}:bad_dimensions")
        refs = item.get("source_unit_refs")
        if not isinstance(refs, list) or not refs or len(refs) != len(set(refs)):
            issues.append(f"{label}:bad_refs")
            refs = []
        if not set(refs) <= all_valid_refs:
            issues.append(f"{label}:foreign_ref")
        item_refs.update(refs)
        evidence = item.get("evidence")
        if not isinstance(evidence, list) or not evidence:
            issues.append(f"{label}:no_evidence")
            evidence = []
        for offset, entry in enumerate(evidence):
            elabel = f"{label}:evidence:{offset}"
            if not keys(entry, EVIDENCE_KEYS, elabel, issues):
                continue
            start, end = entry.get("line_start"), entry.get("line_end")
            if entry.get("path") != assignment["document_path"] or entry.get("source_sha256") != assignment["source_sha256"]:
                issues.append(f"{elabel}:source_binding")
            if not isinstance(start, int) or not isinstance(end, int) or start > end or not any(a <= start <= end <= b for a, b in all_ranges):
                issues.append(f"{elabel}:range")
                continue
            quote = entry.get("exact_quote")
            selected = "".join(source_lines[start - 1 : end])
            if not isinstance(quote, str) or not quote.strip() or quote not in selected:
                issues.append(f"{elabel}:quote")

    segment_item_ids: set[str] = set()
    for number, segment in enumerate(result_segments):
        label = f"segment:{number}"
        if not keys(segment, SEGMENT_KEYS, label, issues):
            continue
        expected = capsule_segments.get(segment.get("window_id"))
        if expected is None:
            continue
        if segment.get("core_range") != expected["core_range"] or segment.get("reviewed") is not True:
            issues.append(f"{label}:binding_or_reviewed")
        if segment.get("covered_source_unit_refs") != expected["required_source_unit_refs"]:
            issues.append(f"{label}:unit_coverage")
        ids = segment.get("item_ids")
        if not isinstance(ids, list) or not ids or len(ids) != len(set(ids)):
            issues.append(f"{label}:bad_item_ids")
        else:
            segment_item_ids.update(ids)
        if not isinstance(segment.get("summary"), str) or not segment["summary"].strip():
            issues.append(f"{label}:empty_summary")
    if item_ids != segment_item_ids:
        issues.append("segments:do_not_cover_exact_item_set")
    if item_refs != all_valid_refs:
        issues.append("items:do_not_cover_exact_source_unit_set")

    synthesis = value.get("synthesis")
    if keys(synthesis, SYNTHESIS_KEYS, "synthesis", issues):
        for field in SYNTHESIS_KEYS:
            rows = synthesis.get(field)
            if not isinstance(rows, list) or len(rows) != len(set(rows)) or any(not isinstance(x, str) or not x.strip() for x in rows):
                issues.append(f"synthesis:{field}:bad")
    attestation = value.get("self_attestation")
    if keys(attestation, ATTESTATION_KEYS, "attestation", issues):
        if any(attestation.get(field) is not True for field in ATTESTATION_KEYS):
            issues.append("attestation:not_all_true")
    return sorted(set(issues))


def crosscheck(batch_id: str) -> dict[str, Any]:
    batch = MACRO_ROOT / "batches" / batch_id
    authority = load_obj(batch / "batch_authority.json")
    epoch = MACRO_ROOT / "frozen" / authority["epoch_id"]
    assignments = load_jsonl(batch / "batch_manifest.jsonl")
    results: list[dict[str, Any]] = []
    identities: list[str] = []
    for assignment in assignments:
        assignment_id = assignment["assignment_id"]
        attempt_id = assignment["attempt_id"]
        intent_path = MACRO_ROOT / "dispatch" / batch_id / assignment_id / attempt_id / "dispatch_intent.json"
        receipt_path = intent_path.with_name("dispatch_receipt.json")
        if not receipt_path.is_file():
            results.append({"assignment_id": assignment_id, "state": "pending", "issues": ["receipt_absent"]})
            continue
        try:
            intent = load_obj(intent_path)
            receipt = load_obj(receipt_path)
        except Exception:
            results.append({"assignment_id": assignment_id, "state": "rejected", "issues": ["dispatch_parse"]})
            continue
        issues = receipt_issues(receipt, assignment, intent, batch_id, authority["controller_thread_id"])
        if receipt.get("dispatch_intent_sha256") != sha(intent_path.read_bytes()):
            issues.append("receipt:intent_digest")
        identity = receipt.get("agent_path")
        if isinstance(identity, str):
            identities.append(identity)
        payload_path, file_issues, normalization = selected_result_payload(
            batch_id=batch_id, assignment=assignment, output_dir=Path(intent["output_directory"])
        )
        if payload_path is None:
            state = "pending" if file_issues == ["expected_exactly_one_json_payload:found_0"] else "rejected"
            results.append({"assignment_id": assignment_id, "state": state, "issues": sorted(set(issues + file_issues))})
            continue
        issues.extend(file_issues)
        capsule_path = epoch / assignment["capsule_ref"]
        if sha(capsule_path.read_bytes()) != assignment["capsule_sha256"]:
            issues.append("capsule:digest")
        else:
            issues.extend(examine_payload(payload_path.read_bytes(), assignment, load_obj(capsule_path), receipt))
        if normalization is not None:
            raw_path = ROOT / normalization["raw_result_ref"]
            normalizer_path = ROOT / normalization["normalizer_ref"]
            module_name = "audit005_normalizer_" + normalization["normalizer_sha256"][:16]
            spec = importlib.util.spec_from_file_location(module_name, normalizer_path)
            if spec is None or spec.loader is None:
                issues.append("normalization:module_load_failed")
                recomputed, normalization_issues = None, ["module_load_failed"]
            else:
                module = importlib.util.module_from_spec(spec)
                sys.modules[module_name] = module
                spec.loader.exec_module(module)
                recomputed, normalization_issues = module.normalize_payload(
                raw_path.read_bytes(), assignment=assignment, capsule=load_obj(capsule_path), receipt=receipt
                )
            if normalization_issues or recomputed is None:
                issues.append("normalization:independent_recompute_failed")
            elif canonical_json(recomputed) != payload_path.read_bytes():
                issues.append("normalization:independent_bytes_mismatch")
        results.append({
            "assignment_id": assignment_id,
            "state": "eligible" if not issues else "rejected",
            "issues": sorted(set(issues)),
            "task_thread_id": identity,
            "result_path": payload_path.relative_to(ROOT).as_posix(),
            "result_sha256": sha(payload_path.read_bytes()),
            "result_bytes": payload_path.stat().st_size,
            "normalization_applied": normalization is not None,
        })
    duplicates = {identity for identity, count in Counter(identities).items() if count > 1}
    for row in results:
        if row.get("task_thread_id") in duplicates:
            row["state"] = "rejected"
            row["issues"] = sorted(set(row["issues"] + ["identity:duplicate_in_batch"]))
    counts = Counter(row["state"] for row in results)
    return {
        "audit_id": AUDIT_ID,
        "checker": "macro_batch_independent_v1",
        "batch_id": batch_id,
        "epoch_id": authority["epoch_id"],
        "status": "pass" if counts["eligible"] == len(assignments) else ("in_progress" if counts["pending"] else "partial"),
        "counts": {"assignments": len(assignments), "eligible": counts["eligible"], "pending": counts["pending"], "rejected": counts["rejected"]},
        "eligible_assignment_ids": sorted(row["assignment_id"] for row in results if row["state"] == "eligible"),
        "results": results,
    }


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--batch-id", required=True)
    args = parser.parse_args()
    report = crosscheck(args.batch_id)
    print(json.dumps(report, indent=2, sort_keys=True))
    raise SystemExit(0)


if __name__ == "__main__":
    main()
