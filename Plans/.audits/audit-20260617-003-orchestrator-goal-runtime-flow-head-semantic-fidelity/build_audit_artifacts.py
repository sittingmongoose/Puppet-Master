#!/usr/bin/env python3
import difflib
import json
import re
import subprocess
import sys
from collections import Counter
from pathlib import Path


ROOT = Path(__file__).resolve().parents[3]
AUDIT_DIR = Path(__file__).resolve().parent
LEDGER_ID = "pldg-20260616-002-orchestrator-goal-runtime-flow"
LEDGER_DIR = ROOT / "Plans" / "ledgers" / "v2" / LEDGER_ID
BASELINE = "ea1a0d1d4d99888aaf37b8f84b567bfc9301cb96"
CURRENT = "cd41074b31bdc476a3bc2a985e7551f7de6775ed"
PYDEPS = ROOT / "Plans" / ".audits" / "audit-20260616-008-orchestrator-goal-runtime-flow-post-repair" / ".pydeps"

if PYDEPS.exists():
    sys.path.insert(0, str(PYDEPS))

import yaml  # noqa: E402


STATUS_PRECEDENCE = [
    "missing_or_drift",
    "source_lineage_only",
    "explicitly_deferred",
    "stale_retired",
    "equivalent_with_evidence",
    "exact_present",
    "not_for_plan",
]

SUBAGENT_SUMMARY = [
    {
        "group": "atom exact-fidelity atom-0002..atom-0027",
        "status": "pass_with_notes",
        "summary": "No blocker. atom-0010 is stale/retired phase-boundary lineage after explicit compile/seal; atom-0017 WorkNode I/O contract is explicitly deferred to the compiler contract.",
    },
    {
        "group": "atom exact-fidelity atom-0028..atom-0053",
        "status": "warn",
        "summary": "atom-0035, atom-0041, atom-0049, and atom-0053 have missing/drifted details; atom-0045 has stale routing/lineage; atom-0046 needs ask_manual_decision/manual_decision adjudication if the longer key was intentional.",
    },
    {
        "group": "atom exact-fidelity atom-0054..atom-0104",
        "status": "warn",
        "summary": "0PI-056 compresses exact doc-path obligations for atom-0078/0080/0081; F3-395 drops exact GUI impact tokens from atom-0098; atom-0094 support does not cover newly added typed VerificationFinding fields.",
    },
    {
        "group": "PlanUnit reciprocal lineage",
        "status": "warn",
        "summary": "CV-288/SP-215 add VerificationFinding fields without complete reciprocal atom lineage; OSI-428 generated source_location points to the wrong source heading; MS-109 adds non-standard moved_owner_lineage.",
    },
    {
        "group": "owner routing",
        "status": "warn",
        "summary": "No wrong-owner blocker, but CV-288/SP-215 acceptance criteria do not force typed VerificationFinding fields, and SP-215 omits Permissions_System from implementation surfaces/owner hints while persisting write_mode/authority refs.",
    },
    {
        "group": "changed-doc fidelity",
        "status": "warn",
        "summary": "No PlanUnits added/deleted and no headings/ContractRefs removed. MS-109 leaks ledger atom ids into canonical_text and overstates where atom-0031/0032 were carried; GRS-026 uses canceled/resteered variants against existing Goal Replan vocabulary.",
    },
    {
        "group": "ledger consistency",
        "status": "warn",
        "summary": "Ledger projections agree on sealed/governance_status=sealed, but q-0007..q-0009 remain status=open with post_seal_followup_not_compiled, which is coherent ledger-only continuation but not one of the audit prompt's literal exception labels.",
    },
    {
        "group": "forbidden artifacts",
        "status": "pass_with_current_tree_warnings",
        "summary": "No range-created WorkNodes, NodeSeeds, executable queues, final node manifests, build tasks, implementation scaffold, or Iced resurrection. Current-tree warnings are audit-local helper scripts and an out-of-range tracked PyYAML bundle.",
    },
    {
        "group": "validator mutability",
        "status": "pending_validator_run",
        "summary": "run_validators.py records git status before and after every required validator.",
    },
]

