#!/usr/bin/env python3
"""Activate the owner-merge dispatch batch only after local and Luna gates agree."""

from __future__ import annotations

import json
import subprocess

from macro_v2_common import AUDIT_ID, ROOT, sha
from owner_merge_common import MAX_OWNER_CONCURRENCY, OWNER_ATTEMPT, OWNER_ROOT, load_jsonl, load_obj, write_obj
from prepare_owner_merge_batch import BATCH_ID, SOL_CONTROLLER


LUNA_CONTROLLER = "019f5078-6501-7223-b52f-2251010bdc41"
REQUIRED_TESTS = {
    "valid_synthetic_passed", "extra_nested_key_rejected", "omitted_local_feature_rejected",
    "duplicate_membership_rejected", "cross_domain_merge_rejected", "source_union_mismatch_rejected",
}


def main() -> None:
    validation = OWNER_ROOT / "validation" / BATCH_ID
    activation_path = validation / "activation.json"
    if activation_path.exists():
        print(activation_path.read_text(), end="")
        return
    process = subprocess.run(
        ["python3", "verify_owner_merge_batch.py"], cwd=ROOT,
        capture_output=True, text=True, check=False,
    )
    if process.returncode != 0 or not process.stdout.strip():
        raise RuntimeError(f"owner-merge batch local verifier failed:{process.stdout}:{process.stderr}")
    local = json.loads(process.stdout)
    if local.get("status") != "pass" or local.get("errors") != []:
        raise RuntimeError(f"owner-merge batch local gate failed:{local}")
    luna_path = validation / "luna-prelaunch.json"
    if not luna_path.is_file():
        raise RuntimeError("owner-merge batch Luna prelaunch missing")
    luna = load_obj(luna_path)
    if luna.get("status") != "pass" or luna.get("errors") != []:
        raise RuntimeError(f"owner-merge batch Luna gate failed:{luna}")
    if not (
        luna.get("checker") == "owner_merge_batch_luna_prelaunch_v1"
        and luna.get("controller_thread_id") == LUNA_CONTROLLER
        and luna.get("model") == "gpt-5.6-luna"
        and luna.get("reasoning_effort") == "max"
    ):
        raise RuntimeError("owner-merge batch Luna identity/model mismatch")
    compare = {
        "assignment_count": local["assignment_count"],
        "local_feature_count": local["local_feature_count"],
        "batch_manifest_sha256": local["batch_manifest_sha256"],
        "authority_sha256": local["authority_sha256"],
        "epoch_activation_sha256": local["activation_sha256"],
    }
    for key, expected in compare.items():
        if luna.get(key) != expected:
            raise RuntimeError(f"owner-merge batch local/Luna mismatch:{key}")
    for report_name, report in (("local", local), ("luna", luna)):
        tests = report.get("strict_tests")
        if not isinstance(tests, dict) or set(tests) != REQUIRED_TESTS or any(value is not True for value in tests.values()):
            raise RuntimeError(f"owner-merge batch {report_name} strict tests incomplete")

    validation.mkdir(parents=True, exist_ok=True)
    write_obj(validation / "local-prelaunch.json", local)
    activation = {
        "audit_id": AUDIT_ID,
        "schema_version": "owner-merge-batch-activation-v1",
        "batch_id": BATCH_ID,
        "status": "ACTIVE_FOR_EXACTLY_24_FRESH_SOL_XHIGH_LEAVES",
        "local_prelaunch_ref": (validation / "local-prelaunch.json").relative_to(ROOT).as_posix(),
        "local_prelaunch_sha256": sha((validation / "local-prelaunch.json").read_bytes()),
        "luna_prelaunch_ref": luna_path.relative_to(ROOT).as_posix(),
        "luna_prelaunch_sha256": sha(luna_path.read_bytes()),
        "batch_manifest_sha256": local["batch_manifest_sha256"],
        "batch_authority_sha256": local["authority_sha256"],
        "epoch_activation_sha256": local["activation_sha256"],
        "assignment_count": local["assignment_count"],
        "local_feature_count": local["local_feature_count"],
        "controller_thread_id": SOL_CONTROLLER,
        "controller_model": "gpt-5.6-sol",
        "controller_reasoning_effort": "xhigh",
        "max_concurrency": MAX_OWNER_CONCURRENCY,
        "direct_fresh_children": True,
        "fork_turns": "none",
        "followup_messages_forbidden": True,
        "coverage_credit_granted_by_activation": 0,
        "canonical_plan_writes_authorized": False,
        "activation_script_sha256": sha((ROOT / "activate_owner_merge_batch.py").read_bytes()),
    }
    write_obj(activation_path, activation)

    batch = OWNER_ROOT / "batches" / BATCH_ID
    for path in sorted(batch.rglob("*"), reverse=True):
        path.chmod(0o444 if path.is_file() else 0o555)
    batch.chmod(0o555)
    assignments = load_jsonl(batch / "batch_manifest.jsonl")
    for assignment in assignments:
        attempt_dir = OWNER_ROOT / "dispatch" / BATCH_ID / assignment["assignment_id"] / OWNER_ATTEMPT
        intent = attempt_dir / "dispatch_intent.json"
        intent.chmod(0o444)
        attempt_dir.chmod(0o755)
    print(json.dumps(activation, indent=2, sort_keys=True))


if __name__ == "__main__":
    main()
