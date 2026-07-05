# Shard 008: Ledger Compile Addendum - pldg-20260617-001-plans-to-code-handoff

Source: `Plans/Plan_To_Node_Compilation.md`

Source lines: L487-L887

Source SHA256: `694877ce20500c01c3763fd28f7bb8531feb4d5a9a404ff49165e608a0d0800a`

---

## Ledger Compile Addendum - pldg-20260617-001-plans-to-code-handoff

### PNC-010 - PlanCompileRun Design-Only State Machine

```yaml
plan_unit_id: PNC-010
unit_type: requirement
status: accepted
owner_doc: Plans/Plan_To_Node_Compilation.md
canonical_text: >-
  The current bootstrap/v1 PlanCompileRun is a durable, idempotent, resumable design-only state machine for converting approved Plans and PlanUnits into non-executable NodeSeed candidates, WorkGraph drafts, and WorkNode requests. The state record must carry compile_id, source_plan_set_id, source_plan_index_hash, launch_source, runtime_adapter, status, current_state, current_stage, cursor, last_green_stage, last_green_hashes, blockers, next_required_stage, resume_command_or_action, receipts, and compile_wave_contracts; last_green_stage and next_required_stage are stage_name | null, not free-form strings. Compile waves are bounded subagent assignment contracts: each wave names assignment_id, assigned_agent_role, source_item_refs, read_set, write_set, forbidden_writes, parent_only_writes, result_status, retry_route, resume_ref, durable_evidence_refs, assignment_receipt, completion_receipt, and parent_writeback_required so a parent compiler remains the only writer/adjudicator. retry_route uses the canonical compile_wave_retry_route object with route_kind, target_stage, reason, and optional resume_ref rather than free-form strings; target_stage is a stage_name, except terminal route kinds must use null. The shared compiler core has two adapters, a Codex bootstrap adapter and a native Puppet Master adapter, so the truth model stays shared while execution surfaces differ. Current bootstrap/v1 PlanCompile remains design_only_disabled with automatic_launch_enabled: false, planning_wizard_launch_enabled: false, and codex_bootstrap_launch_enabled: false until an explicit later enablement PlanUnit accepts runtime launch; native_runtime records use the separate PNC-015 branch and must not reinterpret v1 const-false flags as runtime enablement.
  Resume must be possible through a bounded stage card, stage cards, worklists, compile-wave result receipts, and a single goal prompt carrying the compile_id plus current state refs, and the Codex bootstrap adapter may package Codex work packages without native runtime dispatch. Do not depend on the native Puppet Master scheduler for bootstrap. The explicit no-build boundary is No WorkNodes, No NodeSeeds, No executable queues, No final node manifests, and PlanCompile dry-run/non-executable schema examples may be documented but not emitted as runtime work.
gui_related: false
gui_classification_reason: State machine and compiler adapter contracts are backend planning/runtime design, not visual presentation.
depends_on: [PNC-001, PNC-007, PNC-009]
unblocks: [PNC-011, PNC-012, PNC-013, PNC-014, GRS-028, OP-023, CV-289]
acceptance_criteria:
  - Current bootstrap/v1 PlanCompile stays design_only_disabled until explicit enablement.
  - The shared compiler core owns one truth model with Codex bootstrap and native Puppet Master adapters.
  - Resume is possible from durable state fields, source hashes, blockers, and exact NEXT routing without chat memory.
  - Compile-wave assignment contracts preserve bounded assignments, result status, retry/resume routes, durable evidence, and parent-only writes.
  - The state machine emits no executable WorkNodes, NodeSeeds, queues, final node manifests, implementation files, dispatched GoalRuns, or production build tasks.
validation_surfaces:
  - python3 scripts/pm-plans-verify.py run-gates
  - python3 scripts/pm-plans-verify.py validate-plans-to-code-handoff-schema
  - python3 scripts/pm-plans-verify.py validate-prd-planning-runtime-contracts
risk_class: false_node_generation
reasoning_tier: high
context_scope: plancompile_design_state_machine
implementation_surfaces: [Plans/Plan_To_Node_Compilation.md, Plans/plans_to_code_handoff.schema.json]
node_compile_hint: {mode: plancompile_design_only_state_machine, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - pldg-20260617-001-plans-to-code-handoff:atom-0001
  - pldg-20260617-001-plans-to-code-handoff:atom-0002
  - pldg-20260617-001-plans-to-code-handoff:atom-0003
  - pldg-20260617-001-plans-to-code-handoff:atom-0006
  - pldg-20260617-001-plans-to-code-handoff:atom-0010
  - pldg-20260617-001-plans-to-code-handoff:atom-0056
  - pldg-20260617-001-plans-to-code-handoff:dec-0001
  - pldg-20260617-001-plans-to-code-handoff:dec-0002
  - pldg-20260617-001-plans-to-code-handoff:dec-0003
  - pldg-20260617-001-plans-to-code-handoff:corr-0005
preserved_exact_tokens:
  - "PlanCompileRun"
  - "current_state"
  - "waves"
  - "receipts"
  - "shared compiler core"
  - "Codex bootstrap adapter"
  - "native Puppet Master adapter"
  - "one truth model"
  - "low quality agent"
  - "low context"
  - "resume"
  - "startable from one goal prompt"
  - "source hashes"
  - "exact NEXT routing"
  - "compile_wave_contracts"
  - "parent_only_writes"
  - "durable_evidence_refs"
  - "design_only"
  - "automatic_launch_enabled: false"
  - "planning_wizard_launch_enabled: false"
  - "codex_bootstrap_launch_enabled: false"
negative_constraints:
  - Do not build two unrelated compilers that drift.
  - Do not rely on chat memory or one high-context model remembering the full process.
  - Do not implement PlanCompile as a giant prompt chain.
  - Do not create production WorkNodes, executable WorkGraphs, dispatched GoalRuns, or native queues in this phase.
owner_hints:
  - Plans/Plan_To_Node_Compilation.md
  - Plans/Goal_Runtime_System.md
  - Plans/Executor_Protocol.md
```

