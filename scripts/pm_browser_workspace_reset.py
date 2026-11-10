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
import sys
from pathlib import Path
from urllib.parse import urljoin

from jsonschema import Draft202012Validator
from referencing import Registry, Resource


ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))
from pm_contract_formats import FormatChecker
import pm_event_payload_route as body_route
from pm_ds_tables import Facts
Draft202012Validator = body_route.StrictValidator
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

    registry = body_route.schema_registry(root).with_resources(resources).crawl()
    body_route.eager(registry, own, generic, owner, payloads)
    result = {}
    for prefix, schema, names in (("", own, ("resolved_transition", "checkpoint", "subject", "generation_transaction",
                                            "durable_read_token")),
                                  ("generic_", generic, ("checkpoint", "read_token")),
                                  ("", owner, ("browser_command_request", "browser_command_result"))):
        Draft202012Validator.check_schema(schema)
        for name in names:
            result[prefix + name] = Draft202012Validator(
                {"$ref": schema["$id"] + "#/$defs/" + name}, registry=registry, format_checker=FormatChecker())
    return result


def scope_partition(project_id):
    return "project~" + base64.urlsafe_b64encode(project_id.encode("utf-8")).decode("ascii").rstrip("=")


def reset_preflight_failures(event, request, result, transition, witness, *, root=ROOT, payload_store=None):
    """Check claimed resolved values; witness booleans are NOT native evidence."""
    entry = Facts("rs_preflight_entry", chain=True)
    if entry.stop("RP00_witness_object", lambda: isinstance(witness, dict)):
        return [entry.first_code()]
    entry.done()
    gate = sibling("pm-browser-event-admission", root)
    errors = gate.candidate_failures(event, witness.get("producer_component"),
                                     gate.contract_context(), payload_store=payload_store)
    if errors:
        return errors
    schemas = Facts("rs_preflight_schemas", chain=True)
    for row, name, value in (("RP0A_request_schema", "browser_command_request", request),
                             ("RP0B_result_schema", "browser_command_result", result),
                             ("RP0C_transition_schema", "resolved_transition", transition)):
        if schemas.stop(row, lambda: validators(root)[name].is_valid(value)):
            return [schemas.first_code()]
    schemas.done()
    event, _ = body_route.resolved_event(event, payload_store)
    payload = event["payload"]
    context, facts = payload["context"], payload["facts"]
    f = Facts("rs_preflight")
    f["RP01_event_type"] = event["event_type"] == EVENT_TYPE
    for prefix, (n_cmd, n_lin, n_sub, n_opt), command in (("request", ("RP02", "RP04", "RP06", "RP08"), request),
                                                          ("result", ("RP03", "RP05", "RP07", "RP09"), result)):
        scope = command["scope"]
        f[f"{n_cmd}_{prefix}_command"] = scope["command_id"] == "cmd.browser.workspace.reset"
        f[f"{n_lin}_{prefix}_lineage"] = [field for field in LINEAGE if scope["lineage"].get(field) != context.get(field)] == []
        f[f"{n_sub}_{prefix}_subject"] = [field for field in ("browser_session_id", "browser_workspace_id", "session_security_class")
                                          if scope.get(field) != context[field]] == []
        f[f"{n_opt}_{prefix}_optional_subject"] = [field for field, context_field in (
            ("browser_page_id", "browser_page_id"), ("page_generation", "page_generation"),
            ("browser_program_id", "program_id"), ("program_workspace_id", "program_workspace_id"))
            if scope.get(field) != context.get(context_field)] == []
    f["RP10_request_result_scope"] = request["scope"] == result["scope"]
    f["RP11_transition_subject"] = transition["subject"] == {field: context[field] for field in SUBJECT}
    f["RP12_transition_node"] = transition["node_id"] == context["node_id"]
    f["RP13_transition_context"] = transition["context"] == context
    f["RP14_result_instance"] = request["command_instance_id"] == result["command_instance_id"]
    f["RP15_transition_instance"] = result["command_instance_id"] == transition["command_instance_id"]
    f["RP16_event_idempotency"] = request["idempotency_key"] == event["idempotency_key"]
    f["RP17_transition_idempotency"] = event["idempotency_key"] == transition["idempotency_key"]
    f["RP18_result_succeeded"] = result["outcome"] == "succeeded"
    f["RP19_result_reconciled"] = result["effect_state"] == "effects_reconciled"
    f["RP20_revision_join"] = transition["checked_workspace_revision"] == request["scope"].get("expected_workspace_revision")
    f["RP21_controller_join"] = transition["controller_authority"] == request["scope"].get("controller_authority")
    f["RP22_workspace_state_reset"] = facts.get("workspace_state") == "reset"
    f["RP23_prior_generation"] = facts.get("prior_workspace_generation") == transition["prior_workspace_generation"]
    f["RP24_generation"] = facts.get("workspace_generation") == transition["workspace_generation"]
    f["RP25_generation_advances"] = transition["prior_workspace_generation"] < transition["workspace_generation"]
    # Revision is intentionally not compared to generation, nor is +1 assumed.
    for row, name in (("RP26_owner_record_ref", "owner_record_ref"), ("RP27_transition_receipt_ref", "transition_receipt_ref"),
                      ("RP28_permission_snapshot_ref", "permission_snapshot_ref"), ("RP29_capability_snapshot_ref", "capability_snapshot_ref")):
        f[row] = transition[name] == payload[name]
    f["RP30_dispatch_receipt"] = result.get("dispatch_receipt_ref") == transition["transition_receipt_ref"]
    f["RP31_permission_join"] = request["permission_snapshot_ref"] == transition["permission_snapshot_ref"]
    f["RP32_filesafe_join"] = request["filesafe_decision_ref"] == transition["filesafe_decision_ref"]
    f["RP33_workspace_result_ref"] = transition["workspace_ref"] in result["result_refs"]
    for number, name in enumerate(("producer_authenticated", "original_request_resolved", "original_result_resolved",
                                   "transition_receipt_resolved", "permission_valid_at_transition", "filesafe_allowed_at_transition",
                                   "capability_valid_at_transition", "controller_valid_at_transition", "scope_valid_at_transition"), 34):
        f[f"RP{number}_{name}"] = witness.get(name) is True
    return sorted(set(f.codes()))

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

    def reset(self, event, request, result, transition, witness, append_outcome, *, admitted=False, payload_store=None):
        f = Facts("rs_reset", chain=True)
        if f.stop("RO01_admitted", lambda: admitted is True):
            return f.first_code()
        if f.stop("RO02_preflight", lambda: not reset_preflight_failures(event, request, result, transition, witness, payload_store=payload_store)):
            return f.first_code()
        if f.stop("RO02A_producer_jcs", lambda: body_route.producer_jcs_ok(event)):
            return f.first_code()
        if f.stop("RO03_owner_subject", lambda: transition["subject"] == self.subject):
            return f.first_code()
        key = (scope_partition(event["project_id"]), EVENT_TYPE, event["idempotency_key"])
        semantic = self.semantic_digest(event)
        if f.stop("RO04_event_identity", lambda: event["event_id"] not in self.event_ids or self.event_ids[event["event_id"]] == semantic):
            return f.first_code()
        prior = self.committed.get(key) or self.pending.get(key)
        if prior:
            for row, check in (("RO05_prior_digest", lambda: prior["digest"] == semantic),
                               ("RO06_prior_result", lambda: prior["result"] == result),
                               ("RO07_prior_request", lambda: prior["request"] == request),
                               ("RO08_prior_not_pending", lambda: key not in self.pending),
                               ("RO09_result_access", lambda: witness.get("current_result_access") is True)):
                if f.stop(row, check):
                    return f.first_code()
            f.done()
            return "original_result_no_reset"
        for row, check in (("RO10_no_pending_recovery", lambda: not self.pending),
                           ("RO11_revision_resolved", lambda: self.revision is not None),
                           ("RO12_checked_revision", lambda: transition["checked_workspace_revision"] == self.revision),
                           ("RO13_prior_generation", lambda: transition["prior_workspace_generation"] == self.generation),
                           ("RO14_append_outcome", lambda: append_outcome in ("committed", "committed_ack_lost", "failed", "unknown"))):
            if f.stop(row, check):
                return f.first_code()
        f.done()
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
        f = Facts("rs_resolve_append", chain=True)
        entry = self.pending.get(key)
        if f.stop("RX01_pending_entry", lambda: entry is not None):
            return f.first_code()
        if f.stop("RX02_pending_digest", lambda: entry["digest"] == semantic):
            return f.first_code()
        if append_outcome in ("failed", "unknown"):
            f.done()
            return "original_append_pending_no_reset"
        if f.stop("RX03_append_outcome", lambda: append_outcome in ("committed", "committed_ack_lost")):
            return f.first_code()
        f.done()
        self.committed[key] = self.pending.pop(key)
        self.append_count += 1
        if append_outcome == "committed_ack_lost":
            return "reset_event_committed_ack_lost"
        self.publication_count += 1
        return "reset_event_committed_and_published"

