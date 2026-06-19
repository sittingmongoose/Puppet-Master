# Shard 008: Ledger Compile Addendum - pldg-20260618-001-prd-planning-wizard

Source: `Plans/Plan_To_Node_Compilation.md`

Source lines: L790-L1063

Source SHA256: `4cf4fbee306b53456df35b9b956a1a93a87490ae08d82c33bb5c8af1ad784290`

---

## Ledger Compile Addendum - pldg-20260618-001-prd-planning-wizard

This addendum compiles source-lineage obligations from bootstrap ledger `pldg-20260618-001-prd-planning-wizard` into this existing owner or consumer doc. It does not create WorkNodes, NodeSeeds, executable queues, GoalRuns, implementation files, generated governance artifacts, or production build tasks.

### PNC-015 - Runtime-Capable PlanCompile v2 Boundary

```yaml
plan_unit_id: PNC-015
unit_type: requirement
status: accepted
owner_doc: Plans/Plan_To_Node_Compilation.md
canonical_text: 'The Approved Plan Pack carries a hash-addressed project-context snapshot containing repository identity, host, path, branch, remotes, dirty state, codebase scan facts, test-capability facts, and currentness conditions. Plan Compile and Executor provisioning must compare live repository and environment state against the approved snapshot and route stale facts through bounded re-analysis or recompile rather than executing against invalid assumptions. Keep the current plans-to-code handoff v1 as a historical design-only contract with launch disabled, and introduce a versioned runtime-capable contract rather than silently changing v1 semantics. The runtime schema includes contract_mode, launch_policy, runtime_adapter, runtime_enablement_ref, and runtime_policy_snapshot_ref; finished product defaults to native_runtime plus automatic_after_approval through native_puppet_master_adapter. PlanCompileRun persists stage, cursor,
  bounded worklists, assignment receipts, source hashes, currentness status, blockers, repairs, artifacts, retries, cancellation, supersession, and exact next action across context and process restarts. Changes after approval create successor ApprovedPlanPack versions; during compilation or execution a PlanDiffImpactReport classifies unaffected, already safe, needs recompile, and invalidated lanes and only continues unaffected work when dependencies and write surfaces prove safety. The PlanUnit index/readiness Goal regenerates only allowed Plans/.plan_index outputs, reports exact blockers, and creates no WorkNodes, NodeSeeds, candidates, executable queues, implementation files, or production tasks.'
gui_related: false
gui_classification_reason: Backend, planning, contract, governance, or workflow behavior rather than visual presentation.
depends_on: []
unblocks: []
acceptance_criteria:
- The live owner doc preserves every source atom listed in source_atom_ids without treating the ledger as canonical product prose.
- Exact tokens, negative constraints, owner hints, and accepted corrections remain available to future audits through this PlanUnit.
- "`Plans/plans_to_code_handoff.schema.json` carries `contract_mode`, `launch_policy`, `runtime_adapter`, `runtime_enablement_ref`, and `runtime_policy_snapshot_ref` in the `plan_compile_run` schema while preserving const-false launch gates for the current disabled contract."
- No WorkNodes, NodeSeeds, executable queues, GoalRuns, implementation files, generated governance artifacts, or production build tasks are created by this compile.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
- PYTHONPATH=/private/tmp/pm-py-deps python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260618-001-prd-planning-wizard
risk_class: execution_boundary
reasoning_tier: high
context_scope: ledger_to_plans_compile
implementation_surfaces:
- Plans/Plan_To_Node_Compilation.md
- Plans/Planning_Wizard.md
- Plans/Contracts_V0.md
- Plans/Executor_Protocol.md
- Plans/FileSafe.md
- Plans/plans_to_code_handoff.schema.json
- Plans/Goal_Runtime_System.md
- Plans/storage-plan.md
- Plans/bootstrap/Codex_Prompts.md
node_compile_hint:
  mode: canonical_planunit_from_bootstrap_ledger
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260618-001-prd-planning-wizard:atom-0077
- pldg-20260618-001-prd-planning-wizard:atom-0078
- pldg-20260618-001-prd-planning-wizard:atom-0109
- pldg-20260618-001-prd-planning-wizard:atom-0110
- pldg-20260618-001-prd-planning-wizard:atom-0111
- pldg-20260618-001-prd-planning-wizard:atom-0129
- pldg-20260618-001-prd-planning-wizard:atom-0164
- Plans/ledgers/v2/pldg-20260618-001-prd-planning-wizard/source_shards/04-project-context-and-source-control.md#SRC-PROJECT
- Plans/ledgers/v2/pldg-20260618-001-prd-planning-wizard/source_shards/06-approve-build-plan-compile-worknodes.md#SRC-COMPILE
- Plans/ledgers/v2/pldg-20260618-001-prd-planning-wizard/source_shards/09-bootstrap-prompts-and-transfer.md#SRC-PROMPTS
source_atom_ids:
- atom-0077
- atom-0078
- atom-0109
- atom-0110
- atom-0111
- atom-0129
- atom-0164
decision_refs:
- dec-0022
correction_refs: []
preserved_exact_tokens:
- project-context snapshot
- currentness
- revalidate
- stale facts
- design_only
- runtime-capable v2
- contract_mode
- launch_policy
- runtime_adapter
- native_puppet_master_adapter
- PlanCompileRun
- resume
- PlanDiffImpactReport
- unaffected
- needs_recompile
- invalidated
- node_readiness_report
- no WorkNodes
negative_constraints:
- Do not reinterpret existing const-false v1 launch flags as runtime enablement.
owner_hints:
- Plans/Planning_Wizard.md
- Plans/Contracts_V0.md
- Plans/Plan_To_Node_Compilation.md
- Plans/Executor_Protocol.md
- Plans/FileSafe.md
- Plans/plans_to_code_handoff.schema.json
- Plans/Goal_Runtime_System.md
- Plans/storage-plan.md
- Plans/bootstrap/Codex_Prompts.md
```

