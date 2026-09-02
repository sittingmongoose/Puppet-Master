#!/usr/bin/env python3
"""Fail-closed static validator for the current contract owner wave.

This gate proves only schema/fixture consistency.  It is not runtime, native
Slint, browser, WAN, recovery, security, performance, or readiness evidence.
"""

from __future__ import annotations

import copy
import json
import re
import sys
from collections import Counter, defaultdict
from pathlib import Path
from typing import Any

from jsonschema import Draft202012Validator
from jsonschema.exceptions import SchemaError
from referencing import Registry, Resource


ROOT = Path(__file__).resolve().parents[1]

# Authored and intentionally closed.  Adding a contract pair is a reviewed gate
# change, not an ambient glob that silently changes the validation denominator.
CONTRACT_PAIRS = (
    ("Plans/backup_restore_system_contracts.schema.json", "Plans/backup_restore_system_contract_fixtures.json"),
    ("Plans/doctor_contracts.schema.json", "Plans/doctor_contract_fixtures.json"),
    ("Plans/egolite_retained_requirement_contracts.schema.json", "Plans/egolite_retained_requirement_contract_fixtures.json"),
    ("Plans/final_gui_interaction_contracts.schema.json", "Plans/final_gui_interaction_contract_fixtures.json"),
    ("Plans/forge_integration_contracts.schema.json", "Plans/forge_integration_contract_fixtures.json"),
    ("Plans/full_thread_runtime_contracts.schema.json", "Plans/full_thread_runtime_contract_fixtures.json"),
    ("Plans/guided_tour_contracts.schema.json", "Plans/guided_tour_contract_fixtures.json"),
    ("Plans/jujutsu_integration_contracts.schema.json", "Plans/jujutsu_integration_contract_fixtures.json"),
    ("Plans/named_plan_system_contracts.schema.json", "Plans/named_plan_system_contract_fixtures.json"),
    ("Plans/plugin_package_contracts.schema.json", "Plans/plugin_package_contract_fixtures.json"),
    ("Plans/product_onboarding_contracts.schema.json", "Plans/product_onboarding_contract_fixtures.json"),
    ("Plans/project_system_contracts.schema.json", "Plans/project_system_contract_fixtures.json"),
    ("Plans/protected_auth_browser_contracts.schema.json", "Plans/protected_auth_browser_contract_fixtures.json"),
    ("Plans/release_update_contracts.schema.json", "Plans/release_update_contract_fixtures.json"),
    ("Plans/remote_access_system_contracts.schema.json", "Plans/remote_access_system_contract_fixtures.json"),
    ("Plans/section15_browser_program_contracts.schema.json", "Plans/section15_browser_program_contract_fixtures.json"),
    ("Plans/server_system_contracts.schema.json", "Plans/server_system_contract_fixtures.json"),
    ("Plans/settings_system_contracts.schema.json", "Plans/settings_system_contract_fixtures.json"),
    ("Plans/shared_runtime_command_contracts.schema.json", "Plans/shared_runtime_command_contract_fixtures.json"),
    ("Plans/source_control_contracts.schema.json", "Plans/source_control_contract_fixtures.json"),
    ("Plans/test_capture_motion_evidence_contracts.schema.json", "Plans/test_capture_motion_evidence_contract_fixtures.json"),
    ("Plans/plugin_contracts.schema.json", "Plans/plugin_contract_fixtures.json"),
    ("Plans/shared_integration_runtime.schema.json", "Plans/shared_integration_runtime_fixtures.json"),
    ("Plans/multi_account_contracts.schema.json", "Plans/multi_account_contract_fixtures.json"),
)

EXPECTED_CONTRACT_PAIR_COUNT = 24

EXPANSION_SCHEMA_REL = "Plans/shared_integration_runtime_expansion_contracts.schema.json"
EXPANSION_FIXTURE_REL = "Plans/shared_integration_runtime_expansion_fixtures.json"

# These reviewed pairs use a command-oriented fixture protocol.  Support is
# deliberately path-bound; another pack cannot opt in by imitating field names.
AUTHORED_COMMAND_PAIR_CONTRACTS = {
    "Plans/plugin_contracts.schema.json": {
        "fixture": "Plans/plugin_contract_fixtures.json",
        "request_mode": "inline_instance",
        "implicit_runtime_schema_id_policy": "aggregate_plus_record_kind",
    },
    "Plans/shared_integration_runtime.schema.json": {
        "fixture": "Plans/shared_integration_runtime_fixtures.json",
        "request_mode": "inline_instance",
        "implicit_runtime_schema_id_policy": "aggregate_plus_record_kind",
    },
    "Plans/multi_account_contracts.schema.json": {
        "fixture": "Plans/multi_account_contract_fixtures.json",
        "request_mode": "template_patch",
        "implicit_runtime_schema_id_policy": None,
    },
}

ALLOWED_SCHEMA_HOST = "puppetmaster.local"
FIXTURE_LIST_KEYS = {"valid", "positive", "valid_cases", "invalid", "negative", "negative_cases", "pairwise_invalid", "negative_mutations"}
IDENTITY_STOPWORDS = {
    "action", "command", "contract", "context", "decision", "descriptor", "envelope",
    "integration", "operation", "projection", "record", "request", "result", "runtime",
    "schema", "state", "system",
}

SERVER_REMOTE_OWNER_CHECKS = {
    "Plans/server_system_contracts.schema.json": {
        "fixture": "Plans/server_system_contract_fixtures.json",
        "owner_doc": "Plans/Server_System.md",
        "command_prefix": "cmd.server.",
        "primary_count": 26,
        "retired_schema": "Plans/server_contracts.schema.json",
        "retired_fixture": "Plans/server_contract_fixtures.json",
    },
    "Plans/remote_access_system_contracts.schema.json": {
        "fixture": "Plans/remote_access_system_contract_fixtures.json",
        "owner_doc": "Plans/Remote_Access_System.md",
        "command_prefix": "cmd.remote_access.",
        "primary_count": 44,
        "retired_schema": "Plans/remote_access_contracts.schema.json",
        "retired_fixture": "Plans/remote_access_contract_fixtures.json",
    },
}


def load_json(path: Path) -> Any:
    with path.open("r", encoding="utf-8") as handle:
        return json.load(handle)


def pointer_set(document: Any, pointer: str, replacement: Any) -> Any:
    result = copy.deepcopy(document)
    if pointer == "":
        return copy.deepcopy(replacement)
    if not pointer.startswith("/"):
        raise ValueError("json_pointer_must_start_with_slash")
    parts = [part.replace("~1", "/").replace("~0", "~") for part in pointer[1:].split("/")]
    current = result
    for part in parts[:-1]:
        current = current[int(part)] if isinstance(current, list) else current[part]
    leaf = parts[-1]
    if isinstance(current, list):
        current[int(leaf)] = copy.deepcopy(replacement)
    else:
        current[leaf] = copy.deepcopy(replacement)
    return result


def dotted_patch(document: Any, patch: dict[str, Any], *, require_existing: bool = False) -> Any:
    result = copy.deepcopy(document)
    for dotted, replacement in patch.items():
        if not isinstance(dotted, str) or not dotted or any(not part for part in dotted.split(".")):
            raise ValueError("invalid_dotted_patch_path")
        parts = dotted.split(".")
        current = result
        for part in parts[:-1]:
            current = current[int(part)] if isinstance(current, list) else current[part]
        leaf = parts[-1]
        if isinstance(current, list):
            index = int(leaf)
            if require_existing and not 0 <= index < len(current):
                raise IndexError(index)
            current[index] = copy.deepcopy(replacement)
        else:
            if require_existing and leaf not in current:
                raise KeyError(leaf)
            current[leaf] = copy.deepcopy(replacement)
    return result


def remove_paths(document: Any, paths: list[str]) -> Any:
    result = copy.deepcopy(document)
    for dotted in paths:
        parts = dotted.split(".")
        current = result
        for part in parts[:-1]:
            current = current[int(part)] if isinstance(current, list) else current[part]
        leaf = parts[-1]
        if isinstance(current, list):
            del current[int(leaf)]
        else:
            current.pop(leaf, None)
    return result


