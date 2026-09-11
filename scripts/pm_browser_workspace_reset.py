"""Synthetic reset contract oracles, never native Browser or Storage proof.

Resolved transition views and verified Storage observations are explicit adapter
assumptions. These checks neither authenticate their producer nor execute a
reset, decode a seglog frame, establish a native snapshot or admit an event.
"""

from __future__ import annotations

import base64
import copy
import importlib.util
import json
import re
from datetime import datetime, timedelta
from functools import lru_cache
from pathlib import Path
from urllib.parse import urljoin

from jsonschema import Draft202012Validator, FormatChecker
from referencing import Registry, Resource


ROOT = Path(__file__).resolve().parents[1]
CONTRACT_PATH = "Plans/browser_workspace_reset_contracts.schema.json"
FIXTURE_PATH = "Plans/browser_workspace_reset_contract_fixtures.json"
GENERIC_PATH = "Plans/event_record_index_checkpoint.schema.json"
OWNER_PATH = "Plans/section15_browser_program_contracts.schema.json"
EVENT_TYPE = "browser.workspace.reset"
CHECKPOINT_FAMILY = "browser_workspace_reset_index_checkpoint"
PROJECTOR = "storage.browser_workspace_reset_index.v1"
CONSUMER = "browser.workspace_inventory.reset.v1"
VERSION = "1.0.0"
SUBJECT = ("project_id", "home_server_id", "execution_host_id", "execution_environment_id",
           "source_location_id", "browser_session_id", "browser_workspace_id")
LINEAGE = ("project_id", "thread_id", "run_id", "attempt_id", "plan_id", "goal_id", "agent_id",
           "home_server_id", "execution_host_id", "execution_environment_id", "source_location_id")


def load(path, root=ROOT):
    return json.loads((root / path).read_text(encoding="utf-8"))


@lru_cache(maxsize=8)
def sibling(name, root=ROOT):
    spec = importlib.util.spec_from_file_location("reset_" + name.replace("-", "_"), root / "scripts" / (name + ".py"))
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def digest(value):
    # Use only for the NEW SP-278 anchor/frontier binding recipe.
    return sibling("pm_event_index_binding").binding_digest(value)


@lru_cache(maxsize=8)
def validators(root=ROOT):
    own, generic, owner = (load(path, root) for path in (CONTRACT_PATH, GENERIC_PATH, OWNER_PATH))
    payloads = load("Plans/browser_event_payloads.schema.json", root)
    resources = [(schema["$id"], Resource.from_contents(schema)) for schema in (own, generic, owner, payloads)]
    resources.append((urljoin(own["$id"], owner["$id"]), Resource.from_contents(owner)))
    resources.append((urljoin(payloads["$id"], owner["$id"]), Resource.from_contents(owner)))

    def refuse(uri):
        raise ValueError("unregistered local schema: " + uri)

    registry = Registry(retrieve=refuse).with_resources(resources).crawl()
    result = {}
    for prefix, schema, names in (("", own, ("resolved_transition", "checkpoint", "subject", "generation_transaction")),
                                  ("generic_", generic, ("checkpoint", "read_token")),
                                  ("", owner, ("browser_command_request", "browser_command_result"))):
        Draft202012Validator.check_schema(schema)
        for name in names:
            result[prefix + name] = Draft202012Validator(
                {"$ref": schema["$id"] + "#/$defs/" + name}, registry=registry, format_checker=FormatChecker())
    return result


def scope_partition(project_id):
    return "project~" + base64.urlsafe_b64encode(project_id.encode("utf-8")).decode("ascii").rstrip("=")


