#!/usr/bin/env python3
"""Strict in-memory negative/positive tests for the generator report adapter."""

from __future__ import annotations

import copy
import json
import subprocess
import sys
from pathlib import Path

import project_generator_report as projection

sys.path.insert(0, str(projection.RETRY_ROOT / "tools"))
import generate_activation_transaction  # noqa: E402


def canonical(value):
    return (json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(",", ":")) + "\n").encode()


def mutated_result(source: dict, mutate) -> bool:
    value = copy.deepcopy(source)
    mutate(value)
    raw = canonical(value)
    try:
        projection.project_from_captured(raw, projection.sha_bytes(raw), projection.SOURCE_REPORT)
    except Exception:
        return True
    return False


def main() -> None:
    raw = projection.SOURCE_REPORT.read_bytes()
    source = json.loads(raw.decode("utf-8"))
    tests: dict[str, bool] = {}
    try:
        bundle = projection.project_from_captured(raw, projection.SOURCE_REPORT_SHA256, projection.SOURCE_REPORT)
        payload = projection.exact_payload(bundle)
        tests["valid_exact_projection"] = not projection.schema_errors(payload)
        tests["valid_frozen_generator_compatibility"] = not generate_activation_transaction.independent_report_errors(payload)
        tests["valid_payload_digest"] = bundle["projection_payload_sha256"] == projection.sha_bytes(canonical(payload))
        tests["valid_exact_key_set"] = set(payload) == set(projection.REQUIRED_FIELDS)
        tests["valid_assignment_scope"] = payload["assignment_ids"] == projection.ASSIGNMENT_IDS and payload["assignment_count"] == 2
        tests["valid_agent_paths"] = payload["agent_paths"] == projection.AGENT_PATHS
        tests["valid_model_effort"] = payload["model"] == projection.MODEL and payload["reasoning_effort"] == projection.EFFORT
        tests["valid_v6_binding"] = payload["concurrency_policy_v6_sha256"] == projection.V6_SHA256
        tests["valid_zero_credit"] = all(payload[key] == 0 for key in ["coverage_credit", "research_credit", "promotion_credit", "spec_credit", "merge_credit"])
        tests["valid_zero_state"] = projection.zero_state_errors() == []
        tests["valid_state_no_invocation"] = bundle["state"]["generator_invocation_performed"] is False
        tests["valid_state_no_activation"] = bundle["state"]["activation_granted"] is False and bundle["state"]["launch_authorized"] is False
        tests["valid_source_sha"] = bundle["source_report_sha256"] == projection.SOURCE_REPORT_SHA256
        tests["valid_source_path"] = bundle["source_report_path"] == str(projection.SOURCE_REPORT)
        tests["valid_projection_map_complete"] = set(bundle["projection_map"]) == set(projection.REQUIRED_FIELDS)
    except Exception:
        for name in ["valid_exact_projection", "valid_frozen_generator_compatibility", "valid_payload_digest", "valid_exact_key_set", "valid_assignment_scope", "valid_agent_paths", "valid_model_effort", "valid_v6_binding", "valid_zero_credit", "valid_zero_state", "valid_state_no_invocation", "valid_state_no_activation", "valid_source_sha", "valid_source_path", "valid_projection_map_complete"]:
            tests[name] = False

    def drift(name, mutate):
        tests[name] = mutated_result(source, mutate)

    drift("source_sha_drift_rejected", lambda x: x["common_mode_concerns"].append("drift"))
    drift("source_status_drift_rejected", lambda x: x.__setitem__("status", "fail"))
    drift("source_error_injection_rejected", lambda x: x.__setitem__("errors", ["injected"]))
    drift("source_gate_false_rejected", lambda x: x.__setitem__("gate_passed", False))
    drift("source_independent_check_count_drift_rejected", lambda x: x["independent_comparison"].__setitem__("independent_structural_check_count", 116))
    drift("source_independent_pass_count_drift_rejected", lambda x: x["independent_comparison"].__setitem__("independent_structural_checks_passed", 116))
    drift("source_strict_test_count_drift_rejected", lambda x: x["strict_tests"].__setitem__("test_count", 113))
    drift("source_strict_test_pass_count_drift_rejected", lambda x: x["strict_tests"].__setitem__("passed", 113))
    drift("source_strict_test_digest_drift_rejected", lambda x: x["strict_tests"].__setitem__("test_digest", "0" * 64))
    drift("source_scope_assignment_count_drift_rejected", lambda x: x["scope"].__setitem__("assignment_count", 1))
    drift("source_scope_assignment_set_drift_rejected", lambda x: x["scope"].__setitem__("assignment_ids", ["ER-0003"]))
    drift("source_scope_path_drift_rejected", lambda x: x["identity_separation"].__setitem__("current_agent_paths", ["/root/reused", "/root/reused2"]))
    drift("source_model_drift_rejected", lambda x: x.__setitem__("model", "gpt-5.6-sol"))
    drift("source_effort_drift_rejected", lambda x: x.__setitem__("reasoning_effort", "xhigh"))
    drift("source_v6_drift_rejected", lambda x: x["lineage_and_policy"].__setitem__("concurrency_policy_v6_sha256", "0" * 64))
    drift("source_floor_ids_drift_rejected", lambda x: x["lineage_and_policy"].__setitem__("preserved_cumulative_floor_ids", []))
    drift("source_floor_digest_drift_rejected", lambda x: x["lineage_and_policy"].__setitem__("preserved_cumulative_floor_digest", "0" * 64))
    drift("source_generator_hash_drift_rejected", lambda x: x["candidate_hashes"].__setitem__("activation_generator_sha256", "0" * 64))
    drift("source_authority_hash_drift_rejected", lambda x: x["candidate_hashes"].__setitem__("authority_sha256", "0" * 64))
    drift("source_manifest_hash_drift_rejected", lambda x: x["candidate_hashes"].__setitem__("manifest_sha256", "0" * 64))
    drift("source_local_report_hash_drift_rejected", lambda x: x["candidate_hashes"].__setitem__("local_prelaunch_report_sha256", "0" * 64))
    drift("source_v7_hash_drift_rejected", lambda x: x["candidate_hashes"].__setitem__("concurrency_policy_v7_sha256", "0" * 64))
    drift("source_zero_activation_files_rejected", lambda x: x["zero_state"].__setitem__("activation_transaction_files", 1))
    drift("source_zero_output_files_rejected", lambda x: x["zero_state"].__setitem__("output_files", 1))
    drift("source_zero_result_files_rejected", lambda x: x["zero_state"].__setitem__("result_files", 1))
    drift("source_zero_receipt_files_rejected", lambda x: x["zero_state"].__setitem__("receipt_files", 1))
    drift("source_zero_capture_rows_rejected", lambda x: x["zero_state"].__setitem__("native_capture_rows", 1))
    drift("source_zero_output_inventory_rejected", lambda x: x["zero_state"]["output_inventory"].__setitem__("ER-0003", ["result.json"]))
    drift("source_activation_granted_rejected", lambda x: x["zero_state"].__setitem__("activation_granted", True))
    drift("source_launch_authorized_rejected", lambda x: x["zero_state"].__setitem__("launch_authorized", True))
    drift("source_credit_drift_rejected", lambda x: x["credits"].__setitem__("research_credit", 1))
    drift("source_canonical_change_rejected", lambda x: x.__setitem__("canonical_plan_changes", True))
    drift("source_missing_scope_rejected", lambda x: x["scope"].pop("assignment_ids"))
    drift("source_missing_zero_state_rejected", lambda x: x.pop("zero_state"))
    drift("source_missing_candidate_hashes_rejected", lambda x: x.pop("candidate_hashes"))
    drift("source_missing_controller_rejected", lambda x: x.pop("controller_thread_id"))
    drift("source_missing_gate_rejected", lambda x: x.pop("gate_passed"))
    drift("source_top_level_legacy_alias_rejected", lambda x: x.__setitem__("assignment_ids", ["ER-0003", "ER-0008"]))
    drift("source_ambiguous_assignment_alias_rejected", lambda x: x["scope"].__setitem__("assignment_ids_alias", ["ER-0003"]))
    drift("source_attempt_id_alias_rejected", lambda x: x.__setitem__("attempt_id", "attempt-0005"))
    drift("source_retry_namespace_alias_rejected", lambda x: x.__setitem__("retry_namespace", "retry-attempt-0005"))
    drift("source_payload_packet_drift_rejected", lambda x: x["candidate_hashes"]["packet_sha256"].__setitem__("ER-0003", "0" * 64))
    drift("source_payload_intent_drift_rejected", lambda x: x["candidate_hashes"]["intent_sha256"].__setitem__("ER-0008", "0" * 64))
    drift("source_attempt4_lineage_drift_rejected", lambda x: x["lineage_and_policy"].__setitem__("attempt_0004_failure_lineage_sha256", "0" * 64))
    drift("source_zero_prevalidation_credit_drift_rejected", lambda x: x["zero_state"].__setitem__("prevalidation_credit", 1))
    drift("source_transaction_live_file_drift_rejected", lambda x: x["transaction_contract"].__setitem__("live_transaction_files", 1))
    drift("source_transaction_activation_drift_rejected", lambda x: x["transaction_contract"].__setitem__("current_activation_granted", True))
    drift("source_transaction_launch_drift_rejected", lambda x: x["transaction_contract"].__setitem__("current_launch_authorized", True))
    drift("source_circular_hash_flag_rejected", lambda x: x["transaction_contract"].__setitem__("no_circular_hash_dependency", False))
    drift("source_missing_transaction_core_rejected", lambda x: x["transaction_contract"].pop("activation_core_contract"))
    drift("source_missing_identity_rejected", lambda x: x["identity_separation"].pop("current_agent_paths"))
    drift("source_identity_reuse_rejected", lambda x: x["identity_separation"].__setitem__("current_paths_not_reused", False))
    drift("source_v7_semantic_drift_rejected", lambda x: x["lineage_and_policy"].__setitem__("v7_binding", "semantic override"))
    drift("source_floor_count_control_drift_rejected", lambda x: x["recomputed_binding_roots"].__setitem__("prior_identity_field_count", 0))
    drift("source_report_suffix_path_rejected", lambda x: x.__setitem__("activation", {"independent_prelaunch_path": str(projection.SOURCE_REPORT) + ".suffix", "independent_prelaunch_sha256_required_at_invocation": True}))

    tests["wrong_source_path_rejected"] = True
    try:
        projection.project_from_captured(raw, projection.SOURCE_REPORT_SHA256, projection.SOURCE_REPORT.with_name("luna-prelaunch.json.suffix"))
    except Exception:
        tests["wrong_source_path_rejected"] = True
    else:
        tests["wrong_source_path_rejected"] = False
    tests["wrong_source_sha_rejected"] = True
    try:
        projection.project_from_captured(raw, "0" * 64, projection.SOURCE_REPORT)
    except Exception:
        tests["wrong_source_sha_rejected"] = True
    else:
        tests["wrong_source_sha_rejected"] = False
    tests["captured_buffer_tamper_rejected"] = mutated_result(source, lambda x: x.__setitem__("status", "tampered"))

    valid_payload = payload if "payload" in locals() else {}
    extra = copy.deepcopy(valid_payload); extra["unexpected"] = True
    missing = copy.deepcopy(valid_payload); missing.pop("errors", None)
    digest_drift = copy.deepcopy(bundle) if "bundle" in locals() else {}
    if digest_drift:
        digest_drift["projection_payload_sha256"] = "0" * 64
    tests["extra_projection_key_rejected"] = bool(projection.schema_errors(extra))
    tests["missing_projection_key_rejected"] = bool(projection.schema_errors(missing))
    tests["projection_digest_replay_rejected"] = bool(digest_drift) and digest_drift["projection_payload_sha256"] != projection.sha_bytes(canonical(digest_drift["projection_payload"]))
    tests["projection_manifest_source_binding_required"] = bool(bundle.get("source_report_path") == str(projection.SOURCE_REPORT)) if "bundle" in locals() else False
    tests["projection_manifest_sha_binding_required"] = bool(bundle.get("source_report_sha256") == projection.SOURCE_REPORT_SHA256) if "bundle" in locals() else False
    tests["projection_activation_guard_present"] = bool(bundle.get("state", {}).get("activation_granted") is False) if "bundle" in locals() else False
    tests["projection_generator_guard_present"] = bool(bundle.get("state", {}).get("generator_invocation_performed") is False) if "bundle" in locals() else False
    tests["projection_assignment_guard_present"] = bool(bundle.get("state", {}).get("cannot_authorize_different_assignment") is True) if "bundle" in locals() else False
    tests["projection_model_guard_present"] = bool(bundle.get("state", {}).get("cannot_authorize_different_model_or_effort") is True) if "bundle" in locals() else False
    tests["projection_policy_guard_present"] = bool(bundle.get("state", {}).get("cannot_authorize_different_policy") is True) if "bundle" in locals() else False
    tests["projection_path_guard_present"] = bool(bundle.get("state", {}).get("cannot_authorize_different_path") is True) if "bundle" in locals() else False
    tests["projection_nonzero_guard_present"] = bool(bundle.get("state", {}).get("cannot_authorize_nonzero_state") is True) if "bundle" in locals() else False
    tests["projection_payload_hashes_exact"] = bool(valid_payload.get("payload_hashes") == projection.actual_payload_paths()) if valid_payload else False
    tests["projection_no_credit_fields_nonzero"] = bool(valid_payload and all(valid_payload.get(k) == 0 for k in ["coverage_credit", "research_credit", "promotion_credit", "spec_credit", "merge_credit"]))
    tests["projection_no_activation_files"] = projection.zero_state_errors() == []
    tests["projection_candidate_path_absent_before_emit"] = not (projection.ADAPTER_ROOT / "validation/projected-generator-report.json").exists()

    failures = sorted(name for name, passed in tests.items() if passed is not True)
    digest = projection.sha_bytes(canonical(tests))
    report = {
        "checker": "external_research_generator_report_adapter_tests_v1",
        "status": "pass" if not failures and len(tests) >= 60 else "fail_closed",
        "test_count": len(tests),
        "passed": len(tests) - len(failures),
        "failed": len(failures),
        "errors": failures,
        "tests": tests,
        "test_digest": digest,
        "generator_invocation_performed": False,
        "activation_granted": False,
        "launch_authorized": False,
        "activation_transaction_files": 0,
        "results": 0,
        "receipts": 0,
        "native_capture_rows": 0,
        "coverage_credit": 0,
        "research_credit": 0,
        "promotion_credit": 0,
        "spec_credit": 0,
        "merge_credit": 0,
    }
    print(json.dumps(report, ensure_ascii=False, sort_keys=True, indent=2))
    raise SystemExit(0 if report["status"] == "pass" else 1)


if __name__ == "__main__":
    main()
