#!/usr/bin/env python3
"""Retain 970 V31 cases and add V32 hardening cases."""
from __future__ import annotations

import copy
import hashlib
import importlib.util
import json
import os
import subprocess
from pathlib import Path

AUDIT = Path("/Users/jaredsmacbookair/Documents/PuppetMaster/Plans/.audits/audit-20260710-005-plan-assurance-model-lanes-fresh-agent-exhaustive")
BASE = Path(__file__).resolve().parents[1]
HERE = Path(__file__).resolve().parent
PYTHON = Path("/Users/jaredsmacbookair/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3")
SITE = AUDIT / "master/dependencies/jsonschema-draft202012-v1/site-packages"

spec = importlib.util.spec_from_file_location("late_v32", HERE / "verify_late_cohorts_v32.py")
v32 = importlib.util.module_from_spec(spec)
assert spec and spec.loader
spec.loader.exec_module(v32)


def run_v31() -> tuple[int, dict, str]:
    env = {"PATH": str(PYTHON.parent) + os.pathsep + "/usr/bin:/bin", "PYTHONPATH": str(SITE), "PYTHONNOUSERSITE": "1", "PYTHONDONTWRITEBYTECODE": "1", "PYTHONHASHSEED": "0", "LC_ALL": "C", "TZ": "UTC"}
    proc = subprocess.run([str(PYTHON), "-S", "-B", str(BASE / "test_late_cohorts_v31.py")], cwd=AUDIT, env=env, capture_output=True, text=True, check=False)
    return proc.returncode, json.loads(proc.stdout), proc.stderr


def main() -> None:
    cases: list[tuple[str, bool]] = []
    def case(label: str, passed: bool) -> None:
        cases.append((label, bool(passed)))

    rc, old, stderr = run_v31()
    case("retained-v31-exit", rc == 0 and stderr == "")
    case("retained-v31-970", old.get("status") == "pass" and old.get("tests") == {"failed": 0, "passed": 970, "total": 970})
    hardened = v32.verify_hardened()
    case("positive:hardened-live", hardened.get("status") == "pass_blocked" and hardened.get("errors") == [])
    case("positive:runtime", hardened.get("runtime") == v32.EXPECTED_RUNTIME)
    case("positive:census", not any(hardened.get("actual_zero_state_census", {}).values()))
    root_authority = v32.load(v32.BASE / "IMMUTABLE_AUTHORITY.json")
    case("positive:authority", v32.authority_errors(root_authority) == [])
    for name in sorted(v32.EXPECTED_TOOLS):
        value = copy.deepcopy(root_authority)
        del value["tool_hashes"][name]
        case(f"negative:authority:drop:{name}", bool(v32.authority_errors(value)))
        value = copy.deepcopy(root_authority)
        value["tool_hashes"][name] = "0" * 64
        case(f"negative:authority:hash:{name}", bool(v32.authority_errors(value)))
    value = copy.deepcopy(root_authority); value["tool_hashes"]["foreign.py"] = "0" * 64
    case("negative:authority:foreign-key", bool(v32.authority_errors(value)))
    value = copy.deepcopy(root_authority); value["policy_v31_sha256"] = "0" * 64
    case("negative:authority:policy", bool(v32.authority_errors(value)))
    for cohort_id in ("cohort-0003", "cohort-0004"):
        for row in v32.late.jsonl(v32.late.tx_root(cohort_id) / "transaction_manifest.jsonl"):
            intent = v32.load(Path(row["intent_path"]))
            auth = v32.load(Path(row["authorization_path"]))
            case(f"positive:{row['assignment_id']}:paths", v32.path_binding_errors(intent, auth, row) == [])
            for owner, key in (("intent", "future_result_path"), ("intent", "future_receipt_path"), ("authorization", "future_result_path"), ("authorization", "future_receipt_path")):
                i, a = copy.deepcopy(intent), copy.deepcopy(auth)
                (i if owner == "intent" else a)[key] = "/tmp/forged"
                case(f"negative:{row['assignment_id']}:{owner}:{key}", bool(v32.path_binding_errors(i, a, row)))
    failed = [label for label, passed in cases if not passed]
    added = len(cases)
    labels = [label for label, _ in cases]
    total = 970 + added
    report = {
        "schema_version": "scenario-late-cohorts-v32-tests-v2",
        "status": "pass" if not failed and total >= 1050 else "fail_closed",
        "errors": failed + ([] if total >= 1050 else ["total-below-1050"]),
        "tests": {"retained": 970, "added": added, "passed": 970 + sum(passed for _, passed in cases), "failed": len(failed), "total": total},
        "added_case_digest": hashlib.sha256(("\n".join(labels) + "\n").encode()).hexdigest(),
        "activation": False,
        "launch_authorized": False,
        "spawn": "none",
        "credit": 0,
    }
    print(json.dumps(report, indent=2, sort_keys=True))
    raise SystemExit(0 if report["status"] == "pass" else 1)


if __name__ == "__main__":
    main()
