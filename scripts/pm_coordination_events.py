#!/usr/bin/env python3
"""Static coordination event contract checks, never native authority or admission.

The seven coordination agent families (OSI-438, CV-353, SP-320; newly authored owner
contracts under DL-045) and the prepared, not admitted, coordination.debug_mirror_exported
payload. This checker validates the closed payload schema, the projection and checkpoint
schema and its binding record, the admission ledger and the final registry rows it prepares,
the two materialized Storage value registry rows, and every fixture expectation. It also
checks that no coordination family is in Plans/event_family_registry.json unless its ledger
row is admitted_static_contract with exactly the prepared row.

A pass is static contract consistency only. It authenticates no producer, reads no seglog or
redb bytes, admits no family, moves no checkpoint and proves nothing native: the producers,
the crash detector, the append path, the projector and the readers remain NOT_RUN.
"""

from __future__ import annotations

import base64
import copy
import datetime as dt
import hashlib
import importlib.util
import json
import re
from functools import lru_cache
from pathlib import Path
from typing import Any

from jsonschema import Draft202012Validator, FormatChecker
from referencing import Registry, Resource


ROOT = Path(__file__).resolve().parents[1]
PAYLOAD_PATH = "Plans/coordination_event_payloads.schema.json"
PAYLOAD_SCHEMA_URI = "https://puppetmaster.local/schemas/coordination_event_payloads/1.0.0/coordination_event_payloads.schema.json"
PROJECTION_PATH = "Plans/coordination_projection_contracts.schema.json"
PROJECTION_SCHEMA_URI = "https://puppetmaster.local/schemas/coordination_projection_contracts/1.0.0/coordination_projection_contracts.schema.json"
GENERIC_PATH = "Plans/event_record_index_checkpoint.schema.json"
GENERIC_CURSOR_REF = ("https://puppetmaster.local/schemas/event_record_index_checkpoint/1.0.0/schema.json"
                      "#/$defs/coverage/properties/last_frame")
ENVELOPE_PATH = "Plans/event_record.schema.json"
LEDGER_PATH = "Plans/coordination_event_admission.json"
LEDGER_SCHEMA_PATH = "Plans/coordination_event_admission.schema.json"
FIXTURE_PATH = "Plans/coordination_event_contract_fixtures.json"
REGISTRY_PATH = "Plans/event_family_registry.json"
REGISTRY_SCHEMA_PATH = "Plans/event_family_registry.schema.json"
SVR_PATH = "Plans/storage_value_registry.json"
ATS_PATH = "Plans/Automated_Testing_System.md"
SEARCH_REPORT = "reports/event-authority-20260911/step-09-coordination-binding-search-20260925.md"
SEMANTIC_OWNER_DOC = "Plans/orchestrator-subagent-integration.md#coordination-event-authority-dl-045-2026-09-25"
PAYLOAD_OWNER_DOC = "Plans/Contracts_V0.md#closed-coordination-payload-schema-dl-045-2026-09-25"
STORAGE_OWNER_DOC = "Plans/storage-plan.md#coordination-event-persistence-binding-dl-045-2026-09-25"
MIRROR_OWNER_DOC = "Plans/storage-plan.md#coordination-record-projection-and-mirror-export-families"
SP320 = "Plans/storage-plan.md#SP-320"
VERSION = "1.0.0"
PREPARED = "prepared_not_admitted"
ADMITTED = "admitted_static_contract"
RETENTION_REF = {"registry_schema_id": "pm.storage_value_registry.v2", "policy_id": "RP-COORDINATION-180D", "policy_version": VERSION}
RECORD_FAMILY = "coordination_event_records"
PROJECTION_FAMILY = "coordination_read_model_projections"
APPEND = "storage.coordination_append.v1@" + VERSION
PROJECTOR = "storage.coordination_projector.v1"
READERS = [
    "storage.coordination_reader.scheduler.v1@1.0.0",
    "storage.coordination_reader.agent_coordinator.v1@1.0.0",
    "storage.coordination_reader.prompt_context.v1@1.0.0",
    "storage.coordination_reader.mirror_export.v1@1.0.0",
    "storage.coordination_reader.inspection.v1@1.0.0",
]
# (event type, payload definition, AgentCoordinator entry point); order is the ledger row order.
FAMILIES = (
    ("coordination.agent_registered", "agent_registered", "AgentCoordinator.register_agent(RegisterAgent)"),
    ("coordination.agent_status_updated", "agent_status_updated", "AgentCoordinator.update_status(AgentStatusUpdate)"),
    ("coordination.agent_operation_updated", "agent_operation_updated", "AgentCoordinator.update_operation(AgentOperationUpdate)"),
    ("coordination.agent_file_ownership_updated", "agent_file_ownership_updated",
     "AgentCoordinator.update_file_ownership(AgentFileOwnershipUpdate)"),
    ("coordination.agent_unregistered", "agent_unregistered", "AgentCoordinator.unregister_agent(AgentTerminalUpdate)"),
    ("coordination.agent_crashed", "agent_crashed", "AgentCoordinator.record_crash(AgentCrashResolution)"),
    ("coordination.agent_aborted", "agent_aborted", "AgentCoordinator.record_abort(AgentAbortResolution)"),
)
SEVEN = tuple(event_type for event_type, _definition, _entry in FAMILIES)
MIRROR = "coordination.debug_mirror_exported"
TERMINAL = ("coordination.agent_unregistered", "coordination.agent_crashed", "coordination.agent_aborted")
DEF_BY_TYPE = {event_type: definition for event_type, definition, _entry in FAMILIES}
DEF_BY_TYPE[MIRROR] = "debug_mirror_exported"
FAMILY_TIME = {
    "coordination.agent_registered": "started_at_utc",
    "coordination.agent_status_updated": "observed_at_utc",
    "coordination.agent_operation_updated": "observed_at_utc",
    "coordination.agent_file_ownership_updated": "observed_at_utc",
    "coordination.agent_unregistered": "finished_at_utc",
    "coordination.agent_crashed": "detected_at_utc",
    "coordination.agent_aborted": "aborted_at_utc",
}
LINEAGE_FIXED = ("project_id", "run_id", "platform")
LINEAGE_OPTIONAL = ("thread_id", "agent_type", "parent_run_id", "child_run_id", "node_id", "lane_id", "worktree_id")
# CV-353 rule 8 joins that name the family: its timestamp, its payload schema ID and its event ID recipe. Each family's
# own valid EventRecord carries a negative for each of them (ATS-058).
FAMILY_EVENT_JOINS = ("occurred_at_join", "payload_schema_id", "identity_recipe")
# The Contracts lineage envelope and payload rows (Plans/Contracts_V0.md, "Stable active-agent coordination
# event families"): required fields, then optional ("?") fields. CV-353 rule 1: apart from schema_version no
# row gains a field; rule 2: agent_revision is required for the seven agent families.
ENVELOPE_REQUIRED = ("project_id", "run_id", "agent_id", "platform", "idempotency_key")
ENVELOPE_OPTIONAL = ("thread_id", "agent_type", "parent_run_id", "child_run_id", "node_id", "lane_id", "worktree_id",
                     "agent_revision", "expected_previous_revision", "last_applied_event_id")
ROW_FIELDS = {
    "agent_registered": (("project_id", "run_id", "agent_id", "agent_type", "platform", "started_at_utc", "agent_revision",
                          "idempotency_key"),
                         ("thread_id", "parent_run_id", "child_run_id", "node_id", "lane_id", "worktree_id", "model_id")),
    "agent_status_updated": (("status", "observed_at_utc", "agent_revision"), ("status_reason", "expected_previous_revision")),
    "agent_operation_updated": (("operation_id", "operation_summary", "observed_at_utc"), ("progress_pct", "operation_refs")),
    "agent_file_ownership_updated": (("path_ref", "path_hash", "claim_kind", "claim_confidence", "observed_at_utc"), ("operation_id",)),
    "agent_unregistered": (("terminal_status", "finished_at_utc"), ("result_ref",)),
    "agent_crashed": (("crash_reason", "detected_at_utc"), ("heartbeat_age_ms", "process_ref", "worktree_ref")),
    "agent_aborted": (("abort_reason", "aborted_by_ref", "aborted_at_utc"), ()),
    "debug_mirror_exported": (("project_id", "mirror_path", "mirror_kind", "source_checkpoint", "source_sequence_id",
                               "export_status", "exported_at_utc"), ("error_code", "quarantine_ref")),
}
# OSI-438 "Closed domains" and CV-353 rule 7.
CLOSED_DOMAINS = {
    ("agent_status_updated", "status"): ["queued", "running", "awaiting_parent", "blocked"],
    ("agent_unregistered", "terminal_status"): ["complete", "failed", "cancelled"],
    ("agent_crashed", "crash_reason"): ["process_exit", "heartbeat_expired", "process_lost", "worktree_lost"],
    ("agent_aborted", "abort_reason"): ["parent", "user", "runtime"],
    ("agent_file_ownership_updated", "claim_kind"): ["editing", "reviewing", "generated_output", "read_dependency"],
    ("agent_file_ownership_updated", "claim_confidence"): ["high", "medium"],
}
# CV-353 rule 5 (review repair CP-01): platform is the effective runtime platform ID that the Orchestrator takes
# from node_config.platform (OSI-258), as Plans/Models_System.md section 1.2 names runtime platforms. It is
# bounded by form only; no list of platforms is closed. Cycle-2 residual R4-01: the form admits hyphens, so both
# the tokens (antigravity_cli, zai_coding_plan) and the surface and provider-entry IDs (antigravity-cli,
# zai-coding-plan, zhipuai-coding-plan) that Plans/Models_System.md names are accepted.
PLATFORM_ID = {"type": "string", "minLength": 1, "maxLength": 256, "pattern": "^[a-z][a-z0-9_-]*$"}
# SP-320 path_ref and CV-353 rule 5 (review repair CP-08): a normalized project-relative path; no ".", ".." or empty
# segment, and no Windows drive, home-relative or backslash (UNC) path, the shapes mirror_path and non_secret_ref
# already reject.
PATH_REF = {"type": "string", "minLength": 1, "maxLength": 1024,
            "pattern": r"^(?![A-Za-z]:[\\/])(?![~\\])(?!\.{1,2}(?:/|$))(?![\s\S]*/\.{1,2}(?:/|$))[^/]+(?:/[^/]+)*$"}
