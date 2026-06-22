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
        "orchestrator_projection",
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
    contract = load_json(CONTRACT_PATH)
    stage_cards = contract["plan_compile_runtime"]["stage_cards"]
    runtime_stage_ids = {card.get("stage_id") for card in stage_cards}
    schema_stage_ids = set(defs.get("stage_name", {}).get("enum", []))
    if schema_stage_ids != runtime_stage_ids:
        failures.append(
            {
                "path": rel(HANDOFF_SCHEMA_PATH),
                "error": "handoff_stage_registry_drift",
                "missing_in_schema": sorted(runtime_stage_ids - schema_stage_ids),
                "stale_in_schema": sorted(schema_stage_ids - runtime_stage_ids),
            }
        )
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

    plan_compile = defs.get("plan_compile_run", {})
    plan_compile_props = plan_compile.get("properties", {}) if isinstance(plan_compile, dict) else {}
    if "native_plan_wizard_launch_enabled" in plan_compile_props:
        failures.append({"path": rel(HANDOFF_SCHEMA_PATH), "error": "retired_plan_wizard_launch_field_active"})
    if "native_plan_wizard" in set(plan_compile_props.get("launch_source", {}).get("enum", [])):
        failures.append({"path": rel(HANDOFF_SCHEMA_PATH), "error": "retired_plan_wizard_launch_source_active"})
    if plan_compile_props.get("planning_wizard_launch_enabled", {}).get("type") != "boolean":
        failures.append({"path": rel(HANDOFF_SCHEMA_PATH), "error": "planning_wizard_launch_flag_missing"})

    worklist = defs.get("compile_worklist", {})
    worklist_required = set(worklist.get("required", [])) if isinstance(worklist, dict) else set()
    if "parallelism_policy" not in worklist_required:
        failures.append({"path": rel(HANDOFF_SCHEMA_PATH), "error": "compile_worklist_missing_parallelism_policy"})
    worklist_props = worklist.get("properties", {}) if isinstance(worklist, dict) else {}
    if worklist_props.get("parallelism_policy", {}).get("$ref") != "#/$defs/compile_parallelism_policy":
        failures.append({"path": rel(HANDOFF_SCHEMA_PATH), "error": "compile_worklist_parallelism_policy_not_strict"})

    wave = defs.get("compile_wave_contract", {})
    wave_required = set(wave.get("required", [])) if isinstance(wave, dict) else set()
    for field in ["assignment_receipt", "completion_receipt"]:
        if field not in wave_required:
            failures.append({"path": rel(HANDOFF_SCHEMA_PATH), "error": "compile_wave_missing_typed_receipt", "field": field})
    return failures


def sample_wave() -> dict[str, Any]:
    return {
        "wave_id": "wave-001",
        "assignment_id": "assign-001",
        "stage": "candidate_review",
        "assigned_agent_role": "subagent",
        "source_item_refs": ["item-001"],
        "read_set": ["Plans/Plan_To_Node_Compilation.md"],
        "write_set": ["Plans/plans_to_code_handoff.schema.json"],
        "forbidden_writes": ["Plans/_shards"],
        "parent_only_writes": True,
        "result_status": "complete",
        "retry_route": {
            "route_kind": "return_to_parent",
            "target_stage": None,
            "reason": "assignment completed and returned to parent compiler",
        },
        "resume_ref": None,
        "durable_evidence_refs": ["evidence:wave-001"],
        "assignment_receipt": {
            "receipt_id": "assignment-receipt-001",
            "stage": "candidate_review",
            "wave_id": "wave-001",
            "assignment_id": "assign-001",
            "assigned_agent_role": "subagent",
            "issued_at_utc": "2026-06-22T00:00:00Z",
            "source_item_refs": ["item-001"],
            "parent_writeback_required": True,
        },
        "completion_receipt": {
            "receipt_id": "completion-receipt-001",
            "stage": "candidate_review",
            "wave_id": "wave-001",
            "assignment_id": "assign-001",
            "result_status": "complete",
            "completed_at_utc": "2026-06-22T00:05:00Z",
            "durable_evidence_refs": ["evidence:wave-001"],
            "parent_writeback_required": True,
        },
        "parent_writeback_required": True,
    }


