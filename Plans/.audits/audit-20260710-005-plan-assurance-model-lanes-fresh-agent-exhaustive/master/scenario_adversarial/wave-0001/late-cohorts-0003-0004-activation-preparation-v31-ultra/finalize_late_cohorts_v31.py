#!/usr/bin/env python3
"""Write the terminal report only after pinned-runtime verification succeeds."""
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


def canonical(value: Any) -> bytes:
    return (json.dumps(value, sort_keys=True, separators=(",", ":"), ensure_ascii=False) + "\n").encode()


def sha(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def run(script: str) -> tuple[int, dict[str, Any], str, str]:
    env = {
        "PATH": str(PYTHON.parent) + os.pathsep + "/usr/bin:/bin",
        "PYTHONPATH": str(SITE),
        "PYTHONNOUSERSITE": "1",
        "PYTHONDONTWRITEBYTECODE": "1",
        "PYTHONHASHSEED": "0",
        "LC_ALL": "C",
        "TZ": "UTC",
    }
    proc = subprocess.run([str(PYTHON), "-S", "-B", str(HERE / script)], cwd=AUDIT, env=env, capture_output=True, text=True, check=False)
    try:
        report = json.loads(proc.stdout)
    except Exception:
        report = {"status": "unparseable", "stdout": proc.stdout[-2000:]}
    return proc.returncode, report, proc.stderr[-2000:], hashlib.sha256(proc.stdout.encode()).hexdigest()


def main() -> None:
    out = HERE / "terminal_preparation_report.json"
    if out.exists():
        raise SystemExit("terminal-report-exists")
    verify_rc, verify, verify_stderr, verify_stdout_sha = run("verify_late_cohorts_v31.py")
    test_rc, tests, test_stderr, test_stdout_sha = run("test_late_cohorts_v31.py")
    errors: list[str] = []
    if verify_rc != 0 or verify.get("status") != "pass_blocked" or verify.get("errors") != [] or verify_stderr:
        errors.append("verifier")
    if test_rc != 0 or tests.get("status") != "pass" or tests.get("errors") != [] or test_stderr:
        errors.append("tests")
    if errors:
        print(json.dumps({"status": "fail_closed", "errors": errors, "verification": verify, "tests": tests}, indent=2, sort_keys=True))
        raise SystemExit(1)
    authority = HERE / "IMMUTABLE_AUTHORITY.json"
    readiness = HERE / "readiness.json"
    value = {
        "schema_version": "scenario-late-cohorts-v31-ultra-terminal-preparation-v1",
        "status": "PASS_BLOCKED_ZERO_LAUNCH",
        "authority_sha256": sha(authority),
        "readiness_sha256": sha(readiness),
        "protected_lineage_inventory_sha256": sha(HERE / "protected_lineage_inventory.jsonl"),
        "zero_state_inventory_sha256": sha(HERE / "zero_state_inventory.json"),
        "verifier_sha256": sha(HERE / "verify_late_cohorts_v31.py"),
        "test_sha256": sha(HERE / "test_late_cohorts_v31.py"),
        "verifier_stdout_sha256": verify_stdout_sha,
        "test_stdout_sha256": test_stdout_sha,
        "verification": verify,
        "tests": tests,
        "activation": False,
        "activation_authorized": False,
        "launch_authorized": False,
        "spawn": "none",
        "credit": 0,
        "fresh_luna_max_prelaunch_required_per_cohort": True,
        "prior_cohorts_cumulative_terminal_checkpoint_required": True,
    }
    fd = os.open(out, os.O_WRONLY | os.O_CREAT | os.O_EXCL, 0o444)
    try:
        os.write(fd, canonical(value))
        os.fsync(fd)
    finally:
        os.close(fd)
    print(json.dumps({"status": value["status"], "terminal_report_sha256": sha(out), "verifier_stdout_sha256": verify_stdout_sha, "test_stdout_sha256": test_stdout_sha, "tests": tests["tests"]}, indent=2, sort_keys=True))


if __name__ == "__main__":
    main()
