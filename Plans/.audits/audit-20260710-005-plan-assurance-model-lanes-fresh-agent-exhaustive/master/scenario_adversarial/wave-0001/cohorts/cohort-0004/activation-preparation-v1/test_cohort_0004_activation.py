#!/usr/bin/env python3
"""Strict fail-closed tests for one late-cohort V6 activation preparation."""

from __future__ import annotations

import copy
import json
from pathlib import Path

import generate_cohort_0004_activation as gate


def research_checkpoint() -> dict:
    return {"audit_id": gate.AUDIT_ID, "status": "pass", "gate_passed": True, "independent": True,
        "eligible_assignment_ids": gate.RESEARCH_IDS, "eligible_assignment_digest": gate.RESEARCH_ELIGIBLE_DIGEST,
        "rejected_assignment_ids": [], "unresolved_research_rejections": [], "cumulative_research_credit": 8,
        "concurrency_policy_v6_sha256": gate.V6_SHA,
        "counts": {"eligible": 8, "rejected": 0, "unresolved_research_rejections": 0}}


def terminal_checkpoint() -> dict:
    return {"audit_id": gate.AUDIT_ID, "status": "pass", "gate_passed": True, "independent": True,
        "completed_cohort_ids": gate.PRIOR_COHORT_IDS, "terminal_assignment_ids": gate.PRIOR_ASSIGNMENT_IDS,
        "terminal_assignment_digest": gate.PRIOR_ASSIGNMENT_DIGEST, "unresolved_terminal_failures": [],
        "concurrency_policy_v6_sha256": gate.V6_SHA,
        "counts": {"cohorts": 2, "assignments": 16, "completed": 16, "receipts": 16, "results": 16, "unresolved": 0}}


def authorization(research_sha: str, terminal_sha: str) -> dict:
    return {"audit_id": gate.AUDIT_ID, "status": "authorized", "authorization_granted": True, "independent": True,
        "wave_id": gate.WAVE_ID, "cohort_id": gate.COHORT_ID, "assignment_ids": gate.ASSIGNMENT_IDS,
        "feature_count": gate.FEATURE_COUNT, "feature_refs_digest_sha256": gate.FEATURE_DIGEST,
        "agent_paths": gate.AGENT_PATHS, "model": gate.MODEL, "reasoning_effort": gate.EFFORT,
        "concurrency_policy_v6_sha256": gate.V6_SHA, "semantic_leaf_cap": 8, "maximum_active_semantic_cap": 16,
        "authorized_overlap_cohort_ids": gate.OVERLAP_COHORT_IDS, "prior_terminal_cohort_ids": gate.PRIOR_COHORT_IDS,
        "global_research_checkpoint_sha256": research_sha, "prior_cohorts_terminal_checkpoint_sha256": terminal_sha,
        "fixed_hashes": gate.fixed_hashes()}


