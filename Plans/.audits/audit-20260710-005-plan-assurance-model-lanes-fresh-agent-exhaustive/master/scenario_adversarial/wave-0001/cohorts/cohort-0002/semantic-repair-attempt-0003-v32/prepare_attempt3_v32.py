#!/usr/bin/env python3
"""Append-only deterministic preparation and seal writer for attempt-0003 V32."""
from __future__ import annotations

import argparse
import collections
import importlib.util
import json
import sys
from pathlib import Path
from typing import Any

sys.dont_write_bytecode = True
from jsonschema import Draft202012Validator

import attempt3_common as common

FIXTURE_MANIFEST = common.HERE / "fixtures/fixture_manifest.json"
SOURCE_FILES = [
    common.HERE / "attempt3_common.py",
    common.HERE / "prepare_attempt3_v32.py",
    common.HERE / "preflight_attempt3_v32.py",
    common.HERE / "test_attempt3_v32.py",
    common.HERE / "verify_attempt3_v32.py",
]


def attempt2_paths(assignment_id: str) -> tuple[Path, Path]:
    root = common.GATE / f"outputs/{assignment_id}/attempt-0002"
    return root / "result.json", root / "terminal_receipt.json"


def assert_upstream() -> dict[str, Any]:
    expected_files = {
        common.PRIMARY: common.PRIMARY_SHA,
        common.ACTIVATION_ENVELOPE: common.ACTIVATION_SHA,
        common.CAPTURE: common.CAPTURE_SHA,
        common.FROZEN_VALIDATOR: common.FROZEN_VALIDATOR_SHA,
        common.POLICY_V32: common.POLICY_V32_SHA,
    }
    for assignment_id in common.ASSIGNMENTS:
        result_path, receipt_path = attempt2_paths(assignment_id)
        expected_files[result_path] = common.ATTEMPT2_ARTIFACTS[assignment_id]["result"]
        expected_files[receipt_path] = common.ATTEMPT2_ARTIFACTS[assignment_id]["receipt"]
    mismatches = []
    for path, expected in expected_files.items():
        observed = common.file_binding(path)["raw_sha256"]
        if observed != expected:
            mismatches.append(f"{path}:{observed}")
    if mismatches:
        raise ValueError("upstream-hash-mismatch:" + ",".join(mismatches))
    observed_trees: dict[str, Any] = {}
    for label, expected in common.TREE_BASELINES.items():
        observed = common.tree_inventory(Path(expected["path"]))
        observed_trees[label] = observed
        if observed != expected:
            raise ValueError("upstream-tree-mismatch:" + label + ":" + json.dumps(observed, sort_keys=True))
    primary = common.load(common.PRIMARY)
    if primary.get("status") != "fail_closed" or primary.get("sets", {}).get("rejected") != common.ASSIGNMENTS:
        raise ValueError("primary-rejected-set-or-status")
    counts = primary.get("count_closure", {})
    if counts.get("total_semantic_error_count") != 15831 or counts.get("authority_feature_count") != 687 or counts.get("semantically_valid_result_count") != 0:
        raise ValueError("primary-count-closure")
    by_assignment = {row["assignment_id"]: row for row in primary.get("assignments", [])}
    for assignment_id in common.ASSIGNMENTS:
        row = by_assignment.get(assignment_id, {})
        result = row.get("result", {})
        receipt = row.get("terminal_receipt", {})
        totals = common.ERROR_TOTALS[assignment_id]
        if result.get("raw_sha256") != common.ATTEMPT2_ARTIFACTS[assignment_id]["result"] or receipt.get("raw_sha256") != common.ATTEMPT2_ARTIFACTS[assignment_id]["receipt"]:
            raise ValueError("primary-result-receipt-binding:" + assignment_id)
        if result.get("semantic_error_count") != totals["count"] or result.get("semantic_error_digest_sha256") != totals["digest"]:
            raise ValueError("primary-error-closure:" + assignment_id)
    return {"files": {str(path): expected for path, expected in expected_files.items()}, "trees": observed_trees}


def source_bindings() -> dict[str, Any]:
    missing = [str(path) for path in SOURCE_FILES if not path.is_file()]
    if missing:
        raise ValueError("source-files-missing:" + ",".join(missing))
    return {path.name: common.file_binding(path) for path in SOURCE_FILES}


