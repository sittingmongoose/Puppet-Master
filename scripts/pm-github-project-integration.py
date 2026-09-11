#!/usr/bin/env python3
"""GitHub/Project candidate joins with explicit DL-039 non-admission."""

from __future__ import annotations

import copy
import json
from functools import lru_cache
from pathlib import Path

from jsonschema import Draft202012Validator, FormatChecker
from referencing import Resource

import pm_ui_command_response as response
import pm_project_forge_contract as forge
from pm_emit_only_event_contract import (
    DENIAL, DISPOSITION, deny_admission, disposition_failures,
    input_shape_failures, invalid_input_report,
)

ROOT = Path(__file__).resolve().parents[1]
PAYLOAD = "Plans/github_project_event_payloads.schema.json"
ADMISSION = "Plans/github_project_event_admission.json"
EVENTS = {
    "github.repo.create_requested": ("create_requested", "application", "GitHubIntegration.repository_creation", "Plans/GitHub_Integration.md#GI-042"),
    "project.github_repo_bound": ("project_bound", "project", "ProjectRegistry.forge_registration", "Plans/Project_System.md#PJCT-008"),
}


@lru_cache(maxsize=None)
def load(path):
    return json.loads((ROOT / path).read_text(encoding="utf-8"))


def fixture_bundle():
    """Reuse real owner shapes; synthetic owner resolution proves no authority."""
    rows = load("Plans/project_system_contract_fixtures.json")["valid"]
    request = copy.deepcopy(next(row["value"] for row in rows if row["name"] == "command_project_new_github_repo"))
    project = copy.deepcopy(next(row["value"] for row in rows if row["name"] == "listed_git_project_is_identity_not_path"))
    project.update(project_id="project:github-new:01", display_name=request["display_name"], registration_kind="forge_created", stable_config_ref="project_config:github-new:01", project_home_server_ref=request["project_home_server_ref"], source_location_refs=[request["source_location_ref"]], repository_refs=[request["repository_ref"]])
    result = copy.deepcopy(next(row["value"] for row in rows if row["name"] == "project_setup_commit_requires_actual_listed_result"))
    result.update(action_id=forge.COMMAND, command_instance_id=request["command_instance_id"], return_context=copy.deepcopy(request["return_context"]), project_id=project["project_id"], project_revision=project["revision"], project_currentness_sha256=project["currentness_sha256"], resulting_registry_revision=request["expected_registry_revision"] + 1, resulting_registry_currentness_sha256="2" * 64, route_ref=None, receipt_refs=["receipt:github:created:01", "receipt:project:registered:01", "receipt:project:readback:01"])
    snapshot = copy.deepcopy(load("Plans/github_project_event_fixtures.json")["resolved_owner_fixture"])
    snapshot.update(request=copy.deepcopy(request), request_sha256=response.owner_result_digest(request), settled_result=copy.deepcopy(result), project=project, resolved_home_server_ref=request["project_home_server_ref"], repository_ref=request["repository_ref"], source_ref=request["source_ref"], before_registry={"revision": request["expected_registry_revision"], "currentness_sha256": request["expected_registry_currentness_sha256"]}, after_registry={"revision": result["resulting_registry_revision"], "currentness_sha256": result["resulting_registry_currentness_sha256"]})
    return {"request": request, "result": result, "snapshot": snapshot}


def payload_for(event_type, request, result, snapshot):
    suffix = EVENTS[event_type][0]
    payload = {"schema_id": "pm.github_project_event." + suffix + ".schema.v1", "event_type": event_type, "command_id": forge.COMMAND, "operation_id": snapshot["operation_id"], "request_sha256": response.owner_result_digest(request), "admission_receipt_ref": snapshot["admission_receipt_ref"], "project_id": None}
    payload.update({field: request[field] for field in ("actor_ref", "project_home_server_ref", "source_ref", "repository_ref")})
    if suffix == "project_bound":
        payload.update({field: snapshot[field] for field in ("registration_receipt_ref", "repository_receipt_ref", "readback_receipt_ref")})
        payload.update({field: result[field] for field in ("project_id", "project_revision", "project_currentness_sha256")})
        payload.update(owner_result_sha256=response.owner_result_digest(result), registry_revision=result["resulting_registry_revision"], registry_currentness_sha256=result["resulting_registry_currentness_sha256"])
    return payload


def transition_key(event_type, request, snapshot):
    # Stable intent namespace is application/Server + actor + key. Project ID
    # appears only after registration; it must not change creation identity.
    return response.owner_result_digest({"command_id": forge.COMMAND, "event_type": event_type, "server_id": snapshot["server_id"], "actor_ref": request["actor_ref"], "idempotency_key": request["idempotency_key"]})


