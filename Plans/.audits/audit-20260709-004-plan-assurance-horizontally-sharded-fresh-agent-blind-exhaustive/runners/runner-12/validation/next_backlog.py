#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
from pathlib import Path
from typing import Any


def read_jsonl(path: Path) -> list[dict[str, Any]]:
    if not path.exists():
        return []
    return [json.loads(line) for line in path.read_text(encoding="utf-8").splitlines() if line.strip()]


def positive(row: dict[str, Any]) -> bool:
    status = str(row.get("validation_status") or row.get("status") or "").lower()
    return row.get("coverage_credit") in (True, 1) and (
        row.get("validation_passed") is True
        or status in {"completed_valid", "validated", "passed", "valid", "accepted"}
    )


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--runner-root", required=True)
    parser.add_argument("--limit", type=int, default=3)
    args = parser.parse_args()
    runner_root = Path(args.runner_root)
    audit_root = runner_root.parents[1]
    packet = read_jsonl(audit_root / "assignments" / "runner-12.jsonl")
    registry = read_jsonl(runner_root / "fresh_agent_assignment_registry.jsonl")
    manifests = read_jsonl(runner_root / "result_manifest.jsonl")
    failures = read_jsonl(runner_root / "failed_attempts.jsonl")

    vetoed = {str(row.get("attempt_id")) for row in failures if row.get("attempt_id")}
    valid = {
        str(row.get("assignment_id"))
        for row in manifests
        if row.get("assignment_id") and positive(row) and str(row.get("attempt_id")) not in vetoed
    }
    running = {
        str(row.get("assignment_id"))
        for row in registry
        if row.get("assignment_id") and not row.get("completed_at")
    }
    attempts: dict[str, int] = {}
    for row in registry:
        assignment_id = str(row.get("assignment_id"))
        attempts[assignment_id] = attempts.get(assignment_id, 0) + 1

    backlog = [
        row for row in packet if row.get("assignment_id") not in valid and row.get("assignment_id") not in running
    ]
    backlog.sort(key=lambda row: (-int(attempts.get(str(row.get("assignment_id")), 0) > 0), int(row["assignment_seq"])))
    for row in backlog[: args.limit]:
        print(
            json.dumps(
                {
                    "assignment_id": row["assignment_id"],
                    "assignment_seq": row["assignment_seq"],
                    "prior_attempts": attempts.get(str(row["assignment_id"]), 0),
                    "document_path": row["document_path"],
                    "capsule_ref": row["capsule_ref"],
                },
                sort_keys=True,
            )
        )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
