#!/usr/bin/env python3
"""Terminal V31.2 fail-closed gate for temporally fresh prelaunch review."""
from __future__ import annotations

import json
import stat
import sys
from pathlib import Path
from typing import Any

sys.dont_write_bytecode = True
import verify_gate_v31_1 as base

HERE = Path(__file__).resolve().parent
SUPPLEMENT = HERE / "AUTHORITY_SUPPLEMENT_V31_2.json"
READINESS = HERE / "readiness-v31_2.json"
TEST_REPORT = HERE / "validation/test-report-v31_2.json"
REVIEW = HERE / "validation/luna-prelaunch-review-v31_2.json"
CAPTURE = HERE / "validation/controller-parent-native-identity-capture-v31_2.json"
REVIEW_SCHEMA = HERE / "schema/luna_prelaunch_review_v31_2.schema.json"
CAPTURE_SCHEMA = HERE / "schema/controller_parent_native_capture_v31_2.schema.json"

POPPER_SHA = "bd0a749e597fcb74c5347c85865c552c3f4a99a88543d754cf94ef7624fdd932"
CASE_DIGEST = "d708127ff162d57785cfe7d0bf5d2d7dc792b0e09675b97ffaec2457adc37ac7"
REQUIRED_REHASHES = {
    "immutable_authority": "45dadd69bd049298c2d551fcb58a916952a355a22c02f6c2f8be6ddf673517e1",
    "v31_1_supplement": "8f26b807d7d2366ec3a4ba11c6343666e6f1d61894bfa6869a32bdec74407f14",
    "gate_manifest": "85ceb853501881fb23dc7a6ce8dfb0d1700555ed8c15f2930a8424408701c1f0",
    "v31_1_verifier": "8f5ada680fb86dbd96e3d5e12ca84f59d7ab58d528b640891a1975e01cbd723a",
    "v31_1_test": "c03de6d3d9f827c483a2a4bdbf3f254586c5d2edfa2b77fb3186e8df806bdeb2",
    "v31_1_test_report": "960a1b2ac94b37c8249f10109dda8f1803009c84acf63e36212196b7124f0d7e",
}
REHASH_PATHS = {
    "immutable_authority": base.AUTHORITY,
    "v31_1_supplement": base.SUPPLEMENT,
    "gate_manifest": base.MANIFEST,
    "v31_1_verifier": HERE / "verify_gate_v31_1.py",
    "v31_1_test": HERE / "test_gate_v31_1.py",
    "v31_1_test_report": base.TEST_REPORT,
}
V31_2_STATIC_REQUIRED = {
    SUPPLEMENT,
    READINESS,
    TEST_REPORT,
    REVIEW_SCHEMA,
    CAPTURE_SCHEMA,
    HERE / "prepare_gate_v31_2.py",
    HERE / "verify_gate_v31_2.py",
    HERE / "test_gate_v31_2.py",
}
_original_expected_files = base.expected_files


def expected_files_with_v31_2(include_terminal: bool = True) -> set[Path]:
    files = _original_expected_files(include_terminal)
    files.update(V31_2_STATIC_REQUIRED)
    if REVIEW.exists():
        files.add(REVIEW)
    if CAPTURE.exists():
        files.add(CAPTURE)
    return files


def stable_inventory() -> dict[str, Any]:
    paths = (_original_expected_files(True) | V31_2_STATIC_REQUIRED) - {base.CAPTURE, REVIEW, CAPTURE}
    rows = []
    for path in sorted(paths, key=lambda item: str(item.relative_to(HERE))):
        binding = base.file_binding(path)
        rows.append({
            "path": str(path.relative_to(HERE)),
            "byte_count": binding["byte_count"],
            "raw_sha256": binding["raw_sha256"],
        })
    return {"file_count": len(rows), "raw_inventory_sha256": base.canonical_sha(rows)}


