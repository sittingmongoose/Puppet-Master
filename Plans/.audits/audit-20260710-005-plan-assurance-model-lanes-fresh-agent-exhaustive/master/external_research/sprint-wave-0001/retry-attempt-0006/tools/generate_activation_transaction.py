#!/usr/bin/env python3
"""Future-only non-circular activation transaction generator for attempt-0006."""

from __future__ import annotations

import argparse
import json
import os
from pathlib import Path
from typing import Any

import common


def report_errors(report: dict[str, Any], report_path: Path, report_sha: str) -> list[str]:
    errors = []
    if not report_path.is_file() or common.sha(report_path) != report_sha: errors.append("independent-report:hash")
    expected = {
        "status": "pass", "gate_passed": True, "audit_id": common.AUDIT_ID, "sprint_id": common.SPRINT_ID,
        "retry_namespace": common.RETRY_NAMESPACE, "attempt_id": common.ATTEMPT_ID, "assignment_ids": common.RECOVERY_IDS,
        "assignment_count": 2, "agent_paths": [common.expected_agent_path(aid) for aid in common.RECOVERY_IDS],
        "model": common.MODEL, "reasoning_effort": common.REASONING_EFFORT, "fork_turns": "none",
        "fresh_direct_leaves": 2, "semantic_transaction_cap": 2, "concurrency_policy_v9_sha256": common.V9_SHA256,
        "preserved_cumulative_floor_ids": common.FLOOR_IDS, "preserved_cumulative_floor_digest": common.FLOOR_DIGEST,
        "preserved_cumulative_floor_count": 6, "outputs_empty": True, "receipts": 0, "results": 0,
        "native_capture_rows": 0, "activation_transaction_files": 0, "coverage_credit": 0, "research_credit": 0,
        "promotion_credit": 0, "spec_credit": 0, "merge_credit": 0, "required_positive_receipt_schema_version": common.POSITIVE_RECEIPT_SCHEMA_VERSION,
    }
    for key, value in expected.items():
        if report.get(key) != value: errors.append("independent-report:%s" % key)
    if report.get("errors") != []: errors.append("independent-report:errors")
    return sorted(set(errors))


def fixed_lineage_errors() -> list[str]:
    fixed = {
        common.ROOT / "master/coordination/CONCURRENCY_POLICY_V9.json": common.V9_SHA256,
        common.ROOT / "master/external_research/sprint-wave-0001/retry-attempt-0005/runtime/native_capture.json": common.ATTEMPT5_CAPTURE_SHA256,
        common.ROOT / "master/external_research/sprint-wave-0001/retry-attempt-0005/validation/primary-cumulative-postrun.json": common.ATTEMPT5_PRIMARY_SHA256,
    }
    return sorted("fixed-lineage:%s" % path for path, expected in fixed.items() if not path.is_file() or common.sha(path) != expected)


def build_core(report_path: Path, report_sha: str) -> dict[str, Any]:
    seed = {"attempt": common.ATTEMPT_ID, "report_sha256": report_sha, "assignments": common.RECOVERY_IDS, "v9": common.V9_SHA256}
    transaction_id = "A005-ER6-" + common.digest(seed)[:24]
    return {
        "schema_version": "external-research-activation-core-v6", "audit_id": common.AUDIT_ID, "sprint_id": common.SPRINT_ID,
        "retry_namespace": common.RETRY_NAMESPACE, "attempt_id": common.ATTEMPT_ID, "status": common.ACTIVE_STATUS,
        "activation_granted": True, "activation_transaction_id": transaction_id, "assignment_count": 2,
        "assignment_ids": common.RECOVERY_IDS, "agent_paths": [common.expected_agent_path(aid) for aid in common.RECOVERY_IDS],
        "controller_thread_id": common.CONTROLLER_THREAD_ID, "model": common.MODEL, "reasoning_effort": common.REASONING_EFFORT,
        "fresh_direct_leaves": 2, "fork_turns": "none", "descendants_forbidden": True, "followups_forbidden": True,
        "retries_forbidden": True, "semantic_transaction_cap": 2, "concurrency_policy_v9_sha256": common.V9_SHA256,
        "preserved_cumulative_floor_ids": common.FLOOR_IDS, "preserved_cumulative_floor_digest": common.FLOOR_DIGEST,
        "preserved_cumulative_floor_count": 6, "independent_prelaunch_path": str(report_path),
        "independent_prelaunch_sha256": report_sha, "required_positive_receipt_schema_version": common.POSITIVE_RECEIPT_SCHEMA_VERSION,
        "contract_document_schema_version": common.CONTRACT_SCHEMA_VERSION, "stale_prelaunch_intents_are_lineage_only": True,
        "result_required_before_pmr1": True, "receipt_after_terminal_only": True,
        "coverage_credit": 0, "research_credit": 0, "promotion_credit": 0, "spec_credit": 0, "merge_credit": 0,
    }


def core_errors(core: dict[str, Any], report_path: Path, report_sha: str) -> list[str]:
    expected = build_core(report_path, report_sha)
    return sorted("core:%s" % key for key, value in expected.items() if core.get(key) != value) + (["core:key-set"] if set(core) != set(expected) else [])


