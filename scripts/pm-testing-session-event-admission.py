#!/usr/bin/env python3
"""Four Testing event contracts only; fixture authority is not native proof."""

from __future__ import annotations

import argparse
import copy
import json
from functools import lru_cache
from pathlib import Path

from jsonschema import Draft202012Validator, FormatChecker
from referencing import Resource

import pm_ui_command_response as response
from pm_evidence_command_semantics import evidence_binding_failures

ROOT = Path(__file__).resolve().parents[1]
PAYLOAD = "Plans/testing_session_event_payloads.schema.json"
REQUEST = "Plans/testing_session_command_contracts.schema.json"
OWNER = "Plans/Automated_Testing_System.md#ATS-049"
PRODUCER = "AutomatedTestingService.visible_session"
EVENTS = {
    "testing.session.opened": "cmd.testing.session.open",
    "testing.session.watch_started": "cmd.testing.session.watch",
    "testing.session.backgrounded": "cmd.testing.session.background",
    "testing.session.redaction_inspected": "cmd.testing.session.redaction.inspect",
}
IDENTITIES = ("project_id", "thread_id", "run_id", "attempt_id", "actor_ref")


@lru_cache(maxsize=None)
def load(path):
    return json.loads((ROOT / path).read_text(encoding="utf-8"))


def digest(value):
    return response.owner_result_digest(value)


def fixture_cases():
    """Reuse authored command positives instead of copying owner truth."""
    pack = load("Plans/testing_session_command_contract_fixtures.json")
    cases = response.contracts().authored_positive_cases(pack, request_mode="template_patch")
    by_name = {row["name"]: row["instance"] for row in cases}
    for index, (event_type, command) in enumerate(EVENTS.items(), 1):
        request = next(copy.deepcopy(row["instance"]) for row in cases
                       if row["definition"] == "TestingSessionCommandRequest"
                       and row["instance"]["command_id"] == command)
        name = next(row["name"] for row in cases if row["instance"] == request)
        result = copy.deepcopy(by_name[name + "_result"])
        snapshot = {key: copy.deepcopy(request[key]) for key in ("context", "subject", "args")}
        snapshot.update({key: copy.deepcopy(result[key]) for key in (
            "subject_ref", "operation_id", "status", "receipt_ref", "projection_ref",
            "currentness_ref", "currentness_sha256", "artifact_refs")})
        snapshot.update({key: True for key in (
            "native_handler_available", "permission_allowed", "subject_current",
            "redaction_allowed", "capability_available", "transition_committed")})
        snapshot.update(
            transition_event_type=event_type, settled_result=copy.deepcopy(result),
            settled_session_revision=request["subject"]["expected_session_revision"],
            projection_generation=8, prior_projection_generation=7)
        payload_id = "pm.testing_session_event." + event_type.rsplit(".", 1)[1] + ".schema.v1"
        payload = {
            "schema_id": payload_id, "event_type": event_type,
            "subject": copy.deepcopy(request["subject"]), "owner_result": result,
            "settled_session_revision": snapshot["settled_session_revision"],
            "projection_generation": snapshot["projection_generation"],
        }
        event = {
            "schema_id": "pm.event.v0", "schema_version": "2.0.0", "scope_kind": "project",
            "event_id": "event:testing:" + str(index), "event_type": event_type,
            **{field: result["context"][field] for field in IDENTITIES},
            "node_id": None, "requested_account_ref": None, "effective_account_ref": None,
            "occurred_at_utc": "2026-09-11T00:00:00Z", "observed_at_utc": "2026-09-11T00:00:01Z",
            "persisted_at_utc": "2026-09-11T00:00:02Z", "sequence_id": index,
            "producer_sequence_id": index, "correlation_id": result["operation_id"],
            "causation_event_id": None, "parent_event_id": None,
            "idempotency_key": transition_key(request), "payload_schema_id": payload_id,
            "payload": payload, "payload_ref": None, "redaction_profile": "no_secrets",
            "replay_policy": "dedupe_by_idempotency_key",
            "migration": {"migrated_from_schema_id": None, "migrated_from_schema_version": None,
                          "migration_id": None, "compatibility_event_type": None},
        }
        yield {"case_id": name, "event": event, "request": request, "snapshot": snapshot, "producer": PRODUCER}


def transition_key(request):
    return digest({key: request["idempotency"][key] for key in ("scope_ref", "idempotency_key")} |
                  {"command_id": request["command_id"]})


@lru_cache(maxsize=1)
def payload_validator():
    doc = load(PAYLOAD)
    registry = response.registry().with_resource(doc["$id"], Resource.from_contents(doc)).crawl()
    return Draft202012Validator(doc, registry=registry, format_checker=FormatChecker())


