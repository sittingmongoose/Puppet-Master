#!/usr/bin/env python3
"""Strict primary postrun validator for the Audit 005 owner-domain merge wave."""

from __future__ import annotations

import json
import re
from collections import Counter
from pathlib import Path
from typing import Any

from macro_v2_common import ROOT, sha
from owner_merge_common import (
    OWNER_ATTEMPT,
    OWNER_EPOCH,
    OWNER_ROOT,
    digest_strings,
    load_jsonl,
    load_obj,
)
from prepare_owner_merge_batch import BATCH_ID, SOL_CONTROLLER


TOP_KEYS = {
    "audit_id", "schema_version", "phase", "assignment_id", "attempt_id", "task_thread_id",
    "model", "reasoning_effort", "status", "input_binding", "coverage", "provisional_features",
    "local_feature_memberships", "relationships", "self_attestation",
}
INPUT_KEYS = {"packet_id", "packet_sha256", "local_feature_refs_digest"}
COVERAGE_KEYS = {"assigned_local_feature_count", "assigned_local_feature_refs"}
PROVISIONAL_KEYS = {
    "provisional_feature_id", "title", "summary", "owner_domain", "feature_kinds", "aliases",
    "local_feature_refs", "source_documents", "source_unit_refs", "risk_level", "spec_state",
    "gap_summary", "cross_domain_terms", "confidence",
}
MEMBERSHIP_KEYS = {"local_feature_ref", "provisional_feature_id", "merge_disposition", "rationale"}
RELATIONSHIP_KEYS = {
    "source_provisional_feature_id", "target_provisional_feature_id", "relationship_type",
    "supporting_local_feature_refs", "rationale",
}
ATTESTATION_KEYS = {
    "all_local_features_mapped_once", "only_true_synonyms_merged", "distinct_lifecycles_preserved",
    "gaps_and_non_gaps_preserved", "no_cross_domain_merge", "no_external_or_peer_inputs_used",
}
RECEIPT_KEYS = {
    "audit_id", "schema_version", "epoch_id", "batch_id", "assignment_id", "attempt_id",
    "controller_thread_id", "agent_path", "task_thread_id", "model", "reasoning_effort",
    "fresh_child", "fork_turns", "dispatch_intent_sha256", "packet_sha256", "output_directory",
}
RELATIONSHIP_TYPES = {"depends_on", "extends", "interacts_with", "potential_conflict"}
RISK_RANK = {"low": 0, "medium": 1, "high": 2, "critical": 3}
SPEC_RANK = {
    "well_specified": 0,
    "partially_specified": 1,
    "under_specified": 2,
    "unknown": 3,
    "contradictory": 4,
}


def string_list(value: Any, *, nonempty: bool = False) -> bool:
    return (
        isinstance(value, list)
        and (not nonempty or bool(value))
        and len(value) == len(set(value))
        and all(isinstance(item, str) and item.strip() for item in value)
    )


def exact_keys(value: Any, expected: set[str], label: str, errors: list[str]) -> bool:
    if not isinstance(value, dict):
        errors.append(f"{label}:not_object")
        return False
    if set(value) != expected:
        errors.append(f"{label}:keys")
        return False
    return True


def receipt_errors(receipt: Any, assignment: dict, intent_path: Path, intent: dict) -> list[str]:
    errors: list[str] = []
    if not isinstance(receipt, dict) or set(receipt) != RECEIPT_KEYS:
        return ["receipt:keys"]
    constants = {
        "audit_id": assignment["audit_id"],
        "schema_version": "owner-merge-dispatch-receipt-v1",
        "epoch_id": OWNER_EPOCH,
        "batch_id": BATCH_ID,
        "assignment_id": assignment["assignment_id"],
        "attempt_id": OWNER_ATTEMPT,
        "controller_thread_id": SOL_CONTROLLER,
        "model": "gpt-5.6-sol",
        "reasoning_effort": "xhigh",
        "fresh_child": True,
        "fork_turns": "none",
        "dispatch_intent_sha256": sha(intent_path.read_bytes()),
        "packet_sha256": assignment["packet_sha256"],
        "output_directory": intent["output_directory"],
    }
    for key, expected in constants.items():
        if receipt.get(key) != expected:
            errors.append(f"receipt:{key}")
    identity = receipt.get("agent_path")
    if not isinstance(identity, str) or not identity.startswith("/root/") or receipt.get("task_thread_id") != identity:
        errors.append("receipt:identity")
    return errors