### PNC-011 - Low-Context Stage Card Contract

```yaml
plan_unit_id: PNC-011
unit_type: requirement
status: accepted
owner_doc: Plans/Plan_To_Node_Compilation.md
canonical_text: >-
    Each design-only PlanCompile stage has a bounded stage_card with stage_id, purpose, read_files, write_files, forbidden_writes, entry_gate, item_boundaries, exit_gate, success_route, blocked_route, assignment_contract, and parent_writeback_policy so a low-context agent can execute or resume the stage from state after explicit runtime enablement, while the current bootstrap remains non-dispatching. Stage success_route and blocked_route use canonical route objects with route_kind, target_stage, reason, and optional resume_ref, and compile worklist blocked_route uses the same exact target object shape, rather than unrestricted strings. target_stage is a stage_name whenever the route chooses a next stage; terminal route kinds must set target_stage to null. Required stage contracts use the canonical registry: preflight_currentness, scope_selection, planunit_normalization, test_repository_discovery, typed_dependency_analysis, implementation_surface_mapping, work_risk_classification, nodeseed_candidate_drafting, split_merge_sizing, candidate_review, workgraph_construction, worknode_request_construction, final_compile_audit_repair, executor_handoff_certification, activation_transaction, and orchestrator_projection.
gui_related: false
gui_classification_reason: Stage cards and resumable worklists are compiler process contracts, not GUI implementation.
depends_on: [PNC-010]
unblocks: [PNC-012, PNC-013, PNC-014]
acceptance_criteria:
  - Every stage names stage_id, read/write/forbidden files, entry and exit gates, item bounds, and exact route objects.
  - A new low-context agent can resume from stage state without rereading the whole repo.
  - Stage cards never authorize WorkNodes, NodeSeeds as runtime artifacts, queues, implementation files, or production build tasks.
validation_surfaces:
  - python3 scripts/pm-plans-verify.py run-gates
  - python3 scripts/pm-plans-verify.py validate-prd-planning-runtime-contracts
risk_class: low_context_resume_failure
reasoning_tier: high
context_scope: plancompile_stage_cards
implementation_surfaces: [Plans/Plan_To_Node_Compilation.md, Plans/plans_to_code_handoff.schema.json]
node_compile_hint: {mode: low_context_stage_cards, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - pldg-20260617-001-plans-to-code-handoff:atom-0004
  - pldg-20260617-001-plans-to-code-handoff:atom-0005
  - pldg-20260617-001-plans-to-code-handoff:dec-0002
preserved_exact_tokens:
  - "preflight/currentness"
  - "PlanUnit normalization"
  - "dependency/cycle analysis"
  - "work type and effort classification"
  - "NodeSeed candidate synthesis"
  - "WorkGraph draft"
  - "WorkNode request emission"
  - "stage_card"
  - "entry_gate"
  - "exit_gate"
  - "item_boundaries"
negative_constraints:
  - Do not ask an agent to reason over the full Plan index when a bounded worklist can be used.
owner_hints:
  - Plans/Plan_To_Node_Compilation.md
  - Plans/Planning_Ledger_System.md
```

### PNC-012 - NodeSeed Candidate And Review Gate Contract

