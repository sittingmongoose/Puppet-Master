#!/usr/bin/env python3
"""Strict negative tests for the dual V6 cohort-0001+0002 launch gate."""

from __future__ import annotations

import copy
import json

import verify_dual_cohort_0001_0002_launch_v2 as gate


CHECKPOINT_PATH = "/future/research-checkpoint.json"
CHECKPOINT_SHA = "a" * 64
C1_PATH = "/future/cohort-0001-activation.json"
C1_SHA = "b" * 64
C2_PATH = "/future/cohort-0002-activation.json"
C2_SHA = "c" * 64


def research() -> dict:
    return {"audit_id": gate.AUDIT_ID, "status": "pass", "gate_passed": True, "independent": True,
            "eligible_assignment_ids": gate.RESEARCH_IDS, "eligible_assignment_digest": gate.RESEARCH_DIGEST,
            "rejected_assignment_ids": [], "unresolved_research_rejections": [], "cumulative_research_credit": 8,
            "concurrency_policy_v6_sha256": gate.V6_SHA,
            "counts": {"eligible": 8, "rejected": 0, "unresolved_research_rejections": 0}}


def activation(cohort_id: str) -> dict:
    cfg = gate.COHORTS[cohort_id]
    value = {"audit_id": gate.AUDIT_ID, "wave_id": gate.WAVE_ID, "cohort_id": cohort_id,
             "status": "ACTIVE_FOR_EXACTLY_8_FRESH_SOL_XHIGH_LEAVES", "activation_granted": True,
             "assignment_count": 8, "assignment_ids": cfg["ids"], "feature_count": cfg["feature_count"],
             "feature_refs_digest_sha256": cfg["feature_digest"], "model": gate.MODEL, "reasoning_effort": gate.EFFORT,
             "controller_thread_id": gate.CONTROLLER, "agent_paths": cfg["paths"],
             "assignment_bindings": [{"assignment_id": aid, "agent_path": path} for aid, path in zip(cfg["ids"], cfg["paths"])],
             "research_checkpoint_path": CHECKPOINT_PATH, "research_checkpoint_sha256": CHECKPOINT_SHA,
             "research_eligible_assignment_ids": gate.RESEARCH_IDS, "research_eligible_assignment_digest": gate.RESEARCH_DIGEST,
             "semantic_leaf_cap": 8, "coverage_credit_before_postrun": 0, "certification_credit_before_postrun": 0}
    if cohort_id == "cohort-0001":
        value.update({"schema_version": "scenario-adversarial-cohort-activation-v2-v6",
                      "concurrency_policy_v6_semantic_sha256": gate.V6_SHA,
                      "concurrency_policy_v7_scheduling_only_sha256": gate.V7_SHA, "v7_changes_semantics": False,
                      "zero_prevalidation_credit": True, "cohort_authorization_path": "/future/cohort-0001-authorization.json",
                      "cohort_authorization_sha256": "d" * 64})
    else:
        value.update({"schema_version": "scenario-adversarial-cohort-activation-v1", "concurrency_policy_v6_sha256": gate.V6_SHA})
    return value


def verification(cohort_id: str, activation_path: str, activation_sha: str) -> dict:
    cfg = gate.COHORTS[cohort_id]
    value = {"audit_id": gate.AUDIT_ID, "wave_id": gate.WAVE_ID, "cohort_id": cohort_id,
             "status": "pass", "gate_passed": True, "independent": True,
             "activation_path": activation_path, "activation_sha256": activation_sha,
             "research_checkpoint_path": CHECKPOINT_PATH, "research_checkpoint_sha256": CHECKPOINT_SHA,
             "assignment_ids": cfg["ids"], "agent_paths": cfg["paths"], "feature_count": cfg["feature_count"],
             "feature_refs_digest_sha256": cfg["feature_digest"], "model": gate.MODEL, "reasoning_effort": gate.EFFORT,
             "controller_thread_id": gate.CONTROLLER, "concurrency_policy_v6_semantic_sha256": gate.V6_SHA,
             "source_preparation_hashes": cfg["prep_hashes"], "zero_prevalidation_credit_verified": True,
             "errors": [], "coverage_credit": 0, "certification_credit": 0}
    if cohort_id == "cohort-0001": value.update({"concurrency_policy_v7_scheduling_only_sha256": gate.V7_SHA, "v7_changes_semantics": False})
    return value


