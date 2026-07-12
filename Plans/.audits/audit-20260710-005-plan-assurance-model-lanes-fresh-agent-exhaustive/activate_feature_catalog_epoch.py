#!/usr/bin/env python3
"""Activate the feature-catalog epoch only after local and Luna gates agree."""

from __future__ import annotations

import json
import subprocess

from feature_catalog_common import CATALOG_EPOCH, CATALOG_ROOT, MAX_CATALOG_CONCURRENCY, ROOT, load_obj, sha, write_obj


def main() -> None:
    validation = CATALOG_ROOT / "validation" / CATALOG_EPOCH
    activation_path = validation / "activation.json"
    if activation_path.exists():
        print(activation_path.read_text(), end="")
        return
    process = subprocess.run(
        ["python3", "verify_feature_catalog_epoch.py"],
        cwd=ROOT,
        capture_output=True,
        text=True,
        check=False,
    )
    if process.returncode != 0 or not process.stdout.strip():
        raise RuntimeError(f"local feature-catalog verification failed:{process.stdout}:{process.stderr}")
    local = json.loads(process.stdout)
    if local.get("status") != "pass" or local.get("errors") != []:
        raise RuntimeError(f"local feature-catalog gate failed:{local}")
    luna_path = validation / "luna-prelaunch.json"
    if not luna_path.is_file():
        raise RuntimeError("Luna feature-catalog prelaunch report missing")
    luna = load_obj(luna_path)
    if luna.get("status") != "pass" or luna.get("errors") != []:
        raise RuntimeError(f"Luna feature-catalog gate failed:{luna}")
    if not (
        luna.get("checker") == "feature_catalog_luna_controller_v1"
        and luna.get("controller_thread_id") == "019f4d26-0582-7f71-8aa9-57bcfc354488"
        and luna.get("model") == "gpt-5.6-luna"
        and luna.get("reasoning_effort") == "max"
    ):
        raise RuntimeError("Luna feature-catalog identity/model attestation mismatch")
    for key in ("macro_coverage_sha256", "atom_ids_digest", "authority_sha256", "launch_seal_sha256"):
        if luna.get(key) != local.get(key):
            raise RuntimeError(f"local/Luna feature-catalog hash mismatch:{key}")
    luna_counts = luna.get("counts", {})
    for key, value in local.get("counts", {}).items():
        if luna_counts.get(key) != value:
            raise RuntimeError(f"local/Luna feature-catalog count mismatch:{key}")
    expected_extra_counts = {
        "assignment_wave_max": 24,
        "packet_bytes_max": local["packet_bytes_max"],
        "packet_bytes_cap": 200000,
        "covered_micro_windows": 1269,
        "pending_micro_windows": 0,
        "macro_transaction_count": 12,
    }
    for key, value in expected_extra_counts.items():
        if luna_counts.get(key) != value:
            raise RuntimeError(f"Luna feature-catalog extra count mismatch:{key}")
    required_tests = {
        "valid_synthetic_passed",
        "extra_nested_key_rejected",
        "invalid_owner_domain_rejected",
        "missing_research_question_rejected",
        "omitted_atom_rejected",
        "duplicate_atom_across_features_rejected",
        "omitted_family_key_mapping_rejected",
    }
    tests = luna.get("strict_tests")
    if not isinstance(tests, dict) or set(tests) != required_tests or any(value is not True for value in tests.values()):
        raise RuntimeError("Luna feature-catalog strict-test evidence incomplete")
    validation.mkdir(parents=True, exist_ok=True)
    write_obj(validation / "local-prelaunch.json", local)
    activation = {
        "audit_id": local["audit_id"],
        "schema_version": "feature-catalog-activation-v1",
        "epoch_id": CATALOG_EPOCH,
        "status": "ACTIVE_FOR_ONE_BOUNDED_CATALOG_WAVE",
        "local_prelaunch_ref": (validation / "local-prelaunch.json").relative_to(ROOT).as_posix(),
        "local_prelaunch_sha256": sha((validation / "local-prelaunch.json").read_bytes()),
        "luna_prelaunch_ref": luna_path.relative_to(ROOT).as_posix(),
        "luna_prelaunch_sha256": sha(luna_path.read_bytes()),
        "macro_coverage_sha256": local["macro_coverage_sha256"],
        "atom_ids_digest": local["atom_ids_digest"],
        "authority_sha256": local["authority_sha256"],
        "launch_seal_sha256": local["launch_seal_sha256"],
        "assignment_count": local["counts"]["assignments"],
        "atom_count": local["counts"]["atoms"],
        "max_concurrency": MAX_CATALOG_CONCURRENCY,
        "coverage_credit_granted_by_activation": 0,
        "canonical_plan_writes_authorized": False,
    }
    write_obj(activation_path, activation)
    epoch = CATALOG_ROOT / "frozen" / CATALOG_EPOCH
    for path in sorted(epoch.rglob("*"), reverse=True):
        path.chmod(0o444 if path.is_file() else 0o555)
    epoch.chmod(0o555)
    print(json.dumps(activation, indent=2, sort_keys=True))


if __name__ == "__main__":
    main()
