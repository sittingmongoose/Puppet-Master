#!/usr/bin/env python3
"""Prepare the single bounded feature-catalog wave without dispatching it."""

from __future__ import annotations

import json
import os

from feature_catalog_common import (
    CATALOG_ATTEMPT,
    CATALOG_EPOCH,
    CATALOG_ROOT,
    MAX_CATALOG_CONCURRENCY,
    ROOT,
    load_jsonl,
    load_obj,
    sha,
    write_jsonl,
    write_obj,
)


BATCH_ID = "catalog-batch-0001"
SOL_CONTROLLER = "019f4f5e-96c6-7893-8c94-ce2c1b760d6c"


def main() -> None:
    epoch = CATALOG_ROOT / "frozen" / CATALOG_EPOCH
    activation_path = CATALOG_ROOT / "validation" / CATALOG_EPOCH / "activation.json"
    batch_dir = CATALOG_ROOT / "batches" / BATCH_ID
    dispatch_dir = CATALOG_ROOT / "dispatch" / BATCH_ID
    staging = CATALOG_ROOT / "staging_batches" / BATCH_ID
    if batch_dir.exists() or dispatch_dir.exists() or staging.exists():
        raise RuntimeError("refusing to overwrite feature-catalog batch")
    if not activation_path.is_file():
        raise RuntimeError("feature-catalog epoch is not activated")
    activation = load_obj(activation_path)
    if activation.get("status") != "ACTIVE_FOR_ONE_BOUNDED_CATALOG_WAVE":
        raise RuntimeError("feature-catalog activation status invalid")
    assignments = load_jsonl(epoch / "manifests/assignment_manifest.jsonl")
    if len(assignments) != activation.get("assignment_count") or not 1 <= len(assignments) <= MAX_CATALOG_CONCURRENCY:
        raise RuntimeError("feature-catalog assignment cardinality mismatch")
    staging.mkdir(parents=True)
    batch_rows: list[dict] = []
    for assignment in assignments:
        output = ROOT / assignment["output_directory"]
        if not output.is_dir() or any(output.iterdir()):
            raise RuntimeError(f"feature-catalog output not empty:{assignment['assignment_id']}")
        assignment_bytes = json.dumps(assignment, sort_keys=True, separators=(",", ":")).encode()
        row = dict(assignment)
        row["assignment_record_sha256"] = sha(assignment_bytes)
        batch_rows.append(row)
        intent = {
            "audit_id": assignment["audit_id"],
            "schema_version": "feature-catalog-dispatch-intent-v1",
            "epoch_id": CATALOG_EPOCH,
            "batch_id": BATCH_ID,
            "assignment_id": assignment["assignment_id"],
            "attempt_id": CATALOG_ATTEMPT,
            "assignment_record_sha256": row["assignment_record_sha256"],
            "packet_ref": str(epoch / assignment["packet_ref"]),
            "packet_sha256": assignment["packet_sha256"],
            "result_schema_ref": str(epoch / assignment["result_schema_ref"]),
            "output_directory": str(output),
            "result_contract": "write exactly one regular strict-schema JSON payload in output_directory; result.json recommended",
            "terminal_contract": "return PMR1 after payload; do not write any other file or terminal seal",
            "model": "gpt-5.6-sol",
            "reasoning_effort": "xhigh",
            "fresh_child_required": True,
            "fork_turns": "none",
            "followup_messages_forbidden": True,
            "receipt_ref": str(
                CATALOG_ROOT / "dispatch" / BATCH_ID / assignment["assignment_id"]
                / CATALOG_ATTEMPT / "dispatch_receipt.json"
            ),
            "coverage_credit_before_validation": 0,
        }
        write_obj(
            staging / "dispatch" / assignment["assignment_id"] / CATALOG_ATTEMPT / "dispatch_intent.json",
            intent,
        )
    write_jsonl(staging / "batch_manifest.jsonl", batch_rows)
    leaf_prompt = {
        "schema_version": "feature-catalog-leaf-prompt-v1",
        "prompt": (
            "Execute only the assigned Audit 005 feature-catalog intent. Read only the absolute dispatch intent, its one "
            "packet, and its strict result schema. Verify all hashes and your fresh canonical agent identity. Treat every "
            "packet atom as a validated observation, not automatically a correct conclusion. Build an exhaustive local "
            "inventory of distinct features, systems, tools, workflows, GUI surfaces, integrations, data models, governance "
            "controls, and cross-cutting concerns. Split concepts with distinct lifecycle, authority, consumers, or failures; "
            "merge only true synonyms. Every assigned atom_id must appear exactly once across feature.atom_ids. Every raw "
            "family key must have exactly one family_key_assignments row mapped to one or more local features. Preserve gaps, "
            "contradictions, unknowns, and explicit non-gaps. Every feature needs a concrete later external-research question "
            "and falsifiable scenario requirement. Do not browse, read canonical Plans, prior audits, peer outputs, or unrelated "
            "files; do not message anyone. Copy the packet atom/family coverage arrays and digests exactly; use unique "
            "FLOCAL-#### feature IDs and keep every list duplicate-free. Write exactly one JSON payload in output_directory with every schema key and no "
            "unlisted key. Use your canonical agent path as task_thread_id. After the completed payload is written, return "
            "exactly PMR1."
        ),
    }
    receipt_contract = {
        "schema_version": "feature-catalog-receipt-contract-v1",
        "required_keys": [
            "audit_id", "schema_version", "epoch_id", "batch_id", "assignment_id", "attempt_id",
            "controller_thread_id", "agent_path", "task_thread_id", "model", "reasoning_effort",
            "fresh_child", "fork_turns", "dispatch_intent_sha256", "packet_sha256", "output_directory",
        ],
        "constants": {
            "audit_id": assignments[0]["audit_id"],
            "schema_version": "feature-catalog-dispatch-receipt-v1",
            "epoch_id": CATALOG_EPOCH,
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
        "schema_version": "feature-catalog-batch-authority-v1",
        "epoch_id": CATALOG_EPOCH,
        "batch_id": BATCH_ID,
        "status": "PREPARED_UNBOUND_ZERO_CREDIT",
        "assignment_count": len(batch_rows),
        "assignment_ids": [row["assignment_id"] for row in batch_rows],
        "batch_manifest_sha256": manifest_sha,
        "epoch_launch_seal_sha256": sha((epoch / "launch_seal.json").read_bytes()),
        "epoch_activation_sha256": sha(activation_path.read_bytes()),
        "macro_coverage_sha256": activation["macro_coverage_sha256"],
        "atom_ids_digest": activation["atom_ids_digest"],
        "atom_count": activation["atom_count"],
        "leaf_prompt_sha256": sha((staging / "leaf_prompt.json").read_bytes()),
        "receipt_contract_sha256": sha((staging / "receipt_contract.json").read_bytes()),
        "strict_result_schema_sha256": sha((epoch / "schemas/feature_catalog_result.schema.json").read_bytes()),
        "primary_validator_ref": "validate_feature_catalog_batch.py",
        "primary_validator_sha256": sha((ROOT / "validate_feature_catalog_batch.py").read_bytes()),
        "prelaunch_verifier_ref": "verify_feature_catalog_batch.py",
        "prelaunch_verifier_sha256": sha((ROOT / "verify_feature_catalog_batch.py").read_bytes()),
        "controller_thread_id": SOL_CONTROLLER,
        "controller_model": "gpt-5.6-sol",
        "controller_reasoning_effort": "xhigh",
        "direct_fresh_children": True,
        "global_concurrency": MAX_CATALOG_CONCURRENCY,
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
        "atom_count": activation["atom_count"],
        "batch_manifest_sha256": manifest_sha,
        "authority_sha256": sha((batch_dir / "batch_authority.json").read_bytes()),
    }, indent=2, sort_keys=True))


if __name__ == "__main__":
    main()