PROJECTION_MEMBERS = ("agent_projection", "file_projection", "operation_projection", "snapshot_projection", "checkpoint")
PROJECTION_SCHEMA_IDS = {
    "agent_projection": "pm.storage_value.coordination_agent_projection.v1",
    "file_projection": "pm.storage_value.coordination_file_projection.v1",
    "operation_projection": "pm.storage_value.coordination_operation_projection.v1",
    "snapshot_projection": "pm.storage_value.coordination_snapshot_projection.v1",
    "checkpoint": "pm.storage_value.coordination_projector_checkpoint.v1",
}
LIVE_SNAPSHOT_FENCE = "redb_snapshot_id"
CLAIM_BOUNDARY = (
    "Static schema, ledger, registry-row, Storage-row and synthetic fixture checks only. No family is admitted, no "
    "checkpoint or pin moves, and no native producer, crash detector, append path, projector, reader, durability, "
    "security, readiness, currentness or seal is proved."
)


def load(path: str, root: Path = ROOT) -> Any:
    return json.loads((root / path).read_text(encoding="utf-8"))


def canonical(value: Any) -> str:
    """The DL-077 canonical JSON: keys sorted, ',' and ':' separators, ensure_ascii=False."""
    return json.dumps(value, sort_keys=True, separators=(",", ":"), ensure_ascii=False)


def row_sha256(value: Any) -> str:
    return hashlib.sha256(canonical(value).encode("utf-8")).hexdigest()


def b64url(text: str) -> str:
    return base64.urlsafe_b64encode(text.encode("utf-8")).decode("ascii").rstrip("=")


def scope_partition(project_id: str) -> str:
    """SP-320 checkpoint scope_partition: project~{base64url_no_pad(UTF8(project_id))}."""
    return "project~" + b64url(project_id)


def family_id_of(event_type: str) -> str:
    return "event-family-" + event_type.replace(".", "-").replace("_", "-")


def resolve_pointer(document: Any, ref: str) -> Any:
    value = document
    for token in ref.split("#", 1)[-1].strip("/").split("/"):
        if token:
            token = token.replace("~1", "/").replace("~0", "~")
            value = value[int(token)] if isinstance(value, list) else value[token]
    return value


# --- Identity, path and payload rules (SP-320, CV-353) -------------------------------------------------------


def idempotency_key(event_type: str, project_id: str, agent_id: str, recovery_epoch: int, agent_revision: int) -> str:
    """SP-320: coordination:{event_type}:{project_id}:{agent_id}:{recovery_epoch}:{agent_revision}, both in base 10.

    The recovery epoch is the one the prepared event keeps for every retry, the same one its event ID uses
    (review repair CP-02)."""
    return f"coordination:{event_type}:{project_id}:{agent_id}:{recovery_epoch}:{agent_revision}"


def key_recovery_epoch(key: str) -> int | None:
    """The key's recovery epoch: its second-to-last colon field, base 10 without sign or leading zeros."""
    parts = key.rsplit(":", 2)
    if len(parts) != 3 or not re.fullmatch(r"0|[1-9][0-9]*", parts[1]):
        return None
    return int(parts[1])


def event_id_preimage(storage_instance_id: str, recovery_epoch: int, project_id: str, event_type: str,
                      agent_id: str, agent_revision: int) -> str:
    """RFC 8785 form of a JSON array of strings (equal to this json.dumps form for strings)."""
    return json.dumps([storage_instance_id, str(recovery_epoch), project_id, event_type, agent_id, str(agent_revision)],
                      separators=(",", ":"), ensure_ascii=False)


def event_id(storage_instance_id: str, recovery_epoch: int, project_id: str, event_type: str, agent_id: str,
             agent_revision: int) -> str:
    """SP-320: evt_coordination_ + lowercase hex SHA-256 of the RFC 8785 identity array."""
    material = event_id_preimage(storage_instance_id, recovery_epoch, project_id, event_type, agent_id, agent_revision)
    return "evt_coordination_" + hashlib.sha256(material.encode("utf-8")).hexdigest()


def path_hash(path_ref: str) -> str:
    """SP-320: lowercase hex SHA-256 of the UTF-8 bytes of path_ref."""
    return hashlib.sha256(path_ref.encode("utf-8")).hexdigest()


def normalize_observed_path(worktree_root: str, observed: str) -> str | None:
    """Lexical form of SP-320's path_ref recipe (no file system, so no symbolic links).

    Returns None when the path leaves the worktree: that observation produces no claim. Cycle-2 residual R4-03
    (SP-320 step 5): a result that begins with "~" or "\\", or with a letter, a colon and "/" or "\\", also
    produces no claim, because CV-353's path_ref form rejects it as a home, drive or UNC path.
    """
    root = worktree_root.rstrip("/")
    path = observed
    if path.startswith("/"):
        if path != root and not path.startswith(root + "/"):
            return None
        path = path[len(root):]
    segments: list[str] = []
    for segment in path.split("/"):
        if segment in ("", "."):
            continue
        if segment == "..":
            if not segments:
                return None
            segments.pop()
            continue
        segments.append(segment)
    if len(segments) >= 3 and segments[0] == ".puppet-master" and segments[1] == "worktrees":
        segments = segments[3:]
    if not segments:
        return None
    result = "/".join(segments)
    if re.match(r"[~\\]|[A-Za-z]:[\\/]", result):
        return None
    return result if len(result) <= 1024 else None


def valid_utc(value: Any) -> bool:
    """CV-353 rule 5: an RFC 3339 UTC timestamp ending in Z that names a real calendar instant."""
    if not isinstance(value, str):
        return False
    match = re.fullmatch(r"([0-9]{4})-([0-9]{2})-([0-9]{2})T([0-9]{2}):([0-9]{2}):([0-9]{2})(?:\.[0-9]{1,9})?Z", value)
    if not match:
        return False
    try:
        dt.datetime(*(int(part) for part in match.groups()))
    except ValueError:
        return False
    return True


def static_payload_rejection(event_type: str, payload: dict[str, Any]) -> str | None:
    """The CV-353 and SP-320 cross-field rules a JSON Schema cannot state. Runs after schema validation."""
    for field in ("started_at_utc", "observed_at_utc", "finished_at_utc", "detected_at_utc", "aborted_at_utc", "exported_at_utc"):
        if field in payload and not valid_utc(payload[field]):
            return "valid_utc_datetime"
    if event_type == MIRROR:
        return None
    epoch = key_recovery_epoch(payload["idempotency_key"])
    if epoch is None or payload["idempotency_key"] != idempotency_key(event_type, payload["project_id"], payload["agent_id"], epoch,
                                                                      payload["agent_revision"]):
        return "identity_recipe"
    if event_type == "coordination.agent_file_ownership_updated" and payload["path_hash"] != path_hash(payload["path_ref"]):
        return "path_hash_recipe"
    if event_type == "coordination.agent_aborted" and payload["abort_reason"] == "parent":
        if payload["aborted_by_ref"] != "run:" + payload.get("parent_run_id", ""):
            return "abort_ref_join"
    return None


def producer_digest(event_type: str, payload: dict[str, Any]) -> str:
    """Fixture producer semantic digest: SHA-256 of the canonical JSON {event_type, payload}."""
    return hashlib.sha256(canonical({"event_type": event_type, "payload": payload}).encode("utf-8")).hexdigest()


# --- Schema resources -------------------------------------------------------------------------------------------


@lru_cache(maxsize=4)
def schema_registry(root: Path = ROOT) -> Registry:
    """Offline registry of the owner schema documents by $id; no remote retrieval."""
    documents = [load(path, root) for path in (PAYLOAD_PATH, PROJECTION_PATH, GENERIC_PATH, REGISTRY_SCHEMA_PATH, LEDGER_SCHEMA_PATH)]
    return Registry().with_resources([(document["$id"], Resource.from_contents(document)) for document in documents]).crawl()


@lru_cache(maxsize=64)
def definition_validator(document_uri: str, definition: str, root: Path = ROOT) -> Draft202012Validator:
    """Validator for one $defs entry; format is not asserted (calendar validity is valid_utc)."""
    schema = {"$schema": "https://json-schema.org/draft/2020-12/schema", "$ref": f"{document_uri}#/$defs/{definition}"}
    return Draft202012Validator(schema, registry=schema_registry(root))


def payload_valid(event_type: str, payload: Any, root: Path = ROOT) -> bool:
    return definition_validator(PAYLOAD_SCHEMA_URI, DEF_BY_TYPE[event_type], root).is_valid(payload)


def projection_valid(definition: str, value: Any, root: Path = ROOT) -> bool:
    return definition_validator(PROJECTION_SCHEMA_URI, definition, root).is_valid(value)


def payload_rejection(event_type: str, payload: Any, root: Path = ROOT) -> str | None:
    """First failing check layer of CV-353 for one payload: schema, then the static rules."""
    if event_type not in DEF_BY_TYPE:
        return "unknown_event_type"
    if not payload_valid(event_type, payload, root):
        return "schema"
    return static_payload_rejection(event_type, payload)


def null_admitting_nodes(node: Any, path: str = "#") -> list[str]:
    """CV-353 rule 3: no payload definition admits null."""
    found: list[str] = []
    if isinstance(node, dict):
        kind = node.get("type")
        if kind == "null" or (isinstance(kind, list) and "null" in kind):
            found.append(path + "/type")
        if "const" in node and node["const"] is None:
            found.append(path + "/const")
        if isinstance(node.get("enum"), list) and None in node["enum"]:
            found.append(path + "/enum")
        for key, value in node.items():
            found.extend(null_admitting_nodes(value, path + "/" + key))
    elif isinstance(node, list):
        for index, value in enumerate(node):
            found.extend(null_admitting_nodes(value, f"{path}/{index}"))
    return found


