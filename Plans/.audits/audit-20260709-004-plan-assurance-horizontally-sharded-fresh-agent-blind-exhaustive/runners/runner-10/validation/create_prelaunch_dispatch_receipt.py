#!/usr/bin/env python3
"""Create one immutable V2 pre-launch dispatch receipt using exclusive creation."""

from __future__ import annotations

import argparse
import datetime as dt
import hashlib
import json
import pathlib
import re


AUDIT_ID = "audit-20260709-004-plan-assurance-horizontally-sharded-fresh-agent-blind-exhaustive"
RUNNER_ID = "runner-10"
RUNNER_THREAD_ID = "019f49e2-18cb-7101-b7cb-0027862d9fcb"
REPO = pathlib.Path("/Users/jaredsmacbookair/Documents/PuppetMaster")
AUDIT = REPO / "Plans/.audits" / AUDIT_ID
RUNNER = AUDIT / "runners/runner-10"
ASSIGNMENTS = AUDIT / "assignments/runner-10.jsonl"
REGISTRY = RUNNER / "fresh_agent_assignment_registry.jsonl"
PROTOCOL = RUNNER / "validation/reviewer_protocol_v1.json"


def sha256(path: pathlib.Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def read_jsonl(path: pathlib.Path) -> list[dict]:
    if not path.exists():
        return []
    return [json.loads(x) for x in path.read_text().splitlines() if x]


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--assignment-id", required=True)
    parser.add_argument("--attempt", type=int, required=True)
    parser.add_argument("--agent-name", required=True)
    parser.add_argument("--agent-path", required=True)
    parser.add_argument("--wave", type=int, required=True)
    parser.add_argument("--recovery-authority")
    args = parser.parse_args()
    if args.attempt < 1:
        raise ValueError("attempt must be positive")
    if not re.fullmatch(r"a004_r10_[a-z0-9_]+", args.agent_name):
        raise ValueError("agent name violates runner prefix contract")
    if args.agent_path != f"/root/{args.agent_name}":
        raise ValueError("agent path does not match canonical native path")

    matches = [x for x in read_jsonl(ASSIGNMENTS) if x["assignment_id"] == args.assignment_id]
    if len(matches) != 1:
        raise ValueError(f"assignment match count {len(matches)}")
    assignment = matches[0]
    capsule = json.loads((REPO / assignment["capsule_ref"]).read_text())

    used_names = set()
    used_paths = set()
    for row in read_jsonl(REGISTRY):
        used_names.add(row.get("agent_name"))
        used_names.add(row.get("agent_instance_id"))
        used_paths.add(row.get("agent_path"))
    for path in (RUNNER / "dispatch_receipts").glob("*.json"):
        row = json.loads(path.read_text())
        used_names.add(row.get("agent_name"))
        used_paths.add(row.get("agent_path"))
    if args.agent_name in used_names or args.agent_path in used_paths:
        raise ValueError("agent name/path already used")

    existing_attempts = []
    for row in read_jsonl(REGISTRY):
        if row.get("assignment_id") == args.assignment_id:
            value = row.get("attempt") or row.get("attempt_no") or row.get("attempt_number") or row.get("attempt_ordinal")
            if isinstance(value, int):
                existing_attempts.append(value)
    for path in (RUNNER / "dispatch_receipts").glob(f"{args.assignment_id}__attempt-*.json"):
        row = json.loads(path.read_text())
        if isinstance(row.get("attempt"), int):
            existing_attempts.append(row["attempt"])
    if args.attempt in existing_attempts:
        raise ValueError("attempt number already used in a recorded V2 dispatch")

    now = dt.datetime.now(dt.timezone.utc).isoformat().replace("+00:00", "Z")
    protocol_ref = str(PROTOCOL.relative_to(REPO))
    record = {
        "receipt_schema": "a004.prelaunch_dispatch_receipt.v2",
        "audit_id": AUDIT_ID,
        "runner_id": RUNNER_ID,
        "runner_thread_id": RUNNER_THREAD_ID,
        "assignment_id": assignment["assignment_id"],
        "assignment_seq": assignment["assignment_seq"],
        "attempt": args.attempt,
        "attempt_id": f"attempt-{args.attempt}",
        "dispatch_wave": args.wave,
        "agent_name": args.agent_name,
        "agent_path": args.agent_path,
        "native_identity_pending_until_spawn": True,
        "model": "gpt-5.6-sol",
        "reasoning_effort": "ultra",
        "fork_turns": "none",
        "role": assignment["role"],
        "window_id": assignment["window_id"],
        "doc_id": assignment["doc_id"],
        "document_path": assignment["document_path"],
        "core_range": assignment["core_range"],
        "context_ranges": capsule["context_ranges"],
        "source_sha256": assignment["source_sha256"],
        "source_excerpt_ref": assignment["source_excerpt_ref"],
        "source_excerpt_sha256": assignment["source_excerpt_sha256"],
        "source_excerpt_bytes": assignment["source_excerpt_bytes"],
        "capsule_ref": assignment["capsule_ref"],
        "capsule_sha256": assignment["capsule_sha256"],
        "capsule_bytes": assignment["capsule_bytes"],
        "capsule_package_bytes": assignment["capsule_package_bytes"],
        "token_estimate": assignment["token_estimate"],
        "protocol_ref": protocol_ref,
        "protocol_sha256": sha256(PROTOCOL),
        "prior_substantive_assignment_count": 0,
        "terminal_after_result": True,
        "no_followup_reuse": True,
        "recovery_authority": args.recovery_authority,
        "receipt_status": "created_before_launch",
        "created_at": now,
    }
    out = RUNNER / "dispatch_receipts" / f"{args.assignment_id}__attempt-{args.attempt:04d}__{args.agent_name}.json"
    out.parent.mkdir(parents=True, exist_ok=True)
    with out.open("x") as handle:
        handle.write(json.dumps(record, indent=2, sort_keys=True) + "\n")
    print(json.dumps({
        "dispatch_receipt_ref": str(out.relative_to(REPO)),
        "dispatch_receipt_sha256": sha256(out),
        "created_at": now,
        "assignment_id": args.assignment_id,
        "attempt": args.attempt,
        "agent_name": args.agent_name,
        "agent_path": args.agent_path,
    }, sort_keys=True))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
