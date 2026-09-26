#!/usr/bin/env python3
"""V3 static semantic joins for the eight existing Browser capture/DevTools routes.

Pure causal checks over ``browser_capture_response_case`` records from
``Plans/browser_capture_contract_fixtures.json`` against
``Plans/browser_capture_contracts.schema.json``. No IO happens inside
:func:`browser_capture_semantic_failures`, so the aggregate gate can import
only that function. :func:`structural_errors` and the ``validate`` CLI need a
full tree (schema plus the Section 15 owner schema for ``$ref`` resolution).

Static evidence only: a passing case proves schema/fixture consistency, not a
native dispatcher, handler, permission, receipt, storage write, or runtime
effect. Every route stays ``handler_unavailable``.
"""

from __future__ import annotations

import argparse
import copy
import hashlib
import json
import re
import sys
from functools import lru_cache
from pathlib import Path
from typing import Any

from jsonschema import Draft202012Validator, FormatChecker
from referencing import Registry, Resource

ROOT = Path(__file__).resolve().parents[1]
SCHEMA_REL = "Plans/browser_capture_contracts.schema.json"
FIXTURE_REL = "Plans/browser_capture_contract_fixtures.json"
SECTION15_REL = "Plans/section15_browser_program_contracts.schema.json"
CENTRAL_REL = "Plans/ui_command_response.schema.json"
FULLTHREAD_REL = "Plans/full_thread_runtime_contracts.schema.json"
INVENTORY_REL = "Plans/settings_inventory.json"

# Registered Settings inventory key for the component initial-mode setting
# (Plans/settings_inventory.json). Compared live by the validator; a drift
# fails closed rather than silently accepting a new key.
REGISTERED_COMPONENT_ACTION_KEY = "planning.testing.browser-component-action"
REGISTERED_COMPONENT_ACTION_DEFAULT = "Last used, starting with Send now"

# Companion-proposed adapter projection from owner browser error codes to the
# coarse common UICommandError vocabulary (central envelope). This mapping is
# authored in the companion, NOT claimed as owner vocabulary; owner
# confirmation is requested in the prerequisite proposal. "cancelled" maps to
# a null central error per the owner coherence rules.
CENTRAL_ERROR_PROJECTION = {
    "stale_capture": "stale_projection",
    "stale_revision": "stale_projection",
    "stale_currentness": "stale_projection",
    "source_changed": "stale_projection",
    "protected_denied": "permission_denied",
    "permission_denied": "permission_denied",
    "precondition_failed": "blocked_state_required",
    "target_not_found": "blocked_state_required",
    "schedule_refused_live_selector": "blocked_state_required",
    "invalid_request": "invalid_args",
    "owner_unavailable": "internal_error",
    "handler_unavailable": "handler_unavailable",
    "command_not_registered": "unknown_command",
    "cancelled": None,
}

# Record-envelope keys stripped before the argument-only payload digest. The
# retained object is the closed selected command arguments; identity/custody
# framing (record kind, schema address, command, request ref) is preserved by
# the dispatch joins instead of being hashed. See SIR original-custody rule.
REQUEST_ENVELOPE_KEYS = frozenset({
    "record_kind", "schema_id", "schema_version", "command_id", "request_id",
})

COMMANDS = (
    "cmd.browser.capture.full_to_chat",
    "cmd.browser.capture.region_to_chat",
    "cmd.browser.component.pick",
    "cmd.browser.component.send_now",
    "cmd.browser.component.add_to_composer",
    "cmd.browser.component.insert_at_cursor",
    "cmd.browser.component.mode.set_default",
    "cmd.browser.devtools.open",
)
PICK = "cmd.browser.component.pick"
REJECTED_RECAPTURE = "cmd.browser.component.recapture"

REQUEST_KIND = {
    "cmd.browser.capture.full_to_chat": "BrowserCaptureFullRequest",
    "cmd.browser.capture.region_to_chat": "BrowserCaptureRegionRequest",
    "cmd.browser.component.pick": "BrowserComponentPickRequest",
    "cmd.browser.component.send_now": "BrowserComponentSendRequest",
    "cmd.browser.component.add_to_composer": "BrowserComponentComposerRequest",
    "cmd.browser.component.insert_at_cursor": "BrowserComponentComposerRequest",
    "cmd.browser.component.mode.set_default": "BrowserComponentModeRequest",
    "cmd.browser.devtools.open": "BrowserDevToolsOpenRequest",
}
RESULT_KIND = {
    "cmd.browser.capture.full_to_chat": "BrowserCaptureResult",
    "cmd.browser.capture.region_to_chat": "BrowserCaptureResult",
    "cmd.browser.component.pick": "BrowserComponentPickResult",
    "cmd.browser.component.send_now": "MessageAdmissionResult",
    "cmd.browser.component.add_to_composer": "ComposerBufferResult",
    "cmd.browser.component.insert_at_cursor": "ComposerBufferResult",
    "cmd.browser.component.mode.set_default": "SettingsTransactionResult",
    "cmd.browser.devtools.open": "RouteResult",
}
SUCCESS_OUTCOMES = {
    "submitted_isolated", "selected", "admitted_isolated",
    "appended", "inserted", "applied", "navigated",
}
NON_SUCCESS_OUTCOMES = {
    "stale_capture", "blocked", "failed", "no_change",
}
REQUIRED_PRECONDITIONS = {
    "cmd.browser.capture.full_to_chat": ("browser_runtime_available", "capture_permitted"),
    "cmd.browser.capture.region_to_chat": ("browser_runtime_available", "capture_permitted"),
    "cmd.browser.component.pick": ("browser_runtime_available", "component_resolution_available"),
    "cmd.browser.component.send_now": ("component_selected", "composer_destination_resolvable"),
    "cmd.browser.component.add_to_composer": ("component_selected", "composer_available"),
    "cmd.browser.component.insert_at_cursor": ("component_selected", "composer_available", "caret_position_known"),
    "cmd.browser.component.mode.set_default": ("settings_writable",),
    "cmd.browser.devtools.open": ("browser_runtime_available", "devtools_policy_allows"),
}

