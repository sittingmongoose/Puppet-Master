#!/usr/bin/env python3
"""Generate the non-circular attempt-0005 activation transaction after independent prelaunch."""

from __future__ import annotations

import argparse
import json
from pathlib import Path
from typing import Any

import common


def current_payload_hashes() -> dict[str, Any]:
    refs = [
        "authority.json", "launch_seal.json", "manifest.json", "leaf_prompt.json", "receipt_contract_v5.json",
        "native_capture_contract_v5.json", "leaf_initial_task_contract.json", "activation_transaction.template.json",
        "schema/external_research_result_v5.schema.json", "validation/VALIDATOR_AUTHORITY_V5.json",
        "validation/local-prelaunch-candidate.json", "tools/common.py", "tools/generate_activation_transaction.py",
        "tools/verify_prelaunch.py", "tools/validate_postrun.py", "tools/test_attempt_0005.py",
    ]
    hashes: dict[str, Any] = {}
    for ref in refs:
        path = common.NAMESPACE / ref
        hashes[ref] = common.sha(path) if path.is_file() else None
    hashes["packets"] = {aid: common.sha(common.packet_path(aid)) if common.packet_path(aid).is_file() else None for aid in common.RECOVERY_IDS}
    hashes["intents"] = {aid: common.sha(common.intent_path(aid)) if common.intent_path(aid).is_file() else None for aid in common.RECOVERY_IDS}
    return hashes


def expected_independent_bindings() -> dict[str, Any]:
    return {
        "audit_id": common.AUDIT_ID,
        "sprint_id": common.SPRINT_ID,
        "retry_namespace": common.RETRY_NAMESPACE,
        "attempt_id": common.ATTEMPT_ID,
        "status": "pass",
        "gate_passed": True,
        "independent": True,
        "activation_transaction_authorized": True,
        "assignment_count": 2,
        "assignment_ids": common.RECOVERY_IDS,
        "agent_paths": [common.expected_agent_path(aid) for aid in common.RECOVERY_IDS],
        "controller_thread_id": common.CONTROLLER_THREAD_ID,
        "model": common.MODEL,
        "reasoning_effort": common.REASONING_EFFORT,
        "fresh_direct_leaves": 2,
        "fork_turns": "none",
        "descendants_forbidden": True,
        "followups_forbidden": True,
        "retries_forbidden": True,
        "concurrency_policy_v6_sha256": common.V6_SHA256,
        "preserved_cumulative_floor_ids": common.FLOOR_IDS,
        "preserved_cumulative_floor_digest": common.FLOOR_DIGEST,
        "cumulative_floor_count": 6,
        "attempt_0004_failure_lineage_sha256": common.ATTEMPT4_FAILURE_SHA256,
        "attempt_0004_outputs_empty": True,
        "attempt_0004_receipts": 0,
        "attempt_0004_results": 0,
        "attempt_0004_credit": 0,
        "attempt_0005_outputs_empty": True,
        "attempt_0005_receipts": 0,
        "attempt_0005_results": 0,
        "attempt_0005_native_capture_rows": 0,
        "attempt_0005_activation_transaction_files": 0,
        "payload_hashes": current_payload_hashes(),
        "errors": [],
        "coverage_credit": 0,
        "research_credit": 0,
        "promotion_credit": 0,
        "spec_credit": 0,
        "merge_credit": 0,
    }


def independent_report_errors(report: dict[str, Any]) -> list[str]:
    expected = expected_independent_bindings()
    return sorted(f"independent:{key}" for key, value in expected.items() if report.get(key) != value)


def fixed_lineage_errors() -> list[str]:
    errors: list[str] = []
    fixed = {
        common.ROOT / common.V6_REF: common.V6_SHA256,
        common.ROOT / common.ATTEMPT4_FAILURE_REF: common.ATTEMPT4_FAILURE_SHA256,
        common.ATTEMPT4 / "activation.json": common.ATTEMPT4_ACTIVATION_SHA256,
    }
    for path, expected in fixed.items():
        if not path.is_file() or common.sha(path) != expected: errors.append(f"fixed:{path}")
    failure = common.ROOT / common.ATTEMPT4_FAILURE_REF
    if failure.is_file():
        value = common.load_obj(failure)
        if value.get("status") != "TERMINAL_ZERO_CREDIT": errors.append("attempt4:status")
        if [row.get("assignment_id") for row in value.get("assignments", [])] != common.RECOVERY_IDS: errors.append("attempt4:set")
        if any(row.get("result_present") is not False or row.get("receipt_present") is not False for row in value.get("assignments", [])):
            errors.append("attempt4:nonempty")
    for aid in common.RECOVERY_IDS:
        prior_output = common.OUTPUT_ROOT / aid / "attempts/attempt-0004"
        if not prior_output.is_dir() or any(path.is_file() for path in prior_output.iterdir()): errors.append(f"attempt4:{aid}:output")
    return sorted(set(errors))