MANUAL_ATOM_OVERRIDES = {
    "atom-0001": {"overall_status": "not_for_plan", "note": "Non-applicable atom."},
    "atom-0010": {"overall_status": "stale_retired", "note": "Phase-boundary no-write token retired by explicit compile/seal; boundary still preserved."},
    "atom-0017": {"overall_status": "explicitly_deferred", "note": "Concrete WorkNode exact input/output contract deferred to the future compiler contract."},
    "atom-0008": {"overall_status": "equivalent_with_evidence", "note": "The conversational 'three functions' phrasing is represented by Goal mode controls, invisible Doc Builder conversion, and Orchestrator Goal handoff semantics."},
    "atom-0027": {"overall_status": "equivalent_with_evidence", "note": "Governable/certifiable outcome is represented by bounded SubagentWave supervision and receipt-backed certification language."},
    "atom-0035": {"overall_status": "missing_or_drift", "note": "controller/planner/reviewer roles missing from compiled target blocks."},
    "atom-0040": {"overall_status": "source_lineage_only", "note": "Goal Controller exact label remains lineage/search wording while runtime authority is represented through Goal Runtime/Orchestrator owner split."},
    "atom-0041": {"overall_status": "missing_or_drift", "note": "high-end controller/planner decomposition into WorkGraph/bounded WorkNodes is not substantively present in EP-098."},
    "atom-0044": {"overall_status": "equivalent_with_evidence", "note": "Verification rerun requirement is represented; conversational token shape is normalized."},
    "atom-0045": {"overall_status": "source_lineage_only", "note": "behavior exists, but routing/lineage is stale: metadata targets F3-395 while repair-loop policy appears in F3-394 without atom-0045 lineage."},
    "atom-0046": {"overall_status": "equivalent_with_evidence", "note": "manual_decision exact token is present; ask_manual_decision summary wording needs adjudication only if intended as canonical key."},
    "atom-0049": {"overall_status": "missing_or_drift", "note": "validator failure, verifier unavailable, repair budget exhaustion, and degraded outcome are not substantively preserved."},
    "atom-0050": {"overall_status": "equivalent_with_evidence", "note": "False-completion guard is represented with normalized wording."},
    "atom-0053": {"overall_status": "missing_or_drift", "note": "defect signature detail narrows affected artifact/path/span to affected artifact."},
    "atom-0060": {"overall_status": "source_lineage_only", "note": "required validators label is carried by validation surfaces and lineage; no product-semantic blocker found in bounded review."},
    "atom-0068": {"overall_status": "source_lineage_only", "note": "Broad GUI surface vocabulary is partly lineage/index evidence rather than exact governed prose."},
    "atom-0069": {"overall_status": "source_lineage_only", "note": "Broad GUI surface vocabulary is partly lineage/index evidence rather than exact governed prose."},
    "atom-0078": {"overall_status": "source_lineage_only", "note": "0PI-056 compresses exact doc-path obligations into generic owner-map prose."},
    "atom-0080": {"overall_status": "source_lineage_only", "note": "0PI-056 omits several exact P1/P2 owner doc paths from canonical prose."},
    "atom-0081": {"overall_status": "source_lineage_only", "note": "0PI-056 omits several exact P1/P2 owner doc paths from canonical prose."},
    "atom-0084": {"overall_status": "source_lineage_only", "note": "Backlink audit shard path is source evidence, not canonical product prose."},
    "atom-0089": {"overall_status": "equivalent_with_evidence", "note": "Owner ambiguity rule is represented by PLS/PDS owner adjudication language with normalized wording."},
    "atom-0090": {"overall_status": "equivalent_with_evidence", "note": "Repair strategy/adjudication behavior is represented with normalized wording."},
    "atom-0094": {"overall_status": "missing_or_drift", "note": "Repair adds typed VerificationFinding details beyond atom-0094 exact field set support."},
    "atom-0096": {"overall_status": "source_lineage_only", "note": "old tests and typoed audit/verifications are preserved as source-lineage/search context, not canonical requirement terms."},
    "atom-0097": {"overall_status": "source_lineage_only", "note": "doc_impact_matrix and P0/P1/P2 are compile-planning source terms; canonical owner routing is summarized rather than reproduced exactly."},
    "atom-0098": {"overall_status": "missing_or_drift", "note": "F3-395 drops gui_impact_matrix and several exact GUI surface tokens."},
    "atom-0099": {"overall_status": "source_lineage_only", "note": "doc_impact_matrix is compile-planning source evidence rather than governed product prose."},
    "atom-0100": {"overall_status": "equivalent_with_evidence", "note": "Completion/certification semantics are represented; some exact planning tokens remain lineage-only."},
    "atom-0101": {"overall_status": "not_for_plan", "note": "Non-applicable atom."},
}


def run_git(args):
    return subprocess.check_output(["git", *args], cwd=ROOT, text=True)


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


def write_json(name, data):
    AUDIT_DIR.mkdir(parents=True, exist_ok=True)
    with (AUDIT_DIR / name).open("w") as f:
        json.dump(data, f, indent=2, sort_keys=True)
        f.write("\n")


def write_jsonl(name, rows):
    AUDIT_DIR.mkdir(parents=True, exist_ok=True)
    with (AUDIT_DIR / name).open("w") as f:
        for row in rows:
            f.write(json.dumps(row, sort_keys=True) + "\n")


def normalize(text):
    return re.sub(r"\s+", " ", str(text).strip()).lower()


def flatten(value):
    if value is None:
        return ""
    if isinstance(value, str):
        return value
    if isinstance(value, list):
        return "\n".join(flatten(item) for item in value)
    if isinstance(value, dict):
        return "\n".join(f"{key}: {flatten(val)}" for key, val in value.items())
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
            data = {"plan_unit_id": f"parse_error:{path}:{match.start()}", "parse_error": str(exc)}
        if not isinstance(data, dict) or not data.get("plan_unit_id"):
            continue
        data["_owner_file"] = path
        data["_line"] = text[: match.start()].count("\n") + 1
        data["_raw_yaml"] = block
        units[data["plan_unit_id"]] = data
    return units


def live_docs_and_units():
    docs = {}
    units = {}
    for path in sorted((ROOT / "Plans").glob("*.md")):
        rel = str(path.relative_to(ROOT))
        text = path.read_text()
        docs[rel] = text
        units.update(parse_planunits_from_text(text, rel))
    return docs, units


def planunits_at_ref(ref, path):
    try:
        text = run_git(["show", f"{ref}:{path}"])
    except subprocess.CalledProcessError:
        return {}, ""
    return parse_planunits_from_text(text, path), text


