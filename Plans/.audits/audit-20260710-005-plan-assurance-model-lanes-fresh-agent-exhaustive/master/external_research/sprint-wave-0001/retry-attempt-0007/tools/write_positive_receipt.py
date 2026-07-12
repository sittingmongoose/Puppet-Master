#!/usr/bin/env python3
"""Sealed positive receipt writer for attempt-0007.

Manual positive receipts are forbidden. This writer reads one immutable result
buffer, validates it, computes the raw and canonical digests from that same
buffer, verifies terminal/native proof, closes TOCTOU immediately before the
exclusive receipt write, and rechecks the result/output tree afterward.
"""
from __future__ import annotations

import argparse
import json
from pathlib import Path
from typing import Any

import common


TERMINAL_PROOF_KEYS = {
    "schema_version", "assignment_id", "attempt_id", "agent_path", "native_child_thread_id",
    "native_child_turn_id", "native_child_turn_status", "terminal_response_exact",
    "result_present_before_pmr1", "result_file_sha256", "parent_spawn_call_sha256",
    "parent_spawn_result_sha256", "spawn_requested_model", "spawn_requested_reasoning_effort",
    "fork_turns", "descendants_spawned", "followup_messages_sent", "retries_spawned",
}


def terminal_proof_errors(proof: dict[str, Any], aid: str, result_file_sha: str) -> list[str]:
    expected = {
        "schema_version": "external-research-terminal-proof-v7",
        "assignment_id": aid,
        "attempt_id": common.ATTEMPT_ID,
        "agent_path": common.expected_agent_path(aid),
        "native_child_turn_status": "completed",
        "terminal_response_exact": "PMR1",
        "result_present_before_pmr1": True,
        "result_file_sha256": result_file_sha,
        "spawn_requested_model": common.MODEL,
        "spawn_requested_reasoning_effort": common.REASONING_EFFORT,
        "fork_turns": "none",
        "descendants_spawned": 0,
        "followup_messages_sent": 0,
        "retries_spawned": 0,
    }
    errors = []
    if set(proof) != TERMINAL_PROOF_KEYS:
        errors.append("terminal-proof:key-set")
    for key, value in expected.items():
        if proof.get(key) != value:
            errors.append("terminal-proof:" + key)
    for key in ["native_child_thread_id", "native_child_turn_id"]:
        if not isinstance(proof.get(key), str) or not proof.get(key):
            errors.append("terminal-proof:" + key)
    for key in ["parent_spawn_call_sha256", "parent_spawn_result_sha256"]:
        if not isinstance(proof.get(key), str) or len(proof.get(key, "")) != 64:
            errors.append("terminal-proof:" + key)
    return sorted(set(errors))


