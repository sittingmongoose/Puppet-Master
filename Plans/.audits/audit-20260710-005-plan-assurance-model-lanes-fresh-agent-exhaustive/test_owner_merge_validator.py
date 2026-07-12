#!/usr/bin/env python3
"""Paired positive/negative semantic tests for the owner-merge result validator."""

from __future__ import annotations

import copy
import json

from validate_owner_merge_batch import result_errors


def fixture() -> tuple[dict, dict, dict, dict]:
    assignment = {
        "audit_id": "audit-test",
        "assignment_id": "A-TEST",
        "packet_id": "P-TEST",
        "packet_sha256": "0" * 64,
        "local_feature_refs_digest": "1" * 64,
        "local_feature_count": 2,
        "local_feature_refs": ["L1", "L2"],
        "owner_domain": "tools_integrations_mcp",
    }
    packet = {"features": [
        {
            "local_feature_ref": "L1", "feature_kind": "tool", "aliases": ["alpha"],
            "source_documents": ["D1"], "source_unit_refs": ["U1"], "risk_level": "medium",
            "spec_state": "partially_specified", "gap_summary": "gap one",
            "cross_packet_terms": ["x"], "confidence": 0.8,
        },
        {
            "local_feature_ref": "L2", "feature_kind": "tool", "aliases": ["beta"],
            "source_documents": ["D2"], "source_unit_refs": ["U2"], "risk_level": "high",
            "spec_state": "under_specified", "gap_summary": "gap two",
            "cross_packet_terms": ["y"], "confidence": 0.7,
        },
    ]}
    receipt = {"agent_path": "/root/synthetic-owner-merge-leaf"}
    result = {
        "audit_id": "audit-test",
        "schema_version": "owner-merge-result-v1",
        "phase": "owner_domain_shard_merge",
        "assignment_id": "A-TEST",
        "attempt_id": "attempt-0001",
        "task_thread_id": "/root/synthetic-owner-merge-leaf",
        "model": "gpt-5.6-sol",
        "reasoning_effort": "xhigh",
        "status": "completed",
        "input_binding": {
            "packet_id": "P-TEST", "packet_sha256": "0" * 64,
            "local_feature_refs_digest": "1" * 64,
        },
        "coverage": {"assigned_local_feature_count": 2, "assigned_local_feature_refs": ["L1", "L2"]},
        "provisional_features": [{
            "provisional_feature_id": "PF-0001", "title": "Merged tool", "summary": "Same tool.",
            "owner_domain": "tools_integrations_mcp", "feature_kinds": ["tool"],
            "aliases": ["alpha", "beta"], "local_feature_refs": ["L1", "L2"],
            "source_documents": ["D1", "D2"], "source_unit_refs": ["U1", "U2"],
            "risk_level": "high", "spec_state": "under_specified",
            "gap_summary": "gap one | gap two", "cross_domain_terms": ["x", "y"], "confidence": 0.7,
        }],
        "local_feature_memberships": [
            {"local_feature_ref": "L1", "provisional_feature_id": "PF-0001", "merge_disposition": "merged_synonym", "rationale": "same authority and lifecycle"},
            {"local_feature_ref": "L2", "provisional_feature_id": "PF-0001", "merge_disposition": "merged_synonym", "rationale": "same authority and lifecycle"},
        ],
        "relationships": [],
        "self_attestation": {
            "all_local_features_mapped_once": True,
            "only_true_synonyms_merged": True,
            "distinct_lifecycles_preserved": True,
            "gaps_and_non_gaps_preserved": True,
            "no_cross_domain_merge": True,
            "no_external_or_peer_inputs_used": True,
        },
    }
    return assignment, packet, receipt, result


def run_tests() -> dict[str, bool]:
    assignment, packet, receipt, valid = fixture()
    tests: dict[str, bool] = {}
    tests["valid_synthetic_passed"] = result_errors(valid, assignment, packet, receipt) == []

    mutated = copy.deepcopy(valid)
    mutated["provisional_features"][0]["unexpected"] = True
    tests["extra_nested_key_rejected"] = bool(result_errors(mutated, assignment, packet, receipt))

    mutated = copy.deepcopy(valid)
    mutated["provisional_features"][0]["local_feature_refs"] = ["L1"]
    tests["omitted_local_feature_rejected"] = bool(result_errors(mutated, assignment, packet, receipt))

    mutated = copy.deepcopy(valid)
    mutated["local_feature_memberships"].append(copy.deepcopy(mutated["local_feature_memberships"][0]))
    tests["duplicate_membership_rejected"] = bool(result_errors(mutated, assignment, packet, receipt))

    mutated = copy.deepcopy(valid)
    mutated["provisional_features"][0]["owner_domain"] = "permissions_security_privacy"
    tests["cross_domain_merge_rejected"] = bool(result_errors(mutated, assignment, packet, receipt))

    mutated = copy.deepcopy(valid)
    mutated["provisional_features"][0]["source_unit_refs"] = ["U1"]
    tests["source_union_mismatch_rejected"] = bool(result_errors(mutated, assignment, packet, receipt))
    return tests


def main() -> None:
    tests = run_tests()
    report = {"status": "pass" if all(tests.values()) else "fail", "strict_tests": tests}
    print(json.dumps(report, indent=2, sort_keys=True))
    raise SystemExit(0 if report["status"] == "pass" else 1)


if __name__ == "__main__":
    main()
