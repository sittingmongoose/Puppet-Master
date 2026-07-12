#!/usr/bin/env python3
"""Strict postrun validator for Audit 005 universal external research."""

from __future__ import annotations

import json
import re
from collections import Counter
from pathlib import Path
from typing import Any

from macro_v2_common import ROOT, sha


AUDIT_ID = "audit-20260710-005-plan-assurance-model-lanes-fresh-agent-exhaustive"
WAVE_ID = "universal-wave-0001"
ATTEMPT_ID = "attempt-0001"
NAMESPACE = ROOT / "master/external_research" / WAVE_ID
MAX_PACKET_BYTES = 450_000
CONTROLLER = "019f4f5e-96c6-7893-8c94-ce2c1b760d6c"
TOP_KEYS = {"audit_id", "schema_version", "phase", "assignment_id", "attempt_id", "task_thread_id", "model", "reasoning_effort", "status", "input_binding", "coverage", "feature_results", "self_attestation"}
INPUT_KEYS = {"packet_id", "packet_sha256", "feature_refs_digest", "source_rows_digest"}
COVERAGE_KEYS = {"feature_count", "feature_refs"}
FEATURE_KEYS = {"provisional_feature_ref", "source_row_sha256", "research_group_id", "research_state", "search_attempts", "insufficient_evidence_reason", "sources", "supported_claims", "external_baseline_summary", "confirmed_gaps", "underspecifications", "contradictions", "missed_failure_modes", "conclusion_changed", "conclusion_change_summary", "proposed_spec_deltas", "scenario_implications", "adversarial_implications"}
SOURCE_KEYS = {"source_id", "url", "title", "publisher", "source_type", "accessed_date", "section_anchor", "evidence_snippet", "applicability"}
CLAIM_KEYS = {"claim_id", "claim", "source_ids", "applicability"}
ATTESTATION_KEYS = {"live_public_web_browsed", "every_feature_researched_or_blocked", "authoritative_sources_prioritized", "per_feature_source_mapping_complete", "plans_not_edited", "no_peer_or_prior_research_used"}
RECEIPT_KEYS = {"audit_id", "schema_version", "wave_id", "assignment_id", "attempt_id", "controller_thread_id", "agent_path", "task_thread_id", "model", "reasoning_effort", "fresh_child", "fork_turns", "dispatch_intent_sha256", "packet_sha256", "output_directory"}
SOURCE_TYPES = {"official_standard", "official_product_documentation", "peer_reviewed_paper", "mature_open_source_documentation", "other_authoritative"}
URL_RE = re.compile(r"^https://[^\s]+$")
DATE_RE = re.compile(r"^[0-9]{4}-[0-9]{2}-[0-9]{2}$")


def load_obj(path: Path) -> dict[str, Any]:
    value = json.loads(path.read_text(encoding="utf-8"))
    if not isinstance(value, dict):
        raise RuntimeError(f"not object:{path}")
    return value


def load_jsonl(path: Path) -> list[dict[str, Any]]:
    return [json.loads(line) for line in path.read_text(encoding="utf-8").splitlines() if line.strip()]


def exact_keys(value: Any, expected: set[str], label: str, errors: list[str]) -> bool:
    if not isinstance(value, dict):
        errors.append(f"{label}:not_object")
        return False
    if set(value) != expected:
        errors.append(f"{label}:keys")
        return False
    return True


def strings(value: Any, allow_empty: bool = True) -> bool:
    return isinstance(value, list) and (allow_empty or bool(value)) and len(value) == len(set(value)) and all(isinstance(item, str) and item.strip() for item in value)


def packet_size_errors(packet_bytes: int) -> list[str]:
    return [] if isinstance(packet_bytes, int) and 0 < packet_bytes <= MAX_PACKET_BYTES else ["packet:over_ceiling_or_invalid"]


def output_file_errors(file_names: list[str]) -> list[str]:
    errors: list[str] = []
    if file_names != ["result.json"]:
        errors.append("output:must_be_exactly_result_json")
    return errors


def receipt_set_errors(expected_ids: list[str], receipts: list[dict[str, Any]]) -> list[str]:
    errors: list[str] = []
    ids = [row.get("assignment_id") for row in receipts]
    paths = [row.get("agent_path") for row in receipts if isinstance(row.get("agent_path"), str)]
    if set(ids) != set(expected_ids) or len(receipts) != len(expected_ids):
        errors.append("receipts:missing_or_foreign")
    if len(ids) != len(set(ids)):
        errors.append("receipts:duplicate_assignment")
    if len(paths) != len(set(paths)):
        errors.append("receipts:duplicate_agent_path")
    return sorted(set(errors))


