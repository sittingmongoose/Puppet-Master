#!/usr/bin/env python3
"""Static checks for the Home4 slot and receipt contract (SP-400, Plans/storage-plan.md).

Validates Plans/home_layout_v2_slot_receipt_fixtures.json against
Plans/home_layout_v2_slot_receipt.schema.json and the semantic invariants I1-I11 that its
$comment lists. Every valid case must pass the schema and every invariant; every invalid case
must fail the schema (rejected_by "schema") or pass the schema and fail the named invariant.

Patterns are evaluated with ECMA-262 end-of-input semantics (JSON Schema's regex dialect):
Python's `$` also matches before a final LF, so an anchored identifier pattern alone would
accept "<id>\\n". Every `$ref` reachable from the Home4 schema must resolve.

The complete stored value of each case (canonical MessagePack, contentEncoding base64 fields as
bin) is measured against its family's max_value_bytes in Plans/storage_value_registry.json
(SP-340). A value above the limit is valid only as a stored_value_ref whose payload-store object
resolves (BLAKE3, byte size, media type, SHA-256, canonical decoding) to a valid Home4 value.
Fixtures are synthetic: native codecs, payload packs, redb transactions, authentication,
durability and installation remain NOT_RUN.

usage: python3 scripts/pm_home_layout_v2_slot_receipt.py [--root <repo>]
exit 0 when every case behaves as declared, 1 otherwise.
"""
from __future__ import annotations

import argparse
import base64
import copy
import hashlib
import json
import math
import re
import struct
import sys
from pathlib import Path
from typing import Any, Iterator

from jsonschema import Draft202012Validator, ValidationError, validators
from pm_contract_formats import FormatChecker
from referencing import Registry, Resource
from referencing.exceptions import Unresolvable
from referencing.jsonschema import DRAFT202012

from pm_ds_tables import Facts
from pm_event_numbers import EVENT_VALUE, Refusal, current_integer, producer_semantic_bytes, qualified_jcs, storage_uint64, storage_value_bytes

SCHEMA = "Plans/home_layout_v2_slot_receipt.schema.json"
FIXTURES = "Plans/home_layout_v2_slot_receipt_fixtures.json"
STORAGE_REGISTRY = "Plans/storage_value_registry.json"
REFERENCED = (
    "Plans/home_layout_pending_receipt.schema.json",
    "Plans/event_record_v3.schema.json",
    "Plans/event_record.schema.json",
    "Plans/home_workspace_layout_v2.schema.json",
    "Plans/event_payloads/workspace_layout_changed_v2.schema.json",
    "Plans/event_payloads/workspace_layout_changed.schema.json",
    "Plans/application_workflow_contracts.schema.json",
    "Plans/shared_integration_runtime.schema.json",
)
INLINE_LIMIT = 16384  # per-field inline source bytes (SP-273, SP-337)
FAMILY = {"transaction_slot": "home_layout_transaction_slot", "operation_receipt": "home_layout_operation_receipt"}
SCHEMA_ID = {"transaction_slot": "pm.storage_value.home_layout_transaction_slot.v1",
             "operation_receipt": "pm.storage_value.home_layout_operation_receipt.v1"}
DEFINITION_OF = {v: k for k, v in SCHEMA_ID.items()}
VALUE_MEDIA_TYPE = "application/msgpack"
SOURCE_MEDIA_TYPE = "application/json"  # the fixtures' synthetic Home source adapter
HEX64 = re.compile(r"[0-9a-f]{64}")
OWNER_RESULT_REF = {
    "path": SCHEMA,
    "json_pointer": "#/$defs/owner_result",
    "schema_id": "pm.home_layout_owner_result.v1",
}
APPLIED = {"prepared", "committed"}


