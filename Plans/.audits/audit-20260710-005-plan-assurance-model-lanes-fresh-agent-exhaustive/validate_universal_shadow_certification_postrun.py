#!/usr/bin/env python3
"""Strict postrun validator for universal shadow certification."""

from __future__ import annotations

import argparse
import json
from pathlib import Path
from typing import Any, Optional

from universal_shadow_certification_common import (
    ASSIGNMENT_COUNT, ATTEMPT_ID, AUDIT_ID, CONTROLLER_THREAD_ID, EFFORT,
    FEATURE_COUNT, FEATURES_PER_ASSIGNMENT, MODEL, NAMESPACE, WAVE_ID,
    digest_values, load_jsonl, load_object, receipt_contract, sha_file,
    validate_result_document,
)


def validate_postrun(namespace: Path = NAMESPACE, capture_override: Optional[Path] = None) -> dict[str, Any]:
    global_errors: list[str] = []
    assignment_reports: list[dict[str, Any]] = []
    try:
        manifest = load_jsonl(namespace / "batch_manifest.jsonl")
        contract = load_object(namespace / "receipt_contract.json")
    except Exception as exc:
        return {"status": "fail", "global_errors": ["load:%s:%s" % (type(exc).__name__, exc)], "assignments": []}
    if len(manifest) != ASSIGNMENT_COUNT:
        global_errors.append("manifest-cardinality")
    if contract != receipt_contract():
        global_errors.append("receipt-contract-drift")
    capture_path = capture_override or namespace / "runtime/native_capture.json"
    try:
        capture = load_object(capture_path)
        leaves = capture.get("leaves", [])
    except Exception as exc:
        capture = {}
        leaves = []
        global_errors.append("native-capture:%s:%s" % (type(exc).__name__, exc))
    if len(leaves) != ASSIGNMENT_COUNT:
        global_errors.append("native-capture-cardinality")
    capture_by_id = {row.get("assignment_id"): row for row in leaves if isinstance(row, dict)}
    for key in ("assignment_id", "agent_path", "native_child_thread_id", "native_child_turn_id"):
        values = [row.get(key) for row in leaves if isinstance(row, dict)]
        if len(values) != len(set(values)):
            global_errors.append("native-capture-duplicate:%s" % key)
    all_refs: list[str] = []
    for row in manifest:
        aid = row.get("assignment_id")
        errors: list[str] = []
        packet_path = namespace / row.get("packet_ref", "")
        intent_path = namespace / row.get("intent_ref", "")
        receipt_path = intent_path.with_name("dispatch_receipt.json")
        output_dir = Path(row.get("output_directory", ""))
        result_path = output_dir / "result.json"
        packet = None
        result = None
        if not packet_path.is_file() or sha_file(packet_path) != row.get("packet_sha256"):
            errors.append("packet-missing-or-hash")
        else:
            try:
                packet = load_object(packet_path)
            except Exception as exc:
                errors.append("packet-parse:%s" % type(exc).__name__)
        if not intent_path.is_file():
            errors.append("intent-missing")
        if not result_path.is_file():
            errors.append("result-missing")
        else:
            try:
                result = load_object(result_path)
            except Exception as exc:
                errors.append("result-parse:%s" % type(exc).__name__)
        if output_dir.is_dir():
            names = sorted(path.name for path in output_dir.iterdir())
            if names != ["result.json"]:
                errors.append("output-file-set")
        else:
            errors.append("output-directory-missing")
        if not receipt_path.is_file():
            errors.append("receipt-missing")
            receipt = {}
        else:
            try:
                receipt = load_object(receipt_path)
            except Exception as exc:
                receipt = {}
                errors.append("receipt-parse:%s" % type(exc).__name__)
        if set(receipt) != set(contract.get("required_keys", [])):
            errors.append("receipt-exact-key-set")
        constants = {"audit_id": AUDIT_ID, "schema_version": "external-research-universal-shadow-certification-dispatch-receipt-v1", "wave_id": WAVE_ID, "assignment_id": aid, "attempt_id": ATTEMPT_ID, "controller_thread_id": CONTROLLER_THREAD_ID, "model": MODEL, "reasoning_effort": EFFORT, "fresh_child": True, "fork_turns": "none", "packet_sha256": row.get("packet_sha256"), "output_directory": row.get("output_directory")}
        for key, expected in constants.items():
            if receipt.get(key) != expected:
                errors.append("receipt-binding:%s" % key)
        if intent_path.is_file() and receipt.get("dispatch_intent_sha256") != sha_file(intent_path):
            errors.append("receipt-intent-hash")
        if result_path.is_file() and receipt.get("result_sha256") != sha_file(result_path):
            errors.append("receipt-result-hash")
        if receipt.get("agent_path") != row.get("prospective_agent_path") or receipt.get("task_thread_id") != receipt.get("agent_path"):
            errors.append("receipt-agent-path")
        native = capture_by_id.get(aid, {})
        if native.get("agent_path") != row.get("prospective_agent_path"):
            errors.append("capture-agent-path")
        if native.get("native_child_thread_id") != receipt.get("native_child_thread_id"):
            errors.append("receipt-capture-native-thread")
        if native.get("native_child_turn_status") != "completed" or not str(native.get("terminal_response_prefix", "")).startswith("PMR1"):
            errors.append("capture-terminal-pmr1")
        if result is not None and packet is not None:
            errors.extend(validate_result_document(result, row, packet))
        all_refs.extend(row.get("feature_refs", []))
        assignment_reports.append({"assignment_id": aid, "state": "eligible" if not errors else "rejected", "errors": sorted(set(errors))})
    ids = [row.get("assignment_id") for row in manifest]
    if ids != ["A005ERSC-%04d" % index for index in range(1, 17)]:
        global_errors.append("manifest-assignment-order")
    if len(all_refs) != len(set(all_refs)) or len(all_refs) != FEATURE_COUNT:
        global_errors.append("global-feature-coverage")
    eligible = [row["assignment_id"] for row in assignment_reports if row["state"] == "eligible"]
    rejected = [row["assignment_id"] for row in assignment_reports if row["state"] == "rejected"]
    status = "pass" if not global_errors and len(eligible) == ASSIGNMENT_COUNT else "fail"
    return {
        "audit_id": AUDIT_ID,
        "validator": "universal-shadow-certification-postrun-v1",
        "wave_id": WAVE_ID,
        "status": status,
        "global_errors": sorted(set(global_errors)),
        "counts": {"assignments": len(manifest), "eligible": len(eligible), "rejected": len(rejected), "features": len(all_refs), "unique_features": len(set(all_refs)), "receipts": sum(1 for row in manifest if (namespace / row.get("intent_ref", "")).with_name("dispatch_receipt.json").is_file())},
        "eligible_assignment_ids": eligible,
        "eligible_assignment_ids_digest": digest_values(eligible),
        "rejected_assignment_ids": rejected,
        "assignments": assignment_reports,
        "certification_credit": FEATURE_COUNT if status == "pass" else 0,
        "promotion_credit": 0,
        "merge_credit": 0,
        "spec_edit_credit": 0,
    }


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--namespace", type=Path, default=NAMESPACE)
    parser.add_argument("--native-capture", type=Path)
    parser.add_argument("--write-report", type=Path)
    args = parser.parse_args()
    report = validate_postrun(args.namespace.resolve(), args.native_capture.resolve() if args.native_capture else None)
    if args.write_report:
        args.write_report.write_text(json.dumps(report, indent=2, sort_keys=True) + "\n", encoding="utf-8")
    print(json.dumps(report, indent=2, sort_keys=True))
    raise SystemExit(0 if report["status"] == "pass" else 1)


if __name__ == "__main__":
    main()