def root_definition_names(schema: dict[str, Any]) -> list[str]:
    names: list[str] = []
    for branch in schema.get("oneOf", []):
        ref = branch.get("$ref") if isinstance(branch, dict) else None
        if isinstance(ref, str) and ref.startswith("#/$defs/"):
            names.append(ref.removeprefix("#/$defs/"))
    return names


def const_fingerprint(definition: dict[str, Any]) -> dict[str, Any]:
    props = definition.get("properties", {}) if isinstance(definition, dict) else {}
    discriminator_keys = {"schema_id", "record_kind", "manifest_kind", "kind", "type"}
    return {
        key: value["const"]
        for key, value in props.items()
        if key in discriminator_keys and isinstance(value, dict) and "const" in value
    }


def select_definition(schema: dict[str, Any], case: dict[str, Any], value: Any, *, require_valid: bool) -> tuple[str, dict[str, Any]]:
    defs = schema.get("$defs", {})
    explicit = case.get("definition")
    schema_ref = case.get("schema_ref")
    if explicit is None and isinstance(schema_ref, str) and schema_ref.startswith("#/$defs/"):
        explicit = schema_ref.removeprefix("#/$defs/")
    if explicit is not None:
        if explicit == "<root>" and not root_definition_names(schema):
            return "<root>", schema
        if explicit not in defs:
            raise ValueError(f"unknown_definition:{explicit}")
        return explicit, {"$ref": f"#/$defs/{explicit}"}

    if case.get("expected_failure") == "no_matching_closed_record":
        return "<root>", schema

    candidates = root_definition_names(schema)
    if not candidates:
        return "<root>", schema
    validators = [(name, Draft202012Validator({**schema, "$ref": f"#/$defs/{name}"})) for name in candidates]
    passing = [name for name, validator in validators if validator.is_valid(value)]
    if require_valid:
        if len(passing) != 1:
            raise ValueError(f"positive_definition_match_count:{len(passing)}:{','.join(passing)}")
        return passing[0], {"$ref": f"#/$defs/{passing[0]}"}

    # Invalid instances ordinarily match zero complete definitions.  Select the
    # intended closed record from its discriminator constants, then required-key
    # overlap.  A tie is an ambiguity and fails rather than guessing.
    scored: list[tuple[int, int, str]] = []
    value_keys = set(value) if isinstance(value, dict) else set()
    for name in candidates:
        definition = defs.get(name, {})
        fingerprint = const_fingerprint(definition)
        discriminator_matches = sum(1 for key, expected in fingerprint.items() if isinstance(value, dict) and value.get(key) == expected)
        discriminator_conflicts = sum(1 for key, expected in fingerprint.items() if isinstance(value, dict) and key in value and value[key] != expected)
        required_overlap = len(set(definition.get("required", [])) & value_keys)
        scored.append((discriminator_matches * 1000 - discriminator_conflicts * 1000 + required_overlap, discriminator_matches, name))
    scored.sort(reverse=True)
    if not scored or (len(scored) > 1 and scored[0][:2] == scored[1][:2]):
        raise ValueError("negative_definition_ambiguous")
    return scored[0][2], {"$ref": f"#/$defs/{scored[0][2]}"}


def validator_for(
    schema: dict[str, Any],
    selected: dict[str, Any],
    registry: Registry,
) -> Draft202012Validator:
    if selected is schema:
        return Draft202012Validator(schema, registry=registry)
    # Keep the definitions and schema identity for local-reference resolution,
    # but replace (rather than combine with) the aggregate root applicators.
    definition_schema = {
        key: value
        for key, value in schema.items()
        if key not in {"oneOf", "anyOf", "allOf", "type", "properties", "required", "additionalProperties"}
    }
    definition_schema.update(selected)
    return Draft202012Validator(definition_schema, registry=registry)


def offline_schema_registry() -> Registry:
    """Register every closed-manifest schema by $id; never retrieve remotely."""

    registry = Registry(retrieve=lambda uri: (_ for _ in ()).throw(ValueError(f"unregistered schema URI: {uri}")))
    for schema_rel, _ in CONTRACT_PAIRS:
        schema = load_json(ROOT / schema_rel)
        schema_uri = schema.get("$id")
        if isinstance(schema_uri, str) and schema_uri:
            registry = registry.with_resource(schema_uri, Resource.from_contents(schema))
    expansion_schema = load_json(ROOT / EXPANSION_SCHEMA_REL)
    expansion_uri = expansion_schema.get("$id")
    if not isinstance(expansion_uri, str) or not expansion_uri:
        raise ValueError("shared integration expansion schema has no canonical $id")
    registry = registry.with_resource(expansion_uri, Resource.from_contents(expansion_schema))
    return registry


