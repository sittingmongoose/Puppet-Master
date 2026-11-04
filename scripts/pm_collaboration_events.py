#!/usr/bin/env python3
"""Static collaborative workflow event contract checks, never native authority or admission.

The 18 collaborative workflow families of DL-090 and DL-091 (CW-100 to CW-118, CV-460 to CV-478,
SP-460 to SP-478, ATS-230 to ATS-248; newly authored owner contracts under DL-090). This checker
validates the closed payload schema (both scope editions of every family), the projection and
checkpoint schema and its binding record, the admission ledger and the final registry rows it
prepares, every fixture expectation (payload layers, EventRecord joins, identity vectors, the
transition table through its own reducer, projection values) and the owner units that the ledger
names. It fails when one of the 18 families is in Plans/event_family_registry.json while its
ledger row is prepared_not_admitted, or when an admitted row differs from its prepared row.

A pass is static contract consistency only. It authenticates no producer, reads no seglog or redb
bytes, admits no family, moves no checkpoint and proves nothing native.

Usage: python3 scripts/pm_collaboration_events.py [--self-test] [--json]
"""
from __future__ import annotations

import argparse
import base64
import copy
import datetime as dt
import hashlib
import json
import re
import sys
from functools import lru_cache
from pathlib import Path
from typing import Any

from jsonschema import Draft202012Validator
from referencing import Registry, Resource

ROOT = Path(__file__).resolve().parents[1]
PAYLOAD_PATH = "Plans/collaboration_event_payloads.schema.json"
PROJECTION_PATH = "Plans/collaboration_projection_contracts.schema.json"
LEDGER_PATH = "Plans/collaboration_event_admission.json"
LEDGER_SCHEMA_PATH = "Plans/collaboration_event_admission.schema.json"
FIXTURE_PATH = "Plans/collaboration_event_contract_fixtures.json"
CWC_PATH = "Plans/collaborative_workflows_contracts.schema.json"
INDEX_CHECKPOINT_PATH = "Plans/event_record_index_checkpoint.schema.json"
EVENT_RECORD_PATH = "Plans/event_record.schema.json"
REGISTRY_PATH = "Plans/event_family_registry.json"
REGISTRY_SCHEMA_PATH = "Plans/event_family_registry.schema.json"
COORD_PROJECTION_PATH = "Plans/coordination_projection_contracts.schema.json"
SVR_PATH = "Plans/storage_value_registry.json"
RETENTION_POLICY = "RP-CHAT-THREAD-LIFETIME"

CLAIM_BOUNDARY = (
    "Static schema, ledger, registry-row and synthetic fixture checks only. No family is admitted, no checkpoint or pin "
    "moves, and no native producer, append path, projector, reader, durability, deletion, readiness or seal is proved."
)

# The 18 families in ledger order, with their subject identity components (SP-460 and each family's SP unit).
FAMILIES: list[tuple[str, str, list[str], str]] = [
    ("collaboration.created", "collaboration_created", ["collaboration_id", "definition_revision"], "created_at_utc"),
    ("collaboration.started", "collaboration_started", ["collaboration_run_id", "lifecycle_seq"], "started_at_utc"),
    ("collaboration.paused", "collaboration_paused", ["collaboration_run_id", "lifecycle_seq"], "paused_at_utc"),
    ("collaboration.resumed", "collaboration_resumed", ["collaboration_run_id", "lifecycle_seq"], "resumed_at_utc"),
    ("collaboration.cancelled", "collaboration_cancelled", ["collaboration_run_id", "lifecycle_seq"], "cancelled_at_utc"),
    ("collaboration.completed", "collaboration_completed", ["collaboration_run_id", "lifecycle_seq"], "completed_at_utc"),
    ("collaboration.failed", "collaboration_failed", ["collaboration_run_id", "lifecycle_seq"], "failed_at_utc"),
    ("collaboration.participant_started", "collaboration_participant_started", ["collaboration_run_id", "participant_slot_id", "assignment_revision", "attempt_id"], "started_at_utc"),
    ("collaboration.participant_completed", "collaboration_participant_completed", ["collaboration_run_id", "participant_slot_id", "assignment_revision", "attempt_id"], "finished_at_utc"),
    ("collaboration.message_added", "collaboration_message_added", ["collaboration_run_id", "collaboration_message_id"], "written_at_utc"),
    ("collaboration.artifact_added", "collaboration_artifact_added", ["collaboration_run_id", "artifact_version_ref"], "added_at_utc"),
    ("collaboration.configuration_changed", "collaboration_configuration_changed", ["collaboration_id", "definition_revision"], "changed_at_utc"),
    ("brainstorm.proposal_added", "brainstorm_proposal_added", ["collaboration_run_id", "proposal_id"], "added_at_utc"),
    ("brainstorm.vote_added", "brainstorm_vote_added", ["collaboration_run_id", "vote_id"], "cast_at_utc"),
    ("brainstorm.plan_synthesized", "brainstorm_plan_synthesized", ["collaboration_run_id"], "synthesized_at_utc"),
    ("review.finding_added", "review_finding_added", ["collaboration_run_id", "finding_id"], "added_at_utc"),
    ("review.finding_dispositioned", "review_finding_dispositioned", ["collaboration_run_id", "finding_id"], "dispositioned_at_utc"),
    ("review.artifact_finalized", "review_artifact_finalized", ["collaboration_run_id"], "finalized_at_utc"),
]
EVENT_TYPES = [f[0] for f in FAMILIES]
TOKEN = {f[0]: f[1] for f in FAMILIES}
SUBJECT = {f[0]: f[2] for f in FAMILIES}
FAMILY_TS = {f[0]: f[3] for f in FAMILIES}
UNITS = {et: {"cw": f"CW-{101 + i}", "cv": f"CV-{461 + i}", "sp": f"SP-{461 + i}", "ats": f"ATS-{231 + i}"} for i, et in enumerate(EVENT_TYPES)}
SHARED_UNITS = {"cw": "CW-100", "cv": "CV-460", "sp": "SP-460", "ats": "ATS-230"}
UNIT_DOC = {"cw": "Plans/Collaborative_Workflows.md", "cv": "Plans/Contracts_V0.md", "sp": "Plans/storage-plan.md", "ats": "Plans/Automated_Testing_System.md"}
KIND_ONLY = {"brainstorm.proposal_added": "brainstorm", "brainstorm.vote_added": "brainstorm", "brainstorm.plan_synthesized": "brainstorm",
             "review.finding_added": "review", "review.finding_dispositioned": "review", "review.artifact_finalized": "review"}
