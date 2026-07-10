#!/usr/bin/env python3
import argparse
import json
from pathlib import Path

AUDIT_ID = "audit-20260709-004-plan-assurance-horizontally-sharded-fresh-agent-blind-exhaustive"
AUDIT = Path("Plans/.audits") / AUDIT_ID
BASE = AUDIT / "runners/runner-06"
RESULTS = BASE / "result_manifest.jsonl"
FAILED = BASE / "failed_attempts.jsonl"


def load_rows(path):
    return [json.loads(line) for line in path.read_text().splitlines() if line.strip()] if path.exists() else []


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--assignment-id", required=True)
    parser.add_argument("--attempt", required=True, type=int)
    parser.add_argument("--agent-path", required=True)
    parser.add_argument("--reason", required=True)
    args = parser.parse_args()

    existing = load_rows(FAILED)
    if any(row.get("assignment_id") == args.assignment_id and int(row.get("attempt", -1)) == args.attempt and row.get("agent_path") == args.agent_path for row in existing):
        raise SystemExit("failed-attempt receipt already exists")
    candidates = [row for row in load_rows(RESULTS) if row.get("assignment_id") == args.assignment_id and int(row.get("attempt", -1)) == args.attempt and row.get("agent_path") == args.agent_path]
    if len(candidates) != 1:
        raise SystemExit(f"expected one source result receipt, found {len(candidates)}")
    source = candidates[0]
    result_ref = source.get("result_ref")
    result_sha256 = source.get("result_sha256")
    if not result_ref or not Path(result_ref).is_file() or not result_sha256:
        raise SystemExit("source result capture is missing")

    validation_ref = BASE / "validation/postrun_v2_quarantines" / f"{args.assignment_id}.attempt-{args.attempt}.json"
    failure_ref = BASE / "failure_receipts" / f"{args.assignment_id}.attempt-{args.attempt}.json"
    if validation_ref.exists() or failure_ref.exists():
        raise SystemExit("immutable v2 receipt path already exists")
    validation_ref.parent.mkdir(parents=True, exist_ok=True)
    failure_ref.parent.mkdir(parents=True, exist_ok=True)
    validation = {
        "audit_id": AUDIT_ID,
        "runner_id": "runner-06",
        "assignment_id": args.assignment_id,
        "attempt": args.attempt,
        "agent_instance_id": source.get("agent_instance_id"),
        "agent_path": args.agent_path,
        "agent_thread_id": source.get("agent_thread_id"),
        "passed": False,
        "validation_passed": False,
        "status": "quarantined_zero_credit",
        "coverage_credit": 0,
        "result_ref": result_ref,
        "result_sha256": result_sha256,
        "errors": [args.reason],
        "immutable": True,
    }
    validation_ref.write_text(json.dumps(validation, indent=2, sort_keys=True) + "\n")
    failure = {
        "audit_id": AUDIT_ID,
        "runner_id": "runner-06",
        "assignment_id": args.assignment_id,
        "attempt": args.attempt,
        "agent_instance_id": source.get("agent_instance_id"),
        "agent_path": args.agent_path,
        "agent_thread_id": source.get("agent_thread_id"),
        "model": source.get("model"),
        "reasoning_effort": source.get("reasoning_effort"),
        "status": "failed_attempt_zero_coverage",
        "attempt_state": "quarantined",
        "coverage_credit": 0,
        "validation_passed": False,
        "valid": False,
        "result_ref": result_ref,
        "result_sha256": result_sha256,
        "bad_capture_validation_ref": str(validation_ref),
        "failure_reason": args.reason,
        "completed_at": source.get("completed_at"),
        "terminal_after_result": True,
        "no_followup_reuse": True,
        "immutable": True,
    }
    failure_ref.write_text(json.dumps(failure, indent=2, sort_keys=True) + "\n")
    with FAILED.open("a") as handle:
        handle.write(json.dumps(failure, separators=(",", ":"), sort_keys=True) + "\n")
    print(json.dumps({"failure_receipt": str(failure_ref), "assignment_id": args.assignment_id, "attempt": args.attempt}, sort_keys=True))


if __name__ == "__main__":
    main()