def validate_expansion_fixture_pack(registry: Registry) -> tuple[list[dict[str, Any]], Counter[str]]:
    """Validate the DRY expansion owner and every owner-local compatibility ref."""

    findings: list[dict[str, Any]] = []
    counts: Counter[str] = Counter()
    try:
        schema = load_json(ROOT / EXPANSION_SCHEMA_REL)
        fixtures = load_json(ROOT / EXPANSION_FIXTURE_REL)
        Draft202012Validator.check_schema(schema)
    except (OSError, json.JSONDecodeError, SchemaError, ValueError) as exc:
        return ([{"code": "expansion_pack_unreadable", "detail": str(exc)}], counts)

    if schema.get("$schema") != "https://json-schema.org/draft/2020-12/schema":
        findings.append({"code": "expansion_wrong_or_missing_metaschema", "schema": EXPANSION_SCHEMA_REL})
    if fixtures.get("contract_schema_id") != schema.get("x-schema-id"):
        findings.append({
            "code": "expansion_fixture_schema_id_mismatch",
            "expected": schema.get("x-schema-id"),
            "actual": fixtures.get("contract_schema_id"),
        })

    command_cases = fixtures.get("command_cases")
    local_cases = fixtures.get("local_action_cases")
    alias_cases = fixtures.get("alias_cases")
    negative_cases = fixtures.get("negative_fixtures")
    lists = {
        "command_cases": command_cases,
        "local_action_cases": local_cases,
        "alias_cases": alias_cases,
        "negative_fixtures": negative_cases,
    }
    for name, value in lists.items():
        if not isinstance(value, list):
            findings.append({"code": "expansion_fixture_list_missing", "list": name})
    if findings:
        return findings, counts

    assert isinstance(command_cases, list)
    assert isinstance(local_cases, list)
    assert isinstance(alias_cases, list)
    assert isinstance(negative_cases, list)
    expected_lengths = {"command_cases": 44, "local_action_cases": 14, "alias_cases": 36}
    for name, expected in expected_lengths.items():
        actual = len(lists[name])
        if actual != expected:
            findings.append({"code": "expansion_fixture_cardinality", "list": name, "expected": expected, "actual": actual})
    expected_count_fields = {
        "new_commands": 44,
        "typed_local_ui_actions": 14,
        "approved_aliases": 36,
        "total_rows": 94,
        "command_disabled_reason_records": 44,
    }
    for field, expected in expected_count_fields.items():
        if fixtures.get("counts", {}).get(field) != expected:
            findings.append({"code": "expansion_fixture_count_metadata", "field": field, "expected": expected, "actual": fixtures.get("counts", {}).get(field)})
    for field, expected in (("x-command-count", 44), ("x-local-action-count", 14), ("x-alias-count", 36)):
        if schema.get(field) != expected:
            findings.append({"code": "expansion_schema_count_metadata", "field": field, "expected": expected, "actual": schema.get(field)})

    owner_schemas: dict[str, dict[str, Any]] = {}
    for owner_rel in (
        "Plans/protected_auth_browser_contracts.schema.json",
        "Plans/shared_integration_runtime.schema.json",
        "Plans/shared_runtime_command_contracts.schema.json",
    ):
        owner_schemas[owner_rel] = load_json(ROOT / owner_rel)

    def accepts(target_schema: dict[str, Any], definition_name: str, instance: Any) -> bool:
        if definition_name not in target_schema.get("$defs", {}):
            return False
        selected = {"$ref": f"#/$defs/{definition_name}"}
        return validator_for(target_schema, selected, registry).is_valid(instance)

    family_defs = {
        "integration_credential": "IntegrationCredential",
        "execution_topology": "ExecutionTopology",
        "installation_ownership": "InstallationOwnership",
        "project_topology": "ProjectTopology",
    }
    family_owners = {
        "integration_credential": "Plans/shared_integration_runtime.schema.json",
        "execution_topology": "Plans/shared_runtime_command_contracts.schema.json",
        "project_topology": "Plans/shared_runtime_command_contracts.schema.json",
    }
    command_ids: list[str] = []
    command_rows: list[int] = []
    record_fields = (
        ("request", "CommandRequest"),
        ("result", "CommandResult"),
        ("error", "CommandError"),
        ("availability", "CommandAvailability"),
        ("disabled_reason", "CommandDisabledReason"),
        ("permission", "PermissionDecision"),
    )
    for case in command_cases:
        if not isinstance(case, dict):
            findings.append({"code": "expansion_command_case_not_object"})
            continue
        family = case.get("schema_family")
        prefix = family_defs.get(str(family))
        command_id = case.get("command_id")
        row_index = case.get("row_index")
        if not isinstance(prefix, str):
            findings.append({"code": "expansion_unknown_command_family", "family": family, "command_id": command_id})
            continue
        if isinstance(command_id, str):
            command_ids.append(command_id)
        if isinstance(row_index, int):
            command_rows.append(row_index)
        for record_field, suffix in record_fields:
            definition_name = prefix + suffix
            metadata_field = (
                "permission_schema_def" if record_field == "permission" else f"{record_field}_schema_def"
            )
            if case.get(metadata_field) != definition_name:
                findings.append({"code": "expansion_command_definition_metadata", "command_id": command_id, "field": metadata_field, "expected": definition_name, "actual": case.get(metadata_field)})
            instance = case.get(record_field)
            counts["expansion_command_records_checked"] += 1
            if accepts(schema, definition_name, instance):
                counts["expansion_command_records_valid"] += 1
            else:
                findings.append({"code": "expansion_command_record_invalid", "command_id": command_id, "definition": definition_name})
            owner_rel = family_owners.get(str(family))
            if owner_rel is not None:
                counts["owner_compat_command_records_checked"] += 1
                if accepts(owner_schemas[owner_rel], definition_name, instance):
                    counts["owner_compat_command_records_valid"] += 1
                else:
                    findings.append({"code": "owner_compat_command_record_invalid", "owner_schema": owner_rel, "command_id": command_id, "definition": definition_name})

    if len(command_ids) != len(set(command_ids)):
        findings.append({"code": "expansion_duplicate_command_ids"})
    if len(command_rows) != len(set(command_rows)):
        findings.append({"code": "expansion_duplicate_command_row_indices"})
    schema_command_ids: set[str] = set()
    for prefix in family_defs.values():
        schema_command_ids.update(schema["$defs"][prefix + "CommandIdentity"]["properties"]["command_id"]["enum"])
    if set(command_ids) != schema_command_ids:
        findings.append({"code": "expansion_command_inventory_mismatch", "missing": sorted(schema_command_ids - set(command_ids)), "extra": sorted(set(command_ids) - schema_command_ids)})

    def local_owner(action_id: str) -> tuple[str, str] | None:
        if action_id.startswith("ui.auth_session."):
            return "Plans/protected_auth_browser_contracts.schema.json", "ProtectedAuthLocalAction"
        if action_id.startswith("ui.credential_"):
            return "Plans/shared_integration_runtime.schema.json", "IntegrationCredentialLocalAction"
        if action_id.startswith("ui.execution_"):
            return "Plans/shared_runtime_command_contracts.schema.json", "ExecutionTopologyLocalAction"
        if action_id.startswith("ui.project."):
            return "Plans/shared_runtime_command_contracts.schema.json", "ProjectTopologyLocalAction"
        if action_id.startswith("ui.installation.") or action_id.startswith("ui.tool_package."):
            return "Plans/shared_runtime_command_contracts.schema.json", "InstallationLocalAction"
        return None

    local_action_ids: list[str] = []
    local_packet_tokens: list[str] = []
    local_rows: list[int] = []
    for case in local_cases:
        if not isinstance(case, dict):
            findings.append({"code": "expansion_local_case_not_object"})
            continue
        action_id = case.get("action_id")
        packet_token = case.get("packet_token")
        row_index = case.get("row_index")
        if isinstance(action_id, str):
            local_action_ids.append(action_id)
        if isinstance(packet_token, str):
            local_packet_tokens.append(packet_token)
        if isinstance(row_index, int):
            local_rows.append(row_index)
        mapping = local_owner(str(action_id))
        if mapping is None:
            findings.append({"code": "expansion_local_owner_missing", "action_id": action_id})
            continue
        owner_rel, owner_prefix = mapping
        for record_field, source_definition, owner_suffix in (
            ("request", "SIRLocalActionRequest", "Request"),
            ("result", "SIRLocalActionResult", "Result"),
        ):
            instance = case.get(record_field)
            counts["expansion_local_records_checked"] += 1
            if accepts(schema, source_definition, instance):
                counts["expansion_local_records_valid"] += 1
            else:
                findings.append({"code": "expansion_local_record_invalid", "action_id": action_id, "definition": source_definition})
            owner_definition = owner_prefix + owner_suffix
            counts["owner_local_records_checked"] += 1
            if accepts(owner_schemas[owner_rel], owner_definition, instance):
                counts["owner_local_records_valid"] += 1
            else:
                findings.append({"code": "owner_local_record_invalid", "owner_schema": owner_rel, "action_id": action_id, "definition": owner_definition})

    if len(local_action_ids) != len(set(local_action_ids)) or len(local_packet_tokens) != len(set(local_packet_tokens)):
        findings.append({"code": "expansion_duplicate_local_identity"})
    if len(local_rows) != len(set(local_rows)):
        findings.append({"code": "expansion_duplicate_local_row_indices"})
    local_base = schema["$defs"]["SIRLocalActionRequest"]["allOf"][0]["properties"]
    if set(local_action_ids) != set(local_base["action_id"]["enum"]):
        findings.append({"code": "expansion_local_action_inventory_mismatch"})
    if set(local_packet_tokens) != set(local_base["packet_token"]["enum"]):
        findings.append({"code": "expansion_local_packet_inventory_mismatch"})

    alias_inputs: list[str] = []
    for case in alias_cases:
        if not isinstance(case, dict):
            findings.append({"code": "expansion_alias_case_not_object"})
            continue
        instance = case.get("normalization")
        if isinstance(instance, dict) and isinstance(instance.get("packet_alias"), str):
            alias_inputs.append(instance["packet_alias"])
        counts["expansion_alias_records_checked"] += 1
        if accepts(schema, "SIRAliasNormalization", instance):
            counts["expansion_alias_records_valid"] += 1
        else:
            findings.append({"code": "expansion_alias_record_invalid", "row_index": case.get("row_index")})
    alias_base = schema["$defs"]["SIRAliasNormalization"]["allOf"][0]["properties"]["packet_alias"]["enum"]
    if len(alias_inputs) != len(set(alias_inputs)) or set(alias_inputs) != set(alias_base):
        findings.append({"code": "expansion_alias_inventory_mismatch"})

    for case in negative_cases:
        if not isinstance(case, dict):
            findings.append({"code": "expansion_negative_case_not_object"})
            continue
        owner_rel = case.get("owner_schema")
        target_schema = owner_schemas.get(owner_rel, schema)
        definition_name = case.get("schema_def")
        counts["expansion_negative_records_checked"] += 1
        if not isinstance(definition_name, str) or accepts(target_schema, definition_name, case.get("record")):
            findings.append({"code": "expansion_negative_record_accepted", "case": case.get("id"), "definition": definition_name, "owner_schema": owner_rel or EXPANSION_SCHEMA_REL})
        else:
            counts["expansion_negative_records_rejected"] += 1

    counts["expansion_fixture_packs"] = 1
    counts["expansion_metaschemas_valid"] = 1
    return findings, counts