def payload_schema_failures(*, root: Path = ROOT) -> list[dict[str, Any]]:
    """CV-353: the closed payload schema, one definition per coordination row."""
    payloads = load(PAYLOAD_PATH, root)
    failures: list[dict[str, Any]] = []
    try:
        Draft202012Validator.check_schema(payloads)
    except Exception as error:  # noqa: BLE001 - reported as a structural failure.
        return [{"error": "payload_schema_invalid", "detail": str(error)[:300]}]
    if payloads.get("$id") != PAYLOAD_SCHEMA_URI:
        failures.append({"error": "payload_schema_uri"})
    defs = payloads.get("$defs", {})
    members = [DEF_BY_TYPE[event_type] for event_type in SEVEN] + ["debug_mirror_exported"]
    if set(defs) != {"lineage_envelope", "non_secret_ref", *members}:
        failures.append({"error": "payload_schema_definition_census", "detail": sorted(defs)})
        return failures
    if payloads.get("oneOf") != [{"$ref": f"{PAYLOAD_SCHEMA_URI}#/$defs/{name}"} for name in members]:
        failures.append({"error": "payload_schema_root_members"})
    envelope = defs["lineage_envelope"]
    envelope_fields = set(ENVELOPE_REQUIRED) | set(ENVELOPE_OPTIONAL) | {"schema_version"}
    if set(envelope.get("properties", {})) != envelope_fields or set(envelope.get("required", [])) != set(ENVELOPE_REQUIRED) | {"schema_version"}:
        failures.append({"error": "lineage_envelope_fields"})
    for name in members:
        definition = defs[name]
        label = {"definition": name}
        if definition.get("$id") != f"pm.coordination_event.{name}.schema.v1":
            failures.append({"error": "payload_definition_schema_id", **label})
        if definition.get("type") != "object" or definition.get("additionalProperties") is not False:
            failures.append({"error": "payload_definition_not_closed", **label})
        if definition.get("properties", {}).get("schema_version") != {"const": VERSION} or "schema_version" not in definition.get("required", []):
            failures.append({"error": "payload_definition_schema_version", **label})
        required, optional = ROW_FIELDS[name]
        if name == "debug_mirror_exported":
            expected_properties = set(required) | set(optional) | {"schema_version"}
            expected_required = set(required) | {"schema_version"}
        elif name == "agent_registered":
            expected_properties = set(required) | set(optional) | {"schema_version"}
            expected_required = set(required) | {"schema_version"}
        else:
            expected_properties = envelope_fields | set(required) | set(optional)
            expected_required = set(ENVELOPE_REQUIRED) | {"schema_version", "agent_revision"} | set(required)
        if set(definition.get("properties", {})) != expected_properties:
            failures.append({"error": "payload_definition_fields_differ_from_contracts_row", **label,
                             "detail": sorted(set(definition.get("properties", {})) ^ expected_properties)})
        if set(definition.get("required", [])) != expected_required:
            failures.append({"error": "payload_definition_required_fields", **label,
                             "detail": sorted(set(definition.get("required", [])) ^ expected_required)})
        if name not in ("debug_mirror_exported",):
            lineage_ref = {"$ref": f"{PAYLOAD_SCHEMA_URI}#/$defs/lineage_envelope"}
            if lineage_ref not in definition.get("allOf", []):
                failures.append({"error": "payload_definition_lineage_envelope", **label})
    for (name, field), values in CLOSED_DOMAINS.items():
        if defs[name]["properties"].get(field) != {"enum": values}:
            failures.append({"error": "closed_domain", "definition": name, "field": field})
    if envelope.get("properties", {}).get("platform") != PLATFORM_ID:
        failures.append({"error": "platform_pattern", "definition": "lineage_envelope"})
    if defs["agent_file_ownership_updated"].get("properties", {}).get("path_ref") != PATH_REF:
        failures.append({"error": "path_ref_pattern", "definition": "agent_file_ownership_updated"})
    nulls = null_admitting_nodes(payloads)
    if nulls:
        failures.append({"error": "payload_schema_admits_null", "detail": nulls[:5]})
    return failures


# --- Projection values, checkpoint and the binding record (SP-320) ------------------------------------------------


def durable_read_token_schema(root: Path = ROOT) -> dict[str, Any]:
    """SP-278's read token without the live snapshot fence (DL-076): the nine-field durable token."""
    token = copy.deepcopy(load(GENERIC_PATH, root)["$defs"]["read_token"])
    token["properties"].pop(LIVE_SNAPSHOT_FENCE)
    token["required"] = [field for field in token["required"] if field != LIVE_SNAPSHOT_FENCE]
    return token


def expected_binding() -> dict[str, Any]:
    """SP-320 "Binding record": the section's identities in machine form; it adds none."""
    return {
        "binding_version": VERSION,
        "definition_authority_ref": "Plans/Decision_Log.md#DL-045",
        "definition_status": "newly_authored_owner_contract",
        "search_report_ref": SEARCH_REPORT,
        "semantic_owner_ref": "Plans/orchestrator-subagent-integration.md#OSI-438",
        "payload_owner_ref": "Plans/Contracts_V0.md#CV-353",
        "storage_owner_ref": SP320,
        "producer_component": "AgentCoordinator",
        "append_admission": APPEND,
        "first_receipt_resolver": "storage.first_append_receipt.resolve.v2",
        "first_receipt_owner_refs": ["Plans/storage-plan.md#SP-286", "Plans/Contracts_V0.md#CV-339"],
        "projector_id": PROJECTOR,
        "projector_version": VERSION,
        "reader_ids": list(READERS),
        "record_family_id": RECORD_FAMILY,
        "projection_family_id": PROJECTION_FAMILY,
        "checkpoint_key": "projector.checkpoint.coordination:{project_id}",
        "checkpoint_schema_id": PROJECTION_SCHEMA_IDS["checkpoint"],
        "checkpoint_schema_version": VERSION,
        "checkpoint_schema_pointer": "#/$defs/checkpoint",
        "generic_index_owner_ref": "Plans/storage-plan.md#SP-278",
        "generic_index_read_token_ref": GENERIC_PATH + "#/$defs/read_token",
        "stored_read_token_pointer": "#/$defs/durable_read_token",
        "source_retention_policy": {"policy_id": "RP-COORDINATION-180D", "policy_version": VERSION},
        "projection_retention_policy": {"policy_id": "RP-PROJECTION-3GEN", "policy_version": VERSION},
        "families": [
            {"event_type": event_type, "payload_schema_ref": f"{PAYLOAD_PATH}#/$defs/{definition}",
             "payload_schema_id": f"pm.coordination_event.{definition}.schema.v1", "entry_point": entry_point}
            for event_type, definition, entry_point in FAMILIES
        ],
        "excluded_event_types": [MIRROR],
        "native_proof": False,
    }


def reaches_live_fence(node: Any, defs: dict[str, Any], seen: frozenset = frozenset()) -> bool:
    """True when a value schema can hold redb_snapshot_id, following local references."""
    if isinstance(node, dict):
        if LIVE_SNAPSHOT_FENCE in node.get("properties", {}):
            return True
        ref = node.get("$ref")
        if isinstance(ref, str) and ref.startswith("#/$defs/"):
            name = ref.rsplit("/", 1)[1]
            if name not in seen and name in defs and reaches_live_fence(defs[name], defs, seen | {name}):
                return True
        return any(reaches_live_fence(value, defs, seen) for key, value in node.items() if key != "$defs")
    if isinstance(node, list):
        return any(reaches_live_fence(value, defs, seen) for value in node)
    return False


def projection_schema_failures(*, root: Path = ROOT) -> list[dict[str, Any]]:
    """SP-320: one closed value per key shape, each with its own schema ID, and the binding record."""
    projections = load(PROJECTION_PATH, root)
    failures: list[dict[str, Any]] = []
    try:
        Draft202012Validator.check_schema(projections)
    except Exception as error:  # noqa: BLE001
        return [{"error": "projection_schema_invalid", "detail": str(error)[:300]}]
    if projections.get("$id") != PROJECTION_SCHEMA_URI:
        failures.append({"error": "projection_schema_uri"})
    defs = projections.get("$defs", {})
    if projections.get("oneOf") != [{"$ref": f"#/$defs/{name}"} for name in PROJECTION_MEMBERS]:
        failures.append({"error": "projection_schema_root_members"})
    for name in PROJECTION_MEMBERS:
        definition = defs.get(name, {})
        properties = definition.get("properties", {})
        if (definition.get("additionalProperties") is not False
                or properties.get("schema_id") != {"const": PROJECTION_SCHEMA_IDS[name]}
                or properties.get("schema_version") != {"const": VERSION}
                or not {"schema_id", "schema_version", "publication_id", "project_id"} <= set(definition.get("required", []))):
            failures.append({"error": "projection_value_identity", "definition": name})
    if defs.get("durable_read_token") != durable_read_token_schema(root):
        failures.append({"error": "checkpoint_token_not_sp278_durable_token"})
    checkpoint = defs.get("checkpoint", {})
    if checkpoint.get("properties", {}).get("index_read_token") != {"$ref": "#/$defs/durable_read_token"}:
        failures.append({"error": "checkpoint_token_binding"})
    if checkpoint.get("properties", {}).get("source_cursor") != {"$ref": GENERIC_CURSOR_REF}:
        failures.append({"error": "checkpoint_cursor_not_sp278_last_frame"})
    if checkpoint.get("properties", {}).get("admitted_event_types", {}).get("items") != {"enum": list(SEVEN)}:
        failures.append({"error": "checkpoint_admitted_domain"})
    for name in ("agent_projection", "snapshot_agent"):
        if defs.get(name, {}).get("properties", {}).get("platform") != PLATFORM_ID:
            failures.append({"error": "platform_pattern", "definition": name})
    if defs.get("path_ref") != PATH_REF:
        failures.append({"error": "path_ref_pattern", "definition": "path_ref"})
    if any(reaches_live_fence(defs.get(name, {}), defs) for name in PROJECTION_MEMBERS):
        failures.append({"error": "stored_live_snapshot_fence"})
    if projections.get("x-pm-event-authority-binding") != expected_binding():
        failures.append({"error": "coordination_authority_binding_mismatch"})
    return failures


def checkpoint_failures(value: dict[str, Any]) -> list[str]:
    """SP-320 checkpoint rules that a JSON Schema cannot state; run after schema validation."""
    failures = []
    if value["scope_partition"] != scope_partition(value["project_id"]):
        failures.append("checkpoint_scope_partition")
    token = value["index_read_token"]
    if token["storage_instance_id"] != value["storage_instance_id"] or token["source_selection"]["storage_instance_id"] != value["storage_instance_id"]:
        failures.append("checkpoint_token_storage_instance")
    if value["admitted_event_types"] != sorted(value["admitted_event_types"]):
        failures.append("checkpoint_admitted_types_not_sorted")
    cursor = value["source_cursor"]
    if cursor is not None and (value["first_retained_sequence_id"] > value["index_through_sequence_id"]
                               or cursor["last_sequence_id"] != value["index_through_sequence_id"]):
        failures.append("checkpoint_range_or_cursor")
    publications = [value["publication_id"]]
    for retired in value.get("retired_generations", []):
        core = retired["checkpoint_core"]
        publications.append(core["publication_id"])
        if core["project_id"] != value["project_id"] or core["scope_partition"] != value["scope_partition"]:
            failures.append("checkpoint_retired_core_other_key")
        failures.extend("retired_" + failure for failure in checkpoint_failures(dict(core, retired_generations=[]))
                        if failure != "checkpoint_retired_core_other_key")
    if len(publications) != len(set(publications)):
        failures.append("checkpoint_publication_reused")
    return sorted(set(failures))


