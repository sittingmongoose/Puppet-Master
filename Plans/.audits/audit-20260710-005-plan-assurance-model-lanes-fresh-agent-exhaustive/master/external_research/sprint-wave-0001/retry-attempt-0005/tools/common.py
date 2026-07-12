#!/usr/bin/env python3
"""Shared fail-closed contracts for Audit 005 external-research attempt-0005."""

from __future__ import annotations

import hashlib
import json
import re
from pathlib import Path
from typing import Any
from urllib.parse import urlsplit

ROOT = Path(__file__).resolve().parents[5]
NAMESPACE = Path(__file__).resolve().parents[1]
OUTPUT_ROOT = ROOT / "external_research_v1"
ATTEMPT4 = ROOT / "master/external_research/sprint-wave-0001/retry-attempt-0004"
ATTEMPT3 = ROOT / "master/external_research/sprint-wave-0001/retry-attempt-0003"
ATTEMPT2 = ROOT / "master/external_research/sprint-wave-0001/retry-attempt-0002"

AUDIT_ID = "audit-20260710-005-plan-assurance-model-lanes-fresh-agent-exhaustive"
SPRINT_ID = "sprint-wave-0001"
RETRY_NAMESPACE = "retry-attempt-0005"
ATTEMPT_ID = "attempt-0005"
CONTROLLER_THREAD_ID = "019f5078-6501-7223-b52f-2251010bdc41"
MODEL = "gpt-5.6-luna"
REASONING_EFFORT = "max"
RECOVERY_IDS = ["ER-0003", "ER-0008"]
FLOOR_IDS = ["ER-0002", "ER-0001", "ER-0004", "ER-0005", "ER-0006", "ER-0007"]
FLOOR_DIGEST = "111135d1d44849d95577071398351634e899cf0689340919c6b855c239e859b6"
V6_REF = "master/coordination/CONCURRENCY_POLICY_V6.json"
V6_SHA256 = "0028914f69fdf97ac639b91166b1a53aef10284f8be0938bc2a2d817b00fc5e0"
ATTEMPT4_FAILURE_REF = "master/external_research/sprint-wave-0001/retry-attempt-0004/validation/attempt-0004-failure-lineage.json"
ATTEMPT4_FAILURE_SHA256 = "87ef882450567912176fb9248ed04b365a6354a0f6b2835c2572aa9962a8009d"
ATTEMPT4_ACTIVATION_SHA256 = "1a3b430d41d6b8507615fbb229df972bb5aa07dcd7ee5937a344df29f4e31301"
BLOCKED_STATUS = "BLOCKED_AWAITING_INDEPENDENT_PRELAUNCH"
ACTIVE_STATUS = "ACTIVE_FOR_EXACTLY_2_FRESH_LUNA_MAX_LEAVES"
RESULT_SCHEMA_VERSION = "external-research-result-v5"


def canonical(value: Any) -> bytes:
    return (json.dumps(value, sort_keys=True, separators=(",", ":"), ensure_ascii=False) + "\n").encode()


def sha_bytes(value: bytes) -> str:
    return hashlib.sha256(value).hexdigest()


def sha(path: Path) -> str:
    return sha_bytes(path.read_bytes())


def digest(value: Any) -> str:
    return sha_bytes(json.dumps(value, sort_keys=True, separators=(",", ":"), ensure_ascii=False).encode())


def load_obj(path: Path) -> dict[str, Any]:
    value = json.loads(path.read_text(encoding="utf-8"))
    if not isinstance(value, dict):
        raise ValueError(f"not_object:{path}")
    return value


def expected_agent_path(assignment_id: str) -> str:
    if assignment_id not in RECOVERY_IDS:
        raise ValueError(f"foreign_assignment:{assignment_id}")
    return f"/root/a005_external_research_recovery_er_{assignment_id[-4:]}_attempt_0005_terminal"


def output_dir(assignment_id: str) -> Path:
    return OUTPUT_ROOT / assignment_id / "attempts" / ATTEMPT_ID


def packet_path(assignment_id: str) -> Path:
    return NAMESPACE / "packets" / f"{assignment_id}.json"


def intent_path(assignment_id: str) -> Path:
    return NAMESPACE / "dispatch" / assignment_id / ATTEMPT_ID / "dispatch_intent.json"


def receipt_path(assignment_id: str) -> Path:
    return intent_path(assignment_id).with_name("dispatch_receipt.json")


def core_path() -> Path:
    return NAMESPACE / "activation-transaction/activation-core.json"


def authorization_path(assignment_id: str) -> Path:
    return NAMESPACE / "activation-transaction/leaf-dispatch-authorizations" / f"{assignment_id}.json"


def envelope_path() -> Path:
    return NAMESPACE / "activation-transaction/activation-envelope.json"


