#!/usr/bin/env python3
"""Cross-artifact validator for a later rolling Plan Assurance trial.

This program is deterministic, local-only, read-only, and safe to
run before or after a separately authorized trial.  JSON Schema constrains the
shape of each artifact; this validator enforces the identities, denominators,
reconciliations, terminal derivations, and method-versus-Plan separation that
JSON Schema cannot express by itself.
"""

from __future__ import annotations

import argparse
import base64
import copy
import hashlib
import json
import math
import re
import subprocess
import sys
import unicodedata
from datetime import datetime
from pathlib import Path
from typing import Any, Callable

from jsonschema import Draft202012Validator


PILOTS = (
    "USAGE_ACCOUNTING_TRUTH",
    "WEB_RESEARCH_BEHAVIOR",
    "ACCESSIBILITY_CONTROL_CONTRACTS",
    "MIGRATIONS_DURABLE_STATE",
)
ROOT = Path(__file__).resolve().parent
SCHEMA_FILES = {
    "launch_request": "LAUNCH_REQUEST.schema.json",
    "trusted_capability": "TRUSTED_LAUNCH_CAPABILITY.schema.json",
    "launch": "LAUNCH_AUTHORITY.schema.json",
    "protected": "PROTECTED_STATE.schema.json",
    "source": "SOURCE_SNAPSHOT.schema.json",
    "structural": "STRUCTURAL_COVERAGE_MAP.schema.json",
    "surface": "SURFACE_INSTANCE_LEDGER.schema.json",
    "research_capture": "RESEARCH_OPERATION_CAPTURE.schema.json",
    "research": "RESEARCH_PORTFOLIO.schema.json",
    "adequacy": "RESEARCH_ADEQUACY_RECEIPT.schema.json",
    "control_registry": "REQUIRED_CONTROL_REGISTRY.schema.json",
    "challenge": "FRESH_CHALLENGE_RECEIPT.schema.json",
    "graph": "CAPABILITY_OBLIGATION_GRAPH.schema.json",
    "result": "ASSURANCE_RESULT.schema.json",
    "summary": "TRIAL_SUMMARY.schema.json",
}
ACTIVE_ROLES = {
    "active_normative_prose",
    "active_machine_contract",
    "navigation_or_decision_index",
}
PREFIX_BY_TYPE = {
    "Capability": "cap-", "SourceRecord": "src-", "EvidenceAssertion": "eva-",
    "ClaimAtom": "clm-", "Obligation": "obl-", "AuthorityRecord": "auth-",
    "RiskRecord": "risk-", "SurfaceInstance": "surf-", "NamedScenario": "scn-",
    "ValidationContract": "val-", "ConsumerInstance": "con-", "PlanAnchor": "anchor-",
    "Decision": "dec-", "NonGoal": "ng-", "Uncertainty": "unc-",
}
CONTRIBUTION_EDGES = {
    "supports_obligation", "supports_common_intent", "grounded_novel",
    "conditional_if_applicable", "verification_child", "contradicts_obligation",
    "rejected_by_decision",
}
SEVERITY_WEIGHT = {"critical": 5, "major": 3, "moderate": 2, "minor": 1}
METHOD_GATES = {
    "G3_DISCOVERY_AND_ADEQUACY", "G4_GRAPH_INTEGRITY",
    "G5_REALIZATION_AND_CONTROLS", "G6_FRONTIER_STABILITY", "G7_TRIAL_REPORTING",
}
PLAN_GATES = {
    "P1_PLAN_SEMANTIC_ENVELOPE", "P2_PLAN_NAMED_REALIZATION",
    "P3_PLAN_DECISION_VISIBILITY",
}
KIND_REQUIRED = {
    "product": {"promised_outcomes", "non_goals", "supported_platforms", "entry_journey_ids"},
    "journey": {"actor_ids", "entrypoint_ids", "surface_ids", "state_ids", "outcome"},
    "entrypoint": {"parent_surface_id", "route_or_trigger", "actor_ids", "preconditions"},
    "control": {"parent_surface_id", "command_id", "handler", "actor_permission_refs", "state_contract", "accessibility_contract", "effect_or_event_refs", "idempotency", "failure_recovery", "automation_scenario_ids"},
    "surface": {"surface_type", "parent_or_host", "entry_routes", "exit_routes", "actor_ids", "state_ids", "control_ids", "platform_variants"},
    "command": {"payload_contract", "result_contract", "handler", "permission", "idempotency", "effect_refs", "consumer_ids"},
    "setting": {"category", "value_contract", "default", "scope", "status_authority", "control_id", "effect_refs"},
    "actor": {"actor_kind", "execution_role", "authority_scope"},
    "state": {"subject_instance_id", "state_machine_ref", "entry_triggers", "exit_triggers", "persistence_authority", "unknown_semantics"},
    "event_type": {"payload_schema", "producer_command_id", "causation_rules", "persistence", "consumer_ids"},
    "service": {"service_contract", "consumer_ids", "failure_states", "authority"},
    "data_store": {"source_of_truth", "persistence_contract", "migration_contract", "consumer_ids"},
    "artifact": {"artifact_type", "schema_ref", "producer_ids", "consumer_ids", "freshness"},
    "provider": {"provider_kind", "capabilities", "authority", "failure_states"},
    "automation_scenario": {"subject_instance_ids", "preconditions", "actor_id", "state_ids", "steps", "oracle", "platform_matrix", "evidence_freshness"},
}
REQUIRED_CONTROLS = {
    "USAGE_ACCOUNTING_TRUTH": {**{f"USG-C{i:02d}": "positive_sentinel" for i in range(1, 7)}, **{f"USG-C{i:02d}": "negative_sentinel" for i in range(7, 9)}},
    "WEB_RESEARCH_BEHAVIOR": {**{f"WEB-C{i:02d}": "positive_sentinel" for i in range(1, 7)}, **{f"WEB-C{i:02d}": "negative_sentinel" for i in range(7, 9)}},
    "ACCESSIBILITY_CONTROL_CONTRACTS": {**{f"A11Y-C{i:02d}": "positive_sentinel" for i in range(1, 6)}, **{f"A11Y-C{i:02d}": "negative_sentinel" for i in range(6, 9)}},
    "MIGRATIONS_DURABLE_STATE": {**{f"MIG-C{i:02d}": "positive_sentinel" for i in range(1, 8)}, **{f"MIG-C{i:02d}": "negative_sentinel" for i in range(8, 10)}},
}
CONTROL_COMPONENTS = (
    "identity", "actors_entrypoints", "surface_consumer", "lifecycle", "authority",
    "failure_recovery", "persistence", "accessibility_user_truth", "wiring",
    "observability_currentness", "oracle", "discretion",
)
RESEARCH_TRIGGERS = {
    "RA_FAILURE_EVIDENCE", "RA_AUTHORITY_CURRENTNESS", "RA_ALTERNATIVE_IMPLEMENTATION",
    "RA_APPLICABILITY_PLATFORM", "RA_CONTRADICTION", "RA_NAMED_CRITICAL_SURFACE",
}


def frozen_control_brief_rows() -> dict[str, dict[str, str]]:
    path = ROOT / "PILOT_FAMILY_BRIEFS.md"
    rows: dict[str, dict[str, str]] = {}
    for line_number, line in enumerate(path.read_text(encoding="utf-8").splitlines(), start=1):
        match = re.fullmatch(r"- `([A-Z0-9]+-C\d{2})`( negative)?: (.+)", line)
        if match:
            control_id, negative_marker, requirement = match.groups()
            rows[control_id] = {
                "requirement_text": requirement,
                "requirement_sha256": hashlib.sha256(requirement.encode("utf-8")).hexdigest(),
                "source_ref": f"PILOT_FAMILY_BRIEFS.md#L{line_number}:{hashlib.sha256(line.encode('utf-8')).hexdigest()}",
                "control_kind": "negative_sentinel" if negative_marker else "positive_sentinel",
            }
    return rows


def canonicalize(value: Any) -> Any:
    if isinstance(value, str):
        return unicodedata.normalize("NFC", value)
    if isinstance(value, list):
        return [canonicalize(item) for item in value]
    if isinstance(value, dict):
        return {canonicalize(str(key)): canonicalize(value[key]) for key in sorted(value)}
    if isinstance(value, float):
        if not math.isfinite(value):
            raise ValueError("NONFINITE_NUMBER")
    return value


def canonical_bytes(value: Any) -> bytes:
    return json.dumps(canonicalize(value), sort_keys=True, ensure_ascii=False,
                      separators=(",", ":"), allow_nan=False).encode("utf-8")


def identity_hash(kind: str, value: Any) -> str:
    preimage = b"pm.plan_assurance.identity.v1\0" + kind.encode("utf-8") + b"\0" + canonical_bytes(value)
    return hashlib.sha256(preimage).hexdigest()


def validator_sha256() -> str:
    return hashlib.sha256(Path(__file__).read_bytes()).hexdigest()


def artifact_hash(kind: str, value: Any) -> str:
    del kind
    return hashlib.sha256(canonical_bytes(value)).hexdigest()


def meaningful(value: Any) -> bool:
    if value is None:
        return False
    if isinstance(value, str):
        return bool(value.strip())
    if isinstance(value, (list, dict, tuple, set)):
        return bool(value)
    return True


def resolve_json_pointer(value: Any, pointer: str) -> Any:
    if pointer == "":
        return value
    if not isinstance(pointer, str) or not pointer.startswith("/"):
        raise ValueError("INVALID_JSON_POINTER")
    current = value
    for raw in pointer[1:].split("/"):
        token = raw.replace("~1", "/").replace("~0", "~")
        if isinstance(current, dict):
            if token not in current:
                raise KeyError(token)
            current = current[token]
        elif isinstance(current, list):
            if token == "-" or not token.isdigit():
                raise KeyError(token)
            current = current[int(token)]
        else:
            raise KeyError(token)
    return current


def machine_value(raw: bytes, parser: str) -> Any:
    text = raw.decode("utf-8")
    if parser == "json":
        return json.loads(text)
    if parser == "jsonl":
        return [json.loads(line) for line in text.splitlines() if line.strip()]
    raise ValueError(f"UNSUPPORTED_MACHINE_PARSER:{parser}")


def markdown_section_semantic_hash(raw: bytes, heading_ancestry: list[str]) -> str:
    text = raw.decode("utf-8")
    normalized = text.replace("\r\n", "\n").replace("\r", "\n")
    return identity_hash("markdown-section-semantic", {
        "parser": "markdown",
        "heading_ancestry": heading_ancestry,
        "text": normalized,
    })


def nested_refs(value: Any) -> list[str]:
    found: list[str] = []
    if isinstance(value, dict):
        for key, item in value.items():
            if key == "$ref" and isinstance(item, str):
                found.append(item)
            found.extend(nested_refs(item))
    elif isinstance(value, list):
        for item in value:
            found.extend(nested_refs(item))
    return sorted(set(found), key=lambda item: item.encode("utf-8"))


def launch_request_binding(obj: dict[str, Any]) -> str:
    return identity_hash("trial-launch-binding", {key: value for key, value in obj.items() if key != "launch_binding_sha256"})


def trusted_capability_payload_hash(obj: dict[str, Any]) -> str:
    return identity_hash("trusted-launch-capability", {key: value for key, value in obj.items() if key != "capability_payload_sha256"})


def authorization_message_hash(obj: dict[str, Any]) -> str:
    return hashlib.sha256(canonical_bytes(obj)).hexdigest()


def research_portfolio_hash(obj: dict[str, Any]) -> str:
    return identity_hash("research-portfolio", {key: value for key, value in obj.items() if key != "portfolio_payload_sha256"})


def research_capture_hash(obj: dict[str, Any]) -> str:
    return identity_hash("research-operation-capture", {key: value for key, value in obj.items() if key != "capture_payload_sha256"})


def resource_activity_binding(obj: dict[str, Any]) -> str:
    return identity_hash("resource-activity", {
        "receipt_id": obj.get("receipt_id"),
        "context_id": obj.get("context_id"),
        "worker_role": obj.get("worker_role"),
        "invocation_id": obj.get("invocation_id"),
        "activity_kind": obj.get("activity_kind"),
        "target_family_id": obj.get("target_family_id"),
        "challenge_id": obj.get("challenge_id"),
        "role_id": obj.get("role_id"),
        "stage_id": obj.get("stage_id"),
        "pass_id": obj.get("pass_id"),
    })


def challenge_target_locks_hash(result: dict[str, Any]) -> str:
    lock_bindings = sorted(
        (
            {"artifact_type": binding.get("artifact_type"), "ref": binding.get("ref"), "sha256": binding.get("sha256"), "producer_context_id": binding.get("producer_context_id")}
            for worker in result.get("worker_receipts", [])
            for binding in worker.get("artifact_bindings", [])
            if str(binding.get("artifact_type", "")).endswith("_LOCK")
        ),
        key=lambda row: (str(row.get("artifact_type")), str(row.get("ref"))),
    )
    return identity_hash("challenge-target-lock-set", lock_bindings)


def validate_cross_family_challenge_resource(challenge: dict[str, Any], target_result: dict[str, Any], challenger_result: dict[str, Any]) -> list[str]:
    f = Findings("CHALLENGE_RESOURCE")
    receipt = next((row for row in challenger_result.get("resource_receipts", []) if row.get("receipt_id") == challenge.get("challenge_resource_receipt_id")), None)
    f.need(receipt is not None, "MISSING")
    if receipt is not None:
        f.need(receipt.get("context_id") == challenge.get("challenger_context_id"), "CONTEXT")
        f.need(receipt.get("activity_kind") == "fresh_challenge" and receipt.get("stage_id") == "S6_CROSS_FAMILY_CHALLENGE" and receipt.get("role_id") == "CROSS_FAMILY_CHALLENGER", "ACTIVITY")
        f.need(receipt.get("target_family_id") == target_result.get("family_id") and receipt.get("challenge_id") == challenge.get("challenge_id") and receipt.get("pass_id") == challenge.get("challenge_id"), "SCOPE")
        f.need(challenge.get("challenge_resource_receipt_sha256") == artifact_hash("resource-receipt", receipt), "HASH")
        try:
            f.need(parse_time(receipt.get("started_at_utc", "")) <= parse_time(challenge.get("started_at_utc", "")) <= parse_time(challenge.get("finished_at_utc", "")) <= parse_time(receipt.get("finished_at_utc", "")), "WINDOW")
        except Exception:
            f.need(False, "TIME")
    f.need(challenge.get("target_locks_sha256") == challenge_target_locks_hash(target_result), "TARGET_LOCKS")
    f.need(challenge.get("target_locks_ref") == f"families/{target_result.get('family_id')}/TARGET_LOCK_SET.json", "TARGET_LOCK_REF")
    return f.codes


def validate_research_capture(obj: dict[str, Any], operation: dict[str, Any] | None = None) -> list[str]:
    f = Findings("RESEARCH_CAPTURE")
    f.need(obj.get("capture_payload_sha256") == research_capture_hash(obj), "PAYLOAD_HASH")
    for name in ("request", "response"):
        try:
            raw = decode_blob(obj.get(name, {}))
            f.need(obj[name].get("bytes") == len(raw) and obj[name].get("sha256") == hashlib.sha256(raw).hexdigest(), f"BLOB_IDENTITY:{name}")
        except Exception:
            f.need(False, f"BLOB_INVALID:{name}")
    try:
        f.need(parse_time(obj.get("started_at_utc", "")) <= parse_time(obj.get("finished_at_utc", "")), "TIME_ORDER")
    except Exception:
        f.need(False, "TIME_PARSE")
    if operation is not None:
        f.need(obj.get("capture_ref") == operation.get("capture_ref") and obj.get("operation_id") == operation.get("operation_id") and obj.get("worker_context_id") == operation.get("worker_context_id") and obj.get("operation_kind") == operation.get("operation_kind") and obj.get("tool_id") == operation.get("tool_id"), "OPERATION_IDENTITY")
        f.need(obj.get("request", {}).get("sha256") == operation.get("request_sha256") and obj.get("response", {}).get("sha256") == operation.get("response_sha256"), "EXCHANGE_HASH")
        f.need(obj.get("started_at_utc") == operation.get("started_at_utc") and obj.get("finished_at_utc") == operation.get("finished_at_utc") and obj.get("terminal") == operation.get("terminal") and obj.get("source_card_ids") == operation.get("source_card_ids"), "OPERATION_OBSERVATION")
        f.need(artifact_hash("research-operation-capture", obj) == operation.get("capture_sha256"), "FILE_HASH")
    return f.codes


def research_adequacy_hash(obj: dict[str, Any]) -> str:
    return identity_hash("research-adequacy", {key: value for key, value in obj.items() if key != "receipt_payload_sha256"})


def control_definition_hash(obj: dict[str, Any]) -> str:
    return identity_hash("required-control-definition", {key: value for key, value in obj.items() if key != "definition_sha256"})


def control_registry_hash(obj: dict[str, Any]) -> str:
    return identity_hash("required-control-registry", {key: value for key, value in obj.items() if key != "registry_sha256"})


def challenge_receipt_hash(obj: dict[str, Any]) -> str:
    return identity_hash("fresh-challenge-receipt", {key: value for key, value in obj.items() if key != "receipt_payload_sha256"})


def validate_research_portfolio(obj: dict[str, Any], surface: dict[str, Any] | None = None, captures: dict[str, dict[str, Any]] | None = None) -> list[str]:
    f = Findings("RESEARCH")
    operations = obj.get("operation_receipts", [])
    cards = obj.get("source_cards", [])
    op_ids = [row.get("operation_id") for row in operations]
    card_ids = [row.get("source_card_id") for row in cards]
    f.unique(op_ids, "DUPLICATE_OPERATION")
    f.unique(card_ids, "DUPLICATE_SOURCE_CARD")
    f.need(obj.get("portfolio_payload_sha256") == research_portfolio_hash(obj), "PAYLOAD_HASH")
    f.need(obj.get("terminal") == "DONE", "PORTFOLIO_NOT_DONE")
    if obj.get("portfolio_kind") == "open_discovery":
        f.need(obj.get("detailed_plan_assertions_withheld_until_lock") is True, "PLAN_ASSERTIONS_NOT_WITHHELD")
    try:
        f.need(parse_time(obj.get("created_at_utc", "")) <= parse_time(obj.get("locked_at_utc", "")), "LOCK_TIME")
    except Exception:
        f.need(False, "TIME_PARSE")
    op_by_id = {row.get("operation_id"): row for row in operations}
    card_by_id = {row.get("source_card_id"): row for row in cards}
    for operation in operations:
        f.need(operation.get("worker_context_id") == obj.get("worker_context_id"), f"OPERATION_CONTEXT:{operation.get('operation_id')}")
        f.need(bool(operation.get("capture_ref")) and bool(operation.get("capture_sha256")), f"OPERATION_CAPTURE:{operation.get('operation_id')}")
        if operation.get("terminal") == "PASS":
            f.need(operation.get("failure_reason") is None, f"PASS_OPERATION_FAILURE:{operation.get('operation_id')}")
        else:
            f.need(bool(operation.get("failure_reason")), f"FAILED_OPERATION_REASON:{operation.get('operation_id')}")
        f.need(all(ref in card_by_id for ref in operation.get("source_card_ids", [])), f"OPERATION_CARD_REF:{operation.get('operation_id')}")
        if operation.get("url") is not None:
            f.need(operation.get("query_or_url_identity_sha256") == hashlib.sha256(str(operation.get("url")).encode("utf-8")).hexdigest(), f"OPERATION_URL_IDENTITY:{operation.get('operation_id')}")
        capture_ref = operation.get("capture_ref")
        f.need(isinstance(capture_ref, str) and not Path(capture_ref).is_absolute() and ".." not in Path(capture_ref).parts, f"OPERATION_CAPTURE_PATH:{operation.get('operation_id')}")
        capture = (captures or {}).get(capture_ref)
        f.need(capture is not None, f"OPERATION_CAPTURE_REQUIRED:{operation.get('operation_id')}")
        if capture is not None:
            f.codes.extend(validate_research_capture(capture, operation))
    successful_searches = [row for row in operations if row.get("operation_kind") == "search" and row.get("terminal") in {"PASS", "PARTIAL"}]
    successful_reads = [row for row in operations if row.get("operation_kind") in {"open", "read", "extract", "browser_observe"} and row.get("terminal") in {"PASS", "PARTIAL"}]
    f.need(bool(successful_searches) and bool(successful_reads), "MANDATORY_EXTERNAL_PULSE")
    for card in cards:
        refs = card.get("operation_receipt_ids", [])
        f.need(all(ref in op_by_id for ref in refs), f"SOURCE_CARD_OPERATION:{card.get('source_card_id')}")
        supporting_reads = [op_by_id[ref] for ref in refs if ref in op_by_id and op_by_id[ref].get("operation_kind") in {"open", "read", "extract", "browser_observe"} and op_by_id[ref].get("terminal") in {"PASS", "PARTIAL"}]
        f.need(bool(supporting_reads), f"SOURCE_CARD_WITHOUT_READ:{card.get('source_card_id')}")
        f.need(all(row.get("url") == card.get("url") for row in supporting_reads), f"SOURCE_CARD_URL:{card.get('source_card_id')}")
        f.need(all(card.get("source_card_id") in row.get("source_card_ids", []) for row in supporting_reads), f"SOURCE_CARD_BACKLINK:{card.get('source_card_id')}")
        f.need(card.get("source_identity_sha256") == identity_hash("research-source-identity", {key: card.get(key) for key in ("url", "publisher_or_author", "source_class", "independence_family")}), f"SOURCE_CARD_IDENTITY:{card.get('source_card_id')}")
        evidence_operation = next((row for row in supporting_reads if row.get("capture_ref") == card.get("evidence_capture_ref")), None)
        f.need(evidence_operation is not None, f"SOURCE_CARD_EVIDENCE_CAPTURE:{card.get('source_card_id')}")
        if evidence_operation is not None:
            capture = (captures or {}).get(card.get("evidence_capture_ref"))
            f.need(capture is not None and card.get("response_sha256") == evidence_operation.get("response_sha256") == (capture or {}).get("response", {}).get("sha256"), f"SOURCE_CARD_RESPONSE_BINDING:{card.get('source_card_id')}")
            try:
                response = decode_blob((capture or {}).get("response", {}))
                start, end = card.get("evidence_start_byte"), card.get("evidence_end_byte")
                valid_range = isinstance(start, int) and isinstance(end, int) and 0 <= start < end <= len(response)
                f.need(valid_range, f"SOURCE_CARD_EVIDENCE_RANGE:{card.get('source_card_id')}")
                selected = response[start:end] if valid_range else b""
                selected_hash = hashlib.sha256(selected).hexdigest()
                f.need(card.get("evidence_slice_sha256") == selected_hash == card.get("content_sha256"), f"SOURCE_CARD_EVIDENCE_HASH:{card.get('source_card_id')}")
                f.need(card.get("locator") == f"bytes:{start}-{end}", f"SOURCE_CARD_LOCATOR:{card.get('source_card_id')}")
                if card.get("entailment") == "direct":
                    f.need(card.get("bounded_claim") == selected.decode("utf-8"), f"SOURCE_CARD_DIRECT_CLAIM:{card.get('source_card_id')}")
            except Exception:
                f.need(False, f"SOURCE_CARD_EVIDENCE_DECODE:{card.get('source_card_id')}")
    creative = obj.get("creative_exploration", {})
    rows = creative.get("rows", [])
    f.need(creative.get("followed_material_surprises") is True, "MATERIAL_SURPRISES_NOT_FOLLOWED")
    for row in rows:
        f.need(all(ref in card_by_id for ref in row.get("source_card_ids", [])), f"CREATIVE_SOURCE:{row.get('creative_id')}")
    if creative.get("outcome") == "material_findings":
        f.need(bool(rows) and creative.get("no_material_findings_rationale") is None, "MATERIAL_CREATIVE_OUTCOME")
    else:
        f.need(not rows and bool(creative.get("no_material_findings_rationale")), "NO_MATERIAL_CREATIVE_OUTCOME")
    if surface is not None:
        f.need(obj.get("trial_id") == surface.get("trial_id"), "TRIAL_ID")
        f.need(obj.get("surface_ledger_sha256") == artifact_hash("surface-ledger", surface), "SURFACE_BINDING")
        eligible_surface_ids = {member for denominator in surface.get("denominator_sets", []) if denominator.get("capability_id") == obj.get("family_id") for member in denominator.get("member_instance_ids", [])}
        for card in cards:
            f.need(set(card.get("named_surface_ids", [])) <= eligible_surface_ids, f"SOURCE_CARD_SURFACE_REF:{card.get('source_card_id')}")
    return f.codes


def derive_research_trigger_truth(risk_tier: str, family_id: str, cards: list[dict[str, Any]], surface: dict[str, Any] | None, unsearched_areas: list[dict[str, Any]]) -> dict[str, bool]:
    def qualifies(card: dict[str, Any], classes: set[str], roles: set[str]) -> bool:
        return (
            card.get("source_class") in classes
            and bool(set(card.get("evidence_roles", [])) & roles)
            and card.get("entailment") == "direct"
            and card.get("relation") in {"supports", "applicability"}
            and card.get("currentness") == "current"
            and card.get("applicability") in {"applicable", "conditional"}
            and card.get("authority_fitness") in {"fit", "limited"}
            and card.get("content_sha256") == card.get("evidence_slice_sha256")
            and bool(card.get("evidence_capture_ref"))
            and bool(card.get("response_sha256"))
        )
    failure_cards = [row for row in cards if qualifies(row, {"issue_failure", "implementation_test"}, {"failure_existence"})]
    authority_cards = [row for row in cards if qualifies(row, {"official", "standard_regulation"}, {"normative_constraint"})]
    alternative_cards = [row for row in cards if qualifies(row, {"implementation_test", "direct_comparator", "adjacent_alternative"}, {"implementation_behavior", "comparator_behavior", "adjacent_inspiration"})]
    applicability_cards = [row for row in cards if qualifies(row, {"official", "standard_regulation", "implementation_test"}, {"applicability"})]
    contradiction_groups: dict[str, set[str]] = {}
    for card in cards:
        if card.get("entailment") == "direct" and card.get("currentness") == "current" and card.get("applicability") in {"applicable", "conditional"} and card.get("authority_fitness") in {"fit", "limited"}:
            contradiction_groups.setdefault(str(card.get("claim_key")), set()).add(str(card.get("relation")))
    contradiction_present = any({"supports", "contradicts"} <= relations for relations in contradiction_groups.values())
    required_surface_ids: set[str] = set()
    if surface is not None:
        required_surface_ids = {member for denominator in surface.get("denominator_sets", []) if denominator.get("capability_id") == family_id for member in denominator.get("member_instance_ids", []) if next((row for row in surface.get("instances", []) if row.get("instance_id") == member), {}).get("risk_tier") == "R3"}
    covered_failure_surfaces = {surface_id for row in failure_cards for surface_id in row.get("named_surface_ids", [])}
    material_applicability_unknown = any(any(token in str(row.get("subject", "")).lower() for token in ("platform", "applicability")) and row.get("materiality") in {"critical", "major"} for row in unsearched_areas)
    return {
        "RA_FAILURE_EVIDENCE": risk_tier == "R3" and not failure_cards,
        "RA_AUTHORITY_CURRENTNESS": risk_tier == "R3" and not authority_cards,
        "RA_ALTERNATIVE_IMPLEMENTATION": not alternative_cards,
        "RA_APPLICABILITY_PLATFORM": risk_tier == "R3" and (not applicability_cards or material_applicability_unknown),
        "RA_CONTRADICTION": contradiction_present,
        "RA_NAMED_CRITICAL_SURFACE": bool(required_surface_ids - covered_failure_surfaces),
    }


def validate_research_adequacy(obj: dict[str, Any], portfolio: dict[str, Any] | None = None, workers: list[dict[str, Any]] | None = None, surface: dict[str, Any] | None = None, failure_portfolio: dict[str, Any] | None = None) -> list[str]:
    f = Findings("ADEQUACY")
    triggers = obj.get("trigger_evaluations", [])
    f.unique([row.get("trigger_id") for row in triggers], "DUPLICATE_TRIGGER")
    f.need({row.get("trigger_id") for row in triggers} == RESEARCH_TRIGGERS, "TRIGGER_POPULATION")
    f.need(all(bool(row.get("evidence_refs")) and bool(row.get("rationale")) for row in triggers), "TRIGGER_EVIDENCE")
    f.need(obj.get("receipt_payload_sha256") == research_adequacy_hash(obj), "PAYLOAD_HASH")
    card_ids: set[str] = set()
    cards: list[dict[str, Any]] = []
    if portfolio is None:
        f.need(False, "PORTFOLIO_REQUIRED")
    else:
        cards = portfolio.get("source_cards", [])
        card_ids = {row.get("source_card_id") for row in cards}
        f.need(obj.get("trial_id") == portfolio.get("trial_id") and obj.get("family_id") == portfolio.get("family_id") and obj.get("generation_id") == portfolio.get("generation_id"), "PORTFOLIO_IDENTITY")
        f.need(obj.get("open_portfolio_sha256") == artifact_hash("research-portfolio", portfolio), "PORTFOLIO_BINDING")
        f.need(all(set(row.get("evidence_refs", [])) <= card_ids for row in triggers), "TRIGGER_CARD_REF")
    trigger_by_id = {row.get("trigger_id"): row for row in triggers}
    if surface is None:
        f.need(False, "SURFACE_REQUIRED")
    expected_trigger_truth = derive_research_trigger_truth(obj.get("risk_tier"), obj.get("family_id"), cards, surface, (portfolio or {}).get("unsearched_areas", []))
    for trigger_id, expected in expected_trigger_truth.items():
        f.need(trigger_by_id.get(trigger_id, {}).get("state") == ("true" if expected else "false"), f"TRIGGER_DERIVATION:{trigger_id}")
    true_ids = {row.get("trigger_id") for row in triggers if row.get("state") == "true"}
    recovery = obj.get("recovery", {})
    f.need(recovery.get("required") is bool(true_ids) and set(recovery.get("reason_trigger_ids", [])) == true_ids, "RECOVERY_DERIVATION")
    failure_workers = [row for row in (workers or []) if row.get("worker_role") == "FAILURE_EVIDENCE_RESEARCHER"]
    if true_ids:
        f.need(len(failure_workers) == 1, "RECOVERY_WORKER_POPULATION")
        if failure_workers:
            f.need(recovery.get("worker_context_id") == failure_workers[0].get("context_id") and recovery.get("worker_terminal") == failure_workers[0].get("terminal"), "RECOVERY_WORKER_BINDING")
        f.need(failure_portfolio is not None, "FAILURE_PORTFOLIO_REQUIRED")
        if failure_portfolio is not None:
            f.need(failure_portfolio.get("portfolio_kind") == "failure_recovery" and failure_portfolio.get("trial_id") == obj.get("trial_id") and failure_portfolio.get("family_id") == obj.get("family_id") and failure_portfolio.get("generation_id") == obj.get("generation_id") and failure_portfolio.get("worker_context_id") == recovery.get("worker_context_id"), "FAILURE_PORTFOLIO_IDENTITY")
            f.need(recovery.get("failure_portfolio_sha256") == artifact_hash("research-portfolio", failure_portfolio), "FAILURE_PORTFOLIO_BINDING")
            failure_worker = failure_workers[0] if failure_workers else {}
            portfolio_binding = next((row for row in failure_worker.get("artifact_bindings", []) if row.get("artifact_type") == "RESEARCH_PORTFOLIO_FAILURE"), {})
            f.need(portfolio_binding.get("ref") == recovery.get("failure_portfolio_ref") and portfolio_binding.get("sha256") == recovery.get("failure_portfolio_sha256") and portfolio_binding.get("schema_id") == failure_portfolio.get("schema_id"), "FAILURE_WORKER_PORTFOLIO_BINDING")
        combined_cards = cards + ((failure_portfolio or {}).get("source_cards", []))
        combined_unsearched = (portfolio or {}).get("unsearched_areas", []) + ((failure_portfolio or {}).get("unsearched_areas", []))
        post_recovery_truth = derive_research_trigger_truth(obj.get("risk_tier"), obj.get("family_id"), combined_cards, surface, combined_unsearched)
        unresolved_after_recovery = {trigger_id for trigger_id in true_ids if post_recovery_truth.get(trigger_id) is True}
        f.need(set(recovery.get("remaining_gap_ids", [])) == unresolved_after_recovery, "RECOVERY_GAP_DERIVATION")
        f.need(set(obj.get("unresolved_adequacy_gap_ids", [])) == unresolved_after_recovery, "TOP_LEVEL_ADEQUACY_GAP_DERIVATION")
        complete = failure_portfolio is not None and recovery.get("worker_terminal") == "DONE" and bool(recovery.get("failure_portfolio_ref")) and bool(recovery.get("failure_portfolio_sha256")) and not unresolved_after_recovery and not obj.get("unresolved_adequacy_gap_ids")
        f.need((obj.get("final_state"), obj.get("terminal")) == (("sufficient", "PASS") if complete else ("research_limited", "RESEARCH_LIMITED")), "RECOVERY_TERMINAL")
    else:
        f.need(failure_portfolio is None, "UNNEEDED_FAILURE_PORTFOLIO")
        f.need(not failure_workers and all(recovery.get(key) is None for key in ("worker_context_id", "worker_terminal", "failure_portfolio_ref", "failure_portfolio_sha256")) and not recovery.get("remaining_gap_ids") and recovery.get("unavailable_reason") is None, "UNNEEDED_RECOVERY")
        f.need(obj.get("final_state") == "sufficient" and obj.get("terminal") == "PASS" and not obj.get("unresolved_adequacy_gap_ids"), "ADEQUACY_TERMINAL")
    return f.codes


def validate_control_registry(obj: dict[str, Any], surface: dict[str, Any] | None = None) -> list[str]:
    f = Findings("CONTROL_REGISTRY")
    controls = obj.get("controls", [])
    f.unique([row.get("control_id") for row in controls], "DUPLICATE_CONTROL")
    required = {(family, control_id): kind for family, rows in REQUIRED_CONTROLS.items() for control_id, kind in rows.items()}
    actual_common = {(row.get("family_id"), row.get("control_id")): row.get("control_kind") for row in controls if row.get("origin") == "common_visible_brief"}
    f.need(actual_common == required, "REQUIRED_CONTROL_POPULATION")
    f.need(obj.get("registry_sha256") == control_registry_hash(obj), "PAYLOAD_HASH")
    briefs = ROOT / "PILOT_FAMILY_BRIEFS.md"
    f.need(briefs.is_file() and obj.get("pilot_briefs_sha256") == hashlib.sha256(briefs.read_bytes()).hexdigest(), "PILOT_BRIEFS_BINDING")
    frozen_rows = frozen_control_brief_rows()
    f.need(set(frozen_rows) == {control_id for rows in REQUIRED_CONTROLS.values() for control_id in rows}, "PILOT_BRIEF_CONTROL_POPULATION")
    ledger: dict[str, dict[str, Any]] = {}
    denominator_members: set[str] = set()
    if surface is not None:
        ledger = {row.get("instance_id"): row for row in surface.get("instances", [])}
        denominator_members = {member for row in surface.get("denominator_sets", []) for member in row.get("member_instance_ids", [])}
        f.need(obj.get("trial_id") == surface.get("trial_id") and obj.get("surface_ledger_sha256") == artifact_hash("surface-ledger", surface), "SURFACE_BINDING")
    for row in controls:
        f.need(row.get("requirement_sha256") == hashlib.sha256(str(row.get("requirement_text", "")).encode()).hexdigest(), f"REQUIREMENT_HASH:{row.get('control_id')}")
        if row.get("origin") == "common_visible_brief":
            expected_brief = frozen_rows.get(row.get("control_id"), {})
            f.need(row.get("requirement_text") == expected_brief.get("requirement_text") and row.get("requirement_sha256") == expected_brief.get("requirement_sha256") and row.get("source_refs") == [expected_brief.get("source_ref")] and row.get("control_kind") == expected_brief.get("control_kind") and row.get("applicability") == "required", f"FROZEN_BRIEF_BINDING:{row.get('control_id')}")
        f.need(row.get("definition_sha256") == control_definition_hash(row), f"DEFINITION_HASH:{row.get('control_id')}")
        expected = row.get("expected_instance_ids", [])
        unresolved = row.get("unresolved_identity_selectors", [])
        if row.get("identity_status") == "resolved":
            f.need(bool(expected) and not unresolved, f"RESOLVED_IDENTITY:{row.get('control_id')}")
            if surface is not None:
                for instance_id in expected:
                    instance = ledger.get(instance_id, {})
                    f.need(instance_id in denominator_members and instance.get("instance_role") in {"named_instance", "parameterized_instance_set"} and instance.get("lifecycle") == "active" and instance.get("applicability") in {"applicable", "conditional"} and row.get("family_id") in instance.get("capability_ids", []), f"CONTROL_INSTANCE:{row.get('control_id')}:{instance_id}")
        else:
            f.need(not expected and bool(unresolved), f"UNRESOLVED_IDENTITY:{row.get('control_id')}")
    return f.codes


def validate_challenge_receipt(obj: dict[str, Any], graph: dict[str, Any] | None = None, surface: dict[str, Any] | None = None, registry: dict[str, Any] | None = None) -> list[str]:
    f = Findings("CHALLENGE")
    f.need(obj.get("receipt_payload_sha256") == challenge_receipt_hash(obj), "PAYLOAD_HASH")
    f.need(obj.get("target_family_id") != obj.get("challenger_family_id"), "SELF_CHALLENGE")
    f.unique([row.get("finding_id") for row in obj.get("findings", [])], "DUPLICATE_FINDING")
    f.need(obj.get("terminal") == "DONE" and obj.get("all_findings_dispositioned") is True, "TERMINAL")
    try:
        f.need(parse_time(obj.get("started_at_utc", "")) <= parse_time(obj.get("finished_at_utc", "")), "TIME_ORDER")
    except Exception:
        f.need(False, "TIME_PARSE")
    if graph is not None:
        f.need(obj.get("trial_id") == graph.get("trial_id") and obj.get("target_family_id") == graph.get("capability_id") and obj.get("target_graph_sha256") == graph.get("semantic_graph_sha256"), "GRAPH_BINDING")
        required_obligations = {row.get("id") for row in graph.get("nodes", []) if row.get("node_type") == "Obligation" and any(next((node for node in graph.get("nodes", []) if node.get("id") == risk), {}).get("payload", {}).get("severity") in {"critical", "major"} for risk in row.get("payload", {}).get("risk_refs", []))}
        f.need(set(obj.get("covered_obligation_ids", [])) == required_obligations, "OBLIGATION_COVERAGE")
        graph_ids = {row.get("id") for row in graph.get("nodes", [])}
    else:
        graph_ids = set()
    if surface is not None:
        required_instances = {member for row in surface.get("denominator_sets", []) if row.get("capability_id") == obj.get("target_family_id") for member in row.get("member_instance_ids", [])}
        f.need(set(obj.get("covered_instance_ids", [])) == required_instances, "INSTANCE_COVERAGE")
    if registry is not None:
        required_controls = {row.get("control_id") for row in registry.get("controls", []) if row.get("family_id") == obj.get("target_family_id")}
        f.need(obj.get("target_control_registry_sha256") == artifact_hash("control-registry", registry), "REGISTRY_BINDING")
        f.need(set(obj.get("covered_control_ids", [])) == required_controls, "CONTROL_COVERAGE")
    else:
        required_controls = set()
    surface_ids = {row.get("instance_id") for row in (surface or {}).get("instances", [])}
    resolvable_targets = graph_ids | required_controls | surface_ids
    for finding in obj.get("findings", []):
        f.need(set(finding.get("target_refs", [])) <= resolvable_targets, f"FINDING_TARGET_REF:{finding.get('finding_id')}")
        f.need(set(finding.get("evidence_refs", [])) <= resolvable_targets, f"FINDING_EVIDENCE_REF:{finding.get('finding_id')}")
        f.need(finding.get("disposition_ref") in resolvable_targets, f"FINDING_DISPOSITION_REF:{finding.get('finding_id')}")
        disposition_type = next((row.get("node_type") for row in (graph or {}).get("nodes", []) if row.get("id") == finding.get("disposition_ref")), None)
        permitted_disposition_types = {
            "repaired": {"ValidationContract", "PlanAnchor"},
            "accepted_residual": {"Decision", "Uncertainty"},
            "not_applicable": {"AuthorityRecord", "Decision"},
            "blocked": {"Obligation", "Uncertainty"},
        }
        f.need(disposition_type in permitted_disposition_types.get(finding.get("disposition"), set()), f"FINDING_DISPOSITION_TYPE:{finding.get('finding_id')}")
    return f.codes


def decode_blob(blob: dict[str, Any]) -> bytes:
    if blob.get("encoding") != "base64" or not isinstance(blob.get("data"), str):
        raise ValueError("INVALID_BLOB_ENCODING")
    return base64.b64decode(blob["data"], validate=True)


def encoded_blob(raw: bytes) -> dict[str, Any]:
    return {"encoding": "base64", "bytes": len(raw), "sha256": hashlib.sha256(raw).hexdigest(), "data": base64.b64encode(raw).decode("ascii")}


def protected_state_payload_hash(obj: dict[str, Any]) -> str:
    git = obj.get("git_state", {})
    normalized_names = ("status_porcelain_v1_z_excluding_run_root", "index_entries_z", "staged_diff_binary", "tracked_diff_binary")
    payload = {
        "contract_sha256": obj.get("contract_sha256"),
        "repository_root": obj.get("repository_root"),
        "authorized_run_root": obj.get("authorized_run_root"),
        "collector_sha256": obj.get("collector_sha256"),
        "command_contract_sha256": obj.get("command_contract_sha256"),
        "head_commit": git.get("head_commit"),
        "head_tree": git.get("head_tree"),
        "symbolic_ref": git.get("symbolic_ref"),
        "normalized_git_blobs": {name: {"bytes": git.get(name, {}).get("bytes"), "sha256": git.get(name, {}).get("sha256")} for name in normalized_names},
        "protected_entries": sorted(obj.get("protected_entries", []), key=lambda row: (row.get("scope_id", ""), row.get("path", ""))),
        "source_snapshot_population_sha256": obj.get("source_snapshot_population_sha256"),
    }
    return identity_hash("protected-repository-state", payload)


def validate_protected_state(obj: dict[str, Any], phase: str | None = None, source_snapshot: dict[str, Any] | None = None, contract_sha256: str | None = None) -> list[str]:
    f = Findings("PROTECTED_STATE")
    if phase is not None:
        f.need(obj.get("phase") == phase, "PHASE")
    if contract_sha256 is not None:
        f.need(obj.get("contract_sha256") == contract_sha256, "CONTRACT_BINDING")
    if source_snapshot is not None:
        f.need(obj.get("trial_id") == source_snapshot.get("trial_id"), "TRIAL_ID")
        f.need(obj.get("source_snapshot_population_sha256") == source_snapshot.get("population_sha256"), "SOURCE_POPULATION")
    entries = obj.get("protected_entries", [])
    f.unique([(row.get("scope_id"), row.get("path")) for row in entries], "DUPLICATE_PROTECTED_ENTRY")
    git = obj.get("git_state", {})
    for name in ("status_porcelain_v1_z_raw", "status_porcelain_v1_z_excluding_run_root", "index_entries_z", "staged_diff_binary", "tracked_diff_binary"):
        try:
            raw = decode_blob(git.get(name, {}))
            f.need(git[name].get("bytes") == len(raw) and git[name].get("sha256") == hashlib.sha256(raw).hexdigest(), f"BLOB_IDENTITY:{name}")
        except Exception:
            f.need(False, f"BLOB_INVALID:{name}")
    f.need(obj.get("state_payload_sha256") == protected_state_payload_hash(obj), "STATE_PAYLOAD_HASH")
    if obj.get("phase") == "BEFORE":
        f.need(obj.get("run_root_exists") is False, "BEFORE_RUN_ROOT")
    if obj.get("phase") == "AFTER":
        f.need(obj.get("run_root_exists") is True, "AFTER_RUN_ROOT")
    if obj.get("terminal") == "PASS":
        f.need(not f.codes, "FALSE_PASS")
    return f.codes


def validate_launch_request(obj: dict[str, Any], contract: dict[str, Any] | None = None) -> list[str]:
    f = Findings("LAUNCH_REQUEST")
    f.need(obj.get("launch_binding_sha256") == launch_request_binding(obj), "BINDING_HASH")
    f.need(obj.get("max_uses") == 1, "SINGLE_USE")
    f.need(obj.get("authority_delivery_mode") == "codex_system_collaboration_envelope" and obj.get("request_status") == "AWAITING_EXTERNAL_ATTESTATION", "ATTESTATION_MODE")
    f.need(obj.get("requesting_task_path") != obj.get("expected_authority_task_path"), "SELF_AUTHORITY_TASK")
    try:
        f.need(parse_time(obj.get("created_at_utc", "")) < parse_time(obj.get("expires_at_utc", "")), "EXPIRY")
    except Exception:
        f.need(False, "TIME_PARSE")
    if contract is not None:
        f.need(obj.get("budget_contract_sha256") == artifact_hash("budget-contract", contract.get("budgets", {})), "BUDGET_BINDING")
        f.need(obj.get("topology_contract_sha256") == artifact_hash("topology-contract", contract.get("topology", {})), "TOPOLOGY_BINDING")
    return f.codes


def validate_trusted_capability_bindings(obj: dict[str, Any], request: dict[str, Any] | None = None) -> list[str]:
    f = Findings("TRUSTED_CAPABILITY")
    f.need(obj.get("capability_payload_sha256") == trusted_capability_payload_hash(obj), "PAYLOAD_HASH")
    f.need(obj.get("terminal") == "LIVE_ATTESTATION_CONSUMED" and obj.get("max_uses") == 1 and obj.get("authority_mode") == "codex_live_orchestrator_sender" and obj.get("offline_cryptographic_verification") is False, "AUTHORIZATION_STATE")
    message = obj.get("authorization_message", {})
    f.need(isinstance(message, dict) and obj.get("authorization_message_sha256") == authorization_message_hash(message), "AUTHORIZATION_MESSAGE_HASH")
    f.need(message.get("decision") == "AUTHORIZE_ONE_LIVE_TURN", "AUTHORIZATION_DECISION")
    f.need(message.get("target_task_path") == obj.get("target_task_path"), "AUTHORIZATION_TARGET")
    f.need(message.get("approved_launch_binding_sha256") == obj.get("approved_launch_binding_sha256"), "AUTHORIZATION_BINDING")
    f.need(message.get("approved_external_transmission_manifest_sha256") == obj.get("approved_external_transmission_manifest_sha256"), "AUTHORIZATION_TRANSMISSION")
    f.need(message.get("exact_execution_envelope_sha256") == obj.get("exact_execution_envelope_sha256"), "AUTHORIZATION_EXECUTION_ENVELOPE")
    f.need(message.get("one_use_nonce_sha256") == obj.get("one_use_nonce_sha256"), "AUTHORIZATION_NONCE")
    f.need(message.get("expires_at_utc") == obj.get("expires_at_utc"), "AUTHORIZATION_EXPIRY")
    f.need(message.get("external_research_authorized") is True and message.get("model_calls_authorized") is True and message.get("canonical_plan_writes_authorized") is False and message.get("generated_or_governance_writes_authorized") is False and message.get("git_write_authorized") is False, "AUTHORIZATION_SCOPE")
    try:
        issued = parse_time(obj.get("issued_at_utc", ""))
        created = parse_time(obj.get("observed_message_created_at_utc", ""))
        consumed = parse_time(obj.get("consumed_at_utc", ""))
        expires = parse_time(obj.get("expires_at_utc", ""))
        f.need(issued == created <= consumed <= expires, "EXPIRY")
    except Exception:
        f.need(False, "TIME_PARSE")
    if request is not None:
        f.need(obj.get("launch_request_sha256") == hashlib.sha256(canonical_bytes(request)).hexdigest(), "REQUEST_HASH")
        f.need(message.get("request_sha256") == obj.get("launch_request_sha256"), "AUTHORIZATION_REQUEST_HASH")
        f.need(obj.get("approved_launch_binding_sha256") == request.get("launch_binding_sha256"), "APPROVED_BINDING")
        f.need(obj.get("approved_external_transmission_manifest_sha256") == request.get("external_transmission_manifest_sha256"), "TRANSMISSION_SCOPE")
        f.need(obj.get("exact_execution_envelope_sha256") == request.get("exact_execution_envelope_sha256"), "EXECUTION_ENVELOPE")
        f.need(obj.get("observed_sender_task_path") == request.get("expected_authority_task_path") and obj.get("target_task_path") == request.get("requesting_task_path"), "TASK_PATH_SCOPE")
        try:
            f.need(parse_time(request.get("created_at_utc", "")) <= parse_time(obj.get("observed_message_created_at_utc", "")) <= parse_time(request.get("expires_at_utc", "")), "REQUEST_WINDOW")
            f.need(obj.get("expires_at_utc") == request.get("expires_at_utc"), "REQUEST_EXPIRY_BINDING")
        except Exception:
            f.need(False, "REQUEST_TIME_PARSE")
    return f.codes


def validate_trusted_capability(
    obj: dict[str, Any],
    request: dict[str, Any] | None = None,
    live_system_sender: str | None = None,
    live_target_task: str | None = None,
    live_message_payload: dict[str, Any] | None = None,
    live_message_id: str | None = None,
    live_turn_id: str | None = None,
    live_message_created_at_utc: str | None = None,
    live_observed_at_utc: str | None = None,
) -> list[str]:
    """Validate bindings plus platform-live sender, message, turn, and time facts.

    Callers without platform-controlled sender metadata must use
    validate_trusted_capability_bindings and must not interpret that offline
    result as authorization to launch.
    """
    f = Findings("TRUSTED_CAPABILITY")
    f.codes.extend(validate_trusted_capability_bindings(obj, request))
    f.need(all(value is not None for value in (live_system_sender, live_target_task, live_message_payload, live_message_id, live_turn_id, live_message_created_at_utc, live_observed_at_utc)), "LIVE_ATTESTATION_REQUIRED")
    if live_system_sender is not None:
        f.need(obj.get("observed_sender_task_path") == live_system_sender, "LIVE_SENDER_MISMATCH")
    if live_target_task is not None:
        f.need(obj.get("target_task_path") == live_target_task, "LIVE_TARGET_MISMATCH")
    if live_message_payload is not None:
        f.need(obj.get("authorization_message") == live_message_payload and obj.get("authorization_message_sha256") == authorization_message_hash(live_message_payload), "LIVE_MESSAGE_MISMATCH")
    if live_message_id is not None:
        f.need(obj.get("observed_message_id") == live_message_id, "LIVE_MESSAGE_ID_MISMATCH")
    if live_turn_id is not None:
        f.need(obj.get("observed_turn_id") == live_turn_id, "LIVE_TURN_MISMATCH")
    if live_message_created_at_utc is not None:
        f.need(obj.get("observed_message_created_at_utc") == live_message_created_at_utc, "LIVE_MESSAGE_TIME_MISMATCH")
    if live_observed_at_utc is not None:
        f.need(obj.get("consumed_at_utc") == live_observed_at_utc, "LIVE_OBSERVED_TIME_MISMATCH")
        try:
            f.need(parse_time(obj.get("observed_message_created_at_utc", "")) <= parse_time(live_observed_at_utc) <= parse_time(obj.get("expires_at_utc", "")), "LIVE_EXPIRY")
        except Exception:
            f.need(False, "LIVE_TIME_PARSE")
    return f.codes


def normalize_status_for_run_root(raw: bytes, run_relative: str) -> bytes:
    records = raw.split(b"\0")
    kept: list[bytes] = []
    index = 0
    prefix = run_relative.encode("utf-8")
    while index < len(records):
        record = records[index]
        index += 1
        if not record:
            continue
        status = record[:2]
        path = record[3:] if len(record) >= 3 else b""
        touches = path == prefix or path.startswith(prefix + b"/")
        rename_extra: bytes | None = None
        if b"R" in status or b"C" in status:
            if index < len(records):
                rename_extra = records[index]
                index += 1
                touches = touches or rename_extra == prefix or rename_extra.startswith(prefix + b"/")
        if status == b"??" and touches:
            continue
        if touches:
            raise ValueError("TRACKED_OR_STAGED_RUN_ROOT_ENTRY")
        kept.append(record)
        if rename_extra is not None:
            kept.append(rename_extra)
    return b"\0".join(kept) + (b"\0" if kept else b"")


def git_bytes(repo_root: Path, argv: list[str]) -> bytes:
    env = {"PATH": "/usr/bin:/bin:/usr/sbin:/sbin", "LC_ALL": "C", "LANG": "C", "GIT_OPTIONAL_LOCKS": "0", "GIT_PAGER": "cat"}
    result = subprocess.run(argv, cwd=repo_root, env=env, stdin=subprocess.DEVNULL, stdout=subprocess.PIPE, stderr=subprocess.PIPE, check=False)
    if result.returncode != 0:
        raise RuntimeError(f"GIT_OBSERVATION_FAILED:{argv[1]}:{result.returncode}")
    return result.stdout


def capture_git_state(repo_root: Path, run_root: Path) -> dict[str, Any]:
    run_relative = run_root.resolve().relative_to(repo_root.resolve()).as_posix()
    raw_status = git_bytes(repo_root, ["/usr/bin/git", "status", "--porcelain=v1", "-z", "--untracked-files=all"])
    symbolic = subprocess.run(["/usr/bin/git", "symbolic-ref", "-q", "HEAD"], cwd=repo_root, env={"PATH": "/usr/bin:/bin:/usr/sbin:/sbin", "LC_ALL": "C", "LANG": "C", "GIT_OPTIONAL_LOCKS": "0", "GIT_PAGER": "cat"}, stdin=subprocess.DEVNULL, stdout=subprocess.PIPE, stderr=subprocess.PIPE, check=False)
    if symbolic.returncode not in {0, 1}:
        raise RuntimeError("GIT_SYMBOLIC_REF_FAILED")
    return {
        "head_commit": git_bytes(repo_root, ["/usr/bin/git", "rev-parse", "--verify", "HEAD^{commit}"]).strip().decode("ascii"),
        "head_tree": git_bytes(repo_root, ["/usr/bin/git", "rev-parse", "--verify", "HEAD^{tree}"]).strip().decode("ascii"),
        "symbolic_ref": symbolic.stdout.strip().decode("utf-8") or None,
        "status_porcelain_v1_z_raw": encoded_blob(raw_status),
        "status_porcelain_v1_z_excluding_run_root": encoded_blob(normalize_status_for_run_root(raw_status, run_relative)),
        "index_entries_z": encoded_blob(git_bytes(repo_root, ["/usr/bin/git", "ls-files", "--stage", "-z"])),
        "staged_diff_binary": encoded_blob(git_bytes(repo_root, ["/usr/bin/git", "diff", "--cached", "--binary", "--no-ext-diff", "--no-textconv"])),
        "tracked_diff_binary": encoded_blob(git_bytes(repo_root, ["/usr/bin/git", "diff", "--binary", "--no-ext-diff", "--no-textconv"])),
    }


def parse_time(value: str) -> datetime:
    return datetime.fromisoformat(value.replace("Z", "+00:00"))


def elapsed_ms(start: str, finish: str) -> int:
    return int((parse_time(finish) - parse_time(start)).total_seconds() * 1000)


def node_content_hash(row: dict[str, Any]) -> str:
    return identity_hash("graph-node-content", {
        "node_type": row.get("node_type"),
        "identity_basis": row.get("identity_basis"),
        "payload": row.get("payload"),
    })


def contains_forbidden_retrieval_key(value: Any) -> bool:
    if isinstance(value, dict):
        for key, item in value.items():
            normalized = str(key).lower()
            if any(token in normalized for token in ("retrieval_diagnostic", "exact_source", "hidden_source", "hidden_url", "benchmark_source")):
                return True
            if contains_forbidden_retrieval_key(item):
                return True
    elif isinstance(value, list):
        return any(contains_forbidden_retrieval_key(item) for item in value)
    return False


def schema_findings(kind: str, value: dict[str, Any]) -> list[str]:
    schema = json.loads((ROOT / SCHEMA_FILES[kind]).read_text(encoding="utf-8"))
    errors = sorted(Draft202012Validator(schema).iter_errors(value), key=lambda error: list(error.absolute_path))
    return [f"SCHEMA:{kind}:{'/'.join(map(str, error.absolute_path)) or '$'}:{error.validator}" for error in errors]


class Findings:
    def __init__(self, scope: str) -> None:
        self.scope = scope
        self.codes: list[str] = []

    def need(self, condition: bool, code: str) -> None:
        if not condition:
            self.codes.append(f"{self.scope}:{code}")

    def unique(self, values: list[Any], code: str) -> None:
        try:
            self.need(len(values) == len(set(values)), code)
        except TypeError:
            self.need(False, code)


def ids_by(*arrays: list[dict[str, Any]]) -> set[str]:
    result: set[str] = set()
    for rows in arrays:
        for row in rows:
            for key in ("document_id", "section_id", "machine_node_id", "plan_unit_id", "acceptance_key", "instance_id", "id"):
                if key in row:
                    result.add(row[key])
                    break
    return result


def snapshot_population_hash(entries: list[dict[str, Any]]) -> str:
    rows = [{key: row.get(key) for key in ("path", "entry_kind", "mode", "bytes", "sha256")} for row in sorted(entries, key=lambda item: item.get("path", ""))]
    return identity_hash("source-snapshot-population", rows)


def inventory_source_root(root: Path, excluded_root: Path | None = None) -> list[dict[str, Any]]:
    base = root.parent
    rows: list[dict[str, Any]] = []
    paths = [root] + sorted((p for p in root.rglob("*") if excluded_root is None or (p != excluded_root and excluded_root not in p.parents)), key=lambda p: unicodedata.normalize("NFC", p.relative_to(base).as_posix()).encode("utf-8"))
    for path in paths:
        stat = path.lstat()
        relative = unicodedata.normalize("NFC", path.relative_to(base).as_posix())
        if path.is_symlink():
            kind = "symlink"; size = None; digest = None
        elif path.is_file():
            kind = "regular_file"; size = stat.st_size; digest = hashlib.sha256(path.read_bytes()).hexdigest()
        elif path.is_dir():
            kind = "directory"; size = None; digest = None
        else:
            kind = "nonregular"; size = None; digest = None
        rows.append({"path": relative, "entry_kind": kind, "mode": stat.st_mode & 0o7777, "bytes": size, "sha256": digest})
    return rows


def validate_source_snapshot(obj: dict[str, Any], source_root: Path | None = None, require_live: bool = False, excluded_root: Path | None = None) -> list[str]:
    f = Findings("SOURCE_SNAPSHOT")
    entries = obj.get("entries", [])
    paths = [row.get("path") for row in entries]
    f.need(bool(entries), "EMPTY_POPULATION")
    f.unique(paths, "DUPLICATE_PATH")
    f.need(all(unicodedata.normalize("NFC", str(path)) == path for path in paths), "PATH_NOT_NFC")
    f.need(obj.get("regular_file_count") == sum(row.get("entry_kind") == "regular_file" for row in entries), "FILE_COUNT")
    f.need(obj.get("directory_entry_count") == sum(row.get("entry_kind") == "directory" for row in entries), "DIRECTORY_COUNT")
    f.need(obj.get("population_sha256") == snapshot_population_hash(entries), "POPULATION_HASH")
    declared_exclusion = Path(obj.get("excluded_future_run_root", ""))
    if excluded_root is not None:
        f.need(declared_exclusion == excluded_root, "EXCLUDED_RUN_ROOT_MISMATCH")
    f.need(obj.get("excluded_future_run_root_absent_at_freeze") is True, "RUN_ROOT_FREEZE_PRECONDITION")
    for row in entries:
        regular = row.get("entry_kind") == "regular_file"
        f.need((isinstance(row.get("bytes"), int) and isinstance(row.get("sha256"), str)) if regular else (row.get("bytes") is None and row.get("sha256") is None), f"ENTRY_SHAPE:{row.get('path')}")
        f.need(row.get("entry_kind") not in {"symlink", "nonregular"}, f"UNSAFE_ENTRY:{row.get('path')}")
    if source_root is not None:
        f.need(source_root.is_dir(), "SOURCE_ROOT_MISSING")
        if source_root.is_dir():
            f.need(entries == inventory_source_root(source_root, excluded_root), "LIVE_POPULATION_MISMATCH")
    if obj.get("terminal") == "PASS":
        if require_live:
            f.need(source_root is not None, "PASS_REQUIRES_LIVE_ROOT")
        f.need(not f.codes, "FALSE_PASS")
    return f.codes


def structural_rebuild_hash(obj: dict[str, Any]) -> str:
    keys = ("population", "documents", "sections", "machine_nodes", "plan_units", "acceptance_units", "references", "owner_consumer_edges", "capability_assignments", "identity_aliases")
    return identity_hash("structural-clean-rebuild", {key: obj.get(key, []) for key in keys})


def validate_structural_source_binding(structural: dict[str, Any], source: dict[str, Any]) -> list[str]:
    f = Findings("STRUCTURAL_SOURCE")
    f.need(structural.get("trial_id") == source.get("trial_id"), "TRIAL_ID_MISMATCH")
    source_files = [{"path": row.get("path"), "mode": row.get("mode"), "bytes": row.get("bytes"), "sha256": row.get("sha256")} for row in source.get("entries", []) if row.get("entry_kind") == "regular_file"]
    structural_files = [{key: row.get(key) for key in ("path", "mode", "bytes", "sha256")} for row in structural.get("population", [])]
    f.need(sorted(source_files, key=lambda row: row["path"]) == sorted(structural_files, key=lambda row: row["path"]), "REGULAR_FILE_POPULATION_MISMATCH")
    f.need(structural.get("snapshot", {}).get("regular_file_count") == source.get("regular_file_count"), "FILE_COUNT")
    f.need(structural.get("snapshot", {}).get("directory_entry_count") == source.get("directory_entry_count"), "DIRECTORY_COUNT")
    return f.codes


def validate_structural(obj: dict[str, Any], source_bytes_by_path: dict[str, bytes] | None = None) -> list[str]:
    f = Findings("STRUCTURAL")
    boundary = obj.get("claim_boundary", {})
    f.need(boundary.get("whole_corpus_structural_coverage") is True, "CLAIM_BOUNDARY_STRUCTURAL")
    f.need(boundary.get("whole_corpus_semantic_assurance") is False, "CLAIM_BOUNDARY_SEMANTIC")
    f.need(tuple(boundary.get("semantic_pilot_family_ids", [])) == PILOTS, "PILOT_POPULATION")

    population = obj.get("population", [])
    documents = obj.get("documents", [])
    sections = obj.get("sections", [])
    machine = obj.get("machine_nodes", [])
    units = obj.get("plan_units", [])
    acceptance = obj.get("acceptance_units", [])
    references = obj.get("references", [])
    edges = obj.get("owner_consumer_edges", [])
    assignments = obj.get("capability_assignments", [])
    snapshot = obj.get("snapshot", {})
    completeness = obj.get("completeness", {})
    f.need(obj.get("artifact_validator_sha256") == validator_sha256(), "VALIDATOR_IDENTITY")
    f.need(bool(population), "EMPTY_POPULATION")

    paths = [row.get("path") for row in population]
    f.unique(paths, "DUPLICATE_POPULATION_PATH")
    f.need(snapshot.get("regular_file_count") == len(population), "SNAPSHOT_FILE_COUNT")
    manifest = [{k: row.get(k) for k in ("path", "mode", "bytes", "sha256")} for row in sorted(population, key=lambda r: r.get("path", ""))]
    f.need(snapshot.get("population_sha256") == identity_hash("structural-population", manifest), "POPULATION_HASH")
    pop_by_path = {row.get("path"): row for row in population}
    for row in population:
        role = row.get("artifact_role")
        f.need(role != "unknown", f"UNKNOWN_ROLE:{row.get('path')}")
        f.need(row.get("semantic_authority") is (role in ACTIVE_ROLES), f"AUTHORITY_ROLE:{row.get('path')}")
        if role in ACTIVE_ROLES:
            f.need(row.get("exclusion_reason") is None, f"ACTIVE_EXCLUDED:{row.get('path')}")
        else:
            f.need(bool(row.get("exclusion_reason")), f"EXCLUSION_UNJUSTIFIED:{row.get('path')}")
        if source_bytes_by_path is not None:
            raw = source_bytes_by_path.get(row.get("path"))
            f.need(raw is not None, f"SOURCE_BYTES_REQUIRED:{row.get('path')}")
            if raw is not None:
                f.need(len(raw) == row.get("bytes") and hashlib.sha256(raw).hexdigest() == row.get("sha256"), f"SOURCE_IDENTITY:{row.get('path')}")

    all_ids: list[str] = []
    for rows, key in ((documents, "document_id"), (sections, "section_id"), (machine, "machine_node_id"),
                      (units, "plan_unit_id"), (acceptance, "acceptance_key")):
        values = [row.get(key) for row in rows]
        f.unique(values, f"DUPLICATE_{key.upper()}")
        all_ids.extend(values)
    f.unique(all_ids, "CROSS_KIND_ID_COLLISION")
    known = set(all_ids)

    doc_by_id = {row.get("document_id"): row for row in documents}
    doc_by_path = {row.get("path"): row for row in documents}
    authoritative_population_paths = {row["path"] for row in population if row.get("semantic_authority")}
    f.need(authoritative_population_paths <= set(doc_by_path), "AUTHORITATIVE_POPULATION_DOCUMENT_OMITTED")
    for doc in documents:
        pop = pop_by_path.get(doc.get("path"))
        f.need(pop is not None, f"DOCUMENT_NOT_IN_POPULATION:{doc.get('document_id')}")
        if pop:
            f.need(doc.get("sha256") == pop.get("sha256"), f"DOCUMENT_HASH:{doc.get('document_id')}")
            f.need(doc.get("artifact_role") == pop.get("artifact_role"), f"DOCUMENT_ROLE:{doc.get('document_id')}")
            f.need(doc.get("semantic_authority") == pop.get("semantic_authority"), f"DOCUMENT_AUTHORITY:{doc.get('document_id')}")

    section_by_id = {row.get("section_id"): row for row in sections}

    def section_heading_ancestry(section: dict[str, Any]) -> list[str]:
        chain: list[str] = []
        seen: set[str] = set()
        current: dict[str, Any] | None = section
        while current is not None:
            current_id = current.get("section_id")
            if current_id in seen:
                break
            seen.add(current_id)
            heading = current.get("heading_or_pointer")
            if heading:
                chain.append(heading)
            parent_id = current.get("parent_section_id")
            current = section_by_id.get(parent_id) if parent_id is not None else None
        return list(reversed(chain))

    for section in sections:
        doc = doc_by_id.get(section.get("document_id"))
        f.need(doc is not None, f"SECTION_DOCUMENT:{section.get('section_id')}")
        parent = section.get("parent_section_id")
        f.need(parent is None or parent in section_by_id, f"SECTION_PARENT:{section.get('section_id')}")
        span = section.get("range", {})
        f.need(isinstance(span.get("start_byte"), int) and isinstance(span.get("end_byte"), int) and span.get("start_byte", 1) <= span.get("end_byte", 0), f"SECTION_RANGE:{section.get('section_id')}")
        if doc:
            f.need(span.get("end_byte", 0) <= pop_by_path[doc["path"]].get("bytes", -1), f"SECTION_OUT_OF_RANGE:{section.get('section_id')}")
            if source_bytes_by_path is not None:
                raw_document = source_bytes_by_path.get(doc.get("path"))
                f.need(raw_document is not None, f"SECTION_SOURCE_BYTES_REQUIRED:{section.get('section_id')}")
                if raw_document is not None and isinstance(span.get("start_byte"), int) and isinstance(span.get("end_byte"), int):
                    start = span["start_byte"]; end = span["end_byte"]
                    if 0 <= start <= end <= len(raw_document):
                        raw_section = raw_document[start:end]
                        f.need(section.get("content_sha256") == hashlib.sha256(raw_section).hexdigest(), f"SECTION_CONTENT_HASH:{section.get('section_id')}")
                        try:
                            f.need(section.get("semantic_anchor_sha256") == markdown_section_semantic_hash(raw_section, section_heading_ancestry(section)), f"SECTION_SEMANTIC_HASH:{section.get('section_id')}")
                            first_line = raw_section.decode("utf-8").splitlines()[0] if raw_section else ""
                            heading = section.get("heading_or_pointer", "")
                            if heading:
                                f.need(first_line == heading, f"SECTION_HEADING:{section.get('section_id')}")
                            else:
                                f.need(re.match(r"^#{1,6}(?:\s|$)", first_line) is None, f"SECTION_PREAMBLE_HEADING:{section.get('section_id')}")
                        except Exception:
                            f.need(False, f"SECTION_UTF8_OR_SEMANTIC:{section.get('section_id')}")
                        expected_start_line = raw_document[:start].count(b"\n") + 1
                        expected_end_line = expected_start_line if end == start else raw_document[:max(start, end - 1)].count(b"\n") + 1
                        f.need(span.get("start_line") == expected_start_line and span.get("end_line") == expected_end_line, f"SECTION_LINE_RANGE:{section.get('section_id')}")

    for doc in documents:
        pop = pop_by_path.get(doc.get("path"), {})
        if pop.get("parser") != "markdown":
            continue
        spans = sorted((s["range"]["start_byte"], s["range"]["end_byte"]) for s in sections if s.get("document_id") == doc.get("document_id"))
        f.need(bool(spans), f"MARKDOWN_UNPARTITIONED:{doc.get('document_id')}")
        if spans:
            f.need(spans[0][0] == 0 and spans[-1][1] == pop.get("bytes"), f"MARKDOWN_NOT_RECONSTRUCTABLE:{doc.get('document_id')}")
            f.need(all(spans[i][1] == spans[i + 1][0] for i in range(len(spans) - 1)), f"SECTION_GAP_OR_OVERLAP:{doc.get('document_id')}")

    machine_by_id = {row.get("machine_node_id"): row for row in machine}
    parsed_machine_docs: dict[str, Any] = {}
    local_ref_total = 0
    unresolved_local_refs = 0
    for node in machine:
        doc = doc_by_id.get(node.get("document_id"))
        f.need(doc is not None and doc.get("artifact_role") == "active_machine_contract", f"MACHINE_DOCUMENT:{node.get('machine_node_id')}")
        parent = node.get("parent_machine_node_id")
        f.need(parent is None or parent in machine_by_id, f"MACHINE_PARENT:{node.get('machine_node_id')}")
        if doc is not None:
            path = doc.get("path")
            raw = (source_bytes_by_path or {}).get(path)
            f.need(raw is not None, f"MACHINE_SOURCE_BYTES_REQUIRED:{node.get('machine_node_id')}")
            if raw is not None:
                pop = pop_by_path.get(path, {})
                f.need(len(raw) == pop.get("bytes") and hashlib.sha256(raw).hexdigest() == pop.get("sha256"), f"MACHINE_SOURCE_IDENTITY:{node.get('machine_node_id')}")
                try:
                    parsed = parsed_machine_docs.setdefault(path, machine_value(raw, pop.get("parser")))
                    selected = resolve_json_pointer(parsed, node.get("json_pointer", ""))
                    expected_kind = "object" if isinstance(selected, dict) else ("array" if isinstance(selected, list) else "scalar")
                    declared_kind = node.get("node_kind")
                    f.need(declared_kind == expected_kind or (expected_kind == "object" and declared_kind in {"schema_definition", "registry_entry", "fixture_case"}) or (expected_kind == "array" and declared_kind == "row"), f"MACHINE_NODE_KIND:{node.get('machine_node_id')}")
                    f.need(node.get("content_sha256") == identity_hash("machine-node-content", selected), f"MACHINE_NODE_CONTENT:{node.get('machine_node_id')}")
                    refs = nested_refs(selected)
                    local_ref_total += len(refs)
                    f.need(node.get("local_ref_targets") == refs, f"MACHINE_LOCAL_REF_INVENTORY:{node.get('machine_node_id')}")
                    for ref in refs:
                        try:
                            if ref.startswith("#"):
                                resolve_json_pointer(parsed, ref[1:])
                            else:
                                target_path, _, fragment = ref.partition("#")
                                normalized = (Path(path).parent / target_path).as_posix()
                                if not normalized.startswith("Plans/") or ".." in Path(normalized).parts:
                                    raise ValueError("MACHINE_REF_PATH")
                                target_raw = (source_bytes_by_path or {}).get(normalized)
                                if target_raw is None:
                                    raise KeyError("MACHINE_REF_TARGET")
                                target_pop = pop_by_path.get(normalized, {})
                                target_value = machine_value(target_raw, target_pop.get("parser"))
                                resolve_json_pointer(target_value, fragment)
                        except Exception:
                            unresolved_local_refs += 1
                            f.need(False, f"MACHINE_REF_UNRESOLVED:{node.get('machine_node_id')}:{ref}")
                except Exception as exc:
                    f.need(False, f"MACHINE_POINTER_OR_REF:{node.get('machine_node_id')}:{type(exc).__name__}")
    active_machine_paths = {row["path"] for row in population if row.get("artifact_role") == "active_machine_contract"}
    active_machine_docs = {d["document_id"] for d in documents if d.get("path") in active_machine_paths}
    f.need(active_machine_paths <= set(doc_by_path), "ACTIVE_MACHINE_POPULATION_DOCUMENT_OMITTED")
    mapped_machine_docs = {n.get("document_id") for n in machine}
    f.need(active_machine_docs <= mapped_machine_docs, "ACTIVE_MACHINE_DOCUMENT_UNMAPPED")
    f.need(all(any(node.get("document_id") == document_id and node.get("json_pointer") == "" for node in machine) for document_id in active_machine_docs), "ACTIVE_MACHINE_ROOT_UNMAPPED")

    unit_by_id = {row.get("plan_unit_id"): row for row in units}
    acceptance_by_id = {row.get("acceptance_key"): row for row in acceptance}
    for unit in units:
        f.need(unit.get("section_id") in section_by_id, f"UNIT_SECTION:{unit.get('plan_unit_id')}")
        f.need(unit.get("owner_doc_id") in doc_by_id, f"UNIT_OWNER:{unit.get('plan_unit_id')}")
        f.need(set(unit.get("acceptance_keys", [])) == {a["acceptance_key"] for a in acceptance if a.get("plan_unit_id") == unit.get("plan_unit_id")}, f"UNIT_ACCEPTANCE_SET:{unit.get('plan_unit_id')}")
    for row in acceptance:
        f.need(row.get("plan_unit_id") in unit_by_id, f"ACCEPTANCE_UNIT:{row.get('acceptance_key')}")
        f.need(row.get("section_id") in section_by_id, f"ACCEPTANCE_SECTION:{row.get('acceptance_key')}")

    for ref in references:
        f.need(ref.get("source_node_id") in known, f"REFERENCE_SOURCE:{ref.get('reference_id')}")
        target = ref.get("target", {})
        if target.get("kind") == "internal_node":
            f.need(target.get("node_id") in known, f"REFERENCE_TARGET:{ref.get('reference_id')}")
            f.need(ref.get("resolution") == "resolved", f"REFERENCE_RESOLUTION:{ref.get('reference_id')}")
        else:
            f.need(ref.get("resolution") != "resolved", f"EXTERNAL_REFERENCE_RESOLVED:{ref.get('reference_id')}")
    for edge in edges:
        f.need(edge.get("from_node_id") in known and edge.get("to_node_id") in known, f"OWNER_EDGE_ENDPOINT:{edge.get('edge_id')}")

    assignment_by_source = {row.get("source_node_id"): row for row in assignments}
    authoritative = {d["document_id"] for d in documents if d.get("semantic_authority")}
    authoritative |= {s["section_id"] for s in sections if s.get("authority") == "owner"}
    authoritative |= {n["machine_node_id"] for n in machine if n.get("semantic_authority")}
    authoritative |= set(unit_by_id) | set(acceptance_by_id)
    f.need(authoritative <= set(assignment_by_source), "AUTHORITATIVE_NODE_UNASSIGNED")
    for source, assignment in assignment_by_source.items():
        f.need(source in known, f"ASSIGNMENT_SOURCE:{source}")
        if assignment.get("disposition") == "assigned":
            f.need(bool(assignment.get("capability_ids")), f"ASSIGNMENT_EMPTY:{source}")

    invalidation = obj.get("invalidation", {})
    f.need(invalidation.get("current_population_sha256") == snapshot.get("population_sha256"), "INVALIDATION_SNAPSHOT")
    f.need(invalidation.get("invalidation_closure_pass") is True, "INVALIDATION_CLOSURE")
    changed = set(invalidation.get("changed_node_ids", [])) | set(invalidation.get("added_node_ids", [])) | set(invalidation.get("deleted_node_ids", []))
    propagation = invalidation.get("propagation_edges", [])
    propagated = {edge.get("from_node_id") for edge in propagation}
    if invalidation.get("prior_snapshot_id") is None:
        f.need(invalidation.get("prior_population_sha256") is None, "INITIAL_INVALIDATION_PRIOR_HASH")
        f.need(not changed and not propagation and not invalidation.get("impacted_capability_ids") and not invalidation.get("impacted_seam_ids") and not invalidation.get("impacted_reference_ids") and not invalidation.get("cache_reuse_sha256s"), "INITIAL_INVALIDATION_MUST_BE_EMPTY")
    else:
        f.need(False, "V1_INCREMENTAL_INVALIDATION_UNSUPPORTED")
        f.need(invalidation.get("prior_population_sha256") is not None, "INCREMENTAL_INVALIDATION_PRIOR_HASH")
        f.need(changed <= known, "INVALIDATION_UNKNOWN_CHANGED_NODE")
        for edge in propagation:
            f.need(edge.get("from_node_id") in known and edge.get("to_node_id") in known, f"INVALIDATION_EDGE_ENDPOINT:{edge.get('from_node_id')}:{edge.get('to_node_id')}")
        if changed:
            f.need(changed <= propagated, "INVALIDATION_CHANGED_NODE_NOT_PROPAGATED")
            assigned_capabilities = {cap for source in changed for cap in assignment_by_source.get(source, {}).get("capability_ids", [])}
            f.need(assigned_capabilities <= set(invalidation.get("impacted_capability_ids", [])), "INVALIDATION_CAPABILITY_CLOSURE")

    expected = {
        "population_rows": len(population), "unknown_paths": sum(r.get("artifact_role") == "unknown" for r in population),
        "canonical_documents": sum(d.get("semantic_authority") for d in documents),
        "mapped_canonical_documents": sum(d.get("semantic_authority") and d.get("document_id") in assignment_by_source for d in documents),
        "active_machine_contracts": len(active_machine_docs), "mapped_active_machine_contracts": len(active_machine_docs & mapped_machine_docs),
        "machine_nodes": len(machine), "mapped_machine_nodes": sum(bool(n.get("capability_ids")) for n in machine),
        "local_json_refs": local_ref_total, "unresolved_local_json_refs": unresolved_local_refs,
        "substantive_sections": sum(s.get("substantive") for s in sections),
        "mapped_substantive_sections": sum(s.get("substantive") and s.get("section_id") in assignment_by_source for s in sections),
        "plan_units": len(units), "mapped_plan_units": sum(u.get("plan_unit_id") in assignment_by_source for u in units),
        "acceptance_units": len(acceptance), "mapped_acceptance_units": sum(a.get("acceptance_key") in assignment_by_source for a in acceptance),
        "relevant_crossrefs": len(references), "resolved_crossrefs": sum(r.get("resolution") in {"resolved", "external", "future", "retired"} for r in references),
        "ambiguous_references": sum(r.get("resolution") == "ambiguous" for r in references),
        "unresolved_references": sum(r.get("resolution") in {"unresolved", "typo"} for r in references),
        "excluded_paths": sum(r.get("artifact_role") not in ACTIVE_ROLES for r in population),
        "excluded_paths_with_reason": sum(r.get("artifact_role") not in ACTIVE_ROLES and bool(r.get("exclusion_reason")) for r in population),
        "duplicate_ids": len(all_ids) - len(set(all_ids)),
        "unassigned_authoritative_nodes": len(authoritative - set(assignment_by_source)),
    }
    for key, value in expected.items():
        f.need(completeness.get(key) == value, f"COMPLETENESS_RECONCILIATION:{key}")
    pass_terminal = completeness.get("terminal") == "PASS"
    if pass_terminal:
        f.need(not f.codes, "FALSE_PASS")
        f.need(completeness.get("population_manifest_pass") is True, "POPULATION_MANIFEST_PASS")
        f.need(completeness.get("reconstruction_pass") is True, "RECONSTRUCTION_PASS")
        f.need(completeness.get("deterministic_rebuild_pass") is True, "REBUILD_PASS")
        rebuilt = structural_rebuild_hash(obj)
        f.need(completeness.get("primary_rebuild_root_sha256") == rebuilt and completeness.get("clean_rebuild_root_sha256") == rebuilt, "REBUILD_HASH_MISMATCH")
        f.need(completeness.get("validator_sha256") == obj.get("artifact_validator_sha256"), "VALIDATOR_BINDING")
    return f.codes


def has_cycle(parents: dict[str, list[str]]) -> bool:
    visiting: set[str] = set()
    done: set[str] = set()
    def visit(node: str) -> bool:
        if node in visiting:
            return True
        if node in done:
            return False
        visiting.add(node)
        if any(visit(parent) for parent in parents.get(node, []) if parent in parents):
            return True
        visiting.remove(node)
        done.add(node)
        return False
    return any(visit(node) for node in parents)


def validate_surface(obj: dict[str, Any], structural: dict[str, Any] | None = None) -> list[str]:
    f = Findings("SURFACE")
    instances = obj.get("instances", [])
    candidates = obj.get("candidate_inventory", [])
    relations = obj.get("relations", [])
    aliases = obj.get("aliases", [])
    denominators = obj.get("denominator_sets", [])
    summary = obj.get("summary", {})
    f.need(obj.get("snapshot", {}).get("artifact_validator_sha256") == validator_sha256(), "VALIDATOR_IDENTITY")
    ids = [row.get("instance_id") for row in instances]
    f.unique(ids, "DUPLICATE_INSTANCE")
    by_id = {row.get("instance_id"): row for row in instances}
    candidate_ids = [row.get("candidate_id") for row in candidates]
    f.unique(candidate_ids, "DUPLICATE_CANDIDATE")
    candidate_keys = [(row.get("capability_id"), row.get("kind"), row.get("canonical_key")) for row in candidates]
    f.unique(candidate_keys, "DUPLICATE_CANDIDATE_IDENTITY")
    f.need(bool(instances), "EMPTY_INSTANCES")
    parents: dict[str, list[str]] = {}
    for row in instances:
        parents[row["instance_id"]] = row.get("parent_instance_ids", [])
        f.need(all(parent in by_id for parent in row.get("parent_instance_ids", [])), f"PARENT_REF:{row.get('instance_id')}")
        required = KIND_REQUIRED.get(row.get("kind"), set())
        f.need(required <= set(row.get("kind_contract", {})), f"KIND_CONTRACT:{row.get('instance_id')}")
        for key in required:
            value = row.get("kind_contract", {}).get(key)
            f.need(meaningful(value), f"KIND_CONTRACT_VALUE:{row.get('instance_id')}:{key}")
        coverage = row.get("template_coverage")
        if row.get("instance_role") == "contract_template":
            f.need(isinstance(coverage, dict), f"TEMPLATE_COVERAGE_MISSING:{row.get('instance_id')}")
            if isinstance(coverage, dict):
                covered = coverage.get("covers_instance_ids", [])
                f.need(all(item in by_id and item != row.get("instance_id") for item in covered), f"TEMPLATE_TARGET:{row.get('instance_id')}")
                f.need(bool(covered) or bool(coverage.get("instance_set_ref")), f"TEMPLATE_COVERAGE_EMPTY:{row.get('instance_id')}")
        else:
            f.need(coverage is None, f"NONTEMPLATE_COVERAGE:{row.get('instance_id')}")
    if structural is not None:
        f.need(obj.get("trial_id") == structural.get("trial_id"), "TRIAL_ID_MISMATCH")
        f.need(obj.get("snapshot", {}).get("structural_map_sha256") == artifact_hash("structural-map", structural), "STRUCTURAL_BINDING")
        f.need(obj.get("snapshot", {}).get("source_manifest_sha256") == structural.get("snapshot", {}).get("population_sha256"), "SOURCE_MANIFEST_BINDING")
        population = {row.get("path"): row for row in structural.get("population", [])}
        documents = {row.get("document_id"): row for row in structural.get("documents", [])}
        docs_by_path = {row.get("path"): row for row in structural.get("documents", [])}
        sections = {row.get("section_id"): row for row in structural.get("sections", [])}
        machine_nodes = {row.get("machine_node_id"): row for row in structural.get("machine_nodes", [])}
        plan_units = {row.get("plan_unit_id"): row for row in structural.get("plan_units", [])}
        acceptance_units = {row.get("acceptance_key"): row for row in structural.get("acceptance_units", [])}

        def resolve_source_ref(ref: str) -> tuple[dict[str, Any] | None, str | None]:
            path, separator, fragment = ref.partition("#")
            source = population.get(path)
            if source is None:
                return None, None
            if not separator or fragment == "":
                return source, source.get("sha256")
            if fragment in plan_units:
                unit = plan_units[fragment]
                owner = documents.get(unit.get("owner_doc_id"), {})
                return (source, unit.get("source_sha256")) if owner.get("path") == path else (None, None)
            if fragment in sections:
                section = sections[fragment]
                owner = documents.get(section.get("document_id"), {})
                return (source, section.get("semantic_anchor_sha256")) if owner.get("path") == path else (None, None)
            if fragment in acceptance_units:
                acceptance = acceptance_units[fragment]
                section = sections.get(acceptance.get("section_id"), {})
                owner = documents.get(section.get("document_id"), {})
                return (source, acceptance.get("criterion_sha256")) if owner.get("path") == path else (None, None)
            matching_machine = [row for row in machine_nodes.values() if row.get("json_pointer") == fragment and documents.get(row.get("document_id"), {}).get("path") == path]
            if len(matching_machine) == 1:
                return source, matching_machine[0].get("content_sha256")
            return None, None

        for row in instances:
            owner = row.get("owner", {})
            owner_doc = docs_by_path.get(owner.get("owner_doc"))
            f.need(owner_doc is not None and owner_doc.get("semantic_authority") is True, f"OWNER_DOC_BINDING:{row.get('instance_id')}")
            owner_plan_unit = owner.get("owner_plan_unit")
            if owner_plan_unit is not None:
                unit = plan_units.get(owner_plan_unit)
                f.need(unit is not None and documents.get(unit.get("owner_doc_id"), {}).get("path") == owner.get("owner_doc"), f"OWNER_PLAN_UNIT:{row.get('instance_id')}")
            for binding in row.get("source_bindings", []):
                source, semantic_hash = resolve_source_ref(str(binding.get("ref", "")))
                path = str(binding.get("ref", "")).split("#", 1)[0]
                f.need(source is not None, f"SOURCE_BINDING_PATH_OR_FRAGMENT:{row.get('instance_id')}:{binding.get('ref')}")
                if source:
                    f.need(binding.get("content_sha256") == source.get("sha256"), f"SOURCE_BINDING_HASH:{row.get('instance_id')}:{path}")
                    f.need(binding.get("semantic_sha256") == semantic_hash, f"SOURCE_BINDING_SEMANTIC:{row.get('instance_id')}:{binding.get('ref')}")
            if owner_plan_unit is not None:
                f.need(any(str(binding.get("ref", "")).endswith(f"#{owner_plan_unit}") for binding in row.get("source_bindings", [])), f"OWNER_PLAN_UNIT_NOT_BOUND:{row.get('instance_id')}")
    f.need(not has_cycle(parents), "PARENT_CYCLE")
    active_keys = [(row.get("kind"), row.get("canonical_key")) for row in instances if row.get("lifecycle") == "active"]
    f.unique(active_keys, "DUPLICATE_ACTIVE_CANONICAL_IDENTITY")
    relation_ids = [row.get("relation_id") for row in relations]
    f.unique(relation_ids, "DUPLICATE_RELATION_ID")
    supersedes: dict[str, list[str]] = {}
    for relation in relations:
        f.need(relation.get("from_instance_id") in by_id and relation.get("to_instance_id") in by_id, f"RELATION_REF:{relation.get('relation_id')}")
        if relation.get("relation_type") == "supersedes":
            supersedes.setdefault(relation.get("from_instance_id"), []).append(relation.get("to_instance_id"))
    f.need(not has_cycle(supersedes), "SUPERSEDES_CYCLE")
    alias_names = [row.get("alias") for row in aliases]
    f.unique(alias_names, "DUPLICATE_ALIAS")
    normalized_active_keys = {unicodedata.normalize("NFC", str(row.get("canonical_key", ""))).casefold() for row in instances if row.get("lifecycle") == "active"}
    normalized_instance_ids = {unicodedata.normalize("NFC", str(row.get("instance_id", ""))).casefold() for row in instances}
    for alias in aliases:
        f.need(alias.get("target_instance_id") in by_id, f"ALIAS_TARGET:{alias.get('alias')}")
        f.need(alias.get("counts_toward_denominator") is False, f"ALIAS_COUNTED:{alias.get('alias')}")
        normalized_alias = unicodedata.normalize("NFC", str(alias.get("alias", ""))).casefold()
        f.need(normalized_alias not in normalized_active_keys and normalized_alias not in normalized_instance_ids, f"ALIAS_CANONICAL_COLLISION:{alias.get('alias')}")

    members: list[str] = []
    denominator_by_key: dict[tuple[str, str], dict[str, Any]] = {}
    for denominator in denominators:
        key = (denominator.get("capability_id"), denominator.get("kind"))
        f.need(key not in denominator_by_key, f"DUPLICATE_DENOMINATOR_SET:{key}")
        denominator_by_key[key] = denominator
        current = denominator.get("member_instance_ids", [])
        f.need(bool(current) or bool(denominator.get("excluded_rows")), f"EMPTY_DENOMINATOR:{denominator.get('set_id')}")
        members.extend(current)
        f.need(denominator.get("frozen_before_scoring") is True, f"DENOMINATOR_UNFROZEN:{denominator.get('set_id')}")
        f.need(denominator.get("membership_sha256") == identity_hash("surface-denominator-members", sorted(current)), f"DENOMINATOR_HASH:{denominator.get('set_id')}")
        for member in current:
            row = by_id.get(member)
            f.need(row is not None, f"DENOMINATOR_REF:{member}")
            if row:
                f.need(row.get("instance_role") in {"named_instance", "parameterized_instance_set"}, f"TEMPLATE_IN_DENOMINATOR:{member}")
                f.need(row.get("kind") == denominator.get("kind"), f"DENOMINATOR_KIND:{member}")
                f.need(row.get("lifecycle") == "active" and row.get("applicability") in {"applicable", "conditional"}, f"INELIGIBLE_DENOMINATOR_MEMBER:{member}")
                f.need(bool(row.get("obligation_ids")), f"DENOMINATOR_WITHOUT_OBLIGATION:{member}")
    f.unique(members, "DUPLICATE_DENOMINATOR_MEMBER")
    for candidate in candidates:
        path = str(candidate.get("source_ref", "")).split("#", 1)[0]
        if structural is not None:
            resolved_source, _ = resolve_source_ref(str(candidate.get("source_ref", "")))
            f.need(resolved_source is not None, f"CANDIDATE_SOURCE:{candidate.get('candidate_id')}:{candidate.get('source_ref')}")
        key = (candidate.get("capability_id"), candidate.get("kind"))
        denominator = denominator_by_key.get(key)
        f.need(denominator is not None, f"CANDIDATE_DENOMINATOR:{candidate.get('candidate_id')}")
        if candidate.get("disposition") == "included":
            iid = candidate.get("instance_id")
            f.need(iid in by_id, f"CANDIDATE_INSTANCE:{candidate.get('candidate_id')}")
            f.need(denominator is not None and iid in denominator.get("member_instance_ids", []), f"CANDIDATE_NOT_MEMBER:{candidate.get('candidate_id')}")
            f.need(candidate.get("exclusion_reason") is None, f"INCLUDED_CANDIDATE_EXCLUDED:{candidate.get('candidate_id')}")
            if iid in by_id:
                instance = by_id[iid]
                f.need(candidate.get("kind") == instance.get("kind") and candidate.get("canonical_key") == instance.get("canonical_key") and candidate.get("capability_id") in instance.get("capability_ids", []), f"CANDIDATE_INSTANCE_IDENTITY:{candidate.get('candidate_id')}")
        else:
            f.need(candidate.get("instance_id") is None and bool(candidate.get("exclusion_reason")), f"EXCLUDED_CANDIDATE_BASIS:{candidate.get('candidate_id')}")
            f.need(denominator is not None and any(row.get("candidate_ref") == candidate.get("candidate_id") for row in denominator.get("excluded_rows", [])), f"EXCLUDED_CANDIDATE_NOT_RECONCILED:{candidate.get('candidate_id')}")
    included_triples = {(row.get("instance_id"), row.get("capability_id"), row.get("kind")) for row in candidates if row.get("disposition") == "included"}
    expected_triples = {(row.get("instance_id"), capability, row.get("kind")) for row in instances if row.get("lifecycle") == "active" and row.get("applicability") in {"applicable", "conditional"} and row.get("instance_role") in {"named_instance", "parameterized_instance_set"} for capability in row.get("capability_ids", [])}
    denominator_triples = {(member, denominator.get("capability_id"), denominator.get("kind")) for denominator in denominators for member in denominator.get("member_instance_ids", [])}
    f.need(expected_triples == included_triples == denominator_triples, "DENOMINATOR_CANDIDATE_POPULATION")

    denominator_by_id = {row.get("set_id"): row for row in denominators}
    for row in instances:
        coverage = row.get("template_coverage")
        if row.get("instance_role") == "contract_template" and isinstance(coverage, dict) and coverage.get("instance_set_ref"):
            denominator = denominator_by_id.get(coverage["instance_set_ref"])
            f.need(denominator is not None, f"TEMPLATE_SET_REF:{row.get('instance_id')}")
            if denominator:
                f.need(coverage.get("membership_sha256") == denominator.get("membership_sha256"), f"TEMPLATE_SET_HASH:{row.get('instance_id')}")

    invalidations = obj.get("invalidations", [])
    f.unique([row.get("invalidation_id") for row in invalidations], "DUPLICATE_INVALIDATION_ID")
    mutation_graph: dict[str, list[str]] = {}
    for row in instances:
        deps = row.get("mutation_dependencies", [])
        f.need(all(dep in by_id and dep != row.get("instance_id") for dep in deps), f"MUTATION_DEPENDENCY:{row.get('instance_id')}")
        mutation_graph[row.get("instance_id")] = deps
    f.need(not has_cycle(mutation_graph), "MUTATION_DEPENDENCY_CYCLE")
    open_invalidations = 0
    for invalidation in invalidations:
        f.need(all(iid in by_id for iid in invalidation.get("instance_ids", [])), f"INVALIDATION_INSTANCE:{invalidation.get('invalidation_id')}")
        f.need(bool(invalidation.get("affected_dimensions")), f"INVALIDATION_DIMENSIONS:{invalidation.get('invalidation_id')}")
        if invalidation.get("status") == "open":
            open_invalidations += 1
            for iid in invalidation.get("instance_ids", []):
                row = by_id.get(iid, {})
                f.need(bool(row.get("realization", {}).get("blockers")), f"OPEN_INVALIDATION_NOT_BLOCKING:{iid}")
    expected = {
        "instance_count": len(instances),
        "active_named_instance_count": sum(r.get("lifecycle") == "active" and r.get("instance_role") == "named_instance" for r in instances),
        "template_count": sum(r.get("instance_role") == "contract_template" for r in instances),
        "denominator_member_count": len(members),
        "unresolved_identity_count": sum(r.get("realization", {}).get("identity") != "bound" and r.get("lifecycle") == "active" for r in instances),
        "dangling_reference_count": sum(1 for code in f.codes if any(word in code for word in ("_REF", "_TARGET"))),
        "unfrozen_denominator_count": sum(d.get("frozen_before_scoring") is not True for d in denominators),
    }
    for key, value in expected.items():
        f.need(summary.get(key) == value, f"SUMMARY_RECONCILIATION:{key}")
    f.need(summary.get("named_instances_closed_only_by_template_count") == 0, "TEMPLATE_ONLY_CLOSURE")
    if summary.get("terminal") == "PASS":
        f.need(bool(denominators), "EMPTY_DENOMINATORS")
        f.need(open_invalidations == 0, "OPEN_INVALIDATION_PASS")
        f.need(not f.codes, "FALSE_PASS")
    return f.codes


def closure_hash(row: dict[str, Any], by_id: dict[str, dict[str, Any]] | None = None, bindings: dict[str, Any] | None = None) -> str:
    by_id = by_id or {}
    bindings = bindings or {}
    payload = {key: value for key, value in row.items() if key not in {"closure_fingerprint_sha256", "controller_derived"}}
    basis_fields = ("claim_basis_ids", "evidence_basis_ids", "authority_basis_ids", "decision_basis_ids", "risk_basis_ids", "scenario_basis_ids", "consumer_basis_ids", "validation_basis_ids", "plan_anchor_ids")
    payload["basis_content_sha256s"] = {
        field: [by_id[ref].get("content_sha256") for ref in row.get(field, []) if ref in by_id]
        for field in basis_fields
    }
    payload["obligation_content_sha256"] = by_id.get(row.get("obligation_id"), {}).get("content_sha256")
    payload["bound_denominator_sha256"] = bindings.get("surface_ledger_sha256")
    payload["bound_risk_profile_sha256"] = bindings.get("risk_profile_sha256")
    return identity_hash("obligation-closure", payload)


def graph_hash(obj: dict[str, Any]) -> str:
    payload = {key: value for key, value in obj.items() if key not in {"retrieval_diagnostics_ref", "semantic_graph_sha256", "integrity"}}
    return identity_hash("semantic-graph", payload)


def validate_graph(obj: dict[str, Any], surface: dict[str, Any] | None = None, research: dict[str, Any] | None = None, adequacy: dict[str, Any] | None = None, registry: dict[str, Any] | None = None) -> list[str]:
    f = Findings("GRAPH")
    nodes = obj.get("nodes", [])
    edges = obj.get("edges", [])
    receipts = obj.get("stage_transition_receipts", [])
    losses = obj.get("loss_attributions", [])
    closures = obj.get("closure_assessments", [])
    integrity = obj.get("integrity", {})
    environment_tuples = obj.get("environment_tuples", [])
    environment_ids = [row.get("environment_tuple_id") for row in environment_tuples]
    f.need(bool(environment_tuples), "EMPTY_ENVIRONMENT_TUPLES")
    f.unique(environment_ids, "DUPLICATE_ENVIRONMENT_TUPLE")
    for environment in environment_tuples:
        f.need(environment.get("tuple_sha256") == identity_hash("environment-tuple", {key: value for key, value in environment.items() if key != "tuple_sha256"}), f"ENVIRONMENT_TUPLE_HASH:{environment.get('environment_tuple_id')}")
    f.need(obj.get("bindings", {}).get("artifact_validator_sha256") == validator_sha256(), "VALIDATOR_IDENTITY")
    bindings = obj.get("bindings", {})
    if research is not None:
        f.need(bindings.get("research_portfolio_sha256") == artifact_hash("research-portfolio", research), "RESEARCH_BINDING")
    if adequacy is not None:
        f.need(bindings.get("research_adequacy_sha256") == artifact_hash("research-adequacy", adequacy), "ADEQUACY_BINDING")
    node_ids = [row.get("id") for row in nodes]
    edge_ids = [row.get("edge_id") for row in edges]
    f.need(bool(nodes), "EMPTY_NODES")
    f.unique(node_ids, "DUPLICATE_NODE")
    f.unique(edge_ids, "DUPLICATE_EDGE")
    by_id = {row.get("id"): row for row in nodes}
    for node in nodes:
        expected = PREFIX_BY_TYPE.get(node.get("node_type"))
        f.need(expected is not None and str(node.get("id", "")).startswith(expected), f"NODE_DISCRIMINATOR:{node.get('id')}")
        f.need(isinstance(node.get("payload"), dict) and bool(node.get("payload")), f"EMPTY_NODE_PAYLOAD:{node.get('id')}")
        f.need(node.get("content_sha256") == node_content_hash(node), f"NODE_CONTENT_HASH:{node.get('id')}")
        f.need(not contains_forbidden_retrieval_key(node.get("payload")), f"RETRIEVAL_IN_NODE_PAYLOAD:{node.get('id')}")

    def refs_are(refs: list[str], allowed: set[str], code: str) -> None:
        for ref in refs:
            f.need(ref in by_id and by_id[ref].get("node_type") in allowed, f"{code}:{ref}")

    for node_row in nodes:
        payload = node_row.get("payload", {})
        kind = node_row.get("node_type")
        if kind == "Capability":
            refs_are(payload.get("risk_record_ids", []), {"RiskRecord"}, "CAPABILITY_RISK_REF")
            refs_are(payload.get("non_goal_ids", []), {"NonGoal"}, "CAPABILITY_NONGOAL_REF")
        elif kind == "SourceRecord":
            external_classes = {"official", "standard", "implementation_test", "issue_failure", "comparator_adjacent", "research_failure"}
            external = payload.get("source_class") in external_classes
            if external:
                f.need(all(meaningful(payload.get(key)) for key in ("portfolio_id", "source_card_id", "source_card_content_sha256")) and bool(payload.get("operation_receipt_ids")), f"EXTERNAL_SOURCE_PROVENANCE:{node_row.get('id')}")
            if payload.get("portfolio_id") is not None or external:
                if research is None:
                    f.need(False, f"RESEARCH_SOURCE_WITHOUT_PORTFOLIO:{node_row.get('id')}")
                else:
                    cards = {row.get("source_card_id"): row for row in research.get("source_cards", [])}
                    card = cards.get(payload.get("source_card_id"))
                    f.need(payload.get("portfolio_id") == research.get("portfolio_id") and card is not None, f"RESEARCH_SOURCE_CARD:{node_row.get('id')}")
                    if card is not None:
                        f.need(payload.get("source_card_content_sha256") == card.get("content_sha256") and payload.get("operation_receipt_ids") == card.get("operation_receipt_ids") and payload.get("currentness") == card.get("currentness") and payload.get("applicability") == card.get("applicability") and payload.get("authority_fitness") == card.get("authority_fitness"), f"RESEARCH_SOURCE_DRIFT:{node_row.get('id')}")
        elif kind == "EvidenceAssertion": refs_are([payload.get("source_record_id")], {"SourceRecord"}, "EVIDENCE_SOURCE_REF")
        elif kind == "ClaimAtom": refs_are(payload.get("uncertainty_refs", []), {"Uncertainty"}, "CLAIM_UNCERTAINTY_REF")
        elif kind == "Obligation":
            refs_are(payload.get("risk_refs", []), {"RiskRecord"}, "OBLIGATION_RISK_REF")
            refs_are(payload.get("authority_refs", []), {"AuthorityRecord"}, "OBLIGATION_AUTHORITY_REF")
            refs_are(payload.get("residual_uncertainty_refs", []), {"Uncertainty"}, "OBLIGATION_UNCERTAINTY_REF")
            f.need(isinstance(payload.get("evidence_required"), bool), f"OBLIGATION_EVIDENCE_REQUIRED:{node_row.get('id')}")
            f.need(isinstance(payload.get("requires_named_realization"), bool), f"OBLIGATION_REALIZATION_REQUIRED:{node_row.get('id')}")
        elif kind == "NamedScenario":
            for axis, refs in payload.get("instance_axes", {}).items():
                refs_are(refs, {"SurfaceInstance"}, f"SCENARIO_AXIS_REF:{axis}")
            refs_are(payload.get("oracle_refs", []), {"ValidationContract"}, "SCENARIO_ORACLE_REF")
            refs_are(payload.get("authority_permission", {}).get("authority_refs", []), {"AuthorityRecord"}, "SCENARIO_AUTHORITY_REF")
            refs_are(payload.get("obligation_ids", []), {"Obligation"}, "SCENARIO_OBLIGATION_REF")
        elif kind == "ConsumerInstance":
            refs_are([payload.get("owner_anchor_id"), payload.get("consumer_anchor_id")], {"PlanAnchor"}, "CONSUMER_ANCHOR_REF")
        elif kind == "Decision": refs_are([payload.get("authority_ref")], {"AuthorityRecord"}, "DECISION_AUTHORITY_REF")
        elif kind == "NonGoal": refs_are([payload.get("authority_ref")], {"AuthorityRecord"}, "NONGOAL_AUTHORITY_REF")
    if surface is not None:
        f.need(obj.get("trial_id") == surface.get("trial_id"), "TRIAL_ID_MISMATCH")
        f.need(obj.get("bindings", {}).get("surface_ledger_sha256") == artifact_hash("surface-ledger", surface), "SURFACE_BINDING")
        ledger = {row.get("instance_id"): row for row in surface.get("instances", [])}
        graph_surface_kind: dict[str, str] = {}
        for node_row in nodes:
            if node_row.get("node_type") == "SurfaceInstance":
                ledger_id = node_row.get("payload", {}).get("ledger_instance_id")
                f.need(ledger_id in ledger, f"GRAPH_SURFACE_LEDGER_REF:{node_row.get('id')}")
                if ledger_id in ledger:
                    ledger_row = ledger[ledger_id]
                    graph_surface_kind[node_row["id"]] = ledger_row.get("kind")
                    f.need(node_row.get("payload", {}).get("instance_role") == ledger_row.get("instance_role") and ledger_row.get("instance_role") in {"named_instance", "parameterized_instance_set"}, f"GRAPH_SURFACE_ROLE:{node_row.get('id')}")
                    eligible_members = {member for denominator in surface.get("denominator_sets", []) if denominator.get("capability_id") == obj.get("capability_id") for member in denominator.get("member_instance_ids", [])}
                    f.need(ledger_id in eligible_members and ledger_row.get("lifecycle") == "active" and ledger_row.get("applicability") in {"applicable", "conditional"}, f"GRAPH_SURFACE_DENOMINATOR:{node_row.get('id')}")
                    f.need(obj.get("capability_id") in ledger_row.get("capability_ids", []), f"GRAPH_SURFACE_CAPABILITY:{node_row.get('id')}")
        for node_row in nodes:
            if node_row.get("node_type") != "NamedScenario": continue
            payload = node_row.get("payload", {})
            axes = payload.get("instance_axes", {})
            for axis in ("actor", "journey", "entrypoint", "surface", "control", "command", "state", "event_type", "data_store"):
                f.need(bool(axes.get(axis)) and all(graph_surface_kind.get(ref) == axis for ref in axes.get(axis, [])), f"SCENARIO_AXIS_KIND:{node_row.get('id')}:{axis}")
            f.need(payload.get("initial_state_ids") and set(payload.get("initial_state_ids", [])) <= set(axes.get("state", [])), f"SCENARIO_INITIAL_STATE:{node_row.get('id')}")
            steps = payload.get("steps", [])
            f.need([row.get("ordinal") for row in steps] == list(range(1, len(steps) + 1)) and len({row.get("step_id") for row in steps}) == len(steps), f"SCENARIO_STEP_ORDER:{node_row.get('id')}")
            if steps:
                f.need(set(steps[0].get("from_state_ids", [])) == set(payload.get("initial_state_ids", [])), f"SCENARIO_INITIAL_STEP_REACHABILITY:{node_row.get('id')}")
                for prior_step, current_step in zip(steps, steps[1:]):
                    f.need(set(current_step.get("from_state_ids", [])) == set(prior_step.get("to_state_ids", [])), f"SCENARIO_STEP_CONTINUITY:{node_row.get('id')}:{current_step.get('step_id')}")
            step_ids = {row.get("step_id") for row in steps}
            for step in steps:
                f.need(step.get("actor_id") in axes.get("actor", []) and step.get("command_id") in axes.get("command", []), f"SCENARIO_STEP_ACTOR_COMMAND:{node_row.get('id')}:{step.get('step_id')}")
                f.need(set(step.get("from_state_ids", []) + step.get("to_state_ids", [])) <= set(axes.get("state", [])), f"SCENARIO_STEP_STATE:{node_row.get('id')}:{step.get('step_id')}")
                step_transitions = {f"{left}->{right}" for left in step.get("from_state_ids", []) for right in step.get("to_state_ids", [])}
                allowed_for_step = set(payload.get("transition_rules", {}).get("allowed", []))
                forbidden_for_step = set(payload.get("transition_rules", {}).get("forbidden", []))
                f.need(bool(step_transitions) and step_transitions <= allowed_for_step, f"SCENARIO_STEP_TRANSITION_ALLOWED:{node_row.get('id')}:{step.get('step_id')}")
                f.need(not (step_transitions & forbidden_for_step), f"SCENARIO_STEP_TRANSITION_FORBIDDEN:{node_row.get('id')}:{step.get('step_id')}")
                f.need(set(step.get("read_data_ids", []) + step.get("write_data_ids", [])) <= set(axes.get("data_store", [])), f"SCENARIO_STEP_DATA:{node_row.get('id')}:{step.get('step_id')}")
                f.need(set(step.get("emitted_event_ids", [])) <= set(axes.get("event_type", [])), f"SCENARIO_STEP_EVENT:{node_row.get('id')}:{step.get('step_id')}")
            f.need(set(payload.get("observability", {}).get("event_ids", [])) <= set(axes.get("event_type", [])), f"SCENARIO_OBSERVABILITY_EVENT:{node_row.get('id')}")
            for failure in payload.get("failure_cases", []):
                f.need(set(failure.get("recovery_step_ids", [])) <= step_ids, f"SCENARIO_FAILURE_RECOVERY_STEP:{node_row.get('id')}:{failure.get('failure_id')}")
                f.need(failure.get("terminal_state_id") in axes.get("state", []), f"SCENARIO_FAILURE_TERMINAL_STATE:{node_row.get('id')}:{failure.get('failure_id')}")
                recovery_steps = [next((step for step in steps if step.get("step_id") == step_id), {}) for step_id in failure.get("recovery_step_ids", [])]
                f.need(bool(recovery_steps) and all(recovery_steps), f"SCENARIO_FAILURE_RECOVERY_PATH:{node_row.get('id')}:{failure.get('failure_id')}")
                if recovery_steps and all(recovery_steps):
                    for prior_recovery, current_recovery in zip(recovery_steps, recovery_steps[1:]):
                        f.need(set(current_recovery.get("from_state_ids", [])) == set(prior_recovery.get("to_state_ids", [])), f"SCENARIO_FAILURE_RECOVERY_CONTINUITY:{node_row.get('id')}:{failure.get('failure_id')}")
                    f.need(failure.get("terminal_state_id") in recovery_steps[-1].get("to_state_ids", []), f"SCENARIO_FAILURE_RECOVERY_TERMINAL:{node_row.get('id')}:{failure.get('failure_id')}")
            state_ids = set(axes.get("state", []))
            allowed_transitions = payload.get("transition_rules", {}).get("allowed", [])
            forbidden_transitions = payload.get("transition_rules", {}).get("forbidden", [])
            f.unique(allowed_transitions, f"SCENARIO_ALLOWED_TRANSITION_DUPLICATE:{node_row.get('id')}")
            f.unique(forbidden_transitions, f"SCENARIO_FORBIDDEN_TRANSITION_DUPLICATE:{node_row.get('id')}")
            f.need(not (set(allowed_transitions) & set(forbidden_transitions)), f"SCENARIO_TRANSITION_CONTRADICTION:{node_row.get('id')}")
            for disposition in ("allowed", "forbidden"):
                for transition in payload.get("transition_rules", {}).get(disposition, []):
                    match = re.fullmatch(r"([^>]+)->([^>]+)", transition)
                    f.need(match is not None and match.group(1) in state_ids and match.group(2) in state_ids, f"SCENARIO_TRANSITION_REF:{node_row.get('id')}:{disposition}:{transition}")
            f.need(set(payload.get("environment_tuple_refs", [])) <= set(environment_ids), f"SCENARIO_ENVIRONMENT_REF:{node_row.get('id')}")
            if registry is not None:
                valid_controls = {row.get("control_id") for row in registry.get("controls", []) if row.get("family_id") == obj.get("capability_id")}
                f.need(set(payload.get("control_registry_ids", [])) <= valid_controls, f"SCENARIO_CONTROL_REGISTRY:{node_row.get('id')}")
                registry_rows = {row.get("control_id"): row for row in registry.get("controls", []) if row.get("family_id") == obj.get("capability_id")}
                fixed_semantics = set(payload.get("builder_discretion", {}).get("fixed_semantics", []))
                expected_assertions = {f"control:{control_id}:{registry_rows.get(control_id, {}).get('requirement_sha256')}" for control_id in payload.get("control_registry_ids", [])}
                f.need(expected_assertions <= fixed_semantics, f"SCENARIO_CONTROL_ASSERTION:{node_row.get('id')}")

        for closure in closures:
            obligation = by_id.get(closure.get("obligation_id"), {})
            if closure.get("instance_realization") != "complete" or obligation.get("payload", {}).get("requires_named_realization") is not True:
                continue
            scenario_ids = closure.get("scenario_basis_ids", [])
            f.need(bool(scenario_ids), f"COMPLETE_REALIZATION_WITHOUT_SCENARIO:{closure.get('obligation_id')}")
            for scenario_id in scenario_ids:
                scenario = by_id.get(scenario_id, {}).get("payload", {})
                f.need(closure.get("obligation_id") in scenario.get("obligation_ids", []), f"SCENARIO_OBLIGATION_BINDING:{closure.get('obligation_id')}:{scenario_id}")
                matching_edges = [edge for edge in edges if edge.get("edge_type") == "realized_by_scenario" and edge.get("from_id") == closure.get("obligation_id") and edge.get("to_id") == scenario_id and edge.get("state") == "confirmed"]
                f.need(len(matching_edges) == 1, f"SCENARIO_REALIZATION_EDGE:{closure.get('obligation_id')}:{scenario_id}")
                all_surface_refs = [ref for refs in scenario.get("instance_axes", {}).values() for ref in refs]
                for surface_ref in all_surface_refs:
                    ledger_id = by_id.get(surface_ref, {}).get("payload", {}).get("ledger_instance_id")
                    f.need(closure.get("obligation_id") in ledger.get(ledger_id, {}).get("obligation_ids", []), f"SCENARIO_LEDGER_OBLIGATION:{closure.get('obligation_id')}:{ledger_id}")

    dangling = 0
    contributions: set[str] = set()
    dependency: dict[str, list[str]] = {}
    endpoint_rules = {
        "supports_claim": ({"EvidenceAssertion"}, {"ClaimAtom"}),
        "supports_obligation": ({"ClaimAtom"}, {"Obligation"}),
        "contradicts_obligation": ({"ClaimAtom", "EvidenceAssertion"}, {"Obligation"}),
        "realized_by_scenario": ({"Obligation"}, {"NamedScenario"}),
        "validated_by": ({"Obligation", "NamedScenario"}, {"ValidationContract"}),
        "authorized_by": ({"ClaimAtom", "Obligation", "Decision", "NonGoal"}, {"AuthorityRecord"}),
        "materialized_at": ({"Obligation", "ConsumerInstance"}, {"PlanAnchor"}),
    }
    for edge in edges:
        left = by_id.get(edge.get("from_id")); right = by_id.get(edge.get("to_id"))
        if left is None or right is None:
            dangling += 1
            f.need(False, f"EDGE_ENDPOINT:{edge.get('edge_id')}")
            continue
        if edge.get("edge_type") in CONTRIBUTION_EDGES and left.get("node_type") == "ClaimAtom" and edge.get("state") != "rejected":
            contributions.add(left["id"])
        if edge.get("edge_type") in endpoint_rules:
            left_types, right_types = endpoint_rules[edge["edge_type"]]
            f.need(left.get("node_type") in left_types and right.get("node_type") in right_types, f"EDGE_TYPE_ENDPOINT:{edge.get('edge_id')}")
        for ref in edge.get("authority_refs", []) + edge.get("evidence_refs", []):
            if ref not in by_id:
                dangling += 1
                f.need(False, f"EDGE_BASIS_REF:{edge.get('edge_id')}:{ref}")
        refs_are(edge.get("authority_refs", []), {"AuthorityRecord"}, f"EDGE_AUTHORITY_TYPE:{edge.get('edge_id')}")
        refs_are(edge.get("evidence_refs", []), {"EvidenceAssertion"}, f"EDGE_EVIDENCE_TYPE:{edge.get('edge_id')}")
        if edge.get("edge_type") == "depends_on" and edge.get("state") == "confirmed":
            dependency.setdefault(edge["from_id"], []).append(edge["to_id"])
    active_claims = {n["id"] for n in nodes if n.get("node_type") == "ClaimAtom" and n.get("lifecycle") not in {"rejected", "retired", "superseded"}}
    f.need(active_claims <= contributions, "CLAIM_WITHOUT_CONTRIBUTION")
    dependency_cycle = has_cycle(dependency)
    f.need(not dependency_cycle, "DEPENDENCY_CYCLE")

    obligation_ids = {n["id"] for n in nodes if n.get("node_type") == "Obligation" and n.get("lifecycle") not in {"retired", "superseded"}}
    closure_ids = [c.get("obligation_id") for c in closures]
    f.unique(closure_ids, "DUPLICATE_CLOSURE")
    f.need(obligation_ids == set(closure_ids), "OBLIGATION_CLOSURE_POPULATION")
    for closure in closures:
        oid = closure.get("obligation_id")
        f.need(closure.get("closure_fingerprint_sha256") == closure_hash(closure, by_id, obj.get("bindings", {})), f"CLOSURE_HASH:{oid}")
        basis_fields = ("claim_basis_ids", "evidence_basis_ids", "authority_basis_ids", "decision_basis_ids", "risk_basis_ids", "scenario_basis_ids", "consumer_basis_ids", "validation_basis_ids", "plan_anchor_ids")
        for field in basis_fields:
            for ref in closure.get(field, []):
                f.need(ref in by_id, f"CLOSURE_BASIS:{oid}:{field}:{ref}")
        disposition = closure.get("disposition")
        obligation_payload = by_id.get(oid, {}).get("payload", {})
        if obligation_payload.get("evidence_required") is True:
            f.need(closure.get("evidence_state") != "not_required_for_claim_kind", f"EVIDENCE_REQUIRED_NOT_REQUIRED:{oid}")
            if closure.get("evidence_state") == "adequate":
                f.need(bool(closure.get("evidence_basis_ids")), f"ADEQUATE_EVIDENCE_EMPTY:{oid}")
                for evidence_id in closure.get("evidence_basis_ids", []):
                    evidence = by_id.get(evidence_id, {})
                    source = by_id.get(evidence.get("payload", {}).get("source_record_id"), {})
                    f.need(evidence.get("node_type") == "EvidenceAssertion" and evidence.get("payload", {}).get("relation") == "supports" and evidence.get("payload", {}).get("entailment_strength") in {"direct", "strong_inference"} and evidence.get("payload", {}).get("authority_fitness") in {"fit", "limited"} and evidence.get("payload", {}).get("applicability") in {"applicable", "conditional"}, f"ADEQUATE_EVIDENCE_ASSERTION:{oid}:{evidence_id}")
                    f.need(source.get("node_type") == "SourceRecord" and source.get("payload", {}).get("currentness") == "current" and source.get("payload", {}).get("applicability") in {"applicable", "conditional"} and source.get("payload", {}).get("authority_fitness") in {"fit", "limited"}, f"ADEQUATE_SOURCE:{oid}:{evidence_id}")
        if disposition == "specified":
            f.need(closure.get("semantic_state") == "complete", f"SPECIFIED_SEMANTIC:{oid}")
            f.need(closure.get("evidence_state") in {"adequate", "not_required_for_claim_kind"}, f"SPECIFIED_EVIDENCE:{oid}")
            f.need(closure.get("applicability_state") in {"applicable", "conditionally_applicable"}, f"SPECIFIED_APPLICABILITY:{oid}")
            f.need(closure.get("authority_state") in {"authorized", "bounded_inference"}, f"SPECIFIED_AUTHORITY:{oid}")
            f.need(closure.get("instance_realization") in {"complete", "none"}, f"SPECIFIED_REALIZATION:{oid}")
            if closure.get("applicability_state") in {"applicable", "conditionally_applicable"} and obligation_payload.get("requires_named_realization") is True:
                f.need(closure.get("instance_realization") == "complete", f"SPECIFIED_REQUIRED_REALIZATION:{oid}")
            f.need(closure.get("consumer_propagation") in {"complete", "not_applicable"}, f"SPECIFIED_CONSUMER:{oid}")
            f.need(closure.get("validation_contract") in {"specified", "plan_checked_pass"}, f"SPECIFIED_VALIDATION:{oid}")
            f.need(closure.get("uncertainty_state") in {"none", "nonblocking_named"}, f"SPECIFIED_UNCERTAINTY:{oid}")
        if disposition == "not_applicable":
            f.need(closure.get("applicability_state") == "not_applicable", f"NOT_APPLICABLE_MATRIX:{oid}")
        if disposition in {"explicitly_excluded", "residual_risk_accepted", "superseded"}:
            f.need(bool(closure.get("authority_basis_ids")) and bool(closure.get("decision_basis_ids")) and bool(closure.get("reopen_conditions")), f"DECISION_BASIS:{oid}")

    for receipt in receipts:
        input_ids = set(receipt.get("input_ids", []))
        accounted = set(receipt.get("output_ids", [])) | set(receipt.get("carry_forward_ids", [])) | set(receipt.get("dispositioned_ids", []))
        f.need(not receipt.get("unaccounted_input_ids"), f"STAGE_UNACCOUNTED:{receipt.get('receipt_id')}")
        f.need(input_ids <= accounted, f"STAGE_LOSS:{receipt.get('receipt_id')}")
        f.need((input_ids | set(receipt.get("output_ids", []))) <= set(by_id), f"STAGE_REF:{receipt.get('receipt_id')}")
    for loss in losses:
        is_retrieval = loss.get("coverage_facet") == "retrieval_diagnostic"
        f.need(is_retrieval == (loss.get("measurement_only") is True), f"LOSS_MEASUREMENT_CLASS:{loss.get('loss_id')}")
        if is_retrieval:
            f.need(loss.get("first_failed_stage") == "measurement_only", f"RETRIEVAL_LOSS_STAGE:{loss.get('loss_id')}")
    f.need("retrieval_diagnostics" not in obj and not contains_forbidden_retrieval_key({"nodes": nodes, "edges": edges, "closure_assessments": closures}), "RETRIEVAL_EMBEDDED")
    f.need(obj.get("semantic_graph_sha256") == graph_hash(obj), "SEMANTIC_GRAPH_HASH")
    f.need(obj.get("bindings", {}).get("denominator_frozen_before_plan_comparison") is True, "DENOMINATOR_NOT_FROZEN")

    expected_integrity = {
        "unique_node_ids": len(node_ids) == len(set(node_ids)),
        "unique_edge_ids": len(edge_ids) == len(set(edge_ids)),
        "dangling_refs": dangling,
        "active_claims_without_disposition_edges": len(active_claims - contributions),
        "dependency_cycles": int(dependency_cycle),
        "exact_source_edges_in_closure": int(contains_forbidden_retrieval_key(closures)),
        "workers_self_certified": False,
    }
    for key, value in expected_integrity.items():
        f.need(integrity.get(key) == value, f"INTEGRITY_RECONCILIATION:{key}")
    if integrity.get("terminal") == "PASS":
        f.need(bool(edges) and bool(receipts) and bool(closures), "EMPTY_PASS_ARTIFACT")
        f.need(not f.codes, "FALSE_PASS")
    return f.codes


def metric_expected(rows: list[dict[str, Any]], credit_key: str, predicate: Callable[[dict[str, Any]], bool]) -> tuple[float, float, list[str]]:
    selected = [row for row in rows if predicate(row)]
    possible = float(sum(SEVERITY_WEIGHT[row["severity"]] for row in selected))
    earned = float(sum(SEVERITY_WEIGHT[row["severity"]] * row[credit_key] for row in selected))
    uncovered = [row["obligation_id"] for row in selected if row[credit_key] < 1]
    return earned, possible, uncovered


def check_weighted(f: Findings, metric: dict[str, Any], expected: tuple[float, float, list[str]], code: str) -> None:
    earned, possible, uncovered = expected
    ratio = None if possible == 0 else earned / possible
    f.need(metric.get("earned_weight") == earned, f"{code}_EARNED")
    f.need(metric.get("possible_weight") == possible, f"{code}_POSSIBLE")
    f.need(metric.get("ratio") == ratio, f"{code}_RATIO")
    f.need(set(metric.get("raw_uncovered_ids", [])) == set(uncovered), f"{code}_UNCOVERED")


def check_fraction(f: Findings, metric: dict[str, Any], numerator_ids: list[str], denominator_ids: list[str], code: str) -> None:
    ratio = None if not denominator_ids else len(numerator_ids) / len(denominator_ids)
    f.need(metric.get("numerator") == len(numerator_ids), f"{code}_NUMERATOR")
    f.need(metric.get("denominator") == len(denominator_ids), f"{code}_DENOMINATOR")
    f.need(metric.get("ratio") == ratio, f"{code}_RATIO")
    f.need(set(metric.get("numerator_ids", [])) == set(numerator_ids), f"{code}_NUMERATOR_IDS")
    f.need(set(metric.get("denominator_ids", [])) == set(denominator_ids), f"{code}_DENOMINATOR_IDS")


def check_fraction_internal(f: Findings, metric: dict[str, Any], code: str) -> None:
    numerator_ids = metric.get("numerator_ids", [])
    denominator_ids = metric.get("denominator_ids", [])
    f.need(set(numerator_ids) <= set(denominator_ids), f"{code}_SUBSET")
    check_fraction(f, metric, numerator_ids, denominator_ids, code)


def validate_result(obj: dict[str, Any], contract: dict[str, Any] | None = None, graph: dict[str, Any] | None = None, surface: dict[str, Any] | None = None, research: dict[str, Any] | None = None, adequacy: dict[str, Any] | None = None, registry: dict[str, Any] | None = None, challenge_artifact: dict[str, Any] | None = None, research_captures: dict[str, dict[str, Any]] | None = None, failure_research: dict[str, Any] | None = None) -> list[str]:
    f = Findings("RESULT")
    rows = obj.get("obligation_metric_rows", [])
    f.need(obj.get("input_bindings", {}).get("artifact_validator_sha256") == validator_sha256(), "VALIDATOR_IDENTITY")
    ids = [row.get("obligation_id") for row in rows]
    f.need(bool(rows), "EMPTY_OBLIGATION_ROWS")
    f.unique(ids, "DUPLICATE_OBLIGATION_ROW")
    accessibility = obj.get("family_id") == "ACCESSIBILITY_CONTROL_CONTRACTS"
    f.need(obj.get("pilot_mode") == ("revealed_known_answer_realization_calibration_excluded_from_discovery_efficacy" if accessibility else "novel_method_signal"), "PILOT_MODE")
    f.need(obj.get("discovery_efficacy_eligible") is (not accessibility), "DISCOVERY_ELIGIBILITY")
    f.need(obj.get("scale_inference_eligible") is (not accessibility), "SCALE_ELIGIBILITY")
    expected_rotation = {PILOTS[0]: PILOTS[3], PILOTS[1]: PILOTS[2], PILOTS[2]: PILOTS[1], PILOTS[3]: PILOTS[0]}
    workers = obj.get("worker_receipts", [])
    worker_roles = [row.get("worker_role") for row in workers]
    f.need(worker_roles.count("LOCAL_EXPECTATION_MODELER") == 1 and worker_roles.count("OPEN_DISCOVERY_RESEARCHER") == 1 and worker_roles.count("FAILURE_EVIDENCE_RESEARCHER") <= 1, "WORKER_POPULATION")
    f.unique([row.get("context_id") for row in workers], "WORKER_CONTEXT_DUPLICATE")
    expected_artifacts = {
        "LOCAL_EXPECTATION_MODELER": {"LOCAL_EXPECTATIONS", "LOCAL_EXPECTATIONS_LOCK"},
        "OPEN_DISCOVERY_RESEARCHER": {"RESEARCH_PORTFOLIO_OPEN", "DISCOVERY_CLAIMS", "DISCOVERY_LOCK", "RESEARCH_ADEQUACY_RECEIPT"},
        "FAILURE_EVIDENCE_RESEARCHER": {"RESEARCH_PORTFOLIO_FAILURE", "ADEQUACY_RECOVERY_RECEIPT"},
    }
    for worker in workers:
        bindings = worker.get("artifact_bindings", [])
        f.unique([row.get("artifact_type") for row in bindings], f"WORKER_ARTIFACT_DUPLICATE:{worker.get('context_id')}")
        f.need({row.get("artifact_type") for row in bindings} == expected_artifacts.get(worker.get("worker_role"), set()), f"WORKER_ARTIFACT_POPULATION:{worker.get('context_id')}")
        for binding in bindings:
            f.need(binding.get("producer_context_id") == worker.get("context_id") and binding.get("family_id") == obj.get("family_id") and binding.get("trial_id") == obj.get("trial_id") and binding.get("canonical_bytes") is True, f"WORKER_ARTIFACT_IDENTITY:{worker.get('context_id')}:{binding.get('artifact_type')}")
    challenge = obj.get("fresh_challenge_receipt", {})
    f.need(challenge.get("target_family_id") == obj.get("family_id"), "CHALLENGE_TARGET")
    f.need(challenge.get("challenger_family_id") == expected_rotation.get(obj.get("family_id")), "CHALLENGE_ROTATION")
    f.need(challenge.get("challenger_family_id") != obj.get("family_id"), "SELF_CHALLENGE")
    f.need(challenge.get("all_findings_dispositioned") is True and challenge.get("terminal") == "DONE", "CHALLENGE_INCOMPLETE")
    inputs = obj.get("input_bindings", {})
    method_ready_declared = obj.get("method_slice_status") == "METHOD_SLICE_READY"
    if method_ready_declared:
        f.need(all(item is not None for item in (surface, research, adequacy, registry, challenge_artifact)), "METHOD_ARTIFACT_SET_REQUIRED")
    if research is not None:
        f.codes.extend(validate_research_portfolio(research, surface, research_captures))
        f.need(inputs.get("research_portfolio_sha256") == artifact_hash("research-portfolio", research), "RESEARCH_PORTFOLIO_BINDING")
        research_worker = next((row for row in workers if row.get("worker_role") == "OPEN_DISCOVERY_RESEARCHER"), {})
        f.need(research.get("trial_id") == obj.get("trial_id") and research.get("family_id") == obj.get("family_id") and research.get("worker_context_id") == research_worker.get("context_id"), "RESEARCH_PORTFOLIO_IDENTITY")
        research_binding = next((row for row in research_worker.get("artifact_bindings", []) if row.get("artifact_type") == "RESEARCH_PORTFOLIO_OPEN"), {})
        f.need(research_binding.get("ref") == inputs.get("research_portfolio_ref") and research_binding.get("sha256") == inputs.get("research_portfolio_sha256") and research_binding.get("schema_id") == research.get("schema_id"), "RESEARCH_WORKER_BINDING")
    if adequacy is not None:
        f.codes.extend(validate_research_adequacy(adequacy, research, workers, surface, failure_research))
        f.need(inputs.get("research_adequacy_sha256") == artifact_hash("research-adequacy", adequacy), "RESEARCH_ADEQUACY_BINDING")
        research_worker = next((row for row in workers if row.get("worker_role") == "OPEN_DISCOVERY_RESEARCHER"), {})
        adequacy_binding = next((row for row in research_worker.get("artifact_bindings", []) if row.get("artifact_type") == "RESEARCH_ADEQUACY_RECEIPT"), {})
        f.need(adequacy_binding.get("ref") == inputs.get("research_adequacy_ref") and adequacy_binding.get("sha256") == inputs.get("research_adequacy_sha256") and adequacy_binding.get("schema_id") == adequacy.get("schema_id"), "ADEQUACY_WORKER_BINDING")
    if registry is not None:
        f.codes.extend(validate_control_registry(registry, surface))
        f.need(inputs.get("control_registry_sha256") == artifact_hash("control-registry", registry) and inputs.get("controls_sha256") == inputs.get("control_registry_sha256"), "CONTROL_REGISTRY_BINDING")
    if challenge_artifact is not None:
        f.codes.extend(validate_challenge_receipt(challenge_artifact, graph, surface, registry))
        f.need(inputs.get("fresh_challenge_sha256") == artifact_hash("challenge-receipt", challenge_artifact), "CHALLENGE_ARTIFACT_BINDING")
        f.need(challenge.get("target_family_id") == challenge_artifact.get("target_family_id") and challenge.get("challenger_family_id") == challenge_artifact.get("challenger_family_id") and challenge.get("challenger_context_id") == challenge_artifact.get("challenger_context_id") and challenge.get("target_graph_sha256") == challenge_artifact.get("target_graph_sha256") and set(challenge.get("finding_ids", [])) == {row.get("finding_id") for row in challenge_artifact.get("findings", [])}, "CHALLENGE_EMBEDDED_BINDING")
    challenge_has_any_findings = challenge_artifact is None or bool(challenge_artifact.get("findings", []))

    if graph is None:
        f.need(False, "GRAPH_REQUIRED")
    else:
        f.need(obj.get("trial_id") == graph.get("trial_id"), "TRIAL_ID_MISMATCH")
        f.need(obj.get("family_id") == graph.get("capability_id"), "GRAPH_FAMILY_MISMATCH")
        f.need(obj.get("input_bindings", {}).get("obligation_graph_sha256") == artifact_hash("obligation-graph", graph), "GRAPH_BINDING")
        f.need(challenge.get("target_graph_sha256") == graph.get("semantic_graph_sha256"), "CHALLENGE_GRAPH_BINDING")
        graph_nodes = {row.get("id"): row for row in graph.get("nodes", [])}
        closures = {row.get("obligation_id"): row for row in graph.get("closure_assessments", [])}
        f.need(set(ids) == set(closures), "RESULT_CLOSURE_POPULATION")
        semantic_credit = {"complete": 1, "partial": 0.5, "absent": 0, "unresolved": 0, "contradicted": 0, "not_applicable": 0}
        evidence_credit = {"adequate": 1, "not_required_for_claim_kind": 1}
        realization_credit = {"complete": 1, "partial": 0.5, "none": 0, "pattern_only": 0}
        expected_rows: dict[str, dict[str, Any]] = {}
        for oid, closure in closures.items():
            obligation = graph_nodes.get(oid, {})
            payload = obligation.get("payload", {})
            risk_nodes = [graph_nodes.get(ref, {}) for ref in payload.get("risk_refs", [])]
            severity = min((r.get("payload", {}).get("severity") for r in risk_nodes), key=lambda item: list(SEVERITY_WEIGHT).index(item), default="minor")
            disposition = closure.get("disposition")
            applicable = closure.get("applicability_state") in {"applicable", "conditionally_applicable"}
            semantic = semantic_credit.get(closure.get("semantic_state"), 0)
            if not applicable or disposition in {"not_applicable", "explicitly_excluded", "superseded", "residual_risk_accepted"}: semantic = 0
            evidence_required = payload.get("evidence_required") is True
            evidence = evidence_credit.get(closure.get("evidence_state"), 0) if evidence_required else 0
            realization_required = payload.get("requires_named_realization") is True
            realization = realization_credit.get(closure.get("instance_realization"), 0) if realization_required else 0
            if disposition == "residual_risk_accepted": realization = 0
            gap = applicable and (disposition in {"open", "blocked", "residual_risk_accepted"} or semantic < 1 or (evidence_required and evidence < 1) or (realization_required and realization < 1) or closure.get("validation_contract") in {"missing", "plan_checked_fail", "blocked"} or closure.get("uncertainty_state") == "blocking")
            expected_rows[oid] = {"obligation_id": oid, "severity": severity, "applicable": applicable, "semantic_credit": semantic, "evidence_required": evidence_required, "evidence_credit": evidence, "requires_named_realization": realization_required, "realization_credit": realization, "disposition": disposition, "is_gap": gap}
        for row in rows:
            f.need(row == expected_rows.get(row.get("obligation_id")), f"RESULT_ROW_DERIVATION:{row.get('obligation_id')}")
    for row in rows:
        if not row.get("applicable") or row.get("disposition") in {"not_applicable", "explicitly_excluded", "superseded", "residual_risk_accepted"}:
            f.need(row.get("semantic_credit") == 0, f"NONCREDITABLE_SEMANTIC:{row.get('obligation_id')}")
        if row.get("disposition") == "residual_risk_accepted":
            f.need(row.get("realization_credit") == 0, f"RESIDUAL_REALIZATION:{row.get('obligation_id')}")
    metrics = obj.get("metrics", {})
    semantic_population = lambda r: r.get("applicable") and r.get("disposition") not in {"not_applicable", "explicitly_excluded", "superseded"}
    check_weighted(f, metrics.get("bounded_semantic_coverage", {}), metric_expected(rows, "semantic_credit", semantic_population), "SEMANTIC")
    check_weighted(f, metrics.get("evidence_sufficiency", {}), metric_expected(rows, "evidence_credit", lambda r: r.get("evidence_required")), "EVIDENCE")
    check_weighted(f, metrics.get("named_scenario_realization", {}), metric_expected(rows, "realization_credit", lambda r: r.get("requires_named_realization")), "REALIZATION")
    gap_ids = [r["obligation_id"] for r in rows if r.get("is_gap")]
    dispositioned = [r["obligation_id"] for r in rows if r.get("is_gap") and r.get("disposition") in {"open", "blocked", "explicitly_excluded", "residual_risk_accepted", "specified", "not_applicable", "superseded"}]
    check_fraction(f, metrics.get("disposition_completeness", {}), dispositioned, gap_ids, "DISPOSITION")
    check_fraction_internal(f, metrics.get("claim_precision", {}), "CLAIM_PRECISION")
    authority = metrics.get("authority_safety", {})
    mandatory = authority.get("mandatory_claims", 0)
    mandatory_ratio = None if mandatory == 0 else authority.get("mandatory_claims_correctly_authorized", 0) / mandatory
    f.need(authority.get("ratio") == mandatory_ratio, "AUTHORITY_RATIO")
    check_fraction_internal(f, authority.get("classification_accuracy", {}), "AUTHORITY_CLASSIFICATION")
    retrieval = metrics.get("exact_source_retrieval_diagnostic", {})
    f.need(retrieval.get("diagnostic_only") is True and retrieval.get("semantic_weight") == 0, "RETRIEVAL_SEMANTIC_SEPARATION")
    if retrieval.get("applicable"):
        target = retrieval.get("target")
        f.need(isinstance(target, int) and target > 0, "RETRIEVAL_TARGET")
        if isinstance(target, int) and target > 0:
            f.need(retrieval.get("ratio") == retrieval.get("retrieved", 0) / target, "RETRIEVAL_RATIO")
    else:
        f.need(retrieval.get("ratio") is None, "RETRIEVAL_NOT_APPLICABLE_RATIO")

    controls = obj.get("controls", [])
    f.unique([row.get("control_id") for row in controls], "DUPLICATE_CONTROL_RESULT")
    control_summary = metrics.get("control_summary", {})
    positive = [c for c in controls if c.get("control_kind") == "positive_sentinel"]
    negative = [c for c in controls if c.get("control_kind") == "negative_sentinel"]
    control_expected = {
        "positive_pass": sum(c.get("terminal") == "PASS" for c in positive), "positive_total": len(positive),
        "negative_pass": sum(c.get("terminal") == "PASS" for c in negative), "negative_total": len(negative),
        "unanswerable": sum(c.get("answerability") != "answerable" for c in controls),
        "overlap_flagged": sum(bool(c.get("overlaps_obligation_ids")) for c in controls),
    }
    for key, value in control_expected.items():
        f.need(control_summary.get(key) == value, f"CONTROL_RECONCILIATION:{key}")
    registry_rows = {row.get("control_id"): row for row in (registry or {}).get("controls", []) if row.get("family_id") == obj.get("family_id")}
    if registry is not None:
        f.need({row.get("control_id") for row in controls} == set(registry_rows), "CONTROL_RESULT_POPULATION")
    ledger = {row.get("instance_id"): row for row in (surface or {}).get("instances", [])}
    graph_node_rows = {row.get("id"): row for row in (graph or {}).get("nodes", [])}
    graph_scenarios = {node_id for node_id, row in graph_node_rows.items() if row.get("node_type") == "NamedScenario"}
    graph_obligations = {node_id for node_id, row in graph_node_rows.items() if row.get("node_type") == "Obligation"}
    graph_uncertainties = {node_id for node_id, row in graph_node_rows.items() if row.get("node_type") == "Uncertainty"}
    adjacency: dict[str, set[str]] = {node_id: set() for node_id in graph_node_rows}
    for edge in (graph or {}).get("edges", []):
        left, right = edge.get("from_id"), edge.get("to_id")
        if left in adjacency and right in adjacency:
            adjacency[left].add(right); adjacency[right].add(left)
    control_plan_satisfied: list[bool] = []
    for control in controls:
        definition = registry_rows.get(control.get("control_id"), {})
        f.need(control.get("registry_definition_sha256") == definition.get("definition_sha256") and control.get("control_kind") == definition.get("control_kind"), f"CONTROL_DEFINITION:{control.get('control_id')}")
        if definition.get("identity_status") == "resolved":
            expected_instances = set(definition.get("expected_instance_ids", []))
            f.need(control.get("answerability") == "answerable" and set(control.get("instance_ids", [])) == expected_instances and not control.get("unresolved_identity_selectors"), f"CONTROL_RESOLVED_IDENTITY:{control.get('control_id')}")
            f.need(all(instance_id in ledger and ledger[instance_id].get("instance_role") in {"named_instance", "parameterized_instance_set"} for instance_id in expected_instances), f"CONTROL_LEDGER_IDENTITY:{control.get('control_id')}")
        elif definition:
            f.need(control.get("answerability") == "unanswerable" and not control.get("instance_ids") and set(control.get("unresolved_identity_selectors", [])) == set(definition.get("unresolved_identity_selectors", [])) and control.get("terminal") == "CONTROL_UNANSWERABLE", f"CONTROL_UNANSWERABLE_MAPPING:{control.get('control_id')}")
        f.need(set(control.get("scenario_ids", [])) <= graph_scenarios and set(control.get("obligation_ids", [])) <= graph_obligations, f"CONTROL_GRAPH_REF:{control.get('control_id')}")
        linked_scenarios = [graph_node_rows.get(scenario_id, {}) for scenario_id in control.get("scenario_ids", [])]
        f.need(all(control.get("control_id") in scenario.get("payload", {}).get("control_registry_ids", []) for scenario in linked_scenarios), f"CONTROL_SCENARIO_BACKLINK:{control.get('control_id')}")
        realized_pairs = {(edge.get("from_id"), edge.get("to_id")) for edge in (graph or {}).get("edges", []) if edge.get("edge_type") == "realized_by_scenario" and edge.get("state") == "confirmed"}
        for obligation_id in control.get("obligation_ids", []):
            f.need(any(obligation_id in scenario.get("payload", {}).get("obligation_ids", []) and (obligation_id, scenario.get("id")) in realized_pairs for scenario in linked_scenarios), f"CONTROL_OBLIGATION_REALIZATION:{control.get('control_id')}:{obligation_id}")
        linked_axis_nodes = {axis_ref for scenario in linked_scenarios for refs in scenario.get("payload", {}).get("instance_axes", {}).values() for axis_ref in refs}
        linked_ledger_instances = {graph_node_rows.get(node_id, {}).get("payload", {}).get("ledger_instance_id") for node_id in linked_axis_nodes}
        f.need(set(control.get("instance_ids", [])) <= linked_ledger_instances, f"CONTROL_INSTANCE_REALIZATION:{control.get('control_id')}")
        f.need(set(control.get("components", {})) == set(CONTROL_COMPONENTS), f"CONTROL_COMPONENT_POPULATION:{control.get('control_id')}")
        frontier = set(control.get("scenario_ids", [])) | set(control.get("obligation_ids", []))
        relevant = set(frontier)
        while frontier:
            current = frontier.pop()
            for neighbor in adjacency.get(current, set()):
                if neighbor not in relevant:
                    relevant.add(neighbor); frontier.add(neighbor)
        relevant_evidence_refs = {node_id for node_id in relevant if graph_node_rows.get(node_id, {}).get("node_type") in {"NamedScenario", "ValidationContract", "EvidenceAssertion", "PlanAnchor", "AuthorityRecord"}} | linked_axis_nodes
        component_allowed_types = {
            "identity": {"SurfaceInstance"},
            "actors_entrypoints": {"NamedScenario", "SurfaceInstance"},
            "surface_consumer": {"NamedScenario", "SurfaceInstance", "PlanAnchor"},
            "lifecycle": {"NamedScenario", "SurfaceInstance", "ValidationContract"},
            "authority": {"NamedScenario", "AuthorityRecord"},
            "failure_recovery": {"NamedScenario", "ValidationContract"},
            "persistence": {"NamedScenario", "SurfaceInstance", "ValidationContract"},
            "accessibility_user_truth": {"NamedScenario", "SurfaceInstance", "ValidationContract"},
            "wiring": {"NamedScenario", "SurfaceInstance", "PlanAnchor", "ValidationContract"},
            "observability_currentness": {"NamedScenario", "SurfaceInstance", "ValidationContract", "EvidenceAssertion"},
            "oracle": {"ValidationContract"},
            "discretion": {"NamedScenario", "PlanAnchor"},
        }
        control_obligations = set(control.get("obligation_ids", []))
        actual_gap_refs_for_control = ({row.get("obligation_id") for row in rows if row.get("is_gap") and row.get("obligation_id") in control_obligations}
            | {node_id for node_id in graph_uncertainties if node_id in relevant}
            | {row.get("miss_id") for row in obj.get("critical_misses", []) if row.get("obligation_id") in control_obligations})
        component_states = []
        for component_name, component in control.get("components", {}).items():
            evidence_refs = component.get("evidence_refs", [])
            component_gap_refs = component.get("gap_refs", [])
            f.unique(evidence_refs, f"CONTROL_EVIDENCE_DUPLICATE:{control.get('control_id')}:{component_name}")
            f.unique(component_gap_refs, f"CONTROL_GAP_DUPLICATE:{control.get('control_id')}:{component_name}")
            f.need(set(evidence_refs) <= relevant_evidence_refs, f"CONTROL_EVIDENCE_UNRESOLVED:{control.get('control_id')}:{component_name}")
            f.need(all(graph_node_rows.get(ref, {}).get("node_type") in component_allowed_types.get(component_name, set()) for ref in evidence_refs), f"CONTROL_EVIDENCE_TYPE:{control.get('control_id')}:{component_name}")
            f.need(set(component_gap_refs) <= actual_gap_refs_for_control, f"CONTROL_GAP_UNRESOLVED:{control.get('control_id')}:{component_name}")
            if definition.get("applicability") == "required":
                f.need(component.get("applicability") == "applicable" and component.get("status") != "not_applicable", f"REQUIRED_CONTROL_COMPONENT_APPLICABILITY:{control.get('control_id')}:{component_name}")
            if component.get("applicability") == "applicable":
                f.need(component.get("status") in {"full", "partial", "absent"}, f"CONTROL_COMPONENT_STATE:{control.get('control_id')}:{component_name}")
                if component.get("status") == "full":
                    f.need(bool(component.get("evidence_refs")) and not component.get("gap_refs"), f"CONTROL_COMPONENT_FULL:{control.get('control_id')}:{component_name}")
                else:
                    f.need(bool(component.get("gap_refs")), f"CONTROL_COMPONENT_GAP:{control.get('control_id')}:{component_name}")
            else:
                f.need(component.get("status") == "not_applicable" and bool(component.get("evidence_refs")) and not component.get("gap_refs"), f"CONTROL_COMPONENT_NA:{control.get('control_id')}:{component_name}")
            component_states.append(component.get("status"))
        if control.get("terminal") == "PASS":
            f.need(control.get("answerability") == "answerable" and bool(control.get("instance_ids")) and bool(control.get("scenario_ids")) and bool(control.get("obligation_ids")) and all(value in {"full", "not_applicable"} for value in component_states), f"CONTROL_FALSE_PASS:{control.get('control_id')}")
        if control.get("terminal") == "FAIL":
            f.need(control.get("answerability") == "answerable" and bool(control.get("instance_ids")) and bool(control.get("scenario_ids")) and bool(control.get("obligation_ids")) and any(value in {"partial", "absent"} for value in component_states), f"CONTROL_FALSE_FAIL:{control.get('control_id')}")
        if control.get("terminal") == "NOT_APPLICABLE":
            f.need(definition.get("applicability") == "conditional" and all(value == "not_applicable" for value in component_states), f"CONTROL_FALSE_NOT_APPLICABLE:{control.get('control_id')}")
        f.need(not (definition.get("applicability") == "required" and control.get("terminal") == "NOT_APPLICABLE"), f"REQUIRED_CONTROL_NOT_APPLICABLE:{control.get('control_id')}")
        control_plan_satisfied.append(control.get("terminal") == "PASS" or (control.get("terminal") == "NOT_APPLICABLE" and definition.get("applicability") == "conditional" and all(value == "not_applicable" for value in component_states)))

    misses = obj.get("critical_misses", [])
    miss_metric = metrics.get("critical_miss_summary", {})
    f.need(miss_metric.get("count") == len(misses), "MISS_COUNT")
    f.need(set(miss_metric.get("ids", [])) == {m.get("miss_id") for m in misses}, "MISS_IDS")
    f.need(miss_metric.get("weight") == 5 * len(misses), "MISS_WEIGHT")
    critical_gap_ids = {row["obligation_id"] for row in rows if row.get("severity") == "critical" and row.get("is_gap")}
    miss_obligation_ids = {row.get("obligation_id") for row in misses}
    f.need(critical_gap_ids == miss_obligation_ids, "CRITICAL_GAP_MISS_POPULATION")
    novelty = obj.get("novelty", [])
    novelty_metric = metrics.get("grounded_novelty", {})
    expected_novel = {
        "count": len(novelty), "critical_or_major_count": sum(n.get("severity") in {"critical", "major"} for n in novelty),
        "adopted": sum(n.get("disposition") in {"adopted", "adapted"} for n in novelty),
        "conditional": sum(n.get("disposition") == "conditional" for n in novelty),
        "rejected": sum(n.get("disposition") == "rejected" for n in novelty), "readiness_bonus": 0,
    }
    for key, value in expected_novel.items():
        f.need(novelty_metric.get(key) == value, f"NOVELTY_RECONCILIATION:{key}")

    resources = obj.get("resource_receipts", [])
    f.need(bool(resources), "EMPTY_RESOURCE_RECEIPTS")
    resource_ids = [row.get("receipt_id") for row in resources]
    f.unique(resource_ids, "DUPLICATE_RESOURCE_RECEIPT")
    f.unique([(row.get("context_id"), row.get("invocation_id"), row.get("attempt_ordinal")) for row in resources], "DUPLICATE_INVOCATION_ATTEMPT")
    declared_pass_ids = {row.get("pass_id") for row in obj.get("passes", [])}
    invocation_keys = {(row.get("context_id"), row.get("invocation_id")) for row in resources}
    for context_id, invocation_id in invocation_keys:
        invocation_resources = [row for row in resources if row.get("context_id") == context_id and row.get("invocation_id") == invocation_id]
        ordinal_1 = [row for row in invocation_resources if row.get("attempt_ordinal") == 1]
        ordinal_2 = [row for row in invocation_resources if row.get("attempt_ordinal") == 2]
        f.need(len(ordinal_1) == 1, f"BASE_ATTEMPT_POPULATION:{context_id}:{invocation_id}")
        f.need(len(ordinal_2) <= 1 and len(invocation_resources) <= 2, f"RETRY_ATTEMPT_POPULATION:{context_id}:{invocation_id}")
        if ordinal_2:
            f.need(ordinal_2[0].get("retry_kind") == "infrastructure" and ordinal_2[0].get("prior_attempt_receipt_id") == ordinal_1[0].get("receipt_id"), f"RETRY_DIRECT_LINEAGE:{context_id}:{invocation_id}")
            immutable_fields = ("worker_role", "activity_kind", "target_family_id", "challenge_id", "role_id", "stage_id", "pass_id", "requested_model")
            f.need(all(ordinal_2[0].get(field) == ordinal_1[0].get(field) for field in immutable_fields), f"RETRY_ACTIVITY_DRIFT:{context_id}:{invocation_id}")
    effective: list[int] = []
    infrastructure_retries = 0
    worker_by_context = {row.get("context_id"): row for row in workers}
    operation_by_id = {row.get("operation_id"): row for row in (research or {}).get("operation_receipts", [])}
    credited_operation_ids: list[str] = []
    for receipt in resources:
        worker = worker_by_context.get(receipt.get("context_id"), {})
        f.need(receipt.get("worker_role") == worker.get("worker_role"), f"RESOURCE_WORKER_ROLE:{receipt.get('receipt_id')}")
        f.need(receipt.get("activity_binding_sha256") == resource_activity_binding(receipt), f"RESOURCE_ACTIVITY_BINDING:{receipt.get('receipt_id')}")
        activity = receipt.get("activity_kind")
        activity_contract = {
            "local_expectation": ("LOCAL_EXPECTATION_MODELER", "LOCAL_EXPECTATION_MODELER", "S3_INDEPENDENT_DISCOVERY"),
            "open_discovery": ("OPEN_DISCOVERY_RESEARCHER", "OPEN_DISCOVERY_RESEARCHER", "S3_INDEPENDENT_DISCOVERY"),
            "failure_recovery": ("FAILURE_EVIDENCE_RESEARCHER", "FAILURE_EVIDENCE_RESEARCHER", "S4_FAILURE_RECOVERY"),
            "fresh_challenge": ("LOCAL_EXPECTATION_MODELER", "CROSS_FAMILY_CHALLENGER", "S6_CROSS_FAMILY_CHALLENGE"),
            "targeted_closure": (receipt.get("worker_role"), "TARGETED_CLOSURE", "S7_TARGETED_CLOSURE"),
        }.get(activity)
        f.need(activity_contract is not None and (receipt.get("worker_role"), receipt.get("role_id"), receipt.get("stage_id")) == activity_contract, f"RESOURCE_ACTIVITY_CONTRACT:{receipt.get('receipt_id')}")
        if activity == "fresh_challenge":
            f.need(receipt.get("target_family_id") in PILOTS and receipt.get("target_family_id") != obj.get("family_id") and bool(receipt.get("challenge_id")) and receipt.get("pass_id") == receipt.get("challenge_id"), f"RESOURCE_CHALLENGE_SCOPE:{receipt.get('receipt_id')}")
        else:
            f.need(receipt.get("target_family_id") is None and receipt.get("challenge_id") is None and receipt.get("pass_id") in declared_pass_ids, f"RESOURCE_PASS_SCOPE:{receipt.get('receipt_id')}")
        operation_ids = receipt.get("operation_receipt_ids", [])
        credited_operation_ids.extend(operation_ids)
        f.need(all(operation_id in operation_by_id for operation_id in operation_ids), f"RESOURCE_OPERATION_REF:{receipt.get('receipt_id')}")
        expected_searches = sum(operation_by_id[operation_id].get("operation_kind") == "search" and operation_by_id[operation_id].get("terminal") in {"PASS", "PARTIAL"} for operation_id in operation_ids if operation_id in operation_by_id)
        expected_opens = sum(operation_by_id[operation_id].get("operation_kind") in {"open", "read", "extract", "browser_observe"} and operation_by_id[operation_id].get("terminal") in {"PASS", "PARTIAL"} for operation_id in operation_ids if operation_id in operation_by_id)
        f.need(receipt.get("searches") == expected_searches and receipt.get("opens") == expected_opens, f"RESOURCE_OPERATION_COUNT:{receipt.get('receipt_id')}")
        try:
            expected_wall = elapsed_ms(receipt.get("started_at_utc", ""), receipt.get("finished_at_utc", ""))
            f.need(receipt.get("wall_ms") == expected_wall and receipt.get("queue_ms", 0) + receipt.get("active_ms", 0) <= expected_wall, f"RESOURCE_TIME_DERIVATION:{receipt.get('receipt_id')}")
        except Exception:
            f.need(False, f"RESOURCE_TIME_PARSE:{receipt.get('receipt_id')}")
        retry_kind = receipt.get("retry_kind")
        ordinal = receipt.get("attempt_ordinal")
        if retry_kind == "none":
            f.need(ordinal == 1 and receipt.get("prior_attempt_receipt_id") is None and receipt.get("retries") == 0, f"RETRY_LINEAGE:{receipt.get('receipt_id')}")
        elif retry_kind == "infrastructure":
            infrastructure_retries += 1
            prior = next((row for row in resources if row.get("receipt_id") == receipt.get("prior_attempt_receipt_id")), None)
            f.need(ordinal == 2 and receipt.get("retries") == 1 and prior is not None and prior.get("context_id") == receipt.get("context_id") and prior.get("failure_class") == "infrastructure", f"INFRA_RETRY_LINEAGE:{receipt.get('receipt_id')}")
        else:
            f.need(False, f"SEMANTIC_RETRY:{receipt.get('receipt_id')}")
        native = receipt.get("native_total_tokens")
        derived: int | None = None
        if all(receipt.get(key) is not None for key in ("input_tokens", "cached_input_tokens", "input_includes_cached", "visible_output_tokens", "reasoning_output_tokens", "output_includes_reasoning")) and receipt.get("input_includes_cached") is True and receipt["cached_input_tokens"] <= receipt["input_tokens"]:
            derived = receipt["input_tokens"] + receipt["visible_output_tokens"]
            if receipt["output_includes_reasoning"] is False:
                derived += receipt["reasoning_output_tokens"]
        expected_total = native if native is not None else derived
        expected_source = "native" if native is not None else ("derived_exact" if derived is not None else "unavailable")
        f.need(receipt.get("derived_total_tokens") == derived, f"RESOURCE_DERIVED:{receipt.get('receipt_id')}")
        f.need(receipt.get("effective_total_tokens") == expected_total, f"RESOURCE_EFFECTIVE:{receipt.get('receipt_id')}")
        f.need(receipt.get("effective_total_source") == expected_source, f"RESOURCE_SOURCE:{receipt.get('receipt_id')}")
        if expected_total is not None:
            effective.append(expected_total)
    f.unique(credited_operation_ids, "DUPLICATE_OPERATION_CREDIT")
    if research is not None:
        f.need(set(credited_operation_ids) == set(operation_by_id), "OPERATION_CREDIT_POPULATION")
    cost = metrics.get("cost_latency", {})
    exact_total = sum(effective) if len(effective) == len(resources) else None
    f.need(cost.get("all_reported_tokens") == exact_total, "COST_TOKEN_TOTAL")
    f.need(cost.get("effective_total_source") == ("unavailable" if exact_total is None else ("native" if all(r.get("native_total_tokens") is not None for r in resources) else "derived_exact")), "COST_TOKEN_SOURCE")
    f.need(cost.get("searches") == sum(r.get("searches", 0) for r in resources), "COST_SEARCHES")
    f.need(cost.get("opens") == sum(r.get("opens", 0) for r in resources), "COST_OPENS")
    f.need(cost.get("active_ms") == sum(r.get("active_ms", 0) for r in resources), "COST_ACTIVE")
    valid_times = bool(resources) and all(isinstance(r.get("started_at_utc"), str) and isinstance(r.get("finished_at_utc"), str) for r in resources)
    family_elapsed = None
    if valid_times:
        family_elapsed = elapsed_ms(min(r["started_at_utc"] for r in resources), max(r["finished_at_utc"] for r in resources))
    f.need(cost.get("wall_ms") == family_elapsed, "COST_WALL")
    f.need(cost.get("input_includes_cached") is (all(r.get("input_includes_cached") is True for r in resources) if resources else True), "COST_CACHED_INCLUSION")
    f.need((cost.get("dollars") is None) == bool(cost.get("dollar_null_reason")), "DOLLAR_NULL_REASON")
    accounting = obj.get("family_accounting", {})
    input_total = sum(r.get("input_tokens", 0) for r in resources if r.get("input_tokens") is not None)
    output_total = sum((r.get("visible_output_tokens", 0) or 0) + ((r.get("reasoning_output_tokens", 0) or 0) if r.get("output_includes_reasoning") is False else 0) for r in resources)
    contexts = len({r.get("context_id") for r in resources})
    targeted_invocations = {(row.get("context_id"), row.get("invocation_id")) for row in resources if row.get("activity_kind") == "targeted_closure" and row.get("attempt_ordinal") == 1}
    expected_accounting = {"elapsed_ms": family_elapsed, "input_tokens": input_total, "output_tokens": output_total, "all_reported_tokens": exact_total, "semantic_contexts": contexts, "infrastructure_retries": infrastructure_retries, "searches": cost.get("searches"), "opens": cost.get("opens"), "targeted_followups": len(targeted_invocations), "closure_cycles": len(targeted_invocations)}
    for key, value in expected_accounting.items():
        f.need(accounting.get(key) == value, f"FAMILY_ACCOUNTING:{key}")
    if valid_times:
        f.need(accounting.get("started_at_utc") == min(r["started_at_utc"] for r in resources) and accounting.get("finished_at_utc") == max(r["finished_at_utc"] for r in resources), "FAMILY_WINDOW")
    worker_contexts = {row.get("context_id") for row in workers}
    resource_contexts = {row.get("context_id") for row in resources}
    f.need(worker_contexts == resource_contexts, "WORKER_RESOURCE_CONTEXT")
    research_context = next((row.get("context_id") for row in workers if row.get("worker_role") == "OPEN_DISCOVERY_RESEARCHER"), None)
    research_resources = [row for row in resources if row.get("context_id") == research_context]
    f.need(bool(research_resources) and sum(row.get("searches", 0) for row in research_resources) > 0 and sum(row.get("opens", 0) for row in research_resources) > 0, "EXTERNAL_RESEARCH_OPERATIONS")
    worker_fuses_pass = True
    if contract:
        cap = contract["budgets"]["per_family"]
        worker_by_context = {row.get("context_id"): row for row in workers}
        for context_id, worker in worker_by_context.items():
            context_resources = [row for row in resources if row.get("context_id") == context_id]
            context_input = sum(row.get("input_tokens", 0) or 0 for row in context_resources)
            context_output = sum((row.get("visible_output_tokens", 0) or 0) + ((row.get("reasoning_output_tokens", 0) or 0) if row.get("output_includes_reasoning") is False else 0) for row in context_resources)
            context_effective_values = [row.get("effective_total_tokens") for row in context_resources]
            context_effective = sum(context_effective_values) if context_resources and all(value is not None for value in context_effective_values) else None
            conditional = worker.get("worker_role") == "FAILURE_EVIDENCE_RESEARCHER"
            prefix = "conditional_failure_worker" if conditional else "base_worker"
            total_ok = context_effective is not None and context_effective <= cap[f"{prefix}_all_reported_tokens_maximum" + ("" if conditional else "_each")]
            input_ok = context_input <= cap[f"{prefix}_input_tokens_maximum" + ("" if conditional else "_each")]
            output_ok = context_output <= cap[f"{prefix}_output_tokens_maximum" + ("" if conditional else "_each")]
            f.need(total_ok, f"WORKER_TOTAL_FUSE:{context_id}")
            f.need(input_ok, f"WORKER_INPUT_FUSE:{context_id}")
            f.need(output_ok, f"WORKER_OUTPUT_FUSE:{context_id}")
            worker_fuses_pass = worker_fuses_pass and total_ok and input_ok and output_ok
        computed_within = worker_fuses_pass and exact_total is not None and exact_total <= cap["family_all_reported_tokens_maximum"] and input_total <= cap["family_input_tokens_maximum"] and output_total <= cap["family_output_tokens_maximum"] and infrastructure_retries <= cap["infrastructure_retries_maximum"] and cost.get("searches", 0) <= cap["external_search_queries_maximum"] and cost.get("opens", 0) <= cap["external_page_opens_maximum"] and (family_elapsed is not None and family_elapsed <= cap["wall_clock_seconds_maximum"] * 1000) and contexts <= cap["semantic_contexts_maximum"] and all(r.get("raw_bytes", 0) <= 1048576 for r in resources) and accounting.get("artifact_bytes", 0) <= cap["artifact_bytes_maximum"] and accounting.get("artifact_files", 0) <= cap["artifact_files_maximum"] and accounting.get("largest_artifact_bytes", 0) <= 1048576 and accounting.get("targeted_followups", 0) <= cap["targeted_followups_maximum_per_existing_worker"] * 2 and accounting.get("closure_cycles", 0) <= cap["closure_cycles_maximum"]
        f.need(cost.get("within_fuse") is computed_within, "WITHIN_FUSE")
    elif exact_total is None:
        f.need(cost.get("within_fuse") is False, "NULL_TOKEN_FALSE_FUSE")

    gates = obj.get("gates", [])
    gate_ids = [g.get("gate_id") for g in gates]
    f.unique(gate_ids, "DUPLICATE_GATE")
    f.need(set(gate_ids) == METHOD_GATES | PLAN_GATES, "GATE_POPULATION")
    gate_by_id = {g.get("gate_id"): g for g in gates}
    for gate in gates:
        f.need(gate.get("scope") == ("method" if str(gate.get("gate_id", "")).startswith("G") else "plan_slice"), f"GATE_SCOPE:{gate.get('gate_id')}")
    if inputs:
        f.need({inputs.get("research_portfolio_ref"), inputs.get("research_adequacy_ref")} <= set(gate_by_id.get("G3_DISCOVERY_AND_ADEQUACY", {}).get("evidence_refs", [])), "G3_EVIDENCE_BINDING")
        f.need({inputs.get("control_registry_ref"), inputs.get("fresh_challenge_ref")} <= set(gate_by_id.get("G5_REALIZATION_AND_CONTROLS", {}).get("evidence_refs", [])), "G5_EVIDENCE_BINDING")
    passes = obj.get("passes", [])
    f.unique([p.get("pass_id") for p in passes], "DUPLICATE_PASS_ID")
    targeted = [p for p in passes if p.get("pass_kind") == "targeted_closure"]
    f.need(len(targeted) <= 4, "TARGETED_PASS_FUSE")
    targeted_primary_resources = [row for row in resources if row.get("activity_kind") == "targeted_closure" and row.get("attempt_ordinal") == 1]
    targeted_pass_ids = [row.get("pass_id") for row in targeted]
    targeted_resource_pass_ids = [row.get("pass_id") for row in targeted_primary_resources]
    f.need(len(targeted) == len(targeted_primary_resources) and set(targeted_pass_ids) == set(targeted_resource_pass_ids), "TARGETED_PASS_RESOURCE_POPULATION")
    f.unique([row.get("invocation_id") for row in targeted_primary_resources], "TARGETED_INVOCATION_DUPLICATE")
    for targeted_pass in targeted:
        primary_invocations = {row.get("invocation_id") for row in targeted_primary_resources if row.get("pass_id") == targeted_pass.get("pass_id")}
        f.need(len(primary_invocations) == 1, f"TARGETED_PASS_INVOCATION_BINDING:{targeted_pass.get('pass_id')}")
    clean_streak = 0
    for receipt in passes:
        computed_clean = not receipt.get("added_critical_or_major_ids") and receipt.get("material_revisions") == 0 and receipt.get("adequacy_gap_count") == 0
        f.need(receipt.get("clean") is computed_clean, f"CLEAN_PASS:{receipt.get('pass_id')}")
        if receipt.get("pass_kind") == "targeted_closure":
            clean_streak = clean_streak + 1 if computed_clean else 0
            f.need(receipt.get("clean_streak_after") == clean_streak, f"CLEAN_STREAK_DERIVATION:{receipt.get('pass_id')}")
        bound_resources = [row for row in resources if row.get("activity_kind") != "fresh_challenge" and row.get("pass_id") == receipt.get("pass_id")]
        f.need(bool(bound_resources), f"PASS_RESOURCE_POPULATION:{receipt.get('pass_id')}")
        bound_invocations = {(row.get("context_id"), row.get("invocation_id")) for row in bound_resources}
        for invocation_key in bound_invocations:
            invocation_attempts = [row for row in bound_resources if (row.get("context_id"), row.get("invocation_id")) == invocation_key]
            final_attempt = max(invocation_attempts, key=lambda row: row.get("attempt_ordinal", 0))
            f.need(final_attempt.get("failure_class") is None, f"PASS_RESOURCE_FINAL_ATTEMPT_FAILED:{receipt.get('pass_id')}:{invocation_key[0]}:{invocation_key[1]}")
        f.need(receipt.get("all_reported_tokens") == sum(row.get("effective_total_tokens", 0) or 0 for row in bound_resources), f"PASS_TOKEN_DERIVATION:{receipt.get('pass_id')}")
        f.need(receipt.get("active_ms") == sum(row.get("active_ms", 0) for row in bound_resources), f"PASS_ACTIVE_DERIVATION:{receipt.get('pass_id')}")
    non_challenge_effective = [row.get("effective_total_tokens") for row in resources if row.get("activity_kind") != "fresh_challenge"]
    if non_challenge_effective and all(value is not None for value in non_challenge_effective):
        f.need(sum(p.get("all_reported_tokens", 0) for p in passes) == sum(non_challenge_effective), "PASS_TOKEN_TOTAL")
    if passes and adequacy is not None:
        f.need(passes[-1].get("adequacy_gap_count") == len(set(adequacy.get("unresolved_adequacy_gap_ids", []))), "LATEST_PASS_ADEQUACY_GAP_DERIVATION")
    two_clean = len(targeted) >= 2 and all(p.get("clean") for p in targeted[-2:]) and targeted[-1].get("clean_streak_after") == 2

    method_ready = obj.get("method_slice_status") == "METHOD_SLICE_READY"
    if method_ready:
        f.need(obj.get("terminal") == "METHOD_SLICE_READY", "METHOD_TERMINAL")
        f.need(all(gate_by_id.get(gid, {}).get("terminal") == "PASS" for gid in METHOD_GATES), "METHOD_GATE_FAILURE")
        f.need(two_clean, "FRONTIER_NOT_STABLE")
        authority = metrics.get("authority_safety", {})
        f.need(authority.get("unsafe_promotions") == 0 and authority.get("false_critical_blockers") == 0 and authority.get("contradicted_mandatory_claims") == 0, "AUTHORITY_UNSAFE")
        f.need(exact_total is not None and cost.get("within_fuse") is True, "AFFORDABILITY_UNPROVEN")
        f.need(all(row.get("terminal") == "DONE" for row in workers), "WORKER_NOT_DONE")
        f.need(adequacy is not None and adequacy.get("terminal") == "PASS" and not validate_research_adequacy(adequacy, research, workers, surface, failure_research), "RESEARCH_ADEQUACY_NOT_READY")
        f.need(challenge_artifact is not None and challenge_artifact.get("terminal") == "DONE" and not validate_challenge_receipt(challenge_artifact, graph, surface, registry), "CHALLENGE_NOT_READY")
        result_gap_ids = {row.get("obligation_id") for row in rows if row.get("is_gap")}
        nonpass_control_ids = {row.get("control_id") for row in controls if row.get("terminal") != "PASS"}
        nonapplicable_ids = {row.get("obligation_id") for row in rows if not row.get("applicable") or row.get("disposition") == "not_applicable"} | {row.get("control_id") for row in controls if row.get("terminal") == "NOT_APPLICABLE"}
        for finding in (challenge_artifact or {}).get("findings", []):
            targets = set(finding.get("target_refs", []))
            if finding.get("disposition") in {"blocked", "accepted_residual"}:
                f.need(bool(targets & (result_gap_ids | nonpass_control_ids)), f"CHALLENGE_FINDING_NOT_PROPAGATED:{finding.get('finding_id')}")
            if finding.get("disposition") == "not_applicable":
                f.need(bool(targets & nonapplicable_ids), f"CHALLENGE_NA_NOT_PROPAGATED:{finding.get('finding_id')}")
        f.need(bool(controls) and all(row.get("terminal") in {"PASS", "FAIL", "NOT_APPLICABLE"} for row in controls), "CONTROL_METHOD_NOT_READY")
    if obj.get("terminal") == "RESEARCH_LIMITED":
        f.need(not method_ready, "RESEARCH_LIMITED_READY")
    applicable_high_risk_rows = [row for row in rows if row.get("applicable") and row.get("severity") in {"critical", "major"}]
    p2_expected = bool(applicable_high_risk_rows) and all(
        (not row.get("requires_named_realization") or row.get("realization_credit") == 1)
        and not row.get("is_gap")
        for row in applicable_high_risk_rows
    ) and bool(controls) and all(control_plan_satisfied)
    f.need((gate_by_id.get("P2_PLAN_NAMED_REALIZATION", {}).get("terminal") == "PASS") is p2_expected, "P2_GATE_DERIVATION")
    plan_ready = obj.get("plan_slice_status") == "PLAN_SLICE_READY_WITHIN_ENVELOPE"
    if plan_ready:
        f.need(all(row.get("disposition") not in {"open", "blocked", "residual_risk_accepted"} for row in rows), "PLAN_READY_OPEN_DISPOSITION")
        f.need(not misses, "PLAN_READY_CRITICAL_MISS")
        f.need(not challenge_has_any_findings, "PLAN_READY_CHALLENGE_FINDING")
        f.need(all(gate_by_id.get(gid, {}).get("terminal") == "PASS" for gid in PLAN_GATES), "PLAN_GATE_FAILURE")
        f.need(all(
            r.get("semantic_credit") == 1
            and (not r.get("evidence_required") or r.get("evidence_credit") == 1)
            and (not r.get("requires_named_realization") or r.get("realization_credit") == 1)
            and r.get("is_gap") is False
            for r in applicable_high_risk_rows
        ), "PLAN_READY_HIGH_RISK_GAP")
        f.need(bool(controls) and all(control_plan_satisfied), "PLAN_READY_CONTROL_GAP")
    return f.codes


def expected_protected_entries(source_snapshot: dict[str, Any], contract: dict[str, Any], repo_root: Path) -> list[dict[str, Any]]:
    rows = [
        {"scope_id": "plans_population", "path": row["path"], "entry_kind": "regular_file", "mode": row["mode"], "bytes": row["bytes"], "sha256": row["sha256"]}
        for row in source_snapshot.get("entries", []) if row.get("entry_kind") == "regular_file"
    ]
    for bound in contract.get("bound_inputs", []):
        path = Path(bound["path"])
        display = path.resolve().relative_to(repo_root.resolve()).as_posix() if path.resolve().is_relative_to(repo_root.resolve()) else str(path.resolve())
        rows.append({"scope_id": "bound_input", "path": display, "entry_kind": "regular_file", "mode": path.stat().st_mode & 0o7777, "bytes": path.stat().st_size, "sha256": hashlib.sha256(path.read_bytes()).hexdigest()})
    return sorted(rows, key=lambda row: (row["scope_id"], row["path"]))


def validate_summary(
    obj: dict[str, Any],
    results: list[dict[str, Any]],
    contract: dict[str, Any],
    source_snapshot: dict[str, Any],
    run_root: Path | None = None,
    contract_sha256: str | None = None,
    repo_root: Path | None = None,
    trusted_capability_path: Path | None = None,
    researches: list[dict[str, Any]] | None = None,
    adequacies: list[dict[str, Any]] | None = None,
    registry: dict[str, Any] | None = None,
    challenges: list[dict[str, Any]] | None = None,
    surface: dict[str, Any] | None = None,
) -> list[str]:
    f = Findings("SUMMARY")
    family_ids = [row.get("family_id") for row in results]
    f.need(set(family_ids) == set(PILOTS) and len(family_ids) == 4, "FAMILY_POPULATION")
    f.need(all(row.get("trial_id") == obj.get("trial_id") for row in results) and source_snapshot.get("trial_id") == obj.get("trial_id"), "TRIAL_ID_MISMATCH")
    f.need(obj.get("artifact_validator_sha256") == validator_sha256(), "VALIDATOR_IDENTITY")
    if contract_sha256 is not None:
        f.need(obj.get("contract_sha256") == contract_sha256, "CONTRACT_BINDING")
    f.need(obj.get("source_snapshot_sha256") == artifact_hash("source-snapshot", source_snapshot), "SOURCE_SNAPSHOT_BINDING")

    bindings = obj.get("family_result_bindings", [])
    f.unique([row.get("family_id") for row in bindings], "DUPLICATE_FAMILY_BINDING")
    binding_by_family = {row.get("family_id"): row for row in bindings}
    for result in results:
        binding = binding_by_family.get(result.get("family_id"), {})
        f.need(binding.get("result_sha256") == artifact_hash("assurance-result", result), f"RESULT_BINDING:{result.get('family_id')}")

    result_by_family = {row.get("family_id"): row for row in results}
    research_by_family = {row.get("family_id"): row for row in (researches or []) if row.get("portfolio_kind") == "open_discovery"}
    failure_research_by_family = {row.get("family_id"): row for row in (researches or []) if row.get("portfolio_kind") == "failure_recovery"}
    adequacy_by_family = {row.get("family_id"): row for row in (adequacies or [])}
    challenge_by_family = {row.get("target_family_id"): row for row in (challenges or [])}
    if any(value is not None for value in (researches, adequacies, registry, challenges)):
        f.need(set(research_by_family) == set(PILOTS) and len(research_by_family) == 4, "RESEARCH_POPULATION")
        required_failure_families = {row.get("family_id") for row in (adequacies or []) if row.get("recovery", {}).get("required") is True}
        f.need(set(failure_research_by_family) == required_failure_families, "FAILURE_RESEARCH_POPULATION")
        f.need(set(adequacy_by_family) == set(PILOTS) and len(adequacies or []) == 4, "ADEQUACY_POPULATION")
        f.need(set(challenge_by_family) == set(PILOTS) and len(challenges or []) == 4, "CHALLENGE_POPULATION")
        f.need(registry is not None, "CONTROL_REGISTRY_REQUIRED")
        if registry is not None:
            f.codes.extend(validate_control_registry(registry))
        for result in results:
            family = result.get("family_id")
            inputs = result.get("input_bindings", {})
            research = research_by_family.get(family)
            adequacy = adequacy_by_family.get(family)
            challenge_artifact = challenge_by_family.get(family)
            if research is not None:
                f.need(inputs.get("research_portfolio_sha256") == artifact_hash("research-portfolio", research), f"RESEARCH_BINDING:{family}")
                f.codes.extend(validate_research_portfolio(research))
            if adequacy is not None:
                f.need(inputs.get("research_adequacy_sha256") == artifact_hash("research-adequacy", adequacy), f"ADEQUACY_BINDING:{family}")
                f.codes.extend(validate_research_adequacy(adequacy, research, result.get("worker_receipts", []), surface, failure_research_by_family.get(family)))
            if registry is not None:
                f.need(inputs.get("control_registry_sha256") == artifact_hash("control-registry", registry), f"CONTROL_REGISTRY_BINDING:{family}")
            if challenge_artifact is not None:
                f.need(inputs.get("fresh_challenge_sha256") == artifact_hash("challenge-receipt", challenge_artifact), f"CHALLENGE_BINDING:{family}")
                embedded = result.get("fresh_challenge_receipt", {})
                f.need(
                    embedded.get("target_family_id") == challenge_artifact.get("target_family_id")
                    and embedded.get("challenger_family_id") == challenge_artifact.get("challenger_family_id")
                    and embedded.get("challenger_context_id") == challenge_artifact.get("challenger_context_id")
                    and embedded.get("target_graph_sha256") == challenge_artifact.get("target_graph_sha256")
                    and set(embedded.get("finding_ids", [])) == {row.get("finding_id") for row in challenge_artifact.get("findings", [])},
                    f"CHALLENGE_EMBEDDED_BINDING:{family}",
                )
    global_worker_contexts = [row.get("context_id") for result in results for row in result.get("worker_receipts", [])]
    f.unique(global_worker_contexts, "GLOBAL_WORKER_CONTEXT_REUSE")
    for result in results:
        challenge = result.get("fresh_challenge_receipt", {})
        challenger = result_by_family.get(challenge.get("challenger_family_id"), {})
        local_contexts = {row.get("context_id") for row in challenger.get("worker_receipts", []) if row.get("worker_role") == "LOCAL_EXPECTATION_MODELER"}
        f.need(challenge.get("challenger_context_id") in local_contexts, f"CHALLENGER_CONTEXT:{result.get('family_id')}")
        f.need(challenge.get("challenger_context_id") not in {row.get("context_id") for row in result.get("worker_receipts", [])}, f"CHALLENGER_TARGET_CONTEXT_COLLISION:{result.get('family_id')}")
        challenge_artifact = challenge_by_family.get(result.get("family_id"))
        if challenge_artifact is not None:
            f.codes.extend(validate_cross_family_challenge_resource(challenge_artifact, result, challenger))
            challenge_resource = next(
                (row for row in challenger.get("resource_receipts", []) if row.get("receipt_id") == challenge_artifact.get("challenge_resource_receipt_id")),
                None,
            )
            f.need(challenge_resource is not None, f"CHALLENGE_RESOURCE_RECEIPT:{result.get('family_id')}")
            if challenge_resource is not None:
                f.need(challenge_resource.get("context_id") == challenge_artifact.get("challenger_context_id"), f"CHALLENGE_RESOURCE_CONTEXT:{result.get('family_id')}")
                f.need(
                    challenge_resource.get("activity_kind") == "fresh_challenge"
                    and challenge_resource.get("stage_id") == "S6_CROSS_FAMILY_CHALLENGE"
                    and challenge_resource.get("role_id") == "CROSS_FAMILY_CHALLENGER"
                    and challenge_resource.get("target_family_id") == result.get("family_id")
                    and challenge_resource.get("challenge_id") == challenge_artifact.get("challenge_id")
                    and challenge_resource.get("pass_id") == challenge_artifact.get("challenge_id"),
                    f"CHALLENGE_RESOURCE_SCOPE:{result.get('family_id')}",
                )
                f.need(challenge_artifact.get("challenge_resource_receipt_sha256") == artifact_hash("resource-receipt", challenge_resource), f"CHALLENGE_RESOURCE_HASH:{result.get('family_id')}")
                f.need(challenge_artifact.get("target_locks_sha256") == challenge_target_locks_hash(result), f"CHALLENGE_TARGET_LOCKS:{result.get('family_id')}")
                f.need(challenge_artifact.get("target_locks_ref") == f"families/{result.get('family_id')}/TARGET_LOCK_SET.json", f"CHALLENGE_TARGET_LOCK_REF:{result.get('family_id')}")
                try:
                    f.need(
                        parse_time(challenge_resource.get("started_at_utc", "")) <= parse_time(challenge_artifact.get("started_at_utc", ""))
                        <= parse_time(challenge_artifact.get("finished_at_utc", "")) <= parse_time(challenge_resource.get("finished_at_utc", "")),
                        f"CHALLENGE_RESOURCE_WINDOW:{result.get('family_id')}",
                    )
                except Exception:
                    f.need(False, f"CHALLENGE_RESOURCE_TIME:{result.get('family_id')}")

    controller = obj.get("controller_resource_receipts", [])
    f.need(not ({row.get("context_id") for row in controller} & set(global_worker_contexts)), "CONTROLLER_WORKER_CONTEXT_COLLISION")
    all_resource_ids = [row.get("receipt_id") for result in results for row in result.get("resource_receipts", [])] + [row.get("receipt_id") for row in controller]
    f.unique(all_resource_ids, "DUPLICATE_RESOURCE_RECEIPT")
    controller_effective = 0; controller_input = 0; controller_output = 0
    controller_searches = 0; controller_opens = 0
    controller_telemetry_complete = True
    f.unique([row.get("invocation_id") for row in controller], "DUPLICATE_CONTROLLER_INVOCATION")
    for receipt in controller:
        visible = receipt.get("visible_output_tokens"); reasoning = receipt.get("reasoning_output_tokens"); incoming = receipt.get("input_tokens")
        derived = None
        if incoming is not None and visible is not None and reasoning is not None and receipt.get("output_includes_reasoning") is not None:
            derived = incoming + visible + (reasoning if receipt.get("output_includes_reasoning") is False else 0)
        expected = receipt.get("native_total_tokens") if receipt.get("native_total_tokens") is not None else derived
        source = "native" if receipt.get("native_total_tokens") is not None else ("derived_exact" if derived is not None else "unavailable")
        controller_telemetry_complete = controller_telemetry_complete and expected is not None and source in {"native", "derived_exact"}
        f.need(receipt.get("effective_total_tokens") == expected and receipt.get("effective_total_source") == source, f"CONTROLLER_RESOURCE:{receipt.get('receipt_id')}")
        f.need(receipt.get("attempt_ordinal") == 1 and receipt.get("retry_kind") == "none" and receipt.get("prior_attempt_receipt_id") is None, f"CONTROLLER_RETRY:{receipt.get('receipt_id')}")
        f.need(receipt.get("activity_binding_sha256") == resource_activity_binding(receipt), f"CONTROLLER_ACTIVITY_BINDING:{receipt.get('receipt_id')}")
        f.need(receipt.get("worker_role") == "TRIAL_CONTROLLER" and receipt.get("activity_kind") == "cross_family_seam" and receipt.get("target_family_id") is None and receipt.get("challenge_id") is None and receipt.get("role_id") == "TRIAL_CONTROLLER" and receipt.get("stage_id") == "S7_COVERAGE_FEEDBACK" and receipt.get("failure_class") is None, f"CONTROLLER_SEAM_ACTIVITY:{receipt.get('receipt_id')}")
        if expected is not None: controller_effective += expected
        controller_input += incoming or 0
        controller_output += (visible or 0) + ((reasoning or 0) if receipt.get("output_includes_reasoning") is False else 0)
        controller_searches += receipt.get("searches", 0); controller_opens += receipt.get("opens", 0)

    family_accounting = [row.get("family_accounting", {}) for row in results]
    totals_expected = {
        "input_tokens": sum(row.get("input_tokens", 0) for row in family_accounting) + controller_input,
        "output_tokens": sum(row.get("output_tokens", 0) for row in family_accounting) + controller_output,
        "all_reported_tokens": sum(row.get("all_reported_tokens", 0) for row in family_accounting) + controller_effective,
        "semantic_contexts": sum(row.get("semantic_contexts", 0) for row in family_accounting),
        "searches": sum(row.get("searches", 0) for row in family_accounting) + controller_searches,
        "opens": sum(row.get("opens", 0) for row in family_accounting) + controller_opens,
    }
    manifest = obj.get("artifact_manifest", [])
    manifest_paths = [row.get("path") for row in manifest]
    f.unique(manifest_paths, "DUPLICATE_ARTIFACT_PATH")
    manifest_owner_by_path = {row.get("path"): row.get("owner_scope") for row in manifest}
    manifest_by_path = {row.get("path"): row for row in manifest}
    for research in researches or []:
        for operation in research.get("operation_receipts", []):
            manifest_row = manifest_by_path.get(operation.get("capture_ref"), {})
            f.need(manifest_row.get("owner_scope") == research.get("family_id") and manifest_row.get("sha256") == operation.get("capture_sha256"), f"RESEARCH_CAPTURE_MANIFEST:{research.get('family_id')}:{operation.get('operation_id')}")
    for result in results:
        input_bindings = result.get("input_bindings", {})
        for ref_key, sha_key, owner in (
            ("research_portfolio_ref", "research_portfolio_sha256", result.get("family_id")),
            ("research_adequacy_ref", "research_adequacy_sha256", result.get("family_id")),
            ("control_registry_ref", "control_registry_sha256", "shared"),
            ("fresh_challenge_ref", "fresh_challenge_sha256", result.get("family_id")),
        ):
            manifest_row = manifest_by_path.get(input_bindings.get(ref_key), {})
            f.need(
                manifest_row.get("owner_scope") == owner and manifest_row.get("sha256") == input_bindings.get(sha_key),
                f"TYPED_INPUT_MANIFEST_BINDING:{result.get('family_id')}:{ref_key}",
            )
        for worker in result.get("worker_receipts", []):
            for binding in worker.get("artifact_bindings", []):
                manifest_row = manifest_by_path.get(binding.get("ref"), {})
                f.need(manifest_row.get("owner_scope") == result.get("family_id") and manifest_row.get("sha256") == binding.get("sha256"), f"WORKER_ARTIFACT_BINDING:{result.get('family_id')}:{worker.get('worker_role')}:{binding.get('artifact_type')}")
        for gate in result.get("gates", []):
            f.need(all(ref in manifest_by_path for ref in gate.get("evidence_refs", [])), f"GATE_EVIDENCE_REF:{result.get('family_id')}:{gate.get('gate_id')}")
    totals_expected.update({"artifact_files": len(manifest) + 1, "artifact_bytes": sum(row.get("bytes", 0) for row in manifest), "largest_artifact_bytes": max([row.get("bytes", 0) for row in manifest] or [0])})
    window = obj.get("execution_window", {})
    try:
        campaign_elapsed = elapsed_ms(window.get("started_at_utc", ""), window.get("finished_at_utc", ""))
    except Exception:
        campaign_elapsed = -1
    f.need(window.get("elapsed_ms") == campaign_elapsed, "CAMPAIGN_WINDOW")
    totals_expected["elapsed_ms"] = campaign_elapsed
    for key, value in totals_expected.items():
        f.need(obj.get("totals", {}).get(key) == value, f"TOTALS_RECONCILIATION:{key}")

    owner_counts: dict[str, tuple[int, int, int]] = {}
    for owner in list(PILOTS) + ["shared", "controller"]:
        rows = [row for row in manifest if row.get("owner_scope") == owner]
        owner_counts[owner] = (len(rows), sum(row.get("bytes", 0) for row in rows), max([row.get("bytes", 0) for row in rows] or [0]))
    for result in results:
        count, size, largest = owner_counts[result["family_id"]]
        accounting = result.get("family_accounting", {})
        f.need((accounting.get("artifact_files"), accounting.get("artifact_bytes"), accounting.get("largest_artifact_bytes")) == (count, size, largest), f"FAMILY_ARTIFACT_ACCOUNTING:{result['family_id']}")

    if run_root is not None:
        f.need(run_root.is_dir(), "RUN_ROOT_MISSING")
        f.need(Path(source_snapshot.get("excluded_future_run_root", "")).resolve() == run_root.resolve(), "SOURCE_EXCLUSION_RUN_ROOT")
        if run_root.is_dir():
            actual: list[dict[str, Any]] = []
            unsafe = False
            for path in sorted(run_root.rglob("*")):
                relative = path.relative_to(run_root).as_posix()
                if relative == "TRIAL_SUMMARY.json": continue
                if path.is_symlink() or (not path.is_file() and not path.is_dir()): unsafe = True
                if path.is_file(): actual.append({"path": relative, "bytes": path.stat().st_size, "sha256": hashlib.sha256(path.read_bytes()).hexdigest()})
            f.need(not unsafe, "UNSAFE_RUN_ENTRY")
            projected = [{key: row.get(key) for key in ("path", "bytes", "sha256")} for row in manifest]
            f.need(projected == actual, "RUN_ARTIFACT_MANIFEST_MISMATCH")
            for binding in bindings:
                path = run_root / binding.get("result_ref", "")
                f.need(path.is_file() and hashlib.sha256(path.read_bytes()).hexdigest() == binding.get("result_sha256") and path.read_bytes() == canonical_bytes(result_by_family.get(binding.get("family_id"), {})), f"RESULT_FILE_BINDING:{binding.get('family_id')}")
            for ref_key, sha_key in (("source_snapshot_ref", "source_snapshot_sha256"), ("launch_authority_ref", "launch_authority_sha256")):
                path = run_root / obj.get(ref_key, "")
                f.need(path.is_file() and hashlib.sha256(path.read_bytes()).hexdigest() == obj.get(sha_key), f"RUN_BINDING:{ref_key}")
            launch_path = run_root / obj.get("launch_authority_ref", "")
            protected_objects: dict[str, dict[str, Any]] = {}
            for phase, ref_key, expected_key in (("BEFORE", "before_ref", "before_sha256"), ("AFTER", "after_ref", "after_sha256")):
                protected_path = run_root / obj.get("protected_invariance", {}).get(ref_key, "")
                f.need(protected_path.is_file(), f"PROTECTED_RECEIPT_MISSING:{ref_key}")
                if protected_path.is_file():
                    protected = json.loads(protected_path.read_text(encoding="utf-8"))
                    protected_objects[phase] = protected
                    f.codes.extend(schema_findings("protected", protected))
                    f.codes.extend(validate_protected_state(protected, phase, source_snapshot, contract_sha256))
                    f.need(protected.get("trial_id") == obj.get("trial_id") and protected.get("state_payload_sha256") == obj.get("protected_invariance", {}).get(expected_key), f"PROTECTED_RECEIPT_BINDING:{ref_key}")
                    f.need(protected_path.read_bytes() == canonical_bytes(protected), f"PROTECTED_RECEIPT_NOT_CANONICAL:{ref_key}")
            before = protected_objects.get("BEFORE", {})
            after = protected_objects.get("AFTER", {})
            if before and after:
                f.need(before.get("generation_id") == after.get("generation_id") and before.get("authorized_run_root") == after.get("authorized_run_root") == str(run_root.resolve()), "PROTECTED_GENERATION_BINDING")
                f.need(before.get("state_payload_sha256") == after.get("state_payload_sha256"), "PROTECTED_STATE_DRIFT")
                if repo_root is not None:
                    expected_entries = expected_protected_entries(source_snapshot, contract, repo_root)
                    f.need(before.get("protected_entries") == expected_entries and after.get("protected_entries") == expected_entries, "PROTECTED_POPULATION_MISMATCH")
                    try:
                        live_git = capture_git_state(repo_root, run_root)
                        comparable_keys = ("head_commit", "head_tree", "symbolic_ref", "status_porcelain_v1_z_excluding_run_root", "index_entries_z", "staged_diff_binary", "tracked_diff_binary")
                        f.need(all(after.get("git_state", {}).get(key) == live_git.get(key) for key in comparable_keys), "PROTECTED_AFTER_NOT_LIVE")
                    except Exception as exc:
                        f.need(False, f"PROTECTED_LIVE_CAPTURE:{type(exc).__name__}")
            if launch_path.is_file():
                launch = json.loads(launch_path.read_text(encoding="utf-8"))
                f.codes.extend(schema_findings("launch", launch))
                f.need(launch.get("trial_id") == obj.get("trial_id") and launch.get("trial_launch_authorized") is True, "LAUNCH_AUTHORITY_TRIAL")
                f.need(launch.get("contract_sha256") == obj.get("contract_sha256") and launch.get("artifact_validator_sha256") == validator_sha256(), "LAUNCH_AUTHORITY_BINDINGS")
                f.need(launch.get("budget_contract_sha256") == artifact_hash("budget-contract", contract.get("budgets", {})), "LAUNCH_AUTHORITY_BUDGET")
                f.need(Path(launch.get("run_root", "")).resolve() == run_root.resolve(), "LAUNCH_AUTHORITY_ROOT")
                f.need(launch_path.read_bytes() == canonical_bytes(launch), "LAUNCH_AUTHORITY_NOT_CANONICAL")
                request_path = run_root / launch.get("launch_request_ref", "")
                f.need(request_path.is_file(), "LAUNCH_REQUEST_MISSING")
                if request_path.is_file():
                    request = json.loads(request_path.read_text(encoding="utf-8"))
                    f.codes.extend(schema_findings("launch_request", request))
                    f.codes.extend(validate_launch_request(request, contract))
                    request_raw_sha = hashlib.sha256(request_path.read_bytes()).hexdigest()
                    f.need(request_path.read_bytes() == canonical_bytes(request), "LAUNCH_REQUEST_NOT_CANONICAL")
                    f.need(request_raw_sha == launch.get("launch_request_sha256"), "LAUNCH_REQUEST_HASH")
                    f.need(request.get("launch_binding_sha256") == launch_request_binding(request) == launch.get("launch_binding_sha256"), "LAUNCH_BINDING")
                    f.need(request.get("trial_id") == launch.get("trial_id") and request.get("generation_id") == launch.get("generation_id") and Path(request.get("run_root", "")).resolve() == run_root.resolve(), "LAUNCH_REQUEST_GENERATION")
                    f.need(request.get("contract_sha256") == obj.get("contract_sha256") and request.get("artifact_validator_sha256") == validator_sha256(), "LAUNCH_REQUEST_CODE_BINDING")
                    f.need(request.get("budget_contract_sha256") == artifact_hash("budget-contract", contract.get("budgets", {})) and request.get("topology_contract_sha256") == artifact_hash("topology-contract", contract.get("topology", {})), "LAUNCH_REQUEST_CONTRACTS")
                    transmission_path = run_root / request.get("external_transmission_manifest_ref", "")
                    f.need(transmission_path.is_file() and hashlib.sha256(transmission_path.read_bytes()).hexdigest() == request.get("external_transmission_manifest_sha256"), "LAUNCH_REQUEST_TRANSMISSION_MANIFEST")
                    source_path_for_request = run_root / obj.get("source_snapshot_ref", "")
                    before_path_for_request = run_root / obj.get("protected_invariance", {}).get("before_ref", "")
                    f.need(source_path_for_request.is_file() and request.get("source_snapshot_sha256") == hashlib.sha256(source_path_for_request.read_bytes()).hexdigest(), "LAUNCH_REQUEST_SOURCE")
                    f.need(before_path_for_request.is_file() and request.get("protected_before_receipt_sha256") == hashlib.sha256(before_path_for_request.read_bytes()).hexdigest() and request.get("protected_before_state_sha256") == before.get("state_payload_sha256"), "LAUNCH_REQUEST_PROTECTED_BEFORE")
                    try:
                        f.need(parse_time(request.get("created_at_utc")) < parse_time(request.get("expires_at_utc")), "LAUNCH_REQUEST_EXPIRY")
                    except Exception:
                        f.need(False, "LAUNCH_REQUEST_TIME_PARSE")
                    f.need(trusted_capability_path is not None and trusted_capability_path.is_file(), "TRUSTED_CAPABILITY_MISSING")
                    if trusted_capability_path is not None and trusted_capability_path.is_file():
                        capability = json.loads(trusted_capability_path.read_text(encoding="utf-8"))
                        f.codes.extend(schema_findings("trusted_capability", capability))
                        # Post-run validation can only verify the immutable
                        # capture and its bindings. The launch turn itself must
                        # have called validate_trusted_capability with genuine
                        # platform-controlled sender metadata before any
                        # external action.
                        f.codes.extend(validate_trusted_capability_bindings(capability, request))
                        capability_raw_sha = hashlib.sha256(trusted_capability_path.read_bytes()).hexdigest()
                        f.need(trusted_capability_path.read_bytes() == canonical_bytes(capability), "TRUSTED_CAPABILITY_NOT_CANONICAL")
                        f.need(not trusted_capability_path.resolve().is_relative_to(run_root.resolve()) and not trusted_capability_path.resolve().is_relative_to(ROOT.resolve()), "TRUSTED_CAPABILITY_INSIDE_WRITER_SCOPE")
                        f.need(str(trusted_capability_path.resolve()) == str(Path(launch.get("trusted_capability_ref", "")).resolve()) and capability_raw_sha == launch.get("trusted_capability_sha256"), "TRUSTED_CAPABILITY_BINDING")
                        f.need(capability.get("capability_payload_sha256") == trusted_capability_payload_hash(capability) and capability.get("capability_id") == launch.get("trusted_capability_id"), "TRUSTED_CAPABILITY_IDENTITY")
                        f.need(capability.get("launch_request_sha256") == request_raw_sha and capability.get("approved_launch_binding_sha256") == request.get("launch_binding_sha256") and capability.get("approved_external_transmission_manifest_sha256") == request.get("external_transmission_manifest_sha256"), "TRUSTED_CAPABILITY_SCOPE")
                        f.need(
                            launch.get("authority_mode") == capability.get("authority_mode")
                            and launch.get("observed_sender_task_path") == capability.get("observed_sender_task_path")
                            and launch.get("observed_message_id") == capability.get("observed_message_id")
                            and launch.get("observed_turn_id") == capability.get("observed_turn_id")
                            and launch.get("authorization_message_sha256") == capability.get("authorization_message_sha256")
                            and launch.get("one_use_nonce_sha256") == capability.get("one_use_nonce_sha256"),
                            "TRUSTED_CAPABILITY_LAUNCH_BINDING",
                        )
                        try:
                            f.need(parse_time(request.get("created_at_utc")) <= parse_time(capability.get("issued_at_utc")) < parse_time(capability.get("expires_at_utc")) and parse_time(launch.get("issued_at_utc")) >= parse_time(capability.get("issued_at_utc")), "TRUSTED_CAPABILITY_TIME")
                        except Exception:
                            f.need(False, "TRUSTED_CAPABILITY_TIME_PARSE")
                marker_path = run_root / launch.get("single_use_marker_ref", "")
                f.need(marker_path.is_file(), "SINGLE_USE_MARKER_MISSING")
                if marker_path.is_file():
                    marker = json.loads(marker_path.read_text(encoding="utf-8"))
                    f.need(marker_path.read_bytes() == canonical_bytes(marker), "SINGLE_USE_MARKER_NOT_CANONICAL")
                    f.need(marker == {"trial_id": launch.get("trial_id"), "generation_id": launch.get("generation_id"), "launch_binding_sha256": launch.get("launch_binding_sha256"), "launch_authority_sha256": hashlib.sha256(launch_path.read_bytes()).hexdigest(), "trusted_capability_sha256": launch.get("trusted_capability_sha256"), "authorization_message_sha256": launch.get("authorization_message_sha256"), "observed_message_id": launch.get("observed_message_id"), "observed_turn_id": launch.get("observed_turn_id"), "one_use_nonce_sha256": launch.get("one_use_nonce_sha256"), "use_ordinal": 1}, "SINGLE_USE_MARKER_BINDING")
            source_path = run_root / obj.get("source_snapshot_ref", "")
            if source_path.is_file():
                f.need(source_path.read_bytes() == canonical_bytes(source_snapshot), "SOURCE_SNAPSHOT_FILE_NOT_CANONICAL")

    budget = contract["budgets"]; campaign = budget["campaign"]; controller_cap = budget["controller_merge_and_reporting"]
    totals = obj.get("totals", {})
    f.need(controller_effective <= controller_cap["all_reported_tokens_maximum"] and controller_input <= controller_cap["input_tokens_maximum"] and controller_output <= controller_cap["output_tokens_maximum"], "CONTROLLER_BUDGET")
    f.need(totals.get("all_reported_tokens", 0) <= campaign["all_reported_tokens_maximum"] and totals.get("input_tokens", 0) <= campaign["model_input_tokens_maximum"] and totals.get("output_tokens", 0) <= campaign["model_output_tokens_maximum"], "CAMPAIGN_TOKEN_BUDGET")
    f.need(totals.get("semantic_contexts", 0) <= campaign["semantic_contexts_maximum"] and totals.get("searches", 0) <= campaign["external_search_queries_maximum"] and totals.get("opens", 0) <= campaign["external_page_opens_maximum"], "CAMPAIGN_OPERATION_BUDGET")
    f.need(campaign_elapsed >= 0 and campaign_elapsed <= campaign["wall_clock_seconds_maximum"] * 1000, "CAMPAIGN_WALL_BUDGET")
    f.need(totals.get("artifact_files", 0) <= campaign["artifact_files_maximum"] and totals.get("artifact_bytes", 0) <= campaign["artifact_bytes_maximum"] and totals.get("largest_artifact_bytes", 0) <= campaign["raw_response_bytes_maximum_each"], "CAMPAIGN_ARTIFACT_BUDGET")

    context_windows: dict[str, tuple[str, str]] = {}
    for result in results:
        for receipt in result.get("resource_receipts", []):
            context = receipt.get("context_id")
            old = context_windows.get(context)
            start, finish = receipt.get("started_at_utc"), receipt.get("finished_at_utc")
            context_windows[context] = (start if old is None else min(old[0], start), finish if old is None else max(old[1], finish))
    events: list[tuple[datetime, int]] = []
    for start, finish in context_windows.values():
        events.extend([(parse_time(start), 1), (parse_time(finish), -1)])
    active = peak = 1
    for _, delta in sorted(events, key=lambda item: (item[0], item[1])):
        active += delta; peak = max(peak, active)
    f.need(peak <= contract["topology"]["global_active_unit_ceiling_including_controller"], "TOPOLOGY_PEAK")

    seam = obj.get("cross_family_seam_passes", [])
    f.need(len(seam) <= 4, "SEAM_PASS_FUSE")
    f.unique([row.get("pass_id") for row in seam], "DUPLICATE_SEAM_PASS")
    f.unique([row.get("resource_receipt_id") for row in seam], "DUPLICATE_SEAM_RESOURCE")
    f.unique([row.get("invocation_id") for row in seam], "DUPLICATE_SEAM_INVOCATION")
    controller_by_id = {row.get("receipt_id"): row for row in controller}
    seam_streak = 0
    for row in seam:
        computed_clean = not row.get("added_critical_or_major_ids") and row.get("material_revisions") == 0 and row.get("adequacy_gap_count") == 0
        f.need(row.get("clean") is computed_clean, f"SEAM_CLEAN:{row.get('pass_id')}")
        seam_streak = seam_streak + 1 if computed_clean else 0
        f.need(row.get("clean_streak_after") == seam_streak, f"SEAM_STREAK_DERIVATION:{row.get('pass_id')}")
        resource = controller_by_id.get(row.get("resource_receipt_id"), {})
        f.need(resource.get("invocation_id") == row.get("invocation_id") and resource.get("pass_id") == row.get("pass_id") and resource.get("activity_kind") == "cross_family_seam", f"SEAM_RESOURCE_BINDING:{row.get('pass_id')}")
    f.need({row.get("receipt_id") for row in controller} == {row.get("resource_receipt_id") for row in seam}, "SEAM_RESOURCE_POPULATION")
    two_clean = len(seam) >= 2 and all(row.get("clean") for row in seam[-2:]) and seam[-1].get("clean_streak_after") == 2
    invariance = obj.get("protected_invariance", {})
    f.need(source_snapshot.get("protected_before_sha256") == invariance.get("before_sha256"), "SOURCE_PROTECTED_BEFORE_BINDING")
    f.need(invariance.get("pass") is (invariance.get("before_sha256") == invariance.get("after_sha256")), "PROTECTED_INVARIANCE")
    gates = obj.get("gates", [])
    f.unique([row.get("gate_id") for row in gates], "DUPLICATE_GATE")
    f.need({row.get("gate_id") for row in gates} == {f"G{i}_{name}" for i, name in enumerate(("PROTOCOL_AND_AUTHORITY", "WHOLE_CORPUS_MAP", "NAMED_DENOMINATOR", "DISCOVERY_AND_ADEQUACY", "GRAPH_INTEGRITY", "REALIZATION_AND_CONTROLS", "FRONTIER_STABILITY", "TRIAL_REPORTING"))}, "GATE_POPULATION")
    calibration = obj.get("calibration_reporting", {})
    f.need(set(calibration.get("novel_signal_family_ids", [])) == {PILOTS[0], PILOTS[1], PILOTS[3]} and calibration.get("calibration_only_family_ids") == [PILOTS[2]] and calibration.get("accessibility_counted_in_discovery_efficacy") is False and calibration.get("accessibility_counted_in_scale_inference") is False, "CALIBRATION_AGGREGATION")
    if obj.get("terminal") == "READY_FOR_SCALE_DECISION":
        f.need(all(result.get("method_slice_status") == "METHOD_SLICE_READY" and result.get("terminal") == "METHOD_SLICE_READY" for result in results), "FAMILY_METHOD_STATUS")
        f.need(all(row.get("terminal") == "PASS" for row in gates), "CAMPAIGN_GATE_FAILURE")
        f.need(two_clean, "SEAM_NOT_STABLE")
        f.need(controller_telemetry_complete, "CONTROLLER_AFFORDABILITY_UNPROVEN")
        f.need(invariance.get("pass") is True, "INVARIANCE_FAILURE")
        f.need(not f.codes, "FALSE_READY")
    return f.codes


def node(node_id: str, node_type: str, payload: dict[str, Any]) -> dict[str, Any]:
    row = {"id": node_id, "node_type": node_type, "identity_basis": node_id, "revision": 1,
           "content_sha256": "", "lifecycle": "active", "source_refs": ["fixture"],
           "aliases": [], "payload": payload}
    row["content_sha256"] = node_content_hash(row)
    return row


def complete_summary_research_population(researches: list[dict[str, Any]], adequacies: list[dict[str, Any]]) -> bool:
    """Require four open portfolios plus exactly the controller-derived recovery set."""
    open_rows = [row for row in researches if row.get("portfolio_kind") == "open_discovery"]
    recovery_rows = [row for row in researches if row.get("portfolio_kind") == "failure_recovery"]
    open_families = [row.get("family_id") for row in open_rows]
    recovery_families = [row.get("family_id") for row in recovery_rows]
    required_recovery = {row.get("family_id") for row in adequacies if row.get("recovery", {}).get("required") is True}
    return (
        len(open_rows) == len(PILOTS)
        and set(open_families) == set(PILOTS)
        and len(set(open_families)) == len(open_families)
        and len(recovery_rows) == len(required_recovery)
        and set(recovery_families) == required_recovery
        and len(set(recovery_families)) == len(recovery_families)
        and len(researches) == len(open_rows) + len(recovery_rows)
    )


def minimal_fixtures() -> tuple[dict[str, Any], ...]:
    sha = lambda label: hashlib.sha256(label.encode()).hexdigest()
    markdown_bytes = b"A" * 10
    markdown_sha = hashlib.sha256(markdown_bytes).hexdigest()
    markdown_semantic_sha = markdown_section_semantic_hash(markdown_bytes, [])
    population = [
        {"path": "Plans/A.md", "artifact_role": "active_normative_prose", "semantic_authority": True, "bytes": 10, "mode": 420, "sha256": markdown_sha, "parser": "markdown", "classification_evidence": ["fixture"], "exclusion_reason": None},
        {"path": "Plans/B.json", "artifact_role": "active_machine_contract", "semantic_authority": True, "bytes": 2, "mode": 420, "sha256": sha("{}"), "parser": "json", "classification_evidence": ["fixture"], "exclusion_reason": None},
    ]
    pop_hash = identity_hash("structural-population", [{k: r[k] for k in ("path", "mode", "bytes", "sha256")} for r in population])
    assignments = [{"source_node_id": item, "capability_ids": [PILOTS[0]], "disposition": "assigned", "basis": ["fixture"]} for item in ("doc.A", "doc.B", "sec.A", "mach.B", "pu.1", "acc.1")]
    structural = {
        "schema_version": "1.0.0", "trial_id": "trial.fixture", "artifact_validator_sha256": sha("validator"),
        "claim_boundary": {"whole_corpus_structural_coverage": True, "whole_corpus_semantic_assurance": False, "semantic_pilot_family_ids": list(PILOTS)},
        "snapshot": {"snapshot_id": "snap.1", "plans_root": "Plans", "regular_file_count": 2, "directory_entry_count": 1, "population_algorithm": "sorted relative regular-file path, mode, byte-count, and SHA-256 rows; directories counted but not independently hashed", "population_sha256": pop_hash, "git_head": "0" * 40, "dirty_baseline_sha256": sha("dirty"), "created_at_utc": "2026-07-16T00:00:00Z"},
        "population": population,
        "documents": [
            {"document_id": "doc.A", "path": "Plans/A.md", "path_aliases": [], "artifact_role": "active_normative_prose", "semantic_authority": True, "sha256": markdown_sha, "title_or_schema_id": "A", "owner_refs": [], "lifecycle": "active"},
            {"document_id": "doc.B", "path": "Plans/B.json", "path_aliases": [], "artifact_role": "active_machine_contract", "semantic_authority": True, "sha256": sha("{}"), "title_or_schema_id": "B", "owner_refs": [], "lifecycle": "active"},
        ],
        "sections": [{"section_id": "sec.A", "document_id": "doc.A", "parent_section_id": None, "heading_or_pointer": "", "ordinal": 0, "range": {"start_byte": 0, "end_byte": 10, "start_line": 1, "end_line": 1}, "content_sha256": markdown_sha, "semantic_anchor_sha256": markdown_semantic_sha, "substantive": True, "authority": "owner", "plan_unit_ids": ["pu.1"]}],
        "machine_nodes": [{"machine_node_id": "mach.B", "document_id": "doc.B", "json_pointer": "", "parent_machine_node_id": None, "node_kind": "object", "content_sha256": identity_hash("machine-node-content", {}), "semantic_authority": True, "local_ref_targets": [], "capability_ids": [PILOTS[0]]}],
        "plan_units": [{"plan_unit_id": "pu.1", "section_id": "sec.A", "source_sha256": sha("pu"), "status": "accepted", "unit_type": "feature", "risk_class": "R3", "owner_doc_id": "doc.A", "depends_on": [], "unblocks": [], "acceptance_keys": ["acc.1"]}],
        "acceptance_units": [{"acceptance_key": "acc.1", "display_id": "A-1", "plan_unit_id": "pu.1", "criterion_ordinal": 1, "criterion_sha256": sha("acc"), "criterion_text": "works", "section_id": "sec.A", "aliases": [], "tombstoned": False}],
        "references": [], "owner_consumer_edges": [], "capability_assignments": assignments, "identity_aliases": [],
        "invalidation": {"prior_snapshot_id": None, "current_snapshot_id": "snap.1", "prior_population_sha256": None, "current_population_sha256": pop_hash, "changed_node_ids": [], "added_node_ids": [], "deleted_node_ids": [], "propagation_edges": [], "impacted_capability_ids": [], "impacted_seam_ids": [], "impacted_reference_ids": [], "cache_reuse_sha256s": [], "invalidation_closure_pass": True},
    }
    structural["completeness"] = {"validator_receipt_ref": "self", "validator_sha256": sha("validator"), "population_rows": 2, "unknown_paths": 0, "population_manifest_pass": True, "canonical_documents": 2, "mapped_canonical_documents": 2, "active_machine_contracts": 1, "mapped_active_machine_contracts": 1, "machine_nodes": 1, "mapped_machine_nodes": 1, "local_json_refs": 0, "unresolved_local_json_refs": 0, "substantive_sections": 1, "mapped_substantive_sections": 1, "section_gap_bytes": 0, "section_overlap_bytes": 0, "plan_units": 1, "mapped_plan_units": 1, "acceptance_units": 1, "mapped_acceptance_units": 1, "relevant_crossrefs": 0, "resolved_crossrefs": 0, "ambiguous_references": 0, "unresolved_references": 0, "excluded_paths": 0, "excluded_paths_with_reason": 0, "duplicate_ids": 0, "alias_cycles": 0, "owner_conflicts": 0, "unassigned_authoritative_nodes": 0, "reconstruction_pass": True, "primary_rebuild_root_sha256": sha("rebuild"), "clean_rebuild_root_sha256": sha("rebuild"), "deterministic_rebuild_pass": True, "invalidation_closure_pass": True, "terminal": "PASS", "terminal_derived_by_validator": True}

    actor = {"instance_id": "sil.actor.user", "kind": "actor", "canonical_key": "user", "canonical_label": "User", "instance_role": "named_instance", "lifecycle": "active", "owner": {"owner_doc": "Plans/A.md", "owner_plan_unit": "pu.1", "authority_class": "canonical_owner"}, "source_bindings": [{"ref": "Plans/A.md#pu.1", "content_sha256": markdown_sha, "semantic_sha256": sha("pu"), "authority_class": "canonical_owner"}], "parent_instance_ids": [], "capability_ids": [PILOTS[0]], "risk_tier": "R3", "applicability": "applicable", "kind_contract": {"actor_kind": "user"}, "template_coverage": None, "realization": {"identity": "bound", "semantics": "complete", "placement": "not_applicable", "wiring": "not_applicable", "automation": "not_applicable", "runtime_evidence": "not_applicable", "blockers": []}, "obligation_ids": ["obl-main"], "mutation_dependencies": []}
    actor["kind_contract"].update({"execution_role": "user", "authority_scope": "fixture"})
    members = ["sil.actor.user"]
    surface = {"schema_version": "1.0.0", "trial_id": "trial.fixture", "snapshot": {"structural_map_sha256": sha("structural"), "source_manifest_sha256": pop_hash, "artifact_validator_sha256": sha("validator"), "created_at_utc": "2026-07-16T00:00:00Z"}, "instances": [actor], "relations": [], "aliases": [], "denominator_sets": [{"set_id": "denom.actor", "capability_id": PILOTS[0], "kind": "actor", "member_instance_ids": members, "membership_sha256": identity_hash("surface-denominator-members", members), "excluded_rows": [], "frozen_before_scoring": True}], "invalidations": [], "summary": {"instance_count": 1, "active_named_instance_count": 1, "template_count": 0, "denominator_member_count": 1, "unresolved_identity_count": 0, "named_instances_closed_only_by_template_count": 0, "dangling_reference_count": 0, "unfrozen_denominator_count": 0, "terminal": "PASS"}}
    surface["candidate_inventory"] = [{"candidate_id": "cand.actor.user", "capability_id": PILOTS[0], "kind": "actor", "canonical_key": "user", "source_ref": "Plans/A.md#pu.1", "disposition": "included", "instance_id": "sil.actor.user", "exclusion_reason": None}]
    entry = copy.deepcopy(actor)
    entry.update({"instance_id": "sil.entry.main", "kind": "entrypoint", "canonical_key": "main", "canonical_label": "Main entry", "parent_instance_ids": ["sil.surface.main"], "kind_contract": {"parent_surface_id": "sil.surface.main", "route_or_trigger": "open", "actor_ids": ["sil.actor.user"], "preconditions": ["available"]}})
    screen = copy.deepcopy(actor)
    screen.update({"instance_id": "sil.surface.main", "kind": "surface", "canonical_key": "main", "canonical_label": "Main surface", "kind_contract": {"surface_type": "page", "parent_or_host": "root", "entry_routes": ["sil.entry.main"], "exit_routes": ["close"], "actor_ids": ["sil.actor.user"], "state_ids": ["ready"], "control_ids": ["none"], "platform_variants": ["desktop"]}})
    surface["instances"] = [actor, entry, screen]
    surface["candidate_inventory"].extend([
        {"candidate_id": "cand.entry.main", "capability_id": PILOTS[0], "kind": "entrypoint", "canonical_key": "main", "source_ref": "Plans/A.md#pu.1", "disposition": "included", "instance_id": "sil.entry.main", "exclusion_reason": None},
        {"candidate_id": "cand.surface.main", "capability_id": PILOTS[0], "kind": "surface", "canonical_key": "main", "source_ref": "Plans/A.md#pu.1", "disposition": "included", "instance_id": "sil.surface.main", "exclusion_reason": None},
    ])
    surface["denominator_sets"] = [
        {"set_id": "denom.actor", "capability_id": PILOTS[0], "kind": "actor", "member_instance_ids": ["sil.actor.user"], "membership_sha256": identity_hash("surface-denominator-members", ["sil.actor.user"]), "excluded_rows": [], "frozen_before_scoring": True},
        {"set_id": "denom.entry", "capability_id": PILOTS[0], "kind": "entrypoint", "member_instance_ids": ["sil.entry.main"], "membership_sha256": identity_hash("surface-denominator-members", ["sil.entry.main"]), "excluded_rows": [], "frozen_before_scoring": True},
        {"set_id": "denom.surface", "capability_id": PILOTS[0], "kind": "surface", "member_instance_ids": ["sil.surface.main"], "membership_sha256": identity_hash("surface-denominator-members", ["sil.surface.main"]), "excluded_rows": [], "frozen_before_scoring": True},
    ]
    surface["relations"] = [{"relation_id": "rel.contains", "from_instance_id": "sil.surface.main", "to_instance_id": "sil.entry.main", "relation_type": "contains", "source_ref": "Plans/A.md#pu.1"}]
    surface["summary"].update({"instance_count": 3, "active_named_instance_count": 3, "denominator_member_count": 3})
    extra_surface_specs = (
        ("sil.journey.main", "journey", "journey-main"),
        ("sil.control.main", "control", "control-main"),
        ("sil.command.main", "command", "command-main"),
        ("sil.state.ready", "state", "state-ready"),
        ("sil.state.unknown", "state", "state-unknown"),
        ("sil.event.changed", "event_type", "event-changed"),
        ("sil.data.main", "data_store", "data-main"),
    )
    for instance_id, kind, canonical_key in extra_surface_specs:
        row = copy.deepcopy(actor)
        row.update({"instance_id": instance_id, "kind": kind, "canonical_key": canonical_key, "canonical_label": canonical_key, "parent_instance_ids": [], "kind_contract": {key: "fixture" for key in KIND_REQUIRED[kind]}})
        surface["instances"].append(row)
        surface["candidate_inventory"].append({"candidate_id": f"cand.{canonical_key}", "capability_id": PILOTS[0], "kind": kind, "canonical_key": canonical_key, "source_ref": "Plans/A.md#pu.1", "disposition": "included", "instance_id": instance_id, "exclusion_reason": None})
        existing_denominator = next((item for item in surface["denominator_sets"] if item["capability_id"] == PILOTS[0] and item["kind"] == kind), None)
        if existing_denominator is None:
            surface["denominator_sets"].append({"set_id": f"denom.{kind}", "capability_id": PILOTS[0], "kind": kind, "member_instance_ids": [instance_id], "membership_sha256": identity_hash("surface-denominator-members", [instance_id]), "excluded_rows": [], "frozen_before_scoring": True})
        else:
            existing_denominator["member_instance_ids"].append(instance_id)
            existing_denominator["member_instance_ids"].sort()
            existing_denominator["membership_sha256"] = identity_hash("surface-denominator-members", existing_denominator["member_instance_ids"])
    surface["summary"].update({"instance_count": 10, "active_named_instance_count": 10, "denominator_member_count": 10})
    fixture_surface_ids = sorted(row["instance_id"] for row in surface["instances"])

    research = {
        "schema_version": "1.0.0", "schema_id": "pm.plan_assurance.research_portfolio.v1", "portfolio_id": "research.fixture",
        "portfolio_kind": "open_discovery", "trial_id": "trial.fixture", "family_id": PILOTS[0], "generation_id": "generation.fixture",
        "worker_context_id": "ctx.research", "expectation_packet_sha256": sha("expectation"), "surface_ledger_sha256": sha("surface"),
        "detailed_plan_assertions_withheld_until_lock": True,
        "operation_receipts": [
            {"operation_id": "op.search", "worker_context_id": "ctx.research", "operation_kind": "search", "tool_id": "web.search", "request_sha256": sha("search request"), "response_sha256": sha("search response"), "capture_ref": "families/USAGE_ACCOUNTING_TRUTH/ops/search.json", "capture_sha256": sha("search capture"), "query_or_url_identity_sha256": sha("query"), "url": None, "started_at_utc": "2026-07-16T00:00:00Z", "finished_at_utc": "2026-07-16T00:00:01Z", "terminal": "PASS", "failure_reason": None, "source_card_ids": []},
            {"operation_id": "op.open", "worker_context_id": "ctx.research", "operation_kind": "open", "tool_id": "web.open", "request_sha256": sha("open request"), "response_sha256": sha("open response"), "capture_ref": "families/USAGE_ACCOUNTING_TRUTH/ops/open.json", "capture_sha256": sha("open capture"), "query_or_url_identity_sha256": sha("https://example.test/issue"), "url": "https://example.test/issue", "started_at_utc": "2026-07-16T00:00:01Z", "finished_at_utc": "2026-07-16T00:00:02Z", "terminal": "PASS", "failure_reason": None, "source_card_ids": ["card.issue", "card.official", "card.comparator"]},
        ],
        "source_cards": [
            {"source_card_id": "card.issue", "source_identity_sha256": sha("source identity"), "url": "https://example.test/issue", "title": "Issue evidence", "publisher_or_author": "Example", "source_class": "issue_failure", "independence_family": "example.test", "evidence_roles": ["failure_existence"], "operation_receipt_ids": ["op.open"], "named_surface_ids": fixture_surface_ids, "bounded_claim": "A relevant failure occurred", "locator": "issue body", "entailment": "direct", "authority_fitness": "fit", "applicability": "applicable", "currentness": "current", "content_sha256": sha("source content"), "limitations": [], "proposed_disposition": "adapt"},
            {"source_card_id": "card.official", "source_identity_sha256": sha("official identity"), "url": "https://example.test/issue", "title": "Official constraint", "publisher_or_author": "Example", "source_class": "official", "independence_family": "example.test", "evidence_roles": ["normative_constraint", "applicability"], "operation_receipt_ids": ["op.open"], "named_surface_ids": fixture_surface_ids, "bounded_claim": "The constraint is current", "locator": "constraint", "entailment": "direct", "authority_fitness": "fit", "applicability": "applicable", "currentness": "current", "content_sha256": sha("official content"), "limitations": [], "proposed_disposition": "adopt"},
            {"source_card_id": "card.comparator", "source_identity_sha256": sha("comparator identity"), "url": "https://example.test/issue", "title": "Comparator behavior", "publisher_or_author": "Example", "source_class": "direct_comparator", "independence_family": "example.test", "evidence_roles": ["comparator_behavior"], "operation_receipt_ids": ["op.open"], "named_surface_ids": fixture_surface_ids, "bounded_claim": "A comparator informs the problem model", "locator": "comparison", "entailment": "direct", "authority_fitness": "limited", "applicability": "applicable", "currentness": "current", "content_sha256": sha("comparator content"), "limitations": [], "proposed_disposition": "adapt"}
        ],
        "creative_exploration": {"outcome": "material_findings", "rows": [{"creative_id": "creative.1", "kind": "failure_lesson", "statement": "Preserve the failure boundary", "source_card_ids": ["card.issue"], "outcome_or_risk_link": "risk-main", "disposition": "adapt", "rationale": "Relevant incident"}], "no_material_findings_rationale": None, "followed_material_surprises": True, "unresolved_surprise_refs": []},
        "research_failures": [], "unsearched_areas": [], "created_at_utc": "2026-07-16T00:00:00Z", "locked_at_utc": "2026-07-16T00:00:02Z", "terminal": "DONE",
    }
    capture_payloads: dict[str, dict[str, Any]] = {}
    raw_exchange = {
        "op.search": (b"search request", b"search response"),
        "op.open": (b"open request", b"A relevant failure occurred\nThe constraint is current\nA comparator informs the problem model"),
    }
    open_response = raw_exchange["op.open"][1]
    for card in research["source_cards"]:
        claim_bytes = card["bounded_claim"].encode("utf-8")
        start = open_response.index(claim_bytes)
        end = start + len(claim_bytes)
        card.update({
            "claim_key": card["source_card_id"],
            "relation": "supports",
            "evidence_capture_ref": "families/USAGE_ACCOUNTING_TRUTH/ops/open.json",
            "response_sha256": hashlib.sha256(open_response).hexdigest(),
            "evidence_start_byte": start,
            "evidence_end_byte": end,
            "evidence_slice_sha256": hashlib.sha256(claim_bytes).hexdigest(),
            "locator": f"bytes:{start}-{end}",
            "content_sha256": hashlib.sha256(claim_bytes).hexdigest(),
            "source_identity_sha256": identity_hash("research-source-identity", {key: card.get(key) for key in ("url", "publisher_or_author", "source_class", "independence_family")}),
        })
    for operation in research["operation_receipts"]:
        raw_request, raw_response = raw_exchange[operation["operation_id"]]
        operation["request_sha256"] = hashlib.sha256(raw_request).hexdigest()
        operation["response_sha256"] = hashlib.sha256(raw_response).hexdigest()
        capture = {
            "schema_version": "1.0.0",
            "schema_id": "pm.plan_assurance.research_operation_capture.v1",
            "capture_ref": operation["capture_ref"],
            "operation_id": operation["operation_id"],
            "worker_context_id": operation["worker_context_id"],
            "operation_kind": operation["operation_kind"],
            "tool_id": operation["tool_id"],
            "request": encoded_blob(raw_request),
            "response": encoded_blob(raw_response),
            "started_at_utc": operation["started_at_utc"],
            "finished_at_utc": operation["finished_at_utc"],
            "terminal": operation["terminal"],
            "source_card_ids": operation["source_card_ids"],
        }
        capture["capture_payload_sha256"] = research_capture_hash(capture)
        operation["capture_sha256"] = artifact_hash("research-operation-capture", capture)
        capture_payloads[operation["capture_ref"]] = capture
    research["portfolio_payload_sha256"] = research_portfolio_hash(research)
    trigger_rows = [{"trigger_id": trigger_id, "state": "false", "evidence_refs": ["card.issue", "card.official", "card.comparator"], "affected_ids": ["obl-main"], "rationale": "Evidence evaluated", "controller_derived": True} for trigger_id in sorted(RESEARCH_TRIGGERS)]
    adequacy = {"schema_version": "1.0.0", "schema_id": "pm.plan_assurance.research_adequacy_receipt.v1", "receipt_id": "adequacy.fixture", "trial_id": "trial.fixture", "family_id": PILOTS[0], "generation_id": "generation.fixture", "risk_tier": "R3", "open_portfolio_ref": "families/USAGE_ACCOUNTING_TRUTH/RESEARCH_PORTFOLIO.json", "open_portfolio_sha256": artifact_hash("research-portfolio", research), "trigger_evaluations": trigger_rows, "recovery": {"required": False, "reason_trigger_ids": [], "worker_context_id": None, "worker_terminal": None, "failure_portfolio_ref": None, "failure_portfolio_sha256": None, "remaining_gap_ids": [], "unavailable_reason": None}, "unresolved_adequacy_gap_ids": [], "final_state": "sufficient", "limitations": [], "controller_derived": True, "terminal": "PASS"}
    adequacy["receipt_payload_sha256"] = research_adequacy_hash(adequacy)
    control_definitions = []
    brief_rows = frozen_control_brief_rows()
    for family, required_rows in REQUIRED_CONTROLS.items():
        for control_id, control_kind in required_rows.items():
            brief = brief_rows[control_id]
            definition = {"control_id": control_id, "family_id": family, "control_kind": control_kind, "origin": "common_visible_brief", "requirement_text": brief["requirement_text"], "requirement_sha256": brief["requirement_sha256"], "source_refs": [brief["source_ref"]], "identity_status": "resolved" if family == PILOTS[0] else "unresolved", "expected_instance_ids": ["sil.actor.user"] if family == PILOTS[0] else [], "unresolved_identity_selectors": [] if family == PILOTS[0] else [f"selector:{control_id}"], "applicability": "required"}
            definition["definition_sha256"] = control_definition_hash(definition)
            control_definitions.append(definition)
    registry = {"schema_version": "1.0.0", "schema_id": "pm.plan_assurance.required_control_registry.v1", "trial_id": "trial.fixture", "surface_ledger_sha256": sha("surface"), "pilot_briefs_sha256": hashlib.sha256((ROOT / "PILOT_FAMILY_BRIEFS.md").read_bytes()).hexdigest(), "frozen_before_plan_comparison": True, "controls": control_definitions}
    registry["registry_sha256"] = control_registry_hash(registry)
    issue_card = next(row for row in research["source_cards"] if row["source_card_id"] == "card.issue")

    nodes = [
        node("cap-main", "Capability", {"outcome": "safe result", "risk_record_ids": ["risk-main"], "non_goal_ids": []}),
        node("risk-main", "RiskRecord", {"severity": "critical", "dimensions": ["truth"], "assurance_depth": "R3"}),
        node("auth-main", "AuthorityRecord", {"kind": "owner", "scope": "capability", "may_impose_mandatory_semantics": True}),
        node("src-main", "SourceRecord", {"source_class": "issue_failure", "uri_or_ref": issue_card["url"], "locator": issue_card["locator"], "portfolio_id": "research.fixture", "source_card_id": "card.issue", "source_card_content_sha256": issue_card["content_sha256"], "operation_receipt_ids": ["op.open"], "currentness": "current", "applicability": "applicable", "authority_fitness": "fit", "limitations": []}),
        node("eva-main", "EvidenceAssertion", {"statement": "A relevant failure occurred", "source_record_id": "src-main", "relation": "supports", "entailment_strength": "direct", "authority_fitness": "fit", "applicability": "applicable", "limitations": []}),
        node("clm-main", "ClaimAtom", {"statement": "must work", "origin_class": "intent", "claim_kind": "normative", "applicability_predicate": "always", "authority_request": "owner", "uncertainty_refs": []}),
        node("obl-main", "Obligation", {"subject_ids": ["cap-main"], "predicate_key": "works", "object_scope": "all", "modality": "must", "applicability": "applicable", "risk_refs": ["risk-main"], "authority_refs": ["auth-main"], "evidence_required": True, "requires_named_realization": True, "builder_discretion_boundary": "implementation only", "disposition": "specified", "residual_uncertainty_refs": []}),
        node("surf-actor", "SurfaceInstance", {"ledger_instance_id": "sil.actor.user", "instance_role": "named_instance"}),
        node("surf-journey", "SurfaceInstance", {"ledger_instance_id": "sil.journey.main", "instance_role": "named_instance"}),
        node("surf-entry", "SurfaceInstance", {"ledger_instance_id": "sil.entry.main", "instance_role": "named_instance"}),
        node("surf-screen", "SurfaceInstance", {"ledger_instance_id": "sil.surface.main", "instance_role": "named_instance"}),
        node("surf-control", "SurfaceInstance", {"ledger_instance_id": "sil.control.main", "instance_role": "named_instance"}),
        node("surf-command", "SurfaceInstance", {"ledger_instance_id": "sil.command.main", "instance_role": "named_instance"}),
        node("surf-state", "SurfaceInstance", {"ledger_instance_id": "sil.state.ready", "instance_role": "named_instance"}),
        node("surf-state-unknown", "SurfaceInstance", {"ledger_instance_id": "sil.state.unknown", "instance_role": "named_instance"}),
        node("surf-event", "SurfaceInstance", {"ledger_instance_id": "sil.event.changed", "instance_role": "named_instance"}),
        node("surf-data", "SurfaceInstance", {"ledger_instance_id": "sil.data.main", "instance_role": "named_instance"}),
        node("scn-main", "NamedScenario", {
            "scenario_class": "control_contract", "origin": "common_visible_control", "frozen_before_plan_comparison": True,
            "control_registry_ids": sorted(REQUIRED_CONTROLS[PILOTS[0]]),
            "instance_axes": {"actor": ["surf-actor"], "journey": ["surf-journey"], "entrypoint": ["surf-entry"], "surface": ["surf-screen"], "control": ["surf-control"], "command": ["surf-command"], "state": ["surf-state", "surf-state-unknown"], "event_type": ["surf-event"], "data_store": ["surf-data"]},
            "initial_state_ids": ["surf-state"],
            "steps": [{"step_id": "step.1", "ordinal": 1, "actor_id": "surf-actor", "command_id": "surf-command", "from_state_ids": ["surf-state"], "to_state_ids": ["surf-state"], "read_data_ids": ["surf-data"], "write_data_ids": ["surf-data"], "emitted_event_ids": ["surf-event"], "permission_outcome": "allowed", "expected_observation": "works"}],
            "transition_rules": {"allowed": ["surf-state->surf-state"], "forbidden": ["surf-state-unknown->surf-state"]},
            "operational_conditions": {"concurrency": "single authoritative transition", "retry": "idempotent", "restart": "resume from recorded state", "cancellation": "preserve prior state"},
            "authority_permission": {"authority_refs": ["auth-main"], "permission_predicates": ["authorized actor"], "denial_behavior": "fail closed"},
            "failure_cases": [{"failure_id": "failure.1", "trigger": "dependency failure", "recovery_step_ids": ["step.1"], "terminal_state_id": "surf-state", "preserved_invariants": ["truth"], "restart_behavior": "deterministic"}],
            "consumer_truth": {"authoritative_state_rule": "show authoritative state", "unknown_partial_stale_rule": "preserve uncertainty", "forbidden_representation": "never coerce unknown"},
            "observability": {"event_ids": ["surf-event"], "currentness_rule": "receipt-bound", "receipt_or_signal": "event receipt", "failure_visibility": "visible"},
            "environment_tuple_refs": ["env.fixture"], "obligation_ids": ["obl-main"], "oracle_refs": ["val-main"],
            "builder_discretion": {"fixed_semantics": [f"control:{row['control_id']}:{row['requirement_sha256']}" for row in registry["controls"] if row["family_id"] == PILOTS[0]], "delegated_details": ["internal structure"], "forbidden_builder_choices": ["semantic drift"]}
        }),
        node("val-main", "ValidationContract", {"kind": "plan_static", "verification_stage": "plan", "oracle": "specified", "evidence_status": "specified"}),
        node("anchor-main", "PlanAnchor", {"document_ref": "Plans/A.md", "node_ref": "pu.1", "content_sha256": markdown_sha}),
    ]
    edges = [
        {"edge_id": "edge-evidence", "edge_type": "supports_claim", "from_id": "eva-main", "to_id": "clm-main", "state": "confirmed", "scope": "all", "authority_refs": [], "evidence_refs": ["eva-main"], "currentness": "current"},
        {"edge_id": "edge-claim", "edge_type": "supports_obligation", "from_id": "clm-main", "to_id": "obl-main", "state": "confirmed", "scope": "all", "authority_refs": ["auth-main"], "evidence_refs": ["eva-main"], "currentness": "current"},
        {"edge_id": "edge-scenario", "edge_type": "realized_by_scenario", "from_id": "obl-main", "to_id": "scn-main", "state": "confirmed", "scope": "all", "authority_refs": [], "evidence_refs": [], "currentness": "current"},
        {"edge_id": "edge-validation", "edge_type": "validated_by", "from_id": "obl-main", "to_id": "val-main", "state": "confirmed", "scope": "all", "authority_refs": [], "evidence_refs": [], "currentness": "current"},
        {"edge_id": "edge-scenario-validation", "edge_type": "validated_by", "from_id": "scn-main", "to_id": "val-main", "state": "confirmed", "scope": "all", "authority_refs": [], "evidence_refs": [], "currentness": "current"},
        {"edge_id": "edge-authority", "edge_type": "authorized_by", "from_id": "obl-main", "to_id": "auth-main", "state": "confirmed", "scope": "all", "authority_refs": ["auth-main"], "evidence_refs": [], "currentness": "current"},
        {"edge_id": "edge-anchor", "edge_type": "materialized_at", "from_id": "obl-main", "to_id": "anchor-main", "state": "confirmed", "scope": "all", "authority_refs": [], "evidence_refs": [], "currentness": "current"},
    ]
    closure = {"assessment_id": "close-main", "obligation_id": "obl-main", "semantic_state": "complete", "evidence_state": "adequate", "applicability_state": "applicable", "authority_state": "authorized", "confidence": "high", "instance_realization": "complete", "consumer_propagation": "not_applicable", "validation_contract": "specified", "uncertainty_state": "none", "disposition": "specified", "claim_basis_ids": ["clm-main"], "evidence_basis_ids": ["eva-main"], "authority_basis_ids": ["auth-main"], "decision_basis_ids": [], "risk_basis_ids": ["risk-main"], "scenario_basis_ids": ["scn-main"], "consumer_basis_ids": [], "validation_basis_ids": ["val-main"], "plan_anchor_ids": ["anchor-main"], "reopen_conditions": [], "controller_derived": True}
    environment_tuple = {"environment_tuple_id": "env.fixture", "platform": "fixture-platform", "connectivity": "online", "dependency_condition": "available", "scale_condition": "single"}
    environment_tuple["tuple_sha256"] = identity_hash("environment-tuple", environment_tuple)
    graph = {"schema_version": "1.0.0", "graph_id": "graph.fixture", "trial_id": "trial.fixture", "capability_id": PILOTS[0], "graph_revision": 1, "bindings": {"structural_map_sha256": sha("structural"), "surface_ledger_sha256": sha("surface"), "risk_profile_sha256": sha("risk"), "research_portfolio_ref": "families/USAGE_ACCOUNTING_TRUTH/RESEARCH_PORTFOLIO.json", "research_portfolio_sha256": artifact_hash("research-portfolio", research), "research_adequacy_ref": "families/USAGE_ACCOUNTING_TRUTH/RESEARCH_ADEQUACY_RECEIPT.json", "research_adequacy_sha256": artifact_hash("research-adequacy", adequacy), "artifact_validator_sha256": sha("validator"), "denominator_frozen_before_plan_comparison": True}, "environment_tuples": [environment_tuple], "nodes": nodes, "edges": edges, "stage_transition_receipts": [{"receipt_id": "stage.1", "stage_id": "adjudication", "input_ids": ["clm-main"], "output_ids": ["obl-main"], "split_map": {}, "merge_map": {}, "carry_forward_ids": [], "dispositioned_ids": ["clm-main"], "unaccounted_input_ids": [], "input_sha256": sha("in"), "output_sha256": sha("out")}], "loss_attributions": [], "closure_assessments": [closure], "retrieval_diagnostics_ref": None, "integrity": {"unique_node_ids": True, "unique_edge_ids": True, "dangling_refs": 0, "active_claims_without_disposition_edges": 0, "dependency_cycles": 0, "exact_source_edges_in_closure": 0, "workers_self_certified": False, "terminal": "PASS"}}
    closure["closure_fingerprint_sha256"] = closure_hash(closure, {row["id"]: row for row in nodes}, graph["bindings"])
    graph["semantic_graph_sha256"] = graph_hash(graph)
    weights = {"critical": 5, "major": 3, "moderate": 2, "minor": 1}
    weighted = lambda credit: {"earned_weight": 5.0 * credit, "possible_weight": 5.0, "ratio": credit, "weights": weights, "severity_strata": {"critical": {"earned": 5.0 * credit, "possible": 5.0}}, "partial_credit": 0.5, "exact_source_identity_used": False, "raw_uncovered_ids": [] if credit == 1 else ["obl-main"]}
    fraction = lambda n, d, ids: {"numerator": n, "denominator": d, "ratio": None if d == 0 else n / d, "zero_denominator_rule": "not_applicable" if d == 0 else "invalid_metric", "numerator_ids": ids[:n], "denominator_ids": ids[:d]}
    challenge_artifact = {"schema_version": "1.0.0", "schema_id": "pm.plan_assurance.fresh_challenge_receipt.v1", "challenge_id": "challenge.fixture", "trial_id": "trial.fixture", "target_family_id": PILOTS[0], "challenger_family_id": PILOTS[3], "challenger_context_id": "ctx.migration.local", "target_graph_sha256": graph["semantic_graph_sha256"], "target_control_registry_sha256": artifact_hash("control-registry", registry), "target_locks_ref": f"families/{PILOTS[0]}/TARGET_LOCK_SET.json", "target_locks_sha256": sha("target locks"), "challenge_resource_receipt_id": "res.challenge.migration", "challenge_resource_receipt_sha256": sha("challenge resource"), "covered_obligation_ids": ["obl-main"], "covered_instance_ids": sorted(row["instance_id"] for row in surface["instances"]), "covered_control_ids": sorted(REQUIRED_CONTROLS[PILOTS[0]]), "findings": [], "all_findings_dispositioned": True, "started_at_utc": "2026-07-16T00:00:02Z", "finished_at_utc": "2026-07-16T00:00:03Z", "terminal": "DONE"}
    challenge_artifact["receipt_payload_sha256"] = challenge_receipt_hash(challenge_artifact)
    component_evidence = {
        "identity": ["surf-actor"], "actors_entrypoints": ["scn-main"], "surface_consumer": ["scn-main"],
        "lifecycle": ["scn-main"], "authority": ["auth-main"], "failure_recovery": ["scn-main"],
        "persistence": ["scn-main"], "accessibility_user_truth": ["scn-main"], "wiring": ["scn-main"],
        "observability_currentness": ["scn-main"], "oracle": ["val-main"], "discretion": ["scn-main"],
    }
    component_full = {key: {"applicability": "applicable", "status": "full", "evidence_refs": component_evidence[key], "gap_refs": []} for key in CONTROL_COMPONENTS}
    family_control_definitions = [row for row in registry["controls"] if row["family_id"] == PILOTS[0]]
    control_results = [{"control_id": row["control_id"], "registry_definition_sha256": row["definition_sha256"], "control_kind": row["control_kind"], "answerability": "answerable", "instance_ids": list(row["expected_instance_ids"]), "unresolved_identity_selectors": [], "scenario_ids": ["scn-main"], "obligation_ids": ["obl-main"], "components": copy.deepcopy(component_full), "overlaps_obligation_ids": [], "terminal": "PASS"} for row in family_control_definitions]
    portfolio_ref = "families/USAGE_ACCOUNTING_TRUTH/RESEARCH_PORTFOLIO.json"
    adequacy_ref = "families/USAGE_ACCOUNTING_TRUTH/RESEARCH_ADEQUACY_RECEIPT.json"
    registry_ref = "shared/REQUIRED_CONTROL_REGISTRY.json"
    challenge_ref = "families/USAGE_ACCOUNTING_TRUTH/FRESH_CHALLENGE_RECEIPT.json"
    local_ref = "families/USAGE_ACCOUNTING_TRUTH/LOCAL_EXPECTATIONS.json"
    local_lock_ref = "families/USAGE_ACCOUNTING_TRUTH/LOCAL_EXPECTATIONS_LOCK.json"
    claims_ref = "families/USAGE_ACCOUNTING_TRUTH/DISCOVERY_CLAIMS.json"
    discovery_lock_ref = "families/USAGE_ACCOUNTING_TRUTH/DISCOVERY_LOCK.json"
    def binding(artifact_type: str, ref: str, digest: str, schema_id: str, context: str) -> dict[str, Any]:
        return {"artifact_type": artifact_type, "ref": ref, "sha256": digest, "schema_id": schema_id, "producer_context_id": context, "family_id": PILOTS[0], "trial_id": "trial.fixture", "generation_id": "generation.fixture", "canonical_bytes": True}
    workers = [
        {"worker_role": "LOCAL_EXPECTATION_MODELER", "context_id": "ctx.local", "terminal": "DONE", "artifact_bindings": [binding("LOCAL_EXPECTATIONS", local_ref, sha("local"), "pm.plan_assurance.local_expectations.v1", "ctx.local"), binding("LOCAL_EXPECTATIONS_LOCK", local_lock_ref, sha("local lock"), "pm.plan_assurance.lock.v1", "ctx.local")]},
        {"worker_role": "OPEN_DISCOVERY_RESEARCHER", "context_id": "ctx.research", "terminal": "DONE", "artifact_bindings": [binding("RESEARCH_PORTFOLIO_OPEN", portfolio_ref, artifact_hash("research-portfolio", research), research["schema_id"], "ctx.research"), binding("DISCOVERY_CLAIMS", claims_ref, sha("claims"), "pm.plan_assurance.discovery_claims.v1", "ctx.research"), binding("DISCOVERY_LOCK", discovery_lock_ref, sha("discovery lock"), "pm.plan_assurance.lock.v1", "ctx.research"), binding("RESEARCH_ADEQUACY_RECEIPT", adequacy_ref, artifact_hash("research-adequacy", adequacy), adequacy["schema_id"], "ctx.research")]},
    ]
    resource_local = {"receipt_id": "res.1", "context_id": "ctx.local", "worker_role": "LOCAL_EXPECTATION_MODELER", "operation_receipt_ids": [], "attempt_ordinal": 1, "retry_kind": "none", "prior_attempt_receipt_id": None, "role_id": "worker", "stage_id": "discovery", "pass_id": "p1", "requested_model": "test", "effective_model": "test", "input_tokens": 100, "cached_input_tokens": 10, "input_includes_cached": True, "visible_output_tokens": 20, "reasoning_output_tokens": 5, "output_includes_reasoning": False, "native_total_tokens": None, "derived_total_tokens": 125, "effective_total_tokens": 125, "effective_total_source": "derived_exact", "raw_bytes": 100, "searches": 0, "opens": 0, "queue_ms": 0, "active_ms": 10, "wall_ms": 1000, "started_at_utc": "2026-07-16T00:00:00Z", "finished_at_utc": "2026-07-16T00:00:01Z", "retries": 0, "failure_class": None}
    resource_local.update({"invocation_id": "invoke.local.p0", "activity_kind": "local_expectation", "target_family_id": None, "challenge_id": None, "role_id": "LOCAL_EXPECTATION_MODELER", "stage_id": "S3_INDEPENDENT_DISCOVERY", "pass_id": "p0"})
    resource_local["activity_binding_sha256"] = resource_activity_binding(resource_local)
    resource_research = copy.deepcopy(resource_local)
    resource_research.update({"receipt_id": "res.2", "context_id": "ctx.research", "worker_role": "OPEN_DISCOVERY_RESEARCHER", "invocation_id": "invoke.research.p0", "activity_kind": "open_discovery", "operation_receipt_ids": ["op.search", "op.open"], "role_id": "OPEN_DISCOVERY_RESEARCHER", "stage_id": "S3_INDEPENDENT_DISCOVERY", "searches": 1, "opens": 1})
    resource_research["activity_binding_sha256"] = resource_activity_binding(resource_research)
    resource_followup_1 = copy.deepcopy(resource_local)
    resource_followup_1.update({"receipt_id": "res.3", "invocation_id": "invoke.closure.p1", "activity_kind": "targeted_closure", "role_id": "TARGETED_CLOSURE", "stage_id": "S7_TARGETED_CLOSURE", "pass_id": "p1", "input_tokens": 5, "cached_input_tokens": 0, "visible_output_tokens": 5, "reasoning_output_tokens": 0, "derived_total_tokens": 10, "effective_total_tokens": 10, "active_ms": 5, "wall_ms": 1000, "started_at_utc": "2026-07-16T00:00:01Z", "finished_at_utc": "2026-07-16T00:00:02Z"})
    resource_followup_1["activity_binding_sha256"] = resource_activity_binding(resource_followup_1)
    resource_followup_2 = copy.deepcopy(resource_followup_1)
    resource_followup_2.update({"receipt_id": "res.4", "invocation_id": "invoke.closure.p2", "pass_id": "p2", "started_at_utc": "2026-07-16T00:00:02Z", "finished_at_utc": "2026-07-16T00:00:03Z"})
    resource_followup_2["activity_binding_sha256"] = resource_activity_binding(resource_followup_2)
    gates = [{"gate_id": gid, "scope": "method" if gid.startswith("G") else "plan_slice", "hard": True, "terminal": "PASS", "evidence_refs": ([portfolio_ref, adequacy_ref] if gid == "G3_DISCOVERY_AND_ADEQUACY" else ([registry_ref, challenge_ref] if gid == "G5_REALIZATION_AND_CONTROLS" else [local_ref]))} for gid in sorted(METHOD_GATES | PLAN_GATES)]
    inputs = {"structural_slice_sha256": sha("structural"), "surface_denominator_sha256": sha("surface"), "obligation_graph_sha256": artifact_hash("obligation-graph", graph), "controls_sha256": artifact_hash("control-registry", registry), "control_registry_ref": registry_ref, "control_registry_sha256": artifact_hash("control-registry", registry), "research_portfolio_ref": portfolio_ref, "research_portfolio_sha256": artifact_hash("research-portfolio", research), "research_adequacy_ref": adequacy_ref, "research_adequacy_sha256": artifact_hash("research-adequacy", adequacy), "fresh_challenge_ref": challenge_ref, "fresh_challenge_sha256": artifact_hash("challenge-receipt", challenge_artifact), "artifact_validator_sha256": sha("validator")}
    result = {"schema_version": "1.0.0", "trial_id": "trial.fixture", "family_id": PILOTS[0], "pilot_mode": "novel_method_signal", "discovery_efficacy_eligible": True, "scale_inference_eligible": True, "risk_tier": "R3", "input_bindings": inputs, "method_slice_status": "METHOD_SLICE_READY", "plan_slice_status": "PLAN_SLICE_READY_WITHIN_ENVELOPE", "worker_receipts": workers, "fresh_challenge_receipt": {"target_family_id": PILOTS[0], "challenger_family_id": PILOTS[3], "challenger_context_id": "ctx.migration.local", "target_graph_sha256": graph["semantic_graph_sha256"], "finding_ids": [], "all_findings_dispositioned": True, "terminal": "DONE"}, "obligation_metric_rows": [{"obligation_id": "obl-main", "severity": "critical", "applicable": True, "semantic_credit": 1, "evidence_required": True, "evidence_credit": 1, "requires_named_realization": True, "realization_credit": 1, "disposition": "specified", "is_gap": False}], "metrics": {"bounded_semantic_coverage": weighted(1), "evidence_sufficiency": weighted(1), "exact_source_retrieval_diagnostic": {"applicable": False, "retrieved": None, "target": None, "ratio": None, "equivalent_claims": [], "diagnostic_only": True, "semantic_weight": 0}, "claim_precision": fraction(1, 1, ["clm-main"]), "authority_safety": {"mandatory_claims_correctly_authorized": 1, "mandatory_claims": 1, "ratio": 1, "classification_accuracy": fraction(1, 1, ["clm-main"]), "unsafe_promotions": 0, "false_critical_blockers": 0, "contradicted_mandatory_claims": 0}, "named_scenario_realization": weighted(1), "disposition_completeness": fraction(0, 0, []), "control_summary": {"positive_pass": 6, "positive_total": 6, "negative_pass": 2, "negative_total": 2, "unanswerable": 0, "overlap_flagged": 0}, "grounded_novelty": {"count": 0, "critical_or_major_count": 0, "adopted": 0, "conditional": 0, "rejected": 0, "readiness_bonus": 0}, "critical_miss_summary": {"count": 0, "weight": 0, "ids": []}, "cost_latency": {"native_tokens_observable": False, "all_reported_tokens": 250, "effective_total_source": "derived_exact", "input_includes_cached": True, "searches": 1, "opens": 1, "active_ms": 20, "wall_ms": 1000, "dollars": None, "dollar_null_reason": "not observable", "within_fuse": True}}, "stage_losses": [], "passes": [{"pass_id": "p0", "pass_kind": "initial_union", "opening_weight": 5, "added_critical_or_major_ids": ["obl-main"], "material_revisions": 1, "closed_weight": 5, "remaining_weight": 0, "adequacy_gap_count": 0, "clean": False, "clean_streak_after": 0, "all_reported_tokens": 100, "active_ms": 5}, {"pass_id": "p1", "pass_kind": "targeted_closure", "opening_weight": 0, "added_critical_or_major_ids": [], "material_revisions": 0, "closed_weight": 0, "remaining_weight": 0, "adequacy_gap_count": 0, "clean": True, "clean_streak_after": 1, "all_reported_tokens": 75, "active_ms": 3}, {"pass_id": "p2", "pass_kind": "targeted_closure", "opening_weight": 0, "added_critical_or_major_ids": [], "material_revisions": 0, "closed_weight": 0, "remaining_weight": 0, "adequacy_gap_count": 0, "clean": True, "clean_streak_after": 2, "all_reported_tokens": 75, "active_ms": 2}], "controls": control_results, "critical_misses": [], "novelty": [], "resource_receipts": [resource_local, resource_research], "family_accounting": {"started_at_utc": "2026-07-16T00:00:00Z", "finished_at_utc": "2026-07-16T00:00:01Z", "elapsed_ms": 1000, "input_tokens": 200, "output_tokens": 50, "all_reported_tokens": 250, "semantic_contexts": 2, "infrastructure_retries": 0, "searches": 1, "opens": 1, "artifact_files": 1, "artifact_bytes": 100, "largest_artifact_bytes": 100, "targeted_followups": 0, "closure_cycles": 2}, "gates": gates, "limitations": ["fixture"], "terminal": "METHOD_SLICE_READY"}
    result["resource_receipts"] = [resource_local, resource_research, resource_followup_1, resource_followup_2]
    result["metrics"]["cost_latency"].update({"all_reported_tokens": 270, "active_ms": 30, "wall_ms": 3000})
    result["passes"][0].update({"all_reported_tokens": 250, "active_ms": 20})
    result["passes"][1].update({"all_reported_tokens": 10, "active_ms": 5})
    result["passes"][2].update({"all_reported_tokens": 10, "active_ms": 5})
    result["family_accounting"].update({"finished_at_utc": "2026-07-16T00:00:03Z", "elapsed_ms": 3000, "input_tokens": 210, "output_tokens": 60, "all_reported_tokens": 270, "targeted_followups": 2, "closure_cycles": 2})
    result["input_bindings"]["artifact_validator_sha256"] = sha("validator")
    exact_validator = validator_sha256()
    structural["artifact_validator_sha256"] = exact_validator
    structural["completeness"]["validator_sha256"] = exact_validator
    rebuilt = structural_rebuild_hash(structural)
    structural["completeness"]["primary_rebuild_root_sha256"] = rebuilt
    structural["completeness"]["clean_rebuild_root_sha256"] = rebuilt
    surface["snapshot"]["artifact_validator_sha256"] = exact_validator
    surface["snapshot"]["structural_map_sha256"] = artifact_hash("structural-map", structural)
    research["surface_ledger_sha256"] = artifact_hash("surface-ledger", surface)
    research["portfolio_payload_sha256"] = research_portfolio_hash(research)
    adequacy["open_portfolio_sha256"] = artifact_hash("research-portfolio", research)
    adequacy["receipt_payload_sha256"] = research_adequacy_hash(adequacy)
    registry["surface_ledger_sha256"] = artifact_hash("surface-ledger", surface)
    registry["registry_sha256"] = control_registry_hash(registry)
    graph["bindings"]["artifact_validator_sha256"] = exact_validator
    graph["capability_id"] = PILOTS[0]
    graph["bindings"]["surface_ledger_sha256"] = artifact_hash("surface-ledger", surface)
    graph["bindings"]["research_portfolio_sha256"] = artifact_hash("research-portfolio", research)
    graph["bindings"]["research_adequacy_sha256"] = artifact_hash("research-adequacy", adequacy)
    graph["closure_assessments"][0]["closure_fingerprint_sha256"] = closure_hash(graph["closure_assessments"][0], {row["id"]: row for row in graph["nodes"]}, graph["bindings"])
    graph["semantic_graph_sha256"] = graph_hash(graph)
    challenge_artifact["target_graph_sha256"] = graph["semantic_graph_sha256"]
    challenge_artifact["target_control_registry_sha256"] = artifact_hash("control-registry", registry)
    challenge_artifact["receipt_payload_sha256"] = challenge_receipt_hash(challenge_artifact)
    result["input_bindings"]["artifact_validator_sha256"] = exact_validator
    result["input_bindings"]["obligation_graph_sha256"] = artifact_hash("obligation-graph", graph)
    result["input_bindings"].update({"controls_sha256": artifact_hash("control-registry", registry), "control_registry_sha256": artifact_hash("control-registry", registry), "research_portfolio_sha256": artifact_hash("research-portfolio", research), "research_adequacy_sha256": artifact_hash("research-adequacy", adequacy), "fresh_challenge_sha256": artifact_hash("challenge-receipt", challenge_artifact)})
    result["fresh_challenge_receipt"]["target_graph_sha256"] = graph["semantic_graph_sha256"]
    research_worker = next(row for row in result["worker_receipts"] if row["worker_role"] == "OPEN_DISCOVERY_RESEARCHER")
    for artifact_binding in research_worker["artifact_bindings"]:
        if artifact_binding["artifact_type"] == "RESEARCH_PORTFOLIO_OPEN": artifact_binding["sha256"] = result["input_bindings"]["research_portfolio_sha256"]
        if artifact_binding["artifact_type"] == "RESEARCH_ADEQUACY_RECEIPT": artifact_binding["sha256"] = result["input_bindings"]["research_adequacy_sha256"]
    contract = json.loads((ROOT / "ROLLING_TRIAL_CONTRACT.json").read_text(encoding="utf-8"))
    return structural, surface, graph, result, contract, research, adequacy, registry, challenge_artifact, capture_payloads


def run_self_tests() -> dict[str, Any]:
    structural, surface, graph, result, contract, research, adequacy, registry, challenge_artifact, capture_payloads = minimal_fixtures()
    fixture_markdown_bytes = b"A" * 10
    source_entries = [
        {"path": "Plans", "entry_kind": "directory", "mode": 493, "bytes": None, "sha256": None},
        {"path": "Plans/A.md", "entry_kind": "regular_file", "mode": 420, "bytes": 10, "sha256": hashlib.sha256(fixture_markdown_bytes).hexdigest()},
        {"path": "Plans/B.json", "entry_kind": "regular_file", "mode": 420, "bytes": 2, "sha256": hashlib.sha256(b"{}").hexdigest()},
    ]
    source_snapshot = {"schema_version": "1.0.0", "trial_id": "trial.fixture", "plans_root": "Plans", "created_at_utc": "2026-07-16T00:00:00Z", "population_algorithm": "lstat sorted NFC relative paths; record every entry; hash exact bytes for regular files only", "entries": source_entries, "regular_file_count": 2, "directory_entry_count": 1, "population_sha256": snapshot_population_hash(source_entries), "protected_before_sha256": hashlib.sha256(b"protected").hexdigest(), "terminal": "PASS"}
    source_snapshot.update({"excluded_future_run_root": "/future/authorized/root", "excluded_future_run_root_absent_at_freeze": True})
    empty_blob = encoded_blob(b"")
    protected_fixture = {"schema_version": "1.0.0", "receipt_id": "protected.before", "trial_id": "trial.fixture", "generation_id": "generation.fixture", "phase": "BEFORE", "contract_sha256": artifact_hash("contract", contract), "repository_root": "/fixture/repo", "authorized_run_root": "/future/authorized/root", "collector_sha256": hashlib.sha256(b"collector").hexdigest(), "command_contract_sha256": hashlib.sha256(b"commands").hexdigest(), "captured_at_utc": "2026-07-16T00:00:00Z", "git_state": {"head_commit": "0" * 40, "head_tree": "1" * 40, "symbolic_ref": "refs/heads/fixture", "status_porcelain_v1_z_raw": empty_blob, "status_porcelain_v1_z_excluding_run_root": empty_blob, "index_entries_z": empty_blob, "staged_diff_binary": empty_blob, "tracked_diff_binary": empty_blob}, "protected_entries": [{"scope_id": "plans_population", "path": row["path"], "entry_kind": "regular_file", "mode": row["mode"], "bytes": row["bytes"], "sha256": row["sha256"]} for row in source_entries if row["entry_kind"] == "regular_file"], "source_snapshot_population_sha256": source_snapshot["population_sha256"], "run_root_exists": False, "terminal": "PASS"}
    protected_fixture["state_payload_sha256"] = protected_state_payload_hash(protected_fixture)
    source_snapshot["protected_before_sha256"] = protected_fixture["state_payload_sha256"]
    campaign_results: list[dict[str, Any]] = []
    family_manifest_rows: list[dict[str, Any]] = []
    for index, family in enumerate(PILOTS):
        item = copy.deepcopy(result)
        item["family_id"] = family
        calibration = family == PILOTS[2]
        item["pilot_mode"] = "revealed_known_answer_realization_calibration_excluded_from_discovery_efficacy" if calibration else "novel_method_signal"
        item["discovery_efficacy_eligible"] = not calibration
        item["scale_inference_eligible"] = not calibration
        local_context = f"ctx.{family}.local"; research_context = f"ctx.{family}.research"
        context_by_role = {"LOCAL_EXPECTATION_MODELER": local_context, "OPEN_DISCOVERY_RESEARCHER": research_context}
        for worker in item["worker_receipts"]:
            old_context = worker["context_id"]; new_context = context_by_role[worker["worker_role"]]; worker["context_id"] = new_context
            for artifact_binding in worker["artifact_bindings"]:
                artifact_binding["producer_context_id"] = new_context
                artifact_binding["family_id"] = family
                if artifact_binding["ref"].startswith("families/"):
                    artifact_binding["ref"] = artifact_binding["ref"].replace(f"families/{PILOTS[0]}/", f"families/{family}/")
                family_manifest_rows.append({"path": artifact_binding["ref"], "owner_scope": family, "bytes": 100, "sha256": artifact_binding["sha256"]})
        for receipt_index, receipt in enumerate(item["resource_receipts"], start=1):
            receipt["receipt_id"] = f"res.{index}.{receipt_index}"
            receipt["context_id"] = context_by_role[receipt["worker_role"]]
            receipt["invocation_id"] = f"{family}.{receipt['invocation_id']}"
            receipt["activity_binding_sha256"] = resource_activity_binding(receipt)
        item["input_bindings"]["research_portfolio_ref"] = item["input_bindings"]["research_portfolio_ref"].replace(f"families/{PILOTS[0]}/", f"families/{family}/")
        item["input_bindings"]["research_adequacy_ref"] = item["input_bindings"]["research_adequacy_ref"].replace(f"families/{PILOTS[0]}/", f"families/{family}/")
        item["input_bindings"]["fresh_challenge_ref"] = item["input_bindings"]["fresh_challenge_ref"].replace(f"families/{PILOTS[0]}/", f"families/{family}/")
        for gate in item["gates"]:
            gate["evidence_refs"] = [ref.replace(f"families/{PILOTS[0]}/", f"families/{family}/") for ref in gate["evidence_refs"]]
        challenge_path = item["input_bindings"]["fresh_challenge_ref"]
        family_manifest_rows.append({"path": challenge_path, "owner_scope": family, "bytes": 100, "sha256": item["input_bindings"]["fresh_challenge_sha256"]})
        result_path = f"families/{family}/ASSURANCE_RESULT.json"
        family_manifest_rows.append({"path": result_path, "owner_scope": family, "bytes": 100, "sha256": hashlib.sha256(f"{family}:result".encode()).hexdigest()})
        item["family_accounting"].update({"artifact_files": 8, "artifact_bytes": 800, "largest_artifact_bytes": 100})
        item["fresh_challenge_receipt"].update({"target_family_id": family, "challenger_family_id": {PILOTS[0]: PILOTS[3], PILOTS[1]: PILOTS[2], PILOTS[2]: PILOTS[1], PILOTS[3]: PILOTS[0]}[family]})
        campaign_results.append(item)
    local_context_by_family = {item["family_id"]: item["worker_receipts"][0]["context_id"] for item in campaign_results}
    for item in campaign_results:
        item["fresh_challenge_receipt"]["challenger_context_id"] = local_context_by_family[item["fresh_challenge_receipt"]["challenger_family_id"]]
    manifest = family_manifest_rows + [{"path": "shared/REQUIRED_CONTROL_REGISTRY.json", "owner_scope": "shared", "bytes": 100, "sha256": artifact_hash("control-registry", registry)}]
    summary = {"schema_version": "1.0.0", "trial_id": "trial.fixture", "contract_sha256": artifact_hash("contract", contract), "artifact_validator_sha256": validator_sha256(), "launch_authority_ref": "LAUNCH_AUTHORITY.json", "launch_authority_sha256": hashlib.sha256(b"authority").hexdigest(), "source_snapshot_ref": "SOURCE_SNAPSHOT.json", "source_snapshot_sha256": artifact_hash("source-snapshot", source_snapshot), "family_result_bindings": [{"family_id": item["family_id"], "result_ref": f"families/{item['family_id']}/ASSURANCE_RESULT.json", "result_sha256": artifact_hash("assurance-result", item)} for item in campaign_results], "controller_resource_receipts": [], "cross_family_seam_passes": [{"pass_id": "seam.1", "added_critical_or_major_ids": [], "material_revisions": 0, "adequacy_gap_count": 0, "clean": True, "clean_streak_after": 1}, {"pass_id": "seam.2", "added_critical_or_major_ids": [], "material_revisions": 0, "adequacy_gap_count": 0, "clean": True, "clean_streak_after": 2}], "artifact_manifest": manifest, "execution_window": {"started_at_utc": "2026-07-16T00:00:00Z", "finished_at_utc": "2026-07-16T00:00:03Z", "elapsed_ms": 3000}, "totals": {"input_tokens": 840, "output_tokens": 240, "all_reported_tokens": 1080, "semantic_contexts": 8, "searches": 4, "opens": 4, "artifact_files": 34, "artifact_bytes": 3300, "largest_artifact_bytes": 100, "elapsed_ms": 3000}, "protected_invariance": {"before_ref": "PROTECTED_BEFORE.json", "before_sha256": protected_fixture["state_payload_sha256"], "after_ref": "PROTECTED_AFTER.json", "after_sha256": protected_fixture["state_payload_sha256"], "pass": True}, "gates": [{"gate_id": row["id"], "terminal": "PASS", "evidence_refs": ["fixture"]} for row in contract["gates"]], "calibration_reporting": {"novel_signal_family_ids": [PILOTS[0], PILOTS[1], PILOTS[3]], "calibration_only_family_ids": [PILOTS[2]], "accessibility_counted_in_discovery_efficacy": False, "accessibility_counted_in_scale_inference": False}, "terminal": "READY_FOR_SCALE_DECISION"}
    controller_seam_receipts = []
    seam_passes = []
    for ordinal in (1, 2):
        pass_id = f"seam.{ordinal}"
        invocation_id = f"invoke.controller.{pass_id}"
        receipt = {"receipt_id": f"controller.{pass_id}", "context_id": "ctx.controller", "worker_role": "TRIAL_CONTROLLER", "invocation_id": invocation_id, "activity_kind": "cross_family_seam", "target_family_id": None, "challenge_id": None, "role_id": "TRIAL_CONTROLLER", "stage_id": "S7_COVERAGE_FEEDBACK", "pass_id": pass_id, "attempt_ordinal": 1, "retry_kind": "none", "prior_attempt_receipt_id": None, "input_tokens": 0, "visible_output_tokens": 0, "reasoning_output_tokens": 0, "output_includes_reasoning": False, "native_total_tokens": None, "effective_total_tokens": 0, "effective_total_source": "derived_exact", "searches": 0, "opens": 0, "raw_bytes": 0, "started_at_utc": "2026-07-16T00:00:02Z", "finished_at_utc": "2026-07-16T00:00:03Z", "failure_class": None}
        receipt["activity_binding_sha256"] = resource_activity_binding(receipt)
        controller_seam_receipts.append(receipt)
        seam_passes.append({"pass_id": pass_id, "resource_receipt_id": receipt["receipt_id"], "invocation_id": invocation_id, "added_critical_or_major_ids": [], "material_revisions": 0, "adequacy_gap_count": 0, "clean": True, "clean_streak_after": ordinal})
    summary["controller_resource_receipts"] = controller_seam_receipts
    summary["cross_family_seam_passes"] = seam_passes

    launch_request_fixture = {"schema_version": "1.0.0", "request_id": "request.fixture", "trial_id": "trial.fixture", "generation_id": "generation.fixture", "packet_id": "stage-a-plan-assurance-rolling-trial-packet-v1", "requesting_task_path": "/root/controller", "expected_authority_task_path": "/root", "authority_delivery_mode": "codex_system_collaboration_envelope", "request_status": "AWAITING_EXTERNAL_ATTESTATION", "contract_sha256": summary["contract_sha256"], "artifact_validator_sha256": validator_sha256(), "source_snapshot_sha256": artifact_hash("source-snapshot", source_snapshot), "protected_before_receipt_sha256": hashlib.sha256(canonical_bytes(protected_fixture)).hexdigest(), "protected_before_state_sha256": protected_fixture["state_payload_sha256"], "run_root": "/future/authorized/root", "budget_contract_sha256": artifact_hash("budget-contract", contract["budgets"]), "topology_contract_sha256": artifact_hash("topology-contract", contract["topology"]), "external_transmission_manifest_ref": "EXTERNAL_TRANSMISSION_MANIFEST.json", "external_transmission_manifest_sha256": hashlib.sha256(b"transmission").hexdigest(), "exact_execution_envelope_sha256": hashlib.sha256(b"execution envelope").hexdigest(), "created_at_utc": "2026-07-16T00:00:01Z", "expires_at_utc": "2026-07-16T01:00:00Z", "max_uses": 1}
    launch_request_fixture["launch_binding_sha256"] = launch_request_binding(launch_request_fixture)
    authorization_message_fixture = {
        "schema_version": "1.0.0",
        "decision": "AUTHORIZE_ONE_LIVE_TURN",
        "request_sha256": hashlib.sha256(canonical_bytes(launch_request_fixture)).hexdigest(),
        "approved_launch_binding_sha256": launch_request_fixture["launch_binding_sha256"],
        "approved_external_transmission_manifest_sha256": launch_request_fixture["external_transmission_manifest_sha256"],
        "exact_execution_envelope_sha256": launch_request_fixture["exact_execution_envelope_sha256"],
        "one_use_nonce_sha256": hashlib.sha256(b"nonce").hexdigest(),
        "target_task_path": "/root/controller",
        "expires_at_utc": "2026-07-16T01:00:00Z",
        "external_research_authorized": True,
        "model_calls_authorized": True,
        "canonical_plan_writes_authorized": False,
        "generated_or_governance_writes_authorized": False,
        "git_write_authorized": False,
    }
    trusted_capability_fixture = {"schema_version": "1.0.0", "capability_id": "capability.fixture", "authority_mode": "codex_live_orchestrator_sender", "target_task_path": "/root/controller", "observed_sender_task_path": "/root", "observed_message_type": "MESSAGE", "observed_message_id": "message.fixture", "observed_turn_id": "turn.fixture", "observed_message_created_at_utc": "2026-07-16T00:00:02Z", "consumed_at_utc": "2026-07-16T00:00:03Z", "authorization_message": authorization_message_fixture, "authorization_message_sha256": authorization_message_hash(authorization_message_fixture), "launch_request_sha256": hashlib.sha256(canonical_bytes(launch_request_fixture)).hexdigest(), "approved_launch_binding_sha256": launch_request_fixture["launch_binding_sha256"], "approved_external_transmission_manifest_sha256": launch_request_fixture["external_transmission_manifest_sha256"], "exact_execution_envelope_sha256": launch_request_fixture["exact_execution_envelope_sha256"], "one_use_nonce_sha256": hashlib.sha256(b"nonce").hexdigest(), "issued_at_utc": "2026-07-16T00:00:02Z", "expires_at_utc": "2026-07-16T01:00:00Z", "max_uses": 1, "live_system_sender_attestation_observed": True, "offline_cryptographic_verification": False, "terminal": "LIVE_ATTESTATION_CONSUMED"}
    trusted_capability_fixture["capability_payload_sha256"] = trusted_capability_payload_hash(trusted_capability_fixture)
    launch_fixture = {"schema_version": "1.0.0", "trial_id": "trial.fixture", "generation_id": "generation.fixture", "packet_id": "stage-a-plan-assurance-rolling-trial-packet-v1", "contract_sha256": summary["contract_sha256"], "artifact_validator_sha256": validator_sha256(), "launch_request_ref": "LAUNCH_REQUEST.json", "launch_request_sha256": trusted_capability_fixture["launch_request_sha256"], "launch_binding_sha256": launch_request_fixture["launch_binding_sha256"], "authority_mode": "codex_live_orchestrator_sender", "trusted_capability_ref": "/external/TRUSTED_LAUNCH_CAPABILITY.json", "trusted_capability_sha256": hashlib.sha256(canonical_bytes(trusted_capability_fixture)).hexdigest(), "trusted_capability_id": trusted_capability_fixture["capability_id"], "authorization_message_sha256": trusted_capability_fixture["authorization_message_sha256"], "observed_sender_task_path": "/root", "observed_message_id": "message.fixture", "observed_turn_id": "turn.fixture", "one_use_nonce_sha256": trusted_capability_fixture["one_use_nonce_sha256"], "offline_cryptographic_verification": False, "single_use_marker_ref": "LAUNCH_AUTHORITY_USED.json", "max_uses": 1, "trial_launch_authorized": True, "run_root": "/future/authorized/root", "external_research_authorized": True, "model_calls_authorized": True, "external_transmission_disclosed_and_accepted": True, "canonical_plan_writes_authorized": False, "generated_or_governance_writes_authorized": False, "git_write_authorized": False, "budget_contract_sha256": artifact_hash("budget-contract", contract["budgets"]), "source_snapshot_must_be_fresh": True, "issued_at_utc": "2026-07-16T00:00:03Z"}
    challenge_resource_fixture = copy.deepcopy(result["resource_receipts"][0])
    challenge_resource_fixture.update({"receipt_id": "res.challenge.migration", "context_id": "ctx.migration.local", "invocation_id": "invoke.challenge.fixture", "activity_kind": "fresh_challenge", "target_family_id": PILOTS[0], "challenge_id": "challenge.fixture", "role_id": "CROSS_FAMILY_CHALLENGER", "stage_id": "S6_CROSS_FAMILY_CHALLENGE", "pass_id": "challenge.fixture", "input_tokens": 5, "cached_input_tokens": 0, "visible_output_tokens": 5, "reasoning_output_tokens": 0, "derived_total_tokens": 10, "effective_total_tokens": 10, "active_ms": 5, "wall_ms": 1000, "started_at_utc": "2026-07-16T00:00:02Z", "finished_at_utc": "2026-07-16T00:00:03Z"})
    challenge_resource_fixture["activity_binding_sha256"] = resource_activity_binding(challenge_resource_fixture)
    challenge_resource_artifact = copy.deepcopy(challenge_artifact)
    challenge_resource_artifact.update({"target_locks_sha256": challenge_target_locks_hash(result), "challenge_resource_receipt_sha256": artifact_hash("resource-receipt", challenge_resource_fixture)})
    challenge_resource_artifact["receipt_payload_sha256"] = challenge_receipt_hash(challenge_resource_artifact)
    challenger_fixture = {"resource_receipts": [challenge_resource_fixture]}
    fixture_machine_bytes = {"Plans/A.md": fixture_markdown_bytes, "Plans/B.json": b"{}"}
    positives = {
        "valid_source_snapshot": not validate_source_snapshot(source_snapshot),
        "valid_protected_state": not validate_protected_state(protected_fixture, "BEFORE", source_snapshot, summary["contract_sha256"]),
        "valid_launch_request": not validate_launch_request(launch_request_fixture, contract),
        "valid_trusted_capability": not validate_trusted_capability(trusted_capability_fixture, launch_request_fixture, "/root", "/root/controller", authorization_message_fixture, "message.fixture", "turn.fixture", "2026-07-16T00:00:02Z", "2026-07-16T00:00:03Z"),
        "valid_structural": not validate_structural(structural, fixture_machine_bytes),
        "valid_surface": not validate_surface(surface, structural),
        "valid_research": not validate_research_portfolio(research, surface, capture_payloads),
        "valid_research_captures": all(not validate_research_capture(capture, next(row for row in research["operation_receipts"] if row["capture_ref"] == ref)) for ref, capture in capture_payloads.items()),
        "valid_adequacy": not validate_research_adequacy(adequacy, research, result["worker_receipts"], surface),
        "valid_control_registry": not validate_control_registry(registry, surface),
        "valid_challenge": not validate_challenge_receipt(challenge_artifact, graph, surface, registry),
        "valid_challenge_resource": not validate_cross_family_challenge_resource(challenge_resource_artifact, result, challenger_fixture),
        "valid_graph": not validate_graph(graph, surface, research, adequacy, registry),
        "valid_result": not validate_result(result, contract, graph, surface, research, adequacy, registry, challenge_artifact, capture_payloads),
        "valid_summary": not validate_summary(summary, campaign_results, contract, source_snapshot),
        "schema_valid_source": not schema_findings("source", source_snapshot),
        "schema_valid_protected": not schema_findings("protected", protected_fixture),
        "schema_valid_launch_request": not schema_findings("launch_request", launch_request_fixture),
        "schema_valid_trusted_capability": not schema_findings("trusted_capability", trusted_capability_fixture),
        "schema_valid_launch": not schema_findings("launch", launch_fixture),
        "schema_valid_structural": not schema_findings("structural", structural),
        "schema_valid_surface": not schema_findings("surface", surface),
        "schema_valid_research": not schema_findings("research", research),
        "schema_valid_research_captures": all(not schema_findings("research_capture", capture) for capture in capture_payloads.values()),
        "schema_valid_adequacy": not schema_findings("adequacy", adequacy),
        "schema_valid_control_registry": not schema_findings("control_registry", registry),
        "schema_valid_challenge": not schema_findings("challenge", challenge_artifact),
        "schema_valid_graph": not schema_findings("graph", graph),
        "schema_valid_result": not schema_findings("result", result),
        "schema_valid_summary": not schema_findings("summary", summary),
    }
    recovery_population_fixture = [{"portfolio_kind": "open_discovery", "family_id": family} for family in PILOTS] + [{"portfolio_kind": "failure_recovery", "family_id": PILOTS[0]}]
    recovery_adequacy_fixture = [{"family_id": family, "recovery": {"required": family == PILOTS[0]}} for family in PILOTS]
    positives["summary_population_with_required_recovery"] = complete_summary_research_population(recovery_population_fixture, recovery_adequacy_fixture)
    gap_graph = copy.deepcopy(graph)
    gap_obligation = next(row for row in gap_graph["nodes"] if row["id"] == "obl-main")
    gap_obligation["payload"]["disposition"] = "open"
    gap_obligation["content_sha256"] = node_content_hash(gap_obligation)
    gap_closure = gap_graph["closure_assessments"][0]
    gap_closure.update({"semantic_state": "partial", "instance_realization": "partial", "disposition": "open"})
    gap_closure["closure_fingerprint_sha256"] = closure_hash(gap_closure, {row["id"]: row for row in gap_graph["nodes"]}, gap_graph["bindings"])
    gap_graph["semantic_graph_sha256"] = graph_hash(gap_graph)
    gap_result = copy.deepcopy(result)
    gap_result["plan_slice_status"] = "PLAN_SLICE_NOT_READY_GAPS_FOUND"
    gap_result["input_bindings"]["obligation_graph_sha256"] = artifact_hash("obligation-graph", gap_graph)
    gap_result["fresh_challenge_receipt"]["target_graph_sha256"] = gap_graph["semantic_graph_sha256"]
    gap_challenge = copy.deepcopy(challenge_artifact)
    gap_challenge["target_graph_sha256"] = gap_graph["semantic_graph_sha256"]
    gap_challenge["receipt_payload_sha256"] = challenge_receipt_hash(gap_challenge)
    gap_result["input_bindings"]["fresh_challenge_sha256"] = artifact_hash("challenge-receipt", gap_challenge)
    gap_result["obligation_metric_rows"][0].update({"semantic_credit": 0.5, "realization_credit": 0.5, "disposition": "open", "is_gap": True})
    gap_result["metrics"]["bounded_semantic_coverage"].update({"earned_weight": 2.5, "ratio": 0.5, "raw_uncovered_ids": ["obl-main"]})
    gap_result["metrics"]["named_scenario_realization"].update({"earned_weight": 2.5, "ratio": 0.5, "raw_uncovered_ids": ["obl-main"]})
    gap_result["metrics"]["disposition_completeness"] = {"numerator": 1, "denominator": 1, "ratio": 1, "zero_denominator_rule": "invalid_metric", "numerator_ids": ["obl-main"], "denominator_ids": ["obl-main"]}
    gap_result["critical_misses"] = [{"miss_id": "miss.1", "obligation_id": "obl-main", "primary_loss_stage": "named_realization", "consequence": "gap", "status": "open"}]
    gap_result["metrics"]["critical_miss_summary"] = {"count": 1, "weight": 5, "ids": ["miss.1"]}
    for gate in gap_result["gates"]:
        if gate["gate_id"] == "P2_PLAN_NAMED_REALIZATION": gate["terminal"] = "FAIL"
    positives["method_ready_with_plan_gaps"] = not validate_graph(gap_graph, surface, research, adequacy, registry) and not validate_result(gap_result, contract, gap_graph, surface, research, adequacy, registry, gap_challenge, capture_payloads)

    mutations: list[tuple[str, Callable[[], list[str]]]] = []
    def mutate(base: dict[str, Any], path: list[Any], value: Any) -> dict[str, Any]:
        obj = copy.deepcopy(base); cursor: Any = obj
        for key in path[:-1]: cursor = cursor[key]
        cursor[path[-1]] = value
        return obj
    def rebind_structural(item: dict[str, Any]) -> dict[str, Any]:
        manifest = [{key: row.get(key) for key in ("path", "mode", "bytes", "sha256")} for row in sorted(item["population"], key=lambda row: row["path"])]
        item["snapshot"]["regular_file_count"] = len(item["population"])
        item["snapshot"]["population_sha256"] = identity_hash("structural-population", manifest)
        item["invalidation"]["current_population_sha256"] = item["snapshot"]["population_sha256"]
        item["completeness"]["population_rows"] = len(item["population"])
        rebuilt = structural_rebuild_hash(item)
        item["completeness"]["primary_rebuild_root_sha256"] = rebuilt
        item["completeness"]["clean_rebuild_root_sha256"] = rebuilt
        return item
    def omitted_machine() -> list[str]:
        item = copy.deepcopy(structural)
        item["population"].append({"path": "Plans/C.json", "artifact_role": "active_machine_contract", "semantic_authority": True, "bytes": 2, "mode": 420, "sha256": hashlib.sha256(b"C").hexdigest(), "parser": "json", "classification_evidence": ["fixture"], "exclusion_reason": None})
        return validate_structural(rebind_structural(item), fixture_machine_bytes)
    def invalidation_without_propagation() -> list[str]:
        item = copy.deepcopy(structural); item["invalidation"]["changed_node_ids"] = ["doc.A"]
        return validate_structural(item, fixture_machine_bytes)
    def bad_surface_source() -> list[str]:
        item = copy.deepcopy(surface); item["instances"][0]["source_bindings"][0]["ref"] = "Plans/MISSING.md#x"
        return validate_surface(item, structural)
    def supersedes_cycle() -> list[str]:
        item = copy.deepcopy(surface)
        item["relations"].extend([
            {"relation_id": "rel.sup.1", "from_instance_id": "sil.actor.user", "to_instance_id": "sil.entry.main", "relation_type": "supersedes", "source_ref": "fixture"},
            {"relation_id": "rel.sup.2", "from_instance_id": "sil.entry.main", "to_instance_id": "sil.actor.user", "relation_type": "supersedes", "source_ref": "fixture"},
        ])
        return validate_surface(item, structural)
    def duplicate_canonical_identity() -> list[str]:
        item = copy.deepcopy(surface)
        item["instances"][1].update({"kind": "actor", "canonical_key": "user", "kind_contract": {"actor_kind": "user", "execution_role": "user", "authority_scope": "fixture"}})
        item["candidate_inventory"][1].update({"kind": "actor", "canonical_key": "user"})
        item["denominator_sets"][1]["kind"] = "actor"
        return validate_surface(item, structural)
    def graph_missing_oracle() -> list[str]:
        item = copy.deepcopy(graph); scenario = next(row for row in item["nodes"] if row["id"] == "scn-main")
        scenario["payload"]["oracle_refs"] = ["val-missing"]; scenario["content_sha256"] = node_content_hash(scenario)
        item["closure_assessments"][0]["closure_fingerprint_sha256"] = closure_hash(item["closure_assessments"][0], {row["id"]: row for row in item["nodes"]}, item["bindings"]); item["semantic_graph_sha256"] = graph_hash(item)
        return validate_graph(item, surface)
    def graph_wrong_basis_type() -> list[str]:
        item = copy.deepcopy(graph); item["edges"][0]["authority_refs"] = ["risk-main"]; item["semantic_graph_sha256"] = graph_hash(item)
        return validate_graph(item, surface)
    def graph_nested_retrieval() -> list[str]:
        item = copy.deepcopy(graph); claim = next(row for row in item["nodes"] if row["id"] == "clm-main")
        claim["payload"]["exact_source_identity"] = "hidden"; claim["content_sha256"] = node_content_hash(claim); item["semantic_graph_sha256"] = graph_hash(item)
        return validate_graph(item, surface)
    def wall_false_ready() -> list[str]:
        item = copy.deepcopy(result)
        for receipt in item["resource_receipts"]: receipt["finished_at_utc"] = "2026-07-17T00:00:00Z"
        item["family_accounting"].update({"finished_at_utc": "2026-07-17T00:00:00Z", "elapsed_ms": 86400000})
        item["metrics"]["cost_latency"]["wall_ms"] = 86400000
        return validate_result(item, contract, graph)
    def fabricated_machine_pointer() -> list[str]:
        item = copy.deepcopy(structural); machine = item["machine_nodes"][0]
        machine.update({"json_pointer": "/not/a/real/pointer", "content_sha256": "0" * 64, "local_ref_targets": ["#/not-real"]})
        return validate_structural(rebind_structural(item), fixture_machine_bytes)
    def spoofed_invalidation() -> list[str]:
        item = copy.deepcopy(structural)
        item["invalidation"].update({"changed_node_ids": ["doc.A"], "propagation_edges": [{"from_node_id": "doc.A", "to_node_id": "fake.target", "reason": "spoof"}], "impacted_capability_ids": ["cap.fake"]})
        return validate_structural(item, fixture_machine_bytes)
    def surface_wrong_fragment() -> list[str]:
        item = copy.deepcopy(surface); item["instances"][0]["source_bindings"][0]["ref"] = "Plans/A.md#not-real"
        return validate_surface(item, structural)
    def surface_wrong_semantic() -> list[str]:
        item = copy.deepcopy(surface); item["instances"][0]["source_bindings"][0]["semantic_sha256"] = "0" * 64
        return validate_surface(item, structural)
    def surface_wrong_owner_unit() -> list[str]:
        item = copy.deepcopy(surface); item["instances"][0]["owner"]["owner_plan_unit"] = "pu.DOES_NOT_EXIST"
        return validate_surface(item, structural)
    def surface_capability_drift() -> list[str]:
        item = copy.deepcopy(surface)
        for row in item["instances"]: row["capability_ids"] = ["cap.other"]
        return validate_surface(item, structural)
    def surface_invalidation_dependency_drift() -> list[str]:
        item = copy.deepcopy(surface)
        item["invalidations"] = [
            {"invalidation_id": "inv.1", "instance_ids": ["sil.actor.user"], "cause": "x", "affected_dimensions": ["semantics"], "source_ref": "fixture", "status": "recomputed"},
            {"invalidation_id": "inv.1", "instance_ids": ["sil.actor.user"], "cause": "x", "affected_dimensions": ["semantics"], "source_ref": "fixture", "status": "recomputed"},
        ]
        item["instances"][0]["mutation_dependencies"] = ["sil.missing"]
        return validate_surface(item, structural)
    def surface_alias_collision() -> list[str]:
        item = copy.deepcopy(surface)
        item["aliases"] = [{"alias": "main", "target_instance_id": "sil.actor.user", "alias_kind": "display", "source_ref": "fixture", "counts_toward_denominator": False}]
        return validate_surface(item, structural)
    def graph_template_substitution() -> list[str]:
        ledger = copy.deepcopy(surface); template = copy.deepcopy(ledger["instances"][0])
        template.update({"instance_id": "sil.actor.template", "instance_role": "contract_template", "template_coverage": {"covers_instance_ids": ["sil.actor.user"], "instance_set_ref": "denom.actor", "membership_sha256": ledger["denominator_sets"][0]["membership_sha256"]}, "obligation_ids": ["obl-main"]})
        ledger["instances"].append(template); ledger["instances"][0]["obligation_ids"] = ["obl-bogus"]
        ledger["summary"].update({"instance_count": 4, "template_count": 1})
        item = copy.deepcopy(graph); surf = next(row for row in item["nodes"] if row["id"] == "surf-actor")
        surf["payload"]["ledger_instance_id"] = "sil.actor.template"; surf["content_sha256"] = node_content_hash(surf)
        item["closure_assessments"][0]["closure_fingerprint_sha256"] = closure_hash(item["closure_assessments"][0], {row["id"]: row for row in item["nodes"]}, item["bindings"])
        item["semantic_graph_sha256"] = graph_hash(item)
        return validate_surface(ledger, structural) + validate_graph(item, ledger)
    def graph_open_false_plan_ready() -> list[str]:
        item = copy.deepcopy(graph); obligation = next(row for row in item["nodes"] if row["id"] == "obl-main")
        obligation["payload"]["disposition"] = "open"; obligation["content_sha256"] = node_content_hash(obligation)
        closure = item["closure_assessments"][0]; closure["disposition"] = "open"
        closure["closure_fingerprint_sha256"] = closure_hash(closure, {row["id"]: row for row in item["nodes"]}, item["bindings"]); item["semantic_graph_sha256"] = graph_hash(item)
        outcome = copy.deepcopy(result); outcome["input_bindings"]["obligation_graph_sha256"] = artifact_hash("obligation-graph", item); outcome["fresh_challenge_receipt"]["target_graph_sha256"] = item["semantic_graph_sha256"]; outcome["obligation_metric_rows"][0].update({"disposition": "open", "is_gap": False})
        return validate_graph(item, surface) + validate_result(outcome, contract, item)
    def graph_obligation_semantic_drift() -> list[str]:
        item = copy.deepcopy(graph); obligation = next(row for row in item["nodes"] if row["id"] == "obl-main")
        obligation["payload"]["object_scope"] = "changed"; obligation["content_sha256"] = node_content_hash(obligation); item["semantic_graph_sha256"] = graph_hash(item)
        return validate_graph(item, surface)
    def result_two_infrastructure_retries() -> list[str]:
        item = copy.deepcopy(result)
        original = copy.deepcopy(item["resource_receipts"])
        for prior in original: prior["failure_class"] = "infrastructure"
        retries = []
        for prior in original:
            retry = copy.deepcopy(prior); retry.update({"receipt_id": prior["receipt_id"] + ".retry", "attempt_ordinal": 2, "retry_kind": "infrastructure", "prior_attempt_receipt_id": prior["receipt_id"], "retries": 1, "failure_class": None})
            retries.append(retry)
        item["resource_receipts"] = original + retries
        item["metrics"]["cost_latency"].update({"all_reported_tokens": 500, "searches": 4, "opens": 4, "active_ms": 40})
        item["family_accounting"].update({"input_tokens": 400, "output_tokens": 100, "all_reported_tokens": 500, "infrastructure_retries": 2, "searches": 4, "opens": 4})
        item["passes"][0]["all_reported_tokens"] = 250
        return validate_result(item, contract, graph)
    def result_research_without_operations() -> list[str]:
        item = copy.deepcopy(result); receipt = next(row for row in item["resource_receipts"] if row["context_id"] == "ctx.research")
        receipt.update({"searches": 0, "opens": 0}); item["metrics"]["cost_latency"].update({"searches": 1, "opens": 1}); item["family_accounting"].update({"searches": 1, "opens": 1})
        return validate_result(item, contract, graph)
    def reconcile_mutated_resources(item: dict[str, Any]) -> None:
        receipts = item["resource_receipts"]
        for receipt in receipts:
            derived = receipt["input_tokens"] + receipt["visible_output_tokens"] + (receipt["reasoning_output_tokens"] if receipt["output_includes_reasoning"] is False else 0)
            receipt["derived_total_tokens"] = derived
            receipt["effective_total_tokens"] = receipt["native_total_tokens"] if receipt["native_total_tokens"] is not None else derived
            receipt["effective_total_source"] = "native" if receipt["native_total_tokens"] is not None else "derived_exact"
        effective = sum(row["effective_total_tokens"] for row in receipts)
        incoming = sum(row["input_tokens"] for row in receipts)
        outgoing = sum(row["visible_output_tokens"] + (row["reasoning_output_tokens"] if row["output_includes_reasoning"] is False else 0) for row in receipts)
        searches = sum(row["searches"] for row in receipts); opens = sum(row["opens"] for row in receipts)
        item["metrics"]["cost_latency"].update({"all_reported_tokens": effective, "effective_total_source": "native" if all(row["native_total_tokens"] is not None for row in receipts) else "derived_exact", "searches": searches, "opens": opens, "active_ms": sum(row["active_ms"] for row in receipts), "within_fuse": False})
        item["family_accounting"].update({"input_tokens": incoming, "output_tokens": outgoing, "all_reported_tokens": effective, "searches": searches, "opens": opens})
        item["passes"][0]["all_reported_tokens"] = effective - item["passes"][1]["all_reported_tokens"] - item["passes"][2]["all_reported_tokens"]
    def result_worker_total_fuse() -> list[str]:
        item = copy.deepcopy(result); receipt = item["resource_receipts"][0]
        receipt.update({"native_total_tokens": 200001, "effective_total_tokens": 200001, "effective_total_source": "native"})
        reconcile_mutated_resources(item)
        return validate_result(item, contract, graph)
    def result_worker_input_fuse() -> list[str]:
        item = copy.deepcopy(result); item["resource_receipts"][0]["input_tokens"] = 170001
        reconcile_mutated_resources(item)
        return validate_result(item, contract, graph)
    def result_worker_output_fuse() -> list[str]:
        item = copy.deepcopy(result); receipt = item["resource_receipts"][0]
        receipt.update({"visible_output_tokens": 30001, "reasoning_output_tokens": 0})
        reconcile_mutated_resources(item)
        return validate_result(item, contract, graph)
    def result_duplicate_base_attempt() -> list[str]:
        item = copy.deepcopy(result)
        duplicate = copy.deepcopy(item["resource_receipts"][0])
        duplicate["receipt_id"] = "res.duplicate.attempt1"
        item["resource_receipts"].append(duplicate)
        reconcile_mutated_resources(item)
        item["metrics"]["cost_latency"]["within_fuse"] = True
        return validate_result(item, contract, graph, surface, research, adequacy, registry, challenge_artifact)
    def summary_shared_contexts() -> list[str]:
        results_copy = copy.deepcopy(campaign_results)
        for item in results_copy:
            item["worker_receipts"][0]["context_id"] = "ctx.shared.local"; item["worker_receipts"][1]["context_id"] = "ctx.shared.research"
            item["resource_receipts"][0]["context_id"] = "ctx.shared.local"; item["resource_receipts"][1]["context_id"] = "ctx.shared.research"
            item["fresh_challenge_receipt"]["challenger_context_id"] = "ctx.shared.local"
        summary_copy = copy.deepcopy(summary)
        summary_copy["family_result_bindings"] = [{"family_id": item["family_id"], "result_ref": f"families/{item['family_id']}/ASSURANCE_RESULT.json", "result_sha256": artifact_hash("assurance-result", item)} for item in results_copy]
        return validate_summary(summary_copy, results_copy, contract, source_snapshot)
    def result_arbitrary_research_hash() -> list[str]:
        portfolio = copy.deepcopy(research)
        portfolio["portfolio_payload_sha256"] = "0" * 64
        outcome = copy.deepcopy(result)
        outcome["input_bindings"]["research_portfolio_sha256"] = "0" * 64
        researcher = next(row for row in outcome["worker_receipts"] if row["worker_role"] == "OPEN_DISCOVERY_RESEARCHER")
        next(row for row in researcher["artifact_bindings"] if row["artifact_type"] == "RESEARCH_PORTFOLIO_OPEN")["sha256"] = "0" * 64
        graph_copy = copy.deepcopy(graph)
        graph_copy["bindings"]["research_portfolio_sha256"] = "0" * 64
        graph_copy["closure_assessments"][0]["closure_fingerprint_sha256"] = closure_hash(graph_copy["closure_assessments"][0], {row["id"]: row for row in graph_copy["nodes"]}, graph_copy["bindings"])
        graph_copy["semantic_graph_sha256"] = graph_hash(graph_copy)
        outcome["input_bindings"]["obligation_graph_sha256"] = artifact_hash("obligation-graph", graph_copy)
        outcome["fresh_challenge_receipt"]["target_graph_sha256"] = graph_copy["semantic_graph_sha256"]
        challenge_copy = copy.deepcopy(challenge_artifact)
        challenge_copy["target_graph_sha256"] = graph_copy["semantic_graph_sha256"]
        challenge_copy["receipt_payload_sha256"] = challenge_receipt_hash(challenge_copy)
        outcome["input_bindings"]["fresh_challenge_sha256"] = artifact_hash("challenge-receipt", challenge_copy)
        return validate_graph(graph_copy, surface, portfolio, adequacy, registry) + validate_result(outcome, contract, graph_copy, surface, portfolio, adequacy, registry, challenge_copy)
    def result_wrong_role_research_artifact() -> list[str]:
        outcome = copy.deepcopy(result)
        researcher = next(row for row in outcome["worker_receipts"] if row["worker_role"] == "OPEN_DISCOVERY_RESEARCHER")
        binding = next(row for row in researcher["artifact_bindings"] if row["artifact_type"] == "RESEARCH_PORTFOLIO_OPEN")
        binding.update({"artifact_type": "DISCOVERY_CLAIMS", "schema_id": "pm.plan_assurance.discovery_claims.v1"})
        return validate_result(outcome, contract, graph, surface, research, adequacy, registry, challenge_artifact)
    def adequacy_missing_r3_recovery() -> list[str]:
        portfolio = copy.deepcopy(research)
        portfolio["source_cards"][0]["source_class"] = "direct_comparator"
        portfolio["portfolio_payload_sha256"] = research_portfolio_hash(portfolio)
        receipt = copy.deepcopy(adequacy)
        receipt["open_portfolio_sha256"] = artifact_hash("research-portfolio", portfolio)
        receipt["receipt_payload_sha256"] = research_adequacy_hash(receipt)
        return validate_research_adequacy(receipt, portfolio, result["worker_receipts"], surface)
    def graph_evidence_required_not_required() -> list[str]:
        item = copy.deepcopy(graph)
        closure = item["closure_assessments"][0]
        closure["evidence_state"] = "not_required_for_claim_kind"
        closure["closure_fingerprint_sha256"] = closure_hash(closure, {row["id"]: row for row in item["nodes"]}, item["bindings"])
        item["semantic_graph_sha256"] = graph_hash(item)
        return validate_graph(item, surface, research, adequacy, registry)
    def graph_adequate_empty_evidence() -> list[str]:
        item = copy.deepcopy(graph)
        closure = item["closure_assessments"][0]
        closure["evidence_basis_ids"] = []
        closure["closure_fingerprint_sha256"] = closure_hash(closure, {row["id"]: row for row in item["nodes"]}, item["bindings"])
        item["semantic_graph_sha256"] = graph_hash(item)
        return validate_graph(item, surface, research, adequacy, registry)
    def result_reported_operations_without_receipts() -> list[str]:
        outcome = copy.deepcopy(result)
        researcher = next(row for row in outcome["resource_receipts"] if row["worker_role"] == "OPEN_DISCOVERY_RESEARCHER")
        researcher["operation_receipt_ids"] = []
        return validate_result(outcome, contract, graph, surface, research, adequacy, registry, challenge_artifact)
    def research_source_without_read() -> list[str]:
        portfolio = copy.deepcopy(research)
        portfolio["source_cards"][0]["operation_receipt_ids"] = ["op.search"]
        portfolio["portfolio_payload_sha256"] = research_portfolio_hash(portfolio)
        return validate_research_portfolio(portfolio, surface)
    def result_empty_control_population() -> list[str]:
        outcome = copy.deepcopy(result)
        outcome["controls"] = []
        return validate_result(outcome, contract, graph, surface, research, adequacy, registry, challenge_artifact)
    def result_control_false_full() -> list[str]:
        outcome = copy.deepcopy(result)
        component = outcome["controls"][0]["components"]["identity"]
        component.update({"status": "full", "evidence_refs": [], "gap_refs": []})
        return validate_result(outcome, contract, graph, surface, research, adequacy, registry, challenge_artifact)
    def result_control_empty_instances() -> list[str]:
        outcome = copy.deepcopy(result)
        outcome["controls"][0]["instance_ids"] = []
        return validate_result(outcome, contract, graph, surface, research, adequacy, registry, challenge_artifact)
    def graph_thin_scenario() -> list[str]:
        item = copy.deepcopy(graph)
        scenario = next(row for row in item["nodes"] if row["id"] == "scn-main")
        scenario["payload"].pop("failure_cases", None)
        scenario["content_sha256"] = node_content_hash(scenario)
        item["closure_assessments"][0]["closure_fingerprint_sha256"] = closure_hash(item["closure_assessments"][0], {row["id"]: row for row in item["nodes"]}, item["bindings"])
        item["semantic_graph_sha256"] = graph_hash(item)
        return schema_findings("graph", item) + validate_graph(item, surface, research, adequacy, registry)
    def graph_missing_realization_edge() -> list[str]:
        item = copy.deepcopy(graph)
        item["edges"] = [row for row in item["edges"] if row.get("edge_type") != "realized_by_scenario"]
        item["semantic_graph_sha256"] = graph_hash(item)
        return validate_graph(item, surface, research, adequacy, registry)
    def graph_missing_scenario_axis() -> list[str]:
        item = copy.deepcopy(graph)
        scenario = next(row for row in item["nodes"] if row["id"] == "scn-main")
        scenario["payload"]["instance_axes"].pop("data_store")
        scenario["content_sha256"] = node_content_hash(scenario)
        item["closure_assessments"][0]["closure_fingerprint_sha256"] = closure_hash(item["closure_assessments"][0], {row["id"]: row for row in item["nodes"]}, item["bindings"])
        item["semantic_graph_sha256"] = graph_hash(item)
        return schema_findings("graph", item) + validate_graph(item, surface, research, adequacy, registry)
    def structural_fabricated_markdown_section() -> list[str]:
        item = copy.deepcopy(structural)
        item["sections"][0].update({"content_sha256": "0" * 64, "semantic_anchor_sha256": "1" * 64, "heading_or_pointer": "# fabricated"})
        rebuilt = structural_rebuild_hash(item)
        item["completeness"]["primary_rebuild_root_sha256"] = rebuilt
        item["completeness"]["clean_rebuild_root_sha256"] = rebuilt
        return validate_structural(item, fixture_machine_bytes)
    def graph_external_source_without_provenance() -> list[str]:
        item = copy.deepcopy(graph)
        source = next(row for row in item["nodes"] if row["id"] == "src-main")
        source["payload"].update({"portfolio_id": None, "source_card_id": None, "source_card_content_sha256": None, "operation_receipt_ids": []})
        source["content_sha256"] = node_content_hash(source)
        item["closure_assessments"][0]["closure_fingerprint_sha256"] = closure_hash(item["closure_assessments"][0], {row["id"]: row for row in item["nodes"]}, item["bindings"])
        item["semantic_graph_sha256"] = graph_hash(item)
        return schema_findings("graph", item) + validate_graph(item, surface, research, adequacy, registry)
    def graph_specified_required_realization_none() -> list[str]:
        item = copy.deepcopy(graph)
        closure = item["closure_assessments"][0]
        closure["instance_realization"] = "none"
        closure["closure_fingerprint_sha256"] = closure_hash(closure, {row["id"]: row for row in item["nodes"]}, item["bindings"])
        item["semantic_graph_sha256"] = graph_hash(item)
        return validate_graph(item, surface, research, adequacy, registry)
    def result_plan_ready_zero_realization() -> list[str]:
        graph_copy = copy.deepcopy(graph)
        closure = graph_copy["closure_assessments"][0]
        closure["instance_realization"] = "none"
        closure["closure_fingerprint_sha256"] = closure_hash(closure, {row["id"]: row for row in graph_copy["nodes"]}, graph_copy["bindings"])
        graph_copy["semantic_graph_sha256"] = graph_hash(graph_copy)
        challenge_copy = copy.deepcopy(challenge_artifact)
        challenge_copy["target_graph_sha256"] = graph_copy["semantic_graph_sha256"]
        challenge_copy["receipt_payload_sha256"] = challenge_receipt_hash(challenge_copy)
        outcome = copy.deepcopy(result)
        outcome["input_bindings"]["obligation_graph_sha256"] = artifact_hash("obligation-graph", graph_copy)
        outcome["input_bindings"]["fresh_challenge_sha256"] = artifact_hash("challenge-receipt", challenge_copy)
        outcome["fresh_challenge_receipt"]["target_graph_sha256"] = graph_copy["semantic_graph_sha256"]
        row = outcome["obligation_metric_rows"][0]
        row.update({"realization_credit": 0, "is_gap": True})
        outcome["metrics"]["named_scenario_realization"].update({"earned_weight": 0.0, "possible_weight": 5.0, "ratio": 0.0, "raw_uncovered_ids": ["obl-main"]})
        outcome["metrics"]["disposition_completeness"] = {"numerator": 1, "denominator": 1, "ratio": 1.0, "zero_denominator_rule": "invalid_metric", "numerator_ids": ["obl-main"], "denominator_ids": ["obl-main"]}
        outcome["critical_misses"] = [{"miss_id": "miss.realization", "obligation_id": "obl-main", "primary_loss_stage": "named_realization", "consequence": "missing realization", "status": "specified"}]
        outcome["metrics"]["critical_miss_summary"] = {"count": 1, "weight": 5, "ids": ["miss.realization"]}
        return validate_result(outcome, contract, graph_copy, surface, research, adequacy, registry, challenge_copy)
    def challenge_empty_coverage() -> list[str]:
        item = copy.deepcopy(challenge_artifact)
        item["covered_control_ids"] = []
        item["receipt_payload_sha256"] = challenge_receipt_hash(item)
        return validate_challenge_receipt(item, graph, surface, registry)
    def summary_missing_gate_evidence() -> list[str]:
        item = copy.deepcopy(summary)
        results_copy = copy.deepcopy(campaign_results)
        results_copy[0]["gates"][0]["evidence_refs"] = ["families/missing/GATE.json"]
        item["family_result_bindings"] = [{"family_id": row["family_id"], "result_ref": f"families/{row['family_id']}/ASSURANCE_RESULT.json", "result_sha256": artifact_hash("assurance-result", row)} for row in results_copy]
        return validate_summary(item, results_copy, contract, source_snapshot)
    def trusted_capability_offline_forgery() -> list[str]:
        return validate_trusted_capability(copy.deepcopy(trusted_capability_fixture), launch_request_fixture)
    def trusted_capability_sender_mismatch() -> list[str]:
        return validate_trusted_capability(copy.deepcopy(trusted_capability_fixture), launch_request_fixture, "/root/not-authority", "/root/controller")
    def launch_request_self_authority() -> list[str]:
        item = copy.deepcopy(launch_request_fixture)
        item["expected_authority_task_path"] = item["requesting_task_path"]
        item["launch_binding_sha256"] = launch_request_binding(item)
        return validate_launch_request(item, contract)
    def graph_mutation(mutator: Callable[[dict[str, Any]], None]) -> list[str]:
        item = copy.deepcopy(graph)
        mutator(item)
        for graph_node in item.get("nodes", []):
            graph_node["content_sha256"] = node_content_hash(graph_node)
        item["closure_assessments"][0]["closure_fingerprint_sha256"] = closure_hash(item["closure_assessments"][0], {row["id"]: row for row in item["nodes"]}, item["bindings"])
        item["semantic_graph_sha256"] = graph_hash(item)
        return schema_findings("graph", item) + validate_graph(item, surface, research, adequacy, registry)
    def research_card_slice_drift() -> list[str]:
        item = copy.deepcopy(research)
        card = item["source_cards"][0]
        card.update({"bounded_claim": "Invented failure", "content_sha256": "f" * 64, "evidence_slice_sha256": "f" * 64, "locator": "bytes:0-1"})
        item["portfolio_payload_sha256"] = research_portfolio_hash(item)
        return validate_research_portfolio(item, surface, capture_payloads)
    def adequacy_missing_official() -> list[str]:
        item = copy.deepcopy(research)
        item["source_cards"] = [row for row in item["source_cards"] if row["source_card_id"] != "card.official"]
        item["operation_receipts"][1]["source_card_ids"] = [row for row in item["operation_receipts"][1]["source_card_ids"] if row != "card.official"]
        item["portfolio_payload_sha256"] = research_portfolio_hash(item)
        receipt = copy.deepcopy(adequacy)
        for row in receipt["trigger_evaluations"]: row["evidence_refs"] = [ref for ref in row["evidence_refs"] if ref != "card.official"]
        receipt["open_portfolio_sha256"] = artifact_hash("research-portfolio", item)
        receipt["receipt_payload_sha256"] = research_adequacy_hash(receipt)
        return validate_research_adequacy(receipt, item, result["worker_receipts"], surface)
    def adequacy_weak_alternative() -> list[str]:
        item = copy.deepcopy(research)
        next(row for row in item["source_cards"] if row["source_card_id"] == "card.comparator")["entailment"] = "none"
        item["portfolio_payload_sha256"] = research_portfolio_hash(item)
        receipt = copy.deepcopy(adequacy); receipt["open_portfolio_sha256"] = artifact_hash("research-portfolio", item); receipt["receipt_payload_sha256"] = research_adequacy_hash(receipt)
        return validate_research_adequacy(receipt, item, result["worker_receipts"], surface)
    def adequacy_named_surfaces_only_comparator() -> list[str]:
        item = copy.deepcopy(research)
        for card in item["source_cards"]:
            if card["source_card_id"] != "card.comparator": card["named_surface_ids"] = []
        item["portfolio_payload_sha256"] = research_portfolio_hash(item)
        receipt = copy.deepcopy(adequacy); receipt["open_portfolio_sha256"] = artifact_hash("research-portfolio", item); receipt["receipt_payload_sha256"] = research_adequacy_hash(receipt)
        return validate_research_adequacy(receipt, item, result["worker_receipts"], surface)
    def adequacy_missing_platform_evidence() -> list[str]:
        item = copy.deepcopy(research); next(row for row in item["source_cards"] if row["source_card_id"] == "card.official")["evidence_roles"] = ["normative_constraint"]; item["portfolio_payload_sha256"] = research_portfolio_hash(item)
        receipt = copy.deepcopy(adequacy); receipt["open_portfolio_sha256"] = artifact_hash("research-portfolio", item); receipt["receipt_payload_sha256"] = research_adequacy_hash(receipt)
        return validate_research_adequacy(receipt, item, result["worker_receipts"], surface)
    def resource_stage_drift() -> list[str]:
        outcome = copy.deepcopy(result); row = outcome["resource_receipts"][0]; row["stage_id"] = "S7_TARGETED_CLOSURE"; row["activity_binding_sha256"] = resource_activity_binding(row)
        return validate_result(outcome, contract, graph, surface, research, adequacy, registry, challenge_artifact, capture_payloads)
    def resource_unknown_pass() -> list[str]:
        outcome = copy.deepcopy(result); row = outcome["resource_receipts"][0]; row["pass_id"] = "not-a-pass"; row["activity_binding_sha256"] = resource_activity_binding(row)
        return validate_result(outcome, contract, graph, surface, research, adequacy, registry, challenge_artifact, capture_payloads)
    def resource_wall_drift() -> list[str]:
        outcome = copy.deepcopy(result); outcome["resource_receipts"][0]["wall_ms"] += 1
        return validate_result(outcome, contract, graph, surface, research, adequacy, registry, challenge_artifact, capture_payloads)
    def required_control_na() -> list[str]:
        outcome = copy.deepcopy(result); control = outcome["controls"][0]; control["terminal"] = "NOT_APPLICABLE"; outcome["metrics"]["control_summary"]["positive_pass"] -= 1
        return validate_result(outcome, contract, graph, surface, research, adequacy, registry, challenge_artifact, capture_payloads)
    def required_control_all_components_na() -> list[str]:
        outcome = copy.deepcopy(result); control = outcome["controls"][0]
        for component in control["components"].values(): component.update({"applicability": "not_applicable", "status": "not_applicable"})
        return validate_result(outcome, contract, graph, surface, research, adequacy, registry, challenge_artifact, capture_payloads)
    def control_self_evidenced_by_obligation() -> list[str]:
        outcome = copy.deepcopy(result)
        for control in outcome["controls"]:
            for component in control["components"].values(): component["evidence_refs"] = ["obl-main"]
        return validate_result(outcome, contract, graph, surface, research, adequacy, registry, challenge_artifact, capture_payloads)
    def frozen_control_text_drift() -> list[str]:
        item = copy.deepcopy(registry); row = item["controls"][0]; row.update({"requirement_text": "weakened", "requirement_sha256": hashlib.sha256(b"weakened").hexdigest(), "source_refs": ["fabricated"]}); row["definition_sha256"] = control_definition_hash(row); item["registry_sha256"] = control_registry_hash(item)
        return validate_control_registry(item, surface)
    def challenge_plan_ready_with_finding(disposition: str, disposition_ref: str) -> list[str]:
        challenge_copy = copy.deepcopy(challenge_artifact)
        challenge_copy["findings"] = [{"finding_id": f"finding.{disposition}", "severity": "critical", "category": "fixture", "target_refs": ["obl-main"], "evidence_refs": ["scn-main"], "disposition": disposition, "disposition_ref": disposition_ref}]
        challenge_copy["receipt_payload_sha256"] = challenge_receipt_hash(challenge_copy)
        outcome = copy.deepcopy(result); outcome["input_bindings"]["fresh_challenge_sha256"] = artifact_hash("challenge-receipt", challenge_copy); outcome["fresh_challenge_receipt"]["finding_ids"] = [f"finding.{disposition}"]
        return validate_result(outcome, contract, graph, surface, research, adequacy, registry, challenge_copy, capture_payloads)
    def capability_nonauthorizing_message() -> list[str]:
        capability = copy.deepcopy(trusted_capability_fixture); message = copy.deepcopy(authorization_message_fixture); message["decision"] = "DENY"; capability["authorization_message"] = message; capability["authorization_message_sha256"] = authorization_message_hash(message); capability["capability_payload_sha256"] = trusted_capability_payload_hash(capability)
        return schema_findings("trusted_capability", capability) + validate_trusted_capability(capability, launch_request_fixture, "/root", "/root/controller", message, "message.fixture", "turn.fixture", "2026-07-16T00:00:02Z", "2026-07-16T00:00:03Z")
    def capability_expired_observation() -> list[str]:
        capability = copy.deepcopy(trusted_capability_fixture); capability["consumed_at_utc"] = "2026-07-16T02:00:00Z"; capability["capability_payload_sha256"] = trusted_capability_payload_hash(capability)
        return validate_trusted_capability(capability, launch_request_fixture, "/root", "/root/controller", authorization_message_fixture, "message.fixture", "turn.fixture", "2026-07-16T00:00:02Z", "2026-07-16T02:00:00Z")
    def challenge_reused_discovery_resource() -> list[str]:
        receipt = copy.deepcopy(result["resource_receipts"][0]); receipt["context_id"] = "ctx.migration.local"; receipt["activity_binding_sha256"] = resource_activity_binding(receipt)
        artifact = copy.deepcopy(challenge_resource_artifact); artifact["challenge_resource_receipt_id"] = receipt["receipt_id"]; artifact["challenge_resource_receipt_sha256"] = artifact_hash("resource-receipt", receipt); artifact["receipt_payload_sha256"] = challenge_receipt_hash(artifact)
        return validate_cross_family_challenge_resource(artifact, result, {"resource_receipts": [receipt]})
    def duplicate_targeted_pass_false_streak() -> list[str]:
        outcome = copy.deepcopy(result)
        outcome["resource_receipts"] = [row for row in outcome["resource_receipts"] if row["receipt_id"] != "res.4"]
        closure_resource = next(row for row in outcome["resource_receipts"] if row["receipt_id"] == "res.3")
        closure_resource.update({"input_tokens": 0, "cached_input_tokens": 0, "visible_output_tokens": 0, "reasoning_output_tokens": 0, "derived_total_tokens": 0, "effective_total_tokens": 0, "active_ms": 0})
        closure_resource["activity_binding_sha256"] = resource_activity_binding(closure_resource)
        outcome["passes"][0].update({"all_reported_tokens": 250, "active_ms": 20})
        outcome["passes"][1].update({"all_reported_tokens": 0, "active_ms": 0})
        outcome["passes"][2].update({"pass_id": "p1", "all_reported_tokens": 0, "active_ms": 0})
        outcome["metrics"]["cost_latency"].update({"all_reported_tokens": 250, "active_ms": 20, "wall_ms": 2000})
        outcome["family_accounting"].update({"finished_at_utc": "2026-07-16T00:00:02Z", "elapsed_ms": 2000, "input_tokens": 200, "output_tokens": 50, "all_reported_tokens": 250, "targeted_followups": 1, "closure_cycles": 1})
        return validate_result(outcome, contract, graph, surface, research, adequacy, registry, challenge_artifact, capture_payloads)
    def adequacy_recovery_top_level_gap_false_pass() -> list[str]:
        open_portfolio = copy.deepcopy(research)
        next(row for row in open_portfolio["source_cards"] if row["source_card_id"] == "card.issue")["entailment"] = "none"
        open_portfolio["portfolio_payload_sha256"] = research_portfolio_hash(open_portfolio)
        truth = derive_research_trigger_truth("R3", PILOTS[0], open_portfolio["source_cards"], surface, open_portfolio["unsearched_areas"])
        receipt = copy.deepcopy(adequacy)
        receipt["open_portfolio_sha256"] = artifact_hash("research-portfolio", open_portfolio)
        for trigger in receipt["trigger_evaluations"]:
            trigger["state"] = "true" if truth[trigger["trigger_id"]] else "false"
        true_ids = {trigger_id for trigger_id, state in truth.items() if state}
        failure_portfolio = copy.deepcopy(research)
        failure_portfolio.update({"portfolio_id": "research.failure.fixture", "portfolio_kind": "failure_recovery", "worker_context_id": "ctx.failure"})
        for operation in failure_portfolio["operation_receipts"]:
            operation["worker_context_id"] = "ctx.failure"
        failure_portfolio["portfolio_payload_sha256"] = research_portfolio_hash(failure_portfolio)
        failure_ref = "families/USAGE_ACCOUNTING_TRUTH/RESEARCH_PORTFOLIO_FAILURE.json"
        failure_hash = artifact_hash("research-portfolio", failure_portfolio)
        workers = copy.deepcopy(result["worker_receipts"])
        workers.append({"worker_role": "FAILURE_EVIDENCE_RESEARCHER", "context_id": "ctx.failure", "terminal": "DONE", "artifact_bindings": [{"artifact_type": "RESEARCH_PORTFOLIO_FAILURE", "ref": failure_ref, "sha256": failure_hash, "schema_id": failure_portfolio["schema_id"], "producer_context_id": "ctx.failure", "family_id": PILOTS[0], "trial_id": "trial.fixture", "generation_id": "generation.fixture", "canonical_bytes": True}]})
        receipt["recovery"] = {"required": True, "reason_trigger_ids": sorted(true_ids), "worker_context_id": "ctx.failure", "worker_terminal": "DONE", "failure_portfolio_ref": failure_ref, "failure_portfolio_sha256": failure_hash, "remaining_gap_ids": [], "unavailable_reason": None}
        receipt.update({"unresolved_adequacy_gap_ids": ["gap.still-open"], "final_state": "sufficient", "terminal": "PASS"})
        receipt["receipt_payload_sha256"] = research_adequacy_hash(receipt)
        return validate_research_adequacy(receipt, open_portfolio, workers, surface, failure_portfolio)
    def control_fail_empty_obligations_method_ready() -> list[str]:
        graph_copy = copy.deepcopy(graph)
        graph_copy["nodes"].append(node("unc-gap", "Uncertainty", {"statement": "Control gap", "severity": "major", "blocking": True, "owner": "controller", "resolution_route": "specify", "evidence_needed": "named obligation"}))
        graph_copy["edges"].append({"edge_id": "edge-control-gap", "edge_type": "depends_on", "from_id": "scn-main", "to_id": "unc-gap", "state": "confirmed", "scope": "control", "authority_refs": [], "evidence_refs": [], "currentness": "current"})
        graph_copy["semantic_graph_sha256"] = graph_hash(graph_copy)
        challenge_copy = copy.deepcopy(challenge_artifact)
        challenge_copy["target_graph_sha256"] = graph_copy["semantic_graph_sha256"]
        challenge_copy["receipt_payload_sha256"] = challenge_receipt_hash(challenge_copy)
        outcome = copy.deepcopy(result)
        outcome["input_bindings"]["obligation_graph_sha256"] = artifact_hash("obligation-graph", graph_copy)
        outcome["input_bindings"]["fresh_challenge_sha256"] = artifact_hash("challenge-receipt", challenge_copy)
        outcome["fresh_challenge_receipt"]["target_graph_sha256"] = graph_copy["semantic_graph_sha256"]
        control = outcome["controls"][0]
        control.update({"terminal": "FAIL", "obligation_ids": []})
        control["components"]["discretion"].update({"status": "partial", "evidence_refs": [], "gap_refs": ["unc-gap"]})
        outcome["metrics"]["control_summary"]["positive_pass"] -= 1
        outcome["plan_slice_status"] = "PLAN_SLICE_NOT_READY_GAPS_FOUND"
        next(row for row in outcome["gates"] if row["gate_id"] == "P2_PLAN_NAMED_REALIZATION")["terminal"] = "FAIL"
        return schema_findings("graph", graph_copy) + schema_findings("result", outcome) + validate_graph(graph_copy, surface, research, adequacy, registry) + validate_challenge_receipt(challenge_copy, graph_copy, surface, registry) + validate_result(outcome, contract, graph_copy, surface, research, adequacy, registry, challenge_copy, capture_payloads)
    def retry_changes_semantic_activity() -> list[str]:
        outcome = copy.deepcopy(result)
        base = next(row for row in outcome["resource_receipts"] if row["receipt_id"] == "res.3")
        base["failure_class"] = "infrastructure"
        retry = copy.deepcopy(base)
        retry.update({"receipt_id": "res.3.retry", "attempt_ordinal": 2, "retry_kind": "infrastructure", "prior_attempt_receipt_id": "res.3", "retries": 1, "activity_kind": "local_expectation", "role_id": "LOCAL_EXPECTATION_MODELER", "stage_id": "S3_INDEPENDENT_DISCOVERY", "pass_id": "p0", "failure_class": None})
        retry["activity_binding_sha256"] = resource_activity_binding(retry)
        outcome["resource_receipts"].append(retry)
        outcome["passes"][0].update({"all_reported_tokens": 260, "active_ms": 25})
        outcome["metrics"]["cost_latency"].update({"all_reported_tokens": 280, "active_ms": 35})
        outcome["family_accounting"].update({"input_tokens": 215, "output_tokens": 65, "all_reported_tokens": 280, "infrastructure_retries": 1})
        return validate_result(outcome, contract, graph, surface, research, adequacy, registry, challenge_artifact, capture_payloads)
    def research_material_surprises_not_followed() -> list[str]:
        item = copy.deepcopy(research)
        item["creative_exploration"]["followed_material_surprises"] = False
        item["portfolio_payload_sha256"] = research_portfolio_hash(item)
        receipt = copy.deepcopy(adequacy)
        receipt["open_portfolio_sha256"] = artifact_hash("research-portfolio", item)
        receipt["receipt_payload_sha256"] = research_adequacy_hash(receipt)
        return schema_findings("research", item) + validate_research_portfolio(item, surface, capture_payloads) + validate_research_adequacy(receipt, item, result["worker_receipts"], surface)
    def duplicated_seam_pass_false_saturation() -> list[str]:
        item = copy.deepcopy(summary)
        first = copy.deepcopy(item["cross_family_seam_passes"][0])
        second = copy.deepcopy(first)
        second["clean_streak_after"] = 2
        item["cross_family_seam_passes"] = [first, second]
        return schema_findings("summary", item) + validate_summary(item, campaign_results, contract, source_snapshot)
    def failed_seam_resource_false_saturation() -> list[str]:
        item = copy.deepcopy(summary)
        item["controller_resource_receipts"][0]["failure_class"] = "infrastructure"
        item["controller_resource_receipts"][0]["activity_binding_sha256"] = resource_activity_binding(item["controller_resource_receipts"][0])
        return schema_findings("summary", item) + validate_summary(item, campaign_results, contract, source_snapshot)
    def failed_final_pass_attempt_false_clean() -> list[str]:
        outcome = copy.deepcopy(result)
        next(row for row in outcome["resource_receipts"] if row["receipt_id"] == "res.4")["failure_class"] = "semantic"
        return validate_result(outcome, contract, graph, surface, research, adequacy, registry, challenge_artifact, capture_payloads)
    def unobservable_seam_tokens_false_ready() -> list[str]:
        item = copy.deepcopy(summary)
        resource = item["controller_resource_receipts"][0]
        for key in ("input_tokens", "visible_output_tokens", "reasoning_output_tokens", "output_includes_reasoning", "native_total_tokens", "effective_total_tokens"):
            resource[key] = None
        resource["effective_total_source"] = "unavailable"
        resource["activity_binding_sha256"] = resource_activity_binding(resource)
        return schema_findings("summary", item) + validate_summary(item, campaign_results, contract, source_snapshot)
    def control_scenario_backlink_missing() -> list[str]:
        graph_copy = copy.deepcopy(graph)
        scenario = next(row for row in graph_copy["nodes"] if row["id"] == "scn-main")
        scenario["payload"]["control_registry_ids"] = scenario["payload"]["control_registry_ids"][1:]
        scenario["content_sha256"] = node_content_hash(scenario)
        graph_copy["closure_assessments"][0]["closure_fingerprint_sha256"] = closure_hash(graph_copy["closure_assessments"][0], {row["id"]: row for row in graph_copy["nodes"]}, graph_copy["bindings"])
        graph_copy["semantic_graph_sha256"] = graph_hash(graph_copy)
        challenge_copy = copy.deepcopy(challenge_artifact)
        challenge_copy["target_graph_sha256"] = graph_copy["semantic_graph_sha256"]
        challenge_copy["receipt_payload_sha256"] = challenge_receipt_hash(challenge_copy)
        outcome = copy.deepcopy(result)
        outcome["input_bindings"]["obligation_graph_sha256"] = artifact_hash("obligation-graph", graph_copy)
        outcome["input_bindings"]["fresh_challenge_sha256"] = artifact_hash("challenge-receipt", challenge_copy)
        outcome["fresh_challenge_receipt"]["target_graph_sha256"] = graph_copy["semantic_graph_sha256"]
        return validate_result(outcome, contract, graph_copy, surface, research, adequacy, registry, challenge_copy, capture_payloads)
    mutations.extend([
        ("structural_unknown_role", lambda: validate_structural(mutate(structural, ["population", 0, "artifact_role"], "unknown"), fixture_machine_bytes)),
        ("structural_authoritative_population_omission", omitted_machine),
        ("structural_invalidation_without_propagation", invalidation_without_propagation),
        ("structural_arbitrary_rebuild_hash", lambda: validate_structural(mutate(structural, ["completeness", "primary_rebuild_root_sha256"], "0" * 64), fixture_machine_bytes)),
        ("structural_false_pass_empty_docs", lambda: validate_structural(mutate(structural, ["documents"], []), fixture_machine_bytes)),
        ("structural_machine_unmapped", lambda: validate_structural(mutate(structural, ["machine_nodes"], []), fixture_machine_bytes)),
        ("structural_population_hash", lambda: validate_structural(mutate(structural, ["snapshot", "population_sha256"], "0" * 64), fixture_machine_bytes)),
        ("surface_template_denominator", lambda: validate_surface(mutate(surface, ["instances", 0, "instance_role"], "contract_template"), structural)),
        ("surface_unfrozen", lambda: validate_surface(mutate(surface, ["denominator_sets", 0, "frozen_before_scoring"], False), structural)),
        ("surface_bad_source_binding", bad_surface_source),
        ("surface_empty_denominator", lambda: validate_surface(mutate(surface, ["denominator_sets", 0, "member_instance_ids"], []), structural)),
        ("surface_retired_member", lambda: validate_surface(mutate(surface, ["instances", 0, "lifecycle"], "retired"), structural)),
        ("surface_null_kind_contract", lambda: validate_surface(mutate(surface, ["instances", 0, "kind_contract", "execution_role"], None), structural)),
        ("surface_empty_obligations", lambda: validate_surface(mutate(surface, ["instances", 0, "obligation_ids"], []), structural)),
        ("surface_duplicate_canonical_identity", duplicate_canonical_identity),
        ("surface_supersedes_cycle", supersedes_cycle),
        ("graph_empty_false_pass", lambda: validate_graph(mutate(graph, ["nodes"], []), surface)),
        ("graph_unfrozen_denominator", lambda: validate_graph(mutate(graph, ["bindings", "denominator_frozen_before_plan_comparison"], False), surface)),
        ("graph_claim_without_contribution", lambda: validate_graph(mutate(graph, ["edges", 0, "state"], "rejected"), surface)),
        ("graph_unsafe_closure", lambda: validate_graph(mutate(graph, ["closure_assessments", 0, "semantic_state"], "partial"), surface)),
        ("graph_retrieval_embedded", lambda: validate_graph({**copy.deepcopy(graph), "retrieval_diagnostics": []}, surface)),
        ("graph_missing_oracle_ref", graph_missing_oracle),
        ("graph_wrong_authority_basis_type", graph_wrong_basis_type),
        ("graph_node_content_hash", lambda: validate_graph(mutate(graph, ["nodes", 0, "content_sha256"], "0" * 64), surface)),
        ("graph_closure_component_drift", lambda: validate_graph(mutate(graph, ["nodes", 1, "content_sha256"], "0" * 64), surface)),
        ("graph_nested_retrieval", graph_nested_retrieval),
        ("result_residual_credit", lambda: validate_result(mutate(result, ["obligation_metric_rows", 0, "disposition"], "residual_risk_accepted"), contract, graph)),
        ("result_null_token_pass", lambda: validate_result(mutate(result, ["resource_receipts", 0, "effective_total_tokens"], None), contract, graph)),
        ("result_failed_method_gate_ready", lambda: validate_result(mutate(result, ["gates", 0, "terminal"], "FAIL"), contract, graph)),
        ("result_clean_pass_with_addition", lambda: validate_result(mutate(result, ["passes", 1, "added_critical_or_major_ids"], ["obl-new"]), contract, graph)),
        ("result_plan_ready_with_open_miss", lambda: validate_result({**copy.deepcopy(result), "critical_misses": [{"miss_id": "miss.1", "obligation_id": "obl-main", "primary_loss_stage": "discovery", "consequence": "gap", "status": "open"}]}, contract, graph)),
        ("result_research_limited_ready", lambda: validate_result(mutate(result, ["terminal"], "RESEARCH_LIMITED"), contract, graph)),
        ("result_empty_resources", lambda: validate_result(mutate(result, ["resource_receipts"], []), contract, graph)),
        ("result_empty_workers", lambda: validate_result(mutate(result, ["worker_receipts"], []), contract, graph)),
        ("result_wall_fuse", wall_false_ready),
        ("result_graph_binding", lambda: validate_result(mutate(result, ["input_bindings", "obligation_graph_sha256"], "0" * 64), contract, graph)),
        ("result_accessibility_scale_leak", lambda: validate_result({**copy.deepcopy(result), "family_id": PILOTS[2]}, contract, graph)),
        ("summary_missing_family", lambda: validate_summary(summary, campaign_results[:3], contract, source_snapshot)),
        ("summary_calibration_leak", lambda: validate_summary(mutate(summary, ["calibration_reporting", "accessibility_counted_in_scale_inference"], True), campaign_results, contract, source_snapshot)),
        ("summary_missing_seam_saturation", lambda: validate_summary(mutate(summary, ["cross_family_seam_passes"], []), campaign_results, contract, source_snapshot)),
        ("structural_source_population_mismatch", lambda: validate_structural_source_binding(structural, mutate(source_snapshot, ["entries", 1, "sha256"], "0" * 64))),
        ("structural_fabricated_markdown_section", structural_fabricated_markdown_section),
        ("structural_fabricated_machine_pointer", fabricated_machine_pointer),
        ("structural_spoofed_initial_invalidation", spoofed_invalidation),
        ("surface_wrong_fragment", surface_wrong_fragment),
        ("surface_wrong_semantic_hash", surface_wrong_semantic),
        ("surface_wrong_owner_plan_unit", surface_wrong_owner_unit),
        ("surface_capability_drift", surface_capability_drift),
        ("surface_invalidation_dependency_drift", surface_invalidation_dependency_drift),
        ("surface_alias_canonical_collision", surface_alias_collision),
        ("surface_source_manifest_drift", lambda: validate_surface(mutate(surface, ["snapshot", "source_manifest_sha256"], "0" * 64), structural)),
        ("surface_empty_kind_contract_collections", lambda: validate_surface(mutate(surface, ["instances", 0, "kind_contract"], {"actor_kind": [], "execution_role": [], "authority_scope": []}), structural)),
        ("graph_template_substitution", graph_template_substitution),
        ("graph_open_false_plan_ready", graph_open_false_plan_ready),
        ("graph_obligation_semantic_drift", graph_obligation_semantic_drift),
        ("result_worker_not_done", lambda: validate_result(mutate(result, ["worker_receipts", 0, "terminal"], "STOPPED"), contract, graph)),
        ("result_two_infrastructure_retries", result_two_infrastructure_retries),
        ("result_research_without_operations", result_research_without_operations),
        ("result_worker_total_fuse", result_worker_total_fuse),
        ("result_worker_input_fuse", result_worker_input_fuse),
        ("result_worker_output_fuse", result_worker_output_fuse),
        ("result_duplicate_base_attempt", result_duplicate_base_attempt),
        ("result_arbitrary_research_hash", result_arbitrary_research_hash),
        ("result_wrong_role_research_artifact", result_wrong_role_research_artifact),
        ("adequacy_r3_missing_recovery_worker", adequacy_missing_r3_recovery),
        ("graph_evidence_required_not_required", graph_evidence_required_not_required),
        ("graph_adequate_empty_evidence", graph_adequate_empty_evidence),
        ("result_reported_operations_without_receipts", result_reported_operations_without_receipts),
        ("research_source_card_without_read", research_source_without_read),
        ("result_empty_control_population", result_empty_control_population),
        ("result_control_false_full", result_control_false_full),
        ("result_control_empty_instances", result_control_empty_instances),
        ("graph_thin_scenario", graph_thin_scenario),
        ("graph_missing_realization_edge", graph_missing_realization_edge),
        ("graph_missing_scenario_axis", graph_missing_scenario_axis),
        ("graph_external_source_without_provenance", graph_external_source_without_provenance),
        ("graph_specified_required_realization_none", graph_specified_required_realization_none),
        ("result_plan_ready_zero_realization", result_plan_ready_zero_realization),
        ("challenge_empty_coverage", challenge_empty_coverage),
        ("summary_missing_gate_evidence", summary_missing_gate_evidence),
        ("summary_global_context_reuse", summary_shared_contexts),
        ("protected_blob_identity_drift", lambda: validate_protected_state(mutate(protected_fixture, ["git_state", "index_entries_z", "sha256"], "0" * 64), "BEFORE", source_snapshot, summary["contract_sha256"])),
        ("launch_request_binding_drift", lambda: validate_launch_request(mutate(launch_request_fixture, ["run_root"], "/different/root"), contract)),
        ("launch_request_self_authority", launch_request_self_authority),
        ("trusted_capability_offline_forgery", trusted_capability_offline_forgery),
        ("trusted_capability_sender_mismatch", trusted_capability_sender_mismatch),
        ("trusted_capability_scope_drift", lambda: validate_trusted_capability(mutate(trusted_capability_fixture, ["approved_launch_binding_sha256"], "0" * 64), launch_request_fixture)),
        ("trusted_capability_nonauthorizing_message", capability_nonauthorizing_message),
        ("trusted_capability_expired_observation", capability_expired_observation),
        ("trusted_capability_turn_replay", lambda: validate_trusted_capability(trusted_capability_fixture, launch_request_fixture, "/root", "/root/controller", authorization_message_fixture, "message.fixture", "different-turn", "2026-07-16T00:00:02Z", "2026-07-16T00:00:03Z")),
        ("trusted_capability_message_id_replay", lambda: validate_trusted_capability(trusted_capability_fixture, launch_request_fixture, "/root", "/root/controller", authorization_message_fixture, "different-message", "turn.fixture", "2026-07-16T00:00:02Z", "2026-07-16T00:00:03Z")),
        ("research_card_slice_drift", research_card_slice_drift),
        ("adequacy_missing_official", adequacy_missing_official),
        ("adequacy_weak_alternative", adequacy_weak_alternative),
        ("adequacy_named_surfaces_only_comparator", adequacy_named_surfaces_only_comparator),
        ("adequacy_missing_platform_evidence", adequacy_missing_platform_evidence),
        ("resource_stage_drift", resource_stage_drift),
        ("resource_unknown_pass", resource_unknown_pass),
        ("resource_wall_drift", resource_wall_drift),
        ("retry_changes_semantic_activity", retry_changes_semantic_activity),
        ("duplicate_targeted_pass_false_streak", duplicate_targeted_pass_false_streak),
        ("required_control_terminal_na", required_control_na),
        ("required_control_all_components_na", required_control_all_components_na),
        ("control_self_evidenced_by_obligation", control_self_evidenced_by_obligation),
        ("frozen_control_text_drift", frozen_control_text_drift),
        ("frozen_control_applicability_drift", lambda: (lambda item: validate_control_registry(item, surface))((lambda item: (item["controls"][0].update({"applicability": "conditional"}), item["controls"][0].update({"definition_sha256": control_definition_hash(item["controls"][0])}), item.update({"registry_sha256": control_registry_hash(item)}), item)[-1])(copy.deepcopy(registry)))),
        ("graph_missing_recovery_step_ref", lambda: graph_mutation(lambda item: next(row for row in item["nodes"] if row["id"] == "scn-main")["payload"]["failure_cases"][0].update({"recovery_step_ids": ["missing-step"]}))),
        ("graph_missing_failure_terminal_state", lambda: graph_mutation(lambda item: next(row for row in item["nodes"] if row["id"] == "scn-main")["payload"]["failure_cases"][0].update({"terminal_state_id": "missing-state"}))),
        ("graph_unknown_environment_tuple", lambda: graph_mutation(lambda item: next(row for row in item["nodes"] if row["id"] == "scn-main")["payload"].update({"environment_tuple_refs": ["env.missing"]}))),
        ("graph_unknown_transition_state", lambda: graph_mutation(lambda item: next(row for row in item["nodes"] if row["id"] == "scn-main")["payload"]["transition_rules"].update({"allowed": ["surf-state->state.missing"]}))),
        ("graph_step_executes_forbidden_transition", lambda: graph_mutation(lambda item: (next(row for row in item["nodes"] if row["id"] == "scn-main")["payload"]["steps"][0].update({"to_state_ids": ["surf-state-unknown"]}), next(row for row in item["nodes"] if row["id"] == "scn-main")["payload"]["transition_rules"].update({"forbidden": ["surf-state->surf-state-unknown"]})))),
        ("graph_first_step_unreachable_from_initial_state", lambda: graph_mutation(lambda item: (next(row for row in item["nodes"] if row["id"] == "scn-main")["payload"]["steps"][0].update({"from_state_ids": ["surf-state-unknown"], "to_state_ids": ["surf-state"]}), next(row for row in item["nodes"] if row["id"] == "scn-main")["payload"]["transition_rules"].update({"allowed": ["surf-state-unknown->surf-state"], "forbidden": ["surf-state->surf-state-unknown"]})))),
        ("graph_recovery_terminal_mismatch", lambda: graph_mutation(lambda item: next(row for row in item["nodes"] if row["id"] == "scn-main")["payload"]["failure_cases"][0].update({"terminal_state_id": "surf-state-unknown"}))),
        ("graph_transition_overlap", lambda: graph_mutation(lambda item: next(row for row in item["nodes"] if row["id"] == "scn-main")["payload"]["transition_rules"].update({"forbidden": ["surf-state->surf-state"]}))),
        ("graph_missing_control_assertions", lambda: graph_mutation(lambda item: next(row for row in item["nodes"] if row["id"] == "scn-main")["payload"]["builder_discretion"].update({"fixed_semantics": []}))),
        ("control_scenario_backlink_missing", control_scenario_backlink_missing),
        ("control_fail_empty_obligations_method_ready", control_fail_empty_obligations_method_ready),
        ("adequacy_recovery_top_level_gap_false_pass", adequacy_recovery_top_level_gap_false_pass),
        ("bundle_missing_required_recovery_population", lambda: ["BUNDLE:SUMMARY_REQUIRES_COMPLETE_INPUT_SET"] if not complete_summary_research_population(recovery_population_fixture[:-1], recovery_adequacy_fixture) else []),
        ("bundle_extra_recovery_population", lambda: ["BUNDLE:SUMMARY_REQUIRES_COMPLETE_INPUT_SET"] if not complete_summary_research_population(recovery_population_fixture + [{"portfolio_kind": "failure_recovery", "family_id": PILOTS[1]}], recovery_adequacy_fixture) else []),
        ("research_material_surprises_not_followed", research_material_surprises_not_followed),
        ("duplicated_seam_pass_false_saturation", duplicated_seam_pass_false_saturation),
        ("failed_seam_resource_false_saturation", failed_seam_resource_false_saturation),
        ("failed_final_pass_attempt_false_clean", failed_final_pass_attempt_false_clean),
        ("unobservable_seam_tokens_false_ready", unobservable_seam_tokens_false_ready),
        ("challenge_blocked_finding_plan_ready", lambda: challenge_plan_ready_with_finding("blocked", "obl-main")),
        ("challenge_repaired_existing_validation_plan_ready", lambda: challenge_plan_ready_with_finding("repaired", "val-main")),
        ("challenge_reused_discovery_resource", challenge_reused_discovery_resource),
    ])
    mutation_results = {name: bool(run()) for name, run in mutations}
    terminal = "PASS" if all(positives.values()) and all(mutation_results.values()) else "FAIL"
    positive_findings = {}
    if not positives.get("valid_summary"):
        positive_findings["valid_summary"] = validate_summary(summary, campaign_results, contract, source_snapshot)
    return {"schema_version": "1.0.0", "validator": "validate_trial_artifacts.py", "terminal": terminal,
            "positive_tests": positives, "negative_mutations_rejected": mutation_results,
            "positive_count": len(positives), "mutation_count": len(mutation_results), "positive_findings": positive_findings,
            "trial_launched": False, "model_calls": 0, "network_calls": 0}


def load(path: str | None) -> dict[str, Any] | None:
    if path is None: return None
    def closed_object(pairs: list[tuple[str, Any]]) -> dict[str, Any]:
        result: dict[str, Any] = {}
        for key, value in pairs:
            if key in result:
                raise ValueError(f"DUPLICATE_JSON_KEY:{key}")
            result[key] = value
        return result
    return json.loads(Path(path).read_text(encoding="utf-8"), object_pairs_hook=closed_object)


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--self-test", action="store_true")
    parser.add_argument("--source-snapshot")
    parser.add_argument("--source-root")
    parser.add_argument("--structural")
    parser.add_argument("--surface")
    parser.add_argument("--research-capture", action="append", default=[])
    parser.add_argument("--research", action="append", default=[])
    parser.add_argument("--adequacy", action="append", default=[])
    parser.add_argument("--control-registry")
    parser.add_argument("--challenge", action="append", default=[])
    parser.add_argument("--graph", action="append", default=[])
    parser.add_argument("--result", action="append", default=[])
    parser.add_argument("--summary")
    parser.add_argument("--run-root")
    parser.add_argument("--repo-root")
    parser.add_argument("--trusted-launch-capability")
    parser.add_argument("--contract")
    args = parser.parse_args()
    if args.self_test:
        output = run_self_tests(); print(json.dumps(output, sort_keys=True, separators=(",", ":")))
        return 0 if output["terminal"] == "PASS" else 2
    contract = load(args.contract)
    findings: list[str] = []
    source = load(args.source_snapshot); structural = load(args.structural); surface = load(args.surface)
    research_captures = [load(path) or {} for path in args.research_capture]
    research_capture_by_ref = {row.get("capture_ref"): row for row in research_captures}
    researches = [load(path) or {} for path in args.research]
    adequacies = [load(path) or {} for path in args.adequacy]
    registry = load(args.control_registry)
    challenges = [load(path) or {} for path in args.challenge]
    graphs = [load(path) or {} for path in args.graph]
    results = [load(path) or {} for path in args.result]
    summary = load(args.summary)
    requested_graph_families = {row.get("capability_id") for row in graphs}
    requested_result_families = {row.get("family_id") for row in results}
    requested_research_families = {row.get("family_id") for row in researches if row.get("portfolio_kind") == "open_discovery"}
    requested_failure_research_families = {row.get("family_id") for row in researches if row.get("portfolio_kind") == "failure_recovery"}
    requested_adequacy_families = {row.get("family_id") for row in adequacies}
    requested_challenge_families = {row.get("target_family_id") for row in challenges}
    if structural is not None and (source is None or not args.source_root):
        findings.append("BUNDLE:STRUCTURAL_REQUIRES_SOURCE_SNAPSHOT_AND_ROOT")
    if surface is not None and structural is None:
        findings.append("BUNDLE:SURFACE_REQUIRES_STRUCTURAL_MAP")
    if researches and surface is None:
        findings.append("BUNDLE:RESEARCH_REQUIRES_SURFACE_LEDGER")
    required_capture_refs = {operation.get("capture_ref") for research in researches for operation in research.get("operation_receipts", [])}
    if researches and (set(research_capture_by_ref) != required_capture_refs or len(research_capture_by_ref) != len(research_captures)):
        findings.append("BUNDLE:RESEARCH_CAPTURE_POPULATION")
    if adequacies and not requested_adequacy_families <= requested_research_families:
        findings.append("BUNDLE:ADEQUACY_REQUIRES_OPEN_RESEARCH_PORTFOLIO")
    required_failure_families = {row.get("family_id") for row in adequacies if row.get("recovery", {}).get("required") is True}
    if requested_failure_research_families != required_failure_families:
        findings.append("BUNDLE:FAILURE_RESEARCH_POPULATION")
    if graphs and (surface is None or registry is None or not requested_graph_families <= requested_research_families or not requested_graph_families <= requested_adequacy_families):
        findings.append("BUNDLE:GRAPH_REQUIRES_SURFACE_RESEARCH_ADEQUACY_AND_CONTROL_REGISTRY")
    if results and (surface is None or registry is None or not requested_result_families <= requested_graph_families or not requested_result_families <= requested_research_families or not requested_result_families <= requested_adequacy_families or not requested_result_families <= requested_challenge_families):
        findings.append("BUNDLE:RESULT_REQUIRES_COMPLETE_FAMILY_COMPANIONS")
    for kind, value in (("source", source), ("structural", structural), ("surface", surface)):
        if value is not None: findings.extend(schema_findings(kind, value))
    for value in research_captures: findings.extend(schema_findings("research_capture", value))
    if args.run_root:
        run_root_path = Path(args.run_root).resolve()
        for capture_path_text, capture in zip(args.research_capture, research_captures):
            capture_path = Path(capture_path_text)
            expected_path = run_root_path / str(capture.get("capture_ref", ""))
            if capture_path.is_symlink() or not capture_path.is_file() or capture_path.resolve() != expected_path.resolve() or capture_path.read_bytes() != canonical_bytes(capture):
                findings.append(f"BUNDLE:RESEARCH_CAPTURE_FILE_BINDING:{capture.get('operation_id')}")
    for value in researches: findings.extend(schema_findings("research", value))
    for value in adequacies: findings.extend(schema_findings("adequacy", value))
    if registry is not None: findings.extend(schema_findings("control_registry", registry))
    for value in challenges: findings.extend(schema_findings("challenge", value))
    for value in graphs: findings.extend(schema_findings("graph", value))
    for value in results: findings.extend(schema_findings("result", value))
    if summary is not None: findings.extend(schema_findings("summary", summary))
    if source is not None: findings.extend(validate_source_snapshot(source, Path(args.source_root) if args.source_root else None, require_live=summary is not None, excluded_root=Path(args.run_root) if args.run_root else None))
    if structural is not None:
        source_bytes: dict[str, bytes] | None = None
        if args.source_root:
            source_root = Path(args.source_root)
            source_bytes = {
                row.get("path"): (source_root.parent / row.get("path")).read_bytes()
                for row in structural.get("population", [])
                if (source_root.parent / row.get("path", "")).is_file()
            }
        findings.extend(validate_structural(structural, source_bytes))
        if source is not None: findings.extend(validate_structural_source_binding(structural, source))
    if surface is not None: findings.extend(validate_surface(surface, structural))
    research_by_family = {row.get("family_id"): row for row in researches if row.get("portfolio_kind") == "open_discovery"}
    failure_research_by_family = {row.get("family_id"): row for row in researches if row.get("portfolio_kind") == "failure_recovery"}
    adequacy_by_family = {row.get("family_id"): row for row in adequacies}
    challenge_by_family = {row.get("target_family_id"): row for row in challenges}
    result_by_family = {row.get("family_id"): row for row in results}
    if registry is not None: findings.extend(validate_control_registry(registry, surface))
    for research in researches:
        family_captures = {operation.get("capture_ref"): research_capture_by_ref.get(operation.get("capture_ref")) for operation in research.get("operation_receipts", [])}
        findings.extend(validate_research_portfolio(research, surface, family_captures))
    for adequacy in adequacies:
        workers = result_by_family.get(adequacy.get("family_id"), {}).get("worker_receipts", [])
        findings.extend(validate_research_adequacy(adequacy, research_by_family.get(adequacy.get("family_id")), workers, surface, failure_research_by_family.get(adequacy.get("family_id"))))
    for graph in graphs:
        family = graph.get("capability_id")
        findings.extend(validate_graph(graph, surface, research_by_family.get(family), adequacy_by_family.get(family), registry))
        if structural is not None:
            probe = Findings("GRAPH_CROSS")
            probe.need(graph.get("trial_id") == structural.get("trial_id"), "TRIAL_ID_MISMATCH")
            probe.need(graph.get("bindings", {}).get("structural_map_sha256") == artifact_hash("structural-map", structural), "STRUCTURAL_BINDING")
            findings.extend(probe.codes)
    graph_by_family = {graph.get("capability_id"): graph for graph in graphs}
    for challenge in challenges:
        family = challenge.get("target_family_id")
        findings.extend(validate_challenge_receipt(challenge, graph_by_family.get(family), surface, registry))
    for result in results:
        family = result.get("family_id")
        family_research = research_by_family.get(family)
        family_captures = {operation.get("capture_ref"): research_capture_by_ref.get(operation.get("capture_ref")) for operation in (family_research or {}).get("operation_receipts", [])}
        findings.extend(validate_result(result, contract, graph_by_family.get(family), surface, family_research, adequacy_by_family.get(family), registry, challenge_by_family.get(family), family_captures, failure_research_by_family.get(family)))
    if summary is not None:
        required = (contract is not None and source is not None and structural is not None and surface is not None and complete_summary_research_population(researches, adequacies) and len(adequacies) == 4 and set(requested_adequacy_families) == set(PILOTS) and registry is not None and len(challenges) == 4 and set(requested_challenge_families) == set(PILOTS) and len(graphs) == 4 and set(requested_graph_families) == set(PILOTS) and len(results) == 4 and set(requested_result_families) == set(PILOTS) and args.run_root and args.source_root and args.repo_root and args.trusted_launch_capability)
        if not required:
            findings.append("BUNDLE:SUMMARY_REQUIRES_COMPLETE_INPUT_SET")
        else:
            contract_sha = hashlib.sha256(Path(args.contract).read_bytes()).hexdigest()
            findings.extend(validate_summary(summary, results, contract, source, Path(args.run_root), contract_sha, Path(args.repo_root), Path(args.trusted_launch_capability), researches, adequacies, registry, challenges, surface))
        # The command-line interface has only caller-provided files and paths.
        # It cannot observe the platform-owned collaboration message, sender,
        # turn, or consumption time that authorizes a live launch. A complete
        # offline bundle may pass artifact validation, but it must never be
        # represented as live launch authority.
        findings.append("AUTHORITY:TRIAL_BLOCKED:UNVERIFIABLE_AUTHORITY_LINEAGE")
    authority_blocked = "AUTHORITY:TRIAL_BLOCKED:UNVERIFIABLE_AUTHORITY_LINEAGE" in findings
    output = {"schema_version": "1.0.0", "validator": "validate_trial_artifacts.py",
              "terminal": "TRIAL_BLOCKED" if authority_blocked else ("PASS" if not findings else "FAIL"), "findings": sorted(set(findings)),
              "artifact_terminal": "PASS" if not [row for row in findings if not row.startswith("AUTHORITY:")] else "FAIL",
              "authority_terminal": "TRIAL_BLOCKED:UNVERIFIABLE_AUTHORITY_LINEAGE" if authority_blocked else "NOT_EVALUATED",
              "artifact_count": int(source is not None) + int(structural is not None) + int(surface is not None) + len(research_captures) + len(researches) + len(adequacies) + int(registry is not None) + len(challenges) + len(graphs) + len(results) + int(summary is not None),
              "trial_launched": False, "model_calls": 0, "network_calls": 0}
    print(json.dumps(output, sort_keys=True, separators=(",", ":")))
    return 3 if authority_blocked else (0 if not findings else 2)


if __name__ == "__main__":
    sys.exit(main())
