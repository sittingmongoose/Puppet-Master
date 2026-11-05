#!/usr/bin/env python3
"""Serial, complete-path guard isolation (check 11).

Method B: original Python functions, fresh factories, table-entry swaps only.
See GUARDTOOL-ADOPTION.md. Schema occurrence cuts remain separately supported.
No Python source/bytecode rewriting, recompilation or function/state cloning.
"""
from __future__ import annotations

import argparse
import ast
import builtins
import copy
import dis
import inspect
import importlib.machinery
from dataclasses import asdict, dataclass, field, replace
import hashlib
import importlib.util
import json
import math
from pathlib import Path
import resource
import re
import struct
import sys
import time
import types
import weakref
from typing import Any, Callable
from urllib.parse import unquote, urldefrag, urljoin

from jsonschema import FormatChecker, validators
from referencing import Registry, Resource
from referencing.jsonschema import DRAFT202012


class IsolationError(ValueError):
    """Invalid declaration, unresolved reference, or unsafe cut."""


def encoded(value: Any) -> str:
    return json.dumps(value, sort_keys=True, ensure_ascii=True, separators=(",", ":"), allow_nan=False)


def digest(value: Any) -> str:
    return hashlib.sha256(encoded(evidence_value(value)).encode()).hexdigest()


def evidence_value(value):
    """Typed DIAGNOSTIC fingerprints, never an event/identity/storage serializer.

    Preserve physical float bits, byte strings and wrong-type fixture inputs.
    No producer payload, number domain or historical recipe is normalized.
    """
    kind = type(value)
    if value is None:
        return ["null"]
    if kind is bool:
        return ["boolean", value]
    if kind is int:
        return ["integer", str(value)]
    if kind is float:
        return ["float64-bits", struct.pack(">d", value).hex()]
    if kind is str:
        return ["string", value]
    if kind in (bytes, bytearray):
        return [kind.__name__, value.hex()]
    if kind in (list, tuple, set, frozenset):
        items = [evidence_value(v) for v in value]
        return [kind.__name__, sorted(items, key=encoded) if kind in (set, frozenset) else items]
    if kind is dict:
        items = [[evidence_value(k), evidence_value(v)] for k, v in value.items()]
        return ["mapping", sorted(items, key=lambda pair: encoded(pair[0]))]
    raise IsolationError("unsupported case fingerprint type: " + kind.__name__ + "; supply reifiable fixture data")


class _DataSnapshot:
    # Source-backed methods keep our own instrumentation inside the engine's
    # trace boundary even when cwd is the repository root. No synthetic-code
    # exemption is granted to lane code.
    __slots__ = ('signature', 'keepalive')

    def __init__(self, signature, keepalive):
        self.signature, self.keepalive = signature, keepalive

    def __eq__(self, other):
        if type(other) is not _DataSnapshot:
            return NotImplemented
        return self.signature == other.signature


def _data_snapshot(*roots):
    """Purity witness for the supported, original data graph (never a serializer).

    Retain order, aliases, cycles, physical scalar bits AND object identities.
    No hooks, descriptors, equality overloads or user iterators are invoked.
    Context sets are observed in their original order; they are never copied.
    """
    seen, nodes, keepalive = {}, [], []
    def visit(value):
        keepalive.append(value)  # no recycled IDs after a detached node dies
        kind = type(value)
        if kind in (type(None), bool, int, float, str, bytes):
            return ('scalar', id(value), encoded(evidence_value(value)))
        if kind not in (dict, list, tuple, bytearray, set, frozenset):
            raise IsolationError('predicate purity cannot certify data type: ' + kind.__name__)
        if id(value) in seen:
            return ('ref', seen[id(value)])
        index = len(nodes)
        seen[id(value)] = index
        nodes.append(None)
        contents = (tuple((visit(k), visit(v)) for k, v in value.items()) if kind is dict else
                    bytes(value) if kind is bytearray else tuple(visit(v) for v in value))
        nodes[index] = (kind.__name__, id(value), contents)
        return ('ref', index)
    references = tuple(visit(value) for value in roots)
    return _DataSnapshot((references, tuple(nodes)), tuple(keepalive))


def pointer(parts: tuple) -> str:
    return "/" + "/".join(str(p).replace("~", "~0").replace("/", "~1") for p in parts) if parts else ""


def at(value: Any, parts: tuple) -> Any:
    for part in parts:
        value = value[part]
    return value


def joined(base, reference):
    # urllib treats non-hierarchical URNs differently from JSON Schema refs.
    if reference.startswith("#"):
        return urldefrag(base)[0] + reference
    return urljoin(base, reference)


def schema_copy(value):
    """Copy schema occurrences, including Python-built schemas with shared dicts.

    JSON documents have a tree of containers; a Python object's incidental alias
    must not turn two field predicates into one mutation site. Scalars retain
    their exact values/types; this never serializes producer or stored values.
    """
    if isinstance(value, dict):
        return {key: schema_copy(child) for key, child in value.items()}
    if isinstance(value, list):
        return [schema_copy(child) for child in value]
    return copy.deepcopy(value)


@dataclass(frozen=True)
class Invariant:
    """Same INPUT field and predicate, not a code, keyword, or enforcement site.

    Schema sites derive this by default. Cross-copy/code aliases require an
    explicit binding with evidence, visible in the report for human review.
    """
    subject: str
    predicate: str

    def __post_init__(self):
        if type(self.subject) is not str or type(self.predicate) is not str or not self.subject.strip() or not self.predicate.strip():
            raise IsolationError("invariant requires a nonempty field and predicate")


@dataclass(frozen=True)
class SchemaGuard:
    id: str
    kind: str
    location: str
    invariant: Invariant
    document: str = ""
    path: tuple = ()
    keyword: str = ""
    member: Any = None
    classification: str = "guard"
    evidence: str = ""
    polarity: int = 1
    refusal_code: str = ""          # normalized code returned by the complete-path callback
    entry_uri: str = ""
    reference_trail: tuple = ()
    input_path: tuple = ()
    dialect: str = ""
    predicate_count: int | None = None  # None = unknown, NEVER an atomic cut
    cut: str = ""                    # explicit allow-list strategy; empty = no cut
    activation_context: tuple = ()


@dataclass(frozen=True)
class Classification:
    guard: str
    kind: str                     # selector | unreachable | redundant | format_sweep
    evidence: str                 # exact source/logic/witness, never a blank waiver


@dataclass(frozen=True)
class Duplicate:
    id: str
    sites: tuple[str, ...]
    invariant: Invariant
    evidence: str


@dataclass(frozen=True)
class Control:
    id: str
    value: Any
    boundary: str                 # append | retry | retained_history; synthetic for self-test


@dataclass(frozen=True)
class Negative:
    id: str
    value: Any
    target: str                   # a Guard.id OR an explicitly declared Duplicate.id
    code: str
    control: str
    defect: str                   # source mutation; copied fields must already agree


@dataclass(frozen=True)
class Outcome:
    accepted: bool
    code: str = ""

    def __post_init__(self):
        if type(self.accepted) is not bool or type(self.code) is not str:
            raise IsolationError("Outcome requires an exact boolean and a string code")
        if self.accepted == bool(self.code):
            raise IsolationError("acceptance has no refusal code; refusal requires a code")

    @classmethod
    def accept(cls):
        return cls(True)

    @classmethod
    def refuse(cls, code):
        return cls(False, code)


# Only schema positions are traversed: an instance in const/enum/default is DATA.
MAPS = ("$defs", "definitions", "properties", "patternProperties", "dependentSchemas")
SINGLES = ("additionalProperties", "unevaluatedProperties", "additionalItems",
           "unevaluatedItems", "propertyNames", "contains", "if", "then", "else", "not", "contentSchema")
ARRAYS = ("allOf", "anyOf", "oneOf", "prefixItems")
SCALARS = ("type", "const", "enum", "minimum", "maximum", "exclusiveMinimum", "exclusiveMaximum",
           "multipleOf", "minLength", "maxLength", "pattern", "format", "minItems", "maxItems",
           "uniqueItems", "minProperties", "maxProperties")
ANNOTATIONS = {"$schema", "$id", "$anchor", "$dynamicAnchor", "$recursiveAnchor", "$comment", "$vocabulary",
               "title", "description", "default", "examples", "deprecated", "readOnly", "writeOnly",
               "contentEncoding", "contentMediaType"}

# Proof credit is opt-in. A known keyword, AST node or physical enforcement
# site is NOT necessarily one predicate. This is the engine's cut allow-list;
# the guide's audit tables include unsupported, ignored and routing cases too.
SUPPORTED_DIALECTS = (validators.Draft6Validator, validators.Draft7Validator,
                      validators.Draft201909Validator, validators.Draft202012Validator)
ATOMIC_SCHEMA = frozenset(SCALARS) - {"pattern", "format"}
SCHEMA_CUTS = {**{k: "delete-one-assertion" for k in ATOMIC_SCHEMA},
    "type": "type-with-typed-membership", "required": "remove-one-required-member",
    "dependentRequired": "remove-one-dependency-member", "dependencies": "remove-one-dependency-member",
    "$boolean": "replace-one-boolean", "minContains": "weaken-only-lower-match-count",
    "maxContains": "remove-only-upper-match-count", "oneOf:maxMatches": "retain-nonzero-match-remove-exclusivity"}
UNSUPPORTED_SCHEMA = {"pattern", "format", "patternProperties", "unevaluatedItems", "unevaluatedProperties"}


def children(node: dict):
    for key in MAPS:
        for name, child in node.get(key, {}).items():
            yield (key, name), child
    for key in SINGLES:
        if key in node:
            yield (key,), node[key]
    for key in ARRAYS:
        for i, child in enumerate(node.get(key, [])):
            yield (key, i), child
    if "items" in node:
        if isinstance(node["items"], list):
            for i, child in enumerate(node["items"]):
                yield ("items", i), child
        else:
            yield ("items",), node["items"]
    for name, child in node.get("dependencies", {}).items():
        if isinstance(child, (dict, bool)):
            yield ("dependencies", name), child


