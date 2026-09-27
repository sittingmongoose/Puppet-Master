#!/usr/bin/env python3
"""Materialize/check the Release-owned application check schedule's Storage binding.

Static schema/registry consistency only; does not write a product store, migrate a
store, refresh governance or admit a native scheduler.
"""
from __future__ import annotations

import argparse
import copy
import json
from pathlib import Path

from jsonschema import Draft202012Validator

ROOT = Path(__file__).resolve().parents[1]
FAMILY = "application_update_check_schedule"
SCHEMA = "Plans/release_update_contracts.schema.json"
DEFINITION = "ApplicationUpdateCheckScheduleState"
OWNER = "Plans/storage-plan.md#application-update-check-schedule-persistence-2026-09-27"


def owner_bundle() -> dict:
    source = json.loads((ROOT / SCHEMA).read_text())
    root = copy.deepcopy(source["$defs"][DEFINITION])
    selected = {}

    def visit(value):
        if isinstance(value, dict):
            ref = value.get("$ref")
            if isinstance(ref, str):
                if not ref.startswith("#/$defs/"):
                    raise ValueError("schedule owner bundle requires registered local definitions: " + ref)
                name = ref.removeprefix("#/$defs/")
                if "/" in name or name not in source["$defs"]:
                    raise ValueError("unresolved schedule definition: " + ref)
                if name not in selected:
                    selected[name] = copy.deepcopy(source["$defs"][name])
                    visit(selected[name])
            for child in value.values():
                visit(child)
        elif isinstance(value, list):
            for child in value:
                visit(child)

    visit(root)
    bundle = {"$schema": "https://json-schema.org/draft/2020-12/schema", **root}
    if selected:
        bundle["$defs"] = selected
    Draft202012Validator.check_schema(bundle)
    return bundle


def nullable(value, bundle):
    if value.get("type") == "null" or (isinstance(value.get("type"), list) and "null" in value["type"]):
        return True
    if "$ref" in value:
        return nullable(bundle["$defs"][value["$ref"].removeprefix("#/$defs/")], bundle)
    return any(nullable(child, bundle) for key in ("oneOf", "anyOf") for child in value.get(key, []))


def expected_row() -> dict:
    bundle = owner_bundle()
    if bundle["properties"]["schema_id"].get("const") != "pm.release_update.check_schedule_state.v1":
        raise ValueError("schedule storage v1 requires an explicit migration for a changed owner schema ID")
    refs = [OWNER, "Plans/Release_Supply_Chain.md#RSC-014", SCHEMA + "#/$defs/" + DEFINITION]
    return {
        "family_id": FAMILY,
        "storage_kind": "redb",
        "status": "materialized",
        "tier": "later_gui_or_feature_projection",
        "key_shape": "application_update_check_schedule.v1:{home_server_id}:{application_id}:{channel_id}",
        "compatibility_key_shapes": [],
        "value_schema_id": bundle["properties"]["schema_id"]["const"],
        "value_schema_ref": SCHEMA + "#/$defs/" + DEFINITION,
        "owner_doc": OWNER,
        "producer": ["ApplicationUpdateService"],
        "consumers": ["application update scheduler", "manual Check coalescer", "restart recovery"],
        "schema_version": "1.0.0",
        "encoding": "messagepack_canonical",
        "required_fields": bundle["required"],
        "optional_fields": sorted(set(bundle["properties"]) - set(bundle["required"])),
        "nullable_fields": sorted(key for key, value in bundle["properties"].items() if nullable(value, bundle)),
        "replay_behavior": "Read exact Server/application/channel canonical state before computing due work. Restart, cache and failure never advance successful-check time.",
        "migration": "StorageMigrationCoordinator enrolls/converts under exclusive migration authority, verified backup, transactional value validation and final store-version stamp; reopen/readback before writer admission. No rewrite-on-read or SQLite.",
        "migration_disposition": {"mode": "current_schema", "canonical_write_key_only": True, "compatibility_keys_read_only": False, "ambiguity_policy": "not_applicable", "source_refs": refs},
        "restore_disposition": {"mode": "mandatory_backup", "transaction_family_id": None, "outcome_owner_ref": OWNER, "mutation_fence_on_unresolved": True, "source_refs": refs},
        "recovery_disposition": {"authority_class": "canonical_non_rebuildable", "strategy": "restore_from_mandatory_backup", "source_family_ids": [], "source_refs": refs, "backup_required": True, "data_loss_if_unavailable": True, "user_disclosure_required": True},
        "retention_compaction": "RP-CONFIG-CURRENT retains current state and bounded predecessor history; stronger holds retain referenced recovery/audit state. Do not compact away the last successful-check basis or live backoff.",
        "retention_policy_ref": "RP-CONFIG-CURRENT",
        "redaction_no_secret_rule": "Store only IDs, timestamps, bounded schedule values, hashes and non-secret refs; reject credentials, signing keys, protected browser content and local absolute paths.",
        "legacy_canonical_crosswalk_status": "First exact family registration for SP-322/RSC-014; scheduling authority is not installation lifecycle state or a Project settings copy. Static materialization only, no native write admission.",
        "value_schema": bundle,
    }


def validate(registry: dict) -> list[str]:
    rows = [row for row in registry["families"] if row["family_id"] == FAMILY]
    if len(rows) != 1:
        return ["application_update_schedule_family_count"]
    expected = expected_row()
    return ["application_update_schedule_" + key + "_drift" for key, value in expected.items() if rows[0].get(key) != value]


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--materialize", action="store_true")
    parser.add_argument("--check", action="store_true")
    args = parser.parse_args()
    path = ROOT / "Plans/storage_value_registry.json"
    registry = json.loads(path.read_text())
    if args.materialize:
        rows = [row for row in registry["families"] if row["family_id"] == FAMILY]
        if len(rows) > 1:
            raise ValueError("duplicate application update schedule family")
        expected = expected_row()
        if rows:
            rows[0].clear()
            rows[0].update(expected)
        else:
            registry["families"].append(expected)
        path.write_text(json.dumps(registry, indent=2) + "\n")
    failures = validate(registry)
    print(json.dumps({"check": "application-update-schedule-storage", "status": "fail" if failures else "pass", "claim_boundary": "static_owner_schema_registry_consistency", "failures": failures}, indent=2))
    return int(bool(failures))


if __name__ == "__main__":
    raise SystemExit(main())