def durable_read_token_schema(root=ROOT):
    """SP-278 durable read token (Plans/storage-plan.md, 2026-09-24; DL-076).

    The canonical read_token without its live redb_snapshot_id: the stored form. A read joins
    the snapshot ID of its own live read transaction; no stored value carries one.
    """
    token = copy.deepcopy(load(GENERIC_PATH, root)["$defs"]["read_token"])
    token["required"] = [name for name in token["required"] if name != "redb_snapshot_id"]
    del token["properties"]["redb_snapshot_id"]
    return token


def checkpoint_bundle(root=ROOT):
    """Inline this owner's closed value/history, its durable SP-278 read token and one exact SP-278 value."""
    own, generic = load(CONTRACT_PATH, root), load(GENERIC_PATH, root)
    cp = copy.deepcopy(own["$defs"]["checkpoint"])
    cp["properties"]["index_read_token"] = {"$ref": "#/$defs/durable_read_token"}
    cp["properties"]["source_cursor"] = {"$ref": "#/$defs/generic_source_cursor"}
    cp["$defs"] = {name: copy.deepcopy(own["$defs"][name]) for name in
                   ("timestamp", "non_secret_ref", "checkpoint_core", "retired_generation", "durable_read_token")}
    cp["$defs"].update({
                   "generic_source_cursor": copy.deepcopy(generic["$defs"]["coverage"]["properties"]["last_frame"])})
    core = cp["$defs"]["checkpoint_core"]
    core["properties"]["index_read_token"] = {"$ref": "#/$defs/durable_read_token"}
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
        "replay_behavior": "Explicitly adopt the SP-278 root/generation/anchor/frontier/source/read token and complete global captured range. Verify the exact Project/reset filter and original source bytes. Commit only this checkpoint under exact prior-value/cursor CAS and source/access/deletion fences; recheck before historical disclosure. The stored token is the SP-278 nine-field durable read token; every read joins the snapshot ID of its own live read, and no snapshot ID is stored. No index/global-checkpoint/Browser/Usage/Prompt mutation.",
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
    entry = Facts("rs_binding_entry", chain=True)
    if entry.stop("RB01_event_type", lambda: row.get("event_type") == EVENT_TYPE):
        return [entry.first_code()]
    entry.done()
    expected = expected_binding()
    families = [f for f in load("Plans/storage_value_registry.json", root)["families"] if f["family_id"] == CHECKPOINT_FAMILY]
    f = Facts("rs_binding")
    f["RB02_schema_binding"] = load(CONTRACT_PATH, root)["x-pm-event-authority-binding"] == expected
    f["RB03_durable_token"] = load(CONTRACT_PATH, root)["$defs"].get("durable_read_token") == durable_read_token_schema(root)
    f["RB04_contract_ref"] = row.get("authority_contract_ref") == CONTRACT_PATH + "#/x-pm-event-authority-binding"
    f["RB05_semantic_owner"] = row.get("semantic_owner_ref") == expected["semantic_owner_ref"]
    f["RB06_producer"] = row.get("producer_component") == expected["producer_component"]
    f["RB07_payload_schema"] = row.get("payload_schema_ref") == {"path": "Plans/browser_event_payloads.schema.json", "json_pointer": "#/$defs/workspace_reset", "schema_id": expected["source_payload_schema_id"]}
    f["RB08_consumer_refs"] = {expected["semantic_owner_ref"], expected["storage_owner_ref"], expected["generic_index_owner_ref"]} <= set(row.get("consumer_contract_refs", []))
    f["RB09_source_retention"] = row.get("retention_policy_ref") == {"registry_schema_id": "pm.storage_value_registry.v2", "policy_id": "RP-AUTHORITY-INDEFINITE", "policy_version": VERSION}
    f["RB10_family_unique"] = len(families) == 1
    f["RB11_family_disposition"] = len(families) != 1 or families[0] == expected_storage_family(root)
    return f.codes()

