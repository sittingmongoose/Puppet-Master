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
import sys
from pathlib import Path

from jsonschema import Draft202012Validator


ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))
from pm_contract_formats import FormatChecker
import pm_event_payload_route as body_route
from pm_ds_tables import Facts
Draft202012Validator = body_route.StrictValidator
CONTRACT_PATH = "Plans/browser_workspace_created_contracts.schema.json"
FIXTURE_PATH = "Plans/browser_workspace_created_contract_fixtures.json"
EVENT_TYPE = "browser.workspace.created"
CHECKPOINT_FAMILY = "browser_workspace_created_index_checkpoint"
PROJECTOR = "storage.browser_workspace_created_index.v1"
CONSUMER = "browser.workspace_inventory.created.v1"
VERSION = "1.0.0"
# SP-266's v2 successor is the current definition (admitted under DL-046, authored 2026-09-25). The v1 value,
# binding and reader above remain compatibility custody, authenticated only at the
# StorageMigrationCoordinator same-key handoff.
V2_SCHEMA_PATH = "Plans/browser_workspace_created_checkpoint_v2.schema.json"
GENERIC_PATH = "Plans/event_record_index_checkpoint.schema.json"
PROJECTOR_V2 = "storage.browser_workspace_created_index.v2"
CONSUMER_V2 = "browser.workspace_inventory.created.v2"
VERSION_V2 = "2.0.0"
LIVE_SNAPSHOT_FENCE = "redb_snapshot_id"
V1_CHECKPOINT_ID_REF = "https://puppetmaster.local/schemas/browser_workspace_created_contracts/1.0.0#/$defs/checkpoint"
GENERIC_LAST_FRAME_ID_REF = ("https://puppetmaster.local/schemas/event_record_index_checkpoint/1.0.0/schema.json"
                             "#/$defs/coverage/properties/last_frame")
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


def durable_read_token(root=ROOT):
    """SP-278's read token without the live snapshot fence (DL-076), materialized from its canonical definition."""
    token = copy.deepcopy(load(GENERIC_PATH, root)["$defs"]["read_token"])
    token["required"] = [field for field in token["required"] if field != LIVE_SNAPSHOT_FENCE]
    del token["properties"][LIVE_SNAPSHOT_FENCE]
    return token


def _localize(node, mapping):
    if isinstance(node, dict):
        return {key: (mapping.get(value, value) if key == "$ref" and isinstance(value, str) else _localize(value, mapping))
                for key, value in node.items()}
    if isinstance(node, list):
        return [_localize(item, mapping) for item in node]
    return node


def checkpoint_v2_bundle(root=ROOT):
    """Closed, self-contained registry materialization of the current v2 value.

    The v2 definition with its referenced SP-278 read-token fields and last-frame cursor inlined, the
    exact v1 checkpoint as the retained handoff reader, and a same-key read dispatcher that admits
    exactly the current v2 value or an unchanged retained v1 value by their schema_id discriminants.
    """
    v2, v1, generic = load(V2_SCHEMA_PATH, root), load(CONTRACT_PATH, root), load(GENERIC_PATH, root)
    body_route.eager(body_route.schema_registry(root), v2, v1, generic)
    mapping = {V1_CHECKPOINT_ID_REF: "#/$defs/checkpoint_v1", GENERIC_LAST_FRAME_ID_REF: "#/$defs/generic_source_cursor"}
    value = _localize(copy.deepcopy(v2["$defs"]["checkpoint"]), mapping)
    defs = {name: _localize(copy.deepcopy(v2["$defs"][name]), mapping)
            for name in ("timestamp", "non_secret_ref", "checkpoint_core", "retired_generation")}
    defs["durable_index_read_token"] = durable_read_token(root)
    defs["generic_source_cursor"] = copy.deepcopy(generic["$defs"]["coverage"]["properties"]["last_frame"])
    defs["checkpoint_v1"] = copy.deepcopy(v1["$defs"]["checkpoint"])
    defs.update({name: copy.deepcopy(v1["$defs"][name]) for name in ("sha256", "source_cursor")})
    defs["registered_read_value"] = {
        "$comment": ("REGISTERED SAME-KEY READ DISPATCH ONLY. The row's value_schema_id and schema_version select the "
                     "current v2 writer, which validates only against the root. This dispatcher admits an unchanged "
                     "retained v1 value only for the StorageMigrationCoordinator handoff that authenticates its "
                     "preimage; no ordinary v1 reader, conversion or rewrite-on-read."),
        "oneOf": [{"$ref": "#"}, {"$ref": "#/$defs/checkpoint_v1"}],
    }
    value["$defs"] = defs
    return value


