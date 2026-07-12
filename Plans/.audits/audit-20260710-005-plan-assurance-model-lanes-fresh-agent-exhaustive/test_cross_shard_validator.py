#!/usr/bin/env python3
"""Paired strict tests for the cross-shard result validator."""

from __future__ import annotations

import copy
import json

from validate_cross_shard_batch import result_errors


def fixture():
    assignment = {
        "audit_id": "audit-test", "assignment_id": "A", "packet_id": "P", "packet_sha256": "0" * 64,
        "anchor_refs_digest": "1" * 64, "comparator_refs_digest": "2" * 64,
        "anchor_count": 2, "anchor_refs": ["A1", "A2"],
        "comparator_count": 3, "comparator_refs": ["C1", "C2", "C3"],
    }
    receipt = {"agent_path": "/root/test-cross-shard"}
    result = {
        "audit_id": "audit-test", "schema_version": "cross-shard-result-v1",
        "phase": "cross_shard_same_owner_candidate_discovery", "assignment_id": "A",
        "attempt_id": "attempt-0001", "task_thread_id": "/root/test-cross-shard",
        "model": "gpt-5.6-sol", "reasoning_effort": "xhigh", "status": "completed",
        "input_binding": {"packet_id": "P", "packet_sha256": "0" * 64, "anchor_refs_digest": "1" * 64, "comparator_refs_digest": "2" * 64},
        "coverage": {"anchor_count": 2, "anchor_refs": ["A1", "A2"], "comparator_count": 3, "comparator_refs": ["C1", "C2", "C3"]},
        "decisions": [
            {"anchor_provisional_feature_ref": "A1", "compared_against_count": 3, "merge_candidate_refs": ["C1"], "related_but_distinct_refs": ["C2"], "rationale": "same feature only for C1", "confidence": 0.9},
            {"anchor_provisional_feature_ref": "A2", "compared_against_count": 3, "merge_candidate_refs": [], "related_but_distinct_refs": [], "rationale": "no same feature", "confidence": 0.8},
        ],
        "self_attestation": {
            "every_anchor_decided_once": True, "every_comparator_considered_for_each_anchor": True,
            "merge_candidates_require_same_authority_and_lifecycle": True, "distinct_boundaries_preserved": True,
            "same_owner_domain_only": True, "no_external_or_peer_inputs_used": True,
        },
    }
    return assignment, receipt, result


def main() -> None:
    assignment, receipt, valid = fixture()
    tests = {"valid_synthetic_passed": result_errors(valid, assignment, receipt) == []}
    mutated = copy.deepcopy(valid); mutated["decisions"][0]["extra"] = True
    tests["extra_nested_key_rejected"] = bool(result_errors(mutated, assignment, receipt))
    mutated = copy.deepcopy(valid); mutated["decisions"] = mutated["decisions"][:1]
    tests["omitted_anchor_rejected"] = bool(result_errors(mutated, assignment, receipt))
    mutated = copy.deepcopy(valid); mutated["decisions"][0]["merge_candidate_refs"] = ["X"]
    tests["foreign_comparator_rejected"] = bool(result_errors(mutated, assignment, receipt))
    mutated = copy.deepcopy(valid); mutated["decisions"][0]["related_but_distinct_refs"] = ["C1"]
    tests["candidate_related_overlap_rejected"] = bool(result_errors(mutated, assignment, receipt))
    mutated = copy.deepcopy(valid); mutated["decisions"][0]["compared_against_count"] = 2
    tests["incomplete_comparison_count_rejected"] = bool(result_errors(mutated, assignment, receipt))
    report = {"status": "pass" if all(tests.values()) else "fail", "strict_tests": tests}
    print(json.dumps(report, indent=2, sort_keys=True))
    raise SystemExit(0 if report["status"] == "pass" else 1)


if __name__ == "__main__":
    main()
