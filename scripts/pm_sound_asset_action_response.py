"""Typed Sound asset action adapter for exactly two existing routes.

Static technical companion only: it validates the closed typed request/result/
error/availability/currentness records for `cmd.sound.asset.delete` and
`cmd.sound.asset.export`, joins them to the authentic original (owner record),
the SIR dispatch binding and the dispatcher record through required injected
resolvers, and projects the actual central `pm.ui_command_response.v2` response
plus the existing Full Thread `CommandOutcomeRecord`. A built-in delete
refusal projects as a central rejection without mutation and never as a hide or
disable translation; an export result reports the actual owner output with
redacted source/license/version/hash metadata.

Nothing here authenticates an issuer, dispatcher, caller, permission, handler,
receipt writer, export writer or physical custody. A schema-valid boolean, a
copied reference, a hash equality or fixture self-consistency is not
authentication, and no passing check here is native delete, export or
physical-custody proof.
"""

from __future__ import annotations

from copy import deepcopy
from functools import lru_cache
import hashlib
import json
import re
from pathlib import Path
from typing import Any, Callable

from jsonschema import Draft202012Validator, FormatChecker
from referencing import Registry, Resource

LOCAL = Path(__file__).resolve().parents[1]

ACTIONS = ("cmd.sound.asset.delete", "cmd.sound.asset.export")
COMMANDS = frozenset(ACTIONS)
DELETE = "cmd.sound.asset.delete"
EXPORT = "cmd.sound.asset.export"
DELETE_SCHEMA = "Plans/sound_asset_delete_action_contracts.schema.json"
EXPORT_SCHEMA = "Plans/sound_asset_export_action_contracts.schema.json"
DISPATCH_SCHEMA = "Plans/sir_sound_asset_action_dispatch.schema.json"
RESPONSE_SCHEMA = "Plans/ui_command_response.schema.json"
OUTCOME_SCHEMA = "Plans/full_thread_runtime_contracts.schema.json"
SHARED_SCHEMA = "Plans/shared_runtime_command_contracts.schema.json"
OUTCOME_POINTER = "#/$defs/CommandOutcomeRecord"

ACTION_SCHEMA = {
    DELETE: DELETE_SCHEMA,
    EXPORT: EXPORT_SCHEMA,
}
REQUEST_DEFINITION = {
    DELETE: "delete_request",
    EXPORT: "export_request",
}
ORIGINAL_DEFINITION = {
    DELETE: "delete_original",
    EXPORT: "export_original",
}
RESULT_DEFINITION = {
    DELETE: "delete_result",
    EXPORT: "export_result",
}
RECORD_DEFINITION = {
    DELETE: "sound_asset_record",
    EXPORT: "sound_asset_manifest_record",
}
EFFECT_DEFINITION = {
    DELETE: "delete_effect_binding",
    EXPORT: "export_effect_binding",
}
PERMISSION_DEFINITION = {
    DELETE: "delete_permission_basis",
    EXPORT: "export_permission_basis",
}
RECORD_REF_FIELD = {
    DELETE: "asset_record_ref",
    EXPORT: "manifest_record_ref",
}
RECORD_SCHEMA_ID = {
    DELETE: "pm.sound_asset.sound_asset_record.v1",
    EXPORT: "pm.sound_asset.manifest_record.v1",
}
HANDLER_ID = {
    DELETE: "handlers::sound::asset_delete",
    EXPORT: "handlers::sound::asset_export",
}
AVAILABILITY_SELECTOR = {
    DELETE: "state.commands.sound_asset_delete.availability",
    EXPORT: "state.commands.sound_asset_export.availability",
}
DISABLED_REASON_SELECTOR = {
    DELETE: "state.commands.sound_asset_delete.disabled_reason",
    EXPORT: "state.commands.sound_asset_export.disabled_reason",
}
BINDING = {
    DELETE: {
        "path": DELETE_SCHEMA,
        "json_pointer": "#/$defs/delete_result",
        "schema_id": "pm.sound_asset.delete_result.v1",
    },
    EXPORT: {
        "path": EXPORT_SCHEMA,
        "json_pointer": "#/$defs/export_result",
        "schema_id": "pm.sound_asset.export_result.v1",
    },
}
EFFECT_VALUES = {
    DELETE: {
        "effect_kind": "receipt",
        "receipt_or_event_refs": ["cmd.sound.asset.delete.dispatch_receipt"],
        "expected_event_types": [],
        "handler_id": "handlers::sound::asset_delete",
    },
    EXPORT: {
        "effect_kind": "receipt",
        "receipt_or_event_refs": ["cmd.sound.asset.export.dispatch_receipt"],
        "expected_event_types": [],
        "handler_id": "handlers::sound::asset_export",
    },
}
WIRING_ROW = {
    DELETE: "catalog.sound_asset_delete",
    EXPORT: "catalog.sound_asset_export",
}

# Plans/Contracts_V0.md#CV-333: accepted/acknowledged/executing project
# accepted+pending; succeeded projects succeeded or owner-verified no_op; failed
# and cancelled retain those states; rejected projects rejected with null result
# status; terminal_unknown projects recovery_required. Acknowledgement is never
# terminal success.
OUTCOME_RESPONSE_TRUTH: dict[str, tuple[str, frozenset[Any]]] = {
    "accepted": ("accepted", frozenset({"pending"})),
    "acknowledged": ("accepted", frozenset({"pending"})),
    "executing": ("accepted", frozenset({"pending"})),
    "succeeded": ("accepted", frozenset({"succeeded", "no_op"})),
    "failed": ("accepted", frozenset({"failed"})),
    "cancelled": ("accepted", frozenset({"cancelled"})),
    "rejected": ("rejected", frozenset({None})),
    "terminal_unknown": ("accepted", frozenset({"recovery_required"})),
}
NONTERMINAL_OUTCOMES = frozenset({"accepted", "acknowledged", "executing"})
# Owner-result -> CommandOutcome state mapping for exactly these two routes.
# The typed owner result is the delete/export truth: a refused built-in delete
# is a central rejection without mutation (never a hide or disable
# translation), a failed export can never be projected onto a terminal success
# CommandOutcome, and CV-333 then projects that CommandOutcome state onto the
# central response.
OWNER_RESULT_OUTCOME: dict[str, dict[str, frozenset[str]]] = {
    DELETE: {
        "soft_deleted": frozenset({"succeeded"}),
        "refused_builtin": frozenset({"rejected"}),
        "unavailable": frozenset({"failed"}),
        "failed": frozenset({"failed"}),
        "effect_unknown": frozenset({"terminal_unknown"}),
    },
    EXPORT: {
        "export_completed": frozenset({"succeeded"}),
        "unavailable": frozenset({"failed"}),
        "failed": frozenset({"failed"}),
        "effect_unknown": frozenset({"terminal_unknown"}),
    },
}
RESULT_STATUSES = ("pending", "succeeded", "failed", "cancelled", "no_op", "recovery_required")
DISABLED_REASON_ERROR_CODE = {
    "unavailable_asset": "blocked_state_required",
    "policy_refused": "blocked_state_required",
    "permission_denied": "permission_denied",
    "handler_unavailable": "handler_unavailable",
}
REPLAY_PRESERVED_RESPONSE_FIELDS = (
    "request_ref",
    "command_id",
    "command_instance_id",
    "response_kind",
    "ack_status",
    "result_status",
    "error",
    "event_refs",
    "receipt_ref",
    "operation_id",
    "owner_identity",
    "command_outcome_ref",
    "owner_result_ref",
    "owner_result_schema_ref",
)
SECRET_MATERIAL_PATTERNS = (
    ("url_scheme", re.compile(r"[A-Za-z][A-Za-z0-9+.-]*://")),
    ("slack_token", re.compile(r"xox[abprs]-")),
    ("api_key", re.compile(r"\bsk-[A-Za-z0-9]{8,}")),
    ("authorization_header", re.compile(r"(?i)\bbearer\s+\S+")),
    ("private_key", re.compile(r"-----BEGIN [A-Z ]*PRIVATE KEY-----")),
    ("home_path", re.compile(r"/(?:home|Users)/[^/\s]+")),
    ("windows_path", re.compile(r"[A-Za-z]:\\\\?")),
    ("secret_word", re.compile(r"(?i)\b(?:password|passwd|api[_-]?key|access[_-]?token|refresh[_-]?token)\b")),
)
FORBIDDEN_COMPANION_KEYS = (
    "ttl",
    "ttl_seconds",
    "store_key",
    "storage_key",
    "event_record",
    "event_record_id",
    "probe_count",
    "retry_policy",
    "retry_default",
    "default_volume",
    "volume_default",
    "retention_days",
    "max_bundle_bytes",
)