def checkpoint_failures(value, *, root=ROOT):
    entry = Facts("cr_checkpoint_entry", chain=True)
    if entry.stop("CC01_schema", lambda: not list(Draft202012Validator(checkpoint_bundle(root), format_checker=FormatChecker()).iter_errors(value))):
        return [entry.first_code()]
    # date-time format support is optional in jsonschema installations. Validate
    # the exact timestamp syntax and calendar ourselves before ordering instants.
    instants = {}

    def grammar(field):
        return value[field] is None or re.fullmatch(r"\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})", value[field]) is not None

    def calendar(field):
        if value[field] is None:
            return True
        try:
            instants[field] = datetime.fromisoformat(value[field].replace("Z", "+00:00"))
        except (TypeError, ValueError):
            return False
        return True

    for row, check in (("CC02_updated_grammar", lambda: grammar("updated_at_utc")),
                       ("CC03_updated_calendar", lambda: calendar("updated_at_utc")),
                       ("CC04_withdrawn_grammar", lambda: grammar("withdrawn_at_utc")),
                       ("CC05_withdrawn_calendar", lambda: calendar("withdrawn_at_utc"))):
        if entry.stop(row, check):
            return [entry.first_code()]
    entry.done()
    cursor = value["source_cursor"]
    facts = Facts("cr_checkpoint")
    facts["CC06_scope_partition"] = value["scope_partition"] == scope_partition(value["project_id"])
    facts["CC07_range_order"] = cursor is None or value["first_retained_sequence_id"] <= value["index_through_sequence_id"]
    facts["CC08_cursor_through"] = cursor is None or cursor["last_sequence_id"] == value["index_through_sequence_id"]
    facts["CC09_withdrawal_order"] = value["withdrawn_at_utc"] is None or instants["withdrawn_at_utc"] <= instants["updated_at_utc"]
    return facts.codes()

