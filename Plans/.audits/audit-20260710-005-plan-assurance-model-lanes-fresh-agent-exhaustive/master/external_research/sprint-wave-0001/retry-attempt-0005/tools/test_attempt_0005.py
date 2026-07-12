#!/usr/bin/env python3
"""Strict negative tests for the attempt-0005 recovery transaction and postrun."""

from __future__ import annotations

import copy
import json
from pathlib import Path

import common
import generate_activation_transaction as activation
import validate_postrun as postrun


def synthetic_result(assignment: dict, transaction_id: str, core_sha: str, authorization_sha: str) -> dict:
    sources = [{
        "url": f"https://example.org/official-{index}#section", "title": f"Official {index}",
        "publisher": "Example Standards", "published_date": "2026-01-01", "access_date": "2026-07-11",
        "source_tier": "official", "material_relevance": "Directly supports the assigned question."
    } for index in range(1, 9)]
    supported = {"evidence_class": "supported_claim", "source_urls": [sources[0]["url"]]}
    attestations = {key: True for key in [
        "current_web_research_performed", "official_or_primary_sources_first", "direct_urls_only",
        "source_count_contract_checked", "supported_inference_no_evidence_labels_present", "no_fabricated_claims",
        "no_long_quotations", "topic_and_refs_binding_verified", "exact_attempt_id_verified",
        "fresh_direct_terminal_contract_acknowledged", "fresh_current_public_web_research_redone",
        "canonical_agent_path_is_only_leaf_known_identity", "native_identity_deferred_to_controller_receipt_and_capture",
        "prior_attempt_result_bodies_and_peer_outputs_not_read",
        "leaf_local_schema_conformance_check_passed_before_final_write", "exact_schema_key_set_verified",
        "source_registry_unique_and_complete", "source_registry_completed_before_claim_emission",
        "activation_core_and_authorization_verified", "blocked_prelaunch_intent_treated_as_lineage_only",
        "result_required_before_pmr1", "pmr1_not_returned_before_result_write",
    ]}
    return {
        "audit_id": common.AUDIT_ID, "schema_version": common.RESULT_SCHEMA_VERSION,
        "phase": "external_research_current_web_research", "assignment_id": assignment["assignment_id"],
        "attempt_id": common.ATTEMPT_ID, "controller_thread_id": common.CONTROLLER_THREAD_ID,
        "agent_path": assignment["canonical_agent_path"], "model": common.MODEL,
        "reasoning_effort": common.REASONING_EFFORT, "status": "completed",
        "activation_transaction_id": transaction_id, "activation_core_sha256": core_sha,
        "leaf_dispatch_authorization_sha256": authorization_sha,
        "topic": assignment["topic"], "owner_domains": assignment["owner_domains"],
        "feature_refs": assignment["feature_refs"], "research_questions": assignment["research_questions"],
        "source_availability": "available", "unavailable_evidence": [], "sources": sources,
        "findings": [{"finding_id": "F1", "claim": "Supported finding", "confidence": 0.9, "notes": "Bound evidence", **supported}],
        "competitor_standard_patterns": [{"pattern_id": "P1", "pattern": "Pattern", "implication": "Implication", **supported}],
        "failure_modes": [{"failure_id": "X1", "failure_mode": "Failure", "mitigation_or_gap": "Mitigation", **supported}],
        "implications": [{"implication_id": "I1", "implication": "Implication", "rationale": "Rationale", **supported}],
        "novel_ideas": [{"idea_id": "N1", "idea": "Idea", "rationale": "Rationale", **supported}],
        "unresolved_questions": [{"question_id": "U1", "question": "Question", "evidence_class": "no_evidence", "source_urls": []}],
        "self_attestation": attestations,
    }


