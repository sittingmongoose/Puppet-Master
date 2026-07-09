# Shard 038: Ledger Compile Addendum - pldg-20260618-001-prd-planning-wizard

Source: `Plans/chain-wizard-flexibility.md`

Source lines: L10153-L10245

Source SHA256: `15df9ed3508b90683979c3b365810cd89cba46ef428dc390c6a6e969e33f5058`

---

## Ledger Compile Addendum - pldg-20260618-001-prd-planning-wizard

This addendum compiles source-lineage obligations from bootstrap ledger `pldg-20260618-001-prd-planning-wizard` into this existing owner or consumer doc. It does not create WorkNodes, NodeSeeds, executable queues, GoalRuns, implementation files, generated governance artifacts, or production build tasks.

### CWF-152 - PRD Builder And Planning Wizard Semantic Migration

```yaml
plan_unit_id: CWF-152
unit_type: constraint
status: retired
owner_doc: Plans/chain-wizard-flexibility.md
canonical_text: 'The finished-product feature formerly called Requirements Doc Builder is named PRD Builder everywhere in user-facing UI and canonical product documentation. The canonical product name is Planning Wizard; Chain Wizard and Plan Wizard are stale names that must be retired from active product prose, UI, commands, events, and contracts. Plans/chain-wizard.md and Plans/chain-wizard-flexibility.md are legacy compatibility/source-lineage consumers for material now owned by PRD Builder, Planning Wizard, Final GUI, and downstream PlanCompile/Executor owners. PMConcept and FinalGUISpec replace the old fixed Project Setup through Start Chain sequence with PRD Builder intake, dynamic Planning Run topics, live topic and plan projections, audits, Approve And Build, and Orchestrator Plan Compile navigation. Existing role styling, collapsible navigation, phase rows, live document panes, thread differentiation,
  activity indicators, worktree context, and selection-based chat context where compatible with the new architecture.'
gui_related: true
gui_classification_reason: Includes user-visible GUI/workspace/command/projection behavior.
depends_on: []
unblocks: []
acceptance_criteria:
- The live owner doc preserves every source atom listed in source_atom_ids without treating the ledger as canonical product prose.
- Exact tokens, negative constraints, owner hints, and accepted corrections remain available to future audits through this PlanUnit.
- No WorkNodes, NodeSeeds, executable queues, GoalRuns, implementation files, generated governance artifacts, or production build tasks are created by this compile.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260618-001-prd-planning-wizard
risk_class: owner_drift
reasoning_tier: high
context_scope: ledger_to_plans_compile
implementation_surfaces:
- Plans/chain-wizard-flexibility.md
- Plans/PRD_Builder.md
- Plans/FinalGUISpec.md
- Plans/00-plans-index.md
- Plans/Planning_Wizard.md
- Plans/assistant-chat-design.md
node_compile_hint:
  mode: canonical_planunit_from_bootstrap_ledger
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260618-001-prd-planning-wizard:atom-0001
- pldg-20260618-001-prd-planning-wizard:atom-0002
- pldg-20260618-001-prd-planning-wizard:atom-0159
- pldg-20260618-001-prd-planning-wizard:atom-0156
- pldg-20260618-001-prd-planning-wizard:atom-0157
- Plans/ledgers/v2/pldg-20260618-001-prd-planning-wizard/source_shards/01-naming-and-boundaries.md#SRC-NAMING
- Plans/ledgers/v2/pldg-20260618-001-prd-planning-wizard/source_shards/10-doc-and-contract-impact.md#SRC-IMPACT
- Plans/ledgers/v2/pldg-20260618-001-prd-planning-wizard/source_shards/08-gui-threads-and-navigation.md#SRC-GUI
source_atom_ids:
- atom-0001
- atom-0002
- atom-0159
- atom-0156
- atom-0157
decision_refs:
- dec-0001
- dec-0029
correction_refs:
- corr-0001
- corr-0002
preserved_exact_tokens:
- PRD Builder
- Requirements Doc Builder
- Planning Wizard
- Chain Wizard
- Plan Wizard
- Plans/chain-wizard.md
- Plans/chain-wizard-flexibility.md
- Start Chain
- Approve And Build
- collapsible navigation
- live document pane
- selection context
negative_constraints:
- Do not preserve Requirements Doc Builder as a current product feature name except in explicitly historical migration notes.
- Do not use Chain Wizard or Plan Wizard as current terminology.
- Do not perform a blind filename or term replacement that preserves obsolete ownership and workflow.
- Do not retain the old nine-step linear wizard as canonical UX.
compatibility_only_notes:
- Chain Wizard, Plan Wizard, Requirements Doc Builder, Run Chain Wizard later, and Start Chain are retained only for historical migration, source-lineage, and search compatibility.
- Current product prose must use PRD Builder, Planning Wizard, Approve PRD for Planning Wizard, and Approve And Build.
- Still-valid legacy details in this doc are consumer/source-lineage inputs and must route through current owner docs before implementation.
stale_retired_dispositions:
- Active Chain Wizard and Plan Wizard ownership is retired.
- The old fixed Project Setup through Start Chain sequence is retired as canonical UX.
- Current UX is PRD Builder intake -> dynamic PlanningRun topics -> live topic/plan projections -> audits/final integration -> Approve And Build -> Orchestrator Plan Compile.
owner_hints:
- Plans/PRD_Builder.md
- Plans/FinalGUISpec.md
- Plans/00-plans-index.md
- Plans/Planning_Wizard.md
- Concepts/PMConcept.html
- Plans/assistant-chat-design.md
```