def reset_preflight_failures(event, request, result, transition, witness, *, root=ROOT):
    """Check claimed resolved values; witness booleans are NOT native evidence."""
    gate = sibling("pm-browser-event-admission", root)
    errors = gate.candidate_failures(event, witness.get("producer_component") if isinstance(witness, dict) else None,
                                     gate.contract_context())
    if errors:
        return errors
    for name, value in (("browser_command_request", request), ("browser_command_result", result),
                        ("resolved_transition", transition)):
        if not validators(root)[name].is_valid(value):
            return [name + "_schema"]
    if not isinstance(witness, dict):
        return ["reset_witness_missing"]
    payload = event["payload"]
    context, facts = payload["context"], payload["facts"]
    if event["event_type"] != EVENT_TYPE:
        errors.append("wrong_reset_event")
    for command in (request, result):
        scope = command["scope"]
        if scope["command_id"] != "cmd.browser.workspace.reset":
            errors.append("reset_command_mismatch")
        if any(scope["lineage"].get(field) != context.get(field) for field in LINEAGE):
            errors.append("reset_lineage_mismatch")
        if any(scope.get(field) != context[field] for field in ("browser_session_id", "browser_workspace_id", "session_security_class")):
            errors.append("reset_subject_mismatch")
        for field, context_field in (("browser_page_id", "browser_page_id"), ("page_generation", "page_generation"),
                                     ("browser_program_id", "program_id"), ("program_workspace_id", "program_workspace_id")):
            if scope.get(field) != context.get(context_field):
                errors.append("reset_optional_subject_mismatch")
    if request["scope"] != result["scope"]:
        errors.append("reset_request_result_scope_mismatch")
    if transition["subject"] != {field: context[field] for field in SUBJECT} or transition["node_id"] != context["node_id"]:
        errors.append("reset_resolved_subject_mismatch")
    if transition["context"] != context:
        errors.append("reset_resolved_context_mismatch")
    if not (request["command_instance_id"] == result["command_instance_id"] == transition["command_instance_id"]):
        errors.append("reset_command_instance_mismatch")
    if not (request["idempotency_key"] == event["idempotency_key"] == transition["idempotency_key"]):
        errors.append("reset_idempotency_mismatch")
    if result["outcome"] != "succeeded" or result["effect_state"] != "effects_reconciled":
        errors.append("reset_not_successful_reconciled")
    if transition["checked_workspace_revision"] != request["scope"].get("expected_workspace_revision"):
        errors.append("reset_revision_join")
    if transition["controller_authority"] != request["scope"].get("controller_authority"):
        errors.append("reset_controller_join")
    if (facts.get("workspace_state") != "reset" or
            facts.get("prior_workspace_generation") != transition["prior_workspace_generation"] or
            facts.get("workspace_generation") != transition["workspace_generation"] or
            transition["prior_workspace_generation"] >= transition["workspace_generation"]):
        errors.append("reset_generation_join")
    # Revision is intentionally not compared to generation, nor is +1 assumed.
    for name in ("owner_record_ref", "transition_receipt_ref", "permission_snapshot_ref", "capability_snapshot_ref"):
        if transition[name] != payload[name]:
            errors.append("reset_reference_join:" + name)
    if result.get("dispatch_receipt_ref") != transition["transition_receipt_ref"]:
        errors.append("reset_dispatch_receipt_join")
    if request["permission_snapshot_ref"] != transition["permission_snapshot_ref"]:
        errors.append("reset_permission_join")
    if request["filesafe_decision_ref"] != transition["filesafe_decision_ref"]:
        errors.append("reset_filesafe_join")
    if transition["workspace_ref"] not in result["result_refs"]:
        errors.append("reset_workspace_result_ref")
    for name in ("producer_authenticated", "original_request_resolved", "original_result_resolved",
                 "transition_receipt_resolved", "permission_valid_at_transition", "filesafe_allowed_at_transition",
                 "capability_valid_at_transition", "controller_valid_at_transition", "scope_valid_at_transition"):
        if witness.get(name) is not True:
            errors.append("reset_witness:" + name)
    return sorted(set(errors))


class ResetOracle:
    """Assumed owner-state/append barrier model, not persisted native state.

    A physical generation change precedes event append. Failed/unknown append
    therefore retains pending recovery and can never claim no reset effect.
    """

    def __init__(self, subject, revision, generation, semantic_digest):
        self.subject = copy.deepcopy(subject)
        self.revision = revision
        self.generation = generation
        self.semantic_digest = semantic_digest
        self.committed = {}
        self.pending = {}
        self.event_ids = {}
        self.reset_count = self.append_count = self.publication_count = 0

    def reset(self, event, request, result, transition, witness, append_outcome, *, admitted=False):
        if not admitted or reset_preflight_failures(event, request, result, transition, witness):
            return "rejected_no_reset"
        if transition["subject"] != self.subject:
            return "wrong_owner_subject_no_reset"
        key = (scope_partition(event["project_id"]), EVENT_TYPE, event["idempotency_key"])
        semantic = self.semantic_digest(event)
        if event["event_id"] in self.event_ids and self.event_ids[event["event_id"]] != semantic:
            return "idempotency_conflict"
        prior = self.committed.get(key) or self.pending.get(key)
        if prior:
            if prior["digest"] != semantic or prior["result"] != result or prior["request"] != request:
                return "idempotency_conflict"
            if key in self.pending:
                return "original_reset_pending_recovery_no_repeat"
            return "original_result_no_reset" if witness.get("current_result_access") is True else "original_result_access_denied"
        if self.pending:
            return "owner_recovery_required_no_reset"
        if self.revision is None:
            return "owner_revision_unresolved_no_reset"
        if transition["checked_workspace_revision"] != self.revision or transition["prior_workspace_generation"] != self.generation:
            return "stale_owner_no_reset"
        if append_outcome not in ("committed", "committed_ack_lost", "failed", "unknown"):
            return "invalid_append_outcome_no_reset"
        self.generation = transition["workspace_generation"]
        self.revision = None
        self.reset_count += 1
        # The oracle does not invent a post-reset workspace revision. A later
        # distinct command needs a newly resolved owner revision supplied by the
        # adapter, not arithmetic on the reset's generation.
        entry = {"digest": semantic, "event_id": event["event_id"], "request": copy.deepcopy(request),
                 "result": copy.deepcopy(result), "transition": copy.deepcopy(transition)}
        self.event_ids[event["event_id"]] = semantic
        self.pending[key] = entry
        if append_outcome in ("failed", "unknown"):
            return "reset_effect_committed_event_pending_recovery"
        return self.resolve_append(key, semantic, append_outcome)

    def resolve_append(self, key, semantic, append_outcome):
        entry = self.pending.get(key)
        if entry is None or entry["digest"] != semantic:
            return "original_append_identity_unresolved"
        if append_outcome in ("failed", "unknown"):
            return "original_append_pending_no_reset"
        if append_outcome not in ("committed", "committed_ack_lost"):
            return "invalid_append_resolution"
        self.committed[key] = self.pending.pop(key)
        self.append_count += 1
        if append_outcome == "committed_ack_lost":
            return "reset_event_committed_ack_lost"
        self.publication_count += 1
        return "reset_event_committed_and_published"


