#!/usr/bin/env python3
"""Strict negative-test harness for scenario/adversarial certification."""

from __future__ import annotations

import copy
import json

from prepare_scenario_adversarial_wave import DIMENSIONS, FEATURE_FIELD_ORDER, MAX_PACKET_BYTES
from validate_scenario_adversarial_batch import (
    output_file_errors, packet_domain_errors, packet_record_errors, packet_size_errors, receipt_set_errors, result_errors,
)


def fixture():
    assignment = {
        "assignment_id": "A005SA-0001", "cohort_id": "cohort-0001", "packet_id": "SAPKT-0001",
        "packet_sha256": "0" * 64, "feature_refs_digest": "1" * 64, "feature_count": 2,
        "feature_refs": ["PF-A", "PF-B"], "candidate_evidence_label": "mechanically_valid_candidate_evidence_not_final_semantic_authority",
    }
    receipt = {"agent_path": "/root/a005_scenario_adversarial_0001_attempt_0001_terminal"}
    def packet_feature(ref, row_hash, result_hash, record_hash):
        value = {key: [] for key in FEATURE_FIELD_ORDER}
        value.update({
            "provisional_feature_ref": ref, "source_row_sha256": row_hash, "owner_domain": "domain-a", "title": "Title",
            "summary": "Summary", "gap_summary": "Gap", "spec_state": "planned", "risk_level": "medium",
            "research_obligation_count": 1, "scenario_obligation_count": 1,
            "research_binding": [result_hash, record_hash], "research_state": "researched",
            "external_baseline_summary": "Baseline", "conclusion_changed": False,
            "conclusion_change_summary": "No change", "direct_sources": [["S1", "https://example.org/one"]],
            "supported_claims": [["C1", "Exact supported claim.", ["S1"], "Directly applicable."]],
        })
        return value
    records = [packet_feature("PF-A", "a" * 64, "c" * 64, "e" * 64), packet_feature("PF-B", "b" * 64, "d" * 64, "f" * 64)]
    def criterion():
        return {"criterion": "Execute the scenario.", "observables": ["state transition"], "evidence_artifacts": ["trace.json"],
                "oracle": {"pass": "Expected transition is observed.", "fail": "Expected transition is absent."}}
    def feature(ref, row_hash, result_hash, record_hash):
        dimensions = {name: {"disposition": "certified", "rationale": "The behavior is specified and falsifiable.",
                             "scenarios": [f"Exercise {name}."], "acceptance_criteria": [criterion()], "spec_deltas": []}
                      for name in DIMENSIONS}
        return {
            "provisional_feature_ref": ref, "source_row_sha256": row_hash,
            "research_result_file_sha256": result_hash, "research_record_sha256": record_hash,
            "certification_disposition": "certified", "disposition_rationale": "All dimensions are certified.",
            "research_applicability": {"state": "applicable", "rationale": "The claim directly applies.",
                                       "browsing_performed": False,
                                       "claims_used": [{"claim_id": "C1", "claim": "Exact supported claim.",
                                                        "source_urls": ["https://example.org/one"], "evidence_label": "candidate_research_verified"}]},
            "dimensions": dimensions, "overall_spec_deltas": [], "newly_discovered_candidates": [],
        }
    result = {
        "audit_id": "audit-20260710-005-plan-assurance-model-lanes-fresh-agent-exhaustive",
        "schema_version": "scenario-adversarial-result-v1", "phase": "scenario_adversarial_certification",
        "cohort_id": "cohort-0001", "assignment_id": "A005SA-0001", "attempt_id": "attempt-0001",
        "task_thread_id": receipt["agent_path"], "model": "gpt-5.6-sol", "reasoning_effort": "xhigh", "status": "completed",
        "input_binding": {"packet_id": "SAPKT-0001", "packet_sha256": "0" * 64, "feature_refs_digest": "1" * 64,
                          "candidate_evidence_label": "mechanically_valid_candidate_evidence_not_final_semantic_authority"},
        "coverage": {"feature_count": 2, "feature_refs": ["PF-A", "PF-B"]},
        "feature_certifications": [feature("PF-A", "a" * 64, "c" * 64, "e" * 64), feature("PF-B", "b" * 64, "d" * 64, "f" * 64)],
        "self_attestation": {"independent_reasoning_completed": True, "candidate_research_not_treated_as_proof": True,
                             "every_feature_certified_once": True, "every_dimension_completed": True,
                             "all_claims_source_mapped": True, "plans_not_edited": True, "no_descendants_or_followups": True},
    }
    return assignment, receipt, records, result


