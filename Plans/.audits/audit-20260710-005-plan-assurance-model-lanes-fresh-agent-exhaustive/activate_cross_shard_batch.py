#!/usr/bin/env python3
"""Activate the 32-leaf cross-shard batch after local and Luna gates agree."""

from __future__ import annotations

import json
import subprocess

from cross_shard_common import (
    CROSS_ATTEMPT, CROSS_BATCH, CROSS_CONCURRENCY, CROSS_EPOCH, CROSS_ROOT,
    LUNA_CONTROLLER, SOL_CONTROLLER, load_jsonl, load_obj, write_obj,
)
from macro_v2_common import AUDIT_ID, ROOT, sha


REQUIRED_TESTS = {
    "valid_synthetic_passed", "extra_nested_key_rejected", "omitted_anchor_rejected",
    "foreign_comparator_rejected", "candidate_related_overlap_rejected",
    "incomplete_comparison_count_rejected",
}


def main() -> None:
    validation = CROSS_ROOT / "validation" / CROSS_BATCH
    activation_path = validation / "activation.json"
    if activation_path.exists():
        print(activation_path.read_text(), end=""); return
    process = subprocess.run(["python3", "verify_cross_shard_batch.py"], cwd=ROOT, capture_output=True, text=True, check=False)
    if process.returncode != 0 or not process.stdout.strip():
        raise RuntimeError(f"cross-shard local batch verifier failed:{process.stdout}:{process.stderr}")
    local = json.loads(process.stdout)
    if local.get("status") != "pass" or local.get("errors") != []:
        raise RuntimeError("cross-shard local batch gate failed")
    epoch_local_path = CROSS_ROOT / "validation" / CROSS_EPOCH / "local-prelaunch.json"
    epoch_local = load_obj(epoch_local_path)
    luna_path = validation / "luna-prelaunch.json"
    if not luna_path.is_file(): raise RuntimeError("cross-shard Luna prelaunch missing")
    luna = load_obj(luna_path)
    if luna.get("status") != "pass" or luna.get("errors") != []:
        raise RuntimeError(f"cross-shard Luna gate failed:{luna}")
    if not (luna.get("checker") == "cross_shard_luna_prelaunch_v1" and luna.get("controller_thread_id") == LUNA_CONTROLLER and luna.get("model") == "gpt-5.6-luna" and luna.get("reasoning_effort") == "max"):
        raise RuntimeError("cross-shard Luna identity/model mismatch")
    compare = {
        "epoch_authority_sha256": local["epoch_authority_sha256"],
        "epoch_launch_seal_sha256": local["epoch_launch_seal_sha256"],
        "batch_authority_sha256": local["authority_sha256"],
        "batch_manifest_sha256": local["batch_manifest_sha256"],
        "epoch_local_prelaunch_sha256": sha(epoch_local_path.read_bytes()),
        "owner_active_sha256": epoch_local["owner_active_sha256"],
        "owner_provisional_ledger_sha256": epoch_local["owner_provisional_ledger_sha256"],
    }
    for key, expected in compare.items():
        if luna.get(key) != expected: raise RuntimeError(f"cross-shard local/Luna mismatch:{key}")
    if luna.get("counts") != {"assignments": 32, "shard_pairs": 11, "multi_shard_domains": 6, "provisional_features": 3888}:
        raise RuntimeError("cross-shard Luna counts mismatch")
    for name, report in (("local", local), ("luna", luna)):
        tests = report.get("strict_tests")
        if not isinstance(tests, dict) or set(tests) != REQUIRED_TESTS or any(value is not True for value in tests.values()):
            raise RuntimeError(f"cross-shard {name} strict tests incomplete")
    validation.mkdir(parents=True, exist_ok=True)
    write_obj(validation / "local-prelaunch.json", local)
    policy_path = ROOT / "master/coordination/CONCURRENCY_POLICY_V2.json"
    activation = {
        "audit_id": AUDIT_ID, "schema_version": "cross-shard-batch-activation-v1",
        "epoch_id": CROSS_EPOCH, "batch_id": CROSS_BATCH,
        "status": "ACTIVE_FOR_EXACTLY_32_FRESH_SOL_XHIGH_LEAVES",
        "local_prelaunch_ref": (validation / "local-prelaunch.json").relative_to(ROOT).as_posix(),
        "local_prelaunch_sha256": sha((validation / "local-prelaunch.json").read_bytes()),
        "luna_prelaunch_ref": luna_path.relative_to(ROOT).as_posix(), "luna_prelaunch_sha256": sha(luna_path.read_bytes()),
        "epoch_authority_sha256": local["epoch_authority_sha256"], "epoch_launch_seal_sha256": local["epoch_launch_seal_sha256"],
        "batch_authority_sha256": local["authority_sha256"], "batch_manifest_sha256": local["batch_manifest_sha256"],
        "assignment_count": CROSS_CONCURRENCY, "controller_thread_id": SOL_CONTROLLER,
        "controller_model": "gpt-5.6-sol", "controller_reasoning_effort": "xhigh",
        "concurrency_policy_ref": policy_path.relative_to(ROOT).as_posix(), "concurrency_policy_sha256": sha(policy_path.read_bytes()),
        "direct_fresh_children": True, "fork_turns": "none", "descendants_forbidden": True,
        "followup_messages_forbidden": True, "coverage_credit_granted_by_activation": 0,
        "canonical_plan_writes_authorized": False,
        "activation_script_sha256": sha((ROOT / "activate_cross_shard_batch.py").read_bytes()),
    }
    write_obj(activation_path, activation)
    epoch = CROSS_ROOT / "frozen" / CROSS_EPOCH
    batch = CROSS_ROOT / "batches" / CROSS_BATCH
    for base in (epoch, batch):
        for path in sorted(base.rglob("*"), reverse=True): path.chmod(0o444 if path.is_file() else 0o555)
        base.chmod(0o555)
    for assignment in load_jsonl(batch / "batch_manifest.jsonl"):
        attempt_dir = CROSS_ROOT / "dispatch" / CROSS_BATCH / assignment["assignment_id"] / CROSS_ATTEMPT
        (attempt_dir / "dispatch_intent.json").chmod(0o444); attempt_dir.chmod(0o755)
    print(json.dumps(activation, indent=2, sort_keys=True))


if __name__ == "__main__": main()
