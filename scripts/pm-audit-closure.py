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
    for line_no, line in enumerate(path.read_text(encoding="utf-8").splitlines(), 1):
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
#   pydef=<qualname>          a Python function, class or NAME = ... assignment source segment
#
# A ref with no anchor still hashes the whole file. Legacy rows keep whole-file
# semantics for every ref, including refs that contain '#', so their history
# reads exactly as it was written.
# ---------------------------------------------------------------------------
ANCHOR_SCOPE = "anchor.v1"
ANCHOR_KINDS = ("unit", "section", "json", "jsonl", "pydef")
ANCHOR_REF_RE = re.compile(r"^(?P<path>[^#\s]+)#(?P<kind>unit|section|json|jsonl|pydef)=(?P<value>.+)$")
LEGACY_LINE_REF_RE = re.compile(r":\d+(?:-\d+)?$")
PLAN_UNIT_FENCE_RE = re.compile(r"```yaml\n(.*?)\n```", re.DOTALL)
PLAN_UNIT_ID_RE = re.compile(r"plan_unit_id:\s*['\"]?([A-Za-z0-9][A-Za-z0-9_.-]*)")
MD_HEADING_RE = re.compile(r"^(#{1,6})\s*(.*?)\s*$")


class AnchorError(ValueError):
    """An anchored ref is malformed, or its anchor does not resolve to exactly one target."""


def canonical_json(value: Any) -> str:
    return json.dumps(value, sort_keys=True, separators=(",", ":"), ensure_ascii=False, default=str)


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


def _normalized_text(path: Path) -> str:
    text = path.read_bytes().decode("utf-8")
    if "\r" in text:
        text = text.replace("\r\n", "\n").replace("\r", "\n")
    return text


def markdown_headings(lines: list[str]) -> list[dict[str, Any]]:
    """Headings outside fenced code, as pm-plan-index.py reads them."""
    headings: list[dict[str, Any]] = []
    fence: str | None = None
    for index, line in enumerate(lines):
        stripped = line.lstrip()
        if stripped.startswith("```") or stripped.startswith("~~~"):
            marker = stripped[:3]
            fence = None if fence == marker else marker
            continue
        if fence:
            continue
        match = MD_HEADING_RE.match(line)
        if match:
            headings.append({"index": index, "level": len(match.group(1)), "title": match.group(2).strip()})
    return headings


def _section_end(headings: list[dict[str, Any]], position: int, line_count: int) -> int:
    level = headings[position]["level"]
    for later in headings[position + 1:]:
        if later["level"] <= level:
            return later["index"]
    return line_count


def _yaml_module() -> Any:
    import yaml  # noqa: PLC0415 - only anchor.v1 unit anchors need PyYAML.

    return yaml


class AnchorResolver:
    """Resolves anchored refs against one repository root, caching each parsed file."""

    def __init__(self, root: Path | None = None) -> None:
        self.root = root or ROOT
        self._text: dict[str, str] = {}
        self._units: dict[str, dict[str, list[Any]]] = {}
        self._json: dict[str, Any] = {}
        self._jsonl: dict[str, list[dict[str, Any]]] = {}

    def path(self, rel_path: str) -> Path:
        path = self.root / rel_path
        if not path.is_file():
            raise AnchorError(f"anchored file is missing: {rel_path}")
        return path

    def text(self, rel_path: str) -> str:
        if rel_path not in self._text:
            self._text[rel_path] = _normalized_text(self.path(rel_path))
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
                    data = yaml.load(block, Loader=yaml.SafeLoader)
                except Exception as exc:  # noqa: BLE001 - reported as an anchor failure.
                    id_match = PLAN_UNIT_ID_RE.search(block)
                    if id_match:
                        found.setdefault(id_match.group(1), []).append(
                            AnchorError(f"PlanUnit {id_match.group(1)} in {rel_path} is not valid YAML: {exc}")
                        )
                    continue
                if isinstance(data, dict) and data.get("plan_unit_id"):
                    found.setdefault(str(data["plan_unit_id"]), []).append(data)
            self._units[rel_path] = found
        return self._units[rel_path]

    def json_doc(self, rel_path: str) -> Any:
        if rel_path not in self._json:
            try:
                self._json[rel_path] = json.loads(self.text(rel_path))
            except json.JSONDecodeError as exc:
                raise AnchorError(f"{rel_path} is not valid JSON: {exc}") from exc
        return self._json[rel_path]

    def jsonl_rows(self, rel_path: str) -> list[dict[str, Any]]:
        if rel_path not in self._jsonl:
            rows: list[dict[str, Any]] = []
            for line_no, line in enumerate(self.text(rel_path).splitlines(), 1):
                if not line.strip():
                    continue
                try:
                    row = json.loads(line)
                except json.JSONDecodeError as exc:
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
            data = self.path(rel_path).read_bytes()
            try:
                text = data.decode("utf-8")
            except UnicodeDecodeError:
                text = ""
            return text, text
        assert value is not None
        if kind == "unit":
            matches = self.units(rel_path).get(value, [])
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
        if kind == "pydef":
            segment = _python_segment(self.text(rel_path), value, ref)
            return segment, segment
        raise AnchorError(f"{ref}: unknown anchor kind {kind}")  # pragma: no cover - regex limits kinds

    def _section(self, ref: str, rel_path: str, value: str) -> tuple[str, str]:
        lines = self.text(rel_path).splitlines()
        headings = markdown_headings(lines)
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
        block = [line.rstrip() for line in lines[lower:upper]]
        while block and not block[-1]:
            block.pop()
        content = "\n".join(block)
        return content, content

    def sha256(self, ref: str) -> str:
        rel_path, kind, _ = parse_anchor_ref(ref)
        if kind is None:
            return sha256_file(self.path(rel_path))
        return sha256_text(self.content(ref)[0])


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
    if not pointer.startswith("/"):
        raise AnchorError(f"{ref}: a JSON pointer starts with '/'")
    node = doc
    for raw in pointer[1:].split("/"):
        token = raw.replace("~1", "/").replace("~0", "~")
        if isinstance(node, dict) and token in node:
            node = node[token]
        elif isinstance(node, list) and token.isdigit() and int(token) < len(node):
            node = node[int(token)]
        else:
            raise AnchorError(f"{ref}: JSON pointer segment {token!r} does not resolve")
    return node


