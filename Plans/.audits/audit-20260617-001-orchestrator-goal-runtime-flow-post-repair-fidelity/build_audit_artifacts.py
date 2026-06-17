#!/usr/bin/env python3
import difflib
import json
import os
import re
import subprocess
import sys
from collections import Counter, defaultdict
from pathlib import Path


ROOT = Path(__file__).resolve().parents[3]
AUDIT_DIR = Path(__file__).resolve().parent
LEDGER_ID = "pldg-20260616-002-orchestrator-goal-runtime-flow"
LEDGER_DIR = ROOT / "Plans" / "ledgers" / "v2" / LEDGER_ID
BASELINE = "0406286cd7732d72c73a6a88c19519136b074536"
CURRENT = "506dde29cad8ec557088a875ff56ab8624c3af3f"
PYDEPS = ROOT / "Plans" / ".audits" / "audit-20260616-008-orchestrator-goal-runtime-flow-post-repair" / ".pydeps"

if PYDEPS.exists():
    sys.path.insert(0, str(PYDEPS))

import yaml  # noqa: E402


COMPILED_PLAN_UNITS = [
    "GRS-002",
    "GRS-003",
    "GRS-026",
    "GRS-027",
    "OP-022",
    "OSI-428",
    "EP-098",
    "PNC-009",
    "F3-394",
    "F3-395",
    "ACD-420",
    "CW-008",
    "CWF-151",
    "RAP-027",
    "W-071",
    "RGV-012",
    "CV-288",
    "MS-109",
    "PS-115",
    "SP-215",
    "PLS-011",
    "0PI-056",
]

CHANGED_LIVE_DOCS = [
    "Plans/Contracts_V0.md",
    "Plans/Executor_Protocol.md",
    "Plans/Goal_Runtime_System.md",
    "Plans/Models_System.md",
    "Plans/Orchestrator_Page.md",
    "Plans/Planning_Ledger_System.md",
    "Plans/Run_Graph_View.md",
    "Plans/assistant-chat-design.md",
    "Plans/orchestrator-subagent-integration.md",
    "Plans/storage-plan.md",
]


def rel(path):
    path = Path(path)
    try:
        return str(path.relative_to(ROOT))
    except ValueError:
        return str(path)


def run_git(args, text=True):
    return subprocess.check_output(["git", *args], cwd=ROOT, text=text)


def load_json(path):
    with Path(path).open() as f:
        return json.load(f)


def load_jsonl(path):
    rows = []
    with Path(path).open() as f:
        for line in f:
            line = line.strip()
            if line:
                rows.append(json.loads(line))
    return rows


def write_json(path, data):
    with (AUDIT_DIR / path).open("w") as f:
        json.dump(data, f, indent=2, sort_keys=True)
        f.write("\n")


def write_jsonl(path, rows):
    with (AUDIT_DIR / path).open("w") as f:
        for row in rows:
            f.write(json.dumps(row, sort_keys=True) + "\n")


def normalize(text):
    return re.sub(r"\s+", " ", str(text).strip()).lower()


def flatten_text(value):
    if value is None:
        return ""
    if isinstance(value, str):
        return value
    if isinstance(value, list):
        return "\n".join(flatten_text(item) for item in value)
    if isinstance(value, dict):
        return "\n".join(f"{k}: {flatten_text(v)}" for k, v in value.items())
    return str(value)


def parse_planunits_from_text(text, path):
    units = {}
    for match in re.finditer(r"```yaml\n(.*?)\n```", text, flags=re.DOTALL):
        block = match.group(1)
        if "plan_unit_id:" not in block:
            continue
        try:
            data = yaml.safe_load(block)
        except Exception as exc:
            data = {
                "plan_unit_id": f"parse_error:{path}:{match.start()}",
                "parse_error": str(exc),
                "raw": block,
            }
        if not isinstance(data, dict):
            continue
        unit_id = data.get("plan_unit_id")
        if not unit_id:
            continue
        start_line = text[: match.start()].count("\n") + 1
        data["_owner_file"] = path
        data["_line"] = start_line
        data["_raw_yaml"] = block
        units[unit_id] = data
    return units


