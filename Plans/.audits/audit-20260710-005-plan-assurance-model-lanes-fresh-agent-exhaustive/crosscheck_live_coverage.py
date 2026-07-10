#!/usr/bin/env python3
"""Independent set-oriented cross-check of Audit 005 live credit state."""

from __future__ import annotations

import hashlib
import json
from pathlib import Path


BASE = Path(__file__).resolve().parent
AUDIT = BASE.name
EXPECTED_TOTAL = 2538


def read(path: Path):
    return json.loads(path.read_bytes())


def digest(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def main() -> None:
    problems: set[str] = set()
    registries = sorted((BASE / "master/live").glob("credited_assignments.snapshot-*.json"))
    if not registries:
        print(json.dumps({"status": "fail", "problems": ["missing credited registry"]}, indent=2))
        raise SystemExit(1)
    registry_path = registries[-1]
    serial = registry_path.stem.split("-")[-1]
    coverage_path = BASE / "master/live" / f"coverage_state.snapshot-{serial}.json"
    registry = read(registry_path)
    coverage = read(coverage_path)

    credit_paths = sorted((BASE / "master/credits").glob("**/credit.json"))
    credit_rows = [(path, read(path)) for path in credit_paths]
    assignment_map = {}
    thread_map = {}
    for path, row in credit_rows:
        assignment = row.get("assignment_id")
        attempt = row.get("attempt_id")
        thread = row.get("task_thread_id")
        if assignment in assignment_map:
            problems.add(f"duplicate assignment credit:{assignment}")
        assignment_map[assignment] = path
        if thread in thread_map:
            problems.add(f"duplicate task identity:{thread}")
        thread_map[thread] = path
        if row.get("audit_id") != AUDIT or row.get("status") != "credited" or row.get("coverage_credit") != 1:
            problems.add(f"invalid credit envelope:{path}")
        result = BASE / "assignments" / str(assignment) / "attempts" / str(attempt) / "result.json"
        terminal = result.with_name("terminal_seal.json")
        if not result.is_file() or digest(result) != row.get("result_sha256"):
            problems.add(f"result closure failure:{assignment}/{attempt}")
        if not terminal.is_file() or digest(terminal) != row.get("terminal_seal_sha256"):
            problems.add(f"terminal closure failure:{assignment}/{attempt}")
        if terminal.is_file():
            terminal_row = read(terminal)
            if terminal_row.get("result_sha256") != row.get("result_sha256"):
                problems.add(f"terminal result binding failure:{assignment}/{attempt}")
        quarantine = BASE / "master/quarantine" / str(row.get("wave_id")) / str(assignment) / str(attempt) / "quarantine.json"
        if quarantine.exists():
            problems.add(f"credited quarantined attempt:{assignment}/{attempt}")

    actual_ids = sorted(assignment_map)
    canonical = json.dumps(actual_ids, separators=(",", ":")).encode()
    actual_digest = hashlib.sha256(canonical).hexdigest()
    if registry.get("audit_id") != AUDIT:
        problems.add("registry audit mismatch")
    if registry.get("credited_assignment_ids") != actual_ids:
        problems.add("registry set mismatch")
    if registry.get("credited_assignment_count") != len(actual_ids):
        problems.add("registry count mismatch")
    if registry.get("credited_assignment_ids_digest") != actual_digest:
        problems.add("registry digest mismatch")
    if coverage.get("audit_id") != AUDIT:
        problems.add("coverage audit mismatch")
    if coverage.get("substantive_coverage_credit") != len(actual_ids):
        problems.add("coverage credit mismatch")
    if coverage.get("accepted_assignments") != len(actual_ids):
        problems.add("coverage accepted mismatch")
    if coverage.get("pending_assignments") != EXPECTED_TOTAL - len(actual_ids):
        problems.add("coverage pending mismatch")
    if coverage.get("accepted_assignments", 0) + coverage.get("pending_assignments", 0) + coverage.get("blocked_assignments", 0) != EXPECTED_TOTAL:
        problems.add("coverage total mismatch")
    if coverage.get("complete") is not False:
        problems.add("premature complete state")

    report = {
        "audit_id": AUDIT,
        "checker": "live_coverage_set_crosscheck_v1",
        "status": "pass" if not problems else "fail",
        "credit_record_count": len(credit_rows),
        "unique_assignment_count": len(actual_ids),
        "unique_task_identity_count": len(thread_map),
        "pending_assignment_count": EXPECTED_TOTAL - len(actual_ids),
        "credited_assignment_ids_digest": actual_digest,
        "problem_count": len(problems),
        "problems": sorted(problems),
    }
    print(json.dumps(report, indent=2, sort_keys=True))
    raise SystemExit(0 if not problems else 1)


if __name__ == "__main__":
    main()
