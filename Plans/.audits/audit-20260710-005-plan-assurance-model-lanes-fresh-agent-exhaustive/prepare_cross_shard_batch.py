#!/usr/bin/env python3
"""Prepare the 32-leaf cross-shard candidate-discovery batch without dispatch."""

from __future__ import annotations

import json
import os
import subprocess

from cross_shard_common import (
    CROSS_ATTEMPT, CROSS_BATCH, CROSS_CONCURRENCY, CROSS_EPOCH, CROSS_ROOT, SOL_CONTROLLER,
    load_jsonl, write_jsonl, write_obj,
)
from macro_v2_common import ROOT, sha


def main() -> None:
    epoch = CROSS_ROOT / "frozen" / CROSS_EPOCH
    batch_dir = CROSS_ROOT / "batches" / CROSS_BATCH
    dispatch_dir = CROSS_ROOT / "dispatch" / CROSS_BATCH
    staging = CROSS_ROOT / "staging_batches" / CROSS_BATCH
    if batch_dir.exists() or dispatch_dir.exists() or staging.exists():
        raise RuntimeError("refusing to overwrite cross-shard batch")
    process = subprocess.run(["python3", "verify_cross_shard_epoch.py"], cwd=ROOT, capture_output=True, text=True, check=False)
    if process.returncode != 0 or not process.stdout.strip():
        raise RuntimeError(f"cross-shard epoch local verifier failed:{process.stdout}:{process.stderr}")
    local = json.loads(process.stdout)
    if local.get("status") != "pass" or local.get("errors") != []:
        raise RuntimeError("cross-shard epoch local gate failed")
    local_path = CROSS_ROOT / "validation" / CROSS_EPOCH / "local-prelaunch.json"
    if local_path.exists():
        raise RuntimeError("refusing to overwrite cross-shard local prelaunch")
    write_obj(local_path, local)
    assignments = load_jsonl(epoch / "manifests/assignment_manifest.jsonl")
    if len(assignments) != CROSS_CONCURRENCY:
        raise RuntimeError("cross-shard assignment count is not exact 32")
    staging.mkdir(parents=True)
    batch_rows: list[dict] = []
    for assignment in assignments:
        output = ROOT / assignment["output_directory"]
        if not output.is_dir() or any(output.iterdir()):
            raise RuntimeError(f"cross-shard output not empty:{assignment['assignment_id']}")
        assignment_bytes = json.dumps(assignment, sort_keys=True, separators=(",", ":"), ensure_ascii=False).encode()
        row = dict(assignment)
        row["assignment_record_sha256"] = sha(assignment_bytes)
        batch_rows.append(row)
        intent = {
            "audit_id": assignment["audit_id"], "schema_version": "cross-shard-dispatch-intent-v1",
            "epoch_id": CROSS_EPOCH, "batch_id": CROSS_BATCH, "assignment_id": assignment["assignment_id"],
            "attempt_id": CROSS_ATTEMPT, "assignment_record_sha256": row["assignment_record_sha256"],
            "packet_ref": str(epoch / assignment["packet_ref"]), "packet_sha256": assignment["packet_sha256"],
            "result_schema_ref": str(epoch / assignment["result_schema_ref"]), "output_directory": str(output),
            "result_contract": "write exactly one strict-schema JSON payload in output_directory; result.json recommended",
            "terminal_contract": "return PMR1 after payload; do not write another file or terminal seal",
            "model": "gpt-5.6-sol", "reasoning_effort": "xhigh", "fresh_child_required": True,
            "fork_turns": "none", "descendants_forbidden": True, "followup_messages_forbidden": True,
            "receipt_ref": str(CROSS_ROOT / "dispatch" / CROSS_BATCH / assignment["assignment_id"] / CROSS_ATTEMPT / "dispatch_receipt.json"),
            "coverage_credit_before_validation": 0,
        }
        write_obj(staging / "dispatch" / assignment["assignment_id"] / CROSS_ATTEMPT / "dispatch_intent.json", intent)
    write_jsonl(staging / "batch_manifest.jsonl", batch_rows)
    leaf_prompt = {
        "schema_version": "cross-shard-leaf-prompt-v1",
        "prompt": (
            "Execute only the assigned Audit 005 cross-shard intent. Read only the absolute dispatch intent, its one packet, "
            "and strict result schema. Verify hashes and your fresh canonical identity. Do not browse, read canonical Plans, "
            "prior audits, peer outputs, or unrelated files; do not message anyone or spawn subagents. For every anchor, "
            "compare every comparator in the packet. A merge candidate must be the same product feature under the same "
            "authority and lifecycle; shared terms, adjacency, dependency, or a common surface are insufficient. Put plausible "
            "near-neighbors with a distinct authority, lifecycle, consumer, state machine, failure/recovery contract, security "
            "boundary, or user-visible promise in related_but_distinct_refs. Emit exactly one decision per anchor, copy the "
            "coverage and input binding exactly, keep candidate/related lists duplicate-free and disjoint, and use the full "
            "comparator count in every decision. Empty lists are valid only after exhaustive comparison. External research is "
            "mandatory later, not in this isolated pass. Write exactly one strict JSON payload, use your canonical agent path "
            "as task_thread_id, and return exactly PMR1."
        ),
    }
    receipt_contract = {
        "schema_version": "cross-shard-receipt-contract-v1",
        "required_keys": [
            "audit_id", "schema_version", "epoch_id", "batch_id", "assignment_id", "attempt_id",
            "controller_thread_id", "agent_path", "task_thread_id", "model", "reasoning_effort",
            "fresh_child", "fork_turns", "dispatch_intent_sha256", "packet_sha256", "output_directory",
        ],
        "constants": {
            "audit_id": assignments[0]["audit_id"], "schema_version": "cross-shard-dispatch-receipt-v1",
            "epoch_id": CROSS_EPOCH, "batch_id": CROSS_BATCH, "controller_thread_id": SOL_CONTROLLER,
            "model": "gpt-5.6-sol", "reasoning_effort": "xhigh", "fresh_child": True, "fork_turns": "none",
        },
        "identity_rule": "agent_path equals task_thread_id equals the fresh child's canonical agent path",
    }
    write_obj(staging / "leaf_prompt.json", leaf_prompt)
    write_obj(staging / "receipt_contract.json", receipt_contract)
    manifest_sha = sha((staging / "batch_manifest.jsonl").read_bytes())
    authority = {
        "audit_id": assignments[0]["audit_id"], "schema_version": "cross-shard-batch-authority-v1",
        "epoch_id": CROSS_EPOCH, "batch_id": CROSS_BATCH, "status": "PREPARED_UNBOUND_ZERO_CREDIT",
        "assignment_count": len(batch_rows), "assignment_ids": [row["assignment_id"] for row in batch_rows],
        "batch_manifest_sha256": manifest_sha,
        "epoch_authority_sha256": sha((epoch / "authority.json").read_bytes()),
        "epoch_launch_seal_sha256": sha((epoch / "launch_seal.json").read_bytes()),
        "epoch_local_prelaunch_ref": local_path.relative_to(ROOT).as_posix(),
        "epoch_local_prelaunch_sha256": sha(local_path.read_bytes()),
        "leaf_prompt_sha256": sha((staging / "leaf_prompt.json").read_bytes()),
        "receipt_contract_sha256": sha((staging / "receipt_contract.json").read_bytes()),
        "strict_result_schema_sha256": sha((epoch / "schemas/cross_shard_result.schema.json").read_bytes()),
        "primary_validator_ref": "validate_cross_shard_batch.py",
        "primary_validator_sha256": sha((ROOT / "validate_cross_shard_batch.py").read_bytes()),
        "validator_test_ref": "test_cross_shard_validator.py",
        "validator_test_sha256": sha((ROOT / "test_cross_shard_validator.py").read_bytes()),
        "epoch_verifier_ref": "verify_cross_shard_epoch.py",
        "epoch_verifier_sha256": sha((ROOT / "verify_cross_shard_epoch.py").read_bytes()),
        "controller_thread_id": SOL_CONTROLLER, "controller_model": "gpt-5.6-sol",
        "controller_reasoning_effort": "xhigh", "direct_fresh_children": True,
        "global_concurrency": CROSS_CONCURRENCY, "coverage_credit_before_validation": 0,
        "canonical_plan_writes_authorized": False,
    }
    write_obj(staging / "batch_authority.json", authority)
    batch_dir.parent.mkdir(parents=True, exist_ok=True); dispatch_dir.parent.mkdir(parents=True, exist_ok=True); batch_dir.mkdir()
    for name in ("batch_manifest.jsonl", "batch_authority.json", "leaf_prompt.json", "receipt_contract.json"):
        os.replace(staging / name, batch_dir / name)
    os.replace(staging / "dispatch", dispatch_dir); staging.rmdir()
    print(json.dumps({
        "status": "prepared_unbound_zero_credit", "batch_id": CROSS_BATCH,
        "assignment_count": len(batch_rows), "batch_manifest_sha256": manifest_sha,
        "authority_sha256": sha((batch_dir / "batch_authority.json").read_bytes()),
        "epoch_local_prelaunch_sha256": sha(local_path.read_bytes()),
    }, indent=2, sort_keys=True))


if __name__ == "__main__":
    main()
