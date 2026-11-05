#!/usr/bin/env python3
"""Serial, complete-path guard isolation (check 11).

Adapters return a Suite; see GUARDTOOL-ADOPTION.md. No source file is patched,
no refusal is swallowed, and no schema is flattened. Inventory precedes cases.
The callback must consume State's schemas/modules at EVERY validation site.
"""
from __future__ import annotations

import argparse
import ast
import copy
from dataclasses import asdict, dataclass, field, replace
import hashlib
import importlib.util
import json
import math
from pathlib import Path
import resource
import struct
import sys
import time
import types
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
class Guard:
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


def python_atom_reason(expression):
    """Only transparent, side-effect-free Boolean atoms get automatic cuts.

    Names/accesses and one comparison are adapter-bound input predicates. Calls
    outside the tiny read-only view grammar and compound/dataflow expressions
    need a separately inventoried atomic seam. Chains are deliberately refused:
    rewriting them as `and` would evaluate shared operands twice.
    """
    def value(node):
        if isinstance(node, (ast.Name, ast.Constant)):
            return True
        if isinstance(node, ast.Attribute):
            return value(node.value)
        if isinstance(node, ast.Subscript):
            return value(node.value) and value(node.slice)
        if isinstance(node, (ast.List, ast.Tuple, ast.Set)):
            return all(value(x) for x in node.elts)
        if isinstance(node, ast.UnaryOp) and isinstance(node.op, (ast.USub, ast.UAdd)):
            return value(node.operand)
        if isinstance(node, ast.Call) and not node.keywords:
            if isinstance(node.func, ast.Name) and node.func.id in ("len", "type"):
                return len(node.args) == 1 and value(node.args[0])
            if isinstance(node.func, ast.Attribute) and node.func.attr == "get":
                return (1 <= len(node.args) <= 2 and value(node.func.value) and
                        isinstance(node.args[0], ast.Constant) and all(value(x) for x in node.args))
            if isinstance(node.func, ast.Attribute) and node.func.attr == "encode":
                return value(node.func.value) and all(isinstance(x, ast.Constant) for x in node.args)
        return False
    if isinstance(expression, ast.Compare):
        if len(expression.ops) != 1:
            return "chained comparison carries multiple predicates; evaluation-order-preserving adapter required"
        if value(expression.left) and value(expression.comparators[0]):
            return ""
    elif isinstance(expression, (ast.Name, ast.Attribute, ast.Subscript, ast.Constant)) and value(expression):
        return ""
    elif isinstance(expression, ast.Call) and value(expression):
        return ""
    return "expression outside atomic Boolean allow-list (conditional expression, opaque call or dataflow); atomic adapter required"


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
        self.guards: dict[str, Guard] = {}
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
                self.guards[gid] = Guard(gid, kind, doc + "#" + suffix,
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
            allowed = ATOMIC_SCHEMA | {"required", "dependentRequired", "dependencies", "$ref"} | ANNOTATIONS | {"$defs", "definitions"}
            if set(node) - allowed or any(isinstance(v, (dict, bool)) for v in node.get("dependencies", {}).values()):
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
            result[gid] = Guard(gid, "unsupported_context", entry,
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


@dataclass(frozen=True)
class CodeSite:
    guard: Guard
    function: str
    line: int
    column: int
    action: str                    # raise | return | predicate | assert | call
    clause: tuple[int | str, ...] | None = None
    fingerprint: str = ""


class AstGuards:
    """Exact refusal sites in top-level Python functions, compiled in memory.

    A compound rejection MUST register each BoolOp leaf separately. Context
    selectors must be classified with evidence. Opaque helper calls need an
    adapter's explicit per-predicate inventory; this is not a semantic theorem
    prover. No whole-function replacement or catch-and-continue fallback exists.
    """
    def __init__(self, name: str, source: str, namespace: dict, *, call_predicates=None):
        self.name, self.source, self.namespace = name, source, namespace
        self.tree = ast.parse(source)
        self.sites: dict[str, CodeSite] = {}
        self.functions = {n.name: n for n in self.tree.body if isinstance(n, (ast.FunctionDef, ast.AsyncFunctionDef))}
        self.source_hash = hashlib.sha256(source.encode()).hexdigest()
        # Call name -> index of its acceptance predicate. Only the predicate
        # argument is cut; the helper, its code and other arguments remain.
        self.call_predicates = {"require": 0} if call_predicates is None else dict(call_predicates)

    @staticmethod
    def _leaves(test, path=()):
        if isinstance(test, ast.BoolOp):
            for i, child in enumerate(test.values):
                yield from AstGuards._leaves(child, path + (i,))
        elif isinstance(test, ast.UnaryOp) and isinstance(test.op, ast.Not):
            yield from AstGuards._leaves(test.operand, path + ("not",))
        else:
            yield path, test

    def _calls(self, node):
        call = node.value if isinstance(node, ast.Expr) else node
        refusal = (isinstance(call, ast.Call) and
            ((isinstance(call.func, ast.Attribute) and call.func.attr in ("append", "extend", "insert", "clear", "pop", "remove", "update", "setdefault", "__setitem__", "__iadd__")) or
             (isinstance(call.func, ast.Name) and call.func.id in ("refuse", "reject", "fail"))))
        predicate = isinstance(node, ast.Call) and ast.unparse(node.func) in self.call_predicates
        return refusal, predicate

    def candidates(self):
        result = []
        for name, fn in self.functions.items():
            def walk(node, condition=None):
                if node is not fn and isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef, ast.Lambda)):
                    return
                refusal_call, checkcall = self._calls(node)
                if isinstance(node, (ast.Raise, ast.Return, ast.Assert)) or (refusal_call and isinstance(node, ast.Expr)) or checkcall:
                    # Non-refusal returns are inventoried too; adapter classifies them.
                    predicate = isinstance(node, ast.Return) and condition is None
                    arg_index = self.call_predicates[ast.unparse(node.func)] if checkcall else None
                    if checkcall and arg_index >= len(node.args):
                        raise IsolationError("guard call uses keyword/missing predicate: supply an explicit adapter boundary")
                    expression = node.args[arg_index] if checkcall else (node.value if node.value is not None else ast.Constant(None)) if predicate else node.test if isinstance(node, ast.Assert) else condition.test if condition else node
                    leaves = list(self._leaves(expression))
                    action = ("checkcall" if checkcall else "predicate" if predicate else "raise" if isinstance(node, ast.Raise) else
                              "assert" if isinstance(node, ast.Assert) else "call" if refusal_call else "return")
                    for clause, expression in leaves:
                        identity = digest([name, ast.dump(node, include_attributes=False), clause,
                                           ast.dump(expression, include_attributes=False)])[:16]
                        reason = python_atom_reason(expression)
                        if isinstance(node, ast.Raise) and condition is None and isinstance(node.exc, ast.Call) and all(isinstance(x, ast.Constant) for x in node.exc.args):
                            reason = ""   # unconditional single refusal; no control will pass unless unreachable
                        if isinstance(node, ast.Return):
                            if isinstance(node.value, (ast.Name, ast.Attribute, ast.Subscript)) or (condition is None and isinstance(expression, (ast.Name, ast.Attribute, ast.Subscript))):
                                reason = "returned name/access may carry accumulated or compound predicates; dataflow adapter required"
                            elif condition is not None and node.value is not None and not isinstance(node.value, ast.Constant):
                                reason = "conditional return value may carry additional predicates; atomic adapter required"
                        if isinstance(node, ast.Raise) and isinstance(node.exc, ast.Call) and any(isinstance(x, (ast.Call, ast.IfExp, ast.BoolOp, ast.NamedExpr)) for arg in node.exc.args for x in ast.walk(arg)):
                            reason = "refusal payload evaluates additional expressions; atomic adapter required"
                        if isinstance(fn, ast.AsyncFunctionDef):
                            reason = "async guard requires an explicit atomic adapter"
                        if isinstance(node, ast.Raise) and node.cause is not None:
                            reason = "translated/chained raise needs an atomic adapter preserving exception origin"
                        if refusal_call and isinstance(node, ast.Expr) and isinstance(node.value.func, ast.Attribute) and node.value.func.attr != "append":
                            reason = "list/container mutation may accumulate multiple refusals; atomic adapter required"
                        result.append({"function": name, "line": node.lineno,
                            "column": node.col_offset, "action": action,
                            "clause": clause or None,
                            "expression": ast.unparse(expression), "fingerprint": identity,
                            "id": f"code:{self.name}:{name}:{identity}",
                            "reason": reason, "predicate_count": None if reason else 1,
                            "cut": "" if reason else "replace-one-Boolean-leaf" if clause or predicate or checkcall or isinstance(node, ast.Assert) else "skip-one-refusal-statement"})
                        if reason:
                            result[-1]["action"] = "unsupported"
                for child in ast.iter_child_nodes(node):
                    # Else bodies are NOT governed by the if's true test.
                    next_condition = node if isinstance(node, ast.If) and child in node.body else condition
                    walk(child, next_condition)
            walk(fn)
        inventoried = {(r["line"], r["column"]) for r in result}
        parents = {child: parent for parent in ast.walk(self.tree) for child in ast.iter_child_nodes(parent)}
        # Every call and mutation is either a covered refusal/predicate, a
        # narrowly allow-listed read-only view, or an explicit unsupported seam.
        covered = {(r["line"], r["column"]) for r in result}
        def covered_expression(node):
            owner = node
            while owner in parents:
                owner = parents[owner]
                if isinstance(owner, (ast.Raise, ast.Return, ast.Assert)) or self._calls(owner)[1]:
                    return (owner.lineno, owner.col_offset) in covered
                if isinstance(owner, ast.If):
                    return node in ast.walk(owner.test) and not python_atom_reason(node)
            return False
        for node in ast.walk(self.tree):
            refusal_call, checkcall = self._calls(node)
            if refusal_call and isinstance(node, ast.Call) and isinstance(parents.get(node), ast.Expr):
                continue                    # standalone expression already has one site
            mutation = isinstance(node, (ast.AugAssign, ast.Delete, ast.NamedExpr, ast.Global, ast.Nonlocal))
            if isinstance(node, (ast.Assign, ast.AnnAssign)):
                targets = node.targets if isinstance(node, ast.Assign) else [node.target]
                fresh_empty_list = (all(isinstance(x, ast.Name) for x in targets) and isinstance(node.value, ast.List) and not node.value.elts)
                # A consumed call already has its own unsupported seam; don't
                # duplicate that obligation at its assignment parent.
                consumed_call = isinstance(node.value, ast.Call)
                mutation = not fresh_empty_list and not consumed_call
            opaque_call = (isinstance(node, ast.Call) and not covered_expression(node) and bool(python_atom_reason(node)))
            unsupported_flow = isinstance(node, (ast.With, ast.AsyncWith, ast.Try, ast.TryStar, ast.Match, ast.Yield, ast.YieldFrom, ast.Await, ast.AsyncFor))
            if not (isinstance(node, (ast.Raise, ast.Return, ast.Assert)) or refusal_call or checkcall or mutation or opaque_call or unsupported_flow) or (node.lineno, node.col_offset) in inventoried:
                continue
            owner, ancestry = node, []
            while owner in parents:
                owner = parents[owner]
                if isinstance(owner, (ast.ClassDef, ast.FunctionDef, ast.AsyncFunctionDef)):
                    ancestry.append(owner.name)
            name = ".".join(reversed(ancestry)) or "<module>"
            identity = digest([name, ast.dump(node, include_attributes=False)])[:16]
            result.append({"function": name, "line": node.lineno, "column": node.col_offset,
                "action": "unsupported", "clause": None, "expression": ast.unparse(node),
                "reason": "call, mutation, dataflow or unsupported control/nested/class/module context requires an explicit atomic adapter seam",
                "fingerprint": identity, "id": f"code:{self.name}:{name}:{identity}", "predicate_count": None, "cut": ""})
        for name, fn in self.functions.items():
            if fn.body and not isinstance(fn.body[-1], (ast.Return, ast.Raise)):
                identity = digest([name, "implicit-falsy-return"])[:16]
                result.append({"function": name, "line": fn.end_lineno, "column": fn.col_offset,
                    "action": "unsupported", "clause": None, "expression": "<implicit return None>",
                    "reason": "fallthrough returns a falsy value; adapter must declare whether this is an accepting helper or refusal",
                    "fingerprint": identity, "id": f"code:{self.name}:{name}:{identity}", "predicate_count": None, "cut": ""})
        # Identical text at two sites still has two identities (stable occurrence suffix).
        counts = {}
        for row in result:
            gid = row["id"]; counts[gid] = counts.get(gid, 0) + 1
            row["id"] += ":" + str(counts[gid])
        return result

    def register(self, candidate: dict, code: str, invariant: Invariant, *, evidence="") -> str:
        actual = next((c for c in self.candidates() if c["id"] == candidate["id"]), None)
        if actual != candidate:
            raise IsolationError("stale/substituted AST candidate")
        if candidate["action"] == "unsupported" or candidate.get("predicate_count") != 1 or not candidate.get("cut"):
            raise IsolationError("unsupported construct requires an explicit atomic adapter seam: " + candidate.get("reason", "no per-predicate cut"))
        if self.functions[candidate["function"]].decorator_list:
            raise IsolationError("decorated guard needs an explicit adapter seam preserving the wrapper; cannot drop decorators")
        gid = candidate["id"]
        if gid in self.sites:
            raise IsolationError(f"duplicate code registration {gid}")
        if not code or not invariant.subject or not invariant.predicate:
            raise IsolationError("code site needs exact refusal code and field/predicate invariant")
        g = Guard(gid, "code", f"{self.name}:{candidate['function']}:{candidate['line']}:{candidate['clause']}",
                  invariant, evidence=evidence or "registered exact AST refusal predicate", refusal_code=code,
                  predicate_count=1, cut=candidate["cut"])
        self.sites[gid] = CodeSite(g, candidate["function"], candidate["line"], candidate["column"], candidate["action"],
                                   candidate["clause"], candidate["fingerprint"])
        return gid

    def clone(self, cuts: frozenset[str]):
        module = types.ModuleType(self.name)
        namespace = module.__dict__
        namespace.update(self.namespace)
        for name, value in self.namespace.items():
            if isinstance(value, (dict, list, tuple, set)) and name != "__builtins__":
                try:
                    evidence_value(value)
                except (TypeError, ValueError, RecursionError):
                    continue
                namespace[name] = copy.deepcopy(value)
        # Rebind sibling functions so calls cannot escape to pristine globals.
        for name, fn in self.namespace.items():
            if isinstance(fn, types.FunctionType) and fn.__globals__ is self.namespace:
                clone = types.FunctionType(fn.__code__, namespace, fn.__name__, fn.__defaults__, fn.__closure__)
                clone.__kwdefaults__ = copy.copy(fn.__kwdefaults__)
                namespace[name] = clone
        selected = [self.sites[g] for g in cuts if g in self.sites]
        for name in sorted({s.function for s in selected}):
            tree = copy.deepcopy(self.functions[name])
            sites = [s for s in selected if s.function == name]
            hit = set()
            class Cut(ast.NodeTransformer):
                def visit_If(self, node):
                    # Only a direct refusal body has this true-test rejection clause.
                    for site in sites:
                        if site.action not in ("predicate", "assert", "checkcall") and site.clause is not None and any(n.lineno == site.line and n.col_offset == site.column for n in node.body):
                            node.test = self.atom(node.test, site.clause, False)
                            hit.add(site.guard.id)
                    return self.generic_visit(node)

                def visit_Raise(self, node):
                    return self.refusal(node, "raise")

                def visit_Return(self, node):
                    for site in sites:
                        if site.line == node.lineno and site.column == node.col_offset and site.action == "predicate":
                            node.value = self.accepting(node.value, site)
                    if any(s.line == node.lineno and s.column == node.col_offset and s.action == "predicate" for s in sites):
                        return node
                    replacement = self.refusal(node, "return")
                    return replacement if replacement is not node else self.generic_visit(node)

                def visit_Assert(self, node):
                    for site in sites:
                        if site.line == node.lineno and site.column == node.col_offset and site.action == "assert":
                            node.test = self.accepting(node.test, site)
                    return node

                def visit_Expr(self, node):
                    replacement = self.refusal(node, "call")
                    return replacement if replacement is not node else self.generic_visit(node)

                def visit_Call(self, node):
                    for site in sites:
                        if site.line == node.lineno and site.column == node.col_offset and site.action == "checkcall":
                            index = outer.call_predicates[ast.unparse(node.func)]
                            node.args[index] = self.accepting(node.args[index], site)
                    return self.generic_visit(node)

                def accepting(self, expression, site):
                    hit.add(site.guard.id)
                    return self.atom(expression, site.clause or (), True)

                def atom(self, expression, path, accepting):
                    if not path:
                        return ast.copy_location(ast.Constant(accepting), expression) if expression is not None else ast.Constant(accepting)
                    step, *rest = path
                    if step == "not" and isinstance(expression, ast.UnaryOp) and isinstance(expression.op, ast.Not):
                        expression.operand = self.atom(expression.operand, rest, not accepting)
                    elif isinstance(step, int) and isinstance(expression, ast.BoolOp):
                        expression.values[step] = self.atom(expression.values[step], rest, accepting)
                    else:
                        raise IsolationError("compound AST shape changed")
                    return expression

                def refusal(self, node, action):
                    for site in sites:
                        if site.line == node.lineno and site.column == node.col_offset and site.action == action and site.clause is None:
                            hit.add(site.guard.id)
                            return ast.copy_location(ast.Pass(), node)
                    return node
            outer = self
            tree = Cut().visit(tree)
            if hit != {s.guard.id for s in sites}:
                raise IsolationError(f"AST cuts did not match exactly: {name}")
            tree.decorator_list = []        # do not rerun import-time decorators/caches
            exec(compile(ast.fix_missing_locations(ast.Module(body=[tree], type_ignores=[])),
                         f"<guard-isolation:{self.name}:{self.source_hash}>", "exec"), namespace)
        return module


