#!/usr/bin/env python3
"""Deterministic, standard-library validation for the rolling-trial packet.

The validator is read-only and writes only one JSON object to stdout. It does
not launch the trial, call a model, access the network, or modify any file.
"""

from __future__ import annotations

import hashlib
import json
import re
import sys
from pathlib import Path
from typing import Any, Iterable

import validate_trial_artifacts


ROOT = Path(__file__).resolve().parent
CORE_FILES = (
    "README.md",
    "ROLLING_TRIAL_CONTRACT.json",
    "LAUNCH_REQUEST.schema.json",
    "TRUSTED_LAUNCH_CAPABILITY.schema.json",
    "LAUNCH_AUTHORITY.schema.json",
    "PROTECTED_STATE.schema.json",
    "SOURCE_SNAPSHOT.schema.json",
    "STRUCTURAL_COVERAGE_MAP.schema.json",
    "SURFACE_INSTANCE_LEDGER.schema.json",
    "RESEARCH_OPERATION_CAPTURE.schema.json",
    "RESEARCH_PORTFOLIO.schema.json",
    "RESEARCH_ADEQUACY_RECEIPT.schema.json",
    "REQUIRED_CONTROL_REGISTRY.schema.json",
    "FRESH_CHALLENGE_RECEIPT.schema.json",
    "CAPABILITY_OBLIGATION_GRAPH.schema.json",
    "ASSURANCE_RESULT.schema.json",
    "TRIAL_SUMMARY.schema.json",
    "PILOT_FAMILY_BRIEFS.md",
    "validate_packet.py",
    "validate_trial_artifacts.py",
)
TERMINAL_FILES = ("PACKET_VALIDATION.json", "CONTROLLER_DECISION.json")
ALLOWED_FILES = set(CORE_FILES + TERMINAL_FILES)
PILOTS = (
    "USAGE_ACCOUNTING_TRUTH",
    "WEB_RESEARCH_BEHAVIOR",
    "ACCESSIBILITY_CONTROL_CONTRACTS",
    "MIGRATIONS_DURABLE_STATE",
)
METRICS = (
    "SEMANTIC_COVERAGE",
    "EVIDENCE_SUFFICIENCY",
    "EXACT_SOURCE_RETRIEVAL_DIAGNOSTIC",
    "CLAIM_PRECISION",
    "AUTHORITY_SAFETY",
    "NAMED_SCENARIO_REALIZATION",
    "DISPOSITION_COMPLETENESS",
    "CONTROL_RESULTS",
    "GROUNDED_NOVELTY",
    "CRITICAL_MISSES",
    "COST_AND_LATENCY",
)
AUTHORITY_FALSE_KEYS = (
    "trial_launch_authorized",
    "canonical_plan_writes_authorized",
    "generated_or_governance_writes_authorized",
    "governance_seal_authorized",
    "planning_wizard_implementation_authorized",
    "buildability_certification_authorized",
    "product_or_runtime_certification_authorized",
    "git_write_authorized",
    "external_research_authorized_by_this_packet",
    "model_or_api_calls_authorized_by_this_packet",
)
CONTRIBUTION_EDGES = {
    "supports_obligation",
    "supports_common_intent",
    "grounded_novel",
    "conditional_if_applicable",
    "verification_child",
    "contradicts_obligation",
    "rejected_by_decision",
}


class ValidationError(RuntimeError):
    pass


def load_json(path: Path) -> Any:
    def closed_object(pairs: list[tuple[str, Any]]) -> dict[str, Any]:
        result: dict[str, Any] = {}
        for key, value in pairs:
            if key in result:
                raise ValidationError(f"DUPLICATE_JSON_KEY:{path.name}:{key}")
            result[key] = value
        return result
    try:
        return json.loads(path.read_text(encoding="utf-8"), object_pairs_hook=closed_object)
    except Exception as exc:  # deterministic failure text is enough here
        raise ValidationError(f"JSON_PARSE_FAILED:{path.name}:{type(exc).__name__}") from exc