def _root(canon_root: Any) -> Path:
    return Path(canon_root) if canon_root else LOCAL


@lru_cache(maxsize=None)
def _document(root_text: str, path: str) -> dict[str, Any]:
    return json.loads((Path(root_text) / path).read_text(encoding="utf-8"))


@lru_cache(maxsize=None)
def _registry_for(root_text: str) -> Registry:
    """Register the real central contracts plus this companion's three schemas."""
    registry = Registry()
    for path in (RESPONSE_SCHEMA, OUTCOME_SCHEMA, SHARED_SCHEMA, DELETE_SCHEMA, EXPORT_SCHEMA,
                 DISPATCH_SCHEMA, "Plans/notifications_sound_action_contracts.schema.json"):
        document = _document(root_text, path)
        registry = registry.with_resource(document["$id"], Resource.from_contents(document))
    return registry


def _validator(root: Path, path: str, pointer: str) -> Draft202012Validator:
    document = _document(str(root), path)
    return Draft202012Validator(
        {"$ref": document["$id"] + pointer}, registry=_registry_for(str(root))
    ).evolve(format_checker=FormatChecker())


def _schema_for_definition(definition: str, value: Any = None) -> str:
    if definition in {"delete_request", "delete_original", "sound_asset_record", "delete_result",
                      "delete_effect_binding", "delete_permission_basis"}:
        return DELETE_SCHEMA
    if definition in {"export_request", "export_original", "sound_asset_manifest_record",
                      "export_result", "export_effect_binding", "export_permission_basis",
                      "export_evidence_projection"}:
        return EXPORT_SCHEMA
    if definition in {"availability_projection", "action_error"} and isinstance(value, dict):
        # The two route companions each carry a closed availability/error def;
        # route by the record's own action_id instead of guessing.
        return EXPORT_SCHEMA if value.get("action_id") == EXPORT else DELETE_SCHEMA
    if definition == "#" and isinstance(value, dict):
        if value.get("command_id") == EXPORT or value.get("action_id") == EXPORT:
            return EXPORT_SCHEMA
        return DELETE_SCHEMA
    return ACTION_SCHEMA[DELETE]


def shape_failures(definition: str, value: Any, *, canon_root: Any = None,
                   schema_path: str | None = None) -> list[str]:
    """Validate one named definition; "#" validates a whole companion document."""
    root = _root(canon_root)
    pointer = definition if definition.startswith("#") else "#/$defs/" + definition
    path = schema_path or _schema_for_definition(definition, value)
    validator = _validator(root, path, pointer)
    return ["shape:" + error.message for error in validator.iter_errors(value)]


def canonical_sha256(value: Any) -> str:
    """RFC 8785-style SHA-256 over the restricted integer/string oracle domain.

    Floats are refused instead of being normalized, as the existing Case L
    digest oracle does. Native RFC 8785 coverage is not claimed.
    """
    return hashlib.sha256(_jcs_bytes(value)).hexdigest()


def _jcs_bytes(value: Any) -> bytes:
    if isinstance(value, bool) or value is None:
        return b"true" if value is True else (b"false" if value is False else b"null")
    if isinstance(value, int):
        return str(value).encode("utf-8")
    if isinstance(value, float):
        raise ValueError("float outside the restricted digest oracle domain")
    if isinstance(value, str):
        return json.dumps(value, ensure_ascii=False).encode("utf-8")
    if isinstance(value, (list, tuple)):
        return b"[" + b",".join(_jcs_bytes(item) for item in value) + b"]"
    if isinstance(value, dict):
        for key in value:
            if not isinstance(key, str):
                raise ValueError("non-string object key outside the digest oracle domain")
        members = sorted(value.items(), key=lambda item: item[0].encode("utf-16-be"))
        return b"{" + b",".join(
            json.dumps(key, ensure_ascii=False).encode("utf-8") + b":" + _jcs_bytes(member)
            for key, member in members
        ) + b"}"
    raise ValueError(f"unsupported digest oracle value: {type(value).__name__}")


def _required_resolvers(resolvers: dict[str, Any]) -> list[str]:
    return [
        "sound_asset_resolver_missing:" + name
        for name, resolver in resolvers.items()
        if not callable(resolver)
    ]


def _read(resolve: Callable[[str], Any], ref: Any, definition: str, errors: list[str],
          *, canon_root: Any = None, schema_path: str | None = None) -> Any:
    if not isinstance(ref, str):
        errors.append("sound_asset_unresolved_ref:" + repr(ref))
        return None
    try:
        value = resolve(ref)
    except Exception as exc:  # noqa: BLE001 - fail closed on any resolver refusal
        errors.append("unresolved:" + ref + ":" + type(exc).__name__)
        return None
    failures = shape_failures(definition, value, canon_root=canon_root, schema_path=schema_path)
    if failures:
        errors.extend(failures)
        return None
    return value


def _secret_material_failures(value: Any, path: str = "#") -> list[str]:
    """Static secret-material heuristic; it is not native redaction proof."""
    failures: list[str] = []
    if isinstance(value, dict):
        for key, member in value.items():
            failures.extend(_secret_material_failures(member, f"{path}.{key}"))
    elif isinstance(value, list):
        for index, member in enumerate(value):
            failures.extend(_secret_material_failures(member, f"{path}[{index}]"))
    elif isinstance(value, str):
        for _label, pattern in SECRET_MATERIAL_PATTERNS:
            if pattern.search(value):
                failures.append("sound_asset_secret_material")
                break
    return failures


