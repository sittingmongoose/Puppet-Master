# audit-20260618-007-prd-planning-wizard-post-repair-fidelity

Status: BLOCKED

## IDs And Range
- ledger_id: `pldg-20260618-001-prd-planning-wizard`
- current_ref: `61dce7d40082d509f1e7f035bfe626794b8dee95`
- baseline_ref: `be1fcd710906c1d3243cf6e2020de9ac13eebbfe`
- audited range: `be1fcd710906c1d3243cf6e2020de9ac13eebbfe..61dce7d40082d509f1e7f035bfe626794b8dee95`
- cycle start commit: `c205ca507832a23c9393c6e470229cc72f7f5eeb`

## Changed Files
Live non-pipeline Plans docs changed in range (37):
- M Plans/00-plans-index.md
- M Plans/Automated_Testing_System.md
- M Plans/Bootstrap_Planning_Migration.md
- M Plans/Commands_System.md
- M Plans/Contracts_V0.md
- M Plans/Crosswalk.md
- M Plans/Executor_Protocol.md
- M Plans/FileSafe.md
- M Plans/FinalGUISpec.md
- M Plans/GitHub_API_Auth_and_Flows.md
- M Plans/GitHub_Integration.md
- M Plans/Goal_Runtime_System.md
- M Plans/Media_Generation_and_Capabilities.md
- M Plans/Models_System.md
- M Plans/Multi-Account.md
- M Plans/Orchestrator_Page.md
- A Plans/PRD_Builder.md
- M Plans/Permissions_System.md
- M Plans/Personas.md
- M Plans/Plan_Document_System.md
- M Plans/Plan_To_Node_Compilation.md
- M Plans/Planning_Ledger_System.md
- A Plans/Planning_Wizard.md
- M Plans/Progression_Gates.md
- M Plans/Project_Output_Artifacts.md
- M Plans/Run_Graph_View.md
- M Plans/Runtime_Artifacts_Panel.md
- M Plans/UI_Command_Catalog.md
- M Plans/Wiring_Matrix.md
- M Plans/WorktreeGitImprovement.md
- M Plans/assistant-chat-design.md
- M Plans/bootstrap/Bootstrap_Planning_Workflow.md
- M Plans/bootstrap/Codex_Prompts.md
- M Plans/chain-wizard-flexibility.md
- M Plans/chain-wizard.md
- M Plans/human-in-the-loop.md
- M Plans/storage-plan.md

The range also includes ledger package files, prior audit/repair artifacts, PlanUnit index outputs, migration proof, shards, evidence, Spec Lock, and package/drop-in manifests. Generated artifacts were inspected as governance outputs only.

## PlanUnit Deltas
- Ledger compile queue items: 61
- Ledger PlanUnits: 61
- Ledger atoms compiled_to_plan: 168 / 168
- Reciprocal lineage: PASS for source_lineage/source_atom_ids/compile_queue reciprocity across the 61 ledger PlanUnits.
- Semantic caveat: lineage/token presence is not sufficient for the open findings below.

## Unclosed Drift
- HIGH SR-0C6C690A8AA9: Legacy Chain Wizard docs remain active owner/workflow prose instead of being fully split, updated, or retired into PRD Builder and Planning Wizard owners.
- HIGH SR-10539228E648: Planning Wizard rename is canonical, but active owner/index PlanUnits still use Plan Wizard or Chain Wizard as current terminology.
- HIGH SR-3781DB578801: PNC-015/atom-0110 say the runtime schema includes runtime-v2 launch policy fields, but the schema draft still carries only runtime_adapter among those fields.
- MEDIUM SR-C07297837B8B: Handoff projection contains a stale completed_work sentence saying governance artifacts were not refreshed, while the same handoff/current/registry say governance seal is complete.
- MEDIUM SR-AF18A2EF342D: The sealed ledger has no ready design atoms, but all accepted decisions and corrections still carry compile_disposition=ready_for_plan_compile.
- MEDIUM SR-B2E2E06B9A03: All 61 new PlanUnits carry atom-#### labels inside canonical_text even though source atom IDs are already represented in source_lineage/source_atom_ids.

## Previously Closed
- Reused prior PRD/Planning Wizard closure rows: 11
- Hash mismatches in reused closures: 0
- The prior audit-006 repairs for selected assistant-chat, Final GUI, UI command, model, installer, stale validation report, and generated-summary issues are not reopened here.

## Owner Routing
- BLOCKED on legacy Chain Wizard docs remaining active owners/authoritative workflow prose.
- BLOCKED on active `Plan Wizard` terminology in Goal Runtime, Plan Document, and Plans index owner/index PlanUnits after Planning Wizard became canonical.
- BLOCKED on runtime-v2 schema field ownership: PNC-015 names fields that the schema draft does not currently carry.

## Ledger And Governance
- Ledger validator: PASS.
- Ledger consistency audit: FAIL. Handoff compact state has a stale governance-output sentence, and 45 accepted non-atom records still carry `compile_disposition=ready_for_plan_compile` in a sealed ledger.
- Node readiness remains intentionally `blocked_compiler_contract_incomplete`; runtime remains `runtime_disabled`.
- Forbidden artifact scan: PASS. No actual WorkNodes, NodeSeeds, executable queues, final node manifests, dispatched GoalRuns, implementation files, production build tasks, or runtime dispatch artifacts found.

## Validators
13 / 13 validator commands passed with no git side effects. See `validator_results.json`.

## Next Safe Action
Open a bounded repair lane for the six explicit findings in `semantic_risks.jsonl`. Do not redo the whole compile, do not hand-edit generated governance artifacts outside a seal phase, and do not enable PlanCompile runtime or create WorkNodes/NodeSeeds.

## Compact Repair Prompt
Repair only `audit-20260618-007-prd-planning-wizard-post-repair-fidelity`: fix legacy wizard demotion, active Plan Wizard owner prose, runtime-v2 schema ownership, handoff projection contradiction, sealed non-atom compile dispositions, and atom labels in canonical_text. Regenerate required indexes/governance only in explicit allowed phases. No runtime artifacts.