def _python_segment(source: str, qualname: str, ref: str) -> str:
    import ast  # noqa: PLC0415 - only pydef anchors need ast.

    try:
        tree = ast.parse(source)
    except SyntaxError as exc:
        raise AnchorError(f"{ref}: source does not parse: {exc}") from exc
    scope: list[ast.AST] = list(tree.body)
    node: ast.AST | None = None
    for part in qualname.split("."):
        hits = [
            item for item in scope
            if (isinstance(item, (ast.FunctionDef, ast.AsyncFunctionDef, ast.ClassDef)) and item.name == part)
            or (isinstance(item, ast.Assign) and [getattr(t, "id", None) for t in item.targets] == [part])
            or (isinstance(item, ast.AnnAssign) and getattr(item.target, "id", None) == part)
        ]
        if len(hits) != 1:
            raise AnchorError(f"{ref}: {part!r} is defined {len(hits)} times at that level; expected exactly 1")
        node = hits[0]
        scope = list(getattr(node, "body", []))
    assert node is not None
    lines = source.splitlines()
    start = min([node.lineno] + [d.lineno for d in getattr(node, "decorator_list", [])]) - 1
    end = getattr(node, "end_lineno", None) or len(lines)
    return "\n".join(line.rstrip() for line in lines[start:end])


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
    """Why `ref` may not be used as an anchor.v1 evidence ref, or None when it may."""
    try:
        path, kind, _ = parse_anchor_ref(ref)
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


def raw_registry_lines(registry_path: Path) -> dict[int, str]:
    if not registry_path.exists():
        return {}
    return {n: line for n, line in enumerate(registry_path.read_text(encoding="utf-8").splitlines(), 1)}


def reaudit_record_sha256(record: dict[str, Any]) -> str:
    return sha256_text(canonical_json(record))


def load_reaudit_records(path: Path, errors: list[str], cache: dict[str, dict[str, Any]]) -> dict[str, Any] | None:
    key = str(path)
    if key not in cache:
        records: dict[str, Any] = {}
        if not path.is_file():
            cache[key] = {"missing": True, "records": records}
        else:
            for line_no, line in enumerate(path.read_text(encoding="utf-8").splitlines(), 1):
                if not line.strip():
                    continue
                try:
                    record = json.loads(line)
                except json.JSONDecodeError as exc:
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