def payload_errors(value):
    return list(payload_validator().iter_errors(value))


def event_failures(event, producer, request, snapshot):
    """Snapshot stands for an authenticated retained committed owner record.

    Replaying history resolves that original record, not new Client assertions
    or present-day permission booleans. This pure fixture does neither lookup.
    """
    errors = []
    event_type = event.get("event_type")
    if event_type not in EVENTS:
        return ["unknown_testing_event"]
    if list(Draft202012Validator(load("Plans/event_record.schema.json"),
                                format_checker=FormatChecker()).iter_errors(event)):
        errors.append("envelope_schema")
    payload = event.get("payload")
    if payload_errors(payload):
        return errors + ["payload_schema"]
    if response.structural_failures(REQUEST, request, "#/$defs/TestingSessionCommandRequest"):
        return errors + ["request_schema"]
    result = payload["owner_result"]
    errors += evidence_binding_failures(request, result, snapshot)
    if producer != PRODUCER:
        errors.append("producer_not_authorized")
    if request["command_id"] != EVENTS[event_type] or payload["event_type"] != event_type:
        errors.append("event_command_mismatch")
    if payload["subject"] != request["subject"] or result != snapshot.get("settled_result"):
        errors.append("settled_owner_binding")
    if snapshot.get("transition_committed") is not True or snapshot.get("transition_event_type") != event_type:
        errors.append("transition_not_committed")
    for field in ("settled_session_revision", "projection_generation"):
        if payload[field] != snapshot.get(field):
            errors.append("owner_" + field + "_mismatch")
    if payload["settled_session_revision"] < request["subject"]["expected_session_revision"]:
        errors.append("session_revision_regressed")
    if payload["projection_generation"] <= snapshot.get("prior_projection_generation", payload["projection_generation"]):
        errors.append("projection_generation_not_advanced")
    if event.get("scope_kind") != "project" or any(event.get(field) != result["context"][field] for field in IDENTITIES):
        errors.append("envelope_scope")
    if any(event.get(field) is not None for field in ("node_id", "requested_account_ref", "effective_account_ref", "payload_ref")):
        errors.append("unowned_envelope_identity")
    if event.get("correlation_id") != result["operation_id"] or event.get("idempotency_key") != transition_key(request):
        errors.append("transition_identity")
    if event.get("payload_schema_id") != payload["schema_id"]:
        errors.append("payload_identity")
    if event.get("schema_version") != "2.0.0" or event.get("producer_sequence_id") is None or event.get("replay_policy") != "dedupe_by_idempotency_key":
        errors.append("event_replay_contract")
    if event.get("redaction_profile") != "no_secrets" or any(event.get("migration", {}).values()):
        errors.append("redaction_or_unadmitted_migration")
    if len(json.dumps(payload, ensure_ascii=False, separators=(",", ":")).encode()) > 65536:
        errors.append("payload_byte_limit")
    return sorted(set(errors))


class ReplayOracle:
    """In-memory retained-transition projector, never durable event execution."""

    def __init__(self):
        self.event_ids = {}
        self.transitions = {}
        self.checkpoint = -1
        self.generations = {}
        self.projected_count = 0
        self.executed_effects = 0

    def consume(self, case):
        event = case["event"]
        if event_failures(event, case["producer"], case["request"], case["snapshot"]):
            return "quarantined_without_checkpoint_advance"
        owner = response.module("testing_event_case_l", "pm-implementation-readiness.py")
        signature = owner.event_producer_semantic_digest(event)
        transition = (owner.scope_partition(event["scope_kind"], event["project_id"]),
                      event["event_type"], event["idempotency_key"])
        prior_id = self.event_ids.get(event["event_id"])
        prior_transition = self.transitions.get(transition)
        if any(prior is not None and prior != signature for prior in (prior_id, prior_transition)):
            return "quarantined_without_checkpoint_advance"
        if prior_id is not None or prior_transition is not None:
            # Remember aliases without advancing the projection/checkpoint, so
            # a later conflict cannot recycle a duplicate transport event ID.
            self.event_ids[event["event_id"]] = signature
            return "duplicate_no_effect"
        if event["sequence_id"] <= self.checkpoint:
            return "quarantined_without_checkpoint_advance"
        self.event_ids[event["event_id"]] = signature
        self.transitions[transition] = signature
        self.checkpoint = event["sequence_id"]
        subject = (event["project_id"], event["payload"]["subject"]["test_session_id"])
        self.generations[subject] = max(self.generations.get(subject, -1), event["payload"]["projection_generation"])
        self.projected_count += 1
        return "projected_no_effect"


