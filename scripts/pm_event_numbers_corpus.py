"""Shared finite NUMRULE oracle runner; imported by pm_event_numbers --self-test.

This models trusted custody with a separate sealed fixture lookup. It does not
authenticate a native store, register a family, or run the other drafting lanes.

scope="numbers" selects the number cases and number owner checks and imports no
date-time module. Date-time code here stays lazy, on date-time routes only.

Every positive of an API that returns a value carries "returns": the exact
type-aware value, transcribed independently of the helper and compared through
typed() below. run_mutations() replays a committed mutation set against the
number scope; each mutation must make it fail.
"""
from __future__ import annotations

from contextlib import contextmanager
from dataclasses import dataclass, fields as dataclass_fields, is_dataclass, replace
from decimal import Decimal
from functools import lru_cache
import hashlib
import json
from pathlib import Path
import sys
import types

# Corpus operations that execute no date-time code. A history case selects a
# date-time profile only through date_time_profile, so number_case excludes it.
NUMBER_OPS = frozenset(("token", "slot", "integer", "boolean", "parse_token", "parse", "current_json",
                        "current_json_slot", "jcs", "jcs_value", "jcs_kind_declaration", "physical",
                        "uint64", "decode", "append_policy", "history", "payload", "recipe_constructor",
                        "binding_constructor", "json_number", "producer", "full_value_commitment"))
# Operations whose API returns a value beyond the output string. Each of their
# positives must carry an independent "returns" oracle.
RETURNING_OPS = frozenset(("token", "slot", "integer", "uint64", "boolean", "parse", "parse_token",
                           "current_json", "current_json_slot", "decode", "payload",
                           "recipe_constructor", "binding_constructor", "json_number"))
SCOPES = ("all", "numbers")
MUTATION_CLASSES = ("value_rounding", "type_coercion", "dropped_qualification", "substituted_serializer",
                    "wrong_hash", "removed_refusal", "off_by_one_boundary")


def number_case(case):
    return case["op"] in NUMBER_OPS and not case.get("date_time_profile")


def _decimal_string(n):
    """Exact decimal digits of an int, independent of Python's str() digit limit."""
    negative = n < 0
    n = -n if negative else n
    chunks = []
    while True:
        n, low = divmod(n, 1_000_000_000)
        chunks.append(low)
        if not n:
            break
    text = str(chunks[-1]) + "".join("%09d" % c for c in reversed(chunks[:-1]))
    return "-" + text if negative else text


def typed(value):
    """Exact type-aware encoding of an API's returned value: the oracle side.

    It never calls pm_event_numbers. Exact built-in types only: a float, bool or
    int subclass where an int is expected does not match. Helper carriers are
    recognised by class name and checked for their documented base type.
    """
    t = type(value)
    name = t.__name__
    if value is None or t is str:
        return value
    if t is bool:
        return {"@bool": value}
    if t is int:
        return {"@int": _decimal_string(value)}
    if t is float:
        return {"@float": repr(value)}
    if t is bytes:
        return {"@binary": value.hex()}
    if t is Decimal:
        return {"@decimal": str(value)}
    if name == "ParsedDecimal" and isinstance(value, Decimal):
        return {"@parsed_decimal": str(value), "kind": typed(getattr(value, "numeric_kind", None))}
    if name == "JsonNumber" and is_dataclass(value):
        return {"@json_number": typed(value.token), "integer": typed(value.integer)}
    if t is list:
        return [typed(v) for v in value]
    if t is dict and all(type(k) is str for k in value):
        return {"@object": {k: typed(v) for k, v in value.items()}}
    if is_dataclass(value) and not isinstance(value, type):
        return {"@record": name, "fields": {f.name: typed(getattr(value, f.name)) for f in dataclass_fields(value)}}
    return {"@unknown": name, "repr": repr(value)[:200]}


def _json_native(value):
    return type(value) in (str, bool, int, float, type(None), list, dict)


@dataclass
class Returned:
    """Executor output plus the API's actual return value, for the returns oracle."""
    output: object
    value: object


@dataclass
class RetainedObservation:
    returned: object
    observed: object
    calls: list


def success_errors(result, case=None):
    """Test postconditions, deliberately outside admission evaluation."""
    errors = []
    if case is not None and case["op"] in RETURNING_OPS:
        if "returns" not in case:
            errors.append("missing independent returns oracle")
        else:
            actual = typed(result.value if isinstance(result, Returned) else result)
            if actual != case["returns"]:
                text = json.dumps(actual, sort_keys=True)
                errors.append("returned " + (text if len(text) <= 300 else text[:300] + "..."))
    if not isinstance(result, RetainedObservation):
        return errors
    if len(result.calls) != 1:
        errors.append("expected exactly one frozen verifier")
    if result.returned != result.observed:
        errors.append("retained bytes/result/receipt changed")
    return errors


def _paths(rows):
    return {tuple(p) for p in rows}


def _qualification(spec):
    """Corpus JSON paths (lists) to the helper's tuple paths."""
    out = {}
    if "type_sensitive_paths" in spec:
        out["type_sensitive_paths"] = _paths(spec["type_sensitive_paths"])
    if "sign_sensitive_paths" in spec:
        out["sign_sensitive_paths"] = _paths(spec["sign_sensitive_paths"])
    if "numeric_kinds" in spec:
        out["numeric_kinds"] = {tuple(p): kind for p, kind in spec["numeric_kinds"]}
    return out