ATTEMPT_FAMILIES = {"collaboration.participant_started", "collaboration.participant_completed"}


# --- loading and canonical forms ----------------------------------------------------------------------------

def load(path: str, root: Path = ROOT) -> Any:
    return json.loads((root / path).read_text(encoding="utf-8"))


def canonical(value: Any) -> str:
    """The DL-077 canonical JSON: keys sorted, ',' and ':' separators, ensure_ascii=False."""
    return json.dumps(value, sort_keys=True, separators=(",", ":"), ensure_ascii=False)


def row_sha256(value: Any) -> str:
    return hashlib.sha256(canonical(value).encode("utf-8")).hexdigest()


def jcs(value: Any) -> str:
    """RFC 8785 for the arrays of strings and nulls the identity recipes hash."""
    return json.dumps(value, separators=(",", ":"), ensure_ascii=False)


def sha(text: str) -> str:
    return hashlib.sha256(text.encode("utf-8")).hexdigest()


def hexs(text: str) -> str:
    return text.encode("utf-8").hex()


def b64url(text: str) -> str:
    return base64.urlsafe_b64encode(text.encode("utf-8")).decode("ascii").rstrip("=")


# --- identity recipe (SP-460, CV-366) -----------------------------------------------------------------------

def scope_partition(payload: dict[str, Any]) -> str:
    """Storage's scope_partition: app, or project~{base64url_no_pad(UTF8(project_id))}."""
    return "app" if payload["scope_kind"] == "application" else "project~" + b64url(payload["project_id"])


def subject_values(event_type: str, payload: dict[str, Any]) -> list[str | None]:
    return [None if payload.get(c) is None else str(payload[c]) for c in SUBJECT[event_type]]


def owner_operation_id(event_type: str, payload: dict[str, Any], recovery_epoch: int) -> str:
    return "collabop_" + sha(jcs([event_type, scope_partition(payload)] + subject_values(event_type, payload) + [str(recovery_epoch)]))


def idempotency_key(event_type: str, payload: dict[str, Any], recovery_epoch: int) -> str:
    op = owner_operation_id(event_type, payload, recovery_epoch)
    if payload["scope_kind"] == "application":
        return "application@1:" + hexs(payload["server_id"]) + ":" + hexs(op)
    return "collaboration@1:" + op


def event_id(event_type: str, payload: dict[str, Any], storage_instance_id: str, recovery_epoch: int) -> str:
    return "evt_collaboration_" + sha(jcs([storage_instance_id, str(recovery_epoch), scope_partition(payload), event_type] + subject_values(event_type, payload)))


def producer_digest(payload: dict[str, Any]) -> str:
    return sha(canonical(payload))


def valid_utc(value: Any) -> bool:
    if not isinstance(value, str) or not value.endswith("Z"):
        return False
    try:
        dt.datetime.fromisoformat(value[:-1] + "+00:00")
    except ValueError:
        return False
    return True


# --- schema validation --------------------------------------------------------------------------------------

def schema_registry(root: Path = ROOT) -> Registry:
    documents = [load(p, root) for p in (PAYLOAD_PATH, PROJECTION_PATH, CWC_PATH, INDEX_CHECKPOINT_PATH, EVENT_RECORD_PATH, REGISTRY_SCHEMA_PATH, LEDGER_SCHEMA_PATH)]
    return Registry().with_resources([(d["$id"], Resource.from_contents(d)) for d in documents]).crawl()


@lru_cache(maxsize=256)
def validator(document_uri: str, pointer: str, root: Path = ROOT) -> Draft202012Validator:
    schema = {"$schema": "https://json-schema.org/draft/2020-12/schema", "$ref": f"{document_uri}{pointer}"}
    return Draft202012Validator(schema, registry=schema_registry(root))


def payload_def(event_type: str, edition: str) -> str:
    return TOKEN[event_type] + ("" if edition == "project" else "_application")


def edition_of(payload: dict[str, Any]) -> str:
    return "application" if payload.get("scope_kind") == "application" else "project"


def payload_rejection(event_type: str, payload: Any, recovery_epoch: int, root: Path = ROOT) -> str | None:
    """First failing layer of CV-460 for one payload: schema, then the static rules in their order."""
    uri = load(PAYLOAD_PATH, root)["$id"]
    if not isinstance(payload, dict) or not validator(uri, "#/$defs/" + payload_def(event_type, edition_of(payload)), root).is_valid(payload):
        return "schema"
    if not valid_utc(payload[FAMILY_TS[event_type]]):
        return "valid_utc_datetime"
    if payload["idempotency_key"] != idempotency_key(event_type, payload, recovery_epoch):
        return "identity_recipe"
    if event_type == "collaboration.configuration_changed" and payload["previous_definition_revision"] != payload["definition_revision"] - 1:
        return "revision_rule"
    if event_type == "review.artifact_finalized" and payload["completed_reviewer_count"] + payload["failed_reviewer_count"] != payload["requested_reviewer_count"]:
        return "review_counts"
    return None


def null_admitting_nodes(node: Any, path: str = "#") -> list[str]:
    out = []
    if isinstance(node, dict):
        t = node.get("type")
        if t == "null" or (isinstance(t, list) and "null" in t) or node.get("const", 0) is None:
            out.append(path)
        for k, v in node.items():
            out.extend(null_admitting_nodes(v, f"{path}/{k}"))
    elif isinstance(node, list):
        for i, v in enumerate(node):
            out.extend(null_admitting_nodes(v, f"{path}/{i}"))
    return out


