#!/usr/bin/env python3
"""Per-assignment fail-closed postrun validator for attempt-0006."""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any

import common
import generate_activation_transaction as activation


def transaction_errors(core: dict[str, Any], authorizations: dict[str, dict[str, Any]], envelope: dict[str, Any]) -> list[str]:
    report_path = Path(core.get("independent_prelaunch_path", ""))
    report_sha = core.get("independent_prelaunch_sha256", "")
    errors = activation.core_errors(core, report_path, report_sha)
    core_sha = common.digest(core)
    manifest = common.load(common.NAMESPACE / "manifest.json")
    assignments = {row["assignment_id"]: row for row in manifest["assignments"]}
    if set(authorizations) != set(common.RECOVERY_IDS): errors.append("transaction:authorization-set")
    for aid in common.RECOVERY_IDS:
        if aid in authorizations: errors += activation.authorization_errors(authorizations[aid], aid, assignments[aid], core, core_sha)
    if set(authorizations) == set(common.RECOVERY_IDS): errors += activation.envelope_errors(envelope, core, core_sha, authorizations)
    if core.get("required_positive_receipt_schema_version") != common.POSITIVE_RECEIPT_SCHEMA_VERSION: errors.append("transaction:receipt-label")
    return sorted(set(errors))


def capture_errors(capture: dict[str, Any], receipts: dict[str, dict[str, Any] | None], prior: dict[str, Any]) -> list[str]:
    errors = []
    expected_top = {"schema_version": "external-research-native-capture-v6", "audit_id": common.AUDIT_ID, "sprint_id": common.SPRINT_ID, "retry_namespace": common.RETRY_NAMESPACE, "attempt_id": common.ATTEMPT_ID, "assignment_count": 2}
    for key, value in expected_top.items():
        if capture.get(key) != value: errors.append("capture:%s" % key)
    leaves = capture.get("leaves", [])
    if not isinstance(leaves, list) or len(leaves) != 2: return sorted(set(errors + ["capture:rows"]))
    required = set(common.load(common.NAMESPACE / "native_capture_contract_v6.json")["required_row_fields"])
    threads = []; turns = []; paths = []
    for row in leaves:
        aid = row.get("assignment_id")
        if aid not in common.RECOVERY_IDS: errors.append("capture:foreign-assignment"); continue
        if set(row) != required: errors.append("capture:%s:key-set" % aid)
        receipt = receipts.get(aid) or {}
        thread = row.get("native_child_thread_id"); turn = row.get("native_child_turn_id"); path = row.get("agent_path")
        threads.append(thread); turns.append(turn); paths.append(path)
        if path != common.expected_agent_path(aid): errors.append("capture:%s:path" % aid)
        if thread != receipt.get("task_thread_id") or thread != receipt.get("native_child_thread_id"): errors.append("capture:%s:thread-join" % aid)
        if row.get("native_child_turn_status") != "completed" or row.get("terminal_response_exact") != "PMR1" or row.get("result_present_before_pmr1") is not True: errors.append("capture:%s:terminal" % aid)
        if row.get("result_sha256") != receipt.get("result_sha256"): errors.append("capture:%s:result-hash" % aid)
        if common.receipt_path(aid).is_file() and row.get("receipt_sha256") != common.sha(common.receipt_path(aid)): errors.append("capture:%s:receipt-hash" % aid)
        if thread in prior["identities"] or turn in prior["identities"]: errors.append("capture:%s:identity-reuse" % aid)
        if path in prior["paths"]: errors.append("capture:%s:path-reuse" % aid)
    if len(set(threads)) != 2 or any(not isinstance(x, str) or not x for x in threads): errors.append("capture:thread-uniqueness")
    if len(set(turns)) != 2 or any(not isinstance(x, str) or not x for x in turns): errors.append("capture:turn-uniqueness")
    if paths != [common.expected_agent_path(aid) for aid in common.RECOVERY_IDS]: errors.append("capture:path-order")
    return sorted(set(errors))


