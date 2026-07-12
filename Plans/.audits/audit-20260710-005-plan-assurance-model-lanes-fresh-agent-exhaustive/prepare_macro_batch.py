#!/usr/bin/env python3
"""Prepare one immutable 24-assignment macro-review batch without dispatching it."""

from __future__ import annotations

import argparse
import json
import os
from pathlib import Path

from macro_v2_common import (
    AUDIT_ID,
    GLOBAL_CONCURRENCY,
    MACRO_ROOT,
    ROOT,
    load_jsonl,
    load_obj,
    sha,
    write_jsonl,
    write_obj,
)


def latest_coverage() -> tuple[Path, dict]:
    pointer_path = MACRO_ROOT / "live/ACTIVE.json"
    if pointer_path.is_file():
        pointer = load_obj(pointer_path)
        path = ROOT / str(pointer.get("coverage_ref"))
        if not path.is_file() or sha(path.read_bytes()) != pointer.get("coverage_sha256"):
            raise RuntimeError("ACTIVE coverage pointer is broken")
        return path, load_obj(path)
    paths = sorted(
        (MACRO_ROOT / "live").glob("coverage.snapshot-*.json"),
        key=lambda path: int(path.stem.rsplit("-", 1)[1]),
    )
    if not paths:
        raise RuntimeError("macro coverage baseline missing")
    return paths[-1], load_obj(paths[-1])


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--epoch", default="epoch-0014")
    parser.add_argument("--batch-id", required=True)
    parser.add_argument("--pilot", action="store_true")
    parser.add_argument("--count", type=int, default=GLOBAL_CONCURRENCY)
    args = parser.parse_args()
    if not 1 <= args.count <= GLOBAL_CONCURRENCY:
        raise RuntimeError("batch count must be between 1 and 24")

    epoch = MACRO_ROOT / "frozen" / args.epoch
    batch_dir = MACRO_ROOT / "batches" / args.batch_id
    dispatch_dir = MACRO_ROOT / "dispatch" / args.batch_id
    staging = MACRO_ROOT / "staging_batches" / args.batch_id
    if not epoch.is_dir():
        raise RuntimeError("macro epoch missing")
    if batch_dir.exists() or dispatch_dir.exists() or staging.exists():
        raise RuntimeError("refusing existing batch")
    staging.mkdir(parents=True)

    assignments = load_jsonl(epoch / "manifests/assignment_manifest.jsonl")
    by_id = {row["assignment_id"]: row for row in assignments}
    coverage_path, coverage = latest_coverage()
    credited = set(coverage.get("credited_assignment_ids", []))
    previously_batched: set[str] = set()
    for path in sorted((MACRO_ROOT / "batches").glob("*/batch_manifest.jsonl")):
        previously_batched.update(row["assignment_id"] for row in load_jsonl(path))

    if args.pilot:
        requested = load_obj(epoch / "manifests/pilot_assignment_ids.json")["assignment_ids"]
        expected_count = min(GLOBAL_CONCURRENCY, len(assignments))
        if args.count not in {GLOBAL_CONCURRENCY, expected_count}:
            raise RuntimeError("pilot count must equal the bounded pilot cardinality")
    else:
        expected_count = args.count
        requested = [
            row["assignment_id"]
            for row in assignments
            if row["assignment_id"] not in credited and row["assignment_id"] not in previously_batched
        ][: args.count]
    if len(requested) != expected_count or len(requested) != len(set(requested)):
        raise RuntimeError("unable to select exact unique batch cardinality")
    if any(assignment_id not in by_id for assignment_id in requested):
        raise RuntimeError("batch selection contains unknown assignment")
    if any(assignment_id in credited or assignment_id in previously_batched for assignment_id in requested):
        raise RuntimeError("batch selection reuses credited or previously batched assignment")
    selected = [by_id[assignment_id] for assignment_id in requested]

    rows = []
    intent_stage = staging / "dispatch"
    for assignment in selected:
        output = ROOT / assignment["output_directory"]
        if not output.is_dir() or any(output.iterdir()):
            raise RuntimeError(f"output directory is not empty: {assignment['assignment_id']}")
        assignment_bytes = json.dumps(assignment, sort_keys=True, separators=(",", ":")).encode()
        row = dict(assignment)
        row["assignment_record_sha256"] = sha(assignment_bytes)
        rows.append(row)
        intent = {
            "audit_id": AUDIT_ID,
            "schema_version": "macro-dispatch-intent-v1",
            "epoch_id": args.epoch,
            "batch_id": args.batch_id,
            "assignment_id": assignment["assignment_id"],
            "attempt_id": assignment["attempt_id"],
            "assignment_record_sha256": row["assignment_record_sha256"],
            "capsule_ref": str(epoch / assignment["capsule_ref"]),
            "capsule_sha256": assignment["capsule_sha256"],
            "result_schema_ref": str(epoch / assignment["result_schema_ref"]),
            "output_directory": str(output),
            "result_contract": "write exactly one regular JSON file in output_directory; result.json recommended",
            "nested_contract": (
                "copy every exact object key/type from capsule.result_contract and the strict JSON Schema; "
                "no unlisted nested keys; segment item-id union must equal item ids; item source-unit-ref union "
                "must equal all assigned required refs"
            ),
            "terminal_contract": "return PMR1 after payload; do not write terminal seal",
            "model": "gpt-5.6-sol",
            "reasoning_effort": "xhigh",
            "fresh_child_required": True,
            "fork_turns": "none",
            "followup_messages_forbidden": True,
            "receipt_ref": str(
                MACRO_ROOT / "dispatch" / args.batch_id / assignment["assignment_id"]
                / assignment["attempt_id"] / "dispatch_receipt.json"
            ),
            "coverage_credit_before_validation": 0,
        }
        write_obj(
            intent_stage / assignment["assignment_id"] / assignment["attempt_id"] / "dispatch_intent.json",
            intent,
        )

    manifest_stage = staging / "batch_manifest.jsonl"
    write_jsonl(manifest_stage, rows)
    authority = {
        "audit_id": AUDIT_ID,
        "schema_version": "macro-batch-authority-v1",
        "epoch_id": args.epoch,
        "batch_id": args.batch_id,
        "status": "PREPARED_UNBOUND_ZERO_CREDIT",
        "pilot": args.pilot,
        "assignment_count": len(rows),
        "assignment_ids": requested,
        "batch_manifest_sha256": sha(manifest_stage.read_bytes()),
        "epoch_launch_seal_ref": str(epoch / "launch_seal.json"),
        "epoch_launch_seal_sha256": sha((epoch / "launch_seal.json").read_bytes()),
        "epoch_activation_ref": str(MACRO_ROOT / "validation" / args.epoch / "activation.json"),
        "coverage_floor_ref": coverage_path.relative_to(ROOT).as_posix(),
        "coverage_floor_sha256": sha(coverage_path.read_bytes()),
        "covered_micro_window_floor": coverage["covered_micro_windows"],
        "credited_macro_assignment_floor": coverage["credited_macro_assignments"],
        "controller_thread_id": "019f4f5e-96c6-7893-8c94-ce2c1b760d6c",
        "controller_model": "gpt-5.6-sol",
        "controller_reasoning_effort": "xhigh",
        "direct_fresh_children": True,
        "global_concurrency": GLOBAL_CONCURRENCY,
        "canonical_plan_writes_authorized": False,
        "coverage_credit_before_validation": 0,
    }
    leaf_prompt = {
        "schema_version": "macro-leaf-prompt-v2",
        "prompt": (
            "Execute only the assigned Audit 005 macro intent. Read the intent, assigned capsule, its single referenced "
            "source excerpt, and result schema—nothing else. Verify hashes and identity. BEFORE reviewing, derive the output "
            "skeleton in working memory from capsule.result_contract and the strict schema, but DO NOT create or write the "
            "output file until the complete review and final payload are ready. Use every listed key exactly, no other key at any "
            "object level, booleans as booleans, confidence as 0..1 number, and the exact ordered dimensions list. Review "
            "every core line and every "
            "required source unit using both exact and adversarial lenses. Write exactly one schema-conforming JSON file "
            "inside output_directory (prefer result.json). Every segment's covered refs must exactly equal its assigned refs; "
            "the union of segment item_ids must equal all item ids; the union of item source_unit_refs must equal every "
            "assigned required ref. Every evidence.exact_quote must be copied VERBATIM from canonical text after the "
            "L######## tab prefix, preserving bullets, Markdown punctuation, backticks, spacing, and capitalization; never "
            "clean up or paraphrase a quote, and verify it is an exact substring of its declared canonical line range. "
            "Do not write any other file or terminal seal. Use your canonical "
            "agent path as task_thread_id. Do not browse, read prior audits/peers/unrelated sources, message anyone, or edit "
            "canonical Plans. After the file is fully written, return exactly PMR1."
        ),
    }
    receipt_contract = {
        "schema_version": "macro-dispatch-receipt-contract-v1",
        "required_keys": [
            "audit_id", "schema_version", "epoch_id", "batch_id", "assignment_id", "attempt_id",
            "controller_thread_id", "agent_path", "task_thread_id", "model", "reasoning_effort",
            "fresh_child", "fork_turns", "dispatch_intent_sha256", "capsule_sha256", "output_directory",
        ],
        "constants": {
            "audit_id": AUDIT_ID,
            "schema_version": "macro-dispatch-receipt-v1",
            "epoch_id": args.epoch,
            "batch_id": args.batch_id,
            "controller_thread_id": "019f4f5e-96c6-7893-8c94-ce2c1b760d6c",
            "model": "gpt-5.6-sol",
            "reasoning_effort": "xhigh",
            "fresh_child": True,
            "fork_turns": "none",
        },
        "identity_rule": "agent_path equals task_thread_id equals the fresh child's canonical agent path",
    }
    write_obj(staging / "leaf_prompt.json", leaf_prompt)
    write_obj(staging / "receipt_contract.json", receipt_contract)
    authority["leaf_prompt_sha256"] = sha((staging / "leaf_prompt.json").read_bytes())
    authority["receipt_contract_sha256"] = sha((staging / "receipt_contract.json").read_bytes())
    authority["strict_result_schema_sha256"] = sha((epoch / "schemas/macro_review_result.schema.json").read_bytes())
    write_obj(staging / "batch_authority.json", authority)

    batch_dir.parent.mkdir(parents=True, exist_ok=True)
    dispatch_dir.parent.mkdir(parents=True, exist_ok=True)
    os.replace(staging / "batch_manifest.jsonl", staging / "batch_manifest.final")
    batch_dir.mkdir()
    os.replace(staging / "batch_manifest.final", batch_dir / "batch_manifest.jsonl")
    os.replace(staging / "batch_authority.json", batch_dir / "batch_authority.json")
    os.replace(staging / "leaf_prompt.json", batch_dir / "leaf_prompt.json")
    os.replace(staging / "receipt_contract.json", batch_dir / "receipt_contract.json")
    os.replace(staging / "dispatch", dispatch_dir)
    staging.rmdir()
    print(json.dumps({
        "status": "prepared_unbound_zero_credit",
        "batch_id": args.batch_id,
        "epoch_id": args.epoch,
        "assignment_count": len(rows),
        "pilot": args.pilot,
        "covered_micro_window_floor": coverage["covered_micro_windows"],
        "batch_manifest_sha256": sha((batch_dir / "batch_manifest.jsonl").read_bytes()),
        "authority_sha256": sha((batch_dir / "batch_authority.json").read_bytes()),
    }, indent=2, sort_keys=True))


if __name__ == "__main__":
    main()
