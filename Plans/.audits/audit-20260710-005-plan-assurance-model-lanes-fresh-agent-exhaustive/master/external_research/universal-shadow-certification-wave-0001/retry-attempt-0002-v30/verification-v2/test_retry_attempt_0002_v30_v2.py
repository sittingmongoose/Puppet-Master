#!/usr/bin/env python3
"""Terminal executable suite for the append-only V2 verifier supersession."""
from __future__ import annotations

import hashlib
import json
import os
import subprocess
from pathlib import Path
from typing import Any

AUDIT = Path("/Users/jaredsmacbookair/Documents/PuppetMaster/Plans/.audits/audit-20260710-005-plan-assurance-model-lanes-fresh-agent-exhaustive")
HERE = Path(__file__).resolve().parent
PYTHON = Path("/Users/jaredsmacbookair/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3")
SITE = AUDIT / "master/dependencies/jsonschema-draft202012-v1/site-packages"
VERIFIER = HERE / "verify_retry_attempt_0002_v30_v2.py"
PRIMARY_SHAS = {
    "cohort-0001": "45bec51e3bedc80f9ca2af7bb10d0fdecf581021a803eae723bc0d699084f214",
    "cohort-0002": "c756c049c3ae93c518b155d69c64b595e05c2ae04b62f82226c4dd7d89c60454",
}


def env() -> dict[str, str]:
    return {
        "PATH": str(PYTHON.parent) + os.pathsep + os.environ.get("PATH", ""),
        "PYTHONPATH": str(SITE),
        "PYTHONNOUSERSITE": "1",
        "PYTHONDONTWRITEBYTECODE": "1",
        "PYTHONHASHSEED": "0",
    }


def run(mode: str) -> tuple[int, dict[str, Any], str, str]:
    proc = subprocess.run([str(PYTHON), "-S", "-B", str(VERIFIER), "--mode", mode], cwd=AUDIT, env=env(), capture_output=True, text=True, check=False)
    try:
        report = json.loads(proc.stdout)
    except Exception:
        report = {"status": "unparseable", "stdout": proc.stdout[-2000:]}
    return proc.returncode, report, proc.stderr[-2000:], hashlib.sha256(proc.stdout.encode()).hexdigest()


def main() -> None:
    prep_rc, prep, prep_stderr, prep_sha = run("preparation")
    gate_rc, gate, gate_stderr, gate_sha = run("prelaunch")
    expected_gate_errors = {
        "gate-missing:cohort-0001:primary-rejected-set",
        "gate-missing:cohort-0001:atomic8-prelaunch",
        "gate-missing:cohort-0002:primary-rejected-set",
        "gate-missing:cohort-0002:atomic8-prelaunch",
    }
    tests = prep.get("tests", {})
    expected_counts = {"activation_transactions": 0, "assignments": 16, "cohorts": 2, "credit": 0, "empty_attempt_0002_outputs": 16, "features": 3888, "native_capture_rows": 0, "receipts": 0, "results": 0}
    checks = {
        "prep_exit_zero": prep_rc == 0,
        "prep_pass": prep.get("status") == "pass_preparation_only" and prep.get("errors") == [],
        "all_wrapped_cases_pass": tests.get("failed") == 0 and tests.get("passed") == tests.get("total"),
        "pinned_runtime": prep.get("schema_engine") == {"library": "jsonschema", "python": "3.12.13", "validator": "Draft202012Validator", "version": "4.26.0"},
        "v8_437_retained": tests.get("v8_substantive_cases") == 437,
        "v8_12_bypasses_retained": tests.get("v8_bypass_reproductions_rejected") == 12,
        "v8_100_fuzz_retained": tests.get("v8_schema_fuzz_rejected") == 100,
        "all16_corrected_positive": tests.get("corrected_positive_documents") == 16,
        "68_real_negatives": tests.get("new_negative_schema_cases") == 68,
        "20_v2_replacement_checks": tests.get("v2_replacement_checks") == 20,
        "zero_state": prep.get("counts") == expected_counts,
        "primary_shas": prep.get("primary_attempt_0001_shas") == PRIMARY_SHAS,
        "digest": prep.get("source_transaction_digest") == "c4ce218e0aa044d850b1b026fe10b98766138748b585e2680916fb80964cc70f",
        "inactive": prep.get("activation_authorized") is False and prep.get("launch_authorized") is False and prep.get("spawn") == "none",
        "prelaunch_fails_without_gates": gate_rc != 0 and gate.get("status") == "fail_closed",
        "exact_four_gate_errors": set(gate.get("errors", [])) == expected_gate_errors,
        "prelaunch_zero_state": gate.get("counts") == expected_counts,
        "stderr_empty": prep_stderr == "" and gate_stderr == "",
    }
    total = tests.get("total", 0) + len(checks)
    passed = tests.get("passed", 0) + sum(checks.values())
    report = {
        "schema_version": "universal-shadow-certification-retry-tests-v30-attempt-0002-v2",
        "status": "pass" if all(checks.values()) else "fail_closed",
        "errors": sorted(name for name, ok in checks.items() if not ok),
        "checks": checks,
        "tests": {"passed": passed, "failed": total - passed, "total": total, "wrapped_cases": tests.get("total", 0), "wrapper_cases": len(checks)},
        "preparation_verifier_stdout_sha256": prep_sha,
        "prelaunch_negative_stdout_sha256": gate_sha,
        "activation_authorized": False,
        "launch_authorized": False,
        "spawn": "none",
        "credit": 0,
    }
    print(json.dumps(report, indent=2, sort_keys=True))
    raise SystemExit(0 if report["status"] == "pass" else 1)


if __name__ == "__main__":
    main()
