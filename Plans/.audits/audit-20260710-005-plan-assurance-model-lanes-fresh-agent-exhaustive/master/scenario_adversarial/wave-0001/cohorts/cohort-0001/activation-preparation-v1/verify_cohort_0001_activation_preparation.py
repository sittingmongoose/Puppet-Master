#!/usr/bin/env python3
"""Verify cohort-0001 activation preparation without creating activation."""

from __future__ import annotations

import hashlib
import json
import subprocess
from pathlib import Path

import generate_cohort_0001_activation as gate


def main() -> None:
    errors, packet_rows = gate.snapshot_errors()
    try:
        authority = gate.load_obj(gate.PREP / "CANDIDATE_AUTHORITY.json")
        template = gate.load_obj(gate.PREP / "activation.template.json")
        readiness = gate.load_obj(gate.PREP / "readiness.json")
    except Exception as exc:
        print(json.dumps({"status": "fail", "errors": [f"load:{type(exc).__name__}:{exc}"]}, indent=2)); raise SystemExit(1)
    if template != gate.activation_template(): errors.append("template:drift")
    if json.dumps(template, sort_keys=True).count("UNRESOLVED_REQUIRED_FUTURE_INPUT") != 1: errors.append("template:placeholder_count")
    if authority.get("status") != "BLOCKED_AWAITING_CUMULATIVE_RESEARCH_CHECKPOINT" or authority.get("activation_granted") is not False:
        errors.append("authority:state")
    if authority.get("assignment_ids") != gate.ASSIGNMENT_IDS or authority.get("assignment_count") != 8 or authority.get("feature_count") != gate.FEATURE_COUNT or authority.get("feature_refs_digest_sha256") != gate.FEATURE_DIGEST:
        errors.append("authority:cohort_scope")
    if authority.get("agent_paths") != gate.AGENT_PATHS or authority.get("model") != gate.MODEL or authority.get("reasoning_effort") != gate.EFFORT:
        errors.append("authority:identity_lane")
    if authority.get("fixed_hashes") != gate.fixed_hashes(): errors.append("authority:fixed_hashes")
    if authority.get("activation_template_sha256") != gate.sha(gate.PREP / "activation.template.json"):
        errors.append("authority:template_hash")
    scripts = {"generator_sha256": gate.PREP / "generate_cohort_0001_activation.py",
               "verifier_sha256": gate.PREP / "verify_cohort_0001_activation_preparation.py",
               "test_sha256": gate.PREP / "test_cohort_0001_activation.py"}
    for key, path in scripts.items():
        if authority.get(key) != gate.sha(path): errors.append(f"authority:{key}")
    if readiness.get("status") != "BLOCKED_AWAITING_CUMULATIVE_RESEARCH_CHECKPOINT" or readiness.get("activation_granted") is not False:
        errors.append("readiness:state")
    if readiness.get("counts") != {"assignments": 8, "features": 823, "packets": 8, "intents": 8, "outputs": 8, "output_files": 0, "receipts": 0, "results": 0, "activations": 0}:
        errors.append("readiness:counts")
    if readiness.get("authority_sha256") != gate.sha(gate.PREP / "CANDIDATE_AUTHORITY.json") or readiness.get("template_sha256") != gate.sha(gate.PREP / "activation.template.json"):
        errors.append("readiness:hashes")
    test = subprocess.run(["python3", "-B", str(gate.PREP / "test_cohort_0001_activation.py")], cwd=gate.PREP, capture_output=True, text=True)
    try: test_report = json.loads(test.stdout)
    except Exception: test_report = {"status": "fail", "test_count": 0, "tests": {}}
    if test.returncode or test_report.get("status") != "pass" or test_report.get("test_count", 0) < 16 or any(value is not True for value in test_report.get("tests", {}).values()):
        errors.append("tests:fail")
    if (gate.COHORT / "activation.json").exists(): errors.append("activation:forbidden_current_turn")
    report = {"audit_id": gate.AUDIT_ID, "checker": "scenario_cohort_0001_activation_preparation_v1",
              "wave_id": gate.WAVE_ID, "cohort_id": gate.COHORT_ID, "status": "pass" if not errors else "fail",
              "errors": sorted(set(errors)), "counts": {"assignments": 8, "features": 823, "packets": len(packet_rows),
                  "intents": len(packet_rows), "outputs": 8, "output_files": 0, "receipts": 0, "results": 0, "activations": 0},
              "feature_refs_digest_sha256": gate.FEATURE_DIGEST, "assignment_ids": gate.ASSIGNMENT_IDS,
              "agent_paths": gate.AGENT_PATHS, "fixed_hashes": gate.fixed_hashes(),
              "generator_sha256": gate.sha(gate.PREP / "generate_cohort_0001_activation.py"),
              "verifier_sha256": gate.sha(gate.PREP / "verify_cohort_0001_activation_preparation.py"),
              "test_sha256": gate.sha(gate.PREP / "test_cohort_0001_activation.py"),
              "authority_sha256": gate.sha(gate.PREP / "CANDIDATE_AUTHORITY.json"),
              "template_sha256": gate.sha(gate.PREP / "activation.template.json"),
              "readiness_sha256": gate.sha(gate.PREP / "readiness.json"),
              "strict_test_count": test_report.get("test_count", 0), "strict_tests": test_report.get("tests", {}),
              "activation_granted": False, "coverage_credit": 0, "certification_credit": 0}
    print(json.dumps(report, indent=2, sort_keys=True)); raise SystemExit(0 if not errors else 1)


if __name__ == "__main__": main()
