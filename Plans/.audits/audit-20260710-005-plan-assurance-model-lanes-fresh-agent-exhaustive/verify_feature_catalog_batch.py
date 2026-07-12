#!/usr/bin/env python3
"""Fail-closed pre-dispatch verification for the feature-catalog wave."""

from __future__ import annotations

import json
from pathlib import Path

from feature_catalog_common import (
    CATALOG_ATTEMPT,
    CATALOG_EPOCH,
    CATALOG_ROOT,
    MAX_CATALOG_CONCURRENCY,
    ROOT,
    load_jsonl,
    load_obj,
    sha,
)
from prepare_feature_catalog_batch import BATCH_ID, SOL_CONTROLLER


def main() -> None:
    errors: list[str] = []
    batch = CATALOG_ROOT / "batches" / BATCH_ID
    epoch = CATALOG_ROOT / "frozen" / CATALOG_EPOCH
    activation_path = CATALOG_ROOT / "validation" / CATALOG_EPOCH / "activation.json"
    try:
        authority = load_obj(batch / "batch_authority.json")
        rows = load_jsonl(batch / "batch_manifest.jsonl")
        leaf_prompt = load_obj(batch / "leaf_prompt.json")
        receipt_contract = load_obj(batch / "receipt_contract.json")
        activation = load_obj(activation_path)
        epoch_rows = load_jsonl(epoch / "manifests/assignment_manifest.jsonl")
        atom_rows = load_jsonl(epoch / "manifests/atom_ledger.jsonl")
    except Exception as exc:
        print(json.dumps({"status": "fail", "errors": [f"load:{type(exc).__name__}:{exc}"]}, indent=2))
        raise SystemExit(1)
    if authority.get("status") != "PREPARED_UNBOUND_ZERO_CREDIT" or authority.get("coverage_credit_before_validation") != 0:
        errors.append("batch authority status/credit mismatch")
    if authority.get("epoch_id") != CATALOG_EPOCH or authority.get("batch_id") != BATCH_ID:
        errors.append("batch authority identity mismatch")
    if activation.get("status") != "ACTIVE_FOR_ONE_BOUNDED_CATALOG_WAVE":
        errors.append("catalog activation status mismatch")
    if sha(activation_path.read_bytes()) != authority.get("epoch_activation_sha256"):
        errors.append("catalog activation hash mismatch")
    if sha((epoch / "launch_seal.json").read_bytes()) != authority.get("epoch_launch_seal_sha256"):
        errors.append("catalog epoch launch seal hash mismatch")
    if sha((batch / "batch_manifest.jsonl").read_bytes()) != authority.get("batch_manifest_sha256"):
        errors.append("batch manifest hash mismatch")
    if sha((batch / "leaf_prompt.json").read_bytes()) != authority.get("leaf_prompt_sha256"):
        errors.append("leaf prompt hash mismatch")
    if sha((batch / "receipt_contract.json").read_bytes()) != authority.get("receipt_contract_sha256"):
        errors.append("receipt contract hash mismatch")
    if sha((epoch / "schemas/feature_catalog_result.schema.json").read_bytes()) != authority.get("strict_result_schema_sha256"):
        errors.append("result schema hash mismatch")
    for ref_key, sha_key in (
        ("primary_validator_ref", "primary_validator_sha256"),
        ("prelaunch_verifier_ref", "prelaunch_verifier_sha256"),
    ):
        artifact = ROOT / str(authority.get(ref_key))
        if not artifact.is_file() or sha(artifact.read_bytes()) != authority.get(sha_key):
            errors.append(f"batch executable binding mismatch:{ref_key}")
    if authority.get("controller_thread_id") != SOL_CONTROLLER or authority.get("controller_model") != "gpt-5.6-sol" or authority.get("controller_reasoning_effort") != "xhigh":
        errors.append("controller authority mismatch")
    if authority.get("global_concurrency") != MAX_CATALOG_CONCURRENCY:
        errors.append("catalog concurrency mismatch")
    if not 1 <= len(rows) <= MAX_CATALOG_CONCURRENCY or len(rows) != authority.get("assignment_count"):
        errors.append("batch assignment cardinality mismatch")
    ids = [row.get("assignment_id") for row in rows]
    if ids != authority.get("assignment_ids") or len(ids) != len(set(ids)):
        errors.append("batch assignment id mismatch")
    epoch_by_id = {row["assignment_id"]: row for row in epoch_rows}
    if ids != [row["assignment_id"] for row in epoch_rows]:
        errors.append("batch does not select complete epoch assignment set")
    assigned_atoms: list[str] = []
    for row in rows:
        assignment_id = row.get("assignment_id")
        original = epoch_by_id.get(assignment_id)
        if original is None:
            errors.append(f"unknown assignment:{assignment_id}")
            continue
        expected = dict(original)
        expected["assignment_record_sha256"] = sha(json.dumps(original, sort_keys=True, separators=(",", ":")).encode())
        if row != expected:
            errors.append(f"batch row differs from epoch:{assignment_id}")
        assigned_atoms.extend(row.get("atom_ids", []))
        intent_path = CATALOG_ROOT / "dispatch" / BATCH_ID / assignment_id / CATALOG_ATTEMPT / "dispatch_intent.json"
        if not intent_path.is_file():
            errors.append(f"dispatch intent missing:{assignment_id}")
            continue
        intent = load_obj(intent_path)
        if intent.get("assignment_id") != assignment_id or intent.get("assignment_record_sha256") != row.get("assignment_record_sha256"):
            errors.append(f"intent assignment binding mismatch:{assignment_id}")
        packet_path = Path(str(intent.get("packet_ref")))
        if not packet_path.is_file() or sha(packet_path.read_bytes()) != row.get("packet_sha256") or intent.get("packet_sha256") != row.get("packet_sha256"):
            errors.append(f"intent packet binding mismatch:{assignment_id}")
        schema_path = Path(str(intent.get("result_schema_ref")))
        if not schema_path.is_file() or sha(schema_path.read_bytes()) != authority.get("strict_result_schema_sha256"):
            errors.append(f"intent schema binding mismatch:{assignment_id}")
        output = Path(str(intent.get("output_directory")))
        if not output.is_dir() or any(output.iterdir()):
            errors.append(f"prelaunch output not empty:{assignment_id}")
        receipt = Path(str(intent.get("receipt_ref")))
        if receipt.exists():
            errors.append(f"receipt exists before dispatch:{assignment_id}")
        if intent.get("model") != "gpt-5.6-sol" or intent.get("reasoning_effort") != "xhigh" or intent.get("fresh_child_required") is not True or intent.get("fork_turns") != "none":
            errors.append(f"intent model/freshness mismatch:{assignment_id}")
        if intent.get("followup_messages_forbidden") is not True or intent.get("coverage_credit_before_validation") != 0:
            errors.append(f"intent isolation/credit mismatch:{assignment_id}")
    atom_ids = [row["atom_id"] for row in atom_rows]
    if len(assigned_atoms) != len(set(assigned_atoms)) or set(assigned_atoms) != set(atom_ids):
        errors.append("batch atom partition does not equal epoch ledger")
    if authority.get("atom_count") != len(atom_ids) or authority.get("atom_count") != activation.get("atom_count"):
        errors.append("batch atom count mismatch")
    if authority.get("atom_ids_digest") != activation.get("atom_ids_digest"):
        errors.append("batch atom digest mismatch")
    prompt = leaf_prompt.get("prompt")
    required_phrases = [
        "Every assigned atom_id must appear exactly once",
        "Every raw family key must have exactly one",
        "Do not browse",
        "return exactly PMR1",
    ]
    if not isinstance(prompt, str) or any(phrase not in prompt for phrase in required_phrases):
        errors.append("leaf prompt lacks closure/isolation contract")
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
    report = {
        "audit_id": authority.get("audit_id"),
        "checker": "feature_catalog_batch_prelaunch_v1",
        "epoch_id": CATALOG_EPOCH,
        "batch_id": BATCH_ID,
        "status": "pass" if not errors else "fail",
        "errors": sorted(set(errors)),
        "assignment_count": len(rows),
        "atom_count": len(atom_ids),
        "batch_manifest_sha256": sha((batch / "batch_manifest.jsonl").read_bytes()),
        "authority_sha256": sha((batch / "batch_authority.json").read_bytes()),
        "activation_sha256": sha(activation_path.read_bytes()),
    }
    print(json.dumps(report, indent=2, sort_keys=True))
    raise SystemExit(0 if not errors else 1)


if __name__ == "__main__":
    main()
