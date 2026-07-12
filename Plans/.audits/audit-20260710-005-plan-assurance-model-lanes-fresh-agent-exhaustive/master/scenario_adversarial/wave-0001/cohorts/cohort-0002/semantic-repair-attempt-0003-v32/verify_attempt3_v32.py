#!/usr/bin/env python3
"""Fail-closed terminal verifier for append-only attempt-0003 preparation."""
from __future__ import annotations

import collections
import importlib.metadata
import json
import os
import stat
import sys
from pathlib import Path
from typing import Any

sys.dont_write_bytecode = True
from jsonschema import Draft202012Validator

import attempt3_common as common
import preflight_attempt3_v32 as preflight

FIXTURE_MANIFEST = common.HERE / "fixtures/fixture_manifest.json"
SOURCE_FILES = {
    common.HERE / "attempt3_common.py",
    common.HERE / "prepare_attempt3_v32.py",
    common.HERE / "preflight_attempt3_v32.py",
    common.HERE / "test_attempt3_v32.py",
    common.HERE / "verify_attempt3_v32.py",
}
GENERATED_FILES = {
    common.AUTHORITY, common.RESULT_SCHEMA, common.TEMPLATE, common.PROMPT, common.ERROR_FAMILIES,
    common.ERROR_LOCALIZATION, common.VALIDATOR_ROWS, common.MANIFEST, common.TEST_MATRIX,
    FIXTURE_MANIFEST, common.TEST_REPORT, common.READINESS,
}
GENERATED_FILES.update(common.fixture_path(assignment_id) for assignment_id in common.ASSIGNMENTS)
GENERATED_FILES.update(common.obligation_packet_path(assignment_id) for assignment_id in common.ASSIGNMENTS)
GENERATED_FILES.update(common.intent_path(assignment_id) for assignment_id in common.ASSIGNMENTS)
EXPECTED_FILES = SOURCE_FILES | GENERATED_FILES


def binding_errors(binding: Any, label: str) -> list[str]:
    if not isinstance(binding, dict) or not isinstance(binding.get("path"), str):
        return [label + ":shape"]
    try:
        observed = common.file_binding(Path(binding["path"]))
    except Exception as exc:
        return [label + ":" + type(exc).__name__ + ":" + str(exc)]
    errors = []
    for key in ("byte_count", "raw_sha256"):
        if binding.get(key) != observed.get(key):
            errors.append(label + ":" + key)
    if "canonical_sha256" in binding and binding.get("canonical_sha256") != observed.get("canonical_sha256"):
        errors.append(label + ":canonical_sha256")
    return errors


def preseal_inventory() -> dict[str, Any]:
    files = sorted(path for path in common.HERE.rglob("*") if path.is_file() and path not in {common.READINESS, common.FUTURE_LUNA, common.FUTURE_CAPTURE, common.FUTURE_ACTIVATION})
    rows = []
    for path in files:
        raw = common.stable_read(path)
        rows.append({"path": path.relative_to(common.HERE).as_posix(), "byte_count": len(raw), "sha256": common.sha_bytes(raw)})
    return {"file_count": len(rows), "byte_count": sum(row["byte_count"] for row in rows), "inventory_sha256": common.canonical_sha(rows)}


