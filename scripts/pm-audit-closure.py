#!/usr/bin/env python3
"""Validate PM semantic audit closure registry and repair closure matrices."""
from __future__ import annotations

import argparse
import hashlib
import json
import re
import sys
from datetime import datetime, timezone
from pathlib import Path
from typing import Any
import functools
import os


ROOT = Path(__file__).resolve().parents[1]
DEFAULT_REGISTRY = ROOT / "Plans/.audits/_semantic_closure_registry.jsonl"

ALLOWED_STATUSES = {
    "repaired",
    "false_positive",
    "explicitly_deferred",
    "source_lineage_only",
    "not_for_plan",
    "stale_retired",
    "blocked_requires_user_decision",
    "reopened",
}
OPEN_STATUSES = {"blocked_requires_user_decision", "reopened"}
FINDING_LEVELS = {"blocker", "warning", "observation", "error", "info"}
TERMINAL_CLASSIFICATIONS = {"exact_present", "equivalent_with_evidence", "previously_closed"}
AUDIT_REF_FIELDS = ("audit_id", "ledger_id", "baseline_ref", "subject_ref", "observation_ref")
# Per Codex_Prompts.md and Bootstrap_Planning_Workflow.md, audit artifacts must agree on all
# AUDIT_REF_FIELDS. subject_ref (the audit-subject commit identity) and baseline_ref/audit_id
# must always match audit_report.json. Only ledger_id/observation_ref may diverge in narrow
# source row scopes, so they remain the only row-scoped exceptions.
ROW_SCOPED_REF_FIELDS = {"ledger_id", "observation_ref"}
AUDIT_SOURCE_FINDING_REQUIRED_FIELDS = {
    "finding_family",
    "ledger_id",
    "source_atom_ids",
    "plan_unit_ids",
    "owner_docs",
    "detail_keys",
    "exact_tokens",
    "repair_required",
    "finding_level",
    "finding_key",
}
AUDIT_SOURCE_FINDING_LIST_FIELDS = {
    "source_atom_ids",
    "plan_unit_ids",
    "owner_docs",
    "detail_keys",
    "exact_tokens",
}
AUDIT_FINDING_ARTIFACTS = {
    "semantic_risks.jsonl",
    "owner_routing_findings.jsonl",
}
SCOPE_MANIFEST = "audit_scope_manifest.jsonl"
SCOPE_REQUIRED_FAMILIES = {
    "compiled_atom_detail",
    "compile_target",
    "planunit_claim",
    "reciprocal_source_lineage",
    "owner_consumer_route",
    "schema_contract_identity",
    "dependency_edge",
    "ledger_projection_field",
    "index_governance_check",
    "forbidden_artifact_check",
}
CURRENT_SCOPE_ROW_TYPE_FAMILIES = {
    "atom_acceptance": "compiled_atom_detail",
    "atom_detail": "compiled_atom_detail",
    "atom_exact_token": "compiled_atom_detail",
    "atom_key_shape": "compiled_atom_detail",
    "atom_negative_constraint": "compiled_atom_detail",
    "atom_not_for_plan": "compiled_atom_detail",
    "atom_source_ref": "compiled_atom_detail",
    "planunit_preserved_token": "compiled_atom_detail",
    "atom_to_planunit_target": "compile_target",
    "planunit_canonical_claim": "planunit_claim",
    "planunit_reciprocal_source_lineage": "reciprocal_source_lineage",
    "owner_consumer_route": "owner_consumer_route",
    "schema_contract_identity": "schema_contract_identity",
    "cycle_boundary": "dependency_edge",
    "dependency_edge": "dependency_edge",
    "ledger_projection_field": "ledger_projection_field",
    "ledger_registry_field": "ledger_projection_field",
    "changed_file": "index_governance_check",
    "index_governance_check": "index_governance_check",
    "validator_check": "index_governance_check",
    "forbidden_artifact_check": "forbidden_artifact_check",
}
SCOPE_REQUIRED_FIELDS = {
    "check_id",
    "check_family",
    "audit_id",
    "ledger_id",
    "baseline_ref",
    "subject_ref",
    "observation_ref",
    "source_atom_ids",
    "plan_unit_ids",
    "owner_docs",
    "detail_keys",
    "exact_tokens",
    "covered_artifacts",
    "classification",
    "repair_required",
    "finding_level",
}
SCOPE_LIST_FIELDS = {
    "source_atom_ids",
    "plan_unit_ids",
    "owner_docs",
    "detail_keys",
    "exact_tokens",
    "covered_artifacts",
    "finding_keys",
}
UNCLASSIFIED_VALUES = {"", "pending", "todo", "unchecked", "unclassified", "unknown"}
IMPACT_MATRIX = "repair_impact_matrix.jsonl"
IMPACT_REQUIRED_FIELDS = {
    "impact_id",
    "audit_id",
    "ledger_id",
    "baseline_ref",
    "subject_ref",
    "observation_ref",
    "source_artifact",
    "source_row",
    "finding_key",
    "files",
    "plan_unit_ids",
    "schemas",
    "dependency_edges",
    "owner_refs",
    "ledger_projection_fields",
    "index_artifacts",
    "governance_artifacts",
    "scope_check_ids",
    "post_repair_semantic_audit",
}
IMPACT_LIST_FIELDS = {
    "files",
    "plan_unit_ids",
    "schemas",
    "dependency_edges",
    "owner_refs",
    "ledger_projection_fields",
    "index_artifacts",
    "governance_artifacts",
    "scope_check_ids",
}
POST_REPAIR_DRIFT_FIELDS = {
    "schema_identity",
    "reciprocal_lineage",
    "dependencies",
    "owner_routing",
    "ledger_projections",
}
REOPEN_CONDITIONS = {
    "source_atom_hash_changed",
    "plan_unit_hash_changed",
    "owner_evidence_hash_changed",
    "closure_evidence_hash_changed",
    "closure_status_blocked_or_reopened",
}
REGISTRY_REQUIRED_FIELDS = {
    "closure_id",
    "finding_key",
    "finding_family",
    "ledger_id",
    "audit_ids",
    "source_atom_ids",
    "plan_unit_ids",
    "owner_docs",
    "consumer_docs",
    "detail_keys",
    "exact_tokens",
    "closure_status",
    "closure_evidence",
    "closure_reason",
    "hashes",
    "created_at",
    "updated_at",
    "closed_by_audit_id",
    "reopen_conditions",
}
REGISTRY_LIST_FIELDS = {
    "audit_ids",
    "source_atom_ids",
    "plan_unit_ids",
    "owner_docs",
    "consumer_docs",
    "detail_keys",
    "exact_tokens",
    "closure_evidence",
    "reopen_conditions",
}
DEFAULT_AUDIT_SOURCE_ARTIFACTS = [
    "gui_platform_currentness_findings.jsonl",
    "storage_coordination_canon_findings.jsonl",
    "platform_specs_authority_findings.jsonl",
    "filesafe_fail_closed_security_findings.jsonl",
    "semantic_risks.jsonl",
    "gui_command_wiring_gate_openref_findings.jsonl",
    "residual_feature_contract_findings.jsonl",
    "atom_fidelity_matrix.jsonl",
    "planunit_source_claims.jsonl",
    "owner_routing_findings.jsonl",
    "ledger_consistency.json",
    "validator_results.json",
]
TERMINAL_STATE = "terminal_state.json"
EFFECTIVE_STATUS = "effective_status.json"
GOVERNANCE_FILES = {
    "Plans/Spec_Lock.json",
    "Plans/auto_decisions.jsonl",
    "Plans/plan_graph.json",
    "Plans/sharding_config.json",
}
MATRIX_REQUIRED_FIELDS = {
    "source_artifact",
    "source_row",
    "finding_family",
    "audit_id",
    "ledger_id",
    "baseline_ref",
    "subject_ref",
    "observation_ref",
    "source_atom_ids",
    "plan_unit_ids",
    "owner_docs",
    "detail_keys",
    "exact_tokens",
    "finding_key",
    "closure_status",
    "closure_evidence",
    "closure_reason",
    "registry_closure_id",
}
ISO_UTC_RE = re.compile(r"^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$")
SHA256_RE = re.compile(r"^[0-9a-f]{64}$")


def rel(path: Path) -> str:
    try:
        return path.resolve().relative_to(ROOT).as_posix()
    except ValueError:
        return path.as_posix()


def repo_path(value: str) -> Path:
    path = Path(value)
    return path if path.is_absolute() else ROOT / path


def read_jsonl(path: Path, errors: list[str], *, required: bool = True) -> list[dict[str, Any]]:
    rows: list[dict[str, Any]] = []
    if not path.exists():
        if required:
            errors.append(f"missing {rel(path)}")
        return rows
    for line_no, line in enumerate(_lines(path.read_text(encoding="utf-8")), 1):
        if not line.strip():
            continue
        try:
            row = json.loads(line)
        except json.JSONDecodeError as exc:
            errors.append(f"{rel(path)}:{line_no}: invalid JSONL: {exc}")
            continue
        if not isinstance(row, dict):
            errors.append(f"{rel(path)}:{line_no}: JSONL row is not an object")
            continue
        row["_line_no"] = line_no
        rows.append(row)
    return rows


def write_jsonl(path: Path, rows: list[dict[str, Any]]) -> None:
    with path.open("w", encoding="utf-8") as handle:
        for row in rows:
            clean = {key: value for key, value in row.items() if key != "_line_no"}
            handle.write(json.dumps(clean, sort_keys=True, ensure_ascii=False))
            handle.write("\n")


def write_json(path: Path, data: Any) -> None:
    path.write_text(json.dumps(data, indent=2, sort_keys=True) + "\n", encoding="utf-8")


def utc_now() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def stable_strings(value: Any) -> list[str]:
    if value is None:
        return []
    if not isinstance(value, list):
        return [str(value)]
    return sorted({str(item) for item in value})


def audit_source_atom_ids(row: dict[str, Any]) -> Any:
    if "source_atom_ids" in row:
        return row.get("source_atom_ids")
    return row.get("atom_ids", [])


def normalized_audit_finding_row(row: dict[str, Any]) -> dict[str, Any]:
    normalized = dict(row)
    if "source_atom_ids" not in normalized and "atom_ids" in normalized:
        normalized["source_atom_ids"] = normalized.get("atom_ids", [])
    return normalized


def is_substantive_subject_path(path: str) -> bool:
    """Return true when a path belongs to the audit subject, not audit hygiene."""
    normalized = path.strip().lstrip("./")
    if not normalized:
        return False
    if normalized.startswith("Plans/.audits/"):
        return False
    if normalized.startswith("Plans/.plan_index/"):
        return True
    if normalized.startswith("Plans/_shards/"):
        return True
    if normalized.startswith("Plans/.evidence/"):
        return True
    if normalized in GOVERNANCE_FILES:
        return True
    if normalized.startswith("Plans/ledgers/v2/"):
        return True
    if normalized.startswith("Plans/") and normalized.endswith(".md"):
        return True
    if normalized.startswith("scripts/") and normalized.endswith(".py"):
        return True
    return False


def has_substantive_subject_paths(paths: list[str]) -> bool:
    return any(is_substantive_subject_path(path) for path in paths)


def compute_finding_key(row: dict[str, Any]) -> str:
    payload = {
        "finding_family": str(row.get("finding_family", "")),
        "ledger_id": str(row.get("ledger_id", "")),
        "source_atom_ids": stable_strings(row.get("source_atom_ids")),
        "plan_unit_ids": stable_strings(row.get("plan_unit_ids")),
        "owner_docs": stable_strings(row.get("owner_docs")),
        "detail_keys": stable_strings(row.get("detail_keys")),
        "exact_tokens": stable_strings(row.get("exact_tokens")),
    }
    encoded = json.dumps(payload, sort_keys=True, separators=(",", ":"), ensure_ascii=False).encode("utf-8")
    return f"sfk-{hashlib.sha256(encoded).hexdigest()[:24]}"


def compute_check_id(row: dict[str, Any]) -> str:
    payload = {
        "check_family": str(row.get("check_family", "")),
        "ledger_id": str(row.get("ledger_id", "")),
        "source_atom_ids": stable_strings(row.get("source_atom_ids")),
        "plan_unit_ids": stable_strings(row.get("plan_unit_ids")),
        "owner_docs": stable_strings(row.get("owner_docs")),
        "detail_keys": stable_strings(row.get("detail_keys")),
        "exact_tokens": stable_strings(row.get("exact_tokens")),
        "covered_artifacts": stable_strings(row.get("covered_artifacts")),
    }
    encoded = json.dumps(payload, sort_keys=True, separators=(",", ":"), ensure_ascii=False).encode("utf-8")
    return f"chk-{hashlib.sha256(encoded).hexdigest()[:24]}"


def compute_impact_id(row: dict[str, Any]) -> str:
    payload = {
        "ledger_id": str(row.get("ledger_id", "")),
        "source_artifact": str(row.get("source_artifact", "")),
        "source_row": str(row.get("source_row", "")),
        "finding_key": str(row.get("finding_key", "")),
    }
    encoded = json.dumps(payload, sort_keys=True, separators=(",", ":"), ensure_ascii=False).encode("utf-8")
    return f"imp-{hashlib.sha256(encoded).hexdigest()[:24]}"


def evidence_path_from_ref(ref: str) -> Path | None:
    token = ref.split("#", 1)[0]
    if ":" in token:
        before, after = token.rsplit(":", 1)
        before_path = ROOT / before
        if before.startswith(("Plans/", "scripts/")) and before_path.exists():
            token = before
        elif re.match(r"^\d+(?:-\d+)?$", after) or after == "no matching GoalRun/WorkNode cost owner change":
            token = before
    if token.startswith(("Plans/", "scripts/")) or token in {"AGENTS.md"}:
        return ROOT / token
    return None


def validate_evidence_refs(refs: Any, path_label: str, errors: list[str]) -> None:
    if not isinstance(refs, list) or not refs:
        errors.append(f"{path_label}: closure_evidence must be a non-empty list")
        return
    for ref in refs:
        if not isinstance(ref, str) or not ref.strip():
            errors.append(f"{path_label}: closure_evidence contains a non-string or blank ref")
            continue
        ref_path = evidence_path_from_ref(ref)
        if ref_path is not None and not ref_path.exists():
            errors.append(f"{path_label}: missing evidence ref {ref}")


def sha256_file(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


# ---------------------------------------------------------------------------
# Anchor-scoped evidence hashes (hash_scope "anchor.v1").
#
# A legacy registry row hashes every evidence file whole, so any edit anywhere in
# a cited file makes the row stale. A row whose `hashes.hash_scope` is
# ANCHOR_SCOPE instead keys its owner/closure evidence hashes by anchored refs,
# `<path>#<kind>=<value>`, and each hash covers only that anchor's content:
#
#   unit=<PlanUnit id>        the PlanUnit's YAML block in a Plans/*.md document,
#                             parsed and hashed as canonical JSON
#   section=<title>           a Markdown section: its heading line through the line
#                             before the next heading of the same or higher level;
#                             `A > B` names a heading B nested under heading A
#   json=<JSON pointer>       a subtree of a JSON document (RFC 6901), canonical JSON
#   jsonl=<field>=<value>     the one JSONL row whose field equals value, canonical JSON
#   jsonlset=<field>=<value>  every JSONL row whose field equals value or, for a list field,
#                             contains it: the sorted canonical rows (possibly none), so a
#                             new row that names the value changes the hash
#   pydef=<qualname>          a Python function, class or NAME = ... assignment source segment
#
# A ref with no anchor still hashes the whole file. Legacy rows keep whole-file
# semantics for every ref, including refs that contain '#', so their history
# reads exactly as it was written.
# ---------------------------------------------------------------------------
ANCHOR_SCOPE = "anchor.v1"
ANCHOR_KINDS = ("unit", "section", "json", "jsonl", "jsonlset", "pydef")
ANCHOR_REF_RE = re.compile(r"^(?P<path>[^#\s]+)#(?P<kind>unit|section|json|jsonlset|jsonl|pydef)=(?P<value>.+)$")
LEGACY_LINE_REF_RE = re.compile(r":\d+(?:-\d+)?$")
PLAN_UNIT_FENCE_RE = re.compile(r"```yaml\n(.*?)\n```", re.DOTALL)
PLAN_UNIT_ID_RE = re.compile(r"plan_unit_id:\s*['\"]?([A-Za-z0-9][A-Za-z0-9_.-]*)")


class AnchorError(ValueError):
    """An anchored ref is malformed, or its anchor does not resolve to exactly one target."""


def plain_json_value(value: Any, where: str = "value") -> Any:
    """The JSON data model only. YAML dates keep their str() spelling; any other type
    (sets, binary, non-string keys, NaN) raises, so no hash depends on Python reprs."""
    import datetime as _dt  # noqa: PLC0415
    import math  # noqa: PLC0415

    if value is None or isinstance(value, (bool, str)):
        return value
    if isinstance(value, int):
        return value
    if isinstance(value, float):
        if math.isnan(value) or math.isinf(value):
            raise AnchorError(f"{where}: non-finite number")
        return value
    if isinstance(value, (_dt.date, _dt.datetime)):
        return str(value)
    if isinstance(value, (list, tuple)):
        return [plain_json_value(item, where) for item in value]
    if isinstance(value, dict):
        out = {}
        for key, item in value.items():
            if not isinstance(key, str):
                raise AnchorError(f"{where}: non-string mapping key {key!r}")
            out[key] = plain_json_value(item, where)
        return out
    raise AnchorError(f"{where}: unsupported value type {type(value).__name__}")


def canonical_json(value: Any) -> str:
    return json.dumps(plain_json_value(value), sort_keys=True, separators=(",", ":"), ensure_ascii=False)


def _reject_duplicate_pairs(pairs: list[tuple[str, Any]]) -> dict[str, Any]:
    out: dict[str, Any] = {}
    for key, value in pairs:
        if key in out:
            raise AnchorError(f"duplicate JSON object key {key!r}")
        out[key] = value
    return out


def _reject_json_constant(name: str) -> Any:
    raise AnchorError(f"{name} is not JSON (non-finite numbers are a Python extension)")


def strict_json_loads(text: str) -> Any:
    """json.loads that rejects duplicate object keys instead of keeping the last one, and
    NaN/Infinity anywhere in the source, not only in the part an anchor selects."""
    return json.loads(text, object_pairs_hook=_reject_duplicate_pairs, parse_constant=_reject_json_constant)


def canonical_rel_path(value: str) -> str:
    """A repository-relative POSIX path: no absolute path, '.', '..', empty segment or backslash."""
    if not isinstance(value, str) or not value or value.startswith("/") or "\\" in value:
        raise AnchorError(f"path {value!r} must be repository-relative")
    if any(ord(ch) < 0x20 or ord(ch) == 0x7F for ch in value):
        raise AnchorError(f"path {value!r} must not contain control characters")
    parts = value.split("/")
    if any(part in {"", ".", ".."} for part in parts):
        raise AnchorError(f"path {value!r} must not contain empty, '.' or '..' segments")
    return value


def contained_path(root: Path, rel_path: str) -> Path:
    """Resolve a canonical relative path and require it to stay inside root (symlinks included)."""
    canonical_rel_path(rel_path)
    base = root.resolve()
    probe = root
    for part in rel_path.split("/"):
        probe = probe / part
        if probe.is_symlink():
            raise AnchorError(f"path {rel_path!r} goes through a symlink ({part}); evidence paths may not use symlinks")
    target = (root / rel_path).resolve()
    try:
        target.relative_to(base)
    except ValueError as exc:
        raise AnchorError(f"path {rel_path!r} resolves outside the repository") from exc
    return target


def sha256_text(text: str) -> str:
    return hashlib.sha256(text.encode("utf-8")).hexdigest()


def parse_anchor_ref(ref: str) -> tuple[str, str | None, str | None]:
    """Split an anchor.v1 ref into (path, kind, value); kind is None for a whole-file ref.

    Line-number refs (`path:12`) and unrecognised `#` fragments are legacy forms that
    anchor.v1 rows may not use, because a line number or free fragment does not say
    what content the closure depends on.
    """
    if not isinstance(ref, str) or not ref.strip() or ref != ref.strip():
        raise AnchorError(f"anchored ref must be a non-blank string without surrounding space: {ref!r}")
    match = ANCHOR_REF_RE.match(ref)
    if match:
        return match.group("path"), match.group("kind"), match.group("value")
    if "#" in ref:
        raise AnchorError(f"unknown anchor in {ref!r}; use one of {', '.join(k + '=' for k in ANCHOR_KINDS)}")
    if LEGACY_LINE_REF_RE.search(ref):
        raise AnchorError(f"line-number ref {ref!r} is not allowed in {ANCHOR_SCOPE} rows; anchor the content instead")
    return ref, None, None


def _normalized_text_bytes(data: bytes) -> str:
    text = data.decode("utf-8")
    if "\r" in text:
        text = text.replace("\r\n", "\n").replace("\r", "\n")
    return text


def _lines(text: str) -> list[str]:
    """Split on LF only. str.splitlines() also splits U+2028, U+0085, VT and FF, which can sit
    inside string literals and JSON strings, so it would misalign Python AST line numbers."""
    lines = text.split("\n")
    if lines and lines[-1] == "":
        lines.pop()
    return lines


def markdown_headings(lines: list[str]) -> list[dict[str, Any]]:
    """ATX headings at the document's top level, as a CommonMark parser (markdown-it-py) reads
    the block structure, used as section boundaries.

    A false boundary would end a section early and leave text outside its hash, so boundaries
    come from a real CommonMark parse: nothing inside fenced or indented code, HTML blocks, block
    quotes or list items is a boundary. Setext headings are deliberately not boundaries; treating
    them as text only makes a section longer. Without markdown-it-py section anchors are refused."""
    try:
        from markdown_it import MarkdownIt  # noqa: PLC0415 - only section anchors need it.
    except ImportError as exc:  # pragma: no cover - environment dependent
        raise AnchorError("section anchors need markdown-it-py (Debian/Ubuntu: python3-markdown-it)") from exc
    tokens = MarkdownIt("commonmark").parse("\n".join(lines) + "\n")
    headings: list[dict[str, Any]] = []
    for position, token in enumerate(tokens):
        if token.type == "heading_open" and token.level == 0 and token.map and token.markup.startswith("#"):
            title = tokens[position + 1].content.strip() if position + 1 < len(tokens) else ""
            headings.append({"index": token.map[0], "level": int(token.tag[1]), "title": title})
    return headings


def _section_end(headings: list[dict[str, Any]], position: int, line_count: int) -> int:
    level = headings[position]["level"]
    for later in headings[position + 1:]:
        if later["level"] <= level:
            return later["index"]
    return line_count


_UNIQUE_YAML_LOADER: Any = None


def _yaml_module() -> Any:
    import yaml  # noqa: PLC0415 - only anchor.v1 unit anchors need PyYAML.

    return yaml


def _unique_key_yaml_loader() -> Any:
    """SafeLoader that rejects duplicate mapping keys, as pm-plan-index.py's UniqueKeySafeLoader does."""
    global _UNIQUE_YAML_LOADER  # noqa: PLW0603
    if _UNIQUE_YAML_LOADER is None:
        yaml = _yaml_module()

        class UniqueKeySafeLoader(yaml.SafeLoader):
            pass

        def construct_mapping(loader: Any, node: Any, deep: bool = False) -> dict[Any, Any]:
            mapping: dict[Any, Any] = {}
            for key_node, value_node in node.value:
                key = loader.construct_object(key_node, deep=deep)
                if key in mapping:
                    raise yaml.constructor.ConstructorError(
                        "while constructing a mapping", node.start_mark, f"found duplicate key: {key}", key_node.start_mark
                    )
                mapping[key] = loader.construct_object(value_node, deep=deep)
            return mapping

        UniqueKeySafeLoader.add_constructor(yaml.resolver.BaseResolver.DEFAULT_MAPPING_TAG, construct_mapping)
        _UNIQUE_YAML_LOADER = UniqueKeySafeLoader
    return _UNIQUE_YAML_LOADER


class AnchorResolver:
    """Resolves anchored refs against one repository root, caching each parsed file."""

    def __init__(self, root: Path | None = None) -> None:
        self.root = root or ROOT
        self._text: dict[str, str] = {}
        self._units: dict[str, dict[str, list[Any]]] = {}
        self._json: dict[str, Any] = {}
        self._jsonl: dict[str, list[dict[str, Any]]] = {}
        self._unit_errors: dict[str, str] = {}
        self._headings: dict[str, list[dict[str, Any]]] = {}

    def path(self, rel_path: str) -> Path:
        path = contained_path(self.root, rel_path)
        if not path.is_file():
            raise AnchorError(f"anchored file is missing: {rel_path}")
        return path

    def read_bytes(self, rel_path: str) -> bytes:
        return self.path(rel_path).read_bytes()

    def is_dir(self, rel_path: str) -> bool:
        try:
            return contained_path(self.root, rel_path).is_dir()
        except AnchorError:
            return False

    def text(self, rel_path: str) -> str:
        if rel_path not in self._text:
            self._text[rel_path] = _normalized_text_bytes(self.read_bytes(rel_path))
        return self._text[rel_path]

    def units(self, rel_path: str) -> dict[str, list[Any]]:
        """PlanUnit YAML blocks keyed by plan_unit_id, read the way pm-plan-index.py reads them:
        every ```yaml fence that mentions plan_unit_id, parsed with PyYAML's pure SafeLoader
        (libyaml's CSafeLoader reads some flow scalars differently)."""
        if rel_path not in self._units:
            yaml = _yaml_module()
            found: dict[str, list[Any]] = {}
            for match in PLAN_UNIT_FENCE_RE.finditer(self.text(rel_path)):
                block = match.group(1)
                if "plan_unit_id:" not in block:
                    continue
                try:
                    data = yaml.load(block, Loader=_unique_key_yaml_loader())
                except Exception as exc:  # noqa: BLE001 - reported as an anchor failure.
                    # A block that does not parse cannot be assigned to one PlanUnit with any
                    # confidence (duplicate or folded plan_unit_id keys), so every unit anchor in
                    # this document fails until the document parses, as pm-plan-index.py fails it.
                    self._unit_errors.setdefault(rel_path, f"{rel_path} has a PlanUnit block that does not parse: {exc}")
                    continue
                if isinstance(data, dict) and data.get("plan_unit_id"):
                    found.setdefault(str(data["plan_unit_id"]), []).append(data)
            self._units[rel_path] = found
        return self._units[rel_path]

    def json_doc(self, rel_path: str) -> Any:
        if rel_path not in self._json:
            try:
                self._json[rel_path] = strict_json_loads(self.text(rel_path))
            except json.JSONDecodeError as exc:
                raise AnchorError(f"{rel_path} is not valid JSON: {exc}") from exc
        return self._json[rel_path]

    def jsonl_rows(self, rel_path: str) -> list[dict[str, Any]]:
        if rel_path not in self._jsonl:
            rows: list[dict[str, Any]] = []
            for line_no, line in enumerate(_lines(self.text(rel_path)), 1):
                if not line.strip():
                    continue
                try:
                    row = strict_json_loads(line)
                except (json.JSONDecodeError, AnchorError) as exc:
                    raise AnchorError(f"{rel_path}:{line_no} is not valid JSON: {exc}") from exc
                if isinstance(row, dict):
                    rows.append(row)
            self._jsonl[rel_path] = rows
        return self._jsonl[rel_path]

    def content(self, ref: str) -> tuple[str, str]:
        """Return (canonical content, plain text view) of an anchored ref.

        The canonical content is what the anchor hash covers. The plain text view is
        what evidence quotes are checked against: the readable strings of the anchor.
        """
        rel_path, kind, value = parse_anchor_ref(ref)
        if kind is None:
            data = self.read_bytes(rel_path)
            try:
                text = data.decode("utf-8")
            except UnicodeDecodeError:
                text = ""
            return text, text
        assert value is not None
        if kind == "unit":
            matches = self.units(rel_path).get(value, [])
            if rel_path in self._unit_errors:
                raise AnchorError(f"{ref}: {self._unit_errors[rel_path]}")
            if len(matches) != 1:
                raise AnchorError(f"{ref}: PlanUnit {value} occurs {len(matches)} times in {rel_path}; expected exactly 1")
            data = matches[0]
            if isinstance(data, AnchorError):
                raise data
            return canonical_json(data), "\n".join(_strings(data))
        if kind == "section":
            return self._section(ref, rel_path, value)
        if kind == "json":
            node = _json_pointer(self.json_doc(rel_path), value, ref)
            return canonical_json(node), "\n".join(_strings(node, keys=True))
        if kind == "jsonl":
            field, sep, wanted = value.partition("=")
            if not sep or not field:
                raise AnchorError(f"{ref}: jsonl anchors read jsonl=<field>=<value>")
            hits = [row for row in self.jsonl_rows(rel_path) if field in row and str(row[field]) == wanted]
            if len(hits) != 1:
                raise AnchorError(f"{ref}: {len(hits)} rows of {rel_path} have {field}={wanted}; expected exactly 1")
            return canonical_json(hits[0]), "\n".join(_strings(hits[0], keys=True))
        if kind == "jsonlset":
            field, sep, wanted = value.partition("=")
            if not sep or not field:
                raise AnchorError(f"{ref}: jsonlset anchors read jsonlset=<field>=<value>")
            hits = []
            for row in self.jsonl_rows(rel_path):
                got = row.get(field)
                if (isinstance(got, list) and wanted in [str(item) for item in got]) or (
                    field in row and not isinstance(got, (list, dict)) and str(got) == wanted
                ):
                    hits.append(canonical_json(row))
            hits.sort()
            return "[" + ",".join(hits) + "]", "\n".join(hits)
        if kind == "pydef":
            segment = _python_segment(self.text(rel_path), value, ref)
            return segment, segment
        raise AnchorError(f"{ref}: unknown anchor kind {kind}")  # pragma: no cover - regex limits kinds

    def _section(self, ref: str, rel_path: str, value: str) -> tuple[str, str]:
        lines = _lines(self.text(rel_path))
        if rel_path not in self._headings:
            self._headings[rel_path] = markdown_headings(lines)
        headings = self._headings[rel_path]
        path_titles = [part.strip() for part in value.split(" > ")]
        if any(not part for part in path_titles):
            raise AnchorError(f"{ref}: blank heading title in section path")
        candidates = list(range(len(headings)))
        lower, upper = 0, len(lines)
        chosen: int | None = None
        for depth, title in enumerate(path_titles):
            hits = [
                pos for pos in candidates
                if headings[pos]["title"] == title and lower <= headings[pos]["index"] < upper
                and (chosen is None or headings[pos]["level"] > headings[chosen]["level"])
            ]
            if len(hits) != 1:
                where = f" under {' > '.join(path_titles[:depth])!r}" if depth else ""
                raise AnchorError(f"{ref}: heading {title!r}{where} occurs {len(hits)} times in {rel_path}; expected exactly 1")
            chosen = hits[0]
            lower, upper = headings[chosen]["index"], _section_end(headings, chosen, len(lines))
        block = list(lines[lower:upper])
        while block and not block[-1].strip():
            block.pop()
        content = "\n".join(block)
        return content, content

    def sha256(self, ref: str) -> str:
        rel_path, kind, _ = parse_anchor_ref(ref)
        if kind is None:
            return hashlib.sha256(self.read_bytes(rel_path)).hexdigest()
        return sha256_text(self.content(ref)[0])


class CommitResolver(AnchorResolver):
    """Resolves anchored refs against the files of one git commit of the repository at root.

    Used to verify a re-audit against the text it actually read: its recheck snapshot, its
    stale refs and its quotes are recomputed at its recheck_commit."""

    def __init__(self, root: Path, commit: str) -> None:
        super().__init__(root)
        self.commit = commit
        self._blobs: dict[str, bytes] = {}

    def _git(self, *args: str) -> bytes:
        import subprocess  # noqa: PLC0415

        proc = subprocess.run(["git", "-C", str(self.root), *args], capture_output=True)
        if proc.returncode != 0:
            raise AnchorError(f"git {' '.join(args[:2])} failed at {self.commit[:12]}: {proc.stderr.decode(errors='replace').strip()[:200]}")
        return proc.stdout

    def available(self) -> bool:
        try:
            self._git("cat-file", "-e", f"{self.commit}^{{commit}}")
            return True
        except AnchorError:
            return False

    def path(self, rel_path: str) -> Path:  # pragma: no cover - commit reads never touch the tree
        raise AnchorError("CommitResolver reads git objects, not paths")

    def is_dir(self, rel_path: str) -> bool:
        try:
            canonical_rel_path(rel_path)
            listing = self._git("ls-tree", "-z", self.commit, "--", rel_path).split(b"\0")
        except AnchorError:
            return False
        entry = next((item for item in listing if item.endswith(b"\t" + rel_path.encode())), None)
        return entry is not None and entry.split(b"\t", 1)[0].split(b" ")[1] == b"tree"

    def read_bytes(self, rel_path: str) -> bytes:
        canonical_rel_path(rel_path)
        if rel_path not in self._blobs:
            listing = self._git("ls-tree", "-z", self.commit, "--", rel_path).split(b"\0")
            entry = next((item for item in listing if item.endswith(b"\t" + rel_path.encode())), None)
            if entry is None:
                raise AnchorError(f"{rel_path} does not exist at {self.commit[:12]}")
            mode, kind, _ = entry.split(b"\t", 1)[0].split(b" ")
            if kind != b"blob" or mode == b"120000":
                raise AnchorError(f"{rel_path} at {self.commit[:12]} is not a regular file")
            self._blobs[rel_path] = self._git("cat-file", "blob", f"{self.commit}:{rel_path}")
        return self._blobs[rel_path]


def _strings(value: Any, *, keys: bool = False) -> list[str]:
    out: list[str] = []
    if isinstance(value, dict):
        for key in sorted(value, key=str):
            if keys:
                out.append(str(key))
            out.extend(_strings(value[key], keys=keys))
    elif isinstance(value, list):
        for item in value:
            out.extend(_strings(item, keys=keys))
    elif value is not None:
        out.append(str(value))
    return out


def _json_pointer(doc: Any, pointer: str, ref: str) -> Any:
    """RFC 6901 pointer, strictly: '~' only as ~0 or ~1, array indexes without leading zeros.
    The empty (whole-document) pointer is not an anchor; anchor the subtree the claim needs."""
    if not pointer.startswith("/"):
        raise AnchorError(f"{ref}: a JSON pointer starts with '/'")
    node = doc
    for raw in pointer[1:].split("/"):
        if re.search(r"~(?![01])", raw):
            raise AnchorError(f"{ref}: invalid '~' escape in pointer segment {raw!r}")
        token = raw.replace("~1", "/").replace("~0", "~")
        if isinstance(node, dict):
            if token not in node:
                raise AnchorError(f"{ref}: JSON pointer segment {token!r} does not resolve")
            node = node[token]
        elif isinstance(node, list):
            if not re.fullmatch(r"0|[1-9][0-9]*", token) or int(token) >= len(node):
                raise AnchorError(f"{ref}: array index {token!r} is not a valid index")
            node = node[int(token)]
        else:
            raise AnchorError(f"{ref}: JSON pointer segment {token!r} does not resolve")
    return node


def _mangle(name: str, class_name: str | None) -> str:
    """Python's private-name mangling: inside class C, __x (not ending in __) is _C__x."""
    if not class_name or not name.startswith("__") or name.endswith("__") or "." in name:
        return name
    stripped = class_name.lstrip("_")
    return f"_{stripped}{name}" if stripped else name


@functools.lru_cache(maxsize=16)
def _symtable_for(source: str) -> Any:
    import symtable  # noqa: PLC0415

    return symtable.symtable(source, "<pydef>", "exec")


def _symtable_ownership(source: str, qualname: str, ref: str) -> None:
    """Independent check with the compiler's own symbol table, which applies name mangling and
    global/nonlocal exactly as Python does. Every qualname component must be a name the scope it
    is looked up in binds itself (not declared global or nonlocal there), and no class body that
    runs with that scope may rebind it through a global (module target) or nonlocal (function
    target) declaration. Anything it cannot establish is refused."""
    def kind(table: Any) -> str:
        value = table.get_type()
        return str(getattr(value, "value", value))

    def eager_classes(table: Any) -> list[Any]:
        out: list[Any] = []
        for child in table.get_children():
            if kind(child) == "class":
                out.append(child)
                out.extend(eager_classes(child))
        return out

    try:
        table = _symtable_for(source)
    except (SyntaxError, ValueError) as exc:
        raise AnchorError(f"{ref}: source does not compile: {exc}") from exc
    class_name: str | None = None
    parts = qualname.split(".")
    for index, part in enumerate(parts):
        try:
            symbol = table.lookup(part)
        except KeyError:
            raise AnchorError(f"{ref}: {part!r} is not a name of the scope it is looked up in") from None
        scope = kind(table)
        if scope in ("class", "function") and (symbol.is_declared_global() or symbol.is_nonlocal()):
            raise AnchorError(f"{ref}: {part!r} is declared global or nonlocal in that scope, so its definition does not belong to it")
        if not symbol.is_assigned():
            raise AnchorError(f"{ref}: {part!r} is not bound in the scope it is looked up in")
        if scope in ("module", "function"):
            for child in eager_classes(table):
                try:
                    other = child.lookup(part)
                except KeyError:
                    continue
                redirected = other.is_declared_global() if scope == "module" else other.is_nonlocal()
                if redirected and other.is_assigned():
                    raise AnchorError(f"{ref}: class {child.get_name()!r} rebinds {part!r} through a {'global' if scope == 'module' else 'nonlocal'} declaration")
        if index == len(parts) - 1:
            return
        matches = [child for child in table.get_children()
                   if kind(child) in ("class", "function") and _mangle(child.get_name(), class_name) == part]
        if len(matches) != 1:
            raise AnchorError(f"{ref}: {part!r} names {len(matches)} class or function scopes there; expected exactly 1")
        table = matches[0]
        if kind(table) == "class":
            class_name = table.get_name()


def _python_segment(source: str, qualname: str, ref: str) -> str:
    """The source segment of the definition `qualname` names, refused unless the name is bound
    exactly once where it is looked up.

    Binding model (what can change which object the name refers to without changing the
    segment): everything that runs eagerly in the owning scope counts. That is every binding,
    rebinding or deletion of the name at any block depth, walrus targets (also in
    comprehensions), match captures, except/with/for targets, imports (a star import counts as
    rebinding every name), type aliases, decorators, defaults and class bases evaluated there,
    and class bodies (which run when the class is defined) that declare the name global (for a
    module target) or nonlocal (for a function target). A qualified component is refused when
    the body it is looked up in declares it global or nonlocal. Function and lambda bodies run
    later, if at all, and reflective mutation (exec, globals(), setattr) is not code structure:
    both are outside the anchor's contract. Special names (double underscores on both sides, such
    as __init__, __doc__ or __annotate_func__) are not anchorable: the interpreter and compiler
    bind some of them implicitly (Python 3.14 stores __annotate_func__ in any class with
    annotations), which no source-level count can see. Names are compared after Python's private-name
    mangling, and the compiler's symbol table independently confirms ownership
    (_symtable_ownership); the anchor is refused when either check fails.
    """
    import ast  # noqa: PLC0415 - only pydef anchors need ast.

    try:
        tree = ast.parse(source)
    except SyntaxError as exc:
        raise AnchorError(f"{ref}: source does not parse: {exc}") from exc
    def target_names(target: ast.AST) -> list[str]:
        if isinstance(target, ast.Name):
            return [target.id]
        if isinstance(target, (ast.Tuple, ast.List)):
            return [name for item in target.elts for name in target_names(item)]
        if isinstance(target, ast.Starred):
            return target_names(target.value)
        return []

    def pattern_names(pattern: ast.AST) -> list[str]:
        out: list[str] = []
        for sub in ast.walk(pattern):
            if type(sub).__name__ in ("MatchAs", "MatchStar") and getattr(sub, "name", None):
                out.append(sub.name)
            elif type(sub).__name__ == "MatchMapping" and getattr(sub, "rest", None):
                out.append(sub.rest)
        return out

    def bound_names(node: ast.AST) -> list[str]:
        """Names one node binds, deletes or rebinds in the scope it belongs to."""
        if isinstance(node, ast.Assign):
            return [n for t in node.targets for n in target_names(t)]
        if isinstance(node, (ast.AnnAssign, ast.AugAssign, ast.For, ast.AsyncFor)):
            return target_names(node.target)
        if isinstance(node, (ast.Import, ast.ImportFrom)):
            if any(alias.name == "*" for alias in node.names):
                return ["*"]  # a star import may rebind any name of this scope
            return [(alias.asname or alias.name).split(".")[0] for alias in node.names]
        if isinstance(node, (ast.With, ast.AsyncWith)):
            return [n for w in node.items if w.optional_vars is not None for n in target_names(w.optional_vars)]
        if isinstance(node, ast.ExceptHandler):
            return [node.name] if node.name else []
        if isinstance(node, ast.NamedExpr):
            return target_names(node.target)
        if isinstance(node, ast.Delete):
            return [n for t in node.targets for n in target_names(t)]
        if type(node).__name__ == "match_case":
            return pattern_names(node.pattern)  # type: ignore[attr-defined]
        if type(node).__name__ == "TypeAlias":
            return target_names(node.name)  # type: ignore[attr-defined]
        return []

    def declares(statements: list[ast.stmt], name: str, kind: type, cls: str | None = None) -> bool:
        """Whether a class body declares `name` global/nonlocal (blocks included, nested
        function and lambda bodies excluded: they run later, if at all)."""
        stack: list[ast.AST] = list(statements)
        while stack:
            item = stack.pop()
            if isinstance(item, kind) and name in {_mangle(n, cls) for n in item.names}:  # type: ignore[attr-defined]
                return True
            if isinstance(item, (ast.FunctionDef, ast.AsyncFunctionDef, ast.ClassDef, ast.Lambda)):
                continue
            stack.extend(ast.iter_child_nodes(item))
        return False

    def bindings(statements: list[ast.stmt], name: str, target_kind: str = "module", collect: bool = True,
                 cls: str | None = None) -> list[ast.AST]:
        """Every node that binds, rebinds or deletes `name` in this lexical scope: definitions,
        assignments, imports, loop/with/except targets, walrus targets (including inside
        comprehensions, which bind in the enclosing scope), match captures, del and type
        aliases, at any depth of if/try/with/for/while/match blocks. Nested function and lambda
        bodies are their own scopes and run later, if at all; they are not searched. A class body
        runs when the class is defined: if it declares the name `global` (module target) or
        `nonlocal` (function target), its bindings of the name count here; nested class bodies run
        with it and follow the same rule. With collect=False only nested class bodies are searched."""
        found: list[ast.AST] = []
        stack: list[ast.AST] = list(statements)
        while stack:
            item = stack.pop()
            if isinstance(item, ast.ClassDef):
                if collect:
                    if _mangle(item.name, cls) == name:
                        found.append(item)
                    # Decorators, bases and keywords are evaluated in this scope.
                    stack.extend(item.decorator_list)
                    stack.extend(item.bases)
                    stack.extend(k.value for k in item.keywords)
                declaration = {"module": ast.Global, "function": ast.Nonlocal}.get(target_kind)
                if declaration is not None:
                    found.extend(bindings(item.body, name, target_kind, collect=declares(item.body, name, declaration, item.name),
                                          cls=item.name))
                continue
            if isinstance(item, (ast.FunctionDef, ast.AsyncFunctionDef)):
                if collect:
                    if _mangle(item.name, cls) == name:
                        found.append(item)
                    stack.extend(item.decorator_list)
                    stack.extend(item.args.defaults)
                    stack.extend(d for d in item.args.kw_defaults if d is not None)
                continue
            if isinstance(item, ast.Lambda):
                if collect:
                    stack.extend(item.args.defaults)
                    stack.extend(d for d in item.args.kw_defaults if d is not None)
                continue
            if collect and ({name, "*"} & {_mangle(n, cls) for n in bound_names(item)}):
                found.append(item)
            stack.extend(ast.iter_child_nodes(item))
        return found

    for part in qualname.split("."):
        if len(part) > 4 and part.startswith("__") and part.endswith("__"):
            raise AnchorError(f"{ref}: {part!r} is a special name the interpreter may bind implicitly; anchor an ordinary definition")
    _symtable_ownership(source, qualname, ref)
    scope: list[ast.stmt] = list(tree.body)
    scope_kind = "module"
    class_ctx: str | None = None
    node: ast.AST | None = None
    for part in qualname.split("."):
        # Inside a class or function body, a global/nonlocal declaration of the name moves its
        # definition out of that body, so the component would not name what the source runs.
        if scope_kind in ("class", "function") and (declares(scope, part, ast.Global, class_ctx)
                                                   or declares(scope, part, ast.Nonlocal, class_ctx)):
            raise AnchorError(f"{ref}: {part!r} is declared global or nonlocal in that scope, so its definition does not belong to it")
        hits = bindings(scope, part, scope_kind, cls=class_ctx)
        if len(hits) != 1:
            raise AnchorError(f"{ref}: {part!r} is bound {len(hits)} times in that scope (control-flow blocks included); expected exactly 1")
        node = hits[0]
        if not isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef, ast.ClassDef, ast.Assign, ast.AnnAssign)) \
                or node not in scope:
            raise AnchorError(f"{ref}: {part!r} is not a plain definition or assignment at that level")
        scope = list(getattr(node, "body", []))
        scope_kind = "class" if isinstance(node, ast.ClassDef) else "function"
        if isinstance(node, ast.ClassDef):
            class_ctx = node.name
    assert node is not None
    lines = _lines(source)
    start = min([node.lineno] + [d.lineno for d in getattr(node, "decorator_list", [])]) - 1
    end = getattr(node, "end_lineno", None) or len(lines)
    return "\n".join(lines[start:end])