def _at(tree, path):
    for key in path:
        tree = tree[key]
    return tree


def _value(value):
    if type(value) is dict:
        if set(value) == {"@int"}:
            import pm_event_numbers as m
            return m._integer_digits(value["@int"])
        if set(value) == {"@float"}:
            return float(value["@float"])
        if set(value) == {"@decimal"}:
            return Decimal(value["@decimal"])
        if set(value) == {"@binary"}:
            return bytes.fromhex(value["@binary"])
        return {k: _value(v) for k, v in value.items()}
    if type(value) is list:
        return [_value(v) for v in value]
    return value


def _retained(m, case, corpus):
    raw = corpus["historical_originals"][case.get("original", "integral_float")].encode()
    binding = m.OriginalBinding("store-A", "application", "server-A", None,
                                "fixture.number", "original-event", "original-key",
                                "original-operation", hashlib.sha256(raw).hexdigest())
    base_recipe = m.RecipeTuple("pm.event.v0", "1.0.0", "fixture.payload", "1.0.0",
                               "fixture.original-owner", "earlier-edition", "earlier-registry",
                               "fixture.identity.old", "fixture.decimal.old", m.EVENT_VALUE,
                               "fixture.full.old", "fixture.source.old", "application/json",
                               hashlib.sha256(b"frozen fixture resources").hexdigest())
    current_recipe = replace(base_recipe, owner_edition="current-edition",
                             identity_recipe="fixture.identity.current")
    replaced_resources = replace(base_recipe, resource_manifest_sha256="f" * 64)
    original = m.OriginalCustody(binding, base_recipe, raw, b"original-result", b"original-receipt")
    scenario = case.get("scenario", "valid")
    if scenario == "current_original":
        original = replace(original, recipe=current_recipe)
    sealed = original
    expected = binding
    override = None
    allow = True
    observed = original
    if scenario.startswith("foreign_"):
        name = scenario.removeprefix("foreign_")
        val = "foreign" if name != "project_id" else "foreign-project"
        if name == "scope_kind":
            # A valid project binding must also change project_id. Isolate the
            # dispatcher's scope comparison with a boundary-only fixture that
            # bypasses constructor validation, keeping every peer field fixed.
            # This is not a valid project query or a constructor-domain proof.
            expected = replace(binding)
            object.__setattr__(expected, "scope_kind", "project")
        elif name == "project_id":
            # Valid project context, different original project, one changed join.
            binding = replace(binding, scope_kind="project", project_id="project-A")
            original = replace(original, binding=binding)
            sealed = observed = original
            expected = replace(binding, project_id=val)
        else:
            expected = replace(binding, **{name: val})
    elif scenario == "caller_override":
        override = base_recipe
    elif scenario == "downgrade":
        sealed = replace(original, recipe=current_recipe)
        observed = original  # Supported old recipe, wrong original selection.
    elif scenario == "unknown_recipe":
        # Authentic original, genuinely unsupported catalog entry. No stale seal.
        sealed = observed = replace(original, recipe=replace(base_recipe, identity_recipe="unregistered"))
    elif scenario == "rewritten_resources":
        # Supported tuple, but original resource selection has been tampered.
        observed = replace(original, recipe=replaced_resources)
    elif scenario == "ambiguous":
        observed = (original, replace(original, recipe=current_recipe))
    elif scenario == "missing":
        observed = None
    elif scenario == "self_authenticated_dict":
        observed = {"verified": True, "original": original, "sha256": hashlib.sha256(raw).hexdigest()}
    elif scenario == "verified_string":
        observed = {"verified": "true", "original": original}
    elif scenario == "forged_bytes_selfhash":
        forged = raw.replace(b'1.0', b'2.0')
        forged_binding = replace(binding, source_commitment=hashlib.sha256(forged).hexdigest())
        observed = replace(original, binding=forged_binding, record_bytes=forged)
        expected = forged_binding  # Re-key the caller hash too; anchor remains original.
    elif scenario in ("forged_result", "forged_receipt"):
        observed = replace(original, **{scenario.removeprefix("forged_") + "_bytes": b"forged"})
    elif scenario == "string_record_bytes":
        # Isolate the exact bytes carrier gate: the independent fixture seal
        # carries the same string, and its UTF-8 content still has the original
        # commitment. The specialized verifier adapter below is fixture-only.
        sealed = observed = replace(original, record_bytes=raw.decode())
    elif scenario in ("denied", "deleted", "withdrawn", "hold_denied"):
        allow = False
    elif scenario == "truthy_disclosure":
        allow = "true"

    calls = []

    class FixtureOwner:
        def authenticated_original(self, ref):
            if ref != "sealed-ref":
                raise m.Refusal("original_authority")
            return observed

    def verify(record):
        calls.append(record.recipe)
        # Exact independent original pin joins bytes/identity/source/recipe/result.
        # These names describe fixture recipes, not newly registered product IDs.
        verification_bytes = (record.record_bytes.encode() if scenario == "string_record_bytes"
                              else record.record_bytes)
        authentic = (record == sealed and
                     hashlib.sha256(verification_bytes).hexdigest() == record.binding.source_commitment)
        if authentic and case.get("date_time_profile"):
            from pm_event_datetime import date_time
            # The frozen original resource map selects this; no request switch.
            envelope_resources = corpus.get("historical_envelope_resources", {}).get(case.get("original"))
            selected = (envelope_resources["profile"] if envelope_resources else
                        case.get("sealed_date_time_profile", "event_record"))
            observed_profile = case["date_time_profile"]
            if observed_profile != selected:
                return False
            if envelope_resources:
                if "inventory_resource" in envelope_resources:
                    _validate_inventory_datetime(json.loads(record.record_bytes), envelope_resources["route"],
                                                 corpus["inventory_datetime_resources"][envelope_resources["inventory_resource"]])
                else:
                    _validate_envelope_datetime(json.loads(record.record_bytes),
                                                envelope_resources["route"], profile=selected,
                                                resource=(corpus["embedded_envelope_resources"][envelope_resources["resource"]]
                                                          if "resource" in envelope_resources else None))
            else:
                field = case.get("sealed_date_time_field", "occurred_at_utc")
                date_time(json.loads(record.record_bytes)[field], profile=selected)
        if authentic and scenario == "verifier_result":
            return case["verifier_result"]
        return authentic

    dispatcher = m.RetainedDispatcher(FixtureOwner(), {
        base_recipe: m.FrozenRecipe(verify), current_recipe: m.FrozenRecipe(verify),
        replaced_resources: m.FrozenRecipe(verify),
    })
    out = dispatcher.resolve("sealed-ref", expected, disclose=lambda b: allow,
                             recipe_override=override)
    return RetainedObservation(out, observed, calls)