def build_error_localization() -> list[dict[str, Any]]:
    spec = importlib.util.spec_from_file_location("attempt3_localization_frozen_v31_1", common.FROZEN_VALIDATOR)
    if spec is None or spec.loader is None:
        raise ValueError("localization-frozen-import")
    frozen = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(frozen)
    summary = common.observed_families_document()
    shared = {row["family"] for row in summary["shared"]}
    specific = {row["family"] for row in summary["assignment_specific"]}
    expected_counts = {row["family"]: row["count"] for row in summary["shared"] + summary["assignment_specific"]}
    localization: list[dict[str, Any]] = []
    aggregate_lines: list[str] = []
    normalized_counts: collections.Counter[str] = collections.Counter()
    partition: dict[str, collections.Counter[str]] = {}
    sequence = 0
    for assignment_id in common.ASSIGNMENTS:
        result_path, _ = attempt2_paths(assignment_id)
        errors = frozen.result_errors(common.load(result_path), assignment_id)
        totals = common.ERROR_TOTALS[assignment_id]
        digest = common.sha_bytes("\n".join(errors).encode("utf-8"))
        if len(errors) != totals["count"] or digest != totals["digest"]:
            raise ValueError("localization-assignment-closure:" + assignment_id)
        partition[assignment_id] = collections.Counter()
        for error in errors:
            sequence += 1
            family = common.normalize_observed_error(error)
            classification = "shared" if family in shared else "assignment_specific" if family in specific else "unclassified"
            if classification == "unclassified":
                raise ValueError("localization-unclassified:" + error)
            aggregate_lines.append(assignment_id + "\t" + error)
            normalized_counts[family] += 1
            partition[assignment_id][classification] += 1
            localization.append({"sequence": sequence, "assignment_id": assignment_id, "raw_error": error, "normalized_family": family, "classification": classification})
    aggregate_digest = common.sha_bytes("\n".join(aggregate_lines).encode("utf-8"))
    if sequence != 15831 or aggregate_digest != common.LOCALIZATION_DIGEST:
        raise ValueError(f"localization-aggregate:{sequence}:{aggregate_digest}")
    if dict(normalized_counts) != expected_counts:
        raise ValueError("localization-family-counts:" + json.dumps(dict(normalized_counts), sort_keys=True))
    expected_partition = summary["assignment_partition"]
    for assignment_id in common.ASSIGNMENTS:
        if dict(partition[assignment_id]) != expected_partition[assignment_id]:
            raise ValueError("localization-partition:" + assignment_id + ":" + json.dumps(dict(partition[assignment_id]), sort_keys=True))
    return localization


def validate_fixture_candidates(fixtures: dict[str, dict[str, Any]], packets: dict[str, dict[str, Any]], schema: dict[str, Any]) -> None:
    Draft202012Validator.check_schema(schema)
    validator = Draft202012Validator(schema)
    spec = importlib.util.spec_from_file_location("attempt3_candidate_frozen_v31_1", common.FROZEN_VALIDATOR)
    if spec is None or spec.loader is None:
        raise ValueError("candidate-frozen-import")
    frozen = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(frozen)
    for assignment_id in common.ASSIGNMENTS:
        candidate = fixtures[assignment_id]
        schema_errors = list(validator.iter_errors(candidate))
        if schema_errors:
            raise ValueError("candidate-attempt3-schema:" + assignment_id + ":" + schema_errors[0].message)
        expected_mapping = common.question_obligations(assignment_id)
        packet_mapping = {row["provisional_feature_ref"]: row["question_to_scenario_mapping"] for row in packets[assignment_id]["features"]}
        if packet_mapping != expected_mapping:
            raise ValueError("candidate-question-packet:" + assignment_id)
        by_feature = {row["provisional_feature_ref"]: row for row in candidate["feature_certifications"]}
        for feature_ref, mappings in expected_mapping.items():
            for mapping in mappings:
                scenarios = by_feature[feature_ref]["dimensions"][mapping["required_dimension"]]["scenarios"]
                if sum(1 for scenario in scenarios if scenario.startswith(mapping["required_scenario_prefix"])) != 1:
                    raise ValueError("candidate-question-scenario:" + assignment_id + ":" + mapping["question_id"])
        projected = json.loads(json.dumps(candidate))
        projected.update({
            "schema_version": "scenario-adversarial-semantic-repair-result-v31-v1",
            "attempt_id": "attempt-0002",
            "task_thread_id": f"/root/sol_controller_v29/a005_scenario_adversarial_{assignment_id[-4:]}_semantic_repair_attempt_0002_ultra_v31",
        })
        changed = {key for key in candidate if candidate[key] != projected[key]}
        if changed != {"schema_version", "attempt_id", "task_thread_id"}:
            raise ValueError("candidate-projection-field-set:" + assignment_id)
        frozen_errors = frozen.result_errors(projected, assignment_id)
        if frozen_errors:
            raise ValueError("candidate-frozen-errors:" + assignment_id + ":" + json.dumps(frozen_errors[:10], sort_keys=True))


