# audit-20260619-001-prd-planning-wizard-final-semantic-fidelity

## Status

BLOCKED for exact semantic fidelity. Repo validators pass, but this audit found unclosed governance/projection/stale-terminology drift.

## IDs And Range

- `ledger_id`: `pldg-20260618-001-prd-planning-wizard`
- `audit_id`: `audit-20260619-001-prd-planning-wizard-final-semantic-fidelity`
- `baseline_ref`: `be1fcd710906c1d3243cf6e2020de9ac13eebbfe`
- `current_ref`: `28328e5ae97d0b9cd3815fd05ef7b6709917578b`
- `range`: `be1fcd710906c1d3243cf6e2020de9ac13eebbfe..28328e5ae97d0b9cd3815fd05ef7b6709917578b`
- `cycle_start_commit`: `c205ca507832a23c9393c6e470229cc72f7f5eeb`
- Inference: latest non-background sealed ledger in `Plans/ledgers/v2/ledger_registry.json`; first current-cycle ledger-dir commit is `c205ca507832a23c9393c6e470229cc72f7f5eeb`, so baseline is its parent. `pldg-20260610-001-ledger-plan-system` was excluded as the older system ledger.

## Changed Files

- Total changed paths in range: 837
- Changed live non-pipeline Plan docs inspected: 39
- `Plans/00-plans-index.md`
- `Plans/Automated_Testing_System.md`
- `Plans/Bootstrap_Planning_Migration.md`
- `Plans/Commands_System.md`
- `Plans/Contracts_V0.md`
- `Plans/Crosswalk.md`
- `Plans/Executor_Protocol.md`
- `Plans/FileSafe.md`
- `Plans/FinalGUISpec.md`
- `Plans/GitHub_API_Auth_and_Flows.md`
- `Plans/GitHub_Integration.md`
- `Plans/Goal_Runtime_System.md`
- `Plans/Media_Generation_and_Capabilities.md`
- `Plans/Models_System.md`
- `Plans/Multi-Account.md`
- `Plans/Orchestrator_Page.md`
- `Plans/PRD_Builder.md`
- `Plans/Permissions_System.md`
- `Plans/Personas.md`
- `Plans/Plan_Document_System.md`
- `Plans/Plan_To_Node_Compilation.md`
- `Plans/Planning_Ledger_System.md`
- `Plans/Planning_Wizard.md`
- `Plans/Progression_Gates.md`
- `Plans/Project_Output_Artifacts.md`
- `Plans/Run_Graph_View.md`
- `Plans/Runtime_Artifacts_Panel.md`
- `Plans/Spec_Lock.json`
- `Plans/UI_Command_Catalog.md`
- `Plans/Wiring_Matrix.md`
- `Plans/WorktreeGitImprovement.md`
- `Plans/assistant-chat-design.md`
- `Plans/bootstrap/Bootstrap_Planning_Workflow.md`
- `Plans/bootstrap/Codex_Prompts.md`
- `Plans/chain-wizard-flexibility.md`
- `Plans/chain-wizard.md`
- `Plans/human-in-the-loop.md`
- `Plans/plans_to_code_handoff.schema.json`
- `Plans/storage-plan.md`

## PlanUnit Deltas

- Baseline PlanUnits: 5105
- Current PlanUnits: 5166
- Added PlanUnits: 61
- Deleted PlanUnits: 0
- Semantically changed existing PlanUnits: 28
- Added IDs: `0PI-059, ACD-421, ATS-005, ATS-006, ATS-007, ATS-008, ATS-009, ATS-010, BPM-008, C-050, CS-052, CV-290, CW-009, CWF-152, EP-104, EP-105, F2-190, F3-398, GAAAF-013, GI-032, GRS-031, HITL-037, MA-061, MGAC-093, MS-112, OP-025, P-054, PDS-016, PG-059, PLS-014, PNC-015, PNC-016, PNC-017, POA-049, PRDB-001, PRDB-002, PRDB-003, PRDB-004, PRDB-005, PRDB-006, PRDB-007, PS-117, PWIZ-001, PWIZ-002, PWIZ-003, PWIZ-004, PWIZ-005, PWIZ-006, PWIZ-007, PWIZ-008, PWIZ-009, PWIZ-010, PWIZ-011, PWIZ-012, PWIZ-013, RAP-030, RGV-014, SP-216, UCC-097, W-073, WM-038`

## Atom Fidelity

- Matrix rows: 168
- Classifications: `{'exact_present': 161, 'previously_closed': 7}`
- Open atom-level missing_or_drift rows: 0
- Previously closed atom rows reused: 7

## Unclosed Drift

