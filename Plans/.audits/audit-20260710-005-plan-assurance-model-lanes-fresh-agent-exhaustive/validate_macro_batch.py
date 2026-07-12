#!/usr/bin/env python3
"""Primary evidence validator for an Audit 005 macro-review batch."""

from __future__ import annotations

import argparse
import json
from collections import Counter
from pathlib import Path
from typing import Any

from macro_v2_common import (
    AUDIT_ID,
    MACRO_ROOT,
    ROOT,
    exact_keys,
    load_jsonl,
    load_obj,
    selected_result_payload,
    sha,
    validate_result_bytes,
)


RECEIPT_KEYS = {
    "audit_id",
    "schema_version",
    "epoch_id",
    "batch_id",
    "assignment_id",
    "attempt_id",
    "controller_thread_id",
    "agent_path",
    "task_thread_id",
    "model",
    "reasoning_effort",
    "fresh_child",
    "fork_turns",
    "dispatch_intent_sha256",
    "capsule_sha256",
    "output_directory",
}


def validate_receipt(
    receipt: Any,
    assignment: dict[str, Any],
    intent: dict[str, Any],
    batch_id: str,
    controller_thread_id: str,
) -> list[str]:
    errors = exact_keys(receipt, RECEIPT_KEYS, "receipt")
    if not isinstance(receipt, dict):
        return errors
    expected = {
        "audit_id": AUDIT_ID,
        "schema_version": "macro-dispatch-receipt-v1",
        "epoch_id": intent["epoch_id"],
        "batch_id": batch_id,
        "assignment_id": assignment["assignment_id"],
        "attempt_id": assignment["attempt_id"],
        "controller_thread_id": controller_thread_id,
        "model": "gpt-5.6-sol",
        "reasoning_effort": "xhigh",
        "fresh_child": True,
        "fork_turns": "none",
        "capsule_sha256": assignment["capsule_sha256"],
        "output_directory": intent["output_directory"],
    }
    for key, value in expected.items():
        if receipt.get(key) != value:
            errors.append(f"receipt:{key}:mismatch")
    if receipt.get("task_thread_id") != receipt.get("agent_path") or not isinstance(receipt.get("agent_path"), str):
        errors.append("receipt:agent_identity_mismatch")
    intent_path = MACRO_ROOT / "dispatch" / batch_id / assignment["assignment_id"] / assignment["attempt_id"] / "dispatch_intent.json"
    if receipt.get("dispatch_intent_sha256") != sha(intent_path.read_bytes()):
        errors.append("receipt:dispatch_intent_sha_mismatch")
    return errors


def all_prior_agent_paths(current_receipts: set[Path]) -> set[str]:
    values: set[str] = set()
    for path in sorted((MACRO_ROOT / "dispatch").glob("**/dispatch_receipt.json")):
        if path in current_receipts:
            continue
        try:
            receipt = load_obj(path)
        except Exception:
            continue
        for key in ("agent_path", "task_thread_id"):
            value = receipt.get(key)
            if isinstance(value, str):
                values.add(value)
    for path in sorted((ROOT / "master/dispatch").glob("**/dispatch_receipt.json")):
        try:
            receipt = load_obj(path)
        except Exception:
            continue
        for key in ("agent_path", "task_thread_id"):
            value = receipt.get(key)
            if isinstance(value, str):
                values.add(value)
    return values


