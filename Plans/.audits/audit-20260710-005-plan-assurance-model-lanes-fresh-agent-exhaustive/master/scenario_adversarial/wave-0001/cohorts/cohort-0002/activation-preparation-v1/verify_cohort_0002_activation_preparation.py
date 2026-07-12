#!/usr/bin/env python3
"""Verify the append-only cohort-0002 activation preparation without activating."""

from __future__ import annotations

import json
import subprocess

import generate_cohort_0002_activation as gate


def main() -> None:
    errors, bindings = gate.snapshot_errors()
    required = ["CANDIDATE_AUTHORITY.json", "activation.template.json", "readiness.json"]
    for name in required:
        if not (gate.PREP / name).is_file(): errors.append(f"required:missing:{name}")
    if any(item.startswith("required:missing") for item in errors):
        print(json.dumps({"status": "fail", "errors": sorted(set(errors))}, indent=2)); raise SystemExit(1)
    authority = gate.load_obj(gate.PREP / "CANDIDATE_AUTHORITY.json")
    template = gate.load_obj(gate.PREP / "activation.template.json")
    readiness = gate.load_obj(gate.PREP / "readiness.json")
    if template != gate.activation_template(): errors.append("template:drift")
    if json.dumps(template, sort_keys=True).count("UNRESOLVED_REQUIRED_FUTURE_INPUT") != 1:
        errors.append("template:placeholder_count")
    if authority.get("status") != gate.BLOCKED_STATUS or authority.get("activation_granted") is not False:
        errors.append("authority:state")
    if authority.get("assignment_ids") != gate.ASSIGNMENT_IDS or authority.get("assignment_count") != 8:
        errors.append("authority:assignment_scope")
    if authority.get("feature_count") != gate.FEATURE_COUNT or authority.get("feature_refs_digest_sha256") != gate.FEATURE_DIGEST:
        errors.append("authority:feature_scope")
    if authority.get("agent_paths") != gate.AGENT_PATHS or authority.get("model") != gate.MODEL or authority.get("reasoning_effort") != gate.EFFORT:
        errors.append("authority:identity_lane")
    if authority.get("concurrency_policy_v6_sha256") != gate.V6_SHA or authority.get("fixed_hashes") != gate.fixed_hashes():
        errors.append("authority:fixed_or_policy")
    if authority.get("activation_template_sha256") != gate.sha(gate.PREP / "activation.template.json"):
        errors.append("authority:template_hash")
    scripts = {
        "generator_sha256": gate.PREP / "generate_cohort_0002_activation.py",
        "verifier_sha256": gate.PREP / "verify_cohort_0002_activation_preparation.py",
        "test_sha256": gate.PREP / "test_cohort_0002_activation.py",
    }
    for key, path in scripts.items():
        if authority.get(key) != gate.sha(path): errors.append(f"authority:{key}")
    if authority.get("assignment_bindings") != bindings: errors.append("authority:assignment_bindings")
    for key in ("launch_credit", "coverage_credit", "certification_credit"):
        if authority.get(key) != 0: errors.append(f"authority:{key}")
    if readiness.get("status") != gate.BLOCKED_STATUS or readiness.get("activation_granted") is not False:
        errors.append("readiness:state")
    expected_counts = {"assignments": 8, "features": 817, "packets": 8, "intents": 8, "outputs": 8,
                       "output_files": 0, "receipts": 0, "results": 0, "activations": 0}
    if readiness.get("counts") != expected_counts: errors.append("readiness:counts")
    if readiness.get("authority_sha256") != gate.sha(gate.PREP / "CANDIDATE_AUTHORITY.json") or readiness.get("template_sha256") != gate.sha(gate.PREP / "activation.template.json"):
        errors.append("readiness:hashes")
    if readiness.get("feature_refs_digest_sha256") != gate.FEATURE_DIGEST or readiness.get("assignment_ids") != gate.ASSIGNMENT_IDS or readiness.get("agent_paths") != gate.AGENT_PATHS:
        errors.append("readiness:scope")
    if readiness.get("concurrency_policy_v6_sha256") != gate.V6_SHA: errors.append("readiness:v6")
    test = subprocess.run(["python3", "-B", str(gate.PREP / "test_cohort_0002_activation.py")],
                          cwd=gate.PREP, capture_output=True, text=True)
    try: test_report = json.loads(test.stdout)
    except Exception: test_report = {"status": "fail", "test_count": 0, "tests": {}}
    if test.returncode or test_report.get("status") != "pass" or test_report.get("test_count", 0) < 24 or any(value is not True for value in test_report.get("tests", {}).values()):
        errors.append("tests:fail")
    if (gate.COHORT / "activation.json").exists(): errors.append("activation:forbidden_current_turn")
    report = {
        "audit_id": gate.AUDIT_ID,
        "checker": "scenario_cohort_0002_activation_preparation_v1",
        "wave_id": gate.WAVE_ID,
        "cohort_id": gate.COHORT_ID,
        "status": "pass" if not errors else "fail",
        "candidate_status": gate.BLOCKED_STATUS,
        "errors": sorted(set(errors)),
        "counts": expected_counts,
        "feature_refs_digest_sha256": gate.FEATURE_DIGEST,
        "assignment_ids": gate.ASSIGNMENT_IDS,
        "agent_paths": gate.AGENT_PATHS,
        "assignment_bindings": bindings,
        "fixed_hashes": gate.fixed_hashes(),
        "concurrency_policy_v6_sha256": gate.V6_SHA,
        "generator_sha256": gate.sha(gate.PREP / "generate_cohort_0002_activation.py"),
        "verifier_sha256": gate.sha(gate.PREP / "verify_cohort_0002_activation_preparation.py"),
        "test_sha256": gate.sha(gate.PREP / "test_cohort_0002_activation.py"),
        "authority_sha256": gate.sha(gate.PREP / "CANDIDATE_AUTHORITY.json"),
        "template_sha256": gate.sha(gate.PREP / "activation.template.json"),
        "readiness_sha256": gate.sha(gate.PREP / "readiness.json"),
        "strict_test_count": test_report.get("test_count", 0),
        "strict_tests": test_report.get("tests", {}),
        "activation_granted": False,
        "launch_credit": 0,
        "coverage_credit": 0,
        "certification_credit": 0,
    }
    print(json.dumps(report, indent=2, sort_keys=True))
    raise SystemExit(0 if not errors else 1)


if __name__ == "__main__": main()