@lru_cache(maxsize=None)
def _datetime_resource(path):
    return json.loads((Path(__file__).resolve().parents[1] / path).read_text())


@lru_cache(maxsize=None)
def _inventory_datetime_validator(path, resource_pointer, pointer, route):
    from referencing import Registry, Resource
    from referencing.jsonschema import DRAFT202012
    from pm_event_datetime import datetime_validator
    from pm_event_datetime_inventory import at, digest
    resources = [_datetime_resource(p) for p in (
        "Plans/event_record.schema.json", "Plans/event_append_receipt_contracts.schema.json",
        "Plans/goal_certified_event_coordinator_contracts/schemas/append-phase.v1.schema.json")]
    root = at(_datetime_resource(path), resource_pointer)
    uri = root.get("$id", "urn:pm:datetime:" + digest(root))
    registry = Registry().with_resources(
        (s["$id"], Resource.from_contents(s)) for s in resources)
    registry = registry.with_resource(uri, Resource.from_contents(root, default_specification=DRAFT202012))
    ref = {"$ref": uri + "#" + pointer[len(resource_pointer):]}
    schema = ref if route == "root_ref" else {"properties": {"batch": {"items": {"properties": {"event": ref}}}}}
    return datetime_validator(schema, registry=registry)


def _validate_inventory_datetime(value, route, resource):
    from jsonschema import ValidationError
    import pm_event_numbers as m
    validator = _inventory_datetime_validator(resource["path"], resource["resource_pointer"],
                                              resource["pointer"], route)
    instance = value if route == "root_ref" else {"batch": [{"event": value}]}
    try:
        validator.validate(instance)
    except ValidationError as error:
        if isinstance(error.cause, m.Refusal):
            raise error.cause
        if error.validator == "pattern" and error.path[-1] in ("observed_at_utc", "persisted_at_utc"):
            raise m.Refusal("date_time_utc_z") from error
        raise


@lru_cache(maxsize=None)
def _envelope_datetime_validator(route, profile, resource_path, pointer):
    """Reuse immutable owner resources, never cache a fixture's admission."""
    from referencing import Registry, Resource
    from pm_event_datetime import datetime_validator

    envelope, receipt, coordinator = (_datetime_resource(path) for path in (
        "Plans/event_record.schema.json", "Plans/event_append_receipt_contracts.schema.json",
        "Plans/goal_certified_event_coordinator_contracts/schemas/append-phase.v1.schema.json"))
    registry = Registry().with_resources(
        (s["$id"], Resource.from_contents(s)) for s in (envelope, receipt, coordinator))
    ref = {"$ref": envelope["$id"]}
    if resource_path is not None:
        embedded = _datetime_resource(resource_path)
        registry = registry.with_resource(embedded["$id"], Resource.from_contents(embedded))
        ref = {"$ref": embedded["$id"] + "#" + pointer}
    request = {"$ref": receipt["$id"] + "#/$defs/full_value_request"}
    compatibility = {"$ref": envelope["$id"] + "#/$defs/event_record_1_0_0_compatibility_reader"}
    schemas = {
        "direct": envelope,
        "root_ref": ref,
        "allOf": {"allOf": [envelope]},
        "nested_inline": {"properties": {"event": envelope}},
        "nested_ref": ({"properties": {"batch": {"type": "array", "items": {
            "properties": {"event": ref}}}}}),
        "full_value_request": request,
        "nested_full_value_request": {"properties": {"request": request}},
        "coordinator_event": {"$ref": coordinator["$id"] + "#/$defs/WholeGroupMember/properties/event"},
        "compatibility_ref": compatibility,
        "compatibility_nested": {"properties": {"events": {"items": compatibility}}},
    }
    return datetime_validator(schemas[route], profile=profile, registry=registry)


