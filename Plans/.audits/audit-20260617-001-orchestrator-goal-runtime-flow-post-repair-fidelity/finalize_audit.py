#!/usr/bin/env python3
import json
from collections import Counter
from pathlib import Path


AUDIT_DIR = Path(__file__).resolve().parent
LEDGER_ID = "pldg-20260616-002-orchestrator-goal-runtime-flow"
BASELINE = "0406286cd7732d72c73a6a88c19519136b074536"
CURRENT = "506dde29cad8ec557088a875ff56ab8624c3af3f"


def read_json(path):
    with (AUDIT_DIR / path).open() as f:
        return json.load(f)


def write_json(path, data):
    with (AUDIT_DIR / path).open("w") as f:
        json.dump(data, f, indent=2, sort_keys=True)
        f.write("\n")


def read_jsonl(path):
    rows = []
    with (AUDIT_DIR / path).open() as f:
        for line in f:
            line = line.strip()
            if line:
                rows.append(json.loads(line))
    return rows


def write_jsonl(path, rows):
    with (AUDIT_DIR / path).open("w") as f:
        for row in rows:
            f.write(json.dumps(row, sort_keys=True) + "\n")


SUBAGENT_SUMMARY = [
    {
        "group": "atom exact-fidelity atoms 0002-0027",
        "status": "warn",
        "summary": "Most claims were exact/equivalent; atom-0014 governance-artifact owner claim, atom-0017 low-end/input-output details, and atom-0020 VerificationFinding token were missing or drifted.",
    },
    {
        "group": "atom exact-fidelity atoms 0028-0053",
        "status": "warn",
        "summary": "Several normalized terms are acceptable, but atom-0047 replan details and atom-0053 defect-signature schema fields lost exact canonical coverage.",
    },
    {
        "group": "atom exact-fidelity atoms 0054-0080",
        "status": "warn",
        "summary": "GUI/page atom semantics are broadly present; many exact GUI tokens remain partial or weak, especially Dashboard/Agents/PlanUnit page surface tokens and broad doc-path audit atoms.",
    },
    {
        "group": "atom exact-fidelity atoms 0081-0104",
        "status": "warn",
        "summary": "Compiler/governance boundaries are mostly preserved; several broad impact atoms are source-lineage only or overbroad in compiled_output metadata.",
    },
    {
        "group": "PlanUnit reciprocal lineage",
        "status": "warn",
        "summary": "EP-098 has thin permission/worktree reciprocal lineage; CV-288/SP-215 compress status enum tokens; MS-109 dropped baseline atom-0031/atom-0032 lineage while retaining related exact tokens.",
    },
    {
        "group": "owner routing",
        "status": "warn",
        "summary": "No wrong-owner blocker found, but OSI-428, PLS-011, ACD-420, and CV-288 need cross-owner refs; SP-215 blurs VerificationCycle status with broader projection status.",
    },
    {
        "group": "changed-doc fidelity",
        "status": "warn",
        "summary": "No PlanUnits added/deleted and no ContractRef loss; material changes require reconciliation in CV-288/SP-215 and MS-109 source-lineage disposition.",
    },
    {
        "group": "ledger/index/governance",
        "status": "warn",
        "summary": "Validators and index counts pass; registry_entry and ledger_registry still expose candidate_compile_owner_docs on a sealed ledger, and evidence narration has stale count text.",
    },
    {
        "group": "forbidden artifacts",
        "status": "pass_with_out_of_range_residuals",
        "summary": "No range-created WorkNodes, NodeSeeds, executable queues, final manifests, build tasks, implementation files, or legacy app resurrection; old Concepts prototypes and .claude local state remain out of range.",
    },
    {
        "group": "validator mutability",
        "status": "pass",
        "summary": "All 9 validators passed with identical before/after git status; only the expected untracked audit directory exists.",
    },
]