def fixture_cases():
    for index, event_type in enumerate(EVENTS, 1):
        bundle = fixture_bundle()
        request, result, snapshot = (bundle[key] for key in ("request", "result", "snapshot"))
        payload = payload_for(event_type, request, result, snapshot)
        event = {"schema_id": "pm.event.v0", "schema_version": "2.0.0", "event_id": "event:github-project:" + str(index), "event_type": event_type, "scope_kind": EVENTS[event_type][1], "project_id": payload["project_id"], "actor_ref": request["actor_ref"], "thread_id": None, "run_id": None, "node_id": None, "attempt_id": None, "requested_account_ref": None, "effective_account_ref": None, "occurred_at_utc": "2026-09-11T00:00:00Z", "observed_at_utc": "2026-09-11T00:00:01Z", "persisted_at_utc": "2026-09-11T00:00:02Z", "sequence_id": index, "producer_sequence_id": index, "correlation_id": snapshot["operation_id"], "causation_event_id": None, "parent_event_id": None, "idempotency_key": transition_key(event_type, request, snapshot), "payload_schema_id": payload["schema_id"], "payload": payload, "payload_ref": None, "redaction_profile": "no_secrets", "replay_policy": "dedupe_by_idempotency_key", "migration": {"migrated_from_schema_id": None, "migrated_from_schema_version": None, "migration_id": None, "compatibility_event_type": None}}
        yield {**bundle, "case_id": EVENTS[event_type][0], "event": event, "producer": EVENTS[event_type][2]}


@lru_cache(maxsize=1)
def payload_validator():
    doc = load(PAYLOAD)
    registry = response.registry().with_resource(doc["$id"], Resource.from_contents(doc)).crawl()
    return Draft202012Validator(doc, registry=registry, format_checker=FormatChecker())


def candidate_failures(case):
    """Check candidate structure and owner joins, without storage authority."""
    if not isinstance(case, dict):
        return ["event_schema"]
    event, request, result, snapshot = (case.get(key) for key in ("event", "request", "result", "snapshot"))
    if not isinstance(event, dict):
        return ["unknown_event"]
    if not isinstance(event.get("event_type"), str):
        return ["event_type_shape"]
    if event["event_type"] not in EVENTS:
        return ["unknown_event"]
    event_type = event["event_type"]
    if list(Draft202012Validator(load("Plans/event_record.schema.json"), format_checker=FormatChecker()).iter_errors(event)):
        return ["event_schema"]
    if list(payload_validator().iter_errors(event["payload"])):
        return ["payload_schema"]
    errors = forge.intake_failures(request, snapshot)
    if event_type == "project.github_repo_bound":
        errors += forge.result_failures(request, result, snapshot)
    if errors:
        return sorted(set(errors))
    if event["payload"] != payload_for(event_type, request, result, snapshot):
        errors.append("event_owner_binding")
    if snapshot.get("emit_new_transition") is not True or (event_type == "project.github_repo_bound" and (result["outcome"] != "accepted" or result["replayed"])):
        errors.append("not_new_owner_transition")
    if case.get("producer") != EVENTS[event_type][2]:
        errors.append("producer_not_authorized")
    if event["scope_kind"] != EVENTS[event_type][1] or event["project_id"] != event["payload"]["project_id"] or event["actor_ref"] != request["actor_ref"]:
        errors.append("event_scope")
    if any(event[field] is not None for field in ("thread_id", "run_id", "node_id", "attempt_id", "requested_account_ref", "effective_account_ref", "payload_ref")):
        errors.append("unowned_event_identity")
    if event["correlation_id"] != snapshot["operation_id"] or event["idempotency_key"] != transition_key(event_type, request, snapshot):
        errors.append("event_transition_identity")
    if event["payload_schema_id"] != event["payload"]["schema_id"] or event["schema_version"] != "2.0.0" or event["producer_sequence_id"] is None or event["replay_policy"] != "dedupe_by_idempotency_key":
        errors.append("event_replay_contract")
    if event["redaction_profile"] != "no_secrets" or any(event["migration"].values()):
        errors.append("event_redaction_or_migration")
    if len(json.dumps(event["payload"], separators=(",", ":")).encode()) > 65536:
        errors.append("payload_byte_limit")
    return sorted(set(errors))


def event_failures(case):
    errors = candidate_failures(case)
    event = case.get("event") if isinstance(case, dict) else None
    event_type = event.get("event_type") if isinstance(event, dict) else None
    return deny_admission(errors, event_type, EVENTS)


class ReplayOracle:
    """Fail-closed fixture boundary; these events have no admitted replay path."""

    def __init__(self):
        self.identities = {}
        self.transitions = {}
        self.operation_bindings = {}
        self.owner_transitions = {}
        self.checkpoint = -1
        self.projected_count = 0
        self.executed_effects = 0

    def consume(self, case):
        # A valid candidate or old retained record cannot create admission.
        # Do not consume identities, replace old bindings or advance state.
        return "quarantined_without_checkpoint_advance"