def payload_schema_failures(root: Path = ROOT) -> list[dict[str, Any]]:
    fails: list[dict[str, Any]] = []
    schema = load(PAYLOAD_PATH, root)
    cwc = load(CWC_PATH, root)["$defs"]
    defs = schema["$defs"]
    expected = {"identifier", "non_secret_ref", "utc_timestamp", "sha256_hex", "reconfigure_change_kind"}
    for et in EVENT_TYPES:
        expected |= {payload_def(et, "project"), payload_def(et, "application")}
    if set(defs) != expected:
        fails.append({"check": "payload_defs", "missing": sorted(expected - set(defs)), "extra": sorted(set(defs) - expected)})
    for et in EVENT_TYPES:
        for edition in ("project", "application"):
            name = payload_def(et, edition)
            d = defs.get(name)
            if not d:
                continue
            sid = f"pm.collaboration_event.{TOKEN[et]}.v1" if edition == "project" else f"pm.collaboration_event.{TOKEN[et]}.application.v1"
            if d.get("$id") != sid:
                fails.append({"check": "payload_schema_id", "def": name, "found": d.get("$id")})
            if d.get("additionalProperties") is not False or d.get("type") != "object":
                fails.append({"check": "payload_closed", "def": name})
            props = d.get("properties", {})
            if set(d.get("required", [])) - set(props):
                fails.append({"check": "required_without_property", "def": name})
            nulls = null_admitting_nodes(d)
            allowed = {"#/properties/project_id"} if edition == "application" else set()
            if set(nulls) != allowed:
                fails.append({"check": "null_admitted", "def": name, "nodes": nulls})
            if FAMILY_TS[et] not in d.get("required", []):
                fails.append({"check": "family_timestamp_required", "def": name})
            for c in SUBJECT[et]:
                if c not in props:
                    fails.append({"check": "subject_field_missing", "def": name, "field": c})
            if et in KIND_ONLY and props.get("kind") != {"const": KIND_ONLY[et]}:
                fails.append({"check": "kind_constant", "def": name})
    kinds = sorted(o["properties"]["change_kind"]["const"] for o in cwc["reconfigure_change"]["oneOf"])
    if sorted(defs["reconfigure_change_kind"]["enum"]) != kinds:
        fails.append({"check": "reconfigure_change_kind_copy", "found": defs["reconfigure_change_kind"]["enum"], "owner": kinds})
    errors = set(cwc["collaboration_error"]["enum"]) - {"cancelled"}
    for name in (payload_def("collaboration.failed", "project"), payload_def("collaboration.participant_completed", "project")):
        field = "failure_reason" if "failed" in name else "outcome_reason"
        if set(defs[name]["properties"][field]["enum"]) != errors:
            fails.append({"check": "reason_enum_is_section_11_without_cancelled", "def": name})
    states = set(cwc["run_state"]["enum"])
    for name, d in defs.items():
        for field in ("state_before", "state_after"):
            if field in d.get("properties", {}) and not set(d["properties"][field]["enum"]) <= states:
                fails.append({"check": "state_subset_of_run_state", "def": name, "field": field})
    return fails


def projection_schema_failures(root: Path = ROOT) -> list[dict[str, Any]]:
    fails: list[dict[str, Any]] = []
    p = load(PROJECTION_PATH, root)
    coord = load(COORD_PROJECTION_PATH, root)
    token = copy.deepcopy(p["$defs"]["durable_read_token"])
    token.pop("description", None)
    ctoken = copy.deepcopy(coord["$defs"]["durable_read_token"])
    ctoken.pop("description", None)
    if token != ctoken:
        fails.append({"check": "durable_read_token_copy_differs_from_coordination"})
    def stored_names(node):
        if isinstance(node, dict):
            for k, v in node.items():
                if k == "properties" and isinstance(v, dict) and "redb_snapshot_id" in v:
                    yield True
                yield from stored_names(v)
        elif isinstance(node, list):
            for v in node:
                yield from stored_names(v)
    if any(stored_names(p["$defs"])):
        fails.append({"check": "redb_snapshot_id_storable"})
    idx = load(INDEX_CHECKPOINT_PATH, root)["$defs"]["read_token"]
    if set(idx.get("required", [])) - {"redb_snapshot_id"} != set(token.get("required", [])):
        fails.append({"check": "durable_token_not_nine_field_projection"})
    enum = p["$defs"]["checkpoint"]["properties"]["admitted_event_types"]["items"]["enum"]
    if sorted(enum) != sorted(EVENT_TYPES):
        fails.append({"check": "checkpoint_admitted_types"})
    b = p.get("x-pm-event-authority-binding", {})
    if [f["event_type"] for f in b.get("families", [])] != EVENT_TYPES:
        fails.append({"check": "binding_families"})
    for f in b.get("families", []):
        u = UNITS[f["event_type"]]
        if (f["semantic_unit"], f["payload_unit"], f["storage_unit"], f["oracle_unit"]) != (u["cw"], u["cv"], u["sp"], u["ats"]):
            fails.append({"check": "binding_units", "event_type": f["event_type"]})
    for name, d in p["$defs"].items():
        if d.get("type") == "object" and d.get("additionalProperties") is not False and name not in ("durable_read_token",):
            fails.append({"check": "projection_closed", "def": name})
    if b.get("checkpoint", {}).get("adopts") != "SP-278" or b.get("first_receipt_resolver") != "storage.first_append_receipt.resolve.v2":
        fails.append({"check": "binding_adoptions"})
    return fails


# --- owner units --------------------------------------------------------------------------------------------

@lru_cache(maxsize=16)
def doc_units(path: str, root: Path = ROOT) -> frozenset[str]:
    text = (root / path).read_text(encoding="utf-8")
    return frozenset(re.findall(r"^plan_unit_id:\s*([A-Z0-9]+-\d+)\s*$", text, flags=re.M))


def unit_text(path: str, unit: str, root: Path = ROOT) -> str:
    text = (root / path).read_text(encoding="utf-8")
    m = re.search(rf"^### {re.escape(unit)} - .*?(?=^### |\Z)", text, flags=re.M | re.S)
    return m.group(0) if m else ""


def owner_unit_failures(root: Path = ROOT) -> list[dict[str, Any]]:
    fails = []
    for key, path in UNIT_DOC.items():
        units = doc_units(path, root)
        wanted = [SHARED_UNITS[key]] + [UNITS[et][key] for et in EVENT_TYPES]
        for u in wanted:
            if u not in units:
                fails.append({"check": "owner_unit_missing", "doc": path, "unit": u})
    for et in EVENT_TYPES:
        for key in ("cw", "cv", "sp", "ats"):
            if et not in unit_text(UNIT_DOC[key], UNITS[et][key], root):
                fails.append({"check": "owner_unit_does_not_name_family", "unit": UNITS[et][key], "event_type": et})
    cw13 = (root / UNIT_DOC["cw"]).read_text(encoding="utf-8").split("## 13. Events", 1)[-1].split("## 14.", 1)[0]
    for et in EVENT_TYPES:
        if et not in cw13:
            fails.append({"check": "section_13_name_missing", "event_type": et})
    return fails


# --- registry rows and ledger -------------------------------------------------------------------------------

