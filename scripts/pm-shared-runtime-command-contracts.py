#!/usr/bin/env python3
"""Validate shared-runtime command schemas, bindings, compatibility, and wiring.

This is a bounded pre-build validator.  It does not dispatch commands, implement
handlers, admit EventRecord types, or prove runtime behavior.
"""

from __future__ import annotations

import argparse
import copy
import json
import re
from pathlib import Path
from typing import Any

from jsonschema import Draft202012Validator, FormatChecker


ROOT = Path(__file__).resolve().parents[1]
PLANS = ROOT / "Plans"
SCHEMA_PATH = PLANS / "shared_runtime_command_contracts.schema.json"
BINDINGS_PATH = PLANS / "shared_runtime_command_bindings.json"
FIXTURE_PATH = PLANS / "shared_runtime_command_contract_fixtures.json"
WIRING_PATH = PLANS / "Wiring_Matrix.production.json"
WIRING_SCHEMA_PATH = PLANS / "Wiring_Matrix.schema.json"
EXCLUSIONS_PATH = PLANS / "Wiring_Matrix.production.exclusions.json"
TOKEN_OR_PATH_RE = re.compile(
    r"^(?:sk-[A-Za-z0-9_-]{8,}|Bearer\s+\S+|[A-Za-z]:[\\/]|/|file://|\\\\)",
    re.IGNORECASE,
)


