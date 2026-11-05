#!/usr/bin/env python3
"""CV-1100 / SP-1100 / SP-1101 reference adapters, never native authority.

Run --self-test (rfc8785==0.1.4 and msgpack==1.1.2 required). The corpus
also cross-checks CV-366 and SP-337 with blake3. These are read-only fixture
codecs. Production composition supplies genuine original-owner custody and
its frozen validators; no request, boolean or self-hash authenticates it.

--self-test --scope numbers runs the number cases and number owner checks with
no date-time code imported. The default --scope all adds the date-time gate.
"""
from __future__ import annotations

import argparse
from dataclasses import dataclass, fields
from decimal import Decimal
import hashlib
import json
import math
from pathlib import Path
import re
import struct
from typing import Callable, Mapping, Protocol

from pm_event_index_binding import _length_prefix, binding_bytes

EVENT_VALUE = "pm.seglog_frame_v2.event_value.canonical_msgpack.v1"
APP_PHYSICAL = "pm.application.physical_messagepack.v1"
INDEX_BINDING = "pm.event_index.binding.msgpack_sha256.v1"
UINT64_MAX = (1 << 64) - 1
INTEGER_TOKEN = re.compile(r"(?:0|-?[1-9][0-9]*)", re.ASCII)
PRODUCER_FIELDS = (
    "event_type", "scope_kind", "project_id", "thread_id", "run_id", "node_id",
    "attempt_id", "actor_ref", "requested_account_ref", "effective_account_ref",
    "occurred_at_utc", "producer_sequence_id", "correlation_id", "causation_event_id",
    "parent_event_id", "idempotency_key", "payload_schema_id", "payload",
    "payload_ref", "redaction_profile", "migration",
)


class Refusal(ValueError):
    """Adapter diagnostic; callers map it to their existing refusal contract."""

    def __init__(self, reason: str):
        super().__init__(reason)
        self.reason = reason


def _refuse(reason):
    raise Refusal(reason)


def _integer_digits(token: str) -> int:
    # No binary64 and no process-global change to Python's integer digit limit.
    negative = token.startswith("-")
    digits = token[1:] if negative else token
    value = 0
    for start in range(0, len(digits), 9):
        chunk = digits[start:start + 9]
        value = value * 10 ** len(chunk) + int(chunk)
    return -value if negative else value


def current_integer_token(token: str, *, minimum=None, maximum=None) -> int:
    if type(token) is not str or INTEGER_TOKEN.fullmatch(token) is None:
        _refuse("integer_token")
    return current_integer(_integer_digits(token), minimum=minimum, maximum=maximum)


@dataclass(frozen=True)
class JsonNumber:
    """Original token, retained before any binary64 or integer normalization."""

    token: str
    integer: bool

    def __post_init__(self):
        if type(self.token) is not str or type(self.integer) is not bool:
            _refuse("json_number_token")
        grammar = r"-?(?:0|[1-9][0-9]*)" if self.integer else r"-?(?:0|[1-9][0-9]*)(?:\.[0-9]+)?(?:[eE][+-]?[0-9]+)?"
        if re.fullmatch(grammar, self.token, re.ASCII) is None:
            _refuse("json_number_token")
        if not self.integer and not any(c in self.token for c in ".eE"):
            _refuse("json_number_token")

    def exact(self):
        return _integer_digits(self.token) if self.integer else Decimal(self.token)


class ParsedDecimal(Decimal):
    """Exact Decimal carrier retaining the JSON/schema numeric kind."""

    def __new__(cls, token, numeric_kind="float"):
        value = super().__new__(cls, token)
        value.numeric_kind = numeric_kind
        return value


def current_integer(value, *, minimum=None, maximum=None) -> int:
    if type(value) is JsonNumber:
        if not value.integer:
            _refuse("integer_type")
        return current_integer_token(value.token, minimum=minimum, maximum=maximum)
    if type(value) is not int:
        _refuse("integer_type")
    if minimum is not None and value < minimum:
        _refuse("integer_range")
    if maximum is not None and value > maximum:
        _refuse("integer_range")
    return value


def storage_uint64(value) -> int:
    return current_integer(value, minimum=0, maximum=UINT64_MAX)