def expected_storage_family(root=ROOT):
    """SP-266's one derived family, whose current definition is the v2 value (authored 2026-09-25).

    The row describes the current v2 writer only. A retained v1 value is read through
    $defs/registered_read_value solely for the StorageMigrationCoordinator same-key handoff.
    """
    binding = load(V2_SCHEMA_PATH, root)["x-pm-event-authority-binding"]
    schema = checkpoint_v2_bundle(root)
    owner = binding["storage_owner_ref"]
    return {
        "family_id": CHECKPOINT_FAMILY, "storage_kind": "redb_checkpoint", "status": "materialized",
        "tier": "later_gui_or_feature_projection", "key_shape": binding["checkpoint_key"], "compatibility_key_shapes": [],
        "value_schema_id": binding["checkpoint_schema_id"], "value_schema_ref": V2_SCHEMA_PATH + "#/$defs/checkpoint",
        "owner_doc": owner, "producer": [PROJECTOR_V2 + "@" + VERSION_V2], "consumers": [CONSUMER_V2 + "@" + VERSION_V2],
        "schema_version": VERSION_V2, "encoding": "messagepack_canonical", "required_fields": schema["required"],
        "optional_fields": [], "nullable_fields": ["first_retained_sequence_id", "index_through_sequence_id", "source_cursor", "withdrawn_at_utc"],
        "replay_behavior": "Explicitly adopt the SP-278 root/generation/anchor/frontier/source/read token and the complete generic range, including verified nonmatching events. Commit only this filtered checkpoint under prior-value CAS and unchanged source/currentness fences; publish the historical creation join read-only from the same snapshot, never as a durable Browser projection row. The stored token is the SP-278 nine-field durable read token; the writer before commit and every reader before disclosure join the snapshot ID of their own live read, which is never stored. One current plus at most two retired cores. No index, global-checkpoint, runtime, Usage or prompt write.",
        "migration": "StorageMigrationCoordinator alone installs this same-key v2 successor against the actual store graph and ceilings. It authenticates the retained v1 row, codec, Project/source and hold/reference custody through $defs/registered_read_value, rebuilds the v2 current value from complete verified CURRENT-selected SP-278 source, and in one same-key transaction reserves lawful capacity, preserves the finalized v1 core as the v1_custody_bound_at_handoff history entry and publishes the v2 core. After the handoff the v1 binding cannot write the key. Unknown old custody, unsupported codec, unresolved hold, full protected capacity, incomplete source or uncertain outcome leaves v2 currentness unavailable; no lazy rewrite, sibling reuse or historical event mutation.",
        "migration_disposition": {"mode": "store_coordinator", "canonical_write_key_only": True, "compatibility_keys_read_only": False, "ambiguity_policy": "fail_closed", "source_refs": [owner]},
        "restore_disposition": {"mode": "rebuild_from_authority", "transaction_family_id": None, "outcome_owner_ref": owner, "mutation_fence_on_unresolved": True, "source_refs": [owner]},
        "recovery_disposition": {"authority_class": "derived_rebuildable", "strategy": "rebuild_from_canonical_events_and_snapshot", "source_family_ids": ["event_record_index", "event_record_index_checkpoint"], "source_refs": ["Plans/Contracts_V0.md#EventRecord", "Plans/storage-plan.md#SP-278", owner], "backup_required": False, "data_loss_if_unavailable": False, "user_disclosure_required": True},
        "retention_compaction": "Exact RP-PROJECTION-3GEN@1.0.0; current_plus_history in the same value: one current core plus at most two retired cores, each terminal-anchored at its core's actual first withdrawal (the v1 wrapper at its retired_at_utc); cleanup of one exact retired entry from that anchor plus 604800 seconds, with holds and references resolved through the unchanged retention_hold_record owner; a fourth publication waits for lawful cleanup; rebuild_projection overflow; rebuild expiry. Refresh, Browser close, Run completion and CURRENT switches never set/reset an anchor. Source-event/index policies remain unchanged.",
        "retention_policy_ref": "RP-PROJECTION-3GEN",
        "redaction_no_secret_rule": "Only non-secret IDs, hashes, cursors, the nine-field durable read token and opaque Storage refs; no snapshot ID, payload/content copies, credentials, protected-auth identity or local absolute paths. Current access and deletion checks gate every read and disclosure.",
        "legacy_canonical_crosswalk_status": "browser.workspace.created-only derived checkpoint under DL-046. The v2 value is current; the exact v1 value (Plans/browser_workspace_created_contracts.schema.json#/$defs/checkpoint, inline as $defs/checkpoint_v1) is compatibility custody read only for the same-key handoff. No other event, canonical Browser record or shared-runtime domain is admitted.",
        "value_schema": schema,
    }


