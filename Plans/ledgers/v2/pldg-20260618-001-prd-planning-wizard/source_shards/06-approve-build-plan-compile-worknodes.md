# Approve And Build, Plan Compile, WorkNode Creation, and Orchestrator Start

## SRC-COMPILE

Exact user wording preserved: the final button is “Approve And Build.”

Approve And Build freezes an immutable ApprovedPlanPack, emits one idempotent PlanApproved event, automatically creates or resumes one PlanCompileRun, and immediately navigates the application to Orchestrator with Plan Compile open. There is no ordinary second Start Build confirmation.

Plan Compile is a durable staged compiler with runtime-enforced parallel subagents, typed dependencies, reviewed NodeSeed candidates, complete WorkNodeRequests, testing/model/source-control binding, and audit certification. Executor then performs structural intake, provisioning preflight, and activation decision. Accepted requests become canonical WorkNodes. GoalRun, WorkGraph, WorkNodes, entrypoint queue, receipt, and start event are activated atomically before Orchestrator reports the build running.

## Accepted obligation inventory

### atom-0101: Use exact final action label Approve And Build

The Planning Wizard final approval button and command label is exactly Approve And Build.

- atom_type: `requirement`
- lane: `approval`
- gui_related: `true`
- exact_tokens: ["Approve And Build"]
- negative_constraints: []
- owner_hints: ["Plans/Planning_Wizard.md", "Plans/FinalGUISpec.md", "Plans/UI_Command_Catalog.md"]

### atom-0102: Approval freezes an immutable Approved Plan Pack

Approve And Build creates a versioned immutable ApprovedPlanPack containing canonical Plan docs, PlanUnit and acceptance-unit snapshots and hashes, source PRD Pack, project-context snapshot, amendments, policies, testing requirements, audit evidence, closure records, readiness report, and planning-ledger lineage references.

- atom_type: `requirement`
- lane: `approval`
- gui_related: `false`
- exact_tokens: ["ApprovedPlanPack", "immutable"]
- negative_constraints: []
- owner_hints: ["Plans/Planning_Wizard.md", "Plans/Contracts_V0.md", "Plans/Project_Output_Artifacts.md"]

### atom-0103: Approved plans and indexes are downstream authority

The ApprovedPlanPack and frozen canonical PlanUnit and acceptance-unit indexes are Plan Compile authority; the Planning Wizard ledger remains source and reasoning lineage rather than executable canon.

- atom_type: `requirement`
- lane: `approval`
- gui_related: `false`
- exact_tokens: ["PlanUnit index", "acceptance-unit index", "lineage"]
- negative_constraints: ["Do not treat mutable planning-ledger projections as the sole Plan Compile authority."]
- owner_hints: ["Plans/Planning_Wizard.md", "Plans/Plan_To_Node_Compilation.md", "Plans/Planning_Ledger_System.md"]

### atom-0104: Approval transaction is atomic and outbox-backed

Approve And Build atomically writes the immutable pack, user approval receipt, and PlanApproved transactional-outbox event so approval cannot be committed without a recoverable downstream trigger.

- atom_type: `requirement`
- lane: `approval`
- gui_related: `false`
- exact_tokens: ["PlanApproved", "transactional outbox"]
- negative_constraints: []
- owner_hints: ["Plans/Contracts_V0.md", "Plans/Goal_Runtime_System.md", "Plans/Planning_Wizard.md"]

### atom-0105: PlanApproved is idempotent

PlanApproved uses a deterministic idempotency key derived from project_id, pack_id, pack version, and pack hash; duplicate delivery returns the existing PlanCompileRun rather than creating another run.

- atom_type: `requirement`
- lane: `approval`
- gui_related: `false`
- exact_tokens: ["idempotency_key", "project_id", "pack_hash"]
- negative_constraints: []
- owner_hints: ["Plans/Contracts_V0.md", "Plans/Goal_Runtime_System.md", "Plans/Plan_To_Node_Compilation.md"]

### atom-0106: Automatically launch Plan Compile after approval

Ordinary Approve And Build flow immediately creates or resumes exactly one PlanCompileRun and proceeds without a second Start Build confirmation; optional HITL checkpoints are policy exceptions, not the default.

- atom_type: `requirement`
- lane: `approval`
- gui_related: `false`
- exact_tokens: ["automatic_after_approval", "PlanCompileRun"]
- negative_constraints: ["Do not require a redundant ordinary Start Build confirmation after Approve And Build."]
- owner_hints: ["Plans/Planning_Wizard.md", "Plans/Goal_Runtime_System.md", "Plans/Plan_To_Node_Compilation.md"]

### atom-0107: Navigate immediately to Orchestrator Plan Compile

