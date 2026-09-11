#!/usr/bin/env python3
"""Scoped Browser event-authority conformance; never runtime/currentness proof."""

from __future__ import annotations

import argparse
import copy
import hashlib
import importlib.util
import json
import re
from collections import Counter
from functools import lru_cache
from pathlib import Path
from urllib.parse import urljoin

from jsonschema import Draft202012Validator, FormatChecker
from referencing import Registry, Resource


ROOT = Path(__file__).resolve().parents[1]
IDENTITIES = ("project_id", "thread_id", "run_id", "node_id", "attempt_id")
MAX_PAYLOAD_BYTES = 65536


@lru_cache(maxsize=1)
def envelope_oracle():
    """Reuse the existing pure Case L identity oracle, not readiness admission."""
    path = ROOT / "scripts/pm-implementation-readiness.py"
    spec = importlib.util.spec_from_file_location("browser_event_case_l_oracle", path)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def load_json(path):
    return json.loads((ROOT / path).read_text(encoding="utf-8"))


def fingerprint(value):
    return hashlib.sha256(json.dumps(value, sort_keys=True, separators=(",", ":")).encode()).hexdigest()


def pointer(value, path):
    for token in path.removeprefix("#").strip("/").split("/"):
        if token:
            value = value[token.replace("~1", "/").replace("~0", "~")]
    return value


def set_pointer(value, path, replacement):
    parts = path.strip("/").split("/")
    parent = value
    for token in parts[:-1]:
        parent = parent[token.replace("~1", "/").replace("~0", "~")]
    parent[parts[-1].replace("~1", "/").replace("~0", "~")] = replacement


def contract_context():
    admission = load_json("Plans/browser_event_admission.json")
    payloads = load_json("Plans/browser_event_payloads.schema.json")
    owner = load_json("Plans/section15_browser_program_contracts.schema.json")
    envelope = load_json("Plans/event_record.schema.json")
    # The existing owner uses a relative $id. Resolve it at the referring
    # document's URI as JSON Schema requires, and also retain its catalog ID.
    # Registry lookup is deliberately offline; no remote retrieval is enabled.
    resources = [(schema["$id"], Resource.from_contents(schema)) for schema in (payloads, owner, envelope)]
    resources.append((urljoin(payloads["$id"], owner["$id"]), Resource.from_contents(owner)))
    registry = Registry().with_resources(resources).crawl()
    validators = {
        row["event_type"]: Draft202012Validator(
            pointer(payloads, row["payload_schema_ref"]["json_pointer"]),
            registry=registry, format_checker=FormatChecker(),
        )
        for row in admission["rows"]
    }
    return admission, payloads, owner, envelope, validators


