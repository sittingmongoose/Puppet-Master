#!/usr/bin/env python3
"""Fail-closed static validator for the Working Notebook contract family.

Validates Plans/working_notebook_contract_fixtures.json positive fixtures against
Plans/working_notebook_contracts.schema.json, proves every encoded negative
fixture is rejected, checks explicitly encoded invariants, and cross-checks the
storage_value_registry.json notebook family rows. Static schema/fixture evidence
only: this validator never executes runtime behavior and never certifies native
handlers, providers, recovery, security, visual, or performance layers.
"""

from __future__ import annotations

import argparse
import copy
import json
import re
import sys
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[1]
SCHEMA_PATH = ROOT / "Plans" / "working_notebook_contracts.schema.json"
FIXTURES_PATH = ROOT / "Plans" / "working_notebook_contract_fixtures.json"
REGISTRY_PATH = ROOT / "Plans" / "storage_value_registry.json"

EXPECTED_SCHEMA_ID = "pm.working_notebook_contracts.v1"
EXPECTED_FIXTURE_SCHEMA_ID = "pm.working_notebook_contract_fixtures.v1"

EXPECTED_REGISTRY_FAMILIES = {
    "working_notebook_record": "pm.storage_value.working_notebook_record.v1",
    "working_notebook_entry_record": "pm.storage_value.working_notebook_entry_record.v1",
    "notebook_checkpoint_record": "pm.storage_value.notebook_checkpoint_record.v1",
    "context_transition_record": "pm.storage_value.context_transition_record.v1",
}

ENTRY_ID_RE = re.compile(r"^wne_[A-Za-z0-9]+$")
HEX64_RE = re.compile(r"^[0-9a-fA-F]{64}$")

# Fail-closed fixture inventory: a validator that accepts an emptied or shuffled
# fixture corpus proves nothing. These pins make coverage loss a validation failure.
EXPECTED_NEGATIVE_IDS = {
    "neg_bad_epistemic_kind", "neg_body_over_limit", "neg_unknown_lifecycle",
    "neg_thread_scope_missing_thread", "neg_capsule_over_token_bound",
    "neg_capsule_over_byte_bound", "neg_committed_checkpoint_without_receipt",
    "neg_transition_native_success_without_observation",
    "neg_transition_done_rotated_conflation", "neg_unknown_tool",
    "neg_mixed_range_convention", "neg_unknown_error_code",
    "neg_applied_without_result_revision", "neg_conflict_without_conflicting_revision",
    "neg_import_without_restriction", "neg_crash_after_commit_discards_checkpoint",
    "neg_crash_before_commit_claims_checkpoint", "neg_chatread_missing_thread",
    "neg_fresh_context_legacy_arg_name", "neg_read_negative_offset",
    "neg_read_unknown_arg", "neg_write_create_with_entry_id",
    "neg_success_without_new_window", "neg_success_unavailable_controller",
    "neg_write_update_without_expected_revision", "neg_supersede_unknown_target_state",
    "neg_chatread_without_message_or_item",
}
FAMILY_MINIMUMS = {
    "notebooks": 1, "entry_envelopes": 3, "revision_mutations": 3,
    "resume_capsules": 1, "notebook_checkpoints": 1, "context_transitions": 4,
    "tool_requests": 7, "typed_errors": 3,
}
ANCHOR_RECORDS = {
    "notebooks": ["nb_01JEXAMPLENOTEBOOK"],
    "entry_envelopes": ["wne_01JEXAMPLEENTRY01", "wne_01JEXAMPLESTALE02", "wne_01JEXAMPLEIMPORT03"],
    "context_transitions": ["cwt_01JEXAMPLETRANS01", "cwt_01JEXAMPLECRASH01",
                             "cwt_01JEXAMPLECRASH02", "cwt_01JEXAMPLECRASH03"],
    "notebook_checkpoints": ["nbc_01JEXAMPLECKPT01"],
}
TOOL_COVERAGE = {"notebook_search", "notebook_read", "notebook_write",
                 "notebook_supersede", "fresh_context_request", "chatread"}
EXPECTED_SCENARIO_IDS = {f"WNC-A{i:02d}" for i in range(1, 63)}
SCENARIO_DISPOSITIONS = {"static_fixture", "owner_prose_only", "runtime_only_future"}


