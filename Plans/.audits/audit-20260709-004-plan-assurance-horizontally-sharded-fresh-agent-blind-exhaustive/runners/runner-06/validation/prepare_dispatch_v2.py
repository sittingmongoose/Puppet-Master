#!/usr/bin/env python3
import argparse
import hashlib
import json
from pathlib import Path

AUDIT_ID = "audit-20260709-004-plan-assurance-horizontally-sharded-fresh-agent-blind-exhaustive"
AUDIT = Path("Plans/.audits") / AUDIT_ID
BASE = AUDIT / "runners/runner-06"
ASSIGNMENTS = AUDIT / "assignments/runner-06.jsonl"
REGISTRY = BASE / "fresh_agent_assignment_registry.jsonl"


def load_rows(path):
    return [json.loads(line) for line in path.read_text().splitlines() if line.strip()] if path.exists() else []


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--assignment-id", required=True)
    parser.add_argument("--attempt", required=True, type=int)
    parser.add_argument("--agent-instance-id", required=True)
    parser.add_argument("--agent-path", required=True)
    parser.add_argument("--created-at", required=True)
    args = parser.parse_args()

    assignment = next((row for row in load_rows(ASSIGNMENTS) if row["assignment_id"] == args.assignment_id), None)
    if assignment is None:
        raise SystemExit("assignment is not allocated to runner-06")
    capsule = json.loads(Path(assignment["capsule_ref"]).read_text())
    registry = load_rows(REGISTRY)
    if any(row.get("agent_instance_id") == args.agent_instance_id or row.get("agent_path") == args.agent_path or row.get("agent_thread_id") == args.agent_path for row in registry):
        raise SystemExit("agent identity is not fresh")
    if any(row.get("assignment_id") == args.assignment_id and int(row.get("attempt", -1)) == args.attempt for row in registry):
        raise SystemExit("assignment attempt already exists")
    receipt_ref = BASE / "dispatch_receipts" / f"{args.assignment_id}.attempt-{args.attempt}.json"
    if receipt_ref.exists():
        raise SystemExit("immutable dispatch receipt already exists")
    receipt_ref.parent.mkdir(parents=True, exist_ok=True)
    record = {
        "audit_id": AUDIT_ID,
        "assignment_id": assignment["assignment_id"],
        "attempt": args.attempt,
        "runner_id": "runner-06",
        "agent_instance_id": args.agent_instance_id,
        "agent_path": args.agent_path,
        "agent_thread_id": args.agent_path,
        "agent_thread_id_kind": "native_collaboration_canonical_path",
        "model": assignment["required_model"],
        "reasoning_effort": assignment["required_reasoning_effort"],
        "role": assignment["role"],
        "window_id": assignment["window_id"],
        "doc_id": assignment["doc_id"],
        "document_path": assignment["document_path"],
        "core_range": assignment["core_range"],
        "overlap_ranges": capsule.get("context_ranges", []),
        "source_sha256": assignment["source_sha256"],
        "capsule_ref": assignment["capsule_ref"],
        "capsule_sha256": assignment["capsule_sha256"],
        "capsule_bytes": assignment["capsule_bytes"],
        "source_excerpt_ref": assignment["source_excerpt_ref"],
        "source_excerpt_sha256": assignment["source_excerpt_sha256"],
        "source_excerpt_bytes": assignment["source_excerpt_bytes"],
        "capsule_package_bytes": assignment["capsule_package_bytes"],
        "token_estimate": assignment["token_estimate"],
        "created_at": args.created_at,
        "completed_at": None,
        "prior_substantive_assignment_count": 0,
        "terminal_after_result": True,
        "no_followup_reuse": True,
        "fork_turns": "none",
        "state": "prelaunch_dispatched",
        "coverage_credit": 0,
        "result_ref": None,
        "result_sha256": None,
        "dispatch_receipt_ref": str(receipt_ref),
        "immutable": True,
    }
    raw = (json.dumps(record, indent=2, sort_keys=True) + "\n").encode()
    receipt_ref.write_bytes(raw)
    with REGISTRY.open("a") as handle:
        handle.write(json.dumps(record, separators=(",", ":"), sort_keys=True) + "\n")
    print(json.dumps({
        "assignment_id": args.assignment_id,
        "attempt": args.attempt,
        "agent_instance_id": args.agent_instance_id,
        "agent_path": args.agent_path,
        "dispatch_receipt_ref": str(receipt_ref),
        "dispatch_receipt_sha256": hashlib.sha256(raw).hexdigest(),
        "created_at": args.created_at,
    }, sort_keys=True))


if __name__ == "__main__":
    main()