def zero_state_errors() -> list[str]:
    output_files: dict[str, list[str]] = {}
    receipts: list[str] = []
    results: list[str] = []
    for aid in common.RECOVERY_IDS:
        output = common.output_dir(aid)
        output_files[aid] = sorted(path.name for path in output.iterdir() if path.is_file()) if output.is_dir() else ["<missing-directory>"]
        if common.receipt_path(aid).is_file(): receipts.append(aid)
        if (output / "result.json").is_file(): results.append(aid)
    capture = common.NAMESPACE / "runtime/native_capture.json"
    capture_rows = len(common.load_obj(capture).get("leaves", [])) if capture.is_file() else 0
    return common.zero_inventory_errors(output_files, receipts, results, capture_rows, common.transaction_file_inventory())


def candidate_control_errors() -> list[str]:
    errors: list[str] = []
    for ref in ("authority.json", "launch_seal.json", "validation/local-prelaunch-candidate.json"):
        path = common.NAMESPACE / ref
        if not path.is_file(): errors.append(f"candidate:missing:{ref}"); continue
        value = common.load_obj(path)
        if value.get("status") != common.BLOCKED_STATUS or value.get("activation_granted") is not False or value.get("launch_authorized") is not False:
            errors.append(f"candidate:state:{ref}")
    manifest = common.NAMESPACE / "manifest.json"
    if not manifest.is_file(): errors.append("candidate:missing:manifest.json")
    else:
        value = common.load_obj(manifest)
        if value.get("assignment_ids") != common.RECOVERY_IDS or value.get("assignment_count") != 2: errors.append("candidate:manifest_scope")
        if value.get("model") != common.MODEL or value.get("reasoning_effort") != common.REASONING_EFFORT: errors.append("candidate:manifest_lane")
        if value.get("concurrency_policy_v6_sha256") != common.V6_SHA256: errors.append("candidate:manifest_v6")
    return sorted(set(errors))


def build_core(report_path: Path, report_sha256: str) -> dict[str, Any]:
    transaction_id = "A005-ER5-" + common.digest({"report_sha256": report_sha256, "assignment_ids": common.RECOVERY_IDS, "v6": common.V6_SHA256})[:24]
    return {
        "schema_version": "external-research-activation-core-v5",
        "audit_id": common.AUDIT_ID,
        "sprint_id": common.SPRINT_ID,
        "retry_namespace": common.RETRY_NAMESPACE,
        "attempt_id": common.ATTEMPT_ID,
        "status": common.ACTIVE_STATUS,
        "activation_granted": True,
        "activation_transaction_id": transaction_id,
        "assignment_count": 2,
        "assignment_ids": common.RECOVERY_IDS,
        "agent_paths": [common.expected_agent_path(aid) for aid in common.RECOVERY_IDS],
        "controller_thread_id": common.CONTROLLER_THREAD_ID,
        "model": common.MODEL,
        "reasoning_effort": common.REASONING_EFFORT,
        "fresh_direct_leaves": 2,
        "fork_turns": "none",
        "descendants_forbidden": True,
        "followups_forbidden": True,
        "retries_forbidden": True,
        "result_required_before_pmr1": True,
        "pmr1_without_result_is_terminal_zero_credit_failure": True,
        "concurrency_policy_v6_sha256": common.V6_SHA256,
        "active_semantic_cap": 2,
        "preserved_cumulative_floor_ids": common.FLOOR_IDS,
        "preserved_cumulative_floor_digest": common.FLOOR_DIGEST,
        "cumulative_floor_count": 6,
        "attempt_0004_failure_lineage_sha256": common.ATTEMPT4_FAILURE_SHA256,
        "independent_prelaunch_path": str(report_path.resolve()),
        "independent_prelaunch_sha256": report_sha256,
        "payload_hashes": current_payload_hashes(),
        "coverage_credit": 0,
        "research_credit": 0,
        "promotion_credit": 0,
        "spec_credit": 0,
        "merge_credit": 0,
    }