def projection_value_failures(definition: str, value: Any, root: Path = ROOT) -> list[str]:
    if not projection_valid(definition, value, root):
        return ["schema"]
    if definition == "checkpoint":
        return checkpoint_failures(value)
    if definition == "file_projection" and value["path_hash"] != path_hash(value["path_ref"]):
        return ["path_hash_recipe"]
    return []


# --- Admission ledger and the registry rows it prepares (DL-045, DL-077, DL-078) -----------------------------------


def expected_registry_row(index: int, event_type: str, definition: str) -> dict[str, Any]:
    """The final event_family_registry row the family's own admission landing appends unchanged."""
    schema_id = f"pm.coordination_event.{definition}.schema.v1"
    return {
        "family_id": family_id_of(event_type),
        "family_revision": VERSION,
        "event_type": event_type,
        "scope_policy": "project_only",
        "semantic_owner_doc": SEMANTIC_OWNER_DOC,
        "payload_owner_doc": PAYLOAD_OWNER_DOC,
        "payload_schema_id": schema_id,
        "payload_schema_ref": {"path": PAYLOAD_PATH, "json_pointer": f"#/$defs/{definition}", "schema_id": schema_id},
        "legacy": {
            "aliases": [],
            "admitted_extensions": [],
            "identity_json_pointers": {field: ["/payload/" + field] for field in ("project_id", "thread_id", "run_id", "node_id")},
            "referenced_event_id_pointer": None,
            "redaction": {"mode": "reject_unhandled_secrets", "transform_id": None, "transform_version": None},
        },
        "source_refs": [
            f"{LEDGER_PATH}#/rows/{index}",
            "Plans/orchestrator-subagent-integration.md#OSI-438",
            "Plans/Contracts_V0.md#CV-353",
            f"{PAYLOAD_PATH}#/$defs/{definition}",
            SP320,
            "Plans/storage-plan.md#SP-278",
            "Plans/storage-plan.md#SP-286",
            "Plans/Contracts_V0.md#CV-339",
            "Plans/Decision_Log.md#DL-045",
            PROJECTION_PATH + "#/x-pm-event-authority-binding",
            SEARCH_REPORT,
        ],
        "retention_policy_ref": dict(RETENTION_REF),
    }


def ref_resolves(ref: str, root: Path = ROOT) -> bool:
    """A source ref resolves: the file exists, and a JSON pointer, PlanUnit ID or anchor it names exists."""
    path, _, fragment = ref.partition("#")
    target = root / path
    if not target.is_file():
        return False
    if not fragment:
        return True
    if path.endswith(".json"):
        try:
            resolve_pointer(json.loads(target.read_text(encoding="utf-8")), "#" + fragment)
        except (KeyError, IndexError, ValueError, TypeError):
            return False
        return True
    text = target.read_text(encoding="utf-8")
    if re.fullmatch(r"[A-Z0-9]+-[0-9]+", fragment):
        return re.search(rf"^plan_unit_id: {re.escape(fragment)}\s*$", text, re.MULTILINE) is not None
    if f'<a id="{fragment}"></a>' in text:
        return True
    return fragment.lower() in heading_slugs(text)


def heading_slugs(text: str) -> set[str]:
    """Heading anchors, with and without a leading section number such as "2.3.2"."""
    slugs = set()
    for match in re.finditer(r"^#{1,6}\s+(.+?)\s*$", text, re.MULTILINE):
        for title in (match.group(1), re.sub(r"^[0-9]+(?:\.[0-9]+)*\.?\s+", "", match.group(1))):
            slug = re.sub(r"[^\w\s-]", "", title.strip().lower())
            slugs.add(re.sub(r"-+", "-", re.sub(r"\s+", "-", slug)).strip("-"))
    return slugs


def ledger_failures(ledger: dict[str, Any] | None = None, *, root: Path = ROOT) -> list[dict[str, Any]]:
    """The admission ledger against its schema, and each row's prepared registry row."""
    ledger = load(LEDGER_PATH, root) if ledger is None else ledger
    failures: list[dict[str, Any]] = []
    schema = load(LEDGER_SCHEMA_PATH, root)
    Draft202012Validator.check_schema(schema)
    for error in Draft202012Validator(schema, registry=schema_registry(root)).iter_errors(ledger):
        failures.append({"error": "ledger_schema", "pointer": "/" + "/".join(str(part) for part in error.absolute_path),
                         "detail": error.message[:200]})
    if failures:
        return failures
    rows = ledger["rows"]
    if [row["event_type"] for row in rows] != list(SEVEN) + [MIRROR]:
        failures.append({"error": "ledger_row_order"})
        return failures
    registry_schema = load(REGISTRY_SCHEMA_PATH, root)
    family_validator = Draft202012Validator({"$ref": "#/$defs/family", "$defs": registry_schema["$defs"]})
    binding = {entry.get("event_type"): entry for entry in
               load(PROJECTION_PATH, root).get("x-pm-event-authority-binding", {}).get("families", [])}
    payloads = load(PAYLOAD_PATH, root)
    policies = {policy["policy_id"]: policy for policy in load(SVR_PATH, root)["retention_policies"]}
    for index, (row, (event_type, definition, entry_point)) in enumerate(zip(rows, FAMILIES)):
        label = {"event_type": event_type}
        expected_row = expected_registry_row(index, event_type, definition)
        prepared = row["registry_row"]
        if row["family_id"] != family_id_of(event_type):
            failures.append({"error": "ledger_family_id", **label})
        if canonical(prepared) != canonical(expected_row):
            failures.append({"error": "prepared_registry_row_mismatch", **label})
        if row["registry_row_sha256"] != row_sha256(prepared):
            failures.append({"error": "prepared_registry_row_sha256", **label})
        if list(family_validator.iter_errors(prepared)):
            failures.append({"error": "prepared_registry_row_schema", **label})
        if row["payload_schema_ref"] != prepared["payload_schema_ref"] or row["retention_policy_ref"] != prepared["retention_policy_ref"]:
            failures.append({"error": "ledger_registry_row_join", **label})
        if (row["semantic_owner_ref"], row["payload_owner_ref"], row["storage_owner_ref"]) != (
                prepared["semantic_owner_doc"], prepared["payload_owner_doc"], STORAGE_OWNER_DOC):
            failures.append({"error": "ledger_owner_join", **label})
        try:
            resolved = resolve_pointer(payloads, prepared["payload_schema_ref"]["json_pointer"])
        except (KeyError, IndexError):
            resolved = {}
        if resolved.get("$id") != prepared["payload_schema_id"] or prepared["payload_schema_ref"]["schema_id"] != prepared["payload_schema_id"]:
            failures.append({"error": "prepared_payload_schema_unresolved", **label})
        if not all(ref_resolves(ref, root) for ref in prepared["source_refs"] + [prepared["semantic_owner_doc"], prepared["payload_owner_doc"], STORAGE_OWNER_DOC]):
            failures.append({"error": "prepared_registry_row_ref_unresolved", **label,
                             "detail": [ref for ref in prepared["source_refs"] if not ref_resolves(ref, root)]})
        if not row["producer_component"].startswith(entry_point) or binding.get(event_type, {}).get("entry_point") != entry_point:
            failures.append({"error": "ledger_producer_binding", **label})
        policy = policies.get(prepared["retention_policy_ref"]["policy_id"], {})
        if (policy.get("policy_version") != prepared["retention_policy_ref"]["policy_version"] or not policy.get("hold_eligible")
                or (policy.get("anchor_kind") == "run_completion" and "run_id" not in row["required_context_fields"])):
            failures.append({"error": "ledger_retention_binding", **label})
        if not {SP320, "Plans/storage-plan.md#SP-278", "Plans/orchestrator-subagent-integration.md#OSI-438"} <= set(row["consumer_contract_refs"]):
            failures.append({"error": "ledger_consumer_refs", **label})
    mirror = rows[len(FAMILIES)]
    try:
        mirror_definition = resolve_pointer(payloads, mirror["payload_schema_ref"]["json_pointer"])
    except (KeyError, IndexError):
        mirror_definition = {}
    if mirror_definition.get("$id") != mirror["payload_schema_ref"]["schema_id"] or mirror["payload_schema_ref"]["json_pointer"] != "#/$defs/debug_mirror_exported":
        failures.append({"error": "mirror_payload_schema_unresolved", "event_type": MIRROR})
    if not ref_resolves(mirror["semantic_owner_ref"], root):
        failures.append({"error": "mirror_owner_ref_unresolved", "event_type": MIRROR})
    return failures


def registry_membership_failures(registry: dict[str, Any] | None = None, ledger: dict[str, Any] | None = None,
                                 *, root: Path = ROOT) -> list[dict[str, Any]]:
    """No coordination family is registered while its ledger row is prepared; admitted rows match byte for byte."""
    registry = load(REGISTRY_PATH, root) if registry is None else registry
    ledger = load(LEDGER_PATH, root) if ledger is None else ledger
    families = registry["families"]
    failures: list[dict[str, Any]] = []
    admitted: dict[str, dict[str, Any]] = {}
    for row in ledger["rows"]:
        event_type = row["event_type"]
        matches = [family for family in families if family.get("event_type") == event_type
                   or (row.get("family_id") is not None and family.get("family_id") == row["family_id"])]
        if row["admission_status"] == ADMITTED and isinstance(row.get("registry_row"), dict):
            admitted[event_type] = row["registry_row"]
            if len(matches) != 1:
                failures.append({"error": "admitted_coordination_family_missing_or_duplicate", "event_type": event_type})
            elif canonical(matches[0]) != canonical(row["registry_row"]):
                failures.append({"error": "admitted_coordination_row_differs_from_prepared_row", "event_type": event_type})
        elif matches:
            failures.append({"error": "prepared_coordination_family_registered", "event_type": event_type})
    for family in families:
        event_type = family.get("event_type")
        if isinstance(event_type, str) and event_type.startswith("coordination.") and event_type not in admitted:
            if not any(failure.get("event_type") == event_type for failure in failures):
                failures.append({"error": "unexpected_coordination_registry_family", "event_type": event_type})
    return failures


