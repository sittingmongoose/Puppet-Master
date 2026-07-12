#!/usr/bin/env python3
"""Transactionally credit valid macro assignments and quarantine failed peers."""

from __future__ import annotations

import argparse
import json
import os
import shutil
import subprocess
from pathlib import Path
from typing import Any

from macro_v2_common import (
    AUDIT_ID,
    MACRO_ROOT,
    ROOT,
    TOTAL_MICRO_WINDOWS,
    canonical_json,
    load_jsonl,
    load_obj,
    result_file,
    selected_result_payload,
    root_hash,
    sha,
    write_obj,
)


def run_report(script: str, batch_id: str) -> dict[str, Any]:
    process = subprocess.run(
        ["python3", script, "--batch-id", batch_id], cwd=ROOT, capture_output=True, text=True, check=False
    )
    if not process.stdout.strip():
        raise RuntimeError(f"{script} emitted no report: {process.stderr}")
    value = json.loads(process.stdout)
    if not isinstance(value, dict):
        raise RuntimeError(f"{script} report is not an object")
    return value


def active_coverage() -> tuple[Path, dict[str, Any]]:
    pointer_path = MACRO_ROOT / "live/ACTIVE.json"
    if pointer_path.is_file():
        pointer = load_obj(pointer_path)
        path = ROOT / pointer["coverage_ref"]
        if not path.is_file() or sha(path.read_bytes()) != pointer["coverage_sha256"]:
            raise RuntimeError("ACTIVE coverage pointer is broken")
        return path, load_obj(path)
    baseline = MACRO_ROOT / "live/coverage.snapshot-0000.json"
    return baseline, load_obj(baseline)


def artifact_record(path: Path) -> dict[str, Any]:
    if not path.exists():
        return {"exists": False, "path": path.relative_to(ROOT).as_posix(), "sha256": None, "bytes": None}
    if not path.is_file() or path.is_symlink():
        return {"exists": True, "path": path.relative_to(ROOT).as_posix(), "sha256": None, "bytes": None, "invalid_type": True}
    return {
        "exists": True,
        "path": path.relative_to(ROOT).as_posix(),
        "sha256": sha(path.read_bytes()),
        "bytes": path.stat().st_size,
    }


