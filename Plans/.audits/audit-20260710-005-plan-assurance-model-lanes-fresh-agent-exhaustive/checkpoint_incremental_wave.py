#!/usr/bin/env python3
"""Credit a dual-validated terminal subset while preserving other wave rows as pending."""

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
            raise RuntimeError(f"immutable artifact differs: {path}")
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
        raise RuntimeError(f"no JSON from {' '.join(command)}: {process.stderr}")
    value = json.loads(process.stdout)
    if not isinstance(value, dict):
        raise RuntimeError(f"non-object report from {' '.join(command)}")
    if process.returncode != 0:
        raise RuntimeError(f"checker failed: {' '.join(command)}: {value}")
    return value


def serial_number(path: Path) -> int:
    return int(path.stem.rsplit("-", 1)[1])


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--wave-id", required=True)
    parser.add_argument("--epoch-id", required=True)
    parser.add_argument("--checkpoint-id", required=True)
    parser.add_argument("--assignment-id", action="append", required=True)
    parser.add_argument("--snapshot-serial", required=True)
    args = parser.parse_args()

    wave_dir = ROOT / "master/waves" / args.wave_id
    wave_plan = load(wave_dir / "wave_plan.json")
    if wave_plan.get("epoch_id") != args.epoch_id:
        raise RuntimeError("wave/epoch mismatch")
    rows = [
        json.loads(line)
        for line in (wave_dir / "wave_assignment_manifest.jsonl").read_text().splitlines()
        if line.strip()
    ]
    if len(rows) != 8:
        raise RuntimeError("incremental checkpoint source wave must contain exactly eight assignments")
    row_by_id = {row["assignment_id"]: row for row in rows}
    selected = set(args.assignment_id)
    if len(selected) != len(args.assignment_id) or not selected or not selected <= set(row_by_id):
        raise RuntimeError("selected assignment set is empty, duplicated, or outside the wave")

    primary = run_json(["python3", "validate_wave.py", "--wave-id", args.wave_id], args.epoch_id)
    cross = run_json(["python3", "crosscheck_wave.py", "--wave-id", args.wave_id], args.epoch_id)
    primary_rows = {row["assignment_id"]: row for row in primary["results"]}
    cross_rows = {row["assignment_id"]: row for row in cross["results"]}
    if set(primary_rows) != set(row_by_id) or set(cross_rows) != set(row_by_id):
        raise RuntimeError("validator assignment universe mismatch")
    primary_eligible = set(primary.get("credited_assignment_ids", []))
    cross_eligible = set(cross.get("eligible_assignment_ids", []))
    if primary_eligible != cross_eligible:
        raise RuntimeError("primary/cross eligible sets disagree")
    if not selected <= primary_eligible:
        raise RuntimeError("selected assignment is not dual eligible")
    for assignment_id in row_by_id:
        pstate = primary_rows[assignment_id].get("status")
        cstate = cross_rows[assignment_id].get("state")
        if (pstate, cstate) not in {("accepted", "eligible"), ("pending", "pending"), ("quarantined", "rejected")}:
            raise RuntimeError(f"primary/cross state mismatch: {assignment_id}: {pstate}/{cstate}")

    existing_credit_paths = sorted((ROOT / "master/credits").glob("**/credit.json"))
    existing_credits = [load(path) for path in existing_credit_paths]
    resumable_current = {
        row["assignment_id"]
        for row in existing_credits
        if row.get("wave_id") == args.wave_id
        and row.get("checkpoint_id") == args.checkpoint_id
        and row.get("assignment_id") in selected
    }
    credited_ids_all = {row["assignment_id"] for row in existing_credits}
    if (selected & credited_ids_all) - resumable_current:
        raise RuntimeError("selected assignment already has unrelated credit")
    prior_credits = [row for row in existing_credits if row.get("assignment_id") not in resumable_current]
    credited_ids_before = {row["assignment_id"] for row in prior_credits}
    unselected_eligible = primary_eligible - selected
    if not unselected_eligible <= credited_ids_before:
        raise RuntimeError("incremental checkpoint would suppress another uncredited eligible assignment")

    pending_ids: set[str] = set()
    for assignment_id, row in row_by_id.items():
        if assignment_id in selected or assignment_id in credited_ids_before:
            continue
        if primary_rows[assignment_id].get("status") != "pending" or cross_rows[assignment_id].get("state") != "pending":
            raise RuntimeError(f"unselected uncredited row is not pending: {assignment_id}")
        pending_ids.add(assignment_id)
        attempt_id = row["attempt_id"]
        receipt = ROOT / "master/dispatch" / args.wave_id / assignment_id / attempt_id / "dispatch_receipt.json"
        result = ROOT / row["output_directory"] / "result.json"
        terminal = result.with_name("terminal_seal.json")
        credit = ROOT / "master/credits" / args.wave_id / assignment_id / attempt_id / "credit.json"
        quarantine = ROOT / "master/quarantine" / args.wave_id / assignment_id / attempt_id / "quarantine.json"
        if any(path.exists() for path in (receipt, result, terminal, credit, quarantine)):
            raise RuntimeError(f"pending row has attempt material: {assignment_id}")

    runtime_dir = ROOT / "master/runtime_bindings" / args.wave_id / "checkpoints" / args.checkpoint_id
    bindings_path = runtime_dir / "spawn_bindings.json"
    statuses_path = runtime_dir / "native_terminal_statuses.json"
    bindings_doc = load(bindings_path)
    statuses_doc = load(statuses_path)
    bindings = {row["assignment_id"]: row for row in bindings_doc.get("bindings", [])}
    statuses = {row["native_child_thread_id"]: row for row in statuses_doc.get("statuses", [])}
    if set(bindings) != selected or len(statuses) != len(selected):
        raise RuntimeError("incremental runtime binding cardinality/set mismatch")
    if bindings_doc.get("checkpoint_id") != args.checkpoint_id or statuses_doc.get("checkpoint_id") != args.checkpoint_id:
        raise RuntimeError("runtime checkpoint identity mismatch")
    if set(bindings_doc.get("pending_assignment_ids", [])) != pending_ids:
        raise RuntimeError("runtime pending set mismatch")

    existing_tasks = {row.get("task_thread_id") for row in prior_credits}
    existing_native = {row.get("native_child_thread_id") for row in prior_credits}
    selected_tasks: set[str] = set()
    selected_native: set[str] = set()
    prepared: list[dict[str, Any]] = []
    stable_inputs: dict[Path, str] = {
        wave_dir / "wave_plan.json": sha((wave_dir / "wave_plan.json").read_bytes()),
        wave_dir / "wave_assignment_manifest.jsonl": sha((wave_dir / "wave_assignment_manifest.jsonl").read_bytes()),
        wave_dir / "wave_authority.json": sha((wave_dir / "wave_authority.json").read_bytes()),
        bindings_path: sha(bindings_path.read_bytes()),
        statuses_path: sha(statuses_path.read_bytes()),
    }

    for assignment_id in sorted(selected):
        manifest_row = row_by_id[assignment_id]
        attempt_id = manifest_row["attempt_id"]
        binding = bindings[assignment_id]
        native_id = binding["native_child_thread_id"]
        status = statuses.get(native_id)
        if not status or not (
            status.get("native_child_thread_state") == "idle"
            and status.get("native_child_turn_status") == "completed"
            and status.get("native_child_turn_error") is None
            and status.get("terminal_response_prefix") == "PMR1"
        ):
            raise RuntimeError(f"native task is not cleanly terminal: {assignment_id}")
        if native_id in existing_native or native_id in selected_native:
            raise RuntimeError(f"credited native identity reuse: {native_id}")
        selected_native.add(native_id)

        receipt_path = ROOT / "master/dispatch" / args.wave_id / assignment_id / attempt_id / "dispatch_receipt.json"
        result_path = ROOT / manifest_row["output_directory"] / "result.json"
        terminal_path = result_path.with_name("terminal_seal.json")
        receipt = load(receipt_path)
        result = load(result_path)
        terminal = load(terminal_path)
        for path in (receipt_path, result_path, terminal_path):
            stable_inputs[path] = sha(path.read_bytes())
        receipt_sha = stable_inputs[receipt_path]
        result_sha = stable_inputs[result_path]
        terminal_sha = stable_inputs[terminal_path]
        if binding.get("dispatch_receipt_sha256") != receipt_sha:
            raise RuntimeError(f"dispatch receipt changed: {assignment_id}")
        task_path = binding.get("agent_path")
        if receipt.get("agent_path") != task_path or receipt.get("task_thread_id") != task_path:
            raise RuntimeError(f"receipt/runtime path mismatch: {assignment_id}")
        if result.get("task_thread_id") != task_path or result.get("assignment_id") != assignment_id:
            raise RuntimeError(f"result identity mismatch: {assignment_id}")
        if result.get("attempt_id") != attempt_id or terminal.get("attempt_id") != attempt_id:
            raise RuntimeError(f"attempt identity mismatch: {assignment_id}")
        if terminal.get("result_sha256") != result_sha:
            raise RuntimeError(f"terminal/result hash mismatch: {assignment_id}")
        if primary_rows[assignment_id].get("result_sha256") != result_sha:
            raise RuntimeError(f"primary result hash mismatch: {assignment_id}")
        if cross_rows[assignment_id].get("result_sha256") != result_sha:
            raise RuntimeError(f"cross result hash mismatch: {assignment_id}")
        if primary_rows[assignment_id].get("terminal_seal_sha256") != terminal_sha:
            raise RuntimeError(f"primary terminal hash mismatch: {assignment_id}")
        if cross_rows[assignment_id].get("terminal_seal_sha256") != terminal_sha:
            raise RuntimeError(f"cross terminal hash mismatch: {assignment_id}")
        if task_path in existing_tasks or task_path in selected_tasks:
            raise RuntimeError(f"credited task identity reuse: {task_path}")
        selected_tasks.add(task_path)
        prepared.append({
            "assignment_id": assignment_id,
            "attempt_id": attempt_id,
            "binding": binding,
            "status": status,
            "receipt_sha": receipt_sha,
            "result": result,
            "result_sha": result_sha,
            "terminal_sha": terminal_sha,
            "result_bytes": len(result_path.read_bytes()),
        })

    live_dir = ROOT / "master/live"
    registry_path = live_dir / f"credited_assignments.snapshot-{args.snapshot_serial}.json"
    coverage_path = live_dir / f"coverage_state.snapshot-{args.snapshot_serial}.json"
    if registry_path.exists() or coverage_path.exists():
        raise RuntimeError("requested live snapshot serial already exists")
    prior_registries = sorted(live_dir.glob("credited_assignments.snapshot-*.json"))
    if not prior_registries or int(args.snapshot_serial) != serial_number(prior_registries[-1]) + 1:
        raise RuntimeError("snapshot serial must be exactly one greater than current live registry")

    validation_dir = ROOT / "master/validation" / args.wave_id / "checkpoints" / args.checkpoint_id
    primary_path = validation_dir / "primary.json"
    cross_path = validation_dir / "cross.json"
    write_immutable(primary_path, primary)
    write_immutable(cross_path, cross)
    primary_snapshot_sha = sha(primary_path.read_bytes())
    cross_snapshot_sha = sha(cross_path.read_bytes())
    spawn_sha = sha(bindings_path.read_bytes())

    # Recheck every authority-bearing input immediately before promotion.
    for path, expected in stable_inputs.items():
        if sha(path.read_bytes()) != expected:
            raise RuntimeError(f"input changed during checkpoint transaction: {path}")

    for row in prepared:
        assignment_id = row["assignment_id"]
        attempt_id = row["attempt_id"]
        binding = row["binding"]
        status = row["status"]
        terminal_binding = {
            "audit_id": AUDIT_ID,
            "wave_id": args.wave_id,
            "checkpoint_id": args.checkpoint_id,
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
            "dispatch_receipt_sha256": row["receipt_sha"],
            "result_sha256": row["result_sha"],
            "terminal_seal_sha256": row["terminal_sha"],
            "result_bytes": row["result_bytes"],
            "item_count": len(row["result"].get("items", [])),
            "fresh_identity_confirmed": True,
            "coverage_credit_before_dual_validation": 0,
        }
        terminal_binding_path = ROOT / "master/runtime_bindings" / args.wave_id / assignment_id / attempt_id / "terminal_binding.json"
        write_immutable(terminal_binding_path, terminal_binding)
        credit = {
            "audit_id": AUDIT_ID,
            "wave_id": args.wave_id,
            "checkpoint_id": args.checkpoint_id,
            "assignment_id": assignment_id,
            "attempt_id": attempt_id,
            "status": "credited",
            "coverage_credit": 1,
            "task_thread_id": row["result"]["task_thread_id"],
            "native_child_thread_id": binding["native_child_thread_id"],
            "result_sha256": row["result_sha"],
            "terminal_seal_sha256": row["terminal_sha"],
            "primary_validator": primary["validator"],
            "primary_validation_snapshot_sha256": primary_snapshot_sha,
            "independent_checker": cross["checker"],
            "independent_validation_snapshot_sha256": cross_snapshot_sha,
            "independent_result_sha256": cross_rows[assignment_id]["result_sha256"],
            "independent_terminal_seal_sha256": cross_rows[assignment_id]["terminal_seal_sha256"],
            "spawn_binding_sha256": spawn_sha,
            "terminal_binding_sha256": sha(terminal_binding_path.read_bytes()),
            "runtime_identity_unique_across_receipts": True,
            "native_terminal_state_confirmed": True,
        }
        credit_path = ROOT / "master/credits" / args.wave_id / assignment_id / attempt_id / "credit.json"
        write_immutable(credit_path, credit)

    all_credits = [load(path) for path in sorted((ROOT / "master/credits").glob("**/credit.json"))]
    credited_ids = sorted(row["assignment_id"] for row in all_credits)
    credited_tasks = [row["task_thread_id"] for row in all_credits]
    credited_native = [
        row.get("native_child_thread_id")
        for row in all_credits
        if isinstance(row.get("native_child_thread_id"), str) and row.get("native_child_thread_id")
    ]
    if len(credited_ids) != len(set(credited_ids)):
        raise RuntimeError("global credited assignment uniqueness failure")
    if len(credited_tasks) != len(set(credited_tasks)):
        raise RuntimeError("global credited task identity uniqueness failure")
    if len(credited_native) != len(set(credited_native)):
        raise RuntimeError("global credited native identity uniqueness failure")
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
        "current_phase": f"blind_window_review_{args.wave_id}_{args.checkpoint_id}_checkpointed",
    }
    write_immutable(registry_path, registry)
    write_immutable(coverage_path, coverage)

    primary_live = run_json(["python3", "verify_live_coverage.py"], args.epoch_id)
    cross_live = run_json(["python3", "crosscheck_live_coverage.py"], args.epoch_id)
    primary_live_path = ROOT / "master/validation/live-coverage" / f"snapshot-{args.snapshot_serial}-primary.json"
    cross_live_path = ROOT / "master/validation/live-coverage" / f"snapshot-{args.snapshot_serial}-cross.json"
    write_immutable(primary_live_path, primary_live)
    write_immutable(cross_live_path, cross_live)
    if primary_live.get("status") != "pass" or cross_live.get("status") != "pass":
        raise RuntimeError("live coverage validation failed")

    checkpoint_receipt = {
        "audit_id": AUDIT_ID,
        "schema_version": "incremental-wave-checkpoint-v1",
        "wave_id": args.wave_id,
        "checkpoint_id": args.checkpoint_id,
        "epoch_id": args.epoch_id,
        "terminal_wave": False,
        "credited_this_checkpoint": len(selected),
        "credited_assignment_ids": sorted(selected),
        "wave_pending": len(pending_ids),
        "pending_assignment_ids": sorted(pending_ids),
        "primary_validation_sha256": primary_snapshot_sha,
        "independent_validation_sha256": cross_snapshot_sha,
        "runtime_spawn_bindings_sha256": spawn_sha,
        "runtime_statuses_sha256": sha(statuses_path.read_bytes()),
        "credited_registry_sha256": sha(registry_path.read_bytes()),
        "coverage_state_sha256": sha(coverage_path.read_bytes()),
        "live_primary_validation_sha256": sha(primary_live_path.read_bytes()),
        "live_cross_validation_sha256": sha(cross_live_path.read_bytes()),
        "live_credited_assignments": len(credited_ids),
        "live_pending_assignments": TOTAL_ASSIGNMENTS - len(credited_ids),
        "status": "pass",
    }
    receipt_path = validation_dir / "checkpoint_receipt.json"
    write_immutable(receipt_path, checkpoint_receipt)
    print(json.dumps({
        "status": "pass",
        "wave_id": args.wave_id,
        "checkpoint_id": args.checkpoint_id,
        "credited_this_checkpoint": len(selected),
        "wave_pending": len(pending_ids),
        "live_credited_assignments": len(credited_ids),
        "live_pending_assignments": TOTAL_ASSIGNMENTS - len(credited_ids),
        "credited_assignment_ids_digest": ids_digest,
    }, indent=2, sort_keys=True))


if __name__ == "__main__":
    main()