def validate_reaudit_row(
    row: dict[str, Any],
    label: str,
    rows_by_line: dict[int, dict[str, Any]],
    raw_lines: dict[int, str],
    resolver: AnchorResolver,
    record_cache: dict[str, dict[str, Any]],
    errors: list[str],
) -> int | None:
    """Check one re-audit row. Return the line it validly supersedes, or None."""
    before = len(errors)
    supersedes = row.get("supersedes")
    reaudit = row.get("reaudit")
    if not isinstance(supersedes, dict) or not isinstance(reaudit, dict):
        errors.append(f"{label}: a row that supersedes another needs both supersedes and reaudit objects")
        return None
    line = supersedes.get("line")
    target = rows_by_line.get(line) if isinstance(line, int) else None
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
    if not isinstance(record_ref, str) or not record_ref.startswith("Plans/.audits/"):
        errors.append(f"{label}: reaudit.record must be a path under Plans/.audits/")
    else:
        records = load_reaudit_records(ROOT / record_ref, errors, record_cache)
        if records is None:
            errors.append(f"{label}: re-audit record file {record_ref} is missing")
        else:
            record = records.get(str(supersedes.get("closure_id")))
            if record is None:
                errors.append(f"{label}: {record_ref} has no record for {supersedes.get('closure_id')}")
    if record is not None:
        if reaudit_record_sha256(record) != reaudit.get("record_sha256"):
            errors.append(f"{label}: reaudit.record_sha256 does not match the canonical record")
        if record.get("schema_id") != REAUDIT_RECORD_SCHEMA or record.get("reaudit_id") != reaudit_id:
            errors.append(f"{label}: record schema_id or reaudit_id does not match")
        if record.get("row_sha256") != supersedes.get("row_sha256"):
            errors.append(f"{label}: record.row_sha256 does not match supersedes.row_sha256")
        verdict = record.get("verdict")
        if verdict not in REAUDIT_VERDICTS or reaudit.get("outcome") != verdict:
            errors.append(f"{label}: record verdict {verdict!r} must be a known verdict equal to reaudit.outcome")
        reviews = record.get("reviews") if isinstance(record.get("reviews"), dict) else {}
        for who in REAUDIT_REVIEWERS:
            review = reviews.get(who)
            if not isinstance(review, dict) or review.get("verdict") != verdict:
                errors.append(f"{label}: record.reviews.{who}.verdict must equal the record verdict {verdict!r}")
            elif not str(review.get("model", "")).strip() or not str(review.get("evidence_sha256", "")).strip():
                errors.append(f"{label}: record.reviews.{who} must name its model and evidence_sha256")
        status = row.get("closure_status")
        old_status = target.get("closure_status")
        if verdict == "supported" and status != old_status:
            errors.append(f"{label}: a supported re-audit keeps closure_status {old_status}")
        elif verdict == "resolved_differently":
            if status != record.get("status_now") or status in OPEN_STATUSES or status == old_status:
                errors.append(f"{label}: resolved_differently sets closure_status to record.status_now, a different closed status")
        elif verdict == "superseded_by_later_closure":
            later = str(record.get("later_closure_id", ""))
            later_rows = [r for n, r in rows_by_line.items() if r.get("closure_id") == later and n > line]
            if status != old_status or not later_rows or later_rows[0].get("finding_key") != row.get("finding_key"):
                errors.append(f"{label}: superseded_by_later_closure keeps the status and names a later row of the same finding")
        elif verdict == "not_supported" and status != "reopened":
            errors.append(f"{label}: a not_supported re-audit appends a reopened row")
        anchored = {}
        for group in ("owner_evidence_hashes", "closure_evidence_hashes"):
            if isinstance(hashes.get(group), dict):
                anchored.update(hashes[group])
        deps = record.get("dependencies") if isinstance(record.get("dependencies"), list) else []
        if not deps or sorted(set(deps)) != sorted(anchored):
            errors.append(f"{label}: the row's anchored hashes must be exactly the record's dependencies")
        quotes = 0
        for item in record.get("evidence") or []:
            ref = item.get("ref") if isinstance(item, dict) else None
            if ref not in anchored:
                errors.append(f"{label}: evidence ref {ref!r} is not one of the row's anchored hashes")
                continue
            try:
                if resolver.sha256(ref) != anchored[ref]:
                    continue  # the anchor moved; its staleness is reported by the hash check
                view = quote_view(resolver.content(ref)[1])
            except AnchorError:
                continue
            if "quote" in item:
                quote = quote_view(str(item["quote"]))
                if len(quote) < REAUDIT_MIN_QUOTE or quote not in view:
                    errors.append(f"{label}: evidence quote is not in {ref}: {str(item['quote'])[:80]!r}")
                else:
                    quotes += 1
            elif "absent" in item:
                absent = quote_view(str(item["absent"]))
                if not absent or absent in view:
                    errors.append(f"{label}: phrase recorded as absent is present in {ref}")
        if verdict in REAUDIT_VERDICTS - {"not_supported"} and quotes == 0:
            errors.append(f"{label}: a {verdict} re-audit needs at least one verbatim quote from its anchors")
    return line if len(errors) == before else None


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

    for row in rows:
        label = f"{rel(registry_path)}:{row.get('_line_no')}"
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

        if "supersedes" in row or "reaudit" in row:
            reaudit_rows += 1
            target = validate_reaudit_row(row, label, rows_by_line, raw_lines, resolver, record_cache, errors)
            if target is not None:
                if target in superseded_by:
                    errors.append(
                        f"{label}: line {target} is already superseded by line {superseded_by[target]}; "
                        "supersede the latest re-audit row instead"
                    )
                else:
                    superseded_by[target] = row["_line_no"]

        finding_key = str(row.get("finding_key", ""))
        if status == "reopened":
            validate_reopened_proof(row, closed_by_key.get(finding_key, []), label, errors)
        elif status in ALLOWED_STATUSES and status not in OPEN_STATUSES:
            closed_by_key.setdefault(finding_key, []).append(row)

    superseded_stale = 0
    for line_no, stale in sorted(stale_by_line.items()):
        if line_no in superseded_by:
            superseded_stale += len(stale)
        else:
            errors.extend(stale)

    # A finding is open while a row with an open status is not superseded by a re-audit row.
    open_rows: list[dict[str, Any]] = []
    open_by_key: dict[str, list[str]] = {}
    for row in rows:
        if row.get("closure_status") in OPEN_STATUSES and row["_line_no"] not in superseded_by:
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
    for line_no, line in enumerate(path.read_text(encoding="utf-8").splitlines(), 1):
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