def checkpoint_failures(value, *, root=ROOT):
    shape = Facts("rs_checkpoint_schema", chain=True)
    if shape.stop("RK01_checkpoint_schema", lambda: validators(root)["checkpoint"].is_valid(value)):
        return [shape.first_code()]
    shape.done()
    errors = checkpoint_core_failures(value)
    seen = {value["publication_id"]}
    for retired in value["retired_generations"]:
        core = retired["checkpoint_core"]
        errors.extend(checkpoint_core_failures(core))
        f = Facts("rs_history_entry")
        f["RK02_publication_unique"] = core["publication_id"] not in seen
        f["RK03_publication_not_successor"] = core["publication_id"] != retired["successor_publication_id"]
        f["RK04_history_scope"] = [name for name in ("storage_instance_id", "project_id", "scope_partition") if core[name] != value[name]] == []
        prior_errors = bool(errors) or not (f.values["RK02_publication_unique"] and f.values["RK03_publication_not_successor"] and f.values["RK04_history_scope"])
        f["RK05_withdrawal_before_successor"] = prior_errors or parse_time(core["withdrawn_at_utc"]) <= parse_time(value["published_at_utc"])
        errors.extend(f.codes())
        seen.add(core["publication_id"])
    return sorted(set(errors))

def parse_time(value):
    return datetime.fromisoformat(value.replace("Z", "+00:00"))


