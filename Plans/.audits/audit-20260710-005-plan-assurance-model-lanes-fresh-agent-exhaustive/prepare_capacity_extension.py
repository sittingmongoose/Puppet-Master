#!/usr/bin/env python3
"""Prepare a non-overlapping 24-worker extension under a 48-worker epoch."""

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
        raise RuntimeError(f"refusing existing extension artifact: {path}")
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, indent=2, sort_keys=True) + "\n", encoding="utf-8")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--epoch", required=True)
    parser.add_argument("--extension-id", required=True)
    parser.add_argument("--wave-prefix", required=True)
    parser.add_argument("--document", required=True)
    parser.add_argument("--active-superwave", required=True)
    args = parser.parse_args()

    epoch = ROOT / "master/frozen" / args.epoch
    policy = obj(epoch / "protocols/wave_policy.json")
    architecture = obj(epoch / "architecture.json")
    if policy.get("global_semantic_concurrency_max") != 48:
        raise RuntimeError("capacity extension requires a 48-worker epoch")
    if policy.get("concurrent_wave_cohort_max") != 6 or policy.get("cohort_wave_size") != 8:
        raise RuntimeError("48-worker cohort policy mismatch")
    if architecture.get("global_semantic_concurrency_max") != 48:
        raise RuntimeError("architecture is not 48-worker capable")

    extension_dir = ROOT / "master/capacity_extensions" / args.extension_id
    if extension_dir.exists():
        raise RuntimeError(f"capacity extension already exists: {extension_dir}")
    active_path = ROOT / "master/superwaves" / args.active_superwave / "superwave_authority.json"
    active = obj(active_path)
    active_ids = list(active.get("aggregate_assignment_ids", []))
    if len(active_ids) != 24 or len(active_ids) != len(set(active_ids)):
        raise RuntimeError("active companion superwave must contain 24 unique assignments")
    active_receipts = list((ROOT / "master/dispatch").glob("blind-wave-0005-*/**/dispatch_receipt.json"))
    if len(active_receipts) != 24:
        raise RuntimeError(f"active companion does not have 24 receipts: {len(active_receipts)}")

    registry_paths = sorted((ROOT / "master/live").glob("credited_assignments.snapshot-*.json"))
    coverage_paths = sorted((ROOT / "master/live").glob("coverage_state.snapshot-*.json"))
    if not registry_paths or not coverage_paths:
        raise RuntimeError("missing live coverage state")
    registry_path = registry_paths[-1]
    coverage_path = coverage_paths[-1]
    registry = obj(registry_path)
    coverage = obj(coverage_path)
    credited_ids = set(registry.get("credited_assignment_ids", []))
    if coverage.get("substantive_coverage_credit") != len(credited_ids):
        raise RuntimeError("coverage/registry mismatch")

    manifest_path = epoch / "manifests/assignment_manifest.jsonl"
    rows = [json.loads(line) for line in manifest_path.read_text().splitlines() if line.strip()]
    excluded = set(active_ids) | credited_ids
    priority_indexes = [
        index for index, row in enumerate(rows)
        if row["document_path"] == args.document and row["assignment_id"] not in excluded
    ]
    selected = [rows[index] for index in priority_indexes[:24]]
    if len(selected) < 24:
        start = priority_indexes[-1] + 1 if priority_indexes else 0
        rotated = rows[start:] + rows[:start]
        selected_ids = {row["assignment_id"] for row in selected}
        spill = [
            row for row in rotated
            if row["assignment_id"] not in excluded
            and row["assignment_id"] not in selected_ids
            and row["document_path"] != args.document
        ]
        selected.extend(spill[:24 - len(selected)])
    if len(selected) != 24:
        raise RuntimeError(f"expected 24 extension assignments, found {len(selected)}")
    assignment_ids = [row["assignment_id"] for row in selected]
    if len(assignment_ids) != len(set(assignment_ids)) or set(assignment_ids) & set(active_ids):
        raise RuntimeError("duplicate or active/extension assignment overlap")

    cohort_ids = [f"{args.wave_prefix}{suffix}" for suffix in ("a", "b", "c")]
    cohorts: list[dict[str, Any]] = []
    for index, cohort_id in enumerate(cohort_ids):
        cohort_assignments = assignment_ids[index * 8:(index + 1) * 8]
        cohort_rows = selected[index * 8:(index + 1) * 8]
        cohort_documents = sorted({row["document_path"] for row in cohort_rows})
        command = [
            sys.executable,
            str(ROOT / "prepare_wave.py"),
            "--epoch", args.epoch,
            "--wave-id", cohort_id,
            "--supersedes-wave", args.active_superwave,
        ]
        if len(cohort_documents) == 1:
            command.extend(["--document", cohort_documents[0]])
        for assignment_id in cohort_assignments:
            command.extend(["--assignment-id", assignment_id])
        process = subprocess.run(command, cwd=ROOT, check=False, capture_output=True, text=True)
        if process.returncode != 0:
            raise RuntimeError(f"cohort preparation failed for {cohort_id}: {process.stdout} {process.stderr}")
        wave_dir = ROOT / "master/waves" / cohort_id
        authority_path = wave_dir / "wave_authority.json"
        cohort_manifest = wave_dir / "wave_assignment_manifest.jsonl"
        cohorts.append({
            "cohort_index": index + 1,
            "wave_id": cohort_id,
            "assignment_ids": cohort_assignments,
            "assignment_count": 8,
            "document_paths": cohort_documents,
            "wave_authority_ref": str(authority_path.relative_to(ROOT)),
            "wave_authority_sha256": sha(authority_path.read_bytes()),
            "wave_manifest_ref": str(cohort_manifest.relative_to(ROOT)),
            "wave_manifest_sha256": sha(cohort_manifest.read_bytes()),
        })

    union_ids = active_ids + assignment_ids
    authority = {
        "audit_id": AUDIT_ID,
        "schema_version": "concurrent-capacity-extension-v1",
        "capacity_extension_id": args.extension_id,
        "epoch_id": args.epoch,
        "attempt_id": f"attempt-{int(args.epoch.rsplit('-', 1)[1]):04d}",
        "status": "PREPARED_UNBOUND_ZERO_CREDIT",
        "controller_lane_thread_id": SOL_LANE_THREAD_ID,
        "document_focus": args.document,
        "coverage_floor": coverage["substantive_coverage_credit"],
        "credited_assignment_ids_digest": registry["credited_assignment_ids_digest"],
        "global_semantic_concurrency_max": 48,
        "maximum_concurrent_cohort_count": 6,
        "cohort_wave_size": 8,
        "active_companion_superwave_id": args.active_superwave,
        "active_companion_authority_ref": str(active_path.relative_to(ROOT)),
        "active_companion_authority_sha256": sha(active_path.read_bytes()),
        "active_companion_assignment_count": 24,
        "active_companion_assignment_ids": active_ids,
        "active_companion_receipt_count": 24,
        "extension_cohort_count": 3,
        "extension_assignment_count": 24,
        "extension_assignment_ids": assignment_ids,
        "combined_assignment_count": 48,
        "combined_assignment_ids_digest": sha(json.dumps(union_ids, separators=(",", ":")).encode()),
        "cohorts": cohorts,
        "fresh_cohort_dispatcher_required_per_cohort": True,
        "fresh_leaf_subagent_required_per_assignment": True,
        "cohort_checkpoint_independent": True,
        "active_extension_overlap_forbidden": True,
        "canonical_plan_writes_authorized": False,
        "coverage_credit_before_validation": 0,
        "preparer_sha256": sha(Path(__file__).read_bytes()),
        "independent_checker_sha256": sha((ROOT / "verify_capacity_extension.py").read_bytes()),
    }
    write(extension_dir / "capacity_extension_authority.json", authority)
    print(json.dumps({
        "status": "prepared_unbound_zero_credit",
        "capacity_extension_id": args.extension_id,
        "epoch_id": args.epoch,
        "coverage_floor": coverage["substantive_coverage_credit"],
        "active_assignment_count": 24,
        "extension_assignment_count": 24,
        "combined_assignment_count": 48,
        "cohort_wave_ids": cohort_ids,
        "authority_sha256": sha((extension_dir / "capacity_extension_authority.json").read_bytes()),
    }, indent=2, sort_keys=True))


if __name__ == "__main__":
    main()