def ledger_failures(root: Path = ROOT) -> list[dict[str, Any]]:
    fails: list[dict[str, Any]] = []
    ledger = load(LEDGER_PATH, root)
    fixtures = load(FIXTURE_PATH, root)
    lv = validator(load(LEDGER_SCHEMA_PATH, root)["$id"], "", root)
    for e in lv.iter_errors(ledger):
        fails.append({"check": "ledger_schema", "error": e.message[:200]})
    rv = validator(load(REGISTRY_SCHEMA_PATH, root)["$id"], "#/$defs/family", root)
    payload = load(PAYLOAD_PATH, root)
    case_ids = set()
    for group in ("payloads", "invalid_payloads", "valid_events", "invalid_events", "identity_vectors", "transition_sequences", "projection_values", "invalid_projection_values"):
        case_ids |= {c["case_id"] for c in fixtures[group]}
    case_ids |= {o["oracle_id"] for o in fixtures["required_native_oracles"]}
    rows = ledger.get("rows", [])
    if [r.get("event_type") for r in rows] != EVENT_TYPES:
        fails.append({"check": "ledger_order"})
    for i, r in enumerate(rows):
        et = r["event_type"]
        row = r["registry_row"]
        for e in rv.iter_errors(row):
            fails.append({"check": "registry_row_schema", "event_type": et, "error": e.message[:200]})
        if row_sha256(row) != r["registry_row_sha256"]:
            fails.append({"check": "registry_row_sha256", "event_type": et})
        if row.get("event_type") != et or row.get("family_id") != r["family_id"] or row["family_id"] != "event-family-" + et.replace(".", "-").replace("_", "-"):
            fails.append({"check": "row_identity", "event_type": et})
        u = UNITS[et]
        if row.get("semantic_owner_doc") != f"{UNIT_DOC['cw']}#{u['cw']}" or row.get("payload_owner_doc") != f"{UNIT_DOC['cv']}#{u['cv']}":
            fails.append({"check": "owner_anchors", "event_type": et})
        refs = [row["payload_schema_ref"]] + [pv["payload_schema_ref"] for pv in row.get("payload_versions", [])]
        for ref in refs:
            d = payload["$defs"].get(ref["json_pointer"].split("/")[-1])
            if ref["path"] != PAYLOAD_PATH or not d or d.get("$id") != ref["schema_id"]:
                fails.append({"check": "payload_schema_ref_resolves", "event_type": et, "ref": ref})
        kinds = [pv["scope_kind"] for pv in row.get("payload_versions", [])]
        if row.get("scope_policy") != "application_or_project" or kinds != ["project", "application"]:
            fails.append({"check": "scope_editions", "event_type": et})
        for pv in row.get("payload_versions", []):
            want = "existing_project_policy" if pv["scope_kind"] == "project" else "requires_owner_adoption"
            if pv["producer_admission"] != want:
                fails.append({"check": "producer_admission", "event_type": et, "scope_kind": pv["scope_kind"]})
            if pv["retention_policy_ref"] != row["retention_policy_ref"]:
                fails.append({"check": "edition_retention_differs", "event_type": et})
        if row.get("retention_policy_ref", {}).get("policy_id") != RETENTION_POLICY:
            fails.append({"check": "retention_policy_ref", "event_type": et})
        if row.get("legacy", {}).get("aliases") != []:
            fails.append({"check": "no_alias", "event_type": et})
        if f"{LEDGER_PATH}#/rows/{i}" not in row.get("source_refs", []):
            fails.append({"check": "row_source_ref_to_ledger", "event_type": et})
        missing = [c for c in r["validation_case_ids"] if c not in case_ids]
        if missing:
            fails.append({"check": "validation_case_ids_unknown", "event_type": et, "missing": missing[:5]})
        if r["admission_status"] == "admitted_static_contract" and not r.get("authority_contract_ref"):
            fails.append({"check": "admitted_without_authority_ref", "event_type": et})
    return fails


def registry_membership_failures(root: Path = ROOT, registry: dict[str, Any] | None = None) -> tuple[list[dict[str, Any]], list[str]]:
    registry = registry if registry is not None else load(REGISTRY_PATH, root)
    ledger = {r["event_type"]: r for r in load(LEDGER_PATH, root)["rows"]}
    fails, admitted = [], []
    for row in registry["families"]:
        et = row.get("event_type")
        if et not in ledger:
            continue
        lr = ledger[et]
        if lr["admission_status"] != "admitted_static_contract":
            fails.append({"check": "prepared_family_in_registry", "event_type": et})
        elif canonical(row) != canonical(lr["registry_row"]):
            fails.append({"check": "admitted_row_differs_from_prepared", "event_type": et})
        else:
            admitted.append(et)
    for et, lr in ledger.items():
        if lr["admission_status"] == "admitted_static_contract" and et not in admitted and not any(f.get("event_type") == et for f in fails):
            fails.append({"check": "admitted_ledger_row_missing_from_registry", "event_type": et})
    return fails, admitted


def retention_blockers(root: Path = ROOT) -> list[str]:
    svr = load(SVR_PATH, root)
    policies = {p["policy_id"]: p for p in svr.get("retention_policies", [])}
    p = policies.get(RETENTION_POLICY)
    if not p:
        return [f"{RETENTION_POLICY}@1.0.0 is not in {SVR_PATH}: every prepared row waits for the Storage retention landing (DL-092)"]
    want = {"retention_mode": "indefinite", "anchor_kind": "explicit_delete", "max_cardinality": 250000, "cardinality_scope": "thread", "overflow_action": "roll_successor", "hold_eligible": True, "policy_version": "1.0.0"}
    bad = {k: p.get(k) for k, v in want.items() if p.get(k) != v}
    return [f"{RETENTION_POLICY} values differ from DL-092's Chat content class: {bad}"] if bad else []


# --- EventRecord joins --------------------------------------------------------------------------------------

