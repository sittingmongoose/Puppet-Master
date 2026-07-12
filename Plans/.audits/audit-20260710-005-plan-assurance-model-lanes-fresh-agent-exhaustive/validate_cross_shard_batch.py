#!/usr/bin/env python3
"""Strict postrun validator for cross-shard candidate discovery."""

from __future__ import annotations

import json
from collections import Counter
from pathlib import Path
from typing import Any

from cross_shard_common import (
    CROSS_ATTEMPT, CROSS_BATCH, CROSS_EPOCH, CROSS_ROOT, SOL_CONTROLLER, load_jsonl, load_obj,
)
from macro_v2_common import ROOT, sha


TOP_KEYS = {"audit_id", "schema_version", "phase", "assignment_id", "attempt_id", "task_thread_id", "model", "reasoning_effort", "status", "input_binding", "coverage", "decisions", "self_attestation"}
INPUT_KEYS = {"packet_id", "packet_sha256", "anchor_refs_digest", "comparator_refs_digest"}
COVERAGE_KEYS = {"anchor_count", "anchor_refs", "comparator_count", "comparator_refs"}
DECISION_KEYS = {"anchor_provisional_feature_ref", "compared_against_count", "merge_candidate_refs", "related_but_distinct_refs", "rationale", "confidence"}
ATTESTATION_KEYS = {"every_anchor_decided_once", "every_comparator_considered_for_each_anchor", "merge_candidates_require_same_authority_and_lifecycle", "distinct_boundaries_preserved", "same_owner_domain_only", "no_external_or_peer_inputs_used"}
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
        "audit_id": assignment["audit_id"], "schema_version": "cross-shard-dispatch-receipt-v1",
        "epoch_id": CROSS_EPOCH, "batch_id": CROSS_BATCH, "assignment_id": assignment["assignment_id"],
        "attempt_id": CROSS_ATTEMPT, "controller_thread_id": SOL_CONTROLLER, "model": "gpt-5.6-sol",
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
    return errors


def result_errors(result: Any, assignment: dict, receipt: dict) -> list[str]:
    errors: list[str] = []
    if not exact_keys(result, TOP_KEYS, "result", errors):
        return errors
    constants = {
        "audit_id": assignment["audit_id"], "schema_version": "cross-shard-result-v1",
        "phase": "cross_shard_same_owner_candidate_discovery", "assignment_id": assignment["assignment_id"],
        "attempt_id": CROSS_ATTEMPT, "task_thread_id": receipt["agent_path"], "model": "gpt-5.6-sol",
        "reasoning_effort": "xhigh", "status": "completed",
    }
    for key, expected in constants.items():
        if result.get(key) != expected:
            errors.append(f"result:{key}")
    binding = result.get("input_binding")
    if exact_keys(binding, INPUT_KEYS, "input_binding", errors):
        expected = {key: assignment[key] for key in ("packet_id", "packet_sha256", "anchor_refs_digest", "comparator_refs_digest")}
        if binding != expected:
            errors.append("input_binding:values")
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
    if len(decision_anchors) != len(set(decision_anchors)) or set(decision_anchors) != set(assignment["anchor_refs"]):
        errors.append("decisions:exact_anchor_coverage")
    attestation = result.get("self_attestation")
    if exact_keys(attestation, ATTESTATION_KEYS, "self_attestation", errors) and any(attestation.get(key) is not True for key in ATTESTATION_KEYS):
        errors.append("self_attestation:not_all_true")
    return sorted(set(errors))


def prior_agent_paths() -> set[str]:
    paths: set[str] = set()
    for root in (ROOT / "master/macro/dispatch", ROOT / "master/feature_catalog/dispatch", ROOT / "master/owner_merge/dispatch"):
        for path in sorted(root.glob("**/dispatch_receipt.json")) if root.is_dir() else []:
            try:
                receipt = load_obj(path)
            except Exception:
                continue
            for key in ("agent_path", "task_thread_id"):
                value = receipt.get(key)
                if isinstance(value, str) and value:
                    paths.add(value)
    return paths


