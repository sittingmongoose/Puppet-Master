#!/usr/bin/env python3
"""Strict post-dispatch validator for reverse-orientation shadow results."""

from __future__ import annotations

import json
from collections import Counter
from pathlib import Path
from typing import Any

from cross_shard_shadow_common import (
    ORIENTATION, SHADOW_ATTEMPT, SHADOW_BATCH, SHADOW_EPOCH, SHADOW_ROOT,
    SOL_CONTROLLER, load_jsonl, load_obj,
)
from macro_v2_common import ROOT, sha


TOP_KEYS = {"audit_id", "schema_version", "phase", "assignment_id", "attempt_id", "task_thread_id", "model", "reasoning_effort", "status", "input_binding", "coverage", "decisions", "self_attestation"}
INPUT_KEYS = {"packet_id", "packet_sha256", "anchor_refs_digest", "comparator_refs_digest", "orientation", "anchor_owner_assignment_id", "comparator_owner_assignment_id"}
COVERAGE_KEYS = {"anchor_count", "anchor_refs", "comparator_count", "comparator_refs"}
DECISION_KEYS = {"anchor_provisional_feature_ref", "compared_against_count", "merge_candidate_refs", "related_but_distinct_refs", "rationale", "confidence"}
ATTESTATION_KEYS = {"every_anchor_decided_once", "every_comparator_considered_for_each_anchor", "strict_merge_equivalence_applied", "umbrella_member_and_adjacency_kept_distinct", "reverse_orientation_verified", "same_owner_domain_only", "no_external_or_peer_inputs_used"}
RECEIPT_KEYS = {"audit_id", "schema_version", "epoch_id", "batch_id", "assignment_id", "attempt_id", "controller_thread_id", "agent_path", "task_thread_id", "model", "reasoning_effort", "fresh_child", "fork_turns", "dispatch_intent_sha256", "packet_sha256", "output_directory"}


def string_list(value: Any) -> bool:
    return isinstance(value, list) and len(value) == len(set(value)) and all(isinstance(item, str) and item.strip() for item in value)


def exact_keys(value: Any, expected: set[str], label: str, errors: list[str]) -> bool:
    if not isinstance(value, dict):
        errors.append(f"{label}:not_object")
        return False
    if set(value) != expected:
        errors.append(f"{label}:keys")
        return False
    return True


def receipt_errors(receipt: Any, assignment: dict, intent_path: Path, intent: dict) -> list[str]:
    if not isinstance(receipt, dict) or set(receipt) != RECEIPT_KEYS:
        return ["receipt:keys"]
    errors: list[str] = []
    constants = {
        "audit_id": assignment["audit_id"], "schema_version": "cross-shard-shadow-dispatch-receipt-v1",
        "epoch_id": SHADOW_EPOCH, "batch_id": SHADOW_BATCH, "assignment_id": assignment["assignment_id"],
        "attempt_id": SHADOW_ATTEMPT, "controller_thread_id": SOL_CONTROLLER, "model": "gpt-5.6-sol",
        "reasoning_effort": "xhigh", "fresh_child": True, "fork_turns": "none",
        "dispatch_intent_sha256": sha(intent_path.read_bytes()), "packet_sha256": assignment["packet_sha256"],
        "output_directory": intent["output_directory"],
    }
    for key, expected in constants.items():
        if receipt.get(key) != expected:
            errors.append(f"receipt:{key}")
    identity = receipt.get("agent_path")
    if not isinstance(identity, str) or not identity.startswith("/root/") or receipt.get("task_thread_id") != identity:
        errors.append("receipt:identity")
    return sorted(set(errors))


