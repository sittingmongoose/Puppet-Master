#!/usr/bin/env python3
"""Strict negative tests for cohort-0001 activation preparation."""

from __future__ import annotations

import copy
import hashlib
import json
import tempfile
from pathlib import Path

import generate_cohort_0001_activation as gate


def checkpoint() -> dict:
    return {"status": "pass", "gate_passed": True, "independent": True,
            "eligible_assignment_ids": gate.RESEARCH_IDS, "eligible_assignment_digest": gate.RESEARCH_ELIGIBLE_DIGEST,
            "rejected_assignment_ids": [], "unresolved_research_rejections": [], "cumulative_research_credit": 8,
            "counts": {"eligible": 8, "rejected": 0, "unresolved_research_rejections": 0}}


def activation() -> dict:
    rows = [{"assignment_id": aid, "packet_sha256": f"p{index}", "intent_sha256": f"i{index}", "agent_path": gate.AGENT_PATHS[index]}
            for index, aid in enumerate(gate.ASSIGNMENT_IDS)]
    return {"audit_id": gate.AUDIT_ID, "schema_version": "scenario-adversarial-cohort-activation-v1",
            "wave_id": gate.WAVE_ID, "cohort_id": gate.COHORT_ID,
            "status": "ACTIVE_FOR_EXACTLY_8_FRESH_SOL_XHIGH_LEAVES", "activation_granted": True,
            "assignment_count": 8, "assignment_ids": gate.ASSIGNMENT_IDS, "feature_count": gate.FEATURE_COUNT,
            "feature_refs_digest_sha256": gate.FEATURE_DIGEST, "model": gate.MODEL, "reasoning_effort": gate.EFFORT,
            "controller_thread_id": gate.CONTROLLER, "agent_paths": gate.AGENT_PATHS, "fixed_hashes": gate.fixed_hashes(),
            "assignment_bindings": rows, "research_checkpoint_path": "/future/checkpoint.json",
            "research_checkpoint_sha256": "f" * 64, "research_eligible_assignment_ids": gate.RESEARCH_IDS,
            "research_eligible_assignment_digest": gate.RESEARCH_ELIGIBLE_DIGEST,
            "research_rejected_assignment_ids": [], "unresolved_research_rejections": [],
            "concurrency_policy_v5_sha256": gate.V5_SHA, "semantic_leaf_cap": 8,
            "coverage_credit_before_postrun": 0, "certification_credit_before_postrun": 0}


def main() -> None:
    tests: dict[str, bool] = {}
    snapshot_errors, _ = gate.snapshot_errors()
    tests["fixed_snapshot_valid"] = snapshot_errors == []
    tests["missing_checkpoint_rejected"] = "checkpoint:missing" in gate.build_activation(Path("/missing/checkpoint"), "0" * 64)[1]
    with tempfile.TemporaryDirectory() as directory:
        path = Path(directory) / "checkpoint.json"; path.write_bytes(gate.canonical(checkpoint()))
        tests["wrong_checkpoint_sha_rejected"] = "checkpoint:sha256" in gate.build_activation(path, "0" * 64)[1]
        activation_value, errors = gate.build_activation(path, gate.sha(path))
        tests["valid_checkpoint_builds_synthetic_activation"] = errors == [] and gate.activation_errors(activation_value) == []
    bad = checkpoint(); bad["eligible_assignment_ids"] = gate.RESEARCH_IDS[:-1]; bad["counts"]["eligible"] = 7
    tests["partial_eligibility_rejected"] = bool(gate.checkpoint_errors(bad))
    bad = checkpoint(); bad["eligible_assignment_digest"] = "0" * 64
    tests["wrong_eligible_digest_rejected"] = bool(gate.checkpoint_errors(bad))
    bad = checkpoint(); bad["unresolved_research_rejections"] = ["ER-0008"]
    tests["unresolved_research_rejection_rejected"] = bool(gate.checkpoint_errors(bad))
    bad = checkpoint(); bad["rejected_assignment_ids"] = ["ER-0008"]
    tests["research_rejection_rejected"] = bool(gate.checkpoint_errors(bad))
    bad = checkpoint(); bad["independent"] = False
    tests["nonindependent_checkpoint_rejected"] = bool(gate.checkpoint_errors(bad))
    bad = checkpoint(); bad["counts"]["unresolved_research_rejections"] = 1
    tests["wrong_checkpoint_counts_rejected"] = bool(gate.checkpoint_errors(bad))
    valid = activation(); tests["valid_synthetic_activation"] = gate.activation_errors(valid) == []
    bad = copy.deepcopy(valid); bad["cohort_id"] = "cohort-0002"
    tests["wrong_cohort_rejected"] = bool(gate.activation_errors(bad))
    bad = copy.deepcopy(valid); bad["assignment_ids"] = gate.ASSIGNMENT_IDS[:-1]
    tests["wrong_assignment_set_rejected"] = bool(gate.activation_errors(bad))
    bad = copy.deepcopy(valid); bad["assignment_ids"] = [f"A005SA-{index:04d}" for index in range(1, 33)]; bad["assignment_count"] = 32
    tests["all_32_activation_rejected"] = bool(gate.activation_errors(bad))
    bad = copy.deepcopy(valid); bad["model"] = "gpt-5.6-luna"
    tests["wrong_model_rejected"] = bool(gate.activation_errors(bad))
    bad = copy.deepcopy(valid); bad["reasoning_effort"] = "high"
    tests["wrong_effort_rejected"] = bool(gate.activation_errors(bad))
    bad = copy.deepcopy(valid); bad["agent_paths"][0] = "/root/wrong"
    tests["wrong_agent_path_rejected"] = bool(gate.activation_errors(bad))
    bad = copy.deepcopy(valid); bad["fixed_hashes"]["cohort_manifest_sha256"] = "0" * 64
    tests["fixed_hash_drift_rejected"] = bool(gate.activation_errors(bad))
    bad = copy.deepcopy(valid); bad["feature_refs_digest_sha256"] = "0" * 64
    tests["feature_digest_rejected"] = bool(gate.activation_errors(bad))
    bad = copy.deepcopy(valid); bad["concurrency_policy_v5_sha256"] = "0" * 64
    tests["wrong_v5_rejected"] = bool(gate.activation_errors(bad))
    bad = copy.deepcopy(valid); bad["assignment_bindings"][0]["assignment_id"] = "A005SA-0009"
    tests["cross_cohort_binding_rejected"] = bool(gate.activation_errors(bad))
    tests["nonempty_output_rejected"] = bool(gate.zero_state_inventory_errors(["result.json"], [], []))
    tests["receipt_present_rejected"] = bool(gate.zero_state_inventory_errors([], ["A005SA-0001"], []))
    tests["cross_cohort_activation_leakage_rejected"] = bool(gate.zero_state_inventory_errors([], [], ["cohort-0002"]))
    failures = sorted(name for name, passed in tests.items() if not passed)
    report = {"checker": "scenario_cohort_0001_activation_negative_tests_v1",
              "status": "pass" if not failures and len(tests) >= 16 else "fail", "test_count": len(tests),
              "errors": failures, "tests": tests, "activation_created": False}
    print(json.dumps(report, indent=2, sort_keys=True)); raise SystemExit(0 if report["status"] == "pass" else 1)


if __name__ == "__main__": main()