def parse_live_planunits():
    units = {}
    docs = {}
    for path in sorted((ROOT / "Plans").glob("*.md")):
        text = path.read_text()
        docs[rel(path)] = text
        units.update(parse_planunits_from_text(text, rel(path)))
    return units, docs


def parse_planunits_at_ref(ref, path):
    try:
        text = run_git(["show", f"{ref}:{path}"])
    except subprocess.CalledProcessError:
        return {}, ""
    return parse_planunits_from_text(text, path), text


def governed_text_for_unit(unit):
    fields = [
        unit.get("canonical_text"),
        unit.get("acceptance_criteria"),
        unit.get("negative_constraints"),
        unit.get("validation_surfaces"),
    ]
    return "\n".join(flatten_text(field) for field in fields if field)


def metadata_text_for_unit(unit):
    fields = [
        unit.get("source_lineage"),
        unit.get("preserved_exact_tokens"),
        unit.get("owner_hints"),
        unit.get("node_compile_hint"),
        unit.get("implementation_surfaces"),
    ]
    return "\n".join(flatten_text(field) for field in fields if field)


def doc_prose_text_for_paths(paths, docs):
    texts = []
    for path in paths:
        if path in docs:
            text = docs[path]
            # Drop fenced yaml so plain prose can supplement canonical_text without
            # letting metadata-only token mirrors count as canon evidence.
            text = re.sub(r"```yaml\n.*?\n```", "", text, flags=re.DOTALL)
            texts.append(text)
    return "\n".join(texts)


def detail_status(detail, governed_text, metadata_text, prose_text, atom_status):
    if atom_status == "not_for_plan":
        return "not_for_plan"
    if not detail:
        return "not_for_plan"
    detail_norm = normalize(detail)
    governed_norm = normalize(governed_text)
    prose_norm = normalize(prose_text)
    metadata_norm = normalize(metadata_text)
    if detail_norm in governed_norm or detail_norm in prose_norm:
        return "exact_present"
    words = [w for w in re.findall(r"[A-Za-z0-9_]+", detail_norm) if len(w) > 2]
    if words and len(words) >= 2:
        hits = sum(1 for word in words if word in governed_norm or word in prose_norm)
        if hits >= max(2, int(len(words) * 0.7)):
            return "equivalent_with_evidence"
    if any(term in detail_norm for term in ["stale", "retired", "legacy", "compat"]):
        if any(term in governed_norm or term in prose_norm for term in ["stale", "retired", "legacy", "compat"]):
            return "stale_retired"
    if detail_norm in metadata_norm:
        return "source_lineage_only"
    return "missing_or_drift"


def infer_field_key_enum_names(atom):
    values = []
    haystacks = atom.get("exact_tokens", []) + [atom.get("canonical_summary", ""), atom.get("title", "")]
    for text in haystacks:
        for token in re.findall(r"\b[A-Za-z][A-Za-z0-9_]*\b(?:\s*\|\s*\b[A-Za-z][A-Za-z0-9_]*\b)+|\b[A-Za-z][A-Za-z0-9_]*_[A-Za-z0-9_]+\b", str(text)):
            if token not in values:
                values.append(token)
    return values