def build_intent(assignment_id: str) -> dict[str, Any]:
    row = common.attempt3_row(assignment_id)
    return {
        "schema_version": "scenario-adversarial-attempt3-intent-v32-v1",
        "gate_id": common.GATE_ID,
        "audit_id": common.AUDIT_ID, "wave_id": "wave-0001", "cohort_id": "cohort-0002", "assignment_id": assignment_id, "attempt_id": common.ATTEMPT_ID,
        "identity": {
            "canonical_agent_path": common.attempt3_agent_path(assignment_id),
            "model": "gpt-5.6-sol", "reasoning_effort": "ultra", "fork_turns": "none",
            "fresh_direct_required": True, "state": "reserved_unallocated", "native_child_thread_id": None,
            "descendants": 0, "followups": 0, "retries": 0,
        },
        "bindings": {
            "obligation_packet": common.file_binding(common.obligation_packet_path(assignment_id)),
            "source_packet": common.file_binding(common.packet_path(assignment_id)),
            "result_schema": common.file_binding(common.RESULT_SCHEMA),
            "feature_template": common.file_binding(common.TEMPLATE),
            "leaf_prompt": common.file_binding(common.PROMPT),
            "preflight": common.file_binding(common.HERE / "preflight_attempt3_v32.py"),
            "frozen_validator": common.file_binding(common.FROZEN_VALIDATOR),
        },
        "coverage": {"feature_count": row["feature_count"], "feature_refs_digest": row["feature_refs_digest"]},
        "output": {"path": str(common.output_directory(assignment_id)), "expected_file_count": 0, "inventory_sha256": common.EMPTY_TREE_SHA},
        "preflight_command": common.PINNED_COMMAND_PREFIX + f" preflight_attempt3_v32.py --assignment-id {assignment_id} --candidate {{ABSOLUTE_CANDIDATE_JSON}} --exclusive-write",
        "terminal_response_after_success": "PMR1",
        "future_gates": {"fresh_luna_prelaunch_required": True, "controller_native_capture_required": True, "separate_activation_required": True},
        "activation": False, "launch": False, "credit": 0,
    }


