#!/usr/bin/env python3
"""Fail-closed prelaunch verifier for external-research recovery attempt-0003."""

from __future__ import annotations

import json
import subprocess
from pathlib import Path

import validate_external_research_retry_attempt_0003 as postrun
from prepare_external_research_retry_attempt_0003 import (
    ATTEMPT, ATTEMPT2, AUDIT_ID, CONTROLLER, EFFORT, FLOOR_ID, LUNA_REF, LUNA_SHA256, MODEL,
    NAMESPACE, OUTPUT_ROOT, POLICY_REF, POLICY_SHA256, PRIMARY_REF, PRIMARY_SHA256, PRIOR_POLICY_REF,
    PRIOR_POLICY_SHA256, QUESTION_REF, QUESTION_SHA256, RECOVERY_IDS, RETRY_NAME, ROOT, SPRINT,
    digest, expected_agent, leaf_prompt, load_obj, receipt_contract, result_schema_v3, sha,
)


def main() -> None:
    errors: list[str] = []
    try:
        manifest = load_obj(NAMESPACE / "manifest.json"); authority = load_obj(NAMESPACE / "authority.json")
        seal = load_obj(NAMESPACE / "launch_seal.json"); lineage = load_obj(NAMESPACE / "lineage.json")
        architecture = load_obj(NAMESPACE / "architecture.json"); schema = load_obj(NAMESPACE / "schema/external_research_result_v3.schema.json")
        prompt = load_obj(NAMESPACE / "leaf_prompt.json"); contract = load_obj(NAMESPACE / "receipt_contract_v3.json")
    except Exception as exc:
        print(json.dumps({"status": "fail", "errors": [f"load:{type(exc).__name__}:{exc}"]}, indent=2)); raise SystemExit(1)
    for ref, expected in {LUNA_REF: LUNA_SHA256, PRIMARY_REF: PRIMARY_SHA256, QUESTION_REF: QUESTION_SHA256,
                          POLICY_REF: POLICY_SHA256, PRIOR_POLICY_REF: PRIOR_POLICY_SHA256}.items():
        path = ROOT / ref
        if not path.is_file() or sha(path) != expected: errors.append(f"input:{ref}:hash")
    luna = load_obj(ROOT / LUNA_REF); independent = luna.get("independent_derivation", {})
    if luna.get("status") != "fail_closed" or independent.get("eligible_assignment_ids") != [FLOOR_ID] or independent.get("rejected_assignment_ids") != RECOVERY_IDS:
        errors.append("luna:recovery_authority")
    luna_credit = luna.get("credit_contract", {})
    if any(luna_credit.get(key) != 0 for key in ("research_credit", "coverage_credit", "promotion_credit", "spec_credit", "merge_credit")):
        errors.append("luna:credit")
    if lineage.get("authoritative_luna_report_sha256") != LUNA_SHA256 or lineage.get("contradicted_primary_report_sha256") != PRIMARY_SHA256 or lineage.get("contradicted_primary_disposition") != "preserved_lineage_not_credit_authority":
        errors.append("lineage:authority")
    if schema != result_schema_v3() or "task_thread_id" in schema.get("properties", {}) or "task_thread_id" in schema.get("required", []):
        errors.append("schema:v3_identity_separation")
    if prompt != leaf_prompt() or contract != receipt_contract(): errors.append("prompt_or_receipt_contract:drift")
    required_phrases = ("must not contain task_thread_id", "controller alone writes a receipt", "native capture independently binds", "Do not read attempt-0002 results")
    if any(phrase not in prompt.get("prompt", "") for phrase in required_phrases): errors.append("prompt:identity_or_isolation_explanation")
    if contract.get("identity_separation", {}).get("result") != "agent_path only; task_thread_id and all native IDs are forbidden result keys":
        errors.append("receipt_contract:identity_separation")
    if manifest.get("assignment_count") != 7 or manifest.get("assignment_ids") != RECOVERY_IDS or manifest.get("preserved_floor_assignment_id") != FLOOR_ID:
        errors.append("manifest:exact_recovery_set")
    if manifest.get("active_semantic_cap") != 7 or manifest.get("concurrency_policy_v5_sha256") != POLICY_SHA256 or manifest.get("prior_concurrency_policy_v4_sha256") != PRIOR_POLICY_SHA256:
        errors.append("manifest:pacing_policy")
    assignments = manifest.get("assignments", []); paths: list[str] = []; packet_hashes = {}; intent_hashes = {}
    output_files = receipt_count = result_count = 0
    source_manifest = load_obj(ATTEMPT2 / "manifest.json"); source_by_id = {row["assignment_id"]: row for row in source_manifest["assignments"]}
    for sequence, aid in enumerate(RECOVERY_IDS, 1):
        if sequence > len(assignments): errors.append(f"{aid}:assignment:missing"); continue
        assignment = assignments[sequence - 1]; agent_path = expected_agent(aid); paths.append(agent_path)
        packet_path = NAMESPACE / "packets" / f"{aid}.json"; intent_path = NAMESPACE / "dispatch" / aid / ATTEMPT / "dispatch_intent.json"
        if assignment.get("assignment_id") != aid or assignment.get("recovery_sequence") != sequence or assignment.get("canonical_agent_path") != agent_path:
            errors.append(f"{aid}:assignment:identity")
        if assignment.get("task_thread_id") is not None or assignment.get("native_child_thread_id") is not None or assignment.get("native_child_turn_id") is not None:
            errors.append(f"{aid}:assignment:premature_native_identity")
        if not packet_path.is_file() or not intent_path.is_file(): errors.append(f"{aid}:packet_or_intent:missing"); continue
        packet = load_obj(packet_path); intent = load_obj(intent_path); packet_hashes[aid] = sha(packet_path); intent_hashes[aid] = sha(intent_path)
        original = load_obj(ATTEMPT2 / "packets" / f"{aid}.json"); source = source_by_id[aid]
        for key, value in {"topic": original["topic"], "owner_domains": original["owner_domains"], "feature_refs": original["feature_refs"],
                           "research_questions": original["research_questions"], "attempt_id": ATTEMPT,
                           "assignment_id": aid, "canonical_agent_path": agent_path, "model": MODEL,
                           "reasoning_effort": EFFORT, "fresh_child": True, "fork_turns": "none"}.items():
            if packet.get(key) != value: errors.append(f"{aid}:packet:{key}")
        if packet.get("original_packet_sha256") != sha(ATTEMPT2 / "packets" / f"{aid}.json") or packet.get("forbidden_inputs") != ["attempt-0002 results", "peer outputs", "prior semantic findings"]:
            errors.append(f"{aid}:packet:lineage_or_isolation")
        for key, value in {"attempt_id": ATTEMPT, "assignment_id": aid, "packet_sha256": packet_hashes[aid],
                           "agent_path": agent_path, "task_thread_id": None, "native_child_thread_id": None,
                           "native_child_turn_id": None, "model": MODEL, "reasoning_effort": EFFORT,
                           "fresh_child": True, "fork_turns": "none", "descendants_forbidden": True,
                           "followup_messages_forbidden": True, "retries_forbidden": True,
                           "launch_state": "NOT_LAUNCHED", "activation_granted": False}.items():
            if intent.get(key) != value: errors.append(f"{aid}:intent:{key}")
        if assignment.get("packet_sha256") != packet_hashes[aid] or assignment.get("dispatch_intent_sha256") != intent_hashes[aid]: errors.append(f"{aid}:manifest:hashes")
        output = OUTPUT_ROOT / aid / "attempts" / ATTEMPT
        files = sorted(path for path in output.iterdir() if path.is_file()) if output.is_dir() else []
        output_files += len(files); result_count += int((output / "result.json").is_file())
        if not output.is_dir() or files: errors.append(f"{aid}:output:not_empty")
        receipt_path = intent_path.with_name("dispatch_receipt.json"); receipt_count += int(receipt_path.is_file())
        if receipt_path.exists(): errors.append(f"{aid}:receipt:premature")
    if len(paths) != len(set(paths)) or postrun.prior_identity_set().intersection(paths): errors.append("identity:fresh_unique_no_reuse")
    if authority.get("status") != "PREPARED_ZERO_LAUNCH_ZERO_CREDIT" or authority.get("assignment_ids") != RECOVERY_IDS or authority.get("active_semantic_cap") != 7:
        errors.append("authority:state")
    if authority.get("concurrency_policy_v5_sha256") != POLICY_SHA256 or authority.get("prior_concurrency_policy_v4_sha256") != PRIOR_POLICY_SHA256:
        errors.append("authority:pacing_policy")
    for key in ("activation_granted",):
        if authority.get(key) is not False: errors.append(f"authority:{key}")
    for key in ("receipts", "results", "native_capture_rows", "cumulative_research_credit", "coverage_credit", "promotion_credit", "spec_credit", "merge_credit"):
        if authority.get(key) != 0: errors.append(f"authority:{key}")
    payload_files = sorted(path for path in NAMESPACE.rglob("*") if path.is_file() and path.name not in {"authority.json", "launch_seal.json"} and "validation" not in path.parts)
    if authority.get("payload_file_digest") != digest({str(path.relative_to(NAMESPACE)): sha(path) for path in payload_files}): errors.append("authority:payload_digest")
    seal_files = sorted(path for path in NAMESPACE.rglob("*") if path.is_file() and path.name != "launch_seal.json" and "validation" not in path.parts)
    if seal.get("sealed_payload_digest") != digest({str(path.relative_to(NAMESPACE)): sha(path) for path in seal_files}): errors.append("seal:payload_digest")
    if seal.get("status") != "CANDIDATE_AWAITING_INDEPENDENT_PRELAUNCH" or seal.get("activation_granted") is not False:
        errors.append("seal:state")
    if (NAMESPACE / "runtime/native_capture.json").exists() or list(NAMESPACE.rglob("dispatch_receipt.json")) or list(NAMESPACE.glob("**/activation*.json")):
        errors.append("zero_launch:native_receipt_activation_present")
    test = subprocess.run(["python3", "-B", "test_external_research_retry_attempt_0003.py"], cwd=ROOT, capture_output=True, text=True)
    try: test_report = json.loads(test.stdout)
    except Exception: test_report = {"status": "fail", "test_count": 0, "tests": {}}
    if test.returncode or test_report.get("status") != "pass" or test_report.get("test_count", 0) < 22 or any(value is not True for value in test_report.get("tests", {}).values()): errors.append("tests:fail")
    cumulative = postrun.validate_postrun()
    if cumulative.get("preserved_floor_eligible_ids") != [FLOOR_ID] or cumulative.get("cumulative_research_credit") != 0 or cumulative.get("counts", {}).get("attempt_0003_eligible") != 0:
        errors.append("prelaunch:cumulative_floor_or_credit")
    script_bindings = {"preparation_script_sha256": ROOT / "prepare_external_research_retry_attempt_0003.py",
                       "verifier_script_sha256": ROOT / "verify_external_research_retry_attempt_0003.py",
                       "validator_script_sha256": ROOT / "validate_external_research_retry_attempt_0003.py",
                       "test_script_sha256": ROOT / "test_external_research_retry_attempt_0003.py"}
    for key, path in script_bindings.items():
        if authority.get(key) != sha(path): errors.append(f"authority:{key}")
    report = {"audit_id": AUDIT_ID, "checker": "external_research_recovery_prelaunch_v3", "sprint_id": SPRINT,
              "retry_namespace": RETRY_NAME, "attempt_id": ATTEMPT, "status": "pass" if not errors else "fail",
              "errors": sorted(set(errors)), "counts": {"assignments": len(assignments), "packets": len(packet_hashes),
                  "intents": len(intent_hashes), "empty_outputs": 7 - int(bool(output_files)), "output_files": output_files,
                  "receipts": receipt_count, "results": result_count, "native_capture_rows": 0, "activations": 0},
              "assignment_ids": RECOVERY_IDS, "preserved_floor_eligible_ids": [FLOOR_ID],
              "path_mapping": {aid: expected_agent(aid) for aid in RECOVERY_IDS},
              "packet_hashes": packet_hashes, "intent_hashes": intent_hashes,
              "packet_set_digest": digest(packet_hashes), "intent_set_digest": digest(intent_hashes),
              "concurrency_policy_v5_sha256": POLICY_SHA256, "prior_concurrency_policy_v4_sha256": PRIOR_POLICY_SHA256,
              "authority_sha256": sha(NAMESPACE / "authority.json"), "launch_seal_sha256": sha(NAMESPACE / "launch_seal.json"),
              "manifest_sha256": sha(NAMESPACE / "manifest.json"), "leaf_prompt_sha256": sha(NAMESPACE / "leaf_prompt.json"),
              "result_schema_v3_sha256": sha(NAMESPACE / "schema/external_research_result_v3.schema.json"),
              "receipt_contract_v3_sha256": sha(NAMESPACE / "receipt_contract_v3.json"),
              "preparation_script_sha256": sha(ROOT / "prepare_external_research_retry_attempt_0003.py"),
              "verifier_script_sha256": sha(ROOT / "verify_external_research_retry_attempt_0003.py"),
              "validator_script_sha256": sha(ROOT / "validate_external_research_retry_attempt_0003.py"),
              "test_script_sha256": sha(ROOT / "test_external_research_retry_attempt_0003.py"),
              "strict_tests": test_report.get("tests", {}), "strict_test_count": test_report.get("test_count", 0),
              "cumulative_research_credit": 0, "coverage_credit": 0, "promotion_credit": 0, "spec_credit": 0, "merge_credit": 0,
              "remaining_independent_gates": ["independent_prelaunch_validation_and_hash_pinning",
                  "explicit_activation_for_exactly_seven_fresh_direct_luna_max_leaves_under_v5_cap_7",
                  "controller_receipts_after_spawn_identity_terminal_result_and_pmr1",
                  "independent_native_capture_of_seven_unique_thread_and_turn_identities",
                  "independent_postrun_join_of_result_agent_path_receipt_native_identity_and_capture",
                  "cumulative_er_0002_plus_seven_recovery_rows_must_equal_exact_eight_before_research_credit_8"]}
    print(json.dumps(report, indent=2, sort_keys=True)); raise SystemExit(0 if not errors else 1)


if __name__ == "__main__": main()
