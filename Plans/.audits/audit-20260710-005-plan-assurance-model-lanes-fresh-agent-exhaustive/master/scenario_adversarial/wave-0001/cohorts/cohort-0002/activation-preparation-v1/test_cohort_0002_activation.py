#!/usr/bin/env python3
"""Strict negative tests for the cohort-0002 V6 activation gate."""

from __future__ import annotations

import copy
import json
from pathlib import Path

import generate_cohort_0002_activation as gate


def valid_checkpoint() -> dict:
    return {
        "audit_id": gate.AUDIT_ID,
        "target_wave_id": gate.WAVE_ID,
        "target_cohort_id": gate.COHORT_ID,
        "scenario_assignment_ids": gate.ASSIGNMENT_IDS,
        "status": "pass",
        "gate_passed": True,
        "independent": True,
        "eligible_assignment_ids": gate.RESEARCH_IDS,
        "eligible_assignment_digest": gate.RESEARCH_ELIGIBLE_DIGEST,
        "rejected_assignment_ids": [],
        "unresolved_research_rejections": [],
        "cumulative_research_credit": 8,
        "concurrency_policy_v6_sha256": gate.V6_SHA,
        "counts": {"eligible": 8, "rejected": 0, "unresolved_research_rejections": 0},
    }


def main() -> None:
    snapshot, bindings = gate.snapshot_errors()
    tests: dict[str, bool] = {"fixed_snapshot_valid": snapshot == [] and len(bindings) == 8}
    checkpoint = valid_checkpoint()
    activation, errors = gate.build_activation(checkpoint, Path("/tmp/research-checkpoint.json"), "a" * 64, "a" * 64, [])
    activation["assignment_bindings"] = bindings
    tests["valid_checkpoint_builds_synthetic_activation"] = not errors and gate.activation_errors(activation) == []
    tests["valid_synthetic_activation"] = gate.activation_errors(activation) == []

    bad_checkpoint = copy.deepcopy(checkpoint); bad_checkpoint["status"] = "fail"
    tests["wrong_checkpoint_status_rejected"] = bool(gate.checkpoint_errors(bad_checkpoint))
    bad_checkpoint = copy.deepcopy(checkpoint); bad_checkpoint["gate_passed"] = False
    tests["checkpoint_gate_false_rejected"] = bool(gate.checkpoint_errors(bad_checkpoint))
    bad_checkpoint = copy.deepcopy(checkpoint); bad_checkpoint["independent"] = False
    tests["nonindependent_checkpoint_rejected"] = bool(gate.checkpoint_errors(bad_checkpoint))
    bad_checkpoint = copy.deepcopy(checkpoint); bad_checkpoint["eligible_assignment_ids"] = gate.RESEARCH_IDS[:-1]
    tests["partial_eligibility_rejected"] = bool(gate.checkpoint_errors(bad_checkpoint))
    bad_checkpoint = copy.deepcopy(checkpoint); bad_checkpoint["eligible_assignment_ids"] = list(reversed(gate.RESEARCH_IDS))
    tests["wrong_eligible_order_rejected"] = bool(gate.checkpoint_errors(bad_checkpoint))
    bad_checkpoint = copy.deepcopy(checkpoint); bad_checkpoint["eligible_assignment_digest"] = "0" * 64
    tests["wrong_eligible_digest_rejected"] = bool(gate.checkpoint_errors(bad_checkpoint))
    bad_checkpoint = copy.deepcopy(checkpoint); bad_checkpoint["rejected_assignment_ids"] = ["ER-0008"]
    tests["research_rejection_rejected"] = bool(gate.checkpoint_errors(bad_checkpoint))
    bad_checkpoint = copy.deepcopy(checkpoint); bad_checkpoint["unresolved_research_rejections"] = ["ER-0008"]
    tests["unresolved_research_rejection_rejected"] = bool(gate.checkpoint_errors(bad_checkpoint))
    bad_checkpoint = copy.deepcopy(checkpoint); bad_checkpoint["counts"]["eligible"] = 7
    tests["wrong_checkpoint_counts_rejected"] = bool(gate.checkpoint_errors(bad_checkpoint))
    bad_checkpoint = copy.deepcopy(checkpoint); bad_checkpoint["cumulative_research_credit"] = 0
    tests["wrong_checkpoint_credit_rejected"] = bool(gate.checkpoint_errors(bad_checkpoint))
    bad_checkpoint = copy.deepcopy(checkpoint); bad_checkpoint["concurrency_policy_v6_sha256"] = "0" * 64
    tests["wrong_checkpoint_v6_rejected"] = bool(gate.checkpoint_errors(bad_checkpoint))
    bad_checkpoint = copy.deepcopy(checkpoint); bad_checkpoint["audit_id"] = "wrong"
    tests["wrong_checkpoint_audit_rejected"] = bool(gate.checkpoint_errors(bad_checkpoint))
    for cohort in ("cohort-0001", "cohort-0003", "cohort-0004"):
        bad_checkpoint = copy.deepcopy(checkpoint); bad_checkpoint["target_cohort_id"] = cohort
        tests[f"{cohort.replace('-', '_')}_checkpoint_input_rejected"] = bool(gate.checkpoint_errors(bad_checkpoint))
    bad_checkpoint = copy.deepcopy(checkpoint); bad_checkpoint["scenario_assignment_ids"] = [f"A005SA-{index:04d}" for index in range(1, 33)]
    tests["all_32_checkpoint_scope_rejected"] = bool(gate.checkpoint_errors(bad_checkpoint))
    _, sha_errors = gate.build_activation(checkpoint, Path("/tmp/research-checkpoint.json"), "a" * 64, "b" * 64, [])
    tests["wrong_checkpoint_sha_rejected"] = "checkpoint:sha256" in sha_errors

    mutations = {
        "cohort_0001_input_rejected": ("cohort_id", "cohort-0001"),
        "cohort_0003_input_rejected": ("cohort_id", "cohort-0003"),
        "cohort_0004_input_rejected": ("cohort_id", "cohort-0004"),
        "wrong_assignment_set_rejected": ("assignment_ids", gate.ASSIGNMENT_IDS[:-1]),
        "all_32_activation_rejected": ("assignment_ids", [f"A005SA-{index:04d}" for index in range(1, 33)]),
        "wrong_assignment_count_rejected": ("assignment_count", 32),
        "wrong_model_rejected": ("model", "gpt-5.6-luna"),
        "wrong_effort_rejected": ("reasoning_effort", "max"),
        "wrong_agent_paths_rejected": ("agent_paths", gate.AGENT_PATHS[:-1] + ["/root/cross-cohort"]),
        "wrong_v6_rejected": ("concurrency_policy_v6_sha256", "0" * 64),
        "wrong_feature_count_rejected": ("feature_count", 823),
        "wrong_feature_digest_rejected": ("feature_refs_digest_sha256", "0" * 64),
        "wrong_semantic_cap_rejected": ("semantic_leaf_cap", 32),
        "coverage_credit_rejected": ("coverage_credit_before_postrun", 8),
        "certification_credit_rejected": ("certification_credit_before_postrun", 8),
    }
    for name, (key, value) in mutations.items():
        bad = copy.deepcopy(activation); bad[key] = value
        tests[name] = bool(gate.activation_errors(bad))
    bad = copy.deepcopy(activation); bad["assignment_bindings"] = bad["assignment_bindings"][:-1]
    tests["missing_assignment_binding_rejected"] = bool(gate.activation_errors(bad))
    bad = copy.deepcopy(activation); bad["assignment_bindings"][0]["assignment_id"] = "A005SA-0001"
    tests["cross_cohort_binding_rejected"] = bool(gate.activation_errors(bad))
    bad = copy.deepcopy(activation); bad["assignment_bindings"][1]["agent_path"] = bad["assignment_bindings"][0]["agent_path"]
    tests["duplicate_agent_binding_rejected"] = bool(gate.activation_errors(bad))

    empty = {aid: [] for aid in gate.ASSIGNMENT_IDS}
    tests["zero_inventory_valid"] = gate.zero_state_inventory_errors(empty, [], [], False) == []
    nonempty = copy.deepcopy(empty); nonempty[gate.ASSIGNMENT_IDS[0]] = ["result.json"]
    tests["nonempty_output_rejected"] = bool(gate.zero_state_inventory_errors(nonempty, [], [], False))
    tests["receipt_present_rejected"] = bool(gate.zero_state_inventory_errors(empty, [gate.ASSIGNMENT_IDS[0]], [], False))
    tests["result_present_rejected"] = bool(gate.zero_state_inventory_errors(empty, [], [gate.ASSIGNMENT_IDS[0]], False))
    tests["existing_activation_rejected"] = bool(gate.zero_state_inventory_errors(empty, [], [], True))
    missing = dict(empty); missing.pop(gate.ASSIGNMENT_IDS[-1])
    tests["missing_output_binding_rejected"] = bool(gate.zero_state_inventory_errors(missing, [], [], False))
    leaked = {f"A005SA-{index:04d}": [] for index in range(1, 9)}
    tests["cohort_0001_output_scope_rejected"] = bool(gate.zero_state_inventory_errors(leaked, [], [], False))

    expected_fixed = gate.fixed_hashes()
    drifted = dict(expected_fixed); drifted["packet_root_sha256"] = "0" * 64
    tests["packet_root_drift_rejected"] = drifted != expected_fixed
    drifted = dict(expected_fixed); drifted["intent_root_sha256"] = "0" * 64
    tests["intent_root_drift_rejected"] = drifted != expected_fixed
    drifted = dict(expected_fixed); drifted["cohort_manifest_sha256"] = "0" * 64
    tests["manifest_hash_drift_rejected"] = drifted != expected_fixed
    tests["unique_exact_agent_paths"] = len(set(gate.AGENT_PATHS)) == 8 and all(path.startswith("/root/a005_scenario_adversarial_00") for path in gate.AGENT_PATHS)
    tests["independent_feature_derivation_bound"] = gate.FEATURE_COUNT == 817 and gate.FEATURE_DIGEST == "99163803098a19f4db61c85836f773a0c7a226c313acec0a177a8c1692f93f93"

    failures = sorted(name for name, passed in tests.items() if not passed)
    report = {
        "checker": "scenario_cohort_0002_activation_negative_tests_v1",
        "status": "pass" if not failures and len(tests) >= 24 else "fail",
        "test_count": len(tests),
        "errors": failures,
        "tests": tests,
        "activation_granted": False,
        "receipts": 0,
        "results": 0,
        "coverage_credit": 0,
        "certification_credit": 0,
    }
    print(json.dumps(report, indent=2, sort_keys=True))
    raise SystemExit(0 if report["status"] == "pass" else 1)


if __name__ == "__main__": main()