def checkpoint_bundle(root=ROOT):
    """Inline this owner's closed value/history and two exact SP-278 values."""
    own, generic = load(CONTRACT_PATH, root), load(GENERIC_PATH, root)
    cp = copy.deepcopy(own["$defs"]["checkpoint"])
    cp["properties"]["index_read_token"] = {"$ref": "#/$defs/generic_read_token"}
    cp["properties"]["source_cursor"] = {"$ref": "#/$defs/generic_source_cursor"}
    cp["$defs"] = {name: copy.deepcopy(own["$defs"][name]) for name in
                   ("timestamp", "non_secret_ref", "checkpoint_core", "retired_generation")}
    cp["$defs"].update({
                   "generic_read_token": copy.deepcopy(generic["$defs"]["read_token"]),
                   "generic_source_cursor": copy.deepcopy(generic["$defs"]["coverage"]["properties"]["last_frame"])})
    core = cp["$defs"]["checkpoint_core"]
    core["properties"]["index_read_token"] = {"$ref": "#/$defs/generic_read_token"}
    core["properties"]["source_cursor"] = {"$ref": "#/$defs/generic_source_cursor"}
    return cp


def expected_binding():
    return {"event_type": EVENT_TYPE, "binding_version": VERSION,
            "semantic_owner_ref": "Plans/Section15_MVP_Promoted_Features_Spec.md#SMPFS-168",
            "storage_owner_ref": "Plans/storage-plan.md#SP-282",
            "producer_component": "BrowserRuntimeService.workspace",
            "consumer_id": CONSUMER, "consumer_version": VERSION, "projector_id": PROJECTOR, "projector_version": VERSION,
            "checkpoint_family_id": CHECKPOINT_FAMILY,
            "checkpoint_key": CHECKPOINT_FAMILY + ".v1:{storage_instance_id}:{scope_partition}",
            "checkpoint_schema_id": "pm.storage_value." + CHECKPOINT_FAMILY + ".v1", "checkpoint_schema_version": VERSION,
            "checkpoint_schema_pointer": "#/$defs/checkpoint", "generic_index_owner_ref": "Plans/storage-plan.md#SP-278",
            "generic_index_read_token_ref": GENERIC_PATH + "#/$defs/read_token",
            "source_payload_schema_ref": "Plans/browser_event_payloads.schema.json#/$defs/workspace_reset",
            "source_payload_schema_id": "pm.browser_event.workspace_reset.schema.v1",
            "source_retention_policy_id": "RP-AUTHORITY-INDEFINITE", "checkpoint_retention_policy_id": "RP-PROJECTION-3GEN",
            "retention_policy_version": VERSION, "definition_authority_ref": "Plans/Decision_Log.md#DL-046",
            "definition_status": "newly_authored_owner_contract", "native_proof": False}


