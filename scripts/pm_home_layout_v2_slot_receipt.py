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

from jsonschema import Draft202012Validator, FormatChecker, ValidationError, validators
from referencing import Registry, Resource
from referencing.exceptions import Unresolvable
from referencing.jsonschema import DRAFT202012

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
    """RFC 8785 form for the fixture domain (no floats in hashed owner values)."""
    return json.dumps(value, sort_keys=True, separators=(",", ":"), ensure_ascii=False).encode()


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
    return canonical_msgpack(to_stored(definition, value))


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


def _exact_numeric_type(validator: Any, expected: Any, instance: Any,
                        schema: dict[str, Any]) -> Iterator[ValidationError]:
    """One representation for integral values, before any identity or digest.

    JSON Schema's mathematical integer includes 4.0. The typed storage domain uses
    an integer for that value. Keep the codec able to read original float bytes;
    refuse alternate integral forms at admission instead of rewriting history.
    """
    kinds = expected if isinstance(expected, list) else [expected]
    if isinstance(instance, float) and instance.is_integer() and any(k in kinds for k in ("integer", "number")):
        yield ValidationError("integral numeric values require the integer representation")
        return
    yield from Draft202012Validator.VALIDATORS["type"](validator, expected, instance, schema)


Home4Validator = validators.extend(Draft202012Validator, {"pattern": _ecma_pattern, "type": _exact_numeric_type})
# Retained bodies keep their originally admitted numeric domain and exact bytes.
# This reader class never authorizes a current append or computes replacement pins.
RetainedBodyValidator = validators.extend(Home4Validator, {"type": Draft202012Validator.VALIDATORS["type"]})


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
        if not isinstance(ident, str) or not HEX64.fullmatch(ident):
            err.append(f"I11 {what} blake3_id is not exactly 64 lower-case hex characters")
            return None
        if ident not in self.objects:
            err.append(f"I11 {what} names a payload-store object that does not exist")
            return None
        media, data = self.objects[ident]
        ok = True
        if blake3_hex(data) != ident:
            err.append(f"I11 {what} object bytes do not hash to its BLAKE3 id")
            ok = False
        if len(data) != ref["byte_size"]:
            err.append(f"I11 {what} byte_size {ref['byte_size']} differs from the object's {len(data)} bytes")
            ok = False
        if media != ref["media_type"]:
            err.append(f"I11 {what} media_type differs from the object's")
            ok = False
        return data if ok else None


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
    size = len(stored_bytes(definition, value))
    if by_reference and size <= limit:
        err.append(f"I10 a {size}-byte value is within the {limit}-byte limit and is stored inline, never by reference")
    if not by_reference and size > limit:
        err.append(f"I10 the complete stored value is {size} bytes, over the {FAMILY[definition]} limit of {limit}; "
                   "it is stored only by reference")


def event_checks(err: list[str], ev: dict[str, Any], binding: dict[str, Any], d: str, store: PayloadStore = EMPTY_STORE) -> dict[str, Any]:
    import pm_event_payload_route as body_route
    payload, route_errors = body_route.resolved_body(ev, store.objects, historical=ev.get("schema_version") == "2.0.0")
    err.extend("I12 " + e for e in route_errors)
    if payload is None:
        return {}
    schema = load(Path(__file__).resolve().parents[1], "Plans/event_payloads/workspace_layout_changed_v2.schema.json")
    if not body_route.validator(schema).is_valid(payload):
        err.append("I12 resolved event body fails workspace layout payload schema")
        return {}
    if payload["command_id"] != binding["command_id"]:
        err.append("I1 event payload command_id differs from the binding")
    if ev["project_id"] != binding["project_id"] or payload["project_id"] != binding["project_id"] \
            or payload["workspace_tab_id"] != binding["workspace_tab_id"]:
        err.append("I3 event names another Project or workspace tab")
    if payload["prior_layout_revision"] != binding["expected_layout_revision"] \
            or payload["new_layout_revision"] != binding["expected_layout_revision"] + 1 \
            or ev["producer_sequence_id"] != payload["new_layout_revision"]:
        err.append("I2 event revision edge is not expected -> expected + 1")
    if payload["correlation_id"] != binding["correlation_id"] or ev["correlation_id"] != binding["correlation_id"] \
            or payload["interaction_transaction_id"] != binding["interaction_transaction_id"]:
        err.append("I4 event correlation or interaction differs from the binding")
    if ev["event_id"] != "evt_workspace_layout_" + d or ev["idempotency_key"] != "workspace.layout_changed:" + d:
        err.append("I5 event id or idempotency key is not formed from the operation digest")
    if ev["actor_ref"] != binding["actor_ref"]:
        err.append("I4 event actor differs from the binding")
    return payload


def binding_checks(err: list[str], binding: dict[str, Any]) -> str:
    d = digest(binding)
    if binding["operation_digest"] != d or binding["operation_ref"] != "home_layout_operation:" + d:
        err.append("I5 operation digest or ref is not the SP-273 recipe")
    return d


