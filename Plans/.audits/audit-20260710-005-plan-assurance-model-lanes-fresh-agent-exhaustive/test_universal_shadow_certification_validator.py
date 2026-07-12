#!/usr/bin/env python3
"""Strict negative-test harness for universal shadow certification."""

from __future__ import annotations

import copy
import json
from pathlib import Path
from typing import Any, Callable

from prepare_universal_shadow_certification_wave import STATUS, packet_models
from universal_shadow_certification_common import (
    ASSIGNMENT_COUNT, ATTEMPT_ID, AUDIT_ID, AUDIT_ROOT, CONTROLLER_THREAD_ID,
    EFFORT, FEATURE_COUNT, FEATURES_PER_ASSIGNMENT, MODEL, NAMESPACE, OUTPUT_ROOT,
    PACKET_CEILING_BYTES, SOURCE_NAMESPACE, V9_SHA256, WAVE_ID, canonical_json,
    digest_values, receipt_contract, reconstruct_source_snapshot, sha_bytes,
    source_transaction_digest, validate_result_document,
)


def valid_result(assignment: dict[str, Any], packet: dict[str, Any]) -> dict[str, Any]:
    rows = []
    for feature in packet["features"]:
        rows.append({
            "provisional_feature_ref": feature["provisional_feature_ref"],
            "source_row_sha256": feature["source_row_sha256"],
            "source_result_sha256": feature["source_result_sha256"],
            "decision": "pass",
            "decision_reason": "The bound plan atom, candidate research, and independent source check align for this certification decision.",
            "plan_atom_review": "Reviewed the exact packet-bound plan atom references.",
            "source_registry_review": "Verified source existence, authority, recency, and direct applicability.",
            "claim_mapping_review": "Rechecked each candidate claim against its registered supporting sources.",
            "coverage_dimensions": {key: "verified" for key in ["competitors", "standards", "security", "privacy", "accessibility", "operations"]},
            "citations": [{
                "citation_id": "CERT-1",
                "url": "https://example.org/official/section",
                "title": "Authoritative reference",
                "publisher": "Example Standards Body",
                "source_type": "official_standard",
                "accessed_date": "2026-07-11",
                "section_anchor": "Section 1",
                "supported_certification_claims": ["independent certification basis"],
                "evidence_label": "Direct normative section supports the certification decision.",
            }],
            "findings": [],
            "live_web_research_performed": True,
            "under_specified": False,
        })
    return {
        "audit_id": AUDIT_ID,
        "schema_version": "external-research-universal-shadow-certification-result-v1",
        "phase": "universal_external_research_shadow_certification",
        "wave_id": WAVE_ID,
        "assignment_id": assignment["assignment_id"],
        "attempt_id": ATTEMPT_ID,
        "agent_path": assignment["prospective_agent_path"],
        "model": MODEL,
        "reasoning_effort": EFFORT,
        "status": "completed",
        "input_binding": {"packet_id": assignment["packet_id"], "packet_sha256": assignment["packet_sha256"], "feature_refs_digest": assignment["feature_refs_digest"], "source_transaction_digest": source_transaction_digest()},
        "coverage": {"feature_count": FEATURES_PER_ASSIGNMENT, "feature_refs": assignment["feature_refs"]},
        "feature_certifications": rows,
        "self_attestation": {key: True for key in ["every_feature_certified_once", "source_files_and_hashes_verified", "claim_to_source_mapping_rechecked", "live_web_used_when_needed", "no_promotion_merge_repair_or_source_edit", "no_descendants_or_peer_outputs"]},
    }


def mutate_fails(base: dict[str, Any], assignment: dict[str, Any], packet: dict[str, Any], change: Callable[[dict[str, Any]], None]) -> bool:
    candidate = copy.deepcopy(base)
    change(candidate)
    return bool(validate_result_document(candidate, assignment, packet))


