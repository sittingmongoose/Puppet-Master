#!/usr/bin/env python3
import json
import os
import subprocess
import time
from pathlib import Path


ROOT = Path(__file__).resolve().parents[3]
AUDIT_DIR = Path(__file__).resolve().parent
LEDGER_ID = "pldg-20260616-002-orchestrator-goal-runtime-flow"
PYDEPS = ROOT / "Plans" / ".audits" / "audit-20260616-008-orchestrator-goal-runtime-flow-post-repair" / ".pydeps"


COMMANDS = [
    {
        "name": "bootstrap_ledger_validate",
        "argv": ["python3", "scripts/pm-bootstrap-ledger-validate.py", f"Plans/ledgers/v2/{LEDGER_ID}"],
        "needs_yaml": True,
    },
    {"name": "pm_plan_index_validate", "argv": ["python3", "scripts/pm-plan-index.py", "validate"], "needs_yaml": True},
    {
        "name": "pm_plan_migration_validate",
        "argv": [
            "python3",
            "scripts/pm-plan-migration.py",
            "validate",
            "--run-dir",
            "Plans/.plan_migration/pds-20260611-002-atomize-planunits",
        ],
        "needs_yaml": True,
    },
    {"name": "run_gates", "argv": ["python3", "scripts/pm-plans-verify.py", "run-gates"]},
    {"name": "shard_check", "argv": ["python3", "scripts/pm-shard-plans.py", "--check"]},
    {"name": "validate_auto_decisions", "argv": ["python3", "scripts/pm-plans-verify.py", "validate-auto-decisions"]},
    {"name": "verify_spec_lock", "argv": ["python3", "scripts/pm-plans-verify.py", "verify-spec-lock"]},
    {"name": "validate_evidence", "argv": ["python3", "scripts/pm-plans-verify.py", "validate-evidence"]},
    {"name": "git_diff_check", "argv": ["git", "diff", "--check"]},
]


def git_status():
    return subprocess.run(["git", "status", "--short"], cwd=ROOT, text=True, capture_output=True).stdout.splitlines()


def run_command(spec):
    env = os.environ.copy()
    used_pythonpath = None
    if spec.get("needs_yaml"):
        used_pythonpath = str(PYDEPS)
        env["PYTHONPATH"] = used_pythonpath
    before = git_status()
    start = time.time()
    proc = subprocess.run(spec["argv"], cwd=ROOT, text=True, capture_output=True, env=env)
    after = git_status()
    return {
        "name": spec["name"],
        "argv": spec["argv"],
        "used_pythonpath": used_pythonpath,
        "exit_code": proc.returncode,
        "duration_seconds": round(time.time() - start, 3),
        "stdout": proc.stdout,
        "stderr": proc.stderr,
        "git_status_before": before,
        "git_status_after": after,
        "mutated_worktree": before != after,
        "status": "pass" if proc.returncode == 0 else "fail",
    }


def main():
    AUDIT_DIR.mkdir(parents=True, exist_ok=True)
    results = [run_command(spec) for spec in COMMANDS]
    all_passed = all(row["status"] == "pass" for row in results)
    mutated = any(row["mutated_worktree"] for row in results)
    payload = {
        "schema_id": "pm.audit.validator_results.v1",
        "audit_id": AUDIT_DIR.name,
        "ledger_id": LEDGER_ID,
        "pyyaml_dependency": {
            "source": str(PYDEPS.relative_to(ROOT)),
            "reason": "Local python3 lacks yaml; YAML-dependent validators ran with this committed audit dependency on PYTHONPATH.",
        },
        "commands": results,
        "summary": {
            "total": len(results),
            "passed": sum(1 for row in results if row["status"] == "pass"),
            "failed": sum(1 for row in results if row["status"] != "pass"),
            "mutated_worktree_count": sum(1 for row in results if row["mutated_worktree"]),
        },
        "status": "pass" if all_passed and not mutated else "pass_with_warnings" if all_passed else "fail",
    }
    with (AUDIT_DIR / "validator_results.json").open("w") as f:
        json.dump(payload, f, indent=2, sort_keys=True)
        f.write("\n")


if __name__ == "__main__":
    main()
