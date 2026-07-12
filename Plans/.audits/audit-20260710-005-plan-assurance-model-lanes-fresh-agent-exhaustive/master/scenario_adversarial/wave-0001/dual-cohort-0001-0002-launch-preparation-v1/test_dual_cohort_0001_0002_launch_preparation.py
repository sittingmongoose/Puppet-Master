#!/usr/bin/env python3
"""Strict negative tests for the blocked cohort-0001+0002 dual launch gate."""

from __future__ import annotations

import copy
import json

import verify_dual_cohort_0001_0002_launch_preparation as gate


def research() -> dict:
    return {"audit_id": gate.AUDIT_ID, "status": "pass", "gate_passed": True, "independent": True,
        "eligible_assignment_ids": gate.RESEARCH_IDS, "eligible_assignment_digest": gate.RESEARCH_DIGEST,
        "rejected_assignment_ids": [], "unresolved_research_rejections": [], "cumulative_research_credit": 8,
        "concurrency_policy_v6_sha256": gate.V6_SHA,
        "counts": {"eligible": 8, "rejected": 0, "unresolved_research_rejections": 0}}


def activation(cohort_id: str, checkpoint_sha: str) -> dict:
    cfg = gate.COHORTS[cohort_id]
    return {"audit_id": gate.AUDIT_ID, "wave_id": gate.WAVE_ID, "cohort_id": cohort_id,
        "status": "ACTIVE_FOR_EXACTLY_8_FRESH_SOL_XHIGH_LEAVES", "activation_granted": True,
        "assignment_count": 8, "assignment_ids": cfg["assignment_ids"], "feature_count": cfg["feature_count"],
        "feature_refs_digest_sha256": cfg["feature_digest"], "model": gate.MODEL, "reasoning_effort": gate.EFFORT,
        "controller_thread_id": gate.CONTROLLER, "agent_paths": cfg["agent_paths"],
        "assignment_bindings": [{"assignment_id": aid, "agent_path": path} for aid, path in zip(cfg["assignment_ids"], cfg["agent_paths"])],
        "research_checkpoint_sha256": checkpoint_sha, "research_eligible_assignment_ids": gate.RESEARCH_IDS,
        "research_eligible_assignment_digest": gate.RESEARCH_DIGEST, "concurrency_policy_v6_sha256": gate.V6_SHA,
        "semantic_leaf_cap": 8, "coverage_credit_before_postrun": 0, "certification_credit_before_postrun": 0}


def verification(cohort_id: str, activation_path: str, activation_sha: str) -> dict:
    cfg = gate.COHORTS[cohort_id]
    return {"audit_id": gate.AUDIT_ID, "status": "pass", "gate_passed": True, "independently_verified": True,
        "cohort_id": cohort_id, "activation_path": activation_path, "activation_sha256": activation_sha,
        "assignment_ids": cfg["assignment_ids"], "agent_paths": cfg["agent_paths"], "model": gate.MODEL,
        "reasoning_effort": gate.EFFORT, "controller_thread_id": gate.CONTROLLER,
        "concurrency_policy_v6_sha256": gate.V6_SHA,
        "source_activation_preparation_authority_sha256": cfg["prep_authority_sha"],
        "source_activation_preparation_readiness_sha256": cfg["prep_readiness_sha"],
        "source_activation_generator_sha256": cfg["prep_generator_sha"],
        "generator_v6_compatibility_verified": True, "zero_prevalidation_credit_verified": True, "errors": []}