After Approve And Build succeeds locally, the application automatically switches to the Orchestrator page and opens the Plan Compile tab so the user sees launch reconciliation and compilation starting.

- atom_type: `requirement`
- lane: `approval_gui`
- gui_related: `true`
- exact_tokens: ["Orchestrator", "Plan Compile tab"]
- negative_constraints: []
- owner_hints: ["Plans/Planning_Wizard.md", "Plans/Orchestrator_Page.md", "Plans/FinalGUISpec.md", "Plans/UI_Command_Catalog.md"]

### atom-0108: Show a pending launch shell during reconciliation

If PlanApproved publication or PlanCompileRun identity has not yet reconciled, the Plan Compile tab shows a pending launch shell tied to the approval command and then binds to the durable compile identity without creating a duplicate.

- atom_type: `requirement`
- lane: `approval_gui`
- gui_related: `true`
- exact_tokens: ["pending launch", "compile identity"]
- negative_constraints: []
- owner_hints: ["Plans/Orchestrator_Page.md", "Plans/FinalGUISpec.md", "Plans/Contracts_V0.md"]

### atom-0109: Preserve design-only v1 and add runtime-capable v2

Keep the current plans-to-code handoff v1 as a historical design-only contract with launch disabled, and introduce a versioned runtime-capable contract rather than silently changing v1 semantics.

- atom_type: `requirement`
- lane: `runtime_schema`
- gui_related: `false`
- exact_tokens: ["design_only", "runtime-capable v2"]
- negative_constraints: ["Do not reinterpret existing const-false v1 launch flags as runtime enablement."]
- owner_hints: ["Plans/Plan_To_Node_Compilation.md", "Plans/plans_to_code_handoff.schema.json", "Plans/Contracts_V0.md"]

### atom-0110: Runtime contract carries explicit launch and adapter policy

The runtime schema includes contract_mode, launch_policy, runtime_adapter, runtime_enablement_ref, and runtime_policy_snapshot_ref; finished product defaults to native_runtime plus automatic_after_approval through native_puppet_master_adapter.

- atom_type: `requirement`
- lane: `runtime_schema`
- gui_related: `false`
- exact_tokens: ["contract_mode", "launch_policy", "runtime_adapter", "native_puppet_master_adapter"]
- negative_constraints: []
- owner_hints: ["Plans/Plan_To_Node_Compilation.md", "Plans/Contracts_V0.md"]

### atom-0111: PlanCompileRun is durable, resumable, and currentness-gated

PlanCompileRun persists stage, cursor, bounded worklists, assignment receipts, source hashes, currentness status, blockers, repairs, artifacts, retries, cancellation, supersession, and exact next action across context and process restarts.

- atom_type: `requirement`
- lane: `plan_compile`
- gui_related: `false`
- exact_tokens: ["PlanCompileRun", "currentness", "resume"]
- negative_constraints: []
- owner_hints: ["Plans/Plan_To_Node_Compilation.md", "Plans/Goal_Runtime_System.md", "Plans/storage-plan.md"]

### atom-0112: Instantiate executable Plan Compile stage cards

Define executable stage cards for preflight and currentness, scope selection, PlanUnit normalization, test and repository discovery, typed dependency analysis, implementation-surface mapping, work and risk classification, NodeSeed candidate drafting, split or merge sizing, independent candidate review, WorkGraph construction, WorkNodeRequest construction, final compile audit and repair, and Executor handoff certification.

- atom_type: `requirement`
- lane: `plan_compile`
- gui_related: `false`
- exact_tokens: ["stage card", "NodeSeed candidate", "WorkGraph", "WorkNodeRequest"]
- negative_constraints: []
- owner_hints: ["Plans/Plan_To_Node_Compilation.md"]

### atom-0113: Every stage card has an executable contract

Each stage card defines exact inputs, outputs, algorithms, bounded units, read/write authority, required parallelism, validators, retry and repair routes, currentness behavior, terminal states, and evidence/receipt requirements.

- atom_type: `requirement`
- lane: `plan_compile`
- gui_related: `false`
- exact_tokens: ["inputs", "outputs", "required parallelism", "terminal states"]
- negative_constraints: []
- owner_hints: ["Plans/Plan_To_Node_Compilation.md", "Plans/Contracts_V0.md"]

### atom-0114: Enforce parallel subagents in runtime, not prompt prose

For broad stages the controller computes a bounded worklist and mandatory minimum parallel assignments, launches read-only subagents, records assignment and completion receipts, and rejects certification when required parallel work is absent.

- atom_type: `requirement`
- lane: `parallelism`
- gui_related: `false`
- exact_tokens: ["minimum_parallel_assignments", "assignment receipt", "completion receipt"]
- negative_constraints: ["Do not accept agent self-report as proof that required parallel subagents were used."]
- owner_hints: ["Plans/Goal_Runtime_System.md", "Plans/Plan_To_Node_Compilation.md", "Plans/Contracts_V0.md"]