def union_strings(features: list[dict], field: str) -> list[str]:
    return sorted({value for feature in features for value in feature.get(field, [])})


def expected_worst(features: list[dict], field: str, rank: dict[str, int]) -> str | None:
    values = [feature.get(field) for feature in features]
    if any(value not in rank for value in values):
        return None
    return max(values, key=lambda value: rank[value])


def result_errors(result: Any, assignment: dict, packet: dict, receipt: dict) -> list[str]:
    errors: list[str] = []
    if not exact_keys(result, TOP_KEYS, "result", errors):
        return errors
    constants = {
        "audit_id": assignment["audit_id"],
        "schema_version": "owner-merge-result-v1",
        "phase": "owner_domain_shard_merge",
        "assignment_id": assignment["assignment_id"],
        "attempt_id": OWNER_ATTEMPT,
        "task_thread_id": receipt["agent_path"],
        "model": "gpt-5.6-sol",
        "reasoning_effort": "xhigh",
        "status": "completed",
    }
    for key, expected in constants.items():
        if result.get(key) != expected:
            errors.append(f"result:{key}")

    binding = result.get("input_binding")
    if exact_keys(binding, INPUT_KEYS, "input_binding", errors):
        expected = {
            "packet_id": assignment["packet_id"],
            "packet_sha256": assignment["packet_sha256"],
            "local_feature_refs_digest": assignment["local_feature_refs_digest"],
        }
        if binding != expected:
            errors.append("input_binding:values")
    coverage = result.get("coverage")
    if exact_keys(coverage, COVERAGE_KEYS, "coverage", errors):
        if coverage.get("assigned_local_feature_count") != assignment["local_feature_count"]:
            errors.append("coverage:count")
        if coverage.get("assigned_local_feature_refs") != assignment["local_feature_refs"]:
            errors.append("coverage:refs")

    compact_by_ref = {row["local_feature_ref"]: row for row in packet["features"]}
    assigned_refs = assignment["local_feature_refs"]
    provisional = result.get("provisional_features")
    if not isinstance(provisional, list) or not provisional:
        errors.append("provisional_features:empty_or_not_array")
        provisional = []
    pf_by_id: dict[str, dict] = {}
    observed_pf_refs: list[str] = []
    for index, feature in enumerate(provisional):
        label = f"provisional_feature:{index}"
        if not exact_keys(feature, PROVISIONAL_KEYS, label, errors):
            continue
        pf_id = feature.get("provisional_feature_id")
        if not isinstance(pf_id, str) or re.fullmatch(r"PF-[0-9]{4}", pf_id) is None:
            errors.append(f"{label}:id")
            continue
        if pf_id in pf_by_id:
            errors.append("provisional_features:duplicate_ids")
            continue
        pf_by_id[pf_id] = feature
        for field in ("title", "summary"):
            if not isinstance(feature.get(field), str) or not feature[field].strip():
                errors.append(f"{label}:{field}")
        if feature.get("owner_domain") != assignment["owner_domain"]:
            errors.append(f"{label}:owner_domain")
        refs = feature.get("local_feature_refs")
        if not string_list(refs, nonempty=True) or any(ref not in compact_by_ref for ref in refs or []):
            errors.append(f"{label}:local_feature_refs")
            refs = []
        observed_pf_refs.extend(refs)
        members = [compact_by_ref[ref] for ref in refs if ref in compact_by_ref]
        for field, required_nonempty in (
            ("feature_kinds", True), ("aliases", False), ("source_documents", True),
            ("source_unit_refs", True), ("cross_domain_terms", False),
        ):
            if not string_list(feature.get(field), nonempty=required_nonempty):
                errors.append(f"{label}:{field}")
        union_map = {
            "feature_kinds": sorted({member["feature_kind"] for member in members}),
            "aliases": union_strings(members, "aliases"),
            "source_documents": union_strings(members, "source_documents"),
            "source_unit_refs": union_strings(members, "source_unit_refs"),
            "cross_domain_terms": union_strings(members, "cross_packet_terms"),
        }
        for field, expected in union_map.items():
            if sorted(feature.get(field, [])) != expected:
                errors.append(f"{label}:{field}_union")
        if members and feature.get("risk_level") != expected_worst(members, "risk_level", RISK_RANK):
            errors.append(f"{label}:risk_preservation")
        if members and feature.get("spec_state") != expected_worst(members, "spec_state", SPEC_RANK):
            errors.append(f"{label}:spec_state_preservation")
        gaps = [member["gap_summary"] for member in members if member.get("gap_summary")]
        gap_summary = feature.get("gap_summary")
        if not isinstance(gap_summary, str) or any(gap not in gap_summary for gap in gaps):
            errors.append(f"{label}:gap_preservation")
        confidences = [member.get("confidence") for member in members]
        confidence = feature.get("confidence")
        if (
            isinstance(confidence, bool)
            or not isinstance(confidence, (int, float))
            or not 0 <= confidence <= 1
            or (confidences and confidence != min(confidences))
        ):
            errors.append(f"{label}:confidence_preservation")
    if len(observed_pf_refs) != len(set(observed_pf_refs)) or set(observed_pf_refs) != set(assigned_refs):
        errors.append("provisional_features:local_feature_partition")

    memberships = result.get("local_feature_memberships")
    if not isinstance(memberships, list):
        errors.append("memberships:not_array")
        memberships = []
    membership_refs: list[str] = []
    for index, membership in enumerate(memberships):
        label = f"membership:{index}"
        if not exact_keys(membership, MEMBERSHIP_KEYS, label, errors):
            continue
        ref = membership.get("local_feature_ref")
        pf_id = membership.get("provisional_feature_id")
        disposition = membership.get("merge_disposition")
        membership_refs.append(ref)
        if ref not in compact_by_ref or pf_id not in pf_by_id or ref not in pf_by_id.get(pf_id, {}).get("local_feature_refs", []):
            errors.append(f"{label}:binding")
        member_count = len(pf_by_id.get(pf_id, {}).get("local_feature_refs", []))
        if member_count > 1 and disposition != "merged_synonym":
            errors.append(f"{label}:merged_disposition")
        if member_count == 1 and disposition not in {"singleton", "kept_distinct"}:
            errors.append(f"{label}:singleton_disposition")
        if not isinstance(membership.get("rationale"), str) or not membership["rationale"].strip():
            errors.append(f"{label}:rationale")
    if len(membership_refs) != len(set(membership_refs)) or set(membership_refs) != set(assigned_refs):
        errors.append("memberships:exact_coverage")

    relationships = result.get("relationships")
    if not isinstance(relationships, list):
        errors.append("relationships:not_array")
        relationships = []
    serialized_relationships: list[str] = []
    for index, relationship in enumerate(relationships):
        label = f"relationship:{index}"
        if not exact_keys(relationship, RELATIONSHIP_KEYS, label, errors):
            continue
        source = relationship.get("source_provisional_feature_id")
        target = relationship.get("target_provisional_feature_id")
        if source not in pf_by_id or target not in pf_by_id or source == target:
            errors.append(f"{label}:feature_ids")
        if relationship.get("relationship_type") not in RELATIONSHIP_TYPES:
            errors.append(f"{label}:type")
        supporting = relationship.get("supporting_local_feature_refs")
        if not string_list(supporting, nonempty=True) or any(ref not in compact_by_ref for ref in supporting or []):
            errors.append(f"{label}:supporting_refs")
        elif source in pf_by_id and target in pf_by_id:
            endpoint_refs = set(pf_by_id[source]["local_feature_refs"]) | set(pf_by_id[target]["local_feature_refs"])
            if not set(supporting) <= endpoint_refs:
                errors.append(f"{label}:supporting_refs_binding")
        if not isinstance(relationship.get("rationale"), str) or not relationship["rationale"].strip():
            errors.append(f"{label}:rationale")
        serialized_relationships.append(json.dumps(relationship, sort_keys=True, separators=(",", ":")))
    if len(serialized_relationships) != len(set(serialized_relationships)):
        errors.append("relationships:duplicates")

    attestation = result.get("self_attestation")
    if exact_keys(attestation, ATTESTATION_KEYS, "self_attestation", errors):
        if any(attestation.get(key) is not True for key in ATTESTATION_KEYS):
            errors.append("self_attestation:not_all_true")
    return sorted(set(errors))


