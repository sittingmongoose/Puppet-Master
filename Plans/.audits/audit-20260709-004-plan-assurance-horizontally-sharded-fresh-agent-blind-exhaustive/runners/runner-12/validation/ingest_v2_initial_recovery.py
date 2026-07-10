#!/usr/bin/env python3
from __future__ import annotations

import hashlib
import json
from datetime import datetime, timezone
from pathlib import Path


AUDIT_ID = "audit-20260709-004-plan-assurance-horizontally-sharded-fresh-agent-blind-exhaustive"
ROOT = Path(f"Plans/.audits/{AUDIT_ID}")
RUNNER_ROOT = ROOT / "runners" / "runner-12"
SNAPSHOT = ROOT / "validators" / "evidence" / "postrun_validator_v2.initial.json"
AUTHORITY = ROOT / "validators" / "VALIDATOR_AUTHORITY_V2.json"


def sha(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def read_jsonl(path: Path) -> list[dict]:
    if not path.exists():
        return []
    return [json.loads(line) for line in path.read_text(encoding="utf-8").splitlines() if line.strip()]


def write_jsonl(path: Path, rows: list[dict]) -> None:
    path.write_text("".join(json.dumps(row, separators=(",", ":"), ensure_ascii=False) + "\n" for row in rows), encoding="utf-8")


snapshot = json.loads(SNAPSHOT.read_text(encoding="utf-8"))
credited = [row for row in snapshot["mechanically_eligible_result_receipts"] if row.get("runner_id") == "runner-12"]
quarantine = [row for row in snapshot["quarantine_candidates"] if row.get("runner_id") == "runner-12"]
registry = read_jsonl(RUNNER_ROOT / "fresh_agent_assignment_registry.jsonl")
manifest = read_jsonl(RUNNER_ROOT / "result_manifest.jsonl")
failures_path = RUNNER_ROOT / "failed_attempts.jsonl"
failures = read_jsonl(failures_path)
quarantine_dir = RUNNER_ROOT / "validation" / "quarantines"
quarantine_dir.mkdir(parents=True, exist_ok=True)
now = datetime.now(timezone.utc).isoformat(timespec="milliseconds").replace("+00:00", "Z")

created = []
for item in quarantine:
    assignment_id = item["assignment_id"]
    attempt_id = item.get("attempt_id")
    if any(row.get("assignment_id") == assignment_id and row.get("attempt_id") == attempt_id for row in failures):
        continue
    result_rows = [row for row in manifest if row.get("assignment_id") == assignment_id and row.get("attempt_id") == attempt_id]
    registry_rows = [row for row in registry if row.get("assignment_id") == assignment_id and row.get("attempt_id") == attempt_id]
    if len(result_rows) != 1 or len(registry_rows) != 1:
        raise SystemExit(f"cannot resolve immutable attempt {assignment_id} {attempt_id}")
    source = dict(result_rows[0])
    result_ref = Path(source["result_ref"])
    result_hash = source.get("result_hash") or source.get("result_sha256")
    if not result_ref.exists() or sha(result_ref) != result_hash:
        raise SystemExit(f"immutable result mismatch for {assignment_id}")
    validation_path = quarantine_dir / f"{attempt_id}.json"
    validation = {
        "audit_id": AUDIT_ID,
        "runner_id": "runner-12",
        "assignment_id": assignment_id,
        "attempt_id": attempt_id,
        "status": "failed_attempt_zero_coverage",
        "validation_passed": False,
        "coverage_credit": 0,
        "result_ref": str(result_ref),
        "result_sha256": result_hash,
        "reasons": item["reasons"],
        "authority_ref": str(AUTHORITY),
        "authority_sha256": sha(AUTHORITY),
        "source_snapshot_ref": str(SNAPSHOT),
        "source_snapshot_sha256": sha(SNAPSHOT),
        "recorded_at": now,
        "immutable": True
    }
    if validation_path.exists():
        raise SystemExit(f"quarantine validation receipt already exists: {validation_path}")
    validation_path.write_text(json.dumps(validation, indent=2, sort_keys=True) + "\n", encoding="utf-8")
    failure = dict(source)
    failure.update({
        "status": "failed_attempt_zero_coverage",
        "attempt_state": "failed_attempt_zero_coverage",
        "validation_status": "failed_attempt_zero_coverage",
        "validation_passed": False,
        "exact_evidence_validation_passed": False,
        "coverage_credit": 0,
        "validation_errors": item["reasons"],
        "bad_capture_validation_ref": str(validation_path),
        "bad_capture_validation_sha256": sha(validation_path),
        "bad_capture_ref": str(result_ref),
        "bad_capture_sha256": result_hash,
        "recorded_at": now,
        "immutable": True,
        "retry_required": True
    })
    failures.append(failure)
    created.append({"assignment_id": assignment_id, "attempt_id": attempt_id, "failure_receipt_ref": str(validation_path)})

write_jsonl(failures_path, failures)
summary = {
    "audit_id": AUDIT_ID,
    "runner_id": "runner-12",
    "authority_version": 2,
    "credited_assignments_preserved": credited,
    "credited_assignment_count": len(credited),
    "new_zero_credit_failure_receipts": created,
    "zero_credit_failure_count": len(created),
    "source_snapshot_ref": str(SNAPSHOT),
    "source_snapshot_sha256": sha(SNAPSHOT),
    "recorded_at": now
}
summary_path = RUNNER_ROOT / "validation" / "v2_initial_runner12_recovery.json"
if summary_path.exists():
    raise SystemExit(f"immutable recovery summary already exists: {summary_path}")
summary_path.write_text(json.dumps(summary, indent=2, sort_keys=True) + "\n", encoding="utf-8")
print(json.dumps(summary, indent=2, sort_keys=True))
