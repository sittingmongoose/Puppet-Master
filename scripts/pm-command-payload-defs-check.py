#!/usr/bin/env python3
"""Check the typed command payload definitions for UI_Command_Catalog UCC-049..UCC-105 (DL-333).

Static and read-only. The catalog keeps command ids, labels, availability and aliases; each active
command gets one ``pm.command_payload_definitions.v1`` definition in the owner doc that the catalog's
map unit UCC-230 names. This script reads:

* ``Plans/UI_Command_Catalog.md``: the PlanUnits UCC-049..UCC-105, the map unit UCC-230
  (``command_payload_definition_map``), the strict schema overlay section (closed code sets, common
  fields and the row-specific identity table) and every catalog table that has a ``command_kind``
  column;
* every top-level ``Plans/*.md``: each ```` ```yaml ```` fence whose top-level key is
  ``command_payload_definitions`` and the PlanUnit its ``owner_unit`` names;
* ``Plans/ui_command_response.schema.json`` (``$defs.UICommandError.properties.code.enum``);
* ``Plans/Wiring_Matrix.production.json`` (``ui_command_id``, ``request_schema_ref``) and
  ``Plans/Wiring_Matrix.production.exclusions.json`` (``excluded_tokens``);
* the targets of contract refs: JSON ``$defs`` entries and PlanUnits in named Plans docs.

Units are parsed with ``scripts/pm-plan-index.py``'s ``PLAN_UNIT_FENCE_PATTERN`` and
``UniqueKeySafeLoader``, so they parse exactly as the plan index parses them and duplicate YAML keys
are rejected. Every finding carries a stable code (C01..C14). Exit codes: 0 pass (warnings allowed),
1 findings, 2 parse or usage error. Output is sorted and has no timestamps.
"""

from __future__ import annotations

import argparse
import copy
import datetime
import importlib.util
import json
import math
import re
import subprocess
import sys
import tempfile
from collections import defaultdict
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any, Callable
from urllib.parse import urlparse

import yaml

SCRIPT_DIR = Path(__file__).resolve().parent
ROOT = SCRIPT_DIR.parent


def _load_plan_index_module():
    """Load scripts/pm-plan-index.py so units parse identically (fence pattern and loader)."""
    module_name = "pm_plan_index_for_payload_defs"
    existing = sys.modules.get(module_name)
    if existing is not None:
        return existing
    path = SCRIPT_DIR / "pm-plan-index.py"
    spec = importlib.util.spec_from_file_location(module_name, path)
    if spec is None or spec.loader is None:
        raise ImportError(f"unable to load {path}")
    module = importlib.util.module_from_spec(spec)
    sys.modules[module_name] = module
    try:
        spec.loader.exec_module(module)
    except BaseException:
        sys.modules.pop(module_name, None)
        raise
    return module


_PLAN_INDEX = _load_plan_index_module()
PLAN_UNIT_FENCE_PATTERN: re.Pattern[str] = _PLAN_INDEX.PLAN_UNIT_FENCE_PATTERN
UniqueKeySafeLoader = _PLAN_INDEX.UniqueKeySafeLoader

FORMAT = "pm.command_payload_definitions.v1"
CATALOG = "Plans/UI_Command_Catalog.md"
MAP_UNIT = "UCC-230"
MAP_KEY = "command_payload_definition_map"
OVERLAY_REF = f"{CATALOG}#{MAP_UNIT}"
RESPONSE_SCHEMA = "Plans/ui_command_response.schema.json"
WIRING = "Plans/Wiring_Matrix.production.json"
EXCLUSIONS = "Plans/Wiring_Matrix.production.exclusions.json"
DECISION_LOG = "Plans/Decision_Log.md"
OVERLAY_HEADING = "UCC-049 through UCC-105 strict schema overlay and UCC-106 lineage exclusion"
UNIT_RANGE = ("UCC-049", "UCC-105")

# Pinned contract: changing any of these is a deliberate edit of this script and of UCC-230.
TYPE_VOCABULARY = (
    "id", "ref", "secret_ref", "string", "boolean", "integer", "sha256", "timestamp",
    "url", "path", "enum", "const", "list", "object", "contract",
)
CONSTRAINT_KEYS = ("min_length", "max_length", "pattern", "minimum", "maximum", "min_items", "max_items", "unique_items")
CONDITIONAL_KEYS = ("required_when", "forbidden_when")
COMMAND_KINDS = ("shell_view", "navigation_wrapper", "domain_action")
RESPONSE_KINDS = ("owner_operation", "local_projection")
OVERLAY_DISABLED_REASON_CODES = (
    "unsupported", "not_configured", "unauthorized", "unreachable", "degraded",
    "partial_capability", "blocked_state_required", "stale_projection", "permission_required",
)
PRIMITIVE_REFS = ("Primitive:RouteTarget", "Primitive:OpenSubject", "Primitive:ExecutionContext")
ALIAS_KINDS = ("compatibility_alias", "family_alias", "deprecated_alias", "alias")
NON_DEFINITION_DISPOSITIONS = ALIAS_KINDS + (
    "superseded_alias", "retired", "retired_non_alias", "source_lineage", "owned_outside_range",
)
ERROR_NARROWING = {
    "always": ["handler_unavailable", "internal_error", "invalid_args", "permission_denied"],
    "domain_action_or_stale_disabled": ["stale_projection"],
    "blocked_disabled_or_runtime_group": ["blocked_state_required"],
    "navigation_or_route_args": ["invalid_route"],
    "never": ["unknown_command"],
}
RUNTIME_GROUP = "UCC-089..UCC-095"
ROUTE_ARGS = ("route_target", "OpenSubject")

FIELD_KEYS = {"type", "required", "default", "values", "value", "item", "fields", "ref", "constraints",
              "required_when", "forbidden_when", "provenance", "source", "gap_note"}
ITEM_KEYS = {"type", "values", "value", "item", "fields", "ref", "constraints"}
DEFINITION_KEYS = {"command_id", "ucc_units", "command_kind", "response_kind", "args", "owner_request", "result",
                   "error_codes", "disabled_reason_codes", "aliases", "identity_exemptions", "narrowing_gap_note"}
REQUIRED_DEFINITION_KEYS = {"command_id", "ucc_units", "command_kind", "response_kind", "args", "owner_request",
                            "result", "error_codes", "disabled_reason_codes", "aliases"}
BLOCK_KEYS = {"format", "owner_unit", "overlay", "definitions", "results"}

CONCRETE_RE = re.compile(r"cmd\.[a-z0-9_.]+")
UNIT_ID_RE = re.compile(r"UCC-(\d{3})")
SNAKE_RE = re.compile(r"^[a-z][a-z0-9_]*$")
NAMESPACE_RE = re.compile(r"[a-z][a-z0-9_]*(?:\.[a-z][a-z0-9_]*)*")
BACKTICK_RE = re.compile(r"`([^`]+)`")
DEFS_ROOT_KEY = "command_payload_definitions"
# Last resort for YAML the scanner cannot read at all: the plain root key at column zero.
DEFS_FALLBACK_RE = re.compile(r"^command_payload_definitions[ \t]*:", re.M)
JSON_DEF_REF_RE = re.compile(r"^(Plans/[A-Za-z0-9_.\-/]+\.json)#/\$defs/([A-Za-z0-9_]+)$")
DOC_UNIT_REF_RE = re.compile(r"^(Plans/[A-Za-z0-9_.\-]+\.md)#([A-Z][A-Z0-9]*-\d+)$")
LOCAL_REF_RE = re.compile(r"^local:([A-Za-z][A-Za-z0-9_]*)$")
DL_RE = re.compile(r"^DL-\d+$")
AMENDED_PREFIX_RE = re.compile(r"^Amended \d{4}-\d{2}-\d{2} \([^)]*\):\s*")
COPULA_RE = re.compile(r"\s(?:is|are)\s|:\s")
MARKER_RE = re.compile(r"(alias|retire|lineage|superseded|deprecated)", re.I)
SUBJECT_TOKEN_RE = re.compile(r"(cmd\.[a-z0-9_.]*[a-z0-9_])((?:/[a-z0-9_]+)*)")
CONTINUATION_RE = re.compile(r"^(?:\s*,\s*(?:and\s+)?|\s+and\s+)([a-z][a-z0-9_]*)\b")

CODE_NAMES = {
    "C00": "C00_internal_error",
    "C01": "C01_overlay_codes",
    "C02": "C02_expected_set",
    "C03": "C03_placement",
    "C04": "C04_no_alias_defs",
    "C05": "C05_types",
    "C06": "C06_defaults",
    "C07": "C07_identity",
    "C08": "C08_envelope",
    "C09": "C09_narrowing",
    "C10": "C10_result",
    "C11": "C11_provenance",
    "C12": "C12_kind",
    "C13": "C13_owner_request",
    "C14": "C14_format",
}
WARNING_CODES = {"C13"}


class ParseError(Exception):
    """An input the check cannot do without is missing or unreadable (exit 2)."""


# --------------------------------------------------------------------------------------------
# Inputs


class Corpus:
    """Read-only view of the Plans tree: either a directory or an in-memory mapping (self-test)."""

    def __init__(self, plans_root: Path | None = None, files: dict[str, str] | None = None) -> None:
        self.plans_root = plans_root
        self.files = files
        self._json: dict[str, Any] = {}
        self._units: dict[str, dict[str, "Unit"]] = {}

    def text(self, rel: str) -> str | None:
        if not rel.startswith("Plans/") or ".." in rel.split("/"):
            return None
        if self.files is not None:
            return self.files.get(rel)
        assert self.plans_root is not None
        path = self.plans_root / rel[len("Plans/"):]
        if not path.is_file():
            return None
        return path.read_text(encoding="utf-8")

    def top_level_docs(self) -> list[str]:
        if self.files is not None:
            names = [rel for rel in self.files if re.fullmatch(r"Plans/[^/]+\.md", rel)]
        else:
            assert self.plans_root is not None
            names = [f"Plans/{p.name}" for p in self.plans_root.glob("*.md") if p.is_file()]
        return sorted(names)

    def json(self, rel: str) -> Any:
        if rel not in self._json:
            text = self.text(rel)
            if text is None:
                self._json[rel] = None
            else:
                try:
                    self._json[rel] = json.loads(text)
                except json.JSONDecodeError:
                    self._json[rel] = None
        return self._json[rel]

    def units(self, rel: str) -> dict[str, "Unit"]:
        if rel not in self._units:
            text = self.text(rel)
            self._units[rel] = parse_units(text, rel, strict=False)[0] if text is not None else {}
        return self._units[rel]


@dataclass
class Unit:
    data: dict[str, Any]
    path: str
    line: int
    start: int
    end: int


@dataclass
class Block:
    path: str
    line: int
    start: int
    text: str
    data: Any = None
    error: str | None = None


@dataclass
class Finding:
    code: str
    kind: str
    path: str
    command_id: str = ""
    unit: str = ""
    field: str = ""
    detail: str = ""

    def as_dict(self) -> dict[str, Any]:
        row = {
            "code": CODE_NAMES[self.code],
            "severity": "warning" if self.code in WARNING_CODES else "error",
            "kind": self.kind,
            "path": self.path,
        }
        for name in ("command_id", "unit", "field", "detail"):
            value = getattr(self, name)
            if value:
                row[name] = value
        return row

    def sort_key(self) -> tuple[str, ...]:
        return (self.code, self.path, self.command_id, self.unit, self.field, self.kind, self.detail)


@dataclass
class Report:
    findings: list[Finding] = field(default_factory=list)

    def add(self, code: str, kind: str, path: str, **kwargs: Any) -> None:
        self.findings.append(Finding(code, kind, path, **{k: ("" if v is None else str(v)) for k, v in kwargs.items()}))


def line_of(text: str, offset: int) -> int:
    return text.count("\n", 0, offset) + 1


def _root_key_by_tokens(block: str) -> tuple[bool, bool]:
    """(found, scanner_failed): whether a top-level mapping key spelled command_payload_definitions
    occurs before the YAML scanner stops, in any quoting, flow or explicit-key form."""
    depth, key_next, pending_anchor = 0, False, None
    anchors: dict[str, str] = {}
    try:
        for token in yaml.scan(block, Loader=yaml.SafeLoader):
            kind = type(token).__name__
            if kind in ("BlockMappingStartToken", "BlockSequenceStartToken", "FlowMappingStartToken", "FlowSequenceStartToken"):
                depth += 1
                pending_anchor = None
            elif kind in ("BlockEndToken", "FlowMappingEndToken", "FlowSequenceEndToken"):
                depth -= 1
            elif kind == "KeyToken":
                key_next = depth == 1
                continue
            elif kind == "AnchorToken":
                pending_anchor = token.value  # a node property: the key may still follow
                continue
            elif kind == "TagToken":
                continue  # a node property: the key may still follow
            elif kind == "AliasToken":
                if key_next and anchors.get(token.value) == DEFS_ROOT_KEY:
                    return True, False
            elif kind == "ScalarToken":
                if pending_anchor is not None:
                    anchors[pending_anchor] = token.value
                    pending_anchor = None
                if key_next and token.value == DEFS_ROOT_KEY:
                    return True, False
            key_next = False
    except Exception:  # noqa: BLE001 - the scanner stopped; report what it saw
        return False, True
    return False, False


def is_definitions_block(block: str) -> bool:
    """A yaml fence is a definitions block when its YAML root mapping has the key
    command_payload_definitions, in any spelling YAML allows (plain, quoted, indented, flow or
    explicit key), whatever its value. The composer decides for well-formed YAML, so the key text
    inside a scalar never counts; for YAML the composer rejects, a scanner pass finds a top-level
    key before the error, and only YAML the scanner cannot read falls back to the plain key at
    column zero. A detected block then gets the C14 shape and format checks."""
    try:
        nodes = list(yaml.compose_all(block, Loader=yaml.SafeLoader))
    except Exception:  # noqa: BLE001 - malformed YAML: fall back to tokens
        found, scanner_failed = _root_key_by_tokens(block)
        return found or (scanner_failed and DEFS_FALLBACK_RE.search(block) is not None)
    for node in nodes:
        if isinstance(node, yaml.MappingNode):
            for key, _value in node.value:
                if isinstance(key, yaml.ScalarNode) and key.value == DEFS_ROOT_KEY:
                    return True
    return False


def parse_units(text: str, rel: str, *, strict: bool) -> tuple[dict[str, Unit], list[str]]:
    """Parse PlanUnit fences exactly as pm-plan-index.py does; definitions blocks are not units."""
    units: dict[str, Unit] = {}
    errors: list[str] = []
    for match in PLAN_UNIT_FENCE_PATTERN.finditer(text):
        block = match.group(1)
        if is_definitions_block(block) or "plan_unit_id:" not in block:
            continue
        line = line_of(text, match.start())
        try:
            data = yaml.load(block, Loader=UniqueKeySafeLoader)
        except Exception as exc:  # noqa: BLE001 - reported with its location
            message = f"{rel}:{line}: plan unit YAML error: {exc}"
            if strict:
                raise ParseError(message) from exc
            errors.append(message)
            continue
        if not isinstance(data, dict) or not data.get("plan_unit_id"):
            continue
        uid = str(data["plan_unit_id"])
        if uid in units:
            message = f"{rel}:{line}: duplicate plan_unit_id {uid}"
            if strict:
                raise ParseError(message)
            errors.append(message)
            continue
        units[uid] = Unit(data, rel, line, match.start(), match.end())
    return units, errors


def find_blocks(text: str, rel: str) -> list[Block]:
    blocks = []
    for match in PLAN_UNIT_FENCE_PATTERN.finditer(text):
        block = match.group(1)
        if not is_definitions_block(block):
            continue
        item = Block(rel, line_of(text, match.start()), match.start(), block)
        try:
            item.data = yaml.load(block, Loader=UniqueKeySafeLoader)
        except Exception as exc:  # noqa: BLE001 - becomes a C14 finding
            item.error = " ".join(str(exc).split())
        blocks.append(item)
    return blocks


def split_row(line: str) -> list[str]:
    """Split a markdown table row on pipes outside backticks."""
    body = line.strip()
    if body.startswith("|"):
        body = body[1:]
    if body.endswith("|") and not body.endswith("\\|"):
        body = body[:-1]
    cells, current, in_code, i = [], [], False, 0
    while i < len(body):
        ch = body[i]
        if ch == "\\" and i + 1 < len(body) and body[i + 1] == "|":
            current.append("|")
            i += 2
            continue
        if ch == "`":
            in_code = not in_code
        if ch == "|" and not in_code:
            cells.append("".join(current).strip())
            current = []
        else:
            current.append(ch)
        i += 1
    cells.append("".join(current).strip())
    return cells


def unit_number(uid: str) -> int | None:
    match = UNIT_ID_RE.fullmatch(uid)
    return int(match.group(1)) if match else None


def in_range(uid: str, first: str, last: str) -> bool:
    n, a, b = unit_number(uid), unit_number(first), unit_number(last)
    return None not in (n, a, b) and a <= n <= b  # type: ignore[operator]


def normalize_space(value: str) -> str:
    return " ".join(value.split())


def field_text(value: Any) -> str:
    if isinstance(value, list):
        return "\n".join(str(item) for item in value)
    return "" if value is None else str(value)


# --------------------------------------------------------------------------------------------
# Overlay


@dataclass
class Overlay:
    error_codes: list[str]
    disabled_codes: list[str]
    payload_required: list[str]
    payload_optional: list[str]
    rows: dict[tuple[str, str], tuple[list[str], list[str]]]  # (first, last) -> (required, optional)