def expected_storage_family(root=ROOT):
    binding = expected_binding()
    owner, schema = binding["storage_owner_ref"], checkpoint_bundle(root)
    return {
        "family_id": CHECKPOINT_FAMILY, "storage_kind": "redb_checkpoint", "status": "materialized",
        "tier": "later_gui_or_feature_projection", "key_shape": binding["checkpoint_key"], "compatibility_key_shapes": [],
        "value_schema_id": binding["checkpoint_schema_id"], "value_schema_ref": CONTRACT_PATH + "#/$defs/checkpoint",
        "owner_doc": owner, "producer": [PROJECTOR + "@" + VERSION], "consumers": [CONSUMER + "@" + VERSION],
        "schema_version": VERSION, "encoding": "messagepack_canonical", "required_fields": schema["required"],
        "optional_fields": [], "nullable_fields": ["first_retained_sequence_id", "index_through_sequence_id", "source_cursor", "withdrawn_at_utc"],
        "replay_behavior": "Explicitly adopt the SP-278 root/generation/anchor/frontier/source/read token and complete global captured range. Verify the exact Project/reset filter and original source bytes. Commit only this checkpoint under exact prior-value/cursor CAS and source/access/deletion fences; recheck before historical disclosure. Stored snapshot ID is provenance, never a restart handle. No index/global-checkpoint/Browser/Usage/Prompt mutation.",
        "migration": "StorageMigrationCoordinator alone installs the exact reset-only derived family through actual graph/ceilings. Unsupported binding or cursor regression requires governed rebuild from CURRENT-selected source; no sibling reuse, lazy source rewrite, alias or guessed store-version integer.",
        "migration_disposition": {"mode": "current_schema", "canonical_write_key_only": True, "compatibility_keys_read_only": False, "ambiguity_policy": "not_applicable", "source_refs": [owner]},
        "restore_disposition": {"mode": "rebuild_from_authority", "transaction_family_id": None, "outcome_owner_ref": owner, "mutation_fence_on_unresolved": True, "source_refs": [owner]},
        "recovery_disposition": {"authority_class": "derived_rebuildable", "strategy": "rebuild_from_canonical_events_and_snapshot", "source_family_ids": ["event_record_index", "event_record_index_checkpoint"], "source_refs": ["Plans/Contracts_V0.md#EventRecord", "Plans/storage-plan.md#SP-278", owner], "backup_required": False, "data_loss_if_unavailable": False, "user_disclosure_required": True},
        "retention_compaction": "Exact RP-PROJECTION-3GEN@1.0.0; the same-key current core plus at most two complete nonrecursive retired_generations cores is the entire generation set. Stable publication_id/birth and exact original first-withdrawal anchor survive refresh and replacement; retired core withdrawn_at_utc starts 604800 seconds. Actual current holds/ref clearance and same-redb CAS serialize cleanup and capacity reservation; no fourth key or early eviction. Reset/close, Run completion or generic frontier change does not set/reset the anchor. Existing rebuild_projection overflow/rebuild expiry; no source/index policy change.",
        "retention_policy_ref": "RP-PROJECTION-3GEN",
        "redaction_no_secret_rule": "Only non-secret IDs, exact source/publication hashes, cursors and opaque refs. No credentials, protected-auth identity, page/profile/DOM/capture content or local absolute paths. Current Project/thread access, tombstones and redaction gate every read and recovery disclosure.",
        "legacy_canonical_crosswalk_status": "New reset-only filtered checkpoint under DL-046, explicitly adopting SP-278. No Browser session/profile/result physical family or sibling event is admitted by this value.",
        "value_schema": schema,
    }


def binding_failures(row, *, root=ROOT):
    if row.get("event_type") != EVENT_TYPE:
        return ["complete_browser_authority_binding_missing"]
    expected = expected_binding()
    errors = []
    if load(CONTRACT_PATH, root)["x-pm-event-authority-binding"] != expected:
        errors.append("exact_reset_authority_binding_mismatch")
    if row.get("authority_contract_ref") != CONTRACT_PATH + "#/x-pm-event-authority-binding":
        errors.append("reset_authority_contract_ref_mismatch")
    if row.get("semantic_owner_ref") != expected["semantic_owner_ref"] or row.get("producer_component") != expected["producer_component"]:
        errors.append("reset_owner_binding_mismatch")
    if row.get("payload_schema_ref") != {"path": "Plans/browser_event_payloads.schema.json", "json_pointer": "#/$defs/workspace_reset", "schema_id": expected["source_payload_schema_id"]}:
        errors.append("reset_payload_binding_mismatch")
    if not {expected["semantic_owner_ref"], expected["storage_owner_ref"], expected["generic_index_owner_ref"]} <= set(row.get("consumer_contract_refs", [])):
        errors.append("reset_consumer_refs_missing")
    if row.get("retention_policy_ref") != {"registry_schema_id": "pm.storage_value_registry.v2", "policy_id": "RP-AUTHORITY-INDEFINITE", "policy_version": VERSION}:
        errors.append("reset_source_retention_binding_mismatch")
    families = [f for f in load("Plans/storage_value_registry.json", root)["families"] if f["family_id"] == CHECKPOINT_FAMILY]
    if len(families) != 1 or families[0] != expected_storage_family(root):
        errors.append("reset_checkpoint_family_disposition_mismatch")
    return errors


def checkpoint_failures(value, *, root=ROOT):
    if not validators(root)["checkpoint"].is_valid(value):
        return ["checkpoint_schema"]
    errors = checkpoint_core_failures(value)
    seen = {value["publication_id"]}
    for retired in value["retired_generations"]:
        core = retired["checkpoint_core"]
        errors.extend(checkpoint_core_failures(core))
        if (core["publication_id"] in seen or core["publication_id"] == retired["successor_publication_id"] or
                any(core[name] != value[name] for name in ("storage_instance_id", "project_id", "scope_partition"))):
            errors.append("checkpoint_history_identity")
        seen.add(core["publication_id"])
        if not errors and parse_time(core["withdrawn_at_utc"]) > parse_time(value["published_at_utc"]):
            errors.append("history_withdrawal_after_successor")
    return sorted(set(errors))


