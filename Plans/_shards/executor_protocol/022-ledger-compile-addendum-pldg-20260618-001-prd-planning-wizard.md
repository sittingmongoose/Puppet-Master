# Shard 022: Ledger Compile Addendum - pldg-20260618-001-prd-planning-wizard

Source: `Plans/Executor_Protocol.md`

Source lines: L6175-L6338

Source SHA256: `1314f282d60b9fe0102415be12ffe96850ad6cce1c005d1e0ae23a822f9c0269`

---

## Ledger Compile Addendum - pldg-20260618-001-prd-planning-wizard

This addendum compiles source-lineage obligations from bootstrap ledger `pldg-20260618-001-prd-planning-wizard` into this existing owner or consumer doc. It does not create WorkNodes, NodeSeeds, executable queues, GoalRuns, implementation files, generated governance artifacts, or production build tasks.

### EP-104 - Three-Stage Executor Intake And Required Graph Acceptance

```yaml
plan_unit_id: EP-104
unit_type: requirement
status: accepted
owner_doc: Plans/Executor_Protocol.md
canonical_text: 'Downstream intake is Executor Structural Intake, Provisioning Preflight, and Executor Activation Decision so graph/request validation occurs before repository, worktree, safe-point, test-harness, model, permissions, and credential provisioning. Activation requires all required active-scope WorkNodeRequests to be accepted together; optional work must be explicitly excluded or deferred before activation, and a mixed result cannot silently start a partial build. Plan Compile and Executor provisioning must compare live repository and environment state against the approved snapshot and route stale facts through bounded re-analysis or recompile rather than executing against invalid assumptions. Provisioning Preflight confirms that selected test capabilities, installations, services, browsers, devices, simulators, credentials, and commands remain current and runnable immediately before WorkNode execution.'
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
risk_class: execution_boundary
reasoning_tier: high
context_scope: ledger_to_plans_compile
implementation_surfaces:
- Plans/Executor_Protocol.md
- Plans/Plan_To_Node_Compilation.md
- Plans/Goal_Runtime_System.md
- Plans/FileSafe.md
- Plans/Automated_Testing_System.md
node_compile_hint:
  mode: canonical_planunit_from_bootstrap_ledger
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260618-001-prd-planning-wizard:atom-0119
- pldg-20260618-001-prd-planning-wizard:atom-0120
- pldg-20260618-001-prd-planning-wizard:atom-0078
- pldg-20260618-001-prd-planning-wizard:atom-0100
- Plans/ledgers/v2/pldg-20260618-001-prd-planning-wizard/source_shards/06-approve-build-plan-compile-worknodes.md#SRC-COMPILE
- Plans/ledgers/v2/pldg-20260618-001-prd-planning-wizard/source_shards/04-project-context-and-source-control.md#SRC-PROJECT
- Plans/ledgers/v2/pldg-20260618-001-prd-planning-wizard/source_shards/05-testing-and-visible-verification.md#SRC-TESTING
source_atom_ids:
- atom-0119
- atom-0120
- atom-0078
- atom-0100
decision_refs:
- dec-0024
- dec-0025
correction_refs: []
preserved_exact_tokens:
- Executor Structural Intake
- Provisioning Preflight
- Executor Activation Decision
- all required active-scope
- mixed
- revalidate
- stale facts
- harness revalidation
negative_constraints:
- Do not start a partially accepted required WorkGraph.
owner_hints:
- Plans/Executor_Protocol.md
- Plans/Plan_To_Node_Compilation.md
- Plans/Goal_Runtime_System.md
- Plans/FileSafe.md
- Plans/Automated_Testing_System.md
```

### EP-105 - Runtime WorkNodeRecord Identity, Receipts, And Activation Consumers