def prepare() -> None:
    existing_non_sources = [path for path in common.HERE.rglob("*") if path.is_file() and path not in SOURCE_FILES]
    if existing_non_sources:
        raise ValueError("attempt3-non-source-files-already-exist:" + ",".join(str(path.relative_to(common.HERE)) for path in existing_non_sources))
    upstream = assert_upstream()
    sources = source_bindings()
    documents: dict[Path, Any] = {
        common.RESULT_SCHEMA: common.build_result_schema(),
        common.TEMPLATE: common.build_template(),
        common.PROMPT: common.build_prompt(),
        common.ERROR_FAMILIES: common.observed_families_document(),
        common.TEST_MATRIX: common.build_test_matrix(),
    }
    fixtures = {assignment_id: common.build_fixture(assignment_id) for assignment_id in common.ASSIGNMENTS}
    packets = {assignment_id: common.build_obligation_packet(assignment_id) for assignment_id in common.ASSIGNMENTS}
    localization = build_error_localization()
    if sum(common.QUESTION_COUNTS.values()) != 713:
        raise ValueError("question-total")
    validator_rows = [common.attempt3_row(assignment_id) for assignment_id in common.ASSIGNMENTS]
    validate_fixture_candidates(fixtures, packets, documents[common.RESULT_SCHEMA])
    for output in (common.output_directory(assignment_id) for assignment_id in common.ASSIGNMENTS):
        output.mkdir(parents=True, exist_ok=False)
    for path, value in documents.items():
        common.write_json(path, value)
    common.write_jsonl(common.VALIDATOR_ROWS, validator_rows)
    common.write_jsonl(common.ERROR_LOCALIZATION, localization)
    for assignment_id in common.ASSIGNMENTS:
        common.write_json(common.fixture_path(assignment_id), fixtures[assignment_id])
        common.write_json(common.obligation_packet_path(assignment_id), packets[assignment_id])
    fixture_manifest = {
        "schema_version": "scenario-adversarial-attempt3-validator-fixture-manifest-v32-v1",
        "test_only": True,
        "forbidden_as_result_evidence": True,
        "assignment_ids": common.ASSIGNMENTS,
        "feature_count": 687,
        "question_count": 713,
        "question_counts_by_assignment": common.QUESTION_COUNTS,
        "fixtures": {assignment_id: common.file_binding(common.fixture_path(assignment_id)) for assignment_id in common.ASSIGNMENTS},
        "synthetic_authority_sources": ["https://www.w3.org/TR/WCAG22/", "https://csrc.nist.gov/pubs/sp/800/53/r5/upd1/final"],
    }
    common.write_json(FIXTURE_MANIFEST, fixture_manifest)
    intents = []
    for assignment_id in common.ASSIGNMENTS:
        intent = build_intent(assignment_id)
        common.write_json(common.intent_path(assignment_id), intent)
        intents.append(intent)
    manifest_rows = []
    for sequence, assignment_id in enumerate(common.ASSIGNMENTS, 1):
        row = common.attempt3_row(assignment_id)
        result_path, receipt_path = attempt2_paths(assignment_id)
        manifest_rows.append({
            "sequence": sequence, "assignment_id": assignment_id, "attempt_id": common.ATTEMPT_ID,
            "identity": intents[sequence - 1]["identity"],
            "obligation_packet": common.file_binding(common.obligation_packet_path(assignment_id)),
            "validator_clean_fixture": common.file_binding(common.fixture_path(assignment_id)),
            "intent": common.file_binding(common.intent_path(assignment_id)),
            "source_packet": common.file_binding(common.packet_path(assignment_id)),
            "attempt2_result": {"path": str(result_path), "raw_sha256": common.ATTEMPT2_ARTIFACTS[assignment_id]["result"]},
            "attempt2_receipt": {"path": str(receipt_path), "raw_sha256": common.ATTEMPT2_ARTIFACTS[assignment_id]["receipt"]},
            "attempt2_error_closure": common.ERROR_TOTALS[assignment_id],
            "feature_count": row["feature_count"], "feature_refs_digest": row["feature_refs_digest"],
            "output": {"path": str(common.output_directory(assignment_id)), "expected_file_count": 0, "inventory_sha256": common.EMPTY_TREE_SHA},
            "activation": False, "launch": False, "credit": 0,
        })
    common.write_jsonl(common.MANIFEST, manifest_rows)
    generated_paths = list(documents) + [common.VALIDATOR_ROWS, common.ERROR_LOCALIZATION, FIXTURE_MANIFEST, common.MANIFEST]
    generated_paths.extend(common.fixture_path(assignment_id) for assignment_id in common.ASSIGNMENTS)
    generated_paths.extend(common.obligation_packet_path(assignment_id) for assignment_id in common.ASSIGNMENTS)
    generated_paths.extend(common.intent_path(assignment_id) for assignment_id in common.ASSIGNMENTS)
    authority = {
        "schema_version": "scenario-adversarial-attempt3-authority-v32-v1",
        "gate_id": common.GATE_ID,
        "audit_id": common.AUDIT_ID,
        "status": "prepared_blocked_pending_future_fresh_luna_prelaunch_and_activation",
        "append_only": True,
        "assignment_ids": common.ASSIGNMENTS,
        "feature_count": 687,
        "model": "gpt-5.6-sol", "reasoning_effort": "ultra", "fork_turns": "none",
        "upstream": {
            "primary_report": common.file_binding(common.PRIMARY),
            "activation_envelope": common.file_binding(common.ACTIVATION_ENVELOPE),
            "native_capture": common.file_binding(common.CAPTURE),
            "frozen_semantic_validator": common.file_binding(common.FROZEN_VALIDATOR),
            "policy_v32": common.file_binding(common.POLICY_V32),
            "whole_tree_inventories": upstream["trees"],
        },
        "attempt2_result_receipt_bindings": {
            assignment_id: {"result": common.file_binding(attempt2_paths(assignment_id)[0]), "receipt": common.file_binding(attempt2_paths(assignment_id)[1])}
            for assignment_id in common.ASSIGNMENTS
        },
        "attempt2_error_partition": {
            "normalized_families": common.file_binding(common.ERROR_FAMILIES),
            "complete_localization": common.file_binding(common.ERROR_LOCALIZATION),
            "aggregate_assignment_tab_error_digest_sha256": common.LOCALIZATION_DIGEST,
            "family_count": 51, "error_count": 15831, "shared_family_count": 41, "shared_error_count": 15306,
            "specific_family_count": 10, "specific_error_count": 525, "assignment_totals": common.ERROR_TOTALS,
        },
        "compatibility_projection": {
            "true_attempt3_validation_first": True,
            "changed_fields_only": ["schema_version", "attempt_id", "task_thread_id"],
            "semantic_payload_preserved": True,
            "frozen_function": "result_errors",
            "frozen_source_sha256": common.FROZEN_VALIDATOR_SHA,
        },
        "audit_runtime": {"python": str(common.AUDIT_PYTHON), "python_version": "3.12.13", "pythonpath": str(common.JSONSCHEMA_SITE), "jsonschema_version": "4.26.0", "validator_class": "jsonschema.validators.Draft202012Validator", "no_site": True, "no_user_site": True, "dont_write_bytecode": True},
        "source_bindings": sources,
        "artifact_bindings": {str(path.relative_to(common.HERE)): common.file_binding(path) for path in sorted(generated_paths)},
        "future_gates": {
            "fresh_luna_prelaunch": {"required": True, "state": "required_absent", "path": str(common.FUTURE_LUNA)},
            "controller_parent_native_capture": {"required": True, "state": "required_absent", "path": str(common.FUTURE_CAPTURE)},
            "activation": {"required_separate_transaction": True, "state": "required_absent", "path": str(common.FUTURE_ACTIVATION)},
        },
        "tests": {"minimum": 900, "exact_prepared_total": 1024, "six_real_validator_clean_packet_shapes": True, "every_observed_family_mutated": True},
        "zero_state": common.ZERO_STATE,
        "activation": False, "activation_authorized": False, "launch": False, "launch_authorized": False,
    }
    common.write_json(common.AUTHORITY, authority)


