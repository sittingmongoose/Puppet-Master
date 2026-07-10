#!/usr/bin/env python3
"""Bind a terminal subset of one Audit 005 wave without crediting pending rows."""

from __future__ import annotations

import argparse
import hashlib
import json
import os
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parent
AUDIT_ID = ROOT.name


def sha(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def obj(path: Path) -> dict[str, Any]:
    value = json.loads(path.read_bytes())
    if not isinstance(value, dict):
        raise RuntimeError(f"object required: {path}")
    return value


def write_immutable(path: Path, value: dict[str, Any]) -> None:
    data = (json.dumps(value, indent=2, sort_keys=True) + "\n").encode()
    if path.exists():
        if path.read_bytes() != data:
            raise RuntimeError(f"immutable binding differs: {path}")
        return
    path.parent.mkdir(parents=True, exist_ok=True)
    temp = path.with_name(path.name + ".tmp")
    temp.write_bytes(data)
    os.replace(temp, path)


def existing_identities(current_dir: Path, excluded_receipts: set[Path]) -> tuple[set[str], set[str]]:
    native_ids: set[str] = set()
    agent_paths: set[str] = set()
    for path in sorted((ROOT / "master/runtime_bindings").glob("**/spawn_bindings.json")):
        if path.parent == current_dir:
            continue
        doc = obj(path)
        for row in doc.get("bindings", []):
            if isinstance(row, dict):
                if isinstance(row.get("native_child_thread_id"), str):
                    native_ids.add(row["native_child_thread_id"])
                if isinstance(row.get("agent_path"), str):
                    agent_paths.add(row["agent_path"])
    for path in sorted((ROOT / "master/dispatch").glob("**/dispatch_receipt.json")):
        if path in excluded_receipts:
            continue
        receipt = obj(path)
        for key in ("agent_path", "task_thread_id"):
            value = receipt.get(key)
            if isinstance(value, str) and value:
                agent_paths.add(value)
    return native_ids, agent_paths


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--wave-id", required=True)
    parser.add_argument("--checkpoint-id", required=True)
    parser.add_argument("--assignment-id", action="append", required=True)
    args = parser.parse_args()

    wave_dir = ROOT / "master/waves" / args.wave_id
    rows = [
        json.loads(line)
        for line in (wave_dir / "wave_assignment_manifest.jsonl").read_text().splitlines()
        if line.strip()
    ]
    if len(rows) != 8:
        raise RuntimeError("incremental checkpoint requires an eight-row source wave")
    row_by_id = {row["assignment_id"]: row for row in rows}
    selected = set(args.assignment_id)
    if len(selected) != len(args.assignment_id) or not selected or not selected <= set(row_by_id):
        raise RuntimeError("selected assignment set is empty, duplicated, or outside the wave")

    runtime_dir = ROOT / "master/runtime_bindings" / args.wave_id / "checkpoints" / args.checkpoint_id
    capture = obj(runtime_dir / "native_capture.json")
    if capture.get("audit_id") != AUDIT_ID or capture.get("wave_id") != args.wave_id:
        raise RuntimeError("native capture authority mismatch")
    if capture.get("checkpoint_id") != args.checkpoint_id:
        raise RuntimeError("native capture checkpoint mismatch")
    if capture.get("lane_turn_status") != "completed" or capture.get("lane_turn_error") is not None:
        raise RuntimeError("controller lane turn is not cleanly terminal")
    if capture.get("cohort_dispatcher_turn_status") != "completed" or capture.get("cohort_dispatcher_turn_error") is not None:
        raise RuntimeError("cohort dispatcher turn is not cleanly terminal")

    raw_leaves = capture.get("leaves", [])
    if not isinstance(raw_leaves, list) or len(raw_leaves) != len(selected):
        raise RuntimeError("capture leaf cardinality does not exactly equal selected set")
    leaves = {row["assignment_id"]: row for row in raw_leaves}
    if set(leaves) != selected:
        raise RuntimeError("capture assignment set does not exactly equal selected set")
    current_receipts = {
        ROOT / "master/dispatch" / args.wave_id / assignment_id
        / row_by_id[assignment_id]["attempt_id"] / "dispatch_receipt.json"
        for assignment_id in selected
    }
    existing_native, existing_paths = existing_identities(runtime_dir, current_receipts)
    local_native: set[str] = set()
    local_paths: set[str] = set()
    bindings: list[dict[str, Any]] = []
    statuses: list[dict[str, Any]] = []
    lane_thread_ids: set[str] = set()
    attempts: set[str] = set()

    for assignment_id in sorted(selected):
        manifest_row = row_by_id[assignment_id]
        attempt_id = manifest_row["attempt_id"]
        attempts.add(attempt_id)
        leaf = leaves[assignment_id]
        if not (
            leaf.get("native_child_thread_state") == "idle"
            and leaf.get("native_child_turn_status") == "completed"
            and leaf.get("native_child_turn_error") is None
            and leaf.get("terminal_response_prefix") == "PMR1"
        ):
            raise RuntimeError(f"leaf is not cleanly terminal: {assignment_id}")
        native_id = leaf.get("native_child_thread_id")
        agent_path = leaf.get("agent_path")
        if not isinstance(native_id, str) or not isinstance(agent_path, str):
            raise RuntimeError(f"missing native identity: {assignment_id}")
        if native_id in existing_native or native_id in local_native:
            raise RuntimeError(f"native identity reused: {native_id}")
        if agent_path in existing_paths or agent_path in local_paths:
            raise RuntimeError(f"agent path reused: {agent_path}")
        local_native.add(native_id)
        local_paths.add(agent_path)

        receipt_path = ROOT / "master/dispatch" / args.wave_id / assignment_id / attempt_id / "dispatch_receipt.json"
        receipt = obj(receipt_path)
        if receipt.get("assignment_id") != assignment_id or receipt.get("attempt_id") != attempt_id:
            raise RuntimeError(f"receipt assignment binding mismatch: {assignment_id}")
        if receipt.get("agent_path") != agent_path or receipt.get("task_thread_id") != agent_path:
            raise RuntimeError(f"leaf/receipt identity mismatch: {assignment_id}")
        lane_thread_ids.add(receipt.get("lane_thread_id"))
        bindings.append({
            "assignment_id": assignment_id,
            "native_child_thread_id": native_id,
            "agent_path": agent_path,
            "dispatch_receipt_sha256": sha(receipt_path.read_bytes()),
        })
        statuses.append({
            "native_child_thread_id": native_id,
            "native_child_turn_id": leaf["native_child_turn_id"],
            "native_child_thread_state": leaf["native_child_thread_state"],
            "native_child_turn_status": leaf["native_child_turn_status"],
            "native_child_turn_error": leaf["native_child_turn_error"],
            "terminal_response_prefix": leaf["terminal_response_prefix"],
        })

    if len(attempts) != 1 or len(lane_thread_ids) != 1:
        raise RuntimeError("mixed attempts or lane thread IDs")
    lane_thread_id = next(iter(lane_thread_ids))
    if lane_thread_id != capture.get("lane_thread_id"):
        raise RuntimeError("capture/receipt lane mismatch")

    spawn_doc = {
        "audit_id": AUDIT_ID,
        "wave_id": args.wave_id,
        "checkpoint_id": args.checkpoint_id,
        "attempt_id": next(iter(attempts)),
        "lane_thread_id": lane_thread_id,
        "lane_turn_id": capture["lane_turn_id"],
        "cohort_dispatcher_thread_id": capture["cohort_dispatcher_thread_id"],
        "cohort_dispatcher_turn_id": capture["cohort_dispatcher_turn_id"],
        "binding_count": len(bindings),
        "bindings": bindings,
        "pending_assignment_ids": sorted(set(row_by_id) - selected),
        "all_selected_fresh": True,
        "all_selected_unique": True,
        "coverage_credit": 0,
    }
    status_doc = {
        "audit_id": AUDIT_ID,
        "wave_id": args.wave_id,
        "checkpoint_id": args.checkpoint_id,
        "capture_basis": capture["capture_basis"],
        "cohort_dispatcher_thread_id": capture["cohort_dispatcher_thread_id"],
        "cohort_dispatcher_turn_id": capture["cohort_dispatcher_turn_id"],
        "statuses": statuses,
    }
    write_immutable(runtime_dir / "spawn_bindings.json", spawn_doc)
    write_immutable(runtime_dir / "native_terminal_statuses.json", status_doc)
    print(json.dumps({
        "status": "pass",
        "wave_id": args.wave_id,
        "checkpoint_id": args.checkpoint_id,
        "binding_count": len(bindings),
        "pending_count": len(rows) - len(bindings),
    }, indent=2, sort_keys=True))


if __name__ == "__main__":
    main()