def receipt_errors(receipt: dict[str, Any], assignment: dict[str, Any]) -> list[str]:
    errors = []
    contract = receipt_contract()
    if set(receipt) != set(contract["required_keys"]):
        errors.append("keys")
    expected = {"audit_id": AUDIT_ID, "schema_version": "external-research-universal-shadow-certification-dispatch-receipt-v1", "wave_id": WAVE_ID, "assignment_id": assignment["assignment_id"], "attempt_id": ATTEMPT_ID, "controller_thread_id": CONTROLLER_THREAD_ID, "model": MODEL, "reasoning_effort": EFFORT, "fresh_child": True, "fork_turns": "none", "packet_sha256": assignment["packet_sha256"], "output_directory": assignment["output_directory"]}
    for key, value in expected.items():
        if receipt.get(key) != value:
            errors.append(key)
    if receipt.get("agent_path") != assignment["prospective_agent_path"] or receipt.get("task_thread_id") != receipt.get("agent_path"):
        errors.append("agent_path")
    for key in ("native_child_thread_id", "dispatch_intent_sha256", "result_sha256"):
        if not isinstance(receipt.get(key), str) or not receipt.get(key):
            errors.append(key)
    if receipt.get("dispatch_intent_sha256") != "1" * 64:
        errors.append("dispatch_intent_sha256-binding")
    if receipt.get("result_sha256") != "2" * 64:
        errors.append("result_sha256-binding")
    return errors


def luna_errors(report: dict[str, Any], authority: dict[str, Any], ids: list[str]) -> list[str]:
    expected = {"audit_id": AUDIT_ID, "wave_id": WAVE_ID, "status": "pass", "independent": True, "assignment_count": ASSIGNMENT_COUNT, "feature_count": FEATURE_COUNT, "features_per_assignment": FEATURES_PER_ASSIGNMENT, "coverage_digest": authority["coverage_digest"], "assignment_ids": ids, "v9_sha256": V9_SHA256, "unresolved_errors": [], "activation_authorized": True}
    return [key for key, value in expected.items() if report.get(key) != value]


def prelaunch_errors(output_file_count: int, receipt_count: int, result_count: int, capture_count: int, activation_count: int) -> list[str]:
    values = {"output": output_file_count, "receipt": receipt_count, "result": result_count, "capture": capture_count, "activation": activation_count}
    return [key for key, value in values.items() if value != 0]


def terminal_flow_errors(receipt: dict[str, Any], assignment: dict[str, Any], output_names: list[str], capture: dict[str, Any]) -> list[str]:
    errors = receipt_errors(receipt, assignment)
    if output_names != ["result.json"]:
        errors.append("output-confinement")
    if capture.get("assignment_id") != assignment["assignment_id"] or capture.get("agent_path") != assignment["prospective_agent_path"]:
        errors.append("capture-binding")
    if capture.get("native_child_thread_id") != receipt.get("native_child_thread_id"):
        errors.append("capture-native-thread")
    if capture.get("native_child_turn_status") != "completed" or not str(capture.get("terminal_response_prefix", "")).startswith("PMR1"):
        errors.append("capture-terminal")
    return errors


