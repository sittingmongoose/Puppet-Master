"""Shared finite NUMRULE oracle runner; imported by pm_event_numbers --self-test.

This models trusted custody with a separate sealed fixture lookup. It does not
authenticate a native store, register a family, or run the other drafting lanes.

scope="numbers" selects the number cases and number owner checks and imports no
date-time module. Date-time code here stays lazy, on date-time routes only.

Every positive of an API that returns a value carries "returns": the exact
type-aware value, transcribed independently of the helper and compared through
typed() below. run_mutations() replays a committed mutation set against the
number scope; each mutation must make it fail. Besides the hand-written
mutations, it enumerates mutation points from the helper's AST (every refusal
site, every weakening of a refusal guard's predicates, every relational
boundary, every delegated refusal call, every container branch, every field of
a field loop) and generates one mutant per point. Its rules table is derived
from the owner text (owner_statements below): every statement of CV-1100,
SP-1100, SP-1101 and the guide's number sections needs a current row. The
owner check cli_failing_corpus_exits_1 runs the helper's own CLI path.
"""
from __future__ import annotations

import ast
from contextlib import contextmanager
from dataclasses import asdict, astuple, dataclass, fields as dataclass_fields, is_dataclass, replace
from decimal import Decimal
from functools import lru_cache
import hashlib
import json
from pathlib import Path
import re
import sys
import types

# Corpus operations that execute no date-time code. A history case selects a
# date-time profile only through date_time_profile, so number_case excludes it.
NUMBER_OPS = frozenset(("token", "slot", "integer", "boolean", "parse_token", "parse", "current_json",
                        "current_json_slot", "jcs", "jcs_value", "jcs_kind_declaration", "physical",
                        "uint64", "decode", "append_policy", "history", "payload", "recipe_constructor",
                        "binding_constructor", "json_number", "producer", "full_value_commitment",
                        "parsed_decimal"))
# Operations whose API returns a value beyond the output string. Each of their
# positives must carry an independent "returns" oracle.
RETURNING_OPS = frozenset(("token", "slot", "integer", "uint64", "boolean", "parse", "parse_token",
                           "current_json", "current_json_slot", "decode", "payload",
                           "recipe_constructor", "binding_constructor", "json_number", "parsed_decimal"))
SCOPES = ("all", "numbers")
MUTATION_CLASSES = ("value_rounding", "type_coercion", "dropped_qualification", "substituted_serializer",
                    "wrong_hash", "removed_refusal", "off_by_one_boundary")


def number_case(case):
    return case["op"] in NUMBER_OPS and not case.get("date_time_profile")


def _unique_pairs(pairs):
    """Duplicate-key refusal for the runner's own inputs, independent of the helper."""
    result = {}
    for key, value in pairs:
        if key in result:
            raise ValueError("duplicate key in runner input: " + repr(key))
        result[key] = value
    return result


def _int_from_digits(text):
    """Exact int from decimal digits, independent of the helper and of str() limits."""
    negative = text.startswith("-")
    digits = text[1:] if negative else text
    if not digits or not digits.isascii() or not digits.isdigit():
        raise ValueError("not a decimal integer: " + repr(text))
    value = 0
    for start in range(0, len(digits), 1000):
        chunk = digits[start:start + 1000]
        value = value * 10 ** len(chunk) + int(chunk)
    return -value if negative else value


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


