# Shard 010: Ledger Compile Addendum - pldg-20260618-001-prd-planning-wizard

Source: `Plans/UI_Command_Catalog.md`

Source lines: L6843-L6986

Source SHA256: `3cfc0b921c3cb56e27121bd344aa4f018709c97aac6c161a11add1b3e74cf1e9`

---

## Ledger Compile Addendum - pldg-20260618-001-prd-planning-wizard

This addendum compiles source-lineage obligations from bootstrap ledger `pldg-20260618-001-prd-planning-wizard` into this existing owner or consumer doc. It does not create WorkNodes, NodeSeeds, executable queues, GoalRuns, implementation files, generated governance artifacts, or production build tasks.

### UCC-097 - Planning Wizard And Plan Compile Command Family

```yaml
plan_unit_id: UCC-097
unit_type: requirement
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: 'If the required end-of-turn ledger write fails, mark the active thread ledger_sync_blocked and disable topic advance, compile, approval, and downstream handoff until durable synchronization is repaired. The PRD Builder final action is labeled Approve PRD for Planning Wizard and creates the immutable handoff snapshot; the Planning Wizard consumes a specific approved version rather than mutable editor state. The Planning Wizard final approval button and command label is exactly Approve And Build. Approve And Build carries the final-review compare-and-swap currentness inputs and fails closed when the PlanningRun revision, topic map version, ApprovedPlanPack hash, project-context snapshot hash, PlanUnit or acceptance-unit index hash, testing policy hash, or final audit/closure hash has drifted. After Approve And Build succeeds locally, the application automatically switches to the Orchestrator page and opens the Plan Compile tab so the user sees launch reconciliation and compilation starting. Commands for topic navigation, reopen, defer, annotation revision, approve PRD, Approve And Build, pause, cancel, resume, retry, inspect blocker, inspect evidence, inspect assignment, request bounded recompile, and open resulting
  build define permission, enablement, disabled reason, idempotency, stale-projection behavior, receipt effect, and recovery. Approve And Build intentionally navigates to Orchestrator Plan Compile, but later transitions present strong Open Build and status actions rather than forcibly moving the user whenever state changes.'
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

### UCC-098 - PRD And Planning Runtime Command Contracts

```yaml
plan_unit_id: UCC-098
unit_type: requirement
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: 'UI_Command_Catalog owns the typed PRD Builder, Planning Wizard, and Plan Compile UICommand family contract. Each `cmd.prd_builder.*`, `cmd.planning_wizard.*`, and `cmd.plan_compile.*` command must define a non-generic payload contract, result contract, enablement guards, disabled reason codes, receipt effects, stale-projection policy, idempotency-key fields, and recovery routes in the runtime contract packet. Required commands include PRD source import, PRD answers, source annotations, conflict resolution, Approve PRD for Planning Wizard, pack reopen, Planning Wizard start, add/split/merge/rename/reorder/mark_impacted/defer/reopen topic, accepted amendment, Approve And Build, Plan Compile pause/resume/cancel/retry, inspect blocker/evidence/assignment, request bounded recompile, and Open Build. Approve And Build uses a deterministic idempotency key derived from project_id, approved_plan_pack_id, pack_version, pack_hash, PlanningRun revision, topic map version, and final audit/closure hash; its approval transaction compares all final-review CAS inputs, writes approval_cas_receipt, creates or binds the PlanCompileRun synchronously, and may only leave projection identity reconciliation pending, not the run identity itself. Commands_System may display or invoke these UICommands from user-authored command surfaces, but it does not own their payload, result, permission, receipt, or recovery semantics.'
gui_related: true
gui_classification_reason: Defines visible command behavior and dispatch contracts.
depends_on: [UCC-097, PNC-018]
unblocks: [CS-052, F3-398, OP-025]
acceptance_criteria:
- Runtime command contracts reject generic `object`, `{}`, `any`, or `Record<string, any>` payload/result definitions.
- Topic rename, reorder, mark_impacted, Approve And Build, and Open Build commands are present and typed.
- Approve And Build always returns or binds a PlanCompileRun identity in the approval transaction.
- Approve And Build payload and disabled-state contracts carry final-review CAS/currentness fields rather than relying on generic project context freshness.
validation_surfaces:
- python3 scripts/pm-plans-verify.py validate-prd-planning-runtime-contracts
- python3 scripts/pm-plans-verify.py run-gates
risk_class: gui_command_contract_drift
reasoning_tier: high
context_scope: prd_planning_ui_commands
implementation_surfaces:
- Plans/UI_Command_Catalog.md
- Plans/prd_planning_runtime_contracts.json
- Plans/prd_planning_runtime_contracts.schema.json
- scripts/pm-prd-planning-runtime-validate.py
node_compile_hint:
  mode: ui_command_contracts
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/UI_Command_Catalog.md#UCC-097
- Plans/Commands_System.md#CS-052
- Plans/ledgers/v2/pldg-20260618-001-prd-planning-wizard/source_shards/08-gui-threads-and-navigation.md#SRC-GUI
- external_report:PRD_Planning_Runtime_Second_Sweep/IR-014
- external_report:PRD_Planning_Runtime_Second_Sweep/IR-015
preserved_exact_tokens:
- Approve And Build
- plan_compile_run_id
- approval_cas_receipt
- pending_identity_reconciliation
- rename
- reorder
- mark_impacted
- disabled reason
- idempotency
- stale-projection
negative_constraints:
- Do not let Commands_System re-own UICommand payload/result semantics.
- Do not allow Approve And Build to return a success state with no PlanCompileRun identity.
owner_hints:
- Plans/UI_Command_Catalog.md
- Plans/Commands_System.md
- Plans/Planning_Wizard.md
- Plans/Plan_To_Node_Compilation.md
```