def main() -> None:
    batch = CROSS_ROOT / "batches" / CROSS_BATCH
    assignments = load_jsonl(batch / "batch_manifest.jsonl")
    capture_path = CROSS_ROOT / "runtime" / CROSS_BATCH / "native_capture.json"
    capture = load_obj(capture_path) if capture_path.is_file() else {}
    capture_by_id = {row.get("assignment_id"): row for row in capture.get("leaves", []) if isinstance(row, dict)}
    prior_paths = prior_agent_paths()
    results: list[dict[str, Any]] = []
    current_paths: list[str] = []
    for assignment in assignments:
        assignment_id = assignment["assignment_id"]
        intent_path = CROSS_ROOT / "dispatch" / CROSS_BATCH / assignment_id / CROSS_ATTEMPT / "dispatch_intent.json"
        receipt_path = intent_path.with_name("dispatch_receipt.json")
        errors: list[str] = []
        if not intent_path.is_file() or not receipt_path.is_file():
            results.append({"assignment_id": assignment_id, "state": "pending", "errors": ["intent_or_receipt_missing"]})
            continue
        intent = load_obj(intent_path)
        receipt = load_obj(receipt_path)
        errors.extend(receipt_errors(receipt, assignment, intent_path, intent))
        identity = receipt.get("agent_path")
        if identity in prior_paths:
            errors.append("identity:reused_prior")
        if isinstance(identity, str): current_paths.append(identity)
        native = capture_by_id.get(assignment_id)
        if not isinstance(native, dict):
            errors.append("native:capture_missing")
        elif not (native.get("agent_path") == identity and native.get("native_child_thread_state") == "idle" and native.get("native_child_turn_status") == "completed" and native.get("native_child_turn_error") is None and native.get("terminal_response_prefix") == "PMR1"):
            errors.append("native:terminal_or_identity")
        output = Path(intent["output_directory"])
        payloads = sorted(path for path in output.iterdir() if path.is_file()) if output.is_dir() else []
        if len(payloads) != 1 or payloads[0].suffix != ".json":
            results.append({"assignment_id": assignment_id, "state": "pending" if not payloads else "rejected", "errors": sorted(set(errors + [f"payload_count:{len(payloads)}"]))})
            continue
        payload_path = payloads[0]
        try:
            payload = json.loads(payload_path.read_bytes())
        except Exception as exc:
            errors.append(f"payload_parse:{type(exc).__name__}")
            payload = None
        if payload is not None:
            errors.extend(result_errors(payload, assignment, receipt))
        results.append({
            "assignment_id": assignment_id, "attempt_id": CROSS_ATTEMPT, "task_thread_id": identity,
            "state": "eligible" if not errors else "rejected", "errors": sorted(set(errors)),
            "result_path": payload_path.relative_to(ROOT).as_posix(), "result_sha256": sha(payload_path.read_bytes()),
            "result_bytes": len(payload_path.read_bytes()),
            "decision_count": len(payload.get("decisions", [])) if isinstance(payload, dict) else None,
            "anchor_count": assignment["anchor_count"],
        })
    duplicates = {value for value, count in Counter(current_paths).items() if count > 1}
    if duplicates:
        for row in results:
            if row.get("task_thread_id") in duplicates:
                row["state"] = "rejected"; row["errors"] = sorted(set(row.get("errors", []) + ["identity:duplicate_in_batch"]))
    counts = Counter(row["state"] for row in results)
    report = {
        "audit_id": assignments[0]["audit_id"] if assignments else None,
        "validator": "cross_shard_primary_v1", "epoch_id": CROSS_EPOCH, "batch_id": CROSS_BATCH,
        "status": "pass" if counts["eligible"] == len(assignments) else ("in_progress" if counts["pending"] else "partial"),
        "counts": {"assignments": len(assignments), "eligible": counts["eligible"], "pending": counts["pending"], "rejected": counts["rejected"]},
        "eligible_assignment_ids": sorted(row["assignment_id"] for row in results if row["state"] == "eligible"),
        "results": results,
    }
    print(json.dumps(report, indent=2, sort_keys=True))


if __name__ == "__main__":
    main()
