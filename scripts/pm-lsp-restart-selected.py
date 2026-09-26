#!/usr/bin/env python3
"""Static typed-companion validator for exactly cmd.lsp.restart_server (LSPS-113).

Bounded pre-build checker. It validates the LSP restart selected-server schema
and fixtures, joins the owner claim (request/result/error/receipt, full central
v2 response) against an independent owner_witness channel (original dispatch,
live current, outcome refs, full SIR CommandOutcomeRecord), and pins the
TCP-LSP profile, the production wiring row, and its own aggregate-gate
enrollment. It authenticates no issuer, grants no permission, proves no restart
or native effect, and writes nothing.

Conditional limitations (fail-closed, see validate() report): the witness
channel stands in for independently retained native state; static agreement
between claim and witness proves consistency, not native liveness or issuer
authenticity. Owner digest authenticity (payload/owner-result SHA-256) is
an owner-interface prerogative and is never recomputed here.
"""

from __future__ import annotations

import argparse
import json
import re
from pathlib import Path
from typing import Any
from urllib.parse import unquote

from jsonschema import Draft202012Validator, FormatChecker
from referencing import Registry, Resource


ROOT = Path(__file__).resolve().parents[1]
PLANS = ROOT / "Plans"
SCHEMA_PATH = PLANS / "lsp_restart_selected_contracts.schema.json"
FIXTURE_PATH = PLANS / "lsp_restart_selected_contract_fixtures.json"
SHARED_SCHEMA_PATH = PLANS / "shared_runtime_command_contracts.schema.json"
UI_RESPONSE_SCHEMA_PATH = PLANS / "ui_command_response.schema.json"
FULL_THREAD_SCHEMA_PATH = PLANS / "full_thread_runtime_contracts.schema.json"
TOUCH_PATH = PLANS / "touch_closure.json"
WIRING_PATH = PLANS / "Wiring_Matrix.production.json"
PLANS_VERIFY_PATH = ROOT / "scripts" / "pm-plans-verify.py"

COMMAND = "cmd.lsp.restart_server"
REJECTED_SPELLING = "cmd.lsp.server.restart"
SCHEMA_REF = "Plans/lsp_restart_selected_contracts.schema.json"
REQUEST_REF = SCHEMA_REF + "#/$defs/request"
RESULT_REF = SCHEMA_REF + "#/$defs/result"
ERROR_REF = SCHEMA_REF + "#/$defs/command_error"
RECEIPT_REF = SCHEMA_REF + "#/$defs/receipt"
AVAILABILITY_REF = SCHEMA_REF + "#/$defs/availability"
FIXTURE_REF = "Plans/lsp_restart_selected_contract_fixtures.json"
RESULT_POINTER = "#/$defs/result"

OW_TO_CENTRAL = {
    "starting": "pending",
    "cancelled": "cancelled",
    "completed": "succeeded",
    "failed": "failed",
    "recovery_required": "recovery_required",
}
OW_TO_OUTCOME = {
    "starting": "accepted",
    "cancelled": "cancelled",
    "completed": "succeeded",
    "failed": "failed",
    "recovery_required": "terminal_unknown",
}
STALE_CODES = {"stale_session_generation", "stale_topology_generation", "stale_connection_epoch"}

SECRET_RE = re.compile(
    r"(password|passwd|secret|api[_-]?key|access[_-]?token|refresh[_-]?token|bearer\s+\S+|sk-[A-Za-z0-9_-]{8,})",
    re.IGNORECASE,
)
ABSOLUTE_PATH_RE = re.compile(r"(?:[A-Za-z]:[\\/]|file://|\\\\|/(?:home|mnt|tmp|etc|usr|var|workspace)(?:/|$))")

CONDITIONAL_LIMITATIONS = [
    "witness_is_stand_in_not_native_proof: owner_witness values stand in for independently retained "
    "native/SIR state; claim-vs-witness agreement proves static consistency, never native liveness, "
    "issuer authenticity, or currentness beyond the supplied witness. The retained original_request is "
    "a trusted owner-original static test double for focused joins, not proof that a native issuer or "
    "custody exists.",
    "digest_authenticity_is_owner_prerogative: payload_sha256/owner_result_sha256 presence and format "
    "are schema-enforced and cross-record equality is join-checked, but digest content authenticity is "
    "never recomputed here; canonical digests come from the actual owner interface, not a chosen "
    "serializer. Missing dependency for content proof: the canonical Full Thread payload serializer "
    "or native owner digest custody, neither of which exists in the static companion.",
    "sir_target_is_independent_domain: outcome_record.target_generation is joined only to the source "
    "SIR target generation in the original dispatch witness; it is never equated with LSP session "
    "generation, connection epoch, topology generation, or operation generation.",
    "outcome_error_ref_binding_is_conditional: outcome_record.error_ref must equal result.error_ref "
    "only when a retained owner error exists; error absence on non-failure outcomes carries no binding.",
    "native_effects_unproved: passing static joins admit no handler, dispatch, EventRecord, store, "
    "retention, restart execution, or runtime receipt.",
]


