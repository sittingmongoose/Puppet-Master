#!/usr/bin/env python3
"""Append-only V31.2 temporal-authority supplement and blocked readiness writer."""
from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

sys.dont_write_bytecode = True
import prepare_gate_v31 as writer
import verify_gate_v31_2 as gate

HERE = Path(__file__).resolve().parent


def assert_required_rehashes() -> None:
    mismatches = []
    for label, path in gate.REHASH_PATHS.items():
        observed = gate.base.file_binding(path)["raw_sha256"]
        if observed != gate.REQUIRED_REHASHES[label]:
            mismatches.append(f"{label}:{observed}")
    if mismatches:
        raise SystemExit("required-rehash-mismatch:" + ",".join(mismatches))


def build_supplement() -> None:
    if gate.SUPPLEMENT.exists():
        raise SystemExit("supplement-already-exists")
    assert_required_rehashes()
    report = gate.base.load(gate.TEST_REPORT)
    if report.get("status") != "pass" or report.get("passed") != 348 or report.get("total") != 348 or report.get("failed") != 0 or report.get("case_id_digest") != gate.CASE_DIGEST:
        raise SystemExit("local-rerun-not-exact-348-pass")
    if report.get("test_source_sha256") != gate.base.file_binding(HERE / "test_gate_v31_2.py")["raw_sha256"]:
        raise SystemExit("local-rerun-source-mismatch")
    binding_paths = {
        "immutable_authority": gate.base.AUTHORITY,
        "v31_1_supplement": gate.base.SUPPLEMENT,
        "gate_manifest": gate.base.MANIFEST,
        "v31_1_verifier": HERE / "verify_gate_v31_1.py",
        "v31_1_test": HERE / "test_gate_v31_1.py",
        "v31_1_test_report": gate.base.TEST_REPORT,
        "v31_2_verifier": HERE / "verify_gate_v31_2.py",
        "v31_2_test": HERE / "test_gate_v31_2.py",
        "v31_2_preparer": HERE / "prepare_gate_v31_2.py",
        "v31_2_local_rerun_report": gate.TEST_REPORT,
        "v31_2_luna_review_schema": gate.REVIEW_SCHEMA,
        "v31_2_controller_capture_schema": gate.CAPTURE_SCHEMA,
    }
    supplement = {
        "schema_version": "scenario-adversarial-semantic-repair-gate-authority-supplement-v31.2-v1",
        "gate_id": gate.base.GATE_ID,
        "audit_id": gate.base.AUDIT_ID,
        "status": "prepared_blocked_pending_new_fresh_luna_and_parent_capture",
        "append_only": True,
        "supersedes": "V31.1 temporal prelaunch authority interpretation and post-seal rerun reproducibility only",
        "preserves": {
            "v31_and_v31_1_contract_bytes": True,
            "v31_1_348_of_348_report_as_zero_credit_lineage": True,
            "v30_bytes": True,
            "results_or_receipts": 0,
            "activation_or_credit": 0,
        },
        "required_rehashes": gate.REQUIRED_REHASHES,
        "artifact_bindings": {label: gate.base.file_binding(path) for label, path in binding_paths.items()},
        "prior_luna_lineage": {
            "raw_sha256": gate.POPPER_SHA,
            "authority_scope": "exact_rejected_set_only",
            "predates_v31_gate_bytes": True,
            "gate_prelaunch_authority": False,
            "activation_authority": False,
        },
        "fresh_prelaunch_review": {
            "required": True,
            "state": "required_absent",
            "fixed_path": str(gate.REVIEW),
            "schema_path": str(gate.REVIEW_SCHEMA),
            "model": "gpt-5.6-luna",
            "reasoning_effort": "max",
            "fork_turns": "none",
            "fresh_direct": True,
            "must_begin_after_all_static_gate_bytes_stable": True,
            "must_be_temporally_and_natively_distinct_from_prior_popper": True,
            "must_rehash_required_artifacts": True,
            "must_rerun_exact_348_case_suite": True,
        },
        "controller_parent_native_capture": {
            "required": True,
            "state": "required_absent",
            "fixed_path": str(gate.CAPTURE),
            "schema_path": str(gate.CAPTURE_SCHEMA),
            "must_bind_fresh_review_raw_sha256": True,
            "must_attest_native_identity_and_popper_separation": True,
        },
        "stable_gate_inventory_contract": {
            "algorithm": "canonical-json-sha256-of-relative-path-byte-count-raw-sha256-rows-v1",
            "computed_by": str(HERE / "verify_gate_v31_2.py"),
            "dynamic_files_excluded": [str(gate.REVIEW), str(gate.CAPTURE), str(gate.base.CAPTURE)],
            "reviewer_must_record_live_digest_and_file_count": True,
        },
        "local_post_seal_rerun": {
            "report_path": str(gate.TEST_REPORT),
            "report_sha256": gate.base.file_binding(gate.TEST_REPORT)["raw_sha256"],
            "passed": 348,
            "total": 348,
            "failed": 0,
            "case_id_digest": gate.CASE_DIGEST,
        },
        "future_activation_policy_sha256": gate.base.POLICY_V32_SHA,
        "activation": False,
        "activation_authorized": False,
        "zero_state": gate.base.ZERO_STATE,
    }
    writer.write_json(gate.SUPPLEMENT, supplement)