def semantic_failures(payload):
    failures = []
    context, facts, event = payload["context"], payload["facts"], payload["event_type"]
    if (context["run_id"] is None) != (context["attempt_id"] is None):
        failures.append("run_attempt_scope_mismatch")
    if (context["browser_session_id"] is None) != (context["browser_workspace_id"] is None):
        failures.append("browser_subject_scope_mismatch")
    if (context["browser_page_id"] is None) != (context["page_generation"] is None):
        failures.append("page_generation_scope_mismatch")
    if context["browser_page_id"] is not None and context["browser_workspace_id"] is None:
        failures.append("page_without_workspace")
    if event in {"browser.navigation.generation_changed", "browser.document.generation_changed"}:
        if facts["prior_page_generation"] is None or facts["prior_page_generation"] >= context["page_generation"]:
            failures.append("page_generation_not_advanced")
    if event == "browser.workspace.reset":
        if facts["prior_workspace_generation"] is None or facts["prior_workspace_generation"] >= facts["workspace_generation"]:
            failures.append("workspace_generation_not_advanced")
    if "prior_page_generation" in facts and facts["prior_page_generation"] is not None:
        if facts["prior_page_generation"] > context["page_generation"]:
            failures.append("page_generation_regressed")
    if "coverage" in facts:
        coverage = facts["coverage"]
        if facts["base_page_generation"] != context["page_generation"]:
            failures.append("representation_generation_mismatch")
        if facts["base_representation_id"] == facts["representation_id"]:
            failures.append("representation_delta_self_base")
        if coverage["frames_covered"] > coverage["frames_total"]:
            failures.append("coverage_bounds")
        if coverage["status"] == "complete" and (
            coverage["frames_total"] != coverage["frames_covered"] or coverage["omission_codes"]
            or coverage["budget_exhausted"] or coverage["synthetic_id_collisions"]
        ):
            failures.append("coverage_false_complete")
        if facts["invalidated"] != (coverage["status"] == "stale_rejected"):
            failures.append("representation_invalidation_mismatch")
    if "old_fence" in facts:
        old, new = facts["old_fence"], facts["new_fence"]
        if any(new[field] < old[field] for field in ("lease_generation", "lease_epoch", "last_sequence")):
            failures.append("lease_fence_regressed")
        if new["page_generation"] != context["page_generation"] or old["page_generation"] != context["page_generation"]:
            failures.append("lease_page_generation_mismatch")
        if event.endswith(".renewed") and any(old[field] != new[field] for field in ("lease_id", "holder_id", "lease_epoch", "lease_generation")):
            failures.append("lease_renew_identity_changed")
        if event.endswith(".takeover_completed") and (
            new["lease_epoch"] <= old["lease_epoch"] or new["holder_id"] == old["holder_id"]
        ):
            failures.append("lease_takeover_not_fenced")
        if event.endswith(".takeover_requested") and any(old[field] != new[field] for field in ("lease_id", "holder_id", "lease_epoch", "lease_generation")):
            failures.append("takeover_request_grants_authority")
    if "result_workspace_revision" in facts and facts["result_workspace_revision"] < facts["expected_workspace_revision"]:
        failures.append("workspace_revision_regressed")
    if event.endswith(".checkpointed") or event in {"browser.program.paused", "browser.program.resumed"}:
        if not facts.get("checkpoint_ref"):
            failures.append("checkpoint_required")
    if "effect_state" in facts:
        unknown = facts["unknown_effect_action_ids"]
        completed = facts["completed_action_ids"]
        terminal = facts.get("terminal_state")
        if set(unknown) & set(completed):
            failures.append("action_effect_overlap")
        if (facts["effect_state"] == "effect_unknown" or unknown) and facts["retry_allowed"]:
            failures.append("unknown_effect_retry")
        if facts["effect_state"] == "no_effect" and (unknown or completed):
            failures.append("no_effect_has_actions")
        if terminal == "failed_no_effect" and facts["effect_state"] != "no_effect":
            failures.append("terminal_effect_state_mismatch")
        if terminal == "timed_out_effect_state_unknown" and facts["effect_state"] != "effect_unknown":
            failures.append("terminal_effect_state_mismatch")
        if terminal and terminal != "timed_out_effect_state_unknown" and (unknown or facts["effect_state"] == "effect_unknown"):
            failures.append("terminal_effect_state_mismatch")
    if event == "browser.screenshot.model_attachment_selected" and not facts["screenshot_artifact_ref"]:
        failures.append("selected_screenshot_missing_artifact")
    if event == "browser.session.reconstructed_on_host":
        if not facts["source_fenced"]:
            failures.append("handoff_source_not_fenced")
        if facts["unknown_effects"]:
            failures.append("handoff_unknown_effects")
    return failures


def fixture_event(case, ordinal):
    payload = copy.deepcopy(case["payload"])
    return {
        "schema_id": "pm.event.v0", "schema_version": "2.0.0", "scope_kind": "project",
        "event_id": f"event-browser-{ordinal}", "event_type": case["event_type"],
        **{field: payload["context"][field] for field in IDENTITIES},
        "actor_ref": "actor:browser-fixture", "requested_account_ref": None, "effective_account_ref": None,
        "occurred_at_utc": "2026-09-10T00:00:00Z", "observed_at_utc": "2026-09-10T00:00:01Z",
        "persisted_at_utc": "2026-09-10T00:00:02Z", "sequence_id": ordinal, "producer_sequence_id": ordinal,
        "correlation_id": f"correlation-browser-{ordinal}", "causation_event_id": None, "parent_event_id": None,
        "idempotency_key": f"browser-transition-{ordinal}", "payload_schema_id": payload["schema_id"],
        "payload": payload, "payload_ref": None, "redaction_profile": "no_secrets",
        "replay_policy": "dedupe_by_idempotency_key",
        "migration": {"migrated_from_schema_id": None, "migrated_from_schema_version": None, "migration_id": None, "compatibility_event_type": None},
    }


