#!/usr/bin/env python3
"""Append immutable completed-attempt, registry, result, or failure receipts for V2."""

from __future__ import annotations

import argparse
import datetime as dt
import hashlib
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
FAILED = RUNNER / "failed_attempts.jsonl"


def sha256(path: pathlib.Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def read_jsonl(path: pathlib.Path) -> list[dict]:
    if not path.exists():
        return []
    return [json.loads(x) for x in path.read_text().splitlines() if x]


def append_jsonl(path: pathlib.Path, row: dict) -> None:
    with path.open("a") as handle:
        handle.write(json.dumps(row, sort_keys=True, separators=(",", ":")) + "\n")


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--validation-receipt", required=True)
    parser.add_argument("--allow-missing-prelaunch-zero-credit", action="store_true")
    args = parser.parse_args()

    validation_path = REPO / args.validation_receipt
    if not validation_path.is_file():
        raise ValueError("validation receipt missing")
    validation = json.loads(validation_path.read_text())
    assignment_id = validation["assignment_id"]
    attempt = validation.get("attempt")
    if not isinstance(attempt, int) or attempt < 1:
        raise ValueError("V2 validation receipt requires positive integer attempt")
    assignments = [x for x in read_jsonl(ASSIGNMENTS) if x["assignment_id"] == assignment_id]
    if len(assignments) != 1:
        raise ValueError(f"assignment match count {len(assignments)}")
    assignment = assignments[0]
    capsule = json.loads((REPO / assignment["capsule_ref"]).read_text())

    raw_path = REPO / validation["result_ref"]
    if not raw_path.is_file() or sha256(raw_path) != validation["result_sha256"]:
        raise ValueError("raw result missing or hash mismatch")
    if validation.get("model") != "gpt-5.6-sol" or validation.get("reasoning_effort") != "ultra":
        raise ValueError("model/effort mismatch")

    dispatch_ref = validation.get("dispatch_receipt_ref")
    dispatch_hash = validation.get("dispatch_receipt_sha256")
    dispatch = None
    if dispatch_ref:
        dispatch_path = REPO / dispatch_ref
        if not dispatch_path.is_file() or sha256(dispatch_path) != dispatch_hash:
            raise ValueError("immutable prelaunch dispatch receipt missing or hash mismatch")
        dispatch = json.loads(dispatch_path.read_text())
        if dispatch.get("assignment_id") != assignment_id or dispatch.get("attempt") != attempt:
            raise ValueError("prelaunch dispatch assignment/attempt mismatch")
        if dispatch.get("agent_path") != validation.get("agent_path"):
            raise ValueError("prelaunch dispatch agent path mismatch")
    elif not args.allow_missing_prelaunch_zero_credit:
        raise ValueError("missing immutable prelaunch dispatch receipt")
    if dispatch is None and validation.get("validation_passed"):
        raise ValueError("missing-prelaunch attempt cannot receive positive validation")

    registry = read_jsonl(REGISTRY)
    if any(
        x.get("assignment_id") == assignment_id
        and (x.get("attempt") == attempt or x.get("attempt_id") == f"attempt-{attempt}")
        and x.get("agent_path") == validation["agent_path"]
        for x in registry
    ):
        raise ValueError("completed registry attempt already recorded")
    for field in ("agent_instance_id", "agent_thread_id", "agent_path"):
        value = validation.get(field)
        if not value:
            raise ValueError(f"missing {field}")
        if any(x.get(field) == value for x in registry):
            raise ValueError(f"reused {field}")

    validation_hash = sha256(validation_path)
    now = dt.datetime.now(dt.timezone.utc).isoformat().replace("+00:00", "Z")
    agent_name = dispatch.get("agent_name") if dispatch else validation["agent_path"].rsplit("/", 1)[-1]
    base = {
        "audit_id": AUDIT_ID,
        "runner_id": RUNNER_ID,
        "runner_thread_id": RUNNER_THREAD_ID,
        "assignment_id": assignment_id,
        "assignment_seq": assignment["assignment_seq"],
        "attempt": attempt,
        "attempt_id": f"attempt-{attempt}",
        "agent_name": agent_name,
        "agent_instance_id": validation["agent_instance_id"],
        "agent_path": validation["agent_path"],
        "agent_thread_id": validation["agent_thread_id"],
        "agent_nickname": validation.get("agent_nickname"),
        "session_ref": validation.get("session_ref"),
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
        "dispatch_receipt_ref": dispatch_ref,
        "dispatch_receipt_sha256": dispatch_hash,
        "dispatched_at": dispatch.get("created_at") if dispatch else None,
        "created_at": validation["session_created_at"],
        "completed_at": validation["completed_at"],
        "prior_substantive_assignment_count": 0,
        "terminal_after_result": True,
        "no_followup_reuse": True,
        "result_ref": validation["result_ref"],
        "result_sha256": validation["result_sha256"],
        "result_bytes": validation["result_bytes"],
        "validation_ref": args.validation_receipt,
        "validation_sha256": validation_hash,
    }
    valid = validation.get("validation_passed") is True
    attempt_receipt = dict(base)
    attempt_receipt.update({
        "receipt_schema": "a004.completed_attempt_receipt.v2",
        "receipt_status": "validated" if valid else "quarantined",
        "coverage_credit": 1 if valid else 0,
        "validation_passed": valid,
        "validation_errors": validation.get("errors", []),
        "recorded_at": now,
    })
    attempt_path = RUNNER / "attempt_receipts" / f"{assignment_id}__attempt-{attempt:04d}__{validation['agent_instance_id']}.json"
    attempt_path.parent.mkdir(parents=True, exist_ok=True)
    with attempt_path.open("x") as handle:
        handle.write(json.dumps(attempt_receipt, indent=2, sort_keys=True) + "\n")
    attempt_ref = str(attempt_path.relative_to(REPO))
    attempt_hash = sha256(attempt_path)

    registry_row = dict(base)
    registry_row.update({
        "attempt_receipt_ref": attempt_ref,
        "attempt_receipt_sha256": attempt_hash,
        "attempt_status": "valid" if valid else "quarantined_zero_coverage",
        "coverage_credit": 1 if valid else 0,
        "validation_passed": valid,
        "validation_errors": validation.get("errors", []),
    })
    append_jsonl(REGISTRY, registry_row)

    terminal_row = dict(base)
    terminal_row.update({
        "attempt_receipt_ref": attempt_ref,
        "attempt_receipt_sha256": attempt_hash,
        "coverage_credit": 1 if valid else 0,
        "validation_passed": valid,
        "scope_validation_passed": valid,
        "exact_evidence_validation_passed": valid,
        "schema_validation_passed": valid,
        "validation_status": "valid" if valid else "quarantined",
        "status": "valid" if valid else "quarantined",
        "validation_errors": validation.get("errors", []),
    })
    if valid:
        append_jsonl(RESULTS, terminal_row)
    else:
        terminal_row.update({
            "receipt_schema": "a004.failed_attempt_receipt.v2",
            "immutable_zero_credit": True,
            "quarantine_reasons": validation.get("errors", []),
        })
        append_jsonl(FAILED, terminal_row)

    print(json.dumps({
        "assignment_id": assignment_id,
        "attempt": attempt,
        "agent_instance_id": validation["agent_instance_id"],
        "attempt_receipt_ref": attempt_ref,
        "attempt_receipt_sha256": attempt_hash,
        "coverage_credit": 1 if valid else 0,
        "validation_passed": valid,
        "result_ref": validation["result_ref"],
        "result_sha256": validation["result_sha256"],
    }, sort_keys=True))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