def _validate_envelope_datetime(event, route, *, profile="event_record", resource=None):
    """Exercise unchanged owner resources through their actual reference paths."""
    from jsonschema import ValidationError
    import pm_event_numbers as m
    validator = _envelope_datetime_validator(route, profile, resource["path"] if resource else None,
                                             resource["pointer"] if resource else None)
    instance = ({"event": event} if route in ("nested_inline", "full_value_request") else
                {"batch": [{"event": event}]} if route == "nested_ref" else
                {"request": {"event": event}} if route == "nested_full_value_request" else
                {"events": [event]} if route == "compatibility_nested" else event)
    try:
        validator.validate(instance)
    except ValidationError as error:
        if isinstance(error.cause, m.Refusal):
            raise error.cause
        if error.validator == "pattern" and error.path[-1] in ("observed_at_utc", "persisted_at_utc"):
            raise m.Refusal("date_time_utc_z") from error
        raise


def execute(m, case, corpus):
    op = case["op"]
    if op == "token":
        return Returned("accepted", m.current_integer_token(case["raw"], **case.get("bounds", {})))
    if op == "slot":
        tree = m.loads_exact('{"nested":{"number":' + case["raw"] + '}}')
        return Returned("accepted", m.current_integer(tree["nested"]["number"], **case.get("bounds", {})))
    if op == "integer":
        return Returned("accepted", m.current_integer(_value(case["value"]), **case.get("bounds", {})))
    if op == "uint64":
        return Returned("accepted", m.storage_uint64(_value(case["value"])))
    if op == "boolean":
        return Returned("accepted", m.exact_boolean(_value(case["value"])))
    if op == "append_policy":
        return m.current_append_policy(case["value"])
    if op == "parse":
        raw = bytes.fromhex(case["raw_hex"]) if "raw_hex" in case else case["raw"]
        return Returned("accepted", m.loads_exact(raw))
    if op == "parse_token":
        value = m.loads_exact(case["raw"])
        return Returned(value.token, value)
    if op == "current_json":
        kinds = {tuple(p): kind for p, kind in case["numeric_kinds"]} if "numeric_kinds" in case else None
        return Returned("accepted", m.loads_current_json(case["raw"], numeric_kinds=kinds))
    if op == "current_json_slot":
        # The documented sequence: parse, then current_integer at the schema
        # integer slot with that slot's bounds. Bounds sit on either side of the
        # exact value, so a rounded or float materialization changes the result.
        tree = m.loads_current_json(case["raw"])
        return Returned("accepted", m.current_integer(_at(tree, case["path"]), **case.get("bounds", {})))
    if op == "json_number":
        number = m.JsonNumber(case["token"], case["integer"])
        return Returned("accepted", {"number": number, "exact": number.exact()})
    if op == "binding_constructor":
        values = dict(storage_instance_id="store-A", scope_kind="application", server_id="server-A",
                      project_id=None, event_type="fixture.number", event_id="original-event",
                      idempotency_key="original-key", owner_operation_id="original-operation",
                      source_commitment="a" * 64)
        values.update(case["changes"])
        return Returned("accepted", m.OriginalBinding(**values))
    if op == "producer":
        # Actual public wrappers over the frozen base event. Expected bytes and
        # digests are independent vectors (ECMAScript serializer), not helper output.
        root = Path(__file__).resolve().parents[1]
        event = json.loads((root / "Plans/seglog_frame_v2_wire_fixtures.json").read_text())["base_event"]
        event.update(_value(case.get("changes", {})))
        for field in case.get("remove", []):
            del event[field]
        qualification = _qualification(case.get("qualification", {}))
        if case["route"] == "digest":
            return m.producer_semantic_digest(event, **qualification)
        return m.producer_semantic_bytes(event, **qualification).decode("utf-8")
    if op == "jcs":
        parser = m.loads_current_json if case.get("parser") == "current" else m.loads_exact
        return m.qualified_jcs(parser(case["raw"]),
                               type_sensitive_paths={()} if case.get("typed") else set(),
                               sign_sensitive_paths={()} if case.get("sign") else set(),
                               numeric_kinds={(): case["kind"]} if "kind" in case else {}).decode()
    if op == "jcs_value":
        return m.qualified_jcs(_value(case["value"]),
                               type_sensitive_paths={()} if case.get("typed") else set(),
                               sign_sensitive_paths={()} if case.get("sign") else set(),
                               numeric_kinds={(): case["kind"]} if "kind" in case else {}).decode()
    if op == "jcs_kind_declaration":
        # Boundary: declaration admission only, by explicit fixture adapter. It
        # stops before the separate kind-preservation predicate in qualified_jcs,
        # so cutting that predicate cannot mask or satisfy this case. The full
        # route, with both predicates, stays covered by the jcs_value cases.
        return m._declared_numeric_kind(_value(case["value"]), (),
                                        type_sensitive_paths={()} if case.get("typed") else set(),
                                        numeric_kinds={(): case["kind"]} if "kind" in case else {})
    if op == "datetime":
        from pm_event_datetime import datetime_validator
        from jsonschema import ValidationError
        # Exercise the enforced validator, not only the standalone predicate.
        schema = {"type": "string", "format": "date-time"}
        try:
            datetime_validator(schema, profile=case.get("profile", "event_record")).validate(case["value"])
        except ValidationError as error:
            if isinstance(error.cause, m.Refusal):
                raise error.cause
            if error.validator == "type":
                raise m.Refusal("date_time_type") from error
            raise
        return case["value"]
    if op == "datetime_direct":
        from pm_event_datetime import date_time
        return date_time(case["value"], profile=case.get("profile", "event_record"))
    if op == "envelope_datetime":
        root = Path(__file__).resolve().parents[1]
        event = json.loads((root / "Plans/seglog_frame_v2_wire_fixtures.json").read_text())["base_event"]
        resource = corpus["embedded_envelope_resources"][case["resource"]] if "resource" in case else None
        if resource is not None and resource.get("baseline") == "compaction":
            event = dict(corpus["embedded_compaction_event"])
        route = case.get("route", "direct")
        if route.startswith("compatibility_"):
            event.pop("scope_kind")
            event.update(schema_version="1.0.0", project_id="project-A", replay_policy="projector_replay_only")
        event[case["field"]] = case["value"]
        _validate_envelope_datetime(event, route, resource=resource)
        return case["value"]
    if op == "inventory_datetime":
        resource = corpus["inventory_datetime_resources"][case["resource"]]
        value = dict(resource["baseline"], **{case["field"]: case["value"]})
        _validate_inventory_datetime(value, case["route"], resource)
        return case["value"]
    if op == "family_datetime":
        from pm_event_datetime import datetime_validator
        root = Path(__file__).resolve().parents[1]
        schema = json.loads((root / "Plans/event_payloads/file_manager/file_created.schema.json").read_text())
        datetime_validator(schema["properties"]["ts"]).validate(case["value"])
        return case["value"]
    if op == "full_value_commitment":
        root = Path(__file__).resolve().parents[1]
        event = json.loads((root / "Plans/event_append_receipt_full_value_fixtures.json").read_text())["base_original_event"]
        event.update(case.get("changes", {}))
        return m.full_value_commitment(_value(case["container"]) if "container" in case else event)
    if op == "physical":
        return m.storage_value_bytes(_value(case["value"]), profile=case.get("profile", m.EVENT_VALUE)).hex()
    if op == "decode":
        return Returned("accepted", m.decode_storage_value(bytes.fromhex(case["hex"]),
                                                           profile=case.get("profile", m.EVENT_VALUE)))
    if op == "history":
        return _retained(m, case, corpus)
    if op == "recipe_constructor":
        values = ["fixture"] * 13 + ["a" * 64]
        values[case.get("field_index", 13)] = case["value"]
        return Returned("accepted", m.RecipeTuple(*values))
    if op == "payload":
        import blake3
        raw = (case.get("raw", "x") * case["length"]).encode()
        original = (case.get("original_raw", case.get("raw", "x")) * case["length"]).encode()
        descriptor = {"byte_size": len(original), "id": blake3.blake3(original).hexdigest(),
                      "media_type": "application/json"}
        descriptor.update(case.get("descriptor", {}))
        inline = _value(case["inline"]) if "inline" in case else case.get("route", "inline") == "inline"
        return Returned("accepted", m.verify_payload_bytes(
            raw.decode() if case.get("raw_as_text") else raw, byte_size=descriptor["byte_size"],
            payload_id=descriptor["id"], media_type=descriptor["media_type"],
            expected_media_type="application/json", inline=inline))
    raise AssertionError("Unknown corpus operation: " + op)


