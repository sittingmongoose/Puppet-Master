#!/usr/bin/env python3
"""Recompute the committed Audit 005 macro-coverage chain from immutable transactions."""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any

from macro_v2_common import AUDIT_ID, MACRO_ROOT, REPO, ROOT, TOTAL_MICRO_WINDOWS, load_jsonl, load_obj, root_hash, sha


def main() -> None:
    errors: list[str] = []
    baseline_path = MACRO_ROOT / "live/coverage.snapshot-0000.json"
    baseline = load_obj(baseline_path)
    epoch = MACRO_ROOT / "frozen" / baseline["epoch_id"]
    micro_ids = {row["window_id"] for row in load_jsonl(epoch / "manifests/micro_window_manifest.jsonl")}
    seeded_ids = {row["window_id"] for row in load_jsonl(epoch / "manifests/seeded_windows.jsonl")}
    if len(micro_ids) != TOTAL_MICRO_WINDOWS:
        errors.append("micro-window universe cardinality mismatch")
    if set(baseline.get("covered_window_ids", [])) != seeded_ids:
        errors.append("baseline covered set differs from seed manifest")
    pointer_path = MACRO_ROOT / "live/ACTIVE.json"
    transactions: list[tuple[Path, dict[str, Any], dict[str, Any]]] = []
    if pointer_path.is_file():
        pointer = load_obj(pointer_path)
        coverage_path = ROOT / pointer["coverage_ref"]
        transaction = ROOT / pointer["transaction_ref"]
        if sha(coverage_path.read_bytes()) != pointer.get("coverage_sha256"):
            errors.append("ACTIVE coverage hash mismatch")
        if sha((transaction / "commit.json").read_bytes()) != pointer.get("transaction_commit_sha256"):
            errors.append("ACTIVE transaction commit hash mismatch")
        current_path = coverage_path
        while current_path != baseline_path:
            if not current_path.is_file():
                errors.append(f"coverage chain file missing:{current_path}")
                break
            coverage = load_obj(current_path)
            batch_id = coverage.get("transaction_batch_id")
            txn = MACRO_ROOT / "transactions" / str(batch_id)
            commit_path = txn / "commit.json"
            if not commit_path.is_file():
                errors.append(f"transaction commit missing:{batch_id}")
                break
            commit = load_obj(commit_path)
            if commit.get("coverage_ref") != current_path.relative_to(ROOT).as_posix() or commit.get("coverage_sha256") != sha(current_path.read_bytes()):
                errors.append(f"transaction coverage binding:{batch_id}")
            payload_files = sorted(path for path in txn.rglob("*") if path.is_file() and path.name != "commit.json")
            if root_hash(payload_files, txn) != commit.get("payload_root_sha256"):
                errors.append(f"transaction payload root:{batch_id}")
            transactions.append((txn, commit, coverage))
            parent = ROOT / str(coverage.get("parent_coverage_ref"))
            if not parent.is_file() or sha(parent.read_bytes()) != coverage.get("parent_coverage_sha256"):
                errors.append(f"parent coverage binding:{batch_id}")
                break
            current_path = parent
        transactions.reverse()
        current = load_obj(coverage_path)
    else:
        current = baseline

    reconstructed_windows = set(seeded_ids)
    reconstructed_assignments: set[str] = set()
    native_ids: set[str] = set()
    agent_paths: set[str] = set()
    quarantine_count = 0
    parent_path = baseline_path
    for txn, commit, coverage in transactions:
        if coverage.get("parent_coverage_ref") != parent_path.relative_to(ROOT).as_posix() or coverage.get("parent_coverage_sha256") != sha(parent_path.read_bytes()):
            errors.append(f"nonlinear transaction parent:{commit.get('batch_id')}")
        outcome_paths = sorted((txn / "outcomes").glob("*.json"))
        credited_here: set[str] = set()
        windows_here: set[str] = set()
        quarantined_here: set[str] = set()
        for path in outcome_paths:
            outcome = load_obj(path)
            assignment_id = outcome.get("assignment_id")
            native_id = outcome.get("native_child_thread_id")
            agent_path = outcome.get("agent_path")
            if not isinstance(native_id, str) or native_id in native_ids:
                errors.append(f"native identity missing/reused:{assignment_id}")
            else:
                native_ids.add(native_id)
            if not isinstance(agent_path, str) or agent_path in agent_paths:
                errors.append(f"agent path missing/reused:{assignment_id}")
            else:
                agent_paths.add(agent_path)
            if outcome.get("status") == "credited":
                credited_here.add(assignment_id)
                ids = outcome.get("credited_micro_window_ids", [])
                if not isinstance(ids, list) or len(ids) != len(set(ids)):
                    errors.append(f"invalid credited window ids:{assignment_id}")
                    ids = []
                if reconstructed_windows & set(ids) or windows_here & set(ids):
                    errors.append(f"duplicate credited micro-window:{assignment_id}")
                windows_here.update(ids)
                payload = outcome.get("result_payload", {})
                payload_path = ROOT / str(payload.get("path"))
                if not payload_path.is_file() or sha(payload_path.read_bytes()) != payload.get("sha256"):
                    errors.append(f"credited result hash mismatch:{assignment_id}")
                receipt = outcome.get("dispatch_receipt", {})
                receipt_path = ROOT / str(receipt.get("path"))
                if not receipt_path.is_file() or sha(receipt_path.read_bytes()) != receipt.get("sha256"):
                    errors.append(f"credited receipt hash mismatch:{assignment_id}")
                if outcome.get("primary_errors") or outcome.get("independent_errors"):
                    errors.append(f"credited outcome carries validation errors:{assignment_id}")
            elif outcome.get("status") == "quarantined_zero_credit":
                quarantined_here.add(assignment_id)
                quarantine_count += 1
                if outcome.get("coverage_credit") != 0 or outcome.get("credited_micro_window_ids") != []:
                    errors.append(f"quarantine granted coverage:{assignment_id}")
            else:
                errors.append(f"unknown outcome status:{assignment_id}")
        if credited_here != set(commit.get("credited_assignment_ids", [])):
            errors.append(f"commit credited assignment set:{commit.get('batch_id')}")
        if windows_here != set(commit.get("credited_micro_window_ids", [])):
            errors.append(f"commit credited window set:{commit.get('batch_id')}")
        if quarantined_here != set(commit.get("quarantined_assignment_ids", [])):
            errors.append(f"commit quarantine set:{commit.get('batch_id')}")
        reconstructed_assignments.update(credited_here)
        reconstructed_windows.update(windows_here)
        if set(coverage.get("credited_assignment_ids", [])) != reconstructed_assignments:
            errors.append(f"cumulative assignment set:{commit.get('batch_id')}")
        if set(coverage.get("covered_window_ids", [])) != reconstructed_windows:
            errors.append(f"cumulative window set:{commit.get('batch_id')}")
        parent_path = txn / f"coverage.snapshot-{coverage['snapshot_serial']}.json"

    if set(current.get("covered_window_ids", [])) != reconstructed_windows:
        errors.append("active covered window set mismatch")
    if set(current.get("credited_assignment_ids", [])) != reconstructed_assignments:
        errors.append("active credited assignment set mismatch")
    if current.get("covered_micro_windows") != len(reconstructed_windows):
        errors.append("active covered micro-window count mismatch")
    if current.get("pending_micro_windows") != TOTAL_MICRO_WINDOWS - len(reconstructed_windows):
        errors.append("active pending count mismatch")
    if current.get("credited_macro_assignments") != len(reconstructed_assignments):
        errors.append("active credited macro count mismatch")
    if current.get("covered_window_ids_digest") != sha(json.dumps(sorted(reconstructed_windows), separators=(",", ":")).encode()):
        errors.append("active covered digest mismatch")
    if current.get("credited_assignment_ids_digest") != sha(json.dumps(sorted(reconstructed_assignments), separators=(",", ":")).encode()):
        errors.append("active assignment digest mismatch")
    if not reconstructed_windows <= micro_ids:
        errors.append("coverage includes unknown micro-window")

    report = {
        "audit_id": AUDIT_ID,
        "checker": "macro_live_chain_v1",
        "status": "pass" if not errors else "fail",
        "errors": sorted(set(errors)),
        "transaction_count": len(transactions),
        "covered_micro_windows": len(reconstructed_windows),
        "pending_micro_windows": TOTAL_MICRO_WINDOWS - len(reconstructed_windows),
        "credited_macro_assignments": len(reconstructed_assignments),
        "quarantined_attempts_reconstructed": quarantine_count,
        "covered_window_ids_digest": sha(json.dumps(sorted(reconstructed_windows), separators=(",", ":")).encode()),
        "credited_assignment_ids_digest": sha(json.dumps(sorted(reconstructed_assignments), separators=(",", ":")).encode()),
        "active_coverage_sha256": None,
    }
    # Avoid trusting a reserialization hash: expose the actual active file hash when one exists.
    if pointer_path.is_file():
        report["active_coverage_sha256"] = load_obj(pointer_path)["coverage_sha256"]
    else:
        report["active_coverage_sha256"] = sha(baseline_path.read_bytes())
    print(json.dumps(report, indent=2, sort_keys=True))
    raise SystemExit(0 if not errors else 1)


if __name__ == "__main__":
    main()