def valid_gate_errors() -> list[str]:
    return gate.dual_gate_errors(research(), CHECKPOINT_PATH, CHECKPOINT_SHA, CHECKPOINT_SHA,
                                 activation("cohort-0001"), C1_PATH, C1_SHA, C1_SHA, verification("cohort-0001", C1_PATH, C1_SHA),
                                 activation("cohort-0002"), C2_PATH, C2_SHA, C2_SHA, verification("cohort-0002", C2_PATH, C2_SHA))


def main() -> None:
    tests: dict[str, bool] = {}
    snapshot_errors, state = gate.current_snapshot_errors()
    tests["current_snapshot_valid"] = snapshot_errors == []
    tests["current_zero_state_valid"] = state == {"assignments": 16, "features": 1640, "feature_overlap": 0,
                                                               "outputs": 16, "output_files": 0, "receipts": 0,
                                                               "results": 0, "activations": 0}
    tests["prior_dual_v1_hash_set_bound"] = gate.fixed_hashes()["prior_dual_v1_hashes"] == gate.DUAL_V1_HASHES
    tests["cohort_0001_v6_prep_bound"] = gate.fixed_hashes()["cohort_0001_v6_preparation_hashes"] == gate.COHORTS["cohort-0001"]["prep_hashes"]
    tests["cohort_0002_v6_prep_bound"] = gate.fixed_hashes()["cohort_0002_v6_preparation_hashes"] == gate.COHORTS["cohort-0002"]["prep_hashes"]
    tests["valid_research_checkpoint"] = gate.checkpoint_errors(research()) == []
    research_mutations = {
        "research_wrong_audit_rejected": ("audit_id", "wrong"), "research_wrong_status_rejected": ("status", "fail"),
        "research_gate_false_rejected": ("gate_passed", False), "research_nonindependent_rejected": ("independent", False),
        "research_partial_ids_rejected": ("eligible_assignment_ids", gate.RESEARCH_IDS[:-1]),
        "research_reordered_ids_rejected": ("eligible_assignment_ids", list(reversed(gate.RESEARCH_IDS))),
        "research_duplicate_ids_rejected": ("eligible_assignment_ids", gate.RESEARCH_IDS[:-1] + [gate.RESEARCH_IDS[-2]]),
        "research_foreign_id_rejected": ("eligible_assignment_ids", gate.RESEARCH_IDS[:-1] + ["ER-9999"]),
        "research_wrong_digest_rejected": ("eligible_assignment_digest", "0" * 64),
        "research_rejection_rejected": ("rejected_assignment_ids", ["ER-0008"]),
        "research_unresolved_rejected": ("unresolved_research_rejections", ["ER-0008"]),
        "research_wrong_credit_rejected": ("cumulative_research_credit", 7),
        "research_wrong_v6_rejected": ("concurrency_policy_v6_sha256", gate.V7_SHA),
    }
    for name, (key, value) in research_mutations.items():
        bad = research(); bad[key] = value; tests[name] = bool(gate.checkpoint_errors(bad))
    for name, key, value in [("research_wrong_eligible_count_rejected", "eligible", 7),
                             ("research_wrong_rejected_count_rejected", "rejected", 1),
                             ("research_wrong_unresolved_count_rejected", "unresolved_research_rejections", 1)]:
        bad = research(); bad["counts"][key] = value; tests[name] = bool(gate.checkpoint_errors(bad))

    for cohort_id in ("cohort-0001", "cohort-0002"):
        valid = activation(cohort_id); prefix = cohort_id.replace("-", "_")
        tests[f"{prefix}_valid_activation"] = gate.cohort_activation_errors(valid, cohort_id, CHECKPOINT_PATH, CHECKPOINT_SHA) == []
        mutations = {
            "wrong_audit": ("audit_id", "wrong"), "wrong_wave": ("wave_id", "wave-9999"),
            "wrong_cohort": ("cohort_id", "cohort-0003"), "wrong_status": ("status", "blocked"),
            "false_grant": ("activation_granted", False), "wrong_count": ("assignment_count", 7),
            "partial_scope": ("assignment_ids", gate.COHORTS[cohort_id]["ids"][:-1]),
            "duplicate_scope": ("assignment_ids", gate.COHORTS[cohort_id]["ids"][:-1] + [gate.COHORTS[cohort_id]["ids"][-2]]),
            "all_16_scope": ("assignment_ids", gate.ASSIGNMENT_IDS),
            "all_32_scope": ("assignment_ids", [f"A005SA-{i:04d}" for i in range(1, 33)]),
            "wrong_feature_count": ("feature_count", 1), "wrong_feature_digest": ("feature_refs_digest_sha256", "0" * 64),
            "wrong_model": ("model", "gpt-5.6-luna"), "wrong_effort": ("reasoning_effort", "high"),
            "wrong_controller": ("controller_thread_id", "wrong"),
            "wrong_paths": ("agent_paths", gate.COHORTS[cohort_id]["paths"][:-1] + ["/root/wrong"]),
            "wrong_checkpoint_path": ("research_checkpoint_path", "/wrong/checkpoint.json"),
            "wrong_checkpoint_hash": ("research_checkpoint_sha256", "0" * 64),
            "wrong_research_ids": ("research_eligible_assignment_ids", gate.RESEARCH_IDS[:-1]),
            "wrong_research_digest": ("research_eligible_assignment_digest", "0" * 64),
            "wrong_cap": ("semantic_leaf_cap", 16), "nonzero_coverage": ("coverage_credit_before_postrun", 1),
            "nonzero_certification": ("certification_credit_before_postrun", 1),
        }
        for suffix, (key, value) in mutations.items():
            bad = copy.deepcopy(valid); bad[key] = value
            tests[f"{prefix}_{suffix}_rejected"] = bool(gate.cohort_activation_errors(bad, cohort_id, CHECKPOINT_PATH, CHECKPOINT_SHA))
        bad = copy.deepcopy(valid); bad["assignment_bindings"][0]["assignment_id"] = "A005SA-9999"
        tests[f"{prefix}_binding_scope_rejected"] = bool(gate.cohort_activation_errors(bad, cohort_id, CHECKPOINT_PATH, CHECKPOINT_SHA))
        bad = copy.deepcopy(valid); bad["concurrency_policy_v5_sha256"] = "a87927157be59c448801bbd4cec157670609c4502fb18baa0afbe8d516fdb439"
        tests[f"{prefix}_v5_replay_rejected"] = bool(gate.cohort_activation_errors(bad, cohort_id, CHECKPOINT_PATH, CHECKPOINT_SHA))
    bad = activation("cohort-0001"); bad["concurrency_policy_v6_semantic_sha256"] = gate.V7_SHA
    tests["cohort_0001_v6_substitution_rejected"] = bool(gate.cohort_activation_errors(bad, "cohort-0001", CHECKPOINT_PATH, CHECKPOINT_SHA))
    bad = activation("cohort-0001"); bad["concurrency_policy_v7_scheduling_only_sha256"] = "0" * 64
    tests["cohort_0001_wrong_v7_rejected"] = bool(gate.cohort_activation_errors(bad, "cohort-0001", CHECKPOINT_PATH, CHECKPOINT_SHA))
    bad = activation("cohort-0001"); bad["v7_changes_semantics"] = True
    tests["cohort_0001_v7_semantics_rejected"] = bool(gate.cohort_activation_errors(bad, "cohort-0001", CHECKPOINT_PATH, CHECKPOINT_SHA))
    bad = activation("cohort-0001"); bad["cohort_authorization_sha256"] = ""
    tests["cohort_0001_missing_authorization_binding_rejected"] = bool(gate.cohort_activation_errors(bad, "cohort-0001", CHECKPOINT_PATH, CHECKPOINT_SHA))
    bad = activation("cohort-0002"); bad["concurrency_policy_v6_sha256"] = gate.V7_SHA
    tests["cohort_0002_v6_substitution_rejected"] = bool(gate.cohort_activation_errors(bad, "cohort-0002", CHECKPOINT_PATH, CHECKPOINT_SHA))

    for cohort_id, path, digest in (("cohort-0001", C1_PATH, C1_SHA), ("cohort-0002", C2_PATH, C2_SHA)):
        valid = verification(cohort_id, path, digest); prefix = cohort_id.replace("-", "_")
        tests[f"{prefix}_valid_verification"] = gate.verification_errors(valid, cohort_id, path, digest, CHECKPOINT_PATH, CHECKPOINT_SHA) == []
        mutations = {"wrong_status": ("status", "fail"), "gate_false": ("gate_passed", False),
                     "nonindependent": ("independent", False), "wrong_activation_path": ("activation_path", "/wrong"),
                     "wrong_activation_hash": ("activation_sha256", "0" * 64),
                     "wrong_checkpoint_path": ("research_checkpoint_path", "/wrong"),
                     "wrong_checkpoint_hash": ("research_checkpoint_sha256", "0" * 64),
                     "partial_scope": ("assignment_ids", gate.COHORTS[cohort_id]["ids"][:-1]),
                     "wrong_paths": ("agent_paths", gate.COHORTS[cohort_id]["paths"][:-1]),
                     "wrong_feature_count": ("feature_count", 1), "wrong_feature_digest": ("feature_refs_digest_sha256", "0" * 64),
                     "wrong_model": ("model", "gpt-5.6-luna"), "wrong_effort": ("reasoning_effort", "high"),
                     "wrong_controller": ("controller_thread_id", "wrong"),
                     "wrong_v6": ("concurrency_policy_v6_semantic_sha256", gate.V7_SHA),
                     "zero_credit_false": ("zero_prevalidation_credit_verified", False),
                     "errors_present": ("errors", ["x"]), "nonzero_coverage": ("coverage_credit", 1)}
        for suffix, (key, value) in mutations.items():
            bad = copy.deepcopy(valid); bad[key] = value
            tests[f"{prefix}_verification_{suffix}_rejected"] = bool(gate.verification_errors(bad, cohort_id, path, digest, CHECKPOINT_PATH, CHECKPOINT_SHA))
        bad = copy.deepcopy(valid); bad["source_preparation_hashes"]["authority"] = "0" * 64
        tests[f"{prefix}_verification_prep_hash_drift_rejected"] = bool(gate.verification_errors(bad, cohort_id, path, digest, CHECKPOINT_PATH, CHECKPOINT_SHA))
    bad = verification("cohort-0001", C1_PATH, C1_SHA); bad["concurrency_policy_v7_scheduling_only_sha256"] = "0" * 64
    tests["cohort_0001_verification_wrong_v7_rejected"] = bool(gate.verification_errors(bad, "cohort-0001", C1_PATH, C1_SHA, CHECKPOINT_PATH, CHECKPOINT_SHA))
    bad = verification("cohort-0001", C1_PATH, C1_SHA); bad["v7_changes_semantics"] = True
    tests["cohort_0001_verification_v7_semantics_rejected"] = bool(gate.verification_errors(bad, "cohort-0001", C1_PATH, C1_SHA, CHECKPOINT_PATH, CHECKPOINT_SHA))

    tests["valid_synthetic_dual_gate"] = valid_gate_errors() == []
    args = [research(), CHECKPOINT_PATH, CHECKPOINT_SHA, CHECKPOINT_SHA, activation("cohort-0001"), C1_PATH, C1_SHA, C1_SHA,
            verification("cohort-0001", C1_PATH, C1_SHA), activation("cohort-0002"), C2_PATH, C2_SHA, C2_SHA,
            verification("cohort-0002", C2_PATH, C2_SHA)]
    for name, index, value in [("wrong_checkpoint_actual_sha_rejected", 3, "0" * 64),
                               ("wrong_c1_actual_sha_rejected", 7, "0" * 64),
                               ("wrong_c2_actual_sha_rejected", 12, "0" * 64),
                               ("missing_c1_activation_rejected", 4, None),
                               ("missing_c1_verification_rejected", 8, None),
                               ("missing_c2_activation_rejected", 9, None),
                               ("missing_c2_verification_rejected", 13, None),
                               ("duplicate_activation_path_rejected", 10, C1_PATH),
                               ("duplicate_activation_hash_rejected", 11, C1_SHA)]:
        bad = copy.deepcopy(args); bad[index] = value; tests[name] = bool(gate.dual_gate_errors(*bad))
    bad = copy.deepcopy(args); bad[9]["assignment_ids"] = gate.COHORTS["cohort-0001"]["ids"]
    tests["cross_cohort_overlap_rejected"] = bool(gate.dual_gate_errors(*bad))
    bad = copy.deepcopy(args); bad[9]["assignment_ids"] = gate.ASSIGNMENT_IDS
    tests["all_16_single_activation_rejected"] = bool(gate.dual_gate_errors(*bad))
    bad = copy.deepcopy(args); bad[4]["cohort_id"] = "cohort-0003"
    tests["cohort_0003_scope_rejected"] = bool(gate.dual_gate_errors(*bad))
    bad = copy.deepcopy(args); bad[9]["cohort_id"] = "cohort-0004"
    tests["cohort_0004_scope_rejected"] = bool(gate.dual_gate_errors(*bad))
    empty = {aid: [] for aid in gate.ASSIGNMENT_IDS}
    tests["zero_inventory_valid"] = gate.zero_inventory_errors(empty, [], [], []) == []
    tests["zero_inventory_nonempty_rejected"] = bool(gate.zero_inventory_errors({**empty, gate.ASSIGNMENT_IDS[0]: ["result.json"]}, [], [], []))
    tests["zero_inventory_missing_output_rejected"] = bool(gate.zero_inventory_errors({aid: [] for aid in gate.ASSIGNMENT_IDS[:-1]}, [], [], []))
    tests["zero_inventory_receipt_rejected"] = bool(gate.zero_inventory_errors(empty, [gate.ASSIGNMENT_IDS[0]], [], []))
    tests["zero_inventory_result_rejected"] = bool(gate.zero_inventory_errors(empty, [], [gate.ASSIGNMENT_IDS[0]], []))
    tests["zero_inventory_activation_rejected"] = bool(gate.zero_inventory_errors(empty, [], [], ["cohort-0001/activation.json"]))

    failures = sorted(name for name, passed in tests.items() if passed is not True)
    report = {"checker": "scenario_dual_cohort_0001_0002_launch_v2_negative_tests",
              "status": "pass" if not failures and len(tests) >= 60 else "fail", "test_count": len(tests),
              "errors": failures, "tests": tests, "activation_created": False, "launch_authorized": False,
              "coverage_credit": 0, "certification_credit": 0}
    print(json.dumps(report, indent=2, sort_keys=True)); raise SystemExit(0 if report["status"] == "pass" else 1)


if __name__ == "__main__":
    main()
