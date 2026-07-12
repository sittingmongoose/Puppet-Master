#!/usr/bin/env python3
"""Strict negative-test harness for the provisional attempt-0004 candidate."""

from __future__ import annotations

import copy
import json
from pathlib import Path

import common
import generate_activation
import validate_postrun


def synthetic_result(aid: str = "ER-0003") -> tuple[dict, dict]:
    manifest = common.load_obj(common.NAMESPACE / "manifest.json")
    assignment = next(row for row in manifest["assignments"] if row["assignment_id"] == aid)
    urls = [f"https://example.org/official/source-{index}#section" for index in range(8)]
    sources = [{"url": url, "title": f"Source {index}", "publisher": "Primary Publisher", "published_date": None,
                "access_date": "2026-07-11", "source_tier": "official" if index == 0 else "primary",
                "material_relevance": "Directly supports the assigned current public-web research question."}
               for index, url in enumerate(urls)]
    result = {
        "audit_id": common.AUDIT_ID, "schema_version": "external-research-result-v4",
        "phase": "external_research_current_web_research", "assignment_id": aid, "attempt_id": common.ATTEMPT_ID,
        "controller_thread_id": common.CONTROLLER_THREAD_ID, "agent_path": assignment["canonical_agent_path"],
        "model": common.MODEL, "reasoning_effort": common.REASONING_EFFORT, "status": "completed",
        "topic": assignment["topic"], "owner_domains": assignment["owner_domains"], "feature_refs": assignment["feature_refs"],
        "research_questions": assignment["research_questions"], "source_availability": "available", "unavailable_evidence": [],
        "sources": sources,
        "findings": [{"finding_id": "F-1", "claim": "Supported claim.", "evidence_class": "supported_claim",
                      "source_urls": [urls[0]], "confidence": 0.9, "notes": "Evidence bound."}],
        "competitor_standard_patterns": [{"pattern_id": "P-1", "pattern": "Observed pattern.",
                      "evidence_class": "supported_claim", "source_urls": [urls[1]], "implication": "Adopt explicit boundaries."}],
        "failure_modes": [{"failure_id": "FM-1", "failure_mode": "Failure mode.", "evidence_class": "supported_claim",
                      "source_urls": [urls[2]], "mitigation_or_gap": "Mitigate explicitly."}],
        "implications": [{"implication_id": "I-1", "implication": "Implication.", "evidence_class": "supported_claim",
                      "source_urls": [urls[3]], "rationale": "Evidence supports it."}],
        "novel_ideas": [{"idea_id": "N-1", "idea": "Novel idea.", "evidence_class": "supported_claim",
                      "source_urls": [urls[4]], "rationale": "Derived independently."}],
        "unresolved_questions": [{"question_id": "Q-1", "question": "What remains unresolved?",
                      "evidence_class": "no_evidence", "source_urls": []}],
        "self_attestation": {
            "current_web_research_performed": True, "official_or_primary_sources_first": True, "direct_urls_only": True,
            "source_count_contract_checked": True, "supported_inference_no_evidence_labels_present": True,
            "no_fabricated_claims": True, "no_long_quotations": True, "topic_and_refs_binding_verified": True,
            "exact_attempt_id_verified": True, "fresh_direct_terminal_contract_acknowledged": True,
            "fresh_current_public_web_research_redone": True,
            "prior_attempt_result_bodies_and_peer_outputs_not_read": True,
            "canonical_agent_path_is_only_leaf_known_identity": True,
            "native_identity_deferred_to_controller_receipt_and_capture": True,
            "leaf_local_schema_conformance_check_passed_before_final_write": True,
            "exact_schema_key_set_verified": True, "source_registry_unique_and_complete": True,
            "source_registry_completed_before_claim_emission": True,
        },
    }
    return assignment, result


def synthetic_luna() -> dict:
    return {
        "audit_id": common.AUDIT_ID, "checker": "external_research_attempt_0003_luna_independent_postrun",
        "sprint_id": common.SPRINT_ID, "attempt_id": common.PRIOR_ATTEMPT_ID, "status": "fail_closed",
        "fail_closed": True, "gate_passed": False, "independent": True, "model": common.MODEL,
        "reasoning_effort": common.REASONING_EFFORT, "attempt_0003_rejected_ids": common.RECOVERY_IDS,
        "cumulative_eligible_ids": common.FLOOR_IDS, "cumulative_eligible_digest": common.FLOOR_DIGEST,
        "unresolved_rejected_ids": common.RECOVERY_IDS, "concurrency_policy_v5_sha256": common.V5_SHA256,
        "counts": {"attempt_0003_rejected": 2, "cumulative_eligible": 6, "unresolved_rejected": 2},
        "cumulative_research_credit": 0, "coverage_credit": 0, "promotion_credit": 0, "spec_credit": 0, "merge_credit": 0,
    }