def candidate_failures(event, producer_component, context):
    """Check prepared payload semantics without granting EventRecord admission."""
    admission, _, _, envelope, validators = context
    failures = []
    rows = {row["event_type"]: row for row in admission["rows"]}
    row = rows.get(event.get("event_type"))
    if row is None:
        return ["unknown_browser_event_quarantine"]
    if list(Draft202012Validator(envelope, format_checker=FormatChecker()).iter_errors(event)):
        failures.append("envelope_schema")
    payload = event.get("payload", {})
    if list(validators[event["event_type"]].iter_errors(payload)):
        failures.append("payload_schema")
    if producer_component != row["producer_component"]:
        failures.append("producer_not_authorized")
    if event.get("scope_kind") != "project" or any(
        event.get(field) != payload.get("context", {}).get(field) for field in IDENTITIES
    ):
        failures.append("envelope_scope")
    if event.get("payload_schema_id") != row["payload_schema_ref"]["schema_id"] or payload.get("event_type") != event["event_type"]:
        failures.append("payload_identity_mismatch")
    if event.get("producer_sequence_id") is None or event.get("replay_policy") != "dedupe_by_idempotency_key":
        failures.append("browser_replay_contract")
    if event.get("redaction_profile") != "no_secrets" or any(event.get("migration", {}).values()):
        failures.append("browser_redaction_or_unadmitted_migration")
    if len(json.dumps(payload, separators=(",", ":"), ensure_ascii=False).encode()) > MAX_PAYLOAD_BYTES:
        failures.append("payload_byte_limit")
    if "payload_schema" not in failures:
        failures.extend(semantic_failures(payload))
    return failures


@lru_cache(maxsize=4)
def central_family_validator(root):
    schema = json.loads((root / "Plans/event_family_registry.schema.json").read_text(encoding="utf-8"))
    return Draft202012Validator({"$ref": "#/$defs/family", "$defs": schema["$defs"]})


def central_binding_failures(row, family, row_index):
    """Resolve an exact family; a matching name or sibling is insufficient."""
    if family is None:
        return ["central_family_missing"]
    failures = []
    if list(central_family_validator(ROOT).iter_errors(family)):
        failures.append("central_family_schema")
    for key in ("event_type", "family_id", "family_revision", "payload_schema_ref", "retention_policy_ref"):
        if family.get(key) != row[key]:
            failures.append("central_family_binding:" + key)
    if family.get("scope_policy") != "project_only" or family.get("payload_schema_id") != row["payload_schema_ref"]["schema_id"]:
        failures.append("central_scope_or_schema_binding")
    if family.get("semantic_owner_doc") != row["semantic_owner_ref"] or family.get("payload_owner_doc") != "Plans/storage-plan.md#case-l-5-eventrecord-persistence-legacy-normalization-and-dedupe":
        failures.append("central_owner_binding")
    required_refs = {
        f"Plans/browser_event_admission.json#/rows/{row_index}", row["semantic_owner_ref"],
        row["payload_schema_ref"]["path"] + row["payload_schema_ref"]["json_pointer"],
    }
    if not required_refs <= set(family.get("source_refs", [])):
        failures.append("central_source_binding")
    legacy = family.get("legacy", {})
    if legacy.get("aliases") != [] or legacy.get("admitted_extensions") != [] or legacy.get("referenced_event_id_pointer") is not None or legacy.get("redaction") != {"mode": "reject_unhandled_secrets", "transform_id": None, "transform_version": None}:
        failures.append("unadmitted_legacy_or_redaction")
    expected_pointers = {field: ["/payload/context/" + field] for field in IDENTITIES}
    if legacy.get("identity_json_pointers") != expected_pointers:
        failures.append("central_identity_pointers")
    return failures