def inventory_excluding_readiness() -> dict[str, Any]:
    files = sorted(path for path in common.HERE.rglob("*") if path.is_file() and path not in {common.READINESS, common.FUTURE_LUNA, common.FUTURE_CAPTURE, common.FUTURE_ACTIVATION})
    rows = []
    for path in files:
        raw = common.stable_read(path)
        rows.append({"path": path.relative_to(common.HERE).as_posix(), "byte_count": len(raw), "sha256": common.sha_bytes(raw)})
    return {"file_count": len(rows), "byte_count": sum(row["byte_count"] for row in rows), "inventory_sha256": common.canonical_sha(rows)}


def seal() -> None:
    if common.READINESS.exists():
        raise ValueError("readiness-already-exists")
    upstream = assert_upstream()
    authority = common.load(common.AUTHORITY)
    report = common.load(common.TEST_REPORT)
    if report.get("status") != "pass" or report.get("passed") != 1024 or report.get("total") != 1024 or report.get("failed") != 0:
        raise ValueError("test-report-not-exact-1024-pass")
    runtime = report.get("runtime", {})
    if runtime.get("python_version") != "3.12.13" or runtime.get("jsonschema_version") != "4.26.0" or runtime.get("validator_class") != "jsonschema.validators.Draft202012Validator" or runtime.get("pythonpath") != str(common.JSONSCHEMA_SITE) or not runtime.get("no_site") or not runtime.get("no_user_site") or not runtime.get("dont_write_bytecode"):
        raise ValueError("test-report-runtime-not-pinned")
    readiness = {
        "schema_version": "scenario-adversarial-attempt3-readiness-v32-v1",
        "gate_id": common.GATE_ID,
        "status": "pass_blocked",
        "errors": [],
        "blocking_reasons": ["future_fresh_luna_max_prelaunch_absent", "controller_parent_native_capture_absent", "separate_activation_transaction_absent", "activation_false", "launch_false"],
        "authority": common.file_binding(common.AUTHORITY),
        "test_report": common.file_binding(common.TEST_REPORT),
        "tests": {key: report[key] for key in ("passed", "total", "failed", "positive", "negative", "case_id_digest", "category_counts")},
        "prepared_counts": {"assignments": 6, "features": 687, "questions": 713, "localized_errors": 15831, "empty_output_directories": 6, "reserved_fresh_identities": 6},
        "runtime": runtime,
        "preseal_inventory": inventory_excluding_readiness(),
        "upstream_whole_tree_inventories": upstream["trees"],
        "future_gates": authority["future_gates"],
        "zero_state": common.ZERO_STATE,
        "activation": False, "activation_authorized": False, "launch": False, "launch_authorized": False,
    }
    common.write_json(common.READINESS, readiness)


def main() -> None:
    parser = argparse.ArgumentParser()
    group = parser.add_mutually_exclusive_group(required=True)
    group.add_argument("--prepare", action="store_true")
    group.add_argument("--seal", action="store_true")
    args = parser.parse_args()
    if args.prepare:
        prepare()
        result = {"status": "prepared", "authority": str(common.AUTHORITY)}
    else:
        seal()
        result = {"status": "sealed_pass_blocked", "readiness": str(common.READINESS)}
    print(json.dumps(result, sort_keys=True))


if __name__ == "__main__":
    main()
