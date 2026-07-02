# Shard 011: Ledger Compile Addendum - pldg-20260618-001-prd-planning-wizard

Source: `Plans/Orchestrator_Page.md`

Source lines: L1767-L1907

Source SHA256: `1cd9f3b8bbd02e7f5efa00d917914479f3f73acba3ceea7122857d17ba3a75bb`

---

## Ledger Compile Addendum - pldg-20260618-001-prd-planning-wizard

This addendum compiles source-lineage obligations from bootstrap ledger `pldg-20260618-001-prd-planning-wizard` into this existing owner or consumer doc. It does not create WorkNodes, NodeSeeds, executable queues, GoalRuns, implementation files, generated governance artifacts, or production build tasks.

### OP-025 - Plan Compile Launch, Pending Shell, And Execution Separation

```yaml
plan_unit_id: OP-025
unit_type: requirement
status: accepted
owner_doc: Plans/Orchestrator_Page.md
canonical_text: 'The default testing visibility policy is show_when_possible: when a meaningful headed or visual surface exists, expose the active test session rather than hiding all verification in background logs. For web work, open the built-in browser or headed browser view and visibly show navigation, clicks, form input, assertions, screenshots, console and network evidence, and pass/fail progression when supported. For Swift and other native work, show the appropriate live preview, hot-reload surface, simulator, emulator, device stream, application window, interaction trace, screenshots, and relevant logs when available and permitted. Users may collapse, detach, background, or leave a visible test session while automation continues; the system preserves session state and does not require the user to watch every action. When a live surface cannot be embedded, expose an Open or Watch action, snapshots, screenshot sequence, video
  or stream where supported, structured interaction timeline, logs, console and network traces, and evidence links. After Approve And Build succeeds locally, the application automatically switches to the Orchestrator page and opens the Plan Compile tab so the user sees launch reconciliation and compilation starting. If PlanApproved publication or PlanCompileRun identity has not yet reconciled, the Plan Compile tab shows a pending launch shell tied to the approval command and then binds to the durable compile identity without creating a duplicate. Orchestrator may show launch and provisioning progress before activation, but it marks the build running and exposes runnable WorkNodes only after the atomic activation commit and durable start receipt. Implementation readiness of the complete pipeline requires a clean-room fixture proving Approve And Build creates exactly one PlanCompileRun, executes mandatory parallel stages, certifies a complete WorkGraph
  and WorkNodeRequests, passes Executor intake/provisioning, atomically creates GoalRun and WorkNodes, queues an entrypoint, and appears in Orchestrator. Long-running topic conversion, audit, repair, final integration, and final audit display active stage, progress counts, assignment counts, findings fixed, current pass, and user-relevant status so the interface never appears stalled. Orchestrator Plan Compile tab shows immutable source pack, current stage, stage timeline, subagent assignments, PlanUnit coverage, NodeSeed candidates, WorkGraph status, WorkNodeRequest count, testing/model/source-control readiness, audit/repair cycles, blockers, receipts, and handoff status. Plan Compile tab owns compilation and handoff progress; after BuildStarted, Orchestrator execution views own WorkNode dispatch, code changes, live testing, repairs, safe points, and completion while Plan Compile remains a historical launch view with an Open Build action. Commands
  for topic navigation, reopen, defer, annotation revision, approve PRD, Approve And Build, pause, cancel, resume, retry, inspect blocker, inspect evidence, inspect assignment, request bounded recompile, and open resulting build define permission, enablement, disabled reason, idempotency, stale-projection behavior, receipt effect, and recovery. Approve And Build intentionally navigates to Orchestrator Plan Compile, but later transitions present strong Open Build and status actions rather than forcibly moving the user whenever state changes.'
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
- Plans/Orchestrator_Page.md
- Plans/Automated_Testing_System.md
- Plans/FinalGUISpec.md
- Plans/Runtime_Artifacts_Panel.md
- Plans/Planning_Wizard.md
- Plans/UI_Command_Catalog.md
- Plans/Contracts_V0.md
- Plans/Goal_Runtime_System.md
- Plans/Plan_To_Node_Compilation.md
- Plans/Executor_Protocol.md
- Plans/Run_Graph_View.md
- Plans/Commands_System.md
node_compile_hint:
  mode: canonical_planunit_from_bootstrap_ledger
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260618-001-prd-planning-wizard:atom-0092
- pldg-20260618-001-prd-planning-wizard:atom-0093
- pldg-20260618-001-prd-planning-wizard:atom-0094
- pldg-20260618-001-prd-planning-wizard:atom-0095
- pldg-20260618-001-prd-planning-wizard:atom-0096
- pldg-20260618-001-prd-planning-wizard:atom-0107
- pldg-20260618-001-prd-planning-wizard:atom-0108
- pldg-20260618-001-prd-planning-wizard:atom-0126
- pldg-20260618-001-prd-planning-wizard:atom-0145
- pldg-20260618-001-prd-planning-wizard:atom-0150
- pldg-20260618-001-prd-planning-wizard:atom-0152
- pldg-20260618-001-prd-planning-wizard:atom-0153
- pldg-20260618-001-prd-planning-wizard:atom-0154
- pldg-20260618-001-prd-planning-wizard:atom-0155
- Plans/ledgers/v2/pldg-20260618-001-prd-planning-wizard/source_shards/05-testing-and-visible-verification.md#SRC-TESTING
- Plans/ledgers/v2/pldg-20260618-001-prd-planning-wizard/source_shards/06-approve-build-plan-compile-worknodes.md#SRC-COMPILE
- Plans/ledgers/v2/pldg-20260618-001-prd-planning-wizard/source_shards/07-audit-readiness-and-safety.md#SRC-AUDIT
- Plans/ledgers/v2/pldg-20260618-001-prd-planning-wizard/source_shards/08-gui-threads-and-navigation.md#SRC-GUI
source_atom_ids:
- atom-0092
- atom-0093
- atom-0094
- atom-0095
- atom-0096
- atom-0107
- atom-0108
- atom-0126
- atom-0145
- atom-0150
- atom-0152
- atom-0153
- atom-0154
- atom-0155
decision_refs:
- dec-0019
- dec-0020
- dec-0028
correction_refs:
- corr-0014
- corr-0012
preserved_exact_tokens:
- show_when_possible
- built-in browser
- clicks
- form input
- assertions
- Swift
- live preview
- simulator
- emulator
- device stream
- collapse
- detach
- automation continues
- Open
- Watch
- interaction timeline
- Orchestrator
- Plan Compile tab
- pending launch
- compile identity
- activation commit
- running
- clean-room fixture
- exactly one PlanCompileRun
- entrypoint queued
- progress counts
- audit pass
- stage timeline
- subagent assignments
- WorkNodeRequest count
- Open Build
- BuildStarted
- Approve And Build
- pause
- cancel
- resume
- inspect evidence
negative_constraints:
- Do not mix ongoing WorkNode execution into Plan Compile stage progress.
owner_hints:
- Plans/Automated_Testing_System.md
- Plans/Orchestrator_Page.md
- Plans/FinalGUISpec.md
- Plans/Runtime_Artifacts_Panel.md
- Plans/Planning_Wizard.md
- Plans/UI_Command_Catalog.md
- Plans/Contracts_V0.md
- Plans/Goal_Runtime_System.md
- Plans/Plan_To_Node_Compilation.md
- Plans/Executor_Protocol.md
- Plans/Run_Graph_View.md
- Plans/Commands_System.md
```