def event_failures(event, producer_component, context, *, families=None):
    """Admission-enforcing check, distinct from candidate shape/semantics."""
    failures = candidate_failures(event, producer_component, context)
    matches = [(index, row) for index, row in enumerate(context[0]["rows"]) if row["event_type"] == event.get("event_type")]
    if len(matches) != 1:
        return failures + ["event_not_admitted"]
    row_index, row = matches[0]
    if row["admission_status"] != "admitted_static_contract":
        return failures + ["event_not_admitted"]
    if families is None:
        registry_rows = load_json("Plans/event_family_registry.json")["families"]
        matching_families = [family for family in registry_rows if family["event_type"] == row["event_type"]]
        if len(matching_families) != 1:
            return failures + ["central_family_missing_or_duplicate"]
        family = matching_families[0]
    else:
        family = families.get(row["event_type"])
    return failures + central_binding_failures(row, family, row_index)


class ReplayOracle:
    """Admission-enforcing synthetic projector, never durable storage proof."""

    contract_failures = staticmethod(event_failures)

    def __init__(self):
        self.event_ids = {}
        self.transition_ids = {}
        self.checkpoint = -1
        self.page_generations = {}
        self.projected_count = 0
        self.executed_effects = 0

    def consume(self, event, producer, context):
        if self.contract_failures(event, producer, context):
            return "quarantined_without_checkpoint_advance"
        identity = event["event_id"]
        owner = envelope_oracle()
        transition = (owner.scope_partition(event["scope_kind"], event["project_id"]), event["event_type"], event["idempotency_key"])
        digest = owner.event_producer_semantic_digest(event)
        if identity in self.event_ids:
            return "duplicate_no_effect" if self.event_ids[identity] == digest else "quarantined_without_checkpoint_advance"
        if transition in self.transition_ids:
            original = self.transition_ids[transition]
            return "duplicate_no_effect" if self.event_ids[original] == digest else "quarantined_without_checkpoint_advance"
        if event["sequence_id"] <= self.checkpoint:
            return "quarantined_without_checkpoint_advance"
        self.event_ids[identity] = digest
        self.transition_ids[transition] = identity
        self.checkpoint = event["sequence_id"]
        self.projected_count += 1
        subject = event["payload"]["context"]
        if subject["browser_page_id"] is not None:
            key = (subject["project_id"], subject["browser_workspace_id"], subject["browser_page_id"])
            self.page_generations[key] = max(self.page_generations.get(key, -1), subject["page_generation"])
        return "projected_no_effect"


class CandidateReplayOracle(ReplayOracle):
    """Payload-only simulation. Its projections never establish admission."""

    contract_failures = staticmethod(candidate_failures)