def envelope_rejection(event_type: str, record: dict[str, Any], storage_instance_id: str, recovery_epoch: int, root: Path = ROOT) -> str | None:
    """First failing EventRecord join of CV-460 rule 7, in the order the fixtures name them."""
    if not validator(load(EVENT_RECORD_PATH, root)["$id"], "", root).is_valid(record):
        return "event_record_schema"
    p = record["payload"]
    if record["scope_kind"] != p.get("scope_kind"):
        return "scope_kind"
    if record["payload_ref"] is not None:
        return "payload_ref"
    if record["redaction_profile"] != "no_secrets":
        return "redaction_profile"
    if record["replay_policy"] != "dedupe_by_idempotency_key":
        return "replay_policy"
    if record["node_id"] is not None:
        return "node_join"
    want_attempt = p.get("attempt_id") if event_type in ATTEMPT_FAMILIES else None
    if record["attempt_id"] != want_attempt:
        return "attempt_join"
    if (record["project_id"], record["thread_id"], record["run_id"], record["idempotency_key"]) != (p.get("project_id"), p.get("thread_id"), p.get("collaboration_run_id"), p.get("idempotency_key")):
        return "payload_envelope_identity"
    sid = f"pm.collaboration_event.{TOKEN[event_type]}." + ("v1" if p["scope_kind"] == "project" else "application.v1")
    if record["payload_schema_id"] != sid:
        return "payload_schema_id"
    if record["occurred_at_utc"] != p.get(FAMILY_TS[event_type]):
        return "occurred_at_join"
    if record["event_id"] != event_id(event_type, p, storage_instance_id, recovery_epoch):
        return "identity_recipe"
    if payload_rejection(event_type, p, recovery_epoch, root):
        return "payload"
    return None


# --- transition reducer (SP-460 and each family's SP unit) ---------------------------------------------------