def verify_localization(errors: list[str]) -> None:
    summary = common.load(common.ERROR_FAMILIES)
    localization = common.rows(common.ERROR_LOCALIZATION)
    if len(localization) != 15831 or [row.get("sequence") for row in localization] != list(range(1, 15832)):
        errors.append("localization:cardinality-or-sequence")
        return
    shared = {row["family"] for row in summary["shared"]}
    specific = {row["family"] for row in summary["assignment_specific"]}
    expected_counts = {row["family"]: row["count"] for row in summary["shared"] + summary["assignment_specific"]}
    aggregate_lines = []
    counts: collections.Counter[str] = collections.Counter()
    by_assignment: dict[str, list[str]] = {assignment_id: [] for assignment_id in common.ASSIGNMENTS}
    partitions: dict[str, collections.Counter[str]] = {assignment_id: collections.Counter() for assignment_id in common.ASSIGNMENTS}
    for row in localization:
        assignment_id = row.get("assignment_id")
        raw_error = row.get("raw_error")
        if assignment_id not in by_assignment or not isinstance(raw_error, str):
            errors.append("localization:row-shape")
            continue
        try:
            normalized = common.normalize_observed_error(raw_error)
        except Exception as exc:
            errors.append("localization:normalize:" + type(exc).__name__ + ":" + str(exc))
            continue
        classification = "shared" if normalized in shared else "assignment_specific" if normalized in specific else "unclassified"
        if row.get("normalized_family") != normalized or row.get("classification") != classification or classification == "unclassified":
            errors.append("localization:row-classification")
        aggregate_lines.append(assignment_id + "\t" + raw_error)
        by_assignment[assignment_id].append(raw_error)
        counts[normalized] += 1
        partitions[assignment_id][classification] += 1
    digest = common.sha_bytes("\n".join(aggregate_lines).encode("utf-8"))
    if digest != common.LOCALIZATION_DIGEST or dict(counts) != expected_counts:
        errors.append("localization:aggregate-or-family-counts")
    for assignment_id in common.ASSIGNMENTS:
        total = common.ERROR_TOTALS[assignment_id]
        assignment_digest = common.sha_bytes("\n".join(by_assignment[assignment_id]).encode("utf-8"))
        if len(by_assignment[assignment_id]) != total["count"] or assignment_digest != total["digest"]:
            errors.append("localization:assignment:" + assignment_id)
        if dict(partitions[assignment_id]) != summary["assignment_partition"][assignment_id]:
            errors.append("localization:partition:" + assignment_id)


