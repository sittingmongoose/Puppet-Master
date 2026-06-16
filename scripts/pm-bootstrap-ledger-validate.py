#!/usr/bin/env python3
"""Validate PM Bootstrap Planning Ledger v2 compact state and Plan compile seal."""
from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path, PurePosixPath
from typing import Any

import yaml


ROOT = Path(__file__).resolve().parents[1]
PLANS = ROOT / "Plans"



class UniqueKeySafeLoader(yaml.SafeLoader):
    """Safe YAML loader that rejects duplicate mapping keys in PlanUnit blocks."""


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


def rel(path: Path) -> str:
    try:
        return path.resolve().relative_to(ROOT).as_posix()
    except ValueError:
        return path.as_posix()


def exact_path(ref: str) -> tuple[Path | None, dict[str, Any] | None]:
    if not ref or any(token in ref for token in "*?[]"):
        return ROOT / ref, None
    posix = PurePosixPath(ref)
    if posix.is_absolute():
        return None, {"path": ref, "error": "absolute_ref_not_allowed"}

    current = ROOT
    resolved_parts: list[str] = []
    for part in posix.parts:
        if part in {"", "."}:
            continue
        if part == "..":
            return None, {"path": ref, "error": "parent_ref_not_allowed"}
        if not current.exists():
            return None, {"path": ref, "error": "missing_parent", "parent": "/".join(resolved_parts)}
        try:
            children = {child.name: child for child in current.iterdir()}
        except NotADirectoryError:
            return None, {"path": ref, "error": "parent_not_directory", "parent": "/".join(resolved_parts)}
        if part not in children:
            case_matches = [child.name for child in children.values() if child.name.lower() == part.lower()]
            if case_matches:
                return None, {
                    "path": ref,
                    "error": "case_mismatched_ref",
                    "actual": "/".join(resolved_parts + [case_matches[0]]),
                }
            return None, {"path": ref, "error": "missing_ref"}
        current = children[part]
        resolved_parts.append(part)
    return current, None


def load_json(path: Path) -> Any:
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except Exception as exc:  # noqa: BLE001 - report exact validator path.
        raise SystemExit(f"INVALID JSON: {path}: {exc}")


def load_jsonl(path: Path) -> list[dict[str, Any]]:
    rows: list[dict[str, Any]] = []
    if not path.exists():
        raise SystemExit(f"MISSING: {path}")
    for line_no, line in enumerate(path.read_text(encoding="utf-8").splitlines(), 1):
        if not line.strip():
            continue
        try:
            row = json.loads(line)
        except Exception as exc:  # noqa: BLE001 - report exact line.
            raise SystemExit(f"INVALID JSONL: {path}:{line_no}: {exc}")
        if not isinstance(row, dict):
            raise SystemExit(f"INVALID JSONL: {path}:{line_no}: row is not an object")
        rows.append(row)
    return rows


def count_by(rows: list[dict[str, Any]], key: str) -> dict[str, int]:
    counts: dict[str, int] = {}
    for row in rows:
        value = str(row.get(key, ""))
        counts[value] = counts.get(value, 0) + 1
    return counts


def schema_enum(schema: dict[str, Any], field: str) -> set[str]:
    values = schema.get("properties", {}).get(field, {}).get("enum", [])
    return {str(value) for value in values}


def contains_stale_governance_pending(value: Any) -> bool:
    text = json.dumps(value, sort_keys=True) if not isinstance(value, str) else value
    lowered = text.lower()
    return (
        "pending_governance" in lowered
        or "pending governance" in lowered
        or "pending_seal" in lowered
        or "pending seal" in lowered
    )


def extract_plan_unit_blocks(path: Path) -> list[dict[str, Any]]:
    text = path.read_text(encoding="utf-8")
    units: list[dict[str, Any]] = []
    for match in re.finditer(r"```yaml\n(.*?)\n```", text, flags=re.DOTALL):
        block = match.group(1)
        if "plan_unit_id:" not in block:
            continue
        try:
            data = yaml.load(block, Loader=UniqueKeySafeLoader)
        except Exception as exc:  # noqa: BLE001 - include snippet location.
            units.append(
                {
                    "_parse_error": str(exc),
                    "_path": rel(path),
                    "_line": text[: match.start()].count("\n") + 1,
                }
            )
            continue
        if isinstance(data, dict) and data.get("plan_unit_id"):
            data["_path"] = rel(path)
            data["_line"] = text[: match.start()].count("\n") + 1
            units.append(data)
    return units