### atom-0115: No broad single-agent fallback when parallelism is required

A required broad stage may reduce scope or block with a typed runtime-capability error, but it may not silently substitute one broad agent for mandatory parallel analysis or review.

- atom_type: `negative_constraint`
- lane: `parallelism`
- gui_related: `false`
- exact_tokens: ["parallelism_required", "runtime-capability blocker"]
- negative_constraints: ["Do not silently degrade a mandatory parallel stage to one agent."]
- owner_hints: ["Plans/Goal_Runtime_System.md", "Plans/Plan_To_Node_Compilation.md"]

### atom-0116: Compile typed dependencies instead of treating all references as DAG edges

Plan Compile distinguishes owner_reference, consumer_reference, contract_dependency, validation_dependency, build_dependency, runtime_prerequisite, required-before-start, required-before-completion, and write-conflict serialization; only executable ordering edges participate in WorkGraph acyclicity.

- atom_type: `requirement`
- lane: `dependency_compile`
- gui_related: `false`
- exact_tokens: ["typed dependency", "build_dependency", "runtime_prerequisite", "write_conflict_serialization"]
- negative_constraints: []
- owner_hints: ["Plans/Plan_To_Node_Compilation.md", "Plans/Plan_Document_System.md"]

### atom-0117: Use NodeSeed candidates as reviewed intermediate artifacts

Plan Compile may draft NodeSeed candidates as generated intermediate proposals with source PlanUnit coverage, objectives, surfaces, dependencies, capabilities, risks, tests, and sizing, but they are not runtime WorkNodes.

- atom_type: `requirement`
- lane: `node_seed`
- gui_related: `false`
- exact_tokens: ["NodeSeed candidate", "intermediate"]
- negative_constraints: ["Do not dispatch or execute a NodeSeed candidate."]
- owner_hints: ["Plans/Plan_To_Node_Compilation.md"]

### atom-0118: WorkNodeRequest must be semantically complete

A certified WorkNodeRequest has non-empty objective, source PlanUnits and acceptance units, bounded read/write/implementation surfaces, typed dependencies, authority, model/capability routing, test binding, repository currentness, evidence requirements, idempotency, cancellation, and no unsupported or placeholder content.

- atom_type: `requirement`
- lane: `worknode_request`
- gui_related: `false`
- exact_tokens: ["WorkNodeRequest", "objective", "acceptance units", "test binding"]
- negative_constraints: []
- owner_hints: ["Plans/Plan_To_Node_Compilation.md", "Plans/Contracts_V0.md", "Plans/Executor_Protocol.md"]

### atom-0119: Split Executor handoff into three boundaries

Downstream intake is Executor Structural Intake, Provisioning Preflight, and Executor Activation Decision so graph/request validation occurs before repository, worktree, safe-point, test-harness, model, permissions, and credential provisioning.

- atom_type: `requirement`
- lane: `executor_intake`
- gui_related: `false`
- exact_tokens: ["Executor Structural Intake", "Provisioning Preflight", "Executor Activation Decision"]
- negative_constraints: []
- owner_hints: ["Plans/Executor_Protocol.md", "Plans/Plan_To_Node_Compilation.md"]

### atom-0120: Do not start a partially accepted required graph

Activation requires all required active-scope WorkNodeRequests to be accepted together; optional work must be explicitly excluded or deferred before activation, and a mixed result cannot silently start a partial build.

- atom_type: `requirement`
- lane: `executor_intake`
- gui_related: `false`
- exact_tokens: ["all required active-scope", "mixed"]
- negative_constraints: ["Do not start a partially accepted required WorkGraph."]
- owner_hints: ["Plans/Executor_Protocol.md", "Plans/Goal_Runtime_System.md"]

### atom-0121: Executor materializes runtime WorkNodes from accepted requests

After Activation Decision accepts the certified graph, Executor materializes canonical WorkNodeRecord objects from accepted WorkNodeRequests and emits materialization receipts.

- atom_type: `requirement`
- lane: `worknode_runtime`
- gui_related: `false`
- exact_tokens: ["WorkNodeRecord", "WorkNodeMaterializationReceipt"]
- negative_constraints: []
- owner_hints: ["Plans/Executor_Protocol.md", "Plans/Contracts_V0.md", "Plans/storage-plan.md"]

### atom-0122: Define complete runtime WorkNode identity and state

WorkNodeRecord includes worknode_id, goal_run_id, workgraph_id and revision, source_request_id, source PlanUnit and acceptance refs, objective, surfaces, typed readiness predicates, lifecycle, attempts and retries, authority, model, tests, repository/worktree/safe-point refs, evidence, currentness, cancellation, invalidation, and replan generation.

