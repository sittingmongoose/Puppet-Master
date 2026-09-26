"""Typed Notifications/Sounds action adapter for exactly two existing routes.

Static technical companion only: it validates the closed typed request/result/
error/availability/currentness records for `cmd.notifications.destination.test`
and `cmd.sound.preview`, joins them to the authentic original (owner record),
the SIR dispatch binding and the dispatcher record through required injected
resolvers, and projects the actual central `pm.ui_command_response.v2` response
plus the existing Full Thread `CommandOutcomeRecord`.

Nothing here authenticates an issuer, dispatcher, caller, permission, delivery
attempt, audio device, receipt writer or physical custody. A schema-valid
boolean, a copied reference, a hash equality or fixture self-consistency is not
authentication, and no passing check here is native delivery or playback proof.
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

ACTIONS = ("cmd.notifications.destination.test", "cmd.sound.preview")
COMMANDS = frozenset(ACTIONS)
ROUTE = {
    "cmd.notifications.destination.test": "destination_test",
    "cmd.sound.preview": "sound_preview",
}
ACTION_SCHEMA = "Plans/notifications_sound_action_contracts.schema.json"
DISPATCH_SCHEMA = "Plans/sir_notifications_sound_dispatch.schema.json"
RESPONSE_SCHEMA = "Plans/ui_command_response.schema.json"
OUTCOME_SCHEMA = "Plans/full_thread_runtime_contracts.schema.json"
SHARED_SCHEMA = "Plans/shared_runtime_command_contracts.schema.json"
OUTCOME_POINTER = "#/$defs/CommandOutcomeRecord"

REQUEST_DEFINITION = {
    "cmd.notifications.destination.test": "destination_test_request",
    "cmd.sound.preview": "sound_preview_request",
}
ORIGINAL_DEFINITION = {
    "cmd.notifications.destination.test": "destination_test_original",
    "cmd.sound.preview": "sound_preview_original",
}
RESULT_DEFINITION = {
    "cmd.notifications.destination.test": "destination_test_result",
    "cmd.sound.preview": "sound_preview_result",
}
EFFECT_DEFINITION = {
    "cmd.notifications.destination.test": "destination_test_effect_binding",
    "cmd.sound.preview": "sound_preview_effect_binding",
}
PERMISSION_DEFINITION = {
    "cmd.notifications.destination.test": "destination_test_permission_basis",
    "cmd.sound.preview": "sound_preview_permission_basis",
}
HANDLER_ID = {
    "cmd.notifications.destination.test": "handlers::notifications::destination_test",
    "cmd.sound.preview": "handlers::sound::preview",
}
AVAILABILITY_SELECTOR = {
    "cmd.notifications.destination.test": "state.commands.notifications_destination_test.availability",
    "cmd.sound.preview": "state.commands.sound_preview.availability",
}
DISABLED_REASON_SELECTOR = {
    "cmd.notifications.destination.test": "state.commands.notifications_destination_test.disabled_reason",
    "cmd.sound.preview": "state.commands.sound_preview.disabled_reason",
}
BINDING = {
    "cmd.notifications.destination.test": {
        "path": ACTION_SCHEMA,
        "json_pointer": "#/$defs/destination_test_result",
        "schema_id": "pm.notifications_sound.destination_test_result.v1",
    },
    "cmd.sound.preview": {
        "path": ACTION_SCHEMA,
        "json_pointer": "#/$defs/sound_preview_result",
        "schema_id": "pm.notifications_sound.preview_result.v1",
    },
}
EFFECT_VALUES = {
    "cmd.notifications.destination.test": {
        "effect_kind": "receipt",
        "receipt_or_event_refs": ["cmd.notifications.destination.test.dispatch_receipt"],
        "expected_event_types": [],
        "handler_id": "handlers::notifications::destination_test",
    },
    "cmd.sound.preview": {
        "effect_kind": "receipt",
        "receipt_or_event_refs": ["cmd.sound.preview.dispatch_receipt"],
        "expected_event_types": [],
        "handler_id": "handlers::sound::preview",
    },
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
# The typed owner result is the delivery/playback truth: a failed or
# unrecoverable owner result can never be projected onto a terminal success
# CommandOutcome, and CV-333 then projects that CommandOutcome state onto the
# central response. This is the missing result->outcome link, not a hash or
# shape rule.
OWNER_RESULT_OUTCOME: dict[str, dict[str, frozenset[str]]] = {
    "cmd.notifications.destination.test": {
        "delivered": frozenset({"succeeded"}),
        "failed_permanent": frozenset({"failed"}),
        "failed_transient": frozenset({"failed"}),
        "denied": frozenset({"failed"}),
        "unavailable": frozenset({"failed"}),
        "queued": NONTERMINAL_OUTCOMES,
        "rate_limited": NONTERMINAL_OUTCOMES,
        "effect_unknown": frozenset({"terminal_unknown"}),
    },
    "cmd.sound.preview": {
        "playback_started": frozenset({"succeeded"}),
        "playback_completed": frozenset({"succeeded"}),
        "playback_stopped": frozenset({"succeeded"}),
        "unavailable": frozenset({"failed"}),
        "undecodable": frozenset({"failed"}),
        "device_failure": frozenset({"failed"}),
        "rejected_startup": frozenset({"failed"}),
    },
}
RESULT_STATUSES = ("pending", "succeeded", "failed", "cancelled", "no_op", "recovery_required")
DISABLED_REASON_ERROR_CODE = {
    "unavailable_destination": "blocked_state_required",
    "unavailable_asset": "blocked_state_required",
    "rate_limited": "blocked_state_required",
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
    "delay_seconds",
)


def _root(canon_root: Any) -> Path:
    return Path(canon_root) if canon_root else LOCAL


@lru_cache(maxsize=None)
def _document(root_text: str, path: str) -> dict[str, Any]:
    return json.loads((Path(root_text) / path).read_text(encoding="utf-8"))


@lru_cache(maxsize=None)
def _registry_for(root_text: str) -> Registry:
    """Register the real central contracts plus this companion's two schemas."""
    registry = Registry()
    for path in (RESPONSE_SCHEMA, OUTCOME_SCHEMA, SHARED_SCHEMA, ACTION_SCHEMA, DISPATCH_SCHEMA):
        document = _document(root_text, path)
        registry = registry.with_resource(document["$id"], Resource.from_contents(document))
    return registry


