# audit-20260619-005-prd-planning-wizard-latest-head-semantic-fidelity

Status: PASS_WITH_WARNINGS

## IDs And Range
- ledger_id: `pldg-20260618-001-prd-planning-wizard`
- audit_id: `audit-20260619-005-prd-planning-wizard-latest-head-semantic-fidelity`
- current_ref: `da55b1732f484a60d16cd716a6ac81eec04fb493`
- baseline_ref: `242415aba82384c58032bcaed49ad0819d8551c8`
- range: `242415ab..HEAD`
- inference: latest sealed non-background registry ledger plus newest target-ledger/registry commit; `pldg-20260610-001-ledger-plan-system` excluded because newer relevant sealed ledgers exist.

## Changed Files
- Live non-pipeline Plans docs: `Plans/Plan_To_Node_Compilation.md`
- Ledger/registry projections: 9 target-ledger or registry files
- Generated governance/index/shards/evidence: `Plans/.plan_index/**`, `Plans/_shards/**`, `Plans/.evidence/**`, `Plans/Spec_Lock.json`
- Audit artifacts: audit-004 repair bundle plus closure registry rows

## PlanUnit Deltas
- Added: none
- Deleted: none
- Substantive changed PlanUnit: `PNC-014` only, adding `source_atom_ids` metadata for `atom-0002`, `atom-0101` through `atom-0106`, and `atom-0109`.
- Hash/location-only generated index churn: `PNC-001` through `PNC-013`, `PNC-015` through `PNC-017`.

## Semantic Fidelity
- Atom matrix: 168 rows; 92 `exact_present`, 62 `equivalent_with_evidence`, 14 `previously_closed`, 0 `missing_or_drift`.
- Reciprocal lineage: 62/62 PlanUnits supported; no overclaims, missing lineage, enum/key-shape drift, or merged unrelated requirements remain open.
- Unclosed live Plans/ledger exact-detail losses: none.
- Warning: the prior audit-004 `REPAIR_REPORT.md` still says to "review or commit" that package. Current ledger projections and this audit treat that as historical audit-artifact wording only, not live Plans or ledger drift.

## Closure Reuse
- Reused 20 audit-004 closure registry rows: 19 `repaired`, 1 `false_positive`.
- Hash checks matched for reusable closure evidence; no closed finding was reopened.

## Owner Routing
No open owner-routing findings. `PNC-014` remains correctly owned by `Plans/Plan_To_Node_Compilation.md`; contracts/schema/storage/permissions/GUI/governance concerns are either in their owners or closed/source-lineage-only.

## Ledger And Governance
- Ledger status/phase are consistent: sealed, `compiled_prd_planning_wizard_governance_sealed`.
- Open questions/blockers/active candidates/ready atoms: zero.
- Plan index validates: 5,166 PlanUnits, 18,423 acceptance units, node readiness intentionally `blocked_compiler_contract_incomplete`.
- Forbidden artifacts: none found; no WorkNodes, NodeSeeds, executable queues, final node manifests, GoalRuns, implementation files, runtime dispatch, or production build tasks.

## Validators
All substantive validators passed with clean before/after git status and no side effects. The bare `pm-plan-index.py validate` failed only because `yaml` is absent in the default environment; the `PYTHONPATH=/tmp/pm_pyyaml` invocation passed.

## Next Safe Action
No canonical Plans, ledger, index, or governance repair is required. Optional future audit-artifact hygiene can update the old audit-004 next-action wording if explicitly requested.

Compact repair prompt if needed:
`Audit-only hygiene: update only audit-20260619-004 REPAIR_REPORT.md/repair_report.json next_safe_action wording from review-or-commit to post-commit review/fresh audit; do not touch canonical Plans, ledgers, generated governance, indexes, WorkNodes, NodeSeeds, queues, manifests, implementation files, or runtime artifacts.`