def checkpoint_core_failures(value):
    # Called only after the closed schema has validated this current/old core.
    cursor = value["source_cursor"]
    relations = Facts("rs_core_relations")
    relations["RC01_scope_partition"] = value["scope_partition"] == scope_partition(value["project_id"])
    relations["RC02_token_storage"] = value["index_read_token"]["storage_instance_id"] == value["storage_instance_id"]
    relations["RC03_range_order"] = cursor is None or value["first_retained_sequence_id"] <= value["index_through_sequence_id"]
    relations["RC04_cursor_through"] = cursor is None or cursor["last_sequence_id"] == value["index_through_sequence_id"]
    relations["RC05_cursor_offsets"] = cursor is None or cursor["byte_offset"] < cursor["frame_end_offset"]
    storage = Facts("rs_core_storage_uint64")
    storage["RC05A_storage_uint64"] = body_route.storage_uint64_fields_ok(value)
    errors = relations.codes() + storage.codes()
    names = ("updated_at_utc", "withdrawn_at_utc", "published_at_utc")
    grammar = r"\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})"
    times = {}

    def calendar(name):
        if value[name] is None:
            return True
        try:
            times[name] = parse_time(value[name])
        except (ValueError, TypeError):
            return False
        return True

    stamps = Facts("rs_core_times", chain=True)
    for row, check in (("RC06_updated_grammar", lambda: value[names[0]] is None or re.fullmatch(grammar, value[names[0]]) is not None),
                       ("RC07_withdrawn_grammar", lambda: value[names[1]] is None or re.fullmatch(grammar, value[names[1]]) is not None),
                       ("RC08_published_grammar", lambda: value[names[2]] is None or re.fullmatch(grammar, value[names[2]]) is not None),
                       ("RC09_updated_calendar", lambda: calendar(names[0])),
                       ("RC10_withdrawn_calendar", lambda: calendar(names[1])),
                       ("RC11_published_calendar", lambda: calendar(names[2]))):
        if stamps.stop(row, check):
            return errors + [stamps.first_code()]
    stamps.done()
    withdrawn = "withdrawn_at_utc" in times
    order = Facts("rs_core_order")
    order["RC12_withdrawal_order"] = not withdrawn or times["withdrawn_at_utc"] <= times["updated_at_utc"]
    order["RC13_birth_before_update"] = times["published_at_utc"] <= times["updated_at_utc"]
    order["RC14_birth_before_withdrawal"] = not withdrawn or times["published_at_utc"] <= times["withdrawn_at_utc"]
    return errors + order.codes()