def _validator(root: Path, path: str, pointer: str) -> Draft202012Validator:
    document = _document(str(root), path)
    return Draft202012Validator(
        {"$ref": document["$id"] + pointer}, registry=_registry_for(str(root))
    ).evolve(format_checker=FormatChecker())


def shape_failures(definition: str, value: Any, *, canon_root: Any = None,
                   schema_path: str = ACTION_SCHEMA) -> list[str]:
    """Validate one named definition; "#" validates the whole document root."""
    root = _root(canon_root)
    pointer = definition if definition.startswith("#") else "#/$defs/" + definition
    validator = _validator(root, schema_path, pointer)
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
        "notification_sound_resolver_missing:" + name
        for name, resolver in resolvers.items()
        if not callable(resolver)
    ]


def _read(resolve: Callable[[str], Any], ref: Any, definition: str, errors: list[str],
          *, canon_root: Any = None, schema_path: str = ACTION_SCHEMA) -> Any:
    if not isinstance(ref, str):
        errors.append("notification_sound_unresolved_ref:" + repr(ref))
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
                failures.append("notification_sound_secret_material")
                break
    return failures


def _authority_identity(record: dict[str, Any]) -> tuple:
    """Target authority of a SIR target object or an owner original/result record."""
    if record.get("kind") == "notification_destination":
        return (record.get("destination_ref"), record.get("provider_kind"), record.get("destination_generation"))
    if record.get("kind") == "sound_asset":
        return (record.get("asset_ref"), record.get("source_kind"), record.get("asset_generation"))
    if "destination_ref" in record:
        return (record.get("destination_ref"), record.get("provider_kind"), record.get("destination_generation"))
    return (record.get("asset_ref"), record.get("source_kind"), record.get("asset_generation"))


def _request_authority(request: dict[str, Any], action: str) -> tuple:
    if action == "cmd.notifications.destination.test":
        return (request.get("destination_ref"), request.get("provider_kind"), request.get("destination_generation"))
    return (request.get("asset_ref"), request.get("source_kind"), request.get("asset_generation"))


def _permission_failures(action: str, basis: dict[str, Any], mode: Any) -> list[str]:
    """PS-124 / F3-405 admission facts; no native permission is proven here."""
    failures: list[str] = []
    if action == "cmd.notifications.destination.test":
        if basis.get("destination_enabled") is not True:
            failures.append("notification_sound_destination_disabled")
        if basis.get("rate_limit_admitted") is not True:
            failures.append("notification_sound_rate_limit_admission")
        if mode == "live" and basis.get("live_send_authority") is not True:
            failures.append("notification_sound_live_send_authority")
    else:
        if basis.get("read_admission") is not True:
            failures.append("notification_sound_read_admission")
        if basis.get("asset_available") is not True or basis.get("asset_hidden") is True:
            failures.append("notification_sound_asset_availability")
    return failures


