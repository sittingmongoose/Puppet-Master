#!/usr/bin/env python3
"""Static collaborative workflow event contract checks, never native authority or admission.

The 18 collaborative workflow families of DL-090 and DL-091 (CWR-105 to CWR-123, CV-460 to CV-478,
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
import ast
import types
from urllib.parse import urljoin
from blake3 import blake3
import base64
import copy
import datetime as dt
import hashlib
import math
import msgpack
import importlib.util
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
SOURCE_PATH = "Plans/collaboration_prepared_sources.schema.json"
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
UNITS = {et: {"cw": f"CWR-{106 + i}", "cv": f"CV-{461 + i}", "sp": f"SP-{461 + i}", "ats": f"ATS-{231 + i}"} for i, et in enumerate(EVENT_TYPES)}
SHARED_UNITS = {"cw": "CWR-105", "cv": "CV-460", "sp": "SP-460", "ats": "ATS-230"}
UNIT_DOC = {"cw": "Plans/Collaborative_Workflows.md", "cv": "Plans/Contracts_V0.md", "sp": "Plans/storage-plan.md", "ats": "Plans/Automated_Testing_System.md"}
KIND_ONLY = {"brainstorm.proposal_added": "brainstorm", "brainstorm.vote_added": "brainstorm", "brainstorm.plan_synthesized": "brainstorm",
             "review.finding_added": "review", "review.finding_dispositioned": "review", "review.artifact_finalized": "review"}
ATTEMPT_FAMILIES = {"collaboration.participant_started", "collaboration.participant_completed"}


# --- loading and canonical forms ----------------------------------------------------------------------------

@lru_cache(maxsize=64)
def load(path: str, root: Path = ROOT) -> Any:
    return json.loads((root / path).read_text(encoding="utf-8"))


def canonical(value: Any) -> str:
    """DL-077 JSON plus one numerical representation for each admitted mathematical value.

    Exact integers stay arbitrary precision. Finite integral binary64 values become
    integers (including negative zero); other finite floats use Python's unique
    shortest round-trip decimal. No source field is rounded or narrowed.
    """
    def normalize(node):
        if isinstance(node, float):
            if not math.isfinite(node):
                raise ValueError("nonfinite JSON number")
            return int(node) if node.is_integer() else node
        if isinstance(node, dict):
            return {key: normalize(child) for key, child in node.items()}
        if isinstance(node, list):
            return [normalize(child) for child in node]
        return node
    return json.dumps(normalize(value), sort_keys=True, separators=(",", ":"), ensure_ascii=False, allow_nan=False)


def row_sha256(value: Any) -> str:
    return hashlib.sha256(canonical(value).encode("utf-8")).hexdigest()


def jcs(value: Any) -> str:
    """RFC 8785 for the arrays of strings and nulls the identity recipes hash."""
    return json.dumps(value, separators=(",", ":"), ensure_ascii=False, allow_nan=False)


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
    return [None if payload.get(c) is None else (canonical(payload[c]) if isinstance(payload[c], (int, float)) else str(payload[c])) for c in SUBJECT[event_type]]


def owner_operation_id(event_type: str, payload: dict[str, Any], recovery_epoch: int) -> str:
    return "collabop_" + sha(jcs([event_type, scope_partition(payload)] + subject_values(event_type, payload) + [canonical(recovery_epoch)]))


def idempotency_key(event_type: str, payload: dict[str, Any], recovery_epoch: int) -> str:
    op = owner_operation_id(event_type, payload, recovery_epoch)
    if payload["scope_kind"] == "application":
        return "application@1:" + hexs(payload["server_id"]) + ":" + hexs(op)
    return "collaboration@1:" + op


def event_id(event_type: str, payload: dict[str, Any], storage_instance_id: str, recovery_epoch: int) -> str:
    return "evt_collaboration_" + sha(jcs([storage_instance_id, canonical(recovery_epoch), scope_partition(payload), event_type] + subject_values(event_type, payload)))


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

@lru_cache(maxsize=8)
def schema_uri_paths(root=ROOT):
    paths={}
    for file in (root/"Plans").glob("*.schema.json"):
        document=json.loads(file.read_text(encoding="utf-8"))
        if isinstance(document,dict) and "$id" in document:
            paths[document["$id"]]="Plans/"+file.name
            paths["https://puppetmaster.local/Plans/"+file.name]="Plans/"+file.name
    return paths


@lru_cache(maxsize=8)
def schema_registry(root: Path = ROOT) -> Registry:
    documents = [load(p, root) for p in (PAYLOAD_PATH, PROJECTION_PATH, SOURCE_PATH, CWC_PATH, INDEX_CHECKPOINT_PATH, EVENT_RECORD_PATH, REGISTRY_SCHEMA_PATH, LEDGER_SCHEMA_PATH, "Plans/application_workflow_contracts.schema.json", "Plans/shared_integration_runtime.schema.json")]
    resources = [(d["$id"], Resource.from_contents(d)) for d in documents]
    shared = load("Plans/shared_integration_runtime.schema.json", root)
    resources.append(("https://puppetmaster.local/Plans/shared_integration_runtime.schema.json", Resource.from_contents(shared)))
    def retrieve(uri):
        path=schema_uri_paths(root).get(uri)
        if path is None:raise ValueError("Unregistered local schema URI: "+uri)
        return Resource.from_contents(load(path,root))
    return Registry(retrieve=retrieve).with_resources(resources).crawl()


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
    # Only the explicitly authored lexical strengthening is permitted; no ignored constraint domain.
    def hardened(node, field=""):
        node=copy.deepcopy(node)
        if isinstance(node,dict):
            if "pattern" in node and node["pattern"].endswith("$"):
                node["pattern"]+=r"(?![\s\S])"
            if field.endswith("sha256"):
                node.update(minLength=64,maxLength=64)
            if field=="generation_id":node.update(minLength=68,maxLength=68)
            if field=="storage_instance_id":
                node.update(pattern=r"^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$(?![\s\S])",minLength=36,maxLength=36)
            if field in ("checkpoint_key","index_dataset_name","checkpoint_ref"):
                node["pattern"]=r"^\S+$(?![\s\S])"
            for key,value in list(node.items()):
                if key=="properties":node[key]={name:hardened(child,name) for name,child in value.items()}
                elif isinstance(value,(dict,list)):node[key]=hardened(value)
        elif isinstance(node,list):node=[hardened(child) for child in node]
        return node
    if token != hardened(ctoken):
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
        token=TOKEN[f["event_type"]]
        sources=load(SOURCE_PATH,root)
        if f.get("prepared_source_family_id")!="collaboration_prepared_source" or f.get("prepared_source_schema_ref")!=SOURCE_PATH+"#/$defs/"+token or f.get("source_owner_schemas")!={edition:sources["$defs"][token+"_"+edition]["properties"]["owner_record"]["$ref"] for edition in ("project","application")}:
            fails.append({"check":"binding_source","event_type":f["event_type"]})
    for name, d in p["$defs"].items():
        if d.get("type") == "object" and d.get("additionalProperties") is not False and name not in ("durable_read_token",):
            fails.append({"check": "projection_closed", "def": name})
    if b.get("checkpoint", {}).get("adopts") != "SP-278" or b.get("first_receipt_resolver") != "storage.first_append_receipt.resolve.v2":
        fails.append({"check": "binding_adoptions"})
    return fails


# --- owner units --------------------------------------------------------------------------------------------

@lru_cache(maxsize=16)
def doc_units(path: str, root: Path = ROOT) -> frozenset[str]:
    text = read_owner(path,root)
    return frozenset(re.findall(r"^plan_unit_id:\s*([A-Z0-9]+-\d+)\s*$", text, flags=re.M))


def unit_text(path: str, unit: str, root: Path = ROOT) -> str:
    text = read_owner(path,root)
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
    cw13 = read_owner(UNIT_DOC["cw"],root).split("## 13. Events", 1)[-1].split("## 14.", 1)[0]
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


def retention_rejection(policy):
    if policy is None:
        return "retention_missing"
    if policy is not None:
        want={"retention_mode":"indefinite","anchor_kind":"explicit_delete","max_cardinality":250000,"cardinality_scope":"thread","overflow_action":"roll_successor","hold_eligible":True,"policy_version":"1.0.0"}
        if any(policy.get(k)!=v for k,v in want.items()):
            return "retention_values"
    return None


def retention_blockers(root=ROOT):
    policy=next((p for p in load(SVR_PATH,root).get("retention_policies",[]) if p["policy_id"]==RETENTION_POLICY),None)
    reason=retention_rejection(policy)
    if reason=="retention_missing":return [f"{RETENTION_POLICY}@1.0.0 is not in {SVR_PATH}: every prepared row waits for the Storage retention landing (DL-092)"]
    if reason:return [f"{RETENTION_POLICY} values differ from DL-092's Chat content class: {reason}"]
    return []


# --- EventRecord joins --------------------------------------------------------------------------------------

def envelope_rejection(event_type: str, record: dict[str, Any], storage_instance_id: str, recovery_epoch: int, root: Path = ROOT, payload_store: dict[str, str] | None = None, current_writer: bool = True) -> str | None:
    """First failing EventRecord join of CV-460 rule 7, in the order the fixtures name them."""
    if not validator(load(EVENT_RECORD_PATH, root)["$id"], "", root).is_valid(record):
        return "event_record_schema"
    if record["event_type"] != event_type:
        return "event_type"
    p, error = resolved_payload(record, payload_store)
    if error:
        return error
    if record["scope_kind"] != p.get("scope_kind") or record["project_id"] != p.get("project_id"):
        return "scope_kind"
    if record["redaction_profile"] != "no_secrets":
        return "redaction_profile"
    if current_writer and record["replay_policy"] != "dedupe_by_idempotency_key":
        return "replay_policy"
    if record["node_id"] is not None:
        return "node_join"
    want_attempt = p.get("attempt_id") if event_type in ATTEMPT_FAMILIES else None
    if record["attempt_id"] != want_attempt:
        return "attempt_join"
    if (record["thread_id"], record["run_id"], record["idempotency_key"]) != (p.get("thread_id"), p.get("collaboration_run_id"), p.get("idempotency_key")):
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


def representation_rejection(record):
    if record["payload_ref"] is None and len(canonical(record["payload"]).encode("utf-8")) > 16384:
        return "inline_limit"
    if record["payload_ref"] is not None and record["payload"] != {}:
        return "reference_inline_body"
    return None


def reference_rejection(ref, body):
    valid_format = re.fullmatch(r"payload:blake3:[0-9a-f]{64}:[1-9][0-9]*:application/json", ref) is not None
    if not valid_format:
        return "reference_format"
    if body is None:
        return "reference_missing"
    if body is not None and valid_format:
        raw=body.encode("utf-8");parts=ref.split(":")
        if str(len(raw))!=parts[3]:
            return "reference_size"
        if blake3(raw).hexdigest()!=parts[2]:
            return "reference_hash"
        try: p=json.loads(body)
        except (ValueError,TypeError): p=None
        valid_json=isinstance(p,dict)
        if not valid_json:
            return "reference_json"
        if valid_json and canonical(p)!=body:
            return "reference_canonical"
    return None


def resolved_payload(record, payload_store=None):
    """SP-337 resolution follows the read-only representation and byte-admission decisions."""
    error=representation_rejection(record)
    if error:return None,error
    ref=record["payload_ref"]
    if ref is None:return record["payload"],None
    body=(payload_store or {}).get(ref)
    error=reference_rejection(ref,body)
    if error:return None,error
    return json.loads(body),None


def payload_reference(p):
    body = canonical(p)
    return f"payload:blake3:{blake3(body.encode()).hexdigest()}:{len(body.encode())}:application/json", body


def reference_failures(root=ROOT):
    """Resolve every reference, including optional/conditional schema paths never used by positives."""
    registry = schema_registry(root)
    failures = []
    visited=set()
    def walk(node, resolver, path):
        if isinstance(node,(dict,list)):
            if id(node) in visited:return
            visited.add(id(node))
        if isinstance(node, dict):
            if "$id" in node:
                resolver = resolver.in_subresource(Resource.from_contents(node, default_specification=__import__('referencing.jsonschema', fromlist=['DRAFT202012']).DRAFT202012))
            if "$ref" in node:
                try:
                    resolved=resolver.lookup(node["$ref"])
                except Exception as e:
                    failures.append({"check": "unresolved_ref", "path": path, "ref": node["$ref"], "error": type(e).__name__})
                else:
                    walk(resolved.contents,resolved.resolver,path+"->"+node["$ref"])
            for k, v in node.items():
                walk(v, resolver, path + "/" + k)
        elif isinstance(node, list):
            for i, v in enumerate(node):
                walk(v, resolver, path + "/" + str(i))
    for path in (PAYLOAD_PATH, PROJECTION_PATH, SOURCE_PATH, LEDGER_SCHEMA_PATH):
        document = load(path, root)
        Draft202012Validator.check_schema(document)
        walk(document, registry.resolver(document["$id"]), path)
    return failures


def checkpoint_rejection(value, context, root=ROOT):
    uri = load(PROJECTION_PATH, root)["$id"]
    if not validator(uri, "#/$defs/checkpoint", root).is_valid(value):
        return "checkpoint_schema"
    token = value["index_read_token"]
    actual=context["storage_instance_id"]
    if any(v!=actual for v in (value["storage_instance_id"],token["storage_instance_id"],token["source_selection"]["storage_instance_id"],context["index_read_token"]["storage_instance_id"],context["index_read_token"]["source_selection"]["storage_instance_id"])):
        return "checkpoint_instance"
    if value["scope_partition"] != scope_partition(value):
        return "checkpoint_partition"
    def without_instance(t):
        t=copy.deepcopy(t);t.pop("storage_instance_id");t["source_selection"].pop("storage_instance_id");return t
    if without_instance(token) != without_instance(context["index_read_token"]):
        return "checkpoint_token"
    if value["admitted_event_types"] != context["admitted_event_types"]:
        return "checkpoint_admitted"
    cursor = value["source_cursor"]
    if (value["first_retained_sequence_id"], value["index_through_sequence_id"]) != (context["first_retained_sequence_id"], context["index_through_sequence_id"]) or (cursor is not None and cursor["last_sequence_id"] != value["index_through_sequence_id"]):
        return "checkpoint_coverage"
    if cursor is not None:
        event = context["last_event"]
        if cursor != context["source_cursor"] or cursor["segment_generation"] != token["source_selection"]["selected_segment_generation"] or cursor["frame_end_offset"] <= cursor["byte_offset"] or cursor["last_event_id"] != event["event_id"] or cursor["last_sequence_id"] != event["sequence_id"]:
            return "checkpoint_cursor"
        if event["scope_kind"] != value["scope_kind"] or event["project_id"] != value["project_id"] or envelope_rejection(event["event_type"], event, actual, token["source_selection"]["recovery_epoch"], root, context.get("payload_store"), current_writer=False):
            return "checkpoint_event"
    elif cursor != context["source_cursor"]:
        return "checkpoint_cursor"
    return None


def historical_rejection(event_type, record, context, root=ROOT):
    # Historical validation uses the captured write epoch, never the current live run/definition.
    if context["withdrawn"]:
        return "historical_withdrawn"
    if not context["retained"]:
        return "historical_not_retained"
    if record != context["original_record"]:
        return "historical_forged"
    return envelope_rejection(event_type, record, context["storage_instance_id"], context["write_epoch"], root, context.get("payload_store"), current_writer=False)


def source_storage_key(value):
    return "collaboration_prepared_source.v1:"+hexs(value["storage_instance_id"])+":"+canonical(value["recovery_epoch"])+":"+value["scope_partition"]+":"+hexs(value["event_type"])+":"+hexs(value["owner_operation_id"])


def source_rejection(value, root=ROOT, physical_key=None, source_context=None):
    schema = load(SOURCE_PATH, root)
    et = value.get("event_type")
    if et not in EVENT_TYPES or not validator(schema["$id"], "#/$defs/" + TOKEN[et], root).is_valid(value):
        return "source_schema"
    p = value["semantic_body"]
    if source_context is None:
        return "source_context_missing"
    if source_context is not None:
        if value["storage_instance_id"]!=source_context["storage_instance_id"]:
            return "source_instance"
        if value["recovery_epoch"]!=source_context["write_epoch"]:
            return "source_epoch"
    if physical_key!=source_storage_key(value):
        return "source_key"
    if value["scope_partition"] != scope_partition(p):
        return "source_partition"
    if value["owner_operation_id"] != owner_operation_id(et, p, value["recovery_epoch"]):
        return "source_operation"
    if value["event_id"] != event_id(et, p, value["storage_instance_id"], value["recovery_epoch"]):
        return "source_event_id"
    if value["semantic_sha256"] != producer_digest(p):
        return "source_digest"
    if value["owner_record_sha256"] != row_sha256(value["owner_record"]) or (source_context is not None and source_context.get("owner_record_sha256")!=row_sha256(value["owner_record"])):
        return "source_record_digest"
    if value["owner_record_ref"] != source_record_ref(et, p) or (source_context is not None and value["owner_record_ref"] != source_context["owner_record_ref"]):
        return "source_record_ref"
    # The immutable source snapshot joins owner identities and currentness; storage metadata is excluded.
    record = value["owner_record"]
    joins = {"collaboration_id": "collaboration_id", "collaboration_run_id": "collaboration_run_id", "thread_id": "thread_id", "project_id": "project_id", "kind": "kind", "proposal_id": "proposal_id", "vote_id": "vote_id", "finding_id": "finding_id", "collaboration_message_id": "collaboration_message_id", "participant_slot_id": "participant_slot_id", "run_id": "collaboration_run_id", "slot_id": "participant_slot_id", "review_run_id":"collaboration_run_id", "definition_revision":"definition_revision", "revision":"definition_revision", "sequence":"sequence", "sender_kind":"sender_kind", "sender_id":"sender_id", "recipient_ids":"recipient_ids", "body_ref":"body_ref", "attachment_refs":"attachment_refs", "position":"position", "severity":"severity", "disposition":"disposition", "requested_effective_snapshot_ref":"requested_effective_snapshot_ref", "outcome":"outcome", "proposal_round":"proposal_round", "confidence":"confidence", "message_type":"message_type", "reply_to":"reply_to"}
    binding={k:p[k] for k in ["scope_kind","project_id","thread_id","collaboration_id","collaboration_run_id","definition_revision","kind"]+(["server_id"] if p["scope_kind"]=="application" else [])}
    binding["event_type"]=et;binding["subject"]=subject_values(et,p);binding["family_timestamp"]=p[FAMILY_TS[et]]
    same_fields=(set(record)&set(p))-{"assistant_plan_id","plan_version","goal_id","parent_run_id","attempt_id"}
    if (source_context is not None and source_context.get("binding")!=binding) or any(record[field]!=p[field] for field in same_fields) or any(field in record and target in p and record[field]!=p[target] for field,target in joins.items()):
        return "source_record_identity"
    expected_state={"collaboration.started":"running","collaboration.paused":"paused","collaboration.resumed":"running","collaboration.cancelled":"cancelled","collaboration.completed":"completed","collaboration.failed":"failed"}.get(et)
    if (et=="collaboration.started" and record.get("created_at")!=p["started_at_utc"]) or (et=="collaboration.message_added" and record.get("created_at")!=p["written_at_utc"]) or (expected_state is not None and record.get("state")!=expected_state) or (expected_state in ("cancelled","completed","failed") and record.get("completed_at")!=p[FAMILY_TS[et]]):
        return "source_record_state"
    if source_context is not None and value["envelope_metadata"]!=source_context.get("envelope_metadata"):
        return "source_envelope_metadata"
    if et=="collaboration.completed" and source_context is not None and p["output_refs"]!=source_context.get("output_refs"):
        return "source_output_refs"
    if et=="collaboration.participant_completed" and record["attempt_id"]!=p.get("attempt_id"):
        return "source_attempt"
    if et=="collaboration.participant_completed" and p["outcome"]=="explicitly_waived":
        waiver=record["waiver"]
        if waiver["currentness_hash"]!=p["waiver_currentness_hash"] or (source_context is not None and (waiver["actor_identity"]!=source_context.get("waiver_actor_identity") or p["waiver_actor_ref"]!=source_context.get("waiver_actor_ref"))):
            return "source_waiver"
    if "participant_id" in record:
        identity=value["participant_identity"]
        if identity["participant_slot_id"]!=p["participant_slot_id"] or identity["participant_id"]!=record["participant_id"] or (source_context is not None and identity!=source_context.get("participant_identity")):
            return "source_participant_identity"
    if et=="collaboration.started" and p["kind"]=="review":
        pack=value["review_target_pack"]
        if pack["review_run_id"]!=p["collaboration_run_id"] or pack["target_hashes"]!=p["target_hashes"] or (source_context is not None and pack!=source_context.get("review_target_pack")):
            return "source_review_pack"
    if "application_context" in record:
        ac = record["application_context"]
        if ac["storage_instance_id"] != value["storage_instance_id"] or ac["scope"]["server_id"] != p["server_id"]:
            return "source_application_context"
    if (source_context is not None and {s["slot_id"] for s in value["slot_requirements"] if s["required"]} != set(source_context["required_slot_ids"])) or (et in ("collaboration.created", "collaboration.configuration_changed", "collaboration.completed") and set(p["required_slot_ids"]) != {s["slot_id"] for s in value["slot_requirements"] if s["required"]}):
        return "source_required_slots"
    if source_context is not None and p["currentness_hash"] != source_context.get("currentness_hash"):
        return "source_currentness"
    slot_ids=[s["slot_id"] for s in value["slot_requirements"]]
    record_slots=[s["participant_slot_id"] for s in record.get("participant_specs",[])]
    if len(slot_ids)!=len(set(slot_ids)) or len(record_slots)!=len(set(record_slots)) or (source_context is not None and sorted(slot_ids)!=sorted(source_context["participant_slot_ids"])) or ("participant_specs" in record and sorted(slot_ids)!=sorted(record_slots)):
        return "source_slot_roster"
    if payload_rejection(et, p, value["recovery_epoch"], root):
        return "source_payload"
    return None


def prepared_event_rejection(source_case, record, root=ROOT, payload_store=None):
    value=source_case["value"];et=value["event_type"]
    error=source_rejection(value,root,source_case["physical_key"],source_case["source_context"])
    if error:return error
    error=envelope_rejection(et,record,value["storage_instance_id"],value["recovery_epoch"],root,payload_store)
    if error:return error
    body,_=resolved_payload(record,payload_store)
    if body!=value["semantic_body"]:
        return "prepared_body"
    if {k:record[k] for k in value["envelope_metadata"]}!=value["envelope_metadata"]:
        return "prepared_envelope_metadata"
    return None


def source_record_ref(et, p):
    candidates = {
        "collaboration.created": "definition_record_ref", "collaboration.configuration_changed": "definition_record_ref",
        "collaboration.message_added": "message_record_ref", "brainstorm.proposal_added": "proposal_record_ref",
        "brainstorm.vote_added": "vote_record_ref", "review.finding_added": "finding_record_ref",
        "review.finding_dispositioned": "finding_record_ref",
    }
    if et in ("collaboration.created","collaboration.configuration_changed"):
        return p.get("definition_record_ref", "collaboration_definition:"+p["collaboration_id"]+":"+str(p["definition_revision"]))
    if et=="collaboration.message_added":
        return "collaboration_message:"+p["collaboration_message_id"]
    if et=="collaboration.participant_started":
        return "collaboration_participant:"+p["collaboration_run_id"]+":"+p["participant_slot_id"]+":"+p["attempt_id"]
    if et=="collaboration.participant_completed":return p["disposition_record_ref"]
    return p.get(candidates.get(et, "run_record_ref"), "collaboration_run:" + p["collaboration_run_id"])


def expected_physical_rows(root=ROOT):
    """Independent schema/key/codec/writer/recovery joins, not a count-only registration check."""
    p = load(PROJECTION_PATH, root)
    b = p["x-pm-event-authority-binding"]
    rows = [("collaboration_projector_checkpoint", "checkpoint", b["checkpoint"]["key"])]
    rows += [("collaboration_" + name + "_projection", name + "_projection", row["key"]) for name, row in b["projection_rows"].items()]
    return rows


def source_physical_value_schema(root=ROOT):
    source=load(SOURCE_PATH,root)
    first=copy.deepcopy(source["$defs"]["collaboration_created_project"])
    first["$id"]="pm.collaboration.prepared_source.v1"
    first["properties"]["event_type"]={"enum":EVENT_TYPES}
    first["properties"]["owner_record"]={"type":"object"}
    first["properties"]["semantic_body"]={"type":"object"}
    first["properties"]["participant_identity"]=copy.deepcopy(source["$defs"]["brainstorm_proposal_added_project"]["properties"]["participant_identity"])
    first["properties"]["review_target_pack"]=copy.deepcopy(source["$defs"]["collaboration_started_project"]["properties"]["review_target_pack"])
    first["allOf"]=[{"$ref":source["$id"]}]
    return first


def physical_binding_failures(root=ROOT):
    registry = {r["family_id"]: r for r in load(SVR_PATH, root)["families"]}
    schema = load(PROJECTION_PATH, root)
    b = schema["x-pm-event-authority-binding"]
    failures = []
    for family, definition, key in expected_physical_rows(root):
        row = registry.get(family)
        want = {"key_shape": key, "encoding": "messagepack_canonical", "owner_doc": "Plans/storage-plan.md#SP-460", "producer": [b["projector"]], "retention_policy_ref": "RP-PROJECTION-3GEN", "value_schema_ref": PROJECTION_PATH + "#/$defs/" + definition, "value_schema": dict(schema["$defs"][definition], **{"$defs": schema["$defs"]}), "schema_version": "1.0.0", "value_schema_id": schema["$defs"][definition]["properties"]["schema_id"]["const"]}
        if row is None or any(row.get(k) != v for k, v in want.items()):
            failures.append({"check": "physical_binding", "family_id": family})
        elif row["recovery_disposition"]["backup_required"] or row["recovery_disposition"]["authority_class"] != "derived_rebuildable":
            failures.append({"check": "physical_recovery", "family_id": family})
    expected_composition={"stored":False,"members":[{"family_id":family,"key_shape":key,"value_schema_ref":PROJECTION_PATH+"#/$defs/"+definition} for family,definition,key in expected_physical_rows(root)]}
    if schema.get("x-pm-keyed-composition")!=expected_composition:
        failures.append({"check":"physical_keyed_composition"})
    row = registry.get("collaboration_prepared_source")
    if row is None or row.get("value_schema_ref") != SOURCE_PATH or row.get("encoding") != "messagepack_canonical" or row.get("producer") != ["CollaborationRuntime"] or not row.get("recovery_disposition", {}).get("backup_required") or row.get("value_schema")!=source_physical_value_schema(root) or row.get("value_schema_id")!="pm.collaboration.prepared_source.v1" or row.get("key_shape")!="collaboration_prepared_source.v1:{hex(storage_instance_id)}:{recovery_epoch}:{scope_partition}:{hex(event_type)}:{hex(owner_operation_id)}" or row.get("retention_policy_ref")!=RETENTION_POLICY or row.get("recovery_disposition",{}).get("authority_class")!="canonical_non_rebuildable":
        failures.append({"check": "source_physical_binding"})
    return failures



# --- transition reducer (SP-460 and each family's SP unit) ---------------------------------------------------

class Reducer:

    def __init__(self, admitted: list[str], storage_instance_id: str, recovery_epoch: int):
        self.admitted = set(admitted)
        self.siid = storage_instance_id
        self.epoch = recovery_epoch
        self.dedupe: dict[tuple[str, str, str], str] = {}
        self.defs: dict[tuple[str, str], dict[str, Any]] = {}
        self.runs: dict[tuple[str, str], dict[str, Any]] = {}

    def commit(self, et: str, p: dict[str, Any], sp: str) -> str:
        coll = (sp, p['collaboration_id'])
        rkey = (sp, p['collaboration_run_id'])
        if et == 'collaboration.created':
            self.defs[coll] = {'latest': 1, 'revs': {1}, 'kind': p['kind'], 'thread': p['thread_id'], 'required': set(p['required_slot_ids'])}
            return 'appended'
        if et == 'collaboration.configuration_changed':
            d = self.defs.get(coll)
            run = self.runs.get(rkey)
            if p['change_source'] == 'start_commit':
                pass
            d['required'] = set(p['required_slot_ids'])
            d['latest'] = p['definition_revision']
            d['revs'].add(p['definition_revision'])
            if run is not None and p['change_source'] == 'reconfigure':
                run['required'] = set(p['required_slot_ids'])
                run['def_rev'] = p['definition_revision']
                ck = set(p['change_kinds'])
                if 'add_participant' in ck:
                    for s in p['affected_slot_ids']:
                        if s not in run['roster']:
                            run['roster'].append(s)
                if 'remove_participant' in ck:
                    run['removed'] |= set(p['affected_slot_ids'])
                if 'waive_participant' in ck:
                    run['waivers'] |= set(p['affected_slot_ids'])
                if p['accept_stale_target']:
                    run['stale_accepted'] = True
            return 'appended'
        if et == 'collaboration.started':
            d = self.defs.get(coll)
            self.runs[rkey] = {'status': 'active', 'seq': 1, 'def_rev': p['definition_revision'], 'kind': p['kind'], 'thread': p['thread_id'], 'coll': p['collaboration_id'], 'roster': list(p['participant_slot_ids']), 'removed': set(), 'waivers': set(), 'target_hashes': list(p.get('target_hashes', [])), 'slots': {}, 'attempts': {}, 'last_msg': 0, 'msgs': set(), 'artifacts': set(), 'proposals': {}, 'votes': {}, 'synthesized': False, 'synthesized_plan_ref': None, 'synthesized_plan_version': None, 'findings': {}, 'finalized': None, 'stale_accepted': False, 'required': set(d['required'])}
            return 'appended'
        run = self.runs.get(rkey)
        short = et.split('.', 1)[1]
        handler = getattr(self, 'r_' + short)
        return handler(run, p)

    def slot(self, run, slot_id):
        return run['slots'].setdefault(slot_id, {'current_rev': 1, 'current_attempt': None, 'latest_outcome': None, 'no_attempt': {}, 'role': None})

    def open_attempts(self, run):
        return any((a['outcome'] is None for a in run['attempts'].values()))

    def r_paused(self, run, p):
        run['status'], run['seq'] = ('paused', p['lifecycle_seq'])
        return 'appended'

    def r_resumed(self, run, p):
        run['status'], run['seq'] = ('active', p['lifecycle_seq'])
        return 'appended'

    def r_cancelled(self, run, p):
        run['status'], run['seq'] = ('cancelled', p['lifecycle_seq'])
        return 'appended'

    def r_failed(self, run, p):
        run['status'], run['seq'] = ('failed', p['lifecycle_seq'])
        return 'appended'

    def r_completed(self, run, p):
        allowed = ('active', 'paused') if p['completion_trigger'] == 'chat_room_end' else ('active',)
        for s in p['required_slot_ids']:
            pass
        run['status'], run['seq'] = ('completed', p['lifecycle_seq'])
        return 'appended'

    def r_participant_started(self, run, p):
        s = p['participant_slot_id']
        st = self.slot(run, s)
        run['attempts'][p['attempt_id']] = {'slot': s, 'rev': p['assignment_revision'], 'outcome': None, 'role': p['additive_role_kind']}
        st.update(current_rev=p['assignment_revision'], current_attempt=p['attempt_id'], role=p['additive_role_kind'])
        self.recount(run)
        return 'appended'

    def r_participant_completed(self, run, p):
        s = p['participant_slot_id']
        a = p.get('attempt_id')
        if a is not None:
            att = run['attempts'].get(a)
        if a is not None:
            run['attempts'][a]['outcome'] = p['outcome']
        else:
            self.slot(run, s)['no_attempt'][p['assignment_revision']] = p['outcome']
        self.slot(run, s)['latest_outcome'] = p['outcome']
        self.recount(run)
        return 'appended'

    def r_message_added(self, run, p):
        if p['sender_kind'] == 'participant':
            a = p.get('attempt_id')
        run['msgs'].add(p['collaboration_message_id'])
        run['last_msg'] = p['sequence']
        return 'appended'

    def r_artifact_added(self, run, p):
        run['artifacts'].add(p['artifact_version_ref'])
        return 'appended'

    def r_proposal_added(self, run, p):
        att = run['attempts'].get(p['attempt_id'])
        run['proposals'][p['proposal_id']] = {'support': 0, 'oppose': 0, 'abstain': 0}
        return 'appended'

    def r_vote_added(self, run, p):
        att = run['attempts'].get(p['attempt_id'])
        st = self.slot(run, p['participant_slot_id'])
        run['votes'][p['vote_id']] = {'proposal': p['proposal_id'], 'slot': p['participant_slot_id'], 'attempt': p['attempt_id'], 'position': p['position']}
        self.recount(run)
        return 'appended'

    def recount(self, run):
        for t in run['proposals'].values():
            t.update(support=0, oppose=0, abstain=0)
        for v in run['votes'].values():
            att = run['attempts'][v['attempt']]
            if self.slot(run, v['slot'])['current_attempt'] == v['attempt'] and att['outcome'] in (None, 'completed'):
                run['proposals'][v['proposal']][v['position']] += 1

    def r_plan_synthesized(self, run, p):
        run['synthesized'] = True
        run['synthesized_plan_ref'] = 'assistant_plan:' + p['assistant_plan_id']
        run['synthesized_plan_version'] = p['plan_version']
        return 'appended'

    def r_finding_added(self, run, p):
        run['findings'][p['finding_id']] = {'disposition': None, 'target_hashes': p['target_hashes']}
        return 'appended'

    def r_finding_dispositioned(self, run, p):
        f = run['findings'].get(p['finding_id'])
        f['disposition'] = p['disposition']
        return 'appended'

    def r_artifact_finalized(self, run, p):
        run['finalized'] = p['artifact_version_ref']
        return 'appended'

    def final_state(self, sp: str, run_id: str) -> dict[str, Any]:
        run = self.runs[sp, run_id]
        return {'lifecycle_status': run['status'], 'lifecycle_seq': run['seq'], 'last_message_sequence': run['last_msg'], 'artifact_count': len(run['artifacts']), 'finalized_artifact_version_ref': run['finalized'], 'waived_slot_ids': sorted((s for s, st in run['slots'].items() if st['latest_outcome'] == 'explicitly_waived')), 'proposal_tallies': {k: dict(v) for k, v in run['proposals'].items()}, 'findings': {k: v['disposition'] for k, v in run['findings'].items()}}

    def apply(self, et, p, epoch=None):
        rejection = self.admission_rejection(et, p)
        if rejection is not None:
            return rejection
        result = self.commit(et, p, scope_partition(p))
        self.dedupe[scope_partition(p), et, p['idempotency_key']] = producer_digest(p)
        return result

    def admission_rejection(self, et, p):
        sp = scope_partition(p)
        key = (sp, et, p['idempotency_key'])
        if key in self.dedupe:
            if self.dedupe[key] != producer_digest(p):
                return 'idempotency_conflict'
            return 'exact_retry'
        if et not in self.admitted:
            return 'quarantined'
        if et in self.admitted:
            return self.transition_rejection(et, p, sp)
        return None

    def transition_rejection(self, et, p, sp):
        """Read-only admission predicates; effect application follows only an accepted decision.

        Dependent checks apply only in their actual domain: nonexistent owners, a wrong lineage
        or a terminal run never supplies a fabricated state to another family's rule.
        """
        coll = (sp, p['collaboration_id'])
        rkey = (sp, p['collaboration_run_id'])
        d = self.defs.get(coll)
        run = self.runs.get(rkey)
        if et == 'collaboration.created':
            if d is not None:
                return 'conflict:already_created'
            return None
        if et in ('collaboration.started', 'collaboration.configuration_changed'):
            if d is None or (et == 'collaboration.started' and p['definition_revision'] not in d['revs']):
                return 'conflict:definition_not_recorded'
            if d is not None and (et != 'collaboration.started' or p['definition_revision'] in d['revs']):
                if (d['kind'], d['thread']) != (p['kind'], p['thread_id']):
                    return 'conflict:lineage_mismatch'
                if (d['kind'], d['thread']) == (p['kind'], p['thread_id']):
                    if et == 'collaboration.started' or p['change_source'] == 'start_commit':
                        if run is not None:
                            return 'conflict:already_started'
                        if et == 'collaboration.configuration_changed' and d['latest'] != p['previous_definition_revision']:
                            return 'conflict:stale_definition_revision'
                        return None
        if et in ('collaboration.started', 'collaboration.configuration_changed') and (d is None or (et=='collaboration.started' and p['definition_revision'] not in d['revs']) or (d['kind'],d['thread'])!=(p['kind'],p['thread_id'])):
            return None
        if run is None:
            return 'conflict:run_not_started'
        if run is not None:
            lineage = (run['thread'], run['kind'], run['coll']) == (p['thread_id'], p['kind'], p['collaboration_id'])
            if not lineage:
                return 'conflict:lineage_mismatch'
            if lineage:
                terminal = run['status'] in ('completed', 'cancelled', 'failed')
                if terminal:
                    return 'conflict:already_terminal'
                if not terminal:
                    revision = p['previous_definition_revision'] if et == 'collaboration.configuration_changed' else p['definition_revision']
                    if revision != run['def_rev'] or (et == 'collaboration.configuration_changed' and revision != d['latest']):
                        return 'conflict:stale_definition_revision'
                    return self.family_rejection(et, p, run)
        return None

    def family_rejection(self, et, p, run):
        short = et.split('.', 1)[1]
        if short == 'configuration_changed':
            return None
        if short in ('paused', 'resumed', 'cancelled', 'failed', 'completed'):
            allowed = ('paused',) if short == 'resumed' else ('active',) if short == 'paused' or (short == 'completed' and p['completion_trigger'] != 'chat_room_end') else ('active', 'paused')
            if run['status'] not in allowed:
                return 'conflict:run_state_invalid'
            if p['lifecycle_seq'] != run['seq'] + 1:
                return 'conflict:stale_lifecycle_seq'
            if short in ('cancelled', 'failed', 'completed') and self.open_attempts(run):
                return 'conflict:open_attempts'
            if short == 'completed':
                if set(p['required_slot_ids']) != run['required']:
                    return 'conflict:required_slot_set_mismatch'
                if set(p['waived_slot_ids']) != {s for s, st in run['slots'].items() if st['latest_outcome'] == 'explicitly_waived'}:
                    return 'conflict:waived_slot_set_mismatch'
                if not (run['kind'] == 'chat_room' and p['completion_trigger'] == 'chat_room_end') and any((run['slots'].get(s, {}).get('latest_outcome') not in ('completed', 'explicitly_waived') for s in run['required'])):
                    return 'conflict:unresolved_required_slots'
                if run['kind'] == 'brainstorm' and (not run['synthesized']) or (run['kind'] == 'review' and run['finalized'] is None):
                    return 'conflict:missing_output'
                if (run['kind']=='brainstorm' and run['synthesized'] and p['output_refs']!=[run['synthesized_plan_ref']]) or (run['kind']=='review' and run['finalized'] is not None and p['output_refs']!=[run['finalized']]):
                    return 'conflict:output_refs_mismatch'
            return None
        if short in ('participant_started', 'proposal_added', 'vote_added', 'plan_synthesized', 'finding_added', 'finding_dispositioned', 'artifact_finalized'):
            if run['status'] != 'active':
                return 'conflict:run_state_invalid'
        if short == 'participant_started':
            s = p['participant_slot_id']
            st = run['slots'].get(s, {'current_rev': 1})
            if s not in run['roster'] or s in run['removed']:
                return 'conflict:slot_not_in_roster'
            if p['attempt_id'] in run['attempts']:
                return 'conflict:attempt_already_started'
            if p['assignment_revision'] < st['current_rev']:
                return 'conflict:stale_assignment_revision'
        if short == 'participant_completed':
            s = p['participant_slot_id']
            a = p.get('attempt_id')
            att = run['attempts'].get(a)
            if a is not None:
                if att is None or att['slot'] != s or att['rev'] != p['assignment_revision']:
                    return 'conflict:unknown_attempt'
                if att is not None and att['slot'] == s and (att['rev'] == p['assignment_revision']) and (att['outcome'] is not None):
                    return 'conflict:attempt_already_closed'
            else:
                if s not in run['roster']:
                    return 'conflict:slot_not_in_roster'
                if p['assignment_revision'] in run['slots'].get(s, {}).get('no_attempt', {}):
                    return 'conflict:attempt_already_closed'
            if p['outcome'] == 'explicitly_waived' and s not in run['waivers']:
                return 'conflict:waiver_not_recorded'
        if short == 'message_added':
            if p['collaboration_message_id'] in run['msgs']:
                return 'conflict:message_already_written'
            if p['collaboration_message_id'] not in run['msgs'] and p['sequence'] != run['last_msg'] + 1:
                return 'conflict:sequence_gap'
            if p['sender_kind'] == 'participant':
                if p['sender_id'] not in run['roster']:
                    return 'conflict:slot_not_in_roster'
                a = p.get('attempt_id')
                if a is not None and (a not in run['attempts'] or run['attempts'][a]['slot'] != p['sender_id']):
                    return 'conflict:unknown_attempt'
        if short == 'artifact_added':
            if p['artifact_version_ref'] in run['artifacts']:
                return 'conflict:artifact_already_added'
        if short in ('proposal_added', 'vote_added'):
            if short == 'vote_added' and p['proposal_id'] not in run['proposals']:
                return 'conflict:unknown_proposal'
            att = run['attempts'].get(p['attempt_id'])
            if att is None or att['slot'] != p['participant_slot_id']:
                return 'conflict:unknown_attempt'
            if att is not None and att['slot'] == p['participant_slot_id']:
                if short == 'proposal_added':
                    if att['role'] != 'none':
                        return 'conflict:not_core_participant'
                    if p['proposal_id'] in run['proposals']:
                        return 'conflict:proposal_already_added'
                else:
                    if att['role'] == 'wonderer':
                        return 'conflict:wonderer_cannot_vote'
                    if run['slots'][p['participant_slot_id']]['current_attempt'] != p['attempt_id'] or att['outcome'] not in (None, 'completed'):
                        return 'conflict:attempt_not_current'
                    if p['vote_id'] in run['votes']:
                        return 'conflict:vote_already_added'
        if short == 'plan_synthesized':
            if run['synthesized']:
                return 'conflict:already_synthesized'
        if short == 'finding_added':
            if p['target_hashes'] != run['target_hashes']:
                return 'conflict:target_hash_mismatch'
            if any((s not in run['roster'] for s in p['originating_reviewer_ids'])):
                return 'conflict:slot_not_in_roster'
            if p['finding_id'] in run['findings']:
                return 'conflict:finding_already_added'
        if short == 'finding_dispositioned':
            finding = run['findings'].get(p['finding_id'])
            if finding is None:
                return 'conflict:unknown_finding'
            if finding is not None:
                if finding['disposition'] is not None:
                    return 'conflict:already_dispositioned'
                if p['target_hashes'] != finding['target_hashes']:
                    return 'conflict:target_hash_mismatch'
        if short == 'artifact_finalized':
            if run['finalized'] is not None:
                return 'conflict:already_finalized'
            if any((f['disposition'] is None for f in run['findings'].values())):
                return 'conflict:findings_not_dispositioned'
            if p['artifact_version_ref'] not in run['artifacts']:
                return 'conflict:artifact_not_added'
            if p['target_hashes'] != run['target_hashes']:
                return 'conflict:target_hash_mismatch'
            if p['completed_reviewer_count'] < p['requested_reviewer_count'] and (not p['partial_coverage_accepted'] or not run['waivers']):
                return 'conflict:partial_not_accepted'
            if p['stale_target_accepted'] and (not run['stale_accepted']):
                return 'conflict:stale_not_accepted'
        return None


# --- fixture report -----------------------------------------------------------------------------------------

def fixture_report(root: Path = ROOT, fixtures: dict[str, Any] | None = None) -> dict[str, Any]:
    fx = fixtures if fixtures is not None else load(FIXTURE_PATH, root)
    ctx = fx["storage_context"]
    siid, epoch = ctx["storage_instance_id"], ctx["recovery_epoch"]
    fails: list[dict[str, Any]] = []
    per = {et: {"positive": 0, "negative": 0, "valid_events": set(), "joins": set(), "vectors": 0, "sequences_appended": 0, "sequences_refused": 0} for et in EVENT_TYPES}
    payload_by_id = {}
    for c in fx["numeric_vectors"]:
        try:
            actual=canonical(json.loads(c["raw_json"], parse_constant=lambda v: (_ for _ in ()).throw(ValueError(v))))
        except (ValueError, TypeError):
            actual=None
        if actual!=c["canonical"]:
            fails.append({"check":"numeric_canonical","case_id":c["case_id"]})
    for c in fx["numeric_family_cases"]:
        et=c["event_type"];before=c["payload"];after=c["alternate_payload"]
        a=(owner_operation_id(et,before,epoch),idempotency_key(et,before,epoch),event_id(et,before,siid,epoch),producer_digest(before))
        b=(owner_operation_id(et,after,float(epoch)),idempotency_key(et,after,float(epoch)),event_id(et,after,siid,float(epoch)),producer_digest(after))
        if a!=b or payload_rejection(et,after,epoch,root) is not None:
            fails.append({"check":"numeric_identity","case_id":c["case_id"]})
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
    for c in fx["transition_cases"]:
        got=evaluate_probe(c,root)
        if got!=c["expected"]:
            fails.append({"check":"transition_case","case_id":c["case_id"],"expected":c["expected"],"found":got})
        per[c["event_type"]]["sequences_refused"]+=1
        positive=dict(c,value=c["valid_value"],prestate=c["valid_prestate"])
        if evaluate_probe(positive,root) is not None:
            fails.append({"check":"transition_valid_counterpart","case_id":c["case_id"]})
    for c in fx["prepared_sources"]:
        rejection = source_rejection(c["value"], root, c["physical_key"], c["source_context"])
        if rejection:
            fails.append({"check": "prepared_source", "case_id": c["case_id"], "found": rejection})
        elif prepared_event_rejection(c,c["event"],root):
            fails.append({"check":"prepared_event","case_id":c["case_id"],"found":prepared_event_rejection(c,c["event"],root)})
    puri = load(PROJECTION_PATH, root)["$id"]
    for c in fx["projection_values"]:
        shaped=validator(puri, "#/$defs/" + c["definition"], root).is_valid(c["value"])
        if not shaped:
            fails.append({"check": "projection_value", "case_id": c["case_id"]})
        elif c["definition"] == "checkpoint":
            rejection=checkpoint_rejection(c["value"],fx["checkpoint_contexts"][c["case_id"]],root)
            if rejection:
                fails.append({"check":"checkpoint_semantics","case_id":c["case_id"],"found":rejection})
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


def stored_size_report(root=ROOT):
    """Synthetic encoded-size inventory, not execution of the native MessagePack codec."""
    fx=load(FIXTURE_PATH,root)
    def size(value):
        return {"json_utf8_bytes":len(canonical(value).encode("utf-8")),"messagepack_bytes":len(msgpack.packb(value,use_bin_type=True))}
    rows=[]
    for kind,items in (("canonical_source",fx["prepared_sources"]),("derived_projection_or_checkpoint",fx["projection_values"])):
        for c in items:rows.append(dict(case_id=c["case_id"],kind=kind,**size(c["value"])))
    for probe in contract_probes(root,include_shapes=False):
        if probe["domain"]=="envelope" and ":large_reference:" in probe["case_id"]:
            body,_=resolved_payload(probe["value"],probe["payload_store"])
            holder=copy.deepcopy(next(c["value"] for c in fx["prepared_sources"] if c["value"]["event_type"]==probe["event_type"] and c["value"]["semantic_body"]["scope_kind"]=="project"))
            holder["semantic_body"]=body;holder["semantic_sha256"]=producer_digest(body)
            rows.append(dict(case_id=probe["case_id"],kind="large_reference",semantic_body=size(body),event_record=size(probe["value"]),source_holder_candidate=size(holder),payload_pack_bytes=len(canonical(body).encode())))
    return {"boundary":"Only EventRecord inline body is capped at 16384 bytes by SP-337; complete redb source/projection/checkpoint values have no new cap. MessagePack sizes are synthetic encodings, not native codec or durability proof.","values":rows}


def validate(root: Path = ROOT) -> dict[str, Any]:
    failures: list[dict[str, Any]] = []
    failures += reference_failures(root)
    if failures:
        return {"schema_id":"pm.collaboration_event_static_report.v1","status":"fail","claim_boundary":CLAIM_BOUNDARY,"families":len(EVENT_TYPES),"admitted_families":[],"prepared_rows":len(load(LEDGER_PATH,root)["rows"]),"counts":{},"admission_blockers":retention_blockers(root),"native_obligations":"NOT_RUN","failures":failures}
    failures += physical_binding_failures(root)
    failures += payload_schema_failures(root)
    failures += projection_schema_failures(root)
    failures += owner_unit_failures(root)
    failures += ledger_failures(root)
    member, admitted = registry_membership_failures(root)
    failures += member
    fr = fixture_report(root)
    failures += fr["failures"]
    failures += ats_failures(root)
    failures += probe_failures(root)
    failures += integrity_failures(root)
    return {
        "schema_id": "pm.collaboration_event_static_report.v1",
        "status": "pass" if not failures else "fail",
        "claim_boundary": CLAIM_BOUNDARY,
        "families": len(EVENT_TYPES),
        "admitted_families": admitted,
        "prepared_rows": len(load(LEDGER_PATH, root)["rows"]),
        "counts": fr["counts"],
        "stored_sizes": stored_size_report(root),
        "admission_blockers": retention_blockers(root),
        "native_obligations": "NOT_RUN",
        "failures": failures,
    }


@lru_cache(maxsize=8)
def schema_bases(root=ROOT):
    fx=load(FIXTURE_PATH,root)
    bases={c["case_id"]:c["payload"] for c in fx["payloads"]}
    bases.update({c["case_id"]:c["value"] for c in fx["projection_values"]+fx["prepared_sources"]})
    bases.update({c["case_id"]:c["value"] for c in fx.get("schema_valid_cases",[])})
    return bases


def schema_case_value(case, root=ROOT):
    if "value" in case:return case["value"]
    result=copy.deepcopy(schema_bases(root)[case["base_case_id"]])
    if case.get("remove",False):result.pop(case["changed_field"])
    else:result[case["changed_field"]]=case["replacement"]
    return result


def thaw_prestate(encoded):
    def decode(v):
        if isinstance(v,dict):
            if set(v)=={"$set"}:return set(v["$set"])
            return {k:({int(i):decode(w) for i,w in value.items()} if k=="no_attempt" else decode(value)) for k,value in v.items()}
        if isinstance(v,list):return [decode(w) for w in v]
        return v
    state=decode(copy.deepcopy(encoded))
    for name in ("dedupe","defs","runs"):
        if isinstance(state[name],list):state[name]={tuple(k):v for k,v in state[name]}
    return state


def contract_probes(root=ROOT, include_shapes=True):
    """Every negative starts from a named valid snapshot; related observations are recomputed."""
    fx = load(FIXTURE_PATH, root)
    siid, epoch = fx["storage_context"]["storage_instance_id"], fx["storage_context"]["recovery_epoch"]
    probes = []
    source_origin=None
    def add(domain, name, value, expected, **kw):
        if domain=="source":
            kw.setdefault("physical_key",source_storage_key(value))
            body=value["semantic_body"]
            original=source_origin
            capture=copy.deepcopy(original["source_context"]) if original else {"storage_instance_id":siid,"write_epoch":epoch,"live_epoch":epoch+1}
            if expected!="source_currentness":capture["currentness_hash"]=body["currentness_hash"]
            if expected!="source_record_digest":capture["owner_record_sha256"]=row_sha256(value["owner_record"])
            kw.setdefault("source_context",capture)
        probes.append(dict(domain=domain, case_id=name, value=copy.deepcopy(value), expected=expected, **copy.deepcopy(kw)))
    policy={"retention_mode":"indefinite","anchor_kind":"explicit_delete","max_cardinality":250000,"cardinality_scope":"thread","overflow_action":"roll_successor","hold_eligible":True,"policy_version":"1.0.0"}
    add("retention","retention:valid",policy,None)
    add("retention","retention:missing",None,"retention_missing")
    for field in policy:
        bad=copy.deepcopy(policy);bad[field]=False if isinstance(bad[field],bool) else -1 if isinstance(bad[field],int) else "wrong"
        add("retention","retention:"+field,bad,"retention_values")
    for c in fx["invalid_payloads"]:
        add("payload", c["case_id"], c["payload"], c["first_failing_layer"], event_type=c["event_type"])
    for c in fx["invalid_events"]:
        add("envelope", c["case_id"], c["record"], c["join"], event_type=c["event_type"])
    for c in fx["payloads"]:
        p = c["payload"]
        # True-end tests cover each present identifier/ref/hash/timestamp in both editions.
        for key, value in p.items():
            if isinstance(value, str) and (key.endswith(("_id", "_ref", "_hash", "_utc")) or key == "idempotency_key"):
                bad = copy.deepcopy(p); bad[key] += "\n"
                if key != "idempotency_key":
                    bad["idempotency_key"] = idempotency_key(c["event_type"], bad, epoch)
                add("payload", c["case_id"] + ":lf:" + key, bad, "schema", event_type=c["event_type"])
    for c in fx["valid_events"]:
        et, e = c["event_type"], c["record"]
        for name, value, result in [("sibling", next(t for t in EVENT_TYPES if t != et), "event_type"), ("unknown", "unknown.event", "event_type")]:
            bad = copy.deepcopy(e); bad["event_type"] = value
            add("envelope", c["case_id"] + ":" + name, bad, result, event_type=et)
        extra=copy.deepcopy(e);extra["unexpected"]=True
        add("envelope",c["case_id"]+":envelope_closed",extra,"event_record_schema",event_type=et)
        extra=copy.deepcopy(e);extra["payload"]["unexpected"]=True
        add("envelope",c["case_id"]+":payload_closed",extra,"payload",event_type=et)
        bad = copy.deepcopy(e); bad["replay_policy"] = "projector_replay_only"
        add("envelope", c["case_id"] + ":replay_only", bad, "replay_policy", event_type=et)
        context = dict(storage_instance_id=siid, write_epoch=epoch, withdrawn=False, retained=True, original_record=copy.deepcopy(e), live_run_state="completed", live_definition_revision=999, live_epoch=epoch+1)
        add("historical", c["case_id"]+":retained_after_live_change", e, None, event_type=et, context=context)
        compatibility=copy.deepcopy(e);compatibility["replay_policy"]="projector_replay_only"
        old_context=copy.deepcopy(context);old_context["original_record"]=copy.deepcopy(compatibility)
        add("historical",c["case_id"]+":retained_replay_only",compatibility,None,event_type=et,context=old_context)
        for name in ["withdrawn", "retained"]:
            ctx = copy.deepcopy(context); ctx[name] = name == "withdrawn"
            add("historical", c["case_id"]+":"+name, e, "historical_withdrawn" if name == "withdrawn" else "historical_not_retained", event_type=et, context=ctx)
        forged = copy.deepcopy(e); forged["actor_ref"] = "component:forged"
        add("historical", c["case_id"]+":forged", forged, "historical_forged", event_type=et, context=context)
        # Both legal representations resolve to exactly the same semantic body.
        ref, body = payload_reference(e["payload"])
        ext = copy.deepcopy(e); ext.update(payload={}, payload_ref=ref)
        add("envelope", c["case_id"]+":reference", ext, None, event_type=et, payload_store={ref:body})
        add("envelope", c["case_id"]+":missing_reference", ext, "reference_missing", event_type=et)
        wrong_size = ref.replace(":"+str(len(body.encode()))+":", ":1:")
        bad = copy.deepcopy(ext); bad["payload_ref"] = wrong_size
        add("envelope", c["case_id"]+":wrong_reference_size", bad, "reference_size", event_type=et, payload_store={wrong_size:body})
        wrong_hash = ref[:15] + ("0" if ref[15] != "0" else "1") + ref[16:]
        bad = copy.deepcopy(ext); bad["payload_ref"] = wrong_hash
        add("envelope", c["case_id"]+":wrong_reference_hash", bad, "reference_hash", event_type=et, payload_store={wrong_hash:body})
    for c in fx["prepared_sources"]:
        source_origin=c
        v=c["value"]
        add("source", c["case_id"], v, None)
        for field,new,result in [("scope_partition", "app" if v["scope_partition"]!="app" else "project~eA", "source_partition"), ("owner_operation_id", "collabop_"+"0"*64, "source_operation"), ("event_id", "evt_collaboration_"+"0"*64, "source_event_id"), ("semantic_sha256", "0"*64, "source_digest"), ("owner_record_sha256", "0"*64, "source_record_digest"), ("owner_record_ref", "collaboration_run:wrong", "source_record_ref")]:
            bad=copy.deepcopy(v);bad[field]=new
            add("source", c["case_id"]+":"+field, bad, result)
    for c in fx["prepared_sources"]:
        source_origin=c
        v=c["value"]
        # Independently captured controls are not observational copies of caller fields.
        for control,error in [("owner_record_ref","source_record_ref"),("owner_record_sha256","source_record_digest"),("required_slot_ids","source_required_slots"),("participant_slot_ids","source_slot_roster"),("binding","source_record_identity")]:
            capture=copy.deepcopy(c["source_context"])
            if control=="binding":capture[control]["thread_id"]="thr_foreign_original"
            elif control=="required_slot_ids":capture[control]=[]
            elif control=="participant_slot_ids":capture[control].append("s_foreign_original")
            else:capture[control]="0"*64 if control.endswith("sha256") else "collaboration_run:foreign_original"
            add("source",c["case_id"]+":original_control:"+control,v,error,source_context=capture)
        add("source",c["case_id"]+":missing_context",v,"source_context_missing",source_context=None)
        add("source",c["case_id"]+":wrong_key",v,"source_key",physical_key="collaboration_prepared_source.v1:wrong")
        for field,error in [("storage_instance_id","source_instance"),("recovery_epoch","source_epoch")]:
            bad=copy.deepcopy(v)
            if field=="storage_instance_id":
                bad[field]="00000000-0000-4000-8000-000000000000"
                if "application_context" in bad["owner_record"]:bad["owner_record"]["application_context"][field]=bad[field]
            else:bad[field]+=1
            bad["semantic_body"]["idempotency_key"]=idempotency_key(bad["event_type"],bad["semantic_body"],bad["recovery_epoch"])
            bad["owner_record_sha256"]=row_sha256(bad["owner_record"]);bad["semantic_body"]["currentness_hash"]=bad["owner_record_sha256"];bad["semantic_sha256"]=producer_digest(bad["semantic_body"])
            bad["owner_operation_id"]=owner_operation_id(bad["event_type"],bad["semantic_body"],bad["recovery_epoch"]);bad["event_id"]=event_id(bad["event_type"],bad["semantic_body"],bad["storage_instance_id"],bad["recovery_epoch"])
            add("source",c["case_id"]+":"+field,bad,error)
        bad=copy.deepcopy(v);bad["unexpected"]=True;add("source",c["case_id"]+":closed",bad,"source_schema")
        bad=copy.deepcopy(v);bad["event_type"]="unknown.event";add("source",c["case_id"]+":family",bad,"source_schema")
        bad=copy.deepcopy(v);bad["semantic_body"]["currentness_hash"]="f"*64;bad["semantic_sha256"]=producer_digest(bad["semantic_body"]);add("source",c["case_id"]+":currentness",bad,"source_currentness")
        bad=copy.deepcopy(v);key=bad["semantic_body"]["idempotency_key"];bad["semantic_body"]["idempotency_key"]=(key[:-2]+("30" if key[-2:]!="30" else "31")) if bad["semantic_body"]["scope_kind"]=="application" else key[:-1]+("0" if key[-1]!="0" else "1");bad["semantic_sha256"]=producer_digest(bad["semantic_body"]);add("source",c["case_id"]+":payload_identity",bad,"source_payload")
        if v["event_type"] in ("collaboration.created","collaboration.configuration_changed"):
            bad=copy.deepcopy(v);bad["semantic_body"]["required_slot_ids"]=["s_missing"];bad["semantic_sha256"]=producer_digest(bad["semantic_body"]);add("source",c["case_id"]+":required",bad,"source_required_slots")
            bad=copy.deepcopy(v);bad["slot_requirements"].append({"slot_id":"s_extra","required":False});add("source",c["case_id"]+":roster",bad,"source_slot_roster")
        bad=copy.deepcopy(v);bad["slot_requirements"][0]["required"]=not bad["slot_requirements"][0]["required"]
        add("source",c["case_id"]+":required_snapshot",bad,"source_required_slots")
        record=v["owner_record"]
        field=next((k for k in ("thread_id","collaboration_id","collaboration_run_id","proposal_id","vote_id","finding_id","participant_slot_id","run_id") if k in record),None)
        if field:
            bad=copy.deepcopy(v);bad["owner_record"][field]="other_record";bad["owner_record_sha256"]=row_sha256(bad["owner_record"]);bad["semantic_body"]["currentness_hash"]=bad["owner_record_sha256"];bad["semantic_sha256"]=producer_digest(bad["semantic_body"]);add("source",c["case_id"]+":record_identity",bad,"source_record_identity")
        bad=copy.deepcopy(v);bad["envelope_metadata"]["actor_ref"]="user:other_actor"
        add("source",c["case_id"]+":metadata",bad,"source_envelope_metadata")
        if v["event_type"]=="collaboration.completed":
            bad=copy.deepcopy(v);bad["semantic_body"]["output_refs"]=["artifact_version:unknown"];bad["semantic_sha256"]=producer_digest(bad["semantic_body"])
            add("source",c["case_id"]+":output",bad,"source_output_refs")
        add("prepared",c["case_id"]+":event",c["event"],None,source_case=c)
        assigned=copy.deepcopy(c["event"]);assigned["sequence_id"]+=1000;assigned["observed_at_utc"]="2026-11-04T12:00:00Z";assigned["persisted_at_utc"]="2026-11-04T12:00:01Z"
        add("prepared",c["case_id"]+":assigned_metadata",assigned,None,source_case=c)
        bad=copy.deepcopy(c["event"]);bad["payload"]["currentness_hash"]="0"*64
        add("prepared",c["case_id"]+":body",bad,"prepared_body",source_case=c)
        bad=copy.deepcopy(c["event"]);bad["actor_ref"]="user:other_actor"
        add("prepared",c["case_id"]+":envelope",bad,"prepared_envelope_metadata",source_case=c)
        if v["event_type"] in ("collaboration.started","collaboration.message_added"):
            bad=copy.deepcopy(v);bad["owner_record"]["created_at"]="2026-11-04T13:00:00Z";bad["owner_record_sha256"]=row_sha256(bad["owner_record"])
            add("source",c["case_id"]+":record_state",bad,"source_record_state")
        if v["event_type"]=="collaboration.participant_completed":
            bad=copy.deepcopy(v);bad["owner_record"]["attempt_id"]="other_attempt";bad["owner_record_sha256"]=row_sha256(bad["owner_record"]);bad["semantic_body"]["currentness_hash"]=bad["owner_record_sha256"];bad["semantic_sha256"]=producer_digest(bad["semantic_body"])
            add("source",c["case_id"]+":attempt",bad,"source_attempt")
            if v["semantic_body"]["outcome"]=="explicitly_waived":
                bad=copy.deepcopy(v);bad["owner_record"]["waiver"]["currentness_hash"]="0"*64;bad["owner_record_sha256"]=row_sha256(bad["owner_record"]);bad["semantic_body"]["currentness_hash"]=bad["owner_record_sha256"];bad["semantic_sha256"]=producer_digest(bad["semantic_body"])
                add("source",c["case_id"]+":waiver",bad,"source_waiver")
        if "participant_identity" in v:
            bad=copy.deepcopy(v);bad["participant_identity"]["participant_id"]="other_participant"
            add("source",c["case_id"]+":participant_identity",bad,"source_participant_identity")
        if "review_target_pack" in v:
            bad=copy.deepcopy(v);bad["review_target_pack"]["target_hashes"]=["0"*64]
            add("source",c["case_id"]+":review_pack",bad,"source_review_pack")
        if "application_context" in record:
            bad=copy.deepcopy(v);bad["owner_record"]["application_context"]["storage_instance_id"]="00000000-0000-4000-8000-000000000000";bad["owner_record_sha256"]=row_sha256(bad["owner_record"]);bad["semantic_body"]["currentness_hash"]=bad["owner_record_sha256"];bad["semantic_sha256"]=producer_digest(bad["semantic_body"]);add("source",c["case_id"]+":app_context",bad,"source_application_context")
    for c in fx["projection_values"]:
        if c["definition"]!="checkpoint": continue
        v=c["value"];ctx=fx["checkpoint_contexts"][c["case_id"]]
        add("checkpoint", c["case_id"],v,None,context=ctx)
        bad=copy.deepcopy(v);bad["admitted_event_types"]=bad["admitted_event_types"][:-1]
        add("checkpoint",c["case_id"]+":admitted",bad,"checkpoint_admitted",context=ctx)
        if v["source_cursor"]:
            changed=copy.deepcopy(ctx);changed["last_event"]["actor_ref"]=""
            add("checkpoint",c["case_id"]+":event",v,"checkpoint_event",context=changed)
        else:
            changed=copy.deepcopy(ctx);changed["source_cursor"]={"missing":True}
            add("checkpoint",c["case_id"]+":empty_cursor",v,"checkpoint_cursor",context=changed)
        bad=copy.deepcopy(v);bad["storage_instance_id"]="00000000-0000-4000-8000-000000000000"
        add("checkpoint", c["case_id"]+":instance",bad,"checkpoint_instance",context=ctx)
        bad=copy.deepcopy(v);bad["scope_partition"]="project~eA" if v["scope_kind"]=="project" else "project~eA"
        add("checkpoint",c["case_id"]+":partition",bad,"checkpoint_partition" if v["scope_kind"]=="project" else "checkpoint_schema",context=ctx)
        for field in ["frontier_revision","frontier_sha256","generation_id","generation_anchor_sha256","index_dataset_name","checkpoint_key","checkpoint_ref"]:
            bad=copy.deepcopy(v);old=bad["index_read_token"][field];bad["index_read_token"][field]=(old+1 if isinstance(old,int) else ("eig_"+"1"*64 if field=="generation_id" else "1"*64 if field.endswith("sha256") else old+"x"))
            add("checkpoint",c["case_id"]+":token:"+field,bad,"checkpoint_token",context=ctx)
        for field in ["first_retained_sequence_id","index_through_sequence_id"]:
            if v[field] is not None:
                bad=copy.deepcopy(v);bad[field]+=1;add("checkpoint",c["case_id"]+":"+field,bad,"checkpoint_coverage",context=ctx)
        if v["source_cursor"]:
            bad=copy.deepcopy(v);bad["source_cursor"]["last_event_id"]="evt_collaboration_"+"0"*64
            add("checkpoint",c["case_id"]+":cursor",bad,"checkpoint_cursor",context=ctx)
    for name,body in [("reference_json","["),("reference_canonical",'{ "x":1}')]:
        ref=f"payload:blake3:{blake3(body.encode()).hexdigest()}:{len(body.encode())}:application/json"
        add("reference",name,{"ref":ref,"body":body},name)
    ref,body=payload_reference({"x":1})
    for name,r,b in [("reference_missing",ref,None),("reference_format",ref.replace("application/json","text/plain"),body),("reference_size",ref.replace(":7:",":1:"),body),("reference_hash",ref.replace(blake3(body.encode()).hexdigest(),"0"*64),body)]:
        add("reference","decision:"+name,{"ref":r,"body":b},name)
    sample=copy.deepcopy(fx["valid_events"][0]["record"]);sample["payload_ref"]=ref
    add("representation","decision:reference_inline_body",sample,"reference_inline_body")
    # Exact 16 KiB boundary, oversized roster/recipients/targets/constraints without narrowing schemas.
    for et,field in [("collaboration.created","participant_slot_ids"),("collaboration.message_added","recipient_ids"),("collaboration.started","target_hashes"),("brainstorm.vote_added","hard_constraint_conflict_ids")]:
        candidates=[c for c in fx["valid_events"] if c["event_type"]==et and c["record"]["scope_kind"]=="project"]
        e=copy.deepcopy(candidates[0]["record"]);p=e["payload"]
        if field=="target_hashes":
            p["kind"]="review";p["target_pack_ref"]="review_target_pack:fixture";p[field]=["a"*64]*256
        elif field=="hard_constraint_conflict_ids":
            # The field is an array of opaque identifiers, not free-form constraints.
            p[field]=["constraint_"+str(i)+"x"*225 for i in range(100)]
        else:p[field]=list(p.get("required_slot_ids",[]))+["slot_"+str(i)+"x"*240 for i in range(100)]
        if payload_rejection(et,p,epoch,root): continue
        add("envelope",TOKEN[et]+":large_inline:"+field,e,"inline_limit",event_type=et)
        ref,body=payload_reference(p);e.update(payload={},payload_ref=ref)
        add("envelope",TOKEN[et]+":large_reference:"+field,e,None,event_type=et,payload_store={ref:body})
    # Test the mandatory reference/inline boundary at exactly 16384 bytes using a legal identity array.
    base=copy.deepcopy(next(c["record"] for c in fx["valid_events"] if c["event_type"]=="collaboration.created"))
    p=base["payload"];p["participant_slot_ids"]=list(p["required_slot_ids"])+["s"+str(i)+"x"*180 for i in range(80)]
    remaining=16384-len(canonical(p).encode())-3
    while remaining>256:
        p["participant_slot_ids"].append("b"+str(len(p["participant_slot_ids"]))+"x"*240);remaining=16384-len(canonical(p).encode())-3
    p["participant_slot_ids"].append("q"*remaining)
    if len(canonical(p).encode())!=16384: raise AssertionError("boundary fixture")
    add("envelope","inline_exact_16384",base,None,event_type="collaboration.created")
    bad=copy.deepcopy(base);bad["payload"]["participant_slot_ids"][-1]+="q"
    add("envelope","inline_16385",bad,"inline_limit",event_type="collaboration.created")
    strict=load(PROJECTION_PATH,root)["$defs"]["durable_read_token"]
    add("read_token","read_token:strict",{"name":"index_read_token","schema":strict,"root":strict},None)
    for label,name,schema in [("string","index_read_token",{"type":"string"}),("renamed","api_token",strict),("open","index_read_token",dict(strict,additionalProperties=True)),("arbitrary","index_read_token",{"type":"object","additionalProperties":False})]:
        add("read_token","read_token:"+label,{"name":name,"schema":schema,"root":schema},"read_token_exemption")
    changed=copy.deepcopy(strict);changed["properties"]["frontier_revision"]["type"]="string"
    add("read_token","read_token:wrong_field_type",{"name":"index_read_token","schema":changed,"root":changed},"read_token_exemption")
    # Each transition negative is evaluated on its own pre-state; later observations cannot mask it.
    for sequence in fx["transition_sequences"]:
        state=Reducer(sequence["admitted_event_types"],sequence["storage_instance_id"],sequence["recovery_epoch"])
        for i,st in enumerate(sequence["steps"]):
            if st["expected"].startswith("conflict:") or st["expected"] in ("quarantined","idempotency_conflict"):
                add("transition",sequence["case_id"]+":"+str(i),st["payload"],st["expected"],event_type=st["event_type"],prestate=copy.deepcopy(state.__dict__))
            state.apply(st["event_type"],st["payload"])
    for p in list(probes):
        if p["domain"]=="envelope" and p["expected"]=="inline_limit":
            add("representation","decision:"+p["case_id"],p["value"],"inline_limit")
    probes += copy.deepcopy(fx["transition_cases"])
    if include_shapes:
        for c in fx.get("schema_valid_cases",[]):
            add("shape",c["case_id"],c["value"],None,path=c["path"],definition=c["definition"])
        for c in fx.get("schema_cases",[]):
            add("shape",c["case_id"],schema_case_value(c,root),"schema",path=c["path"],definition=c["definition"])
    return probes


@lru_cache(maxsize=8)
def readiness_module(root=ROOT):
    spec=importlib.util.spec_from_file_location("pm_collaboration_readiness",root/"scripts/pm-implementation-readiness.py")
    module=importlib.util.module_from_spec(spec);spec.loader.exec_module(module)
    return module


def read_token_rejection(value,root=ROOT):
    if not readiness_module(root).storage_value_is_canonical_read_token(value["name"],value["schema"],value["root"]):
        return "read_token_exemption"
    return None


def evaluate_probe(probe, root=ROOT):
    f=load(FIXTURE_PATH,root);siid=f["storage_context"]["storage_instance_id"];epoch=f["storage_context"]["recovery_epoch"]
    d=probe["domain"];v=probe["value"]
    if d=="read_token":return read_token_rejection(v,root)
    if d=="shape":return None if validator(load(probe["path"],root)["$id"],"#/$defs/"+probe["definition"],root).is_valid(v) else "schema"
    if d=="payload": return payload_rejection(probe["event_type"],v,epoch,root)
    if d=="envelope": return envelope_rejection(probe["event_type"],v,siid,epoch,root,probe.get("payload_store"))
    if d=="prepared":return prepared_event_rejection(probe["source_case"],v,root)
    if d=="retention":return retention_rejection(v)
    if d=="representation": return representation_rejection(v)
    if d=="reference": return reference_rejection(v["ref"],v["body"])
    if d=="source": return source_rejection(v,root,probe["physical_key"],probe["source_context"])
    if d=="checkpoint": return checkpoint_rejection(v,probe["context"],root)
    if d=="historical": return historical_rejection(probe["event_type"],v,probe["context"],root)
    if d=="transition":
        reducer=Reducer([],siid,epoch);reducer.__dict__=thaw_prestate(probe["prestate"])
        result=reducer.admission_rejection(probe["event_type"],v)
        return None if result in (None,"appended","exact_retry") else result
    raise AssertionError(d)


def probe_failures(root=ROOT):
    failures=[]
    for p in contract_probes(root):
        result=evaluate_probe(p,root)
        if result!=p["expected"]:
            failures.append({"check":"contract_probe","case_id":p["case_id"],"expected":p["expected"],"found":result})
    return failures



def read_owner(path, root=ROOT):
    return (root/path).read_text(encoding="utf-8")


def integrity_cases(root=ROOT):
    """Fixed, one-defect integrity inputs. Expected failures never come from the checker under test."""
    cases=[]
    def case(target,check,path,patch,support=None):
        value=copy.deepcopy(load(path,root));patch(value)
        overrides={path:value}
        if support:support(overrides)
        cases.append(dict(case_id="integrity:"+check,target=target,expected=check,overrides=overrides))
    token=TOKEN[EVENT_TYPES[0]]
    payload_cases=[
        ("payload_defs",lambda d:d["$defs"].__setitem__("unknown",{})),
        ("payload_schema_id",lambda d:d["$defs"][token].__setitem__("$id","pm.invalid.v1")),
        ("payload_closed",lambda d:d["$defs"][token].__setitem__("additionalProperties",True)),
        ("required_without_property",lambda d:d["$defs"][token]["required"].append("unknown")),
        ("null_admitted",lambda d:d["$defs"][token]["properties"].__setitem__("unknown",{"type":"null"})),
        ("family_timestamp_required",lambda d:d["$defs"][token]["required"].remove("created_at_utc")),
        ("subject_field_missing",lambda d:d["$defs"]["collaboration_participant_completed"]["properties"].pop("attempt_id")),
        ("kind_constant",lambda d:d["$defs"]["brainstorm_vote_added"]["properties"].__setitem__("kind",{"enum":["brainstorm"]})),
        ("reconfigure_change_kind_copy",lambda d:d["$defs"]["reconfigure_change_kind"]["enum"].pop()),
        ("reason_enum_is_section_11_without_cancelled",lambda d:d["$defs"]["collaboration_failed"]["properties"]["failure_reason"]["enum"].pop()),
        ("state_subset_of_run_state",lambda d:d["$defs"]["collaboration_paused"]["properties"]["state_before"]["enum"].append("unknown")),
    ]
    for check,patch in payload_cases:case("payload_schema_failures",check,PAYLOAD_PATH,patch)
    for check,patch in [
        ("durable_read_token_copy_differs_from_coordination",lambda d:d["$defs"]["durable_read_token"]["properties"]["frontier_revision"].__setitem__("type","string")),
        ("redb_snapshot_id_storable",lambda d:d["$defs"]["run_projection"]["properties"].__setitem__("redb_snapshot_id",{"type":"integer"})),
        ("checkpoint_admitted_types",lambda d:d["$defs"]["checkpoint"]["properties"]["admitted_event_types"]["items"]["enum"].pop()),
        ("binding_families",lambda d:d["x-pm-event-authority-binding"]["families"].pop()),
        ("binding_units",lambda d:d["x-pm-event-authority-binding"]["families"][0].__setitem__("semantic_unit","CWR-107")),
        ("binding_source",lambda d:d["x-pm-event-authority-binding"]["families"][0].__setitem__("prepared_source_schema_ref",SOURCE_PATH+"#/$defs/absent")),
        ("projection_closed",lambda d:d["$defs"]["run_projection"].__setitem__("additionalProperties",True)),
        ("binding_adoptions",lambda d:d["x-pm-event-authority-binding"].__setitem__("first_receipt_resolver","storage.unknown.v1")),
    ]:case("projection_schema_failures",check,PROJECTION_PATH,patch)
    case("projection_schema_failures","durable_token_not_nine_field_projection",INDEX_CHECKPOINT_PATH,lambda d:d["$defs"]["read_token"]["required"].remove("frontier_revision"))
    text=read_owner(UNIT_DOC["cw"],root);u=UNITS[EVENT_TYPES[0]]["cw"]
    cases.append(dict(case_id="integrity:owner_unit_missing",target="owner_unit_failures",expected="owner_unit_missing",texts={UNIT_DOC["cw"]:text.replace("plan_unit_id: "+u,"plan_unit_id: CWR-99999")}))
    section=unit_text(UNIT_DOC["cw"],u,root)
    cases.append(dict(case_id="integrity:owner_unit_does_not_name_family",target="owner_unit_failures",expected="owner_unit_does_not_name_family",texts={UNIT_DOC["cw"]:text.replace(section,section.replace(EVENT_TYPES[0],"removed_family"))}))
    before,after=text.split("## 13. Events",1);middle,tail=after.split("## 14.",1)
    cases.append(dict(case_id="integrity:section_13_name_missing",target="owner_unit_failures",expected="section_13_name_missing",texts={UNIT_DOC["cw"]:before+"## 13. Events"+middle.replace(EVENT_TYPES[0],"removed_family")+"## 14."+tail}))
    def row_change(overrides):
        for r in overrides[LEDGER_PATH]["rows"]:r["registry_row_sha256"]=row_sha256(r["registry_row"])
    def rowpatch(check,patch,rehash=True):
        case("ledger_failures",check,LEDGER_PATH,lambda d:patch(d["rows"][0]),row_change if rehash else None)
    case("ledger_failures","ledger_schema",LEDGER_PATH,lambda d:d.__setitem__("schema_version","2.0.0"))
    def reverse(d):
        d["rows"][0],d["rows"][1]=d["rows"][1],d["rows"][0]
        for i,r in enumerate(d["rows"]):
            r["registry_row"]["source_refs"]=[re.sub(re.escape(LEDGER_PATH)+r"#/rows/\d+",LEDGER_PATH+"#/rows/"+str(i),ref) for ref in r["registry_row"]["source_refs"]]
    case("ledger_failures","ledger_order",LEDGER_PATH,reverse,row_change)
    rowpatch("registry_row_schema",lambda r:r["registry_row"].__setitem__("unexpected",True))
    rowpatch("registry_row_sha256",lambda r:r.__setitem__("registry_row_sha256","0"*64),False)
    rowpatch("row_identity",lambda r:r.__setitem__("family_id","event-family-other-family"))
    rowpatch("owner_anchors",lambda r:r["registry_row"].__setitem__("semantic_owner_doc",UNIT_DOC["cw"]+"#CWR-107"))
    rowpatch("payload_schema_ref_resolves",lambda r:r["registry_row"]["payload_schema_ref"].__setitem__("json_pointer","#/$defs/collaboration_started"))
    rowpatch("scope_editions",lambda r:r["registry_row"]["payload_versions"].reverse())
    rowpatch("producer_admission",lambda r:r["registry_row"]["payload_versions"][0].__setitem__("producer_admission","requires_owner_adoption"))
    rowpatch("edition_retention_differs",lambda r:r["registry_row"]["payload_versions"][0]["retention_policy_ref"].__setitem__("policy_id","RP-OTHER"))
    def retention(r):
        r["registry_row"]["retention_policy_ref"]["policy_id"]="RP-OTHER"
        for v in r["registry_row"]["payload_versions"]:v["retention_policy_ref"]["policy_id"]="RP-OTHER"
    rowpatch("retention_policy_ref",retention)
    rowpatch("no_alias",lambda r:r["registry_row"]["legacy"]["aliases"].append({"alias_event_type":"legacy.other","canonical_event_type":"collaboration.created"}))
    rowpatch("row_source_ref_to_ledger",lambda r:r["registry_row"].__setitem__("source_refs",[s for s in r["registry_row"]["source_refs"] if not s.startswith(LEDGER_PATH+"#/rows/")]))
    rowpatch("validation_case_ids_unknown",lambda r:r["validation_case_ids"].append("unknown_case"))
    rowpatch("admitted_without_authority_ref",lambda r:r.update(admission_status="admitted_static_contract",authority_contract_ref=""))
    ledger=load(LEDGER_PATH,root)
    case("registry_membership_failures","prepared_family_in_registry",REGISTRY_PATH,lambda d:d["families"].append(copy.deepcopy(ledger["rows"][0]["registry_row"])))
    def admitted(overrides):
        l=copy.deepcopy(ledger);l["rows"][0].update(admission_status="admitted_static_contract",authority_contract_ref="fixture:authority");overrides[LEDGER_PATH]=l
    case("registry_membership_failures","admitted_ledger_row_missing_from_registry",REGISTRY_PATH,lambda d:None,admitted)
    def differs(d):
        row=copy.deepcopy(ledger["rows"][0]["registry_row"]);row["family_revision"]="2.0.0";d["families"].append(row)
    case("registry_membership_failures","admitted_row_differs_from_prepared",REGISTRY_PATH,differs,admitted)
    case("reference_failures","unresolved_ref",PAYLOAD_PATH,lambda d:d["$defs"]["collaboration_started"]["properties"]["parent_run_id"].__setitem__("$ref",d["$id"]+"#/$defs/absent"))
    def family(d,name):return next(r for r in d["families"] if r["family_id"]==name)
    case("physical_binding_failures","physical_binding",SVR_PATH,lambda d:family(d,"collaboration_run_projection").__setitem__("encoding","json"))
    case("physical_binding_failures","physical_recovery",SVR_PATH,lambda d:family(d,"collaboration_run_projection")["recovery_disposition"].__setitem__("backup_required",True))
    case("physical_binding_failures","source_physical_binding",SVR_PATH,lambda d:family(d,"collaboration_prepared_source").__setitem__("producer",["OtherWriter"]))
    case("physical_binding_failures","physical_keyed_composition",PROJECTION_PATH,lambda d:d["x-pm-keyed-composition"]["members"][0].__setitem__("key_shape","unknown"))
    fx=load(FIXTURE_PATH,root)
    used={c["payload_case_id"] for c in fx["valid_events"]}
    unused=next(i for i,c in enumerate(fx["payloads"]) if c["case_id"] not in used)
    for check,patch in [
        ("numeric_canonical",lambda f:f["numeric_vectors"][0].__setitem__("canonical","wrong")),
        ("numeric_identity",lambda f:f["numeric_family_cases"][0]["alternate_payload"].__setitem__("definition_revision",2.0)),
        ("positive_payload",lambda f:f["payloads"][unused]["payload"].__setitem__("unexpected",True)),
        ("negative_payload_layer",lambda f:f["invalid_payloads"][0].__setitem__("first_failing_layer","wrong_layer")),
        ("valid_event",lambda f:f["valid_events"][0]["record"].__setitem__("event_type","unknown.event")),
        ("invalid_event_join",lambda f:f["invalid_events"][0].__setitem__("join","wrong_layer")),
        ("identity_vector",lambda f:f["identity_vectors"][0]["expected"].__setitem__("event_id","evt_collaboration_"+"0"*64)),
        ("new_epoch_reuses_key",lambda f:next(v for v in f["identity_vectors"] if "prior_epoch_idempotency_key" in v).__setitem__("prior_epoch_idempotency_key",next(v for v in f["identity_vectors"] if "prior_epoch_idempotency_key" in v)["expected"]["idempotency_key"])),
        ("transition",lambda f:f["transition_sequences"][0]["steps"][0].__setitem__("expected","conflict:wrong")),
        ("final_state",lambda f:f["transition_sequences"][0]["final_state"].__setitem__("lifecycle_seq",999)),
        ("transition_case",lambda f:f["transition_cases"][0].__setitem__("expected",None)),
        ("transition_valid_counterpart",lambda f:f["transition_cases"][0]["valid_value"].__setitem__("thread_id","wrong_thread")),
        ("prepared_source",lambda f:f["prepared_sources"][0]["value"].__setitem__("semantic_sha256","0"*64)),
        ("prepared_event",lambda f:f["prepared_sources"][0]["event"]["payload"].__setitem__("currentness_hash","0"*64)),
        ("checkpoint_semantics",lambda f:f["projection_values"][0]["value"].__setitem__("storage_instance_id","00000000-0000-4000-8000-000000000000")),
        ("projection_value",lambda f:next(c for c in f["projection_values"] if c["definition"]=="run_projection")["value"].__setitem__("unexpected",True)),
        ("invalid_projection_value_accepted",lambda f:next(c for c in f["invalid_projection_values"] if c["case_id"]=="run_row_unknown_status")["value"].__setitem__("lifecycle_status","active")),
        ("family_case_floor",lambda f:f["identity_vectors"].pop(0)),
        ("native_status",lambda f:f["required_native_oracles"][0].__setitem__("status","PASS")),
    ]:case("fixture_report",check,FIXTURE_PATH,patch)
    def invalid_sequence(f):
        seq=f["transition_sequences"][0];seq["steps"]=seq["steps"][:2];seq.pop("final_state",None);step=copy.deepcopy(seq["steps"][-1]);step["payload"]["idempotency_key"]="wrong";seq["steps"].append(step)
    case("fixture_report","sequence_payload_invalid",FIXTURE_PATH,invalid_sequence)
    case("ats_failures","ats_case_ids",LEDGER_PATH,lambda d:d["rows"][0]["validation_case_ids"].append("not_cited_in_owner"))
    case("probe_failures","contract_probe",FIXTURE_PATH,lambda f:f["transition_cases"][0].__setitem__("expected",None))
    return cases


def evaluate_integrity(case, root=ROOT, namespace=None):
    ns=namespace if namespace is not None else globals()
    original_load=ns["load"];original_read=ns["read_owner"]
    overrides=case.get("overrides",{});texts=case.get("texts",{})
    ns["load"]=lambda path,where=root:overrides[path] if path in overrides else original_load(path,where)
    ns["read_owner"]=lambda path,where=root:texts[path] if path in texts else original_read(path,where)
    for name in ("validator","schema_registry","schema_bases","doc_units"):ns[name].cache_clear()
    try:
        result=ns[case["target"]](root)
        if isinstance(result,tuple):result=result[0]
        if isinstance(result,dict):result=result["failures"]
        return [e["check"] for e in result]
    finally:
        ns["load"]=original_load;ns["read_owner"]=original_read
        for name in ("validator","schema_registry","schema_bases","doc_units"):ns[name].cache_clear()


def integrity_failures(root=ROOT):
    failures=[]
    for case in integrity_cases(root):
        checks=evaluate_integrity(case,root)
        if set(checks)!={case["expected"]}:
            failures.append({"check":"integrity_oracle","case_id":case["case_id"],"expected":case["expected"],"found":checks})
    return failures


def integrity_guard_removal_report(root=ROOT):
    source=Path(__file__).read_text();cases=integrity_cases(root);table=[]
    for case in cases:
        tree=ast.parse(source);wanted=case["expected"]
        class Remove(ast.NodeTransformer):
            def visit_Expr(self,node):
                if isinstance(node.value,ast.Call) and isinstance(node.value.func,ast.Attribute) and node.value.func.attr=="append" and node.value.args and isinstance(node.value.args[0],ast.Dict):
                    d=node.value.args[0]
                    if any(isinstance(k,ast.Constant) and k.value=="check" and isinstance(v,ast.Constant) and v.value==wanted for k,v in zip(d.keys,d.values)):
                        return ast.copy_location(ast.Pass(),node)
                return self.generic_visit(node)
        tree=Remove().visit(tree);ast.fix_missing_locations(tree)
        ns={"__name__":"pm_collab_integrity_mutant","__file__":__file__};exec(compile(tree,__file__,"exec"),ns)
        flipped=[];stayed=[];masked=[];changed=[]
        for other in cases:
            if other["target"]!=case["target"]:
                stayed.append(other["case_id"]);continue
            found=evaluate_integrity(other,root,ns)
            if other["case_id"]==case["case_id"]:
                (masked if found else flipped).append(other["case_id"])
            elif set(found)=={other["expected"]}:stayed.append(other["case_id"])
            else:changed.append(other["case_id"])
        table.append(dict(guard="integrity:"+case["target"]+":"+wanted,negatives_that_flip=flipped,negatives_that_stay_rejected=stayed,masked=masked,unexpected_changes=changed,status="pass" if flipped and not masked and not changed else "fail"))
    return table



def schema_guard_removal_report(root=ROOT):
    """Mutation proof at the same shape gate used by the full payload/projection/source checkers.

    A lexical invariant includes its regex and exact-length clauses. Removing only one
    of equivalent length clauses is not removal of that invariant. Required members
    remain separate rules, including the Review pack and hashes.
    """
    fx=load(FIXTURE_PATH,root)
    cases=[]
    for c in fx["invalid_payloads"]:
        if c["first_failing_layer"]=="schema":cases.append((c["case_id"],PAYLOAD_PATH,payload_def(c["event_type"],edition_of(c["payload"])),c["payload"]))
    for p in contract_probes(root,include_shapes=False):
        if p["domain"]=="payload" and p["expected"]=="schema" and ":lf:" in p["case_id"]:
            cases.append((p["case_id"],PAYLOAD_PATH,payload_def(p["event_type"],edition_of(p["value"])),p["value"]))
    for c in fx.get("schema_cases",[]):cases.append((c["case_id"],c["path"],c["definition"],schema_case_value(c,root)))
    for c in fx["invalid_projection_values"]:cases.append((c["case_id"],PROJECTION_PATH,c["definition"],c["value"]))
    def leaves(value,path=()):
        if isinstance(value,dict):
            for k,v in value.items():yield from leaves(v,path+(k,))
        elif isinstance(value,list):
            for i,v in enumerate(value):yield from leaves(v,path+(i,))
        elif isinstance(value,str):yield path,value
    for c in fx["projection_values"]:
        for path,value in leaves(c["value"]):
            bad=copy.deepcopy(c["value"]);node=bad
            for key in path[:-1]:node=node[key]
            node[path[-1]]=value+"\n"
            cases.append((c["case_id"]+":lf:"+"/".join(map(str,path)),PROJECTION_PATH,c["definition"],bad))
    # Map validator error dictionaries back to the canonical schema node they actually evaluated.
    documents={p:load(p,root) for p in (PAYLOAD_PATH,PROJECTION_PATH,SOURCE_PATH,CWC_PATH,INDEX_CHECKPOINT_PATH,EVENT_RECORD_PATH,LEDGER_SCHEMA_PATH,"Plans/application_workflow_contracts.schema.json","Plans/shared_integration_runtime.schema.json")}
    identities={}
    def index(node,path,pointer=()):
        if isinstance(node,dict):
            identities[id(node)]=(path,pointer)
            for k,v in node.items():index(v,path,pointer+(k,))
        elif isinstance(node,list):
            for i,v in enumerate(node):index(v,path,pointer+(i,))
    for path,doc in documents.items():index(doc,path)
    def errors(case):
        _,path,definition,value=case
        return list(validator(load(path,root)["$id"],"#/$defs/"+definition,root).iter_errors(value))
    groups={};baseline_errors={}
    for case in cases:
        es=errors(case);baseline_errors[case[0]]=es
        if not es:raise AssertionError("schema negative accepted: "+case[0])
        rules=[]
        for e in es:
            path,pointer=identities[id(e.schema)]
            keyword=e.validator
            member=None
            if keyword=="required":member=e.message.split("'")[1]
            if keyword in ("pattern","minLength","maxLength"):keyword="lexical"
            rules.append((path,pointer,keyword,member))
        # All failures must describe one changed field, not several missing independent members.
        key=tuple(sorted(set(rules),key=str));groups.setdefault(key,[]).append(case)
    original_load=load;table=[]
    try:
        for rules,own in groups.items():
            overrides={}
            for path,pointer,keyword,member in rules:
                if path not in overrides:overrides[path]=copy.deepcopy(documents[path])
                node=overrides[path]
                for key in pointer:node=node[key]
                if keyword=="lexical":
                    for k in ("pattern","minLength","maxLength"):node.pop(k,None)
                elif keyword=="required":node["required"].remove(member)
                else:node.pop(keyword,None)
            def replacement(path,where=root):return overrides[path] if path in overrides else original_load(path,where)
            globals()["load"]=replacement;validator.cache_clear();schema_registry.cache_clear()
            flipped=[];stayed=[];masked=[];unexpected=[]
            own_ids={case[0] for case in own}
            def affected(error):
                path,ptr=identities[id(error.schema)]
                for rp,rptr,key,member in rules:
                    if path==rp and ptr==rptr:
                        if key=="lexical" and error.validator in ("pattern","minLength","maxLength"):return True
                        if key==error.validator and (key!="required" or member==error.message.split("'")[1]):return True
                return any(affected(e) for e in error.context)
            for case in cases:
                prior=baseline_errors[case[0]]
                # The identical assertion sees the identical value: its unchanged rejection is a witness.
                if case[0] not in own_ids and any(not affected(e) for e in prior):
                    stayed.append(case[0]);continue
                es=errors(case)
                if case[0] in own_ids:
                    (masked if es else flipped).append(case[0])
                elif es:stayed.append(case[0])
                else:
                    # Every original error depended on the removed invariant (including reference/union contexts).
                    flipped.append(case[0])
            table.append({"guard":"schema:"+";".join(path+"#/"+"/".join(map(str,ptr))+":"+key+(":"+member if member else "") for path,ptr,key,member in rules),"negatives_that_flip":flipped,"negatives_that_stay_rejected":stayed,"masked":masked,"unexpected_changes":unexpected,"status":"pass" if flipped and not masked and not unexpected else "fail"})
            globals()["load"]=original_load;validator.cache_clear();schema_registry.cache_clear()
    finally:
        globals()["load"]=original_load;validator.cache_clear();schema_registry.cache_clear()
    return table



def guard_removal_report(root=ROOT):
    """Remove a rejection branch in an isolated module; never alter the installed checker."""
    source = Path(__file__).read_text()
    tree = ast.parse(source)
    guards=[]
    checked={"read_token_rejection","payload_rejection","envelope_rejection","representation_rejection","reference_rejection","retention_rejection","prepared_event_rejection","checkpoint_rejection","source_rejection","historical_rejection","admission_rejection","transition_rejection","family_rejection"}

    def walk(node, function=""):
        if isinstance(node,ast.FunctionDef): function=node.name
        if isinstance(node,ast.If) and function in checked and len(node.body)==1 and isinstance(node.body[0],ast.Return):
            ret=node.body[0].value
            if isinstance(ret,ast.Constant) and isinstance(ret.value,str) and ret.value not in ("appended","exact_retry"):
                if not (function=="payload_rejection" and ret.value=="schema") and ret.value not in ("checkpoint_schema","source_schema"):
                    guards.append((function,node.lineno,node.body[0].lineno,ret.value))
        for child in ast.iter_child_nodes(node):walk(child,function)
    walk(tree)
    probes=contract_probes(root,include_shapes=False)
    negatives=[p for p in probes if p["expected"] is not None]
    baseline={}
    traces={}
    wanted_lines={r[2] for r in guards}
    for probe in negatives:
        if probe["expected"] in ("schema","checkpoint_schema","source_schema"):
            # The shape gate is independently mutated in the schema layer below.
            baseline[probe["case_id"]]=probe["expected"];traces[probe["case_id"]]=set()
            continue
        reached=set()
        def trace(frame,event,arg):
            if frame.f_code.co_filename!=__file__: return None
            if event=="line" and frame.f_code.co_filename==__file__ and frame.f_lineno in wanted_lines:
                reached.add(frame.f_lineno)
            return trace
        sys.settrace(trace)
        try: baseline[probe["case_id"]]=evaluate_probe(probe,root)
        finally: sys.settrace(None)
        traces[probe["case_id"]]=reached
        if baseline[probe["case_id"]]!=probe["expected"]:
            raise AssertionError("invalid baseline negative: "+probe["case_id"]+":"+str(baseline[probe["case_id"]]))
    table=[]
    for function,line,return_line,reason in guards:
        mutated=ast.parse(source)
        for n in ast.walk(mutated):
            if isinstance(n,ast.If) and n.lineno==line:n.test=ast.Constant(False)
        ast.fix_missing_locations(mutated)
        namespace={"__name__":"pm_collab_guard_mutant","__file__":str(Path(__file__))}
        exec(compile(mutated,str(Path(__file__)),"exec"),namespace)
        flipped=[];other=[];masked=[];changed=[]
        for p in negatives:
            if return_line not in traces[p["case_id"]]:
                other.append(p["case_id"])
                continue
            try:
                if function=="reference_rejection" and p["domain"]=="envelope":
                    got=namespace["reference_rejection"](p["value"]["payload_ref"],p.get("payload_store",{}).get(p["value"]["payload_ref"]))
                elif function=="representation_rejection" and p["domain"]=="envelope":
                    got=namespace["representation_rejection"](p["value"])
                else:got=namespace["evaluate_probe"](p,root)
            except Exception as e:got="exception:"+type(e).__name__
            if got is None:flipped.append(p["case_id"])
            else:masked.append({"case_id":p["case_id"],"remaining":got})
        print(function+":"+str(line)+":"+reason+f" flips={len(flipped)} masked={len(masked)}", file=sys.stderr)
        table.append({"guard":function+":"+str(line)+":"+reason,"negatives_that_flip":flipped,"negatives_that_stay_rejected":other,"masked":masked,"unexpected_changes":changed,"status":"pass" if flipped and not masked and not changed else "fail"})
    table += schema_guard_removal_report(root)
    table += integrity_guard_removal_report(root)
    negative_ids=sorted({case for row in table for case in row["negatives_that_flip"]+row["negatives_that_stay_rejected"]})
    manifests={layer:sorted({case for row in table if ("schema" if row["guard"].startswith("schema:") else "integrity" if row["guard"].startswith("integrity:") else "decision")==layer for case in row["negatives_that_flip"]+row["negatives_that_stay_rejected"]}) for layer in ("decision","schema","integrity")}
    for row in table:
        row["layer"]="schema" if row["guard"].startswith("schema:") else "integrity" if row["guard"].startswith("integrity:") else "decision"
        stayed=row["negatives_that_stay_rejected"]
        row["negatives_that_stay_rejected"]={"count":len(stayed),"case_ids_sha256":row_sha256(sorted(stayed)),"selection":"the layer's negative-case manifest minus negatives_that_flip; masked/unexpected lists must be empty"}
    return {"status":"pass" if all(r["status"]=="pass" for r in table) else "fail","claim_boundary":"Read-only decision, shape and integrity gates used by the full checker; no native decode/commit, token authentication, source provenance or admission is proved.","negative_case_ids":negative_ids,"negative_case_manifests":manifests,"guards":table}



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

    used={c["payload_case_id"] for c in fx["valid_events"]}
    unused=next(i for i,c in enumerate(fx["payloads"]) if c["case_id"] not in used)
    expect_fail("positive_payload_with_text_field", lambda f: f["payloads"][unused]["payload"].__setitem__("name", "text"), "positive_payload")
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
    results["integrity_oracles"]=not integrity_failures(root)
    import contextlib,io
    original_load=load
    defective=copy.deepcopy(fx);defective["transition_sequences"][0]["steps"][0]["expected"]="conflict:wrong"
    globals()["load"]=lambda path,where=root:defective if path==FIXTURE_PATH else original_load(path,where)
    try:
        with contextlib.redirect_stdout(io.StringIO()):exit_code=main([])
        results["failure_cli_rejects_success_exit"]=exit_code==1
    finally:
        globals()["load"]=original_load
        for cached in (validator,schema_registry,schema_bases,doc_units):cached.cache_clear()
    return {"status": "pass" if all(results.values()) else "fail", "scenarios": results}


def main(argv: list[str] | None = None) -> int:
    ap = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    ap.add_argument("--guard-removal", action="store_true")
    ap.add_argument("--self-test", action="store_true")
    ap.add_argument("--json", action="store_true", help="print the full report")
    a = ap.parse_args(argv)
    rep = guard_removal_report() if a.guard_removal else self_test() if a.self_test else validate()
    if a.json or a.self_test or a.guard_removal:
        print(json.dumps(rep, indent=2, sort_keys=True))
    else:
        print(json.dumps({k: rep[k] for k in ("status", "families", "prepared_rows", "admitted_families", "counts", "admission_blockers")} | {"failure_count": len(rep["failures"]), "first_failures": rep["failures"][:10]}, indent=2, sort_keys=True))
    return 0 if rep["status"] == "pass" else 1


if __name__ == "__main__":
    sys.exit(main())