def sha256(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            h.update(chunk)
    return h.hexdigest()


def check(condition: bool, code: str) -> None:
    if not condition:
        raise ValidationError(code)


def walk_refs(value: Any) -> Iterable[str]:
    if isinstance(value, dict):
        for key, item in value.items():
            if key == "$ref" and isinstance(item, str):
                yield item
            yield from walk_refs(item)
    elif isinstance(value, list):
        for item in value:
            yield from walk_refs(item)


def resolve_local_ref(schema: dict[str, Any], ref: str) -> None:
    check(ref.startswith("#/"), f"NONLOCAL_SCHEMA_REF:{ref}")
    node: Any = schema
    for raw in ref[2:].split("/"):
        key = raw.replace("~1", "/").replace("~0", "~")
        check(isinstance(node, dict) and key in node, f"UNRESOLVED_SCHEMA_REF:{ref}")
        node = node[key]


def validate_schema_file(path: Path) -> dict[str, Any]:
    schema = load_json(path)
    check(isinstance(schema, dict), f"SCHEMA_NOT_OBJECT:{path.name}")
    check(schema.get("$schema") == "https://json-schema.org/draft/2020-12/schema", f"SCHEMA_DRAFT:{path.name}")
    check(isinstance(schema.get("$id"), str) and schema["$id"], f"SCHEMA_ID:{path.name}")
    check(schema.get("type") == "object", f"SCHEMA_ROOT_TYPE:{path.name}")
    check(schema.get("additionalProperties") is False, f"SCHEMA_OPEN_ROOT:{path.name}")
    check(isinstance(schema.get("required"), list) and schema["required"], f"SCHEMA_REQUIRED:{path.name}")
    check(isinstance(schema.get("properties"), dict), f"SCHEMA_PROPERTIES:{path.name}")
    for required in schema["required"]:
        check(required in schema["properties"], f"SCHEMA_REQUIRED_MISSING_PROPERTY:{path.name}:{required}")
    for ref in walk_refs(schema):
        resolve_local_ref(schema, ref)
    return schema


def evidence_paths(markdown: str) -> set[str]:
    found: set[str] = set()
    for match in re.finditer(r"`((?:Plans|tests|scripts)/[^`]+)`", markdown):
        candidate = match.group(1).split(" ", 1)[0]
        candidate = candidate.split("#", 1)[0]
        candidate = candidate.rstrip(".,;:")
        found.add(candidate)
    return found


def main() -> int:
    checks: list[str] = []
    failures: list[str] = []

    try:
        actual_files = {p.name for p in ROOT.iterdir() if p.is_file()}
        missing_core = sorted(set(CORE_FILES) - actual_files)
        extras = sorted(actual_files - ALLOWED_FILES)
        check(not missing_core, f"MISSING_CORE_FILES:{','.join(missing_core)}")
        check(not extras, f"UNEXPECTED_FILES:{','.join(extras)}")
        checks.append("packet_file_population")

        contract = load_json(ROOT / "ROLLING_TRIAL_CONTRACT.json")
        for name in TERMINAL_FILES:
            if (ROOT / name).exists():
                load_json(ROOT / name)
        checks.append("json_syntax")

        schemas = {
            name: validate_schema_file(ROOT / name)
            for name in (
                "LAUNCH_REQUEST.schema.json",
                "TRUSTED_LAUNCH_CAPABILITY.schema.json",
                "LAUNCH_AUTHORITY.schema.json",
                "PROTECTED_STATE.schema.json",
                "SOURCE_SNAPSHOT.schema.json",
                "STRUCTURAL_COVERAGE_MAP.schema.json",
                "SURFACE_INSTANCE_LEDGER.schema.json",
                "RESEARCH_OPERATION_CAPTURE.schema.json",
                "RESEARCH_PORTFOLIO.schema.json",
                "RESEARCH_ADEQUACY_RECEIPT.schema.json",
                "REQUIRED_CONTROL_REGISTRY.schema.json",
                "FRESH_CHALLENGE_RECEIPT.schema.json",
                "CAPABILITY_OBLIGATION_GRAPH.schema.json",
                "ASSURANCE_RESULT.schema.json",
                "TRIAL_SUMMARY.schema.json",
            )
        }
        check(len({s["$id"] for s in schemas.values()}) == 15, "DUPLICATE_SCHEMA_IDS")
        checks.append("json_schema_internal_refs")

        check(contract.get("packet_status") == "design_only_trial_not_authorized", "PACKET_STATUS")
        check(contract["frozen_method_finding"]["terminal_state"] == "FINAL_VALID_NEGATIVE_STOP", "F3_TERMINAL_DRIFT")
        check(contract["frozen_method_finding"]["immutable"] is True, "F3_NOT_IMMUTABLE")
        for key in AUTHORITY_FALSE_KEYS:
            check(contract["authority"].get(key) is False, f"AUTHORITY_NOT_FALSE:{key}")
        check(contract["authority"].get("launch_commands") == [], "LAUNCH_COMMAND_PRESENT")
        check("separate explicit" in contract["authority"]["next_authority_boundary"].lower(), "NEXT_AUTHORITY_BOUNDARY")
        authority_chain = contract["future_launch_authority_chain"]
        check("platform-controlled collaboration sender metadata" in authority_chain["trust_boundary"], "LIVE_AUTHORITY_BOUNDARY")
        check("cannot cryptographically prove" in authority_chain["offline_verification_boundary"], "OFFLINE_AUTHORITY_LIMIT")
        check(authority_chain["unavailable_trust_anchor_terminal"] == "TRIAL_BLOCKED:UNVERIFIABLE_AUTHORITY_LINEAGE", "AUTHORITY_BLOCK_TERMINAL")
        checks.append("nonlaunch_authority")

        bound_ids: set[str] = set()
        for item in contract["bound_inputs"]:
            check(item["id"] not in bound_ids, f"DUPLICATE_BOUND_INPUT:{item['id']}")
            bound_ids.add(item["id"])
            path = Path(item["path"])
            check(path.is_file(), f"BOUND_INPUT_MISSING:{item['id']}")
            check(path.stat().st_size == item["bytes"], f"BOUND_INPUT_BYTES:{item['id']}")
            check(sha256(path) == item["sha256"], f"BOUND_INPUT_HASH:{item['id']}")
        checks.append("bound_input_identity")

        pilot_ids = tuple(contract["trial_scope"]["pilot_family_ids"])
        check(pilot_ids == PILOTS, "PILOT_POPULATION")
        check("four-family semantic pilot" in contract["trial_scope"]["claim_boundary"], "WHOLE_CORPUS_CLAIM_BOUNDARY")
        assurance_enum = tuple(schemas["ASSURANCE_RESULT.schema.json"]["properties"]["family_id"]["enum"])
        check(assurance_enum == PILOTS, "PILOT_SCHEMA_POPULATION")
        briefs = (ROOT / "PILOT_FAMILY_BRIEFS.md").read_text(encoding="utf-8")
        for pilot in PILOTS:
            check(f"`{pilot}`" in briefs, f"PILOT_BRIEF_MISSING:{pilot}")
        check("authentication" in briefs.lower() and "not authentication" in briefs.lower(), "FOURTH_FAMILY_RATIONALE")
        readme = (ROOT / "README.md").read_text(encoding="utf-8")
        check("migrations/durable state" in readme, "README_FOURTH_FAMILY")
        check("authentication/account lifecycle" not in readme, "README_AUTH_FAMILY_DRIFT")
        check("revealed known-answer realization calibration" in briefs, "ACCESSIBILITY_CALIBRATION_LABEL")
        result_props = schemas["ASSURANCE_RESULT.schema.json"]["properties"]
        check(all(key in result_props for key in ("pilot_mode", "discovery_efficacy_eligible", "scale_inference_eligible")), "CALIBRATION_RESULT_FIELDS")
        check(contract["result_dimensions"]["scale_inference_eligible_pilot_ids"] == [PILOTS[0], PILOTS[1], PILOTS[3]], "SCALE_PILOT_SET")
        checks.append("four_pilot_binding")

        topology = contract["topology"]
        check(topology["global_active_unit_ceiling_including_controller"] == 12, "GLOBAL_UNIT_CEILING")
        check(topology["global_specialist_ceiling"] == 11, "SPECIALIST_CEILING")
        check(topology["default_semantic_workers_per_active_capability"] == 2, "DEFAULT_WORKERS")
        check(topology["conditional_failure_workers_per_active_capability_maximum"] == 1, "RECOVERY_WORKERS")
        check("forbidden" in topology["descendant_spawning"], "DESCENDANT_POLICY")
        check(topology["single_writer"] == "TRIAL_CONTROLLER", "SINGLE_WRITER")
        check(all(term in topology["worker_terminal_reporting"] for term in ("DONE", "STOPPED", "MATERIAL_BLOCKER")), "WORKER_TERMINAL_REPORTING")
        roles = contract["roles"]
        role_ids = [role["id"] for role in roles]
        check(len(role_ids) == len(set(role_ids)), "DUPLICATE_ROLE_IDS")
        check(set(role_ids) == {"TRIAL_CONTROLLER", "LOCAL_EXPECTATION_MODELER", "OPEN_DISCOVERY_RESEARCHER", "FAILURE_EVIDENCE_RESEARCHER", "CROSS_FAMILY_CHALLENGER"}, "ROLE_POPULATION")
        challenge = next(role for role in roles if role["id"] == "CROSS_FAMILY_CHALLENGER")
        check(challenge["new_contexts"] == 0 and len(challenge["rotation"]) == 4, "CHALLENGER_ROTATION")
        checks.append("topology_and_roles")

        budgets = contract["budgets"]
        campaign = budgets["campaign"]
        family = budgets["per_family"]
        controller_budget = budgets["controller_merge_and_reporting"]
        numeric_caps = []
        for section in (campaign, family, controller_budget):
            numeric_caps.extend(
                v for k, v in section.items()
                if (k.endswith("maximum") or k.endswith("max"))
                and isinstance(v, int)
                and k != "semantic_retries_maximum"
            )
        check(numeric_caps and all(value > 0 for value in numeric_caps), "NONPOSITIVE_BUDGET")
        check(family["semantic_retries_maximum"] == 0, "SEMANTIC_RETRY_MUST_BE_ZERO")
        check(campaign["all_reported_tokens_maximum"] == 4 * family["family_all_reported_tokens_maximum"] + controller_budget["all_reported_tokens_maximum"], "CAMPAIGN_FAMILY_TOKEN_SUM")
        check(campaign["model_input_tokens_maximum"] == 4 * family["family_input_tokens_maximum"] + controller_budget["input_tokens_maximum"], "CAMPAIGN_INPUT_TOKEN_SUM")
        check(campaign["model_output_tokens_maximum"] == 4 * family["family_output_tokens_maximum"] + controller_budget["output_tokens_maximum"], "CAMPAIGN_OUTPUT_TOKEN_SUM")
        check(campaign["model_input_tokens_maximum"] + campaign["model_output_tokens_maximum"] == campaign["all_reported_tokens_maximum"], "CAMPAIGN_TOKEN_PARTITION")
        check(family["family_input_tokens_maximum"] + family["family_output_tokens_maximum"] == family["family_all_reported_tokens_maximum"], "FAMILY_TOKEN_PARTITION")
        check(2 * family["base_worker_all_reported_tokens_maximum_each"] + family["conditional_failure_worker_all_reported_tokens_maximum"] == family["family_all_reported_tokens_maximum"], "ROLE_FAMILY_TOKEN_SUM")
        check(family["targeted_passes_maximum"] == 4, "TARGETED_PASS_FUSE")
        check(family["closure_cycles_maximum"] == 2, "CLOSURE_CYCLE_FUSE")
        check(campaign["raw_response_bytes_maximum_each"] == 1048576, "RAW_RESPONSE_CAP")
        check(family["artifact_bytes_maximum"] * 4 + campaign["shared_artifact_overhead_bytes_reserved"] == campaign["artifact_bytes_maximum"], "ARTIFACT_BYTE_SUM")
        check(family["artifact_files_maximum"] * 4 + campaign["shared_artifact_overhead_files_reserved"] == campaign["artifact_files_maximum"], "ARTIFACT_FILE_SUM")
        check(contract["budgets"]["token_accounting"]["cached_input_rule"].endswith("never added again"), "TOKEN_DOUBLE_COUNT_RULE")
        checks.append("numeric_budgets_and_fuses")

        metric_ids = tuple(item["id"] for item in contract["metrics"])
        check(metric_ids == METRICS, "METRIC_POPULATION")
        retrieval = next(item for item in contract["metrics"] if item["id"] == "EXACT_SOURCE_RETRIEVAL_DIAGNOSTIC")
        check(retrieval["may_cap_semantic_credit"] is False, "EXACT_SOURCE_CAP")
        semantic = next(item for item in contract["metrics"] if item["id"] == "SEMANTIC_COVERAGE")
        check(semantic["semantic_credit_uses_exact_source_identity"] is False, "SEMANTIC_SOURCE_IDENTITY")
        graph_schema = schemas["CAPABILITY_OBLIGATION_GRAPH.schema.json"]
        edge_enum = set(graph_schema["$defs"]["edge"]["properties"]["edge_type"]["enum"])
        check(CONTRIBUTION_EDGES <= edge_enum, "CONTRIBUTION_EDGE_SET")
        check("retrieval" not in graph_schema["$defs"], "RETRIEVAL_DIAGNOSTIC_EMBEDDED_DEFINITION")
        check("retrieval_diagnostics_ref" in graph_schema["properties"] and "semantic_graph_sha256" in graph_schema["properties"], "RETRIEVAL_DIAGNOSTIC_SEPARATION")
        node_variants = graph_schema["$defs"]["node"]["oneOf"]
        check(len(node_variants) == 15, "GRAPH_NODE_VARIANT_COUNT")
        result_schema = schemas["ASSURANCE_RESULT.schema.json"]
        result_metric_required = set(result_schema["properties"]["metrics"]["required"])
        check("disposition_completeness" in result_metric_required, "DISPOSITION_METRIC_SCHEMA")
        checks.append("metric_separation")

        stages = contract["stages"]
        stage_ids = [stage["id"] for stage in stages]
        check(len(stage_ids) == len(set(stage_ids)) == 9, "STAGE_POPULATION")
        gate_ids = [gate["id"] for gate in contract["gates"]]
        check(len(gate_ids) == len(set(gate_ids)) == 8, "GATE_POPULATION")
        check(contract["research_policy"]["open_exploration"]["fixed_source_quota"] is None, "MECHANICAL_RESEARCH_QUOTA")
        check(contract["research_policy"]["saturation"]["successive_targeted_passes_required"] == 2, "SATURATION_STREAK")
        check("exact hidden source" in " ".join(contract["stop_rules"]["immediate_fail_closed"]), "EXACT_SOURCE_FAIL_CLOSED")
        check("not runtime" in contract["result_dimensions"]["separation_rule"].lower() or "buildability" in contract["result_dimensions"]["separation_rule"].lower(), "METHOD_PLAN_SEPARATION")
        g5 = next(gate for gate in contract["gates"] if gate["id"] == "G5_REALIZATION_AND_CONTROLS")
        check("Real Plan gaps may remain" in g5["pass"], "METHOD_GATE_COLLAPSES_PLAN_STATUS")
        check(len(contract["plan_slice_gates"]) == 3, "PLAN_SLICE_GATE_POPULATION")
        check(any(state["id"] == "INPUT_DRIFT_STOP" for state in contract["terminal_states"]), "INPUT_DRIFT_TERMINAL")
        checks.append("stages_gates_stop_rules")

        map_schema = schemas["STRUCTURAL_COVERAGE_MAP.schema.json"]
        roles = set(map_schema["$defs"]["artifact_role"]["enum"])
        check("active_machine_contract" in roles and "generated_governance_or_projection" in roles and "unknown" in roles, "STRUCTURAL_ROLE_CLASSES")
        surface_schema = schemas["SURFACE_INSTANCE_LEDGER.schema.json"]
        instance_roles = set(surface_schema["$defs"]["instance"]["properties"]["instance_role"]["enum"])
        check("named_instance" in instance_roles and "contract_template" in instance_roles, "SURFACE_INSTANCE_ROLES")
        summary_props = surface_schema["$defs"]["summary"]["properties"]
        check("named_instances_closed_only_by_template_count" in summary_props, "TEMPLATE_CLOSURE_DIAGNOSTIC")
        research_schema = schemas["RESEARCH_PORTFOLIO.schema.json"]
        check(all(key in research_schema["properties"] for key in ("operation_receipts", "source_cards", "creative_exploration", "research_failures", "unsearched_areas", "portfolio_payload_sha256")), "RESEARCH_TYPED_PORTFOLIO")
        capture_schema = schemas["RESEARCH_OPERATION_CAPTURE.schema.json"]
        check(all(key in capture_schema["properties"] for key in ("request", "response", "operation_id", "capture_payload_sha256")), "RESEARCH_CAPTURE_FIELDS")
        source_card_required = set(research_schema["$defs"]["source_card"]["required"])
        check({"evidence_capture_ref", "response_sha256", "evidence_start_byte", "evidence_end_byte", "evidence_slice_sha256", "claim_key", "relation"} <= source_card_required, "RESEARCH_CARD_CAPTURE_BINDING")
        adequacy_schema = schemas["RESEARCH_ADEQUACY_RECEIPT.schema.json"]
        check(all(key in adequacy_schema["properties"] for key in ("trigger_evaluations", "recovery", "final_state", "receipt_payload_sha256")), "RESEARCH_ADEQUACY_FIELDS")
        control_schema = schemas["REQUIRED_CONTROL_REGISTRY.schema.json"]
        check(all(key in control_schema["properties"] for key in ("controls", "registry_sha256", "frozen_before_plan_comparison")), "CONTROL_REGISTRY_FIELDS")
        challenge_schema = schemas["FRESH_CHALLENGE_RECEIPT.schema.json"]
        check(all(key in challenge_schema["properties"] for key in ("covered_obligation_ids", "covered_instance_ids", "covered_control_ids", "challenge_resource_receipt_id", "challenge_resource_receipt_sha256", "target_locks_ref", "receipt_payload_sha256")), "CHALLENGE_RECEIPT_FIELDS")
        trusted_schema = schemas["TRUSTED_LAUNCH_CAPABILITY.schema.json"]
        check({"authorization_message", "authorization_message_sha256", "observed_message_id", "observed_turn_id", "observed_message_created_at_utc", "consumed_at_utc"} <= set(trusted_schema["required"]), "LIVE_AUTHORITY_MESSAGE_BINDING")
        result_resource_required = set(result_schema["$defs"]["resource"]["required"])
        check({"invocation_id", "activity_kind", "target_family_id", "challenge_id", "activity_binding_sha256"} <= result_resource_required, "RESOURCE_INVOCATION_BINDING")
        checks.append("denominator_and_template_rules")

        self_test = validate_trial_artifacts.run_self_tests()
        check(self_test.get("terminal") == "PASS", "ARTIFACT_VALIDATOR_SELF_TEST")
        check(self_test.get("positive_count", 0) >= 20, "ARTIFACT_VALIDATOR_POSITIVE_TEST_COUNT")
        check(self_test.get("mutation_count", 0) >= 105, "ARTIFACT_VALIDATOR_MUTATION_COUNT")
        check(all(self_test.get("negative_mutations_rejected", {}).values()), "ARTIFACT_VALIDATOR_MUTATION_SURVIVED")
        checks.append("artifact_validator_mutation_suite")

        missing_evidence_paths = sorted(
            path for path in evidence_paths(briefs)
            if not (ROOT.parents[2] / path).exists()
        )
        check(not missing_evidence_paths, f"MISSING_LIVE_EVIDENCE:{','.join(missing_evidence_paths)}")
        checks.append("pilot_live_evidence_paths")

        preflight = contract["future_preflight_baseline_requirements"]
        check("current bytes" in preflight["comparison_basis"] and "not HEAD" in preflight["comparison_basis"], "DIRTY_BASELINE_BASIS")
        check(preflight["allowed_write_roots"] == 1, "FUTURE_WRITE_ROOT_COUNT")
        check("INPUT_DRIFT_STOP" in preflight["concurrent_change_behavior"], "INPUT_DRIFT_TERMINAL")
        check(contract["schemas"].get("cross_artifact_validator") == "validate_trial_artifacts.py", "ARTIFACT_VALIDATOR_NOT_BOUND")
        check(any("ARTIFACT_VALIDATION" in item for item in contract["required_outputs_if_later_authorized"]), "ARTIFACT_VALIDATION_RECEIPT_NOT_REQUIRED")
        checks.append("dirty_baseline_and_invariance_contract")

        artifacts = []
        for name in CORE_FILES:
            path = ROOT / name
            check(path.stat().st_size < 1048576, f"CORE_FILE_OVER_CAP:{name}")
            artifacts.append({"path": name, "bytes": path.stat().st_size, "sha256": sha256(path)})

        output = {
            "schema_version": "1.0.0",
            "validator": "validate_packet.py",
            "terminal": "PASS",
            "checks_passed": checks,
            "check_count": len(checks),
            "failures": [],
            "core_artifacts": artifacts,
            "core_file_count": len(artifacts),
            "core_bytes": sum(item["bytes"] for item in artifacts),
            "terminal_files_present": sorted(name for name in TERMINAL_FILES if (ROOT / name).exists()),
            "hash_scope_note": "PACKET_VALIDATION.json and CONTROLLER_DECISION.json are syntactically checked when present but excluded from this manifest to avoid self-reference.",
            "trial_launched": False,
            "external_research_performed": False,
            "model_calls": 0,
        }
        print(json.dumps(output, sort_keys=True, separators=(",", ":")))
        return 0
    except ValidationError as exc:
        failures.append(str(exc))
        output = {
            "schema_version": "1.0.0",
            "validator": "validate_packet.py",
            "terminal": "FAIL",
            "checks_passed": checks,
            "check_count": len(checks),
            "failures": failures,
            "trial_launched": False,
            "external_research_performed": False,
            "model_calls": 0,
        }
        print(json.dumps(output, sort_keys=True, separators=(",", ":")))
        return 2


if __name__ == "__main__":
    sys.exit(main())