# The verifier calls of the latest history case, kept when the dispatcher refuses too, for cases that name the
# calls they allow ("verifier_calls").
_RETAINED_CALLS = {"calls": None}


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
    """Corpus input encoding to Python values. Never calls the helper.

    @map builds a map whose keys need not be strings; @code_points builds a
    string from code points (for lone surrogates, which corpus JSON text written
    as UTF-8 cannot hold); @repeat repeats a string, binary or array value.
    """
    if type(value) is dict:
        if set(value) == {"@int"}:
            return _int_from_digits(value["@int"])
        if set(value) == {"@map"}:
            return {_value(k): _value(v) for k, v in value["@map"]}
        if set(value) == {"@code_points"}:
            return "".join(chr(c) for c in value["@code_points"])
        if set(value) == {"@repeat"}:
            item, count = value["@repeat"]
            return _value(item) * count
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
    elif scenario == "falsy_override":
        # A falsy caller override (empty list, False, ""): still a caller
        # override, which refuses whatever its truth value.
        override = _value(case["override"])
    elif scenario == "downgrade":
        sealed = replace(original, recipe=current_recipe)
        observed = original  # Supported old recipe, wrong original selection.
    elif scenario == "unknown_recipe":
        # Authentic original, genuinely unsupported catalog entry. No stale seal.
        sealed = observed = replace(original, recipe=replace(base_recipe, identity_recipe="unregistered"))
    elif scenario == "unknown_field":
        # Tool batch 2 (T33, review-fix4 B07): an authentic original whose tuple equals an installed one in every
        # field but this one. No verifier may be tried for it, however close it is to an installed tuple.
        sealed = observed = replace(original, recipe=replace(base_recipe, **{case["field"]: case["value"]}))
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
    elif scenario in ("string_result_bytes", "string_receipt_bytes"):
        # Same isolation for the result and receipt carriers: the sealed fixture
        # holds the same text, so only the exact bytes type gate can refuse.
        name = scenario.removeprefix("string_")
        sealed = observed = replace(original, **{name: getattr(original, name).decode()})
    elif scenario == "untyped_recipe":
        # Authentic original whose recipe carrier is a plain tuple of the same
        # values: only the exact RecipeTuple type gate distinguishes it.
        sealed = observed = replace(original, recipe=astuple(base_recipe))
    elif scenario == "self_equal_binding":
        # A caller-shaped binding object that claims equality with anything and
        # carries the original commitment. Only the exact type gate refuses it.
        class SelfEqual:
            source_commitment = binding.source_commitment

            def __eq__(self, other):
                return True

            def __ne__(self, other):
                return False

            __hash__ = object.__hash__
        sealed = observed = replace(original, binding=SelfEqual())
    elif scenario in ("denied", "deleted", "withdrawn", "hold_denied"):
        allow = False
    elif scenario == "truthy_disclosure":
        allow = "true"
    # Query shape (one defect each): the owner never sees these queries intact.
    ref = {"empty_ref": "", "nonstring_ref": b"sealed-ref"}.get(scenario, "sealed-ref")
    if scenario == "dict_expected":
        expected = asdict(binding)

    calls = _RETAINED_CALLS["calls"] = []

    class FixtureOwner:
        def authenticated_original(self, ref):
            if ref != "sealed-ref":
                raise m.Refusal("original_authority")
            return observed

    def frozen(own):
        # Each installed fixture verifier checks that it was selected for its own tuple (T33): a dispatch that
        # probes an original through another tuple's verifier is refused there even without a per-field case.
        return lambda record: verify(record, own)

    def verify(record, own):
        calls.append(record.recipe)
        if type(record.recipe) is m.RecipeTuple and record.recipe != own:
            return False
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
        base_recipe: m.FrozenRecipe(frozen(base_recipe)), current_recipe: m.FrozenRecipe(frozen(current_recipe)),
        replaced_resources: m.FrozenRecipe(frozen(replaced_resources)),
    })
    out = dispatcher.resolve(ref, expected, disclose=lambda b: allow,
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


def _str_subclass(value):
    """A Python caller's str subclass instance (an enum member) equal to value.

    JSON request data cannot carry one; the exact-type gates still refuse it.
    """
    import enum
    return enum.StrEnum("Member", {"MEMBER": value}).MEMBER


@contextmanager
def _reported_length(m, target, length):
    """Fault-injection fixture boundary for widths no test can allocate.

    For one call, the helper module's global len() reports `length` for the
    exact input object and the true length for everything else. A 1-byte binary
    then reaches the 2^32 bin32 limit without allocating 4 GiB. Only the length
    predicate is exercised; the real-length cases cover the emitted bytes.

    Dependence, documented: the fixture works only while storage_value_bytes
    reads the binary length through the module-global name len. A
    behaviour-preserving refactor (v.__len__(), memoryview(v).nbytes) makes
    both reported-length cases fail: a false alarm in the safe direction,
    never a mask. Such a refactor must move this fixture with it.
    """
    if length is None:
        yield
        return
    import builtins
    sentinel = object()
    previous = m.__dict__.get("len", sentinel)
    m.len = lambda x: length if x is target else builtins.len(x)
    try:
        yield
    finally:
        if previous is sentinel:
            del m.len
        else:
            m.len = previous


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
        value = _str_subclass(case["value"]) if case.get("value_class") == "str_subclass" else case["value"]
        return m.current_append_policy(value)
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
    if op == "parsed_decimal":
        # The public carrier itself, with its default kind unless "kind" is given.
        kind = {"numeric_kind": case["kind"]} if "kind" in case else {}
        return Returned("accepted", m.ParsedDecimal(case["token"], **kind))
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
        if case.get("event_class") == "mapping_proxy":
            event = types.MappingProxyType(event)  # Complete mapping, but not an exact dict.
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
        value = _value(case["value"])
        # "default_profile": call with no profile argument, exercising the
        # helper's own default; otherwise the profile is always passed.
        profile = {} if case.get("default_profile") else {"profile": case.get("profile", m.EVENT_VALUE)}
        with _reported_length(m, value, case.get("reported_length")):
            out = m.storage_value_bytes(value, **profile)
        if case.get("output_form") == "head":
            # Long outputs: the header bytes and the exact total length.
            return {"head": out[:case.get("head_bytes", 8)].hex(), "length": len(out)}
        return out.hex()
    if op == "decode":
        raw = case["hex"] if case.get("hex_as_text") else bytes.fromhex(case["hex"])
        profile = {} if case.get("default_profile") else {"profile": case.get("profile", m.EVENT_VALUE)}
        return Returned("accepted", m.decode_storage_value(raw, **profile))
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
        for field in case.get("str_subclass_fields", ()):
            descriptor[field] = _str_subclass(descriptor[field])
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
    if not _CLI_STATE["nested"]:
        checks["cli_failing_corpus_exits_1"] = _cli_exit_status(m) == (1, "fail")
    return checks


# The CLI check runs the helper's own __main__ path; under --mutations the
# mutant's code object is registered here, so a mutant of the entry point or of
# main()'s exit mapping is judged like any other.
_CLI_STATE = {"nested": False, "code": {}}
CLI_FAILING_CORPUS = {
    "cases": [{"id": "cli-wrong-expected", "op": "token", "raw": "1", "conflicts": [], "output": "accepted",
               "returns": {"@int": "2"}, "target_predicate": "cli.exit_status"}],
    "guard_isolation_sweep": [], "historical_originals": {}}


def _cli_exit_status(m):
    """(exit status, printed status) of the helper's CLI on a one-case failing corpus.

    The helper's module code is executed as __main__, in process, with the
    argument vector `--self-test --scope numbers --corpus <failing corpus>`.
    The argument parser, main()'s exit mapping and `raise SystemExit(main())`
    all run; the one case has a wrong expected value, so the CLI must raise
    SystemExit(1) and print status fail. The nested run skips this check.
    """
    import io
    import tempfile
    from contextlib import redirect_stdout
    code = _CLI_STATE["code"].get(m.__name__)
    if code is None:
        code = compile(Path(m.__file__).read_text(encoding="utf-8"), m.__file__, "exec")
    main_module = types.ModuleType("__main__")
    main_module.__file__ = m.__file__
    saved_main, saved_argv = sys.modules.get("__main__"), sys.argv
    out, status = io.StringIO(), None
    with tempfile.TemporaryDirectory() as tmp:
        corpus = Path(tmp) / "cli-failing-corpus.json"
        corpus.write_text(json.dumps(CLI_FAILING_CORPUS))
        _CLI_STATE["nested"] = True
        sys.modules["__main__"] = main_module
        sys.argv = [m.__file__, "--self-test", "--scope", "numbers", "--corpus", str(corpus)]
        try:
            with redirect_stdout(out):
                exec(code, main_module.__dict__)
        except SystemExit as error:
            status = error.code
        except Exception as error:
            status = "exception: " + type(error).__name__
        finally:
            _CLI_STATE["nested"] = False
            sys.argv = saved_argv
            if saved_main is None:
                sys.modules.pop("__main__", None)
            else:
                sys.modules["__main__"] = saved_main
    try:
        printed = json.loads(out.getvalue()).get("status")
    except (ValueError, AttributeError):
        printed = None
    return status, printed


def cli_subprocess_status(helper_file):
    """The same failing corpus through a real `python3 pm_event_numbers.py` process.

    Run once per --mutations run, on the helper file on disk, from an
    unrelated working directory: (process exit code, printed status).
    """
    import subprocess
    import tempfile
    with tempfile.TemporaryDirectory() as tmp:
        corpus = Path(tmp) / "cli-failing-corpus.json"
        corpus.write_text(json.dumps(CLI_FAILING_CORPUS))
        process = subprocess.run([sys.executable, "-B", str(helper_file), "--self-test", "--scope", "numbers",
                                  "--corpus", str(corpus)], capture_output=True, text=True, cwd=tmp, timeout=600)
    try:
        printed = json.loads(process.stdout).get("status")
    except (ValueError, AttributeError):
        printed = None
    return process.returncode, printed


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
    corpus = json.loads(Path(path).read_text(), object_pairs_hook=_unique_pairs)
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
        _RETAINED_CALLS["calls"] = None
        actual, result = evaluate(m, c, corpus)
        expected = ({"outcome": "refusal", "error": c["error"]} if "error" in c
                    else {"outcome": "acceptance", "output": c["output"]})
        outcomes[c["id"]] = actual
        if actual != expected:
            failures.append({"id": c["id"], "expected": expected, "actual": actual})
        elif "output" in c:
            for error in success_errors(result, c):
                failures.append({"id": c["id"], "postcondition": error})
        if "verifier_calls" in c and (_RETAINED_CALLS["calls"] is None or len(_RETAINED_CALLS["calls"]) != c["verifier_calls"]):
            failures.append({"id": c["id"], "postcondition": "verifier calls %s, expected %d" % (
                None if _RETAINED_CALLS["calls"] is None else len(_RETAINED_CALLS["calls"]), c["verifier_calls"])})
        if not c.get("target_predicate"):
            failures.append({"id": c["id"], "missing_target_predicate": True})
    # The CLI check's own nested run needs only its failing case; it skips the
    # owner checks, which the outer run performs.
    checks = number_integration_checks(m, root) if not _CLI_STATE["nested"] else {}
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



# The committed mutation set. Hand-written entries are one exact source edit to
# a number helper; generated entries come from the helper's AST. Every mutant
# is built in memory as a fresh module; files are never written. The number
# corpus must fail under every mutant, except declared survivors, whose
# reasons a reviewer checks.

_FLIPPED = {ast.Lt: ast.LtE, ast.LtE: ast.Lt, ast.Gt: ast.GtE, ast.GtE: ast.Gt}
GENERATED_FAMILIES = {
    "refusal_site": "Every raise statement and every _refuse(...) call, the only ways the helper emits an "
                    "error code (returns, lambdas and except handlers included). The mutant disables that one "
                    "site: a call becomes None, a raise becomes pass.",
    "refusal_predicate": "Every predicate of the if-guards of a _refuse site (each enclosing if whose body holds "
                         "it) where dropping that predicate alone weakens the guard: an or-operand at positive "
                         "polarity becomes False, an and-operand under not becomes True, and an element of a "
                         "literal tuple scanned by any() is dropped.",
    "comparison_boundary": "Every <, <=, > and >= in the helper. The mutant flips strictness (< and <=, > "
                           "and >=), the off-by-one at that width, range or limit boundary.",
    "delegated_refusal": "Every call, inside the helper, to a module-level function or class of the helper that "
                         "holds a refusal site directly or through another such call. The mutant replaces the "
                         "call with its first positional argument (the unchecked input), or None without one.",
    "container_branch": "Every if or elif branch whose test is type(x) is list or type(x) is dict: one per "
                        "container kind of each recursive walk or type dispatch. The mutant deletes that branch, "
                        "so the container falls through to the following branches.",
    "field_iteration": "Every fields(self) iteration inside a dataclass method, once per field of that class. "
                       "The mutant iterates every field except that one.",
}
# Names through which the helper emits an error code. mutation_points refuses
# any other use of them (an alias such as _deny = _refuse, a getattr string, a
# Refusal built outside a raise or _refuse), so every refusal stays a direct,
# enumerable call or raise.
REFUSAL_NAMES = ("_refuse", "Refusal")


def _ordered(nodes):
    return sorted(nodes, key=lambda n: (n.lineno, n.col_offset, n.end_lineno, n.end_col_offset))


def _parent_map(tree):
    parents = {}
    for node in ast.walk(tree):
        for child in ast.iter_child_nodes(node):
            parents[child] = node
    return parents


def _qualname(node, parents):
    names = []
    while node in parents:
        node = parents[node]
        if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef, ast.ClassDef)):
            names.append(node.name)
    return ".".join(reversed(names)) or "<module>"


