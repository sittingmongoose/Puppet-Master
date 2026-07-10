#!/usr/bin/env python3
"""Prepare a full independently checkpointable Audit 005 concurrency bank."""

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
        raise RuntimeError(f"refusing existing superwave artifact: {path}")
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, indent=2, sort_keys=True) + "\n", encoding="utf-8")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--epoch", required=True)
    parser.add_argument("--superwave-id", required=True)
    parser.add_argument("--wave-prefix", required=True)
    parser.add_argument("--document", required=True)
    parser.add_argument("--supersedes-wave", required=True)
    args = parser.parse_args()

    epoch = ROOT / "master/frozen" / args.epoch
    policy = obj(epoch / "protocols/wave_policy.json")
    architecture = obj(epoch / "architecture.json")
    worker_count = policy.get("global_semantic_concurrency_max")
    cohort_count = policy.get("concurrent_wave_cohort_max")
    if worker_count not in {24, 48}:
        raise RuntimeError("superwave requires a 24- or 48-worker epoch")
    if cohort_count != worker_count // 8 or policy.get("cohort_wave_size") != 8:
        raise RuntimeError("superwave cohort policy mismatch")
    if architecture.get("global_semantic_concurrency_max") != worker_count:
        raise RuntimeError("architecture concurrency mismatch")

    superwave_dir = ROOT / "master/superwaves" / args.superwave_id
    if superwave_dir.exists():
        raise RuntimeError(f"superwave already exists: {superwave_dir}")

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
    priority_indexes = [
        index for index, row in enumerate(rows)
        if row["document_path"] == args.document and row["assignment_id"] not in credited_ids
    ]
    selected = [rows[index] for index in priority_indexes[:worker_count]]
    if len(selected) < worker_count:
        start = priority_indexes[-1] + 1 if priority_indexes else 0
        rotated = rows[start:] + rows[:start]
        selected_ids = {row["assignment_id"] for row in selected}
        spill = [
            row for row in rotated
            if row["assignment_id"] not in credited_ids
            and row["assignment_id"] not in selected_ids
            and row["document_path"] != args.document
        ]
        selected.extend(spill[:worker_count - len(selected)])
    if len(selected) != worker_count:
        raise RuntimeError(f"expected {worker_count} uncredited assignments, found {len(selected)}")
    assignment_ids = [row["assignment_id"] for row in selected]
    if len(assignment_ids) != len(set(assignment_ids)):
        raise RuntimeError("duplicate superwave assignment")

    cohort_ids = [f"{args.wave_prefix}{chr(ord('a') + index)}" for index in range(cohort_count)]
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
            "--supersedes-wave", args.supersedes_wave,
        ]
        if len(cohort_documents) == 1:
            command.extend(["--document", cohort_documents[0]])
        for assignment_id in cohort_assignments:
            command.extend(["--assignment-id", assignment_id])
        process = subprocess.run(command, cwd=ROOT, check=False, capture_output=True, text=True)
        if process.returncode != 0:
            raise RuntimeError(f"cohort preparation failed for {cohort_id}: {process.stdout} {process.stderr}")
        report = json.loads(process.stdout)
        wave_dir = ROOT / "master/waves" / cohort_id
        authority_path = wave_dir / "wave_authority.json"
        manifest = wave_dir / "wave_assignment_manifest.jsonl"
        cohorts.append({
            "cohort_index": index + 1,
            "wave_id": cohort_id,
            "assignment_ids": cohort_assignments,
            "assignment_count": 8,
            "document_paths": cohort_documents,
            "wave_authority_ref": str(authority_path.relative_to(ROOT)),
            "wave_authority_sha256": sha(authority_path.read_bytes()),
            "wave_manifest_ref": str(manifest.relative_to(ROOT)),
            "wave_manifest_sha256": sha(manifest.read_bytes()),
            "prepare_report": report,
        })

    canonical_ids = json.dumps(assignment_ids, separators=(",", ":")).encode()
    superwave = {
        "audit_id": AUDIT_ID,
        "schema_version": "concurrent-superwave-v1",
        "superwave_id": args.superwave_id,
        "epoch_id": args.epoch,
        "attempt_id": f"attempt-{int(args.epoch.rsplit('-', 1)[1]):04d}",
        "status": "PREPARED_UNBOUND_ZERO_CREDIT",
        "controller_lane_thread_id": SOL_LANE_THREAD_ID,
        "document_focus": args.document,
        "document_paths": sorted({row["document_path"] for row in selected}),
        "priority_document_assignment_count": sum(row["document_path"] == args.document for row in selected),
        "spillover_assignment_count": sum(row["document_path"] != args.document for row in selected),
        "coverage_floor": coverage["substantive_coverage_credit"],
        "credited_assignment_ids_digest": registry["credited_assignment_ids_digest"],
        "global_semantic_concurrency_max": worker_count,
        "concurrent_cohort_count": cohort_count,
        "cohort_wave_size": 8,
        "aggregate_assignment_count": worker_count,
        "aggregate_assignment_ids": assignment_ids,
        "aggregate_assignment_ids_digest": sha(canonical_ids),
        "cohorts": cohorts,
        "fresh_cohort_dispatcher_required_per_cohort": True,
        "fresh_leaf_subagent_required_per_assignment": True,
        "cohort_checkpoint_independent": True,
        "cross_cohort_assignment_overlap_forbidden": True,
        "canonical_plan_writes_authorized": False,
        "coverage_credit_before_validation": 0,
        "preparer_sha256": sha(Path(__file__).read_bytes()),
        "aggregate_checker_sha256": sha((ROOT / "verify_superwave_packet.py").read_bytes()),
    }
    write(superwave_dir / "superwave_authority.json", superwave)
    print(json.dumps({
        "status": "prepared_unbound_zero_credit",
        "superwave_id": args.superwave_id,
        "epoch_id": args.epoch,
        "coverage_floor": coverage["substantive_coverage_credit"],
        "cohort_wave_ids": cohort_ids,
        "aggregate_assignment_count": worker_count,
        "aggregate_assignment_ids_digest": superwave["aggregate_assignment_ids_digest"],
        "superwave_authority_sha256": sha((superwave_dir / "superwave_authority.json").read_bytes()),
    }, indent=2, sort_keys=True))


if __name__ == "__main__":
    main()
