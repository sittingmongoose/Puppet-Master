#!/usr/bin/env python3
"""Validate PRD Builder / Planning Wizard runtime contract strictness."""

from __future__ import annotations

import importlib.util
import json
import sys
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[1]
PLANS = ROOT / "Plans"
CONTRACT_PATH = PLANS / "prd_planning_runtime_contracts.json"
CONTRACT_SCHEMA_PATH = PLANS / "prd_planning_runtime_contracts.schema.json"
HANDOFF_SCHEMA_PATH = PLANS / "plans_to_code_handoff.schema.json"


def load_verify_module() -> Any:
    path = ROOT / "scripts" / "pm-plans-verify.py"
    spec = importlib.util.spec_from_file_location("pm_plans_verify_runtime", path)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"cannot load {path}")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


VERIFY = load_verify_module()


def rel(path: Path) -> str:
    return path.relative_to(ROOT).as_posix()


def load_json(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8"))


def local_ref_failures(schema_path: Path, schema: Any) -> list[dict[str, Any]]:
    failures: list[dict[str, Any]] = []

    def walk(value: Any, pointer: str) -> None:
        if isinstance(value, dict):
            ref = value.get("$ref")
            if isinstance(ref, str) and ref.startswith("#/"):
                try:
                    VERIFY.resolve_ref(ref, schema)
                except Exception as exc:  # noqa: BLE001 - report exact unresolved pointer.
                    failures.append(
                        {
                            "path": rel(schema_path),
                            "error": "unresolved_local_ref",
                            "pointer": pointer,
                            "ref": ref,
                            "detail": str(exc),
                        }
                    )
            for key, child in value.items():
                walk(child, f"{pointer}.{key}")
        elif isinstance(value, list):
            for index, child in enumerate(value):
                walk(child, f"{pointer}[{index}]")

    walk(schema, "$")
    return failures


def validate_all_local_refs() -> list[dict[str, Any]]:
    failures: list[dict[str, Any]] = []
    for schema_path in sorted(PLANS.glob("*.schema.json")):
        try:
            schema = load_json(schema_path)
        except Exception as exc:  # noqa: BLE001
            failures.append({"path": rel(schema_path), "error": "schema_parse_failed", "detail": str(exc)})
            continue
        failures.extend(local_ref_failures(schema_path, schema))
    return failures


def has_generic_placeholder(text: str) -> bool:
    lowered = text.lower()
    generic = [
        "execute the stage algorithm",
        "tbd",
        "todo",
        "placeholder",
        "fill this in",
        "implement later",
        "generic step",
    ]
    return any(token in lowered for token in generic)


def validate_stage_cards(contract: dict[str, Any]) -> list[dict[str, Any]]:
    failures: list[dict[str, Any]] = []
    cards = contract["plan_compile_runtime"]["stage_cards"]
    required_ids = {
        "preflight_currentness",
        "scope_selection",
        "planunit_normalization",
        "test_repository_discovery",
        "typed_dependency_analysis",
        "implementation_surface_mapping",
        "work_risk_classification",
        "nodeseed_candidate_drafting",
        "split_merge_sizing",
        "candidate_review",
        "workgraph_construction",
        "worknode_request_construction",
        "final_compile_audit_repair",
        "executor_handoff_certification",
        "activation_transaction",
    }
    ids = [card.get("stage_id") for card in cards]
    if len(cards) < 15:
        failures.append({"path": rel(CONTRACT_PATH), "error": "stage_card_count_below_15", "count": len(cards)})
    if len(ids) != len(set(ids)):
        failures.append({"path": rel(CONTRACT_PATH), "error": "duplicate_stage_card_id"})
    missing = sorted(required_ids - set(ids))
    if missing:
        failures.append({"path": rel(CONTRACT_PATH), "error": "missing_required_stage_cards", "stage_ids": missing})
    algorithms = set()
    for card in cards:
        stage_id = card.get("stage_id")
        algorithm = card.get("algorithm", [])
        marker = json.dumps(algorithm, sort_keys=True)
        if marker in algorithms:
            failures.append({"path": rel(CONTRACT_PATH), "error": "duplicate_stage_algorithm", "stage_id": stage_id})
        algorithms.add(marker)
        for field in ["purpose", "algorithm", "entry_gates", "exit_gates", "parallelism", "evidence", "repair_routes"]:
            value = card.get(field)
            strings = value if isinstance(value, list) else [value]
            for item in strings:
                if isinstance(item, str) and has_generic_placeholder(item):
                    failures.append(
                        {"path": rel(CONTRACT_PATH), "error": "stage_card_placeholder_text", "stage_id": stage_id, "field": field}
                    )
    return failures


def validate_command_contracts(contract: dict[str, Any]) -> list[dict[str, Any]]:
    failures: list[dict[str, Any]] = []
    commands = contract["ui_command_contracts"]
    command_ids = {command.get("command_id") for command in commands}
    required = {
        "cmd.planning_wizard.rename_topic",
        "cmd.planning_wizard.reorder_topic",
        "cmd.planning_wizard.mark_impacted",
        "cmd.planning_wizard.approve_and_build",
        "cmd.plan_compile.open_build",
    }
    missing = sorted(required - command_ids)
    if missing:
        failures.append({"path": rel(CONTRACT_PATH), "error": "missing_required_ui_commands", "command_ids": missing})
    for command in commands:
        command_id = command.get("command_id")
        for field in ["payload_contract", "result_contract", "enablement_guards", "disabled_reason_codes", "receipt_effects"]:
            values = command.get(field, [])
            if not values:
                failures.append({"path": rel(CONTRACT_PATH), "error": "empty_command_contract_field", "command_id": command_id, "field": field})
            for value in values:
                if isinstance(value, str) and value.strip() in {"object", "{}", "Record<string, any>", "any"}:
                    failures.append(
                        {"path": rel(CONTRACT_PATH), "error": "generic_command_contract_field", "command_id": command_id, "field": field}
                    )
    approve = next((command for command in commands if command.get("command_id") == "cmd.planning_wizard.approve_and_build"), None)
    if approve:
        result_fields = set(approve.get("result_contract", []))
        idempotency_fields = set(approve.get("idempotency_key_fields", []))
        if "plan_compile_run_id" not in result_fields:
            failures.append({"path": rel(CONTRACT_PATH), "error": "approve_and_build_result_missing_plan_compile_run_id"})
        cas_fields = set(contract["planning_wizard_runtime"].get("approve_and_build_cas_fields", []))
        required_idempotency_fields = cas_fields | {"project_id"}
        for field in sorted(required_idempotency_fields):
            if field not in idempotency_fields:
                failures.append({"path": rel(CONTRACT_PATH), "error": "approve_and_build_missing_idempotency_field", "field": field})
    annotate = next((command for command in commands if command.get("command_id") == "cmd.prd_builder.annotate_source"), None)
    if annotate:
        payload_fields = set(annotate.get("payload_contract", []))
        result_fields = set(annotate.get("result_contract", []))
        for field in [
            "actor_ref",
            "action_kind",
            "action_payload",
            "document_version",
            "projection_revision",
            "source_span_ref",
            "start_offset",
            "end_offset",
            "selected_text_hash",
            "ordering_key",
        ]:
            if field not in payload_fields:
                failures.append({"path": rel(CONTRACT_PATH), "error": "annotate_source_missing_payload_field", "field": field})
        if "stale_anchor_relocation_receipt_ref_or_null" not in result_fields:
            failures.append({"path": rel(CONTRACT_PATH), "error": "annotate_source_missing_stale_anchor_receipt"})
    return failures


def validate_runtime_contracts(contract: dict[str, Any]) -> list[dict[str, Any]]:
    failures: list[dict[str, Any]] = []
    exclusions = set(contract.get("retired_search_exclusions", []))
    for path in ["Plans/chain-wizard.md", "Plans/chain-wizard-flexibility.md"]:
        if path not in exclusions:
            failures.append({"path": rel(CONTRACT_PATH), "error": "retired_chain_wizard_doc_not_excluded", "retired_path": path})

    ledger_ops = {op.get("record_kind") for op in contract["native_ledger_service"]["operations"]}
    for op in ["append_event", "upsert_record", "update_projection", "commit_turn", "recover_turn", "compact_ledger", "import_export"]:
        if op not in ledger_ops:
            failures.append({"path": rel(CONTRACT_PATH), "error": "native_ledger_operation_missing", "operation": op})

    integrity = contract.get("cross_record_referential_integrity", {})
    integrity_tokens = " ".join(
        str(item)
        for key in ["edge_authority_fields", "terminal_rules", "compaction_import_rules", "certification_rules"]
        for item in integrity.get(key, [])
    )
    for token in ["record_kind", "project_id", "revision", "currentness_hash", "hash", "stale", "orphan"]:
        if token not in integrity_tokens:
            failures.append({"path": rel(CONTRACT_PATH), "error": "referential_integrity_token_missing", "token": token})

    variants = {variant.get("variant") for variant in contract["project_context_snapshot"]["variants"]}
    for variant in ["greenfield", "local_git", "local_non_git", "remote_git", "remote_non_git", "fork_upstream"]:
        if variant not in variants:
            failures.append({"path": rel(CONTRACT_PATH), "error": "project_context_variant_missing", "variant": variant})

    topic_ops = set(contract["planning_wizard_runtime"]["topic_operations"])
    for op in ["rename", "reorder", "mark_impacted"]:
        if op not in topic_ops:
            failures.append({"path": rel(CONTRACT_PATH), "error": "topic_operation_missing", "operation": op})
    seed_kinds = {seed.get("seed_kind") for seed in contract["planning_wizard_runtime"].get("input_seed_contracts", [])}
    for seed_kind in ["ApprovedPRDPack", "normalized_requirements_pack", "assistant_chat_handoff_seed"]:
        if seed_kind not in seed_kinds:
            failures.append({"path": rel(CONTRACT_PATH), "error": "planning_input_seed_missing", "seed_kind": seed_kind})
    axes = set(contract["planning_wizard_runtime"].get("work_intent_axes", []))
    for axis in ["feature_work", "release_pr_delivery"]:
        if axis not in axes:
            failures.append({"path": rel(CONTRACT_PATH), "error": "planning_work_intent_axis_missing", "axis": axis})

    prd_records = {record.get("record_kind"): record for record in contract["prd_builder_runtime"]["records"]}
    annotation = prd_records.get("annotation_record")
    if annotation is None:
        failures.append({"path": rel(CONTRACT_PATH), "error": "annotation_record_missing"})
    else:
        annotation_fields = set(annotation.get("required_fields", []))
        for field in ["actor_ref", "action_kind", "action_payload", "ordering_key", "relocation_ref_or_null"]:
            if field not in annotation_fields:
                failures.append({"path": rel(CONTRACT_PATH), "error": "annotation_record_missing_field", "field": field})

    activation_states = set(contract["executor_activation_runtime"]["states"])
    for state in ["activation_pending", "records_materialized", "entrypoints_queued", "start_event_pending", "active", "cancelled_before_mutation"]:
        if state not in activation_states:
            failures.append({"path": rel(CONTRACT_PATH), "error": "activation_state_missing", "state": state})
    testing_records = {record.get("record_kind"): record for record in contract["testing_runtime"]["records"]}
    override = testing_records.get("testing_policy_override")
    if override is None:
        failures.append({"path": rel(CONTRACT_PATH), "error": "testing_policy_override_record_missing"})
    else:
        override_fields = set(override.get("required_fields", []))
        for field in ["approver_ref", "evidence_refs", "redaction_profile_ref", "expiration_or_reopen_condition", "truthful_result_label"]:
            if field not in override_fields:
                failures.append({"path": rel(CONTRACT_PATH), "error": "testing_policy_override_missing_field", "field": field})
    selection_rules = " ".join(contract["testing_runtime"].get("selection_rules", []))
    if "testing_policy_override" not in selection_rules:
        failures.append({"path": rel(CONTRACT_PATH), "error": "testing_off_not_bound_to_override"})
    return failures


def validate_handoff_schema_semantics() -> list[dict[str, Any]]:
    failures: list[dict[str, Any]] = []
    schema = load_json(HANDOFF_SCHEMA_PATH)
    defs = schema.get("$defs", {})
    request = defs.get("worknode_request", {})
    required = set(request.get("required", []))
    for field in [
        "source_plan_unit_ids",
        "source_acceptance_unit_ids",
        "objective",
        "implementation_surfaces",
        "acceptance_criteria",
        "validator_candidates",
        "test_binding",
        "ordering",
        "authority",
    ]:
        if field not in required:
            failures.append({"path": rel(HANDOFF_SCHEMA_PATH), "error": "worknode_request_missing_required_field", "field": field})

    workgraph = defs.get("workgraph_draft", {}).get("properties", {})
    if workgraph.get("nodes", {}).get("minItems") != 1:
        failures.append({"path": rel(HANDOFF_SCHEMA_PATH), "error": "workgraph_nodes_not_non_empty"})
    if workgraph.get("entrypoints", {}).get("$ref") != "#/$defs/non_empty_ref_list":
        failures.append({"path": rel(HANDOFF_SCHEMA_PATH), "error": "workgraph_entrypoints_not_non_empty_ref_list"})
    return failures


def validate_adversarial_suite(contract: dict[str, Any]) -> list[dict[str, Any]]:
    failures: list[dict[str, Any]] = []
    expected_cases = {
        "ready_prd_with_blocker": "ready PRD quality cannot coexist with blocking findings",
        "topic_passed_empty_plans": "passed topic compile requires Plan docs and PlanUnits",
        "accepted_amendment_no_source": "accepted amendments require source lineage and approver",
        "empty_workgraph_valid": "valid WorkGraph requires nodes and entrypoints",
        "certified_compile_zero_requests": "certified compile requires WorkNodeRequests",
        "accepted_executor_false_integrity": "accepted activation requires all integrity flags true",
        "buildstarted_zero_entrypoints": "BuildStarted requires queued entrypoints",
        "visible_test_pass_no_evidence": "visible test pass requires interaction and evidence",
    }
    scenarios = {
        scenario.get("scenario_id"): scenario
        for scenario in contract["clean_room_harness"].get("negative_scenarios", [])
    }
    for scenario_id, reason in expected_cases.items():
        scenario = scenarios.get(scenario_id)
        if scenario is None:
            failures.append({"path": rel(CONTRACT_PATH), "error": "adversarial_case_missing", "case": scenario_id, "reason": reason})
            continue
        if scenario.get("expected_terminal_state") != "schema rejected":
            failures.append(
                {
                    "path": rel(CONTRACT_PATH),
                    "error": "adversarial_case_not_rejected",
                    "case": scenario_id,
                    "terminal_state": scenario.get("expected_terminal_state"),
                    "reason": reason,
                }
            )
        if not scenario.get("must_prove"):
            failures.append({"path": rel(CONTRACT_PATH), "error": "adversarial_case_missing_proof", "case": scenario_id})
    return failures


def validate_schema_and_instance() -> list[dict[str, Any]]:
    failures: list[dict[str, Any]] = []
    schema = load_json(CONTRACT_SCHEMA_PATH)
    contract = load_json(CONTRACT_PATH)
    for error in VERIFY.validate_schema(contract, schema, schema):
        failures.append({"path": rel(CONTRACT_PATH), "error": "contract_schema_validation_failed", "detail": error})
    return failures


def main() -> int:
    contract = load_json(CONTRACT_PATH)
    failures: list[dict[str, Any]] = []
    failures.extend(validate_all_local_refs())
    failures.extend(validate_schema_and_instance())
    failures.extend(validate_stage_cards(contract))
    failures.extend(validate_command_contracts(contract))
    failures.extend(validate_runtime_contracts(contract))
    failures.extend(validate_handoff_schema_semantics())
    failures.extend(validate_adversarial_suite(contract))

    report = {
        "schema_id": "pm.prd_planning_runtime_validator.report.v1",
        "check": "validate-prd-planning-runtime-contracts",
        "status": "pass" if not failures else "fail",
        "failures": failures,
        "contract": rel(CONTRACT_PATH),
        "schema": rel(CONTRACT_SCHEMA_PATH),
    }
    print(json.dumps(report, indent=2, sort_keys=True))
    return 0 if not failures else 1


if __name__ == "__main__":
    raise SystemExit(main())