def validate(*, payloads_only=False):
    failures = []
    admission = load("Plans/testing_session_event_admission.json")
    registry = load("Plans/event_family_registry.json")
    families = {row["event_type"]: row for row in registry["families"]}
    rows = admission["rows"]
    if {row["event_type"]: row["command_id"] for row in rows} != EVENTS or len(rows) != 4:
        failures.append("exact_event_census")
    if len({row["event_type"] for row in registry["families"]}) != len(registry["families"]):
        failures.append("duplicate_central_event")
    if admission["preexisting_family_prefix_count"] != 92 or digest(registry["families"][:92]) != admission["preexisting_family_prefix_sha256"]:
        failures.append("preexisting_registry_rows_changed")
    for error in Draft202012Validator(load("Plans/event_family_registry.schema.json")).iter_errors(registry):
        failures.append("central_registry_schema:" + error.message)
    policies = {row["policy_id"]: row for row in load("Plans/storage_value_registry.json")["retention_policies"]}
    wiring = load("Plans/Wiring_Matrix.production.json")["entries"]
    for index, row in enumerate(rows):
        schema = load(PAYLOAD)["$defs"][row["event_type"].rsplit(".", 1)[1]]
        if schema["$id"] != row["payload_schema_ref"]["schema_id"] or row["semantic_owner_ref"] != OWNER or row["producer_component"] != PRODUCER:
            failures.append("owner_binding")
        policy = policies.get(row["retention_policy_ref"]["policy_id"], {})
        if policy.get("policy_version") != row["retention_policy_ref"]["policy_version"] or not policy.get("hold_eligible"):
            failures.append("retention_binding")
        if payloads_only:
            continue
        family = families.get(row["event_type"], {})
        for field in ("family_id", "family_revision", "scope_policy", "payload_schema_ref", "retention_policy_ref"):
            if family.get(field) != row[field]:
                failures.append("central_binding:" + row["event_type"] + ":" + field)
        if family.get("semantic_owner_doc") != OWNER or family.get("payload_schema_id") != row["payload_schema_ref"]["schema_id"]:
            failures.append("central_owner_binding")
        expected_pointers = {field: ["/payload/owner_result/context/" + field] for field in IDENTITIES}
        legacy = family.get("legacy", {})
        if legacy.get("identity_json_pointers") != expected_pointers or legacy.get("aliases") != [] or legacy.get("admitted_extensions") != []:
            failures.append("central_identity_or_legacy")
        if legacy.get("redaction", {}).get("mode") != "reject_unhandled_secrets":
            failures.append("central_redaction")
        placements = [entry for entry in wiring.values() if entry["ui_command_id"] == row["command_id"]]
        if len(placements) != 2:
            failures.append("placement_count")
        binding_ref = "Plans/testing_session_event_admission.json#/rows/" + str(index)
        for placement in placements:
            if placement["expected_event_types"] != [row["event_type"]] or binding_ref not in placement["effect_contract"]["receipt_or_event_refs"]:
                failures.append("wiring_admission_ref")
    cases = list(fixture_cases())
    fixtures = load("Plans/testing_session_event_admission_fixtures.json")
    if fixtures["valid_case_refs"] != [case["case_id"] for case in cases]:
        failures.append("positive_fixture_census")
    negative_count = 0
    for case in cases:
        found = event_failures(case["event"], case["producer"], case["request"], case["snapshot"])
        if found:
            failures.append({"case_id": case["case_id"], "errors": found})
        for mutation in fixtures["invalid_for_each_valid"]:
            invalid = copy.deepcopy(case)
            if mutation["target"] == "producer":
                invalid["producer"] = mutation["value"]
            else:
                parts = mutation["pointer"].strip("/").split("/")
                cursor = invalid[mutation["target"]]
                for part in parts[:-1]:
                    cursor = cursor[part]
                cursor[parts[-1]] = mutation["value"]
            rejected = event_failures(invalid["event"], invalid["producer"], invalid["request"], invalid["snapshot"])
            if mutation["expected_error"] not in rejected:
                failures.append({"case_id": case["case_id"], "mutation": mutation["name"], "errors": rejected})
            negative_count += 1
    return {"schema_id": "pm.testing_session_event_admission_report.v1",
            "status": "fail" if failures else ("payloads_only" if payloads_only else "pass"),
            "scoped_events": 4, "positive_cases": len(cases), "negative_cases": negative_count,
            "registry_families": len(families), "native_producer_proven": False,
            "global_event_denominator": "UNKNOWN_OPEN", "governance_sealed": False, "failures": failures}


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--payloads-only", action="store_true")
    args = parser.parse_args()
    report = validate(payloads_only=args.payloads_only)
    print(json.dumps(report, indent=2, sort_keys=True))
    raise SystemExit(bool(report["failures"]))
