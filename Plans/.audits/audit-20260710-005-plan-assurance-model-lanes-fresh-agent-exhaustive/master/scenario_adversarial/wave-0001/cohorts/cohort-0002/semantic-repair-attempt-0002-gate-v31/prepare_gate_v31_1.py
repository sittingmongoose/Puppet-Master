#!/usr/bin/env python3
"""Append-only V31.1 verifier/test supplement and terminal readiness writer."""
from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

sys.dont_write_bytecode = True
import prepare_gate_v31 as base

HERE = Path(__file__).resolve().parent
SUPPLEMENT = HERE / "AUTHORITY_SUPPLEMENT_V31_1.json"
READINESS = HERE / "readiness.json"
TEST_REPORT = HERE / "validation/test-report-v31_1.json"


def build_supplement() -> None:
    if SUPPLEMENT.exists():
        raise SystemExit("supplement-already-exists")
    authority = base.AUTHORITY
    if not authority.is_file():
        raise SystemExit("base-authority-missing")
    supplement = {
        "schema_version": "scenario-adversarial-semantic-repair-gate-authority-supplement-v31.1-v1",
        "gate_id": base.GATE_ID,
        "audit_id": base.AUDIT_ID,
        "status": "prepared_blocked_pending_parent_native_capture",
        "append_only": True,
        "supersedes": "V31 verifier/test harness only",
        "base_authority": base.file_binding(authority),
        "preserved_contract_artifacts": True,
        "preserved_v30_bindings": True,
        "preserved_luna_binding_sha256": base.LUNA_SHA,
        "preserved_primary_binding_sha256": base.PRIMARY_SHA,
        "future_activation_policy_sha256": base.POLICY_V32_SHA,
        "corrective_lineage": {
            "first_isolated_run_passed": 319,
            "first_isolated_run_total": 348,
            "first_isolated_run_report_written": False,
            "defects": [
                "late-bound evidence-fixture selection in test closures",
                "DNS label grammar did not reject leading-hyphen host labels"
            ],
            "result_or_receipt_artifacts_affected": False,
            "activation_or_credit_affected": False
        },
        "artifact_bindings": {
            "terminal_verifier": base.file_binding(HERE / "verify_gate_v31_1.py"),
            "terminal_tests": base.file_binding(HERE / "test_gate_v31_1.py"),
            "supplement_preparer": base.file_binding(HERE / "prepare_gate_v31_1.py"),
            "test_matrix": base.file_binding(HERE / "test_matrix.json")
        },
        "terminal_test_contract": {
            "minimum": 300,
            "exact_total": 348,
            "positive": 60,
            "negative": 288,
            "report_path": str(TEST_REPORT)
        },
        "parent_native_capture": {
            "required": True,
            "fixed_path": str(base.CAPTURE),
            "state": "required_absent"
        },
        "activation": False,
        "activation_authorized": False,
        "zero_state": base.ZERO_STATE
    }
    base.write_json(SUPPLEMENT, supplement)


def build_readiness() -> None:
    if READINESS.exists():
        raise SystemExit("readiness-already-exists")
    if not SUPPLEMENT.is_file() or not TEST_REPORT.is_file():
        raise SystemExit("supplement-or-test-report-missing")
    report = base.load(TEST_REPORT)
    if report.get("status") != "pass" or report.get("passed") != 348 or report.get("total") != 348 or report.get("failed") != 0:
        raise SystemExit("test-report-not-exact-348-pass")
    readiness = {
        "schema_version": "scenario-adversarial-semantic-repair-gate-readiness-v31.1-v1",
        "gate_id": base.GATE_ID,
        "status": "pass_blocked",
        "activation": False,
        "activation_authorized": False,
        "authority_path": str(base.AUTHORITY),
        "authority_sha256": base.file_binding(base.AUTHORITY)["raw_sha256"],
        "supplement_authority_path": str(SUPPLEMENT),
        "supplement_authority_sha256": base.file_binding(SUPPLEMENT)["raw_sha256"],
        "test_report_path": str(TEST_REPORT),
        "test_report_sha256": base.file_binding(TEST_REPORT)["raw_sha256"],
        "tests": {
            "passed": 348,
            "total": 348,
            "failed": 0,
            "positive": 60,
            "negative": 288,
            "case_id_digest": report["case_id_digest"],
            "category_counts": report["category_counts"]
        },
        "luna_confirmation": {
            "state": "accepted_exact_rejected_set_confirmation_prelaunch",
            "path": str(base.LUNA),
            "raw_sha256": base.LUNA_SHA,
            "embedded_identity_authority": "non_authoritative"
        },
        "parent_native_capture": {
            "state": "required_absent" if not base.CAPTURE.exists() else "present_requires_verification",
            "fixed_path": str(base.CAPTURE)
        },
        "future_activation_policy": {
            "path": str(base.POLICY_V32),
            "raw_sha256": base.POLICY_V32_SHA,
            "required_for_future_activation": True
        },
        "blocking_reasons": [
            "controller_parent_native_identity_capture_absent",
            "activation_false",
            "separate_future_activation_transaction_required"
        ],
        "prepared_counts": {
            "assignments": 6,
            "features": 687,
            "fresh_identities_reserved": 6,
            "empty_output_directories": 6
        },
        "zero_state": base.ZERO_STATE
    }
    base.write_json(READINESS, readiness)


def main() -> None:
    parser = argparse.ArgumentParser()
    group = parser.add_mutually_exclusive_group(required=True)
    group.add_argument("--write-supplement", action="store_true")
    group.add_argument("--write-readiness", action="store_true")
    args = parser.parse_args()
    if args.write_supplement:
        build_supplement()
        print(json.dumps({"status": "supplement_written", "path": str(SUPPLEMENT)}, sort_keys=True))
    else:
        build_readiness()
        print(json.dumps({"status": "readiness_written", "path": str(READINESS)}, sort_keys=True))


if __name__ == "__main__":
    main()