def exact_boolean(value) -> bool:
    if type(value) is not bool:
        _refuse("boolean_type")
    return value


def current_append_policy(value) -> str:
    """Current request gate only; never call this on a retained original."""
    if value == "projector_replay_only":
        _refuse("replay_only_not_appendable")
    if type(value) is not str or value not in (
        "append_once", "dedupe_by_event_id", "dedupe_by_idempotency_key",
    ):
        _refuse("replay_policy")
    return value


def _unique_object(pairs):
    result = {}
    for key, value in pairs:
        if key in result:
            _refuse("duplicate_key")
        result[key] = value
    return result


def _scalar_string(value):
    try:
        value.encode("utf-8", errors="strict")
    except UnicodeError:
        _refuse("unicode_scalar")
    return value


def loads_exact(raw: str | bytes):
    """Lossless JSON tree; schema-specific integer slots call current_integer.

    A retained recipe gets the untouched raw bytes instead. This parser neither
    selects history nor applies today's grammar to a historical original.
    """
    if type(raw) is bytes:
        try:
            raw = raw.decode("utf-8", errors="strict")
        except UnicodeError:
            _refuse("json_utf8")
    if type(raw) is not str:
        _refuse("json_input_type")
    try:
        result = json.loads(raw, parse_int=lambda t: JsonNumber(t, True),
                            parse_float=lambda t: JsonNumber(t, False),
                            parse_constant=lambda t: _refuse("json_nonfinite"),
                            object_pairs_hook=_unique_object)
    except json.JSONDecodeError:
        _refuse("json_syntax")
    stack = [result]
    while stack:
        value = stack.pop()
        if type(value) is str:
            _scalar_string(value)
        elif type(value) is dict:
            stack.extend(value.keys())
            stack.extend(value.values())
        elif type(value) is list:
            stack.extend(value)
    return result


def loads_current_json(raw, *, numeric_kinds=None):
    """Current raw integers become exact ints; fractional tokens stay Decimal.

    This is not a schema validator. Call current_integer at every integer slot
    after parsing, including nullable slots only when non-null. It deliberately
    does not convert fractional/exponent tokens, even integral ones, to ints.
    ParsedDecimal retains their lexical float kind, or the schema-declared kind
    from numeric_kinds, without converting their exact value to binary64.
    """
    def materialize(value, path=()):
        if type(value) is JsonNumber:
            return (current_integer(value) if value.integer else
                    ParsedDecimal(value.token, (numeric_kinds or {}).get(path, "float")))
        if type(value) is list:
            return [materialize(v, path + (i,)) for i, v in enumerate(value)]
        if type(value) is dict:
            return {k: materialize(v, path + (k,)) for k, v in value.items()}
        return value
    return materialize(loads_exact(raw))


def _declared_numeric_kind(value, path, *, type_sensitive_paths=frozenset(), numeric_kinds=None):
    """Numeric-kind admission alone: one declared or carried kind, or refusal.

    Whether the emitted JCS token preserves that kind is a separate predicate,
    enforced later by qualified_jcs. A bare Decimal carries no kind.
    """
    kind = (numeric_kinds or {}).get(path)
    inferred_kind = ("integer" if type(value) is int else "float" if type(value) is float else
                     value.numeric_kind if type(value) is ParsedDecimal else
                     ("integer" if value.integer else "float") if type(value) is JsonNumber else None)
    kind = kind if kind is not None else inferred_kind
    if kind not in (None, "integer", "float", "decimal"):
        _refuse("jcs_numeric_kind")
    if path in type_sensitive_paths and kind is None:
        _refuse("jcs_kind_undeclared")
    return kind


