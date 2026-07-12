#!/usr/bin/env python3
"""Verify the immutable zero-launch attempt-0005 preparation."""

from __future__ import annotations

import json
import subprocess

import common
import generate_activation_transaction as activation


def main() -> None:
    errors = activation.fixed_lineage_errors() + activation.zero_state_errors()
    required = [
        "authority.json", "architecture.json", "lineage.json", "manifest.json", "launch_seal.json",
        "leaf_prompt.json", "receipt_contract_v5.json", "native_capture_contract_v5.json",
        "leaf_initial_task_contract.json", "activation_transaction.template.json",
        "schema/external_research_result_v5.schema.json", "validation/VALIDATOR_AUTHORITY_V5.json",
        "validation/local-prelaunch-candidate.json", "tools/common.py", "tools/generate_activation_transaction.py",
        "tools/validate_postrun.py", "tools/test_attempt_0005.py",
    ]
    for ref in required:
        if not (common.NAMESPACE / ref).is_file(): errors.append(f"required:missing:{ref}")
    for aid in common.RECOVERY_IDS:
        for path, label in ((common.packet_path(aid), "packet"), (common.intent_path(aid), "intent")):
            if not path.is_file(): errors.append(f"{aid}:{label}:missing")
    if any(item.startswith("required:missing") or item.endswith(":missing") for item in errors):
        print(json.dumps({"status": "fail", "errors": sorted(set(errors))}, indent=2)); raise SystemExit(1)

    authority = common.load_obj(common.NAMESPACE / "authority.json")
    manifest = common.load_obj(common.NAMESPACE / "manifest.json")
    seal = common.load_obj(common.NAMESPACE / "launch_seal.json")
    local = common.load_obj(common.NAMESPACE / "validation/local-prelaunch-candidate.json")
    validator_authority = common.load_obj(common.NAMESPACE / "validation/VALIDATOR_AUTHORITY_V5.json")
    prompt = common.load_obj(common.NAMESPACE / "leaf_prompt.json")
    receipt_contract = common.load_obj(common.NAMESPACE / "receipt_contract_v5.json")
    capture_contract = common.load_obj(common.NAMESPACE / "native_capture_contract_v5.json")
    template = common.load_obj(common.NAMESPACE / "activation_transaction.template.json")

    for ref, value in (("authority", authority), ("manifest", manifest), ("launch_seal", seal), ("local", local),
                       ("leaf_prompt", prompt), ("receipt_contract", receipt_contract), ("capture_contract", capture_contract),
                       ("activation_template", template)):
        if value.get("status") != common.BLOCKED_STATUS: errors.append(f"{ref}:status")
        if ref != "capture_contract" and value.get("activation_granted") is not False: errors.append(f"{ref}:activation_state")
    for ref, value in (("authority", authority), ("launch_seal", seal), ("local", local)):
        if value.get("launch_authorized") is not False: errors.append(f"{ref}:launch_state")

    if manifest.get("assignment_count") != 2 or manifest.get("assignment_ids") != common.RECOVERY_IDS: errors.append("manifest:scope")
    if manifest.get("preserved_cumulative_floor_ids") != common.FLOOR_IDS or manifest.get("preserved_cumulative_floor_digest") != common.FLOOR_DIGEST: errors.append("manifest:floor")
    if manifest.get("model") != common.MODEL or manifest.get("reasoning_effort") != common.REASONING_EFFORT or manifest.get("active_semantic_cap") != 2: errors.append("manifest:lane")
    if manifest.get("concurrency_policy_v6_sha256") != common.V6_SHA256: errors.append("manifest:v6")
    if manifest.get("attempt_0004_failure_lineage_sha256") != common.ATTEMPT4_FAILURE_SHA256: errors.append("manifest:attempt4")
    if manifest.get("result_required_before_pmr1") is not True or manifest.get("pmr1_without_result_is_terminal_zero_credit_failure") is not True: errors.append("manifest:result_before_pmr1")
    assignments = manifest.get("assignments", [])
    if len(assignments) != 2: errors.append("manifest:rows")
    packet_hashes: dict[str, str] = {}; intent_hashes: dict[str, str] = {}; paths: list[str] = []
    for index, aid in enumerate(common.RECOVERY_IDS):
        if index >= len(assignments): continue
        row = assignments[index]; packet = common.load_obj(common.packet_path(aid)); intent = common.load_obj(common.intent_path(aid))
        packet_hashes[aid] = common.sha(common.packet_path(aid)); intent_hashes[aid] = common.sha(common.intent_path(aid)); paths.append(row.get("canonical_agent_path"))
        if row.get("assignment_id") != aid or row.get("canonical_agent_path") != common.expected_agent_path(aid): errors.append(f"{aid}:manifest_identity")
        if any(row.get(key) is not None for key in ("task_thread_id", "native_child_thread_id", "native_child_turn_id")): errors.append(f"{aid}:premature_identity")
        if row.get("packet_sha256") != packet_hashes[aid] or row.get("dispatch_intent_sha256") != intent_hashes[aid]: errors.append(f"{aid}:manifest_hash")
        expected_packet = {"assignment_id": aid, "attempt_id": common.ATTEMPT_ID, "canonical_agent_path": common.expected_agent_path(aid),
                           "model": common.MODEL, "reasoning_effort": common.REASONING_EFFORT, "activation_granted": False,
                           "candidate_status": common.BLOCKED_STATUS, "attempt_0004_failure_lineage_sha256": common.ATTEMPT4_FAILURE_SHA256,
                           "prelaunch_intent_is_lineage_only": True}
        for key, value in expected_packet.items():
            if packet.get(key) != value: errors.append(f"{aid}:packet:{key}")
        obligations = packet.get("observed_output_obligations", {})
        if obligations.get("exact_fresh_research_key") != "fresh_current_public_web_research_redone" or obligations.get("leaf_local_schema_check_before_final_write") is not True or obligations.get("source_registry_complete_before_references") is not True or obligations.get("result_required_before_pmr1") is not True:
            errors.append(f"{aid}:packet:obligations")
        expected_intent = {"assignment_id": aid, "attempt_id": common.ATTEMPT_ID, "agent_path": common.expected_agent_path(aid),
                           "model": common.MODEL, "reasoning_effort": common.REASONING_EFFORT, "activation_granted": False,
                           "launch_state": common.BLOCKED_STATUS, "prelaunch_intent_is_lineage_and_binding_only": True,
                           "later_valid_authorization_can_supersede_blocked_prelaunch_state": True,
                           "intent_alone_cannot_authorize_work": True, "result_required_before_pmr1": True,
                           "pmr1_without_result_is_terminal_zero_credit_failure": True,
                           "activation_core_path": str(common.core_path()), "leaf_dispatch_authorization_path": str(common.authorization_path(aid)),
                           "output_directory": str(common.output_dir(aid)), "packet_sha256": packet_hashes[aid]}
        for key, value in expected_intent.items():
            if intent.get(key) != value: errors.append(f"{aid}:intent:{key}")
        for key in ("task_thread_id", "native_child_thread_id", "native_child_turn_id"):
            if intent.get(key) is not None: errors.append(f"{aid}:intent:{key}")
    if paths != [common.expected_agent_path(aid) for aid in common.RECOVERY_IDS] or len(set(paths)) != 2: errors.append("manifest:path_set")
    prior_paths = [row.get("agent_path") for row in common.load_obj(common.ROOT / common.ATTEMPT4_FAILURE_REF).get("assignments", [])]
    if set(paths).intersection(prior_paths): errors.append("identity:path_reuse")

    payload_hashes = authority.get("payload_hashes", {})
    for ref, expected in payload_hashes.items():
        if ref in {"packets", "intents"}: continue
        path = common.NAMESPACE / ref
        if not path.is_file() or common.sha(path) != expected: errors.append(f"authority:payload:{ref}")
    if payload_hashes.get("packets") != packet_hashes or payload_hashes.get("intents") != intent_hashes: errors.append("authority:packet_or_intent_hashes")
    expected_authority = {"assignment_ids": common.RECOVERY_IDS, "agent_paths": paths, "model": common.MODEL,
                          "reasoning_effort": common.REASONING_EFFORT, "concurrency_policy_v6_sha256": common.V6_SHA256,
                          "attempt_0004_failure_lineage_sha256": common.ATTEMPT4_FAILURE_SHA256,
                          "preserved_cumulative_floor_ids": common.FLOOR_IDS, "preserved_cumulative_floor_digest": common.FLOOR_DIGEST,
                          "result_required_before_pmr1": True}
    for key, value in expected_authority.items():
        if authority.get(key) != value: errors.append(f"authority:{key}")
    if seal.get("authority_sha256") != common.sha(common.NAMESPACE / "authority.json") or seal.get("activation_transaction_template_sha256") != common.sha(common.NAMESPACE / "activation_transaction.template.json"): errors.append("launch_seal:hashes")
    if local.get("authority_sha256") != common.sha(common.NAMESPACE / "authority.json") or local.get("launch_seal_sha256") != common.sha(common.NAMESPACE / "launch_seal.json"): errors.append("local:hashes")
    if local.get("counts") != {"assignments": 2, "packets": 2, "intents": 2, "empty_outputs": 2, "output_files": 0, "receipts": 0, "results": 0, "native_capture_rows": 0, "activation_transaction_files": 0}: errors.append("local:counts")
    if validator_authority.get("validator_sha256") != common.sha(common.NAMESPACE / "tools/validate_postrun.py") or validator_authority.get("result_schema_sha256") != common.sha(common.NAMESPACE / "schema/external_research_result_v5.schema.json") or validator_authority.get("receipt_contract_sha256") != common.sha(common.NAMESPACE / "receipt_contract_v5.json") or validator_authority.get("native_capture_contract_sha256") != common.sha(common.NAMESPACE / "native_capture_contract_v5.json"): errors.append("validator_authority:hashes")
    if validator_authority.get("attempt_0004_failure_lineage_sha256") != common.ATTEMPT4_FAILURE_SHA256 or validator_authority.get("result_required_before_pmr1") is not True: errors.append("validator_authority:lineage_or_terminal")
    if prompt.get("result_required_before_pmr1") is not True or "authorization" not in prompt.get("prompt", "") or "activation core" not in prompt.get("prompt", "") or "cannot veto" not in prompt.get("prompt", "") or "PMR1 without result.json" not in prompt.get("prompt", ""): errors.append("leaf_prompt:activation_visibility_or_terminal")
    if template.get("no_circular_hash_dependency") is not True or template.get("live_transaction_files_present") != 0: errors.append("activation_template:contract")

    test = subprocess.run(["python3", "-B", str(common.NAMESPACE / "tools/test_attempt_0005.py")], cwd=common.NAMESPACE / "tools", capture_output=True, text=True)
    try: test_report = json.loads(test.stdout)
    except Exception: test_report = {"status": "fail", "test_count": 0, "tests": {}}
    if test.returncode or test_report.get("status") != "pass" or test_report.get("test_count", 0) < 60 or any(value is not True for value in test_report.get("tests", {}).values()): errors.append("tests:fail")

    report = {
        "checker": "external_research_recovery_attempt_0005_prelaunch_v5", "audit_id": common.AUDIT_ID,
        "status": "pass" if not errors else "fail", "candidate_status": common.BLOCKED_STATUS,
        "errors": sorted(set(errors)), "assignment_ids": common.RECOVERY_IDS, "path_mapping": dict(zip(common.RECOVERY_IDS, paths)),
        "counts": local.get("counts"), "packet_hashes": packet_hashes, "intent_hashes": intent_hashes,
        "attempt_0004_failure_lineage_sha256": common.ATTEMPT4_FAILURE_SHA256,
        "preserved_cumulative_floor_ids": common.FLOOR_IDS, "preserved_cumulative_floor_digest": common.FLOOR_DIGEST,
        "strict_test_count": test_report.get("test_count", 0), "strict_tests": test_report.get("tests", {}),
        "activation_transaction_files": common.transaction_file_inventory(), "activation_granted": False,
        "launch_authorized": False, "coverage_credit": 0, "cumulative_research_credit": 0,
    }
    print(json.dumps(report, indent=2, sort_keys=True))
    raise SystemExit(0 if report["status"] == "pass" else 1)


if __name__ == "__main__":
    main()
