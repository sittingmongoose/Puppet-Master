# audit-20260619-002-prd-planning-wizard-head-semantic-fidelity

Status: **BLOCKED**

## IDs And Range

- ledger_id: `pldg-20260618-001-prd-planning-wizard`
- current_ref: `0ce8a6ae39f5ace00c157bddf865bf47c5428e37`
- baseline_ref: `be1fcd710906c1d3243cf6e2020de9ac13eebbfe`
- range: `be1fcd710906c1d3243cf6e2020de9ac13eebbfe..0ce8a6ae39f5ace00c157bddf865bf47c5428e37`
- earliest cycle commit: `c205ca50`
- inference evidence: latest sealed non-background registry entry, `Plans/00-plans-index.md` PRD Builder And Planning Wizard map, and git log over the ledger path/registry.

## Changed Files

- live non-pipeline Plan docs reviewed: 37
- ledger files in range: 39
- generated/governance files in range: 735
- audit files already in range before this audit: 63

## PlanUnit Deltas

- added PlanUnits: 61 (`0PI-059, ACD-421, ATS-005, ATS-006, ATS-007, ATS-008, ATS-009, ATS-010, BPM-008, C-050, CS-052, CV-290...`)
- modified PlanUnits: 59 (`0PI-055, 0PI-058, ACD-055, ACD-254, ACD-301, ACD-306, ACD-307, ACD-308, ACD-309, ACD-314, ACD-420, ATS-004...`)
- deleted PlanUnits: 0

## Atom Fidelity

- rows: 168
- classifications: `{'exact_present': 161, 'previously_closed': 7}`
- unclosed atom-level exact-detail losses/drift: none
- previously closed / reused closures: 18 rows; hash mismatches: 0

## Unclosed Risks

- `SR-LEDGER-README-PHASE-001` (high): Ledger README still declares phase ready_for_plan_compile even though registry/current/handoff describe a sealed, repair-validated cycle.
- `SR-LEDGER-CANONICAL-TARGETS-EMPTY-001` (high): Sealed ledger projections leave canonical_plan_targets empty even though the cycle created primary owner docs PRD_Builder.md and Planning_Wizard.md.
- `SR-SCHEMA-OUTPUT-UNDERREPORTED-001` (high): Plans/plans_to_code_handoff.schema.json changed in the cycle but is not declared as compiled owner/output coverage; it appears only in pre-seal source-lineage candidate docs.
- `SR-BOOTSTRAP-DOC-OUTPUT-DRIFT-001` (medium): Bootstrap workflow/prompt docs changed in the cycle but ledger projections inconsistently treat them as output/source-lineage only.
- `SR-GOVERNANCE-SEAL-OUTPUTS-INCOMPLETE-001` (medium): current.json governance_seal_outputs omits refreshed seal/closure artifacts named elsewhere, including plan_graph, auto_decisions, and the semantic closure registry.
- `SR-PNC014-RECIPROCAL-LINEAGE-001` (medium): PNC-014 source_lineage cites several PRD/Planning atoms that do not reciprocally list PNC-014, while PlanApproved handoff wording should also cite atom-0104/atom-0105.
- `SR-TOOLS-OWNER-IMPACT-MISSING-001` (medium): Current-ledger testing/tool PlanUnits route concrete helper behavior to Tools.md, but final compiled_owner_docs omit Tools.md and no current-ledger closure explains the owner impact.
- `SR-ASSISTANT-THREAD-FIELDS-CONDITIONAL-001` (low): Assistant Chat uses thread_type planning_wizard and thread_role without current-ledger contract/storage owner evidence; this is acceptable only if they are presentation-only fields.

## Reciprocal Lineage

- PlanUnit source-claim rows: 62
- `source_lineage_supported`: 61
- `lineage_reciprocity_gap`: 1 (`PNC-014`)

## Owner Routing

- findings: 5
- severity counts: `{'high': 2, 'medium': 2, 'low': 1}`
- no wrong-owner finding for GUI / Orchestrator / Run Graph split.

## Ledger And Governance

- ledger consistency: `fail`
- compact event/cursor state: `evt-0026` aligned; no active candidates/open questions/open blockers found.
- unclosed ledger/output drift remains in README phase, empty canonical targets, schema/bootstrap/tool output projection, and incomplete governance_seal_outputs.
- governance validators passed; structural gates do not cover the semantic projection gaps above.

## Validators And Mutability

Validator status: `pass`. No validator changed git status.

- `pm_audit_closure_validate_audit_only`: pass, side_effects=false
- `pm_bootstrap_ledger_validate`: pass, side_effects=false
- `pm_plan_index_validate`: pass, side_effects=false
- `pm_plan_migration_validate`: pass, side_effects=false
- `pm_plans_verify_run_gates`: pass, side_effects=false
- `pm_shard_plans_check`: pass, side_effects=false
- `pm_plans_verify_validate_auto_decisions`: pass, side_effects=false
- `pm_plans_verify_verify_spec_lock`: pass, side_effects=false
- `pm_plans_verify_validate_evidence`: pass, side_effects=false
- `pm_plans_verify_validate_plan_graph`: pass, side_effects=false
- `pm_plans_verify_audit_governance`: pass, side_effects=false
- `pm_plans_verify_validate_plans_to_code_handoff_schema`: pass, side_effects=false
- `git_diff_check`: pass, side_effects=false
- `forbidden_artifact_status_scan`: pass, side_effects=false

## Forbidden Artifacts

No WorkNodes, NodeSeeds, NodeSeed candidates, executable queues, final node manifests, GoalRuns, implementation files, Rust/Slint scaffolds, or production build tasks were created by this audit. The focused forbidden status scan passed.

## Next Safe Action

Run bounded repair from this audit bundle. Do not redo the compile or redesign product behavior; close the eight rows in `semantic_risks.jsonl` and the matching owner/lineage/ledger findings only.

## Compact Repair Prompt

```text
Repair audit-20260619-002 for ledger pldg-20260618-001-prd-planning-wizard. Bounded repair only; do not redo compile/design or create WorkNodes/NodeSeeds/queues/build/runtime artifacts. Read semantic_risks.jsonl, ledger_consistency.json, owner_routing_findings.jsonl, planunit_source_claims.jsonl. Fix README phase, canonical_plan_targets, schema/bootstrap/tool/governance output projections, PNC-014 reciprocal lineage, and conditional thread field owner routing. Write repair_closure_matrix.jsonl, repair_report.json, REPAIR_REPORT.md; update closure registry; run validators.
```