def build_receipt(
    assignment: dict[str, Any], core: dict[str, Any], authorization: dict[str, Any], envelope: dict[str, Any],
    terminal_proof: dict[str, Any], terminal_proof_path: Path, terminal_proof_sha: str,
    result_file_sha: str, result_canonical_sha: str, result_byte_count: int, output_tree_sha: str,
) -> dict[str, Any]:
    aid = assignment["assignment_id"]
    writer_path = common.NAMESPACE / "tools/write_positive_receipt.py"
    transaction_id = common.canonical_sha({
        "assignment_id": aid,
        "native_child_thread_id": terminal_proof["native_child_thread_id"],
        "result_file_sha256": result_file_sha,
        "result_canonical_sha256": result_canonical_sha,
        "output_tree_sha256": output_tree_sha,
    })
    return {
        "schema_version": common.RECEIPT_SCHEMA_VERSION,
        "audit_id": common.AUDIT_ID,
        "sprint_id": common.SPRINT_ID,
        "retry_namespace": common.RETRY_NAMESPACE,
        "assignment_id": aid,
        "attempt_id": common.ATTEMPT_ID,
        "controller_thread_id": common.CONTROLLER_THREAD_ID,
        "agent_path": assignment["canonical_agent_path"],
        "task_thread_id": terminal_proof["native_child_thread_id"],
        "native_child_thread_id": terminal_proof["native_child_thread_id"],
        "native_child_turn_id": terminal_proof["native_child_turn_id"],
        "model": common.MODEL,
        "reasoning_effort": common.REASONING_EFFORT,
        "fresh_child": True,
        "fork_turns": "none",
        "descendants_forbidden": True,
        "followup_messages_forbidden": True,
        "retries_forbidden": True,
        "packet_id": assignment["packet_id"],
        "packet_path": assignment["packet_ref"],
        "packet_sha256": assignment["packet_sha256"],
        "dispatch_intent_path": assignment["dispatch_intent_ref"],
        "dispatch_intent_sha256": assignment["dispatch_intent_sha256"],
        "activation_transaction_id": core["activation_transaction_id"],
        "authorization_transaction_id": authorization["authorization_transaction_id"],
        "activation_core_path": str(common.core_path()),
        "activation_core_canonical_sha256": common.canonical_sha(core),
        "leaf_dispatch_authorization_path": str(common.authorization_path(aid)),
        "leaf_dispatch_authorization_canonical_sha256": common.canonical_sha(authorization),
        "activation_envelope_path": str(common.envelope_path()),
        "activation_envelope_canonical_sha256": common.canonical_sha(envelope),
        "terminal_proof_path": str(terminal_proof_path),
        "terminal_proof_file_sha256": terminal_proof_sha,
        "parent_spawn_call_sha256": terminal_proof["parent_spawn_call_sha256"],
        "parent_spawn_result_sha256": terminal_proof["parent_spawn_result_sha256"],
        "output_directory": assignment["output_directory"],
        "result_path": assignment["output_path"],
        "result_file_sha256": result_file_sha,
        "result_canonical_sha256": result_canonical_sha,
        "result_buffer_byte_count": result_byte_count,
        "output_tree_sha256": output_tree_sha,
        "canonicalization_algorithm_id": common.CANONICALIZATION_ALGORITHM_ID,
        "receipt_writer_path": str(writer_path),
        "receipt_writer_sha256": common.sha(writer_path),
        "receipt_writer_transaction_id": "A005-ER7-RECEIPT-" + transaction_id[:24],
        "single_result_buffer_used": True,
        "toctou_recheck_passed_before_write": True,
        "result_present_before_pmr1": True,
        "result_required_before_pmr1": True,
        "terminal_turn_status": "completed",
        "terminal_response_exact": "PMR1",
        "receipt_written_after_spawn_and_terminal": True,
        "result_contains_task_thread_id": False,
        "native_capture_binding_deferred": True,
        "coverage_credit": 0,
        "research_credit": 0,
        "promotion_credit": 0,
        "spec_credit": 0,
        "merge_credit": 0,
    }


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--assignment-id", choices=common.RECOVERY_IDS, required=True)
    parser.add_argument("--terminal-proof", type=Path, required=True)
    parser.add_argument("--terminal-proof-sha256", required=True)
    args = parser.parse_args()
    aid = args.assignment_id
    expected_proof_path = common.NAMESPACE / "runtime/terminal-proofs" / f"{aid}.json"
    if args.terminal_proof != expected_proof_path:
        raise SystemExit("terminal proof path is not the frozen assignment path")
    required = [common.core_path(), common.authorization_path(aid), common.envelope_path(), common.result_path(aid), args.terminal_proof]
    if any(not path.is_file() for path in required):
        raise SystemExit("required input missing")
    if common.sha(args.terminal_proof) != args.terminal_proof_sha256:
        raise SystemExit("terminal proof hash drift")
    manifest = common.load(common.NAMESPACE / "manifest.json")
    assignment = next(row for row in manifest["assignments"] if row["assignment_id"] == aid)
    core = common.load(common.core_path())
    auth = common.load(common.authorization_path(aid))
    envelope = common.load(common.envelope_path())
    result_raw = common.result_path(aid).read_bytes()  # one immutable buffer
    result, file_sha, canonical_sha, result_errors = common.validate_result_buffer(result_raw, assignment, core, auth)
    proof = common.load(args.terminal_proof)
    errors = result_errors + terminal_proof_errors(proof, aid, file_sha)
    inventory = common.output_tree_inventory(common.output_dir(aid))
    if [row["relative_path"] for row in inventory] != ["result.json"]:
        errors.append("output-tree:not-exactly-result-json")
    tree_sha = common.canonical_sha(inventory)
    if errors:
        raise SystemExit(json.dumps({"status": "fail_closed", "errors": sorted(set(errors))}, indent=2))
    # TOCTOU closure immediately before exclusive write.
    if common.result_path(aid).read_bytes() != result_raw:
        raise SystemExit("result mutated after read")
    if common.output_tree_sha256(common.output_dir(aid)) != tree_sha:
        raise SystemExit("output tree mutated after read")
    receipt = build_receipt(assignment, core, auth, envelope, proof, args.terminal_proof, args.terminal_proof_sha256, file_sha, canonical_sha, len(result_raw), tree_sha)
    receipt_schema = common.load(common.NAMESPACE / "schema/external_research_dispatch_receipt_v7.schema.json")
    receipt_errors = common.draft_errors(receipt, receipt_schema)
    if receipt_errors:
        raise SystemExit(json.dumps({"status": "fail_closed", "errors": receipt_errors}, indent=2))
    common.write_exclusive(common.receipt_path(aid), receipt)
    # Post-write result/output check. Receipt is outside the semantic output tree.
    if common.result_path(aid).read_bytes() != result_raw or common.output_tree_sha256(common.output_dir(aid)) != tree_sha:
        raise SystemExit("post-write TOCTOU failure; receipt is invalid and attempt is vetoed")
    print(json.dumps({"status": "pass", "assignment_id": aid, "receipt_path": str(common.receipt_path(aid)), "result_file_sha256": file_sha, "result_canonical_sha256": canonical_sha, "output_tree_sha256": tree_sha}, indent=2, sort_keys=True))


if __name__ == "__main__":
    main()
