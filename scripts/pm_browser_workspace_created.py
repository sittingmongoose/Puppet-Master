"""Pure workspace-created contract oracles, never native authority or durability.

Witnesses and Storage observations are explicit synthetic inputs. A successful
oracle models the owner contract; it does not authenticate a producer, resolve
permissions, read seglog bytes or replace the native proof obligations.
"""

from __future__ import annotations

import base64
import copy
import hashlib
import json
import importlib.util
import re
from datetime import datetime
from functools import lru_cache
from pathlib import Path

from jsonschema import Draft202012Validator, FormatChecker


ROOT = Path(__file__).resolve().parents[1]
CONTRACT_PATH = "Plans/browser_workspace_created_contracts.schema.json"
FIXTURE_PATH = "Plans/browser_workspace_created_contract_fixtures.json"
EVENT_TYPE = "browser.workspace.created"
CHECKPOINT_FAMILY = "browser_workspace_created_index_checkpoint"
PROJECTOR = "storage.browser_workspace_created_index.v1"
CONSUMER = "browser.workspace_inventory.created.v1"
VERSION = "1.0.0"
LINEAGE = ("project_id", "thread_id", "run_id", "attempt_id", "plan_id", "goal_id", "agent_id",
           "home_server_id", "execution_host_id", "execution_environment_id", "source_location_id")
SUBJECT = ("project_id", "home_server_id", "execution_host_id", "execution_environment_id", "source_location_id",
           "browser_session_id", "browser_workspace_id")


def load(path, root=ROOT):
    return json.loads((root / path).read_text(encoding="utf-8"))


@lru_cache(maxsize=4)
def candidate_gate(root):
    spec = importlib.util.spec_from_file_location("workspace_creation_browser_candidate", root / "scripts/pm-browser-event-admission.py")
    gate = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(gate)
    return gate, gate.contract_context()


def digest(value):
    """Fixture/CAS digest only, not the EventRecord producer-semantic algorithm."""
    return hashlib.sha256(json.dumps(value, sort_keys=True, separators=(",", ":")).encode()).hexdigest()


def scope_partition(project_id):
    return "project~" + base64.urlsafe_b64encode(project_id.encode()).decode().rstrip("=")


def checkpoint_bundle(root=ROOT):
    """Deterministic offline materialization of the one canonical sidecar value."""
    schema = load(CONTRACT_PATH, root)
    value = copy.deepcopy(schema["$defs"]["checkpoint"])
    value["$defs"] = {key: copy.deepcopy(value) for key, value in schema["$defs"].items() if key != "checkpoint"}
    return value


def checkpoint_failures(value, *, root=ROOT):
    if list(Draft202012Validator(checkpoint_bundle(root), format_checker=FormatChecker()).iter_errors(value)):
        return ["checkpoint_schema"]
    # date-time format support is optional in jsonschema installations. Validate
    # the exact timestamp syntax and calendar ourselves before ordering instants.
    try:
        instants = {}
        for field in ("updated_at_utc", "withdrawn_at_utc"):
            if value[field] is None:
                continue
            if not re.fullmatch(r"\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})", value[field]):
                return ["checkpoint_schema"]
            instants[field] = datetime.fromisoformat(value[field].replace("Z", "+00:00"))
    except (TypeError, ValueError):
        return ["checkpoint_schema"]
    failures = []
    if value["scope_partition"] != scope_partition(value["project_id"]):
        failures.append("checkpoint_scope_partition")
    cursor = value["source_cursor"]
    if cursor is not None and (value["first_retained_sequence_id"] > value["index_through_sequence_id"]
                               or cursor["last_sequence_id"] != value["index_through_sequence_id"]):
        failures.append("checkpoint_range_or_cursor")
    if value["withdrawn_at_utc"] is not None and instants["withdrawn_at_utc"] > instants["updated_at_utc"]:
        failures.append("withdrawal_after_observation")
    return failures