@lru_cache(maxsize=2)
def readiness_module(root: Path = ROOT):
    spec = importlib.util.spec_from_file_location("coordination_readiness_preflight", root / "scripts/pm-implementation-readiness.py")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def registry_preflight_failures(ledger: dict[str, Any] | None = None, registry: dict[str, Any] | None = None,
                                *, root: Path = ROOT) -> list[dict[str, Any]]:
    """Append each prepared row to a copy of the live registry, as its admission landing would.

    The registry schema must accept the result, and readiness must report nothing new except the
    DL-078 checkpoint row count that the family's own landing moves.
    """
    ledger = load(LEDGER_PATH, root) if ledger is None else ledger
    registry = load(REGISTRY_PATH, root) if registry is None else registry
    schema = load(REGISTRY_SCHEMA_PATH, root)
    readiness = readiness_module(root)
    baseline = {canonical(failure) for failure in readiness.event_family_registry_data_failures(
        registry, schema, path_label="coordination-preflight", include_residuals=False)}
    failures: list[dict[str, Any]] = []
    for row in ledger["rows"]:
        if row["admission_status"] != PREPARED or not isinstance(row.get("registry_row"), dict):
            continue
        candidate = copy.deepcopy(registry)
        candidate["families"].append(copy.deepcopy(row["registry_row"]))
        schema_errors = [error.message for error in Draft202012Validator(schema).iter_errors(candidate)]
        added = [failure for failure in readiness.event_family_registry_data_failures(
            candidate, schema, path_label="coordination-preflight", include_residuals=False)
            if canonical(failure) not in baseline and failure.get("error") != "event_family_registry_kernel_row_count_mismatch"]
        if schema_errors or added:
            failures.append({"error": "prepared_row_not_admissible", "event_type": row["event_type"],
                             "detail": (schema_errors + [failure.get("error") for failure in added])[:5]})
    return failures


# --- Storage value registry rows (SP-320 keyed value compositions) --------------------------------------------------


def rewrite_refs(node: Any, mapping: dict[str, str]) -> Any:
    if isinstance(node, dict):
        return {key: (mapping.get(value, value) if key == "$ref" and isinstance(value, str) else rewrite_refs(value, mapping))
                for key, value in node.items()}
    if isinstance(node, list):
        return [rewrite_refs(item, mapping) for item in node]
    return node


def event_records_bundle(root: Path = ROOT) -> dict[str, Any]:
    payloads = load(PAYLOAD_PATH, root)
    defs = payloads["$defs"]
    mapping = {f"{PAYLOAD_SCHEMA_URI}#/$defs/{name}": f"#/$defs/{name}" for name in defs}
    members = [DEF_BY_TYPE[event_type] for event_type in SEVEN] + ["debug_mirror_exported"]
    bundle_defs = {}
    for name in ["lineage_envelope", "non_secret_ref"] + members:
        definition = copy.deepcopy(defs[name])
        definition.pop("$schema", None)
        definition.pop("$id", None)
        bundle_defs[name] = rewrite_refs(definition, mapping)
    return {
        "$id": "pm.storage_value.coordination_event_records.v1",
        "$comment": (
            "Nonstored validation composition (SP-320 keyed value composition, Plans/storage-plan.md section "
            "2.3.1): one closed member per key shape, in key-shape order, copied from "
            "Plans/coordination_event_payloads.schema.json with its $schema and $id removed and its references "
            "made local. A stored value is the EventRecord payload; the envelope's payload_schema_id names its "
            "member, so members carry no stored schema_id."
        ),
        "oneOf": [{"$ref": f"#/$defs/{name}"} for name in members],
        "$defs": bundle_defs,
    }


def projections_bundle(root: Path = ROOT) -> dict[str, Any]:
    projections = load(PROJECTION_PATH, root)
    generic = load(GENERIC_PATH, root)
    mapping = {GENERIC_CURSOR_REF: "#/$defs/generic_source_cursor"}
    bundle_defs = {name: rewrite_refs(copy.deepcopy(definition), mapping) for name, definition in projections["$defs"].items()}
    bundle_defs["generic_source_cursor"] = copy.deepcopy(generic["$defs"]["coverage"]["properties"]["last_frame"])
    return {
        "$id": "pm.storage_value.coordination_read_model_projections.v1",
        "$comment": (
            "Nonstored validation composition (SP-320 keyed value composition, Plans/storage-plan.md section "
            "2.3.1): one closed member per key shape, in key-shape order, copied from "
            "Plans/coordination_projection_contracts.schema.json, with SP-278's coverage.last_frame copied as "
            "generic_source_cursor. Each member keeps its own literal stored schema_id; this composition "
            "identity is never a stored header."
        ),
        "oneOf": [{"$ref": f"#/$defs/{name}"} for name in PROJECTION_MEMBERS],
        "$defs": bundle_defs,
    }


def member_fields(bundle: dict[str, Any]) -> tuple[list[str], list[str]]:
    """Section 2.3.1: required = fields every member requires (first member's order); the rest optional."""
    members = [bundle["$defs"][entry["$ref"].rsplit("/", 1)[1]] for entry in bundle["oneOf"]]
    common = [field for field in members[0]["required"] if all(field in member["required"] for member in members[1:])]
    optional: list[str] = []
    for member in members:
        for field in member["properties"]:
            if field not in common and field not in optional:
                optional.append(field)
    return common, optional


def expected_svr_rows(root: Path = ROOT) -> dict[str, dict[str, Any]]:
    """The two coordination families as SP-320 materializes them in place (274 materialized, 19 deferred)."""
    records_bundle, projections_bundle_value = event_records_bundle(root), projections_bundle(root)
    records_required, records_optional = member_fields(records_bundle)
    projections_required, projections_optional = member_fields(projections_bundle_value)
    records = {
        "family_id": RECORD_FAMILY,
        "storage_kind": "seglog",
        "status": "materialized",
        "tier": "later_gui_or_feature_projection",
        "key_shape": " | ".join(list(SEVEN) + [MIRROR]),
        "value_schema_id": "pm.storage_value.coordination_event_records.v1",
        "value_schema_ref": PAYLOAD_PATH,
        "owner_doc": SP320,
        "producer": [APPEND],
        "consumers": [PROJECTOR + "@" + VERSION],
        "schema_version": VERSION,
        "encoding": "seglog_messagepack",
        "required_fields": records_required,
        "optional_fields": records_optional,
        "nullable_fields": [],
        "replay_behavior": (
            "Coordination EventRecords replay in canonical seglog order through "
            "storage.coordination_projector.v1@1.0.0 only (SP-320). The dedupe identity is (scope_partition, "
            "event_type, idempotency_key), with idempotency_key "
            "coordination:{event_type}:{project_id}:{agent_id}:{recovery_epoch}:{agent_revision}, whose "
            "recovery_epoch is the one the event ID uses; an exact retry returns the "
            "original event and its first AppendReceipt through storage.first_append_receipt.resolve.v2, and "
            "the same identity with a different digest is idempotency_conflict. A stale revision returns "
            "coordination_conflict. Replay rebuilds projection rows only and never re-runs scheduling, "
            "prompts, notifications, mirror writes, commands or appends."
        ),
        "migration": (
            "Legacy active-agents.json and .puppet-master/state/*.json coordination paths are compatibility or "
            "debug mirror inputs only, never migration authority; new writers append EventRecord values through "
            "storage.coordination_append.v1@1.0.0. StorageMigrationCoordinator installs the family through the "
            "actual migration graph and ceilings, and no store-version integer is invented. A later payload "
            "version needs a new CV-353 definition and version; readers reject an unsupported one."
        ),
        "retention_compaction": (
            "Exact RP-COORDINATION-180D@1.0.0, the structured retention_policy_ref, which governs this text "
            "(DL-029 PD-SCHEMA-01): a fixed TTL of 15552000 seconds from run_completion, which SP-320 binds to "
            "the first durable terminal canonical record of the Run that run_id names; records of a Run whose "
            "terminal record has not resolved are not eligible for expiry; at most 1,000,000 records per "
            "Project with evict_oldest_eligible on overflow; compact on expiry; holds apply. Events are "
            "appended at registration, on an actual change and at termination, and heartbeats are runtime "
            "liveness, not records (OSI-438). coordination.debug_mirror_exported is not admitted, and its anchor "
            "is settled in its own landing. Projections, checkpoints and mirrors are rebuildable from seglog "
            "and keep their own policies."
        ),
        "redaction_no_secret_rule": (
            "Only IDs, refs, hashes, enums, integers, timestamps and CV-353's bounded status and operation "
            "text. No prompt, model output, file content, diff, tool argument, command line, environment value, "
            "credential, provider token, OAuth value, account identifier or local absolute path; path_ref is "
            "the normalized project-relative path and path_hash its SHA-256 (SP-320). The planned registry rows "
            "reject unhandled secrets, and current Project and thread permission and deletion tombstones gate "
            "every read."
        ),
        "legacy_canonical_crosswalk_status": (
            "Materialized in place by SP-320 (DL-045) from the CV-353 payload definitions, as a nonstored keyed "
            "value composition with one member per key shape (Plans/storage-plan.md section 2.3.1). "
            "Materializing admits no event: every coordination family stays quarantined before append or "
            "projection, and absent from the event family registry, until its own Storage admission landing. "
            "coordination.debug_mirror_exported is prepared, not admitted, and has no producer here."
        ),
        "compatibility_key_shapes": [],
        "recovery_disposition": {
            "authority_class": "canonical_non_rebuildable",
            "strategy": "restore_from_mandatory_backup",
            "source_family_ids": [],
            "source_refs": [SP320, "Plans/Contracts_V0.md#CV-353", "SchemaID:pm.event.v0"],
            "backup_required": True,
            "data_loss_if_unavailable": True,
            "user_disclosure_required": True,
        },
        "migration_disposition": {
            "mode": "current_schema",
            "canonical_write_key_only": True,
            "compatibility_keys_read_only": False,
            "ambiguity_policy": "fail_closed",
            "source_refs": [SP320, "Plans/Contracts_V0.md#CV-353"],
        },
        "restore_disposition": {
            "mode": "mandatory_backup",
            "transaction_family_id": None,
            "outcome_owner_ref": SP320,
            "mutation_fence_on_unresolved": True,
            "source_refs": [SP320, "Plans/storage-plan.md#SP-286"],
        },
        "retention_policy_ref": "RP-COORDINATION-180D",
        "value_schema": records_bundle,
    }
    projections = {
        "family_id": PROJECTION_FAMILY,
        "storage_kind": "redb_projection",
        "status": "materialized",
        "tier": "later_gui_or_feature_projection",
        "key_shape": (
            "coordination_agent_projection.v1:{project_id}:{agent_id} | "
            "coordination_file_projection.v1:{project_id}:{path_hash}:{agent_id} | "
            "coordination_operation_projection.v1:{project_id}:{agent_id}:{operation_id} | "
            "coordination_snapshot_projection.v1:{project_id}:{projection_scope} | "
            "projector.checkpoint.coordination:{project_id}"
        ),
        "value_schema_id": "pm.storage_value.coordination_read_model_projections.v1",
        "value_schema_ref": PROJECTION_PATH,
        "owner_doc": SP320,
        "producer": [PROJECTOR + "@" + VERSION],
        "consumers": list(READERS),
        "schema_version": VERSION,
        "encoding": "messagepack_canonical",
        "required_fields": projections_required,
        "optional_fields": projections_optional,
        "nullable_fields": ["first_retained_sequence_id", "index_through_sequence_id", "source_cursor", "withdrawn_at_utc"],
        "replay_behavior": (
            "storage.coordination_projector.v1@1.0.0 explicitly adopts SP-278: it establishes the "
            "CURRENT-selected, globally complete generic index snapshot through "
            "reader.storage.event_record_index@1.0.0, scans the complete captured range with the exact Project "
            "and admitted_event_types filter, applies matching events in canonical sequence order through "
            "SP-320's transition table, and commits changed rows and the checkpoint in one redb write "
            "transaction under exact prior-value compare-and-swap. The checkpoint stores the nine-field "
            "durable read token; every advance, read and recovery joins the snapshot ID of its own live read and "
            "revalidates the whole token, and no redb_snapshot_id is stored (DL-076). Readers require state "
            "current, the admitted families they depend on, coverage of the needed sequence and the current "
            "publication_id, or return unavailable."
        ),
        "migration": (
            "StorageMigrationCoordinator installs the coordination_read_model_projections table and the "
            "checkpoint value through the actual migration graph and ceilings; no store-version integer is "
            "invented. An unsupported value version, a cursor regression, a changed scope or admission growth "
            "leads to a governed rebuild from CURRENT-selected source under a new publication; no silent "
            "zero-cursor reset, sibling reuse or history rewrite. File-backed coordination state is not "
            "migration authority."
        ),
        "retention_compaction": (
            "Exact RP-PROJECTION-3GEN@1.0.0: the checkpoint's same-key generation set is its current core plus at "
            "most two retired cores in retired_generations; a retired core's terminal anchor is its first "
            "withdrawal time, set once; ordinary advance keeps publication_id, birth, holds and history; a fourth "
            "publication waits for the lawful cleanup of a retired core. Projection rows keep only their current "
            "value, and a rebuild rewrites every row under the new publication and deletes every row it does not "
            "rewrite. Existing rebuild_projection overflow and rebuild expiry. Canonical coordination history "
            "stays in coordination_event_records under RP-COORDINATION-180D."
        ),
        "redaction_no_secret_rule": (
            "Projection and checkpoint values hold only IDs, refs, hashes, enums, integers, timestamps, cursors "
            "and CV-353's bounded text; no prompt, output, file content, diff, credential, local absolute path or "
            "redb_snapshot_id. Readers apply current Project and thread permission and deletion tombstones before "
            "disclosing a row; opaque refs, IDs, hashes and cursors confer no access."
        ),
        "legacy_canonical_crosswalk_status": (
            "Materialized in place by SP-320 (DL-045) as a nonstored keyed value composition with one closed "
            "value per key shape, each with its own schema_id (Plans/storage-plan.md section 2.3.1). File-backed "
            "coordination state is not migration authority. Materializing admits no event and advances no "
            "checkpoint."
        ),
        "compatibility_key_shapes": [],
        "recovery_disposition": {
            "authority_class": "derived_rebuildable",
            "strategy": "rebuild_from_canonical_events_and_snapshot",
            "source_family_ids": [RECORD_FAMILY, "event_record_index", "event_record_index_checkpoint"],
            "source_refs": [SP320, "Plans/storage-plan.md#SP-278", "Plans/Contracts_V0.md#EventRecord"],
            "backup_required": False,
            "data_loss_if_unavailable": False,
            "user_disclosure_required": True,
        },
        "migration_disposition": {
            "mode": "rebuild_on_schema_change",
            "canonical_write_key_only": True,
            "compatibility_keys_read_only": False,
            "ambiguity_policy": "fail_closed",
            "source_refs": [SP320],
        },
        "restore_disposition": {
            "mode": "rebuild_from_authority",
            "transaction_family_id": None,
            "outcome_owner_ref": SP320,
            "mutation_fence_on_unresolved": True,
            "source_refs": [SP320],
        },
        "retention_policy_ref": "RP-PROJECTION-3GEN",
        "value_schema": projections_bundle_value,
    }
    return {RECORD_FAMILY: records, PROJECTION_FAMILY: projections}


