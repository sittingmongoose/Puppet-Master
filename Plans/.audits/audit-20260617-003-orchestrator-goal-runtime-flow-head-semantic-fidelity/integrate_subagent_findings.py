#!/usr/bin/env python3
import json
from collections import Counter
from pathlib import Path


AUDIT_DIR = Path(__file__).resolve().parent


def read_json(name):
    with (AUDIT_DIR / name).open() as f:
        return json.load(f)


def write_json(name, data):
    with (AUDIT_DIR / name).open("w") as f:
        json.dump(data, f, indent=2, sort_keys=True)
        f.write("\n")


def read_jsonl(name):
    rows = []
    with (AUDIT_DIR / name).open() as f:
        for line in f:
            line = line.strip()
            if line:
                rows.append(json.loads(line))
    return rows


def write_jsonl(name, rows):
    with (AUDIT_DIR / name).open("w") as f:
        for row in rows:
            f.write(json.dumps(row, sort_keys=True) + "\n")


def merge_rows(rows, additions, key):
    seen = {row.get(key) for row in rows}
    merged = list(rows)
    for row in additions:
        if row.get(key) not in seen:
            merged.append(row)
            seen.add(row.get(key))
    return merged


def main():
    audit = read_json("audit_report.json")
    ledger = read_json("ledger_consistency.json")
    risks = read_jsonl("semantic_risks.jsonl")
    owners = read_jsonl("owner_routing_findings.jsonl")
    claims = read_jsonl("planunit_source_claims.jsonl")
    changed = read_jsonl("changed_plan_fidelity.jsonl")
    atoms = read_jsonl("atom_fidelity_matrix.jsonl")

    subagent_summary = [
        {
            "group": "atom exact-fidelity atom-0002..atom-0035",
            "status": "warn",
            "summary": "Most early atoms are exact/equivalent/stale-retired, but atom-0035 loses controller/planner/reviewer role vocabulary in target PlanUnits.",
        },
        {
            "group": "atom exact-fidelity atom-0036..atom-0070",
            "status": "blocked",
            "summary": "Atoms 0036-0070 contain 58 compiled_output overclaims where target PlanUnits do not cite the atom; atom-0049 failure modes, atom-0059 GUI field labels, and atom-0070 Plan/PlanUnit + Node Graph routing remain incomplete.",
        },
        {
            "group": "atom exact-fidelity atom-0071..atom-0104",
            "status": "warn",
            "summary": "Atoms 0078-0082 exact doc-path obligations are compressed into broad owner-map prose; compile_queue.reason still contains stale proceed-to-compile text despite sealed state.",
        },
        {
            "group": "PlanUnit reciprocal lineage",
            "status": "blocked",
            "summary": "SP-215 omits atom-0053 lineage, atom-0053 path/span is compressed, MS-109 overclaims moved lineage and adds non-standard moved_owner_lineage, OSI-428 has weak cross-owner lineage plus wrong index source_location.",
        },
        {
            "group": "owner routing",
            "status": "pass_with_contradictory_evidence",
            "summary": "Focused owner adjudication found no wrong-owner blocker, but reciprocal-lineage and exact-fidelity slices still flag SP-215 Permissions_System routing and atom-0070 Plan_Document_System/GUI routing gaps.",
        },
        {
            "group": "changed-doc fidelity",
            "status": "warn",
            "summary": "No PlanUnits added/deleted and no headings/ContractRefs/preserved tokens removed; MS-109 leaks ledger ids into canonical_text and ACD-420 may need PNC-009 dependency metadata or demotion of exact PlanUnit id from canonical text.",
        },
        {
            "group": "ledger consistency/index/governance",
            "status": "blocked",
            "summary": "Projection surfaces agree on sealed/governance-sealed, but q-0007..q-0009 are open with post_seal_followup_not_compiled, which fails the prompt's literal deferred/not_for_plan/source_lineage_only exception list.",
        },
        {
            "group": "forbidden artifacts",
            "status": "blocked_current_tree_warn_range_pass",
            "summary": "No range-created WorkNodes, NodeSeeds, executable queues, final node manifests, build tasks, implementation scaffold, or Iced resurrection; ignored current-tree .claude credential files and committed audit-local absolute PYTHONPATH traces were found.",
        },
        {
            "group": "validator mutability",
            "status": "pass",
            "summary": "Full validator suite passed; before/after status matched and no non-audit side effects required revert.",
        },
    ]

    strict_open = ledger.get("strict_policy_mismatch_open_questions") or ["q-0007", "q-0008", "q-0009"]
    ledger.setdefault("errors", [])
    strict_error = "sealed ledger has open questions q-0007..q-0009 with post_seal_followup_not_compiled, not deferred/not_for_plan/source_lineage_only"
    if strict_error not in ledger["errors"]:
        ledger["errors"].append(strict_error)
    ledger["strict_policy_mismatch_open_questions"] = strict_open
    ledger["status"] = "fail"
    write_json("ledger_consistency.json", ledger)

    for atom_id, status, note in [
        ("atom-0035", "missing_or_drift", "Full agent-role vocabulary is not carried in target PlanUnits: controller, planner, reviewer are missing while executor/verifier/adjudicator/certifier/root_cause/replan are partial."),
        ("atom-0049", "missing_or_drift", "Budget exhaustion, validator failure, verifier unavailable, degraded outcome, and certified-complete failure semantics are generalized away in GRS-027."),
        ("atom-0059", "missing_or_drift", "Subagent/verification GUI fields are represented generically, but active waves, bounded task, model/capability lane, input boundaries, output status, and failure/retry state labels are compressed or dropped."),
        ("atom-0070", "missing_or_drift", "GUI Plan/PlanUnit + Node Graph requirement lacks Plan_Document_System PlanUnit ownership and claimed GUI outputs do not cite atom-0070."),
    ]:
        for row in atoms:
            if row.get("atom_id") == atom_id:
                row["overall_status"] = status
                row["manual_review_note"] = note
                row.setdefault("status_counts", {})[status] = max(1, row.get("status_counts", {}).get(status, 0))
    write_jsonl("atom_fidelity_matrix.jsonl", atoms)

    curated_risks = [
        {
            "risk_id": "head-audit-only-no-live-repair",
            "severity": "high",
            "category": "range_inference",
            "status": "no_live_repair_after_prior_audit",
            "details": "HEAD cd41074b only adds Plans/.audits/audit-20260617-002 artifacts; live semantic Plan content remains 3bcc0a3a.",
        },
        {
            "risk_id": "atoms-0036-0070-compiled-output-overclaims",
            "severity": "high",
            "category": "reciprocal_lineage",
            "status": "compiled_output_overclaim",
            "details": "Bounded subagent found 58 atom->PlanUnit output claims in atoms 0036-0070 where the target PlanUnit does not cite the current atom in source_lineage.",
        },
        {
            "risk_id": "atom-0059-gui-field-compression",
            "severity": "medium",
            "category": "atom_fidelity",
            "status": "missing_or_drift",
            "details": "Subagent/verification GUI fields are compressed or dropped from OP-022/F3-395.",
        },
        {
            "risk_id": "atom-0070-planunit-nodegraph-routing-gap",
            "severity": "high",
            "category": "owner_routing",
            "status": "missing_owner_impact",
            "details": "atom-0070 owner_hints include Plan_Document_System and GUI Plan/PlanUnit + Node Graph surfaces, but no Plan_Document_System PlanUnit is compiled and claimed GUI outputs omit atom-0070 lineage.",
        },
        {
            "risk_id": "acD420-pnc009-dependency-metadata-question",
            "severity": "low",
            "category": "changed_doc_fidelity",
            "status": "dependency_metadata_review",
            "details": "ACD-420 canonical_text routes compiler-boundary readiness to PNC-009, but depends_on does not include PNC-009; decide whether PNC-009 is normative or only a routing hint.",
        },
        {
            "risk_id": "compile-queue-stale-proceed-to-compile-text",
            "severity": "medium",
            "category": "ledger_consistency",
            "status": "stale_projection_text",
            "details": "compile_queue candidate plan is inactive/source-lineage-only, but reason text still says to proceed to explicit ledger-to-Plans compile while handoff/current say sealed.",
        },
        {
            "risk_id": "forbidden-current-tree-ignored-claude-credentials",
            "severity": "high",
            "category": "forbidden_artifacts",
            "status": "current_tree_secret_local_state",
            "details": "Ignored current-tree Claude credential/session files exist under .claude/. They are not tracked and not range-added, but violate the current-tree no-secrets/no-local-state audit target.",
            "paths": [".claude/.credentials.json", ".claude/_state/.credentials.json", ".claude/_state/.claude.json", ".claude/_state/.claude.json.backup"],
        },
        {
            "risk_id": "audit002-absolute-pythonpath-local-state",
            "severity": "medium",
            "category": "forbidden_artifacts",
            "status": "range_added_audit_local_machine_state",
            "details": "HEAD-added audit-002 validator_results.json records absolute /Users/... PYTHONPATH entries. This is audit-local, not product implementation, but it is committed local machine state.",
        },
        {
            "risk_id": "baseline-carried-pydeps-and-private-tmp-provenance",
            "severity": "medium",
            "category": "forbidden_artifacts",
            "status": "baseline_carried_local_machine_state",
            "details": "Current tree carries tracked audit vendored PyYAML deps and /private/tmp PYTHONPATH provenance from older audit/governance artifacts.",
        },
    ]
    risks = merge_rows(risks, curated_risks, "risk_id")
    write_jsonl("semantic_risks.jsonl", risks)

    owner_additions = [
        {
            "finding_id": "owner-routing-atom0070-plan-document-system-gap",
            "severity": "high",
            "status": "missing_owner_impact",
            "plan_unit_id": "atom-0070",
            "doc": "Plans/Plan_Document_System.md",
            "line": None,
            "details": "atom-0070 requires GUI Plan/PlanUnit pages, Node Graph/Run Graph, gui_related inheritance, receipt status, and compiler contract; no Plan_Document_System PlanUnit was compiled and claimed GUI outputs do not cite atom-0070.",
        },
        {
            "finding_id": "owner-routing-acd420-pnc009-dependency-review",
            "severity": "low",
            "status": "dependency_metadata_review",
            "plan_unit_id": "ACD-420",
            "doc": "Plans/assistant-chat-design.md",
            "line": 22202,
            "details": "ACD-420 canonical_text names Plan_To_Node_Compilation/PNC-009, but depends_on omits PNC-009. Add dependency if normative or demote exact PlanUnit id to routing metadata.",
        },
    ]
    owners = merge_rows(owners, owner_additions, "finding_id")
    write_jsonl("owner_routing_findings.jsonl", owners)

    for row in claims:
        if row.get("plan_unit_id") == "SP-215":
            row.setdefault("subagent_findings", []).append("High: SP-215 claims typed VerificationFinding/defect-signature fields but omits atom-0053 lineage.")
        if row.get("plan_unit_id") == "ACD-420":
            row.setdefault("subagent_findings", []).append("Low: PNC-009 is named in canonical_text but omitted from depends_on; review dependency intent.")
        if row.get("plan_unit_id") == "OSI-428":
            row.setdefault("subagent_findings", []).append("Medium: OSI-428 asserts Contracts/storage boundaries but omits direct owner-boundary atom-0014 lineage; index source_location is wrong.")
        if row.get("subagent_findings"):
            row["status"] = "review_required"
    write_jsonl("planunit_source_claims.jsonl", claims)

    for row in changed:
        if row.get("doc") == "Plans/assistant-chat-design.md":
            row.setdefault("subagent_findings", []).append("Low: ACD-420 names PNC-009 in canonical_text but depends_on omits it.")
            row["semantic_drift_status"] = "review_required"
    write_jsonl("changed_plan_fidelity.jsonl", changed)

    audit["subagent_summary"] = subagent_summary
    audit.setdefault("forbidden_artifacts", {})
    audit["forbidden_artifacts"]["subagent_current_tree_findings"] = [
        {
            "id": "FA-001",
            "severity": "high",
            "category": "secrets/current-tree",
            "range_created": False,
            "tracked": False,
            "paths": [".claude/.credentials.json", ".claude/_state/.credentials.json", ".claude/_state/.claude.json", ".claude/_state/.claude.json.backup"],
            "summary": "Ignored local Claude credential/session files are present in the live checkout.",
        },
        {
            "id": "FA-002",
            "severity": "medium",
            "category": "local-machine-state/range-added",
            "range_created": True,
            "tracked": True,
            "summary": "HEAD-added audit-002 validator_results.json records absolute /Users/... PYTHONPATH entries.",
        },
        {
            "id": "FA-003",
            "severity": "medium",
            "category": "local-machine-state/baseline-carried",
            "range_created": False,
            "tracked": True,
            "summary": "Audit vendored PyYAML deps and /private/tmp PYTHONPATH provenance remain in baseline/governance artifacts.",
        },
    ]
    audit["ledger_status"] = ledger["status"]
    audit["preliminary_status"] = "BLOCKED"
    audit["semantic_risk_summary"] = dict(Counter(row["category"] for row in risks))
    audit["semantic_risk_severity_summary"] = dict(Counter(row["severity"] for row in risks))
    audit["atom_matrix_summary"] = dict(Counter(row["overall_status"] for row in atoms))
    audit["planunit_claim_summary"] = dict(Counter(row["status"] for row in claims))
    write_json("audit_report.json", audit)


if __name__ == "__main__":
    main()