```yaml
plan_unit_id: PNC-012
unit_type: requirement
status: accepted
owner_doc: Plans/Plan_To_Node_Compilation.md
canonical_text: >-
  NodeSeed candidates are non-executable intermediate artifacts. They carry source_plan_unit_ids, source_acceptance_unit_ids, objective, owner_area, implementation_surfaces, read_set, write_set_candidates, acceptance_criteria, validator_candidates, dependency_refs, risk_class, reasoning_tier, work_type, effort, gui_related, frontend_related, capability_requirements, authority policy, sizing, status, and blockers. The NodeSeed review gate proves coverage, excluded dispositions, acceptance criteria, validators or explicit gaps, bounded write surfaces, dependencies, GUI flags, risk/reasoning/capability metadata, and absence of executable WorkNodes before a WorkGraph draft can be considered. Review decision and reviewer_role use canonical node_seed_review_decision and node_seed_reviewer_role enums rather than free-form strings.
  NodeSeed routing metadata preserves effort_class, capability_lane, and capability_requirements alongside work_type, gui_related, frontend_related, and reasoning_tier before any reviewable candidate can be promoted to a WorkGraph draft.
gui_related: false
gui_classification_reason: NodeSeed candidates and review gates are compiler artifact contracts, not visual presentation.
depends_on: [PNC-010, PNC-011, PNC-002, PNC-005]
unblocks: [PNC-013, PNC-014, CV-289]
acceptance_criteria:
  - NodeSeed candidates are explicitly non-executable and cannot be dispatched.
  - Review covers coverage, exclusions, acceptance, validators/gaps, write bounds, dependencies, GUI flags, risk/reasoning/capability metadata, and no executable WorkNodes.
  - Candidate contracts preserve gui_related inheritance without creating runtime NodeSeeds.
validation_surfaces:
  - python3 scripts/pm-plans-verify.py run-gates
  - python3 scripts/pm-plans-verify.py validate-plans-to-code-handoff-schema
  - python3 scripts/pm-plans-verify.py validate-prd-planning-runtime-contracts
risk_class: false_node_generation
reasoning_tier: high
context_scope: nodeseed_candidate_contract
implementation_surfaces: [Plans/Plan_To_Node_Compilation.md, Plans/Contracts_V0.md, Plans/plans_to_code_handoff.schema.json]
node_compile_hint: {mode: nodeseed_candidate_design_contract, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - pldg-20260617-001-plans-to-code-handoff:atom-0013
  - pldg-20260617-001-plans-to-code-handoff:atom-0014
  - pldg-20260617-001-plans-to-code-handoff:atom-0017
  - pldg-20260617-001-plans-to-code-handoff:dec-0005
  - pldg-20260617-001-plans-to-code-handoff:dec-0010
preserved_exact_tokens:
  - "NodeSeed candidate"
  - "non-executable"
  - "source_plan_unit_ids"
  - "acceptance_criteria"
  - "NodeSeed review gate"
  - "coverage"
  - "bounded write surfaces"
  - "absence of executable WorkNodes"
  - "work_type"
  - "gui_related"
  - "effort_class"
  - "reasoning_tier"
  - "capability_lane"
  - "capability_requirements"
negative_constraints:
  - Do not treat NodeSeeds as final WorkNodes.
  - Do not emit NodeSeed candidates as runtime artifacts in this compile.
owner_hints:
  - Plans/Plan_To_Node_Compilation.md
  - Plans/Contracts_V0.md
  - Plans/Models_System.md
  - Plans/Executor_Protocol.md
```

### PNC-013 - WorkGraph Draft And WorkNode Request Contract