def sha(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def canonical_json(value: Any) -> bytes:
    """RFC 8785 (CV-1100's shared qualified_jcs) for the SP-273 operation digest and the CV-333 owner-result hash.

    An input the JCS route cannot represent raises Refusal; the checkers observe that as
    a refusal row before any hash comparison.
    """
    return qualified_jcs(value)


def source_json(value: Any) -> bytes:
    """The fixtures' synthetic Home source adapter bytes (application/json, sorted keys, exact integers).

    A separately owned synthetic adapter encoding, not an RFC 8785 recipe: it keeps a float's
    JSON spelling so a decoded source keeps its exact numeric type.
    """
    with exact_digits():
        return json.dumps(value, sort_keys=True, separators=(",", ":"), ensure_ascii=False).encode()


def jcs_or_none(value: Any) -> bytes | None:
    try:
        return qualified_jcs(value)
    except Refusal:
        return None


def event_value_or_none(value: Any) -> bytes | None:
    """SP-236/SP-1100 EventRecord physical bytes, or None when the physical route is unavailable."""
    try:
        return storage_value_bytes(value, profile=EVENT_VALUE)
    except Refusal:
        return None


# SP-1100's owner-declared Storage uint64 fields (sequence/generation/offset/count/byte size) that the
# DS checkpoint and envelope values carry; each stays exact 0..2^64-1 (storage_uint64).
STORAGE_UINT64_FIELDS = frozenset((
    "sequence_id", "first_retained_sequence_id", "index_through_sequence_id", "last_sequence_id",
    "through_sequence_id", "byte_offset", "frame_end_offset", "durable_end_offset", "byte_size",
    "segment_generation", "selected_segment_generation", "manifest_generation", "recovery_epoch",
    "publication_revision", "frontier_revision", "retained_event_count"))


def storage_uint64_fields_ok(value: Any) -> bool:
    """Every declared Storage uint64 field present in the value is an exact SP-1100 uint64 (or null)."""
    pending = [value]
    while pending:
        node = pending.pop()
        if isinstance(node, dict):
            for key, child in node.items():
                if key in STORAGE_UINT64_FIELDS and child is not None and not isinstance(child, (dict, list)):
                    try:
                        storage_uint64(child)
                    except Refusal:
                        return False
                pending.append(child)
        elif isinstance(node, list):
            pending.extend(node)
    return True


def producer_jcs_ok(event: Any) -> bool:
    """CV-317/CV-1100: the producer semantic projection has a qualified RFC 8785 encoding (shared call)."""
    try:
        producer_semantic_bytes(event, type_sensitive_paths={("producer_sequence_id",)})
    except Refusal:
        return False
    return True


def exact_json_loads(data: bytes | str) -> Any:
    """json.loads with exact integers of any length (CV-1100 sets no global cap)."""
    previous = sys.get_int_max_str_digits()
    sys.set_int_max_str_digits(0)
    try:
        return json.loads(data)
    finally:
        sys.set_int_max_str_digits(previous)


# ---------------------------------------------------------------- BLAKE3 (unkeyed hash, 32-byte output)
_B3_IV = (0x6A09E667, 0xBB67AE85, 0x3C6EF372, 0xA54FF53A, 0x510E527F, 0x9B05688C, 0x1F83D9AB, 0x5BE0CD19)
_B3_PERM = (2, 6, 3, 10, 7, 0, 4, 13, 1, 11, 12, 5, 9, 14, 15, 8)
_CHUNK_START, _CHUNK_END, _PARENT, _ROOT = 1, 2, 4, 8
_M32 = 0xFFFFFFFF


def _b3_compress(cv: tuple[int, ...] | list[int], block: bytes, counter: int, block_len: int, flags: int) -> list[int]:
    m = list(struct.unpack("<16I", block.ljust(64, b"\0")))
    s = list(cv) + list(_B3_IV[:4]) + [counter & _M32, (counter >> 32) & _M32, block_len, flags]

    def g(a: int, b: int, c: int, d: int, x: int, y: int) -> None:
        s[a] = (s[a] + s[b] + x) & _M32
        s[d] = ((s[d] ^ s[a]) >> 16 | (s[d] ^ s[a]) << 16) & _M32
        s[c] = (s[c] + s[d]) & _M32
        s[b] = ((s[b] ^ s[c]) >> 12 | (s[b] ^ s[c]) << 20) & _M32
        s[a] = (s[a] + s[b] + y) & _M32
        s[d] = ((s[d] ^ s[a]) >> 8 | (s[d] ^ s[a]) << 24) & _M32
        s[c] = (s[c] + s[d]) & _M32
        s[b] = ((s[b] ^ s[c]) >> 7 | (s[b] ^ s[c]) << 25) & _M32

    for rnd in range(7):
        g(0, 4, 8, 12, m[0], m[1]); g(1, 5, 9, 13, m[2], m[3]); g(2, 6, 10, 14, m[4], m[5]); g(3, 7, 11, 15, m[6], m[7])
        g(0, 5, 10, 15, m[8], m[9]); g(1, 6, 11, 12, m[10], m[11]); g(2, 7, 8, 13, m[12], m[13]); g(3, 4, 9, 14, m[14], m[15])
        if rnd < 6:
            m = [m[i] for i in _B3_PERM]
    return [s[i] ^ s[i + 8] for i in range(8)] + [s[i + 8] ^ cv[i] for i in range(8)]


def blake3_hex(data: bytes) -> str:
    """BLAKE3 hash mode (unkeyed), 32-byte output, as lower-case hex."""
    chunks = [data[i:i + 1024] for i in range(0, len(data), 1024)] or [b""]
    stack: list[list[int]] = []
    for index, chunk in enumerate(chunks):
        blocks = [chunk[i:i + 64] for i in range(0, len(chunk), 64)] or [b""]
        cv: list[int] = list(_B3_IV)
        for j, block in enumerate(blocks[:-1]):
            cv = _b3_compress(cv, block, index, 64, _CHUNK_START if j == 0 else 0)[:8]
        last = blocks[-1]
        out = (cv, last, index, len(last), (_CHUNK_START if len(blocks) == 1 else 0) | _CHUNK_END)
        if index == len(chunks) - 1:
            break
        chunk_cv = _b3_compress(*out)[:8]
        total = index + 1
        while total % 2 == 0:
            chunk_cv = _b3_compress(_B3_IV, struct.pack("<8I", *stack.pop()) + struct.pack("<8I", *chunk_cv), 0, 64, _PARENT)[:8]
            total //= 2
        stack.append(chunk_cv)
    while stack:
        child = _b3_compress(*out)[:8]
        out = (list(_B3_IV), struct.pack("<8I", *stack.pop()) + struct.pack("<8I", *child), 0, 64, _PARENT)
    cv, block, counter, block_len, flags = out
    return struct.pack("<8I", *_b3_compress(cv, block, 0, block_len, flags | _ROOT)[:8]).hex()


# ---------------------------------------------------------------- canonical MessagePack
def canonical_msgpack(value: Any) -> bytes:
    """Canonical shortest MessagePack, keys ordered by UTF-8 bytes, bin for bytes.

    Integers, strings, containers and key order follow canonical_messagepack_bytes in
    scripts/pm-implementation-readiness.py; floats follow Plans/storage-plan.md's canonical
    MessagePack representation (float32 only when exact with the same sign, else float64; no
    NaN or infinity). Stored Home4 values carry their contentEncoding base64 fields as bin.
    """
    def prefix(length: int, fix_base: int, fix_limit: int, code16: int, code32: int) -> bytes:
        if length <= fix_limit:
            return bytes([fix_base | length])
        if length <= 0xFFFF:
            return bytes([code16]) + struct.pack(">H", length)
        return bytes([code32]) + struct.pack(">I", length)

    if value is None:
        return b"\xc0"
    if value is False:
        return b"\xc2"
    if value is True:
        return b"\xc3"
    if isinstance(value, int):
        if 0 <= value <= 0x7F:
            return bytes([value])
        if -32 <= value < 0:
            return bytes([value & 0xFF])
        for low, high, code, fmt in ((0, 0xFF, 0xCC, ">B"), (0, 0xFFFF, 0xCD, ">H"),
                                     (0, 0xFFFFFFFF, 0xCE, ">I"), (0, 0xFFFFFFFFFFFFFFFF, 0xCF, ">Q"),
                                     (-0x80, -33, 0xD0, ">b"), (-0x8000, -0x81, 0xD1, ">h"),
                                     (-0x80000000, -0x8001, 0xD2, ">i"),
                                     (-0x8000000000000000, -0x80000001, 0xD3, ">q")):
            if low <= value <= high:
                return bytes([code]) + struct.pack(fmt, value)
        raise ValueError("integer outside MessagePack range")
    if isinstance(value, float):
        if not math.isfinite(value):
            raise ValueError("NaN and infinity are not representable")
        try:
            single = struct.unpack(">f", struct.pack(">f", value))[0]
        except OverflowError:
            single = None
        if single == value and math.copysign(1.0, single) == math.copysign(1.0, value):
            return b"\xca" + struct.pack(">f", value)
        return b"\xcb" + struct.pack(">d", value)
    if isinstance(value, str):
        data = value.encode("utf-8")
        n = len(data)
        if n <= 31:
            return bytes([0xA0 | n]) + data
        if n <= 0xFF:
            return b"\xd9" + struct.pack(">B", n) + data
        if n <= 0xFFFF:
            return b"\xda" + struct.pack(">H", n) + data
        return b"\xdb" + struct.pack(">I", n) + data
    if isinstance(value, (bytes, bytearray)):
        n = len(value)
        if n <= 0xFF:
            return b"\xc4" + struct.pack(">B", n) + bytes(value)
        if n <= 0xFFFF:
            return b"\xc5" + struct.pack(">H", n) + bytes(value)
        return b"\xc6" + struct.pack(">I", n) + bytes(value)
    if isinstance(value, list):
        return prefix(len(value), 0x90, 15, 0xDC, 0xDD) + b"".join(canonical_msgpack(v) for v in value)
    if isinstance(value, dict):
        items = sorted(value.items(), key=lambda kv: kv[0].encode("utf-8"))
        return prefix(len(items), 0x80, 15, 0xDE, 0xDF) + b"".join(
            canonical_msgpack(k) + canonical_msgpack(v) for k, v in items)
    raise ValueError(f"unsupported value type {type(value).__name__}")


def decode_canonical_msgpack(data: bytes) -> Any:
    """Decode one MessagePack value and require that it is exactly the canonical encoding."""
    pos = 0

    def take(n: int) -> bytes:
        nonlocal pos
        if pos + n > len(data):
            raise ValueError("truncated MessagePack value")
        chunk = data[pos:pos + n]
        pos += n
        return chunk

    def one() -> Any:
        b = take(1)[0]
        if b <= 0x7F:
            return b
        if b >= 0xE0:
            return b - 0x100
        if 0x80 <= b <= 0x8F:
            return mapping(b & 0x0F)
        if 0x90 <= b <= 0x9F:
            return [one() for _ in range(b & 0x0F)]
        if 0xA0 <= b <= 0xBF:
            return take(b & 0x1F).decode("utf-8")
        simple = {0xC0: None, 0xC2: False, 0xC3: True}
        if b in simple:
            return simple[b]
        sized = {0xC4: (">B", "bin"), 0xC5: (">H", "bin"), 0xC6: (">I", "bin"),
                 0xD9: (">B", "str"), 0xDA: (">H", "str"), 0xDB: (">I", "str"),
                 0xDC: (">H", "arr"), 0xDD: (">I", "arr"), 0xDE: (">H", "map"), 0xDF: (">I", "map")}
        if b in sized:
            fmt, kind = sized[b]
            n = struct.unpack(fmt, take(struct.calcsize(fmt)))[0]
            if kind == "bin":
                return take(n)
            if kind == "str":
                return take(n).decode("utf-8")
            if kind == "arr":
                return [one() for _ in range(n)]
            return mapping(n)
        fixed = {0xCA: ">f", 0xCB: ">d", 0xCC: ">B", 0xCD: ">H", 0xCE: ">I", 0xCF: ">Q",
                 0xD0: ">b", 0xD1: ">h", 0xD2: ">i", 0xD3: ">q"}
        if b in fixed:
            return struct.unpack(fixed[b], take(struct.calcsize(fixed[b])))[0]
        raise ValueError(f"MessagePack tag 0x{b:02x} is not allowed in a Home4 value")

    def mapping(n: int) -> dict[str, Any]:
        out: dict[str, Any] = {}
        for _ in range(n):
            key = one()
            if not isinstance(key, str):
                raise ValueError("MessagePack map key is not a string")
            if key in out:
                raise ValueError(f"duplicate MessagePack map key {key!r}")
            out[key] = one()
        return out

    value = one()
    if pos != len(data):
        raise ValueError("trailing bytes after the MessagePack value")
    if canonical_msgpack(value) != data:
        raise ValueError("bytes are not the canonical MessagePack encoding of their value")
    return value


# ---------------------------------------------------------------- stored form of a JSON projection
def bin_paths(definition: str, value: dict[str, Any]) -> list[tuple[str, ...]]:
    """Paths of the contentEncoding base64 fields, which the stored value carries as bin."""
    paths: list[tuple[str, ...]] = []
    if definition == "transaction_slot":
        for name in ("prior_layout_source_bytes", "candidate_layout_source_bytes"):
            src = value.get(name)
            if isinstance(src, dict) and src.get("form") == "inline":
                paths.append((name, "bytes"))
        prior = value.get("prior_migration_generation")
        if isinstance(prior, dict):
            paths.append(("prior_migration_generation", "core_bytes"))
    elif definition == "operation_receipt":
        captured = value.get("identity_capture_bytes") or {}
        for key in ("normalized_request", "command_outcome", "ui_response"):
            if captured.get(key) is not None:
                paths.append(("identity_capture_bytes", key))
    return paths


def to_stored(definition: str, value: dict[str, Any]) -> dict[str, Any]:
    stored = copy.deepcopy(value)
    for path in bin_paths(definition, value):
        holder = stored
        for part in path[:-1]:
            holder = holder[part]
        holder[path[-1]] = base64.b64decode(holder[path[-1]], validate=True)
    return stored


def to_projection(value: Any) -> Any:
    if isinstance(value, bytes):
        return base64.b64encode(value).decode("ascii")
    if isinstance(value, list):
        return [to_projection(v) for v in value]
    if isinstance(value, dict):
        return {k: to_projection(v) for k, v in value.items()}
    return value


def stored_bytes(definition: str, value: dict[str, Any]) -> bytes:
    """SP-400's own stored-value codec: canonical MessagePack with contentEncoding base64 fields as bin."""
    return canonical_msgpack(to_stored(definition, value))


def msgpack_or_none(value: Any) -> bytes | None:
    try:
        return canonical_msgpack(value)
    except (ValueError, UnicodeEncodeError):
        return None


# ---------------------------------------------------------------- regex dialect and $ref closure
def ecma_regex(pattern: str) -> str:
    """Translate an ECMA-262 pattern's unescaped `$` (outside a class) to Python's end of input."""
    out, escaped, in_class = [], False, False
    for ch in pattern:
        if escaped:
            out.append(ch)
            escaped = False
        elif ch == "\\":
            out.append(ch)
            escaped = True
        elif in_class:
            out.append(ch)
            in_class = ch != "]"
        elif ch == "[":
            out.append(ch)
            in_class = True
        elif ch == "$":
            out.append(r"(?![\s\S])")
        else:
            out.append(ch)
    return "".join(out)


def _ecma_pattern(validator: Any, pattern: str, instance: Any, schema: dict[str, Any]) -> Iterator[ValidationError]:
    if validator.is_type(instance, "string") and not re.search(ecma_regex(pattern), instance):
        yield ValidationError(f"{instance!r} does not match {pattern!r} (ECMA-262 end of input)")


def _current_integer(checker: Any, instance: Any) -> bool:
    """CV-1100 current integer slot: the shared current_integer (an exact integer, never a bool or runtime float).

    Applied at every schema integer slot, nested slots included; each slot's own minimum and
    maximum stay the schema's. A number slot keeps the stock rule: a float keeps its float type.
    """
    try:
        current_integer(instance)
    except Refusal:
        return False
    return True


class exact_digits:
    """Scoped, restored int_max_str_digits(0): a valid integer of any length (CV-1100 sets no global cap)
    never crashes a check while jsonschema formats its message; no value changes."""

    def __enter__(self):
        self.previous = sys.get_int_max_str_digits()
        sys.set_int_max_str_digits(0)

    def __exit__(self, *exc):
        sys.set_int_max_str_digits(self.previous)
        return False


class _ExactDigitValidator:
    """A jsonschema validator whose every validation runs under exact_digits (errors materialized inside)."""

    def __init__(self, inner):
        self._inner = inner

    def is_valid(self, instance, *args):
        with exact_digits():
            return self._inner.is_valid(instance, *args)

    def iter_errors(self, instance, *args):
        with exact_digits():
            return iter(list(self._inner.iter_errors(instance, *args)))

    def validate(self, instance, *args):
        with exact_digits():
            return self._inner.validate(instance, *args)

    def evolve(self, **changes):
        return _ExactDigitValidator(self._inner.evolve(**changes))

    def __getattr__(self, name):
        if name == "_inner" or name.startswith("__"):
            raise AttributeError(name)
        return getattr(self._inner, name)


class _ExactDigitFactory:
    """Callable like the validator class; class attributes (check_schema, VALIDATORS, ...) pass through."""

    def __init__(self, cls):
        self.cls = cls

    def __call__(self, *args, **kwargs):
        return _ExactDigitValidator(self.cls(*args, **kwargs))

    def check_schema(self, schema):
        with exact_digits():
            return self.cls.check_schema(schema)

    def __getattr__(self, name):
        if name == "cls" or name.startswith("__"):
            raise AttributeError(name)
        return getattr(self.cls, name)


_Home4Class = validators.extend(Draft202012Validator, {"pattern": _ecma_pattern},
                                type_checker=Draft202012Validator.TYPE_CHECKER.redefine("integer", _current_integer))
# Retained bodies keep their originally admitted numeric domain (the stock JSON Schema integer)
# and exact bytes. This reader class never authorizes a current append or computes replacement pins.
_RetainedClass = validators.extend(_Home4Class, type_checker=Draft202012Validator.TYPE_CHECKER)
Home4Validator = _ExactDigitFactory(_Home4Class)
RetainedBodyValidator = _ExactDigitFactory(_RetainedClass)


def ref_closure(registry: Registry, root_uri: str) -> tuple[int, int, list[str]]:
    """Resolve every $ref reachable from the root schema; returns (refs, patterns, unresolved)."""
    seen: set[tuple[str, int]] = set()
    unresolved: list[str] = []
    refs = patterns = 0
    root = registry.resolver().lookup(root_uri)
    work: list[tuple[Any, Any]] = [(root.resolver, root.contents)]
    while work:
        resolver, node = work.pop()
        if isinstance(node, list):
            work.extend((resolver, item) for item in node)
            continue
        if not isinstance(node, dict) or (resolver._base_uri, id(node)) in seen:  # noqa: SLF001
            continue
        seen.add((resolver._base_uri, id(node)))  # noqa: SLF001
        if isinstance(node.get("$id"), str):
            resolver = resolver.in_subresource(Resource(contents=node, specification=DRAFT202012))
        if isinstance(node.get("pattern"), str):
            patterns += 1
        if isinstance(node.get("$ref"), str):
            refs += 1
            try:
                hit = resolver.lookup(node["$ref"])
            except Unresolvable as exc:
                unresolved.append(f"{resolver._base_uri} -> {node['$ref']}: {exc}")  # noqa: SLF001
            else:
                work.append((hit.resolver, hit.contents))
        for key, sub in node.items():
            if key in ("const", "enum", "examples", "default", "$comment", "description"):
                continue
            if isinstance(sub, (dict, list)):
                work.append((resolver, sub))
    return refs, patterns, unresolved


# ---------------------------------------------------------------- payload store
def refuse_remote(uri: str) -> Resource:
    raise Unresolvable(uri)


class PayloadStore:
    """Synthetic SP-337 payload store: BLAKE3 id -> (media type, bytes)."""

    def __init__(self, objects: dict[str, tuple[str, bytes]]):
        self.objects = objects

    @classmethod
    def from_fixture(cls, entries: list[dict[str, Any]]) -> "PayloadStore":
        objects: dict[str, tuple[str, bytes]] = {}
        for entry in entries:
            if entry["blake3_id"] in objects:
                raise ValueError(f"duplicate payload_store id {entry['blake3_id']}")
            objects[entry["blake3_id"]] = (entry["media_type"], base64.b64decode(entry["bytes"], validate=True))
        return cls(objects)

    def apply(self, ops: list[dict[str, Any]]) -> "PayloadStore":
        objects = dict(self.objects)
        for op in ops:
            ident = op["blake3_id"]
            if op["op"] == "remove":
                del objects[ident]
            elif op["op"] == "flip_byte":
                media, data = objects[ident]
                buf = bytearray(data)
                buf[op["offset"]] ^= 0x01
                objects[ident] = (media, bytes(buf))
            elif op["op"] == "set_media_type":
                objects[ident] = (op["media_type"], objects[ident][1])
            elif op["op"] == "put_derived":
                derive = op["derive"]
                definition = derive["definition"]
                base = to_projection(decode_canonical_msgpack(objects[derive["from"]][1]))
                value = to_stored(definition, apply_ops(base, derive["value_ops"]))
                data = canonical_msgpack(value)
                if derive.get("encoding") == "top_level_keys_reversed":
                    items = sorted(value.items(), key=lambda kv: kv[0].encode("utf-8"), reverse=True)
                    head = bytes([0x80 | len(items)]) if len(items) <= 15 else b"\xde" + struct.pack(">H", len(items))
                    data = head + b"".join(canonical_msgpack(k) + canonical_msgpack(v) for k, v in items)
                if blake3_hex(data) != ident:
                    raise ValueError(f"put_derived declares {ident} but its bytes hash to {blake3_hex(data)}")
                objects[ident] = (op["media_type"], data)
            else:
                raise ValueError(f"unknown payload_store op {op['op']}")
        return PayloadStore(objects)

    def resolve(self, err: list[str], ref: dict[str, Any], what: str) -> bytes | None:
        ident = ref["blake3_id"]
        ids = Facts("h4_store_id", chain=True)
        if ids.stop("H4P01_id_hex64", lambda: isinstance(ident, str) and HEX64.fullmatch(ident) is not None):
            err.append(f"I11 {what} blake3_id is not exactly 64 lower-case hex characters")
            return None
        if ids.stop("H4P02_object_exists", lambda: ident in self.objects):
            err.append(f"I11 {what} names a payload-store object that does not exist")
            return None
        ids.done()
        media, data = self.objects[ident]
        claims = Facts("h4_store_object")
        claims["H4P03_hash"] = blake3_hex(data) == ident
        claims["H4P04_size"] = len(data) == ref["byte_size"]
        claims["H4P05_media"] = media == ref["media_type"]
        message = {"H4P03_hash": f"I11 {what} object bytes do not hash to its BLAKE3 id",
                   "H4P04_size": f"I11 {what} byte_size {ref['byte_size']} differs from the object's {len(data)} bytes",
                   "H4P05_media": f"I11 {what} media_type differs from the object's"}
        refused = claims.rows()
        err.extend(message[row] for row in refused)
        return data if not refused else None


EMPTY_STORE = PayloadStore({})


# ---------------------------------------------------------------- invariants
def apply_ops(base: Any, ops: list[dict[str, Any]]) -> Any:
    value = copy.deepcopy(base)
    for op in ops:
        parts = [p.replace("~1", "/").replace("~0", "~") for p in op["path"].lstrip("/").split("/")]
        target = value
        for part in parts[:-1]:
            target = target[int(part)] if isinstance(target, list) else target[part]
        last = parts[-1]
        if op["op"] == "remove":
            del target[int(last) if isinstance(target, list) else last]
        elif op["op"] in ("replace", "add"):
            if isinstance(target, list):
                if op["op"] == "add":
                    target.insert(len(target) if last == "-" else int(last), op["value"])
                else:
                    target[int(last)] = op["value"]
            else:
                target[last] = op["value"]
        else:
            raise ValueError(f"unknown op {op['op']}")
    return value


def digest(binding: dict[str, Any]) -> str:
    return sha(canonical_json([binding["storage_instance_id"], binding["project_id"],
                               binding["workspace_tab_id"], binding["command_instance_id"]]))


def layout_key(binding: dict[str, Any]) -> str:
    return f"home_workspace_layout.v2:{binding['project_id']}:{binding['workspace_tab_id']}"


def logical_key(definition: str, value: dict[str, Any]) -> str:
    if definition == "transaction_slot":
        return f"home_layout_transaction_slot.v1:{value['project_id']}:{value['workspace_tab_id']}"
    b = value["binding"]
    return f"home_layout_operation_receipt.v1:{b['project_id']}:{b['workspace_tab_id']}:{b['operation_digest']}"


def storage_instance(definition: str, value: dict[str, Any]) -> str:
    return value["storage_instance_id"] if definition == "transaction_slot" else value["binding"]["storage_instance_id"]


def value_limit_check(err: list[str], definition: str, value: dict[str, Any], limit: int, by_reference: bool) -> None:
    encoded: dict[str, Any] = {}

    def encodable() -> bool:
        try:
            encoded["bytes"] = stored_bytes(definition, value)
        except ValueError:
            return False
        return True

    codec = Facts("h4_value_codec", chain=True)
    if codec.stop("H4L00_stored_encoding", encodable):
        err.append("I10 the complete stored value has no canonical MessagePack encoding (SP-1100 integer range)")
        return
    codec.done()
    size = len(encoded["bytes"])
    facts = Facts("h4_value_limit")
    facts["H4L01_reference_over_limit"] = not by_reference or size > limit
    facts["H4L02_inline_within_limit"] = by_reference or size <= limit
    for row in facts.rows():
        if row == "H4L01_reference_over_limit":
            err.append(f"I10 a {size}-byte value is within the {limit}-byte limit and is stored inline, never by reference")
        else:
            err.append(f"I10 the complete stored value is {size} bytes, over the {FAMILY[definition]} limit of {limit}; "
                       "it is stored only by reference")

def layout_history_context_errors(ev: Any, source: Any, custody: Any) -> list[str]:
    """Check the retained adapter observation; caller metadata selects no recipe.

    Original bytes/recipe and their commitment belong to the verified reader and
    checkpoint adapter, like its source/access flags. This synthetic oracle does
    not authenticate a native Storage frame or receipt.
    """
    facts = Facts("h4_history", chain=True)
    for row, check in (
            ("H4H01_custody_object", lambda: isinstance(custody, dict)),
            ("H4H02_source_verified", lambda: custody.get("source_verified") is True),
            ("H4H03_access_allowed", lambda: custody.get("access_allowed") is True),
            ("H4H04_deletion_allows_audit", lambda: custody.get("deletion_allows_audit") is True),
            ("H4H05_read_token_valid", lambda: custody.get("checkpoint_read_token_valid") is True),
            ("H4H06_source_object", lambda: isinstance(source, dict)),
            ("H4H07_source_fields", lambda: set(source) == {"event_bytes", "payload_validation_recipe"}),
            ("H4H08_event_bytes_type", lambda: type(source["event_bytes"]) is bytes),
            ("H4H09_recipe_known", lambda: source["payload_validation_recipe"] in (
                "workspace-layout-v2/original-json-schema", "workspace-layout-v2/typed-integer")),
            ("H4H10_source_commitment", lambda: custody.get("retained_source_sha256") == sha(canonical_msgpack(source))),
            ("H4H11_source_event", lambda: source["event_bytes"] == event_value_or_none(ev))):
        if facts.stop(row, check):
            return [facts.first_code()]
    facts.done()
    return []

def event_checks(err: list[str], ev: dict[str, Any], binding: dict[str, Any], d: str,
                 store: PayloadStore = EMPTY_STORE, *, historical: bool = False,
                 historical_source: Any = None, custody: Any = None) -> dict[str, Any]:
    import pm_event_payload_route as body_route
    context = Facts("h4_event_context", chain=True)
    if context.stop("H4E01_historical_bool", lambda: type(historical) is bool):
        err.append(context.first_code())
        return {}
    context.done()
    if historical:
        history_errors = layout_history_context_errors(ev, historical_source, custody)
        if history_errors:
            err.extend(history_errors)
            return {}
    # Home4 stored values also carry the explicitly retained 2.0.0 event form.
    # This chooses its physical decoder only; it never relaxes payload typing.
    payload, route_errors = body_route.resolved_body(ev, store.objects,
        historical=historical or ev.get('schema_version') == '2.0.0')
    err.extend("I12 " + e for e in route_errors)
    if payload is None:
        return {}
    schema = load(Path(__file__).resolve().parents[1], "Plans/event_payloads/workspace_layout_changed_v2.schema.json")
    selected = body_route.validator(schema)
    if historical and historical_source['payload_validation_recipe'] == 'workspace-layout-v2/original-json-schema':
        selected = RetainedBodyValidator(schema, registry=selected._registry, format_checker=FormatChecker())
    shape = Facts("h4_event_payload", chain=True)
    if shape.stop("H4E02_payload_schema", lambda: selected.is_valid(payload)):
        err.append(shape.first_code())
        return {}
    shape.done()
    joins = Facts("h4_event_joins")
    joins["H4J01_command"] = payload["command_id"] == binding["command_id"]
    joins["H4J02_event_project"] = ev["project_id"] == binding["project_id"]
    joins["H4J03_payload_project"] = payload["project_id"] == binding["project_id"]
    joins["H4J04_payload_tab"] = payload["workspace_tab_id"] == binding["workspace_tab_id"]
    joins["H4J05_prior_revision"] = payload["prior_layout_revision"] == binding["expected_layout_revision"]
    joins["H4J06_new_revision"] = payload["new_layout_revision"] == binding["expected_layout_revision"] + 1
    joins["H4J07_producer_sequence"] = ev["producer_sequence_id"] == payload["new_layout_revision"]
    joins["H4J08_payload_correlation"] = payload["correlation_id"] == binding["correlation_id"]
    joins["H4J09_event_correlation"] = ev["correlation_id"] == binding["correlation_id"]
    joins["H4J10_interaction"] = payload["interaction_transaction_id"] == binding["interaction_transaction_id"]
    joins["H4J11_event_id"] = ev["event_id"] == "evt_workspace_layout_" + d
    joins["H4J12_idempotency_key"] = ev["idempotency_key"] == "workspace.layout_changed:" + d
    joins["H4J13_actor"] = ev["actor_ref"] == binding["actor_ref"]
    err.extend(joins.codes())
    return payload

def binding_checks(err: list[str], binding: dict[str, Any]) -> str:
    d = digest(binding)
    facts = Facts("h4_binding")
    facts["H4B01_operation_digest"] = binding["operation_digest"] == d
    facts["H4B02_operation_ref"] = binding["operation_ref"] == "home_layout_operation:" + d
    err.extend(facts.codes())
    return d

def same_typed_value(left: Any, right: Any) -> bool:
    """Exact decoded JSON domain, including Boolean/integer/float distinctions."""
    if type(left) is not type(right):
        return False
    if isinstance(left, dict):
        return left.keys() == right.keys() and all(same_typed_value(left[k], right[k]) for k in left)
    if isinstance(left, list):
        return len(left) == len(right) and all(same_typed_value(a, b) for a, b in zip(left, right))
    return left == right


def source_bytes_check(err: list[str], name: str, holder: dict[str, Any], layout: Any, layout_sha: Any,
                       store: PayloadStore) -> None:
    src = holder[name]
    if src is None:
        return
    size = Facts("h4_source_size")
    if src["form"] == "inline":
        data = base64.b64decode(src["bytes"], validate=True)
        size["H4SB01_inline_within_limit"] = len(data) <= INLINE_LIMIT
        size["H4SB02_reference_over_limit"] = True
        media = SOURCE_MEDIA_TYPE
    else:
        size["H4SB01_inline_within_limit"] = True
        size["H4SB02_reference_over_limit"] = src["byte_size"] > INLINE_LIMIT
    for row in size.rows():
        err.append(f"I6 {name} inline bytes exceed 16 KiB; a payload_ref is required" if row == "H4SB01_inline_within_limit"
                   else f"I6 {name} payload_ref names {src['byte_size']} bytes; bytes within 16 KiB are inline")
    if src["form"] != "inline":
        resolved = store.resolve(err, src, name)
        if resolved is None:
            return
        data, media = resolved, src["media_type"]
    decoded = None
    if media == SOURCE_MEDIA_TYPE:
        try:
            decoded = exact_json_loads(data.decode("utf-8"))
        except (UnicodeDecodeError, json.JSONDecodeError):
            decoded = None
    # The expected layout already passed the exact Home4 schema. Type-first
    # complete equality checks the source in that same domain, without rewriting
    # either original bytes or their physical hashes.
    content = Facts("h4_source_content")
    content["H4SB03_sha_matches_layout"] = sha(data) == layout_sha
    content["H4SB04_decodes_to_layout"] = same_typed_value(decoded, layout)
    for row in content.rows():
        err.append(f"I6 {name} SHA-256 differs from the layout hash" if row == "H4SB03_sha_matches_layout"
                   else f"I6 {name} does not decode to the decoded layout (synthetic adapter)")

def slot_invariants(slot: dict[str, Any], store: PayloadStore = EMPTY_STORE, limit: int = INLINE_LIMIT,
                    by_reference: bool = False) -> list[str]:
    err: list[str] = []
    value_limit_check(err, "transaction_slot", slot, limit, by_reference)
    prior = slot.get("prior_migration_generation")
    if prior is not None:
        mg = slot["migration_generation"]
        core = prior["core"]
        data = base64.b64decode(prior["core_bytes"], validate=True)
        key = f"home_layout_transaction_slot.v1:{slot['project_id']}:{slot['workspace_tab_id']}"
        wrapper = Facts("h4_slot_migration")
        wrapper["H4M01_core_bytes_canonical"] = data == msgpack_or_none(core)
        wrapper["H4M02_core_sha"] = prior["core_sha256"] == sha(data)
        wrapper["H4M03_logical_key"] = prior["logical_key"] == key
        wrapper["H4M04_wrapper_storage"] = prior["storage_instance_id"] == slot["storage_instance_id"]
        wrapper["H4M05_core_storage"] = core["storage_instance_id"] == slot["storage_instance_id"]
        wrapper["H4M06_core_project"] = core["project_id"] == slot["project_id"]
        wrapper["H4M07_core_tab"] = core["workspace_tab_id"] == slot["workspace_tab_id"]
        wrapper["H4M08_successor_generation"] = prior["successor_generation_id"] == mg["generation_id"]
        wrapper["H4M09_successor_migration"] = prior["successor_migration_id"] == mg["migration_id"]
        wrapper["H4M10_successor_completed"] = prior["successor_migration_completed_at_utc"] == mg["migration_completed_at_utc"]
        wrapper["H4M11_successor_receipt_key"] = prior["successor_migration_receipt_key"] == mg["migration_receipt_key"]
        wrapper["H4M12_successor_receipt_sha"] = prior["successor_migration_receipt_sha256"] == mg["migration_receipt_sha256"]
        err.extend(wrapper.codes())
    binding = slot["binding"]
    if binding is None:
        return err
    d = binding_checks(err, binding)
    scope = Facts("h4_slot_scope")
    scope["H4X01_binding_storage"] = binding["storage_instance_id"] == slot["storage_instance_id"]
    scope["H4X02_binding_project"] = binding["project_id"] == slot["project_id"]
    scope["H4X03_binding_tab"] = binding["workspace_tab_id"] == slot["workspace_tab_id"]
    scope["H4X04_prior_layout_project"] = slot["prior_layout"]["project_id"] == slot["project_id"]
    scope["H4X05_prior_layout_tab"] = slot["prior_layout"]["workspace_tab_id"] == slot["workspace_tab_id"]
    scope["H4X06_candidate_layout_project"] = slot["candidate_layout"]["project_id"] == slot["project_id"]
    scope["H4X07_candidate_layout_tab"] = slot["candidate_layout"]["workspace_tab_id"] == slot["workspace_tab_id"]
    scope["H4X08_prior_revision"] = slot["prior_layout"]["revision"] == binding["expected_layout_revision"]
    scope["H4X09_candidate_revision"] = slot["candidate_layout"]["revision"] == binding["expected_layout_revision"] + 1
    err.extend(scope.codes())
    source_bytes_check(err, "prior_layout_source_bytes", slot, slot["prior_layout"], slot["prior_layout_sha256"], store)
    source_bytes_check(err, "candidate_layout_source_bytes", slot, slot["candidate_layout"], slot["candidate_layout_sha256"], store)
    custody = slot.get("pending_sir_custody")
    rb = slot["readback"]
    readback = Facts("h4_slot_readback")
    readback["H4X10_custody_command"] = (custody is None or
        custody["original_source"]["normalized_request"]["command_id"] == binding["command_id"])
    readback["H4X11_readback_key"] = rb is None or rb["canonical_key"] == layout_key(binding)
    readback["H4X12_readback_revision"] = rb is None or rb["layout_revision"] == slot["candidate_layout"]["revision"]
    readback["H4X13_readback_sha"] = rb is None or rb["layout_sha256"] == slot["candidate_layout_sha256"]
    err.extend(readback.codes())
    ev = slot["event_semantics"]
    if ev is not None:
        event_checks(err, ev, binding, d, store)
    return err

def receipt_invariants(r: dict[str, Any], store: PayloadStore = EMPTY_STORE, limit: int = INLINE_LIMIT,
                       by_reference: bool = False) -> list[str]:
    err: list[str] = []
    value_limit_check(err, "operation_receipt", r, limit, by_reference)
    b = r["binding"]
    d = binding_checks(err, b)
    o, dr = r["owner_result"], r["dispatch_receipt"]
    outcome, response = r["original_command_outcome"], r["original_ui_response"]
    applied = r["state"] in APPLIED
    edge = b["expected_layout_revision"] + 1
    head = Facts("h4_receipt_head")
    head["H4RC01_owner_command"] = o["command_id"] == b["command_id"]
    head["H4RC02_request_command"] = r["original_normalized_request"]["command_id"] == b["command_id"]
    head["H4RC03_outcome_command"] = outcome is None or outcome["command_id"] == b["command_id"]
    head["H4RC04_response_command"] = response is None or response["command_id"] == b["command_id"]
    head["H4RC05_receipt_prior"] = r["prior_layout_revision"] == b["expected_layout_revision"]
    head["H4RC06_owner_prior"] = o["prior_layout_revision"] == b["expected_layout_revision"]
    head["H4RC07_receipt_new"] = not applied or r["new_layout_revision"] == edge
    head["H4RC08_owner_new"] = not applied or o["new_layout_revision"] == edge
    head["H4RC09_readback_revision"] = not applied or r["readback"]["layout_revision"] == edge
    head["H4RC10_readback_key"] = not applied or r["readback"]["canonical_key"] == layout_key(b)
    head["H4RC11_settled_sha"] = not applied or r["readback"]["layout_sha256"] == r["settled_layout_sha256"]
    head["H4RC12_settled_ref"] = not applied or r["settled_layout_ref"] == "home_layout_settlement:" + d
    head["H4RC13_owner_operation_ref"] = o["operation_ref"] == b["operation_ref"]
    head["H4RC14_owner_result_ref"] = o["result_ref"] == "home_layout_result:" + d
    head["H4RC15_dispatch_receipt_ref"] = dr["receipt_ref"] == "home_layout_dispatch_receipt:" + d
    head["H4RC16_dispatch_operation_ref"] = dr["operation_ref"] == b["operation_ref"]
    head["H4RC17_dispatch_result"] = dr["command_result_ref"] == o["result_ref"]
    head["H4RC18_dispatch_correlation"] = dr["correlation_id"] == b["correlation_id"]
    head["H4RC19_dispatch_ref"] = dr["dispatch_ref"] == b["dispatch_ref"]
    err.extend(head.codes())
    ev = r["event_semantics"]
    if ev is not None:
        payload = event_checks(err, ev, b, d, store)
        if not payload:
            return err
        committed = r["state"] == "committed"
        joins = Facts("h4_receipt_event")
        joins["H4RE01_result_ref"] = payload["command_result_ref"] == o["result_ref"]
        joins["H4RE02_receipt_refs"] = payload["receipt_refs"] == [dr["receipt_ref"]]
        joins["H4RE03_settled_ref"] = payload["settled_layout_ref"] == r["settled_layout_ref"]
        joins["H4RE04_owner_event_ref"] = not committed or o["event_ref"] == ev["event_id"]
        joins["H4RE05_dispatch_event_ref"] = not committed or dr["event_ref"] == ev["event_id"]
        err.extend(joins.codes())
    capture = Facts("h4_receipt_capture")
    for key, original, rows in (
            ("normalized_request", r["original_normalized_request"], ("H4IC01_request_presence", "H4IC02_request_canonical", "H4IC03_request_sha")),
            ("command_outcome", outcome, ("H4IC04_outcome_presence", "H4IC05_outcome_canonical", "H4IC06_outcome_sha")),
            ("ui_response", response, ("H4IC07_response_presence", "H4IC08_response_canonical", "H4IC09_response_sha"))):
        captured = r["identity_capture_bytes"][key]
        digest_claim = r["identity_capture_bytes_sha256"][key]
        if original is None or captured is None:
            capture[rows[0]] = original is None and captured is None and digest_claim is None
            capture[rows[1]] = True
            capture[rows[2]] = True
            continue
        data = base64.b64decode(captured, validate=True)
        capture[rows[0]] = True
        capture[rows[1]] = data == msgpack_or_none(original)
        capture[rows[2]] = digest_claim == sha(data)
    err.extend(capture.codes())
    owner = Facts("h4_receipt_owner")
    owner["H4O01_outcome_schema_ref"] = outcome is None or outcome["owner_result_schema_ref"] == OWNER_RESULT_REF
    owner["H4O02_outcome_hash"] = outcome is None or outcome["owner_result_sha256"] == r["original_owner_result_sha256"]
    owner_jcs = jcs_or_none(o) if outcome is not None else None
    owner["H4O03_owner_result_jcs"] = outcome is None or owner_jcs is not None
    owner["H4O04_receipt_hash"] = outcome is None or owner_jcs is None or r["original_owner_result_sha256"] == sha(owner_jcs)
    owner["H4O05_response_schema_ref"] = response is None or response.get("owner_result_schema_ref") in (None, OWNER_RESULT_REF)
    err.extend(owner.codes())
    return err

class Checker:
    def __init__(self, root: Path):
        self.root = root
        self.schema = load(root, SCHEMA)
        Draft202012Validator.check_schema(self.schema)
        registry = Registry(retrieve=refuse_remote)
        for rel in (SCHEMA,) + REFERENCED:
            doc = load(root, rel)
            resource = Resource.from_contents(doc)
            # Each document under its $id and its repository retrieval URI, as
            # Plans/application_workflow_source_graph.json names them; never the network.
            for uri in dict.fromkeys((doc["$id"], "https://puppetmaster.local/" + rel)):
                registry = registry.with_resource(uri, resource)
        self.registry = registry
        self.refs, self.patterns, self.unresolved = ref_closure(registry, self.schema["$id"])
        self.validators = {name: Home4Validator({"$ref": self.schema["$id"] + "#/$defs/" + name},
                                                registry=registry, format_checker=FormatChecker())
                           for name in ("transaction_slot", "operation_receipt", "prior_slot_migration_generation",
                                        "stored_value_ref")}
        profile = load(root, STORAGE_REGISTRY)["storage_profile"]
        self.limits = {d: profile["family_profiles"][f]["max_value_bytes"] for d, f in FAMILY.items()}
        self.store_cap = profile["value_limit_bytes"]

    def schema_messages(self, definition: str, value: Any) -> list[str]:
        """Raw validator messages; refusal only through schema_errors or the reference phase."""
        return [e.message[:200] for e in self.validators[definition].iter_errors(value)]

    def schema_errors(self, definition: str, value: Any) -> list[str]:
        messages = self.schema_messages(definition, value)
        facts = Facts("h4_schema")
        for name in ("transaction_slot", "operation_receipt", "prior_slot_migration_generation", "stored_value_ref"):
            facts["H4S%02d_%s" % (len(facts.values) + 1, name)] = name != definition or not messages
        return messages if facts.rows() else []

    def semantic(self, definition: str, value: Any, store: PayloadStore) -> list[str]:
        if definition == "transaction_slot":
            return slot_invariants(value, store, self.limits[definition])
        if definition == "operation_receipt":
            return receipt_invariants(value, store, self.limits[definition])
        if definition == "stored_value_ref":
            return self.reference_invariants(value, store)
        return []

    def reference_invariants(self, ref: dict[str, Any], store: PayloadStore) -> list[str]:
        err: list[str] = []
        definition = DEFINITION_OF[ref["schema_id"]]
        limit = self.limits[definition]
        wrapper = len(canonical_msgpack(ref))
        size = Facts("h4_ref_wrapper")
        size["H4F01_wrapper_within_limit"] = wrapper <= limit
        if size.rows():
            err.append(f"I10 the stored reference is {wrapper} bytes, over the {limit}-byte limit")
        data = store.resolve(err, ref["value_ref"], "value_ref")
        if data is None:
            return err
        digest_facts = Facts("h4_ref_sha")
        digest_facts["H4F02_value_sha"] = sha(data) == ref["value_sha256"]
        err.extend(digest_facts.codes())
        decoded: dict[str, Any] = {}

        def canonical() -> bool:
            try:
                decoded["stored"] = decode_canonical_msgpack(data)
            except (ValueError, UnicodeDecodeError) as exc:
                decoded["error"] = exc
                return False
            return True

        def projection() -> bool:
            decoded["value"] = to_projection(decoded["stored"])
            return stored_bytes(definition, decoded["value"]) == data

        def shape() -> bool:
            decoded["shape"] = self.schema_messages(definition, decoded["value"])
            return not decoded["shape"]

        steps = Facts("h4_ref_decode", chain=True)
        for row, check in (("H4F03_canonical_msgpack", canonical),
                           ("H4F04_map", lambda: isinstance(decoded["stored"], dict)),
                           ("H4F05_bin_declared", projection),
                           ("H4F06_schema", shape)):
            if steps.stop(row, check):
                if row == "H4F03_canonical_msgpack":
                    err.append(f"I11 the referenced bytes are not a canonical MessagePack Home4 value: {decoded['error']}")
                elif row == "H4F06_schema":
                    err.append(f"I11 the referenced value is not a valid Home4 {definition}: {decoded['shape'][0]}")
                else:
                    err.append(steps.first_code())
                return err
        steps.done()
        value = decoded["value"]
        scope = Facts("h4_ref_scope")
        scope["H4F07_logical_key"] = logical_key(definition, value) == ref["logical_key"]
        scope["H4F08_storage_instance"] = storage_instance(definition, value) == ref["storage_instance_id"]
        err.extend(scope.codes())
        if definition == "transaction_slot":
            err.extend(slot_invariants(value, store, limit, by_reference=True))
        else:
            err.extend(receipt_invariants(value, store, limit, by_reference=True))
        return err

def load(root: Path, rel: str) -> Any:
    return json.loads((root / rel).read_text(encoding="utf-8"))


def run(root: Path, fixtures: dict[str, Any] | None = None) -> dict[str, Any]:
    chk = Checker(root)
    fixtures = load(root, FIXTURES) if fixtures is None else fixtures
    store = PayloadStore.from_fixture(fixtures.get("payload_store", []))
    valid = {c["id"]: c for c in fixtures["valid"]}
    failures: list[dict[str, Any]] = []
    counts = {"positive": 0, "schema_negative": 0, "invariant_negative": 0}
    sizes: dict[str, int] = {}
    registry = Facts("h4_registry")
    registry["H4R01_refs_resolved"] = not chk.unresolved
    registry["H4R02_slot_limit"] = chk.limits["transaction_slot"] <= chk.store_cap
    registry["H4R03_receipt_limit"] = chk.limits["operation_receipt"] <= chk.store_cap
    for row in registry.rows():
        if row == "H4R01_refs_resolved":
            failures.append({"id": "$ref", "expected": "every reachable $ref resolves", "errors": chk.unresolved[:5]})
        else:
            definition = "transaction_slot" if row == "H4R02_slot_limit" else "operation_receipt"
            failures.append({"id": "limit", "expected": f"{FAMILY[definition]} limit within {chk.store_cap}",
                             "errors": [str(chk.limits[definition])]})
    used: set[str] = set()

    def refs_of(value: Any) -> Iterator[str]:
        if isinstance(value, dict):
            if isinstance(value.get("blake3_id"), str):
                yield value["blake3_id"]
            for v in value.values():
                yield from refs_of(v)
        elif isinstance(value, list):
            for v in value:
                yield from refs_of(v)

    for case in fixtures["valid"]:
        definition, value = case["definition"], case["value"]
        errors = chk.schema_errors(definition, value)
        if not errors:
            errors = chk.semantic(definition, value, store)
        if errors:
            failures.append({"id": case["id"], "expected": "accept", "errors": errors[:5]})
        counts["positive"] += 1
        if definition in FAMILY:
            sizes[case["id"]] = len(stored_bytes(definition, value))
        else:
            sizes[case["id"]] = len(canonical_msgpack(value))
        for ident in refs_of(value):
            used.add(ident)
            if ident in store.objects and definition == "stored_value_ref":
                inner = to_projection(decode_canonical_msgpack(store.objects[ident][1]))
                used.update(refs_of(inner))
    for case in fixtures["invalid"]:
        base = valid[case["base"]]
        value = apply_ops(base["value"], case["ops"])
        case_store = store.apply(case.get("payload_store_ops", []))
        used.update(op["blake3_id"] for op in case.get("payload_store_ops", []))
        used.update(refs_of(value))
        schema_errors = chk.schema_errors(base["definition"], value)
        if case["rejected_by"] == "schema":
            counts["schema_negative"] += 1
            if not schema_errors:
                failures.append({"id": case["id"], "expected": "schema rejection", "errors": []})
            continue
        counts["invariant_negative"] += 1
        if schema_errors:
            failures.append({"id": case["id"], "expected": f"schema-valid, {case['rejected_by']} rejection",
                             "errors": schema_errors[:3]})
            continue
        found = chk.semantic(base["definition"], value, case_store)
        if not any(e.startswith(case["rejected_by"] + " ") for e in found):
            failures.append({"id": case["id"], "expected": f"{case['rejected_by']} rejection", "errors": found[:5]})
    unused = sorted(set(store.objects) - used)
    coverage = Facts("h4_store_coverage")
    coverage["H4C01_store_objects_used"] = not unused
    if coverage.rows():
        failures.append({"id": "payload_store", "expected": "every store object is referenced by a case", "errors": unused})
    return {
        "schema_id": "pm.home_layout_v2_slot_receipt.static_report.v1",
        "status": "pass" if not failures else "fail",
        "counts": counts,
        "failures": failures,
        "ref_closure": {"refs_resolved": chk.refs - len(chk.unresolved), "unresolved": len(chk.unresolved),
                        "patterns_with_ecma_end_of_input": chk.patterns},
        "value_limits": {FAMILY[d]: v for d, v in chk.limits.items()},
        "valid_stored_value_bytes": sizes,
        "payload_store_objects": len(store.objects),
        "native_execution": "NOT_RUN",
        "claim_boundary": "Synthetic schema, joined-value, whole-value size and payload-reference checks of the Home4 contract only; no native codec, payload pack, redb transaction, authentication, durability, installation or admission proof.",
    }


def self_test(root: Path) -> dict[str, Any]:
    """Shows the checker can fail: known-bad values must be refused and a mis-declared case must fail the run."""
    chk = Checker(root)
    fixtures = load(root, FIXTURES)
    valid = {c["id"]: c for c in fixtures["valid"]}
    results: dict[str, Any] = {}
    lf = copy.deepcopy(valid["home4_prepared_slot"]["value"])
    lf["candidate_layout_source_bytes"] = {"form": "payload_ref", "blake3_id": "f" * 64 + "\n",
                                           "byte_size": 16385, "media_type": "application/msgpack"}
    results["trailing_lf_source_ref_refused"] = bool(chk.schema_errors("transaction_slot", lf))
    results["blake3_vectors"] = (blake3_hex(b"") == "af1349b9f5f9a1a6a0404dea36dcc9499bcb25c9adc112b7cc9a93cae41f3262"
                                 and blake3_hex(b"abc") == "6437b3ac38465133ffb63b75273a8db548c558465d79db03fd359c6cd5bd9d85")
    broken = copy.deepcopy(fixtures)
    broken["invalid"][0]["rejected_by"] = "I1"
    results["misdeclared_case_fails_run"] = run(root, broken)["status"] == "fail"
    accepted = copy.deepcopy(fixtures)
    accepted["valid"].append({"id": "self_test_bad_positive", "definition": "transaction_slot",
                              "value": lf, "why": "must be refused"})
    results["bad_positive_fails_run"] = run(root, accepted)["status"] == "fail"
    results["status"] = "pass" if all(v is True for v in results.values()) else "fail"
    return results


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("--root", type=Path, default=Path(__file__).resolve().parents[1])
    parser.add_argument("--self-test", action="store_true", help="show that known-bad inputs make the checker fail")
    args = parser.parse_args()
    root = args.root.resolve()
    report = self_test(root) if args.self_test else run(root)
    print(json.dumps(report, indent=2, sort_keys=True))
    return 0 if report["status"] == "pass" else 1


if __name__ == "__main__":
    sys.exit(main())
