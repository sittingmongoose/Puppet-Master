#!/usr/bin/env python3
"""Verify the immutable zero-launch attempt-0004 candidate."""

from __future__ import annotations

import json
import subprocess
from pathlib import Path

import common
import generate_activation
import validate_postrun


def main() -> None:
    errors: list[str] = []
    primary_path = common.ROOT / common.PRIMARY_POSTRUN_REF
    policy_path = common.ROOT / common.V6_REF
    prior_policy_path = common.ROOT / common.V5_REF
    if not primary_path.is_file() or common.sha(primary_path) != common.PRIMARY_POSTRUN_SHA256: errors.append("primary_postrun:hash")
    if not policy_path.is_file() or common.sha(policy_path) != common.V6_SHA256: errors.append("concurrency_policy_v6:hash")
    if not prior_policy_path.is_file() or common.sha(prior_policy_path) != common.V5_SHA256: errors.append("concurrency_policy_v5_lineage:hash")
    if primary_path.is_file():
        primary = common.load_obj(primary_path)
        if primary.get("attempt_0003_rejected_ids") != common.RECOVERY_IDS: errors.append("primary_postrun:rejected_set")
        if primary.get("cumulative_eligible_ids") != common.FLOOR_IDS or primary.get("cumulative_eligible_digest") != common.FLOOR_DIGEST:
            errors.append("primary_postrun:cumulative_floor")
        for key in ("cumulative_research_credit", "coverage_credit", "promotion_credit", "spec_credit", "merge_credit"):
            if primary.get(key) != 0: errors.append(f"primary_postrun:{key}")

    required = [
        "authority.json", "architecture.json", "lineage.json", "launch_seal.json", "manifest.json", "leaf_prompt.json",
        "receipt_contract_v4.json", "activation.template.json", "schema/external_research_result_v4.schema.json",
        "validation/VALIDATOR_AUTHORITY_V4.json", "validation/local-prelaunch-candidate.json",
    ]
    for ref in required:
        if not (common.NAMESPACE / ref).is_file(): errors.append(f"required:missing:{ref}")
    if errors and any(item.startswith("required:missing") for item in errors):
        print(json.dumps({"status": "fail", "errors": sorted(set(errors))}, indent=2)); raise SystemExit(1)

    manifest = common.load_obj(common.NAMESPACE / "manifest.json")
    authority = common.load_obj(common.NAMESPACE / "authority.json")
    seal = common.load_obj(common.NAMESPACE / "launch_seal.json")
    template = common.load_obj(common.NAMESPACE / "activation.template.json")
    local = common.load_obj(common.NAMESPACE / "validation/local-prelaunch-candidate.json")
    validator_authority = common.load_obj(common.NAMESPACE / "validation/VALIDATOR_AUTHORITY_V4.json")
    schema = common.load_obj(common.NAMESPACE / "schema/external_research_result_v4.schema.json")

    if manifest.get("status") != common.BLOCKED_STATUS or manifest.get("assignment_count") != 2 or manifest.get("assignment_ids") != common.RECOVERY_IDS:
        errors.append("manifest:state_or_set")
    if manifest.get("preserved_cumulative_floor_ids") != common.FLOOR_IDS or manifest.get("preserved_cumulative_floor_digest") != common.FLOOR_DIGEST:
        errors.append("manifest:floor")
    if manifest.get("model") != common.MODEL or manifest.get("reasoning_effort") != common.REASONING_EFFORT or manifest.get("active_semantic_cap") != 2:
        errors.append("manifest:lane")
    if manifest.get("concurrency_policy_v6_sha256") != common.V6_SHA256 or manifest.get("prior_concurrency_policy_v5_sha256") != common.V5_SHA256:
        errors.append("manifest:pacing_policy")

    packet_hashes: dict[str, str] = {}; intent_hashes: dict[str, str] = {}
    paths: list[str] = []; output_files: dict[str, list[str]] = {}; receipt_ids: list[str] = []; result_ids: list[str] = []
    assignments = manifest.get("assignments", [])
    source_manifest = common.load_obj(common.ATTEMPT3 / "manifest.json")
    source_rows = {row["assignment_id"]: row for row in source_manifest.get("assignments", [])}
    for sequence, aid in enumerate(common.RECOVERY_IDS, 1):
        if sequence > len(assignments): errors.append(f"{aid}:manifest_row_missing"); continue
        row = assignments[sequence - 1]; agent_path = common.expected_agent_path(aid); paths.append(agent_path)
        if row.get("assignment_id") != aid or row.get("recovery_sequence") != sequence or row.get("canonical_agent_path") != agent_path:
            errors.append(f"{aid}:manifest_identity")
        if any(row.get(key) is not None for key in ("task_thread_id", "native_child_thread_id", "native_child_turn_id")):
            errors.append(f"{aid}:premature_native_identity")
        packet_path = common.packet_path(aid); intent_path = common.intent_path(aid)
        if not packet_path.is_file() or not intent_path.is_file(): errors.append(f"{aid}:packet_or_intent_missing"); continue
        packet = common.load_obj(packet_path); intent = common.load_obj(intent_path)
        packet_hashes[aid] = common.sha(packet_path); intent_hashes[aid] = common.sha(intent_path)
        source_packet = common.ATTEMPT3 / "packets" / f"{aid}.json"; source = source_rows[aid]
        expected_packet = {
            "assignment_id": aid, "attempt_id": common.ATTEMPT_ID, "canonical_agent_path": agent_path,
            "topic": source["topic"], "owner_domains": source["owner_domains"], "feature_refs": source["feature_refs"],
            "research_questions": source["research_questions"], "model": common.MODEL,
            "reasoning_effort": common.REASONING_EFFORT, "fork_turns": "none", "fresh_child": True,
            "controller_thread_id": common.CONTROLLER_THREAD_ID, "activation_granted": False,
            "candidate_status": common.BLOCKED_STATUS,
        }
        for key, value in expected_packet.items():
            if packet.get(key) != value: errors.append(f"{aid}:packet:{key}")
        if packet.get("source_attempt_0003_packet_sha256") != common.sha(source_packet): errors.append(f"{aid}:packet:source_hash")
        obligations = packet.get("observed_output_obligations", {})
        if obligations.get("exact_fresh_research_key") != "fresh_current_public_web_research_redone" or obligations.get("leaf_local_schema_check_before_final_write") is not True or obligations.get("all_cited_urls_registered_exactly_once_before_reference") is not True:
            errors.append(f"{aid}:packet:output_obligations")
        expected_intent = {
            "assignment_id": aid, "attempt_id": common.ATTEMPT_ID, "agent_path": agent_path,
            "task_thread_id": None, "native_child_thread_id": None, "native_child_turn_id": None,
            "packet_sha256": packet_hashes[aid], "model": common.MODEL, "reasoning_effort": common.REASONING_EFFORT,
            "fresh_child": True, "fork_turns": "none", "descendants_forbidden": True,
            "followup_messages_forbidden": True, "retries_forbidden": True,
            "launch_state": common.BLOCKED_STATUS, "activation_granted": False,
        }
        for key, value in expected_intent.items():
            if intent.get(key) != value: errors.append(f"{aid}:intent:{key}")
        if row.get("packet_sha256") != packet_hashes[aid] or row.get("dispatch_intent_sha256") != intent_hashes[aid]:
            errors.append(f"{aid}:manifest_hash")
        output = common.output_dir(aid)
        output_files[aid] = sorted(path.name for path in output.iterdir() if path.is_file()) if output.is_dir() else ["<missing-directory>"]
        receipt = intent_path.with_name("dispatch_receipt.json")
        if receipt.exists(): receipt_ids.append(aid)
        if (output / "result.json").exists(): result_ids.append(aid)
    if len(paths) != len(set(paths)) or validate_postrun.prior_identity_set().intersection(paths): errors.append("identity:fresh_path_reuse")

    capture_path = common.NAMESPACE / "runtime/native_capture.json"
    capture_rows = 0
    if capture_path.exists():
        try: capture_rows = len(common.load_obj(capture_path).get("leaves", [])) or 1
        except Exception: capture_rows = 1
    errors.extend(common.zero_inventory_errors(output_files, receipt_ids, result_ids, capture_rows,
                                                (common.NAMESPACE / "activation.json").exists()))

    if schema.get("properties", {}).get("attempt_id", {}).get("const") != common.ATTEMPT_ID: errors.append("schema:attempt")
    if schema.get("properties", {}).get("assignment_id", {}).get("pattern") != "^ER-000[38]$": errors.append("schema:assignment")
    if "task_thread_id" in schema.get("properties", {}): errors.append("schema:forbidden_task_identity")
    attest = schema.get("properties", {}).get("self_attestation", {})
    if "fresh_current_public_web_research_redone" not in attest.get("required", []) or "fresh_current_web_research_redone" in attest.get("properties", {}):
        errors.append("schema:fresh_research_exact_key")
    for key in ("leaf_local_schema_conformance_check_passed_before_final_write", "source_registry_unique_and_complete", "source_registry_completed_before_claim_emission"):
        if key not in attest.get("required", []): errors.append(f"schema:attestation:{key}")

    for obj, label in ((authority, "authority"), (seal, "launch_seal"), (local, "local_report"), (validator_authority, "validator_authority")):
        if obj.get("status") != common.BLOCKED_STATUS or obj.get("activation_granted") is not False:
            errors.append(f"{label}:blocked_state")
        if obj.get("concurrency_policy_v6_sha256") != common.V6_SHA256 or obj.get("prior_concurrency_policy_v5_sha256") != common.V5_SHA256:
            errors.append(f"{label}:pacing_policy")
    for key in ("cumulative_research_credit", "coverage_credit", "promotion_credit", "spec_credit", "merge_credit"):
        if authority.get(key) != 0 or seal.get(key) != 0 or local.get(key) != 0: errors.append(f"credit:{key}")
    expected_hashes = {
        "manifest_sha256": common.NAMESPACE / "manifest.json", "architecture_sha256": common.NAMESPACE / "architecture.json",
        "lineage_sha256": common.NAMESPACE / "lineage.json", "leaf_prompt_sha256": common.NAMESPACE / "leaf_prompt.json",
        "result_schema_v4_sha256": common.NAMESPACE / "schema/external_research_result_v4.schema.json",
        "receipt_contract_v4_sha256": common.NAMESPACE / "receipt_contract_v4.json",
        "common_script_sha256": common.NAMESPACE / "tools/common.py",
        "activation_generator_sha256": common.NAMESPACE / "tools/generate_activation.py",
        "verifier_script_sha256": common.NAMESPACE / "tools/verify_prelaunch.py",
        "postrun_validator_sha256": common.NAMESPACE / "tools/validate_postrun.py",
        "test_script_sha256": common.NAMESPACE / "tools/test_attempt_0004.py",
    }
    for key, path in expected_hashes.items():
        if authority.get(key) != common.sha(path): errors.append(f"authority:{key}")
    if authority.get("packet_hashes") != packet_hashes or authority.get("intent_hashes") != intent_hashes:
        errors.append("authority:assignment_hashes")
    if seal.get("authority_sha256") != common.sha(common.NAMESPACE / "authority.json"): errors.append("launch_seal:authority_hash")

    placeholder_count = json.dumps(template, sort_keys=True).count("UNRESOLVED_REQUIRED_FUTURE_LUNA_POSTRUN")
    if placeholder_count != 1: errors.append("activation_template:placeholder_count")
    if template.get("status") != common.BLOCKED_STATUS or template.get("activation_granted") is not False:
        errors.append("activation_template:state")
    if template.get("concurrency_policy_v6_sha256") != common.V6_SHA256 or template.get("prior_concurrency_policy_v5_sha256") != common.V5_SHA256:
        errors.append("activation_template:pacing_policy")
    for ref, expected in template.get("fixed_hashes", {}).items():
        path = common.ROOT / ref
        if not path.is_file() or common.sha(path) != expected: errors.append(f"activation_template:fixed:{ref}")
    if local.get("authority_sha256") != common.sha(common.NAMESPACE / "authority.json") or local.get("launch_seal_sha256") != common.sha(common.NAMESPACE / "launch_seal.json"):
        errors.append("local_report:hashes")
    if local.get("counts") != {"assignments": 2, "packets": 2, "intents": 2, "empty_outputs": 2, "output_files": 0, "receipts": 0, "results": 0, "native_capture_rows": 0, "activations": 0}:
        errors.append("local_report:counts")
    if validator_authority.get("postrun_validator_sha256") != common.sha(common.NAMESPACE / "tools/validate_postrun.py") or validator_authority.get("test_script_sha256") != common.sha(common.NAMESPACE / "tools/test_attempt_0004.py"):
        errors.append("validator_authority:hashes")

    test = subprocess.run(["python3", "-B", str(common.NAMESPACE / "tools/test_attempt_0004.py")], cwd=common.NAMESPACE / "tools", capture_output=True, text=True)
    try: test_report = json.loads(test.stdout)
    except Exception: test_report = {"status": "fail", "test_count": 0, "tests": {}}
    if test.returncode or test_report.get("status") != "pass" or test_report.get("test_count", 0) < 24 or any(value is not True for value in test_report.get("tests", {}).values()):
        errors.append("tests:fail")

    report = {
        "audit_id": common.AUDIT_ID, "checker": "external_research_recovery_attempt_0004_prelaunch_v4",
        "sprint_id": common.SPRINT_ID, "retry_namespace": common.RETRY_NAMESPACE, "attempt_id": common.ATTEMPT_ID,
        "status": "pass" if not errors else "fail", "candidate_status": common.BLOCKED_STATUS,
        "errors": sorted(set(errors)), "assignment_ids": common.RECOVERY_IDS,
        "preserved_cumulative_floor_ids": common.FLOOR_IDS, "preserved_cumulative_floor_digest": common.FLOOR_DIGEST,
        "path_mapping": {aid: common.expected_agent_path(aid) for aid in common.RECOVERY_IDS},
        "counts": {"assignments": len(assignments), "packets": len(packet_hashes), "intents": len(intent_hashes),
                   "empty_outputs": sum(not names for names in output_files.values()), "output_files": sum(len(names) for names in output_files.values()),
                   "receipts": len(receipt_ids), "results": len(result_ids), "native_capture_rows": capture_rows,
                   "activations": int((common.NAMESPACE / "activation.json").exists())},
        "packet_hashes": packet_hashes, "intent_hashes": intent_hashes,
        "authority_sha256": common.sha(common.NAMESPACE / "authority.json"),
        "launch_seal_sha256": common.sha(common.NAMESPACE / "launch_seal.json"),
        "activation_template_sha256": common.sha(common.NAMESPACE / "activation.template.json"),
        "local_report_sha256": common.sha(common.NAMESPACE / "validation/local-prelaunch-candidate.json"),
        "strict_test_count": test_report.get("test_count", 0), "strict_tests": test_report.get("tests", {}),
        "activation_granted": False, "cumulative_research_credit": 0, "coverage_credit": 0,
        "promotion_credit": 0, "spec_credit": 0, "merge_credit": 0,
    }
    print(json.dumps(report, indent=2, sort_keys=True))
    raise SystemExit(0 if not errors else 1)


if __name__ == "__main__": main()
