# Shard 010: Ledger Compile Addendum - pldg-20260618-001-prd-planning-wizard

Source: `Plans/UI_Command_Catalog.md`

Source lines: L6842-L6926

Source SHA256: `90ce512c5e3f75283aff3532cf17f53756d27e460f542e20b64d26ff5e52d049`

---

## Ledger Compile Addendum - pldg-20260618-001-prd-planning-wizard

This addendum compiles source-lineage obligations from bootstrap ledger `pldg-20260618-001-prd-planning-wizard` into this existing owner or consumer doc. It does not create WorkNodes, NodeSeeds, executable queues, GoalRuns, implementation files, generated governance artifacts, or production build tasks.

### UCC-097 - Planning Wizard And Plan Compile Command Family

```yaml
plan_unit_id: UCC-097
unit_type: requirement
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: 'atom-0012: If the required end-of-turn ledger write fails, mark the active thread ledger_sync_blocked and disable topic advance, compile, approval, and downstream handoff until durable synchronization is repaired. atom-0028: The PRD Builder final action is labeled Approve PRD for Planning Wizard and creates the immutable handoff snapshot; the Planning Wizard consumes a specific approved version rather than mutable editor state. atom-0101: The Planning Wizard final approval button and command label is exactly Approve And Build. atom-0107: After Approve And Build succeeds locally, the application automatically switches to the Orchestrator page and opens the Plan Compile tab so the user sees launch reconciliation and compilation starting. atom-0154: Commands for topic navigation, reopen, defer, annotation revision, approve PRD, Approve And Build, pause, cancel, resume, retry, inspect blocker, inspect evidence, inspect assignment, request bounded recompile, and open resulting
  build define permission, enablement, disabled reason, idempotency, stale-projection behavior, receipt effect, and recovery. atom-0155: Approve And Build intentionally navigates to Orchestrator Plan Compile, but later transitions present strong Open Build and status actions rather than forcibly moving the user whenever state changes.'
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
reasoning_tier: high
context_scope: ledger_to_plans_compile
implementation_surfaces:
- Plans/UI_Command_Catalog.md
- Plans/Planning_Ledger_System.md
- Plans/PRD_Builder.md
- Plans/Planning_Wizard.md
- Plans/FinalGUISpec.md
- Plans/Orchestrator_Page.md
- Plans/Commands_System.md
node_compile_hint:
  mode: canonical_planunit_from_bootstrap_ledger
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260618-001-prd-planning-wizard:atom-0012
- pldg-20260618-001-prd-planning-wizard:atom-0028
- pldg-20260618-001-prd-planning-wizard:atom-0101
- pldg-20260618-001-prd-planning-wizard:atom-0107
- pldg-20260618-001-prd-planning-wizard:atom-0154
- pldg-20260618-001-prd-planning-wizard:atom-0155
- Plans/ledgers/v2/pldg-20260618-001-prd-planning-wizard/source_shards/03-planning-wizard.md#SRC-PLANNING
- Plans/ledgers/v2/pldg-20260618-001-prd-planning-wizard/source_shards/02-prd-builder.md#SRC-PRD
- Plans/ledgers/v2/pldg-20260618-001-prd-planning-wizard/source_shards/06-approve-build-plan-compile-worknodes.md#SRC-COMPILE
- Plans/ledgers/v2/pldg-20260618-001-prd-planning-wizard/source_shards/08-gui-threads-and-navigation.md#SRC-GUI
source_atom_ids:
- atom-0012
- atom-0028
- atom-0101
- atom-0107
- atom-0154
- atom-0155
decision_refs:
- dec-0004
- dec-0008
- dec-0020
correction_refs:
- corr-0011
- corr-0012
preserved_exact_tokens:
- ledger_sync_blocked
- Approve PRD for Planning Wizard
- Approve And Build
- Orchestrator
- Plan Compile tab
- pause
- cancel
- resume
- inspect evidence
- Open Build
negative_constraints: []
owner_hints:
- Plans/Planning_Ledger_System.md
- Plans/PRD_Builder.md
- Plans/Planning_Wizard.md
- Plans/UI_Command_Catalog.md
- Plans/FinalGUISpec.md
- Plans/Orchestrator_Page.md
- Plans/Commands_System.md
```