def evaluate(m, case, corpus):
    """Exactly three admission outcomes. Unexpected exceptions never pass."""
    try:
        result = execute(m, case, corpus)
    except m.Refusal as error:
        return {"outcome": "refusal", "error": error.reason}, None
    except Exception as error:
        return {"outcome": "exception", "exception": type(error).__name__, "message": str(error)}, None
    output = ("original-returned-with-zero-effects" if isinstance(result, RetainedObservation) else
              result.output if isinstance(result, Returned) else result)
    if not _json_native(output):
        output = typed(output)  # A wrong output type never equals a JSON expectation.
    return {"outcome": "acceptance", "output": output}, result


def _attempt(m, fn):
    """("acceptance", value), ("refusal", reason) or ("exception", name): never raises."""
    try:
        return ("acceptance", fn())
    except m.Refusal as error:
        return ("refusal", error.reason)
    except Exception as error:
        return ("exception", type(error).__name__)


def number_integration_checks(m, root):
    """Real unchanged owner vectors, not self-generated expected bytes. No date-time code.

    Each check compares an attempted call, so a helper that raises fails its
    check instead of aborting the run.
    """
    wire = json.loads((root / "Plans/seglog_frame_v2_wire_fixtures.json").read_text())
    frame = bytes.fromhex(wire["base_frame_hex"])
    header_length = int.from_bytes(frame[9:11], "little")
    original_payload = frame[48 + header_length:]
    accepted = lambda fn: _attempt(m, fn)
    checks = {
        "frozen_complete_event_bytes": accepted(lambda: m.storage_value_bytes(wire["base_event"])) == (
            "acceptance", original_payload),
        "frozen_complete_event_decode": accepted(lambda: m.decode_storage_value(original_payload)) == (
            "acceptance", wire["base_event"]),
    }
    # These full-route endpoints exercise more than one required exactness
    # predicate. They are controls, not purported single-predicate negatives.
    for value, reason in (((1 << 53) + 1, "jcs_binary64"), ((1 << 64) - 1, "jcs_binary64")):
        checks["full_jcs_endpoint_refusal_" + str(value)] = accepted(lambda: m.qualified_jcs(value)) == (
            "refusal", reason)
    full = json.loads((root / "Plans/event_append_receipt_full_value_fixtures.json").read_text())
    checks["frozen_full_value_commitment"] = accepted(lambda: m.full_value_commitment(full["base_original_event"])) == (
        "acceptance", full["commitment_sha256"])
    event = wire["base_event"]
    producer = accepted(lambda: m.producer_semantic_digest(event))
    full_value = accepted(lambda: m.full_value_commitment(event))
    for field, val in (("sequence_id", (1 << 64) - 1), ("observed_at_utc", "2099-01-01T00:00:00Z"),
                       ("persisted_at_utc", "2099-01-01T00:00:00Z")):
        changed = dict(event, **{field: val})
        checks["producer_excludes_" + field] = producer[0] == "acceptance" and accepted(
            lambda: m.producer_semantic_digest(changed)) == producer
        changed_full = accepted(lambda: m.full_value_commitment(changed))
        checks["full_value_includes_" + field] = (full_value[0] == changed_full[0] == "acceptance"
                                                  and changed_full != full_value)
    for field in m.PRODUCER_FIELDS:
        changed = dict(event, **{field: "changed-caller-value"})
        changed_producer = accepted(lambda: m.producer_semantic_digest(changed))
        checks["producer_includes_" + field] = (producer[0] == changed_producer[0] == "acceptance"
                                                and changed_producer != producer)
        omitted = {k: v for k, v in event.items() if k != field}
        checks["producer_requires_present_" + field] = accepted(lambda: m.producer_semantic_digest(omitted)) == (
            "refusal", "producer_projection")
    from pm_projects_refresh_contracts import semantic_hash
    for left, right in ((1, 1.0), (0.0, -0.0), (True, 1)):
        checks["app_typed_" + repr(left) + "_vs_" + repr(right)] = semantic_hash("accepted_source", left) != semantic_hash("accepted_source", right)
    checks["app_arbitrary_integer"] = semantic_hash("accepted_source", 1 << 100) != semantic_hash("accepted_source", (1 << 100) + 1)
    import blake3
    for n in (16384, 16385):
        raw = b"x" * n
        checks["payload_exact_size_" + str(n)] = len(raw) == n and blake3.blake3(raw).digest() != blake3.blake3(raw + b"\n").digest()
    return checks