def quote_view(text: str) -> str:
    """Whitespace-insensitive view used to match evidence quotes across line wraps."""
    return " ".join(text.split())


def validate_current_hashes(
    hash_group: Any, group_name: str, path_label: str, errors: list[str], stale: list[str] | None = None
) -> None:
    """Whole-file hash check for legacy rows. Staleness goes to `stale` when given, so a
    later re-audit row can supersede it; malformed entries always go to `errors`."""
    stale_out = errors if stale is None else stale
    if not isinstance(hash_group, dict):
        return
    for ref, stored_hash in sorted(hash_group.items()):
        if not isinstance(ref, str) or not isinstance(stored_hash, str):
            errors.append(f"{path_label}: {group_name} entries must map string refs to string sha256 hashes")
            continue
        ref_path = evidence_path_from_ref(ref)
        if ref_path is None:
            continue
        if not ref_path.exists():
            stale_out.append(f"{path_label}: {group_name} hash ref is missing: {ref}")
            continue
        if not ref_path.is_file():
            continue
        current_hash = sha256_file(ref_path)
        if stored_hash != current_hash:
            stale_out.append(
                f"{path_label}: {group_name} for {ref} is stale "
                f"(stored {stored_hash}, current {current_hash})"
            )


DERIVED_ANCHOR_PREFIXES = ("Plans/.plan_index/", "Plans/_shards/", "Plans/.evidence/")
WHOLE_FILE_ANCHOR_PREFIXES = ("Plans/.audits/",)


def anchor_ref_problem(ref: str) -> str | None:
    """Why `ref` may not be used as an anchor.v1 evidence ref, or None when it may.
    The derived and whole-file rules apply to the canonical relative path."""
    try:
        path, kind, _ = parse_anchor_ref(ref)
        canonical_rel_path(path)
    except AnchorError as exc:
        return str(exc)
    if path.startswith(DERIVED_ANCHOR_PREFIXES):
        return f"{ref} is a derived artifact; anchor the owner source it is generated from"
    if kind is None and not path.startswith(WHOLE_FILE_ANCHOR_PREFIXES):
        return f"{ref} hashes a whole file; anchor.v1 rows hash a unit, section, pointer, row or definition"
    return None


def validate_anchor_hashes(
    hash_group: Any, group_name: str, path_label: str, errors: list[str], stale: list[str], resolver: "AnchorResolver"
) -> None:
    """anchor.v1 hash check: each hash covers only its anchor's content."""
    if hash_group is None:
        return
    if not isinstance(hash_group, dict):
        errors.append(f"{path_label}: {group_name} must be an object")
        return
    for ref, stored_hash in sorted(hash_group.items()):
        if not isinstance(ref, str) or not isinstance(stored_hash, str):
            errors.append(f"{path_label}: {group_name} entries must map string refs to string sha256 hashes")
            continue
        problem = anchor_ref_problem(ref)
        if problem:
            errors.append(f"{path_label}: {group_name} {problem}")
            continue
        try:
            current_hash = resolver.sha256(ref)
        except AnchorError as exc:
            stale.append(f"{path_label}: {group_name} anchor {ref} no longer resolves: {exc}")
            continue
        if stored_hash != current_hash:
            stale.append(
                f"{path_label}: {group_name} for {ref} is stale "
                f"(stored {stored_hash}, current {current_hash})"
            )


def refresh_current_hashes(hash_group: Any) -> tuple[int, list[str]]:
    if not isinstance(hash_group, dict):
        return 0, []
    updated = 0
    missing: list[str] = []
    for ref, stored_hash in sorted(list(hash_group.items())):
        if not isinstance(ref, str) or not isinstance(stored_hash, str):
            continue
        ref_path = evidence_path_from_ref(ref)
        if ref_path is None:
            continue
        if not ref_path.exists():
            missing.append(ref)
            continue
        if not ref_path.is_file():
            continue
        current_hash = sha256_file(ref_path)
        if stored_hash != current_hash:
            hash_group[ref] = current_hash
            updated += 1
    return updated, missing


def validate_hashes(
    hashes: Any,
    path_label: str,
    errors: list[str],
    stale: list[str] | None = None,
    resolver: "AnchorResolver | None" = None,
) -> None:
    if not isinstance(hashes, dict):
        errors.append(f"{path_label}: hashes must be an object")
        return
    if not any(
        hashes.get(key)
        for key in ("source_atom_hashes", "plan_unit_hashes", "owner_evidence_hashes", "closure_evidence_hashes")
    ):
        errors.append(
            f"{path_label}: hashes must include source_atom_hashes, plan_unit_hashes, "
            "owner_evidence_hashes, or closure_evidence_hashes"
        )
    scope = hashes.get("hash_scope")
    if scope is None:
        validate_current_hashes(hashes.get("owner_evidence_hashes"), "owner_evidence_hashes", path_label, errors, stale)
        validate_current_hashes(hashes.get("closure_evidence_hashes"), "closure_evidence_hashes", path_label, errors, stale)
        return
    if scope != ANCHOR_SCOPE:
        errors.append(f"{path_label}: unknown hashes.hash_scope {scope!r}; expected {ANCHOR_SCOPE} or none")
        return
    resolver = resolver or AnchorResolver()
    stale_out = errors if stale is None else stale
    if not hashes.get("owner_evidence_hashes") and not hashes.get("closure_evidence_hashes"):
        errors.append(f"{path_label}: {ANCHOR_SCOPE} rows need owner_evidence_hashes or closure_evidence_hashes")
    validate_anchor_hashes(hashes.get("owner_evidence_hashes"), "owner_evidence_hashes", path_label, errors, stale_out, resolver)
    validate_anchor_hashes(hashes.get("closure_evidence_hashes"), "closure_evidence_hashes", path_label, errors, stale_out, resolver)


def validate_reopened_proof(row: dict[str, Any], prior_closed: list[dict[str, Any]], path_label: str, errors: list[str]) -> None:
    if not prior_closed:
        errors.append(f"{path_label}: reopened row requires a prior closed row with the same finding_key")
    hashes = row.get("hashes")
    if not isinstance(hashes, dict):
        errors.append(f"{path_label}: reopened row hashes must be an object")
        return
    reaudit = row.get("reaudit")
    if isinstance(reaudit, dict) and reaudit.get("outcome") == "not_supported":
        # A re-audit reopens on what it read, not on a hash change; validate_reaudit_row
        # checks the record, its three not_supported verdicts and the superseded row.
        return
    reopen_changes = hashes.get("reopen_hash_changes")
    if reopen_changes is not None:
        # Each entry must show a real change: previous and current SHA-256 values that differ.
        # A non-empty object alone proves nothing (closure re-audit 2026-11-04, batch B01).
        if not isinstance(reopen_changes, dict) or not reopen_changes:
            errors.append(f"{path_label}: reopen_hash_changes must be a non-empty object of ref -> previous/current")
            return
        for ref, change in sorted(reopen_changes.items()):
            previous = change.get("previous") if isinstance(change, dict) else None
            current = change.get("current") if isinstance(change, dict) else None
            if not (isinstance(previous, str) and SHA256_RE.match(previous) and isinstance(current, str) and SHA256_RE.match(current)):
                errors.append(f"{path_label}: reopen_hash_changes[{ref}] needs previous and current SHA-256 values")
            elif previous == current:
                errors.append(f"{path_label}: reopen_hash_changes[{ref}] shows no change (previous equals current)")
        return
    paired_fields = (
        ("previous_source_atom_hashes", "source_atom_hashes"),
        ("previous_plan_unit_hashes", "plan_unit_hashes"),
        ("previous_owner_evidence_hashes", "owner_evidence_hashes"),
        ("previous_closure_evidence_hashes", "closure_evidence_hashes"),
    )
    if not any(
        hashes.get(previous) and hashes.get(current) and hashes.get(previous) != hashes.get(current)
        for previous, current in paired_fields
    ):
        errors.append(
            f"{path_label}: reopened row must prove changed source/PlanUnit/owner/closure hashes "
            "with reopen_hash_changes or previous/current hash pairs"
        )


# ---------------------------------------------------------------------------
# Re-audit rows. The registry is append-only: a row is never rewritten or restamped
# (DL-039). A re-audit appends one row per closure it rechecked. That row names the
# row it supersedes by closure_id, line and the SHA-256 of that row's exact JSONL
# line, and binds a per-row re-audit record by path and canonical SHA-256. The record
# carries the claim, the anchors the closure depends on, verbatim evidence quotes and
# the verdicts of the worker and both blind reviewers. Only such a row can turn the
# superseded row's stale hashes from errors into history; a `not_supported` verdict
# appends a `reopened` row, which stays open.
# ---------------------------------------------------------------------------
REAUDIT_RECORD_SCHEMA = "pm.audit_closure.reaudit_record.v1"
REAUDIT_VERDICTS = {"supported", "resolved_differently", "superseded_by_later_closure", "not_supported"}
REAUDIT_REVIEWERS = ("worker", "sol", "astra")
REAUDIT_MIN_QUOTE = 12
REAUDIT_WORKER_FIELDS = ("verdict", "claim", "dependencies", "evidence", "stale_ref_dispositions", "rationale", "fix")


def raw_registry_lines(registry_path: Path) -> dict[int, str]:
    if not registry_path.exists():
        return {}
    return {n: line for n, line in enumerate(_lines(registry_path.read_text(encoding="utf-8")), 1)}


def packet_row_digest(row: dict[str, Any]) -> str:
    """Digest of one review packet row: SHA-256 of its canonical JSON without its own
    packet_row_digest field. It covers the claim, the superseded row's digest, the recheck
    commit and every anchor's hash and text the reviewer was shown; the reviewer's output
    echoes it, which binds the verdict to exactly that packet row."""
    return sha256_text(canonical_json({k: v for k, v in row.items() if k != "packet_row_digest"}))


def reaudit_record_sha256(record: dict[str, Any]) -> str:
    return sha256_text(canonical_json(record))


def load_reaudit_records(path: Path, errors: list[str], cache: dict[str, dict[str, Any]]) -> dict[str, Any] | None:
    key = str(path)
    if key not in cache:
        records: dict[str, Any] = {}
        if not path.is_file():
            cache[key] = {"missing": True, "records": records}
        else:
            for line_no, line in enumerate(_lines(path.read_text(encoding="utf-8")), 1):
                if not line.strip():
                    continue
                try:
                    record = strict_json_loads(line)
                except (json.JSONDecodeError, AnchorError) as exc:
                    errors.append(f"{rel(path)}:{line_no}: invalid re-audit record JSON: {exc}")
                    continue
                if not isinstance(record, dict):
                    errors.append(f"{rel(path)}:{line_no}: re-audit record is not an object")
                    continue
                rid = str(record.get("closure_id", ""))
                if rid in records:
                    errors.append(f"{rel(path)}:{line_no}: duplicate re-audit record for {rid}")
                records[rid] = record
            cache[key] = {"missing": False, "records": records}
    entry = cache[key]
    return None if entry["missing"] else entry["records"]


def _is_sha256(value: Any) -> bool:
    return isinstance(value, str) and bool(SHA256_RE.match(value))


def _jsonl_row_for(path: Path, line: int, closure_id: str) -> dict[str, Any] | None:
    """The one row of a review or worker output file that judges registry line `line`."""
    found = None
    for raw in _lines(path.read_text(encoding="utf-8")):
        if not raw.strip():
            continue
        try:
            item = strict_json_loads(raw)
        except (json.JSONDecodeError, AnchorError):
            return None
        if isinstance(item, dict) and item.get("line") == line and item.get("closure_id") == closure_id:
            if found is not None:
                return None
            found = item
    return found


def _target_stale_refs(target: dict[str, Any], resolver: AnchorResolver) -> set[tuple[str, str, str]]:
    """(group, ref, stored) for each evidence ref of `target` whose content differs at `resolver`:
    whole-file hashes for legacy rows, anchor hashes for anchor.v1 rows. Evidence that is
    missing or no longer resolves there counts as differing: the ordinary hash check reports
    it, so a re-audit that retires that report has to account for it too. Refs the ordinary
    check never hashes (no repository path, or a directory) are left out, as it leaves them."""
    hashes = target.get("hashes") if isinstance(target.get("hashes"), dict) else {}
    anchored = hashes.get("hash_scope") == ANCHOR_SCOPE
    out: set[tuple[str, str, str]] = set()
    for group in ("owner_evidence_hashes", "closure_evidence_hashes"):
        group_hashes = hashes.get(group)
        for ref, stored in sorted(group_hashes.items() if isinstance(group_hashes, dict) else []):
            if not isinstance(ref, str) or not isinstance(stored, str):
                continue
            if anchored:
                try:
                    current: str | None = resolver.sha256(ref)
                except AnchorError:
                    current = None
            else:
                path = evidence_path_from_ref(ref)
                if path is None:
                    continue
                try:
                    rel_path = path.relative_to(ROOT).as_posix()
                except ValueError:
                    continue
                if resolver.is_dir(rel_path):
                    continue
                try:
                    current = hashlib.sha256(resolver.read_bytes(rel_path)).hexdigest()
                except AnchorError:
                    current = None
            if current != stored:
                out.add((group, ref, stored))
    return out


class ReceiptLedger:
    """Git provenance of re-audit receipts: worker records, review outputs, review packets and
    the per-row record files.

    A receipt counts only as committed: tracked at HEAD with the bytes it has now, added by
    exactly one ordinary commit, with the same bytes at that adding commit as at HEAD (so no
    later commit, merges included, changed it), and added after the recheck commit it judged,
    which must be a strict ancestor of the adding commit. A review output and the packet it
    was shown must be added by the same commit. So an output cannot be paired later with a
    replacement packet, and receipts cannot be replayed onto a newer snapshot."""

    CHUNK = 200

    def __init__(self, root: Path) -> None:
        self.root = root
        self._info: dict[str, dict[str, Any]] = {}
        self._ancestor: dict[tuple[str, str], bool] = {}
        self._prefetched: set[int] = set()

    def _git(self, *args: str, stdin: bytes | None = None) -> bytes | None:
        import subprocess  # noqa: PLC0415

        proc = subprocess.run(["git", "-C", str(self.root), *args], capture_output=True, input=stdin)
        return proc.stdout if proc.returncode == 0 else None

    def prefetch(self, paths: Any) -> None:
        todo = []
        for p in sorted({p for p in paths if isinstance(p, str) and p not in self._info}):
            try:
                canonical_rel_path(p)
                todo.append(p)
            except AnchorError:
                self._info[p] = {"head_blob": None, "adders": [], "added_blob": None, "unsafe": True}
        if not todo:
            return
        head = self._git("rev-parse", "--verify", "-q", "HEAD^{commit}")
        for start in range(0, len(todo), self.CHUNK):
            chunk = todo[start:start + self.CHUNK]
            blobs: dict[str, str] = {}
            adders: dict[str, list[str]] = {path: [] for path in chunk}
            added_blob: dict[str, str | None] = {}
            if head:
                for entry in (self._git("ls-tree", "-z", "HEAD", "--", *chunk) or b"").split(b"\0"):
                    if b"\t" not in entry:
                        continue
                    meta, name = entry.split(b"\t", 1)
                    mode, kind, obj = meta.split(b" ")
                    if kind == b"blob" and mode != b"120000":
                        blobs[name.decode()] = obj.decode()
                # Ordinary (non-merge) commits that add each path. A merge never counts as the
                # adding commit; what a merge does to a receipt shows up as differing bytes.
                log = self._git("log", "--full-history", "--no-renames", "--diff-filter=A", "--format=%x01%H",
                                "--name-only", "-z", "--", *chunk) or b""
                for part in log.split(b"\x01"):
                    fields = part.split(b"\0")
                    sha = fields[0].decode().strip()
                    for name in fields[1:]:
                        name_s = name.decode().lstrip("\n")
                        if name_s in adders:
                            adders[name_s].append(sha)
                queries = [(path, found[0]) for path, found in adders.items() if len(found) == 1]
                if queries:
                    out = self._git("cat-file", "--batch-check=%(objectname) %(objecttype)",
                                    stdin="".join(f"{c}:{p}\n" for p, c in queries).encode()) or b""
                    answers = out.decode().splitlines()
                    if len(answers) == len(queries):  # one answer per query, or none is trusted
                        for (path, _), line in zip(queries, answers):
                            obj, _, kind = line.partition(" ")
                            added_blob[path] = obj if kind == "blob" else None
            for path in chunk:
                self._info[path] = {"head_blob": blobs.get(path), "adders": adders[path], "added_blob": added_blob.get(path)}

    def prefetch_records(self, records: dict[str, Any]) -> None:
        if id(records) in self._prefetched:
            return
        self._prefetched.add(id(records))
        paths = []
        for record in records.values():
            reviews = record.get("reviews") if isinstance(record, dict) else None
            for review in (reviews.values() if isinstance(reviews, dict) else []):
                if isinstance(review, dict):
                    paths.extend(review.get(k) for k in ("evidence_path", "packet_path"))
        self.prefetch(paths)

    def is_strict_ancestor(self, older: str, newer: str) -> bool:
        key = (older, newer)
        if key not in self._ancestor:
            self._ancestor[key] = older != newer and self._git("merge-base", "--is-ancestor", older, newer) is not None
        return self._ancestor[key]

    def check(self, path: str, recheck_commit: str) -> tuple[str | None, str | None]:
        """(adding commit, problem) for one receipt judged at recheck_commit."""
        self.prefetch([path])
        info = self._info[path]
        if info.get("unsafe"):
            return None, f"receipt path {path!r} is not a safe repository-relative path"
        try:
            data = contained_path(self.root, path).read_bytes()
        except (AnchorError, OSError):
            return None, f"receipt {path} is missing"
        blob = hashlib.sha1(b"blob %d\0" % len(data) + data).hexdigest()
        if info["head_blob"] != blob:
            return None, f"receipt {path} is not committed at HEAD with its current bytes"
        if len(info["adders"]) != 1:
            return None, f"receipt {path} must be added by exactly one ordinary commit ({len(info['adders'])} add it)"
        added = info["adders"][0]
        if info["added_blob"] != blob:
            return added, f"receipt {path} was changed after it was first committed (its bytes differ from the commit that added it)"
        if not self.is_strict_ancestor(recheck_commit, added):
            return added, f"receipt {path} was committed at or before the recheck commit {recheck_commit[:12]} it claims to judge"
        return added, None


def _is_int(value: Any) -> bool:
    return isinstance(value, int) and not isinstance(value, bool)


def _str_list(value: Any) -> bool:
    return isinstance(value, list) and all(isinstance(item, str) for item in value)


def reaudit_record_shape_problems(record: Any) -> list[str]:
    """Type contract of a re-audit record, checked before any field is hashed, compared as a
    set member or looked up, so malformed input gives diagnostics instead of exceptions.
    Shared by validation and reaudit-append."""
    if not isinstance(record, dict):
        return ["a re-audit record must be an object"]
    out: list[str] = []
    for field in ("schema_id", "reaudit_id", "closure_id", "row_sha256", "recheck_commit", "verdict", "claim", "rationale"):
        if not isinstance(record.get(field), str):
            out.append(f"record.{field} must be a string")
    if not _is_int(record.get("line")):
        out.append("record.line must be an integer")
    for field in ("status_now", "later_closure_id"):
        if record.get(field) is not None and not isinstance(record.get(field), str):
            out.append(f"record.{field} must be a string or null")
    fix = record.get("fix")
    if fix is not None and (not isinstance(fix, dict) or ("description" in fix and not isinstance(fix["description"], str))):
        out.append("record.fix must be null or an object whose description is a string")
    deps = record.get("dependencies")
    if not _str_list(deps) or not deps or len(set(deps)) != len(deps):
        out.append("record.dependencies must be a non-empty list of distinct strings")
    snapshot = record.get("dependency_hashes_at_recheck")
    if not isinstance(snapshot, dict) or not all(isinstance(k, str) and isinstance(v, str) for k, v in snapshot.items()):
        out.append("record.dependency_hashes_at_recheck must map strings to strings")
    evidence = record.get("evidence")
    if not isinstance(evidence, list) or not all(
        isinstance(item, dict) and isinstance(item.get("ref"), str)
        and (("quote" in item) != ("absent" in item))
        and all(isinstance(item[k], str) for k in ("quote", "absent") if k in item)
        for item in evidence
    ):
        out.append("record.evidence must be a list of objects with a string ref and exactly one string quote or absent")
    stale = record.get("stale_hashes_at_recheck")
    if not isinstance(stale, list) or not all(
        isinstance(item, dict) and all(isinstance(item.get(k), str) for k in ("group", "ref", "stored")) for item in stale
    ):
        out.append("record.stale_hashes_at_recheck must be a list of objects with string group, ref and stored")
    dispositions = record.get("stale_ref_dispositions")
    if not isinstance(dispositions, list) or not all(
        isinstance(item, dict) and isinstance(item.get("ref"), str) and isinstance(item.get("disposition"), str)
        and ("anchors" not in item or _str_list(item["anchors"]))
        and ("note" not in item or isinstance(item["note"], str))
        for item in dispositions
    ):
        out.append("record.stale_ref_dispositions must be a list of objects with string ref, disposition, note and string-list anchors")
    reviews = record.get("reviews")
    if not isinstance(reviews, dict) or not all(
        isinstance(review, dict) and all(isinstance(v, str) for v in review.values())
        for review in reviews.values()
    ):
        out.append("record.reviews must map reviewers to objects of strings")
    return out


def validate_reaudit_record(
    record: dict[str, Any],
    row: dict[str, Any],
    target: dict[str, Any],
    label: str,
    resolver: AnchorResolver,
    errors: list[str],
    commit_resolvers: dict[str, CommitResolver] | None = None,
    receipts: ReceiptLedger | None = None,
) -> None:
    """Integrity of a re-audit record against the text it read.

    The record's recheck snapshot, the superseded row's stale refs and every evidence quote
    are recomputed from git at the record's recheck_commit, so they stay verifiable after
    the text moves on. Each verdict is bound to a committed output: the worker's to its
    records file (exact superseded-row digest and anchors), each reviewer's to its review
    file and to the packet it was shown (exact claim and anchor hashes).
    """
    supersedes = row["supersedes"]
    reaudit = row["reaudit"]
    # Shape first, so malformed records give diagnostics instead of exceptions.
    shape = reaudit_record_shape_problems(record)
    if shape:
        errors.extend(f"{label}: {problem}" for problem in shape)
        return
    verdict = record["verdict"]
    deps = record["dependencies"]
    evidence = record["evidence"]
    if record.get("schema_id") != REAUDIT_RECORD_SCHEMA or record.get("reaudit_id") != reaudit.get("reaudit_id"):
        errors.append(f"{label}: record schema_id or reaudit_id does not match")
    if record.get("closure_id") != supersedes.get("closure_id") or record.get("line") != supersedes.get("line"):
        errors.append(f"{label}: record closure_id and line must equal supersedes")
    if record.get("row_sha256") != supersedes.get("row_sha256"):
        errors.append(f"{label}: record.row_sha256 does not match supersedes.row_sha256")
    commit = record.get("recheck_commit")
    if not (isinstance(commit, str) and re.fullmatch(r"[0-9a-f]{40}", commit)) or reaudit.get("recheck_commit") != commit:
        errors.append(f"{label}: recheck_commit must be a 40-hex commit equal in the row and the record")
        return
    for field in ("claim", "rationale"):
        if not isinstance(record.get(field), str) or not record[field].strip():
            errors.append(f"{label}: record.{field} must be non-empty")
    if verdict not in REAUDIT_VERDICTS or reaudit.get("outcome") != verdict:
        errors.append(f"{label}: record verdict {verdict!r} must be a known verdict equal to reaudit.outcome")
        return
    if verdict == "not_supported" and not (isinstance(record.get("fix"), dict) and isinstance(record["fix"].get("description"), str)
                                           and record["fix"]["description"].strip()):
        errors.append(f"{label}: a not_supported record needs a fix description")

    # The text the re-audit read: git at recheck_commit.
    cache = commit_resolvers if commit_resolvers is not None else {}
    at_commit = cache.get(commit)
    if at_commit is None:
        at_commit = CommitResolver(ROOT, commit)
        cache[commit] = at_commit
    if not at_commit.available():
        errors.append(f"{label}: recheck_commit {commit[:12]} is not in this repository, so the re-audit cannot be verified")
        return

    snapshot = record.get("dependency_hashes_at_recheck")
    hashes = row.get("hashes") if isinstance(row.get("hashes"), dict) else {}
    if not isinstance(snapshot, dict) or set(snapshot) != set(deps) or not all(_is_sha256(v) for v in snapshot.values()):
        errors.append(f"{label}: dependency_hashes_at_recheck must hash exactly the dependencies")
        return
    # Every entry of every hash group must equal the snapshot on its own: merging the groups
    # first would let one group's correct hash hide the other's wrong one for the same ref.
    covered: set[str] = set()
    for group in ("owner_evidence_hashes", "closure_evidence_hashes"):
        group_hashes = hashes.get(group)
        if group_hashes is None:
            continue
        if not isinstance(group_hashes, dict):
            errors.append(f"{label}: hashes.{group} must be an object")
            continue
        for ref, value in sorted(group_hashes.items()):
            covered.add(ref)
            if snapshot.get(ref) != value:
                errors.append(f"{label}: hashes.{group}[{ref}] must equal the record's recheck snapshot")
    if covered != set(snapshot):
        errors.append(f"{label}: the row's anchored hashes must cover exactly the record's recheck snapshot")
    for ref in deps:
        problem = anchor_ref_problem(ref)
        if problem:
            errors.append(f"{label}: dependency {problem}")
            continue
        try:
            at = at_commit.sha256(ref)
        except AnchorError as exc:
            errors.append(f"{label}: dependency {ref} does not resolve at recheck_commit: {exc}")
            continue
        if at != snapshot[ref]:
            errors.append(f"{label}: snapshot for {ref} is not its content at recheck_commit {commit[:12]}")

    # Stale refs: the full set the re-audit had to account for, recomputed at recheck_commit.
    stale = record.get("stale_hashes_at_recheck")
    if not isinstance(stale, list) or not all(isinstance(item, dict) for item in stale):
        errors.append(f"{label}: record.stale_hashes_at_recheck must be a list of objects")
        stale = []
    declared = {(item.get("group"), item.get("ref"), item.get("stored")) for item in stale}
    expected = _target_stale_refs(target, at_commit)
    if declared != expected:
        errors.append(
            f"{label}: stale_hashes_at_recheck must list exactly the superseded row's evidence that differs at recheck_commit "
            f"({len(expected)} expected, {len(declared)} declared)"
        )
    stale_refs = {ref for _, ref, _ in expected}
    dispositions = record.get("stale_ref_dispositions")
    seen: set[Any] = set()
    for item in dispositions if isinstance(dispositions, list) else []:
        if not isinstance(item, dict):
            errors.append(f"{label}: stale_ref_dispositions entries must be objects")
            continue
        seen.add(item.get("ref"))
        if item.get("disposition") == "dependency":
            anchors = item.get("anchors")
            if not isinstance(anchors, list) or not anchors or not set(anchors) <= set(deps):
                errors.append(f"{label}: stale ref {item.get('ref')} marked dependency must name anchors from dependencies")
        elif item.get("disposition") == "not_a_dependency":
            if not str(item.get("note", "")).strip():
                errors.append(f"{label}: stale ref {item.get('ref')} marked not_a_dependency needs a note")
        else:
            errors.append(f"{label}: stale ref disposition must be dependency or not_a_dependency")
    if seen != stale_refs:
        errors.append(f"{label}: stale_ref_dispositions must cover exactly the stale refs at recheck")

    # Evidence quotes, checked against the text at recheck_commit (historical integrity).
    quote_items = 0
    for item in evidence:
        ref = item.get("ref")
        if ref not in deps:
            errors.append(f"{label}: evidence ref {ref!r} is not one of the record's dependencies")
            continue
        try:
            view = quote_view(at_commit.content(ref)[1])
        except AnchorError:
            continue  # reported above as an unresolvable dependency
        if "quote" in item:
            quote_items += 1
            quote = quote_view(str(item["quote"]))
            if len(quote) < REAUDIT_MIN_QUOTE:
                errors.append(f"{label}: evidence quote is too short to be evidence")
            elif quote not in view:
                errors.append(f"{label}: evidence quote is not in {ref} at recheck_commit: {str(item['quote'])[:80]!r}")
        elif "absent" in item:
            absent = quote_view(str(item["absent"]))
            if not absent or absent in view:
                errors.append(f"{label}: phrase recorded as absent is present in {ref} at recheck_commit")
        else:
            errors.append(f"{label}: evidence items need quote or absent")
    if verdict in REAUDIT_VERDICTS - {"not_supported"} and quote_items == 0:
        errors.append(f"{label}: a {verdict} re-audit needs at least one verbatim quote")

    # Verdicts: each bound to a committed output that judged exactly this row and these anchors.
    reviews = record["reviews"]
    claim_view = {k: v for k, v in target.items() if k not in ("hashes", "_line_no")}
    receipts = receipts if receipts is not None else ReceiptLedger(ROOT)
    for who in REAUDIT_REVIEWERS:
        review = reviews.get(who)
        if not isinstance(review, dict) or review.get("verdict") != verdict:
            errors.append(f"{label}: record.reviews.{who}.verdict must equal the record verdict {verdict!r}")
            continue
        if not isinstance(review.get("model"), str) or not review["model"].strip():
            errors.append(f"{label}: record.reviews.{who}.model must name the model")
        judged = _bound_output_row(review, "evidence", supersedes, label, who, errors)
        if judged is None:
            continue
        # Provenance: committed as is, added once, after the recheck commit; output and packet together.
        added: dict[str, str | None] = {}
        for kind in ("evidence",) if who == "worker" else ("evidence", "packet"):
            added[kind], problem = receipts.check(str(review.get(f"{kind}_path")), commit)
            if problem:
                errors.append(f"{label}: record.reviews.{who}: {problem}")
        if who != "worker" and added.get("evidence") and added.get("packet") and added["evidence"] != added["packet"]:
            errors.append(f"{label}: record.reviews.{who} output and the packet it was shown were not committed together")
        # Bindings an output declares about itself must agree with the record.
        if "recheck_commit" in judged and judged["recheck_commit"] != commit:
            errors.append(f"{label}: record.reviews.{who} output names a different recheck_commit")
        if "row_sha256" in judged and judged["row_sha256"] != supersedes.get("row_sha256"):
            errors.append(f"{label}: record.reviews.{who} output is for a different version of the superseded row")
        if "packet_sha256" in judged and judged["packet_sha256"] != review.get("packet_sha256"):
            errors.append(f"{label}: record.reviews.{who} output names a different packet than the record")
        if "dependency_hashes_at_recheck" in judged:
            declared_hashes = judged["dependency_hashes_at_recheck"]
            if not isinstance(declared_hashes, dict) or any(snapshot.get(k) != v for k, v in declared_hashes.items()):
                errors.append(f"{label}: record.reviews.{who} output declares anchor hashes that differ from the record's snapshot")
        judged_verdict = judged.get("verdict")
        if judged_verdict == "resolved_differently" and judged.get("status_now") == target.get("closure_status"):
            judged_verdict = "supported"  # the status decides
        if judged_verdict != verdict:
            errors.append(f"{label}: record.reviews.{who} evidence judged this row {judged.get('verdict')!r}, not {verdict!r}")
        elif verdict == "resolved_differently" and judged.get("status_now") != record.get("status_now"):
            errors.append(f"{label}: record.reviews.{who} evidence gives a different status_now")
        elif verdict == "superseded_by_later_closure" and judged.get("later_closure_id") != record.get("later_closure_id"):
            errors.append(f"{label}: record.reviews.{who} evidence names a different later closure")
        if who == "worker":
            if judged.get("row_sha256") != supersedes.get("row_sha256"):
                errors.append(f"{label}: worker output is for a different version of the superseded row")
            judged_deps = judged.get("dependencies")
            if not _str_list(judged_deps) or set(judged_deps) != set(deps):
                errors.append(f"{label}: worker output must rely on exactly the record's dependencies")
            if judged.get("recheck_commit") != commit or judged.get("dependency_hashes_at_recheck") != snapshot:
                errors.append(f"{label}: worker output must bind the record's recheck_commit and exact dependency hashes")
            # The record is assembled from the committed worker output: its judgement fields must be that output's.
            bound = list(REAUDIT_WORKER_FIELDS) + (["status_now"] if verdict == "resolved_differently" else []) \
                + (["later_closure_id"] if verdict == "superseded_by_later_closure" else [])
            for field in bound:
                if judged.get(field) != record.get(field):
                    errors.append(f"{label}: record.{field} differs from the committed worker output it was assembled from")
            continue
        shown = _bound_output_row(review, "packet", supersedes, label, who, errors)
        if shown is None:
            continue
        if shown.get("claim") != claim_view:
            errors.append(f"{label}: record.reviews.{who} packet showed a different claim than the superseded row")
        for field, expected in (("recheck_commit", commit), ("row_sha256", supersedes.get("row_sha256"))):
            if shown.get(field) != expected:
                errors.append(f"{label}: record.reviews.{who} packet row must name the record's {field}")
        declared_digest = shown.get("packet_row_digest")
        try:
            content_digest = packet_row_digest(shown)
        except AnchorError:
            content_digest = None
        if not _is_sha256(declared_digest) or declared_digest != content_digest:
            errors.append(f"{label}: record.reviews.{who} packet row's packet_row_digest is missing or does not match its content")
        elif judged.get("packet_row_digest") != declared_digest:
            errors.append(f"{label}: record.reviews.{who} output does not echo the digest of the packet row it judged")
        anchors_shown = shown.get("dependency_anchors")
        if not isinstance(anchors_shown, list) or not anchors_shown:
            errors.append(f"{label}: record.reviews.{who} packet row shows no dependency_anchors")
            continue
        shown_refs: list[Any] = []
        for item in anchors_shown:
            ref = item.get("ref") if isinstance(item, dict) else None
            shown_refs.append(ref)
            if not isinstance(ref, str) or ref not in snapshot or item.get("sha256") != snapshot[ref]:
                errors.append(f"{label}: record.reviews.{who} packet showed {ref!r} at a different snapshot than the record")
                continue
            # What the reviewer read must be that anchor's text at the recheck commit (a prefix when truncated).
            text, truncated = item.get("text"), item.get("truncated", False)
            try:
                view = at_commit.content(ref)[1]
            except AnchorError:
                continue  # reported above as an unresolvable dependency
            if not isinstance(text, str) or not isinstance(truncated, bool) or not (
                (not truncated and text == view) or (truncated and len(text) < len(view) and view.startswith(text))
            ):
                errors.append(f"{label}: record.reviews.{who} packet text for {ref} is not that anchor's text at recheck_commit")
        if len(set(map(str, shown_refs))) != len(shown_refs):
            errors.append(f"{label}: record.reviews.{who} packet shows an anchor twice")