def read_json(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8"))


def registry_for(*docs: dict[str, Any]) -> Registry:
    registry: Registry = Registry()
    for doc in docs:
        registry = registry.with_resource(doc["$id"], Resource.from_contents(doc))
    return registry


def shape_errors(definition: str, value: Any, schema: dict[str, Any],
                 registry: Registry) -> list[str]:
    validator = Draft202012Validator(
        {"$ref": schema["$id"] + "#/$defs/" + definition},
        registry=registry, format_checker=FormatChecker(),
    )
    return sorted(e.message for e in validator.iter_errors(value))


def resolve_pointer(document: Any, fragment: str) -> Any:
    pointer = unquote(fragment)
    if not pointer.startswith("/"):
        raise ValueError("fragment is not an exact JSON Pointer")
    current = document
    for encoded in pointer[1:].split("/"):
        token = encoded.replace("~1", "/").replace("~0", "~")
        if isinstance(current, list):
            if not token.isdigit():
                raise ValueError(f"list index is not an unsigned integer: {token!r}")
            current = current[int(token)]
        elif isinstance(current, dict):
            if token not in current:
                raise ValueError(f"object member does not exist: {token!r}")
            current = current[token]
        else:
            raise ValueError(f"cannot traverse through {type(current).__name__}")
    return current


def join_failures(case: dict[str, Any], result_schema_id: str) -> list[tuple[str, str]]:
    """Causal LSPS-113 joins of claim vs owner_witness. Shape-valid cases only."""
    failures: list[tuple[str, str]] = []

    def fail(code: str, detail: str) -> None:
        failures.append((code, detail))

    request = case["request"]
    current = case["current"]
    result = case["result"]
    error = case["error"]
    receipt = case["receipt"]
    availability = case["availability"]
    witness = case["owner_witness"]
    dispatch = witness["original_dispatch"]
    live = witness["live_current"]
    outcome_refs = witness["outcome"]
    outcome_record = witness["outcome_record"]
    central = case["central"]
    ow_phase = result["observable_work"]["phase"]
    restart = result["restart"]
    replayed = result["replayed"]
    central_error_code = central["error"]["code"] if central["error"] is not None else None

    for label, command_id in (("request", request["command_id"]),
                              ("result", result["command_id"]),
                              ("central", central["command_id"]),
                              ("outcome_record", outcome_record["command_id"]),
                              ("witness", dispatch["command_id"])):
        if command_id != COMMAND:
            fail("J_COMMAND_EXACT", f"{label} command_id is not exactly cmd.lsp.restart_server")
    if REJECTED_SPELLING in json.dumps(case):
        fail("J_COMMAND_EXACT", "rejected cmd.lsp.server.restart spelling is present")

    original = result["original"]
    if original["server_id"] != dispatch["server_id"]:
        fail("J_ORIGINAL_IMMUTABLE", "result original server_id differs from the witness original")
    if original["root_identity"] != dispatch["root_identity"]:
        fail("J_ORIGINAL_IMMUTABLE", "result original root_identity differs from the witness original")
    if original["topology_generation"] != dispatch["topology_generation"]:
        fail("J_ORIGINAL_IMMUTABLE", "result original topology_generation differs from the witness original")

    server_ref = request["server_ref"]
    original_request = dispatch["original_request"]
    for field in ("schema_id", "schema_version", "command_id", "command_instance_id",
                  "idempotency_key", "project_id", "project_home_server_id",
                  "execution_host_id", "execution_environment_id", "source_location_id",
                  "topology_generation", "actor_ref", "permission_snapshot_ref",
                  "reason", "recovery_of_operation_id"):
        if replayed and field == "command_instance_id":
            continue
        if request[field] != original_request[field]:
            fail("J_ORIGIN_REQUEST", f"submitted request {field} differs from the retained original request")
    for field in ("server_id", "root_identity", "expected_session_generation",
                  "expected_connection_epoch"):
        if server_ref[field] != original_request["server_ref"][field]:
            fail("J_ORIGIN_REQUEST", f"submitted request server_ref.{field} differs from the retained original")
    for field, source in (("command_id", "command_id"),
                          ("command_instance_id", "command_instance_id"),
                          ("idempotency_key", "idempotency_key"),
                          ("project_id", "project_id"),
                          ("project_home_server_id", "project_home_server_id"),
                          ("execution_host_id", "execution_host_id"),
                          ("execution_environment_id", "execution_environment_id"),
                          ("source_location_id", "source_location_id"),
                          ("topology_generation", "topology_generation"),
                          ("actor_ref", "actor_ref"),
                          ("permission_snapshot_ref", "permission_snapshot_ref")):
        if original_request[field] != dispatch[source]:
            fail("J_ORIGIN_REQUEST", f"retained original request {field} disagrees with the original dispatch")
    for field, source in (("server_id", "server_id"),
                          ("root_identity", "root_identity"),
                          ("expected_session_generation", "session_generation"),
                          ("expected_connection_epoch", "connection_epoch")):
        if original_request["server_ref"][field] != dispatch[source]:
            fail("J_ORIGIN_REQUEST", "retained original server_ref disagrees with the original dispatch")
    if result["command_instance_id"] != dispatch["command_instance_id"]:
        fail("J_WITNESS_ORIGINAL", "result command_instance_id differs from the witness original")
    if not replayed and result["operation_id"] != dispatch["operation_id"]:
        fail("J_WITNESS_ORIGINAL", "result operation_id differs from the witness original")
    if original["session_generation"] != dispatch["session_generation"]:
        fail("J_GENERATION_FENCE", "result original session generation differs from the witness original")
    if original["connection_epoch"] != dispatch["connection_epoch"]:
        fail("J_GENERATION_FENCE", "result original connection epoch differs from the witness original")
    if restart["prior_session_generation"] != original["session_generation"]:
        fail("J_GENERATION_FENCE", "restart did not start from the bound original session generation")
    if restart["prior_connection_epoch"] != original["connection_epoch"]:
        fail("J_GENERATION_FENCE", "restart did not start from the bound original connection epoch")
    if (result["current_topology_generation"] != live["topology_generation"]
            or result["current_connection_epoch"] != live["connection_epoch"]
            or result["current_session_generation"] != live["session_generation"]):
        fail("J_GENERATION_FENCE", "observed current generations differ from witness live current")
    if (current["topology_generation"] != live["topology_generation"]
            or current["connection_epoch"] != live["connection_epoch"]
            or current["session_generation"] != live["session_generation"]):
        fail("J_GENERATION_FENCE", "supplied current state differs from witness live current")
    prior_sess = restart["prior_session_generation"]
    current_sess = restart["current_session_generation"]
    prior_epoch = restart["prior_connection_epoch"]
    current_epoch = restart["current_connection_epoch"]
    if current_sess < prior_sess or current_epoch < prior_epoch:
        fail("J_GENERATION_FENCE", "session generation or connection epoch moved backwards")
    lifecycle_effect = bool(restart["responses_invalidated"]
                            or restart["resynchronized_uri_refs"]
                            or restart["reissued_reconciliation_refs"])
    if result["phase"] == "cancelled_before_write":
        if current_sess != prior_sess or current_epoch != prior_epoch:
            fail("J_GENERATION_FENCE", "cancelled_before_write claims a lifecycle generation effect")
    elif lifecycle_effect and not (current_sess > prior_sess or current_epoch > prior_epoch):
        fail("J_GENERATION_FENCE", "lifecycle effect without an incremented generation or epoch")
    for entry in result["per_server"]:
        if entry["observed_generation"] > result["current_session_generation"]:
            fail("J_GENERATION_FENCE", "per-server observation is newer than current generation")
        if entry["diagnostic_state"] == "fresh" and entry["observed_generation"] != result["current_session_generation"]:
            fail("J_GENERATION_FENCE", "late-generation response presented as fresh")
    if error is not None and error["code"] in STALE_CODES:
        if error["expected_generation"] is None or error["observed_generation"] is None:
            fail("J_GENERATION_FENCE", "stale owner error lacks the expected/observed generation pair")
        elif error["expected_generation"] == error["observed_generation"]:
            fail("J_GENERATION_FENCE", "stale owner error has identical expected/observed generations")

    if current_sess != result["current_session_generation"]:
        fail("J_GENERATION_JOIN", "restart current session generation differs from the result current generation")
    if current_epoch != result["current_connection_epoch"]:
        fail("J_GENERATION_JOIN", "restart current connection epoch differs from the result current epoch")

    if central["result_status"] != OW_TO_CENTRAL[ow_phase]:
        fail("J_PHASE_TRUTH", "central result_status does not match the ObservableWork phase")
    if result["phase"] == "committed_reconciliation_pending":
        if not set(restart["reissued_reconciliation_refs"]) <= set(restart["preserved_reconciliation_refs"]):
            fail("J_PHASE_TRUTH", "reissued work is not a subset of preserved post-commit work")
        if error is not None or result["error_ref"] is not None:
            fail("J_PHASE_TRUTH", "pending reconciliation carries a terminal error claim")
    if result["phase"] == "cancelled_before_write":
        if receipt["filesafe_receipt_ref"] is not None or receipt["filesafe_evidence_ref"] is not None:
            fail("J_PHASE_TRUTH", "cancelled_before_write claims FileSafe mutation evidence")
        if receipt["sync_outcome"] != "not_required" or receipt["notification_outcome"] != "not_required":
            fail("J_PHASE_TRUTH", "cancelled_before_write claims sync/notification effects")
        if receipt["cancellation_state"] != "cancelled_before_write":
            fail("J_PHASE_TRUTH", "pre-write cancellation lineage is missing from the receipt")
        if receipt["completed_utc"] is None:
            fail("J_PHASE_TRUTH", "terminal pre-write cancellation lacks receipt completion time")
    if result["phase"] == "committed_reconciliation_pending":
        if receipt["cancellation_state"] != "committed_reconciliation_pending":
            fail("J_PHASE_TRUTH", "post-commit pending lineage is missing from the receipt")
        if receipt["completed_utc"] is not None:
            fail("J_PHASE_TRUTH", "deferred pending outcome claims receipt completion")
        if receipt["filesafe_receipt_ref"] is None:
            fail("J_PHASE_TRUTH", "post-commit pending outcome hides the committed FileSafe receipt")
        if receipt["sync_outcome"] != "pending":
            fail("J_PHASE_TRUTH", "post-commit pending outcome misstates sync state")
        if receipt["notification_outcome"] not in ("pending", "unavailable"):
            fail("J_PHASE_TRUTH", "post-commit pending outcome misstates notification state")
    if result["phase"] == "terminal":
        if receipt["cancellation_state"] is not None:
            fail("J_PHASE_TRUTH", "terminal outcome carries unresolved cancellation lineage")
        if receipt["completed_utc"] is None:
            fail("J_PHASE_TRUTH", "terminal outcome lacks receipt completion time")
    if result["changed_paths"]:
        fail("J_PHASE_TRUTH", "restart claims changed file paths; restart never mutates files")

    committed = receipt["filesafe_receipt_ref"] is not None
    if result["phase"] == "terminal" and committed and ow_phase in ("completed", "recovery_required"):
        if not restart["reconciliation_preserved"]:
            fail("J_TERMINAL_RECONCILIATION", "terminal committed outcome drops preserved reconciliation state")
        if not restart["preserved_reconciliation_refs"]:
            fail("J_TERMINAL_RECONCILIATION", "terminal committed outcome preserves zero reconciliation refs")
        if not set(restart["reissued_reconciliation_refs"]) <= set(restart["preserved_reconciliation_refs"]):
            fail("J_TERMINAL_RECONCILIATION", "terminal reissue is not a subset of preserved work")
        if ow_phase == "completed" and not restart["reissued_reconciliation_refs"]:
            fail("J_TERMINAL_RECONCILIATION", "completed committed outcome reissued zero reconciliation work")
    if result["phase"] == "terminal" and ow_phase == "failed":
        if committed or restart["preserved_reconciliation_refs"] or restart["reissued_reconciliation_refs"]:
            fail("J_TERMINAL_RECONCILIATION", "failed terminal outcome strands committed reconciliation work")

    for entry in result["per_server"]:
        if entry["server_id"] != original["server_id"]:
            fail("J_DIAG_TRUTH", "per-server entry does not cover the selected original server")
    current_session = result["current_session_generation"]
    all_fresh = all(entry["diagnostic_state"] == "fresh" and entry["fresh_empty"]
                    and entry["observed_generation"] == current_session
                    for entry in result["per_server"])
    if result["diagnostic_status"] == "fresh_complete" and not all_fresh:
        fail("J_DIAG_TRUTH", "fresh_complete claimed without every server fresh, empty, and current")
    if all_fresh and result["diagnostic_status"] != "fresh_complete":
        fail("J_DIAG_TRUTH", "all servers fresh, empty, and current but status is not fresh_complete")
    all_na = all(entry["diagnostic_state"] == "not_applicable" for entry in result["per_server"])
    if result["diagnostic_status"] == "not_applicable" and not all_na:
        fail("J_DIAG_TRUTH", "not_applicable claimed while a server reports diagnostics")
    if all_na and result["diagnostic_status"] != "not_applicable":
        fail("J_DIAG_TRUTH", "no server reports diagnostics but status is not not_applicable")
    if receipt["diagnostic_status"] != result["diagnostic_status"]:
        fail("J_DIAG_TRUTH", "receipt diagnostic status differs from the result status")

    if ow_phase == "completed" and (error is not None or result["error_ref"] is not None):
        fail("J_ERROR_TRUTH", "completed outcome carries an owner error")
    if (result["error_ref"] is None) != (error is None):
        fail("J_ERROR_TRUTH", "owner error_ref and retained owner error disagree on presence")
    if error is not None and error["code"] in STALE_CODES and central_error_code != "stale_projection":
        fail("J_ERROR_TRUTH", "stale owner error must project to stale_projection")
    if error is not None and error["code"] == "permission_denied" and central_error_code != "permission_denied":
        fail("J_ERROR_TRUTH", "permission owner error must project to permission_denied")

    if central["ack_status"] == "accepted":
        if central["owner_result_ref"] is None or central["owner_result_schema_ref"] is None:
            fail("J_ACK_NOT_SUCCESS", "accepted projection lacks owner result identity")
        if central["command_outcome_ref"] is None:
            fail("J_ACK_NOT_SUCCESS", "accepted projection lacks CommandOutcome identity")
        if central["receipt_ref"] != result["receipt_ref"]:
            fail("J_ACK_NOT_SUCCESS", "central receipt_ref differs from the owner receipt")
        if central["command_outcome_ref"] != result["command_outcome_ref"]:
            fail("J_ACK_NOT_SUCCESS", "central outcome ref differs from the owner outcome ref")
        if central["replayed"] != replayed:
            fail("J_ACK_NOT_SUCCESS", "central replay flag differs from the owner result")

    if replayed:
        if result["operation_id"] != result["original_operation_id"]:
            fail("J_REPLAY_IDENTITY", "replay does not return the original operation identity")
        if result["original_operation_id"] != dispatch["operation_id"]:
            fail("J_REPLAY_IDENTITY", "replay original operation differs from the witness original")
        if result["original_operation_id"] != current["original_operation_id"]:
            fail("J_REPLAY_IDENTITY", "replay original operation differs from retained original")
        if result["receipt_ref"] != current["original_receipt_ref"]:
            fail("J_REPLAY_IDENTITY", "replay does not return the original receipt identity")
        if central["original_dispatch_id"] != dispatch["dispatch_id"]:
            fail("J_REPLAY_IDENTITY", "replay does not reference the witness original dispatch")

    if central["operation_id"] != dispatch["operation_id"]:
        fail("J_WITNESS_OUTCOME", "central operation_id differs from the witness original")
    if central["command_instance_id"] != dispatch["command_instance_id"]:
        fail("J_WITNESS_OUTCOME", "central command_instance_id differs from the witness original")
    if central["request_ref"] != dispatch["request_ref"]:
        fail("J_WITNESS_OUTCOME", "central request_ref differs from the witness original")
    identity = central["owner_identity"]
    if identity["scope_kind"] != "project":
        fail("J_WITNESS_OUTCOME", "central owner identity is not project-scoped")
    if identity["operation_id"] != dispatch["operation_id"]:
        fail("J_WITNESS_OUTCOME", "central owner identity binds a foreign operation")
    if identity["command_instance_id"] != dispatch["command_instance_id"]:
        fail("J_WITNESS_OUTCOME", "central owner identity binds a foreign command instance")
    if identity["server_id"] != dispatch["project_home_server_id"]:
        fail("J_WITNESS_OUTCOME", "central owner identity binds a foreign controlling server")
    for field in ("project_id", "project_home_server_id", "execution_host_id",
                  "execution_environment_id", "source_location_id"):
        if identity[field] != dispatch[field]:
            fail("J_WITNESS_OUTCOME", f"central owner identity {field} differs from the witness original")
    if identity["topology_generation"] != dispatch["topology_generation"]:
        fail("J_WITNESS_OUTCOME", "central owner identity topology is not the witness original generation")
    if identity["operation_generation"] != outcome_record["identity"]["operation_generation"]:
        fail("J_WITNESS_OUTCOME", "central and outcome identity operation generations disagree")
    if outcome_record["identity"] != dispatch["identity"]:
        fail("J_ORIGIN_IDENTITY", "outcome record identity differs from the source IdentityEnvelope")
    if identity != dispatch["identity"]:
        fail("J_ORIGIN_IDENTITY", "central owner identity differs from the source IdentityEnvelope")
    if outcome_record["idempotency_key"] != dispatch["idempotency_key"]:
        fail("J_WITNESS_OUTCOME", "outcome record idempotency differs from the witness original")
    if outcome_record["target_generation"] != dispatch["target_generation"]:
        fail("J_ORIGIN_DISPATCH", "outcome record target generation differs from the source SIR target")
    if outcome_record["payload_sha256"] != dispatch["payload_sha256"]:
        fail("J_ORIGIN_DISPATCH", "outcome record payload digest differs from the source original digest")
    if outcome_record["dispatch_frame_id"] != dispatch["dispatch_frame_id"]:
        fail("J_ORIGIN_DISPATCH", "outcome record dispatch frame differs from the source original frame")
    if outcome_record["outcome"] != OW_TO_OUTCOME[ow_phase]:
        fail("J_WITNESS_OUTCOME", "outcome record outcome does not match the ObservableWork phase")
    if outcome_record["owner_result_ref"] != outcome_refs["owner_result_ref"]:
        fail("J_WITNESS_OUTCOME", "outcome record owner result differs from the witness outcome")
    if central["owner_result_ref"] is not None and central["owner_result_ref"] != outcome_refs["owner_result_ref"]:
        fail("J_WITNESS_OUTCOME", "central owner result differs from the witness outcome")
    if outcome_record["result_receipt_ref"] != outcome_refs["receipt_ref"]:
        fail("J_WITNESS_OUTCOME", "outcome record receipt differs from the witness outcome")
    if result["receipt_ref"] != outcome_refs["receipt_ref"]:
        fail("J_WITNESS_OUTCOME", "owner receipt differs from the witness outcome")
    if central["command_outcome_ref"] != outcome_refs["command_outcome_ref"]:
        fail("J_WITNESS_OUTCOME", "central outcome ref differs from the witness outcome")
    if result["command_outcome_ref"] != outcome_refs["command_outcome_ref"]:
        fail("J_WITNESS_OUTCOME", "owner outcome ref differs from the witness outcome")
    if error is not None and outcome_record["error_ref"] != result["error_ref"]:
        fail("J_WITNESS_OUTCOME", "outcome record error ref differs from the retained owner error")
    if not replayed and central["dispatch_id"] != dispatch["dispatch_id"]:
        fail("J_WITNESS_OUTCOME", "non-replay central dispatch differs from the witness original")

    redaction_text = json.dumps(receipt) + "\n" + json.dumps(error) + "\n" + (request["reason"] or "")
    secret_hit = SECRET_RE.search(redaction_text)
    if secret_hit:
        fail("J_REDACTION", f"receipt/error text matches the secret pattern: {secret_hit.group(0)[:24]!r}")
    path_hit = ABSOLUTE_PATH_RE.search(redaction_text)
    if path_hit:
        fail("J_REDACTION", f"receipt/error text embeds an absolute path: {path_hit.group(0)[:32]!r}")
    for ref in receipt["uri_refs"] + result["changed_paths"]:
        if ABSOLUTE_PATH_RE.search(ref):
            fail("J_REDACTION", "uri/changed ref embeds an absolute path instead of an opaque ref")

    expected_schema_ref = {"path": "Plans/lsp_restart_selected_contracts.schema.json",
                           "json_pointer": RESULT_POINTER, "schema_id": result_schema_id}
    if central["owner_result_schema_ref"] is not None and central["owner_result_schema_ref"] != expected_schema_ref:
        fail("J_REF_RESOLVE", "central owner result schema ref does not name the LSP restart result def")
    if outcome_record["owner_result_schema_ref"] != expected_schema_ref:
        fail("J_REF_RESOLVE", "outcome record owner result schema ref does not name the LSP restart result def")

    if receipt["operation_id"] != result["operation_id"]:
        fail("J_RECEIPT_TRUTH", "receipt operation_id differs from the result operation")
    if receipt["observable_work_id"] != result["observable_work"]["observable_work_id"]:
        fail("J_RECEIPT_TRUTH", "receipt work id differs from the result work id")
    if receipt["root_identity"] != server_ref["root_identity"]:
        fail("J_RECEIPT_TRUTH", "receipt root_identity differs from the immutable selection")
    if receipt["topology_generation"] != request["topology_generation"]:
        fail("J_RECEIPT_TRUTH", "receipt topology_generation differs from the request")
    if receipt["environment_connection_epoch"] != result["current_connection_epoch"]:
        fail("J_RECEIPT_TRUTH", "receipt connection epoch differs from the current epoch")
    if not receipt["servers"] or receipt["servers"][0]["server_id"] != server_ref["server_id"]:
        fail("J_RECEIPT_TRUTH", "receipt servers do not cover the selected original server")
    if receipt["servers"] and (
            receipt["servers"][0]["prior_session_generation"] != prior_sess
            or receipt["servers"][0]["current_session_generation"] != current_sess):
        fail("J_RECEIPT_TRUTH", "receipt server generations differ from the restart record")
    if ow_phase == "completed" and receipt["failure_reason"] is not None:
        fail("J_RECEIPT_TRUTH", "completed receipt carries a typed failure reason")
    if ow_phase in ("failed", "recovery_required"):
        if receipt["failure_reason"] is None:
            fail("J_RECEIPT_TRUTH", "terminal failure receipt lacks a typed failure reason")
        elif error is None or receipt["failure_reason"]["code"] != error["code"]:
            fail("J_RECEIPT_TRUTH", "receipt failure reason differs from the retained owner error")

    for field in ("project_id", "project_home_server_id", "execution_host_id",
                  "execution_environment_id", "source_location_id"):
        if receipt[field] != dispatch[field]:
            fail("J_WITNESS_TOPOLOGY", f"receipt {field} differs from the witness original")

    if not availability["available"]:
        fail("J_AVAILABILITY", "owner result exists although the selector reports unavailable")

    return failures


def live_central_enums() -> tuple[set[str], set[str]]:
    ui_schema = read_json(UI_RESPONSE_SCHEMA_PATH)
    result_status = {v for v in ui_schema["properties"]["result_status"]["enum"] if v is not None}
    error_codes = set(ui_schema["$defs"]["UICommandError"]["properties"]["code"]["enum"])
    return result_status, error_codes


def meta_failures(schema: dict[str, Any]) -> list[dict[str, Any]]:
    failures: list[dict[str, Any]] = []

    def fail(code: str, detail: str) -> None:
        failures.append({"code": code, "detail": detail})

    for ref in (REQUEST_REF, RESULT_REF, ERROR_REF, RECEIPT_REF, AVAILABILITY_REF):
        path, _, fragment = ref.partition("#")
        try:
            target = read_json(ROOT / path)
        except OSError as error:
            fail("J_REF_RESOLVE", f"schema ref target is unreadable: {ref}: {error}")
            continue
        try:
            resolve_pointer(target, fragment)
        except ValueError as error:
            fail("J_REF_RESOLVE", f"schema ref does not resolve: {ref}: {error}")

    touch = read_json(TOUCH_PATH)
    profiles = {p["profile_id"]: p for p in touch["profiles"]}
    profile = profiles.get("TCP-LSP")
    if profile is None:
        fail("M_TOUCH_REFS", "TCP-LSP profile is missing")
    else:
        if profile.get("payload_schema_ref") != REQUEST_REF:
            fail("M_TOUCH_REFS", "TCP-LSP payload_schema_ref is not the restart request def")
        if profile.get("result_schema_ref") != RESULT_REF:
            fail("M_TOUCH_REFS", "TCP-LSP result_schema_ref is not the restart result def")
        if profile.get("error_schema_ref") != ERROR_REF:
            fail("M_TOUCH_REFS", "TCP-LSP error_schema_ref is not the restart error def")
        if RECEIPT_REF not in profile.get("receipt_refs", []):
            fail("M_TOUCH_REFS", "TCP-LSP receipt_refs lack the typed restart receipt def")
        if FIXTURE_REF not in profile.get("test_refs", []):
            fail("M_TOUCH_REFS", "TCP-LSP test_refs lack the restart fixture contract")
        if (profile.get("handler_status"), profile.get("wiring_status")) != ("specified", "specified"):
            fail("M_TOUCH_REFS", "TCP-LSP handler/wiring status moved beyond specified")
    rows = {row[0]: row for row in touch["rows"]}
    lsp_row = rows.get("TOUCH-LSP-001")
    if lsp_row is None or lsp_row[4] != "partial":
        fail("M_TOUCH_REFS", "TOUCH-LSP-001 row is missing or no longer partial")

    wiring = read_json(WIRING_PATH)["entries"]
    row = wiring.get("catalog.lsp_restart_server")
    if row is None:
        fail("M_WIRING_REFS", "catalog.lsp_restart_server production row is missing")
    else:
        if row.get("request_schema_ref") != REQUEST_REF:
            fail("M_WIRING_REFS", "production row request_schema_ref is not the restart request def")
        if row.get("result_schema_ref") != RESULT_REF:
            fail("M_WIRING_REFS", "production row result_schema_ref is not the restart result def")
        if row.get("expected_event_types") != []:
            fail("M_WIRING_REFS", "production row must keep expected_event_types empty")
        if row.get("handler_location") != "handlers::lsp::restart_server":
            fail("M_WIRING_REFS", "production row handler_location moved")
        generic = "typed payload/result contract or explicit route/open no-persist disposition"
        if any(generic in check for check in row.get("acceptance_checks", [])):
            fail("M_WIRING_REFS", "production row keeps the generic no-persist alternative")

    if REJECTED_SPELLING in json.dumps(schema):
        fail("M_NO_ALIAS", "rejected spelling appears in the companion schema")

    try:
        gate_source = PLANS_VERIFY_PATH.read_text(encoding="utf-8")
    except OSError as error:
        fail("M_GATE_ENROLLED", f"aggregate gate script is unreadable: {error}")
    else:
        for snippet in ('"validate-lsp-restart-selected": cmd_validate_lsp_restart_selected',
                        '("validate_lsp_restart_selected", cmd_validate_lsp_restart_selected',
                        '("lsp_restart_selected", cmd_validate_lsp_restart_selected',
                        '"validate_lsp_restart_selected": "validate-lsp-restart-selected"',
                        '"lsp_restart_selected": "validate-lsp-restart-selected"'):
            if snippet not in gate_source:
                fail("M_GATE_ENROLLED", f"aggregate gate lacks enrollment: {snippet[:60]}")

    return failures


def validate() -> dict[str, Any]:
    failures: list[dict[str, Any]] = []
    try:
        schema = read_json(SCHEMA_PATH)
        Draft202012Validator.check_schema(schema)
    except Exception as error:  # noqa: BLE001 - report schema load problems structurally
        return {"check": "validate-lsp-restart-selected", "status": "fail",
                "failures": [{"code": "M_SCHEMA_VALID", "detail": f"companion schema unreadable: {error}"}],
                "limitations": CONDITIONAL_LIMITATIONS}
    try:
        shared = read_json(SHARED_SCHEMA_PATH)
        Draft202012Validator.check_schema(shared)
        ui_schema = read_json(UI_RESPONSE_SCHEMA_PATH)
        Draft202012Validator.check_schema(ui_schema)
        full_thread = read_json(FULL_THREAD_SCHEMA_PATH)
        Draft202012Validator.check_schema(full_thread)
    except Exception as error:  # noqa: BLE001 - fail closed when a real contract is missing
        return {"check": "validate-lsp-restart-selected", "status": "fail",
                "failures": [{"code": "M_ADAPTER_SCHEMA_MISSING",
                              "detail": f"real central/outcome contract unreadable, refusing reduced validation: {error}"}],
                "limitations": CONDITIONAL_LIMITATIONS}
    if ui_schema.get("$id") != "https://puppetmaster.local/schemas/ui_command_response/2.0.0/ui_command_response.schema.json":
        failures.append({"code": "M_ADAPTER_SCHEMA_MISSING", "detail": "central response $id mismatch"})
    if full_thread.get("$id") != "https://puppetmaster.local/schemas/full-thread-runtime-contracts.v1.json":
        failures.append({"code": "M_ADAPTER_SCHEMA_MISSING", "detail": "full-thread contracts $id mismatch"})
    registry = registry_for(schema, shared, ui_schema, full_thread)
    result_schema_id = schema["$defs"]["result"]["properties"]["schema_id"]["const"]
    live_result_status, live_error_codes = live_central_enums()
    for required in list(OW_TO_CENTRAL.values()) + ["no_op"]:
        if required not in live_result_status:
            failures.append({"code": "M_LIVE_ENUM",
                             "detail": f"live result_status enum lacks {required}"})
    for required in ("internal_error", "stale_projection", "permission_denied"):
        if required not in live_error_codes:
            failures.append({"code": "M_LIVE_ENUM",
                             "detail": f"live UICommandError enum lacks {required}"})

    fixtures = read_json(FIXTURE_PATH)
    if fixtures.get("schema_id") != "pm.lsp.restart_selected.fixtures.v1":
        failures.append({"code": "M_FIXTURE_ID", "detail": "fixture schema_id mismatch"})
    valid_count = 0
    for entry in fixtures.get("valid", []):
        valid_count += 1
        name = entry["name"]
        shape = shape_errors(entry["definition"], entry["value"], schema, registry)
        if shape:
            failures.append({"code": "SHAPE_INVALID", "case": name,
                             "detail": "; ".join(shape[:3])})
            continue
        if REJECTED_SPELLING in json.dumps(entry["value"]):
            failures.append({"code": "M_NO_ALIAS", "case": name,
                             "detail": "rejected spelling appears in a passing case"})
        for code, detail in join_failures(entry["value"], result_schema_id):
            failures.append({"code": code, "case": name, "detail": detail})

    invalid_count = 0
    for entry in fixtures.get("invalid", []):
        invalid_count += 1
        name = entry["name"]
        expected = entry["expect_failure"]
        shape = shape_errors(entry["definition"], entry["value"], schema, registry)
        if expected == "SHAPE_INVALID":
            if not shape:
                failures.append({"code": "NEGATIVE_PASSED_SHAPE", "case": name,
                                 "detail": "shape-negative unexpectedly validates"})
            continue
        if shape:
            failures.append({"code": "NEGATIVE_SHAPE_MISMATCH", "case": name,
                             "detail": f"join-negative fails shape instead of {expected}: "
                                       + "; ".join(shape[:3])})
            continue
        actual = sorted({code for code, _ in join_failures(entry["value"], result_schema_id)})
        if actual != [expected]:
            failures.append({"code": "NEGATIVE_CODE_MISMATCH", "case": name,
                             "detail": f"expected [{expected}] but joins fired {actual}"})

    failures.extend(meta_failures(schema))
    return {"check": "validate-lsp-restart-selected", "status": "pass" if not failures else "fail",
            "failures": failures, "valid_count": valid_count, "invalid_count": invalid_count,
            "limitations": CONDITIONAL_LIMITATIONS}


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Validate the LSP restart typed companion.")
    parser.add_argument("command", nargs="?", default="validate",
                        choices=("validate",),
                        help="Only validate is supported; static checks never dispatch.")
    args = parser.parse_args(argv)
    _ = args
    report = validate()
    print(json.dumps(report, indent=2))
    return 0 if report["status"] == "pass" else 1


if __name__ == "__main__":
    raise SystemExit(main())