def main() -> None:
    assignment, receipt, records, valid = fixture()
    reject = lambda value: bool(result_errors(value, assignment, receipt, records))
    tests = {"valid_synthetic_passed": result_errors(valid, assignment, receipt, records) == []}
    mutated = copy.deepcopy(valid); mutated["feature_certifications"] = mutated["feature_certifications"][:1]
    tests["missing_feature_rejected"] = reject(mutated)
    mutated = copy.deepcopy(valid); mutated["feature_certifications"][1] = copy.deepcopy(mutated["feature_certifications"][0])
    tests["duplicate_feature_rejected"] = reject(mutated)
    mutated = copy.deepcopy(valid); mutated["feature_certifications"][1]["provisional_feature_ref"] = "PF-FOREIGN"
    tests["foreign_feature_rejected"] = reject(mutated)
    mutated = copy.deepcopy(valid); mutated["feature_certifications"][0]["source_row_sha256"] = "9" * 64
    tests["wrong_source_row_hash_rejected"] = reject(mutated)
    mutated = copy.deepcopy(valid); mutated["feature_certifications"][0]["research_result_file_sha256"] = "9" * 64
    tests["wrong_research_result_hash_rejected"] = reject(mutated)
    mutated = copy.deepcopy(valid); mutated["feature_certifications"][0]["research_record_sha256"] = "9" * 64
    tests["wrong_research_record_hash_rejected"] = reject(mutated)
    bad_records = copy.deepcopy(records); bad_records[0].pop("external_baseline_summary")
    tests["lost_compact_field_rejected"] = bool(packet_record_errors(bad_records))
    tests["packet_ceiling_rejected"] = bool(packet_size_errors(MAX_PACKET_BYTES + 1))
    cross = copy.deepcopy(records); cross[1]["owner_domain"] = "domain-b"
    tests["cross_domain_packet_rejected"] = bool(packet_domain_errors({"owner_domain": "domain-a"}, cross))
    mutated = copy.deepcopy(valid); mutated["model"] = "gpt-5.6-luna"
    tests["wrong_model_rejected"] = reject(mutated)
    mutated = copy.deepcopy(valid); mutated["reasoning_effort"] = "high"
    tests["wrong_effort_rejected"] = reject(mutated)
    mutated = copy.deepcopy(valid); mutated["task_thread_id"] = "/root/wrong"
    tests["wrong_identity_rejected"] = reject(mutated)
    mutated = copy.deepcopy(valid); mutated["feature_certifications"][0]["dimensions"].pop(DIMENSIONS[0])
    tests["missing_dimension_without_not_applicable_rejected"] = reject(mutated)
    mutated = copy.deepcopy(valid); mutated["feature_certifications"][0]["dimensions"][DIMENSIONS[0]]["acceptance_criteria"][0]["evidence_artifacts"] = []
    tests["missing_executable_evidence_rejected"] = reject(mutated)
    mutated = copy.deepcopy(valid); mutated["feature_certifications"][0]["dimensions"][DIMENSIONS[0]]["acceptance_criteria"][0]["oracle"]["fail"] = ""
    tests["missing_falsifiable_oracle_rejected"] = reject(mutated)
    mutated = copy.deepcopy(valid); mutated["feature_certifications"][0]["research_applicability"]["claims_used"][0]["claim"] = "Invented claim."
    tests["unsupported_research_claim_rejected"] = reject(mutated)
    mutated = copy.deepcopy(valid); dimension = mutated["feature_certifications"][0]["dimensions"][DIMENSIONS[0]]; dimension["disposition"] = "gap_confirmed"; dimension["spec_deltas"] = []
    tests["missing_failure_spec_delta_rejected"] = reject(mutated)
    tests["extra_output_file_rejected"] = bool(output_file_errors(["result.json", "extra.json"]))
    tests["missing_receipt_rejected"] = bool(receipt_set_errors(["A", "B"], [{"assignment_id": "A", "agent_path": "/root/a"}]))
    tests["duplicate_receipt_rejected"] = bool(receipt_set_errors(["A", "B"], [{"assignment_id": "A", "agent_path": "/root/a"}, {"assignment_id": "B", "agent_path": "/root/a"}]))
    mutated = copy.deepcopy(valid); mutated["coverage"]["feature_refs"] = ["PF-A"]
    tests["result_coverage_mismatch_rejected"] = reject(mutated)
    mutated = copy.deepcopy(valid); mutated["feature_certifications"][0]["research_applicability"]["extra"] = True
    tests["extra_nested_key_rejected"] = reject(mutated)
    report = {"status": "pass" if all(tests.values()) and len(tests) >= 18 else "fail", "strict_test_count": len(tests), "strict_tests": tests}
    print(json.dumps(report, indent=2, sort_keys=True))
    raise SystemExit(0 if report["status"] == "pass" else 1)


if __name__ == "__main__":
    main()