def expected_storage_family(root=ROOT):
    """Materialize SP-266's one derived family; no sibling identifiers are used."""
    binding = load(CONTRACT_PATH, root)["x-pm-event-authority-binding"]
    schema = checkpoint_bundle(root)
    owner = binding["storage_owner_ref"]
    return {
        "family_id": CHECKPOINT_FAMILY, "storage_kind": "redb_checkpoint", "status": "materialized",
        "tier": "later_gui_or_feature_projection", "key_shape": binding["checkpoint_key"], "compatibility_key_shapes": [],
        "value_schema_id": binding["checkpoint_schema_id"], "value_schema_ref": CONTRACT_PATH + "#/$defs/checkpoint",
        "owner_doc": owner, "producer": [PROJECTOR + "@" + VERSION], "consumers": [CONSUMER + "@" + VERSION],
        "schema_version": VERSION, "encoding": "messagepack_canonical", "required_fields": schema["required"],
        "optional_fields": [], "nullable_fields": ["first_retained_sequence_id", "index_through_sequence_id", "source_cursor", "withdrawn_at_utc"],
        "replay_behavior": "Read only the independently published complete CURRENT-selected EventRecord index and verified original source range. Commit only this filtered checkpoint under prior-cursor CAS and source/access/deletion fences. Publish a read-only historical creation join under the same revalidated snapshot; no global checkpoint, index, runtime, Usage or prompt write. Inclusive cursor reread is idempotent.",
        "migration": "StorageMigrationCoordinator alone installs this newly defined exact derived family and validates its closed sidecar. Unsupported binding/schema fences the reader until governed rebuild; no lazy rewrite, sibling checkpoint reuse or historical event mutation.",
        "migration_disposition": {"mode": "current_schema", "canonical_write_key_only": True, "compatibility_keys_read_only": False, "ambiguity_policy": "not_applicable", "source_refs": [owner]},
        "restore_disposition": {"mode": "rebuild_from_authority", "transaction_family_id": None, "outcome_owner_ref": owner, "mutation_fence_on_unresolved": True, "source_refs": [owner]},
        "recovery_disposition": {"authority_class": "derived_rebuildable", "strategy": "rebuild_from_canonical_events_and_snapshot", "source_family_ids": ["event_record_index"], "source_refs": ["Plans/Contracts_V0.md#EventRecord", owner], "backup_required": False, "data_loss_if_unavailable": False, "user_disclosure_required": True},
        "retention_compaction": "Exact RP-PROJECTION-3GEN@1.0.0; current_plus_history; first durable withdrawal is the terminal anchor retained in withdrawn_at_utc; 604800 seconds; max 3 per logical_key; holds; rebuild_projection overflow; rebuild expiry. Refresh, Browser close, Run completion and CURRENT switches never set/reset this anchor. Source-event/index policies remain unchanged.",
        "retention_policy_ref": "RP-PROJECTION-3GEN",
        "redaction_no_secret_rule": "Only non-secret IDs, hashes, cursors and opaque Storage refs; no payload/content copies, credentials, protected-auth identity or local absolute paths. Current access and deletion checks gate every read and disclosure.",
        "legacy_canonical_crosswalk_status": "New browser.workspace.created-only derived checkpoint under DL-046; no other event, canonical Browser record or shared-runtime domain is admitted.",
        "value_schema": schema,
    }