def core_errors(value: dict[str, Any], report_path: Path, report_sha256: str) -> list[str]:
    expected = build_core(report_path, report_sha256)
    return sorted(f"core:{key}" for key, item in expected.items() if value.get(key) != item)


def build_authorization(assignment: dict[str, Any], core: dict[str, Any], core_sha256: str) -> dict[str, Any]:
    aid = assignment["assignment_id"]
    intent = common.intent_path(aid)
    packet = common.packet_path(aid)
    auth_id = f"A005-ER5-AUTH-{aid[-4:]}-" + common.digest({"core": core_sha256, "assignment_id": aid, "intent": common.sha(intent)})[:16]
    return {
        "schema_version": "external-research-leaf-dispatch-authorization-v5",
        "audit_id": common.AUDIT_ID,
        "sprint_id": common.SPRINT_ID,
        "retry_namespace": common.RETRY_NAMESPACE,
        "assignment_id": aid,
        "attempt_id": common.ATTEMPT_ID,
        "status": "AUTHORIZED_FOR_ONE_FRESH_LUNA_MAX_LEAF",
        "activation_granted": True,
        "activation_transaction_id": core["activation_transaction_id"],
        "authorization_transaction_id": auth_id,
        "activation_core_path": str(common.core_path()),
        "activation_core_sha256": core_sha256,
        "blocked_prelaunch_intent_is_lineage_only": True,
        "authorization_supersedes_blocked_intent_for_activation_only": True,
        "dispatch_intent_path": str(intent),
        "dispatch_intent_sha256": common.sha(intent),
        "dispatch_intent_activation_granted": False,
        "dispatch_intent_launch_state": common.BLOCKED_STATUS,
        "packet_id": assignment["packet_id"],
        "packet_path": str(packet),
        "packet_sha256": common.sha(packet),
        "leaf_prompt_path": str(common.NAMESPACE / "leaf_prompt.json"),
        "leaf_prompt_sha256": common.sha(common.NAMESPACE / "leaf_prompt.json"),
        "schema_path": str(common.NAMESPACE / "schema/external_research_result_v5.schema.json"),
        "schema_sha256": common.sha(common.NAMESPACE / "schema/external_research_result_v5.schema.json"),
        "output_directory": str(common.output_dir(aid)),
        "result_path": str(common.output_dir(aid) / "result.json"),
        "agent_path": assignment["canonical_agent_path"],
        "controller_thread_id": common.CONTROLLER_THREAD_ID,
        "model": common.MODEL,
        "reasoning_effort": common.REASONING_EFFORT,
        "fresh_child": True,
        "fork_turns": "none",
        "descendants_forbidden": True,
        "followups_forbidden": True,
        "retries_forbidden": True,
        "result_required_before_pmr1": True,
        "pmr1_without_result_is_terminal_zero_credit_failure": True,
        "coverage_credit": 0,
        "research_credit": 0,
    }


def authorization_errors(value: dict[str, Any], assignment: dict[str, Any], core: dict[str, Any], core_sha256: str) -> list[str]:
    expected = build_authorization(assignment, core, core_sha256)
    return sorted(f"authorization:{assignment['assignment_id']}:{key}" for key, item in expected.items() if value.get(key) != item)


def build_envelope(core: dict[str, Any], core_sha256: str, authorizations: dict[str, dict[str, Any]]) -> dict[str, Any]:
    rows = []
    for aid in common.RECOVERY_IDS:
        value = authorizations[aid]
        rows.append({
            "assignment_id": aid,
            "path": str(common.authorization_path(aid)),
            "sha256": common.sha_bytes(common.canonical(value)),
            "authorization_transaction_id": value["authorization_transaction_id"],
        })
    return {
        "schema_version": "external-research-activation-envelope-v5",
        "audit_id": common.AUDIT_ID,
        "sprint_id": common.SPRINT_ID,
        "retry_namespace": common.RETRY_NAMESPACE,
        "attempt_id": common.ATTEMPT_ID,
        "status": common.ACTIVE_STATUS,
        "activation_granted": True,
        "activation_transaction_id": core["activation_transaction_id"],
        "activation_core_path": str(common.core_path()),
        "activation_core_sha256": core_sha256,
        "assignment_count": 2,
        "assignment_ids": common.RECOVERY_IDS,
        "authorization_count": 2,
        "authorizations": rows,
        "result_required_before_pmr1": True,
        "concurrency_policy_v6_sha256": common.V6_SHA256,
        "active_semantic_cap": 2,
        "coverage_credit": 0,
        "research_credit": 0,
    }