def parse_time(value):
    return datetime.fromisoformat(value.replace("Z", "+00:00"))


def checkpoint_core_failures(value):
    # Called only after the closed schema has validated this current/old core.
    errors = []
    if value["scope_partition"] != scope_partition(value["project_id"]):
        errors.append("checkpoint_scope_partition")
    if value["index_read_token"]["storage_instance_id"] != value["storage_instance_id"]:
        errors.append("checkpoint_storage_identity")
    cursor = value["source_cursor"]
    if cursor is not None and (value["first_retained_sequence_id"] > value["index_through_sequence_id"] or
                               cursor["last_sequence_id"] != value["index_through_sequence_id"] or
                               cursor["byte_offset"] >= cursor["frame_end_offset"]):
        errors.append("checkpoint_range_or_cursor")
    try:
        if any(value[name] is not None and not re.fullmatch(
                r"\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})", value[name])
                for name in ("updated_at_utc", "withdrawn_at_utc", "published_at_utc")):
            return errors + ["checkpoint_timestamp"]
        times = {name: parse_time(value[name])
                 for name in ("updated_at_utc", "withdrawn_at_utc", "published_at_utc") if value[name] is not None}
        if any(t.tzinfo is None for t in times.values()):
            errors.append("checkpoint_timestamp")
        elif "withdrawn_at_utc" in times and times["withdrawn_at_utc"] > times["updated_at_utc"]:
            errors.append("withdrawal_after_observation")
        if times["published_at_utc"] > times["updated_at_utc"] or (
                "withdrawn_at_utc" in times and times["published_at_utc"] > times["withdrawn_at_utc"]):
            errors.append("generation_birth_after_observation_or_withdrawal")
    except (ValueError, TypeError):
        errors.append("checkpoint_timestamp")
    return errors


def generation_admission_failures(before, after, observation, *, root=ROOT):
    """Check claimed same-key transaction; actual authentication is assumed."""
    transaction = observation.get("generation_transaction")
    if not validators(root)["generation_transaction"].is_valid(transaction):
        return ["generation_transaction_schema"]
    key = CHECKPOINT_FAMILY + ".v1:" + after["storage_instance_id"] + ":" + after["scope_partition"]
    if (transaction["before"] != before or transaction["after"] != after or transaction["checkpoint_key"] != key or
            transaction["selected_publication_id"] != after["publication_id"] or
            transaction["committed_at_utc"] != after["published_at_utc"]):
        return ["generation_transaction_join"]
    if any(observation.get(name) is not True for name in (
            "generation_transaction_resolved", "coordinator_admitted", "complete_rebuild_verified",
            "capacity_reserved", "hold_ref_fence_current")):
        return ["generation_admission_unproved"]
    if after["state"] == "withdrawn" or after["updated_at_utc"] != after["published_at_utc"]:
        return ["generation_birth_state_or_time"]
    if before is None:
        return [] if not after["retired_generations"] else ["initial_generation_has_history"]
    if (any(before[name] != after[name] for name in ("storage_instance_id", "project_id", "scope_partition")) or
            before["publication_id"] == after["publication_id"] or
            parse_time(after["published_at_utc"]) < parse_time(before["updated_at_utc"])):
        return ["replacement_scope_identity_or_time"]
    if len(before["retired_generations"]) >= 2:
        return ["generation_capacity_requires_eligible_cleanup"]
    old_core = {name: copy.deepcopy(value) for name, value in before.items() if name != "retired_generations"}
    if old_core["state"] != "withdrawn":
        old_core.update(state="withdrawn", withdrawn_at_utc=after["published_at_utc"], updated_at_utc=after["published_at_utc"])
    expected = before["retired_generations"] + [{"checkpoint_core": old_core, "successor_publication_id": after["publication_id"]}]
    return [] if after["retired_generations"] == expected else ["replacement_original_history_changed"]