def governed_text(unit):
    return "\n".join(
        flatten(unit.get(field))
        for field in ["canonical_text", "acceptance_criteria", "negative_constraints", "validation_surfaces"]
        if unit.get(field)
    )


def metadata_text(unit):
    return "\n".join(
        flatten(unit.get(field))
        for field in ["source_lineage", "preserved_exact_tokens", "owner_hints", "implementation_surfaces", "node_compile_hint", "moved_owner_lineage"]
        if unit.get(field)
    )


def doc_prose_without_yaml(docs, paths):
    chunks = []
    for path in paths:
        if path in docs:
            chunks.append(re.sub(r"```yaml\n.*?\n```", "", docs[path], flags=re.DOTALL))
    return "\n".join(chunks)


def detail_status(detail, canonical, metadata, atom_status):
    if atom_status == "not_for_plan":
        return "not_for_plan"
    if not detail:
        return "not_for_plan"
    detail_norm = normalize(detail)
    canonical_norm = normalize(canonical)
    metadata_norm = normalize(metadata)
    if detail_norm in canonical_norm:
        return "exact_present"
    if any(term in detail_norm for term in ["deferred", "future", "not for plan"]) and any(term in canonical_norm for term in ["deferred", "future", "not for plan"]):
        return "explicitly_deferred"
    if any(term in detail_norm for term in ["stale", "retired", "legacy", "compatibility", "compat"]) and any(term in canonical_norm for term in ["stale", "retired", "legacy", "compatibility", "compat"]):
        return "stale_retired"
    words = sorted({w for w in re.findall(r"[a-z0-9_]+", detail_norm) if len(w) > 2})
    if len(words) >= 2:
        canonical_hits = sum(1 for word in words if word in canonical_norm)
        metadata_hits = sum(1 for word in words if word in metadata_norm)
        if canonical_hits >= max(2, int(len(words) * 0.72)):
            return "equivalent_with_evidence"
        if metadata_hits >= max(2, int(len(words) * 0.72)):
            return "source_lineage_only"
    if detail_norm in metadata_norm:
        return "source_lineage_only"
    return "missing_or_drift"


def infer_tokens(atom):
    found = []
    for text in [atom.get("title", ""), atom.get("canonical_summary", ""), *atom.get("exact_tokens", []), *atom.get("examples", [])]:
        for token in re.findall(r"\b[A-Za-z][A-Za-z0-9_]*\b(?:\s*\|\s*\b[A-Za-z][A-Za-z0-9_]*\b)+|\b[A-Za-z][A-Za-z0-9_]*_[A-Za-z0-9_]*\b", str(text)):
            if token not in found:
                found.append(token)
    return found


def status_from_results(results):
    counts = Counter(item["status"] for item in results)
    for status in STATUS_PRECEDENCE:
        if counts.get(status):
            return dict(counts), status
    return dict(counts), "source_lineage_only"


def queue_atom_ids(compile_queue):
    ids = set()
    for item in compile_queue.get("items", []):
        ids.update(item.get("source_atom_ids", []))
        ids.update(item.get("non_applicable_atom_ids", []))
        ids.update(item.get("deferred_atom_ids", []))
    ids.update(compile_queue.get("candidate_compile_plan", {}).get("source_lineage_pre_seal_ready_atom_ids", []))
    return ids


def build_atom_matrix(atoms, compile_queue, planunits, docs, compiled_plan_units):
    selected = queue_atom_ids(compile_queue)
    all_owner_docs = sorted({planunits[unit_id]["_owner_file"] for unit_id in compiled_plan_units if unit_id in planunits})
    all_canonical = "\n".join(governed_text(planunits[unit_id]) for unit_id in compiled_plan_units if unit_id in planunits)
    all_metadata = "\n".join(metadata_text(planunits[unit_id]) for unit_id in compiled_plan_units if unit_id in planunits)
    all_prose = doc_prose_without_yaml(docs, all_owner_docs)
    rows = []
    for atom in atoms:
        if atom["atom_id"] not in selected and atom.get("status") != "compiled_to_plan":
            continue
        output_ids = atom.get("compiled_output_plan_unit_ids") or []
        owner_docs = sorted({planunits[unit_id]["_owner_file"] for unit_id in output_ids if unit_id in planunits})
        canonical = "\n".join(governed_text(planunits[unit_id]) for unit_id in output_ids if unit_id in planunits)
        metadata = "\n".join(metadata_text(planunits[unit_id]) for unit_id in output_ids if unit_id in planunits)
        prose = doc_prose_without_yaml(docs, sorted(set(owner_docs + atom.get("owner_hints", []))))
        if not canonical:
            canonical = all_canonical
            metadata = all_metadata
            prose = all_prose
        details = {
            "source_refs": atom.get("source_refs", []),
            "exact_tokens": atom.get("exact_tokens", []),
            "examples": atom.get("examples", []),
            "field_key_enum_names": infer_tokens(atom),
            "negative_constraints": atom.get("negative_constraints", []),
            "stale_compat_terms": atom.get("compatibility_only_notes", []) + atom.get("stale_retired_notes", []),
            "owner_hints": atom.get("owner_hints", []),
        }
        results = []
        for category, values in details.items():
            for value in values:
                status = "source_lineage_only" if category == "source_refs" else detail_status(value, canonical + "\n" + prose, metadata, atom.get("status"))
                results.append({"category": category, "detail": value, "status": status})
        if not results and atom.get("status") == "not_for_plan":
            results.append({"category": "compile_disposition", "detail": atom.get("compile_disposition", "non-applicable"), "status": "not_for_plan"})
        counts, overall = status_from_results(results)
        manual = MANUAL_ATOM_OVERRIDES.get(atom["atom_id"])
        if manual:
            overall = manual["overall_status"]
            counts[overall] = max(1, counts.get(overall, 0))
        acceptance = []
        validation = []
        for unit_id in output_ids:
            unit = planunits.get(unit_id, {})
            acceptance.extend(unit.get("acceptance_criteria") or [])
            validation.extend(unit.get("validation_surfaces") or [])
        rows.append(
            {
                "atom_id": atom["atom_id"],
                "atom_type": atom.get("atom_type"),
                "status": atom.get("status"),
                "compile_disposition": atom.get("compile_disposition"),
                "source_refs": atom.get("source_refs", []),
                "compiled_output_plan_unit_ids": output_ids,
                "owner_hints": atom.get("owner_hints", []),
                "candidate_consumer_docs": sorted(set(owner_docs + atom.get("owner_hints", []))),
                "captured_details": details,
                "acceptance_validation_requirements": {"acceptance": sorted(set(map(str, acceptance))), "validation": sorted(set(map(str, validation)))},
                "evidence_plan_units": [{"plan_unit_id": unit_id, "owner_file": planunits.get(unit_id, {}).get("_owner_file"), "line": planunits.get(unit_id, {}).get("_line")} for unit_id in output_ids],
                "detail_results": results,
                "status_counts": counts,
                "overall_status": overall,
                "manual_review_note": manual.get("note") if manual else None,
            }
        )
    return rows