def parse_overlay(text: str) -> Overlay:
    lines = text.split("\n")
    start = next((i for i, line in enumerate(lines) if line.strip() == f"### {OVERLAY_HEADING}"), None)
    if start is None:
        raise ParseError(f"{CATALOG}: overlay section '### {OVERLAY_HEADING}' not found")
    end = next((j for j in range(start + 1, len(lines)) if re.match(r"^#{1,3}\s", lines[j])), len(lines))
    section = lines[start + 1:end]
    bullets: dict[str, list[str]] = {}
    rows: dict[tuple[str, str], tuple[list[str], list[str]]] = {}
    for line in section:
        bullet = re.match(r"^- `([a-z_]+)`:(.*)$", line)
        if bullet:
            bullets[bullet.group(1)] = BACKTICK_RE.findall(bullet.group(2))
            continue
        if line.startswith("| `UCC-"):
            cells = split_row(line)
            ids = re.findall(r"UCC-\d{3}", cells[0]) if cells else []
            if not ids or len(cells) < 3:
                continue
            first, last = ids[0], ids[-1]
            required, optional = [], []
            # The identity list ends at the first ';' (a trailing clause such as UCC-089..UCC-095's
            # "pre-attempt blocked rows MUST NOT fabricate an `attempt_id`" is a rule, not a field).
            for token in BACKTICK_RE.findall(cells[2].split(";", 1)[0]):
                name = token.rstrip("?")
                if not re.fullmatch(r"[A-Za-z_][A-Za-z0-9_]*", name):
                    continue
                (optional if token.endswith("?") else required).append(name)
            rows[(first, last)] = (required, optional)
    for name in ("error_codes", "disabled_reason_codes", "payload_required", "payload_optional"):
        if name not in bullets:
            raise ParseError(f"{CATALOG}: overlay bullet `{name}` not found")

    def clean(token: str) -> str:
        return token.rstrip("?").removesuffix("[]")

    return Overlay(
        error_codes=bullets["error_codes"],
        disabled_codes=bullets["disabled_reason_codes"],
        payload_required=[clean(t) for t in bullets["payload_required"]],
        payload_optional=[clean(t) for t in bullets["payload_optional"]],
        rows=rows,
    )


def catalog_command_kinds(text: str) -> dict[str, set[tuple[str, int]]]:
    """Command kinds the catalog states in tables that have a ``command_kind`` column."""
    kinds: dict[str, set[tuple[str, int]]] = defaultdict(set)
    lines = text.split("\n")
    i = 0
    while i < len(lines):
        line = lines[i]
        if line.startswith("|") and i + 1 < len(lines) and re.match(r"^\|\s*:?-{3,}", lines[i + 1]):
            header = [cell.strip().strip("`").strip() for cell in split_row(line)]
            j = i + 2
            if "command_kind" in header:
                index = header.index("command_kind")
                while j < len(lines) and lines[j].startswith("|"):
                    cells = split_row(lines[j])
                    if len(cells) > index:
                        ids = BACKTICK_RE.findall(cells[0])
                        kind = cells[index].strip().strip("`").strip()
                        if len(ids) == 1 and CONCRETE_RE.fullmatch(ids[0]) and kind in COMMAND_KINDS:
                            kinds[ids[0]].add((kind, j + 1))
                    j += 1
            else:
                while j < len(lines) and lines[j].startswith("|"):
                    j += 1
            i = j
            continue
        i += 1
    return kinds


def marked_tokens(entry: str) -> set[str]:
    """Concrete tokens a compatibility or stale note marks as alias, retired or lineage (subject rule)."""
    text = AMENDED_PREFIX_RE.sub("", normalize_space(entry))
    marked: set[str] = set()
    for clause in re.split(r";\s+|\.\s+", text):
        copula = COPULA_RE.search(clause)
        if not copula:
            continue
        subject, predicate = clause[:copula.start()], clause[copula.end():]
        if not MARKER_RE.search(predicate):
            continue
        for match in SUBJECT_TOKEN_RE.finditer(subject):
            token, slashes = match.group(1), match.group(2)
            prefix = token.rsplit(".", 1)[0] + "."
            marked.add(token)
            for part in [p for p in slashes.split("/") if p]:
                marked.add(prefix + part)
            rest = subject[match.end():]
            while True:
                more = CONTINUATION_RE.match(rest)
                if not more:
                    break
                marked.add(prefix + more.group(1))
                rest = rest[more.end():]
    return marked


# --------------------------------------------------------------------------------------------
# The check


@dataclass
class Context:
    corpus: Corpus
    report: Report
    overlay: Overlay
    catalog_units: dict[str, Unit]
    map: dict[str, Any]
    error_set: set[str]
    disabled_set: set[str]
    row_groups: dict[str, dict[str, Any]] = field(default_factory=dict)
    expected: set[str] = field(default_factory=set)
    primary: dict[str, str] = field(default_factory=dict)
    covering: dict[str, set[str]] = field(default_factory=dict)
    group_of: dict[str, str] = field(default_factory=dict)
    non_def: dict[str, dict[str, Any]] = field(default_factory=dict)
    contested: dict[str, dict[str, Any]] = field(default_factory=dict)
    owner_units: dict[str, str] = field(default_factory=dict)
    routes: list[dict[str, Any]] = field(default_factory=list)
    exceptions: dict[str, str] = field(default_factory=dict)
    common_optional: dict[str, dict[str, Any]] = field(default_factory=dict)
    envelope_required: set[str] = field(default_factory=set)
    exemptions: dict[tuple[str, str], str] = field(default_factory=dict)
    pre_attempt: tuple[str, set[str]] = ("attempt_id", set())
    excluded: set[str] = field(default_factory=set)
    wiring_requests: dict[str, set[str]] = field(default_factory=dict)
    catalog_kinds: dict[str, set[tuple[str, int]]] = field(default_factory=dict)
    gap_fields: dict[str, int] = field(default_factory=dict)


def as_list(value: Any) -> list[Any]:
    if value is None:
        return []
    return value if isinstance(value, list) else [value]


def load_context(corpus: Corpus, report: Report) -> Context:
    catalog_text = corpus.text(CATALOG)
    if catalog_text is None:
        raise ParseError(f"{CATALOG}: missing")
    catalog_units, _ = parse_units(catalog_text, CATALOG, strict=True)
    corpus._units[CATALOG] = catalog_units
    map_unit = catalog_units.get(MAP_UNIT)
    if map_unit is None:
        raise ParseError(f"{CATALOG}: map unit {MAP_UNIT} not found")
    mapping = map_unit.data.get(MAP_KEY)
    if not isinstance(mapping, dict):
        raise ParseError(f"{CATALOG}: {MAP_UNIT} has no `{MAP_KEY}` mapping")
    overlay = parse_overlay(catalog_text)
    schema = corpus.json(RESPONSE_SCHEMA)
    try:
        enum = schema["$defs"]["UICommandError"]["properties"]["code"]["enum"]
    except (TypeError, KeyError) as exc:
        raise ParseError(f"{RESPONSE_SCHEMA}: $defs.UICommandError.properties.code.enum unavailable") from exc
    wiring = corpus.json(WIRING)
    if not isinstance(wiring, dict) or not isinstance(wiring.get("entries"), dict):
        raise ParseError(f"{WIRING}: missing or has no entries object")
    exclusions = corpus.json(EXCLUSIONS)
    if not isinstance(exclusions, dict) or not isinstance(exclusions.get("excluded_tokens"), list):
        raise ParseError(f"{EXCLUSIONS}: missing or has no excluded_tokens list")

    ctx = Context(
        corpus=corpus,
        report=report,
        overlay=overlay,
        catalog_units=catalog_units,
        map=mapping,
        error_set=set(overlay.error_codes),
        disabled_set=set(overlay.disabled_codes),
    )
    ctx.excluded = {str(t) for t in exclusions["excluded_tokens"]}
    for row in wiring["entries"].values():
        if isinstance(row, dict) and isinstance(row.get("ui_command_id"), str):
            refs = ctx.wiring_requests.setdefault(row["ui_command_id"], set())
            if isinstance(row.get("request_schema_ref"), str):
                refs.add(row["request_schema_ref"])
    ctx.catalog_kinds = catalog_command_kinds(catalog_text)

    # C01: the overlay's closed sets.
    if set(overlay.error_codes) != set(enum) or len(overlay.error_codes) != len(set(overlay.error_codes)):
        report.add("C01", "overlay_error_set_differs_from_UICommandError_code", CATALOG,
                   detail=f"overlay={sorted(overlay.error_codes)} schema={sorted(enum)}")
    if set(overlay.disabled_codes) != set(OVERLAY_DISABLED_REASON_CODES) or len(overlay.disabled_codes) != len(OVERLAY_DISABLED_REASON_CODES):
        report.add("C01", "overlay_disabled_set_differs_from_nine_codes", CATALOG,
                   detail=f"overlay={sorted(overlay.disabled_codes)}")
    return ctx


def check_map(ctx: Context) -> None:
    rep, mp = ctx.report, ctx.map
    if mp.get("format") != FORMAT:
        rep.add("C14", "map_format", CATALOG, unit=MAP_UNIT, detail=str(mp.get("format")))
    if list(as_list(mp.get("type_vocabulary"))) != list(TYPE_VOCABULARY):
        rep.add("C05", "map_type_vocabulary_differs", CATALOG, unit=MAP_UNIT)
    if sorted(as_list(mp.get("literal_default_forbidden_types"))) != sorted(LITERAL_DEFAULT_FORBIDDEN_TYPES):
        rep.add("C05", "map_literal_default_rule_differs", CATALOG, unit=MAP_UNIT)
    if sorted(as_list(mp.get("constraint_keys"))) != sorted(CONSTRAINT_KEYS):
        rep.add("C05", "map_constraint_keys_differ", CATALOG, unit=MAP_UNIT)
    if sorted(as_list(mp.get("conditional_keys"))) != sorted(CONDITIONAL_KEYS):
        rep.add("C05", "map_conditional_keys_differ", CATALOG, unit=MAP_UNIT)
    narrowing = mp.get("error_narrowing")
    if not isinstance(narrowing, dict) or {k: sorted(as_list(v)) for k, v in narrowing.items()} != ERROR_NARROWING:
        rep.add("C09", "map_error_narrowing_differs", CATALOG, unit=MAP_UNIT)

    # Envelope (C08 map side).
    envelope = mp.get("envelope") if isinstance(mp.get("envelope"), dict) else {}
    ctx.envelope_required = {str(x) for x in as_list(envelope.get("required_not_restated"))}
    overlay_required = set(ctx.overlay.payload_required) - {"row_specific_identity"}
    if ctx.envelope_required != overlay_required:
        rep.add("C08", "map_envelope_required_differs_from_overlay", CATALOG, unit=MAP_UNIT,
                detail=f"map={sorted(ctx.envelope_required)} overlay={sorted(overlay_required)}")
    common = envelope.get("common_optional")
    ctx.common_optional = {str(k): v for k, v in common.items()} if isinstance(common, dict) else {}
    if set(ctx.common_optional) != set(ctx.overlay.payload_optional):
        rep.add("C08", "map_common_optional_differs_from_overlay", CATALOG, unit=MAP_UNIT,
                detail=f"map_only={sorted(set(ctx.common_optional) - set(ctx.overlay.payload_optional))} "
                       f"overlay_only={sorted(set(ctx.overlay.payload_optional) - set(ctx.common_optional))}")
    for name, spec in sorted(ctx.common_optional.items()):
        if not isinstance(spec, dict) or spec.get("type") not in TYPE_VOCABULARY:
            rep.add("C08", "map_common_optional_type_invalid", CATALOG, unit=MAP_UNIT, field=name)

    # Row groups (C07 map side) against the overlay identity table.
    groups = as_list(mp.get("row_groups"))
    map_ranges = {}
    for group in groups:
        if not isinstance(group, dict):
            rep.add("C07", "map_row_group_malformed", CATALOG, unit=MAP_UNIT)
            continue
        first, last = str(group.get("first")), str(group.get("last"))
        gid = str(group.get("id"))
        if gid != f"{first}..{last}":
            rep.add("C07", "map_row_group_id_mismatch", CATALOG, unit=MAP_UNIT, detail=gid)
        required = []
        for entry in as_list(group.get("required_identity")):
            if not isinstance(entry, dict) or entry.get("when") not in ("always", "domain_action"):
                rep.add("C07", "map_required_identity_malformed", CATALOG, unit=MAP_UNIT, detail=gid)
                continue
            required.append(entry)
        group = dict(group)
        group["required_identity"] = required
        ctx.row_groups[gid] = group
        map_ranges[(first, last)] = gid
    overlay_ranges = {key: value for key, value in ctx.overlay.rows.items() if in_range(key[0], *UNIT_RANGE) and in_range(key[1], *UNIT_RANGE)}
    if set(map_ranges) != set(overlay_ranges):
        rep.add("C07", "map_row_groups_differ_from_overlay_rows", CATALOG, unit=MAP_UNIT,
                detail=f"map={sorted(map_ranges)} overlay={sorted(overlay_ranges)}")
    for key, gid in sorted(map_ranges.items()):
        if key not in overlay_ranges:
            continue
        o_required, o_optional = overlay_ranges[key]
        group = ctx.row_groups[gid]
        m_required = sorted(str(e.get("field")) for e in group["required_identity"])
        m_optional = sorted(str(x) for x in as_list(group.get("optional_identity")))
        if m_required != sorted(o_required) or m_optional != sorted(o_optional):
            rep.add("C07", "map_row_group_identity_differs_from_overlay_cell", CATALOG, unit=MAP_UNIT,
                    detail=f"{gid}: map required={m_required} optional={m_optional}; overlay required={sorted(o_required)} optional={sorted(o_optional)}")
    all_numbers = []
    for (first, last) in map_ranges:
        a, b = unit_number(first), unit_number(last)
        if a is None or b is None:
            continue
        all_numbers.extend(range(a, b + 1))
    expected_numbers = list(range(unit_number(UNIT_RANGE[0]) or 0, (unit_number(UNIT_RANGE[1]) or 0) + 1))
    if sorted(all_numbers) != expected_numbers:
        rep.add("C07", "map_row_groups_do_not_partition_range", CATALOG, unit=MAP_UNIT)

    pre = mp.get("pre_attempt_admissible") if isinstance(mp.get("pre_attempt_admissible"), dict) else {}
    ctx.pre_attempt = (str(pre.get("field", "attempt_id")), {str(c) for c in as_list(pre.get("commands"))})

    # Owners (C03 map side).
    owners = mp.get("owners") if isinstance(mp.get("owners"), dict) else {}
    units = owners.get("units") if isinstance(owners.get("units"), dict) else {}
    ctx.owner_units = {str(k): str(v) for k, v in units.items()}
    for uid, doc in sorted(ctx.owner_units.items()):
        if not re.fullmatch(r"Plans/[^/]+\.md", doc):
            rep.add("C03", "map_owner_doc_invalid", CATALOG, unit=uid, detail=doc)
    for route in as_list(owners.get("routes")):
        # A route names its namespace without the literal "cmd." prefix (the catalog's wiring gate reads every
        # cmd.* token in the catalog as a command id); it matches ids that start with "cmd.<namespace>.".
        if (not isinstance(route, dict) or str(route.get("unit")) not in ctx.owner_units
                or str(route.get("row_group")) not in ctx.row_groups
                or not NAMESPACE_RE.fullmatch(str(route.get("namespace", "")))):
            rep.add("C03", "map_route_invalid", CATALOG, unit=MAP_UNIT, detail=json.dumps(route, sort_keys=True))
            continue
        ctx.routes.append({"row_group": str(route["row_group"]), "prefix": f"cmd.{route['namespace']}.", "unit": str(route["unit"])})
    for entry in as_list(owners.get("exceptions")):
        if not isinstance(entry, dict) or str(entry.get("unit")) not in ctx.owner_units or not entry.get("command_id"):
            rep.add("C03", "map_exception_invalid", CATALOG, unit=MAP_UNIT, detail=json.dumps(entry, sort_keys=True))
            continue
        ctx.exceptions[str(entry["command_id"])] = str(entry["unit"])

    # Exemptions, contested, owner-state map.
    for entry in as_list(mp.get("identity_exemptions")):
        if not isinstance(entry, dict) or not DL_RE.match(str(entry.get("decision", ""))) or not entry.get("command_id") or not entry.get("field"):
            rep.add("C07", "map_identity_exemption_malformed", CATALOG, unit=MAP_UNIT, detail=json.dumps(entry, sort_keys=True))
            continue
        decision = str(entry["decision"])
        if decision not in ctx.corpus.units(DECISION_LOG):
            rep.add("C07", "map_identity_exemption_decision_missing", CATALOG, unit=MAP_UNIT,
                    command_id=entry["command_id"], detail=decision)
        ctx.exemptions[(str(entry["command_id"]), str(entry["field"]))] = decision
    for entry in as_list(mp.get("contested")):
        if not isinstance(entry, dict) or not entry.get("command_id") or not entry.get("question_id") or not entry.get("reason"):
            rep.add("C02", "map_contested_malformed", CATALOG, unit=MAP_UNIT, detail=json.dumps(entry, sort_keys=True))
            continue
        ctx.contested[str(entry["command_id"])] = entry
    for entry in as_list(mp.get("owner_state_code_map")):
        if not isinstance(entry, dict) or str(entry.get("maps_to")) not in ctx.disabled_set or not entry.get("owner_state"):
            rep.add("C09", "map_owner_state_code_invalid", CATALOG, unit=MAP_UNIT, detail=json.dumps(entry, sort_keys=True))