def _owner_joins(action: str, request: dict[str, Any], original: dict[str, Any],
                 *, resolve_owner_original: Callable[[str], Any] | None = None,
                 canon_root: Any = None, errors: list[str]) -> None:
    if original.get("command_id") != action:
        errors.append("notification_sound_action_scope")
    for field in ("request_ref", "command_instance_id", "dispatch_id", "caller_ref"):
        expected = request["original_request_ref"] if field == "request_ref" else request.get(field)
        if original.get(field) != expected:
            errors.append("notification_sound_original_request" if field == "request_ref"
                          else "notification_sound_" + field)
    if _authority_identity(original) != _request_authority(request, action):
        errors.append("notification_sound_target_identity")
    if original.get("target_generation") != request.get("expected_target_generation"):
        errors.append("notification_sound_target_generation")
    if original.get("idempotency_key") != request.get("idempotency_key"):
        errors.append("notification_sound_idempotency_key")
    if action == "cmd.notifications.destination.test":
        if original.get("test_send_mode") != request.get("test_send_mode"):
            errors.append("notification_sound_mock_live_label")
        for field in ("source_event_ref", "attention_key", "event_family", "event_category",
                      "redaction_profile_ref"):
            if original.get(field) != request.get(field):
                errors.append("notification_sound_original_" + field)
        if original.get("permission_basis", {}).get("credential_ref") != request.get("credential_ref"):
            errors.append("notification_sound_credential_ref")
        record = _read(resolve_owner_original, original.get("destination_record_ref"),
                       "notification_destination_record", errors, canon_root=canon_root)
        if record is not None:
            if (record.get("destination_ref"), record.get("provider_kind")) != (
                    request.get("destination_ref"), request.get("provider_kind")):
                errors.append("notification_sound_target_identity")
            if record.get("generation") != request.get("destination_generation"):
                errors.append("notification_sound_target_generation")
            if record.get("enabled") is not True:
                errors.append("notification_sound_destination_disabled")
            if request.get("event_category") not in record.get("event_category_allowlist", []):
                errors.append("notification_sound_event_category_admission")
            if record.get("rate_limit_profile_ref") != original.get("permission_basis", {}).get(
                    "rate_limit_profile_ref"):
                errors.append("notification_sound_rate_limit_profile")
    else:
        if original.get("selection_gesture_ref") != request.get("selection_gesture_ref"):
            errors.append("notification_sound_selection_gesture")
    errors.extend(_permission_failures(action, original.get("permission_basis", {}),
                                       request.get("test_send_mode", "mock")))


def _sir_joins(action: str, request: dict[str, Any], sir: dict[str, Any],
               original: dict[str, Any], errors: list[str]) -> None:
    if sir.get("action_id") != action:
        errors.append("notification_sound_action_scope")
    if sir.get("request_ref") != request.get("original_request_ref"):
        errors.append("notification_sound_original_request")
    for field in ("command_instance_id", "dispatch_id", "idempotency_key"):
        if sir.get(field) != request.get(field):
            errors.append("notification_sound_" + field)
    if sir.get("payload_sha256") != original.get("payload_sha256"):
        errors.append("notification_sound_payload_digest")
    if sir.get("arguments_sha256") != original.get("arguments_sha256"):
        errors.append("notification_sound_arguments_digest")
    if _authority_identity(sir.get("target", {})) != _request_authority(request, action):
        errors.append("notification_sound_target_identity")
    if sir.get("target_generation") != request.get("expected_target_generation"):
        errors.append("notification_sound_target_generation")
    if sir.get("permission_snapshot") != original.get("permission_basis"):
        errors.append("notification_sound_permission_snapshot")
    if sir.get("actor_ref") != request.get("caller_ref"):
        errors.append("notification_sound_caller")
    identity = sir.get("identity", {})
    if identity.get("command_instance_id") != request.get("command_instance_id"):
        errors.append("notification_sound_identity_envelope")
    if identity.get("operation_id") != sir.get("operation_id"):
        errors.append("notification_sound_identity_envelope")