def source_ids(unit):
    atom_ids = []
    decision_ids = []
    correction_ids = []
    for entry in unit.get("source_lineage") or []:
        text = str(entry)
        for atom_id in re.findall(r"atom-\d+", text):
            if atom_id not in atom_ids:
                atom_ids.append(atom_id)
        for dec_id in re.findall(r"dec-\d+", text):
            if dec_id not in decision_ids:
                decision_ids.append(dec_id)
        for corr_id in re.findall(r"corr-\d+", text):
            if corr_id not in correction_ids:
                correction_ids.append(corr_id)
    return atom_ids, decision_ids, correction_ids


def changed_live_docs():
    return sorted(path for path in run_git(["diff", "--name-only", BASELINE, CURRENT]).splitlines() if re.match(r"^Plans/[^/]+\.md$", path))


def changed_doc_rows(changed_docs, atoms):
    atom_tokens = sorted({token for atom in atoms for token in atom.get("exact_tokens", []) if isinstance(token, str) and token}, key=len, reverse=True)
    rows = []
    changed_unit_ids = set()
    for doc in changed_docs:
        before_units, before_text = planunits_at_ref(BASELINE, doc)
        after_text = (ROOT / doc).read_text()
        after_units = parse_planunits_from_text(after_text, doc)
        before_ids = set(before_units)
        after_ids = set(after_units)
        changed_ids = []
        for unit_id in sorted(before_ids & after_ids):
            keys = ["canonical_text", "acceptance_criteria", "negative_constraints", "preserved_exact_tokens", "source_lineage", "implementation_surfaces", "depends_on"]
            before_sig = json.dumps({key: before_units[unit_id].get(key) for key in keys}, sort_keys=True)
            after_sig = json.dumps({key: after_units[unit_id].get(key) for key in keys}, sort_keys=True)
            if before_sig != after_sig:
                changed_ids.append(unit_id)
                changed_unit_ids.add(unit_id)
        diff = list(difflib.unified_diff(before_text.splitlines(), after_text.splitlines(), lineterm=""))
        added_text = "\n".join(line[1:] for line in diff if line.startswith("+") and not line.startswith("+++"))
        removed_headings = []
        removed_contractrefs = []
        removed_exact_tokens = []
        possible_losses = []
        replacements = []
        for line in diff:
            if not line.startswith("-") or line.startswith("---"):
                continue
            body = line[1:]
            if body.startswith("#"):
                removed_headings.append(body)
            if "ContractRef:" in body:
                removed_contractrefs.append(body)
            for token in atom_tokens:
                if token in body:
                    removed_exact_tokens.append(token)
                    if token in added_text:
                        replacements.append(token)
                    else:
                        possible_losses.append(token)
        rows.append(
            {
                "doc": doc,
                "added_planunits": sorted(after_ids - before_ids),
                "deleted_planunits": sorted(before_ids - after_ids),
                "changed_planunits": changed_ids,
                "removed_headings": sorted(set(removed_headings)),
                "removed_contractrefs": sorted(set(removed_contractrefs)),
                "removed_exact_tokens": sorted(set(removed_exact_tokens)),
                "intentional_replacements_or_reintroduced_tokens": sorted(set(replacements)),
                "possible_losses": sorted(set(possible_losses)),
                "subagent_findings": [],
                "semantic_drift_status": "review_required" if removed_contractrefs or possible_losses else "no_unexplained_removed_contractrefs_or_exact_tokens_detected",
            }
        )
    for row in rows:
        if row["doc"] == "Plans/Models_System.md":
            row["subagent_findings"].append("High: MS-109 canonical_text leaks ledger atom ids and falsely claims atom-0031/0032 are carried by EP-098/GRS-026/GRS-027.")
            row["semantic_drift_status"] = "review_required"
        if row["doc"] == "Plans/Goal_Runtime_System.md":
            row["subagent_findings"].append("Medium: GRS-026 uses canceled/resteered while existing owner vocabulary uses cancelled/re-steers/re-steer state.")
            row["semantic_drift_status"] = "review_required"
        if row["doc"] in {"Plans/Contracts_V0.md", "Plans/storage-plan.md"}:
            row["subagent_findings"].append("Low/medium: typed VerificationFinding fields were added but acceptance criteria do not force the complete new field set.")
            row["semantic_drift_status"] = "review_required"
    return rows, sorted(changed_unit_ids)