def compute_expected(ctx: Context) -> None:
    rep, mp = ctx.report, ctx.map
    token_units: dict[str, set[str]] = defaultdict(set)
    marked: dict[str, set[str]] = defaultdict(set)
    first_n, last_n = unit_number(UNIT_RANGE[0]), unit_number(UNIT_RANGE[1])
    for n in range(first_n or 0, (last_n or 0) + 1):
        uid = f"UCC-{n:03d}"
        unit = ctx.catalog_units.get(uid)
        if unit is None:
            rep.add("C02", "range_unit_missing", CATALOG, unit=uid)
            continue
        for token in as_list(unit.data.get("preserved_exact_tokens")):
            if isinstance(token, str) and CONCRETE_RE.fullmatch(token):
                token_units[token].add(uid)
        for key in ("compatibility_only_notes", "stale_retired_dispositions"):
            for entry in as_list(unit.data.get(key)):
                for token in marked_tokens(str(entry)):
                    marked[token].add(f"{uid}.{key}")

    # Non-definition tokens and their canon evidence (C04 map side).
    for entry in as_list(mp.get("non_definition_tokens")):
        if not isinstance(entry, dict) or not entry.get("token"):
            rep.add("C04", "map_non_definition_malformed", CATALOG, unit=MAP_UNIT, detail=json.dumps(entry, sort_keys=True))
            continue
        token = str(entry["token"])
        if token in ctx.non_def:
            rep.add("C04", "map_non_definition_duplicate", CATALOG, unit=MAP_UNIT, command_id=token)
        ctx.non_def[token] = entry
        if entry.get("disposition") not in NON_DEFINITION_DISPOSITIONS:
            rep.add("C04", "map_non_definition_disposition_invalid", CATALOG, unit=MAP_UNIT, command_id=token,
                    detail=str(entry.get("disposition")))
        evidence = entry.get("evidence")
        if not isinstance(evidence, dict) or not evidence.get("doc") or not evidence.get("quote"):
            rep.add("C04", "map_non_definition_evidence_missing", CATALOG, unit=MAP_UNIT, command_id=token)
            continue
        doc, quote = str(evidence["doc"]), normalize_space(str(evidence["quote"]))
        if evidence.get("unit"):
            unit = ctx.corpus.units(doc).get(str(evidence["unit"]))
            haystack = field_text(unit.data.get(str(evidence.get("field", "canonical_text")))) if unit else None
        else:
            haystack = ctx.corpus.text(doc)
        if haystack is None or quote not in normalize_space(haystack):
            rep.add("C04", "map_non_definition_evidence_not_found", CATALOG, unit=MAP_UNIT, command_id=token,
                    detail=f"{doc} {evidence.get('unit', '')} {evidence.get('field', '')}".strip())

    prose_adds: dict[str, set[str]] = defaultdict(set)
    prose_covers: dict[str, set[str]] = defaultdict(set)
    catalog_text = ctx.corpus.text(CATALOG) or ""
    for entry in as_list(mp.get("prose_unit_resolution")):
        if not isinstance(entry, dict) or not in_range(str(entry.get("unit")), *UNIT_RANGE):
            rep.add("C02", "map_prose_entry_malformed", CATALOG, unit=MAP_UNIT, detail=json.dumps(entry, sort_keys=True))
            continue
        uid = str(entry["unit"])
        for cmd in as_list(entry.get("adds")):
            if not re.search(r"(?<![a-z0-9_.])" + re.escape(str(cmd)) + r"(?![a-z0-9_])", catalog_text):
                rep.add("C02", "map_prose_add_not_in_catalog", CATALOG, unit=uid, command_id=cmd)
            prose_adds[str(cmd)].add(uid)
        for cmd in as_list(entry.get("covers")):
            prose_covers[str(cmd)].add(uid)

    candidates = set(token_units) | set(prose_adds)
    ctx.expected = {c for c in candidates if c not in ctx.non_def}
    for cmd in sorted(ctx.expected):
        units = token_units.get(cmd) or prose_adds[cmd]
        ctx.primary[cmd] = min(units, key=lambda u: unit_number(u) or 0)
        ctx.covering[cmd] = set(token_units.get(cmd, set())) | prose_adds.get(cmd, set()) | prose_covers.get(cmd, set())
        for gid, group in ctx.row_groups.items():
            if in_range(ctx.primary[cmd], str(group.get("first")), str(group.get("last"))):
                ctx.group_of[cmd] = gid
    for cmd in sorted(prose_covers):
        if cmd not in ctx.expected:
            rep.add("C02", "map_prose_cover_not_expected", CATALOG, unit=MAP_UNIT, command_id=cmd)
    for cmd in sorted(set(marked) & candidates):
        if cmd not in ctx.non_def:
            rep.add("C04", "marked_token_not_in_non_definition_tokens", CATALOG, unit=MAP_UNIT, command_id=cmd,
                    detail=",".join(sorted(marked[cmd])))
    for cmd in sorted(ctx.expected & ctx.excluded):
        rep.add("C04", "excluded_production_token_expected", CATALOG, unit=MAP_UNIT, command_id=cmd)
    for cmd in sorted(ctx.contested):
        if cmd not in ctx.expected:
            rep.add("C02", "map_contested_not_expected", CATALOG, unit=MAP_UNIT, command_id=cmd)
    for (cmd, _field) in sorted(ctx.exemptions):
        if cmd not in ctx.expected:
            rep.add("C07", "map_identity_exemption_not_expected", CATALOG, unit=MAP_UNIT, command_id=cmd)
    for cmd in sorted(ctx.pre_attempt[1]):
        if cmd not in ctx.expected:
            rep.add("C07", "map_pre_attempt_command_not_expected", CATALOG, unit=MAP_UNIT, command_id=cmd)
    for cmd in sorted(ctx.expected):
        if route_for(ctx, cmd) is None:
            rep.add("C03", "map_unrouted_command", CATALOG, unit=MAP_UNIT, command_id=cmd)
        kinds = {k for k, _ in ctx.catalog_kinds.get(cmd, set())}
        if len(kinds) > 1:
            rep.add("C12", "catalog_states_conflicting_kinds", CATALOG, command_id=cmd, detail=",".join(sorted(kinds)))


def route_for(ctx: Context, cmd: str) -> str | None:
    if cmd in ctx.exceptions:
        return ctx.exceptions[cmd]
    group = ctx.group_of.get(cmd)
    best: tuple[int, str] | None = None
    for route in ctx.routes:
        if route["row_group"] == group and cmd.startswith(route["prefix"]):
            candidate = (len(route["prefix"]), route["unit"])
            if best is None or candidate[0] > best[0]:
                best = candidate
    return best[1] if best else None


# ---- field specs


def resolve_ref(ctx: Context, ref: Any, results: dict[str, Any]) -> bool:
    if not isinstance(ref, str):
        return False
    if ref in PRIMITIVE_REFS:
        return True
    local = LOCAL_REF_RE.match(ref)
    if local:
        return local.group(1) in results
    json_ref = JSON_DEF_REF_RE.match(ref)
    if json_ref:
        document = ctx.corpus.json(json_ref.group(1))
        return isinstance(document, dict) and isinstance(document.get("$defs"), dict) and json_ref.group(2) in document["$defs"]
    doc_ref = DOC_UNIT_REF_RE.match(ref)
    if doc_ref:
        return doc_ref.group(2) in ctx.corpus.units(doc_ref.group(1))
    return False


CONSTRAINT_NUMBER_KEYS = ("minimum", "maximum")
CONSTRAINT_COUNT_KEYS = ("min_length", "max_length", "min_items", "max_items")
# Which side each bound constrains: a local value may move a "high" bound only down and a "low"
# bound only up (DESIGN 4.3 narrowing); any other move widens the inherited constraint.
BOUND_DIRECTIONS = {
    "minimum": "low", "min_length": "low", "min_items": "low",
    "maximum": "high", "max_length": "high", "max_items": "high",
}


def constraint_value_ok(key: str, value: Any) -> bool:
    """A constraint value is well-formed enough to apply: numeric bounds are finite numbers,
    lengths and counts are non-negative integers, booleans are booleans, and a pattern compiles."""
    if key in CONSTRAINT_NUMBER_KEYS:
        if isinstance(value, bool) or not isinstance(value, (int, float)):
            return False
        # An int is always finite (and may exceed float range, which math.isfinite cannot take);
        # a float bound must be finite: NaN and infinity are never usable bounds.
        return not isinstance(value, float) or math.isfinite(value)
    if key in CONSTRAINT_COUNT_KEYS:
        return isinstance(value, int) and not isinstance(value, bool) and value >= 0
    if key == "unique_items":
        return isinstance(value, bool)
    if key == "pattern":
        if not isinstance(value, str):
            return False
        try:
            re.compile(value)
        except Exception:  # noqa: BLE001 - re.error, OverflowError, RecursionError, MemoryError, ...
            return False
        return True
    return True


# Literal defaults of these types are refused outright (DL-333 coordinator resolution 11): the
# owners (webfetch for URLs, FileSafe for paths, RFC 3339 consumers for timestamps) validate their
# syntax at run time, and no definition may carry one until an owner that needs it adds its
# validation here. Failing closed means no invalid literal can pass.
LITERAL_DEFAULT_FORBIDDEN_TYPES = ("timestamp", "url", "path")


def forbidden_literal_type(spec: dict[str, Any], value: Any) -> str | None:
    """The forbidden type a literal default would carry, looking through list items and object
    children the literal supplies; None when it carries none."""
    kind = spec.get("type") if isinstance(spec, dict) else None
    if kind in LITERAL_DEFAULT_FORBIDDEN_TYPES:
        return kind
    if kind == "list" and isinstance(value, list) and isinstance(spec.get("item"), dict):
        for item in value:
            found = forbidden_literal_type(spec["item"], item)
            if found:
                return found
    if kind == "object" and isinstance(value, dict) and isinstance(spec.get("fields"), dict):
        for child, child_value in value.items():
            if isinstance(spec["fields"].get(child), dict):
                found = forbidden_literal_type(spec["fields"][child], child_value)
                if found:
                    return found
    return None


def merged_constraints(spec: dict[str, Any], inherited: dict[str, Any] | None) -> dict[str, Any]:
    """Inherited and local constraints applied conjunctively (DESIGN 4.3: a local constraint may
    narrow an inherited common-field constraint but never widen or replace it): the effective
    maximum is the smaller bound, the effective minimum the larger one, and the same for lengths
    and counts; every applicable pattern must match; uniqueness demanded by either binds.
    Malformed values are dropped here (C05 reports them), so no invalid bound is ever applied."""
    base: dict[str, Any] = inherited.get("constraints") if isinstance(inherited, dict) and isinstance(inherited.get("constraints"), dict) else {}
    local: dict[str, Any] = spec.get("constraints") if isinstance(spec.get("constraints"), dict) else {}
    merged: dict[str, Any] = {}
    for key in set(base) | set(local):
        inh, loc = base.get(key), local.get(key)
        if key in BOUND_DIRECTIONS:
            valid = [v for v in (inh, loc) if constraint_value_ok(key, v)]
            if valid:
                merged[key] = min(valid) if BOUND_DIRECTIONS[key] == "high" else max(valid)
        elif key == "unique_items":
            merged[key] = inh is True or loc is True
        elif key == "pattern":
            patterns = [p for p in (inh, loc) if isinstance(p, str)]
            if patterns:
                merged[key] = patterns if len(patterns) > 1 else patterns[0]
        else:
            merged[key] = loc if loc is not None else inh
    return merged


def constraint_widening(spec: dict[str, Any], inherited: dict[str, Any]) -> list[str]:
    """Local bounds looser than the inherited ones: DESIGN 4.3 permits narrowing a common
    optional field's constraints only, so a wider bound is itself a finding."""
    local: dict[str, Any] = spec.get("constraints") if isinstance(spec.get("constraints"), dict) else {}
    base: dict[str, Any] = inherited.get("constraints") if isinstance(inherited.get("constraints"), dict) else {}
    widened = []
    for key, direction in sorted(BOUND_DIRECTIONS.items()):
        if key not in local or key not in base:
            continue
        loc, inh = local[key], base[key]
        if not (constraint_value_ok(key, loc) and constraint_value_ok(key, inh)):
            continue  # invalid values are already C05 findings
        if (direction == "high" and loc > inh) or (direction == "low" and loc < inh):
            widened.append(f"{key}={loc!r} loosens inherited {key}={inh!r}")
    return widened


def literal_ok(spec: dict[str, Any], value: Any, inherited: dict[str, Any] | None = None) -> bool:
    """A literal default is valid against its spec, recursively: list item specs, required
    object children, primitive semantics of DESIGN 4.2, and applicable constraints, applied
    conjunctively with the constraints a common optional field inherits from UCC-230. Malformed
    constraint values are skipped here (C05 reports them), so this never compares against
    invalid bounds."""
    kind = spec.get("type")
    constraints = merged_constraints(spec, inherited)

    def bound(key: str) -> Any | None:
        candidate = constraints.get(key)
        return candidate if constraint_value_ok(key, candidate) else None

    if kind == "enum":
        return value in as_list(spec.get("values"))
    if kind == "const":
        return value == spec.get("value")
    if kind == "boolean":
        return isinstance(value, bool)
    if kind == "integer":
        if not isinstance(value, int) or isinstance(value, bool):
            return False
        minimum, maximum = bound("minimum"), bound("maximum")
        if minimum is not None and value < minimum:
            return False
        if maximum is not None and value > maximum:
            return False
        return True
    if kind in ("string", "id", "ref", "secret_ref", "sha256", "timestamp", "url", "path"):
        if not isinstance(value, str):
            return False
        min_length, max_length = bound("min_length"), bound("max_length")
        if min_length is not None and len(value) < min_length:
            return False
        if max_length is not None and len(value) > max_length:
            return False
        pattern = constraints.get("pattern")
        patterns = pattern if isinstance(pattern, list) else [pattern] if isinstance(pattern, str) else []
        for one in patterns:
            try:
                if re.fullmatch(one, value) is None:
                    return False
            except Exception:  # noqa: BLE001 - malformed pattern: C05 reports it; never raise here
                pass
        if kind == "id":
            # DESIGN 4.2: string, 1..256 characters, no whitespace.
            if not value or len(value) > 256 or re.search(r"\s", value):
                return False
        elif kind == "ref":
            # DESIGN 4.2: string, 1..256 characters.
            if not value or len(value) > 256:
                return False
        elif kind == "sha256":
            if re.fullmatch(r"[0-9a-f]{64}", value) is None:
                return False
        elif kind in LITERAL_DEFAULT_FORBIDDEN_TYPES:
            return False  # never a valid literal (resolution 11); C06 literal_default_not_allowed says why
        return True
    if kind == "list":
        if not isinstance(value, list):
            return False
        min_items, max_items = bound("min_items"), bound("max_items")
        if min_items is not None and len(value) < min_items:
            return False
        if max_items is not None and len(value) > max_items:
            return False
        if constraints.get("unique_items") is True:
            fingerprints = [json.dumps(entry, sort_keys=True, default=str) for entry in value]
            if len(set(fingerprints)) != len(fingerprints):
                return False
        item_spec = spec.get("item")
        if isinstance(item_spec, dict):
            return all(literal_ok(item_spec, entry) for entry in value)
        return True
    if kind == "object":
        if not isinstance(value, dict):
            return False
        fields = spec.get("fields")
        if isinstance(fields, dict):
            for child_name, child_spec in fields.items():
                if isinstance(child_spec, dict) and child_spec.get("required") is True and child_name not in value:
                    return False
            for child_name, child_value in value.items():
                child_spec = fields.get(child_name)
                if not isinstance(child_spec, dict) or not literal_ok(child_spec, child_value):
                    return False
        return True
    return False