def _dispatcher_joins(action: str, request: dict[str, Any], sir: dict[str, Any],
                      dispatcher: dict[str, Any], errors: list[str]) -> None:
    if dispatcher.get("action_id") != action:
        errors.append("notification_sound_action_scope")
    if dispatcher.get("handler_id") != HANDLER_ID[action]:
        errors.append("notification_sound_handler_identity")
    # Both Touch rows stay partial: an implemented/verified claim is refused here.
    if dispatcher.get("handler_status") != "specified":
        errors.append("notification_sound_handler_status")
    if dispatcher.get("wiring_status") != "specified":
        errors.append("notification_sound_wiring_status")
    for field in ("request_ref", "command_instance_id", "dispatch_id", "idempotency_key"):
        expected = request.get("original_request_ref") if field == "request_ref" else request.get(field)
        if dispatcher.get(field) != expected:
            errors.append("notification_sound_dispatcher_binding")
    if dispatcher.get("dispatch_frame_id") != sir.get("dispatch_frame_id"):
        errors.append("notification_sound_dispatch_frame")
    if dispatcher.get("payload_sha256") != sir.get("payload_sha256"):
        errors.append("notification_sound_payload_digest")
    if dispatcher.get("availability_selector") != AVAILABILITY_SELECTOR[action]:
        errors.append("notification_sound_availability_selector")
    if dispatcher.get("disabled_reason_selector") != DISABLED_REASON_SELECTOR[action]:
        errors.append("notification_sound_disabled_reason_selector")
    if dispatcher.get("availability") != "available":
        errors.append("notification_sound_availability_dispatch")
    if dispatcher.get("availability") != "available" and dispatcher.get("disabled_reason") is None:
        errors.append("notification_sound_disabled_reason_projection")
    if dispatcher.get("current_target_generation") != sir.get("target_generation"):
        errors.append("notification_sound_current_generation_drift")
    if dispatcher.get("current_permission_snapshot") != sir.get("permission_snapshot"):
        errors.append("notification_sound_current_permission_drift")
    if dispatcher.get("current_caller_ref") != sir.get("caller_return_context"):
        errors.append("notification_sound_current_caller")


def _request_failures(request: dict[str, Any], *, resolve_owner_original: Callable[[str], Any],
                      resolve_sir_dispatch: Callable[[str], Any],
                      resolve_dispatcher: Callable[[str], Any], canon_root: Any = None) -> list[str]:
    action = request.get("command_id")
    if action not in COMMANDS:
        # Retired/foreign spellings stay outside the closed action set and fail
        # the closed record shape as well.
        return sorted(set(["notification_sound_action_scope"]
                          + shape_failures("#", request, canon_root=canon_root)))
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


