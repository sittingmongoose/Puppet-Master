#!/usr/bin/env python3
"""Strict candidate postrun validator for attempt-0004; never grants research credit."""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any

import common
import generate_activation


def output_files_errors(names: list[str]) -> list[str]:
    return [] if names == ["result.json"] else ["output:must_contain_exactly_result_json"]


def hash_binding_errors(observed: str, expected: str, label: str) -> list[str]:
    return [] if observed == expected else [f"{label}:hash"]


def prior_identity_set() -> set[str]:
    identities: set[str] = set()
    base = common.ROOT / "master/external_research/sprint-wave-0001"
    for retry in ("retry-attempt-0002", "retry-attempt-0003"):
        namespace = base / retry
        for receipt_path in namespace.rglob("dispatch_receipt.json"):
            try:
                receipt = common.load_obj(receipt_path)
                identities.update(str(receipt.get(key)) for key in ("task_thread_id", "native_child_thread_id") if receipt.get(key))
            except Exception: pass
        capture_path = namespace / "runtime/native_capture.json"
        if capture_path.is_file():
            try:
                for row in common.load_obj(capture_path).get("leaves", []):
                    for key in ("native_child_thread_id", "native_child_turn_id"):
                        if row.get(key): identities.add(str(row[key]))
            except Exception: pass
    return identities


def receipt_errors(
    receipt: dict[str, Any], assignment: dict[str, Any], intent_sha256: str, result_sha256: str,
    capture_row: dict[str, Any] | None,
) -> list[str]:
    errors: list[str] = []
    required = common.load_obj(common.NAMESPACE / "receipt_contract_v4.json").get("required_fields", [])
    if set(receipt) != set(required): errors.append("receipt:exact_keys")
    native_thread = None if capture_row is None else capture_row.get("native_child_thread_id")
    expected = {
        "schema_version": "external-research-receipt-v4", "audit_id": common.AUDIT_ID,
        "sprint_id": common.SPRINT_ID, "retry_namespace": common.RETRY_NAMESPACE,
        "assignment_id": assignment.get("assignment_id"), "attempt_id": common.ATTEMPT_ID,
        "controller_thread_id": common.CONTROLLER_THREAD_ID, "agent_path": assignment.get("canonical_agent_path"),
        "task_thread_id": native_thread, "native_child_thread_id": native_thread,
        "model": common.MODEL, "reasoning_effort": common.REASONING_EFFORT,
        "fresh_child": True, "fork_turns": "none", "descendants_forbidden": True,
        "followup_messages_forbidden": True, "retries_forbidden": True,
        "packet_id": assignment.get("packet_id"), "packet_path": assignment.get("packet_ref"),
        "packet_sha256": assignment.get("packet_sha256"), "dispatch_intent_path": assignment.get("dispatch_intent_ref"),
        "dispatch_intent_sha256": intent_sha256, "output_directory": assignment.get("output_directory"),
        "result_path": assignment.get("output_path"), "result_sha256": result_sha256, "output_sha256": result_sha256,
        "terminal_turn_status": "completed", "terminal_response_prefix": "PMR1",
        "receipt_written_after_spawn_and_terminal": True, "result_contains_task_thread_id": False,
        "native_capture_binding_deferred": True, "coverage_credit": 0, "research_credit": 0,
        "promotion_credit": 0, "spec_credit": 0, "merge_credit": 0,
    }
    for key, value in expected.items():
        if receipt.get(key) != value: errors.append(f"receipt:{key}")
    return sorted(set(errors))


def capture_set_errors(capture: dict[str, Any], receipts: dict[str, dict[str, Any]], prior: set[str]) -> list[str]:
    errors: list[str] = []
    if capture.get("attempt_id") != common.ATTEMPT_ID: errors.append("capture:attempt")
    leaves = capture.get("leaves", [])
    if len(leaves) != 2: errors.append("capture:cardinality")
    if [row.get("assignment_id") for row in leaves] != common.RECOVERY_IDS: errors.append("capture:assignment_order")
    threads: list[str] = []; turns: list[str] = []; paths: list[str] = []
    for row in leaves:
        aid = row.get("assignment_id")
        if aid not in common.RECOVERY_IDS: continue
        thread = row.get("native_child_thread_id"); turn = row.get("native_child_turn_id"); path = row.get("agent_path")
        threads.append(thread); turns.append(turn); paths.append(path)
        if path != common.expected_agent_path(aid): errors.append(f"{aid}:capture:agent_path")
        if not isinstance(thread, str) or not thread: errors.append(f"{aid}:capture:thread")
        if not isinstance(turn, str) or not turn: errors.append(f"{aid}:capture:turn")
        if row.get("native_child_turn_status") != "completed" or row.get("terminal_response_prefix") != "PMR1":
            errors.append(f"{aid}:capture:terminal")
        receipt = receipts.get(aid, {})
        if receipt.get("task_thread_id") != thread or receipt.get("native_child_thread_id") != thread:
            errors.append(f"{aid}:capture:receipt_thread")
    if len(set(threads)) != len(threads): errors.append("capture:duplicate_thread")
    if len(set(turns)) != len(turns): errors.append("capture:duplicate_turn")
    if len(set(paths)) != len(paths): errors.append("capture:duplicate_path")
    if prior.intersection(set(threads + turns)): errors.append("capture:prior_identity_reuse")
    return sorted(set(errors))