def build_planunit_claims(planunits, atoms, decisions, corrections, compiled_plan_units, changed_unit_ids):
    atoms_by_id = {row["atom_id"]: row for row in atoms}
    decisions_by_id = {row["decision_id"]: row for row in decisions}
    corrections_by_id = {row["correction_id"]: row for row in corrections}
    rows = []
    for unit_id in sorted(set(compiled_plan_units) | set(changed_unit_ids)):
        unit = planunits.get(unit_id)
        if not unit:
            rows.append({"plan_unit_id": unit_id, "status": "missing_planunit"})
            continue
        atom_ids, decision_ids, correction_ids = source_ids(unit)
        support = []
        for atom_id in atom_ids:
            support.append(flatten(atoms_by_id.get(atom_id, {})))
        for dec_id in decision_ids:
            support.append(flatten(decisions_by_id.get(dec_id, {})))
        for corr_id in correction_ids:
            support.append(flatten(corrections_by_id.get(corr_id, {})))
        support_norm = normalize("\n".join(support))
        claim_results = []
        for field in ["canonical_text", "acceptance_criteria", "negative_constraints"]:
            text = flatten(unit.get(field))
            words = sorted({w for w in re.findall(r"[a-z0-9_]+", normalize(text)) if len(w) > 4})
            if not words:
                status = "not_applicable"
                ratio = None
            else:
                hits = sum(1 for word in words if word in support_norm)
                ratio = round(hits / max(1, len(words)), 3)
                status = "supported_by_lineage" if ratio >= 0.45 else "partial_support_review_required"
            claim_results.append({"field": field, "support_status": status, "support_token_ratio": ratio, "text": text})
        subagent_findings = []
        if unit_id in {"CV-288", "SP-215"}:
            subagent_findings.append("High: typed VerificationFinding fields need reciprocal atom lineage; exact status token is compressed.")
        if unit_id == "OSI-428":
            subagent_findings.append("Medium: generated plan index source_location points to unrelated fenced-code comment heading instead of live PlanUnit heading.")
        if unit_id == "MS-109":
            subagent_findings.append("High: canonical_text leaks ledger ids and overstates moved atom-0031/0032 placement; moved_owner_lineage is non-standard PlanUnit key.")
        row_status = "review_required" if subagent_findings or any(item["support_status"] == "partial_support_review_required" for item in claim_results) else "supported"
        rows.append(
            {
                "plan_unit_id": unit_id,
                "owner_file": unit.get("_owner_file"),
                "line": unit.get("_line"),
                "source_lineage": unit.get("source_lineage") or [],
                "ledger_atom_ids": atom_ids,
                "ledger_decision_ids": decision_ids,
                "ledger_correction_ids": correction_ids,
                "claim_results": claim_results,
                "subagent_findings": subagent_findings,
                "status": row_status,
            }
        )
    return rows


def owner_routing_findings(planunits):
    rows = [
        {
            "finding_id": "owner-routing-cv288-acceptance-fields",
            "severity": "medium",
            "status": "missing_owner_impact",
            "doc": "Plans/Contracts_V0.md",
            "line": planunits.get("CV-288", {}).get("_line"),
            "plan_unit_id": "CV-288",
            "details": "CV-288 canonical_text adds VerificationFinding/finding type/failing check/affected artifact/root_cause_key/prior repair strategies, but acceptance criteria still validate the older smaller VerificationCycle field set.",
        },
        {
            "finding_id": "owner-routing-sp215-acceptance-fields",
            "severity": "medium",
            "status": "missing_owner_impact",
            "doc": "Plans/storage-plan.md",
            "line": planunits.get("SP-215", {}).get("_line"),
            "plan_unit_id": "SP-215",
            "details": "SP-215 storage text adds typed VerificationFinding fields, but storage acceptance criteria can pass while dropping them.",
        },
        {
            "finding_id": "owner-routing-sp215-permissions-ref",
            "severity": "medium",
            "status": "missing_cross_doc_ref",
            "doc": "Plans/storage-plan.md",
            "line": planunits.get("SP-215", {}).get("_line"),
            "plan_unit_id": "SP-215",
            "details": "SP-215 persists write_mode and authority-check refs but implementation_surfaces/owner_hints omit Permissions_System.",
        },
        {
            "finding_id": "owner-routing-summary",
            "severity": "info",
            "status": "no_wrong_owner_blocker_detected",
            "details": "No wrong-owner or consumer-only placement found in changed Models_System, Planning_Ledger_System, assistant-chat-design, Goal_Runtime_System, or orchestrator-subagent-integration hunks.",
        },
    ]
    return rows