def _bound_output_row(
    review: dict[str, Any], kind: str, supersedes: dict[str, Any], label: str, who: str, errors: list[str]
) -> dict[str, Any] | None:
    """The single row of a committed output file (kind evidence or packet) for this closure."""
    path_ref = review.get(f"{kind}_path")
    digest = review.get(f"{kind}_sha256")
    if not isinstance(path_ref, str) or not path_ref.startswith("Plans/.audits/") or not _is_sha256(digest):
        errors.append(f"{label}: record.reviews.{who} needs {kind}_path under Plans/.audits/ and a SHA-256 {kind}_sha256")
        return None
    try:
        output = contained_path(ROOT, path_ref)
    except AnchorError as exc:
        errors.append(f"{label}: record.reviews.{who}.{kind}_path: {exc}")
        return None
    if not output.is_file() or sha256_file(output) != digest:
        errors.append(f"{label}: record.reviews.{who} {kind} file is missing or its SHA-256 differs")
        return None
    judged = _jsonl_row_for(output, supersedes.get("line"), supersedes.get("closure_id"))
    if judged is None:
        errors.append(f"{label}: record.reviews.{who} {kind} file has no single row for this closure")
    return judged


def validate_reaudit_row(
    row: dict[str, Any],
    label: str,
    rows_by_line: dict[int, dict[str, Any]],
    raw_lines: dict[int, str],
    resolver: AnchorResolver,
    record_cache: dict[str, dict[str, Any]],
    errors: list[str],
) -> dict[str, Any] | None:
    """Check one re-audit row's link and record. Return the edge it proposes, or None."""
    before = len(errors)
    supersedes = row.get("supersedes")
    reaudit = row.get("reaudit")
    if not isinstance(supersedes, dict) or not isinstance(reaudit, dict):
        errors.append(f"{label}: a row that supersedes another needs both supersedes and reaudit objects")
        return None
    line = supersedes.get("line")
    target = rows_by_line.get(line) if isinstance(line, int) and not isinstance(line, bool) else None
    if target is None or line >= row["_line_no"]:
        errors.append(f"{label}: supersedes.line must name an earlier registry row")
        return None
    if target.get("closure_id") != supersedes.get("closure_id"):
        errors.append(f"{label}: supersedes.closure_id {supersedes.get('closure_id')} is not the row at line {line}")
    if sha256_text(raw_lines.get(line, "")) != supersedes.get("row_sha256"):
        errors.append(f"{label}: supersedes.row_sha256 does not match the exact bytes of line {line}")
    if target.get("finding_key") != row.get("finding_key"):
        errors.append(f"{label}: a re-audit row must keep the finding_key of the row it supersedes")
    reaudit_id = reaudit.get("reaudit_id")
    if not reaudit_id or row.get("closed_by_audit_id") != reaudit_id:
        errors.append(f"{label}: closed_by_audit_id must equal reaudit.reaudit_id")
    hashes = row.get("hashes") if isinstance(row.get("hashes"), dict) else {}
    if hashes.get("hash_scope") != ANCHOR_SCOPE:
        errors.append(f"{label}: re-audit rows use hashes.hash_scope {ANCHOR_SCOPE}")
    record_ref = reaudit.get("record")
    record = None
    try:
        if not isinstance(record_ref, str) or not record_ref.startswith("Plans/.audits/"):
            raise AnchorError("reaudit.record must be a path under Plans/.audits/")
        record_path = contained_path(ROOT, record_ref)
    except AnchorError as exc:
        errors.append(f"{label}: {exc}")
        record_path = None
    if record_path is not None:
        records = load_reaudit_records(record_path, errors, record_cache)
        if records is None:
            errors.append(f"{label}: re-audit record file {record_ref} is missing")
        else:
            record = records.get(str(supersedes.get("closure_id")))
            if record is None:
                errors.append(f"{label}: {record_ref} has no record for {supersedes.get('closure_id')}")
    if record is not None:
        try:
            digest_ok = reaudit_record_sha256(record) == reaudit.get("record_sha256")
        except AnchorError as exc:
            errors.append(f"{label}: record is not plain JSON: {exc}")
            digest_ok = False
        if not digest_ok:
            errors.append(f"{label}: reaudit.record_sha256 does not match the canonical record")
        receipts = record_cache.setdefault("__receipts__", ReceiptLedger(ROOT))  # type: ignore[arg-type]
        receipts.prefetch_records(records)  # type: ignore[union-attr]
        commit_ref = record.get("recheck_commit")
        if isinstance(commit_ref, str) and re.fullmatch(r"[0-9a-f]{40}", commit_ref):
            _, problem = receipts.check(record_ref, commit_ref)  # type: ignore[union-attr]
            if problem:
                errors.append(f"{label}: re-audit record file: {problem}")
        validate_reaudit_record(
            record, row, target, label, resolver, errors, record_cache.setdefault("__commits__", {}), receipts  # type: ignore[arg-type]
        )
        verdict = record.get("verdict")
        status = row.get("closure_status")
        old_status = target.get("closure_status")
        if verdict == "supported" and status != old_status:
            errors.append(f"{label}: a supported re-audit keeps closure_status {old_status}")
        elif verdict == "resolved_differently":
            if status != record.get("status_now") or status in OPEN_STATUSES or status == old_status or status not in ALLOWED_STATUSES:
                errors.append(f"{label}: resolved_differently sets closure_status to record.status_now, a different closed status")
        elif verdict == "superseded_by_later_closure" and status != old_status:
            errors.append(f"{label}: superseded_by_later_closure keeps closure_status {old_status}")
        elif verdict == "not_supported" and status != "reopened":
            errors.append(f"{label}: a not_supported re-audit appends a reopened row")
    if len(errors) != before or record is None:
        return None
    return {"target": line, "verdict": record.get("verdict"), "later_closure_id": record.get("later_closure_id")}


def validate_registry(registry_path: Path) -> dict[str, Any]:
    errors: list[str] = []
    warnings: list[str] = []
    rows = read_jsonl(registry_path, errors, required=True)
    raw_lines = raw_registry_lines(registry_path)
    rows_by_line = {row["_line_no"]: row for row in rows}
    resolver = AnchorResolver()
    record_cache: dict[str, dict[str, Any]] = {}
    closure_ids: set[str] = set()
    closed_by_key: dict[str, list[dict[str, Any]]] = {}
    status_counts: dict[str, int] = {}
    stale_by_line: dict[int, list[str]] = {}
    superseded_by: dict[int, int] = {}
    reaudit_rows = 0

    proposed: dict[int, dict[str, Any]] = {}
    for row in rows:
        label = f"{rel(registry_path)}:{row.get('_line_no')}"
        row_errors_start = len(errors)
        missing = sorted(REGISTRY_REQUIRED_FIELDS - set(row))
        if missing:
            errors.append(f"{label}: missing required fields {missing}")
            continue

        closure_id = str(row.get("closure_id", ""))
        if not closure_id:
            errors.append(f"{label}: closure_id is blank")
        elif closure_id in closure_ids:
            errors.append(f"{label}: duplicate closure_id {closure_id}")
        closure_ids.add(closure_id)

        for field in REGISTRY_LIST_FIELDS:
            if not isinstance(row.get(field), list):
                errors.append(f"{label}: {field} must be a list")

        status = str(row.get("closure_status", ""))
        status_counts[status] = status_counts.get(status, 0) + 1
        if status not in ALLOWED_STATUSES:
            errors.append(f"{label}: invalid closure_status {status}")

        expected_key = compute_finding_key(row)
        if row.get("finding_key") != expected_key:
            errors.append(f"{label}: finding_key {row.get('finding_key')} does not match deterministic {expected_key}")

        audit_ids = row.get("audit_ids")
        closed_by = row.get("closed_by_audit_id")
        if isinstance(audit_ids, list) and closed_by not in audit_ids:
            errors.append(f"{label}: closed_by_audit_id must be present in audit_ids")

        for field in ("created_at", "updated_at"):
            value = row.get(field)
            if not isinstance(value, str) or not ISO_UTC_RE.match(value):
                errors.append(f"{label}: {field} must use YYYY-MM-DDTHH:MM:SSZ")

        if not isinstance(row.get("closure_reason"), str) or not row.get("closure_reason", "").strip():
            errors.append(f"{label}: closure_reason must be non-empty")

        validate_evidence_refs(row.get("closure_evidence"), label, errors)
        stale: list[str] = []
        validate_hashes(row.get("hashes"), label, errors, stale, resolver)
        if stale:
            stale_by_line[row["_line_no"]] = stale

        conditions = set(stable_strings(row.get("reopen_conditions")))
        unknown_conditions = sorted(conditions - REOPEN_CONDITIONS)
        if unknown_conditions:
            errors.append(f"{label}: unknown reopen_conditions {unknown_conditions}")
        missing_conditions = sorted(REOPEN_CONDITIONS - conditions)
        if missing_conditions:
            errors.append(f"{label}: reopen_conditions missing {missing_conditions}")

        edge = None
        if "supersedes" in row or "reaudit" in row:
            reaudit_rows += 1
            edge = validate_reaudit_row(row, label, rows_by_line, raw_lines, resolver, record_cache, errors)

        finding_key = str(row.get("finding_key", ""))
        if status == "reopened":
            validate_reopened_proof(row, closed_by_key.get(finding_key, []), label, errors)
        elif status in ALLOWED_STATUSES and status not in OPEN_STATUSES:
            closed_by_key.setdefault(finding_key, []).append(row)

        # A supersession edge counts only when the successor row has no structural error at all.
        if edge is not None and len(errors) == row_errors_start:
            target = edge["target"]
            if target in superseded_by:
                errors.append(
                    f"{label}: line {target} is already superseded by line {superseded_by[target]}; "
                    "supersede the latest re-audit row instead"
                )
            else:
                superseded_by[target] = row["_line_no"]
                proposed[row["_line_no"]] = edge

    # superseded_by_later_closure must name a distinct later closure of the same finding that a
    # re-audit has itself confirmed (supported or resolved_differently); otherwise drop the edge.
    def confirmed(line_no: int) -> bool:
        """A re-audit confirmed this row as a closure: a supported or resolved_differently re-audit
        whose own row leaves the finding in a closed status (a supported re-audit of a blocked or
        reopened row confirms only that it is still open)."""
        def closing(re_line: int) -> bool:
            return (proposed.get(re_line, {}).get("verdict") in {"supported", "resolved_differently"}
                    and rows_by_line[re_line].get("closure_status") not in OPEN_STATUSES)
        if line_no in proposed and closing(line_no):
            return True
        successor = superseded_by.get(line_no)
        return bool(successor and closing(successor))

    for s_line, edge in sorted(proposed.items()):
        if edge["verdict"] != "superseded_by_later_closure":
            continue
        s_row = rows_by_line[s_line]
        target = edge["target"]
        later_rows = [r for r in rows if r.get("closure_id") == edge.get("later_closure_id")]
        later = later_rows[0] if len(later_rows) == 1 else None
        ok = (
            later is not None
            and later["_line_no"] > target
            and later["_line_no"] != s_line
            and later.get("finding_key") == s_row.get("finding_key")
            and (later.get("supersedes") or {}).get("line") != target
            and confirmed(later["_line_no"])
        )
        if not ok:
            errors.append(
                f"{rel(registry_path)}:{s_line}: superseded_by_later_closure must name a distinct later closure "
                "of the same finding that a re-audit confirmed"
            )
            superseded_by.pop(target, None)
            proposed.pop(s_line, None)

    superseded_stale = 0
    for line_no, stale in sorted(stale_by_line.items()):
        if line_no in superseded_by:
            superseded_stale += len(stale)
        else:
            errors.extend(stale)

    # An open row is resolved only when its chain of successors ends in a row that is closed and
    # whose own hashes are current. A stale or open leaf leaves the finding open, even though the
    # historical links stay valid (a later fresh re-audit can retire the staleness).
    def resolved(line_no: int) -> bool:
        seen_lines = {line_no}
        current = line_no
        while current in superseded_by:
            current = superseded_by[current]
            if current in seen_lines:
                return False
            seen_lines.add(current)
        if current == line_no:
            return False
        leaf = rows_by_line[current]
        return leaf.get("closure_status") not in OPEN_STATUSES and current not in stale_by_line

    def leaf_of(line_no: int) -> int:
        seen_lines = {line_no}
        current = line_no
        while current in superseded_by and superseded_by[current] not in seen_lines:
            current = superseded_by[current]
            seen_lines.add(current)
        return current

    # One representative per authenticated chain: its open leaf, or, when the chain ends in a closed
    # row whose hashes went stale, its latest open row.
    unresolved = [row for row in rows if row.get("closure_status") in OPEN_STATUSES and not resolved(row["_line_no"])]
    representative: dict[int, int] = {}
    for row in unresolved:
        chain_leaf = leaf_of(row["_line_no"])
        representative[chain_leaf] = max(representative.get(chain_leaf, 0), row["_line_no"])
    open_rows: list[dict[str, Any]] = []
    open_by_key: dict[str, list[str]] = {}
    for row in unresolved:
        if representative[leaf_of(row["_line_no"])] == row["_line_no"]:
            open_rows.append({
                "line": row["_line_no"],
                "closure_id": row.get("closure_id"),
                "finding_key": row.get("finding_key"),
                "closure_status": row.get("closure_status"),
            })
            open_by_key.setdefault(str(row.get("finding_key", "")), []).append(str(row.get("closure_id")))
            if row.get("closure_status") == "reopened":
                warnings.append(
                    f"{rel(registry_path)}:{row['_line_no']}: reopened finding remains open until a later closure row resolves it"
                )
    for finding_key, ids in sorted(open_by_key.items()):
        if len(ids) > 1:
            errors.append(f"{rel(registry_path)}: duplicate open finding_key {finding_key}: {ids}")

    return {
        "path": rel(registry_path),
        "row_count": len(rows),
        "status_counts": status_counts,
        "reaudit_row_count": reaudit_rows,
        "superseded_row_count": len(superseded_by),
        "superseded_lines": sorted(superseded_by),
        "superseded_by": {str(k): v for k, v in sorted(superseded_by.items())},
        "superseded_stale_hash_count": superseded_stale,
        "unsuperseded_stale_hash_count": sum(len(v) for k, v in stale_by_line.items() if k not in superseded_by),
        "open_rows": open_rows,
        "errors": errors,
        "warnings": warnings,
    }


def artifact_row_count(path: Path, errors: list[str]) -> int:
    count = 0
    if not path.exists():
        errors.append(f"missing source artifact {rel(path)}")
        return count
    for line_no, line in enumerate(_lines(path.read_text(encoding="utf-8")), 1):
        if not line.strip():
            continue
        try:
            json.loads(line)
        except json.JSONDecodeError as exc:
            errors.append(f"{rel(path)}:{line_no}: invalid JSONL: {exc}")
            continue
        count += 1
    return count


def explicit_repair_required(
    row: dict[str, Any],
    path_label: str,
    errors: list[str],
) -> bool | None:
    has_repair_required = "repair_required" in row
    has_finding_level = "finding_level" in row
    if not has_repair_required and not has_finding_level:
        return None

    repair_required = row.get("repair_required")
    finding_level = row.get("finding_level")
    if not isinstance(repair_required, bool):
        errors.append(f"{path_label}: repair_required must be a boolean")
    if not isinstance(finding_level, str) or finding_level not in FINDING_LEVELS:
        errors.append(f"{path_label}: finding_level must be one of {sorted(FINDING_LEVELS)}")
    return bool(repair_required) if isinstance(repair_required, bool) else None


def load_json_object(path: Path, errors: list[str], *, required: bool = True) -> dict[str, Any] | None:
    if not path.exists():
        if required:
            errors.append(f"missing {rel(path)}")
        return None
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
    except json.JSONDecodeError as exc:
        errors.append(f"{rel(path)}: invalid JSON: {exc}")
        return None
    if not isinstance(data, dict):
        errors.append(f"{rel(path)}: JSON root must be an object")
        return None
    return data


class AuditDiagnostics(list):
    """The error messages of one audit-directory validation, each paired with the structure its
    producer recorded: the exact path object it read, the row, the kind and the field data (or
    None when a producer records nothing). The messages are exactly the text the validator always
    printed. The legacy format rule reads only the structure, never the text, so no file name or
    message content can steer it."""

    def __init__(self) -> None:
        super().__init__()
        self.meta: list[dict[str, Any] | None] = []

    def append(self, message: str) -> None:  # noqa: D401 - list API
        super().append(message)
        self.meta.append(None)

    def extend(self, messages: Any) -> None:
        for message in messages:
            self.append(message)

    def add(self, message: str, **meta: Any) -> None:
        super().append(message)
        self.meta.append(meta)


def _diag(errors: list[str], message: str, **meta: Any) -> None:
    if isinstance(errors, AuditDiagnostics):
        errors.add(message, **meta)
    else:
        errors.append(message)


def validate_ref_fields(
    row: dict[str, Any],
    expected: dict[str, str],
    path_label: str,
    errors: list[str],
    *,
    require: bool,
    allow_row_scoped_refs: bool = False,
    origin: Path | None = None,
    row_key: Any = None,
) -> None:
    for field, expected_value in expected.items():
        value = row.get(field)
        if value is None:
            if require:
                _diag(errors, f"{path_label}: missing required ref field {field}",
                      origin=origin, row=row_key, kind="ref_missing", field=field)
            continue
        if not isinstance(value, str) or not value.strip():
            _diag(errors, f"{path_label}: {field} must be a non-empty string",
                  origin=origin, row=row_key, kind="ref_empty", field=field)
            continue
        if allow_row_scoped_refs and field in ROW_SCOPED_REF_FIELDS:
            continue
        if expected_value and value != expected_value:
            errors.append(f"{path_label}: {field} {value!r} does not match audit_report {expected_value!r}")


def load_audit_report(audit_dir: Path, errors: list[str]) -> tuple[dict[str, Any] | None, dict[str, str]]:
    report_path = audit_dir / "audit_report.json"
    report = load_json_object(report_path, errors, required=True)
    refs: dict[str, str] = {}
    if report is None:
        return None, refs
    label = rel(report_path)
    for field in AUDIT_REF_FIELDS:
        value = report.get(field)
        if not isinstance(value, str) or not value.strip():
            _diag(errors, f"{label}: {field} must be a non-empty string",
                  origin=report_path, row=None, kind="ref_empty", field=field)
            refs[field] = ""
        else:
            refs[field] = value
    return report, refs


def is_finding_row(row: dict[str, Any], artifact: str) -> bool:
    classification = str(row.get("classification", ""))
    return (
        artifact in AUDIT_FINDING_ARTIFACTS
        or row.get("repair_required") is True
        or bool(row.get("finding_key"))
        or bool(row.get("finding_family"))
        or classification == "missing_or_drift"
    )


def validate_source_finding_row(
    row: dict[str, Any],
    artifact: str,
    path_label: str,
    refs: dict[str, str],
    errors: list[str],
    origin: Path | None = None,
    row_key: Any = None,
) -> None:
    if not is_finding_row(row, artifact):
        return
    row = normalized_audit_finding_row(row)
    missing = sorted(AUDIT_SOURCE_FINDING_REQUIRED_FIELDS - set(row))
    if missing:
        _diag(errors, f"{path_label}: audit finding missing required fields {missing}",
              origin=origin, row=row_key, kind="finding_missing_fields", fields=list(missing))
    validate_ref_fields(row, refs, path_label, errors, require=False, allow_row_scoped_refs=True,
                        origin=origin, row_key=row_key)
    for field in AUDIT_SOURCE_FINDING_LIST_FIELDS:
        if field in row and not isinstance(row.get(field), list):
            errors.append(f"{path_label}: {field} must be a list")
    explicit_repair_required(row, path_label, errors)
    audit_id = refs.get("audit_id", "")
    finding_key = row.get("finding_key")
    if isinstance(finding_key, str):
        if not finding_key.startswith("sfk-"):
            _diag(errors, f"{path_label}: finding_key must use deterministic sfk-* form, got {finding_key!r}",
                  origin=origin, row=row_key, kind="key_algorithm")
        if audit_id and (finding_key.startswith(audit_id) or f"{audit_id}::" in finding_key or "::" in finding_key):
            _diag(errors, f"{path_label}: finding_key must not contain audit-specific identity {finding_key!r}",
                  origin=origin, row=row_key, kind="key_algorithm")
        if row.get("schema_id") != "pm.semantic_risk.v1":
            expected_key = compute_finding_key(row)
            if finding_key != expected_key:
                _diag(errors, f"{path_label}: finding_key {finding_key} does not match deterministic {expected_key}",
                      origin=origin, row=row_key, kind="key_algorithm")


def validate_source_jsonl_artifact(path: Path, artifact: str, refs: dict[str, str], errors: list[str]) -> int:
    if not path.exists():
        return 0
    finding_count = 0
    for row in read_jsonl(path, errors, required=True):
        label = f"{rel(path)}:{row.get('_line_no')}"
        line_no = row.get("_line_no")
        validate_ref_fields(row, refs, label, errors, require=False, allow_row_scoped_refs=True, origin=path, row_key=line_no)
        if is_finding_row(row, artifact):
            finding_count += 1
            validate_source_finding_row(row, artifact, label, refs, errors, origin=path, row_key=line_no)
    return finding_count


def validate_source_json_artifact(path: Path, artifact: str, refs: dict[str, str], errors: list[str]) -> int:
    data = load_json_object(path, errors, required=False)
    if data is None:
        return 0
    validate_ref_fields(data, refs, rel(path), errors, require=True, allow_row_scoped_refs=True, origin=path, row_key="$")
    finding_count = 0
    for field in ("warnings", "findings", "semantic_risks"):
        values = data.get(field)
        if not isinstance(values, list):
            continue
        for index, item in enumerate(values):
            if not isinstance(item, dict):
                continue
            label = f"{rel(path)}:{field}[{index}]"
            validate_ref_fields(item, refs, label, errors, require=False, allow_row_scoped_refs=True,
                                origin=path, row_key=f"{field}[{index}]")
            if is_finding_row(item, artifact):
                finding_count += 1
                validate_source_finding_row(item, artifact, label, refs, errors, origin=path, row_key=f"{field}[{index}]")
    return finding_count


def validate_source_artifacts(
    audit_dir: Path,
    requested_artifacts: list[str],
    refs: dict[str, str],
    errors: list[str],
) -> dict[str, Any]:
    finding_count = 0
    for artifact in requested_artifacts:
        path = audit_dir / artifact
        if artifact.endswith(".jsonl"):
            finding_count += validate_source_jsonl_artifact(path, artifact, refs, errors)
        elif artifact.endswith(".json"):
            finding_count += validate_source_json_artifact(path, artifact, refs, errors)
    return {"finding_count": finding_count}


def validate_scope_manifest(audit_dir: Path, refs: dict[str, str], errors: list[str]) -> dict[str, Any]:
    path = audit_dir / SCOPE_MANIFEST
    if not path.exists():
        _diag(errors, f"missing {rel(path)}", origin=path, kind="artifact_absent")
        rows: list[dict[str, Any]] = []
    else:
        rows = read_jsonl(path, errors, required=True)
    check_ids: set[str] = set()
    families: set[str] = set()
    classified_rows = 0
    finding_keys: set[str] = set()
    current_scope_schema = any(row.get("schema_id") == "pm.audit_scope_manifest.row.v1" for row in rows)
    for row in rows:
        label = f"{rel(path)}:{row.get('_line_no')}"
        if current_scope_schema:
            row_type = row.get("row_type")
            family = CURRENT_SCOPE_ROW_TYPE_FAMILIES.get(str(row_type))
            if family is None:
                errors.append(f"{label}: unknown row_type {row_type!r}")
            else:
                families.add(family)
            if "atom_ids" in row and not isinstance(row.get("atom_ids"), list):
                errors.append(f"{label}: atom_ids must be a list")
            if not isinstance(row.get("check_id"), str) or not row.get("check_id", "").strip():
                errors.append(f"{label}: check_id must be a non-empty string")
            elif row.get("check_id") in check_ids:
                errors.append(f"{label}: duplicate check_id {row.get('check_id')}")
            else:
                check_ids.add(str(row.get("check_id")))
            validate_ref_fields(row, refs, label, errors, require=True)
            for field in ("atom_ids", "plan_unit_ids", "owner_docs", "detail_keys", "exact_tokens", "source_refs"):
                if field in row and not isinstance(row.get(field), list):
                    errors.append(f"{label}: {field} must be a list")
            continue

        missing = sorted(SCOPE_REQUIRED_FIELDS - set(row))
        if missing:
            errors.append(f"{label}: missing required fields {missing}")
        validate_ref_fields(row, refs, label, errors, require=True, allow_row_scoped_refs=True)
        check_id = row.get("check_id")
        if not isinstance(check_id, str) or not check_id.strip():
            errors.append(f"{label}: check_id must be a non-empty string")
        else:
            if check_id in check_ids:
                errors.append(f"{label}: duplicate check_id {check_id}")
            check_ids.add(check_id)
            expected_id = compute_check_id(row)
            if check_id != expected_id:
                errors.append(f"{label}: check_id {check_id} does not match deterministic {expected_id}")
            audit_id = refs.get("audit_id", "")
            if audit_id and audit_id in check_id:
                errors.append(f"{label}: check_id must not contain audit_id {audit_id}")
        family = row.get("check_family")
        if isinstance(family, str):
            families.add(family)
            if family not in SCOPE_REQUIRED_FAMILIES:
                errors.append(f"{label}: unknown check_family {family!r}")
        else:
            errors.append(f"{label}: check_family must be a string")
        for field in SCOPE_LIST_FIELDS:
            if field in row and not isinstance(row.get(field), list):
                errors.append(f"{label}: {field} must be a list")
        classification = str(row.get("classification", "")).strip().lower()
        if classification in UNCLASSIFIED_VALUES:
            errors.append(f"{label}: classification must be final, not {row.get('classification')!r}")
        else:
            classified_rows += 1
        explicit_repair_required(row, label, errors)
        for key in stable_strings(row.get("finding_keys")):
            finding_keys.add(key)
    missing_families = sorted(SCOPE_REQUIRED_FAMILIES - families)
    if missing_families:
        _diag(errors, f"{rel(path)}: missing required check_family coverage {missing_families}",
              origin=path, kind="scope_coverage", manifest_exists=path.exists())
    return {
        "path": rel(path),
        "row_count": len(rows),
        "classified_rows": classified_rows,
        "check_family_count": len(families),
        "missing_check_families": missing_families,
        "finding_keys": sorted(finding_keys),
    }


def validate_post_repair_audit(value: Any, path_label: str, errors: list[str]) -> None:
    if not isinstance(value, dict):
        errors.append(f"{path_label}: post_repair_semantic_audit must be an object")
        return
    status = value.get("status")
    if status not in {"PASS", "PASS_WITH_WARNINGS"}:
        errors.append(f"{path_label}: post_repair_semantic_audit.status must be PASS or PASS_WITH_WARNINGS")
    if value.get("repair_required_count") != 0:
        errors.append(f"{path_label}: post_repair_semantic_audit.repair_required_count must be 0")
    if value.get("covered_original_scope") is not True:
        errors.append(f"{path_label}: post_repair_semantic_audit.covered_original_scope must be true")
    if value.get("covered_impact_rows") is not True:
        errors.append(f"{path_label}: post_repair_semantic_audit.covered_impact_rows must be true")
    drift = value.get("drift")
    if not isinstance(drift, dict):
        errors.append(f"{path_label}: post_repair_semantic_audit.drift must be an object")
        return
    for field in sorted(POST_REPAIR_DRIFT_FIELDS):
        if drift.get(field) is not False:
            errors.append(f"{path_label}: post_repair_semantic_audit.drift.{field} must be false")


def validate_repair_impact_matrix(
    audit_dir: Path,
    refs: dict[str, str],
    actionable_rows: set[tuple[str, str]],
    errors: list[str],
) -> dict[str, Any]:
    path = audit_dir / IMPACT_MATRIX
    if not path.exists():
        if actionable_rows:
            _diag(errors, f"missing required {rel(path)}", origin=path, kind="artifact_absent")
        return {
            "path": rel(path),
            "row_count": 0,
            "missing_coverage": [
                {"source_artifact": artifact, "source_row": source_row}
                for artifact, source_row in sorted(actionable_rows)
            ][:50],
            "extra_coverage": [],
        }

    rows = read_jsonl(path, errors, required=True)
    covered: set[tuple[str, str]] = set()
    impact_ids: set[str] = set()
    for row in rows:
        label = f"{rel(path)}:{row.get('_line_no')}"
        missing = sorted(IMPACT_REQUIRED_FIELDS - set(row))
        if missing:
            errors.append(f"{label}: missing required fields {missing}")
        validate_ref_fields(row, refs, label, errors, require=True, allow_row_scoped_refs=True)
        impact_id = row.get("impact_id")
        if not isinstance(impact_id, str) or not impact_id.strip():
            errors.append(f"{label}: impact_id must be a non-empty string")
        else:
            if impact_id in impact_ids:
                errors.append(f"{label}: duplicate impact_id {impact_id}")
            impact_ids.add(impact_id)
            expected_id = compute_impact_id(row)
            if impact_id != expected_id:
                errors.append(f"{label}: impact_id {impact_id} does not match deterministic {expected_id}")
            audit_id = refs.get("audit_id", "")
            if audit_id and audit_id in impact_id:
                errors.append(f"{label}: impact_id must not contain audit_id {audit_id}")
        for field in IMPACT_LIST_FIELDS:
            if field in row and not isinstance(row.get(field), list):
                errors.append(f"{label}: {field} must be a list")
        key = source_row_key(str(row.get("source_artifact", "")), row.get("source_row"))
        if key is None:
            errors.append(f"{label}: source_artifact/source_row must identify an actionable audit row")
        else:
            covered.add(key)
        finding_key = row.get("finding_key")
        if not isinstance(finding_key, str) or not finding_key.startswith("sfk-"):
            errors.append(f"{label}: finding_key must use deterministic sfk-* form")
        validate_post_repair_audit(row.get("post_repair_semantic_audit"), label, errors)

    missing_coverage = [
        {"source_artifact": artifact, "source_row": source_row}
        for artifact, source_row in sorted(actionable_rows - covered)
    ]
    if missing_coverage:
        errors.append(f"{rel(path)}: missing impact rows for {len(missing_coverage)} source rows")
    extra_coverage = sorted(covered - actionable_rows)
    if extra_coverage:
        errors.append(f"{rel(path)}: impact rows present for {len(extra_coverage)} non-actionable source rows")
    return {
        "path": rel(path),
        "row_count": len(rows),
        "missing_coverage": missing_coverage[:50],
        "extra_coverage": [
            {"source_artifact": artifact, "source_row": source_row}
            for artifact, source_row in extra_coverage[:50]
        ],
    }


def validate_audit_report_status(
    audit_report: dict[str, Any] | None,
    audit_dir: Path,
    repair_required_count: int,
    finding_count: int,
    errors: list[str],
) -> None:
    if audit_report is None:
        return
    origin = audit_dir / "audit_report.json"
    label = rel(origin)
    reported_count = audit_report.get("repair_required_count")
    if reported_count != repair_required_count:
        _diag(errors, f"{label}: repair_required_count {reported_count!r} does not match computed {repair_required_count}",
              origin=origin, kind="report_count", reported_absent=reported_count is None)
    status = str(audit_report.get("status", "")).upper()
    status_stated = "status" in audit_report
    if repair_required_count > 0 and status != "BLOCKED":
        _diag(errors, f"{label}: status must be BLOCKED when repair_required_count is {repair_required_count}",
              origin=origin, kind="report_status", status_stated=status_stated)
    if repair_required_count == 0 and status == "BLOCKED":
        _diag(errors, f"{label}: status must not be BLOCKED when repair_required_count is 0",
              origin=origin, kind="report_status", status_stated=status_stated)
    if repair_required_count == 0 and finding_count > 0 and status == "PASS":
        _diag(errors, f"{label}: status should be PASS_WITH_WARNINGS when non-actionable findings exist",
              origin=origin, kind="report_status", status_stated=status_stated)


def validate_terminal_state_projection(
    audit_dir: Path,
    refs: dict[str, str],
    projection: dict[str, Any],
    errors: list[str],
) -> dict[str, Any] | None:
    path = audit_dir / TERMINAL_STATE
    if not path.exists():
        return None
    data = load_json_object(path, errors, required=False)
    if data is None:
        return None
    label = rel(path)
    if data.get("schema_id") != "pm.audit_terminal_state.v1":
        errors.append(f"{label}: schema_id must be pm.audit_terminal_state.v1")
    if data.get("audit_id") != refs.get("audit_id"):
        errors.append(f"{label}: audit_id does not match audit_report")
    for field in ("terminal_repair_state", "original_repair_required_count", "open_repair_required_count"):
        if data.get(field) != projection.get(field):
            errors.append(f"{label}: {field} {data.get(field)!r} does not match computed {projection.get(field)!r}")
    if projection.get("terminal_repair_state") == "repair_validated":
        if data.get("effective_terminal_report") != "post_repair_audit_report.json":
            errors.append(f"{label}: effective_terminal_report must be post_repair_audit_report.json for repair_validated")
        if data.get("historical_audit_report") != "audit_report.json":
            errors.append(f"{label}: historical_audit_report must preserve audit_report.json")
    return {
        "path": label,
        "terminal_repair_state": data.get("terminal_repair_state"),
        "effective_terminal_report": data.get("effective_terminal_report"),
    }


def optional_json_object(path: Path) -> dict[str, Any] | None:
    if not path.exists():
        return None
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
    except json.JSONDecodeError:
        return None
    return data if isinstance(data, dict) else None


def final_report_status(audit_dir: Path) -> dict[str, Any]:
    path = audit_dir / "FINAL_REPORT.md"
    if not path.exists():
        return {}
    text = path.read_text(encoding="utf-8", errors="replace")
    status_match = re.search(r"(?im)^Status:\s*`?([A-Z_]+)`?", text)
    next_action_match = re.search(r"(?ims)^## Next Action\s+(.+?)(?:\n## |\Z)", text)
    repair_count_match = re.search(r"repair_required_count\s*=\s*(\d+)", text)
    result: dict[str, Any] = {"path": "FINAL_REPORT.md"}
    if status_match:
        result["status"] = status_match.group(1)
    if next_action_match:
        result["next_action"] = " ".join(next_action_match.group(1).split())
    if repair_count_match:
        result["repair_required_count"] = int(repair_count_match.group(1))
    return result


def normalized_terminal_status(status: Any, *, finding_count: int = 0) -> str:
    value = str(status or "").upper()
    if value in {"PASS", "PASS_WITH_WARNINGS", "BLOCKED"}:
        return value
    return "PASS_WITH_WARNINGS" if finding_count else "PASS"


def build_effective_status_projection(audit_dir: Path, audit_validation: dict[str, Any]) -> dict[str, Any]:
    audit_dir = audit_dir if audit_dir.is_absolute() else ROOT / audit_dir
    audit_report = optional_json_object(audit_dir / "audit_report.json") or {}
    post_repair = optional_json_object(audit_dir / "post_repair_audit_report.json") or {}
    terminal_state = optional_json_object(audit_dir / TERMINAL_STATE) or {}
    final_status = final_report_status(audit_dir)

    audit_id = str(audit_report.get("audit_id") or post_repair.get("audit_id") or terminal_state.get("audit_id") or audit_dir.name)
    ledger_id = audit_report.get("ledger_id") or post_repair.get("ledger_id")
    original_count = audit_validation.get("original_repair_required_count")
    if not isinstance(original_count, int):
        original_count = audit_report.get("repair_required_count")
    if not isinstance(original_count, int):
        original_count = final_status.get("repair_required_count")
    open_count = audit_validation.get("repair_required_count")
    if not isinstance(open_count, int):
        open_count = post_repair.get("repair_required_count")
    if not isinstance(open_count, int):
        open_count = audit_report.get("repair_required_count")
    if not isinstance(open_count, int):
        open_count = final_status.get("repair_required_count")

    finding_count = 0
    source_artifacts = audit_validation.get("source_artifacts")
    if isinstance(source_artifacts, dict):
        finding_count = int(source_artifacts.get("finding_count", 0) or 0)

    post_count = post_repair.get("repair_required_count")
    post_status = post_repair.get("status")
    terminal_repair_state = audit_validation.get("terminal_repair_state")
    if terminal_state.get("terminal_repair_state"):
        terminal_repair_state = terminal_state.get("terminal_repair_state")

    if isinstance(post_count, int) and post_count == 0:
        effective_terminal_report = "post_repair_audit_report.json"
        effective_status = normalized_terminal_status(post_status, finding_count=finding_count)
        terminal_repair_state = "repair_validated"
        repair_required_count = 0
    elif isinstance(open_count, int) and open_count > 0:
        effective_terminal_report = "audit_report.json" if audit_report else final_status.get("path", "FINAL_REPORT.md")
        effective_status = "BLOCKED"
        terminal_repair_state = "repair_required"
        repair_required_count = open_count
    else:
        effective_terminal_report = "audit_report.json" if audit_report else final_status.get("path", "FINAL_REPORT.md")
        raw_status = audit_report.get("status") or final_status.get("status")
        if str(raw_status or "").upper() == "BLOCKED":
            effective_status = "PASS_WITH_WARNINGS" if finding_count else "PASS"
        else:
            effective_status = normalized_terminal_status(raw_status, finding_count=finding_count)
        terminal_repair_state = "no_repair_required"
        repair_required_count = 0 if not isinstance(open_count, int) else open_count

    superseded: list[str] = []
    correction = audit_validation.get("audit_correction")
    audit_status = str(correction["corrected_status"] if correction else audit_report.get("status") or "").upper()
    if audit_report and audit_status == "BLOCKED" and effective_status != "BLOCKED":
        superseded.append("audit_report.json")
    if final_status.get("status") == "BLOCKED" and effective_status != "BLOCKED":
        superseded.append("FINAL_REPORT.md")
    if effective_terminal_report == "post_repair_audit_report.json" and (audit_dir / TERMINAL_STATE).exists():
        superseded.append(TERMINAL_STATE)

    projection = {
        "schema_id": "pm.audit_effective_status.v1",
        "audit_id": audit_id,
        "ledger_id": ledger_id,
        "effective_status": effective_status,
        "terminal_repair_state": terminal_repair_state,
        "repair_required_count": repair_required_count,
        "repair_required_count_source": "closure_validation" if isinstance(audit_validation.get("repair_required_count"), int) else "report_projection",
        "original_repair_required_count": original_count,
        "effective_terminal_report": effective_terminal_report,
        "superseded_historical_reports": sorted(set(superseded)),
        "status_sources": {
            "audit_report_status": audit_report.get("status"),
            "audit_report_repair_required_count": audit_report.get("repair_required_count"),
            "final_report_status": final_status.get("status"),
            "final_report_repair_required_count": final_status.get("repair_required_count"),
            "post_repair_status": post_repair.get("status"),
            "post_repair_repair_required_count": post_repair.get("repair_required_count"),
            "terminal_state_status": terminal_state.get("terminal_status"),
        },
        "notes": [],
    }
    if correction:
        projection["status_sources"]["corrected_audit_report_status"] = correction["corrected_status"]
        projection["status_sources"]["audit_correction"] = correction["path"]
    if superseded:
        projection["notes"].append("Historical status artifacts are preserved but superseded by this effective status projection.")
    if effective_status == "BLOCKED":
        projection["notes"].append("BLOCKED is effective only while repair_required_count is greater than zero or no later no-repair terminal evidence exists.")
    else:
        projection["notes"].append("No open actionable repair is represented by this audit effective status.")
    return projection