### PNC-016 - Runtime Stage Cards, Parallel Worklists, And Typed Dependencies

```yaml
plan_unit_id: PNC-016
unit_type: requirement
status: accepted
owner_doc: Plans/Plan_To_Node_Compilation.md
canonical_text: 'Define executable stage cards for preflight and currentness, scope selection, PlanUnit normalization, test and repository discovery, typed dependency analysis, implementation-surface mapping, work and risk classification, NodeSeed candidate drafting, split or merge sizing, independent candidate review, WorkGraph construction, WorkNodeRequest construction, final compile audit and repair, and Executor handoff certification. Each stage card defines exact inputs, outputs, algorithms, bounded units, read/write authority, required parallelism, validators, retry and repair routes, currentness behavior, terminal states, and evidence/receipt requirements. For broad stages the controller computes a bounded worklist and mandatory minimum parallel assignments, launches read-only subagents, records assignment and completion receipts, and rejects certification when required parallel work is absent. A required broad stage may reduce scope or
  block with a typed runtime-capability error, but it may not silently substitute one broad agent for mandatory parallel analysis or review. Plan Compile distinguishes owner_reference, consumer_reference, contract_dependency, validation_dependency, build_dependency, runtime_prerequisite, required-before-start, required-before-completion, and write-conflict serialization; only executable ordering edges participate in WorkGraph acyclicity. Plan Compile may draft NodeSeed candidates as generated intermediate proposals with source PlanUnit coverage, objectives, surfaces, dependencies, capabilities, risks, tests, and sizing, but they are not runtime WorkNodes. A certified WorkNodeRequest has non-empty objective, source PlanUnits and acceptance units, bounded read/write/implementation surfaces, typed dependencies, authority, model/capability routing, test binding, repository currentness, evidence requirements, idempotency, cancellation, and no unsupported or placeholder
  content.'
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
- PYTHONPATH=/private/tmp/pm-py-deps python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260618-001-prd-planning-wizard
risk_class: stale_or_forbidden_behavior
reasoning_tier: high
context_scope: ledger_to_plans_compile
implementation_surfaces:
- Plans/Plan_To_Node_Compilation.md
- Plans/Contracts_V0.md
- Plans/Goal_Runtime_System.md
- Plans/Plan_Document_System.md
- Plans/Executor_Protocol.md
node_compile_hint:
  mode: canonical_planunit_from_bootstrap_ledger
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260618-001-prd-planning-wizard:atom-0112
- pldg-20260618-001-prd-planning-wizard:atom-0113
- pldg-20260618-001-prd-planning-wizard:atom-0114
- pldg-20260618-001-prd-planning-wizard:atom-0115
- pldg-20260618-001-prd-planning-wizard:atom-0116
- pldg-20260618-001-prd-planning-wizard:atom-0117
- pldg-20260618-001-prd-planning-wizard:atom-0118
- Plans/ledgers/v2/pldg-20260618-001-prd-planning-wizard/source_shards/06-approve-build-plan-compile-worknodes.md#SRC-COMPILE
source_atom_ids:
- atom-0112
- atom-0113
- atom-0114
- atom-0115
- atom-0116
- atom-0117
- atom-0118
decision_refs:
- dec-0022
- dec-0023
- dec-0024
correction_refs:
- corr-0008
preserved_exact_tokens:
- stage card
- NodeSeed candidate
- WorkGraph
- WorkNodeRequest
- inputs
- outputs
- required parallelism
- terminal states
- minimum_parallel_assignments
- assignment receipt
- completion receipt
- parallelism_required
- runtime-capability blocker
- typed dependency
- build_dependency
- runtime_prerequisite
- write_conflict_serialization
- intermediate
- objective
- acceptance units
- test binding
negative_constraints:
- Do not accept agent self-report as proof that required parallel subagents were used.
- Do not silently degrade a mandatory parallel stage to one agent.
- Do not dispatch or execute a NodeSeed candidate.
owner_hints:
- Plans/Plan_To_Node_Compilation.md
- Plans/Contracts_V0.md
- Plans/Goal_Runtime_System.md
- Plans/Plan_Document_System.md
- Plans/Executor_Protocol.md
```

