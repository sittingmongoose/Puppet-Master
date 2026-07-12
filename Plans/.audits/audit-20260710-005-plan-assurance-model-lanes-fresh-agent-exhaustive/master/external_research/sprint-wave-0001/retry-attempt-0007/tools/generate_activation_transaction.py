#!/usr/bin/env python3
"""Emit the immutable attempt-0007 activation core, authorizations, then envelope."""
from __future__ import annotations

import argparse
import json
from pathlib import Path
from typing import Any

import common


def expected_independent_report() -> dict[str, Any]:
    return {
        "status": "pass",
        "gate_passed": True,
        "audit_id": common.AUDIT_ID,
        "sprint_id": common.SPRINT_ID,
        "retry_namespace": common.RETRY_NAMESPACE,
        "attempt_id": common.ATTEMPT_ID,
        "assignment_ids": common.RECOVERY_IDS,
        "assignment_count": 2,
        "agent_paths": [common.expected_agent_path(aid) for aid in common.RECOVERY_IDS],
        "model": common.MODEL,
        "reasoning_effort": common.REASONING_EFFORT,
        "fork_turns": "none",
        "fresh_direct_leaves": 2,
        "semantic_transaction_cap": 2,
        "concurrency_policy_v10_sha256": common.V10_SHA256,
        "active_prospective_concurrency_policy_v11_sha256": common.V11_SHA256,
        "model_lane_routing_policy_v2_sha256": common.ROUTING_V2_SHA256,
        "preserved_cumulative_floor_ids": common.FLOOR_IDS,
        "preserved_cumulative_floor_digest": common.FLOOR_DIGEST,
        "preserved_cumulative_floor_count": 6,
        "outputs_empty": True,
        "receipts": 0,
        "results": 0,
        "native_capture_rows": 0,
        "activation_transaction_files": 0,
        "coverage_credit": 0,
        "research_credit": 0,
        "promotion_credit": 0,
        "spec_credit": 0,
        "merge_credit": 0,
        "required_positive_receipt_schema_version": common.RECEIPT_SCHEMA_VERSION,
        "canonicalization_algorithm_id": common.CANONICALIZATION_ALGORITHM_ID,
        "sealed_receipt_writer_verified": True,
        "sealed_capture_writer_verified": True,
        "parent_lane_spawn_capture_required": True,
        "errors": [],
    }


def report_errors(report: dict[str, Any], path: Path, expected_sha: str) -> list[str]:
    errors = []
    if not path.is_file():
        return ["independent-report:missing"]
    if common.sha(path) != expected_sha:
        errors.append("independent-report:hash")
    expected = expected_independent_report()
    for key, value in expected.items():
        if report.get(key) != value:
            errors.append("independent-report:" + key)
    if set(report) != set(expected):
        errors.append("independent-report:key-set")
    return sorted(set(errors))


def build_core(report_path: Path, report_sha: str) -> dict[str, Any]:
    authority_path = common.NAMESPACE / "authority.json"
    manifest_path = common.NAMESPACE / "manifest.json"
    transaction_seed = common.canonical_sha({
        "attempt_id": common.ATTEMPT_ID,
        "report_sha256": report_sha,
        "authority_sha256": common.sha(authority_path),
        "manifest_sha256": common.sha(manifest_path),
    })
    return {
        "schema_version": "external-research-activation-core-v7",
        "activation_granted": True,
        "activation_transaction_id": "A005-ER7-" + transaction_seed[:24],
        "audit_id": common.AUDIT_ID,
        "sprint_id": common.SPRINT_ID,
        "retry_namespace": common.RETRY_NAMESPACE,
        "attempt_id": common.ATTEMPT_ID,
        "assignment_ids": common.RECOVERY_IDS,
        "assignment_count": 2,
        "controller_thread_id": common.CONTROLLER_THREAD_ID,
        "model": common.MODEL,
        "reasoning_effort": common.REASONING_EFFORT,
        "fork_turns": "none",
        "fresh_direct_leaves": 2,
        "semantic_transaction_cap": 2,
        "concurrency_policy_v10_sha256": common.V10_SHA256,
        "active_prospective_concurrency_policy_v11_sha256": common.V11_SHA256,
        "model_lane_routing_policy_v2_sha256": common.ROUTING_V2_SHA256,
        "independent_prelaunch_path": str(report_path),
        "independent_prelaunch_sha256": report_sha,
        "authority_path": str(authority_path),
        "authority_sha256": common.sha(authority_path),
        "manifest_path": str(manifest_path),
        "manifest_sha256": common.sha(manifest_path),
        "canonicalization_algorithm_id": common.CANONICALIZATION_ALGORITHM_ID,
        "required_positive_receipt_schema_version": common.RECEIPT_SCHEMA_VERSION,
        "sealed_receipt_writer_path": str(common.NAMESPACE / "tools/write_positive_receipt.py"),
        "sealed_receipt_writer_sha256": common.sha(common.NAMESPACE / "tools/write_positive_receipt.py"),
        "sealed_capture_writer_path": str(common.NAMESPACE / "tools/write_native_capture.py"),
        "sealed_capture_writer_sha256": common.sha(common.NAMESPACE / "tools/write_native_capture.py"),
        "result_required_before_pmr1": True,
        "receipt_after_terminal_only": True,
        "coverage_credit": 0,
        "research_credit": 0,
        "promotion_credit": 0,
        "spec_credit": 0,
        "merge_credit": 0,
    }


