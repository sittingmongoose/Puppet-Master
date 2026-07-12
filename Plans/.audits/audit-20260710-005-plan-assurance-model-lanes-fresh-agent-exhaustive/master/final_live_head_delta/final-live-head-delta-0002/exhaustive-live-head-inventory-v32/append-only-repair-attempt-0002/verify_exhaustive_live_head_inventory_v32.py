#!/usr/bin/env python3
"""Repaired fail-closed verifier with independent HEAD-tree binding."""
from __future__ import annotations

import argparse
import importlib.util
import json
import pathlib
import sys

sys.dont_write_bytecode = True
HERE = pathlib.Path(__file__).resolve().parent
FAILED = HERE.parent

prep_spec = importlib.util.spec_from_file_location("prepare_exhaustive_live_head_inventory_v32", FAILED / "prepare_exhaustive_live_head_inventory_v32.py")
prep = importlib.util.module_from_spec(prep_spec)
assert prep_spec and prep_spec.loader
sys.modules["prepare_exhaustive_live_head_inventory_v32"] = prep
prep_spec.loader.exec_module(prep)
FAILED_REL = prep.NS_REL
FAILED_FILES = sorted(path.relative_to(FAILED).as_posix() for path in FAILED.rglob("*") if path.is_file() and not path.is_relative_to(HERE))
FAILED_HASHES = {ref: prep.sha((FAILED / ref).read_bytes()) for ref in FAILED_FILES}
prep.NS_REL = FAILED_REL / "append-only-repair-attempt-0002"
prep.NS = prep.REPO / prep.NS_REL
prep.OBS_REL = prep.NS_REL / "observations"
prep.OBS = prep.REPO / prep.OBS_REL

verify_spec = importlib.util.spec_from_file_location("audit005_inventory_base_verify_v32", FAILED / "verify_exhaustive_live_head_inventory_v32.py")
base = importlib.util.module_from_spec(verify_spec)
assert verify_spec and verify_spec.loader
verify_spec.loader.exec_module(base)

sha = base.sha
canon = base.canon
rows_raw = base.rows_raw
aggregate = base.aggregate


def load_bundle(live_check: bool = True):
    bundle = base.load_bundle(live_check=live_check)
    bundle["head_tree_actual"] = prep.head_tree()
    bundle["failed_staging_actual"] = {ref: prep.sha((FAILED / ref).read_bytes()) for ref in FAILED_FILES}
    return bundle


def validation_errors(bundle, live_check: bool = True):
    errors = list(base.validation_errors(bundle, live_check=live_check))
    if bundle.get("inventory_raw") != bundle.get("raw", {}).get("inventory.jsonl"):
        errors.append("inventory-raw-map-binding")
    tree = bundle.get("head_tree_actual", {})
    for index, row in enumerate(bundle.get("rows", [])):
        head = tree.get(row.get("path"))
        expected = {"present": head is not None, "mode": head["mode"] if head else None, "object_type": head["object_type"] if head else None, "blob_oid": head["blob_oid"] if head else None}
        if row.get("head") != expected:
            errors.append(f"inventory-head-binding:{index:03d}")
    authority = bundle.get("objects", {}).get("AUTHORITY_V32.json", {})
    repair = authority.get("append_only_repair", {})
    if repair.get("attempt") != "append-only-repair-attempt-0002" or repair.get("failed_staging_namespace") != FAILED_REL.as_posix() or repair.get("failed_staging_seal_sha256") != FAILED_HASHES.get("ARTIFACT_SEAL.json") or repair.get("failed_staging_bytes_modified") is not False:
        errors.append("failed-staging-repair-binding")
    if repair.get("failed_staging_files") != FAILED_HASHES:
        errors.append("failed-staging-file-map")
    for ref, expected_hash in FAILED_HASHES.items():
        if bundle.get("failed_staging_actual", {}).get(ref) != expected_hash:
            errors.append("failed-staging-predecessor-drift:" + ref)
    return sorted(set(errors))


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--no-live-check", action="store_true")
    args = parser.parse_args()
    try:
        bundle = load_bundle(live_check=not args.no_live_check)
        errors = validation_errors(bundle, live_check=not args.no_live_check)
    except Exception as exc:
        bundle = {"rows": []}
        errors = ["load-runtime:" + type(exc).__name__ + ":" + str(exc)]
    report = {
        "status": "pass_blocked" if not errors else "fail_closed", "control_status": prep.STATUS,
        "append_only_repair_attempt": "0002", "errors": errors,
        "inventory_paths": len(bundle.get("rows", [])), "expected_paths": 299,
        "content_state_sha256": aggregate(bundle.get("rows", [])).get("content_state_sha256") if bundle.get("rows") else None,
        "failed_staging_bytes_modified": False, "fresh_luna_exhaustive_inventory_gate_present": False,
        "activation_authorized": False, "zero_state": prep.ZERO,
    }
    print(json.dumps(report, indent=2, sort_keys=True))
    raise SystemExit(0 if not errors else 1)


if __name__ == "__main__":
    main()