### PNC-017 - Compile Readiness Fixtures And No-Runtime-Artifact Boundary

```yaml
plan_unit_id: PNC-017
unit_type: requirement
status: accepted
owner_doc: Plans/Plan_To_Node_Compilation.md
canonical_text: 'A context-aware incomplete-content validator runs at Planning Wizard approval, Plan Compile certification, WorkNode completion, and Goal completion across active Plans, compile artifacts, first-party code, tests, generated outputs, and delivery artifacts. Every material plan and compile claim must trace to an Approved PRD Pack, user planning answer, accepted Planning Amendment, repository fact, reference artifact, explicit system policy, or recorded assumption; unsupported invented claims are audit defects. Implementation readiness of the complete pipeline requires a clean-room fixture proving Approve And Build creates exactly one PlanCompileRun, executes mandatory parallel stages, certifies a complete WorkGraph and WorkNodeRequests, passes Executor intake/provisioning, atomically creates GoalRun and WorkNodes, queues an entrypoint, and appears in Orchestrator. The fixture suite covers duplicate PlanApproved delivery, restart during
  every activation step, greenfield Git, non-Git FileSafe, dirty repository, remote SSH, optional GitHub or PR, missing harness, testing override, plan revision during compile and execution, cancellation before and after mutation, missing parallel receipts, and a deliberately introduced incomplete item. Ledger-to-Plans compilation writes or updates canonical Plans and allowed PlanUnit indexes only in their proper phases; it does not start Plan Compile, create WorkNodes, launch GoalRuns, modify implementation code, or start an Orchestrator build.'
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
- PYTHONPATH=/private/tmp/pm-py-deps python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260618-001-prd-planning-wizard
risk_class: implementation_readiness
reasoning_tier: high
context_scope: ledger_to_plans_compile
implementation_surfaces:
- Plans/Plan_To_Node_Compilation.md
- Plans/Planning_Wizard.md
- Plans/Executor_Protocol.md
- Plans/Progression_Gates.md
- Plans/Plan_Document_System.md
- Plans/Orchestrator_Page.md
- Plans/Automated_Testing_System.md
- Plans/bootstrap/Bootstrap_Planning_Workflow.md
- Plans/Planning_Ledger_System.md
node_compile_hint:
  mode: canonical_planunit_from_bootstrap_ledger
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260618-001-prd-planning-wizard:atom-0137
- pldg-20260618-001-prd-planning-wizard:atom-0142
- pldg-20260618-001-prd-planning-wizard:atom-0145
- pldg-20260618-001-prd-planning-wizard:atom-0146
- pldg-20260618-001-prd-planning-wizard:atom-0168
- Plans/ledgers/v2/pldg-20260618-001-prd-planning-wizard/source_shards/07-audit-readiness-and-safety.md#SRC-AUDIT
- Plans/ledgers/v2/pldg-20260618-001-prd-planning-wizard/source_shards/09-bootstrap-prompts-and-transfer.md#SRC-PROMPTS
source_atom_ids:
- atom-0137
- atom-0142
- atom-0145
- atom-0146
- atom-0168
decision_refs:
- dec-0027
- dec-0028
- dec-0030
correction_refs: []
preserved_exact_tokens:
- Planning Wizard approval
- Plan Compile certification
- WorkNode completion
- Goal completion
- traceability
- unsupported claim
- clean-room fixture
- exactly one PlanCompileRun
- entrypoint queued
- duplicate PlanApproved
- dirty repository
- missing parallel receipts
- deliberately introduced incomplete item
- ledger-to-Plans
- not runtime
negative_constraints:
- Do not certify invented planning details with no source or explicit assumption.
- Do not confuse the bootstrap compile Goal with the finished-product Approve And Build runtime.
owner_hints:
- Plans/Planning_Wizard.md
- Plans/Plan_To_Node_Compilation.md
- Plans/Executor_Protocol.md
- Plans/Progression_Gates.md
- Plans/Plan_Document_System.md
- Plans/Orchestrator_Page.md
- Plans/Automated_Testing_System.md
- Plans/bootstrap/Bootstrap_Planning_Workflow.md
- Plans/Planning_Ledger_System.md
```