def sample_plan_compile_run() -> dict[str, Any]:
    return {
        "compile_id": "compile-001",
        "source_plan_set_id": "approved-plan-pack-001",
        "source_plan_index_hash": "sha256:plans",
        "launch_source": "native_planning_wizard",
        "contract_mode": "native_runtime",
        "launch_policy": "automatic_after_approval",
        "runtime_adapter": "native_puppet_master_adapter",
        "runtime_enablement_ref": "Plans/Plan_To_Node_Compilation.md#PNC-015",
        "runtime_policy_snapshot_ref": "policy-snapshot-001",
        "status": "complete",
        "current_stage": "orchestrator_projection",
        "cursor": {
            "stage": "orchestrator_projection",
            "item_ref": None,
            "item_index": 0,
            "checkpoint_ref": "checkpoint-001",
            "source_hash": "sha256:cursor",
        },
        "last_green_stage": "orchestrator_projection",
        "last_green_hashes": {
            "source_plan_index_hash": "sha256:plans",
            "plan_unit_hash_refs": ["hash:unit"],
            "schema_hash_refs": ["hash:schema"],
            "created_at_utc": "2026-06-22T00:00:00Z",
        },
        "blockers": [],
        "next_required_stage": None,
        "resume_command_or_action": None,
        "automatic_launch_enabled": True,
        "planning_wizard_launch_enabled": True,
        "codex_bootstrap_launch_enabled": False,
        "current_state": "complete",
        "receipts": ["receipt:complete"],
        "compile_wave_contracts": [sample_wave()],
    }


def sample_compile_worklist() -> dict[str, Any]:
    second_wave = sample_wave()
    second_wave["wave_id"] = "wave-002"
    second_wave["assignment_id"] = "assign-002"
    second_wave["assignment_receipt"] = {
        **second_wave["assignment_receipt"],
        "receipt_id": "assignment-receipt-002",
        "wave_id": "wave-002",
        "assignment_id": "assign-002",
    }
    second_wave["completion_receipt"] = {
        **second_wave["completion_receipt"],
        "receipt_id": "completion-receipt-002",
        "wave_id": "wave-002",
        "assignment_id": "assign-002",
    }
    return {
        "compile_id": "compile-001",
        "stage": "candidate_review",
        "parallelism_policy": {
            "parallelism_required": True,
            "minimum_parallel_assignments": 2,
            "assignment_receipt_refs": ["assignment-receipt-001", "assignment-receipt-002"],
            "completion_receipt_refs": ["completion-receipt-001", "completion-receipt-002"],
            "certification_rule": "requires_assignment_and_completion_receipts",
        },
        "items": [
            {
                "item_id": "item-001",
                "source_refs": ["PNC-016"],
                "status": "complete",
                "assigned_wave_ref": "wave-001",
                "evidence_refs": ["evidence:item-001"],
            }
        ],
        "source_plan_index_hash": "sha256:plans",
        "status": "complete",
        "blocked_route": {
            "route_kind": "request_parent_adjudication",
            "target_stage": None,
            "reason": "no blocked route used for completed fixture",
        },
        "resume_ref": None,
        "wave_assignments": [sample_wave(), second_wave],
    }


def validate_handoff_payload_semantics(artifact_kind: str, payload: dict[str, Any]) -> list[str]:
    errors: list[str] = []
    if artifact_kind == "plan_compile_run":
        if payload.get("status") == "complete":
            if payload.get("current_state") != "complete":
                errors.append("plan_compile_run.complete requires current_state=complete")
            if payload.get("current_stage") != "orchestrator_projection":
                errors.append("plan_compile_run.complete requires current_stage=orchestrator_projection")
            if payload.get("cursor", {}).get("stage") != "orchestrator_projection":
                errors.append("plan_compile_run.complete requires cursor.stage=orchestrator_projection")
            if payload.get("next_required_stage") is not None:
                errors.append("plan_compile_run.complete requires next_required_stage=null")
            if payload.get("resume_command_or_action") is not None:
                errors.append("plan_compile_run.complete requires resume_command_or_action=null")
            if not payload.get("receipts"):
                errors.append("plan_compile_run.complete requires receipts")
            waves = payload.get("compile_wave_contracts", [])
            if not waves:
                errors.append("plan_compile_run.complete requires compile_wave_contracts")
            for index, wave in enumerate(waves):
                if wave.get("result_status") != "complete":
                    errors.append(f"plan_compile_run.complete wave[{index}] is not complete")
                if not wave.get("completion_receipt"):
                    errors.append(f"plan_compile_run.complete wave[{index}] missing completion_receipt")

    if artifact_kind == "compile_worklist":
        policy = payload.get("parallelism_policy", {})
        waves = payload.get("wave_assignments", [])
        if payload.get("status") == "complete":
            if not payload.get("items"):
                errors.append("compile_worklist.complete requires items")
            if not waves:
                errors.append("compile_worklist.complete requires wave_assignments")
            for index, wave in enumerate(waves):
                if wave.get("result_status") != "complete":
                    errors.append(f"compile_worklist.complete wave[{index}] is not complete")
                if not wave.get("completion_receipt"):
                    errors.append(f"compile_worklist.complete wave[{index}] missing completion_receipt")
        if policy.get("parallelism_required"):
            minimum = policy.get("minimum_parallel_assignments", 0)
            non_parent_waves = [wave for wave in waves if wave.get("assigned_agent_role") != "parent"]
            if len(non_parent_waves) < minimum:
                errors.append("parallel compile_worklist has fewer non-parent waves than minimum_parallel_assignments")
            assignment_receipt_ids = {
                wave.get("assignment_receipt", {}).get("receipt_id")
                for wave in waves
                if isinstance(wave.get("assignment_receipt"), dict)
            }
            completion_receipt_ids = {
                wave.get("completion_receipt", {}).get("receipt_id")
                for wave in waves
                if isinstance(wave.get("completion_receipt"), dict)
            }
            assignment_receipt_refs = set(policy.get("assignment_receipt_refs", []))
            completion_receipt_refs = set(policy.get("completion_receipt_refs", []))
            if assignment_receipt_refs != assignment_receipt_ids:
                errors.append("parallel compile_worklist assignment_receipt_refs do not match wave receipts")
            if completion_receipt_refs != completion_receipt_ids:
                errors.append("parallel compile_worklist completion_receipt_refs do not match wave receipts")
        for index, wave in enumerate(waves):
            assignment = wave.get("assignment_receipt")
            completion = wave.get("completion_receipt")
            if isinstance(assignment, dict):
                for field in ["stage", "wave_id", "assignment_id"]:
                    if assignment.get(field) != wave.get(field):
                        errors.append(f"wave[{index}] assignment_receipt.{field} does not match wave")
            if isinstance(completion, dict):
                for field in ["stage", "wave_id", "assignment_id"]:
                    if completion.get(field) != wave.get(field):
                        errors.append(f"wave[{index}] completion_receipt.{field} does not match wave")
    return errors


