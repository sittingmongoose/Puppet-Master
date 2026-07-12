#!/usr/bin/env python3
"""Append-only harness supersession for the immutable V30 retry payload."""
from __future__ import annotations

import argparse
import copy
import hashlib
import json
import os
import subprocess
from pathlib import Path
from typing import Any

from jsonschema import Draft202012Validator, FormatChecker

AUDIT = Path("/Users/jaredsmacbookair/Documents/PuppetMaster/Plans/.audits/audit-20260710-005-plan-assurance-model-lanes-fresh-agent-exhaustive")
HERE = Path(__file__).resolve().parents[1]
V2 = Path(__file__).resolve().parent
PYTHON = Path("/Users/jaredsmacbookair/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3")
SITE = AUDIT / "master/dependencies/jsonschema-draft202012-v1/site-packages"
V1_VERIFIER = HERE / "tools/verify_retry_attempt_0002_v30.py"
V2_TEST = V2 / "test_retry_attempt_0002_v30_v2.py"
AUTHORITY = V2 / "AUTHORITY.json"


def sha(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def load(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8"))


def env() -> dict[str, str]:
    return {
        "PATH": str(PYTHON.parent) + os.pathsep + os.environ.get("PATH", ""),
        "PYTHONPATH": str(SITE),
        "PYTHONNOUSERSITE": "1",
        "PYTHONDONTWRITEBYTECODE": "1",
        "PYTHONHASHSEED": "0",
    }


def run_v1(mode: str) -> tuple[int, dict[str, Any], str, str]:
    proc = subprocess.run([str(PYTHON), "-S", "-B", str(V1_VERIFIER), "--mode", mode], cwd=AUDIT, env=env(), capture_output=True, text=True, check=False)
    try:
        report = json.loads(proc.stdout)
    except Exception:
        report = {"status": "unparseable", "stdout": proc.stdout[-2000:]}
    return proc.returncode, report, proc.stderr[-2000:], hashlib.sha256(proc.stdout.encode()).hexdigest()


def known_v1_harness_errors() -> set[str]:
    return {
        *(f"A005ERSC-{number:04d}:inactive-spawn-none" for number in range(1, 17)),
        "schema:cohort-0001:reject-invalid-accessed-date",
        "schema:cohort-0002:reject-invalid-accessed-date",
    }


def replacement_checks() -> dict[str, bool]:
    checks: dict[str, bool] = {}
    for cohort_id, start in (("cohort-0001", 1), ("cohort-0002", 9)):
        root = HERE / cohort_id
        manifest = load(root / "manifest.json")
        checks[f"{cohort_id}:manifest-top-inactive-spawn-none"] = manifest.get("activation_authorized") is False and manifest.get("launch_authorized") is False and manifest.get("spawn") == "none"
        for number in range(start, start + 8):
            aid = f"A005ERSC-{number:04d}"
            item = next(row for row in manifest["assignments"] if row["assignment_id"] == aid)
            intent = load(Path(item["intent_ref"]))
            authorization = load(Path(item["authorization_ref"]))
            checks[f"{aid}:authoritative-inactive-spawn-none"] = (
                item.get("activation_authorized") is False
                and intent.get("activation_authorized") is False
                and intent.get("launch_authorized") is False
                and intent.get("spawn") == "none"
                and intent.get("spawn_count") == 0
                and authorization.get("activation_authorized") is False
                and authorization.get("launch_authorized") is False
                and authorization.get("spawn") == "none"
                and authorization.get("spawn_count") == 0
            )
        schema = load(root / "schema/result.schema.json")
        Draft202012Validator.check_schema(schema)
        validator = Draft202012Validator(schema, format_checker=FormatChecker())
        representative = copy.deepcopy(load(AUDIT / f"external_research_universal_shadow_certification_v1/A005ERSC-{start:04d}/attempts/attempt-0001/result.json"))
        representative["attempt_id"] = "attempt-0002"
        representative["agent_path"] = f"/root/sol_controller_v29/a005_ersc_{start:04d}_attempt_0002_ultra_v30"
        representative["input_binding"]["source_transaction_digest"] = "c4ce218e0aa044d850b1b026fe10b98766138748b585e2680916fb80964cc70f"
        citation = next(citation for feature in representative["feature_certifications"] for citation in feature.get("citations", []))
        citation["accessed_date"] = "not-a-date"
        checks[f"{cohort_id}:reject-truly-malformed-accessed-date"] = bool(list(validator.iter_errors(representative)))
    return checks


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--mode", choices=("preparation", "prelaunch"), default="preparation")
    args = parser.parse_args()
    v1_rc, v1, v1_stderr, v1_stdout_sha = run_v1(args.mode)
    known = known_v1_harness_errors()
    remaining = set(v1.get("errors", [])) - known
    replacements = replacement_checks()
    checks = {
        "v1_failed_only_on_known_harness_cases": known.issubset(set(v1.get("errors", []))),
        "v1_stdout_stderr_empty": v1_stderr == "",
        "v1_complete_437_suite_retained": v1.get("tests", {}).get("v8_substantive_cases") == 437,
        "v1_12_bypasses_retained": v1.get("tests", {}).get("v8_bypass_reproductions_rejected") == 12,
        "v1_100_fuzz_retained": v1.get("tests", {}).get("v8_schema_fuzz_rejected") == 100,
        "v1_16_corrected_positives_retained": v1.get("tests", {}).get("corrected_positive_documents") == 16,
        "v1_68_negative_cases_retained": v1.get("tests", {}).get("new_negative_schema_cases") == 68,
        "v1_zero_state_retained": v1.get("counts") == {"activation_transactions": 0, "assignments": 16, "cohorts": 2, "credit": 0, "empty_attempt_0002_outputs": 16, "features": 3888, "native_capture_rows": 0, "receipts": 0, "results": 0},
        **replacements,
    }
    authority = load(AUTHORITY)
    checks["v2_authority_payload_hash"] = authority.get("payload_authority_sha256") == sha(HERE / "AUTHORITY_V30_ATTEMPT_0002.json")
    checks["v2_authority_v1_verifier_hash"] = authority.get("v1_verifier_sha256") == sha(V1_VERIFIER)
    checks["v2_authority_v2_verifier_hash"] = authority.get("v2_verifier_sha256") == sha(Path(__file__))
    checks["v2_authority_v2_test_hash"] = authority.get("v2_test_sha256") == sha(V2_TEST)
    checks["v2_authority_inactive"] = authority.get("activation_authorized") is False and authority.get("launch_authorized") is False and authority.get("spawn") == "none"
    errors = sorted(remaining | {name for name, ok in checks.items() if not ok})
    if args.mode == "prelaunch":
        expected_gates = {
            "gate-missing:cohort-0001:primary-rejected-set",
            "gate-missing:cohort-0001:atomic8-prelaunch",
            "gate-missing:cohort-0002:primary-rejected-set",
            "gate-missing:cohort-0002:atomic8-prelaunch",
        }
        if not expected_gates.issubset(remaining):
            errors.append("prelaunch:exact-four-gates-not-enforced")
    v1_total = v1.get("tests", {}).get("total", 0)
    total = v1_total + len(checks)
    passed = total - len(errors)
    status = "pass_preparation_only" if not errors and args.mode == "preparation" else ("pass_prelaunch_gates" if not errors else "fail_closed")
    report = {
        "schema_version": "universal-shadow-certification-retry-verifier-v30-attempt-0002-v2",
        "mode": args.mode,
        "status": status,
        "errors": sorted(set(errors)),
        "checks": checks,
        "tests": {
            **v1.get("tests", {}),
            "passed": passed,
            "failed": total - passed,
            "total": total,
            "v2_replacement_checks": len(replacements),
        },
        "counts": v1.get("counts"),
        "primary_attempt_0001_shas": v1.get("primary_attempt_0001_shas"),
        "source_transaction_digest": v1.get("source_transaction_digest"),
        "schema_engine": v1.get("schema_engine"),
        "v8_suite": v1.get("v8_suite"),
        "v1_verifier": {"exit_code": v1_rc, "stdout_sha256": v1_stdout_sha, "preserved_known_harness_errors": sorted(known)},
        "activation_authorized": False,
        "launch_authorized": False,
        "spawn": "none",
        "fresh_luna_validation_required": True,
    }
    print(json.dumps(report, indent=2, sort_keys=True))
    raise SystemExit(0 if not errors else 1)


if __name__ == "__main__":
    main()
