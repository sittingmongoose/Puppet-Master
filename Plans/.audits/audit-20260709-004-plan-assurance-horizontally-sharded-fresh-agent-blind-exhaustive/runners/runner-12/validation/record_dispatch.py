#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
from datetime import datetime, timezone
from pathlib import Path


AUDIT_ID = "audit-20260709-004-plan-assurance-horizontally-sharded-fresh-agent-blind-exhaustive"


def read_jsonl(path: Path) -> list[dict]:
    if not path.exists():
        return []
    return [json.loads(line) for line in path.read_text(encoding="utf-8").splitlines() if line.strip()]


def write_jsonl(path: Path, rows: list[dict]) -> None:
    path.write_text("".join(json.dumps(row, separators=(",", ":"), ensure_ascii=False) + "\n" for row in rows), encoding="utf-8")


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--audit-root", default=f"Plans/.audits/{AUDIT_ID}")
    parser.add_argument("--assignment-id", required=True)
    parser.add_argument("--agent-instance-id", required=True)
    parser.add_argument("--agent-path", required=True)
    parser.add_argument("--created-at")
    args = parser.parse_args()

    audit_root = Path(args.audit_root)
    runner_root = audit_root / "runners" / "runner-12"
    packet = read_jsonl(audit_root / "assignments" / "runner-12.jsonl")
    matches = [row for row in packet if row.get("assignment_id") == args.assignment_id]
    if len(matches) != 1:
        raise SystemExit(f"expected one assignment row, got {len(matches)}")
    assignment = matches[0]
    capsule = json.loads(Path(assignment["capsule_ref"]).read_text(encoding="utf-8"))
    registry_path = runner_root / "fresh_agent_assignment_registry.jsonl"
    registry = read_jsonl(registry_path)
    if any(row.get("agent_instance_id") == args.agent_instance_id for row in registry):
        raise SystemExit("duplicate agent_instance_id")
    if any(row.get("agent_path") == args.agent_path for row in registry):
        raise SystemExit("duplicate agent_path")
    prior_attempts = [row for row in registry if row.get("assignment_id") == args.assignment_id]
    attempt_number = len(prior_attempts) + 1
    attempt_id = f"{args.assignment_id}-attempt-{attempt_number}"
    if attempt_number == 1:
        result_name = f"{args.assignment_id}.json"
    else:
        result_name = f"{args.assignment_id}.attempt-{attempt_number}.json"
    created_at = args.created_at or datetime.now(timezone.utc).isoformat(timespec="milliseconds").replace("+00:00", "Z")
    row = {
        "attempt_id": attempt_id,
        "assignment_id": args.assignment_id,
        "runner_id": "runner-12",
        "agent_instance_id": args.agent_instance_id,
        "agent_instance_id_source": "runner_allocated_global_uuid",
        "agent_path": args.agent_path,
        "agent_thread_id": args.agent_path,
        "agent_thread_id_source": "spawn_agent_returned_native_collaboration_canonical_path",
        "model": assignment["required_model"],
        "reasoning_effort": assignment["required_reasoning_effort"],
        "role": assignment["role"],
        "window_id": assignment["window_id"],
        "doc_id": assignment["doc_id"],
        "document_path": assignment["document_path"],
        "core_range": assignment["core_range"],
        "overlap_ranges": capsule.get("context_ranges", []),
        "source_hash": assignment["source_sha256"],
        "core_hash": assignment["core_sha256"],
        "capsule_ref": assignment["capsule_ref"],
        "capsule_hash": assignment["capsule_sha256"],
        "capsule_bytes": assignment["capsule_bytes"],
        "capsule_package_bytes": assignment["capsule_package_bytes"],
        "source_excerpt_ref": assignment["source_excerpt_ref"],
        "source_excerpt_hash": assignment["source_excerpt_sha256"],
        "source_excerpt_bytes": assignment["source_excerpt_bytes"],
        "created_at": created_at,
        "completed_at": None,
        "prior_substantive_assignment_count": 0,
        "terminal_after_result": True,
        "result_ref": str(runner_root / "raw_results" / result_name),
        "result_hash": None,
        "no_followup_reuse": True,
        "fork_turns": "none",
        "attempt_state": "running",
        "coverage_credit": 0,
    }
    dispatch_dir = runner_root / "dispatch_receipts"
    dispatch_dir.mkdir(parents=True, exist_ok=True)
    dispatch_path = dispatch_dir / f"{attempt_id}.json"
    if dispatch_path.exists():
        raise SystemExit(f"immutable dispatch receipt already exists: {dispatch_path}")
    dispatch_receipt = dict(row)
    dispatch_receipt["receipt_type"] = "immutable_prelaunch_dispatch"
    dispatch_receipt["launch_state"] = "authorized_prelaunch"
    dispatch_receipt["agent_thread_id"] = None
    dispatch_receipt["agent_thread_id_source"] = "unavailable_before_native_spawn"
    dispatch_path.write_text(json.dumps(dispatch_receipt, indent=2, sort_keys=True) + "\n", encoding="utf-8")
    import hashlib
    row["dispatch_receipt_ref"] = str(dispatch_path)
    row["dispatch_receipt_sha256"] = hashlib.sha256(dispatch_path.read_bytes()).hexdigest()
    registry.append(row)
    write_jsonl(registry_path, registry)
    print(json.dumps(row, separators=(",", ":"), ensure_ascii=False))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
