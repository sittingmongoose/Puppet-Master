#!/usr/bin/env python3
"""Independent pre-dispatch check for a 24-worker extension to a live 24-worker bank."""

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
    parser.add_argument("--extension-id", required=True)
    args = parser.parse_args()
    errors: list[str] = []

    def check(condition: bool, message: str) -> None:
        if not condition:
            errors.append(message)

    authority_path = ROOT / "master/capacity_extensions" / args.extension_id / "capacity_extension_authority.json"
    authority = obj(authority_path)
    epoch_id = authority.get("epoch_id")
    epoch = ROOT / "master/frozen" / str(epoch_id)
    architecture = obj(epoch / "architecture.json")
    policy = obj(epoch / "protocols/wave_policy.json")
    active_path = ROOT / str(authority.get("active_companion_authority_ref"))
    active = obj(active_path)
    check(authority.get("audit_id") == AUDIT_ID, "authority audit mismatch")
    check(authority.get("status") == "PREPARED_UNBOUND_ZERO_CREDIT", "authority state mismatch")
    check(authority.get("global_semantic_concurrency_max") == 48, "authority concurrency mismatch")
    check(authority.get("maximum_concurrent_cohort_count") == 6, "authority cohort cap mismatch")
    check(authority.get("extension_cohort_count") == 3, "extension cohort count mismatch")
    check(authority.get("extension_assignment_count") == 24, "extension assignment count mismatch")
    check(authority.get("active_companion_assignment_count") == 24, "active assignment count mismatch")
    check(authority.get("combined_assignment_count") == 48, "combined assignment count mismatch")
    check(architecture.get("global_semantic_concurrency_max") == 48, "architecture concurrency mismatch")
    check(architecture.get("concurrent_wave_cohort_max") == 6, "architecture cohort cap mismatch")
    check(policy.get("global_semantic_concurrency_max") == 48, "policy concurrency mismatch")
    check(policy.get("concurrent_wave_cohort_max") == 6, "policy cohort cap mismatch")
    check(policy.get("cohort_wave_size") == 8, "policy cohort size mismatch")
    check(active_path.is_file(), "active authority missing")
    if active_path.is_file():
        check(sha(active_path.read_bytes()) == authority.get("active_companion_authority_sha256"), "active authority hash mismatch")
    active_ids = authority.get("active_companion_assignment_ids", [])
    extension_ids = authority.get("extension_assignment_ids", [])
    check(active_ids == active.get("aggregate_assignment_ids"), "active assignment set mismatch")
    check(len(active_ids) == len(set(active_ids)) == 24, "active assignment uniqueness mismatch")
    check(len(extension_ids) == len(set(extension_ids)) == 24, "extension assignment uniqueness mismatch")
    check(not set(active_ids) & set(extension_ids), "active/extension assignment overlap")
    union_ids = active_ids + extension_ids
    check(sha(json.dumps(union_ids, separators=(",", ":")).encode()) == authority.get("combined_assignment_ids_digest"), "combined assignment digest mismatch")

    live_registries = sorted((ROOT / "master/live").glob("credited_assignments.snapshot-*.json"))
    live_coverages = sorted((ROOT / "master/live").glob("coverage_state.snapshot-*.json"))
    registry = obj(live_registries[-1])
    coverage = obj(live_coverages[-1])
    credited = set(registry.get("credited_assignment_ids", []))
    check(coverage.get("substantive_coverage_credit") >= authority.get("coverage_floor", -1), "coverage regressed")
    check(not credited & set(extension_ids), "extension contains already credited assignment")

    active_receipts = []
    for cohort in active.get("cohorts", []):
        wave_id = cohort.get("wave_id")
        for assignment_id in cohort.get("assignment_ids", []):
            active_receipts.extend((ROOT / "master/dispatch" / str(wave_id) / str(assignment_id)).glob("*/dispatch_receipt.json"))
    check(len(active_receipts) == 24, "active receipt count mismatch")

    cohort_reports: list[dict[str, Any]] = []
    aggregate: list[str] = []
    cohorts = authority.get("cohorts", [])
    check(isinstance(cohorts, list) and len(cohorts) == 3, "extension cohort envelope mismatch")
    for cohort in cohorts if isinstance(cohorts, list) else []:
        wave_id = cohort.get("wave_id")
        wave_authority_path = ROOT / str(cohort.get("wave_authority_ref"))
        manifest_path = ROOT / str(cohort.get("wave_manifest_ref"))
        check(wave_authority_path.is_file(), f"{wave_id}: authority missing")
        check(manifest_path.is_file(), f"{wave_id}: manifest missing")
        if wave_authority_path.is_file():
            check(sha(wave_authority_path.read_bytes()) == cohort.get("wave_authority_sha256"), f"{wave_id}: authority hash mismatch")
        if manifest_path.is_file():
            check(sha(manifest_path.read_bytes()) == cohort.get("wave_manifest_sha256"), f"{wave_id}: manifest hash mismatch")
        process = subprocess.run(
            ["python3", "verify_wave_packet.py", "--epoch", str(epoch_id), "--wave-id", str(wave_id)],
            cwd=ROOT,
            check=False,
            capture_output=True,
            text=True,
        )
        try:
            report = json.loads(process.stdout)
        except Exception:
            report = {"status": "fail", "errors": ["wave checker emitted invalid JSON"]}
        check(process.returncode == 0 and report.get("status") == "pass", f"{wave_id}: wave packet checker failed")
        cohort_reports.append({"wave_id": wave_id, "status": report.get("status"), "errors": report.get("errors", [])})
        ids = cohort.get("assignment_ids", [])
        check(len(ids) == 8, f"{wave_id}: cohort assignment cardinality")
        aggregate.extend(ids)
    check(aggregate == extension_ids, "extension aggregate assignment order mismatch")
    check(len(aggregate) == len(set(aggregate)) == 24, "extension aggregate uniqueness mismatch")
    repo_leaks = list((ROOT.parents[2] / "master/dispatch").glob("**/*")) if (ROOT.parents[2] / "master/dispatch").exists() else []
    check(not [path for path in repo_leaks if path.is_file()], "repo-root dispatch leak detected")

    report = {
        "audit_id": AUDIT_ID,
        "checker": "capacity_extension_pre_dispatch_v1",
        "capacity_extension_id": args.extension_id,
        "epoch_id": epoch_id,
        "status": "pass" if not errors else "fail",
        "active_assignment_count": len(active_ids),
        "extension_assignment_count": len(extension_ids),
        "combined_assignment_count": len(active_ids) + len(extension_ids),
        "extension_cohort_count": len(cohorts) if isinstance(cohorts, list) else 0,
        "error_count": len(errors),
        "errors": errors,
        "cohort_reports": cohort_reports,
    }
    print(json.dumps(report, indent=2, sort_keys=True))
    raise SystemExit(0 if not errors else 1)


if __name__ == "__main__":
    main()