def generation_admission_failures(before, after, observation, *, root=ROOT):
    """Check claimed same-key transaction; actual authentication is assumed."""
    transaction = observation.get("generation_transaction")
    key = CHECKPOINT_FAMILY + ".v1:" + after["storage_instance_id"] + ":" + after["scope_partition"]
    f = Facts("rs_generation", chain=True)
    checks = [("RG01_transaction_schema", lambda: validators(root)["generation_transaction"].is_valid(transaction)),
              ("RG02_tx_before", lambda: transaction["before"] == before),
              ("RG03_tx_after", lambda: transaction["after"] == after),
              ("RG04_tx_key", lambda: transaction["checkpoint_key"] == key),
              ("RG05_tx_publication", lambda: transaction["selected_publication_id"] == after["publication_id"]),
              ("RG06_tx_committed_at", lambda: transaction["committed_at_utc"] == after["published_at_utc"])]
    for number, name in enumerate(("generation_transaction_resolved", "coordinator_admitted", "complete_rebuild_verified",
                                   "capacity_reserved", "hold_ref_fence_current"), 7):
        checks.append((f"RG{number:02d}_{name}", lambda name=name: observation.get(name) is True))
    checks += [("RG12_birth_not_withdrawn", lambda: after["state"] != "withdrawn"),
               ("RG13_birth_time", lambda: after["updated_at_utc"] == after["published_at_utc"])]
    for row, check in checks:
        if f.stop(row, check):
            return [f.first_code()]
    if before is None:
        if f.stop("RG14_initial_no_history", lambda: not after["retired_generations"]):
            return [f.first_code()]
        f.done()
        return []
    old_core = {name: copy.deepcopy(value) for name, value in before.items() if name != "retired_generations"}
    if old_core["state"] != "withdrawn":
        old_core.update(state="withdrawn", withdrawn_at_utc=after["published_at_utc"], updated_at_utc=after["published_at_utc"])
    expected = before["retired_generations"] + [{"checkpoint_core": old_core, "successor_publication_id": after["publication_id"]}]
    for row, check in (("RG15_replacement_scope", lambda: [name for name in ("storage_instance_id", "project_id", "scope_partition") if before[name] != after[name]] == []),
                       ("RG16_replacement_publication", lambda: before["publication_id"] != after["publication_id"]),
                       ("RG17_replacement_time", lambda: parse_time(after["published_at_utc"]) >= parse_time(before["updated_at_utc"])),
                       ("RG18_capacity", lambda: len(before["retired_generations"]) < 2),
                       ("RG19_exact_history", lambda: after["retired_generations"] == expected)):
        if f.stop(row, check):
            return [f.first_code()]
    f.done()
    return []

