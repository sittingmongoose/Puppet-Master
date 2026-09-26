"""Owner-local settlement oracle for the three application-update local actions.

Inputs are contract values. No supplied ref, generation, Boolean or fixture
supplies owner projection admission, a mounted local controller, a caller
return target, permission, or durable state. Native owners must resolve the
original owner request, the original owner projection and the actual return
context under their own authority before applying these relationships.

The module performs no I/O and writes nothing. Every rule below either reuses
an existing owner token or enforces an authored cross-record relationship that
JSON Schema cannot express. Nothing here proves that a native local controller
ran, that a projection was authentic, or that a refusal was truthful.
"""
from __future__ import annotations

import re

DEFINITION = "ApplicationUpdateLocalSettlement"
RECORD_KIND = "ApplicationUpdateLocalSettlement"

LOCAL_ACTION_IDS = (
    "ui.update.app.open_details",
    "ui.update.app.open_logs",
    "ui.update.app.open_release_notes",
)
# Existing owner reason tokens only (ApplicationUpdateCommandError.code,
# ApplicationUpdateDisabledReason.code, the TCP-APP-UPDATE-LOCAL disabled
# reason rule, and the RSC-014 caller_unavailable return rule).
REFUSAL_REASONS = (
    "invalid_request",
    "handler_unavailable",
    "permission_denied",
    "identity_mismatch",
    "stale_projection",
    "caller_unavailable",
)
CURRENTNESS = ("current", "stale", "conflicted", "unknown")

# The owner's own non-secret ref bound (ApplicationUpdateNonSecretRef.not).
NON_SECRET_REF = re.compile(
    r"(^|[._:/-])(raw|password|secret|access_token|refresh_token|api_key|cookie|authorization)([._:/-]|$)"
)

# request.return_context key -> return_settlement key
RETURN_IDENTITY_FIELDS = (
    ("surface_id", "surface_ref"),
    ("route_id", "route_ref"),
    ("invocation_token", "invocation_token"),
    ("return_generation", "return_generation"),
)


def _strings(value, path=""):
    """Yield every (path, string value) pair. Keys are structural names, not
    carried values, so only values are scanned for secret-shaped material."""

    if isinstance(value, dict):
        for key, nested in value.items():
            yield from _strings(nested, f"{path}/{key}")
    elif isinstance(value, list):
        for index, nested in enumerate(value):
            yield from _strings(nested, f"{path}/{index}")
    elif isinstance(value, str):
        yield path, value


def _docker(value):
    return value if isinstance(value, dict) else {}


