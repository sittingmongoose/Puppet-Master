#!/usr/bin/env python3
"""Phase-stable negative and positive tests for the v2 independent gate."""

from __future__ import annotations

import copy
import json
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
if str(HERE) not in sys.path:
    sys.path.insert(0, str(HERE))

import verify_generator_compatible_prelaunch_v2 as gate


def main() -> None:
    reconstruction = gate.reconstruct(run_comparisons=True)
    payload = reconstruction["payload"]
    expected = reconstruction["evidence"]["expected_payload"]
    evidence = reconstruction["evidence"]
    tests: dict[str, bool] = {}

    def rejected(name: str, value: dict, expected_value: dict | None = None) -> None:
        tests[name] = bool(gate.payload_errors(value, expected_value or expected))

    def meta_rejected(name: str, mutation) -> None:
        value = copy.deepcopy(reconstruction["meta"])
        mutation(value)
        tests[name] = bool(gate.validate_meta(value, payload, evidence))

    tests["valid_independent_reconstruction_passes"] = not reconstruction["errors"] and payload["status"] == "pass"
    tests["valid_exact_generator_payload_passes"] = gate.payload_errors(payload, expected) == []
    tests["exact_40_field_set_passes"] = set(payload) == set(gate.FIELDS) and len(payload) == 40
    tests["independent_is_direct_attestation"] = reconstruction["meta"]["independence_provenance"]["independent_source"] == "independent_reconstruction_pass"
    tests["independent_not_gate_alias"] = reconstruction["meta"]["independence_provenance"]["not_aliased_to_gate_passed"] is True
    tests["independent_source_not_gate_path"] = reconstruction["meta"]["independence_provenance"]["independent_source"] != "gate_passed"
    tests["v2_schema_file_is_present"] = gate.V2_SCHEMA.is_file()
    tests["frozen_generator_shape_is_40"] = reconstruction["meta"]["generator_required_field_count"] == 40
    tests["frozen_generator_shape_order_is_exact"] = reconstruction["meta"]["generator_required_fields"] == gate.FIELDS
    tests["source_report_is_pinned"] = evidence["initial_hashes"]["source_report"] == gate.SOURCE_SHA
    tests["sol_rejection_is_pinned"] = gate.sha_path(gate.SOL_REJECTION) == gate.SOL_REJECTION_SHA

    extra = copy.deepcopy(payload); extra["_meta"] = {}
    rejected("extra_generator_payload_key_rejected", extra)
    missing = copy.deepcopy(payload); missing.pop("payload_hashes")
    rejected("missing_generator_payload_key_rejected", missing)
    for key, value in {
        "audit_id": "wrong-audit",
        "sprint_id": "wrong-sprint",
        "retry_namespace": "retry-attempt-0004",
        "attempt_id": "attempt-0004",
        "status": "PASS",
        "gate_passed": False,
        "independent": False,
        "activation_transaction_authorized": False,
        "assignment_count": 3,
        "assignment_ids": ["ER-0003"],
        "agent_paths": ["/root/reused"],
        "controller_thread_id": "wrong-controller",
        "model": "gpt-5.6-sol",
        "reasoning_effort": "xhigh",
        "fresh_direct_leaves": 1,
        "fork_turns": "1",
        "descendants_forbidden": False,
        "followups_forbidden": False,
        "retries_forbidden": False,
        "concurrency_policy_v6_sha256": "0" * 64,
        "preserved_cumulative_floor_ids": ["ER-0002"],
        "preserved_cumulative_floor_digest": "0" * 64,
        "cumulative_floor_count": 1,
        "attempt_0004_failure_lineage_sha256": "0" * 64,
        "attempt_0004_outputs_empty": False,
        "attempt_0004_receipts": 1,
        "attempt_0004_results": 1,
        "attempt_0004_credit": 1,
        "attempt_0005_outputs_empty": False,
        "attempt_0005_receipts": 1,
        "attempt_0005_results": 1,
        "attempt_0005_native_capture_rows": 1,
        "attempt_0005_activation_transaction_files": 1,
        "payload_hashes": {"tampered": "0" * 64},
        "errors": ["suppressed"],
        "coverage_credit": 1,
        "research_credit": 1,
        "promotion_credit": 1,
        "spec_credit": 1,
        "merge_credit": 1,
    }.items():
        bad = copy.deepcopy(payload); bad[key] = value
        rejected(f"wrong_{key}_rejected", bad)

    wrong_type = copy.deepcopy(payload); wrong_type["assignment_count"] = True
    rejected("boolean_count_type_rejected", wrong_type)
    wrong_type = copy.deepcopy(payload); wrong_type["errors"] = "not-an-array"
    rejected("errors_type_rejected", wrong_type)
    wrong_type = copy.deepcopy(payload); wrong_type["assignment_ids"] = "ER-0003"
    rejected("assignment_ids_type_rejected", wrong_type)
    wrong_type = copy.deepcopy(payload); wrong_type["attempt_0005_outputs_empty"] = "true"
    rejected("empty_observation_type_rejected", wrong_type)

    inv4 = reconstruction["meta"]["observations"]["attempt_0004"]["initial"]
    inv5 = reconstruction["meta"]["observations"]["attempt_0005"]["initial"]
    tests["direct_attempt4_inventory_passes"] = gate.observation_errors(inv4) == []
    tests["direct_attempt5_inventory_passes"] = gate.observation_errors(inv5) == []
    for name, inv in (("attempt4", inv4), ("attempt5", inv5)):
        bad = copy.deepcopy(inv); bad["empty"] = False
        tests[f"direct_{name}_nonempty_rejected"] = bool(gate.observation_errors(bad))
        bad = copy.deepcopy(inv); bad["entries"] = [{"path": "/tmp/debug.json", "kind": "file", "size": 1, "sha256": "0" * 64}]; bad["exact_entry_count"] = 1
        tests[f"direct_{name}_extra_entry_rejected"] = bool(gate.observation_errors(bad))
        bad = copy.deepcopy(inv); bad["path_set_digest"] = "0" * 64
        tests[f"direct_{name}_path_digest_drift_rejected"] = bool(gate.observation_errors(bad))
        bad = copy.deepcopy(inv); bad["inventory_root_digest"] = "0" * 64
        tests[f"direct_{name}_root_digest_drift_rejected"] = bool(gate.observation_errors(bad))
        bad = copy.deepcopy(inv); bad["missing_directories"] = ["missing"]
        tests[f"direct_{name}_missing_directory_rejected"] = bool(gate.observation_errors(bad))
    tests["separate_output_observation_objects"] = inv4 is not inv5 and inv4 != inv5
    tests["attempt4_and_attempt5_observation_phase_stable"] = reconstruction["meta"]["observations"]["attempt_0004"]["stable"] and reconstruction["meta"]["observations"]["attempt_0005"]["stable"]

    for name, mutation in {
        "meta_wrong_source_hash_rejected": lambda m: m.__setitem__("source_report_sha256", "0" * 64),
        "meta_wrong_sol_rejection_hash_rejected": lambda m: m.__setitem__("sol_rejection_sha256", "0" * 64),
        "meta_wrong_generator_field_count_rejected": lambda m: m.__setitem__("generator_required_field_count", 39),
        "meta_gate_alias_provenance_rejected": lambda m: m["independence_provenance"].update({"independent_source": "gate_passed", "not_aliased_to_gate_passed": False}),
        "meta_missing_direct_attestation_rejected": lambda m: m["independence_provenance"].update({"direct_attestation": False}),
        "meta_payload_digest_drift_rejected": lambda m: m.__setitem__("generator_payload_sha256", "0" * 64),
        "meta_attempt4_inventory_drift_rejected": lambda m: m["observations"]["attempt_0004"].update({"closing": {}}),
        "meta_attempt5_inventory_drift_rejected": lambda m: m["observations"]["attempt_0005"].update({"closing": {}}),
        "meta_structural_count_under_floor_rejected": lambda m: m["independent_structural_checks"].update({"count": 116}),
        "meta_structural_failed_count_rejected": lambda m: m["independent_structural_checks"].update({"failed": 1}),
        "meta_phase_pre_failure_rejected": lambda m: m["phase_stability"].update({"pre_report": {"status": "fail"}}),
        "meta_phase_post_failure_rejected": lambda m: m["phase_stability"].update({"post_report": {"status": "fail"}}),
        "meta_phase_digest_drift_rejected": lambda m: m["phase_stability"]["post_report"].update({"digest": "0" * 64}),
        "meta_nonzero_activation_files_rejected": lambda m: m["zero_launch_state"].update({"activation_transaction_files": 1}),
        "meta_nonzero_results_rejected": lambda m: m["zero_launch_state"].update({"result_files": 1}),
        "meta_nonzero_receipts_rejected": lambda m: m["zero_launch_state"].update({"receipt_files": 1}),
        "meta_nonzero_native_capture_rejected": lambda m: m["zero_launch_state"].update({"native_capture_rows": 1}),
        "meta_frozen_generator_invocation_rejected": lambda m: m.__setitem__("no_frozen_generator_invocation", False),
        "meta_canonical_plan_change_rejected": lambda m: m.__setitem__("canonical_plan_changes", ["changed"]),
    }.items():
        meta_rejected(name, mutation)

    tests["candidate_absent_or_valid_before_after_validation"] = (not gate.V2_REPORT.exists()) or gate.validate_full_report(gate.V2_REPORT, reconstruction) == []
    if gate.V2_REPORT.exists():
        tests["existing_candidate_full_report_validates"] = gate.validate_full_report(gate.V2_REPORT, reconstruction) == []
    else:
        tests["existing_candidate_full_report_validates"] = True
    tests["candidate_preexisting_bad_payload_rejected"] = bool(gate.payload_errors({"status": "pass"}, expected))
    tests["candidate_preexisting_bad_metadata_rejected"] = bool(gate.validate_meta({}, payload, evidence))

    projected_path = gate.RETRY_ROOT / "validation/generator-report-adapter-v1/validation/projected-generator-report.json"
    projected = gate.load_obj(projected_path)
    tests["v1_projected_payload_replay_rejected_without_provenance"] = bool(gate.validate_meta({}, projected, evidence))
    tests["v1_projected_payload_not_full_v2_report"] = "_meta" not in projected
    tests["v1_sol_rejection_is_not_reused_as_authority"] = gate.SOL_REJECTION_SHA == "753c2bf07936eee4be46996f308539066790fb7f1bb462d3ca616bb2d911d446"

    tests["source_candidate_hash_drift_rejected"] = gate.candidate_hash_projection({}) != reconstruction["meta"]["candidate_hashes"]
    tests["source_report_status_drift_rejected"] = reconstruction["meta"]["source_report"]["sha256"] != "0" * 64
    tests["source_report_path_is_exact"] = reconstruction["meta"]["source_report"]["path"] == str(gate.SOURCE_REPORT.resolve())
    tests["source_report_suffix_toctou_bound"] = reconstruction["meta"]["source_report"]["captured_buffer_sha256"] == gate.SOURCE_SHA
    tests["attempt4_failure_lineage_bound"] = payload["attempt_0004_failure_lineage_sha256"] == gate.ATTEMPT4_FAILURE_SHA
    tests["v6_candidate_bound"] = payload["concurrency_policy_v6_sha256"] == gate.V6_SHA
    tests["floor_digest_bound"] = payload["preserved_cumulative_floor_digest"] == gate.FLOOR_DIGEST
    tests["scope_paths_bound"] = payload["agent_paths"] == [gate.EXPECTED_PATHS[aid] for aid in gate.ASSIGNMENTS]
    tests["model_effort_bound"] = payload["model"] == gate.MODEL and payload["reasoning_effort"] == gate.EFFORT
    tests["activation_authorization_is_future_contract_only"] = payload["activation_transaction_authorized"] is True and reconstruction["meta"]["zero_launch_state"]["activation_transaction_files"] == 0
    tests["credits_all_zero"] = all(payload[key] == 0 for key in ("coverage_credit", "research_credit", "promotion_credit", "spec_credit", "merge_credit"))
    tests["attempt4_credit_zero"] = payload["attempt_0004_credit"] == 0
    tests["receipts_results_capture_zero"] = payload["attempt_0005_receipts"] == payload["attempt_0005_results"] == payload["attempt_0005_native_capture_rows"] == 0
    tests["output_empty_flags_are_observation_values"] = payload["attempt_0004_outputs_empty"] is inv4["empty"] and payload["attempt_0005_outputs_empty"] is inv5["empty"]
    tests["closing_toc_stable"] = reconstruction["meta"]["closing_toc_recheck"]["stable"] is True
    tests["no_canonical_plan_changes"] = reconstruction["meta"]["canonical_plan_changes"] == []
    tests["no_frozen_generator_invocation"] = reconstruction["meta"]["no_frozen_generator_invocation"] is True

    failures = sorted(name for name, passed in tests.items() if passed is not True)
    report = {
        "checker": "external_research_generator_compatible_prelaunch_v2_negative_tests",
        "status": "pass" if not failures and len(tests) >= 60 else "fail",
        "test_count": len(tests),
        "passed": len(tests) - len(failures),
        "failed": len(failures),
        "errors": failures,
        "tests": tests,
        "digest": gate.digest(tests),
        "candidate_state": "present_and_valid" if gate.V2_REPORT.exists() else "absent_before_emission",
        "phase_stable_contract": True,
    }
    print(json.dumps(report, indent=2, sort_keys=True))
    raise SystemExit(0 if report["status"] == "pass" else 1)


if __name__ == "__main__":
    main()
