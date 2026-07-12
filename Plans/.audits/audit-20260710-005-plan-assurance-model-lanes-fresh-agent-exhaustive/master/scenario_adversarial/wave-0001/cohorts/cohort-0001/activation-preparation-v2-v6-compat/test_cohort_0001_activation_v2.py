#!/usr/bin/env python3
"""Strict negative tests for cohort-0001 V6 compatibility activation preparation."""

from __future__ import annotations

import copy
import json
import tempfile
from pathlib import Path

import generate_cohort_0001_activation_v2 as gate


def checkpoint() -> dict:
    return {"audit_id": gate.AUDIT_ID, "status": "pass", "gate_passed": True, "independent": True,
            "eligible_assignment_ids": gate.RESEARCH_IDS, "eligible_assignment_digest": gate.RESEARCH_DIGEST,
            "rejected_assignment_ids": [], "unresolved_research_rejections": [], "cumulative_research_credit": 8,
            "concurrency_policy_v6_sha256": gate.V6_SHA,
            "counts": {"eligible": 8, "rejected": 0, "unresolved_research_rejections": 0}}


def main() -> None:
    tests: dict[str, bool] = {}
    snapshot_errors, bindings, state = gate.snapshot_errors()
    tests["current_snapshot_valid"] = snapshot_errors == []
    tests["current_zero_state_valid"] = state == {"outputs": 8, "output_files": 0, "receipts": 0, "results": 0, "activations": 0,
                                                               "packet_binding_digest_sha256": gate.PACKET_BINDING_DIGEST,
                                                               "intent_binding_digest_sha256": gate.INTENT_BINDING_DIGEST}
    tests["exact_eight_assignment_bindings"] = len(bindings) == 8 and [row["assignment_id"] for row in bindings] == gate.ASSIGNMENT_IDS
    tests["v6_semantic_pin_present"] = gate.fixed_hashes()["concurrency_policy_v6_semantic_sha256"] == gate.V6_SHA
    tests["v7_scheduling_only_pin_present"] = gate.fixed_hashes()["concurrency_policy_v7_scheduling_only_sha256"] == gate.V7_SHA
    tests["v1_lineage_fully_bound"] = all(value in gate.fixed_hashes().values() for value in gate.V1_HASHES.values())

    cp = checkpoint()
    tests["valid_checkpoint_passes"] = gate.checkpoint_errors(cp) == []
    checkpoint_mutations = {
        "checkpoint_wrong_audit_rejected": ("audit_id", "wrong"),
        "checkpoint_wrong_status_rejected": ("status", "fail"),
        "checkpoint_gate_false_rejected": ("gate_passed", False),
        "checkpoint_nonindependent_rejected": ("independent", False),
        "checkpoint_partial_ids_rejected": ("eligible_assignment_ids", gate.RESEARCH_IDS[:-1]),
        "checkpoint_reordered_ids_rejected": ("eligible_assignment_ids", list(reversed(gate.RESEARCH_IDS))),
        "checkpoint_duplicate_ids_rejected": ("eligible_assignment_ids", gate.RESEARCH_IDS[:-1] + [gate.RESEARCH_IDS[-2]]),
        "checkpoint_foreign_id_rejected": ("eligible_assignment_ids", gate.RESEARCH_IDS[:-1] + ["ER-9999"]),
        "checkpoint_wrong_digest_rejected": ("eligible_assignment_digest", "0" * 64),
        "checkpoint_rejected_id_rejected": ("rejected_assignment_ids", ["ER-0008"]),
        "checkpoint_unresolved_rejected": ("unresolved_research_rejections", ["ER-0008"]),
        "checkpoint_wrong_credit_rejected": ("cumulative_research_credit", 7),
        "checkpoint_wrong_v6_rejected": ("concurrency_policy_v6_sha256", gate.V7_SHA),
    }
    for name, (key, value) in checkpoint_mutations.items():
        bad = copy.deepcopy(cp); bad[key] = value; tests[name] = bool(gate.checkpoint_errors(bad))
    for name, key, value in [
        ("checkpoint_wrong_eligible_count_rejected", "eligible", 7),
        ("checkpoint_wrong_rejected_count_rejected", "rejected", 1),
        ("checkpoint_wrong_unresolved_count_rejected", "unresolved_research_rejections", 1),
    ]:
        bad = copy.deepcopy(cp); bad["counts"][key] = value; tests[name] = bool(gate.checkpoint_errors(bad))

    with tempfile.TemporaryDirectory() as directory:
        base = Path(directory); cp_path = base / "research.json"; cp_path.write_bytes(gate.canonical(cp)); cp_sha = gate.sha(cp_path)
        auth = gate.expected_authorization(cp_path, cp_sha)
        tests["valid_authorization_passes"] = gate.authorization_errors(auth, cp_path, cp_sha) == []
        authorization_mutations = {
            "authorization_wrong_audit_rejected": ("audit_id", "wrong"),
            "authorization_wrong_wave_rejected": ("wave_id", "wave-9999"),
            "authorization_wrong_cohort_rejected": ("cohort_id", "cohort-0002"),
            "authorization_wrong_status_rejected": ("status", "fail"),
            "authorization_gate_false_rejected": ("gate_passed", False),
            "authorization_nonindependent_rejected": ("independent", False),
            "authorization_not_authorized_rejected": ("activation_authorized", False),
            "authorization_wrong_checkpoint_path_rejected": ("research_checkpoint_path", "/wrong/checkpoint.json"),
            "authorization_wrong_checkpoint_hash_rejected": ("research_checkpoint_sha256", "0" * 64),
            "authorization_wrong_count_rejected": ("assignment_count", 7),
            "authorization_partial_scope_rejected": ("assignment_ids", gate.ASSIGNMENT_IDS[:-1]),
            "authorization_reordered_scope_rejected": ("assignment_ids", list(reversed(gate.ASSIGNMENT_IDS))),
            "authorization_duplicate_scope_rejected": ("assignment_ids", gate.ASSIGNMENT_IDS[:-1] + [gate.ASSIGNMENT_IDS[-2]]),
            "authorization_foreign_scope_rejected": ("assignment_ids", gate.ASSIGNMENT_IDS[:-1] + ["A005SA-0009"]),
            "authorization_all_16_scope_rejected": ("assignment_ids", [f"A005SA-{i:04d}" for i in range(1, 17)]),
            "authorization_all_32_scope_rejected": ("assignment_ids", [f"A005SA-{i:04d}" for i in range(1, 33)]),
            "authorization_wrong_paths_rejected": ("agent_paths", gate.AGENT_PATHS[:-1] + ["/root/wrong"]),
            "authorization_wrong_feature_count_rejected": ("feature_count", 822),
            "authorization_wrong_feature_digest_rejected": ("feature_refs_digest_sha256", "0" * 64),
            "authorization_wrong_model_rejected": ("model", "gpt-5.6-luna"),
            "authorization_wrong_effort_rejected": ("reasoning_effort", "high"),
            "authorization_wrong_controller_rejected": ("controller_thread_id", "wrong"),
            "authorization_v6_substitution_rejected": ("concurrency_policy_v6_semantic_sha256", gate.V7_SHA),
            "authorization_wrong_v7_rejected": ("concurrency_policy_v7_scheduling_only_sha256", "0" * 64),
            "authorization_v7_semantics_rejected": ("v7_changes_semantics", True),
            "authorization_wrong_cap_rejected": ("semantic_leaf_cap", 16),
            "authorization_zero_state_false_rejected": ("current_zero_state_verified", False),
            "authorization_nonzero_coverage_rejected": ("coverage_credit", 1),
            "authorization_nonzero_certification_rejected": ("certification_credit", 1),
            "authorization_errors_rejected": ("errors", ["x"]),
        }
        for name, (key, value) in authorization_mutations.items():
            bad = copy.deepcopy(auth); bad[key] = value; tests[name] = bool(gate.authorization_errors(bad, cp_path, cp_sha))
        bad = copy.deepcopy(auth); bad["preparation_hashes"]["generator_sha256"] = "0" * 64
        tests["authorization_generator_hash_drift_rejected"] = bool(gate.authorization_errors(bad, cp_path, cp_sha))
        bad = copy.deepcopy(auth); bad["source_v1_hashes"]["cohort_0001_activation_preparation_v1_authority_sha256"] = "0" * 64
        tests["authorization_v1_lineage_drift_rejected"] = bool(gate.authorization_errors(bad, cp_path, cp_sha))
        bad = copy.deepcopy(auth); bad["concurrency_policy_v5_sha256"] = "a87927157be59c448801bbd4cec157670609c4502fb18baa0afbe8d516fdb439"
        tests["authorization_v5_replay_rejected"] = bool(gate.authorization_errors(bad, cp_path, cp_sha))
        bad = copy.deepcopy(auth); bad["extra"] = True
        tests["authorization_extra_key_rejected"] = bool(gate.authorization_errors(bad, cp_path, cp_sha))

        auth_path = base / "authorization.json"; auth_path.write_bytes(gate.canonical(auth)); auth_sha = gate.sha(auth_path)
        activation, errors = gate.build_activation(cp_path, cp_sha, auth_path, auth_sha)
        tests["valid_inputs_build_activation"] = errors == []
        tests["valid_synthetic_activation"] = gate.activation_errors(activation) == []
        _, wrong_cp_sha_errors = gate.build_activation(cp_path, "0" * 64, auth_path, auth_sha)
        tests["generation_wrong_checkpoint_sha_rejected"] = "checkpoint:sha256" in wrong_cp_sha_errors
        _, wrong_auth_sha_errors = gate.build_activation(cp_path, cp_sha, auth_path, "0" * 64)
        tests["generation_wrong_authorization_sha_rejected"] = "authorization:sha256" in wrong_auth_sha_errors
        tests["generation_missing_checkpoint_rejected"] = "checkpoint:missing" in gate.build_activation(base / "missing.json", "0" * 64, auth_path, auth_sha)[1]
        tests["generation_missing_authorization_rejected"] = "authorization:missing" in gate.build_activation(cp_path, cp_sha, base / "missing-auth.json", "0" * 64)[1]

    activation_mutations = {
        "activation_wrong_schema_rejected": ("schema_version", "scenario-adversarial-cohort-activation-v1"),
        "activation_wrong_wave_rejected": ("wave_id", "wave-9999"),
        "activation_wrong_cohort_rejected": ("cohort_id", "cohort-0002"),
        "activation_false_grant_rejected": ("activation_granted", False),
        "activation_wrong_count_rejected": ("assignment_count", 7),
        "activation_partial_scope_rejected": ("assignment_ids", gate.ASSIGNMENT_IDS[:-1]),
        "activation_duplicate_scope_rejected": ("assignment_ids", gate.ASSIGNMENT_IDS[:-1] + [gate.ASSIGNMENT_IDS[-2]]),
        "activation_all_16_scope_rejected": ("assignment_ids", [f"A005SA-{i:04d}" for i in range(1, 17)]),
        "activation_all_32_scope_rejected": ("assignment_ids", [f"A005SA-{i:04d}" for i in range(1, 33)]),
        "activation_wrong_feature_count_rejected": ("feature_count", 822),
        "activation_wrong_feature_digest_rejected": ("feature_refs_digest_sha256", "0" * 64),
        "activation_wrong_model_rejected": ("model", "gpt-5.6-luna"),
        "activation_wrong_effort_rejected": ("reasoning_effort", "high"),
        "activation_wrong_controller_rejected": ("controller_thread_id", "wrong"),
        "activation_wrong_paths_rejected": ("agent_paths", gate.AGENT_PATHS[:-1] + ["/root/wrong"]),
        "activation_v6_substitution_rejected": ("concurrency_policy_v6_semantic_sha256", gate.V7_SHA),
        "activation_wrong_v7_rejected": ("concurrency_policy_v7_scheduling_only_sha256", "0" * 64),
        "activation_v7_semantics_rejected": ("v7_changes_semantics", True),
        "activation_wrong_cap_rejected": ("semantic_leaf_cap", 16),
        "activation_nonfresh_count_rejected": ("fresh_direct_leaves", 7),
        "activation_wrong_fork_rejected": ("fork_turns", "all"),
        "activation_descendants_allowed_rejected": ("descendants_forbidden", False),
        "activation_followups_allowed_rejected": ("followups_forbidden", False),
        "activation_nonzero_credit_rejected": ("coverage_credit_before_postrun", 1),
    }
    for name, (key, value) in activation_mutations.items():
        bad = copy.deepcopy(activation); bad[key] = value; tests[name] = bool(gate.activation_errors(bad))
    bad = copy.deepcopy(activation); bad["fixed_hashes"]["concurrency_policy_v6_semantic_sha256"] = "0" * 64
    tests["activation_fixed_v6_hash_drift_rejected"] = bool(gate.activation_errors(bad))
    bad = copy.deepcopy(activation); bad["assignment_bindings"][0]["packet_sha256"] = "0" * 64
    tests["activation_packet_binding_drift_rejected"] = bool(gate.activation_errors(bad))
    bad = copy.deepcopy(activation); bad["assignment_bindings"][0]["intent_sha256"] = "0" * 64
    tests["activation_intent_binding_drift_rejected"] = bool(gate.activation_errors(bad))
    bad = copy.deepcopy(activation); bad["assignment_bindings"][0]["output_directory"] = "/tmp/wrong"
    tests["activation_output_root_drift_rejected"] = bool(gate.activation_errors(bad))
    bad = copy.deepcopy(activation); bad["research_checkpoint_path"] = "relative.json"
    tests["activation_relative_checkpoint_path_rejected"] = bool(gate.activation_errors(bad))
    bad = copy.deepcopy(activation); bad["cohort_authorization_sha256"] = "not-a-hash"
    tests["activation_bad_authorization_hash_rejected"] = bool(gate.activation_errors(bad))
    bad = copy.deepcopy(activation); bad["concurrency_policy_v5_sha256"] = "a87927157be59c448801bbd4cec157670609c4502fb18baa0afbe8d516fdb439"
    tests["activation_v5_replay_rejected"] = bool(gate.activation_errors(bad))
    bad = copy.deepcopy(activation); bad["extra"] = True
    tests["activation_extra_key_rejected"] = bool(gate.activation_errors(bad))

    empty = {aid: [] for aid in gate.ASSIGNMENT_IDS}
    tests["zero_inventory_valid"] = gate.zero_inventory_errors(empty, [], [], []) == []
    tests["nonempty_output_rejected"] = bool(gate.zero_inventory_errors({**empty, gate.ASSIGNMENT_IDS[0]: ["result.json"]}, [], [], []))
    tests["missing_output_directory_rejected"] = bool(gate.zero_inventory_errors({aid: [] for aid in gate.ASSIGNMENT_IDS[:-1]}, [], [], []))
    tests["existing_receipt_rejected"] = bool(gate.zero_inventory_errors(empty, [gate.ASSIGNMENT_IDS[0]], [], []))
    tests["existing_result_rejected"] = bool(gate.zero_inventory_errors(empty, [], [gate.ASSIGNMENT_IDS[0]], []))
    tests["existing_cohort_activation_rejected"] = bool(gate.zero_inventory_errors(empty, [], [], ["cohort-0001/activation.json"]))
    tests["cross_cohort_activation_rejected"] = bool(gate.zero_inventory_errors(empty, [], [], ["cohort-0002/activation.json"]))

    failures = sorted(name for name, passed in tests.items() if passed is not True)
    report = {"checker": "scenario_cohort_0001_activation_v2_v6_compat_negative_tests",
              "status": "pass" if not failures and len(tests) >= 60 else "fail",
              "test_count": len(tests), "errors": failures, "tests": tests,
              "activation_created": False, "launch_authorized": False, "coverage_credit": 0}
    print(json.dumps(report, indent=2, sort_keys=True))
    raise SystemExit(0 if report["status"] == "pass" else 1)


if __name__ == "__main__":
    main()