def validate_snapshot(core: dict[str, Any], authorizations: dict[str, dict[str, Any]], envelope: dict[str, Any], results: dict[str, dict[str, Any] | None], receipts: dict[str, dict[str, Any] | None], capture: dict[str, Any], output_files: dict[str, list[str]], prior: dict[str, Any]) -> dict[str, Any]:
    transaction = transaction_errors(core, authorizations, envelope)
    schema = common.load(common.NAMESPACE / "schema/external_research_result_v6.schema.json")
    manifest = common.load(common.NAMESPACE / "manifest.json")
    assignments = {row["assignment_id"]: row for row in manifest["assignments"]}
    core_sha = common.digest(core); envelope_sha = common.digest(envelope)
    capture_rows = {row.get("assignment_id"): row for row in capture.get("leaves", []) if isinstance(row, dict)}
    capture_failures = capture_errors(capture, receipts, prior)
    eligible = []; per_assignment = {}
    for aid in common.RECOVERY_IDS:
        errors = []
        if output_files.get(aid) != ["result.json"]: errors.append("%s:output:exactly-result-json" % aid)
        result = results.get(aid); receipt = receipts.get(aid); auth = authorizations.get(aid, {})
        if result is None: errors.append("%s:result-missing" % aid)
        else:
            errors += common.result_errors(result, assignments[aid], schema, core_sha, common.digest(auth), core["activation_transaction_id"])
        if receipt is None: errors.append("%s:receipt-missing" % aid)
        elif result is not None:
            errors += common.receipt_errors(receipt, assignments[aid], common.digest(result), core, core_sha, auth, common.digest(auth), envelope_sha)
        if capture_rows.get(aid) is None: errors.append("%s:capture-missing" % aid)
        errors += [x for x in transaction if x.startswith(("core:", "envelope:", "transaction:", "authorization:%s:" % aid))]
        errors += [x for x in capture_failures if x.startswith(("capture:%s:" % aid, "capture:thread", "capture:turn", "capture:path-order", "capture:rows"))]
        per_assignment[aid] = sorted(set(errors))
        if not per_assignment[aid]: eligible.append(aid)
    full = eligible == common.RECOVERY_IDS and not transaction and not capture_failures
    cumulative = common.FLOOR_IDS + eligible
    return {
        "schema_version": "external-research-recovery-postrun-v6", "checker": "external_research_recovery_attempt_0006_postrun",
        "audit_id": common.AUDIT_ID, "attempt_id": common.ATTEMPT_ID, "status": "pass" if full else "fail_closed",
        "eligible_attempt_0006_ids": eligible, "rejected_attempt_0006_ids": [aid for aid in common.RECOVERY_IDS if aid not in eligible],
        "per_assignment_errors": per_assignment, "global_errors": sorted(set(transaction + capture_failures)),
        "preserved_floor_ids": common.FLOOR_IDS, "preserved_floor_digest": common.FLOOR_DIGEST, "preserved_floor_count": 6,
        "cumulative_eligible_ids": cumulative, "cumulative_eligible_count": len(cumulative), "cumulative_eligible_digest": common.digest(cumulative),
        "cumulative_research_credit": 8 if full else 0, "coverage_credit": 0, "promotion_credit": 0, "spec_credit": 0, "merge_credit": 0,
        "attempt_level_veto": not full, "unrelated_six_floor_suppressed": False,
    }


def main() -> None:
    required = [common.core_path(), common.envelope_path()] + [common.authorization_path(aid) for aid in common.RECOVERY_IDS]
    if any(not path.is_file() for path in required):
        print(json.dumps({"status": "fail_closed", "errors": ["activation-transaction:missing"]}, indent=2)); raise SystemExit(1)
    core = common.load(common.core_path()); envelope = common.load(common.envelope_path())
    authorizations = {aid: common.load(common.authorization_path(aid)) for aid in common.RECOVERY_IDS}
    results = {}; receipts = {}; files = {}
    for aid in common.RECOVERY_IDS:
        files[aid] = sorted(path.name for path in common.output_dir(aid).iterdir() if path.is_file()) if common.output_dir(aid).is_dir() else []
        results[aid] = common.load(common.result_path(aid)) if common.result_path(aid).is_file() else None
        receipts[aid] = common.load(common.receipt_path(aid)) if common.receipt_path(aid).is_file() else None
    capture = common.load(common.capture_path()) if common.capture_path().is_file() else {"leaves": []}
    report = validate_snapshot(core, authorizations, envelope, results, receipts, capture, files, common.prior_identity_inventory())
    print(json.dumps(report, indent=2, sort_keys=True)); raise SystemExit(0 if report["status"] == "pass" else 1)


if __name__ == "__main__":
    main()
