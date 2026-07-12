#!/usr/bin/env python3
"""Activate a macro epoch only after local reconstruction and Luna validation agree."""

from __future__ import annotations

import argparse
import json
import subprocess
from pathlib import Path

from macro_v2_common import AUDIT_ID, MACRO_ROOT, ROOT, load_obj, sha, write_obj


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--epoch", default="epoch-0015")
    args = parser.parse_args()
    validation = MACRO_ROOT / "validation" / args.epoch
    activation_path = validation / "activation.json"
    if activation_path.exists():
        print(activation_path.read_text(), end="")
        return
    process = subprocess.run(
        ["python3", "verify_macro_epoch.py", "--epoch", args.epoch, "--source-epoch", "epoch-0013"],
        cwd=ROOT,
        capture_output=True,
        text=True,
        check=False,
    )
    if not process.stdout.strip():
        raise RuntimeError(f"local verifier emitted no JSON: {process.stderr}")
    local = json.loads(process.stdout)
    if process.returncode != 0 or local.get("status") != "pass" or local.get("errors") != []:
        raise RuntimeError(f"local macro verification failed: {local}")
    luna_v2_path = validation / "luna-controller-prelaunch-v2.json"
    luna_path = luna_v2_path if luna_v2_path.is_file() else validation / "luna-controller-prelaunch.json"
    if not luna_path.is_file():
        raise RuntimeError("Luna controller prelaunch report missing")
    luna = load_obj(luna_path)
    if luna.get("status") != "pass" or luna.get("errors") != []:
        raise RuntimeError(f"Luna prelaunch verification failed: {luna}")
    if not (
        luna.get("checker") in {"macro_epoch_luna_controller_v1", "macro_epoch_luna_controller_v2"}
        and luna.get("controller_thread_id") == "019f4d26-0582-7f71-8aa9-57bcfc354488"
        and luna.get("model") == "gpt-5.6-luna"
        and luna.get("reasoning_effort") == "max"
    ):
        raise RuntimeError("Luna controller identity/model attestation mismatch")
    for key in ("canonical_source_root_sha256", "authority_sha256", "launch_seal_sha256"):
        if luna.get(key) != local.get(key):
            raise RuntimeError(f"local/Luna {key} mismatch")
    if local.get("coverage_seed_sha256") is not None and luna.get("coverage_seed_sha256") != local.get("coverage_seed_sha256"):
        raise RuntimeError("local/Luna coverage seed hash mismatch")
    expected_counts = local.get("counts", {})
    if set(expected_counts) != {"micro_windows", "seeded_windows", "assigned_windows", "macro_assignments", "pilot_assignments"}:
        raise RuntimeError("local count schema mismatch")
    for key, value in expected_counts.items():
        if luna.get("counts", {}).get(key) != value:
            raise RuntimeError(f"local/Luna count mismatch: {key}")
    if luna.get("checker") == "macro_epoch_luna_controller_v2":
        strict_tests = luna.get("strict_schema_tests")
        required_tests = {
            "valid_synthetic_passed",
            "extra_nested_key_rejected",
            "wrong_type_rejected",
            "missing_source_unit_coverage_rejected",
            "segment_item_union_mismatch_rejected",
        }
        if not isinstance(strict_tests, dict) or set(strict_tests) != required_tests or any(value is not True for value in strict_tests.values()):
            raise RuntimeError("Luna strict-schema negative-test evidence incomplete")
    validation.mkdir(parents=True, exist_ok=True)
    write_obj(validation / "local-prelaunch.json", local, immutable=True)
    epoch = MACRO_ROOT / "frozen" / args.epoch
    activation = {
        "audit_id": AUDIT_ID,
        "schema_version": "macro-epoch-activation-v1",
        "epoch_id": args.epoch,
        "status": "ACTIVE_FOR_24_WORKER_MACRO_REVIEW",
        "local_prelaunch_ref": (validation / "local-prelaunch.json").relative_to(ROOT).as_posix(),
        "local_prelaunch_sha256": sha((validation / "local-prelaunch.json").read_bytes()),
        "luna_prelaunch_ref": luna_path.relative_to(ROOT).as_posix(),
        "luna_prelaunch_sha256": sha(luna_path.read_bytes()),
        "authority_sha256": local["authority_sha256"],
        "launch_seal_sha256": local["launch_seal_sha256"],
        "canonical_source_root_sha256": local["canonical_source_root_sha256"],
        "coverage_seed_sha256": local.get("coverage_seed_sha256"),
        "micro_window_total": expected_counts["micro_windows"],
        "seeded_micro_windows": expected_counts["seeded_windows"],
        "assigned_micro_windows": expected_counts["assigned_windows"],
        "macro_assignment_total": expected_counts["macro_assignments"],
        "concurrency": 24,
        "canonical_plan_writes_authorized": False,
        "coverage_credit_granted_by_activation": 0,
    }
    write_obj(activation_path, activation, immutable=True)
    for path in sorted(epoch.rglob("*"), reverse=True):
        path.chmod(0o444 if path.is_file() else 0o555)
    epoch.chmod(0o555)
    print(json.dumps(activation, indent=2, sort_keys=True))


if __name__ == "__main__":
    main()
