#!/usr/bin/env python3
"""Strict negative tests for the reverse-orientation shadow validator."""

from __future__ import annotations

import copy
import json

from cross_shard_shadow_common import ORIENTATION
from validate_cross_shard_shadow_batch import output_file_errors, receipt_set_errors, result_errors


def fixture():
    assignment = {
        "audit_id": "audit-test", "assignment_id": "A005CSS-0001", "packet_id": "CSSPKT-0001",
        "packet_sha256": "0" * 64, "anchor_refs_digest": "1" * 64, "comparator_refs_digest": "2" * 64,
        "orientation": ORIENTATION, "original_left_owner_assignment_id": "LEFT",
        "original_right_owner_assignment_id": "RIGHT", "anchor_owner_assignment_id": "RIGHT",
        "comparator_owner_assignment_id": "LEFT", "anchor_count": 2, "anchor_refs": ["R1", "R2"],
        "comparator_count": 3, "comparator_refs": ["L1", "L2", "L3"],
    }
    receipt = {"agent_path": "/root/test-cross-shard-shadow"}
    result = {
        "audit_id": "audit-test", "schema_version": "cross-shard-shadow-result-v1",
        "phase": "cross_shard_reverse_orientation_shadow_candidate_discovery",
        "assignment_id": "A005CSS-0001", "attempt_id": "attempt-0001",
        "task_thread_id": "/root/test-cross-shard-shadow", "model": "gpt-5.6-sol",
        "reasoning_effort": "xhigh", "status": "completed",
        "input_binding": {
            "packet_id": "CSSPKT-0001", "packet_sha256": "0" * 64,
            "anchor_refs_digest": "1" * 64, "comparator_refs_digest": "2" * 64,
            "orientation": ORIENTATION, "anchor_owner_assignment_id": "RIGHT",
            "comparator_owner_assignment_id": "LEFT",
        },
        "coverage": {"anchor_count": 2, "anchor_refs": ["R1", "R2"], "comparator_count": 3, "comparator_refs": ["L1", "L2", "L3"]},
        "decisions": [
            {"anchor_provisional_feature_ref": "R1", "compared_against_count": 3, "merge_candidate_refs": ["L1"], "related_but_distinct_refs": ["L2"], "rationale": "strictly equivalent only to L1", "confidence": 0.9},
            {"anchor_provisional_feature_ref": "R2", "compared_against_count": 3, "merge_candidate_refs": [], "related_but_distinct_refs": [], "rationale": "no equivalent comparator", "confidence": 0.8},
        ],
        "self_attestation": {
            "every_anchor_decided_once": True, "every_comparator_considered_for_each_anchor": True,
            "strict_merge_equivalence_applied": True, "umbrella_member_and_adjacency_kept_distinct": True,
            "reverse_orientation_verified": True, "same_owner_domain_only": True,
            "no_external_or_peer_inputs_used": True,
        },
    }
    return assignment, receipt, result


def rejected(result, assignment, receipt) -> bool:
    return bool(result_errors(result, assignment, receipt))


def main() -> None:
    assignment, receipt, valid = fixture()
    tests = {"valid_synthetic_passed": result_errors(valid, assignment, receipt) == []}
    mutated = copy.deepcopy(valid); mutated["decisions"][0]["extra"] = True
    tests["extra_nested_key_rejected"] = rejected(mutated, assignment, receipt)
    mutated = copy.deepcopy(valid); mutated["decisions"] = mutated["decisions"][:1]
    tests["omitted_anchor_rejected"] = rejected(mutated, assignment, receipt)
    mutated = copy.deepcopy(valid); mutated["decisions"][1]["anchor_provisional_feature_ref"] = "R1"
    tests["duplicate_anchor_rejected"] = rejected(mutated, assignment, receipt)
    mutated = copy.deepcopy(valid); mutated["decisions"][0]["merge_candidate_refs"] = ["FOREIGN"]
    tests["foreign_comparator_rejected"] = rejected(mutated, assignment, receipt)
    mutated = copy.deepcopy(valid); mutated["decisions"][0]["related_but_distinct_refs"] = ["L1"]
    tests["candidate_related_overlap_rejected"] = rejected(mutated, assignment, receipt)
    mutated = copy.deepcopy(valid); mutated["decisions"][0]["compared_against_count"] = 2
    tests["incomplete_comparison_count_rejected"] = rejected(mutated, assignment, receipt)
    mutated = copy.deepcopy(valid); mutated["input_binding"]["orientation"] = "primary_left_as_anchor"
    tests["wrong_reversed_orientation_rejected"] = rejected(mutated, assignment, receipt)
    mutated = copy.deepcopy(valid); mutated["model"] = "gpt-5.6-luna"
    tests["wrong_model_rejected"] = rejected(mutated, assignment, receipt)
    mutated = copy.deepcopy(valid); mutated["reasoning_effort"] = "high"
    tests["wrong_effort_rejected"] = rejected(mutated, assignment, receipt)
    mutated = copy.deepcopy(valid); mutated["task_thread_id"] = "/root/wrong-identity"
    tests["wrong_identity_rejected"] = rejected(mutated, assignment, receipt)
    tests["extra_output_files_rejected"] = bool(output_file_errors(["result.json", "extra.json"]))
    tests["missing_receipt_rejected_post_dispatch"] = bool(receipt_set_errors(["A", "B"], [{"assignment_id": "A", "agent_path": "/root/a"}]))
    tests["duplicate_receipt_rejected_post_dispatch"] = bool(receipt_set_errors(["A", "B"], [{"assignment_id": "A", "agent_path": "/root/a"}, {"assignment_id": "B", "agent_path": "/root/a"}]))
    report = {"status": "pass" if all(tests.values()) else "fail", "strict_tests": tests}
    print(json.dumps(report, indent=2, sort_keys=True))
    raise SystemExit(0 if report["status"] == "pass" else 1)


if __name__ == "__main__":
    main()
