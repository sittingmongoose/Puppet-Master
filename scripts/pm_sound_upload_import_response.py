"""Typed sound upload / pack import adapter for exactly two existing routes.

Static technical companion only: it validates the closed typed request/result/
error/availability/currentness records for `cmd.sound.upload` and
`cmd.sound.pack.import`, joins them to the authentic original (owner record),
the SIR dispatch binding and the dispatcher record through required injected
resolvers, and projects the actual central `pm.ui_command_response.v2` response
plus the existing Full Thread `CommandOutcomeRecord`.

Nothing here authenticates an issuer, dispatcher, caller, FileSafe decision,
permission, decoder, writer, managed asset, pack member or physical custody. A
schema-valid boolean, a copied reference, a hash equality or fixture
self-consistency is not authentication, and no passing check here is native
upload, import, validation, persistence or GUI proof. The owner limits are
SP-222's existing 5 MiB source, 10-second decoded and warn-above-3-second
values, consumed from the companion schema; no new limit, key, TTL, retry,
retention or default is introduced. SP-222 names no first-error precedence
between its independent source-size, decoded-duration, MIME/header/decode and
per-member path rules, so a result whose facts violate several of them at once
settles on exactly one existing rejection reason whose own owner facts hold:
success is still refused and a reason unsupported by the owner evidence is
refused. No ordering, new reason or new outcome is introduced.
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

ACTIONS = ("cmd.sound.upload", "cmd.sound.pack.import")
COMMANDS = frozenset(ACTIONS)
ACTION_SCHEMA = "Plans/sound_upload_import_action_contracts.schema.json"
DISPATCH_SCHEMA = "Plans/sir_sound_upload_import_dispatch.schema.json"
RESPONSE_SCHEMA = "Plans/ui_command_response.schema.json"
OUTCOME_SCHEMA = "Plans/full_thread_runtime_contracts.schema.json"
SHARED_SCHEMA = "Plans/shared_runtime_command_contracts.schema.json"
OUTCOME_POINTER = "#/$defs/CommandOutcomeRecord"

REQUEST_DEFINITION = {
    "cmd.sound.upload": "sound_upload_request",
    "cmd.sound.pack.import": "sound_pack_import_request",
}
ORIGINAL_DEFINITION = {
    "cmd.sound.upload": "sound_upload_original",
    "cmd.sound.pack.import": "sound_pack_import_original",
}
RESULT_DEFINITION = {
    "cmd.sound.upload": "sound_upload_result",
    "cmd.sound.pack.import": "sound_pack_import_result",
}
EFFECT_DEFINITION = {
    "cmd.sound.upload": "sound_upload_effect_binding",
    "cmd.sound.pack.import": "sound_pack_import_effect_binding",
}
HANDLER_ID = {
    "cmd.sound.upload": "handlers::sound::upload",
    "cmd.sound.pack.import": "handlers::sound::pack_import",
}
AVAILABILITY_SELECTOR = {
    "cmd.sound.upload": "state.commands.sound_upload.availability",
    "cmd.sound.pack.import": "state.commands.sound_pack_import.availability",
}
DISABLED_REASON_SELECTOR = {
    "cmd.sound.upload": "state.commands.sound_upload.disabled_reason",
    "cmd.sound.pack.import": "state.commands.sound_pack_import.disabled_reason",
}
BINDING = {
    "cmd.sound.upload": {
        "path": ACTION_SCHEMA,
        "json_pointer": "#/$defs/sound_upload_result",
        "schema_id": "pm.sound_upload_import.upload_result.v1",
    },
    "cmd.sound.pack.import": {
        "path": ACTION_SCHEMA,
        "json_pointer": "#/$defs/sound_pack_import_result",
        "schema_id": "pm.sound_upload_import.pack_import_result.v1",
    },
}
EFFECT_VALUES = {
    "cmd.sound.upload": {
        "effect_kind": "receipt",
        "receipt_or_event_refs": ["cmd.sound.upload.dispatch_receipt"],
        "expected_event_types": [],
        "handler_id": "handlers::sound::upload",
        "receipt_kind": "owner_managed_asset_receipt",
    },
    "cmd.sound.pack.import": {
        "effect_kind": "receipt",
        "receipt_or_event_refs": ["cmd.sound.pack.import.dispatch_receipt"],
        "expected_event_types": [],
        "handler_id": "handlers::sound::pack_import",
        "receipt_kind": "owner_pack_import_receipt",
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

# Owner-result -> CommandOutcome state mapping for exactly these two routes. A
# rejected, unavailable, denied or unsafe member/source result can never be
# projected onto a terminal success CommandOutcome, and an unknown native effect
# stays reconciliation-only. This is the result->outcome link, not a shape rule.
OWNER_RESULT_OUTCOME: dict[str, dict[str, frozenset[str]]] = {
    "cmd.sound.upload": {
        "stored": frozenset({"succeeded"}),
        "duplicate_linked": frozenset({"succeeded"}),
        "rejected_unsupported_format": frozenset({"failed"}),
        "rejected_decode_failure": frozenset({"failed"}),
        "rejected_source_too_large": frozenset({"failed"}),
        "rejected_duration_too_long": frozenset({"failed"}),
        "effect_unknown": frozenset({"terminal_unknown"}),
    },
    "cmd.sound.pack.import": {
        "imported_all": frozenset({"succeeded", "no_op"}),
        "imported_partial": frozenset({"succeeded"}),
        "review_required": frozenset({"failed"}),
        "rejected_no_members": frozenset({"failed"}),
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

# SP-222's seven PeonPing/OpenPeon compatibility categories and the exact
# existing notification meaning each one maps to. Import registers no
# EventRecord and does not make routine events audible.
CATEGORY_MAPPING = {
    "session.start": "routine_run_start",
    "task.complete": "routine_or_long_running_completion",
    "task.acknowledge": "acknowledgement_visual_or_optional_sound",
    "input.required": "input_or_approval_required",
    "task.error": "failure",
    "resource.limit": "rate_or_resource_limit",
    "user.spam": "repeated_prompt_user_spam",
}
# Owner-declared WAV/MP3/OGG compatibility set. The MIME family table only
# decides which declared family a routed type belongs to; it adds no format to
# the owner set and performs no native sniffing.
MIME_FAMILY = {
    "audio/wav": "wav",
    "audio/x-wav": "wav",
    "audio/wave": "wav",
    "audio/vnd.wave": "wav",
    "audio/mpeg": "mp3",
    "audio/mp3": "mp3",
    "audio/x-mp3": "mp3",
    "audio/ogg": "ogg",
    "application/ogg": "ogg",
    "audio/vorbis": "ogg",
}
OWNER_LIMIT_KEYS = ("source_size_limit_bytes", "decoded_duration_limit_ms", "duration_warning_ms")
# Existing rejection token of each independently resolved owner fact, and the
# exact adapter failure that fact reports when it is violated or when a result
# asserts that token without its own fact. No new reason or outcome is added and
# no first-error precedence is introduced: SP-222 names none.
UPLOAD_REASON_FAILURE = {
    "rejected_source_too_large": "sound_upload_import_source_size_limit",
    "rejected_duration_too_long": "sound_upload_import_decoded_duration_limit",
    "rejected_decode_failure": "sound_upload_import_header_decode_agreement",
    "rejected_unsupported_format": "sound_upload_import_format_mime_agreement",
}
MEMBER_REASON_FAILURE = {
    "rejected_unsafe_path": "sound_pack_import_unsafe_path",
    "rejected_source_too_large": "sound_pack_import_member_source_size_limit",
    "rejected_duration_too_long": "sound_pack_import_member_duration_limit",
    "rejected_decode_failure": "sound_pack_import_member_format_agreement",
    "rejected_unsupported_format": "sound_pack_import_member_mime_agreement",
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
    ("api_key", re.compile(r"\bsk-[A-Za-z0-9]{8,}")),
    ("authorization_header", re.compile(r"(?i)\bbearer\s+\S+")),
    ("private_key", re.compile(r"-----BEGIN [A-Z ]*PRIVATE KEY-----")),
    ("home_path", re.compile(r"/(?:home|Users)/[^/\s]+")),
    ("windows_path", re.compile(r"[A-Za-z]:\\\\?")),
    ("absolute_posix_path", re.compile(r"(?<![A-Za-z0-9._-])/[A-Za-z0-9._-]+/[A-Za-z0-9._-]+")),
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
    "audio_body",
    "audio_bytes",
    "raw_body",
    "raw_audio",
    "file_bytes",
    "content_bytes",
    "absolute_path",
    "source_path",
    "filesystem_path",
    "private_path",
    "member_bytes",
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


def owner_limits(canon_root: Any = None) -> dict[str, int]:
    """The owner limit values declared once in the companion schema."""
    document = _document(str(_root(canon_root)), ACTION_SCHEMA)
    limits = document["x-owner-limits"]
    if sorted(limits) != sorted(OWNER_LIMIT_KEYS):
        raise ValueError("the companion schema lost an owner limit key")
    return {key: int(limits[key]) for key in OWNER_LIMIT_KEYS}


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
        "sound_upload_import_resolver_missing:" + name
        for name, resolver in resolvers.items()
        if not callable(resolver)
    ]


def _read(resolve: Callable[[str], Any], ref: Any, definition: str, errors: list[str],
          *, canon_root: Any = None, schema_path: str = ACTION_SCHEMA) -> Any:
    if not isinstance(ref, str):
        errors.append("sound_upload_import_unresolved_ref:" + repr(ref))
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
    """Static secret/private-path heuristic; it is not native redaction proof."""
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
                failures.append("sound_upload_import_secret_material")
                break
    return failures


def mime_family(mime: Any) -> str | None:
    return MIME_FAMILY.get(mime) if isinstance(mime, str) else None


def _authority_identity(record: dict[str, Any]) -> tuple:
    """Selected intake identity of a SIR target, owner original or owner result.

    The extraction generation is its own owner value and is compared separately;
    it is never folded into this identity tuple.
    """
    if record.get("kind") == "sound_upload_source":
        return ("upload", record.get("source_file_ref"), record.get("source_kind"))
    if record.get("kind") == "sound_pack_source":
        return ("import", record.get("pack_source_ref"), record.get("source_kind"))
    if "source_file_ref" in record:
        return ("upload", record.get("source_file_ref"), record.get("source_kind"))
    return ("import", record.get("pack_source_ref"), record.get("source_kind"))


def _request_authority(request: dict[str, Any], action: str) -> tuple:
    if action == "cmd.sound.upload":
        return ("upload", request.get("source_file_ref"), request.get("source_kind"))
    return ("import", request.get("pack_source_ref"), request.get("source_kind"))


ROUTE_TARGET_KIND = {
    "cmd.sound.upload": "sound_upload_source",
    "cmd.sound.pack.import": "sound_pack_source",
}
SOURCE_GENERATION_FIELD = {
    "cmd.sound.upload": "source_generation",
    "cmd.sound.pack.import": "pack_generation",
}


def _permission_failures(basis: dict[str, Any]) -> list[str]:
    """Owner write admission and FileSafe source admission; no native authorization is proven."""
    failures: list[str] = []
    if basis.get("write_admission") is not True:
        failures.append("sound_upload_import_write_admission")
    if basis.get("file_safe_decision") != "admitted":
        failures.append("sound_upload_import_file_safe_admission")
    return failures


def _owner_joins(action: str, request: dict[str, Any], original: dict[str, Any],
                 *, resolve_owner_original: Callable[[str], Any] | None = None,
                 canon_root: Any = None, errors: list[str]) -> None:
    limits = owner_limits(canon_root)
    if original.get("command_id") != action:
        errors.append("sound_upload_import_action_scope")
    for field in ("request_ref", "command_instance_id", "dispatch_id", "caller_ref"):
        expected = request["original_request_ref"] if field == "request_ref" else request.get(field)
        if original.get(field) != expected:
            errors.append("sound_upload_import_original_request" if field == "request_ref"
                          else "sound_upload_import_" + field)
    if _authority_identity(original) != _request_authority(request, action):
        errors.append("sound_upload_import_source_identity")
    if original.get("target_generation") != request.get("expected_target_generation"):
        errors.append("sound_upload_import_target_generation")
    generation_field = SOURCE_GENERATION_FIELD[action]
    if original.get(generation_field) != request.get(generation_field):
        errors.append("sound_upload_import_source_generation")
    if original.get("idempotency_key") != request.get("idempotency_key"):
        errors.append("sound_upload_import_idempotency_key")
    if original.get("scope") != request.get("scope"):
        errors.append("sound_upload_import_scope")
    original_limits = original.get("owner_limits", {})
    if original_limits != limits:
        errors.append("sound_upload_import_owner_limits")
    if original.get("file_safe_admission_ref") != request.get("file_safe_admission_ref"):
        errors.append("sound_upload_import_file_safe_decision_ref")
    basis = original.get("permission_basis", {})
    if basis.get("file_safe_decision_ref") != request.get("file_safe_admission_ref"):
        errors.append("sound_upload_import_file_safe_decision_ref")
    if action == "cmd.sound.upload":
        if original.get("source_selection_gesture_ref") != request.get("source_selection_gesture_ref"):
            errors.append("sound_upload_import_source_selection_gesture")
        if original.get("display_name") != request.get("display_name"):
            errors.append("sound_upload_import_display_name")
        if original.get("declared_source_bytes") != request.get("declared_source_bytes"):
            errors.append("sound_upload_import_declared_source_bytes")
        if original.get("container_format") != request.get("declared_container_format"):
            errors.append("sound_upload_import_format_mime_agreement")
        if original.get("mime_type") != request.get("declared_mime_type"):
            errors.append("sound_upload_import_format_mime_agreement")
        if request.get("declared_source_bytes", 0) > limits["source_size_limit_bytes"]:
            errors.append("sound_upload_import_source_size_limit")
        if mime_family(request.get("declared_mime_type")) != request.get("declared_container_format"):
            errors.append("sound_upload_import_format_mime_agreement")
    else:
        for field in ("pack_selection_gesture_ref", "declared_manifest_version",
                      "declared_member_count", "declared_pack_bytes",
                      "compatibility_profile_ref", "category_mapping_ref", "pack_license_ref"):
            if original.get(field) != request.get(field):
                errors.append("sound_upload_import_original_" + field)
        if original.get("manifest_version_reviewed") != request.get("manifest_version_reviewed"):
            errors.append("sound_upload_import_manifest_version_review")
    errors.extend(_permission_failures(basis))
    # Admission facts: a missing source, a refused path or a refused write is a
    # pre-dispatch refusal, never a dispatched owner result.
    if original.get("source_available") is not True:
        errors.append("sound_upload_import_source_availability")
    if original.get("path_admitted") is not True:
        errors.append("sound_upload_import_path_admission")


def _sir_joins(action: str, request: dict[str, Any], sir: dict[str, Any],
               original: dict[str, Any], errors: list[str]) -> None:
    if sir.get("action_id") != action:
        errors.append("sound_upload_import_action_scope")
    if sir.get("request_ref") != request.get("original_request_ref"):
        errors.append("sound_upload_import_original_request")
    for field in ("command_instance_id", "dispatch_id", "idempotency_key"):
        if sir.get(field) != request.get(field):
            errors.append("sound_upload_import_" + field)
    if sir.get("payload_sha256") != original.get("payload_sha256"):
        errors.append("sound_upload_import_payload_digest")
    if sir.get("arguments_sha256") != original.get("arguments_sha256"):
        errors.append("sound_upload_import_arguments_digest")
    if _authority_identity(sir.get("target", {})) != _request_authority(request, action):
        errors.append("sound_upload_import_source_identity")
    if sir.get("target", {}).get("kind") != ROUTE_TARGET_KIND[action]:
        errors.append("sound_upload_import_source_identity")
    if sir.get("target", {}).get(SOURCE_GENERATION_FIELD[action]) != request.get(
            SOURCE_GENERATION_FIELD[action]):
        errors.append("sound_upload_import_source_generation")
    if sir.get("target_generation") != request.get("expected_target_generation"):
        errors.append("sound_upload_import_target_generation")
    if sir.get("permission_snapshot") != original.get("permission_basis"):
        errors.append("sound_upload_import_permission_snapshot")
    if sir.get("actor_ref") != request.get("caller_ref"):
        errors.append("sound_upload_import_caller")
    identity = sir.get("identity", {})
    if identity.get("command_instance_id") != request.get("command_instance_id"):
        errors.append("sound_upload_import_identity_envelope")
    if identity.get("operation_id") != sir.get("operation_id"):
        errors.append("sound_upload_import_identity_envelope")


def _dispatcher_joins(action: str, request: dict[str, Any], sir: dict[str, Any],
                      dispatcher: dict[str, Any], errors: list[str]) -> None:
    if dispatcher.get("action_id") != action:
        errors.append("sound_upload_import_action_scope")
    if dispatcher.get("handler_id") != HANDLER_ID[action]:
        errors.append("sound_upload_import_handler_identity")
    # Both Touch rows stay partial: an implemented/verified claim is refused here.
    if dispatcher.get("handler_status") != "specified":
        errors.append("sound_upload_import_handler_status")
    if dispatcher.get("wiring_status") != "specified":
        errors.append("sound_upload_import_wiring_status")
    for field in ("request_ref", "command_instance_id", "dispatch_id", "idempotency_key"):
        expected = request.get("original_request_ref") if field == "request_ref" else request.get(field)
        if dispatcher.get(field) != expected:
            errors.append("sound_upload_import_dispatcher_binding")
    if dispatcher.get("dispatch_frame_id") != sir.get("dispatch_frame_id"):
        errors.append("sound_upload_import_dispatch_frame")
    if dispatcher.get("payload_sha256") != sir.get("payload_sha256"):
        errors.append("sound_upload_import_payload_digest")
    if dispatcher.get("availability_selector") != AVAILABILITY_SELECTOR[action]:
        errors.append("sound_upload_import_availability_selector")
    if dispatcher.get("disabled_reason_selector") != DISABLED_REASON_SELECTOR[action]:
        errors.append("sound_upload_import_disabled_reason_selector")
    if dispatcher.get("availability") != "available":
        errors.append("sound_upload_import_availability_dispatch")
    if dispatcher.get("availability") != "available" and dispatcher.get("disabled_reason") is None:
        errors.append("sound_upload_import_disabled_reason_projection")
    if dispatcher.get("current_target_generation") != sir.get("target_generation"):
        errors.append("sound_upload_import_current_generation_drift")
    if dispatcher.get("current_permission_snapshot") != sir.get("permission_snapshot"):
        errors.append("sound_upload_import_current_permission_drift")
    if dispatcher.get("current_caller_ref") != sir.get("caller_return_context"):
        errors.append("sound_upload_import_current_caller")


def _request_failures(request: dict[str, Any], *, resolve_owner_original: Callable[[str], Any],
                      resolve_sir_dispatch: Callable[[str], Any],
                      resolve_dispatcher: Callable[[str], Any], canon_root: Any = None) -> list[str]:
    action = request.get("command_id")
    if action not in COMMANDS:
        # Retired/foreign spellings stay outside the closed action set and fail
        # the closed record shape as well.
        return sorted(set(["sound_upload_import_action_scope"]
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


def _upload_outcome_failures(result: dict[str, Any], original: dict[str, Any],
                            limits: dict[str, int], errors: list[str]) -> None:
    """Owner facts decide which outcomes an uploaded asset outcome can truthfully be."""
    outcome = result.get("outcome")
    declared = outcome != "effect_unknown"
    size_over = original.get("measured_source_bytes", 0) > limits["source_size_limit_bytes"]
    duration_over = original.get("decoded_duration_ms", 0) > limits["decoded_duration_limit_ms"]
    decode_mismatch = original.get("header_format") != original.get("decoded_format")
    format_mismatch = original.get("decoded_format") != original.get("container_format")
    family = mime_family(original.get("mime_type"))
    accepted = outcome in ("stored", "duplicate_linked")
    if declared:
        # SP-222 requires the 5 MiB source cap, the 10-second decoded cap and
        # MIME/header/decode agreement, but names no first-error precedence and
        # no product choice may invent one. Each independently resolved owner
        # fact therefore admits exactly its own existing rejection reason, one
        # truthful applicable reason may answer for a source whose facts violate
        # several limits at once, success is refused while any fact holds, and a
        # reason whose own facts do not hold stays unsupported.
        reasons = {
            "rejected_source_too_large": size_over,
            "rejected_duration_too_long": duration_over,
            "rejected_decode_failure": decode_mismatch,
            "rejected_unsupported_format": format_mismatch,
        }
        applicable = {reason for reason, holds in reasons.items() if holds}
        if outcome in reasons:
            if outcome not in applicable:
                errors.append(UPLOAD_REASON_FAILURE[outcome])
        else:
            for reason in sorted(applicable):
                errors.append(UPLOAD_REASON_FAILURE[reason])
        if family is None or family != original.get("container_format"):
            errors.append("sound_upload_import_format_mime_agreement")
    if accepted:
        manifest = result.get("manifest") or {}
        if manifest.get("source_kind") != "user_uploaded":
            errors.append("sound_upload_import_manifest_source_kind")
        if manifest.get("sha256") != result.get("content_sha256"):
            errors.append("sound_upload_import_manifest_digest")
        if manifest.get("format") != original.get("container_format"):
            errors.append("sound_upload_import_manifest_format")
        if manifest.get("duration_ms") != result.get("duration_ms"):
            errors.append("sound_upload_import_manifest_duration")
        if result.get("duration_ms") != original.get("decoded_duration_ms"):
            errors.append("sound_upload_import_manifest_duration")
        if manifest.get("display_name") != original.get("display_name") and outcome == "stored":
            errors.append("sound_upload_import_display_name")
        if manifest.get("scope") != original.get("scope"):
            errors.append("sound_upload_import_manifest_scope")
        if result.get("normalization_applied") is not True:
            errors.append("sound_upload_import_manifest_normalization")
        if result.get("silence_trimmed") is not True:
            errors.append("sound_upload_import_silence_trim")
        if result.get("duration_warning") != (result.get("duration_ms", 0) > limits["duration_warning_ms"]):
            errors.append("sound_upload_import_duration_warning")
        if result.get("file_safe_decision_ref") != original.get("file_safe_admission_ref"):
            errors.append("sound_upload_import_file_safe_decision_ref")
        if outcome == "duplicate_linked":
            if result.get("asset_ref") != result.get("duplicate_of_asset_ref"):
                errors.append("sound_upload_import_duplicate_asset_link")
            if result.get("duplicate_of_content_sha256") != result.get("content_sha256"):
                errors.append("sound_upload_import_duplicate_content_digest")
    if outcome == "effect_unknown":
        if result.get("manifest") is not None or result.get("duplicate_of_asset_ref") is not None:
            errors.append("sound_upload_import_unknown_effect_claim")


def _path_contained(path: Any) -> bool:
    """SP-222 contained pack member path: relative, no traversal, no separator tricks."""
    if not isinstance(path, str) or not path:
        return False
    if path.startswith("/") or "\\" in path or ":" in path:
        return False
    return all(segment and segment not in (".", "..") for segment in path.split("/"))


def _member_disposition_failures(member: dict[str, Any], limits: dict[str, int],
                                 errors: list[str]) -> None:
    disposition = member.get("disposition")
    contained = _path_contained(member.get("declared_relative_path"))
    decode_mismatch = member.get("header_format") != member.get("decoded_format") or (
        member.get("decoded_format") != member.get("format"))
    family = mime_family(member.get("mime_type"))
    # SP-222 rejects unsupported formats, uncontained paths and over-limit
    # members per member and names no first-error precedence: each independently
    # resolved member defect admits exactly its own existing rejection token, one
    # truthful applicable token may answer for a member violating several rules
    # at once, no rejected member is ever presented as accepted, and a token
    # whose own facts do not hold stays unsupported.
    reasons = {
        "rejected_unsafe_path": not contained,
        "rejected_source_too_large": member.get("source_bytes", 0) > limits["source_size_limit_bytes"],
        "rejected_duration_too_long": member.get("duration_ms", 0) > limits["decoded_duration_limit_ms"],
        "rejected_decode_failure": decode_mismatch,
        "rejected_unsupported_format": family is None or family != member.get("format"),
    }
    applicable = {reason for reason, holds in reasons.items() if holds}
    if disposition in reasons:
        if disposition not in applicable:
            errors.append(MEMBER_REASON_FAILURE[disposition])
    else:
        for reason in sorted(applicable):
            errors.append(MEMBER_REASON_FAILURE[reason])
    licensed = member.get("license_verification") == "verified_by_owner" and member.get(
        "declared_license_ref") is not None
    if disposition in ("imported", "duplicate_content_linked"):
        if not licensed:
            errors.append("sound_pack_import_member_license")
        if member.get("duration_warning") != (member.get("duration_ms", 0) > limits["duration_warning_ms"]):
            errors.append("sound_pack_import_member_duration_warning")
        category = member.get("category")
        if member.get("mapping_disposition") != "mapped_to_existing_meaning":
            errors.append("sound_pack_import_member_category_mapping")
        elif category is None or CATEGORY_MAPPING.get(category) != member.get("category_mapping_target"):
            errors.append("sound_pack_import_member_category_mapping")
    if disposition == "rejected_unlicensed" and licensed:
        errors.append("sound_pack_import_member_license")
    if disposition == "unmapped_category_disabled_with_warning" and (
            member.get("category") is not None or member.get("category_mapping_target") is not None):
        errors.append("sound_pack_import_member_category_mapping")


def _import_result_failures(result: dict[str, Any], original: dict[str, Any],
                            limits: dict[str, int], errors: list[str]) -> None:
    """Per-member pack acceptance: partial is explicit and rejected members are never presented as imported."""
    outcome = result.get("outcome")
    members = result.get("members", [])
    declared = outcome != "effect_unknown"
    for member in members:
        _member_disposition_failures(member, limits, errors)
    indexes = [member.get("member_index") for member in members]
    if indexes != list(range(len(members))):
        errors.append("sound_pack_import_member_count")
    if len(members) != result.get("evaluated_member_count"):
        errors.append("sound_pack_import_member_count")
    member_evaluating = outcome in ("imported_all", "imported_partial", "rejected_no_members")
    if member_evaluating and (len(members) != result.get("declared_member_count")
                              or result.get("evaluated_member_count") != result.get("declared_member_count")):
        errors.append("sound_pack_import_member_count")
    if outcome == "review_required" and (members or result.get("evaluated_member_count") != 0):
        errors.append("sound_pack_import_member_count")
    if result.get("manifest_version_reviewed") != original.get("manifest_version_reviewed"):
        errors.append("sound_pack_import_manifest_version_review")
    if result.get("declared_manifest_version") != original.get("declared_manifest_version"):
        errors.append("sound_pack_import_manifest_version_review")
    if result.get("file_safe_decision_ref") != original.get("file_safe_admission_ref"):
        errors.append("sound_upload_import_file_safe_decision_ref")
    counts = {
        "accepted_member_count": sum(1 for m in members if m.get("disposition") == "imported"),
        "rejected_member_count": sum(1 for m in members if str(m.get("disposition", "")).startswith("rejected_")),
        "duplicate_linked_member_count": sum(
            1 for m in members if m.get("disposition") == "duplicate_content_linked"),
        "unmapped_member_count": sum(
            1 for m in members if m.get("disposition") == "unmapped_category_disabled_with_warning"),
    }
    for field, observed in counts.items():
        if result.get(field) != observed:
            errors.append("sound_pack_import_member_count")
    imported_refs = set(result.get("imported_asset_refs", []))
    imported_members = [m for m in members if m.get("disposition") == "imported"]
    linked_members = [m for m in members if m.get("disposition") == "duplicate_content_linked"]
    expected_imported = {m.get("asset_ref") for m in imported_members}
    if imported_refs != expected_imported:
        errors.append("sound_pack_import_member_count")
    retained = set(result.get("retained_manifest_refs", []))
    for member in members:
        disposition = member.get("disposition")
        if disposition in ("imported", "duplicate_content_linked"):
            # An imported member is presented through its retained manifest and,
            # when it mints an asset, through the imported asset set. Rejected and
            # unmapped members carry neither reference (closed shape).
            if member.get("manifest_ref") not in retained:
                errors.append("sound_pack_import_imported_member_unretained")
            if disposition == "imported" and member.get("asset_ref") not in imported_refs:
                errors.append("sound_pack_import_imported_member_unretained")
    # Content-hash duplicates link existing managed content; they never mint a
    # second asset for the same bytes and never replace one.
    seen_content: dict[str, str] = {}
    preexisting = set(result.get("preexisting_asset_refs", []))
    for member in members:
        digest = member.get("content_sha256")
        disposition = member.get("disposition")
        if disposition == "imported":
            if member.get("asset_ref") in preexisting:
                errors.append("sound_pack_import_silent_replacement")
            if digest in seen_content:
                errors.append("sound_pack_import_duplicate_content_rule")
            else:
                seen_content[digest] = member.get("asset_ref")
        elif disposition == "duplicate_content_linked":
            target = member.get("duplicate_of_asset_ref")
            if member.get("asset_ref") != target:
                errors.append("sound_pack_import_duplicate_asset_link")
            if member.get("duplicate_of_content_sha256") != digest:
                errors.append("sound_pack_import_duplicate_content_digest")
            if digest not in seen_content and target not in preexisting:
                errors.append("sound_pack_import_duplicate_link")
            elif digest in seen_content and seen_content[digest] != target:
                errors.append("sound_pack_import_duplicate_link")
    # Filename/label collisions never silently replace: colliding labels must
    # retain distinct identities and must never share one asset ref.
    by_name: dict[str, list[dict[str, Any]]] = {}
    for member in members:
        by_name.setdefault(str(member.get("member_name")), []).append(member)
    for name, group in by_name.items():
        if len(group) < 2:
            continue
        identities = {member.get("retained_identity") for member in group}
        if len(identities) != len(group):
            errors.append("sound_pack_import_name_collision")
        digests = {member.get("content_sha256") for member in group}
        refs = {member.get("asset_ref") for member in group if member.get("asset_ref") is not None}
        if len(digests) > 1 and len(refs) < len([m for m in group if m.get("asset_ref") is not None]):
            errors.append("sound_pack_import_name_collision")
    # Category collisions never silently re-map one category to two meanings.
    by_category: dict[str, set[Any]] = {}
    for member in members:
        if member.get("category") is not None:
            by_category.setdefault(str(member.get("category")), set()).add(member.get("category_mapping_target"))
    for targets in by_category.values():
        if len(targets) > 1:
            errors.append("sound_pack_import_category_mapping_conflict")
    ref_contents: dict[Any, set[Any]] = {}
    for member in members:
        if member.get("asset_ref") is not None:
            ref_contents.setdefault(member.get("asset_ref"), set()).add(member.get("content_sha256"))
    for ref, contents in ref_contents.items():
        # One managed asset may back several linked members for the same bytes;
        # two different recordings may never share one asset identity.
        if len(contents) > 1:
            errors.append("sound_pack_import_asset_collision")
    if declared:
        not_imported = counts["rejected_member_count"] + counts["unmapped_member_count"] + counts[
            "duplicate_linked_member_count"]
        if outcome == "imported_all" and (not_imported or counts["accepted_member_count"] == 0):
            errors.append("sound_pack_import_partial_acceptance")
        if outcome == "imported_partial" and counts["accepted_member_count"] == 0:
            errors.append("sound_pack_import_partial_acceptance")
        if outcome == "imported_partial" and not_imported == 0:
            errors.append("sound_pack_import_partial_acceptance")
        if outcome == "rejected_no_members" and (counts["accepted_member_count"] or counts[
                "duplicate_linked_member_count"]):
            errors.append("sound_pack_import_partial_acceptance")
        if original.get("manifest_version_reviewed") is not True and outcome != "review_required":
            errors.append("sound_pack_import_manifest_version_review")
        if original.get("manifest_version_reviewed") is True and outcome == "review_required":
            errors.append("sound_pack_import_manifest_version_review")
    if outcome == "effect_unknown":
        if result.get("imported_asset_refs") or result.get("retained_manifest_refs"):
            errors.append("sound_pack_import_unknown_effect_claim")


def _result_failures(original_request: dict[str, Any], result: dict[str, Any], *,
                     resolve_owner_original: Callable[[str], Any],
                     resolve_sir_dispatch: Callable[[str], Any],
                     resolve_dispatcher: Callable[[str], Any],
                     canon_root: Any = None) -> list[str]:
    action = result.get("command_id")
    if action not in COMMANDS or original_request.get("command_id") != action:
        return ["sound_upload_import_action_scope"]
    limits = owner_limits(canon_root)
    errors = _request_failures(original_request, resolve_owner_original=resolve_owner_original,
                               resolve_sir_dispatch=resolve_sir_dispatch,
                               resolve_dispatcher=resolve_dispatcher, canon_root=canon_root)
    errors.extend(shape_failures(RESULT_DEFINITION[action], result, canon_root=canon_root))
    if any(failure.startswith("shape:") for failure in errors):
        return sorted(set(errors))
    original = _read(resolve_owner_original, original_request["original_request_ref"],
                     ORIGINAL_DEFINITION[action], errors, canon_root=canon_root)
    if result.get("original_request_ref") != original_request.get("original_request_ref"):
        errors.append("sound_upload_import_original_request")
    if (result.get("command_instance_id") != original_request.get("command_instance_id")
            or result.get("dispatch_id") != original_request.get("dispatch_id")):
        errors.append("sound_upload_import_foreign_result")
    if result.get("sir_dispatch_ref") != original_request.get("sir_dispatch_ref"):
        errors.append("sound_upload_import_sir_dispatch_binding")
    if result.get("dispatcher_ref") != original_request.get("dispatcher_ref"):
        errors.append("sound_upload_import_dispatcher_binding")
    if original is None:
        return sorted(set(errors))
    if _authority_identity(result) != _authority_identity(original):
        errors.append("sound_upload_import_source_identity")
    if result.get("target_generation") != original.get("target_generation"):
        errors.append("sound_upload_import_target_generation")
    if result.get("scope") != original.get("scope"):
        errors.append("sound_upload_import_scope")
    if result.get("outcome") in {"stored", "duplicate_linked", "imported_all", "imported_partial"}:
        if not isinstance(result.get("receipt_ref"), str) or not result.get("receipt_ref"):
            errors.append("sound_upload_import_receipt_identity")
    if action == "cmd.sound.upload":
        _upload_outcome_failures(result, original, limits, errors)
    else:
        _import_result_failures(result, original, limits, errors)
    errors.extend(_secret_material_failures(result))
    return sorted(set(errors))


def owner_result_outcome_failures(owner_result: dict[str, Any], outcome: dict[str, Any], *,
                                  canon_root: Any = None) -> list[str]:
    """Join the typed owner result to the existing CommandOutcome state.

    A recomputed digest, a valid shape or a copied ref does not make a rejected
    upload, a rejected pack member or an unknown effect a central success.
    """
    failures = shape_failures("#", owner_result, canon_root=canon_root)
    failures.extend(shape_failures(OUTCOME_POINTER, outcome, canon_root=canon_root,
                                  schema_path=OUTCOME_SCHEMA))
    if failures:
        return sorted(set(failures))
    action = owner_result.get("command_id")
    if action not in COMMANDS or outcome.get("command_id") != action:
        return ["sound_upload_import_action_scope"]
    allowed = OWNER_RESULT_OUTCOME.get(action, {}).get(owner_result.get("outcome"))
    if allowed is None or outcome.get("outcome") not in allowed:
        return ["sound_upload_import_owner_result_outcome_mapping"]
    return []


def _response_truth_failures(response: dict[str, Any], outcome: dict[str, Any]) -> list[str]:
    truth = OUTCOME_RESPONSE_TRUTH.get(outcome.get("outcome"))
    if truth is None:
        return ["sound_upload_import_outcome_state"]
    expected_ack, expected_results = truth
    if response.get("ack_status") != expected_ack or response.get("result_status") not in expected_results:
        return ["sound_upload_import_acknowledgement_is_not_intake_success"]
    return []


def _replay_failures(response: dict[str, Any], original: Any, owner_result: Any,
                     *, canon_root: Any = None) -> list[str]:
    failures: list[str] = []
    if response.get("replayed") is not True:
        if original is not None:
            failures.append("sound_upload_import_replay_marker")
        return failures
    if not isinstance(original, dict) or shape_failures("#", original, canon_root=canon_root,
                                                       schema_path=RESPONSE_SCHEMA):
        return ["sound_upload_import_replay_original_missing"]
    if response.get("original_dispatch_id") != original.get("dispatch_id"):
        failures.append("sound_upload_import_replay_replacement_dispatch")
    for field in REPLAY_PRESERVED_RESPONSE_FIELDS:
        if response.get(field) != original.get(field):
            failures.append("sound_upload_import_replay_receipt_changed" if field in {"receipt_ref", "event_refs"}
                            else "sound_upload_import_replay_result_changed")
    if response.get("operation_id") != original.get("operation_id"):
        failures.append("sound_upload_import_replay_replacement_operation")
    if isinstance(owner_result, dict):
        reference = original.get("owner_result_ref")
        if reference is not None and reference == response.get("owner_result_ref") and original.get(
                "owner_result_schema_ref") != BINDING.get(response.get("command_id")):
            failures.append("sound_upload_import_replay_result_changed")
    return sorted(set(failures))


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
        return sorted(set(["sound_upload_import_action_scope"] + errors))
    if response.get("response_kind") != "owner_operation":
        # A local route/open projection is never a substitute for the domain
        # outcome; a pre-dispatch refusal stays a truthful refusal with no
        # fabricated durable scope.
        if response.get("response_kind") == "local_projection":
            errors.append("sound_upload_import_local_projection_substitute")
        if response.get("response_kind") == "pre_dispatch_rejection":
            action_error = bundle.get("action_error")
            if not isinstance(action_error, dict):
                errors.append("sound_upload_import_error_projection")
            else:
                errors.extend(_error_failures(action_error, availability=bundle.get("availability"),
                                              response_error=response.get("error"),
                                              expected_phase="pre_dispatch", canon_root=canon_root))
            if any(bundle.get(field) is not None for field in ("outcome", "owner_result",
                                                               "resolved_outcome_ref",
                                                               "resolved_owner_result_ref")):
                errors.append("sound_upload_import_non_operation_owner_records")
        if response.get("event_refs"):
            errors.append("sound_upload_import_event_claim")
        errors.extend(_secret_material_failures(response))
        return sorted(set(errors))
    errors.extend(shape_failures(OUTCOME_POINTER, outcome, canon_root=canon_root,
                                 schema_path=OUTCOME_SCHEMA))
    if any(failure.startswith("shape:") for failure in errors):
        return sorted(set(errors))
    if not isinstance(request, dict) or not isinstance(normalized, dict):
        return sorted(set(errors + ["sound_upload_import_request_binding"]))
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
                errors.append("sound_upload_import_original_sir_" + field)
    for field in ("request_ref", "command_id", "command_instance_id"):
        if response.get(field) != normalized.get(field):
            errors.append("sound_upload_import_response_request_" + field)
    if request.get("command_id") != action or result.get("command_id") != action:
        errors.append("sound_upload_import_action_scope")
    if response.get("request_ref") != request.get("original_request_ref"):
        errors.append("sound_upload_import_original_request")
    if response.get("command_instance_id") != request.get("command_instance_id"):
        errors.append("sound_upload_import_command_instance_id")
    if response.get("operation_id") != normalized.get("operation_id"):
        errors.append("sound_upload_import_response_operation_scope")
    if response.get("owner_identity") != normalized.get("owner_identity"):
        errors.append("sound_upload_import_response_scope_mismatch")
    if response.get("owner_identity") != outcome.get("identity"):
        errors.append("sound_upload_import_response_outcome_scope_mismatch")
    for field in ("payload_sha256", "idempotency_key", "target_generation", "dispatch_frame_id"):
        if outcome.get(field) != normalized.get(field):
            errors.append("sound_upload_import_outcome_request_" + field)
    if response.get("command_outcome_ref") != bundle.get("resolved_outcome_ref"):
        errors.append("sound_upload_import_command_outcome_binding")
    errors.extend(owner_result_outcome_failures(result, outcome, canon_root=canon_root))
    errors.extend(_response_truth_failures(response, outcome))
    errors.extend(_replay_failures(response, bundle.get("original_response"), result,
                                   canon_root=canon_root))
    if response.get("owner_result_schema_ref") != BINDING[action]:
        errors.append("sound_upload_import_owner_result_binding")
    if response.get("owner_result_ref") != bundle.get("resolved_owner_result_ref"):
        errors.append("sound_upload_import_copied_ref")
    if outcome.get("owner_result_ref") != bundle.get("resolved_owner_result_ref"):
        errors.append("sound_upload_import_copied_ref")
    if response.get("owner_result_ref") != outcome.get("owner_result_ref"):
        errors.append("sound_upload_import_copied_ref")
    try:
        digest = canonical_sha256(result)
    except ValueError:
        errors.append("sound_upload_import_owner_result_outside_digest_domain")
    else:
        if outcome.get("owner_result_sha256") != digest:
            errors.append("sound_upload_import_owner_result_digest")
    if response.get("event_refs"):
        errors.append("sound_upload_import_event_claim")
    if outcome.get("outcome") not in NONTERMINAL_OUTCOMES:
        if outcome.get("result_receipt_ref") != result.get("receipt_ref"):
            errors.append("sound_upload_import_receipt_identity")
        if response.get("receipt_ref") != outcome.get("result_receipt_ref"):
            errors.append("sound_upload_import_receipt_identity")
    if outcome.get("outcome") in NONTERMINAL_OUTCOMES:
        if outcome.get("result_receipt_ref") is not None:
            errors.append("sound_upload_import_queue_admission")
        if outcome.get("acknowledgement_receipt_ref") == result.get("receipt_ref"):
            errors.append("sound_upload_import_queue_admission")
    if bundle.get("projection") is not None:
        # RAP-039 projects destination-test and asset-export evidence only.
        errors.append("sound_upload_import_projection_authority")
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
        errors.append("sound_upload_import_error_phase")
    reason = error.get("availability_reason")
    if reason is not None and error.get("code") != DISABLED_REASON_ERROR_CODE.get(reason):
        errors.append("sound_upload_import_disabled_reason_error")
    if response_error is not None:
        if error.get("code") != response_error.get("code") or error.get("reason") != response_error.get("reason"):
            errors.append("sound_upload_import_error_projection")
        if error.get("offending_field") != response_error.get("offending_field"):
            errors.append("sound_upload_import_error_projection")
    else:
        errors.append("sound_upload_import_error_projection")
    if isinstance(availability, dict) and availability.get("action_id") is not None:
        if error.get("action_id") != availability.get("action_id"):
            errors.append("sound_upload_import_error_action")
        if error.get("availability_reason") != availability.get("disabled_reason"):
            errors.append("sound_upload_import_disabled_reason_projection")
    if isinstance(availability, dict) and availability.get("currentness", {}).get("stale") is True:
        if error.get("code") != "stale_projection":
            errors.append("sound_upload_import_currentness_error")
    return sorted(set(errors))


def _availability_failures(availability: dict[str, Any], *, action_request: Any = None,
                           dispatcher: Any = None, canon_root: Any = None) -> list[str]:
    errors = shape_failures("availability_projection", availability, canon_root=canon_root)
    if errors:
        return errors
    action = availability["action_id"]
    currentness = availability["currentness"]
    if currentness["stale"] != (currentness["observed_generation"] != currentness["target_generation"]):
        errors.append("sound_upload_import_currentness_mismatch")
    if isinstance(action_request, dict):
        if availability.get("availability") != "available":
            errors.append("sound_upload_import_availability_dispatch")
        if currentness["target_generation"] != action_request.get("expected_target_generation"):
            errors.append("sound_upload_import_current_generation_drift")
    if isinstance(dispatcher, dict):
        if dispatcher.get("availability_selector") != availability.get("availability_selector"):
            errors.append("sound_upload_import_availability_selector")
        if dispatcher.get("disabled_reason_selector") != availability.get("disabled_reason_selector"):
            errors.append("sound_upload_import_disabled_reason_selector")
        if dispatcher.get("availability") != availability.get("availability"):
            errors.append("sound_upload_import_availability_projection")
        if dispatcher.get("disabled_reason") != availability.get("disabled_reason"):
            errors.append("sound_upload_import_disabled_reason_projection")
        if dispatcher.get("current_target_generation") != currentness["observed_generation"]:
            errors.append("sound_upload_import_current_generation_drift")
    if action not in COMMANDS:
        errors.append("sound_upload_import_action_scope")
    return sorted(set(errors))


def _dispatch_self_failures(binding: dict[str, Any], *, canon_root: Any = None) -> list[str]:
    """Bare original binding: the argument-only digest stays its own owner value."""
    errors = shape_failures("dispatch_binding", binding, canon_root=canon_root, schema_path=DISPATCH_SCHEMA)
    if errors:
        return errors
    if binding["payload_sha256"] == binding["arguments_sha256"]:
        errors.append("sound_upload_import_arguments_digest")
    if not binding["identity"].get("command_instance_id"):
        errors.append("sound_upload_import_identity_envelope")
    action = binding.get("action_id")
    if action in COMMANDS and binding.get("target", {}).get("kind") != ROUTE_TARGET_KIND[action]:
        errors.append("sound_upload_import_source_identity")
    return sorted(set(errors))


def _dispatcher_self_failures(binding: dict[str, Any], *, canon_root: Any = None) -> list[str]:
    errors = shape_failures("dispatcher_binding", binding, canon_root=canon_root,
                            schema_path=DISPATCH_SCHEMA)
    if errors:
        return errors
    if binding["handler_status"] != "specified":
        errors.append("sound_upload_import_handler_status")
    if binding["wiring_status"] != "specified":
        errors.append("sound_upload_import_wiring_status")
    if binding["availability"] == "available" and binding["disabled_reason"] is not None:
        errors.append("sound_upload_import_disabled_reason_projection")
    if binding["availability"] != "available" and binding["disabled_reason"] is None:
        errors.append("sound_upload_import_disabled_reason_projection")
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
        errors = list(errors) + ["sound_upload_import_inputs_mutated"]
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
                failures.append(f"sound_upload_import_truth_table_drift:{outcome}:{ack}:{status}:{errors[0]}")
    return failures


def _truth_probe_response(ack: str, status: Any) -> dict[str, Any]:
    response = {
        "schema_id": "pm.ui_command_response.v2",
        "schema_version": "2.0.0",
        "dispatch_id": "dispatch:truth-probe",
        "request_ref": "request:truth-probe",
        "command_id": "cmd.sound.upload",
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
            "json_pointer": "#/$defs/sound_upload_result",
            "schema_id": "pm.sound_upload_import.upload_result.v1",
        },
        "replayed": False,
        "original_dispatch_id": None,
        "ts": "2026-09-26T00:00:00Z",
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


def sound_upload_import_semantic_failures(definition: str, value: dict[str, Any], *,
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
    if definition == "dispatch_case":
        return dispatch_binding_failures(value, resolution="dispatch", canon_root=canon_root)
    if definition == "dispatcher_case":
        return dispatch_binding_failures(value, resolution="dispatcher", canon_root=canon_root)
    if definition == "effect_binding":
        action = value.get("action_id") if isinstance(value, dict) else None
        if action in EFFECT_DEFINITION:
            return shape_failures(EFFECT_DEFINITION[action], value, canon_root=canon_root)
        return shape_failures("#", value, canon_root=canon_root)
    if definition in ("request", "result", "error", "availability", "dispatch_binding",
                      "dispatcher_binding", "sound_upload_original", "sound_pack_import_original",
                      "sound_pack_import_member_record", "sound_manifest_projection"):
        schema_path = DISPATCH_SCHEMA if definition in ("dispatch_binding", "dispatcher_binding") else ACTION_SCHEMA
        named = {
            "request": "#",
            "result": "#",
            "error": "#",
            "availability": "#",
        }.get(definition, definition)
        return shape_failures(named, value, canon_root=canon_root, schema_path=schema_path)
    raise ValueError("fixture definition required")