def creation_preflight_failures(event, request, result, witness, *, root=ROOT, require_new_identity=True):
    """Compare resolved-value fixtures; never trust ref text as real resolution."""
    # Reuse the shared Browser envelope/payload validator, without giving this
    # synthetic preflight or an unadmitted candidate EventRecord authority.
    if not isinstance(witness, dict):
        return ["creation_witness_schema"]
    gate, context = candidate_gate(root)
    candidate_errors = gate.candidate_failures(event, witness.get("producer_component"), context)
    if not isinstance(event, dict) or not isinstance(event.get("payload"), dict):
        return candidate_errors
    if not isinstance(event["payload"].get("context"), dict) or not isinstance(event["payload"].get("facts"), dict):
        return candidate_errors
    owner = load("Plans/section15_browser_program_contracts.schema.json", root)
    for kind, value in (("browser_command_request", request), ("browser_command_result", result)):
        schema = {"$ref": "#/$defs/" + kind, "$defs": owner["$defs"]}
        if list(Draft202012Validator(schema, format_checker=FormatChecker()).iter_errors(value)):
            return [kind + "_schema"]
    payload = event.get("payload", {})
    context = payload.get("context", {})
    facts = payload.get("facts", {})
    failures = list(candidate_errors)
    if event.get("event_type") != EVENT_TYPE or payload.get("event_type") != EVENT_TYPE:
        failures.append("wrong_creation_event")
    if facts.get("workspace_state") != "created" or facts.get("prior_workspace_generation") is not None:
        failures.append("not_new_workspace_identity")
    if any(context.get(field) is None for field in SUBJECT):
        failures.append("creation_subject_missing")
    if (context.get("run_id") is None) != (context.get("attempt_id") is None):
        failures.append("creation_run_attempt_mismatch")
    for value in (request, result):
        scope = value["scope"]
        if scope["command_id"] != "cmd.browser.workspace.create":
            failures.append("creation_command_mismatch")
        if any(scope["lineage"].get(field) != context.get(field) for field in LINEAGE):
            failures.append("creation_lineage_mismatch")
        if scope["browser_session_id"] != context.get("browser_session_id") or scope["session_security_class"] != "ordinary":
            failures.append("creation_session_mismatch")
    if result["scope"].get("browser_workspace_id") != context.get("browser_workspace_id"):
        failures.append("creation_result_workspace_mismatch")
    if context.get("node_id") != witness.get("node_id"):
        failures.append("creation_node_lineage_mismatch")
    if any(result["scope"].get(field) != value for field, value in request["scope"].items() if field != "browser_workspace_id"):
        failures.append("creation_request_result_scope_mismatch")
    if request["scope"].get("browser_workspace_id", context.get("browser_workspace_id")) != context.get("browser_workspace_id"):
        failures.append("creation_request_workspace_mismatch")
    if result["command_instance_id"] != request["command_instance_id"] or result["command_instance_id"] != witness.get("command_instance_id"):
        failures.append("creation_command_instance_mismatch")
    if request["idempotency_key"] != event.get("idempotency_key") or request["idempotency_key"] != witness.get("idempotency_key"):
        failures.append("creation_idempotency_mismatch")
    if result["outcome"] != "succeeded" or result["effect_state"] != "effects_reconciled":
        failures.append("creation_not_successful_reconciled")
    refs = (
        (payload.get("owner_record_ref"), witness.get("owner_record_ref")),
        (payload.get("transition_receipt_ref"), witness.get("transition_receipt_ref")),
        (result.get("dispatch_receipt_ref"), witness.get("transition_receipt_ref")),
        (payload.get("permission_snapshot_ref"), request["permission_snapshot_ref"]),
        (payload.get("permission_snapshot_ref"), witness.get("permission_snapshot_ref")),
        (payload.get("capability_snapshot_ref"), witness.get("capability_snapshot_ref")),
        (request["filesafe_decision_ref"], witness.get("filesafe_decision_ref")),
        (request["scope"].get("workspace_policy_ref"), witness.get("workspace_policy_ref")),
        (request["scope"].get("capability_profile_id"), witness.get("capability_profile_id")),
    )
    if any(not left or left != right for left, right in refs):
        failures.append("creation_resolved_reference_mismatch")
    if not witness.get("workspace_ref") or witness["workspace_ref"] not in result["result_refs"]:
        failures.append("creation_workspace_result_ref_missing")
    if witness.get("workspace_id") != context.get("browser_workspace_id") or witness.get("workspace_generation") != facts.get("workspace_generation"):
        failures.append("creation_committed_identity_mismatch")
    if witness.get("producer_component") != "BrowserRuntimeService.workspace":
        failures.append("creation_producer_mismatch")
    fields = ["producer_authenticated", "permission_current", "filesafe_allowed", "capability_current", "scope_current"]
    if require_new_identity:
        fields.extend(("unused_workspace_identity", "resource_isolated", "resource_unexposed"))
    for field in fields:
        if witness.get(field) is not True:
            failures.append("creation_witness:" + field)
    return sorted(set(failures))


class CreationOracle:
    """Synthetic barrier model; append_count counts only known commits.

    Pending uncertainty is not proof of zero physical appends. No native resource
    or EventRecord is created, and no native acknowledgement is observed here.
    """

    def __init__(self, semantic_digest):
        self.semantic_digest = semantic_digest
        self.committed = {}
        self.events = {}
        self.workspace_ids = set()
        self.pending = {}
        self.append_count = 0
        self.published_count = 0

    def create(self, event, request, result, witness, append_outcome, *, admitted):
        if not admitted or creation_preflight_failures(event, request, result, witness, require_new_identity=False):
            return "rejected_no_append"
        semantic = self.semantic_digest(event)
        key = (scope_partition(event["project_id"]), EVENT_TYPE, event["idempotency_key"])
        event_id = event["event_id"]
        if event_id in self.events and self.events[event_id] != semantic:
            return "idempotency_conflict"
        if key in self.committed:
            return "original_result_no_effect" if self.committed[key]["digest"] == semantic else "idempotency_conflict"
        if key in self.pending:
            return "uncertain_original_requires_resolution"
        if creation_preflight_failures(event, request, result, witness):
            return "rejected_no_append"
        workspace = (event["project_id"], event["payload"]["context"]["browser_workspace_id"])
        if workspace in self.workspace_ids:
            return "workspace_identity_already_committed"
        if append_outcome == "failed":
            return "unexposed_resource_disposed_no_append"
        if append_outcome == "unknown":
            self.pending[key] = {"digest": semantic, "event_id": event_id, "workspace": workspace}
            return "unexposed_resource_fenced_unknown_append"
        if append_outcome not in ("committed", "committed_ack_lost"):
            return "invalid_append_outcome"
        self.committed[key] = {"digest": semantic, "event_id": event_id, "result": copy.deepcopy(result)}
        self.events[event_id] = semantic
        self.workspace_ids.add(workspace)
        self.append_count += 1
        if append_outcome == "committed_ack_lost":
            return "committed_original_ack_lost"
        self.published_count += 1
        return "creation_committed_and_published"


