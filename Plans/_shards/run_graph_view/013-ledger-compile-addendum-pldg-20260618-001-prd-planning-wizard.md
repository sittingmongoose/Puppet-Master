# Shard 013: Ledger Compile Addendum - pldg-20260618-001-prd-planning-wizard

Source: `Plans/Run_Graph_View.md`

Source lines: L945-L996

Source SHA256: `37a31a88cd99a6b74067c8eed30e0c81e0894bd598e559d42ffc93ff2b0ffcec`

---

## Ledger Compile Addendum - pldg-20260618-001-prd-planning-wizard

This addendum compiles source-lineage obligations from bootstrap ledger `pldg-20260618-001-prd-planning-wizard` into this existing owner or consumer doc. It does not create WorkNodes, NodeSeeds, executable queues, GoalRuns, implementation files, generated governance artifacts, or production build tasks.

### RGV-014 - Plan Compile Draft Graph Projection

```yaml
plan_unit_id: RGV-014
unit_type: requirement
status: accepted
owner_doc: Plans/Run_Graph_View.md
canonical_text: 'Orchestrator Plan Compile tab shows immutable source pack, current stage, stage timeline, subagent assignments, PlanUnit coverage, NodeSeed candidates, WorkGraph status, WorkNodeRequest count, testing/model/source-control readiness, audit/repair cycles, blockers, receipts, and handoff status.'
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
- Plans/Run_Graph_View.md
- Plans/Orchestrator_Page.md
- Plans/FinalGUISpec.md
node_compile_hint:
  mode: canonical_planunit_from_bootstrap_ledger
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260618-001-prd-planning-wizard:atom-0152
- Plans/ledgers/v2/pldg-20260618-001-prd-planning-wizard/source_shards/08-gui-threads-and-navigation.md#SRC-GUI
source_atom_ids:
- atom-0152
decision_refs: []
correction_refs: []
preserved_exact_tokens:
- Plan Compile tab
- stage timeline
- subagent assignments
- WorkNodeRequest count
negative_constraints: []
owner_hints:
- Plans/Orchestrator_Page.md
- Plans/FinalGUISpec.md
- Plans/Run_Graph_View.md
```