def _asset_identity(record: dict[str, Any]) -> tuple:
    """Target authority of an owner original/result record."""
    return (record.get("asset_ref"), record.get("source_kind"), record.get("asset_generation"))


def _request_authority(request: dict[str, Any]) -> tuple:
    return (request.get("asset_ref"), request.get("source_kind"), request.get("asset_generation"))


def _permission_failures(action: str, basis: dict[str, Any]) -> list[str]:
    """PS-124 / SP-222 / FileSafe admission facts; no native permission is proven here."""
    failures: list[str] = []
    if basis.get("asset_present") is not True:
        failures.append("sound_asset_asset_unavailable")
    if basis.get("explicit_action") is not True:
        failures.append("sound_asset_implicit_action")
    if action == DELETE:
        if basis.get("asset_mutation_authority") is not True:
            failures.append("sound_asset_permission_denied")
    else:
        if basis.get("read_admission") is not True:
            failures.append("sound_asset_read_admission")
        if basis.get("output_scope_bound") is not True:
            failures.append("sound_asset_output_scope_unbound")
    return failures


def _record_joins(action: str, request: dict[str, Any], original: dict[str, Any],
                  *, resolve_owner_original: Callable[[str], Any] | None = None,
                  canon_root: Any = None, errors: list[str]) -> Any:
    """Join the owner manifest/asset record behind the original; return it."""
    record = _read(resolve_owner_original, original.get(RECORD_REF_FIELD[action]),
                   RECORD_DEFINITION[action], errors, canon_root=canon_root)
    if record is None:
        return None
    if RECORD_SCHEMA_ID[action] != record.get("schema_id"):
        errors.append("sound_asset_target_identity")
    # The manifest record carries its own `generation` field (SP-222 manifest
    # identity), unlike the request/original/result `asset_generation` tuple.
    if (record.get("asset_ref"), record.get("source_kind"), record.get("generation")) != _request_authority(request):
        errors.append("sound_asset_target_identity")
    if record.get("generation") != request.get("asset_generation"):
        errors.append("sound_asset_target_generation")
    if record.get("source_kind") != request.get("source_kind"):
        errors.append("sound_asset_target_identity")
    if action == DELETE:
        expected_protected = request.get("source_kind") == "built_in"
        if record.get("protected") is not expected_protected:
            errors.append("sound_asset_protected_class")
        if record.get("soft_deletable") is expected_protected:
            errors.append("sound_asset_protected_class")
        basis = original.get("permission_basis", {})
        if basis.get("asset_soft_deletable") != record.get("soft_deletable"):
            errors.append("sound_asset_permission_snapshot_drift")
    return record


def _owner_joins(action: str, request: dict[str, Any], original: dict[str, Any],
                 *, resolve_owner_original: Callable[[str], Any] | None = None,
                 canon_root: Any = None, errors: list[str]) -> None:
    if original.get("command_id") != action:
        errors.append("sound_asset_action_scope")
    for field in ("request_ref", "command_instance_id", "dispatch_id", "caller_ref"):
        expected = request["original_request_ref"] if field == "request_ref" else request.get(field)
        if original.get(field) != expected:
            errors.append("sound_asset_original_request" if field == "request_ref"
                          else "sound_asset_" + field)
    if _asset_identity(original) != _request_authority(request):
        errors.append("sound_asset_target_identity")
    if original.get("target_generation") != request.get("expected_target_generation"):
        errors.append("sound_asset_target_generation")
    if original.get("idempotency_key") != request.get("idempotency_key"):
        errors.append("sound_asset_idempotency_key")
    if original.get("selection_gesture_ref") != request.get("selection_gesture_ref"):
        errors.append("sound_asset_selection_gesture")
    if original.get("scope") != request.get("scope"):
        errors.append("sound_asset_original_scope")
    if action == EXPORT:
        if original.get("output_target_ref") != request.get("output_target_ref"):
            errors.append("sound_asset_export_output_target_drift")
        if original.get("redaction_profile_ref") != request.get("redaction_profile_ref"):
            errors.append("sound_asset_export_redaction_profile")
    _record_joins(action, request, original, resolve_owner_original=resolve_owner_original,
                  canon_root=canon_root, errors=errors)
    errors.extend(_permission_failures(action, original.get("permission_basis", {})))


def _sir_joins(action: str, request: dict[str, Any], sir: dict[str, Any],
               original: dict[str, Any], errors: list[str]) -> None:
    if sir.get("action_id") != action:
        errors.append("sound_asset_action_scope")
    if sir.get("request_ref") != request.get("original_request_ref"):
        errors.append("sound_asset_original_request")
    for field in ("command_instance_id", "dispatch_id", "idempotency_key"):
        if sir.get(field) != request.get(field):
            errors.append("sound_asset_" + field)
    if sir.get("payload_sha256") != original.get("payload_sha256"):
        errors.append("sound_asset_payload_digest")
    if sir.get("arguments_sha256") != original.get("arguments_sha256"):
        errors.append("sound_asset_arguments_digest")
    if _asset_identity(sir.get("target", {})) != _request_authority(request):
        errors.append("sound_asset_target_identity")
    if sir.get("target_generation") != request.get("expected_target_generation"):
        errors.append("sound_asset_target_generation")
    if sir.get("permission_snapshot") != original.get("permission_basis"):
        errors.append("sound_asset_permission_snapshot")
    if sir.get("actor_ref") != request.get("caller_ref"):
        errors.append("sound_asset_caller")
    identity = sir.get("identity", {})
    if identity.get("command_instance_id") != request.get("command_instance_id"):
        errors.append("sound_asset_identity_envelope")
    if identity.get("operation_id") != sir.get("operation_id"):
        errors.append("sound_asset_identity_envelope")


def _dispatcher_joins(action: str, request: dict[str, Any], sir: dict[str, Any],
                      dispatcher: dict[str, Any], errors: list[str]) -> None:
    if dispatcher.get("action_id") != action:
        errors.append("sound_asset_action_scope")
    if dispatcher.get("handler_id") != HANDLER_ID[action]:
        errors.append("sound_asset_handler_identity")
    # Both Touch rows stay partial: an implemented/verified claim is refused here.
    if dispatcher.get("handler_status") != "specified":
        errors.append("sound_asset_handler_status")
    if dispatcher.get("wiring_status") != "specified":
        errors.append("sound_asset_wiring_status")
    for field in ("request_ref", "command_instance_id", "dispatch_id", "idempotency_key"):
        expected = request.get("original_request_ref") if field == "request_ref" else request.get(field)
        if dispatcher.get(field) != expected:
            errors.append("sound_asset_dispatcher_binding")
    if dispatcher.get("dispatch_frame_id") != sir.get("dispatch_frame_id"):
        errors.append("sound_asset_dispatch_frame")
    if dispatcher.get("payload_sha256") != sir.get("payload_sha256"):
        errors.append("sound_asset_payload_digest")
    if dispatcher.get("availability_selector") != AVAILABILITY_SELECTOR[action]:
        errors.append("sound_asset_availability_selector")
    if dispatcher.get("disabled_reason_selector") != DISABLED_REASON_SELECTOR[action]:
        errors.append("sound_asset_disabled_reason_selector")
    if dispatcher.get("availability") != "available":
        errors.append("sound_asset_availability_dispatch")
    if dispatcher.get("availability") != "available" and dispatcher.get("disabled_reason") is None:
        errors.append("sound_asset_disabled_reason_projection")
    if dispatcher.get("current_target_generation") != sir.get("target_generation"):
        errors.append("sound_asset_current_generation_drift")
    if dispatcher.get("current_permission_snapshot") != sir.get("permission_snapshot"):
        errors.append("sound_asset_current_permission_drift")
    if dispatcher.get("current_caller_ref") != sir.get("caller_return_context"):
        errors.append("sound_asset_current_caller")