def check_type_spec(ctx: Context, spec: Any, where: dict[str, str], name: str, results: dict[str, Any], *, item: bool, siblings: set[str]) -> None:
    rep = ctx.report
    if not isinstance(spec, dict):
        rep.add("C05", "field_spec_not_mapping", field=name, **where)
        return
    allowed = ITEM_KEYS if item else FIELD_KEYS
    for key in sorted(set(spec) - allowed):
        rep.add("C05", "item_has_field_only_key" if item and key in FIELD_KEYS else "unknown_field_key", field=name, detail=key, **where)
    kind = spec.get("type")
    if kind not in TYPE_VOCABULARY:
        rep.add("C05", "type_not_in_vocabulary", field=name, detail=str(kind), **where)
    elif kind == "enum":
        values = spec.get("values")
        if not isinstance(values, list) or not values:
            rep.add("C05", "enum_without_values", field=name, **where)
        elif len(set(map(str, values))) != len(values) or not all(isinstance(v, str) and SNAKE_RE.match(v) for v in values):
            rep.add("C05", "enum_values_not_unique_snake_case", field=name, **where)
    elif kind == "const":
        if "value" not in spec:
            rep.add("C05", "const_without_value", field=name, **where)
    elif kind == "list":
        if "item" not in spec:
            rep.add("C05", "list_without_item", field=name, **where)
        else:
            check_type_spec(ctx, spec["item"], where, f"{name}[]", results, item=True, siblings=set())
    elif kind == "object":
        fields = spec.get("fields")
        if not isinstance(fields, dict) or not fields:
            rep.add("C05", "object_without_fields", field=name, **where)
        else:
            check_fields(ctx, fields, where, results, prefix=f"{name}.")
    elif kind == "contract":
        if not resolve_ref(ctx, spec.get("ref"), results):
            rep.add("C05", "contract_ref_unresolved", field=name, detail=str(spec.get("ref")), **where)
    constraints = spec.get("constraints")
    if constraints is not None:
        if not isinstance(constraints, dict):
            rep.add("C05", "constraints_not_mapping", field=name, **where)
        else:
            for key in sorted(set(constraints) - set(CONSTRAINT_KEYS)):
                rep.add("C05", "unknown_constraint_key", field=name, detail=key, **where)
            for key in sorted(set(constraints) & set(CONSTRAINT_KEYS)):
                if not constraint_value_ok(key, constraints[key]):
                    rep.add("C05", "constraint_value_invalid", field=name, detail=f"{key}={constraints[key]!r}", **where)
            # Bound sanity: an inverted range (lower bound above the upper one) is unusable.
            for low_key, high_key in (("minimum", "maximum"), ("min_length", "max_length"), ("min_items", "max_items")):
                low, high = constraints.get(low_key), constraints.get(high_key)
                if constraint_value_ok(low_key, low) and constraint_value_ok(high_key, high) and low > high:
                    rep.add("C05", "constraint_value_invalid", field=name,
                            detail=f"{low_key}={low!r} above {high_key}={high!r}", **where)
    if not item:
        for key in CONDITIONAL_KEYS:
            if key not in spec:
                continue
            cond = spec[key]
            if not isinstance(cond, dict) or set(cond) != {"field", "in"} or not isinstance(cond.get("in"), list) or not cond["in"]:
                rep.add("C05", "conditional_malformed", field=name, detail=key, **where)
            elif str(cond["field"]) not in siblings or str(cond["field"]) == name.rsplit(".", 1)[-1]:
                rep.add("C05", "conditional_field_unknown", field=name, detail=f"{key}.field={cond['field']}", **where)


def check_fields(ctx: Context, fields: dict[str, Any], where: dict[str, str], results: dict[str, Any], *, prefix: str = "",
                 inherited_common: bool = False) -> None:
    rep = ctx.report
    siblings = {str(k) for k in fields}
    for raw_name in sorted(fields, key=str):
        name = f"{prefix}{raw_name}"
        spec = fields[raw_name]
        check_type_spec(ctx, spec, where, name, results, item=False, siblings=siblings)
        if not isinstance(spec, dict):
            continue
        # A restated common optional field keeps the constraints UCC-230 gives it and may only
        # narrow them (DESIGN 4.3): a local bound looser than the inherited one is itself a finding.
        inherited = ctx.common_optional.get(str(raw_name)) if inherited_common and not prefix else None
        if isinstance(inherited, dict):
            widened = constraint_widening(spec, inherited)
            if widened:
                rep.add("C05", "constraint_widens_inherited", field=name, detail="; ".join(widened), **where)
            # Effective range sanity across inheritance, whether or not a default is present: the
            # conjunction of inherited and local bounds must leave a usable range.
            effective = merged_constraints(spec, inherited)
            local = spec.get("constraints") if isinstance(spec.get("constraints"), dict) else {}
            for low_key, high_key in (("minimum", "maximum"), ("min_length", "max_length"), ("min_items", "max_items")):
                low, high = effective.get(low_key), effective.get(high_key)
                local_inverted = (constraint_value_ok(low_key, local.get(low_key)) and constraint_value_ok(high_key, local.get(high_key))
                                  and local[low_key] > local[high_key])
                if low is not None and high is not None and low > high and not local_inverted:
                    rep.add("C05", "constraint_value_invalid", field=name,
                            detail=f"effective {low_key}={low!r} above inherited-or-local {high_key}={high!r}", **where)
        # C06 defaults
        if not isinstance(spec.get("required"), bool):
            rep.add("C06", "required_missing_or_not_boolean", field=name, **where)
        if "default" not in spec:
            rep.add("C06", "default_missing", field=name, **where)
        else:
            default = spec["default"]
            if spec.get("required") is True and default != "none":
                rep.add("C06", "required_field_has_literal_default", field=name, detail=repr(default), **where)
            elif default != "none" and spec.get("type") in TYPE_VOCABULARY:
                forbidden = forbidden_literal_type(spec, default)
                if forbidden:
                    rep.add("C06", "literal_default_not_allowed", field=name,
                            detail=f"type {forbidden} takes default none (DL-333 resolution 11)", **where)
                elif not literal_ok(spec, default, inherited):
                    rep.add("C06", "literal_default_type_mismatch", field=name, detail=repr(default), **where)
        # C11 provenance
        provenance = spec.get("provenance")
        if provenance == "canon":
            if not isinstance(spec.get("source"), str) or not spec["source"].strip():
                rep.add("C11", "canon_without_source", field=name, **where)
        elif provenance == "gap":
            if not isinstance(spec.get("gap_note"), str) or not spec["gap_note"].strip():
                rep.add("C11", "gap_without_gap_note", field=name, **where)
            else:
                ctx.gap_fields[where["path"]] = ctx.gap_fields.get(where["path"], 0) + 1
        else:
            rep.add("C11", "provenance_missing", field=name, detail=str(provenance), **where)


def same_type(spec: dict[str, Any], canonical: dict[str, Any]) -> bool:
    if spec.get("type") != canonical.get("type"):
        return False
    if canonical.get("type") == "contract":
        return spec.get("ref") == canonical.get("ref")
    if canonical.get("type") == "list":
        item, c_item = spec.get("item"), canonical.get("item")
        return isinstance(item, dict) and isinstance(c_item, dict) and same_type(item, c_item)
    return True


# ---- definitions


def check_definition(ctx: Context, block: Block, owner_unit: str, definition: Any, results: dict[str, Any],
                     defined: dict[str, list[tuple[str, str]]]) -> None:
    rep = ctx.report
    base = {"path": block.path, "unit": owner_unit}
    if not isinstance(definition, dict) or not isinstance(definition.get("command_id"), str):
        rep.add("C14", "definition_malformed", **base)
        return
    cmd = definition["command_id"]
    where = {**base, "command_id": cmd}
    defined[cmd].append((block.path, owner_unit))
    for key in sorted(set(definition) - DEFINITION_KEYS):
        rep.add("C14", "definition_unknown_key", detail=key, **where)
    for key in sorted(REQUIRED_DEFINITION_KEYS - set(definition)):
        rep.add("C14", "definition_missing_key", detail=key, **where)

    # C04 no definitions for non-definition, excluded or contested tokens.
    if cmd in ctx.non_def:
        rep.add("C04", "definition_for_non_definition_token", detail=str(ctx.non_def[cmd].get("disposition")), **where)
    if cmd in ctx.excluded:
        rep.add("C04", "definition_for_excluded_production_token", **where)
    if cmd in ctx.contested:
        rep.add("C04", "definition_for_contested_command", detail=str(ctx.contested[cmd].get("question_id")), **where)
    for alias in as_list(definition.get("aliases")):
        if not isinstance(alias, dict) or not alias.get("command_id"):
            rep.add("C04", "alias_entry_malformed", **where)
            continue
        token = str(alias["command_id"])
        entry = ctx.non_def.get(token)
        if entry is None:
            rep.add("C04", "alias_not_a_non_definition_token", detail=token, **where)
            continue
        if entry.get("disposition") not in ALIAS_KINDS + ("superseded_alias",):
            rep.add("C04", "alias_token_is_not_an_alias", detail=f"{token}={entry.get('disposition')}", **where)
        if alias.get("kind") not in ALIAS_KINDS or (entry.get("disposition") in ALIAS_KINDS and alias.get("kind") != entry.get("disposition")):
            rep.add("C04", "alias_kind_mismatch", detail=f"{token}: {alias.get('kind')} vs {entry.get('disposition')}", **where)
        targets = as_list(entry.get("targets"))
        if targets and cmd not in targets:
            rep.add("C04", "alias_target_mismatch", detail=f"{token} -> {targets}", **where)
        if not isinstance(alias.get("source"), str) or not alias["source"].strip():
            rep.add("C04", "alias_without_source", detail=token, **where)

    # C03 placement and coverage.
    if cmd in ctx.expected:
        unit_ids = as_list(definition.get("ucc_units"))
        if not unit_ids or str(unit_ids[0]) != ctx.primary[cmd] or {str(u) for u in unit_ids} != ctx.covering[cmd] or len(unit_ids) != len(set(map(str, unit_ids))):
            rep.add("C03", "ucc_units_mismatch", detail=f"expected primary {ctx.primary[cmd]} then {sorted(ctx.covering[cmd] - {ctx.primary[cmd]})}; got {unit_ids}", **where)
        target = route_for(ctx, cmd)
        if target is not None and (target != owner_unit or ctx.owner_units.get(target) != block.path):
            rep.add("C03", "definition_in_wrong_owner", detail=f"routed to {target} in {ctx.owner_units.get(target)}", **where)

    kind = definition.get("command_kind")
    response_kind = definition.get("response_kind")
    args = definition.get("args")
    group_id = ctx.group_of.get(cmd)
    if kind not in COMMAND_KINDS:
        rep.add("C12", "command_kind_invalid", detail=str(kind), **where)
    else:
        stated = {k for k, _ in ctx.catalog_kinds.get(cmd, set())}
        if len(stated) == 1 and kind not in stated:
            line = min(n for _, n in ctx.catalog_kinds[cmd])
            rep.add("C12", "command_kind_differs_from_catalog", detail=f"catalog {sorted(stated)[0]} at {CATALOG}:{line}", **where)

    # C05/C06/C11 field specs; C07 identity; C08 envelope.
    if not isinstance(args, dict):
        rep.add("C14", "args_not_mapping", **where)
        args = {}
    check_fields(ctx, args, where, results, inherited_common=True)
    for name in sorted(set(map(str, args)) & ctx.envelope_required):
        rep.add("C08", "envelope_field_restated", field=name, **where)
    for name in sorted(set(map(str, args)) & set(ctx.common_optional)):
        spec, canonical = args[name], ctx.common_optional[name]
        if isinstance(spec, dict) and isinstance(canonical, dict) and not same_type(spec, canonical):
            rep.add("C08", "common_field_type_changed", field=name, detail=f"canonical {canonical.get('type')}", **where)

    exemptions_here: set[str] = set()
    for entry in as_list(definition.get("identity_exemptions")):
        if not isinstance(entry, dict) or not entry.get("field") or not DL_RE.match(str(entry.get("decision", ""))):
            rep.add("C07", "identity_exemption_malformed", **where)
            continue
        recorded = ctx.exemptions.get((cmd, str(entry["field"])))
        if recorded is None or recorded != str(entry["decision"]):
            rep.add("C07", "identity_exemption_not_recorded_in_map", field=entry["field"], detail=str(entry["decision"]), **where)
            continue
        exemptions_here.add(str(entry["field"]))
    group = ctx.row_groups.get(group_id or "")
    if group is not None:
        for entry in group["required_identity"]:
            name = str(entry.get("field"))
            if entry.get("when") == "domain_action" and kind != "domain_action":
                continue
            if name in exemptions_here:
                continue
            spec = args.get(name)
            if not isinstance(spec, dict) or spec.get("required") is not True:
                rep.add("C07", "required_identity_missing", field=name, detail=f"{group_id} when={entry.get('when')}", **where)
        identity = {str(e.get("field")) for e in group["required_identity"]} | {str(x) for x in as_list(group.get("optional_identity"))}
        for name in sorted(identity & set(map(str, args))):
            spec = args[name]
            if name in ctx.common_optional or not isinstance(spec, dict):
                continue
            if name.endswith("_id") and spec.get("type") != "id":
                rep.add("C07", "identity_field_type_not_id", field=name, **where)
            if name.endswith("_ref") and spec.get("type") != "ref":
                rep.add("C07", "identity_field_type_not_ref", field=name, **where)
    pre_field, pre_commands = ctx.pre_attempt
    if cmd in pre_commands and isinstance(args.get(pre_field), dict) and args[pre_field].get("required") is True:
        rep.add("C07", "pre_attempt_field_required", field=pre_field, **where)

    # C09 narrowing.
    errors = definition.get("error_codes")
    disabled = definition.get("disabled_reason_codes")
    if not isinstance(errors, list) or not errors:
        rep.add("C09", "error_codes_empty", **where)
        errors = []
    if not isinstance(disabled, list) or not disabled:
        rep.add("C09", "disabled_reason_codes_empty", **where)
        disabled = []
    for code in sorted(set(map(str, errors)) - ctx.error_set):
        rep.add("C09", "error_code_outside_closed_set", detail=code, **where)
    if "unknown_command" in errors:
        rep.add("C09", "unknown_command_listed", **where)
    for code in sorted(set(map(str, disabled)) - ctx.disabled_set):
        rep.add("C09", "disabled_reason_outside_closed_set", detail=code, **where)
    if len(set(map(str, errors))) != len(errors) or len(set(map(str, disabled))) != len(disabled):
        rep.add("C09", "duplicate_code", **where)
    note = definition.get("narrowing_gap_note")
    note_usable = isinstance(note, str) and bool(note.strip())
    if not note_usable:
        # Only a nonblank string honours the exemption; a boolean, number or blank string is
        # itself a finding, and the minimum error-code check still applies.
        if "narrowing_gap_note" in definition:
            rep.add("C09", "narrowing_gap_note_malformed", detail=repr(note), **where)
        required_codes = set(ERROR_NARROWING["always"])
        if kind == "domain_action" or "stale_projection" in disabled:
            required_codes.add("stale_projection")
        if "blocked_state_required" in disabled or group_id == RUNTIME_GROUP:
            required_codes.add("blocked_state_required")
        if kind == "navigation_wrapper" or any(name in args for name in ROUTE_ARGS):
            required_codes.add("invalid_route")
        for code in sorted(required_codes - set(map(str, errors))):
            rep.add("C09", "narrowing_rule_code_missing", detail=code, **where)

    # C10 result.
    result = definition.get("result")
    if response_kind not in RESPONSE_KINDS:
        rep.add("C10", "response_kind_invalid", detail=str(response_kind), **where)
    if not isinstance(result, dict):
        rep.add("C10", "result_not_mapping", **where)
    else:
        if result.get("response") != RESPONSE_SCHEMA:
            rep.add("C10", "result_response_not_cv333", detail=str(result.get("response")), **where)
        for key in sorted(set(result) - {"response", "owner_result"}):
            rep.add("C10", "result_unknown_key", detail=key, **where)
        owner_result = result.get("owner_result")
        if owner_result == "none":
            if response_kind != "local_projection":
                rep.add("C10", "owner_result_none_on_owner_operation", **where)
            else:
                # DESIGN 4.4 reserves local_projection for route/open or view state without an
                # owner result, and CV-333 fixes the response kind by the actual owner contract,
                # never chosen to evade durable dispatch: a domain_action — whether its kind is
                # stated by the definition itself or by a catalog kind cell (most catalogued
                # commands have none) — or a command whose owner_request names an owner operation
                # cannot be a local-only projection.
                catalogued = {k for k, _ in ctx.catalog_kinds.get(cmd, set())}
                owner_request = definition.get("owner_request")
                reasons = []
                if kind == "domain_action":
                    reasons.append(f"definition command_kind {kind}")
                if catalogued == {"domain_action"}:
                    reasons.append(f"catalog command_kind {sorted(catalogued)[0]}")
                if owner_request is not None and owner_request != "none":
                    reasons.append(f"owner_request {owner_request}")
                if reasons:
                    rep.add("C10", "local_projection_ineligible", detail="; ".join(reasons), **where)
        else:
            if response_kind == "local_projection":
                rep.add("C10", "local_projection_with_owner_result", detail=str(owner_result), **where)
            if not resolve_ref(ctx, owner_result, results):
                rep.add("C10", "owner_result_unresolved", detail=str(owner_result), **where)

    # owner_request resolves (C05) and agrees with wiring (C13 warning).
    owner_request = definition.get("owner_request")
    if owner_request != "none":
        if not resolve_ref(ctx, owner_request, results):
            rep.add("C05", "owner_request_unresolved", detail=str(owner_request), **where)
        wired = ctx.wiring_requests.get(cmd, set())
        if wired and owner_request not in wired:
            rep.add("C13", "owner_request_differs_from_wiring", detail=f"wiring {sorted(wired)}", **where)


