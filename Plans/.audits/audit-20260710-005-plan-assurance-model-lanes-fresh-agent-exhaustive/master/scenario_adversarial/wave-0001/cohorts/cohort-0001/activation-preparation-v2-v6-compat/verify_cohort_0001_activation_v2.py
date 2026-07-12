#!/usr/bin/env python3
"""Verify cohort-0001's append-only V6 compatibility activation preparation."""

from __future__ import annotations

import json
import subprocess

import generate_cohort_0001_activation_v2 as gate


def main() -> None:
    errors, bindings, state = gate.snapshot_errors()
    required = ["CANDIDATE_AUTHORITY.json", "activation.template.json", "readiness.json",
                "generate_cohort_0001_activation_v2.py", "verify_cohort_0001_activation_v2.py", "test_cohort_0001_activation_v2.py"]
    for name in required:
        if not (gate.PREP / name).is_file(): errors.append(f"required:missing:{name}")
    if any(item.startswith("required:missing") for item in errors):
        print(json.dumps({"status": "fail", "errors": sorted(set(errors))}, indent=2)); raise SystemExit(1)
    authority = gate.load_obj(gate.PREP / "CANDIDATE_AUTHORITY.json")
    template = gate.load_obj(gate.PREP / "activation.template.json")
    readiness = gate.load_obj(gate.PREP / "readiness.json")
    for label, value in (("authority", authority), ("template", template), ("readiness", readiness)):
        if value.get("status") != gate.STATUS: errors.append(f"{label}:status")
        if value.get("activation_granted") is not False: errors.append(f"{label}:activation")
        if value.get("launch_authorized") is not False: errors.append(f"{label}:launch")
    expected_scope = {"assignment_ids": gate.ASSIGNMENT_IDS, "agent_paths": gate.AGENT_PATHS,
                      "feature_count": gate.FEATURE_COUNT, "feature_refs_digest_sha256": gate.FEATURE_DIGEST,
                      "model": gate.MODEL, "reasoning_effort": gate.EFFORT,
                      "controller_thread_id": gate.CONTROLLER}
    for label, value in (("authority", authority), ("template", template), ("readiness", readiness)):
        for key, item in expected_scope.items():
            if value.get(key) != item: errors.append(f"{label}:{key}")
    if authority.get("fixed_hashes") != gate.fixed_hashes() or template.get("fixed_hashes") != gate.fixed_hashes(): errors.append("candidate:fixed_hashes")
    if authority.get("concurrency_policy_v6_semantic_sha256") != gate.V6_SHA or authority.get("concurrency_policy_v7_scheduling_only_sha256") != gate.V7_SHA or authority.get("v7_changes_semantics") is not False:
        errors.append("authority:policy_roles")
    scripts = {"generator_sha256": gate.PREP / "generate_cohort_0001_activation_v2.py",
               "verifier_sha256": gate.PREP / "verify_cohort_0001_activation_v2.py",
               "test_sha256": gate.PREP / "test_cohort_0001_activation_v2.py"}
    for key, path in scripts.items():
        if authority.get(key) != gate.sha(path): errors.append(f"authority:{key}")
    if authority.get("template_sha256") != gate.sha(gate.PREP / "activation.template.json"): errors.append("authority:template_sha256")
    if readiness.get("authority_sha256") != gate.sha(gate.PREP / "CANDIDATE_AUTHORITY.json") or readiness.get("template_sha256") != gate.sha(gate.PREP / "activation.template.json"): errors.append("readiness:hashes")
    expected_counts = {"assignments": 8, "features": 823, "packets": 8, "intents": 8, "outputs": 8,
                       "output_files": 0, "receipts": 0, "results": 0, "activations": 0}
    if readiness.get("counts") != expected_counts: errors.append("readiness:counts")
    if readiness.get("current_state") != state: errors.append("readiness:current_state")
    if template.get("research_checkpoint_input", {}).get("status") != "UNRESOLVED_REQUIRED_FUTURE_INPUT": errors.append("template:research_placeholder")
    if template.get("cohort_authorization_input", {}).get("status") != "UNRESOLVED_REQUIRED_FUTURE_INPUT": errors.append("template:authorization_placeholder")
    if template.get("no_circular_activation_hash") is not True: errors.append("template:circular_hash")
    if template.get("v5_replay_forbidden") is not True: errors.append("template:v5_replay")
    if gate.COHORT.joinpath("activation.json").exists(): errors.append("activation:forbidden")
    test = subprocess.run(["python3", "-B", str(gate.PREP / "test_cohort_0001_activation_v2.py")], cwd=gate.PREP, capture_output=True, text=True)
    try: test_report = json.loads(test.stdout)
    except Exception: test_report = {"status": "fail", "test_count": 0, "tests": {}}
    if test.returncode or test_report.get("status") != "pass" or test_report.get("test_count", 0) < 60 or any(value is not True for value in test_report.get("tests", {}).values()): errors.append("tests:fail")
    report = {"audit_id": gate.AUDIT_ID, "checker": "scenario_cohort_0001_activation_v2_v6_compat_preparation",
              "wave_id": gate.WAVE_ID, "cohort_id": gate.COHORT_ID, "status": "pass" if not errors else "fail",
              "candidate_status": gate.STATUS, "errors": sorted(set(errors)), "counts": expected_counts,
              "assignment_ids": gate.ASSIGNMENT_IDS, "agent_paths": gate.AGENT_PATHS,
              "feature_count": gate.FEATURE_COUNT, "feature_refs_digest_sha256": gate.FEATURE_DIGEST,
              "assignment_binding_count": len(bindings), "current_state": state, "fixed_hashes": gate.fixed_hashes(),
              "strict_test_count": test_report.get("test_count", 0), "strict_tests": test_report.get("tests", {}),
              "authority_sha256": gate.sha(gate.PREP / "CANDIDATE_AUTHORITY.json"),
              "template_sha256": gate.sha(gate.PREP / "activation.template.json"),
              "readiness_sha256": gate.sha(gate.PREP / "readiness.json"),
              "generator_sha256": gate.sha(scripts["generator_sha256"]),
              "verifier_sha256": gate.sha(scripts["verifier_sha256"]), "test_sha256": gate.sha(scripts["test_sha256"]),
              "activation_granted": False, "launch_authorized": False, "coverage_credit": 0, "certification_credit": 0}
    print(json.dumps(report, indent=2, sort_keys=True)); raise SystemExit(0 if not errors else 1)


if __name__ == "__main__":
    main()
