# Shard 016: Ledger Compile Addendum - pldg-20260618-001-prd-planning-wizard

Source: `Plans/00-plans-index.md`

Source lines: L4250-L4353

Source SHA256: `8820360e61300e26b1e170259a6c878f0c29919a4912a4c05fabcfa4ae32b86a`

---

## Ledger Compile Addendum - pldg-20260618-001-prd-planning-wizard

This addendum compiles source-lineage obligations from bootstrap ledger `pldg-20260618-001-prd-planning-wizard` into this existing owner or consumer doc. It does not create WorkNodes, NodeSeeds, executable queues, GoalRuns, implementation files, generated governance artifacts, or production build tasks.

### 0PI-059 - PRD Builder And Planning Wizard Owner Map

```yaml
plan_unit_id: 0PI-059
unit_type: requirement
status: accepted
owner_doc: Plans/00-plans-index.md
canonical_text: 'Create Plans/PRD_Builder.md and Plans/Planning_Wizard.md using the New Plan Authoring Profile and make them authoritative owners for their respective finished-product workflows. Review, split, update, or retire Plans/chain-wizard.md and Plans/chain-wizard-flexibility.md into the new PRD Builder and Planning Wizard owners, preserving still-valid requirements and explicitly retiring stale workflow concepts. Run a doc-impact pass over Assistant Chat, Goal Runtime, Planning Ledger, Plan Document, Plan Compile, Automated Testing, Executor, Orchestrator, Personas, Models, FileSafe, Git/worktree, GitHub, permissions, contracts, commands, GUI, wiring, artifacts, indexes, and reference docs. After canonical owner and consumer docs are stable, regenerate allowed PlanUnit indexes, then shards, evidence, Spec Lock, plan graph, and governance decisions in the established separate phases. The finished-product feature formerly called
  Requirements Doc Builder is named PRD Builder everywhere in user-facing UI and canonical product documentation. The canonical product name is Planning Wizard; Chain Wizard and Plan Wizard are stale names that must be retired from active product prose, UI, commands, events, and contracts. PRD Builder captures and normalizes planning-intake product intent; Planning Wizard consumes an approved PRD Pack or normalized requirements input and resolves implementation-ready planning.'
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
- Plans/00-plans-index.md
- Plans/Plan_Document_System.md
- Plans/PRD_Builder.md
- Plans/Planning_Wizard.md
- Plans/Crosswalk.md
- Plans/Wiring_Matrix.md
- Plans/Planning_Ledger_System.md
- Plans/FinalGUISpec.md
node_compile_hint:
  mode: canonical_planunit_from_bootstrap_ledger
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260618-001-prd-planning-wizard:atom-0158
- pldg-20260618-001-prd-planning-wizard:atom-0159
- pldg-20260618-001-prd-planning-wizard:atom-0160
- pldg-20260618-001-prd-planning-wizard:atom-0161
- pldg-20260618-001-prd-planning-wizard:atom-0001
- pldg-20260618-001-prd-planning-wizard:atom-0002
- pldg-20260618-001-prd-planning-wizard:atom-0004
- Plans/ledgers/v2/pldg-20260618-001-prd-planning-wizard/source_shards/10-doc-and-contract-impact.md#SRC-IMPACT
- Plans/ledgers/v2/pldg-20260618-001-prd-planning-wizard/source_shards/01-naming-and-boundaries.md#SRC-NAMING
source_atom_ids:
- atom-0158
- atom-0159
- atom-0160
- atom-0161
- atom-0001
- atom-0002
- atom-0004
decision_refs:
- dec-0029
- dec-0001
- dec-0002
correction_refs:
- corr-0001
- corr-0002
preserved_exact_tokens:
- Plans/PRD_Builder.md
- Plans/Planning_Wizard.md
- PlanProfile
- Plans/chain-wizard.md
- Plans/chain-wizard-flexibility.md
- doc-impact pass
- PlanUnit index
- governance seal
- PRD Builder
- Requirements Doc Builder
- Planning Wizard
- Chain Wizard
- Plan Wizard
- planning-intake
- Approved PRD Pack
- implementation-ready planning
negative_constraints:
- Do not perform a blind filename or term replacement that preserves obsolete ownership and workflow.
- Do not hand-edit generated shards, evidence, Spec Lock, or plan graph during the conversational ledger phase.
- Do not preserve Requirements Doc Builder as a current product feature name except in explicitly historical migration notes.
- Do not use Chain Wizard or Plan Wizard as current terminology.
- Do not collapse PRD Builder and Planning Wizard into one indistinguishable interview.
compatibility_only_notes:
- Chain Wizard, Plan Wizard, Requirements Doc Builder, Run Chain Wizard later, and Start Chain are retained only for historical migration, source-lineage, and search compatibility.
- Current product prose must use PRD Builder, Planning Wizard, Approve PRD for Planning Wizard, and Approve And Build.
stale_retired_dispositions:
- Active Chain Wizard and Plan Wizard ownership is retired.
- Current owner routing is PRD Builder intake -> Planning Wizard planning -> Approve And Build -> Orchestrator Plan Compile.
owner_hints:
- Plans/Plan_Document_System.md
- Plans/00-plans-index.md
- Plans/PRD_Builder.md
- Plans/Planning_Wizard.md
- Plans/Crosswalk.md
- Plans/Wiring_Matrix.md
- Plans/Planning_Ledger_System.md
- Plans/FinalGUISpec.md
```