def index_token_failures(token, index, observation, *, root=ROOT):
    """Exact SP-278 decoded-value join beneath an assumed verified native read."""
    if (not validators(root)["generic_read_token"].is_valid(token) or
            not validators(root)["generic_checkpoint"].is_valid(index)):
        return ["generic_index_schema"]
    if not isinstance(observation, dict) or observation.get("generic_source_verified") is not True:
        return ["generic_source_unproved"]
    selected = index["current_generation_id"]
    node = index["generations"].get(selected) if selected is not None else None
    if node is None or node["state"] != "current" or node["generation_id"] != selected or sum(n["state"] == "current" for n in index["generations"].values()) != 1:
        return ["generic_generation_not_current"]
    key = "event_record_index_checkpoint.v1:" + index["storage_instance_id"]
    frontier = node["frontier"]
    expected = {"storage_instance_id": index["storage_instance_id"], "checkpoint_key": key,
                "checkpoint_ref": key + "#/generations/" + selected, "generation_id": selected,
                "generation_anchor_sha256": digest(node["anchor"]),
                "frontier_revision": frontier["publication_revision"], "frontier_sha256": digest(frontier),
                "index_dataset_name": "event_record_index.v2@" + selected,
                "source_selection": frontier["source_selection"], "redb_snapshot_id": observation.get("redb_snapshot_id")}
    errors = []
    if token != expected or node["index_dataset_name"] != expected["index_dataset_name"]:
        errors.append("generic_read_token_join")
    if observation.get("source_selection") != frontier["source_selection"]:
        errors.append("generic_current_source_changed")
    if frontier["source_selection"]["storage_instance_id"] != index["storage_instance_id"]:
        errors.append("generic_source_storage_mismatch")
    return errors


class CheckpointOracle:
    """Filtered checkpoint CAS/disclosure model. No native transaction runs."""

    def __init__(self, checkpoint=None):
        self.checkpoint = copy.deepcopy(checkpoint)
        self.commit_count = self.disclosure_count = self.runtime_effect_count = 0

    def advance(self, candidate, index, observation, *, admitted=False, _replacement=False):
        if not admitted:
            return "event_not_admitted_no_advance"
        if checkpoint_failures(candidate) or (self.checkpoint is not None and checkpoint_failures(self.checkpoint)):
            return "checkpoint_invalid_no_advance"
        if candidate["state"] == "withdrawn" or (self.checkpoint and self.checkpoint["state"] == "withdrawn" and not _replacement):
            return "withdrawn_no_advance"
        if index_token_failures(candidate["index_read_token"], index, observation):
            return "generic_index_unavailable_no_advance"
        for name in ("project_filter_complete", "reset_sources_validated", "source_dedupe_verified",
                     "access_allowed", "deletion_allows_audit", "binding_supported", "before_commit_fence_current"):
            if observation.get(name) is not True:
                return "filter_or_fence_unproved_no_advance"
        if not candidate["filter_complete"]:
            return "filter_incomplete_no_advance"
        coverage = index["generations"][index["current_generation_id"]]["frontier"]["coverage"]
        for target, source in (("first_retained_sequence_id", "first_retained_sequence_id"),
                               ("index_through_sequence_id", "through_sequence_id"),
                               ("source_cursor", "last_frame"), ("health", "health")):
            if candidate[target] != coverage[source]:
                return "filtered_range_not_global_coverage"
        if observation.get("project_id") != candidate["project_id"]:
            return "filtered_project_mismatch"
        # CAS uses exact prior canonical value bytes supplied by the adapter,
        # not SP-278's digest codec for this different owner value.
        if observation.get("prior_checkpoint") != self.checkpoint:
            return "checkpoint_cas_conflict_no_advance"
        if self.checkpoint is None or _replacement:
            if generation_admission_failures(self.checkpoint, candidate, observation):
                return "generation_admission_invalid_no_advance"
        if self.checkpoint is not None and not _replacement:
            if any(self.checkpoint[field] != candidate[field] for field in ("storage_instance_id", "project_id", "scope_partition")):
                return "checkpoint_scope_change_no_advance"
            if any(self.checkpoint[field] != candidate[field] for field in
                   ("publication_id", "published_at_utc", "hold_refs", "retired_generations")):
                return "generation_identity_or_history_changed_no_advance"
            if parse_time(candidate["updated_at_utc"]) < parse_time(self.checkpoint["updated_at_utc"]):
                return "checkpoint_observation_regression"
            old, new = self.checkpoint["source_cursor"], candidate["source_cursor"]
            if old and (not new or new["last_sequence_id"] < old["last_sequence_id"]):
                return "cursor_regression_requires_governed_rebuild"
        self.checkpoint = copy.deepcopy(candidate)
        self.commit_count += 1
        return "checkpoint_committed_no_runtime_effect"

    def replace(self, candidate, index, observation, *, admitted=False):
        return self.advance(candidate, index, observation, admitted=admitted, _replacement=True)

    def cleanup(self, publication_id, at_utc, observation):
        """Model serialized eligible cleanup; hold/ref witnesses are assumptions."""
        before = self.checkpoint
        if before is None or checkpoint_failures(before) or observation.get("prior_checkpoint") != before:
            return "cleanup_invalid_or_cas_conflict"
        if any(observation.get(name) is not True for name in (
                "maintenance_authorized", "all_applicable_holds_resolved", "no_applicable_hold_or_live_ref",
                "hold_ref_fence_current", "access_allowed", "deletion_allows_audit")):
            return "cleanup_authority_or_hold_unproved"
        selected = [entry for entry in before["retired_generations"] if entry["checkpoint_core"]["publication_id"] == publication_id]
        if len(selected) != 1:
            return "cleanup_retired_identity_missing"
        core = selected[0]["checkpoint_core"]
        try:
            now = parse_time(at_utc)
            if now.tzinfo is None or now < parse_time(core["withdrawn_at_utc"]) + timedelta(seconds=604800):
                return "cleanup_retention_window_open"
        except (ValueError, TypeError, AttributeError):
            return "cleanup_invalid_time"
        # The complete original current core and every sibling are preserved.
        self.checkpoint = {**copy.deepcopy(before), "retired_generations": [copy.deepcopy(entry)
                            for entry in before["retired_generations"] if entry is not selected[0]]}
        self.commit_count += 1
        return "eligible_retired_generation_removed"

    def disclose(self, index, observation):
        cp = self.checkpoint
        if (not isinstance(observation, dict) or cp is None or checkpoint_failures(cp) or
                cp["state"] == "withdrawn" or not cp["filter_complete"] or observation.get("project_id") != cp["project_id"]):
            return "read_unavailable_no_disclosure"
        # Stored native snapshot identity is provenance, never a live handle.
        # Reacquire only this transient field; all persistent source/publication
        # joins must still match. A read-only reader need not write a checkpoint.
        token = {**cp["index_read_token"], "redb_snapshot_id": observation.get("redb_snapshot_id")}
        if (index_token_failures(token, index, observation) or
                any(observation.get(name) is not True for name in ("access_allowed", "deletion_allows_audit", "disclosure_fence_current"))):
            return "read_unavailable_no_disclosure"
        self.disclosure_count += 1
        return "historical_reset_fact_no_runtime_authority"

    def withdraw(self, at_utc):
        if self.checkpoint is None or checkpoint_failures(self.checkpoint):
            return "checkpoint_unavailable"
        if self.checkpoint["state"] == "withdrawn":
            return "already_withdrawn_original_anchor"
        candidate = {**self.checkpoint, "state": "withdrawn", "updated_at_utc": at_utc, "withdrawn_at_utc": at_utc}
        if checkpoint_failures(candidate) or datetime.fromisoformat(at_utc.replace("Z", "+00:00")) < datetime.fromisoformat(self.checkpoint["updated_at_utc"].replace("Z", "+00:00")):
            return "invalid_withdrawal"
        self.checkpoint = candidate
        return "withdrawn_publication_fenced"