def _guards(call, parents):
    """Every if-statement whose body holds this site, innermost first.

    The walk stops at the enclosing function or lambda, and at an if whose else
    branch holds the site: such a test is type dispatch, not this site's guard.
    """
    guards, node = [], call
    while node in parents:
        parent = parents[node]
        if isinstance(parent, (ast.FunctionDef, ast.AsyncFunctionDef, ast.Lambda, ast.ClassDef)):
            break
        if isinstance(parent, ast.If):
            if not any(node is stmt for stmt in parent.body):
                break
            guards.append(parent)
        node = parent
    return guards


def _weakenings(expr, positive):
    """(action, node, detail) for each single-predicate weakening of a refusal guard."""
    if isinstance(expr, ast.UnaryOp) and isinstance(expr.op, ast.Not):
        yield from _weakenings(expr.operand, not positive)
    elif isinstance(expr, ast.BoolOp):
        weak = (False if positive else None) if isinstance(expr.op, ast.Or) else (None if positive else True)
        for operand in expr.values:
            if weak is not None:
                yield ("false" if weak is False else "true"), operand, weak
            yield from _weakenings(operand, positive)
    elif (isinstance(expr, ast.Call) and isinstance(expr.func, ast.Name) and expr.func.id in ("any", "all")
          and len(expr.args) == 1 and isinstance(expr.args[0], ast.GeneratorExp)):
        generator = expr.args[0]
        yield from _weakenings(generator.elt, positive)
        scanned = generator.generators[0].iter
        if isinstance(scanned, ast.Tuple) and len(scanned.elts) > 1 and (expr.func.id == "any") == positive:
            for position in range(len(scanned.elts)):
                yield "drop", scanned, position


def refusal_alias_problems(source):
    """Every use of _refuse or Refusal other than a direct call, raise or handler.

    Allowed: calling _refuse(...); raise Refusal(...) or a call to Refusal inside
    _refuse itself; Refusal as an except-handler type; the two definitions. An
    alias (_deny = _refuse), an attribute or getattr-string access, or any other
    reference would hide a refusal site from the enumeration, so it fails.
    """
    tree = ast.parse(source)
    parents = _parent_map(tree)
    problems = []
    for node in ast.walk(tree):
        if isinstance(node, ast.Name) and node.id in REFUSAL_NAMES and isinstance(node.ctx, ast.Load):
            parent = parents.get(node)
            ok = isinstance(parent, ast.Call) and parent.func is node and (
                node.id == "_refuse" or isinstance(parents.get(parent), ast.Raise)
                or _qualname(parent, parents) == "_refuse")
            handler = parent
            while isinstance(handler, ast.Tuple):
                handler = parents.get(handler)
            ok = ok or (isinstance(handler, ast.ExceptHandler) and handler.type is not None
                        and (handler.type is node or handler.type is parent))
            if not ok:
                problems.append("refusal alias or indirect reference: %s at line %d (%s)"
                                % (node.id, node.lineno, ast.unparse(parent)[:80]))
        elif isinstance(node, ast.Name) and node.id in REFUSAL_NAMES and not isinstance(node.ctx, ast.Load):
            problems.append("refusal name rebound: %s at line %d" % (node.id, node.lineno))
        elif isinstance(node, ast.Attribute) and node.attr in REFUSAL_NAMES:
            problems.append("refusal attribute access: %s at line %d" % (ast.unparse(node), node.lineno))
        elif isinstance(node, ast.Constant) and node.value in REFUSAL_NAMES:
            problems.append("refusal name as a string: %r at line %d" % (node.value, node.lineno))
        elif isinstance(node, ast.alias) and (node.name in REFUSAL_NAMES or node.asname in REFUSAL_NAMES):
            problems.append("refusal name imported: %s" % ast.unparse(node))
        elif isinstance(node, (ast.FunctionDef, ast.ClassDef)) and node.name in REFUSAL_NAMES:
            if parents.get(node) is not tree:
                problems.append("refusal name defined below module level: %s at line %d" % (node.name, node.lineno))
    defined = [n.name for n in tree.body if isinstance(n, (ast.FunctionDef, ast.ClassDef))]
    for name in REFUSAL_NAMES:
        if defined.count(name) != 1:
            problems.append("refusal name %s must be defined exactly once at module level" % name)
    return problems