def index_token_failures(token, index, observation, *, root=ROOT):
    """Exact SP-278 decoded-value join beneath an assumed verified native read.

    ``token`` is the stored nine-field durable read token. The live ten-field token joins the
    actual snapshot ID of this read, taken from the observation; no stored value supplies,
    rewrites or manufactures one (DL-076).
    """
    entry = Facts("rs_token_entry", chain=True)
    selected = {}

    def node_present():
        selected["id"] = index["current_generation_id"]
        selected["node"] = index["generations"].get(selected["id"]) if selected["id"] is not None else None
        return selected["node"] is not None

    for row, check in (("RT01_durable_token_schema", lambda: validators(root)["durable_read_token"].is_valid(token)),
                       ("RT02_index_schema", lambda: validators(root)["generic_checkpoint"].is_valid(index)),
                       ("RT03_observation_object", lambda: isinstance(observation, dict)),
                       ("RT04_source_verified", lambda: observation.get("generic_source_verified") is True),
                       ("RT05_live_snapshot", lambda: validators(root)["generic_read_token"].is_valid({**token, "redb_snapshot_id": observation.get("redb_snapshot_id")})),
                       ("RT06_current_node", node_present),
                       ("RT07_node_current", lambda: selected["node"]["state"] == "current"),
                       ("RT08_node_identity", lambda: selected["node"]["generation_id"] == selected["id"]),
                       ("RT09_one_current", lambda: [n for n in index["generations"].values() if n["state"] == "current"] == [selected["node"]])):
        if entry.stop(row, check):
            return [entry.first_code()]
    entry.done()
    node, generation = selected["node"], selected["id"]
    key = "event_record_index_checkpoint.v1:" + index["storage_instance_id"]
    frontier = node["frontier"]
    expected = {"storage_instance_id": index["storage_instance_id"], "checkpoint_key": key,
                "checkpoint_ref": key + "#/generations/" + generation, "generation_id": generation,
                "generation_anchor_sha256": digest(node["anchor"]),
                "frontier_revision": frontier["publication_revision"], "frontier_sha256": digest(frontier),
                "index_dataset_name": "event_record_index.v2@" + generation,
                "source_selection": frontier["source_selection"]}
    joins = Facts("rs_token_joins")
    joins["RT10_token_fields"] = set(token) == set(expected)
    for number, field in enumerate(expected, 11):
        joins[f"RT{number}_{field}"] = token.get(field) == expected[field]
    joins["RT20_node_dataset"] = node["index_dataset_name"] == expected["index_dataset_name"]
    joins["RT21_current_source"] = observation.get("source_selection") == frontier["source_selection"]
    joins["RT22_source_storage"] = frontier["source_selection"]["storage_instance_id"] == index["storage_instance_id"]
    return joins.codes()