def fixture_pack_id(fixtures: dict[str, Any]) -> str | None:
    for key in ("fixture_id", "schema_id"):
        value = fixtures.get(key)
        if isinstance(value, str) and ("fixture" in value or "fixtures" in value):
            return value
    return None


def legacy_positive_cases(fixtures: dict[str, Any]) -> list[dict[str, Any]]:
    positives: list[dict[str, Any]] = []
    positives.extend(fixtures.get("valid", []))
    positives.extend(fixtures.get("positive", []))
    positives.extend(fixtures.get("valid_cases", []))
    if "positive_instance" in fixtures:
        positives.append({"name": "positive_instance", "instance": fixtures["positive_instance"]})
    return positives


def ensure_unique_case_names(cases: list[dict[str, Any]], *, label: str) -> None:
    names = [str(case.get("name", case.get("case_id", "unnamed"))) for case in cases]
    duplicates = sorted(name for name, count in Counter(names).items() if count > 1)
    if duplicates:
        raise ValueError(f"duplicate_{label}_case_names:{','.join(duplicates)}")


def normalize_authored_case(case: dict[str, Any], value: Any, *, group: str) -> dict[str, Any]:
    target_def = case.get("target_def")
    if not isinstance(target_def, str) or not target_def:
        raise ValueError(f"{group}_target_def_missing")
    name = case.get("name", case.get("case_id"))
    if not isinstance(name, str) or not name:
        raise ValueError(f"{group}_case_name_missing")
    normalized = copy.deepcopy(case)
    normalized["definition"] = target_def
    normalized["instance"] = copy.deepcopy(value)
    normalized["_fixture_group"] = group
    return normalized


def authored_positive_cases(fixtures: dict[str, Any], *, request_mode: str) -> list[dict[str, Any]]:
    request_cases = fixtures.get("request_cases")
    other_positive_cases = fixtures.get("other_positive_cases")
    negative_cases = fixtures.get("negative_cases")
    coverage = fixtures.get("coverage")
    ignored_legacy_lists = sorted(
        (set(fixtures) & (FIXTURE_LIST_KEYS | {"positive_instance"})) - {"negative_cases"}
    )
    if ignored_legacy_lists:
        raise ValueError(f"authored_envelope_contains_ignored_legacy_lists:{','.join(ignored_legacy_lists)}")
    if not isinstance(request_cases, list) or not isinstance(other_positive_cases, list):
        raise ValueError("authored_positive_case_lists_missing")
    if not isinstance(negative_cases, list) or not isinstance(coverage, dict):
        raise ValueError("authored_negative_or_coverage_envelope_missing")

    template = fixtures.get("request_template")
    if request_mode == "template_patch":
        if not isinstance(template, dict) or not isinstance(fixtures.get("fixture_format"), str):
            raise ValueError("template_patch_envelope_missing")
    elif request_mode == "inline_instance":
        if "request_template" in fixtures:
            raise ValueError("inline_instance_envelope_has_template")
    else:
        raise ValueError(f"unknown_authored_request_mode:{request_mode}")

    positives: list[dict[str, Any]] = []
    for case in request_cases:
        if not isinstance(case, dict):
            raise ValueError("request_case_not_object")
        if request_mode == "inline_instance":
            if "instance" not in case or any(
                key in case for key in ("patch", "base_positive_case", "base_valid", "remove", "record", "value")
            ):
                raise ValueError("inline_request_case_recipe_invalid")
            value = case["instance"]
        else:
            patch = case.get("patch")
            if not isinstance(patch, dict) or any(
                key in case for key in ("instance", "base_positive_case", "base_valid", "remove", "record", "value")
            ):
                raise ValueError("template_request_case_recipe_invalid")
            value = dotted_patch(template, patch, require_existing=True)
        positives.append(normalize_authored_case(case, value, group="request_cases"))

    for case in other_positive_cases:
        if not isinstance(case, dict) or "instance" not in case or any(
            key in case for key in ("patch", "base_positive_case", "base_valid", "remove", "record", "value")
        ):
            raise ValueError("other_positive_case_recipe_invalid")
        positives.append(normalize_authored_case(case, case["instance"], group="other_positive_cases"))

    ensure_unique_case_names(positives, label="positive")
    return positives


def authored_invalid_cases(fixtures: dict[str, Any]) -> list[dict[str, Any]]:
    raw_cases = fixtures.get("negative_cases")
    if not isinstance(raw_cases, list):
        raise ValueError("authored_negative_cases_missing")
    invalids: list[dict[str, Any]] = []
    for case in raw_cases:
        if not isinstance(case, dict):
            raise ValueError("negative_case_not_object")
        has_instance = "instance" in case
        has_base = "base_positive_case" in case
        if has_instance == has_base:
            raise ValueError("negative_case_recipe_must_be_exactly_one_of_instance_or_base_positive_case")
        if has_instance and any(key in case for key in ("patch", "remove", "base_valid", "record", "value")):
            raise ValueError("negative_inline_case_recipe_invalid")
        if has_base and not isinstance(case.get("patch"), dict) and not isinstance(case.get("remove"), list):
            raise ValueError("negative_base_case_requires_patch_or_remove")
        if has_base and (not isinstance(case["base_positive_case"], str) or not case["base_positive_case"]):
            raise ValueError("negative_base_positive_case_name_invalid")
        if has_base and any(key in case for key in ("base_valid", "record", "value")):
            raise ValueError("negative_base_case_recipe_invalid")
        if "remove" in case and (
            not isinstance(case["remove"], list)
            or any(not isinstance(path, str) or not path for path in case["remove"])
        ):
            raise ValueError("negative_remove_paths_invalid")
        normalized = copy.deepcopy(case)
        normalized["definition"] = case.get("target_def")
        if not isinstance(normalized["definition"], str) or not normalized["definition"]:
            raise ValueError("negative_target_def_missing")
        if has_base:
            normalized["base_valid"] = case["base_positive_case"]
        invalids.append(normalized)
    ensure_unique_case_names(invalids, label="negative")
    return invalids


def effective_runtime_schema_id_policy(schema_rel: str, schema: dict[str, Any]) -> str | None:
    declared = schema.get("x-runtime-schema-id-policy")
    if declared is not None:
        return declared
    config = AUTHORED_COMMAND_PAIR_CONTRACTS.get(schema_rel, {})
    return config.get("implicit_runtime_schema_id_policy")


def command_ids_from_request_definitions(schema: dict[str, Any]) -> set[str]:
    defs = schema.get("$defs", {})
    command_ids: set[str] = set()
    for name in root_definition_names(schema):
        if not name.endswith("CommandRequest"):
            continue
        node = defs.get(name, {}).get("properties", {}).get("command_id", {})
        if isinstance(node, dict) and isinstance(node.get("$ref"), str) and node["$ref"].startswith("#/$defs/"):
            node = defs.get(node["$ref"].removeprefix("#/$defs/"), {})
        if isinstance(node, dict) and isinstance(node.get("const"), str):
            command_ids.add(node["const"])
        if isinstance(node, dict) and isinstance(node.get("enum"), list):
            command_ids.update(value for value in node["enum"] if isinstance(value, str))
    return command_ids


