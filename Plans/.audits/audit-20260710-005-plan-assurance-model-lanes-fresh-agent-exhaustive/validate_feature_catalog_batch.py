#!/usr/bin/env python3
"""Strict primary validator for the Audit 005 feature-catalog wave."""

from __future__ import annotations

import json
import re
from collections import Counter
from pathlib import Path
from typing import Any

from feature_catalog_common import (
    CATALOG_ATTEMPT,
    CATALOG_EPOCH,
    CATALOG_ROOT,
    FEATURE_KINDS,
    OWNER_DOMAINS,
    RISK_LEVELS,
    ROOT,
    SPEC_STATES,
    digest_strings,
    load_jsonl,
    load_obj,
    sha,
)
from prepare_feature_catalog_batch import BATCH_ID, SOL_CONTROLLER


TOP_KEYS = {
    "audit_id", "schema_version", "phase", "assignment_id", "attempt_id", "task_thread_id",
    "model", "reasoning_effort", "status", "input_binding", "coverage", "features",
    "relationships", "family_key_assignments", "self_attestation",
}
INPUT_KEYS = {"packet_id", "packet_sha256", "atom_ids_digest", "family_keys_digest"}
COVERAGE_KEYS = {"assigned_atom_count", "assigned_atom_ids", "assigned_family_key_count", "assigned_family_keys"}
FEATURE_KEYS = {
    "feature_id", "title", "summary", "feature_kind", "owner_domain", "secondary_domains",
    "aliases", "atom_ids", "source_documents", "source_unit_refs", "risk_level", "spec_state",
    "gap_summary", "research_questions", "scenario_requirements", "cross_packet_terms", "confidence",
}
RELATIONSHIP_KEYS = {"source_feature_id", "target_feature_id", "relationship_type", "evidence_atom_ids", "rationale"}
FAMILY_KEYS = {"family_key", "feature_ids"}
ATTESTATION_KEYS = {
    "all_atoms_partitioned_once", "all_family_keys_mapped", "distinct_features_not_collapsed",
    "gaps_and_non_gaps_preserved", "research_deferred_not_omitted", "no_peer_or_external_inputs_used",
}
RELATIONSHIP_TYPES = {"depends_on", "duplicates", "extends", "governs", "interacts_with", "is_surface_of", "potential_conflict"}
RECEIPT_KEYS = {
    "audit_id", "schema_version", "epoch_id", "batch_id", "assignment_id", "attempt_id",
    "controller_thread_id", "agent_path", "task_thread_id", "model", "reasoning_effort",
    "fresh_child", "fork_turns", "dispatch_intent_sha256", "packet_sha256", "output_directory",
}


