#!/usr/bin/env python3
"""Prepare the unbound zero-credit 40-leaf shadow batch without dispatch."""

from __future__ import annotations

import json
import os
import subprocess

from cross_shard_shadow_common import (
    HARD_CAP, POLICY_REF, POLICY_SHA256, SHADOW_ATTEMPT, SHADOW_BATCH, SHADOW_CONCURRENCY,
    SHADOW_EPOCH, SHADOW_ROOT, SOL_CONTROLLER, TEMPORARY_PRE_RESET_TARGET,
    load_jsonl, write_jsonl, write_obj,
)
from macro_v2_common import ROOT, sha


def run_json(script: str) -> dict:
    process = subprocess.run(["python3", "-B", script], cwd=ROOT, capture_output=True, text=True, check=False)
    if process.returncode != 0 or not process.stdout.strip():
        raise RuntimeError(f"subprocess failed:{script}:{process.stdout}:{process.stderr}")
    report = json.loads(process.stdout)
    if report.get("status") != "pass":
        raise RuntimeError(f"gate failed:{script}:{report}")
    return report


def main() -> None:
    epoch = SHADOW_ROOT / "frozen" / SHADOW_EPOCH
    batch_dir = SHADOW_ROOT / "batches" / SHADOW_BATCH
    dispatch_dir = SHADOW_ROOT / "dispatch" / SHADOW_BATCH
    staging = SHADOW_ROOT / "staging_batches" / SHADOW_BATCH
    validation = SHADOW_ROOT / "validation"
    epoch_local_path = validation / SHADOW_EPOCH / "local-prelaunch.json"
    forbidden = [
        batch_dir, dispatch_dir, staging, epoch_local_path,
        validation / SHADOW_BATCH / "luna-prelaunch.json",
        validation / SHADOW_BATCH / "activation.json",
        SHADOW_ROOT / "runtime" / SHADOW_BATCH / "native_capture.json",
    ]
    if any(path.exists() for path in forbidden):
        raise RuntimeError("refusing to overwrite or prepare over prior shadow batch state")

    local = run_json("verify_cross_shard_shadow_epoch.py")
    if local.get("errors") != []:
        raise RuntimeError("shadow epoch local gate has errors")
    write_obj(epoch_local_path, local)
    strict = run_json("test_cross_shard_shadow_validator.py")
    if not strict.get("strict_tests") or any(value is not True for value in strict["strict_tests"].values()):
        raise RuntimeError("shadow validator strict tests incomplete")

    assignments = load_jsonl(epoch / "manifests/assignment_manifest.jsonl")
    if len(assignments) != SHADOW_CONCURRENCY:
        raise RuntimeError("shadow assignment count is not exact 40")
    staging.mkdir(parents=True)
    batch_rows: list[dict] = []
    for assignment in assignments:
        output = ROOT / assignment["output_directory"]
        if not output.is_dir() or any(output.iterdir()):
            raise RuntimeError(f"shadow output not empty:{assignment['assignment_id']}")
        assignment_bytes = json.dumps(assignment, sort_keys=True, separators=(",", ":"), ensure_ascii=False).encode()
        row = dict(assignment)
        row["assignment_record_sha256"] = sha(assignment_bytes)
        batch_rows.append(row)
        intent = {
            "audit_id": assignment["audit_id"],
            "schema_version": "cross-shard-shadow-dispatch-intent-v1",
            "epoch_id": SHADOW_EPOCH,
            "batch_id": SHADOW_BATCH,
            "assignment_id": assignment["assignment_id"],
            "attempt_id": SHADOW_ATTEMPT,
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
            "descendants_forbidden": True,
            "followup_messages_forbidden": True,
            "receipt_ref": str(SHADOW_ROOT / "dispatch" / SHADOW_BATCH / assignment["assignment_id"] / SHADOW_ATTEMPT / "dispatch_receipt.json"),
            "coverage_credit_before_validation": 0,
        }
        write_obj(staging / "dispatch" / assignment["assignment_id"] / SHADOW_ATTEMPT / "dispatch_intent.json", intent)

    write_jsonl(staging / "batch_manifest.jsonl", batch_rows)
    leaf_prompt = {
        "schema_version": "cross-shard-shadow-leaf-prompt-v1",
        "prompt": (
            "Execute only the assigned Audit 005 reverse-orientation cross-shard shadow intent. Read only the absolute "
            "dispatch intent, its one shadow packet, and strict result schema. Verify hashes and your fresh canonical identity. "
            "Do not browse, read canonical Plans, primary cross-shard decisions or candidate lists, prior audits, peer outputs, "
            "or unrelated files; do not message anyone or spawn descendants. The packet deliberately reverses the primary "
            "orientation: the original right-shard provisional features are anchors and the original left-shard provisional "
            "features are comparators. Verify and preserve that orientation. For every anchor, compare every comparator. "
            "Merge-equivalent requires the same product authority, lifecycle, user outcome, state boundary, and failure semantics. "
            "Umbrella/member structure, adjacency, dependency, shared vocabulary or UI, and related commands are not merge-equivalent. "
            "Put plausible but distinct neighbors in related_but_distinct_refs. Emit exactly one decision per anchor, copy input "
            "binding and coverage exactly, keep candidate and related lists duplicate-free and disjoint, and use the full comparator "
            "count in every decision. Empty lists are valid only after exhaustive review. Write exactly one strict JSON payload in "
            "output_directory, use your canonical agent path as task_thread_id, and return exactly PMR1."
        ),
    }
    receipt_contract = {
        "schema_version": "cross-shard-shadow-receipt-contract-v1",
        "required_keys": [
            "audit_id", "schema_version", "epoch_id", "batch_id", "assignment_id", "attempt_id",
            "controller_thread_id", "agent_path", "task_thread_id", "model", "reasoning_effort",
            "fresh_child", "fork_turns", "dispatch_intent_sha256", "packet_sha256", "output_directory",
        ],
        "constants": {
            "audit_id": assignments[0]["audit_id"],
            "schema_version": "cross-shard-shadow-dispatch-receipt-v1",
            "epoch_id": SHADOW_EPOCH,
            "batch_id": SHADOW_BATCH,
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
        "schema_version": "cross-shard-shadow-batch-authority-v1",
        "epoch_id": SHADOW_EPOCH,
        "batch_id": SHADOW_BATCH,
        "status": "PREPARED_UNBOUND_ZERO_CREDIT",
        "assignment_count": len(batch_rows),
        "assignment_ids": [row["assignment_id"] for row in batch_rows],
        "batch_manifest_sha256": manifest_sha,
        "epoch_authority_sha256": sha((epoch / "authority.json").read_bytes()),
        "epoch_launch_seal_sha256": sha((epoch / "launch_seal.json").read_bytes()),
        "epoch_local_prelaunch_ref": epoch_local_path.relative_to(ROOT).as_posix(),
        "epoch_local_prelaunch_sha256": sha(epoch_local_path.read_bytes()),
        "leaf_prompt_sha256": sha((staging / "leaf_prompt.json").read_bytes()),
        "receipt_contract_sha256": sha((staging / "receipt_contract.json").read_bytes()),
        "strict_result_schema_sha256": sha((epoch / "schemas/cross_shard_shadow_result.schema.json").read_bytes()),
        "primary_validator_ref": "validate_cross_shard_shadow_batch.py",
        "primary_validator_sha256": sha((ROOT / "validate_cross_shard_shadow_batch.py").read_bytes()),
        "validator_test_ref": "test_cross_shard_shadow_validator.py",
        "validator_test_sha256": sha((ROOT / "test_cross_shard_shadow_validator.py").read_bytes()),
        "epoch_verifier_ref": "verify_cross_shard_shadow_epoch.py",
        "epoch_verifier_sha256": sha((ROOT / "verify_cross_shard_shadow_epoch.py").read_bytes()),
        "batch_verifier_ref": "verify_cross_shard_shadow_batch.py",
        "batch_verifier_sha256": sha((ROOT / "verify_cross_shard_shadow_batch.py").read_bytes()),
        "activation_script_ref": "activate_cross_shard_shadow_batch.py",
        "activation_script_sha256": sha((ROOT / "activate_cross_shard_shadow_batch.py").read_bytes()),
        "controller_thread_id": SOL_CONTROLLER,
        "controller_model": "gpt-5.6-sol",
        "controller_reasoning_effort": "xhigh",
        "direct_fresh_children": True,
        "global_concurrency": SHADOW_CONCURRENCY,
        "temporary_pre_reset_target": TEMPORARY_PRE_RESET_TARGET,
        "hard_cap": HARD_CAP,
        "concurrency_policy_ref": POLICY_REF,
        "concurrency_policy_sha256": POLICY_SHA256,
        "coverage_credit_before_validation": 0,
        "canonical_plan_writes_authorized": False,
    }
    write_obj(staging / "batch_authority.json", authority)
    batch_dir.parent.mkdir(parents=True, exist_ok=True)
    dispatch_dir.parent.mkdir(parents=True, exist_ok=True)
    batch_dir.mkdir()
    for name in ("batch_manifest.jsonl", "batch_authority.json", "leaf_prompt.json", "receipt_contract.json"):
        os.replace(staging / name, batch_dir / name)
    os.replace(staging / "dispatch", dispatch_dir)
    staging.rmdir()
    print(json.dumps({
        "status": "prepared_unbound_zero_credit",
        "batch_id": SHADOW_BATCH,
        "assignment_count": len(batch_rows),
        "batch_manifest_sha256": manifest_sha,
        "authority_sha256": sha((batch_dir / "batch_authority.json").read_bytes()),
        "epoch_local_prelaunch_sha256": sha(epoch_local_path.read_bytes()),
        "strict_test_count": len(strict["strict_tests"]),
    }, indent=2, sort_keys=True))


if __name__ == "__main__":
    main()