class SchemaCatalog:
    """Closed, eagerly resolved schema graph; no network or implicit retrieval.

    documents maps absolute resource URIs to JSON schemas. roots declares the
    COMPLETE consumed entry points (URI with optional JSON pointer/anchor).
    Dormant definitions are inventoried and every reference in them is resolved.
    """
    def __init__(self, documents: dict[str, Any], roots: tuple[str, ...] | None = None,
                 *, format_checker: FormatChecker | None = None):
        self.documents = schema_copy(documents)
        self.roots = tuple(roots if roots is not None else documents)
        if not self.documents or not self.roots:
            raise IsolationError("schema catalog requires documents and complete consumed roots")
        self.formats = format_checker or FormatChecker()
        self.guards: dict[str, SchemaGuard] = {}
        self.nodes: dict[tuple, Any] = {}
        self.edges: dict[tuple, list[tuple]] = {}
        self.possible_edges: dict[tuple, list[tuple]] = {}
        self.references: list[dict] = []
        self.entry_targets = {}
        self.special_entries = set()
        self.mixed_entries = set()
        self.unsupported_entries = {}
        self.dialects = {}
        self.ineffective = {}
        self.bindings = []
        self._make_registry()
        self._inventory()

    def _make_registry(self):
        resources = []
        for uri, document in self.documents.items():
            if not urldefrag(uri)[0] or ":" not in uri or urldefrag(uri)[1]:
                raise IsolationError(f"absolute document URI required: {uri!r}")
            cls = validators.validator_for(document) if isinstance(document, dict) else validators.Draft202012Validator
            cls.check_schema(document)
            resources.append((uri, Resource.from_contents(document, default_specification=DRAFT202012)))
        self.registry = Registry().with_resources(resources).crawl()

    def _inventory(self):
        by_object, by_uri, dynamic_anchors = {}, {}, {}
        def collect(doc, path, node, base_resolver, scopes, dialect):
            key = (doc, path)
            self.nodes[key] = node
            dialect = validators.validator_for(node, default=dialect) if isinstance(node, dict) else dialect
            self.dialects[key] = dialect
            if isinstance(node, dict):
                by_object[id(node)] = key
            scopes = list(scopes)
            if isinstance(node, dict) and "$id" in node:
                scopes.append((joined(scopes[-1][0], node["$id"]), path))
            for base, root_path in scopes:
                location = base + "#" + pointer(path[len(root_path):])
                if location in by_uri and by_uri[location] != key:
                    raise IsolationError("ambiguous schema resource location " + location)
                by_uri[location] = key
            if isinstance(node, dict):
                for anchor in ("$anchor", "$dynamicAnchor"):
                    if anchor in node:
                        location = scopes[-1][0] + "#" + node[anchor]
                        if location in by_uri and by_uri[location] != key:
                            raise IsolationError("ambiguous schema anchor " + location)
                        by_uri[location] = key
                        if anchor == "$dynamicAnchor":
                            dynamic_anchors.setdefault(node[anchor], []).append(key)
            if not isinstance(node, dict):
                self.edges[key] = []
                self.possible_edges[key] = []
                return
            resolver = base_resolver.in_subresource(Resource.from_contents(node, default_specification=DRAFT202012))
            self.edges[key] = []
            self.possible_edges[key] = []
            for rel, child in children(node):
                collect(doc, path + rel, child, resolver, scopes, dialect)
                # $defs/definitions are declarations, not evaluation edges.
                if rel[0] not in ("$defs", "definitions", "contentSchema"):
                    edge = ((doc, path + rel), rel[0])
                    self.possible_edges[key].append(edge)
                    if self._effective(node, rel[0], dialect):
                        self.edges[key].append(edge)
            for ref_key in ("$ref", "$dynamicRef", "$recursiveRef"):
                if ref_key in node:
                    try:
                        resolved = resolver.lookup(node[ref_key])
                    except Exception as exc:
                        raise IsolationError(f"unresolved {ref_key} {doc}#{pointer(path)}: {node[ref_key]} ({exc})") from exc
                    self.references.append({"source": key, "keyword": ref_key,
                                            "ref": node[ref_key], "target_object": id(resolved.contents),
                                            "target_uri": joined(scopes[-1][0], node[ref_key])})
        for doc, schema in self.documents.items():
            # The root's $id is applied by collect exactly once.
            collect(doc, (), schema, self.registry.resolver(doc), [(doc, ())], validators.Draft202012Validator)
        for ref in self.references:
            uri = ref.pop("target_uri")
            base, fragment = urldefrag(uri)
            target = by_uri.get(base + "#" + unquote(fragment)) or by_object.get(ref.pop("target_object"))
            ref.pop("target_object", None)
            if target is None:
                raise IsolationError(f"reference escapes the declared schema graph: {ref}")
            ref["target"] = target
            self.possible_edges[ref["source"]].append((target, ref["keyword"]))
            active = self._effective(self.nodes[ref["source"]], ref["keyword"], self.dialects[ref["source"]])
            if active:
                self.edges[ref["source"]].append((target, ref["keyword"]))
            if ref["keyword"] == "$dynamicRef":
                # Conservative dynamic closure: every declared matching anchor
                # can be selected by a calling dynamic scope. Never call one
                # unreachable merely because static fallback chose a sibling.
                anchor = urldefrag(ref["ref"])[1]
                ref["dynamic_candidates"] = dynamic_anchors.get(anchor, [])
                for alternative in ref["dynamic_candidates"] if active else ():
                    self.edges[ref["source"]].append((alternative, ref["keyword"]))
                for alternative in ref["dynamic_candidates"]:
                    self.possible_edges[ref["source"]].append((alternative, ref["keyword"]))
        reachable, contexts = set(), {}
        def reach(key, mode="guard", polarity=1):
            context = (mode, polarity)
            if context in contexts.get(key, set()):
                return
            contexts.setdefault(key, set()).add(context)
            reachable.add(key)
            for child, via in self.edges[key]:
                child_mode, child_polarity = mode, polarity
                # A $ref edge is evaluation at the same input and logical polarity.
                parent = self.nodes[key]
                if via in ("if", "contains"):
                    child_mode = "selector"
                elif via == "not":
                    child_polarity *= -1
                elif via in ("then", "else") and "if" not in parent:
                    continue
                reach(child, child_mode, child_polarity)
        for entry in self.roots:
            try:
                result = self.registry.resolver().lookup(entry)
                base, fragment = urldefrag(entry)
                target = by_uri.get(base + "#" + unquote(fragment)) or by_object.get(id(result.contents))
                if target is None:
                    raise IsolationError("root not in declared resources")
            except Exception as exc:
                raise IsolationError(f"unresolved declared root {entry}: {exc}") from exc
            reach(target)
            self.entry_targets[entry] = target
        # URI aliases are approved by resolved schema location, never spelling.
        self.entry_locations = by_uri
        declared = {target: entry for entry, target in self.entry_targets.items()}
        self.approved_entries = {uri: declared[key] for uri, key in by_uri.items() if key in declared}
        for (doc, path), node in self.nodes.items():
            # Booleans are interned; their physical position, not object id, is their identity.
            context, evidence, polarity = self._context(doc, path, reachable)
            dynamic = contexts.get((doc, path), set())
            effective_polarities = {p for mode, p in dynamic if mode == "guard"}
            if len(effective_polarities) > 1:
                context, evidence = "unclassified", "same assertion evaluated in both logical polarities; separate occurrence binding required"
            elif effective_polarities:
                context, polarity = "guard", next(iter(effective_polarities))
                evidence = ""
            elif dynamic:
                context, evidence = "selector", "reachable only through if/contains match selection (including references)"
            def add(keyword, member=None, kind="schema", classification=None, why=""):
                suffix = pointer(path + (keyword,)) + ("/" + str(member).replace("~", "~0").replace("/", "~1") if member is not None else "")
                gid = "schema:" + doc + "#" + suffix
                # Conservative identity: never assume two schema occurrences
                # validate the same input field. A lane must bind that explicitly.
                subject = doc + "#" + pointer(path)
                val = node.get(keyword) if isinstance(node, dict) else node
                if keyword == "minContains" and (val is None or self.dialects[(doc, path)] in (validators.Draft6Validator, validators.Draft7Validator)):
                    val = 1
                predicate = encoded([keyword, member if member is not None else val])
                dialect = self.dialects[(doc, path)]
                effective_keyword = keyword.split(":", 1)[0]
                implicit_contains = keyword == "minContains" and "contains" in node and self._effective(node, "contains", dialect)
                if keyword != "$boolean" and kind != "extension" and not implicit_contains and not self._effective(node, effective_keyword, dialect):
                    classification = "unreachable"
                    why = (dialect.__name__ + ": $ref siblings are ignored" if "$ref" in node and effective_keyword != "$ref" and
                           dialect in (validators.Draft3Validator, validators.Draft4Validator, validators.Draft6Validator, validators.Draft7Validator)
                           else dialect.__name__ + ": keyword is not evaluated: " + effective_keyword)
                    self.ineffective[(doc, path, keyword)] = why
                self.guards[gid] = SchemaGuard(gid, kind, doc + "#" + suffix,
                    Invariant(subject, predicate), doc, path, keyword, member,
                    classification or context, why or evidence, polarity, dialect=dialect.__name__)
            if type(node) is bool:
                effective = node == (polarity < 0)
                classification = context if context != "guard" or effective else "redundant"
                add("$boolean", classification=classification,
                    why=evidence if classification != "redundant" else "boolean imposes no rejection in this logical polarity")
                continue
            for keyword in SCALARS:
                if keyword in node:
                    if keyword == "format" and node[keyword] not in self.formats.checkers:
                        add(keyword, classification="format_sweep", why="format checker unavailable: " + node[keyword] + "; validator fails closed")
                    elif keyword == "uniqueItems" and node[keyword] is False:
                        add(keyword, classification="redundant", why="uniqueItems=false imposes no restriction")
                    elif keyword in ("minLength", "minItems", "minProperties") and node[keyword] == 0:
                        add(keyword, classification="redundant", why="zero cardinality/length lower bound imposes no restriction")
                    else:
                        add(keyword)
            for name in node.get("required", []):
                add("required", name)
            for trigger, names in node.get("dependentRequired", {}).items():
                for name in names:
                    add("dependentRequired", encoded([trigger, name]))
            for trigger, names in node.get("dependencies", {}).items():
                if isinstance(names, list):
                    for name in names:
                        add("dependencies", encoded([trigger, name]))
            for keyword in ("properties", "patternProperties", "additionalProperties", "unevaluatedProperties", "items", "prefixItems",
                            "additionalItems", "unevaluatedItems", "propertyNames", "dependentSchemas",
                            "allOf", "anyOf", "oneOf", "not", "if", "then", "else", "contains"):
                if keyword not in node:
                    continue
                # Child schemas own their assertions, rather than an aggregate bypass.
                count = len(node[keyword]) if keyword in ("prefixItems", "allOf", "anyOf", "oneOf") else 0
                for member in range(count) if count else (None,):
                    add(keyword, member, kind="routing", classification="selector",
                        why="applicator/branch; child assertions are inventoried individually" if keyword != "if"
                        else "if selects then/else; its own validation result never rejects")
            if "contains" in node:
                zero_count = self.dialects[(doc, path)] in (validators.Draft201909Validator, validators.Draft202012Validator) and node.get("minContains") == 0
                add("minContains", kind="schema", classification="redundant" if zero_count else None,
                    why="minContains=0 imposes no count restriction" if zero_count else evidence or "contains requires at least one match unless an effective minContains overrides it")
                if "maxContains" in node:
                    add("maxContains")
            else:
                for keyword in ("minContains", "maxContains"):
                    if keyword in node:
                        add(keyword, classification="redundant", why="count keyword without contains has no effect")
            if "$vocabulary" in node:
                add("$vocabulary", kind="extension", classification="unclassified",
                    why="custom vocabulary declaration requires an explicit validator/atomic adapter")
            if "$schema" in node and validators.validator_for(node, default=None) not in SUPPORTED_DIALECTS:
                add("$schema", kind="extension", classification="unclassified", why="unsupported or unknown schema dialect")
            if "oneOf" in node:
                add("oneOf:maxMatches", kind="schema", why=evidence or "oneOf forbids more than one matching alternative; branch assertions retain the nonzero obligation")
            for keyword in ("$ref", "$dynamicRef", "$recursiveRef"):
                if keyword in node:
                    add(keyword, kind="reference", classification="selector", why="target resolved eagerly; target assertions inventoried without flattening")
            known = set(SCALARS + MAPS + SINGLES + ARRAYS) | ANNOTATIONS | {
                "items", "required", "dependentRequired", "dependencies", "minContains", "maxContains",
                "$ref", "$dynamicRef", "$recursiveRef"}
            for keyword in sorted(set(node) - known):
                add(keyword, kind="extension", classification="unclassified",
                    why="unknown vocabulary; adapter must supply its validator and predicate inventory")
        self._occurrences()
        self.fingerprint = digest(self.documents)

    @staticmethod
    def _effective(node, keyword, dialect):
        if "$ref" in node and dialect in (validators.Draft3Validator, validators.Draft4Validator, validators.Draft6Validator, validators.Draft7Validator):
            return keyword == "$ref"
        if keyword in ("minContains", "maxContains"):
            return dialect in (validators.Draft201909Validator, validators.Draft202012Validator)
        if keyword in ("then", "else"):
            return "if" in dialect.VALIDATORS and "if" in node
        return keyword in dialect.VALIDATORS

    def _occurrences(self):
        """One assertion per evaluation occurrence, never one per shared $ref site."""
        prototypes = self.guards
        by_node = {}
        for guard in prototypes.values():
            by_node.setdefault((guard.document, guard.path), []).append(guard)
        # jsonschema's descend may select keywords with the caller's dialect
        # while dispatching handlers with the evolved target dialect. A resource's
        # $schema alone cannot prove that its $ref siblings are ignored. Until an
        # adapter represents that context, retain the original graph and every
        # potentially evaluated assertion, with no isolated-cut/proof credit.
        for entry, root in self.entry_targets.items():
            pending, seen = [root], set()
            while pending:
                key = pending.pop()
                if key in seen:
                    continue
                seen.add(key)
                if self.dialects[key] is not self.dialects[root]:
                    self.mixed_entries.add(entry)
                    self.special_entries.add(entry)
                if isinstance(self.nodes[key], dict) and any(k in self.nodes[key] and self._effective(self.nodes[key], k, self.dialects[key]) for k in ("unevaluatedItems", "unevaluatedProperties")):
                    self.unsupported_entries[entry] = "unevaluated coverage depends on peer annotations; context-bound per-predicate adapter required"
                    self.special_entries.add(entry)
                pending.extend(child for child, _ in self.possible_edges[key])
        result, visited_nodes = {}, set()
        def assertion_count(key, stack=frozenset()):
            if key in stack:
                return 2                 # recursive negative contexts are unsupported
            count = sum(g.kind == "schema" and (g.document, g.path, g.keyword) not in self.ineffective
                        for g in by_node.get(key, []))
            for child, via in self.edges[key]:
                if via not in ("if", "contains"):
                    count += assertion_count(child, stack | {key})
                if count > 1:
                    break
            return count
        def simple_negative(key):
            # Applicability itself is an acceptance requirement under negation
            # (e.g. not/properties requires the property to exist). Count leaves
            # only in a same-input conjunction of scalar atoms and ordinary refs.
            node = self.nodes[key]
            if type(node) is bool:
                return True
            # Only total predicates can be inverted as one predicate. Negating
            # a typed assertion (minimum/length/required/etc.) also requires its
            # applicability domain; dropping it would cut BOTH requirements.
            allowed = {"type", "const", "enum", "$ref"} | ANNOTATIONS | {"$defs", "definitions"}
            if set(node) - allowed:
                return False
            return assertion_count(key) == 1 and all(simple_negative(child) for child, via in self.edges[key] if via == "$ref")
        def unsafe_negative(key):
            # The complete not subtree must be understood, including routing
            # that creates requirements without any explicit assertion leaf.
            return not simple_negative(key)
        def visit(entry, key, trail, input_path, mode, polarity, stack, negative_compound=False, activation=()):
            if key in stack:
                self.special_entries.add(entry)
                return
            visited_nodes.add(key)
            negative_compound = negative_compound or (polarity < 0 and unsafe_negative(key))
            for original in by_node.get(key, []):
                classification, evidence = original.classification, original.evidence
                if entry in self.mixed_entries and original.kind not in ("routing", "reference"):
                    classification, evidence = "unclassified", "mixed-dialect evaluation: caller keyword selection and target handlers require a context-bound adapter; resource dialect alone cannot prove reachability"
                elif (original.document, original.path, original.keyword) in self.ineffective:
                    classification = "unreachable"
                elif original.kind in ("routing", "reference"):
                    classification = "selector"
                elif original.kind == "extension":
                    classification = "unclassified"
                elif mode == "selector":
                    classification, evidence = "selector", "match-selection occurrence; not an independent rejection"
                elif original.keyword == "$boolean":
                    effective = self.nodes[key] == (polarity < 0)
                    classification = "guard" if effective else "redundant"
                    evidence = "" if effective else "boolean imposes no rejection in this logical polarity"
                elif original.classification != "format_sweep":
                    noop = original.classification == "redundant"
                    classification = "redundant" if noop and polarity > 0 else "guard"
                    evidence = original.evidence if classification == "redundant" else ""
                if negative_compound:
                    classification, evidence = "unclassified", "compound negative schema context has no peer-preserving atomic cut; expose a context-bound adapter seam"
                # Unsupported grammar is never waived just because it appears
                # inside a selector. Its hidden predicates may control rejection.
                if classification not in ("unreachable",) and original.keyword in UNSUPPORTED_SCHEMA:
                    classification, evidence = "unclassified", "keyword outside per-predicate cut allow-list: " + original.keyword + "; declare context-bound atomic clauses in an adapter"
                if self.dialects[key] not in SUPPORTED_DIALECTS:
                    classification, evidence = "unclassified", "dialect outside supported draft-06/07/2019-09/2020-12 allow-list"
                if mode == "unsupported":
                    classification, evidence = "unclassified", "unsupported applicator context (oneOf exclusivity, pattern routing or unevaluated coverage); atomic adapter required"
                if entry in self.unsupported_entries:
                    classification, evidence = "unclassified", self.unsupported_entries[entry]
                node = self.nodes[key]
                if isinstance(node, dict) and original.keyword == "not" and unsafe_negative((key[0], key[1] + ("not",))):
                    classification, evidence = "unclassified", "negated routing/applicability or compound expression needs a context-bound atomic adapter"
                if isinstance(node, dict) and original.keyword in ("anyOf", "oneOf") and not node[original.keyword]:
                    classification, evidence = "unclassified", "empty alternative set rejects without a child predicate; atomic adapter required"
                gid = original.id + "@" + digest([entry, trail, input_path])[:16]
                # An occurrence includes the input field and its branch/reference
                # route. Physical assertion addresses alone never merge fields.
                cut = SCHEMA_CUTS.get(original.keyword, "") if classification == "guard" else ""
                if classification == "guard" and not cut:
                    classification, evidence = "unclassified", "no allow-listed per-predicate cut for this construct"
                result[gid] = replace(original, id=gid, entry_uri=entry, reference_trail=trail,
                    input_path=input_path, polarity=polarity, classification=classification,
                    evidence=evidence, invariant=Invariant(entry + "#" + pointer(input_path), encoded([
                        original.invariant.predicate, polarity, activation,
                        [key[0], key[1]] if original.keyword in ("minContains", "maxContains", "oneOf:maxMatches") else None])),
                    activation_context=activation,
                    predicate_count=1 if cut else None if classification == "unclassified" else 0, cut=cut)
            edges = self.possible_edges[key] if entry in self.mixed_entries else self.edges[key]
            for child, via in edges:
                child_mode, child_polarity, child_input, child_trail, child_activation = mode, polarity, input_path, trail, activation
                if via in ("$dynamicRef", "$recursiveRef"):
                    self.special_entries.add(entry)
                if via in ("$ref", "$dynamicRef", "$recursiveRef"):
                    child_trail += ((key, child),)
                elif via in ("if", "contains"):
                    child_mode = "selector"
                elif via == "oneOf":
                    child_mode = "unsupported"
                elif via == "not":
                    child_polarity *= -1
                elif via in ("then", "else") and "if" not in self.nodes[key]:
                    continue
                if via in ("then", "else"):
                    child_activation += (("conditional", key, via),)
                elif via in ("dependentSchemas", "dependencies"):
                    child_activation += (("property-present", input_path, child[1][-1]),)
                elif via == "properties":
                    child_input += (child[1][-1],)
                elif via == "patternProperties":
                    child_input += ("@pattern:" + str(child[1][-1]),)
                elif via in ("items", "prefixItems", "additionalItems", "unevaluatedItems"):
                    child_input += (child[1][-1] if isinstance(child[1][-1], int) else "*",)
                elif via in ("additionalProperties", "unevaluatedProperties", "propertyNames"):
                    child_input += ("@" + via,)
                if mode == "unsupported" or via in UNSUPPORTED_SCHEMA:
                    child_mode = "unsupported"
                visit(entry, child, child_trail, child_input, child_mode, child_polarity, stack | {key}, negative_compound, child_activation)
        for entry, key in self.entry_targets.items():
            visit(entry, key, (), (), "guard", 1, set())
        for guard in prototypes.values():
            if (guard.document, guard.path) not in visited_nodes:
                unknown = guard.kind == "extension"
                result[guard.id] = replace(guard, classification="unclassified" if unknown else "unreachable",
                    evidence=("unknown vocabulary anywhere in the declared closure needs an adapter; reachability cannot certify its semantics" if unknown else
                              "no evaluation occurrence from declared roots " + encoded(self.roots)), predicate_count=None if unknown else 0, cut="")
        for gid, guard in list(result.items()):
            if guard.entry_uri in self.special_entries and guard.classification == "guard":
                result[gid] = replace(guard, classification="unclassified",
                    evidence="recursive/dynamic reference occurrences need an explicit context-bound adapter; broad physical cuts are forbidden", cut="", predicate_count=None)
        for entry in self.special_entries:
            gid = "schema-context:" + entry
            reason = (self.unsupported_entries.get(entry) or
                      ("mixed-dialect evaluation needs an explicit context-bound adapter; declared resource dialect is not the calling evaluation context"
                      if entry in self.mixed_entries else "recursive/dynamic occurrence inventory needs an explicit adapter seam"))
            result[gid] = SchemaGuard(gid, "unsupported_context", entry,
                Invariant(entry, "context-bound mixed-dialect evaluation" if entry in self.mixed_entries else "context-bound recursive/dynamic evaluation"),
                classification="unclassified", evidence=reason)
        self.guards = result

    def _reference_frames(self):
        """Private resources retain reference boundaries and isolate each field.

        References are resolved against the ORIGINAL graph, then made absolute.
        Private copies carry no borrowed $id/anchor; their assertions and owning
        dialect remain intact. This is not a merge/flatten of $ref siblings.
        Recursive/dynamic entries retain their original graph and fail closed
        for proof until an adapter supplies a sound occurrence representation.
        """
        docs, frames, aliases = copy.deepcopy(self.documents), {}, {}
        refs = {(r['source'], r['keyword']): r for r in self.references}
        def sanitize(node, key):
            if not isinstance(node, dict):
                return
            for keyword in ("$id", "$anchor", "$dynamicAnchor", "$recursiveAnchor"):
                node.pop(keyword, None)
            for keyword in ("$ref", "$dynamicRef", "$recursiveRef"):
                if keyword in node:
                    target = refs[(key, keyword)]["target"]
                    node[keyword] = target[0] + "#" + pointer(target[1])
            for relative, child in children(node):
                sanitize(child, (key[0], key[1] + relative))
        def frame(entry, target, trail, ancestors):
            alias = "https://pm.invalid/guard-isolation/" + digest([entry, trail]) + ".json"
            if alias in docs:
                raise IsolationError("private schema resource collision")
            value = copy.deepcopy(self.nodes[target])
            sanitize(value, target)
            if isinstance(value, dict):
                dialect = "https://json-schema.org/draft/2020-12/schema"
                for i in range(len(target[1]) + 1):
                    parent = at(self.documents[target[0]], target[1][:i])
                    if isinstance(parent, dict) and "$schema" in parent:
                        dialect = parent["$schema"]
                value["$schema"] = dialect
                value["$id"] = alias
            docs[alias] = value
            frames[(entry, trail)] = (alias, target)
            ancestors = {**ancestors, target: alias}
            def wire(key):
                for child, via in self.edges[key]:
                    if via == "$ref":
                        next_trail = trail + ((key, child),)
                        destination = ancestors.get(child)
                        if destination is None:
                            destination = frame(entry, child, next_trail, ancestors)
                        relative = key[1][len(target[1]):]
                        at(value, relative)["$ref"] = destination
                    elif via not in ("$dynamicRef", "$recursiveRef"):
                        wire(child)
            wire(target)
            return alias
        for entry, target in self.entry_targets.items():
            if entry not in self.special_entries:
                aliases[entry] = frame(entry, target, (), {})
        return docs, frames, aliases

    def _context(self, doc, path, reachable):
        if (doc, path) not in reachable:
            return "unreachable", "no evaluation path from declared roots " + encoded(self.roots), 1
        polarity = 1
        for i, part in enumerate(path):
            parent = at(self.documents[doc], path[:i])
            if part == "if" and isinstance(parent, dict):
                return "selector", "if condition selects a branch; cutting its clauses changes dispatch, not an acceptance guard", 1
            if part == "contains" and isinstance(parent, dict):
                return "selector", "contains child selects matching items; min/maxContains enforce count separately", 1
            if part in ("then", "else") and isinstance(parent, dict) and "if" not in parent:
                return "unreachable", "then/else without if has no effect in JSON Schema", 1
            if part == "contentSchema":
                return "unreachable", "contentSchema is an annotation in the supported standard validators", 1
            if part == "not" and isinstance(parent, dict):
                polarity *= -1
        return "guard", "", polarity

    def bind(self, guard_id: str, invariant: Invariant, evidence: str):
        """Declare an owner-proved alias (e.g. repeated copies of one input field)."""
        if not evidence.strip():
            raise IsolationError("invariant binding requires evidence")
        self.guards[guard_id] = replace(self.guards[guard_id], invariant=invariant, evidence=evidence)
        self.bindings.append({"guard": guard_id, "invariant": asdict(invariant), "evidence": evidence})

    def mutated(self, cuts: frozenset[str]):
        docs, frames, aliases = self._reference_frames()
        for gid in sorted(cuts):
            guard = self.guards.get(gid)
            if guard is None:
                continue                    # code guard, checked by Suite
            if guard.classification != "guard" or guard.predicate_count != 1 or guard.cut != SCHEMA_CUTS.get(guard.keyword):
                raise IsolationError(f"cannot cut {guard.classification} site {gid}")
            if (guard.entry_uri, guard.reference_trail) not in frames:
                raise IsolationError("assertion has no isolated evaluation occurrence " + gid)
            document, target = frames[(guard.entry_uri, guard.reference_trail)]
            relative_path = guard.path[len(target[1]):]
            node = at(docs[document], relative_path)
            keyword = guard.keyword
            if keyword == "$boolean":
                replacement = True if guard.polarity > 0 else False
                if relative_path:
                    at(docs[document], relative_path[:-1])[relative_path[-1]] = replacement
                else:
                    docs[document] = replacement
                continue
            if keyword == "required":
                node[keyword].remove(guard.member)
            elif keyword in ("dependentRequired", "dependencies"):
                trigger, name = json.loads(guard.member)
                node[keyword][trigger].remove(name)
            elif keyword == "minContains":
                if self.dialects[(guard.document, guard.path)] in (validators.Draft6Validator, validators.Draft7Validator):
                    # Legacy contains IS the implicit >=1 predicate; minContains
                    # is not a legacy keyword and cannot weaken it.
                    del node["contains"]
                else:
                    node[keyword] = 0
            elif keyword == "maxContains":
                del node[keyword]
            elif keyword == "oneOf:maxMatches":
                # Retain all alternatives and their assertions, remove ONLY exclusivity.
                branches = node.pop("oneOf")
                node.setdefault("allOf", []).append({"anyOf": branches})
            elif keyword == "type" and guard.polarity > 0:
                original_type = node.pop("type")
                membership = {key: node.pop(key) for key in ("const", "enum") if key in node}
                if membership:
                    # Wrong-type witnesses can pass; a well-typed foreign enum still refuses.
                    node.setdefault("allOf", []).append({"if": {"type": original_type}, "then": membership})
            else:
                del node[keyword]
            if guard.polarity < 0:
                # Only single-atom negative contexts reach this point. Compound
                # negative contexts are unclassified, never broad false cuts.
                node.setdefault("allOf", []).append(False)
        return SchemaView(docs, self.roots, self.formats, aliases, self.approved_entries)