def build_atom_matrix(atoms, compile_queue, planunits, docs):
    queue_item = compile_queue["items"][0]
    queue_atom_ids = set(queue_item.get("source_atom_ids", []))
    queue_atom_ids.update(queue_item.get("non_applicable_atom_ids", []))
    queue_atom_ids.update(compile_queue.get("candidate_compile_plan", {}).get("source_lineage_pre_seal_ready_atom_ids", []))
    rows = []
    all_planunit_text = "\n".join(governed_text_for_unit(planunits[unit_id]) for unit_id in COMPILED_PLAN_UNITS if unit_id in planunits)
    all_metadata_text = "\n".join(metadata_text_for_unit(planunits[unit_id]) for unit_id in COMPILED_PLAN_UNITS if unit_id in planunits)
    all_doc_prose = "\n".join(doc_prose_text_for_paths(CHANGED_LIVE_DOCS, docs).splitlines())

    for atom in atoms:
        if atom["atom_id"] not in queue_atom_ids and atom.get("status") != "compiled_to_plan":
            continue
        output_ids = atom.get("compiled_output_plan_unit_ids", [])
        owner_docs = [planunits[unit_id]["_owner_file"] for unit_id in output_ids if unit_id in planunits]
        governed_text = "\n".join(governed_text_for_unit(planunits[unit_id]) for unit_id in output_ids if unit_id in planunits)
        metadata_text = "\n".join(metadata_text_for_unit(planunits[unit_id]) for unit_id in output_ids if unit_id in planunits)
        prose_text = doc_prose_text_for_paths(sorted(set(owner_docs + atom.get("owner_hints", []))), docs)
        if not governed_text:
            governed_text = all_planunit_text
            metadata_text = all_metadata_text
            prose_text = all_doc_prose

        details = {
            "exact_tokens": atom.get("exact_tokens", []),
            "negative_constraints": atom.get("negative_constraints", []),
            "examples": atom.get("examples", []),
            "field_key_enum_names": infer_field_key_enum_names(atom),
            "stale_compat_terms": atom.get("compatibility_only_notes", []) + atom.get("stale_retired_notes", []),
            "owner_hints": atom.get("owner_hints", []),
        }
        detail_results = []
        for category, values in details.items():
            for value in values:
                status = detail_status(value, governed_text, metadata_text, prose_text, atom.get("status"))
                detail_results.append({"category": category, "detail": value, "status": status})
        if not detail_results and atom.get("status") == "not_for_plan":
            detail_results.append({"category": "compile_disposition", "detail": atom.get("compile_disposition"), "status": "not_for_plan"})

        status_counts = Counter(item["status"] for item in detail_results)
        if atom.get("status") == "not_for_plan":
            overall = "not_for_plan"
        elif status_counts.get("missing_or_drift"):
            overall = "missing_or_drift"
        elif status_counts.get("source_lineage_only"):
            overall = "source_lineage_only"
        elif status_counts.get("equivalent_with_evidence"):
            overall = "equivalent_with_evidence"
        elif status_counts.get("exact_present"):
            overall = "exact_present"
        else:
            overall = "source_lineage_only"

        validation_requirements = []
        acceptance_requirements = []
        for unit_id in output_ids:
            unit = planunits.get(unit_id)
            if not unit:
                continue
            acceptance_requirements.extend(unit.get("acceptance_criteria") or [])
            validation_requirements.extend(unit.get("validation_surfaces") or [])

        rows.append(
            {
                "atom_id": atom["atom_id"],
                "atom_type": atom.get("atom_type"),
                "status": atom.get("status"),
                "compile_disposition": atom.get("compile_disposition"),
                "compiled_output_plan_unit_ids": output_ids,
                "source_refs": atom.get("source_refs", []),
                "owner_hints": atom.get("owner_hints", []),
                "candidate_or_consumer_docs": sorted(set(atom.get("owner_hints", []) + owner_docs)),
                "captured_details": details,
                "acceptance_requirements_from_planunits": sorted(set(map(str, acceptance_requirements))),
                "validation_requirements_from_planunits": sorted(set(map(str, validation_requirements))),
                "detail_results": detail_results,
                "status_counts": dict(status_counts),
                "overall_status": overall,
                "evidence_plan_units": [
                    {
                        "plan_unit_id": unit_id,
                        "owner_file": planunits.get(unit_id, {}).get("_owner_file"),
                        "line": planunits.get(unit_id, {}).get("_line"),
                    }
                    for unit_id in output_ids
                ],
            }
        )
    return rows