def mutate(case, mutation):
    invalid = copy.deepcopy(case)
    parts = mutation["pointer"].strip("/").split("/")
    cursor = invalid
    for part in parts[:-1]:
        cursor = cursor[part]
    cursor[parts[-1]] = mutation["value"]
    return invalid


def validate():
    failures = []
    Draft202012Validator.check_schema(load(PAYLOAD))
    admission = load(ADMISSION)
    central = load("Plans/event_family_registry.json")
    shape_errors = input_shape_failures(admission, central)
    if shape_errors:
        return invalid_input_report("pm.github_project_integration_report.v2", shape_errors)
    if admission.get("schema_id") != "pm.github_project_event_admission.v2":
        failures.append("manifest_schema_id")
    failures.extend(disposition_failures(admission, central, EVENTS))
    if list(Draft202012Validator(load("Plans/event_family_registry.schema.json")).iter_errors(central)):
        failures.append("registry_schema")
    if admission["preexisting_family_prefix_count"] != 92 or response.owner_result_digest(central["families"][:92]) != admission["preexisting_family_prefix_sha256"]:
        failures.append("preexisting_registry_changed")
    families = {row["event_type"]: row for row in central["families"]}
    if len(families) != len(central["families"]) or {row["event_type"] for row in admission["rows"]} != set(EVENTS) or len(admission["rows"]) != 2:
        failures.append("event_census")
        return invalid_input_report("pm.github_project_integration_report.v2", failures)
    policies = {row["policy_id"]: row for row in load("Plans/storage_value_registry.json")["retention_policies"]}
    for index, row in enumerate(admission["rows"]):
        if row["command_id"] != forge.COMMAND:
            failures.append("candidate_command_binding:" + row["event_type"])
        suffix, scope, producer, owner = EVENTS[row["event_type"]]
        if row["semantic_owner_ref"] != owner or row["producer_component"] != producer or row["scope_policy"] != scope + "_only":
            failures.append("candidate_owner_scope")
        if row["payload_schema_ref"] != {"path": PAYLOAD, "json_pointer": "#/$defs/" + suffix, "schema_id": load(PAYLOAD)["$defs"][suffix]["$id"]}:
            failures.append("candidate_schema_identity")
        policy = policies.get(row["proposed_retention_policy_ref"]["policy_id"], {})
        if policy.get("policy_version") != row["proposed_retention_policy_ref"]["policy_version"] or not policy.get("hold_eligible"):
            failures.append("proposed_retention_reference")
    entries = load("Plans/Wiring_Matrix.production.json")["entries"]
    rows = [row for row in entries.values() if row["ui_command_id"] == forge.COMMAND]
    if len(rows) != 1:
        failures.append("wiring_census")
    else:
        row = rows[0]
        if row.get("request_schema_ref") != forge.SCHEMA + "#/$defs/project_action_request" or row.get("result_schema_ref") != forge.SCHEMA + "#/$defs/project_action_result" or set(row["expected_event_types"]) != set(EVENTS):
            failures.append("wiring_owner_contract")
        if any(ADMISSION + "#/rows/" + str(index) not in row["effect_contract"]["receipt_or_event_refs"] for index in range(2)):
            failures.append("wiring_disposition")
        if not set(EVENTS) <= set(row["effect_contract"]["receipt_or_event_refs"]):
            failures.append("wiring_event_identity")
        if ("Plans/Decision_Log.md#DL-039" not in row["effect_contract"]["receipt_or_event_refs"]
                or not any(DISPOSITION in item for item in row["event_test_requirements"])):
            failures.append("wiring_non_admission_boundary")
    negatives = 0
    fixtures = load("Plans/github_project_event_fixtures.json")
    for case in fixture_cases():
        errors = candidate_failures(case)
        if errors:
            failures.append({"case": case["case_id"], "errors": errors})
        if event_failures(case) != [DENIAL]:
            failures.append("candidate_admission_not_blocked:" + case["case_id"])
        mutations = fixtures["invalid_for_each_event"] + (fixtures["invalid_for_bound_event"] if case["case_id"] == "project_bound" else [])
        for mutation in mutations:
            errors = candidate_failures(mutate(case, mutation))
            expected = mutation["expected_error"]
            if not any(item in errors for item in (expected if isinstance(expected, list) else [expected])):
                failures.append({"case": case["case_id"], "mutation": mutation["name"], "errors": errors})
            negatives += 1
    return {"schema_id": "pm.github_project_integration_report.v2", "status": "fail" if failures else "pass", "positive_events": 2, "negative_cases": negatives, "admitted_events": 0, "event_disposition": DISPOSITION, "event_persistence_authorized": False, "registry_families": len(families), "native_handler_proven": False, "global_event_denominator": "UNKNOWN_OPEN", "governance_sealed": False, "failures": failures}


if __name__ == "__main__":
    report = validate()
    print(json.dumps(report, indent=2))
    raise SystemExit(bool(report["failures"]))