CURATED_RISKS = [
    {
        "risk_id": "semantic-status-shape-drift-cv288-sp215",
        "severity": "high",
        "category": "changed_doc_fidelity",
        "status": "missing_or_drift",
        "evidence": [
            "Plans/Contracts_V0.md:17184",
            "Plans/storage-plan.md:14942",
        ],
        "details": "CV-288 and SP-215 preserve VerificationCycle.status as failed | passed | blocked but also preserve ready/running/provisional_success/verifying/failed_verification/repairing/certified/failed/blocked/cancelled/stopped near verification-cycle wording, blurring narrow VerificationCycle status with broader GoalRun/WorkNode projection statuses.",
    },
    {
        "risk_id": "source-lineage-loss-ms109",
        "severity": "medium",
        "category": "reciprocal_lineage",
        "status": "missing_lineage_or_disposition",
        "evidence": [
            "Plans/Models_System.md:7333",
            "Plans/00-plans-index.md:3861",
        ],
        "details": "MS-109 correctly narrows Models ownership, but baseline atom-0031 and atom-0032 source refs were dropped while related exact tokens remain. Restore refs or add explicit moved/dispositioned lineage.",
    },
    {
        "risk_id": "sealed-registry-candidate-field-mismatch",
        "severity": "medium",
        "category": "ledger_consistency",
        "status": "source_lineage_only",
        "evidence": [
            "Plans/ledgers/v2/pldg-20260616-002-orchestrator-goal-runtime-flow/registry_entry.json:2",
            "Plans/ledgers/v2/ledger_registry.json:145",
        ],
        "details": "manifest/current/compile_queue correctly show no active candidates, but registry_entry.json and ledger_registry.json still expose candidate_compile_owner_docs on a sealed ledger.",
    },
    {
        "risk_id": "evidence-narration-count-drift",
        "severity": "medium",
        "category": "governance_evidence",
        "status": "equivalent_with_evidence",
        "evidence": [
            "Plans/.evidence/orchestrator-goal-runtime-flow-post-audit-repair-2026-06-16/evidence.json:15",
            "validator_results.json",
        ],
        "details": "Live validators agree on 5065 PlanUnits, 18074 acceptance units, and 906 shards, but evidence command excerpts still mention older counts such as 18068 acceptance units. Hash validation passes; narration is stale.",
    },
    {
        "risk_id": "owner-routing-cross-ref-gaps",
        "severity": "medium",
        "category": "owner_routing",
        "status": "missing_cross_doc_ref",
        "evidence": [
            "Plans/orchestrator-subagent-integration.md:31086",
            "Plans/Planning_Ledger_System.md:410",
            "Plans/Contracts_V0.md:17192",
            "Plans/assistant-chat-design.md:22202",
        ],
        "details": "OSI-428 should reference Contracts_V0/storage-plan for schema/persistence; PLS-011 should reference Bootstrap_Planning_Migration for seal timing; CV-288 should reference Permissions/Worktree for write_mode lease semantics; ACD-420 should directly reference Planning_Ledger_System and Plan_To_Node_Compilation.",
    },
    {
        "risk_id": "atom-exact-detail-losses",
        "severity": "high",
        "category": "atom_fidelity",
        "status": "missing_or_drift",
        "evidence": [
            "atom_fidelity_matrix.jsonl",
            "subagent atom windows",
        ],
        "details": "Exhaustive atom matrix records missing/partial exact details including atom-0014 governance artifacts, atom-0017 low-end/input-output contracts, atom-0020 VerificationFinding, atom-0047 affected WorkNodes/children/canceled/resteered/new revision, atom-0053 finding_type/failing_check/root_cause_key/prior repair strategies, and several GUI/doc-path exact tokens.",
    },
    {
        "risk_id": "forbidden-artifacts-out-of-range-residuals",
        "severity": "low",
        "category": "forbidden_artifacts",
        "status": "out_of_range_residual",
        "evidence": [
            "Concepts/AI Chat Interface Concept.html:565",
            "Concepts/pm-interactive.js:1",
            "Concepts/PMConcept.html:19532",
            ".claude/settings.local.json:4",
        ],
        "details": "No forbidden artifacts were created in the audited range. Current tree still has pre-existing Concepts executable prototypes and checked-in local Claude state outside Plans/.audits.",
    },
]