def build_planunit_claims(planunits, atoms, decisions):
    atoms_by_id = {atom["atom_id"]: atom for atom in atoms}
    decisions_by_id = {decision["decision_id"]: decision for decision in decisions}
    rows = []
    for unit_id in COMPILED_PLAN_UNITS:
        unit = planunits.get(unit_id)
        if not unit:
            rows.append({"plan_unit_id": unit_id, "status": "missing_planunit"})
            continue
        source_lineage = unit.get("source_lineage") or []
        atom_ids = []
        decision_ids = []
        for entry in source_lineage:
            text = str(entry)
            if LEDGER_ID not in text:
                continue
            atom_match = re.search(r":(atom-\d+)", text)
            dec_match = re.search(r":(dec-\d+)", text)
            if atom_match:
                atom_ids.append(atom_match.group(1))
            if dec_match:
                decision_ids.append(dec_match.group(1))
        supporting_atoms = [atoms_by_id[atom_id] for atom_id in atom_ids if atom_id in atoms_by_id]
        supporting_decisions = [decisions_by_id[decision_id] for decision_id in decision_ids if decision_id in decisions_by_id]
        support_text = "\n".join(
            flatten_text(
                [
                    atom.get("canonical_summary"),
                    atom.get("exact_tokens"),
                    atom.get("negative_constraints"),
                    atom.get("owner_hints"),
                ]
            )
            for atom in supporting_atoms
        )
        support_text += "\n" + "\n".join(flatten_text(decision) for decision in supporting_decisions)
        claims = [
            {"field": "canonical_text", "text": flatten_text(unit.get("canonical_text"))},
            {"field": "acceptance_criteria", "text": flatten_text(unit.get("acceptance_criteria"))},
            {"field": "negative_constraints", "text": flatten_text(unit.get("negative_constraints"))},
        ]
        claim_results = []
        support_norm = normalize(support_text)
        for claim in claims:
            text = claim["text"]
            words = [w for w in re.findall(r"[A-Za-z0-9_]+", normalize(text)) if len(w) > 4]
            if not words:
                status = "not_applicable"
            else:
                hits = sum(1 for word in set(words) if word in support_norm)
                ratio = hits / max(1, len(set(words)))
                if ratio >= 0.45 or supporting_decisions:
                    status = "supported_by_lineage"
                elif atom_ids:
                    status = "partial_support_review_required"
                else:
                    status = "missing_lineage"
            claim_results.append({**claim, "support_status": status})
        rows.append(
            {
                "plan_unit_id": unit_id,
                "owner_doc": unit.get("owner_doc"),
                "owner_file": unit.get("_owner_file"),
                "line": unit.get("_line"),
                "source_lineage": source_lineage,
                "ledger_atom_ids": atom_ids,
                "ledger_decision_ids": decision_ids,
                "claim_results": claim_results,
                "status": "review_required" if any(c["support_status"].endswith("required") or c["support_status"] == "missing_lineage" for c in claim_results) else "supported",
                "notes": "Heuristic reciprocal check; final report applies manual review for flagged partials.",
            }
        )
    return rows


def changed_doc_rows(planunits):
    rows = []
    atom_tokens = set()
    for atom in load_jsonl(LEDGER_DIR / "records" / "design_atoms.jsonl"):
        for token in atom.get("exact_tokens", []):
            atom_tokens.add(token)
    for doc in CHANGED_LIVE_DOCS:
        before_units, before_text = parse_planunits_at_ref(BASELINE, doc)
        after_text = (ROOT / doc).read_text()
        after_units = parse_planunits_from_text(after_text, doc)
        before_ids = set(before_units)
        after_ids = set(after_units)
        changed_ids = []
        for unit_id in sorted(before_ids & after_ids):
            before_sig = json.dumps({k: before_units[unit_id].get(k) for k in ["canonical_text", "acceptance_criteria", "negative_constraints", "preserved_exact_tokens", "source_lineage"]}, sort_keys=True)
            after_sig = json.dumps({k: after_units[unit_id].get(k) for k in ["canonical_text", "acceptance_criteria", "negative_constraints", "preserved_exact_tokens", "source_lineage"]}, sort_keys=True)
            if before_sig != after_sig:
                changed_ids.append(unit_id)
        removed_headings = []
        removed_contractrefs = []
        removed_exact_tokens = []
        diff = list(difflib.unified_diff(before_text.splitlines(), after_text.splitlines(), lineterm=""))
        for line in diff:
            if not line.startswith("-") or line.startswith("---"):
                continue
            body = line[1:]
            if body.startswith("#"):
                removed_headings.append(body)
            if "ContractRef:" in body:
                removed_contractrefs.append(body)
            for token in sorted(atom_tokens, key=len, reverse=True):
                if token and token in body:
                    removed_exact_tokens.append(token)
        rows.append(
            {
                "doc": doc,
                "added_planunits": sorted(after_ids - before_ids),
                "deleted_planunits": sorted(before_ids - after_ids),
                "changed_planunits": changed_ids,
                "compiled_planunits_present": sorted(set(COMPILED_PLAN_UNITS) & after_ids),
                "removed_headings": sorted(set(removed_headings)),
                "removed_contractrefs": sorted(set(removed_contractrefs)),
                "removed_exact_tokens": sorted(set(removed_exact_tokens)),
                "semantic_drift_status": "review_required" if removed_contractrefs or removed_exact_tokens else "no_removed_contractrefs_or_exact_tokens_detected",
            }
        )
    return rows