class SchemaView:
    def __init__(self, documents, roots, formats, aliases=None, approved_entries=None):
        self.documents, self.roots, self.formats = documents, roots, formats
        self.aliases = aliases or {}
        self.approved_entries = approved_entries or {}
        self.undeclared_entries = set()
        self.registry = Registry().with_resources((uri, Resource.from_contents(doc, default_specification=DRAFT202012))
            for uri, doc in documents.items()).crawl()
        self._validators = {}
        self._missing_formats = set()
        self._dialects = {}
        self.consumed_entries = set()
        def formats(node, dialect, resolver):
            if isinstance(node, dict):
                resolver = resolver.in_subresource(Resource.from_contents(node, default_specification=DRAFT202012))
                dialect = validators.validator_for(node, default=dialect)
                self._dialects[id(node)] = dialect
                for keyword in ("$ref", "$dynamicRef", "$recursiveRef"):
                    if keyword in node:
                        try:
                            resolver.lookup(node[keyword])
                        except Exception as exc:
                            raise IsolationError("unresolved mutation-view reference: " + node[keyword]) from exc
                if "format" in node and node["format"] not in self.formats.checkers:
                    self._missing_formats.add(node["format"])
                for _, child in children(node):
                    formats(child, dialect, resolver)
        for uri, document in self.documents.items():
            formats(document, validators.Draft202012Validator, self.registry.resolver(uri))

    def validator(self, entry: str):
        base, fragment = urldefrag(entry)
        canonical = self.approved_entries.get(base + "#" + unquote(fragment))
        if canonical is None:
            self.undeclared_entries.add(entry)
            raise IsolationError("consumed schema entry lacks a declared occurrence mapping: " + entry + "; add it to SchemaCatalog.roots")
        self.consumed_entries.update(root for root in self.roots if self.approved_entries.get(
            urldefrag(root)[0] + "#" + unquote(urldefrag(root)[1])) == canonical)
        self.consumed_entries.add(canonical)
        if self._missing_formats:
            raise IsolationError("format checker unavailable: " + ", ".join(sorted(self._missing_formats)) + "; supply the lane's enforced format checker")
        if entry in self._validators:
            return self._validators[entry]
        requested = entry
        entry = self.aliases.get(canonical, canonical)
        base, fragment = urldefrag(entry)
        document = self.documents.get(base)
        if isinstance(document, dict) and "$id" in document:
            # Resolve an alias through its canonical root before following
            # relative references. Do not apply a nested relative $id twice.
            entry = joined(base, document["$id"]) + ("#" + fragment if fragment else "")
        resolved = self.registry.resolver().lookup(entry)
        schema = resolved.contents
        # Use the resolved base (including nested $id), not an invented flat wrapper.
        cls = self._dialects.get(id(schema), validators.Draft202012Validator)
        validator = cls(schema, registry=self.registry, format_checker=self.formats, _resolver=resolved.resolver)
        self._validators[requested] = validator
        return validator


class MemoryGate:
    """Sample between SERIAL callbacks; this is a guard, not an allocation sandbox.

    Peak RSS is checked before/after every callback. Large callbacks must be
    bounded by their lane. Low-memory pause samples free's GiB available value.
    """
    def __init__(self, max_rss=2048, pause_when_low=0, resume_at=None, poll=120, low_timeout=2700,
                 *, available=None, sleep=time.sleep, clock=time.monotonic):
        def finite(value):
            try:
                return type(value) in (int, float) and math.isfinite(value)
            except OverflowError:
                return False
        if not all(finite(x) for x in (max_rss, pause_when_low, poll, low_timeout)) or (resume_at is not None and not finite(resume_at)):
            raise IsolationError("memory limits must be finite numeric thresholds")
        self.max_rss, self.low = max_rss, pause_when_low
        self.resume = resume_at if resume_at is not None else pause_when_low + 1
        self.poll, self.timeout = poll, low_timeout
        self.available = available or self.available_gib
        self.sleep, self.clock = sleep, clock
        if max_rss < 0 or pause_when_low < 0 or self.resume < pause_when_low or poll <= 0 or low_timeout <= 0:
            raise IsolationError("invalid memory limits")

    @staticmethod
    def available_gib():
        for line in Path("/proc/meminfo").read_text().splitlines():
            if line.startswith("MemAvailable:"):
                return int(line.split()[1]) // (1024 * 1024)
        raise IsolationError("MemAvailable unavailable; supply a platform available-memory callback")

    def _check_rss(self):
        peak = resource.getrusage(resource.RUSAGE_SELF).ru_maxrss / (1024 * 1024 if sys.platform == "darwin" else 1024)
        if self.max_rss and peak > self.max_rss:
            raise IsolationError(f"max-rss exceeded: {peak:.1f} MiB > {self.max_rss}")

    def check(self):
        self._check_rss()
        if not self.low:
            return
        available = self.available()
        if available < self.low:
            low_since = self.clock()
            while available < self.resume:
                if available < self.low:
                    if low_since is None:
                        low_since = self.clock()
                    if self.clock() - low_since >= self.timeout:
                        raise IsolationError("available memory stayed below floor for low-timeout")
                else:
                    low_since = None
                print(f"guard-isolation paused: {available} GiB available; resume at {self.resume}", file=sys.stderr, flush=True)
                self.sleep(self.poll)
                available = self.available()
                self._check_rss()
            self._check_rss()       # resume cannot escape a peak accumulated in the pause


def typed_changes(left, right, path=()):
    """Provenance only: several synchronized copies may express ONE defect."""
    if type(left) is not type(right):
        return [pointer(path)]
    if isinstance(left, dict):
        def key_label(k):
            return k if type(k) is str else "@" + encoded(evidence_value(k))
        left_keys = {encoded(evidence_value(k)): k for k in left}
        right_keys = {encoded(evidence_value(k)): k for k in right}
        changes = []
        for token in sorted(left_keys.keys() | right_keys.keys()):
            key = left_keys[token] if token in left_keys else right_keys[token]
            if token in left_keys and token in right_keys:
                changes.extend(typed_changes(left[left_keys[token]], right[right_keys[token]], path + (key_label(key),)))
            else:
                changes.append(pointer(path + (key_label(key),)))
        return changes
    if isinstance(left, (list, tuple)) and len(left) == len(right):
        return sum((typed_changes(a, b, path + (i,)) for i, (a, b) in enumerate(zip(left, right))), [])
    return [] if digest(left) == digest(right) else [pointer(path)]


@dataclass(frozen=True)
class Guard:
    """One declared input invariant. None passes; the exact code refuses."""
    name: str
    invariant: Invariant
    refusal_code: str
    predicate: Callable[[Any, Any], str | None]

    def __post_init__(self):
        if not self.name.strip() or not self.refusal_code.strip() or not callable(self.predicate):
            raise IsolationError('guard needs a unique name, refusal code and predicate')

    @property
    def id(self):
        return self.name


class GuardRefusal(Exception):
    """A tag alone is insufficient: the runner verifies table-issued identity."""
    def __init__(self, guard, code):
        self.guard, self.code = guard, code
        super().__init__(code)


def _always_pass(value, context):
    return None


class GuardTable:
    def __init__(self, guards):
        rows = tuple(guards)
        if any(type(g) is not Guard for g in rows) or len({g.name for g in rows}) != len(rows):
            raise IsolationError('duplicate guard name or invalid Guard row')
        self._original = {g.name: g for g in rows}
        self._entries = dict(self._original)
        self._issued = []
        self._errors = []
        self._calls = []
        self._root = self._context = None
        self._bound = False
        self._in_predicate = False
        self._purity_before = None
        self._matrix_frame = None
        self._schema = None

    @property
    def guards(self):
        return types.MappingProxyType(self._original)

    def _bind(self, value, context, cuts):
        if self._bound or not set(cuts) <= self._original.keys():
            raise IsolationError('table reused or unknown guard cut')
        self._root, self._context, self._bound = value, context, True
        # The sole Python cut operation. All function/code/state objects remain original.
        self._entries = {name: replace(row, predicate=_always_pass) if name in cuts else row
                         for name, row in self._original.items()}
        if self._schema:
            self._schema.bind(cuts)

    def _test(self, row, value, context):
        caller = sys._getframe(1)
        if (not self._bound or value is not self._root or context is not self._context or
                not (caller.f_code is GuardTable.require.__code__ and caller.f_locals.get('self') is self or
                     caller.f_code is _SchemaBinding.validate.__code__ and caller.f_locals.get('self') is self._schema and caller.f_locals.get('table') is self or
                     caller is self._matrix_frame)):
            self._errors.append('predicate evaluation outside authorized engine entry')
            raise IsolationError(self._errors[-1])
        if self._in_predicate:
            self._errors.append('nested guard evaluation')
            raise IsolationError('guard predicates cannot invoke guards')
        self._in_predicate = True
        try:
            self._purity_before = _data_snapshot(value, context)
            result = row.predicate(value, context)
            if result is not None and (type(result) is not str or result != row.refusal_code):
                raise IsolationError('predicate must return None or its exact refusal code: ' + row.name)
            self._check_purity(value, context)
            return result
        except BaseException as exc:
            self._errors.append(type(exc).__name__ + ': ' + str(exc))
            raise
        finally:
            # Even a caught/translated predicate exception cannot hide a mutation.
            try:
                if self._purity_before is not None:
                    self._check_purity(value, context)
            finally:
                self._purity_before = None
                self._in_predicate = False

    def _check_purity(self, value, context):
        if _data_snapshot(value, context) != self._purity_before:
            error = 'guard predicate mutated input/context'
            self._errors.append(error)
            raise IsolationError(error)

    def require(self, name, value, context=None):
        if not self._bound or value is not self._root or context is not self._context:
            self._errors.append('require must use the complete bound value and context')
            raise IsolationError(self._errors[-1])
        if name not in self._entries:
            self._errors.append('guard missing from table: ' + str(name))
            raise IsolationError(self._errors[-1])
        self._calls.append(name)
        row = self._entries[name]
        code = self._test(row, value, context)
        if code is not None:
            self._refuse(name, code)

    def _refuse(self, name, code):
        refusal = GuardRefusal(name, code)
        self._issued.append(refusal)
        raise refusal

    def validate(self, entry, value, context=None):
        """Invoke a complete original/cut schema; only the engine issues tags."""
        if not self._schema or not self._bound or value is not self._root or context is not self._context:
            self._errors.append('schema validation needs the bound complete input')
            raise IsolationError(self._errors[-1])
        self._schema.validate(self, entry, value, context)

    def _restore(self):
        self._entries = dict(self._original)
        self._bound = False
        self._root = self._context = None
        self._issued.clear()
        self._errors.clear()
        self._calls.clear()


@dataclass
class Case:
    table: GuardTable
    check: Callable[[Any], bool]
    context: Any = None


@dataclass(frozen=True)
class NonGuard:
    """One exact static site, with a reviewer-checkable plumbing reason."""
    path: str
    function: str
    kind: str
    source: str
    reason: str


@dataclass
class Suite:
    name: str
    factory: Callable[..., Case]       # factory(value) or a fixed-family factory()
    controls: list[Control]
    negatives: list[Negative]
    checker_modules: tuple[str | Path, ...]
    repository_root: str | Path
    duplicates: list[Duplicate] = field(default_factory=list)
    non_guards: list[NonGuard] = field(default_factory=list)
    reset: Callable[[], None] | None = None
    reset_seams: list[NonGuard] = field(default_factory=list)