def make_receipt(assignment: dict, result_sha: str, core: dict, core_sha: str, authorization: dict, authorization_sha: str, envelope_sha: str, index: int) -> dict:
    thread = f"synthetic-native-thread-{index}"
    return {
        "schema_version": "external-research-dispatch-receipt-v5", "audit_id": common.AUDIT_ID,
        "sprint_id": common.SPRINT_ID, "retry_namespace": common.RETRY_NAMESPACE,
        "assignment_id": assignment["assignment_id"], "attempt_id": common.ATTEMPT_ID,
        "controller_thread_id": common.CONTROLLER_THREAD_ID, "agent_path": assignment["canonical_agent_path"],
        "task_thread_id": thread, "native_child_thread_id": thread, "model": common.MODEL,
        "reasoning_effort": common.REASONING_EFFORT, "fresh_child": True, "fork_turns": "none",
        "descendants_forbidden": True, "followup_messages_forbidden": True, "retries_forbidden": True,
        "packet_id": assignment["packet_id"], "packet_path": str(common.packet_path(assignment["assignment_id"])),
        "packet_sha256": common.sha(common.packet_path(assignment["assignment_id"])),
        "dispatch_intent_path": str(common.intent_path(assignment["assignment_id"])),
        "dispatch_intent_sha256": common.sha(common.intent_path(assignment["assignment_id"])),
        "activation_transaction_id": core["activation_transaction_id"],
        "authorization_transaction_id": authorization["authorization_transaction_id"],
        "activation_core_path": str(common.core_path()), "activation_core_sha256": core_sha,
        "leaf_dispatch_authorization_path": str(common.authorization_path(assignment["assignment_id"])),
        "leaf_dispatch_authorization_sha256": authorization_sha,
        "activation_envelope_path": str(common.envelope_path()), "activation_envelope_sha256": envelope_sha,
        "output_directory": str(common.output_dir(assignment["assignment_id"])),
        "result_path": str(common.output_dir(assignment["assignment_id"]) / "result.json"),
        "result_sha256": result_sha, "output_sha256": result_sha, "result_present_before_pmr1": True,
        "result_required_before_pmr1": True, "terminal_turn_status": "completed", "terminal_response_exact": "PMR1",
        "receipt_written_after_spawn_and_terminal": True, "result_contains_task_thread_id": False,
        "native_capture_binding_deferred": True, "coverage_credit": 0, "research_credit": 0,
        "promotion_credit": 0, "spec_credit": 0, "merge_credit": 0,
    }


def valid_fixture() -> tuple:
    report = activation.expected_independent_bindings()
    report_path = Path("/tmp/a005-attempt-0005-independent-prelaunch.json")
    report_sha = "a" * 64
    core, authorizations, envelope, errors = activation.build_transaction(report, report_path, report_sha, report_sha)
    assert not errors, errors
    manifest = common.load_obj(common.NAMESPACE / "manifest.json")
    assignments = {row["assignment_id"]: row for row in manifest["assignments"]}
    core_sha = common.sha_bytes(common.canonical(core)); envelope_sha = common.sha_bytes(common.canonical(envelope))
    results = {}; result_hashes = {}; receipts = {}; rows = []
    for index, aid in enumerate(common.RECOVERY_IDS, 1):
        auth_sha = common.sha_bytes(common.canonical(authorizations[aid]))
        result = synthetic_result(assignments[aid], core["activation_transaction_id"], core_sha, auth_sha)
        result_sha = common.sha_bytes(common.canonical(result)); receipt = make_receipt(assignments[aid], result_sha, core, core_sha, authorizations[aid], auth_sha, envelope_sha, index)
        results[aid] = result; result_hashes[aid] = result_sha; receipts[aid] = receipt
        rows.append({"assignment_id": aid, "agent_path": assignments[aid]["canonical_agent_path"],
                     "native_child_thread_id": receipt["task_thread_id"], "native_child_turn_id": f"synthetic-native-turn-{index}",
                     "native_child_turn_status": "completed", "terminal_response_exact": "PMR1",
                     "result_present_before_pmr1": True, "result_sha256": result_sha, "receipt_sha256": "b" * 64})
    capture = {"schema_version": "external-research-native-capture-v5", "audit_id": common.AUDIT_ID,
               "sprint_id": common.SPRINT_ID, "retry_namespace": common.RETRY_NAMESPACE,
               "attempt_id": common.ATTEMPT_ID, "assignment_count": 2, "leaves": rows}
    return report, report_path, report_sha, core, authorizations, envelope, assignments, results, result_hashes, receipts, capture