def envelope_errors(value: dict[str, Any], core: dict[str, Any], core_sha256: str, authorizations: dict[str, dict[str, Any]]) -> list[str]:
    expected = build_envelope(core, core_sha256, authorizations)
    return sorted(f"envelope:{key}" for key, item in expected.items() if value.get(key) != item)


def build_transaction(report: dict[str, Any], report_path: Path, supplied_sha256: str, actual_sha256: str) -> tuple[dict[str, Any], dict[str, dict[str, Any]], dict[str, Any], list[str]]:
    errors: list[str] = []
    if supplied_sha256 != actual_sha256: errors.append("independent:sha256")
    errors.extend(independent_report_errors(report))
    manifest = common.load_obj(common.NAMESPACE / "manifest.json")
    assignments = {row["assignment_id"]: row for row in manifest.get("assignments", [])}
    core = build_core(report_path, supplied_sha256)
    core_sha = common.sha_bytes(common.canonical(core))
    authorizations = {aid: build_authorization(assignments[aid], core, core_sha) for aid in common.RECOVERY_IDS if aid in assignments}
    if set(authorizations) != set(common.RECOVERY_IDS): errors.append("transaction:assignment_set")
    envelope = build_envelope(core, core_sha, authorizations) if not errors or set(authorizations) == set(common.RECOVERY_IDS) else {}
    errors.extend(core_errors(core, report_path, supplied_sha256))
    for aid in authorizations: errors.extend(authorization_errors(authorizations[aid], assignments[aid], core, core_sha))
    if envelope: errors.extend(envelope_errors(envelope, core, core_sha, authorizations))
    auth_ids = [value.get("authorization_transaction_id") for value in authorizations.values()]
    if len(auth_ids) != 2 or len(set(auth_ids)) != 2: errors.append("transaction:authorization_ids_not_unique")
    return core, authorizations, envelope, sorted(set(errors))


def write_exclusive(path: Path, value: dict[str, Any]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("xb") as handle:
        handle.write(common.canonical(value))


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--independent-prelaunch", required=True, type=Path)
    parser.add_argument("--independent-prelaunch-sha", required=True)
    args = parser.parse_args()
    report_path = args.independent_prelaunch.resolve()
    try: report_path.relative_to(common.ROOT.resolve())
    except ValueError: raise SystemExit("independent prelaunch must be under the Audit 005 root")
    if not report_path.is_file(): raise SystemExit("independent prelaunch is missing")
    errors = fixed_lineage_errors() + candidate_control_errors() + zero_state_errors()
    report = common.load_obj(report_path)
    core, authorizations, envelope, transaction_errors = build_transaction(report, report_path, args.independent_prelaunch_sha, common.sha(report_path))
    errors.extend(transaction_errors)
    if errors:
        print(json.dumps({"status": "fail", "errors": sorted(set(errors))}, indent=2, sort_keys=True))
        raise SystemExit(1)
    write_exclusive(common.core_path(), core)
    for aid in common.RECOVERY_IDS:
        write_exclusive(common.authorization_path(aid), authorizations[aid])
    write_exclusive(common.envelope_path(), envelope)
    print(json.dumps({
        "status": "activated", "activation_core_path": str(common.core_path()),
        "activation_core_sha256": common.sha(common.core_path()),
        "authorization_hashes": {aid: common.sha(common.authorization_path(aid)) for aid in common.RECOVERY_IDS},
        "activation_envelope_path": str(common.envelope_path()),
        "activation_envelope_sha256": common.sha(common.envelope_path()),
    }, indent=2, sort_keys=True))


if __name__ == "__main__":
    main()