class CheckpointOracle:
    """Filtered checkpoint CAS/disclosure model. No native transaction runs."""

    def __init__(self, checkpoint=None):
        self.checkpoint = copy.deepcopy(checkpoint)
        self.commit_count = self.disclosure_count = self.runtime_effect_count = 0

    def advance(self, candidate, index, observation, *, admitted=False, _replacement=False):
        f = Facts("rs_advance", chain=True)
        checks = [("RV01_admitted", lambda: admitted is True),
                  ("RV02_candidate_valid", lambda: not checkpoint_failures(candidate)),
                  ("RV03_stored_valid", lambda: self.checkpoint is None or not checkpoint_failures(self.checkpoint)),
                  ("RV04_candidate_not_withdrawn", lambda: candidate["state"] != "withdrawn"),
                  ("RV05_stored_not_withdrawn", lambda: not (self.checkpoint and self.checkpoint["state"] == "withdrawn" and not _replacement)),
                  ("RV06_index_token", lambda: not index_token_failures(candidate["index_read_token"], index, observation))]
        for number, name in enumerate(("project_filter_complete", "reset_sources_validated", "source_dedupe_verified",
                                       "access_allowed", "deletion_allows_audit", "binding_supported", "before_commit_fence_current"), 7):
            checks.append((f"RV{number:02d}_{name}", lambda name=name: observation.get(name) is True))
        checks.append(("RV14_filter_complete", lambda: bool(candidate["filter_complete"])))
        coverage = {}

        def coverage_field(target, source):
            if "value" not in coverage:
                coverage["value"] = index["generations"][index["current_generation_id"]]["frontier"]["coverage"]
            return candidate[target] == coverage["value"][source]

        for row, target, source in (("RV15_first_retained", "first_retained_sequence_id", "first_retained_sequence_id"),
                                    ("RV16_through", "index_through_sequence_id", "through_sequence_id"),
                                    ("RV17_cursor", "source_cursor", "last_frame"), ("RV18_health", "health", "health")):
            checks.append((row, lambda target=target, source=source: coverage_field(target, source)))
        checks += [("RV19_project", lambda: observation.get("project_id") == candidate["project_id"]),
                   # CAS uses exact prior canonical value bytes supplied by the adapter,
                   # not SP-278's digest codec for this different owner value.
                   ("RV20_prior_cas", lambda: observation.get("prior_checkpoint") == self.checkpoint),
                   ("RV21_generation_admission", lambda: not (self.checkpoint is None or _replacement) or
                    not generation_admission_failures(self.checkpoint, candidate, observation))]
        refresh = self.checkpoint is not None and not _replacement
        for number, field in enumerate(("storage_instance_id", "project_id"), 22):
            checks.append((f"RV{number}_scope_{field}", lambda field=field: not refresh or self.checkpoint[field] == candidate[field]))
        for number, field in enumerate(("publication_id", "published_at_utc", "hold_refs", "retired_generations"), 25):
            checks.append((f"RV{number}_custody_{field}", lambda field=field: not refresh or self.checkpoint[field] == candidate[field]))
        checks += [("RV29_observation_time", lambda: not refresh or parse_time(candidate["updated_at_utc"]) >= parse_time(self.checkpoint["updated_at_utc"])),
                   ("RV30_cursor_not_regressed", lambda: not refresh or not (self.checkpoint["source_cursor"] and (
                       not candidate["source_cursor"] or candidate["source_cursor"]["last_sequence_id"] < self.checkpoint["source_cursor"]["last_sequence_id"])))]
        for row, check in checks:
            if f.stop(row, check):
                return f.first_code()
        f.done()
        partition = Facts("rs_advance_partition", chain=True)
        if partition.stop("RV24_scope_scope_partition", lambda: not refresh or self.checkpoint["scope_partition"] == candidate["scope_partition"]):
            return partition.first_code()
        partition.done()
        self.checkpoint = copy.deepcopy(candidate)
        self.commit_count += 1
        return "checkpoint_committed_no_runtime_effect"

    def replace(self, candidate, index, observation, *, admitted=False):
        return self.advance(candidate, index, observation, admitted=admitted, _replacement=True)

    def cleanup(self, publication_id, at_utc, observation):
        """Model serialized eligible cleanup; hold/ref witnesses are assumptions."""
        before = self.checkpoint
        f = Facts("rs_cleanup", chain=True)
        checks = [("RU01_checkpoint_present", lambda: before is not None),
                  ("RU02_checkpoint_valid", lambda: not checkpoint_failures(before)),
                  ("RU03_prior_cas", lambda: observation.get("prior_checkpoint") == before)]
        for number, name in enumerate(("maintenance_authorized", "all_applicable_holds_resolved", "no_applicable_hold_or_live_ref",
                                       "hold_ref_fence_current", "access_allowed", "deletion_allows_audit"), 4):
            checks.append((f"RU{number:02d}_{name}", lambda name=name: observation.get(name) is True))
        selected = []
        moment = {}

        def one_selected():
            selected.extend(entry for entry in before["retired_generations"] if entry["checkpoint_core"]["publication_id"] == publication_id)
            return len(selected) == 1

        def parsed(name, text):
            try:
                moment[name] = parse_time(text())
            except (ValueError, TypeError, AttributeError):
                return False
            return True

        def comparable():
            try:
                moment["open"] = moment["now"] < moment["anchor"] + timedelta(seconds=604800)
            except TypeError:
                return False
            return True

        checks += [("RU10_retired_selected", one_selected),
                   ("RU11_cleanup_time", lambda: parsed("now", lambda: at_utc)),
                   ("RU12_cleanup_time_zone", lambda: moment["now"].tzinfo is not None),
                   ("RU13_anchor_time", lambda: parsed("anchor", lambda: selected[0]["checkpoint_core"]["withdrawn_at_utc"])),
                   ("RU14_times_comparable", comparable),
                   ("RU15_retention_elapsed", lambda: not moment["open"])]
        for row, check in checks:
            if f.stop(row, check):
                return f.first_code()
        f.done()
        # The complete original current core and every sibling are preserved.
        self.checkpoint = {**copy.deepcopy(before), "retired_generations": [copy.deepcopy(entry)
                            for entry in before["retired_generations"] if entry is not selected[0]]}
        self.commit_count += 1
        return "eligible_retired_generation_removed"

    def disclose(self, index, observation):
        cp = self.checkpoint
        f = Facts("rs_disclose", chain=True)
        # No snapshot ID is stored: the read joins the ID of its own live snapshot to
        # the stored durable token, and all persistent source/publication joins must
        # still match. A read-only reader need not write a checkpoint.
        for row, check in (("RD01_observation_object", lambda: isinstance(observation, dict)),
                           ("RD02_checkpoint_present", lambda: cp is not None),
                           ("RD03_checkpoint_valid", lambda: not checkpoint_failures(cp)),
                           ("RD04_not_withdrawn", lambda: cp["state"] != "withdrawn"),
                           ("RD05_filter_complete", lambda: bool(cp["filter_complete"])),
                           ("RD06_project", lambda: observation.get("project_id") == cp["project_id"]),
                           ("RD07_index_token", lambda: not index_token_failures(cp["index_read_token"], index, observation)),
                           ("RD08_access_allowed", lambda: observation.get("access_allowed") is True),
                           ("RD09_deletion_allows_audit", lambda: observation.get("deletion_allows_audit") is True),
                           ("RD10_disclosure_fence", lambda: observation.get("disclosure_fence_current") is True)):
            if f.stop(row, check):
                return f.first_code()
        f.done()
        self.disclosure_count += 1
        return "historical_reset_fact_no_runtime_authority"

    def withdraw(self, at_utc):
        f = Facts("rs_withdraw", chain=True)
        if f.stop("RW01_checkpoint_present", lambda: self.checkpoint is not None):
            return f.first_code()
        if f.stop("RW02_checkpoint_valid", lambda: not checkpoint_failures(self.checkpoint)):
            return f.first_code()
        if f.stop("RW03_not_withdrawn", lambda: self.checkpoint["state"] != "withdrawn"):
            return f.first_code()
        candidate = {**self.checkpoint, "state": "withdrawn", "updated_at_utc": at_utc, "withdrawn_at_utc": at_utc}
        if f.stop("RW04_candidate_valid", lambda: not checkpoint_failures(candidate)):
            return f.first_code()
        if f.stop("RW05_not_before_observation", lambda: datetime.fromisoformat(at_utc.replace("Z", "+00:00")) >= datetime.fromisoformat(self.checkpoint["updated_at_utc"].replace("Z", "+00:00"))):
            return f.first_code()
        f.done()
        self.checkpoint = candidate
        return "withdrawn_publication_fenced"