OWNER_FINDINGS = [
    {
        "finding_id": "owner-routing-osi428-missing-contract-storage-refs",
        "severity": "medium",
        "status": "missing_cross_doc_ref",
        "doc": "Plans/orchestrator-subagent-integration.md",
        "line": 31086,
        "details": "OSI-428 defines/records SubagentWave, bounded_work_unit, verification_cycle, receipt, write_mode, certification_tier, and evidence refs, but omits Contracts_V0 and storage-plan in owner refs.",
    },
    {
        "finding_id": "owner-routing-sp215-status-shape-blur",
        "severity": "medium",
        "status": "wrong_scope_wording",
        "doc": "Plans/storage-plan.md",
        "line": 14950,
        "details": "SP-215 names VerificationCycle status failed | passed | blocked but also calls ready/running/.../stopped verification cycle status values.",
    },
    {
        "finding_id": "owner-routing-pls011-missing-bpm-ref",
        "severity": "medium",
        "status": "missing_cross_doc_ref",
        "doc": "Plans/Planning_Ledger_System.md",
        "line": 410,
        "details": "PLS-011 discusses governance seal timing/generated-artifact refresh rules but omits Bootstrap_Planning_Migration/BPM-005 as owner for governance seal timing.",
    },
    {
        "finding_id": "owner-routing-acd420-missing-ledger-pnc-refs",
        "severity": "low",
        "status": "missing_cross_doc_ref",
        "doc": "Plans/assistant-chat-design.md",
        "line": 22202,
        "details": "ACD-420 touches ledger capture and work-graph preparation boundaries but routes only to Goal Runtime and Chain Wizard; direct PLS/PNC refs would prevent proxy ownership.",
    },
    {
        "finding_id": "owner-routing-cv288-missing-permissions-worktree-refs",
        "severity": "low",
        "status": "missing_cross_doc_ref",
        "doc": "Plans/Contracts_V0.md",
        "line": 17192,
        "details": "CV-288 carries write_mode in the shared envelope but omits Permissions_System and WorktreeGitImprovement refs that own write authority and lease semantics.",
    },
]


def merge_unique_rows(existing, additions, key):
    seen = {row.get(key) for row in existing}
    merged = list(existing)
    for row in additions:
        if row.get(key) not in seen:
            merged.append(row)
            seen.add(row.get(key))
    return merged