def prior_identities() -> tuple[set[str], set[str]]:
    native: set[str] = set()
    paths: set[str] = set()
    for path in sorted((MACRO_ROOT / "transactions").glob("*/outcomes/*.json")):
        row = load_obj(path)
        if isinstance(row.get("native_child_thread_id"), str):
            native.add(row["native_child_thread_id"])
        if isinstance(row.get("agent_path"), str):
            paths.add(row["agent_path"])
    return native, paths


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--batch-id", required=True)
    parser.add_argument("--snapshot-serial", required=True)
    args = parser.parse_args()
    if len(args.snapshot_serial) != 4 or not args.snapshot_serial.isdigit():
        raise RuntimeError("snapshot serial must be four digits")
    transaction = MACRO_ROOT / "transactions" / args.batch_id
    if transaction.exists():
        raise RuntimeError("transaction already exists; verify/promote it instead of rewriting")

    batch = MACRO_ROOT / "batches" / args.batch_id
    authority = load_obj(batch / "batch_authority.json")
    assignments = load_jsonl(batch / "batch_manifest.jsonl")
    assignment_by_id = {row["assignment_id"]: row for row in assignments}
    capture_path = MACRO_ROOT / "runtime" / args.batch_id / "native_capture.json"
    capture = load_obj(capture_path)
    capture_keys = {
        "audit_id", "schema_version", "epoch_id", "batch_id", "controller_thread_id", "controller_turn_id",
        "controller_thread_state", "controller_turn_status", "controller_turn_error", "capture_basis", "leaves",
    }
    if set(capture) != capture_keys:
        raise RuntimeError("native capture key set mismatch")
    if capture.get("audit_id") != AUDIT_ID or capture.get("batch_id") != args.batch_id or capture.get("epoch_id") != authority["epoch_id"]:
        raise RuntimeError("native capture authority mismatch")
    if capture.get("controller_thread_id") != authority.get("controller_thread_id"):
        raise RuntimeError("native capture controller mismatch")
    if not (
        capture.get("controller_thread_state") == "idle"
        and capture.get("controller_turn_status") == "completed"
        and capture.get("controller_turn_error") is None
    ):
        raise RuntimeError("controller turn is not cleanly terminal")
    leaves_raw = capture.get("leaves")
    if not isinstance(leaves_raw, list) or len(leaves_raw) != len(assignments):
        raise RuntimeError("native capture leaf cardinality mismatch")
    leaves = {row.get("assignment_id"): row for row in leaves_raw if isinstance(row, dict)}
    if len(leaves) != len(leaves_raw) or set(leaves) != set(assignment_by_id):
        raise RuntimeError("native capture assignment set mismatch")

    primary = run_report("validate_macro_batch.py", args.batch_id)
    cross = run_report("crosscheck_macro_batch.py", args.batch_id)
    primary_rows = {row["assignment_id"]: row for row in primary.get("results", [])}
    cross_rows = {row["assignment_id"]: row for row in cross.get("results", [])}
    if set(primary_rows) != set(assignment_by_id) or set(cross_rows) != set(assignment_by_id):
        raise RuntimeError("validator assignment universes disagree")
    primary_eligible = set(primary.get("eligible_assignment_ids", []))
    cross_eligible = set(cross.get("eligible_assignment_ids", []))
    if primary_eligible != cross_eligible:
        raise RuntimeError("primary and independent eligible sets disagree")

    prior_native, prior_paths = prior_identities()
    local_native: set[str] = set()
    local_paths: set[str] = set()
    current_path, current = active_coverage()
    already_credited = set(current.get("credited_assignment_ids", []))
    already_covered = set(current.get("covered_window_ids", []))
    if set(assignment_by_id) & already_credited:
        raise RuntimeError("batch contains already credited assignment")

    staging = MACRO_ROOT / "transaction_staging" / f"{args.batch_id}.{os.getpid()}"
    if staging.exists():
        shutil.rmtree(staging)
    staging.mkdir(parents=True)
    write_obj(staging / "validation/primary.json", primary)
    write_obj(staging / "validation/independent.json", cross)
    primary_sha = sha((staging / "validation/primary.json").read_bytes())
    cross_sha = sha((staging / "validation/independent.json").read_bytes())
    credited_ids: list[str] = []
    credited_windows: list[str] = []
    quarantine_count = 0

    for assignment in assignments:
        assignment_id = assignment["assignment_id"]
        attempt_id = assignment["attempt_id"]
        leaf = leaves[assignment_id]
        leaf_keys = {
            "assignment_id", "native_child_thread_id", "native_child_turn_id", "agent_path",
            "native_child_thread_state", "native_child_turn_status", "native_child_turn_error", "terminal_response_prefix",
        }
        if set(leaf) != leaf_keys:
            raise RuntimeError(f"native leaf key set mismatch:{assignment_id}")
        if not (
            leaf.get("native_child_thread_state") == "idle"
            and leaf.get("native_child_turn_status") == "completed"
            and leaf.get("native_child_turn_error") is None
            and leaf.get("terminal_response_prefix") == "PMR1"
        ):
            raise RuntimeError(f"native leaf is not cleanly terminal:{assignment_id}")
        native_id, agent_path = leaf.get("native_child_thread_id"), leaf.get("agent_path")
        if not isinstance(native_id, str) or not isinstance(agent_path, str):
            raise RuntimeError(f"native identity missing:{assignment_id}")
        if native_id in prior_native or native_id in local_native:
            raise RuntimeError(f"native identity reused:{native_id}")
        if agent_path in prior_paths or agent_path in local_paths:
            raise RuntimeError(f"agent path reused:{agent_path}")
        local_native.add(native_id)
        local_paths.add(agent_path)

        intent_path = MACRO_ROOT / "dispatch" / args.batch_id / assignment_id / attempt_id / "dispatch_intent.json"
        receipt_path = intent_path.with_name("dispatch_receipt.json")
        output = ROOT / assignment["output_directory"]
        raw_payload_path, raw_payload_issues = result_file(output)
        payload_path, payload_issues, normalization = selected_result_payload(
            batch_id=args.batch_id, assignment=assignment, output_dir=output
        )
        receipt = load_obj(receipt_path) if receipt_path.is_file() else None
        receipt_identity_ok = isinstance(receipt, dict) and receipt.get("agent_path") == agent_path and receipt.get("task_thread_id") == agent_path
        eligible = assignment_id in primary_eligible
        if eligible and (payload_path is None or not receipt_identity_ok):
            raise RuntimeError(f"eligible row lacks bound payload or receipt:{assignment_id}")

        base = {
            "audit_id": AUDIT_ID,
            "schema_version": "macro-attempt-outcome-v1",
            "epoch_id": authority["epoch_id"],
            "batch_id": args.batch_id,
            "assignment_id": assignment_id,
            "attempt_id": attempt_id,
            "agent_path": agent_path,
            "native_child_thread_id": native_id,
            "native_child_turn_id": leaf["native_child_turn_id"],
            "native_child_thread_state": leaf["native_child_thread_state"],
            "native_child_turn_status": leaf["native_child_turn_status"],
            "native_child_turn_error": leaf["native_child_turn_error"],
            "terminal_response_prefix": leaf["terminal_response_prefix"],
            "dispatch_intent": artifact_record(intent_path),
            "dispatch_receipt": artifact_record(receipt_path),
            "result_payload": artifact_record(payload_path) if payload_path is not None else {
                "exists": False, "path": None, "sha256": None, "bytes": None, "discovery_issues": payload_issues,
            },
            "raw_output_payload": artifact_record(raw_payload_path) if raw_payload_path is not None else {
                "exists": False, "path": None, "sha256": None, "bytes": None, "discovery_issues": raw_payload_issues,
            },
            "normalization_receipt": artifact_record(
                MACRO_ROOT / "normalizations" / args.batch_id / assignment_id / attempt_id / "normalization_receipt.json"
            ),
            "primary_validation_sha256": primary_sha,
            "independent_validation_sha256": cross_sha,
            "primary_errors": primary_rows[assignment_id].get("errors", []),
            "independent_errors": cross_rows[assignment_id].get("issues", []),
        }
        if eligible:
            windows = assignment["micro_window_ids"]
            if already_covered & set(windows) or set(credited_windows) & set(windows):
                raise RuntimeError(f"credit would duplicate covered micro-window:{assignment_id}")
            outcome = base | {
                "status": "credited",
                "coverage_credit": len(windows),
                "credited_micro_window_ids": windows,
                "fresh_identity_confirmed": True,
                "dual_mechanical_validation_confirmed": True,
            }
            credited_ids.append(assignment_id)
            credited_windows.extend(windows)
        else:
            outcome = base | {
                "status": "quarantined_zero_credit",
                "coverage_credit": 0,
                "credited_micro_window_ids": [],
                "reason": "native-terminal attempt did not satisfy both independent result validators",
                "preserve_attempt_artifacts": True,
                "retry_requires_fresh_attempt_and_identity": True,
            }
            quarantine_count += 1
        write_obj(staging / "outcomes" / f"{assignment_id}.json", outcome)

    cumulative_assignments = sorted(already_credited | set(credited_ids))
    cumulative_windows = sorted(already_covered | set(credited_windows))
    if len(cumulative_windows) != len(set(cumulative_windows)) or not set(credited_windows).isdisjoint(already_covered):
        raise RuntimeError("cumulative micro-window coverage duplication")
    coverage = {
        "audit_id": AUDIT_ID,
        "schema_version": "macro-coverage-v1",
        "epoch_id": authority["epoch_id"],
        "snapshot_serial": args.snapshot_serial,
        "parent_coverage_ref": current_path.relative_to(ROOT).as_posix(),
        "parent_coverage_sha256": sha(current_path.read_bytes()),
        "micro_window_total": TOTAL_MICRO_WINDOWS,
        "seeded_micro_windows": current["seeded_micro_windows"],
        "macro_credited_micro_windows": len(cumulative_windows) - current["seeded_micro_windows"],
        "covered_micro_windows": len(cumulative_windows),
        "pending_micro_windows": TOTAL_MICRO_WINDOWS - len(cumulative_windows),
        "macro_assignment_total": current["macro_assignment_total"],
        "credited_macro_assignments": len(cumulative_assignments),
        "quarantined_attempts": current.get("quarantined_attempts", 0) + quarantine_count,
        "complete": len(cumulative_windows) == TOTAL_MICRO_WINDOWS,
        "covered_window_ids": cumulative_windows,
        "credited_assignment_ids": cumulative_assignments,
        "covered_window_ids_digest": sha(json.dumps(cumulative_windows, separators=(",", ":")).encode()),
        "credited_assignment_ids_digest": sha(json.dumps(cumulative_assignments, separators=(",", ":")).encode()),
        "current_phase": f"macro_v2_{args.batch_id}_checkpointed",
        "transaction_batch_id": args.batch_id,
    }
    coverage_name = f"coverage.snapshot-{args.snapshot_serial}.json"
    write_obj(staging / coverage_name, coverage)
    stable_files = sorted(path for path in staging.rglob("*") if path.is_file())
    commit = {
        "audit_id": AUDIT_ID,
        "schema_version": "macro-transaction-commit-v1",
        "batch_id": args.batch_id,
        "epoch_id": authority["epoch_id"],
        "status": "COMMITTED_READY_FOR_ACTIVE_POINTER",
        "parent_coverage_ref": current_path.relative_to(ROOT).as_posix(),
        "parent_coverage_sha256": sha(current_path.read_bytes()),
        "payload_root_sha256": root_hash(stable_files, staging),
        "credited_assignment_ids": sorted(credited_ids),
        "credited_micro_window_ids": sorted(credited_windows),
        "quarantined_assignment_ids": sorted(set(assignment_by_id) - set(credited_ids)),
        "coverage_ref": f"master/macro/transactions/{args.batch_id}/{coverage_name}",
        "coverage_sha256": sha((staging / coverage_name).read_bytes()),
        "native_capture_ref": capture_path.relative_to(ROOT).as_posix(),
        "native_capture_sha256": sha(capture_path.read_bytes()),
    }
    write_obj(staging / "commit.json", commit)
    transaction.parent.mkdir(parents=True, exist_ok=True)
    os.replace(staging, transaction)
    pointer = {
        "audit_id": AUDIT_ID,
        "schema_version": "macro-active-coverage-pointer-v1",
        "batch_id": args.batch_id,
        "snapshot_serial": args.snapshot_serial,
        "transaction_ref": transaction.relative_to(ROOT).as_posix(),
        "transaction_commit_sha256": sha((transaction / "commit.json").read_bytes()),
        "coverage_ref": (transaction / coverage_name).relative_to(ROOT).as_posix(),
        "coverage_sha256": sha((transaction / coverage_name).read_bytes()),
    }
    write_obj(MACRO_ROOT / "live/ACTIVE.json", pointer)
    print(json.dumps({
        "status": "pass",
        "batch_id": args.batch_id,
        "credited_assignments_this_batch": len(credited_ids),
        "credited_micro_windows_this_batch": len(credited_windows),
        "quarantined_attempts_this_batch": quarantine_count,
        "covered_micro_windows": len(cumulative_windows),
        "pending_micro_windows": TOTAL_MICRO_WINDOWS - len(cumulative_windows),
        "coverage_sha256": pointer["coverage_sha256"],
        "transaction_commit_sha256": pointer["transaction_commit_sha256"],
    }, indent=2, sort_keys=True))


if __name__ == "__main__":
    main()