def main() -> None:
    r = research(); rsha = "a" * 64
    p1 = str(gate.WAVE / "cohorts/cohort-0001/activation.json"); p2 = str(gate.WAVE / "cohorts/cohort-0002/activation.json")
    s1, s2 = "b" * 64, "c" * 64
    a1, a2 = activation("cohort-0001", rsha), activation("cohort-0002", rsha)
    v1, v2 = verification("cohort-0001", p1, s1), verification("cohort-0002", p2, s2)
    valid = lambda rr=r, aa1=a1, vv1=v1, aa2=a2, vv2=v2, rs=rsha, rs_actual=rsha, as1=s1, as1_actual=s1, as2=s2, as2_actual=s2: gate.dual_gate_errors(rr, rs, rs_actual, aa1, p1, as1, as1_actual, vv1, aa2, p2, as2, as2_actual, vv2)
    snapshot_errors, snapshot = gate.current_snapshot_errors()
    tests: dict[str, bool] = {
        "current_snapshot_valid": snapshot_errors == [],
        "current_16_zero_state": snapshot["output_files"] == snapshot["receipts"] == snapshot["results"] == snapshot["activations"] == 0,
        "combined_1640_feature_union": snapshot["feature_count"] == 1640 and snapshot["feature_overlap_count"] == 0,
        "cohort_0001_v5_incompatibility_detected": snapshot["cohort_0001_generator_v6_compatible_now"] is False,
        "cohort_0002_v6_compatibility_detected": snapshot["cohort_0002_generator_v6_compatible_now"] is True,
        "valid_synthetic_dual_pass": valid() == [],
    }

    research_mutations = {
        "wrong_checkpoint_status_rejected": ("status", "fail"), "wrong_checkpoint_gate_rejected": ("gate_passed", False),
        "nonindependent_checkpoint_rejected": ("independent", False), "partial_research_eligibility_rejected": ("eligible_assignment_ids", gate.RESEARCH_IDS[:-1]),
        "wrong_research_digest_rejected": ("eligible_assignment_digest", "0"*64), "research_rejection_rejected": ("rejected_assignment_ids", ["ER-0008"]),
        "unresolved_research_rejected": ("unresolved_research_rejections", ["ER-0008"]), "wrong_research_credit_rejected": ("cumulative_research_credit", 0),
        "wrong_checkpoint_v6_rejected": ("concurrency_policy_v6_sha256", "0"*64), "wrong_checkpoint_audit_rejected": ("audit_id", "wrong")}
    for name, (key, value) in research_mutations.items():
        bad = copy.deepcopy(r); bad[key] = value; tests[name] = bool(valid(rr=bad))
    bad = copy.deepcopy(r); bad["counts"]["eligible"] = 7; tests["wrong_checkpoint_counts_rejected"] = bool(valid(rr=bad))
    tests["wrong_checkpoint_sha_rejected"] = bool(valid(rs_actual="0"*64))

    for cohort_id, base, other, path, sha_value in (("cohort-0001", a1, a2, p1, s1), ("cohort-0002", a2, a1, p2, s2)):
        prefix = cohort_id.replace("-", "_")
        cfg = gate.COHORTS[cohort_id]
        mutations = {
            "wrong_cohort": ("cohort_id", "cohort-0002" if cohort_id == "cohort-0001" else "cohort-0001"),
            "partial_cohort": ("assignment_ids", cfg["assignment_ids"][:-1]),
            "all_32_scope": ("assignment_ids", [f"A005SA-{i:04d}" for i in range(1,33)]),
            "wrong_count": ("assignment_count", 32), "wrong_model": ("model", "gpt-5.6-luna"),
            "wrong_effort": ("reasoning_effort", "max"), "wrong_controller": ("controller_thread_id", "wrong"),
            "wrong_paths": ("agent_paths", cfg["agent_paths"][:-1]), "wrong_v6": ("concurrency_policy_v6_sha256", "0"*64),
            "wrong_checkpoint_binding": ("research_checkpoint_sha256", "0"*64), "wrong_feature_count": ("feature_count", cfg["feature_count"]+1),
            "wrong_feature_digest": ("feature_refs_digest_sha256", "0"*64), "wrong_leaf_cap": ("semantic_leaf_cap", 16),
            "coverage_credit": ("coverage_credit_before_postrun", 8), "certification_credit": ("certification_credit_before_postrun", 8)}
        for suffix, (key, value) in mutations.items():
            bad = copy.deepcopy(base); bad[key] = value
            tests[f"{prefix}_{suffix}_rejected"] = bool(valid(aa1=bad) if cohort_id == "cohort-0001" else valid(aa2=bad))
        bad = copy.deepcopy(base); bad["assignment_bindings"] = bad["assignment_bindings"][:-1]
        tests[f"{prefix}_missing_binding_rejected"] = bool(valid(aa1=bad) if cohort_id == "cohort-0001" else valid(aa2=bad))
        bad = copy.deepcopy(base); bad["concurrency_policy_v5_sha256"] = "legacy"
        tests[f"{prefix}_legacy_v5_activation_rejected"] = bool(valid(aa1=bad) if cohort_id == "cohort-0001" else valid(aa2=bad))

    tests["missing_cohort_0001_activation_rejected"] = bool(valid(aa1=None))
    tests["missing_cohort_0002_activation_rejected"] = bool(valid(aa2=None))
    tests["duplicate_activation_hash_rejected"] = bool(valid(as2=s1, as2_actual=s1))
    duplicate_v2 = verification("cohort-0002", p2, s1)
    tests["duplicate_activation_path_rejected"] = bool(gate.dual_gate_errors(r, rsha, rsha, a1, p1, s1, s1, v1, a2, p1, s1, s1, duplicate_v2))
    overlap = copy.deepcopy(a2); overlap["assignment_ids"] = a1["assignment_ids"]; overlap["agent_paths"] = a1["agent_paths"]
    tests["cross_cohort_overlap_rejected"] = bool(valid(aa2=overlap))
    eight_only = copy.deepcopy(a2); eight_only["assignment_ids"] = [] ; eight_only["agent_paths"] = []
    tests["eight_only_scope_rejected"] = bool(valid(aa2=eight_only))
    twenty_four = copy.deepcopy(a2); twenty_four["assignment_ids"] = [f"A005SA-{i:04d}" for i in range(9,25)]
    tests["twenty_four_scope_rejected"] = bool(valid(aa2=twenty_four))
    late = copy.deepcopy(a2); late["cohort_id"] = "cohort-0003"
    tests["cohort_0003_scope_rejected"] = bool(valid(aa2=late))
    late = copy.deepcopy(a2); late["cohort_id"] = "cohort-0004"
    tests["cohort_0004_scope_rejected"] = bool(valid(aa2=late))

    for cohort_id, base, path, sha_value in (("cohort-0001", v1, p1, s1), ("cohort-0002", v2, p2, s2)):
        prefix = cohort_id.replace("-", "_")
        mutations = {
            "verification_status": ("status", "fail"), "verification_independence": ("independently_verified", False),
            "verification_activation_hash": ("activation_sha256", "0"*64), "verification_assignment_set": ("assignment_ids", []),
            "verification_paths": ("agent_paths", []), "verification_model": ("model", "gpt-5.6-luna"),
            "verification_effort": ("reasoning_effort", "max"), "verification_v6": ("concurrency_policy_v6_sha256", "0"*64),
            "verification_authority_binding": ("source_activation_preparation_authority_sha256", "0"*64),
            "verification_readiness_binding": ("source_activation_preparation_readiness_sha256", "0"*64),
            "verification_generator_binding": ("source_activation_generator_sha256", "0"*64),
            "verification_generator_compatibility": ("generator_v6_compatibility_verified", False),
            "verification_credit": ("zero_prevalidation_credit_verified", False)}
        for suffix, (key, value) in mutations.items():
            bad = copy.deepcopy(base); bad[key] = value
            tests[f"{prefix}_{suffix}_rejected"] = bool(valid(vv1=bad) if cohort_id == "cohort-0001" else valid(vv2=bad))
    tests["missing_cohort_0001_verification_rejected"] = bool(valid(vv1=None))
    tests["missing_cohort_0002_verification_rejected"] = bool(valid(vv2=None))

    empty = {aid: [] for aid in gate.COMBINED_ASSIGNMENT_IDS}
    tests["zero_inventory_valid"] = gate.zero_state_errors(empty, [], [], []) == []
    nonempty = copy.deepcopy(empty); nonempty[gate.COMBINED_ASSIGNMENT_IDS[0]] = ["result.json"]
    tests["nonempty_output_rejected"] = bool(gate.zero_state_errors(nonempty, [], [], []))
    tests["receipt_present_rejected"] = bool(gate.zero_state_errors(empty, [gate.COMBINED_ASSIGNMENT_IDS[0]], [], []))
    tests["result_present_rejected"] = bool(gate.zero_state_errors(empty, [], [gate.COMBINED_ASSIGNMENT_IDS[0]], []))
    tests["activation_present_rejected"] = bool(gate.zero_state_errors(empty, [], [], ["cohort-0001"]))
    missing = dict(empty); missing.pop(gate.COMBINED_ASSIGNMENT_IDS[-1])
    tests["missing_output_binding_rejected"] = bool(gate.zero_state_errors(missing, [], [], []))

    failures = sorted(name for name, passed in tests.items() if not passed)
    report = {"checker": "scenario_dual_cohort_0001_0002_launch_negative_tests_v1",
        "status": "pass" if not failures and len(tests) >= 40 else "fail", "test_count": len(tests),
        "errors": failures, "tests": tests, "launch_authorized": False,
        "launch_credit": 0, "coverage_credit": 0, "certification_credit": 0}
    print(json.dumps(report, indent=2, sort_keys=True)); raise SystemExit(0 if report["status"] == "pass" else 1)


if __name__ == "__main__": main()