```yaml
plan_unit_id: PNC-013
unit_type: requirement
status: accepted
owner_doc: Plans/Plan_To_Node_Compilation.md
canonical_text: >-
    WorkGraph draft is the first executable-shaped artifact but remains reviewable and non-dispatched before Executor intake. It carries nodes, entrypoints, dependency_edges, scheduler_policy, graph_integrity, authority, evidence, and validation_state. When a later explicit runtime enablement exists, PlanCompile may draft WorkNodeRequest records for review, not runnable WorkNodes. Each WorkNode request schema must carry source PlanUnit refs, objective, implementation surfaces, read/write candidates, acceptance criteria, validator candidates, dependency refs, work_type, gui_related, frontend_related, effort_class, reasoning tier, context size, validation cost, risk class, authority risk, user-visible risk, capability_lane, capability_requirements, test_binding, model routing, and ordering metadata. The design-only default build order records discovery, source-control/worktree/safe-point discovery, environment/toolchain setup, contracts/schemas/storage, core runtime/execution, providers/models/settings/permissions, GUI shell/navigation, features, integration/seams, automated tests/browser/device checks, source-control promotion, and final Auditor certification.
    WorkNode request ordering metadata explicitly carries build_phase, dependency_type, depends_on, unblocks, manual_priority, required_before_start, required_after_start, required_before_completion, required_after_completion, parallel_group_id, scheduler_lane, and ordering_reason. Its test_binding includes generated_test_ids, reused_test_ids, completion_commands, browser_session_required, emulator_required, visual_evidence_required, expected_artifacts, flake_policy, test_gap_policy, and manual_only_acceptance_not_allowed when automated evidence is required. The current repair records schema contracts only and emits no NodeSeeds, WorkNodes, executable queues, or build tasks.
gui_related: true
gui_classification_reason: WorkNode request routing includes GUI/frontend flags and user-visible risk metadata that drive visible routing and testing surfaces.
depends_on: [PNC-012, ATS-003]
unblocks: [EP-099, EP-100, EP-101, CV-289]
acceptance_criteria:
  - WorkGraph drafts remain reviewable and cannot dispatch before Executor intake.
  - Native runtime enablement may draft WorkNode requests, not runnable WorkNodes; the current repair emits no runtime artifacts.
  - Requests carry test binding, model routing, ordering, risk, GUI/frontend, authority, and validation metadata.
  - Default build order covers discovery, safe points, environment, contracts, runtime, providers, GUI shell, features, integrations, automated checks, promotion, and Auditor certification before execution is accepted, with manual priority and required-before/after start/completion relationships.
validation_surfaces:
  - python3 scripts/pm-plans-verify.py run-gates
  - python3 scripts/pm-plans-verify.py validate-prd-planning-runtime-contracts
risk_class: executor_boundary_bypass
reasoning_tier: high
context_scope: workgraph_draft_worknode_request
implementation_surfaces: [Plans/Plan_To_Node_Compilation.md, Plans/Executor_Protocol.md, Plans/Automated_Testing_System.md, Plans/Models_System.md, Plans/plans_to_code_handoff.schema.json]
node_compile_hint: {mode: worknode_request_design_contract, create_worknodes: false}
source_lineage:
  - pldg-20260617-001-plans-to-code-handoff:atom-0015
  - pldg-20260617-001-plans-to-code-handoff:atom-0016
  - pldg-20260617-001-plans-to-code-handoff:atom-0017
  - pldg-20260617-001-plans-to-code-handoff:atom-0025
  - pldg-20260617-001-plans-to-code-handoff:atom-0026
  - pldg-20260617-001-plans-to-code-handoff:atom-0033
  - pldg-20260617-001-plans-to-code-handoff:dec-0005
  - pldg-20260617-001-plans-to-code-handoff:dec-0010
  - pldg-20260617-001-plans-to-code-handoff:dec-0011
preserved_exact_tokens:
  - "WorkGraph draft"
  - "entrypoints"
  - "dependency_edges"
  - "scheduler_policy"
  - "WorkNodeRequest"
  - "Executor intake"
  - "not runnable WorkNodes"
  - "effort_class"
  - "capability_lane"
  - "capability_requirements"
  - "build_phase"
  - "dependency_type"
  - "manual_priority"
  - "required_before_start"
  - "required_after_start"
  - "required_before_completion"
  - "required_after_completion"
  - "parallel_group_id"
  - "scheduler_lane"
  - "ordering_reason"
  - "test_binding"
  - "reused_test_ids"
  - "test capability discovery"
  - "source-control/worktree/safe-point discovery"
  - "environment/toolchain setup"
  - "contracts/schemas/storage"
  - "source-control promotion"
  - "final Auditor certification"
negative_constraints:
  - Do not dispatch from WorkGraph draft before certified Executor intake.
  - Do not let PlanCompile directly dispatch worker execution.
owner_hints:
  - Plans/Plan_To_Node_Compilation.md
  - Plans/Executor_Protocol.md
  - Plans/Contracts_V0.md
```

### PNC-014 - Plans-To-Code Handoff Matrix And Schema Boundary