def _type_ok(value: Any, expected: str) -> bool:
    return {
        "object": isinstance(value, dict),
        "array": isinstance(value, list),
        "string": isinstance(value, str),
        "boolean": isinstance(value, bool),
        "number": isinstance(value, (int, float)) and not isinstance(value, bool),
        "integer": isinstance(value, int) and not isinstance(value, bool),
        "null": value is None,
    }.get(expected, False)


def schema_errors(value: Any, schema: dict[str, Any], at: str = "$") -> list[str]:
    """Validate the strict JSON-Schema subset frozen by this candidate."""
    errors: list[str] = []
    expected_type = schema.get("type")
    if expected_type is not None:
        options = expected_type if isinstance(expected_type, list) else [expected_type]
        if not any(_type_ok(value, option) for option in options):
            return [f"{at}:type"]
    if "const" in schema and value != schema["const"]:
        errors.append(f"{at}:const")
    if "enum" in schema and value not in schema["enum"]:
        errors.append(f"{at}:enum")
    if isinstance(value, str):
        if len(value) < schema.get("minLength", 0): errors.append(f"{at}:minLength")
        if "pattern" in schema and re.fullmatch(schema["pattern"], value) is None: errors.append(f"{at}:pattern")
    if isinstance(value, (int, float)) and not isinstance(value, bool):
        if "minimum" in schema and value < schema["minimum"]: errors.append(f"{at}:minimum")
        if "maximum" in schema and value > schema["maximum"]: errors.append(f"{at}:maximum")
    if isinstance(value, list):
        if len(value) < schema.get("minItems", 0): errors.append(f"{at}:minItems")
        if "maxItems" in schema and len(value) > schema["maxItems"]: errors.append(f"{at}:maxItems")
        if schema.get("uniqueItems") and len({canonical(item) for item in value}) != len(value): errors.append(f"{at}:uniqueItems")
        if isinstance(schema.get("items"), dict):
            for index, item in enumerate(value): errors.extend(schema_errors(item, schema["items"], f"{at}[{index}]"))
    if isinstance(value, dict):
        for key in schema.get("required", []):
            if key not in value: errors.append(f"{at}.{key}:required")
        properties = schema.get("properties", {})
        if schema.get("additionalProperties") is False:
            for key in value:
                if key not in properties: errors.append(f"{at}.{key}:additional")
        for key, child_schema in properties.items():
            if key in value: errors.extend(schema_errors(value[key], child_schema, f"{at}.{key}"))
    return sorted(set(errors))


def direct_url_errors(url: Any, label: str) -> list[str]:
    if not isinstance(url, str) or not url or any(char.isspace() for char in url):
        return [f"{label}:invalid_or_whitespace"]
    parsed = urlsplit(url)
    errors: list[str] = []
    if parsed.scheme != "https": errors.append(f"{label}:non_https")
    if not parsed.hostname: errors.append(f"{label}:missing_host")
    if url.startswith("#") or not parsed.netloc: errors.append(f"{label}:nonabsolute")
    host = (parsed.hostname or "").lower()
    if parsed.path.lower().startswith("/search") or host in {"google.com", "www.google.com", "bing.com", "www.bing.com"}:
        errors.append(f"{label}:search_result")
    return sorted(set(errors))


REFERENCE_SECTIONS = [
    "findings", "competitor_standard_patterns", "failure_modes", "implications", "novel_ideas", "unresolved_questions"
]


def source_registry_errors(result: dict[str, Any]) -> list[str]:
    errors: list[str] = []
    sources = result.get("sources", [])
    if not isinstance(sources, list): return ["sources:not_array"]
    urls = [source.get("url") for source in sources if isinstance(source, dict)]
    for index, url in enumerate(urls): errors.extend(direct_url_errors(url, f"sources[{index}].url"))
    if len(urls) != len(set(urls)): errors.append("sources:url_registered_more_than_once")
    registry = set(urls)
    for section in REFERENCE_SECTIONS:
        rows = result.get(section, [])
        if not isinstance(rows, list): continue
        for index, row in enumerate(rows):
            if not isinstance(row, dict): continue
            refs = row.get("source_urls", [])
            if not isinstance(refs, list): continue
            for ref_index, url in enumerate(refs):
                errors.extend(direct_url_errors(url, f"{section}[{index}].source_urls[{ref_index}]"))
                if url not in registry: errors.append(f"{section}[{index}].source_urls[{ref_index}]:unregistered")
                if urls.count(url) != 1: errors.append(f"{section}[{index}].source_urls[{ref_index}]:registry_not_exactly_once")
            if row.get("evidence_class") == "supported_claim" and not refs:
                errors.append(f"{section}[{index}]:supported_claim_without_source")
            if row.get("evidence_class") == "no_evidence" and refs:
                errors.append(f"{section}[{index}]:no_evidence_with_source")
    attestation = result.get("self_attestation", {})
    if attestation.get("source_registry_unique_and_complete") is not True: errors.append("self_attestation:source_registry_unique_and_complete")
    if attestation.get("source_registry_completed_before_claim_emission") is not True: errors.append("self_attestation:source_registry_completed_before_claim_emission")
    return sorted(set(errors))


