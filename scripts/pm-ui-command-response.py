#!/usr/bin/env python3
"""Validate central response joins and global declared wiring consumption."""

from __future__ import annotations

import argparse
import copy
import json
from pathlib import Path
import sys

from jsonschema import Draft202012Validator

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT / "scripts") not in sys.path:
    sys.path.insert(0, str(ROOT / "scripts"))
import pm_ui_command_response as owner

RESPONSE_REF = "Plans/ui_command_response.schema.json"


def materialize(base, patch):
    result = copy.deepcopy(base)
    for path, value in patch.items():
        target = result
        parts = path.split(".")
        for part in parts[:-1]:
            target = target[part]
        target[parts[-1]] = value
    return result


def validate(*, fixtures_only=False):
    failures = []
    fixtures = json.loads((ROOT / "Plans/ui_command_response_fixtures.json").read_text())
    for path in (owner.RESPONSE_SCHEMA, owner.OUTCOME_SCHEMA, owner.SHARED_SCHEMA):
        Draft202012Validator.check_schema(owner.schema(path))
    ids = [row["case_id"] for rows in (fixtures["valid"], fixtures["invalid"]) for row in rows]
    if len(ids) != len(set(ids)):
        failures.append({"error": "duplicate_case_identity"})
    positives = {row["case_id"]: row for row in fixtures["valid"]}
    for name, value in positives.items():
        errors = owner.response_bundle_failures(value)
        if errors:
            failures.append({"case_id": name, "error": "positive_rejected", "detail": errors})
    for row in fixtures["invalid"]:
        value = materialize(positives[row["base_case_id"]], row["patch"])
        errors = owner.response_bundle_failures(value)
        if row["expected_error"] not in errors:
            failures.append({"case_id": row["case_id"], "error": "negative_not_rejected_for_expected_reason", "detail": errors})
    required_states = set(owner.schema(owner.OUTCOME_SCHEMA)["$defs"]["CommandOutcomeRecord"]["properties"]["outcome"]["enum"])
    if {row["outcome"]["outcome"] for row in positives.values() if row["outcome"]} != required_states:
        failures.append({"error": "outcome_state_census"})
    wiring = json.loads((ROOT / "Plans/Wiring_Matrix.production.json").read_text())
    envelope = owner.schema(owner.SHARED_SCHEMA)["$defs"]["command_result_envelope"]
    if "command_outcome_ref" not in envelope["required"]:
        failures.append({"error": "shared_result_missing_outcome_binding"})
    commands = owner.schema(owner.SHARED_SCHEMA)["$defs"]["canonical_command_id"]["enum"]
    covered = {row["ui_command_id"] for row in wiring["entries"].values()}
    if not set(commands) <= covered:
        failures.append({"error": "shared_command_wiring_missing", "commands": sorted(set(commands) - covered)})
    if not fixtures_only and wiring.get("response_contract_ref") != RESPONSE_REF:
        failures.append({"error": "production_wiring_missing_central_response_contract"})
    declared = not fixtures_only and wiring.get("response_contract_ref") == RESPONSE_REF
    typed_rows = sum(bool(row.get("result_schema_ref")) for row in wiring["entries"].values())
    return {
        "schema_id": "pm.ui_command_response_validation.v1",
        "status": "fail" if failures else ("fixtures_valid_consumption_not_claimed" if fixtures_only else "pass"),
        "positive_cases": len(positives), "negative_cases": len(fixtures["invalid"]),
        "outcome_states": len(required_states), "shared_commands_with_outcome_binding": len(commands),
        "wiring_rows_consuming_response_contract": len(wiring["entries"]) if declared else 0,
        "wiring_rows_with_explicit_typed_result_ref": typed_rows,
        "wiring_rows_without_explicit_typed_result_ref": len(wiring["entries"]) - typed_rows,
        "native_owner_adapters_proven": 0,
        "claim_boundary": "Static cross-record joins and declared response-contract consumption, not native dispatch, authenticated lookup, owner verification, effect execution, full numeric RFC8785, UI wiring implementation or readiness.",
        "failures": failures,
    }


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--fixtures-only", action="store_true")
    args = parser.parse_args()
    try:
        report = validate(fixtures_only=args.fixtures_only)
    except Exception as error:
        report = {"status": "fail", "failures": [{"error": "response_contract_input_error", "detail": str(error)}]}
    print(json.dumps(report, indent=2, sort_keys=True))
    raise SystemExit(bool(report["failures"]))