- atom_type: `requirement`
- lane: `worknode_runtime`
- gui_related: `false`
- exact_tokens: ["worknode_id", "goal_run_id", "workgraph_revision", "attempt_id", "replan generation"]
- negative_constraints: []
- owner_hints: ["Plans/Executor_Protocol.md", "Plans/Contracts_V0.md", "Plans/storage-plan.md"]

### atom-0123: Keep legacy project plan node separate

Existing project_plan_node schema remains an import or compatibility contract with an explicit adapter and must not silently become the canonical runtime WorkNodeRecord.

- atom_type: `requirement`
- lane: `worknode_runtime`
- gui_related: `false`
- exact_tokens: ["project_plan_node", "compatibility adapter", "WorkNodeRecord"]
- negative_constraints: ["Do not overload a legacy plan-node shape as runtime execution truth."]
- owner_hints: ["Plans/Executor_Protocol.md", "Plans/Contracts_V0.md"]

### atom-0124: Dispatch receipts use runtime identities

Work dispatch, change, test, retry, and completion receipts use worknode_id and attempt_id plus source_request_id and graph revision; a WorkNodeRequest reference alone is not sufficient runtime identity.

- atom_type: `requirement`
- lane: `worknode_runtime`
- gui_related: `false`
- exact_tokens: ["worknode_id", "attempt_id"]
- negative_constraints: []
- owner_hints: ["Plans/Executor_Protocol.md", "Plans/Contracts_V0.md"]

### atom-0125: Atomically activate GoalRun, WorkGraph, WorkNodes, and entrypoints

After provisioning acceptance, one activation transaction creates or binds the GoalRun in activating state, installs the certified WorkGraph revision, materializes all WorkNodes, queues runnable entrypoints, records the activation receipt, and writes GoalRunStarted or BuildStarted through a transactional outbox.

- atom_type: `requirement`
- lane: `activation`
- gui_related: `false`
- exact_tokens: ["GoalRunStarted", "BuildStarted", "activation transaction"]
- negative_constraints: []
- owner_hints: ["Plans/Goal_Runtime_System.md", "Plans/Executor_Protocol.md", "Plans/Contracts_V0.md"]

### atom-0126: Orchestrator reports running only after activation commit

Orchestrator may show launch and provisioning progress before activation, but it marks the build running and exposes runnable WorkNodes only after the atomic activation commit and durable start receipt.

- atom_type: `requirement`
- lane: `activation`
- gui_related: `true`
- exact_tokens: ["activation commit", "running"]
- negative_constraints: []
- owner_hints: ["Plans/Orchestrator_Page.md", "Plans/Goal_Runtime_System.md"]

### atom-0127: Define duplicate, crash, restart, and cancellation recovery

Activation persists activation_pending, records_materialized, entrypoints_queued, start_event_pending, active, and cancelled_before_mutation states; retries resume idempotently, duplicate commands return the existing GoalRun, and cancellation routes according to whether mutation began.

- atom_type: `requirement`
- lane: `activation`
- gui_related: `false`
- exact_tokens: ["activation_pending", "records_materialized", "entrypoints_queued", "cancelled_before_mutation"]
- negative_constraints: []
- owner_hints: ["Plans/Goal_Runtime_System.md", "Plans/Executor_Protocol.md", "Plans/Contracts_V0.md"]

### atom-0128: Extend the shared runtime identity envelope

Plans-to-code runtime records carry schema version, project, planning run, plan pack, PlanCompileRun, GoalRun, WorkGraph and revision, WorkNode, attempt, actor, status, revision, hashes, currentness, correlation, causation, idempotency, source, artifact, evidence, and supersession fields as applicable.

- atom_type: `requirement`
- lane: `runtime_envelope`
- gui_related: `false`
- exact_tokens: ["correlation_id", "causation_id", "idempotency_key", "currentness_status"]
- negative_constraints: []
- owner_hints: ["Plans/Contracts_V0.md", "Plans/storage-plan.md"]

### atom-0129: Use immutable successor Plan Packs and impact reports

Changes after approval create successor ApprovedPlanPack versions; during compilation or execution a PlanDiffImpactReport classifies unaffected, already safe, needs recompile, and invalidated lanes and only continues unaffected work when dependencies and write surfaces prove safety.

- atom_type: `requirement`
- lane: `plan_change`
- gui_related: `false`
- exact_tokens: ["PlanDiffImpactReport", "unaffected", "needs_recompile", "invalidated"]
- negative_constraints: []
- owner_hints: ["Plans/Planning_Wizard.md", "Plans/Plan_To_Node_Compilation.md", "Plans/Goal_Runtime_System.md"]