def check_blocks(ctx: Context) -> dict[str, list[tuple[str, str]]]:
    rep = ctx.report
    defined: dict[str, list[tuple[str, str]]] = defaultdict(list)
    seen_owner_units: dict[str, str] = {}
    for doc in ctx.corpus.top_level_docs():
        text = ctx.corpus.text(doc)
        if text is None:
            continue
        # No textual prefilter: a quoted, escaped or spaced root key is found only by reading the
        # YAML of every fence (Sol r5).
        for block in find_blocks(text, doc):
            base = {"path": doc}
            if block.error is not None:
                rep.add("C14", "block_yaml_error", detail=f"line {block.line}: {block.error}", **base)
                continue
            if "plan_unit_id:" in block.text:
                rep.add("C14", "block_contains_plan_unit_id", detail=f"line {block.line}", **base)
            if not isinstance(block.data, dict) or set(block.data) != {"command_payload_definitions"} or not isinstance(block.data["command_payload_definitions"], dict):
                rep.add("C14", "block_top_level_malformed", detail=f"line {block.line}", **base)
                continue
            body = block.data["command_payload_definitions"]
            owner_unit = str(body.get("owner_unit", ""))
            base["unit"] = owner_unit
            for key in sorted(set(body) - BLOCK_KEYS):
                rep.add("C14", "block_unknown_key", detail=key, **base)
            if body.get("format") != FORMAT:
                rep.add("C14", "block_format", detail=str(body.get("format")), **base)
            if body.get("overlay") != OVERLAY_REF:
                rep.add("C14", "block_overlay_ref", detail=str(body.get("overlay")), **base)
            # C03 owner unit.
            units = ctx.corpus.units(doc)
            unit = units.get(owner_unit)
            if owner_unit in seen_owner_units:
                rep.add("C03", "second_block_for_owner_unit", detail=seen_owner_units[owner_unit], **base)
            seen_owner_units[owner_unit] = f"{doc}:{block.line}"
            if owner_unit not in ctx.owner_units:
                rep.add("C03", "owner_unit_not_in_map", **base)
            elif ctx.owner_units[owner_unit] != doc:
                rep.add("C03", "owner_unit_mapped_to_other_doc", detail=ctx.owner_units[owner_unit], **base)
            tokens: set[str] = set()
            if unit is None:
                rep.add("C03", "owner_unit_not_found_in_doc", **base)
            else:
                if unit.data.get("unit_type") != "command_contract":
                    rep.add("C03", "owner_unit_not_command_contract", detail=str(unit.data.get("unit_type")), **base)
                if unit.data.get("owner_doc") != doc:
                    rep.add("C03", "owner_unit_owner_doc_mismatch", detail=str(unit.data.get("owner_doc")), **base)
                # UCC-230 requires the block directly after the owner unit fence: a block that
                # starts before the owner ends is misplaced even though the slice between them
                # is empty.
                if block.start < unit.end or text[unit.end:block.start].strip():
                    rep.add("C03", "block_not_directly_after_owner_unit", detail=f"line {block.line}", **base)
                tokens = {str(t) for t in as_list(unit.data.get("preserved_exact_tokens"))}
            results = body.get("results") or {}
            if not isinstance(results, dict):
                rep.add("C14", "results_not_mapping", **base)
                results = {}
            for name in sorted(results, key=str):
                spec = results[name]
                where = {**base, "command_id": f"local:{name}"}
                if not isinstance(spec, dict) or set(spec) != {"fields"} or not isinstance(spec["fields"], dict) or not spec["fields"]:
                    rep.add("C05", "result_definition_malformed", **where)
                    continue
                check_fields(ctx, spec["fields"], where, results)
            definitions = body.get("definitions")
            if not isinstance(definitions, list):
                rep.add("C14", "definitions_not_list", **base)
                continue
            for definition in definitions:
                try:
                    check_definition(ctx, block, owner_unit, definition, results, defined)
                except ParseError:
                    raise
                except Exception as exc:  # noqa: BLE001 - a deterministic finding, never a traceback
                    cmd = definition.get("command_id") if isinstance(definition, dict) else None
                    rep.add("C00", "internal_error", doc, command_id=str(cmd) if cmd else "", unit=owner_unit,
                            detail=internal_detail("check_definition", exc))
                if isinstance(definition, dict) and isinstance(definition.get("command_id"), str) and unit is not None:
                    if definition["command_id"] not in tokens:
                        rep.add("C03", "command_not_in_owner_unit_preserved_exact_tokens", command_id=definition["command_id"], **base)
    return defined


def internal_detail(check: str, exc: BaseException) -> str:
    """A deterministic one-line description of an unexpected exception inside a check."""
    return f"{check}: {type(exc).__name__}: {' '.join(str(exc).split())}"


def run_check(corpus: Corpus) -> dict[str, Any]:
    report = Report()
    ctx = load_context(corpus, report)
    for phase in (check_map, compute_expected):
        try:
            phase(ctx)
        except ParseError:
            raise
        except Exception as exc:  # noqa: BLE001 - a deterministic finding, never a traceback
            report.add("C00", "internal_error", CATALOG, detail=internal_detail(phase.__name__, exc))
    defined: dict[str, list[tuple[str, str]]] = {}
    try:
        defined = check_blocks(ctx)
    except ParseError:
        raise
    except Exception as exc:  # noqa: BLE001 - a deterministic finding, never a traceback
        report.add("C00", "internal_error", "", detail=internal_detail("check_blocks", exc))

    # C02 coverage.
    missing_by_unit: dict[str, int] = defaultdict(int)
    try:
        for cmd in sorted(ctx.expected):
            places = defined.get(cmd, [])
            target = route_for(ctx, cmd)
            doc = ctx.owner_units.get(target or "", "")
            if not places:
                if cmd in ctx.contested:
                    continue
                missing_by_unit[target or "unrouted"] += 1
                report.add("C02", "missing_definition", doc or CATALOG, command_id=cmd, unit=target or "")
            elif len(places) > 1:
                report.add("C02", "duplicate_definition", CATALOG, command_id=cmd,
                           detail="; ".join(f"{p}#{u}" for p, u in sorted(places)))
        for cmd in sorted(defined):
            if cmd not in ctx.expected and cmd not in ctx.non_def and cmd not in ctx.excluded:
                report.add("C02", "unexpected_definition", defined[cmd][0][0], command_id=cmd, unit=defined[cmd][0][1])
    except Exception as exc:  # noqa: BLE001 - a deterministic finding, never a traceback
        report.add("C00", "internal_error", CATALOG, detail=internal_detail("coverage", exc))

    findings = sorted(report.findings, key=Finding.sort_key)
    errors = [f.as_dict() for f in findings if f.code not in WARNING_CODES]
    warnings = [f.as_dict() for f in findings if f.code in WARNING_CODES]
    by_code: dict[str, int] = defaultdict(int)
    for f in findings:
        by_code[CODE_NAMES[f.code]] += 1
    contested = [
        {
            "command_id": cmd,
            "question_id": str(entry.get("question_id")),
            "reason": str(entry.get("reason")),
            "defined": cmd in defined,
        }
        for cmd, entry in sorted(ctx.contested.items())
    ]
    return {
        "check": "command-payload-defs",
        "format": FORMAT,
        "status": "fail" if errors else "pass",
        "counts": {
            "expected_commands": len(ctx.expected),
            "defined_expected_commands": len([c for c in ctx.expected if c in defined]),
            "missing_definitions": sum(missing_by_unit.values()),
            "contested_commands": len(ctx.contested),
            "non_definition_tokens": len(ctx.non_def),
            "owner_units": len(ctx.owner_units),
            "gap_fields": sum(ctx.gap_fields.values()),
            "errors": len(errors),
            "warnings": len(warnings),
        },
        "findings_by_code": dict(sorted(by_code.items())),
        "missing_by_owner_unit": dict(sorted(missing_by_unit.items())),
        "gap_fields_by_doc": dict(sorted(ctx.gap_fields.items())),
        "contested": contested,
        "errors": errors,
        "warnings": warnings,
    }


def render_text(result: dict[str, Any]) -> str:
    counts = result["counts"]
    lines = [
        f"command-payload-defs: {result['status']}",
        "expected {expected_commands}; defined {defined_expected_commands}; missing {missing_definitions}; "
        "contested {contested_commands}; non-definition tokens {non_definition_tokens}; owner units {owner_units}; "
        "gap fields {gap_fields}; errors {errors}; warnings {warnings}".format(**counts),
        "findings by code: " + (", ".join(f"{k}={v}" for k, v in result["findings_by_code"].items()) or "none"),
        "missing by owner unit: " + (", ".join(f"{k}={v}" for k, v in result["missing_by_owner_unit"].items()) or "none"),
        "gap fields by doc: " + (", ".join(f"{k}={v}" for k, v in result["gap_fields_by_doc"].items()) or "none"),
    ]
    lines.append("contested:" + ("" if result["contested"] else " none"))
    for entry in result["contested"]:
        lines.append(f"  {entry['command_id']} {entry['question_id']} defined={str(entry['defined']).lower()}: {entry['reason']}")
    for title, rows in (("errors", result["errors"]), ("warnings", result["warnings"])):
        lines.append(f"{title}:" + ("" if rows else " none"))
        for row in rows:
            extra = " ".join(f"{k}={row[k]}" for k in ("command_id", "unit", "field", "detail") if k in row)
            lines.append(f"  {row['code']} {row['kind']} {row['path']} {extra}".rstrip())
    return "\n".join(lines)


# --------------------------------------------------------------------------------------------
# Self-test fixtures (in memory; no repository reads)

ROW_GROUPS = [
    ("UCC-049", "UCC-053", [("capability_snapshot_ref", "domain_action")], ["container_ref", "image_ref", "compose_project_ref", "kubernetes_context", "namespace"]),
    ("UCC-054", "UCC-055", [("repo_id", "always"), ("worktree_lifecycle_state", "domain_action")], ["worktree_id", "branch_ref", "safe_point_id"]),
    ("UCC-056", "UCC-060", [("thread_id", "always")], ["message_id", "context_lens_mode", "worktree_id", "usage_detail_ref", "context_projection_ref"]),
    ("UCC-061", "UCC-065", [], ["browser_session_id", "preview_subject_ref", "selection_ref", "screenshot_ref", "agent_share_scope"]),
    ("UCC-066", "UCC-072", [], ["terminal_session_id", "pane_id", "dev_session_id", "command_ref", "layout_target"]),
    ("UCC-073", "UCC-076", [("thread_id", "always")], ["message_id", "code_block_id", "checkpoint_ref", "activity_dimension"]),
    ("UCC-077", "UCC-083", [("thread_id", "always")], ["debug_session_id", "web_operation_id", "slash_command_id", "route_target", "provider_route_ref"]),
    ("UCC-084", "UCC-088", [], ["memory_item_id", "artifact_id", "ledger_ref", "query_session_id", "replacement", "index_scope"]),
    ("UCC-089", "UCC-095", [("run_id", "always"), ("blocked_sequence", "always"), ("allowed_action_id", "always")], ["node_id", "attempt_id", "safe_point_id", "baseline_ref", "permission_carry_ref"]),
    ("UCC-096", "UCC-100", [], ["goal_id", "thread_id", "planning_session_id", "plan_pack_ref", "plan_compile_run_id", "history_query_ref", "target_identity_ref"]),
    ("UCC-101", "UCC-105", [], ["image_ref", "teach_session_id", "notification_destination_id", "sound_asset_id", "settings_key", "host_capability_ref", "host_profile_id"]),
]
COMMON_OPTIONAL_TYPES: dict[str, dict[str, Any]] = {
    "route_target": {"type": "contract", "ref": "Primitive:RouteTarget"},
    "OpenSubject": {"type": "contract", "ref": "Primitive:OpenSubject"},
    "project_id": {"type": "id"}, "repo_id": {"type": "id"}, "worktree_id": {"type": "id"},
    "run_id": {"type": "id"}, "attempt_id": {"type": "id"}, "node_id": {"type": "id"}, "thread_id": {"type": "id"},
    "usage_event_ref": {"type": "ref"}, "usage_record_id": {"type": "id"}, "provider_attempt_ref": {"type": "ref"},
    "tool_call_id": {"type": "id"}, "trace_ref": {"type": "ref"}, "receipt_ref": {"type": "ref"},
    "receipt_refs": {"type": "list", "item": {"type": "ref"}}, "raw_payload_ref": {"type": "ref"},
    "query_session_id": {"type": "id"}, "selection_ref": {"type": "ref"}, "confirmation_ref": {"type": "ref"},
    "idempotency_key": {"type": "string", "constraints": {"max_length": 256}},
}


def fixture_overlay(error_codes: list[str] | None = None) -> str:
    codes = error_codes or ["invalid_route", "unknown_command", "invalid_args", "permission_denied",
                            "blocked_state_required", "stale_projection", "handler_unavailable", "internal_error"]
    optional = ", ".join(f"`{n}[]?`" if n == "receipt_refs" else f"`{n}?`" for n in COMMON_OPTIONAL_TYPES)
    lines = [
        f"### {OVERLAY_HEADING}",
        "",
        "Common fields for every covered row:",
        "",
        "- `command_id`: every concrete current `cmd.*` token.",
        "- `payload_required`: `dispatch_id`, `command_id`, `source_surface`, `actor_ref`, and the row-specific identity listed below.",
        f"- `payload_optional`: {optional}, and family-specific args defined by the owner-doc definition that UCC-230 names.",
        "- `result_fields`: CV-333.",
        "- `error_codes`: closed to " + ", ".join(f"`{c}`" for c in codes) + "; family owners may narrow.",
        "- `disabled_reason_codes`: closed to " + ", ".join(f"`{c}`" for c in OVERLAY_DISABLED_REASON_CODES) + ".",
        "- `owner_doc_ref`: the owner-doc definition unit that UCC-230 names for the command.",
        "",
        "| Rows | Family owner reference | Row-specific required identity |",
        "|---|---|---|",
    ]
    for first, last, required, optional_names in ROW_GROUPS:
        cell = ", ".join([f"`{n}?`" for n in optional_names] + [f"`{n}`" for n, _ in required])
        tail = "; pre-attempt blocked rows MUST NOT fabricate an `attempt_id`." if first == "UCC-089" else " for the concrete command."
        lines.append(f"| `{first}` through `{last}` | owner | {cell}{tail} |")
    lines.append("| `UCC-106` | Onboarding | Not applicable: `pm.product_onboarding.action_request.v2`. |")
    lines.append("")
    return "\n".join(lines)


def fence(data: Any) -> str:
    return "```yaml\n" + yaml.safe_dump(data, sort_keys=False, width=1000).rstrip("\n") + "\n```\n"


def fixture_map() -> dict[str, Any]:
    return {
        "format": FORMAT,
        "type_vocabulary": list(TYPE_VOCABULARY),
        "literal_default_forbidden_types": list(LITERAL_DEFAULT_FORBIDDEN_TYPES),
        "constraint_keys": list(CONSTRAINT_KEYS),
        "conditional_keys": list(CONDITIONAL_KEYS),
        "error_narrowing": copy.deepcopy(ERROR_NARROWING),
        "envelope": {
            "required_not_restated": ["dispatch_id", "command_id", "source_surface", "actor_ref"],
            "common_optional": copy.deepcopy(COMMON_OPTIONAL_TYPES),
        },
        "row_groups": [
            {"id": f"{a}..{b}", "first": a, "last": b,
             "required_identity": [{"field": n, "when": w} for n, w in req], "optional_identity": list(opt)}
            for a, b, req, opt in ROW_GROUPS
        ],
        "pre_attempt_admissible": {"field": "attempt_id", "commands": ["cmd.runtime.approve", "cmd.runtime.start_fresh_attempt"], "source": "fixture"},
        "owners": {
            "units": {
                "CRAU-115": "Plans/Containers_Registry_and_Unraid.md",
                "CRAU-116": "Plans/Containers_Registry_and_Unraid.md",
                "EP-236": "Plans/Executor_Protocol.md",
                "ACD-637": "Plans/assistant-chat-design.md",
                "ACD-638": "Plans/assistant-chat-design.md",
            },
            "routes": [
                {"row_group": "UCC-049..UCC-053", "namespace": "docker", "unit": "CRAU-115"},
                {"row_group": "UCC-101..UCC-105", "namespace": "docker", "unit": "CRAU-116"},
                {"row_group": "UCC-089..UCC-095", "namespace": "runtime", "unit": "EP-236"},
                {"row_group": "UCC-056..UCC-060", "namespace": "chat", "unit": "ACD-637"},
                {"row_group": "UCC-073..UCC-076", "namespace": "chat", "unit": "ACD-638"},
            ],
            "exceptions": [],
        },
        "prose_unit_resolution": [{"unit": "UCC-105", "adds": ["cmd.docker.run"], "covers": [], "basis": "fixture"}],
        "non_definition_tokens": [
            {"token": "cmd.docker.logs", "disposition": "compatibility_alias", "targets": ["cmd.docker.container.view_logs"],
             "evidence": {"doc": CATALOG, "unit": "UCC-049", "field": "compatibility_only_notes", "quote": "cmd.docker.logs is a compatibility alias"}},
            {"token": "cmd.terminal.split_pane", "disposition": "retired",
             "evidence": {"doc": CATALOG, "unit": "UCC-067", "field": "stale_retired_dispositions", "quote": "the detach and pane rows retire"}},
        ],
        "owner_state_code_map": [{"owner_state": "dirty_worktree", "maps_to": "blocked_state_required", "sources": ["fixture"]}],
        "identity_exemptions": [
            {"command_id": "cmd.runtime.open_queue_analysis", "field": "blocked_sequence", "decision": "DL-333", "reason": "fixture"},
            {"command_id": "cmd.runtime.open_queue_analysis", "field": "allowed_action_id", "decision": "DL-333", "reason": "fixture"},
        ],
        "contested": [{"command_id": "cmd.chat.worktree.bind_existing", "question_id": "fixture-q", "reason": "fixture"}],
    }


