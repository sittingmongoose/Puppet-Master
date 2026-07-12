#!/usr/bin/env python3
"""Postrun validator for attempt-0005 with per-assignment fail-closed eligibility."""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any

import common
import generate_activation_transaction as activation


def output_files_errors(files: list[str]) -> list[str]:
    return [] if files == ["result.json"] else ["output:exactly_result_json_required"]


def transaction_errors(
    core: dict[str, Any], authorizations: dict[str, dict[str, Any]], envelope: dict[str, Any],
    independent_report_path: Path, independent_report_sha256: str,
) -> list[str]:
    errors: list[str] = []
    core_sha = common.sha_bytes(common.canonical(core))
    errors.extend(activation.core_errors(core, independent_report_path, independent_report_sha256))
    if "activation_transaction_id" not in core:
        errors.append("transaction:core_missing")
        return sorted(set(errors))
    manifest = common.load_obj(common.NAMESPACE / "manifest.json")
    rows = {row["assignment_id"]: row for row in manifest.get("assignments", [])}
    if set(authorizations) != set(common.RECOVERY_IDS): errors.append("transaction:authorization_set")
    for aid in common.RECOVERY_IDS:
        if aid in authorizations and aid in rows:
            errors.extend(activation.authorization_errors(authorizations[aid], rows[aid], core, core_sha))
    if set(authorizations) == set(common.RECOVERY_IDS): errors.extend(activation.envelope_errors(envelope, core, core_sha, authorizations))
    ids = [value.get("authorization_transaction_id") for value in authorizations.values()]
    if len(ids) != 2 or len(set(ids)) != 2: errors.append("transaction:authorization_ids")
    return sorted(set(errors))