def _refusing_callables(tree):
    """Module-level functions and classes holding a refusal site, directly or by a call."""
    defs = {n.name: n for n in tree.body if isinstance(n, (ast.FunctionDef, ast.ClassDef))}
    calls = {name: {c.func.id for c in ast.walk(node) if isinstance(c, ast.Call) and isinstance(c.func, ast.Name)}
             for name, node in defs.items()}
    refusing = {name for name, node in defs.items() if name not in REFUSAL_NAMES and (
        "_refuse" in calls[name] or any(isinstance(n, ast.Raise) for n in ast.walk(node)))}
    changed = True
    while changed:
        changed = False
        for name in defs:
            if name not in refusing and name not in REFUSAL_NAMES and calls[name] & refusing:
                refusing.add(name)
                changed = True
    return refusing


def _container_test(test):
    """'list' or 'dict' when the test is exactly type(x) is list / type(x) is dict."""
    if (isinstance(test, ast.Compare) and len(test.ops) == 1 and isinstance(test.ops[0], ast.Is)
            and isinstance(test.left, ast.Call) and isinstance(test.left.func, ast.Name)
            and test.left.func.id == "type" and len(test.left.args) == 1
            and isinstance(test.comparators[0], ast.Name) and test.comparators[0].id in ("list", "dict")):
        return test.comparators[0].id
    return None


def mutation_points(source):
    """Every generated mutation point of the helper source, from its AST.

    Keys name the enclosing function, the error code or predicate text and an
    ordinal, never a line number, so unrelated edits keep them stable.
    """
    tree = ast.parse(source)
    nodes = list(ast.walk(tree))
    index = {id(node): i for i, node in enumerate(nodes)}
    parents = _parent_map(tree)
    points, seen, weakened = [], {}, set()

    def add(family, base, node, **extra):
        seen[base] = seen.get(base, 0) + 1
        point = {"key": "%s#%d" % (base, seen[base]), "family": family, "line": node.lineno,
                 "node": index[id(node)], **extra}
        points.append(point)
        return point["key"]

    sites = [n for n in nodes if isinstance(n, ast.Raise) or (
        isinstance(n, ast.Call) and isinstance(n.func, ast.Name) and n.func.id == "_refuse")]
    for site in _ordered(sites):
        if isinstance(site, ast.Raise):
            reason = "raise"
        else:
            arg = site.args[0] if site.args else None
            reason = arg.value if isinstance(arg, ast.Constant) and type(arg.value) is str else "dynamic"
        name = _qualname(site, parents)
        key = add("refusal_site", "site:%s:%s" % (name, reason), site, function=name, reason=reason,
                  action="disable", text=ast.unparse(site))
        for guard in (_guards(site, parents) if isinstance(site, ast.Call) else ()):
            for action, node, detail in _weakenings(guard.test, True):
                if (id(node), detail) in weakened:
                    continue  # A guard shared by several sites yields each mutant once.
                weakened.add((id(node), detail))
                text = ast.unparse(node.elts[detail]) if action == "drop" else ast.unparse(node)
                add("refusal_predicate", "predicate:%s:%s %s" % (key, action, text), node, function=name,
                    reason=reason, action=action, detail=detail, text=text)
    for compare in _ordered([n for n in nodes if isinstance(n, ast.Compare)]):
        for position, op in enumerate(compare.ops):
            if type(op) in _FLIPPED:
                name = _qualname(compare, parents)
                text = ast.unparse(compare)
                add("comparison_boundary", "boundary:%s:%s:%d" % (name, text, position), compare, function=name,
                    action=type(op).__name__ + "->" + _FLIPPED[type(op)].__name__, detail=position, text=text)
    refusing = _refusing_callables(tree)
    for call in _ordered([n for n in nodes if isinstance(n, ast.Call) and isinstance(n.func, ast.Name)
                          and n.func.id in refusing]):
        name = _qualname(call, parents)
        add("delegated_refusal", "delegated:%s:%s" % (name, call.func.id), call, function=name,
            action="pass_first_argument" if call.args else "none", text=ast.unparse(call))
    for branch in _ordered([n for n in nodes if isinstance(n, ast.If) and _container_test(n.test)]):
        name = _qualname(branch, parents)
        kind = _container_test(branch.test)
        add("container_branch", "container:%s:%s" % (name, ast.unparse(branch.test)), branch, function=name,
            action="delete_branch", detail=kind, text=ast.unparse(branch.test))
    for call in _ordered([n for n in nodes if isinstance(n, ast.Call) and isinstance(n.func, ast.Name)
                          and n.func.id == "fields" and len(n.args) == 1 and isinstance(n.args[0], ast.Name)
                          and n.args[0].id == "self"]):
        owner = call
        while owner in parents and not isinstance(owner, ast.ClassDef):
            owner = parents[owner]
        if not isinstance(owner, ast.ClassDef):
            continue
        name = _qualname(call, parents)
        for stmt in owner.body:
            if isinstance(stmt, ast.AnnAssign) and isinstance(stmt.target, ast.Name):
                add("field_iteration", "field:%s:skip %s" % (name, stmt.target.id), call, function=name,
                    action="skip_field", detail=stmt.target.id, text=ast.unparse(call))
    return points


def _point_code(source, file, point):
    """Compile the helper with exactly one generated mutation point applied."""
    tree = ast.parse(source)
    nodes = list(ast.walk(tree))
    node = nodes[point["node"]]
    if node.lineno != point["line"]:
        raise ValueError("mutation point moved: " + point["key"])
    if point["family"] == "comparison_boundary":
        node.ops[point["detail"]] = _FLIPPED[type(node.ops[point["detail"]])]()
    elif point["action"] == "drop":
        del node.elts[point["detail"]]
    elif point["family"] == "container_branch":
        parent = _parent_map(tree)[node]
        for field, current in ast.iter_fields(parent):
            if type(current) is list and any(item is node for item in current):
                position = next(i for i, item in enumerate(current) if item is node)
                current[position:position + 1] = node.orelse or [ast.copy_location(ast.Pass(), node)]
    elif point["family"] in ("delegated_refusal", "field_iteration"):
        if point["family"] == "delegated_refusal":
            new = node.args[0] if node.args else ast.Constant(None)
        else:
            new = ast.parse("[_f for _f in fields(self) if _f.name != %r]" % point["detail"], mode="eval").body
        parent = _parent_map(tree)[node]
        for field, current in ast.iter_fields(parent):
            if current is node:
                setattr(parent, field, ast.copy_location(new, node))
            elif type(current) is list:
                for position, item in enumerate(current):
                    if item is node:
                        current[position] = ast.copy_location(new, node)
    else:
        new = ast.Pass() if isinstance(node, ast.Raise) else ast.Constant(
            None if point["family"] == "refusal_site" else point["detail"])
        parent = _parent_map(tree)[node]
        for field, current in ast.iter_fields(parent):
            if current is node:
                setattr(parent, field, ast.copy_location(new, node))
            elif type(current) is list:
                for position, item in enumerate(current):
                    if item is node:
                        current[position] = ast.copy_location(new, node)
    ast.fix_missing_locations(tree)
    return compile(tree, file, "exec")