def main() -> None:
    report, report_path, report_sha, core, auths, envelope, assignments, results, result_hashes, receipts, capture = valid_fixture()
    schema = common.load_obj(common.NAMESPACE / "schema/external_research_result_v5.schema.json")
    core_sha = common.sha_bytes(common.canonical(core)); envelope_sha = common.sha_bytes(common.canonical(envelope))
    aid = "ER-0003"; assignment = assignments[aid]; auth_sha = common.sha_bytes(common.canonical(auths[aid]))
    rejected_result = lambda value: bool(common.result_errors(value, assignment, schema, core["activation_transaction_id"], core_sha, auth_sha))
    tests: dict[str, bool] = {}
    tests["valid_synthetic_result_passes"] = not rejected_result(results[aid])

    result_mutations = {
        "result_task_thread_id_rejected": ("task_thread_id", "native"),
        "result_native_thread_id_rejected": ("native_child_thread_id", "native"),
        "wrong_assignment_rejected": ("assignment_id", "ER-0008"),
        "wrong_agent_path_rejected": ("agent_path", "/root/reused"),
        "wrong_attempt_rejected": ("attempt_id", "attempt-0004"),
        "wrong_controller_rejected": ("controller_thread_id", "wrong"),
        "wrong_model_rejected": ("model", "gpt-5.6-sol"),
        "wrong_effort_rejected": ("reasoning_effort", "xhigh"),
        "wrong_schema_version_rejected": ("schema_version", "external-research-result-v4"),
        "wrong_activation_transaction_rejected": ("activation_transaction_id", "A005-ER5-" + "0" * 24),
        "wrong_activation_core_hash_rejected": ("activation_core_sha256", "0" * 64),
        "wrong_authorization_hash_rejected": ("leaf_dispatch_authorization_sha256", "0" * 64),
        "wrong_topic_rejected": ("topic", "wrong"),
        "wrong_owner_domains_rejected": ("owner_domains", ["wrong"]),
        "wrong_feature_refs_rejected": ("feature_refs", []),
        "incomplete_questions_rejected": ("research_questions", assignment["research_questions"][:-1]),
        "extra_result_key_rejected": ("unexpected", True),
    }
    for name, (key, value) in result_mutations.items():
        bad = copy.deepcopy(results[aid]); bad[key] = value; tests[name] = rejected_result(bad)
    for key in ["fresh_current_public_web_research_redone", "leaf_local_schema_conformance_check_passed_before_final_write",
                "source_registry_unique_and_complete", "source_registry_completed_before_claim_emission",
                "prior_attempt_result_bodies_and_peer_outputs_not_read", "activation_core_and_authorization_verified",
                "blocked_prelaunch_intent_treated_as_lineage_only", "result_required_before_pmr1", "pmr1_not_returned_before_result_write"]:
        bad = copy.deepcopy(results[aid]); bad["self_attestation"][key] = False
        tests[f"attestation_{key}_rejected"] = rejected_result(bad)
    bad = copy.deepcopy(results[aid]); bad["self_attestation"]["fresh_current_web_research_redone"] = bad["self_attestation"].pop("fresh_current_public_web_research_redone")
    tests["renamed_fresh_research_key_rejected"] = rejected_result(bad)
    bad = copy.deepcopy(results[aid]); bad["sources"][1]["url"] = bad["sources"][0]["url"]
    tests["duplicate_source_registration_rejected"] = rejected_result(bad)
    for section in common.REFERENCE_SECTIONS:
        bad = copy.deepcopy(results[aid]); bad[section][0]["source_urls"] = [f"https://unregistered.example/{section}"]
        tests[f"unregistered_{section}_url_rejected"] = rejected_result(bad)
    bad = copy.deepcopy(results[aid]); bad["findings"][0]["source_urls"] = []
    tests["supported_claim_without_source_rejected"] = rejected_result(bad)
    bad = copy.deepcopy(results[aid]); bad["unresolved_questions"][0]["source_urls"] = [bad["sources"][0]["url"]]
    tests["no_evidence_with_source_rejected"] = rejected_result(bad)
    bad = copy.deepcopy(results[aid]); bad["sources"][0]["url"] = "http://example.org/source"
    tests["non_https_source_rejected"] = rejected_result(bad)
    bad = copy.deepcopy(results[aid]); bad["sources"][0]["url"] = "https://google.com/search?q=x"
    tests["search_result_source_rejected"] = rejected_result(bad)
    tests["https_fragment_allowed"] = common.direct_url_errors("https://example.org/spec#section", "url") == []
    bad = copy.deepcopy(results[aid]); bad["sources"] = bad["sources"][:7]
    tests["available_under_eight_sources_rejected"] = rejected_result(bad)
    bad = copy.deepcopy(results[aid]); bad["source_availability"] = "limited"; bad["unavailable_evidence"] = []
    tests["limited_without_explanation_rejected"] = rejected_result(bad)

    tests["valid_independent_report_passes"] = activation.independent_report_errors(report) == []
    independent_mutations = {
        "independent_wrong_status_rejected": ("status", "fail"),
        "independent_gate_false_rejected": ("gate_passed", False),
        "independent_not_independent_rejected": ("independent", False),
        "independent_not_authorized_rejected": ("activation_transaction_authorized", False),
        "independent_wrong_set_rejected": ("assignment_ids", ["ER-0003"]),
        "independent_wrong_paths_rejected": ("agent_paths", [common.expected_agent_path("ER-0003")]),
        "independent_wrong_model_rejected": ("model", "gpt-5.6-sol"),
        "independent_wrong_effort_rejected": ("reasoning_effort", "xhigh"),
        "independent_wrong_v6_rejected": ("concurrency_policy_v6_sha256", "0" * 64),
        "independent_wrong_floor_rejected": ("preserved_cumulative_floor_ids", common.FLOOR_IDS[:-1]),
        "independent_wrong_floor_digest_rejected": ("preserved_cumulative_floor_digest", "0" * 64),
        "independent_wrong_floor_count_rejected": ("cumulative_floor_count", 5),
        "independent_wrong_attempt4_hash_rejected": ("attempt_0004_failure_lineage_sha256", "0" * 64),
        "independent_attempt4_nonempty_rejected": ("attempt_0004_outputs_empty", False),
        "independent_attempt5_receipt_rejected": ("attempt_0005_receipts", 1),
        "independent_nonzero_credit_rejected": ("research_credit", 1),
        "independent_errors_rejected": ("errors", ["x"]),
    }
    for name, (key, value) in independent_mutations.items():
        bad = copy.deepcopy(report); bad[key] = value; tests[name] = bool(activation.independent_report_errors(bad))
    bad = copy.deepcopy(report); bad["payload_hashes"]["manifest.json"] = "0" * 64
    tests["independent_payload_hash_drift_rejected"] = bool(activation.independent_report_errors(bad))

    tests["valid_activation_transaction_passes"] = postrun.transaction_errors(core, auths, envelope, report_path, report_sha) == []
    core_mutations = {
        "core_false_activation_rejected": ("activation_granted", False),
        "core_wrong_scope_rejected": ("assignment_ids", ["ER-0003"]),
        "core_wrong_model_rejected": ("model", "gpt-5.6-sol"),
        "core_wrong_effort_rejected": ("reasoning_effort", "xhigh"),
        "core_wrong_v6_rejected": ("concurrency_policy_v6_sha256", "0" * 64),
        "core_wrong_cap_rejected": ("active_semantic_cap", 8),
        "core_wrong_report_hash_rejected": ("independent_prelaunch_sha256", "0" * 64),
        "core_result_not_required_rejected": ("result_required_before_pmr1", False),
    }
    for name, (key, value) in core_mutations.items():
        bad = copy.deepcopy(core); bad[key] = value
        tests[name] = bool(activation.core_errors(bad, report_path, report_sha))
    tests["stale_blocked_intent_does_not_veto_valid_authorization"] = auths[aid]["dispatch_intent_activation_granted"] is False and activation.authorization_errors(auths[aid], assignment, core, core_sha) == []
    auth_mutations = {
        "authorization_false_rejected": ("activation_granted", False),
        "authorization_wrong_assignment_rejected": ("assignment_id", "ER-0008"),
        "authorization_wrong_core_hash_rejected": ("activation_core_sha256", "0" * 64),
        "authorization_wrong_intent_hash_rejected": ("dispatch_intent_sha256", "0" * 64),
        "authorization_wrong_packet_hash_rejected": ("packet_sha256", "0" * 64),
        "authorization_wrong_output_rejected": ("output_directory", "/tmp/wrong"),
        "authorization_wrong_path_rejected": ("agent_path", "/root/reused"),
        "authorization_blocked_intent_not_lineage_rejected": ("blocked_prelaunch_intent_is_lineage_only", False),
        "authorization_result_not_required_rejected": ("result_required_before_pmr1", False),
    }
    for name, (key, value) in auth_mutations.items():
        bad = copy.deepcopy(auths[aid]); bad[key] = value
        tests[name] = bool(activation.authorization_errors(bad, assignment, core, core_sha))
    tests["authorization_without_core_rejected"] = bool(postrun.transaction_errors({}, auths, envelope, report_path, report_sha))
    duplicate_auths = copy.deepcopy(auths); duplicate_auths["ER-0008"]["authorization_transaction_id"] = duplicate_auths["ER-0003"]["authorization_transaction_id"]
    tests["duplicate_authorization_transaction_id_rejected"] = bool(postrun.transaction_errors(core, duplicate_auths, envelope, report_path, report_sha))
    envelope_mutations = {
        "envelope_wrong_core_hash_rejected": ("activation_core_sha256", "0" * 64),
        "envelope_wrong_count_rejected": ("authorization_count", 1),
        "envelope_partial_scope_rejected": ("assignment_ids", ["ER-0003"]),
        "envelope_false_activation_rejected": ("activation_granted", False),
    }
    for name, (key, value) in envelope_mutations.items():
        bad = copy.deepcopy(envelope); bad[key] = value
        tests[name] = bool(activation.envelope_errors(bad, core, core_sha, auths))
    bad = copy.deepcopy(envelope); bad["authorizations"][0]["sha256"] = "0" * 64
    tests["envelope_wrong_authorization_hash_rejected"] = bool(activation.envelope_errors(bad, core, core_sha, auths))

    tests["zero_state_valid"] = common.zero_inventory_errors({aid: [] for aid in common.RECOVERY_IDS}, [], [], 0, []) == []
    tests["nonempty_output_rejected"] = bool(common.zero_inventory_errors({"ER-0003": ["debug.json"], "ER-0008": []}, [], [], 0, []))
    tests["premature_receipt_rejected"] = bool(common.zero_inventory_errors({aid: [] for aid in common.RECOVERY_IDS}, ["ER-0003"], [], 0, []))
    tests["premature_result_rejected"] = bool(common.zero_inventory_errors({aid: [] for aid in common.RECOVERY_IDS}, [], ["ER-0003"], 0, []))
    tests["premature_capture_rejected"] = bool(common.zero_inventory_errors({aid: [] for aid in common.RECOVERY_IDS}, [], [], 1, []))
    tests["premature_activation_transaction_rejected"] = bool(common.zero_inventory_errors({aid: [] for aid in common.RECOVERY_IDS}, [], [], 0, ["activation-core.json"]))

    tests["valid_receipt_passes"] = postrun.receipt_errors(receipts[aid], assignment, result_hashes[aid], core, core_sha, auths[aid], auth_sha, envelope_sha) == []
    receipt_mutations = {
        "receipt_wrong_thread_binding_rejected": ("native_child_thread_id", "different"),
        "receipt_wrong_result_hash_rejected": ("result_sha256", "0" * 64),
        "receipt_wrong_authorization_hash_rejected": ("leaf_dispatch_authorization_sha256", "0" * 64),
        "receipt_wrong_core_hash_rejected": ("activation_core_sha256", "0" * 64),
        "receipt_pmr1_without_result_flag_rejected": ("result_present_before_pmr1", False),
        "receipt_wrong_terminal_rejected": ("terminal_response_exact", "PMR0"),
    }
    for name, (key, value) in receipt_mutations.items():
        bad = copy.deepcopy(receipts[aid]); bad[key] = value
        tests[name] = bool(postrun.receipt_errors(bad, assignment, result_hashes[aid], core, core_sha, auths[aid], auth_sha, envelope_sha))
    bad = copy.deepcopy(receipts[aid]); bad["extra"] = True
    tests["receipt_extra_key_rejected"] = bool(postrun.receipt_errors(bad, assignment, result_hashes[aid], core, core_sha, auths[aid], auth_sha, envelope_sha))
    tests["valid_capture_passes"] = postrun.capture_set_errors(capture, receipts, set()) == []
    capture_mutations = {
        "capture_wrong_status_rejected": (0, "native_child_turn_status", "failed"),
        "capture_wrong_terminal_rejected": (0, "terminal_response_exact", "PMR0"),
        "capture_result_after_pmr1_rejected": (0, "result_present_before_pmr1", False),
        "capture_wrong_agent_path_rejected": (0, "agent_path", "/root/reused"),
    }
    for name, (index, key, value) in capture_mutations.items():
        bad = copy.deepcopy(capture); bad["leaves"][index][key] = value
        tests[name] = bool(postrun.capture_set_errors(bad, receipts, set()))
    bad = copy.deepcopy(capture); bad["leaves"][1]["native_child_thread_id"] = bad["leaves"][0]["native_child_thread_id"]
    tests["duplicate_capture_thread_rejected"] = bool(postrun.capture_set_errors(bad, receipts, set()))
    bad = copy.deepcopy(capture); bad["leaves"][1]["native_child_turn_id"] = bad["leaves"][0]["native_child_turn_id"]
    tests["duplicate_capture_turn_rejected"] = bool(postrun.capture_set_errors(bad, receipts, set()))
    prior = {capture["leaves"][0]["native_child_thread_id"]}
    tests["prior_identity_reuse_rejected"] = bool(postrun.capture_set_errors(capture, receipts, prior))
    tests["extra_output_file_rejected"] = bool(postrun.output_files_errors(["result.json", "debug.json"]))

    valid_snapshot = postrun.validate_snapshot(core, auths, envelope, report_path, report_sha, results, result_hashes, receipts, capture,
                                               {aid: ["result.json"] for aid in common.RECOVERY_IDS}, set())
    tests["valid_synthetic_postrun_passes"] = valid_snapshot["status"] == "pass" and valid_snapshot["cumulative_research_credit"] == 8
    missing_results = copy.deepcopy(results); missing_hashes = copy.deepcopy(result_hashes); missing_results["ER-0003"] = None; missing_hashes["ER-0003"] = None
    bad_snapshot = postrun.validate_snapshot(core, auths, envelope, report_path, report_sha, missing_results, missing_hashes, receipts, capture,
                                             {"ER-0003": [], "ER-0008": ["result.json"]}, set())
    tests["pmr1_without_result_terminal_failure"] = "ER-0003" in bad_snapshot["rejected_attempt_0005_ids"] and any("pmr1_without_result" in error for error in bad_snapshot["per_assignment_errors"]["ER-0003"])
    tests["partial_failure_preserves_valid_other_row"] = bad_snapshot["eligible_attempt_0005_ids"] == ["ER-0008"]
    tests["partial_failure_keeps_cumulative_credit_zero"] = bad_snapshot["cumulative_research_credit"] == 0

    failures = sorted(name for name, passed in tests.items() if passed is not True)
    report_out = {
        "checker": "external_research_recovery_attempt_0005_negative_tests_v5",
        "status": "pass" if not failures and len(tests) >= 60 else "fail",
        "test_count": len(tests), "errors": failures, "tests": tests,
        "activation_granted": False, "launch_authorized": False,
        "receipts": 0, "results": 0, "cumulative_research_credit": 0,
    }
    print(json.dumps(report_out, indent=2, sort_keys=True))
    raise SystemExit(0 if report_out["status"] == "pass" else 1)


if __name__ == "__main__":
    main()
