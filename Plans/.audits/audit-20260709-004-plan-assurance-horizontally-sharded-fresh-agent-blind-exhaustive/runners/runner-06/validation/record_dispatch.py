#!/usr/bin/env python3
import argparse
import json
from pathlib import Path

AUDIT_ID = "audit-20260709-004-plan-assurance-horizontally-sharded-fresh-agent-blind-exhaustive"
AUDIT = Path("Plans/.audits") / AUDIT_ID
BASE = AUDIT / "runners/runner-06"
ASSIGNMENTS = AUDIT / "assignments/runner-06.jsonl"
REGISTRY = BASE / "fresh_agent_assignment_registry.jsonl"


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--assignment-id", required=True)
    parser.add_argument("--attempt", required=True, type=int)
    parser.add_argument("--agent-instance-id", required=True)
    parser.add_argument("--agent-path", required=True)
    parser.add_argument("--created-at", required=True)
    args = parser.parse_args()

    rows = [json.loads(line) for line in ASSIGNMENTS.read_text().splitlines() if line.strip()]
    row = next((item for item in rows if item["assignment_id"] == args.assignment_id), None)
    if row is None:
        raise SystemExit("assignment is not allocated to runner-06")
    capsule = json.loads(Path(row["capsule_ref"]).read_text())
    existing = [json.loads(line) for line in REGISTRY.read_text().splitlines() if line.strip()] if REGISTRY.exists() else []
    if any(item["agent_instance_id"] == args.agent_instance_id or item["agent_path"] == args.agent_path for item in existing):
        raise SystemExit("duplicate agent identity")
    if any(item["assignment_id"] == args.assignment_id and item["attempt"] == args.attempt for item in existing):
        raise SystemExit("duplicate assignment attempt")

    result_ref = BASE / "raw_results" / f"{args.assignment_id}.json"
    record = {
        "assignment_id": row["assignment_id"],
        "attempt": args.attempt,
        "runner_id": "runner-06",
        "agent_instance_id": args.agent_instance_id,
        "agent_path": args.agent_path,
        "agent_thread_id": args.agent_path,
        "agent_thread_id_kind": "native_collaboration_canonical_path",
        "model": row["required_model"],
        "reasoning_effort": row["required_reasoning_effort"],
        "role": row["role"],
        "window_id": row["window_id"],
        "doc_id": row["doc_id"],
        "document_path": row["document_path"],
        "core_range": row["core_range"],
        "overlap_ranges": capsule.get("context_ranges", []),
        "source_sha256": row["source_sha256"],
        "capsule_ref": row["capsule_ref"],
        "capsule_sha256": row["capsule_sha256"],
        "capsule_bytes": row["capsule_bytes"],
        "source_excerpt_ref": row["source_excerpt_ref"],
        "source_excerpt_sha256": row["source_excerpt_sha256"],
        "source_excerpt_bytes": row["source_excerpt_bytes"],
        "capsule_package_bytes": row["capsule_package_bytes"],
        "token_estimate": row["token_estimate"],
        "created_at": args.created_at,
        "completed_at": None,
        "prior_substantive_assignment_count": 0,
        "terminal_after_result": True,
        "result_ref": str(result_ref),
        "result_sha256": None,
        "no_followup_reuse": True,
        "state": "dispatched",
        "coverage_credit": 0,
    }
    with REGISTRY.open("a") as handle:
        handle.write(json.dumps(record, separators=(",", ":"), sort_keys=True) + "\n")
    print(json.dumps(record, sort_keys=True))


if __name__ == "__main__":
    main()
