#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
from collections import Counter
from datetime import datetime, timezone
from pathlib import Path
from typing import Any


AUDIT_ID = "audit-20260709-004-plan-assurance-horizontally-sharded-fresh-agent-blind-exhaustive"
RUNNER_ID = "runner-12"
RUNNER_THREAD_ID = "019f49e2-1cad-7230-b892-72a2a4da54a4"


def read_jsonl(path: Path) -> list[dict[str, Any]]:
    if not path.exists():
        return []
    rows: list[dict[str, Any]] = []
    for line in path.read_text(encoding="utf-8").splitlines():
        if line.strip():
            value = json.loads(line)
            if not isinstance(value, dict):
                raise ValueError(f"non-object JSONL row in {path}")
            rows.append(value)
    return rows


def duplicate_count(rows: list[dict[str, Any]], key: str) -> int:
    counts = Counter(str(row[key]) for row in rows if row.get(key))
    return sum(1 for count in counts.values() if count > 1)


def positive(row: dict[str, Any]) -> bool:
    status = str(row.get("validation_status") or row.get("status") or "").lower()
    return (
        row.get("coverage_credit") in (True, 1)
        and (
            row.get("validation_passed") is True
            or status in {"completed_valid", "validated", "passed", "valid", "accepted"}
        )
    )


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--runner-root", required=True)
    parser.add_argument("--completed-wave", type=int, required=True)
    parser.add_argument("--active-wave", type=int, required=True)
    parser.add_argument("--active-assignment-id", action="append", default=[])
    parser.add_argument("--state", default="dispatching")
    args = parser.parse_args()

    runner_root = Path(args.runner_root)
    audit_root = runner_root.parents[1]
    packet = read_jsonl(audit_root / "assignments" / f"{RUNNER_ID}.jsonl")
    registry = read_jsonl(runner_root / "fresh_agent_assignment_registry.jsonl")
    manifests = read_jsonl(runner_root / "result_manifest.jsonl")
    failures = read_jsonl(runner_root / "failed_attempts.jsonl")

    vetoed_attempts = {
        str(row.get("attempt_id")) for row in failures if row.get("attempt_id")
    }
    valid_rows = [
        row
        for row in manifests
        if positive(row) and str(row.get("attempt_id")) not in vetoed_attempts
    ]
    valid_assignment_ids = sorted(
        {str(row["assignment_id"]) for row in valid_rows if row.get("assignment_id")}
    )
    completed = [row for row in registry if row.get("completed_at")]
    running = [row for row in registry if not row.get("completed_at")]
    checkpointed_at = datetime.now(timezone.utc).isoformat(timespec="milliseconds").replace(
        "+00:00", "Z"
    )

    report = {
        "audit_id": AUDIT_ID,
        "runner_id": RUNNER_ID,
        "runner_thread_id": RUNNER_THREAD_ID,
        "validator_authority": "validators/VALIDATOR_AUTHORITY_V2.json",
        "validator_authority_mode": "runner-local prospective accounting; frozen global postrun remains authoritative",
        "state": args.state,
        "completed_wave": args.completed_wave,
        "active_wave": args.active_wave,
        "active_assignment_ids": args.active_assignment_id,
        "packet_assignment_count": len(packet),
        "registry_attempt_count": len(registry),
        "completed_attempt_count": len(completed),
        "active_attempt_count": len(running),
        "valid_assignment_count": len(valid_assignment_ids),
        "valid_assignment_ids": valid_assignment_ids,
        "failed_attempt_count": len(failures),
        "unique_agent_count": len({row.get("agent_instance_id") for row in registry if row.get("agent_instance_id")}),
        "duplicate_agent_instance_count": duplicate_count(registry, "agent_instance_id"),
        "duplicate_agent_path_count": duplicate_count(registry, "agent_path"),
        "duplicate_agent_thread_count": duplicate_count(registry, "agent_thread_id"),
        "multi_scope_count": 0,
        "session_total_tokens": sum(int(row.get("session_total_tokens") or 0) for row in completed),
        "checkpointed_at": checkpointed_at,
    }

    wave_path = runner_root / "validation" / f"wave-{args.completed_wave:04d}.json"
    if wave_path.exists():
        raise FileExistsError(f"immutable wave checkpoint already exists: {wave_path}")
    wave_path.write_text(json.dumps(report, indent=2, sort_keys=True) + "\n", encoding="utf-8")

    checkpoint = dict(report)
    checkpoint.pop("valid_assignment_ids")
    (runner_root / "checkpoint.json").write_text(
        json.dumps(checkpoint, indent=2, sort_keys=True) + "\n", encoding="utf-8"
    )
    print(json.dumps(checkpoint, indent=2, sort_keys=True))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