def qualified_jcs(value, *, type_sensitive_paths=frozenset(),
                  sign_sensitive_paths=frozenset(), numeric_kinds=None) -> bytes:
    """Actual RFC8785, qualified against original integers/output decimals.

    Paths are tuples of map keys / array indices from the original schema.
    Where that source distinguishes number primitive types or zero sign,
    type_sensitive_paths additionally refuses a JCS serialization losing them.
    numeric_kinds maps schema paths to integer, float or decimal, independently
    of the parser carrier. Bare Decimal has no declared kind: supply one at a
    type-sensitive path. JsonNumber retains the lexical integer/float kind.
    sign_sensitive_paths checks zero sign without requiring primitive kind.
    This never certifies all future values of an owner schema or successor slot.
    """
    import rfc8785

    def number(v, path):
        kind = _declared_numeric_kind(v, path, type_sensitive_paths=type_sensitive_paths,
                                      numeric_kinds=numeric_kinds)
        source_negative_zero = False
        if type(v) is JsonNumber:
            source_negative_zero = v.token.startswith("-") and Decimal(v.token).is_zero()
            v = v.exact()
        source_integer = type(v) is int
        if type(v) is int:
            exact = Decimal(v)
        elif type(v) in (Decimal, ParsedDecimal):
            if not v.is_finite():
                _refuse("jcs_nonfinite")
            exact = v
        else:
            if not math.isfinite(v):
                _refuse("jcs_nonfinite")
            exact = None
        try:
            f = float(v)
        except (OverflowError, ValueError):
            _refuse("jcs_binary64")
        if not math.isfinite(f):
            _refuse("jcs_binary64")
        if source_integer and int(f) != v:
            _refuse("jcs_binary64")
        token = rfc8785.dumps(f)
        if exact is not None and Decimal(token.decode("ascii")) != exact:
            _refuse("jcs_decimal")
        if path in type_sensitive_paths:
            output_integer = re.fullmatch(rb"-?(?:0|[1-9][0-9]*)", token) is not None
            output_kind = "integer" if output_integer else "float"
            if kind != output_kind:
                _refuse("jcs_kind")
        if path in type_sensitive_paths or path in sign_sensitive_paths:
            negative_zero = source_negative_zero or (v == 0 and (
                v.is_signed() if type(v) in (Decimal, ParsedDecimal) else math.copysign(1.0, f) < 0))
            if negative_zero:
                _refuse("jcs_sign")
        return f

    def adapt(v, path=()):
        if v is None or type(v) is bool:
            return v
        if type(v) in (int, float, Decimal, ParsedDecimal, JsonNumber):
            return number(v, path)
        if type(v) is str:
            return _scalar_string(v)
        if type(v) is list:
            return [adapt(x, path + (i,)) for i, x in enumerate(v)]
        if type(v) is dict:
            if any(type(k) is not str for k in v):
                _refuse("jcs_key_type")
            return {_scalar_string(k): adapt(x, path + (k,)) for k, x in v.items()}
        _refuse("jcs_type")
    return rfc8785.dumps(adapt(value))


def producer_semantic_bytes(event, **qualification) -> bytes:
    """Exact existing CV-317 projection; envelope validation remains separate."""
    if type(event) is not dict or any(k not in event for k in PRODUCER_FIELDS):
        _refuse("producer_projection")
    return qualified_jcs({k: event[k] for k in PRODUCER_FIELDS}, **qualification)


def producer_semantic_digest(event, **qualification) -> str:
    return hashlib.sha256(producer_semantic_bytes(event, **qualification)).hexdigest()


