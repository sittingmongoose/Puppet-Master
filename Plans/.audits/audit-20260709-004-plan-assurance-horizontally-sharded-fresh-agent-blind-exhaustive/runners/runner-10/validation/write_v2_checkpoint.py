#!/usr/bin/env python3
"""Write an immutable runner-10 V2 checkpoint and append its hash manifest."""

from __future__ import annotations

import argparse
import datetime as dt
import hashlib
import json
import pathlib
import subprocess
from collections import Counter


AUDIT_ID = "audit-20260709-004-plan-assurance-horizontally-sharded-fresh-agent-blind-exhaustive"
REPO = pathlib.Path("/Users/jaredsmacbookair/Documents/PuppetMaster")
AUDIT = REPO / "Plans/.audits" / AUDIT_ID
RUNNER = AUDIT / "runners/runner-10"


def read_jsonl(path: pathlib.Path) -> list[dict]:
    if not path.exists():
        return []
    return [json.loads(x) for x in path.read_text().splitlines() if x]


def sha256(path: pathlib.Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--note", required=True)
    args = parser.parse_args()

    assignments = read_jsonl(AUDIT / "assignments/runner-10.jsonl")
    registry = read_jsonl(RUNNER / "fresh_agent_assignment_registry.jsonl")
    results = read_jsonl(RUNNER / "result_manifest.jsonl")
    failed = read_jsonl(RUNNER / "failed_attempts.jsonl")
    dispatch_receipts = sorted((RUNNER / "dispatch_receipts").glob("*.json"))
    attempt_receipts = sorted((RUNNER / "attempt_receipts").glob("*.json"))

    validator = AUDIT / "validators/frozen/postrun_validator_v2.py"
    proc = subprocess.run(["python3", str(validator)], stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
    report = json.loads(proc.stdout)
    eligible = [x for x in report["mechanically_eligible_result_receipts"] if x.get("runner_id") == "runner-10"]
    quarantine = [x for x in report["quarantine_candidates"] if x.get("runner_id") == "runner-10"]

    instance_counts = Counter(x.get("agent_instance_id") for x in registry if x.get("agent_instance_id"))
    path_counts = Counter(x.get("agent_path") for x in registry if x.get("agent_path"))
    thread_counts = Counter(x.get("agent_thread_id") for x in registry if x.get("agent_thread_id"))
    now = dt.datetime.now(dt.timezone.utc)
    created = dt.datetime.fromisoformat("2026-07-10T03:10:05+00:00")
    payload = {
        "checkpoint_schema": "a004.runner_checkpoint.v2",
        "audit_id": AUDIT_ID,
        "runner_id": "runner-10",
        "runner_thread_id": "019f49e2-18cb-7101-b7cb-0027862d9fcb",
        "status": "dispatching",
        "note": args.note,
        "recorded_at": now.isoformat().replace("+00:00", "Z"),
        "elapsed_time_seconds": int((now - created).total_seconds()),
        "assignments_total": len(assignments),
        "registry_records": len(registry),
        "unique_assignment_ids_dispatched": len({x.get("assignment_id") for x in registry}),
        "result_manifest_records": len(results),
        "failed_attempt_records": len(failed),
        "immutable_prelaunch_dispatch_receipts": len(dispatch_receipts),
        "immutable_completed_attempt_receipts": len(attempt_receipts),
        "unique_agents_recorded": len(path_counts),
        "duplicate_agent_instance_ids": sum(1 for n in instance_counts.values() if n > 1),
        "duplicate_agent_paths": sum(1 for n in path_counts.values() if n > 1),
        "duplicate_agent_thread_ids": sum(1 for n in thread_counts.values() if n > 1),
        "cumulative_capsule_package_bytes_attempted": sum(int(x.get("capsule_package_bytes") or 0) for x in registry),
        "cumulative_token_estimate_attempted": sum(int(x.get("token_estimate") or 0) for x in registry),
        "frozen_postrun_validator_v2_exit": proc.returncode,
        "frozen_postrun_validator_v2_global_status": report["status"],
        "frozen_v2_runner_validated_results": report["per_runner"]["runner-10"]["validated_results"],
        "frozen_v2_runner_credited_assignment_ids": sorted(x["assignment_id"] for x in eligible),
        "frozen_v2_runner_quarantine_candidates": quarantine,
        "unresolved_infrastructure_issues": [
            "Frozen V2 counts every result_manifest row for an assignment and therefore cannot credit a later valid retry while preserving an earlier rejected positive row; prior rows remain immutable under authority."
        ] if any(sum(1 for row in results if row.get("assignment_id") == aid) > 1 for aid in {row.get("assignment_id") for row in results}) else [],
    }
    out_dir = RUNNER / "checkpoints"
    out_dir.mkdir(parents=True, exist_ok=True)
    sequence = 1 + len(list(out_dir.glob("checkpoint-*.json")))
    out = out_dir / f"checkpoint-{sequence:04d}.json"
    with out.open("x") as handle:
        handle.write(json.dumps(payload, indent=2, sort_keys=True) + "\n")
    manifest_row = {
        "checkpoint_ref": str(out.relative_to(REPO)),
        "checkpoint_sha256": sha256(out),
        "sequence": sequence,
        "recorded_at": payload["recorded_at"],
    }
    with (RUNNER / "checkpoint_manifest.jsonl").open("a") as handle:
        handle.write(json.dumps(manifest_row, sort_keys=True, separators=(",", ":")) + "\n")
    print(json.dumps({**manifest_row, "payload": payload}, sort_keys=True))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
