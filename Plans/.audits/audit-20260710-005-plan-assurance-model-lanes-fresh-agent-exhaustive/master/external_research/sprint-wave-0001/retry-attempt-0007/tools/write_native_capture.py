#!/usr/bin/env python3
"""Sealed native capture writer with distinct raw/canonical digest classes."""
from __future__ import annotations

import argparse
import json
from pathlib import Path
from typing import Any

import canonical_json
import common


def native_state_errors(state: dict[str, Any]) -> list[str]:
    errors = []
    expected_top = {"schema_version", "attempt_id", "controller_thread_id", "leaves"}
    if set(state) != expected_top:
        errors.append("native-state:key-set")
    if state.get("schema_version") != "external-research-controller-native-state-v7":
        errors.append("native-state:schema-version")
    if state.get("attempt_id") != common.ATTEMPT_ID:
        errors.append("native-state:attempt")
    if state.get("controller_thread_id") != common.CONTROLLER_THREAD_ID:
        errors.append("native-state:controller")
    leaves = state.get("leaves", [])
    if not isinstance(leaves, list) or len(leaves) != 2:
        return sorted(set(errors + ["native-state:cardinality"]))
    expected_keys = {"assignment_id", "agent_path", "native_child_thread_id", "native_child_turn_id", "native_child_turn_status", "terminal_response_exact", "result_present_before_pmr1", "parent_spawn_call_sha256", "parent_spawn_result_sha256", "spawn_requested_model", "spawn_requested_reasoning_effort", "fork_turns", "descendants_spawned", "followup_messages_sent", "retries_spawned"}
    ids = []
    threads = []
    turns = []
    for row in leaves:
        if not isinstance(row, dict) or set(row) != expected_keys:
            errors.append("native-state:row-key-set")
            continue
        aid = row.get("assignment_id")
        ids.append(aid)
        threads.append(row.get("native_child_thread_id"))
        turns.append(row.get("native_child_turn_id"))
        expected = {
            "agent_path": common.expected_agent_path(aid) if aid in common.RECOVERY_IDS else None,
            "native_child_turn_status": "completed", "terminal_response_exact": "PMR1",
            "result_present_before_pmr1": True, "spawn_requested_model": common.MODEL,
            "spawn_requested_reasoning_effort": common.REASONING_EFFORT, "fork_turns": "none",
            "descendants_spawned": 0, "followup_messages_sent": 0, "retries_spawned": 0,
        }
        for key, value in expected.items():
            if row.get(key) != value:
                errors.append(f"native-state:{aid}:{key}")
    if ids != common.RECOVERY_IDS:
        errors.append("native-state:assignment-order")
    if len(set(threads)) != 2 or any(not isinstance(value, str) or not value for value in threads):
        errors.append("native-state:thread-uniqueness")
    if len(set(turns)) != 2 or any(not isinstance(value, str) or not value for value in turns):
        errors.append("native-state:turn-uniqueness")
    prior = common.prior_identity_inventory()
    if any(value in prior["identities"] for value in threads + turns):
        errors.append("native-state:identity-reuse")
    if any(common.expected_agent_path(aid) in prior["paths"] for aid in common.RECOVERY_IDS):
        errors.append("native-state:path-reuse")
    return sorted(set(errors))