def validate_ref_fields(
    row: dict[str, Any],
    expected: dict[str, str],
    path_label: str,
    errors: list[str],
    *,
    require: bool,
    allow_row_scoped_refs: bool = False,
) -> None:
    for field, expected_value in expected.items():
        value = row.get(field)
        if value is None:
            if require:
                errors.append(f"{path_label}: missing required ref field {field}")
            continue
        if not isinstance(value, str) or not value.strip():
            errors.append(f"{path_label}: {field} must be a non-empty string")
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
            errors.append(f"{label}: {field} must be a non-empty string")
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
) -> None:
    if not is_finding_row(row, artifact):
        return
    row = normalized_audit_finding_row(row)
    missing = sorted(AUDIT_SOURCE_FINDING_REQUIRED_FIELDS - set(row))
    if missing:
        errors.append(f"{path_label}: audit finding missing required fields {missing}")
    validate_ref_fields(row, refs, path_label, errors, require=False, allow_row_scoped_refs=True)
    for field in AUDIT_SOURCE_FINDING_LIST_FIELDS:
        if field in row and not isinstance(row.get(field), list):
            errors.append(f"{path_label}: {field} must be a list")
    explicit_repair_required(row, path_label, errors)
    audit_id = refs.get("audit_id", "")
    finding_key = row.get("finding_key")
    if isinstance(finding_key, str):
        if not finding_key.startswith("sfk-"):
            errors.append(f"{path_label}: finding_key must use deterministic sfk-* form, got {finding_key!r}")
        if audit_id and (finding_key.startswith(audit_id) or f"{audit_id}::" in finding_key or "::" in finding_key):
            errors.append(f"{path_label}: finding_key must not contain audit-specific identity {finding_key!r}")
        if row.get("schema_id") != "pm.semantic_risk.v1":
            expected_key = compute_finding_key(row)
            if finding_key != expected_key:
                errors.append(f"{path_label}: finding_key {finding_key} does not match deterministic {expected_key}")


def validate_source_jsonl_artifact(path: Path, artifact: str, refs: dict[str, str], errors: list[str]) -> int:
    if not path.exists():
        return 0
    finding_count = 0
    for row in read_jsonl(path, errors, required=True):
        label = f"{rel(path)}:{row.get('_line_no')}"
        validate_ref_fields(row, refs, label, errors, require=False, allow_row_scoped_refs=True)
        if is_finding_row(row, artifact):
            finding_count += 1
            validate_source_finding_row(row, artifact, label, refs, errors)
    return finding_count


def validate_source_json_artifact(path: Path, artifact: str, refs: dict[str, str], errors: list[str]) -> int:
    data = load_json_object(path, errors, required=False)
    if data is None:
        return 0
    validate_ref_fields(data, refs, rel(path), errors, require=True, allow_row_scoped_refs=True)
    finding_count = 0
    for field in ("warnings", "findings", "semantic_risks"):
        values = data.get(field)
        if not isinstance(values, list):
            continue
        for index, item in enumerate(values):
            if not isinstance(item, dict):
                continue
            label = f"{rel(path)}:{field}[{index}]"
            validate_ref_fields(item, refs, label, errors, require=False, allow_row_scoped_refs=True)
            if is_finding_row(item, artifact):
                finding_count += 1
                validate_source_finding_row(item, artifact, label, refs, errors)
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
        errors.append(f"{rel(path)}: missing required check_family coverage {missing_families}")
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
            errors.append(f"missing required {rel(path)}")
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
    label = rel(audit_dir / "audit_report.json")
    reported_count = audit_report.get("repair_required_count")
    if reported_count != repair_required_count:
        errors.append(
            f"{label}: repair_required_count {reported_count!r} does not match computed {repair_required_count}"
        )
    status = str(audit_report.get("status", "")).upper()
    if repair_required_count > 0 and status != "BLOCKED":
        errors.append(f"{label}: status must be BLOCKED when repair_required_count is {repair_required_count}")
    if repair_required_count == 0 and status == "BLOCKED":
        errors.append(f"{label}: status must not be BLOCKED when repair_required_count is 0")
    if repair_required_count == 0 and finding_count > 0 and status == "PASS":
        errors.append(f"{label}: status should be PASS_WITH_WARNINGS when non-actionable findings exist")


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
    audit_status = str(audit_report.get("status") or "").upper()
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


def legacy_actionable_jsonl_row(row: dict[str, Any], artifact: str) -> bool:
    """Compatibility inference for pre-repair_required audit artifacts."""
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
    if claim_status and claim_status != "source_lineage_supported":
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


def actionable_jsonl_rows(path: Path, artifact: str, errors: list[str]) -> list[str]:
    rows: list[str] = []
    if not path.exists():
        errors.append(f"missing source artifact {rel(path)}")
        return rows
    for line_no, line in enumerate(path.read_text(encoding="utf-8").splitlines(), 1):
        if not line.strip():
            continue
        try:
            row = json.loads(line)
        except json.JSONDecodeError as exc:
            errors.append(f"{rel(path)}:{line_no}: invalid JSONL: {exc}")
            continue
        explicit = explicit_repair_required(row, f"{rel(path)}:{line_no}", errors)
        if explicit is True:
            rows.append(str(line_no))
            continue
        if explicit is False:
            continue
        if legacy_actionable_jsonl_row(row, artifact):
            rows.append(str(line_no))
    return rows