FIXTURE_UNIT_EXTRAS: dict[str, dict[str, Any]] = {
    "UCC-049": {
        "preserved_exact_tokens": ["cmd.docker.image.tag", "cmd.docker.container.view_logs", "cmd.docker.logs"],
        "compatibility_only_notes": ["cmd.docker.logs is a compatibility alias for cmd.docker.container.view_logs."],
        "stale_retired_dispositions": [],
    },
    "UCC-058": {"preserved_exact_tokens": ["cmd.chat.worktree.bind_existing"]},
    "UCC-067": {
        "preserved_exact_tokens": ["cmd.terminal.split_pane"],
        "stale_retired_dispositions": ["Amended 2026-10-09 (DL-181): the detach and pane rows retire; replacements in UCC-201."],
    },
    "UCC-073": {"preserved_exact_tokens": ["cmd.chat.copy_message"]},
    "UCC-089": {"preserved_exact_tokens": ["cmd.runtime.*", "cmd.runtime.approve", "cmd.runtime.start_fresh_attempt"]},
    "UCC-091": {"preserved_exact_tokens": ["cmd.runtime.open_queue_analysis"]},
    "UCC-105": {"preserved_exact_tokens": ["cmd.docker.*"], "canonical_text": "Registered ids include cmd.docker.run."},
}


def canon(source: str = "fixture canon") -> dict[str, Any]:
    return {"provenance": "canon", "source": source}


def fixture_definitions() -> dict[str, dict[str, Any]]:
    std = ["invalid_args", "permission_denied", "handler_unavailable", "internal_error"]
    defs = {
        "cmd.docker.image.tag": {
            "command_id": "cmd.docker.image.tag", "ucc_units": ["UCC-049"], "command_kind": "domain_action",
            "response_kind": "owner_operation",
            "args": {
                "image_ref": {"type": "ref", "required": True, "default": "none", **canon()},
                "capability_snapshot_ref": {"type": "ref", "required": True, "default": "none", **canon()},
                "new_tag": {"type": "string", "required": True, "default": "none", "constraints": {"min_length": 1, "max_length": 256},
                            "provenance": "gap", "gap_note": "no field carried the new tag"},
                "mode": {"type": "enum", "values": ["move", "copy"], "required": False, "default": "copy", **canon()},
            },
            "owner_request": "none",
            "result": {"response": RESPONSE_SCHEMA, "owner_result": "local:DockerImageTagResultV1"},
            "error_codes": std + ["stale_projection"], "disabled_reason_codes": ["stale_projection"], "aliases": [],
        },
        "cmd.docker.container.view_logs": {
            "command_id": "cmd.docker.container.view_logs", "ucc_units": ["UCC-049"], "command_kind": "navigation_wrapper",
            "response_kind": "local_projection",
            "args": {
                "container_ref": {"type": "ref", "required": True, "default": "none", **canon()},
                "route_target": {"type": "contract", "ref": "Primitive:RouteTarget", "required": True, "default": "none", **canon()},
            },
            "owner_request": "none",
            "result": {"response": RESPONSE_SCHEMA, "owner_result": "none"},
            "error_codes": ["invalid_route"] + std, "disabled_reason_codes": ["unreachable"],
            "aliases": [{"command_id": "cmd.docker.logs", "kind": "compatibility_alias", "source": "fixture UCC-049"}],
        },
        "cmd.docker.run": {
            "command_id": "cmd.docker.run", "ucc_units": ["UCC-105"], "command_kind": "domain_action",
            "response_kind": "owner_operation",
            "args": {"image_ref": {"type": "ref", "required": True, "default": "none", **canon()}},
            "owner_request": "Plans/fixture_contracts.schema.json#/$defs/DockerRunRequestV1",
            "result": {"response": RESPONSE_SCHEMA, "owner_result": "Plans/fixture_contracts.schema.json#/$defs/DockerRunResultV1"},
            "error_codes": std + ["stale_projection"], "disabled_reason_codes": ["unreachable"], "aliases": [],
        },
        "cmd.runtime.approve": {
            "command_id": "cmd.runtime.approve", "ucc_units": ["UCC-089"], "command_kind": "domain_action",
            "response_kind": "owner_operation",
            "args": {
                "run_id": {"type": "id", "required": True, "default": "none", **canon()},
                "blocked_sequence": {"type": "integer", "required": True, "default": "none", "constraints": {"minimum": 0}, **canon()},
                "allowed_action_id": {"type": "id", "required": True, "default": "none", **canon()},
                "node_id": {"type": "id", "required": True, "default": "none", **canon()},
                "attempt_id": {"type": "id", "required": False, "default": "none", **canon()},
            },
            "owner_request": "none",
            "result": {"response": RESPONSE_SCHEMA, "owner_result": "Plans/Executor_Protocol.md#EP-200"},
            "error_codes": std + ["stale_projection", "blocked_state_required"], "disabled_reason_codes": ["blocked_state_required"], "aliases": [],
        },
        "cmd.runtime.start_fresh_attempt": {
            "command_id": "cmd.runtime.start_fresh_attempt", "ucc_units": ["UCC-089"], "command_kind": "domain_action",
            "response_kind": "owner_operation",
            "args": {
                "run_id": {"type": "id", "required": True, "default": "none", **canon()},
                "blocked_sequence": {"type": "integer", "required": True, "default": "none", **canon()},
                "allowed_action_id": {"type": "id", "required": True, "default": "none", **canon()},
                "attempt_id": {"type": "id", "required": False, "default": "none", **canon()},
                "baseline_target": {"type": "enum", "values": ["safe_point", "historical_commit", "worktree_head"], "required": False, "default": "none", **canon()},
                "safe_point_id": {"type": "id", "required": False, "default": "none", "required_when": {"field": "baseline_target", "in": ["safe_point"]}, **canon()},
                "idempotency_key": {"type": "string", "required": True, "default": "none", "constraints": {"max_length": 256}, **canon()},
            },
            "owner_request": "none",
            "result": {"response": RESPONSE_SCHEMA, "owner_result": "Plans/Executor_Protocol.md#EP-200"},
            "error_codes": std + ["stale_projection", "blocked_state_required"], "disabled_reason_codes": ["blocked_state_required"], "aliases": [],
        },
        "cmd.runtime.open_queue_analysis": {
            "command_id": "cmd.runtime.open_queue_analysis", "ucc_units": ["UCC-091"], "command_kind": "navigation_wrapper",
            "response_kind": "local_projection",
            "args": {
                "run_id": {"type": "id", "required": True, "default": "none", **canon()},
                "scheduler_pass_id": {"type": "id", "required": True, "default": "none", **canon()},
            },
            "owner_request": "none",
            "result": {"response": RESPONSE_SCHEMA, "owner_result": "none"},
            "error_codes": ["invalid_route", "blocked_state_required"] + std, "disabled_reason_codes": ["unsupported"], "aliases": [],
            "identity_exemptions": [
                {"field": "blocked_sequence", "decision": "DL-333", "reason": "fixture"},
                {"field": "allowed_action_id", "decision": "DL-333", "reason": "fixture"},
            ],
        },
        "cmd.chat.copy_message": {
            "command_id": "cmd.chat.copy_message", "ucc_units": ["UCC-073"], "command_kind": "shell_view",
            "response_kind": "local_projection",
            "args": {
                "thread_id": {"type": "id", "required": True, "default": "none", **canon()},
                "message_id": {"type": "id", "required": True, "default": "none", **canon()},
            },
            "owner_request": "none",
            "result": {"response": RESPONSE_SCHEMA, "owner_result": "none"},
            "error_codes": list(std), "disabled_reason_codes": ["unsupported"], "aliases": [],
        },
    }
    return defs


FIXTURE_BLOCKS = {
    "CRAU-115": ("Plans/Containers_Registry_and_Unraid.md", ["cmd.docker.image.tag", "cmd.docker.container.view_logs"]),
    "CRAU-116": ("Plans/Containers_Registry_and_Unraid.md", ["cmd.docker.run"]),
    "EP-236": ("Plans/Executor_Protocol.md", ["cmd.runtime.approve", "cmd.runtime.start_fresh_attempt", "cmd.runtime.open_queue_analysis"]),
    "ACD-638": ("Plans/assistant-chat-design.md", ["cmd.chat.copy_message"]),
}


@dataclass
class Fixture:
    map: dict[str, Any] = field(default_factory=fixture_map)
    units: dict[str, dict[str, Any]] = field(default_factory=lambda: copy.deepcopy(FIXTURE_UNIT_EXTRAS))
    definitions: dict[str, dict[str, Any]] = field(default_factory=fixture_definitions)
    blocks: dict[str, tuple[str, list[str]]] = field(default_factory=lambda: copy.deepcopy(FIXTURE_BLOCKS))
    owner_unit_overrides: dict[str, dict[str, Any]] = field(default_factory=dict)
    results: dict[str, dict[str, Any]] = field(default_factory=lambda: {"CRAU-115": {"DockerImageTagResultV1": {"fields": {
        "image_ref": {"type": "ref", "required": True, "default": "none", "provenance": "gap", "gap_note": "the tagged image"}}}}})
    block_extra: dict[str, dict[str, Any]] = field(default_factory=dict)
    raw_block_suffix: dict[str, str] = field(default_factory=dict)
    between_unit_and_block: dict[str, str] = field(default_factory=dict)
    block_before_unit: dict[str, str] = field(default_factory=dict)
    error_codes: list[str] | None = None
    schema_enum: list[str] | None = None
    catalog_kinds: list[tuple[str, str]] = field(default_factory=lambda: [("cmd.docker.image.tag", "domain_action")])
    map_unit_present: bool = True
    doc_suffix: dict[str, str] = field(default_factory=dict)

    def files(self) -> dict[str, str]:
        out: dict[str, str] = {}
        parts = ["# UI Command Catalog (fixture)", "", "### 2.5A Docker", "", "| Command ID | Label | command_kind |", "|---|---|---|"]
        parts += [f"| `{cmd}` | label | `{kind}` |" for cmd, kind in self.catalog_kinds]
        parts += ["", fixture_overlay(self.error_codes)]
        if self.map_unit_present:
            parts += [f"### {MAP_UNIT} - Strict Schema Overlay Owner Definition Map", "",
                      fence({"plan_unit_id": MAP_UNIT, "unit_type": "schema_contract", "owner_doc": CATALOG, MAP_KEY: self.map})]
        parts += ["## PlanUnits", ""]
        for n in range(49, 106):
            uid = f"UCC-{n:03d}"
            data = {"plan_unit_id": uid, "unit_type": "requirement", "owner_doc": CATALOG, "preserved_exact_tokens": []}
            data.update(copy.deepcopy(self.units.get(uid, {})))
            parts += [f"### {uid} - fixture", "", fence(data)]
        out[CATALOG] = "\n".join(parts)

        docs: dict[str, list[str]] = defaultdict(list)
        docs["Plans/Executor_Protocol.md"] += ["# Executor (fixture)", "", "### EP-200 - recovery result", "",
                                               fence({"plan_unit_id": "EP-200", "unit_type": "contract", "owner_doc": "Plans/Executor_Protocol.md"})]
        for uid, (doc, cmds) in self.blocks.items():
            unit = {"plan_unit_id": uid, "unit_type": "command_contract", "owner_doc": doc, "preserved_exact_tokens": list(cmds)}
            unit.update(self.owner_unit_overrides.get(uid, {}))
            body: dict[str, Any] = {"format": FORMAT, "owner_unit": uid, "overlay": OVERLAY_REF,
                                    "definitions": [self.definitions[c] for c in cmds if c in self.definitions]}
            if uid in self.results:
                body["results"] = self.results[uid]
            body.update(self.block_extra.get(uid, {}))
            block = fence({"command_payload_definitions": body})
            if uid in self.raw_block_suffix:
                block = block.replace("\n```\n", "\n" + self.raw_block_suffix[uid] + "\n```\n")
            if uid in self.block_before_unit:
                # The definitions block placed before its owner unit fence (the value is the
                # text between the block and the unit).
                docs[doc] += [f"### {uid} - typed payload definitions", "", block,
                              self.block_before_unit[uid], fence(unit).rstrip("\n")]
            else:
                docs[doc] += [f"### {uid} - typed payload definitions", "", fence(unit).rstrip("\n"),
                              self.between_unit_and_block.get(uid, ""), block]
        for doc, parts_ in docs.items():
            out[doc] = "\n".join(parts_) + self.doc_suffix.get(doc, "")
        for doc, suffix in self.doc_suffix.items():
            if doc not in out:
                out[doc] = "# Probe document (fixture)\n" + suffix
        out[DECISION_LOG] = "# Decision Log (fixture)\n\n### DL-333 - fixture\n\n" + fence({"plan_unit_id": "DL-333", "unit_type": "decision"})
        enum = self.schema_enum or ["invalid_route", "unknown_command", "invalid_args", "permission_denied",
                                    "blocked_state_required", "stale_projection", "handler_unavailable", "internal_error"]
        out[RESPONSE_SCHEMA] = json.dumps({"$defs": {"UICommandError": {"properties": {"code": {"enum": enum}}}}})
        out["Plans/fixture_contracts.schema.json"] = json.dumps({"$defs": {"DockerRunRequestV1": {}, "DockerRunResultV1": {}}})
        wiring = {f"catalog.{c.replace('.', '_')}": {"ui_command_id": c} for c in self.definitions}
        wiring["catalog.cmd_docker_run"]["request_schema_ref"] = "Plans/fixture_contracts.schema.json#/$defs/DockerRunRequestV1"
        out[WIRING] = json.dumps({"entries": wiring})
        out[EXCLUSIONS] = json.dumps({"excluded_tokens": ["cmd.docker.set_context"]})
        return out


def _defs(fx: Fixture, cmd: str) -> dict[str, Any]:
    return fx.definitions[cmd]