```yaml
plan_unit_id: PNC-014
unit_type: requirement
status: accepted
owner_doc: Plans/Plan_To_Node_Compilation.md
canonical_text: >-
  Plan_To_Node_Compilation owns the Plan Compile side of the Plans-to-Code Handoff Matrix. Every transition from Planning Wizard Approve And Build approval and the PlanApproved handoff into PlanCompileRun state, then through PlanCompile, Executor intake, source-control preflight, dispatch, tests, Auditor verification, repair, promotion, graph completion, and certification must name row_id, transition, source_artifact, destination_artifact, producer, consumer, owner, validator, receipt, schema_payload, retry_route, rollback_route, user_escalation_condition, evidence_refs, and plan_unit_refs. For the current bootstrap/v1 matrix, Plan Compile source authority is the immutable ApprovedPlanPack plus frozen PlanUnit and acceptance-unit indexes; the Planning Wizard ledger remains source and reasoning lineage rather than executable Plan Compile authority. The shared `Plans/plans_to_code_handoff.schema.json` document keeps top-level `schema_id` at `pm.plans_to_code_handoff.v1`; within that stable document identity, the current bootstrap/v1 branch is the historical design_only contract with launch disabled, while PNC-015 owns the runtime-capable v2 native_runtime branch with runtime enablement evidence. The schema draft in Plans/plans_to_code_handoff.schema.json records handoff_matrix, handoff_row, PlanCompileRun, stage card, compile worklist, NodeSeed candidate, NodeSeed review, WorkGraph draft, WorkNode request, compiler model routing, Codex work package, Codex external GUI-agent request, PlanCompile receipt, automated testing reports, test cases, test run receipts, visual evidence, source-control receipts, WorkNode dispatch/change/completion receipts, Auditor cycle and verification receipts, repair attempt receipts, legacy validation_pass_report compatibility aliases, model resolution receipts, ExecutorIntakeReport, and GoalCompletionReceipt shapes for the disabled design_only branch plus the runtime-aware native_runtime branch; neither branch creates runtime artifacts by itself.
  The PlanApproved handoff records the approval_cas_receipt, transactional outbox requirement, and deterministic idempotency_key over project_id, pack identity/version/hash, PlanningRun revision, topic map version, PlanUnit and acceptance-unit index hashes, testing policy hash, project-context snapshot hash, and final audit/closure hash so approval cannot create duplicate or stale PlanCompileRun state. The handoff matrix names Plans to WorkNodes as a design-only bridge. Do not expose this bridge as a built Puppet Master setting. Its schema boundary is the single `Plans/plans_to_code_handoff.schema.json` draft, whose `$defs` include a concrete strict payload definition for every `artifact_kind` enum value and whose top-level discriminator maps each `artifact_kind` to the matching `payload` schema, including `handoff_matrix`, `handoff_row`, `plan_compile_run`, `node_seed_candidate`, `worknode_request`, `test_capability_report`, `source_control_receipt`, `source_control_preflight_receipt`, `worknode_dispatch_receipt`, `auditor_cycle_report`, `validation_pass_report`, and `goal_completion_receipt` while preserving source_artifact, destination_artifact, retry_route, rollback_route, and user_escalation_condition fields. Within that single schema_id=v1 draft, current bootstrap/v1 records use the historical design_only branch and runtime-capable v2 records use native_runtime only with runtime enablement evidence. H-001 through H-018 must remain present exactly once, and each row's schema_payload refs must resolve to concrete `$defs` or artifact_kind payloads. The historical per-artifact filename tokens `plan_compile_run.schema.json`, `node_seed_candidate.schema.json`, `worknode_request.schema.json`, and `test_capability_report.schema.json` are compatibility aliases for `$defs` in `Plans/plans_to_code_handoff.schema.json`, not separate schema files. The artifact-backed handoff can carry Plans to code completion only after Auditor verifies and final certification evidence closes the chain.
gui_related: false
gui_classification_reason: Handoff matrix and schema boundaries are backend contract and traceability surfaces.
depends_on: [PNC-010, PNC-011, PNC-012, PNC-013, PNC-015]
unblocks: [EP-102, GRS-030, POA-048, CV-289]
acceptance_criteria:
  - Every handoff names artifact, owner, validator, receipt, retry, rollback, and escalation route.
  - The schema draft records required artifact families without enabling PlanCompile.
  - The schema draft distinguishes the current bootstrap/v1 design_only branch from the PNC-015 runtime-capable v2 native_runtime branch.
  - The schema draft discriminates payload schemas by artifact_kind and defines every artifact_kind payload under $defs.
  - The row-by-row handoff matrix below maps every required transition to schema_payload, producer, consumer, evidence_refs, and PlanUnit refs.
  - Codex bootstrap external GUI-agent request is documented as a bootstrap artifact only, not a built Puppet Master setting.
validation_surfaces:
  - python3 scripts/pm-plans-verify.py run-gates
  - python3 scripts/pm-plans-verify.py validate-plans-to-code-handoff-schema
  - python3 scripts/pm-plans-verify.py validate-prd-planning-runtime-contracts
risk_class: handoff_gap
reasoning_tier: high
context_scope: plans_to_code_handoff
implementation_surfaces: [Plans/Plan_To_Node_Compilation.md, Plans/Executor_Protocol.md, Plans/Contracts_V0.md, Plans/Project_Output_Artifacts.md, Plans/plans_to_code_handoff.schema.json]
node_compile_hint: {mode: handoff_matrix_contract, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - pldg-20260618-001-prd-planning-wizard:atom-0002
  - pldg-20260618-001-prd-planning-wizard:atom-0101
  - pldg-20260618-001-prd-planning-wizard:atom-0102
  - pldg-20260618-001-prd-planning-wizard:atom-0103
  - pldg-20260618-001-prd-planning-wizard:atom-0104
  - pldg-20260618-001-prd-planning-wizard:atom-0105
  - pldg-20260618-001-prd-planning-wizard:atom-0106
  - pldg-20260618-001-prd-planning-wizard:atom-0109
  - pldg-20260617-001-plans-to-code-handoff:atom-0007
  - pldg-20260617-001-plans-to-code-handoff:atom-0011
  - pldg-20260617-001-plans-to-code-handoff:atom-0041
  - pldg-20260617-001-plans-to-code-handoff:atom-0057
  - pldg-20260617-001-plans-to-code-handoff:atom-0060
  - pldg-20260617-001-plans-to-code-handoff:atom-0061
  - pldg-20260617-001-plans-to-code-handoff:dec-0009
  - pldg-20260617-001-plans-to-code-handoff:dec-0017
  - pldg-20260617-001-plans-to-code-handoff:dec-0024
  - pldg-20260617-001-plans-to-code-handoff:dec-0026
source_atom_ids:
  - atom-0002
  - atom-0101
  - atom-0102
  - atom-0103
  - atom-0104
  - atom-0105
  - atom-0106
  - atom-0109
preserved_exact_tokens:
  - "Plan Compile"
  - "Planning Wizard"
  - "Approve And Build"
  - "ApprovedPlanPack"
  - "PlanApproved"
  - "approval_cas_receipt"
  - "transactional outbox"
  - "idempotency_key"
  - "project_id"
  - "pack_hash"
  - "PlanUnit index"
  - "acceptance-unit index"
  - "lineage"
  - "Plans to WorkNodes"
  - "WorkNode requests"
  - "Plans-to-Code Handoff Matrix"
  - "source artifact"
  - "destination artifact"
  - "owner"
  - "validator"
  - "receipt"
  - "retry route"
  - "rollback route"
  - "Plans/plans_to_code_handoff.schema.json"
  - "plan_compile_run"
  - "node_seed_candidate"
  - "worknode_request"
  - "test_capability_report"
  - "source_control_preflight_receipt"
  - "goal_completion_receipt"
  - "external GUI-agent CLI"
  - "custom CLI providers"
  - "provider_kind"
  - "plan_compile_run.schema.json"
  - "node_seed_candidate.schema.json"
  - "worknode_request.schema.json"
  - "test_capability_report.schema.json"
  - "Antigravity"
  - "Claude Code"
  - "Cursor"
  - "OpenCode"
  - "Codex parent verification"
  - "runtime-aware"
  - "design_only"
  - "native_runtime"
  - "runtime-capable v2"
negative_constraints:
  - Do not treat the Planning Wizard ledger as executable Plan Compile authority.
  - Do not treat the historical bootstrap/v1 design_only branch as runtime enablement.
  - Do not show Executor code-generation progress inside the Plan Compile tab except final handoff status.
  - Do not expose the Codex external GUI-agent bridge as a built Puppet Master setting.
  - Do not compile vague roadmap prose that leaves future agents to infer the contracts.
owner_hints:
  - Plans/Plan_To_Node_Compilation.md
  - Plans/Goal_Runtime_System.md
  - Plans/Executor_Protocol.md
  - Plans/Contracts_V0.md
  - Plans/Project_Output_Artifacts.md
```