def _result_failures(original_request: dict[str, Any], result: dict[str, Any], *,
                     resolve_owner_original: Callable[[str], Any],
                     resolve_sir_dispatch: Callable[[str], Any],
                     resolve_dispatcher: Callable[[str], Any],
                     canon_root: Any = None) -> list[str]:
    action = result.get("command_id")
    if action not in COMMANDS or original_request.get("command_id") != action:
        return ["notification_sound_action_scope"]
    errors = _request_failures(original_request, resolve_owner_original=resolve_owner_original,
                               resolve_sir_dispatch=resolve_sir_dispatch,
                               resolve_dispatcher=resolve_dispatcher, canon_root=canon_root)
    errors.extend(shape_failures(RESULT_DEFINITION[action], result, canon_root=canon_root))
    if any(failure.startswith("shape:") for failure in errors):
        return sorted(set(errors))
    original = _read(resolve_owner_original, original_request["original_request_ref"],
                     ORIGINAL_DEFINITION[action], errors, canon_root=canon_root)
    if result.get("original_request_ref") != original_request.get("original_request_ref"):
        errors.append("notification_sound_original_request")
    if (result.get("command_instance_id") != original_request.get("command_instance_id")
            or result.get("dispatch_id") != original_request.get("dispatch_id")):
        errors.append("notification_sound_foreign_result")
    if result.get("sir_dispatch_ref") != original_request.get("sir_dispatch_ref"):
        errors.append("notification_sound_sir_dispatch_binding")
    if result.get("dispatcher_ref") != original_request.get("dispatcher_ref"):
        errors.append("notification_sound_dispatcher_binding")
    if original is None:
        return sorted(set(errors))
    if _authority_identity(result) != _authority_identity(original):
        errors.append("notification_sound_target_identity")
    if result.get("target_generation") != original.get("target_generation"):
        errors.append("notification_sound_target_generation")
    if action == "cmd.notifications.destination.test":
        if result.get("test_send_mode") != original_request.get("test_send_mode"):
            errors.append("notification_sound_mock_live_label")
        if result.get("test_send_mode") != original.get("test_send_mode"):
            errors.append("notification_sound_mock_live_label")
        if result.get("source_event_ref") != original.get("source_event_ref"):
            errors.append("notification_sound_original_source_event_ref")
        if result.get("redaction_profile_ref") != original.get("redaction_profile_ref"):
            errors.append("notification_sound_receipt_redaction_profile")
        receipt_owner = _read(resolve_owner_original, original.get("destination_record_ref"),
                              "notification_destination_record", errors, canon_root=canon_root)
        outcome = result.get("outcome")
        status = result.get("status_class")
        if receipt_owner is not None:
            last_receipt = receipt_owner.get("last_test_receipt_ref")
            if outcome in {"delivered", "failed_permanent", "failed_transient", "denied", "unavailable"}:
                if result.get("receipt_ref") != last_receipt:
                    errors.append("notification_sound_foreign_receipt")
            if outcome in {"queued", "rate_limited"} and result.get("receipt_ref") == last_receipt:
                errors.append("notification_sound_queue_admission")
        expected_status = {
            "delivered": "success",
            "failed_permanent": "permanent_failure",
            "failed_transient": "transient_failure",
            "denied": "permanent_failure",
            "unavailable": "permanent_failure",
            "rate_limited": "rate_limited",
            "effect_unknown": "unknown",
            "queued": None,
        }[outcome]
        if expected_status is not None and status != expected_status:
            errors.append("notification_sound_status_class")
        if outcome == "queued" and status == "success":
            errors.append("notification_sound_queue_admission")
        if (outcome in {"delivered", "failed_permanent"} and result.get("test_send_mode") == "live"
                and result.get("response_digest") is None):
            errors.append("notification_sound_response_digest")
    else:
        outcome, state = result.get("outcome"), result.get("playback_state")
        if outcome == "playback_started" and state != "playing":
            errors.append("notification_sound_playback_evidence")
        if outcome == "playback_completed" and state not in {"completed", "released"}:
            errors.append("notification_sound_playback_evidence")
        if outcome == "playback_stopped" and state not in {"stopped", "released"}:
            errors.append("notification_sound_playback_evidence")
        if outcome in {"unavailable", "undecodable", "device_failure", "rejected_startup"} and state not in {
                "stopped", "released"}:
            errors.append("notification_sound_playback_evidence")
        if result.get("asset_ref") != original_request.get("asset_ref"):
            errors.append("notification_sound_playback_asset_substitution")
        if result.get("asset_generation") != original_request.get("asset_generation"):
            errors.append("notification_sound_playback_asset_substitution")
    errors.extend(_secret_material_failures(result))
    return sorted(set(errors))


def owner_result_outcome_failures(owner_result: dict[str, Any], outcome: dict[str, Any], *,
                                  canon_root: Any = None) -> list[str]:
    """Join the typed owner result to the existing CommandOutcome state.

    A recomputed digest, a valid shape or a copied ref does not make a failed
    delivery or an undecodable playback a central success.
    """
    failures = shape_failures("#", owner_result, canon_root=canon_root)
    failures.extend(shape_failures(OUTCOME_POINTER, outcome, canon_root=canon_root,
                                  schema_path=OUTCOME_SCHEMA))
    if failures:
        return ["shape:" + item for item in failures] if not any(
            item.startswith("shape:") for item in failures) else sorted(set(failures))
    action = owner_result.get("command_id")
    if action not in COMMANDS or outcome.get("command_id") != action:
        return ["notification_sound_action_scope"]
    allowed = OWNER_RESULT_OUTCOME.get(action, {}).get(owner_result.get("outcome"))
    if allowed is None or outcome.get("outcome") not in allowed:
        return ["notification_sound_owner_result_outcome_mapping"]
    return []


def _response_truth_failures(response: dict[str, Any], outcome: dict[str, Any]) -> list[str]:
    truth = OUTCOME_RESPONSE_TRUTH.get(outcome.get("outcome"))
    if truth is None:
        return ["notification_sound_outcome_state"]
    expected_ack, expected_results = truth
    if response.get("ack_status") != expected_ack or response.get("result_status") not in expected_results:
        return ["notification_sound_acknowledgement_is_not_delivery_success"]
    return []