def build_authorization(aid: str, assignment: dict[str, Any], core: dict[str, Any], core_sha: str) -> dict[str, Any]:
    seed = common.canonical_sha({"activation_transaction_id": core["activation_transaction_id"], "assignment_id": aid})
    return {
        "schema_version": "external-research-leaf-dispatch-authorization-v7",
        "activation_granted": True,
        "authorization_transaction_id": "A005-ER7-AUTH-" + seed[:20],
        "activation_transaction_id": core["activation_transaction_id"],
        "assignment_id": aid,
        "attempt_id": common.ATTEMPT_ID,
        "agent_path": assignment["canonical_agent_path"],
        "model": common.MODEL,
        "reasoning_effort": common.REASONING_EFFORT,
        "fork_turns": "none",
        "packet_path": assignment["packet_ref"],
        "packet_sha256": assignment["packet_sha256"],
        "dispatch_intent_path": assignment["dispatch_intent_ref"],
        "dispatch_intent_sha256": assignment["dispatch_intent_sha256"],
        "output_directory": assignment["output_directory"],
        "result_path": assignment["output_path"],
        "activation_core_path": str(common.core_path()),
        "activation_core_sha256": core_sha,
        "result_required_before_pmr1": True,
        "prelaunch_intent_is_lineage_only": True,
        "descendants_forbidden": True,
        "followups_forbidden": True,
        "retries_forbidden": True,
    }


def build_envelope(core: dict[str, Any], core_sha: str, auths: dict[str, dict[str, Any]]) -> dict[str, Any]:
    return {
        "schema_version": "external-research-activation-envelope-v7",
        "activation_granted": True,
        "activation_transaction_id": core["activation_transaction_id"],
        "attempt_id": common.ATTEMPT_ID,
        "activation_core_path": str(common.core_path()),
        "activation_core_sha256": core_sha,
        "authorization_files": [
            {
                "assignment_id": aid,
                "path": str(common.authorization_path(aid)),
                "sha256": common.canonical_sha(auths[aid]),
            }
            for aid in common.RECOVERY_IDS
        ],
        "assignment_ids": common.RECOVERY_IDS,
        "assignment_count": 2,
        "model": common.MODEL,
        "reasoning_effort": common.REASONING_EFFORT,
        "concurrency_policy_v10_sha256": common.V10_SHA256,
        "active_prospective_concurrency_policy_v11_sha256": common.V11_SHA256,
        "model_lane_routing_policy_v2_sha256": common.ROUTING_V2_SHA256,
        "canonicalization_algorithm_id": common.CANONICALIZATION_ALGORITHM_ID,
        "coverage_credit": 0,
        "research_credit": 0,
        "promotion_credit": 0,
        "spec_credit": 0,
        "merge_credit": 0,
    }


def core_errors(core: dict[str, Any], report_path: Path, report_sha: str) -> list[str]:
    expected = build_core(report_path, report_sha)
    return sorted("core:" + key for key in set(core) | set(expected) if core.get(key) != expected.get(key))


def authorization_errors(auth: dict[str, Any], aid: str, assignment: dict[str, Any], core: dict[str, Any], core_sha: str) -> list[str]:
    expected = build_authorization(aid, assignment, core, core_sha)
    return sorted(f"authorization:{aid}:{key}" for key in set(auth) | set(expected) if auth.get(key) != expected.get(key))


def envelope_errors(envelope: dict[str, Any], core: dict[str, Any], core_sha: str, auths: dict[str, dict[str, Any]]) -> list[str]:
    expected = build_envelope(core, core_sha, auths)
    return sorted("envelope:" + key for key in set(envelope) | set(expected) if envelope.get(key) != expected.get(key))


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--independent-report", required=True, type=Path)
    parser.add_argument("--sha256", required=True)
    args = parser.parse_args()
    report = common.load(args.independent_report) if args.independent_report.is_file() else {}
    errors = report_errors(report, args.independent_report, args.sha256) + common.zero_state_errors()
    if errors:
        raise SystemExit(json.dumps({"status": "fail_closed", "errors": sorted(set(errors))}, indent=2))
    manifest = common.load(common.NAMESPACE / "manifest.json")
    assignments = {row["assignment_id"]: row for row in manifest["assignments"]}
    core = build_core(args.independent_report, args.sha256)
    core_sha = common.canonical_sha(core)
    auths = {aid: build_authorization(aid, assignments[aid], core, core_sha) for aid in common.RECOVERY_IDS}
    envelope = build_envelope(core, core_sha, auths)
    # Stable, non-circular order: core, each authorization, final envelope.
    common.write_exclusive(common.core_path(), core)
    for aid in common.RECOVERY_IDS:
        common.write_exclusive(common.authorization_path(aid), auths[aid])
    common.write_exclusive(common.envelope_path(), envelope)
    print(json.dumps({"status": "pass", "activation_transaction_id": core["activation_transaction_id"], "core_sha256": core_sha, "envelope_sha256": common.canonical_sha(envelope)}, indent=2, sort_keys=True))


if __name__ == "__main__":
    main()