# Every form the outside-predicate scan accepts without a declaration, with its
# written totality argument at the stated boundary. Resource exhaustion,
# interpreter interruption and warnings promoted to errors are outside every
# argument. A node that matches no entry is an obligation: a table predicate or
# an exact reviewed NonGuard.
TOTAL_FORMS = {
    'statement:control-transfer': 'pass, break and continue only move the program counter.',
    'statement:expression': 'An expression statement discards a value; the expression is classified on its own.',
    'statement:try': 'Entering try runs no code and each handler is classified on its own; except* is excluded.',
    'statement:except-builtin': 'A bare except or unshadowed canonical builtin exception classes: matching is a subclass check with no user hook.',
    'statement:return-true': 'Returns the literal True, the engine success value.',
    'statement:executed-module-import': 'Module scope of a loaded module: the import already ran, its live binding is verified and no case runs it again.',
    'definition:function': 'def and lambda only build a function object; defaults, annotations and decorators are classified on their own in the enclosing scope.',
    'binding:name': 'Binding a plain name to a computed value runs no hook; unpacking, attribute and subscript targets and any __builtins__ binding are excluded.',
    'control:literal-test': 'if or a conditional expression on a builtin literal: literal truthiness has no failure path.',
    'expression:literal': 'Loading a compile-time constant cannot raise.',
    'expression:bound-name': 'A binding dominates the read: parameter, earlier sibling statement, loop, comprehension or handler target in its own body, or the certified module or builtin namespace; a deleted name or a handler name outside its handler is excluded.',
    'expression:identity-compare': 'is and is not compare identities with no user hook; every other comparison is an obligation.',
    'unary:not-literal': 'not on a builtin literal (None, bool, int, float, complex, str, bytes, Ellipsis): literal truthiness has no failure path.',
    'unary:sign-numeric-literal': 'Unary + or - on an exact int or float literal is defined for every value.',
    'unary:invert-int-literal': '~ on an exact int literal is defined for every value.',
    'display:sequence': 'A list or tuple display stores already computed values; star items are excluded.',
    'display:dict-literal-keys': 'A dict display whose keys are builtin literals, which always hash; ** and mixed str and bytes keys are excluded.',
    'display:set-literal-items': 'A set display whose items are builtin literals, which always hash; mixed str and bytes items are excluded.',
    'display:comprehension-shell': 'A list comprehension or generator shell only collects or wraps results; each for clause is its own obligation.',
    'display:covered-by-parent': 'An f-string field or a slice exists only under a JoinedStr or Subscript, which is itself an obligation.',
    'attribute:function-code': 'Reading __code__ on an unshadowed module-level Python function reads a fixed function slot.',
    'attribute:code-bytes': 'Reading co_code on that code object is defined for every code object.',
    'attribute:engine-callee': 'A callee read on the verified, unshadowed engine alias for a name present in the engine namespace.',
    'attribute:table-callee': 'require or validate read on the factory single fresh engine table; both are GuardTable methods.',
    'call:type-one-argument': 'Unshadowed canonical one-argument type(x) reads the object type with no user hook; star arguments are excluded.',
    'call:bool-literal': 'Unshadowed canonical bool on a builtin literal: literal truthiness has no failure path.',
    'call:table.require': 'Receiver is the factory single fresh table, the name is a literal inventory row, the value is the Case checker unrebound root parameter and the context is the Case context: the only remaining exits are the tagged refusal and errors inside the table row.',
    'constructor:Invariant': '__post_init__ raises only on a non-string or blank field; both arguments must be literal nonblank strings.',
    'constructor:Guard': '__post_init__ only strips name and code and tests callable; name and code must be literal nonblank strings and the predicate an unshadowed module-level callable.',
    'constructor:GuardTable': '__init__ raises only on a non-Guard row or a repeated name; the argument must be a literal sequence of total g.Guard calls with distinct literal names.',
    'constructor:Case': 'Dataclass with no __post_init__, __new__ or validating descriptor: argument binding, which is checked, is its whole boundary.',
    'constructor:Suite': 'Dataclass with no __post_init__, __new__ or validating descriptor; its only default factories are list: argument binding, which is checked, is its whole boundary.',
    'constructor:Control': 'Frozen dataclass with no __post_init__, __new__ or validating descriptor: argument binding, which is checked, is its whole boundary.',
    'constructor:Negative': 'Frozen dataclass with no __post_init__, __new__ or validating descriptor: argument binding, which is checked, is its whole boundary.',
    'constructor:NonGuard': 'Frozen dataclass with no __post_init__, __new__ or validating descriptor: argument binding, which is checked, is its whole boundary.',
    'constructor:Duplicate': 'Frozen dataclass with no __post_init__, __new__ or validating descriptor: argument binding, which is checked, is its whole boundary.',
}
_ENGINE_CONSTRUCTORS = {'Guard': Guard, 'GuardTable': GuardTable, 'Invariant': Invariant, 'Case': Case, 'Suite': Suite,
                        'Control': Control, 'Negative': Negative, 'NonGuard': NonGuard, 'Duplicate': Duplicate}
_BUILTIN_LITERALS = (type(None), bool, int, float, complex, str, bytes, type(Ellipsis))


def _names_bound_by(part):
    """Every name this one AST node binds, including forms with no ast.Name."""
    if isinstance(part, ast.Name):
        return set() if isinstance(part.ctx, ast.Load) else {part.id}
    if isinstance(part, ast.arg):
        return {part.arg}
    if isinstance(part, (ast.FunctionDef, ast.AsyncFunctionDef, ast.ClassDef, ast.ExceptHandler)):
        return {part.name} if part.name else set()
    if isinstance(part, (ast.Global, ast.Nonlocal)):
        return set(part.names)
    if isinstance(part, (ast.Import, ast.ImportFrom)):
        return {alias.asname or alias.name.split('.')[0] for alias in part.names}
    if type(part).__name__ in ('MatchAs', 'MatchStar', 'TypeVar', 'ParamSpec', 'TypeVarTuple'):
        return {part.name} if part.name else set()
    if type(part).__name__ == 'MatchMapping':
        return {part.rest} if part.rest else set()
    return set()


def _function_key(fn):
    fn = fn.__func__ if inspect.ismethod(fn) else fn
    if not inspect.isfunction(fn) or fn.__code__.co_name == '<lambda>':
        raise IsolationError('checker and Python predicates must be source-backed Python functions')
    return (str(Path(fn.__code__.co_filename).resolve()), fn.__code__.co_firstlineno,
            fn.__qualname__.replace('.<locals>.', '.'))


def _predicate_functions(table):
    return [row.predicate for row in table.guards.values() if not isinstance(row.predicate, _SchemaPredicate)]


def _relative(path, root):
    return str(Path(path).resolve().relative_to(root))