def _replay_failures(response: dict[str, Any], original: Any, owner_result: Any) -> list[str]:
    failures: list[str] = []
    if response.get("replayed") is not True:
        if original is not None:
            failures.append("notification_sound_replay_marker")
        return failures
    if not isinstance(original, dict) or shape_failures("#", original, schema_path=RESPONSE_SCHEMA):
        return ["notification_sound_replay_original_missing"]
    if response.get("original_dispatch_id") != original.get("dispatch_id"):
        failures.append("notification_sound_replay_replacement_dispatch")
    for field in REPLAY_PRESERVED_RESPONSE_FIELDS:
        if response.get(field) != original.get(field):
            failures.append("notification_sound_replay_receipt_changed" if field in {"receipt_ref", "event_refs"}
                            else "notification_sound_replay_result_changed")
    if response.get("operation_id") != original.get("operation_id"):
        failures.append("notification_sound_replay_replacement_operation")
    if isinstance(owner_result, dict):
        reference = original.get("owner_result_ref")
        if reference is not None and reference == response.get("owner_result_ref") and original.get(
                "owner_result_schema_ref") != BINDING.get(response.get("command_id")):
            failures.append("notification_sound_replay_result_changed")
    return sorted(set(failures))


def _projection_failures(projection: dict[str, Any], *, request: dict[str, Any], result: dict[str, Any],
                         canon_root: Any = None) -> list[str]:
    action = result.get("command_id")
    if action != "cmd.notifications.destination.test":
        return ["notification_sound_preview_projection_authority"]
    errors = shape_failures("receipt_projection", projection, canon_root=canon_root)
    if errors:
        return errors
    if projection.get("receipt_ref") != result.get("receipt_ref"):
        errors.append("notification_sound_receipt_projection_receipt")
    if projection.get("delivery_attempt_id") != result.get("delivery_attempt_id"):
        errors.append("notification_sound_receipt_projection_attempt")
    if projection.get("source_event_ref") != result.get("source_event_ref"):
        errors.append("notification_sound_receipt_projection_source")
    if projection.get("mock_or_live") != result.get("test_send_mode"):
        errors.append("notification_sound_mock_live_projection")
    if projection.get("redaction_profile_ref") != result.get("redaction_profile_ref"):
        errors.append("notification_sound_receipt_projection_redaction")
    if projection.get("action_id") != request.get("command_id"):
        errors.append("notification_sound_receipt_projection_action")
    return sorted(set(errors))


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
        return sorted(set(["notification_sound_action_scope"] + errors))
    if response.get("response_kind") != "owner_operation":
        # A local route/open projection is never a substitute for the domain
        # outcome; a pre-dispatch refusal stays a truthful refusal with no
        # fabricated durable scope.
        if response.get("response_kind") == "local_projection":
            errors.append("notification_sound_local_projection_substitute")
        if response.get("response_kind") == "pre_dispatch_rejection":
            action_error = bundle.get("action_error")
            if not isinstance(action_error, dict):
                errors.append("notification_sound_error_projection")
            else:
                errors.extend(_error_failures(action_error, availability=bundle.get("availability"),
                                              response_error=response.get("error"),
                                              expected_phase="pre_dispatch", canon_root=canon_root))
            if any(bundle.get(field) is not None for field in ("outcome", "owner_result",
                                                               "resolved_outcome_ref",
                                                               "resolved_owner_result_ref")):
                errors.append("notification_sound_non_operation_owner_records")
        if response.get("event_refs"):
            errors.append("notification_sound_event_claim")
        errors.extend(_secret_material_failures(response))
        return sorted(set(errors))
    errors.extend(shape_failures(OUTCOME_POINTER, outcome, canon_root=canon_root,
                                 schema_path=OUTCOME_SCHEMA))
    if any(failure.startswith("shape:") for failure in errors):
        return sorted(set(errors))
    if not isinstance(request, dict) or not isinstance(normalized, dict):
        return sorted(set(errors + ["notification_sound_request_binding"]))
    if response.get("response_kind") != "owner_operation":
        errors.append("notification_sound_response_kind")
    errors.extend(_request_failures(request, resolve_owner_original=resolve_owner_original,
                                    resolve_sir_dispatch=resolve_sir_dispatch,
                                    resolve_dispatcher=resolve_dispatcher, canon_root=canon_root))
    errors.extend(_result_failures(request, result, resolve_owner_original=resolve_owner_original,
                                   resolve_sir_dispatch=resolve_sir_dispatch,
                                   resolve_dispatcher=resolve_dispatcher, canon_root=canon_root))
    # The normalized request is a downstream claim, not an original. Bind its
    # complete existing SIR tuple to the independently resolved dispatch before
    # using it as the bridge to CommandOutcome and the central response. In
    # particular SIR target_generation is its own domain, not topology or an
    # owner asset/destination generation guessed from a matching number.
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
                errors.append("notification_sound_original_sir_" + field)
    for field in ("request_ref", "command_id", "command_instance_id"):
        if response.get(field) != normalized.get(field):
            errors.append("notification_sound_response_request_" + field)
    if request.get("command_id") != action or result.get("command_id") != action:
        errors.append("notification_sound_action_scope")
    if response.get("request_ref") != request.get("original_request_ref"):
        errors.append("notification_sound_original_request")
    if response.get("command_instance_id") != request.get("command_instance_id"):
        errors.append("notification_sound_command_instance_id")
    if response.get("operation_id") != normalized.get("operation_id"):
        errors.append("notification_sound_response_operation_scope")
    if response.get("owner_identity") != normalized.get("owner_identity"):
        errors.append("notification_sound_response_scope_mismatch")
    if response.get("owner_identity") != outcome.get("identity"):
        errors.append("notification_sound_response_outcome_scope_mismatch")
    for field in ("payload_sha256", "idempotency_key", "target_generation", "dispatch_frame_id"):
        if outcome.get(field) != normalized.get(field):
            errors.append("notification_sound_outcome_request_" + field)
    if response.get("command_outcome_ref") != bundle.get("resolved_outcome_ref"):
        errors.append("notification_sound_command_outcome_binding")
    errors.extend(owner_result_outcome_failures(result, outcome, canon_root=canon_root))
    errors.extend(_response_truth_failures(response, outcome))
    errors.extend(_replay_failures(response, bundle.get("original_response"), result))
    if response.get("owner_result_schema_ref") != BINDING[action]:
        errors.append("notification_sound_owner_result_binding")
    if response.get("owner_result_ref") != bundle.get("resolved_owner_result_ref"):
        errors.append("notification_sound_copied_ref")
    if outcome.get("owner_result_ref") != bundle.get("resolved_owner_result_ref"):
        errors.append("notification_sound_copied_ref")
    if response.get("owner_result_ref") != outcome.get("owner_result_ref"):
        errors.append("notification_sound_copied_ref")
    try:
        digest = canonical_sha256(result)
    except ValueError:
        errors.append("notification_sound_owner_result_outside_digest_domain")
    else:
        if outcome.get("owner_result_sha256") != digest:
            errors.append("notification_sound_owner_result_digest")
    if response.get("event_refs"):
        errors.append("notification_sound_event_claim")
    if outcome.get("outcome") not in NONTERMINAL_OUTCOMES:
        if outcome.get("result_receipt_ref") != result.get("receipt_ref"):
            errors.append("notification_sound_receipt_identity")
        if response.get("receipt_ref") != outcome.get("result_receipt_ref"):
            errors.append("notification_sound_receipt_identity")
    if outcome.get("outcome") in NONTERMINAL_OUTCOMES:
        if outcome.get("result_receipt_ref") is not None:
            errors.append("notification_sound_queue_admission")
        if outcome.get("acknowledgement_receipt_ref") == result.get("receipt_ref"):
            errors.append("notification_sound_queue_admission")
    projection = bundle.get("projection")
    if projection is not None:
        errors.extend(_projection_failures(projection, request=request, result=result, canon_root=canon_root))
    elif action == "cmd.notifications.destination.test" and outcome.get("outcome") == "succeeded":
        errors.append("notification_sound_receipt_projection_missing")
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
        errors.append("notification_sound_error_phase")
    reason = error.get("availability_reason")
    if reason is not None and error.get("code") != DISABLED_REASON_ERROR_CODE.get(reason):
        errors.append("notification_sound_disabled_reason_error")
    if response_error is not None:
        if error.get("code") != response_error.get("code") or error.get("reason") != response_error.get("reason"):
            errors.append("notification_sound_error_projection")
        if error.get("offending_field") != response_error.get("offending_field"):
            errors.append("notification_sound_error_projection")
    else:
        errors.append("notification_sound_error_projection")
    if isinstance(availability, dict) and availability.get("action_id") is not None:
        if error.get("action_id") != availability.get("action_id"):
            errors.append("notification_sound_error_action")
        if error.get("availability_reason") != availability.get("disabled_reason"):
            errors.append("notification_sound_disabled_reason_projection")
    if isinstance(availability, dict) and availability.get("currentness", {}).get("stale") is True:
        if error.get("code") != "stale_projection":
            errors.append("notification_sound_currentness_error")
    return sorted(set(errors))


