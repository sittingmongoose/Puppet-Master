# Shard 029: Ledger Compile Addendum - pldg-20260618-001-prd-planning-wizard

Source: `Plans/Models_System.md`

Source lines: L7729-L7786

Source SHA256: `d232e30036f09878b6a12c753c794ecf389ea21e2d65f9d3685dbe5d6b804e70`

---

## Ledger Compile Addendum - pldg-20260618-001-prd-planning-wizard

This addendum compiles source-lineage obligations from bootstrap ledger `pldg-20260618-001-prd-planning-wizard` into this existing owner or consumer doc. It does not create WorkNodes, NodeSeeds, executable queues, GoalRuns, implementation files, generated governance artifacts, or production build tasks.

### MS-112 - Planning Product Role Routing Consumers

```yaml
plan_unit_id: MS-112
unit_type: requirement
status: accepted
owner_doc: Plans/Models_System.md
canonical_text: 'Use Overseer for ledger-to-PRD, ledger-to-topic-plan, cross-topic integration, and compilation supervision; Auditor for audit, repair verification, and certification; High-Effort Worker for bounded difficult or repository-wide analysis; controller remains sole canonical writer.'
gui_related: false
gui_classification_reason: Backend, planning, contract, governance, or workflow behavior rather than visual presentation.
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
- Plans/Models_System.md
- Plans/Personas.md
- Plans/PRD_Builder.md
- Plans/Planning_Wizard.md
- Plans/Plan_To_Node_Compilation.md
node_compile_hint:
  mode: canonical_planunit_from_bootstrap_ledger
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260618-001-prd-planning-wizard:atom-0015
- Plans/ledgers/v2/pldg-20260618-001-prd-planning-wizard/source_shards/03-planning-wizard.md#SRC-PLANNING
source_atom_ids:
- atom-0015
decision_refs:
- dec-0005
correction_refs: []
preserved_exact_tokens:
- Overseer
- Auditor
- High-Effort Worker
- sole canonical writer
negative_constraints:
- Do not let read-only subagents mutate canonical ledgers, PRDs, Plans, WorkGraphs, or runtime records.
owner_hints:
- Plans/Personas.md
- Plans/Models_System.md
- Plans/PRD_Builder.md
- Plans/Planning_Wizard.md
- Plans/Plan_To_Node_Compilation.md
```
