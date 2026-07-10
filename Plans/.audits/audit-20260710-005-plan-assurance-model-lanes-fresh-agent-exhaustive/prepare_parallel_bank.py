#!/usr/bin/env python3
"""Prepare a second 24-worker bank beside an already authorized 24-worker extension."""

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
SOL_LANE_THREAD_ID = "019f4d26-0708-7c12-aa17-a4b124fab923"


def sha(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def obj(path: Path) -> dict[str, Any]:
    value = json.loads(path.read_bytes())
    if not isinstance(value, dict):
        raise RuntimeError(f"object required: {path}")
    return value


def write(path: Path, value: dict[str, Any]) -> None:
    if path.exists():
        raise RuntimeError(f"refusing existing artifact: {path}")
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, indent=2, sort_keys=True) + "\n", encoding="utf-8")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--epoch", required=True)
    parser.add_argument("--bank-id", required=True)
    parser.add_argument("--wave-prefix", required=True)
    parser.add_argument("--document", required=True)
    parser.add_argument("--companion-extension", required=True)
    args = parser.parse_args()

    epoch = ROOT / "master/frozen" / args.epoch
    policy = obj(epoch / "protocols/wave_policy.json")
    architecture = obj(epoch / "architecture.json")
    if policy.get("global_semantic_concurrency_max") != 48 or policy.get("concurrent_wave_cohort_max") != 6:
        raise RuntimeError("parallel bank requires 48-worker / six-cohort policy")
    if policy.get("cohort_wave_size") != 8 or architecture.get("global_semantic_concurrency_max") != 48:
        raise RuntimeError("parallel bank architecture mismatch")

    bank_dir = ROOT / "master/parallel_banks" / args.bank_id
    if bank_dir.exists():
        raise RuntimeError(f"parallel bank already exists: {bank_dir}")
    companion_path = ROOT / "master/capacity_extensions" / args.companion_extension / "capacity_extension_authority.json"
    companion = obj(companion_path)
    companion_ids = list(companion.get("extension_assignment_ids", []))
    if len(companion_ids) != len(set(companion_ids)) or len(companion_ids) != 24:
        raise RuntimeError("companion extension assignment set invalid")
    companion_master = ROOT / "master/validation" / args.companion_extension / "pre-dispatch-master.json"
    companion_fresh = ROOT / "master/validation" / args.companion_extension / "pre-dispatch-fresh-independent.json"
    if obj(companion_master).get("status") != "pass" or obj(companion_fresh).get("status") != "pass":
        raise RuntimeError("companion extension gates are not pass")

    registry_path = sorted((ROOT / "master/live").glob("credited_assignments.snapshot-*.json"))[-1]
    coverage_path = sorted((ROOT / "master/live").glob("coverage_state.snapshot-*.json"))[-1]
    registry = obj(registry_path)
    coverage = obj(coverage_path)
    credited_ids = set(registry.get("credited_assignment_ids", []))
    if coverage.get("substantive_coverage_credit") != len(credited_ids):
        raise RuntimeError("coverage/registry mismatch")
    excluded = credited_ids | set(companion_ids)

    rows = [json.loads(line) for line in (epoch / "manifests/assignment_manifest.jsonl").read_text().splitlines() if line.strip()]
    priority_indexes = [i for i, row in enumerate(rows) if row["document_path"] == args.document and row["assignment_id"] not in excluded]
    selected = [rows[i] for i in priority_indexes[:24]]
    if len(selected) < 24:
        start = priority_indexes[-1] + 1 if priority_indexes else 0
        rotated = rows[start:] + rows[:start]
        selected_ids = {row["assignment_id"] for row in selected}
        selected.extend([
            row for row in rotated
            if row["assignment_id"] not in excluded
            and row["assignment_id"] not in selected_ids
            and row["document_path"] != args.document
        ][:24 - len(selected)])
    if len(selected) != 24:
        raise RuntimeError("unable to select 24 non-overlapping assignments")
    assignment_ids = [row["assignment_id"] for row in selected]
    if len(assignment_ids) != len(set(assignment_ids)) or set(assignment_ids) & set(companion_ids):
        raise RuntimeError("bank assignment overlap")

    cohort_ids = [f"{args.wave_prefix}{suffix}" for suffix in ("a", "b", "c")]
    cohorts: list[dict[str, Any]] = []
    for index, wave_id in enumerate(cohort_ids):
        cohort_rows = selected[index * 8:(index + 1) * 8]
        cohort_ids_slice = assignment_ids[index * 8:(index + 1) * 8]
        documents = sorted({row["document_path"] for row in cohort_rows})
        command = [sys.executable, str(ROOT / "prepare_wave.py"), "--epoch", args.epoch, "--wave-id", wave_id, "--supersedes-wave", args.companion_extension]
        if len(documents) == 1:
            command.extend(["--document", documents[0]])
        for assignment_id in cohort_ids_slice:
            command.extend(["--assignment-id", assignment_id])
        process = subprocess.run(command, cwd=ROOT, check=False, capture_output=True, text=True)
        if process.returncode != 0:
            raise RuntimeError(f"wave preparation failed:{wave_id}:{process.stdout}:{process.stderr}")
        wave_dir = ROOT / "master/waves" / wave_id
        wave_authority = wave_dir / "wave_authority.json"
        wave_manifest = wave_dir / "wave_assignment_manifest.jsonl"
        cohorts.append({
            "cohort_index": index + 1,
            "wave_id": wave_id,
            "assignment_ids": cohort_ids_slice,
            "assignment_count": 8,
            "document_paths": documents,
            "wave_authority_ref": str(wave_authority.relative_to(ROOT)),
            "wave_authority_sha256": sha(wave_authority.read_bytes()),
            "wave_manifest_ref": str(wave_manifest.relative_to(ROOT)),
            "wave_manifest_sha256": sha(wave_manifest.read_bytes()),
        })

    union = companion_ids + assignment_ids
    authority = {
        "audit_id": AUDIT_ID,
        "schema_version": "parallel-capacity-bank-v1",
        "parallel_bank_id": args.bank_id,
        "epoch_id": args.epoch,
        "attempt_id": f"attempt-{int(args.epoch.rsplit('-', 1)[1]):04d}",
        "status": "PREPARED_WAITING_COMPANION_RECEIPTS_ZERO_CREDIT",
        "controller_lane_thread_id": SOL_LANE_THREAD_ID,
        "coverage_floor": coverage["substantive_coverage_credit"],
        "credited_assignment_ids_digest": registry["credited_assignment_ids_digest"],
        "global_semantic_concurrency_max": 48,
        "maximum_concurrent_cohort_count": 6,
        "cohort_wave_size": 8,
        "companion_extension_id": args.companion_extension,
        "companion_authority_ref": str(companion_path.relative_to(ROOT)),
        "companion_authority_sha256": sha(companion_path.read_bytes()),
        "companion_master_gate_sha256": sha(companion_master.read_bytes()),
        "companion_fresh_gate_sha256": sha(companion_fresh.read_bytes()),
        "companion_assignment_count": 24,
        "companion_assignment_ids": companion_ids,
        "companion_receipts_required_before_dispatch": 24,
        "bank_cohort_count": 3,
        "bank_assignment_count": 24,
        "bank_assignment_ids": assignment_ids,
        "combined_assignment_count": 48,
        "combined_assignment_ids_digest": sha(json.dumps(union, separators=(",", ":")).encode()),
        "cohorts": cohorts,
        "fresh_cohort_dispatcher_required_per_cohort": True,
        "fresh_leaf_subagent_required_per_assignment": True,
        "active_bank_overlap_forbidden": True,
        "canonical_plan_writes_authorized": False,
        "coverage_credit_before_validation": 0,
        "preparer_sha256": sha(Path(__file__).read_bytes()),
        "independent_checker_sha256": sha((ROOT / "verify_parallel_bank.py").read_bytes()),
    }
    write(bank_dir / "parallel_bank_authority.json", authority)
    print(json.dumps({
        "status": "prepared_waiting_companion_receipts_zero_credit",
        "parallel_bank_id": args.bank_id,
        "epoch_id": args.epoch,
        "coverage_floor": authority["coverage_floor"],
        "companion_assignment_count": 24,
        "bank_assignment_count": 24,
        "combined_assignment_count": 48,
        "cohort_wave_ids": cohort_ids,
        "authority_sha256": sha((bank_dir / "parallel_bank_authority.json").read_bytes()),
    }, indent=2, sort_keys=True))


if __name__ == "__main__":
    main()