def _availability_failures(availability: dict[str, Any], *, action_request: Any = None,
                           dispatcher: Any = None, canon_root: Any = None) -> list[str]:
    errors = shape_failures("availability_projection", availability, canon_root=canon_root)
    if errors:
        return errors
    action = availability["action_id"]
    currentness = availability["currentness"]
    if currentness["stale"] != (currentness["observed_generation"] != currentness["target_generation"]):
        errors.append("notification_sound_currentness_mismatch")
    if isinstance(action_request, dict):
        if availability.get("availability") != "available":
            errors.append("notification_sound_availability_dispatch")
        if currentness["target_generation"] != action_request.get("expected_target_generation"):
            errors.append("notification_sound_current_generation_drift")
    if isinstance(dispatcher, dict):
        if dispatcher.get("availability_selector") != availability.get("availability_selector"):
            errors.append("notification_sound_availability_selector")
        if dispatcher.get("disabled_reason_selector") != availability.get("disabled_reason_selector"):
            errors.append("notification_sound_disabled_reason_selector")
        if dispatcher.get("availability") != availability.get("availability"):
            errors.append("notification_sound_availability_projection")
        if dispatcher.get("disabled_reason") != availability.get("disabled_reason"):
            errors.append("notification_sound_disabled_reason_projection")
        if dispatcher.get("current_target_generation") != currentness["observed_generation"]:
            errors.append("notification_sound_current_generation_drift")
    if action not in COMMANDS:
        errors.append("notification_sound_action_scope")
    return sorted(set(errors))