def _request_failures(request: dict[str, Any], *, resolve_owner_original: Callable[[str], Any],
                      resolve_sir_dispatch: Callable[[str], Any],
                      resolve_dispatcher: Callable[[str], Any], canon_root: Any = None) -> list[str]:
    action = request.get("command_id")
    if action not in COMMANDS:
        # Retired/foreign spellings stay outside the closed action set and fail
        # the closed record shape as well.
        return sorted(set(["sound_asset_action_scope"]
                          + shape_failures("#", request, canon_root=canon_root,
                                           schema_path=_schema_for_definition("delete_request"))))
    errors = shape_failures(REQUEST_DEFINITION[action], request, canon_root=canon_root)
    if errors:
        return errors
    original = _read(resolve_owner_original, request["original_request_ref"],
                     ORIGINAL_DEFINITION[action], errors, canon_root=canon_root)
    sir = _read(resolve_sir_dispatch, request["sir_dispatch_ref"], "dispatch_binding", errors,
                canon_root=canon_root, schema_path=DISPATCH_SCHEMA)
    dispatcher = _read(resolve_dispatcher, request["dispatcher_ref"], "dispatcher_binding", errors,
                       canon_root=canon_root, schema_path=DISPATCH_SCHEMA)
    if original is not None:
        _owner_joins(action, request, original,
                     resolve_owner_original=resolve_owner_original, canon_root=canon_root, errors=errors)
    if original is not None and sir is not None:
        _sir_joins(action, request, sir, original, errors)
    if sir is not None and dispatcher is not None:
        _dispatcher_joins(action, request, sir, dispatcher, errors)
    errors.extend(_secret_material_failures(request))
    return sorted(set(errors))


def _delete_result_joins(result: dict[str, Any], request: dict[str, Any], original: dict[str, Any],
                         record: dict[str, Any] | None, errors: list[str]) -> None:
    """Built-in refusal, soft-delete truth, restoration and reference safety.

    SP-222 proves the absence of mutation only for the protected built-in direct
    refusal and ties retention, reference safety and restoration to the actual
    user soft-delete. The remaining outcomes are unresolved labels, not observed
    no-effect states: their effect, retention, safety and restoration facts stay
    unknown (null) and any asserted value, including false, is refused.
    """
    outcome = result.get("outcome")
    soft_deleted = outcome == "soft_deleted"
    unresolved = outcome in {"unavailable", "failed", "effect_unknown"}
    if soft_deleted:
        if result.get("asset_mutated") is not True:
            errors.append("sound_asset_delete_mutation_truth")
    elif outcome == "refused_builtin":
        if result.get("asset_mutated") is not False:
            errors.append("sound_asset_delete_mutation_truth")
    elif unresolved:
        if result.get("asset_mutated") is not None:
            errors.append("sound_asset_delete_mutation_truth")
        if (result.get("managed_content_retained") is not None
                or result.get("reference_safe") is not None):
            errors.append("sound_asset_delete_mutation_truth")
        if result.get("restoration_available") is not None or result.get("restoration_ref") is not None:
            errors.append("sound_asset_refusal_mutation")
    if outcome == "refused_builtin":
        if record is None or record.get("protected") is not True:
            errors.append("sound_asset_refusal_identity")
        if result.get("restoration_available") is True or result.get("restoration_ref") is not None:
            errors.append("sound_asset_refusal_mutation")
        if result.get("managed_content_retained") is not True or result.get("reference_safe") is not True:
            errors.append("sound_asset_refusal_mutation")
    if soft_deleted:
        if record is not None and record.get("protected") is True:
            errors.append("sound_asset_builtin_protected")
        if result.get("managed_content_retained") is not True:
            errors.append("sound_asset_delete_content_not_retained")
        if result.get("reference_safe") is not True:
            errors.append("sound_asset_delete_reference_unsafe")
        if result.get("restoration_available") is not True or not result.get("restoration_ref"):
            errors.append("sound_asset_delete_restoration_required")
    basis = original.get("permission_basis", {})
    if basis.get("asset_soft_deletable") is not True and outcome != "refused_builtin":
        errors.append("sound_asset_builtin_protected")
    if basis.get("asset_soft_deletable") is True and outcome == "refused_builtin":
        errors.append("sound_asset_refusal_identity")
    if result.get("asset_ref") != request.get("asset_ref") or result.get(
            "asset_generation") != request.get("asset_generation"):
        errors.append("sound_asset_delete_asset_substitution")


def _export_result_joins(result: dict[str, Any], request: dict[str, Any], original: dict[str, Any],
                         errors: list[str]) -> None:
    """Actual owner output, redacted metadata and non-mutating export truth."""
    outcome = result.get("outcome")
    if result.get("output_target_ref") != request.get("output_target_ref"):
        errors.append("sound_asset_export_output_target_drift")
    if result.get("redaction_profile_ref") != request.get("redaction_profile_ref"):
        errors.append("sound_asset_export_redaction_profile")
    if result.get("asset_ref") != request.get("asset_ref") or result.get(
            "asset_generation") != request.get("asset_generation"):
        errors.append("sound_asset_export_asset_substitution")
    if outcome == "export_completed":
        for field, rule in (
            ("source_metadata_included", "sound_asset_export_metadata_missing"),
            ("license_metadata_included", "sound_asset_export_metadata_missing"),
            ("version_metadata_included", "sound_asset_export_metadata_missing"),
            ("hash_metadata_included", "sound_asset_export_metadata_missing"),
        ):
            if result.get(field) is not True:
                errors.append(rule)
        if not result.get("bundle_digest"):
            errors.append("sound_asset_export_bundle_digest")
    else:
        if any(result.get(field) is True for field in (
                "source_metadata_included", "license_metadata_included",
                "version_metadata_included", "hash_metadata_included")):
            errors.append("sound_asset_export_metadata_claim")
        if result.get("bundle_digest") is not None:
            errors.append("sound_asset_export_bundle_digest")


