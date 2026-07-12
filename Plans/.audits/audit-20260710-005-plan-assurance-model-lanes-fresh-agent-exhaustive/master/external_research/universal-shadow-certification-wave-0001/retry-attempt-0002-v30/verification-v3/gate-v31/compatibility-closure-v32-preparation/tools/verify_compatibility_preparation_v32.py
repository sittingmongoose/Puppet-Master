#!/Users/jaredsmacbookair/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3
"""Read-only verifier for the blocked V32 C1 compatibility preparation."""
from __future__ import annotations

import argparse
import json
import os
import subprocess
from pathlib import Path
from typing import Any

import closure_core_v32 as core


PREP = Path(__file__).resolve().parents[1]
GATE = PREP.parent
AUDIT = Path("/Users/jaredsmacbookair/Documents/PuppetMaster/Plans/.audits/audit-20260710-005-plan-assurance-model-lanes-fresh-agent-exhaustive")
SESSIONS = Path("/Users/jaredsmacbookair/.codex/sessions")
PYTHON = Path("/Users/jaredsmacbookair/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3")
SITE = AUDIT / "master/dependencies/jsonschema-draft202012-v1/site-packages"
BASELINE = AUDIT / "master/external_research/universal-shadow-certification-wave-0001/retry-attempt-0002-v30/verification-v2/test_retry_attempt_0002_v30_v3.py"


def isolated_env() -> dict[str, str]:
    return {
        "HOME": os.environ.get("HOME", "/Users/jaredsmacbookair"),
        "PATH": str(PYTHON.parent) + os.pathsep + "/usr/bin:/bin",
        "PYTHONPATH": str(SITE),
        "PYTHONNOUSERSITE": "1",
        "PYTHONDONTWRITEBYTECODE": "1",
        "PYTHONHASHSEED": "0",
        "LC_ALL": "C",
        "TZ": "UTC",
    }


def run_json(command: list[str], cwd: Path) -> tuple[int, dict[str, Any], str, str]:
    process = subprocess.run(command, cwd=cwd, env=isolated_env(), capture_output=True, check=False)
    try:
        document = json.loads(process.stdout)
    except (UnicodeDecodeError, json.JSONDecodeError):
        document = {"status": "unparseable"}
    return process.returncode, document, core.sha_bytes(process.stdout), process.stderr.decode("utf-8", "replace")[-4000:]


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--run-tests", action="store_true")
    parser.add_argument("--run-baseline", action="store_true")
    args = parser.parse_args()
    errors: list[str] = []

    authority_item, authority = core.load_stable_json(PREP / "AUTHORITY_COMPATIBILITY_V32.json", PREP)
    try:
        evidence = core.verify_live(authority, audit_root=AUDIT, gate_root=GATE, prep_root=PREP, session_root=SESSIONS)
    except core.ClosureError as exc:
        evidence = None
        errors.extend(exc.codes)

    seal_item, seal = core.load_stable_json(PREP / "TOOL_SEAL_V32.json", PREP)
    test_item, tests = core.load_stable_json(PREP / "TEST_EVIDENCE_V32.json", PREP)
    readiness_item, readiness = core.load_stable_json(PREP / "READINESS_BLOCKED_V32.json", PREP)
    terminal_item, terminal = core.load_stable_json(PREP / "TERMINAL_PREPARATION_V32.json", PREP)
    for relative, expected_hash in seal.get("file_hashes", {}).items():
        item = core.stable_regular_read(PREP / relative, PREP)
        if item.sha256 != expected_hash:
            errors.append("tool-seal-drift:" + relative)
    if tests.get("status") != "PASS_PREPARATION_TESTS_PRODUCTION_ZERO" or tests.get("new_compatibility_suite", {}).get("passed") < 300 or tests.get("new_compatibility_suite", {}).get("failed") != 0:
        errors.append("test-evidence")
    if tests.get("preserved_v30_suite", {}).get("passed") != 825 or tests.get("grand_total", {}).get("passed") != 1286:
        errors.append("preserved-or-grand-total")
    errors.extend(core.validate_scope(tests.get("scope", {})))
    if readiness.get("status") != "BLOCKED_PREPARATION_ONLY_FUTURE_CLOSURE_AUTHORITY_ABSENT" or readiness.get("tool_seal_sha256") != seal_item.sha256 or readiness.get("test_evidence_sha256") != test_item.sha256:
        errors.append("readiness-binding")
    errors.extend(core.validate_scope(readiness.get("scope", {})))
    expected_terminal = {
        "authority_sha256": authority_item.sha256,
        "tool_seal_sha256": seal_item.sha256,
        "test_evidence_sha256": test_item.sha256,
        "readiness_blocked_sha256": readiness_item.sha256,
    }
    if terminal.get("status") != "PASS_PREPARATION_ONLY_BLOCKED_NO_CAPTURE_NO_ACTIVATION" or any(terminal.get(key) != value for key, value in expected_terminal.items()):
        errors.append("terminal-binding")
    errors.extend(core.validate_scope(terminal.get("scope", {})))

    new_result = {"run": False, "passed": tests["new_compatibility_suite"]["passed"], "failed": 0, "stdout_sha256": tests["new_compatibility_suite"]["stdout_sha256"]}
    if args.run_tests:
        code, document, stdout_hash, stderr = run_json([str(PYTHON), "-B", str(PREP / "tools/test_compatibility_closure_v32.py")], AUDIT)
        new_result = {"run": True, "passed": document.get("passed"), "failed": document.get("failed"), "stdout_sha256": stdout_hash}
        if code != 0 or stderr or document.get("status") != "pass" or document.get("passed") != 461 or stdout_hash != tests["new_compatibility_suite"]["stdout_sha256"]:
            errors.append("live-new-tests")
    baseline_result = {"run": False, "passed": 825, "failed": 0, "stdout_sha256": tests["preserved_v30_suite"]["stdout_sha256"]}
    if args.run_baseline:
        code, document, stdout_hash, stderr = run_json([str(PYTHON), "-S", "-B", str(BASELINE)], AUDIT)
        baseline_result = {"run": True, "passed": document.get("tests", {}).get("passed"), "failed": document.get("tests", {}).get("failed"), "stdout_sha256": stdout_hash}
        if code != 0 or stderr or document.get("status") != "pass" or document.get("tests", {}).get("passed") != 825 or stdout_hash != tests["preserved_v30_suite"]["stdout_sha256"]:
            errors.append("live-baseline")

    result = {
        "schema_version": "a005-c1-v32-compatibility-preparation-verifier-result-v1",
        "status": "pass_preparation_only_blocked_future_closure_authority_required" if not errors else "fail_closed",
        "errors": sorted(set(errors)),
        "report_sha256": evidence.report.sha256 if evidence else authority["report"]["sha256"],
        "reviewer_native_thread_id": authority["identity"]["reviewer_native_thread_id"],
        "controller_native_thread_id": authority["identity"]["controller_native_thread_id"],
        "failed_v31_writer_invocation_count": 1,
        "v32_writer_invocation_count": 0,
        "tests": {"new": new_result, "preserved_v30": baseline_result, "grand_total_passed": 1286},
        "production_zero": {"capture_present": False, "checkpoint_present": False},
        "blockers": ["future_closure_authority_absent", "fixed_c1_capture_absent", "fixed_c1_checkpoint_absent"],
        "activation_authorized": False,
        "launch_authorized": False,
        "credit": 0,
    }
    print(json.dumps(result, indent=2, sort_keys=True))
    return 0 if not errors else 1


if __name__ == "__main__":
    raise SystemExit(main())