def receipt_errors(receipt: Any, assignment: dict[str, Any], intent_path: Path, intent: dict[str, Any]) -> list[str]:
    if not isinstance(receipt, dict) or set(receipt) != RECEIPT_KEYS:
        return ["receipt:keys"]
    errors: list[str] = []
    expected = {
        "audit_id": AUDIT_ID, "schema_version": "external-research-universal-dispatch-receipt-v1",
        "wave_id": WAVE_ID, "assignment_id": assignment["assignment_id"], "attempt_id": ATTEMPT_ID,
        "controller_thread_id": CONTROLLER, "model": "gpt-5.6-sol", "reasoning_effort": "xhigh",
        "fresh_child": True, "fork_turns": "none", "dispatch_intent_sha256": sha(intent_path.read_bytes()),
        "packet_sha256": assignment["packet_sha256"], "output_directory": intent["output_directory"],
    }
    for key, value in expected.items():
        if receipt.get(key) != value:
            errors.append(f"receipt:{key}")
    expected_path = assignment["prospective_agent_path"]
    if receipt.get("agent_path") != expected_path or receipt.get("task_thread_id") != expected_path:
        errors.append("receipt:identity")
    return sorted(set(errors))


def result_errors(result: Any, assignment: dict[str, Any], receipt: dict[str, Any]) -> list[str]:
    errors: list[str] = []
    if not exact_keys(result, TOP_KEYS, "result", errors):
        return errors
    constants = {
        "audit_id": AUDIT_ID, "schema_version": "external-research-universal-result-v1",
        "phase": "universal_external_research", "assignment_id": assignment["assignment_id"],
        "attempt_id": ATTEMPT_ID, "task_thread_id": receipt["agent_path"], "model": "gpt-5.6-sol",
        "reasoning_effort": "xhigh", "status": "completed",
    }
    for key, value in constants.items():
        if result.get(key) != value:
            errors.append(f"result:{key}")
    binding = result.get("input_binding")
    if exact_keys(binding, INPUT_KEYS, "input_binding", errors):
        expected = {key: assignment[key] for key in INPUT_KEYS}
        if binding != expected:
            errors.append("input_binding:values")
    coverage = result.get("coverage")
    if exact_keys(coverage, COVERAGE_KEYS, "coverage", errors):
        expected = {"feature_count": assignment["feature_count"], "feature_refs": assignment["feature_refs"]}
        if coverage != expected:
            errors.append("coverage:values")
    feature_results = result.get("feature_results")
    if not isinstance(feature_results, list):
        errors.append("feature_results:not_array")
        feature_results = []
    refs: list[str] = []
    expected_hashes = assignment["source_row_sha256_by_feature"]
    for index, feature in enumerate(feature_results):
        label = f"feature:{index}"
        if not exact_keys(feature, FEATURE_KEYS, label, errors):
            continue
        ref = feature.get("provisional_feature_ref")
        refs.append(ref)
        if ref not in expected_hashes:
            errors.append(f"{label}:foreign_feature")
        elif feature.get("source_row_sha256") != expected_hashes[ref]:
            errors.append(f"{label}:source_row_sha256")
        if not isinstance(feature.get("research_group_id"), str) or not feature["research_group_id"].strip():
            errors.append(f"{label}:research_group_id")
        state = feature.get("research_state")
        if state not in {"researched", "blocked_insufficient_evidence"}:
            errors.append(f"{label}:research_state")
        attempts = feature.get("search_attempts")
        if not strings(attempts, allow_empty=False):
            errors.append(f"{label}:search_attempts")
        reason = feature.get("insufficient_evidence_reason")
        if state == "blocked_insufficient_evidence":
            if not isinstance(reason, str) or not reason.strip():
                errors.append(f"{label}:insufficient_evidence_reason")
        elif reason is not None:
            errors.append(f"{label}:unexpected_insufficient_reason")
        sources = feature.get("sources")
        if not isinstance(sources, list):
            errors.append(f"{label}:sources_not_array")
            sources = []
        source_ids: list[str] = []
        for s_index, source in enumerate(sources):
            s_label = f"{label}:source:{s_index}"
            if not exact_keys(source, SOURCE_KEYS, s_label, errors):
                continue
            source_id = source.get("source_id")
            source_ids.append(source_id)
            if not isinstance(source_id, str) or not source_id.strip():
                errors.append(f"{s_label}:source_id")
            if not isinstance(source.get("url"), str) or not URL_RE.match(source["url"]):
                errors.append(f"{s_label}:url")
            if source.get("source_type") not in SOURCE_TYPES:
                errors.append(f"{s_label}:source_type")
            if not isinstance(source.get("accessed_date"), str) or not DATE_RE.match(source["accessed_date"]):
                errors.append(f"{s_label}:accessed_date")
            for key in ("title", "publisher", "section_anchor", "evidence_snippet", "applicability"):
                if not isinstance(source.get(key), str) or not source[key].strip():
                    errors.append(f"{s_label}:{key}")
            if isinstance(source.get("evidence_snippet"), str) and len(source["evidence_snippet"]) > 500:
                errors.append(f"{s_label}:snippet_too_long")
        if len(source_ids) != len(set(source_ids)):
            errors.append(f"{label}:duplicate_source_id")
        if state == "researched" and len(sources) < 2:
            errors.append(f"{label}:fewer_than_two_sources")
        claims = feature.get("supported_claims")
        if not isinstance(claims, list):
            errors.append(f"{label}:claims_not_array")
            claims = []
        claim_source_ids: list[str] = []
        claim_ids: list[str] = []
        for c_index, claim in enumerate(claims):
            c_label = f"{label}:claim:{c_index}"
            if not exact_keys(claim, CLAIM_KEYS, c_label, errors):
                continue
            claim_ids.append(claim.get("claim_id"))
            for key in ("claim_id", "claim", "applicability"):
                if not isinstance(claim.get(key), str) or not claim[key].strip():
                    errors.append(f"{c_label}:{key}")
            ids = claim.get("source_ids")
            if not strings(ids, allow_empty=False) or any(item not in source_ids for item in ids or []):
                errors.append(f"{c_label}:source_mapping")
            claim_source_ids.extend(ids or [])
        if len(claim_ids) != len(set(claim_ids)):
            errors.append(f"{label}:duplicate_claim_id")
        if state == "researched" and (not claims or set(source_ids) - set(claim_source_ids)):
            errors.append(f"{label}:source_claim_mapping_incomplete")
        for key in ("external_baseline_summary", "conclusion_change_summary"):
            if not isinstance(feature.get(key), str) or not feature[key].strip():
                errors.append(f"{label}:{key}")
        for key in ("confirmed_gaps", "underspecifications", "contradictions", "missed_failure_modes", "proposed_spec_deltas", "scenario_implications", "adversarial_implications"):
            if not strings(feature.get(key)):
                errors.append(f"{label}:{key}")
        if not isinstance(feature.get("conclusion_changed"), bool):
            errors.append(f"{label}:conclusion_changed")
    if len(refs) != len(set(refs)):
        errors.append("feature_results:duplicate_feature")
    if refs != assignment["feature_refs"]:
        errors.append("feature_results:missing_foreign_or_order")
    attestation = result.get("self_attestation")
    if exact_keys(attestation, ATTESTATION_KEYS, "self_attestation", errors) and any(attestation.get(key) is not True for key in ATTESTATION_KEYS):
        errors.append("self_attestation:not_all_true")
    return sorted(set(errors))


