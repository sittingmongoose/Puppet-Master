#!/usr/bin/env python3
"""Fail-closed pre-dispatch verification for one Audit 005 macro batch."""

from __future__ import annotations

import argparse
import json
from pathlib import Path

from macro_v2_common import AUDIT_ID, GLOBAL_CONCURRENCY, MACRO_ROOT, ROOT, load_jsonl, load_obj, sha


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--batch-id", required=True)
    args = parser.parse_args()
    batch = MACRO_ROOT / "batches" / args.batch_id
    errors: list[str] = []
    try:
        authority = load_obj(batch / "batch_authority.json")
        rows = load_jsonl(batch / "batch_manifest.jsonl")
        leaf_prompt = load_obj(batch / "leaf_prompt.json")
        receipt_contract = load_obj(batch / "receipt_contract.json")
    except Exception as exc:
        print(json.dumps({"status": "fail", "errors": [f"batch_load:{type(exc).__name__}:{exc}"]}, indent=2))
        raise SystemExit(1)
    epoch = MACRO_ROOT / "frozen" / str(authority.get("epoch_id"))
    activation_path = MACRO_ROOT / "validation" / str(authority.get("epoch_id")) / "activation.json"
    if not activation_path.is_file():
        errors.append("epoch activation missing")
        activation = {}
    else:
        activation = load_obj(activation_path)
        if activation.get("status") != "ACTIVE_FOR_24_WORKER_MACRO_REVIEW":
            errors.append("epoch activation status invalid")
    if authority.get("audit_id") != AUDIT_ID or authority.get("status") != "PREPARED_UNBOUND_ZERO_CREDIT":
        errors.append("batch authority mismatch")
    if authority.get("global_concurrency") != GLOBAL_CONCURRENCY:
        errors.append("batch concurrency mismatch")
    if authority.get("assignment_count") != len(rows) or not 1 <= len(rows) <= GLOBAL_CONCURRENCY:
        errors.append("batch cardinality mismatch")
    ids = [row.get("assignment_id") for row in rows]
    if ids != authority.get("assignment_ids") or len(ids) != len(set(ids)):
        errors.append("batch assignment identity mismatch")
    if sha((batch / "batch_manifest.jsonl").read_bytes()) != authority.get("batch_manifest_sha256"):
        errors.append("batch manifest hash mismatch")
    if sha((batch / "leaf_prompt.json").read_bytes()) != authority.get("leaf_prompt_sha256"):
        errors.append("leaf prompt hash mismatch")
    if sha((batch / "receipt_contract.json").read_bytes()) != authority.get("receipt_contract_sha256"):
        errors.append("receipt contract hash mismatch")
    seal_path = epoch / "launch_seal.json"
    if not seal_path.is_file() or sha(seal_path.read_bytes()) != authority.get("epoch_launch_seal_sha256"):
        errors.append("epoch launch seal mismatch")
    strict_schema_path = epoch / "schemas/macro_review_result.schema.json"
    if authority.get("strict_result_schema_sha256") is not None:
        if not strict_schema_path.is_file() or sha(strict_schema_path.read_bytes()) != authority.get("strict_result_schema_sha256"):
            errors.append("strict result schema hash mismatch")
    floor_path = ROOT / str(authority.get("coverage_floor_ref"))
    if not floor_path.is_file() or sha(floor_path.read_bytes()) != authority.get("coverage_floor_sha256"):
        errors.append("coverage floor mismatch")
    else:
        floor = load_obj(floor_path)
        if floor.get("covered_micro_windows") != authority.get("covered_micro_window_floor"):
            errors.append("coverage floor count mismatch")
        floor_windows = set(floor.get("covered_window_ids", []))
    epoch_rows = {row["assignment_id"]: row for row in load_jsonl(epoch / "manifests/assignment_manifest.jsonl")}
    all_windows: list[str] = []
    for row in rows:
        assignment_id = row.get("assignment_id")
        original = epoch_rows.get(assignment_id)
        if original is None:
            errors.append(f"unknown assignment:{assignment_id}")
            continue
        expected = dict(original)
        expected["assignment_record_sha256"] = sha(json.dumps(original, sort_keys=True, separators=(",", ":")).encode())
        if row != expected:
            errors.append(f"batch row differs from epoch assignment:{assignment_id}")
        all_windows.extend(row.get("micro_window_ids", []))
        intent_path = MACRO_ROOT / "dispatch" / args.batch_id / assignment_id / row["attempt_id"] / "dispatch_intent.json"
        if not intent_path.is_file():
            errors.append(f"missing intent:{assignment_id}")
            continue
        intent = load_obj(intent_path)
        if intent.get("assignment_id") != assignment_id or intent.get("batch_id") != args.batch_id:
            errors.append(f"intent identity mismatch:{assignment_id}")
        if intent.get("assignment_record_sha256") != row.get("assignment_record_sha256"):
            errors.append(f"intent assignment hash mismatch:{assignment_id}")
        capsule_path = Path(str(intent.get("capsule_ref")))
        if not capsule_path.is_file() or sha(capsule_path.read_bytes()) != intent.get("capsule_sha256"):
            errors.append(f"intent capsule mismatch:{assignment_id}")
        output = Path(str(intent.get("output_directory")))
        if not output.is_dir() or any(output.iterdir()):
            errors.append(f"output not empty:{assignment_id}")
        receipt = Path(str(intent.get("receipt_ref")))
        if receipt.exists():
            errors.append(f"receipt exists before dispatch:{assignment_id}")
        if intent.get("result_contract") != "write exactly one regular JSON file in output_directory; result.json recommended":
            errors.append(f"result contract mismatch:{assignment_id}")
        if leaf_prompt.get("schema_version") == "macro-leaf-prompt-v2":
            nested_contract = intent.get("nested_contract")
            if not isinstance(nested_contract, str) or "no unlisted nested keys" not in nested_contract or "source-unit-ref union" not in nested_contract:
                errors.append(f"nested result contract mismatch:{assignment_id}")
        if intent.get("terminal_contract") != "return PMR1 after payload; do not write terminal seal":
            errors.append(f"terminal contract mismatch:{assignment_id}")
    if len(all_windows) != len(set(all_windows)):
        errors.append("micro-window overlaps within batch")
    if "floor_windows" in locals() and set(all_windows) & floor_windows:
        errors.append("batch reassigns an already covered micro-window")
    if authority.get("pilot") is True:
        pilot = load_obj(epoch / "manifests/pilot_assignment_ids.json").get("assignment_ids")
        pilot_target = min(GLOBAL_CONCURRENCY, len(epoch_rows))
        if ids != pilot or len(rows) != pilot_target:
            errors.append("pilot selection mismatch")
        maximum_distinct_documents = min(
            pilot_target,
            len({row["document_path"] for row in epoch_rows.values()}),
        )
        if len({row["document_path"] for row in rows}) != maximum_distinct_documents:
            errors.append("pilot document diversity mismatch")
    prompt = leaf_prompt.get("prompt")
    prompt_lower = prompt.lower() if isinstance(prompt, str) else ""
    if not isinstance(prompt, str) or "exactly one" not in prompt_lower or "do not write any other file or terminal seal" not in prompt_lower:
        errors.append("leaf prompt does not encode simplified output contract")
    required_receipt_keys = {
        "audit_id", "schema_version", "epoch_id", "batch_id", "assignment_id", "attempt_id",
        "controller_thread_id", "agent_path", "task_thread_id", "model", "reasoning_effort",
        "fresh_child", "fork_turns", "dispatch_intent_sha256", "capsule_sha256", "output_directory",
    }
    if set(receipt_contract.get("required_keys", [])) != required_receipt_keys:
        errors.append("receipt contract key set mismatch")
    if receipt_contract.get("constants", {}).get("batch_id") != args.batch_id:
        errors.append("receipt contract batch mismatch")
    repo_root_leak = ROOT.parents[2] / "master" / "macro" / "dispatch"
    if repo_root_leak.exists() and any(path.is_file() for path in repo_root_leak.rglob("*")):
        errors.append("repo-root macro dispatch leak")
    report = {
        "audit_id": AUDIT_ID,
        "checker": "macro_batch_prelaunch_v1",
        "batch_id": args.batch_id,
        "epoch_id": authority.get("epoch_id"),
        "status": "pass" if not errors else "fail",
        "errors": sorted(set(errors)),
        "assignment_count": len(rows),
        "micro_window_count": len(all_windows),
        "batch_manifest_sha256": sha((batch / "batch_manifest.jsonl").read_bytes()),
        "authority_sha256": sha((batch / "batch_authority.json").read_bytes()),
        "activation_sha256": sha(activation_path.read_bytes()) if activation_path.is_file() else None,
    }
    print(json.dumps(report, indent=2, sort_keys=True))
    raise SystemExit(0 if not errors else 1)


if __name__ == "__main__":
    main()