def validate_authored_command_coverage(
    schema_rel: str,
    fixture_rel: str,
    schema: dict[str, Any],
    fixtures: dict[str, Any],
    positives: list[dict[str, Any]],
    invalids: list[dict[str, Any]],
) -> list[dict[str, Any]]:
    findings: list[dict[str, Any]] = []
    coverage = fixtures.get("coverage", {})
    expected = coverage.get("exact_command_ids")
    if not isinstance(expected, list) or not expected or any(not isinstance(value, str) for value in expected):
        return [{"code": "authored_exact_command_inventory_missing", "fixture": fixture_rel}]
    if len(expected) != len(set(expected)):
        findings.append({"code": "authored_exact_command_inventory_duplicate", "fixture": fixture_rel})
    expected_set = set(expected)
    schema_ids = command_ids_from_request_definitions(schema)
    if schema_ids != expected_set:
        findings.append({"code": "authored_schema_command_inventory_mismatch", "schema": schema_rel, "missing": sorted(expected_set - schema_ids), "extra": sorted(schema_ids - expected_set)})

    primary_requests = [case for case in positives if case.get("_fixture_group") == "request_cases"]
    request_ids = Counter(
        case.get("instance", {}).get("command_id")
        for case in primary_requests
        if isinstance(case.get("instance"), dict)
    )
    results = [
        case for case in positives
        if isinstance(case.get("definition"), str) and case["definition"].endswith("CommandResult")
    ]
    result_ids = Counter(
        case.get("instance", {}).get("command_id")
        for case in results
        if isinstance(case.get("instance"), dict)
    )
    expected_counter = Counter({command_id: 1 for command_id in expected})
    if request_ids != expected_counter:
        findings.append({"code": "authored_request_coverage_mismatch", "fixture": fixture_rel, "expected": dict(expected_counter), "actual": dict(request_ids)})
    if result_ids != expected_counter:
        findings.append({"code": "authored_result_coverage_mismatch", "fixture": fixture_rel, "expected": dict(expected_counter), "actual": dict(result_ids)})
    if coverage.get("request_case_count") != len(primary_requests):
        findings.append({"code": "authored_request_count_metadata_mismatch", "fixture": fixture_rel, "expected": len(primary_requests), "actual": coverage.get("request_case_count")})
    if coverage.get("positive_result_case_count") != len(results):
        findings.append({"code": "authored_result_count_metadata_mismatch", "fixture": fixture_rel, "expected": len(results), "actual": coverage.get("positive_result_case_count")})
    if coverage.get("negative_case_count") != len(invalids):
        findings.append({"code": "authored_negative_count_metadata_mismatch", "fixture": fixture_rel, "expected": len(invalids), "actual": coverage.get("negative_case_count")})
    if coverage.get("all_commands_have_positive_request_and_result") is not True:
        findings.append({"code": "authored_complete_command_coverage_flag_missing", "fixture": fixture_rel})
    return findings


def walk_values(value: Any, path: str = "$"):
    yield path, value
    if isinstance(value, dict):
        for key, child in value.items():
            yield from walk_values(child, f"{path}.{key}")
    elif isinstance(value, list):
        for index, child in enumerate(value):
            yield from walk_values(child, f"{path}[{index}]")


def primary_identity(definition_name: str, definition: dict[str, Any], value: Any) -> tuple[str, str] | None:
    if not isinstance(value, dict):
        return None
    required = set(definition.get("required", []))
    candidates = [key for key in value if key in required and key.endswith("_id") and key not in {"schema_id", "command_id"}]
    if not candidates:
        return None
    def_tokens = set(re.split(r"[^a-z0-9]+", definition_name.lower())) - IDENTITY_STOPWORDS

    def score(key: str) -> tuple[int, int]:
        key_tokens = set(key[:-3].split("_")) - IDENTITY_STOPWORDS
        return (len(def_tokens & key_tokens), -candidates.index(key))

    key = max(candidates, key=score)
    identity = value.get(key)
    return (key, identity) if isinstance(identity, str) and identity else None


def materialize_invalid(case: dict[str, Any], positives_by_name: dict[str, Any]) -> Any:
    if "value" in case:
        return copy.deepcopy(case["value"])
    if "record" in case:
        return copy.deepcopy(case["record"])
    if "instance" in case:
        return copy.deepcopy(case["instance"])
    if "base_valid" in case:
        base_name = case["base_valid"]
        if base_name not in positives_by_name:
            raise ValueError(f"unknown_base_valid:{base_name}")
        value = copy.deepcopy(positives_by_name[base_name])
        if "patch" in case:
            value = dotted_patch(value, case["patch"])
        if "remove" in case:
            value = remove_paths(value, case["remove"])
        return value
    if "left_valid" in case:
        base_name = case["left_valid"]
        if base_name not in positives_by_name:
            raise ValueError(f"unknown_left_valid:{base_name}")
        return dotted_patch(positives_by_name[base_name], case.get("right_patch", {}))
    raise ValueError("invalid_case_has_no_instance_recipe")


def duplicate_runtime_id_findings(
    runtime_id_locations: dict[tuple[str, str, str], list[str]],
) -> list[dict[str, Any]]:
    findings: list[dict[str, Any]] = []
    for (schema_rel, definition_name, identity), locations in sorted(runtime_id_locations.items()):
        if len(locations) > 1:
            findings.append({
                "code": "duplicate_runtime_record_id",
                "schema": schema_rel,
                "definition": definition_name,
                "identity": identity,
                "locations": locations,
            })
    return findings


def run_internal_self_tests() -> tuple[int, list[dict[str, Any]]]:
    failures: list[dict[str, Any]] = []
    tests = 0

    def check(name: str, operation) -> None:
        nonlocal tests
        tests += 1
        try:
            operation()
        except Exception as exc:  # self-test terminalizes any unexpected shape
            failures.append({"code": "internal_self_test_failed", "test": name, "detail": str(exc)})

    def expect(condition: bool, detail: str) -> None:
        if not condition:
            raise AssertionError(detail)

    def expect_raises(operation, expected: type[BaseException]) -> None:
        try:
            operation()
        except expected:
            return
        raise AssertionError(f"expected_{expected.__name__}")

    check("legacy_positive_protocol", lambda: expect(
        [case["name"] for case in legacy_positive_cases({"valid": [{"name": "legacy", "instance": {"id": "one"}}]})] == ["legacy"],
        "legacy_positive_not_preserved",
    ))
    check("aggregate_root_selector_round_trip", lambda: expect(
        select_definition(
            {"type": "object", "properties": {"schema_id": {"const": "pm.sample.aggregate.v1"}}, "required": ["schema_id"], "$defs": {"helper": {"type": "string"}}},
            {"definition": "<root>"},
            {"schema_id": "pm.sample.aggregate.v1"},
            require_valid=False,
        )[0] == "<root>",
        "aggregate_root_selector_not_preserved",
    ))

    inline_pack = {
        "request_cases": [{"name": "inline", "target_def": "Request", "instance": {"value": 1}}],
        "other_positive_cases": [{"name": "inline_result", "target_def": "Result", "instance": {"value": 2}}],
        "negative_cases": [],
        "coverage": {},
    }
    check("authored_inline_protocol", lambda: expect(
        [case["definition"] for case in authored_positive_cases(inline_pack, request_mode="inline_instance")] == ["Request", "Result"],
        "inline_protocol_not_normalized",
    ))

    template_pack = {
        "fixture_format": "template patch",
        "request_template": {"nested": {"value": 1}},
        "request_cases": [{"name": "templated", "target_def": "Request", "patch": {"nested.value": 2}}],
        "other_positive_cases": [],
        "negative_cases": [],
        "coverage": {},
    }
    check("authored_template_patch_protocol", lambda: expect(
        authored_positive_cases(template_pack, request_mode="template_patch")[0]["instance"]["nested"]["value"] == 2,
        "template_patch_not_materialized",
    ))

    negative_pack = {
        "negative_cases": [{"name": "negative", "target_def": "Request", "base_positive_case": "base", "patch": {"nested.value": 3}}]
    }
    check("authored_base_positive_protocol", lambda: expect(
        materialize_invalid(authored_invalid_cases(negative_pack)[0], {"base": {"nested": {"value": 2}}})["nested"]["value"] == 3,
        "base_positive_case_not_materialized",
    ))

    check("duplicate_case_names_fail_closed", lambda: expect_raises(
        lambda: ensure_unique_case_names([{"name": "duplicate"}, {"name": "duplicate"}], label="positive"),
        ValueError,
    ))
    check("duplicate_runtime_ids_fail_closed", lambda: expect(
        len(duplicate_runtime_id_findings({("schema", "Request", "id=duplicate"): ["one", "two"]})) == 1,
        "duplicate_runtime_id_not_detected",
    ))
    check("malformed_template_patch_fails_closed", lambda: expect_raises(
        lambda: dotted_patch({"nested": {}}, {"nested.missing": 1}, require_existing=True),
        KeyError,
    ))
    check("malformed_authored_envelope_fails_closed", lambda: expect_raises(
        lambda: authored_positive_cases({"request_cases": [{}], "other_positive_cases": [], "negative_cases": [], "coverage": {}}, request_mode="inline_instance"),
        ValueError,
    ))
    mixed_protocol_pack = copy.deepcopy(inline_pack)
    mixed_protocol_pack["valid"] = [{"name": "silently_ignored_without_guard", "instance": {"value": 3}}]
    check("mixed_fixture_protocol_fails_closed", lambda: expect_raises(
        lambda: authored_positive_cases(mixed_protocol_pack, request_mode="inline_instance"),
        ValueError,
    ))
    coverage_schema = {
        "oneOf": [{"$ref": "#/$defs/SampleCommandRequest"}],
        "$defs": {
            "SampleCommandId": {"enum": ["cmd.sample.one"]},
            "SampleCommandRequest": {"properties": {"command_id": {"$ref": "#/$defs/SampleCommandId"}}},
        },
    }
    coverage_fixture = {"coverage": {"exact_command_ids": ["cmd.sample.one"], "request_case_count": 1, "positive_result_case_count": 1, "negative_case_count": 0, "all_commands_have_positive_request_and_result": True}}
    coverage_positives = [
        {"name": "request", "definition": "SampleCommandRequest", "instance": {"command_id": "cmd.sample.one"}, "_fixture_group": "request_cases"},
        {"name": "result", "definition": "SampleCommandResult", "instance": {"command_id": "cmd.sample.one"}, "_fixture_group": "other_positive_cases"},
    ]
    check("authored_request_result_coverage_passes", lambda: expect(
        validate_authored_command_coverage("schema", "fixture", coverage_schema, coverage_fixture, coverage_positives, []) == [],
        "complete_request_result_coverage_rejected",
    ))
    check("authored_request_result_gap_fails_closed", lambda: expect(
        any(
            finding["code"] == "authored_result_coverage_mismatch"
            for finding in validate_authored_command_coverage("schema", "fixture", coverage_schema, coverage_fixture, coverage_positives[:1], [])
        ),
        "missing_result_coverage_not_detected",
    ))
    return tests, failures