def local_settlement_semantic_failures(definition_name: str, value) -> list[str]:
    """Return the authored cross-record failures for one settlement record."""

    if definition_name not in (DEFINITION, "<root>"):
        return []
    if not isinstance(value, dict) or value.get("record_kind") != RECORD_KIND:
        # Fail closed on a malformed direct call, but stay silent for another
        # closed record that a caller routed here by mistake.
        return ["local_settlement_malformed_input"] if definition_name == DEFINITION else []

    failures: list[str] = []
    request = _docker(value.get("request"))
    projection = _docker(value.get("owner_current_projection"))
    owner_result = value.get("owner_result")
    result = _docker(owner_result)
    refusal = value.get("refusal")
    return_settlement = _docker(value.get("return_settlement"))
    return_context = _docker(request.get("return_context"))

    outcome = value.get("outcome")
    presented = outcome == "presented"
    action_id = request.get("local_action_id")
    expected = request.get("expected_projection_generation")
    observed = projection.get("projection_generation")
    controller = projection.get("mounted_local_controller_ref")
    restoration = return_settlement.get("restoration")
    focus = return_settlement.get("focus_target")

    # --- identity: the settlement never restates another action or an
    # independent owner projection in place of the request's own. These are the
    # typed identity slots; the three ui.update.app.* ids are the only admitted
    # action identities, so a retired cmd.update.app.* spelling cannot appear
    # here at all.
    if action_id not in LOCAL_ACTION_IDS:
        failures.append("local_settlement_action_identity_unbound")
    if isinstance(owner_result, dict) and result.get("local_action_id") != action_id:
        failures.append("local_settlement_owner_result_identity_mismatch")
    if projection.get("projection_ref") != request.get("projection_ref"):
        failures.append("local_settlement_projection_identity_mismatch")
    if isinstance(owner_result, dict) and result.get("projection_ref") != request.get("projection_ref"):
        failures.append("local_settlement_owner_result_projection_mismatch")

    # --- currentness: the actual generation decides stale, not a label.
    if isinstance(expected, int) and isinstance(observed, int):
        if expected != observed:
            if value.get("currentness") != "stale":
                failures.append("local_settlement_currentness_understates_generation_change")
            if outcome == "presented":
                failures.append("local_settlement_success_on_stale_projection")
        else:
            if value.get("currentness") == "stale":
                failures.append("local_settlement_stale_currentness_unproven")
            if outcome == "stale_projection":
                failures.append("local_settlement_stale_claim_without_generation_change")
            if presented and value.get("currentness") != "current":
                failures.append("local_settlement_success_on_stale_projection")

    # --- the mounted owner-local presentation controller, not a fabricated one.
    if presented and controller is None:
        failures.append("local_settlement_success_without_mounted_controller")
    if outcome == "handler_unavailable" and controller is not None:
        failures.append("local_settlement_handler_unavailable_with_mounted_controller")

    # --- exact request-to-result identity when a success result is claimed.
    if isinstance(owner_result, dict):
        if result.get("projection_generation") != observed:
            failures.append("local_settlement_owner_result_generation_mismatch")
        if result.get("return_context") != return_context:
            failures.append("local_settlement_owner_result_return_context_mismatch")
        if result.get("redacted") is not True or result.get("lazy") is not True:
            failures.append("local_settlement_owner_result_redaction")

    # --- exact return settlement of the initiating caller context.  The return
    # restore target is the authentic initiating focus, never the opened target:
    # the opened target stays in the owner result's accessible_focus_target.
    for request_key, settlement_key in RETURN_IDENTITY_FIELDS:
        if return_settlement.get(settlement_key) != return_context.get(request_key):
            failures.append("local_settlement_return_identity_mismatch")
            break
    if restoration == "restored" and focus != return_context.get("focus_target"):
        failures.append("local_settlement_return_focus_mismatch")

    # --- an unavailable caller context is reported, never simulated.
    if (outcome == "caller_unavailable") != (restoration == "caller_unavailable"):
        failures.append("local_settlement_caller_unavailable_mismatch")
    if restoration == "caller_unavailable" and focus is not None:
        failures.append("local_settlement_caller_unavailable_mismatch")
    if restoration == "restored" and focus is None:
        failures.append("local_settlement_caller_unavailable_mismatch")

    # --- refusal and success shapes are exclusive.
    refusal_is_object = isinstance(refusal, dict)
    result_is_object = isinstance(owner_result, dict)
    if presented != result_is_object or presented == refusal_is_object:
        failures.append("local_settlement_outcome_shape_mismatch")
    if refusal_is_object and _docker(refusal).get("reason_code") != outcome:
        failures.append("local_settlement_refusal_reason_mismatch")

    # --- no domain command identity, no domain effect, no secret material.
    # The typed identity slots are what decide this: request.local_action_id and
    # owner_result.local_action_id must be the exact three ui.update.app.*
    # actions, and domain_command_id must be null. Opaque refs are deliberately
    # not scanned for command substrings: an owner-valid projection/log/return
    # ref may legitimately name the command that produced it, and a
    # projection_ref is content provenance, not an action identity.
    if (
        value.get("mutated_domain_state") is not False
        or value.get("domain_handler_invoked") is not False
        or value.get("domain_event_emitted") is not False
        or value.get("domain_command_id") is not None
    ):
        failures.append("local_settlement_domain_effect_present")
    if any(NON_SECRET_REF.search(text) for _, text in _strings(value)):
        failures.append("local_settlement_secret_material")

    return sorted(set(failures))
