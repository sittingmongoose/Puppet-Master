#!/usr/bin/env python3
"""Primary candidate postrun validator for retry-attempt-0007.

Eligibility is localized per assignment. The six-assignment independent floor is
never suppressed. No audit credit is granted by this primary candidate report;
fresh independent cumulative postrun remains required.
"""
from __future__ import annotations

import json
from pathlib import Path
from typing import Any

import canonical_json
import common
import generate_activation_transaction as activation


def transaction_errors(core: dict[str, Any], auths: dict[str, dict[str, Any]], envelope: dict[str, Any]) -> list[str]:
    report_path = Path(core.get("independent_prelaunch_path", ""))
    report_sha = core.get("independent_prelaunch_sha256", "")
    errors = activation.core_errors(core, report_path, report_sha)
    manifest = common.load(common.NAMESPACE / "manifest.json")
    assignments = {row["assignment_id"]: row for row in manifest["assignments"]}
    core_sha = common.canonical_sha(core)
    if set(auths) != set(common.RECOVERY_IDS):
        errors.append("transaction:authorization-set")
    for aid in common.RECOVERY_IDS:
        if aid in auths:
            errors.extend(activation.authorization_errors(auths[aid], aid, assignments[aid], core, core_sha))
    if set(auths) == set(common.RECOVERY_IDS):
        errors.extend(activation.envelope_errors(envelope, core, core_sha, auths))
    return sorted(set(errors))