SECRET_RE = re.compile(
    r"(password|passwd|secret|api[_-]?key|access[_-]?token|refresh[_-]?token"
    r"|bearer\s+\S+|cookie|credential|\bsk-[A-Za-z0-9_-]{8,})",
    re.IGNORECASE,
)
ABSOLUTE_PATH_RE = re.compile(
    r"(?:[A-Za-z]:[\\/]|file://|\\\\|/(?:home|mnt|tmp|etc|usr|var|workspace)(?:/|$))"
)


def read_json(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8"))


@lru_cache(maxsize=1)
def _registry_cached(root: str) -> Registry:
    root_path = Path(root)
    registry: Registry = Registry()
    for rel in (SECTION15_REL, SCHEMA_REL, FULLTHREAD_REL):
        doc = read_json(root_path / rel)
        registry = registry.with_resource(doc["$id"], Resource.from_contents(doc))
    return registry


def structural_errors(definition: str, value: Any, root: Path | None = None) -> list[str]:
    """JSON-Schema shape errors for ``definition`` (empty means shape-valid)."""
    base = root or ROOT
    schema = read_json(base / SCHEMA_REL)
    registry = _registry_cached(str(base))
    validator = Draft202012Validator(
        {"$ref": schema["$id"] + "#/$defs/" + definition},
        registry=registry, format_checker=FormatChecker(),
    )
    return sorted(e.message for e in validator.iter_errors(value))


def apply_patch(value: dict[str, Any], patch: dict[str, Any]) -> dict[str, Any]:
    """Apply a dotted-path patch (gate fixture protocol) to a deep copy."""
    out = copy.deepcopy(value)
    for dotted, replacement in patch.items():
        target: Any = out
        keys = dotted.split(".")
        for key in keys[:-1]:
            target = target[int(key)] if isinstance(target, list) else target[key]
        last = keys[-1]
        if isinstance(target, list):
            target[int(last)] = replacement
        else:
            target[last] = replacement
    return out


def _freshness(captured: dict[str, Any], current: dict[str, Any],
               epoch_expected: int, revision_expected: int) -> dict[str, Any]:
    """Recompute BSTALE-001..003/008/010 revalidation truth from live state.

    Timestamps are never read: currentness is generation/identity based only.
    """
    subject = current["current_subject"]
    destroyed = bool(current["frame_destroyed"] or current["page_destroyed"])
    count_ok = current.get("locator_match_count") == 1
    subject_eq = (
        subject.get("browser_session_id") == captured["original_session_id"]
        and subject.get("browser_page_id") == captured["original_page_id"]
        and subject.get("page_generation") == captured["original_generation"]
    )
    frame_eq = current.get("current_frame_id") == captured["original_frame_id"]
    identity_eq = (
        current.get("matched_tag") == captured["tag"]
        and current.get("matched_role") == captured["role"]
        and current.get("matched_component_id") == captured["component_id"]
        and current.get("matched_fingerprint") == captured["fingerprint"]
    )
    source_eq = current.get("matched_source") == captured["source"]
    fence_ok = (
        current.get("current_selection_epoch") == epoch_expected
        and current.get("current_composer_revision") == revision_expected
    )
    fresh = (
        not destroyed and count_ok and subject_eq and frame_eq
        and identity_eq and source_eq and fence_ok
    )
    return {
        "destroyed": destroyed, "count_ok": count_ok, "subject_eq": subject_eq,
        "frame_eq": frame_eq, "identity_eq": identity_eq, "source_eq": source_eq,
        "fence_ok": fence_ok, "fresh": fresh,
    }


# Largest integer magnitude this static oracle canonicalizes. Integers with
# |n| <= 2**53 - 1 serialize identically under Python decimal emission and
# RFC 8785 / ECMAScript number serialization (plain decimal, exact); larger
# magnitudes switch to exponent notation (e.g. 10**21 -> "1e+21") and lose
# exact binary64 representation, so they fail closed instead of hashing an
# unverified encoding. This bounds only the static oracle, never the product
# schema (which admits any minimum-0 integer); out-of-domain values reject,
# they are not redefined.
STATIC_ORACLE_MAX_SAFE_INTEGER = 2**53 - 1


def _assert_canonical_domain(node: Any) -> None:
    """Fail closed on values outside the verified canonicalization domain."""
    if node is None or isinstance(node, (bool, str)):
        return
    if isinstance(node, int):
        if abs(node) > STATIC_ORACLE_MAX_SAFE_INTEGER:
            raise ValueError(
                "integer outside the static oracle domain (|n| <= 2**53-1); "
                "RFC 8785 bytes cannot be verified here"
            )
        return
    if isinstance(node, list):
        for item in node:
            _assert_canonical_domain(item)
        return
    if isinstance(node, dict):
        for key, val in node.items():
            if not isinstance(key, str):
                raise ValueError("non-string object keys are outside the canonical domain")
            _assert_canonical_domain(val)
        return
    raise ValueError(f"unsupported canonical domain value: {type(node).__name__}")


def rfc8785_canonical_bytes(node: Any) -> bytes:
    """Static-oracle canonical JSON bytes, byte-identical to RFC 8785 in-domain.

    Verified domain: null/boolean/integer with |n| <= 2**53 - 1/string/
    array/object with string keys. Within it, sorted-keys compact UTF-8
    JSON is byte-identical to RFC 8785: safe integers serialize as plain
    decimals under both Python and ECMAScript number rules, key
    code-point order agrees with UTF-16 code-unit order below the Basic
    Multilingual Plane boundary present here, and Python's string escapes
    match the required set. Anything else (floats, non-string keys, exotic
    types, integers beyond 2**53 - 1) raises instead of hashing an
    unspecified encoding; the digest joins treat that as a rejection,
    never an acceptance. This is a narrow static oracle, not general
    native RFC 8785 coverage: native code must still canonicalize the
    full owner-admitted integer domain itself.
    """
    _assert_canonical_domain(node)
    return json.dumps(node, sort_keys=True, separators=(",", ":"),
                      ensure_ascii=False).encode("utf-8")


def owner_result_digest(result: Any) -> str:
    """SHA-256 over the closed typed owner result object alone (SIR-913)."""
    return hashlib.sha256(rfc8785_canonical_bytes(result)).hexdigest()


def resolve_dispatch_arguments(case: dict[str, Any]) -> dict[str, Any]:
    """Resolver callback: authoritative selected arguments for the payload digest.

    Returns the dispatcher-selected arguments object from the case's
    ``dispatch`` source with record-envelope framing removed. The companion
    ``request`` copy is never consulted: a caller-supplied, relabeled, or
    rehashed request object cannot serve as the authentic original.
    """
    arguments = case.get("dispatch", {}).get("arguments", {})
    if not isinstance(arguments, dict):
        return {}
    return {key: val for key, val in arguments.items() if key not in REQUEST_ENVELOPE_KEYS}


def payload_digest(case: dict[str, Any]) -> str:
    """SIR argument-only digest: SHA-256 over the resolved dispatch arguments."""
    return hashlib.sha256(rfc8785_canonical_bytes(resolve_dispatch_arguments(case))).hexdigest()


def browser_capture_semantic_failures(definition: str, value: Any) -> list[str]:
    """Causal join failures for one fixture value (empty means all joins hold).

    Pure function: no file or network IO. Only ``browser_capture_response_case``
    carries joins; bare records are structurally validated by the caller.
    """
    if definition != "browser_capture_response_case" or not isinstance(value, dict):
        return []
    failures: list[str] = []

    def fail(code: str) -> None:
        if code not in failures:
            failures.append(code)

    case_id = value.get("command_id")
    request = value.get("request", {})
    caller = value.get("caller", {})
    original = value.get("original")
    buffer_originals = value.get("buffer_originals")
    dispatch = value.get("dispatch", {})
    current = value.get("current", {})
    result = value.get("result", {})
    command_outcome = value.get("outcome", {})
    central = value.get("central", {})
    schedule = value.get("schedule_attempt")

    # -- J_COMMAND_TARGET: exact target/caller/return, no alias or recapture --
    if REJECTED_RECAPTURE in json.dumps(value):
        fail("J_COMMAND_TARGET")
    if case_id not in COMMANDS:
        fail("J_COMMAND_TARGET")
    else:
        if request.get("command_id") != case_id or result.get("command_id") != case_id:
            fail("J_COMMAND_TARGET")
        if request.get("record_kind") != REQUEST_KIND[case_id]:
            fail("J_COMMAND_TARGET")
        if result.get("record_kind") != RESULT_KIND[case_id]:
            fail("J_COMMAND_TARGET")
        if case_id == "cmd.browser.component.add_to_composer" and request.get("disposition") != "numbered_list":
            fail("J_COMMAND_TARGET")
        if case_id == "cmd.browser.component.insert_at_cursor" and (
                request.get("disposition") != "cursor_chip" or not isinstance(request.get("caret"), dict)):
            fail("J_COMMAND_TARGET")
        if command_outcome.get("command_id") != case_id or central.get("command_id") != case_id:
            fail("J_COMMAND_TARGET")
        if dispatch.get("command_id") != case_id:
            fail("J_COMMAND_TARGET")

    # -- J_CALLER_BIND: caller record agrees with the request it raised --
    if request.get("request_id") != caller.get("request_id"):
        fail("J_CALLER_BIND")
    if "permission_snapshot_ref" in request and \
            request.get("permission_snapshot_ref") != caller.get("permission_snapshot_ref"):
        fail("J_CALLER_BIND")

    # -- J_ORIGINAL_BIND: caller copy matches the picker-issued original --
    if case_id in ("cmd.browser.component.send_now", "cmd.browser.component.add_to_composer",
                   "cmd.browser.component.insert_at_cursor"):
        if not isinstance(original, dict):
            fail("J_ORIGINAL_BIND")
        else:
            if request.get("captured") != original.get("selection"):
                fail("J_ORIGINAL_BIND")
            if request.get("permission_snapshot_ref") != original.get("permission_snapshot_ref"):
                fail("J_ORIGINAL_BIND")
    elif original is not None:
        fail("J_ORIGINAL_BIND")

    # -- J_DISPATCH_BIND: dispatch source preserves outcome/central/caller --
    if dispatch.get("identity") != command_outcome.get("identity"):
        fail("J_DISPATCH_BIND")
    if dispatch.get("command_instance_id") != caller.get("command_instance_id"):
        fail("J_DISPATCH_BIND")
    if dispatch.get("operation_id") != command_outcome.get("identity", {}).get("operation_id"):
        fail("J_DISPATCH_BIND")
    if dispatch.get("dispatch_id") != central.get("dispatch_id"):
        fail("J_DISPATCH_BIND")
    if dispatch.get("idempotency_key") != command_outcome.get("idempotency_key"):
        fail("J_DISPATCH_BIND")
    if dispatch.get("target_generation") != command_outcome.get("target_generation"):
        fail("J_DISPATCH_BIND")
    if dispatch.get("permission_snapshot_ref") != caller.get("permission_snapshot_ref"):
        fail("J_DISPATCH_BIND")
    if dispatch.get("arguments") != request:
        fail("J_DISPATCH_BIND")

    outcome = result.get("outcome")
    success = outcome in SUCCESS_OUTCOMES
    preconditions = current.get("preconditions", {})

    # -- J_PERMISSION: catalog preconditions gate every success --
    if case_id in REQUIRED_PRECONDITIONS:
        needed = REQUIRED_PRECONDITIONS[case_id]
        if success and any(preconditions.get(name) is not True for name in needed):
            fail("J_PERMISSION")
        if case_id in ("cmd.browser.capture.full_to_chat", "cmd.browser.capture.region_to_chat"):
            if request.get("capture_permitted") is not True and success:
                fail("J_PERMISSION")
        if case_id == "cmd.browser.component.pick":
            if request.get("component_resolution_available") is not True and success:
                fail("J_PERMISSION")

    # -- J_PROTECTED: protected-auth origin is denied with typed error --
    origin = request.get("origin_security_class")
    if origin == "protected_auth":
        if success or outcome not in ("blocked", "failed"):
            fail("J_PROTECTED")
        error = result.get("error") or {}
        if error.get("code") != "protected_denied":
            fail("J_PROTECTED")
        for key in ("artifact_ref", "message_ref", "selection", "route_target_ref"):
            if key in result and result.get(key) is not None:
                fail("J_PROTECTED")

    # -- J_SCOPE_DEFAULT: viewport default; full page only when explicit --
    if case_id == "cmd.browser.capture.full_to_chat":
        if request.get("explicit_full_page_selected") is False and request.get("capture_scope") != "viewport":
            fail("J_SCOPE_DEFAULT")
        if result.get("capture_scope_echo") != request.get("capture_scope"):
            fail("J_SCOPE_DEFAULT")
    if case_id == "cmd.browser.capture.region_to_chat" and result.get("capture_scope_echo") != "region":
        fail("J_SCOPE_DEFAULT")

    # -- J_SUBJECT_EXACT / J_DESTINATION_EXACT --
    if case_id in ("cmd.browser.capture.full_to_chat", "cmd.browser.capture.region_to_chat"):
        if result.get("subject_echo") != request.get("subject"):
            fail("J_SUBJECT_EXACT")
        if result.get("composer_destination_ref") != request.get("composer_destination_ref"):
            fail("J_DESTINATION_EXACT")
        if success and result.get("artifact_ref") is None:
            fail("J_ISOLATION")
        if not success and result.get("artifact_ref") is not None:
            fail("J_ISOLATION")
    if case_id == "cmd.browser.component.send_now":
        if result.get("composer_destination_ref") != request.get("composer_destination_ref"):
            fail("J_DESTINATION_EXACT")

    # -- J_ISOLATION: isolated payload, unrelated composer bytes untouched --
    if case_id in ("cmd.browser.capture.full_to_chat", "cmd.browser.capture.region_to_chat",
                   "cmd.browser.component.send_now"):
        if result.get("whole_buffer_sent") is not False:
            fail("J_ISOLATION")
        if result.get("unrelated_composer_bytes_unchanged") is not True:
            fail("J_ISOLATION")
        if current.get("composer_text_after") != current.get("composer_text_before"):
            fail("J_ISOLATION")

    # -- J_PICK_EXACT --
    if case_id == "cmd.browser.component.pick" and outcome == "selected":
        selection = result.get("selection") or {}
        subject = request.get("subject", {})
        if (selection.get("original_session_id") != subject.get("browser_session_id")
                or selection.get("original_page_id") != subject.get("browser_page_id")
                or selection.get("original_generation") != subject.get("page_generation")
                or selection.get("original_frame_id") != request.get("frame_id")):
            fail("J_PICK_EXACT")

    # -- J_REVALIDATE / J_FENCE / J_STALE_NO_MESSAGE / J_SOURCE (send_now) --
    if case_id == "cmd.browser.component.send_now":
        captured = original.get("selection", {}) if isinstance(original, dict) else request.get("captured", {})
        truth = _freshness(captured, current, request.get("selection_epoch_expected"),
                           request.get("composer_revision_expected"))
        revalidation = result.get("revalidation", {})
        if revalidation.get("locator_result_count") != current.get("locator_match_count"):
            fail("J_REVALIDATE")
        if revalidation.get("captured_generation") != captured.get("original_generation"):
            fail("J_REVALIDATE")
        if revalidation.get("current_generation") != current.get("current_subject", {}).get("page_generation"):
            fail("J_REVALIDATE")
        if revalidation.get("identity_match") is not truth["identity_eq"]:
            fail("J_REVALIDATE")
        if revalidation.get("source_match") is not truth["source_eq"]:
            fail("J_REVALIDATE")
        if revalidation.get("destroyed") is not truth["destroyed"]:
            fail("J_REVALIDATE")
        expected_result = "fresh_single_compatible" if truth["fresh"] else "stale_capture"
        if revalidation.get("result") != expected_result:
            fail("J_REVALIDATE")
        recapture = revalidation.get("recapture_action")
        if truth["fresh"] and recapture is not None:
            fail("J_REVALIDATE")
        if not truth["fresh"] and (not isinstance(recapture, dict) or recapture.get("command_id") != PICK):
            fail("J_REVALIDATE")
        if truth["fresh"] and outcome != "admitted_isolated":
            fail("J_REVALIDATE")
        if not truth["fresh"] and outcome not in ("stale_capture", "blocked", "failed"):
            fail("J_REVALIDATE")
        if outcome in ("stale_capture", "blocked", "failed") and result.get("error") is None:
            fail("J_REVALIDATE")
        if not truth["fence_ok"] and success:
            fail("J_FENCE")
        if outcome != "admitted_isolated" and result.get("message_ref") is not None:
            fail("J_STALE_NO_MESSAGE")
        if outcome == "admitted_isolated" and result.get("message_ref") is None:
            fail("J_STALE_NO_MESSAGE")
        # Source disclosure even when the locator still resolves (BSTALE-011).
        source_only_stale = (
            not truth["source_eq"] and current.get("locator_match_count") == 1
            and not truth["destroyed"] and truth["subject_eq"] and truth["frame_eq"]
            and truth["identity_eq"] and truth["fence_ok"]
        )
        if source_only_stale:
            error = result.get("error") or {}
            if outcome != "stale_capture" or error.get("code") != "source_changed":
                fail("J_SOURCE")

    # -- J_LIST / J_BUFFER_BIND / J_PARTIAL (add_to_composer) --
    if case_id == "cmd.browser.component.add_to_composer":
        if result.get("chip") is not None:
            fail("J_LIST")
        entries = result.get("list_entries", [])
        if outcome == "appended" and not entries:
            fail("J_LIST")
        if not isinstance(buffer_originals, list) or not buffer_originals:
            fail("J_BUFFER_BIND")
            buffer_originals = []
        seen: set[int] = set()
        for entry in entries:
            index = entry.get("index")
            if not isinstance(index, int) or index < 1 or index in seen:
                fail("J_LIST")
            seen.add(index)
            matches = [b for b in buffer_originals
                       if isinstance(b, dict) and b.get("hidden_ref") == entry.get("hidden_ref")]
            if len(matches) != 1:
                fail("J_BUFFER_BIND")
                continue
            buf = matches[0]
            if entry.get("component_id") != buf.get("captured", {}).get("component_id"):
                fail("J_BUFFER_BIND")
            if entry.get("captured_generation") != buf.get("captured", {}).get("original_generation"):
                fail("J_BUFFER_BIND")
            if entry.get("current_generation") != buf.get("current_generation"):
                fail("J_BUFFER_BIND")
            expected_status = "valid" if buf.get("current_valid") is True else "stale_blocked"
            if entry.get("status") != expected_status:
                fail("J_BUFFER_BIND")
        if result.get("partial_send_without_explicit_action") is not False:
            fail("J_PARTIAL")
    elif buffer_originals is not None:
        fail("J_BUFFER_BIND")

    # -- J_CHIP / J_FENCE (insert_at_cursor) --
    if case_id == "cmd.browser.component.insert_at_cursor":
        if result.get("partial_send_without_explicit_action") is not False:
            fail("J_PARTIAL")
        chip = result.get("chip")
        if outcome == "inserted":
            if not isinstance(chip, dict):
                fail("J_CHIP")
            else:
                captured = original.get("selection", {}) if isinstance(original, dict) else {}
                caret = request.get("caret") or {}
                if chip.get("flattened") is not False:
                    fail("J_CHIP")
                if chip.get("caret_offset") != caret.get("offset"):
                    fail("J_CHIP")
                if not isinstance(original, dict):
                    pass  # J_ORIGINAL_BIND already covers the missing original.
                else:
                    if chip.get("hidden_component_id") != captured.get("component_id"):
                        fail("J_CHIP")
                    truth = _freshness(captured, current, request.get("selection_epoch_expected"),
                                       request.get("composer_revision_expected"))
                    expected_status = "valid" if truth["fresh"] else "stale_blocked"
                    if chip.get("status") != expected_status:
                        fail("J_CHIP")
            if result.get("list_entries"):
                fail("J_CHIP")
        fence_ok = (current.get("current_selection_epoch") == request.get("selection_epoch_expected")
                    and current.get("current_composer_revision") == request.get("composer_revision_expected"))
        if not fence_ok and success:
            fail("J_FENCE")
    if case_id == "cmd.browser.component.add_to_composer":
        fence_ok = (current.get("current_selection_epoch") == request.get("selection_epoch_expected")
                    and current.get("current_composer_revision") == request.get("composer_revision_expected"))
        if not fence_ok and success:
            fail("J_FENCE")

    # -- J_SETTINGS (mode.set_default through the Settings owner path) --
    if case_id == "cmd.browser.component.mode.set_default":
        if request.get("setting_id_ref") != REGISTERED_COMPONENT_ACTION_KEY:
            fail("J_SETTINGS_KEY")
        if result.get("changed_setting_ids") not in ([REGISTERED_COMPONENT_ACTION_KEY], []):
            fail("J_SETTINGS_KEY")
        expected = request.get("expected_project_revision")
        live_revision = current.get("settings_current_revision")
        revision_ok = (
            result.get("previous_revision") == expected
            and (live_revision is None or expected == live_revision)
        )
        if not revision_ok and outcome not in ("blocked", "failed"):
            fail("J_SETTINGS")
        if not revision_ok and (result.get("error") or {}).get("code") != "stale_revision":
            # Revision mismatch must surface as a stale_revision denial when an
            # error is projected; blocked outcomes without error stay structural.
            if result.get("error") is not None:
                fail("J_SETTINGS")
        if outcome == "applied":
            if result.get("persisted_initial_mode") != request.get("initial_mode"):
                fail("J_SETTINGS")
            if result.get("changed_setting_ids") != [request.get("setting_id_ref")]:
                fail("J_SETTINGS")
            if result.get("receipt_ref") is None:
                fail("J_SETTINGS")
            if result.get("current_revision") == result.get("previous_revision"):
                fail("J_SETTINGS")
        if outcome in ("blocked", "failed") and result.get("persisted_initial_mode") is not None:
            fail("J_SETTINGS")

    # -- J_DEVTOOLS (ordinary internal route; no raw/program authority) --
    if case_id == "cmd.browser.devtools.open":
        if result.get("raw_protocol_authority_granted") is not False:
            fail("J_DEVTOOLS")
        if result.get("program_evaluate_authority_granted") is not False:
            fail("J_DEVTOOLS")
        if request.get("devtools_policy_allows") is not True and outcome not in ("blocked", "failed"):
            fail("J_DEVTOOLS")
        if outcome == "navigated" and result.get("route_target_ref") is None:
            fail("J_DEVTOOLS")
        if outcome in ("blocked", "failed") and result.get("route_target_ref") is not None:
            fail("J_DEVTOOLS")

    # -- J_SCHEDULE (BSTALE-007/SMSG-009 frozen snapshot or refusal) --
    if isinstance(schedule, dict) and schedule.get("wants_schedule") is True \
            and schedule.get("frozen_snapshot") is None:
        if outcome not in ("stale_capture", "blocked", "failed"):
            fail("J_SCHEDULE")
        if (result.get("error") or {}).get("code") != "schedule_refused_live_selector":
            fail("J_SCHEDULE")
        if result.get("message_ref") is not None:
            fail("J_SCHEDULE")

    # -- J_DETAILS (bounded shape is schema; redaction is semantic) --
    details = result.get("details")
    if isinstance(details, dict):
        for key in ("summary", "identity_hints", "reason"):
            text = details.get(key) or ""
            if SECRET_RE.search(text) or ABSOLUTE_PATH_RE.search(text):
                fail("J_DETAILS")

    # -- J_RESULT_DIGEST: outcome digest resolves the actual typed result --
    try:
        expected_result_digest = owner_result_digest(result)
    except ValueError:
        expected_result_digest = None
    if not isinstance(command_outcome.get("owner_result_sha256"), str) or \
            command_outcome.get("owner_result_sha256") != expected_result_digest:
        fail("J_RESULT_DIGEST")

    # -- J_PAYLOAD_DIGEST: outcome digest resolves the dispatch arguments --
    try:
        expected_payload_digest = payload_digest(value)
    except ValueError:
        expected_payload_digest = None
    if not isinstance(command_outcome.get("payload_sha256"), str) or \
            command_outcome.get("payload_sha256") != expected_payload_digest:
        fail("J_PAYLOAD_DIGEST")

    # -- J_OUTCOME_BIND: authentic CommandOutcome resolves to this operation --
    if command_outcome.get("identity", {}).get("command_instance_id") != caller.get("command_instance_id"):
        fail("J_OUTCOME_BIND")
    outcome_status = command_outcome.get("outcome")
    if outcome in SUCCESS_OUTCOMES and outcome_status != "succeeded":
        fail("J_OUTCOME_BIND")
    if outcome in ("stale_capture", "blocked", "failed") and outcome_status != "failed":
        fail("J_OUTCOME_BIND")
    # no_change has no established CommandOutcome mapping; left unmapped.
    if result.get("receipt_ref") != command_outcome.get("result_receipt_ref"):
        fail("J_OUTCOME_BIND")
    expected_pointer = {"path": "Plans/browser_capture_contracts.schema.json",
                        "json_pointer": "#/$defs/" + RESULT_KIND.get(case_id, "?"),
                        "schema_id": "pm.browser_capture." + RESULT_KIND.get(case_id, "?") + ".v1"}
    if command_outcome.get("owner_result_schema_ref") != expected_pointer:
        fail("J_OUTCOME_BIND")

    # -- J_CENTRAL: full envelope agrees with outcome and owner result --
    status = central.get("result_status")
    if central.get("command_instance_id") != caller.get("command_instance_id"):
        fail("J_CENTRAL")
    if outcome in SUCCESS_OUTCOMES and status != "succeeded":
        fail("J_CENTRAL")
    if outcome == "no_change" and status != "no_op":
        fail("J_CENTRAL")
    if outcome in ("stale_capture", "blocked", "failed") and status not in ("failed", "cancelled"):
        fail("J_CENTRAL")
    if central.get("ack_status") == "rejected" and status is not None:
        fail("J_CENTRAL")
    if central.get("receipt_ref") != result.get("receipt_ref"):
        fail("J_CENTRAL")
    if central.get("owner_result_ref") != command_outcome.get("owner_result_ref"):
        fail("J_CENTRAL")
    if central.get("owner_result_schema_ref") != command_outcome.get("owner_result_schema_ref"):
        fail("J_CENTRAL")
    if central.get("owner_identity") != command_outcome.get("identity"):
        fail("J_CENTRAL")
    if central.get("operation_id") != command_outcome.get("identity", {}).get("operation_id"):
        fail("J_CENTRAL")
    if central.get("event_refs") != []:
        fail("J_CENTRAL")
    owner_error = result.get("error") or {}
    central_error = central.get("error") or {}
    if status == "failed":
        expected_code = CENTRAL_ERROR_PROJECTION.get(owner_error.get("code"), "internal_error")
        if not owner_error or central_error.get("code") != expected_code:
            fail("J_CENTRAL")
    if status in ("succeeded", "no_op") and central.get("error") is not None:
        fail("J_CENTRAL")

    return sorted(failures)


def live_central_checks(root: Path | None = None) -> list[str]:
    """Drift-diff the central envelope mirror against the live owner schema.

    Compares required fields, consts, enum vocabularies, the CommandId
    pattern and coherence-rule count of ``central_response``/``central_error``
    with ``ui_command_response.schema.json``. Any owner change fails closed.
    Returns failure strings (empty ok).
    """
    base = root or ROOT
    try:
        owner = read_json(base / CENTRAL_REL)
        companion = read_json(base / SCHEMA_REL)
    except (OSError, ValueError) as exc:
        return [f"central_mirror_unreadable: {exc}"]
    facts: list[str] = []
    mirror = companion.get("$defs", {}).get("central_response", {})
    if mirror.get("required") != owner.get("required"):
        facts.append("central_mirror_required_drift")
    if mirror.get("properties", {}).get("schema_id") != owner.get("properties", {}).get("schema_id"):
        facts.append("central_mirror_schema_id_drift")
    if mirror.get("properties", {}).get("schema_version") != owner.get("properties", {}).get("schema_version"):
        facts.append("central_mirror_schema_version_drift")
    for field in ("response_kind", "ack_status", "result_status"):
        if mirror.get("properties", {}).get(field) != owner.get("properties", {}).get(field):
            facts.append(f"central_mirror_{field}_drift")
    owner_error = owner.get("$defs", {}).get("UICommandError", {})
    mirror_error = companion.get("$defs", {}).get("central_error", {})
    if mirror_error.get("required") != owner_error.get("required"):
        facts.append("central_mirror_error_required_drift")
    if mirror_error.get("properties", {}).get("code") != owner_error.get("properties", {}).get("code"):
        facts.append("central_mirror_error_code_drift")
    if "handler_unavailable" not in str(owner_error):
        facts.append("central_handler_unavailable_missing")
    owner_cmd = owner.get("$defs", {}).get("CommandId", {})
    mirror_cmd = companion.get("$defs", {}).get("central_command_id", {})
    if mirror_cmd.get("pattern") != owner_cmd.get("pattern") or \
            mirror_cmd.get("maxLength") != owner_cmd.get("maxLength"):
        facts.append("central_mirror_command_id_drift")
    if len(mirror.get("allOf", [])) != len(owner.get("allOf", [])):
        facts.append("central_mirror_rule_count_drift")
    return facts


def live_inventory_checks(root: Path | None = None) -> list[str]:
    """Prove the registered Settings key is read live, not assumed.

    Asserts ``Plans/settings_inventory.json`` still registers
    ``planning.testing.browser-component-action`` as a select with the known
    default. Returns failure strings (empty ok).
    """
    base = root or ROOT
    try:
        inventory = read_json(base / INVENTORY_REL)
    except (OSError, ValueError) as exc:
        return [f"settings_inventory_unreadable: {exc}"]
    rows = inventory if isinstance(inventory, list) else inventory.get("rows", inventory.get("settings", []))
    for row in rows:
        if isinstance(row, dict) and row.get("id") == REGISTERED_COMPONENT_ACTION_KEY:
            if row.get("type") != "select":
                return ["settings_key_type_drift"]
            if row.get("default") != REGISTERED_COMPONENT_ACTION_DEFAULT:
                return ["settings_key_default_drift"]
            return []
    return ["settings_key_missing"]


def _iter_cases(fixtures: dict[str, Any]) -> tuple[list[dict[str, Any]], list[dict[str, Any]]]:
    valid = [c for key in ("valid", "positive", "valid_cases") for c in fixtures.get(key, [])]
    invalid = [c for key in ("invalid", "negative", "negative_cases") for c in fixtures.get(key, [])]
    return valid, invalid


def validate_tree(base: Path) -> tuple[int, list[str]]:
    """Validate the whole companion pack under ``base``. Returns (errors, log)."""
    log: list[str] = []
    errors = 0
    try:
        schema = read_json(base / SCHEMA_REL)
        fixtures = read_json(base / FIXTURE_REL)
    except (OSError, ValueError) as exc:
        return 1, [f"companion_pack_unreadable: {exc}"]
    try:
        Draft202012Validator.check_schema(schema)
    except Exception as exc:  # noqa: BLE001 - surfaced as a finding
        return 1, [f"metaschema_failure: {exc}"]
    if fixtures.get("owner_schema") != SCHEMA_REL:
        log.append("stale_owner_schema_path"); errors += 1
    if fixtures.get("contract_schema_id") != schema.get("x-schema-id"):
        log.append("stale_aggregate_owner_id"); errors += 1
    for finding in live_central_checks(base):
        log.append(finding); errors += 1
    for finding in live_inventory_checks(base):
        log.append(finding); errors += 1
    valid, invalid = _iter_cases(fixtures)
    by_name = {c["name"]: c for c in valid}
    for case in valid:
        shape = structural_errors(case["definition"], case["value"], base)
        if shape:
            log.append(f"valid/{case['name']}: SHAPE_INVALID {shape[:2]}"); errors += 1
            continue
        joined = browser_capture_semantic_failures(case["definition"], case["value"])
        if joined:
            log.append(f"valid/{case['name']}: {joined}"); errors += 1
    for case in invalid:
        base_case = by_name.get(case["base_valid"])
        if base_case is None:
            log.append(f"invalid/{case['name']}: unknown base_valid"); errors += 1
            continue
        mutated = apply_patch(base_case["value"], case["patch"])
        shape = structural_errors(case.get("definition", base_case["definition"]), mutated, base)
        if "semantic_rule" in case:
            if shape:
                log.append(f"invalid/{case['name']}: unexpected SHAPE_INVALID {shape[:2]}"); errors += 1
            elif case["semantic_rule"] not in browser_capture_semantic_failures(
                    case.get("definition", base_case["definition"]), mutated):
                log.append(f"invalid/{case['name']}: missing {case['semantic_rule']}"); errors += 1
        elif not shape:
            log.append(f"invalid/{case['name']}: unexpectedly shape-valid"); errors += 1
    log.append(f"browser_capture: {len(valid)} valid + {len(invalid)} invalid checked, {errors} errors")
    return errors, log


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Static browser-capture companion validator.")
    parser.add_argument("command", choices=["validate"], help="validate the companion pack")
    parser.add_argument("--root", default=str(ROOT), help="tree root (default: repo root)")
    args = parser.parse_args(argv)
    if args.command == "validate":
        errors, log = validate_tree(Path(args.root))
        print("\n".join(log))
        return 1 if errors else 0
    return 2


if __name__ == "__main__":
    sys.exit(main())