class Reducer:
    def __init__(self, admitted: list[str], storage_instance_id: str, recovery_epoch: int):
        self.admitted = set(admitted)
        self.siid = storage_instance_id
        self.epoch = recovery_epoch
        self.dedupe: dict[tuple[str, str, str], str] = {}
        self.defs: dict[tuple[str, str], dict[str, Any]] = {}
        self.runs: dict[tuple[str, str], dict[str, Any]] = {}

    def apply(self, et: str, p: dict[str, Any], epoch: int | None = None) -> str:
        sp = scope_partition(p)
        key = (sp, et, p["idempotency_key"])
        digest = producer_digest(p)
        if key in self.dedupe:
            return "exact_retry" if self.dedupe[key] == digest else "idempotency_conflict"
        if et not in self.admitted:
            return "quarantined"
        result = self.rules(et, p, sp)
        if result == "appended":
            self.dedupe[key] = digest
        return result

    # The checks in the order each family's SP unit states them.
    def rules(self, et: str, p: dict[str, Any], sp: str) -> str:
        coll = (sp, p["collaboration_id"])
        rkey = (sp, p["collaboration_run_id"])
        if et == "collaboration.created":
            if coll in self.defs:
                return "conflict:already_created"
            self.defs[coll] = {"latest": 1, "revs": {1}, "kind": p["kind"], "thread": p["thread_id"]}
            return "appended"
        if et == "collaboration.configuration_changed":
            d = self.defs.get(coll)
            if d is None:
                return "conflict:definition_not_recorded"
            if (d["kind"], d["thread"]) != (p["kind"], p["thread_id"]):
                return "conflict:lineage_mismatch"
            run = self.runs.get(rkey)
            if p["change_source"] == "start_commit":
                if run is not None:
                    return "conflict:already_started"
                if d["latest"] != p["previous_definition_revision"]:
                    return "conflict:stale_definition_revision"
            else:
                if run is None:
                    return "conflict:run_not_started"
                if (run["thread"], run["kind"], run["coll"]) != (p["thread_id"], p["kind"], p["collaboration_id"]):
                    return "conflict:lineage_mismatch"
                if run["status"] in ("completed", "cancelled", "failed"):
                    return "conflict:already_terminal"
                if run["def_rev"] != p["previous_definition_revision"] or d["latest"] != p["previous_definition_revision"]:
                    return "conflict:stale_definition_revision"
            d["latest"] = p["definition_revision"]
            d["revs"].add(p["definition_revision"])
            if run is not None and p["change_source"] == "reconfigure":
                run["def_rev"] = p["definition_revision"]
                ck = set(p["change_kinds"])
                if "add_participant" in ck:
                    for s in p["affected_slot_ids"]:
                        if s not in run["roster"]:
                            run["roster"].append(s)
                if "remove_participant" in ck:
                    run["removed"] |= set(p["affected_slot_ids"])
                if "waive_participant" in ck:
                    run["waivers"] |= set(p["affected_slot_ids"])
                if p["accept_stale_target"]:
                    run["stale_accepted"] = True
            return "appended"
        if et == "collaboration.started":
            if rkey in self.runs:
                return "conflict:already_started"
            d = self.defs.get(coll)
            if d is None or p["definition_revision"] not in d["revs"]:
                return "conflict:definition_not_recorded"
            if (d["kind"], d["thread"]) != (p["kind"], p["thread_id"]):
                return "conflict:lineage_mismatch"
            self.runs[rkey] = {"status": "active", "seq": 1, "def_rev": p["definition_revision"], "kind": p["kind"], "thread": p["thread_id"],
                               "coll": p["collaboration_id"], "roster": list(p["participant_slot_ids"]), "removed": set(), "waivers": set(),
                               "target_hashes": list(p.get("target_hashes", [])), "slots": {}, "attempts": {}, "last_msg": 0, "msgs": set(),
                               "artifacts": set(), "proposals": {}, "votes": {}, "synthesized": False, "findings": {}, "finalized": None,
                               "stale_accepted": False}
            return "appended"
        run = self.runs.get(rkey)
        if run is None:
            return "conflict:run_not_started"
        if (run["thread"], run["kind"], run["coll"]) != (p["thread_id"], p["kind"], p["collaboration_id"]):
            return "conflict:lineage_mismatch"
        if run["status"] in ("completed", "cancelled", "failed"):
            return "conflict:already_terminal"
        if p["definition_revision"] != run["def_rev"]:
            return "conflict:stale_definition_revision"
        short = et.split(".", 1)[1]
        handler = getattr(self, "r_" + short)
        return handler(run, p)

    def slot(self, run, slot_id):
        return run["slots"].setdefault(slot_id, {"current_rev": 1, "current_attempt": None, "latest_outcome": None, "no_attempt": {}, "role": None})

    def lifecycle(self, run, p, allowed):
        if run["status"] not in allowed:
            return "conflict:run_state_invalid"
        if p["lifecycle_seq"] != run["seq"] + 1:
            return "conflict:stale_lifecycle_seq"
        return None

    def open_attempts(self, run):
        return any(a["outcome"] is None for a in run["attempts"].values())

    def r_paused(self, run, p):
        c = self.lifecycle(run, p, ("active",))
        if c:
            return c
        run["status"], run["seq"] = "paused", p["lifecycle_seq"]
        return "appended"

    def r_resumed(self, run, p):
        c = self.lifecycle(run, p, ("paused",))
        if c:
            return c
        run["status"], run["seq"] = "active", p["lifecycle_seq"]
        return "appended"

    def r_cancelled(self, run, p):
        c = self.lifecycle(run, p, ("active", "paused"))
        if c:
            return c
        if self.open_attempts(run):
            return "conflict:open_attempts"
        run["status"], run["seq"] = "cancelled", p["lifecycle_seq"]
        return "appended"

    def r_failed(self, run, p):
        c = self.lifecycle(run, p, ("active", "paused"))
        if c:
            return c
        if self.open_attempts(run):
            return "conflict:open_attempts"
        run["status"], run["seq"] = "failed", p["lifecycle_seq"]
        return "appended"

    def r_completed(self, run, p):
        allowed = ("active", "paused") if p["completion_trigger"] == "chat_room_end" else ("active",)
        c = self.lifecycle(run, p, allowed)
        if c:
            return c
        if self.open_attempts(run):
            return "conflict:open_attempts"
        for s in p["required_slot_ids"]:
            if self.slot(run, s)["latest_outcome"] not in ("completed", "explicitly_waived"):
                return "conflict:unresolved_required_slots"
        if (run["kind"] == "brainstorm" and not run["synthesized"]) or (run["kind"] == "review" and run["finalized"] is None):
            return "conflict:missing_output"
        run["status"], run["seq"] = "completed", p["lifecycle_seq"]
        return "appended"

    def r_participant_started(self, run, p):
        if run["status"] != "active":
            return "conflict:run_state_invalid"
        s = p["participant_slot_id"]
        if s not in run["roster"] or s in run["removed"]:
            return "conflict:slot_not_in_roster"
        if p["attempt_id"] in run["attempts"]:
            return "conflict:attempt_already_started"
        st = self.slot(run, s)
        if p["assignment_revision"] < st["current_rev"]:
            return "conflict:stale_assignment_revision"
        run["attempts"][p["attempt_id"]] = {"slot": s, "rev": p["assignment_revision"], "outcome": None, "role": p["additive_role_kind"]}
        st.update(current_rev=p["assignment_revision"], current_attempt=p["attempt_id"], role=p["additive_role_kind"])
        self.recount(run)
        return "appended"

    def r_participant_completed(self, run, p):
        s = p["participant_slot_id"]
        a = p.get("attempt_id")
        if a is not None:
            att = run["attempts"].get(a)
            if att is None or att["slot"] != s or att["rev"] != p["assignment_revision"]:
                return "conflict:unknown_attempt"
            if att["outcome"] is not None:
                return "conflict:attempt_already_closed"
        else:
            if s not in run["roster"]:
                return "conflict:slot_not_in_roster"
            if p["assignment_revision"] in self.slot(run, s)["no_attempt"]:
                return "conflict:attempt_already_closed"
        if p["outcome"] == "explicitly_waived" and s not in run["waivers"]:
            return "conflict:waiver_not_recorded"
        if a is not None:
            run["attempts"][a]["outcome"] = p["outcome"]
        else:
            self.slot(run, s)["no_attempt"][p["assignment_revision"]] = p["outcome"]
        self.slot(run, s)["latest_outcome"] = p["outcome"]
        self.recount(run)
        return "appended"

    def r_message_added(self, run, p):
        if p["collaboration_message_id"] in run["msgs"]:
            return "conflict:message_already_written"
        if p["sequence"] != run["last_msg"] + 1:
            return "conflict:sequence_gap"
        if p["sender_kind"] == "participant":
            if p["sender_id"] not in run["roster"]:
                return "conflict:slot_not_in_roster"
            a = p.get("attempt_id")
            if a is not None and (a not in run["attempts"] or run["attempts"][a]["slot"] != p["sender_id"]):
                return "conflict:unknown_attempt"
        run["msgs"].add(p["collaboration_message_id"])
        run["last_msg"] = p["sequence"]
        return "appended"

    def r_artifact_added(self, run, p):
        if p["artifact_version_ref"] in run["artifacts"]:
            return "conflict:artifact_already_added"
        run["artifacts"].add(p["artifact_version_ref"])
        return "appended"

    def r_proposal_added(self, run, p):
        if run["status"] != "active":
            return "conflict:run_state_invalid"
        att = run["attempts"].get(p["attempt_id"])
        if att is None or att["slot"] != p["participant_slot_id"]:
            return "conflict:unknown_attempt"
        if att["role"] != "none":
            return "conflict:not_core_participant"
        if p["proposal_id"] in run["proposals"]:
            return "conflict:proposal_already_added"
        run["proposals"][p["proposal_id"]] = {"support": 0, "oppose": 0, "abstain": 0}
        return "appended"

    def r_vote_added(self, run, p):
        if run["status"] != "active":
            return "conflict:run_state_invalid"
        if p["proposal_id"] not in run["proposals"]:
            return "conflict:unknown_proposal"
        att = run["attempts"].get(p["attempt_id"])
        if att is None or att["slot"] != p["participant_slot_id"]:
            return "conflict:unknown_attempt"
        if att["role"] == "wonderer":
            return "conflict:wonderer_cannot_vote"
        st = self.slot(run, p["participant_slot_id"])
        if st["current_attempt"] != p["attempt_id"] or att["outcome"] not in (None, "completed"):
            return "conflict:attempt_not_current"
        if p["vote_id"] in run["votes"]:
            return "conflict:vote_already_added"
        run["votes"][p["vote_id"]] = {"proposal": p["proposal_id"], "slot": p["participant_slot_id"], "attempt": p["attempt_id"], "position": p["position"]}
        self.recount(run)
        return "appended"

    def recount(self, run):
        for t in run["proposals"].values():
            t.update(support=0, oppose=0, abstain=0)
        for v in run["votes"].values():
            att = run["attempts"][v["attempt"]]
            if self.slot(run, v["slot"])["current_attempt"] == v["attempt"] and att["outcome"] in (None, "completed"):
                run["proposals"][v["proposal"]][v["position"]] += 1

    def r_plan_synthesized(self, run, p):
        if run["status"] != "active":
            return "conflict:run_state_invalid"
        if run["synthesized"]:
            return "conflict:already_synthesized"
        run["synthesized"] = True
        return "appended"

    def r_finding_added(self, run, p):
        if run["status"] != "active":
            return "conflict:run_state_invalid"
        if p["target_hashes"] != run["target_hashes"]:
            return "conflict:target_hash_mismatch"
        if any(r not in run["roster"] for r in p["originating_reviewer_ids"]):
            return "conflict:slot_not_in_roster"
        if p["finding_id"] in run["findings"]:
            return "conflict:finding_already_added"
        run["findings"][p["finding_id"]] = {"disposition": None, "target_hashes": p["target_hashes"]}
        return "appended"

    def r_finding_dispositioned(self, run, p):
        if run["status"] != "active":
            return "conflict:run_state_invalid"
        f = run["findings"].get(p["finding_id"])
        if f is None:
            return "conflict:unknown_finding"
        if f["disposition"] is not None:
            return "conflict:already_dispositioned"
        if p["target_hashes"] != f["target_hashes"]:
            return "conflict:target_hash_mismatch"
        f["disposition"] = p["disposition"]
        return "appended"

    def r_artifact_finalized(self, run, p):
        if run["status"] != "active":
            return "conflict:run_state_invalid"
        if run["finalized"] is not None:
            return "conflict:already_finalized"
        if any(f["disposition"] is None for f in run["findings"].values()):
            return "conflict:findings_not_dispositioned"
        if p["artifact_version_ref"] not in run["artifacts"]:
            return "conflict:artifact_not_added"
        if p["target_hashes"] != run["target_hashes"]:
            return "conflict:target_hash_mismatch"
        if p["completed_reviewer_count"] < p["requested_reviewer_count"] and (not p["partial_coverage_accepted"] or not run["waivers"]):
            return "conflict:partial_not_accepted"
        if p["stale_target_accepted"] and not run["stale_accepted"]:
            return "conflict:stale_not_accepted"
        run["finalized"] = p["artifact_version_ref"]
        return "appended"

    def final_state(self, sp: str, run_id: str) -> dict[str, Any]:
        run = self.runs[(sp, run_id)]
        return {
            "lifecycle_status": run["status"], "lifecycle_seq": run["seq"], "last_message_sequence": run["last_msg"],
            "artifact_count": len(run["artifacts"]), "finalized_artifact_version_ref": run["finalized"],
            "waived_slot_ids": sorted(s for s, st in run["slots"].items() if st["latest_outcome"] == "explicitly_waived"),
            "proposal_tallies": {k: dict(v) for k, v in run["proposals"].items()},
            "findings": {k: v["disposition"] for k, v in run["findings"].items()},
        }