def review_errors(review: dict[str, Any], supplement: dict[str, Any], readiness: dict[str, Any]) -> list[str]:
    errors = [
        "review-schema:" + "/".join(str(part) for part in error.absolute_path) + ":" + error.message
        for error in base.Draft202012Validator(base.load(REVIEW_SCHEMA)).iter_errors(review)
    ]
    if errors:
        return sorted(set(errors))
    if review.get("artifact_rehashes") != REQUIRED_REHASHES:
        errors.append("review:required-rehashes")
    expected_v31_2 = {
        "supplement": base.file_binding(SUPPLEMENT)["raw_sha256"],
        "verifier": base.file_binding(HERE / "verify_gate_v31_2.py")["raw_sha256"],
        "test": base.file_binding(HERE / "test_gate_v31_2.py")["raw_sha256"],
        "test_report": base.file_binding(TEST_REPORT)["raw_sha256"],
        "readiness": base.file_binding(READINESS)["raw_sha256"],
    }
    if review.get("v31_2_bindings") != expected_v31_2:
        errors.append("review:v31-2-bindings")
    if review.get("stable_gate_inventory") != stable_inventory():
        errors.append("review:stable-gate-inventory")
    rerun = review.get("test_rerun", {})
    if rerun != {
        "command": "PYTHONDONTWRITEBYTECODE=1 python3 -B test_gate_v31_2.py",
        "status": "pass", "passed": 348, "total": 348, "failed": 0, "case_id_digest": CASE_DIGEST,
    }:
        errors.append("review:exact-348-rerun")
    if review.get("zero_state") != base.ZERO_STATE or review.get("activation_authorized") is not False:
        errors.append("review:zero-state-or-activation")
    temporal = review.get("temporal_scope", {})
    if temporal.get("prior_popper_report_sha256") != POPPER_SHA or temporal.get("prior_popper_authority_scope") != "exact_rejected_set_only" or temporal.get("prior_popper_not_gate_prelaunch_authority") is not True:
        errors.append("review:temporal-popper-boundary")
    if supplement.get("status") != "prepared_blocked_pending_new_fresh_luna_and_parent_capture" or readiness.get("status") != "pass_blocked":
        errors.append("review:gate-not-stably-blocked")
    return sorted(set(errors))


def capture_errors(capture: dict[str, Any], review: dict[str, Any], inventory: dict[str, Any]) -> list[str]:
    errors = [
        "capture-schema:" + "/".join(str(part) for part in error.absolute_path) + ":" + error.message
        for error in base.Draft202012Validator(base.load(CAPTURE_SCHEMA)).iter_errors(capture)
    ]
    if errors:
        return sorted(set(errors))
    expected_controller = base.load(base.POLICY_V32)["model_routing"]["luna_independent_reviewers"]["controller_thread_id"]
    if capture.get("parent_controller_thread_id") != expected_controller:
        errors.append("capture:parent-controller-thread")
    identity = capture.get("reviewer_native_identity", {})
    if identity.get("native_reviewer_thread_id") == expected_controller:
        errors.append("capture:reviewer-is-controller")
    review_binding = capture.get("review_report", {})
    if review_binding.get("path") != str(REVIEW) or review_binding.get("raw_sha256") != base.file_binding(REVIEW)["raw_sha256"]:
        errors.append("capture:review-report-binding")
    authorities = capture.get("authority_bindings", {})
    if authorities != {
        "immutable_authority": REQUIRED_REHASHES["immutable_authority"],
        "v31_1_supplement": REQUIRED_REHASHES["v31_1_supplement"],
        "v31_2_supplement": base.file_binding(SUPPLEMENT)["raw_sha256"],
        "stable_gate_inventory": inventory["raw_inventory_sha256"],
    }:
        errors.append("capture:authority-bindings")
    if capture.get("scope") != {"activation": False, "credit": 0, "result_writes": 0, "receipt_writes": 0, "sol_capture_rows": 0}:
        errors.append("capture:zero-scope")
    if review.get("report_identity_authority") != "non_authoritative_until_controller_capture":
        errors.append("capture:review-identity-authority")
    return sorted(set(errors))


