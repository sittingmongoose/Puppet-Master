#!/usr/bin/env python3
"""Independent closure check for an Audit 005 incremental wave checkpoint."""

from __future__ import annotations

import argparse
import hashlib
import json
from collections import Counter
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parent
AUDIT_ID = ROOT.name


def digest(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def read(path: Path) -> dict[str, Any]:
    value = json.loads(path.read_bytes())
    if not isinstance(value, dict):
        raise ValueError(f"object required: {path}")
    return value


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--wave-id", required=True)
    parser.add_argument("--checkpoint-id", required=True)
    args = parser.parse_args()

    problems: set[str] = set()

    def check(condition: bool, message: str) -> None:
        if not condition:
            problems.add(message)

    checkpoint_dir = ROOT / "master/validation" / args.wave_id / "checkpoints" / args.checkpoint_id
    receipt_path = checkpoint_dir / "checkpoint_receipt.json"
    try:
        checkpoint = read(receipt_path)
        check(checkpoint.get("audit_id") == AUDIT_ID, "checkpoint audit mismatch")
        check(checkpoint.get("wave_id") == args.wave_id, "checkpoint wave mismatch")
        check(checkpoint.get("checkpoint_id") == args.checkpoint_id, "checkpoint id mismatch")
        check(checkpoint.get("status") == "pass", "checkpoint is not pass")
        check(checkpoint.get("terminal_wave") is False, "incremental checkpoint incorrectly terminal")
    except Exception as exc:
        print(json.dumps({"status": "fail", "problems": [f"checkpoint parse failure:{exc}"]}, indent=2))
        raise SystemExit(1)

    primary_path = checkpoint_dir / "primary.json"
    cross_path = checkpoint_dir / "cross.json"
    runtime_dir = ROOT / "master/runtime_bindings" / args.wave_id / "checkpoints" / args.checkpoint_id
    spawn_path = runtime_dir / "spawn_bindings.json"
    statuses_path = runtime_dir / "native_terminal_statuses.json"
    capture_path = runtime_dir / "native_capture.json"
    referenced = {
        primary_path: checkpoint.get("primary_validation_sha256"),
        cross_path: checkpoint.get("independent_validation_sha256"),
        spawn_path: checkpoint.get("runtime_spawn_bindings_sha256"),
        statuses_path: checkpoint.get("runtime_statuses_sha256"),
    }
    for path, expected in referenced.items():
        check(path.is_file(), f"missing referenced artifact:{path}")
        if path.is_file():
            check(digest(path) == expected, f"referenced artifact hash mismatch:{path}")

    primary = read(primary_path)
    cross = read(cross_path)
    spawn = read(spawn_path)
    statuses_doc = read(statuses_path)
    capture = read(capture_path)
    selected = set(checkpoint.get("credited_assignment_ids", []))
    pending = set(checkpoint.get("pending_assignment_ids", []))
    check(selected == set(primary.get("credited_assignment_ids", [])), "primary eligible set mismatch")
    check(selected == set(cross.get("eligible_assignment_ids", [])), "cross eligible set mismatch")
    check(checkpoint.get("credited_this_checkpoint") == len(selected), "checkpoint credited count mismatch")
    check(checkpoint.get("wave_pending") == len(pending), "checkpoint pending count mismatch")
    check(selected.isdisjoint(pending), "selected/pending overlap")

    bindings = {row.get("assignment_id"): row for row in spawn.get("bindings", [])}
    statuses = {row.get("native_child_thread_id"): row for row in statuses_doc.get("statuses", [])}
    raw_leaves = capture.get("leaves", [])
    leaves = {row.get("assignment_id"): row for row in raw_leaves}
    check(len(raw_leaves) == len(leaves) == len(selected), "capture duplicate/cardinality mismatch")
    check(set(bindings) == set(leaves) == selected, "runtime selected set mismatch")
    check(set(spawn.get("pending_assignment_ids", [])) == pending, "runtime pending set mismatch")

    primary_rows = {row.get("assignment_id"): row for row in primary.get("results", [])}
    cross_rows = {row.get("assignment_id"): row for row in cross.get("results", [])}
    selected_native: list[str] = []
    selected_tasks: list[str] = []
    for assignment_id in sorted(selected):
        binding = bindings.get(assignment_id, {})
        leaf = leaves.get(assignment_id, {})
        native_id = binding.get("native_child_thread_id")
        status = statuses.get(native_id, {})
        check(native_id == leaf.get("native_child_thread_id"), f"native capture mismatch:{assignment_id}")
        check(binding.get("agent_path") == leaf.get("agent_path"), f"agent capture mismatch:{assignment_id}")
        check(status.get("native_child_turn_id") == leaf.get("native_child_turn_id"), f"native turn mismatch:{assignment_id}")
        check(status.get("native_child_thread_state") == "idle", f"native thread not idle:{assignment_id}")
        check(status.get("native_child_turn_status") == "completed", f"native turn not completed:{assignment_id}")
        check(status.get("native_child_turn_error") is None, f"native turn error:{assignment_id}")
        check(status.get("terminal_response_prefix") == "PMR1", f"native terminal prefix mismatch:{assignment_id}")
        if isinstance(native_id, str):
            selected_native.append(native_id)

        credit_paths = list((ROOT / "master/credits" / args.wave_id / assignment_id).glob("*/credit.json"))
        check(len(credit_paths) == 1, f"incremental credit cardinality mismatch:{assignment_id}")
        if len(credit_paths) != 1:
            continue
        credit_path = credit_paths[0]
        attempt_id = credit_path.parent.name
        credit = read(credit_path)
        result_path = ROOT / "assignments" / assignment_id / "attempts" / attempt_id / "result.json"
        terminal_path = result_path.with_name("terminal_seal.json")
        receipt_file = ROOT / "master/dispatch" / args.wave_id / assignment_id / attempt_id / "dispatch_receipt.json"
        terminal_binding_path = ROOT / "master/runtime_bindings" / args.wave_id / assignment_id / attempt_id / "terminal_binding.json"
        for path in (result_path, terminal_path, receipt_file, terminal_binding_path):
            check(path.is_file(), f"missing closure artifact:{path}")
        if not all(path.is_file() for path in (result_path, terminal_path, receipt_file, terminal_binding_path)):
            continue
        result = read(result_path)
        terminal = read(terminal_path)
        dispatch = read(receipt_file)
        terminal_binding = read(terminal_binding_path)
        task = credit.get("task_thread_id")
        if isinstance(task, str):
            selected_tasks.append(task)
        check(credit.get("checkpoint_id") == args.checkpoint_id, f"credit checkpoint mismatch:{assignment_id}")
        check(credit.get("native_child_thread_id") == native_id, f"credit native mismatch:{assignment_id}")
        check(credit.get("result_sha256") == digest(result_path), f"credit result hash mismatch:{assignment_id}")
        check(credit.get("terminal_seal_sha256") == digest(terminal_path), f"credit terminal hash mismatch:{assignment_id}")
        check(credit.get("primary_validation_snapshot_sha256") == digest(primary_path), f"credit primary snapshot mismatch:{assignment_id}")
        check(credit.get("independent_validation_snapshot_sha256") == digest(cross_path), f"credit cross snapshot mismatch:{assignment_id}")
        check(credit.get("spawn_binding_sha256") == digest(spawn_path), f"credit spawn binding mismatch:{assignment_id}")
        check(credit.get("terminal_binding_sha256") == digest(terminal_binding_path), f"credit terminal binding mismatch:{assignment_id}")
        check(binding.get("dispatch_receipt_sha256") == digest(receipt_file), f"spawn receipt hash mismatch:{assignment_id}")
        check(result.get("task_thread_id") == binding.get("agent_path") == dispatch.get("agent_path"), f"task path mismatch:{assignment_id}")
        check(dispatch.get("task_thread_id") == binding.get("agent_path"), f"dispatch task path mismatch:{assignment_id}")
        check(terminal.get("result_sha256") == digest(result_path), f"terminal result hash mismatch:{assignment_id}")
        check(terminal_binding.get("native_child_thread_id") == native_id, f"terminal binding native mismatch:{assignment_id}")
        check(primary_rows.get(assignment_id, {}).get("result_sha256") == digest(result_path), f"primary result mismatch:{assignment_id}")
        check(cross_rows.get(assignment_id, {}).get("result_sha256") == digest(result_path), f"cross result mismatch:{assignment_id}")

    for assignment_id in sorted(pending):
        wave_manifest = [
            json.loads(line)
            for line in (ROOT / "master/waves" / args.wave_id / "wave_assignment_manifest.jsonl").read_text().splitlines()
            if line.strip()
        ]
        manifest = {row["assignment_id"]: row for row in wave_manifest}.get(assignment_id, {})
        attempt = manifest.get("attempt_id")
        material = [
            ROOT / "master/dispatch" / args.wave_id / assignment_id / str(attempt) / "dispatch_receipt.json",
            ROOT / str(manifest.get("output_directory")) / "result.json",
            ROOT / str(manifest.get("output_directory")) / "terminal_seal.json",
            ROOT / "master/credits" / args.wave_id / assignment_id / str(attempt) / "credit.json",
            ROOT / "master/quarantine" / args.wave_id / assignment_id / str(attempt) / "quarantine.json",
        ]
        check(not any(path.exists() for path in material), f"pending assignment has attempt material:{assignment_id}")

    all_credits = [read(path) for path in sorted((ROOT / "master/credits").glob("**/credit.json"))]
    all_assignments = [row.get("assignment_id") for row in all_credits]
    all_tasks = [row.get("task_thread_id") for row in all_credits]
    all_native = [row.get("native_child_thread_id") for row in all_credits if row.get("native_child_thread_id")]
    check(not [key for key, count in Counter(all_assignments).items() if count > 1], "global credited assignment reuse")
    check(not [key for key, count in Counter(all_tasks).items() if count > 1], "global credited task reuse")
    check(not [key for key, count in Counter(all_native).items() if count > 1], "global credited native reuse")

    receipt_agents: list[str] = []
    for path in sorted((ROOT / "master/dispatch").glob("**/dispatch_receipt.json")):
        row = read(path)
        agent = row.get("agent_path")
        task = row.get("task_thread_id")
        # Early pilot protocols used different native UUID/path representations.
        # Reuse is a collision across receipts, not two equivalent fields in one receipt.
        values = {value for value in (agent, task) if isinstance(value, str) and value}
        receipt_agents.extend(values)
    check(not [key for key, count in Counter(receipt_agents).items() if count > 1], "global dispatch receipt identity reuse")

    registries = sorted((ROOT / "master/live").glob("credited_assignments.snapshot-*.json"))
    registry = read(registries[-1]) if registries else {}
    check(selected <= set(registry.get("credited_assignment_ids", [])), "live registry omits incremental credit")
    check(checkpoint.get("live_credited_assignments") == registry.get("credited_assignment_count"), "checkpoint/live count mismatch")

    report = {
        "audit_id": AUDIT_ID,
        "checker": "incremental_checkpoint_lineage_crosscheck_v1",
        "wave_id": args.wave_id,
        "checkpoint_id": args.checkpoint_id,
        "status": "pass" if not problems else "fail",
        "selected_assignment_count": len(selected),
        "pending_assignment_count": len(pending),
        "problem_count": len(problems),
        "problems": sorted(problems),
    }
    print(json.dumps(report, indent=2, sort_keys=True))
    raise SystemExit(0 if not problems else 1)


if __name__ == "__main__":
    main()