def receipt_errors(
    receipt: dict[str, Any], assignment: dict[str, Any], result_sha256: str,
    core: dict[str, Any], core_sha256: str, authorization: dict[str, Any], authorization_sha256: str,
    envelope_sha256: str,
) -> list[str]:
    aid = assignment["assignment_id"]
    contract = common.load_obj(common.NAMESPACE / "receipt_contract_v5.json")
    required = contract.get("required_fields", [])
    errors: list[str] = []
    if set(receipt) != set(required): errors.append(f"{aid}:receipt:key_set")
    expected = {
        "schema_version": "external-research-dispatch-receipt-v5",
        "audit_id": common.AUDIT_ID,
        "sprint_id": common.SPRINT_ID,
        "retry_namespace": common.RETRY_NAMESPACE,
        "assignment_id": aid,
        "attempt_id": common.ATTEMPT_ID,
        "controller_thread_id": common.CONTROLLER_THREAD_ID,
        "agent_path": assignment["canonical_agent_path"],
        "model": common.MODEL,
        "reasoning_effort": common.REASONING_EFFORT,
        "fresh_child": True,
        "fork_turns": "none",
        "descendants_forbidden": True,
        "followup_messages_forbidden": True,
        "retries_forbidden": True,
        "packet_id": assignment["packet_id"],
        "packet_path": str(common.packet_path(aid)),
        "packet_sha256": common.sha(common.packet_path(aid)),
        "dispatch_intent_path": str(common.intent_path(aid)),
        "dispatch_intent_sha256": common.sha(common.intent_path(aid)),
        "activation_transaction_id": core["activation_transaction_id"],
        "authorization_transaction_id": authorization["authorization_transaction_id"],
        "activation_core_path": str(common.core_path()),
        "activation_core_sha256": core_sha256,
        "leaf_dispatch_authorization_path": str(common.authorization_path(aid)),
        "leaf_dispatch_authorization_sha256": authorization_sha256,
        "activation_envelope_path": str(common.envelope_path()),
        "activation_envelope_sha256": envelope_sha256,
        "output_directory": str(common.output_dir(aid)),
        "result_path": str(common.output_dir(aid) / "result.json"),
        "result_sha256": result_sha256,
        "output_sha256": result_sha256,
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
    for key, value in expected.items():
        if receipt.get(key) != value: errors.append(f"{aid}:receipt:{key}")
    thread = receipt.get("task_thread_id")
    if not isinstance(thread, str) or not thread: errors.append(f"{aid}:receipt:task_thread_id")
    if receipt.get("native_child_thread_id") != thread: errors.append(f"{aid}:receipt:native_child_thread_id")
    return sorted(set(errors))


def capture_set_errors(capture: dict[str, Any], receipts: dict[str, dict[str, Any]], prior_identities: set[str]) -> list[str]:
    errors: list[str] = []
    expected_top = {
        "schema_version": "external-research-native-capture-v5", "audit_id": common.AUDIT_ID,
        "sprint_id": common.SPRINT_ID, "retry_namespace": common.RETRY_NAMESPACE,
        "attempt_id": common.ATTEMPT_ID, "assignment_count": 2,
    }
    for key, value in expected_top.items():
        if capture.get(key) != value: errors.append(f"capture:{key}")
    leaves = capture.get("leaves", [])
    if not isinstance(leaves, list) or len(leaves) != 2: return sorted(set(errors + ["capture:rows"]))
    if [row.get("assignment_id") for row in leaves] != common.RECOVERY_IDS: errors.append("capture:assignment_set")
    threads: list[str] = []; turns: list[str] = []; paths: list[str] = []
    required_row = set(common.load_obj(common.NAMESPACE / "native_capture_contract_v5.json").get("required_row_fields", []))
    for row in leaves:
        aid = row.get("assignment_id")
        if aid not in common.RECOVERY_IDS: continue
        if set(row) != required_row: errors.append(f"capture:{aid}:key_set")
        thread = row.get("native_child_thread_id"); turn = row.get("native_child_turn_id"); path = row.get("agent_path")
        threads.append(thread); turns.append(turn); paths.append(path)
        receipt = receipts.get(aid, {})
        if path != common.expected_agent_path(aid): errors.append(f"capture:{aid}:agent_path")
        if thread != receipt.get("task_thread_id") or thread != receipt.get("native_child_thread_id"): errors.append(f"capture:{aid}:receipt_thread")
        if row.get("native_child_turn_status") != "completed": errors.append(f"capture:{aid}:status")
        if row.get("terminal_response_exact") != "PMR1": errors.append(f"capture:{aid}:terminal")
        if row.get("result_present_before_pmr1") is not True: errors.append(f"capture:{aid}:result_before_pmr1")
        if row.get("result_sha256") != receipt.get("result_sha256"): errors.append(f"capture:{aid}:result_hash")
        receipt_path = common.receipt_path(aid)
        if receipt_path.is_file() and row.get("receipt_sha256") != common.sha(receipt_path): errors.append(f"capture:{aid}:receipt_hash")
        if thread in prior_identities or turn in prior_identities: errors.append(f"capture:{aid}:identity_reuse")
    if any(not isinstance(value, str) or not value for value in threads + turns): errors.append("capture:empty_identity")
    if len(set(threads)) != 2: errors.append("capture:duplicate_thread")
    if len(set(turns)) != 2: errors.append("capture:duplicate_turn")
    if paths != [common.expected_agent_path(aid) for aid in common.RECOVERY_IDS]: errors.append("capture:path_order")
    return sorted(set(errors))


def assignment_errors(
    assignment: dict[str, Any], result: dict[str, Any] | None, result_sha256: str | None,
    receipt: dict[str, Any] | None, capture_row: dict[str, Any] | None,
    core: dict[str, Any], core_sha256: str, authorization: dict[str, Any], authorization_sha256: str,
    envelope_sha256: str, schema: dict[str, Any], output_files: list[str],
) -> list[str]:
    aid = assignment["assignment_id"]
    errors = output_files_errors(output_files)
    if capture_row and capture_row.get("terminal_response_exact") == "PMR1" and result is None:
        errors.append(f"{aid}:pmr1_without_result")
    if result is None or result_sha256 is None:
        errors.append(f"{aid}:result_missing")
    else:
        errors.extend(common.result_errors(result, assignment, schema, core["activation_transaction_id"], core_sha256, authorization_sha256))
    if receipt is None:
        errors.append(f"{aid}:receipt_missing")
    elif result_sha256 is not None:
        errors.extend(receipt_errors(receipt, assignment, result_sha256, core, core_sha256, authorization, authorization_sha256, envelope_sha256))
    if capture_row is None: errors.append(f"{aid}:capture_missing")
    return sorted(set(errors))


def validate_snapshot(
    core: dict[str, Any], authorizations: dict[str, dict[str, Any]], envelope: dict[str, Any],
    independent_report_path: Path, independent_report_sha256: str,
    results: dict[str, dict[str, Any] | None], result_hashes: dict[str, str | None],
    receipts: dict[str, dict[str, Any] | None], capture: dict[str, Any],
    output_files: dict[str, list[str]], prior_identities: set[str],
) -> dict[str, Any]:
    transaction = transaction_errors(core, authorizations, envelope, independent_report_path, independent_report_sha256)
    schema = common.load_obj(common.NAMESPACE / "schema/external_research_result_v5.schema.json")
    manifest = common.load_obj(common.NAMESPACE / "manifest.json")
    assignments = {row["assignment_id"]: row for row in manifest.get("assignments", [])}
    core_sha = common.sha_bytes(common.canonical(core)); envelope_sha = common.sha_bytes(common.canonical(envelope))
    capture_rows = {row.get("assignment_id"): row for row in capture.get("leaves", []) if isinstance(row, dict)}
    capture_errors = capture_set_errors(capture, {aid: value or {} for aid, value in receipts.items()}, prior_identities)
    per_assignment: dict[str, list[str]] = {}
    eligible: list[str] = []
    for aid in common.RECOVERY_IDS:
        auth = authorizations.get(aid, {})
        auth_sha = common.sha_bytes(common.canonical(auth)) if auth else ""
        errors = assignment_errors(assignments[aid], results.get(aid), result_hashes.get(aid), receipts.get(aid), capture_rows.get(aid),
                                   core, core_sha, auth, auth_sha, envelope_sha, schema, output_files.get(aid, []))
        errors.extend(item for item in transaction if aid in item or item.startswith(("core:", "envelope:", "transaction:")))
        errors.extend(item for item in capture_errors if item.startswith((f"capture:{aid}:", "capture:duplicate", "capture:rows", "capture:assignment_set")))
        per_assignment[aid] = sorted(set(errors))
        if not per_assignment[aid]: eligible.append(aid)
    rejected = [aid for aid in common.RECOVERY_IDS if aid not in eligible]
    cumulative = common.FLOOR_IDS + eligible
    full = eligible == common.RECOVERY_IDS
    return {
        "status": "pass" if full else "fail_closed",
        "eligible_attempt_0005_ids": eligible,
        "rejected_attempt_0005_ids": rejected,
        "per_assignment_errors": per_assignment,
        "cumulative_eligible_ids": cumulative,
        "cumulative_eligible_count": len(cumulative),
        "cumulative_research_credit": 8 if full else 0,
        "coverage_credit": 0,
        "promotion_credit": 0,
        "spec_credit": 0,
        "merge_credit": 0,
        "global_errors": sorted(set(transaction + capture_errors)),
    }


def main() -> None:
    paths = [common.core_path(), common.envelope_path()] + [common.authorization_path(aid) for aid in common.RECOVERY_IDS]
    if any(not path.is_file() for path in paths):
        print(json.dumps({"status": "fail_closed", "errors": ["activation_transaction:missing"]}, indent=2)); raise SystemExit(1)
    core = common.load_obj(common.core_path()); envelope = common.load_obj(common.envelope_path())
    authorizations = {aid: common.load_obj(common.authorization_path(aid)) for aid in common.RECOVERY_IDS}
    independent_path = Path(core.get("independent_prelaunch_path", "")); independent_sha = core.get("independent_prelaunch_sha256", "")
    results: dict[str, dict[str, Any] | None] = {}; hashes: dict[str, str | None] = {}; receipts: dict[str, dict[str, Any] | None] = {}; files: dict[str, list[str]] = {}
    for aid in common.RECOVERY_IDS:
        output = common.output_dir(aid); result_path = output / "result.json"
        files[aid] = sorted(path.name for path in output.iterdir() if path.is_file()) if output.is_dir() else []
        results[aid] = common.load_obj(result_path) if result_path.is_file() else None
        hashes[aid] = common.sha(result_path) if result_path.is_file() else None
        receipts[aid] = common.load_obj(common.receipt_path(aid)) if common.receipt_path(aid).is_file() else None
    capture_path = common.NAMESPACE / "runtime/native_capture.json"
    capture = common.load_obj(capture_path) if capture_path.is_file() else {"leaves": []}
    report = validate_snapshot(core, authorizations, envelope, independent_path, independent_sha, results, hashes, receipts, capture, files, common.prior_native_identities())
    report.update({"checker": "external_research_recovery_attempt_0005_postrun_v5", "audit_id": common.AUDIT_ID, "attempt_id": common.ATTEMPT_ID})
    print(json.dumps(report, indent=2, sort_keys=True))
    raise SystemExit(0 if report["status"] == "pass" else 1)


if __name__ == "__main__":
    main()