def static_scan(suite, table):
    """Conservative census only. Nothing here authorizes a Python cut."""
    root = Path(suite.repository_root).resolve()
    trusted = Path(__file__).resolve()
    pending = [(root / p).resolve() for p in suite.checker_modules]
    if not pending:
        raise IsolationError('checker_modules must name the complete source closure')
    pending.append(Path(_function_key(suite.factory)[0]))
    if suite.reset:
        pending.append(Path(_function_key(suite.reset)[0]))
    predicate_functions = {_function_key(fn): fn.__func__ if inspect.ismethod(fn) else fn for fn in _predicate_functions(table)}
    predicate_keys = set(predicate_functions)
    located_predicates = set()
    files, sites, imports, errors = {}, [], [], []
    allowed, reset_allowed = {}, {}
    automatic = {}
    for declaration in [*suite.non_guards, *suite.reset_seams]:
        path = (root / declaration.path).resolve()
        key = (str(path), declaration.function, declaration.kind, declaration.source)
        if key in allowed or not declaration.reason.strip() or not path.is_relative_to(root):
            raise IsolationError('invalid or duplicate non-guard declaration')
        allowed[key] = [declaration, 0]
        if declaration in suite.reset_seams:
            if suite.reset is None or declaration.kind != 'shared_state_write':
                raise IsolationError('reset seams need a reset function and shared_state_write kind')
            reset_allowed[key] = allowed[key]

    contexts, source_modules = {}, {}
    for _, module in list(sys.modules.items()):
        if not isinstance(module, types.ModuleType):
            continue
        filename = vars(module).get('__file__')
        if filename:
            path = Path(filename).resolve()
            contexts.setdefault(path, set()).add(vars(module).get('__package__') or '')
            source_modules.setdefault(path, []).append(module)

    def resolve_module(name, source, level=0, optional=False):
        """Follow Python's binding/search context without executing imports.

        Loaded bindings and PathFinder must agree. Custom finders, missing
        origins, namespace ambiguity and native repository code need a seam.
        """
        if level:
            packages = contexts.get(source, set())
            if len(packages) != 1 or not next(iter(packages), ''):
                errors.append({'kind': 'uncertified_import_binding', 'path': str(source), 'module': name, 'reason': 'unknown package context'})
                return set()
            try:
                name = importlib.util.resolve_name('.' * level + name, next(iter(packages)))
            except (ImportError, ValueError) as exc:
                errors.append({'kind': 'uncertified_import_binding', 'path': str(source), 'module': name, 'reason': str(exc)})
                return set()
        found, search = set(), None
        parts = name.split('.')
        for index in range(len(parts)):
            full = '.'.join(parts[:index + 1])
            loaded = sys.modules.get(full)
            spec = importlib.machinery.BuiltinImporter.find_spec(full) if index == 0 else None
            spec = spec or (importlib.machinery.FrozenImporter.find_spec(full) if index == 0 else None)
            spec = spec or importlib.machinery.PathFinder.find_spec(full, search)
            origin = getattr(spec, 'origin', None)
            loaded_origin = vars(loaded).get('__file__') if isinstance(loaded, types.ModuleType) else None
            if loaded_origin and origin not in ('built-in', 'frozen'):
                if not origin or Path(loaded_origin).resolve() != Path(origin).resolve():
                    errors.append({'kind': 'uncertified_import_binding', 'path': str(source), 'module': full,
                                   'reason': 'loaded origin disagrees with search path', 'loaded_origin': loaded_origin, 'search_origin': origin})
                    return found
            if spec is None or origin is None:
                certified_attribute = False
                if optional and index == len(parts) - 1:
                    parent_name, _, attribute = full.rpartition('.')
                    parent = sys.modules.get(parent_name)
                    if isinstance(parent, types.ModuleType) and attribute in vars(parent):
                        binding = vars(parent)[attribute]
                        bound_path = (vars(binding).get('__file__') if isinstance(binding, types.ModuleType) else
                                      binding.__code__.co_filename if inspect.isfunction(binding) else
                                      vars(sys.modules[binding.__module__]).get('__file__') if type(binding) is type and binding.__module__ in sys.modules else None)
                        certified_attribute = True
                        if bound_path and Path(bound_path).resolve().is_relative_to(root):
                            target = Path(bound_path).resolve()
                            if target.suffix != '.py' or not target.is_file():
                                certified_attribute = False
                            else:
                                found.add(target)
                                if isinstance(binding, types.ModuleType):
                                    contexts.setdefault(target, set()).add(vars(binding).get('__package__') or '')
                    elif parent is None:
                        # Dormant from-imports have not executed. Only a direct
                        # source declaration certifies an attribute binding.
                        for candidate in found:
                            if candidate.stem == parts[-2] or candidate.name == '__init__.py':
                                declarations = ast.parse(candidate.read_text()).body
                                certified_attribute = any(isinstance(part, (ast.FunctionDef, ast.AsyncFunctionDef, ast.ClassDef)) and part.name == attribute for part in declarations)
                                if certified_attribute:
                                    break
                if not certified_attribute:
                    errors.append({'kind': 'uncertified_import_binding', 'path': str(source), 'module': full,
                                   'reason': 'missing or ambiguous module origin'})
                return found
            if origin not in ('built-in', 'frozen'):
                target = Path(origin).resolve()
                if target.is_relative_to(root):
                    if target.suffix != '.py' or not target.is_file() or not isinstance(spec.loader, importlib.machinery.SourceFileLoader):
                        errors.append({'kind': 'unscannable_module', 'path': str(target), 'module': full})
                    else:
                        found.add(target)
                        package = full if spec.submodule_search_locations is not None else full.rpartition('.')[0]
                        contexts.setdefault(target, set()).add(package)
            search = vars(loaded).get('__path__', spec.submodule_search_locations) if isinstance(loaded, types.ModuleType) else spec.submodule_search_locations
            if search is not None and (type(search) not in (list, tuple) or not all(type(p) is str for p in search) or not search):
                errors.append({'kind': 'uncertified_import_binding', 'path': str(source), 'module': full, 'reason': 'unscannable package search path'})
                return found
            if index < len(parts) - 1 and search is None:
                if not optional or index != len(parts) - 2:
                    errors.append({'kind': 'uncertified_import_binding', 'path': str(source), 'module': name, 'reason': 'parent is not a package'})
                    return found
                # The final from-import may be a function/class attribute of a
                # non-package module; resolve it through that loaded binding.
                search = []
        return found

    while pending:
        path = pending.pop()
        if path == trusted or path in files:
            continue
        if not path.is_relative_to(root) or not path.is_file():
            errors.append({'kind': 'unscannable_module', 'path': str(path)})
            continue
        source = path.read_text()
        tree = ast.parse(source, filename=str(path))
        files[path] = {'path': _relative(path, root), 'sha256': hashlib.sha256(source.encode()).hexdigest()}
        parents = {child: node for node in ast.walk(tree) for child in ast.iter_child_nodes(node)}
        owners = {}
        def collect(node, owner=''):
            if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef, ast.ClassDef)):
                owner = owner + '.' + node.name if owner else node.name
            owners[node] = owner
            for child in ast.iter_child_nodes(node):
                collect(child, owner)
        collect(tree)
        # Conservative symbol closure: aliases retain loader provenance. A
        # conflicting assignment makes the name uncertain rather than safe.
        symbols = {name: {name} for name in ('eval', 'exec', 'compile', '__import__', 'getattr', 'globals', 'locals', 'vars')}
        for module in source_modules.get(path, []):
            for name, binding in vars(module).items():
                if isinstance(binding, types.ModuleType):
                    symbols.setdefault(name, set()).add(vars(binding).get('__name__', ''))
                elif inspect.isfunction(binding) or isinstance(binding, types.BuiltinFunctionType):
                    symbols.setdefault(name, set()).add((binding.__module__ or '') + '.' + binding.__name__)
        for part in ast.walk(tree):
            if isinstance(part, ast.Import):
                for alias in part.names:
                    symbols.setdefault(alias.asname or alias.name.split('.')[0], set()).add(alias.name if alias.asname else alias.name.split('.')[0])
            elif isinstance(part, ast.ImportFrom):
                for alias in part.names:
                    symbols.setdefault(alias.asname or alias.name, set()).add((part.module + '.' if part.module else '') + alias.name)
        def origins(node):
            if isinstance(node, ast.Name):
                return symbols.get(node.id, set())
            if isinstance(node, ast.Attribute):
                return {name + '.' + node.attr for name in origins(node.value)}
            return set()
        assignments = [part for part in ast.walk(tree) if isinstance(part, (ast.Assign, ast.AnnAssign, ast.NamedExpr))]
        for _ in range(len(assignments) + 1):
            changed = False
            for part in assignments:
                targets = part.targets if isinstance(part, ast.Assign) else [part.target]
                for target in targets:
                    if isinstance(target, ast.Name):
                        previous = symbols.setdefault(target.id, set())
                        new = origins(part.value) - previous
                        if new:
                            previous.update(new)
                            changed = True
            if not changed:
                break
        pure_builtins = {fn.__name__: fn for fn in (len, isinstance, type, str, int, bool, bytes, dict, list, tuple, set, frozenset, abs, all, any, min, max, sum)}
        pure_methods = {'get', 'keys', 'values', 'items', 'copy', 'count', 'index', 'startswith', 'endswith', 'isdigit', 'isdecimal', 'isnumeric', 'isascii', 'isalpha', 'isalnum', 'isspace', 'lower', 'upper', 'strip', 'lstrip', 'rstrip', 'split', 'rsplit', 'join', 'find', 'rfind', 'replace', 'hex'}
        shadowed = {part.name for part in ast.walk(tree) if isinstance(part, (ast.FunctionDef, ast.AsyncFunctionDef, ast.ClassDef))}
        shadowed.update(part.id for part in ast.walk(tree) if isinstance(part, ast.Name) and isinstance(part.ctx, ast.Store))
        shadowed.update(part.arg for part in ast.walk(tree) if isinstance(part, ast.arg))
        # Bindings other than the module's own top-level definitions and imports.
        local_bindings = set()
        for part in ast.walk(tree):
            if isinstance(part, (ast.FunctionDef, ast.AsyncFunctionDef, ast.ClassDef, ast.Import, ast.ImportFrom)) and not owners[parents[part]]:
                continue
            local_bindings |= _names_bound_by(part)
        shadowed |= local_bindings
        deleted_names = {part.id for part in ast.walk(tree) if isinstance(part, ast.Name) and isinstance(part.ctx, ast.Del)}
        handler_names = {part.name for part in ast.walk(tree) if isinstance(part, ast.ExceptHandler) and part.name}
        def data_expression(part, names, calls):
            if isinstance(part, ast.Name):
                return part.id in names
            if isinstance(part, ast.Subscript):
                return data_expression(part.value, names, calls)
            if isinstance(part, ast.Constant):
                return True
            if isinstance(part, ast.Call):
                return isinstance(part.func, ast.Name) and part.func.id in calls - shadowed and not origins(part.func) and all(data_expression(a, names, calls) for a in part.args)
            return False
        def builtin_is(name):
            modules = source_modules.get(path, [])
            if not modules or name not in vars(builtins):
                return False
            canonical = vars(builtins)[name]
            for module in modules:
                namespace = vars(module)
                environment = namespace.get('__builtins__')
                environment = vars(environment) if type(environment) is types.ModuleType else environment
                if type(environment) is not dict or namespace.get(name, environment.get(name)) is not canonical:
                    return False
            return True
        def module_name_bound(name):
            # The module's own namespace, else the builtins its functions actually see.
            modules = source_modules.get(path, [])
            if not modules:
                return False
            for module in modules:
                namespace = vars(module)
                environment = namespace.get('__builtins__')
                environment = vars(environment) if type(environment) is types.ModuleType else environment
                if name not in namespace and (type(environment) is not dict or name not in environment):
                    return False
            return True
        def engine_alias():
            modules = source_modules.get(path, [])
            return bool(modules) and 'g' not in shadowed and all(vars(module).get('g') is sys.modules[__name__] for module in modules)
        def literal_text(node):
            return isinstance(node, ast.Constant) and type(node.value) is str and bool(node.value.strip())
        def builtin_literal(node):
            return isinstance(node, ast.Constant) and type(node.value) in _BUILTIN_LITERALS
        def mixed_text(items):
            # Equal-hash str and bytes keys compare during construction; -bb turns that into an error.
            return {str, bytes} <= {type(item.value) for item in items}
        def bound_arguments(signature_of, node, *leading):
            if any(isinstance(arg, ast.Starred) for arg in node.args) or any(kw.arg is None for kw in node.keywords):
                return None
            try:
                return inspect.signature(signature_of).bind(*leading, *node.args, **{kw.arg: kw.value for kw in node.keywords}).arguments
            except TypeError:
                return None
        def engine_constructor_form(node):
            """Automatic only when the argument boundary proves its validation cannot fire."""
            if not (isinstance(node.func, ast.Attribute) and isinstance(node.func.value, ast.Name) and node.func.value.id == 'g'):
                return None
            name = node.func.attr
            if name not in _ENGINE_CONSTRUCTORS or not engine_alias():
                return None
            arguments = bound_arguments(_ENGINE_CONSTRUCTORS[name], node)
            if arguments is None:
                return None
            if name == 'Invariant' and not (literal_text(arguments['subject']) and literal_text(arguments['predicate'])):
                return None
            if name == 'Guard':
                predicate = arguments['predicate']
                if not (literal_text(arguments['name']) and literal_text(arguments['refusal_code']) and isinstance(predicate, ast.Name) and
                        predicate.id not in local_bindings and all(callable(vars(module).get(predicate.id)) for module in source_modules[path])):
                    return None
            if name == 'GuardTable':
                rows = arguments['guards']
                if not isinstance(rows, (ast.List, ast.Tuple)) or any(not isinstance(row, ast.Call) or ast.unparse(row.func) != 'g.Guard' or not engine_constructor_form(row) for row in rows.elts):
                    return None
                names = [bound_arguments(Guard, row)['name'].value for row in rows.elts]
                if len(set(names)) != len(names):
                    return None
            return 'constructor:' + name
        def enclosing_function(node):
            node = parents.get(node)
            while node is not None and not isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef, ast.Lambda, ast.ClassDef)):
                node = parents.get(node)
            return node
        def binders(scope, name):
            return [part for part in ast.walk(scope) if part is not scope and name in _names_bound_by(part)]
        def single_assignment(scope, name):
            """The one direct `name = value` statement, when nothing else in the scope binds it."""
            found = binders(scope, name)
            if len(found) != 1 or not isinstance(found[0], ast.Name):
                return None
            statement = parents[found[0]]
            return statement if isinstance(statement, ast.Assign) and statement.targets == found and statement in scope.body else None
        def table_factory(node):
            """The factory scope that binds `table` once to a fresh engine table, read from its direct checker."""
            checker = enclosing_function(node)
            scope = enclosing_function(checker) if isinstance(checker, ast.FunctionDef) else None
            if not isinstance(scope, ast.FunctionDef) or not engine_alias():
                return None
            statement = single_assignment(scope, 'table')
            maker = statement.value if statement else None
            return scope if isinstance(maker, ast.Call) and ast.unparse(maker.func) in ('g.GuardTable', 'g.schema_table') else None
        def proved_none(expression, scope):
            if expression is None or isinstance(expression, ast.Constant):
                return expression is None or expression.value is None
            statement = single_assignment(scope, expression.id) if isinstance(expression, ast.Name) else None
            return statement is not None and isinstance(statement.value, ast.Constant) and statement.value.value is None
        def table_require_total(node):
            if not (isinstance(node.func, ast.Attribute) and node.func.attr == 'require' and isinstance(node.func.value, ast.Name) and node.func.value.id == 'table'):
                return False
            scope = table_factory(node)
            arguments = bound_arguments(GuardTable.require, node, None)
            if scope is None or arguments is None:
                return False
            checker = enclosing_function(node)
            positional = [*checker.args.posonlyargs, *checker.args.args]
            if not positional or binders(checker, positional[0].arg) != [positional[0]]:
                return False
            guard, root, context = arguments['name'], arguments['value'], arguments.get('context')
            if not (isinstance(guard, ast.Constant) and type(guard.value) is str and guard.value in table.guards and
                    isinstance(root, ast.Name) and root.id == positional[0].arg):
                return False
            # This function is the Case checker, so the engine passes the bound root to it.
            cases = []
            for part in ast.walk(scope):
                if isinstance(part, ast.Call) and ast.unparse(part.func) == 'g.Case':
                    bound = bound_arguments(Case, part)
                    if bound and isinstance(bound['table'], ast.Name) and bound['table'].id == 'table' and isinstance(bound['check'], ast.Name) and bound['check'].id == checker.name:
                        cases.append(bound)
            if len(cases) != 1 or len(binders(scope, checker.name)) != 1:
                return False
            case_context = cases[0].get('context')
            if proved_none(context, scope) and proved_none(case_context, scope):
                return True
            return (isinstance(context, ast.Name) and isinstance(case_context, ast.Name) and context.id == case_context.id and
                    single_assignment(scope, context.id) is not None)
        def call_total_form(node):
            if (isinstance(node.func, ast.Name) and node.func.id in ('type', 'bool') and node.func.id not in shadowed and builtin_is(node.func.id) and
                    len(node.args) == 1 and not node.keywords and not isinstance(node.args[0], ast.Starred)):
                if node.func.id == 'type':
                    return 'call:type-one-argument'
                if builtin_literal(node.args[0]):
                    return 'call:bool-literal'
            return engine_constructor_form(node) or ('call:table.require' if table_require_total(node) else None)
        exempt = set()
        predicate_data = {}
        for node in ast.walk(tree):
            if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef)):
                first = min([node.lineno] + [d.lineno for d in node.decorator_list])
                key = (str(path), first, owners[node])
                if key in predicate_keys:
                    located_predicates.add(key)
                    function = predicate_functions[key]
                    certified_calls = {name for name, binding in pure_builtins.items()
                                       if function.__globals__.get(name, function.__builtins__.get(name)) is binding}
                    data_names = {a.arg for a in [*node.args.posonlyargs, *node.args.args, *node.args.kwonlyargs]}
                    for part in ast.walk(node):
                        if isinstance(part, ast.Assign) and data_expression(part.value, data_names, certified_calls):
                            data_names.update(t.id for t in part.targets if isinstance(t, ast.Name))
                    # Only the predicate body; defaults/decorators are not predicates.
                    def predicate_body(part):
                        if isinstance(part, (ast.FunctionDef, ast.AsyncFunctionDef, ast.ClassDef, ast.Lambda)):
                            errors.append({'kind': 'nested_predicate_code', 'path': _relative(path, root), 'line': part.lineno})
                            return
                        exempt.add(part)
                        predicate_data[part] = (data_names, certified_calls)
                        for child in ast.iter_child_nodes(part):
                            predicate_body(child)
                    for statement in node.body:
                        predicate_body(statement)
        for node in ast.walk(tree):
            if isinstance(node, ast.stmt) and type(node).__name__ not in {
                'AnnAssign', 'Assert', 'Assign', 'AsyncFor', 'AsyncFunctionDef', 'AsyncWith', 'AugAssign', 'Break',
                'ClassDef', 'Continue', 'Delete', 'Expr', 'For', 'FunctionDef', 'Global', 'If', 'Import', 'ImportFrom',
                'Match', 'Nonlocal', 'Pass', 'Raise', 'Return', 'Try', 'TryStar', 'TypeAlias', 'While', 'With'}:
                errors.append({'kind': 'unknown_statement', 'node': type(node).__name__, 'path': _relative(path, root), 'line': node.lineno})
            if isinstance(node, (ast.Import, ast.ImportFrom)):
                names = [(alias.name, 0, False) for alias in node.names] if isinstance(node, ast.Import) else [(node.module or '', node.level, False)]
                if isinstance(node, ast.ImportFrom):
                    if any(a.name == '*' for a in node.names):
                        errors.append({'kind': 'star_import', 'path': _relative(path, root), 'line': node.lineno})
                    names += [(((node.module + '.') if node.module else '') + a.name, node.level, True) for a in node.names if a.name != '*']
                for name, level, optional in names:
                    resolved = resolve_module(name, path, level, optional)
                    pending.extend(resolved)
                    imports.append({'from': _relative(path, root), 'module': name, 'repository_files': sorted(_relative(p, root) for p in resolved),
                                    'external': not bool(resolved), 'optional_attribute': optional})
                if not owners[node]:
                    missing = object()
                    for module in source_modules.get(path, []):
                        for alias in node.names:
                            local = alias.asname or (alias.name.split('.')[0] if isinstance(node, ast.Import) else alias.name)
                            actual = vars(module).get(local, missing)
                            if isinstance(node, ast.Import):
                                expected = sys.modules.get(alias.name if alias.asname else alias.name.split('.')[0], missing)
                            else:
                                package = vars(module).get('__package__') or ''
                                absolute = importlib.util.resolve_name('.' * node.level + (node.module or ''), package) if node.level else node.module
                                parent = sys.modules.get(absolute)
                                expected = vars(parent).get(alias.name, missing) if isinstance(parent, types.ModuleType) else missing
                            if expected is missing or actual is not expected:
                                errors.append({'kind': 'uncertified_import_binding', 'path': _relative(path, root), 'line': node.lineno,
                                               'module': alias.name, 'reason': 'live import alias differs from the resolved binding'})
            kind = None
            if isinstance(node, ast.Call):
                name = ast.unparse(node.func)
                bindings = origins(node.func)
                sensitive = {'eval', 'exec', 'compile', '__import__', 'getattr', 'globals', 'locals', 'vars', 'import_module', 'spec_from_file_location', 'settrace', 'setprofile', 'run_module', 'run_path'}
                if name.split('.')[-1] in sensitive or any(
                        origin.split('.')[0] in ('importlib', 'runpy') or any(token in sensitive for token in origin.split('.')) for origin in bindings):
                    errors.append({'kind': 'dynamic_code_or_import', 'path': _relative(path, root), 'line': node.lineno, 'source': ast.unparse(node)})
                if node in exempt:
                    data_names, certified_calls = predicate_data[node]
                    safe = (isinstance(node.func, ast.Name) and node.func.id in certified_calls - shadowed and not bindings or
                            isinstance(node.func, ast.Attribute) and node.func.attr in pure_methods and data_expression(node.func.value, data_names, certified_calls))
                    if not safe:
                        errors.append({'kind': 'predicate_purity_uncertified', 'path': _relative(path, root), 'line': node.lineno, 'source': ast.unparse(node),
                                       'reason': 'call binding/effects require an explicit reviewed seam; inline supported pure data operations'})
                if node not in exempt:
                    leaf = name.split('.')[-1]
                    if leaf in ('append', 'extend', 'insert', 'update', 'add', 'setdefault', 'clear', 'pop', 'remove', 'discard', 'write', 'write_text', 'write_bytes'):
                        kind = 'mutation_or_error_write'
                    elif call_total_form(node) is None:
                        table_call = (isinstance(node.func, ast.Attribute) and node.func.attr in ('require', 'validate') and
                                      isinstance(node.func.value, ast.Name) and node.func.value.id == 'table')
                        helper = leaf in ('require', 'refuse', 'reject', 'deny', 'fail', 'abort', 'exit', '_exit', 'throw') and not table_call
                        kind = 'refusal_helper' if helper else 'call_review'
            if node in exempt:
                if isinstance(node, (ast.AugAssign, ast.Delete, ast.NamedExpr)) or isinstance(node, (ast.Assign, ast.AnnAssign)) and any(
                        isinstance(part, (ast.Attribute, ast.Subscript)) for target in (node.targets if isinstance(node, ast.Assign) else [node.target]) for part in ast.walk(target)):
                    errors.append({'kind': 'predicate_mutation', 'path': _relative(path, root), 'line': node.lineno, 'source': ast.unparse(node)})
                continue
            if isinstance(node, ast.Raise):
                kind = 'raise'
            elif isinstance(node, ast.Assert):
                kind = 'assert'
            elif isinstance(node, ast.Return) and not (isinstance(node.value, ast.Constant) and node.value.value is True):
                kind = 'return'
            elif isinstance(node, (ast.Yield, ast.YieldFrom)):
                kind = 'yield'
            elif isinstance(node, (ast.Assign, ast.AnnAssign, ast.AugAssign, ast.Delete, ast.NamedExpr)):
                targets = node.targets if isinstance(node, (ast.Assign, ast.Delete)) else [node.target]
                if isinstance(node, (ast.AugAssign, ast.Delete)) or any(isinstance(x, (ast.Attribute, ast.Subscript)) for target in targets for x in ast.walk(target)):
                    kind = 'mutation_or_error_write'
                elif any(isinstance(x, ast.Name) and re.search(r'error|refus|reject|fail', x.id, re.I) for target in targets for x in ast.walk(target)):
                    kind = 'mutation_or_error_write'
            if kind:
                text = ast.unparse(node)
                key = (str(path), owners[node], kind, text)
                declaration = allowed.get(key)
                if declaration:
                    declaration[1] += 1
                # Only the exception operation is authorized. Evaluation of an
                # assert test/raise payload and neighboring statements is not.
                operation = node.test if isinstance(node, ast.Assert) else node
                sites.append({'id': _relative(path, root) + ':' + str(node.lineno) + ':' + str(node.col_offset) + ':' + kind,
                              'path': _relative(path, root), 'function': owners[node], 'line': node.lineno,
                              'exception_span': [operation.lineno, operation.end_lineno, operation.col_offset, operation.end_col_offset],
                              'exception_operation': 'RAISE_VARARGS' if kind in ('raise', 'assert') else 'CALL' if kind == 'refusal_helper' else '',
                              'kind': kind, 'source': text, 'non_guard': bool(declaration),
                              'reason': declaration[0].reason if declaration else ''})
        # A function's implicit None return is also a possible rejecting return.
        for node in ast.walk(tree):
            if not isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef)):
                continue
            first = min([node.lineno] + [d.lineno for d in node.decorator_list])
            if (str(path), first, owners[node]) in predicate_keys:
                continue
            if not node.body or not isinstance(node.body[-1], (ast.Return, ast.Raise)):
                text, kind = '<implicit None return>', 'implicit_return'
                declaration = allowed.get((str(path), owners[node], kind, text))
                if declaration:
                    declaration[1] += 1
                sites.append({'id': _relative(path, root) + ':' + str(node.end_lineno) + ':implicit_return',
                              'path': _relative(path, root), 'function': owners[node], 'line': node.end_lineno,
                              'kind': kind, 'source': text, 'non_guard': bool(declaration),
                              'reason': declaration[0].reason if declaration else ''})
        # Outside predicates the default is an obligation, not "no explicit
        # raise found". No sampled fixture can waive a dormant operation.
        def obligation(node, kind, *, reset_only=False):
            text = ast.unparse(node)
            key = (str(path), owners[node], kind, text)
            declaration = (reset_allowed if reset_only else allowed).get(key)
            if declaration:
                declaration[1] += 1
            position = node if hasattr(node, 'lineno') else node.iter
            sites.append({'id': _relative(path, root) + ':' + str(position.lineno) + ':' + str(position.col_offset) + ':' + kind,
                          'path': _relative(path, root), 'function': owners[node], 'line': position.lineno,
                          'exception_span': [position.lineno, position.end_lineno, position.col_offset, position.end_col_offset],
                          'kind': kind, 'source': text, 'non_guard': bool(declaration),
                          'reason': declaration[0].reason if declaration else ''})
        def bound_function(name):
            bindings = [vars(module).get(name) for module in source_modules.get(path, [])]
            return bindings[0] if bindings and all(value is bindings[0] for value in bindings) else None
        def attribute_form(node):
            # General attribute access and descriptors are obligations.
            if isinstance(node.value, ast.Name) and node.attr == '__code__':
                if node.value.id not in local_bindings and type(bound_function(node.value.id)) is types.FunctionType:
                    return 'attribute:function-code'
                return None
            if isinstance(node.value, ast.Attribute) and node.attr == 'co_code':
                return 'attribute:code-bytes' if node.value.attr == '__code__' and attribute_form(node.value) else None
            parent = parents.get(node)
            if isinstance(parent, ast.Call) and parent.func is node and isinstance(node.value, ast.Name):
                if node.value.id == 'table' and node.attr in ('require', 'validate') and table_factory(node):
                    return 'attribute:table-callee'
                if node.value.id == 'g' and engine_alias() and node.attr in vars(sys.modules[__name__]):
                    return 'attribute:engine-callee'
            return None
        def target_names(target):
            return {part.id for part in ast.walk(target) if isinstance(part, ast.Name) and isinstance(part.ctx, ast.Store)}
        def statement_binds(statement, name):
            if isinstance(statement, (ast.FunctionDef, ast.AsyncFunctionDef, ast.ClassDef)):
                return name == statement.name
            if isinstance(statement, (ast.Import, ast.ImportFrom)):
                return any(name == (alias.asname or (alias.name.split('.')[0] if isinstance(statement, ast.Import) else alias.name)) for alias in statement.names)
            if isinstance(statement, (ast.Assign, ast.AnnAssign)):
                return statement.value is not None and any(name in target_names(target) for target in (statement.targets if isinstance(statement, ast.Assign) else [statement.target]))
            return False
        def total_name(node):
            name, child = node.id, node
            if name in deleted_names:
                return False
            while child in parents:
                parent = parents[child]
                if isinstance(parent, (ast.ListComp, ast.SetComp, ast.DictComp, ast.GeneratorExp)):
                    # Iteration itself is a separate reviewed obligation.
                    if child not in parent.generators and any(name in target_names(gen.target) for gen in parent.generators):
                        return True
                if isinstance(parent, (ast.For, ast.AsyncFor)) and child in parent.body and name in target_names(parent.target):
                    return True
                if isinstance(parent, ast.ExceptHandler) and child in parent.body and parent.name == name:
                    return True
                for field in ('body', 'orelse', 'finalbody'):
                    siblings = getattr(parent, field, None)
                    if isinstance(siblings, list) and child in siblings:
                        # A handler target is implicitly deleted when its handler ends.
                        if name not in handler_names and any(statement_binds(statement, name) for statement in siblings[:siblings.index(child)]):
                            return True
                # Defaults, annotations and decorators run in the enclosing scope.
                if isinstance(parent, (ast.FunctionDef, ast.AsyncFunctionDef, ast.Lambda)) and (child is parent.body or isinstance(parent.body, list) and child in parent.body):
                    args = parent.args
                    if name not in handler_names and name in {arg.arg for arg in [*args.posonlyargs, *args.args, *args.kwonlyargs, *([args.vararg] if args.vararg else []), *([args.kwarg] if args.kwarg else [])]}:
                        return True
                    # Any binding form makes the name local, including nested
                    # definitions, imports, handler targets and match captures.
                    local = any(part is not parent and name in _names_bound_by(part) and not isinstance(part, (ast.Global, ast.Nonlocal)) and
                                (owners[parents[part]] if isinstance(part, (ast.FunctionDef, ast.AsyncFunctionDef, ast.ClassDef)) else owners.get(part)) == owners[parent]
                                for part in ast.walk(parent))
                    declared = any(owners.get(part) == owners[parent] and isinstance(part, (ast.Global, ast.Nonlocal)) and name in part.names for part in ast.walk(parent))
                    if local and not declared:
                        return False  # binding exists, but does not dominate the read
                child = parent
            return module_name_bound(name)
        def unary_form(node):
            # Certified per operator against the exact literal type; all else is an obligation.
            if not isinstance(node.operand, ast.Constant):
                return None
            literal = type(node.operand.value)
            if isinstance(node.op, ast.Not) and literal in _BUILTIN_LITERALS:
                return 'unary:not-literal'
            if isinstance(node.op, (ast.UAdd, ast.USub)) and literal in (int, float):
                return 'unary:sign-numeric-literal'
            if isinstance(node.op, ast.Invert) and literal is int:
                return 'unary:invert-int-literal'
            return None
        def total_form(node):
            """The written argument that this node cannot raise; None is an obligation.

            '' marks syntax with no operation of its own or a node another check
            already classifies as an explicit site.
            """
            if '__builtins__' in _names_bound_by(node):
                return None
            if isinstance(node, (ast.mod, ast.arguments, ast.arg, ast.keyword, ast.alias, ast.withitem, ast.match_case, ast.pattern,
                                 ast.expr_context, ast.boolop, ast.operator, ast.unaryop, ast.cmpop)):
                return ''
            if isinstance(node, (ast.Raise, ast.Assert, ast.Delete, ast.AugAssign, ast.Global, ast.Nonlocal, ast.Yield, ast.YieldFrom)):
                return ''
            if isinstance(node, ast.Return):
                return 'statement:return-true' if isinstance(node.value, ast.Constant) and node.value.value is True else ''
            if isinstance(node, (ast.Pass, ast.Break, ast.Continue)):
                return 'statement:control-transfer'
            if isinstance(node, ast.Expr):
                return 'statement:expression'
            if isinstance(node, ast.Try):
                return 'statement:try'
            if isinstance(node, ast.ExceptHandler):
                caught = [] if node.type is None else node.type.elts if isinstance(node.type, ast.Tuple) else [node.type]
                return 'statement:except-builtin' if all(isinstance(item, ast.Name) and item.id not in shadowed and builtin_is(item.id) and
                                                          isinstance(vars(builtins)[item.id], type) and issubclass(vars(builtins)[item.id], BaseException)
                                                          for item in caught) else None
            if isinstance(node, (ast.Import, ast.ImportFrom)):
                return 'statement:executed-module-import' if not owners[node] and source_modules.get(path) else None
            if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef, ast.Lambda)):
                return 'definition:function'
            if isinstance(node, (ast.Assign, ast.AnnAssign, ast.NamedExpr)):
                return ''  # the target node carries the binding or the obligation
            if isinstance(node, (ast.If, ast.IfExp)):
                return 'control:literal-test' if builtin_literal(node.test) else None
            if isinstance(node, ast.Constant):
                return 'expression:literal'
            if isinstance(node, ast.Name):
                if isinstance(node.ctx, ast.Load):
                    return 'expression:bound-name' if total_name(node) else None
                return 'binding:name' if isinstance(node.ctx, ast.Store) else ''
            if isinstance(node, ast.Attribute):
                return attribute_form(node) if isinstance(node.ctx, ast.Load) else ''
            if isinstance(node, ast.Subscript):
                return None if isinstance(node.ctx, ast.Load) else ''
            if isinstance(node, ast.Compare):
                return 'expression:identity-compare' if all(isinstance(op, (ast.Is, ast.IsNot)) for op in node.ops) else None
            if isinstance(node, ast.UnaryOp):
                return unary_form(node)
            if isinstance(node, (ast.List, ast.Tuple)):
                return 'display:sequence' if isinstance(node.ctx, ast.Load) else None if isinstance(node.ctx, ast.Store) else ''
            if isinstance(node, ast.Dict):
                return 'display:dict-literal-keys' if all(key is not None and builtin_literal(key) for key in node.keys) and not mixed_text(node.keys) else None
            if isinstance(node, ast.Set):
                return 'display:set-literal-items' if all(builtin_literal(item) for item in node.elts) and not mixed_text(node.elts) else None
            if isinstance(node, (ast.ListComp, ast.GeneratorExp)):
                return 'display:comprehension-shell'
            if isinstance(node, ast.FormattedValue) and isinstance(parents.get(node), ast.JoinedStr) or isinstance(node, ast.Slice):
                return 'display:covered-by-parent'
            if isinstance(node, ast.Call):
                return None if any(keyword.arg is None for keyword in node.keywords) else call_total_form(node) or ''
            return None
        functions = [node for node in ast.walk(tree) if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef))]
        function_bindings = {}
        for fn in functions:
            own = [part for part in ast.walk(fn) if owners[part] == owners[fn]]
            declared_shared = {name for part in own if isinstance(part, (ast.Global, ast.Nonlocal)) for name in part.names}
            locals_ = {a.arg for a in [*fn.args.posonlyargs, *fn.args.args, *fn.args.kwonlyargs]}
            locals_.update(part.id for part in own if isinstance(part, ast.Name) and isinstance(part.ctx, ast.Store))
            locals_.difference_update(declared_shared)
            # Unknown/free roots and aliases of them remain shared. A local
            # binding never certifies the object to which it was assigned.
            bindings_shared = declared_shared | {part.id for part in own if isinstance(part, ast.Name) and isinstance(part.ctx, ast.Load) and part.id not in locals_}
            shared = set(bindings_shared)
            for _ in range(len(own) + 1):
                prior = set(shared)
                for part in own:
                    if isinstance(part, (ast.Assign, ast.AnnAssign, ast.NamedExpr)) and part.value is not None:
                        if any(isinstance(x, ast.Name) and x.id in shared for x in ast.walk(part.value)):
                            targets = part.targets if isinstance(part, ast.Assign) else [part.target]
                            shared.update(x.id for target in targets for x in ast.walk(target) if isinstance(x, ast.Name))
                if prior == shared:
                    break
            function_bindings[owners[fn]] = (bindings_shared, shared)
        for node in ast.walk(tree):
            if isinstance(node, ast.Call) and isinstance(node.func, ast.Attribute) and node.func.attr == 'require' and isinstance(node.func.value, ast.Name) and node.func.value.id == 'table':
                name = node.args[0] if node.args else next((kw.value for kw in node.keywords if kw.arg == 'name'), None)
                if not isinstance(name, ast.Constant) or type(name.value) is not str:
                    errors.append({'kind': 'dynamic_table_name', 'path': _relative(path, root), 'line': node.lineno})
                elif name.value not in table.guards:
                    errors.append({'kind': 'missing_table_entry', 'path': _relative(path, root), 'line': node.lineno, 'guard': name.value})
            bindings_shared, shared = function_bindings.get(owners[node], (set(), set()))
            write = isinstance(node, (ast.Global, ast.Nonlocal))
            if owners[node] and isinstance(node, (ast.Assign, ast.AnnAssign, ast.AugAssign, ast.Delete, ast.NamedExpr)):
                targets = node.targets if isinstance(node, (ast.Assign, ast.Delete)) else [node.target]
                write = any(isinstance(target, ast.Name) and target.id in bindings_shared or
                            any(isinstance(part, ast.Attribute) or isinstance(part, ast.Subscript) and
                                any(isinstance(x, ast.Name) and x.id in shared for x in ast.walk(part.value)) for part in ast.walk(target))
                            for target in targets)
            if owners[node] and isinstance(node, ast.Call) and isinstance(node.func, ast.Attribute) and node.func.attr in (
                    'append', 'extend', 'insert', 'update', 'add', 'setdefault', 'clear', 'pop', 'remove', 'discard', '__setitem__', '__setattr__'):
                write = any(isinstance(part, ast.Name) and part.id in shared for part in ast.walk(node.func.value))
            if write:
                obligation(node, 'shared_state_write', reset_only=True)
            if node in exempt:
                continue
            if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef)):
                for decorator in node.decorator_list:
                    obligation(decorator, 'implicit_call')
            # Explicit allowlist: unknown syntax and any form without a written
            # argument cannot inherit a safe default.
            form = total_form(node)
            if form is None:
                obligation(node, 'data_operation')
            elif form:
                automatic[form] = automatic.get(form, 0) + 1
    for key, (declaration, matches) in allowed.items():
        if matches != 1:
            errors.append({'kind': 'non_guard_not_exactly_one_site', 'declaration': asdict(declaration), 'matches': matches})
    for path, line, function in predicate_keys:
        if Path(path) not in files:
            errors.append({'kind': 'predicate_outside_scanned_closure', 'path': path, 'line': line})
        elif (path, line, function) not in located_predicates:
            errors.append({'kind': 'predicate_source_not_found', 'path': path, 'line': line, 'function': function})
    return {'status': 'FAIL' if errors or any(not s['non_guard'] for s in sites) else 'PASS',
            'files': sorted(files.values(), key=lambda f: f['path']), 'imports': imports,
            'sites': sites, 'errors': errors, 'predicate_functions': sorted([list(k) for k in predicate_keys]),
            'automatic_totals': {form: {'count': automatic[form], 'reason': TOTAL_FORMS[form]} for form in sorted(automatic)},
            'review': 'Every non-guard reason and each predicate body versus its declared field/predicate needs review.'}


