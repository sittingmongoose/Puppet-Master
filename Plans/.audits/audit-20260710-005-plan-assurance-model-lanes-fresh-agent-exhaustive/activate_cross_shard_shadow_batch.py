#!/usr/bin/env python3
"""Future-only fail-closed activation for the reverse-orientation shadow batch."""

from __future__ import annotations

import json
import subprocess

from cross_shard_shadow_common import (
    HARD_CAP, LUNA_CONTROLLER, POLICY_REF, POLICY_SHA256, SHADOW_BATCH, SHADOW_CONCURRENCY,
    SHADOW_EPOCH, SHADOW_ROOT, SOL_CONTROLLER, TEMPORARY_PRE_RESET_TARGET, load_obj, write_obj,
)
from macro_v2_common import AUDIT_ID, ROOT, sha


def main() -> None:
    validation = SHADOW_ROOT / "validation" / SHADOW_BATCH
    activation_path = validation / "activation.json"
    if activation_path.exists():
        raise RuntimeError("shadow activation already exists; refusing mutation")
    local_process = subprocess.run(["python3", "-B", "verify_cross_shard_shadow_batch.py"], cwd=ROOT, capture_output=True, text=True, check=False)
    if local_process.returncode != 0 or not local_process.stdout.strip():
        raise RuntimeError(f"shadow local batch verifier failed:{local_process.stdout}:{local_process.stderr}")
    local = json.loads(local_process.stdout)
    if local.get("status") != "pass" or local.get("errors") != []:
        raise RuntimeError("shadow local batch gate failed")
    luna_path = validation / "luna-prelaunch.json"
    if not luna_path.is_file():
        raise RuntimeError("shadow Luna prelaunch missing; activation is fail-closed")
    luna = load_obj(luna_path)
    if luna.get("status") != "pass" or luna.get("errors") != []:
        raise RuntimeError("shadow Luna prelaunch did not pass")
    if not (luna.get("checker") == "cross_shard_shadow_luna_prelaunch_v1" and luna.get("controller_thread_id") == LUNA_CONTROLLER and luna.get("model") == "gpt-5.6-luna" and luna.get("reasoning_effort") == "max"):
        raise RuntimeError("shadow Luna identity/model mismatch")
    epoch_local_path = SHADOW_ROOT / "validation" / SHADOW_EPOCH / "local-prelaunch.json"
    epoch_local = load_obj(epoch_local_path)
    compare = {
        "epoch_authority_sha256": local["epoch_authority_sha256"],
        "epoch_launch_seal_sha256": local["epoch_launch_seal_sha256"],
        "batch_authority_sha256": local["authority_sha256"],
        "batch_manifest_sha256": local["batch_manifest_sha256"],
        "leaf_prompt_sha256": local["leaf_prompt_sha256"],
        "receipt_contract_sha256": local["receipt_contract_sha256"],
        "epoch_local_prelaunch_sha256": sha(epoch_local_path.read_bytes()),
        "owner_active_sha256": epoch_local["owner_active_sha256"],
        "owner_provisional_ledger_sha256": epoch_local["owner_provisional_ledger_sha256"],
        "primary_pair_registry_topology_assertion_sha256": epoch_local["primary_pair_registry_topology_assertion_sha256"],
        "concurrency_policy_sha256": POLICY_SHA256,
    }
    for key, expected in compare.items():
        if luna.get(key) != expected:
            raise RuntimeError(f"shadow local/Luna mismatch:{key}")
    expected_counts = {"assignments": 40, "shard_pairs": 11, "multi_shard_domains": 6, "provisional_features": 3888, "four_slice_pairs": 7, "three_slice_pairs": 4}
    if luna.get("counts") != expected_counts:
        raise RuntimeError("shadow Luna counts mismatch")
    local_tests = local.get("strict_tests", {})
    luna_tests = luna.get("strict_tests", {})
    if not local_tests or local_tests != luna_tests or any(value is not True for value in local_tests.values()):
        raise RuntimeError("shadow local/Luna strict tests mismatch")
    validation.mkdir(parents=True, exist_ok=True)
    local_path = validation / "local-prelaunch.json"
    if local_path.exists():
        raise RuntimeError("shadow batch local prelaunch already exists")
    write_obj(local_path, local)
    activation = {
        "audit_id": AUDIT_ID,
        "schema_version": "cross-shard-shadow-batch-activation-v1",
        "epoch_id": SHADOW_EPOCH,
        "batch_id": SHADOW_BATCH,
        "status": "ACTIVE_FOR_EXACTLY_40_FRESH_SOL_XHIGH_LEAVES",
        "local_prelaunch_ref": local_path.relative_to(ROOT).as_posix(),
        "local_prelaunch_sha256": sha(local_path.read_bytes()),
        "luna_prelaunch_ref": luna_path.relative_to(ROOT).as_posix(),
        "luna_prelaunch_sha256": sha(luna_path.read_bytes()),
        "epoch_authority_sha256": local["epoch_authority_sha256"],
        "epoch_launch_seal_sha256": local["epoch_launch_seal_sha256"],
        "batch_authority_sha256": local["authority_sha256"],
        "batch_manifest_sha256": local["batch_manifest_sha256"],
        "assignment_count": SHADOW_CONCURRENCY,
        "controller_thread_id": SOL_CONTROLLER,
        "controller_model": "gpt-5.6-sol",
        "controller_reasoning_effort": "xhigh",
        "concurrency_policy_ref": POLICY_REF,
        "concurrency_policy_sha256": POLICY_SHA256,
        "temporary_pre_reset_target": TEMPORARY_PRE_RESET_TARGET,
        "hard_cap": HARD_CAP,
        "direct_fresh_children": True,
        "fork_turns": "none",
        "descendants_forbidden": True,
        "followup_messages_forbidden": True,
        "coverage_credit_granted_by_activation": 0,
        "canonical_plan_writes_authorized": False,
        "activation_script_sha256": sha((ROOT / "activate_cross_shard_shadow_batch.py").read_bytes()),
    }
    write_obj(activation_path, activation)
    print(json.dumps(activation, indent=2, sort_keys=True))


if __name__ == "__main__":
    main()
