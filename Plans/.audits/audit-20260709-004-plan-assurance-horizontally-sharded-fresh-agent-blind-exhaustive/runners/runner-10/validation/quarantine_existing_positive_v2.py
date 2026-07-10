#!/usr/bin/env python3
"""Append an immutable zero-credit receipt for a V2-rejected positive attempt."""

from __future__ import annotations

import argparse
import datetime as dt
import json
import pathlib


AUDIT_ID = "audit-20260709-004-plan-assurance-horizontally-sharded-fresh-agent-blind-exhaustive"
REPO = pathlib.Path("/Users/jaredsmacbookair/Documents/PuppetMaster")
RUNNER = REPO / "Plans/.audits" / AUDIT_ID / "runners/runner-10"


def read_jsonl(path: pathlib.Path) -> list[dict]:
    return [json.loads(x) for x in path.read_text().splitlines() if x]


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--assignment-id", required=True)
    parser.add_argument("--attempt", type=int, required=True)
    parser.add_argument("--reason", action="append", required=True)
    parser.add_argument("--authority-ref", required=True)
    args = parser.parse_args()

    manifests = [x for x in read_jsonl(RUNNER / "result_manifest.jsonl") if x.get("assignment_id") == args.assignment_id]
    if len(manifests) != 1:
        raise ValueError(f"positive manifest match count {len(manifests)}")
    source = manifests[0]
    failed_path = RUNNER / "failed_attempts.jsonl"
    failed = read_jsonl(failed_path)
    if any(
        x.get("assignment_id") == args.assignment_id
        and x.get("agent_instance_id") == source.get("agent_instance_id")
        and x.get("v2_rejected_positive") is True
        for x in failed
    ):
        raise ValueError("V2 rejected-positive quarantine already recorded")

    validation_ref = source.get("validation_ref")
    if not validation_ref:
        legacy_validation = RUNNER / "validation/results" / f"{args.assignment_id}.json"
        if legacy_validation.is_file():
            validation_ref = str(legacy_validation.relative_to(REPO))
    if not validation_ref or not (REPO / validation_ref).is_file():
        raise ValueError("source positive validation receipt missing")
    now = dt.datetime.now(dt.timezone.utc).isoformat().replace("+00:00", "Z")
    row = {
        "receipt_schema": "a004.failed_attempt_receipt.v2",
        "audit_id": AUDIT_ID,
        "runner_id": "runner-10",
        "runner_thread_id": "019f49e2-18cb-7101-b7cb-0027862d9fcb",
        "assignment_id": args.assignment_id,
        "assignment_seq": source.get("assignment_seq"),
        "attempt": args.attempt,
        "attempt_id": f"attempt-{args.attempt}",
        "agent_name": source.get("agent_name"),
        "agent_instance_id": source.get("agent_instance_id"),
        "agent_path": source.get("agent_path"),
        "agent_thread_id": source.get("agent_thread_id"),
        "model": source.get("model"),
        "reasoning_effort": source.get("reasoning_effort"),
        "role": source.get("role"),
        "window_id": source.get("window_id"),
        "doc_id": source.get("doc_id"),
        "document_path": source.get("document_path"),
        "core_range": source.get("core_range"),
        "context_ranges": source.get("context_ranges"),
        "source_sha256": source.get("source_sha256"),
        "source_excerpt_ref": source.get("source_excerpt_ref"),
        "source_excerpt_sha256": source.get("source_excerpt_sha256"),
        "source_excerpt_bytes": source.get("source_excerpt_bytes"),
        "capsule_ref": source.get("capsule_ref"),
        "capsule_sha256": source.get("capsule_sha256"),
        "capsule_bytes": source.get("capsule_bytes"),
        "capsule_package_bytes": source.get("capsule_package_bytes"),
        "token_estimate": source.get("token_estimate"),
        "created_at": source.get("created_at"),
        "completed_at": source.get("completed_at"),
        "prior_substantive_assignment_count": 0,
        "terminal_after_result": True,
        "no_followup_reuse": True,
        "result_ref": source.get("result_ref"),
        "result_sha256": source.get("result_sha256"),
        "result_bytes": source.get("result_bytes"),
        "bad_capture_ref": source.get("result_ref"),
        "bad_capture_sha256": source.get("result_sha256"),
        "bad_capture_validation_ref": validation_ref,
        "coverage_credit": 0,
        "validation_passed": False,
        "validation_status": "quarantined",
        "status": "quarantined",
        "validation_errors": args.reason,
        "quarantine_reasons": args.reason,
        "v2_rejected_positive": True,
        "authority_ref": args.authority_ref,
        "recorded_at": now,
        "immutable_zero_credit": True,
    }
    with failed_path.open("a") as handle:
        handle.write(json.dumps(row, sort_keys=True, separators=(",", ":")) + "\n")
    print(json.dumps(row, sort_keys=True))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