def source_bytes_check(err: list[str], name: str, holder: dict[str, Any], layout: Any, layout_sha: Any,
                       store: PayloadStore) -> None:
    src = holder[name]
    if src is None:
        return
    if src["form"] == "inline":
        data = base64.b64decode(src["bytes"], validate=True)
        if len(data) > INLINE_LIMIT:
            err.append(f"I6 {name} inline bytes exceed 16 KiB; a payload_ref is required")
        media = SOURCE_MEDIA_TYPE
    else:
        if src["byte_size"] <= INLINE_LIMIT:
            err.append(f"I6 {name} payload_ref names {src['byte_size']} bytes; bytes within 16 KiB are inline")
        resolved = store.resolve(err, src, name)
        if resolved is None:
            return
        data, media = resolved, src["media_type"]
    if sha(data) != layout_sha:
        err.append(f"I6 {name} SHA-256 differs from the layout hash")
    decoded = None
    if media == SOURCE_MEDIA_TYPE:
        try:
            decoded = json.loads(data.decode("utf-8"))
        except (UnicodeDecodeError, json.JSONDecodeError):
            decoded = None
    if decoded != layout:
        err.append(f"I6 {name} does not decode to the decoded layout (synthetic adapter)")


def slot_invariants(slot: dict[str, Any], store: PayloadStore = EMPTY_STORE, limit: int = INLINE_LIMIT,
                    by_reference: bool = False) -> list[str]:
    err: list[str] = []
    value_limit_check(err, "transaction_slot", slot, limit, by_reference)
    prior = slot.get("prior_migration_generation")
    if prior is not None:
        mg = slot["migration_generation"]
        core = prior["core"]
        data = base64.b64decode(prior["core_bytes"], validate=True)
        if data != canonical_msgpack(core) or prior["core_sha256"] != sha(data):
            err.append("I7 core_bytes is not the canonical MessagePack of core, or core_sha256 differs")
        key = f"home_layout_transaction_slot.v1:{slot['project_id']}:{slot['workspace_tab_id']}"
        joins = (prior["logical_key"] == key and prior["storage_instance_id"] == slot["storage_instance_id"]
                 and core["storage_instance_id"] == slot["storage_instance_id"]
                 and core["project_id"] == slot["project_id"] and core["workspace_tab_id"] == slot["workspace_tab_id"]
                 and prior["successor_generation_id"] == mg["generation_id"]
                 and prior["successor_migration_id"] == mg["migration_id"]
                 and prior["successor_migration_completed_at_utc"] == mg["migration_completed_at_utc"]
                 and prior["successor_migration_receipt_key"] == mg["migration_receipt_key"]
                 and prior["successor_migration_receipt_sha256"] == mg["migration_receipt_sha256"])
        if not joins:
            err.append("I9 prior migration wrapper does not join the slot's scope and current migration")
    binding = slot["binding"]
    if binding is None:
        return err
    d = binding_checks(err, binding)
    if binding["storage_instance_id"] != slot["storage_instance_id"] or binding["project_id"] != slot["project_id"] \
            or binding["workspace_tab_id"] != slot["workspace_tab_id"]:
        err.append("I3 binding names another Storage instance, Project or workspace tab")
    for name in ("prior_layout", "candidate_layout"):
        layout = slot[name]
        if layout["project_id"] != slot["project_id"] or layout["workspace_tab_id"] != slot["workspace_tab_id"]:
            err.append(f"I3 {name} belongs to another Project or workspace tab")
    if slot["prior_layout"]["revision"] != binding["expected_layout_revision"] \
            or slot["candidate_layout"]["revision"] != binding["expected_layout_revision"] + 1:
        err.append("I2 slot layouts are not the expected revision and the next one")
    source_bytes_check(err, "prior_layout_source_bytes", slot, slot["prior_layout"], slot["prior_layout_sha256"], store)
    source_bytes_check(err, "candidate_layout_source_bytes", slot, slot["candidate_layout"], slot["candidate_layout_sha256"], store)
    custody = slot.get("pending_sir_custody")
    if custody is not None and custody["original_source"]["normalized_request"]["command_id"] != binding["command_id"]:
        err.append("I1 pending SIR custody names another command")
    rb = slot["readback"]
    if rb is not None:
        if rb["canonical_key"] != layout_key(binding):
            err.append("I3 readback key is not this Project's v2 layout key")
        if rb["layout_revision"] != slot["candidate_layout"]["revision"] or rb["layout_sha256"] != slot["candidate_layout_sha256"]:
            err.append("I2 readback does not certify the candidate")
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
    commands = {b["command_id"], o["command_id"], r["original_normalized_request"]["command_id"]}
    for key in ("original_command_outcome", "original_ui_response"):
        if r[key] is not None:
            commands.add(r[key]["command_id"])
    if len(commands) != 1:
        err.append("I1 binding, owner result and original SIR values name different commands")
    if not (r["prior_layout_revision"] == b["expected_layout_revision"] == o["prior_layout_revision"]):
        err.append("I2 prior revision differs from the expected revision")
    if r["state"] in APPLIED:
        edge = b["expected_layout_revision"] + 1
        if not (r["new_layout_revision"] == o["new_layout_revision"] == edge and r["readback"]["layout_revision"] == edge):
            err.append("I2 applied revision edge is not expected -> expected + 1")
        if r["readback"]["canonical_key"] != layout_key(b):
            err.append("I3 readback key is not this Project's v2 layout key")
        if r["readback"]["layout_sha256"] != r["settled_layout_sha256"] or r["settled_layout_ref"] != "home_layout_settlement:" + d:
            err.append("I4 settlement does not join the readback or the operation digest")
    if o["operation_ref"] != b["operation_ref"] or o["result_ref"] != "home_layout_result:" + d \
            or dr["receipt_ref"] != "home_layout_dispatch_receipt:" + d or dr["operation_ref"] != b["operation_ref"]:
        err.append("I5 result or receipt ref is not formed from the operation digest")
    if dr["command_result_ref"] != o["result_ref"] or dr["correlation_id"] != b["correlation_id"] \
            or dr["dispatch_ref"] != b["dispatch_ref"]:
        err.append("I4 dispatch receipt does not join the result, correlation or dispatch")
    ev = r["event_semantics"]
    if ev is not None:
        payload = event_checks(err, ev, b, d, store)
        if not payload:
            return err
        if payload["command_result_ref"] != o["result_ref"] or payload["receipt_refs"] != [dr["receipt_ref"]] \
                or payload["settled_layout_ref"] != r["settled_layout_ref"]:
            err.append("I4 event payload does not join the result, receipt or settlement")
        if r["state"] == "committed" and (o["event_ref"] != ev["event_id"] or dr["event_ref"] != ev["event_id"]):
            err.append("I4 committed result and receipt do not name the event")
    for key, original in (("normalized_request", r["original_normalized_request"]),
                          ("command_outcome", r["original_command_outcome"]),
                          ("ui_response", r["original_ui_response"])):
        captured = r["identity_capture_bytes"][key]
        if original is None or captured is None:
            if original is not None or captured is not None or r["identity_capture_bytes_sha256"][key] is not None:
                err.append(f"I7 identity capture {key} presence differs from its original")
            continue
        data = base64.b64decode(captured, validate=True)
        if data != canonical_msgpack(original) or r["identity_capture_bytes_sha256"][key] != sha(data):
            err.append(f"I7 identity capture {key} is not the canonical MessagePack of its original")
    outcome = r["original_command_outcome"]
    if outcome is not None:
        if outcome["owner_result_schema_ref"] != OWNER_RESULT_REF:
            err.append("I8 SIR outcome does not point at the Home4 owner result")
        if not (outcome["owner_result_sha256"] == r["original_owner_result_sha256"] == sha(canonical_json(o))):
            err.append("I8 owner result hash is not the CV-333 hash of the Home-owned owner result")
    response = r["original_ui_response"]
    if response is not None and response.get("owner_result_schema_ref") not in (None, OWNER_RESULT_REF):
        err.append("I8 UI response does not point at the Home4 owner result")
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

    def schema_errors(self, definition: str, value: Any) -> list[str]:
        return [e.message[:200] for e in self.validators[definition].iter_errors(value)]

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
        if wrapper > limit:
            err.append(f"I10 the stored reference is {wrapper} bytes, over the {limit}-byte limit")
        data = store.resolve(err, ref["value_ref"], "value_ref")
        if data is None:
            return err
        if sha(data) != ref["value_sha256"]:
            err.append("I11 value_sha256 is not the SHA-256 of the referenced bytes")
        try:
            stored = decode_canonical_msgpack(data)
        except (ValueError, UnicodeDecodeError) as exc:
            err.append(f"I11 the referenced bytes are not a canonical MessagePack Home4 value: {exc}")
            return err
        if not isinstance(stored, dict):
            err.append("I11 the referenced value is not a map")
            return err
        value = to_projection(stored)
        if stored_bytes(definition, value) != data:
            err.append("I11 the referenced value carries bin outside its contentEncoding base64 fields")
            return err
        shape = self.schema_errors(definition, value)
        if shape:
            err.append(f"I11 the referenced value is not a valid Home4 {definition}: {shape[0]}")
            return err
        if logical_key(definition, value) != ref["logical_key"] or storage_instance(definition, value) != ref["storage_instance_id"]:
            err.append("I3 the reference's logical key or Storage instance differs from the referenced value's")
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
    if chk.unresolved:
        failures.append({"id": "$ref", "expected": "every reachable $ref resolves", "errors": chk.unresolved[:5]})
    for definition, limit in chk.limits.items():
        if limit > chk.store_cap:
            failures.append({"id": "limit", "expected": f"{FAMILY[definition]} limit within {chk.store_cap}", "errors": [str(limit)]})
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
    if unused:
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