def _dispatch_self_failures(binding: dict[str, Any], *, canon_root: Any = None) -> list[str]:
    """Bare original binding: the argument-only digest stays its own owner value."""
    errors = shape_failures("dispatch_binding", binding, canon_root=canon_root, schema_path=DISPATCH_SCHEMA)
    if errors:
        return errors
    if binding["payload_sha256"] == binding["arguments_sha256"]:
        errors.append("notification_sound_arguments_digest")
    if not binding["identity"].get("command_instance_id"):
        errors.append("notification_sound_identity_envelope")
    return sorted(set(errors))


def _dispatcher_self_failures(binding: dict[str, Any], *, canon_root: Any = None) -> list[str]:
    errors = shape_failures("dispatcher_binding", binding, canon_root=canon_root,
                            schema_path=DISPATCH_SCHEMA)
    if errors:
        return errors
    if binding["handler_status"] != "specified":
        errors.append("notification_sound_handler_status")
    if binding["wiring_status"] != "specified":
        errors.append("notification_sound_wiring_status")
    if binding["availability"] == "available" and binding["disabled_reason"] is not None:
        errors.append("notification_sound_disabled_reason_projection")
    if binding["availability"] != "available" and binding["disabled_reason"] is None:
        errors.append("notification_sound_disabled_reason_projection")
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
        errors = list(errors) + ["notification_sound_inputs_mutated"]
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


def projection_failures(projection: dict[str, Any], *, request: dict[str, Any], result: dict[str, Any],
                        canon_root: Any = None) -> list[str]:
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
                failures.append(f"notification_sound_truth_table_drift:{outcome}:{ack}:{status}:{errors[0]}")
    return failures


def _truth_probe_response(ack: str, status: Any) -> dict[str, Any]:
    response = {
        "schema_id": "pm.ui_command_response.v2",
        "schema_version": "2.0.0",
        "dispatch_id": "dispatch:truth-probe",
        "request_ref": "request:truth-probe",
        "command_id": "cmd.sound.preview",
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
            "path": ACTION_SCHEMA,
            "json_pointer": "#/$defs/sound_preview_result",
            "schema_id": "pm.notifications_sound.preview_result.v1",
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


def notification_sound_semantic_failures(definition: str, value: dict[str, Any], *,
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
    if definition in ("request", "result", "error", "availability", "dispatch_binding",
                      "dispatcher_binding", "destination_record", "projection",
                      "destination_test_original", "sound_preview_original"):
        schema_path = DISPATCH_SCHEMA if definition in ("dispatch_binding", "dispatcher_binding") else ACTION_SCHEMA
        named = {
            "destination_record": "notification_destination_record",
            "request": "#",
            "result": "#",
            "error": "#",
            "availability": "#",
            "projection": "#",
        }.get(definition, definition)
        return shape_failures(named, value, canon_root=canon_root, schema_path=schema_path)
    raise ValueError("fixture definition required")