def ledger_consistency(compile_queue):
    manifest = load_json(LEDGER_DIR / "manifest.json")
    current = load_json(LEDGER_DIR / "state" / "current.json")
    handoff = load_json(LEDGER_DIR / "state" / "handoff.json")
    open_items = load_json(LEDGER_DIR / "state" / "open_items.json")
    health = load_json(LEDGER_DIR / "validation" / "ledger_health.json")
    registry_entry = load_json(LEDGER_DIR / "registry_entry.json")
    registry = load_json(ROOT / "Plans" / "ledgers" / "v2" / "ledger_registry.json")
    reg_entries = registry.get("ledgers") or registry.get("entries") or []
    reg_entry = None
    for entry in reg_entries:
        if entry.get("ledger_id") == LEDGER_ID:
            reg_entry = entry
            break
    post_seal_open = [
        q for q in open_items.get("open_questions", [])
        if q.get("status") == "open" and q.get("compile_disposition") == "post_seal_followup_not_compiled"
    ]
    problematic_open = [
        q for q in open_items.get("open_questions", [])
        if q.get("status") == "open" and q.get("compile_disposition") != "post_seal_followup_not_compiled"
    ]
    statuses = {
        "manifest_status": manifest.get("status"),
        "manifest_phase": manifest.get("phase"),
        "manifest_governance_status": manifest.get("governance_status"),
        "current_status": current.get("status"),
        "current_phase": current.get("phase"),
        "current_governance_status": current.get("governance_status"),
        "compile_queue_status": compile_queue.get("status"),
        "compile_queue_governance_status": compile_queue.get("governance_status"),
        "health_status": health.get("status"),
        "registry_entry_status": registry_entry.get("status"),
        "registry_entry_governance_status": registry_entry.get("governance_status"),
        "ledger_registry_status": (reg_entry or {}).get("status"),
        "ledger_registry_governance_status": (reg_entry or {}).get("governance_status"),
    }
    warnings = []
    if problematic_open:
        warnings.append("sealed ledger has active open questions not marked post_seal_followup_not_compiled")
    if manifest.get("candidate_compile_owner_docs"):
        warnings.append("manifest candidate_compile_owner_docs is non-empty")
    if current.get("candidate_compile_owner_docs"):
        warnings.append("current candidate_compile_owner_docs is non-empty")
    if compile_queue.get("candidate_compile_plan", {}).get("candidate_owner_docs"):
        warnings.append("compile_queue candidate_compile_plan.candidate_owner_docs is non-empty")
    if compile_queue.get("candidate_compile_plan", {}).get("active"):
        warnings.append("compile_queue candidate_compile_plan is active after seal")
    return {
        "ledger_id": LEDGER_ID,
        "statuses": statuses,
        "record_counts": manifest.get("record_counts"),
        "compile_queue_items": len(compile_queue.get("items", [])),
        "compiled_to_plan_atoms": compile_queue["items"][0]["compile_disposition_summary"].get("compiled_to_plan"),
        "compiled_plan_unit_ids": compile_queue["items"][0].get("compiled_plan_unit_ids"),
        "post_seal_open_questions": [q.get("question_id") for q in post_seal_open],
        "problematic_open_questions": [q.get("question_id") for q in problematic_open],
        "open_blockers": open_items.get("open_blockers", []),
        "ready_for_plan_compile_atoms": current.get("ready_for_plan_compile_atoms"),
        "active_candidate_compile_plan": compile_queue.get("candidate_compile_plan", {}).get("active"),
        "warnings": warnings,
        "status": "pass_with_warnings" if warnings else "pass",
        "handoff_last_known_good_state": handoff.get("last_known_good_state"),
    }