def actionable_warning_rows(data: dict[str, Any], artifact: str, errors: list[str]) -> list[str]:
    rows: list[str] = []
    for field in ("warnings", "findings", "semantic_risks"):
        values = data.get(field)
        if not isinstance(values, list):
            continue
        for index, item in enumerate(values):
            if not isinstance(item, dict):
                continue
            explicit = explicit_repair_required(item, f"{artifact}:{field}[{index}]", errors)
            if explicit is True:
                rows.append(f"{field}[{index}]")
            elif explicit is None and legacy_actionable_jsonl_row(item, artifact):
                rows.append(f"{field}[{index}]")
    return rows


def actionable_json_rows(path: Path, artifact: str, errors: list[str]) -> list[str]:
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
        explicit = explicit_repair_required(data, rel(path), errors)
        if explicit is True:
            rows.append("$")
        elif explicit is False:
            return rows

    if artifact == "ledger_consistency.json":
        rows.extend(actionable_warning_rows(data, artifact, errors))
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
            explicit = explicit_repair_required(result, f"{rel(path)}:results.{name}", errors)
            if explicit is True:
                rows.append(f"results.{name}")
                continue
            if explicit is False:
                continue
            status = result.get("status")
            passed = status == "pass" or (status is None and result.get("exit_code") == 0)
            side_effect_count = result.get("side_effect_count", 0)
            if not passed or (isinstance(side_effect_count, int) and side_effect_count > 0):
                rows.append(f"results.{name}")
    return rows


def actionable_artifact_rows(path: Path, artifact: str, errors: list[str]) -> list[str]:
    if artifact.endswith(".jsonl"):
        return actionable_jsonl_rows(path, artifact, errors)
    if artifact.endswith(".json"):
        return actionable_json_rows(path, artifact, errors)
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


