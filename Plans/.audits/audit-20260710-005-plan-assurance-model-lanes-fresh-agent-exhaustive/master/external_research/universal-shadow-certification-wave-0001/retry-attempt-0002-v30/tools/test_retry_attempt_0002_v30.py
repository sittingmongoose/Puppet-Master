#!/usr/bin/env python3
"""Executable positive/negative wrapper suite for retry-attempt-0002 V30."""
from __future__ import annotations

import hashlib
import json
import os
import subprocess
from pathlib import Path
from typing import Any

AUDIT = Path("/Users/jaredsmacbookair/Documents/PuppetMaster/Plans/.audits/audit-20260710-005-plan-assurance-model-lanes-fresh-agent-exhaustive")
HERE = Path(__file__).resolve().parents[1]
PYTHON = Path("/Users/jaredsmacbookair/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3")
SITE = AUDIT / "master/dependencies/jsonschema-draft202012-v1/site-packages"
VERIFIER = HERE / "tools/verify_retry_attempt_0002_v30.py"
PRIMARY_SHAS = {
    "cohort-0001": "45bec51e3bedc80f9ca2af7bb10d0fdecf581021a803eae723bc0d699084f214",
    "cohort-0002": "c756c049c3ae93c518b155d69c64b595e05c2ae04b62f82226c4dd7d89c60454",
}
DIGEST = "c4ce218e0aa044d850b1b026fe10b98766138748b585e2680916fb80964cc70f"


def env() -> dict[str, str]:
    return {
        "PATH": str(PYTHON.parent) + os.pathsep + os.environ.get("PATH", ""),
        "PYTHONPATH": str(SITE),
        "PYTHONNOUSERSITE": "1",
        "PYTHONDONTWRITEBYTECODE": "1",
        "PYTHONHASHSEED": "0",
    }


def run(mode: str) -> tuple[int, dict[str, Any], str]:
    proc = subprocess.run([str(PYTHON), "-S", "-B", str(VERIFIER), "--mode", mode], cwd=AUDIT, env=env(), capture_output=True, text=True, check=False)
    try:
        report = json.loads(proc.stdout)
    except Exception:
        report = {"status": "unparseable", "stdout": proc.stdout[-2000:]}
    return proc.returncode, report, proc.stderr[-2000:]


def main() -> None:
    prep_rc, prep, prep_stderr = run("preparation")
    gate_rc, gate, gate_stderr = run("prelaunch")
    expected_gate_errors = {
        "gate-missing:cohort-0001:primary-rejected-set",
        "gate-missing:cohort-0001:atomic8-prelaunch",
        "gate-missing:cohort-0002:primary-rejected-set",
        "gate-missing:cohort-0002:atomic8-prelaunch",
    }
    tests = prep.get("tests", {})
    counts = prep.get("counts", {})
    v8 = prep.get("v8_suite", {})
    checks = {
        "preparation_verifier_exit_zero": prep_rc == 0,
        "preparation_status_pass": prep.get("status") == "pass_preparation_only",
        "all_preparation_checks_pass": tests.get("failed") == 0,
        "real_draft202012_engine": prep.get("schema_engine") == {"library": "jsonschema", "python": "3.12.13", "validator": "Draft202012Validator", "version": "4.26.0"},
        "all_16_corrected_positives": tests.get("corrected_positive_documents") == 16,
        "at_least_68_new_negatives": tests.get("new_negative_schema_cases", 0) >= 68,
        "v8_437_substantive_cases": tests.get("v8_substantive_cases") == 437 and v8.get("counts", {}).get("passed") == 437,
        "v8_12_bypasses_rejected": tests.get("v8_bypass_reproductions_rejected") == 12 and v8.get("bypass_reproductions", {}).get("rejected") == 12,
        "v8_100_fuzz_rejected": tests.get("v8_schema_fuzz_rejected") == 100 and v8.get("generic_schema_fuzz", {}).get("rejected") == 100,
        "two_atomic8_zero_state": counts == {"activation_transactions": 0, "assignments": 16, "cohorts": 2, "credit": 0, "empty_attempt_0002_outputs": 16, "features": 3888, "native_capture_rows": 0, "receipts": 0, "results": 0},
        "immutable_primary_shas": prep.get("primary_attempt_0001_shas") == PRIMARY_SHAS,
        "correct_digest": prep.get("source_transaction_digest") == DIGEST,
        "inactive_spawn_none": prep.get("activation_authorized") is False and prep.get("launch_authorized") is False and prep.get("spawn") == "none",
        "prelaunch_fails_closed_without_gates": gate_rc != 0 and gate.get("status") == "fail_closed",
        "exact_four_missing_luna_gates": set(gate.get("errors", [])) == expected_gate_errors,
        "prelaunch_still_zero_state": gate.get("counts") == counts,
        "no_test_stderr": prep_stderr == "" and gate_stderr == "",
    }
    total = tests.get("total", 0) + len(checks)
    passed = tests.get("passed", 0) + sum(checks.values())
    report = {
        "schema_version": "universal-shadow-certification-retry-tests-v30-attempt-0002",
        "status": "pass" if all(checks.values()) else "fail_closed",
        "errors": sorted(name for name, ok in checks.items() if not ok),
        "checks": checks,
        "tests": {"passed": passed, "failed": total - passed, "total": total, "wrapped_preparation_cases": tests.get("total", 0), "wrapper_cases": len(checks)},
        "preparation_verifier_stdout_sha256": hashlib.sha256(json.dumps(prep, sort_keys=True, separators=(",", ":")).encode()).hexdigest(),
        "prelaunch_negative_stdout_sha256": hashlib.sha256(json.dumps(gate, sort_keys=True, separators=(",", ":")).encode()).hexdigest(),
        "activation_authorized": False,
        "launch_authorized": False,
        "spawn": "none",
        "credit": 0,
    }
    print(json.dumps(report, indent=2, sort_keys=True))
    raise SystemExit(0 if report["status"] == "pass" else 1)


if __name__ == "__main__":
    main()