def validate_effective_status_projection(
    audit_dir: Path,
    audit_validation: dict[str, Any],
    errors: list[str],
    *,
    required: bool,
) -> dict[str, Any] | None:
    path = audit_dir / EFFECTIVE_STATUS
    expected = build_effective_status_projection(audit_dir, audit_validation)
    if not path.exists():
        if required:
            errors.append(f"missing {rel(path)}")
        return None
    data = load_json_object(path, errors, required=False)
    if data is None:
        return None
    label = rel(path)
    for field in (
        "schema_id",
        "audit_id",
        "effective_status",
        "terminal_repair_state",
        "repair_required_count",
        "effective_terminal_report",
        "superseded_historical_reports",
    ):
        if data.get(field) != expected.get(field):
            errors.append(f"{label}: {field} {data.get(field)!r} does not match computed {expected.get(field)!r}")
    if data.get("schema_id") != "pm.audit_effective_status.v1":
        errors.append(f"{label}: schema_id must be pm.audit_effective_status.v1")
    return {
        "path": label,
        "effective_status": data.get("effective_status"),
        "repair_required_count": data.get("repair_required_count"),
        "effective_terminal_report": data.get("effective_terminal_report"),
    }


# Q-A (Jared, "i approve all of it", 2026-11-05T04:33:13Z; DL-340): in the 55 June directories of
# LEGACY_AUDIT_DIRS, and only for an inventoried file with its frozen bytes, the compatibility
# inference reads four more words as "passed". These claim statuses mean the claim held:
LEGACY_COMPAT_CLAIM_STATUSES = frozenset({"pass", "supported_by_source_atoms", "previously_closed"})
# and a validator result whose status is expected_fail counts as passed only for these five
# governance commands, which the June audits expected to fail on stale generated files until a
# governance seal refreshed them. Every other expected_fail result, and every other field (an
# issue list, an overclaim list, a failing status), keeps its full meaning.
LEGACY_COMPAT_EXPECTED_FAIL_COMMANDS = frozenset({
    "python3 scripts/pm-plans-verify.py run-gates",
    "python3 scripts/pm-shard-plans.py --check",
    "python3 scripts/pm-plans-verify.py verify-spec-lock",
    "python3 scripts/pm-plans-verify.py validate-evidence",
    "python3 scripts/pm-plans-verify.py validate-plan-graph",
})


def legacy_actionable_jsonl_row(row: dict[str, Any], artifact: str, compat_words: bool = False) -> bool:
    """Compatibility inference for pre-repair_required audit artifacts. `compat_words` (a frozen
    file of a June directory only) lets a claim status in LEGACY_COMPAT_CLAIM_STATUSES count as
    a held claim; the row's other fields are still read."""
    risk_key = str(row.get("risk_key", "")).lower()
    finding_family = str(row.get("finding_family", "")).lower()
    if any(
        token in risk_key or token in finding_family
        for token in (
            "latest_audit_projection_stale",
            "repair_report_next_safe_action_stale",
            "review_commit",
            "review_or_commit",
            "audit_artifact_historical_next_action",
            "audit_artifact_wording",
        )
    ):
        return False
    if artifact == "semantic_risks.jsonl":
        classification = str(row.get("classification", ""))
        severity = str(row.get("severity", row.get("finding_level", ""))).lower()
        if classification in {"source_lineage_only", "not_for_plan", "stale_retired", "explicitly_deferred"}:
            return False
        return classification == "missing_or_drift" or severity in {"blocker", "high"}

    classification = str(row.get("classification", ""))
    if classification in TERMINAL_CLASSIFICATIONS:
        return False
    if classification == "missing_or_drift":
        return True

    status = str(row.get("status", "")).lower()
    if status in {"fail", "failed", "blocked", "blocker"}:
        return True

    claim_status = str(row.get("claim_status", ""))
    if claim_status and claim_status != "source_lineage_supported" and not (
        compat_words and claim_status in LEGACY_COMPAT_CLAIM_STATUSES
    ):
        return True

    issues = row.get("issues")
    if isinstance(issues, list) and bool(issues):
        return True

    for field in (
        "overclaim_notes",
        "missing_from_planunit_source_atoms",
        "extra_planunit_source_atoms_not_in_compile_queue",
    ):
        value = row.get(field)
        if isinstance(value, list) and value:
            return True
    return False


def actionable_jsonl_rows(
    path: Path, artifact: str, errors: list[str], inferred_out: set[str] | None = None,
    explicit_out: set[str] | None = None, compat_words: bool = False,
) -> list[str]:
    """Actionable row keys of a JSONL audit artifact. `inferred_out`, when given, collects the
    keys of rows that carry neither repair_required nor finding_level, so the compatibility
    inference judged them, whatever it decided; `explicit_out` collects the keys of rows that
    carry either field, valid or not."""
    rows: list[str] = []
    if not path.exists():
        errors.append(f"missing source artifact {rel(path)}")
        return rows
    for line_no, line in enumerate(_lines(path.read_text(encoding="utf-8")), 1):
        if not line.strip():
            continue
        try:
            row = json.loads(line)
        except json.JSONDecodeError as exc:
            errors.append(f"{rel(path)}:{line_no}: invalid JSONL: {exc}")
            continue
        _note_classification(row, str(line_no), inferred_out, explicit_out)
        explicit = explicit_repair_required(row, f"{rel(path)}:{line_no}", errors)
        if explicit is True:
            rows.append(str(line_no))
            continue
        if explicit is False:
            continue
        if legacy_actionable_jsonl_row(row, artifact, compat_words):
            rows.append(str(line_no))
    return rows


def _note_classification(row: Any, key: str, inferred_out: set[str] | None, explicit_out: set[str] | None) -> None:
    if not isinstance(row, dict):
        return
    if "repair_required" in row or "finding_level" in row:
        if explicit_out is not None:
            explicit_out.add(key)
    elif inferred_out is not None:
        inferred_out.add(key)


def actionable_warning_rows(
    data: dict[str, Any], artifact: str, errors: list[str], inferred_out: set[str] | None = None,
    explicit_out: set[str] | None = None, compat_words: bool = False,
) -> list[str]:
    rows: list[str] = []
    for field in ("warnings", "findings", "semantic_risks"):
        values = data.get(field)
        if not isinstance(values, list):
            continue
        for index, item in enumerate(values):
            if not isinstance(item, dict):
                continue
            _note_classification(item, f"{field}[{index}]", inferred_out, explicit_out)
            explicit = explicit_repair_required(item, f"{artifact}:{field}[{index}]", errors)
            if explicit is True:
                rows.append(f"{field}[{index}]")
            elif explicit is None and legacy_actionable_jsonl_row(item, artifact, compat_words):
                rows.append(f"{field}[{index}]")
    return rows


def actionable_json_rows(
    path: Path, artifact: str, errors: list[str], inferred_out: set[str] | None = None,
    explicit_out: set[str] | None = None, compat_words: bool = False,
) -> list[str]:
    if not path.exists():
        errors.append(f"missing source artifact {rel(path)}")
        return []
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
    except json.JSONDecodeError as exc:
        errors.append(f"{rel(path)}: invalid JSON: {exc}")
        return []
    rows: list[str] = []
    if isinstance(data, dict):
        if ("repair_required" in data or "finding_level" in data) and explicit_out is not None:
            explicit_out.add("*")  # an explicit field on the artifact covers every row in it
        explicit = explicit_repair_required(data, rel(path), errors)
        if explicit is True:
            rows.append("$")
        elif explicit is False:
            return rows

    if artifact == "ledger_consistency.json":
        rows.extend(actionable_warning_rows(data, artifact, errors, inferred_out, explicit_out, compat_words))
        new_units = (
            data.get("compile_queue", {})
            .get("range_new_plan_units_not_in_compile_queue", [])
        )
        if new_units:
            rows.append("compile_queue.range_new_plan_units_not_in_compile_queue")
        questions = (
            data.get("sealed_ledger_open_item_policy", {})
            .get("open_questions", [])
        )
        if questions:
            rows.append("sealed_ledger_open_item_policy.open_questions")
    elif artifact == "validator_results.json":
        if data.get("non_audit_side_effects"):
            rows.append("non_audit_side_effects")
        for result in data.get("results", []):
            name = str(result.get("name", "unnamed"))
            _note_classification(result, f"results.{name}", inferred_out, explicit_out)
            explicit = explicit_repair_required(result, f"{rel(path)}:results.{name}", errors)
            if explicit is True:
                rows.append(f"results.{name}")
                continue
            if explicit is False:
                continue
            status = result.get("status")
            passed = status == "pass" or (status is None and result.get("exit_code") == 0) or (
                compat_words and status == "expected_fail"
                and result.get("command") in LEGACY_COMPAT_EXPECTED_FAIL_COMMANDS
            )
            side_effect_count = result.get("side_effect_count", 0)
            if not passed or (isinstance(side_effect_count, int) and side_effect_count > 0):
                rows.append(f"results.{name}")
    return rows


def actionable_artifact_rows(
    path: Path, artifact: str, errors: list[str], inferred_out: set[str] | None = None,
    explicit_out: set[str] | None = None, compat_words: bool = False,
) -> list[str]:
    if artifact.endswith(".jsonl"):
        return actionable_jsonl_rows(path, artifact, errors, inferred_out, explicit_out, compat_words)
    if artifact.endswith(".json"):
        return actionable_json_rows(path, artifact, errors, inferred_out, explicit_out, compat_words)
    return [str(line_no) for line_no in range(1, artifact_row_count(path, errors) + 1)]


def source_row_key(artifact: str, source_row: Any) -> tuple[str, str] | None:
    if source_row is None:
        return None
    if isinstance(source_row, int):
        return (artifact, str(source_row))
    if isinstance(source_row, str) and source_row:
        return (artifact, source_row)
    return None


def registry_lookup(registry_path: Path, errors: list[str]) -> dict[str, dict[str, Any]]:
    rows = read_jsonl(registry_path, errors, required=True)
    lookup: dict[str, dict[str, Any]] = {}
    for row in rows:
        closure_id = row.get("closure_id")
        if isinstance(closure_id, str) and closure_id:
            lookup[closure_id] = row
    return lookup


# ---------------------------------------------------------------------------
# Legacy format rule for pre-July audit directories (DL-334; Jared, 2026-11-05).
#
# The per-audit closure schema (reference fields, deterministic finding keys, the scope
# manifest and repair impact matrix, explicit repair_required/finding_level) arrived after
# most June audits were written. For the June audit directories named below, and only those,
# a closed list of format and schema-evolution errors is reported as one warning per
# directory instead of as errors. The rule never excuses a missing closure row, an open or
# invalid closure row, a registry link that does not hold, missing or empty evidence, a
# missing closure reason, a status that contradicts the stated one, an artifact that is
# present but incomplete, or any message the classifier does not name: those stay errors.
# Audit directories written from July on, and any directory added later, get the full rules.
# The list is closed on purpose: a new directory with an old date in its name is not legacy.
LEGACY_FORMAT_RULE_ID = "pm.audit_closure.legacy_format.v1"
LEGACY_FORMAT_CUTOFF = "20260701"
LEGACY_AUDIT_DIRS = frozenset({
    "audit-20260615-001-part-3-fable-cleanup",
    "audit-20260615-002-part-4-fable-cleanup",
    "audit-20260616-001-part-4-fable-cleanup",
    "audit-20260616-002-goal-runtime-system",
    "audit-20260616-003-goal-runtime-system",
    "audit-20260616-004-goal-runtime-system",
    "audit-20260616-005-goal-runtime-system",
    "audit-20260616-006-goal-runtime-system",
    "audit-20260616-007-orchestrator-goal-runtime-flow",
    "audit-20260616-008-orchestrator-goal-runtime-flow-post-repair",
    "audit-20260617-001-orchestrator-goal-runtime-flow-post-repair-fidelity",
    "audit-20260617-002-orchestrator-goal-runtime-flow-semantic-repair-fidelity",
    "audit-20260617-003-orchestrator-goal-runtime-flow-head-semantic-fidelity",
    "audit-20260617-004-orchestrator-goal-runtime-flow-post-repair-semantic-fidelity",
    "audit-20260617-005-orchestrator-goal-runtime-flow-semantic-fidelity",
    "audit-20260617-006-semantic-closure-registry-fidelity",
    "audit-20260617-007-semantic-closure-registry-post-repair-fidelity",
    "audit-20260617-008-semantic-closure-registry-repair-fidelity",
    "audit-20260617-009-orchestrator-goal-runtime-flow-post-repair-fidelity",
    "audit-20260617-010-orchestrator-goal-runtime-flow-post-repair-fidelity",
    "audit-20260617-011-plans-to-code-handoff-post-compile",
    "audit-20260617-012-plans-to-code-handoff-deep-fidelity",
    "audit-20260617-013-plans-to-code-handoff-post-repair-fidelity",
    "audit-20260617-014-plans-to-code-handoff-post-repair-clean-fidelity",
    "audit-20260618-001-plans-to-code-handoff-post-governance-deep-fidelity",
    "audit-20260618-002-plans-to-code-final-docs-repair-certification",
    "audit-20260618-003-plans-to-code-implementation-readiness-fidelity-repair",
    "audit-20260618-004-plans-to-code-currentness-compatibility-repair",
    "audit-20260618-005-plans-to-code-final-corrective-certification",
    "audit-20260618-006-prd-planning-wizard-semantic-fidelity",
    "audit-20260618-007-prd-planning-wizard-post-repair-fidelity",
    "audit-20260618-008-prd-planning-wizard-semantic-fidelity",
    "audit-20260618-009-prd-planning-wizard-post-closure-fidelity",
    "audit-20260619-001-prd-planning-wizard-final-semantic-fidelity",
    "audit-20260619-002-prd-planning-wizard-head-semantic-fidelity",
    "audit-20260619-003-prd-planning-wizard-post-repair-semantic-fidelity",
    "audit-20260619-004-prd-planning-wizard-post-repair-head-fidelity",
    "audit-20260619-005-prd-planning-wizard-latest-head-semantic-fidelity",
    "audit-20260619-006-prd-planning-wizard-post-repair-head-semantic-fidelity",
    "audit-20260619-007-prd-planning-wizard-head-semantic-fidelity",
    "audit-20260619-008-prd-planning-wizard-post-repair-head-semantic-fidelity",
    "audit-20260619-009-prd-planning-wizard-latest-head-semantic-fidelity",
    "audit-20260619-010-prd-planning-wizard-post-repair-head-semantic-fidelity",
    "audit-20260623-001-fff-ledger-to-plans-semantic-fidelity",
    "audit-20260623-002-fff-post-repair-closed-world-semantic-fidelity",
    "audit-20260623-003-fff-closed-world-semantic-fidelity",
    "audit-20260625-001-provider-adjacent-plans",
    "audit-20260626-001-provider-updates-closed-world-semantic-fidelity",
    "audit-20260626-002-provider-updates-post-repair-closed-world-semantic-fidelity",
    "audit-20260627-001-feature-name-closed-world-semantic-fidelity",
    "audit-20260627-002-feature-name-post-repair-closed-world-semantic-fidelity",
    "audit-20260628-001-feature-intake-closed-world-semantic-fidelity",
    "audit-20260628-002-feature-intake-post-repair-closed-world-semantic-fidelity",
    "audit-20260629-001-free-models-closed-world-semantic-fidelity",
    "audit-20260629-002-free-models-post-repair-closed-world-semantic-fidelity",
})
# Matrix fields that came with the newer schema. A matrix row that lacks only these is a
# legacy-format row; one that lacks a closure field (what it closes, how, why, with what
# evidence, under which registry closure) is not a closure and stays an error.
# The frozen inventory of those directories' tracked bytes at the freeze commit. A listed
# directory gets the rule only while the inventory file has exactly this SHA-256 and every file
# it lists still has its frozen bytes (repair_closure_matrix.jsonl may only grow by appended
# lines, and only its frozen rows are historical). New content under a listed name, an edited
# historical file, or an edited inventory gets the full rules.
LEGACY_INVENTORY = "Plans/.audits/_legacy_format_inventory.json"
LEGACY_INVENTORY_SHA256 = "2c2a6969c490eccb9dfcbf5c893c06e788e152fa272c9751aab393980705e807"
LEGACY_MATRIX_CLOSURE_FIELDS = frozenset({
    "source_artifact", "source_row", "closure_status", "closure_evidence", "closure_reason", "registry_closure_id",
})
LEGACY_MATRIX_EVOLUTION_FIELDS = frozenset(MATRIX_REQUIRED_FIELDS - LEGACY_MATRIX_CLOSURE_FIELDS)
LEGACY_LIST_FIELDS = frozenset({"source_atom_ids", "plan_unit_ids", "owner_docs", "detail_keys", "exact_tokens"})
# Companion files the validator reads in their own role. Listed as a source artifact, one would be
# validated twice under two roles, and only a prefix of the matrix is frozen; a run that lists any
# of them as a source gets no demotions at all (Q7 Sol r5).
LEGACY_RESERVED_SOURCE_NAMES = frozenset({"repair_closure_matrix.jsonl", "audit_report.json", "effective_status.json",
                                          "audit_scope_manifest.jsonl", "repair_impact_matrix.jsonl"})


def reserved_source_names(audit_dir: Path, requested: Any) -> list[str]:
    """The companion files that requested source-artifact arguments name, by file identity rather
    than spelling: each argument is joined to the audit directory and normalized, so `./x`, `a/../x`,
    repeated separators and an absolute path to the same file all count, and an existing file that
    is the same file as a companion (os.path.samefile) counts too (Q7 Sol r6)."""
    found: set[str] = set()
    companions = {name: os.path.normpath(str(audit_dir / name)) for name in LEGACY_RESERVED_SOURCE_NAMES}
    for arg in requested or ():
        if not isinstance(arg, str):
            continue
        candidate = os.path.normpath(str(audit_dir / arg))
        for name, path in companions.items():
            if candidate == path:
                found.add(name)
            else:
                try:
                    if os.path.exists(candidate) and os.path.exists(path) and os.path.samefile(candidate, path):
                        found.add(name)
                except OSError:
                    found.add(name)  # cannot tell: fail closed
    return sorted(found)
_LEGACY_INVENTORY_CACHE: dict[str, Any] = {}


def _legacy_inventory() -> dict[str, Any] | None:
    """The frozen inventory, or None when it is missing, unreadable or not the pinned bytes."""
    key = f"{ROOT}|{LEGACY_INVENTORY_SHA256}"
    if key not in _LEGACY_INVENTORY_CACHE:
        value = None
        try:
            data = contained_path(ROOT, LEGACY_INVENTORY).read_bytes()
            if hashlib.sha256(data).hexdigest() == LEGACY_INVENTORY_SHA256:
                parsed = strict_json_loads(data.decode("utf-8"))
                if isinstance(parsed, dict) and isinstance(parsed.get("directories"), dict):
                    value = parsed
        except (OSError, AnchorError, UnicodeDecodeError, json.JSONDecodeError):
            value = None
        _LEGACY_INVENTORY_CACHE[key] = value
    return _LEGACY_INVENTORY_CACHE[key]


def path_has_symlink(path: Path | str) -> bool:
    """Whether the path as written traverses a symbolic link below the repository root: every
    cumulative prefix of its components, taken literally (`a/../b` keeps `a`, nothing normalized or
    resolved first), is checked with lstat, including the leaf. A path outside the root is checked
    from its first component. An error while checking counts as a link (fail closed)."""
    raw = Path(path) if Path(path).is_absolute() else ROOT / path
    parts = raw.parts
    root_parts = ROOT.parts
    start = len(root_parts) if parts[: len(root_parts)] == root_parts else 1
    current = Path(*parts[:start]) if start else Path(parts[0])
    for part in parts[start:]:
        current = current / part
        try:
            if os.path.islink(current):
                return True
        except OSError:
            return True
    return False


def legacy_audit_state(audit_dir: Path) -> dict[str, Any] | None:
    """The legacy-rule state of an audit directory, or None when the rule does not apply.

    It applies only when the directory is the real Plans/.audits/<name> of this repository (no
    symlink in any component below the repository root, and the given path resolves to it), the
    name is on LEGACY_AUDIT_DIRS, the pinned inventory lists it, and every inventoried file is a
    regular file with its frozen bytes; repair_closure_matrix.jsonl may extend its frozen bytes
    with appended lines. The state gives `historical_matrix_lines` (how many matrix rows are
    historical; None when the directory had no matrix) and `frozen_files` (the inventoried file
    names). Files that are not inventoried, such as a source artifact or report added later, get
    the full rules."""
    audit_dir = audit_dir if audit_dir.is_absolute() else ROOT / audit_dir
    name = audit_dir.name
    if name not in LEGACY_AUDIT_DIRS:
        return None
    rel_dir = f"Plans/.audits/{name}"
    try:
        expected = contained_path(ROOT, rel_dir)
        if not expected.is_dir() or audit_dir.resolve() != expected:
            return None
        # The path as supplied must itself be ROOT/Plans/.audits/<name>, not an alias that resolves
        # to it: no symlink in any supplied component, checked as written before `..` collapses
        # (Q7 Astra r1, Sol r7).
        if path_has_symlink(audit_dir):
            return None
        if Path(os.path.normpath(str(audit_dir))) != Path(os.path.normpath(str(ROOT / rel_dir))):
            return None
    except (AnchorError, OSError):
        return None
    inventory = _legacy_inventory()
    entry = (inventory or {}).get("directories", {}).get(name)
    if not isinstance(entry, dict) or not isinstance(entry.get("files"), dict):
        return None
    historical_matrix_lines = None
    for file_name, frozen in sorted(entry["files"].items()):
        try:
            path = contained_path(ROOT, f"{rel_dir}/{file_name}")
            if not path.is_file():
                return None
            data = path.read_bytes()
        except (AnchorError, OSError):
            return None
        if file_name == "repair_closure_matrix.jsonl":
            size, lines = frozen.get("bytes"), frozen.get("lines")
            if not isinstance(size, int) or not isinstance(lines, int) or len(data) < size:
                return None
            if hashlib.sha256(data[:size]).hexdigest() != frozen.get("sha256"):
                return None
            if size and data[size - 1:size] != b"\n":
                return None
            historical_matrix_lines = lines
        elif hashlib.sha256(data).hexdigest() != frozen.get("sha256"):
            return None
    return {"historical_matrix_lines": historical_matrix_lines, "frozen_files": sorted(entry["files"])}


def classify_legacy_format_errors(
    audit_dir: Path,
    errors: list[str],
    context: dict[str, Any],
) -> tuple[list[str], dict[str, list[str]]]:
    """Split the errors of a legacy audit dir into (kept errors, demoted messages by kind).

    It reads only the structure each producer recorded with its message (AuditDiagnostics.meta):
    the exact path object the producer read, the row, the kind and the field data. The message
    text is never parsed, so a file name or message content cannot steer it; an error without
    recorded structure is kept. `context` says which files are frozen (`frozen_files`), how many
    matrix rows are historical (`historical_matrix_lines`), which matrix rows' identity agrees
    with their registry closure (`matrix_identity_agrees`, by line), which source artifacts the
    run read (`source_artifacts`), whether any input read is new (`unfrozen_inputs`) or a
    symbolic link (`symlinked_inputs`, which keeps every error), whether a companion file was
    requested as a source artifact (`reserved_source_inputs`, which also keeps every error), and whether every
    non-actionable row a historical closure covers was judged by the compatibility inference
    (`extra_coverage_all_inferred`)."""
    meta = list(getattr(errors, "meta", None) or [])
    if len(meta) != len(errors) or context.get("symlinked_inputs") or context.get("reserved_source_inputs") \
            or reserved_source_names(audit_dir, context.get("source_artifacts")):
        return list(errors), {}
    frozen = set(context.get("frozen_files") or ())
    historical_lines = context.get("historical_matrix_lines")
    identity_agrees = set(context.get("matrix_identity_agrees") or ())
    requested = set(context.get("source_artifacts") or ())
    inputs_frozen = not context.get("unfrozen_inputs")
    matrix_name, report_name = "repair_closure_matrix.jsonl", "audit_report.json"

    def own_name(origin: Any) -> str | None:
        """The file name if `origin` is a regular, non-symlinked file directly in this audit dir."""
        if not isinstance(origin, Path) or origin.parent != audit_dir:
            return None
        try:
            if origin.is_symlink():
                return None
            contained_path(ROOT, f"Plans/.audits/{audit_dir.name}/{origin.name}")
        except (AnchorError, OSError):
            return None
        return origin.name

    def historical_row(row: Any) -> bool:
        return isinstance(row, int) and not isinstance(row, bool) and isinstance(historical_lines, int) and 0 < row <= historical_lines

    kept: list[str] = []
    demoted: dict[str, list[str]] = {}
    for message, info in zip(errors, meta):
        kind = None
        if isinstance(info, dict):
            name, k = own_name(info.get("origin")), info.get("kind")
            # A companion file never takes the source path: the matrix is frozen only up to its
            # historical rows, and its rows must also agree with their registry closures.
            frozen_source = name is not None and name in frozen and name in requested and name not in LEGACY_RESERVED_SOURCE_NAMES
            frozen_matrix_row = name == matrix_name and name in frozen and historical_row(info.get("row"))
            if k in ("ref_missing", "ref_empty") and info.get("field") in AUDIT_REF_FIELDS:
                if frozen_source or frozen_matrix_row or (name == report_name and name in frozen):
                    kind = "reference_field_predates_schema"
            elif k == "finding_missing_fields":
                if frozen_source and info.get("fields") and set(info["fields"]) <= AUDIT_SOURCE_FINDING_REQUIRED_FIELDS:
                    kind = "row_field_predates_schema"
            elif k == "matrix_missing_fields":
                if frozen_matrix_row and info.get("fields") and set(info["fields"]) <= LEGACY_MATRIX_EVOLUTION_FIELDS:
                    kind = "row_field_predates_schema"
            elif k == "matrix_list_type":
                if frozen_matrix_row and info.get("absent") is True and info.get("field") in LEGACY_LIST_FIELDS:
                    kind = "row_field_predates_schema"
            elif k == "matrix_key_empty":
                if frozen_matrix_row and info.get("absent") is True:
                    kind = "row_field_predates_schema"
            elif k == "key_algorithm":
                if frozen_source or (frozen_matrix_row and info.get("row") in identity_agrees):
                    kind = "finding_key_predates_algorithm"
            elif k == "artifact_absent":
                if name in (SCOPE_MANIFEST, IMPACT_MATRIX) and name not in frozen and inputs_frozen \
                        and not info["origin"].exists():
                    kind = "artifact_predates_schema"
            elif k == "scope_coverage":
                if name == SCOPE_MANIFEST and name not in frozen and inputs_frozen and info.get("manifest_exists") is False:
                    kind = "artifact_predates_schema"
            elif k == "report_count":
                if name == report_name and name in frozen and info.get("reported_absent") is True:
                    kind = "report_field_predates_schema"
            elif k == "report_status":
                if name == report_name and name in frozen and info.get("status_stated") is False:
                    kind = "report_field_predates_schema"
            elif k == "over_coverage":
                if name == matrix_name and name in frozen and context.get("extra_coverage_all_inferred"):
                    kind = "inferred_actionability_over_coverage"
        if kind is None:
            kept.append(message)
        else:
            demoted.setdefault(kind, []).append(message)
    return kept, demoted


def apply_legacy_format_rule(audit_dir: Path, report: dict[str, Any], context: dict[str, Any]) -> dict[str, Any]:
    """Apply the legacy format rule to a finished audit-dir report (in place)."""
    if context.get("legacy_state") is None:
        return report
    kept, demoted = classify_legacy_format_errors(audit_dir, report.get("errors", []), context)
    counts = {kind: len(messages) for kind, messages in sorted(demoted.items())}
    report["errors"] = kept
    report["legacy_format_rule"] = {
        "rule_id": LEGACY_FORMAT_RULE_ID,
        "cutoff": LEGACY_FORMAT_CUTOFF,
        "demoted_count": sum(counts.values()),
        "demoted_by_kind": counts,
        "examples": {kind: messages[:3] for kind, messages in sorted(demoted.items())},
        "limit": "never excuses a missing closure row or any other substantive gap",
    }
    if counts:
        report.setdefault("warnings", []).append(
            f"{rel(audit_dir)}: {LEGACY_FORMAT_RULE_ID} reports {sum(counts.values())} pre-July format and "
            f"schema-evolution errors as warnings ({', '.join(f'{k} {v}' for k, v in counts.items())}); "
            "it never excuses a missing closure row or any other substantive gap"
        )
    return report


AUDIT_CORRECTION_SCHEMA = "pm.audit_closure.audit_correction.v1"


def validate_audit_correction(
    audit_dir: Path,
    audit_report: dict[str, Any] | None,
    actionable_rows: set[tuple[str, str]],
    covered: set[tuple[str, str]],
    requested_artifacts: list[str],
    errors: list[str],
) -> dict[str, Any] | None:
    """Validate one additive receipt; apply nothing unless the entire receipt is valid.

    The receipt can only correct the original status or explain existing over-coverage.
    It never changes source classification, coverage requirements, matrix or registry rows.
    All standard source inputs are hash-bound so a partial source selection cannot redefine
    the original repair count or silently skip the classification of a listed source row.
    """
    paths = sorted(audit_dir.glob("audit_correction-*.json"))
    if not paths:
        return None
    start = len(errors)
    if len(paths) != 1:
        errors.append(f"{rel(audit_dir)}: audit correction requires exactly one correction file")
        return None
    path = paths[0]
    label = rel(path)

    def fail(message: str) -> None:
        errors.append(f"{label}: audit correction {message}")

    def strict_object(pairs: list[tuple[str, Any]]) -> dict[str, Any]:
        result: dict[str, Any] = {}
        for key, value in pairs:
            if key in result:
                raise ValueError(f"duplicate field {key!r}")
            result[key] = value
        return result

    try:
        if path_has_symlink(path):
            raise ValueError("file must not be reached through a symlink")
        data = json.loads(path.read_text(encoding="utf-8"), object_pairs_hook=strict_object)
    except (OSError, ValueError) as exc:
        fail(f"cannot be read: {exc}")
        return None
    fields = {"schema_id", "audit_id", "decision_ref", "date", "bound_sha256", "historical_status", "non_actionable_rows"}
    if not isinstance(data, dict) or set(data) != fields:
        fail(f"fields must be exactly {sorted(fields)}")
        return None
    if data["schema_id"] != AUDIT_CORRECTION_SCHEMA:
        fail(f"schema_id must be {AUDIT_CORRECTION_SCHEMA}")
    if audit_report is None or data["audit_id"] != audit_dir.name or data["audit_id"] != audit_report.get("audit_id"):
        fail("audit_id must match the directory and audit_report.json")
    if not isinstance(data["decision_ref"], str) or not re.fullmatch(r"Plans/Decision_Log\.md#DL-[0-9]{3,}", data["decision_ref"]):
        fail("decision_ref must name a Decision_Log.md DL unit")
    try:
        date = datetime.strptime(data["date"], "%Y-%m-%d").strftime("%Y-%m-%d")
        if data["date"] != date or path.name != f"audit_correction-{date.replace('-', '')}.json":
            raise ValueError("date and filename disagree")
    except (TypeError, ValueError):
        fail("date must be YYYY-MM-DD and match audit_correction-<YYYYMMDD>.json")

    sources = {name for name in DEFAULT_AUDIT_SOURCE_ARTIFACTS if (audit_dir / name).exists()}
    if set(requested_artifacts) != sources:
        fail("requires the complete standard source-artifact selection")
    required_bindings = sources | {"audit_report.json", "repair_closure_matrix.jsonl"}
    bindings = data["bound_sha256"]
    if not isinstance(bindings, dict) or set(bindings) != required_bindings:
        fail(f"bound_sha256 must bind exactly {sorted(required_bindings)}")
    else:
        for name, digest in bindings.items():
            target = audit_dir / name
            try:
                if path_has_symlink(target) or not target.is_file():
                    raise ValueError("must be a regular file without symlinks")
                if not isinstance(digest, str) or not re.fullmatch(r"[0-9a-f]{64}", digest) or sha256_file(target) != digest:
                    raise ValueError("SHA-256 does not match")
            except (OSError, ValueError) as exc:
                fail(f"bound hash for {name}: {exc}")

    status = data["historical_status"]
    if status is not None:
        if not isinstance(status, dict) or set(status) != {"from", "to", "reason"}:
            fail("historical_status must be null or contain only from, to, reason")
        elif not isinstance(status["reason"], str) or not status["reason"].strip():
            fail("historical_status reason must be non-empty")
        elif not audit_report or status["from"] != audit_report.get("status") or status["from"] == "BLOCKED" \
                or status["to"] != "BLOCKED" or not actionable_rows:
            fail("historical_status may only change the recorded status to BLOCKED with original repair_required_count > 0")

    entries = data["non_actionable_rows"]
    accepted: set[tuple[str, str]] = set()
    if not isinstance(entries, list):
        fail("non_actionable_rows must be a list")
    else:
        for index, entry in enumerate(entries):
            if not isinstance(entry, dict) or set(entry) != {"source_artifact", "source_row", "reason"}:
                fail(f"non_actionable_rows[{index}] fields must be exactly source_artifact, source_row, reason")
                continue
            artifact, row = entry["source_artifact"], entry["source_row"]
            if not isinstance(artifact, str) or artifact not in sources or isinstance(row, bool) \
                    or not isinstance(row, (str, int)) or (isinstance(row, str) and not row.strip()):
                fail(f"non_actionable_rows[{index}] must identify a standard source row")
                continue
            key = (artifact, str(row))
            if key in accepted:
                fail(f"duplicates source row {key}")
            accepted.add(key)
            if not isinstance(entry["reason"], str) or not entry["reason"].strip():
                fail(f"source row {key} reason must be non-empty")
            if key in actionable_rows or (artifact, "$") in actionable_rows:
                fail(f"source row {key} is actionable; correction cannot excuse missing coverage")
            if key not in covered:
                fail(f"source row {key} is not covered by the matrix")
            # A fabricated matrix key is not a source row, even if inference did not list it.
            try:
                source = json.loads((audit_dir / artifact).read_text(encoding="utf-8")) if artifact.endswith(".json") else None
                if artifact.endswith(".jsonl"):
                    lines = _lines((audit_dir / artifact).read_text(encoding="utf-8"))
                    if not str(row).isdigit() or str(row) != str(int(row)) or not 0 < int(row) <= len(lines)                             or not lines[int(row) - 1].strip():
                        raise ValueError("JSONL row does not exist or is not a canonical positive line number")
                elif artifact == "validator_results.json" and str(row).startswith(("results.", "invalid_invocations.")):
                    group, name = str(row).split(".", 1)
                    if not any(isinstance(item, dict) and item.get("name") == name for item in source.get(group, [])):
                        raise ValueError("validator source row does not exist")
                else:
                    # v1 admits only physical JSONL rows and named validator-result rows.
                    raise ValueError("unsupported source-row address")
            except (OSError, ValueError, TypeError, AttributeError) as exc:
                fail(f"source row {key}: {exc}")
    if status is None and not accepted:
        fail("must correct a status or at least one existing non-actionable matrix row")
    if len(errors) != start:
        return None
    return {
        "path": label,
        "schema_id": AUDIT_CORRECTION_SCHEMA,
        "decision_ref": data["decision_ref"],
        "date": data["date"],
        "historical_status": audit_report.get("status"),
        "corrected_status": status["to"] if status is not None else audit_report.get("status"),
        "status_reason": status["reason"] if status is not None else None,
        "non_actionable_rows": entries,
    }