def registry_entry(registry):
    for bucket in ["active_ledgers", "compiled_ledgers", "paused_ledgers", "sealed_ledgers"]:
        for row in registry.get(bucket, []):
            if row.get("ledger_id") == LEDGER_ID:
                return bucket, row
    return None, {}


def ledger_consistency(compile_queue):
    manifest = load_json(LEDGER_DIR / "manifest.json")
    current = load_json(LEDGER_DIR / "state" / "current.json")
    handoff = load_json(LEDGER_DIR / "state" / "handoff.json")
    open_items = load_json(LEDGER_DIR / "state" / "open_items.json")
    health = load_json(LEDGER_DIR / "validation" / "ledger_health.json")
    reg_entry = load_json(LEDGER_DIR / "registry_entry.json")
    bucket, registry_row = registry_entry(load_json(ROOT / "Plans" / "ledgers" / "v2" / "ledger_registry.json"))
    errors = []
    warnings = []
    open_questions = [q for q in open_items.get("open_questions", []) if q.get("status") == "open"]
    strict_allowed = {"deferred", "not_for_plan", "source_lineage_only"}
    coherent_allowed = strict_allowed | {"post_seal_followup_not_compiled"}
    problematic_open = [q.get("question_id") for q in open_questions if q.get("compile_disposition") not in coherent_allowed]
    post_seal_open = [q.get("question_id") for q in open_questions if q.get("compile_disposition") == "post_seal_followup_not_compiled"]
    if problematic_open:
        errors.append("open questions on sealed ledger lack deferred/not_for_plan/source_lineage_only disposition")
    if post_seal_open:
        warnings.append("q-0007..q-0009 use post_seal_followup_not_compiled; coherent as ledger-only continuation, but outside the audit prompt's literal deferred/not_for_plan/source_lineage_only exception labels")
    candidate = compile_queue.get("candidate_compile_plan", {})
    if candidate.get("active") or candidate.get("ready_atom_ids"):
        errors.append("candidate compile plan remains active or ready on sealed ledger")
    for label, obj in [("manifest", manifest), ("current", current), ("registry_entry", reg_entry), ("ledger_registry", registry_row)]:
        if obj.get("candidate_compile_owner_docs"):
            warnings.append(f"{label}.candidate_compile_owner_docs is non-empty")
    ids = set(manifest.get("compiled_plan_unit_ids", []))
    for label, obj in [("current", current), ("registry_entry", reg_entry), ("ledger_registry", registry_row)]:
        if set(obj.get("compiled_plan_unit_ids", [])) != ids:
            errors.append(f"{label}.compiled_plan_unit_ids differs from manifest")
    return {
        "ledger_id": LEDGER_ID,
        "registry_bucket": bucket,
        "statuses": {
            "manifest": manifest.get("status"),
            "manifest_governance_status": manifest.get("governance_status"),
            "current": current.get("status"),
            "current_governance_status": current.get("governance_status"),
            "compile_queue": compile_queue.get("status"),
            "compile_queue_governance_status": compile_queue.get("governance_status"),
            "ledger_health": health.get("status"),
            "registry_entry": reg_entry.get("status"),
            "registry_entry_governance_status": reg_entry.get("governance_status"),
            "ledger_registry": registry_row.get("status"),
            "ledger_registry_governance_status": registry_row.get("governance_status"),
        },
        "compiled_plan_unit_ids": manifest.get("compiled_plan_unit_ids", []),
        "compiled_owner_docs": manifest.get("compiled_owner_docs", []),
        "acceptable_open_questions": [q.get("question_id") for q in open_questions if q.get("question_id") not in problematic_open],
        "strict_policy_mismatch_open_questions": post_seal_open,
        "problematic_open_questions": problematic_open,
        "open_blockers": open_items.get("open_blockers", []),
        "handoff_open_questions": [q.get("question_id") for q in handoff.get("open_questions", [])],
        "candidate_compile_plan_active": candidate.get("active"),
        "candidate_ready_atom_ids": candidate.get("ready_atom_ids", []),
        "source_lineage_pre_seal_ready_atom_count": len(candidate.get("source_lineage_pre_seal_ready_atom_ids", [])),
        "warnings": warnings,
        "errors": errors,
        "status": "fail" if errors else "pass_with_warnings" if warnings else "pass",
    }