def storage_value_bytes(value, *, profile=EVENT_VALUE) -> bytes:
    """Dispatch existing SP-236, SP-278 and CV-366 byte profiles exactly.

    SP-278 delegates to its existing helper. The other two are reference
    implementations of their unchanged owner byte rules, cross-checked against
    frozen Storage vectors. Schema validation and declared-binary admission are
    the selected owner's responsibility, not inferred from successful encoding.
    """
    if profile == INDEX_BINDING:
        try:
            return binding_bytes(value)
        except (TypeError, ValueError, UnicodeError):
            _refuse("binding_domain")
    if profile not in (EVENT_VALUE, APP_PHYSICAL):
        _refuse("physical_profile")
    result = []
    pending = [value]
    while pending:
        v = pending.pop()
        if v is None:
            result.append(b"\xc0")
        elif type(v) is bool:
            result.append(b"\xc3" if v else b"\xc2")
        elif type(v) is int:
            if not -(1 << 63) <= v <= UINT64_MAX:
                _refuse("physical_integer_range")
            if v >= 0:
                result.append(binding_bytes(v))
            elif v >= -32:
                result.append(bytes([v & 255]))
            else:
                for low, tag, width in ((-128, 0xd0, 1), (-32768, 0xd1, 2),
                                        (-(1 << 31), 0xd2, 4), (-(1 << 63), 0xd3, 8)):
                    if v >= low:
                        result.append(bytes([tag]) + v.to_bytes(width, "big", signed=True))
                        break
        elif type(v) is float:
            if not math.isfinite(v):
                _refuse("physical_nonfinite")
            single = None
            if profile == EVENT_VALUE:
                try:
                    raw = struct.pack(">f", v)
                    restored = struct.unpack(">f", raw)[0]
                    if restored == v and math.copysign(1, restored) == math.copysign(1, v):
                        single = raw
                except OverflowError:
                    pass
            result.append(b"\xca" + single if single is not None else b"\xcb" + struct.pack(">d", v))
        elif type(v) is str:
            raw = _scalar_string(v).encode("utf-8")
            result.append(_length_prefix(len(raw), "str") + raw)
        elif type(v) is bytes and profile == APP_PHYSICAL:
            n = len(v)
            if n <= 255:
                prefix = b"\xc4" + n.to_bytes(1, "big")
            elif n <= 65535:
                prefix = b"\xc5" + n.to_bytes(2, "big")
            elif n <= 0xffffffff:
                prefix = b"\xc6" + n.to_bytes(4, "big")
            else:
                _refuse("physical_length")
            result.append(prefix + v)
        elif type(v) is list:
            result.append(_length_prefix(len(v), "array"))
            pending.extend(reversed(v))
        elif type(v) is dict:
            if any(type(k) is not str for k in v):
                _refuse("physical_key_type")
            keys = sorted(v, key=lambda k: _scalar_string(k).encode("utf-8"))
            result.append(_length_prefix(len(keys), "map"))
            for k in reversed(keys):
                pending.extend((v[k], k))
        else:
            _refuse("physical_type")
    return b"".join(result)


def decode_storage_value(raw: bytes, *, profile=EVENT_VALUE):
    """Bounded fixture decoder; reject every noncanonical alternate by bytes."""
    import msgpack
    if type(raw) is not bytes:
        _refuse("physical_input_type")
    try:
        value = msgpack.unpackb(raw, raw=False, strict_map_key=True,
                                object_pairs_hook=_unique_object,
                                ext_hook=lambda c, d: _refuse("physical_tag"))
    except Refusal:
        raise
    except (ValueError, TypeError, UnicodeError):
        _refuse("physical_decode")
    if storage_value_bytes(value, profile=profile) != raw:
        _refuse("physical_noncanonical")
    return value


def full_value_commitment(event) -> str:
    """Unchanged CV-339 original_event_value_commitment.sha256 preimage."""
    if type(event) is not dict or event.get("schema_id") != "pm.event.v0" or event.get("schema_version") != "2.0.0":
        _refuse("full_value_edition")
    return hashlib.sha256(storage_value_bytes([
        "pm.storage.original_event_value_commitment.v1", "1.0.0", EVENT_VALUE,
        event["schema_id"], event["schema_version"], event,
    ])).hexdigest()


def verify_payload_bytes(raw: bytes, *, byte_size, payload_id, media_type,
                         expected_media_type, inline=False) -> None:
    """SP-337 byte/descriptor arithmetic only; no pack/index custody proof.

    The actual owner supplies its selected original media/profile and genuine
    bytes. This comparison cannot authenticate a caller's bytes or descriptor.
    """
    import blake3
    if type(raw) is not bytes:
        _refuse("payload_bytes_type")
    size = current_integer(byte_size, minimum=0)
    if size != len(raw):
        _refuse("payload_size")
    if type(payload_id) is not str or re.fullmatch(r"[0-9a-f]{64}", payload_id) is None:
        _refuse("payload_id_type")
    # Syntax is independently enforced above. Compare digest bytes so a
    # syntax-only whitespace defect does not also become a digest defect.
    if bytes.fromhex(payload_id) != blake3.blake3(raw).digest():
        _refuse("payload_digest")
    if type(media_type) is not str or media_type != expected_media_type:
        _refuse("payload_media")
    exact_boolean(inline)
    if inline and len(raw) > 16384:
        _refuse("payload_inline_limit")