1. `SR-GOV-PENDING-FOOTERS-001` [high]: New canonical owner docs still state generated shards, evidence, Spec Lock, plan graph, and auto_decisions are pending even though the ledger registry and handoff record a validated governance seal and post-audit repair.
2. `SR-GOV-COVERAGE-GAP-001` [high]: PRD_Builder.md and Planning_Wizard.md are canonical indexed owner docs but are absent from Spec_Lock, sharding_config, generated shard directories, and plan_graph coverage; current validators pass because they validate configured entries, not completeness for new owner docs.
3. `SR-PNC006-FUTURE-CHAIN-WIZARD-001` [high]: PNC-006 still names Future Chain Wizard as the native Goal Mode compiler handoff authority after Planning Wizard became the canonical current product name.
4. `SR-PLS012-PLAN-WIZARD-001` [medium]: PLS-012 semantic closure registry prose still says Plan Wizard without a local compatibility/stale-retired note.
5. `SR-BOOTSTRAP-CHAIN-WIZARD-001` [medium]: Bootstrap Planning Workflow still frames the missing native product as Chain Wizard rather than Planning Wizard or an explicit legacy/bootstrap-only phrase.
6. `SR-LEDGER-CANDIDATE-OWNER-DOCS-001` [medium]: Sealed ledger projections still carry active candidate_compile_owner_docs lists instead of an explicit source-lineage/pre-seal disposition.
7. `SR-LEDGER-CURRENT-CURSOR-STALE-001` [medium]: current.json nested cursor still points to evt-0024 and says to run final validators, while top-level current and handoff point to evt-0025 and repair_validated.

## Previously Closed

- Closure reuse rows: 10
- Hash-valid previously closed rows reused: 10
- Reused closures cover the audit-009 `PNC-014`/`H-001` authority repair and handoff `auto_decisions` provenance repair. These are not reopened.

## Reciprocal Lineage

- PlanUnit source-claim rows: 62
- Status counts: `{'source_lineage_supported': 61, 'previously_closed': 1}`
- The 61 compile-queue PlanUnits are reciprocal. `PNC-014` carries post-repair latest-ledger lineage and is classified as `previously_closed` through audit-009 closure rows.

## Owner Routing

No unclosed wrong-owner or consumer-only placement findings. Owner-routing subagent found PRD Builder, Planning Wizard, Automated Testing, Plan Compile/Executor/Goal Runtime, contracts, storage, permissions, artifacts, GUI, commands, and routing split correctly. Stale terminology and governance coverage issues are tracked as semantic/governance risks, not owner-placement failures.

## Ledger And Governance

- Ledger state: `sealed` / `compiled_prd_planning_wizard_governance_sealed`
- Ledger health: `pass_governance_sealed`
- Ledger consistency status: `fail`
- Node readiness remains intentionally `blocked_compiler_contract_incomplete`.
- Governance coverage risk remains open because `PRD_Builder.md` and `Planning_Wizard.md` are canonical indexed owner docs but are absent from direct Spec Lock/sharding/plan_graph coverage.

## Validators

All validators passed with no side effects:

- `pm_audit_closure_validate_registry`: pass (side effects: False)
- `pm_bootstrap_ledger_validate`: pass (side effects: False)
- `pm_plan_index_validate`: pass (side effects: False)
- `pm_plan_migration_validate`: pass (side effects: False)
- `pm_plans_verify_run_gates`: pass (side effects: False)
- `pm_shard_plans_check`: pass (side effects: False)
- `pm_plans_verify_validate_auto_decisions`: pass (side effects: False)
- `pm_plans_verify_verify_spec_lock`: pass (side effects: False)
- `pm_plans_verify_validate_evidence`: pass (side effects: False)
- `pm_plans_verify_validate_plan_graph`: pass (side effects: False)
- `pm_plans_verify_audit_governance`: pass (side effects: False)
- `pm_plans_verify_validate_plans_to_code_handoff_schema`: pass (side effects: False)
- `git_diff_check`: pass (side effects: False)

## Forbidden Artifacts

No WorkNodes, NodeSeeds, executable queues, final node manifests, GoalRuns, runtime dispatch artifacts, product implementation files, Rust/Slint app scaffolds, Cargo files, or production build tasks were found.

## Next Safe Action

Run a bounded repair from this audit bundle. Fix each `semantic_risks.jsonl` row, then write `repair_closure_matrix.jsonl`, update the semantic closure registry, and rerun the same validators. Do not redo compile, redesign the feature, enable PlanCompile runtime, create WorkNodes/NodeSeeds/queues, or hand-edit generated governance.

## Compact Repair Prompt

```text
/goal Repair audit audit-20260619-001-prd-planning-wizard-final-semantic-fidelity for ledger pldg-20260618-001-prd-planning-wizard. Bounded repair only; do not redo compile or redesign. Read FINAL_REPORT.md, audit_report.json, semantic_risks.jsonl, atom_fidelity_matrix.jsonl, planunit_source_claims.jsonl, ledger_consistency.json, closure_reuse.jsonl, validator_results.json, and _semantic_closure_registry.jsonl. Close every semantic_risks row: stale governance footers in PRD_Builder/Planning_Wizard, governance coverage gap for new owner docs, PNC-006 Future Chain Wizard, PLS-012 Plan Wizard wording, bootstrap Chain Wizard wording, sealed candidate_compile_owner_docs, and stale current.cursor. Use scripts for generated governance only in an explicit seal phase; no hand-edits to shards/evidence/Spec_Lock. No WorkNodes, NodeSeeds, queues, manifests, implementation files, runtime dispatch, or build tasks. Write repair_closure_matrix.jsonl, repair_report.json, REPAIR_REPORT.md, registry rows, and rerun validators with git status before/after.
```