@dataclass
class State:
    schema: SchemaView | None
    modules: dict[str, types.ModuleType]
    cuts: frozenset[str]


@dataclass
class Suite:
    name: str
    runner: Callable[[Any, State], Outcome]
    controls: list[Control]
    negatives: list[Negative]
    schema: SchemaCatalog | None = None
    modules: list[AstGuards] = field(default_factory=list)
    duplicates: list[Duplicate] = field(default_factory=list)
    classifications: list[Classification] = field(default_factory=list)
    # Required per-candidate dispositions prevent an incomplete code inventory.
    code_dispositions: dict[str, Classification] = field(default_factory=dict)

    def guards(self):
        result = dict(self.schema.guards) if self.schema else {}
        for module in self.modules:
            for gid, site in module.sites.items():
                if gid in result:
                    raise IsolationError(f"duplicate guard id {gid}")
                result[gid] = site.guard
        for item in self.classifications:
            if item.guard not in result or not item.evidence.strip() or item.kind not in ("selector", "unreachable", "redundant", "format_sweep"):
                raise IsolationError(f"invalid guard classification {item}")
            if result[item.guard].classification == "unclassified":
                # An assertion with no sound cut is not a selector merely
                # because a caller supplied that label. Preserve the obligation;
                # context-bound adapter/engine work must expose its predicates.
                result[item.guard] = replace(result[item.guard], evidence=result[item.guard].evidence + "; adapter declaration (still unproved): " + item.kind + ": " + item.evidence)
            else:
                result[item.guard] = replace(result[item.guard], classification=item.kind, evidence=item.evidence)
        return result

    def state(self, cuts=frozenset()):
        modules = {m.name: m.clone(cuts) for m in self.modules}
        originals = {id(m.namespace): modules[m.name] for m in self.modules}
        for module in modules.values():
            for name, value in list(vars(module).items()):
                if isinstance(value, types.FunctionType) and id(value.__globals__) in originals:
                    namespace = originals[id(value.__globals__)]
                    if hasattr(namespace, value.__name__):
                        setattr(module, name, getattr(namespace, value.__name__))
                elif isinstance(value, types.ModuleType) and id(vars(value)) in originals:
                    setattr(module, name, originals[id(vars(value))])
        return State(self.schema.mutated(cuts) if self.schema else None, modules, cuts)


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