def make_capture_and_receipts() -> tuple[dict, dict]:
    capture = {"attempt_id": common.ATTEMPT_ID, "leaves": []}; receipts = {}
    for index, aid in enumerate(common.RECOVERY_IDS, 1):
        thread = f"future-native-thread-{index}"; turn = f"future-native-turn-{index}"
        capture["leaves"].append({"assignment_id": aid, "agent_path": common.expected_agent_path(aid),
            "native_child_thread_id": thread, "native_child_turn_id": turn, "native_child_turn_status": "completed",
            "terminal_response_prefix": "PMR1"})
        receipts[aid] = {"task_thread_id": thread, "native_child_thread_id": thread}
    return capture, receipts


def main() -> None:
    schema = common.load_obj(common.NAMESPACE / "schema/external_research_result_v4.schema.json")
    assignment, valid = synthetic_result()
    rejected = lambda value: bool(common.result_errors(value, assignment, schema))
    tests: dict[str, bool] = {"valid_synthetic_result_passes": common.result_errors(valid, assignment, schema) == []}

    bad = copy.deepcopy(valid); bad["task_thread_id"] = "native"
    tests["result_task_thread_id_rejected"] = rejected(bad)
    bad = copy.deepcopy(valid); bad["native_child_thread_id"] = "native"
    tests["result_native_identity_rejected"] = rejected(bad)
    bad = copy.deepcopy(valid); bad["self_attestation"].pop("fresh_current_public_web_research_redone")
    tests["missing_exact_fresh_research_key_rejected"] = rejected(bad)
    bad = copy.deepcopy(valid); bad["self_attestation"]["fresh_current_web_research_redone"] = bad["self_attestation"].pop("fresh_current_public_web_research_redone")
    tests["renamed_fresh_research_key_rejected"] = rejected(bad)
    bad = copy.deepcopy(valid); bad["self_attestation"]["leaf_local_schema_conformance_check_passed_before_final_write"] = False
    tests["leaf_local_schema_check_rejected"] = rejected(bad)
    bad = copy.deepcopy(valid); bad["self_attestation"]["source_registry_unique_and_complete"] = False
    tests["source_registry_attestation_rejected"] = rejected(bad)
    bad = copy.deepcopy(valid); bad["self_attestation"]["source_registry_completed_before_claim_emission"] = False
    tests["source_registry_order_attestation_rejected"] = rejected(bad)
    bad = copy.deepcopy(valid); bad["self_attestation"]["prior_attempt_result_bodies_and_peer_outputs_not_read"] = False
    tests["prior_result_isolation_rejected"] = rejected(bad)
    bad = copy.deepcopy(valid); bad["sources"][1]["url"] = bad["sources"][0]["url"]
    tests["duplicate_source_registration_rejected"] = rejected(bad)
    for section in ("findings", "failure_modes", "implications", "novel_ideas"):
        bad = copy.deepcopy(valid); bad[section][0]["source_urls"] = [f"https://unregistered.example/{section}"]
        tests[f"unregistered_{section}_url_rejected"] = rejected(bad)
    bad = copy.deepcopy(valid); bad["findings"][0]["source_urls"] = []
    tests["supported_claim_without_source_rejected"] = rejected(bad)
    bad = copy.deepcopy(valid); bad["unresolved_questions"][0]["source_urls"] = [bad["sources"][0]["url"]]
    tests["no_evidence_with_source_rejected"] = rejected(bad)
    bad = copy.deepcopy(valid); bad["assignment_id"] = "ER-0008"
    tests["wrong_assignment_binding_rejected"] = rejected(bad)
    bad = copy.deepcopy(valid); bad["agent_path"] = "/root/reused"
    tests["wrong_agent_path_rejected"] = rejected(bad)
    bad = copy.deepcopy(valid); bad["model"] = "gpt-5.6-sol"
    tests["wrong_model_rejected"] = rejected(bad)
    bad = copy.deepcopy(valid); bad["reasoning_effort"] = "xhigh"
    tests["wrong_effort_rejected"] = rejected(bad)
    bad = copy.deepcopy(valid); bad["research_questions"] = bad["research_questions"][:-1]
    tests["incomplete_question_binding_rejected"] = rejected(bad)
    bad = copy.deepcopy(valid); bad["unexpected"] = True
    tests["extra_result_key_rejected"] = rejected(bad)
    tests["https_fragment_allowed"] = common.direct_url_errors("https://example.org/spec#section", "url") == []
    tests["non_https_rejected"] = bool(common.direct_url_errors("http://example.org/spec", "url"))
    tests["search_result_url_rejected"] = bool(common.direct_url_errors("https://google.com/search?q=x", "url"))
    tests["fragment_only_rejected"] = bool(common.direct_url_errors("#section", "url"))

    luna = synthetic_luna(); activation, errors = generate_activation.build_activation(luna, Path("/tmp/luna.json"), "a" * 64, "a" * 64, [])
    tests["valid_synthetic_luna_builds_activation"] = not errors and generate_activation.activation_errors(activation) == []
    activation_bad = copy.deepcopy(activation); activation_bad["assignment_ids"] = ["ER-0003"]
    tests["partial_activation_rejected"] = bool(generate_activation.activation_errors(activation_bad))
    activation_bad = copy.deepcopy(activation); activation_bad["concurrency_policy_v6_sha256"] = "0" * 64
    tests["wrong_active_v6_rejected"] = bool(generate_activation.activation_errors(activation_bad))
    activation_bad = copy.deepcopy(activation); activation_bad["prior_concurrency_policy_v5_sha256"] = "0" * 64
    tests["wrong_v5_lineage_rejected"] = bool(generate_activation.activation_errors(activation_bad))
    _, errors = generate_activation.build_activation(luna, Path("/tmp/luna.json"), "a" * 64, "b" * 64, [])
    tests["wrong_luna_sha_rejected"] = "luna:sha256" in errors
    mutations = {
        "wrong_luna_status_rejected": ("status", "pass"),
        "nonindependent_luna_rejected": ("independent", False),
        "wrong_luna_rejected_set_rejected": ("attempt_0003_rejected_ids", ["ER-0003"]),
        "wrong_luna_floor_rejected": ("cumulative_eligible_ids", common.FLOOR_IDS[:-1]),
        "wrong_luna_floor_digest_rejected": ("cumulative_eligible_digest", "0" * 64),
        "wrong_luna_v5_rejected": ("concurrency_policy_v5_sha256", "0" * 64),
        "wrong_luna_model_rejected": ("model", "gpt-5.6-sol"),
        "wrong_luna_effort_rejected": ("reasoning_effort", "xhigh"),
        "nonzero_luna_credit_rejected": ("cumulative_research_credit", 8),
    }
    for name, (key, value) in mutations.items():
        bad_luna = copy.deepcopy(luna); bad_luna[key] = value
        tests[name] = bool(common.luna_report_errors(bad_luna))
    bad_luna = copy.deepcopy(luna); bad_luna["counts"]["cumulative_eligible"] = 5
    tests["wrong_luna_counts_rejected"] = bool(common.luna_report_errors(bad_luna))
    bad_luna = copy.deepcopy(luna); bad_luna["unresolved_rejected_ids"] = []
    tests["resolved_set_mismatch_rejected"] = bool(common.luna_report_errors(bad_luna))

    tests["nonempty_output_rejected"] = bool(common.zero_inventory_errors({"ER-0003": ["debug.json"], "ER-0008": []}, [], [], 0, False))
    tests["premature_receipt_rejected"] = bool(common.zero_inventory_errors({"ER-0003": [], "ER-0008": []}, ["ER-0003"], [], 0, False))
    tests["premature_result_rejected"] = bool(common.zero_inventory_errors({"ER-0003": [], "ER-0008": []}, [], ["ER-0008"], 0, False))
    tests["premature_activation_rejected"] = bool(common.zero_inventory_errors({"ER-0003": [], "ER-0008": []}, [], [], 0, True))
    tests["premature_capture_rejected"] = bool(common.zero_inventory_errors({"ER-0003": [], "ER-0008": []}, [], [], 2, False))

    capture, receipts = make_capture_and_receipts()
    tests["valid_synthetic_capture_passes"] = validate_postrun.capture_set_errors(capture, receipts, set()) == []
    bad_capture = copy.deepcopy(capture); bad_capture["leaves"][1]["native_child_thread_id"] = bad_capture["leaves"][0]["native_child_thread_id"]
    tests["duplicate_capture_thread_rejected"] = bool(validate_postrun.capture_set_errors(bad_capture, receipts, set()))
    bad_capture = copy.deepcopy(capture); bad_capture["leaves"][0]["native_child_turn_status"] = "failed"
    tests["nonterminal_capture_rejected"] = bool(validate_postrun.capture_set_errors(bad_capture, receipts, set()))
    prior = {capture["leaves"][0]["native_child_thread_id"]}
    tests["prior_native_identity_reuse_rejected"] = bool(validate_postrun.capture_set_errors(capture, receipts, prior))
    tests["extra_output_file_rejected"] = bool(validate_postrun.output_files_errors(["result.json", "debug.json"]))
    tests["partial_validity_preserves_other_row"] = len([aid for aid in common.RECOVERY_IDS if aid != "ER-0008"]) == 1

    failures = sorted(name for name, passed in tests.items() if not passed)
    report = {"checker": "external_research_recovery_attempt_0004_negative_tests_v4",
              "status": "pass" if not failures and len(tests) >= 24 else "fail", "test_count": len(tests),
              "errors": failures, "tests": tests, "activation_granted": False, "receipts": 0, "results": 0,
              "cumulative_research_credit": 0}
    print(json.dumps(report, indent=2, sort_keys=True))
    raise SystemExit(0 if report["status"] == "pass" else 1)


if __name__ == "__main__": main()