def _result_failures(original_request: dict[str, Any], result: dict[str, Any], *,
                     resolve_owner_original: Callable[[str], Any],
                     resolve_sir_dispatch: Callable[[str], Any],
                     resolve_dispatcher: Callable[[str], Any],
                     canon_root: Any = None) -> list[str]:
    action = result.get("command_id")
    if action not in COMMANDS or original_request.get("command_id") != action:
        return ["sound_asset_action_scope"]
    errors = _request_failures(original_request, resolve_owner_original=resolve_owner_original,
                               resolve_sir_dispatch=resolve_sir_dispatch,
                               resolve_dispatcher=resolve_dispatcher, canon_root=canon_root)
    errors.extend(shape_failures(RESULT_DEFINITION[action], result, canon_root=canon_root))
    if any(failure.startswith("shape:") for failure in errors):
        return sorted(set(errors))
    original = _read(resolve_owner_original, original_request["original_request_ref"],
                     ORIGINAL_DEFINITION[action], errors, canon_root=canon_root)
    if result.get("original_request_ref") != original_request.get("original_request_ref"):
        errors.append("sound_asset_original_request")
    if (result.get("command_instance_id") != original_request.get("command_instance_id")
            or result.get("dispatch_id") != original_request.get("dispatch_id")):
        errors.append("sound_asset_foreign_result")
    if result.get("sir_dispatch_ref") != original_request.get("sir_dispatch_ref"):
        errors.append("sound_asset_sir_dispatch_binding")
    if result.get("dispatcher_ref") != original_request.get("dispatcher_ref"):
        errors.append("sound_asset_dispatcher_binding")
    if original is None:
        return sorted(set(errors))
    if _asset_identity(result) != _asset_identity(original):
        errors.append("sound_asset_target_identity")
    if result.get("target_generation") != original.get("target_generation"):
        errors.append("sound_asset_target_generation")
    record = _record_joins(action, original_request, original,
                           resolve_owner_original=resolve_owner_original,
                           canon_root=canon_root, errors=errors)
    if action == DELETE:
        _delete_result_joins(result, original_request, original, record, errors)
    else:
        _export_result_joins(result, original_request, original, errors)
    errors.extend(_secret_material_failures(result))
    return sorted(set(errors))


def owner_result_outcome_failures(owner_result: dict[str, Any], outcome: dict[str, Any], *,
                                  canon_root: Any = None) -> list[str]:
    """Join the typed owner result to the existing CommandOutcome state.

    A recomputed digest, a valid shape or a copied ref does not turn a refused
    built-in delete or a failed export into a central success.
    """
    failures = shape_failures("#", owner_result, canon_root=canon_root)
    failures.extend(shape_failures(OUTCOME_POINTER, outcome, canon_root=canon_root,
                                  schema_path=OUTCOME_SCHEMA))
    if failures:
        return ["shape:" + item for item in failures] if not any(
            item.startswith("shape:") for item in failures) else sorted(set(failures))
    action = owner_result.get("command_id")
    if action not in COMMANDS or outcome.get("command_id") != action:
        return ["sound_asset_action_scope"]
    allowed = OWNER_RESULT_OUTCOME.get(action, {}).get(owner_result.get("outcome"))
    if allowed is None or outcome.get("outcome") not in allowed:
        return ["sound_asset_owner_result_outcome_mapping"]
    return []


def _response_truth_failures(response: dict[str, Any], outcome: dict[str, Any]) -> list[str]:
    truth = OUTCOME_RESPONSE_TRUTH.get(outcome.get("outcome"))
    if truth is None:
        return ["sound_asset_outcome_state"]
    expected_ack, expected_results = truth
    if response.get("ack_status") != expected_ack or response.get("result_status") not in expected_results:
        return ["sound_asset_acknowledgement_is_not_outcome_success"]
    return []


def _replay_failures(response: dict[str, Any], original: Any, owner_result: Any) -> list[str]:
    failures: list[str] = []
    if response.get("replayed") is not True:
        if original is not None:
            failures.append("sound_asset_replay_marker")
        return failures
    if not isinstance(original, dict) or shape_failures("#", original, schema_path=RESPONSE_SCHEMA):
        return ["sound_asset_replay_original_missing"]
    if response.get("original_dispatch_id") != original.get("dispatch_id"):
        failures.append("sound_asset_replay_replacement_dispatch")
    for field in REPLAY_PRESERVED_RESPONSE_FIELDS:
        if response.get(field) != original.get(field):
            failures.append("sound_asset_replay_receipt_changed" if field in {"receipt_ref", "event_refs"}
                            else "sound_asset_replay_result_changed")
    if response.get("operation_id") != original.get("operation_id"):
        failures.append("sound_asset_replay_replacement_operation")
    if isinstance(owner_result, dict):
        reference = original.get("owner_result_ref")
        if reference is not None and reference == response.get("owner_result_ref") and original.get(
                "owner_result_schema_ref") != BINDING.get(response.get("command_id")):
            failures.append("sound_asset_replay_result_changed")
    return sorted(set(failures))


def _projection_failures(projection: dict[str, Any], *, request: dict[str, Any],
                         result: dict[str, Any], canon_root: Any = None) -> list[str]:
    """RAP-039 export-evidence projection join; only the export route has one."""
    action = result.get("command_id")
    if action != EXPORT:
        return ["sound_asset_delete_projection_authority"]
    errors = shape_failures("export_evidence_projection", projection, canon_root=canon_root)
    if errors:
        return errors
    if projection.get("receipt_ref") != result.get("receipt_ref"):
        errors.append("sound_asset_export_projection_receipt")
    if projection.get("asset_ref") != result.get("asset_ref"):
        errors.append("sound_asset_export_projection_source")
    if projection.get("output_target_ref") != result.get("output_target_ref"):
        errors.append("sound_asset_export_projection_output")
    if projection.get("bundle_digest") != result.get("bundle_digest"):
        errors.append("sound_asset_export_projection_digest")
    if projection.get("redaction_profile_ref") != result.get("redaction_profile_ref"):
        errors.append("sound_asset_export_projection_redaction")
    if set(projection.get("redacted_fields", [])) != set(result.get("redacted_fields", [])):
        errors.append("sound_asset_export_projection_redaction")
    if projection.get("action_id") != request.get("command_id"):
        errors.append("sound_asset_export_projection_action")
    return sorted(set(errors))


def _rejected_response_joins(bundle: dict[str, Any], response: dict[str, Any], result: dict[str, Any],
                             outcome: dict[str, Any], owner_result_digest: str | None,
                             errors: list[str]) -> None:
    """Central rejection truth: no result receipt, no projected owner result on
    the response, no acknowledgement laundering, but the owner refusal record
    stays bound (ref and digest) to the CommandOutcome."""
    if response.get("receipt_ref") is not None or outcome.get("result_receipt_ref") is not None:
        errors.append("sound_asset_receipt_identity")
    if response.get("owner_result_ref") is not None or response.get("owner_result_schema_ref") is not None:
        errors.append("sound_asset_copied_ref")
    if outcome.get("owner_result_ref") != bundle.get("resolved_owner_result_ref"):
        errors.append("sound_asset_copied_ref")
    if owner_result_digest is not None and outcome.get("owner_result_sha256") != owner_result_digest:
        errors.append("sound_asset_owner_result_digest")
    if outcome.get("acknowledgement_receipt_ref") == result.get("receipt_ref"):
        errors.append("sound_asset_queue_admission")