def main() -> None:
    tests: dict[str, bool] = {}
    snapshot = reconstruct_source_snapshot()
    packets, manifest, registry = packet_models()
    all_refs = [ref for packet in packets for ref in packet["feature_refs"]]
    tests["valid_global_source_snapshot"] = len(snapshot["records"]) == FEATURE_COUNT
    tests["valid_exact_assignment_count"] = len(manifest) == ASSIGNMENT_COUNT
    tests["valid_exact_packet_count"] = len(packets) == ASSIGNMENT_COUNT
    tests["valid_exact_registry_count"] = len(registry) == ASSIGNMENT_COUNT
    tests["valid_exact_3888_coverage"] = len(all_refs) == FEATURE_COUNT
    tests["valid_unique_3888_coverage"] = len(set(all_refs)) == FEATURE_COUNT
    tests["valid_source_coverage_equality"] = set(all_refs) == {row["provisional_feature_ref"] for row in snapshot["records"]}
    tests["valid_assignment_path_uniqueness"] = len({row["prospective_agent_path"] for row in manifest}) == ASSIGNMENT_COUNT
    tests["valid_output_path_uniqueness"] = len({row["output_directory"] for row in manifest}) == ASSIGNMENT_COUNT
    tests["valid_no_source_identity_reuse"] = not ({row["prospective_agent_path"] for row in manifest} & {leaf["agent_path"] for leaf in json.loads((SOURCE_NAMESPACE / "runtime/native_capture.json").read_text())["leaves"]})
    tests["valid_namespace_disjoint_from_scenario"] = "scenario_adversarial" not in str(NAMESPACE) and "scenario_adversarial" not in str(OUTPUT_ROOT)
    tests["valid_v9_exact"] = V9_SHA256 == "0f9dae3c8406be8ab1159f610b6465120049d0057aa81031d6826fb9ba88b592"
    tests["valid_transaction_cap_16"] = ASSIGNMENT_COUNT == 16
    tests["valid_no_atomic_32"] = ASSIGNMENT_COUNT != 32
    tests["valid_blocked_status"] = STATUS == "BLOCKED_AWAITING_INDEPENDENT_PRELAUNCH"
    for index, (packet, row) in enumerate(zip(packets, manifest), 1):
        prefix = "packet_%02d_" % index
        raw = canonical_json(packet)
        tests[prefix + "exact_243"] = packet["feature_count"] == len(packet["feature_refs"]) == FEATURES_PER_ASSIGNMENT
        tests[prefix + "unique_features"] = len(set(packet["feature_refs"])) == FEATURES_PER_ASSIGNMENT
        tests[prefix + "all_16_domains"] = len(packet["owner_domain_counts"]) == 16
        tests[prefix + "all_24_source_assignments"] = len(packet["source_assignment_counts"]) == 24
        tests[prefix + "under_ceiling"] = len(raw) <= PACKET_CEILING_BYTES
        tests[prefix + "hash_binding"] = sha_bytes(raw) == row["packet_sha256"]
        tests[prefix + "coverage_digest"] = digest_values(packet["feature_refs"]) == row["feature_refs_digest"]
        tests[prefix + "model_effort_controller"] = row["model"] == MODEL and row["reasoning_effort"] == EFFORT and row["controller_thread_id"] == CONTROLLER_THREAD_ID
        tests[prefix + "fresh_direct_isolation"] = row["fork_turns"] == "none" and row["fresh_child_required"] and row["descendants_forbidden"] and row["followup_messages_forbidden"]
        tests[prefix + "source_registry_fidelity"] = all(len(feature["source_registry_digest"]) == 64 and all(len(source["source_record_sha256"]) == 64 and len(source["evidence_record_sha256"]) == 64 for source in feature["source_registry_refs"]) for feature in packet["features"])
        tests[prefix + "claim_source_binding"] = all(all(set(claim["source_ids"]).issubset({source["source_id"] for source in feature["source_registry_refs"]}) for claim in feature["supported_claim_refs"]) for feature in packet["features"])
        tests[prefix + "source_result_hash_binding"] = all(len(feature["source_result_sha256"]) == 64 and Path(feature["source_result_ref"]).is_file() for feature in packet["features"])

    assignment = manifest[0]
    packet = packets[0]
    base = valid_result(assignment, packet)
    tests["valid_synthetic_result"] = not validate_result_document(base, assignment, packet)
    mutations: list[tuple[str, Callable[[dict[str, Any]], None]]] = [
        ("extra_top_key", lambda x: x.update(extra=True)),
        ("forbidden_task_thread_id", lambda x: x.update(task_thread_id="native")),
        ("missing_assignment", lambda x: x.pop("assignment_id")),
        ("wrong_audit", lambda x: x.update(audit_id="wrong")),
        ("wrong_schema", lambda x: x.update(schema_version="wrong")),
        ("wrong_phase", lambda x: x.update(phase="wrong")),
        ("wrong_wave", lambda x: x.update(wave_id="wrong")),
        ("wrong_assignment", lambda x: x.update(assignment_id="A005ERSC-9999")),
        ("wrong_attempt", lambda x: x.update(attempt_id="attempt-0002")),
        ("wrong_agent_path", lambda x: x.update(agent_path="/root/reused")),
        ("wrong_model", lambda x: x.update(model="other")),
        ("wrong_effort", lambda x: x.update(reasoning_effort="high")),
        ("wrong_status", lambda x: x.update(status="partial")),
        ("input_extra_key", lambda x: x["input_binding"].update(extra=True)),
        ("wrong_packet_id", lambda x: x["input_binding"].update(packet_id="wrong")),
        ("wrong_packet_hash", lambda x: x["input_binding"].update(packet_sha256="0" * 64)),
        ("wrong_feature_digest", lambda x: x["input_binding"].update(feature_refs_digest="0" * 64)),
        ("wrong_source_transaction", lambda x: x["input_binding"].update(source_transaction_digest="0" * 64)),
        ("coverage_count", lambda x: x["coverage"].update(feature_count=242)),
        ("coverage_order", lambda x: x["coverage"]["feature_refs"].reverse()),
        ("missing_feature", lambda x: x["feature_certifications"].pop()),
        ("duplicate_feature", lambda x: x["feature_certifications"].__setitem__(1, copy.deepcopy(x["feature_certifications"][0]))),
        ("foreign_feature", lambda x: x["feature_certifications"][0].update(provisional_feature_ref="FOREIGN")),
        ("feature_extra_key", lambda x: x["feature_certifications"][0].update(extra=True)),
        ("wrong_source_row_hash", lambda x: x["feature_certifications"][0].update(source_row_sha256="0" * 64)),
        ("wrong_source_result_hash", lambda x: x["feature_certifications"][0].update(source_result_sha256="0" * 64)),
        ("missing_decision", lambda x: x["feature_certifications"][0].update(decision="")),
        ("missing_decision_reason", lambda x: x["feature_certifications"][0].update(decision_reason="")),
        ("missing_plan_review", lambda x: x["feature_certifications"][0].update(plan_atom_review="")),
        ("missing_registry_review", lambda x: x["feature_certifications"][0].update(source_registry_review="")),
        ("missing_claim_review", lambda x: x["feature_certifications"][0].update(claim_mapping_review="")),
        ("missing_dimension", lambda x: x["feature_certifications"][0]["coverage_dimensions"].pop("privacy")),
        ("wrong_dimension", lambda x: x["feature_certifications"][0]["coverage_dimensions"].update(security="unknown")),
        ("pass_without_evidence", lambda x: x["feature_certifications"][0].update(citations=[])),
        ("citation_extra_key", lambda x: x["feature_certifications"][0]["citations"][0].update(extra=True)),
        ("citation_non_https", lambda x: x["feature_certifications"][0]["citations"][0].update(url="http://example.org")),
        ("citation_whitespace", lambda x: x["feature_certifications"][0]["citations"][0].update(url="https://example.org/a b")),
        ("citation_missing_claim", lambda x: x["feature_certifications"][0]["citations"][0].update(supported_certification_claims=[])),
        ("citation_missing_evidence", lambda x: x["feature_certifications"][0]["citations"][0].update(evidence_label="")),
        ("citation_wrong_type", lambda x: x["feature_certifications"][0]["citations"][0].update(source_type="blog")),
        ("citation_missing_title", lambda x: x["feature_certifications"][0]["citations"][0].update(title="")),
        ("duplicate_citation", lambda x: x["feature_certifications"][0]["citations"].append(copy.deepcopy(x["feature_certifications"][0]["citations"][0]))),
        ("nonpass_without_finding", lambda x: x["feature_certifications"][0].update(decision="fail", findings=[])),
        ("nonpass_without_citation", lambda x: x["feature_certifications"][0].update(decision="uncertain", citations=[], findings=[{"finding_id":"F","category":"authority","statement":"gap","severity":"high","citation_ids":[],"source_claim_ids":[],"normalized_spec_implication":"delta"}])),
        ("missing_attestation", lambda x: x["self_attestation"].pop("live_web_used_when_needed")),
        ("false_attestation", lambda x: x["self_attestation"].update(live_web_used_when_needed=False)),
        ("extra_attestation", lambda x: x["self_attestation"].update(extra=True)),
    ]
    for name, mutation in mutations:
        tests["reject_result_" + name] = mutate_fails(base, assignment, packet, mutation)

    valid_receipt = {
        "audit_id": AUDIT_ID, "schema_version": "external-research-universal-shadow-certification-dispatch-receipt-v1", "wave_id": WAVE_ID,
        "assignment_id": assignment["assignment_id"], "attempt_id": ATTEMPT_ID, "controller_thread_id": CONTROLLER_THREAD_ID,
        "agent_path": assignment["prospective_agent_path"], "task_thread_id": assignment["prospective_agent_path"], "native_child_thread_id": "native-unique",
        "model": MODEL, "reasoning_effort": EFFORT, "fresh_child": True, "fork_turns": "none", "dispatch_intent_sha256": "1" * 64,
        "packet_sha256": assignment["packet_sha256"], "result_sha256": "2" * 64, "output_directory": assignment["output_directory"],
    }
    tests["valid_synthetic_receipt"] = not receipt_errors(valid_receipt, assignment)
    receipt_mutations = {
        "extra_key": lambda x: x.update(extra=True), "missing_key": lambda x: x.pop("result_sha256"), "wrong_model": lambda x: x.update(model="other"),
        "wrong_effort": lambda x: x.update(reasoning_effort="high"), "wrong_controller": lambda x: x.update(controller_thread_id="wrong"),
        "wrong_packet": lambda x: x.update(packet_sha256="0" * 64), "wrong_agent": lambda x: x.update(agent_path="/root/reused"),
        "task_path_mismatch": lambda x: x.update(task_thread_id="/root/other"), "missing_native": lambda x: x.update(native_child_thread_id=""),
        "wrong_intent_hash": lambda x: x.update(dispatch_intent_sha256="0" * 64), "wrong_result_hash": lambda x: x.update(result_sha256="0" * 64),
        "not_fresh": lambda x: x.update(fresh_child=False), "wrong_fork": lambda x: x.update(fork_turns="all"), "wrong_output": lambda x: x.update(output_directory="/tmp"),
    }
    for name, mutation in receipt_mutations.items():
        candidate = copy.deepcopy(valid_receipt); mutation(candidate)
        tests["reject_receipt_" + name] = bool(receipt_errors(candidate, assignment))

    tests["valid_zero_state"] = not prelaunch_errors(0, 0, 0, 0, 0)
    for name, values in {
        "nonempty_output": (1, 0, 0, 0, 0), "existing_receipt": (0, 1, 0, 0, 0), "existing_result": (0, 0, 1, 0, 0),
        "existing_capture": (0, 0, 0, 1, 0), "existing_activation": (0, 0, 0, 0, 1), "mixed_nonzero": (1, 1, 1, 1, 1),
    }.items():
        tests["reject_prelaunch_" + name] = bool(prelaunch_errors(*values))
    valid_capture = {"assignment_id": assignment["assignment_id"], "agent_path": assignment["prospective_agent_path"], "native_child_thread_id": "native-unique", "native_child_turn_id": "turn-unique", "native_child_turn_status": "completed", "terminal_response_prefix": "PMR1"}
    tests["valid_synthetic_terminal_flow"] = not terminal_flow_errors(valid_receipt, assignment, ["result.json"], valid_capture)
    flow_mutations = {
        "extra_output": lambda r, c: None,
        "missing_output": lambda r, c: None,
        "wrong_capture_assignment": lambda r, c: c.update(assignment_id="wrong"),
        "wrong_capture_path": lambda r, c: c.update(agent_path="/root/reused"),
        "capture_receipt_thread_mismatch": lambda r, c: c.update(native_child_thread_id="other"),
        "capture_not_completed": lambda r, c: c.update(native_child_turn_status="failed"),
        "capture_no_pmr1": lambda r, c: c.update(terminal_response_prefix="ERROR"),
    }
    for name, mutation in flow_mutations.items():
        receipt_candidate = copy.deepcopy(valid_receipt); capture_candidate = copy.deepcopy(valid_capture); mutation(receipt_candidate, capture_candidate)
        names = ["result.json", "extra.json"] if name == "extra_output" else ([] if name == "missing_output" else ["result.json"])
        tests["reject_terminal_flow_" + name] = bool(terminal_flow_errors(receipt_candidate, assignment, names, capture_candidate))

    authority = {"coverage_digest": digest_values(all_refs)}
    ids = [row["assignment_id"] for row in manifest]
    valid_luna = {"audit_id": AUDIT_ID, "wave_id": WAVE_ID, "status": "pass", "independent": True, "assignment_count": 16, "feature_count": 3888, "features_per_assignment": 243, "coverage_digest": authority["coverage_digest"], "assignment_ids": ids, "v9_sha256": V9_SHA256, "unresolved_errors": [], "activation_authorized": True}
    tests["valid_synthetic_luna_gate"] = not luna_errors(valid_luna, authority, ids)
    luna_mutations = {
        "wrong_audit": lambda x: x.update(audit_id="wrong"), "wrong_wave": lambda x: x.update(wave_id="scenario"), "fail_status": lambda x: x.update(status="fail"),
        "not_independent": lambda x: x.update(independent=False), "partial_assignments": lambda x: x.update(assignment_count=8), "wrong_feature_count": lambda x: x.update(feature_count=3887),
        "wrong_slice": lambda x: x.update(features_per_assignment=242), "wrong_coverage": lambda x: x.update(coverage_digest="0" * 64),
        "missing_assignment": lambda x: x.update(assignment_ids=x["assignment_ids"][:-1]), "duplicate_assignment": lambda x: x.update(assignment_ids=x["assignment_ids"][:-1] + [x["assignment_ids"][0]]),
        "v9_substitution": lambda x: x.update(v9_sha256="0" * 64), "unresolved_error": lambda x: x.update(unresolved_errors=["error"]), "not_authorized": lambda x: x.update(activation_authorized=False),
    }
    for name, mutation in luna_mutations.items():
        candidate = copy.deepcopy(valid_luna); mutation(candidate)
        tests["reject_luna_" + name] = bool(luna_errors(candidate, authority, ids))

    passed = sum(value is True for value in tests.values())
    failed = sorted(name for name, value in tests.items() if value is not True)
    report = {"status": "pass" if not failed and len(tests) >= 100 else "fail", "total": len(tests), "passed": passed, "failed": failed, "categories": {"packet_and_coverage": sum(name.startswith("packet_") or name.startswith("valid_") for name in tests), "result_schema_and_semantics": sum(name.startswith("reject_result_") for name in tests), "receipt_identity": sum(name.startswith("reject_receipt_") for name in tests), "independent_activation_gate": sum(name.startswith("reject_luna_") for name in tests)}}
    print(json.dumps(report, indent=2, sort_keys=True))
    raise SystemExit(0 if report["status"] == "pass" else 1)


if __name__ == "__main__":
    main()