def _load_module(name, code, file):
    module = types.ModuleType(name)
    module.__file__ = file
    sys.modules[name] = module  # dataclasses resolve their module through sys.modules
    exec(code, module.__dict__)
    return module


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


def _run_mutant(target, build, sources, corpus_path, time_limit):
    """Build one mutant, run the number corpus under it, restore the modules.

    A mutant that does not build, or a corpus run that raises, is never a catch:
    it is reported as build_error or runner_exception and fails the self-test.
    """
    names = ("pm_event_numbers", "pm_event_index_binding")
    saved = {name: sys.modules.get(name) for name in names}
    try:
        try:
            code = build()
            text, file = sources[target]
            _load_module(target, code, file)
            _CLI_STATE["code"][target] = code
            if target == "pm_event_index_binding":
                numbers_text, numbers_file = sources["pm_event_numbers"]
                _load_module("pm_event_numbers", compile(numbers_text, numbers_file, "exec"), numbers_file)
        except Exception as error:
            return {"result": "build_error", "error": type(error).__name__ + ": " + str(error)[:200]}
        try:
            with _time_limit(time_limit):
                outcome = run_corpus(corpus_path, scope="numbers")
        except Exception as error:
            return {"result": "runner_exception", "error": type(error).__name__ + ": " + str(error)[:200]}
        failed = sorted({f["id"] for f in outcome["failures"] if "id" in f})
        checks = [f["integration_check"] for f in outcome["failures"] if "integration_check" in f]
        return {"result": "caught" if outcome["status"] == "fail" else "survives", "failed": failed,
                "failed_checks": checks}
    finally:
        _CLI_STATE["code"].clear()
        for name, module in saved.items():
            if module is None:
                sys.modules.pop(name, None)
            else:
                sys.modules[name] = module


# ---- The rules table, derived from the owner text ----
#
# The owner text is split into statements: every sentence of the selected YAML
# fields of CV-1100, SP-1100 and SP-1101, and of the adoption guide's selected
# sections (paragraphs, list items and table rows; code fences are skipped).
# The mutation set holds one row per statement, keyed by source path, line and
# exact text. A statement without a row, or a row whose source line no longer
# holds its text, fails the mutation self-test.

# The brief's normative markers. Every statement needs a row whatever its
# markers; the flag is reported so a reviewer can sort rows by it.
NORMATIVE_MARKERS = re.compile(
    r"\b(?:must|refuses?|refused|refusal|required?|requires|only|exactly|exact|never|no|not|cannot|"
    r"rejects?|disallows?)\b|[0-9]", re.IGNORECASE)
_SENTENCE_END = re.compile(r"[.!?](?:\*\*|[)\"'`\]])*(?=\s+[^a-z\s])")


def _sentences(block):
    """Split one block [(line, text), ...] into [(line, sentence), ...]."""
    text, starts = "", []
    for line, part in block:
        if text:
            text += " "
        starts.append((len(text), line))
        text += part.strip()
    out, begin = [], 0
    for match in list(_SENTENCE_END.finditer(text)) + [None]:
        end = match.end() if match else len(text)
        sentence = text[begin:end].strip()
        if sentence:
            offset = begin + (len(text[begin:end]) - len(text[begin:end].lstrip()))
            out.append((max(line for start, line in starts if start <= offset), sentence))
        begin = end
    return out


def _unit_blocks(lines, unit, fields):
    """(field, block) for each paragraph or list item of one owner unit's YAML.

    A block-scalar line is its own paragraph (each owner paragraph is one
    line); a list item joins its continuation lines.
    """
    headings = [i for i, line in enumerate(lines) if line.startswith("### " + unit + " - ")]
    if len(headings) != 1:
        raise ValueError("owner unit heading not found exactly once: " + unit)
    fence = next(i for i in range(headings[0] + 1, len(lines)) if lines[i].strip() == "```yaml")
    end = next(i for i in range(fence + 1, len(lines)) if lines[i].strip() == "```")
    blocks, field, scalar = [], None, False
    for i in range(fence + 1, end):
        line = lines[i]
        key = re.match(r"([a-z_]+):(.*)$", line)
        if key:
            field = key.group(1) if key.group(1) in fields else None
            rest = key.group(2).strip()
            scalar = rest in ("|-", "|", ">-", ">")
            if field and rest and not scalar:
                blocks.append((field, [(i + 1, rest)]))
            continue
        if field is None or not line.strip():
            continue
        if line.startswith("- "):
            content = line[2:].strip()
            blocks.append((field, [] if content in ("|-", "|") else [(i + 1, content)]))
            scalar = False
        elif scalar:
            blocks.append((field, [(i + 1, line.strip())]))
        elif blocks and blocks[-1][0] == field:
            blocks[-1][1].append((i + 1, line.strip()))
    return blocks


def _unit_unselected_text(lines, unit, fields):
    """The lines of one owner unit's YAML block that belong to no selected field (T33): what the rules table does
    not read, pinned so an edit there cannot pass unseen."""
    headings = [i for i, line in enumerate(lines) if line.startswith("### " + unit + " - ")]
    if len(headings) != 1:
        raise ValueError("owner unit heading not found exactly once: " + unit)
    fence = next(i for i in range(headings[0] + 1, len(lines)) if lines[i].strip() == "```yaml")
    end = next(i for i in range(fence + 1, len(lines)) if lines[i].strip() == "```")
    out, field = [], None
    for i in range(fence + 1, end):
        key = re.match(r"([a-z_]+):(.*)$", lines[i])
        if key:
            field = key.group(1)
        if field not in fields:
            out.append(lines[i])
    return "\n".join(out)


def _unit_section_unselected_text(lines, unit, fields):
    """The whole of one owner unit's section less the selected field text (T50, TOOLBATCH2 pre-check finding 8): from
    the unit's heading line to the line before the next heading of the same or a higher level (outside fences), every
    line but those of the selected YAML fields in the unit's own YAML block. The heading title, the prose and the
    ContractRef: line after the fence, and the unselected fields, are what the rules table does not read; a rule added
    to any of them fails until the pin is reviewed and refreshed."""
    headings = [i for i, line in enumerate(lines) if line.startswith("### " + unit + " - ")]
    if len(headings) != 1:
        raise ValueError("owner unit heading not found exactly once: " + unit)
    start = headings[0]
    end, fence = len(lines), False
    for i in range(start + 1, len(lines)):
        stripped = lines[i].strip()
        if stripped.startswith("```") or stripped.startswith("~~~"):
            fence = not fence
        elif not fence and re.match(r"#{1,3} ", lines[i]):
            end = i
            break
    yaml_open = next(i for i in range(start + 1, end) if lines[i].strip() == "```yaml")
    yaml_close = next(i for i in range(yaml_open + 1, end) if lines[i].strip() == "```")
    out, field = [], None
    for i in range(start, end):
        if yaml_open < i < yaml_close:
            key = re.match(r"([a-z_]+):(.*)$", lines[i])
            if key:
                field = key.group(1)
            if field in fields:
                continue
        out.append(lines[i])
    return "\n".join(out)


