#!/usr/bin/env python3
import argparse
import hashlib
import json
import re
from pathlib import Path

from extract_mailbox_result import strings
from validate_result import validate_result

AUDIT_ID = "audit-20260709-004-plan-assurance-horizontally-sharded-fresh-agent-blind-exhaustive"
AUDIT = Path("Plans/.audits") / AUDIT_ID
BASE = AUDIT / "runners/runner-06"
REGISTRY = BASE / "fresh_agent_assignment_registry.jsonl"
FAILED = BASE / "failed_attempts.jsonl"


def load_rows(path):
    return [json.loads(line) for line in path.read_text().splitlines() if line.strip()] if path.exists() else []


def mailbox_result(rollout, assignment_id, agent_path):
    marker = f"Sender: {agent_path}\nPayload:\n"
    matches = []
    with rollout.open() as handle:
        for line in handle:
            try:
                record = json.loads(line)
            except json.JSONDecodeError:
                continue
            if record.get("payload", {}).get("type") != "agent_message":
                continue
            for text in strings(record):
                if "Message Type: FINAL_ANSWER" not in text or marker not in text:
                    continue
                payload = text.split(marker, 1)[1]
                try:
                    parsed = json.loads(payload)
                except json.JSONDecodeError:
                    continue
                if parsed.get("assignment_id") == assignment_id:
                    matches.append((payload, record.get("timestamp")))
    if len(matches) != 1:
        raise SystemExit(f"expected one terminal mailbox result, found {len(matches)}")
    return matches[0]


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--rollout", required=True, type=Path)
    parser.add_argument("--assignment-id", required=True)
    parser.add_argument("--attempt", required=True, type=int)
    parser.add_argument("--agent-path", required=True)
    parser.add_argument("--reason", required=True)
    args = parser.parse_args()

    registry = load_rows(REGISTRY)
    candidates = [row for row in registry if row.get("assignment_id") == args.assignment_id and int(row.get("attempt", -1)) == args.attempt and row.get("agent_path") == args.agent_path]
    if len(candidates) != 1:
        raise SystemExit(f"expected one dispatch row, found {len(candidates)}")
    dispatch = candidates[0]
    if any(row.get("assignment_id") == args.assignment_id and int(row.get("attempt", -1)) == args.attempt and row.get("agent_path") == args.agent_path for row in load_rows(FAILED)):
        raise SystemExit("failure receipt already exists")

    payload, completed_at = mailbox_result(args.rollout, args.assignment_id, args.agent_path)
    raw = payload.encode()
    safe_agent = re.sub(r"[^a-zA-Z0-9_-]+", "_", dispatch["agent_instance_id"])
    stem = f"{args.assignment_id}.attempt-{args.attempt}.{safe_agent}"
    result_ref = BASE / "raw_results/failed_attempts" / f"{stem}.json"
    validation_ref = BASE / "validation/failures" / f"{stem}.json"
    attempt_ref = BASE / "attempt_receipts" / f"{stem}.json"
    failure_ref = BASE / "failure_receipts" / f"{stem}.json"
    for path in (result_ref, validation_ref, attempt_ref, failure_ref):
        if path.exists():
            raise SystemExit(f"immutable receipt path already exists: {path}")
        path.parent.mkdir(parents=True, exist_ok=True)
    result_ref.write_bytes(raw)
    schema_report = validate_result(result_ref, args.assignment_id)
    result_sha256 = hashlib.sha256(raw).hexdigest()
    validation = dict(schema_report)
    validation.update({
        "passed": False,
        "validation_passed": False,
        "status": "forced_zero_credit",
        "coverage_credit": 0,
        "assignment_id": args.assignment_id,
        "attempt": args.attempt,
        "agent_path": args.agent_path,
        "result_ref": str(result_ref),
        "result_sha256": result_sha256,
        "protocol_failure_reason": args.reason,
    })
    validation["errors"] = [args.reason, *schema_report.get("errors", [])]
    validation_ref.write_text(json.dumps(validation, indent=2, sort_keys=True) + "\n")

    completion = dict(dispatch)
    completion.update({
        "completed_at": completed_at,
        "result_ref": str(result_ref),
        "result_sha256": result_sha256,
        "result_bytes": len(raw),
        "validation_ref": str(validation_ref),
        "validation_passed": False,
        "valid": False,
        "coverage_credit": 0,
        "state": "terminal_failed",
        "failure_reason": args.reason,
        "attempt_receipt_ref": str(attempt_ref),
        "immutable": True,
    })
    attempt_ref.write_text(json.dumps(completion, indent=2, sort_keys=True) + "\n")
    with REGISTRY.open("a") as handle:
        handle.write(json.dumps(completion, separators=(",", ":"), sort_keys=True) + "\n")

    failure = {
        "audit_id": AUDIT_ID,
        "runner_id": "runner-06",
        "assignment_id": args.assignment_id,
        "attempt": args.attempt,
        "agent_instance_id": dispatch["agent_instance_id"],
        "agent_path": args.agent_path,
        "agent_thread_id": dispatch["agent_thread_id"],
        "model": dispatch["model"],
        "reasoning_effort": dispatch["reasoning_effort"],
        "status": "failed_attempt_zero_coverage",
        "attempt_state": "quarantined",
        "coverage_credit": 0,
        "validation_passed": False,
        "valid": False,
        "result_ref": str(result_ref),
        "result_sha256": result_sha256,
        "bad_capture_validation_ref": str(validation_ref),
        "failure_reason": args.reason,
        "completed_at": completed_at,
        "terminal_after_result": True,
        "no_followup_reuse": True,
        "immutable": True,
    }
    failure_ref.write_text(json.dumps(failure, indent=2, sort_keys=True) + "\n")
    with FAILED.open("a") as handle:
        handle.write(json.dumps(failure, separators=(",", ":"), sort_keys=True) + "\n")
    print(json.dumps({"assignment_id": args.assignment_id, "attempt": args.attempt, "result_ref": str(result_ref), "result_sha256": result_sha256, "completed_at": completed_at, "coverage_credit": 0}, sort_keys=True))


if __name__ == "__main__":
    main()