def validate_audit_dir(
    audit_dir: Path,
    *,
    require_matrix: bool,
    require_effective_status: bool,
    source_artifacts: list[str] | None,
    registry_path: Path,
) -> dict[str, Any]:
    errors: list[str] = AuditDiagnostics()
    warnings: list[str] = []
    audit_dir = audit_dir if audit_dir.is_absolute() else ROOT / audit_dir
    # One registry path for the symlink guard and the read, anchored like audit_dir (Q7 Sol r8):
    # a relative path is repository-relative, never relative to the process working directory.
    registry_path = registry_path if registry_path.is_absolute() else ROOT / registry_path
    matrix_path = audit_dir / "repair_closure_matrix.jsonl"
    if not audit_dir.exists():
        return {"path": rel(audit_dir), "errors": [f"missing audit dir {rel(audit_dir)}"], "warnings": warnings}

    audit_report, audit_refs = load_audit_report(audit_dir, errors)

    requested_artifacts = source_artifacts
    if requested_artifacts is None:
        requested_artifacts = [name for name in DEFAULT_AUDIT_SOURCE_ARTIFACTS if (audit_dir / name).exists()]

    source_report = validate_source_artifacts(audit_dir, requested_artifacts, audit_refs, errors)
    scope_report = validate_scope_manifest(audit_dir, audit_refs, errors)

    legacy_state = legacy_audit_state(audit_dir)
    reserved_inputs = reserved_source_names(audit_dir, requested_artifacts)
    # Any input the run reads that is a symbolic link disqualifies the directory: what a
    # diagnostic names is then not the file that was read.
    # Every path the per-audit run reads, checked component by component as written (a source
    # argument through a symlinked parent counts), plus the registry (Q7 Sol r7).
    symlinked_inputs = sorted(
        [name for name in {*requested_artifacts, "audit_report.json", "repair_closure_matrix.jsonl", SCOPE_MANIFEST, IMPACT_MATRIX,
                           EFFECTIVE_STATUS, TERMINAL_STATE, "post_repair_audit_report.json"}
         if path_has_symlink(audit_dir / name)]
        + (["<registry>"] if path_has_symlink(registry_path) else [])
    )
    # Q-A compatibility words (DL-340) apply only when the whole run qualifies for the legacy rule:
    # an eligible June directory, no reserved companion file requested as a source, and no input
    # read through a symlink (Q-A Astra r1). Even then they apply only to a frozen file, never to
    # repair_closure_matrix.jsonl, whose frozen part is only a prefix.
    compat_files = (
        set((legacy_state or {}).get("frozen_files") or []) - {"repair_closure_matrix.jsonl"}
        if legacy_state is not None and not reserved_inputs and not symlinked_inputs else set()
    )
    actionable_rows: set[tuple[str, str]] = set()
    inferred_rows: set[tuple[str, str]] = set()
    for artifact in requested_artifacts:
        inferred_keys: set[str] = set()
        explicit_keys: set[str] = set()
        compat_words = artifact in compat_files and not path_has_symlink(audit_dir / artifact)
        for source_row in actionable_artifact_rows(audit_dir / artifact, artifact, errors, inferred_keys, explicit_keys,
                                                   compat_words):
            actionable_rows.add((artifact, str(source_row)))
        if "*" not in explicit_keys:
            # A key counts as inferred only if no row that shares it states either field.
            inferred_rows.update((artifact, key) for key in inferred_keys - explicit_keys)
    legacy_context: dict[str, Any] = {
        "legacy_state": legacy_state,
        "historical_matrix_lines": (legacy_state or {}).get("historical_matrix_lines"),
        "frozen_files": (legacy_state or {}).get("frozen_files") or [],
        "unfrozen_inputs": sorted(
            name for name in [*requested_artifacts, "audit_report.json"]
            if (audit_dir / name).exists() and name not in set((legacy_state or {}).get("frozen_files") or [])
        ),
        "matrix_identity_agrees": set(),
        "source_artifacts": list(requested_artifacts),
        "reserved_source_inputs": reserved_inputs,
        "symlinked_inputs": symlinked_inputs,
        "report_has_status": isinstance(audit_report, dict) and "status" in audit_report,
        "scope_manifest_exists": (audit_dir / SCOPE_MANIFEST).exists(),
        "extra_coverage_all_inferred": False,
    }

    impact_report = validate_repair_impact_matrix(audit_dir, audit_refs, actionable_rows, errors)
    rows = read_jsonl(matrix_path, errors, required=True) if matrix_path.exists() else []
    matrix_keys = {
        key for row in rows
        if isinstance(row.get("source_artifact"), str)
        and (key := source_row_key(row["source_artifact"], row.get("source_row"))) is not None
    }
    correction = validate_audit_correction(audit_dir, audit_report, actionable_rows, matrix_keys, requested_artifacts, errors)
    corrected_rows = {
        (row["source_artifact"], str(row["source_row"])) for row in correction["non_actionable_rows"]
    } if correction else set()
    status_report = dict(audit_report, status=correction["corrected_status"]) if correction else audit_report
    validate_audit_report_status(
        status_report,
        audit_dir,
        repair_required_count=len(actionable_rows),
        finding_count=int(source_report.get("finding_count", 0)),
        errors=errors,
    )

    if not matrix_path.exists():
        if require_matrix and actionable_rows:
            errors.append(f"missing required {rel(matrix_path)}")
        else:
            if not require_matrix:
                warnings.append(f"no repair_closure_matrix.jsonl found for {rel(audit_dir)}; completeness check skipped")
        effective_status_report = validate_effective_status_projection(
            audit_dir,
            {
                "source_artifacts": source_report,
                "original_repair_required_count": len(actionable_rows),
                "repair_required_count": len(actionable_rows),
                "terminal_repair_state": "repair_required" if actionable_rows else "no_repair_required",
            },
            errors,
            required=require_effective_status,
        )
        report = {
            "path": rel(audit_dir),
            "errors": errors,
            "warnings": warnings,
            "matrix_rows": 0,
            "coverage_artifacts": requested_artifacts,
            "source_artifacts": source_report,
            "scope_manifest": {key: value for key, value in scope_report.items() if key != "finding_keys"},
            "repair_impact_matrix": impact_report,
            "original_repair_required_count": len(actionable_rows),
            "repair_required_count": len(actionable_rows),
            "matrix_required": bool(actionable_rows),
            "terminal_repair_state": "repair_required" if actionable_rows else "no_repair_required",
            "missing_coverage": [
                {"source_artifact": artifact, "source_row": source_row}
                for artifact, source_row in sorted(actionable_rows)
            ][:50] if actionable_rows else [],
        }
        if effective_status_report is not None:
            report["effective_status_projection"] = effective_status_report
        return apply_legacy_format_rule(audit_dir, report, legacy_context)

    registry_by_id = registry_lookup(registry_path, errors)
    covered: set[tuple[str, str]] = set()
    cover_lines: dict[tuple[str, str], list[int]] = {}
    status_counts: dict[str, int] = {}
    open_matrix_rows: list[dict[str, Any]] = []

    for row in rows:
        label = f"{rel(matrix_path)}:{row.get('_line_no')}"
        line_no = row.get("_line_no")
        missing = sorted(MATRIX_REQUIRED_FIELDS - set(row))
        if missing:
            _diag(errors, f"{label}: missing required fields {missing}",
                  origin=matrix_path, row=line_no, kind="matrix_missing_fields", fields=list(missing))
        validate_ref_fields(row, audit_refs, label, errors, require=True, allow_row_scoped_refs=True,
                            origin=matrix_path, row_key=line_no)
        status = str(row.get("closure_status", ""))
        status_counts[status] = status_counts.get(status, 0) + 1
        if status not in ALLOWED_STATUSES:
            errors.append(f"{label}: invalid closure_status {status}")
        if status == "reopened":
            errors.append(f"{label}: repair_closure_matrix rows must close the item, not use reopened")
        if status in OPEN_STATUSES:
            open_matrix_rows.append(
                {
                    "source_artifact": row.get("source_artifact"),
                    "source_row": row.get("source_row"),
                    "finding_key": row.get("finding_key"),
                    "closure_status": status,
                }
            )
        finding_key = row.get("finding_key")
        if not isinstance(finding_key, str) or not finding_key.strip():
            _diag(errors, f"{label}: finding_key must be non-empty",
                  origin=matrix_path, row=line_no, kind="matrix_key_empty", absent="finding_key" not in row)
        elif finding_key != compute_finding_key(row):
            _diag(errors, f"{label}: finding_key {finding_key} does not match deterministic {compute_finding_key(row)}",
                  origin=matrix_path, row=line_no, kind="key_algorithm")
        for field in ("source_atom_ids", "plan_unit_ids", "owner_docs", "detail_keys", "exact_tokens"):
            if not isinstance(row.get(field), list):
                _diag(errors, f"{label}: {field} must be a list",
                      origin=matrix_path, row=line_no, kind="matrix_list_type", field=field, absent=field not in row)
        closure_reason = row.get("closure_reason")
        if not isinstance(closure_reason, str) or not closure_reason.strip():
            errors.append(f"{label}: closure_reason must be non-empty")
        registry_closure_id = row.get("registry_closure_id")
        if not isinstance(registry_closure_id, str) or not registry_closure_id.strip():
            errors.append(f"{label}: registry_closure_id must be non-empty")
        elif registry_closure_id not in registry_by_id:
            errors.append(f"{label}: registry_closure_id {registry_closure_id} is not present in registry")
        else:
            registry_row = registry_by_id[registry_closure_id]
            if compute_finding_key(row) == compute_finding_key(registry_row):
                legacy_context["matrix_identity_agrees"].add(line_no)
            if registry_row.get("finding_key") != finding_key:
                errors.append(f"{label}: registry row finding_key does not match matrix finding_key")
            if registry_row.get("closure_status") != status:
                errors.append(f"{label}: registry row closure_status does not match matrix closure_status")
            if audit_dir.name not in registry_row.get("audit_ids", []):
                errors.append(f"{label}: registry row audit_ids does not include {audit_dir.name}")
            if registry_row.get("closed_by_audit_id") != audit_dir.name:
                errors.append(f"{label}: registry row closed_by_audit_id does not match {audit_dir.name}")
        artifact = row.get("source_artifact")
        if artifact is not None and not isinstance(artifact, str):
            errors.append(f"{label}: source_artifact must be a string")
            continue
        if isinstance(artifact, str):
            source_path = audit_dir / artifact
            if not source_path.exists():
                errors.append(f"{label}: source_artifact does not exist: {artifact}")
            key = source_row_key(artifact, row.get("source_row"))
            if key:
                covered.add(key)
                cover_lines.setdefault(key, []).append(int(row.get("_line_no") or 0))
            else:
                errors.append(f"{label}: source_row must be a non-empty string or integer")

        evidence = row.get("closure_evidence", row.get("evidence"))
        validate_evidence_refs(evidence, label, errors)

    missing_coverage: list[dict[str, Any]] = []
    for artifact, source_row in sorted(actionable_rows):
        if (artifact, source_row) not in covered:
            missing_coverage.append({"source_artifact": artifact, "source_row": source_row})

    if missing_coverage:
        errors.append(f"{rel(matrix_path)}: missing closure rows for {len(missing_coverage)} source rows")

    extra_coverage = sorted(covered - actionable_rows - corrected_rows)
    if extra_coverage:
        _diag(errors, f"{rel(matrix_path)}: closure rows present for {len(extra_coverage)} non-actionable source rows",
              origin=matrix_path, kind="over_coverage")
        historical = legacy_context["historical_matrix_lines"]
        frozen_names = set(legacy_context["frozen_files"])
        legacy_context["extra_coverage_all_inferred"] = isinstance(historical, int) and all(
            key in inferred_rows and key[0] in frozen_names
            and all(0 < line <= historical for line in cover_lines.get(key, [0]))
            for key in extra_coverage
        )

    open_repair_required_count = len(missing_coverage) + len(open_matrix_rows)
    if open_repair_required_count:
        terminal_repair_state = "repair_required"
    elif actionable_rows:
        terminal_repair_state = "repair_validated"
    else:
        terminal_repair_state = "no_repair_required"
    terminal_projection = {
        "terminal_repair_state": terminal_repair_state,
        "original_repair_required_count": len(actionable_rows),
        "open_repair_required_count": open_repair_required_count,
        "effective_terminal_report": "post_repair_audit_report.json" if terminal_repair_state == "repair_validated" else "audit_report.json",
        "historical_audit_report": "audit_report.json",
        "matrix_status_counts": status_counts,
    }
    terminal_state_report = validate_terminal_state_projection(audit_dir, audit_refs, terminal_projection, errors)
    effective_status_report = validate_effective_status_projection(
        audit_dir,
        {
            "source_artifacts": source_report,
            "original_repair_required_count": len(actionable_rows),
            "repair_required_count": open_repair_required_count,
            "terminal_repair_state": terminal_repair_state,
            "audit_correction": correction,
        },
        errors,
        required=require_effective_status,
    )

    report = {
        "path": rel(audit_dir),
        "matrix": rel(matrix_path),
        "matrix_rows": len(rows),
        "status_counts": status_counts,
        "coverage_artifacts": requested_artifacts,
        "source_artifacts": source_report,
        "scope_manifest": {key: value for key, value in scope_report.items() if key != "finding_keys"},
        "repair_impact_matrix": impact_report,
        "original_repair_required_count": len(actionable_rows),
        "repair_required_count": open_repair_required_count,
        "matrix_required": bool(actionable_rows),
        "terminal_repair_state": terminal_repair_state,
        "terminal_projection": terminal_projection,
        "open_matrix_rows": open_matrix_rows,
        "missing_coverage": missing_coverage[:50],
        "extra_coverage": [
            {"source_artifact": artifact, "source_row": source_row}
            for artifact, source_row in extra_coverage[:50]
        ],
        "errors": errors,
        "warnings": warnings,
    }
    if terminal_state_report is not None:
        report["terminal_state_projection"] = terminal_state_report
    if effective_status_report is not None:
        report["effective_status_projection"] = effective_status_report
    if correction is not None:
        report["audit_correction"] = correction
    return apply_legacy_format_rule(audit_dir, report, legacy_context)


def cmd_validate(args: argparse.Namespace) -> int:
    registry_path = repo_path(args.registry)
    registry = validate_registry(registry_path)
    audit_reports = [
        validate_audit_dir(
            repo_path(audit_dir),
            require_matrix=args.require_closure_matrix,
            require_effective_status=args.require_effective_status,
            source_artifacts=args.source_artifact,
            registry_path=registry_path,
        )
        for audit_dir in args.audit_dir
    ]
    errors = list(registry["errors"])
    warnings = list(registry["warnings"])
    for report in audit_reports:
        errors.extend(report.get("errors", []))
        warnings.extend(report.get("warnings", []))

    result = {
        "schema_id": "pm.audit_closure.validator_report.v1",
        "status": "fail" if errors else "pass",
        "registry": registry,
        "audit_dirs": audit_reports,
        "errors": errors,
        "warnings": warnings,
    }
    print(json.dumps(result, indent=2, sort_keys=True))
    return 1 if errors else 0


def cmd_effective_status(args: argparse.Namespace) -> int:
    registry_path = repo_path(args.registry)
    audit_dirs = [repo_path(audit_dir) for audit_dir in args.audit_dir]
    if args.all:
        audit_dirs.extend(sorted(path for path in (ROOT / "Plans/.audits").iterdir() if path.is_dir()))
    seen: set[str] = set()
    unique_audit_dirs: list[Path] = []
    for audit_dir in audit_dirs:
        key = str(audit_dir.resolve())
        if key not in seen:
            seen.add(key)
            unique_audit_dirs.append(audit_dir)

    projections: list[dict[str, Any]] = []
    errors: list[str] = []
    for audit_dir in unique_audit_dirs:
        validation = validate_audit_dir(
            audit_dir,
            require_matrix=False,
            require_effective_status=False,
            source_artifacts=args.source_artifact,
            registry_path=registry_path,
        )
        projection = build_effective_status_projection(audit_dir, validation)
        projections.append(projection)
        if args.write:
            write_json(audit_dir / EFFECTIVE_STATUS, projection)
        if projection["effective_status"] == "BLOCKED" and projection.get("repair_required_count") == 0:
            errors.append(f"{rel(audit_dir / EFFECTIVE_STATUS)}: BLOCKED cannot have repair_required_count=0")

    result = {
        "schema_id": "pm.audit_effective_status.summary.v1",
        "status": "fail" if errors else "pass",
        "write": bool(args.write),
        "audit_count": len(projections),
        "status_counts": {},
        "errors": errors,
        "audits": projections,
    }
    for projection in projections:
        status = str(projection.get("effective_status"))
        result["status_counts"][status] = result["status_counts"].get(status, 0) + 1
    print(json.dumps(result, indent=2, sort_keys=True))
    return 1 if errors else 0


def cmd_refresh_hashes(args: argparse.Namespace) -> int:
    """Report which stored evidence hashes differ from the files now. It never writes:
    restamping closure-registry hashes without a re-audit is forbidden (DL-039). A closure
    whose evidence changed is re-audited and recorded with reaudit-append (PLS-025)."""
    if not args.dry_run:
        print(json.dumps({
            "schema_id": "pm.audit_closure.refresh_hashes_report.v1",
            "status": "fail",
            "error": "refresh-hashes no longer writes the registry: restamping closure hashes without a re-audit "
                     "is forbidden (DL-039). Re-audit the closure and append it with reaudit-append; "
                     "--dry-run still reports which hashes differ.",
        }, indent=2, sort_keys=True))
        return 2
    registry_path = repo_path(args.registry)
    errors: list[str] = []
    rows = read_jsonl(registry_path, errors, required=True)
    if errors:
        print(json.dumps({
            "schema_id": "pm.audit_closure.refresh_hashes_report.v1",
            "status": "fail",
            "path": rel(registry_path),
            "errors": errors,
        }, indent=2, sort_keys=True))
        return 1

    owner_updates = 0
    closure_updates = 0
    missing_refs: list[dict[str, Any]] = []
    touched_rows = 0
    now = utc_now()
    for row in rows:
        hashes = row.get("hashes")
        if not isinstance(hashes, dict):
            continue
        before_owner = owner_updates
        before_closure = closure_updates
        if hashes.get("hash_scope") == ANCHOR_SCOPE:
            stale_now: list[str] = []
            structural: list[str] = []
            validate_hashes(hashes, f"line {row.get('_line_no')}", structural, stale_now, AnchorResolver())
            errors.extend(structural)
            for group in ("owner_evidence_hashes", "closure_evidence_hashes"):
                for ref in sorted(hashes.get(group) or {}) if isinstance(hashes.get(group), dict) else []:
                    if any(f"{group} anchor {ref} no longer resolves" in item for item in stale_now):
                        missing_refs.append({"line": row.get("_line_no"), "group": group, "ref": ref, "anchor": True})
            differing = [item for item in stale_now if " is stale " in item]
            owner_updates += sum("owner_evidence_hashes" in item for item in differing)
            closure_updates += sum("closure_evidence_hashes" in item for item in differing)
            if owner_updates != before_owner or closure_updates != before_closure:
                touched_rows += 1
            continue
        updated, missing = refresh_current_hashes(hashes.get("owner_evidence_hashes"))
        owner_updates += updated
        missing_refs.extend(
            {"line": row.get("_line_no"), "group": "owner_evidence_hashes", "ref": ref}
            for ref in missing
        )
        updated, missing = refresh_current_hashes(hashes.get("closure_evidence_hashes"))
        closure_updates += updated
        missing_refs.extend(
            {"line": row.get("_line_no"), "group": "closure_evidence_hashes", "ref": ref}
            for ref in missing
        )
        if owner_updates != before_owner or closure_updates != before_closure:
            row["updated_at"] = now
            touched_rows += 1

    if missing_refs or errors:
        print(json.dumps({
            "schema_id": "pm.audit_closure.refresh_hashes_report.v1",
            "status": "fail",
            "path": rel(registry_path),
            "missing_refs": missing_refs,
            "errors": errors,
        }, indent=2, sort_keys=True))
        return 1

    if not args.dry_run:
        write_jsonl(registry_path, rows)

    print(json.dumps({
        "schema_id": "pm.audit_closure.refresh_hashes_report.v1",
        "status": "pass",
        "path": rel(registry_path),
        "dry_run": bool(args.dry_run),
        "row_count": len(rows),
        "touched_rows": touched_rows,
        "owner_evidence_hash_updates": owner_updates,
        "closure_evidence_hash_updates": closure_updates,
    }, indent=2, sort_keys=True))
    return 0


def build_reaudit_row(
    target: dict[str, Any],
    target_line: int,
    target_raw: str,
    record: dict[str, Any],
    record_ref: str,
    resolver: AnchorResolver,
    now: str,
) -> dict[str, Any]:
    """The append-only row that records one re-audit of `target`."""
    reaudit_id = str(record["reaudit_id"])
    verdict = record["verdict"]
    status = {
        "supported": target["closure_status"],
        "superseded_by_later_closure": target["closure_status"],
        "resolved_differently": record.get("status_now"),
        "not_supported": "reopened",
    }[verdict]
    owner_docs = set(target.get("owner_docs") or [])
    owner_hashes: dict[str, str] = {}
    closure_hashes: dict[str, str] = {}
    snapshot = record["dependency_hashes_at_recheck"]
    for ref in record["dependencies"]:
        path, _, _ = parse_anchor_ref(ref)
        # The row carries the hashes the re-audit read; staleness is current text versus these.
        (owner_hashes if path in owner_docs else closure_hashes)[ref] = snapshot[ref]
    hashes: dict[str, Any] = {"hash_scope": ANCHOR_SCOPE}
    if owner_hashes:
        hashes["owner_evidence_hashes"] = owner_hashes
    if closure_hashes:
        hashes["closure_evidence_hashes"] = closure_hashes
    if verdict == "not_supported":
        reason = f"Re-audit {reaudit_id} reopened this finding: {record['rationale']}"
    elif verdict == "superseded_by_later_closure":
        reason = f"Re-audit {reaudit_id}: superseded by later closure {record['later_closure_id']}. {record['claim']}"
    elif verdict == "resolved_differently":
        reason = f"Re-audit {reaudit_id}: resolved, now {status} (was {target['closure_status']}). {record['claim']}"
    else:
        reason = f"Re-audit {reaudit_id} confirmed against current text: {record['claim']}"
    row = {key: target[key] for key in (
        "finding_family", "ledger_id", "source_atom_ids", "plan_unit_ids", "owner_docs", "consumer_docs",
        "detail_keys", "exact_tokens", "finding_key",
    )}
    row.update({
        "closure_id": f"{reaudit_id}--{target['closure_id']}",
        "audit_ids": list(dict.fromkeys(list(target.get("audit_ids") or []) + [reaudit_id])),
        "closed_by_audit_id": reaudit_id,
        "closure_status": status,
        "closure_reason": reason,
        "closure_evidence": [record_ref] + list(record["dependencies"]),
        "hashes": hashes,
        "reopen_conditions": sorted(REOPEN_CONDITIONS),
        "supersedes": {"closure_id": target["closure_id"], "line": target_line, "row_sha256": sha256_text(target_raw)},
        "reaudit": {
            "reaudit_id": reaudit_id,
            "record": record_ref,
            "record_sha256": reaudit_record_sha256(record),
            "outcome": verdict,
            "recheck_commit": record.get("recheck_commit"),
        },
        "created_at": now,
        "updated_at": now,
    })
    return row


class _RegistryLock:
    """Advisory lock on the registry file itself for a whole read-validate-append transaction,
    so concurrent appends serialize; aliases of the same file share the lock. A writing append
    takes an exclusive lock through an append-mode descriptor (NFS grants exclusive locks only on
    descriptors open for writing; nothing is written through it); a dry run takes a shared lock
    through a read-only descriptor, so it also works on read-only registries. Where POSIX locking
    is unavailable or refused the command fails with a diagnostic rather than racing."""

    def __init__(self, path: Path, exclusive: bool = True) -> None:
        self.path = path
        self.exclusive = exclusive
        self.handle: Any = None

    def __enter__(self) -> "_RegistryLock":
        try:
            import fcntl  # noqa: PLC0415
        except ImportError as exc:  # pragma: no cover - platform dependent
            raise AnchorError("reaudit-append needs POSIX file locking (fcntl) to serialize registry appends") from exc
        if self.path.exists():
            try:
                self.handle = self.path.open("ab" if self.exclusive else "rb")
                fcntl.flock(self.handle.fileno(), fcntl.LOCK_EX if self.exclusive else fcntl.LOCK_SH)
            except OSError as exc:
                if self.handle is not None:
                    self.handle.close()
                    self.handle = None
                raise AnchorError(f"cannot lock {rel(self.path)} for {'append' if self.exclusive else 'a dry run'}: {exc}") from exc
        return self

    def __exit__(self, *exc: Any) -> None:
        if self.handle is not None:
            import fcntl  # noqa: PLC0415

            fcntl.flock(self.handle.fileno(), fcntl.LOCK_UN)
            self.handle.close()


def cmd_reaudit_append(args: argparse.Namespace) -> int:
    """Serialize the whole append transaction on the registry, then run it."""
    registry_path = repo_path(args.registry)
    try:
        with _RegistryLock(registry_path, exclusive=not getattr(args, "dry_run", False)):
            return _reaudit_append(args)
    except AnchorError as exc:
        print(json.dumps({"schema_id": "pm.audit_closure.reaudit_append_report.v1", "status": "fail", "errors": [str(exc)]}, indent=2))
        return 1


def _reaudit_append(args: argparse.Namespace) -> int:
    """Migration: append one re-audit row per reviewed record whose anchors have not moved.

    A record whose dependency anchors hash differently now than when it was rechecked is
    not appended; it is listed under `moved` for a delta re-audit. Records already
    appended (same record hash) are skipped, so the command is idempotent.
    """
    registry_path = repo_path(args.registry)
    records_path = repo_path(args.records)
    record_ref = rel(records_path)
    errors: list[str] = []
    rows = read_jsonl(registry_path, errors, required=True)
    raw_lines = raw_registry_lines(registry_path)
    records = load_reaudit_records(records_path, errors, {})
    if records is None:
        errors.append(f"missing {record_ref}")
    if errors:
        print(json.dumps({"schema_id": "pm.audit_closure.reaudit_append_report.v1", "status": "fail", "errors": errors}, indent=2))
        return 1
    only = {item for item in (args.only or "").split(",") if item}
    resolver = AnchorResolver()
    rows_by_line = {row["_line_no"]: row for row in rows}
    appended = {
        (str((row.get("reaudit") or {}).get("record_sha256")), (row.get("supersedes") or {}).get("line")): row["_line_no"]
        for row in rows if isinstance(row.get("reaudit"), dict)
    }
    accepted = validate_registry(registry_path).get("superseded_by", {}) if appended else {}
    superseded = {
        (row.get("supersedes") or {}).get("line") for row in rows if isinstance(row.get("supersedes"), dict)
    }
    now = utc_now()
    new_rows: list[dict[str, Any]] = []
    moved: list[dict[str, Any]] = []
    skipped: list[str] = []
    for closure_id, record in records.items():
        if only and closure_id not in only:
            continue
        shape = reaudit_record_shape_problems(record)
        if shape:
            errors.extend(f"{closure_id}: {problem}" for problem in shape)
            continue
        try:
            record_digest = reaudit_record_sha256(record)
        except AnchorError as exc:
            errors.append(f"{closure_id}: record is not plain JSON: {exc}")
            continue
        existing = appended.get((record_digest, record.get("line")))
        if existing is not None:
            if accepted.get(str(record.get("line"))) != existing:
                errors.append(f"{closure_id}: an earlier append of this record (line {existing}) does not validate; fix it before appending more")
            else:
                skipped.append(closure_id)
            continue
        line = record.get("line")
        target = rows_by_line.get(line)
        if target is None or target.get("closure_id") != closure_id or sha256_text(raw_lines.get(line, "")) != record.get("row_sha256"):
            errors.append(f"{closure_id}: record does not match registry line {line} byte for byte")
            continue
        if line in superseded:
            errors.append(f"{closure_id}: line {line} is already superseded; re-audit the superseding row instead")
            continue
        if record.get("verdict") not in REAUDIT_VERDICTS or not isinstance(record.get("dependencies"), list) \
                or not isinstance(record.get("dependency_hashes_at_recheck"), dict):
            errors.append(f"{closure_id}: record has an unknown verdict or malformed dependencies")
            continue
        changed: dict[str, Any] = {}
        for ref, recorded in sorted((record.get("dependency_hashes_at_recheck") or {}).items()):
            try:
                now_hash = resolver.sha256(ref)
            except AnchorError as exc:
                now_hash = f"unresolved: {exc}"
            if now_hash != recorded:
                changed[ref] = {"at_recheck": recorded, "now": now_hash}
        if set(record.get("dependency_hashes_at_recheck") or {}) != set(record.get("dependencies") or []):
            errors.append(f"{closure_id}: dependency_hashes_at_recheck must cover exactly the dependencies")
            continue
        if changed:
            moved.append({"closure_id": closure_id, "line": line, "changed_anchors": changed})
            continue
        new_rows.append(build_reaudit_row(target, line, raw_lines[line], record, record_ref, resolver, now))
    if not errors and new_rows:
        raw = registry_path.read_bytes()
        if raw and not raw.endswith(b"\n"):
            errors.append(f"{rel(registry_path)} does not end with a newline; refusing to append to an unterminated last line")
    if not errors and new_rows:
        # Validate the registry as it would be after the append, before writing anything. Every
        # error the candidate has that the registry does not have now blocks the append, whether
        # it names a new line, an existing line or no line at all.
        baseline = set(validate_registry(registry_path)["errors"])
        import tempfile  # noqa: PLC0415

        # A unique candidate created exclusively next to the registry: it can never be the input
        # registry or a file someone else owns, and only this file is removed afterwards.
        fd, candidate_name = tempfile.mkstemp(prefix=".reaudit-append-candidate-", suffix=".jsonl", dir=str(registry_path.parent))
        candidate = Path(candidate_name)
        try:
            with os.fdopen(fd, "wb") as handle:
                handle.write(registry_path.read_bytes() + "".join(
                    json.dumps(row, ensure_ascii=False, sort_keys=True) + "\n" for row in new_rows
                ).encode("utf-8"))
            report = validate_registry(candidate)
        finally:
            candidate.unlink(missing_ok=True)
        for error in report["errors"]:
            as_registry = error.replace(rel(candidate), rel(registry_path))
            if as_registry not in baseline:
                errors.append(f"candidate registry would not validate: {as_registry}")
        superseded_now = set(report.get("superseded_lines", []))
        for row in new_rows:
            if row["supersedes"]["line"] not in superseded_now:
                errors.append(f"{row['closure_id']}: candidate row would not supersede line {row['supersedes']['line']}")
    status = "fail" if errors else "pass"
    if not errors and new_rows and not args.dry_run:
        with registry_path.open("a", encoding="utf-8") as handle:
            for row in new_rows:
                handle.write(json.dumps(row, ensure_ascii=False, sort_keys=True) + "\n")
    print(json.dumps({
        "schema_id": "pm.audit_closure.reaudit_append_report.v1",
        "status": status,
        "dry_run": bool(args.dry_run),
        "registry": rel(registry_path),
        "records": record_ref,
        "appended": len(new_rows) if not errors and not args.dry_run else 0,
        "would_append": len(new_rows) if not errors else 0,
        "already_appended": len(skipped),
        "moved_since_recheck": moved,
        "errors": errors,
    }, indent=2, ensure_ascii=False))
    return 1 if errors else 0


def cmd_chain(args: argparse.Namespace) -> int:
    """Show a finding's history: every row with its finding_key, and what supersedes what."""
    registry_path = repo_path(args.registry)
    errors: list[str] = []
    rows = read_jsonl(registry_path, errors, required=True)
    wanted = args.closure
    keys = {
        row.get("finding_key") for row in rows
        if wanted in {row.get("closure_id"), row.get("finding_key"), str(row.get("_line_no"))}
    }
    chain = []
    for row in rows:
        if row.get("finding_key") in keys:
            chain.append({
                "line": row["_line_no"],
                "closure_id": row.get("closure_id"),
                "closure_status": row.get("closure_status"),
                "closed_by_audit_id": row.get("closed_by_audit_id"),
                "hash_scope": (row.get("hashes") or {}).get("hash_scope", "whole-file"),
                "supersedes_line": (row.get("supersedes") or {}).get("line"),
                "reaudit_outcome": (row.get("reaudit") or {}).get("outcome"),
                "created_at": row.get("created_at"),
                "closure_reason": row.get("closure_reason"),
            })
    print(json.dumps({"finding_keys": sorted(str(k) for k in keys), "rows": chain}, indent=2, ensure_ascii=False))
    return 0 if chain else 1


def cmd_anchor(args: argparse.Namespace) -> int:
    """Print the content and sha256 an anchor.v1 ref covers, for authors and reviewers."""
    resolver = AnchorResolver(Path(args.root).resolve() if args.root else ROOT)
    results: list[dict[str, Any]] = []
    failed = False
    for ref in args.ref:
        try:
            content, text = resolver.content(ref)
            item: dict[str, Any] = {"ref": ref, "sha256": resolver.sha256(ref)}
            if not args.hash_only:
                item["text"] = text
        except AnchorError as exc:
            item = {"ref": ref, "error": str(exc)}
            failed = True
        results.append(item)
    print(json.dumps({"schema_id": "pm.audit_closure.anchor_report.v1", "anchors": results}, indent=2, ensure_ascii=False))
    return 1 if failed else 0


SELF_TEST_DOC = """# Fixture Doc

## Alpha Section

Alpha prose says the repair is present and closed.

### FIX-001 - First Unit

```yaml
plan_unit_id: FIX-001
canonical_text: The fixture repair is present and must stay present.
acceptance_criteria:
- The repair stays.
```

### FIX-002 - Second Unit

```yaml
{plan_unit_id: "FIX-002", canonical_text: "An unrelated unit that other edits change."}
```

## Beta Section

Beta prose.

### Alpha Section

A second heading with the same title, so a bare title is ambiguous.
"""


def _self_test_registry_row(**overrides: Any) -> dict[str, Any]:
    row: dict[str, Any] = {
        "closure_id": "closure-fixture-001",
        "finding_family": "fixture_family",
        "ledger_id": "fixture-ledger",
        "audit_ids": ["audit-fixture"],
        "source_atom_ids": [],
        "plan_unit_ids": ["FIX-001"],
        "owner_docs": ["Plans/Fixture.md"],
        "consumer_docs": [],
        "detail_keys": ["fixture"],
        "exact_tokens": ["fixture repair"],
        "closure_status": "repaired",
        "closure_evidence": ["Plans/Fixture.md"],
        "closure_reason": "The fixture repair is present.",
        "hashes": {},
        "created_at": "2026-06-01T00:00:00Z",
        "updated_at": "2026-06-01T00:00:00Z",
        "closed_by_audit_id": "audit-fixture",
        "reopen_conditions": sorted(REOPEN_CONDITIONS),
    }
    row.update(overrides)
    row["finding_key"] = compute_finding_key(row)
    return row