EXPECTED_POLICIES = {
    "RP-COORDINATION-180D": {
        "policy_id": "RP-COORDINATION-180D", "retention_mode": "fixed_ttl", "anchor_kind": "run_completion",
        "retain_indefinitely": False, "ttl_seconds": 15552000, "source_policy_ref": None, "max_cardinality": 1000000,
        "cardinality_scope": "project", "additional_cardinality_limits": [], "max_bytes": None,
        "overflow_action": "evict_oldest_eligible", "hold_eligible": True, "expiry_action": "compact", "policy_version": VERSION,
    },
    "RP-PROJECTION-3GEN": {
        "policy_id": "RP-PROJECTION-3GEN", "retention_mode": "current_plus_history", "anchor_kind": "terminal_transition",
        "retain_indefinitely": False, "ttl_seconds": 604800, "source_policy_ref": None, "max_cardinality": 3,
        "cardinality_scope": "logical_key", "additional_cardinality_limits": [], "max_bytes": None,
        "overflow_action": "rebuild_projection", "hold_eligible": True, "expiry_action": "rebuild", "policy_version": VERSION,
    },
}


def svr_failures(svr: dict[str, Any] | None = None, *, root: Path = ROOT) -> list[dict[str, Any]]:
    """Both coordination rows equal their SP-320 materialization, and both policies are unchanged."""
    svr = load(SVR_PATH, root) if svr is None else svr
    failures: list[dict[str, Any]] = []
    expected = expected_svr_rows(root)
    for family_id, expected_row in expected.items():
        rows = [row for row in svr["families"] if row.get("family_id") == family_id]
        if len(rows) != 1:
            failures.append({"error": "coordination_storage_family_missing_or_duplicate", "family_id": family_id})
            continue
        if canonical(rows[0]) != canonical(expected_row):
            differing = sorted(key for key in set(rows[0]) | set(expected_row) if canonical(rows[0].get(key)) != canonical(expected_row.get(key)))
            failures.append({"error": "coordination_storage_family_mismatch", "family_id": family_id, "fields": differing})
        try:
            Draft202012Validator.check_schema(rows[0].get("value_schema", {}))
        except Exception as error:  # noqa: BLE001
            failures.append({"error": "coordination_storage_value_schema_invalid", "family_id": family_id, "detail": str(error)[:200]})
    policies = {policy.get("policy_id"): policy for policy in svr.get("retention_policies", [])}
    for policy_id, expected_policy in EXPECTED_POLICIES.items():
        if canonical(policies.get(policy_id)) != canonical(expected_policy):
            failures.append({"error": "coordination_retention_policy_changed", "policy_id": policy_id})
    return failures


# --- Transition model (SP-320 "Admission, identity and compare-and-swap" and "Transition table") --------------------