def _state_objects(case, root):
    """Keep references, not copies. Reused mutable state fails before execution."""
    result, seen = [], set()
    def visit(obj):
        if id(obj) in seen:
            return
        seen.add(id(obj))
        if isinstance(obj, types.ModuleType):
            source = vars(obj).get('__file__')
            if source and Path(source).resolve().is_relative_to(root) and Path(source).resolve() != Path(__file__).resolve():
                for name, value in vars(obj).items():
                    if not name.startswith('__'):
                        visit(value)
        elif type(obj) in (dict, list, set, bytearray):
            result.append(obj)
            values = list(obj.keys()) + list(obj.values()) if type(obj) is dict else list(obj)
            for value in values:
                visit(value)
        elif type(obj) in (tuple, frozenset):
            for value in obj:
                visit(value)
        elif inspect.ismethod(obj):
            visit(obj.__self__)
            visit(obj.__func__)
        elif inspect.isfunction(obj):
            source = Path(obj.__code__.co_filename).resolve()
            if source == Path(__file__).resolve():
                return
            if not source.is_relative_to(root):
                raise IsolationError('state_shared_across_cases: cannot certify external function graph: ' + obj.__qualname__)
            for cell in obj.__closure__ or ():
                try:
                    contents = cell.cell_contents
                except ValueError:
                    continue
                visit(contents)
            visit(obj.__defaults__)
            visit(obj.__kwdefaults__)
            visit(obj.__dict__)
            # Ignore empty function attribute dictionaries: source functions may
            # be shared, but stateful attributes may not be shared across cases.
            if not obj.__dict__ and result and result[-1] is obj.__dict__:
                result.pop()
            for name in obj.__code__.co_names:
                if name in obj.__globals__:
                    visit(obj.__globals__[name])
        elif isinstance(obj, type):
            if obj.__module__ == 'builtins':
                return
            if type(obj) is not type:
                raise IsolationError('state_shared_across_cases: cannot certify metaclass graph')
            module = sys.modules.get(obj.__module__)
            source = vars(module).get('__file__') if module else None
            if source and Path(source).resolve() == Path(__file__).resolve():
                return
            if not source or not Path(source).resolve().is_relative_to(root):
                raise IsolationError('state_shared_across_cases: cannot certify class graph: ' + obj.__name__)
            # Classes are themselves mutable. Their dictionaries, bases and
            # descriptors may also retain shared data independently of instances.
            result.append(obj)
            for base in obj.__bases__:
                visit(base)
            for name, value in vars(obj).items():
                if name not in ('__dict__', '__weakref__'):
                    visit(value)
        elif isinstance(obj, (types.BuiltinFunctionType, types.BuiltinMethodType)):
            receiver = obj.__self__
            if receiver is not None and not isinstance(receiver, types.ModuleType):
                visit(receiver)
        elif type(obj) in (staticmethod, classmethod):
            visit(obj.__func__)
        elif type(obj) is property:
            for fn in (obj.fget, obj.fset, obj.fdel):
                visit(fn)
        elif isinstance(obj, GuardTable):
            return
        elif isinstance(obj, _SchemaPredicate):
            return
        elif not isinstance(obj, (types.CodeType, types.MethodDescriptorType, re.Pattern)) and type(obj) not in (type(None), bool, int, float, complex, str, bytes):
            cls = type(obj)
            if type(cls) is not type or any('__getattr__' in vars(base) or base is not object and '__getattribute__' in vars(base) for base in cls.__mro__):
                raise IsolationError('state_shared_across_cases: cannot certify object access: ' + cls.__name__)
            try:
                state = object.__getattribute__(obj, '__dict__')
            except AttributeError:
                raise IsolationError('state_shared_across_cases: cannot certify reachable state: ' + cls.__name__) from None
            if type(state) is not dict or any(vars(base).get('__slots__') for base in cls.__mro__):
                raise IsolationError('state_shared_across_cases: cannot certify instance graph: ' + cls.__name__)
            result.append(obj)
            visit(state)
            visit(cls)
    result.extend([case, case.table])
    visit(case.context)
    visit(case.check)
    for predicate in _predicate_functions(case.table):
        visit(predicate)
    if case.table._schema:
        for selector in case.table._schema.selectors.values():
            visit(selector)
    return result


