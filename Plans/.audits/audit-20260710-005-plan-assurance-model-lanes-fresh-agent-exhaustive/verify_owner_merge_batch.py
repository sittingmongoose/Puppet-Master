#!/usr/bin/env python3
"""Fail-closed pre-dispatch verification for the owner-domain merge wave."""

from __future__ import annotations

import json
import subprocess
from pathlib import Path

from macro_v2_common import ROOT, sha
from owner_merge_common import (
    MAX_OWNER_CONCURRENCY,
    OWNER_ATTEMPT,
    OWNER_EPOCH,
    OWNER_ROOT,
    digest_strings,
    load_jsonl,
    load_obj,
)
from prepare_owner_merge_batch import BATCH_ID, SOL_CONTROLLER


def main() -> None:
    errors: list[str] = []
    batch = OWNER_ROOT / "batches" / BATCH_ID
    epoch = OWNER_ROOT / "frozen" / OWNER_EPOCH
    activation_path = OWNER_ROOT / "validation" / OWNER_EPOCH / "activation.json"
    try:
        authority = load_obj(batch / "batch_authority.json")
        rows = load_jsonl(batch / "batch_manifest.jsonl")
        leaf_prompt = load_obj(batch / "leaf_prompt.json")
        receipt_contract = load_obj(batch / "receipt_contract.json")
        activation = load_obj(activation_path)
        epoch_rows = load_jsonl(epoch / "manifests/assignment_manifest.jsonl")
        catalog_lineage = load_obj(epoch / "lineage/catalog.json")
        ledger = load_jsonl(ROOT / catalog_lineage["local_feature_ledger_ref"])
    except Exception as exc:
        print(json.dumps({"status": "fail", "errors": [f"load:{type(exc).__name__}:{exc}"]}, indent=2))
        raise SystemExit(1)

    if authority.get("status") != "PREPARED_UNBOUND_ZERO_CREDIT" or authority.get("coverage_credit_before_validation") != 0:
        errors.append("batch authority status/credit mismatch")
    if authority.get("epoch_id") != OWNER_EPOCH or authority.get("batch_id") != BATCH_ID:
        errors.append("batch authority identity mismatch")
    if activation.get("status") != "ACTIVE_FOR_ONE_24_SHARD_OWNER_WAVE":
        errors.append("owner-merge activation status mismatch")
    if sha(activation_path.read_bytes()) != authority.get("epoch_activation_sha256"):
        errors.append("owner-merge activation hash mismatch")
    if sha((epoch / "launch_seal.json").read_bytes()) != authority.get("epoch_launch_seal_sha256"):
        errors.append("owner-merge launch seal hash mismatch")
    if sha((batch / "batch_manifest.jsonl").read_bytes()) != authority.get("batch_manifest_sha256"):
        errors.append("batch manifest hash mismatch")
    if sha((batch / "leaf_prompt.json").read_bytes()) != authority.get("leaf_prompt_sha256"):
        errors.append("leaf prompt hash mismatch")
    if sha((batch / "receipt_contract.json").read_bytes()) != authority.get("receipt_contract_sha256"):
        errors.append("receipt contract hash mismatch")
    if sha((epoch / "schemas/owner_merge_result.schema.json").read_bytes()) != authority.get("strict_result_schema_sha256"):
        errors.append("result schema hash mismatch")
    for ref_key, sha_key in (
        ("primary_validator_ref", "primary_validator_sha256"),
        ("prelaunch_verifier_ref", "prelaunch_verifier_sha256"),
        ("validator_test_ref", "validator_test_sha256"),
    ):
        artifact = ROOT / str(authority.get(ref_key))
        if not artifact.is_file() or sha(artifact.read_bytes()) != authority.get(sha_key):
            errors.append(f"batch executable binding mismatch:{ref_key}")
    if (
        authority.get("controller_thread_id") != SOL_CONTROLLER
        or authority.get("controller_model") != "gpt-5.6-sol"
        or authority.get("controller_reasoning_effort") != "xhigh"
    ):
        errors.append("controller authority mismatch")
    if authority.get("global_concurrency") != MAX_OWNER_CONCURRENCY:
        errors.append("owner-merge concurrency mismatch")
    if len(rows) != MAX_OWNER_CONCURRENCY or len(rows) != authority.get("assignment_count"):
        errors.append("batch assignment cardinality mismatch")
    ids = [row.get("assignment_id") for row in rows]
    if ids != authority.get("assignment_ids") or len(ids) != len(set(ids)):
        errors.append("batch assignment id mismatch")
    if ids != [row.get("assignment_id") for row in epoch_rows]:
        errors.append("batch does not select complete epoch assignment set")
    epoch_by_id = {row["assignment_id"]: row for row in epoch_rows}
    assigned_refs: list[str] = []
    for row in rows:
        assignment_id = row.get("assignment_id")
        original = epoch_by_id.get(assignment_id)
        if original is None:
            errors.append(f"unknown assignment:{assignment_id}")
            continue
        expected = dict(original)
        expected["assignment_record_sha256"] = sha(
            json.dumps(original, sort_keys=True, separators=(",", ":"), ensure_ascii=False).encode()
        )
        if row != expected:
            errors.append(f"batch row differs from epoch:{assignment_id}")
        assigned_refs.extend(row.get("local_feature_refs", []))
        intent_path = OWNER_ROOT / "dispatch" / BATCH_ID / assignment_id / OWNER_ATTEMPT / "dispatch_intent.json"
        if not intent_path.is_file():
            errors.append(f"dispatch intent missing:{assignment_id}")
            continue
        intent = load_obj(intent_path)
        if intent.get("assignment_id") != assignment_id or intent.get("assignment_record_sha256") != row.get("assignment_record_sha256"):
            errors.append(f"intent assignment binding mismatch:{assignment_id}")
        packet_path = Path(str(intent.get("packet_ref")))
        if not packet_path.is_file() or sha(packet_path.read_bytes()) != row.get("packet_sha256") or intent.get("packet_sha256") != row.get("packet_sha256"):
            errors.append(f"intent packet binding mismatch:{assignment_id}")
        else:
            packet = load_obj(packet_path)
            if packet.get("local_feature_refs") != row.get("local_feature_refs"):
                errors.append(f"intent packet local-feature closure mismatch:{assignment_id}")
            if packet.get("local_feature_refs_digest") != digest_strings(row.get("local_feature_refs", [])):
                errors.append(f"intent packet local-feature digest mismatch:{assignment_id}")
            if packet.get("owner_domain") != row.get("owner_domain"):
                errors.append(f"intent packet domain mismatch:{assignment_id}")
        schema_path = Path(str(intent.get("result_schema_ref")))
        if not schema_path.is_file() or sha(schema_path.read_bytes()) != authority.get("strict_result_schema_sha256"):
            errors.append(f"intent schema binding mismatch:{assignment_id}")
        output = Path(str(intent.get("output_directory")))
        if not output.is_dir() or any(output.iterdir()):
            errors.append(f"prelaunch output not empty:{assignment_id}")
        receipt = Path(str(intent.get("receipt_ref")))
        if receipt.exists():
            errors.append(f"receipt exists before dispatch:{assignment_id}")
        if (
            intent.get("model") != "gpt-5.6-sol"
            or intent.get("reasoning_effort") != "xhigh"
            or intent.get("fresh_child_required") is not True
            or intent.get("fork_turns") != "none"
        ):
            errors.append(f"intent model/freshness mismatch:{assignment_id}")
        if intent.get("followup_messages_forbidden") is not True or intent.get("coverage_credit_before_validation") != 0:
            errors.append(f"intent isolation/credit mismatch:{assignment_id}")
    ledger_refs = [row["local_feature_ref"] for row in ledger]
    if len(assigned_refs) != len(set(assigned_refs)) or set(assigned_refs) != set(ledger_refs):
        errors.append("batch local-feature partition does not equal immutable ledger")
    if authority.get("local_feature_count") != len(ledger_refs) or authority.get("local_feature_count") != activation.get("local_feature_count"):
        errors.append("batch local-feature count mismatch")
    if authority.get("local_feature_refs_digest") != digest_strings(ledger_refs) or authority.get("local_feature_refs_digest") != activation.get("local_feature_refs_digest"):
        errors.append("batch local-feature digest mismatch")
    if authority.get("catalog_coverage_sha256") != activation.get("catalog_coverage_sha256"):
        errors.append("batch catalog coverage mismatch")
    prompt = leaf_prompt.get("prompt")
    required_phrases = [
        "compare every local feature against the full shard",
        "Every assigned local_feature_ref must appear exactly once",
        "Do not browse",
        "Preserve every nonblank member gap_summary verbatim",
        "return exactly PMR1",
    ]
    if not isinstance(prompt, str) or any(phrase not in prompt for phrase in required_phrases):
        errors.append("leaf prompt lacks closure/isolation/preservation contract")
    required_receipt_keys = {
        "audit_id", "schema_version", "epoch_id", "batch_id", "assignment_id", "attempt_id",
        "controller_thread_id", "agent_path", "task_thread_id", "model", "reasoning_effort",
        "fresh_child", "fork_turns", "dispatch_intent_sha256", "packet_sha256", "output_directory",
    }
    if set(receipt_contract.get("required_keys", [])) != required_receipt_keys:
        errors.append("receipt contract key mismatch")
    constants = receipt_contract.get("constants", {})
    if constants.get("controller_thread_id") != SOL_CONTROLLER or constants.get("batch_id") != BATCH_ID or constants.get("fresh_child") is not True:
        errors.append("receipt contract constants mismatch")
    test_process = subprocess.run(
        ["python3", str(authority.get("validator_test_ref"))],
        cwd=ROOT, capture_output=True, text=True, check=False,
    )
    try:
        test_report = json.loads(test_process.stdout)
    except Exception:
        test_report = {"status": "fail", "strict_tests": {}}
    required_tests = {
        "valid_synthetic_passed", "extra_nested_key_rejected", "omitted_local_feature_rejected",
        "duplicate_membership_rejected", "cross_domain_merge_rejected", "source_union_mismatch_rejected",
    }
    strict_tests = test_report.get("strict_tests")
    if (
        test_process.returncode != 0
        or test_report.get("status") != "pass"
        or not isinstance(strict_tests, dict)
        or set(strict_tests) != required_tests
        or any(value is not True for value in strict_tests.values())
    ):
        errors.append("validator strict-test harness failed")
    report = {
        "audit_id": authority.get("audit_id"),
        "checker": "owner_merge_batch_prelaunch_v1",
        "epoch_id": OWNER_EPOCH,
        "batch_id": BATCH_ID,
        "status": "pass" if not errors else "fail",
        "errors": sorted(set(errors)),
        "assignment_count": len(rows),
        "local_feature_count": len(ledger_refs),
        "batch_manifest_sha256": sha((batch / "batch_manifest.jsonl").read_bytes()),
        "authority_sha256": sha((batch / "batch_authority.json").read_bytes()),
        "activation_sha256": sha(activation_path.read_bytes()),
        "strict_tests": strict_tests,
    }
    print(json.dumps(report, indent=2, sort_keys=True))
    raise SystemExit(0 if not errors else 1)


if __name__ == "__main__":
    main()
