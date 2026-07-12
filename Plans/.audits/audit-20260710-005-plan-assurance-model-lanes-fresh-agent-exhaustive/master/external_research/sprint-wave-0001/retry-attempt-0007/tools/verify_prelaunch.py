#!/usr/bin/env python3
from __future__ import annotations

import hashlib
import json
from pathlib import Path

import common


def main() -> None:
    errors = []
    required = [
        "authority.json", "architecture.json", "lineage.json", "manifest.json", "launch_seal.json",
        "leaf_prompt.json", "leaf_initial_task_contract.json", "receipt_contract_v7.json",
        "native_capture_contract_v7.json", "activation_transaction.template.json",
        "schema/external_research_result_v7.schema.json", "schema/external_research_dispatch_receipt_v7.schema.json",
        "schema/external_research_native_capture_v7.schema.json",
    ]
    for rel in required:
        if not (common.NAMESPACE / rel).is_file():
            errors.append("missing:" + rel)
    if errors:
        print(json.dumps({"status": "fail", "errors": errors}, indent=2)); raise SystemExit(1)
    authority = common.load(common.NAMESPACE / "authority.json")
    manifest = common.load(common.NAMESPACE / "manifest.json")
    if authority.get("status") != "BLOCKED_AWAITING_FRESH_INDEPENDENT_LUNA_PRELAUNCH_V7": errors.append("authority-status")
    if manifest.get("assignment_ids") != common.RECOVERY_IDS or manifest.get("assignment_count") != 2: errors.append("manifest-scope")
    if manifest.get("model") != common.MODEL or manifest.get("reasoning_effort") != common.REASONING_EFFORT: errors.append("manifest-lane")
    if manifest.get("concurrency_policy_v10_lineage_sha256") != common.V10_SHA256: errors.append("manifest-v10-lineage")
    if manifest.get("active_prospective_concurrency_policy_v11_sha256") != common.V11_SHA256: errors.append("manifest-v11")
    if manifest.get("model_lane_routing_policy_v2_sha256") != common.ROUTING_V2_SHA256: errors.append("manifest-routing")
    if common.sha(common.ROOT / "master/coordination/CONCURRENCY_POLICY_V10.json") != common.V10_SHA256: errors.append("v10-live-hash")
    if common.sha(common.ROOT / "master/coordination/CONCURRENCY_POLICY_V11.json") != common.V11_SHA256: errors.append("v11-live-hash")
    if common.sha(common.ROOT / "master/coordination/MODEL_LANE_ROUTING_POLICY_V2.json") != common.ROUTING_V2_SHA256: errors.append("routing-live-hash")
    prior_capture = common.ROOT / "master/external_research/sprint-wave-0001/retry-attempt-0006/runtime/native_capture.json"
    prior_primary = common.ROOT / "master/external_research/sprint-wave-0001/retry-attempt-0006/validation/primary-cumulative-postrun.json"
    if common.sha(prior_capture) != common.ATTEMPT6_CAPTURE_SHA256: errors.append("attempt6-capture-drift")
    if common.sha(prior_primary) != common.ATTEMPT6_PRIMARY_SHA256: errors.append("attempt6-primary-drift")
    if manifest.get("preserved_cumulative_floor_digest") != common.FLOOR_DIGEST: errors.append("floor-digest")
    if common.zero_state_errors(): errors.extend(common.zero_state_errors())
    prior = common.prior_identity_inventory()
    for aid in common.RECOVERY_IDS:
        assignment = next((row for row in manifest["assignments"] if row.get("assignment_id") == aid), None)
        if assignment is None:
            errors.append(aid + ":assignment-missing"); continue
        if assignment.get("canonical_agent_path") != common.expected_agent_path(aid): errors.append(aid + ":path")
        if assignment["canonical_agent_path"] in prior["paths"]: errors.append(aid + ":path-reuse")
        if common.sha(common.packet_path(aid)) != assignment.get("packet_sha256"): errors.append(aid + ":packet-hash")
        if common.sha(common.intent_path(aid)) != assignment.get("dispatch_intent_sha256"): errors.append(aid + ":intent-hash")
        packet = common.load(common.packet_path(aid)); old = common.load(common.ROOT / f"master/external_research/sprint-wave-0001/retry-attempt-0006/packets/{aid}.json")
        for key in ["topic", "research_questions", "source_policies", "owner_domains", "feature_refs"]:
            if packet.get(key) != old.get(key): errors.append(aid + ":source-binding:" + key)
    engine = common.schema_engine()
    if engine != {"library": "jsonschema", "version": "4.26.0", "validator": "Draft202012Validator", "draft": "2020-12"}: errors.append("schema-engine")
    for schema_name in ["external_research_result_v7.schema.json", "external_research_dispatch_receipt_v7.schema.json", "external_research_native_capture_v7.schema.json"]:
        schema = common.load(common.NAMESPACE / "schema" / schema_name)
        try:
            common.Draft202012Validator.check_schema(schema)
        except Exception as exc:
            errors.append("schema-invalid:" + schema_name + ":" + type(exc).__name__)
    # Reject any ambiguous digest field in the receipt contract or schema.
    receipt_contract = common.load(common.NAMESPACE / "receipt_contract_v7.json")
    fields = receipt_contract.get("required_fields", [])
    if "result_sha256" in fields or "output_sha256" in fields: errors.append("ambiguous-digest-field")
    if set(receipt_contract.get("digest_contract", {})) != {"result_file_sha256", "result_canonical_sha256", "output_tree_sha256", "ambiguous_result_sha256_forbidden", "ambiguous_output_sha256_forbidden"}: errors.append("digest-contract")
    report = {
        "schema_version": "external-research-recovery-prelaunch-verification-v7",
        "status": "pass_structural_blocked" if not errors else "fail",
        "structural_ready": not errors,
        "launch_authorized": False,
        "blocker": "fresh independent Luna prelaunch v7 required",
        "errors": sorted(set(errors)),
        "assignment_ids": common.RECOVERY_IDS,
        "counts": {"assignments": 2, "packets": 2, "intents": 2, "empty_outputs": 2 if not common.zero_state_errors() else 0, "activation_transaction_files": 0, "results": 0, "receipts": 0, "native_capture_rows": 0},
        "schema_engine": engine,
        "canonicalization_algorithm_id": common.CANONICALIZATION_ALGORITHM_ID,
        "authority_sha256": common.sha(common.NAMESPACE / "authority.json"),
        "manifest_sha256": common.sha(common.NAMESPACE / "manifest.json"),
        "receipt_contract_sha256": common.sha(common.NAMESPACE / "receipt_contract_v7.json"),
        "capture_contract_sha256": common.sha(common.NAMESPACE / "native_capture_contract_v7.json"),
        "result_schema_sha256": common.sha(common.NAMESPACE / "schema/external_research_result_v7.schema.json"),
        "receipt_schema_sha256": common.sha(common.NAMESPACE / "schema/external_research_dispatch_receipt_v7.schema.json"),
        "capture_schema_sha256": common.sha(common.NAMESPACE / "schema/external_research_native_capture_v7.schema.json"),
        "coverage_credit": 0, "research_credit": 0, "promotion_credit": 0, "spec_credit": 0, "merge_credit": 0,
    }
    print(json.dumps(report, indent=2, sort_keys=True))
    raise SystemExit(0 if not errors else 1)


if __name__ == "__main__":
    main()
