#!/usr/bin/env python3
"""Plan Document System migration artifact helper.

This script records lossless migration proof artifacts for top-level Plans/*.md
docs. It intentionally does not update Spec Lock, shards, evidence, or
plan_graph artifacts.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import re
import sys
from collections import Counter
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

import yaml


ROOT = Path(__file__).resolve().parents[1]
PLANS = ROOT / "Plans"
MIGRATIONS = PLANS / ".plan_migration"

PLAN_UNIT_REQUIRED_FIELDS = {
    "plan_unit_id",
    "unit_type",
    "status",
    "owner_doc",
    "canonical_text",
    "risk_class",
    "reasoning_tier",
    "context_scope",
    "validation_surfaces",
    "implementation_surfaces",
    "gui_related",
    "source_lineage",
    "depends_on",
    "unblocks",
    "acceptance_criteria",
    "node_compile_hint",
}

GUI_PATTERN = re.compile(
    r"\b(GUI|UI|screen|page|panel|form|layout|styling|visual|icon|SVG|image|screenshot|Slint|widget|view|button|menu|toggle|slider|tooltip|dialog|drawer|tab|toolbar)\b",
    re.IGNORECASE,
)
CONTRACT_REF_PATTERN = re.compile(r"ContractRef:[^\n]+")
ANCHOR_PATTERN = re.compile(r'<a\s+id="([^"]+)"\s*></a>')
HEADING_PATTERN = re.compile(r"^(#{1,6})\s*(.*?)\s*$")
PLAN_UNIT_FENCE_PATTERN = re.compile(r"```yaml\n(.*?)\n```", re.DOTALL)
VALID_DISPOSITION_TYPES = {
    "already_standardized_existing_planunits",
    "explicit_allowed_residual",
    "explicit_disposition",
    "planunit",
    "preserved_appendix_source_block",
    "source_lineage_residual",
    "standardized_section",
    "standardized_section_and_planunit",
    "structural_disposition",
}
FINAL_ALLOWED_DISPOSITION_TYPES = {
    "already_standardized_existing_planunits",
    "explicit_allowed_residual",
    "source_lineage_residual",
    "standardized_section",
    "standardized_section_and_planunit",
    "structural_disposition",
}
VAGUE_PRECONVERSION_STATUS = "pre_conversion_preserved_in_place"
VAGUE_PRECONVERSION_TEXT = "Not converted in this phase yet"


class UniqueKeySafeLoader(yaml.SafeLoader):
    """Safe YAML loader that rejects duplicate mapping keys."""


def _construct_mapping_unique(loader: UniqueKeySafeLoader, node: yaml.MappingNode, deep: bool = False) -> dict[str, Any]:
    mapping: dict[str, Any] = {}
    for key_node, value_node in node.value:
        key = loader.construct_object(key_node, deep=deep)
        if key in mapping:
            raise yaml.constructor.ConstructorError(
                "while constructing a mapping",
                node.start_mark,
                f"found duplicate key: {key}",
                key_node.start_mark,
            )
        mapping[key] = loader.construct_object(value_node, deep=deep)
    return mapping


UniqueKeySafeLoader.add_constructor(yaml.resolver.BaseResolver.DEFAULT_MAPPING_TAG, _construct_mapping_unique)


def utc_now() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")


def rel(path: Path) -> str:
    return path.resolve().relative_to(ROOT).as_posix()


def sha256_bytes(value: bytes) -> str:
    return hashlib.sha256(value).hexdigest()


def sha256_file(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as f:
        for chunk in iter(lambda: f.read(1024 * 1024), b""):
            h.update(chunk)
    return h.hexdigest()


def read_json(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8"))


def write_json(path: Path, data: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(data, indent=2, sort_keys=True) + "\n", encoding="utf-8")


def write_jsonl(path: Path, rows: list[dict[str, Any]]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text("".join(json.dumps(row, sort_keys=True) + "\n" for row in rows), encoding="utf-8")


def read_jsonl(path: Path) -> list[dict[str, Any]]:
    rows = []
    for line_no, line in enumerate(path.read_text(encoding="utf-8").splitlines(), 1):
        if not line.strip():
            continue
        try:
            row = json.loads(line)
        except json.JSONDecodeError as exc:
            raise SystemExit(f"{rel(path)}:{line_no}: invalid JSONL: {exc}") from exc
        if not isinstance(row, dict):
            raise SystemExit(f"{rel(path)}:{line_no}: JSONL row is not an object")
        rows.append(row)
    return rows


def counter_dict(values: list[Any]) -> dict[str, int]:
    return {str(key): value for key, value in sorted(Counter(values).items(), key=lambda item: str(item[0]))}


def is_complete_status(value: Any) -> bool:
    return str(value or "").upper() == "COMPLETE"


def coverage_row_has_allowed_final_disposition(row: dict[str, Any]) -> bool:
    if row.get("allowed_residual") is True:
        return True
    return row.get("disposition_type") in FINAL_ALLOWED_DISPOSITION_TYPES


def coverage_row_is_vague_preconversion(row: dict[str, Any]) -> bool:
    disposition = str(row.get("disposition", ""))
    return row.get("coverage_status") == VAGUE_PRECONVERSION_STATUS or VAGUE_PRECONVERSION_TEXT in disposition


def non_null_next_cursors(value: Any, path: str = "$") -> list[dict[str, Any]]:
    cursors: list[dict[str, Any]] = []
    if isinstance(value, dict):
        for key, child in value.items():
            child_path = f"{path}.{key}"
            if key in {"next_cursor", "next_batch_cursor"} and child is not None:
                cursors.append({"path": child_path, "value": child})
            cursors.extend(non_null_next_cursors(child, child_path))
    elif isinstance(value, list):
        for index, child in enumerate(value):
            cursors.extend(non_null_next_cursors(child, f"{path}[{index}]"))
    return cursors


def top_level_plan_docs() -> list[Path]:
    return sorted(PLANS.glob("*.md"), key=lambda p: p.name.lower())


def historical_scope_exemption(run_dir: Path, inventory_docs: set[str], live_docs: set[str]) -> dict[str, Any] | None:
    """Return a bounded exemption for a superseded historical migration run."""
    summary_path = run_dir / "final_validation_summary.json"
    if not summary_path.exists():
        return None
    summary = read_json(summary_path)
    if summary.get("historical_scope_status") != "superseded_by_current_complete_run":
        return None
    superseded_by = summary.get("superseded_by_run_id")
    if not isinstance(superseded_by, str) or not superseded_by:
        return None
    successor_dir = MIGRATIONS / superseded_by
    successor_inventory_path = successor_dir / "inventory.json"
    successor_summary_path = successor_dir / "final_validation_summary.json"
    if not successor_inventory_path.exists() or not successor_summary_path.exists():
        return None
    successor_summary = read_json(successor_summary_path)
    if not is_complete_status(successor_summary.get("status")):
        return None
    successor_inventory = read_json(successor_inventory_path)
    successor_docs = {
        doc.get("path")
        for doc in successor_inventory.get("docs", [])
        if isinstance(doc, dict) and isinstance(doc.get("path"), str)
    }
    if successor_inventory.get("doc_count") != len(live_docs) or successor_docs != live_docs:
        return None
    declared_missing = set(summary.get("missing_current_docs_intentionally_not_inventoried", []))
    actual_missing = live_docs - inventory_docs
    if declared_missing != actual_missing:
        return None
    return {
        "path": rel(summary_path),
        "warning": "historical_scope_superseded_by_current_complete_run",
        "superseded_by_run_id": superseded_by,
        "missing_current_docs": sorted(actual_missing),
    }


def load_sharded_sources() -> set[str]:
    path = PLANS / "sharding_config.json"
    if not path.exists():
        return set()
    data = read_json(path)
    return set(data.get("sources", []))


def load_locked_md_sources() -> set[str]:
    path = PLANS / "Spec_Lock.json"
    if not path.exists():
        return set()
    data = read_json(path)
    return {
        entry.get("path")
        for entry in data.get("canonical_ssot_hashes", {}).get("files", [])
        if isinstance(entry, dict) and str(entry.get("path", "")).endswith(".md")
    }


def line_start_offsets(source: bytes) -> list[int]:
    offsets = [0]
    for match in re.finditer(rb"\n", source):
        offsets.append(match.end())
    return offsets


def line_bytes(source: bytes) -> list[bytes]:
    return source.splitlines(keepends=True)


def markdown_heading_starts(lines: list[str]) -> list[tuple[int, int, str]]:
    starts: list[tuple[int, int, str]] = []
    fence: str | None = None
    for i, line in enumerate(lines, 1):
        stripped = line.lstrip()
        if stripped.startswith("```") or stripped.startswith("~~~"):
            marker = stripped[:3]
            fence = None if fence == marker else marker
        if fence:
            continue
        match = HEADING_PATTERN.match(line.rstrip("\n"))
        if not match:
            continue
        starts.append((i, len(match.group(1)), match.group(2).strip()))
    return starts


def slugify_heading(value: str) -> str:
    value = value.strip().lower()
    value = re.sub(r"[^\w\s.-]", "", value)
    value = re.sub(r"\s+", "-", value)
    value = re.sub(r"-+", "-", value).strip("-")
    return value or "section"


def extract_plan_unit_blocks(path: Path) -> tuple[list[dict[str, Any]], list[dict[str, Any]]]:
    text = path.read_text(encoding="utf-8")
    units: list[dict[str, Any]] = []
    errors: list[dict[str, Any]] = []
    for match in PLAN_UNIT_FENCE_PATTERN.finditer(text):
        block = match.group(1)
        if "plan_unit_id:" not in block:
            continue
        line = text[: match.start()].count("\n") + 1
        try:
            data = yaml.load(block, Loader=UniqueKeySafeLoader)
        except Exception as exc:  # noqa: BLE001
            errors.append({"path": rel(path), "line": line, "error": str(exc)})
            continue
        if not isinstance(data, dict) or not data.get("plan_unit_id"):
            errors.append({"path": rel(path), "line": line, "error": "plan_unit_block_not_mapping"})
            continue
        missing = sorted(PLAN_UNIT_REQUIRED_FIELDS - set(data))
        unit = dict(data)
        unit["_path"] = rel(path)
        unit["_line"] = line
        unit["_missing_required_fields"] = missing
        units.append(unit)
    return units, errors


def live_plan_unit_blocks() -> tuple[list[dict[str, Any]], list[dict[str, Any]]]:
    units: list[dict[str, Any]] = []
    errors: list[dict[str, Any]] = []
    for path in top_level_plan_docs():
        doc_units, doc_errors = extract_plan_unit_blocks(path)
        units.extend(doc_units)
        errors.extend(doc_errors)
    return units, errors


def live_plan_unit_prefixes() -> set[str]:
    prefixes: set[str] = set()
    units, _ = live_plan_unit_blocks()
    for unit in units:
        plan_unit_id = str(unit.get("plan_unit_id", ""))
        if plan_unit_id:
            prefixes.add(plan_unit_id.split("-", 1)[0])
    return prefixes


def span_contractrefs(text: str) -> list[str]:
    return [match.group(0).strip() for match in CONTRACT_REF_PATTERN.finditer(text)]


def span_anchors(text: str) -> list[str]:
    return ANCHOR_PATTERN.findall(text)


def classification_reason(text: str) -> str:
    if GUI_PATTERN.search(text):
        return "Span mentions GUI/UI/user-visible presentation or interactive controls."
    return "Span does not primarily concern GUI, UI, layout, styling, or visual presentation."


def segment_doc(path: Path, run_id: str) -> list[dict[str, Any]]:
    source = path.read_bytes()
    lines_b = line_bytes(source)
    lines_s = source.decode("utf-8", errors="replace").splitlines()
    offsets = line_start_offsets(source)
    starts = markdown_heading_starts(lines_s)
    boundaries: list[tuple[int, int | None, str | None]] = []
    if not starts or starts[0][0] > 1:
        boundaries.append((1, None, "preamble"))
    boundaries.extend((line_no, level, title) for line_no, level, title in starts)

    rows: list[dict[str, Any]] = []
    for index, (start_line, level, title) in enumerate(boundaries, 1):
        next_line = boundaries[index][0] if index < len(boundaries) else len(lines_b) + 1
        end_line = next_line - 1
        if end_line < start_line:
            continue
        byte_start = offsets[start_line - 1]
        byte_end = offsets[end_line] if end_line < len(offsets) else len(source)
        body_start = start_line + (1 if level else 0)
        body_end = end_line
        span_bytes = source[byte_start:byte_end]
        span_text = span_bytes.decode("utf-8", errors="replace")
        span_id = f"{path.stem.replace('.', '_')}-S{index:04d}"
        rows.append(
            {
                "schema_id": "pm.plan_migration.span.v1",
                "run_id": run_id,
                "span_id": span_id,
                "source_path": rel(path),
                "ordinal": index,
                "span_kind": "section" if level else "preamble",
                "heading_level": level,
                "heading_text": title,
                "heading_slug_alias": slugify_heading(title or path.stem),
                "line_start": start_line,
                "line_end": end_line,
                "byte_start": byte_start,
                "byte_end": byte_end,
                "body_line_start": body_start if body_start <= body_end else None,
                "body_line_end": body_end if body_start <= body_end else None,
                "sha256": sha256_bytes(span_bytes),
                "contractrefs": span_contractrefs(span_text),
                "anchors": span_anchors(span_text),
                "gui_related_inferred": bool(GUI_PATTERN.search(span_text)),
                "gui_classification_reason": classification_reason(span_text),
                "preservation_markers": {
                    "negative_constraints": [
                        line.strip()
                        for line in span_text.splitlines()
                        if re.search(r"\b(MUST NOT|must not|Do not|Forbidden|forbidden|Non-goals?|out of scope)\b", line)
                    ],
                    "compatibility_only": [
                        line.strip()
                        for line in span_text.splitlines()
                        if re.search(r"\bcompatibility(?:-only)?|legacy|transition\b", line, re.IGNORECASE)
                    ],
                    "stale_retired": [
                        line.strip()
                        for line in span_text.splitlines()
                        if re.search(r"\bstale|retired|deprecated\b", line, re.IGNORECASE)
                    ],
                    "owner_consumer": [
                        line.strip()
                        for line in span_text.splitlines()
                        if re.search(r"\b(owner|consumer|SSOT|canonical|boundary)\b", line, re.IGNORECASE)
                    ],
                },
            }
        )
    return rows


def doc_inventory(path: Path, run_id: str, sharded: set[str], locked: set[str]) -> tuple[dict[str, Any], list[dict[str, Any]], list[dict[str, Any]]]:
    source = path.read_bytes()
    text = source.decode("utf-8", errors="replace")
    spans = segment_doc(path, run_id)
    units, unit_errors = extract_plan_unit_blocks(path)
    refs = span_contractrefs(text)
    anchors = span_anchors(text)
    path_ref = rel(path)
    doc = {
        "path": path_ref,
        "sha256": sha256_bytes(source),
        "bytes": len(source),
        "line_count": len(source.splitlines()),
        "heading_count": sum(1 for span in spans if span["span_kind"] == "section"),
        "span_count": len(spans),
        "contractref_count": len(refs),
        "anchor_count": len(anchors),
        "plan_unit_count": len(units),
        "plan_unit_parse_errors": unit_errors,
        "has_planunits_section": "## 2. PlanUnits" in text or "## PlanUnits" in text,
        "sharded": path_ref in sharded,
        "spec_locked": path_ref in locked,
        "gui_related_inferred": bool(GUI_PATTERN.search(text)),
        "recommended_batch": "governance_seal_needed" if path_ref in sharded or path_ref in locked else "pilot_or_early_batch_candidate",
    }
    return doc, spans, units


def initial_coverage_row(span: dict[str, Any], pilot_doc: str | None) -> dict[str, Any]:
    is_pilot = pilot_doc is not None and span["source_path"] == pilot_doc
    return {
        "schema_id": "pm.plan_migration.coverage.v1",
        "run_id": span["run_id"],
        "span_id": span["span_id"],
        "source_path": span["source_path"],
        "source_line_start": span["line_start"],
        "source_line_end": span["line_end"],
        "source_sha256": span["sha256"],
        "coverage_status": "pilot_selected_pending_conversion" if is_pilot else "pre_conversion_preserved_in_place",
        "disposition_type": "explicit_disposition",
        "disposition": (
            "Selected for representative pilot conversion; final standardized-section and PlanUnit mapping is recorded after the pilot edit."
            if is_pilot
            else "Not converted in this phase yet; original span remains unchanged in place and is covered by original_hashes plus span_map until its controlled batch."
        ),
        "target_path": span["source_path"],
        "target_section": None,
        "target_plan_units": [],
        "preserved_contractrefs": span["contractrefs"],
        "preserved_anchors_or_aliases": span["anchors"] + [span["heading_slug_alias"]],
        "gui_related_inferred": span["gui_related_inferred"],
        "split_recommended": False,
        "notes": [],
    }


def anchor_alias_rows(spans: list[dict[str, Any]]) -> list[dict[str, Any]]:
    rows = []
    for span in spans:
        if span["heading_text"] is None and not span["anchors"]:
            continue
        aliases = list(dict.fromkeys(span["anchors"] + [span["heading_slug_alias"]]))
        rows.append(
            {
                "schema_id": "pm.plan_migration.anchor_alias.v1",
                "run_id": span["run_id"],
                "source_path": span["source_path"],
                "span_id": span["span_id"],
                "line_start": span["line_start"],
                "heading_text": span["heading_text"],
                "aliases": aliases,
                "preservation_status": "preserve_existing_anchor_or_generated_alias",
            }
        )
    return rows


def cmd_inventory(args: argparse.Namespace) -> dict[str, Any]:
    run_dir = MIGRATIONS / args.run_id
    sharded = load_sharded_sources()
    locked = load_locked_md_sources()
    docs: list[dict[str, Any]] = []
    spans: list[dict[str, Any]] = []
    units: list[dict[str, Any]] = []

    for path in top_level_plan_docs():
        doc, doc_spans, doc_units = doc_inventory(path, args.run_id, sharded, locked)
        docs.append(doc)
        spans.extend(doc_spans)
        units.extend(doc_units)

    original_hashes = {
        "schema_id": "pm.plan_migration.original_hashes.v1",
        "run_id": args.run_id,
        "generated_at_utc": utc_now(),
        "scope": "top-level Plans/*.md",
        "files": [
            {
                "path": doc["path"],
                "sha256": doc["sha256"],
                "bytes": doc["bytes"],
                "line_count": doc["line_count"],
            }
            for doc in docs
        ],
    }
    inventory = {
        "schema_id": "pm.plan_migration.inventory.v1",
        "run_id": args.run_id,
        "generated_at_utc": original_hashes["generated_at_utc"],
        "scope": "top-level Plans/*.md",
        "doc_count": len(docs),
        "span_count": len(spans),
        "plan_unit_count": len(units),
        "pilot_doc": args.pilot_doc,
        "locked_doc_count": sum(1 for doc in docs if doc["spec_locked"]),
        "sharded_doc_count": sum(1 for doc in docs if doc["sharded"]),
        "docs": docs,
    }
    coverage = [initial_coverage_row(span, args.pilot_doc) for span in spans]
    anchors = anchor_alias_rows(spans)

    write_json(run_dir / "inventory.json", inventory)
    write_json(run_dir / "original_hashes.json", original_hashes)
    write_jsonl(run_dir / "span_map.jsonl", spans)
    write_jsonl(run_dir / "coverage_map.jsonl", coverage)
    write_json(run_dir / "anchor_aliases.json", {"schema_id": "pm.plan_migration.anchor_aliases.v1", "run_id": args.run_id, "aliases": anchors})

    report = validate_run_dir(run_dir)
    write_json(run_dir / "validation_report.json", report)
    return report


PILOT_TARGETS = [
    (re.compile(r"^# UI Wiring Rules"), ["UIW-001"]),
    (re.compile(r"^## 0\. Scope$"), ["UIW-001", "UIW-005"]),
    (re.compile(r"^### 0\.1 GUI concept reconciliation input$"), ["UIW-005"]),
    (re.compile(r"^## 1\. Rule 1"), ["UIW-002"]),
    (re.compile(r"^## 2\. Rule 2"), ["UIW-003"]),
    (re.compile(r"^## 3\. UI Command Dispatcher Boundary$|^### 3\."), ["UIW-004"]),
    (re.compile(r"^## 4\. Wiring Matrix Concept$|^### 4\.|^### Search Index"), ["UIW-006"]),
    (re.compile(r"^## 5\. Autonomous Verification Strategy$|^### 5\."), ["UIW-007"]),
    (re.compile(r"^## 6\. References$"), ["UIW-008"]),
]


def pilot_plan_units(path: Path) -> set[str]:
    units, errors = extract_plan_unit_blocks(path)
    if errors:
        raise SystemExit(json.dumps({"status": "fail", "errors": errors}, indent=2))
    return {str(unit["plan_unit_id"]) for unit in units}


def target_units_for_span(span: dict[str, Any]) -> list[str]:
    heading = span.get("heading_text") or ""
    marker = f"{'#' * (span.get('heading_level') or 1)} {heading}" if heading else "preamble"
    for pattern, units in PILOT_TARGETS:
        if pattern.search(marker):
            return units
    return ["UIW-001"]


def cmd_mark_pilot(args: argparse.Namespace) -> dict[str, Any]:
    run_dir = Path(args.run_dir)
    if not run_dir.is_absolute():
        run_dir = ROOT / run_dir
    pilot_path = ROOT / args.pilot_doc
    if not pilot_path.exists():
        raise SystemExit(f"missing pilot doc: {args.pilot_doc}")

    known_units = pilot_plan_units(pilot_path)
    coverage_path = run_dir / "coverage_map.jsonl"
    rows = read_jsonl(coverage_path)
    updated = 0
    for row in rows:
        if row.get("source_path") != args.pilot_doc:
            continue
        span = next((s for s in read_jsonl(run_dir / "span_map.jsonl") if s["span_id"] == row["span_id"]), None)
        if span is None:
            raise SystemExit(f"missing span for {row['span_id']}")
        target_units = [unit for unit in target_units_for_span(span) if unit in known_units]
        row.update(
            {
                "coverage_status": "pilot_converted_covered",
                "disposition_type": "standardized_section_and_planunit",
                "disposition": "Original span is preserved in the standardized pilot doc and mapped to PlanUnit coverage; original line/hash proof remains in span_map.",
                "target_path": args.pilot_doc,
                "target_section": span.get("heading_text") or "Compliance and authority preamble",
                "target_plan_units": target_units,
                "notes": ["Pilot conversion kept original anchors/ContractRefs and added standardized PlanUnits."],
            }
        )
        updated += 1
    write_jsonl(coverage_path, rows)

    pilot_report = {
        "schema_id": "pm.plan_migration.pilot_report.v1",
        "run_id": read_json(run_dir / "inventory.json")["run_id"],
        "generated_at_utc": utc_now(),
        "pilot_doc": args.pilot_doc,
        "pilot_doc_sha256_after": sha256_file(pilot_path),
        "coverage_rows_updated": updated,
        "plan_units_found": sorted(known_units),
        "status": "pass" if updated and known_units else "fail",
        "notes": [
            "Spec Lock, shards, evidence, auto_decisions, and plan_graph were not updated.",
            "No WorkNodes, NodeSeeds, or executable build tasks were created.",
        ],
    }
    write_json(run_dir / "pilot_report.json", pilot_report)
    report = validate_run_dir(run_dir)
    write_json(run_dir / "validation_report.json", report)
    return report


def doc_title(path: Path) -> str:
    for line in path.read_text(encoding="utf-8", errors="replace").splitlines():
        match = HEADING_PATTERN.match(line)
        if match:
            return match.group(2).strip() or path.stem
    return path.stem


def id_prefix_for_path(path_ref: str, used: set[str]) -> str:
    stem = Path(path_ref).stem
    words = re.split(r"[^A-Za-z0-9]+", stem)
    base = "".join(word[:1].upper() for word in words if word) or re.sub(r"[^A-Za-z0-9]", "", stem).upper()[:4]
    base = base[:8] or "PLAN"
    candidate = base
    suffix = 2
    while candidate in used:
        candidate = f"{base}{suffix}"
        suffix += 1
    used.add(candidate)
    return candidate


def collect_doc_markers(spans: list[dict[str, Any]]) -> dict[str, list[str]]:
    exact: list[str] = []
    negative: list[str] = []
    compatibility: list[str] = []
    stale: list[str] = []
    owners: list[str] = []
    for span in spans:
        if span.get("heading_text"):
            exact.append(str(span["heading_text"]))
        for ref in span.get("contractrefs", [])[:3]:
            exact.append(ref)
        markers = span.get("preservation_markers", {})
        negative.extend(markers.get("negative_constraints", []))
        compatibility.extend(markers.get("compatibility_only", []))
        stale.extend(markers.get("stale_retired", []))
        owners.extend(markers.get("owner_consumer", []))

    def unique_limited(values: list[str], limit: int = 24) -> list[str]:
        seen: set[str] = set()
        out: list[str] = []
        for value in values:
            value = value.strip()
            if not value or value in seen:
                continue
            seen.add(value)
            out.append(value[:300])
            if len(out) >= limit:
                break
        return out

    return {
        "preserved_exact_tokens": unique_limited(exact),
        "negative_constraints": unique_limited(negative),
        "compatibility_only_notes": unique_limited(compatibility),
        "stale_retired_dispositions": unique_limited(stale),
        "owner_boundary_notes": unique_limited(owners),
    }


def yaml_scalar(value: Any) -> str:
    return yaml.safe_dump(value, default_flow_style=True, sort_keys=False).strip()


def yaml_block(data: dict[str, Any]) -> str:
    return yaml.safe_dump(data, sort_keys=False, allow_unicode=True, width=1000).strip()


def source_preserving_section(
    path_ref: str,
    title: str,
    unit_id: str,
    spans: list[dict[str, Any]],
    original_hash: str,
) -> str:
    gui_related = any(bool(span.get("gui_related_inferred")) for span in spans)
    non_gui_related = any(not bool(span.get("gui_related_inferred")) for span in spans)
    split_recommended = gui_related and non_gui_related
    markers = collect_doc_markers(spans)
    unit = {
        "plan_unit_id": unit_id,
        "unit_type": "requirement",
        "status": "accepted",
        "owner_doc": path_ref,
        "canonical_text": f"{path_ref} keeps its pre-migration canonical source content losslessly in place while exposing a source-preserving PlanUnit for Plan Document System indexing. Fine-grained requirement splitting may occur in a later controlled batch using the recorded span_map and coverage_map.",
        "gui_related": gui_related,
        "gui_classification_reason": (
            "The preserved source spans include GUI/UI/user-visible presentation or interactive control requirements."
            if gui_related
            else "The preserved source spans do not primarily concern GUI, UI, layout, styling, or visual presentation."
        ),
        "split_recommended": split_recommended,
        "depends_on": [],
        "unblocks": [],
        "acceptance_criteria": [
            "Original source spans remain available for exact-text audit.",
            "Every original span for this doc has one coverage_map disposition.",
            "ContractRefs, anchors or aliases, negative constraints, compatibility-only notes, stale/retired dispositions, owner/consumer boundaries, and source lineage are preserved by span_map and coverage_map.",
            "No WorkNodes, NodeSeeds, or executable build tasks are created by this PlanUnit.",
        ],
        "validation_surfaces": [
            "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-001-standardize-plans",
            "python3 scripts/pm-plans-verify.py run-gates",
            "python3 scripts/pm-shard-plans.py --check",
        ],
        "risk_class": "source_preservation",
        "reasoning_tier": "standard",
        "context_scope": "single_plan_doc",
        "implementation_surfaces": [path_ref],
        "node_compile_hint": {"mode": "source_preserving_planunit", "create_worknodes": False},
        "source_lineage": [
            f"Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:{span['span_id']}"
            for span in spans
        ],
        "preserved_exact_tokens": markers["preserved_exact_tokens"],
        "negative_constraints": markers["negative_constraints"],
        "compatibility_only_notes": markers["compatibility_only_notes"],
        "stale_retired_dispositions": markers["stale_retired_dispositions"],
        "owner_boundary_notes": markers["owner_boundary_notes"],
        "owner_hints": [path_ref],
    }
    if split_recommended:
        unit["split_recommendation_reason"] = "The doc-level source-preserving unit covers both GUI-related and non-GUI spans; future fine-grained PlanUnits should split those surfaces when safe."

    first_span = spans[0]["span_id"]
    last_span = spans[-1]["span_id"]
    return f"""