def forbidden_identity_errors(value: Any, at: str = "$") -> list[str]:
    errors: list[str] = []
    forbidden = {"task_thread_id", "native_child_thread_id", "native_child_turn_id", "native_thread_id", "native_turn_id"}
    if isinstance(value, dict):
        for key, child in value.items():
            if key in forbidden: errors.append(f"{at}.{key}:forbidden_leaf_identity")
            errors.extend(forbidden_identity_errors(child, f"{at}.{key}"))
    elif isinstance(value, list):
        for index, child in enumerate(value): errors.extend(forbidden_identity_errors(child, f"{at}[{index}]"))
    return errors


def result_errors(
    result: dict[str, Any], assignment: dict[str, Any], schema: dict[str, Any],
    activation_transaction_id: str | None = None, core_sha256: str | None = None,
    authorization_sha256: str | None = None,
) -> list[str]:
    errors = schema_errors(result, schema)
    expected = {
        "audit_id": AUDIT_ID, "schema_version": RESULT_SCHEMA_VERSION,
        "assignment_id": assignment.get("assignment_id"), "attempt_id": ATTEMPT_ID,
        "controller_thread_id": CONTROLLER_THREAD_ID, "agent_path": assignment.get("canonical_agent_path"),
        "model": MODEL, "reasoning_effort": REASONING_EFFORT, "status": "completed",
        "topic": assignment.get("topic"), "owner_domains": assignment.get("owner_domains"),
        "feature_refs": assignment.get("feature_refs"), "research_questions": assignment.get("research_questions"),
    }
    if activation_transaction_id is not None: expected["activation_transaction_id"] = activation_transaction_id
    if core_sha256 is not None: expected["activation_core_sha256"] = core_sha256
    if authorization_sha256 is not None: expected["leaf_dispatch_authorization_sha256"] = authorization_sha256
    for key, value in expected.items():
        if result.get(key) != value: errors.append(f"binding:{key}")
    errors.extend(forbidden_identity_errors(result))
    attestation = result.get("self_attestation", {})
    mandatory_true = [
        "fresh_current_public_web_research_redone",
        "leaf_local_schema_conformance_check_passed_before_final_write",
        "exact_schema_key_set_verified",
        "source_registry_unique_and_complete",
        "source_registry_completed_before_claim_emission",
        "prior_attempt_result_bodies_and_peer_outputs_not_read",
        "activation_core_and_authorization_verified",
        "blocked_prelaunch_intent_treated_as_lineage_only",
        "result_required_before_pmr1",
        "pmr1_not_returned_before_result_write",
    ]
    for key in mandatory_true:
        if attestation.get(key) is not True: errors.append(f"self_attestation:{key}")
    if "fresh_current_web_research_redone" in attestation:
        errors.append("self_attestation:fresh_current_web_research_redone:renamed_forbidden")
    errors.extend(source_registry_errors(result))
    sources = result.get("sources", [])
    availability = result.get("source_availability")
    if availability == "available" and not 8 <= len(sources) <= 12: errors.append("sources:available_requires_8_to_12")
    if availability in {"limited", "unavailable"} and not result.get("unavailable_evidence"):
        errors.append("sources:underfill_requires_evidence")
    return sorted(set(errors))


def zero_inventory_errors(
    output_files: dict[str, list[str]], receipt_ids: list[str], result_ids: list[str],
    native_capture_rows: int, activation_transaction_files: list[str],
) -> list[str]:
    errors: list[str] = []
    if set(output_files) != set(RECOVERY_IDS): errors.append("zero_state:output_assignment_set")
    if any(output_files.get(aid, []) for aid in RECOVERY_IDS): errors.append("zero_state:nonempty_outputs")
    if receipt_ids: errors.append("zero_state:receipts_present")
    if result_ids: errors.append("zero_state:results_present")
    if native_capture_rows: errors.append("zero_state:native_capture_present")
    if activation_transaction_files: errors.append("zero_state:activation_transaction_present")
    return errors


def prior_native_identities() -> set[str]:
    identities: set[str] = set()
    for capture in (ATTEMPT2 / "runtime/native_capture.json", ATTEMPT3 / "runtime/native_capture.json"):
        if not capture.is_file(): continue
        for row in load_obj(capture).get("leaves", []):
            for key in ("native_child_thread_id", "native_child_turn_id"):
                if row.get(key): identities.add(row[key])
    failure = ROOT / ATTEMPT4_FAILURE_REF
    if failure.is_file():
        for row in load_obj(failure).get("assignments", []):
            for key in ("native_child_thread_id", "native_child_turn_id"):
                if row.get(key): identities.add(row[key])
    return identities


def transaction_file_inventory() -> list[str]:
    directory = NAMESPACE / "activation-transaction"
    return sorted(str(path.relative_to(NAMESPACE)) for path in directory.rglob("*") if path.is_file()) if directory.exists() else []
