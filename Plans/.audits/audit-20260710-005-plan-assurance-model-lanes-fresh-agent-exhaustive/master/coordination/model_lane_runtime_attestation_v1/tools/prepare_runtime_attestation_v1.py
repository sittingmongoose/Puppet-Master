#!/usr/bin/env python3
from __future__ import annotations

import hashlib
import json
import subprocess
import sys
from pathlib import Path


NS = Path(__file__).resolve().parents[1]
AUDIT = NS.parents[2]
COORDINATION = NS.parent
AUTHORITY = COORDINATION / "MODEL_LANE_RUNTIME_ATTESTATION_V1.json"
REPORT = NS / "validation" / "terminal-runtime-attestation-v1.json"
PRIOR_REPORT = AUDIT / "master/cross_domain_seams/wave-0001/window-sharding-v2/validation/luna-independent-prelaunch-v2.json"
CACHE_NS = AUDIT / "master/dependencies/jsonschema-draft202012-v1/cache-reconciliation-v2"


def sha(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def run_json(command: list[str], allow_failure: bool = False) -> dict:
    proc = subprocess.run(command, text=True, capture_output=True)
    if proc.returncode and not allow_failure:
        raise SystemExit(proc.stdout + proc.stderr)
    return json.loads(proc.stdout)


def main() -> None:
    subprocess.run([sys.executable, str(NS / "tools/capture_runtime_attestation_v1.py")], check=True)
    validation = run_json([sys.executable, str(NS / "tools/validate_runtime_attestation_v1.py")], allow_failure=True)
    tests = run_json([sys.executable, str(NS / "tests/test_runtime_attestation_v1.py")])
    expected_errors = {
        "spawn_argument_model_missing",
        "spawn_argument_reasoning_effort_missing",
        "child_runtime_model",
        "child_runtime_reasoning_effort",
    }
    errors = set(validation.get("errors", []))
    mechanically_closed = expected_errors.issubset(errors) and tests.get("status") == "pass"

    evidence = NS / "evidence/runtime_spawn_evidence.json"
    manifest = NS / "evidence/capture_manifest.json"
    checkpoint = NS / "evidence/parent_spawn_checkpoint.jsonl"
    validator = NS / "tools/validate_runtime_attestation_v1.py"
    capture = NS / "tools/capture_runtime_attestation_v1.py"
    test_path = NS / "tests/test_runtime_attestation_v1.py"

    authority = {
        "schema_version": "audit005-model-lane-runtime-attestation-authority-v1",
        "status": "FAIL",
        "scope": "prior seam Luna prelaunch reviewer parent-spawn runtime attestation",
        "requested_model": "gpt-5.6-luna",
        "requested_reasoning_effort": "max",
        "native_spawn_fields_are_authoritative": True,
        "prompt_prose_or_child_self_attestation_is_authoritative": False,
        "exact_agent_path": "/root/a005_cds_v2_luna_independent_prelaunch_terminal",
        "fork_turns": "none",
        "parent_controller_thread_id": "019f4f5e-96c6-7893-8c94-ce2c1b760d6c",
        "prior_failed_report_path": str(PRIOR_REPORT),
        "prior_failed_report_sha256": sha(PRIOR_REPORT),
        "cache_reconciliation_authority_path": str(CACHE_NS / "CACHE_RECONCILIATION_AUTHORITY_V2.json"),
        "cache_reconciliation_authority_sha256": sha(CACHE_NS / "CACHE_RECONCILIATION_AUTHORITY_V2.json"),
        "cache_reconciliation_report_path": str(CACHE_NS / "validation/terminal-cache-reconciliation-v2.json"),
        "cache_reconciliation_report_sha256": sha(CACHE_NS / "validation/terminal-cache-reconciliation-v2.json"),
        "evidence_path": str(evidence),
        "evidence_sha256": sha(evidence),
        "capture_manifest_path": str(manifest),
        "capture_manifest_sha256": sha(manifest),
        "checkpoint_path": str(checkpoint),
        "checkpoint_sha256": sha(checkpoint),
        "capture_tool_path": str(capture),
        "capture_tool_sha256": sha(capture),
        "validator_path": str(validator),
        "validator_sha256": sha(validator),
        "tests_path": str(test_path),
        "tests_sha256": sha(test_path),
        "tests": {k: tests[k] for k in ["status", "total", "passed", "failed", "negative_test_count", "test_name_digest"]},
        "validation_errors": sorted(errors),
        "failure_facts": {
            "explicit_spawn_model_argument_present": False,
            "explicit_spawn_reasoning_effort_argument_present": False,
            "child_native_runtime_model": "gpt-5.6-sol",
            "child_native_runtime_reasoning_effort": "xhigh",
        },
        "launch_authorized": False,
        "prelaunch_recovery_v3_authorized": False,
        "semantic_credit": 0,
        "coverage_credit": 0,
    }
    if not mechanically_closed:
        raise SystemExit("runtime attestation failure was not mechanically closed")
    AUTHORITY.write_text(json.dumps(authority, indent=2, sort_keys=True) + "\n")

    report = {
        "schema_version": "audit005-model-lane-runtime-attestation-terminal-report-v1",
        "status": "fail",
        "decision": "GATE_FAILED_RUNTIME_ATTESTATION_LAUNCH_ZERO",
        "authority_path": str(AUTHORITY),
        "authority_sha256": sha(AUTHORITY),
        "evidence_path": str(evidence),
        "evidence_sha256": sha(evidence),
        "capture_manifest_path": str(manifest),
        "capture_manifest_sha256": sha(manifest),
        "checkpoint_path": str(checkpoint),
        "checkpoint_sha256": sha(checkpoint),
        "validation_errors": sorted(errors),
        "tests": authority["tests"],
        "dependency_cache_reconciliation": {
            "status": "pass",
            "semantic_file_count": 152,
            "cache_file_count": 39,
            "observed_runtime_file_count": 191,
            "semantic_tree_sha256": "f117d8770a942f1760a6555f7544e697d5fdfc2a06a8af608f300e94ac75ee95",
            "authority_sha256": authority["cache_reconciliation_authority_sha256"],
            "report_sha256": authority["cache_reconciliation_report_sha256"],
        },
        "conditional_phase_c": {
            "authorized": False,
            "reason": "runtime attestation B failed; C is forbidden",
            "fresh_delta_reviewer_spawned": 0,
            "cohort_activations_created": 0,
            "seam_leaves_spawned": 0,
            "results_created": 0,
            "receipts_created": 0,
            "cohorts_0003_0004_unchanged_zero_state": True,
        },
        "credits": {"semantic": 0, "coverage": 0, "promotion": 0},
    }
    REPORT.parent.mkdir(parents=True, exist_ok=True)
    REPORT.write_text(json.dumps(report, indent=2, sort_keys=True) + "\n")
    print(json.dumps({"status": "fail", "authority_sha256": sha(AUTHORITY), "report_sha256": sha(REPORT), "tests": authority["tests"], "errors": sorted(errors)}, indent=2, sort_keys=True))


if __name__ == "__main__":
    main()