def result_errors(result: Any, assignment: dict, receipt: dict) -> list[str]:
    errors: list[str] = []
    if not exact_keys(result, TOP_KEYS, "result", errors):
        return errors
    constants = {
        "audit_id": assignment["audit_id"], "schema_version": "cross-shard-shadow-result-v1",
        "phase": "cross_shard_reverse_orientation_shadow_candidate_discovery",
        "assignment_id": assignment["assignment_id"], "attempt_id": SHADOW_ATTEMPT,
        "task_thread_id": receipt["agent_path"], "model": "gpt-5.6-sol",
        "reasoning_effort": "xhigh", "status": "completed",
    }
    for key, expected in constants.items():
        if result.get(key) != expected:
            errors.append(f"result:{key}")
    binding = result.get("input_binding")
    if exact_keys(binding, INPUT_KEYS, "input_binding", errors):
        expected = {
            key: assignment[key] for key in (
                "packet_id", "packet_sha256", "anchor_refs_digest", "comparator_refs_digest",
                "orientation", "anchor_owner_assignment_id", "comparator_owner_assignment_id",
            )
        }
        if binding != expected:
            errors.append("input_binding:values")
        if binding.get("orientation") != ORIENTATION or binding.get("anchor_owner_assignment_id") != assignment.get("original_right_owner_assignment_id") or binding.get("comparator_owner_assignment_id") != assignment.get("original_left_owner_assignment_id"):
            errors.append("input_binding:wrong_reversed_orientation")
    coverage = result.get("coverage")
    if exact_keys(coverage, COVERAGE_KEYS, "coverage", errors):
        expected = {key: assignment[key] for key in ("anchor_count", "anchor_refs", "comparator_count", "comparator_refs")}
        if coverage != expected:
            errors.append("coverage:values")
    decisions = result.get("decisions")
    if not isinstance(decisions, list) or not decisions:
        errors.append("decisions:empty_or_not_array")
        decisions = []
    decision_anchors: list[str] = []
    comparator_set = set(assignment["comparator_refs"])
    for index, decision in enumerate(decisions):
        label = f"decision:{index}"
        if not exact_keys(decision, DECISION_KEYS, label, errors):
            continue
        anchor = decision.get("anchor_provisional_feature_ref")
        decision_anchors.append(anchor)
        if anchor not in assignment["anchor_refs"]:
            errors.append(f"{label}:anchor")
        if decision.get("compared_against_count") != assignment["comparator_count"]:
            errors.append(f"{label}:compared_count")
        candidates = decision.get("merge_candidate_refs")
        related = decision.get("related_but_distinct_refs")
        if not string_list(candidates) or any(ref not in comparator_set for ref in candidates or []):
            errors.append(f"{label}:merge_candidates")
        if not string_list(related) or any(ref not in comparator_set for ref in related or []):
            errors.append(f"{label}:related_distinct")
        if isinstance(candidates, list) and isinstance(related, list) and set(candidates) & set(related):
            errors.append(f"{label}:candidate_related_overlap")
        if not isinstance(decision.get("rationale"), str) or not decision["rationale"].strip():
            errors.append(f"{label}:rationale")
        confidence = decision.get("confidence")
        if isinstance(confidence, bool) or not isinstance(confidence, (int, float)) or not 0 <= confidence <= 1:
            errors.append(f"{label}:confidence")
    if len(decision_anchors) != len(set(decision_anchors)):
        errors.append("decisions:duplicate_anchor")
    if set(decision_anchors) != set(assignment["anchor_refs"]):
        errors.append("decisions:exact_anchor_coverage")
    attestation = result.get("self_attestation")
    if exact_keys(attestation, ATTESTATION_KEYS, "self_attestation", errors) and any(attestation.get(key) is not True for key in ATTESTATION_KEYS):
        errors.append("self_attestation:not_all_true")
    return sorted(set(errors))


def output_file_errors(file_names: list[str]) -> list[str]:
    errors: list[str] = []
    if len(file_names) != 1:
        errors.append(f"output:regular_file_count:{len(file_names)}")
    if len(file_names) == 1 and not file_names[0].endswith(".json"):
        errors.append("output:not_json")
    return errors