def _guide_section_texts(lines):
    """{section: raw text} for every "## " section of the guide, fences respected (T33 pins)."""
    texts, section, fence = {}, "(preamble)", False
    for line in lines:
        stripped = line.strip()
        if stripped.startswith("```") or stripped.startswith("~~~"):
            fence = not fence
        elif not fence and line.startswith("## "):
            section = line[3:].strip()
        texts.setdefault(section, []).append(line)
    return {k: "\n".join(v) for k, v in texts.items()}


def _pin(text):
    return hashlib.sha256(text.encode("utf-8")).hexdigest()


def _guide_blocks(lines, sections):
    """(section, block) for each paragraph, list item and table row of the guide.

    The text before the first "## " heading is the "(preamble)" section;
    "### " headings stay inside their "## " section. Fenced code, headings and
    table header rows are not statements.
    """
    blocks, section, fence, item_indent = [], "(preamble)", False, None
    seen = []
    for i, line in enumerate(lines):
        stripped = line.strip()
        if stripped.startswith("```") or stripped.startswith("~~~"):
            fence = not fence
            item_indent = None
            continue
        if fence:
            continue
        if line.startswith("## "):
            section = line[3:].strip()
            seen.append(section)
            item_indent = None
            continue
        if line.startswith("#"):
            item_indent = None
            continue
        if not stripped:
            item_indent = None
            continue
        if section not in sections:
            continue
        if stripped.startswith("|"):
            if re.fullmatch(r"\|(?:\s*:?-+:?\s*\|)+", stripped):
                if blocks and blocks[-1][0] == section and blocks[-1][2] == "table_row":
                    blocks.pop()  # The row above a separator is the header row.
                continue
            cells = [c.strip() for c in stripped.strip("|").split("|")]
            blocks.append((section, [(i + 1, " | ".join(cells))], "table_row"))
            item_indent = None
            continue
        item = re.match(r"(\s*)(?:[-*]|\d+\.)\s+(.*)$", line)
        if item:
            blocks.append((section, [(i + 1, item.group(2))], "list_item"))
            item_indent = len(item.group(1))
            continue
        indent = len(line) - len(line.lstrip())
        if blocks and blocks[-1][0] == section and (item_indent is not None and indent > item_indent
                                                    or blocks[-1][2] == "paragraph" and item_indent is None
                                                    and _continues(lines, i)):
            blocks[-1][1].append((i + 1, stripped))
            continue
        blocks.append((section, [(i + 1, stripped)], "paragraph"))
        item_indent = None
    return blocks, seen


def _continues(lines, i):
    """True when line i continues the paragraph on line i - 1 (no blank line between)."""
    return i > 0 and lines[i - 1].strip() != "" and not lines[i - 1].lstrip().startswith(("#", "|", "```"))


def owner_statements(root, owner_text):
    """Every statement of the selected owner text: (statements, problems).

    Each statement is {"id", "source", "line", "statement", "normative"}. Ids
    name the unit or guide section, the field or block ordinal and the
    sentence ordinal, so they move when the text moves.
    """
    statements, problems = [], []
    for unit in owner_text["units"]:
        path = root / unit["path"]
        try:
            lines = path.read_text(encoding="utf-8").split("\n")
            blocks = _unit_blocks(lines, unit["unit"], unit["fields"])
        except (OSError, ValueError, StopIteration) as error:
            problems.append("owner text %s %s unreadable: %s" % (unit["path"], unit["unit"], error))
            continue
        # T33: the unit's unselected YAML fields are pinned: any edit there fails until reviewed and re-pinned.
        unselected = _pin(_unit_unselected_text(lines, unit["unit"], unit["fields"]))
        if unit.get("unselected_sha256") != unselected:
            problems.append("owner text %s %s: unselected YAML fields changed (sha256 %s, pinned %s); review them for "
                            "number rules and refresh unselected_sha256" % (unit["path"], unit["unit"], unselected,
                                                                          unit.get("unselected_sha256")))
        # T50: and so is the whole unit section less the selected fields: its heading, the prose and ContractRef: line
        # outside the YAML fence, and every other line up to the next heading.
        try:
            section = _pin(_unit_section_unselected_text(lines, unit["unit"], unit["fields"]))
        except (ValueError, StopIteration) as error:
            problems.append("owner text %s %s: unit section unreadable: %s" % (unit["path"], unit["unit"], error))
            section = None
        if section is not None and unit.get("section_unselected_sha256") != section:
            problems.append("owner text %s %s: the unit section outside its selected fields changed (sha256 %s, pinned %s); "
                            "review its heading, prose and ContractRef: line for number rules and refresh "
                            "section_unselected_sha256" % (unit["path"], unit["unit"], section, unit.get("section_unselected_sha256")))
        ordinals = {}
        for field, block in blocks:
            ordinals[field] = ordinals.get(field, 0) + 1
            for n, (line, sentence) in enumerate(_sentences(block), 1):
                statements.append({"id": "%s:%s:%d.%d" % (unit["unit"], field, ordinals[field], n),
                                   "source": unit["path"], "line": line, "statement": sentence})
    guide = owner_text["guide"]
    try:
        lines = (root / guide["path"]).read_text(encoding="utf-8").split("\n")
    except OSError as error:
        problems.append("owner text %s unreadable: %s" % (guide["path"], error))
        lines = None
    if lines is not None:
        selected = set(guide["sections"])
        blocks, seen = _guide_blocks(lines, selected)
        for section in seen:
            if section not in selected and not guide["excluded_sections"].get(section):
                problems.append("guide section %r is neither selected nor excluded with a reason" % section)
        for section in list(selected - {"(preamble)"}) + list(guide["excluded_sections"]):
            if section not in seen:
                problems.append("stale guide section selection: %r" % section)
        # T33: each excluded section's whole text is pinned: a rule added inside it fails until reviewed.
        section_texts = _guide_section_texts(lines)
        for section in guide["excluded_sections"]:
            pin = _pin(section_texts.get(section, ""))
            if guide.get("excluded_section_sha256", {}).get(section) != pin:
                problems.append("excluded guide section %r changed (sha256 %s, pinned %s); review it for number rules "
                                "and refresh excluded_section_sha256" % (section, pin, guide.get("excluded_section_sha256", {}).get(section)))
        excluded = guide.get("excluded_blocks", [])
        matched = [0] * len(excluded)
        ordinals = {}
        for section, block, kind in blocks:
            ordinals[section] = ordinals.get(section, 0) + 1
            first = block[0][1]
            hits = [j for j, rule in enumerate(excluded)
                    if rule["section"] == section and first.startswith(rule["starts_with"])]
            if hits:
                for j in hits:
                    matched[j] += 1
                    # T33: an excluded block's full text is pinned, not only its first words.
                    pin = _pin("\n".join(text for _, text in block))
                    if excluded[j].get("sha256") != pin:
                        problems.append("guide block exclusion %r changed (sha256 %s, pinned %s); review it for number "
                                        "rules and refresh its sha256" % (excluded[j]["starts_with"], pin, excluded[j].get("sha256")))
                continue
            for n, (line, sentence) in enumerate(_sentences(block), 1):
                statements.append({"id": "guide:%s:%d.%d" % (section, ordinals[section], n),
                                   "source": guide["path"], "line": line, "statement": sentence})
        for rule, count in zip(excluded, matched):
            if count != 1 or not rule.get("reason"):
                problems.append("guide block exclusion %r must match exactly one block and give a reason (%d)"
                                % (rule["starts_with"], count))
    for statement in statements:
        statement["normative"] = NORMATIVE_MARKERS.search(statement["statement"]) is not None
    return statements, problems