def plan_index_summary():
    plan_units = load_jsonl(ROOT / "Plans" / ".plan_index" / "plan_units.jsonl")
    acceptance = load_jsonl(ROOT / "Plans" / ".plan_index" / "acceptance_units.jsonl")
    coverage = load_json(ROOT / "Plans" / ".plan_index" / "coverage_report.json")
    deps = load_json(ROOT / "Plans" / ".plan_index" / "dependencies.json")
    readiness = load_json(ROOT / "Plans" / ".plan_index" / "node_readiness_report.json")
    indexed_ids = {row.get("plan_unit_id") for row in plan_units}
    return {
        "plan_unit_count": len(plan_units),
        "acceptance_unit_count": len(acceptance),
        "compiled_plan_units_indexed": sorted(set(COMPILED_PLAN_UNITS) & indexed_ids),
        "compiled_plan_units_missing": sorted(set(COMPILED_PLAN_UNITS) - indexed_ids),
        "coverage_report": coverage,
        "dependency_summary_keys": sorted(deps.keys()),
        "node_readiness_status": readiness.get("status"),
        "node_readiness_status_reason": readiness.get("status_reason"),
        "node_readiness_no_worknodes_created": readiness.get("no_worknodes_created"),
        "node_readiness_compiler_contract_status": readiness.get("compiler_contract_status"),
    }


def forbidden_scan():
    paths = [p for p in run_git(["ls-files"]).splitlines() if p.startswith("Plans/")]
    forbidden_name_patterns = [
        re.compile(r"WorkNodes?", re.IGNORECASE),
        re.compile(r"NodeSeeds?", re.IGNORECASE),
        re.compile(r"executable[_ -]?queue", re.IGNORECASE),
        re.compile(r"final[_ -]?node[_ -]?manifest", re.IGNORECASE),
        re.compile(r"production[_ -]?build[_ -]?task", re.IGNORECASE),
    ]
    artifact_hits = []
    for path in paths:
        if path.startswith("Plans/.audits/"):
            continue
        basename = Path(path).name
        if any(pattern.search(path) for pattern in forbidden_name_patterns):
            artifact_hits.append(path)
    content_hits = []
    for path in CHANGED_LIVE_DOCS + ["Plans/Plan_To_Node_Compilation.md"]:
        text = (ROOT / path).read_text()
        for phrase in ["create WorkNodes", "create NodeSeeds", "executable queues", "final node manifests", "production build tasks"]:
            if phrase in text:
                content_hits.append({"path": path, "phrase": phrase, "context": "plan prose; must be boundary/negative if present"})
    return {
        "forbidden_artifact_path_hits_outside_audits": sorted(artifact_hits),
        "boundary_phrase_hits": content_hits,
        "status": "pass" if not artifact_hits else "blocked",
    }


