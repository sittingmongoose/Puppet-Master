# Shard 014: Ledger Compile Addendum - pldg-20260618-001-prd-planning-wizard

Source: `Plans/Crosswalk.md`

Source lines: L3190-L3267

Source SHA256: `26055c82552be4d6c4fd366f4149878c7db0c215e6e0ae58abc863e03ce4caeb`

---

## Ledger Compile Addendum - pldg-20260618-001-prd-planning-wizard

This addendum compiles source-lineage obligations from bootstrap ledger `pldg-20260618-001-prd-planning-wizard` into this existing owner or consumer doc. It does not create WorkNodes, NodeSeeds, executable queues, GoalRuns, implementation files, generated governance artifacts, or production build tasks.

### C-050 - PRD Builder And Planning Wizard Term Routing

```yaml
plan_unit_id: C-050
unit_type: requirement
status: accepted
owner_doc: Plans/Crosswalk.md
canonical_text: 'The finished-product feature formerly called Requirements Doc Builder is named PRD Builder everywhere in user-facing UI and canonical product documentation. The canonical product name is Planning Wizard; Chain Wizard and Plan Wizard are stale names that must be retired from active product prose, UI, commands, events, and contracts. Review, split, update, or retire Plans/chain-wizard.md and Plans/chain-wizard-flexibility.md into the new PRD Builder and Planning Wizard owners, preserving still-valid requirements and explicitly retiring stale workflow concepts. Run a doc-impact pass over Assistant Chat, Goal Runtime, Planning Ledger, Plan Document, Plan Compile, Automated Testing, Executor, Orchestrator, Personas, Models, FileSafe, Git/worktree, GitHub, permissions, contracts, commands, GUI, wiring, artifacts, indexes, and reference docs.'
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
reasoning_tier: standard
context_scope: ledger_to_plans_compile
implementation_surfaces:
- Plans/Crosswalk.md
- Plans/PRD_Builder.md
- Plans/FinalGUISpec.md
- Plans/00-plans-index.md
- Plans/Planning_Wizard.md
- Plans/Wiring_Matrix.md
node_compile_hint:
  mode: canonical_planunit_from_bootstrap_ledger
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260618-001-prd-planning-wizard:atom-0001
- pldg-20260618-001-prd-planning-wizard:atom-0002
- pldg-20260618-001-prd-planning-wizard:atom-0159
- pldg-20260618-001-prd-planning-wizard:atom-0160
- Plans/ledgers/v2/pldg-20260618-001-prd-planning-wizard/source_shards/01-naming-and-boundaries.md#SRC-NAMING
- Plans/ledgers/v2/pldg-20260618-001-prd-planning-wizard/source_shards/10-doc-and-contract-impact.md#SRC-IMPACT
source_atom_ids:
- atom-0001
- atom-0002
- atom-0159
- atom-0160
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
- doc-impact pass
negative_constraints:
- Do not preserve Requirements Doc Builder as a current product feature name except in explicitly historical migration notes.
- Do not use Chain Wizard or Plan Wizard as current terminology.
- Do not perform a blind filename or term replacement that preserves obsolete ownership and workflow.
owner_hints:
- Plans/PRD_Builder.md
- Plans/FinalGUISpec.md
- Plans/00-plans-index.md
- Plans/Planning_Wizard.md
- Plans/Crosswalk.md
- Plans/Wiring_Matrix.md
```

<!-- FABLE_REMAINING_ACTION_PLAN_REPAIR_20260708_BEGIN -->