def validate_batch(batch_id: str) -> dict[str, Any]:
    batch_dir = MACRO_ROOT / "batches" / batch_id
    authority = load_obj(batch_dir / "batch_authority.json")
    epoch = MACRO_ROOT / "frozen" / authority["epoch_id"]
    rows = load_jsonl(batch_dir / "batch_manifest.jsonl")
    current_receipts = {
        MACRO_ROOT / "dispatch" / batch_id / row["assignment_id"] / row["attempt_id"] / "dispatch_receipt.json"
        for row in rows
    }
    prior_paths = all_prior_agent_paths(current_receipts)
    results: list[dict[str, Any]] = []
    local_paths: list[str] = []
    for assignment in rows:
        assignment_id = assignment["assignment_id"]
        attempt_id = assignment["attempt_id"]
        intent_path = MACRO_ROOT / "dispatch" / batch_id / assignment_id / attempt_id / "dispatch_intent.json"
        receipt_path = intent_path.with_name("dispatch_receipt.json")
        if not receipt_path.is_file():
            results.append({
                "assignment_id": assignment_id,
                "attempt_id": attempt_id,
                "state": "pending",
                "errors": ["dispatch_receipt_missing"],
            })
            continue
        try:
            intent = load_obj(intent_path)
            receipt = load_obj(receipt_path)
        except Exception as exc:
            results.append({
                "assignment_id": assignment_id,
                "attempt_id": attempt_id,
                "state": "rejected",
                "errors": [f"dispatch_artifact_parse:{type(exc).__name__}"],
            })
            continue
        errors = validate_receipt(receipt, assignment, intent, batch_id, authority["controller_thread_id"])
        agent_path = receipt.get("agent_path")
        if agent_path in prior_paths:
            errors.append("fresh_agent_path_reused_from_prior_attempt")
        if isinstance(agent_path, str):
            local_paths.append(agent_path)
        payload_path, file_errors, normalization = selected_result_payload(
            batch_id=batch_id, assignment=assignment, output_dir=Path(intent["output_directory"])
        )
        if payload_path is None:
            state = "pending" if file_errors == ["expected_exactly_one_json_payload:found_0"] else "rejected"
            results.append({
                "assignment_id": assignment_id,
                "attempt_id": attempt_id,
                "task_thread_id": agent_path,
                "state": state,
                "errors": sorted(set(errors + file_errors)),
            })
            continue
        errors += file_errors
        capsule_path = epoch / assignment["capsule_ref"]
        if sha(capsule_path.read_bytes()) != assignment["capsule_sha256"]:
            errors.append("capsule_changed")
            validation = {"errors": []}
        else:
            validation = validate_result_bytes(
                payload_path.read_bytes(), assignment=assignment, capsule=load_obj(capsule_path), receipt=receipt
            )
            errors += validation["errors"]
        results.append({
            "assignment_id": assignment_id,
            "attempt_id": attempt_id,
            "task_thread_id": agent_path,
            "state": "eligible" if not errors else "rejected",
            "errors": sorted(set(errors)),
            "result_path": payload_path.relative_to(ROOT).as_posix(),
            "result_filename": payload_path.name,
            "result_sha256": sha(payload_path.read_bytes()),
            "result_bytes": payload_path.stat().st_size,
            "item_count": validation.get("item_count"),
            "segment_count": validation.get("segment_count"),
            "micro_window_count": assignment["micro_window_count"],
            "normalization_applied": normalization is not None,
        })
    duplicates = {value for value, count in Counter(local_paths).items() if count > 1}
    if duplicates:
        for result in results:
            if result.get("task_thread_id") in duplicates:
                result["state"] = "rejected"
                result["errors"] = sorted(set(result.get("errors", []) + ["agent_path_reused_within_batch"]))
    counts = Counter(row["state"] for row in results)
    return {
        "audit_id": AUDIT_ID,
        "validator": "macro_batch_primary_v1",
        "batch_id": batch_id,
        "epoch_id": authority["epoch_id"],
        "status": "pass" if counts["eligible"] == len(rows) else ("in_progress" if counts["pending"] else "partial"),
        "counts": {
            "assignments": len(rows),
            "eligible": counts["eligible"],
            "pending": counts["pending"],
            "rejected": counts["rejected"],
        },
        "eligible_assignment_ids": sorted(row["assignment_id"] for row in results if row["state"] == "eligible"),
        "results": results,
    }


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--batch-id", required=True)
    args = parser.parse_args()
    report = validate_batch(args.batch_id)
    print(json.dumps(report, indent=2, sort_keys=True))
    raise SystemExit(0 if report["status"] in {"pass", "in_progress", "partial"} else 1)


if __name__ == "__main__":
    main()