def run(suite: Suite, *, memory: MemoryGate | None = None, progress=None) -> dict:
    """Run every row against EVERY negative; no dependency pruning or result cache."""
    gate = memory or MemoryGate()
    report = {"version": 1, "suite": suite.name, "status": "FAIL", "inventory": [], "controls": [],
              "negatives": [], "rows": [], "duplicates": [], "unproved_guards": [],
              "masked_negatives": [], "failures": [], "evaluations": 0,
              "trust_decisions": [], "classifications_require_review": []}
    def fail(kind, **facts):
        report["failures"].append({"kind": kind, **facts})
    try:
        guards = suite.guards()
        controls = {c.id: c for c in suite.controls}
        negatives = {n.id: n for n in suite.negatives}
        duplicate = {d.id: d for d in suite.duplicates}
        if len(controls) != len(suite.controls) or len(negatives) != len(suite.negatives) or len(duplicate) != len(suite.duplicates):
            raise IsolationError("case/control/duplicate IDs must be unique; never collapse repeated names")
        if not controls:
            raise IsolationError("at least one complete-path valid control is required")
        for c in controls.values():
            if c.boundary not in ("append", "retry", "retained_history", "synthetic"):
                raise IsolationError(f"unknown complete-path boundary {c.boundary}")
        report["inventory"] = [asdict(g) for g in sorted(guards.values(), key=lambda g: g.id)]
        # These are obligations of EVERY adopting reviewer, including PASS
        # reports. Outcome observations cannot establish any of these claims.
        report["trust_decisions"].extend([
            {"kind": "complete_path_callback", "runner": getattr(suite.runner, "__qualname__", type(suite.runner).__name__),
             "review": "callback executes the product boundary; constructing a validator or manufacturing outcomes is insufficient"},
            {"kind": "refusal_translation", "codes": sorted({n.code for n in negatives.values()}),
             "review": "only product refusals are translated; assertions and internal crashes must propagate"}])
        if suite.schema:
            report["trust_decisions"].append({"kind": "consumer_input_occurrences", "roots": list(suite.schema.roots),
                "review": "each root is bound to a distinct consumer/input occurrence; reusing one root for two inputs broadens a cut; construction alone does not prove validator invocation"})
            report["trust_decisions"].extend({"kind": "schema_invariant_binding", **b} for b in suite.schema.bindings)
        report["trust_decisions"].extend({"kind": "schema_classification", **asdict(item)} for item in suite.classifications)
        report["trust_decisions"].extend({"kind": "duplicate_equivalence", **asdict(d),
            "review": "same field AND predicate; single-specimen per-site results cannot establish equality"} for d in suite.duplicates)
        for module in suite.modules:
            report["trust_decisions"].append({"kind": "code_module_closure", "module": module.name, "source_sha256": module.source_hash,
                "predicate_helpers": module.call_predicates,
                "dynamic_subject_contexts": [{"line": n.lineno, "expression": ast.unparse(n)} for n in ast.walk(module.tree)
                    if isinstance(n, (ast.For, ast.While, ast.ListComp, ast.SetComp, ast.DictComp, ast.GeneratorExp))],
                "review": "all helper/module sources are included, read-only views have standard semantics, and cloned code is actually invoked"})
            report["trust_decisions"].extend({"kind": "code_predicate_binding", "guard": s.guard.id,
                "invariant": asdict(s.guard.invariant), "evidence": s.guard.evidence,
                "review": "one input subject/predicate per occurrence; loop/dynamic subjects and structured comparisons need separate bindings"} for s in module.sites.values())
            for candidate in module.candidates():
                gid = candidate["id"]
                if gid not in module.sites:
                    disposition = suite.code_dispositions.get(gid)
                    if disposition is None or disposition.guard != gid or not disposition.evidence.strip() or disposition.kind not in ("selector", "unreachable", "redundant"):
                        fail("uninventoried_code_site", site=candidate)
                        report["inventory"].append({**candidate, "kind": "code_candidate", "classification": "unclassified",
                            "evidence": candidate.get("reason", "unregistered guard candidate needs an atomic registration or evidenced disposition")})
                        report["unproved_guards"].append(gid)
                    else:
                        report["inventory"].append({**candidate, "classification": disposition.kind, "evidence": disposition.evidence})
                        report["trust_decisions"].append({"kind": "code_disposition", **asdict(disposition)})
        for d in duplicate.values():
            if d.id in guards or len(d.sites) < 2 or len(set(d.sites)) != len(d.sites) or not d.evidence.strip():
                raise IsolationError(f"invalid duplicate declaration {d.id}")
            for gid in d.sites:
                if gid not in guards or guards[gid].classification != "guard" or guards[gid].invariant != d.invariant:
                    raise IsolationError(f"duplicate {d.id} merges distinct field/predicate invariants at {gid}")
        for n in negatives.values():
            if n.control not in controls or n.target not in guards.keys() | duplicate.keys() or not n.code or not n.defect.strip():
                raise IsolationError(f"incomplete negative declaration {n.id}")
            if n.target in guards and guards[n.target].classification != "guard":
                raise IsolationError(f"negative targets a non-guard {n.id}")
            targets = duplicate[n.target].sites if n.target in duplicate else (n.target,)
            if any(guards[t].refusal_code and guards[t].refusal_code != n.code for t in targets):
                raise IsolationError(f"negative {n.id} does not name its guard's registered refusal code")
        original_schema = digest(suite.schema.documents) if suite.schema else None
        original_inputs = digest([[c.id, c.value] for c in controls.values()] + [[n.id, n.value] for n in negatives.values()])
        undeclared_entries = set()
        def evaluate(value, state):
            gate.check()
            report["evaluations"] += 1
            try:
                outcome = suite.runner(copy.deepcopy(value), state)
                if not isinstance(outcome, Outcome):
                    raise IsolationError("runner must return Outcome (never truthiness, exit 0, or None)")
                return asdict(outcome)
            except Exception as exc:
                # A crash is NOT a successful refusal or a masking code.
                return {"accepted": False, "error": type(exc).__name__ + ": " + str(exc)}
            finally:
                if state.schema:
                    for entry in state.schema.undeclared_entries - undeclared_entries:
                        fail("consumed_entry_not_declared", entry=entry, cuts=sorted(state.cuts),
                             reason="add the actually consumed entry to SchemaCatalog.roots before proof")
                    undeclared_entries.update(state.schema.undeclared_entries)
                gate.check()
        baseline = suite.state()
        baseline_outcomes = {}
        for c in controls.values():
            got = evaluate(c.value, baseline)
            report["controls"].append({"id": c.id, "boundary": c.boundary, "outcome": got, "input_sha256": digest(c.value)})
            if got != asdict(Outcome.accept()):
                fail("control_refused", control=c.id, actual=got)
        for n in negatives.values():
            got = evaluate(n.value, baseline)
            baseline_outcomes[n.id] = got
            report["negatives"].append({"id": n.id, "target": n.target, "code": n.code,
                "control": n.control, "defect": n.defect, "boundary": controls[n.control].boundary,
                "changed_paths": typed_changes(controls[n.control].value, n.value), "input_sha256": digest(n.value), "outcome": got})
            if got != asdict(Outcome.refuse(n.code)):
                fail("wrong_baseline_refusal", negative=n.id, expected=n.code, actual=got)
        if suite.schema:
            for entry in suite.schema.roots:
                if entry not in baseline.schema.consumed_entries:
                    fail("declared_root_not_consumed", entry=entry)
        proved = set()
        def matrix(label, cuts, own):
            state = suite.state(frozenset(cuts))
            row = {"id": label, "cuts": sorted(cuts), "own": sorted(own), "flips": [], "complete": False,
                   "stays": {"universe": "negatives", "except": []}, "masked": [], "unrelated_changes": [],
                   "controls_accept": True, "restored": True}
            report["rows"].append(row)
            for c in controls.values():
                got = evaluate(c.value, state)
                if got != asdict(Outcome.accept()):
                    row["controls_accept"] = False
                    fail("cut_breaks_control", row=label, control=c.id, actual=got)
            for n in negatives.values():
                got = evaluate(n.value, state)
                if got == asdict(Outcome.accept()):
                    row["flips"].append(n.id)
                elif n.id in own:
                    item = {"negative": n.id, "target": n.target, "actual": got}
                    row["masked"].append(item)
                if n.id not in own and got != baseline_outcomes[n.id]:
                    row["unrelated_changes"].append({"negative": n.id, "before": baseline_outcomes[n.id], "after": got})
            row["stays"]["except"] = row["flips"][:]
            # A FRESH uncut state proves restoration without trusting the mutant.
            restored = suite.state()
            for nid in sorted(own):
                got = evaluate(negatives[nid].value, restored)
                if got != asdict(Outcome.refuse(negatives[nid].code)):
                    row["restored"] = False
                    fail("restoration_failed", row=label, negative=nid, actual=got)
            for c in controls.values():
                if evaluate(c.value, restored) != asdict(Outcome.accept()):
                    row["restored"] = False
                    fail("restored_control_refused", row=label, control=c.id)
            row["proved"] = (bool(own) and set(row["flips"]) == set(own) and not row["masked"]
                             and not row["unrelated_changes"] and row["controls_accept"] and row["restored"])
            row["complete"] = True
            if progress:
                progress(report)
            return row
        for gid, guard in sorted(guards.items()):
            if guard.classification != "guard":
                if guard.classification == "unclassified":
                    fail("unclassified_assertion", guard=gid)
                    report["unproved_guards"].append(gid)
                continue
            own = {n.id for n in negatives.values() if n.target == gid}
            row = matrix(gid, (gid,), own)
            if row["proved"]:
                proved.add(gid)
            elif own:
                report["masked_negatives"].extend(row["masked"])
                fail("guard_isolation_failed", guard=gid)
        for d in duplicate.values():
            own = {n.id for n in negatives.values() if n.target == d.id}
            proof = {"id": d.id, "sites": list(d.sites), "invariant": asdict(d.invariant),
                     "evidence": d.evidence, "per_site": [], "proved": False}
            # Removing EACH site alone must keep exactly the SAME defect code.
            for gid in d.sites:
                row = next(r for r in report["rows"] if r["id"] == gid)
                results = []
                state = suite.state(frozenset((gid,)))
                for nid in sorted(own):
                    got = evaluate(negatives[nid].value, state)
                    results.append({"negative": nid, "outcome": got,
                                    "same_defect": got == asdict(Outcome.refuse(negatives[nid].code))})
                remaining_state = suite.state(frozenset(set(d.sites) - {gid}))
                remaining = []
                for nid in sorted(own):
                    got = evaluate(negatives[nid].value, remaining_state)
                    remaining.append({"negative": nid, "outcome": got,
                                      "same_defect": got == asdict(Outcome.refuse(negatives[nid].code))})
                proof["per_site"].append({"site": gid, "results": results,
                    "site_restored_others_cut": remaining,
                    "unrelated_unchanged": not row["unrelated_changes"] and row["controls_accept"] and row["restored"]})
            all_row = matrix(d.id, d.sites, own)
            proof["proved"] = all_row["proved"] and all(
                s["unrelated_unchanged"] and all(r["same_defect"] for r in s["results"] + s["site_restored_others_cut"]) for s in proof["per_site"])
            if proof["proved"]:
                proved.update(d.sites)
            else:
                report["masked_negatives"].extend(all_row["masked"])
                fail("duplicate_unproved", duplicate=d.id)
            report["duplicates"].append(proof)
        for gid, guard in sorted(guards.items()):
            if guard.classification == "guard" and gid not in proved:
                report["unproved_guards"].append(gid)
        if report["unproved_guards"]:
            fail("unproved_guards", count=len(report["unproved_guards"]))
        if undeclared_entries:
            # A validator request is real consumption even when only a mutant
            # reaches it. Resolve and expose its obligations; never leave these
            # sites described as unreachable. No undeclared cut receives credit.
            expanded = SchemaCatalog(suite.schema.documents,
                roots=tuple(suite.schema.roots) + tuple(sorted(undeclared_entries)), format_checker=suite.schema.formats)
            newly_consumed = [g for g in expanded.guards.values() if g.entry_uri in undeclared_entries]
            locations = {(g.document, g.path, g.keyword, g.member) for g in newly_consumed}
            report["inventory"] = [g for g in report["inventory"] if not (g.get("classification") == "unreachable" and
                (g.get("document"), tuple(g.get("path", ())), g.get("keyword"), g.get("member")) in locations)]
            for guard in newly_consumed:
                if guard.classification in ("guard", "unclassified", "format_sweep"):
                    guard = replace(guard, classification="unclassified", evidence="actually consumed undeclared entry; occurrence and witnesses unproved")
                    report["unproved_guards"].append(guard.id)
                report["inventory"].append(asdict(guard))
        if suite.schema and digest(suite.schema.documents) != original_schema:
            fail("source_schema_changed")
        if digest([[c.id, c.value] for c in controls.values()] + [[n.id, n.value] for n in negatives.values()]) != original_inputs:
            fail("source_cases_changed")
        report["schema_sha256"] = original_schema
        report["code_sha256"] = {m.name: m.source_hash for m in suite.modules}
        report["classifications_require_review"] = [item.guard for item in suite.classifications if item.kind in ("redundant", "format_sweep")]
        report["format_sweep"] = [g.id for g in guards.values() if g.classification == "format_sweep"]
        report["classifications_require_review"].extend(report["format_sweep"])
        report["status"] = "FAIL" if report["failures"] else "PARTIAL" if report["classifications_require_review"] else "PASS"
    except Exception as exc:
        fail("infrastructure_or_declaration", error=type(exc).__name__ + ": " + str(exc))
    return report