# --- fixture report -----------------------------------------------------------------------------------------

def fixture_report(root: Path = ROOT, fixtures: dict[str, Any] | None = None) -> dict[str, Any]:
    fx = fixtures if fixtures is not None else load(FIXTURE_PATH, root)
    ctx = fx["storage_context"]
    siid, epoch = ctx["storage_instance_id"], ctx["recovery_epoch"]
    fails: list[dict[str, Any]] = []
    per = {et: {"positive": 0, "negative": 0, "valid_events": set(), "joins": set(), "vectors": 0, "sequences_appended": 0, "sequences_refused": 0} for et in EVENT_TYPES}
    payload_by_id = {}
    for c in fx["payloads"]:
        payload_by_id[c["case_id"]] = c["payload"]
        r = payload_rejection(c["event_type"], c["payload"], epoch, root)
        if r is not None or edition_of(c["payload"]) != c["edition"]:
            fails.append({"check": "positive_payload", "case_id": c["case_id"], "layer": r})
        per[c["event_type"]]["positive"] += 1
    for c in fx["invalid_payloads"]:
        r = payload_rejection(c["event_type"], c["payload"], epoch, root)
        if r != c["first_failing_layer"]:
            fails.append({"check": "negative_payload_layer", "case_id": c["case_id"], "expected": c["first_failing_layer"], "found": r})
        per[c["event_type"]]["negative"] += 1
    for c in fx["valid_events"]:
        r = envelope_rejection(c["event_type"], c["record"], siid, epoch, root)
        if r is not None or c["record"]["payload"] != payload_by_id.get(c["payload_case_id"]):
            fails.append({"check": "valid_event", "case_id": c["case_id"], "found": r})
        per[c["event_type"]]["valid_events"].add(c["record"]["scope_kind"])
    for c in fx["invalid_events"]:
        r = envelope_rejection(c["event_type"], c["record"], siid, epoch, root)
        if r != c["join"]:
            fails.append({"check": "invalid_event_join", "case_id": c["case_id"], "expected": c["join"], "found": r})
        per[c["event_type"]]["joins"].add(c["join"])
    for v in fx["identity_vectors"]:
        et = v["event_type"]
        p = dict(v["subject"], scope_kind="application" if v["edition"] == "application" else "project")
        if v["edition"] == "application":
            p["server_id"] = v["server_id"]
        else:
            p["project_id"] = base64.urlsafe_b64decode(v["scope_partition"].split("~", 1)[1] + "==").decode("utf-8")
        got = {"owner_operation_id": owner_operation_id(et, p, v["recovery_epoch"]), "idempotency_key": idempotency_key(et, p, v["recovery_epoch"]),
               "event_id": event_id(et, p, v["storage_instance_id"], v["recovery_epoch"])}
        if got != v["expected"] or scope_partition(p) != v["scope_partition"]:
            fails.append({"check": "identity_vector", "case_id": v["case_id"]})
        if "prior_epoch_idempotency_key" in v and v["prior_epoch_idempotency_key"] == got["idempotency_key"]:
            fails.append({"check": "new_epoch_reuses_key", "case_id": v["case_id"]})
        per[et]["vectors"] += 1
    for s in fx["transition_sequences"]:
        red = Reducer(s["admitted_event_types"], s["storage_instance_id"], s["recovery_epoch"])
        last = None
        for i, st in enumerate(s["steps"]):
            ep = st.get("recovery_epoch", s["recovery_epoch"])
            if payload_rejection(st["event_type"], st["payload"], ep, root) is not None:
                fails.append({"check": "sequence_payload_invalid", "case_id": s["case_id"], "step": i})
                continue
            got = red.apply(st["event_type"], st["payload"], ep)
            if got != st["expected"]:
                fails.append({"check": "transition", "case_id": s["case_id"], "step": i, "event_type": st["event_type"], "expected": st["expected"], "found": got})
            if got == "appended":
                per[st["event_type"]]["sequences_appended"] += 1
                last = st["payload"]
            elif got.startswith("conflict:") or got in ("idempotency_conflict", "quarantined"):
                per[st["event_type"]]["sequences_refused"] += 1
        if s.get("final_state") and last is not None:
            fs = red.final_state(scope_partition(last), last["collaboration_run_id"])
            for k, v in s["final_state"].items():
                if fs.get(k) != v:
                    fails.append({"check": "final_state", "case_id": s["case_id"], "key": k, "expected": v, "found": fs.get(k)})
    puri = load(PROJECTION_PATH, root)["$id"]
    for c in fx["projection_values"]:
        if not validator(puri, "#/$defs/" + c["definition"], root).is_valid(c["value"]):
            fails.append({"check": "projection_value", "case_id": c["case_id"]})
    for c in fx["invalid_projection_values"]:
        if validator(puri, "#/$defs/" + c["definition"], root).is_valid(c["value"]):
            fails.append({"check": "invalid_projection_value_accepted", "case_id": c["case_id"]})
    for et, c in per.items():
        if c["positive"] < 3 or c["negative"] < 7 or c["valid_events"] != {"project", "application"} or len(c["joins"]) < 4 or c["vectors"] < 3 or c["sequences_appended"] < 1 or c["sequences_refused"] < 1:
            fails.append({"check": "family_case_floor", "event_type": et, "counts": {k: (sorted(v) if isinstance(v, set) else v) for k, v in c.items()}})
    for o in fx["required_native_oracles"]:
        if o["status"] != "NOT_RUN":
            fails.append({"check": "native_status", "oracle_id": o["oracle_id"]})
    counts = {k: len(fx[k]) for k in ("payloads", "invalid_payloads", "valid_events", "invalid_events", "identity_vectors", "transition_sequences", "projection_values", "invalid_projection_values", "required_native_oracles")}
    counts["sequence_steps"] = sum(len(s["steps"]) for s in fx["transition_sequences"])
    return {"failures": fails, "counts": counts}