#### Plans-To-Code Handoff Matrix Rows

These rows are design-only contract rows. They do not launch PlanCompile, create runtime NodeSeeds, dispatch WorkNodes, create executable queues, write implementation files, or produce production build tasks.

| row_id | transition | source_artifact | destination_artifact | producer | consumer | owner | validator | receipt | schema_payload | retry_route | rollback_route | user_escalation_condition | evidence_refs | plan_unit_refs |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| H-001 | Planning Wizard Approve And Build approval to current bootstrap/v1 design-only PlanCompileRun state | immutable ApprovedPlanPack plus frozen PlanUnit and acceptance-unit indexes plus PlanApproved event | current bootstrap/v1 PlanCompileRun state | Planning Wizard Approve And Build / PlanApproved outbox | Plan_To_Node_Compilation | Planning_Wizard + Plan_To_Node_Compilation + Contracts_V0 | ApprovedPlanPack currentness, approval CAS receipt, PlanUnit index hash, acceptance-unit index hash, design_only disabled gate | plan_compile_receipt | plan_compile_run | rerun currentness preflight or reissue PlanApproved from the same approved pack | no runtime mutation to roll back | true product decision, missing Approve And Build approval evidence, missing approval_cas_receipt, stale ApprovedPlanPack hash, or stale PlanUnit/acceptance-unit index hash | ApprovedPlanPack ref, PlanApproved/approval receipt ref, approval_cas_receipt ref, PlanUnit index ref, acceptance-unit index ref, compile state ref | PWIZ-010, PWIZ-014, PNC-010, PNC-015, CV-290, GRS-028, GRS-031 |
| H-002 | Compile state to bounded stage work | PlanCompileRun state | stage_card and compile_worklist | Plan_To_Node_Compilation | low-context compile adapter | Plan_To_Node_Compilation | stage entry/exit gate validation | plan_compile_receipt | stage_card, compile_worklist | regenerate bounded worklist from same source hashes | discard draft worklist | stage cannot name bounded read/write/forbidden surfaces | compile state ref, stage card ref, worklist ref | PNC-010, PNC-011 |
| H-003 | Stage work to non-executable NodeSeed candidate review | compile_worklist | NodeSeed candidate plus NodeSeed review | Plan_To_Node_Compilation | Plan_To_Node_Compilation review gate | Plan_To_Node_Compilation | coverage, exclusions, validators/gaps, GUI flags, no executable WorkNodes | plan_compile_receipt | node_seed_candidate, node_seed_review | split/merge candidate and rerun review | mark candidate excluded or blocked | source PlanUnit ambiguity or authority boundary | candidate ref, review ref, coverage ref | PNC-012 |
| H-004 | Reviewed candidates to WorkGraph draft | approved NodeSeed reviews | WorkGraph draft | Plan_To_Node_Compilation | Executor intake preview | Plan_To_Node_Compilation | graph integrity, dependencies, scheduler policy, authority | plan_compile_receipt | workgraph_draft | repair graph edges or candidate sizing | return to NodeSeed review | irreconcilable dependency cycle or authority conflict | workgraph ref, candidate refs, graph validation ref | PNC-012, PNC-013 |
| H-005 | WorkGraph draft to WorkNode request draft | WorkGraph draft node | non-executable WorkNodeRequest | Plan_To_Node_Compilation | Executor intake | Plan_To_Node_Compilation + Automated_Testing_System + Models_System | request completeness, test_binding, model routing, ordering, risk, authority | plan_compile_receipt | worknode_request, compiler_model_routing, test_binding, ordering | regenerate request from reviewed graph node | return request to graph draft | missing acceptance criteria, missing test capability, or unsafe authority | request ref, model routing ref, test binding ref | PNC-013, ATS-003, MS-111 |
| H-006 | WorkNode request to Executor intake | WorkNodeRequest | ExecutorIntakeReport | Executor intake | Executor scheduler/runtime | Executor_Protocol | graph/source-control/test/model/authority/readiness checks | executor_intake_report | executor_intake_report | repair request metadata and resubmit intake | leave request non-runnable | rejected authority, missing source-control preflight, or missing tests | intake report ref, rejected/accepted request refs | EP-099, PNC-013 |
| H-007 | Executor intake to source-control preflight | accepted request plus repo/worktree context | source-control preflight and source-control execution context | Executor_Protocol | WorktreeGitImprovement / FileSafe / GitHub optional promotion | Executor_Protocol + WorktreeGitImprovement + FileSafe | repo/worktree/baseline/safe-point policy validation | source_control_preflight_receipt | source_control_preflight_receipt, source_control_receipt | refresh worktree/safe-point context | restore from safe point or block before mutation | missing credential, unsafe dirty state, conflict, or rollback unavailable | repo ref, worktree ref, baseline ref, safe-point ref | EP-100, W-072, F2-189 |
| H-008 | Source-control preflight to safe point | validated source-control preflight | safe-point receipt | WorktreeGitImprovement / FileSafe | Executor_Protocol | FileSafe + WorktreeGitImprovement | safe point created and restorable | safe_point_receipt | safe_point_receipt | retry snapshot/safe-point creation | no mutation after failed safe point | snapshot failure or destructive action without rollback | safe-point ref, restore action ref | EP-100, W-072, F2-189 |
| H-009 | Accepted request to dispatch receipt | accepted request plus preflight/model/test refs | WorkNode dispatch receipt | Executor scheduler/runtime | WorkNode executor | Executor_Protocol | dispatch boundary, capacity, model, authority, test binding | worknode_dispatch_receipt | worknode_dispatch_receipt | requeue after transient capacity or model issue | cancel dispatch before mutation or restore safe point | unavailable model/tool, authority block, or capacity exhaustion | dispatch ref, model ref, preflight ref, test binding ref | EP-099, EP-100, EP-101, EP-103 |
| H-010 | Work execution to change receipt | dispatched WorkNode plus safe point | WorkNode change receipt | WorkNode executor | Executor verifier | Executor_Protocol | changed paths, diffs, source-control receipt, test refs | worknode_change_receipt | worknode_change_receipt | rerun bounded repair or request graph patch | restore safe point or revert diff | write-surface violation, conflict, or unreviewable diff | diff refs, changed paths, source-control refs | EP-103, W-072 |
| H-011 | Test capability discovery to test strategy | project surface and WorkNode request | capability/probe/strategy/test case artifacts | Automated_Testing_System | Executor intake and verifier | Automated_Testing_System | capability discovery, probe command, oracle, gap blocker validation | test_capability_report, test_harness_probe_report | test_capability_report, test_harness_probe_report, test_strategy, test_case | probe alternate harness or create deferred test-harness request candidate after enablement | block completion without marking pass | no automated capability, missing runner, or official testing option requires research | capability report ref, probe ref, strategy ref, test case refs | ATS-001, ATS-002, ATS-003 |
| H-012 | Test execution to automated evidence | changed artifact refs plus test strategy | TestRunReceipt and visual evidence | Automated_Testing_System / Executor verifier | Auditor loop and completion certification | Automated_Testing_System + Executor_Protocol | command result, expected artifacts, evidence refs, flake policy, manual-only block | test_run_receipt | test_run_receipt, visual_evidence | rerun or quarantine per flake policy | restore safe point if test reveals unsafe change | required automation unavailable or visual evidence missing | test run ref, screenshots/log refs, visual evidence refs | ATS-004, EP-101 |
| H-013 | Test/source-control evidence to Auditor cycle | change/test/source-control/model receipts | Auditor cycle report and verification receipt | Auditor Model loop | Executor repair/completion | Models_System + Goal_Runtime_System + Executor_Protocol | audit, bounded repair, re-audit until certified or blocked | auditor_verification_receipt | auditor_cycle_report, auditor_verification_receipt | run bounded repair cycle | restore/revert via safe point when repair invalidates source state | critical block, authority boundary, or repair budget exhausted | auditor cycle refs, verification ref, finding refs | MS-110, GRS-028, EP-102, EP-103 |
| H-014 | Legacy validation pass compatibility mirror | Auditor cycle report | legacy validation_pass_report mirror | Project_Output_Artifacts compatibility bridge | import/export/search consumers | Project_Output_Artifacts + Contracts_V0 | compatibility_only true and cycle_report_ref present | validation_pass_report | validation_pass_report | regenerate mirror from canonical Auditor cycle | discard mirror; canonical cycle remains authoritative | legacy import cannot map pass fields to Auditor cycle | cycle report ref, legacy mirror ref | POA-047, CV-289, MS-110 |
| H-015 | Auditor finding to repair attempt | Auditor unresolved finding | repair attempt receipt | Executor repair loop | Auditor re-audit | Executor_Protocol + Goal_Runtime_System | failure signature, repair strategy, changed refs, rerun tests | repair_attempt_receipt | repair_attempt_receipt | choose alternate repair strategy or escalate internal lane | restore last safe point on failed repair | repeated signature, authority boundary, or unsafe external effect | failure signature ref, repair ref, test refs | EP-102, GRS-029 |
| H-016 | Source-control finalization or optional promotion | verified changes and source-control receipts | final source-control or promotion receipt | WorktreeGitImprovement / GitHub optional promotion | Goal completion certification | WorktreeGitImprovement + GitHub_Integration + FileSafe | local truth, final branch/commit, PR/checks when configured | source_control_finalization_receipt, merge_or_promotion_receipt | source_control_finalization_receipt, merge_or_promotion_receipt | retry merge/promotion after conflicts/check repair | restore safe point or preserve intentional dirty state | credential, remote conflict, failed checks, or irreversible external side effect | branch/commit refs, PR/check refs, local finalization ref | W-072, GI-031, EP-103 |
| H-017 | Terminal WorkNode to completion receipt | change/test/Auditor/source-control receipts | WorkNode completion receipt | Executor_Protocol | Goal Runtime certification | Executor_Protocol + Goal_Runtime_System | terminal status, unresolved findings, receipts complete | worknode_completion_receipt | worknode_completion_receipt | re-open repair loop for unresolved finding | restore/revert failed terminal change | unresolved finding or missing child receipt | completion ref, test refs, source-control refs | EP-103, GRS-030 |
| H-018 | All terminal receipts to GoalCompletionReceipt | terminal WorkNode receipts plus final evidence | GoalCompletionReceipt | Goal Runtime certifier | Runtime Artifacts / Project_Output_Artifacts / Orchestrator projection | Goal_Runtime_System + Project_Output_Artifacts | all terminal, tests dispositioned, source-control valid, Auditor passed, no blockers, currentness clean | goal_completion_receipt | goal_completion_receipt | re-open affected WorkNode or graph patch lane | preserve/revert final source state per safe-point policy | active blocker, stale Plan/WorkGraph, failed Auditor, or missing final evidence | child receipts, WorkNode receipts, validator refs, evidence refs | GRS-030, POA-048, RAP-029, OP-024 |

ContractRef: ContractName:Plans/Plan_To_Node_Compilation.md, ContractName:Plans/Automated_Testing_System.md, ContractName:Plans/Executor_Protocol.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/Project_Output_Artifacts.md