def markdown(report):
    lines = [f"# Guard isolation: {report['suite']}", "", f"**{report['status']}**; {report['evaluations']} serial evaluations; "
             f"{len(report['unproved_guards'])} unproved guards; {len(report['masked_negatives'])} masked negatives.", "",
             "The JSON `negatives` array is the stable case universe. `stays` is its exact complement of `except`; "
             "every member was executed and its original refusal compared. No complement is inferred from dependencies.", "",
             "| Guard / set | Flipping negatives | Staying rejected | Result |", "|---|---|---:|---|"]
    for row in report["rows"]:
        flips = ", ".join(row["flips"]) or "none"
        lines.append(f"| `{row['id'].replace('|', '&#124;')}` | {flips.replace('|', '&#124;')} | "
                     f"{len(report['negatives']) - len(row['flips'])} | {'proved' if row.get('proved') else 'see JSON'} |")
    if report["duplicates"]:
        lines += ["", "Duplicate sets include the field/predicate declaration, each single-site result, and the all-sites cut in JSON."]
    if report["failures"]:
        lines += ["", "Failures: " + ", ".join(sorted({f['kind'] for f in report['failures']})) + "."]
    return "\n".join(lines) + "\n"


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--adapter", help="Python file:factory returning Suite (trusted repository code)")
    parser.add_argument("--self-test", action="store_true")
    parser.add_argument("--json", type=Path, help="JSON output; stdout if omitted")
    parser.add_argument("--markdown", type=Path)
    parser.add_argument("--max-rss", type=int, default=2048, metavar="MIB")
    parser.add_argument("--pause-when-low", type=int, default=0, metavar="GIB")
    parser.add_argument("--resume-at", type=int)
    parser.add_argument("--pause-poll", type=float, default=120)
    parser.add_argument("--low-timeout", type=float, default=2700)
    args = parser.parse_args(argv)
    memory = MemoryGate(args.max_rss, args.pause_when_low, args.resume_at, args.pause_poll, args.low_timeout)
    if args.self_test == bool(args.adapter):
        parser.error("choose exactly one of --self-test or --adapter")
    try:
        memory.check()
        if args.self_test:
            report = self_test(memory)
        else:
            path, sep, factory = args.adapter.rpartition(":")
            if not sep:
                parser.error("--adapter requires file:factory")
            # Importing this script by its CLI name and canonical name shares dataclasses.
            sys.modules.setdefault("pm_guard_isolation", sys.modules[__name__])
            spec = importlib.util.spec_from_file_location("_guard_isolation_adapter", path)
            module = importlib.util.module_from_spec(spec)
            sys.modules[spec.name] = module
            spec.loader.exec_module(module)
            suite = getattr(module, factory)()
            if not isinstance(suite, Suite):
                raise IsolationError("adapter must return Suite")
            report = run(suite, memory=memory)
    except Exception as exc:
        report = {"version": 1, "suite": "setup", "status": "FAIL", "evaluations": 0,
                  "controls": [], "negatives": [], "inventory": [], "rows": [], "duplicates": [],
                  "unproved_guards": [], "masked_negatives": [],
                  "failures": [{"kind": "infrastructure_or_declaration", "error": type(exc).__name__ + ": " + str(exc)}]}
    body = json.dumps(report, indent=2, sort_keys=True) + "\n"
    if args.json:
        args.json.write_text(body)
    else:
        print(body, end="")
    if args.markdown:
        args.markdown.write_text(markdown(report) if "suite" in report else self_test_markdown(report))
    return 0 if report["status"] == "PASS" else 1


# The small trap harness is below the engine so adapters import only one module.
def self_test(memory=None):
    from pm_guard_isolation_traps import exercise
    return exercise(sys.modules[__name__], memory or MemoryGate())


def self_test_markdown(report):
    lines = ["# Guard-isolation self-test", "", f"**{report['status']}**: {report['caught']}/{len(report['traps'])} traps caught.", "",
             "| Trap | Expected observation | Result |", "|---|---|---|"]
    for row in report["traps"]:
        lines.append(f"| {row['id']} | {row['expected']} | {'caught' if row['caught'] else 'FAILED'} |")
    return "\n".join(lines) + "\n"


if __name__ == "__main__":
    raise SystemExit(main())