def read_json(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8"))


def resolve_definition(ref: str, schema: dict[str, Any]) -> str:
    prefix = "Plans/shared_runtime_command_contracts.schema.json#/$defs/"
    if not ref.startswith(prefix):
        raise ValueError(f"unsupported command schema ref {ref}")
    name = ref[len(prefix):]
    if name not in schema["$defs"]:
        raise ValueError(f"missing command schema definition {name}")
    return name


def definition_validator(schema: dict[str, Any], name: str) -> Draft202012Validator:
    return Draft202012Validator(
        {**schema["$defs"][name], "$defs": schema["$defs"]},
        format_checker=FormatChecker(),
    )


def nested_patch(value: dict[str, Any], patch: dict[str, Any]) -> dict[str, Any]:
    result = copy.deepcopy(value)
    for dotted_key, child in patch.items():
        target: dict[str, Any] = result
        parts = dotted_key.split(".")
        for part in parts[:-1]:
            target = target[part]
        target[parts[-1]] = child
    return result


def semantic_instance_failures(value: Any, definition: str) -> list[str]:
    if not isinstance(value, dict):
        return []
    failures: list[str] = []
    if definition.endswith("_request"):
        idempotency = value.get("idempotency", {})
        if idempotency.get("idempotency_key") == value.get("command_instance_id"):
            failures.append("idempotency_key_must_not_substitute_command_instance_id")
    if definition.endswith("_result"):
        if value.get("replayed") and value.get("operation_id") != value.get("original_operation_id"):
            failures.append("replayed_result_minted_new_operation_id")
        if value.get("outcome") == "accepted" and value.get("terminal_owner_result_ref") is not None:
            failures.append("accepted_cannot_claim_terminal_owner_result")
    if definition == "command_cancellation":
        if value.get("state") == "acknowledged" and (
            value.get("cleanup_evidence_ref") is not None
            or value.get("terminal_result_ref") is not None
        ):
            failures.append("cancellation_acknowledgement_is_not_cleanup")
    for key, child in value.items():
        if (key.endswith("_ref") or key.endswith("_refs")) and isinstance(child, str):
            if TOKEN_OR_PATH_RE.search(child):
                failures.append(f"secret_or_absolute_path_in_{key}")
    return failures


def instance_failures(value: Any, definition: str, schema: dict[str, Any]) -> list[str]:
    errors = [
        error.message
        for error in definition_validator(schema, definition).iter_errors(value)
    ]
    if errors:
        return errors
    return semantic_instance_failures(value, definition)


def fixture_checks(schema: dict[str, Any]) -> dict[str, bool]:
    fixtures = read_json(FIXTURE_PATH)
    valid_by_name = {fixture["name"]: fixture for fixture in fixtures["valid"]}
    checks: dict[str, bool] = {}
    for fixture in fixtures["valid"]:
        checks[fixture["name"]] = not instance_failures(
            fixture["value"], fixture["definition"], schema
        )
    for fixture in fixtures["invalid"]:
        base = valid_by_name[fixture["base_valid"]]
        candidate = nested_patch(base["value"], fixture.get("patch", {}))
        for key in fixture.get("remove", []):
            candidate.pop(key, None)
        checks[fixture["name"]] = bool(
            instance_failures(candidate, base["definition"], schema)
        )
    for fixture in fixtures["pairwise_invalid"]:
        base = valid_by_name[fixture["left_valid"]]
        left = base["value"]
        right = nested_patch(left, fixture["right_patch"])
        if fixture["name"] == "same_idempotency_key_different_binding":
            checks[fixture["name"]] = (
                left["idempotency"]["idempotency_key"]
                == right["idempotency"]["idempotency_key"]
                and left["idempotency"]["binding_sha256"]
                != right["idempotency"]["binding_sha256"]
            )
        elif fixture["name"] == "replay_cannot_mint_new_operation_identity":
            checks[fixture["name"]] = bool(
                semantic_instance_failures(right, base["definition"])
            )
        else:
            checks[fixture["name"]] = False
    return checks


def exclusion_tokens(exclusions: Any) -> set[str]:
    if isinstance(exclusions, dict):
        rows = exclusions.get(
            "excluded_tokens",
            exclusions.get("exclusions", exclusions.get("entries", [])),
        )
    else:
        rows = exclusions
    tokens: set[str] = set()
    if isinstance(rows, list):
        for row in rows:
            if isinstance(row, str):
                tokens.add(row)
            elif isinstance(row, dict):
                for key in ("command_id", "ui_command_id", "candidate_id", "token"):
                    if isinstance(row.get(key), str):
                        tokens.add(row[key])
    elif isinstance(rows, dict):
        tokens.update(str(key) for key in rows)
        for row in rows.values():
            if isinstance(row, dict):
                for key in ("command_id", "ui_command_id", "candidate_id", "token"):
                    if isinstance(row.get(key), str):
                        tokens.add(row[key])
    return tokens


def validate() -> dict[str, Any]:
    schema = read_json(SCHEMA_PATH)
    bindings = read_json(BINDINGS_PATH)
    wiring_schema = read_json(WIRING_SCHEMA_PATH)
    wiring = read_json(WIRING_PATH)
    exclusions = read_json(EXCLUSIONS_PATH)
    Draft202012Validator.check_schema(schema)
    Draft202012Validator.check_schema(wiring_schema)

    failures: list[str] = []
    wiring_errors = list(
        Draft202012Validator(
            wiring_schema, format_checker=FormatChecker()
        ).iter_errors(wiring)
    )
    if wiring_errors:
        failures.extend(f"wiring_schema:{error.message}" for error in wiring_errors)

    rows = bindings["bindings"]
    canonical_ids = [row["command_id"] for row in rows]
    schema_ids = schema["$defs"]["canonical_command_id"]["enum"]
    if len(rows) != 26 or len(set(canonical_ids)) != 26:
        failures.append("canonical_binding_count_or_uniqueness_not_26")
    if set(canonical_ids) != set(schema_ids):
        failures.append("binding_and_schema_command_id_sets_differ")

    production_by_command: dict[str, list[tuple[str, dict[str, Any]]]] = {}
    for entry_id, entry in wiring["entries"].items():
        production_by_command.setdefault(entry["ui_command_id"], []).append((entry_id, entry))

    for row in rows:
        try:
            resolve_definition(row["request_schema_ref"], schema)
            resolve_definition(row["result_schema_ref"], schema)
        except ValueError as error:
            failures.append(str(error))
        matches = production_by_command.get(row["command_id"], [])
        if len(matches) != 1:
            failures.append(f"{row['command_id']}:production_wiring_count={len(matches)}")
            continue
        entry_id, entry = matches[0]
        for expected, actual, field in (
            (row["wiring_entry_id"], entry_id, "wiring_entry_id"),
            (row["handler"], entry["handler_location"], "handler"),
            (row["request_schema_ref"], entry.get("request_schema_ref"), "request_schema_ref"),
            (row["result_schema_ref"], entry.get("result_schema_ref"), "result_schema_ref"),
        ):
            if expected != actual:
                failures.append(f"{row['command_id']}:{field}_mismatch")
        if entry["expected_event_types"]:
            failures.append(f"{row['command_id']}:unexpected_event_types")
        if entry["effect_contract"]["effect_kind"] != "receipt":
            failures.append(f"{row['command_id']}:effect_not_receipt")
        if "missing_event_registration" not in entry["effect_contract"]["receipt_or_event_refs"]:
            failures.append(f"{row['command_id']}:missing_event_registration_marker_absent")

    wrapper = bindings["wrapper_binding"]
    wrapper_matches = production_by_command.get(wrapper["command_id"], [])
    if len(wrapper_matches) != 1:
        failures.append("remote_wrapper_production_wiring_count_not_one")
    else:
        entry_id, entry = wrapper_matches[0]
        if entry_id != wrapper["wiring_entry_id"] or entry["handler_location"] != wrapper["handler"]:
            failures.append("remote_wrapper_handler_or_entry_mismatch")
        if entry.get("request_schema_ref") != wrapper["request_schema_ref"]:
            failures.append("remote_wrapper_request_schema_mismatch")
        if entry.get("result_schema_ref") != wrapper["result_schema_ref"]:
            failures.append("remote_wrapper_result_schema_mismatch")
        if entry["expected_event_types"]:
            failures.append("remote_wrapper_unexpected_event_types")

    compatibility = bindings["compatibility"]
    rejected = bindings["rejected"]
    candidate_ids = canonical_ids + [row["candidate_id"] for row in compatibility + rejected]
    if len(candidate_ids) != 34 or len(set(candidate_ids)) != 34:
        failures.append("candidate_census_not_exactly_34_unique")
    excluded = exclusion_tokens(exclusions)
    for row in compatibility + rejected:
        candidate_id = row["candidate_id"]
        if production_by_command.get(candidate_id):
            failures.append(f"{candidate_id}:noncanonical_primary_wiring_present")
        if candidate_id not in excluded:
            failures.append(f"{candidate_id}:missing_production_exclusion")
    lsp = next((row for row in compatibility if row["candidate_id"] == "cmd.lsp.server.diagnose"), None)
    if lsp is None or lsp["canonical_target_ids"] != ["cmd.lsp.open_problems"]:
        failures.append("lsp_diagnose_compatibility_mapping_missing_or_wrong")
    elif len(production_by_command.get("cmd.lsp.open_problems", [])) != 1:
        failures.append("lsp_open_problems_target_not_wired_exactly_once")

    checks = fixture_checks(schema)
    failures.extend(f"fixture:{name}" for name, passed in checks.items() if not passed)
    return {
        "schema_id": "pm.shared_runtime.command_contract_validation.v1",
        "scope": "pre_build_static_contract_only",
        "canonical_binding_count": len(rows),
        "compatibility_count": len(compatibility),
        "rejected_count": len(rejected),
        "wrapper_count": 1,
        "fixture_checks": checks,
        "failures": sorted(set(failures)),
        "passed": not failures,
    }


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("command", nargs="?", choices=("validate",), default="validate")
    args = parser.parse_args()
    report = validate()
    print(json.dumps(report, indent=2, sort_keys=True))
    return 0 if report["passed"] else 1


if __name__ == "__main__":
    raise SystemExit(main())
