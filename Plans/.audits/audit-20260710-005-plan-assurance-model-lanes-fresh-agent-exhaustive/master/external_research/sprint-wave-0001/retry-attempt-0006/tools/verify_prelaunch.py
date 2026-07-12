#!/usr/bin/env python3
"""Fail-closed local prelaunch verifier for attempt-0006."""

from __future__ import annotations

import json
from pathlib import Path

import common


def verify() -> dict[str, object]:
    errors: list[str] = []
    required = [
        "authority.json", "architecture.json", "lineage.json", "manifest.json", "launch_seal.json", "leaf_prompt.json",
        "receipt_contract_v6.json", "native_capture_contract_v6.json", "leaf_initial_task_contract.json",
        "activation_transaction.template.json", "schema/external_research_result_v6.schema.json",
        "validation/VALIDATOR_AUTHORITY_V6.json", "validation/local-prelaunch-candidate.json",
        "tools/common.py", "tools/generate_activation_transaction.py", "tools/verify_prelaunch.py", "tools/validate_postrun.py", "tools/test_attempt_0006.py",
    ]
    for ref in required:
        if not (common.NAMESPACE / ref).is_file(): errors.append("missing:%s" % ref)
    fixed = {
        common.ROOT / "master/coordination/CONCURRENCY_POLICY_V9.json": common.V9_SHA256,
        common.ROOT / "master/external_research/sprint-wave-0001/retry-attempt-0005/runtime/native_capture.json": common.ATTEMPT5_CAPTURE_SHA256,
        common.ROOT / "master/external_research/sprint-wave-0001/retry-attempt-0005/validation/primary-cumulative-postrun.json": common.ATTEMPT5_PRIMARY_SHA256,
    }
    for path, expected in fixed.items():
        if not path.is_file() or common.sha(path) != expected: errors.append("fixed:%s" % path)
    if errors:
        return {"status": "fail", "errors": sorted(set(errors))}
    authority = common.load(common.NAMESPACE / "authority.json"); architecture = common.load(common.NAMESPACE / "architecture.json")
    manifest = common.load(common.NAMESPACE / "manifest.json"); seal = common.load(common.NAMESPACE / "launch_seal.json")
    local = common.load(common.NAMESPACE / "validation/local-prelaunch-candidate.json"); contract = common.load(common.NAMESPACE / "receipt_contract_v6.json")
    for name, value in (("authority", authority), ("architecture", architecture), ("manifest", manifest), ("seal", seal), ("local", local)):
        if value.get("status") != common.BLOCKED_STATUS: errors.append("status:%s" % name)
        if value.get("activation_granted") is True: errors.append("activation:%s" % name)
    if authority.get("assignment_ids") != common.RECOVERY_IDS or authority.get("assignment_count") != 2: errors.append("authority:scope")
    if authority.get("model") != common.MODEL or authority.get("reasoning_effort") != common.REASONING_EFFORT: errors.append("authority:model-effort")
    if authority.get("concurrency_policy_v9_sha256") != common.V9_SHA256 or authority.get("semantic_transaction_cap") != 2: errors.append("authority:v9-cap")
    if authority.get("preserved_cumulative_floor_digest") != common.FLOOR_DIGEST: errors.append("authority:floor")
    if contract.get("schema_version") != common.CONTRACT_SCHEMA_VERSION: errors.append("receipt:contract-label")
    if contract.get("required_positive_receipt_schema_version") != common.POSITIVE_RECEIPT_SCHEMA_VERSION: errors.append("receipt:positive-label")
    if contract.get("exact_values", {}).get("schema_version") != common.POSITIVE_RECEIPT_SCHEMA_VERSION: errors.append("receipt:example-label")
    if contract.get("contract_label_must_never_be_copied_to_positive_receipt") is not True: errors.append("receipt:confusion-guard")
    assignments = manifest.get("assignments", [])
    if [row.get("assignment_id") for row in assignments] != common.RECOVERY_IDS: errors.append("manifest:order")
    for row in assignments:
        aid = row.get("assignment_id")
        if aid not in common.RECOVERY_IDS: continue
        if row.get("canonical_agent_path") != common.expected_agent_path(aid): errors.append("manifest:%s:path" % aid)
        if row.get("packet_sha256") != common.sha(common.packet_path(aid)): errors.append("manifest:%s:packet" % aid)
        if row.get("dispatch_intent_sha256") != common.sha(common.intent_path(aid)): errors.append("manifest:%s:intent" % aid)
        if row.get("output_directory") != str(common.output_dir(aid)): errors.append("manifest:%s:output" % aid)
    errors += common.zero_state_errors()
    prior = common.prior_identity_inventory()
    for aid in common.RECOVERY_IDS:
        if common.expected_agent_path(aid) in prior["paths"]: errors.append("identity-reuse:%s" % aid)
    payload_hashes = seal.get("payload_hashes", {})
    for ref, expected in payload_hashes.items():
        if ref == "packets" and isinstance(expected, dict):
            for aid, value in expected.items():
                if not common.packet_path(aid).is_file() or common.sha(common.packet_path(aid)) != value: errors.append("seal-hash:packets:%s" % aid)
        elif ref == "intents" and isinstance(expected, dict):
            for aid, value in expected.items():
                if not common.intent_path(aid).is_file() or common.sha(common.intent_path(aid)) != value: errors.append("seal-hash:intents:%s" % aid)
        else:
            path = common.NAMESPACE / ref
            if not path.is_file() or common.sha(path) != expected: errors.append("seal-hash:%s" % ref)
    counts = {
        "assignments": len(assignments), "packets": sum(common.packet_path(aid).is_file() for aid in common.RECOVERY_IDS),
        "intents": sum(common.intent_path(aid).is_file() for aid in common.RECOVERY_IDS),
        "empty_outputs": sum(common.output_dir(aid).is_dir() and not any(path.is_file() for path in common.output_dir(aid).rglob("*")) for aid in common.RECOVERY_IDS),
        "results": sum(common.result_path(aid).is_file() for aid in common.RECOVERY_IDS), "receipts": sum(common.receipt_path(aid).is_file() for aid in common.RECOVERY_IDS),
        "native_capture_rows": 0 if not common.capture_path().is_file() else len(common.load(common.capture_path()).get("leaves", [])),
        "activation_transaction_files": 0 if not (common.NAMESPACE / "activation-transaction").is_dir() else sum(path.is_file() for path in (common.NAMESPACE / "activation-transaction").rglob("*")),
    }
    if counts != {"assignments": 2, "packets": 2, "intents": 2, "empty_outputs": 2, "results": 0, "receipts": 0, "native_capture_rows": 0, "activation_transaction_files": 0}: errors.append("counts")
    return {
        "schema_version": "external-research-recovery-prelaunch-verification-v6", "checker": "attempt_0006_local_prelaunch_verifier",
        "status": "pass" if not errors else "fail", "errors": sorted(set(errors)), "counts": counts,
        "assignment_ids": common.RECOVERY_IDS, "agent_paths": [common.expected_agent_path(aid) for aid in common.RECOVERY_IDS],
        "required_positive_receipt_schema_version": common.POSITIVE_RECEIPT_SCHEMA_VERSION,
        "preserved_cumulative_floor_digest": common.FLOOR_DIGEST, "concurrency_policy_v9_sha256": common.V9_SHA256,
        "prior_identity_inventory": {"files": prior["files"], "identity_digest": prior["identity_digest"], "path_digest": prior["path_digest"]},
        "coverage_credit": 0, "research_credit": 0, "promotion_credit": 0, "spec_credit": 0, "merge_credit": 0,
    }


def main() -> None:
    report = verify(); print(json.dumps(report, indent=2, sort_keys=True)); raise SystemExit(0 if report["status"] == "pass" else 1)


if __name__ == "__main__": main()