def index_summary(compiled_plan_units):
    plan_units = load_jsonl(ROOT / "Plans" / ".plan_index" / "plan_units.jsonl")
    acceptance = load_jsonl(ROOT / "Plans" / ".plan_index" / "acceptance_units.jsonl")
    coverage = load_json(ROOT / "Plans" / ".plan_index" / "coverage_report.json")
    deps = load_json(ROOT / "Plans" / ".plan_index" / "dependencies.json")
    readiness = load_json(ROOT / "Plans" / ".plan_index" / "node_readiness_report.json")
    indexed = {row.get("plan_unit_id") for row in plan_units}
    unresolved = []
    for row in plan_units:
        for dep in row.get("depends_on", []) or []:
            if dep and dep not in indexed:
                unresolved.append({"plan_unit_id": row.get("plan_unit_id"), "missing_dependency": dep})
    osi = [row for row in plan_units if row.get("plan_unit_id") == "OSI-428"]
    return {
        "plan_unit_count": len(plan_units),
        "acceptance_unit_count": len(acceptance),
        "coverage_report": coverage,
        "dependency_top_level_keys": sorted(deps.keys()),
        "unresolved_dependency_count": len(unresolved),
        "unresolved_dependency_examples": unresolved[:20],
        "compiled_plan_units_missing": sorted(set(compiled_plan_units) - indexed),
        "compiled_plan_units_indexed": sorted(set(compiled_plan_units) & indexed),
        "all_plan_units_have_gui_related": not [row for row in plan_units if "gui_related" not in row],
        "node_readiness_status": readiness.get("status"),
        "node_readiness_status_reason": readiness.get("status_reason"),
        "node_readiness_no_worknodes_created": readiness.get("no_worknodes_created"),
        "node_readiness_compiler_contract_status": readiness.get("compiler_contract_status"),
        "known_warning": "OSI-428 generated source_location appears to point to an unrelated fenced-code comment heading.",
        "osi_428_index_rows": osi[:1],
    }


def forbidden_scan(changed_files):
    added = run_git(["diff", "--name-only", "--diff-filter=A", BASELINE, CURRENT]).splitlines()
    generated_prefixes = ("Plans/_shards/", "Plans/.evidence/", "Plans/.plan_index/", "Plans/.plan_migration/")
    path_patterns = [
        re.compile(r"(^|/)WorkNodes?(/|$)", re.I),
        re.compile(r"(^|/)NodeSeeds?(/|$)", re.I),
        re.compile(r"NodeSeed", re.I),
        re.compile(r"executable[_ -]?queues?", re.I),
        re.compile(r"final[_ -]?node[_ -]?manifests?", re.I),
        re.compile(r"(final|production)[_ -]?build[_ -]?tasks?", re.I),
    ]
    implementation_patterns = [re.compile(r"(^|/)src/"), re.compile(r"\.(rs|slint|toml|lock|tsx|jsx|ts|js)$"), re.compile(r"Cargo\.toml$")]
    def generated(path):
        return path.startswith(generated_prefixes)
    range_forbidden = [p for p in changed_files if not generated(p) and not p.startswith("Plans/.audits/") and any(rx.search(p) for rx in path_patterns)]
    range_impl = [p for p in added if not generated(p) and not p.startswith("Plans/.audits/") and any(rx.search(p) for rx in implementation_patterns)]
    tracked = run_git(["ls-files"]).splitlines()
    current_forbidden = [p for p in tracked if not generated(p) and not p.startswith("Plans/.audits/") and any(rx.search(p) for rx in path_patterns)]
    legacy = [p for p in tracked if p.startswith("Plans/") and re.search(r"iced|legacy[_ -]?app|old[_ -]?rust", p, re.I)]
    return {
        "range_forbidden_path_hits": sorted(range_forbidden),
        "range_added_implementation_hits": sorted(range_impl),
        "current_forbidden_path_hits_outside_audits": sorted(current_forbidden),
        "old_rust_iced_resurrection_hits": sorted(legacy),
        "generated_governance_manifests_seen": [p for p in changed_files if generated(p) and p.endswith("manifest.json")][:100],
        "status": "blocked" if range_forbidden or range_impl or legacy else "pass",
    }


def semantic_risks(atom_rows, planunit_rows, owner_rows, changed_rows, ledger_json, idx_json, forbidden_json):
    risks = []
    for row in atom_rows:
        if row["overall_status"] not in {"missing_or_drift", "source_lineage_only"}:
            continue
        source_only_details = [item for item in row["detail_results"] if item["status"] == "source_lineage_only"]
        source_ref_only = source_only_details and all(item["category"] == "source_refs" for item in source_only_details) and not row.get("manual_review_note")
        if source_ref_only:
            continue
        if row["overall_status"] in {"missing_or_drift", "source_lineage_only"}:
            risks.append(
                {
                    "risk_id": f"atom-{row['atom_id']}-{row['overall_status']}",
                    "severity": "high" if row["overall_status"] == "missing_or_drift" else "medium",
                    "category": "atom_fidelity",
                    "status": row["overall_status"],
                    "atom_id": row["atom_id"],
                    "compiled_output_plan_unit_ids": row["compiled_output_plan_unit_ids"],
                    "details": row["manual_review_note"] or [item for item in row["detail_results"] if item["status"] == row["overall_status"]][:12],
                }
            )
    for row in planunit_rows:
        if row.get("subagent_findings"):
            risks.append(
                {
                    "risk_id": f"planunit-{row['plan_unit_id']}-reciprocal-lineage",
                    "severity": "high" if row["plan_unit_id"] in {"CV-288", "SP-215", "MS-109"} else "medium",
                    "category": "reciprocal_lineage",
                    "status": "review_required",
                    "plan_unit_id": row["plan_unit_id"],
                    "details": row["subagent_findings"],
                }
            )
    for row in owner_rows:
        if row["status"] not in {"no_wrong_owner_blocker_detected", "owner_refs_present"}:
            risks.append({"risk_id": row["finding_id"], "severity": row["severity"], "category": "owner_routing", "status": row["status"], "details": row})
    for row in changed_rows:
        if row["semantic_drift_status"] == "review_required":
            risks.append(
                {
                    "risk_id": f"changed-doc-{Path(row['doc']).stem}-review",
                    "severity": "high" if row["doc"] == "Plans/Models_System.md" else "medium",
                    "category": "changed_doc_fidelity",
                    "status": "review_required",
                    "details": {"doc": row["doc"], "subagent_findings": row["subagent_findings"], "possible_losses": row["possible_losses"][:20]},
                }
            )
    if ledger_json["status"] != "pass":
        risks.append({"risk_id": "ledger-consistency", "severity": "high" if ledger_json["errors"] else "medium", "category": "ledger_consistency", "status": ledger_json["status"], "details": ledger_json})
    if idx_json["compiled_plan_units_missing"] or idx_json["unresolved_dependency_count"]:
        risks.append({"risk_id": "plan-index-coverage", "severity": "high", "category": "index_governance", "status": "review_required", "details": idx_json})
    else:
        risks.append({"risk_id": "plan-index-osi428-source-location", "severity": "medium", "category": "index_governance", "status": "wrong_source_location", "details": idx_json["known_warning"]})
    if forbidden_json["status"] != "pass":
        risks.append({"risk_id": "forbidden-artifacts", "severity": "critical", "category": "forbidden_artifacts", "status": forbidden_json["status"], "details": forbidden_json})
    return risks


