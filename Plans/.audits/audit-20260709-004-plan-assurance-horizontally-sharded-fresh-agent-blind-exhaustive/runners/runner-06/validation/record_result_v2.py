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
MANIFEST = BASE / "result_manifest.jsonl"
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
    parser.add_argument("--allow-existing-assignment-manifest", action="store_true")
    args = parser.parse_args()

    dispatches = [row for row in load_rows(REGISTRY) if row.get("assignment_id") == args.assignment_id and int(row.get("attempt", -1)) == args.attempt and row.get("agent_path") == args.agent_path]
    prelaunch = [row for row in dispatches if row.get("completed_at") is None and row.get("result_ref") is None]
    if len(prelaunch) != 1:
        raise SystemExit(f"expected one immutable prelaunch dispatch row, found {len(prelaunch)}")
    dispatch = prelaunch[0]
    receipt_ref = Path(dispatch.get("dispatch_receipt_ref", ""))
    if not receipt_ref.is_file() or dispatch.get("state") != "prelaunch_dispatched" or dispatch.get("immutable") is not True:
        raise SystemExit("prelaunch dispatch receipt is not qualifying")

    payload, completed_at = mailbox_result(args.rollout, args.assignment_id, args.agent_path)
    raw = payload.encode()
    safe_agent = re.sub(r"[^a-zA-Z0-9_-]+", "_", dispatch["agent_instance_id"])
    stem = f"{args.assignment_id}.attempt-{args.attempt}.{safe_agent}"
    result_ref = BASE / "raw_results" / f"{stem}.json"
    validation_ref = BASE / "validation/results_v2" / f"{stem}.json"
    attempt_ref = BASE / "attempt_receipts" / f"{stem}.json"
    for path in (result_ref, validation_ref, attempt_ref):
        if path.exists():
            raise SystemExit(f"immutable result path already exists: {path}")
        path.parent.mkdir(parents=True, exist_ok=True)
    result_ref.write_bytes(raw)
    report = validate_result(result_ref, args.assignment_id)
    result_sha256 = hashlib.sha256(raw).hexdigest()
    validation = dict(report)
    validation.update({
        "assignment_id": args.assignment_id,
        "attempt": args.attempt,
        "agent_instance_id": dispatch["agent_instance_id"],
        "agent_path": args.agent_path,
        "agent_thread_id": dispatch["agent_thread_id"],
        "result_ref": str(result_ref),
        "result_sha256": result_sha256,
        "validation_passed": report["passed"],
        "exact_evidence_validation_passed": report["passed"],
        "scope_validation_passed": report["passed"],
        "status": "validated" if report["passed"] else "failed",
        "coverage_credit": 1 if report["passed"] else 0,
        "immutable": True,
    })
    validation_ref.write_text(json.dumps(validation, indent=2, sort_keys=True) + "\n")
    validation_sha256 = hashlib.sha256(validation_ref.read_bytes()).hexdigest()

    completion = dict(dispatch)
    completion.update({
        "completed_at": completed_at,
        "result_ref": str(result_ref),
        "result_sha256": result_sha256,
        "result_bytes": len(raw),
        "validation_ref": str(validation_ref),
        "validation_sha256": validation_sha256,
        "validation_passed": report["passed"],
        "valid": report["passed"],
        "coverage_credit": 1 if report["passed"] else 0,
        "state": "terminal_valid" if report["passed"] else "terminal_failed",
        "attempt_receipt_ref": str(attempt_ref),
        "immutable": True,
    })
    attempt_ref.write_text(json.dumps(completion, indent=2, sort_keys=True) + "\n")
    with REGISTRY.open("a") as handle:
        handle.write(json.dumps(completion, separators=(",", ":"), sort_keys=True) + "\n")

    if report["passed"]:
        existing = load_rows(MANIFEST)
        if any(row.get("assignment_id") == args.assignment_id and int(row.get("attempt", -1)) == args.attempt and row.get("agent_path") == args.agent_path for row in existing):
            raise SystemExit("result-manifest attempt already exists")
        if any(row.get("assignment_id") == args.assignment_id for row in existing) and not args.allow_existing_assignment_manifest:
            raise SystemExit("assignment already has a result-manifest row; prospective authority required for retry append")
        result_receipt = dict(completion)
        result_receipt.update({
            "validation_passed": True,
            "validation_status": "validated",
            "schema_validation_passed": True,
            "dispatch_validation_passed": True,
            "exact_evidence_validation_passed": True,
            "scope_validation_passed": True,
            "valid": True,
            "coverage_credit": 1,
            "errors": [],
        })
        with MANIFEST.open("a") as handle:
            handle.write(json.dumps(result_receipt, separators=(",", ":"), sort_keys=True) + "\n")
    else:
        failed_result_ref = BASE / "raw_results/failed_attempts" / result_ref.name
        failed_result_ref.parent.mkdir(parents=True, exist_ok=True)
        result_ref.replace(failed_result_ref)
        failure_ref = BASE / "failure_receipts" / f"{stem}.json"
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
            "result_ref": str(failed_result_ref),
            "result_sha256": result_sha256,
            "bad_capture_validation_ref": str(validation_ref),
            "failure_reason": "result_schema_or_exact_evidence_validation_failed",
            "completed_at": completed_at,
            "terminal_after_result": True,
            "no_followup_reuse": True,
            "immutable": True,
        }
        if failure_ref.exists():
            raise SystemExit("failure receipt already exists")
        failure_ref.write_text(json.dumps(failure, indent=2, sort_keys=True) + "\n")
        with FAILED.open("a") as handle:
            handle.write(json.dumps(failure, separators=(",", ":"), sort_keys=True) + "\n")

    print(json.dumps({
        "assignment_id": args.assignment_id,
        "attempt": args.attempt,
        "agent_path": args.agent_path,
        "completed_at": completed_at,
        "valid": report["passed"],
        "coverage_credit": 1 if report["passed"] else 0,
        "result_ref": str(result_ref if report["passed"] else failed_result_ref),
        "result_sha256": result_sha256,
        "validation_ref": str(validation_ref),
        "errors": report["errors"],
    }, sort_keys=True))
    raise SystemExit(0 if report["passed"] else 1)


if __name__ == "__main__":
    main()