def workspace_history_fact(event, subject, *, admitted=False, source_verified=False,
                           access_allowed=False, deletion_allows_audit=False,
                           checkpoint_read_token_valid=False, root=ROOT):
    """One bounded synthetic payload join, not whole-range or live authority."""
    refused = {"outcome": "read_unavailable", "fact": None, "current_runtime_authority": False}
    if not all(flag is True for flag in (admitted, source_verified, access_allowed, deletion_allows_audit, checkpoint_read_token_valid)):
        return refused
    if not validators(root)["subject"].is_valid(subject):
        return refused
    gate = sibling("pm-browser-event-admission", root)
    if gate.candidate_failures(event, "BrowserRuntimeService.workspace", gate.contract_context()) or event["event_type"] != EVENT_TYPE:
        return refused
    payload = event["payload"]
    actual = {field: payload["context"][field] for field in SUBJECT}
    if subject != actual:
        return {"outcome": "verified_scope_nonmatch", "fact": None, "current_runtime_authority": False}
    return {"outcome": "historical_reset_fact", "fact": {"event_id": event["event_id"], "scope": actual,
            "prior_workspace_generation": payload["facts"]["prior_workspace_generation"],
            "workspace_generation_at_reset": payload["facts"]["workspace_generation"]}, "current_runtime_authority": False}