def pairwise_invariant_is_violated(left: Any, right: Any) -> bool:
    """Recognize the two authored cross-record replay/idempotency negatives."""
    if not isinstance(left, dict) or not isinstance(right, dict):
        return False
    left_idem, right_idem = left.get("idempotency"), right.get("idempotency")
    if isinstance(left_idem, dict) and isinstance(right_idem, dict):
        if (
            left_idem.get("idempotency_key") == right_idem.get("idempotency_key")
            and left_idem.get("binding_sha256") != right_idem.get("binding_sha256")
        ):
            return True
    return bool(
        right.get("replayed") is True
        and isinstance(right.get("operation_id"), str)
        and isinstance(right.get("original_operation_id"), str)
        and right["operation_id"] != right["original_operation_id"]
    )


def server_remote_semantic_failures(definition_name: str, value: Any) -> list[str]:
    """Evaluate the two cross-field laws JSON Schema annotations cannot express."""

    if not isinstance(value, dict):
        return []
    failures: list[str] = []
    if definition_name == "command_result":
        output = value.get("output")
        if not isinstance(output, dict) or value.get("command_id") != output.get("action"):
            failures.append("command_action_parity")
    elif definition_name == "command_round_trip":
        request, result = value.get("request"), value.get("result")
        if not isinstance(request, dict) or not isinstance(result, dict):
            failures.append("exact_return_context")
        else:
            exact_fields = ("command_id", "command_instance_id", "correlation_id", "return_context")
            if any(request.get(field) != result.get(field) for field in exact_fields):
                failures.append("exact_return_context")
            output = result.get("output")
            if not isinstance(output, dict) or result.get("command_id") != output.get("action"):
                failures.append("command_action_parity")
    return failures


def owner_doc_command_ids(owner_doc: Path, command_prefix: str) -> list[str]:
    text = owner_doc.read_text(encoding="utf-8")
    try:
        section = text.split("### 4.1 Canonical command family requiring central integration", 1)[1]
        section = section.split("### 4.2", 1)[0]
    except IndexError as exc:
        raise ValueError("owner_command_inventory_section_missing") from exc
    ordered: list[str] = []
    for command_id in re.findall(r"`(cmd\.[a-z0-9_.]+)`", section):
        if command_id.startswith(command_prefix) and command_id not in ordered:
            ordered.append(command_id)
    return ordered


def validate_server_remote_inventory(
    schema_rel: str,
    fixture_rel: str,
    schema: dict[str, Any],
    fixtures: dict[str, Any],
    positives: list[dict[str, Any]],
) -> list[dict[str, Any]]:
    check = SERVER_REMOTE_OWNER_CHECKS[schema_rel]
    findings: list[dict[str, Any]] = []
    if fixture_rel != check["fixture"]:
        findings.append({"code": "server_remote_fixture_route_mismatch", "schema": schema_rel, "expected": check["fixture"], "actual": fixture_rel})

    primary_ids = schema.get("x-primary-command-ids")
    command_contracts = schema.get("x-command-contracts")
    if not isinstance(primary_ids, list) or any(not isinstance(value, str) for value in primary_ids):
        findings.append({"code": "server_remote_primary_inventory_missing", "schema": schema_rel})
        return findings
    if len(primary_ids) != check["primary_count"] or len(set(primary_ids)) != len(primary_ids):
        findings.append({"code": "server_remote_primary_inventory_cardinality", "schema": schema_rel, "expected": check["primary_count"], "actual": len(primary_ids)})
    if schema.get("x-primary-command-count") != len(primary_ids):
        findings.append({"code": "server_remote_primary_count_metadata_mismatch", "schema": schema_rel, "expected": len(primary_ids), "actual": schema.get("x-primary-command-count")})
    if not isinstance(command_contracts, dict) or set(command_contracts) != set(primary_ids):
        findings.append({"code": "server_remote_command_contract_inventory_mismatch", "schema": schema_rel, "missing": sorted(set(primary_ids) - set(command_contracts or {})), "extra": sorted(set(command_contracts or {}) - set(primary_ids))})

    coverage = fixtures.get("coverage", {})
    fixture_ids = coverage.get("primary_command_ids")
    if fixture_ids != primary_ids or coverage.get("primary_command_count") != len(primary_ids):
        findings.append({"code": "server_remote_fixture_inventory_mismatch", "fixture": fixture_rel, "expected": primary_ids, "actual": fixture_ids})
    payload_case_names = {
        str(case.get("name", case.get("case_id", "")))
        for case in positives
        if case.get("definition") == "command_payload"
    }
    expected_payload_names = {f"positive.payload.{command_id}" for command_id in primary_ids}
    if payload_case_names != expected_payload_names:
        findings.append({"code": "server_remote_payload_coverage_mismatch", "fixture": fixture_rel, "missing": sorted(expected_payload_names - payload_case_names), "extra": sorted(payload_case_names - expected_payload_names)})
    if coverage.get("payload_positive_case_count") != len(expected_payload_names):
        findings.append({"code": "server_remote_payload_count_metadata_mismatch", "fixture": fixture_rel, "expected": len(expected_payload_names), "actual": coverage.get("payload_positive_case_count")})

    aliases = schema.get("x-compatibility-aliases", [])
    alias_inputs = [entry.get("input_id") for entry in aliases if isinstance(entry, dict)]
    if schema.get("x-compatibility-alias-count", 0) != len(alias_inputs) or len(set(alias_inputs)) != len(alias_inputs):
        findings.append({"code": "server_remote_alias_inventory_cardinality", "schema": schema_rel, "aliases": alias_inputs})
    fixture_aliases = coverage.get("compatibility_aliases", [])
    fixture_alias_inputs = [entry.get("input_id") for entry in fixture_aliases if isinstance(entry, dict)]
    if coverage.get("compatibility_alias_count", 0) != len(alias_inputs) or fixture_alias_inputs != alias_inputs:
        findings.append({"code": "server_remote_fixture_alias_inventory_mismatch", "fixture": fixture_rel, "expected": alias_inputs, "actual": fixture_alias_inputs})
    alias_case_names = {
        str(case.get("name", case.get("case_id", "")))
        for case in positives
        if case.get("definition") == "compatibility_alias"
    }
    expected_alias_names = {f"positive.alias.{command_id}" for command_id in alias_inputs}
    if alias_case_names != expected_alias_names:
        findings.append({"code": "server_remote_alias_coverage_mismatch", "fixture": fixture_rel, "missing": sorted(expected_alias_names - alias_case_names), "extra": sorted(alias_case_names - expected_alias_names)})

    owner_doc = ROOT / check["owner_doc"]
    try:
        doc_ids = owner_doc_command_ids(owner_doc, check["command_prefix"])
    except (OSError, ValueError) as exc:
        findings.append({"code": "server_remote_owner_inventory_unreadable", "owner_doc": check["owner_doc"], "detail": str(exc)})
    else:
        doc_primary = [command_id for command_id in doc_ids if command_id not in alias_inputs]
        if doc_primary != primary_ids:
            findings.append({"code": "server_remote_owner_primary_inventory_mismatch", "owner_doc": check["owner_doc"], "expected": primary_ids, "actual": doc_primary})
        actual_doc_aliases = [command_id for command_id in doc_ids if command_id in alias_inputs]
        if actual_doc_aliases != alias_inputs:
            findings.append({"code": "server_remote_owner_alias_inventory_mismatch", "owner_doc": check["owner_doc"], "expected": alias_inputs, "actual": actual_doc_aliases})
        owner_text = owner_doc.read_text(encoding="utf-8")
        if schema_rel not in owner_text or fixture_rel not in owner_text:
            findings.append({"code": "server_remote_owner_missing_canonical_pair", "owner_doc": check["owner_doc"], "schema": schema_rel, "fixture": fixture_rel})
        if check["retired_schema"] in owner_text or check["retired_fixture"] in owner_text:
            findings.append({"code": "server_remote_owner_retains_retired_pair", "owner_doc": check["owner_doc"], "retired_schema": check["retired_schema"], "retired_fixture": check["retired_fixture"]})
    return findings