def build_cases() -> tuple[list[tuple[str, Callable[[Fixture], None], int, set[str], set[str]]],
                           list[tuple[str, Callable[[Fixture], None], int, set[str], set[str]]]]:
    """(in-memory cases, CLI cases); each (name, mutation, expected exit, expected error codes,
    expected warning codes). CLI cases run this script as a subprocess against a temporary Plans
    directory and additionally require valid JSON on stdout and an empty stderr."""
    cases: list[tuple[str, Callable[[Fixture], None], int, set[str], set[str]]] = []
    cli_cases: list[tuple[str, Callable[[Fixture], None], int, set[str], set[str]]] = []

    def case(name: str, exit_code: int, errors: set[str], warnings: set[str] | None = None):
        def register(fn: Callable[[Fixture], None]) -> Callable[[Fixture], None]:
            cases.append((name, fn, exit_code, errors, warnings or set()))
            return fn
        return register

    def cli_case(name: str, exit_code: int, errors: set[str], warnings: set[str] | None = None):
        def register(fn: Callable[[Fixture], None]) -> Callable[[Fixture], None]:
            cli_cases.append((name, fn, exit_code, errors, warnings or set()))
            return fn
        return register

    @case("pass: minimal catalog with token units, one prose unit, one alias and owner docs; contested command reported", 0, set())
    def _(fx: Fixture) -> None:
        pass

    @case("pass: runtime definition with optional attempt_id and required_when on baseline_target", 0, set())
    def _(fx: Fixture) -> None:
        assert "required_when" in _defs(fx, "cmd.runtime.start_fresh_attempt")["args"]["safe_point_id"]

    @case("pass: local_projection navigation definition with owner_result none and recorded exemptions", 0, set())
    def _(fx: Fixture) -> None:
        assert _defs(fx, "cmd.runtime.open_queue_analysis")["result"]["owner_result"] == "none"

    @case("fail C02: missing definition", 1, {"C02"})
    def _(fx: Fixture) -> None:
        fx.blocks["ACD-638"] = ("Plans/assistant-chat-design.md", ["cmd.chat.copy_message"])
        del fx.definitions["cmd.chat.copy_message"]

    @case("fail C02/C03: duplicate definition in two docs (the copy is also misplaced)", 1, {"C02", "C03"})
    def _(fx: Fixture) -> None:
        fx.blocks["EP-236"][1].append("cmd.docker.run")

    @case("fail C02: definition for an unknown command id", 1, {"C02"})
    def _(fx: Fixture) -> None:
        d = copy.deepcopy(_defs(fx, "cmd.docker.run"))
        d["command_id"] = "cmd.docker.does_not_exist"
        fx.definitions["cmd.docker.does_not_exist"] = d
        fx.blocks["CRAU-116"][1].append("cmd.docker.does_not_exist")

    @case("fail C03: definition in the wrong doc", 1, {"C03"})
    def _(fx: Fixture) -> None:
        fx.blocks["CRAU-116"] = ("Plans/Containers_Registry_and_Unraid.md", [])
        fx.blocks["EP-236"][1].append("cmd.docker.run")

    @case("fail C03: owner_unit is not a command_contract unit", 1, {"C03"})
    def _(fx: Fixture) -> None:
        fx.owner_unit_overrides["CRAU-116"] = {"unit_type": "requirement"}

    @case("fail C03: id missing from the owner unit's preserved_exact_tokens", 1, {"C03"})
    def _(fx: Fixture) -> None:
        fx.owner_unit_overrides["CRAU-116"] = {"preserved_exact_tokens": []}

    @case("fail C03: block not directly after its owner unit fence", 1, {"C03"})
    def _(fx: Fixture) -> None:
        fx.between_unit_and_block["CRAU-116"] = "Some prose between the unit and its definitions.\n"

    @case("fail C03: definitions block placed before its owner unit fence", 1, {"C03"})
    def _(fx: Fixture) -> None:
        fx.block_before_unit["CRAU-116"] = ""

    @case("fail C03: ucc_units does not match the catalog coverage", 1, {"C03"})
    def _(fx: Fixture) -> None:
        _defs(fx, "cmd.docker.run")["ucc_units"] = ["UCC-104", "UCC-105"]

    @case("fail C04: definition for cmd.docker.logs (alias)", 1, {"C04"})
    def _(fx: Fixture) -> None:
        d = copy.deepcopy(_defs(fx, "cmd.docker.container.view_logs"))
        d["command_id"] = "cmd.docker.logs"
        d["aliases"] = []
        fx.definitions["cmd.docker.logs"] = d
        fx.blocks["CRAU-115"][1].append("cmd.docker.logs")

    @case("fail C04: definition for cmd.terminal.split_pane (retired)", 1, {"C04"})
    def _(fx: Fixture) -> None:
        d = copy.deepcopy(_defs(fx, "cmd.chat.copy_message"))
        d["command_id"] = "cmd.terminal.split_pane"
        fx.definitions["cmd.terminal.split_pane"] = d
        fx.blocks["ACD-638"][1].append("cmd.terminal.split_pane")

    @case("fail C04: definition for a contested command", 1, {"C04"})
    def _(fx: Fixture) -> None:
        d = copy.deepcopy(_defs(fx, "cmd.chat.copy_message"))
        d.update({"command_id": "cmd.chat.worktree.bind_existing", "ucc_units": ["UCC-058"]})
        fx.definitions["cmd.chat.worktree.bind_existing"] = d
        fx.blocks["ACD-637"] = ("Plans/assistant-chat-design.md", ["cmd.chat.worktree.bind_existing"])

    @case("fail C04: alias that is not a non-definition token", 1, {"C04"})
    def _(fx: Fixture) -> None:
        _defs(fx, "cmd.docker.image.tag")["aliases"] = [{"command_id": "cmd.docker.tag", "kind": "compatibility_alias", "source": "x"}]

    @case("fail C04: alias attached to a command that is not its target", 1, {"C04"})
    def _(fx: Fixture) -> None:
        _defs(fx, "cmd.docker.image.tag")["aliases"] = [{"command_id": "cmd.docker.logs", "kind": "compatibility_alias", "source": "x"}]

    @case("fail C04: a token the unit fields mark as alias is missing from non_definition_tokens", 1, {"C04"})
    def _(fx: Fixture) -> None:
        fx.units["UCC-049"]["preserved_exact_tokens"].append("cmd.docker.exec")
        fx.units["UCC-049"]["compatibility_only_notes"] = ["cmd.docker.logs/exec are compatibility aliases for selected canonical Docker paths."]
        fx.map["non_definition_tokens"][0]["evidence"]["quote"] = "cmd.docker.logs/exec are compatibility aliases"
        fx.map["owners"]["exceptions"].append({"command_id": "cmd.docker.exec", "unit": "CRAU-115", "reason": "x"})
        fx.map["contested"].append({"command_id": "cmd.docker.exec", "question_id": "x", "reason": "x"})

    @case("fail C04: non-definition evidence quote not found in canon", 1, {"C04"})
    def _(fx: Fixture) -> None:
        fx.map["non_definition_tokens"][1]["evidence"]["quote"] = "the pane rows stay"

    @case("fail C05: type str", 1, {"C05"})
    def _(fx: Fixture) -> None:
        _defs(fx, "cmd.docker.image.tag")["args"]["new_tag"]["type"] = "str"

    @case("fail C05: enum without values", 1, {"C05"})
    def _(fx: Fixture) -> None:
        spec = _defs(fx, "cmd.docker.image.tag")["args"]["mode"]
        del spec["values"]
        spec["default"] = "none"

    @case("fail C05: unresolvable contract ref", 1, {"C05"})
    def _(fx: Fixture) -> None:
        _defs(fx, "cmd.docker.image.tag")["args"]["target"] = {"type": "contract", "ref": "Plans/fixture_contracts.schema.json#/$defs/Missing", "required": False, "default": "none", **canon()}

    @case("fail C05: unknown field key and required_when on an unknown field", 1, {"C05"})
    def _(fx: Fixture) -> None:
        spec = _defs(fx, "cmd.runtime.start_fresh_attempt")["args"]["safe_point_id"]
        spec["nullable"] = True
        spec["required_when"] = {"field": "baseline", "in": ["safe_point"]}

    @case("fail C05: constraint value minimum is not a number (default none)", 1, {"C05"})
    def _(fx: Fixture) -> None:
        _defs(fx, "cmd.docker.image.tag")["args"]["retry_count"] = {
            "type": "integer", "required": False, "default": "none",
            "constraints": {"minimum": "oops"}, "provenance": "canon", "source": "fixture"}

    @case("fail C05: constraint value minimum is not a number (literal default must not raise)", 1, {"C05"})
    def _(fx: Fixture) -> None:
        _defs(fx, "cmd.docker.image.tag")["args"]["retry_count"] = {
            "type": "integer", "required": False, "default": 0,
            "constraints": {"minimum": "oops"}, "provenance": "canon", "source": "fixture"}

    @case("fail C06: missing default key", 1, {"C06"})
    def _(fx: Fixture) -> None:
        del _defs(fx, "cmd.docker.image.tag")["args"]["image_ref"]["default"]

    @case("fail C06: required true with a literal default", 1, {"C06"})
    def _(fx: Fixture) -> None:
        _defs(fx, "cmd.docker.image.tag")["args"]["new_tag"]["default"] = "latest"

    @case("fail C06: enum default not in values", 1, {"C06"})
    def _(fx: Fixture) -> None:
        _defs(fx, "cmd.docker.image.tag")["args"]["mode"]["default"] = "rename"

    @case("fail C06: list default whose items violate the item spec", 1, {"C06"})
    def _(fx: Fixture) -> None:
        _defs(fx, "cmd.docker.image.tag")["args"]["extra_refs"] = {
            "type": "list", "item": {"type": "ref"}, "required": False, "default": [17],
            "provenance": "canon", "source": "fixture"}

    @case("fail C06: object default missing a required child", 1, {"C06"})
    def _(fx: Fixture) -> None:
        _defs(fx, "cmd.docker.image.tag")["args"]["limits"] = {
            "type": "object", "required": False, "default": {},
            "fields": {"count": {"type": "integer", "required": True, "default": "none",
                                 "provenance": "canon", "source": "fixture"}},
            "provenance": "canon", "source": "fixture"}

    @case("fail C06: id default is the empty string", 1, {"C06"})
    def _(fx: Fixture) -> None:
        _defs(fx, "cmd.docker.image.tag")["args"]["image_alias"] = {
            "type": "id", "required": False, "default": "", "provenance": "canon", "source": "fixture"}

    @case("fail C06: id default contains whitespace", 1, {"C06"})
    def _(fx: Fixture) -> None:
        _defs(fx, "cmd.docker.image.tag")["args"]["image_alias"] = {
            "type": "id", "required": False, "default": "has space", "provenance": "canon", "source": "fixture"}

    @case("fail C06: string default violates its pattern constraint", 1, {"C06"})
    def _(fx: Fixture) -> None:
        _defs(fx, "cmd.docker.image.tag")["args"]["slug"] = {
            "type": "string", "required": False, "default": "123",
            "constraints": {"pattern": "^[a-z]+$"}, "provenance": "canon", "source": "fixture"}

    @case("fail C06: common idempotency_key default exceeds the UCC-230 maximum 256", 1, {"C06"})
    def _(fx: Fixture) -> None:
        _defs(fx, "cmd.docker.image.tag")["args"]["idempotency_key"] = {
            "type": "string", "required": False, "default": "x" * 300,
            "provenance": "canon", "source": "fixture"}

    @case("pass: literal defaults that satisfy recursive specs and inherited common constraints", 0, set())
    def _(fx: Fixture) -> None:
        args = _defs(fx, "cmd.docker.image.tag")["args"]
        args["extra_refs"] = {"type": "list", "item": {"type": "ref"}, "required": False,
                              "default": ["receipt:1"], "provenance": "canon", "source": "fixture"}
        args["limits"] = {"type": "object", "required": False, "default": {"count": 2},
                          "fields": {"count": {"type": "integer", "required": True, "default": "none",
                                               "constraints": {"minimum": 0}, "provenance": "canon", "source": "fixture"}},
                          "provenance": "canon", "source": "fixture"}
        args["idempotency_key"] = {"type": "string", "required": False, "default": "x" * 256,
                                   "provenance": "canon", "source": "fixture"}

    @case("fail C07: thread_id missing on a UCC-073 command", 1, {"C07"})
    def _(fx: Fixture) -> None:
        del _defs(fx, "cmd.chat.copy_message")["args"]["thread_id"]

    @case("fail C07: capability_snapshot_ref missing on a UCC-049 domain_action", 1, {"C07"})
    def _(fx: Fixture) -> None:
        del _defs(fx, "cmd.docker.image.tag")["args"]["capability_snapshot_ref"]

    @case("fail C07: attempt_id required on cmd.runtime.approve", 1, {"C07"})
    def _(fx: Fixture) -> None:
        _defs(fx, "cmd.runtime.approve")["args"]["attempt_id"]["required"] = True

    @case("fail C07: identity exemption not recorded in UCC-230", 1, {"C07"})
    def _(fx: Fixture) -> None:
        fx.map["identity_exemptions"] = fx.map["identity_exemptions"][:1]

    @case("fail C07: identity field typed against the suffix rule", 1, {"C07"})
    def _(fx: Fixture) -> None:
        _defs(fx, "cmd.docker.container.view_logs")["args"]["container_ref"]["type"] = "string"

    @case("fail C07: UCC-230 row group differs from the overlay identity cell", 1, {"C07"})
    def _(fx: Fixture) -> None:
        fx.map["row_groups"][3]["optional_identity"].append("tab_id")

    @case("fail C08: dispatch_id restated as integer", 1, {"C08"})
    def _(fx: Fixture) -> None:
        _defs(fx, "cmd.docker.image.tag")["args"]["dispatch_id"] = {"type": "integer", "required": True, "default": "none", **canon()}

    @case("fail C08: common optional field changes its type", 1, {"C08"})
    def _(fx: Fixture) -> None:
        _defs(fx, "cmd.docker.run")["args"]["project_id"] = {"type": "string", "required": True, "default": "none", **canon()}

    @case("fail C08: UCC-230 envelope differs from the overlay payload_required bullet", 1, {"C08"})
    def _(fx: Fixture) -> None:
        fx.map["envelope"]["required_not_restated"] = ["dispatch_id", "command_id", "source_surface"]

    @case("fail C09: error code timeout", 1, {"C09"})
    def _(fx: Fixture) -> None:
        _defs(fx, "cmd.docker.run")["error_codes"].append("timeout")

    @case("fail C09: disabled reason dirty_worktree", 1, {"C09"})
    def _(fx: Fixture) -> None:
        _defs(fx, "cmd.docker.run")["disabled_reason_codes"] = ["dirty_worktree"]

    @case("fail C09: unknown_command listed", 1, {"C09"})
    def _(fx: Fixture) -> None:
        _defs(fx, "cmd.docker.run")["error_codes"].append("unknown_command")

    @case("fail C09: narrowing rule code missing without a narrowing_gap_note", 1, {"C09"})
    def _(fx: Fixture) -> None:
        _defs(fx, "cmd.docker.run")["error_codes"].remove("stale_projection")

    @case("pass: narrowing below the rule with a narrowing_gap_note", 0, set())
    def _(fx: Fixture) -> None:
        d = _defs(fx, "cmd.docker.run")
        d["error_codes"].remove("stale_projection")
        d["narrowing_gap_note"] = "fixture: owner narrows further"

    @case("fail C09: narrowing_gap_note is a boolean, not a nonblank string", 1, {"C09"})
    def _(fx: Fixture) -> None:
        d = _defs(fx, "cmd.docker.run")
        d["error_codes"].remove("stale_projection")
        d["narrowing_gap_note"] = True

    @case("fail C09: narrowing_gap_note is a blank string", 1, {"C09"})
    def _(fx: Fixture) -> None:
        d = _defs(fx, "cmd.docker.run")
        d["error_codes"].remove("stale_projection")
        d["narrowing_gap_note"] = "   "

    @case("fail C10: owner_result none on an owner_operation", 1, {"C10"})
    def _(fx: Fixture) -> None:
        _defs(fx, "cmd.docker.run")["result"]["owner_result"] = "none"

    @case("fail C10: local_projection with an owner result", 1, {"C10"})
    def _(fx: Fixture) -> None:
        _defs(fx, "cmd.chat.copy_message")["result"]["owner_result"] = "Plans/Executor_Protocol.md#EP-200"

    @case("fail C10: catalogued domain_action declares local_projection with owner_result none", 1, {"C10"})
    def _(fx: Fixture) -> None:
        d = _defs(fx, "cmd.docker.image.tag")
        d["response_kind"] = "local_projection"
        d["result"]["owner_result"] = "none"

    @case("fail C10: local_projection with owner_result none but an owner_request owner operation", 1, {"C10"})
    def _(fx: Fixture) -> None:
        d = _defs(fx, "cmd.docker.run")
        d["response_kind"] = "local_projection"
        d["result"]["owner_result"] = "none"

    @case("fail C11: field without provenance", 1, {"C11"})
    def _(fx: Fixture) -> None:
        spec = _defs(fx, "cmd.docker.run")["args"]["image_ref"]
        del spec["provenance"]
        del spec["source"]

    @case("fail C12: command_kind differs from the catalog metadata", 1, {"C12"})
    def _(fx: Fixture) -> None:
        _defs(fx, "cmd.docker.image.tag")["command_kind"] = "shell_view"

    @case("fail C12: command_kind outside the three Contracts_V0 values", 1, {"C12"})
    def _(fx: Fixture) -> None:
        _defs(fx, "cmd.chat.copy_message")["command_kind"] = "local_action"

    @case("warn C13: owner_request differs from the wiring request_schema_ref", 0, set(), {"C13"})
    def _(fx: Fixture) -> None:
        _defs(fx, "cmd.docker.run")["owner_request"] = "Plans/fixture_contracts.schema.json#/$defs/DockerRunResultV1"

    @case("fail C14: block containing plan_unit_id:", 1, {"C14"})
    def _(fx: Fixture) -> None:
        fx.block_extra["CRAU-116"] = {"plan_unit_id": "CRAU-116"}

    @case("fail C14/C02: duplicate YAML key in a block (its definitions are then unreadable)", 1, {"C14", "C02"})
    def _(fx: Fixture) -> None:
        fx.raw_block_suffix["CRAU-116"] = "  format: pm.command_payload_definitions.v1"

    @case("fail C14: wrong format string", 1, {"C14"})
    def _(fx: Fixture) -> None:
        fx.block_extra["CRAU-116"] = {"format": "pm.command_payload_definitions.v0"}

    @case("fail C01: overlay error set differs from the UICommandError.code enum", 1, {"C01"})
    def _(fx: Fixture) -> None:
        fx.schema_enum = ["invalid_route", "unknown_command", "invalid_args", "permission_denied",
                          "blocked_state_required", "stale_projection", "handler_unavailable", "internal_error", "timeout"]

    @case("exit 2: map unit UCC-230 missing", 2, set())
    def _(fx: Fixture) -> None:
        fx.map_unit_present = False

    # Round-2 fixes: C10 without a catalog kind cell, conjunctive inherited constraints,
    # exception-free pattern handling, primitive defaults and bound sanity.

    @case("fail C10: domain_action definition without a catalog kind cell declares local_projection", 1, {"C10"})
    def _(fx: Fixture) -> None:
        assert ("cmd.runtime.approve", "domain_action") not in fx.catalog_kinds
        d = _defs(fx, "cmd.runtime.approve")
        d["response_kind"] = "local_projection"
        d["result"]["owner_result"] = "none"

    @case("fail C05/C06: local max_length cannot replace the inherited idempotency_key maximum 256", 1, {"C05", "C06"})
    def _(fx: Fixture) -> None:
        _defs(fx, "cmd.docker.image.tag")["args"]["idempotency_key"] = {
            "type": "string", "required": False, "default": "x" * 300,
            "constraints": {"max_length": 512}, "provenance": "canon", "source": "fixture"}

    @case("pass: local constraint narrows the inherited idempotency_key maximum", 0, set())
    def _(fx: Fixture) -> None:
        _defs(fx, "cmd.docker.image.tag")["args"]["idempotency_key"] = {
            "type": "string", "required": False, "default": "x" * 128,
            "constraints": {"max_length": 200}, "provenance": "canon", "source": "fixture"}

    @case("fail C05: inverted numeric range (minimum above maximum)", 1, {"C05"})
    def _(fx: Fixture) -> None:
        _defs(fx, "cmd.docker.image.tag")["args"]["retry_count"] = {
            "type": "integer", "required": False, "default": "none",
            "constraints": {"minimum": 5, "maximum": 3}, "provenance": "canon", "source": "fixture"}

    @case("fail C05: inverted length range (min_length above max_length)", 1, {"C05"})
    def _(fx: Fixture) -> None:
        _defs(fx, "cmd.docker.image.tag")["args"]["slug"] = {
            "type": "string", "required": False, "default": "none",
            "constraints": {"min_length": 10, "max_length": 4}, "provenance": "canon", "source": "fixture"}

    @case("fail C05: inverted item-count range (min_items above max_items)", 1, {"C05"})
    def _(fx: Fixture) -> None:
        _defs(fx, "cmd.docker.image.tag")["args"]["extra_refs"] = {
            "type": "list", "item": {"type": "ref"}, "required": False, "default": "none",
            "constraints": {"min_items": 5, "max_items": 2}, "provenance": "canon", "source": "fixture"}

    @case("fail C05: NaN numeric bound", 1, {"C05"})
    def _(fx: Fixture) -> None:
        _defs(fx, "cmd.docker.image.tag")["args"]["retry_count"] = {
            "type": "integer", "required": False, "default": "none",
            "constraints": {"minimum": float("nan")}, "provenance": "canon", "source": "fixture"}

    @case("fail C05: infinite numeric bound", 1, {"C05"})
    def _(fx: Fixture) -> None:
        _defs(fx, "cmd.docker.image.tag")["args"]["retry_count"] = {
            "type": "integer", "required": False, "default": "none",
            "constraints": {"maximum": float("inf")}, "provenance": "canon", "source": "fixture"}

    @case("fail C06: timestamp default is not RFC 3339 UTC", 1, {"C06"})
    def _(fx: Fixture) -> None:
        _defs(fx, "cmd.docker.image.tag")["args"]["opened_at"] = {
            "type": "timestamp", "required": False, "default": "not a timestamp", "provenance": "canon", "source": "fixture"}

    @case("fail C06: timestamp default has a non-zero offset (+01:00)", 1, {"C06"})
    def _(fx: Fixture) -> None:
        _defs(fx, "cmd.docker.image.tag")["args"]["opened_at"] = {
            "type": "timestamp", "required": False, "default": "2026-11-04T12:34:56+01:00",
            "provenance": "canon", "source": "fixture"}

    @case("fail C06: url default is not an absolute URL", 1, {"C06"})
    def _(fx: Fixture) -> None:
        _defs(fx, "cmd.docker.image.tag")["args"]["docs_link"] = {
            "type": "url", "required": False, "default": "relative/path", "provenance": "canon", "source": "fixture"}

    @case("fail C06: path default is not an absolute path", 1, {"C06"})
    def _(fx: Fixture) -> None:
        _defs(fx, "cmd.docker.image.tag")["args"]["manifest_path"] = {
            "type": "path", "required": False, "default": "relative/path", "provenance": "canon", "source": "fixture"}

    @case("fail C06: path default contains a dot-dot segment", 1, {"C06"})
    def _(fx: Fixture) -> None:
        _defs(fx, "cmd.docker.image.tag")["args"]["manifest_path"] = {
            "type": "path", "required": False, "default": "/data/../etc/passwd", "provenance": "canon", "source": "fixture"}

    @case("fail C06: timestamp, url and path literal defaults are not allowed (resolution 11)", 1, {"C06"})
    def _(fx: Fixture) -> None:
        args = _defs(fx, "cmd.docker.image.tag")["args"]
        args["opened_at"] = {"type": "timestamp", "required": False, "default": "2026-11-04T12:34:56Z",
                             "provenance": "canon", "source": "fixture"}
        args["docs_link"] = {"type": "url", "required": False, "default": "https://example.com/docs",
                             "provenance": "canon", "source": "fixture"}
        args["manifest_path"] = {"type": "path", "required": False, "default": "/tmp/manifest.yaml",
                                 "provenance": "canon", "source": "fixture"}

    @cli_case("cli fail C05: pattern repetition count beyond compile limits (default none)", 1, {"C05"})
    def _(fx: Fixture) -> None:
        _defs(fx, "cmd.docker.image.tag")["args"]["slug"] = {
            "type": "string", "required": False, "default": "none",
            "constraints": {"pattern": "a{4294967296}"}, "provenance": "canon", "source": "fixture"}

    @cli_case("cli fail C05: pattern repetition count beyond compile limits (literal default)", 1, {"C05"})
    def _(fx: Fixture) -> None:
        _defs(fx, "cmd.docker.image.tag")["args"]["slug"] = {
            "type": "string", "required": False, "default": "aaa",
            "constraints": {"pattern": "a{4294967296}"}, "provenance": "canon", "source": "fixture"}

    # Round-3 redesign: owner grammars for timestamp, url and path; inline-root blocks; effective
    # inherited ranges. Each primitive gets negative cases and positive controls.

    def _prim(fx: Fixture, kind: str, default: Any) -> None:
        _defs(fx, "cmd.docker.image.tag")["args"]["probe"] = {
            "type": kind, "required": False, "default": default, "provenance": "canon", "source": "fixture"}

    for kind, value in [("timestamp", "2026-11-04T12:34:56Z"), ("url", "https://example.com/docs"), ("path", "/tmp/manifest.yaml"),
                        ("timestamp", "garbage"), ("url", "https://user@@example.com/x"), ("path", "\\\\server\\share/../bad")]:
        @case(f"fail C06: {kind} literal default {value!r} is not allowed", 1, {"C06"})
        def _(fx: Fixture, kind=kind, value=value) -> None:
            _prim(fx, kind, value)

    for label, kind, value, ok in [
        ("timestamp +00:00 offset", "timestamp", "2026-11-04T12:34:56+00:00", True),
        ("timestamp lower-case t and z", "timestamp", "2026-11-04t12:34:56.250z", True),
        ("timestamp leap second at month end", "timestamp", "2016-12-31T23:59:60Z", True),
        ("timestamp leap second mid-month", "timestamp", "2026-11-04T12:34:60Z", False),
        ("timestamp leap second at 23:59 not month end", "timestamp", "2026-11-04T23:59:60Z", False),
        ("timestamp -00:00 (unknown local offset)", "timestamp", "2026-11-04T12:34:56-00:00", False),
        ("timestamp full-width digits", "timestamp", "\uff12\uff10\uff12\uff16-11-04T12:34:56Z", False),
        ("timestamp hour 24", "timestamp", "2026-11-04T24:00:00Z", False),
        ("timestamp invalid date", "timestamp", "2026-02-30T12:00:00Z", False),
        ("url https with path", "url", "https://example.com/docs?x=1#top", True),
        ("url http with port", "url", "http://example.com:8080/x", True),
        ("url https IPv6 host", "url", "https://[2001:db8::1]/x", True),
        ("url https IPv4 host", "url", "https://192.0.2.10/x", True),
        ("url space in host", "url", "https://exa mple.com/docs", False),
        ("url non-numeric port", "url", "https://example.com:bad/docs", False),
        ("url port out of range", "url", "https://example.com:99999/docs", False),
        ("url empty port", "url", "https://example.com:/docs", False),
        ("url NUL in path", "url", "https://example.com/\x00", False),
        ("url ftp scheme", "url", "ftp://example.com/docs", False),
        ("url file scheme", "url", "file://example.com/docs", False),
        ("url javascript scheme", "url", "javascript:alert(1)", False),
        ("url upper-case host (not normalized)", "url", "https://Example.com/docs", False),
        ("url bad percent escape", "url", "https://example.com/a%zz", False),
        ("url invalid IPv4", "url", "https://999.1.1.1/x", False),
        ("url label with leading hyphen", "url", "https://-bad.example.com/x", False),
        ("path POSIX root", "path", "/", True),
        ("path POSIX file", "path", "/tmp/manifest.yaml", True),
        ("path Windows drive forward slashes", "path", "C:/work/manifest.yaml", True),
        ("path Windows drive backslashes", "path", "C:\\work\\manifest.yaml", True),
        ("path Windows drive root", "path", "C:\\", True),
        ("path UNC share", "path", "\\\\server\\share\\dir\\file.txt", True),
        ("path NUL in segment", "path", "/tmp/a\x00b", False),
        ("path relative", "path", "relative/path", False),
        ("path dot segment", "path", "/a/./b", False),
        ("path empty interior segment", "path", "/a//b", False),
        ("path trailing slash", "path", "/a/b/", False),
        ("path Windows drive without separator", "path", "C:work", False),
        ("path UNC without share", "path", "\\\\server", False),
    ]:
        @case(f"fail C06 (resolution 11{'; formerly a pass control' if ok else ''}): {label}", 1, {"C06"})
        def _(fx: Fixture, kind=kind, value=value) -> None:
            _prim(fx, kind, value)

    for kind in LITERAL_DEFAULT_FORBIDDEN_TYPES:
        @case(f"pass: {kind} field with default none", 0, set())
        def _(fx: Fixture, kind=kind) -> None:
            _prim(fx, kind, "none")

    @case("fail C06: a url inside a list literal default is not allowed", 1, {"C06"})
    def _(fx: Fixture) -> None:
        _defs(fx, "cmd.docker.image.tag")["args"]["mirrors"] = {
            "type": "list", "item": {"type": "url"}, "required": False, "default": ["https://example.com/a"],
            "provenance": "canon", "source": "fixture"}

    @case("fail C06: a timestamp inside an object literal default is not allowed", 1, {"C06"})
    def _(fx: Fixture) -> None:
        _defs(fx, "cmd.docker.image.tag")["args"]["window"] = {
            "type": "object", "fields": {"since": {"type": "timestamp", "required": False, "default": "none",
                                                   "provenance": "canon", "source": "fixture"}},
            "required": False, "default": {"since": "2026-11-04T00:00:00Z"}, "provenance": "canon", "source": "fixture"}

    @case("fail C05: the map's literal-default rule differs from the checker", 1, {"C05"})
    def _(fx: Fixture) -> None:
        fx.map["literal_default_forbidden_types"] = ["url"]

    for label, text in [("double-quoted key", '"command_payload_definitions": false'),
                        ("single-quoted key", "'command_payload_definitions': false"),
                        ("indented root mapping", "  command_payload_definitions: false"),
                        ("space before the colon", "command_payload_definitions : false"),
                        ("flow mapping root", "{command_payload_definitions: false}"),
                        ("explicit key", "? command_payload_definitions\n: false")]:
        @case(f"fail C14: definitions block with a {label} is detected", 1, {"C14"})
        def _(fx: Fixture, text=text) -> None:
            fx.doc_suffix["Plans/Containers_Registry_and_Unraid.md"] = "\n\n```yaml\n" + text + "\n```\n"

    for label, text in [("double-quoted key", '"command_payload_definitions": false'),
                        ("escaped key", '"command\\x5fpayload_definitions": false'),
                        ("space before the colon", "command_payload_definitions : false"),
                        ("explicit multi-line key", "? command_payload_definitions\n: false"),
                        ("anchored key, malformed value", "&k command_payload_definitions: {unclosed"),
                        ("tagged key, malformed value", "!!str command_payload_definitions: {unclosed"),
                        ("alias key, malformed value", "a: &k command_payload_definitions\n*k : {unclosed")]:
        @case(f"fail C14: a {label} in a document with no other definitions block is detected", 1, {"C14"})
        def _(fx: Fixture, text=text) -> None:
            fx.doc_suffix["Plans/Probe_Doc.md"] = "\n\n```yaml\n" + text + "\n```\n"

    for label, text in [("multi-line double-quoted scalar", 'description: "The text\ncommand_payload_definitions: false\nis illustrative."'),
                        ("multi-line single-quoted scalar", "description: 'The text\ncommand_payload_definitions: false\nis illustrative.'"),
                        ("literal block scalar", "description: |\n  command_payload_definitions: false"),
                        ("nested key, not root", "outer:\n  command_payload_definitions: false")]:
        @case(f"pass: the key text inside a {label} is prose, not a block", 0, set())
        def _(fx: Fixture, text=text) -> None:
            fx.doc_suffix["Plans/Containers_Registry_and_Unraid.md"] = "\n\n```yaml\n" + text + "\n```\n"

    for label, text, codes in [("inline false root", "command_payload_definitions: false", {"C14"}),
                               ("inline flow mapping with a wrong format", "command_payload_definitions: {format: nonsense}", {"C03", "C14"}),
                               ("inline unknown tag", "command_payload_definitions: !unknown {}", {"C14"})]:
        @case(f"fail {'/'.join(sorted(codes))}: malformed definitions block with an {label} is detected", 1, codes)
        def _(fx: Fixture, text=text) -> None:
            fx.doc_suffix["Plans/Containers_Registry_and_Unraid.md"] = "\n\n```yaml\n" + text + "\n```\n"

    @case("fail C05: local min_length above the inherited idempotency_key maximum, no default", 1, {"C05"})
    def _(fx: Fixture) -> None:
        _defs(fx, "cmd.docker.image.tag")["args"]["idempotency_key"] = {
            "type": "string", "required": False, "default": "none",
            "constraints": {"min_length": 257}, "provenance": "canon", "source": "fixture"}

    @case("pass: local min_length below the inherited idempotency_key maximum, no default", 0, set())
    def _(fx: Fixture) -> None:
        _defs(fx, "cmd.docker.image.tag")["args"]["idempotency_key"] = {
            "type": "string", "required": False, "default": "none",
            "constraints": {"min_length": 8}, "provenance": "canon", "source": "fixture"}

    return cases, cli_cases


