#!/usr/bin/env python3
"""Verify one late-cohort V6 activation preparation without activating."""

from __future__ import annotations

import json
import subprocess

import generate_cohort_0004_activation as gate


def main() -> None:
    errors, bindings = gate.snapshot_errors()
    for name in ("CANDIDATE_AUTHORITY.json", "activation.template.json", "readiness.json"):
        if not (gate.PREP / name).is_file(): errors.append(f"required:missing:{name}")
    if any(item.startswith("required:missing") for item in errors):
        print(json.dumps({"status": "fail", "errors": sorted(set(errors))}, indent=2)); raise SystemExit(1)
    authority = gate.load_obj(gate.PREP / "CANDIDATE_AUTHORITY.json")
    template = gate.load_obj(gate.PREP / "activation.template.json")
    readiness = gate.load_obj(gate.PREP / "readiness.json")
    if template != gate.activation_template(): errors.append("template:drift")
    markers = ["UNRESOLVED_GLOBAL_RESEARCH_CHECKPOINT", "UNRESOLVED_PRIOR_COHORTS_TERMINAL_CHECKPOINT", "UNRESOLVED_COHORT_SPECIFIC_AUTHORIZATION"]
    rendered = json.dumps(template, sort_keys=True)
    if any(rendered.count(marker) != 1 for marker in markers): errors.append("template:placeholder_contracts")
    if authority.get("status") != gate.BLOCKED_STATUS or authority.get("activation_granted") is not False: errors.append("authority:state")
    if authority.get("assignment_ids") != gate.ASSIGNMENT_IDS or authority.get("assignment_count") != 8: errors.append("authority:assignments")
    if authority.get("feature_count") != gate.FEATURE_COUNT or authority.get("feature_refs_digest_sha256") != gate.FEATURE_DIGEST: errors.append("authority:features")
    if authority.get("agent_paths") != gate.AGENT_PATHS or authority.get("model") != gate.MODEL or authority.get("reasoning_effort") != gate.EFFORT: errors.append("authority:lane")
    if authority.get("concurrency_policy_v6_sha256") != gate.V6_SHA or authority.get("fixed_hashes") != gate.fixed_hashes(): errors.append("authority:fixed_or_v6")
    if authority.get("assignment_bindings") != bindings: errors.append("authority:bindings")
    if authority.get("prior_terminal_cohort_ids") != gate.PRIOR_COHORT_IDS or authority.get("authorized_overlap_cohort_ids") != gate.OVERLAP_COHORT_IDS: errors.append("authority:cohort_prerequisites")
    if authority.get("semantic_leaf_cap") != 8 or authority.get("maximum_active_semantic_cap") != 16: errors.append("authority:cap")
    if authority.get("activation_template_sha256") != gate.sha(gate.PREP / "activation.template.json"): errors.append("authority:template_hash")
    scripts = {"generator_sha256": gate.PREP / f"generate_cohort_{gate.COHORT_NUMBER:04d}_activation.py",
        "verifier_sha256": gate.PREP / f"verify_cohort_{gate.COHORT_NUMBER:04d}_activation_preparation.py",
        "test_sha256": gate.PREP / f"test_cohort_{gate.COHORT_NUMBER:04d}_activation.py"}
    for key, path in scripts.items():
        if authority.get(key) != gate.sha(path): errors.append(f"authority:{key}")
    for key in ("launch_credit", "coverage_credit", "certification_credit"):
        if authority.get(key) != 0: errors.append(f"authority:{key}")
    if readiness.get("status") != gate.BLOCKED_STATUS or readiness.get("activation_granted") is not False: errors.append("readiness:state")
    expected_counts = {"assignments": 8, "features": gate.FEATURE_COUNT, "packets": 8, "intents": 8,
        "outputs": 8, "output_files": 0, "receipts": 0, "results": 0, "activations": 0}
    if readiness.get("counts") != expected_counts: errors.append("readiness:counts")
    if readiness.get("authority_sha256") != gate.sha(gate.PREP / "CANDIDATE_AUTHORITY.json") or readiness.get("template_sha256") != gate.sha(gate.PREP / "activation.template.json"): errors.append("readiness:hashes")
    if readiness.get("assignment_ids") != gate.ASSIGNMENT_IDS or readiness.get("agent_paths") != gate.AGENT_PATHS or readiness.get("feature_refs_digest_sha256") != gate.FEATURE_DIGEST: errors.append("readiness:scope")
    if readiness.get("concurrency_policy_v6_sha256") != gate.V6_SHA or readiness.get("maximum_active_semantic_cap") != 16: errors.append("readiness:v6_or_cap")
    test_path = gate.PREP / f"test_cohort_{gate.COHORT_NUMBER:04d}_activation.py"
    test = subprocess.run(["python3", "-B", str(test_path)], cwd=gate.PREP, capture_output=True, text=True)
    try: test_report = json.loads(test.stdout)
    except Exception: test_report = {"status": "fail", "test_count": 0, "tests": {}}
    if test.returncode or test_report.get("status") != "pass" or test_report.get("test_count", 0) < 40 or any(value is not True for value in test_report.get("tests", {}).values()): errors.append("tests:fail")
    if (gate.COHORT / "activation.json").exists(): errors.append("activation:forbidden_current_turn")
    report = {"audit_id": gate.AUDIT_ID, "checker": f"scenario_{gate.COHORT_ID}_activation_preparation_v1",
        "wave_id": gate.WAVE_ID, "cohort_id": gate.COHORT_ID, "status": "pass" if not errors else "fail",
        "candidate_status": gate.BLOCKED_STATUS, "errors": sorted(set(errors)), "counts": expected_counts,
        "feature_refs_digest_sha256": gate.FEATURE_DIGEST, "assignment_ids": gate.ASSIGNMENT_IDS,
        "agent_paths": gate.AGENT_PATHS, "assignment_bindings": bindings, "fixed_hashes": gate.fixed_hashes(),
        "concurrency_policy_v6_sha256": gate.V6_SHA, "prior_terminal_cohort_ids": gate.PRIOR_COHORT_IDS,
        "prior_terminal_assignment_digest": gate.PRIOR_ASSIGNMENT_DIGEST,
        "authorized_overlap_cohort_ids": gate.OVERLAP_COHORT_IDS, "semantic_leaf_cap": 8,
        "maximum_active_semantic_cap": 16,
        "generator_sha256": gate.sha(gate.PREP / f"generate_cohort_{gate.COHORT_NUMBER:04d}_activation.py"),
        "verifier_sha256": gate.sha(gate.PREP / f"verify_cohort_{gate.COHORT_NUMBER:04d}_activation_preparation.py"),
        "test_sha256": gate.sha(test_path), "authority_sha256": gate.sha(gate.PREP / "CANDIDATE_AUTHORITY.json"),
        "template_sha256": gate.sha(gate.PREP / "activation.template.json"), "readiness_sha256": gate.sha(gate.PREP / "readiness.json"),
        "strict_test_count": test_report.get("test_count", 0), "strict_tests": test_report.get("tests", {}),
        "activation_granted": False, "launch_credit": 0, "coverage_credit": 0, "certification_credit": 0}
    print(json.dumps(report, indent=2, sort_keys=True)); raise SystemExit(0 if not errors else 1)


if __name__ == "__main__": main()