def main() -> None:
    manifest = load_jsonl(NAMESPACE / "batch_manifest.jsonl")
    expected_ids = [row["assignment_id"] for row in manifest]
    receipts: list[dict[str, Any]] = []
    results: list[dict[str, Any]] = []
    for assignment in manifest:
        aid = assignment["assignment_id"]
        intent_path = NAMESPACE / "dispatch" / aid / ATTEMPT_ID / "dispatch_intent.json"
        receipt_path = intent_path.with_name("dispatch_receipt.json")
        errors: list[str] = []
        if not intent_path.is_file() or not receipt_path.is_file():
            results.append({"assignment_id": aid, "state": "rejected", "errors": ["intent_or_receipt_missing"]})
            continue
        intent = load_obj(intent_path)
        receipt = load_obj(receipt_path)
        receipts.append(receipt)
        errors.extend(receipt_errors(receipt, assignment, intent_path, intent))
        output = Path(intent["output_directory"])
        files = sorted(path for path in output.iterdir() if path.is_file()) if output.is_dir() else []
        errors.extend(output_file_errors([path.name for path in files]))
        payload = None
        if len(files) == 1 and files[0].name == "result.json":
            try:
                payload = json.loads(files[0].read_text(encoding="utf-8"))
            except Exception as exc:
                errors.append(f"result:parse:{type(exc).__name__}")
        if payload is not None:
            errors.extend(result_errors(payload, assignment, receipt))
        results.append({"assignment_id": aid, "state": "eligible" if not errors else "rejected", "errors": sorted(set(errors))})
    set_errors = receipt_set_errors(expected_ids, receipts)
    counts = Counter(row["state"] for row in results)
    report = {
        "audit_id": AUDIT_ID, "validator": "external_research_universal_postrun_v1",
        "wave_id": WAVE_ID, "status": "pass" if counts["eligible"] == 24 and not set_errors else "fail",
        "receipt_set_errors": set_errors,
        "counts": {"assignments": len(manifest), "eligible": counts["eligible"], "rejected": counts["rejected"]},
        "results": results,
    }
    print(json.dumps(report, indent=2, sort_keys=True))
    raise SystemExit(0 if report["status"] == "pass" else 1)


if __name__ == "__main__":
    main()

