#!/usr/bin/env python3
"""Append-only repair for the failed first local seal; predecessor bytes stay immutable."""
from __future__ import annotations

import importlib.util
import json
import pathlib
import sys

sys.dont_write_bytecode = True
HERE = pathlib.Path(__file__).resolve().parent
FAILED = HERE.parent
BASE_PATH = FAILED / "prepare_exhaustive_live_head_inventory_v32.py"
spec = importlib.util.spec_from_file_location("audit005_inventory_base_prep_v32", BASE_PATH)
base = importlib.util.module_from_spec(spec)
assert spec and spec.loader
spec.loader.exec_module(base)

FAILED_REL = base.NS_REL
FAILED_FILES = sorted(path.relative_to(FAILED).as_posix() for path in FAILED.rglob("*") if path.is_file() and not path.is_relative_to(HERE))
FAILED_HASHES = {ref: base.sha((FAILED / ref).read_bytes()) for ref in FAILED_FILES}
FAILED_SEAL_SHA = FAILED_HASHES["ARTIFACT_SEAL.json"]

base.NS_REL = FAILED_REL / "append-only-repair-attempt-0002"
base.NS = base.REPO / base.NS_REL
base.OBS_REL = base.NS_REL / "observations"
base.OBS = base.REPO / base.OBS_REL

original_schema = base.schema
original_write = base.write_new


def corrected_schema():
    result = original_schema()
    result["properties"]["head"]["allOf"][0]["then"]["properties"]["mode"] = {"enum": ["100644", "100755"]}
    return result


def intercepted_write(path: pathlib.Path, raw: bytes) -> None:
    if path.name in {"AUTHORITY_V32.json", "readiness.json", "terminal-preparation-report.json"}:
        obj = json.loads(raw)
        obj["append_only_repair"] = {
            "attempt": "append-only-repair-attempt-0002",
            "failed_staging_namespace": FAILED_REL.as_posix(),
            "failed_staging_seal_sha256": FAILED_SEAL_SHA,
            "failed_staging_status": "FAIL_CLOSED_LOCAL_VALIDATION",
            "failed_staging_verifier_errors": ["inventory-schema:022"],
            "failed_staging_test_passed": 311,
            "failed_staging_test_total": 352,
            "failed_staging_files": FAILED_HASHES,
            "failed_staging_bytes_modified": False,
            "repair": "permit tracked HEAD mode 100755 while preserving exact working mode 100644; add independent HEAD-tree binding in repaired verifier",
        }
        if path.name == "AUTHORITY_V32.json":
            obj["transaction_id"] = "final-live-head-delta-0002-exhaustive-live-head-inventory-v32-append-only-repair-attempt-0002"
        raw = base.pretty(obj)
    original_write(path, raw)


base.schema = corrected_schema
base.write_new = intercepted_write

if __name__ == "__main__":
    base.main()
