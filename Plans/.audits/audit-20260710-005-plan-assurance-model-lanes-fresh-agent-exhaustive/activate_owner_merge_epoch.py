#!/usr/bin/env python3
"""Activate owner merge only after local and replacement-Luna gates agree."""

from __future__ import annotations

import json
import subprocess

from macro_v2_common import AUDIT_ID, ROOT, load_obj, sha
from owner_merge_common import MAX_OWNER_CONCURRENCY, OWNER_EPOCH, OWNER_ROOT, write_obj


LUNA_CONTROLLER = "019f5078-6501-7223-b52f-2251010bdc41"


def main() -> None:
    validation = OWNER_ROOT / "validation" / OWNER_EPOCH
    activation_path = validation / "activation.json"
    if activation_path.exists():
        print(activation_path.read_text(), end="")
        return
    process = subprocess.run(
        ["python3", "verify_owner_merge_epoch.py"], cwd=ROOT,
        capture_output=True, text=True, check=False,
    )
    if process.returncode != 0 or not process.stdout.strip():
        raise RuntimeError(f"owner-merge local verifier failed:{process.stdout}:{process.stderr}")
    local = json.loads(process.stdout)
    if local.get("status") != "pass" or local.get("errors") != []:
        raise RuntimeError(f"owner-merge local gate failed:{local}")
    luna_path = validation / "luna-prelaunch.json"
    if not luna_path.is_file():
        raise RuntimeError("owner-merge Luna prelaunch missing")
    luna = load_obj(luna_path)
    if luna.get("status") != "pass" or luna.get("errors") != []:
        raise RuntimeError(f"owner-merge Luna gate failed:{luna}")
    if not (
        luna.get("checker") == "owner_merge_luna_controller_v1"
        and luna.get("controller_thread_id") == LUNA_CONTROLLER
        and luna.get("model") == "gpt-5.6-luna"
        and luna.get("reasoning_effort") == "max"
    ):
        raise RuntimeError("owner-merge Luna identity/model mismatch")
    for key in ("catalog_coverage_sha256", "local_feature_refs_digest", "authority_sha256", "launch_seal_sha256"):
        if luna.get(key) != local.get(key):
            raise RuntimeError(f"owner-merge local/Luna hash mismatch:{key}")
    for key, value in local["counts"].items():
        if luna.get("counts", {}).get(key) != value:
            raise RuntimeError(f"owner-merge local/Luna count mismatch:{key}")
    required_tests = {
        "valid_synthetic_passed",
        "extra_nested_key_rejected",
        "omitted_local_feature_rejected",
        "duplicate_membership_rejected",
        "cross_domain_merge_rejected",
        "source_union_mismatch_rejected",
    }
    tests = luna.get("strict_tests")
    if not isinstance(tests, dict) or set(tests) != required_tests or any(value is not True for value in tests.values()):
        raise RuntimeError("owner-merge strict-test evidence incomplete")
    validation.mkdir(parents=True, exist_ok=True)
    write_obj(validation / "local-prelaunch.json", local)
    activation = {
        "audit_id": AUDIT_ID,
        "schema_version": "owner-merge-activation-v1",
        "epoch_id": OWNER_EPOCH,
        "status": "ACTIVE_FOR_ONE_24_SHARD_OWNER_WAVE",
        "local_prelaunch_ref": (validation / "local-prelaunch.json").relative_to(ROOT).as_posix(),
        "local_prelaunch_sha256": sha((validation / "local-prelaunch.json").read_bytes()),
        "luna_prelaunch_ref": luna_path.relative_to(ROOT).as_posix(),
        "luna_prelaunch_sha256": sha(luna_path.read_bytes()),
        "catalog_coverage_sha256": local["catalog_coverage_sha256"],
        "local_feature_refs_digest": local["local_feature_refs_digest"],
        "authority_sha256": local["authority_sha256"],
        "launch_seal_sha256": local["launch_seal_sha256"],
        "assignment_count": local["counts"]["assignments"],
        "local_feature_count": local["counts"]["local_features"],
        "max_concurrency": MAX_OWNER_CONCURRENCY,
        "coverage_credit_granted_by_activation": 0,
        "canonical_plan_writes_authorized": False,
    }
    write_obj(activation_path, activation)
    epoch = OWNER_ROOT / "frozen" / OWNER_EPOCH
    for path in sorted(epoch.rglob("*"), reverse=True):
        path.chmod(0o444 if path.is_file() else 0o555)
    epoch.chmod(0o555)
    print(json.dumps(activation, indent=2, sort_keys=True))


if __name__ == "__main__":
    main()