def datetime_integration_checks(m, root, inventory_check):
    """The date-time suite. Only scope="all" calls this."""
    wire = json.loads((root / "Plans/seglog_frame_v2_wire_fixtures.json").read_text())
    checks = {"datetime_inventory_complete_and_classified": inventory_check["status"] == "pass"}
    from pm_event_datetime_admission_checks import regression_checks
    checks.update(regression_checks(root))
    # Reviews C6-B1 and C7-B1/B2: schema fences inside any Markdown container,
    # and fences after misleading boundaries, are discovered (CommonMark is
    # authoritative; the over-inclusive supplementary scan only adds spans).
    from pm_event_datetime_inventory import _markdown_fences
    fence_schema = {"type": "object", "properties": {"observed_at_utc": {"type": "string", "format": "date-time"}}}
    fence_json = json.dumps(fence_schema)
    escaped_json = fence_json.replace('"properties"', '"\\u0070roperties"').replace(
        '"observed_at_utc"', '"\\u006fbserved_at_utc"')
    fence_forms = {
        "top_level": "```json\n" + fence_json + "\n```\n",
        "blockquote": "> ```json\n> " + fence_json + "\n> ```\n",
        "nested_blockquote": "> > ```json\n> > " + fence_json + "\n> > ```\n",
        "nested_list_indented": "- item\n  - sub\n\n        ```json\n        " + fence_json + "\n        ```\n",
        "list_marker_on_fence_line": "1. ```json\n   " + fence_json + "\n   ```\n",
        "blockquote_list": "> - ```json\n>   " + fence_json + "\n>   ```\n",
        "tilde_blockquote": "> ~~~json\n> " + fence_json + "\n> ~~~\n",
        "list_then_blockquote": "- > ```json\n  > " + fence_json + "\n  > ```\n",
        "blockquote_list_blockquote": "> - > ```json\n>   > " + fence_json + "\n>   > ```\n",
        "html_details": "<details>\n\n```json\n" + fence_json + "\n```\n\n</details>\n",
    }
    for keys, body in (("literal", fence_json), ("escaped", escaped_json)):
        fence_forms["after_indented_literal_close_" + keys] = (
            "```rust\n        ```\n```\n\n```json\n" + body + "\n```\n")
        fence_forms["after_unclosed_blockquote_fence_" + keys] = (
            "> ```text\n> quoted\n\n```json\n" + body + "\n```\n")
    fence_ok = True
    fence_failures = []
    for form, text in fence_forms.items():
        bodies = []
        for _, body in _markdown_fences(text):
            try:
                bodies.append(json.loads(body))
            except ValueError:
                pass
        if fence_schema not in bodies:
            fence_ok = False
            fence_failures.append(form)
    fence_ok = fence_ok and list(_markdown_fences("Prose naming observed_at_utc, no fence.\n")) == []
    checks["datetime_inventory_fence_containers"] = fence_ok
    from pm_event_datetime import datetime_validator
    schema = json.loads((root / "Plans/event_record.schema.json").read_text())
    envelope_validator = datetime_validator(schema)
    checks["eventrecord_datetime_valid"] = envelope_validator.is_valid(wire["base_event"])
    for field in ("occurred_at_utc", "observed_at_utc", "persisted_at_utc"):
        for index, invalid in enumerate(("2026-01-01T00:00:00", "2026-02-30T00:00:00Z",
                                          "2026-01-01T00:00:00Z\n")):
            checks["eventrecord_format_enforced_" + field + "_" + str(index)] = not envelope_validator.is_valid(
                dict(wire["base_event"], **{field: invalid}))
    return checks