def validate_record_stream(
    lid: str,
    rows: list[dict[str, Any]],
    kind: str,
    id_field: str,
    errors: list[str],
) -> set[str]:
    seen: set[str] = set()
    for row in rows:
        rid = row.get(id_field)
        if row.get("ledger_id") != lid:
            errors.append(f"{kind} wrong ledger_id: {rid}")
        if not rid:
            errors.append(f"{kind} missing {id_field}")
            continue
        if rid in seen:
            errors.append(f"duplicate {kind} id {rid}")
        seen.add(str(rid))
    return seen


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("ledger_dir", help="Plans/ledgers/v2/<ledger_id>")
    args = parser.parse_args()

    ledger_dir = Path(args.ledger_dir)
    if not ledger_dir.is_absolute():
        ledger_dir = ROOT / ledger_dir

    errors: list[str] = []
    warnings: list[str] = []
    required_paths = [
        ledger_dir / "manifest.json",
        ledger_dir / "events.jsonl",
        ledger_dir / "records/design_atoms.jsonl",
        ledger_dir / "records/decisions.jsonl",
        ledger_dir / "records/questions.jsonl",
        ledger_dir / "records/blockers.jsonl",
        ledger_dir / "records/corrections.jsonl",
        ledger_dir / "state/current.json",
        ledger_dir / "state/handoff.json",
        ledger_dir / "state/open_items.json",
        ledger_dir / "state/compile_queue.json",
        ledger_dir / "state/operating_capsule.json",
        ledger_dir / "validation/ledger_health.json",
    ]
    for path in required_paths:
        if not path.exists():
            errors.append(f"missing {rel(path)}")
    if errors:
        print(json.dumps({"status": "fail", "errors": errors}, indent=2))
        return 1

    manifest = load_json(ledger_dir / "manifest.json")
    lid = manifest.get("ledger_id")
    if not lid:
        errors.append("manifest missing ledger_id")

    events = load_jsonl(ledger_dir / "events.jsonl")
    atoms = load_jsonl(ledger_dir / "records/design_atoms.jsonl")
    decisions = load_jsonl(ledger_dir / "records/decisions.jsonl")
    questions = load_jsonl(ledger_dir / "records/questions.jsonl")
    blockers = load_jsonl(ledger_dir / "records/blockers.jsonl")
    corrections = load_jsonl(ledger_dir / "records/corrections.jsonl")
    current = load_json(ledger_dir / "state/current.json")
    handoff = load_json(ledger_dir / "state/handoff.json")
    open_items = load_json(ledger_dir / "state/open_items.json")
    compile_queue = load_json(ledger_dir / "state/compile_queue.json")
    operating_capsule = load_json(ledger_dir / "state/operating_capsule.json")
    health = load_json(ledger_dir / "validation/ledger_health.json")

    ids = {
        "event": validate_record_stream(str(lid), events, "event", "event_id", errors),
        "atom": validate_record_stream(str(lid), atoms, "atom", "atom_id", errors),
        "decision": validate_record_stream(str(lid), decisions, "decision", "decision_id", errors),
        "question": validate_record_stream(str(lid), questions, "question", "question_id", errors),
        "blocker": validate_record_stream(str(lid), blockers, "blocker", "blocker_id", errors),
        "correction": validate_record_stream(str(lid), corrections, "correction", "correction_id", errors),
    }

    for state_name, state in [
        ("current.json", current),
        ("handoff.json", handoff),
        ("open_items.json", open_items),
        ("compile_queue.json", compile_queue),
        ("operating_capsule.json", operating_capsule),
        ("ledger_health.json", health),
    ]:
        if state.get("ledger_id") != lid:
            errors.append(f"{state_name} ledger_id mismatch")

    record_counts = manifest.get("record_counts", {})
    expected_counts = {
        "events": len(events),
        "design_atoms": len(atoms),
        "decisions": len(decisions),
        "questions": len(questions),
        "blockers": len(blockers),
        "corrections": len(corrections),
    }
    for key, expected in expected_counts.items():
        if record_counts.get(key) != expected:
            errors.append(f"manifest record_counts.{key}={record_counts.get(key)!r} but actual is {expected}")

    atom_status_counts = count_by(atoms, "status")
    decision_status_counts = count_by(decisions, "status")
    question_status_counts = count_by(questions, "status")
    blocker_status_counts = count_by(blockers, "status")

    design_atom_schema = load_json(PLANS / "ledgers/v2/schemas/design_atom.schema.json")
    atom_required_fields = set(map(str, design_atom_schema.get("required", [])))
    allowed_atom_types = schema_enum(design_atom_schema, "atom_type")
    allowed_atom_statuses = schema_enum(design_atom_schema, "status")
    for atom in atoms:
        atom_id = atom.get("atom_id")
        missing_required = sorted(field for field in atom_required_fields if field not in atom)
        if missing_required:
            errors.append(f"atom {atom_id} missing required fields from design_atom.schema.json: {missing_required}")
        atom_type = atom.get("atom_type")
        if allowed_atom_types and atom_type not in allowed_atom_types:
            errors.append(f"atom {atom_id} atom_type {atom_type!r} is not allowed by design_atom.schema.json")
        atom_status = atom.get("status")
        if allowed_atom_statuses and atom_status not in allowed_atom_statuses:
            errors.append(f"atom {atom_id} status {atom_status!r} is not allowed by design_atom.schema.json")

    current_count_expectations = {
        "accepted_decisions_count": decision_status_counts.get("accepted", 0),
        "design_atoms_total": len(atoms),
        "ready_for_plan_compile_atoms": atom_status_counts.get("ready_for_plan_compile", 0),
        "candidate_atoms_count": atom_status_counts.get("candidate", 0),
        "open_questions_count": question_status_counts.get("open", 0),
        "deferred_questions_count": question_status_counts.get("deferred", 0),
        "open_blockers_count": blocker_status_counts.get("open", 0),
    }
    for key, expected in current_count_expectations.items():
        if current.get(key) != expected:
            errors.append(f"current.json {key}={current.get(key)!r} but actual is {expected}")

    health_summary = health.get("summary", {})
    health_count_expectations = {
        "events": len(events),
        "design_atoms": len(atoms),
        "decisions": len(decisions),
        "open_questions": question_status_counts.get("open", 0),
        "deferred_questions": question_status_counts.get("deferred", 0),
        "open_blockers": blocker_status_counts.get("open", 0),
        "compile_queue_items": len(compile_queue.get("items", [])),
    }
    for key, expected in health_count_expectations.items():
        if health_summary.get(key) != expected:
            errors.append(f"ledger_health summary.{key}={health_summary.get(key)!r} but actual is {expected}")

    if len(open_items.get("open_questions", [])) != current_count_expectations["open_questions_count"]:
        errors.append("open_items open_questions count disagrees with records/current")
    if len(open_items.get("deferred_questions", [])) != current_count_expectations["deferred_questions_count"]:
        errors.append("open_items deferred_questions count disagrees with records/current")
    if len(open_items.get("open_blockers", [])) != current_count_expectations["open_blockers_count"]:
        errors.append("open_items open_blockers count disagrees with records/current")

    current_phase = current.get("phase")
    queue_status = compile_queue.get("status")
    handoff_phase = handoff.get("current_phase")
    if current_phase != handoff_phase:
        errors.append(f"current phase {current_phase!r} disagrees with handoff phase {handoff_phase!r}")
    if current_phase != queue_status:
        errors.append(f"current phase {current_phase!r} disagrees with compile_queue status {queue_status!r}")

    compiled_phase = isinstance(current_phase, str) and current_phase.startswith("compiled")
    if compiled_phase:
        if manifest.get("status") != "compiled":
            errors.append(f"manifest status must be compiled for compiled phase, got {manifest.get('status')!r}")
        if atom_status_counts.get("ready_for_plan_compile", 0):
            errors.append("compiled ledger still has ready_for_plan_compile design atoms")
        for item in compile_queue.get("items", []):
            if item.get("status") != "compiled":
                errors.append(f"compile_queue item {item.get('queue_id')} status is not compiled")
        if current.get("governance_status") == "sealed":
            if health.get("status") != "pass_governance_sealed":
                errors.append(f"ledger_health status must be pass_governance_sealed, got {health.get('status')!r}")
            if health_summary.get("governance_seal") != "passed":
                errors.append("ledger_health summary.governance_seal must be passed for sealed governance")
            if handoff.get("validation_state", {}).get("ledger_health") != health.get("status"):
                errors.append("handoff validation_state.ledger_health disagrees with ledger_health.status")
            if atom_status_counts.get("candidate", 0):
                errors.append("sealed ledger still has candidate design atoms")
            if atom_status_counts.get("ready_for_plan_compile", 0):
                errors.append("sealed ledger still has ready_for_plan_compile design atoms")

    last_event_id = current.get("last_event_id")
    handoff_last_event_id = handoff.get("cursor", {}).get("last_event_id")
    if last_event_id != handoff_last_event_id:
        errors.append("current last_event_id disagrees with handoff cursor.last_event_id")
    if last_event_id and last_event_id not in ids["event"]:
        errors.append(f"last_event_id not found in events: {last_event_id}")
    if events and last_event_id != events[-1].get("event_id"):
        errors.append(f"last_event_id {last_event_id!r} is not the final event row {events[-1].get('event_id')!r}")

    gui_re = re.compile(r"\b(gui|ui|screen|page|panel|form|layout|styling|icon|svg|image|screenshot|visual|button|modal)\b", re.I)
    atom_by_id = {str(atom.get("atom_id")): atom for atom in atoms}
    for atom in atoms:
        atom_id = atom.get("atom_id")
        if atom.get("status") in {"accepted", "ready_for_plan_compile", "compiled_to_plan"} and not atom.get("source_refs"):
            errors.append(f"atom missing source_refs: {atom_id}")
        if "gui_related" not in atom:
            errors.append(f"atom missing gui_related: {atom_id}")
        elif not isinstance(atom.get("gui_related"), bool):
            errors.append(f"atom gui_related must be boolean: {atom_id}")
        haystack = " ".join(str(atom.get(key, "")) for key in ("title", "canonical_summary"))
        haystack += " " + " ".join(map(str, atom.get("exact_tokens", [])))
        reason = str(atom.get("gui_classification_reason", "")).lower()
        explicitly_non_gui_rule = (
            "not gui" in reason
            or "not itself gui" in reason
            or "not gui/ui" in reason
            or "backend/orchestration" in reason
            or "metadata/classification" in reason
        )
        if gui_re.search(haystack) and atom.get("gui_related") is False and not explicitly_non_gui_rule:
            warnings.append(f"review gui_related=false on GUI-looking atom: {atom_id}")
        if atom.get("atom_type") == "negative_constraint" and not atom.get("negative_constraints"):
            warnings.append(f"negative_constraint atom lacks negative_constraints list: {atom_id}")
        if current.get("governance_status") == "sealed":
            for field in ("compile_disposition", "compile_notes", "validation_notes"):
                if contains_stale_governance_pending(atom.get(field, "")):
                    errors.append(f"sealed ledger atom {atom_id} has stale governance-pending {field}")

    queue_source_ids: set[str] = set()
    queue_plan_unit_ids: set[str] = set()
    queue_targets: set[str] = set()
    for item in compile_queue.get("items", []):
        queue_id = item.get("queue_id")
        target_doc = item.get("target_doc")
        if target_doc:
            queue_targets.add(str(target_doc))
            target_path, path_error = exact_path(str(target_doc))
            if path_error or target_path is None or not target_path.exists():
                errors.append(f"compile_queue {queue_id} target_doc does not resolve exactly: {target_doc}")
        for target_doc in item.get("target_docs", []):
            target_path, path_error = exact_path(str(target_doc))
            if path_error or target_path is None or not target_path.exists():
                errors.append(f"compile_queue {queue_id} target_docs entry does not resolve exactly: {target_doc}")
        if not item.get("compiled_plan_unit_ids"):
            errors.append(f"compile_queue {queue_id} missing compiled_plan_unit_ids")
        queue_plan_unit_ids.update(map(str, item.get("compiled_plan_unit_ids", [])))
        for atom_id in item.get("source_atom_ids", []):
            atom_id = str(atom_id)
            queue_source_ids.add(atom_id)
            atom = atom_by_id.get(atom_id)
            if not atom:
                errors.append(f"compile_queue {queue_id} references missing source atom {atom_id}")
                continue
            if item.get("status") == "compiled" and atom.get("status") not in {"compiled_to_plan", "deferred"}:
                errors.append(f"compile_queue {queue_id} source atom {atom_id} status is {atom.get('status')!r}")

    canonical_targets = set(map(str, current.get("canonical_plan_targets", [])))
    if queue_targets != canonical_targets:
        errors.append(
            "compile_queue target docs disagree with current canonical_plan_targets: "
            f"queue={sorted(queue_targets)} current={sorted(canonical_targets)}"
        )
    compiled_outputs = set(map(str, current.get("compiled_plan_outputs", [])))
    if not canonical_targets.issubset(compiled_outputs):
        errors.append("current compiled_plan_outputs does not include every canonical_plan_target")
    compiled_owner_docs = set(map(str, current.get("compiled_owner_docs", [])))
    if compiled_owner_docs and not compiled_owner_docs.issubset(compiled_outputs):
        errors.append("current compiled_plan_outputs does not include every compiled_owner_docs entry")
    queue_owner_targets = {
        str(target_doc)
        for item in compile_queue.get("items", [])
        for target_doc in item.get("target_docs", [])
    }
    if compiled_owner_docs and queue_owner_targets and queue_owner_targets != compiled_owner_docs:
        errors.append(
            "compile_queue target_docs disagree with current compiled_owner_docs: "
            f"queue={sorted(queue_owner_targets)} current={sorted(compiled_owner_docs)}"
        )

    for atom in atoms:
        atom_id = str(atom.get("atom_id"))
        targets = list(map(str, atom.get("plan_compile_targets", [])))
        output_targets = list(map(str, atom.get("compiled_output_plan_unit_ids", [])))
        if atom.get("status") == "compiled_to_plan":
            if not targets and not output_targets:
                errors.append(f"compiled atom missing plan_compile_targets or compiled_output_plan_unit_ids: {atom_id}")
            if targets and atom_id not in queue_source_ids:
                errors.append(f"compiled atom missing from compile_queue source_atom_ids: {atom_id}")
        for target in targets:
            if target not in queue_plan_unit_ids:
                errors.append(f"atom {atom_id} plan_compile_target {target} is not in compile_queue compiled_plan_unit_ids")

    schema_path = PLANS / "ledgers/v2/schemas/plan_unit.schema.json"
    plan_unit_schema = load_json(schema_path)
    schema_required = set(plan_unit_schema.get("required", []))
    missing_schema_required = sorted(PLAN_UNIT_REQUIRED_FIELDS - schema_required)
    if missing_schema_required:
        errors.append(f"plan_unit.schema.json missing required fields: {missing_schema_required}")
    if "risk" in schema_required or "risk" in plan_unit_schema.get("properties", {}):
        errors.append("plan_unit.schema.json still uses retired risk field; expected risk_class")

    plan_unit_docs = set(canonical_targets)
    plan_unit_docs.update(
        path
        for path in compiled_outputs
        if path.startswith("Plans/") and path.endswith(".md")
    )

    plan_units: list[dict[str, Any]] = []
    for target_doc in sorted(plan_unit_docs):
        target_path = ROOT / target_doc
        if target_path.exists():
            plan_units.extend(extract_plan_unit_blocks(target_path))
    plan_unit_ids: set[str] = set()
    for unit in plan_units:
        if "_parse_error" in unit:
            errors.append(f"invalid PlanUnit YAML in {unit['_path']}:{unit['_line']}: {unit['_parse_error']}")
            continue
        unit_id = str(unit.get("plan_unit_id"))
        plan_unit_ids.add(unit_id)
        missing_fields = sorted(field for field in PLAN_UNIT_REQUIRED_FIELDS if field not in unit)
        if missing_fields:
            errors.append(f"PlanUnit {unit_id} missing required fields: {missing_fields}")
        if not isinstance(unit.get("canonical_text"), str):
            errors.append(f"PlanUnit {unit_id} canonical_text must be a string")
        if not isinstance(unit.get("gui_related"), bool):
            errors.append(f"PlanUnit {unit_id} gui_related must be boolean")
    missing_queue_units = sorted(queue_plan_unit_ids - plan_unit_ids)
    if missing_queue_units:
        errors.append(f"compile_queue references PlanUnit ids not found in canonical docs: {missing_queue_units}")

    for atom in atoms:
        atom_id = str(atom.get("atom_id"))
        for target in map(str, atom.get("plan_compile_targets", [])):
            if target not in plan_unit_ids:
                errors.append(f"atom {atom_id} plan_compile_target {target} is not present in compiled Plan docs")
        for target in map(str, atom.get("compiled_output_plan_unit_ids", [])):
            if target not in plan_unit_ids:
                errors.append(f"atom {atom_id} compiled_output_plan_unit_id {target} is not present in compiled Plan docs")

    sharding_config = load_json(PLANS / "sharding_config.json")
    sharding_sources = set(map(str, sharding_config.get("sources", [])))
    missing_sharding_sources = sorted(canonical_targets - sharding_sources)
    if missing_sharding_sources:
        errors.append(f"canonical_plan_targets missing from sharding_config sources: {missing_sharding_sources}")

    spec_lock = load_json(PLANS / "Spec_Lock.json")
    locked_paths = {str(row.get("path")) for row in spec_lock.get("canonical_ssot_hashes", {}).get("files", [])}
    missing_spec_lock = sorted(canonical_targets - locked_paths)
    if missing_spec_lock:
        errors.append(f"canonical_plan_targets missing from Spec_Lock coverage: {missing_spec_lock}")

    plan_graph = load_json(PLANS / "plan_graph.json")
    plan_graph_refs: set[str] = set()
    for node in plan_graph.get("nodes", []):
        plan_graph_refs.update(ref.get("ref", "") for ref in node.get("inputs", []))
        plan_graph_refs.update(ref.get("ref", "") for ref in node.get("outputs", []))
        for contract_ref in node.get("contract_refs", []):
            if str(contract_ref).startswith("ContractName:"):
                plan_graph_refs.add(str(contract_ref).removeprefix("ContractName:").split("#", 1)[0])
    missing_plan_graph = sorted(canonical_targets - plan_graph_refs)
    if missing_plan_graph:
        errors.append(f"canonical_plan_targets missing from plan_graph coverage: {missing_plan_graph}")

    registry_path = ledger_dir.parent / "ledger_registry.json"
    if registry_path.exists():
        registry = load_json(registry_path)
        matching_entries = [
            (bucket, entry)
            for bucket in ("active_ledgers", "paused_ledgers", "compiled_ledgers", "sealed_ledgers")
            for entry in registry.get(bucket, [])
            if entry.get("ledger_id") == lid
        ]
        if len(matching_entries) != 1:
            errors.append(f"ledger_registry should contain exactly one entry for {lid}, found {len(matching_entries)}")
        elif compiled_phase:
            bucket, entry = matching_entries[0]
            if current.get("governance_status") == "sealed":
                if bucket != "sealed_ledgers":
                    errors.append(f"sealed ledger registry entry must be under sealed_ledgers, got {bucket}")
                if entry.get("status") != "sealed":
                    errors.append(f"registry status for sealed ledger must be sealed, got {entry.get('status')!r}")
            elif entry.get("status") != "compiled":
                errors.append(f"registry status for compiled ledger must be compiled, got {entry.get('status')!r}")
            if entry.get("phase") != current_phase:
                errors.append("registry phase disagrees with current phase")
            if set(map(str, entry.get("canonical_plan_targets", []))) != canonical_targets:
                errors.append("registry canonical_plan_targets disagrees with current state")

    status = "pass" if not errors else "fail"
    report = {
        "schema_id": "pm.bootstrap_ledger_validator_report.v1",
        "ledger_id": lid,
        "status": status,
        "summary": {
            "events": len(events),
            "atoms": len(atoms),
            "decisions": len(decisions),
            "questions": len(questions),
            "corrections": len(corrections),
            "compile_queue_items": len(compile_queue.get("items", [])),
            "plan_units_checked": len(plan_unit_ids),
        },
        "errors": errors,
        "warnings": warnings,
    }
    print(json.dumps(report, indent=2, sort_keys=True))
    return 0 if not errors else 1


if __name__ == "__main__":
    raise SystemExit(main())