```yaml
plan_unit_id: EP-105
unit_type: requirement
status: accepted
owner_doc: Plans/Executor_Protocol.md
canonical_text: 'After Activation Decision accepts the certified graph, Executor materializes canonical WorkNodeRecord objects from accepted WorkNodeRequests and emits materialization receipts. WorkNodeRecord includes worknode_id, goal_run_id, workgraph_id and revision, source_request_id, source PlanUnit and acceptance refs, objective, surfaces, typed readiness predicates, lifecycle, attempts and retries, authority, model, tests, repository/worktree/safe-point refs, evidence, currentness, cancellation, invalidation, and replan generation. Existing project_plan_node schema remains an import or compatibility contract with an explicit adapter and must not silently become the canonical runtime WorkNodeRecord. Work dispatch, change, test, retry, and completion receipts use worknode_id and attempt_id plus source_request_id and graph revision; a WorkNodeRequest reference alone is not sufficient runtime identity. A context-aware incomplete-content
  validator runs at Planning Wizard approval, Plan Compile certification, WorkNode completion, and Goal completion across active Plans, compile artifacts, first-party code, tests, generated outputs, and delivery artifacts. Implementation readiness of the complete pipeline requires a clean-room fixture proving Approve And Build creates exactly one PlanCompileRun, executes mandatory parallel stages, certifies a complete WorkGraph and WorkNodeRequests, passes Executor intake/provisioning, atomically creates GoalRun and WorkNodes, queues an entrypoint, and appears in Orchestrator. The fixture suite covers duplicate PlanApproved delivery, restart during every activation step, greenfield Git, non-Git FileSafe, dirty repository, remote SSH, optional GitHub or PR, missing harness, testing override, plan revision during compile and execution, cancellation before and after mutation, missing parallel receipts, and a deliberately introduced incomplete item.'
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
risk_class: execution_boundary
reasoning_tier: high
context_scope: ledger_to_plans_compile
implementation_surfaces:
- Plans/Executor_Protocol.md
- Plans/Contracts_V0.md
- Plans/storage-plan.md
- Plans/Planning_Wizard.md
- Plans/Plan_To_Node_Compilation.md
- Plans/Progression_Gates.md
- Plans/Orchestrator_Page.md
- Plans/Automated_Testing_System.md
node_compile_hint:
  mode: canonical_planunit_from_bootstrap_ledger
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260618-001-prd-planning-wizard:atom-0121
- pldg-20260618-001-prd-planning-wizard:atom-0122
- pldg-20260618-001-prd-planning-wizard:atom-0123
- pldg-20260618-001-prd-planning-wizard:atom-0124
- pldg-20260618-001-prd-planning-wizard:atom-0137
- pldg-20260618-001-prd-planning-wizard:atom-0145
- pldg-20260618-001-prd-planning-wizard:atom-0146
- Plans/ledgers/v2/pldg-20260618-001-prd-planning-wizard/source_shards/06-approve-build-plan-compile-worknodes.md#SRC-COMPILE
- Plans/ledgers/v2/pldg-20260618-001-prd-planning-wizard/source_shards/07-audit-readiness-and-safety.md#SRC-AUDIT
source_atom_ids:
- atom-0121
- atom-0122
- atom-0123
- atom-0124
- atom-0137
- atom-0145
- atom-0146
decision_refs:
- dec-0025
- dec-0027
- dec-0028
correction_refs: []
preserved_exact_tokens:
- WorkNodeRecord
- WorkNodeMaterializationReceipt
- worknode_id
- goal_run_id
- workgraph_revision
- attempt_id
- replan generation
- project_plan_node
- compatibility adapter
- Planning Wizard approval
- Plan Compile certification
- WorkNode completion
- Goal completion
- clean-room fixture
- exactly one PlanCompileRun
- entrypoint queued
- duplicate PlanApproved
- dirty repository
- missing parallel receipts
- deliberately introduced incomplete item
negative_constraints:
- Do not overload a legacy plan-node shape as runtime execution truth.
owner_hints:
- Plans/Executor_Protocol.md
- Plans/Contracts_V0.md
- Plans/storage-plan.md
- Plans/Planning_Wizard.md
- Plans/Plan_To_Node_Compilation.md
- Plans/Progression_Gates.md
- Plans/Orchestrator_Page.md
- Plans/Automated_Testing_System.md
```
