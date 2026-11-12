"""CV-1100 / SP-1100 / SP-1101 adapters for coordination.

The SP-320 event-id preimage stays a JSON array of strings. Integer slots are
exact tokens before that decimalization. The fixture payload hash stays the
local canonical digest; it is not the CV-317 producer projection.
"""
from __future__ import annotations

import hashlib
import sys
from typing import Any

from pm_event_numbers import (
    FrozenRecipe,
    OriginalBinding,
    OriginalCustody,
    Refusal,
    RecipeTuple,
    RetainedDispatcher,
    current_integer,
    current_integer_token,
)


PAYLOAD_URI = "https://puppetmaster.local/schemas/coordination_event_payloads/1.0.0/coordination_event_payloads.schema.json"
# Frozen SP-320 identity and local payload hash. Current integer grammar is not
# reapplied to a retained original; the recipe id is not caller-selectable.
RECIPE_ID = "coordination-sp320-string-array-v1"
LOCAL_PAYLOAD_RECIPE = "coordination-local-payload-v1"


def _definition(schema: dict[str, Any], ref: str) -> dict[str, Any] | None:
    marker = "#/$defs/"
    if marker not in ref:
        return None
    name = ref.split(marker, 1)[1].split("/", 1)[0]
    value = schema.get("$defs", {}).get(name)
    return value if isinstance(value, dict) else None


def _tighten(bounds: dict[str, tuple[int | None, int | None]], field: str, node: dict[str, Any]) -> None:
    if node is True or not isinstance(node, dict):
        return
    minimum, maximum = bounds.get(field, (None, None))
    if node.get("type") == "integer" or type(node.get("const")) is int or (
            isinstance(node.get("enum"), list) and node["enum"] and all(type(item) is int for item in node["enum"])):
        if type(node.get("minimum")) is int:
            minimum = node["minimum"] if minimum is None else max(minimum, node["minimum"])
        if type(node.get("maximum")) is int:
            maximum = node["maximum"] if maximum is None else min(maximum, node["maximum"])
        if type(node.get("const")) is int:
            minimum = node["const"] if minimum is None else max(minimum, node["const"])
            maximum = node["const"] if maximum is None else min(maximum, node["const"])
        if isinstance(node.get("enum"), list) and all(type(item) is int for item in node["enum"]):
            low, high = min(node["enum"]), max(node["enum"])
            minimum = low if minimum is None else max(minimum, low)
            maximum = high if maximum is None else min(maximum, high)
        bounds[field] = (minimum, maximum)


def integer_bounds(schema: dict[str, Any], definition: str) -> dict[str, tuple[int | None, int | None]]:
    """Effective inclusive bounds of every integer slot on one payload definition."""
    root = schema.get("$defs", {}).get(definition)
    bounds: dict[str, tuple[int | None, int | None]] = {}
    if not isinstance(root, dict):
        return bounds
    pending = [root]
    seen: list[int] = []
    while pending:
        node = pending.pop()
        identity = id(node)
        if identity in seen or not isinstance(node, dict):
            continue
        seen.append(identity)
        properties = node.get("properties")
        if isinstance(properties, dict):
            for field, spec in properties.items():
                _tighten(bounds, field, spec)
        for item in node.get("allOf") or []:
            if isinstance(item, dict) and isinstance(item.get("$ref"), str):
                target = _definition(schema, item["$ref"])
                if target is not None:
                    pending.append(target)
            elif isinstance(item, dict):
                pending.append(item)
        ref = node.get("$ref")
        if isinstance(ref, str):
            target = _definition(schema, ref)
            if target is not None:
                pending.append(target)
    return bounds


def integer_slot_code(schema: dict[str, Any], definition: str, payload: Any) -> str | None:
    """Refuse a present slot current_integer rejects. Absent slots are not this defect."""
    if type(payload) is not dict:
        return None
    for field, (minimum, maximum) in integer_bounds(schema, definition).items():
        if field not in payload:
            continue
        try:
            current_integer(payload[field], minimum=minimum, maximum=maximum)
        except Refusal:
            return "payload_integer_slots"
    return None


def application_bounds_match(schema: dict[str, Any]) -> bool:
    defs = schema.get("$defs", {})
    if not isinstance(defs, dict):
        return False
    matched = False
    for name in defs:
        if not name.endswith("ApplicationV1"):
            continue
        base = name[: -len("ApplicationV1")]
        if base not in defs:
            return False
        matched = True
        if integer_bounds(schema, base) != integer_bounds(schema, name):
            return False
    return matched


def epoch_token(token: str) -> int | None:
    """Canonical non-negative integer token, including integers past 2**53 and 4300 digits."""
    try:
        return current_integer_token(token, minimum=0)
    except Refusal:
        return None


def exact_decimal(value: int) -> str:
    """Render an exact integer, including values past Python's default 4300-digit conversion limit."""
    if type(value) is not int:
        raise Refusal("integer_type")
    previous = sys.get_int_max_str_digits()
    sys.set_int_max_str_digits(0)
    try:
        return str(value)
    finally:
        sys.set_int_max_str_digits(previous)


def decimal_integer(value: Any, *, minimum: int) -> str:
    """Decimal digits of an exact integer. Floats and other spellings refuse."""
    return exact_decimal(current_integer(value, minimum=minimum))


def recipe_tuple(resource_sha256: str) -> RecipeTuple:
    return RecipeTuple(
        envelope_schema_id="pm.event.v0",
        envelope_schema_version="2.0.0",
        payload_schema_id="pm.coordination_event.payload.schema.v1",
        payload_schema_version="1.0.0",
        owner_source_id="SP-320",
        owner_edition="1.0.0",
        registry_revision="1.0.0",
        identity_recipe=RECIPE_ID,
        producer_recipe=LOCAL_PAYLOAD_RECIPE,
        physical_profile="pm.seglog_frame_v2.event_value.canonical_msgpack.v1",
        full_value_profile="pm.storage.original_event_value_commitment.v1",
        local_source_profile=LOCAL_PAYLOAD_RECIPE,
        payload_profile="coordination-payload-canonical-v1",
        resource_manifest_sha256=resource_sha256,
    )


def resource_sha256(blob: bytes) -> str:
    return hashlib.sha256(blob).hexdigest()


def retained_retry_matches(recipe_id: str | None, stored_digest: str, presented_digest: str) -> bool:
    """SP-1101 lookup: only the frozen SP-320 recipe can replay an exact original digest."""
    if recipe_id != RECIPE_ID or type(stored_digest) is not str or stored_digest != presented_digest:
        return False
    if len(stored_digest) != 64:
        return False
    recipe = recipe_tuple(resource_sha256(RECIPE_ID.encode("ascii")))
    binding = OriginalBinding(
        storage_instance_id="coordination-retained",
        scope_kind="project",
        server_id="coordination-retained",
        project_id="coordination-retained",
        event_type="coordination.agent_registered",
        event_id="evt_coordination_" + stored_digest,
        idempotency_key="coordination:retained",
        owner_operation_id="AgentCoordinator",
        source_commitment=stored_digest,
    )
    body = b"coordination-retained-original"
    custody = OriginalCustody(binding, recipe, body, body, body)

    class _Owner:
        def authenticated_original(self, original_ref: str) -> OriginalCustody:
            if original_ref != "coordination-retained":
                raise Refusal("original_query")
            return custody

    dispatcher = RetainedDispatcher(_Owner(), {recipe: FrozenRecipe(lambda item: item.recipe is recipe)})
    try:
        dispatcher.resolve("coordination-retained", binding, disclose=lambda _binding: True)
    except Refusal:
        return False
    return True