def main() -> int:
    findings: list[dict[str, Any]] = []
    counts = Counter()
    schema_hosts: defaultdict[str, list[str]] = defaultdict(list)
    schema_uri_locations: defaultdict[str, list[str]] = defaultdict(list)
    runtime_id_locations: defaultdict[tuple[str, str, str], list[str]] = defaultdict(list)

    if len(CONTRACT_PAIRS) != EXPECTED_CONTRACT_PAIR_COUNT or len(set(CONTRACT_PAIRS)) != EXPECTED_CONTRACT_PAIR_COUNT:
        findings.append({"code": "authored_manifest_cardinality_or_uniqueness_failure", "expected": EXPECTED_CONTRACT_PAIR_COUNT, "actual": len(CONTRACT_PAIRS)})

    self_test_count, self_test_failures = run_internal_self_tests()
    counts["internal_self_tests"] = self_test_count
    counts["internal_self_tests_passed"] = self_test_count - len(self_test_failures)
    findings.extend(self_test_failures)

    try:
        schema_registry = offline_schema_registry()
    except (OSError, json.JSONDecodeError, ValueError) as exc:
        findings.append({"code": "offline_schema_registry_build_failed", "detail": str(exc)})
        schema_registry = Registry(retrieve=lambda uri: (_ for _ in ()).throw(ValueError(f"unregistered schema URI: {uri}")))

    expansion_findings, expansion_counts = validate_expansion_fixture_pack(schema_registry)
    findings.extend(expansion_findings)
    counts.update(expansion_counts)

    for schema_rel, fixture_rel in CONTRACT_PAIRS:
        schema_path, fixture_path = ROOT / schema_rel, ROOT / fixture_rel
        authored_config = AUTHORED_COMMAND_PAIR_CONTRACTS.get(schema_rel)
        counts["contract_pairs"] += 1
        try:
            schema, fixtures = load_json(schema_path), load_json(fixture_path)
        except (OSError, json.JSONDecodeError) as exc:
            findings.append({"code": "contract_input_unreadable", "path": str(getattr(exc, "filename", None) or schema_rel), "detail": str(exc)})
            continue

        try:
            Draft202012Validator.check_schema(schema)
            counts["metaschemas_valid"] += 1
        except SchemaError as exc:
            findings.append({"code": "draft_2020_12_metaschema_failure", "schema": schema_rel, "detail": exc.message})
            continue
        if schema.get("$schema") != "https://json-schema.org/draft/2020-12/schema":
            findings.append({"code": "wrong_or_missing_metaschema", "schema": schema_rel, "actual": schema.get("$schema")})

        schema_uri = schema.get("$id")
        if isinstance(schema_uri, str):
            schema_uri_locations[schema_uri].append(schema_rel)
            match = re.match(r"^https://([^/]+)/", schema_uri)
            if match:
                schema_hosts[match.group(1)].append(schema_rel)

        expected_owner = fixture_rel.replace("_fixtures.json", "s.schema.json")
        if authored_config is not None and fixture_rel != authored_config["fixture"]:
            findings.append({"code": "authored_command_fixture_route_mismatch", "schema": schema_rel, "expected": authored_config["fixture"], "actual": fixture_rel})
        if "owner_schema" in fixtures and fixtures["owner_schema"] != schema_rel:
            findings.append({"code": "stale_owner_schema_path", "fixture": fixture_rel, "expected": schema_rel, "actual": fixtures["owner_schema"]})
        if "schema_ref" in fixtures and fixtures["schema_ref"] != schema_rel:
            findings.append({"code": "stale_schema_ref", "fixture": fixture_rel, "expected": schema_rel, "actual": fixtures["schema_ref"]})
        if authored_config is not None and "contract_schema" in fixtures and fixtures["contract_schema"] != schema_rel:
            findings.append({"code": "stale_contract_schema_path", "fixture": fixture_rel, "expected": schema_rel, "actual": fixtures["contract_schema"]})
        if authored_config is not None and "owner_schema" not in fixtures and "contract_schema" not in fixtures:
            findings.append({"code": "authored_command_owner_schema_path_missing", "fixture": fixture_rel})
        if "contract_schema_id" in fixtures and fixtures["contract_schema_id"] != schema.get("x-schema-id"):
            findings.append({"code": "stale_aggregate_owner_id", "fixture": fixture_rel, "expected": schema.get("x-schema-id"), "actual": fixtures["contract_schema_id"]})

        defs = schema.get("$defs", {})
        runtime_schema_id_policy = effective_runtime_schema_id_policy(schema_rel, schema)
        if runtime_schema_id_policy == "aggregate_plus_record_kind":
            owner_id = schema.get("x-schema-id")
            branch_kinds = [
                const_fingerprint(defs.get(name, {})).get("record_kind")
                for name in root_definition_names(schema)
            ]
            if (
                not isinstance(owner_id, str)
                or not owner_id
                or any(not isinstance(kind, str) for kind in branch_kinds)
                or len(set(branch_kinds)) != len(branch_kinds)
            ):
                findings.append({
                    "code": "invalid_aggregate_plus_record_kind_declaration",
                    "schema": schema_rel,
                    "x_schema_id": owner_id,
                    "record_kinds": branch_kinds,
                })
        aggregate_ids: defaultdict[str, list[tuple[str, str | None]]] = defaultdict(list)
        for definition_name in root_definition_names(schema):
            fingerprint = const_fingerprint(defs.get(definition_name, {}))
            runtime_schema_id = fingerprint.get("schema_id")
            if isinstance(runtime_schema_id, str):
                aggregate_ids[runtime_schema_id].append((definition_name, fingerprint.get("record_kind")))
        for runtime_schema_id, members in aggregate_ids.items():
            if len(members) < 2:
                continue
            record_kinds = [record_kind for _, record_kind in members]
            if (
                runtime_schema_id_policy != "aggregate_plus_record_kind"
                or schema.get("x-schema-id") != runtime_schema_id
                or any(not isinstance(record_kind, str) for record_kind in record_kinds)
                or len(set(record_kinds)) != len(record_kinds)
            ):
                findings.append({
                    "code": "undocumented_or_stale_aggregate_owner_id",
                    "schema": schema_rel,
                    "runtime_schema_id": runtime_schema_id,
                    "x_schema_id": schema.get("x-schema-id"),
                    "policy": runtime_schema_id_policy,
                    "definitions": [{"definition": name, "record_kind": kind} for name, kind in members],
                })
        pack_id = fixture_pack_id(fixtures)
        try:
            if authored_config is not None:
                positives = authored_positive_cases(fixtures, request_mode=authored_config["request_mode"])
                invalids = authored_invalid_cases(fixtures)
                findings.extend(validate_authored_command_coverage(schema_rel, fixture_rel, schema, fixtures, positives, invalids))
            else:
                positives = legacy_positive_cases(fixtures)
                invalids = []
                invalids.extend(fixtures.get("invalid", []))
                invalids.extend(fixtures.get("negative", []))
                invalids.extend(fixtures.get("negative_cases", []))
                invalids.extend(fixtures.get("pairwise_invalid", []))
        except (KeyError, IndexError, TypeError, ValueError) as exc:
            findings.append({"code": "fixture_envelope_or_materialization_failure", "fixture": fixture_rel, "detail": str(exc)})
            continue
        positive_by_name: dict[str, Any] = {}
        selected_by_name: dict[str, str] = {}

        for case in positives:
            counts["positive_cases"] += 1
            name = str(case.get("name", case.get("case_id", "unnamed")))
            value = case.get("value", case.get("record", case.get("instance")))
            positive_by_name[name] = value
            try:
                definition_name, selected = select_definition(schema, case, value, require_valid=True)
                selected_by_name[name] = definition_name
                errors = list(validator_for(schema, selected, schema_registry).iter_errors(value))
                if errors:
                    findings.append({"code": "positive_fixture_rejected", "fixture": fixture_rel, "case": name, "definition": definition_name, "detail": errors[0].message})
                    continue
                if schema_rel in SERVER_REMOTE_OWNER_CHECKS:
                    semantic_failures = server_remote_semantic_failures(definition_name, value)
                    if semantic_failures:
                        findings.append({"code": "positive_semantic_invariant_failure", "fixture": fixture_rel, "case": name, "definition": definition_name, "semantic_failures": semantic_failures})
                        continue
                counts["positive_cases_valid"] += 1
                definition = defs.get(definition_name, schema)
                identity = primary_identity(definition_name, definition, value)
                if identity:
                    key, identity_value = identity
                    runtime_id_locations[(schema_rel, definition_name, f"{key}={identity_value}")].append(f"{fixture_rel}:{name}")
            except ValueError as exc:
                findings.append({"code": "positive_definition_selection_failed", "fixture": fixture_rel, "case": name, "detail": str(exc)})

            if pack_id is not None:
                for path, nested in walk_values(value):
                    if nested == pack_id:
                        findings.append({"code": "fixture_pack_id_used_as_runtime_value", "fixture": fixture_rel, "case": name, "path": path, "value": pack_id})

            if isinstance(value, dict) and isinstance(value.get("schema_id"), str) and value.get("schema_id") == schema.get("x-schema-id"):
                policy = runtime_schema_id_policy
                record_kind = value.get("record_kind")
                definition = defs.get(selected_by_name.get(name, ""), {})
                kind_const = const_fingerprint(definition).get("record_kind")
                if policy != "aggregate_plus_record_kind" or not isinstance(record_kind, str) or record_kind != kind_const:
                    findings.append({"code": "undocumented_aggregate_runtime_schema_id", "schema": schema_rel, "case": name, "schema_id": value.get("schema_id"), "required_policy": "aggregate_plus_record_kind"})

        if schema_rel in SERVER_REMOTE_OWNER_CHECKS:
            findings.extend(validate_server_remote_inventory(schema_rel, fixture_rel, schema, fixtures, positives))

        for case in invalids:
            counts["negative_cases"] += 1
            name = str(case.get("name", case.get("case_id", "unnamed")))
            try:
                value = materialize_invalid(case, positive_by_name)
                selector_case = dict(case)
                if "definition" not in selector_case and "schema_ref" not in selector_case:
                    base_name = selector_case.get("base_valid", selector_case.get("left_valid"))
                    if base_name in selected_by_name:
                        selector_case["definition"] = selected_by_name[base_name]
                definition_name, selected = select_definition(schema, selector_case, value, require_valid=False)
                accepted = validator_for(schema, selected, schema_registry).is_valid(value)
                semantic_rule = case.get("semantic_rule")
                if semantic_rule is not None and schema_rel in SERVER_REMOTE_OWNER_CHECKS:
                    semantic_failures = server_remote_semantic_failures(definition_name, value)
                    if not accepted:
                        findings.append({"code": "semantic_negative_not_structurally_valid", "fixture": fixture_rel, "case": name, "definition": definition_name, "semantic_rule": semantic_rule})
                    elif semantic_rule not in semantic_failures:
                        findings.append({"code": "semantic_negative_not_proven", "fixture": fixture_rel, "case": name, "definition": definition_name, "semantic_rule": semantic_rule, "semantic_failures": semantic_failures})
                    else:
                        counts["negative_cases_rejected"] += 1
                elif case in fixtures.get("pairwise_invalid", []):
                    left = positive_by_name.get(case.get("left_valid"))
                    # Both records must remain structurally valid; rejection is
                    # the authored relation invariant, not a malformed record.
                    if not accepted or not pairwise_invariant_is_violated(left, value):
                        findings.append({"code": "pairwise_negative_not_proven", "fixture": fixture_rel, "case": name, "definition": definition_name})
                    else:
                        counts["negative_cases_rejected"] += 1
                elif accepted:
                    findings.append({"code": "expected_negative_accepted", "fixture": fixture_rel, "case": name, "definition": definition_name})
                else:
                    counts["negative_cases_rejected"] += 1
            except (KeyError, IndexError, TypeError, ValueError) as exc:
                findings.append({"code": "negative_definition_selection_failed", "fixture": fixture_rel, "case": name, "detail": str(exc)})

        if "negative_mutations" in fixtures:
            base = fixtures.get("positive_instance")
            for case in fixtures["negative_mutations"]:
                counts["negative_cases"] += 1
                name = str(case.get("case_id", "unnamed"))
                try:
                    value = pointer_set(base, case["json_pointer"], case.get("replacement"))
                    if Draft202012Validator(schema).is_valid(value):
                        findings.append({"code": "expected_negative_accepted", "fixture": fixture_rel, "case": name, "definition": "<root>"})
                    else:
                        counts["negative_cases_rejected"] += 1
                except (KeyError, IndexError, ValueError, TypeError) as exc:
                    findings.append({"code": "negative_mutation_invalid", "fixture": fixture_rel, "case": name, "detail": str(exc)})

    if len(schema_hosts) > 1:
        findings.append({"code": "mixed_schema_hosts", "hosts": {host: paths for host, paths in sorted(schema_hosts.items())}})
    for host, paths in sorted(schema_hosts.items()):
        if host != ALLOWED_SCHEMA_HOST:
            findings.append({"code": "noncanonical_schema_host", "host": host, "schemas": paths})
    for schema_uri, paths in sorted(schema_uri_locations.items()):
        if len(paths) > 1:
            findings.append({"code": "duplicate_full_schema_id", "schema_id": schema_uri, "schemas": paths})
    findings.extend(duplicate_runtime_id_findings(runtime_id_locations))

    report = {
        "check": "validate-new-contracts",
        "status": "pass" if not findings else "fail",
        "claim_boundary": "static_schema_and_fixture_consistency_only",
        "inputs": [{"schema": schema, "fixtures": fixtures} for schema, fixtures in CONTRACT_PAIRS],
        "counts": dict(sorted(counts.items())),
        "findings": findings,
        "failures": findings,
    }
    print(json.dumps(report, indent=2, sort_keys=True))
    return 0 if not findings else 1


if __name__ == "__main__":
    sys.exit(main())