def _certified_snapshot(roots, root, *, identities, namespaces=False):
    """Observe original objects without hooks; no copying, user equality or repr.

    Shared snapshots retain binding/alias/identity information. Case snapshots
    erase fresh identities but retain order, aliases, closure state and bits.
    Unknown graphs are certification errors, never empty/safe fingerprints.
    """
    engine = Path(__file__).resolve()
    seen, nodes, keepalive = {}, [], []
    immutable_builtins = (len, type, isinstance, bool, str, int, float, bytes,
                          dict, list, tuple, set, frozenset, range, enumerate, zip,
                          abs, all, any, min, max, sum, id, object,
                          BaseException, Exception, ValueError, TypeError, KeyError,
                          AssertionError, RuntimeError, SystemExit)
    metadata_types = (Invariant, NonGuard, Control, Negative, Duplicate)
    def unsupported(obj, reason='reachable state'):
        raise IsolationError('state_shared_across_cases: cannot certify ' + reason + ': ' + type(obj).__name__)
    def namespace(mapping):
        # Interpreter-owned import bookkeeping is not adapter state. All other
        # bindings, including private names, are observed, even if unreferenced.
        ignored = {'__builtins__', '__loader__', '__spec__', '__cached__'}
        return tuple((visit(name), visit(value)) for name, value in mapping.items() if name not in ignored)
    def visit(obj):
        kind = type(obj)
        if kind in (type(None), bool, int, float, complex, str, bytes):
            if id(obj) in seen:
                return ('ref', seen[id(obj)])
            index = len(nodes)
            seen[id(obj)] = index
            keepalive.append(obj)
            scalar = struct.pack('>dd', obj.real, obj.imag).hex() if kind is complex else encoded(evidence_value(obj))
            nodes.append((kind.__name__, id(obj) if identities else None, scalar))
            return ('ref', index)
        if obj is Ellipsis or obj is NotImplemented:
            return ('immutable-singleton', 'Ellipsis' if obj is Ellipsis else 'NotImplemented')
        if any(obj is value for value in immutable_builtins):
            return ('immutable-builtin', obj.__module__, obj.__name__)
        if obj is sys.modules[__name__]:
            return ('engine-module',)
        if id(obj) in seen:
            return ('ref', seen[id(obj)])
        index = len(nodes)
        seen[id(obj)] = index
        nodes.append(None)
        keepalive.append(obj)
        if kind in (dict, list, tuple, set, frozenset, bytearray):
            content = (tuple((visit(k), visit(v)) for k, v in obj.items()) if kind is dict else
                       bytes(obj) if kind is bytearray else tuple(visit(v) for v in obj))
        elif kind is types.FunctionType:
            source = Path(obj.__code__.co_filename).resolve()
            if source == engine:
                content = ('engine-function', obj.__qualname__)
            else:
                if not source.is_relative_to(root):
                    unsupported(obj, 'external function graph')
                if getattr(obj, '__annotate__', None) is not None:
                    unsupported(obj, 'lazy function annotation graph')
                content = (_function_key(obj), visit(obj.__code__), visit(obj.__defaults__),
                           visit(obj.__kwdefaults__), visit(obj.__dict__), tuple(visit(cell) for cell in obj.__closure__ or ()),
                           visit(obj.__annotations__), visit(getattr(obj, '__type_params__', ())),
                           visit(obj.__name__), visit(obj.__qualname__), visit(obj.__module__), visit(obj.__doc__),
                           namespace(obj.__globals__) if namespaces else (),
                           tuple((name, visit(obj.__builtins__[name])) for name in sorted(set(obj.__code__.co_names))
                                 if name not in obj.__globals__ and name in obj.__builtins__) if namespaces else ())
        elif kind is types.MethodType:
            content = (visit(obj.__func__), visit(obj.__self__))
        elif kind is types.CellType:
            try:
                contents = obj.cell_contents
            except ValueError:
                content = ('empty-cell',)
            else:
                # Certification errors in the contents escape, including
                # IsolationError (a ValueError subclass).
                content = ('cell', visit(contents))
        elif kind is types.ModuleType:
            source = vars(obj).get('__file__')
            if not source or not Path(source).resolve().is_relative_to(root):
                unsupported(obj, 'external module graph')
            content = namespace(vars(obj))
        elif kind is types.CodeType:
            # Immutable Python code, including nested constants; never executed.
            content = (obj.co_code.hex(), visit(obj.co_consts), obj.co_names, obj.co_varnames,
                       obj.co_freevars, obj.co_cellvars, obj.co_flags, obj.co_argcount,
                       obj.co_posonlyargcount, obj.co_kwonlyargcount, obj.co_stacksize,
                       obj.co_exceptiontable.hex(), obj.co_linetable.hex(), obj.co_filename, obj.co_firstlineno,
                       obj.co_name, obj.co_qualname)
        elif kind is type:
            module = sys.modules.get(obj.__module__)
            source = vars(module).get('__file__') if type(module) is types.ModuleType else None
            if source and Path(source).resolve() == engine:
                content = ('engine-type', obj.__qualname__)
            else:
                if not source or not Path(source).resolve().is_relative_to(root):
                    unsupported(obj, 'external class graph')
                content = (obj.__qualname__, tuple(visit(base) for base in obj.__bases__),
                           tuple((name, visit(value)) for name, value in vars(obj).items()
                                 if name not in ('__dict__', '__weakref__')))
        elif kind in (staticmethod, classmethod):
            content = visit(obj.__func__)
        elif kind is property:
            content = tuple(visit(fn) for fn in (obj.fget, obj.fset, obj.fdel))
        elif kind in metadata_types:
            content = tuple((name, visit(value)) for name, value in vars(obj).items())
        elif kind is GuardTable and not namespaces:
            content = (visit(_guard_metadata(obj)),
                       tuple(visit(fn) for fn in _predicate_functions(obj)),
                       tuple(visit(fn) for fn in obj._schema.selectors.values()) if obj._schema else ())
        else:
            cls = kind
            if (type(cls) is not type or any(vars(base).get('__slots__') or '__getattr__' in vars(base) or
                    base is not object and '__getattribute__' in vars(base) for base in cls.__mro__)):
                unsupported(obj, 'slotted/opaque object graph')
            module = sys.modules.get(cls.__module__)
            source = vars(module).get('__file__') if type(module) is types.ModuleType else None
            if not source or not Path(source).resolve().is_relative_to(root) or Path(source).resolve() == engine:
                unsupported(obj, 'external object graph')
            try:
                state = object.__getattribute__(obj, '__dict__')
            except AttributeError:
                unsupported(obj)
            if type(state) is not dict:
                unsupported(obj)
            content = (visit(cls), visit(state))
        nodes[index] = (kind.__name__, id(obj) if identities else None, content)
        return ('ref', index)
    references = tuple(visit(value) for value in roots)
    return _DataSnapshot((references, tuple(nodes)), tuple(keepalive))


def _adapter_snapshot(suite):
    root = Path(suite.repository_root).resolve()
    # Starting at the factory also includes factory-only closures and globals.
    roots = [suite.factory]
    if suite.reset:
        roots.append(suite.reset)
    paths = {(root / path).resolve() for path in suite.checker_modules}
    for module in list(sys.modules.values()):
        if type(module) is types.ModuleType:
            filename = vars(module).get('__file__')
            if filename and Path(filename).resolve() in paths:
                roots.append(module)
    return _certified_snapshot(roots, root, identities=True, namespaces=True)


def _guard_metadata(table):
    rows = []
    for guard in table.guards.values():
        predicate = guard.predicate
        source = {'engine_schema': predicate.guard.id,
                  'catalog_sha256': predicate.binding.catalog.fingerprint,
                  'selector': _function_key(predicate.binding.selectors[predicate.guard.entry_uri])} if isinstance(predicate, _SchemaPredicate) else {
            'file': _function_key(predicate)[0], 'line': _function_key(predicate)[1], 'function': predicate.__qualname__}
        rows.append({'id': guard.name, 'kind': 'schema' if isinstance(predicate, _SchemaPredicate) else 'code',
                     'invariant': asdict(guard.invariant), 'refusal_code': guard.refusal_code,
                     'predicate': source, 'predicate_count': 1, 'cut': 'schema-occurrence' if isinstance(predicate, _SchemaPredicate) else 'table-entry-always-pass'})
    return rows


class _SchemaPredicate:
    def __init__(self, binding, guard):
        self.binding, self.guard = binding, guard

    def __call__(self, value, context):
        # Preserve applicators and selectors; weaken only the OTHER supported
        # assertions. Unknown forms never reach PASS or grant any cut credit.
        view = self.binding.catalog.mutated(frozenset(self.binding.active - {self.guard.id}))
        selected = self.binding.selectors[self.guard.entry_uri](value, context)
        return None if view.validator(self.guard.entry_uri).is_valid(selected) else self.guard.refusal_code or self.guard.id


class _SchemaBinding:
    def __init__(self, catalog, selectors):
        self.catalog, self.selectors = catalog, selectors
        if set(selectors) != set(catalog.roots):
            raise IsolationError('schema selectors must bind every complete consumed root exactly once')
        self.active = {g.id for g in catalog.guards.values() if g.classification == 'guard'}
        self.view = None
        self.consumed = set()

    def bind(self, cuts):
        self.view = self.catalog.mutated(frozenset(set(cuts) & self.active))

    def validate(self, table, entry, value, context):
        if entry not in self.selectors:
            table._errors.append('undeclared schema input occurrence: ' + entry)
            raise IsolationError(table._errors[-1])
        self.consumed.add(entry)
        before = _data_snapshot(value, context)
        selected = self.selectors[entry](value, context)
        if _data_snapshot(value, context) != before:
            table._errors.append('schema selector mutated the frozen input/context')
            raise IsolationError(table._errors[-1])
        if self.view.validator(entry).is_valid(selected):
            return
        candidates = []
        for name, guard in table._entries.items():
            if isinstance(guard.predicate, _SchemaPredicate) and guard.predicate.guard.entry_uri == entry:
                if table._test(guard, value, context) is not None:
                    candidates.append(name)
        if not candidates:
            table._errors.append('schema refusal cannot be attributed to an enabled atomic guard')
            raise IsolationError(table._errors[-1])
        table._refuse(candidates[0], table.guards[candidates[0]].refusal_code)


def schema_table(catalog, selectors, guards=()):
    """Keep the reviewed SchemaCatalog inventory/cuts; expose tagged predicates.

    selectors maps each distinct schema consumer root to (complete_value,
    context) -> actual schema input. Use a fresh catalog in every Case factory.
    """
    binding = _SchemaBinding(catalog, selectors)
    rows = [Guard(g.id, g.invariant, g.refusal_code or g.id, _SchemaPredicate(binding, g))
            for g in catalog.guards.values() if g.classification == 'guard']
    table = GuardTable([*guards, *rows])
    table._schema = binding
    return table
def _fixture_copy(value, memo=None):
    """Rebuild typed fixture data without user hooks or order-changing set copies.

    Alias relationships in dict/list graphs are preserved. Code, functions,
    opaque objects and sets are not fixture data; build state in the factory.
    """
    memo = {} if memo is None else memo
    if type(value) in (type(None), bool, int, float, str, bytes):
        return value
    if id(value) in memo:
        return memo[id(value)]
    if type(value) is dict:
        result = {}
        memo[id(value)] = result
        result.update((_fixture_copy(k, memo), _fixture_copy(v, memo)) for k, v in value.items())
        return result
    if type(value) is list:
        result = []
        memo[id(value)] = result
        result.extend(_fixture_copy(v, memo) for v in value)
        return result
    if type(value) is tuple:
        result = tuple(_fixture_copy(v, memo) for v in value)
        memo[id(value)] = result
        return result
    if type(value) is bytearray:
        result = bytearray(value)
        memo[id(value)] = result
        return result
    raise IsolationError('unsupported fixture data (construct checker state in the factory): ' + type(value).__name__)