def expected_binding(root=ROOT):
    """The exact current (v2) event authority binding of browser.workspace.created."""
    return {
        "event_type": EVENT_TYPE, "binding_version": VERSION_V2,
        "semantic_owner_ref": "Plans/Section15_MVP_Promoted_Features_Spec.md#SMPFS-167",
        "storage_owner_ref": "Plans/storage-plan.md#SP-266",
        "producer_component": "BrowserRuntimeService.workspace", "consumer_id": CONSUMER_V2, "consumer_version": VERSION_V2,
        "projector_id": PROJECTOR_V2, "projector_version": VERSION_V2, "checkpoint_family_id": CHECKPOINT_FAMILY,
        "checkpoint_key": CHECKPOINT_FAMILY + ".v1:{storage_instance_id}:{scope_partition}",
        "checkpoint_schema_id": "pm.storage_value." + CHECKPOINT_FAMILY + ".v2", "checkpoint_schema_version": VERSION_V2,
        "checkpoint_schema_pointer": "#/$defs/checkpoint",
        "source_payload_schema_ref": "Plans/browser_event_payloads.schema.json#/$defs/workspace_created",
        "source_payload_schema_id": "pm.browser_event.workspace_created.schema.v1",
        "source_retention_policy_id": "RP-AUTHORITY-INDEFINITE", "checkpoint_retention_policy_id": "RP-PROJECTION-3GEN",
        "retention_policy_version": VERSION, "definition_authority_ref": "Plans/Decision_Log.md#DL-046",
        "definition_status": "newly_authored_owner_contract", "native_proof": False,
        "generic_index_owner_ref": "Plans/storage-plan.md#SP-278",
        "generic_index_read_token_ref": "Plans/event_record_index_checkpoint.schema.json#/$defs/read_token",
    }


