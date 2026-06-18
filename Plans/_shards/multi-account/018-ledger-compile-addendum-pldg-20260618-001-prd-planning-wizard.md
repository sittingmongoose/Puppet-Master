# Shard 018: Ledger Compile Addendum - pldg-20260618-001-prd-planning-wizard

Source: `Plans/Multi-Account.md`

Source lines: L4579-L4631

Source SHA256: `3f281fb746ae606cbb38b04c81ecff30f21cf4d16c0704ccab20aa1028b77738`

---

## Ledger Compile Addendum - pldg-20260618-001-prd-planning-wizard

This addendum compiles source-lineage obligations from bootstrap ledger `pldg-20260618-001-prd-planning-wizard` into this existing owner or consumer doc. It does not create WorkNodes, NodeSeeds, executable queues, GoalRuns, implementation files, generated governance artifacts, or production build tasks.

### MA-061 - Testing Capability Policy Inheritance Consumer

```yaml
plan_unit_id: MA-061
unit_type: requirement
status: accepted
owner_doc: Plans/Multi-Account.md
canonical_text: 'Testing capability policy is configurable globally and per project, with project settings inheriting or overriding global values and the effective policy snapshot carried into Planning Wizard, Plan Compile, Executor, and Orchestrator.'
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
- PYTHONPATH=/private/tmp/pm-py-deps python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260618-001-prd-planning-wizard
risk_class: owner_drift
reasoning_tier: standard
context_scope: ledger_to_plans_compile
implementation_surfaces:
- Plans/Multi-Account.md
- Plans/Automated_Testing_System.md
- Plans/FinalGUISpec.md
node_compile_hint:
  mode: canonical_planunit_from_bootstrap_ledger
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260618-001-prd-planning-wizard:atom-0089
- Plans/ledgers/v2/pldg-20260618-001-prd-planning-wizard/source_shards/05-testing-and-visible-verification.md#SRC-TESTING
source_atom_ids:
- atom-0089
decision_refs:
- dec-0018
correction_refs:
- corr-0015
preserved_exact_tokens:
- global settings
- per-project settings
- effective policy snapshot
negative_constraints: []
owner_hints:
- Plans/Automated_Testing_System.md
- Plans/FinalGUISpec.md
- Plans/Multi-Account.md
```
