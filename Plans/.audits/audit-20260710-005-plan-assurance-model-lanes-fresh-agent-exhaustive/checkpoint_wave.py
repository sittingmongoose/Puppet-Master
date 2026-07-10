#!/usr/bin/env python3
"""Fail-closed, append-only checkpointing for one fully terminal Audit 005 wave."""

from __future__ import annotations

import argparse
import hashlib
import json
import os
import subprocess
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parent
AUDIT_ID = ROOT.name
TOTAL_ASSIGNMENTS = 2538


def sha(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def load(path: Path) -> Any:
    return json.loads(path.read_bytes())


def encoded(value: Any) -> bytes:
    return (json.dumps(value, indent=2, sort_keys=True) + "\n").encode()


def write_immutable(path: Path, value: Any) -> None:
    data = encoded(value)
    if path.exists():
        if path.read_bytes() != data:
            raise SystemExit(f"immutable artifact differs: {path}")
        return
    path.parent.mkdir(parents=True, exist_ok=True)
    temp = path.with_name(path.name + ".tmp")
    temp.write_bytes(data)
    os.replace(temp, path)


def run_json(command: list[str], epoch_id: str) -> dict[str, Any]:
    env = dict(os.environ)
    env["AUDIT005_EPOCH"] = epoch_id
    process = subprocess.run(command, cwd=ROOT, env=env, check=False, capture_output=True, text=True)
    if not process.stdout.strip():
        raise SystemExit(f"no JSON from {' '.join(command)}: {process.stderr}")
    value = json.loads(process.stdout)
    if not isinstance(value, dict):
        raise SystemExit(f"non-object report from {' '.join(command)}")
    return value


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--wave-id", required=True)
    parser.add_argument("--epoch-id", required=True)
    parser.add_argument("--snapshot-serial", required=True)
    args = parser.parse_args()

    wave_dir = ROOT / "master" / "waves" / args.wave_id
    wave_plan = load(wave_dir / "wave_plan.json")
    if wave_plan.get("epoch_id") != args.epoch_id:
        raise SystemExit("wave/epoch mismatch")
    rows = [json.loads(line) for line in (wave_dir / "wave_assignment_manifest.jsonl").read_text().splitlines() if line.strip()]
    if len(rows) != 8:
        raise SystemExit("regular wave must contain exactly eight assignments")

    primary = run_json(["python3", "validate_wave.py", "--wave-id", args.wave_id], args.epoch_id)
    cross = run_json(["python3", "crosscheck_wave.py", "--wave-id", args.wave_id], args.epoch_id)
    if primary.get("counts", {}).get("pending") != 0 or cross.get("counts", {}).get("pending") != 0:
        raise SystemExit("wave is not fully terminal")
    primary_ids = set(primary.get("credited_assignment_ids", []))
    cross_ids = set(cross.get("eligible_assignment_ids", []))
    if primary_ids != cross_ids:
        raise SystemExit("primary/cross eligible sets disagree")

    validation_dir = ROOT / "master" / "validation" / args.wave_id
    primary_path = validation_dir / "snapshot-0001-primary.json"
    cross_path = validation_dir / "snapshot-0001-cross.json"
    write_immutable(primary_path, primary)
    write_immutable(cross_path, cross)
    primary_snapshot_sha = sha(primary_path.read_bytes())
    cross_snapshot_sha = sha(cross_path.read_bytes())

    bindings_path = ROOT / "master" / "runtime_bindings" / args.wave_id / "spawn_bindings.json"
    statuses_path = ROOT / "master" / "runtime_bindings" / args.wave_id / "native_terminal_statuses.json"
    bindings_doc = load(bindings_path)
    statuses_doc = load(statuses_path)
    bindings = {row["assignment_id"]: row for row in bindings_doc["bindings"]}
    statuses = {row["native_child_thread_id"]: row for row in statuses_doc["statuses"]}
    if len(bindings) != len(rows) or len(statuses) != len(rows):
        raise SystemExit("runtime binding cardinality mismatch")
    native_ids = [row["native_child_thread_id"] for row in bindings.values()]
    if len(native_ids) != len(set(native_ids)):
        raise SystemExit("native child identity reused within wave")

    primary_results = {row["assignment_id"]: row for row in primary["results"]}
    cross_results = {row["assignment_id"]: row for row in cross["results"]}
    spawn_sha = sha(bindings_path.read_bytes())

    for assignment in rows:
        assignment_id = assignment["assignment_id"]
        attempt_id = assignment["attempt_id"]
        binding = bindings[assignment_id]
        status = statuses[binding["native_child_thread_id"]]
        if not (
            status.get("native_child_thread_state") == "idle"
            and status.get("native_child_turn_status") == "completed"
            and status.get("native_child_turn_error") is None
            and status.get("terminal_response_prefix") == "PMR1"
        ):
            raise SystemExit(f"native task is not cleanly terminal: {assignment_id}")

        receipt_path = ROOT / "master" / "dispatch" / args.wave_id / assignment_id / attempt_id / "dispatch_receipt.json"
        result_path = ROOT / assignment["output_directory"] / "result.json"
        terminal_path = result_path.with_name("terminal_seal.json")
        receipt = load(receipt_path)
        result = load(result_path)
        terminal = load(terminal_path)
        receipt_sha = sha(receipt_path.read_bytes())
        result_sha = sha(result_path.read_bytes())
        terminal_sha = sha(terminal_path.read_bytes())
        if binding["dispatch_receipt_sha256"] != receipt_sha:
            raise SystemExit(f"dispatch receipt changed: {assignment_id}")
        if result.get("task_thread_id") != binding["agent_path"] or receipt.get("agent_path") != binding["agent_path"]:
            raise SystemExit(f"agent path mismatch: {assignment_id}")
        if terminal.get("result_sha256") != result_sha:
            raise SystemExit(f"terminal/result mismatch: {assignment_id}")

        terminal_binding = {
            "audit_id": AUDIT_ID,
            "wave_id": args.wave_id,
            "assignment_id": assignment_id,
            "attempt_id": attempt_id,
            "lane_thread_id": bindings_doc["lane_thread_id"],
            "lane_turn_id": bindings_doc["lane_turn_id"],
            "lane_turn_status": "completed",
            "native_child_thread_id": binding["native_child_thread_id"],
            "native_child_turn_id": status["native_child_turn_id"],
            "native_child_thread_state": status["native_child_thread_state"],
            "native_child_turn_status": status["native_child_turn_status"],
            "native_child_turn_error": status["native_child_turn_error"],
            "agent_path": binding["agent_path"],
            "terminal_response_prefix": status["terminal_response_prefix"],
            "dispatch_receipt_sha256": receipt_sha,
            "result_sha256": result_sha,
            "terminal_seal_sha256": terminal_sha,
            "result_bytes": len(result_path.read_bytes()),
            "item_count": len(result.get("items", [])),
            "fresh_identity_confirmed": True,
            "coverage_credit_before_dual_validation": 0,
        }
        terminal_binding_path = ROOT / "master" / "runtime_bindings" / args.wave_id / assignment_id / attempt_id / "terminal_binding.json"
        write_immutable(terminal_binding_path, terminal_binding)

        if assignment_id in primary_ids:
            credit = {
                "audit_id": AUDIT_ID,
                "wave_id": args.wave_id,
                "assignment_id": assignment_id,
                "attempt_id": attempt_id,
                "status": "credited",
                "coverage_credit": 1,
                "task_thread_id": result["task_thread_id"],
                "native_child_thread_id": binding["native_child_thread_id"],
                "result_sha256": result_sha,
                "terminal_seal_sha256": terminal_sha,
                "primary_validator": primary["validator"],
                "primary_validation_snapshot_sha256": primary_snapshot_sha,
                "independent_checker": cross["checker"],
                "independent_validation_snapshot_sha256": cross_snapshot_sha,
                "independent_result_sha256": cross_results[assignment_id]["result_sha256"],
                "independent_terminal_seal_sha256": cross_results[assignment_id]["terminal_seal_sha256"],
                "spawn_binding_sha256": spawn_sha,
                "terminal_binding_sha256": sha(terminal_binding_path.read_bytes()),
                "runtime_identity_unique_across_receipts": True,
                "native_terminal_state_confirmed": True,
            }
            credit_path = ROOT / "master" / "credits" / args.wave_id / assignment_id / attempt_id / "credit.json"
            write_immutable(credit_path, credit)
        else:
            quarantine = {
                "audit_id": AUDIT_ID,
                "wave_id": args.wave_id,
                "assignment_id": assignment_id,
                "attempt_id": attempt_id,
                "status": "quarantined_zero_credit",
                "reason": "assignment content failed both independent evidence validators",
                "task_thread_id": result["task_thread_id"],
                "native_child_thread_id": binding["native_child_thread_id"],
                "primary_errors": primary_results[assignment_id]["errors"],
                "independent_errors": cross_results[assignment_id]["errors"],
                "result_sha256": result_sha,
                "terminal_seal_sha256": terminal_sha,
                "preserve_artifacts": True,
                "retry_requires_fresh_identity": True,
                "coverage_credit": 0,
            }
            quarantine_path = ROOT / "master" / "quarantine" / args.wave_id / assignment_id / attempt_id / "quarantine.json"
            write_immutable(quarantine_path, quarantine)

    credits = [load(path) for path in sorted((ROOT / "master" / "credits").glob("**/credit.json"))]
    credited_ids = sorted(row["assignment_id"] for row in credits)
    credited_threads = [row["task_thread_id"] for row in credits]
    if len(credited_ids) != len(set(credited_ids)) or len(credited_threads) != len(set(credited_threads)):
        raise SystemExit("global credit identity uniqueness failure")
    ids_digest = sha(json.dumps(credited_ids, separators=(",", ":")).encode())
    registry = {
        "audit_id": AUDIT_ID,
        "schema_version": "credited-assignments-v1",
        "credited_assignment_count": len(credited_ids),
        "credited_assignment_ids": credited_ids,
        "credited_assignment_ids_digest": ids_digest,
    }
    coverage = {
        "audit_id": AUDIT_ID,
        "schema_version": "coverage-state-v1",
        "complete": False,
        "substantive_coverage_credit": len(credited_ids),
        "accepted_assignments": len(credited_ids),
        "pending_assignments": TOTAL_ASSIGNMENTS - len(credited_ids),
        "blocked_assignments": 0,
        "current_phase": f"blind_window_review_{args.wave_id}_checkpointed",
    }
    registry_path = ROOT / "master" / "live" / f"credited_assignments.snapshot-{args.snapshot_serial}.json"
    coverage_path = ROOT / "master" / "live" / f"coverage_state.snapshot-{args.snapshot_serial}.json"
    write_immutable(registry_path, registry)
    write_immutable(coverage_path, coverage)

    primary_live = run_json(["python3", "verify_live_coverage.py"], args.epoch_id)
    cross_live = run_json(["python3", "crosscheck_live_coverage.py"], args.epoch_id)
    write_immutable(ROOT / "master" / "validation" / "live-coverage" / f"snapshot-{args.snapshot_serial}-primary.json", primary_live)
    write_immutable(ROOT / "master" / "validation" / "live-coverage" / f"snapshot-{args.snapshot_serial}-cross.json", cross_live)
    if primary_live.get("status") != "pass" or cross_live.get("status") != "pass":
        raise SystemExit("live coverage validation failed")

    print(json.dumps({
        "status": "pass",
        "wave_id": args.wave_id,
        "accepted_this_wave": len(primary_ids),
        "quarantined_this_wave": len(rows) - len(primary_ids),
        "live_credited_assignments": len(credited_ids),
        "live_pending_assignments": TOTAL_ASSIGNMENTS - len(credited_ids),
        "credited_assignment_ids_digest": ids_digest,
    }, indent=2, sort_keys=True))


if __name__ == "__main__":
    main()