def validate_handoff_fixture(schema: dict[str, Any], artifact_kind: str, payload: dict[str, Any]) -> list[str]:
    instance = {
        "schema_id": "pm.plans_to_code_handoff.v1",
        "artifact_kind": artifact_kind,
        "payload": payload,
    }
    return VERIFY.validate_schema(instance, schema, schema) + validate_handoff_payload_semantics(artifact_kind, payload)


def validate_executable_handoff_fixtures() -> list[dict[str, Any]]:
    failures: list[dict[str, Any]] = []
    schema = load_json(HANDOFF_SCHEMA_PATH)

    positive_cases = [
        ("native_complete_plan_compile_run", "plan_compile_run", sample_plan_compile_run()),
        (
            "canonical_stage_current_stage",
            "plan_compile_run",
            {
                **sample_plan_compile_run(),
                "status": "running",
                "current_state": "stage_running",
                "current_stage": "test_repository_discovery",
                "cursor": {**sample_plan_compile_run()["cursor"], "stage": "test_repository_discovery"},
                "next_required_stage": "typed_dependency_analysis",
            },
        ),
        ("complete_parallel_compile_worklist", "compile_worklist", sample_compile_worklist()),
    ]
    for case_id, artifact_kind, payload in positive_cases:
        errors = validate_handoff_fixture(schema, artifact_kind, payload)
        if errors:
            failures.append({"path": rel(HANDOFF_SCHEMA_PATH), "error": "handoff_positive_fixture_rejected", "case": case_id, "details": errors})

    native_with_codex_source = sample_plan_compile_run()
    native_with_codex_source["launch_source"] = "codex_bootstrap"
    design_only_with_native_source = sample_plan_compile_run()
    design_only_with_native_source.update(
        {
            "launch_source": "native_planning_wizard",
            "contract_mode": "design_only",
            "launch_policy": "disabled",
            "runtime_adapter": "native_puppet_master_adapter",
            "runtime_enablement_ref": None,
            "runtime_policy_snapshot_ref": None,
            "status": "design_only_disabled",
            "automatic_launch_enabled": False,
            "planning_wizard_launch_enabled": False,
            "current_state": "initialized",
            "receipts": [],
            "compile_wave_contracts": [],
        }
    )
    stale_stage = sample_plan_compile_run()
    stale_stage["current_stage"] = "dependency_cycle_analysis"
    stale_stage["cursor"] = {**stale_stage["cursor"], "stage": "dependency_cycle_analysis"}
    terminal_success_inconsistent = sample_plan_compile_run()
    terminal_success_inconsistent.update(
        {
            "current_state": "initialized",
            "current_stage": "preflight_currentness",
            "cursor": {**terminal_success_inconsistent["cursor"], "stage": "preflight_currentness"},
            "next_required_stage": "scope_selection",
            "receipts": [],
            "compile_wave_contracts": [],
        }
    )
    empty_complete_worklist = sample_compile_worklist()
    empty_complete_worklist["items"] = []
    empty_complete_worklist["wave_assignments"] = []
    empty_complete_worklist["parallelism_policy"] = {
        **empty_complete_worklist["parallelism_policy"],
        "assignment_receipt_refs": [],
        "completion_receipt_refs": [],
    }
    broad_stage_single_agent = sample_compile_worklist()
    broad_stage_single_agent["parallelism_policy"] = {
        **broad_stage_single_agent["parallelism_policy"],
        "minimum_parallel_assignments": 1,
    }
    one_wave_below_minimum = sample_compile_worklist()
    one_wave_below_minimum["wave_assignments"] = [sample_wave()]
    parent_agent_fallback = sample_compile_worklist()
    parent_agent_fallback["wave_assignments"] = [
        {**sample_wave(), "assigned_agent_role": "parent"},
        {**sample_wave(), "wave_id": "wave-002", "assignment_id": "assign-002", "assigned_agent_role": "parent"},
    ]
    parent_agent_fallback["wave_assignments"][1]["assignment_receipt"] = {
        **parent_agent_fallback["wave_assignments"][1]["assignment_receipt"],
        "receipt_id": "assignment-receipt-002",
        "wave_id": "wave-002",
        "assignment_id": "assign-002",
        "assigned_agent_role": "parent",
    }
    parent_agent_fallback["wave_assignments"][1]["completion_receipt"] = {
        **parent_agent_fallback["wave_assignments"][1]["completion_receipt"],
        "receipt_id": "completion-receipt-002",
        "wave_id": "wave-002",
        "assignment_id": "assign-002",
    }
    receipt_ref_mismatch = sample_compile_worklist()
    receipt_ref_mismatch["parallelism_policy"] = {
        **receipt_ref_mismatch["parallelism_policy"],
        "assignment_receipt_refs": ["missing-assignment-receipt"],
    }
    unreferenced_nested_receipt = sample_compile_worklist()
    unreferenced_nested_receipt["parallelism_policy"] = {
        **unreferenced_nested_receipt["parallelism_policy"],
        "assignment_receipt_refs": ["assignment-receipt-001"],
        "completion_receipt_refs": ["completion-receipt-001"],
    }
    wave_without_completion = sample_compile_worklist()
    wave_without_completion["wave_assignments"] = [{**sample_wave(), "completion_receipt": None}]
    complete_run_incomplete_wave = sample_plan_compile_run()
    complete_run_incomplete_wave["compile_wave_contracts"] = [{**sample_wave(), "result_status": "running"}]

    negative_cases = [
        ("native_runtime_rejects_codex_bootstrap_launch_source", "plan_compile_run", native_with_codex_source),
        ("design_only_rejects_native_planning_wizard_launch_source", "plan_compile_run", design_only_with_native_source),
        ("old_stage_name_rejected", "plan_compile_run", stale_stage),
        ("complete_run_requires_terminal_state_receipts_and_waves", "plan_compile_run", terminal_success_inconsistent),
        ("complete_worklist_requires_items_waves_and_receipts", "compile_worklist", empty_complete_worklist),
        ("broad_stage_requires_minimum_parallel_assignments", "compile_worklist", broad_stage_single_agent),
        ("parallel_worklist_rejects_one_wave_below_minimum", "compile_worklist", one_wave_below_minimum),
        ("parallel_worklist_rejects_parent_agent_fallback", "compile_worklist", parent_agent_fallback),
        ("parallel_worklist_rejects_receipt_ref_mismatch", "compile_worklist", receipt_ref_mismatch),
        ("parallel_worklist_rejects_unreferenced_nested_receipt", "compile_worklist", unreferenced_nested_receipt),
        ("complete_wave_requires_completion_receipt", "compile_worklist", wave_without_completion),
        ("complete_plan_compile_run_rejects_incomplete_wave", "plan_compile_run", complete_run_incomplete_wave),
    ]
    for case_id, artifact_kind, payload in negative_cases:
        errors = validate_handoff_fixture(schema, artifact_kind, payload)
        if not errors:
            failures.append({"path": rel(HANDOFF_SCHEMA_PATH), "error": "handoff_negative_fixture_accepted", "case": case_id})
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
        "complete_compile_worklist_zero_items_zero_waves": "complete worklists require items and waves",
        "native_plan_compile_complete_nonterminal_no_receipts": "complete PlanCompileRun requires terminal state and receipts",
        "parallel_worklist_one_wave_below_minimum": "mandatory parallelism requires enough non-parent waves",
        "parallel_worklist_parent_agent_fallback": "mandatory parallelism cannot be satisfied by parent-only fallback",
        "complete_wave_missing_completion_receipt": "complete waves require typed completion receipts",
        "parallel_policy_refs_without_matching_wave_receipts": "parallel receipt refs must match nested wave receipts",
        "complete_plan_compile_run_current_stage_not_terminal": "complete PlanCompileRun requires terminal projection stage",
        "complete_plan_compile_run_incomplete_wave": "complete PlanCompileRun cannot contain incomplete waves",
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
    failures.extend(validate_executable_handoff_fixtures())
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
