#!/usr/bin/env python3
"""Execute the v8 live verifier and preserve its substantive case accounting."""
from __future__ import annotations
import hashlib, json, os, pathlib, subprocess, sys

ROOT = pathlib.Path("/Users/jaredsmacbookair/Documents/PuppetMaster/Plans/.audits/audit-20260710-005-plan-assurance-model-lanes-fresh-agent-exhaustive")
HERE = pathlib.Path(__file__).resolve().parent
PYTHON = pathlib.Path("/Users/jaredsmacbookair/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3")
SITE = ROOT / "master/dependencies/jsonschema-draft202012-v1/site-packages"

def main() -> None:
    env = {"PATH": str(PYTHON.parent) + os.pathsep + os.environ.get("PATH", ""), "PYTHONPATH": str(SITE), "PYTHONNOUSERSITE": "1", "PYTHONDONTWRITEBYTECODE": "1", "PYTHONHASHSEED": "0"}
    proc = subprocess.run([str(PYTHON), "-S", "-B", str(HERE / "verify_binding_v8.py")], cwd=ROOT, env=env, capture_output=True, text=True, check=False)
    try: verified = json.loads(proc.stdout)
    except Exception: verified = {"status": "unparseable", "stdout": proc.stdout[-2000:]}
    checks = {
        "verifier_exit_zero": proc.returncode == 0,
        "verifier_status_pass": verified.get("status") == "pass",
        "all_cases_pass": verified.get("tests", {}).get("failed") == 0,
        "minimum_600_cases": verified.get("tests", {}).get("total", 0) >= 600,
        "complete_v2_suite": verified.get("tests", {}).get("substantive_v2_cases") == 437,
        "all_12_bypasses_rejected": verified.get("v2_suite", {}).get("bypasses", {}).get("rejected") == 12,
        "all_100_schema_fuzz_rejected": verified.get("v2_suite", {}).get("schema_fuzz", {}).get("rejected") == 100,
        "exact_zero_state": verified.get("topology", {}).get("empty_outputs") == 16 and verified.get("zero_state") == {"activation_transactions": 0, "credit": 0, "native_capture_rows": 0, "receipts": 0, "results": 0},
        "launch_still_forbidden": verified.get("activation_authorized") is False and verified.get("launch_authorized") is False,
        "fresh_luna_still_required": verified.get("fresh_luna_validation_required") is True,
    }
    total = verified.get("tests", {}).get("total", 0) + len(checks)
    passed = verified.get("tests", {}).get("passed", 0) + sum(checks.values())
    report = {
        "schema_version": "universal-shadow-certification-validator-runtime-supersession-tests-v8",
        "status": "pass" if all(checks.values()) else "fail_closed",
        "errors": sorted(k for k,v in checks.items() if not v),
        "checks": checks,
        "tests": {"passed": passed, "failed": total-passed, "total": total},
        "verifier_report_sha256": hashlib.sha256(proc.stdout.encode()).hexdigest(),
        "verifier_summary": {k: verified.get(k) for k in ("status", "tests", "topology", "schema_engine", "zero_state")},
        "activation_authorized": False,
        "launch_authorized": False,
        "credit": 0,
    }
    print(json.dumps(report, indent=2, sort_keys=True))
    raise SystemExit(0 if report["status"] == "pass" else 1)

if __name__ == "__main__": main()
