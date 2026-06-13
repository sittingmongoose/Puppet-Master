#!/usr/bin/env python3
"""Generate PlanUnit index and node-readiness artifacts.

This command reads live top-level ``Plans/*.md`` docs only. It intentionally
does not update Spec Lock, shards, evidence, plan_graph, auto_decisions,
WorkNodes, NodeSeeds, or executable build queues.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import re
from collections import Counter, defaultdict, deque
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

import yaml


ROOT = Path(__file__).resolve().parents[1]
PLANS = ROOT / "Plans"
INDEX_DIR = PLANS / ".plan_index"
MIGRATION_RUN = PLANS / ".plan_migration/pds-20260611-002-atomize-planunits"

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

PLAN_UNIT_FENCE_PATTERN = re.compile(r"```yaml\n(.*?)\n```", re.DOTALL)
HEADING_PATTERN = re.compile(r"^(#{1,6})\s*(.*?)\s*$")
NEW_PLAN_PROFILE_NORMALIZED = "**PlanProfile:** New Plan Authoring Profile"
NEW_PLAN_PROFILE_EXEMPT_PATTERN = re.compile(r"^\*\*PlanProfile:\*\* New Plan Authoring Profile \((?:Exempt|Exempted)")
REQUIRED_NEW_PLAN_BASE_HEADINGS = [
    "0. Scope",
    "1. Ownership And Consumers",
    "2. Canonical PlanUnits",
    "3. Contracts, Schemas, Events, Or Data Shapes",
    "4. Integration Surfaces",
    "5. Validation And Acceptance",
    "6. Plan-To-Node Readiness",
    "7. Deferred, Retired, Compatibility, And Non-Goals",
    "8. Source Lineage And Governance",
]


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


def sha256_file(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as f:
        for chunk in iter(lambda: f.read(1024 * 1024), b""):
            h.update(chunk)
    return h.hexdigest()


def read_json(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8"))


def read_jsonl(path: Path) -> list[dict[str, Any]]:
    rows: list[dict[str, Any]] = []
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


def write_json(path: Path, data: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(data, indent=2, sort_keys=True, ensure_ascii=False) + "\n", encoding="utf-8")


def write_jsonl(path: Path, rows: list[dict[str, Any]]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(
        "".join(json.dumps(row, sort_keys=True, ensure_ascii=False) + "\n" for row in rows),
        encoding="utf-8",
    )


def top_level_plan_docs() -> list[Path]:
    return sorted(PLANS.glob("*.md"), key=lambda path: path.name.lower())


def markdown_headings(text: str) -> list[dict[str, Any]]:
    headings: list[dict[str, Any]] = []
    fence: str | None = None
    for line_no, line in enumerate(text.splitlines(), 1):
        stripped = line.lstrip()
        if stripped.startswith("```") or stripped.startswith("~~~"):
            marker = stripped[:3]
            fence = None if fence == marker else marker
            continue
        if fence:
            continue
        match = HEADING_PATTERN.match(line)
        if match:
            headings.append({"line": line_no, "level": len(match.group(1)), "title": match.group(2).strip()})
    return headings


def authority_preamble_lines(text: str) -> list[str]:
    lines: list[str] = []
    fence: str | None = None
    for line in text.splitlines():
        stripped = line.lstrip()
        if stripped.startswith("```") or stripped.startswith("~~~"):
            marker = stripped[:3]
            fence = None if fence == marker else marker
            continue
        if fence:
            continue
        if stripped.startswith("## "):
            break
        lines.append(stripped.strip())
    return lines


def normalize_authority_line(line: str) -> str:
    return line[1:].strip() if line.startswith(">") else line.strip()


def declared_plan_profile(text: str) -> str:
    preamble = [normalize_authority_line(line) for line in authority_preamble_lines(text)]
    if any(NEW_PLAN_PROFILE_EXEMPT_PATTERN.match(line) for line in preamble):
        return "new_authoring_exempted"
    if NEW_PLAN_PROFILE_NORMALIZED in preamble:
        return "new_authoring"
    return "legacy_or_unspecified"


def validate_new_plan_authoring_profiles() -> tuple[list[dict[str, Any]], set[str]]:
    failures: list[dict[str, Any]] = []
    new_profile_docs: set[str] = set()

    for path in top_level_plan_docs():
        text = path.read_text(encoding="utf-8")
        profile = declared_plan_profile(text)
        if profile == "legacy_or_unspecified":
            continue

        path_ref = rel(path)
        preamble = [normalize_authority_line(line) for line in authority_preamble_lines(text)]
        if profile == "new_authoring_exempted":
            if not any(line.startswith("**Profile Exemption:**") for line in preamble):
                failures.append(
                    {
                        "path": path_ref,
                        "error": "new_plan_profile_exemption_missing_reason",
                    }
                )
            continue

        new_profile_docs.add(path_ref)
        if not any(line.startswith("**Compliance:**") for line in preamble):
            failures.append({"path": path_ref, "error": "new_plan_profile_missing_compliance_authority_note"})

        level_two_headings = [heading["title"] for heading in markdown_headings(text) if heading["level"] == 2]
        positions: list[int] = []
        for required in REQUIRED_NEW_PLAN_BASE_HEADINGS:
            try:
                positions.append(level_two_headings.index(required))
            except ValueError:
                failures.append({"path": path_ref, "error": "missing_new_plan_base_heading", "heading": required})
        if len(positions) == len(REQUIRED_NEW_PLAN_BASE_HEADINGS) and positions != sorted(positions):
            failures.append(
                {
                    "path": path_ref,
                    "error": "new_plan_base_headings_out_of_order",
                    "expected_order": REQUIRED_NEW_PLAN_BASE_HEADINGS,
                    "actual_level_two_headings": level_two_headings,
                }
            )

    return failures, new_profile_docs


def doc_title(path: Path, headings: list[dict[str, Any]]) -> str:
    for heading in headings:
        if heading["level"] == 1:
            return str(heading["title"] or path.stem)
    return path.stem


def heading_for_line(headings: list[dict[str, Any]], line_no: int) -> dict[str, Any] | None:
    current: dict[str, Any] | None = None
    for heading in headings:
        if heading["line"] > line_no:
            break
        current = heading
    return current


def as_list(value: Any) -> list[Any]:
    if value is None:
        return []
    if isinstance(value, list):
        return value
    return [value]


def normalize_unit(raw_unit: dict[str, Any], path: Path, line_no: int, headings: list[dict[str, Any]]) -> dict[str, Any]:
    heading = heading_for_line(headings, line_no)
    row = dict(raw_unit)
    source_location = {
        "path": rel(path),
        "line": line_no,
        "heading": heading["title"] if heading else None,
        "heading_level": heading["level"] if heading else None,
        "heading_line": heading["line"] if heading else None,
    }
    row.update(
        {
            "schema_id": "pm.plan_index.plan_unit.v1",
            "source_location": source_location,
            "source_doc_sha256": sha256_file(path),
        }
    )
    return row


def extract_plan_units() -> tuple[list[dict[str, Any]], list[dict[str, Any]], list[dict[str, Any]]]:
    units: list[dict[str, Any]] = []
    errors: list[dict[str, Any]] = []
    docs: list[dict[str, Any]] = []

    for path in top_level_plan_docs():
        text = path.read_text(encoding="utf-8")
        headings = markdown_headings(text)
        doc_units: list[dict[str, Any]] = []
        for match in PLAN_UNIT_FENCE_PATTERN.finditer(text):
            block = match.group(1)
            if "plan_unit_id:" not in block:
                continue
            line_no = text[: match.start()].count("\n") + 1
            try:
                data = yaml.load(block, Loader=UniqueKeySafeLoader)
            except Exception as exc:  # noqa: BLE001 - validator reports exact source.
                errors.append({"path": rel(path), "line": line_no, "error": "plan_unit_yaml_parse_error", "detail": str(exc)})
                continue
            if not isinstance(data, dict) or not data.get("plan_unit_id"):
                errors.append({"path": rel(path), "line": line_no, "error": "plan_unit_block_not_mapping"})
                continue
            unit = normalize_unit(data, path, line_no, headings)
            doc_units.append(unit)
            units.append(unit)

        docs.append(
            {
                "path": rel(path),
                "title": doc_title(path, headings),
                "sha256": sha256_file(path),
                "line_count": len(text.splitlines()),
                "heading_count": len(headings),
                "plan_unit_ids": [str(unit.get("plan_unit_id", "")) for unit in doc_units],
            }
        )
    return units, errors, docs


def unit_id(unit: dict[str, Any]) -> str:
    return str(unit.get("plan_unit_id", ""))


def counter_dict(values: list[Any]) -> dict[str, int]:
    return dict(sorted(Counter(str(value) for value in values).items()))


def collect_validation_issues(units: list[dict[str, Any]], parse_errors: list[dict[str, Any]], docs: list[dict[str, Any]]) -> dict[str, Any]:
    issues: dict[str, Any] = {
        "parse_errors": list(parse_errors),
        "duplicate_plan_unit_ids": [],
        "missing_required_metadata": [],
        "missing_gui_related_boolean": [],
        "owner_doc_mismatches": [],
        "docs_without_plan_units": [doc["path"] for doc in docs if not doc["plan_unit_ids"]],
    }

    locations: dict[str, list[dict[str, Any]]] = defaultdict(list)
    for unit in units:
        uid = unit_id(unit)
        locations[uid].append(unit["source_location"])
        missing = sorted(PLAN_UNIT_REQUIRED_FIELDS - set(unit))
        if missing:
            issues["missing_required_metadata"].append(
                {"plan_unit_id": uid, "source_location": unit["source_location"], "missing_fields": missing}
            )
        if unit.get("gui_related") not in {True, False}:
            issues["missing_gui_related_boolean"].append({"plan_unit_id": uid, "source_location": unit["source_location"]})
        owner_doc = unit.get("owner_doc")
        if isinstance(owner_doc, str) and owner_doc.startswith("Plans/") and owner_doc != unit["source_location"]["path"]:
            issues["owner_doc_mismatches"].append(
                {
                    "plan_unit_id": uid,
                    "owner_doc": owner_doc,
                    "source_path": unit["source_location"]["path"],
                }
            )

    for uid, locs in sorted(locations.items()):
        if uid and len(locs) > 1:
            issues["duplicate_plan_unit_ids"].append({"plan_unit_id": uid, "locations": locs})
    return issues


def dependency_graph(units: list[dict[str, Any]]) -> dict[str, Any]:
    ids = {unit_id(unit) for unit in units}
    edges: list[dict[str, Any]] = []
    unresolved: list[dict[str, Any]] = []
    dependents: dict[str, set[str]] = {uid: set() for uid in ids}
    incoming: dict[str, set[str]] = {uid: set() for uid in ids}

    for unit in units:
        uid = unit_id(unit)
        for dep in map(str, as_list(unit.get("depends_on"))):
            edges.append({"edge_type": "depends_on", "from": uid, "to": dep})
            if dep not in ids:
                unresolved.append({"plan_unit_id": uid, "field": "depends_on", "target": dep})
                continue
            incoming[uid].add(dep)
            dependents[dep].add(uid)
        for target in map(str, as_list(unit.get("unblocks"))):
            edges.append({"edge_type": "unblocks", "from": uid, "to": target})
            if target not in ids:
                unresolved.append({"plan_unit_id": uid, "field": "unblocks", "target": target})

    queue = deque(sorted(uid for uid in ids if not incoming[uid]))
    build_order: list[str] = []
    incoming_work = {uid: set(values) for uid, values in incoming.items()}
    while queue:
        uid = queue.popleft()
        build_order.append(uid)
        for dependent in sorted(dependents[uid]):
            incoming_work[dependent].discard(uid)
            if not incoming_work[dependent]:
                queue.append(dependent)

    cycle_blockers = [{"plan_unit_id": uid, "remaining_depends_on": sorted(deps)} for uid, deps in sorted(incoming_work.items()) if deps]
    nodes = [
        {
            "plan_unit_id": unit_id(unit),
            "owner_doc": unit.get("owner_doc"),
            "status": unit.get("status"),
            "unit_type": unit.get("unit_type"),
            "risk_class": unit.get("risk_class"),
            "reasoning_tier": unit.get("reasoning_tier"),
            "context_scope": unit.get("context_scope"),
            "gui_related": unit.get("gui_related"),
            "source_location": unit.get("source_location"),
        }
        for unit in units
    ]
    return {
        "schema_id": "pm.plan_index.dependencies.v1",
        "generated_at_utc": utc_now(),
        "source_plan_unit_index": "Plans/.plan_index/plan_units.jsonl",
        "summary": {
            "node_count": len(nodes),
            "edge_count": len(edges),
            "depends_on_edge_count": sum(1 for edge in edges if edge["edge_type"] == "depends_on"),
            "unblocks_edge_count": sum(1 for edge in edges if edge["edge_type"] == "unblocks"),
            "unresolved_reference_count": len(unresolved),
            "cycle_blocker_count": len(cycle_blockers),
            "build_order_available": not unresolved and not cycle_blockers,
        },
        "nodes": sorted(nodes, key=lambda row: row["plan_unit_id"]),
        "edges": sorted(edges, key=lambda row: (row["edge_type"], row["from"], row["to"])),
        "unresolved_references": unresolved,
        "cycle_blockers": cycle_blockers,
        "build_order": build_order if not cycle_blockers else [],
    }


def doc_cards(units: list[dict[str, Any]], docs: list[dict[str, Any]]) -> dict[str, Any]:
    by_doc: dict[str, list[dict[str, Any]]] = defaultdict(list)
    for unit in units:
        by_doc[unit["source_location"]["path"]].append(unit)

    cards = []
    for doc in docs:
        doc_units = by_doc.get(doc["path"], [])
        validation_surfaces = sorted({str(item) for unit in doc_units for item in as_list(unit.get("validation_surfaces"))})
        implementation_surfaces = sorted({str(item) for unit in doc_units for item in as_list(unit.get("implementation_surfaces"))})
        cards.append(
            {
                **doc,
                "plan_unit_count": len(doc_units),
                "all_planunits_have_gui_related": all(unit.get("gui_related") in {True, False} for unit in doc_units),
                "gui_related_counts": counter_dict([unit.get("gui_related") for unit in doc_units]),
                "status_counts": counter_dict([unit.get("status") for unit in doc_units]),
                "unit_type_counts": counter_dict([unit.get("unit_type") for unit in doc_units]),
                "risk_classes": sorted({str(unit.get("risk_class")) for unit in doc_units}),
                "reasoning_tiers": sorted({str(unit.get("reasoning_tier")) for unit in doc_units}),
                "validation_surfaces": validation_surfaces,
                "implementation_surfaces": implementation_surfaces,
                "source_preserving_unit_ids": [
                    unit_id(unit)
                    for unit in doc_units
                    if isinstance(unit.get("node_compile_hint"), dict)
                    and unit["node_compile_hint"].get("mode") == "source_preserving_planunit"
                ],
            }
        )

    return {
        "schema_id": "pm.plan_index.doc_cards.v1",
        "generated_at_utc": utc_now(),
        "source_scope": "top-level live Plans/*.md; excludes ledgers, generated shards, evidence, and pipeline artifacts",
        "summary": {
            "doc_count": len(docs),
            "docs_with_plan_units": sum(1 for doc in docs if doc["plan_unit_ids"]),
            "docs_without_plan_units": sum(1 for doc in docs if not doc["plan_unit_ids"]),
            "plan_unit_count": len(units),
            "gui_related_counts": counter_dict([unit.get("gui_related") for unit in units]),
            "status_counts": counter_dict([unit.get("status") for unit in units]),
            "unit_type_counts": counter_dict([unit.get("unit_type") for unit in units]),
            "source_preserving_unit_count": sum(
                1
                for unit in units
                if isinstance(unit.get("node_compile_hint"), dict)
                and unit["node_compile_hint"].get("mode") == "source_preserving_planunit"
            ),
        },
        "docs": cards,
    }


def acceptance_units(units: list[dict[str, Any]]) -> list[dict[str, Any]]:
    rows: list[dict[str, Any]] = []
    for unit in sorted(units, key=unit_id):
        criteria = as_list(unit.get("acceptance_criteria"))
        for index, criterion in enumerate(criteria, 1):
            rows.append(
                {
                    "schema_id": "pm.plan_index.acceptance_unit.v1",
                    "acceptance_unit_id": f"{unit_id(unit)}-A{index:03d}",
                    "plan_unit_id": unit_id(unit),
                    "owner_doc": unit.get("owner_doc"),
                    "criterion_index": index,
                    "criterion": str(criterion),
                    "gui_related": unit.get("gui_related"),
                    "risk_class": unit.get("risk_class"),
                    "reasoning_tier": unit.get("reasoning_tier"),
                    "context_scope": unit.get("context_scope"),
                    "validation_surfaces": as_list(unit.get("validation_surfaces")),
                    "implementation_surfaces": as_list(unit.get("implementation_surfaces")),
                    "source_location": unit.get("source_location"),
                }
            )
    return rows


def migration_summary() -> dict[str, Any]:
    summary: dict[str, Any] = {
        "run_dir": rel(MIGRATION_RUN),
        "run_id": MIGRATION_RUN.name,
        "available": MIGRATION_RUN.exists(),
    }
    if not MIGRATION_RUN.exists():
        summary["status"] = "missing"
        return summary

    validation_path = MIGRATION_RUN / "validation_report.json"
    final_summary_path = MIGRATION_RUN / "final_validation_summary.json"
    coverage_path = MIGRATION_RUN / "coverage_map.jsonl"
    if validation_path.exists():
        validation = read_json(validation_path)
        summary["run_id"] = validation.get("run_id", summary["run_id"])
        summary["validation_status"] = validation.get("status")
        summary["validation_failures"] = validation.get("failures", [])
        summary["checks"] = validation.get("checks", {})
    if final_summary_path.exists():
        final_summary = read_json(final_summary_path)
        summary["final_status"] = final_summary.get("status")
        summary["next_batch_cursor"] = final_summary.get("next_batch_cursor")
        summary["live_plan_unit_count"] = final_summary.get("live_plan_unit_count")
        summary["source_preserving_unit_count_after_batch"] = final_summary.get("source_preserving_unit_count_after_batch")
        summary["residual_source_preserving_plan_units"] = final_summary.get("residual_source_preserving_plan_units", [])
        summary["source_lineage_residual_plan_units"] = final_summary.get("source_lineage_residual_plan_units", [])
        summary["allowed_residuals"] = final_summary.get("allowed_residuals", [])
        summary["standard_run_gates_status"] = final_summary.get("standard_run_gates_status")
        summary["standard_run_gates_expected_seal_failures"] = final_summary.get("standard_run_gates_expected_seal_failures", [])
        summary["shard_check_status"] = final_summary.get("shard_check_status")
        summary["shard_failure_count"] = final_summary.get("shard_failure_count")
        summary["seal_phase_required"] = final_summary.get("seal_phase_required", [])
        summary["worknodes_created"] = final_summary.get("worknodes_created")
        summary["nodeseeds_created"] = final_summary.get("nodeseeds_created")
    if coverage_path.exists():
        rows = read_jsonl(coverage_path)
        summary["coverage_rows"] = len(rows)
        summary["coverage_status_counts"] = counter_dict([row.get("coverage_status") for row in rows])
        summary["coverage_span_ids_unique"] = len({str(row.get("span_id")) for row in rows}) == len(rows)
    return summary


def coverage_report(units: list[dict[str, Any]], docs: list[dict[str, Any]], issues: dict[str, Any], deps: dict[str, Any]) -> dict[str, Any]:
    field_coverage = {}
    for field in sorted(PLAN_UNIT_REQUIRED_FIELDS):
        present = 0
        for unit in units:
            if field not in unit:
                continue
            value = unit.get(field)
            if value is None or value == "":
                continue
            present += 1
        field_coverage[field] = present
    blockers: list[dict[str, Any]] = []
    for issue_key in [
        "parse_errors",
        "duplicate_plan_unit_ids",
        "missing_required_metadata",
        "missing_gui_related_boolean",
        "docs_without_plan_units",
    ]:
        issue_value = issues.get(issue_key, [])
        if issue_value:
            blockers.append({"blocker_type": issue_key, "items": issue_value})
    if deps["unresolved_references"]:
        blockers.append({"blocker_type": "unresolved_dependency_references", "items": deps["unresolved_references"]})

    migration = migration_summary()
    if migration.get("validation_status") not in {None, "pass"}:
        blockers.append({"blocker_type": "migration_validation_failures", "items": migration.get("validation_failures", [])})
    if migration.get("available") is False:
        blockers.append({"blocker_type": "missing_migration_run", "items": [migration.get("run_dir")]})

    return {
        "schema_id": "pm.plan_index.coverage_report.v1",
        "generated_at_utc": utc_now(),
        "source_scope": "top-level live Plans/*.md PlanUnit YAML fences",
        "status": "pass" if not blockers else "fail",
        "blockers": blockers,
        "summary": {
            "doc_count": len(docs),
            "docs_with_plan_units": sum(1 for doc in docs if doc["plan_unit_ids"]),
            "docs_without_plan_units": sum(1 for doc in docs if not doc["plan_unit_ids"]),
            "plan_unit_count": len(units),
            "unique_plan_unit_count": len({unit_id(unit) for unit in units}),
            "parse_error_count": len(issues.get("parse_errors", [])),
            "missing_required_metadata_count": len(issues.get("missing_required_metadata", [])),
            "missing_gui_related_boolean_count": len(issues.get("missing_gui_related_boolean", [])),
            "duplicate_plan_unit_id_count": len(issues.get("duplicate_plan_unit_ids", [])),
            "unresolved_dependency_reference_count": len(deps.get("unresolved_references", [])),
            "cycle_blocker_count": len(deps.get("cycle_blockers", [])),
        },
        "field_coverage": field_coverage,
        "issues": issues,
        "migration_coverage": migration,
        "notes": [
            "Governance seal artifacts are intentionally not updated by PlanUnit indexing.",
            "Expected seal-phase gate failures are recorded in migration_coverage when present.",
            "No WorkNodes, NodeSeeds, executable build tasks, or final node queues are generated by this report.",
        ],
    }


def compiler_contract_status(units: list[dict[str, Any]]) -> dict[str, Any]:
    pnc_007 = next((unit for unit in units if unit_id(unit) == "PNC-007"), None)
    pnc_008 = next((unit for unit in units if unit_id(unit) == "PNC-008"), None)
    blockers: list[dict[str, Any]] = []
    if pnc_007 and pnc_007.get("status") == "deferred":
        blockers.append(
            {
                "plan_unit_id": "PNC-007",
                "blocker": "compiler_algorithm_deferred",
                "source_location": pnc_007.get("source_location"),
                "canonical_text": pnc_007.get("canonical_text"),
            }
        )
    blockers.append(
        {
            "owner_doc": "Plans/Plan_To_Node_Compilation.md",
            "blocker": "nodeseed_candidate_contract_absent",
            "evidence": "PNC-001 and PNC-008 forbid NodeSeed candidates until this owner doc defines that artifact contract.",
            "source_location": pnc_008.get("source_location") if pnc_008 else None,
        }
    )
    return {
        "complete": False,
        "owner_doc": "Plans/Plan_To_Node_Compilation.md",
        "status": "blocked_compiler_contract_incomplete",
        "blockers": blockers,
    }


def node_readiness_report(
    units: list[dict[str, Any]],
    coverage: dict[str, Any],
    deps: dict[str, Any],
) -> dict[str, Any]:
    coverage_blocked = bool(coverage.get("blockers"))
    compiler_status = compiler_contract_status(units)
    status = "blocked_plans_incomplete" if coverage_blocked else "blocked_compiler_contract_incomplete"
    status_reason = (
        "PlanUnit coverage or required metadata is incomplete; see missing_required_metadata and coverage_report blockers."
        if coverage_blocked
        else "Plans are indexed with required PlanUnit metadata, but Plan_To_Node_Compilation.md deliberately defers the compiler algorithm and does not define a NodeSeed candidate contract."
    )
    build_order_blockers = []
    if deps.get("unresolved_references"):
        build_order_blockers.append({"blocker_type": "unresolved_dependency_references", "items": deps["unresolved_references"]})
    if deps.get("cycle_blockers"):
        build_order_blockers.append({"blocker_type": "dependency_cycles", "items": deps["cycle_blockers"]})

    gui_units = [
        {
            "plan_unit_id": unit_id(unit),
            "owner_doc": unit.get("owner_doc"),
            "source_location": unit.get("source_location"),
        }
        for unit in units
        if unit.get("gui_related") is True
    ]
    source_preserving_units = [
        {
            "plan_unit_id": unit_id(unit),
            "owner_doc": unit.get("owner_doc"),
            "split_recommended": unit.get("split_recommended", False),
            "source_location": unit.get("source_location"),
        }
        for unit in units
        if isinstance(unit.get("node_compile_hint"), dict)
        and unit["node_compile_hint"].get("mode") == "source_preserving_planunit"
    ]

    return {
        "schema_id": "pm.plan_index.node_readiness_report.v1",
        "generated_at_utc": utc_now(),
        "status": status,
        "status_reason": status_reason,
        "source_plan_unit_index": "Plans/.plan_index/plan_units.jsonl",
        "plan_unit_count": len(units),
        "missing_required_metadata": coverage.get("issues", {}).get("missing_required_metadata", []),
        "dependency_graph_summary": deps.get("summary", {}),
        "build_order_blockers": build_order_blockers,
        "risk_and_reasoning_summary": {
            "risk_class_counts": counter_dict([unit.get("risk_class") for unit in units]),
            "reasoning_tier_counts": counter_dict([unit.get("reasoning_tier") for unit in units]),
            "status_counts": counter_dict([unit.get("status") for unit in units]),
            "unit_type_counts": counter_dict([unit.get("unit_type") for unit in units]),
            "source_preserving_unit_count": len(source_preserving_units),
            "source_preserving_units": source_preserving_units,
        },
        "gui_related_units": {
            "count": len(gui_units),
            "units": gui_units,
        },
        "compiler_contract_status": compiler_status,
        "no_worknodes_created": True,
        "no_executable_build_tasks_created": True,
        "no_final_node_queues_created": True,
        "nodeseed_candidates_created": False,
        "next_required_action": (
            "Complete the Plan_To_Node_Compilation.md compiler algorithm and explicit NodeSeed candidate contract in a future design phase before generating NodeSeeds, WorkNodes, executable tasks, or final node queues. Run the separate governance seal after index artifacts stop changing."
        ),
    }


def generate() -> dict[str, Any]:
    generated_at = utc_now()
    units, parse_errors, docs = extract_plan_units()
    units = sorted(units, key=unit_id)
    issues = collect_validation_issues(units, parse_errors, docs)
    deps = dependency_graph(units)
    docs_payload = doc_cards(units, docs)
    accepts = acceptance_units(units)
    coverage = coverage_report(units, docs, issues, deps)
    readiness = node_readiness_report(units, coverage, deps)

    write_jsonl(INDEX_DIR / "plan_units.jsonl", units)
    write_json(INDEX_DIR / "doc_cards.json", docs_payload)
    write_json(INDEX_DIR / "dependencies.json", deps)
    write_jsonl(INDEX_DIR / "acceptance_units.jsonl", accepts)
    write_json(INDEX_DIR / "coverage_report.json", coverage)
    write_json(INDEX_DIR / "node_readiness_report.json", readiness)

    return {
        "schema_id": "pm.plan_index.generate_report.v1",
        "generated_at_utc": generated_at,
        "status": "pass" if coverage["status"] == "pass" else "fail",
        "outputs": [
            "Plans/.plan_index/plan_units.jsonl",
            "Plans/.plan_index/doc_cards.json",
            "Plans/.plan_index/dependencies.json",
            "Plans/.plan_index/acceptance_units.jsonl",
            "Plans/.plan_index/coverage_report.json",
            "Plans/.plan_index/node_readiness_report.json",
        ],
        "summary": {
            "doc_count": len(docs),
            "plan_unit_count": len(units),
            "acceptance_unit_count": len(accepts),
            "coverage_status": coverage["status"],
            "node_readiness_status": readiness["status"],
            "no_worknodes_created": readiness["no_worknodes_created"],
            "nodeseed_candidates_created": readiness["nodeseed_candidates_created"],
        },
        "blockers": coverage["blockers"],
    }


def validate() -> dict[str, Any]:
    failures: list[dict[str, Any]] = []
    required = [
        "plan_units.jsonl",
        "doc_cards.json",
        "dependencies.json",
        "acceptance_units.jsonl",
        "coverage_report.json",
        "node_readiness_report.json",
    ]
    for name in required:
        path = INDEX_DIR / name
        if not path.exists():
            failures.append({"path": rel(path), "error": "missing_required_index_artifact"})

    if failures:
        return {"schema_id": "pm.plan_index.validation_report.v1", "status": "fail", "failures": failures}

    plan_units = read_jsonl(INDEX_DIR / "plan_units.jsonl")
    acceptance = read_jsonl(INDEX_DIR / "acceptance_units.jsonl")
    docs = read_json(INDEX_DIR / "doc_cards.json")
    deps = read_json(INDEX_DIR / "dependencies.json")
    coverage = read_json(INDEX_DIR / "coverage_report.json")
    readiness = read_json(INDEX_DIR / "node_readiness_report.json")
    live_units, live_parse_errors, live_docs = extract_plan_units()
    profile_failures, new_profile_docs = validate_new_plan_authoring_profiles()
    failures.extend(profile_failures)
    live_ids = sorted(unit_id(unit) for unit in live_units)
    index_ids = sorted(unit_id(unit) for unit in plan_units)

    if live_parse_errors:
        failures.append({"path": "Plans/*.md", "error": "live_planunit_parse_errors", "items": live_parse_errors})
    for unit in live_units:
        source_path = unit.get("source_location", {}).get("path")
        node_hint = unit.get("node_compile_hint")
        if (
            source_path in new_profile_docs
            and isinstance(node_hint, dict)
            and node_hint.get("mode") == "source_preserving_planunit"
        ):
            failures.append(
                {
                    "path": source_path,
                    "plan_unit_id": unit_id(unit),
                    "error": "new_plan_profile_uses_source_preserving_planunit",
                }
            )
    if index_ids != live_ids:
        failures.append({"path": "Plans/.plan_index/plan_units.jsonl", "error": "plan_unit_ids_do_not_match_live_plans"})
    if len(set(index_ids)) != len(index_ids):
        failures.append({"path": "Plans/.plan_index/plan_units.jsonl", "error": "duplicate_plan_unit_id"})
    for row_index, unit in enumerate(plan_units, 1):
        missing = sorted(PLAN_UNIT_REQUIRED_FIELDS - set(unit))
        if missing:
            failures.append(
                {
                    "path": "Plans/.plan_index/plan_units.jsonl",
                    "row": row_index,
                    "plan_unit_id": unit_id(unit),
                    "error": "missing_required_metadata",
                    "missing": missing,
                }
            )
        if unit.get("gui_related") not in {True, False}:
            failures.append(
                {
                    "path": "Plans/.plan_index/plan_units.jsonl",
                    "row": row_index,
                    "plan_unit_id": unit_id(unit),
                    "error": "gui_related_not_boolean",
                }
            )

    if docs.get("summary", {}).get("doc_count") != len(live_docs):
        failures.append({"path": "Plans/.plan_index/doc_cards.json", "error": "doc_count_mismatch"})
    if deps.get("summary", {}).get("unresolved_reference_count") != 0:
        failures.append({"path": "Plans/.plan_index/dependencies.json", "error": "unresolved_dependency_references"})
    if coverage.get("summary", {}).get("plan_unit_count") != len(plan_units):
        failures.append({"path": "Plans/.plan_index/coverage_report.json", "error": "coverage_plan_unit_count_mismatch"})
    migration = coverage.get("migration_coverage", {})
    expected_run_dir = rel(MIGRATION_RUN)
    if migration.get("run_dir") != expected_run_dir:
        failures.append(
            {
                "path": "Plans/.plan_index/coverage_report.json",
                "error": "coverage_migration_run_dir_stale",
                "expected": expected_run_dir,
                "actual": migration.get("run_dir"),
            }
        )
    if migration.get("run_id") != MIGRATION_RUN.name:
        failures.append(
            {
                "path": "Plans/.plan_index/coverage_report.json",
                "error": "coverage_migration_run_id_stale",
                "expected": MIGRATION_RUN.name,
                "actual": migration.get("run_id"),
            }
        )
    migration_checks = migration.get("checks", {})
    if migration_checks.get("live_plan_unit_count") not in {None, len(plan_units)}:
        failures.append(
            {
                "path": "Plans/.plan_index/coverage_report.json",
                "error": "coverage_migration_live_plan_unit_count_stale",
                "expected": len(plan_units),
                "actual": migration_checks.get("live_plan_unit_count"),
            }
        )
    coverage_map_path = MIGRATION_RUN / "coverage_map.jsonl"
    if coverage_map_path.exists() and migration.get("coverage_rows") not in {None, len(read_jsonl(coverage_map_path))}:
        failures.append(
            {
                "path": "Plans/.plan_index/coverage_report.json",
                "error": "coverage_migration_row_count_stale",
                "expected": len(read_jsonl(coverage_map_path)),
                "actual": migration.get("coverage_rows"),
            }
        )
    if str(migration.get("final_status", "")).upper() == "COMPLETE":
        if migration.get("next_batch_cursor") is not None:
            failures.append(
                {
                    "path": "Plans/.plan_index/coverage_report.json",
                    "error": "complete_migration_next_batch_cursor_not_null",
                    "actual": migration.get("next_batch_cursor"),
                }
            )
        if migration.get("coverage_status_counts", {}).get("pre_conversion_preserved_in_place", 0):
            failures.append(
                {
                    "path": "Plans/.plan_index/coverage_report.json",
                    "error": "complete_migration_pre_conversion_rows_present",
                    "count": migration["coverage_status_counts"]["pre_conversion_preserved_in_place"],
                }
            )
        if migration.get("live_plan_unit_count") not in {None, len(plan_units)}:
            failures.append(
                {
                    "path": "Plans/.plan_index/coverage_report.json",
                    "error": "complete_migration_final_summary_plan_unit_count_stale",
                    "expected": len(plan_units),
                    "actual": migration.get("live_plan_unit_count"),
                }
            )
    if readiness.get("source_plan_unit_index") != "Plans/.plan_index/plan_units.jsonl":
        failures.append({"path": "Plans/.plan_index/node_readiness_report.json", "error": "bad_source_plan_unit_index"})
    if readiness.get("no_worknodes_created") is not True:
        failures.append({"path": "Plans/.plan_index/node_readiness_report.json", "error": "no_worknodes_created_not_true"})
    if readiness.get("nodeseed_candidates_created") is not False:
        failures.append({"path": "Plans/.plan_index/node_readiness_report.json", "error": "nodeseed_candidates_created_not_false"})
    if len(acceptance) != sum(len(as_list(unit.get("acceptance_criteria"))) for unit in plan_units):
        failures.append({"path": "Plans/.plan_index/acceptance_units.jsonl", "error": "acceptance_unit_count_mismatch"})

    return {
        "schema_id": "pm.plan_index.validation_report.v1",
        "generated_at_utc": utc_now(),
        "status": "pass" if not failures else "fail",
        "failures": failures,
        "summary": {
            "plan_unit_count": len(plan_units),
            "acceptance_unit_count": len(acceptance),
            "coverage_status": coverage.get("status"),
            "node_readiness_status": readiness.get("status"),
        },
    }


def main() -> int:
    parser = argparse.ArgumentParser()
    sub = parser.add_subparsers(dest="command", required=True)
    sub.add_parser("generate")
    sub.add_parser("validate")
    args = parser.parse_args()

    if args.command == "generate":
        report = generate()
    else:
        report = validate()
    print(json.dumps(report, indent=2, sort_keys=True, ensure_ascii=False))
    return 0 if report.get("status") == "pass" else 1


if __name__ == "__main__":
    raise SystemExit(main())
