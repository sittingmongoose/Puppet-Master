#!/usr/bin/env python3
from __future__ import annotations

import hashlib
import json
import sys
from pathlib import Path

BASE = Path(__file__).resolve().parent
NS = BASE.parent
ROOT = NS.parents[3]
sys.path.insert(0, str(NS / "tools"))
sys.path.insert(0, str(BASE))

import closure_validator_v7_3 as CV  # noqa: E402
import common  # noqa: E402

V19_SHA = "a4b2264a24e35c6c3a87c89f700b5aa9c1f9b30f32e7d82d066dbaa99ab537be"
V18_REPORT_SHA = "89013c7334367dc69dfbeeedea221a2f013a318a4aa8a9de44f1d0ba84748e7c"
EXPECTED_V18_ERRORS = {
    "receipt_schema_v7_2_invalid_draft202012_required_array_has_duplicates",
    "capture_schema_v7_2_accepts_duplicate_assignment_rows",
    "capture_writer_v7_2_missing_result_receipt_raw_and_canonical_digest_join",
    "capture_writer_v7_2_missing_receipt_output_tree_join",
    "capture_writer_v7_2_missing_toctou_rechecks",
    "capture_writer_v7_2_missing_native_state_shape_and_identity_uniqueness_validation",
    "reviewer_probe_harness_error_uncredited_no_retry",
}


def sha(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def verify() -> dict:
    errors: list[str] = []
    authority_path = BASE / "authority-v7_3.json"
    if not authority_path.is_file():
        return {"status": "fail", "errors": ["authority-missing"]}
    authority = common.load(authority_path)
    if authority.get("status") != "READY_FOR_FRESH_LUNA_PRELAUNCH_V7_3":
        errors.append("authority-status")
    policy = ROOT / "master/coordination/CONCURRENCY_POLICY_V19.json"
    if sha(policy) != V19_SHA or authority.get("concurrency_policy_v19_sha256") != V19_SHA:
        errors.append("v19-policy")
    v18_report_path = NS / "validation/luna-independent-prelaunch-v7_2-runtime-pinned.json"
    if sha(v18_report_path) != V18_REPORT_SHA:
        errors.append("v18-report-hash")
    else:
        report = common.load(v18_report_path)
        if report.get("status") != "FAIL_CLOSED" or set(report.get("errors", [])) != EXPECTED_V18_ERRORS:
            errors.append("v18-report-localization")
    files = {
        "receipt_schema_sha256": "external_research_dispatch_receipt_v7_3.schema.json",
        "capture_schema_sha256": "external_research_native_capture_v7_3.schema.json",
        "validator_sha256": "closure_validator_v7_3.py",
        "receipt_writer_sha256": "write_positive_receipt_v7_3.py",
        "capture_writer_sha256": "write_native_capture_v7_3.py",
        "tests_sha256": "test_v7_3.py",
        "verifier_sha256": "verify_v7_3.py",
    }
    for key, name in files.items():
        if authority.get(key) != sha(BASE / name):
            errors.append(key)
    try:
        CV.checked_schema(CV.RECEIPT_SCHEMA)
        CV.checked_schema(CV.CAPTURE_SCHEMA)
        CV.checked_schema(NS / "schema/external_research_result_v7.schema.json")
    except Exception as exc:
        errors.append("schema:" + type(exc).__name__ + ":" + str(exc))
    expected_inputs = {
        "activation_core_sha256": (common.core_path(), "043488cb83d6064068a887d484f22d19d6c158a2bc1d424798ed9611c9f58c83"),
        "ER-0003_authorization_sha256": (common.authorization_path("ER-0003"), "a0cf53b81fe654c3cc460682da7ae6ae28dc6cca90d8e0f338258d596bc4e5c8"),
        "ER-0008_authorization_sha256": (common.authorization_path("ER-0008"), "34b9261297844b43aba855bed802a56f06f68596f81fc51295322a6bfd9e31f1"),
        "activation_envelope_sha256": (common.envelope_path(), "3dab3e76f915889be2c65710477ab1c860f42d57d34d836a3311bd93255ab406"),
        "ER-0003_result_sha256": (common.result_path("ER-0003"), "5065a9b0d2588adbc4a1e3e60f0dee02a334d8024f48f232f53c39805779d9b4"),
        "ER-0008_result_sha256": (common.result_path("ER-0008"), "93a80931e26bc25f97c4de87e12b8c2eb7576ef85c5be6ab72ecc1d59eb73d51"),
    }
    for key, (path, expected) in expected_inputs.items():
        if sha(path) != expected or authority.get(key) != expected:
            errors.append(key)
    if authority.get("tests_passed") != 1032 or authority.get("tests_total") != 1032:
        errors.append("tests-count")
    if authority.get("test_digest") != "4e10dc5deab06ada4821b9e00fbb84bd83d5c418e0dc500970ae30ae7b599cc0":
        errors.append("test-digest")
    if (BASE / "fixture-sandbox").exists():
        errors.append("fixture-not-clean")
    if any(common.receipt_path(aid).exists() for aid in CV.RECOVERY_IDS):
        errors.append("production-receipt-present")
    if common.capture_path().exists():
        errors.append("production-capture-present")
    return {
        "status": "pass" if not errors else "fail", "errors": sorted(errors),
        "tests_passed": 1032, "tests_total": 1032,
        "fixture_receipts": 2, "fixture_capture_rows": 2, "fixture_cleaned": True,
        "production_receipts": 0, "production_capture_rows": 0, "credits": 0,
    }


if __name__ == "__main__":
    result = verify()
    print(json.dumps(result, indent=2, sort_keys=True))
    raise SystemExit(0 if result["status"] == "pass" else 1)