def validate_audit_dir(
    audit_dir: Path,
    *,
    require_matrix: bool,
    require_effective_status: bool,
    source_artifacts: list[str] | None,
    registry_path: Path,
) -> dict[str, Any]:
    errors: list[str] = []
    warnings: list[str] = []
    audit_dir = audit_dir if audit_dir.is_absolute() else ROOT / audit_dir
    matrix_path = audit_dir / "repair_closure_matrix.jsonl"
    if not audit_dir.exists():
        return {"path": rel(audit_dir), "errors": [f"missing audit dir {rel(audit_dir)}"], "warnings": warnings}

    audit_report, audit_refs = load_audit_report(audit_dir, errors)

    requested_artifacts = source_artifacts
    if requested_artifacts is None:
        requested_artifacts = [name for name in DEFAULT_AUDIT_SOURCE_ARTIFACTS if (audit_dir / name).exists()]

    source_report = validate_source_artifacts(audit_dir, requested_artifacts, audit_refs, errors)
    scope_report = validate_scope_manifest(audit_dir, audit_refs, errors)

    actionable_rows: set[tuple[str, str]] = set()
    for artifact in requested_artifacts:
        for source_row in actionable_artifact_rows(audit_dir / artifact, artifact, errors):
            actionable_rows.add((artifact, str(source_row)))

    impact_report = validate_repair_impact_matrix(audit_dir, audit_refs, actionable_rows, errors)
    validate_audit_report_status(
        audit_report,
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
        return report

    rows = read_jsonl(matrix_path, errors, required=True)
    registry_by_id = registry_lookup(registry_path, errors)
    covered: set[tuple[str, str]] = set()
    status_counts: dict[str, int] = {}
    open_matrix_rows: list[dict[str, Any]] = []

    for row in rows:
        label = f"{rel(matrix_path)}:{row.get('_line_no')}"
        missing = sorted(MATRIX_REQUIRED_FIELDS - set(row))
        if missing:
            errors.append(f"{label}: missing required fields {missing}")
        validate_ref_fields(row, audit_refs, label, errors, require=True, allow_row_scoped_refs=True)
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
            errors.append(f"{label}: finding_key must be non-empty")
        elif finding_key != compute_finding_key(row):
            errors.append(f"{label}: finding_key {finding_key} does not match deterministic {compute_finding_key(row)}")
        for field in ("source_atom_ids", "plan_unit_ids", "owner_docs", "detail_keys", "exact_tokens"):
            if not isinstance(row.get(field), list):
                errors.append(f"{label}: {field} must be a list")
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

    extra_coverage = sorted(covered - actionable_rows)
    if extra_coverage:
        errors.append(f"{rel(matrix_path)}: closure rows present for {len(extra_coverage)} non-actionable source rows")

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
    return report


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

    if missing_refs:
        print(json.dumps({
            "schema_id": "pm.audit_closure.refresh_hashes_report.v1",
            "status": "fail",
            "path": rel(registry_path),
            "missing_refs": missing_refs,
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
    for ref in record["dependencies"]:
        path, _, _ = parse_anchor_ref(ref)
        (owner_hashes if path in owner_docs else closure_hashes)[ref] = resolver.sha256(ref)
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


def cmd_reaudit_append(args: argparse.Namespace) -> int:
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
    appended_hashes = {
        str((row.get("reaudit") or {}).get("record_sha256"))
        for row in rows if isinstance(row.get("reaudit"), dict)
    }
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
        if reaudit_record_sha256(record) in appended_hashes:
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
        "appended": len(new_rows) if not errors else 0,
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
    """Fail-closed checks of anchor.v1 hashing and append-only re-audit supersession."""
    import shutil  # noqa: PLC0415
    import tempfile  # noqa: PLC0415

    global ROOT  # noqa: PLW0603 - the fixtures live in a temporary repository root.
    saved_root = ROOT
    results: list[dict[str, Any]] = []
    tmp = Path(tempfile.mkdtemp(prefix="pm-audit-closure-selftest-"))
    try:
        ROOT = tmp
        (tmp / "Plans/.audits/reaudit-fixture").mkdir(parents=True)
        (tmp / "scripts").mkdir()
        doc = tmp / "Plans/Fixture.md"
        registry = tmp / "Plans/.audits/_semantic_closure_registry.jsonl"
        records_path = tmp / "Plans/.audits/reaudit-fixture/reaudit_records.jsonl"
        (tmp / "Plans/fixture.json").write_text(json.dumps({"a": {"b/c": [1, {"d": "deep value"}]}}), encoding="utf-8")
        (tmp / "Plans/fixture.jsonl").write_text('{"id": "r1", "v": "row one"}\n{"id": "r2", "v": "row two"}\n', encoding="utf-8")
        (tmp / "scripts/fixture.py").write_text("CONST = ('fixture constant',)\n\nclass K:\n    def m(self):\n        return 1\n\ndef f():\n    return 2\n", encoding="utf-8")
        unit_ref = "Plans/Fixture.md#unit=FIX-001"

        def check(name: str, condition: bool, detail: Any = None) -> None:
            results.append({"check": name, "pass": bool(condition), **({"detail": detail} if not condition else {})})

        def write_doc(text: str = SELF_TEST_DOC) -> None:
            doc.write_text(text, encoding="utf-8")

        def legacy_row() -> dict[str, Any]:
            return _self_test_registry_row(hashes={
                "owner_evidence_hashes": {"Plans/Fixture.md": "0" * 64},
                "closure_evidence_hashes": {"Plans/Fixture.md": "0" * 64},
            })

        def record(verdict: str = "supported", **overrides: Any) -> dict[str, Any]:
            rec: dict[str, Any] = {
                "schema_id": REAUDIT_RECORD_SCHEMA,
                "reaudit_id": "reaudit-fixture",
                "closure_id": "closure-fixture-001",
                "line": 1,
                "row_sha256": "",
                "recheck_commit": "0" * 40,
                "verdict": verdict,
                "claim": "The fixture repair is present in FIX-001.",
                "dependencies": [unit_ref],
                "evidence": [{"ref": unit_ref, "quote": "The fixture repair is present and must stay present."}],
                "rationale": "FIX-001 canonical_text states the repair.",
                "reviews": {who: {"model": "fixture", "verdict": verdict, "evidence_sha256": "f" * 64} for who in REAUDIT_REVIEWERS},
            }
            rec.update(overrides)
            return rec

        def write_registry(rows: list[dict[str, Any]]) -> list[str]:
            lines = [json.dumps(row, sort_keys=True) for row in rows]
            registry.write_text("\n".join(lines) + "\n", encoding="utf-8")
            return lines

        def append_with(rec: dict[str, Any], *, rows_before: list[dict[str, Any]] | None = None) -> dict[str, Any]:
            rows_before = rows_before or [legacy_row()]
            lines = write_registry(rows_before)
            rec = dict(rec)
            rec["row_sha256"] = sha256_text(lines[rec["line"] - 1])
            resolver = AnchorResolver(tmp)
            rec["dependency_hashes_at_recheck"] = {ref: resolver.sha256(ref) for ref in rec["dependencies"]}
            records_path.write_text(json.dumps(rec, sort_keys=True) + "\n", encoding="utf-8")
            target = rows_before[rec["line"] - 1]
            new = build_reaudit_row(target, rec["line"], lines[rec["line"] - 1], rec,
                                    rel(records_path), resolver, "2026-11-04T00:00:00Z")
            return new

        def validate_rows(rows: list[dict[str, Any]]) -> dict[str, Any]:
            write_registry(rows)
            return validate_registry(registry)

        def has(report: dict[str, Any], text: str) -> bool:
            return any(text in error for error in report["errors"])

        write_doc()
        resolver = AnchorResolver(tmp)
        # Anchor resolution.
        check("unit_anchor_resolves_block_style", "fixture repair is present" in resolver.content(unit_ref)[1])
        check("unit_anchor_resolves_flow_style", "unrelated unit" in resolver.content("Plans/Fixture.md#unit=FIX-002")[1])
        check("section_path_anchor_resolves", "Beta prose" in resolver.content("Plans/Fixture.md#section=Fixture Doc > Beta Section")[1])
        for name, ref in (
            ("ambiguous_section_title_fails", "Plans/Fixture.md#section=Alpha Section"),
            ("missing_unit_fails", "Plans/Fixture.md#unit=FIX-404"),
            ("bad_json_pointer_fails", "Plans/fixture.json#json=/a/nope"),
            ("ambiguous_jsonl_fails", "Plans/fixture.jsonl#jsonl=missing=x"),
            ("ambiguous_pydef_fails", "scripts/fixture.py#pydef=g"),
            ("line_number_ref_fails", "Plans/Fixture.md:12"),
            ("unknown_fragment_fails", "Plans/Fixture.md#FIX-001"),
        ):
            try:
                resolver.content(ref)
                check(name, False, ref)
            except AnchorError:
                check(name, True)
        check("json_pointer_escapes_resolve", "deep value" in resolver.content("Plans/fixture.json#json=/a/b~1c/1")[1])
        check("jsonl_anchor_resolves", "row two" in resolver.content("Plans/fixture.jsonl#jsonl=id=r2")[1])
        check("pydef_method_resolves", "return 1" in resolver.content("scripts/fixture.py#pydef=K.m")[1])
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
        write_doc()

        # Legacy rows keep whole-file semantics, including refs with '#'.
        report = validate_rows([legacy_row()])
        check("legacy_stale_row_is_error", has(report, "owner_evidence_hashes for Plans/Fixture.md is stale"), report["errors"])
        hashed = sha256_file(doc)
        legacy_hash_ref = _self_test_registry_row(hashes={"owner_evidence_hashes": {"Plans/Fixture.md#unit=FIX-001": hashed}})
        check("legacy_row_hashes_whole_file_even_with_anchor_syntax", not validate_rows([legacy_hash_ref])["errors"])

        # A valid re-audit supersedes the stale row.
        rec = record()
        new = append_with(rec)
        report = validate_rows([legacy_row(), new])
        check("valid_reaudit_supersedes_stale_row", not report["errors"] and report["superseded_row_count"] == 1, report["errors"])
        check("superseded_staleness_is_counted", report["superseded_stale_hash_count"] == 2, report)

        # Edits outside the anchor leave the re-audit row current; edits inside make it stale.
        write_doc(SELF_TEST_DOC.replace("unrelated unit that other edits change", "unrelated unit, edited"))
        check("reaudit_row_survives_unrelated_edit", not validate_registry(registry)["errors"])
        write_doc(SELF_TEST_DOC.replace("must stay present", "may be removed"))
        report = validate_registry(registry)
        check("reaudit_row_goes_stale_on_anchor_edit", has(report, f"for {unit_ref} is stale"), report["errors"])
        write_doc()

        # Tampering fails closed.
        tampered = legacy_row()
        tampered["closure_reason"] = "Edited after the re-audit."
        report = validate_rows([tampered, new])
        check("edited_superseded_row_breaks_link", has(report, "row_sha256 does not match") and has(report, "is stale"), report["errors"])
        bad = json.loads(json.dumps(new))
        bad["reaudit"]["record_sha256"] = "0" * 64
        report = validate_rows([legacy_row(), bad])
        check("record_hash_mismatch_fails", has(report, "record_sha256 does not match") and has(report, "is stale"), report["errors"])
        for name, overrides, text in (
            ("reviewer_disagreement_fails", {"reviews": {**record()["reviews"], "astra": {"model": "x", "verdict": "not_supported", "evidence_sha256": "f" * 64}}}, "reviews.astra.verdict"),
            ("missing_reviewer_fails", {"reviews": {k: v for k, v in record()["reviews"].items() if k != "sol"}}, "reviews.sol"),
            ("quote_not_in_anchor_fails", {"evidence": [{"ref": unit_ref, "quote": "text that appears nowhere in the unit"}]}, "evidence quote is not in"),
            ("supported_without_quote_fails", {"evidence": [{"ref": unit_ref, "absent": "text that appears nowhere"}]}, "needs at least one verbatim quote"),
            ("absent_phrase_present_fails", {"evidence": [{"ref": unit_ref, "quote": "The fixture repair is present and must stay present."}, {"ref": unit_ref, "absent": "must stay present"}]}, "absent is present"),
        ):
            row = append_with(record(**overrides))
            report = validate_rows([legacy_row(), row])
            check(name, has(report, text) and has(report, "is stale"), report["errors"])
        for name, dep, text in (
            ("whole_file_anchor_outside_audits_fails", "Plans/Fixture.md", "hashes a whole file"),
            ("derived_anchor_fails", "Plans/.plan_index/plan_units.jsonl#jsonl=plan_unit_id=FIX-001", "derived artifact"),
        ):
            row = append_with(record())
            row["hashes"]["owner_evidence_hashes"] = {dep: "0" * 64}
            report = validate_rows([legacy_row(), row])
            check(name, has(report, text), report["errors"])
        row = append_with(record())
        del row["reaudit"]
        report = validate_rows([legacy_row(), row])
        check("supersedes_without_reaudit_fails", has(report, "needs both supersedes and reaudit") and has(report, "is stale"), report["errors"])
        row = append_with(record())
        row["closure_status"] = "false_positive"
        row["finding_key"] = compute_finding_key(row)
        report = validate_rows([legacy_row(), row])
        check("supported_reaudit_must_keep_status", has(report, "keeps closure_status"), report["errors"])
        row = append_with(record())
        twin = json.loads(json.dumps(row))
        twin["closure_id"] = row["closure_id"] + "-twin"
        report = validate_rows([legacy_row(), row, twin])
        check("double_supersession_fails", has(report, "already superseded"), report["errors"])
        other_key = _self_test_registry_row(closure_id="closure-fixture-other", detail_keys=["other"])
        row = append_with(record(line=1))
        row["finding_key"] = other_key["finding_key"]
        report = validate_rows([legacy_row(), row])
        check("reaudit_must_keep_finding_key", has(report, "keep the finding_key"), report["errors"])

        # A legacy reopened row must prove a real hash change.
        reopen_base = legacy_row()
        for name, changes, ok in (
            ("reopen_proof_with_real_change_passes", {"Plans/Fixture.md": {"previous": "1" * 64, "current": "2" * 64}}, True),
            ("reopen_proof_with_unchanged_hash_fails", {"Plans/Fixture.md": {"previous": "1" * 64, "current": "1" * 64}}, False),
            ("reopen_proof_with_malformed_entry_fails", {"Plans/Fixture.md": "changed"}, False),
        ):
            reopened = _self_test_registry_row(closure_id="closure-fixture-reopen", closure_status="reopened", hashes={
                "owner_evidence_hashes": {"Plans/Fixture.md": sha256_file(doc)}, "reopen_hash_changes": changes})
            report = validate_rows([reopen_base, reopened])
            proof_errors = [e for e in report["errors"] if "reopen_hash_changes" in e]
            check(name, (not proof_errors) if ok else bool(proof_errors), report["errors"])
        check("pydef_constant_resolves", "fixture constant" in AnchorResolver(tmp).content("scripts/fixture.py#pydef=CONST")[1])

        # resolved_differently changes status only to the record's status_now.
        row = append_with(record("resolved_differently", status_now="false_positive"))
        check("resolved_differently_valid", not validate_rows([legacy_row(), row])["errors"])
        row["closure_status"] = "not_for_plan"
        check("resolved_differently_status_mismatch_fails", has(validate_rows([legacy_row(), row]), "status_now"))

        # not_supported appends a reopened row that stays open until a later re-audit closes it.
        row = append_with(record("not_supported", evidence=[{"ref": unit_ref, "absent": "a phrase the claim needs"}]))
        report = validate_rows([legacy_row(), row])
        check("reopened_reaudit_valid_and_open", not report["errors"] and [r["line"] for r in report["open_rows"]] == [2], report)
        reopened_lines = write_registry([legacy_row(), row])
        # Closing a reopened row after a fix is a re-audit whose status no longer fits: resolved_differently.
        close_rec = record("resolved_differently", status_now="repaired", line=2, closure_id=row["closure_id"])
        close_rec["row_sha256"] = sha256_text(reopened_lines[1])
        resolver = AnchorResolver(tmp)
        close_rec["dependency_hashes_at_recheck"] = {unit_ref: resolver.sha256(unit_ref)}
        records_path.write_text(
            json.dumps(json.loads(records_path.read_text())) + "\n" + json.dumps(close_rec, sort_keys=True) + "\n", encoding="utf-8"
        )
        closing = build_reaudit_row(row, 2, reopened_lines[1], close_rec, rel(records_path), resolver, "2026-11-05T00:00:00Z")
        report = validate_rows([legacy_row(), row, closing])
        check("closing_reaudit_closes_reopened_row", not report["errors"] and not report["open_rows"], report)

        # The migration is idempotent and holds back records whose anchors moved.
        rec = record()
        new = append_with(rec)
        write_registry([legacy_row()])
        args_ns = argparse.Namespace(registry=str(registry), records=str(records_path), only="", dry_run=False)
        import contextlib  # noqa: PLC0415
        import io  # noqa: PLC0415

        with contextlib.redirect_stdout(io.StringIO()) as out:
            code = cmd_reaudit_append(args_ns)
        first = json.loads(out.getvalue())
        with contextlib.redirect_stdout(io.StringIO()) as out:
            cmd_reaudit_append(args_ns)
        second = json.loads(out.getvalue())
        check("reaudit_append_appends_once", code == 0 and first["appended"] == 1 and second["already_appended"] == 1
              and len(registry.read_text().splitlines()) == 2, [first, second])
        check("appended_registry_validates", not validate_registry(registry)["errors"])
        write_registry([legacy_row()])
        write_doc(SELF_TEST_DOC.replace("must stay present", "may be removed"))
        with contextlib.redirect_stdout(io.StringIO()) as out:
            cmd_reaudit_append(args_ns)
        moved = json.loads(out.getvalue())
        check("reaudit_append_holds_back_moved_anchor", moved["appended"] == 0 and len(moved["moved_since_recheck"]) == 1
              and len(registry.read_text().splitlines()) == 1, moved)
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
    refresh = sub.add_parser("refresh-hashes", help="Refresh current owner/closure evidence file hashes in the semantic closure registry.")
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