def main() -> None:
    snapshot, bindings = gate.snapshot_errors()
    research = research_checkpoint(); terminal = terminal_checkpoint(); auth = authorization("a" * 64, "b" * 64)
    activation, errors = gate.build_activation(research, terminal, auth,
        Path("/tmp/research.json"), "a" * 64, "a" * 64,
        Path("/tmp/terminal.json"), "b" * 64, "b" * 64,
        Path("/tmp/authorization.json"), "c" * 64, "c" * 64, [])
    activation["assignment_bindings"] = bindings
    tests: dict[str, bool] = {
        "fixed_snapshot_valid": snapshot == [] and len(bindings) == 8,
        "valid_three_gate_activation": not errors and gate.activation_errors(activation) == [],
    }
    research_mutations = {
        "research_status_rejected": ("status", "fail"), "research_gate_rejected": ("gate_passed", False),
        "research_independence_rejected": ("independent", False), "research_partial_eligibility_rejected": ("eligible_assignment_ids", gate.RESEARCH_IDS[:-1]),
        "research_digest_rejected": ("eligible_assignment_digest", "0" * 64), "research_rejection_rejected": ("rejected_assignment_ids", ["ER-0008"]),
        "research_unresolved_rejected": ("unresolved_research_rejections", ["ER-0008"]), "research_credit_rejected": ("cumulative_research_credit", 0),
        "research_v6_rejected": ("concurrency_policy_v6_sha256", "0" * 64), "research_audit_rejected": ("audit_id", "wrong")}
    for name, (key, value) in research_mutations.items():
        bad = copy.deepcopy(research); bad[key] = value; tests[name] = bool(gate.research_checkpoint_errors(bad))
    bad = copy.deepcopy(research); bad["counts"]["eligible"] = 7; tests["research_counts_rejected"] = bool(gate.research_checkpoint_errors(bad))
    _, errs = gate.build_activation(research, terminal, auth, Path("/tmp/r"), "a"*64, "0"*64, Path("/tmp/t"), "b"*64, "b"*64, Path("/tmp/a"), "c"*64, "c"*64, [])
    tests["research_sha_rejected"] = "research:sha256" in errs

    terminal_mutations = {
        "terminal_status_rejected": ("status", "fail"), "terminal_gate_rejected": ("gate_passed", False),
        "terminal_independence_rejected": ("independent", False), "terminal_cohort_set_rejected": ("completed_cohort_ids", ["cohort-0001"]),
        "terminal_assignment_set_rejected": ("terminal_assignment_ids", gate.PRIOR_ASSIGNMENT_IDS[:-1]),
        "terminal_assignment_order_rejected": ("terminal_assignment_ids", list(reversed(gate.PRIOR_ASSIGNMENT_IDS))),
        "terminal_digest_rejected": ("terminal_assignment_digest", "0"*64), "terminal_unresolved_rejected": ("unresolved_terminal_failures", ["failure"]),
        "terminal_v6_rejected": ("concurrency_policy_v6_sha256", "0"*64), "terminal_audit_rejected": ("audit_id", "wrong")}
    for name, (key, value) in terminal_mutations.items():
        bad = copy.deepcopy(terminal); bad[key] = value; tests[name] = bool(gate.prior_terminal_checkpoint_errors(bad))
    bad = copy.deepcopy(terminal); bad["counts"]["completed"] = 15; tests["terminal_counts_rejected"] = bool(gate.prior_terminal_checkpoint_errors(bad))
    _, errs = gate.build_activation(research, terminal, auth, Path("/tmp/r"), "a"*64, "a"*64, Path("/tmp/t"), "b"*64, "0"*64, Path("/tmp/a"), "c"*64, "c"*64, [])
    tests["terminal_sha_rejected"] = "terminal:sha256" in errs

    authorization_mutations = {
        "authorization_status_rejected": ("status", "blocked"), "authorization_grant_rejected": ("authorization_granted", False),
        "authorization_independence_rejected": ("independent", False), "authorization_wave_rejected": ("wave_id", "wrong"),
        "authorization_assignments_rejected": ("assignment_ids", gate.ASSIGNMENT_IDS[:-1]),
        "authorization_all_32_rejected": ("assignment_ids", [f"A005SA-{index:04d}" for index in range(1,33)]),
        "authorization_feature_count_rejected": ("feature_count", gate.FEATURE_COUNT + 1),
        "authorization_feature_digest_rejected": ("feature_refs_digest_sha256", "0"*64),
        "authorization_paths_rejected": ("agent_paths", gate.AGENT_PATHS[:-1] + ["/root/leak"]),
        "authorization_model_rejected": ("model", "gpt-5.6-luna"), "authorization_effort_rejected": ("reasoning_effort", "max"),
        "authorization_v6_rejected": ("concurrency_policy_v6_sha256", "0"*64), "authorization_leaf_cap_rejected": ("semantic_leaf_cap", 16),
        "authorization_max_cap_rejected": ("maximum_active_semantic_cap", 32),
        "authorization_overlap_rejected": ("authorized_overlap_cohort_ids", [gate.COHORT_ID]),
        "authorization_prior_cohorts_rejected": ("prior_terminal_cohort_ids", ["cohort-0001"]),
        "authorization_research_binding_rejected": ("global_research_checkpoint_sha256", "0"*64),
        "authorization_terminal_binding_rejected": ("prior_cohorts_terminal_checkpoint_sha256", "0"*64),
        "authorization_fixed_hash_rejected": ("fixed_hashes", {**gate.fixed_hashes(), "packet_root_sha256": "0"*64})}
    for name, (key, value) in authorization_mutations.items():
        bad = copy.deepcopy(auth); bad[key] = value; tests[name] = bool(gate.cohort_authorization_errors(bad, "a"*64, "b"*64))
    for other in ("cohort-0001", "cohort-0002", "cohort-0003", "cohort-0004"):
        if other == gate.COHORT_ID: continue
        bad = copy.deepcopy(auth); bad["cohort_id"] = other
        tests[f"authorization_replay_{other.replace('-', '_')}_rejected"] = bool(gate.cohort_authorization_errors(bad, "a"*64, "b"*64))
    _, errs = gate.build_activation(research, terminal, auth, Path("/tmp/r"), "a"*64, "a"*64, Path("/tmp/t"), "b"*64, "b"*64, Path("/tmp/a"), "c"*64, "0"*64, [])
    tests["authorization_sha_rejected"] = "authorization:sha256" in errs

    activation_mutations = {
        "activation_cohort_replay_rejected": ("cohort_id", "cohort-0003" if gate.COHORT_ID == "cohort-0004" else "cohort-0004"),
        "activation_all_32_rejected": ("assignment_ids", [f"A005SA-{index:04d}" for index in range(1,33)]),
        "activation_count_rejected": ("assignment_count", 32), "activation_model_rejected": ("model", "gpt-5.6-luna"),
        "activation_effort_rejected": ("reasoning_effort", "max"), "activation_paths_rejected": ("agent_paths", gate.AGENT_PATHS[:-1]),
        "activation_v6_rejected": ("concurrency_policy_v6_sha256", "0"*64), "activation_leaf_cap_rejected": ("semantic_leaf_cap", 16),
        "activation_max_cap_rejected": ("maximum_active_semantic_cap", 32),
        "activation_overlap_rejected": ("authorized_overlap_cohort_ids", [gate.COHORT_ID]),
        "activation_feature_count_rejected": ("feature_count", gate.FEATURE_COUNT + 1),
        "activation_feature_digest_rejected": ("feature_refs_digest_sha256", "0"*64),
        "activation_launch_credit_rejected": ("launch_credit", 8)}
    for name, (key, value) in activation_mutations.items():
        bad = copy.deepcopy(activation); bad[key] = value; tests[name] = bool(gate.activation_errors(bad))
    bad = copy.deepcopy(activation); bad["assignment_bindings"] = bad["assignment_bindings"][:-1]
    tests["activation_missing_binding_rejected"] = bool(gate.activation_errors(bad))
    bad = copy.deepcopy(activation); bad["assignment_bindings"][0]["assignment_id"] = "A005SA-0001"
    tests["activation_cross_cohort_binding_rejected"] = bool(gate.activation_errors(bad))

    empty = {aid: [] for aid in gate.ASSIGNMENT_IDS}
    tests["zero_state_valid"] = gate.zero_state_inventory_errors(empty, [], [], False) == []
    nonempty = copy.deepcopy(empty); nonempty[gate.ASSIGNMENT_IDS[0]] = ["result.json"]
    tests["nonempty_output_rejected"] = bool(gate.zero_state_inventory_errors(nonempty, [], [], False))
    tests["receipt_present_rejected"] = bool(gate.zero_state_inventory_errors(empty, [gate.ASSIGNMENT_IDS[0]], [], False))
    tests["result_present_rejected"] = bool(gate.zero_state_inventory_errors(empty, [], [gate.ASSIGNMENT_IDS[0]], False))
    tests["existing_activation_rejected"] = bool(gate.zero_state_inventory_errors(empty, [], [], True))
    missing = dict(empty); missing.pop(gate.ASSIGNMENT_IDS[-1])
    tests["missing_output_binding_rejected"] = bool(gate.zero_state_inventory_errors(missing, [], [], False))
    tests["exact_cap_16_preserved"] = gate.PER_COHORT_CAP * 2 == gate.MAX_ACTIVE_SEMANTIC_CAP == 16
    tests["exact_overlap_pair_preserved"] = gate.OVERLAP_COHORT_IDS == ["cohort-0003", "cohort-0004"]

    failures = sorted(name for name, passed in tests.items() if not passed)
    report = {"checker": f"scenario_{gate.COHORT_ID}_activation_negative_tests_v1",
        "status": "pass" if not failures and len(tests) >= 40 else "fail", "test_count": len(tests),
        "errors": failures, "tests": tests, "activation_granted": False, "launch_credit": 0,
        "coverage_credit": 0, "certification_credit": 0, "receipts": 0, "results": 0}
    print(json.dumps(report, indent=2, sort_keys=True)); raise SystemExit(0 if report["status"] == "pass" else 1)


if __name__ == "__main__": main()
