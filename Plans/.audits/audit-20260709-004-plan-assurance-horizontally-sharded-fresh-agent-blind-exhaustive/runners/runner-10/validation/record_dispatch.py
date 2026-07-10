#!/usr/bin/env python3
"""Append one fresh native-agent dispatch receipt from immutable assignment metadata."""

from __future__ import annotations

import argparse
import datetime as dt
import json
import pathlib


AUDIT_ID = "audit-20260709-004-plan-assurance-horizontally-sharded-fresh-agent-blind-exhaustive"
RUNNER_ID = "runner-10"
RUNNER_THREAD_ID = "019f49e2-18cb-7101-b7cb-0027862d9fcb"
REPO = pathlib.Path("/Users/jaredsmacbookair/Documents/PuppetMaster")
AUDIT = REPO / "Plans/.audits" / AUDIT_ID
RUNNER = AUDIT / "runners/runner-10"
ASSIGNMENTS = AUDIT / "assignments/runner-10.jsonl"
REGISTRY = RUNNER / "fresh_agent_assignment_registry.jsonl"
RESULTS = RUNNER / "result_manifest.jsonl"


def read_jsonl(path: pathlib.Path) -> list[dict]:
    return [json.loads(x) for x in path.read_text().splitlines() if x]


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--assignment-id", required=True)
    parser.add_argument("--agent-name", required=True)
    parser.add_argument("--agent-path", required=True)
    parser.add_argument("--wave", type=int, required=True)
    args = parser.parse_args()

    assignments = [x for x in read_jsonl(ASSIGNMENTS) if x["assignment_id"] == args.assignment_id]
    if len(assignments) != 1:
        raise ValueError(f"assignment match count {len(assignments)}")
    assignment = assignments[0]
    if assignment["runner_id"] != RUNNER_ID:
        raise ValueError("runner mismatch")
    if any(x["assignment_id"] == args.assignment_id for x in read_jsonl(RESULTS)):
        raise ValueError("assignment already has a valid result")

    registry = read_jsonl(REGISTRY)
    if any(x.get("agent_name") == args.agent_name or x.get("agent_instance_id") == args.agent_name for x in registry):
        raise ValueError("agent name already used")
    if any(x.get("agent_path") == args.agent_path for x in registry):
        raise ValueError("agent path already used")
    attempt_ordinal = 1 + sum(1 for x in registry if x["assignment_id"] == args.assignment_id)
    capsule = json.loads((REPO / assignment["capsule_ref"]).read_text())
    now = dt.datetime.now(dt.timezone.utc).isoformat().replace("+00:00", "Z")
    row = {
        "assignment_id": assignment["assignment_id"],
        "assignment_seq": assignment["assignment_seq"],
        "attempt_ordinal": attempt_ordinal,
        "dispatch_wave": args.wave,
        "runner_id": RUNNER_ID,
        "runner_thread_id": RUNNER_THREAD_ID,
        "agent_name": args.agent_name,
        "agent_instance_id": args.agent_name,
        "agent_instance_id_pending_session_receipt": True,
        "agent_path": args.agent_path,
        "agent_thread_id": args.agent_path,
        "agent_thread_id_source": "native_collaboration_canonical_task_path_pending_session_receipt",
        "model": "gpt-5.6-sol",
        "reasoning_effort": "ultra",
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
        "created_at": now,
        "completed_at": None,
        "prior_substantive_assignment_count": 0,
        "terminal_after_result": True,
        "no_followup_reuse": True,
        "result_ref": None,
        "result_sha256": None,
        "attempt_status": "dispatched",
        "coverage_credit": 0,
    }
    with REGISTRY.open("a") as f:
        f.write(json.dumps(row, sort_keys=True, separators=(",", ":")) + "\n")
    print(json.dumps(row, sort_keys=True))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