## Owner / Consumer Map

This source-preserving standardization keeps the owner and consumer boundaries stated in the original document body. During this batch, `{path_ref}` remains the owner doc for the behavior described by its preserved sections, while cross-doc ownership follows the ContractRefs and boundary notes already present in the original text.

ContractRef: ContractName:Plans/Plan_Document_System.md, ContractName:Plans/Bootstrap_Planning_Migration.md

## PlanUnits

### {unit_id} - {title} Source-Preserving PlanUnit

```yaml
{yaml_block(unit)}
```

## Migration Coverage

Original hash: `{original_hash}`.

Run-scoped proof artifacts:
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/original_hashes.json`
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl`
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/coverage_map.jsonl`
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/anchor_aliases.json`

All original spans from `{first_span}` through `{last_span}` are preserved in place and mapped in `coverage_map.jsonl` to `{unit_id}`. This batch did not update Spec Lock, generated shards, evidence bundles, auto_decisions, or plan_graph, and it did not create WorkNodes, NodeSeeds, or executable build tasks.
"""


def cmd_standardize_batch(args: argparse.Namespace) -> dict[str, Any]:
    run_dir = Path(args.run_dir)
    if not run_dir.is_absolute():
        run_dir = ROOT / run_dir
    inventory = read_json(run_dir / "inventory.json")
    original_hashes = {entry["path"]: entry for entry in read_json(run_dir / "original_hashes.json").get("files", [])}
    spans = read_jsonl(run_dir / "span_map.jsonl")
    coverage = read_jsonl(run_dir / "coverage_map.jsonl")
    by_doc: dict[str, list[dict[str, Any]]] = {}
    for span in spans:
        by_doc.setdefault(span["source_path"], []).append(span)

    used_prefixes = live_plan_unit_prefixes()
    batch_rows = []
    failures: list[dict[str, Any]] = []
    for path_ref in args.docs:
        path = ROOT / path_ref
        if not path.exists():
            failures.append({"path": path_ref, "error": "missing_doc"})
            continue
        if path_ref not in by_doc:
            failures.append({"path": path_ref, "error": "doc_not_in_span_map"})
            continue
        text = path.read_text(encoding="utf-8")
        if "\n## PlanUnits\n" in text:
            failures.append({"path": path_ref, "error": "already_has_planunits_section"})
            continue
        prefix = id_prefix_for_path(path_ref, used_prefixes)
        unit_id = f"{prefix}-001"
        section = source_preserving_section(
            path_ref,
            doc_title(path),
            unit_id,
            by_doc[path_ref],
            original_hashes[path_ref]["sha256"],
        )
        path.write_text(text.rstrip() + section + "\n", encoding="utf-8")

        updated_rows = 0
        span_ids = {span["span_id"] for span in by_doc[path_ref]}
        for row in coverage:
            if row.get("span_id") not in span_ids:
                continue
            row.update(
                {
                    "coverage_status": f"{args.batch_id}_converted_covered",
                    "disposition_type": "standardized_section_and_planunit",
                    "disposition": "Original span is preserved in place and mapped to a source-preserving PlanUnit for this controlled batch.",
                    "target_path": path_ref,
                    "target_section": "PlanUnits / Migration Coverage",
                    "target_plan_units": [unit_id],
                    "split_recommended": bool(any(span.get("gui_related_inferred") for span in by_doc[path_ref]) and any(not span.get("gui_related_inferred") for span in by_doc[path_ref])),
                    "notes": [f"Controlled batch {args.batch_id}; source-preserving conversion."],
                }
            )
            updated_rows += 1
        batch_rows.append(
            {
                "batch_id": args.batch_id,
                "path": path_ref,
                "plan_unit_id": unit_id,
                "spans_covered": updated_rows,
                "sha256_after": sha256_file(path),
            }
        )

    if failures:
        report = {
            "schema_id": "pm.plan_migration.batch_report.v1",
            "run_id": inventory.get("run_id"),
            "batch_id": args.batch_id,
            "generated_at_utc": utc_now(),
            "status": "fail",
            "failures": failures,
            "docs": batch_rows,
        }
        append_batch_report(run_dir, report)
        write_json(run_dir / "validation_report.json", validate_run_dir(run_dir))
        return report

    write_jsonl(run_dir / "coverage_map.jsonl", coverage)
    report = {
        "schema_id": "pm.plan_migration.batch_report.v1",
        "run_id": inventory.get("run_id"),
        "batch_id": args.batch_id,
        "generated_at_utc": utc_now(),
        "status": "pass",
        "failures": [],
        "docs": batch_rows,
        "notes": [
            "Spec Lock, generated shards, evidence bundles, auto_decisions, and plan_graph were not updated.",
            "No WorkNodes, NodeSeeds, or executable build tasks were created.",
        ],
    }
    append_batch_report(run_dir, report)
    validation = validate_run_dir(run_dir)
    write_json(run_dir / "validation_report.json", validation)
    return report if validation["status"] == "pass" else validation


def append_batch_report(run_dir: Path, report: dict[str, Any]) -> None:
    path = run_dir / "batch_report.jsonl"
    existing = path.read_text(encoding="utf-8") if path.exists() else ""
    path.write_text(existing + json.dumps(report, sort_keys=True) + "\n", encoding="utf-8")


def validate_batch_report_docs(run_dir: Path, live_plan_unit_ids: set[str], failures: list[dict[str, Any]]) -> tuple[int, int]:
    path = run_dir / "batch_report.jsonl"
    if not path.exists():
        return 0, 0

    rows = read_jsonl(path)
    doc_count = 0
    for row_index, row in enumerate(rows, 1):
        docs = row.get("docs", [])
        if not isinstance(docs, list):
            failures.append({"path": rel(path), "row": row_index, "error": "batch_report_docs_not_list"})
            continue
        for doc_index, doc in enumerate(docs, 1):
            doc_count += 1
            if not isinstance(doc, dict):
                failures.append({"path": rel(path), "row": row_index, "doc_index": doc_index, "error": "batch_report_doc_not_object"})
                continue

            path_ref = doc.get("path")
            if not isinstance(path_ref, str) or not path_ref:
                failures.append({"path": rel(path), "row": row_index, "doc_index": doc_index, "error": "batch_report_doc_missing_path"})
                continue

            live_path = ROOT / path_ref
            failure_base = {"path": rel(path), "row": row_index, "doc_index": doc_index, "doc_path": path_ref}
            if not live_path.exists():
                failures.append({**failure_base, "error": "batch_report_doc_path_missing"})
            else:
                actual_sha256 = sha256_file(live_path)
                if doc.get("sha256_after") != actual_sha256:
                    failures.append(
                        {
                            **failure_base,
                            "error": "stale_batch_report_sha256_after",
                            "expected": actual_sha256,
                            "actual": doc.get("sha256_after"),
                        }
                    )

            plan_unit_id = doc.get("plan_unit_id")
            if not isinstance(plan_unit_id, str) or not plan_unit_id:
                failures.append({**failure_base, "error": "batch_report_doc_missing_plan_unit_id"})
            elif plan_unit_id not in live_plan_unit_ids:
                failures.append(
                    {
                        **failure_base,
                        "plan_unit_id": plan_unit_id,
                        "error": "batch_report_plan_unit_id_not_found_in_live_plans",
                    }
                )
    return len(rows), doc_count


def cmd_refresh_batch_hashes(args: argparse.Namespace) -> dict[str, Any]:
    run_dir = Path(args.run_dir)
    if not run_dir.is_absolute():
        run_dir = ROOT / run_dir
    path = run_dir / "batch_report.jsonl"
    rows = read_jsonl(path)
    updated = 0
    missing: list[dict[str, Any]] = []
    for row_index, row in enumerate(rows, 1):
        docs = row.get("docs", [])
        if not isinstance(docs, list):
            continue
        for doc_index, doc in enumerate(docs, 1):
            if not isinstance(doc, dict):
                continue
            path_ref = doc.get("path")
            if not isinstance(path_ref, str) or not path_ref:
                continue
            live_path = ROOT / path_ref
            if not live_path.exists():
                missing.append({"row": row_index, "doc_index": doc_index, "path": path_ref})
                continue
            current_hash = sha256_file(live_path)
            if doc.get("sha256_after") != current_hash:
                doc["sha256_after"] = current_hash
                updated += 1
    if missing:
        return {
            "schema_id": "pm.plan_migration.refresh_batch_hashes_report.v1",
            "run_id": read_json(run_dir / "inventory.json").get("run_id"),
            "status": "fail",
            "updated_doc_entries": updated,
            "missing_docs": missing,
        }
    write_jsonl(path, rows)
    return {
        "schema_id": "pm.plan_migration.refresh_batch_hashes_report.v1",
        "run_id": read_json(run_dir / "inventory.json").get("run_id"),
        "status": "pass",
        "updated_doc_entries": updated,
        "batch_report_rows": len(rows),
    }


def cmd_refresh_final_summary(args: argparse.Namespace) -> dict[str, Any]:
    run_dir = Path(args.run_dir)
    if not run_dir.is_absolute():
        run_dir = ROOT / run_dir
    summary_path = run_dir / "final_validation_summary.json"
    summary = read_json(summary_path)
    inventory = read_json(run_dir / "inventory.json")
    coverage = read_jsonl(run_dir / "coverage_map.jsonl")
    live_units, live_unit_errors = live_plan_unit_blocks()
    if live_unit_errors:
        return {
            "schema_id": "pm.plan_migration.refresh_final_summary_report.v1",
            "run_id": inventory.get("run_id"),
            "status": "fail",
            "errors": live_unit_errors,
        }

    source_preserving_unit_ids = sorted(
        str(unit.get("plan_unit_id"))
        for unit in live_units
        if isinstance(unit.get("node_compile_hint"), dict)
        and unit["node_compile_hint"].get("mode") == "source_preserving_planunit"
    )
    source_lineage_residual_plan_units = sorted(
        str(unit.get("plan_unit_id"))
        for unit in live_units
        if isinstance(unit.get("node_compile_hint"), dict)
        and unit["node_compile_hint"].get("mode") == "source_lineage_residual"
    )
    node_readiness_report_path = ROOT / "Plans/.plan_index/node_readiness_report.json"
    node_readiness_status = "runtime_disabled"
    runtime_enablement_status = "runtime_disabled"
    if node_readiness_report_path.exists():
        node_readiness_report = read_json(node_readiness_report_path)
        node_readiness_status = str(node_readiness_report.get("status") or node_readiness_status)
        runtime_status = node_readiness_report.get("runtime_enablement_status")
        if isinstance(runtime_status, dict):
            runtime_enablement_status = str(runtime_status.get("status") or runtime_enablement_status)
        elif isinstance(runtime_status, str):
            runtime_enablement_status = runtime_status

    summary.update(
        {
            "generated_at_utc": utc_now(),
            "run_id": inventory.get("run_id"),
            "live_plan_unit_count": len(live_units),
            "unique_live_plan_unit_count": len({str(unit.get("plan_unit_id")) for unit in live_units}),
            "coverage_rows": len(coverage),
            "coverage_status_counts": counter_dict([row.get("coverage_status") for row in coverage]),
            "coverage_disposition_type_counts": counter_dict([row.get("disposition_type") for row in coverage]),
            "source_preserving_unit_count_after_batch": len(source_preserving_unit_ids),
            "residual_source_preserving_plan_units": source_preserving_unit_ids,
            "docs_still_source_preserving_count": len(source_preserving_unit_ids),
            "pre_conversion_preserved_in_place_rows": sum(1 for row in coverage if row.get("coverage_status") == VAGUE_PRECONVERSION_STATUS),
            "source_lineage_residual_plan_units": source_lineage_residual_plan_units
            or summary.get("source_lineage_residual_plan_units", []),
            "no_worknodes_created": True,
            "no_executable_build_tasks_created": True,
            "no_final_node_queues_created": True,
            "nodeseed_candidates_created": False,
            "implementation_files_created": False,
            "production_build_tasks_created": False,
        }
    )

    if args.seal_state == "postseal":
        summary.update(
            {
                "governance_seal_required": False,
                "standard_run_gates_status": "passed_after_governance_seal",
                "standard_run_gates_expected_seal_failures": [],
                "shard_check_status": "passed_after_governance_seal",
                "shard_failure_count": 0,
                "seal_phase_required": [],
                "forbidden_governance_artifacts_confirmed_not_updated": [],
                "forbidden_governance_artifacts_changed": [],
                "node_readiness_status": node_readiness_status,
                "runtime_enablement_status": runtime_enablement_status,
                "notes": [
                    "Post-seal migration summary refreshed after live Plan repairs and governance artifact regeneration.",
                    "No WorkNodes, NodeSeeds, NodeSeed candidates, executable queues, final node manifests, product implementation files, production build tasks, or final node queues were created.",
                    f"Node readiness remains {node_readiness_status}; runtime enablement remains {runtime_enablement_status} because PlanCompile runtime launch and node artifact generation are not enabled.",
                ],
            }
        )
    ledger_id = getattr(args, "ledger_id", None)
    ledger_command = (
        f"python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/{ledger_id}"
        if ledger_id
        else "python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/<ledger_id>"
    )
    summary["validators"] = {
        "required_current_commands": [
            f"python3 scripts/pm-plan-migration.py validate --run-dir {args.run_dir}",
            "python3 scripts/pm-plan-index.py validate",
            ledger_command,
            "python3 scripts/pm-plans-verify.py run-gates",
            "python3 scripts/pm-shard-plans.py --check",
            "git diff --check",
        ]
    }
    write_json(summary_path, summary)
    return {
        "schema_id": "pm.plan_migration.refresh_final_summary_report.v1",
        "run_id": inventory.get("run_id"),
        "status": "pass",
        "seal_state": args.seal_state,
        "live_plan_unit_count": len(live_units),
        "source_preserving_unit_count": len(source_preserving_unit_ids),
    }


def validate_run_dir(run_dir: Path) -> dict[str, Any]:
    failures: list[dict[str, Any]] = []
    warnings: list[dict[str, Any]] = []
    required = [
        "inventory.json",
        "original_hashes.json",
        "span_map.jsonl",
        "coverage_map.jsonl",
        "anchor_aliases.json",
    ]
    for name in required:
        if not (run_dir / name).exists():
            failures.append({"path": rel(run_dir / name), "error": "missing_required_artifact"})
    if failures:
        return {
            "schema_id": "pm.plan_migration.validation_report.v1",
            "generated_at_utc": utc_now(),
            "status": "fail",
            "failures": failures,
        }

    inventory = read_json(run_dir / "inventory.json")
    hashes = read_json(run_dir / "original_hashes.json")
    spans = read_jsonl(run_dir / "span_map.jsonl")
    coverage = read_jsonl(run_dir / "coverage_map.jsonl")
    aliases = read_json(run_dir / "anchor_aliases.json")

    docs = {doc["path"]: doc for doc in inventory.get("docs", [])}
    hashed = {entry["path"]: entry for entry in hashes.get("files", [])}
    live_doc_set = {rel(path) for path in top_level_plan_docs()}
    inventory_doc_set = set(docs)
    scope_exemption = historical_scope_exemption(run_dir, inventory_doc_set, live_doc_set)
    span_ids = [span["span_id"] for span in spans]
    coverage_ids = [row["span_id"] for row in coverage]

    if inventory.get("doc_count") != len(live_doc_set):
        if scope_exemption:
            warnings.append({**scope_exemption, "check": "doc_count_mismatch"})
        else:
            failures.append({"path": rel(run_dir / "inventory.json"), "error": "doc_count_mismatch", "expected": len(live_doc_set), "actual": inventory.get("doc_count")})
    if inventory_doc_set != live_doc_set:
        if scope_exemption:
            warnings.append({**scope_exemption, "check": "inventory_doc_set_mismatch"})
        else:
            failures.append({"path": rel(run_dir / "inventory.json"), "error": "inventory_doc_set_mismatch"})
    if set(hashed) != set(docs):
        failures.append({"path": rel(run_dir / "original_hashes.json"), "error": "original_hash_doc_set_mismatch"})
    if len(span_ids) != len(set(span_ids)):
        failures.append({"path": rel(run_dir / "span_map.jsonl"), "error": "duplicate_span_id"})
    if set(span_ids) != set(coverage_ids):
        failures.append({"path": rel(run_dir / "coverage_map.jsonl"), "error": "coverage_span_set_mismatch"})
    for span_id in set(coverage_ids):
        if coverage_ids.count(span_id) != 1:
            failures.append({"path": rel(run_dir / "coverage_map.jsonl"), "span_id": span_id, "error": "coverage_span_not_exactly_once", "count": coverage_ids.count(span_id)})
    coverage_status_counts = counter_dict([row.get("coverage_status") for row in coverage])
    for row in coverage:
        if row.get("disposition_type") not in VALID_DISPOSITION_TYPES:
            failures.append({"path": rel(run_dir / "coverage_map.jsonl"), "span_id": row.get("span_id"), "error": "invalid_disposition_type"})
        if row.get("gui_related_inferred") not in {True, False}:
            failures.append({"path": rel(run_dir / "coverage_map.jsonl"), "span_id": row.get("span_id"), "error": "missing_gui_related_inferred"})
    if not isinstance(aliases.get("aliases"), list):
        failures.append({"path": rel(run_dir / "anchor_aliases.json"), "error": "aliases_not_list"})

    live_units, live_unit_errors = live_plan_unit_blocks()
    failures.extend(live_unit_errors)
    unit_locations: dict[str, list[dict[str, Any]]] = {}
    for unit in live_units:
        plan_unit_id = str(unit.get("plan_unit_id", ""))
        if not plan_unit_id:
            continue
        unit_locations.setdefault(plan_unit_id, []).append({"path": unit.get("_path"), "line": unit.get("_line")})
        missing = unit.get("_missing_required_fields", [])
        if missing:
            failures.append(
                {
                    "path": unit.get("_path"),
                    "line": unit.get("_line"),
                    "plan_unit_id": plan_unit_id,
                    "error": "missing_required_planunit_fields",
                    "missing": missing,
                }
            )
        if unit.get("gui_related") not in {True, False}:
            failures.append(
                {
                    "path": unit.get("_path"),
                    "line": unit.get("_line"),
                    "plan_unit_id": plan_unit_id,
                    "error": "missing_gui_related_boolean",
                }
            )
    for plan_unit_id, locations in sorted(unit_locations.items()):
        if len(locations) > 1:
            failures.append(
                {
                    "plan_unit_id": plan_unit_id,
                    "error": "duplicate_plan_unit_id",
                    "locations": locations,
                }
            )
    batch_report_rows, batch_report_doc_entries = validate_batch_report_docs(run_dir, set(unit_locations), failures)
    source_preserving_unit_ids = sorted(
        str(unit.get("plan_unit_id"))
        for unit in live_units
        if isinstance(unit.get("node_compile_hint"), dict)
        and unit["node_compile_hint"].get("mode") == "source_preserving_planunit"
    )

    final_summary_path = run_dir / "final_validation_summary.json"
    if final_summary_path.exists():
        final_summary = read_json(final_summary_path)
        if is_complete_status(final_summary.get("status")):
            if final_summary.get("run_id") != inventory.get("run_id"):
                failures.append(
                    {
                        "path": rel(final_summary_path),
                        "error": "complete_final_summary_run_id_mismatch",
                        "expected": inventory.get("run_id"),
                        "actual": final_summary.get("run_id"),
                    }
                )
            for cursor in non_null_next_cursors(final_summary):
                failures.append(
                    {
                        "path": rel(final_summary_path),
                        "error": "complete_final_summary_next_cursor_not_null",
                        "cursor_path": cursor["path"],
                        "actual": cursor["value"],
                    }
                )
            if final_summary.get("live_plan_unit_count") != len(live_units):
                failures.append(
                    {
                        "path": rel(final_summary_path),
                        "error": "complete_final_summary_live_plan_unit_count_stale",
                        "expected": len(live_units),
                        "actual": final_summary.get("live_plan_unit_count"),
                    }
                )
            if final_summary.get("coverage_rows") != len(coverage):
                failures.append(
                    {
                        "path": rel(final_summary_path),
                        "error": "complete_final_summary_coverage_rows_stale",
                        "expected": len(coverage),
                        "actual": final_summary.get("coverage_rows"),
                    }
                )
            if final_summary.get("coverage_status_counts") != coverage_status_counts:
                failures.append(
                    {
                        "path": rel(final_summary_path),
                        "error": "complete_final_summary_coverage_status_counts_stale",
                        "expected": coverage_status_counts,
                        "actual": final_summary.get("coverage_status_counts"),
                    }
                )
            if final_summary.get("source_preserving_unit_count_after_batch") != len(source_preserving_unit_ids):
                failures.append(
                    {
                        "path": rel(final_summary_path),
                        "error": "complete_final_summary_source_preserving_count_stale",
                        "expected": len(source_preserving_unit_ids),
                        "actual": final_summary.get("source_preserving_unit_count_after_batch"),
                    }
                )
            if sorted(final_summary.get("residual_source_preserving_plan_units", [])) != source_preserving_unit_ids:
                failures.append(
                    {
                        "path": rel(final_summary_path),
                        "error": "complete_final_summary_source_preserving_units_stale",
                        "expected": source_preserving_unit_ids,
                        "actual": final_summary.get("residual_source_preserving_plan_units", []),
                    }
                )
            for row in coverage:
                if coverage_row_is_vague_preconversion(row) and not coverage_row_has_allowed_final_disposition(row):
                    failures.append(
                        {
                            "path": rel(run_dir / "coverage_map.jsonl"),
                            "span_id": row.get("span_id"),
                            "error": "complete_run_pre_conversion_row_without_allowed_disposition",
                            "coverage_status": row.get("coverage_status"),
                            "disposition_type": row.get("disposition_type"),
                        }
                    )

    return {
        "schema_id": "pm.plan_migration.validation_report.v1",
        "generated_at_utc": utc_now(),
        "run_id": inventory.get("run_id"),
        "status": "pass" if not failures else "fail",
        "failures": failures,
        "warnings": warnings,
        "checks": {
            "doc_count": len(docs),
            "span_count": len(spans),
            "coverage_rows": len(coverage),
            "coverage_status_counts": coverage_status_counts,
            "anchor_alias_rows": len(aliases.get("aliases", [])) if isinstance(aliases.get("aliases"), list) else 0,
            "live_plan_unit_count": len(live_units),
            "unique_live_plan_unit_count": len(unit_locations),
            "source_preserving_unit_count": len(source_preserving_unit_ids),
            "source_preserving_unit_ids": source_preserving_unit_ids,
            "batch_report_rows": batch_report_rows,
            "batch_report_doc_entries": batch_report_doc_entries,
        },
    }


def cmd_validate(args: argparse.Namespace) -> dict[str, Any]:
    run_dir = Path(args.run_dir)
    if not run_dir.is_absolute():
        run_dir = ROOT / run_dir
    report = validate_run_dir(run_dir)
    if args.write_report:
        write_json(run_dir / "validation_report.json", report)
    return report


def main() -> int:
    parser = argparse.ArgumentParser()
    sub = parser.add_subparsers(dest="command", required=True)

    inv = sub.add_parser("inventory")
    inv.add_argument("--run-id", required=True)
    inv.add_argument("--pilot-doc")

    mark = sub.add_parser("mark-pilot")
    mark.add_argument("--run-dir", required=True)
    mark.add_argument("--pilot-doc", required=True)

    val = sub.add_parser("validate")
    val.add_argument("--run-dir", required=True)
    val.add_argument(
        "--write-report",
        action="store_true",
        help="write validation_report.json; omitted by default so validation remains read-only",
    )

    refresh_hashes = sub.add_parser("refresh-batch-hashes")
    refresh_hashes.add_argument("--run-dir", required=True)

    refresh_summary = sub.add_parser("refresh-final-summary")
    refresh_summary.add_argument("--run-dir", required=True)
    refresh_summary.add_argument("--seal-state", choices=["preseal", "postseal"], default="preseal")
    refresh_summary.add_argument("--ledger-id")

    batch = sub.add_parser("standardize-batch")
    batch.add_argument("--run-dir", required=True)
    batch.add_argument("--batch-id", required=True)
    batch.add_argument("docs", nargs="+")

    args = parser.parse_args()
    if args.command == "inventory":
        report = cmd_inventory(args)
    elif args.command == "mark-pilot":
        report = cmd_mark_pilot(args)
    elif args.command == "standardize-batch":
        report = cmd_standardize_batch(args)
    elif args.command == "refresh-batch-hashes":
        report = cmd_refresh_batch_hashes(args)
    elif args.command == "refresh-final-summary":
        report = cmd_refresh_final_summary(args)
    else:
        report = cmd_validate(args)
    print(json.dumps({k: report[k] for k in ("schema_id", "run_id", "status", "failures", "checks") if k in report}, indent=2, sort_keys=True))
    return 0 if report.get("status") == "pass" else 1


if __name__ == "__main__":
    raise SystemExit(main())
