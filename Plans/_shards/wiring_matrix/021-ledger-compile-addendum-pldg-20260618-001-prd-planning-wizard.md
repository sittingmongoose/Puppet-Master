# Shard 021: Ledger Compile Addendum - pldg-20260618-001-prd-planning-wizard

Source: `Plans/Wiring_Matrix.md`

Source lines: L3153-L3244

Source SHA256: `adffa65bcc7e38865d077b5ad538a6bf94c19117a46bece38d8e73c7a359aae0`

---

## Ledger Compile Addendum - pldg-20260618-001-prd-planning-wizard

This addendum compiles source-lineage obligations from bootstrap ledger `pldg-20260618-001-prd-planning-wizard` into this existing owner or consumer doc. It does not create WorkNodes, NodeSeeds, executable queues, GoalRuns, implementation files, generated governance artifacts, or production build tasks.

### WM-038 - Planning Product Command And Event Wiring

```yaml
plan_unit_id: WM-038
unit_type: requirement
status: accepted
owner_doc: Plans/Wiring_Matrix.md
canonical_text: 'Approve And Build atomically writes the immutable pack, user approval receipt, and PlanApproved transactional-outbox event so approval cannot be committed without a recoverable downstream trigger. PlanApproved uses a deterministic idempotency key derived from project_id, pack_id, pack version, and pack hash; duplicate delivery returns the existing PlanCompileRun rather than creating another run. After provisioning acceptance, one activation transaction creates or binds the GoalRun in activating state, installs the certified WorkGraph revision, materializes all WorkNodes, queues runnable entrypoints, records the activation receipt, and writes GoalRunStarted or BuildStarted through a transactional outbox. Commands for topic navigation, reopen, defer, annotation revision, approve PRD, Approve And Build, pause, cancel, resume, retry, inspect blocker, inspect evidence, inspect assignment, request bounded recompile, and open resulting
  build define permission, enablement, disabled reason, idempotency, stale-projection behavior, receipt effect, and recovery. Run a doc-impact pass over Assistant Chat, Goal Runtime, Planning Ledger, Plan Document, Plan Compile, Automated Testing, Executor, Orchestrator, Personas, Models, FileSafe, Git/worktree, GitHub, permissions, contracts, commands, GUI, wiring, artifacts, indexes, and reference docs.'
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
risk_class: execution_boundary
reasoning_tier: high
context_scope: ledger_to_plans_compile
implementation_surfaces:
- Plans/Wiring_Matrix.md
- Plans/Contracts_V0.md
- Plans/Goal_Runtime_System.md
- Plans/Planning_Wizard.md
- Plans/Plan_To_Node_Compilation.md
- Plans/Executor_Protocol.md
- Plans/UI_Command_Catalog.md
- Plans/Commands_System.md
- Plans/Orchestrator_Page.md
- Plans/00-plans-index.md
- Plans/Crosswalk.md
node_compile_hint:
  mode: canonical_planunit_from_bootstrap_ledger
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260618-001-prd-planning-wizard:atom-0104
- pldg-20260618-001-prd-planning-wizard:atom-0105
- pldg-20260618-001-prd-planning-wizard:atom-0125
- pldg-20260618-001-prd-planning-wizard:atom-0154
- pldg-20260618-001-prd-planning-wizard:atom-0160
- Plans/ledgers/v2/pldg-20260618-001-prd-planning-wizard/source_shards/06-approve-build-plan-compile-worknodes.md#SRC-COMPILE
- Plans/ledgers/v2/pldg-20260618-001-prd-planning-wizard/source_shards/08-gui-threads-and-navigation.md#SRC-GUI
- Plans/ledgers/v2/pldg-20260618-001-prd-planning-wizard/source_shards/10-doc-and-contract-impact.md#SRC-IMPACT
source_atom_ids:
- atom-0104
- atom-0105
- atom-0125
- atom-0154
- atom-0160
decision_refs:
- dec-0021
- dec-0025
- dec-0029
correction_refs: []
preserved_exact_tokens:
- PlanApproved
- transactional outbox
- idempotency_key
- project_id
- pack_hash
- GoalRunStarted
- BuildStarted
- activation transaction
- Approve And Build
- pause
- cancel
- resume
- inspect evidence
- doc-impact pass
negative_constraints: []
owner_hints:
- Plans/Contracts_V0.md
- Plans/Goal_Runtime_System.md
- Plans/Planning_Wizard.md
- Plans/Plan_To_Node_Compilation.md
- Plans/Executor_Protocol.md
- Plans/UI_Command_Catalog.md
- Plans/Commands_System.md
- Plans/Orchestrator_Page.md
- Plans/00-plans-index.md
- Plans/Crosswalk.md
- Plans/Wiring_Matrix.md
```