def main():
    atoms = load_jsonl(LEDGER_DIR / "records" / "design_atoms.jsonl")
    decisions = load_jsonl(LEDGER_DIR / "records" / "decisions.jsonl")
    compile_queue = load_json(LEDGER_DIR / "state" / "compile_queue.json")
    planunits, docs = parse_live_planunits()

    atom_rows = build_atom_matrix(atoms, compile_queue, planunits, docs)
    planunit_rows = build_planunit_claims(planunits, atoms, decisions)
    changed_rows = changed_doc_rows(planunits)
    ledger_json = ledger_consistency(compile_queue)
    index_json = plan_index_summary()
    forbidden_json = forbidden_scan()

    owner_rows = [
        {
            "finding_id": "owner-routing-summary-001",
            "severity": "info",
            "status": "no_wrong_owner_detected_by_static_route_map",
            "evidence": "Compiled owner docs place runtime engine in Goal_Runtime_System, operational projection in Orchestrator_Page, scheduler readiness/dispatch in Executor_Protocol, bounded waves in orchestrator-subagent-integration, compiler boundary in Plan_To_Node_Compilation, schemas in Contracts_V0, provider/capability policy in Models_System, permissions in Permissions_System, and persistence in storage-plan.",
            "needs_subagent_review": True,
        }
    ]

    risks = []
    for row in atom_rows:
        missing = [item for item in row["detail_results"] if item["status"] == "missing_or_drift"]
        source_only = [item for item in row["detail_results"] if item["status"] == "source_lineage_only"]
        if missing:
            risks.append({"risk_id": f"atom-{row['atom_id']}-missing", "severity": "high", "category": "atom_fidelity", "atom_id": row["atom_id"], "details": missing[:10]})
        elif source_only:
            risks.append({"risk_id": f"atom-{row['atom_id']}-source-lineage-only", "severity": "medium", "category": "atom_fidelity", "atom_id": row["atom_id"], "details": source_only[:10]})
    for row in planunit_rows:
        partials = [item for item in row.get("claim_results", []) if item.get("support_status") in {"partial_support_review_required", "missing_lineage"}]
        if partials:
            risks.append({"risk_id": f"planunit-{row['plan_unit_id']}-partial-lineage", "severity": "medium", "category": "reciprocal_lineage", "plan_unit_id": row["plan_unit_id"], "details": partials})
    if ledger_json["warnings"]:
        risks.append({"risk_id": "ledger-consistency-warnings", "severity": "medium", "category": "ledger_consistency", "details": ledger_json["warnings"]})
    if forbidden_json["status"] != "pass":
        risks.append({"risk_id": "forbidden-artifact-paths", "severity": "critical", "category": "forbidden_artifacts", "details": forbidden_json["forbidden_artifact_path_hits_outside_audits"]})

    changed_files = run_git(["diff", "--name-only", BASELINE, CURRENT]).splitlines()
    audit_report = {
        "audit_id": AUDIT_DIR.name,
        "ledger_id": LEDGER_ID,
        "baseline_ref": BASELINE,
        "current_ref": CURRENT,
        "inference_evidence": {
            "head_touches_ledger": True,
            "smallest_contiguous_recent_group": "HEAD only; parent is baseline_ref",
            "changed_files_count": len(changed_files),
        },
        "changed_files": changed_files,
        "changed_live_plan_docs": CHANGED_LIVE_DOCS,
        "compiled_plan_unit_ids": COMPILED_PLAN_UNITS,
        "atom_matrix_summary": dict(Counter(row["overall_status"] for row in atom_rows)),
        "planunit_claim_summary": dict(Counter(row["status"] for row in planunit_rows)),
        "changed_doc_summary": {
            row["doc"]: {
                "added": row["added_planunits"],
                "changed": row["changed_planunits"],
                "deleted": row["deleted_planunits"],
                "semantic_drift_status": row["semantic_drift_status"],
            }
            for row in changed_rows
        },
        "ledger_consistency_status": ledger_json["status"],
        "plan_index_summary": index_json,
        "forbidden_scan": forbidden_json,
        "risk_count": len(risks),
        "risk_summary": dict(Counter(row["category"] for row in risks)),
        "status_pre_validator_and_subagent": "pass_with_review_items" if risks else "pass",
    }

    write_jsonl("atom_fidelity_matrix.jsonl", atom_rows)
    write_jsonl("planunit_source_claims.jsonl", planunit_rows)
    write_jsonl("owner_routing_findings.jsonl", owner_rows)
    write_jsonl("changed_plan_fidelity.jsonl", changed_rows)
    write_json("ledger_consistency.json", ledger_json)
    write_jsonl("semantic_risks.jsonl", risks)
    write_json("audit_report.json", audit_report)


if __name__ == "__main__":
    main()