def receipt_errors(
    receipt: dict[str, Any], receipt_raw: bytes, assignment: dict[str, Any], result_raw: bytes,
    core: dict[str, Any], auth: dict[str, Any], envelope: dict[str, Any], output_tree_sha: str,
) -> list[str]:
    aid = assignment["assignment_id"]
    schema = common.load(common.NAMESPACE / "schema/external_research_dispatch_receipt_v7.schema.json")
    errors = common.draft_errors(receipt, schema)
    result_file_sha = common.sha_bytes(result_raw)
    result_canonical_sha = canonical_json.canonical_sha256_from_buffer(result_raw)
    expected = {
        "schema_version": common.RECEIPT_SCHEMA_VERSION,
        "audit_id": common.AUDIT_ID,
        "sprint_id": common.SPRINT_ID,
        "retry_namespace": common.RETRY_NAMESPACE,
        "assignment_id": aid,
        "attempt_id": common.ATTEMPT_ID,
        "controller_thread_id": common.CONTROLLER_THREAD_ID,
        "agent_path": assignment["canonical_agent_path"],
        "task_thread_id": receipt.get("native_child_thread_id"),
        "model": common.MODEL,
        "reasoning_effort": common.REASONING_EFFORT,
        "fresh_child": True,
        "fork_turns": "none",
        "packet_id": assignment["packet_id"],
        "packet_path": assignment["packet_ref"],
        "packet_sha256": assignment["packet_sha256"],
        "dispatch_intent_path": assignment["dispatch_intent_ref"],
        "dispatch_intent_sha256": assignment["dispatch_intent_sha256"],
        "activation_transaction_id": core.get("activation_transaction_id"),
        "authorization_transaction_id": auth.get("authorization_transaction_id"),
        "activation_core_path": str(common.core_path()),
        "activation_core_canonical_sha256": common.canonical_sha(core),
        "leaf_dispatch_authorization_path": str(common.authorization_path(aid)),
        "leaf_dispatch_authorization_canonical_sha256": common.canonical_sha(auth),
        "activation_envelope_path": str(common.envelope_path()),
        "activation_envelope_canonical_sha256": common.canonical_sha(envelope),
        "terminal_proof_path": str(common.NAMESPACE / "runtime/terminal-proofs" / f"{aid}.json"),
        "output_directory": assignment["output_directory"],
        "result_path": assignment["output_path"],
        "result_file_sha256": result_file_sha,
        "result_canonical_sha256": result_canonical_sha,
        "result_buffer_byte_count": len(result_raw),
        "output_tree_sha256": output_tree_sha,
        "canonicalization_algorithm_id": common.CANONICALIZATION_ALGORITHM_ID,
        "receipt_writer_path": str(common.NAMESPACE / "tools/write_positive_receipt.py"),
        "receipt_writer_sha256": common.sha(common.NAMESPACE / "tools/write_positive_receipt.py"),
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
    for key, value in expected.items():
        if receipt.get(key) != value:
            errors.append("receipt:" + aid + ":" + key)
    expected_writer_transaction = common.canonical_sha({
        "assignment_id": aid,
        "native_child_thread_id": receipt.get("native_child_thread_id"),
        "result_file_sha256": result_file_sha,
        "result_canonical_sha256": result_canonical_sha,
        "output_tree_sha256": output_tree_sha,
    })
    if receipt.get("receipt_writer_transaction_id") != "A005-ER7-RECEIPT-" + expected_writer_transaction[:24]:
        errors.append("receipt:" + aid + ":receipt_writer_transaction_id")
    if "result_sha256" in receipt or "output_sha256" in receipt:
        errors.append("receipt:" + aid + ":ambiguous-digest-alias")
    if not isinstance(receipt.get("native_child_thread_id"), str) or not receipt.get("native_child_thread_id"):
        errors.append("receipt:" + aid + ":native-thread")
    if not isinstance(receipt.get("native_child_turn_id"), str) or not receipt.get("native_child_turn_id"):
        errors.append("receipt:" + aid + ":native-turn")
    # Receipt bytes must themselves parse with duplicate-key/finite-number closure.
    try:
        canonical_json.canonical_sha256_from_buffer(receipt_raw)
    except Exception as exc:
        errors.append("receipt:" + aid + ":canonical-parse:" + type(exc).__name__)
    return sorted(set(errors))


def capture_errors(
    capture: dict[str, Any], capture_raw: bytes, receipts: dict[str, dict[str, Any] | None],
    receipt_raws: dict[str, bytes | None], result_raws: dict[str, bytes | None], output_tree_shas: dict[str, str],
    prior: dict[str, set[str]],
) -> list[str]:
    schema = common.load(common.NAMESPACE / "schema/external_research_native_capture_v7.schema.json")
    errors = common.draft_errors(capture, schema)
    expected_top = {
        "schema_version": common.CAPTURE_SCHEMA_VERSION,
        "audit_id": common.AUDIT_ID,
        "sprint_id": common.SPRINT_ID,
        "retry_namespace": common.RETRY_NAMESPACE,
        "attempt_id": common.ATTEMPT_ID,
        "controller_thread_id": common.CONTROLLER_THREAD_ID,
        "assignment_count": 2,
        "capture_writer_path": str(common.NAMESPACE / "tools/write_native_capture.py"),
        "capture_writer_sha256": common.sha(common.NAMESPACE / "tools/write_native_capture.py"),
        "canonicalization_algorithm_id": common.CANONICALIZATION_ALGORITHM_ID,
        "coverage_credit": 0,
        "research_credit": 0,
        "promotion_credit": 0,
        "spec_credit": 0,
        "merge_credit": 0,
    }
    for key, value in expected_top.items():
        if capture.get(key) != value:
            errors.append("capture:" + key)
    leaves = capture.get("leaves", [])
    if not isinstance(leaves, list) or len(leaves) != 2:
        return sorted(set(errors + ["capture:cardinality"]))
    if [row.get("assignment_id") for row in leaves if isinstance(row, dict)] != common.RECOVERY_IDS:
        errors.append("capture:assignment-order")
    threads = []
    turns = []
    for row in leaves:
        if not isinstance(row, dict):
            continue
        aid = row.get("assignment_id")
        if aid not in common.RECOVERY_IDS:
            errors.append("capture:foreign-assignment")
            continue
        receipt = receipts.get(aid) or {}
        receipt_raw = receipt_raws.get(aid)
        result_raw = result_raws.get(aid)
        threads.append(row.get("native_child_thread_id"))
        turns.append(row.get("native_child_turn_id"))
        if row.get("agent_path") != common.expected_agent_path(aid):
            errors.append("capture:" + aid + ":path")
        if row.get("result_path") != str(common.result_path(aid)):
            errors.append("capture:" + aid + ":result-path")
        if row.get("receipt_path") != str(common.receipt_path(aid)):
            errors.append("capture:" + aid + ":receipt-path")
        if row.get("native_child_thread_id") != receipt.get("native_child_thread_id"):
            errors.append("capture:" + aid + ":thread-join")
        if row.get("native_child_turn_id") != receipt.get("native_child_turn_id"):
            errors.append("capture:" + aid + ":turn-join")
        if result_raw is not None:
            if row.get("result_file_sha256") != common.sha_bytes(result_raw):
                errors.append("capture:" + aid + ":result-file-sha")
            if row.get("result_canonical_sha256") != canonical_json.canonical_sha256_from_buffer(result_raw):
                errors.append("capture:" + aid + ":result-canonical-sha")
        if receipt_raw is not None:
            if row.get("receipt_file_sha256") != common.sha_bytes(receipt_raw):
                errors.append("capture:" + aid + ":receipt-file-sha")
            if row.get("receipt_canonical_sha256") != canonical_json.canonical_sha256_from_buffer(receipt_raw):
                errors.append("capture:" + aid + ":receipt-canonical-sha")
        if row.get("output_tree_sha256") != output_tree_shas.get(aid):
            errors.append("capture:" + aid + ":output-tree-sha")
        if row.get("canonicalization_algorithm_id") != common.CANONICALIZATION_ALGORITHM_ID:
            errors.append("capture:" + aid + ":canonicalization")
        if row.get("native_child_thread_id") in prior["identities"] or row.get("native_child_turn_id") in prior["identities"]:
            errors.append("capture:" + aid + ":identity-reuse")
        if row.get("agent_path") in prior["paths"]:
            errors.append("capture:" + aid + ":path-reuse")
    if len(set(threads)) != 2:
        errors.append("capture:thread-uniqueness")
    if len(set(turns)) != 2:
        errors.append("capture:turn-uniqueness")
    try:
        canonical_json.canonical_sha256_from_buffer(capture_raw)
    except Exception as exc:
        errors.append("capture:canonical-parse:" + type(exc).__name__)
    return sorted(set(errors))


def validate_snapshot(
    core: dict[str, Any], auths: dict[str, dict[str, Any]], envelope: dict[str, Any],
    result_raws: dict[str, bytes | None], receipt_raws: dict[str, bytes | None],
    capture: dict[str, Any], capture_raw: bytes, output_tree_shas: dict[str, str], prior: dict[str, set[str]],
) -> dict[str, Any]:
    manifest = common.load(common.NAMESPACE / "manifest.json")
    assignments = {row["assignment_id"]: row for row in manifest["assignments"]}
    transaction = transaction_errors(core, auths, envelope)
    receipts: dict[str, dict[str, Any] | None] = {}
    per_assignment: dict[str, list[str]] = {}
    eligible = []
    for aid in common.RECOVERY_IDS:
        errors = []
        result_raw = result_raws.get(aid)
        receipt_raw = receipt_raws.get(aid)
        auth = auths.get(aid, {})
        if result_raw is None:
            errors.append(aid + ":result-missing")
        else:
            _, _, _, result_errors = common.validate_result_buffer(result_raw, assignments[aid], core, auth)
            errors.extend(result_errors)
        if receipt_raw is None:
            receipts[aid] = None
            errors.append(aid + ":receipt-missing")
        else:
            try:
                receipt = common.parse_standard_exact(receipt_raw)
                receipts[aid] = receipt
                if result_raw is not None:
                    errors.extend(receipt_errors(receipt, receipt_raw, assignments[aid], result_raw, core, auth, envelope, output_tree_shas.get(aid, "")))
            except Exception as exc:
                receipts[aid] = None
                errors.append(aid + ":receipt-json:" + type(exc).__name__)
        errors.extend(error for error in transaction if error.startswith(("core:", "envelope:", "transaction:", f"authorization:{aid}:")))
        per_assignment[aid] = sorted(set(errors))
    capture_failures = capture_errors(capture, capture_raw, receipts, receipt_raws, result_raws, output_tree_shas, prior)
    capture_rows = {row.get("assignment_id"): row for row in capture.get("leaves", []) if isinstance(row, dict)}
    for aid in common.RECOVERY_IDS:
        localized = [error for error in capture_failures if error.startswith((f"capture:{aid}:", "capture:cardinality", "capture:assignment-order", "capture:thread-uniqueness", "capture:turn-uniqueness"))]
        if aid not in capture_rows:
            localized.append(aid + ":capture-missing")
        per_assignment[aid] = sorted(set(per_assignment[aid] + localized))
        if not per_assignment[aid]:
            eligible.append(aid)
    full = eligible == common.RECOVERY_IDS and not transaction and not capture_failures
    cumulative = common.FLOOR_IDS + eligible
    return {
        "schema_version": "external-research-recovery-postrun-v7",
        "checker": "external_research_recovery_attempt_0007_postrun",
        "audit_id": common.AUDIT_ID,
        "attempt_id": common.ATTEMPT_ID,
        "status": "pass_candidate_pending_independent" if full else "fail_closed",
        "eligible_attempt_0007_ids": eligible,
        "rejected_attempt_0007_ids": [aid for aid in common.RECOVERY_IDS if aid not in eligible],
        "per_assignment_errors": per_assignment,
        "global_errors": sorted(set(transaction + capture_failures)),
        "preserved_floor_ids": common.FLOOR_IDS,
        "preserved_floor_digest": common.FLOOR_DIGEST,
        "preserved_floor_count": 6,
        "cumulative_eligible_ids": cumulative,
        "cumulative_eligible_count": len(cumulative),
        "cumulative_eligible_digest": common.canonical_sha(cumulative),
        "candidate_research_eligibility_count": 8 if full else 0,
        "research_credit": 0,
        "coverage_credit": 0,
        "promotion_credit": 0,
        "spec_credit": 0,
        "merge_credit": 0,
        "attempt_level_veto": not full,
        "fresh_independent_cumulative_postrun_required": True,
        "unrelated_six_floor_suppressed": False,
    }


def main() -> None:
    required = [common.core_path(), common.envelope_path(), common.capture_path()] + [common.authorization_path(aid) for aid in common.RECOVERY_IDS]
    if any(not path.is_file() for path in required):
        print(json.dumps({"status": "fail_closed", "errors": ["postrun-inputs-missing"]}, indent=2))
        raise SystemExit(1)
    core = common.load(common.core_path())
    envelope = common.load(common.envelope_path())
    auths = {aid: common.load(common.authorization_path(aid)) for aid in common.RECOVERY_IDS}
    result_raws = {aid: common.result_path(aid).read_bytes() if common.result_path(aid).is_file() else None for aid in common.RECOVERY_IDS}
    receipt_raws = {aid: common.receipt_path(aid).read_bytes() if common.receipt_path(aid).is_file() else None for aid in common.RECOVERY_IDS}
    capture_raw = common.capture_path().read_bytes()
    capture = common.parse_standard_exact(capture_raw)
    tree_shas = {}
    for aid in common.RECOVERY_IDS:
        try:
            tree_shas[aid] = common.output_tree_sha256(common.output_dir(aid))
        except Exception:
            tree_shas[aid] = ""
    report = validate_snapshot(core, auths, envelope, result_raws, receipt_raws, capture, capture_raw, tree_shas, common.prior_identity_inventory())
    print(json.dumps(report, indent=2, sort_keys=True))
    raise SystemExit(0 if report["status"].startswith("pass") else 1)


if __name__ == "__main__":
    main()
