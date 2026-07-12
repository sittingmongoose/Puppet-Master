#!/usr/bin/env python3
"""Prepare the single 24-reviewer owner-domain merge wave without dispatching it."""

from __future__ import annotations

import json
import os

from macro_v2_common import ROOT, sha
from owner_merge_common import (
    MAX_OWNER_CONCURRENCY,
    OWNER_ATTEMPT,
    OWNER_EPOCH,
    OWNER_ROOT,
    load_jsonl,
    load_obj,
    write_jsonl,
    write_obj,
)


BATCH_ID = "owner-merge-batch-0001"
SOL_CONTROLLER = "019f4f5e-96c6-7893-8c94-ce2c1b760d6c"


def main() -> None:
    epoch = OWNER_ROOT / "frozen" / OWNER_EPOCH
    activation_path = OWNER_ROOT / "validation" / OWNER_EPOCH / "activation.json"
    batch_dir = OWNER_ROOT / "batches" / BATCH_ID
    dispatch_dir = OWNER_ROOT / "dispatch" / BATCH_ID
    staging = OWNER_ROOT / "staging_batches" / BATCH_ID
    if batch_dir.exists() or dispatch_dir.exists() or staging.exists():
        raise RuntimeError("refusing to overwrite owner-merge batch")
    if not activation_path.is_file():
        raise RuntimeError("owner-merge epoch is not activated")
    activation = load_obj(activation_path)
    if activation.get("status") != "ACTIVE_FOR_ONE_24_SHARD_OWNER_WAVE":
        raise RuntimeError("owner-merge activation status invalid")
    assignments = load_jsonl(epoch / "manifests/assignment_manifest.jsonl")
    if len(assignments) != MAX_OWNER_CONCURRENCY or len(assignments) != activation.get("assignment_count"):
        raise RuntimeError("owner-merge assignment cardinality mismatch")

    staging.mkdir(parents=True)
    batch_rows: list[dict] = []
    for assignment in assignments:
        output = ROOT / assignment["output_directory"]
        if not output.is_dir() or any(output.iterdir()):
            raise RuntimeError(f"owner-merge output not empty:{assignment['assignment_id']}")
        assignment_bytes = json.dumps(assignment, sort_keys=True, separators=(",", ":"), ensure_ascii=False).encode()
        row = dict(assignment)
        row["assignment_record_sha256"] = sha(assignment_bytes)
        batch_rows.append(row)
        intent = {
            "audit_id": assignment["audit_id"],
            "schema_version": "owner-merge-dispatch-intent-v1",
            "epoch_id": OWNER_EPOCH,
            "batch_id": BATCH_ID,
            "assignment_id": assignment["assignment_id"],
            "attempt_id": OWNER_ATTEMPT,
            "assignment_record_sha256": row["assignment_record_sha256"],
            "packet_ref": str(epoch / assignment["packet_ref"]),
            "packet_sha256": assignment["packet_sha256"],
            "result_schema_ref": str(epoch / assignment["result_schema_ref"]),
            "output_directory": str(output),
            "result_contract": "write exactly one strict-schema JSON payload in output_directory; result.json recommended",
            "terminal_contract": "return PMR1 after payload; do not write another file or terminal seal",
            "model": "gpt-5.6-sol",
            "reasoning_effort": "xhigh",
            "fresh_child_required": True,
            "fork_turns": "none",
            "followup_messages_forbidden": True,
            "receipt_ref": str(
                OWNER_ROOT / "dispatch" / BATCH_ID / assignment["assignment_id"]
                / OWNER_ATTEMPT / "dispatch_receipt.json"
            ),
            "coverage_credit_before_validation": 0,
        }
        write_obj(
            staging / "dispatch" / assignment["assignment_id"] / OWNER_ATTEMPT / "dispatch_intent.json",
            intent,
        )

    write_jsonl(staging / "batch_manifest.jsonl", batch_rows)
    leaf_prompt = {
        "schema_version": "owner-merge-leaf-prompt-v1",
        "prompt": (
            "Execute only the assigned Audit 005 owner-domain merge intent. Read only the absolute dispatch intent, "
            "its one packet, and its strict result schema. Verify the packet hash and your fresh canonical agent identity. "
            "Do not browse, read canonical Plans, prior audits, peer outputs, or unrelated files; do not message anyone. "
            "Within the packet's single owner_domain, compare every local feature against the full shard. Merge only true "
            "synonyms representing the same product feature under the same authority and lifecycle. Shared words, adjacency, "
            "or a dependency are not sufficient. Keep concepts distinct whenever authority, lifecycle, consumer, state machine, "
            "failure or recovery behavior, security boundary, or user-visible promise differs. Every assigned local_feature_ref "
            "must appear exactly once in coverage, exactly once in local_feature_memberships, and exactly once across the "
            "provisional_features local_feature_refs arrays. Use unique PF-#### IDs. For a multi-member merge use "
            "merged_synonym for every member; for a singleton use singleton or kept_distinct. For each provisional feature, "
            "source_documents, source_unit_refs, feature_kinds, aliases, and cross_domain_terms must equal the duplicate-free "
            "union of its members; risk_level must use critical > high > medium > low; spec_state must use "
            "contradictory > unknown > under_specified > partially_specified > well_specified; confidence must be the minimum "
            "member confidence. Preserve every nonblank member gap_summary "
            "verbatim inside the output gap_summary. Never merge across owner domains. Record dependencies or tensions as "
            "relationships instead of merges. External research and scenarios remain deferred to their mandatory later lane, "
            "not omitted. Write exactly one JSON payload with every schema key and no unlisted key. Use your canonical agent "
            "path as task_thread_id. After the completed payload is written, return exactly PMR1."
        ),
    }
    receipt_contract = {
        "schema_version": "owner-merge-receipt-contract-v1",
        "required_keys": [
            "audit_id", "schema_version", "epoch_id", "batch_id", "assignment_id", "attempt_id",
            "controller_thread_id", "agent_path", "task_thread_id", "model", "reasoning_effort",
            "fresh_child", "fork_turns", "dispatch_intent_sha256", "packet_sha256", "output_directory",
        ],
        "constants": {
            "audit_id": assignments[0]["audit_id"],
            "schema_version": "owner-merge-dispatch-receipt-v1",
            "epoch_id": OWNER_EPOCH,
            "batch_id": BATCH_ID,
            "controller_thread_id": SOL_CONTROLLER,
            "model": "gpt-5.6-sol",
            "reasoning_effort": "xhigh",
            "fresh_child": True,
            "fork_turns": "none",
        },
        "identity_rule": "agent_path equals task_thread_id equals the fresh child's canonical agent path",
    }
    write_obj(staging / "leaf_prompt.json", leaf_prompt)
    write_obj(staging / "receipt_contract.json", receipt_contract)
    manifest_sha = sha((staging / "batch_manifest.jsonl").read_bytes())
    authority = {
        "audit_id": assignments[0]["audit_id"],
        "schema_version": "owner-merge-batch-authority-v1",
        "epoch_id": OWNER_EPOCH,
        "batch_id": BATCH_ID,
        "status": "PREPARED_UNBOUND_ZERO_CREDIT",
        "assignment_count": len(batch_rows),
        "assignment_ids": [row["assignment_id"] for row in batch_rows],
        "batch_manifest_sha256": manifest_sha,
        "epoch_launch_seal_sha256": sha((epoch / "launch_seal.json").read_bytes()),
        "epoch_activation_sha256": sha(activation_path.read_bytes()),
        "catalog_coverage_sha256": activation["catalog_coverage_sha256"],
        "local_feature_refs_digest": activation["local_feature_refs_digest"],
        "local_feature_count": activation["local_feature_count"],
        "leaf_prompt_sha256": sha((staging / "leaf_prompt.json").read_bytes()),
        "receipt_contract_sha256": sha((staging / "receipt_contract.json").read_bytes()),
        "strict_result_schema_sha256": sha((epoch / "schemas/owner_merge_result.schema.json").read_bytes()),
        "primary_validator_ref": "validate_owner_merge_batch.py",
        "primary_validator_sha256": sha((ROOT / "validate_owner_merge_batch.py").read_bytes()),
        "prelaunch_verifier_ref": "verify_owner_merge_batch.py",
        "prelaunch_verifier_sha256": sha((ROOT / "verify_owner_merge_batch.py").read_bytes()),
        "validator_test_ref": "test_owner_merge_validator.py",
        "validator_test_sha256": sha((ROOT / "test_owner_merge_validator.py").read_bytes()),
        "controller_thread_id": SOL_CONTROLLER,
        "controller_model": "gpt-5.6-sol",
        "controller_reasoning_effort": "xhigh",
        "direct_fresh_children": True,
        "global_concurrency": MAX_OWNER_CONCURRENCY,
        "coverage_credit_before_validation": 0,
        "canonical_plan_writes_authorized": False,
    }
    write_obj(staging / "batch_authority.json", authority)

    batch_dir.parent.mkdir(parents=True, exist_ok=True)
    dispatch_dir.parent.mkdir(parents=True, exist_ok=True)
    batch_dir.mkdir()
    os.replace(staging / "batch_manifest.jsonl", batch_dir / "batch_manifest.jsonl")
    os.replace(staging / "batch_authority.json", batch_dir / "batch_authority.json")
    os.replace(staging / "leaf_prompt.json", batch_dir / "leaf_prompt.json")
    os.replace(staging / "receipt_contract.json", batch_dir / "receipt_contract.json")
    os.replace(staging / "dispatch", dispatch_dir)
    staging.rmdir()
    print(json.dumps({
        "status": "prepared_unbound_zero_credit",
        "batch_id": BATCH_ID,
        "assignment_count": len(batch_rows),
        "local_feature_count": activation["local_feature_count"],
        "batch_manifest_sha256": manifest_sha,
        "authority_sha256": sha((batch_dir / "batch_authority.json").read_bytes()),
    }, indent=2, sort_keys=True))


if __name__ == "__main__":
    main()