def _response_failures(bundle: dict[str, Any], *, resolve_owner_original: Callable[[str], Any],
                       resolve_sir_dispatch: Callable[[str], Any],
                       resolve_dispatcher: Callable[[str], Any],
                       canon_root: Any = None) -> list[str]:
    response = bundle.get("response")
    request = bundle.get("action_request")
    result = bundle.get("owner_result")
    normalized = bundle.get("normalized_request")
    outcome = bundle.get("outcome")
    errors = shape_failures("#", response, canon_root=canon_root, schema_path=RESPONSE_SCHEMA)
    action = response.get("command_id") if isinstance(response, dict) else None
    if action not in COMMANDS:
        return sorted(set(["sound_asset_action_scope"] + errors))
    if response.get("response_kind") != "owner_operation":
        # A local route/open projection is never a substitute for the domain
        # outcome; a pre-dispatch refusal stays a truthful refusal with no
        # fabricated durable scope.
        if response.get("response_kind") == "local_projection":
            errors.append("sound_asset_local_projection_substitute")
        if response.get("response_kind") == "pre_dispatch_rejection":
            action_error = bundle.get("action_error")
            if not isinstance(action_error, dict):
                errors.append("sound_asset_error_projection")
            else:
                errors.extend(_error_failures(action_error, availability=bundle.get("availability"),
                                              response_error=response.get("error"),
                                              expected_phase="pre_dispatch", canon_root=canon_root))
            if any(bundle.get(field) is not None for field in ("outcome", "owner_result",
                                                               "resolved_outcome_ref",
                                                               "resolved_owner_result_ref")):
                errors.append("sound_asset_non_operation_owner_records")
        if response.get("event_refs"):
            errors.append("sound_asset_event_claim")
        errors.extend(_secret_material_failures(response))
        return sorted(set(errors))
    errors.extend(shape_failures(OUTCOME_POINTER, outcome, canon_root=canon_root,
                                 schema_path=OUTCOME_SCHEMA))
    if any(failure.startswith("shape:") for failure in errors):
        return sorted(set(errors))
    if not isinstance(request, dict) or not isinstance(normalized, dict):
        return sorted(set(errors + ["sound_asset_request_binding"]))
    errors.extend(_request_failures(request, resolve_owner_original=resolve_owner_original,
                                    resolve_sir_dispatch=resolve_sir_dispatch,
                                    resolve_dispatcher=resolve_dispatcher, canon_root=canon_root))
    errors.extend(_result_failures(request, result, resolve_owner_original=resolve_owner_original,
                                   resolve_sir_dispatch=resolve_sir_dispatch,
                                   resolve_dispatcher=resolve_dispatcher, canon_root=canon_root))
    # The normalized request is a downstream claim, not an original. Bind its
    # complete existing SIR tuple to the independently resolved dispatch before
    # using it as the bridge to CommandOutcome and the central response.
    sir = _read(resolve_sir_dispatch, request.get("sir_dispatch_ref"),
                "dispatch_binding", errors, canon_root=canon_root,
                schema_path=DISPATCH_SCHEMA)
    if sir is not None:
        source_fields = {
            "request_ref": sir["request_ref"],
            "command_id": sir["action_id"],
            "command_instance_id": sir["command_instance_id"],
            "operation_id": sir["operation_id"],
            "owner_identity": sir["identity"],
            "payload_sha256": sir["payload_sha256"],
            "idempotency_key": sir["idempotency_key"],
            "target_generation": sir["target_generation"],
            "dispatch_frame_id": sir["dispatch_frame_id"],
        }
        for field, source_value in source_fields.items():
            if normalized.get(field) != source_value:
                errors.append("sound_asset_original_sir_" + field)
    for field in ("request_ref", "command_id", "command_instance_id"):
        if response.get(field) != normalized.get(field):
            errors.append("sound_asset_response_request_" + field)
    if request.get("command_id") != action or result.get("command_id") != action:
        errors.append("sound_asset_action_scope")
    if response.get("request_ref") != request.get("original_request_ref"):
        errors.append("sound_asset_original_request")
    if response.get("command_instance_id") != request.get("command_instance_id"):
        errors.append("sound_asset_command_instance_id")
    if response.get("operation_id") != normalized.get("operation_id"):
        errors.append("sound_asset_response_operation_scope")
    if response.get("owner_identity") != normalized.get("owner_identity"):
        errors.append("sound_asset_response_scope_mismatch")
    if response.get("owner_identity") != outcome.get("identity"):
        errors.append("sound_asset_response_outcome_scope_mismatch")
    for field in ("payload_sha256", "idempotency_key", "target_generation", "dispatch_frame_id"):
        if outcome.get(field) != normalized.get(field):
            errors.append("sound_asset_outcome_request_" + field)
    if response.get("command_outcome_ref") != bundle.get("resolved_outcome_ref"):
        errors.append("sound_asset_command_outcome_binding")
    errors.extend(owner_result_outcome_failures(result, outcome, canon_root=canon_root))
    errors.extend(_response_truth_failures(response, outcome))
    errors.extend(_replay_failures(response, bundle.get("original_response"), result))
    owner_result_digest = None
    try:
        owner_result_digest = canonical_sha256(result)
    except ValueError:
        errors.append("sound_asset_owner_result_outside_digest_domain")
    if outcome.get("outcome") == "rejected":
        _rejected_response_joins(bundle, response, result, outcome, owner_result_digest, errors)
    else:
        if response.get("owner_result_schema_ref") != BINDING[action]:
            errors.append("sound_asset_owner_result_binding")
        if response.get("owner_result_ref") != bundle.get("resolved_owner_result_ref"):
            errors.append("sound_asset_copied_ref")
        if outcome.get("owner_result_ref") != bundle.get("resolved_owner_result_ref"):
            errors.append("sound_asset_copied_ref")
        if response.get("owner_result_ref") != outcome.get("owner_result_ref"):
            errors.append("sound_asset_copied_ref")
        if owner_result_digest is not None and outcome.get("owner_result_sha256") != owner_result_digest:
            errors.append("sound_asset_owner_result_digest")
        if response.get("event_refs"):
            errors.append("sound_asset_event_claim")
        if outcome.get("outcome") not in NONTERMINAL_OUTCOMES:
            if outcome.get("result_receipt_ref") != result.get("receipt_ref"):
                errors.append("sound_asset_receipt_identity")
            if response.get("receipt_ref") != outcome.get("result_receipt_ref"):
                errors.append("sound_asset_receipt_identity")
        if outcome.get("outcome") in NONTERMINAL_OUTCOMES:
            if outcome.get("result_receipt_ref") is not None:
                errors.append("sound_asset_queue_admission")
            if outcome.get("acknowledgement_receipt_ref") == result.get("receipt_ref"):
                errors.append("sound_asset_queue_admission")
        projection = bundle.get("projection")
        if projection is not None:
            errors.extend(_projection_failures(projection, request=request, result=result,
                                               canon_root=canon_root))
        elif action == EXPORT and outcome.get("outcome") == "succeeded":
            errors.append("sound_asset_export_projection_missing")
    errors.extend(_secret_material_failures(bundle.get("response")))
    action_error = bundle.get("action_error")
    if action_error is not None:
        errors.extend(_error_failures(action_error, availability=bundle.get("availability"),
                                      response_error=response.get("error"), expected_phase="execution",
                                      canon_root=canon_root))
    return sorted(set(errors))