def ats_failures(root: Path = ROOT) -> list[dict[str, Any]]:
    fails = []
    ledger = load(LEDGER_PATH, root)
    for r in ledger["rows"]:
        text = unit_text(UNIT_DOC["ats"], UNITS[r["event_type"]]["ats"], root)
        missing = [c for c in r["validation_case_ids"] if f"`{c}`" not in text]
        if missing:
            fails.append({"check": "ats_case_ids", "event_type": r["event_type"], "missing": missing[:6], "count": len(missing)})
    return fails


def validate(root: Path = ROOT) -> dict[str, Any]:
    failures: list[dict[str, Any]] = []
    failures += payload_schema_failures(root)
    failures += projection_schema_failures(root)
    failures += owner_unit_failures(root)
    failures += ledger_failures(root)
    member, admitted = registry_membership_failures(root)
    failures += member
    fr = fixture_report(root)
    failures += fr["failures"]
    failures += ats_failures(root)
    return {
        "schema_id": "pm.collaboration_event_static_report.v1",
        "status": "pass" if not failures else "fail",
        "claim_boundary": CLAIM_BOUNDARY,
        "families": len(EVENT_TYPES),
        "admitted_families": admitted,
        "prepared_rows": len(load(LEDGER_PATH, root)["rows"]),
        "counts": fr["counts"],
        "admission_blockers": retention_blockers(root),
        "native_obligations": "NOT_RUN",
        "failures": failures,
    }


# --- self-test ----------------------------------------------------------------------------------------------

def self_test(root: Path = ROOT) -> dict[str, Any]:
    """Each scenario plants one defect in an in-memory copy and requires the checker to report it."""
    results = {}
    fx = load(FIXTURE_PATH, root)

    def expect_fail(name, mutate, check):
        f = copy.deepcopy(fx)
        mutate(f)
        rep = fixture_report(root, f)
        results[name] = any(x["check"] == check for x in rep["failures"])

    expect_fail("positive_payload_with_text_field", lambda f: f["payloads"][0]["payload"].__setitem__("name", "text"), "positive_payload")
    expect_fail("negative_payload_accepted", lambda f: f["invalid_payloads"].__setitem__(0, dict(f["invalid_payloads"][0], payload=f["payloads"][0]["payload"])), "negative_payload_layer")
    expect_fail("transition_expectation_flipped", lambda f: f["transition_sequences"][0]["steps"][1].__setitem__("expected", "conflict:already_started"), "transition")
    expect_fail("identity_vector_tampered", lambda f: f["identity_vectors"][0]["expected"].__setitem__("event_id", "evt_collaboration_" + "0" * 64), "identity_vector")
    expect_fail("envelope_join_misnamed", lambda f: f["invalid_events"][0].__setitem__("join", "replay_policy"), "invalid_event_join")
    expect_fail("projection_redb_snapshot_accepted", lambda f: f["projection_values"][0]["value"]["index_read_token"].__setitem__("redb_snapshot_id", 1), "projection_value")
    expect_fail("native_marked_passed", lambda f: f["required_native_oracles"][0].__setitem__("status", "PASS"), "native_status")
    reg = load(REGISTRY_PATH, root)
    ledger = load(LEDGER_PATH, root)
    planted = copy.deepcopy(reg)
    planted["families"].append(ledger["rows"][0]["registry_row"])
    fails, _ = registry_membership_failures(root, planted)
    results["prepared_row_in_registry_refused"] = any(x["check"] == "prepared_family_in_registry" for x in fails)
    red = Reducer(EVENT_TYPES, fx["storage_context"]["storage_instance_id"], fx["storage_context"]["recovery_epoch"])
    first = fx["transition_sequences"][0]["steps"]
    red.apply(first[0]["event_type"], first[0]["payload"])
    results["reducer_exact_retry"] = red.apply(first[0]["event_type"], first[0]["payload"]) == "exact_retry"
    return {"status": "pass" if all(results.values()) else "fail", "scenarios": results}


def main(argv: list[str] | None = None) -> int:
    ap = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    ap.add_argument("--self-test", action="store_true")
    ap.add_argument("--json", action="store_true", help="print the full report")
    a = ap.parse_args(argv)
    rep = self_test() if a.self_test else validate()
    if a.json or a.self_test:
        print(json.dumps(rep, indent=2, sort_keys=True))
    else:
        print(json.dumps({k: rep[k] for k in ("status", "families", "prepared_rows", "admitted_families", "counts", "admission_blockers")} | {"failure_count": len(rep["failures"]), "first_failures": rep["failures"][:10]}, indent=2, sort_keys=True))
    return 0 if rep["status"] == "pass" else 1


if __name__ == "__main__":
    sys.exit(main())