def check_rules_table(root, spec):
    """Statement rows, rule rows and hand-written mutations, checked together.

    Every extracted statement has exactly one row with the same source, line
    and text; every row matches a statement (else it is stale). A row names
    rules, each caught with failing witnesses, or says why no mutation
    applies. Every rule is named by a row, and every hand-written mutation
    names a rule that lists it.
    """
    problems = []
    statements, extraction_problems = owner_statements(root, spec["owner_text"])
    problems.extend(extraction_problems)
    rows = spec.get("statements", [])
    key = lambda r: (r["source"], r["line"], r["statement"])
    extracted = {key(s): s for s in statements}
    if len(extracted) != len(statements):
        problems.append("two owner statements share a source line and text")
    by_text = {}
    for s in statements:
        by_text.setdefault((s["source"], s["statement"]), []).append(s["line"])
    row_keys = {}
    for row in rows:
        k = key(row)
        if k in row_keys:
            problems.append("duplicate statement row: %s line %d" % (row["source"], row["line"]))
        row_keys[k] = row
        if k not in extracted:
            now = by_text.get((row["source"], row["statement"]))
            problems.append("stale statement row %s: %s line %d no longer holds its text%s"
                            % (row.get("id"), row["source"], row["line"],
                               " (now at line %s)" % now if now else ""))
        elif extracted[k]["id"] != row.get("id"):
            problems.append("statement row id %s should be %s" % (row.get("id"), extracted[k]["id"]))
        if bool(row.get("rules")) == bool(row.get("no_mutation")):
            problems.append("statement row %s needs exactly one of rules or no_mutation" % row.get("id"))
    for k, s in extracted.items():
        if k not in row_keys:
            problems.append("owner statement without a row: %s %s line %d: %s"
                            % (s["id"], s["source"], s["line"], s["statement"][:120]))
    rules = {r["id"]: r for r in spec.get("rules", [])}
    named = {name for row in rows for name in row.get("rules", [])}
    for name in sorted(named - set(rules)):
        problems.append("statement rows name an unknown rule: " + name)
    for name in sorted(set(rules) - named):
        problems.append("rule %s is named by no statement row" % name)
    for mutation in spec["mutations"]:
        rule = rules.get(mutation.get("rule"))
        if rule is None:
            problems.append("hand-written mutation %s names no known rule" % mutation["id"])
        elif mutation["id"] not in rule["mutations"]:
            problems.append("mutation %s names rule %s, which does not list it" % (mutation["id"], rule["id"]))
    mutation_rule = {m["id"]: m.get("rule") for m in spec["mutations"]}
    for rule in rules.values():
        for name in rule["mutations"]:
            if name in mutation_rule and mutation_rule[name] != rule["id"] and name not in rule.get("shared", ()):
                problems.append("rule %s lists %s, which names rule %s; list it under shared"
                                % (rule["id"], name, mutation_rule[name]))
    totals = {"statements": len(statements), "normative_statements": sum(s["normative"] for s in statements),
              "statement_rows": len(rows), "rows_with_rules": sum(bool(r.get("rules")) for r in rows),
              "rows_without_mutation": sum(bool(r.get("no_mutation")) for r in rows),
              "statements_without_row": sum(k not in row_keys for k in extracted),
              "stale_rows": sum(key(r) not in extracted for r in rows),
              "hand_written_with_rule": sum(m.get("rule") in rules for m in spec["mutations"]),
              "hand_written_orphans": sum(m.get("rule") not in rules for m in spec["mutations"])}
    return problems, totals


def _judge(row, run, declared, witness, problems, label):
    """Record one mutant's result and every rule it must satisfy."""
    row["result"] = run["result"]
    if run["result"] in ("build_error", "runner_exception"):
        row["error"] = run["error"]
        problems.append("%s: %s (%s); never counted as caught" % (label, run["result"], run["error"]))
        return
    row.update(failed_cases=len(run["failed"]), failed_case_ids=run["failed"][:12],
               failed_checks=run["failed_checks"][:12])
    if declared:
        row["declared_survivor"] = declared
        if run["result"] == "caught":
            problems.append(label + ": declared survivor is now caught; update the set")
        return
    if run["result"] != "caught":
        problems.append(label + ": mutation survived the number corpus")
        return
    if witness:
        # A witness is a corpus case id, or "check:<name>" for an owner check.
        row["witness"] = witness
        row["witness_failed"] = (witness.removeprefix("check:") in run["failed_checks"] if witness.startswith("check:")
                                 else witness in run["failed"])
        if not row["witness_failed"]:
            problems.append("%s: witness %s did not fail" % (label, witness))


