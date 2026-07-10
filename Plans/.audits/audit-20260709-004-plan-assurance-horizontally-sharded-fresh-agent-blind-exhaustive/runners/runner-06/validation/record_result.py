#!/usr/bin/env python3
import argparse
import hashlib
import json
from pathlib import Path

from extract_mailbox_result import strings
from validate_result import validate_result

AUDIT_ID = "audit-20260709-004-plan-assurance-horizontally-sharded-fresh-agent-blind-exhaustive"
AUDIT = Path("Plans/.audits") / AUDIT_ID
BASE = AUDIT / "runners/runner-06"
REGISTRY = BASE / "fresh_agent_assignment_registry.jsonl"
MANIFEST = BASE / "result_manifest.jsonl"


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
    args = parser.parse_args()

    registry = [json.loads(line) for line in REGISTRY.read_text().splitlines() if line.strip()]
    indexes = [
        index for index, row in enumerate(registry)
        if row["assignment_id"] == args.assignment_id
        and row["attempt"] == args.attempt
        and row["agent_path"] == args.agent_path
    ]
    if len(indexes) != 1:
        raise SystemExit(f"expected one dispatch record, found {len(indexes)}")
    index = indexes[0]
    dispatch = registry[index]
    if dispatch.get("state") != "dispatched":
        raise SystemExit("dispatch is not active")

    payload, completed_at = mailbox_result(args.rollout, args.assignment_id, args.agent_path)
    raw = payload.encode()
    canonical_ref = BASE / "raw_results" / f"{args.assignment_id}.json"
    canonical_ref.write_bytes(raw)
    report = validate_result(canonical_ref, args.assignment_id)
    if report["passed"]:
        result_ref = canonical_ref
    else:
        result_ref = BASE / "raw_results/failed_attempts" / f"{args.assignment_id}.attempt-{args.attempt}.json"
        result_ref.parent.mkdir(parents=True, exist_ok=True)
        canonical_ref.replace(result_ref)

    existing_results = [json.loads(line) for line in MANIFEST.read_text().splitlines() if line.strip()] if MANIFEST.exists() else []
    if any(row["agent_path"] == args.agent_path or (row["assignment_id"] == args.assignment_id and row["attempt"] == args.attempt) for row in existing_results):
        raise SystemExit("duplicate result attempt")
    if report["passed"] and any(row.get("assignment_id") == args.assignment_id and row.get("valid") for row in existing_results):
        raise SystemExit("assignment already has valid coverage")

    result_sha256 = hashlib.sha256(raw).hexdigest()
    outcome = dict(dispatch)
    outcome.update({
        "completed_at": completed_at,
        "result_ref": str(result_ref),
        "result_sha256": result_sha256,
        "result_bytes": len(raw),
        "schema_validation_passed": report["passed"],
        "dispatch_validation_passed": True,
        "valid": report["passed"],
        "coverage_credit": 1 if report["passed"] else 0,
        "observation_count": report.get("observation_count", 0),
        "candidate_finding_count": report.get("candidate_finding_count", 0),
        "explicit_non_gap_count": report.get("explicit_non_gap_count", 0),
        "unknown_count": report.get("unknown_count", 0),
        "exact_evidence_ref_count": report.get("exact_evidence_ref_count", 0),
    })
    outcome.pop("state", None)
    if not report["passed"]:
        outcome["failure_reason"] = "result_schema_or_evidence_validation_failed:" + ",".join(report["errors"])
    with MANIFEST.open("a") as handle:
        handle.write(json.dumps(outcome, separators=(",", ":"), sort_keys=True) + "\n")

    dispatch.update({
        "completed_at": completed_at,
        "result_ref": str(result_ref),
        "result_sha256": result_sha256,
        "state": "terminal_valid" if report["passed"] else "terminal_failed",
        "coverage_credit": 1 if report["passed"] else 0,
    })
    registry[index] = dispatch
    REGISTRY.write_text("".join(json.dumps(row, separators=(",", ":"), sort_keys=True) + "\n" for row in registry))

    validation_ref = BASE / "validation/results" / f"{args.assignment_id}.attempt-{args.attempt}.json"
    validation_ref.parent.mkdir(parents=True, exist_ok=True)
    validation_ref.write_text(json.dumps(report, indent=2, sort_keys=True) + "\n")
    print(json.dumps({
        "assignment_id": args.assignment_id,
        "agent_path": args.agent_path,
        "attempt": args.attempt,
        "completed_at": completed_at,
        "valid": report["passed"],
        "result_ref": str(result_ref),
        "result_sha256": result_sha256,
        "errors": report["errors"],
    }, sort_keys=True))
    raise SystemExit(0 if report["passed"] else 1)


if __name__ == "__main__":
    main()