def build_capture(state: dict[str, Any], state_path: Path, state_sha: str) -> dict[str, Any]:
    manifest = common.load(common.NAMESPACE / "manifest.json")
    assignments = {row["assignment_id"]: row for row in manifest["assignments"]}
    leaves = []
    for native in state["leaves"]:
        aid = native["assignment_id"]
        receipt_raw = common.receipt_path(aid).read_bytes()
        receipt = common.parse_standard_exact(receipt_raw)
        result_raw = common.result_path(aid).read_bytes()
        result_file_sha = common.sha_bytes(result_raw)
        result_canonical_sha = canonical_json.canonical_sha256_from_buffer(result_raw)
        receipt_file_sha = common.sha_bytes(receipt_raw)
        receipt_canonical_sha = canonical_json.canonical_sha256_from_buffer(receipt_raw)
        if receipt.get("result_file_sha256") != result_file_sha or receipt.get("result_canonical_sha256") != result_canonical_sha:
            raise ValueError(aid + ":receipt-result-digest-join")
        if receipt.get("output_tree_sha256") != common.output_tree_sha256(common.output_dir(aid)):
            raise ValueError(aid + ":output-tree-digest-join")
        if receipt.get("task_thread_id") != native["native_child_thread_id"] or receipt.get("native_child_turn_id") != native["native_child_turn_id"]:
            raise ValueError(aid + ":native-identity-join")
        leaves.append({
            "assignment_id": aid,
            "agent_path": assignments[aid]["canonical_agent_path"],
            "native_child_thread_id": native["native_child_thread_id"],
            "native_child_turn_id": native["native_child_turn_id"],
            "native_child_turn_status": "completed",
            "terminal_response_exact": "PMR1",
            "result_present_before_pmr1": True,
            "result_path": str(common.result_path(aid)),
            "result_file_sha256": result_file_sha,
            "result_canonical_sha256": result_canonical_sha,
            "output_tree_sha256": common.output_tree_sha256(common.output_dir(aid)),
            "receipt_path": str(common.receipt_path(aid)),
            "receipt_file_sha256": receipt_file_sha,
            "receipt_canonical_sha256": receipt_canonical_sha,
            "canonicalization_algorithm_id": common.CANONICALIZATION_ALGORITHM_ID,
            "parent_spawn_call_sha256": native["parent_spawn_call_sha256"],
            "parent_spawn_result_sha256": native["parent_spawn_result_sha256"],
        })
    writer_path = common.NAMESPACE / "tools/write_native_capture.py"
    return {
        "schema_version": common.CAPTURE_SCHEMA_VERSION,
        "audit_id": common.AUDIT_ID,
        "sprint_id": common.SPRINT_ID,
        "retry_namespace": common.RETRY_NAMESPACE,
        "attempt_id": common.ATTEMPT_ID,
        "controller_thread_id": common.CONTROLLER_THREAD_ID,
        "assignment_count": 2,
        "native_state_path": str(state_path),
        "native_state_file_sha256": state_sha,
        "capture_writer_path": str(writer_path),
        "capture_writer_sha256": common.sha(writer_path),
        "canonicalization_algorithm_id": common.CANONICALIZATION_ALGORITHM_ID,
        "leaves": leaves,
        "coverage_credit": 0,
        "research_credit": 0,
        "promotion_credit": 0,
        "spec_credit": 0,
        "merge_credit": 0,
    }


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--native-state", type=Path, required=True)
    parser.add_argument("--sha256", required=True)
    args = parser.parse_args()
    if not args.native_state.is_file() or common.sha(args.native_state) != args.sha256:
        raise SystemExit("native state missing or hash drift")
    state = common.load(args.native_state)
    errors = native_state_errors(state)
    if errors:
        raise SystemExit(json.dumps({"status": "fail_closed", "errors": errors}, indent=2))
    capture = build_capture(state, args.native_state, args.sha256)
    schema = common.load(common.NAMESPACE / "schema/external_research_native_capture_v7.schema.json")
    errors = common.draft_errors(capture, schema)
    if errors:
        raise SystemExit(json.dumps({"status": "fail_closed", "errors": errors}, indent=2))
    common.write_exclusive(common.capture_path(), capture)
    print(json.dumps({"status": "pass", "capture_path": str(common.capture_path()), "capture_file_sha256": common.sha(common.capture_path()), "capture_canonical_sha256": canonical_json.canonical_sha256_from_buffer(common.capture_path().read_bytes())}, indent=2, sort_keys=True))


if __name__ == "__main__":
    main()