class CheckpointOracle:
    """Synthetic filtered checkpoint transaction and separately fenced disclosure."""

    def __init__(self, checkpoint=None):
        self.checkpoint = copy.deepcopy(checkpoint)
        self.commit_count = 0
        self.disclosure_count = 0
        self.runtime_effect_count = 0

    def advance(self, candidate, observation):
        if checkpoint_failures(candidate):
            return "checkpoint_rejected_without_advance"
        if self.checkpoint is not None and checkpoint_failures(self.checkpoint):
            return "checkpoint_invalid_requires_governed_rebuild"
        if candidate["state"] == "withdrawn" or (self.checkpoint and self.checkpoint["state"] == "withdrawn"):
            return "withdrawn_without_advance"
        if not candidate["filter_complete"]:
            return "filter_incomplete_without_advance"
        for field in ("index_published", "range_complete", "source_verified", "dedupe_verified",
                      "access_allowed", "deletion_allows_audit", "binding_supported", "before_commit_fence_current"):
            if observation.get(field) is not True:
                return "source_or_fence_unavailable_without_advance"
        expected = observation.get("resolved_checkpoint_fields", {})
        for field in ("storage_instance_id", "project_id", "scope_partition", "index_checkpoint_ref",
                      "current_selection_sha256", "first_retained_sequence_id", "index_through_sequence_id", "source_cursor", "health"):
            if field not in expected or candidate[field] != expected[field]:
                return "source_identity_mismatch_without_advance"
        if candidate["source_cursor"] is None and observation.get("empty_range_verified") is not True:
            return "empty_range_unproved_without_advance"
        if observation.get("prior_checkpoint_sha256") != (digest(self.checkpoint) if self.checkpoint is not None else None):
            return "checkpoint_cas_conflict_without_advance"
        if self.checkpoint is not None:
            prior_cursor, next_cursor = self.checkpoint["source_cursor"], candidate["source_cursor"]
            if prior_cursor and (not next_cursor or next_cursor["last_sequence_id"] < prior_cursor["last_sequence_id"]):
                return "cursor_regression_requires_governed_rebuild"
            if self.checkpoint["storage_instance_id"] != candidate["storage_instance_id"] or self.checkpoint["scope_partition"] != candidate["scope_partition"]:
                return "checkpoint_scope_change_without_advance"
        self.checkpoint = copy.deepcopy(candidate)
        self.commit_count += 1
        return "checkpoint_committed_no_runtime_effect"

    def disclose(self, expected_checkpoint_digest, *, current_token, access_allowed, deletion_allows_audit):
        if (self.checkpoint is None or checkpoint_failures(self.checkpoint)
                or self.checkpoint["state"] == "withdrawn" or not self.checkpoint["filter_complete"]
                or not current_token or not access_allowed or not deletion_allows_audit
                or expected_checkpoint_digest != digest(self.checkpoint)):
            return "read_unavailable_no_disclosure"
        self.disclosure_count += 1
        return "historical_fact_no_runtime_authority"

    def withdraw(self, at_utc):
        if self.checkpoint is None:
            return "checkpoint_missing_no_withdrawal"
        if checkpoint_failures(self.checkpoint):
            return "invalid_withdrawal"
        if self.checkpoint["state"] == "withdrawn":
            return "already_withdrawn_original_anchor"
        candidate = copy.deepcopy(self.checkpoint)
        candidate.update(state="withdrawn", withdrawn_at_utc=at_utc, updated_at_utc=at_utc)
        if checkpoint_failures(candidate):
            return "invalid_withdrawal"
        if datetime.fromisoformat(at_utc.replace("Z", "+00:00")) < datetime.fromisoformat(self.checkpoint["updated_at_utc"].replace("Z", "+00:00")):
            return "invalid_withdrawal"
        self.checkpoint = candidate
        return "withdrawn_publication_fenced"