def build_authorization(aid: str, assignment: dict[str, Any], core: dict[str, Any], core_sha: str) -> dict[str, Any]:
    authorization_id = "A005-ER6-AUTH-%s-%s" % (aid[-4:], common.digest({"aid": aid, "core": core_sha})[:16])
    return {
        "schema_version": "external-research-leaf-dispatch-authorization-v6", "audit_id": common.AUDIT_ID,
        "sprint_id": common.SPRINT_ID, "retry_namespace": common.RETRY_NAMESPACE, "assignment_id": aid,
        "attempt_id": common.ATTEMPT_ID, "status": "AUTHORIZED", "activation_granted": True,
        "activation_transaction_id": core["activation_transaction_id"], "authorization_transaction_id": authorization_id,
        "activation_core_path": str(common.core_path()), "activation_core_sha256": core_sha,
        "agent_path": assignment["canonical_agent_path"], "controller_thread_id": common.CONTROLLER_THREAD_ID,
        "model": common.MODEL, "reasoning_effort": common.REASONING_EFFORT, "packet_id": assignment["packet_id"],
        "packet_path": str(common.packet_path(aid)), "packet_sha256": common.sha(common.packet_path(aid)),
        "dispatch_intent_path": str(common.intent_path(aid)), "dispatch_intent_sha256": common.sha(common.intent_path(aid)),
        "result_schema_path": str(common.NAMESPACE / "schema/external_research_result_v6.schema.json"),
        "result_schema_sha256": common.sha(common.NAMESPACE / "schema/external_research_result_v6.schema.json"),
        "output_directory": str(common.output_dir(aid)), "output_path": str(common.result_path(aid)),
        "required_positive_receipt_schema_version": common.POSITIVE_RECEIPT_SCHEMA_VERSION,
        "prelaunch_intent_is_lineage_only": True, "result_required_before_pmr1": True,
    }


def authorization_errors(value: dict[str, Any], aid: str, assignment: dict[str, Any], core: dict[str, Any], core_sha: str) -> list[str]:
    expected = build_authorization(aid, assignment, core, core_sha)
    return sorted("authorization:%s:%s" % (aid, key) for key, item in expected.items() if value.get(key) != item) + (["authorization:%s:key-set" % aid] if set(value) != set(expected) else [])


def build_envelope(core: dict[str, Any], core_sha: str, authorizations: dict[str, dict[str, Any]]) -> dict[str, Any]:
    return {
        "schema_version": "external-research-activation-envelope-v6", "audit_id": common.AUDIT_ID,
        "sprint_id": common.SPRINT_ID, "retry_namespace": common.RETRY_NAMESPACE, "attempt_id": common.ATTEMPT_ID,
        "status": common.ACTIVE_STATUS, "activation_granted": True, "activation_transaction_id": core["activation_transaction_id"],
        "activation_core_path": str(common.core_path()), "activation_core_sha256": core_sha,
        "authorization_sha256": {aid: common.digest(authorizations[aid]) for aid in common.RECOVERY_IDS},
        "emission_order": ["activation-core.json", "leaf-dispatch-authorizations/ER-0003.json", "leaf-dispatch-authorizations/ER-0008.json", "activation-envelope.json"],
        "required_positive_receipt_schema_version": common.POSITIVE_RECEIPT_SCHEMA_VERSION,
        "coverage_credit": 0, "research_credit": 0, "promotion_credit": 0, "spec_credit": 0, "merge_credit": 0,
    }


def envelope_errors(value: dict[str, Any], core: dict[str, Any], core_sha: str, authorizations: dict[str, dict[str, Any]]) -> list[str]:
    expected = build_envelope(core, core_sha, authorizations)
    return sorted("envelope:%s" % key for key, item in expected.items() if value.get(key) != item) + (["envelope:key-set"] if set(value) != set(expected) else [])


def write_exclusive(path: Path, value: dict[str, Any]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    flags = os.O_WRONLY | os.O_CREAT | os.O_EXCL
    descriptor = os.open(path, flags, 0o444)
    with os.fdopen(descriptor, "wb") as handle:
        handle.write(common.canonical(value)); handle.flush(); os.fsync(handle.fileno())


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--independent-report", type=Path, required=True)
    parser.add_argument("--independent-report-sha256", required=True)
    args = parser.parse_args()
    errors = fixed_lineage_errors() + common.zero_state_errors()
    if not args.independent_report.is_file(): errors.append("independent-report:missing")
    else: errors += report_errors(common.load(args.independent_report), args.independent_report, args.independent_report_sha256)
    if errors:
        raise SystemExit(json.dumps({"status": "fail_closed", "errors": sorted(set(errors))}, indent=2))
    manifest = common.load(common.NAMESPACE / "manifest.json")
    assignments = {row["assignment_id"]: row for row in manifest["assignments"]}
    core = build_core(args.independent_report.resolve(), args.independent_report_sha256)
    core_sha = common.digest(core)
    authorizations = {aid: build_authorization(aid, assignments[aid], core, core_sha) for aid in common.RECOVERY_IDS}
    envelope = build_envelope(core, core_sha, authorizations)
    write_exclusive(common.core_path(), core)
    for aid in common.RECOVERY_IDS: write_exclusive(common.authorization_path(aid), authorizations[aid])
    write_exclusive(common.envelope_path(), envelope)
    print(json.dumps({"status": common.ACTIVE_STATUS, "activation_core_sha256": core_sha, "authorization_sha256": {aid: common.digest(authorizations[aid]) for aid in common.RECOVERY_IDS}, "activation_envelope_sha256": common.digest(envelope)}, indent=2, sort_keys=True))


if __name__ == "__main__":
    main()
