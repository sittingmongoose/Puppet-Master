#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
import subprocess
import sys
from datetime import datetime, timezone
from pathlib import Path


AUDIT_ID = "audit-20260709-004-plan-assurance-horizontally-sharded-fresh-agent-blind-exhaustive"


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--runner-root", required=True)
    parser.add_argument("--completed-wave", type=int, required=True)
    parser.add_argument("--active-wave", type=int, required=True)
    parser.add_argument("--active-assignment-id", action="append", default=[])
    parser.add_argument("--state", default="dispatching")
    args = parser.parse_args()

    runner_root = Path(args.runner_root)
    validator = runner_root / "validation" / "validate_runner.py"
    proc = subprocess.run(
        [sys.executable, str(validator), "--mode", "partial"],
        check=False,
        text=True,
        capture_output=True,
    )
    report = json.loads(proc.stdout)
    if proc.returncode != 0 or not report.get("validator_passed"):
        print(proc.stdout)
        print(proc.stderr, file=sys.stderr)
        return 1
    report["completed_wave"] = args.completed_wave
    report["checkpointed_at"] = datetime.now(timezone.utc).isoformat(timespec="milliseconds").replace("+00:00", "Z")
    wave_path = runner_root / "validation" / f"wave-{args.completed_wave:04d}.json"
    wave_path.write_text(json.dumps(report, indent=2, sort_keys=True) + "\n", encoding="utf-8")
    checkpoint = {
        "audit_id": AUDIT_ID,
        "runner_id": "runner-12",
        "runner_thread_id": "019f49e2-1cad-7230-b892-72a2a4da54a4",
        "state": args.state,
        "authority_validated": True,
        "ready_status": "READY_FOR_RUNNERS",
        "packet_assignment_count": report["packet_assignment_count"],
        "valid_assignment_count": report["valid_assignment_count"],
        "failed_attempt_count": report["failed_attempt_count"],
        "unique_agent_count": report["unique_agent_instance_count"],
        "completed_wave": args.completed_wave,
        "active_wave": args.active_wave,
        "active_assignment_ids": args.active_assignment_id,
        "duplicate_identity_count": report["duplicate_agent_instance_count"],
        "recycled_identity_count": report["recycled_identity_count"],
        "multi_scope_count": report["multi_scope_count"],
        "updated_at": report["checkpointed_at"],
    }
    (runner_root / "checkpoint.json").write_text(json.dumps(checkpoint, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(checkpoint, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
