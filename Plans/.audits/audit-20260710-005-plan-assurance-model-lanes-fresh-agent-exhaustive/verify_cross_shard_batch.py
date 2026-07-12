#!/usr/bin/env python3
"""Fail-closed pre-dispatch verification for the cross-shard 32-leaf batch."""

from __future__ import annotations

import json
import subprocess
from pathlib import Path

from cross_shard_common import CROSS_ATTEMPT, CROSS_BATCH, CROSS_CONCURRENCY, CROSS_EPOCH, CROSS_ROOT, SOL_CONTROLLER, load_jsonl, load_obj
from macro_v2_common import ROOT, sha


def main() -> None:
    errors: list[str] = []
    batch = CROSS_ROOT / "batches" / CROSS_BATCH
    epoch = CROSS_ROOT / "frozen" / CROSS_EPOCH
    try:
        authority = load_obj(batch / "batch_authority.json")
        rows = load_jsonl(batch / "batch_manifest.jsonl")
        epoch_rows = load_jsonl(epoch / "manifests/assignment_manifest.jsonl")
        leaf_prompt = load_obj(batch / "leaf_prompt.json")
        receipt_contract = load_obj(batch / "receipt_contract.json")
        local = load_obj(ROOT / authority["epoch_local_prelaunch_ref"])
    except Exception as exc:
        print(json.dumps({"status": "fail", "errors": [f"load:{type(exc).__name__}:{exc}"]}, indent=2)); raise SystemExit(1)
    if authority.get("status") != "PREPARED_UNBOUND_ZERO_CREDIT" or authority.get("coverage_credit_before_validation") != 0:
        errors.append("authority status/credit mismatch")
    if len(rows) != CROSS_CONCURRENCY or authority.get("assignment_count") != CROSS_CONCURRENCY or authority.get("global_concurrency") != CROSS_CONCURRENCY:
        errors.append("batch count/concurrency mismatch")
    if sha((batch / "batch_manifest.jsonl").read_bytes()) != authority.get("batch_manifest_sha256") or sha((batch / "leaf_prompt.json").read_bytes()) != authority.get("leaf_prompt_sha256") or sha((batch / "receipt_contract.json").read_bytes()) != authority.get("receipt_contract_sha256"):
        errors.append("batch payload hash mismatch")
    if sha((epoch / "authority.json").read_bytes()) != authority.get("epoch_authority_sha256") or sha((epoch / "launch_seal.json").read_bytes()) != authority.get("epoch_launch_seal_sha256"):
        errors.append("epoch hash mismatch")
    if local.get("status") != "pass" or local.get("errors") != [] or sha((ROOT / authority["epoch_local_prelaunch_ref"]).read_bytes()) != authority.get("epoch_local_prelaunch_sha256"):
        errors.append("epoch local prelaunch mismatch")
    for ref_key, sha_key in (("primary_validator_ref", "primary_validator_sha256"), ("validator_test_ref", "validator_test_sha256"), ("epoch_verifier_ref", "epoch_verifier_sha256")):
        path = ROOT / authority[ref_key]
        if not path.is_file() or sha(path.read_bytes()) != authority[sha_key]: errors.append(f"executable binding mismatch:{ref_key}")
    if authority.get("controller_thread_id") != SOL_CONTROLLER or authority.get("controller_model") != "gpt-5.6-sol" or authority.get("controller_reasoning_effort") != "xhigh":
        errors.append("controller binding mismatch")
    ids = [row["assignment_id"] for row in rows]
    if ids != authority.get("assignment_ids") or ids != [row["assignment_id"] for row in epoch_rows] or len(ids) != len(set(ids)):
        errors.append("batch/epoch assignment set mismatch")
    epoch_by_id = {row["assignment_id"]: row for row in epoch_rows}
    for row in rows:
        assignment_id = row["assignment_id"]
        original = epoch_by_id[assignment_id]
        expected = dict(original)
        expected["assignment_record_sha256"] = sha(json.dumps(original, sort_keys=True, separators=(",", ":"), ensure_ascii=False).encode())
        if row != expected: errors.append(f"batch row mismatch:{assignment_id}")
        intent_path = CROSS_ROOT / "dispatch" / CROSS_BATCH / assignment_id / CROSS_ATTEMPT / "dispatch_intent.json"
        if not intent_path.is_file(): errors.append(f"intent missing:{assignment_id}"); continue
        intent = load_obj(intent_path)
        if intent.get("assignment_record_sha256") != row["assignment_record_sha256"] or intent.get("assignment_id") != assignment_id:
            errors.append(f"intent assignment mismatch:{assignment_id}")
        packet = Path(intent["packet_ref"]); schema = Path(intent["result_schema_ref"]); output = Path(intent["output_directory"]); receipt = Path(intent["receipt_ref"])
        if not packet.is_file() or sha(packet.read_bytes()) != row["packet_sha256"] or intent.get("packet_sha256") != row["packet_sha256"]:
            errors.append(f"intent packet mismatch:{assignment_id}")
        if not schema.is_file() or sha(schema.read_bytes()) != authority["strict_result_schema_sha256"]:
            errors.append(f"intent schema mismatch:{assignment_id}")
        if not output.is_dir() or any(output.iterdir()): errors.append(f"output not empty:{assignment_id}")
        if receipt.exists(): errors.append(f"receipt exists:{assignment_id}")
        if not (intent.get("fresh_child_required") is True and intent.get("fork_turns") == "none" and intent.get("descendants_forbidden") is True and intent.get("followup_messages_forbidden") is True and intent.get("coverage_credit_before_validation") == 0):
            errors.append(f"intent isolation/credit mismatch:{assignment_id}")
    prompt = leaf_prompt.get("prompt", "")
    for phrase in ("compare every comparator", "same product feature under the same authority and lifecycle", "do not message anyone or spawn subagents", "return exactly PMR1"):
        if phrase not in prompt: errors.append("leaf prompt contract missing"); break
    if set(receipt_contract.get("required_keys", [])) != {"audit_id", "schema_version", "epoch_id", "batch_id", "assignment_id", "attempt_id", "controller_thread_id", "agent_path", "task_thread_id", "model", "reasoning_effort", "fresh_child", "fork_turns", "dispatch_intent_sha256", "packet_sha256", "output_directory"}:
        errors.append("receipt contract keys mismatch")
    test = subprocess.run(["python3", authority["validator_test_ref"]], cwd=ROOT, capture_output=True, text=True, check=False)
    try: test_report = json.loads(test.stdout)
    except Exception: test_report = {"status": "fail", "strict_tests": {}}
    if test.returncode != 0 or test_report.get("status") != "pass" or any(value is not True for value in test_report.get("strict_tests", {}).values()):
        errors.append("validator strict tests failed")
    report = {
        "audit_id": authority.get("audit_id"), "checker": "cross_shard_batch_prelaunch_v1",
        "epoch_id": CROSS_EPOCH, "batch_id": CROSS_BATCH, "status": "pass" if not errors else "fail",
        "errors": sorted(set(errors)), "assignment_count": len(rows),
        "batch_manifest_sha256": sha((batch / "batch_manifest.jsonl").read_bytes()),
        "authority_sha256": sha((batch / "batch_authority.json").read_bytes()),
        "epoch_authority_sha256": sha((epoch / "authority.json").read_bytes()),
        "epoch_launch_seal_sha256": sha((epoch / "launch_seal.json").read_bytes()),
        "strict_tests": test_report.get("strict_tests", {}),
    }
    print(json.dumps(report, indent=2, sort_keys=True)); raise SystemExit(0 if not errors else 1)


if __name__ == "__main__": main()