def fixture_values(root=ROOT, generic_case="initial_mixed_scope"):
    """Resolve named canonical fixture controls without claiming real custody."""
    fixtures = load(FIXTURE_PATH, root)
    gate = sibling("pm-browser-event-admission", root)
    cases = [case for case in load("Plans/browser_event_admission_fixtures.json", root)["valid"]
             if case["case_id"] == fixtures["reset_fixture"]["event_case_id"]]
    if len(cases) != 1 or cases[0]["event_type"] != EVENT_TYPE:
        raise ValueError("reset fixture source identity")
    reset = {"event": gate.fixture_event(cases[0], 1), **{key: copy.deepcopy(fixtures["reset_fixture"][key])
             for key in ("request", "result", "transition", "witness")}}
    source = load(fixtures["generic_fixture_source"]["path"], root)["positive"][generic_case]
    index = copy.deepcopy(source["checkpoint"])
    generation = index["current_generation_id"]
    node = index["generations"][generation]
    frontier = node["frontier"]
    token = {"storage_instance_id": index["storage_instance_id"], "checkpoint_key": source["checkpoint_key"],
             "checkpoint_ref": source["checkpoint_key"] + "#/generations/" + generation,
             "generation_id": generation, "generation_anchor_sha256": digest(node["anchor"]),
             "frontier_revision": frontier["publication_revision"], "frontier_sha256": digest(frontier),
             "index_dataset_name": node["index_dataset_name"], "source_selection": copy.deepcopy(frontier["source_selection"]),
             "redb_snapshot_id": "snapshot:reset-fixture"}
    coverage = frontier["coverage"]
    checkpoint = {"schema_id": "pm.storage_value.browser_workspace_reset_index_checkpoint.v1", "schema_version": VERSION,
                  "checkpoint_id": EVENT_TYPE, "storage_instance_id": index["storage_instance_id"], "project_id": "project-browser",
                  "scope_partition": scope_partition("project-browser"), "projector_id": PROJECTOR, "projector_version": VERSION,
                  "event_type": EVENT_TYPE, "index_read_token": token,
                  "first_retained_sequence_id": coverage["first_retained_sequence_id"],
                  "index_through_sequence_id": coverage["through_sequence_id"], "source_cursor": copy.deepcopy(coverage["last_frame"]),
                  "filter_complete": True, "state": "current" if coverage["health"] == "healthy" else "degraded",
                  "health": coverage["health"], "updated_at_utc": "2026-09-11T20:00:00Z", "withdrawn_at_utc": None,
                  "publication_id": "publication:reset-fixture-1", "published_at_utc": "2026-09-11T20:00:00Z",
                  "hold_refs": [], "retired_generations": []}
    observation = {"generic_source_verified": True, "redb_snapshot_id": token["redb_snapshot_id"],
                   "source_selection": copy.deepcopy(frontier["source_selection"]), "project_id": "project-browser",
                   "project_filter_complete": True, "reset_sources_validated": True, "source_dedupe_verified": True,
                   "access_allowed": True, "deletion_allows_audit": True, "binding_supported": True,
                   "before_commit_fence_current": True, "disclosure_fence_current": True, "prior_checkpoint": None,
                   "generation_transaction_resolved": True, "coordinator_admitted": True,
                   "complete_rebuild_verified": True, "capacity_reserved": True, "hold_ref_fence_current": True,
                   "generation_transaction": {"schema_id": "pm.browser.workspace_reset.checkpoint_generation_transaction.v1",
                      "transaction_ref": "transaction:reset-checkpoint-initial", "status": "committed",
                      "checkpoint_key": CHECKPOINT_FAMILY + ".v1:" + checkpoint["storage_instance_id"] + ":" + checkpoint["scope_partition"],
                      "before": None, "after": copy.deepcopy(checkpoint), "selected_publication_id": checkpoint["publication_id"],
                      "committed_at_utc": checkpoint["published_at_utc"]}}
    return reset, checkpoint, index, observation


def validate_fixture_contracts(*, root=ROOT):
    """Static fixture checks; this function does not grant event admission."""
    reset, checkpoint, index, observation = fixture_values(root)
    gate = sibling("pm-browser-event-admission", root)
    failures = []
    for name, errors in (("reset_positive", reset_preflight_failures(**reset, root=root)),
                         ("checkpoint_positive", checkpoint_failures(checkpoint, root=root)),
                         ("generic_token_positive", index_token_failures(checkpoint["index_read_token"], index, observation, root=root)),
                         ("generation_transaction_positive", generation_admission_failures(None, checkpoint, observation, root=root))):
        if errors:
            failures.append({"case_id": name, "errors": errors})
    cases = load(FIXTURE_PATH, root)["reset_invalid"]
    if not cases or len({case["case_id"] for case in cases}) != len(cases):
        failures.append({"case_id": "negative_case_identity_or_empty"})
    for case in cases:
        changed = copy.deepcopy(reset)
        gate.set_pointer(changed[case["target"]], case["pointer"], case["value"])
        errors = reset_preflight_failures(**changed, root=root)
        if case["expected_error"] not in errors:
            failures.append({"case_id": case["case_id"], "expected": case["expected_error"], "errors": errors})
    return {"schema_id": "pm.browser_workspace_reset_static_report.v1", "status": "fail" if failures else "pass",
            "reset_positive_cases": 1, "checkpoint_positive_cases": 2, "reset_negative_cases": len(cases),
            "generation_transaction_positive_cases": 1,
            "native_proof": False, "admission_claimed": False,
            "claim_boundary": "Synthetic owner-view and generic-token joins only; separate mixed-scope generic fixture is not an indexed-reset end-to-end execution.",
            "failures": failures}


if __name__ == "__main__":
    report = validate_fixture_contracts()
    print(json.dumps(report, indent=2, sort_keys=True))
    raise SystemExit(bool(report["failures"]))