def main():
    docs, planunits = live_docs_and_units()
    atoms = load_jsonl(LEDGER_DIR / "records" / "design_atoms.jsonl")
    decisions = load_jsonl(LEDGER_DIR / "records" / "decisions.jsonl")
    corrections_path = LEDGER_DIR / "records" / "corrections.jsonl"
    corrections = load_jsonl(corrections_path) if corrections_path.exists() else []
    compile_queue = load_json(LEDGER_DIR / "state" / "compile_queue.json")
    manifest = load_json(LEDGER_DIR / "manifest.json")
    compiled_units = manifest.get("compiled_plan_unit_ids", [])
    changed_files = run_git(["diff", "--name-only", BASELINE, CURRENT]).splitlines()
    changed_docs = changed_live_docs()

    changed_rows, changed_unit_ids = changed_doc_rows(changed_docs, atoms)
    atom_rows = build_atom_matrix(atoms, compile_queue, planunits, docs, compiled_units)
    planunit_rows = build_planunit_claims(planunits, atoms, decisions, corrections, compiled_units, changed_unit_ids)
    owner_rows = owner_routing_findings(planunits)
    ledger_json = ledger_consistency(compile_queue)
    idx_json = index_summary(compiled_units)
    forbidden_json = forbidden_scan(changed_files)
    risks = semantic_risks(atom_rows, planunit_rows, owner_rows, changed_rows, ledger_json, idx_json, forbidden_json)

    audit_report = {
        "schema_id": "pm.semantic_audit_report.v1",
        "audit_id": AUDIT_DIR.name,
        "ledger_id": LEDGER_ID,
        "baseline_ref": BASELINE,
        "current_ref": CURRENT,
        "range_inference": {
            "current_ref_source": "HEAD",
            "baseline_ref_source": "HEAD parent",
            "evidence": [
                "HEAD is an audit-only commit that adds Plans/.audits/audit-20260617-002-orchestrator-goal-runtime-flow-semantic-repair-fidelity artifacts; it does not change live Plans, ledger records, .plan_index, or governance surfaces.",
                "The latest contiguous semantic PM cycle inside the HEAD-inclusive range is the parent repair commit 3bcc0a3a41cf35ecc1abcf8a3a84882ddc8a04bc, which touches the target ledger, live Plans docs, .plan_index, .plan_migration, shards, evidence, and Spec_Lock.",
                "ledger_registry.json lists the latest non-background ledger pldg-20260616-002-orchestrator-goal-runtime-flow under sealed_ledgers.",
                "The audited range keeps current_ref=HEAD as requested and uses baseline_ref=ea1a0d1d4d99888aaf37b8f84b567bfc9301cb96, the parent of the earliest semantic repair commit in the contiguous HEAD-inclusive group.",
            ],
        },
        "changed_files": changed_files,
        "changed_files_count": len(changed_files),
        "changed_live_plan_docs": changed_docs,
        "compiled_plan_unit_ids": compiled_units,
        "changed_plan_unit_ids": changed_unit_ids,
        "atom_matrix_summary": dict(Counter(row["overall_status"] for row in atom_rows)),
        "planunit_claim_summary": dict(Counter(row["status"] for row in planunit_rows)),
        "owner_routing_summary": dict(Counter(row["status"] for row in owner_rows)),
        "changed_doc_summary": {row["doc"]: {"added": row["added_planunits"], "deleted": row["deleted_planunits"], "changed": row["changed_planunits"], "status": row["semantic_drift_status"]} for row in changed_rows},
        "ledger_status": ledger_json["status"],
        "index_summary": idx_json,
        "forbidden_artifacts": forbidden_json,
        "semantic_risk_summary": dict(Counter(row["category"] for row in risks)),
        "semantic_risk_severity_summary": dict(Counter(row["severity"] for row in risks)),
        "subagent_summary": SUBAGENT_SUMMARY,
        "preliminary_status": "BLOCKED" if forbidden_json["status"] != "pass" or ledger_json["errors"] else "PASS_WITH_WARNINGS" if risks else "PASS",
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