class CoordinationStore:
    """Synthetic model of one Project's coordination admission, never seglog, redb or lock behavior.

    Admission order: exact retry, family admission, payload (schema then static rules), current
    projection (assumed available), transition and revision in SP-320's precedence (not_registered;
    a registration of an agent that already has an event by the agent's state alone, already_terminal
    or already_registered; any other event stale_revision, then already_terminal, then
    lineage_mismatch), change, append.
    """

    def __init__(self, storage_instance_id: str, recovery_epoch: int, admitted: list[str], *, root: Path = ROOT) -> None:
        self.storage_instance_id = storage_instance_id
        self.recovery_epoch = recovery_epoch
        self.admitted = set(admitted)
        self.root = root
        self.dedupe: dict[tuple[str, str, str], dict[str, Any]] = {}
        self.agents: dict[str, dict[str, Any]] = {}
        self.files: dict[tuple[str, str], dict[str, Any]] = {}
        self.operations: dict[tuple[str, str], dict[str, Any]] = {}
        self.sequence = 0

    def submit(self, event_type: str, payload: dict[str, Any]) -> dict[str, Any]:
        identity = (scope_partition(payload.get("project_id", "")), event_type, payload.get("idempotency_key", ""))
        digest = producer_digest(event_type, payload)
        prior = self.dedupe.get(identity)
        if prior is not None:
            if prior["digest"] == digest:
                return {"result": "exact_retry_original_result", "event_id": prior["event_id"]}
            return {"result": "idempotency_conflict"}
        if event_type not in self.admitted:
            return {"result": "quarantined_before_append"}
        rejection = payload_rejection(event_type, payload, self.root)
        if rejection:
            return {"result": rejection}
        agent_id = payload["agent_id"]
        agent = self.agents.get(agent_id)
        revision = payload["agent_revision"]
        if agent is None:
            if event_type != "coordination.agent_registered":
                return {"result": "coordination_conflict:not_registered"}
        else:
            if event_type == "coordination.agent_registered":
                # SP-320's transition table: a terminal agent refuses any event as already_terminal, and a registered,
                # non-terminal agent refuses a registration as already_registered; neither reaches the revision rule.
                return {"result": "coordination_conflict:already_terminal" if "terminal" in agent
                        else "coordination_conflict:already_registered"}
            if (revision != agent["agent_revision"] + 1
                    or ("expected_previous_revision" in payload and payload["expected_previous_revision"] != revision - 1)
                    or ("last_applied_event_id" in payload and payload["last_applied_event_id"] != agent["last_applied_event_id"])):
                return {"result": "coordination_conflict:stale_revision"}
            if "terminal" in agent:
                return {"result": "coordination_conflict:already_terminal"}
            if any(payload.get(field) != agent[field] for field in LINEAGE_FIXED):
                return {"result": "coordination_conflict:lineage_mismatch"}
            if any(field in payload and payload[field] != agent.get(field) for field in LINEAGE_OPTIONAL):
                return {"result": "coordination_conflict:lineage_mismatch"}
            if not self.changes_something(event_type, payload, agent):
                return {"result": "coordination_unchanged"}
        return self.append(event_type, payload, identity, digest)

    def changes_something(self, event_type: str, payload: dict[str, Any], agent: dict[str, Any]) -> bool:
        if event_type == "coordination.agent_status_updated":
            return payload["status"] != agent["status"] or payload.get("status_reason") != agent.get("status_reason")
        if event_type == "coordination.agent_operation_updated":
            row = self.operations.get((payload["agent_id"], payload["operation_id"]))
            return row is None or any(payload.get(field) != row.get(field) for field in ("operation_summary", "progress_pct", "operation_refs"))
        if event_type == "coordination.agent_file_ownership_updated":
            row = self.files.get((payload["path_hash"], payload["agent_id"]))
            return row is None or any(payload.get(field) != row.get(field) for field in ("claim_kind", "claim_confidence", "operation_id"))
        return True

    def append(self, event_type: str, payload: dict[str, Any], identity: tuple[str, str, str], digest: str) -> dict[str, Any]:
        agent_id, revision = payload["agent_id"], payload["agent_revision"]
        new_id = event_id(self.storage_instance_id, self.recovery_epoch, payload["project_id"], event_type, agent_id, revision)
        self.sequence += 1
        self.dedupe[identity] = {"digest": digest, "event_id": new_id}
        when = payload[FAMILY_TIME[event_type]]
        if event_type == "coordination.agent_registered":
            agent = {field: payload[field] for field in ("project_id", "run_id", "agent_id", "agent_type", "platform", "started_at_utc")}
            agent.update({field: payload[field] for field in LINEAGE_OPTIONAL + ("model_id",) if field in payload})
            agent.update(status="queued", active_claim_count=0)
            self.agents[agent_id] = agent
        agent = self.agents[agent_id]
        agent["agent_revision"] = revision
        agent["last_applied_event_id"] = new_id
        if event_type == "coordination.agent_status_updated":
            agent["status"] = payload["status"]
            if "status_reason" in payload:
                agent["status_reason"] = payload["status_reason"]
            else:
                agent.pop("status_reason", None)
        elif event_type == "coordination.agent_operation_updated":
            key = (agent_id, payload["operation_id"])
            prior = self.operations.get(key)
            row = {"operation_id": payload["operation_id"], "operation_summary": payload["operation_summary"],
                   "first_observed_at_utc": prior["first_observed_at_utc"] if prior else when,
                   "last_observed_at_utc": when, "source_event_id": new_id}
            row.update({field: payload[field] for field in ("progress_pct", "operation_refs") if field in payload})
            self.operations[key] = row
            agent["current_operation_id"] = payload["operation_id"]
        elif event_type == "coordination.agent_file_ownership_updated":
            row = {field: payload[field] for field in ("path_ref", "path_hash", "claim_kind", "claim_confidence", "observed_at_utc")}
            if "operation_id" in payload:
                row["operation_id"] = payload["operation_id"]
            row["source_event_id"] = new_id
            self.files[(payload["path_hash"], agent_id)] = row
            agent["active_claim_count"] = sum(1 for (_hash, owner) in self.files if owner == agent_id)
        elif event_type in TERMINAL:
            outcome_field = {"coordination.agent_unregistered": "terminal_status", "coordination.agent_crashed": "crash_reason",
                             "coordination.agent_aborted": "abort_reason"}[event_type]
            agent["terminal"] = {"event_type": event_type, "outcome": payload[outcome_field], "occurred_at_utc": when}
            if event_type == "coordination.agent_unregistered":
                agent["status"] = payload["terminal_status"]
            else:
                agent["status"] = "failed" if event_type == "coordination.agent_crashed" else "cancelled"
            for key in [key for key in self.files if key[1] == agent_id]:
                del self.files[key]
            agent["active_claim_count"] = 0
        return {"result": "appended", "event_id": new_id, "sequence": self.sequence}

    def final_state(self) -> dict[str, Any]:
        agents = {}
        for agent_id in sorted(self.agents):
            view = self.agents[agent_id]
            agents[agent_id] = {key: copy.deepcopy(view[key]) for key in (
                "status", "agent_revision", "last_applied_event_id", "active_claim_count", "current_operation_id", "terminal",
                "status_reason") if key in view}
        claims = [{"agent_id": agent_id, "path_ref": row["path_ref"], "claim_kind": row["claim_kind"],
                   "claim_confidence": row["claim_confidence"]} for (_hash, agent_id), row in sorted(self.files.items())]
        operations = [{"agent_id": agent_id, "operation_id": row["operation_id"], "operation_summary": row["operation_summary"],
                       "first_observed_at_utc": row["first_observed_at_utc"], "last_observed_at_utc": row["last_observed_at_utc"]}
                      for (agent_id, _operation), row in sorted(self.operations.items())]
        return {"final_agents": agents, "final_file_claims": claims, "final_operations": operations}


# --- EventRecord envelope joins (CV-353 rule 8) -------------------------------------------------------------------


def envelope_rejection(record: dict[str, Any], storage_instance_id: str, recovery_epoch: int) -> str | None:
    """The first failing CV-353 rule 8 join of a coordination EventRecord, or None."""
    body = record["payload"]
    event_type = record["event_type"]
    if event_type not in FAMILY_TIME:
        return "unknown_event_type"
    if record["scope_kind"] != "project" or record["project_id"] is None:
        return "project_only"
    if record["payload_ref"] is not None:
        return "inline_only"
    if record["payload_schema_id"] != f"pm.coordination_event.{DEF_BY_TYPE[event_type]}.schema.v1":
        return "payload_schema_id"
    if (record["project_id"] != body.get("project_id") or record["run_id"] != body.get("run_id")
            or record["thread_id"] != body.get("thread_id") or record["node_id"] != body.get("node_id")
            or record["attempt_id"] is not None or record["idempotency_key"] != body.get("idempotency_key")):
        return "payload_envelope_identity"
    if record["redaction_profile"] != "no_secrets":
        return "redaction_profile"
    if record["replay_policy"] != "dedupe_by_idempotency_key":
        return "replay_policy"
    if record["occurred_at_utc"] != body.get(FAMILY_TIME[event_type]):
        return "occurred_at_join"
    if (key_recovery_epoch(body["idempotency_key"]) != recovery_epoch
            or record["event_id"] != event_id(storage_instance_id, recovery_epoch, body["project_id"], event_type, body["agent_id"],
                                              body["agent_revision"])):
        return "identity_recipe"
    return None


# --- Fixtures ------------------------------------------------------------------------------------------------------


def apply_patch(base: dict[str, Any], patch: dict[str, Any], remove: list[str]) -> dict[str, Any]:
    value = copy.deepcopy(base)
    value.update(copy.deepcopy(patch))
    for field in remove:
        value.pop(field)
    return value


