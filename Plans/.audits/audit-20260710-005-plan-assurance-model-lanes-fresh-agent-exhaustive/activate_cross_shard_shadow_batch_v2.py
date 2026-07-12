#!/usr/bin/env python3
"""Activate the 40-leaf shadow batch under lifecycle-aware v2 authority."""

from __future__ import annotations

import json
import subprocess

from cross_shard_shadow_common import (
    HARD_CAP,
    LUNA_CONTROLLER,
    POLICY_REF,
    POLICY_SHA256,
    SHADOW_BATCH,
    SHADOW_CONCURRENCY,
    SHADOW_EPOCH,
    SHADOW_ROOT,
    SOL_CONTROLLER,
    TEMPORARY_PRE_RESET_TARGET,
    load_obj,
    write_obj,
)
from macro_v2_common import AUDIT_ID, ROOT, sha


AUTHORITY_REF = "master/cross_shard_shadow/authorities/VALIDATOR_AUTHORITY_V2.json"


def main() -> None:
    validation = SHADOW_ROOT / "validation" / SHADOW_BATCH
    activation_path = validation / "activation.json"
    local_path = validation / "local-preactivation-v2.json"
    if activation_path.exists() or local_path.exists():
        raise RuntimeError("shadow v2 activation/local report already exists")
    authority_path = ROOT / AUTHORITY_REF
    authority = load_obj(authority_path)
    if authority.get("status") != "ACTIVE_FOR_LIFECYCLE_AWARE_PREACTIVATION":
        raise RuntimeError("shadow validator authority v2 is not active")
    for ref_key, sha_key in (
        ("v1_verifier_ref", "v1_verifier_sha256"),
        ("v1_activation_ref", "v1_activation_sha256"),
        ("v2_verifier_ref", "v2_verifier_sha256"),
        ("v2_activation_ref", "v2_activation_sha256"),
        ("luna_prelaunch_ref", "luna_prelaunch_sha256"),
        ("batch_authority_ref", "batch_authority_sha256"),
    ):
        path = ROOT / authority[ref_key]
        if not path.is_file() or sha(path.read_bytes()) != authority[sha_key]:
            raise RuntimeError(f"v2 bound artifact mismatch:{ref_key}")

    process = subprocess.run(
        ["python3", "-B", authority["v2_verifier_ref"]],
        cwd=ROOT, capture_output=True, text=True, check=False,
    )
    if process.returncode != 0 or not process.stdout.strip():
        raise RuntimeError(f"shadow v2 verifier failed:{process.stdout}:{process.stderr}")
    local = json.loads(process.stdout)
    if local.get("status") != "pass" or local.get("errors") != []:
        raise RuntimeError("shadow v2 local preactivation gate failed")

    luna_path = ROOT / authority["luna_prelaunch_ref"]
    luna = load_obj(luna_path)
    if not (
        luna.get("status") == "pass"
        and luna.get("errors") == []
        and luna.get("checker") == "cross_shard_shadow_luna_prelaunch_v1"
        and luna.get("controller_thread_id") == LUNA_CONTROLLER
        and luna.get("model") == "gpt-5.6-luna"
        and luna.get("reasoning_effort") == "max"
    ):
        raise RuntimeError("shadow Luna prelaunch did not pass exact identity gate")
    review_path = ROOT / authority["luna_v2_review_ref"]
    if not review_path.is_file():
        raise RuntimeError("shadow Luna v2 lifecycle review missing")
    review = load_obj(review_path)
    if not (
        review.get("status") == "pass"
        and review.get("errors") == []
        and review.get("checker") == "cross_shard_shadow_luna_lifecycle_v2"
        and review.get("controller_thread_id") == LUNA_CONTROLLER
        and review.get("model") == "gpt-5.6-luna"
        and review.get("reasoning_effort") == "max"
        and review.get("validator_authority_v2_sha256") == sha(authority_path.read_bytes())
        and review.get("v2_verifier_sha256") == authority["v2_verifier_sha256"]
        and review.get("v2_activation_sha256") == authority["v2_activation_sha256"]
        and review.get("luna_prelaunch_sha256") == authority["luna_prelaunch_sha256"]
    ):
        raise RuntimeError("shadow Luna v2 lifecycle review mismatch")

    expected_counts = {
        "assignments": 40,
        "shard_pairs": 11,
        "multi_shard_domains": 6,
        "provisional_features": 3888,
        "four_slice_pairs": 7,
        "three_slice_pairs": 4,
    }
    if luna.get("counts") != expected_counts or local.get("assignment_count") != SHADOW_CONCURRENCY:
        raise RuntimeError("shadow Luna/local counts mismatch")
    if local.get("strict_tests") != luna.get("strict_tests") or any(value is not True for value in local.get("strict_tests", {}).values()):
        raise RuntimeError("shadow local/Luna strict tests mismatch")
    compare = {
        "epoch_authority_sha256": local["epoch_authority_sha256"],
        "epoch_launch_seal_sha256": local["epoch_launch_seal_sha256"],
        "batch_authority_sha256": local["authority_sha256"],
        "batch_manifest_sha256": local["batch_manifest_sha256"],
        "leaf_prompt_sha256": local["leaf_prompt_sha256"],
        "receipt_contract_sha256": local["receipt_contract_sha256"],
        "concurrency_policy_sha256": POLICY_SHA256,
    }
    for key, expected in compare.items():
        if luna.get(key) != expected:
            raise RuntimeError(f"shadow local/Luna mismatch:{key}")

    validation.mkdir(parents=True, exist_ok=True)
    write_obj(local_path, local)
    activation = {
        "audit_id": AUDIT_ID,
        "schema_version": "cross-shard-shadow-batch-activation-v2",
        "epoch_id": SHADOW_EPOCH,
        "batch_id": SHADOW_BATCH,
        "status": "ACTIVE_FOR_EXACTLY_40_FRESH_SOL_XHIGH_LEAVES",
        "validator_authority_v2_ref": AUTHORITY_REF,
        "validator_authority_v2_sha256": sha(authority_path.read_bytes()),
        "local_preactivation_ref": local_path.relative_to(ROOT).as_posix(),
        "local_preactivation_sha256": sha(local_path.read_bytes()),
        "luna_prelaunch_ref": luna_path.relative_to(ROOT).as_posix(),
        "luna_prelaunch_sha256": sha(luna_path.read_bytes()),
        "luna_v2_review_ref": review_path.relative_to(ROOT).as_posix(),
        "luna_v2_review_sha256": sha(review_path.read_bytes()),
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
        "activation_script_sha256": authority["v2_activation_sha256"],
    }
    write_obj(activation_path, activation)
    print(json.dumps(activation, indent=2, sort_keys=True))


if __name__ == "__main__":
    main()