def creation_preflight_failures(event, request, result, witness, *, root=ROOT, require_new_identity=True, payload_store=None):
    """Compare resolved-value fixtures; never trust ref text as real resolution."""
    # Reuse the shared Browser envelope/payload validator, without giving this
    # synthetic preflight or an unadmitted candidate EventRecord authority.
    entry = Facts("cr_preflight_entry", chain=True)
    if entry.stop("CR00_witness_object", lambda: isinstance(witness, dict)):
        return [entry.first_code()]
    entry.done()
    gate, context = candidate_gate(root)
    candidate_errors = gate.candidate_failures(event, witness.get("producer_component"), context, payload_store=payload_store)
    # Shape preconditions of the joins below: the shared candidate rows above have
    # already refused every input these returns protect (envelope/payload schema).
    if not isinstance(event, dict):
        return candidate_errors
    event, _ = body_route.resolved_event(event, payload_store)
    if not isinstance(event.get("payload"), dict):
        return candidate_errors
    if not isinstance(event["payload"].get("context"), dict) or not isinstance(event["payload"].get("facts"), dict):
        return candidate_errors
    owner = load("Plans/section15_browser_program_contracts.schema.json", root)
    schemas = Facts("cr_preflight_schemas", chain=True)
    for row, kind, value in (("CR0A_request_schema", "browser_command_request", request),
                             ("CR0B_result_schema", "browser_command_result", result)):
        schema = {"$ref": "#/$defs/" + kind, "$defs": owner["$defs"]}
        if schemas.stop(row, lambda: not list(Draft202012Validator(schema, format_checker=FormatChecker()).iter_errors(value))):
            return [schemas.first_code()]
    schemas.done()
    payload = event.get("payload", {})
    context = payload.get("context", {})
    facts = payload.get("facts", {})
    rs, xs = request["scope"], result["scope"]
    generation = witness.get("workspace_generation")
    f = Facts("cr_preflight")
    f["CR01_event_type"] = event.get("event_type") == EVENT_TYPE
    f["CR02_payload_event_type"] = payload.get("event_type") == EVENT_TYPE
    f["CR03_workspace_state_created"] = facts.get("workspace_state") == "created"
    f["CR04_no_prior_generation"] = facts.get("prior_workspace_generation") is None
    f["CR05_subject_present"] = [field for field in SUBJECT if context.get(field) is None] == []
    f["CR06_run_attempt_paired"] = (context.get("run_id") is None) == (context.get("attempt_id") is None)
    f["CR07_request_command"] = rs["command_id"] == "cmd.browser.workspace.create"
    f["CR08_result_command"] = xs["command_id"] == "cmd.browser.workspace.create"
    f["CR09_request_lineage"] = [field for field in LINEAGE if rs["lineage"].get(field) != context.get(field)] == []
    f["CR10_result_lineage"] = [field for field in LINEAGE if xs["lineage"].get(field) != context.get(field)] == []
    f["CR11_request_session"] = rs["browser_session_id"] == context.get("browser_session_id")
    f["CR12_request_security_class"] = rs["session_security_class"] == "ordinary"
    f["CR13_result_session"] = xs["browser_session_id"] == context.get("browser_session_id")
    f["CR14_result_security_class"] = xs["session_security_class"] == "ordinary"
    f["CR15_result_workspace"] = xs.get("browser_workspace_id") == context.get("browser_workspace_id")
    f["CR16_node_lineage"] = context.get("node_id") == witness.get("node_id")
    f["CR17_request_result_scope"] = [field for field, value in rs.items()
                                      if field != "browser_workspace_id" and xs.get(field) != value] == []
    f["CR18_request_workspace"] = rs.get("browser_workspace_id", context.get("browser_workspace_id")) == context.get("browser_workspace_id")
    f["CR19_result_instance"] = result["command_instance_id"] == request["command_instance_id"]
    f["CR20_witness_instance"] = result["command_instance_id"] == witness.get("command_instance_id")
    f["CR21_event_idempotency"] = request["idempotency_key"] == event.get("idempotency_key")
    f["CR22_witness_idempotency"] = request["idempotency_key"] == witness.get("idempotency_key")
    f["CR23_result_succeeded"] = result["outcome"] == "succeeded"
    f["CR24_result_reconciled"] = result["effect_state"] == "effects_reconciled"
    for row, left, right in (
            ("CR25_owner_record_ref", payload.get("owner_record_ref"), witness.get("owner_record_ref")),
            ("CR26_transition_receipt_ref", payload.get("transition_receipt_ref"), witness.get("transition_receipt_ref")),
            ("CR27_dispatch_receipt_ref", result.get("dispatch_receipt_ref"), witness.get("transition_receipt_ref")),
            ("CR28_request_permission_ref", payload.get("permission_snapshot_ref"), request["permission_snapshot_ref"]),
            ("CR29_witness_permission_ref", payload.get("permission_snapshot_ref"), witness.get("permission_snapshot_ref")),
            ("CR30_capability_snapshot_ref", payload.get("capability_snapshot_ref"), witness.get("capability_snapshot_ref")),
            ("CR31_filesafe_decision_ref", request["filesafe_decision_ref"], witness.get("filesafe_decision_ref")),
            ("CR32_workspace_policy_ref", rs.get("workspace_policy_ref"), witness.get("workspace_policy_ref")),
            ("CR33_capability_profile_id", rs.get("capability_profile_id"), witness.get("capability_profile_id"))):
        f[row] = bool(left) and left == right
    f["CR34_workspace_ref_present"] = bool(witness.get("workspace_ref"))
    f["CR35_workspace_ref_result"] = not witness.get("workspace_ref") or witness["workspace_ref"] in result["result_refs"]
    f["CR36_witness_workspace_id"] = witness.get("workspace_id") == context.get("browser_workspace_id")
    f["CR37_witness_generation_type"] = type(generation) is int
    f["CR38_witness_generation"] = type(generation) is not int or generation == facts.get("workspace_generation")
    f["CR39_producer"] = witness.get("producer_component") == "BrowserRuntimeService.workspace"
    for row, field, applies in (("CR40_producer_authenticated", "producer_authenticated", True),
                                ("CR41_permission_current", "permission_current", True),
                                ("CR42_filesafe_allowed", "filesafe_allowed", True),
                                ("CR43_capability_current", "capability_current", True),
                                ("CR44_scope_current", "scope_current", True),
                                ("CR45_unused_workspace_identity", "unused_workspace_identity", require_new_identity),
                                ("CR46_resource_isolated", "resource_isolated", require_new_identity),
                                ("CR47_resource_unexposed", "resource_unexposed", require_new_identity)):
        f[row] = not applies or witness.get(field) is True
    return sorted(set(list(candidate_errors) + f.codes()))

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

    def create(self, event, request, result, witness, append_outcome, *, admitted, payload_store=None):
        f = Facts("cr_create", chain=True)
        if f.stop("CO01_admitted", lambda: admitted is True):
            return f.first_code()
        if f.stop("CO02_preflight", lambda: not creation_preflight_failures(event, request, result, witness, require_new_identity=False, payload_store=payload_store)):
            return f.first_code()
        semantic = self.semantic_digest(event)
        key = (scope_partition(event["project_id"]), EVENT_TYPE, event["idempotency_key"])
        event_id = event["event_id"]
        if f.stop("CO03_event_identity", lambda: event_id not in self.events or self.events[event_id] == semantic):
            return f.first_code()
        if f.stop("CO04_committed_identity", lambda: key not in self.committed or self.committed[key]["digest"] == semantic):
            return f.first_code()
        if key in self.committed:
            f.done()
            return "original_result_no_effect"
        if f.stop("CO05_not_pending", lambda: key not in self.pending):
            return f.first_code()
        if f.stop("CO06_preflight_new_identity", lambda: not creation_preflight_failures(event, request, result, witness, payload_store=payload_store)):
            return f.first_code()
        resolved, _ = body_route.resolved_event(event, payload_store)
        workspace = (event["project_id"], resolved["payload"]["context"]["browser_workspace_id"])
        if f.stop("CO07_workspace_unused", lambda: workspace not in self.workspace_ids):
            return f.first_code()
        if append_outcome == "failed":
            f.done()
            return "unexposed_resource_disposed_no_append"
        if append_outcome == "unknown":
            f.done()
            self.pending[key] = {"digest": semantic, "event_id": event_id, "workspace": workspace}
            return "unexposed_resource_fenced_unknown_append"
        if f.stop("CO08_append_outcome", lambda: append_outcome in ("committed", "committed_ack_lost")):
            return f.first_code()
        f.done()
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
        f = Facts("cr_advance", chain=True)
        expected = observation.get("resolved_checkpoint_fields", {})
        checks = [("CA01_candidate_valid", lambda: not checkpoint_failures(candidate)),
                  ("CA02_stored_valid", lambda: self.checkpoint is None or not checkpoint_failures(self.checkpoint)),
                  ("CA03_candidate_not_withdrawn", lambda: candidate["state"] != "withdrawn"),
                  ("CA04_stored_not_withdrawn", lambda: not (self.checkpoint and self.checkpoint["state"] == "withdrawn")),
                  ("CA05_filter_complete", lambda: bool(candidate["filter_complete"]))]
        for number, field in enumerate(("index_published", "range_complete", "source_verified", "dedupe_verified",
                                        "access_allowed", "deletion_allows_audit", "binding_supported",
                                        "before_commit_fence_current"), 6):
            checks.append((f"CA{number:02d}_{field}", lambda field=field: observation.get(field) is True))
        for number, field in enumerate(("storage_instance_id", "project_id", "scope_partition", "index_checkpoint_ref",
                                        "current_selection_sha256", "first_retained_sequence_id", "index_through_sequence_id",
                                        "source_cursor", "health"), 14):
            checks.append((f"CA{number:02d}_resolved_{field}", lambda field=field: field in expected and candidate[field] == expected[field]))
        checks += [("CA23_empty_range_verified", lambda: candidate["source_cursor"] is not None or observation.get("empty_range_verified") is True),
                   ("CA24_prior_cas", lambda: observation.get("prior_checkpoint_sha256") == (digest(self.checkpoint) if self.checkpoint is not None else None)),
                   ("CA25_cursor_not_regressed", lambda: self.checkpoint is None or not (
                       self.checkpoint["source_cursor"] and (not candidate["source_cursor"] or
                       candidate["source_cursor"]["last_sequence_id"] < self.checkpoint["source_cursor"]["last_sequence_id"]))),
                   ("CA26_storage_unchanged", lambda: self.checkpoint is None or self.checkpoint["storage_instance_id"] == candidate["storage_instance_id"]),
                   ("CA27_partition_unchanged", lambda: self.checkpoint is None or self.checkpoint["scope_partition"] == candidate["scope_partition"])]
        for row, check in checks:
            if f.stop(row, check):
                return f.first_code()
        f.done()
        self.checkpoint = copy.deepcopy(candidate)
        self.commit_count += 1
        return "checkpoint_committed_no_runtime_effect"

    def disclose(self, expected_checkpoint_digest, *, current_token, access_allowed, deletion_allows_audit):
        f = Facts("cr_disclose", chain=True)
        for row, check in (("DI01_checkpoint_present", lambda: self.checkpoint is not None),
                           ("DI02_checkpoint_valid", lambda: not checkpoint_failures(self.checkpoint)),
                           ("DI03_not_withdrawn", lambda: self.checkpoint["state"] != "withdrawn"),
                           ("DI04_filter_complete", lambda: bool(self.checkpoint["filter_complete"])),
                           ("DI05_current_token", lambda: current_token is True),
                           ("DI06_access_allowed", lambda: access_allowed is True),
                           ("DI07_deletion_allows_audit", lambda: deletion_allows_audit is True),
                           ("DI08_checkpoint_digest", lambda: expected_checkpoint_digest == digest(self.checkpoint))):
            if f.stop(row, check):
                return f.first_code()
        f.done()
        self.disclosure_count += 1
        return "historical_fact_no_runtime_authority"

    def withdraw(self, at_utc):
        f = Facts("cr_withdraw", chain=True)
        if f.stop("WD01_checkpoint_present", lambda: self.checkpoint is not None):
            return f.first_code()
        if f.stop("WD02_checkpoint_valid", lambda: not checkpoint_failures(self.checkpoint)):
            return f.first_code()
        if f.stop("WD03_not_withdrawn", lambda: self.checkpoint["state"] != "withdrawn"):
            return f.first_code()
        candidate = copy.deepcopy(self.checkpoint)
        candidate.update(state="withdrawn", withdrawn_at_utc=at_utc, updated_at_utc=at_utc)
        if f.stop("WD04_candidate_valid", lambda: not checkpoint_failures(candidate)):
            return f.first_code()
        if f.stop("WD05_not_before_observation", lambda: datetime.fromisoformat(at_utc.replace("Z", "+00:00")) >= datetime.fromisoformat(self.checkpoint["updated_at_utc"].replace("Z", "+00:00"))):
            return f.first_code()
        f.done()
        self.checkpoint = candidate
        return "withdrawn_publication_fenced"