def validate_postrun() -> dict[str, Any]:
    global_errors: list[str] = []
    manifest = common.load_obj(common.NAMESPACE / "manifest.json")
    schema = common.load_obj(common.NAMESPACE / "schema/external_research_result_v4.schema.json")
    activation_path = common.NAMESPACE / "activation.json"
    if not activation_path.is_file(): global_errors.append("activation:missing")
    else:
        activation = common.load_obj(activation_path)
        global_errors.extend(generate_activation.activation_errors(activation))
    capture_path = common.NAMESPACE / "runtime/native_capture.json"
    capture: dict[str, Any] = {}
    if not capture_path.is_file(): global_errors.append("capture:missing")
    else: capture = common.load_obj(capture_path)
    capture_by_id = {row.get("assignment_id"): row for row in capture.get("leaves", []) if isinstance(row, dict)}
    receipts: dict[str, dict[str, Any]] = {}
    assignment_results: list[dict[str, Any]] = []
    for assignment in manifest.get("assignments", []):
        aid = assignment.get("assignment_id"); errors: list[str] = []
        output = Path(assignment.get("output_directory", "")); result_path = Path(assignment.get("output_path", ""))
        names = sorted(path.name for path in output.iterdir() if path.is_file()) if output.is_dir() else []
        errors.extend(output_files_errors(names))
        result: dict[str, Any] = {}; result_sha = ""
        if not result_path.is_file(): errors.append("result:missing")
        else:
            try: result = common.load_obj(result_path); result_sha = common.sha(result_path)
            except Exception as exc: errors.append(f"result:parse:{type(exc).__name__}")
        if result: errors.extend(common.result_errors(result, assignment, schema))
        receipt_path = Path(assignment.get("receipt_path", ""))
        receipt: dict[str, Any] = {}
        if not receipt_path.is_file(): errors.append("receipt:missing")
        else:
            try: receipt = common.load_obj(receipt_path); receipts[aid] = receipt
            except Exception as exc: errors.append(f"receipt:parse:{type(exc).__name__}")
        intent_sha = common.sha(Path(assignment["dispatch_intent_ref"])) if Path(assignment["dispatch_intent_ref"]).is_file() else ""
        if receipt: errors.extend(receipt_errors(receipt, assignment, intent_sha, result_sha, capture_by_id.get(aid)))
        assignment_results.append({"assignment_id": aid, "state": "eligible_candidate" if not errors else "rejected", "errors": sorted(set(errors))})
    global_errors.extend(capture_set_errors(capture, receipts, prior_identity_set()) if capture else [])
    eligible = [row["assignment_id"] for row in assignment_results if row["state"] == "eligible_candidate"]
    rejected = [row["assignment_id"] for row in assignment_results if row["state"] == "rejected"]
    return {
        "audit_id": common.AUDIT_ID, "checker": "external_research_recovery_attempt_0004_postrun_candidate_v4",
        "sprint_id": common.SPRINT_ID, "retry_namespace": common.RETRY_NAMESPACE, "attempt_id": common.ATTEMPT_ID,
        "status": "candidate_pass_awaiting_independent_postrun" if not global_errors and not rejected else "fail_closed",
        "global_errors": sorted(set(global_errors)), "assignment_results": assignment_results,
        "attempt_0004_candidate_eligible_ids": eligible, "attempt_0004_rejected_ids": rejected,
        "preserved_cumulative_floor_ids": common.FLOOR_IDS, "preserved_cumulative_floor_digest": common.FLOOR_DIGEST,
        "cumulative_research_credit": 0, "coverage_credit": 0, "promotion_credit": 0, "spec_credit": 0, "merge_credit": 0,
        "credit_blocker": "independent postrun validation remains required even if both candidate rows qualify",
    }


def main() -> None:
    report = validate_postrun()
    print(json.dumps(report, indent=2, sort_keys=True))
    raise SystemExit(0 if report["status"] == "candidate_pass_awaiting_independent_postrun" else 1)


if __name__ == "__main__": main()