def cmd_self_test(args: argparse.Namespace) -> int:
    """Fail-closed checks of anchor.v1, re-audit supersession and audit corrections."""
    import contextlib  # noqa: PLC0415
    import io  # noqa: PLC0415
    import shutil  # noqa: PLC0415
    import tempfile  # noqa: PLC0415

    global ROOT, LEGACY_INVENTORY_SHA256  # noqa: PLW0603 - the fixtures live in a temporary repository root.
    saved_root = ROOT
    results: list[dict[str, Any]] = []
    tmp = Path(tempfile.mkdtemp(prefix="pm-audit-closure-selftest-")).resolve()  # resolved: TMPDIR may sit behind a symlink
    try:
        ROOT = tmp
        audit_dir = tmp / "Plans/.audits/reaudit-fixture"
        (audit_dir / "reviews").mkdir(parents=True)
        (tmp / "scripts").mkdir()
        doc = tmp / "Plans/Fixture.md"
        registry = tmp / "Plans/.audits/_semantic_closure_registry.jsonl"
        records_path = audit_dir / "reaudit_records.jsonl"
        (tmp / "Plans/fixture.json").write_text(json.dumps({"a": {"b/c": [1, {"d": "deep value"}]}}), encoding="utf-8")
        (tmp / "Plans/fixture.jsonl").write_text(
            '{"id": "r1", "v": "row one", "tags": ["x"]}\n{"id": "r2", "v": "row two", "tags": ["x", "y"]}\n'
            '{"id": "r3", "v": "row three", "tags": []}\n{"dup": "d", "v": "one"}\n{"dup": "d", "v": "two"}\n',
            encoding="utf-8",
        )
        (tmp / "scripts/fixture.py").write_text(
            "CONST = ('fixture constant',)\n\nclass K:\n    def m(self):\n        return 1\n\ndef f():\n    return 2\n"
            "\ndef twice():\n    return 1\n\ndef twice():\n    return 2\n",
            encoding="utf-8",
        )
        unit_ref = "Plans/Fixture.md#unit=FIX-001"
        quote = "The fixture repair is present and must stay present."
        import subprocess  # noqa: PLC0415

        def git(*argv: str) -> str:
            return subprocess.run(["git", "-C", str(tmp), "-c", "user.name=selftest", "-c", "user.email=selftest@invalid",
                                   "-c", "commit.gpgsign=false", *argv], capture_output=True, text=True, check=True).stdout.strip()

        git("init", "-q")

        def commit_all() -> str:
            git("add", "-A")
            git("commit", "-q", "--allow-empty", "-m", "fixture state")
            return git("rev-parse", "HEAD")

        def check(name: str, condition: bool, detail: Any = None) -> None:
            results.append({"check": name, "pass": bool(condition), **({"detail": detail} if not condition else {})})

        def write_doc(text: str = SELF_TEST_DOC) -> None:
            doc.write_text(text, encoding="utf-8")

        def legacy_row(**overrides: Any) -> dict[str, Any]:
            base = {"hashes": {
                "owner_evidence_hashes": {"Plans/Fixture.md": "0" * 64},
                "closure_evidence_hashes": {"Plans/Fixture.md": "0" * 64},
            }}
            base.update(overrides)
            return _self_test_registry_row(**base)

        def write_registry(rows: list[dict[str, Any]], newline: bool = True) -> list[str]:
            lines = [json.dumps(row, sort_keys=True) for row in rows]
            registry.write_text("\n".join(lines) + ("\n" if newline else ""), encoding="utf-8")
            return lines

        def receipt(who: str, n: int, target: dict[str, Any], rec: dict[str, Any], verdict: str, **extra: Any) -> dict[str, Any]:
            judged = {"line": rec["line"], "closure_id": target["closure_id"], "verdict": verdict, **extra}
            if who == "worker":
                judged.update({k: rec.get(k) for k in REAUDIT_WORKER_FIELDS})
                judged.update(row_sha256=rec["row_sha256"], dependencies=list(rec["dependencies"]), verdict=verdict,
                              recheck_commit=rec["recheck_commit"], dependency_hashes_at_recheck=dict(rec["dependency_hashes_at_recheck"]))
            review: dict[str, Any] = {"model": f"fixture-{who}", "verdict": verdict}
            if who != "worker":
                shown = {"line": rec["line"], "closure_id": target["closure_id"],
                         "claim": {k: v for k, v in target.items() if k not in ("hashes", "_line_no")},
                         "row_sha256": rec["row_sha256"], "recheck_commit": rec["recheck_commit"],
                         "dependency_anchors": [{"ref": ref, "sha256": rec["dependency_hashes_at_recheck"][ref],
                                                 "text": AnchorResolver(tmp).content(ref)[1], "truncated": False} for ref in rec["dependencies"]]}
                shown["packet_row_digest"] = packet_row_digest(shown)
                packet = audit_dir / "reviews" / f"packet-{who}-{n}.jsonl"
                packet.write_text(json.dumps(shown) + "\n", encoding="utf-8")
                review.update(packet_path=rel(packet), packet_sha256=sha256_file(packet))
                judged["packet_row_digest"] = shown["packet_row_digest"]
            path = audit_dir / "reviews" / f"{who}-{n}.jsonl"
            path.write_text(json.dumps(judged) + "\n", encoding="utf-8")
            review.update(evidence_path=rel(path), evidence_sha256=sha256_file(path))
            return review

        counter = [0]

        def append_with(
            verdict: str = "supported",
            rows_before: list[dict[str, Any]] | None = None,
            line: int = 1,
            mutate: Any = None,
            keep_records: bool = False,
            commit_receipts: bool = True,
            **fields: Any,
        ) -> dict[str, Any]:
            """A complete, valid re-audit of `line`, then `mutate(record)` to tamper with it. Each call
            writes its record to a new file (record files are receipts: added once, never rewritten)."""
            nonlocal records_path
            rows_before = rows_before or [legacy_row()]
            lines = write_registry(rows_before)
            target = rows_before[line - 1]
            resolver = AnchorResolver(tmp)
            counter[0] += 1
            previous_records = records_path
            records_path = audit_dir / f"reaudit_records-{counter[0]}.jsonl"
            commit = commit_all()
            extra = {k: fields[k] for k in ("status_now", "later_closure_id") if k in fields}
            rec: dict[str, Any] = {
                "schema_id": REAUDIT_RECORD_SCHEMA, "reaudit_id": "reaudit-fixture",
                "closure_id": target["closure_id"], "line": line, "row_sha256": sha256_text(lines[line - 1]),
                "recheck_commit": commit, "verdict": verdict,
                "claim": "The fixture repair is present in FIX-001.",
                "rationale": "FIX-001 canonical_text states the repair.",
                "dependencies": [unit_ref],
                "evidence": [{"ref": unit_ref, "quote": quote}],
                "fix": {"kind": "small_in_scope", "description": "restore it"} if verdict == "not_supported" else None,
                "status_now": fields.get("status_now"), "later_closure_id": fields.get("later_closure_id"),
            }
            if "evidence" in fields:
                rec["evidence"] = fields["evidence"]
            rec["dependency_hashes_at_recheck"] = {ref: resolver.sha256(ref) for ref in rec["dependencies"]}
            stale = [{"group": g, "ref": r, "stored": h} for g, r, h in sorted(_target_stale_refs(target, CommitResolver(tmp, commit)))]
            rec["stale_hashes_at_recheck"] = stale
            rec["stale_ref_dispositions"] = [
                {"ref": ref, "disposition": "dependency", "anchors": [unit_ref]} for ref in sorted({s["ref"] for s in stale})
            ]
            rec["reviews"] = {who: receipt(who, counter[0], target, rec, verdict, **extra) for who in REAUDIT_REVIEWERS}
            row = build_reaudit_row(target, line, lines[line - 1], rec, rel(records_path), resolver, "2026-11-04T00:00:00Z")
            if mutate:
                mutate(rec)  # tamper after the row is built, then re-bind the digest so only the tampering is tested
                row["reaudit"]["record_sha256"] = reaudit_record_sha256(rec)
            previous = previous_records.read_text() if keep_records and previous_records.exists() else ""
            records_path.write_text(previous + json.dumps(rec, sort_keys=True) + "\n", encoding="utf-8")
            if commit_receipts:
                commit_all()  # receipts count only once committed, after the recheck commit they judged
            return row

        def validate_rows(rows: list[dict[str, Any]]) -> dict[str, Any]:
            write_registry(rows)
            return validate_registry(registry)

        def has(report: dict[str, Any], text: str) -> bool:
            return any(text in error for error in report["errors"])

        def resolves(ref: str) -> bool:
            try:
                AnchorResolver(tmp).content(ref)
                return True
            except AnchorError:
                return False

        write_doc()
        resolver = AnchorResolver(tmp)
        # Anchor resolution.
        check("unit_anchor_resolves_block_style", quote in resolver.content(unit_ref)[1])
        check("unit_anchor_resolves_flow_style", "unrelated unit" in resolver.content("Plans/Fixture.md#unit=FIX-002")[1])
        check("section_path_anchor_resolves", "Beta prose" in resolver.content("Plans/Fixture.md#section=Fixture Doc > Beta Section")[1])
        check("json_pointer_escapes_resolve", "deep value" in resolver.content("Plans/fixture.json#json=/a/b~1c/1")[1])
        check("jsonl_anchor_resolves", "row two" in resolver.content("Plans/fixture.jsonl#jsonl=id=r2")[1])
        check("jsonlset_collects_every_matching_row", resolver.content("Plans/fixture.jsonl#jsonlset=tags=x")[1].count('"id"') == 2)
        check("pydef_method_resolves", "return 1" in resolver.content("scripts/fixture.py#pydef=K.m")[1])
        check("pydef_constant_resolves", "fixture constant" in resolver.content("scripts/fixture.py#pydef=CONST")[1])
        for name, ref in (
            ("ambiguous_section_title_fails", "Plans/Fixture.md#section=Alpha Section"),
            ("missing_unit_fails", "Plans/Fixture.md#unit=FIX-404"),
            ("missing_json_pointer_fails", "Plans/fixture.json#json=/a/nope"),
            ("json_pointer_bad_escape_fails", "Plans/fixture.json#json=/a~2"),
            ("json_pointer_leading_zero_index_fails", "Plans/fixture.json#json=/a/b~1c/01"),
            ("missing_jsonl_row_fails", "Plans/fixture.jsonl#jsonl=id=r9"),
            ("duplicate_jsonl_rows_fail", "Plans/fixture.jsonl#jsonl=dup=d"),
            ("missing_pydef_fails", "scripts/fixture.py#pydef=g"),
            ("duplicate_pydef_fails", "scripts/fixture.py#pydef=twice"),
            ("line_number_ref_fails", "Plans/Fixture.md:12"),
            ("unknown_fragment_fails", "Plans/Fixture.md#FIX-001"),
            ("dot_segment_path_fails", "./Plans/Fixture.md#unit=FIX-001"),
            ("parent_segment_path_fails", "Plans/.audits/../Fixture.md#unit=FIX-001"),
            ("absolute_path_fails", f"{tmp}/Plans/Fixture.md#unit=FIX-001"),
        ):
            check(name, not resolves(ref), ref)
        check("dot_segment_derived_ref_rejected", anchor_ref_problem("./Plans/.plan_index/units.jsonl#jsonl=id=x") is not None)
        check("traversal_whole_file_ref_rejected", anchor_ref_problem("Plans/.audits/../Fixture.md") is not None)
        before = resolver.sha256(unit_ref)
        write_doc(SELF_TEST_DOC.replace("unrelated unit that other edits change", "unrelated unit, edited"))
        check("edit_outside_anchor_keeps_hash", AnchorResolver(tmp).sha256(unit_ref) == before)
        write_doc(SELF_TEST_DOC.replace(
            "canonical_text: The fixture repair is present and must stay present.",
            "canonical_text:   The fixture repair is present\n  and must stay present.",
        ))
        check("yaml_rewrap_keeps_hash", AnchorResolver(tmp).sha256(unit_ref) == before)
        write_doc(SELF_TEST_DOC.replace("must stay present", "may be removed"))
        check("edit_inside_anchor_changes_hash", AnchorResolver(tmp).sha256(unit_ref) != before)
        write_doc(SELF_TEST_DOC.replace(
            "canonical_text: The fixture repair", "canonical_text: The repair is NOT present.\ncanonical_text: The fixture repair"))
        check("duplicate_yaml_key_fails", not resolves(unit_ref))
        write_doc(SELF_TEST_DOC.replace("- The repair stays.", "- The repair stays.\nextra: !!set {alpha: null, beta: null}"))
        check("yaml_set_value_fails", not resolves(unit_ref))
        (tmp / "Plans/dup.json").write_text('{"rule": "FORBIDDEN", "rule": "MUST"}', encoding="utf-8")
        check("duplicate_json_key_fails", not resolves("Plans/dup.json#json=/rule"))
        write_doc()
        (tmp / "scripts/ws.py").write_text('def f():\n    return """suffix  \nnext"""\n', encoding="utf-8")
        ws_before = AnchorResolver(tmp).sha256("scripts/ws.py#pydef=f")
        (tmp / "scripts/ws.py").write_text('def f():\n    return """suffix\nnext"""\n', encoding="utf-8")
        check("pydef_keeps_trailing_space_in_strings", AnchorResolver(tmp).sha256("scripts/ws.py#pydef=f") != ws_before)
        sec = "Plans/Fixture.md#section=Fixture Doc > Beta Section"
        sec_before = AnchorResolver(tmp).sha256(sec)
        write_doc(SELF_TEST_DOC.replace("Beta prose.", "Beta prose.  "))
        check("section_keeps_trailing_spaces", AnchorResolver(tmp).sha256(sec) != sec_before)
        write_doc()

        # Legacy rows keep whole-file semantics, including refs with '#'.
        report = validate_rows([legacy_row()])
        check("legacy_stale_row_is_error", has(report, "owner_evidence_hashes for Plans/Fixture.md is stale"), report["errors"])
        legacy_hash_ref = _self_test_registry_row(hashes={"owner_evidence_hashes": {"Plans/Fixture.md#unit=FIX-001": sha256_file(doc)}})
        check("legacy_row_hashes_whole_file_even_with_anchor_syntax", not validate_rows([legacy_hash_ref])["errors"])

        # A valid re-audit supersedes the stale row.
        new = append_with()
        report = validate_rows([legacy_row(), new])
        check("valid_reaudit_supersedes_stale_row", not report["errors"] and report["superseded_lines"] == [1], report["errors"])
        check("superseded_staleness_is_counted", report["superseded_stale_hash_count"] == 2, report)
        write_doc(SELF_TEST_DOC.replace("unrelated unit that other edits change", "unrelated unit, edited"))
        check("reaudit_row_survives_unrelated_edit", not validate_registry(registry)["errors"])
        write_doc(SELF_TEST_DOC.replace("must stay present", "may be removed"))
        report = validate_registry(registry)
        check("reaudit_row_goes_stale_on_anchor_edit", has(report, f"for {unit_ref} is stale"), report["errors"])
        write_doc()

        # Tampering fails closed and leaves the old row's staleness in place.
        tampered = legacy_row(closure_reason="Edited after the re-audit.")
        report = validate_rows([tampered, new])
        check("edited_superseded_row_breaks_link", has(report, "row_sha256 does not match") and has(report, "is stale"), report["errors"])
        bad = json.loads(json.dumps(new))
        bad["reaudit"]["record_sha256"] = "0" * 64
        report = validate_rows([legacy_row(), bad])
        check("record_hash_mismatch_fails", has(report, "record_sha256 does not match") and has(report, "is stale"), report["errors"])
        bad = json.loads(json.dumps(new))
        bad["hashes"]["owner_evidence_hashes"] = {unit_ref: "1" * 64}
        report = validate_rows([legacy_row(), bad])
        check("row_hashes_must_equal_recheck_snapshot", has(report, "recheck snapshot") and has(report, "is stale"), report["errors"])

        def drop(field: str) -> Any:
            return lambda rec: rec.pop(field)

        def set_review(who: str, **values: Any) -> Any:
            return lambda rec: rec["reviews"][who].update(values)

        def rewrite_packet(rec: dict[str, Any], who: str, redigest: bool = False, **values: Any) -> None:
            path = ROOT / rec["reviews"][who]["packet_path"]
            shown = json.loads(path.read_text())
            shown.update(values)
            if redigest:
                shown["packet_row_digest"] = packet_row_digest(shown)
            path.write_text(json.dumps(shown) + "\n")
            rec["reviews"][who]["packet_sha256"] = sha256_file(path)

        def rewrite_output(rec: dict[str, Any], who: str, drop: tuple[str, ...] = (), **values: Any) -> None:
            path = ROOT / rec["reviews"][who]["evidence_path"]
            judged = json.loads(path.read_text())
            judged.update(values)
            for key in drop:
                judged.pop(key, None)
            path.write_text(json.dumps(judged) + "\n")
            rec["reviews"][who]["evidence_sha256"] = sha256_file(path)

        def rewrite_receipt(who: str, verdict: str) -> Any:
            def apply(rec: dict[str, Any]) -> None:
                path = ROOT / rec["reviews"][who]["evidence_path"]
                path.write_text(json.dumps({"line": rec["line"], "closure_id": rec["closure_id"], "verdict": verdict}) + "\n")
                assert verdict
                rec["reviews"][who]["evidence_sha256"] = sha256_file(path)
            return apply

        for name, mutate, text in (
            ("reviewer_disagreement_fails", set_review("astra", verdict="not_supported"), "reviews.astra.verdict"),
            ("missing_reviewer_fails", lambda rec: rec["reviews"].pop("sol"), "reviews.sol"),
            ("null_receipt_fields_fail", set_review("sol", model=None, evidence_sha256=None), "record.reviews must map reviewers to objects of strings"),
            ("receipt_digest_mismatch_fails", set_review("worker", evidence_sha256="e" * 64), "SHA-256 differs"),
            ("receipt_file_missing_fails", set_review("sol", evidence_path="Plans/.audits/reaudit-fixture/reviews/none.jsonl"), "missing or its SHA-256"),
            ("receipt_path_traversal_fails", set_review("sol", evidence_path="Plans/.audits/../Fixture.md"), "evidence_path"),
            ("receipt_with_other_verdict_fails", rewrite_receipt("astra", "not_supported"), "judged this row"),
            ("snapshot_missing_fails", drop("dependency_hashes_at_recheck"), "dependency_hashes_at_recheck"),
            ("claim_missing_fails", drop("claim"), "record.claim"),
            ("recheck_commit_bad_fails", lambda rec: rec.update(recheck_commit="not a commit"), "recheck_commit"),
            ("record_line_mismatch_fails", lambda rec: rec.update(line=999), "closure_id and line"),
            ("stale_disposition_missing_fails", lambda rec: rec.update(stale_ref_dispositions=[]), "cover exactly the stale refs"),
            ("stale_snapshot_unbound_fails", lambda rec: rec.update(stale_hashes_at_recheck=[{"group": "owner_evidence_hashes", "ref": "Plans/Fixture.md", "stored": "9" * 64}]), "must list exactly"),
            ("stale_lists_both_empty_fail", lambda rec: rec.update(stale_hashes_at_recheck=[], stale_ref_dispositions=[]), "must list exactly"),
            ("mismatched_recheck_commit_fails", lambda rec: rec.update(recheck_commit="b" * 40), "equal in the row and the record"),
            ("malformed_dependencies_report_not_raise", lambda rec: rec.update(dependencies=[{}]), "distinct strings"),
            ("malformed_evidence_report_not_raise", lambda rec: rec.update(evidence=17), "list of objects"),
            ("malformed_stale_item_reports_not_raise", lambda rec: rec.update(stale_hashes_at_recheck=[{"group": [], "ref": "x", "stored": "y"}]), "string group, ref and stored"),
            ("malformed_disposition_reports_not_raise", lambda rec: rec.update(stale_ref_dispositions=[{"ref": [], "disposition": "dependency", "anchors": [{}]}]), "stale_ref_dispositions must be"),
            ("malformed_verdict_reports_not_raise", lambda rec: rec.update(verdict={}), "record.verdict must be a string"),
            ("malformed_line_reports_not_raise", lambda rec: rec.update(line={}), "record.line must be an integer"),
            ("empty_packet_anchors_fail", lambda rec: rewrite_packet(rec, "sol", dependency_anchors=[]), "shows no dependency_anchors"),
            ("output_naming_other_packet_fails", lambda rec: rewrite_output(rec, "astra", packet_sha256="f" * 64), "names a different packet"),
            ("output_naming_other_commit_fails", lambda rec: rewrite_output(rec, "sol", recheck_commit="c" * 40), "different recheck_commit"),
            ("output_declaring_other_hashes_fails", lambda rec: rewrite_output(rec, "astra", dependency_hashes_at_recheck={unit_ref: "d" * 64}), "differ from the record's snapshot"),
            ("quote_not_in_anchor_fails", lambda rec: rec.update(evidence=[{"ref": unit_ref, "quote": "text that appears nowhere in the unit"}]), "evidence quote is not in"),
            ("supported_without_quote_fails", lambda rec: rec.update(evidence=[{"ref": unit_ref, "absent": "text that appears nowhere"}]), "needs at least one verbatim quote"),
            ("absent_phrase_present_fails", lambda rec: rec["evidence"].append({"ref": unit_ref, "absent": "must stay present"}), "absent is present"),
        ):
            row = append_with(mutate=mutate)
            report = validate_rows([legacy_row(), row])
            check(name, has(report, text) and has(report, "is stale"), report["errors"])
        def same_status_receipt(rec: dict[str, Any]) -> None:
            rewrite_output(rec, "astra", verdict="resolved_differently", status_now="repaired")

        row = append_with(mutate=same_status_receipt)
        check("receipt_resolved_to_same_status_counts_as_supported", not validate_rows([legacy_row(), row])["errors"])
        bad = append_with(mutate=lambda rec: None)
        bad["reaudit"]["record"] = "Plans/.audits/../.audits/reaudit-fixture/reaudit_records.jsonl"
        report = validate_rows([legacy_row(), bad])
        check("record_path_traversal_fails", has(report, "'..'") and has(report, "is stale"), report["errors"])
        for name, dep, text in (
            ("whole_file_anchor_outside_audits_fails", "Plans/Fixture.md", "hashes a whole file"),
            ("derived_anchor_fails", "Plans/.plan_index/plan_units.jsonl#jsonl=plan_unit_id=FIX-001", "derived artifact"),
        ):
            row = append_with()
            row["hashes"]["owner_evidence_hashes"] = {dep: "0" * 64}
            report = validate_rows([legacy_row(), row])
            check(name, has(report, text), report["errors"])
        row = append_with()
        del row["reaudit"]
        report = validate_rows([legacy_row(), row])
        check("supersedes_without_reaudit_fails", has(report, "needs both supersedes and reaudit") and has(report, "is stale"), report["errors"])
        row = append_with()
        row["closure_status"] = "false_positive"
        row["finding_key"] = compute_finding_key(row)
        check("supported_reaudit_must_keep_status", has(validate_rows([legacy_row(), row]), "keeps closure_status"))
        row = append_with()
        twin = json.loads(json.dumps(row))
        twin["closure_id"] = row["closure_id"] + "-twin"
        check("double_supersession_fails", has(validate_rows([legacy_row(), row, twin]), "already superseded"))
        row = append_with()
        row["finding_key"] = _self_test_registry_row(closure_id="other", detail_keys=["other"])["finding_key"]
        check("reaudit_must_keep_finding_key", has(validate_rows([legacy_row(), row]), "keep the finding_key"))

        # resolved_differently changes status only to the record's status_now.
        row = append_with("resolved_differently", status_now="false_positive")
        check("resolved_differently_valid", not validate_rows([legacy_row(), row])["errors"])
        row["closure_status"] = "not_for_plan"
        check("resolved_differently_status_mismatch_fails", has(validate_rows([legacy_row(), row]), "status_now"))

        # superseded_by_later_closure needs a distinct later closure that a re-audit confirmed.
        own_id = "reaudit-fixture--closure-fixture-001"
        row = append_with("superseded_by_later_closure", later_closure_id=own_id)
        report = validate_rows([legacy_row(), row])
        check("later_closure_cannot_be_itself", has(report, "distinct later closure") and has(report, "is stale"), report["errors"])
        later = legacy_row(closure_id="closure-fixture-later", closure_reason="Later closure of the same finding.")
        first = append_with("superseded_by_later_closure", rows_before=[legacy_row(), later], line=1, later_closure_id="closure-fixture-later")
        report = validate_rows([legacy_row(), later, first])
        check("later_closure_must_be_confirmed", has(report, "distinct later closure"), report["errors"])
        second = append_with(rows_before=[legacy_row(), later, first], line=2, keep_records=True)
        report = validate_rows([legacy_row(), later, first, second])
        check("confirmed_later_closure_accepted", not report["errors"] and report["superseded_lines"] == [1, 2], report["errors"])

        # Legacy reopened rows must prove a real hash change.
        for name, changes, ok in (
            ("reopen_proof_with_real_change_passes", {"Plans/Fixture.md": {"previous": "1" * 64, "current": "2" * 64}}, True),
            ("reopen_proof_with_unchanged_hash_fails", {"Plans/Fixture.md": {"previous": "1" * 64, "current": "1" * 64}}, False),
            ("reopen_proof_with_malformed_entry_fails", {"Plans/Fixture.md": "changed"}, False),
        ):
            reopened = _self_test_registry_row(closure_id="closure-fixture-reopen", closure_status="reopened", hashes={
                "owner_evidence_hashes": {"Plans/Fixture.md": sha256_file(doc)}, "reopen_hash_changes": changes})
            report = validate_rows([legacy_row(), reopened])
            proof_errors = [e for e in report["errors"] if "reopen_hash_changes" in e]
            check(name, (not proof_errors) if ok else bool(proof_errors), report["errors"])

        # not_supported appends a reopened row; only a clean successor closes it again.
        no_quote = [{"ref": unit_ref, "absent": "a phrase the claim needs"}]
        reopened = append_with("not_supported", evidence=no_quote)
        report = validate_rows([legacy_row(), reopened])
        check("reopened_reaudit_valid_and_open", not report["errors"] and [r["line"] for r in report["open_rows"]] == [2], report)
        closing = append_with("resolved_differently", rows_before=[legacy_row(), reopened], line=2, status_now="repaired", keep_records=True)
        report = validate_rows([legacy_row(), reopened, closing])
        check("closing_reaudit_closes_reopened_row", not report["errors"] and not report["open_rows"], report)
        broken = json.loads(json.dumps(closing))
        broken["exact_tokens"] = ["unrelated finding"]
        report = validate_rows([legacy_row(), reopened, broken])
        check("invalid_successor_keeps_reopened_row_open", [r["line"] for r in report["open_rows"]] == [2], report)

        # An earlier re-audit that went stale can itself be superseded by a fresh one (R7).
        first = append_with()
        write_doc(SELF_TEST_DOC.replace("- The repair stays.", "- The repair stays and is tested."))
        second = append_with(rows_before=[legacy_row(), first], line=2, keep_records=True)
        report = validate_rows([legacy_row(), first, second])
        check("stale_reaudit_superseded_by_fresh_reaudit", not report["errors"] and report["superseded_lines"] == [1, 2], report["errors"])
        write_doc()

        # V1 r2 regressions.
        # F1: a record cannot be re-pointed at a different snapshot than its reviewers saw.
        row = append_with()
        write_doc(SELF_TEST_DOC.replace("- The repair stays.", "- The repair is forbidden and must be removed."))
        moved_hash = AnchorResolver(tmp).sha256(unit_ref)
        rec = [json.loads(l) for l in records_path.read_text().splitlines() if l.strip()][-1]
        rec["dependency_hashes_at_recheck"][unit_ref] = moved_hash
        row["hashes"]["owner_evidence_hashes"][unit_ref] = moved_hash
        row["reaudit"]["record_sha256"] = reaudit_record_sha256(rec)
        records_path.write_text(json.dumps(rec, sort_keys=True) + "\n", encoding="utf-8")
        report = validate_rows([legacy_row(), row])
        check("replayed_receipts_on_new_snapshot_fail", has(report, "not its content at recheck_commit") and has(report, "is stale"), report["errors"])
        new_commit = commit_all()
        rec["recheck_commit"] = new_commit
        row["reaudit"]["recheck_commit"] = new_commit
        row["reaudit"]["record_sha256"] = reaudit_record_sha256(rec)
        records_path.write_text(json.dumps(rec, sort_keys=True) + "\n", encoding="utf-8")
        report = validate_rows([legacy_row(), row])
        check("replayed_receipts_on_new_commit_fail", has(report, "packet showed") and has(report, "is stale"), report["errors"])
        write_doc()

        # F2: a stale closing successor does not resolve a reopened finding.
        reopened = append_with("not_supported", evidence=[{"ref": unit_ref, "absent": "a phrase the claim needs"}])
        closing = append_with("resolved_differently", rows_before=[legacy_row(), reopened], line=2, status_now="repaired", keep_records=True)
        write_doc(SELF_TEST_DOC.replace(quote, "The claimed repair is removed and no longer present."))
        report = validate_rows([legacy_row(), reopened, closing])
        check("stale_closing_successor_keeps_finding_open", [r["line"] for r in report["open_rows"]] == [2], report["open_rows"])
        write_doc()

        # F3: a historical quote is checked against its own recheck_commit even after the anchor moves.
        first = append_with(evidence=[{"ref": unit_ref, "quote": "A fabricated quote that never existed in any snapshot."}])
        write_doc(SELF_TEST_DOC.replace("- The repair stays.", "- The repair stays and is tested."))
        second = append_with(rows_before=[legacy_row(), first], line=2, keep_records=True)
        report = validate_rows([legacy_row(), first, second])
        check("fabricated_historical_quote_fails", has(report, "evidence quote is not in") , report["errors"])
        write_doc()

        # F4: a malformed PlanUnit block fails every unit anchor in its document.
        write_doc(SELF_TEST_DOC + "\n```yaml\nplan_unit_id: OTHER-001\nplan_unit_id: FIX-001\ncanonical_text: The repair is FORBIDDEN.\n```\n")
        check("malformed_duplicate_unit_block_fails_doc", not resolves(unit_ref))
        write_doc()

        # F5: Unicode line separators inside string literals do not shift pydef slices.
        (tmp / "scripts/sep.py").write_text('def f():\n    return "left\u2028right"\n', encoding="utf-8")
        sep_before = AnchorResolver(tmp).sha256("scripts/sep.py#pydef=f")
        (tmp / "scripts/sep.py").write_text('def f():\n    return "left\u2028WRONG"\n', encoding="utf-8")
        check("pydef_hash_covers_text_after_line_separator", AnchorResolver(tmp).sha256("scripts/sep.py#pydef=f") != sep_before)

        # F7: symlinked evidence paths are refused.
        (tmp / "Plans/.plan_index").mkdir(exist_ok=True)
        (tmp / "Plans/.plan_index/rows.jsonl").write_text('{"id": "x", "claim": "derived"}\n', encoding="utf-8")
        (tmp / "Plans/alias.jsonl").symlink_to(tmp / "Plans/.plan_index/rows.jsonl")
        check("symlinked_anchor_path_fails", not resolves("Plans/alias.jsonl#jsonl=id=x"))

        # V1 r3 regressions.
        # N10: a recheck_commit that is not in the repository (row and record agree on it).
        row = append_with()
        rec = [json.loads(l) for l in records_path.read_text().splitlines() if l.strip()][-1]
        rec["recheck_commit"] = row["reaudit"]["recheck_commit"] = "b" * 40
        row["reaudit"]["record_sha256"] = reaudit_record_sha256(rec)
        records_path.write_text(json.dumps(rec, sort_keys=True) + "\n", encoding="utf-8")
        report = validate_rows([legacy_row(), row])
        check("unknown_recheck_commit_fails", has(report, "is not in this repository") and has(report, "is stale"), report["errors"])

        # N1: old outputs cannot be paired with replacement packets on a newer snapshot.
        row = append_with()
        rec = [json.loads(l) for l in records_path.read_text().splitlines() if l.strip()][-1]
        write_doc(SELF_TEST_DOC.replace("- The repair stays.", "- The repair is forbidden and must be removed."))
        moved_commit = commit_all()
        moved_hash = AnchorResolver(tmp).sha256(unit_ref)
        rec["recheck_commit"] = row["reaudit"]["recheck_commit"] = moved_commit
        rec["dependency_hashes_at_recheck"][unit_ref] = row["hashes"]["owner_evidence_hashes"][unit_ref] = moved_hash
        for who in ("sol", "astra"):
            rewrite_packet(rec, who, dependency_anchors=[{"ref": unit_ref, "sha256": moved_hash}])
            rewrite_output(rec, who, packet_sha256=rec["reviews"][who]["packet_sha256"], recheck_commit=moved_commit)
        row["reaudit"]["record_sha256"] = reaudit_record_sha256(rec)
        records_path.write_text(json.dumps(rec, sort_keys=True) + "\n", encoding="utf-8")
        commit_all()
        report = validate_rows([legacy_row(), row])
        check("old_outputs_with_replacement_packets_fail",
              has(report, "was changed after it was first committed") and has(report, "is stale"), report["errors"])
        write_doc()
        # A receipt that is not committed does not count.
        row = append_with()
        rec = [json.loads(l) for l in records_path.read_text().splitlines() if l.strip()][-1]
        loose = audit_dir / "reviews" / "loose-output.jsonl"
        loose.write_text((ROOT / rec["reviews"]["astra"]["evidence_path"]).read_text(), encoding="utf-8")
        rec["reviews"]["astra"].update(evidence_path=rel(loose), evidence_sha256=sha256_file(loose))
        row["reaudit"]["record_sha256"] = reaudit_record_sha256(rec)
        records_path.write_text(json.dumps(rec, sort_keys=True) + "\n", encoding="utf-8")
        report = validate_rows([legacy_row(), row])
        check("uncommitted_receipt_fails", has(report, "is not committed at HEAD") and has(report, "is stale"), report["errors"])
        loose.unlink()
        # A receipt committed before the recheck commit it claims to judge does not count.
        early = append_with()
        rec = [json.loads(l) for l in records_path.read_text().splitlines() if l.strip()][-1]
        later_commit = commit_all()
        rec["recheck_commit"] = early["reaudit"]["recheck_commit"] = later_commit
        early["reaudit"]["record_sha256"] = reaudit_record_sha256(rec)
        records_path.write_text(json.dumps(rec, sort_keys=True) + "\n", encoding="utf-8")
        report = validate_rows([legacy_row(), early])
        check("receipt_older_than_recheck_commit_fails", has(report, "at or before the recheck commit") and has(report, "is stale"), report["errors"])

        # N2: every hash group must equal the snapshot on its own.
        row = append_with()
        good = row["hashes"]["owner_evidence_hashes"][unit_ref]
        row["hashes"]["closure_evidence_hashes"] = {unit_ref: good}
        row["hashes"]["owner_evidence_hashes"] = {unit_ref: "f" * 64}
        report = validate_rows([legacy_row(), row])
        check("hash_groups_checked_separately", has(report, "hashes.owner_evidence_hashes[") and has(report, "is stale"), report["errors"])

        # N3: evidence missing at the recheck commit must be accounted for.
        gone = legacy_row(hashes={"owner_evidence_hashes": {"Plans/Missing.md": "0" * 64}, "closure_evidence_hashes": {"Plans/Fixture.md": "0" * 64}})
        row = append_with(rows_before=[gone])
        report = validate_rows([gone, row])
        check("missing_evidence_with_disposition_passes", not report["errors"] and report["superseded_lines"] == [1], report["errors"])
        row = append_with(rows_before=[gone], mutate=lambda rec: rec.update(
            stale_hashes_at_recheck=[s for s in rec["stale_hashes_at_recheck"] if s["ref"] != "Plans/Missing.md"],
            stale_ref_dispositions=[d for d in rec["stale_ref_dispositions"] if d["ref"] != "Plans/Missing.md"]))
        report = validate_rows([gone, row])
        check("missing_evidence_cannot_be_left_out", has(report, "must list exactly") and has(report, "hash ref is missing"), report["errors"])

        # N4: conditional redefinitions in the same scope make a pydef anchor ambiguous.
        (tmp / "scripts/cond.py").write_text("def f():\n    return 1\nif True:\n    def f():\n        return 2\n", encoding="utf-8")
        check("pydef_conditional_redefinition_fails", not resolves("scripts/cond.py#pydef=f"))
        (tmp / "scripts/cond.py").write_text("class K:\n    def m(self):\n        return 1\n    try:\n        m = None\n    except Exception:\n        pass\n", encoding="utf-8")
        check("pydef_method_rebound_in_try_fails", not resolves("scripts/cond.py#pydef=K.m"))
        (tmp / "scripts/cond.py").write_text("def g():\n    def f():\n        return 3\n    return f\n\ndef f():\n    return 1\n", encoding="utf-8")
        check("pydef_nested_scope_binding_ignored", "return 1" in AnchorResolver(tmp).content("scripts/cond.py#pydef=f")[1])

        # N5: rechecking a still-open finding as not_supported again is one open chain, not two findings.
        missing_quote = [{"ref": unit_ref, "absent": "a phrase the claim needs"}]
        reopened = append_with("not_supported", evidence=missing_quote)
        again = append_with("not_supported", rows_before=[legacy_row(), reopened], line=2, evidence=missing_quote, keep_records=True)
        report = validate_rows([legacy_row(), reopened, again])
        check("open_to_open_chain_is_one_finding", not report["errors"] and [r["line"] for r in report["open_rows"]] == [3], report)

        # N8: non-finite JSON numbers anywhere in the source fail the anchor.
        (tmp / "Plans/nan.json").write_text('{"a": 1, "b": NaN}', encoding="utf-8")
        check("json_nan_outside_anchor_fails", not resolves("Plans/nan.json#json=/a"))
        (tmp / "Plans/nan.jsonl").write_text('{"id": "a"}\n{"id": "b", "v": Infinity}\n', encoding="utf-8")
        check("jsonl_infinity_outside_anchor_fails", not resolves("Plans/nan.jsonl#jsonl=id=a"))

        # N9: the hash report fails on an anchor that no longer resolves.
        lost = _self_test_registry_row(closure_id="closure-fixture-lost", hashes={
            "hash_scope": ANCHOR_SCOPE, "owner_evidence_hashes": {"Plans/Fixture.md#unit=FIX-404": "0" * 64}})
        write_registry([lost])
        with contextlib.redirect_stdout(io.StringIO()) as out:
            lost_code = cmd_refresh_hashes(argparse.Namespace(registry=str(registry), dry_run=True))
        lost_report = json.loads(out.getvalue())
        check("refresh_dry_run_reports_missing_anchor", lost_code != 0 and lost_report.get("missing_refs"), lost_report)

        # A1 (V1 r4): every output is bound to exactly the packet row it judged.
        for name, mutate, text in (
            ("output_without_packet_digest_fails", lambda rec: rewrite_output(rec, "astra", drop=("packet_row_digest",)), "does not echo the digest of the packet row"),
            ("packet_digest_not_matching_content_fails", lambda rec: rewrite_packet(rec, "sol", claim={"closure_id": "another claim"}), "does not match its content"),
            ("packet_row_without_recheck_commit_fails", lambda rec: rewrite_packet(rec, "sol", redigest=True, recheck_commit=None), "packet row must name the record's recheck_commit"),
            ("worker_output_without_snapshot_fails", lambda rec: rewrite_output(rec, "worker", drop=("dependency_hashes_at_recheck",)), "worker output must bind"),
        ):
            row = append_with(mutate=mutate)
            report = validate_rows([legacy_row(), row])
            check(name, has(report, text) and has(report, "is stale"), report["errors"])
        # The V1 r4 A1 reproduction: original outputs, original packets and replacement packets for a
        # newer snapshot all land in one bundle commit after that snapshot; a fresh record re-points to
        # the newer snapshot and the replacement packets. The unchanged outputs echo the original rows.
        row = append_with(commit_receipts=False)
        rec = [json.loads(l) for l in records_path.read_text().splitlines() if l.strip()][-1]
        write_doc(SELF_TEST_DOC.replace("- The repair stays.", "- The repair is forbidden and must be removed."))
        git("add", "Plans/Fixture.md")
        git("commit", "-q", "-m", "newer snapshot")
        newer = git("rev-parse", "HEAD")
        newer_hash = AnchorResolver(tmp).sha256(unit_ref)
        replay = json.loads(json.dumps(rec))
        replay.update(recheck_commit=newer, dependency_hashes_at_recheck={unit_ref: newer_hash})
        for who in ("sol", "astra"):
            shown = json.loads((ROOT / rec["reviews"][who]["packet_path"]).read_text())
            shown.update(recheck_commit=newer, dependency_anchors=[{"ref": unit_ref, "sha256": newer_hash,
                                                                     "text": AnchorResolver(tmp).content(unit_ref)[1], "truncated": False}])
            shown["packet_row_digest"] = packet_row_digest(shown)
            replacement = audit_dir / "reviews" / f"replacement-{who}.jsonl"
            replacement.write_text(json.dumps(shown) + "\n", encoding="utf-8")
            replay["reviews"][who].update(packet_path=rel(replacement), packet_sha256=sha256_file(replacement))
        replay_path = audit_dir / "replayed-records.jsonl"
        replay_path.write_text(json.dumps(replay, sort_keys=True) + "\n", encoding="utf-8")
        row["reaudit"].update(record=rel(replay_path), recheck_commit=newer, record_sha256=reaudit_record_sha256(replay))
        row["hashes"]["owner_evidence_hashes"] = {unit_ref: newer_hash}
        commit_all()
        report = validate_rows([legacy_row(), row])
        check("outputs_repointed_to_replacement_packets_fail", has(report, "reviews.sol output does not echo the digest of the packet row it judged")
              and has(report, "reviews.astra output does not echo the digest of the packet row it judged") and has(report, "is stale"), report["errors"])
        write_doc()

        # V1 r5 regressions.
        # B1: a newline in a receipt path cannot misframe git's batch lookups.
        newline_path = "Plans/.audits/reaudit-fixture/reviews/x.jsonl\nPlans/Fixture.md"
        before_newline = git("rev-parse", "HEAD")
        (tmp / newline_path).parent.mkdir(parents=True, exist_ok=True)
        (tmp / newline_path).write_text('{"line": 1}\n', encoding="utf-8")  # a real, committed newline-named receipt
        commit_all()
        newline_problem = ReceiptLedger(tmp).check(newline_path, before_newline)[1] or ""
        check("receipt_path_with_newline_refused", "not a safe repository-relative path" in newline_problem, newline_problem)
        shutil.rmtree(tmp / "Plans/.audits/reaudit-fixture/reviews/x.jsonl\nPlans")
        commit_all()
        check("anchor_path_with_control_character_refused", anchor_ref_problem("Plans/Fix\nture.md#unit=FIX-001") is not None)
        row = append_with(mutate=set_review("sol", evidence_path="Plans/.audits/reaudit-fixture/reviews/sol\nx.jsonl"))
        report = validate_rows([legacy_row(), row])
        check("review_receipt_path_with_newline_fails", has(report, "control characters") and has(report, "is stale"), report["errors"])
        row = append_with()
        row["reaudit"]["record"] = rel(records_path) + "\nPlans/Fixture.md"
        report = validate_rows([legacy_row(), row])
        check("record_path_with_newline_fails", has(report, "control characters") and has(report, "is stale"), report["errors"])
        # B2: a class body that declares the name global/nonlocal rebinds it when the class is defined.
        for name, source, ref in (
            ("pydef_class_global_assignment_fails", "def f():\n    return 1\nclass C:\n    global f\n    f = 2\n", "f"),
            ("pydef_class_global_del_fails", "def f():\n    return 1\nclass C:\n    global f\n    del f\n", "f"),
            ("pydef_class_global_walrus_fails", "def f():\n    return 1\nclass C:\n    global f\n    x = (f := 2)\n", "f"),
            ("pydef_nested_class_global_fails", "def f():\n    return 1\nclass A:\n    class B:\n        global f\n        f = 3\n", "f"),
            ("pydef_class_nonlocal_fails", "def outer():\n    def f():\n        return 1\n    class C:\n        nonlocal f\n        f = 2\n    return f\n", "outer.f"),
        ):
            (tmp / "scripts/bind.py").write_text(source, encoding="utf-8")
            check(name, not resolves(f"scripts/bind.py#pydef={ref}"))
        for name, source, ref in (
            ("pydef_class_member_declared_global_fails", "class C:\n    global f\n    def f():\n        return 1\n", "C.f"),
            ("pydef_class_member_declared_nonlocal_fails", "def outer():\n    f = None\n    class C:\n        nonlocal f\n        def f():\n            return 1\n    return C, f\n", "outer.C.f"),
            ("pydef_function_member_declared_global_fails", "def outer():\n    global f\n    def f():\n        return 1\n", "outer.f"),
        ):
            (tmp / "scripts/bind.py").write_text(source, encoding="utf-8")
            check(name, not resolves(f"scripts/bind.py#pydef={ref}"))
        (tmp / "scripts/bind.py").write_text("class C:\n    global g\n    def f():\n        return 1\n", encoding="utf-8")
        check("pydef_class_member_other_global_ignored", resolves("scripts/bind.py#pydef=C.f"))
        # R7-B2: names are compared after private-name mangling, and the symbol table confirms ownership.
        for name, source, ref in (
            ("pydef_mangled_member_declared_global_fails", "class C:\n    global __f\n    def _C__f():\n        return 1\n", "C._C__f"),
            ("pydef_mangled_intermediate_declared_global_fails", "class C:\n    global __D\n    class _C__D:\n        def f():\n            return 1\n", "C._C__D.f"),
            ("pydef_mangled_member_declared_nonlocal_fails", "def outer():\n    _C__f = None\n    class C:\n        nonlocal __f\n        def _C__f():\n            return 1\n    return C\n", "outer.C._C__f"),
            ("pydef_mangled_class_global_rebinding_fails", "def _C__f():\n    return 1\nclass C:\n    global __f\n    __f = 2\n", "_C__f"),
            ("pydef_mangled_class_nonlocal_rebinding_fails", "def outer():\n    def _C__f():\n        return 1\n    class C:\n        nonlocal __f\n        __f = 2\n    return _C__f\n", "outer._C__f"),
            ("pydef_mangled_duplicate_definition_fails", "class C:\n    def __f():\n        return 1\n    def _C__f():\n        return 2\n", "C._C__f"),
        ):
            (tmp / "scripts/bind.py").write_text(source, encoding="utf-8")
            check(name, not resolves(f"scripts/bind.py#pydef={ref}"))
        # R8-B2: special names can be bound implicitly by the compiler (Python 3.14 __annotate_func__).
        for name, source, ref in (
            ("pydef_special_name_method_refused", "class C:\n    def __annotate_func__():\n        return 1\n    x: int\n", "C.__annotate_func__"),
            ("pydef_special_name_assignment_refused", "class C:\n    __annotate_func__ = 1\n    x: int\n", "C.__annotate_func__"),
            ("pydef_dunder_method_refused", "class C:\n    def __init__(self):\n        pass\n", "C.__init__"),
        ):
            (tmp / "scripts/bind.py").write_text(source, encoding="utf-8")
            check(name, not resolves(f"scripts/bind.py#pydef={ref}"))
        (tmp / "scripts/bind.py").write_text("class C:\n    def __f(self):\n        return 1\n", encoding="utf-8")
        check("pydef_mangled_method_resolves_by_runtime_name", resolves("scripts/bind.py#pydef=C._C__f")
              and "return 1" in AnchorResolver(tmp).content("scripts/bind.py#pydef=C._C__f")[1])
        for name, source in (
            ("pydef_class_local_binding_ignored", "def f():\n    return 1\nclass C:\n    f = 2\n"),
            ("pydef_class_global_of_other_name_ignored", "def f():\n    return 1\nclass C:\n    global g\n    f = 2\n"),
            ("pydef_inner_class_without_global_ignored", "def f():\n    return 1\nclass A:\n    global f\n    class B:\n        f = 5\n"),
        ):
            (tmp / "scripts/bind.py").write_text(source, encoding="utf-8")
            check(name, resolves("scripts/bind.py#pydef=f") and "return 1" in AnchorResolver(tmp).content("scripts/bind.py#pydef=f")[1])

        # V1 r4 regressions.
        # A2: a receipt rewritten inside a merge commit no longer counts.
        row = append_with()
        rec = [json.loads(l) for l in records_path.read_text().splitlines() if l.strip()][-1]
        branch = git("rev-parse", "--abbrev-ref", "HEAD")
        git("checkout", "-q", "-b", "side-a2")
        (tmp / "side.txt").write_text("side", encoding="utf-8")
        commit_all()
        git("checkout", "-q", branch)
        (tmp / "other.txt").write_text("other", encoding="utf-8")
        commit_all()
        git("merge", "-q", "--no-commit", "--no-ff", "side-a2")
        rewrite_output(rec, "sol", note="rewritten during a merge")
        row["reaudit"]["record_sha256"] = reaudit_record_sha256(rec)
        records_path.write_text(json.dumps(rec, sort_keys=True) + "\n", encoding="utf-8")
        git("add", "-A")
        git("commit", "-q", "-m", "merge side-a2")
        report = validate_rows([legacy_row(), row])
        sol_out = rec["reviews"]["sol"]["evidence_path"]
        check("receipt_rewritten_in_merge_fails", has(report, f"reviews.sol: receipt {sol_out} was changed after it was first committed")
              and has(report, "is stale"), report["errors"])
        # A3: the record file is a receipt too, and the record must be the committed worker output's judgement.
        row = append_with()
        loose = audit_dir / "loose-records.jsonl"
        loose.write_text(records_path.read_text(), encoding="utf-8")
        row["reaudit"]["record"] = rel(loose)
        report = validate_rows([legacy_row(), row])
        check("uncommitted_record_file_fails", has(report, "re-audit record file: receipt") and has(report, "is stale"), report["errors"])
        loose.unlink()
        row = append_with(mutate=lambda rec: rec.update(claim="A different claim than the worker wrote down."))
        report = validate_rows([legacy_row(), row])
        check("record_differing_from_worker_output_fails", has(report, "record.claim differs from the committed worker output") and has(report, "is stale"), report["errors"])
        # A4: packet text must be the anchor's text at the recheck commit.
        def fabricated_packet_text(rec: dict[str, Any]) -> None:
            rewrite_packet(rec, "sol", dependency_anchors=[{"ref": unit_ref, "sha256": rec["dependency_hashes_at_recheck"][unit_ref],
                                                            "text": "Fabricated text the reviewer was shown.", "truncated": False}])
        row = append_with(mutate=fabricated_packet_text)
        report = validate_rows([legacy_row(), row])
        check("packet_text_mismatch_fails", has(report, "is not that anchor's text at recheck_commit") and has(report, "is stale"), report["errors"])
        # A5: walrus targets, match captures and del rebind a name in the same scope.
        for name, source in (
            ("pydef_walrus_rebinding_fails", "def f():\n    return 1\nif (f := (lambda: 2)):\n    pass\n"),
            ("pydef_comprehension_walrus_fails", "def f():\n    return 1\n[f := 2 for _ in range(1)]\n"),
            ("pydef_match_capture_fails", "def f():\n    return 1\nmatch 0:\n    case f:\n        pass\n"),
            ("pydef_del_fails", "def f():\n    return 1\ndel f\n"),
            ("pydef_star_import_fails", "def f():\n    return 1\nfrom os.path import *\n"),
        ):
            (tmp / "scripts/bind.py").write_text(source, encoding="utf-8")
            check(name, not resolves("scripts/bind.py#pydef=f"))
        (tmp / "scripts/bind.py").write_text("def g():\n    if (f := 3):\n        pass\n\ndef f():\n    return 1\n", encoding="utf-8")
        check("pydef_walrus_in_nested_scope_ignored", "return 1" in AnchorResolver(tmp).content("scripts/bind.py#pydef=f")[1])

        # Astra r2 regressions.
        # ASTRA-6: an evidence item carries exactly one of quote or absent.
        row = append_with(evidence=[{"ref": unit_ref, "quote": quote, "absent": "must stay present"}])
        report = validate_rows([legacy_row(), row])
        check("evidence_item_with_quote_and_absent_fails", has(report, "exactly one string quote or absent") and has(report, "is stale"), report["errors"])
        # ASTRA-7: a later row a re-audit confirmed as still blocked is not a later closure.
        blocked_later = legacy_row(closure_id="closure-fixture-later-blocked", closure_status="blocked_requires_user_decision",
                                   closure_reason="Later row of the same finding, still blocked.")
        still_blocked = append_with(rows_before=[legacy_row(), blocked_later], line=2)
        pointer = append_with("superseded_by_later_closure", rows_before=[legacy_row(), blocked_later, still_blocked], line=1,
                              later_closure_id="closure-fixture-later-blocked", keep_records=True)
        report = validate_rows([legacy_row(), blocked_later, still_blocked, pointer])
        check("later_closure_confirmed_still_blocked_fails", has(report, "distinct later closure"), report["errors"])

        # Astra r1 regressions.
        # ASTRA-1: false Markdown boundaries cannot cut text out of a section's hash.
        for name, body in (
            ("section_spans_shorter_fence_inside_longer_fence", "````markdown\n```\n# Example heading\n```\n````\n"),
            ("section_spans_hash_without_space", "#not-a-heading\n"),
            ("section_spans_html_comment_heading", "<!--\n# hidden\n-->\n"),
            ("section_spans_html_block_heading", "<pre>\n# hidden\n</pre>\n"),
            # SOL10-1: the review's seven bodies, each a false boundary for a hand-written scanner.
            ("section_spans_fence_closed_by_overindented_line", " ```\n    ```\n# Hidden\n```\n"),
            ("section_spans_indented_fake_fence_opener", "    ```\n\n```\n# Hidden\n```\n"),
            ("section_spans_fence_with_unicode_closing_suffix", "```\n```\u00a0\n# Hidden\n```\n"),
            ("section_spans_html_block_with_unicode_blank", "<div>\n\u00a0\n# Hidden\n\n"),
            ("section_spans_list_item_heading", "- item\n\n  # Nested\n\n"),
            ("section_spans_html_that_cannot_interrupt_paragraph", "paragraph\n<widget>\n```\n\n# Hidden\n```\n"),
            ("section_spans_invalid_html_attribute", "<widget a\u03c0>\n```\n\n# Hidden\n```\n"),
        ):
            md = tmp / "Plans/md.md"
            texts = []
            for requirement in ("The operation MUST reject unsigned input.", "The operation MAY accept unsigned input."):
                md.write_text(f"# Doc\n\n## Rule\n\nThe rule controls admission.\n\n{body}\n{requirement}\n\n## Next\n\nOther.\n", encoding="utf-8")
                texts.append((AnchorResolver(tmp).sha256("Plans/md.md#section=Rule"), AnchorResolver(tmp).content("Plans/md.md#section=Rule")[1]))
            check(name, texts[0][0] != texts[1][0] and "MUST reject unsigned input" in texts[0][1], texts)
        (tmp / "Plans/md.md").write_text("# Doc\n\n## Rule ##\n\nBody.\n", encoding="utf-8")
        check("section_title_drops_closing_hashes", resolves("Plans/md.md#section=Rule"))
        # ASTRA-3: open -> open -> closed chain whose closed leaf went stale is one open finding.
        first = append_with("not_supported", evidence=missing_quote)
        second = append_with("not_supported", rows_before=[legacy_row(), first], line=2, evidence=missing_quote, keep_records=True)
        third = append_with("resolved_differently", rows_before=[legacy_row(), first, second], line=3, status_now="repaired", keep_records=True)
        write_doc(SELF_TEST_DOC.replace(quote, "The claimed repair is removed and no longer present."))
        report = validate_rows([legacy_row(), first, second, third])
        check("stale_closed_leaf_chain_is_one_open_finding", not has(report, "duplicate open finding_key")
              and [r["line"] for r in report["open_rows"]] == [3], report)
        write_doc()
        # SOL10-3: the governance caller (pm-plans-verify.py) reads the registry with LF-only splitting too.
        here = Path(__file__).resolve().parent
        if (here / "pm-plans-verify.py").is_file():
            for script in ("pm-audit-closure.py", "pm-plans-verify.py", "pm_wiring_inventory.py"):
                if (here / script).is_file():
                    shutil.copyfile(here / script, tmp / "scripts" / script)
            registry.write_text(json.dumps(legacy_row(closure_reason="Repaired left\u2028right."), sort_keys=True, ensure_ascii=False) + "\n",
                                encoding="utf-8")
            spec = __import__("importlib.util").util.spec_from_file_location("pm_plans_verify_selftest", tmp / "scripts" / "pm-plans-verify.py")
            verify = __import__("importlib.util").util.module_from_spec(spec)
            sys.modules[spec.name] = verify
            spec.loader.exec_module(verify)
            verify.ROOT = tmp
            gate = verify.cmd_validate_audit_closure(argparse.Namespace(registry=str(registry)))
            parse_failures = [f for f in gate.get("failures", []) if "json_parse" in json.dumps(f)]
            check("caller_reads_literal_line_separator", "\u2028" in registry.read_text(encoding="utf-8") and not parse_failures, gate)
            for script in ("pm-audit-closure.py", "pm-plans-verify.py", "pm_wiring_inventory.py"):
                (tmp / "scripts" / script).unlink(missing_ok=True)
            sys.modules.pop(spec.name, None)
        # ASTRA-4: JSONL readers split on LF only; U+2028 inside a JSON string stays in it.
        for name, ensure_ascii in (("record_with_literal_line_separator_reads", False), ("record_with_escaped_line_separator_reads", True)):
            uni = audit_dir / f"unicode-{int(ensure_ascii)}.jsonl"
            uni.write_text(json.dumps({"closure_id": "x-u", "line": 7, "rationale": "split\u2028here"}, ensure_ascii=ensure_ascii) + "\n", encoding="utf-8")
            read_errors: list[str] = []
            loaded = load_reaudit_records(uni, read_errors, {}) or {}
            row_found = _jsonl_row_for(uni, 7, "x-u")
            check(name, not read_errors and loaded.get("x-u", {}).get("rationale") == "split\u2028here"
                  and row_found is not None and row_found.get("rationale") == "split\u2028here", read_errors)
            uni.unlink()
        # ASTRA-5: a not_supported fix needs a non-blank string description.
        for name, description, text in (
            ("fix_description_null_fails", None, "description is a string"),
            ("fix_description_number_fails", 7, "description is a string"),
            ("fix_description_blank_fails", "   ", "needs a fix description"),
        ):
            row = append_with("not_supported", evidence=missing_quote, mutate=lambda rec, d=description: rec.update(fix={"kind": "small_in_scope", "description": d}))
            report = validate_rows([legacy_row(), row])
            check(name, has(report, text), report["errors"])

        # F12: the hash report reads anchor rows by their scope.
        fresh = _self_test_registry_row(closure_id="closure-fixture-fresh", hashes={
            "hash_scope": ANCHOR_SCOPE, "owner_evidence_hashes": {unit_ref: AnchorResolver(tmp).sha256(unit_ref)}})
        write_registry([fresh])
        with contextlib.redirect_stdout(io.StringIO()) as out:
            cmd_refresh_hashes(argparse.Namespace(registry=str(registry), dry_run=True))
        check("refresh_dry_run_reads_anchor_scope", json.loads(out.getvalue()).get("touched_rows") == 0, out.getvalue()[:300])

        # The migration validates before writing, is idempotent, and holds back moved anchors.
        def run_append(**kwargs: Any) -> tuple[int, dict[str, Any]]:
            ns = argparse.Namespace(registry=str(registry), records=str(records_path), only="", dry_run=False)
            for key, value in kwargs.items():
                setattr(ns, key, value)
            with contextlib.redirect_stdout(io.StringIO()) as out:
                code = cmd_reaudit_append(ns)
            return code, json.loads(out.getvalue())

        append_with()
        write_registry([legacy_row()])
        code, first_run = run_append()
        code2, second_run = run_append()
        check("reaudit_append_appends_once", code == 0 and first_run["appended"] == 1 and second_run["already_appended"] == 1
              and len(registry.read_text().splitlines()) == 2, [first_run, second_run])
        check("appended_registry_validates", not validate_registry(registry)["errors"])
        prefix = (json.dumps(legacy_row(), sort_keys=True) + "\n").encode()
        check("reaudit_append_preserves_existing_bytes", registry.read_bytes().startswith(prefix))
        write_registry([legacy_row()])
        write_doc(SELF_TEST_DOC.replace("must stay present", "may be removed"))
        _, moved = run_append()
        check("reaudit_append_holds_back_moved_anchor", moved["appended"] == 0 and len(moved["moved_since_recheck"]) == 1
              and len(registry.read_text().splitlines()) == 1, moved)
        write_doc()
        append_with(mutate=lambda rec: rec["reviews"].pop("sol"))
        write_registry([legacy_row()])
        code, invalid = run_append()
        check("reaudit_append_refuses_invalid_record", code != 0 and invalid["appended"] == 0
              and len(registry.read_text().splitlines()) == 1, invalid)
        append_with()
        write_registry([legacy_row()], newline=False)
        code, unterminated = run_append()
        check("reaudit_append_refuses_unterminated_registry", code != 0 and not registry.read_text().endswith("\n"), unterminated)
        # N6: the append preflight blocks registry-level errors, not only errors on new lines.
        prior_open = _self_test_registry_row(closure_id="closure-fixture-open", closure_status="reopened", hashes={
            "owner_evidence_hashes": {"Plans/Fixture.md": sha256_file(doc)},
            "reopen_hash_changes": {"Plans/Fixture.md": {"previous": "1" * 64, "current": "2" * 64}}})
        append_with("not_supported", rows_before=[legacy_row(), prior_open], line=1, evidence=missing_quote)
        write_registry([legacy_row(), prior_open])
        before_bytes = registry.read_bytes()
        code, dup = run_append()
        check("reaudit_append_blocks_new_registry_level_error", code != 0 and dup["appended"] == 0
              and any("duplicate open finding_key" in e for e in dup["errors"]) and registry.read_bytes() == before_bytes, dup)
        # N7: malformed append input is diagnosed, not raised.
        append_with(mutate=lambda rec: rec.update(dependencies=[{}]))
        write_registry([legacy_row()])
        code, malformed = run_append()
        check("reaudit_append_reports_malformed_record", code != 0 and malformed["appended"] == 0
              and any("distinct strings" in e for e in malformed["errors"]), malformed)
        # ASTRA-2: the append preflight never overwrites or deletes a file it does not own.
        sibling = registry.with_name(".reaudit-append-candidate.jsonl")
        sibling.write_text("User-owned diagnostic data.\n", encoding="utf-8")
        append_with()
        write_registry([legacy_row()])
        before_registry = registry.read_bytes()
        code, dry = run_append(dry_run=True)
        check("reaudit_append_dry_run_keeps_registry_and_sibling", code == 0 and registry.read_bytes() == before_registry
              and sibling.read_text() == "User-owned diagnostic data.\n", dry)
        code, real = run_append()
        check("reaudit_append_keeps_sibling_file", code == 0 and sibling.read_text() == "User-owned diagnostic data.\n"
              and registry.read_bytes().startswith(before_registry), real)
        sibling.unlink()
        # SOL10-2: the append transaction holds an exclusive lock on the registry.
        import fcntl  # noqa: PLC0415
        write_registry([legacy_row()])
        # Probe from another process (on NFS, flock is per-process POSIX locking), with a writable descriptor.
        probe = ("import fcntl, sys\nh = open(sys.argv[1], 'ab')\ntry:\n    fcntl.flock(h.fileno(), fcntl.LOCK_EX | fcntl.LOCK_NB)\n"
                 "except BlockingIOError:\n    sys.exit(3)\nsys.exit(0)\n")
        with _RegistryLock(registry):
            held_result = subprocess.run([sys.executable, "-c", probe, str(registry)], capture_output=True).returncode
        free_result = subprocess.run([sys.executable, "-c", probe, str(registry)], capture_output=True).returncode
        check("reaudit_append_lock_is_exclusive", held_result == 3 and free_result == 0, [held_result, free_result])
        with _RegistryLock(registry) as held:
            exclusive_mode = held.handle.mode
        with _RegistryLock(registry, exclusive=False) as held:
            shared_mode = held.handle.mode
        check("reaudit_append_lock_uses_writable_descriptor_for_exclusive", exclusive_mode == "ab" and shared_mode == "rb",
              [exclusive_mode, shared_mode])
        # A read-only registry: a dry run still works, a writing append fails with a diagnostic, not a traceback.
        append_with()
        write_registry([legacy_row()])
        before_ro = registry.read_bytes()
        registry.chmod(0o444)
        try:
            code_dry, dry_ro = run_append(dry_run=True)
            code_real, real_ro = run_append()
        finally:
            registry.chmod(0o644)
        check("reaudit_append_dry_run_on_read_only_registry", code_dry == 0 and dry_ro["would_append"] == 1, dry_ro)
        check("reaudit_append_unwritable_registry_fails_cleanly", (os.geteuid() == 0) or (code_real != 0 and real_ro["status"] == "fail"
              and any("cannot lock" in e for e in real_ro["errors"]) and registry.read_bytes() == before_ro), real_ro)
        # Two concurrent CLI appends of the same record: one appends, the other skips it as done.
        append_with()
        write_registry([legacy_row()])
        shutil.copyfile(Path(__file__).resolve(), tmp / "scripts" / "pm-audit-closure.py")
        cli = [sys.executable, str(tmp / "scripts" / "pm-audit-closure.py"), "reaudit-append",
               "--registry", rel(registry), "--records", rel(records_path)]
        procs = [subprocess.Popen(cli, cwd=tmp, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True) for _ in range(2)]
        outs = [proc.communicate(timeout=300) for proc in procs]
        reports = [json.loads(out[0]) for out in outs]
        lines_now = [l for l in registry.read_text().splitlines() if l.strip()]
        check("concurrent_appends_write_one_row", sorted(r["appended"] for r in reports) == [0, 1]
              and sorted(r["already_appended"] for r in reports) == [0, 1] and len(lines_now) == 2
              and not validate_registry(registry)["errors"], [reports, len(lines_now), [o[1][-300:] for o in outs]])
        (tmp / "scripts" / "pm-audit-closure.py").unlink()
        # F8: an earlier append that no longer validates is reported, not skipped as done.
        append_with()
        write_registry([legacy_row()])
        run_append()
        rows_now = [json.loads(l) for l in registry.read_text().splitlines() if l.strip()]
        rows_now[1]["exact_tokens"] = ["incorrect identity"]
        registry.write_text("".join(json.dumps(r, sort_keys=True) + "\n" for r in rows_now), encoding="utf-8")
        code, stale_skip = run_append()
        check("idempotent_skip_revalidates_existing_row", code != 0 and any("does not validate" in e for e in stale_skip["errors"]), stale_skip)
        write_registry([legacy_row()])
        with contextlib.redirect_stdout(io.StringIO()):
            refresh_code = cmd_refresh_hashes(argparse.Namespace(registry=str(registry), dry_run=False))
        check("refresh_hashes_refuses_to_write", refresh_code != 0 and registry.read_bytes() == (json.dumps(legacy_row(), sort_keys=True) + "\n").encode())

        # Legacy format rule (DL-334, PLS-026): pre-July format and schema-evolution errors of the
        # frozen June directories only.
        saved_pin = LEGACY_INVENTORY_SHA256
        legacy_name, second_name = sorted(LEGACY_AUDIT_DIRS)[0], sorted(LEGACY_AUDIT_DIRS)[1]
        check("legacy_list_is_closed_and_pre_july", len(LEGACY_AUDIT_DIRS) == 55 and all(
            re.fullmatch(r"audit-(\d{8})-\d{3}-[a-z0-9-]+", n) and n[6:14] < LEGACY_FORMAT_CUTOFF for n in LEGACY_AUDIT_DIRS))
        audits = tmp / "Plans/.audits"
        legacy_dir, second_dir = audits / legacy_name, audits / second_name
        july = audits / "audit-20260705-001-fixture"
        fam = {"finding_family": "fixture_family", "ledger_id": "pldg-fixture", "source_atom_ids": ["atom-0001"],
               "owner_docs": ["Plans/Fixture.md"], "detail_keys": ["semantic_risks.jsonl:1"], "exact_tokens": []}
        ident_a = dict(fam, plan_unit_ids=["FIX-001"])
        ident_b = dict(fam, plan_unit_ids=["FIX-002"], detail_keys=["semantic_risks.jsonl:1", "other subject"])
        key_a = compute_finding_key(ident_a)
        legacy_registry = audits / "_legacy_fixture_registry.jsonl"

        def matrix_row(src: int, ident: dict[str, Any], key: str, closure_id: str) -> str:
            return json.dumps({"source_artifact": "semantic_risks.jsonl", "source_row": src, "closure_status": "repaired",
                               "closure_evidence": ["Plans/Fixture.md"], "closure_reason": "fixture",
                               "registry_closure_id": closure_id, "finding_key": key, **ident}, sort_keys=True) + "\n"

        def write_fixture(d: Path, matrix: str) -> None:
            d.mkdir(parents=True, exist_ok=True)
            (d / "audit_report.json").write_text(json.dumps({"audit_id": d.name}), encoding="utf-8")
            (d / "semantic_risks.jsonl").write_text(
                json.dumps({"severity": "high", "summary": "actionable by inference"}) + "\n"
                + json.dumps({"severity": "low", "summary": "not actionable by inference"}) + "\n"
                + json.dumps({"severity": "low", "repair_required": False, "finding_level": "info", "summary": "explicitly not actionable"}) + "\n"
                + json.dumps({"severity": "low", "finding_level": "info", "summary": "a stated level only"}) + "\n"
                + json.dumps({"severity": "high", "summary": "second actionable, never closed"}) + "\n",
                encoding="utf-8")
            (d / "repair_closure_matrix.jsonl").write_text(matrix, encoding="utf-8")
            (d / "effective_status.json").write_text("{}", encoding="utf-8")

        def registry_rows(*rows: dict[str, Any]) -> None:
            legacy_registry.write_text("".join(json.dumps(r, sort_keys=True) + "\n" for r in rows), encoding="utf-8")

        def freeze(*dirs: Path) -> None:
            global LEGACY_INVENTORY_SHA256  # noqa: PLW0603 - point the pin at this fixture's inventory
            inv = {"directories": {}}
            for d in dirs:
                files = {}
                for f in sorted(x for x in d.rglob("*") if x.is_file() and x.name != "effective_status.json"):
                    data = f.read_bytes()
                    e = {"sha256": hashlib.sha256(data).hexdigest()}
                    if f.name == "repair_closure_matrix.jsonl":
                        e.update(bytes=len(data), lines=data.count(b"\n"))
                    files[f.relative_to(d).as_posix()] = e
                inv["directories"][d.name] = {"files": files}
            text = json.dumps(inv, sort_keys=True).encode()
            (tmp / LEGACY_INVENTORY).write_bytes(text)
            LEGACY_INVENTORY_SHA256 = hashlib.sha256(text).hexdigest()
            _LEGACY_INVENTORY_CACHE.clear()

        def run_dir(d: Path) -> dict[str, Any]:
            _LEGACY_INVENTORY_CACHE.clear()
            return validate_audit_dir(d, require_matrix=True, require_effective_status=False,
                                      source_artifacts=["semantic_risks.jsonl"], registry_path=legacy_registry)

        try:
            # Historical matrix: row 1 closes actionable row 1 with B's identity under A's key and
            # registry closure (a wrong identity); row 2 covers inferred row 2 with an old key whose
            # identity agrees with its registry closure.
            old_key = "legacy-key-two"
            historical = matrix_row(1, ident_b, key_a, "closure-A") + matrix_row(2, ident_a, old_key, "closure-A2")
            registry_rows({"closure_id": "closure-A", "finding_key": key_a, "closure_status": "repaired",
                           "audit_ids": [legacy_name, july.name], "closed_by_audit_id": legacy_name, **ident_a},
                          {"closure_id": "closure-A2", "finding_key": old_key, "closure_status": "repaired",
                           "audit_ids": [legacy_name, july.name], "closed_by_audit_id": legacy_name, **ident_a})
            for d in (legacy_dir, second_dir, july):
                write_fixture(d, historical)
            freeze(legacy_dir, second_dir)
            frozen_names = ["audit_report.json", "repair_closure_matrix.jsonl", "semantic_risks.jsonl"]
            check("legacy_state_for_frozen_real_dir", legacy_audit_state(legacy_dir) == {"historical_matrix_lines": 2, "frozen_files": frozen_names}
                  and legacy_audit_state(Path(rel(legacy_dir))) == {"historical_matrix_lines": 2, "frozen_files": frozen_names})
            check("legacy_state_unlisted_name_is_none", legacy_audit_state(july) is None)
            external = tmp / "elsewhere" / legacy_name
            write_fixture(external, historical)
            check("legacy_state_external_alias_is_none", legacy_audit_state(external) is None)
            # A symlink outside the tree whose name is the listed name and whose target is the real
            # frozen directory, and a symlinked parent pointing at the real Plans/.audits.
            alias_leaf = tmp / "aliases" / legacy_name
            alias_leaf.parent.mkdir(parents=True, exist_ok=True)
            alias_leaf.symlink_to(legacy_dir, target_is_directory=True)
            alias_parent = tmp / "alias-audits"
            alias_parent.symlink_to(legacy_dir.parent, target_is_directory=True)
            child = legacy_dir.parent.parent / "r7-child"
            child.mkdir(parents=True, exist_ok=True)
            dotdot_alias = legacy_dir.parent.parent / "r7-alias"
            dotdot_alias.symlink_to(child, target_is_directory=True)
            dotted = Path(str(dotdot_alias) + "/../.audits/" + legacy_name)
            check("legacy_state_symlink_then_dotdot_is_none", legacy_audit_state(dotted) is None)
            link_dir = legacy_dir.parent.parent / "r7-links"
            link_dir.symlink_to(legacy_dir, target_is_directory=True)
            check("path_has_symlink_checks_every_component",
                  path_has_symlink(link_dir / "semantic_risks.jsonl") and path_has_symlink(dotted)
                  and not path_has_symlink(legacy_dir / "semantic_risks.jsonl") and not path_has_symlink(legacy_dir))
            check("legacy_state_alias_to_real_dir_is_none",
                  legacy_audit_state(alias_leaf) is None and legacy_audit_state(alias_parent / legacy_name) is None
                  and legacy_audit_state(legacy_dir) is not None)
            shutil.rmtree(second_dir)
            second_dir.symlink_to(external, target_is_directory=True)
            check("legacy_state_leaf_symlink_is_none", legacy_audit_state(second_dir) is None)
            # A symlinked parent: Plans/.audits of another root points outside it.
            root2 = tmp / "root2"
            (root2 / "Plans").mkdir(parents=True)
            (root2 / "outside").mkdir()
            (root2 / "Plans/.audits").symlink_to(root2 / "outside", target_is_directory=True)
            write_fixture(root2 / "outside" / legacy_name, historical)
            (root2 / "outside" / "_legacy_format_inventory.json").write_bytes((tmp / LEGACY_INVENTORY).read_bytes())
            ROOT = root2
            try:
                parent_state = legacy_audit_state(root2 / "Plans/.audits" / legacy_name)
                outside_state = legacy_audit_state(root2 / "outside" / legacy_name)
            finally:
                ROOT = tmp
                _LEGACY_INVENTORY_CACHE.clear()
            check("legacy_state_parent_symlink_is_none", parent_state is None and outside_state is None, [parent_state, outside_state])
            risks = legacy_dir / "semantic_risks.jsonl"
            saved_risks = risks.read_bytes()
            risks.write_bytes(saved_risks.replace(b"actionable by inference", b"actionable by inference!", 1))
            check("legacy_state_edited_historical_file_is_none", (_LEGACY_INVENTORY_CACHE.clear() or legacy_audit_state(legacy_dir)) is None)
            risks.write_bytes(saved_risks)
            mpath = legacy_dir / "repair_closure_matrix.jsonl"
            mpath.write_bytes(historical.replace("fixture", "fixturE", 1).encode())
            check("legacy_state_edited_matrix_prefix_is_none", (_LEGACY_INVENTORY_CACHE.clear() or legacy_audit_state(legacy_dir)) is None)
            mpath.write_bytes(historical.encode())
            pin = LEGACY_INVENTORY_SHA256
            LEGACY_INVENTORY_SHA256 = "0" * 64
            check("legacy_state_inventory_pin_mismatch_is_none", (_LEGACY_INVENTORY_CACHE.clear() or legacy_audit_state(legacy_dir)) is None)
            LEGACY_INVENTORY_SHA256 = pin
            _LEGACY_INVENTORY_CACHE.clear()
            # Appended rows: a new closure of actionable row 4's sibling with a wrong key; an appended
            # row is never historical.
            appended = matrix_row(3, ident_b, key_a, "closure-A")
            mpath.write_bytes((historical + appended).encode())
            check("legacy_state_appended_matrix_keeps_history", (legacy_audit_state(legacy_dir) or {}).get("historical_matrix_lines") == 2)

            lp = rel(legacy_dir) + "/"
            P = lambda name: legacy_dir / name  # noqa: E731
            ctx = {"legacy_state": {"historical_matrix_lines": 10}, "historical_matrix_lines": 10,
                   "frozen_files": ["audit_report.json", "semantic_risks.jsonl", "validator_results.json", "repair_closure_matrix.jsonl"],
                   "unfrozen_inputs": [], "symlinked_inputs": [], "matrix_identity_agrees": {7},
                   "source_artifacts": ["semantic_risks.jsonl", "validator_results.json"], "extra_coverage_all_inferred": True}
            M = "repair_closure_matrix.jsonl"
            demotable = [
                ("artifact_predates_schema", dict(origin=P(SCOPE_MANIFEST), kind="artifact_absent")),
                ("artifact_predates_schema", dict(origin=P(IMPACT_MATRIX), kind="artifact_absent")),
                ("artifact_predates_schema", dict(origin=P(SCOPE_MANIFEST), kind="scope_coverage", manifest_exists=False)),
                ("reference_field_predates_schema", dict(origin=P(M), row=3, kind="ref_missing", field="subject_ref")),
                ("reference_field_predates_schema", dict(origin=P("semantic_risks.jsonl"), row=2, kind="ref_missing", field="observation_ref")),
                ("reference_field_predates_schema", dict(origin=P("audit_report.json"), row=None, kind="ref_empty", field="baseline_ref")),
                ("reference_field_predates_schema", dict(origin=P("validator_results.json"), row="$", kind="ref_missing", field="audit_id")),
                ("row_field_predates_schema", dict(origin=P(M), row=4, kind="matrix_missing_fields", fields=["detail_keys", "finding_key"])),
                ("row_field_predates_schema", dict(origin=P(M), row=4, kind="matrix_list_type", field="detail_keys", absent=True)),
                ("row_field_predates_schema", dict(origin=P(M), row=4, kind="matrix_key_empty", absent=True)),
                ("row_field_predates_schema", dict(origin=P("semantic_risks.jsonl"), row=5, kind="finding_missing_fields", fields=["finding_level", "repair_required"])),
                ("finding_key_predates_algorithm", dict(origin=P("semantic_risks.jsonl"), row=6, kind="key_algorithm")),
                ("finding_key_predates_algorithm", dict(origin=P(M), row=7, kind="key_algorithm")),
                ("report_field_predates_schema", dict(origin=P("audit_report.json"), kind="report_count", reported_absent=True)),
                ("report_field_predates_schema", dict(origin=P("audit_report.json"), kind="report_status", status_stated=False)),
                ("inferred_actionability_over_coverage", dict(origin=P(M), kind="over_coverage")),
            ]
            kept_cases = [
                dict(origin=P(M), row=11, kind="ref_missing", field="subject_ref"),            # appended matrix row
                dict(origin=P(M), row=11, kind="matrix_missing_fields", fields=["detail_keys"]),
                dict(origin=P(M), row=3, kind="matrix_missing_fields", fields=["closure_reason", "finding_key"]),
                dict(origin=P(M), row=8, kind="matrix_list_type", field="owner_docs", absent=False),
                dict(origin=P(M), row=9, kind="matrix_key_empty", absent=False),
                dict(origin=P(M), row=8, kind="key_algorithm"),                                # identity disagrees
                dict(origin=P("semantic_risks.jsonl"), row=2, kind="ref_missing", field="not_a_ref_field"),
                dict(origin=P("semantic_risks.jsonl"), row=5, kind="finding_missing_fields", fields=["summary"]),
                dict(origin=P("audit_report.json"), kind="report_count", reported_absent=False),
                dict(origin=P("audit_report.json"), kind="report_status", status_stated=True),
                dict(origin=P("audit_report.json"), kind="missing_closure_rows"),               # unnamed kind
                dict(origin=P("closure_reuse.jsonl"), row=2, kind="ref_missing", field="observation_ref"),   # not read / not frozen
                dict(origin=tmp / "Plans/.audits/audit-20260801-001-other/semantic_risks.jsonl", row=2, kind="ref_missing", field="observation_ref"),
                dict(origin=None, kind="ref_missing", field="subject_ref"),
                dict(origin=str(P("semantic_risks.jsonl")), row=2, kind="ref_missing", field="observation_ref"),  # not a Path
            ]
            diag = AuditDiagnostics()
            for i, (kind, info) in enumerate(demotable):
                diag.add(f"demotable message {i}", **info)
            for i, info in enumerate(kept_cases):
                diag.add(f"kept message {i}", **info)
            # Text that impersonates a demotable diagnostic, recorded without structure.
            diag.append(f"{lp}semantic_risks.jsonl:1: audit finding missing required fields ['repair_required']")
            diag.append(f"missing {lp}audit_scope_manifest.jsonl")
            kept, demoted = classify_legacy_format_errors(legacy_dir, diag, ctx)
            demoted_flat = {m: k for k, ms in demoted.items() for m in ms}
            check("legacy_rule_demotes_each_named_kind", demoted_flat == {f"demotable message {i}": k for i, (k, _) in enumerate(demotable)},
                  {"got": demoted_flat})
            check("legacy_rule_keeps_substantive_later_unnamed_and_unstructured",
                  kept == [f"kept message {i}" for i in range(len(kept_cases))] + list(diag[-2:]), kept)
            strict = dict(ctx, extra_coverage_all_inferred=False, unfrozen_inputs=["new_findings.jsonl"])
            conditional = AuditDiagnostics()
            for info in (dict(origin=P(SCOPE_MANIFEST), kind="artifact_absent"), dict(origin=P(IMPACT_MATRIX), kind="artifact_absent"),
                         dict(origin=P(SCOPE_MANIFEST), kind="scope_coverage", manifest_exists=False), dict(origin=P(M), kind="over_coverage")):
                conditional.add("conditional", **info)
            check("legacy_rule_conditions_hold", classify_legacy_format_errors(legacy_dir, conditional, strict)[0] == ["conditional"] * 4)
            check("legacy_rule_no_matrix_history_demotes_no_matrix_row", all(
                (m in classify_legacy_format_errors(legacy_dir, diag, dict(ctx, historical_matrix_lines=None))[0])
                == (info.get("origin") == P(M) and info.get("row") is not None)
                for (_, info), m in zip(demotable, [f"demotable message {i}" for i in range(len(demotable))])))
            check("legacy_rule_symlinked_input_keeps_everything",
                  classify_legacy_format_errors(legacy_dir, diag, dict(ctx, symlinked_inputs=["new_findings.jsonl"])) == (list(diag), {}))
            check("legacy_rule_reserved_source_keeps_everything", all(
                classify_legacy_format_errors(legacy_dir, diag, dict(ctx, source_artifacts=[*ctx["source_artifacts"], name])) == (list(diag), {})
                for name in sorted(LEGACY_RESERVED_SOURCE_NAMES)))
            spellings = ["./audit_report.json", ".//audit_report.json", "sub/../audit_report.json",
                         str(legacy_dir / "audit_report.json"), "./repair_closure_matrix.jsonl", "./audit_scope_manifest.jsonl"]
            check("legacy_rule_reserved_source_by_file_identity", all(
                reserved_source_names(legacy_dir, [spelling]) for spelling in spellings)
                and reserved_source_names(legacy_dir, ["semantic_risks.jsonl", "./semantic_risks.jsonl"]) == []
                and reserved_source_names(legacy_dir, ["./audit_report.json", "audit_report.json"]) == ["audit_report.json"])
            check("legacy_rule_reserved_alias_keeps_everything", all(
                classify_legacy_format_errors(legacy_dir, diag, dict(ctx, source_artifacts=[*ctx["source_artifacts"], spelling])) == (list(diag), {})
                for spelling in spellings))
            check("legacy_rule_reserved_source_flag_keeps_everything",
                  classify_legacy_format_errors(legacy_dir, diag, dict(ctx, reserved_source_inputs=[M])) == (list(diag), {}))
            # The matrix requested as a source keeps an appended row's key and source-field errors.
            role = AuditDiagnostics()
            role.add("appended matrix key", origin=P(M), row=11, kind="key_algorithm")
            role.add("appended matrix fields", origin=P(M), row=11, kind="finding_missing_fields", fields=["repair_required"])
            check("legacy_rule_matrix_requested_as_source_keeps_appended_errors",
                  classify_legacy_format_errors(legacy_dir, role, dict(ctx, source_artifacts=[M], reserved_source_inputs=[])) == (list(role), {}))
            check("legacy_rule_plain_list_keeps_everything",
                  classify_legacy_format_errors(legacy_dir, list(diag), ctx) == (list(diag), {}))
            only_matrix = classify_legacy_format_errors(legacy_dir, diag, dict(ctx, frozen_files=[M]))[1]
            check("legacy_rule_unfrozen_files_get_full_rules", all(
                not (str(info.get("origin", "")).endswith(("semantic_risks.jsonl", "audit_report.json", "validator_results.json")))
                for (_, info), m in zip(demotable, [f"demotable message {i}" for i in range(len(demotable))])
                if m in {x for ms in only_matrix.values() for x in ms}), only_matrix)

            # Through validate_audit_dir: the same bytes under a listed and a July name.
            (july / "repair_closure_matrix.jsonl").write_bytes(mpath.read_bytes())
            lr, jr = run_dir(legacy_dir), run_dir(july)
            demoted_msgs = [m for ms in lr["legacy_format_rule"]["examples"].values() for m in ms]
            rename = lambda m: m.replace(july.name, legacy_name)  # noqa: E731
            # The fixture registry names the listed directory as the closer, so the July twin alone
            # reports closed_by_audit_id; every other message must match.
            july_as_legacy = sorted(m for m in map(rename, jr["errors"]) if "closed_by_audit_id does not match" not in m)
            from collections import Counter  # noqa: PLC0415

            check("legacy_rule_only_reclassifies", "legacy_format_rule" not in jr and lr["legacy_format_rule"]["demoted_count"] > 0
                  and len(lr["errors"]) + lr["legacy_format_rule"]["demoted_count"] == len(july_as_legacy)
                  and not (Counter(lr["errors"]) - Counter(july_as_legacy))
                  and all(m in july_as_legacy for m in demoted_msgs),
                  {"kept": len(lr["errors"]), "demoted": lr["legacy_format_rule"]["demoted_count"], "july": len(july_as_legacy),
                   "kept_not_in_july": list((Counter(lr["errors"]) - Counter(july_as_legacy)).elements()),
                   "demoted_not_in_july": [m for m in demoted_msgs if m not in july_as_legacy],
                   "july_not_accounted": list((Counter(july_as_legacy) - Counter(lr["errors"])).elements())[:20]})
            wrong_identity = f"{lp}repair_closure_matrix.jsonl:1: finding_key {key_a} does not match deterministic {compute_finding_key(ident_b)}"
            check("legacy_rule_keeps_historical_wrong_identity", wrong_identity in lr["errors"], lr["errors"])
            check("legacy_rule_demotes_agreeing_old_key", any(f"repair_closure_matrix.jsonl:2: finding_key {old_key} does not match" in m
                                                               for m in demoted_msgs) or lr["legacy_format_rule"]["demoted_by_kind"].get("finding_key_predates_algorithm") == 1, lr)
            check("legacy_rule_keeps_appended_wrong_identity", any("repair_closure_matrix.jsonl:3: finding_key" in e for e in lr["errors"]), lr["errors"])
            check("legacy_rule_keeps_missing_closure_and_registry_link", any("missing closure rows for 1 source rows" in e for e in lr["errors"]), lr["errors"])
            check("legacy_rule_warns_once_with_limit", sum("pm.audit_closure.legacy_format.v1" in w for w in lr["warnings"]) == 1
                  and any("never excuses a missing closure row" in w for w in lr["warnings"]), lr["warnings"])
            # Over-coverage: demoted only when every covered non-actionable row is inferred and its
            # closure rows are historical.
            mpath.write_bytes(historical.encode())
            check("legacy_rule_demotes_inferred_historical_over_coverage", not any("non-actionable source rows" in e for e in run_dir(legacy_dir)["errors"]))
            mpath.write_bytes((historical + matrix_row(4, ident_a, old_key, "closure-A2")).encode())
            check("legacy_rule_keeps_over_coverage_of_stated_level_row", any("non-actionable source rows" in e for e in run_dir(legacy_dir)["errors"]))
            mpath.write_bytes(historical.encode())
            # Validator results: a duplicate name where one result states its classification.
            for d in (legacy_dir,):
                (d / "validator_results.json").write_text(json.dumps({"results": [
                    {"name": "same", "status": "pass", "repair_required": False, "finding_level": "info"},
                    {"name": "same", "status": "pass"}]}), encoding="utf-8")
                (d / "repair_closure_matrix.jsonl").write_text(historical + json.dumps(
                    {"source_artifact": "validator_results.json", "source_row": "results.same", "closure_status": "repaired",
                     "closure_evidence": ["Plans/Fixture.md"], "closure_reason": "fixture", "registry_closure_id": "closure-A2",
                     "finding_key": old_key, **ident_a}, sort_keys=True) + "\n", encoding="utf-8")
            freeze(legacy_dir)
            vr = validate_audit_dir(legacy_dir, require_matrix=True, require_effective_status=False,
                                    source_artifacts=["semantic_risks.jsonl", "validator_results.json"], registry_path=legacy_registry)
            check("legacy_rule_duplicate_result_name_with_stated_level_is_not_inferred",
                  any("non-actionable source rows" in e for e in vr["errors"]), vr["errors"])
            # A relative registry path is repository-relative whatever the working directory (Sol r8).
            elsewhere = tmp / "cwd-elsewhere"
            elsewhere.mkdir(parents=True, exist_ok=True)
            saved_cwd = os.getcwd()
            try:
                os.chdir(elsewhere)
                vr_rel = validate_audit_dir(legacy_dir, require_matrix=True, require_effective_status=False,
                                            source_artifacts=["semantic_risks.jsonl", "validator_results.json"],
                                            registry_path=Path(rel(legacy_registry)))
            finally:
                os.chdir(saved_cwd)
            check("legacy_rule_relative_registry_is_repository_relative",
                  vr_rel.get("errors") == vr.get("errors") and vr_rel.get("warnings") == vr.get("warnings"),
                  {"relative": vr_rel.get("errors"), "absolute": vr.get("errors")})
            # Files written after the freeze get the full rules, even in a frozen directory (Sol r2).
            (legacy_dir / "validator_results.json").unlink()
            (legacy_dir / "repair_closure_matrix.jsonl").write_text(historical, encoding="utf-8")
            freeze(legacy_dir)
            late = legacy_dir / "owner_routing_findings.jsonl"
            late.write_text(json.dumps({"severity": "low", "summary": "added after the freeze", "finding_key": "not-sfk"}) + "\n", encoding="utf-8")
            late_report = validate_audit_dir(legacy_dir, require_matrix=True, require_effective_status=False,
                                             source_artifacts=["semantic_risks.jsonl", "owner_routing_findings.jsonl"], registry_path=legacy_registry)
            late_demoted = [m for ms in late_report["legacy_format_rule"]["examples"].values() for m in ms]
            check("legacy_rule_new_source_file_gets_full_rules", legacy_audit_state(legacy_dir) is not None
                  and any("owner_routing_findings.jsonl:1: finding_key must use deterministic" in e for e in late_report["errors"])
                  and any("owner_routing_findings.jsonl:1: audit finding missing required fields" in e for e in late_report["errors"])
                  and not any("owner_routing_findings.jsonl" in m for m in late_demoted), late_report["errors"])
            late.unlink()
            third = audits / sorted(LEGACY_AUDIT_DIRS)[2]
            write_fixture(third, historical)
            (third / "audit_report.json").unlink()
            freeze(third)
            (third / "audit_report.json").write_text("{}", encoding="utf-8")
            third_report = validate_audit_dir(third, require_matrix=True, require_effective_status=False,
                                              source_artifacts=["semantic_risks.jsonl"], registry_path=legacy_registry)
            check("legacy_rule_new_input_requires_newer_artifacts",
                  any(e.endswith("audit_scope_manifest.jsonl") and e.startswith("missing ") for e in third_report["errors"])
                  and any("missing required check_family coverage" in e for e in third_report["errors"]), third_report["errors"])
            check("legacy_rule_new_report_gets_full_rules", legacy_audit_state(third) is not None
                  and any("audit_report.json: baseline_ref must be a non-empty string" in e for e in third_report["errors"])
                  and any("audit_report.json: repair_required_count None does not match" in e for e in third_report["errors"]), third_report["errors"])
            # File names cannot steer the rule: it never reads message text (Sol r3, r4).
            evil = "semantic_risks.jsonl:1: finding_key must use deterministic sfk-* form, got added.jsonl"
            (third / evil).write_text(json.dumps({"severity": "high", "repair_required": True, "finding_level": "blocker",
                                                   "summary": "new finding B", "finding_key": "sfk-" + "a" * 24}) + "\n", encoding="utf-8")
            evil_report = validate_audit_dir(third, require_matrix=True, require_effective_status=False,
                                             source_artifacts=["semantic_risks.jsonl", evil], registry_path=legacy_registry)
            evil_demoted = [m for ms in evil_report["legacy_format_rule"]["examples"].values() for m in ms]
            check("legacy_rule_diagnostic_named_file_gets_full_rules",
                  any("does not match deterministic" in e and evil in e for e in evil_report["errors"])
                  and not any(evil in m for m in evil_demoted), evil_report["errors"])
            (third / evil).unlink()
            fourth = audits / sorted(LEGACY_AUDIT_DIRS)[3]
            write_fixture(fourth, "")
            (fourth / "repair_closure_matrix.jsonl").unlink()
            freeze(fourth)
            forged = "semantic_risks.jsonl:1: audit finding missing required fields ['repair_required'] # added.jsonl"
            (fourth / forged).write_text("", encoding="utf-8")
            (fourth / "repair_closure_matrix.jsonl").symlink_to(fourth / forged)
            symlink_report = validate_audit_dir(fourth, require_matrix=True, require_effective_status=False,
                                                source_artifacts=["semantic_risks.jsonl"], registry_path=legacy_registry)
            check("legacy_rule_symlinked_matrix_keeps_missing_closure",
                  any("missing closure rows for 2 source rows" in e for e in symlink_report["errors"])
                  and symlink_report.get("legacy_format_rule", {}).get("demoted_count", 0) == 0, symlink_report["errors"])
            (fourth / "repair_closure_matrix.jsonl").unlink()
            (fourth / "new_findings.jsonl").symlink_to(fourth / forged)
            src_link_report = validate_audit_dir(fourth, require_matrix=True, require_effective_status=False,
                                                 source_artifacts=["semantic_risks.jsonl", "new_findings.jsonl"], registry_path=legacy_registry)
            check("legacy_rule_symlinked_source_keeps_everything",
                  src_link_report.get("legacy_format_rule", {}).get("demoted_count", 0) == 0, src_link_report)
            (fourth / "new_findings.jsonl").unlink()
            (fourth / forged).unlink()

            # Q-A (DL-340): four compatibility words, in frozen files of a June directory only.
            check("compat_words_default_off", legacy_actionable_jsonl_row({"claim_status": "pass"}, "planunit_source_claims.jsonl"))
            check("compat_words_read_three_claim_statuses_as_held", not any(
                legacy_actionable_jsonl_row({"claim_status": w}, "planunit_source_claims.jsonl", True)
                for w in ("pass", "supported_by_source_atoms", "previously_closed")))
            check("compat_words_keep_every_other_field", all(
                legacy_actionable_jsonl_row(dict(r, claim_status="pass"), "planunit_source_claims.jsonl", True)
                for r in ({"overclaim_notes": ["x"]}, {"issues": ["x"]}, {"status": "fail"},
                          {"classification": "missing_or_drift"}, {"missing_from_planunit_source_atoms": ["atom-0001"]})))
            check("compat_words_other_claim_status_stays_actionable",
                  legacy_actionable_jsonl_row({"claim_status": "unsupported"}, "planunit_source_claims.jsonl", True)
                  and legacy_actionable_jsonl_row({"claim_status": "PASS"}, "planunit_source_claims.jsonl", True))
            check("compat_words_leave_semantic_risks_alone",
                  legacy_actionable_jsonl_row({"classification": "missing_or_drift", "claim_status": "pass"}, "semantic_risks.jsonl", True))
            fifth = audits / sorted(LEGACY_AUDIT_DIRS)[4]
            fifth.mkdir(parents=True, exist_ok=True)
            (fifth / "audit_report.json").write_text(json.dumps({"audit_id": fifth.name}), encoding="utf-8")
            claim_rows = [{"claim_status": "pass"}, {"claim_status": "supported_by_source_atoms"},
                          {"claim_status": "previously_closed", "overclaim_notes": ["an overclaim list keeps the row"]},
                          {"claim_status": "previously_closed"}, {"claim_status": "unsupported"}]
            (fifth / "planunit_source_claims.jsonl").write_text("".join(json.dumps(r) + "\n" for r in claim_rows), encoding="utf-8")
            gov = sorted(LEGACY_COMPAT_EXPECTED_FAIL_COMMANDS)[0]
            (fifth / "validator_results.json").write_text(json.dumps({"results": [
                {"name": "governance", "command": gov, "status": "expected_fail", "exit_code": 1},
                {"name": "other", "command": "python3 scripts/pm-other.py", "status": "expected_fail", "exit_code": 1},
                {"name": "governance-side-effect", "command": gov, "status": "expected_fail", "exit_code": 1, "side_effect_count": 1},
                {"name": "governance-failed", "command": gov, "status": "fail", "exit_code": 1}]}), encoding="utf-8")
            (fifth / "repair_closure_matrix.jsonl").write_text("", encoding="utf-8")

            def compat_missing(extra: list[str] | None = None) -> list[str]:
                _LEGACY_INVENTORY_CACHE.clear()
                eligible.append(legacy_audit_state(fifth) is not None)
                rep = validate_audit_dir(fifth, require_matrix=True, require_effective_status=False,
                                         source_artifacts=["planunit_source_claims.jsonl", "validator_results.json", *(extra or [])],
                                         registry_path=legacy_registry)
                return [e for e in rep["errors"] if "missing closure rows for" in e]

            eligible: list[bool] = []
            # Not inventoried: full rules, 5 claim rows + 4 validator results are actionable.
            check("compat_words_off_outside_inventory", any("missing closure rows for 9 source rows" in e for e in compat_missing()), compat_missing())
            freeze(fifth)
            # Frozen: rows 3 and 5 of the claims and the non-governance, side-effect and failed results stay.
            check("compat_words_apply_to_frozen_files", any("missing closure rows for 5 source rows" in e for e in compat_missing()), compat_missing())
            (fifth / "new_claims.jsonl").write_text(json.dumps({"claim_status": "pass"}) + "\n", encoding="utf-8")
            check("compat_words_skip_a_file_added_after_the_freeze",
                  any("missing closure rows for 6 source rows" in e for e in compat_missing(["new_claims.jsonl"])), compat_missing(["new_claims.jsonl"]))
            (fifth / "new_claims.jsonl").unlink()
            saved_claims = (fifth / "planunit_source_claims.jsonl").read_bytes()
            (fifth / "planunit_source_claims.jsonl").write_bytes(saved_claims + b"\n")
            check("compat_words_off_when_a_frozen_file_changed", any("missing closure rows for 9 source rows" in e for e in compat_missing()), compat_missing())
            (fifth / "planunit_source_claims.jsonl").write_bytes(saved_claims)
            # Each whole-run case starts from an eligible directory, so only its own condition can turn the words off.
            check("compat_words_whole_run_cases_start_eligible", legacy_audit_state(fifth) is not None)
            whole_run_start = len(eligible)
            # Whole-run exclusions come first (Q-A Astra r1): a reserved companion requested as a source,
            # in any spelling, or any input read through a symlink turns the words off for every file, so
            # all 9 rows of the frozen files stay actionable (audit_report.json itself adds none).
            check("compat_words_off_when_a_companion_is_a_source",
                  any("missing closure rows for 9 source rows" in e for e in compat_missing(["audit_report.json"])),
                  compat_missing(["audit_report.json"]))
            check("compat_words_off_when_a_companion_is_a_source_respelled",
                  any("missing closure rows for 9 source rows" in e for e in compat_missing(["./audit_report.json"])),
                  compat_missing(["./audit_report.json"]))
            saved_registry = legacy_registry.read_bytes() if legacy_registry.exists() else b""
            real_registry = legacy_registry.with_name("_legacy_fixture_registry.real.jsonl")
            real_registry.write_bytes(saved_registry)
            legacy_registry.unlink(missing_ok=True)
            legacy_registry.symlink_to(real_registry)
            check("compat_words_off_when_the_registry_is_a_symlink", any("missing closure rows for 9 source rows" in e for e in compat_missing()), compat_missing())
            legacy_registry.unlink()
            legacy_registry.write_bytes(saved_registry)
            real_registry.unlink()
            # The matrix's frozen part is a prefix: a row appended to it is never read with the words.
            (fifth / "repair_closure_matrix.jsonl").write_text(json.dumps({"claim_status": "pass"}) + "\n", encoding="utf-8")
            _LEGACY_INVENTORY_CACHE.clear()
            matrix_src = validate_audit_dir(fifth, require_matrix=True, require_effective_status=False,
                                            source_artifacts=["repair_closure_matrix.jsonl"], registry_path=legacy_registry)
            check("compat_words_never_read_the_matrix", any("missing closure rows for 1 source rows" in e for e in matrix_src["errors"]), matrix_src["errors"])
            (fifth / "repair_closure_matrix.jsonl").write_text("", encoding="utf-8")
            check("compat_words_whole_run_cases_ran_on_an_eligible_directory",
                  len(eligible) > whole_run_start and all(eligible[whole_run_start:]) and legacy_audit_state(fifth) is not None,
                  eligible[whole_run_start:])
            moved = fifth.parent / "claims-elsewhere.jsonl"
            (fifth / "planunit_source_claims.jsonl").rename(moved)
            (fifth / "planunit_source_claims.jsonl").symlink_to(moved)
            # A frozen file reached through a symlink disqualifies the whole directory (legacy_audit_state).
            check("compat_words_off_through_a_symlink", any("missing closure rows for 9 source rows" in e for e in compat_missing()), compat_missing())
            (fifth / "planunit_source_claims.jsonl").unlink()
            moved.rename(fifth / "planunit_source_claims.jsonl")
        finally:
            LEGACY_INVENTORY_SHA256 = saved_pin
            _LEGACY_INVENTORY_CACHE.clear()
        # PLS-027 / DL-470: corrections are atomic, hash-bound explanations, never coverage.
        correction_dir = tmp / "Plans/.audits/audit-correction-fixture"
        correction_dir.mkdir()
        correction_path = correction_dir / "audit_correction-20261108.json"
        correction_registry = correction_dir / "registry.jsonl"
        refs = {field: "fixture-ref" for field in AUDIT_REF_FIELDS}
        refs.update(audit_id=correction_dir.name, ledger_id="fixture-ledger")
        source_rows = [dict(_self_test_registry_row(detail_keys=[f"finding-{n}"]), **refs,
                            repair_required=n == 1, finding_level="warning") for n in (1, 2)]
        write_jsonl(correction_dir / "semantic_risks.jsonl", source_rows)
        write_json(correction_dir / "audit_report.json", dict(refs, status="PASS_WITH_WARNINGS", repair_required_count=1))
        matrices = [dict(r, source_artifact="semantic_risks.jsonl", source_row=n,
                         registry_closure_id=f"correction-closure-{n}") for n, r in enumerate(source_rows, 1)]
        write_jsonl(correction_dir / "repair_closure_matrix.jsonl", matrices)
        write_jsonl(correction_registry, [dict(r, closure_id=m["registry_closure_id"], audit_ids=[correction_dir.name],
                                              closed_by_audit_id=correction_dir.name) for r, m in zip(source_rows, matrices)])
        scope = []
        for family in sorted(SCOPE_REQUIRED_FAMILIES):
            r = dict(refs, check_family=family, source_atom_ids=[], plan_unit_ids=[], owner_docs=[], detail_keys=[family],
                     exact_tokens=[], covered_artifacts=["semantic_risks.jsonl"], classification="exact_present",
                     repair_required=False, finding_level="info")
            r["check_id"] = compute_check_id(r)
            scope.append(r)
        write_jsonl(correction_dir / SCOPE_MANIFEST, scope)
        impact = dict(refs, source_artifact="semantic_risks.jsonl", source_row=1, finding_key=source_rows[0]["finding_key"],
                      **{field: [] for field in IMPACT_LIST_FIELDS}, post_repair_semantic_audit={
                          "status": "PASS", "repair_required_count": 0, "covered_original_scope": True,
                          "covered_impact_rows": True, "drift": {field: False for field in POST_REPAIR_DRIFT_FIELDS}})
        impact["impact_id"] = compute_impact_id(impact)
        write_jsonl(correction_dir / IMPACT_MATRIX, [impact])

        def correction_fixture() -> dict[str, Any]:
            return {"schema_id": AUDIT_CORRECTION_SCHEMA, "audit_id": correction_dir.name,
                    "decision_ref": "Plans/Decision_Log.md#DL-470", "date": "2026-11-08",
                    "bound_sha256": {name: sha256_file(correction_dir / name) for name in (
                        "audit_report.json", "repair_closure_matrix.jsonl", "semantic_risks.jsonl")},
                    "historical_status": {"from": "PASS_WITH_WARNINGS", "to": "BLOCKED", "reason": "One original repair."},
                    "non_actionable_rows": [{"source_artifact": "semantic_risks.jsonl", "source_row": 2,
                                             "reason": "Explicitly repair_required=false."}]}

        def run_correction(data: Any, sources: list[str] | None = None) -> dict[str, Any]:
            write_json(correction_path, data)
            return validate_audit_dir(correction_dir, require_matrix=True, require_effective_status=False,
                                      source_artifacts=sources, registry_path=correction_registry)

        before = validate_audit_dir(correction_dir, require_matrix=True, require_effective_status=False,
                                    source_artifacts=None, registry_path=correction_registry)
        check("correction_absent_keeps_status_and_overcoverage_errors", len(before["errors"]) == 2
              and has(before, "status must be BLOCKED") and has(before, "non-actionable source rows"), before["errors"])
        original_bytes = {name: (correction_dir / name).read_bytes() for name in correction_fixture()["bound_sha256"]}
        report = run_correction(correction_fixture())
        check("correction_valid_exposes_both_statuses_and_preserves_bytes", not report["errors"]
              and report["audit_correction"]["historical_status"] == "PASS_WITH_WARNINGS"
              and report["audit_correction"]["corrected_status"] == "BLOCKED"
              and report["original_repair_required_count"] == 1 and not report["missing_coverage"]
              and all((correction_dir / name).read_bytes() == raw for name, raw in original_bytes.items()), report["errors"])
        status_only = correction_fixture()
        status_only["non_actionable_rows"] = []
        report = run_correction(status_only)
        check("correction_status_only_keeps_unlisted_overcoverage", has(report, "non-actionable source rows")
              and not has(report, "status must be BLOCKED"), report["errors"])
        rows_only = correction_fixture()
        rows_only["historical_status"] = None
        report = run_correction(rows_only)
        check("correction_rows_only_keeps_wrong_status", has(report, "status must be BLOCKED")
              and not has(report, "non-actionable source rows"), report["errors"])
        for name, mutate, expected in (
            ("hash_mismatch", lambda d: d["bound_sha256"].update({"audit_report.json": "0" * 64}), "bound hash"),
            ("missing_binding", lambda d: d["bound_sha256"].pop("repair_closure_matrix.jsonl"), "bound_sha256"),
            ("unknown_binding", lambda d: d["bound_sha256"].update({"other.json": "0" * 64}), "bound_sha256"),
            ("unknown_schema", lambda d: d.update(schema_id="pm.audit_closure.audit_correction.v2"), "schema_id"),
            ("unknown_field", lambda d: d.update(repair_required_count=0), "fields must be exactly"),
            ("other_status", lambda d: d["historical_status"].update(to="PASS"), "may only change"),
            ("wrong_from_status", lambda d: d["historical_status"].update({"from": "PASS"}), "may only change"),
            ("nested_status_field", lambda d: d["historical_status"].update(repair_required_count=0), "historical_status must"),
            ("nested_row_field", lambda d: d["non_actionable_rows"][0].update(closure_status="repaired"), "fields must be exactly"),
            ("actionable_row", lambda d: d["non_actionable_rows"][0].update(source_row=1), "is actionable"),
            ("uncovered_row", lambda d: d["non_actionable_rows"][0].update(source_row=3), "not covered by the matrix"),
            ("empty_status_reason", lambda d: d["historical_status"].update(reason=" "), "reason must be non-empty"),
            ("empty_row_reason", lambda d: d["non_actionable_rows"][0].update(reason=""), "reason must be non-empty"),
            ("duplicate_row", lambda d: d["non_actionable_rows"].append(dict(d["non_actionable_rows"][0])), "duplicates source row"),
            ("boolean_row", lambda d: d["non_actionable_rows"][0].update(source_row=True), "must identify"),
            ("wrong_audit", lambda d: d.update(audit_id="other"), "audit_id"),
            ("bad_date", lambda d: d.update(date="2026-02-30"), "date must"),
            ("date_filename_mismatch", lambda d: d.update(date="2026-11-09"), "date must"),
            ("missing_decision", lambda d: d.update(decision_ref=""), "decision_ref"),
            ("empty_correction", lambda d: d.update(historical_status=None, non_actionable_rows=[]), "must correct"),
        ):
            data = correction_fixture()
            mutate(data)
            report = run_correction(data)
            check(f"correction_{name}_fails_atomically", has(report, expected) and "audit_correction" not in report
                  and has(report, "status must be BLOCKED") and has(report, "non-actionable source rows"), report["errors"])
        report = run_correction(correction_fixture(), [])
        check("correction_partial_source_selection_fails", has(report, "complete standard source-artifact selection"), report["errors"])
        run_correction(correction_fixture())
        duplicate = correction_dir / "audit_correction-20261109.json"
        duplicate.write_bytes(correction_path.read_bytes())
        report = validate_audit_dir(correction_dir, require_matrix=True, require_effective_status=False,
                                    source_artifacts=None, registry_path=correction_registry)
        check("correction_multiple_files_fail", has(report, "exactly one correction file") and "audit_correction" not in report, report["errors"])
        duplicate.unlink()
        correction_path.write_text(correction_path.read_text().replace('"schema_id":', '"schema_id": "duplicate", "schema_id":', 1))
        errors = []
        result = validate_audit_correction(correction_dir, {}, set(), set(), [], errors)
        check("correction_duplicate_json_field_fails", result is None and any("duplicate field" in e for e in errors), errors)
        correction_path.write_text("{")
        errors = []
        result = validate_audit_correction(correction_dir, {}, set(), set(), [], errors)
        check("correction_invalid_json_fails", result is None and bool(errors), errors)
        # Removing real coverage and rebinding the receipt cannot excuse the missing actionable row.
        write_jsonl(correction_dir / "repair_closure_matrix.jsonl", matrices[1:])
        report = run_correction(correction_fixture())
        check("correction_cannot_excuse_missing_coverage", has(report, "missing closure rows for 1 source rows")
              and report["missing_coverage"] == [{"source_artifact": "semantic_risks.jsonl", "source_row": "1"}], report["errors"])
        write_jsonl(correction_dir / "repair_closure_matrix.jsonl", matrices)
        # A source edit, matrix edit or symlink invalidates the binding before any exemption.
        data = correction_fixture()
        for filename in data["bound_sha256"]:
            target = correction_dir / filename
            raw = target.read_bytes()
            target.write_bytes(raw + b"\n")
            report = run_correction(data)
            check(f"correction_edited_{filename}_fails", has(report, f"bound hash for {filename}")
                  and "audit_correction" not in report, report["errors"])
            target.write_bytes(raw)
        data = correction_fixture()
        correction_path.unlink()
        duplicate.write_text(json.dumps(data))
        correction_path.symlink_to(duplicate)
        # Use a non-correction filename for the symlink target so cardinality is not the failure.
        target = correction_dir / "receipt.json"
        duplicate.rename(target)
        correction_path.unlink()
        correction_path.symlink_to(target)
        report = validate_audit_dir(correction_dir, require_matrix=True, require_effective_status=False,
                                    source_artifacts=None, registry_path=correction_registry)
        check("correction_symlink_file_fails", has(report, "symlink") and "audit_correction" not in report, report["errors"])
        correction_path.unlink()
        target.unlink()
        # Corrected history participates in the effective projection without losing the raw value.
        write_json(correction_dir / "post_repair_audit_report.json", {"status": "PASS_WITH_WARNINGS", "repair_required_count": 0})
        report = run_correction(correction_fixture())
        projection = build_effective_status_projection(correction_dir, report)
        check("correction_effective_projection_keeps_history", projection["effective_terminal_report"] == "post_repair_audit_report.json"
              and projection["effective_status"] == "PASS_WITH_WARNINGS" and projection["terminal_repair_state"] == "repair_validated"
              and projection["superseded_historical_reports"] == ["audit_report.json"]
              and projection["status_sources"]["audit_report_status"] == "PASS_WITH_WARNINGS"
              and projection["status_sources"]["corrected_audit_report_status"] == "BLOCKED", projection)
        # Both JSON result addresses used by audit-004 must be checked against real source rows.
        validator_source = dict(refs, results=[{"name": "passing", "status": "pass"}],
                                invalid_invocations=[{"name": "superseded", "status": "invalid_invocation"}])
        write_json(correction_dir / "validator_results.json", validator_source)
        all_sources = ["semantic_risks.jsonl", "validator_results.json"]
        json_keys = {("validator_results.json", "results.passing"), ("validator_results.json", "invalid_invocations.superseded")}
        all_covered = {("semantic_risks.jsonl", "1"), ("semantic_risks.jsonl", "2")} | json_keys
        all_actionable = {("semantic_risks.jsonl", "1")}

        def json_correction() -> dict[str, Any]:
            data = correction_fixture()
            data["bound_sha256"]["validator_results.json"] = sha256_file(correction_dir / "validator_results.json")
            data["non_actionable_rows"].extend({"source_artifact": a, "source_row": r, "reason": "Passed or superseded."}
                                                for a, r in sorted(json_keys))
            return data

        def evaluate_receipt(data: dict[str, Any], covered: set[tuple[str, str]] = all_covered) -> tuple[Any, list[str]]:
            write_json(correction_path, data)
            errors: list[str] = []
            classified = set(all_actionable)
            classified.update(("validator_results.json", r) for r in actionable_json_rows(
                correction_dir / "validator_results.json", "validator_results.json", errors))
            result = validate_audit_correction(correction_dir, optional_json_object(correction_dir / "audit_report.json"),
                                               classified, covered, all_sources, errors)
            return result, errors

        result, errors = evaluate_receipt(json_correction())
        check("correction_named_json_rows_pass", result is not None and not errors, errors)
        for name, update in (
            ("failed_result", {"results": [{"name": "passing", "status": "fail"}]}),
            ("explicit_result", {"results": [{"name": "passing", "status": "pass", "repair_required": True, "finding_level": "warning"}]}),
            ("duplicate_explicit_name", {"results": [{"name": "passing", "status": "pass"},
                                                     {"name": "passing", "repair_required": True, "finding_level": "warning"}]}),
            ("artifact_explicit", {"repair_required": True, "finding_level": "warning"}),
        ):
            write_json(correction_dir / "validator_results.json", dict(validator_source, **update))
            result, errors = evaluate_receipt(json_correction())
            check(f"correction_{name}_is_actionable", result is None and any("is actionable" in e for e in errors), errors)
        write_json(correction_dir / "validator_results.json", validator_source)
        for address in ("results.nonexistent", "warnings[0]"):
            data = json_correction()
            data["non_actionable_rows"][1]["source_row"] = address
            result, errors = evaluate_receipt(data, all_covered | {("validator_results.json", address)})
            check(f"correction_invalid_json_address_{address}_fails", result is None
                  and any("does not exist" in e or "unsupported source-row address" in e for e in errors), errors)
        data = json_correction()
        data["non_actionable_rows"][0]["source_row"] = 999
        result, errors = evaluate_receipt(data, all_covered | {("semantic_risks.jsonl", "999")})
        check("correction_fabricated_matrix_source_row_fails", result is None and any("does not exist" in e for e in errors), errors)
        data = json_correction()
        data["non_actionable_rows"][0]["source_row"] = "01"
        result, errors = evaluate_receipt(data, all_covered | {("semantic_risks.jsonl", "01")})
        check("correction_noncanonical_actionable_row_alias_fails", result is None
              and any("canonical positive line number" in e for e in errors), errors)
        # Hash-valid status correction is still invalid when the original source count is zero.
        data = json_correction()
        write_json(correction_path, data)
        errors = []
        result = validate_audit_correction(correction_dir, optional_json_object(correction_dir / "audit_report.json"),
                                           set(), all_covered, all_sources, errors)
        check("correction_without_original_repairs_fails", result is None and any("original repair_required_count > 0" in e for e in errors), errors)
        # Inferred actionability has the same force as an explicit field.
        inferred = {"classification": "missing_or_drift"}
        write_jsonl(correction_dir / "semantic_risks.jsonl", [inferred, inferred])
        data = json_correction()
        write_json(correction_path, data)
        errors = []
        inferred_keys = set(("semantic_risks.jsonl", r) for r in actionable_jsonl_rows(
            correction_dir / "semantic_risks.jsonl", "semantic_risks.jsonl", errors))
        result = validate_audit_correction(correction_dir, optional_json_object(correction_dir / "audit_report.json"),
                                           inferred_keys, all_covered, all_sources, errors)
        check("correction_inferred_actionable_row_fails", result is None and any("is actionable" in e for e in errors), errors)
        write_jsonl(correction_dir / "semantic_risks.jsonl", source_rows)
        # Binding via a symlink is refused even when the referenced bytes match.
        bound = correction_dir / "semantic_risks.jsonl"
        moved_bound = correction_dir / "moved-source.jsonl"
        moved_bound.write_bytes(bound.read_bytes())
        bound.unlink()
        bound.symlink_to(moved_bound)
        result, errors = evaluate_receipt(json_correction())
        check("correction_symlink_bound_source_fails", result is None and any("without symlinks" in e for e in errors), errors)
        bound.unlink()
        moved_bound.rename(bound)
    finally:
        ROOT = saved_root
        shutil.rmtree(tmp, ignore_errors=True)
    failed = [r for r in results if not r["pass"]]
    print(json.dumps({"schema_id": "pm.audit_closure.self_test.v1", "status": "fail" if failed else "pass",
                      "checks": len(results), "failed": failed, "results": results}, indent=2, ensure_ascii=False, default=str))
    return 1 if failed else 0