def receipt_set_errors(expected_assignment_ids: list[str], receipt_rows: list[dict[str, Any]]) -> list[str]:
    errors: list[str] = []
    ids = [row.get("assignment_id") for row in receipt_rows]
    missing = sorted(set(expected_assignment_ids) - set(ids))
    if missing:
        errors.append("receipts:missing")
    if len(ids) != len(set(ids)):
        errors.append("receipts:duplicate_assignment")
    paths = [row.get("agent_path") for row in receipt_rows if isinstance(row.get("agent_path"), str)]
    if len(paths) != len(set(paths)):
        errors.append("receipts:duplicate_agent_path")
    if len(receipt_rows) != len(expected_assignment_ids):
        errors.append("receipts:count")
    return sorted(set(errors))


def main() -> None:
    batch = SHADOW_ROOT / "batches" / SHADOW_BATCH
    assignments = load_jsonl(batch / "batch_manifest.jsonl")
    expected_ids = [row["assignment_id"] for row in assignments]
    receipt_rows: list[dict[str, Any]] = []
    results: list[dict[str, Any]] = []
    for assignment in assignments:
        assignment_id = assignment["assignment_id"]
        intent_path = SHADOW_ROOT / "dispatch" / SHADOW_BATCH / assignment_id / SHADOW_ATTEMPT / "dispatch_intent.json"
        receipt_path = intent_path.with_name("dispatch_receipt.json")
        errors: list[str] = []
        if not intent_path.is_file():
            results.append({"assignment_id": assignment_id, "state": "rejected", "errors": ["intent:missing"]})
            continue
        intent = load_obj(intent_path)
        if not receipt_path.is_file():
            results.append({"assignment_id": assignment_id, "state": "rejected", "errors": ["receipt:missing_post_dispatch"]})
            continue
        receipt = load_obj(receipt_path)
        receipt_rows.append(receipt)
        errors.extend(receipt_errors(receipt, assignment, intent_path, intent))
        output = Path(intent["output_directory"])
        payloads = sorted(path for path in output.iterdir() if path.is_file()) if output.is_dir() else []
        errors.extend(output_file_errors([path.name for path in payloads]))
        if len(payloads) == 1 and payloads[0].suffix == ".json":
            try:
                payload = json.loads(payloads[0].read_bytes())
            except Exception as exc:
                errors.append(f"payload_parse:{type(exc).__name__}")
                payload = None
            if payload is not None:
                errors.extend(result_errors(payload, assignment, receipt))
        results.append({
            "assignment_id": assignment_id,
            "attempt_id": SHADOW_ATTEMPT,
            "task_thread_id": receipt.get("agent_path"),
            "state": "eligible" if not errors else "rejected",
            "errors": sorted(set(errors)),
            "result_path": payloads[0].relative_to(ROOT).as_posix() if len(payloads) == 1 else None,
            "result_sha256": sha(payloads[0].read_bytes()) if len(payloads) == 1 else None,
        })
    set_errors = receipt_set_errors(expected_ids, receipt_rows)
    if set_errors:
        duplicate_paths = {value for value, count in Counter(row.get("agent_path") for row in receipt_rows).items() if value and count > 1}
        for row in results:
            if row.get("task_thread_id") in duplicate_paths:
                row["state"] = "rejected"
                row["errors"] = sorted(set(row.get("errors", []) + ["receipt:duplicate_agent_path"]))
    counts = Counter(row["state"] for row in results)
    report = {
        "audit_id": assignments[0]["audit_id"] if assignments else None,
        "validator": "cross_shard_shadow_primary_v1",
        "epoch_id": SHADOW_EPOCH,
        "batch_id": SHADOW_BATCH,
        "status": "pass" if counts["eligible"] == len(assignments) and not set_errors else "fail",
        "receipt_set_errors": set_errors,
        "counts": {"assignments": len(assignments), "eligible": counts["eligible"], "rejected": counts["rejected"]},
        "results": results,
    }
    print(json.dumps(report, indent=2, sort_keys=True))
    raise SystemExit(0 if report["status"] == "pass" else 1)


if __name__ == "__main__":
    main()