def workspace_history_fact(event, subject, *, source_verified, access_allowed,
                           deletion_allows_audit, checkpoint_read_token_valid, root=ROOT, payload_store=None, historical_source=None):
    """One synthetic read join, never whole-range completeness or live state."""
    refused = {"outcome": "read_unavailable", "fact": None, "current_runtime_authority": False}
    gate, context = candidate_gate(root)
    f = Facts("cr_history", chain=True)
    for row, check in (("HF01_source_verified", lambda: source_verified is True),
                       ("HF02_access_allowed", lambda: access_allowed is True),
                       ("HF03_deletion_allows_audit", lambda: deletion_allows_audit is True),
                       ("HF04_read_token_valid", lambda: checkpoint_read_token_valid is True),
                       ("HF05_subject_object", lambda: isinstance(subject, dict)),
                       ("HF06_subject_fields", lambda: set(subject) == set(SUBJECT)),
                       ("HF07_subject_values", lambda: [field for field in SUBJECT if not isinstance(subject[field], str) or not subject[field]] == []),
                       ("HF08_retained_candidate", lambda: not gate.candidate_failures(event, "BrowserRuntimeService.workspace", context, payload_store=payload_store, historical=True, historical_source=historical_source)),
                       ("HF09_event_type", lambda: event["event_type"] == EVENT_TYPE)):
        if f.stop(row, check):
            return refused
    f.done()
    event, _ = body_route.resolved_event(event, payload_store, historical=True)
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
    """A prepared sibling or arbitrary path can never manufacture this binding.

    The current binding is the v2 one (SP-266's successor, admitted under DL-046). The v1 binding in
    the v1 contracts schema stays as compatibility custody and no longer authorizes the admission row.
    """
    entry = Facts("cr_binding_entry", chain=True)
    if entry.stop("BF01_event_type", lambda: row["event_type"] == EVENT_TYPE):
        return [entry.first_code()]
    entry.done()
    binding = load(V2_SCHEMA_PATH, root)["x-pm-event-authority-binding"]
    expected = expected_binding(root)
    f = Facts("cr_binding")
    f["BF02_schema_binding"] = binding == expected
    f["BF03_definition_status"] = load(V2_SCHEMA_PATH, root).get("x-pm-definition-status") == expected["definition_status"]
    f["BF04_contract_ref"] = row.get("authority_contract_ref") == V2_SCHEMA_PATH + "#/x-pm-event-authority-binding"
    f["BF05_semantic_owner"] = row["semantic_owner_ref"] == expected["semantic_owner_ref"]
    f["BF06_source_retention"] = row["retention_policy_ref"] == {"registry_schema_id": "pm.storage_value_registry.v2", "policy_id": "RP-AUTHORITY-INDEFINITE", "policy_version": VERSION}
    f["BF07_consumer_refs"] = {expected["semantic_owner_ref"], expected["storage_owner_ref"]} <= set(row["consumer_contract_refs"])
    f["BF08_producer"] = row["producer_component"] == expected["producer_component"]
    f["BF09_payload_schema_id"] = row["payload_schema_ref"]["schema_id"] == expected["source_payload_schema_id"]
    failures = f.codes()
    registry = load("Plans/storage_value_registry.json", root)
    families = [family for family in registry["families"] if family["family_id"] == CHECKPOINT_FAMILY]
    unique = Facts("cr_binding_family", chain=True)
    if unique.stop("BF10_family_unique", lambda: len(families) == 1):
        return failures + [unique.first_code()]
    unique.done()
    family = families[0]
    disposition = Facts("cr_binding_disposition")
    disposition["BF11_family_disposition"] = family == expected_storage_family(root)
    failures += disposition.codes()
    joins = Facts("cr_binding_family_joins")
    joins["BF12_value_schema"] = family["value_schema"] == checkpoint_v2_bundle(root)
    joins["BF13_value_schema_ref"] = family["value_schema_ref"] == V2_SCHEMA_PATH + "#/$defs/checkpoint"
    joins["BF14_value_schema_id"] = family["value_schema_id"] == expected["checkpoint_schema_id"]
    joins["BF15_schema_version"] = family["schema_version"] == VERSION_V2
    joins["BF16_key_shape"] = family["key_shape"] == expected["checkpoint_key"]
    joins["BF17_producer"] = family["producer"] == [PROJECTOR_V2 + "@" + VERSION_V2]
    joins["BF18_consumers"] = family["consumers"] == [CONSUMER_V2 + "@" + VERSION_V2]
    joins["BF19_owner_doc"] = family["owner_doc"] == expected["storage_owner_ref"]
    joins["BF20_retention_policy"] = family["retention_policy_ref"] == expected["checkpoint_retention_policy_id"]
    return failures + joins.codes()

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
