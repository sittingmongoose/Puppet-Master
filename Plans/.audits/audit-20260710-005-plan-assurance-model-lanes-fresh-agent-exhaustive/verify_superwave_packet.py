#!/usr/bin/env python3
"""Independent aggregate pre-dispatch checker for an Audit 005 full concurrency bank."""

from __future__ import annotations

import argparse
import hashlib
import json
import subprocess
import sys
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parent
AUDIT_ID = ROOT.name


def sha(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def obj(path: Path) -> dict[str, Any]:
    value = json.loads(path.read_bytes())
    if not isinstance(value, dict):
        raise ValueError(f"object required: {path}")
    return value


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--superwave-id", required=True)
    args = parser.parse_args()
    errors: list[str] = []

    def check(condition: bool, message: str) -> None:
        if not condition:
            errors.append(message)

    authority_path = ROOT / "master/superwaves" / args.superwave_id / "superwave_authority.json"
    try:
        authority = obj(authority_path)
        epoch_id = authority["epoch_id"]
        epoch = ROOT / "master/frozen" / epoch_id
        policy = obj(epoch / "protocols/wave_policy.json")
        architecture = obj(epoch / "architecture.json")
        registry = obj(sorted((ROOT / "master/live").glob("credited_assignments.snapshot-*.json"))[-1])
        coverage = obj(sorted((ROOT / "master/live").glob("coverage_state.snapshot-*.json"))[-1])
    except Exception as exc:
        print(json.dumps({"status": "fail", "errors": [f"load failure:{type(exc).__name__}:{exc}"]}, indent=2))
        raise SystemExit(1)

    check(authority.get("audit_id") == AUDIT_ID, "authority audit mismatch")
    check(authority.get("schema_version") == "concurrent-superwave-v1", "authority schema mismatch")
    check(authority.get("status") == "PREPARED_UNBOUND_ZERO_CREDIT", "superwave state mismatch")
    worker_count = policy.get("global_semantic_concurrency_max")
    cohort_count = policy.get("concurrent_wave_cohort_max")
    check(worker_count in {24, 48}, "unsupported policy concurrency")
    check(cohort_count == worker_count // 8, "policy cohort/count arithmetic mismatch")
    check(authority.get("global_semantic_concurrency_max") == worker_count, "authority global concurrency mismatch")
    check(authority.get("concurrent_cohort_count") == cohort_count, "authority cohort count mismatch")
    check(authority.get("cohort_wave_size") == 8, "authority cohort size mismatch")
    check(authority.get("aggregate_assignment_count") == worker_count, "authority assignment count mismatch")
    check(authority.get("coverage_credit_before_validation") == 0, "authority grants prevalidation credit")
    check(authority.get("canonical_plan_writes_authorized") is False, "authority permits canonical writes")
    check(policy.get("global_semantic_concurrency_max") == worker_count, "policy global concurrency mismatch")
    check(policy.get("concurrent_wave_cohort_max") == cohort_count, "policy cohort count mismatch")
    check(policy.get("cohort_wave_size") == 8, "policy cohort size mismatch")
    check(architecture.get("global_semantic_concurrency_max") == worker_count, "architecture global concurrency mismatch")
    check(coverage.get("substantive_coverage_credit") == authority.get("coverage_floor"), "coverage floor drift")
    check(registry.get("credited_assignment_ids_digest") == authority.get("credited_assignment_ids_digest"), "credit digest drift")

    aggregate_ids: list[str] = []
    cohort_reports: list[dict[str, Any]] = []
    cohorts = authority.get("cohorts", [])
    check(isinstance(cohorts, list) and len(cohorts) == cohort_count, "cohort envelope mismatch")
    for cohort in cohorts if isinstance(cohorts, list) else []:
        wave_id = cohort.get("wave_id")
        authority_ref = cohort.get("wave_authority_ref")
        manifest_ref = cohort.get("wave_manifest_ref")
        wave_authority_path = ROOT / authority_ref if isinstance(authority_ref, str) else ROOT / "__invalid__"
        wave_manifest_path = ROOT / manifest_ref if isinstance(manifest_ref, str) else ROOT / "__invalid__"
        check(wave_authority_path.is_file(), f"{wave_id}: missing wave authority")
        check(wave_manifest_path.is_file(), f"{wave_id}: missing wave manifest")
        if wave_authority_path.is_file():
            check(sha(wave_authority_path.read_bytes()) == cohort.get("wave_authority_sha256"), f"{wave_id}: authority hash mismatch")
        if wave_manifest_path.is_file():
            check(sha(wave_manifest_path.read_bytes()) == cohort.get("wave_manifest_sha256"), f"{wave_id}: manifest hash mismatch")
        command = [sys.executable, str(ROOT / "verify_wave_packet.py"), "--epoch", epoch_id, "--wave-id", str(wave_id)]
        process = subprocess.run(command, cwd=ROOT, check=False, capture_output=True, text=True)
        try:
            report = json.loads(process.stdout)
        except Exception:
            report = {"status": "fail", "errors": ["unparseable wave checker output"]}
        cohort_reports.append({"wave_id": wave_id, "status": report.get("status"), "errors": report.get("errors", [])})
        check(process.returncode == 0 and report.get("status") == "pass", f"{wave_id}: wave packet checker failed")
        ids = cohort.get("assignment_ids", [])
        check(isinstance(ids, list) and len(ids) == 8, f"{wave_id}: cohort assignment cardinality")
        aggregate_ids.extend(ids if isinstance(ids, list) else [])

    check(len(aggregate_ids) == worker_count, "aggregate assignment cardinality mismatch")
    check(len(aggregate_ids) == len(set(aggregate_ids)), "cross-cohort assignment overlap")
    check(aggregate_ids == authority.get("aggregate_assignment_ids"), "aggregate assignment order mismatch")
    digest = sha(json.dumps(aggregate_ids, separators=(",", ":")).encode())
    check(digest == authority.get("aggregate_assignment_ids_digest"), "aggregate assignment digest mismatch")
    credited = set(registry.get("credited_assignment_ids", []))
    check(not credited.intersection(aggregate_ids), "superwave includes credited assignment")

    report = {
        "audit_id": AUDIT_ID,
        "checker": "concurrent_superwave_pre_dispatch_v1",
        "superwave_id": args.superwave_id,
        "epoch_id": epoch_id,
        "status": "pass" if not errors else "fail",
        "aggregate_assignment_count": len(aggregate_ids),
        "cohort_count": len(cohorts) if isinstance(cohorts, list) else 0,
        "global_semantic_concurrency_max": worker_count,
        "cohort_reports": cohort_reports,
        "error_count": len(errors),
        "errors": errors,
    }
    print(json.dumps(report, indent=2, sort_keys=True))
    raise SystemExit(0 if not errors else 1)


if __name__ == "__main__":
    main()