def prior_agent_paths() -> set[str]:
    paths: set[str] = set()
    for root in (ROOT / "master/macro/dispatch", ROOT / "master/feature_catalog/dispatch"):
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
    batch = OWNER_ROOT / "batches" / BATCH_ID
    epoch = OWNER_ROOT / "frozen" / OWNER_EPOCH
    assignments = load_jsonl(batch / "batch_manifest.jsonl")
    capture_path = OWNER_ROOT / "runtime" / BATCH_ID / "native_capture.json"
    capture = load_obj(capture_path) if capture_path.is_file() else {}
    capture_by_assignment = {
        row.get("assignment_id"): row for row in capture.get("leaves", []) if isinstance(row, dict)
    }
    prior_paths = prior_agent_paths()
    results: list[dict[str, Any]] = []
    current_paths: list[str] = []
    for assignment in assignments:
        assignment_id = assignment["assignment_id"]
        intent_path = OWNER_ROOT / "dispatch" / BATCH_ID / assignment_id / OWNER_ATTEMPT / "dispatch_intent.json"
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
        if isinstance(identity, str):
            current_paths.append(identity)
        native = capture_by_assignment.get(assignment_id)
        if not isinstance(native, dict):
            errors.append("native:capture_missing")
        else:
            if native.get("agent_path") != identity or native.get("native_child_turn_status") != "completed":
                errors.append("native:identity_or_status")
            if native.get("native_child_thread_state") != "idle" or native.get("native_child_turn_error") is not None:
                errors.append("native:terminal_state")
            if native.get("terminal_response_prefix") != "PMR1":
                errors.append("native:terminal_response")
            if not isinstance(native.get("native_child_thread_id"), str) or not isinstance(native.get("native_child_turn_id"), str):
                errors.append("native:thread_ids")
        output = Path(intent["output_directory"])
        payloads = sorted(path for path in output.iterdir() if path.is_file()) if output.is_dir() else []
        if len(payloads) != 1 or payloads[0].suffix != ".json":
            state = "pending" if not payloads else "rejected"
            results.append({
                "assignment_id": assignment_id,
                "state": state,
                "errors": sorted(set(errors + [f"payload_count:{len(payloads)}"])),
            })
            continue
        payload_path = payloads[0]
        try:
            payload = json.loads(payload_path.read_bytes())
        except Exception as exc:
            errors.append(f"payload_parse:{type(exc).__name__}")
            payload = None
        if payload is not None:
            packet = load_obj(Path(intent["packet_ref"]))
            errors.extend(result_errors(payload, assignment, packet, receipt))
        results.append({
            "assignment_id": assignment_id,
            "attempt_id": OWNER_ATTEMPT,
            "task_thread_id": identity,
            "state": "eligible" if not errors else "rejected",
            "errors": sorted(set(errors)),
            "result_path": payload_path.relative_to(ROOT).as_posix(),
            "result_sha256": sha(payload_path.read_bytes()),
            "result_bytes": len(payload_path.read_bytes()),
            "provisional_feature_count": len(payload.get("provisional_features", [])) if isinstance(payload, dict) else None,
            "local_feature_count": assignment["local_feature_count"],
        })
    duplicates = {value for value, count in Counter(current_paths).items() if count > 1}
    if duplicates:
        for row in results:
            if row.get("task_thread_id") in duplicates:
                row["state"] = "rejected"
                row["errors"] = sorted(set(row.get("errors", []) + ["identity:duplicate_in_batch"]))
    counts = Counter(row["state"] for row in results)
    report = {
        "audit_id": assignments[0]["audit_id"] if assignments else None,
        "validator": "owner_merge_primary_v1",
        "epoch_id": OWNER_EPOCH,
        "batch_id": BATCH_ID,
        "status": "pass" if counts["eligible"] == len(assignments) else ("in_progress" if counts["pending"] else "partial"),
        "counts": {
            "assignments": len(assignments),
            "eligible": counts["eligible"],
            "pending": counts["pending"],
            "rejected": counts["rejected"],
        },
        "eligible_assignment_ids": sorted(row["assignment_id"] for row in results if row["state"] == "eligible"),
        "results": results,
    }
    print(json.dumps(report, indent=2, sort_keys=True))


if __name__ == "__main__":
    main()