@dataclass(frozen=True)
class RecipeTuple:
    envelope_schema_id: str
    envelope_schema_version: str
    payload_schema_id: str
    payload_schema_version: str
    owner_source_id: str
    owner_edition: str
    registry_revision: str
    identity_recipe: str
    producer_recipe: str
    physical_profile: str
    full_value_profile: str
    local_source_profile: str
    payload_profile: str
    resource_manifest_sha256: str

    def __post_init__(self):
        if any(type(getattr(self, f.name)) is not str or not getattr(self, f.name) for f in fields(self)):
            _refuse("recipe_tuple")
        if re.fullmatch(r"[0-9a-f]{64}", self.resource_manifest_sha256) is None:
            _refuse("recipe_resource_hash")


@dataclass(frozen=True)
class OriginalBinding:
    storage_instance_id: str
    scope_kind: str
    server_id: str
    project_id: str | None
    event_type: str
    event_id: str
    idempotency_key: str
    owner_operation_id: str
    source_commitment: str

    def __post_init__(self):
        for f in fields(self):
            v = getattr(self, f.name)
            if f.name != "project_id" and (type(v) is not str or not v):
                _refuse("original_binding")
        if not ((self.scope_kind == "application" and self.project_id is None) or
                (self.scope_kind == "project" and type(self.project_id) is str and self.project_id)):
            _refuse("original_scope")


@dataclass(frozen=True)
class OriginalCustody:
    binding: OriginalBinding
    recipe: RecipeTuple
    record_bytes: bytes
    result_bytes: bytes
    receipt_bytes: bytes


class OriginalOwner(Protocol):
    def authenticated_original(self, original_ref: str) -> OriginalCustody:
        """Native owner authenticates immutable issuance/source/edition joins.

        This method is trusted composition, never an endpoint implementing
        verified=true or accepting a caller's OriginalCustody object.
        """


@dataclass(frozen=True)
class FrozenRecipe:
    verify_original: Callable[[OriginalCustody], bool]


class RetainedDispatcher:
    """Composition-only catalog, not a registry service or admission record.

    Install owner and exact recipe map outside the request boundary. The
    frozen verifier must recompute identity, semantic/full/source commitments,
    authenticate edition resources and join original result/receipt custody.
    It must not apply current writer or live-state validation to the original.
    """

    def __init__(self, owner: OriginalOwner, recipes: Mapping[RecipeTuple, FrozenRecipe]):
        self._owner = owner
        self._recipes = dict(recipes)

    def resolve(self, original_ref: str, expected: OriginalBinding, *, disclose: Callable,
                recipe_override=None) -> OriginalCustody:
        if recipe_override is not None:
            _refuse("caller_recipe_override")
        if type(original_ref) is not str or not original_ref or type(expected) is not OriginalBinding:
            _refuse("original_query")
        original = self._owner.authenticated_original(original_ref)
        if type(original) is not OriginalCustody:
            _refuse("original_authority")
        if type(original.binding) is not OriginalBinding or original.binding != expected:
            _refuse("original_binding")
        if type(original.recipe) is not RecipeTuple:
            _refuse("recipe_selection")
        recipe = self._recipes.get(original.recipe)
        if type(recipe) is not FrozenRecipe:
            _refuse("recipe_unknown")
        if any(type(x) is not bytes for x in (original.record_bytes, original.result_bytes, original.receipt_bytes)):
            _refuse("original_bytes_type")
        if recipe.verify_original(original) is not True:
            _refuse("original_verification")
        if disclose(original.binding) is not True:
            _refuse("current_disclosure")
        return original


def self_test(corpus: Path, *, scope: str = "all") -> dict:
    from pm_event_numbers_corpus import run_corpus
    return run_corpus(corpus, scope=scope)


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--self-test", action="store_true", required=True)
    parser.add_argument("--corpus", type=Path, default=Path(__file__).resolve().parents[1] / "Plans/event_number_recipe_corpus.json")
    parser.add_argument("--scope", choices=("all", "numbers"), default="all",
                        help="numbers: number cases and owner checks only, importing no date-time code")
    args = parser.parse_args()
    result = self_test(args.corpus, scope=args.scope)
    print(json.dumps(result, indent=2, sort_keys=True))
    return 0 if result["status"] == "pass" else 1


if __name__ == "__main__":
    raise SystemExit(main())
