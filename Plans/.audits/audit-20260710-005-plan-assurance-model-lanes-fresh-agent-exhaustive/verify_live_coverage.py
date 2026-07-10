#!/usr/bin/env python3
"""Recompute Audit 005 live coverage exclusively from immutable credit records."""

from __future__ import annotations

import hashlib
import json
from collections import Counter
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parent
AUDIT_ID = ROOT.name
TOTAL_ASSIGNMENTS = 2538
COVERAGE_KEYS = {
    "audit_id",
    "schema_version",
    "complete",
    "substantive_coverage_credit",
    "accepted_assignments",
    "pending_assignments",
    "blocked_assignments",
    "current_phase",
}
REGISTRY_KEYS = {
    "audit_id",
    "schema_version",
    "credited_assignment_count",
    "credited_assignment_ids",
    "credited_assignment_ids_digest",
}


def sha(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def obj(path: Path) -> dict[str, Any]:
    value = json.loads(path.read_text(encoding="utf-8"))
    if not isinstance(value, dict):
        raise ValueError(f"{path}: object required")
    return value


def main() -> None:
    errors: list[str] = []

    def check(condition: bool, message: str) -> None:
        if not condition:
            errors.append(message)

    registries = sorted((ROOT / "master" / "live").glob("credited_assignments.snapshot-*.json"))
    if not registries:
        raise SystemExit("no credited assignment registry")
    registry_path = registries[-1]
    suffix = registry_path.stem.rsplit("-", 1)[1]
    coverage_path = ROOT / "master" / "live" / f"coverage_state.snapshot-{suffix}.json"
    registry = obj(registry_path)
    coverage = obj(coverage_path)

    check(set(coverage) == COVERAGE_KEYS, "coverage state field set mismatch")
    check(set(registry) == REGISTRY_KEYS, "credited registry field set mismatch")
    check(coverage.get("audit_id") == AUDIT_ID, "coverage audit_id mismatch")
    check(registry.get("audit_id") == AUDIT_ID, "registry audit_id mismatch")
    check(coverage.get("schema_version") == "coverage-state-v1", "coverage schema mismatch")
    check(registry.get("schema_version") == "credited-assignments-v1", "registry schema mismatch")

    credits: list[dict[str, Any]] = []
    credit_paths = sorted((ROOT / "master" / "credits").glob("**/credit.json"))
    for path in credit_paths:
        try:
            credit = obj(path)
            credits.append(credit)
            assignment_id = credit.get("assignment_id")
            attempt_id = credit.get("attempt_id")
            prefix = f"{assignment_id}/{attempt_id}"
            check(credit.get("audit_id") == AUDIT_ID, f"{prefix}: credit audit_id mismatch")
            check(credit.get("status") == "credited", f"{prefix}: status is not credited")
            check(credit.get("coverage_credit") == 1, f"{prefix}: credit amount is not one")
            result_path = ROOT / "assignments" / str(assignment_id) / "attempts" / str(attempt_id) / "result.json"
            terminal_path = result_path.with_name("terminal_seal.json")
            check(result_path.is_file(), f"{prefix}: result missing")
            check(terminal_path.is_file(), f"{prefix}: terminal seal missing")
            if result_path.is_file():
                check(sha(result_path.read_bytes()) == credit.get("result_sha256"), f"{prefix}: result hash mismatch")
                result = obj(result_path)
                check(result.get("assignment_id") == assignment_id, f"{prefix}: result assignment mismatch")
                check(result.get("attempt_id") == attempt_id, f"{prefix}: result attempt mismatch")
            if terminal_path.is_file():
                check(sha(terminal_path.read_bytes()) == credit.get("terminal_seal_sha256"), f"{prefix}: terminal hash mismatch")
                terminal = obj(terminal_path)
                check(terminal.get("assignment_id") == assignment_id, f"{prefix}: terminal assignment mismatch")
                check(terminal.get("attempt_id") == attempt_id, f"{prefix}: terminal attempt mismatch")
                check(terminal.get("result_sha256") == credit.get("result_sha256"), f"{prefix}: terminal/result hash mismatch")
            quarantine = ROOT / "master" / "quarantine" / str(credit.get("wave_id")) / str(assignment_id) / str(attempt_id) / "quarantine.json"
            check(not quarantine.exists(), f"{prefix}: same attempt is both credited and quarantined")
        except Exception as exc:
            errors.append(f"{path}: credit parse failure: {type(exc).__name__}: {exc}")

    ids = [credit.get("assignment_id") for credit in credits]
    threads = [credit.get("task_thread_id") for credit in credits]
    check(all(isinstance(value, str) and value for value in ids), "invalid credited assignment id")
    check(len(ids) == len(set(ids)), "duplicate credited assignment")
    check(all(isinstance(value, str) and value for value in threads), "invalid credited task identity")
    check(not [key for key, count in Counter(threads).items() if count > 1], "reused credited task identity")

    sorted_ids = sorted(ids)
    digest = sha(json.dumps(sorted_ids, separators=(",", ":")).encode())
    check(registry.get("credited_assignment_ids") == sorted_ids, "registry assignment set mismatch")
    check(registry.get("credited_assignment_count") == len(sorted_ids), "registry count mismatch")
    check(registry.get("credited_assignment_ids_digest") == digest, "registry digest mismatch")
    check(coverage.get("substantive_coverage_credit") == len(sorted_ids), "coverage credit mismatch")
    check(coverage.get("accepted_assignments") == len(sorted_ids), "coverage accepted count mismatch")
    check(coverage.get("pending_assignments") == TOTAL_ASSIGNMENTS - len(sorted_ids), "coverage pending count mismatch")
    check(coverage.get("blocked_assignments") == 0, "coverage blocked count mismatch")
    check(coverage.get("complete") is False, "coverage incorrectly complete")

    report = {
        "audit_id": AUDIT_ID,
        "checker": "live_coverage_recompute_v1",
        "status": "pass" if not errors else "fail",
        "coverage_snapshot": str(coverage_path.relative_to(ROOT)),
        "credited_registry": str(registry_path.relative_to(ROOT)),
        "credited_assignments": len(sorted_ids),
        "pending_assignments": TOTAL_ASSIGNMENTS - len(sorted_ids),
        "credited_assignment_ids_digest": digest,
        "error_count": len(errors),
        "errors": errors,
    }
    print(json.dumps(report, indent=2, sort_keys=True))
    raise SystemExit(0 if not errors else 1)


if __name__ == "__main__":
    main()
