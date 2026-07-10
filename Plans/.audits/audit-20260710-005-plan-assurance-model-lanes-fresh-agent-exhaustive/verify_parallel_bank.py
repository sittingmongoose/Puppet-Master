#!/usr/bin/env python3
"""Verify a second 24-worker bank can join a receipt-bound companion bank."""

from __future__ import annotations

import argparse
import hashlib
import json
import subprocess
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parent
AUDIT_ID = ROOT.name


def sha(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def obj(path: Path) -> dict[str, Any]:
    value = json.loads(path.read_bytes())
    if not isinstance(value, dict):
        raise RuntimeError(f"object required: {path}")
    return value


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--bank-id", required=True)
    args = parser.parse_args()
    errors: list[str] = []

    def check(condition: bool, message: str) -> None:
        if not condition:
            errors.append(message)

    authority_path = ROOT / "master/parallel_banks" / args.bank_id / "parallel_bank_authority.json"
    authority = obj(authority_path)
    epoch_id = authority.get("epoch_id")
    epoch = ROOT / "master/frozen" / str(epoch_id)
    policy = obj(epoch / "protocols/wave_policy.json")
    architecture = obj(epoch / "architecture.json")
    companion_path = ROOT / str(authority.get("companion_authority_ref"))
    companion = obj(companion_path)
    check(authority.get("audit_id") == AUDIT_ID, "authority audit mismatch")
    check(authority.get("status") == "PREPARED_WAITING_COMPANION_RECEIPTS_ZERO_CREDIT", "authority status mismatch")
    check(policy.get("global_semantic_concurrency_max") == 48 and architecture.get("global_semantic_concurrency_max") == 48, "48-worker policy mismatch")
    check(policy.get("concurrent_wave_cohort_max") == 6 and policy.get("cohort_wave_size") == 8, "six-cohort policy mismatch")
    check(companion_path.is_file() and sha(companion_path.read_bytes()) == authority.get("companion_authority_sha256"), "companion authority closure mismatch")
    companion_ids = authority.get("companion_assignment_ids", [])
    bank_ids = authority.get("bank_assignment_ids", [])
    check(companion_ids == companion.get("extension_assignment_ids"), "companion assignment mismatch")
    check(len(companion_ids) == len(set(companion_ids)) == 24, "companion assignment cardinality")
    check(len(bank_ids) == len(set(bank_ids)) == 24, "bank assignment cardinality")
    check(not set(companion_ids) & set(bank_ids), "companion/bank assignment overlap")
    union = companion_ids + bank_ids
    check(sha(json.dumps(union, separators=(",", ":")).encode()) == authority.get("combined_assignment_ids_digest"), "combined digest mismatch")

    receipts = []
    for cohort in companion.get("cohorts", []):
        wave = cohort.get("wave_id")
        for assignment in cohort.get("assignment_ids", []):
            receipts.extend((ROOT / "master/dispatch" / str(wave) / str(assignment)).glob("*/dispatch_receipt.json"))
    check(len(receipts) == 24, f"companion receipt count is {len(receipts)}, expected 24")

    registry = obj(sorted((ROOT / "master/live").glob("credited_assignments.snapshot-*.json"))[-1])
    coverage = obj(sorted((ROOT / "master/live").glob("coverage_state.snapshot-*.json"))[-1])
    credited = set(registry.get("credited_assignment_ids", []))
    check(coverage.get("substantive_coverage_credit") >= authority.get("coverage_floor", -1), "coverage regressed")
    check(not credited & set(bank_ids), "bank contains already credited assignment")

    cohort_reports: list[dict[str, Any]] = []
    aggregate: list[str] = []
    cohorts = authority.get("cohorts", [])
    check(isinstance(cohorts, list) and len(cohorts) == 3, "bank cohort envelope mismatch")
    for cohort in cohorts if isinstance(cohorts, list) else []:
        wave_id = cohort.get("wave_id")
        wave_authority = ROOT / str(cohort.get("wave_authority_ref"))
        wave_manifest = ROOT / str(cohort.get("wave_manifest_ref"))
        check(wave_authority.is_file() and sha(wave_authority.read_bytes()) == cohort.get("wave_authority_sha256"), f"{wave_id}: authority closure mismatch")
        check(wave_manifest.is_file() and sha(wave_manifest.read_bytes()) == cohort.get("wave_manifest_sha256"), f"{wave_id}: manifest closure mismatch")
        process = subprocess.run(["python3", "verify_wave_packet.py", "--epoch", str(epoch_id), "--wave-id", str(wave_id)], cwd=ROOT, check=False, capture_output=True, text=True)
        try:
            report = json.loads(process.stdout)
        except Exception:
            report = {"status": "fail", "errors": ["invalid checker output"]}
        check(process.returncode == 0 and report.get("status") == "pass", f"{wave_id}: wave checker failed")
        cohort_reports.append({"wave_id": wave_id, "status": report.get("status"), "errors": report.get("errors", [])})
        ids = cohort.get("assignment_ids", [])
        check(len(ids) == 8, f"{wave_id}: cohort cardinality")
        aggregate.extend(ids)
    check(aggregate == bank_ids, "bank aggregate order mismatch")
    leak_root = ROOT.parents[2] / "master/dispatch"
    check(not [path for path in leak_root.glob("**/*") if path.is_file()] if leak_root.exists() else True, "repo-root dispatch leak")

    report = {
        "audit_id": AUDIT_ID,
        "checker": "parallel_capacity_bank_pre_dispatch_v1",
        "parallel_bank_id": args.bank_id,
        "epoch_id": epoch_id,
        "status": "pass" if not errors else "fail",
        "companion_receipt_count": len(receipts),
        "companion_assignment_count": len(companion_ids),
        "bank_assignment_count": len(bank_ids),
        "combined_assignment_count": len(union),
        "bank_cohort_count": len(cohorts) if isinstance(cohorts, list) else 0,
        "error_count": len(errors),
        "errors": errors,
        "cohort_reports": cohort_reports,
    }
    print(json.dumps(report, indent=2, sort_keys=True))
    raise SystemExit(0 if not errors else 1)


if __name__ == "__main__":
    main()
