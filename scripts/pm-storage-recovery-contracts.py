#!/usr/bin/env python3
"""Validate storage preflight, progress, and terminal migration receipt contracts.

This validator enforces the local arithmetic and cross-field assertion vocabulary
recursively.  It does not run a migration, touch a store, or prove crash recovery.
"""

from __future__ import annotations

import argparse
import copy
import json
import math
import re
from datetime import datetime
from pathlib import Path
from typing import Any

from jsonschema import Draft202012Validator, FormatChecker


ROOT = Path(__file__).resolve().parents[1]
PLANS = ROOT / "Plans"
SCHEMA_PATH = PLANS / "storage_recovery_contracts.schema.json"
FIXTURE_PATH = PLANS / "storage_recovery_contract_fixtures.json"
REGISTRY_PATH = PLANS / "storage_value_registry.json"
TOKEN_OR_PATH_RE = re.compile(
    r"^(?:sk-[A-Za-z0-9_-]{8,}|Bearer\s+\S+|[A-Za-z]:[\\/]|/|file://|\\\\)",
    re.IGNORECASE,
)


def read_json(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8"))


def timestamp(value: str) -> datetime:
    return datetime.fromisoformat(value.replace("Z", "+00:00"))


def definition_validator(schema: dict[str, Any], name: str) -> Draft202012Validator:
    return Draft202012Validator(
        {**schema["$defs"][name], "$defs": schema["$defs"]},
        format_checker=FormatChecker(),
    )


def local_ref_names(value: Any) -> set[str]:
    names: set[str] = set()
    if isinstance(value, dict):
        ref = value.get("$ref")
        if isinstance(ref, str) and ref.startswith("#/$defs/"):
            names.add(ref.removeprefix("#/$defs/"))
        for child in value.values():
            names.update(local_ref_names(child))
    elif isinstance(value, list):
        for child in value:
            names.update(local_ref_names(child))
    return names


def transitive_definitions(schema: dict[str, Any], root_name: str) -> dict[str, Any]:
    definitions = schema["$defs"]
    pending = list(local_ref_names(definitions[root_name]))
    collected: dict[str, Any] = {}
    while pending:
        name = pending.pop()
        if name == root_name or name in collected:
            continue
        if name not in definitions:
            raise ValueError(f"{root_name} references missing local definition {name}")
        collected[name] = copy.deepcopy(definitions[name])
        pending.extend(local_ref_names(definitions[name]) - collected.keys())
    return {name: collected[name] for name in sorted(collected)}


def bundled_definition_schema(schema: dict[str, Any], name: str) -> dict[str, Any]:
    bundle = {
        "$schema": "https://json-schema.org/draft/2020-12/schema",
        "$id": (
            "https://puppetmaster.local/schemas/storage_value/"
            f"{name}/1.0.0/{name}.schema.json"
        ),
        **copy.deepcopy(schema["$defs"][name]),
        "$defs": transitive_definitions(schema, name),
    }
    Draft202012Validator.check_schema(bundle)
    return bundle


def registry_bundle_failures(
    registry: dict[str, Any], schema: dict[str, Any]
) -> list[str]:
    failures: list[str] = []
    rows = [
        row for row in registry.get("families", [])
        if row.get("family_id") == "migration_receipt"
    ]
    if len(rows) != 1:
        return ["migration_receipt_row_count"]
    row = rows[0]
    if (
        row.get("value_schema_ref")
        != "Plans/storage_recovery_contracts.schema.json#/$defs/migration_receipt"
    ):
        failures.append("migration_receipt_owner_ref")
    expected = bundled_definition_schema(schema, "migration_receipt")
    if row.get("value_schema") != expected:
        failures.append("migration_receipt_bundle_mismatch")
    try:
        Draft202012Validator.check_schema(row.get("value_schema", {}))
    except Exception:  # noqa: BLE001 - negative self-tests intentionally inject bad refs
        failures.append("migration_receipt_bundle_invalid_schema")
    return failures


def walk_refs(value: Any, path: str = "$") -> list[tuple[str, str]]:
    refs: list[tuple[str, str]] = []
    if isinstance(value, dict):
        for key, child in value.items():
            child_path = f"{path}.{key}"
            if key.endswith("_ref") and isinstance(child, str):
                refs.append((child_path, child))
            elif key.endswith("_refs") and isinstance(child, list):
                refs.extend(
                    (f"{child_path}[{index}]", item)
                    for index, item in enumerate(child)
                    if isinstance(item, str)
                )
            refs.extend(walk_refs(child, child_path))
    elif isinstance(value, list):
        for index, child in enumerate(value):
            refs.extend(walk_refs(child, f"{path}[{index}]"))
    return refs


def preflight_semantic_failures(value: dict[str, Any], prefix: str = "$") -> list[str]:
    failures: list[str] = []
    expected_reserve = max(
        268435456,
        math.ceil(0.10 * (value["backup_bytes"] + value["staging_bytes"])),
    )
    if value["reserve_bytes"] != expected_reserve:
        failures.append(f"{prefix}.reserve_bytes:reserve_formula")
    expected_required = value["backup_bytes"] + value["staging_bytes"] + value["reserve_bytes"]
    if value["required_free_bytes"] != expected_required:
        failures.append(f"{prefix}.required_free_bytes:required_free_formula")
    if value["outcome"] == "ready" and value["free_bytes"] < value["required_free_bytes"]:
        failures.append(f"{prefix}.free_bytes:ready_space_pairing")
    if value["outcome"] == "blocked" and value["free_bytes"] >= value["required_free_bytes"]:
        failures.append(f"{prefix}.free_bytes:blocked_space_pairing")
    return failures


def semantic_failures(value: dict[str, Any], definition: str) -> list[str]:
    failures: list[str] = []
    for path, ref in walk_refs(value):
        if TOKEN_OR_PATH_RE.search(ref):
            failures.append(f"{path}:secret_or_absolute_path_ref")

    if definition == "migration_preflight_result":
        failures.extend(preflight_semantic_failures(value))

    if definition == "migration_progress_snapshot":
        if value["completed_steps"] > value["total_steps"]:
            failures.append("$.completed_steps:step_bounds")
        if "bytes_done" in value and value["bytes_done"] > value["bytes_total"]:
            failures.append("$.bytes_done:byte_bounds")
        if "preflight_result" in value:
            failures.extend(
                preflight_semantic_failures(value["preflight_result"], "$.preflight_result")
            )

    if definition == "migration_receipt":
        failures.extend(
            preflight_semantic_failures(value["preflight_result"], "$.preflight_result")
        )
        if timestamp(value["completed_at_utc"]) < timestamp(value["started_at_utc"]):
            failures.append("$.completed_at_utc:completed_before_started")
        if value["from_version"] == value["to_version"]:
            failures.append("$.to_version:migration_version_did_not_change")
        step_ids = [step["step_id"] for step in value["applied_steps"]]
        if len(step_ids) != len(set(step_ids)):
            failures.append("$.applied_steps:duplicate_step_id")
        for key in ("store_transitions", "family_transitions"):
            identities = [item["store_or_family_id"] for item in value[key]]
            if len(identities) != len(set(identities)):
                failures.append(f"$.{key}:duplicate_transition_identity")
        status = value["terminal_status"]
        step_statuses = {step["status"] for step in value["applied_steps"]}
        if status == "committed" and step_statuses.intersection({"failed", "rolled_back"}):
            failures.append("$.applied_steps:committed_contains_failed_or_rolled_back_step")
        if status == "rolled_back" and "rolled_back" not in step_statuses:
            failures.append("$.applied_steps:rolled_back_receipt_missing_rolled_back_step")
        if value["rollback_result"] is not None and not value["rollback_available"]:
            failures.append("$.rollback_result:result_without_available_rollback")
    return failures


def validate_instance(value: Any, definition: str, schema: dict[str, Any]) -> list[str]:
    schema_errors = [
        error.message
        for error in definition_validator(schema, definition).iter_errors(value)
    ]
    if schema_errors or not isinstance(value, dict):
        return schema_errors
    return semantic_failures(value, definition)


def nested_patch(value: dict[str, Any], patch: dict[str, Any]) -> dict[str, Any]:
    result = copy.deepcopy(value)
    for dotted_key, child in patch.items():
        target: dict[str, Any] = result
        parts = dotted_key.split(".")
        for part in parts[:-1]:
            target = target[part]
        target[parts[-1]] = child
    return result


def self_test() -> dict[str, Any]:
    schema = read_json(SCHEMA_PATH)
    fixtures = read_json(FIXTURE_PATH)
    Draft202012Validator.check_schema(schema)
    valid_by_name = {fixture["name"]: fixture for fixture in fixtures["valid"]}
    checks: dict[str, bool] = {}
    for fixture in fixtures["valid"]:
        checks[fixture["name"]] = not validate_instance(
            fixture["value"], fixture["definition"], schema
        )
    for fixture in fixtures["invalid"]:
        base = valid_by_name[fixture["base_valid"]]
        candidate = nested_patch(base["value"], fixture["patch"])
        checks[fixture["name"]] = bool(
            validate_instance(candidate, base["definition"], schema)
        )

    registry = read_json(REGISTRY_PATH)
    rows = [row for row in registry["families"] if row["family_id"] == "migration_receipt"]
    checks["registry_has_exact_transitive_migration_receipt_bundle"] = not (
        registry_bundle_failures(registry, schema)
    )
    if rows:
        inline_validator = Draft202012Validator(
            rows[0]["value_schema"], format_checker=FormatChecker()
        )
        committed = valid_by_name["committed_receipt_with_verified_steps"]["value"]
        checks["registry_inline_accepts_valid_receipt"] = not list(
            inline_validator.iter_errors(committed)
        )

        drift_cases: dict[str, tuple[str, Any]] = {
            "registry_rejects_root_constraint_drift": (
                "allOf.0.then.properties.rollback_result.type",
                "object",
            ),
            "registry_rejects_transitive_definition_drift": (
                "$defs.non_secret_ref.maxLength",
                511,
            ),
            "registry_rejects_unresolved_local_ref": (
                "properties.journal_ref.$ref",
                "#/$defs/missing_definition",
            ),
            "registry_rejects_external_ref": (
                "properties.journal_ref.$ref",
                "https://example.invalid/unowned.schema.json",
            ),
        }
        for check_name, (dotted_path, replacement) in drift_cases.items():
            drifted = copy.deepcopy(registry)
            drifted_row = next(
                row for row in drifted["families"]
                if row["family_id"] == "migration_receipt"
            )
            target: Any = drifted_row["value_schema"]
            parts = dotted_path.split(".")
            for part in parts[:-1]:
                target = target[int(part)] if isinstance(target, list) else target[part]
            if isinstance(target, list):
                target[int(parts[-1])] = replacement
            else:
                target[parts[-1]] = replacement
            checks[check_name] = "migration_receipt_bundle_mismatch" in (
                registry_bundle_failures(drifted, schema)
            )
    failures = sorted(name for name, passed in checks.items() if not passed)
    return {"checks": checks, "failures": failures, "status": "pass" if not failures else "fail"}


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--self-test", action="store_true")
    args = parser.parse_args()
    if not args.self_test:
        parser.error("--self-test is required")
    report = self_test()
    print(json.dumps(report, indent=2, sort_keys=True))
    return 0 if report["status"] == "pass" else 1


if __name__ == "__main__":
    raise SystemExit(main())