def _error_failures(error: dict[str, Any], *, availability: Any = None, response_error: Any = None,
                    expected_phase: str | None = None, canon_root: Any = None) -> list[str]:
    errors = shape_failures("action_error", error, canon_root=canon_root)
    if errors:
        return errors
    if expected_phase is not None and error.get("phase") != expected_phase:
        errors.append("sound_asset_error_phase")
    reason = error.get("availability_reason")
    if reason is not None and error.get("code") != DISABLED_REASON_ERROR_CODE.get(reason):
        errors.append("sound_asset_disabled_reason_error")
    if response_error is not None:
        if error.get("code") != response_error.get("code") or error.get("reason") != response_error.get("reason"):
            errors.append("sound_asset_error_projection")
        if error.get("offending_field") != response_error.get("offending_field"):
            errors.append("sound_asset_error_projection")
    else:
        errors.append("sound_asset_error_projection")
    if isinstance(availability, dict) and availability.get("action_id") is not None:
        if error.get("action_id") != availability.get("action_id"):
            errors.append("sound_asset_error_action")
        if error.get("availability_reason") != availability.get("disabled_reason"):
            errors.append("sound_asset_disabled_reason_projection")
    if isinstance(availability, dict) and availability.get("currentness", {}).get("stale") is True:
        if error.get("code") != "stale_projection":
            errors.append("sound_asset_currentness_error")
    return sorted(set(errors))


def _availability_failures(availability: dict[str, Any], *, action_request: Any = None,
                           dispatcher: Any = None, canon_root: Any = None) -> list[str]:
    errors = shape_failures("availability_projection", availability, canon_root=canon_root)
    if errors:
        return errors
    action = availability["action_id"]
    if action not in COMMANDS:
        errors.append("sound_asset_action_scope")
    currentness = availability["currentness"]
    if currentness["stale"] != (currentness["observed_generation"] != currentness["target_generation"]):
        errors.append("sound_asset_currentness_mismatch")
    if isinstance(action_request, dict):
        if availability.get("availability") != "available":
            errors.append("sound_asset_availability_dispatch")
        if currentness["target_generation"] != action_request.get("expected_target_generation"):
            errors.append("sound_asset_current_generation_drift")
    if isinstance(dispatcher, dict):
        if dispatcher.get("availability_selector") != availability.get("availability_selector"):
            errors.append("sound_asset_availability_selector")
        if dispatcher.get("disabled_reason_selector") != availability.get("disabled_reason_selector"):
            errors.append("sound_asset_disabled_reason_selector")
        if dispatcher.get("availability") != availability.get("availability"):
            errors.append("sound_asset_availability_projection")
        if dispatcher.get("disabled_reason") != availability.get("disabled_reason"):
            errors.append("sound_asset_disabled_reason_projection")
        if dispatcher.get("current_target_generation") != currentness["observed_generation"]:
            errors.append("sound_asset_current_generation_drift")
    return sorted(set(errors))


def _dispatch_self_failures(binding: dict[str, Any], *, canon_root: Any = None) -> list[str]:
    """Bare original binding: the argument-only digest stays its own owner value."""
    errors = shape_failures("dispatch_binding", binding, canon_root=canon_root, schema_path=DISPATCH_SCHEMA)
    if errors:
        return errors
    if binding["payload_sha256"] == binding["arguments_sha256"]:
        errors.append("sound_asset_arguments_digest")
    if not binding["identity"].get("command_instance_id"):
        errors.append("sound_asset_identity_envelope")
    return sorted(set(errors))


def _dispatcher_self_failures(binding: dict[str, Any], *, canon_root: Any = None) -> list[str]:
    errors = shape_failures("dispatcher_binding", binding, canon_root=canon_root,
                            schema_path=DISPATCH_SCHEMA)
    if errors:
        return errors
    if binding["handler_status"] != "specified":
        errors.append("sound_asset_handler_status")
    if binding["wiring_status"] != "specified":
        errors.append("sound_asset_wiring_status")
    if binding["availability"] == "available" and binding["disabled_reason"] is not None:
        errors.append("sound_asset_disabled_reason_projection")
    if binding["availability"] != "available" and binding["disabled_reason"] is None:
        errors.append("sound_asset_disabled_reason_projection")
    return sorted(set(errors))


def _pinned_call(function: Callable[..., list[str]], inputs: tuple[Any, ...],
                 resolvers: dict[str, Any], canon_root: Any) -> list[str]:
    """Snapshot inputs and every resolved value; later mutation is refused."""
    originals = tuple(inputs)
    snapshots = deepcopy(originals)
    observed: list[tuple[Any, Any]] = []
    wrapped: dict[str, Any] = {}
    for name, resolver in resolvers.items():
        if not callable(resolver):
            wrapped[name] = resolver
            continue

        def watcher(ref, _resolver=resolver):
            value = _resolver(ref)
            observed.append((value, deepcopy(value)))
            return value

        wrapped[name] = watcher
    errors = function(*originals, **wrapped, canon_root=canon_root)
    if originals != snapshots or any(value != snapshot for value, snapshot in observed):
        errors = list(errors) + ["sound_asset_inputs_mutated"]
    return sorted(set(errors))


def request_failures(request: dict[str, Any], *, resolve_owner_original: Callable[[str], Any],
                     resolve_sir_dispatch: Callable[[str], Any],
                     resolve_dispatcher: Callable[[str], Any], canon_root: Any = None) -> list[str]:
    """Typed request joins. All three resolvers are required; none defaults."""
    resolvers = {
        "resolve_owner_original": resolve_owner_original,
        "resolve_sir_dispatch": resolve_sir_dispatch,
        "resolve_dispatcher": resolve_dispatcher,
    }
    missing = _required_resolvers(resolvers)
    if missing:
        return missing
    return _pinned_call(_request_failures, (request,), resolvers, canon_root)


def result_failures(original_request: dict[str, Any], result: dict[str, Any], *,
                    resolve_owner_original: Callable[[str], Any],
                    resolve_sir_dispatch: Callable[[str], Any],
                    resolve_dispatcher: Callable[[str], Any], canon_root: Any = None) -> list[str]:
    resolvers = {
        "resolve_owner_original": resolve_owner_original,
        "resolve_sir_dispatch": resolve_sir_dispatch,
        "resolve_dispatcher": resolve_dispatcher,
    }
    missing = _required_resolvers(resolvers)
    if missing:
        return missing
    return _pinned_call(_result_failures, (original_request, result), resolvers, canon_root)


def response_failures(bundle: dict[str, Any], *, resolve_owner_original: Callable[[str], Any],
                      resolve_sir_dispatch: Callable[[str], Any],
                      resolve_dispatcher: Callable[[str], Any], canon_root: Any = None) -> list[str]:
    """Compose/validate the actual central v2 response and CommandOutcome binding."""
    resolvers = {
        "resolve_owner_original": resolve_owner_original,
        "resolve_sir_dispatch": resolve_sir_dispatch,
        "resolve_dispatcher": resolve_dispatcher,
    }
    missing = _required_resolvers(resolvers)
    if missing:
        return missing
    return _pinned_call(_response_failures, (bundle,), resolvers, canon_root)