def build_readiness() -> None:
    if gate.READINESS.exists():
        raise SystemExit("readiness-already-exists")
    if not gate.SUPPLEMENT.is_file() or not gate.TEST_REPORT.is_file():
        raise SystemExit("supplement-or-local-rerun-report-missing")
    supplement = gate.base.load(gate.SUPPLEMENT)
    if supplement.get("status") != "prepared_blocked_pending_new_fresh_luna_and_parent_capture":
        raise SystemExit("supplement-status-invalid")
    report = gate.base.load(gate.TEST_REPORT)
    readiness = {
        "schema_version": "scenario-adversarial-semantic-repair-gate-readiness-v31.2-v1",
        "gate_id": gate.base.GATE_ID,
        "status": "pass_blocked",
        "activation": False,
        "activation_authorized": False,
        "blocking_reasons": [
            "fresh_luna_max_post_stability_review_absent",
            "controller_parent_native_identity_capture_v31_2_absent",
            "activation_false",
            "separate_future_v32_activation_transaction_required",
        ],
        "supplement_authority_path": str(gate.SUPPLEMENT),
        "supplement_authority_sha256": gate.base.file_binding(gate.SUPPLEMENT)["raw_sha256"],
        "local_rerun_report_path": str(gate.TEST_REPORT),
        "local_rerun_report_sha256": gate.base.file_binding(gate.TEST_REPORT)["raw_sha256"],
        "tests": {
            "passed": 348,
            "total": 348,
            "failed": 0,
            "positive": 60,
            "negative": 288,
            "case_id_digest": gate.CASE_DIGEST,
            "category_counts": report.get("category_counts"),
        },
        "prior_luna_lineage": {
            "raw_sha256": gate.POPPER_SHA,
            "authority_scope": "exact_rejected_set_only",
            "gate_prelaunch_authority": False,
        },
        "fresh_luna_review": {"state": "required_absent", "fixed_path": str(gate.REVIEW)},
        "parent_native_capture": {"state": "required_absent", "fixed_path": str(gate.CAPTURE)},
        "prepared_counts": {"assignments": 6, "features": 687, "empty_output_directories": 6},
        "future_activation_policy_sha256": gate.base.POLICY_V32_SHA,
        "zero_state": gate.base.ZERO_STATE,
    }
    writer.write_json(gate.READINESS, readiness)


def main() -> None:
    parser = argparse.ArgumentParser()
    group = parser.add_mutually_exclusive_group(required=True)
    group.add_argument("--write-supplement", action="store_true")
    group.add_argument("--write-readiness", action="store_true")
    args = parser.parse_args()
    if args.write_supplement:
        build_supplement()
        result = {"status": "supplement_written", "path": str(gate.SUPPLEMENT)}
    else:
        build_readiness()
        result = {"status": "readiness_written", "path": str(gate.READINESS)}
    print(json.dumps(result, sort_keys=True))


if __name__ == "__main__":
    main()
