#!/usr/bin/env python3
"""Negative-test harness for universal external-research validation."""

from __future__ import annotations

import copy
import json

from validate_external_research_universal_batch import (
    MAX_PACKET_BYTES, output_file_errors, packet_size_errors, receipt_set_errors, result_errors,
)


def fixture():
    assignment = {
        "assignment_id": "A005ERU-0001", "packet_id": "ERUPKT-0001", "packet_sha256": "0" * 64,
        "feature_refs_digest": "1" * 64, "source_rows_digest": "2" * 64,
        "feature_count": 2, "feature_refs": ["PF-A", "PF-B"],
        "source_row_sha256_by_feature": {"PF-A": "a" * 64, "PF-B": "b" * 64},
    }
    receipt = {"agent_path": "/root/a005_external_research_universal_0001_attempt_0001_terminal"}
    def source(sid, url):
        return {"source_id": sid, "url": url, "title": f"Title {sid}", "publisher": "Publisher", "source_type": "official_product_documentation", "accessed_date": "2026-07-11", "section_anchor": "Section 1", "evidence_snippet": "Short evidence snippet.", "applicability": "Directly supports this feature baseline."}
    def feature(ref, row_hash):
        return {
            "provisional_feature_ref": ref, "source_row_sha256": row_hash, "research_group_id": "RG-1",
            "research_state": "researched", "search_attempts": ["Searched official documentation and standards."],
            "insufficient_evidence_reason": None,
            "sources": [source("S1", "https://example.org/one"), source("S2", "https://example.org/two")],
            "supported_claims": [
                {"claim_id": "C1", "claim": "Baseline claim one.", "source_ids": ["S1"], "applicability": "Applies directly."},
                {"claim_id": "C2", "claim": "Baseline claim two.", "source_ids": ["S2"], "applicability": "Applies directly."},
            ],
            "external_baseline_summary": "External baseline summary.", "confirmed_gaps": [],
            "underspecifications": ["A boundary is underspecified."], "contradictions": [],
            "missed_failure_modes": ["A recovery failure mode is missing."], "conclusion_changed": True,
            "conclusion_change_summary": "External evidence changes the conclusion.",
            "proposed_spec_deltas": ["Specify the missing boundary."],
            "scenario_implications": ["Validate the recovery path."],
            "adversarial_implications": ["Test malformed upstream state."],
        }
    result = {
        "audit_id": "audit-20260710-005-plan-assurance-model-lanes-fresh-agent-exhaustive",
        "schema_version": "external-research-universal-result-v1", "phase": "universal_external_research",
        "assignment_id": "A005ERU-0001", "attempt_id": "attempt-0001",
        "task_thread_id": receipt["agent_path"], "model": "gpt-5.6-sol", "reasoning_effort": "xhigh",
        "status": "completed", "input_binding": {"packet_id": "ERUPKT-0001", "packet_sha256": "0" * 64, "feature_refs_digest": "1" * 64, "source_rows_digest": "2" * 64},
        "coverage": {"feature_count": 2, "feature_refs": ["PF-A", "PF-B"]},
        "feature_results": [feature("PF-A", "a" * 64), feature("PF-B", "b" * 64)],
        "self_attestation": {"live_public_web_browsed": True, "every_feature_researched_or_blocked": True, "authoritative_sources_prioritized": True, "per_feature_source_mapping_complete": True, "plans_not_edited": True, "no_peer_or_prior_research_used": True},
    }
    return assignment, receipt, result


def rejected(value, assignment, receipt):
    return bool(result_errors(value, assignment, receipt))


def main() -> None:
    assignment, receipt, valid = fixture()
    tests = {"valid_synthetic_passed": result_errors(valid, assignment, receipt) == []}
    mutated = copy.deepcopy(valid); mutated["feature_results"] = mutated["feature_results"][:1]
    tests["missing_feature_rejected"] = rejected(mutated, assignment, receipt)
    mutated = copy.deepcopy(valid); mutated["feature_results"][1] = copy.deepcopy(mutated["feature_results"][0])
    tests["duplicate_feature_rejected"] = rejected(mutated, assignment, receipt)
    mutated = copy.deepcopy(valid); mutated["feature_results"][1]["provisional_feature_ref"] = "PF-FOREIGN"
    tests["foreign_feature_rejected"] = rejected(mutated, assignment, receipt)
    mutated = copy.deepcopy(valid); mutated["feature_results"][0]["source_row_sha256"] = "f" * 64
    tests["wrong_source_row_hash_rejected"] = rejected(mutated, assignment, receipt)
    mutated = copy.deepcopy(valid); mutated["feature_results"][0]["sources"] = []; mutated["feature_results"][0]["supported_claims"] = []
    tests["no_browsing_evidence_rejected"] = rejected(mutated, assignment, receipt)
    mutated = copy.deepcopy(valid); mutated["feature_results"][0]["sources"][0]["url"] = "not-a-url"
    tests["non_url_source_rejected"] = rejected(mutated, assignment, receipt)
    mutated = copy.deepcopy(valid); mutated["feature_results"][0]["sources"] = mutated["feature_results"][0]["sources"][:1]; mutated["feature_results"][0]["supported_claims"] = mutated["feature_results"][0]["supported_claims"][:1]
    tests["fewer_than_two_without_insufficient_state_rejected"] = rejected(mutated, assignment, receipt)
    mutated = copy.deepcopy(valid); mutated["coverage"]["feature_refs"] = ["PF-A"]
    tests["missing_per_feature_mapping_rejected"] = rejected(mutated, assignment, receipt)
    mutated = copy.deepcopy(valid); mutated["model"] = "gpt-5.6-luna"
    tests["wrong_model_rejected"] = rejected(mutated, assignment, receipt)
    mutated = copy.deepcopy(valid); mutated["reasoning_effort"] = "high"
    tests["wrong_effort_rejected"] = rejected(mutated, assignment, receipt)
    mutated = copy.deepcopy(valid); mutated["task_thread_id"] = "/root/wrong"
    tests["wrong_identity_rejected"] = rejected(mutated, assignment, receipt)
    tests["extra_output_file_rejected"] = bool(output_file_errors(["result.json", "extra.json"]))
    tests["missing_receipt_rejected"] = bool(receipt_set_errors(["A", "B"], [{"assignment_id": "A", "agent_path": "/root/a"}]))
    tests["duplicate_receipt_rejected"] = bool(receipt_set_errors(["A", "B"], [{"assignment_id": "A", "agent_path": "/root/a"}, {"assignment_id": "B", "agent_path": "/root/a"}]))
    tests["packet_over_ceiling_rejected"] = bool(packet_size_errors(MAX_PACKET_BYTES + 1))
    mutated = copy.deepcopy(valid); mutated["feature_results"][0]["supported_claims"][0]["source_ids"] = ["UNKNOWN"]
    tests["source_claim_mapping_mismatch_rejected"] = rejected(mutated, assignment, receipt)
    report = {"status": "pass" if all(tests.values()) else "fail", "strict_tests": tests}
    print(json.dumps(report, indent=2, sort_keys=True))
    raise SystemExit(0 if report["status"] == "pass" else 1)


if __name__ == "__main__":
    main()
