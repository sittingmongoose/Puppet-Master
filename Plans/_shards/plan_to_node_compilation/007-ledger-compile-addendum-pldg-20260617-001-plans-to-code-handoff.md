# Shard 007: Ledger Compile Addendum - pldg-20260617-001-plans-to-code-handoff

Source: `Plans/Plan_To_Node_Compilation.md`

Source lines: L407-L719

Source SHA256: `e07b77a5d56c8012b7b1cfdee8d57aa3e4855c75375dacd3703b75307692d5d2`

---

## Ledger Compile Addendum - pldg-20260617-001-plans-to-code-handoff

### PNC-010 - PlanCompileRun Design-Only State Machine

```yaml
plan_unit_id: PNC-010
unit_type: requirement
status: accepted
owner_doc: Plans/Plan_To_Node_Compilation.md
canonical_text: >-
  PlanCompileRun is a durable, idempotent, resumable design-only state machine for converting approved Plans and PlanUnits into non-executable NodeSeed candidates, WorkGraph drafts, and WorkNode requests. The state record must carry compile_id, source_plan_set_id, source_plan_index_hash, launch_source, runtime_adapter, status, current_stage, cursor, last_green_stage, last_green_hashes, blockers, next_required_stage, and resume_command_or_action. The shared compiler core has two adapters, a Codex bootstrap adapter and a native Puppet Master adapter, so the truth model stays shared while execution surfaces differ. PlanCompile remains design_only_disabled with automatic_launch_enabled: false, native_plan_wizard_launch_enabled: false, and codex_bootstrap_launch_enabled: false until an explicit later enablement PlanUnit accepts runtime launch.
  Resume must be possible through a bounded stage card, stage cards, and worklists, and the Codex bootstrap adapter may package Codex work packages without native runtime dispatch. Do not depend on the native Puppet Master scheduler for bootstrap. The explicit no-build boundary is No WorkNodes, No NodeSeeds, No executable queues, No final node manifests, and PlanCompile dry-run/non-executable schema examples may be documented but not emitted as runtime work.
gui_related: false
gui_classification_reason: State machine and compiler adapter contracts are backend planning/runtime design, not visual presentation.
depends_on: [PNC-001, PNC-007, PNC-009]
unblocks: [PNC-011, PNC-012, PNC-013, PNC-014, GRS-028, OP-023, CV-289]
acceptance_criteria:
  - PlanCompile stays design_only_disabled until explicit enablement.
  - The shared compiler core owns one truth model with Codex bootstrap and native Puppet Master adapters.
  - Resume is possible from durable state fields, source hashes, blockers, and exact NEXT routing without chat memory.
  - The state machine emits no executable WorkNodes, NodeSeeds, queues, final node manifests, implementation files, dispatched GoalRuns, or production build tasks.
validation_surfaces:
  - python3 scripts/pm-plans-verify.py run-gates
  - future PlanCompileRun schema validation
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
  - "shared compiler core"
  - "Codex bootstrap adapter"
  - "native Puppet Master adapter"
  - "one truth model"
  - "low quality agent"
  - "low context"
  - "resume"
  - "source hashes"
  - "exact NEXT routing"
  - "design_only"
  - "automatic_launch_enabled: false"
  - "native_plan_wizard_launch_enabled: false"
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
  Each PlanCompile stage has a bounded stage_card with purpose, read_files, write_files, forbidden_writes, entry_gate, item_boundaries, exit_gate, success_route, and blocked_route so a low-context agent can execute or resume the stage from state only. Required stages include preflight/currentness, scope selection, PlanUnit normalization, dependency/cycle analysis, surface mapping, work type and effort classification, NodeSeed candidate synthesis, split/merge sizing, NodeSeed review, WorkGraph draft, WorkNode request emission, adapter emission, and certification/handoff.
gui_related: false
gui_classification_reason: Stage cards and resumable worklists are compiler process contracts, not GUI implementation.
depends_on: [PNC-010]
unblocks: [PNC-012, PNC-013, PNC-014]
acceptance_criteria:
  - Every stage names read/write/forbidden files, entry and exit gates, item bounds, and next route.
  - A new low-context agent can resume from stage state without rereading the whole repo.
  - Stage cards never authorize WorkNodes, NodeSeeds as runtime artifacts, queues, implementation files, or production build tasks.
validation_surfaces:
  - python3 scripts/pm-plans-verify.py run-gates
  - future stage_card schema validation
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
  NodeSeed candidates are non-executable intermediate artifacts. They carry source_plan_unit_ids, source_acceptance_unit_ids, objective, owner_area, implementation_surfaces, read_set, write_set_candidates, acceptance_criteria, validator_candidates, dependency_refs, risk_class, reasoning_tier, work_type, effort, gui_related, frontend_related, capability requirements, authority policy, sizing, status, and blockers. The NodeSeed review gate proves coverage, excluded dispositions, acceptance criteria, validators or explicit gaps, bounded write surfaces, dependencies, GUI flags, risk/reasoning/capability metadata, and absence of executable WorkNodes before a WorkGraph draft can be considered.
  NodeSeed routing metadata preserves effort_class and capability_lane alongside work_type, gui_related, frontend_related, and reasoning_tier before any reviewable candidate can be promoted to a WorkGraph draft.
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
  - future node_seed_candidate schema validation
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
  WorkGraph draft is the first executable-shaped artifact but remains reviewable and non-dispatched before Executor intake. It carries nodes, entrypoints, dependency_edges, scheduler_policy, graph_integrity, authority, evidence, and validation_state. PlanCompile emits WorkNodeRequest records, not runnable WorkNodes. Each WorkNode request must carry source PlanUnit refs, objective, implementation surfaces, read/write candidates, acceptance criteria, validator candidates, dependency refs, work_type, gui_related, frontend_related, effort_class, reasoning tier, context size, validation cost, risk class, authority risk, user-visible risk, capability_lane, test_binding, model routing, and ordering metadata. Default build order begins with test capability discovery, source-control/worktree/safe-point discovery, environment/toolchain setup, contracts/schemas/storage, core runtime/execution, providers/models/settings/permissions, GUI shell/navigation, features, integration/seams, automated tests/browser/device checks, source-control promotion, and final Auditor certification.
  WorkNode request ordering metadata explicitly carries build_phase, dependency_type, parallel_group_id, scheduler_lane, and ordering_reason, and its test_binding includes generated_test_ids, browser_session_required, and visual_evidence_required when automated evidence is required.
gui_related: true
gui_classification_reason: WorkNode request routing includes GUI/frontend flags and user-visible risk metadata that drive visible routing and testing surfaces.
depends_on: [PNC-012, ATS-003]
unblocks: [EP-099, EP-100, EP-101, CV-289]
acceptance_criteria:
  - WorkGraph drafts remain reviewable and cannot dispatch before Executor intake.
  - PlanCompile emits WorkNode requests, not runnable WorkNodes.
  - Requests carry test binding, model routing, ordering, risk, GUI/frontend, authority, and validation metadata.
  - Default build order covers discovery, safe points, environment, contracts, runtime, providers, GUI shell, features, integrations, automated checks, promotion, and Auditor certification before execution is accepted.
validation_surfaces:
  - python3 scripts/pm-plans-verify.py run-gates
  - future WorkGraph draft and WorkNode request schema validation
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
  - "build_phase"
  - "dependency_type"
  - "parallel_group_id"
  - "scheduler_lane"
  - "ordering_reason"
  - "test_binding"
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
  Plan_To_Node_Compilation owns the Plan Compile side of the Plans-to-Code Handoff Matrix. Every transition from Plan Wizard approval through PlanCompile, Executor intake, source-control preflight, dispatch, tests, Auditor verification, repair, promotion, graph completion, and certification must name source_artifact, destination_artifact, owner, validator, receipt, retry_route, rollback_route, and user_escalation_condition. The schema draft in Plans/plans_to_code_handoff.schema.json records PlanCompileRun, stage card, compile worklist, NodeSeed candidate, NodeSeed review, WorkGraph draft, WorkNode request, compiler model routing, Codex work package, Codex external GUI-agent request, PlanCompile receipt, automated testing reports, test cases, test run receipts, visual evidence, source-control receipts, model resolution receipts, ExecutorIntakeReport, and GoalCompletionReceipt shapes as design-only contracts.
  The handoff matrix names Plans to WorkNodes as a design-only bridge. Do not expose this bridge as a built Puppet Master setting. Its schema boundary is the single design-only `Plans/plans_to_code_handoff.schema.json` draft, whose `$defs` include `plan_compile_run`, `node_seed_candidate`, `worknode_request`, `test_capability_report`, `source_control_preflight_receipt`, and `goal_completion_receipt` while preserving source_artifact, destination_artifact, retry_route, and rollback_route fields. The artifact-backed handoff can carry Plans to code completion only after Auditor verifies and final certification evidence closes the chain.
gui_related: false
gui_classification_reason: Handoff matrix and schema boundaries are backend contract and traceability surfaces.
depends_on: [PNC-010, PNC-011, PNC-012, PNC-013]
unblocks: [EP-102, GRS-030, POA-048, CV-289]
acceptance_criteria:
  - Every handoff names artifact, owner, validator, receipt, retry, rollback, and escalation route.
  - The schema draft records required artifact families without enabling PlanCompile.
  - Codex bootstrap external GUI-agent request is documented as a bootstrap artifact only, not a built Puppet Master setting.
validation_surfaces:
  - python3 scripts/pm-plans-verify.py run-gates
  - future handoff matrix validation
risk_class: handoff_gap
reasoning_tier: high
context_scope: plans_to_code_handoff
implementation_surfaces: [Plans/Plan_To_Node_Compilation.md, Plans/Executor_Protocol.md, Plans/Contracts_V0.md, Plans/Project_Output_Artifacts.md, Plans/plans_to_code_handoff.schema.json]
node_compile_hint: {mode: handoff_matrix_contract, create_worknodes: false, create_nodeseeds: false}
source_lineage:
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
preserved_exact_tokens:
  - "Plan Compile"
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
  - "Antigravity"
  - "Claude Code"
  - "Cursor"
  - "OpenCode"
  - "Codex parent verification"
negative_constraints:
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

ContractRef: ContractName:Plans/Plan_To_Node_Compilation.md, ContractName:Plans/Automated_Testing_System.md, ContractName:Plans/Executor_Protocol.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/Project_Output_Artifacts.md
