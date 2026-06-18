# Shard 017: Ledger Compile Addendum - pldg-20260618-001-prd-planning-wizard

Source: `Plans/Commands_System.md`

Source lines: L3514-L3568

Source SHA256: `f4a3952776b709d40022d87f2ccc9b50d10f0014dee88a4bc7a1bfdb58c7f5a7`

---

## Ledger Compile Addendum - pldg-20260618-001-prd-planning-wizard

This addendum compiles source-lineage obligations from bootstrap ledger `pldg-20260618-001-prd-planning-wizard` into this existing owner or consumer doc. It does not create WorkNodes, NodeSeeds, executable queues, GoalRuns, implementation files, generated governance artifacts, or production build tasks.

### CS-052 - Planning Command State And Recovery Semantics

```yaml
plan_unit_id: CS-052
unit_type: requirement
status: accepted
owner_doc: Plans/Commands_System.md
canonical_text: 'Commands for topic navigation, reopen, defer, annotation revision, approve PRD, Approve And Build, pause, cancel, resume, retry, inspect blocker, inspect evidence, inspect assignment, request bounded recompile, and open resulting build define permission, enablement, disabled reason, idempotency, stale-projection behavior, receipt effect, and recovery.'
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
- Plans/Commands_System.md
- Plans/UI_Command_Catalog.md
- Plans/Planning_Wizard.md
- Plans/Orchestrator_Page.md
node_compile_hint:
  mode: canonical_planunit_from_bootstrap_ledger
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260618-001-prd-planning-wizard:atom-0154
- Plans/ledgers/v2/pldg-20260618-001-prd-planning-wizard/source_shards/08-gui-threads-and-navigation.md#SRC-GUI
source_atom_ids:
- atom-0154
decision_refs: []
correction_refs: []
preserved_exact_tokens:
- Approve And Build
- pause
- cancel
- resume
- inspect evidence
negative_constraints: []
owner_hints:
- Plans/UI_Command_Catalog.md
- Plans/Commands_System.md
- Plans/Planning_Wizard.md
- Plans/Orchestrator_Page.md
```