def run_cli_check(plans_files: dict[str, str]) -> tuple[int, str, str]:
    """Run this script as the CLI on an isolated temporary Plans directory (--plans-root --json)."""
    with tempfile.TemporaryDirectory(prefix="pm-command-payload-defs-") as tmp:
        root = Path(tmp)
        for rel, text in plans_files.items():
            dest = root / rel[len("Plans/"):]
            dest.parent.mkdir(parents=True, exist_ok=True)
            dest.write_text(text, encoding="utf-8")
        proc = subprocess.run([sys.executable, str(Path(__file__).resolve()), "--plans-root", str(root), "--json"],
                              capture_output=True, text=True, check=False)
        return proc.returncode, proc.stdout, proc.stderr


def self_test() -> int:
    failures = 0
    cases, cli_cases = build_cases()
    for name, mutate, exit_expected, errors_expected, warnings_expected in cases:
        fx = Fixture()
        mutate(fx)
        try:
            result = run_check(Corpus(files=fx.files()))
            exit_code = 1 if result["status"] == "fail" else 0
            errors = {row["code"][:3] for row in result["errors"]}
            warnings = {row["code"][:3] for row in result["warnings"]}
        except ParseError:
            exit_code, errors, warnings, result = 2, set(), set(), None
        ok = exit_code == exit_expected and errors == errors_expected and warnings == warnings_expected
        if ok and name.startswith("pass: minimal") and result is not None:
            ok = [c["command_id"] for c in result["contested"]] == ["cmd.chat.worktree.bind_existing"] and result["counts"]["missing_definitions"] == 0
        status = "ok" if ok else "FAIL"
        print(f"{status} {name}")
        if not ok:
            failures += 1
            print(f"     expected exit={exit_expected} errors={sorted(errors_expected)} warnings={sorted(warnings_expected)}; "
                  f"got exit={exit_code} errors={sorted(errors)} warnings={sorted(warnings)}")
            if result is not None:
                for row in result["errors"] + result["warnings"]:
                    print("     ", json.dumps(row, sort_keys=True))
    for name, mutate, exit_expected, errors_expected, warnings_expected in cli_cases:
        fx = Fixture()
        mutate(fx)
        exit_code, stdout, stderr = run_cli_check(fx.files())
        ok = exit_code == exit_expected and stderr == ""
        result: dict[str, Any] | None = None
        try:
            result = json.loads(stdout)
        except json.JSONDecodeError:
            ok = False
        if ok and exit_code in (0, 1):
            errors = {row["code"][:3] for row in result["errors"]}
            warnings = {row["code"][:3] for row in result["warnings"]}
            ok = result.get("status") == ("fail" if exit_expected == 1 else "pass") and errors == errors_expected and warnings == warnings_expected
        status = "ok" if ok else "FAIL"
        print(f"{status} {name}")
        if not ok:
            failures += 1
            print(f"     expected exit={exit_expected} errors={sorted(errors_expected)} warnings={sorted(warnings_expected)}; "
                  f"got exit={exit_code} stderr={stderr!r} stdout={stdout[:500]!r}")
    total = len(cases) + len(cli_cases)
    print(f"self-test: {total - failures}/{total} cases passed")
    return 0 if failures == 0 else 1


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__.split("\n\n")[0])
    parser.add_argument("--json", action="store_true", help="print the sorted machine report")
    parser.add_argument("--self-test", action="store_true", help="run the in-memory fixture cases; reads no repository file")
    parser.add_argument("--plans-root", type=Path, default=ROOT / "Plans", help="Plans directory (default: this repository's)")
    try:
        args = parser.parse_args(argv)
    except SystemExit as exc:
        return 2 if exc.code else 0
    if args.self_test:
        return self_test()
    if not args.plans_root.is_dir():
        print(f"error: --plans-root {args.plans_root} is not a directory", file=sys.stderr)
        return 2
    try:
        result = run_check(Corpus(plans_root=args.plans_root.resolve()))
    except ParseError as exc:
        if args.json:
            print(json.dumps({"check": "command-payload-defs", "status": "error", "error": str(exc)}, indent=2, sort_keys=True))
        else:
            print(f"command-payload-defs: error: {exc}", file=sys.stderr)
        return 2
    except Exception as exc:  # noqa: BLE001 - the machine-readable report must always print
        if args.json:
            print(json.dumps({"check": "command-payload-defs", "status": "error",
                              "error": f"{type(exc).__name__}: {exc}"}, indent=2, sort_keys=True))
        else:
            print(f"command-payload-defs: error: {type(exc).__name__}: {exc}", file=sys.stderr)
        return 2
    print(json.dumps(result, indent=2, sort_keys=True) if args.json else render_text(result))
    return 1 if result["status"] == "fail" else 0


if __name__ == "__main__":
    raise SystemExit(main())
