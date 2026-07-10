#!/usr/bin/env python3
"""Bind observed native child closures to one Audit 005 cohort's immutable receipts."""

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


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--wave-id", required=True)
    parser.add_argument("--lane-turn-id", required=True)
    parser.add_argument("--dispatcher-thread-id", required=True)
    parser.add_argument("--dispatcher-turn-id", required=True)
    args = parser.parse_args()

    runtime_dir = ROOT / "master/runtime_bindings" / args.wave_id
    capture = obj(runtime_dir / "native_capture.json")
    rows = [json.loads(line) for line in (ROOT / "master/waves" / args.wave_id / "wave_assignment_manifest.jsonl").read_text().splitlines() if line.strip()]
    if len(rows) != 8 or len(capture.get("leaves", [])) != 8:
        raise RuntimeError("cohort capture cardinality must be eight")
    leaves = {row["assignment_id"]: row for row in capture["leaves"]}
    if set(leaves) != {row["assignment_id"] for row in rows}:
        raise RuntimeError("capture assignment set mismatch")
    attempts = {row["attempt_id"] for row in rows}
    if len(attempts) != 1:
        raise RuntimeError("mixed cohort attempts")
    attempt_id = next(iter(attempts))

    bindings = []
    statuses = []
    native_ids = []
    lane_thread_ids = set()
    for row in rows:
        assignment_id = row["assignment_id"]
        leaf = leaves[assignment_id]
        if not (
            leaf.get("native_child_thread_state") == "idle"
            and leaf.get("native_child_turn_status") == "completed"
            and leaf.get("native_child_turn_error") is None
            and leaf.get("terminal_response_prefix") == "PMR1"
        ):
            raise RuntimeError(f"leaf is not cleanly terminal: {assignment_id}")
        receipt_path = ROOT / "master/dispatch" / args.wave_id / assignment_id / attempt_id / "dispatch_receipt.json"
        receipt = obj(receipt_path)
        if receipt.get("agent_path") != leaf.get("agent_path") or receipt.get("task_thread_id") != leaf.get("agent_path"):
            raise RuntimeError(f"leaf/receipt identity mismatch: {assignment_id}")
        lane_thread_ids.add(receipt.get("lane_thread_id"))
        native_ids.append(leaf["native_child_thread_id"])
        bindings.append({
            "assignment_id": assignment_id,
            "native_child_thread_id": leaf["native_child_thread_id"],
            "agent_path": leaf["agent_path"],
            "dispatch_receipt_sha256": sha(receipt_path.read_bytes()),
        })
        statuses.append({
            "native_child_thread_id": leaf["native_child_thread_id"],
            "native_child_turn_id": leaf["native_child_turn_id"],
            "native_child_thread_state": leaf["native_child_thread_state"],
            "native_child_turn_status": leaf["native_child_turn_status"],
            "native_child_turn_error": leaf["native_child_turn_error"],
            "terminal_response_prefix": leaf["terminal_response_prefix"],
        })
    if len(native_ids) != len(set(native_ids)):
        raise RuntimeError("native leaf identity reused")
    if len(lane_thread_ids) != 1:
        raise RuntimeError("mixed lane thread IDs")

    spawn_doc = {
        "audit_id": AUDIT_ID,
        "wave_id": args.wave_id,
        "attempt_id": attempt_id,
        "lane_thread_id": next(iter(lane_thread_ids)),
        "lane_turn_id": args.lane_turn_id,
        "cohort_dispatcher_thread_id": args.dispatcher_thread_id,
        "cohort_dispatcher_turn_id": args.dispatcher_turn_id,
        "binding_count": 8,
        "bindings": bindings,
        "all_fresh": True,
        "all_unique": True,
        "coverage_credit": 0,
    }
    status_doc = {
        "audit_id": AUDIT_ID,
        "wave_id": args.wave_id,
        "capture_basis": "codex_app_read_thread_after_all_children_terminal",
        "cohort_dispatcher_thread_id": args.dispatcher_thread_id,
        "cohort_dispatcher_turn_id": args.dispatcher_turn_id,
        "statuses": statuses,
    }
    write_immutable(runtime_dir / "spawn_bindings.json", spawn_doc)
    write_immutable(runtime_dir / "native_terminal_statuses.json", status_doc)
    print(json.dumps({"status": "pass", "wave_id": args.wave_id, "binding_count": 8}, indent=2))


if __name__ == "__main__":
    main()
