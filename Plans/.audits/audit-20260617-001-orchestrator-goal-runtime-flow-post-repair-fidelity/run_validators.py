#!/usr/bin/env python3
import json
import os
import subprocess
import time
from pathlib import Path


ROOT = Path(__file__).resolve().parents[3]
AUDIT_DIR = Path(__file__).resolve().parent
PYDEPS = ROOT / "Plans" / ".audits" / "audit-20260616-008-orchestrator-goal-runtime-flow-post-repair" / ".pydeps"


COMMANDS = [
    {
        "name": "bootstrap_ledger_validate",
        "argv": ["python3", "scripts/pm-bootstrap-ledger-validate.py", "Plans/ledgers/v2/pldg-20260616-002-orchestrator-goal-runtime-flow"],
        "needs_yaml": True,
    },
    {
        "name": "pm_plan_index_validate",
        "argv": ["python3", "scripts/pm-plan-index.py", "validate"],
        "needs_yaml": True,
    },
    {
        "name": "pm_plan_migration_validate",
        "argv": ["python3", "scripts/pm-plan-migration.py", "validate", "--run-dir", "Plans/.plan_migration/pds-20260611-002-atomize-planunits"],
        "needs_yaml": True,
    },
    {
        "name": "run_gates",
        "argv": ["python3", "scripts/pm-plans-verify.py", "run-gates"],
        "needs_yaml": False,
    },
    {
        "name": "shard_check",
        "argv": ["python3", "scripts/pm-shard-plans.py", "--check"],
        "needs_yaml": False,
    },
    {
        "name": "validate_auto_decisions",
        "argv": ["python3", "scripts/pm-plans-verify.py", "validate-auto-decisions"],
        "needs_yaml": False,
    },
    {
        "name": "verify_spec_lock",
        "argv": ["python3", "scripts/pm-plans-verify.py", "verify-spec-lock"],
        "needs_yaml": False,
    },
    {
        "name": "validate_evidence",
        "argv": ["python3", "scripts/pm-plans-verify.py", "validate-evidence"],
        "needs_yaml": False,
    },
    {
        "name": "git_diff_check",
        "argv": ["git", "diff", "--check"],
        "needs_yaml": False,
    },
]


def git_status():
    return subprocess.run(["git", "status", "--short"], cwd=ROOT, text=True, capture_output=True).stdout.splitlines()


def run_command(spec):
    env = os.environ.copy()
    if spec.get("needs_yaml"):
        env["PYTHONPATH"] = str(PYDEPS)
    before = git_status()
    start = time.time()
    proc = subprocess.run(spec["argv"], cwd=ROOT, text=True, capture_output=True, env=env)
    duration = round(time.time() - start, 3)
    after = git_status()
    return {
        "name": spec["name"],
        "argv": spec["argv"],
        "used_pythonpath": str(PYDEPS) if spec.get("needs_yaml") else None,
        "exit_code": proc.returncode,
        "duration_seconds": duration,
        "stdout": proc.stdout,
        "stderr": proc.stderr,
        "git_status_before": before,
        "git_status_after": after,
        "mutated_worktree": before != after,
        "status": "pass" if proc.returncode == 0 else "fail",
    }


def main():
    results = [run_command(spec) for spec in COMMANDS]
    payload = {
        "schema_id": "pm.audit.validator_results.v1",
        "audit_id": AUDIT_DIR.name,
        "pyyaml_dependency": {
            "source": str(PYDEPS.relative_to(ROOT)),
            "reason": "Local Python lacks yaml; validators requiring PyYAML were run with this committed audit dependency on PYTHONPATH.",
        },
        "commands": results,
        "summary": {
            "total": len(results),
            "passed": sum(1 for item in results if item["status"] == "pass"),
            "failed": sum(1 for item in results if item["status"] != "pass"),
            "mutated_worktree_count": sum(1 for item in results if item["mutated_worktree"]),
        },
        "status": "pass" if all(item["status"] == "pass" for item in results) and not any(item["mutated_worktree"] for item in results) else "pass_with_warnings" if all(item["status"] == "pass" for item in results) else "fail",
    }
    with (AUDIT_DIR / "validator_results.json").open("w") as f:
        json.dump(payload, f, indent=2, sort_keys=True)
        f.write("\n")


if __name__ == "__main__":
    main()