def verify_gate() -> dict[str, Any]:
    errors: list[str] = []
    base.expected_files = expected_files_with_v31_2
    try:
        baseline = base.verify_gate(require_terminal=True)
    finally:
        base.expected_files = _original_expected_files
    if baseline.get("status") != "pass_blocked" or baseline.get("errors"):
        errors.extend("v31.1-baseline:" + item for item in baseline.get("errors", [baseline.get("status", "missing-status")]))

    try:
        supplement = base.load(SUPPLEMENT)
        readiness = base.load(READINESS)
        local_report = base.load(TEST_REPORT)
    except Exception as exc:
        return {"status": "fail_closed", "activation": False, "activation_authorized": False, "errors": ["load:" + type(exc).__name__ + ":" + str(exc)]}

    for label, path in REHASH_PATHS.items():
        observed = base.file_binding(path)["raw_sha256"]
        if observed != REQUIRED_REHASHES[label]:
            errors.append("required-rehash:" + label + ":" + observed)
    if supplement.get("required_rehashes") != REQUIRED_REHASHES:
        errors.append("supplement:required-rehashes")
    for label, binding in supplement.get("artifact_bindings", {}).items():
        errors.extend(base.binding_errors(binding, "supplement:" + label))
    prior = supplement.get("prior_luna_lineage", {})
    if prior != {
        "raw_sha256": POPPER_SHA,
        "authority_scope": "exact_rejected_set_only",
        "predates_v31_gate_bytes": True,
        "gate_prelaunch_authority": False,
        "activation_authority": False,
    }:
        errors.append("supplement:prior-luna-temporal-scope")
    if supplement.get("activation") is not False or supplement.get("activation_authorized") is not False or supplement.get("zero_state") != base.ZERO_STATE:
        errors.append("supplement:zero-state-or-activation")
    if readiness.get("supplement_authority_sha256") != base.file_binding(SUPPLEMENT)["raw_sha256"] or readiness.get("local_rerun_report_sha256") != base.file_binding(TEST_REPORT)["raw_sha256"]:
        errors.append("readiness:bindings")
    if readiness.get("activation") is not False or readiness.get("activation_authorized") is not False or readiness.get("zero_state") != base.ZERO_STATE:
        errors.append("readiness:zero-state-or-activation")
    if local_report.get("status") != "pass" or local_report.get("passed") != 348 or local_report.get("total") != 348 or local_report.get("failed") != 0 or local_report.get("case_id_digest") != CASE_DIGEST:
        errors.append("local-rerun:not-exact-348-pass")
    if local_report.get("test_source_sha256") != base.file_binding(HERE / "test_gate_v31_2.py")["raw_sha256"] or local_report.get("verifier_source_sha256") != REQUIRED_REHASHES["v31_1_verifier"]:
        errors.append("local-rerun:source-bindings")
    for path in (base.AUTHORITY, base.SUPPLEMENT, base.READINESS, SUPPLEMENT, READINESS, base.TEST_REPORT, TEST_REPORT):
        if stat.S_IMODE(path.stat().st_mode) != 0o444:
            errors.append("immutability:" + str(path.relative_to(HERE)))
    if base.CAPTURE.exists():
        errors.append("legacy-capture-path-obsolete-under-v31.2")

    inventory = stable_inventory()
    review_state = "required_absent"
    review: dict[str, Any] | None = None
    if REVIEW.exists():
        review_state = "present_invalid"
        try:
            review = base.load(REVIEW)
            problems = review_errors(review, supplement, readiness)
            errors.extend(problems)
            if not problems:
                review_state = "present_valid"
        except Exception as exc:
            errors.append("review:" + type(exc).__name__ + ":" + str(exc))

    capture_state = "required_absent"
    if CAPTURE.exists():
        capture_state = "present_invalid"
        if review_state != "present_valid" or review is None:
            errors.append("capture:valid-fresh-review-required-first")
        else:
            try:
                capture = base.load(CAPTURE)
                problems = capture_errors(capture, review, inventory)
                errors.extend(problems)
                if not problems:
                    capture_state = "present_valid"
            except Exception as exc:
                errors.append("capture:" + type(exc).__name__ + ":" + str(exc))

    blocking = ["activation_false", "separate_future_v32_activation_transaction_required"]
    if capture_state != "present_valid":
        blocking.insert(0, "controller_parent_native_identity_capture_v31_2_absent_or_invalid")
    if review_state != "present_valid":
        blocking.insert(0, "fresh_luna_max_post_stability_review_absent_or_invalid")
    status = "pass_blocked" if not errors else "fail_closed"
    return {
        "schema_version": "scenario-adversarial-semantic-repair-gate-v31.2-report-v1",
        "gate_id": base.GATE_ID,
        "status": status,
        "activation": False,
        "activation_authorized": False,
        "errors": sorted(set(errors)),
        "blocking_reasons": blocking,
        "prior_luna_lineage": {
            "raw_sha256": POPPER_SHA,
            "authority_scope": "exact_rejected_set_only",
            "gate_prelaunch_authority": False,
        },
        "fresh_luna_review": review_state,
        "parent_native_capture": capture_state,
        "stable_gate_inventory": inventory,
        "future_activation_policy_sha256": base.POLICY_V32_SHA,
        "counts": {
            "repair_assignments": baseline.get("counts", {}).get("repair_assignments", 0),
            "features": baseline.get("counts", {}).get("features", 0),
            "empty_output_directories": baseline.get("counts", {}).get("empty_output_directories", 0),
            "tests": 348,
            "results": 0,
            "receipts": 0,
            "sol_native_capture_rows": 0,
            "credit": 0,
            "spawned_children": 0,
        },
    }


def main() -> None:
    report = verify_gate()
    print(json.dumps(report, indent=2, sort_keys=True))
    raise SystemExit(0 if report["status"] == "pass_blocked" else 1)


if __name__ == "__main__":
    main()