def workspace_history_fact(event, subject, *, source_verified, access_allowed,
                           deletion_allows_audit, checkpoint_read_token_valid, root=ROOT):
    """One synthetic read join, never whole-range completeness or live state."""
    refused = {"outcome": "read_unavailable", "fact": None, "current_runtime_authority": False}
    if not all(value is True for value in (source_verified, access_allowed, deletion_allows_audit, checkpoint_read_token_valid)):
        return refused
    if not isinstance(subject, dict) or set(subject) != set(SUBJECT) or any(not isinstance(subject[field], str) or not subject[field] for field in SUBJECT):
        return refused
    gate, context = candidate_gate(root)
    if gate.candidate_failures(event, "BrowserRuntimeService.workspace", context) or event["event_type"] != EVENT_TYPE:
        return refused
    payload = event["payload"]
    actual = {field: payload["context"][field] for field in SUBJECT}
    if actual != subject:
        return {"outcome": "verified_scope_nonmatch", "fact": None, "current_runtime_authority": False}
    return {
        "outcome": "historical_creation_fact",
        "fact": {"event_id": event["event_id"], "scope": actual,
                 "workspace_generation_at_creation": payload["facts"]["workspace_generation"]},
        "current_runtime_authority": False,
    }


def binding_failures(row, *, root=ROOT):
    """A prepared sibling or arbitrary path can never manufacture this binding."""
    if row["event_type"] != EVENT_TYPE:
        return ["complete_browser_authority_binding_missing"]
    schema = load(CONTRACT_PATH, root)
    binding = schema["x-pm-event-authority-binding"]
    expected = {
        "event_type": EVENT_TYPE, "binding_version": VERSION,
        "semantic_owner_ref": "Plans/Section15_MVP_Promoted_Features_Spec.md#SMPFS-167",
        "storage_owner_ref": "Plans/storage-plan.md#SP-266",
        "producer_component": "BrowserRuntimeService.workspace", "consumer_id": CONSUMER, "consumer_version": VERSION,
        "projector_id": PROJECTOR, "projector_version": VERSION, "checkpoint_family_id": CHECKPOINT_FAMILY,
        "checkpoint_key": CHECKPOINT_FAMILY + ".v1:{storage_instance_id}:{scope_partition}",
        "checkpoint_schema_id": "pm.storage_value." + CHECKPOINT_FAMILY + ".v1", "checkpoint_schema_version": VERSION,
        "checkpoint_schema_pointer": "#/$defs/checkpoint",
        "source_payload_schema_ref": "Plans/browser_event_payloads.schema.json#/$defs/workspace_created",
        "source_payload_schema_id": "pm.browser_event.workspace_created.schema.v1",
        "source_retention_policy_id": "RP-AUTHORITY-INDEFINITE", "checkpoint_retention_policy_id": "RP-PROJECTION-3GEN",
        "retention_policy_version": VERSION, "definition_authority_ref": "Plans/Decision_Log.md#DL-046",
        "definition_status": "newly_authored_owner_contract", "native_proof": False,
    }
    failures = []
    if binding != expected:
        failures.append("exact_browser_authority_binding_mismatch")
    if row.get("authority_contract_ref") != CONTRACT_PATH + "#/x-pm-event-authority-binding":
        failures.append("browser_authority_contract_ref_missing_or_mismatched")
    if row["semantic_owner_ref"] != expected["semantic_owner_ref"]:
        failures.append("browser_exact_semantic_owner_ref_mismatch")
    if row["retention_policy_ref"] != {"registry_schema_id": "pm.storage_value_registry.v2", "policy_id": "RP-AUTHORITY-INDEFINITE", "policy_version": VERSION}:
        failures.append("browser_source_retention_binding_mismatch")
    if not {expected["semantic_owner_ref"], expected["storage_owner_ref"]} <= set(row["consumer_contract_refs"]):
        failures.append("browser_exact_consumer_owner_refs_missing")
    if row["producer_component"] != expected["producer_component"] or row["payload_schema_ref"]["schema_id"] != expected["source_payload_schema_id"]:
        failures.append("browser_authority_source_join_mismatch")
    registry = load("Plans/storage_value_registry.json", root)
    families = [family for family in registry["families"] if family["family_id"] == CHECKPOINT_FAMILY]
    if len(families) != 1:
        return failures + ["browser_checkpoint_family_missing_or_duplicate"]
    family = families[0]
    if family != expected_storage_family(root):
        failures.append("browser_checkpoint_family_disposition_mismatch")
    if (family["value_schema"] != checkpoint_bundle(root)
            or family["value_schema_ref"] != CONTRACT_PATH + "#/$defs/checkpoint"
            or family["value_schema_id"] != expected["checkpoint_schema_id"]
            or family["schema_version"] != VERSION or family["key_shape"] != expected["checkpoint_key"]
            or family["producer"] != [PROJECTOR + "@" + VERSION]
            or family["consumers"] != [CONSUMER + "@" + VERSION]
            or family["owner_doc"] != expected["storage_owner_ref"]
            or family["retention_policy_ref"] != expected["checkpoint_retention_policy_id"]):
        failures.append("browser_checkpoint_family_binding_mismatch")
    return failures


