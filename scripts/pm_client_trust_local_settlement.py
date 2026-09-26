"""Owner-local settlement oracle for the trusted Client details local action.

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

DEFINITION = "ClientTrustLocalSettlement"
RECORD_KIND = "ClientTrustLocalSettlement"

LOCAL_ACTION_IDS = (
    "ui.client.open_details",
)
# Existing owner/central reason tokens only (the TCP-CLIENT-TRUST-LOCAL
# disabled_reason_rule names handler_unavailable and stale projection; the
# central UICommandError vocabulary carries both; caller_unavailable is the
# owner exact-return rule in Plans/Server_System.md).
REFUSAL_REASONS = (
    "stale_projection",
    "handler_unavailable",
    "caller_unavailable",
)

# The owner's own non-secret ref bound (ClientTrustNonSecretRef.not).
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


def client_trust_local_settlement_semantic_failures(definition_name: str, value) -> list[str]:
    """Return the authored cross-record failures for one settlement record."""

    if definition_name not in (DEFINITION, "<root>"):
        return []
    if not isinstance(value, dict) or value.get("record_kind") != RECORD_KIND:
        # Fail closed on a malformed direct call, but stay silent for another
        # closed record that a caller routed here by mistake.
        return ["client_trust_local_settlement_malformed_input"] if definition_name == DEFINITION else []

    failures: list[str] = []
    request = _docker(value.get("request"))
    # The absence decision reads the actual selected owner-projection field:
    # a null owner_current_projection is the truthful absent selection, never
    # a stand-in for any copied declaration elsewhere in the record.
    projection_value = value.get("owner_current_projection")
    projection_absent = projection_value is None
    projection = projection_value if isinstance(projection_value, dict) else {}
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
    # typed identity slots; ui.client.open_details is the only admitted action
    # identity, so the retired cmd.client.open_details spelling cannot appear
    # here at all.
    if action_id not in LOCAL_ACTION_IDS:
        failures.append("client_trust_local_settlement_action_identity_unbound")
    if isinstance(owner_result, dict) and result.get("local_action_id") != action_id:
        failures.append("client_trust_local_settlement_owner_result_identity_mismatch")
    if not projection_absent and projection.get("projection_ref") != request.get("projection_ref"):
        failures.append("client_trust_local_settlement_projection_identity_mismatch")
    if isinstance(owner_result, dict) and result.get("projection_ref") != request.get("projection_ref"):
        failures.append("client_trust_local_settlement_owner_result_projection_mismatch")

    # --- currentness: the actual generation decides stale, never a declared
    # witness. A copied expected generation does not authenticate currentness.
    if isinstance(expected, int) and isinstance(observed, int):
        if expected != observed:
            if outcome != "stale_projection":
                failures.append("client_trust_local_settlement_currentness_understates_generation_change")
            if presented:
                failures.append("client_trust_local_settlement_success_on_stale_projection")
        else:
            if outcome == "stale_projection":
                failures.append("client_trust_local_settlement_stale_claim_without_generation_change")

    # --- the owner-selected projection can be absent at settlement time. The
    # null member itself is the absence; it settles only as the genuine
    # stale_projection refusal with no owner success result. A presented success
    # on absence is the causal defect, and any other refusal cause mistakes the
    # missing selection for a controller or caller failure.
    if projection_absent:
        if presented:
            failures.append("client_trust_local_settlement_success_on_absent_projection")
        elif outcome != "stale_projection":
            failures.append("client_trust_local_settlement_absent_projection_requires_stale_refusal")
    # --- the mounted owner-local presentation controller, not a fabricated one;
    # its status comes from the independent owner projection record, never from
    # the request or the result.
    else:
        if presented and controller is None:
            failures.append("client_trust_local_settlement_success_without_mounted_controller")
        if outcome == "handler_unavailable" and controller is not None:
            failures.append("client_trust_local_settlement_handler_unavailable_with_mounted_controller")

    # --- exact request-to-result identity when a success result is claimed.
    if isinstance(owner_result, dict):
        if result.get("projection_generation") != observed:
            failures.append("client_trust_local_settlement_owner_result_generation_mismatch")
        if result.get("return_context") != return_context:
            failures.append("client_trust_local_settlement_owner_result_return_context_mismatch")
        if result.get("redacted") is not True or result.get("lazy") is not True:
            failures.append("client_trust_local_settlement_owner_result_redaction")

    # --- exact return settlement of the initiating caller context.  The return
    # restore target is the authentic initiating focus, never the opened target:
    # the opened target stays in the owner result's accessible_focus_target and
    # may legitimately differ from it.
    for request_key, settlement_key in RETURN_IDENTITY_FIELDS:
        if return_settlement.get(settlement_key) != return_context.get(request_key):
            failures.append("client_trust_local_settlement_return_identity_mismatch")
            break
    if restoration == "restored" and focus != return_context.get("focus_target"):
        failures.append("client_trust_local_settlement_return_focus_mismatch")

    # --- an unavailable caller context is reported, never simulated, and never
    # resolved by returning to another connected Client.
    if (outcome == "caller_unavailable") != (restoration == "caller_unavailable"):
        failures.append("client_trust_local_settlement_caller_unavailable_mismatch")
    if restoration == "caller_unavailable" and focus is not None:
        failures.append("client_trust_local_settlement_caller_unavailable_mismatch")
    if restoration == "restored" and focus is None:
        failures.append("client_trust_local_settlement_caller_unavailable_mismatch")

    # --- refusal and success shapes are exclusive.
    refusal_is_object = isinstance(refusal, dict)
    result_is_object = isinstance(owner_result, dict)
    if presented != result_is_object or presented == refusal_is_object:
        failures.append("client_trust_local_settlement_outcome_shape_mismatch")
    if refusal_is_object and _docker(refusal).get("reason_code") != outcome:
        failures.append("client_trust_local_settlement_refusal_reason_mismatch")

    # --- no domain command identity, no domain effect, no secret material.
    # The typed identity slots are what decide this: request.local_action_id and
    # owner_result.local_action_id must be exactly ui.client.open_details, and
    # domain_command_id must be null. Opaque refs are deliberately not scanned
    # for command substrings: an owner-valid projection/return ref may
    # legitimately name the command that produced it, and a projection_ref is
    # content provenance, not an action identity.
    if (
        value.get("mutated_domain_state") is not False
        or value.get("domain_handler_invoked") is not False
        or value.get("domain_event_emitted") is not False
        or value.get("domain_command_id") is not None
    ):
        failures.append("client_trust_local_settlement_domain_effect_present")
    if any(NON_SECRET_REF.search(text) for _, text in _strings(value)):
        failures.append("client_trust_local_settlement_secret_material")

    return sorted(set(failures))