def availability_failures(availability: dict[str, Any], *, action_request: Any = None,
                          dispatcher: Any = None, canon_root: Any = None) -> list[str]:
    return _availability_failures(availability, action_request=action_request, dispatcher=dispatcher,
                                  canon_root=canon_root)


def error_failures(error: dict[str, Any], *, availability: Any = None, response_error: Any = None,
                   expected_phase: str | None = None, canon_root: Any = None) -> list[str]:
    return _error_failures(error, availability=availability, response_error=response_error,
                           expected_phase=expected_phase, canon_root=canon_root)


def projection_failures(projection: dict[str, Any], *, request: dict[str, Any],
                        result: dict[str, Any], canon_root: Any = None) -> list[str]:
    return _projection_failures(projection, request=request, result=result, canon_root=canon_root)


def dispatch_binding_failures(binding: dict[str, Any], *, resolution: Any = None,
                              canon_root: Any = None) -> list[str]:
    """Bare dispatch/dispatcher record check; no resolver is required for a lone record."""
    if resolution == "dispatch":
        return _dispatch_self_failures(binding, canon_root=canon_root)
    if resolution == "dispatcher":
        return _dispatcher_self_failures(binding, canon_root=canon_root)
    raise ValueError("resolution must be 'dispatch' or 'dispatcher'")


def truth_table_agreement_failures(*, canon_root: Any = None) -> list[str]:
    """Cross-check the CV-333 projection table against the actual v2 schema."""
    root = _root(canon_root)
    failures: list[str] = []
    for outcome, (ack, results) in OUTCOME_RESPONSE_TRUTH.items():
        for status in sorted(results, key=lambda item: (item is not None, item)):
            response = _truth_probe_response(ack, status)
            errors = shape_failures("#", response, canon_root=root, schema_path=RESPONSE_SCHEMA)
            if errors:
                failures.append(f"sound_asset_truth_table_drift:{outcome}:{ack}:{status}:{errors[0]}")
    return failures


def _truth_probe_response(ack: str, status: Any) -> dict[str, Any]:
    response = {
        "schema_id": "pm.ui_command_response.v2",
        "schema_version": "2.0.0",
        "dispatch_id": "dispatch:truth-probe",
        "request_ref": "request:truth-probe",
        "command_id": "cmd.sound.asset.export",
        "command_instance_id": "command-instance:truth-probe",
        "response_kind": "owner_operation",
        "ack_status": ack,
        "result_status": status,
        "error": None,
        "event_refs": [],
        "receipt_ref": "receipt:truth-probe",
        "operation_id": "operation:truth-probe",
        "owner_identity": {
            "scope_kind": "project",
            "operation_id": "operation:truth-probe",
            "operation_generation": 1,
            "attempt_id": None,
            "command_instance_id": "command-instance:truth-probe",
            "server_id": "srv-1",
            "project_id": "project-1",
            "project_home_server_id": "srv-1",
            "named_plan_id": None,
            "thread_id": None,
            "goal_id": None,
            "execution_host_id": "host-1",
            "execution_environment_id": "env-1",
            "source_location_id": None,
            "topology_generation": 1,
        },
        "command_outcome_ref": "outcome:truth-probe",
        "owner_result_ref": "owner-result:truth-probe",
        "owner_result_schema_ref": {
            "path": EXPORT_SCHEMA,
            "json_pointer": "#/$defs/export_result",
            "schema_id": "pm.sound_asset.export_result.v1",
        },
        "replayed": False,
        "original_dispatch_id": None,
        "ts": "2026-09-25T20:00:00Z",
    }
    if ack == "rejected":
        response["error"] = {"code": "blocked_state_required", "reason": "projected refusal", "offending_field": None}
    elif status in {"failed", "recovery_required"}:
        response["error"] = {"code": "internal_error", "reason": "projected failure", "offending_field": None}
    elif status is None or status == "pending":
        response["receipt_ref"] = None if status is None else "receipt:truth-probe"
        if status is None:
            response["owner_result_ref"] = None
            response["owner_result_schema_ref"] = None
    return response


def fixture_dependencies(wrapper: dict[str, Any]) -> dict[str, Any]:
    """Explicit synthetic retained-value reader. Not issuer/native authentication."""
    records = deepcopy(wrapper["records"])
    mutations = wrapper.get("mutate_on_read") or []

    def reader(ref: str) -> Any:
        for rule in mutations:
            if rule.get("ref") != ref:
                continue
            if "field" in rule:
                records[ref][rule["field"]] = deepcopy(rule["value"])
            for path in rule.get("input_paths", []):
                node = wrapper
                for key in path[:-1]:
                    node = node[key]
                node[path[-1]] = deepcopy(rule["value"])
        return deepcopy(records[ref])

    return {
        "resolve_owner_original": reader,
        "resolve_sir_dispatch": reader,
        "resolve_dispatcher": reader,
    }


def sound_asset_semantic_failures(definition: str, value: dict[str, Any], *,
                                  canon_root: Any = None) -> list[str]:
    """Fixture-only composition; bare owner records are joined by the adapter."""
    dependencies = fixture_dependencies(value) if "records" in value else {}
    if definition == "request_case":
        return request_failures(value["request"], canon_root=canon_root, **dependencies)
    if definition == "result_case":
        return result_failures(value["request"], value["result"], canon_root=canon_root, **dependencies)
    if definition == "response_case":
        return response_failures(value, canon_root=canon_root, **dependencies)
    if definition == "availability_case":
        return availability_failures(value["availability"], action_request=value.get("request"),
                                     dispatcher=value.get("dispatcher"), canon_root=canon_root)
    if definition == "error_case":
        return error_failures(value["error"], availability=value.get("availability"),
                              response_error=value.get("response_error"), canon_root=canon_root)
    if definition == "projection_case":
        return projection_failures(value["projection"], request=value["request"], result=value["result"],
                                   canon_root=canon_root)
    if definition == "dispatch_case":
        return dispatch_binding_failures(value, resolution="dispatch", canon_root=canon_root)
    if definition == "dispatcher_case":
        return dispatch_binding_failures(value, resolution="dispatcher", canon_root=canon_root)
    if definition == "effect_binding":
        return shape_failures("#", value, canon_root=canon_root)
    if definition in ("request", "result", "error", "availability", "projection"):
        return shape_failures("#", value, canon_root=canon_root)
    if definition in ("dispatch_binding", "dispatcher_binding", "sound_asset_record",
                      "sound_asset_manifest_record", "delete_original", "export_original",
                      "delete_request", "export_request", "delete_result", "export_result"):
        schema_path = DISPATCH_SCHEMA if definition in ("dispatch_binding", "dispatcher_binding") else None
        return shape_failures(definition, value, canon_root=canon_root, schema_path=schema_path)
    raise ValueError("fixture definition required")