def main():
    audit_report = read_json("audit_report.json")
    ledger_consistency = read_json("ledger_consistency.json")
    validator_results = read_json("validator_results.json")
    semantic_risks = read_jsonl("semantic_risks.jsonl")
    owner_findings = read_jsonl("owner_routing_findings.jsonl")
    changed_rows = read_jsonl("changed_plan_fidelity.jsonl")
    planunit_claims = read_jsonl("planunit_source_claims.jsonl")
    atom_rows = read_jsonl("atom_fidelity_matrix.jsonl")

    semantic_risks = merge_unique_rows(semantic_risks, CURATED_RISKS, "risk_id")
    owner_findings = merge_unique_rows(owner_findings, OWNER_FINDINGS, "finding_id")

    for row in changed_rows:
        row.setdefault("subagent_findings", [])
        if row["doc"] in {"Plans/Contracts_V0.md", "Plans/storage-plan.md"}:
            row["subagent_findings"].append("High: status-shape drift between VerificationCycle.status failed|passed|blocked and broader GoalRun/WorkNode projection statuses.")
        if row["doc"] == "Plans/Models_System.md":
            row["subagent_findings"].append("Medium: MS-109 dropped baseline atom-0031/atom-0032 source refs while retaining related exact tokens; needs moved/dispositioned lineage.")
        if row["doc"] == "Plans/orchestrator-subagent-integration.md":
            row["subagent_findings"].append("Low: stray fence deletion appears intentional; no PlanUnit content loss found.")
    for row in planunit_claims:
        row.setdefault("subagent_findings", [])
        if row["plan_unit_id"] == "EP-098":
            row["subagent_findings"].append("Possible reciprocal-lineage gap: added PS-115/W-071 dependency/owner routing but source_lineage does not cite direct permission/worktree atoms.")
        if row["plan_unit_id"] in {"CV-288", "SP-215"}:
            row["subagent_findings"].append("Exact-token compression: ledger has separate status and failed | passed | blocked tokens; PlanUnit preserved_exact_tokens combines them as status failed | passed | blocked.")
        if row["plan_unit_id"] == "MS-109":
            row["subagent_findings"].append("Source-lineage loss: baseline atom-0031/atom-0032 dropped during owner correction while related exact tokens remain.")

    ledger_consistency.setdefault("warnings", [])
    for warning in [
        "registry_entry.json and ledger_registry.json expose candidate_compile_owner_docs despite sealed status; current/manifest/compile_queue correctly mark no active candidates.",
        "evidence narration includes stale count excerpts despite passing current validators.",
    ]:
        if warning not in ledger_consistency["warnings"]:
            ledger_consistency["warnings"].append(warning)
    ledger_consistency["status"] = "pass_with_warnings"
    ledger_consistency["registry_candidate_field_mismatch"] = {
        "status": "warn",
        "registry_entry_candidate_doc_count": 16,
        "ledger_registry_candidate_doc_count": 16,
        "manifest_candidate_doc_count": 0,
        "current_candidate_doc_count": 0,
        "compile_queue_active": False,
    }
    ledger_consistency["statuses"]["ledger_registry_status"] = "sealed"
    ledger_consistency["statuses"]["ledger_registry_governance_status"] = "sealed"
    ledger_consistency["evidence_count_drift"] = {
        "status": "warn",
        "current_plan_units": 5065,
        "current_acceptance_units": 18074,
        "current_shards_checked": 906,
        "stale_evidence_excerpt_acceptance_units": 18068,
    }

    atom_status_counts = Counter(row["overall_status"] for row in atom_rows)
    risk_counts = Counter(row["category"] for row in semantic_risks)
    severity_counts = Counter(row.get("severity", "unknown") for row in semantic_risks)

    audit_report.update(
        {
            "final_status": "PASS_WITH_WARNINGS",
            "validator_status": validator_results["status"],
            "validator_summary": validator_results["summary"],
            "subagent_summary": SUBAGENT_SUMMARY,
            "semantic_risk_count_final": len(semantic_risks),
            "semantic_risk_summary_final": dict(risk_counts),
            "semantic_risk_severity_summary": dict(severity_counts),
            "lead_findings": [
                "CV-288/SP-215 status-shape drift between VerificationCycle.status and broader GoalRun/WorkNode projection statuses.",
                "MS-109 source-lineage loss for atom-0031/atom-0032 after owner correction.",
                "Several atom exact details are partial, source-lineage-only, or missing in live governed prose.",
                "Sealed registry projections still expose candidate_compile_owner_docs; current/manifest/compile_queue are clean.",
                "Evidence narration has stale count excerpts despite passing hash/gate validation.",
                "No range-created forbidden WorkNodes/NodeSeeds/executable queues/build tasks were found.",
            ],
            "atom_matrix_summary_final": dict(atom_status_counts),
            "planunit_delta_summary": {
                "added": [],
                "deleted": [],
                "materially_changed": [
                    "CV-288",
                    "EP-098",
                    "GRS-002",
                    "GRS-026",
                    "GRS-027",
                    "MS-109",
                    "OP-022",
                    "RGV-012",
                    "SP-215",
                ],
                "moved_unchanged": ["PLS-011", "ACD-420"],
                "line_shift_only": ["PLS-004", "PLS-005", "PLS-006", "PLS-007", "PLS-008", "PLS-009", "PLS-010", "ACD-417", "ACD-418", "ACD-419", "OSI-425", "OSI-426", "OSI-427", "OSI-428"],
            },
            "next_safe_action": "Run a separate repair-only ledger/Plan pass for the warnings; do not repair within this audit.",
        }
    )

    write_jsonl("semantic_risks.jsonl", semantic_risks)
    write_jsonl("owner_routing_findings.jsonl", owner_findings)
    write_jsonl("changed_plan_fidelity.jsonl", changed_rows)
    write_jsonl("planunit_source_claims.jsonl", planunit_claims)
    write_json("ledger_consistency.json", ledger_consistency)
    write_json("audit_report.json", audit_report)

    final_report = f"""# {AUDIT_DIR.name}

Status: PASS_WITH_WARNINGS

## Inferred Range

- ledger_id: `{LEDGER_ID}`
- baseline_ref: `{BASELINE}`
- current_ref: `{CURRENT}`
- Inference: HEAD is the smallest contiguous recent committed cycle ending at the current ref and touching the target ledger, live Plans docs, `.plan_index`, governance artifacts, and ledger projections. The parent of HEAD is the baseline.

## Changed Files

Full changed-file inventory is in `audit_report.json`. The semantically audited live Plans docs changed in this range were:

- `Plans/Contracts_V0.md`
- `Plans/Executor_Protocol.md`
- `Plans/Goal_Runtime_System.md`
- `Plans/Models_System.md`
- `Plans/Orchestrator_Page.md`
- `Plans/Planning_Ledger_System.md`
- `Plans/Run_Graph_View.md`
- `Plans/assistant-chat-design.md`
- `Plans/orchestrator-subagent-integration.md`
- `Plans/storage-plan.md`

Generated/index/governance outputs also changed: `Plans/.plan_index/**`, `Plans/.plan_migration/**`, `Plans/_shards/**`, `Plans/.evidence/**`, `Plans/Spec_Lock.json`, and `Plans/auto_decisions.jsonl`.

## PlanUnit Deltas

- Added PlanUnits: none.
- Deleted PlanUnits: none.
- Materially changed: `CV-288`, `EP-098`, `GRS-002`, `GRS-026`, `GRS-027`, `MS-109`, `OP-022`, `RGV-012`, `SP-215`.
- Moved unchanged: `PLS-011`, `ACD-420`.
- Line-shift/grouping only: `PLS-004` through `PLS-010`, `ACD-417` through `ACD-419`, `OSI-425` through `OSI-428`.

## Exact-Detail Fidelity

The cycle is not a clean semantic PASS. The exhaustive atom matrix covers 104 atoms; final summary: `{dict(atom_status_counts)}`.

Lead exact-detail warnings:

- `CV-288` / `SP-215`: `VerificationCycle.status` is repaired to `failed | passed | blocked`, but both docs still place broader `ready/running/provisional_success/verifying/failed_verification/repairing/certified/failed/blocked/cancelled/stopped` wording close enough to blur VerificationCycle status with GoalRun/WorkNode projection status.
- `atom-0014`, `atom-0017`, `atom-0020`, `atom-0047`, `atom-0053`, and several GUI/doc-path atoms have exact tokens or source details that are missing, normalized, source-lineage-only, or only weakly evidenced in governed live Plan prose.
- `atom-0101` is correctly non-applicable/not-for-plan.

See `atom_fidelity_matrix.jsonl` and `semantic_risks.jsonl` for per-atom detail status.

## Reciprocal Lineage

- `EP-098` has thin reciprocal lineage for added `PS-115`/`W-071` dependency and owner routing.
- `CV-288` and `SP-215` compress separate ledger exact tokens `status` and `failed | passed | blocked` into `status failed | passed | blocked`.
- `MS-109` dropped baseline `atom-0031`/`atom-0032` source refs while related exact tokens remain; either restore refs or explicitly disposition the moved ownership.

## Owner Routing

No wrong-owner blocker was found, but cross-owner references need cleanup:

- `OSI-428` should reference `Contracts_V0` and `storage-plan` for schema/persistence consumption.
- `PLS-011` should reference `Bootstrap_Planning_Migration` for governance seal timing.
- `CV-288` should reference `Permissions_System` and `WorktreeGitImprovement` for `write_mode` authority/lease semantics.
- `ACD-420` should directly reference `Planning_Ledger_System` and `Plan_To_Node_Compilation` for ledger/work-graph boundaries.

## Ledger And Governance

- Ledger projections mostly agree: manifest/current/compile_queue sealed, no active candidate atoms, no ready-for-compile atoms, no blockers, and `q-0007` through `q-0009` are explicitly `post_seal_followup_not_compiled`.
- Warning: `registry_entry.json` and `ledger_registry.json` still expose 16 `candidate_compile_owner_docs` on a sealed ledger. Treat as source-lineage-only or move under explicit source-lineage fields.
- Warning: evidence narration has stale count excerpts (`18068` acceptance units) while current validators agree on 5065 PlanUnits, 18074 acceptance units, and 906 checked shards.
- `.plan_index` coverage is consistent: 68/68 docs covered, 5065 unique PlanUnits, 18074 acceptance units, no missing `gui_related`, no unresolved dependency refs. Node readiness remains intentionally `blocked_compiler_contract_incomplete`.

## Validators

All required validators passed with no repo mutation outside the already-untracked audit directory:

- `pm-bootstrap-ledger-validate`: pass.
- `pm-plan-index validate`: pass.
- `pm-plan-migration validate`: pass.
- `pm-plans-verify run-gates`: pass.
- `pm-shard-plans --check`: pass.
- `validate-auto-decisions`: pass.
- `verify-spec-lock`: pass.
- `validate-evidence`: pass.
- `git diff --check`: pass.

YAML-dependent validators used `PYTHONPATH=Plans/.audits/audit-20260616-008-orchestrator-goal-runtime-flow-post-repair/.pydeps` because bare local `python3` cannot import `yaml`.

## Forbidden Artifacts

No range-created WorkNodes, NodeSeeds, NodeSeed candidates, executable queues, final node manifests, production/final build tasks, Rust/Slint scaffold, implementation files, or legacy Iced resurrection were found.

Out-of-range residuals remain in the current tree: `Concepts/*` executable/prototype files and `.claude/settings.local.json`. They were not introduced by this audited range.

## Subagent Summary

{chr(10).join(f"- {item['group']}: {item['status']} - {item['summary']}" for item in SUBAGENT_SUMMARY)}

## Next Safe Action

Open a separate repair pass for the warnings. Do not repair inside this audit.

Compact repair prompt:

```text
Repair pldg-20260616-002 post-audit semantic warnings only. Do not broaden scope. Fix CV-288/SP-215 status-shape wording so VerificationCycle.status is only failed | passed | blocked and ready/running/.../stopped are scoped to GoalRun/WorkNode projections or compatibility-only. Restore or explicitly disposition MS-109 atom-0031/atom-0032 lineage. Add missing owner refs for OSI-428, PLS-011, CV-288, and ACD-420. Move sealed registry candidate_compile_owner_docs to explicit source-lineage fields or clear active candidate fields. Refresh generated index/shards/evidence/Spec_Lock only through governance scripts and rerun all gates. Do not create WorkNodes, NodeSeeds, executable queues, implementation files, or build tasks.
```
"""
    (AUDIT_DIR / "FINAL_REPORT.md").write_text(final_report)


if __name__ == "__main__":
    main()