def workspace_history_fact(event, subject, *, admitted=False, source_verified=False,
                           access_allowed=False, deletion_allows_audit=False,
                           checkpoint_read_token_valid=False, root=ROOT, payload_store=None, historical_source=None):
    """One bounded synthetic payload join, not whole-range or live authority."""
    refused = {"outcome": "read_unavailable", "fact": None, "current_runtime_authority": False}
    gate = sibling("pm-browser-event-admission", root)
    f = Facts("rs_history", chain=True)
    for row, check in (("RH01_admitted", lambda: admitted is True),
                       ("RH02_source_verified", lambda: source_verified is True),
                       ("RH03_access_allowed", lambda: access_allowed is True),
                       ("RH04_deletion_allows_audit", lambda: deletion_allows_audit is True),
                       ("RH05_read_token_valid", lambda: checkpoint_read_token_valid is True),
                       ("RH06_subject_schema", lambda: validators(root)["subject"].is_valid(subject)),
                       ("RH07_retained_candidate", lambda: not gate.candidate_failures(event, "BrowserRuntimeService.workspace", gate.contract_context(), payload_store=payload_store, historical=True, historical_source=historical_source)),
                       ("RH08_event_type", lambda: event["event_type"] == EVENT_TYPE)):
        if f.stop(row, check):
            return refused
    f.done()
    event, _ = body_route.resolved_event(event, payload_store, historical=True)
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
             "index_dataset_name": node["index_dataset_name"], "source_selection": copy.deepcopy(frontier["source_selection"])}
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
    observation = {"generic_source_verified": True, "redb_snapshot_id": "snapshot:reset-fixture",
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