def run_corpus(path, *, scope="all"):
    if scope not in SCOPES:
        raise ValueError("unknown self-test scope: " + repr(scope))
    import pm_event_numbers as m
    modules_before = set(sys.modules)
    corpus = json.loads(Path(path).read_text(), object_pairs_hook=m._unique_object)
    root = Path(__file__).resolve().parents[1]
    cases = corpus["cases"] if scope == "all" else [c for c in corpus["cases"] if number_case(c)]
    inventory_check = None
    if scope == "all":
        from pm_event_datetime_inventory import check_inventory
        inventory_check = check_inventory(root)
        if inventory_check["status"] != "pass":
            # Admission is a prerequisite. Do not repeatedly attempt to install
            # invalid selections while reporting thousands of derivative failures.
            return {"status": "fail", "corpus_cases": len(cases),
                    "case_passes": 0, "case_execution": "NOT_RUN_ADMISSION_REFUSED",
                    "positives": sum("output" in c for c in cases),
                    "negatives": sum("error" in c for c in cases),
                    "outcomes": {}, "datetime_inventory": inventory_check,
                    "owner_integration_checks": {"datetime_inventory_complete_and_classified": False},
                    "failures": [{"integration_check": "datetime_inventory_complete_and_classified"}],
                    "native_authority": "NOT_RUN", "self_test_scope": scope}
    failures, outcomes = [], {}
    for c in cases:
        actual, result = evaluate(m, c, corpus)
        expected = ({"outcome": "refusal", "error": c["error"]} if "error" in c
                    else {"outcome": "acceptance", "output": c["output"]})
        outcomes[c["id"]] = actual
        if actual != expected:
            failures.append({"id": c["id"], "expected": expected, "actual": actual})
        elif "output" in c:
            for error in success_errors(result, c):
                failures.append({"id": c["id"], "postcondition": error})
        if not c.get("target_predicate"):
            failures.append({"id": c["id"], "missing_target_predicate": True})
    checks = number_integration_checks(m, root)
    if scope == "all":
        checks.update(datetime_integration_checks(m, root, inventory_check))
    else:
        checks["number_scope_imported_no_datetime_code"] = not any(
            name.startswith("pm_event_datetime") for name in set(sys.modules) - modules_before)
    for name, ok in checks.items():
        if not ok:
            failures.append({"integration_check": name})
    return {"status": "fail" if failures else "pass", "corpus_cases": len(cases),
            "case_passes": len(cases) - len({f["id"] for f in failures if "id" in f}),
            "positives": sum("output" in c for c in cases),
            "negatives": sum("error" in c for c in cases),
            "labelled_cases": sum(bool(c.get("target_predicate")) for c in cases),
            "labelled_negatives": sum("error" in c and bool(c.get("target_predicate")) for c in cases),
            "outcomes": outcomes,
            "guard_isolation": {"status": "SWEEP_PENDING", "tool": "scripts/pm_guard_isolation.py",
                                "items": corpus["guard_isolation_sweep"]},
            "owner_integration_checks": checks,
            "datetime_inventory": (inventory_check if scope == "all" else
                                   {"status": "NOT_RUN_SEPARATE_SUITE",
                                    "command": "python3 scripts/pm_event_numbers.py --self-test --scope all",
                                    "excluded_cases": len(corpus["cases"]) - len(cases)}),
            "conflicts_covered": sorted({x for c in cases for x in c["conflicts"]}),
            "failures": failures, "native_authority": "NOT_RUN", "self_test_scope": scope,
            "scope": ("Shared adapter/corpus only; no complete lane checker or family admission." if scope == "all" else
                      "Number recipes only; CV-1101 date-time stays a separately required gate. "
                      "No complete lane checker or family admission.")}


# The committed mutation set. Each entry is one exact source edit to a number
# helper, applied in memory to a fresh module; files are never written. The
# number corpus must fail under every mutation, except declared survivors,
# whose reasons a reviewer checks.

def _load_module(name, source, file):
    module = types.ModuleType(name)
    module.__file__ = file
    sys.modules[name] = module  # dataclasses resolve their module through sys.modules
    exec(compile(source, file, "exec"), module.__dict__)
    return module


@contextmanager
def _installed(mutation, sources):
    """Swap the mutant in for pm_event_numbers for one corpus run, then restore."""
    names = ("pm_event_numbers", "pm_event_index_binding")
    saved = {name: sys.modules.get(name) for name in names}
    try:
        target = mutation["module"]
        text, file = sources[target]
        mutated = text.replace(mutation["find"], mutation["replace"])
        if target == "pm_event_index_binding":
            _load_module(target, mutated, file)
            numbers_text, numbers_file = sources["pm_event_numbers"]
            yield _load_module("pm_event_numbers", numbers_text, numbers_file)
        else:
            yield _load_module(target, mutated, file)
    finally:
        for name, module in saved.items():
            if module is None:
                sys.modules.pop(name, None)
            else:
                sys.modules[name] = module