def string_list(value: Any, *, nonempty: bool = False) -> bool:
    return (
        isinstance(value, list)
        and (not nonempty or len(value) > 0)
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


def receipt_errors(receipt: dict, assignment: dict, intent_path: Path, intent: dict) -> list[str]:
    errors: list[str] = []
    if set(receipt) != RECEIPT_KEYS:
        errors.append("receipt:keys")
    constants = {
        "audit_id": assignment["audit_id"],
        "schema_version": "feature-catalog-dispatch-receipt-v1",
        "epoch_id": CATALOG_EPOCH,
        "batch_id": BATCH_ID,
        "assignment_id": assignment["assignment_id"],
        "attempt_id": CATALOG_ATTEMPT,
        "controller_thread_id": SOL_CONTROLLER,
        "model": "gpt-5.6-sol",
        "reasoning_effort": "xhigh",
        "fresh_child": True,
        "fork_turns": "none",
        "packet_sha256": assignment["packet_sha256"],
        "output_directory": intent["output_directory"],
        "dispatch_intent_sha256": sha(intent_path.read_bytes()),
    }
    for key, expected in constants.items():
        if receipt.get(key) != expected:
            errors.append(f"receipt:{key}")
    identity = receipt.get("agent_path")
    if not isinstance(identity, str) or not identity.startswith("/root/") or receipt.get("task_thread_id") != identity:
        errors.append("receipt:identity")
    return errors


def result_errors(result: Any, assignment: dict, packet: dict, receipt: dict, atom_by_id: dict[str, dict]) -> list[str]:
    errors: list[str] = []
    if not exact_keys(result, TOP_KEYS, "result", errors):
        return errors
    constants = {
        "audit_id": assignment["audit_id"], "schema_version": "feature-catalog-result-v1",
        "phase": "feature_catalog_normalization", "assignment_id": assignment["assignment_id"],
        "attempt_id": CATALOG_ATTEMPT, "task_thread_id": receipt["agent_path"],
        "model": "gpt-5.6-sol", "reasoning_effort": "xhigh", "status": "completed",
    }
    for key, expected in constants.items():
        if result.get(key) != expected:
            errors.append(f"result:{key}")
    binding = result.get("input_binding")
    if exact_keys(binding, INPUT_KEYS, "input_binding", errors):
        expected_binding = {
            "packet_id": assignment["packet_id"], "packet_sha256": assignment["packet_sha256"],
            "atom_ids_digest": assignment["atom_ids_digest"], "family_keys_digest": assignment["family_keys_digest"],
        }
        if binding != expected_binding:
            errors.append("input_binding:values")
    coverage = result.get("coverage")
    if exact_keys(coverage, COVERAGE_KEYS, "coverage", errors):
        if coverage.get("assigned_atom_count") != assignment["atom_count"] or coverage.get("assigned_atom_ids") != assignment["atom_ids"]:
            errors.append("coverage:atoms")
        if coverage.get("assigned_family_key_count") != assignment["family_key_count"] or coverage.get("assigned_family_keys") != assignment["family_keys"]:
            errors.append("coverage:family_keys")
    features = result.get("features")
    if not isinstance(features, list) or not features:
        errors.append("features:empty_or_not_array")
        features = []
    feature_ids: list[str] = []
    feature_atoms: list[str] = []
    atoms_per_feature: dict[str, set[str]] = {}
    for index, feature in enumerate(features):
        label = f"feature:{index}"
        if not exact_keys(feature, FEATURE_KEYS, label, errors):
            continue
        feature_id = feature.get("feature_id")
        if not isinstance(feature_id, str) or re.fullmatch(r"FLOCAL-[0-9]{4}", feature_id) is None:
            errors.append(f"{label}:feature_id")
            continue
        feature_ids.append(feature_id)
        for field in ("title", "summary"):
            if not isinstance(feature.get(field), str) or not feature[field].strip():
                errors.append(f"{label}:{field}")
        if feature.get("feature_kind") not in FEATURE_KINDS:
            errors.append(f"{label}:feature_kind")
        if feature.get("owner_domain") not in OWNER_DOMAINS:
            errors.append(f"{label}:owner_domain")
        if not string_list(feature.get("secondary_domains")) or any(value not in OWNER_DOMAINS for value in feature.get("secondary_domains", [])) or feature.get("owner_domain") in feature.get("secondary_domains", []):
            errors.append(f"{label}:secondary_domains")
        for field, nonempty in (("aliases", False), ("atom_ids", True), ("source_documents", True), ("source_unit_refs", True), ("research_questions", True), ("scenario_requirements", True), ("cross_packet_terms", False)):
            if not string_list(feature.get(field), nonempty=nonempty):
                errors.append(f"{label}:{field}")
        atom_ids = feature.get("atom_ids", []) if isinstance(feature.get("atom_ids"), list) else []
        if any(atom_id not in assignment["atom_ids"] for atom_id in atom_ids):
            errors.append(f"{label}:atom_ids_binding")
        feature_atoms.extend(atom_ids)
        atoms_per_feature[feature_id] = set(atom_ids)
        expected_documents = sorted({atom_by_id[atom_id]["document_path"] for atom_id in atom_ids if atom_id in atom_by_id})
        expected_refs = sorted({ref for atom_id in atom_ids if atom_id in atom_by_id for ref in atom_by_id[atom_id]["item"]["source_unit_refs"]})
        if sorted(feature.get("source_documents", [])) != expected_documents:
            errors.append(f"{label}:source_documents")
        if sorted(feature.get("source_unit_refs", [])) != expected_refs:
            errors.append(f"{label}:source_unit_refs")
        if feature.get("risk_level") not in RISK_LEVELS or feature.get("spec_state") not in SPEC_STATES:
            errors.append(f"{label}:risk_or_spec_state")
        if not isinstance(feature.get("gap_summary"), str):
            errors.append(f"{label}:gap_summary")
        confidence = feature.get("confidence")
        if isinstance(confidence, bool) or not isinstance(confidence, (int, float)) or not 0 <= confidence <= 1:
            errors.append(f"{label}:confidence")
    if len(feature_ids) != len(set(feature_ids)):
        errors.append("features:duplicate_ids")
    if len(feature_atoms) != len(set(feature_atoms)) or set(feature_atoms) != set(assignment["atom_ids"]):
        errors.append("features:atom_partition")

    relationships = result.get("relationships")
    if not isinstance(relationships, list):
        errors.append("relationships:not_array")
        relationships = []
    relationship_keys: list[tuple[str, str, str]] = []
    for index, relationship in enumerate(relationships):
        label = f"relationship:{index}"
        if not exact_keys(relationship, RELATIONSHIP_KEYS, label, errors):
            continue
        source = relationship.get("source_feature_id")
        target = relationship.get("target_feature_id")
        kind = relationship.get("relationship_type")
        if source not in atoms_per_feature or target not in atoms_per_feature or source == target:
            errors.append(f"{label}:feature_ids")
        if kind not in RELATIONSHIP_TYPES:
            errors.append(f"{label}:type")
        evidence = relationship.get("evidence_atom_ids")
        if not string_list(evidence, nonempty=True):
            errors.append(f"{label}:evidence")
        elif source in atoms_per_feature and target in atoms_per_feature and not set(evidence) <= (atoms_per_feature[source] | atoms_per_feature[target]):
            errors.append(f"{label}:evidence_binding")
        if not isinstance(relationship.get("rationale"), str) or not relationship["rationale"].strip():
            errors.append(f"{label}:rationale")
        relationship_keys.append((str(source), str(target), str(kind)))
    if len(relationship_keys) != len(set(relationship_keys)):
        errors.append("relationships:duplicates")

    family_rows = result.get("family_key_assignments")
    if not isinstance(family_rows, list):
        errors.append("family_key_assignments:not_array")
        family_rows = []
    observed_family_keys: list[str] = []
    for index, row in enumerate(family_rows):
        label = f"family_key_assignment:{index}"
        if not exact_keys(row, FAMILY_KEYS, label, errors):
            continue
        key = row.get("family_key")
        mapped = row.get("feature_ids")
        if key not in assignment["family_keys"]:
            errors.append(f"{label}:family_key")
        if not string_list(mapped, nonempty=True) or any(feature_id not in atoms_per_feature for feature_id in mapped):
            errors.append(f"{label}:feature_ids")
        observed_family_keys.append(key)
    if set(observed_family_keys) != set(assignment["family_keys"]) or len(observed_family_keys) != len(set(observed_family_keys)):
        errors.append("family_key_assignments:exact_coverage")

    attestation = result.get("self_attestation")
    if exact_keys(attestation, ATTESTATION_KEYS, "self_attestation", errors):
        if any(attestation.get(key) is not True for key in ATTESTATION_KEYS):
            errors.append("self_attestation:not_all_true")
    return sorted(set(errors))


def main() -> None:
    batch = CATALOG_ROOT / "batches" / BATCH_ID
    epoch = CATALOG_ROOT / "frozen" / CATALOG_EPOCH
    assignments = load_jsonl(batch / "batch_manifest.jsonl")
    atom_by_id = {row["atom_id"]: row for row in load_jsonl(epoch / "manifests/atom_ledger.jsonl")}
    capture_path = CATALOG_ROOT / "runtime" / BATCH_ID / "native_capture.json"
    capture = load_obj(capture_path) if capture_path.is_file() else {}
    capture_by_assignment = {row.get("assignment_id"): row for row in capture.get("leaves", []) if isinstance(row, dict)}
    prior_paths: set[str] = set()
    for path in sorted((ROOT / "master/macro/dispatch").glob("**/dispatch_receipt.json")):
        prior_paths.add(str(load_obj(path).get("agent_path")))
    for path in sorted(CATALOG_ROOT.glob("dispatch/*/*/*/dispatch_receipt.json")):
        if BATCH_ID not in path.parts:
            prior_paths.add(str(load_obj(path).get("agent_path")))
    results: list[dict[str, Any]] = []
    current_paths: list[str] = []
    for assignment in assignments:
        assignment_id = assignment["assignment_id"]
        intent_path = CATALOG_ROOT / "dispatch" / BATCH_ID / assignment_id / CATALOG_ATTEMPT / "dispatch_intent.json"
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
            if native.get("native_child_thread_state") != "idle" or native.get("native_child_turn_error") is not None or native.get("terminal_response_prefix") != "PMR1":
                errors.append("native:terminal_proof")
            if not isinstance(native.get("native_child_thread_id"), str) or not isinstance(native.get("native_child_turn_id"), str):
                errors.append("native:thread_ids")
        output = Path(intent["output_directory"])
        payloads = sorted(path for path in output.iterdir() if path.is_file()) if output.is_dir() else []
        if len(payloads) != 1 or payloads[0].suffix != ".json":
            state = "pending" if len(payloads) == 0 else "rejected"
            results.append({"assignment_id": assignment_id, "state": state, "errors": sorted(set(errors + [f"payload_count:{len(payloads)}"]))})
            continue
        payload_path = payloads[0]
        try:
            payload = json.loads(payload_path.read_bytes())
        except Exception as exc:
            errors.append(f"payload_parse:{type(exc).__name__}")
            payload = None
        if payload is not None:
            packet = load_obj(Path(intent["packet_ref"]))
            errors.extend(result_errors(payload, assignment, packet, receipt, atom_by_id))
        results.append({
            "assignment_id": assignment_id,
            "attempt_id": CATALOG_ATTEMPT,
            "task_thread_id": identity,
            "state": "eligible" if not errors else "rejected",
            "errors": sorted(set(errors)),
            "result_path": payload_path.relative_to(ROOT).as_posix(),
            "result_sha256": sha(payload_path.read_bytes()),
            "result_bytes": len(payload_path.read_bytes()),
            "feature_count": len(payload.get("features", [])) if isinstance(payload, dict) else None,
            "atom_count": assignment["atom_count"],
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
        "validator": "feature_catalog_primary_v1",
        "epoch_id": CATALOG_EPOCH,
        "batch_id": BATCH_ID,
        "status": "pass" if counts["eligible"] == len(assignments) else ("in_progress" if counts["pending"] else "partial"),
        "counts": {"assignments": len(assignments), "eligible": counts["eligible"], "pending": counts["pending"], "rejected": counts["rejected"]},
        "eligible_assignment_ids": sorted(row["assignment_id"] for row in results if row["state"] == "eligible"),
        "results": results,
    }
    print(json.dumps(report, indent=2, sort_keys=True))
    raise SystemExit(0)


if __name__ == "__main__":
    main()