def fixture_report(fixtures: dict[str, Any] | None = None, *, root: Path = ROOT) -> dict[str, Any]:
    """Every positive validates and every negative fails for its stated reason."""
    fixtures = load(FIXTURE_PATH, root) if fixtures is None else fixtures
    failures: list[dict[str, Any]] = []
    context = fixtures["storage_context"]
    store_id, epoch = context["storage_instance_id"], context["recovery_epoch"]
    if context["scope_partition"] != scope_partition(context["project_id"]):
        failures.append({"error": "fixture_storage_context_partition"})
    if (fixtures["payload_schema"] != {"path": PAYLOAD_PATH, "schema_id": PAYLOAD_SCHEMA_URI}
            or fixtures["projection_schema"] != {"path": PROJECTION_PATH, "schema_id": PROJECTION_SCHEMA_URI}):
        failures.append({"error": "fixture_schema_refs"})
    all_ids = [case["case_id"] for key in ("payloads", "invalid_payloads", "valid_events", "invalid_events", "identity_vectors",
                                           "path_vectors", "transition_sequences", "projection_values", "invalid_projection_values")
               for case in fixtures[key]]
    if len(all_ids) != len(set(all_ids)):
        failures.append({"error": "fixture_case_id_duplicate"})
    payloads = {}
    for case in fixtures["payloads"]:
        payloads[case["case_id"]] = case
        rejection = payload_rejection(case["event_type"], case["payload"], root)
        if rejection is not None:
            failures.append({"error": "positive_payload_rejected", "case_id": case["case_id"], "detail": rejection})
    for case in fixtures["invalid_payloads"]:
        base = payloads.get(case["base_case_id"])
        if base is None or base["event_type"] != case["event_type"]:
            failures.append({"error": "negative_payload_base", "case_id": case["case_id"]})
            continue
        rejection = payload_rejection(case["event_type"], apply_patch(base["payload"], case["patch"], case["remove"]), root)
        if rejection != case["expected_rejection"]:
            failures.append({"error": "negative_payload_not_rejected_for_stated_reason", "case_id": case["case_id"],
                             "expected": case["expected_rejection"], "actual": rejection})
    # CV-353 rule 8 joins: one valid EventRecord per family, built on one of that family's own positive payloads, and
    # each negative patches the record its base_event_case_id names (grade gap 2: no family rests on a sibling's record).
    envelope_validator = Draft202012Validator(load(ENVELOPE_PATH, root), format_checker=FormatChecker())
    valid_events: dict[str, dict[str, Any]] = {}
    for case in fixtures["valid_events"]:
        valid_events[case["case_id"]] = case
        record, source = case["record"], payloads.get(case["payload_case_id"])
        if (source is None or source["event_type"] != case["event_type"] or record.get("event_type") != case["event_type"]
                or canonical(record.get("payload")) != canonical(source["payload"])):
            failures.append({"error": "valid_event_payload_join", "case_id": case["case_id"]})
            continue
        if list(envelope_validator.iter_errors(record)):
            failures.append({"error": "valid_event_envelope_schema", "case_id": case["case_id"]})
        if envelope_rejection(record, store_id, epoch) is not None or payload_rejection(record["event_type"], record["payload"], root):
            failures.append({"error": "valid_event_rejected", "case_id": case["case_id"]})
    event_rejections: dict[str, set[str]] = {}
    for case in fixtures["invalid_events"]:
        base = valid_events.get(case["base_event_case_id"])
        if base is None:
            failures.append({"error": "negative_event_base", "case_id": case["case_id"]})
            continue
        rejection = envelope_rejection(apply_patch(base["record"], case["patch"], []), store_id, epoch)
        if rejection != case["expected_rejection"]:
            failures.append({"error": "negative_event_not_rejected_for_stated_reason", "case_id": case["case_id"],
                             "expected": case["expected_rejection"], "actual": rejection})
            continue
        event_rejections.setdefault(base["event_type"], set()).add(rejection)
    for vector in fixtures["identity_vectors"]:
        vector_epoch = vector.get("recovery_epoch", epoch)
        values = (vector["project_id"], vector["event_type"], vector["agent_id"], vector["agent_revision"])
        key = idempotency_key(vector["event_type"], vector["project_id"], vector["agent_id"], vector_epoch, vector["agent_revision"])
        if (key != vector["expected_idempotency_key"]
                or event_id_preimage(store_id, vector_epoch, *values) != vector["expected_event_id_preimage"]
                or event_id(store_id, vector_epoch, *values) != vector["expected_event_id"]):
            failures.append({"error": "identity_vector_mismatch", "case_id": vector["case_id"]})
        if "prior_recovery_epoch" in vector:
            # A new recovery epoch gives a new key for the same agent, family and revision (SP-320, review repair CP-02).
            prior = idempotency_key(vector["event_type"], vector["project_id"], vector["agent_id"], vector["prior_recovery_epoch"],
                                    vector["agent_revision"])
            if prior != vector["prior_idempotency_key"] or prior == key:
                failures.append({"error": "identity_vector_mismatch", "case_id": vector["case_id"]})
    for vector in fixtures["path_vectors"]:
        normalized = normalize_observed_path(vector["worktree_root"], vector["observed_path"])
        expected = "no_claim" if normalized is None else {"path_ref": normalized, "path_hash": path_hash(normalized)}
        if expected != vector["expected"]:
            failures.append({"error": "path_vector_mismatch", "case_id": vector["case_id"]})
    steps = 0
    for sequence in fixtures["transition_sequences"]:
        store = CoordinationStore(store_id, epoch, sequence["admitted_event_types"], root=root)
        for position, step in enumerate(sequence["steps"]):
            steps += 1
            entry = payloads.get(step["payload_case_id"])
            if entry is None:
                failures.append({"error": "transition_step_payload_missing", "case_id": sequence["case_id"], "step": position})
                continue
            outcome = store.submit(entry["event_type"], copy.deepcopy(entry["payload"]))
            if outcome["result"] != step["expected"] or outcome.get("event_id") != step.get("event_id"):
                failures.append({"error": "transition_step_mismatch", "case_id": sequence["case_id"], "step": position,
                                 "expected": step["expected"], "actual": outcome["result"]})
        final = store.final_state()
        for key in ("final_agents", "final_file_claims", "final_operations"):
            if canonical(final[key]) != canonical(sequence[key]):
                failures.append({"error": "transition_final_state_mismatch", "case_id": sequence["case_id"], "field": key})
    projections = {}
    for case in fixtures["projection_values"]:
        projections[case["case_id"]] = case
        errors = projection_value_failures(case["definition"], case["value"], root)
        if errors:
            failures.append({"error": "positive_projection_rejected", "case_id": case["case_id"], "detail": errors})
    for case in fixtures["invalid_projection_values"]:
        base = projections.get(case["base_case_id"])
        if base is None or base["definition"] != case["definition"]:
            failures.append({"error": "negative_projection_base", "case_id": case["case_id"]})
            continue
        errors = projection_value_failures(case["definition"], apply_patch(base["value"], case["patch"], case["remove"]), root)
        if case["expected_rejection"] not in errors:
            failures.append({"error": "negative_projection_not_rejected_for_stated_reason", "case_id": case["case_id"],
                             "expected": case["expected_rejection"], "actual": errors})
    oracles = fixtures["required_native_oracles"]
    if not oracles or len({oracle["oracle_id"] for oracle in oracles}) != len(oracles) or any(oracle["execution_status"] != "NOT_RUN" for oracle in oracles):
        failures.append({"error": "native_oracles_must_stay_not_run"})
    per_family = {}
    for event_type in SEVEN + (MIRROR,):
        counts = {
            "positive_payloads": sum(1 for case in fixtures["payloads"] if case["event_type"] == event_type),
            "negative_payloads": sum(1 for case in fixtures["invalid_payloads"] if case["event_type"] == event_type),
            "transition_sequences": sum(1 for sequence in fixtures["transition_sequences"]
                                        if any(payloads.get(step["payload_case_id"], {}).get("event_type") == event_type for step in sequence["steps"])),
        }
        if event_type in SEVEN and not all(counts.values()):
            failures.append({"error": "family_without_positive_negative_and_transition_cases", "event_type": event_type})
        counts["valid_events"] = sum(1 for case in valid_events.values() if case["event_type"] == event_type)
        counts["negative_events"] = sum(1 for case in fixtures["invalid_events"]
                                        if valid_events.get(case["base_event_case_id"], {}).get("event_type") == event_type)
        if event_type in SEVEN and (not counts["valid_events"] or not set(FAMILY_EVENT_JOINS) <= event_rejections.get(event_type, set())):
            failures.append({"error": "family_without_own_event_join_cases", "event_type": event_type,
                             "detail": sorted(set(FAMILY_EVENT_JOINS) - event_rejections.get(event_type, set()))})
        per_family[event_type] = counts
    return {
        "failures": failures,
        "positive_payload_cases": len(fixtures["payloads"]),
        "negative_payload_cases": len(fixtures["invalid_payloads"]),
        "valid_event_cases": len(fixtures["valid_events"]),
        "negative_event_cases": len(fixtures["invalid_events"]),
        "identity_vectors": len(fixtures["identity_vectors"]),
        "path_vectors": len(fixtures["path_vectors"]),
        "transition_sequences": len(fixtures["transition_sequences"]),
        "transition_steps": steps,
        "positive_projection_cases": len(fixtures["projection_values"]),
        "negative_projection_cases": len(fixtures["invalid_projection_values"]),
        "native_oracles_not_run": len(oracles),
        "per_family": per_family,
    }


def validation_case_failures(ledger: dict[str, Any] | None = None, fixtures: dict[str, Any] | None = None,
                             *, root: Path = ROOT) -> list[dict[str, Any]]:
    """Each ledger row names cases of its own family, and every payload and EventRecord case belongs to one row."""
    ledger = load(LEDGER_PATH, root) if ledger is None else ledger
    fixtures = load(FIXTURE_PATH, root) if fixtures is None else fixtures
    payload_types = {case["case_id"]: case["event_type"] for key in ("payloads", "invalid_payloads") for case in fixtures[key]}
    record_types = {case["case_id"]: case["event_type"] for case in fixtures["valid_events"]}
    case_types = {**payload_types, **record_types,
                  **{case["case_id"]: record_types.get(case["base_event_case_id"]) for case in fixtures["invalid_events"]}}
    sequence_types = {sequence["case_id"]: {payload_types.get(step["payload_case_id"]) for step in sequence["steps"]}
                      for sequence in fixtures["transition_sequences"]}
    failures: list[dict[str, Any]] = []
    claimed_sequences: set[str] = set()
    for row in ledger["rows"]:
        event_type = row["event_type"]
        named = set(row["validation_case_ids"])
        for case_id in sorted(named):
            if case_id in case_types:
                if case_types[case_id] != event_type:
                    failures.append({"error": "validation_case_of_other_family", "event_type": event_type, "case_id": case_id})
            elif case_id in sequence_types:
                claimed_sequences.add(case_id)
                if event_type not in sequence_types[case_id]:
                    failures.append({"error": "validation_sequence_without_family_step", "event_type": event_type, "case_id": case_id})
            else:
                failures.append({"error": "validation_case_missing", "event_type": event_type, "case_id": case_id})
        own = {case_id for case_id, case_type in case_types.items() if case_type == event_type}
        if own - named:
            failures.append({"error": "family_cases_not_named_by_ledger_row", "event_type": event_type, "detail": sorted(own - named)})
    if set(sequence_types) - claimed_sequences:
        failures.append({"error": "transition_sequence_unclaimed", "detail": sorted(set(sequence_types) - claimed_sequences)})
    return failures


def ats_oracle_failures(fixtures: dict[str, Any] | None = None, *, root: Path = ROOT) -> list[dict[str, Any]]:
    """The ATS oracle entry names every NOT_RUN native obligation of the fixtures."""
    fixtures = load(FIXTURE_PATH, root) if fixtures is None else fixtures
    text = (root / ATS_PATH).read_text(encoding="utf-8")
    marker = '<a id="coordination-event-oracles-dl-045-2026-09-25"></a>'
    if marker not in text:
        return [{"error": "ats_coordination_oracle_entry_missing"}]
    section = text.split(marker, 1)[1]
    missing = [oracle["oracle_id"] for oracle in fixtures["required_native_oracles"] if f"`{oracle['oracle_id']}`" not in section]
    return [{"error": "ats_native_oracle_not_named", "detail": missing}] if missing else []


def validate(*, root: Path = ROOT) -> dict[str, Any]:
    """Run every static check; the report claims no admission and no native proof."""
    failures: list[dict[str, Any]] = []
    sections = (
        ("payload_schema", payload_schema_failures),
        ("projection_schema", projection_schema_failures),
        ("ledger", ledger_failures),
        ("registry_membership", registry_membership_failures),
        ("registry_preflight", registry_preflight_failures),
        ("storage_value_registry", svr_failures),
        ("validation_cases", validation_case_failures),
        ("ats_oracles", ats_oracle_failures),
    )
    for name, check in sections:
        failures.extend(dict(failure, check=name) for failure in check(root=root))
    fixtures = fixture_report(root=root)
    failures.extend(dict(failure, check="fixtures") for failure in fixtures.pop("failures"))
    ledger = load(LEDGER_PATH, root)
    statuses = {row["event_type"]: row["admission_status"] for row in ledger["rows"]}
    return {
        "schema_id": "pm.coordination_event_static_report.v1",
        "status": "fail" if failures else "pass",
        "batch_event_types": len(SEVEN),
        "prepared_rows": sorted(event_type for event_type, status in statuses.items() if status == PREPARED),
        "admitted_rows": sorted(event_type for event_type, status in statuses.items() if status == ADMITTED),
        "prepared_registry_rows": sum(1 for row in ledger["rows"] if isinstance(row.get("registry_row"), dict)),
        **fixtures,
        "claim_boundary": CLAIM_BOUNDARY,
        "admission_claimed": False,
        "native_proof": False,
        "global_event_denominator": "UNKNOWN_OPEN",
        "failures": failures,
    }


if __name__ == "__main__":
    report = validate()
    print(json.dumps(report, indent=2, sort_keys=True, ensure_ascii=False))
    raise SystemExit(bool(report["failures"]))