def main() -> int:
    parser = argparse.ArgumentParser()
    sub = parser.add_subparsers(dest="command")
    validate = sub.add_parser("validate", help="Validate semantic closure registry and optional audit closure matrix.")
    validate.add_argument("--registry", default=str(DEFAULT_REGISTRY), help="Path to _semantic_closure_registry.jsonl.")
    validate.add_argument("--audit-dir", action="append", default=[], help="Audit directory to validate.")
    validate.add_argument("--require-closure-matrix", action="store_true", help="Fail if an audit dir lacks repair_closure_matrix.jsonl.")
    validate.add_argument("--require-effective-status", action="store_true", help="Fail if an audit dir lacks effective_status.json.")
    validate.add_argument(
        "--source-artifact",
        action="append",
        default=None,
        help="Audit JSONL artifact that must be covered by repair_closure_matrix.jsonl. Repeatable.",
    )
    validate.set_defaults(func=cmd_validate)
    effective = sub.add_parser("effective-status", help="List or write per-audit effective terminal status projections.")
    effective.add_argument("--registry", default=str(DEFAULT_REGISTRY), help="Path to _semantic_closure_registry.jsonl.")
    effective.add_argument("--audit-dir", action="append", default=[], help="Audit directory to summarize.")
    effective.add_argument("--all", action="store_true", help="Summarize every directory under Plans/.audits.")
    effective.add_argument("--write", action="store_true", help="Write effective_status.json in each selected audit dir.")
    effective.add_argument(
        "--source-artifact",
        action="append",
        default=None,
        help="Audit JSONL artifact to use for closure validation. Repeatable.",
    )
    effective.set_defaults(func=cmd_effective_status)
    refresh = sub.add_parser("refresh-hashes", help="Report stale owner/closure evidence hashes (--dry-run only; writing is disabled by DL-039).")
    refresh.add_argument("--registry", default=str(DEFAULT_REGISTRY), help="Path to _semantic_closure_registry.jsonl.")
    refresh.add_argument("--dry-run", action="store_true", help="Report updates without writing.")
    refresh.set_defaults(func=cmd_refresh_hashes)
    anchor = sub.add_parser("anchor", help="Print the content and sha256 that anchor.v1 refs cover.")
    anchor.add_argument("ref", nargs="+", help="Anchored ref, such as Plans/Planning_Ledger_System.md#unit=PLS-012.")
    anchor.add_argument("--root", default=None, help="Repository root to read; defaults to this checkout.")
    anchor.add_argument("--hash-only", action="store_true", help="Omit the anchored text.")
    anchor.set_defaults(func=cmd_anchor)
    append = sub.add_parser("reaudit-append", help="Append one re-audit row per reviewed re-audit record (append-only migration).")
    append.add_argument("--registry", default=str(DEFAULT_REGISTRY), help="Path to _semantic_closure_registry.jsonl.")
    append.add_argument("--records", required=True, help="Re-audit records JSONL under Plans/.audits/.")
    append.add_argument("--only", default="", help="Comma-separated closure_ids to append; default all.")
    append.add_argument("--dry-run", action="store_true", help="Report without writing.")
    append.set_defaults(func=cmd_reaudit_append)
    chain = sub.add_parser("chain", help="Show every registry row of one finding and what supersedes what.")
    chain.add_argument("closure", help="closure_id, finding_key or registry line number.")
    chain.add_argument("--registry", default=str(DEFAULT_REGISTRY), help="Path to _semantic_closure_registry.jsonl.")
    chain.set_defaults(func=cmd_chain)
    selftest = sub.add_parser("self-test", help="Fail-closed checks of anchor.v1 hashing and re-audit supersession.")
    selftest.set_defaults(func=cmd_self_test)

    if len(sys.argv) == 1:
        args = parser.parse_args(["validate"])
    else:
        args = parser.parse_args()
    if not hasattr(args, "func"):
        parser.print_help()
        return 2
    return int(args.func(args))


if __name__ == "__main__":
    raise SystemExit(main())