def run_mutations(corpus_path, mutation_path, *, time_limit=120):
    """Replay the committed mutation set against the number scope.

    Pass means: the intact corpus passes, and the real CLI exits 1 on a
    failing corpus; every (API, class) cell has a mutation or a reasoned
    not-applicable entry; the rules table matches the owner text (every
    statement has a row, no row is stale, every row names witnessed rules or
    says why no mutation applies, every hand-written mutation names its rule);
    the helper has no refusal alias; the AST mutation points match the
    committed entries exactly (no new, no stale point); every mutant builds,
    runs and fails the number corpus, with its witness among the failures; and
    every declared survivor really survives.
    """
    import pm_event_numbers as intact
    import pm_event_index_binding as binding
    spec = json.loads(Path(mutation_path).read_text(), object_pairs_hook=_unique_pairs)
    sources = {name: (Path(module.__file__).read_text(), module.__file__)
               for name, module in (("pm_event_numbers", intact), ("pm_event_index_binding", binding))}
    problems = []
    baseline = run_corpus(corpus_path, scope="numbers")
    if baseline["status"] != "pass":
        problems.append("intact number corpus does not pass")
    cli = cli_subprocess_status(intact.__file__)
    if cli != (1, "fail"):
        problems.append("the CLI on a failing corpus gave (exit, status) %r, not (1, 'fail')" % (cli,))
    problems.extend(refusal_alias_problems(sources["pm_event_numbers"][0]))
    classes = MUTATION_CLASSES + tuple(spec.get("extra_classes", ()))
    by_id = {}
    for mutation in spec["mutations"]:
        if mutation["id"] in by_id:
            problems.append("duplicate mutation id: " + mutation["id"])
        by_id[mutation["id"]] = mutation
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
        for key in ("source", "rule"):
            if mutation.get(key):
                row[key] = mutation[key]
        if mutation["api"] not in spec["apis"] or mutation["class"] not in classes:
            problems.append(mutation["id"] + ": unknown API or class")
        count = sources[mutation["module"]][0].count(mutation["find"]) if mutation["module"] in sources else 0
        if count != 1 or mutation["find"] == mutation["replace"]:
            row.update(result="not_applied", find_occurrences=count)
            problems.append(mutation["id"] + ": find text must occur exactly once and differ from replace")
            results.append(row)
            continue
        text, file = sources[mutation["module"]]
        run = _run_mutant(mutation["module"], lambda: compile(text.replace(mutation["find"], mutation["replace"]),
                                                              file, "exec"),
                          sources, corpus_path, time_limit)
        _judge(row, run, mutation.get("survives"), mutation.get("witness"), problems, mutation["id"])
        results.append(row)

    numbers_text, numbers_file = sources["pm_event_numbers"]
    points = mutation_points(numbers_text)
    committed = spec.get("generated", {}).get("points", {})
    enumerated = {p["key"] for p in points}
    for key in sorted(enumerated - set(committed)):
        problems.append("new mutation point without a committed entry: " + key)
    for key in sorted(set(committed) - enumerated):
        problems.append("stale committed mutation point (not in the helper's AST): " + key)
    generated = []
    for point in points:
        entry = committed.get(point["key"], {})
        row = {key: point[key] for key in ("key", "family", "function", "line", "action", "text")}
        if point.get("reason"):
            row["reason"] = point["reason"]
        if point["key"] in committed and bool(entry.get("witness")) == bool(entry.get("survives")):
            problems.append(point["key"] + ": committed entry needs exactly one of witness or survives")
        run = _run_mutant("pm_event_numbers", lambda: _point_code(numbers_text, numbers_file, point),
                          sources, corpus_path, time_limit)
        _judge(row, run, entry.get("survives"), entry.get("witness"), problems, point["key"])
        generated.append(row)

    # Each documented rule names hand-written mutation ids or generated point
    # keys; every one must be caught with its witness case among the failures.
    rows_by_name = {r["id"]: r for r in results} | {r["key"]: r for r in generated}
    rules, rule_ids = [], set()
    for rule in spec.get("rules", []):
        if rule["id"] in rule_ids:
            problems.append("duplicate rule id: " + rule["id"])
        rule_ids.add(rule["id"])
        missing = sorted(name for name in rule["mutations"] if name not in rows_by_name)
        if not rule["mutations"] or missing:
            problems.append("rule %s: no mutation, or unknown mutation %s" % (rule["id"], missing))
        rows = [rows_by_name[name] for name in rule["mutations"] if name in rows_by_name]
        if rule.get("control"):
            # A harness control rule: each of its mutations is a declared
            # survivor that must really survive (a no-op edit, for example).
            for row in rows:
                if not (row.get("declared_survivor") and row.get("result") == "survives"):
                    problems.append("control rule %s: %s is not a surviving declared control"
                                    % (rule["id"], row.get("id", row.get("key"))))
            held = bool(rows) and not missing and all(row.get("result") == "survives" for row in rows)
            rules.append({"id": rule["id"], "owner": rule["owner"], "api": rule["api"], "rule": rule["rule"],
                          "mutations": rule["mutations"], "result": "caught" if held else "NOT CAUGHT",
                          "control": True})
            continue
        for row in rows:
            if not row.get("witness_failed"):
                problems.append("rule %s: %s is not caught with a failing witness case"
                                % (rule["id"], row.get("id", row.get("key"))))
        caught = bool(rows) and not missing and all(row.get("witness_failed") for row in rows)
        rules.append({"id": rule["id"], "owner": rule["owner"], "api": rule["api"], "rule": rule["rule"],
                      "mutations": rule["mutations"], "result": "caught" if caught else "NOT CAUGHT"})

    root = Path(__file__).resolve().parents[1]
    table_problems, table_totals = check_rules_table(root, spec)
    problems.extend(table_problems)
    rule_result = {r["id"]: r["result"] for r in rules}
    statements = []
    for row in spec.get("statements", []):
        out = {key: row[key] for key in ("id", "source", "line", "statement")}
        if row.get("note"):
            out["note"] = row["note"]
        if row.get("rules"):
            out["rules"] = row["rules"]
            out["result"] = ("caught" if all(rule_result.get(name) == "caught" for name in row["rules"])
                             else "NOT CAUGHT")
        else:
            out["no_mutation"] = row.get("no_mutation")
            out["result"] = "no mutation applies"
        statements.append(out)

    every = results + generated
    review = [r for r in results if r.get("source") == "review"]
    review_fix2 = [r for r in results if r.get("source") == "review-fix2"]
    review_fix3 = [r for r in results if r.get("source") == "review-fix3"]
    family_counts = {family: sum(p["family"] == family for p in points) for family in GENERATED_FAMILIES}
    totals = {
        "apis": len(spec["apis"]),
        "rules": len(rules),
        "rules_caught": sum(r["result"] == "caught" for r in rules),
        **table_totals,
        "statement_rows_caught": sum(s["result"] == "caught" for s in statements),
        "statement_rows_not_caught": sum(s["result"] == "NOT CAUGHT" for s in statements),
        "refusal_sites": family_counts["refusal_site"],
        "refusal_predicates": family_counts["refusal_predicate"],
        "comparison_boundaries": family_counts["comparison_boundary"],
        "delegated_refusals": family_counts["delegated_refusal"],
        "container_branches": family_counts["container_branch"],
        "field_iterations": family_counts["field_iteration"],
        "hand_written_mutations": len(results),
        "generated_mutations": len(generated),
        "mutations": len(every),
        "caught": sum(r.get("result") == "caught" for r in every),
        "survivors": sum(r.get("result") == "survives" for r in every),
        "declared_survivors": sum("declared_survivor" in r for r in every),
        "undeclared_survivors": sum(r.get("result") == "survives" and "declared_survivor" not in r for r in every),
        "witnessed": sum(bool(r.get("witness_failed")) for r in every),
        "not_applied": sum(r.get("result") == "not_applied" for r in every),
        "build_errors": sum(r.get("result") == "build_error" for r in every),
        "runner_exceptions": sum(r.get("result") == "runner_exception" for r in every),
        "not_applicable_cells": sum(type(v) is str and v.startswith("N/A: ") for cells in matrix.values()
                                    for v in cells.values()),
        "review_mutations": len(review),
        "review_mutations_caught": sum(r.get("result") == "caught" for r in review),
        "review_fix2_mutations": len(review_fix2),
        "review_fix2_caught": sum(r.get("result") == "caught" for r in review_fix2),
        "review_fix2_declared_controls": sum("declared_survivor" in r for r in review_fix2),
        "review_fix3_mutations": len(review_fix3),
        "review_fix3_caught": sum(r.get("result") == "caught" for r in review_fix3),
    }
    return {"status": "fail" if problems else "pass", "mutation_set": spec["schema_id"],
            "intact": {key: baseline[key] for key in ("status", "corpus_cases", "case_passes",
                                                       "positives", "negatives")} |
                      {"owner_integration_checks": len(baseline["owner_integration_checks"])},
            "cli_subprocess": {"exit": cli[0], "status": cli[1]},
            "totals": totals, "problems": problems, "generated_families": GENERATED_FAMILIES,
            "statements": statements, "rules": rules, "matrix": matrix, "mutations": results,
            "generated": generated,
            "self_test_scope": "numbers", "native_authority": "NOT_RUN"}