def run(suite: Suite, *, memory: MemoryGate | None = None, progress=None):
    """Serial, fresh factory for EVERY case, predicate, cut and restoration."""
    gate = memory or MemoryGate()
    report = {'version': 2, 'method': 'B: guard tables', 'suite': suite.name, 'status': 'FAIL',
              'tool_sha256': hashlib.sha256(Path(__file__).read_bytes()).hexdigest(),
              'inventory': [], 'controls': [], 'negatives': [], 'rows': [], 'duplicates': [],
              'guard_negative_matrix': [], 'unproved_guards': [], 'masked_negatives': [],
              'failures': [], 'evaluations': 0, 'factories': 0, 'static': {}, 'runtime': [],
              'trust_decisions': ['Review predicate bodies against their one-field/one-predicate declarations.',
                                  'Review complete boundary coverage, factory reset and every non-guard reason.',
                                  'Finite matrices do not prove arbitrary predicate semantics or duplicate equivalence.']}
    def fail(kind, **facts):
        report['failures'].append({'kind': kind, **facts})
    retained = {}             # weak references where possible; strong for builtin mutable state
    signature = None
    checker_signature = None
    scanned_paths, exception_sites = set(), set()
    engine = Path(__file__).resolve()
    root = Path(suite.repository_root).resolve()
    shared_snapshot = None
    case_snapshots = {}
    def certify_shared(*, reset=False):
        nonlocal shared_snapshot
        if reset and suite.reset:
            suite.reset()
        try:
            snapshot = _adapter_snapshot(suite)
        except IsolationError as exc:
            # Still census/observe baselines for diagnostic specificity. Any
            # certification failure withholds ALL credit before matrix/cuts.
            fail('state_shared_across_cases', error=str(exc))
            return
        report.setdefault('state_snapshots', []).append(hashlib.sha256(repr(snapshot.signature).encode()).hexdigest())
        if shared_snapshot is None:
            shared_snapshot = snapshot
        elif snapshot != shared_snapshot:
            fail('state_shared_across_cases', error='adapter/factory bindings or reachable state changed from first run')
    def fresh(value):
        nonlocal signature, checker_signature, scanned_paths, exception_sites
        gate.check()
        certify_shared(reset=True)
        before = _data_snapshot(value)
        factory_signature = inspect.signature(suite.factory)
        try:
            factory_signature.bind(value)
            with_input = True
        except TypeError:
            factory_signature.bind()
            with_input = False
        case = suite.factory(value) if with_input else suite.factory()
        if _data_snapshot(value) != before:
            raise IsolationError('factory mutated the frozen fixture; derive state without repairing input')
        report['factories'] += 1
        if type(case) is not Case or type(case.table) is not GuardTable or not callable(case.check):
            raise IsolationError('factory must return a fresh Case(table, check, context)')
        check_key = _function_key(case.check)
        if checker_signature is None:
            checker_signature = check_key
        elif checker_signature != check_key:
            raise IsolationError('checker source changed between cases')
        meta = _guard_metadata(case.table)
        if signature is None:
            signature = meta
        elif meta != signature:
            raise IsolationError('guard table declaration changed between cases')
        if not report['static']:
            report['static'] = static_scan(suite, case.table)
            scanned_paths = {(root / f['path']).resolve() for f in report['static']['files']}
            if Path(checker_signature[0]) not in scanned_paths:
                fail('checker_outside_scanned_closure', source=list(checker_signature))
            exception_sites = {(str((root / s['path']).resolve()), s['exception_operation'], tuple(s['exception_span']))
                               for s in report['static']['sites'] if s['non_guard'] and s.get('exception_operation')}
            if report['static']['status'] != 'PASS':
                fail('hidden_static_sites', sites=[s['id'] for s in report['static']['sites'] if not s['non_guard']], errors=report['static']['errors'])
        objects = _state_objects(case, root)
        for obj in objects:
            prior = retained.get(id(obj))
            if prior is not None and (prior() is obj if isinstance(prior, weakref.ReferenceType) else prior is obj):
                raise IsolationError('state_shared_across_cases: ' + type(obj).__name__)
        for obj in objects:
            try:
                retained[id(obj)] = weakref.ref(obj)
            except TypeError:
                retained[id(obj)] = obj
        certify_shared(reset=True)
        key = repr(_certified_snapshot([value], root, identities=False).signature)
        snapshot = _certified_snapshot([value, case.context, case.check, case.table], root, identities=False)
        if key in case_snapshots and snapshot != case_snapshots[key]:
            fail('factory_nondeterministic', error='same input produced a different table/context/checker closure graph')
        else:
            case_snapshots.setdefault(key, snapshot)
        gate.check()
        return case

    def observe(case, value, cuts=frozenset(), predicate=None):
        gate.check()
        certify_shared(reset=True)
        report['evaluations'] += 1
        table = case.table
        table._bind(value, case.context, cuts)
        events, exceptions = [], {}
        instructions = {}
        predicates = [fn.__func__ if inspect.ismethod(fn) else fn for fn in _predicate_functions(table)]
        predicate_codes = {fn.__code__ for fn in predicates}
        path_cache = {}
        engine_name = str(engine)
        def trace(frame, event, arg):
            if event == 'call' and frame.f_code in predicate_codes:
                parent = frame.f_back
                row = parent.f_locals.get('row') if parent else None
                called = row.predicate if type(row) is Guard else None
                function = called.__func__ if inspect.ismethod(called) else called
                authorized = (parent is not None and parent.f_code is GuardTable._test.__code__ and
                              parent.f_locals.get('self') is table and table._in_predicate and
                              any(function is fn for fn in predicates) and function.__code__ is frame.f_code and
                              function.__globals__ is frame.f_globals)
                if authorized and inspect.ismethod(called):
                    authorized = frame.f_locals.get(function.__code__.co_varnames[0]) is called.__self__
                if not authorized:
                    error = 'registered predicate entered outside its engine evaluation: ' + frame.f_code.co_name
                    table._errors.append(error)
                    raise IsolationError(error)
            if table._in_predicate and table._purity_before is not None:
                table._check_purity(value, case.context)
                frame.f_trace_opcodes = True
            filename = frame.f_code.co_filename
            if filename == engine_name:
                return None
            if filename not in path_cache:
                resolved = Path(filename).resolve()
                path_cache[filename] = resolved if resolved != engine and resolved.is_relative_to(root) else None
            path = path_cache[filename]
            if path is None:
                return None
            if event == 'call' and path not in scanned_paths:
                events.append({'kind': 'unscanned_repository_code', 'path': str(path), 'function': frame.f_code.co_name})
            if event == 'exception':
                _, exc, traceback = arg
                if not any(exc is issued for issued in table._issued):
                    if frame.f_code not in instructions:
                        instructions[frame.f_code] = list(dis.get_instructions(frame.f_code))
                    instruction = next((i for i in reversed(instructions[frame.f_code]) if i.offset <= frame.f_lasti), None)
                    position = instruction.positions if instruction else None
                    site = (str(path), instruction.opname if instruction else '',
                            (position.lineno, position.end_lineno, position.col_offset, position.end_col_offset) if position else ())
                    # The first observed origin decides. A later helper boundary
                    # cannot launder an already untracked exception. Propagation
                    # of the very same authorized object retains its disposition.
                    prior = exceptions.get(id(exc))
                    propagated = (prior is not None and prior[1] and instruction is not None and
                                  instruction.opname != 'RAISE_VARARGS' and traceback.tb_next is prior[2])
                    authorized = (site in exception_sites and (prior is None and traceback.tb_next is None or prior is not None and prior[1]))
                    exceptions[id(exc)] = (exc, propagated or authorized, traceback)
                    if not exceptions[id(exc)][1]:
                        events.append({'kind': 'untracked_exception', 'path': str(path), 'line': frame.f_lineno,
                                       'type': type(exc).__name__, 'message': str(exc)})
            return trace
        previous = sys.gettrace()
        try:
            if previous is not None:
                raise IsolationError('runtime requires an exclusive trace hook')
            sys.settrace(trace)
            if predicate is not None:
                row = table.guards[predicate]
                table._matrix_frame = sys._getframe()
                try:
                    result = table._test(row, value, case.context)
                finally:
                    table._matrix_frame = None
                got = {'passes': result is None, 'code': result or ''}
            else:
                result = case.check(value)
                if result is not True:
                    fail('untracked_rejecting_return', result_type=type(result).__name__, result=repr(result)[:200])
                    got = {'accepted': False, 'error': 'untracked rejecting return'}
                elif table._issued:
                    fail('swallowed_table_refusal', guards=[x.guard for x in table._issued])
                    got = {'accepted': False, 'error': 'swallowed table refusal'}
                else:
                    got = {'accepted': True}
        except BaseException as exc:
            if predicate is None and any(exc is issued for issued in table._issued) and len(table._issued) == 1:
                got = {'accepted': False, 'guard': exc.guard, 'code': exc.code}
            else:
                fail('untracked_refusal', type=type(exc).__name__, error=str(exc))
                got = {'accepted': False, 'error': type(exc).__name__ + ': ' + str(exc)}
        finally:
            sys.settrace(previous)
            if events:
                report['runtime'].extend(events)
                fail('runtime_untracked_site', events=events)
            if table._errors:
                fail('table_protocol_error', errors=table._errors[:])
            if table._schema and predicate is None:
                report.setdefault('schema_consumption', []).append({'evaluation': report['evaluations'],
                    'cuts': sorted(cuts), 'roots': sorted(table._schema.consumed)})
            table._restore()
            certify_shared(reset=True)
            gate.check()
        return got

    def evaluate(value, cuts=frozenset(), predicate=None):
        # Only fixture data is copied. Checker functions, defaults, globals,
        # closure cells, code objects and state are never cloned by this tool.
        data = _fixture_copy(value)
        # Two independently built original cases must agree before this run.
        # The per-input signature also compares each cut/restoration to baseline.
        fresh(_fixture_copy(value))
        return observe(fresh(data), data, frozenset(cuts), predicate)

    try:
        if type(suite) is not Suite:
            raise IsolationError('expected Method B Suite')
        if not suite.controls:
            raise IsolationError('at least one complete-path valid control is required')
        initial = fresh(_fixture_copy(suite.controls[0].value))
        guards = dict(initial.table.guards)
        report['inventory'] = signature
        if initial.table._schema:
            catalog = initial.table._schema.catalog
            report['schema_inventory'] = [asdict(g) for g in catalog.guards.values()]
            report['schema_bindings'] = catalog.bindings
            for guard in catalog.guards.values():
                if guard.classification in ('unclassified', 'format_sweep'):
                    fail('unclassified_schema_assertion', guard=guard.id, reason=guard.evidence)
                    report['unproved_guards'].append(guard.id)
        controls = {c.id: c for c in suite.controls}
        negatives = {n.id: n for n in suite.negatives}
        duplicates = {d.id: d for d in suite.duplicates}
        if not controls or len(controls) != len(suite.controls) or len(negatives) != len(suite.negatives) or len(duplicates) != len(suite.duplicates):
            raise IsolationError('controls, negatives and duplicates require unique IDs and a valid control')
        if set(controls) & set(negatives) or set(guards) & set(duplicates):
            raise IsolationError('case IDs and target IDs must be unambiguous')
        for control in controls.values():
            if control.boundary not in ('append', 'retry', 'retained_history', 'synthetic'):
                raise IsolationError('unknown boundary ' + control.boundary)
        membership = {}
        for duplicate in duplicates.values():
            if len(duplicate.sites) < 2 or len(set(duplicate.sites)) != len(duplicate.sites) or not duplicate.evidence.strip():
                raise IsolationError('duplicate declared without proof evidence: ' + duplicate.id)
            for name in duplicate.sites:
                if name not in guards or guards[name].invariant != duplicate.invariant or name in membership:
                    raise IsolationError('duplicate merges different fields/predicates or overlapping sets: ' + duplicate.id)
                membership[name] = duplicate.id
            if len({guards[name].refusal_code for name in duplicate.sites}) != 1:
                raise IsolationError('duplicate sites must refuse the same defect code')
        for negative in negatives.values():
            if negative.control not in controls or negative.target not in guards.keys() | duplicates.keys() or not negative.defect.strip():
                raise IsolationError('negative has a missing table guard/control/defect: ' + negative.id)
            targets = duplicates[negative.target].sites if negative.target in duplicates else (negative.target,)
            if any(guards[t].refusal_code != negative.code for t in targets):
                raise IsolationError('negative code differs from its table guard: ' + negative.id)
            if negative.target in membership:
                raise IsolationError('duplicate negatives must target their declared set')
        def expected(negative, got, cuts=frozenset()):
            names = set(duplicates[negative.target].sites) if negative.target in duplicates else {negative.target}
            return got.get('accepted') is False and got.get('guard') in names - set(cuts) and got.get('code') == negative.code and 'error' not in got
        baseline = {}
        for control in controls.values():
            got = evaluate(control.value)
            baseline[control.id] = got
            report['controls'].append({'id': control.id, 'boundary': control.boundary, 'outcome': got, 'sha256': digest(control.value)})
            if got != {'accepted': True}:
                fail('control_refused', case=control.id, actual=got)
        for negative in negatives.values():
            got = evaluate(negative.value)
            baseline[negative.id] = got
            report['negatives'].append({**{k: v for k, v in asdict(negative).items() if k != 'value'},
                'outcome': got, 'changed_paths': typed_changes(controls[negative.control].value, negative.value), 'sha256': digest(negative.value)})
            if not expected(negative, got):
                fail('wrong_baseline_guard', negative=negative.id, expected=negative.target, actual=got)
        if initial.table._schema:
            consumed = {entry for row in report.get('schema_consumption', []) for entry in row['roots']}
            missing = set(initial.table._schema.catalog.roots) - consumed
            if missing:
                fail('declared_schema_root_not_consumed', roots=sorted(missing))
        # Baselines still execute when the static scan fails, to demonstrate both
        # defenses. No guard receives credit after any safety/inventory failure.
        if report['failures']:
            report['unproved_guards'].extend(guards)
            return report
        for negative in negatives.values():
            own = set(duplicates[negative.target].sites) if negative.target in duplicates else {negative.target}
            for name in guards:
                got = evaluate(negative.value, predicate=name)
                cell = {'guard': name, 'negative': negative.id, **got, 'own': name in own}
                report['guard_negative_matrix'].append(cell)
                if got.get('passes') is not (name not in own):
                    fail('matrix_diagonal_pass' if name in own else 'matrix_off_diagonal_failure', guard=name, negative=negative.id, actual=got)
        # Guards must pass every control individually as well as the full path.
        for control in controls.values():
            for name in guards:
                got = evaluate(control.value, predicate=name)
                if got.get('passes') is not True:
                    fail('predicate_refuses_control', guard=name, control=control.id, actual=got)
        if report['failures']:
            report['unproved_guards'].extend(guards)
            return report

        def vector(label, cuts, own, retained_duplicate=None):
            row = {'id': label, 'cuts': sorted(cuts), 'own': sorted(own), 'flips': [], 'stays': [],
                   'masked': [], 'unrelated_changes': [], 'results': [], 'restoration': [], 'proved': False}
            report['rows'].append(row)
            before = len(report['failures'])
            good = bool(own) or retained_duplicate is not None
            for control in controls.values():
                got = evaluate(control.value, cuts)
                row['results'].append({'case': control.id, 'outcome': got})
                if got != baseline[control.id]:
                    good = False
                    fail('cut_breaks_control', row=label, control=control.id, actual=got)
            for negative in negatives.values():
                got = evaluate(negative.value, cuts)
                row['results'].append({'case': negative.id, 'outcome': got})
                if got == {'accepted': True}:
                    row['flips'].append(negative.id)
                else:
                    row['stays'].append(negative.id)
                if negative.id in own:
                    okay = got == {'accepted': True}
                    if not okay:
                        item = {'negative': negative.id, 'actual': got}
                        row['masked'].append(item)
                        report['masked_negatives'].append(item)
                        fail('masked_negative', row=label, **item)
                else:
                    # A duplicate's tag can move to its remaining site, while
                    # preserving the exact defect code. All other tags are exact.
                    okay = (expected(negative, got, cuts) if negative.target in duplicates else got == baseline[negative.id])
                    if not okay:
                        row['unrelated_changes'].append({'negative': negative.id, 'before': baseline[negative.id], 'after': got})
                        fail('unrelated_result_changed', row=label, negative=negative.id, actual=got)
                good = good and okay
            for case in [*controls.values(), *negatives.values()]:
                got = evaluate(case.value)
                row['restoration'].append({'case': case.id, 'outcome': got})
                if got != baseline[case.id]:
                    good = False
                    fail('restoration_failed', row=label, case=case.id, actual=got)
            row['complete'] = True
            row['proved'] = good and len(report['failures']) == before
            if progress:
                progress(report)
            return row
        proved = set()
        single_rows = {}
        for name in guards:
            own = {n.id for n in negatives.values() if n.target == name}
            row = vector(name, {name}, own, membership.get(name))
            single_rows[name] = row
            if row['proved'] and own:
                proved.add(name)
        for duplicate in duplicates.values():
            own = {n.id for n in negatives.values() if n.target == duplicate.id}
            proof = {**asdict(duplicate), 'per_site': [], 'proved': False}
            for name in duplicate.sites:
                # Prove each site really enforces the invariant, not just a
                # weaker third row hidden by stronger peers.
                others = set(duplicate.sites) - {name}
                remaining = vector(duplicate.id + ':only:' + name, others, set(), duplicate.id)
                proof['per_site'].append({'site': name, 'single_cut': single_rows[name]['id'], 'only_this_site': remaining['id'],
                                          'proved': single_rows[name]['proved'] and remaining['proved']})
            joint = vector(duplicate.id, set(duplicate.sites), own)
            proof['joint_cut'] = joint['id']
            proof['proved'] = bool(own) and joint['proved'] and all(s['proved'] for s in proof['per_site'])
            if proof['proved']:
                proved.update(duplicate.sites)
            else:
                fail('duplicate_unproved', duplicate=duplicate.id)
            report['duplicates'].append(proof)
        report['unproved_guards'].extend(sorted(set(guards) - proved))
        if report['unproved_guards']:
            fail('unproved_guards', guards=report['unproved_guards'])
        if not report['failures']:
            report['status'] = 'PASS'
    except BaseException as exc:
        fail('state_shared_across_cases' if 'state_shared_across_cases' in str(exc) else 'infrastructure_or_declaration', error=type(exc).__name__ + ': ' + str(exc))
    finally:
        # Per-guard credit cannot survive a failing safety check or bad matrix.
        if report['failures']:
            for row in report['rows']:
                row['proved'] = False
            for duplicate in report['duplicates']:
                duplicate['proved'] = False
        report['unproved_guards'] = sorted(set(report['unproved_guards']) | {g['id'] for g in report['inventory']
            if not any(r['id'] == g['id'] and r.get('proved') for r in report['rows']) and
               not any(g['id'] in d['sites'] and d['proved'] for d in report['duplicates'])})
    return report


def markdown(report):
    lines = ['# Guard isolation: ' + report['suite'], '', '**' + report['status'] + '** — Method B: guard tables.', '',
             f"{report['evaluations']} serial evaluations; {report['factories']} fresh factories; {len(report['unproved_guards'])} unproved guards.", '',
             'Static scan: **' + report.get('static', {}).get('status', 'NOT_RUN') + '**. Runtime untracked sites: ' + str(len(report['runtime'])) + '.', '',
             '| Guard / duplicate set | Flips | Stays refused | Proof |', '|---|---|---|---|']
    for row in report['rows']:
        lines.append('| `' + row['id'].replace('|', '&#124;') + '` | ' + ', '.join(row['flips']) + ' | ' + ', '.join(row['stays']) + ' | ' + ('proved' if row['proved'] else 'unproved') + ' |')
    lines += ['', f"Guard-negative matrix: {len(report['guard_negative_matrix'])} individually executed cells.",
              'Full outcomes, exact guard tags, duplicate per-site proofs, static sites/reasons and source SHA-256 hashes are in JSON.']
    if report['failures']:
        lines += ['', 'Failures: ' + ', '.join(sorted({f['kind'] for f in report['failures']})) + '.']
    return '\n'.join(lines) + '\n'


def self_test(memory=None, *, scratch=None):
    from pm_guard_isolation_traps import exercise
    return exercise(sys.modules[__name__], memory or MemoryGate(), scratch=scratch)


def self_test_markdown(report):
    lines = ['# Method B self-test', '', f"**{report['status']}**: {report['caught']}/{len(report['traps'])} expected observations caught.", '',
             '| Trap | Expected reason | Caught |', '|---|---|---|']
    for trap in report['traps']:
        lines.append(f"| {trap['id']} | {trap['expected']} | {trap['caught']} |")
    return '\n'.join(lines) + '\n'


def main(argv=None):
    sys.modules.setdefault('pm_guard_isolation', sys.modules[__name__])
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--adapter', help='Python file:factory returning Method B Suite')
    parser.add_argument('--self-test', action='store_true')
    parser.add_argument('--scratch', type=Path, help='self-test scratch parent (default: operating system temporary directory)')
    parser.add_argument('--json', type=Path)
    parser.add_argument('--markdown', type=Path)
    parser.add_argument('--max-rss', type=int, default=2048)
    parser.add_argument('--pause-when-low', type=int, default=0)
    parser.add_argument('--resume-at', type=int)
    parser.add_argument('--pause-poll', type=float, default=30)
    parser.add_argument('--low-timeout', type=float, default=2700)
    args = parser.parse_args(argv)
    if args.self_test == bool(args.adapter):
        parser.error('choose exactly one of --self-test or --adapter')
    try:
        memory = MemoryGate(args.max_rss, args.pause_when_low, args.resume_at, args.pause_poll, args.low_timeout)
        memory.check()
        if args.self_test:
            report = self_test(memory, scratch=args.scratch)
        else:
            sys.modules.setdefault('pm_guard_isolation', sys.modules[__name__])
            path, sep, factory = args.adapter.rpartition(':')
            if not sep:
                raise IsolationError('--adapter requires file:factory')
            spec = importlib.util.spec_from_file_location('_guard_isolation_adapter', path)
            module = importlib.util.module_from_spec(spec)
            sys.modules[spec.name] = module
            spec.loader.exec_module(module)
            report = run(getattr(module, factory)(), memory=memory)
    except BaseException as exc:
        report = {'version': 2, 'status': 'FAIL', 'failures': [{'kind': 'setup', 'error': type(exc).__name__ + ': ' + str(exc)}]}
    body = json.dumps(report, indent=2, sort_keys=True) + '\n'
    if args.json:
        args.json.write_text(body)
    else:
        print(body, end='')
    if args.markdown:
        args.markdown.write_text(markdown(report) if 'suite' in report else self_test_markdown(report) if 'traps' in report else '# FAIL\n' + body)
    return 0 if report['status'] == 'PASS' else 1


if __name__ == '__main__':
    raise SystemExit(main())