def validate(*, payloads_only=False):
    context = contract_context()
    admission, payloads, owner, _, _ = context
    failures = []
    admission_schema = load_json("Plans/browser_event_admission.schema.json")
    for error in Draft202012Validator(admission_schema).iter_errors(admission):
        failures.append({"error": "admission_schema", "detail": error.message})
    for schema in (admission_schema, payloads):
        Draft202012Validator.check_schema(schema)
    if admission.get("maximum_payload_utf8_bytes") != MAX_PAYLOAD_BYTES:
        failures.append({"error": "payload_byte_budget_contract_mismatch"})
    section = (ROOT / "Plans/Section15_MVP_Promoted_Features_Spec.md").read_text(encoding="utf-8")
    event_text = section.split("Required browser event registrations are:", 1)[1].split("Required command-catalog rows are:", 1)[0]
    required_events = set(re.findall(r"`(browser\.[a-z0-9_.]+)`", event_text))
    command_text = section.split("Required command-catalog rows are:", 1)[1].split("`cmd.browser.program.inspect` is read-only/no-effect.", 1)[0]
    required_commands = set(re.findall(r"`(cmd\.browser\.[a-z0-9_.]+)`", command_text))
    rows = admission["rows"]
    authored = Counter(row["event_type"] for row in rows)
    if set(authored) != required_events or len(required_events) != 53 or any(count != 1 for count in authored.values()):
        failures.append({"error": "exact_section15_event_census_mismatch"})
    if len({row["family_id"] for row in rows}) != len(rows):
        failures.append({"error": "duplicate_prepared_family_id"})
    if len({row["payload_schema_ref"]["schema_id"] for row in rows}) != len(rows):
        failures.append({"error": "duplicate_prepared_payload_schema_id"})
    registry = load_json("Plans/event_family_registry.json")
    existing = [row for row in registry["families"] if row["family_id"] in admission["preexisting_family_ids"]]
    if len(existing) != 39 or fingerprint(existing) != admission["preexisting_family_rows_sha256"]:
        failures.append({"error": "preexisting_family_rows_changed"})
    families = {row["event_type"]: row for row in registry["families"]}
    if len(families) != len(registry["families"]):
        failures.append({"error": "duplicate_central_event_family"})
    admitted_events = {row["event_type"] for row in rows if row["admission_status"] == "admitted_static_contract"}
    prepared_events = {row["event_type"] for row in rows if row["admission_status"] == "prepared_not_admitted"}
    registered_scope = required_events & set(families)
    if registered_scope != admitted_events:
        failures.append({"error": "exact_admitted_subset_mismatch", "manifest_only": sorted(admitted_events - registered_scope), "registry_only": sorted(registered_scope - admitted_events)})
    command_bindings = admission.get("command_event_bindings", [])
    if {row["command_id"] for row in command_bindings} != required_commands or len(command_bindings) != 15:
        failures.append({"error": "exact_browser_command_binding_census"})
    wiring = load_json("Plans/Wiring_Matrix.production.json")
    for index, binding in enumerate(command_bindings):
        command_id = binding["command_id"]
        matches = [entry for entry in wiring["entries"].values() if entry["ui_command_id"] == command_id]
        if len(matches) != 1:
            failures.append({"error": "browser_wiring_count", "command_id": command_id})
            continue
        entry = matches[0]
        if entry["expected_event_types"] != binding["event_types"] or not set(binding["event_types"]) <= required_events:
            failures.append({"error": "browser_wiring_event_binding", "command_id": command_id})
        binding_ref = "Plans/browser_event_admission.json#/command_event_bindings/" + str(index)
        if binding_ref not in entry["effect_contract"]["receipt_or_event_refs"]:
            failures.append({"error": "browser_wiring_missing_admission_ref", "command_id": command_id})
        if not entry["state_selector"].endswith(".availability") or not entry["disabled_reason_projection"].endswith(".disabled_reason"):
            failures.append({"error": "browser_wiring_availability", "command_id": command_id})
        if not any("handler_unavailable" in check for check in entry["acceptance_checks"]):
            failures.append({"error": "browser_wiring_native_proof_guard", "command_id": command_id})
        if not any(all(token in check for token in ("prepared_not_admitted", "advance a checkpoint", "one-family landing")) for check in entry["acceptance_checks"]):
            failures.append({"error": "browser_wiring_prepared_admission_guard", "command_id": command_id})
    if next((row["event_types"] for row in command_bindings if row["command_id"] == "cmd.browser.program.inspect"), None) != []:
        failures.append({"error": "inspect_must_remain_event_silent"})
    retention = {row["policy_id"]: row for row in load_json("Plans/storage_value_registry.json")["retention_policies"]}
    for row_index, row in enumerate(rows):
        definition = pointer(payloads, row["payload_schema_ref"]["json_pointer"])
        record = pointer(owner, row["owner_record_contract_ref"].split("#", 1)[1])
        if definition["$id"] != row["payload_schema_ref"]["schema_id"] or definition["properties"]["owner_record_schema_id"]["const"] != record["properties"]["schema_id"]["const"]:
            failures.append({"event_type": row["event_type"], "error": "owner_schema_binding"})
        policy = retention.get(row["retention_policy_ref"]["policy_id"], {})
        if policy.get("policy_version") != row["retention_policy_ref"]["policy_version"] or not policy.get("hold_eligible"):
            failures.append({"event_type": row["event_type"], "error": "retention_policy_binding"})
        if policy.get("anchor_kind") == "run_completion" and not {"run_id", "attempt_id"} <= set(row["required_context_fields"]):
            failures.append({"event_type": row["event_type"], "error": "retention_run_anchor_missing"})
        if row["admission_status"] == "prepared_not_admitted":
            if row["event_type"] in families:
                failures.append({"event_type": row["event_type"], "error": "prepared_family_registered"})
            continue
        for error in central_binding_failures(row, families.get(row["event_type"]), row_index):
            failures.append({"event_type": row["event_type"], "error": error})
    fixtures = load_json("Plans/browser_event_admission_fixtures.json")
    by_id = {case["case_id"]: case for case in fixtures["valid"]}
    if set(case["event_type"] for case in fixtures["valid"]) != required_events or len(by_id) != 53:
        failures.append({"error": "fixture_census_mismatch"})
    all_case_ids = [case["case_id"] for case in fixtures["valid"] + fixtures["invalid"]]
    if len(all_case_ids) != len(set(all_case_ids)):
        failures.append({"error": "duplicate_fixture_identity"})
    by_type = {row["event_type"]: row for row in rows}
    positive_events = {}
    for ordinal, case in enumerate(fixtures["valid"], 1):
        event = fixture_event(case, ordinal)
        positive_events[case["case_id"]] = event
        producer = by_type[event["event_type"]]["producer_component"]
        errors = candidate_failures(event, producer, context)
        if errors:
            failures.append({"case_id": case["case_id"], "error": "positive_rejected", "details": errors})
        admission_errors = event_failures(event, producer, context, families=families)
        if event["event_type"] in admitted_events and admission_errors:
            failures.append({"case_id": case["case_id"], "error": "admitted_positive_rejected", "details": admission_errors})
        if event["event_type"] in prepared_events and "event_not_admitted" not in admission_errors:
            failures.append({"case_id": case["case_id"], "error": "prepared_event_admission_escape"})
    for case in fixtures["invalid"]:
        event = copy.deepcopy(positive_events[case["base_case_id"]])
        producer = by_type[event["event_type"]]["producer_component"]
        if case["target"] == "producer":
            producer = case["value"]
        else:
            set_pointer(event["payload"] if case["target"] == "payload" else event, case["pointer"], case["value"])
        errors = candidate_failures(event, producer, context)
        if case["expected_error"] not in errors:
            failures.append({"case_id": case["case_id"], "error": "negative_not_rejected_for_expected_reason", "details": errors})
    for error in Draft202012Validator(load_json("Plans/event_family_registry.schema.json")).iter_errors(registry):
        failures.append({"error": "central_registry_schema", "detail": error.message})
    return {
        "schema_id": "pm.browser_event_admission_report.v1",
        "status": "fail" if failures else ("payloads_valid_registry_not_claimed" if payloads_only else "pass"),
        "required_event_families": len(required_events), "admitted_scoped_event_families": 0 if payloads_only else len(admitted_events & registered_scope),
        "prepared_scoped_event_families": len(prepared_events),
        "admission_complete": not payloads_only and not failures and admitted_events == required_events,
        "claim_boundary": "Pass means prepared-contract and exact admitted-subset consistency, not completion of pending family admission, root review, native execution, currentness or seal.",
        "registry_family_count": len(registry["families"]), "preexisting_family_rows_unchanged": len(existing) == 39 and fingerprint(existing) == admission["preexisting_family_rows_sha256"],
        "positive_cases": len(fixtures["valid"]), "negative_cases": len(fixtures["invalid"]),
        "command_event_bindings_checked": len(command_bindings),
        "global_event_denominator": "UNKNOWN_OPEN", "runtime_producer_proven": False, "governance_sealed": False,
        "failures": failures,
    }


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--payloads-only", action="store_true", help="Report no admission claimed; still reject inconsistent manifest/registry membership.")
    args = parser.parse_args()
    report = validate(payloads_only=args.payloads_only)
    print(json.dumps(report, indent=2, sort_keys=True))
    raise SystemExit(bool(report["failures"]))
