#!/usr/bin/env python3
"""Check/materialize only the existing Onboarding storage-family value schema.

This does not execute migration, add a family/policy, refresh a lock, or certify
native runtime. Metadata and owner decisions remain authored canonical Plans.
"""

from __future__ import annotations

import argparse
import json
from pathlib import Path

from jsonschema import Draft202012Validator
from pm_onboarding_semantics import onboarding_storage_value_schema


ROOT = Path(__file__).resolve().parents[1]


def expected_bundle():
    return onboarding_storage_value_schema(*[
        json.loads((ROOT / "Plans" / name).read_text())
        for name in ("product_onboarding_contracts.schema.json", "project_system_contracts.schema.json",
                     "settings_system_contracts.schema.json")
    ])


def nullable(definition, bundle):
    if definition.get("type") == "null" or "null" in definition.get("type", []):
        return True
    if "$ref" in definition:
        return nullable(bundle["$defs"][definition["$ref"].removeprefix("#/$defs/")], bundle)
    return any(nullable(branch, bundle) for key in ("oneOf", "anyOf") for branch in definition.get(key, []))


def expected_fields(bundle):
    required = bundle["required"]
    return dict(value_schema_id=bundle["properties"]["schema_id"]["const"],
                schema_version=bundle["properties"]["schema_version"]["const"],
                required_fields=required, optional_fields=sorted(set(bundle["properties"]) - set(required)),
                nullable_fields=sorted(key for key, value in bundle["properties"].items() if nullable(value, bundle)),
                value_schema=bundle)


def validate(registry):
    failures = []
    rows = [row for row in registry["families"] if row["family_id"] == "onboarding_state"]
    if len(rows) != 1:
        return ["onboarding_storage_family_count"]
    bundle = expected_bundle()
    Draft202012Validator.check_schema(bundle)
    row = rows[0]
    for key, expected in expected_fields(bundle).items():
        if row.get(key) != expected:
            failures.append("onboarding_storage_" + key + "_drift")
    if row["key_shape"] != "onboarding_state.v3:{onboarding_session_id}":
        failures.append("onboarding_storage_current_write_key")
    if row["compatibility_key_shapes"] != ["onboarding_state.v2:{onboarding_session_id}", "onboarding_state.v1:{project_id}", "onboarding:v1"]:
        failures.append("onboarding_storage_predecessor_key_census")
    return failures


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--materialize", action="store_true", help="Regenerate only exact inline owner schema/field metadata.")
    parser.add_argument("--check", action="store_true", help="Read-only check (the default).")
    args = parser.parse_args()
    path = ROOT / "Plans/storage_value_registry.json"
    registry = json.loads(path.read_text())
    if args.materialize:
        row = next(row for row in registry["families"] if row["family_id"] == "onboarding_state")
        row.update(expected_fields(expected_bundle()))
        path.write_text(json.dumps(registry, indent=2) + "\n")
    failures = validate(registry)
    print(json.dumps(dict(check="validate-onboarding-storage-contract", status="fail" if failures else "pass",
                          claim_boundary="static_existing_family_schema_consistency_only", failures=failures), indent=2))
    return int(bool(failures))


if __name__ == "__main__":
    raise SystemExit(main())