@contextmanager
def _time_limit(seconds):
    """Bound a mutant that loops. Uses SIGALRM where the platform has it."""
    import signal

    def expire(signum, frame):
        raise TimeoutError("mutation run exceeded %d s" % seconds)
    try:
        previous = signal.signal(signal.SIGALRM, expire)
    except (AttributeError, ValueError):
        yield
        return
    signal.alarm(seconds)
    try:
        yield
    finally:
        signal.alarm(0)
        signal.signal(signal.SIGALRM, previous)


def run_mutations(corpus_path, mutation_path, *, time_limit=120):
    """Replay the committed mutation set against the number scope.

    Pass means: the intact corpus passes; every (API, class) cell has a mutation
    or a reasoned not-applicable entry; every mutation applies exactly once and
    fails the number corpus; and every declared survivor really survives.
    """
    import pm_event_numbers as intact
    import pm_event_index_binding as binding
    spec = json.loads(Path(mutation_path).read_text(), object_pairs_hook=intact._unique_object)
    sources = {name: (Path(module.__file__).read_text(), module.__file__)
               for name, module in (("pm_event_numbers", intact), ("pm_event_index_binding", binding))}
    problems = []
    baseline = run_corpus(corpus_path, scope="numbers")
    if baseline["status"] != "pass":
        problems.append("intact number corpus does not pass")
    classes = MUTATION_CLASSES + tuple(spec.get("extra_classes", ()))
    ids = [mutation["id"] for mutation in spec["mutations"]]
    if len(ids) != len(set(ids)):
        problems.append("duplicate mutation ids")
    matrix = {}
    for api, entry in spec["apis"].items():
        if not hasattr(intact, api):
            problems.append("API not exported by pm_event_numbers: " + api)
        cells = {}
        for cls in MUTATION_CLASSES:
            hits = [m["id"] for m in spec["mutations"] if m["api"] == api and m["class"] == cls]
            reason = entry.get("not_applicable", {}).get(cls)
            if hits and reason:
                problems.append("%s/%s has both mutations and a not-applicable reason" % (api, cls))
            if not hits and not reason:
                problems.append("%s/%s has no mutation and no not-applicable reason" % (api, cls))
            cells[cls] = hits if hits else ("N/A: " + reason if reason else "MISSING")
        for cls in classes[len(MUTATION_CLASSES):]:
            hits = [m["id"] for m in spec["mutations"] if m["api"] == api and m["class"] == cls]
            if hits:
                cells[cls] = hits
        matrix[api] = cells
    results = []
    for mutation in spec["mutations"]:
        row = {key: mutation[key] for key in ("id", "api", "class", "module")}
        if mutation.get("source"):
            row["source"] = mutation["source"]
        if mutation["api"] not in spec["apis"] or mutation["class"] not in classes:
            problems.append(mutation["id"] + ": unknown API or class")
        count = sources[mutation["module"]][0].count(mutation["find"]) if mutation["module"] in sources else 0
        if count != 1 or mutation["find"] == mutation["replace"]:
            row.update(result="not_applied", find_occurrences=count)
            problems.append(mutation["id"] + ": find text must occur exactly once and differ from replace")
            results.append(row)
            continue
        try:
            with _time_limit(time_limit), _installed(mutation, sources):
                outcome = run_corpus(corpus_path, scope="numbers")
            failed = sorted({f["id"] for f in outcome["failures"] if "id" in f})
            checks = [f["integration_check"] for f in outcome["failures"] if "integration_check" in f]
            row.update(caught=outcome["status"] == "fail", failed_cases=len(failed),
                       failed_case_ids=failed[:12], failed_checks=checks[:12])
        except Exception as error:  # The CLI would also fail; recorded distinctly.
            row.update(caught=True, runner_exception=type(error).__name__ + ": " + str(error)[:200])
        survives = mutation.get("survives")
        if survives:
            row["declared_survivor"] = survives
            if row["caught"]:
                problems.append(mutation["id"] + ": declared survivor is now caught; update the set")
        elif not row["caught"]:
            problems.append(mutation["id"] + ": mutation survived the number corpus")
        row["result"] = "caught" if row["caught"] else "survives"
        results.append(row)
    review = [r for r in results if r.get("source") == "review"]
    totals = {
        "apis": len(spec["apis"]),
        "mutations": len(results),
        "caught": sum(r.get("result") == "caught" for r in results),
        "survivors": sum(r.get("result") == "survives" for r in results),
        "declared_survivors": sum("declared_survivor" in r for r in results),
        "not_applied": sum(r.get("result") == "not_applied" for r in results),
        "runner_exceptions": sum("runner_exception" in r for r in results),
        "not_applicable_cells": sum(type(v) is str and v.startswith("N/A: ") for cells in matrix.values()
                                    for v in cells.values()),
        "review_mutations": len(review),
        "review_mutations_caught": sum(r.get("result") == "caught" for r in review),
    }
    return {"status": "fail" if problems else "pass", "mutation_set": spec["schema_id"],
            "intact": {key: baseline[key] for key in ("status", "corpus_cases", "case_passes",
                                                       "positives", "negatives")} |
                      {"owner_integration_checks": len(baseline["owner_integration_checks"])},
            "totals": totals, "problems": problems, "matrix": matrix, "mutations": results,
            "self_test_scope": "numbers", "native_authority": "NOT_RUN"}