def verify() -> dict[str, Any]:
    errors: list[str] = []
    runtime = {
        "python_version": ".".join(str(value) for value in sys.version_info[:3]),
        "python_executable": sys.executable,
        "jsonschema_version": importlib.metadata.version("jsonschema"),
        "validator_class": f"{Draft202012Validator.__module__}.{Draft202012Validator.__name__}",
        "pythonpath": os.environ.get("PYTHONPATH"),
        "no_site": bool(sys.flags.no_site), "no_user_site": bool(sys.flags.no_user_site), "dont_write_bytecode": bool(sys.flags.dont_write_bytecode),
    }
    if runtime["python_version"] != "3.12.13" or runtime["jsonschema_version"] != "4.26.0" or runtime["pythonpath"] != str(common.JSONSCHEMA_SITE) or not runtime["no_site"] or not runtime["no_user_site"] or not runtime["dont_write_bytecode"]:
        errors.append("runtime:not-audit-pinned")
    actual_files = {path for path in common.HERE.rglob("*") if path.is_file()}
    missing = sorted(str(path.relative_to(common.HERE)) for path in EXPECTED_FILES - actual_files)
    foreign = sorted(str(path.relative_to(common.HERE)) for path in actual_files - EXPECTED_FILES)
    if missing:
        errors.append("namespace:missing:" + ",".join(missing))
    if foreign:
        errors.append("namespace:foreign:" + ",".join(foreign))
    if any("luna" in path.name.lower() and "postrun" in path.name.lower() for path in common.HERE.rglob("*")):
        errors.append("namespace:attempt3-luna-postrun-forbidden")
    for path in (common.FUTURE_LUNA, common.FUTURE_CAPTURE, common.FUTURE_ACTIVATION):
        if path.exists():
            errors.append("future-artifact-must-remain-absent:" + str(path.relative_to(common.HERE)))
    if errors:
        return {"status": "fail_closed", "activation": False, "launch": False, "errors": sorted(set(errors)), "runtime": runtime}
    try:
        authority = common.load(common.AUTHORITY)
        readiness = common.load(common.READINESS)
        report = common.load(common.TEST_REPORT)
        manifest = common.rows(common.MANIFEST)
    except Exception as exc:
        return {"status": "fail_closed", "activation": False, "launch": False, "errors": ["load:" + type(exc).__name__ + ":" + str(exc)], "runtime": runtime}
    try:
        Draft202012Validator.check_schema(common.load(common.RESULT_SCHEMA))
    except Exception as exc:
        errors.append("result-schema:" + type(exc).__name__ + ":" + str(exc))
    for label, expected in common.TREE_BASELINES.items():
        observed = common.tree_inventory(Path(expected["path"]))
        if observed != expected:
            errors.append("upstream-tree:" + label)
    upstream_expected = {
        "primary_report": common.PRIMARY_SHA,
        "activation_envelope": common.ACTIVATION_SHA,
        "native_capture": common.CAPTURE_SHA,
        "frozen_semantic_validator": common.FROZEN_VALIDATOR_SHA,
        "policy_v32": common.POLICY_V32_SHA,
    }
    for label, expected_sha in upstream_expected.items():
        binding = authority.get("upstream", {}).get(label)
        errors.extend(binding_errors(binding, "authority-upstream:" + label))
        if isinstance(binding, dict) and binding.get("raw_sha256") != expected_sha:
            errors.append("authority-upstream-sha:" + label)
    for label, binding in authority.get("source_bindings", {}).items():
        errors.extend(binding_errors(binding, "authority-source:" + label))
    for label, binding in authority.get("artifact_bindings", {}).items():
        errors.extend(binding_errors(binding, "authority-artifact:" + label))
    for assignment_id in common.ASSIGNMENTS:
        pair = authority.get("attempt2_result_receipt_bindings", {}).get(assignment_id, {})
        for kind in ("result", "receipt"):
            errors.extend(binding_errors(pair.get(kind), f"attempt2:{assignment_id}:{kind}"))
            if isinstance(pair.get(kind), dict) and pair[kind].get("raw_sha256") != common.ATTEMPT2_ARTIFACTS[assignment_id][kind]:
                errors.append(f"attempt2:{assignment_id}:{kind}:sha")
    if authority.get("assignment_ids") != common.ASSIGNMENTS or authority.get("feature_count") != 687 or authority.get("zero_state") != common.ZERO_STATE:
        errors.append("authority:set-count-zero-state")
    if any(authority.get(key) is not False for key in ("activation", "activation_authorized", "launch", "launch_authorized")):
        errors.append("authority:activation-or-launch")
    projection = authority.get("compatibility_projection", {})
    if projection.get("changed_fields_only") != ["schema_version", "attempt_id", "task_thread_id"] or projection.get("true_attempt3_validation_first") is not True or projection.get("semantic_payload_preserved") is not True:
        errors.append("authority:compatibility-projection")
    verify_localization(errors)
    if len(manifest) != 6 or [row.get("assignment_id") for row in manifest] != common.ASSIGNMENTS or sum(int(row.get("feature_count", 0)) for row in manifest) != 687:
        errors.append("manifest:set-or-count")
    question_total = 0
    empty_outputs = 0
    clean_fixtures = 0
    identities = set()
    for row in manifest:
        assignment_id = row.get("assignment_id")
        if assignment_id not in common.ASSIGNMENTS:
            continue
        packet = common.load(common.obligation_packet_path(assignment_id))
        expected_mappings = common.question_obligations(assignment_id)
        by_feature = {item["provisional_feature_ref"]: item for item in packet.get("features", [])}
        packet_questions = 0
        for feature_ref, mappings in expected_mappings.items():
            observed = by_feature.get(feature_ref, {}).get("question_to_scenario_mapping")
            if observed != mappings:
                errors.append("question-mapping-packet:" + assignment_id + ":" + feature_ref)
            packet_questions += len(mappings)
        if packet_questions != common.QUESTION_COUNTS[assignment_id] or packet.get("question_count") != packet_questions:
            errors.append("question-count:" + assignment_id)
        question_total += packet_questions
        fixture = common.load(common.fixture_path(assignment_id))
        fixture_errors = preflight.result_errors(fixture, assignment_id)
        if fixture_errors:
            errors.append("fixture:" + assignment_id + ":" + json.dumps(fixture_errors[:10], sort_keys=True))
        else:
            clean_fixtures += 1
        output = common.output_directory(assignment_id)
        inventory = common.output_inventory(output)
        if inventory:
            errors.append("output-not-empty:" + assignment_id)
        else:
            empty_outputs += 1
        if any(path.name in {"result.json", "terminal_receipt.json", "native_capture.json"} for path in output.rglob("*")):
            errors.append("output-result-receipt-capture-forbidden:" + assignment_id)
        intent = common.load(common.intent_path(assignment_id))
        identity = intent.get("identity", {})
        identities.add(identity.get("canonical_agent_path"))
        if identity.get("state") != "reserved_unallocated" or identity.get("native_child_thread_id") is not None or identity.get("model") != "gpt-5.6-sol" or identity.get("reasoning_effort") != "ultra":
            errors.append("identity:" + assignment_id)
        if any(intent.get(key) is not False for key in ("activation", "launch")) or intent.get("credit") != 0:
            errors.append("intent-zero-state:" + assignment_id)
    if question_total != 713 or clean_fixtures != 6 or empty_outputs != 6 or len(identities) != 6:
        errors.append("prepared-counts")
    if report.get("status") != "pass" or report.get("passed") != 1024 or report.get("total") != 1024 or report.get("failed") != 0 or report.get("observed_family_coverage", {}).get("missing") != []:
        errors.append("tests:not-exact-1024-pass")
    report_runtime = report.get("runtime", {})
    for key in ("python_version", "jsonschema_version", "validator_class"):
        if report_runtime.get(key) != runtime.get(key):
            errors.append("tests:runtime:" + key)
    if readiness.get("status") != "pass_blocked" or readiness.get("errors") != [] or readiness.get("zero_state") != common.ZERO_STATE:
        errors.append("readiness:status-or-zero-state")
    if readiness.get("preseal_inventory") != preseal_inventory():
        errors.append("readiness:preseal-inventory")
    for key in ("python_version", "jsonschema_version", "validator_class"):
        if readiness.get("runtime", {}).get(key) != runtime.get(key):
            errors.append("readiness:runtime:" + key)
    errors.extend(binding_errors(readiness.get("authority"), "readiness:authority"))
    errors.extend(binding_errors(readiness.get("test_report"), "readiness:test-report"))
    for path in GENERATED_FILES:
        if stat.S_IMODE(path.stat().st_mode) != 0o444:
            errors.append("immutability:" + str(path.relative_to(common.HERE)))
    status = "pass_blocked" if not errors else "fail_closed"
    final_inventory = common.tree_inventory(common.HERE)
    return {
        "schema_version": "scenario-adversarial-attempt3-terminal-verification-v32-v1",
        "gate_id": common.GATE_ID,
        "status": status,
        "errors": sorted(set(errors)),
        "blocking_reasons": ["future_fresh_luna_max_prelaunch_absent", "controller_parent_native_capture_absent", "separate_activation_transaction_absent", "activation_false", "launch_false"],
        "runtime": runtime,
        "counts": {"assignments": 6, "features": 687, "questions": question_total, "clean_fixture_shapes": clean_fixtures, "tests": report.get("total", 0), "empty_output_directories": empty_outputs, "results": 0, "receipts": 0, "capture_rows": 0, "credit": 0, "spawned_children": 0},
        "observed_error_partition": {"families": 51, "rows": 15831, "aggregate_digest_sha256": common.LOCALIZATION_DIGEST},
        "attempt3_inventory": final_inventory,
        "activation": False, "activation_authorized": False, "launch": False, "launch_authorized": False,
        "fresh_luna_prelaunch": "required_absent", "parent_native_capture": "required_absent", "separate_activation": "required_absent",
    }


def main() -> None:
    report = verify()
    print(json.dumps(report, indent=2, sort_keys=True))
    raise SystemExit(0 if report["status"] == "pass_blocked" else 1)


if __name__ == "__main__":
    main()
