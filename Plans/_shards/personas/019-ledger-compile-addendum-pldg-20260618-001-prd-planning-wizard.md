# Shard 019: Ledger Compile Addendum - pldg-20260618-001-prd-planning-wizard

Source: `Plans/Personas.md`

Source lines: L3239-L3307

Source SHA256: `ab5dca7bf9cd45038d75b2d41421d9a44a3d721958162329b59563604a3d3edf`

---

## Ledger Compile Addendum - pldg-20260618-001-prd-planning-wizard

This addendum compiles source-lineage obligations from bootstrap ledger `pldg-20260618-001-prd-planning-wizard` into this existing owner or consumer doc. It does not create WorkNodes, NodeSeeds, executable queues, GoalRuns, implementation files, generated governance artifacts, or production build tasks.

### P-054 - Planning Product Collaborator Profiles And Specialist Roles

```yaml
plan_unit_id: P-054
unit_type: requirement
status: accepted
owner_doc: Plans/Personas.md
canonical_text: 'PRD Builder uses the protected Collaborator Persona with workflow_behavior_profile prd_builder for discovery, source-aware clarification, conflict surfacing, and planning-intake document co-creation. Topic conversations use the Collaborator Persona with workflow_behavior_profile planning_wizard, asking topic-local implementation-readiness questions while preserving a cooperative, technically serious interaction style. Use Overseer for ledger-to-PRD, ledger-to-topic-plan, cross-topic integration, and compilation supervision; Auditor for audit, repair verification, and certification; High-Effort Worker for bounded difficult or repository-wide analysis; controller remains sole canonical writer.'
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
- Plans/Personas.md
- Plans/PRD_Builder.md
- Plans/assistant-chat-design.md
- Plans/Planning_Wizard.md
- Plans/Models_System.md
- Plans/Plan_To_Node_Compilation.md
node_compile_hint:
  mode: canonical_planunit_from_bootstrap_ledger
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260618-001-prd-planning-wizard:atom-0013
- pldg-20260618-001-prd-planning-wizard:atom-0014
- pldg-20260618-001-prd-planning-wizard:atom-0015
- Plans/ledgers/v2/pldg-20260618-001-prd-planning-wizard/source_shards/02-prd-builder.md#SRC-PRD
- Plans/ledgers/v2/pldg-20260618-001-prd-planning-wizard/source_shards/03-planning-wizard.md#SRC-PLANNING
source_atom_ids:
- atom-0013
- atom-0014
- atom-0015
decision_refs:
- dec-0005
correction_refs: []
preserved_exact_tokens:
- Collaborator Persona
- 'workflow_behavior_profile: prd_builder'
- 'workflow_behavior_profile: planning_wizard'
- Overseer
- Auditor
- High-Effort Worker
- sole canonical writer
negative_constraints:
- Do not add an unnecessary protected PRDBuilder Persona when workflow behavior can specialize Collaborator.
- Do not let read-only subagents mutate canonical ledgers, PRDs, Plans, WorkGraphs, or runtime records.
owner_hints:
- Plans/Personas.md
- Plans/PRD_Builder.md
- Plans/assistant-chat-design.md
- Plans/Planning_Wizard.md
- Plans/Models_System.md
- Plans/Plan_To_Node_Compilation.md
```