def _parse_mutation_path(path: str) -> list:
    tokens: list = []
    for segment in path.split("."):
        head, *brackets = segment.split("[")
        if head:
            tokens.append(head)
        for bracket in brackets:
            tokens.append(int(bracket.rstrip("]")))
    return tokens


def load_json(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8"))


def apply_mutation(document: dict[str, Any], mutation: dict[str, Any]) -> Any:
    # Keep the required envelope keys so rejection is caused by the mutation
    # itself, never by a vacuously missing schema_id/schema_version.
    mutated: dict[str, Any] = {
        "schema_id": EXPECTED_SCHEMA_ID,
        "schema_version": "1.0.0",
        **copy.deepcopy(document["positive"]),
    }
    path = mutation["path"]
    if "value_char_count" in mutation:
        value = "x" * int(mutation["value_char_count"])
    else:
        value = copy.deepcopy(mutation["value"])
    tokens = _parse_mutation_path(path)
    target: Any = mutated
    for token in tokens[:-1]:
        target = target[token]
    target[tokens[-1]] = value
    return mutated


def resolve_validator_pointer(schema: dict[str, Any], fixture_pointer: str) -> dict[str, Any]:
    """Map a fixture pointer like 'entry_envelopes[0]' onto its schema subschema."""
    match = re.match(r"^([a-z_]+)\[(\d+)\]$", fixture_pointer)
    if match is None:
        raise ValueError(f"unparsable fixture pointer: {fixture_pointer}")
    family, position = match.group(1), int(match.group(2))
    family_schema = schema["properties"][family]
    if "$ref" in family_schema:
        ref = family_schema["$ref"]
        target = schema
        for segment in ref.lstrip("#/").split("/"):
            target = target[segment]
        return target
    return family_schema.get("items", family_schema)


def iter_validation_errors(schema: dict[str, Any], document: Any) -> list[Any] | None:
    try:
        import jsonschema
    except ImportError:  # pragma: no cover - environment guard
        return None
    validator = jsonschema.Draft202012Validator(schema)
    return list(validator.iter_errors(document))


def validate_with_jsonschema(schema: dict[str, Any], document: Any) -> list[str]:
    errors = iter_validation_errors(schema, document)
    if errors is None:  # pragma: no cover - environment guard
        return ["environment_error: jsonschema library unavailable"]
    return [error.message for error in sorted(errors, key=str)]


def check_explicit_invariants(fixtures: dict[str, Any]) -> list[str]:
    problems: list[str] = []
    for index, entry in enumerate(fixtures["positive"]["entry_envelopes"]):
        label = f"entry_envelopes[{index}]"
        if entry["epistemic_kind"] == "verified":
            problems.append(f"{label}: verified epistemic kind is forbidden (WN-002)")
        if not HEX64_RE.match(entry["body_sha256"]):
            problems.append(f"{label}: body_sha256 must be 64 hex chars")
        if len(entry["body"].encode("utf-8")) > 65536:
            problems.append(f"{label}: body exceeds 64 KiB UTF-8 (WN-006)")
    for index, capsule in enumerate(fixtures["positive"]["resume_capsules"]):
        label = f"resume_capsules[{index}]"
        if capsule["estimated_tokens"] > 512 or capsule["body_bytes"] > 2048:
            problems.append(f"{label}: capsule exceeds 512 tokens / 2 KiB bounds (WN-009)")
        for ref in capsule["source_revisions"]:
            if not ENTRY_ID_RE.match(ref["entry_id"]):
                problems.append(f"{label}: malformed entry ref {ref['entry_id']}")
    for index, checkpoint in enumerate(fixtures["positive"]["notebook_checkpoints"]):
        label = f"notebook_checkpoints[{index}]"
        if checkpoint["state"] == "committed" and not checkpoint.get("commit_receipt_ref"):
            problems.append(f"{label}: committed checkpoint without commit receipt (WN-016)")
        if checkpoint["state"] in {"preparing", "failed"} and checkpoint.get("commit_receipt_ref"):
            problems.append(f"{label}: partial checkpoint carries a commit receipt (WN-016)")
    for index, entry in enumerate(fixtures["positive"]["entry_envelopes"]):
        label = f"entry_envelopes[{index}]"
        imported = any(ref.get("kind") == "note_entry" for ref in entry.get("provenance_refs", []))
        if imported and not entry.get("restriction_refs"):
            problems.append(f"{label}: imported note entered without derivative restrictions (WN-015/WNC-A12)")
    for index, transition in enumerate(fixtures["positive"]["context_transitions"]):
        label = f"context_transitions[{index}]"
        if transition["state"] in {"activated", "recovered_resumed"}:
            if not transition.get("admission_receipt_ref"):
                problems.append(f"{label}: success state without observed admission boundary (WNC-C05)")
            if not transition.get("checkpoint_ref"):
                problems.append(f"{label}: success state without committed checkpoint (WNC-C06)")
            if not transition.get("new_context_window_id"):
                problems.append(f"{label}: success state without an established next-window identity (WNC-C05/WNC-R03)")
            if transition.get("effective_controller") not in {"pm_managed", "provider_native"}:
                problems.append(f"{label}: success state recorded under an unavailable/degraded controller (WNC-P01/WNC-R03)")
        if transition["reason"] == "run_rotation":
            problems.append(f"{label}: fresh-window transition conflated with run rotation (WNC-C01)")
        if transition["requested_controller"] == "pm_managed" and transition["effective_controller"] == "provider_native" and not transition.get("failure_reason"):
            problems.append(f"{label}: controller strategy changed without recording the effective-path reason (WNC-P01)")
        failure = transition.get("failure_reason")
        if isinstance(failure, str) and failure.startswith("crash_after_"):
            if not transition.get("checkpoint_ref"):
                problems.append(f"{label}: crash after commit must retain the committed checkpoint ref (WNC-C08)")
        if failure == "crash_before_checkpoint_commit" and transition.get("checkpoint_ref"):
            problems.append(f"{label}: crash before commit cannot claim a committed checkpoint (WNC-C08)")
    for index, request in enumerate(fixtures["positive"]["tool_requests"]):
        label = f"tool_requests[{index}]"
        args = request.get("args", {})
        range_spec = args.get("range")
        if isinstance(range_spec, dict) and range_spec.get("convention") in {"unicode_char_offsets", "utf8_byte_offsets"}:
            start, end = range_spec.get("start"), range_spec.get("end")
            if isinstance(start, int) and isinstance(end, int) and end < start:
                problems.append(f"{label}: reversed range (end < start) corrupts evidence addressing (WNC-H04)")
        if request.get("tool") == "notebook_write":
            operation = args.get("operation")
            if operation == "create":
                if args.get("entry_id") is not None or args.get("expected_revision") is not None:
                    problems.append(f"{label}: create mints the entry host-side; it cannot carry a preassigned entry id or expected revision (WNC-N06)")
                if not args.get("body"):
                    problems.append(f"{label}: create without a bounded body (WNC-N05)")
            elif operation in {"update", "append"}:
                if not isinstance(args.get("expected_revision"), int) or not args.get("entry_id"):
                    problems.append(f"{label}: update/append require the CAS expected revision and an entry id (WNC-N06)")
                if len(args.get("body", "").encode("utf-8")) > 65536:
                    problems.append(f"{label}: write body exceeds 64 KiB UTF-8 (WNC-N05)")
    for index, error in enumerate(fixtures["positive"]["typed_errors"]):
        label = f"typed_errors[{index}]"
        if error.get("nondiscriminating") and error.get("detail"):
            problems.append(f"{label}: nondiscriminating error leaks detail (WN-020)")
    return problems


def check_registry_linkage(registry: dict[str, Any]) -> list[str]:
    problems: list[str] = []
    families = {family.get("family_id"): family for family in registry.get("families", [])}
    for family_id, expected_schema_id in EXPECTED_REGISTRY_FAMILIES.items():
        family = families.get(family_id)
        if family is None:
            problems.append(f"storage_value_registry missing notebook family {family_id}")
            continue
        if family.get("value_schema_id") != expected_schema_id:
            problems.append(
                f"family {family_id} value_schema_id {family.get('value_schema_id')!r} != expected {expected_schema_id!r}"
            )
        if family.get("status") not in {"deferred_not_build_blocking", "materialized"}:
            problems.append(f"family {family_id} has unexpected status {family.get('status')!r}")
        if not family.get("retention_policy_ref"):
            problems.append(f"family {family_id} missing retention_policy_ref")
        redaction = family.get("redaction_no_secret_rule")
        if not isinstance(redaction, str) or not redaction.strip():
            problems.append(f"family {family_id} missing redaction_no_secret_rule")
    return problems


def check_fixture_inventory(fixtures: dict[str, Any]) -> list[str]:
    """Fail-open validation is no validation: pin the fixture corpus itself (WNC-R04)."""
    problems: list[str] = []
    positive = fixtures.get("positive")
    if not isinstance(positive, dict):
        return ["positive fixture families missing entirely"]
    for family, minimum in FAMILY_MINIMUMS.items():
        rows = positive.get(family)
        if not isinstance(rows, list) or len(rows) < minimum:
            problems.append(f"positive family {family} has fewer than {minimum} records (coverage loss)")
    for family, ids in ANCHOR_RECORDS.items():
        rows = positive.get(family, [])
        id_field = {"notebooks": "notebook_id", "entry_envelopes": "entry_id",
                    "context_transitions": "transition_id", "notebook_checkpoints": "checkpoint_id"}[family]
        present = {row.get(id_field) for row in rows}
        for anchor in ids:
            if anchor not in present:
                problems.append(f"anchor record {family}/{anchor} missing from the fixture corpus")
    tools = {request.get("tool") for request in positive.get("tool_requests", [])}
    for tool in sorted(TOOL_COVERAGE - tools):
        problems.append(f"no positive request covers registered tool {tool}")
    negatives = fixtures.get("negative", [])
    seen = [negative.get("negative_id") for negative in negatives]
    for negative_id in sorted(set(seen) - EXPECTED_NEGATIVE_IDS):
        problems.append(f"unknown negative fixture id {negative_id!r} (inventory drift)")
    for negative_id in sorted(EXPECTED_NEGATIVE_IDS - set(seen)):
        problems.append(f"required negative fixture {negative_id!r} missing (coverage loss)")
    if len(seen) != len(set(seen)):
        problems.append("duplicate negative fixture ids present")
    scenario_map = fixtures.get("acceptance_scenario_map") or {}
    scenarios = scenario_map.get("scenarios") or {}
    present_ids = set(scenarios)
    for missing in sorted(EXPECTED_SCENARIO_IDS - present_ids):
        problems.append(f"acceptance scenario {missing} missing from the scenario map")
    for extra in sorted(present_ids - EXPECTED_SCENARIO_IDS):
        problems.append(f"unknown acceptance scenario {extra} in the scenario map")
    for scenario_id, entry in sorted(scenarios.items()):
        if isinstance(entry, dict) and entry.get("disposition") not in SCENARIO_DISPOSITIONS:
            problems.append(f"scenario {scenario_id} has disposition {entry.get('disposition')!r}")
    return problems


def run_validation(
    fixtures: dict[str, Any] | None = None,
    schema: dict[str, Any] | None = None,
    registry: dict[str, Any] | None = None,
) -> dict[str, Any]:
    checks: list[dict[str, Any]] = []
    schema = schema if schema is not None else load_json(SCHEMA_PATH)
    fixtures = fixtures if fixtures is not None else load_json(FIXTURES_PATH)

    if schema.get("schema_id") is None and schema.get("$id") is None:
        checks.append({"name": "schema_identity", "status": "fail", "detail": "schema missing $id"})
    checks.append({"name": "fixtures_schema_id", "status": "pass" if fixtures.get("schema_id") == EXPECTED_FIXTURE_SCHEMA_ID else "fail", "detail": fixtures.get("schema_id")})
    if fixtures.get("schema_id") != EXPECTED_FIXTURE_SCHEMA_ID:
        return {"status": "fail", "checks": checks}

    positive_document = {"schema_id": EXPECTED_SCHEMA_ID, "schema_version": "1.0.0", **fixtures["positive"]}
    positive_errors = validate_with_jsonschema(schema, positive_document)
    checks.append({
        "name": "positive_fixtures_validate",
        "status": "pass" if not positive_errors else "fail",
        "detail": positive_errors[:10],
    })

    negative_results: list[dict[str, Any]] = []
    for negative in fixtures.get("negative", []):
        # Fail closed: a corpus so broken that a mutation cannot even be applied
        # is a validation failure, not a crash (WNC-R04).
        try:
            mutated = apply_mutation(fixtures, negative["mutation"])
        except Exception as error:  # noqa: BLE001 - deliberate fail-closed net
            negative_results.append({
                "negative_id": negative.get("negative_id"),
                "rejected": False,
                "attributed": False,
                "rejects": negative.get("rejects"),
                "sample_error": f"mutation could not be applied against this corpus: {error!r}",
            })
            continue
        raw_errors = iter_validation_errors(schema, mutated)
        if raw_errors is None:  # pragma: no cover - environment guard
            errors: list[str] = ["environment_error: jsonschema library unavailable"]
            raw_errors = []
        else:
            errors = [error.message for error in sorted(raw_errors, key=str)]
        rejected = bool(errors)
        # Constraint-specific attribution: the rejection must be caused at (or under)
        # the intended object, not by an unrelated subschema (WNC-R04). jsonschema
        # reports `required`/`additionalProperties` violations at the parent object,
        # so parent-level errors within the mutated record count when they name the
        # mutated leaf or sit at or above the mutated location.
        mutated_tokens = _parse_mutation_path(negative["mutation"]["path"])

        def _attributed(error: Any) -> bool:
            path = list(error.absolute_path)
            if path[: len(mutated_tokens)] == mutated_tokens:
                return True
            if path[:2] != mutated_tokens[:2]:
                return False
            if len(path) <= len(mutated_tokens):
                return True
            leaf = mutated_tokens[-1]
            return isinstance(leaf, str) and leaf in (error.message or "")

        attributed = any(_attributed(error) for error in raw_errors)
        result = {
            "negative_id": negative["negative_id"],
            "rejected": rejected,
            "attributed": attributed,
            "rejects": negative.get("rejects"),
            "sample_error": errors[0] if errors else None,
        }
        negative_results.append(result)
    rejected_all = all(result["rejected"] for result in negative_results)
    attributed_all = all(result["attributed"] for result in negative_results)
    checks.append({
        "name": "negative_fixtures_rejected",
        "status": "pass" if rejected_all and attributed_all and negative_results else "fail",
        "detail": [result for result in negative_results if not result["rejected"] or not result["attributed"]],
    })

    invariants = check_explicit_invariants(fixtures)
    checks.append({
        "name": "explicit_invariants",
        "status": "pass" if not invariants else "fail",
        "detail": invariants,
    })

    inventory = check_fixture_inventory(fixtures)
    checks.append({
        "name": "fixture_inventory_integrity",
        "status": "pass" if not inventory else "fail",
        "detail": inventory,
    })

    registry = registry if registry is not None else load_json(REGISTRY_PATH)
    linkage = check_registry_linkage(registry)
    checks.append({
        "name": "storage_registry_linkage",
        "status": "pass" if not linkage else "fail",
        "detail": linkage,
    })

    failed = [check for check in checks if check["status"] != "pass"]
    return {
        "status": "fail" if failed else "pass",
        "validator": "pm-working-notebook-contracts",
        "schema_ref": "Plans/working_notebook_contracts.schema.json",
        "fixtures_ref": "Plans/working_notebook_contract_fixtures.json",
        "evidence_boundary": "static schema and fixture validation only; runtime NOT_RUN",
        "negative_fixture_count": len(negative_results),
        "checks": checks,
    }


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    # `validate` is the documented PlanUnit invocation form (WN/ATS validation
    # surfaces); it is the default behavior, accepted explicitly for interface
    # compatibility (WNC-R05).
    parser.add_argument("command", nargs="?", choices=["validate"], help="optional; 'validate' is the default behavior")
    parser.add_argument("--json", action="store_true", help="print the full JSON verdict")
    args = parser.parse_args(argv)
    try:
        report = run_validation()
    except Exception as error:  # fail closed on any unexpected condition
        report = {"status": "fail", "unexpected_error": repr(error)}
    print(json.dumps(report, indent=2, sort_keys=True))
    if not args.json:
        summary = "PASS" if report["status"] == "pass" else "FAIL"
        print(f"working-notebook-contracts: {summary}", file=sys.stderr)
    return 0 if report["status"] == "pass" else 1


if __name__ == "__main__":
    sys.exit(main())