def validate_fixture_contracts(*, root=ROOT):
    """Run explicit static positive/negative joins, not independent native proof."""
    gate, context = candidate_gate(root)
    fixtures = load(FIXTURE_PATH, root)
    failures = []
    schema = load(CONTRACT_PATH, root)
    Draft202012Validator.check_schema(schema)
    creation = fixtures["creation_fixture"]
    base_cases = [case for case in gate.load_json("Plans/browser_event_admission_fixtures.json")["valid"]
                  if case["case_id"] == creation["event_case_id"]]
    if len(base_cases) != 1 or base_cases[0]["event_type"] != EVENT_TYPE:
        return {"failures": ["creation_fixture_source_identity"], "creation_negative_cases": 0, "checkpoint_negative_cases": 0}
    event = gate.fixture_event(base_cases[0], 1)
    values = {"event": event, **{key: creation[key] for key in ("request", "result", "witness")}}
    errors = creation_preflight_failures(**values, root=root)
    if errors:
        failures.append({"case_id": "creation_positive", "errors": errors})
    errors = checkpoint_failures(fixtures["checkpoint_fixture"], root=root)
    if errors:
        failures.append({"case_id": "checkpoint_positive", "errors": errors})
    all_ids = [case["case_id"] for key in ("creation_invalid", "checkpoint_invalid") for case in fixtures[key]]
    if len(all_ids) != len(set(all_ids)) or not fixtures["creation_invalid"] or not fixtures["checkpoint_invalid"]:
        failures.append({"error": "fixture_identity_or_empty_negative_cohort"})
    for case in fixtures["creation_invalid"]:
        changed = copy.deepcopy(values)
        gate.set_pointer(changed[case["target"]], case["pointer"], case["value"])
        errors = creation_preflight_failures(**changed, root=root)
        if case["expected_error"] not in errors:
            failures.append({"case_id": case["case_id"], "expected": case["expected_error"], "errors": errors})
    for case in fixtures["checkpoint_invalid"]:
        changed = copy.deepcopy(fixtures["checkpoint_fixture"])
        gate.set_pointer(changed, case["pointer"], case["value"])
        errors = checkpoint_failures(changed, root=root)
        if case["expected_error"] not in errors:
            failures.append({"case_id": case["case_id"], "expected": case["expected_error"], "errors": errors})
    checkpoint = CheckpointOracle()
    if checkpoint.advance(fixtures["checkpoint_fixture"], fixtures["observation_fixture"]) != "checkpoint_committed_no_runtime_effect":
        failures.append({"case_id": "checkpoint_snapshot_positive"})
    return {
        "schema_id": "pm.browser_workspace_created_static_report.v1",
        "status": "fail" if failures else "pass",
        "creation_positive_cases": 1, "checkpoint_positive_cases": 2,
        "creation_negative_cases": len(fixtures["creation_invalid"]),
        "checkpoint_negative_cases": len(fixtures["checkpoint_invalid"]),
        "claim_boundary": "Synthetic schema, resolved-value join and checkpoint-model checks only; no authenticated producer, resolved Storage bytes, native durability, admission, runtime, currentness or seal proof.",
        "native_proof": False,
        "failures": failures,
    }


if __name__ == "__main__":
    report = validate_fixture_contracts()
    print(json.dumps(report, indent=2, sort_keys=True))
    raise SystemExit(bool(report["failures"]))
