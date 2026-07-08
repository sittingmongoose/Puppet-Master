# Goal Runtime System

> **Compliance:** This document follows `Plans/DRY_Rules.md` and references SSOT contracts in `Plans/Contracts_V0.md`. Naming: "Puppet Master" only. This document owns native Goal Mode runtime behavior, not the bootstrap ledger conversation that produced it.
> **PlanProfile:** New Plan Authoring Profile
> **Authority:** Canonical owner for native Goal runtime/control-plane behavior, invisible and visible goal execution, durable goal state, scheduler updates, evidence, completion receipts, child goals, weak-model safety, verifier/adjudicator policy, goal authority boundaries, and runtime-facing Goal Mode task templates.

## 0. Scope

The Goal Runtime System is Puppet Master's native autonomous execution mode for long-running, cross-referential, or multi-step work. It is not a prompt-packet workflow, not a D2-style staged handoff, and not a planning-only assistant feature.

Goal Mode is general-purpose: user-facing Assistant Chat can invoke it for bugs, features, tests-until-pass, refactors, documentation, repository research, migrations, audits/repairs, and planning/doc transfer. Internal product flows such as future Planning Wizard ledger-to-Plans transfer use the same engine invisibly; legacy Chain Wizard transfer references are compatibility/source-lineage aliases only.

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Planning_Ledger_System.md, ContractName:Plans/Plan_Document_System.md, ContractName:Plans/Plan_To_Node_Compilation.md

## 1. Ownership And Consumers

Goal Runtime owns runtime state, scheduling, update/replan semantics, authority, evidence, certification, model-role policy, and child-goal coordination.

Assistant Chat owns the visible chat controls and displays that project Goal Runtime state: activation, status chips, task trackers, pause/resume/stop/update controls, activity/evidence cards, completion summaries, and collapsible child-goal detail.

FinalGUISpec owns GUI placement for settings surfaces, including the two Goal Mode model selections for worker and verifier/adjudicator roles.

Planning Ledger, Plan Document, and Plan-To-Node docs remain owners for ledger records, PlanUnits, generated indexes, and the readiness-only compiler boundary. Goal Runtime may consume those contracts for ledger-to-Plans goals, but it does not create WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks.

Permissions_System owns the global approval ladder and rule resolution. Goal Runtime owns the Goal-specific invocation rule: high-risk goal actions request explicit approval and invisible/internal goals block when outside predeclared authority.

Runtime_Artifacts_Panel owns user-visible runtime-artifact browsing and retention UI. Goal Runtime owns completion receipt semantics and evidence identity requirements.

Prompt_Pipeline, Models_System, Multi-Account, Provider docs, and provider-specific integration docs own concrete provider/model/account identity. Goal Runtime owns role-policy usage: worker, planner, evaluator, verifier, and adjudicator roles and certification-tier requirements.

## 2. Canonical PlanUnits

### GRS-001 - Native Goal Mode Scope And Retired Prompt Boundary

```yaml
plan_unit_id: GRS-001
unit_type: constraint
status: accepted
owner_doc: Plans/Goal_Runtime_System.md
canonical_text: >-
  Goal Mode is a native autonomous execution mode for finished Puppet Master product behavior. It replaces the failed long prompt-packet/D2 handoff approach for long or cross-referential work. It must support arbitrary assistant goals and must not be narrowed to planning-doc transfer, bootstrapped PM Goal Mode, prompt loops, or staged prompt packets under a different name.
gui_related: false
gui_classification_reason: This unit defines runtime/product scope and retired workflow boundaries, not GUI implementation.
depends_on: []
unblocks: []
acceptance_criteria:
  - Goal Runtime docs describe a native autonomous execution system rather than a prompt-packet or D2 slicing workflow.
  - User-facing Goal Mode remains general-purpose for bugs, features, tests-until-pass, refactors, docs, repo research, migrations, audits/repairs, and planning/doc transfer.
  - Bootstrap-only implementation work is not presented as the product foundation.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - manual Goal Runtime owner review
risk_class: product_scope_drift
reasoning_tier: standard
context_scope: goal_runtime_system
implementation_surfaces:
  - Plans/Goal_Runtime_System.md
  - future Goal Mode service
node_compile_hint:
  mode: runtime_scope_contract
  create_worknodes: false
source_lineage:
  - pldg-20260616-001-goal-runtime-system:atom-0002
  - pldg-20260616-001-goal-runtime-system:atom-0003
  - pldg-20260616-001-goal-runtime-system:atom-0004
  - pldg-20260616-001-goal-runtime-system:atom-0005
  - pldg-20260616-001-goal-runtime-system:atom-0081
  - pldg-20260616-001-goal-runtime-system:dec-0002
  - pldg-20260616-001-goal-runtime-system:dec-0004
  - pldg-20260616-001-goal-runtime-system:dec-0005
  - pldg-20260616-001-goal-runtime-system:corr-0001
  - pldg-20260616-001-goal-runtime-system:corr-0002
  - pldg-20260616-001-goal-runtime-system:corr-0004
preserved_exact_tokens:
  - "native autonomous execution mode"
  - "not merely a smarter prompt"
  - "Do not rebuild long staged prompt handoffs under a different name."
  - "Do not implement Goal Mode as only a prompt loop."
  - "Do not limit Goal Mode to planning docs."
  - "No bootstrapped PM Goal Mode required"
  - "bugs, features, tests-until-pass"
negative_constraints:
  - Do not reintroduce old prompt-packet/D2 workflow as the product foundation.
  - Do not document a separate bootstrapped Goal Mode implementation as required for Puppet Master.
  - Do not narrow Assistant Chat Goal Mode to plan-doc tasks.
owner_hints:
  - Plans/Goal_Runtime_System.md
```

## Ledger Compile Addendum - pldg-20260630-001-feature-intake

This addendum compiles containerized-host Goal Runtime consumption obligations from bootstrap ledger `pldg-20260630-001-feature-intake`. It does not create WorkNodes, NodeSeeds, executable queues, implementation files, runtime dispatch, production build tasks, generated governance artifacts, or a governance seal.

### GRS-032 - Goal Runtime Host Capability Consumption Boundary

```yaml
plan_unit_id: GRS-032
unit_type: requirement
status: accepted
owner_doc: Plans/Goal_Runtime_System.md
canonical_text: >-
  Goal Runtime may request, consume, and certify work that depends on containerized-host capability, but it does not
  dispatch host work directly and cannot treat blocked host state as completion evidence. Goals, child goals, and
  verification or repair cycles pass host_capability_ref, host_profile_id, host_assignment_id, execution_unit_context_ref,
  TestRunReceipt refs, host_preflight_receipt, host_execution_receipt, cleanup_retention_receipt, blocked_reason_code, and
  Runtime Artifacts evidence refs through Executor, Automated Testing, Tools, and subagent boundaries. Goal completion
  certification requires lane-appropriate host/test/cleanup receipts, explicit blocker payloads, or approved verification
  exceptions; Runtime Artifacts remains projection and evidence browsing, not receipt truth.
gui_related: false
gui_classification_reason: Goal Runtime host-capability consumption and certification are backend/runtime behavior, not GUI presentation.
depends_on: [EP-109, RM-048, T-166, ATS-019, RAP-042, CV-303]
unblocks: [OSI-431, OP-028, RGV-015]
acceptance_criteria:
  - Goal and child-goal records can carry host_capability_ref, host_assignment_id, execution_unit_context_ref, and receipt refs without owning host mutation.
  - GoalCompletionReceipt certification fails or blocks when required host/test/cleanup evidence is missing.
  - Blocked host outcomes are preserved as blocked != failed and cannot be transformed into success.
  - Runtime Artifacts links are used as evidence projection, not as the authoritative receipt source.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - future GoalCompletionReceipt host-evidence fixture
risk_class: goal_runtime_host_certification_drift
reasoning_tier: high
context_scope: goal_runtime_containerized_host_consumption
implementation_surfaces:
  - Plans/Goal_Runtime_System.md
  - future GoalCompletionReceipt and child-goal runtime records
node_compile_hint:
  mode: goal_runtime_host_capability_consumption
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0040
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0044
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0053
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0069
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0078
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0079
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/source_shards/implementation_readiness_hardening_20260701.json#execution_lane_matrix
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/source_shards/subagent_hardening_synthesis_20260701.json#ref-002-testrunreceipt-host-fields
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/source_shards/subagent_hardening_synthesis_20260701.json#ref-003-blocker-taxonomy-projection-boundary
source_atom_ids: [atom-0040, atom-0044, atom-0053, atom-0069, atom-0078, atom-0079]
preserved_exact_tokens:
  - "agent harnesses"
  - "execution_unit_context"
  - "host_assignment_id"
  - "blocked != failed"
  - "GoalCompletionReceipt"
negative_constraints:
  - Do not let Goal Runtime dispatch host work directly.
  - Do not certify completion from a blocked host state.
  - Do not make Runtime Artifacts the receipt authority.
owner_hints:
  - Plans/Goal_Runtime_System.md
  - Plans/orchestrator-subagent-integration.md
  - Plans/Executor_Protocol.md
  - Plans/Automated_Testing_System.md
```

### GRS-002 - One Runtime Engine With Three Product Integrations

```yaml
plan_unit_id: GRS-002
unit_type: requirement
status: accepted
owner_doc: Plans/Goal_Runtime_System.md
canonical_text: >-
  Goal Runtime uses one Goal Runtime engine with three product integrations labeled A. invisible, B. Goal mode exposed to the user in chat assistant, and C. orchestration flow: invisible internal goals for product flows, visible user-directed Goal mode in Assistant Chat, and Orchestrator Goal runtime flows that project GoalRun and WorkGraph state while delegating WorkNode readiness, backoff, capacity, and dispatch to Executor. Invisible goals are hands-off for ordinary ambiguity and continue from start to finish unless a hard stop, approval boundary, or true blocker applies. Hard-stop classes include explicit user stop, a forbidden specific action, missing source ledger, missing project plans or inaccessible target artifacts, permissions/file-system failure, unsafe/destructive scope, contradictory goal text, and true infrastructure blocker. Visible goals and Orchestrator goals expose controls and status through their owner surfaces while sharing the same runtime state and lifecycle model.
gui_related: false
gui_classification_reason: This unit defines runtime presentation modes; chat-specific controls are owned by Assistant Chat consumer PlanUnits.
depends_on:
  - GRS-001
unblocks: []
acceptance_criteria:
  - Invisible internal goals, visible Assistant Chat Goal mode, and Orchestrator Goal runtime flows share one lifecycle/state model.
  - The three integrations preserve the labels A. invisible, B. Goal mode exposed to the user in chat assistant, and C. orchestration flow.
  - Invisible goals do not ask row-by-row or ordinary ambiguity questions.
  - Hard stops remain available for authority, safety, missing preconditions, and true blockers.
  - Hard-stop classification preserves explicit user stop, missing source ledger, missing project plans, permissions/file-system failure, unsafe/destructive, and contradictory cases.
  - Orchestrator Goal runtime projections do not replace Executor readiness, backoff, capacity, or dispatch authority.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - future Goal Runtime lifecycle tests
risk_class: runtime_split_brain
reasoning_tier: high
context_scope: goal_runtime_system
implementation_surfaces:
  - future Goal Mode service
  - future Planning Wizard
  - Plans/assistant-chat-design.md
  - Plans/Orchestrator_Page.md
  - Plans/Executor_Protocol.md
node_compile_hint:
  mode: shared_goal_runtime
  create_worknodes: false
source_lineage:
  - pldg-20260618-001-prd-planning-wizard:atom-0001
  - pldg-20260618-001-prd-planning-wizard:atom-0002
  - pldg-20260618-001-prd-planning-wizard:atom-0004
  - pldg-20260618-001-prd-planning-wizard:atom-0158
  - pldg-20260618-001-prd-planning-wizard:atom-0159
  - pldg-20260618-001-prd-planning-wizard:atom-0160
  - pldg-20260618-001-prd-planning-wizard:atom-0161
  - pldg-20260616-001-goal-runtime-system:atom-0006
  - pldg-20260616-001-goal-runtime-system:atom-0007
  - pldg-20260616-001-goal-runtime-system:atom-0008
  - pldg-20260616-001-goal-runtime-system:dec-0003
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0003
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0008
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0009
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0013
  - pldg-20260616-002-orchestrator-goal-runtime-flow:dec-0007
preserved_exact_tokens:
  - "same engine"
  - "A. invisible"
  - "B. Goal mode exposed to the user in chat assistant"
  - "C. orchestration flow"
  - "invisible internal goals"
  - "visible assistant-chat goals"
  - "Goal mode exposed to the user in chat assistant"
  - "orchestration flow"
  - "one Goal Runtime engine"
  - "GoalRun"
  - "WorkGraph"
  - "COMPLETELY hands off"
  - "from start to finish"
  - "hard-stop exceptions"
  - "explicit user stop"
  - "missing source ledger"
  - "missing project plans"
  - "permissions/file-system failure"
  - "unsafe/destructive"
  - "contradictory"
negative_constraints:
  - Do not create a separate invisible-goal lifecycle that diverges from visible Goal Mode.
  - Do not ask row-by-row or ordinary ambiguity questions during invisible internal goals.
  - Do not let Orchestrator projections become Executor scheduler truth.
owner_hints:
  - Plans/Goal_Runtime_System.md
  - Plans/assistant-chat-design.md
  - Plans/chain-wizard-flexibility.md
  - Plans/Orchestrator_Page.md
```

### GRS-003 - Invisible Planning Wizard Goal Boundary

```yaml
plan_unit_id: GRS-003
unit_type: constraint
status: accepted
owner_doc: Plans/Goal_Runtime_System.md
canonical_text: >-
  Future Planning Wizard and PRD Builder flows use the v2 ledger system conversationally first, preserving exact user intent before any invisible Goal conversion runs. After readiness, invisible Goal Mode may convert the accepted ledger to requirements docs, Plans, or graph-preparation artifacts while the Planning Wizard UI stays minimal with statuses such as Updating plan docs, Building project plan graph, and Reconciling feature requirements. Conversational PRD Builder work is not a default Orchestrator WorkNode; any later Orchestrator handoff is explicit and carries ledger lineage, readiness evidence, and Goal Runtime receipts. Legacy Chain Wizard and Requirements Doc Builder references remain compatibility/source-lineage aliases only.
gui_related: true
gui_classification_reason: This unit includes user-visible Planning Wizard UI minimalism during invisible goals.
depends_on:
  - GRS-002
unblocks: []
acceptance_criteria:
  - Ledger-to-Plans transfer can invoke invisible Goal Runtime without exposing row-by-row decisions.
  - Planning Wizard maintains structured ledger source state before invoking invisible Goal Mode to convert the ledger to the plan docs.
  - PRD Builder uses the ledger system conversationally before invisible Goal conversion.
  - Invisible PRD Builder conversion goals are not default Orchestrator WorkNodes.
  - Minimal Planning Wizard status examples include Updating plan docs, Building project plan graph, and Reconciling feature requirements.
  - Planning Wizard does not re-own Goal Runtime execution semantics.
  - Any Orchestrator handoff from PRD Builder is explicit and preserves ledger lineage, readiness evidence, and receipts.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - future Planning Wizard integration review
risk_class: planning_wizard_runtime_drift
reasoning_tier: standard
context_scope: planning_wizard_integration
implementation_surfaces:
  - future Planning Wizard
  - Plans/chain-wizard-flexibility.md
  - Plans/Planning_Ledger_System.md
node_compile_hint:
  mode: invisible_goal_consumer_boundary
  create_worknodes: false
source_lineage:
  - pldg-20260616-001-goal-runtime-system:atom-0013
  - pldg-20260616-001-goal-runtime-system:atom-0014
  - pldg-20260616-001-goal-runtime-system:atom-0015
  - pldg-20260616-001-goal-runtime-system:dec-0011
  - pldg-20260616-001-goal-runtime-system:q-0001
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0004
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0007
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0103
preserved_exact_tokens:
  - "Chain Wizard ledger-to-Plans"
  - "structured ledger"
  - "convert the ledger to the plan docs"
  - "invisible Goal Mode"
  - "Updating plan docs"
  - "Building project plan graph"
  - "Reconciling feature requirements"
  - "Requirements Doc Builder"
  - "ledger system"
  - "conversational"
  - "not a default Orchestrator WorkNode"
  - "exact redesigned Chain Wizard flow"
  - "current Chain Wizard docs are incomplete"
  - "current plans for the chain wizard are wrong/incomplete"
  - "completely redo all that after goal mode is finalized"
negative_constraints:
  - Do not treat current Chain Wizard docs as final Goal Runtime design.
  - Do not turn invisible Planning Wizard execution into a row-by-row user questioning flow.
  - Do not treat conversational ledger capture as a Goal run by default.
  - Do not treat invisible PRD Builder conversion goals as Orchestrator WorkNodes by default.
  - Do not define concrete Planning Wizard UI flow, layout, copy, or screen behavior in Goal Runtime canon; route those details to Planning Wizard and Assistant Chat owner docs.
compatibility_only_notes:
  - Chain Wizard and Requirements Doc Builder are retained in preserved_exact_tokens and source_lineage as historical aliases for Planning Wizard and PRD Builder.
stale_retired_dispositions:
  - Chain Wizard is retired as current product/workflow terminology; current prose uses Planning Wizard.
  - Requirements Doc Builder is retired as current product terminology; current prose uses PRD Builder.
owner_hints:
  - Plans/Goal_Runtime_System.md
  - Plans/Planning_Wizard.md
  - Plans/PRD_Builder.md
  - Plans/chain-wizard-flexibility.md
  - Plans/assistant-chat-design.md
```

### GRS-004 - Whole-Goal Coherence With Sharded Inputs

```yaml
plan_unit_id: GRS-004
unit_type: requirement
status: accepted
owner_doc: Plans/Goal_Runtime_System.md
canonical_text: >-
  Goal Runtime must preserve whole-task coherence while operating over sharded ledgers, sharded Plans, document maps, manifests, compact state, and source/target universes. Shard-group focus carries the whole goal summary, current focus, full objective, full source set/source universe, full target set/target universe, inspected scopes, uninspected scopes, hash/version metadata, and owner/consumer coverage; workers may request more context through runtime retrieval for source shards, target docs, code files, logs, images, or tests. Sharding is access, recovery, and verification infrastructure; it is not D2-style workflow slicing and must not become the core execution model.
gui_related: false
gui_classification_reason: Sharded source/context handling is runtime and document infrastructure, not GUI behavior.
depends_on:
  - GRS-001
unblocks: []
acceptance_criteria:
  - Goal Runtime records the source and target universe for each goal.
  - Compact state can resume work without losing whole-goal context.
  - Document maps/manifests expose enough identity to recover exact source shards when needed.
  - Worker context includes the whole goal summary and current focus rather than only a tiny slice.
  - Runtime context requests can fetch additional source shards, target docs, code files, logs, images, and tests.
  - Completion coverage tracks inspected scopes, uninspected scopes, hash/version metadata, and owner/consumer relationships.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - future context/resume tests
risk_class: context_fragmentation
reasoning_tier: high
context_scope: repo_and_goal_context
implementation_surfaces:
  - future Goal Mode service
  - Plans/ledgers/v2
  - Plans/.plan_index
node_compile_hint:
  mode: context_and_shard_contract
  create_worknodes: false
source_lineage:
  - pldg-20260616-001-goal-runtime-system:atom-0009
  - pldg-20260616-001-goal-runtime-system:atom-0010
  - pldg-20260616-001-goal-runtime-system:atom-0011
  - pldg-20260616-001-goal-runtime-system:atom-0012
  - pldg-20260616-001-goal-runtime-system:atom-0066
  - pldg-20260616-001-goal-runtime-system:atom-0067
  - pldg-20260616-001-goal-runtime-system:atom-0068
  - pldg-20260616-001-goal-runtime-system:dec-0007
  - pldg-20260616-001-goal-runtime-system:corr-0003
preserved_exact_tokens:
  - "whole-task coherence"
  - "sharded ledgers"
  - "sharded Plans"
  - "document maps"
  - "manifests"
  - "compact-state-first resume"
  - "whole goal summary"
  - "current focus"
  - "request more context"
  - "source shards"
  - "target docs"
  - "code files"
  - "logs"
  - "images"
  - "tests"
  - "source and target universe"
  - "source universe"
  - "target universe"
  - "inspected scopes"
  - "uninspected scopes"
  - "hash"
  - "owner"
  - "consumer"
  - "source_ledger_manifest"
  - "source_ledger_shards"
  - "target_plan_manifest"
  - "target_plan_shards"
  - "project_doc_index"
  - "goal_work_journal"
  - "goal_change_plan"
  - "goal_apply_report"
  - "goal_completion_report"
  - "Sharding is not D2-style workflow slicing"
negative_constraints:
  - Do not let sharding fragment the agent's understanding of the whole goal.
  - Do not recreate D2-style staged workflow slicing through shard boundaries.
  - Do not tell the worker to only process a tiny slice and forget the rest.
owner_hints:
  - Plans/Goal_Runtime_System.md
  - Plans/Planning_Ledger_System.md
  - Plans/Plan_Document_System.md
```

### GRS-005 - Durable Goal State And Event Log

```yaml
plan_unit_id: GRS-005
unit_type: requirement
status: accepted
owner_doc: Plans/Goal_Runtime_System.md
canonical_text: >-
  Goal Runtime owns durable execution state for each goal, including objective, lifecycle status, task list, allowed scope, constraints, budgets, attachment manifest, child goals, evidence references, completion receipt, revision, and append-only goal event log. Goal state survives compaction, restarts, and model switches, and optimistic concurrency prevents stale overwrite.
gui_related: false
gui_classification_reason: Durable goal state and event logs are runtime/persistence contracts, not GUI implementation.
depends_on:
  - GRS-002
unblocks: []
acceptance_criteria:
  - A resumed goal can reconstruct objective, constraints, tasks, status, child goals, evidence, and receipt state.
  - Concurrent or stale goal updates are rejected or reconciled through revision checks.
  - Storage substrate remains selectable later without weakening required state fields.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - future goal-state persistence tests
risk_class: durable_state_loss
reasoning_tier: high
context_scope: goal_runtime_state
implementation_surfaces:
  - future Goal Mode service
  - future storage layer
node_compile_hint:
  mode: durable_goal_state_contract
  create_worknodes: false
source_lineage:
  - pldg-20260616-001-goal-runtime-system:atom-0031
  - pldg-20260616-001-goal-runtime-system:atom-0032
  - pldg-20260616-001-goal-runtime-system:atom-0033
  - pldg-20260616-001-goal-runtime-system:atom-0034
  - pldg-20260616-001-goal-runtime-system:q-0004
preserved_exact_tokens:
  - "durable execution data"
  - "append-only goal event log"
  - "goal_events.jsonl"
  - "goal_revision"
  - "expected_goal_revision"
  - "compare-and-swap"
  - "acceptance_criteria"
  - "non_goals"
  - "work_queue"
  - "model_policy"
  - "evidence_index"
  - "persisted runtime state"
  - "Optimistic concurrency"
  - "compaction, restarts, model switches"
  - "database tables, project files, or a hybrid"
negative_constraints:
  - Do not let exact persistence substrate deferral remove the durable state contract.
  - Do not allow stale goal state to silently overwrite newer state.
owner_hints:
  - Plans/Goal_Runtime_System.md
```

### GRS-006 - Scheduler Continuation And Revisioned Goal Updates

```yaml
plan_unit_id: GRS-006
unit_type: requirement
status: accepted
owner_doc: Plans/Goal_Runtime_System.md
canonical_text: >-
  Goal Runtime, not the worker model alone, drives runtime-driven idle continuation until completion, blocked, stopped, failed, cancelled, or budget-limited. When the thread is idle and eligible, `try_start_turn_if_idle` reloads canonical goal state, checks currentness, budgets, and user preemption, and starts the next bounded turn; this is not model self-recursion. User preemption, constraints, scope changes, and goal updates are revisioned with goal_revision, previous_revision, objective_update, constraint_added, active_subgoals_notified, and stale child goals so the scheduler can pause, re-evaluate impact, cancel or re-scope child goals, and resume from a coherent state.
gui_related: false
gui_classification_reason: Scheduler continuation and revisioning are runtime behavior; visible controls are Assistant Chat consumer behavior.
depends_on:
  - GRS-005
unblocks: []
acceptance_criteria:
  - A running goal can be paused by user instruction before new scheduling work begins.
  - Runtime state records revisions for material goal updates.
  - Scheduler continuation stops only at explicit lifecycle/budget/authority states.
  - "`try_start_turn_if_idle` starts continuation only after canonical-state reload, currentness checks, budget checks, and user preemption checks."
  - Material goal updates preserve goal_revision, previous_revision, objective_update, constraint_added, active_subgoals_notified, and stale child goals.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - future scheduler state-machine tests
risk_class: scheduler_drift
reasoning_tier: high
context_scope: goal_runtime_scheduler
implementation_surfaces:
  - future Goal Mode scheduler
  - Plans/assistant-chat-design.md
node_compile_hint:
  mode: scheduler_revision_contract
  create_worknodes: false
source_lineage:
  - pldg-20260616-001-goal-runtime-system:atom-0035
  - pldg-20260616-001-goal-runtime-system:atom-0036
  - pldg-20260616-001-goal-runtime-system:atom-0037
preserved_exact_tokens:
  - "Runtime-driven continuation"
  - "runtime-driven idle continuation"
  - "thread is idle"
  - "scheduler"
  - "not model self-recursion"
  - "try_start_turn_if_idle"
  - "User preemption"
  - "constraint updates"
  - "user message pending"
  - "re-steer"
  - "Goal updates are revisioned"
  - "goal_revision"
  - "previous_revision"
  - "objective_update"
  - "constraint_added"
  - "active_subgoals_notified"
  - "stale child goals"
negative_constraints:
  - Do not rely on the worker model's final answer as the scheduler completion source.
  - Do not apply material goal updates as silent mutable prompt text.
  - Do not rely on a model saying "continue" as the only loop mechanism.
owner_hints:
  - Plans/Goal_Runtime_System.md
  - Plans/assistant-chat-design.md
```

### GRS-007 - Goal Replan Event For Material Changes

```yaml
plan_unit_id: GRS-007
unit_type: requirement
status: accepted
owner_doc: Plans/Goal_Runtime_System.md
canonical_text: >-
  Material mid-goal user changes create an explicit Goal Replan Event. The runtime pauses scheduling, classifies the interruption as pause/resume, stop/cancel, constraint update, scope expansion, scope reduction, goal replacement, or clarifying instruction, computes impact, updates the visible task list, re-steers or cancels child goals, and then resumes when valid. Trivial clarifications may apply inline; hard constraints apply immediately; forks are reserved for alternate paths or material conflicts.
gui_related: true
gui_classification_reason: The runtime event includes user-visible task-list updates and chat-facing replan feedback.
depends_on:
  - GRS-006
unblocks: []
acceptance_criteria:
  - Material scope and constraint changes produce a durable Goal Replan Event.
  - Hard constraints are applied immediately rather than waiting for a phase boundary.
  - Active and child work is cancelled, re-scoped, forked, or allowed to finish only after impact analysis.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - future goal-update/replan tests
risk_class: silent_goal_mutation
reasoning_tier: high
context_scope: goal_runtime_updates
implementation_surfaces:
  - future Goal Mode scheduler
  - Plans/assistant-chat-design.md
node_compile_hint:
  mode: goal_replan_event
  create_worknodes: false
source_lineage:
  - pldg-20260616-001-goal-runtime-system:atom-0094
  - pldg-20260616-001-goal-runtime-system:atom-0095
  - pldg-20260616-001-goal-runtime-system:dec-0014
preserved_exact_tokens:
  - "pause / resume"
  - "stop / cancel"
  - "constraint update"
  - "scope expansion"
  - "scope reduction"
  - "goal replacement"
  - "clarifying instruction"
  - "Goal Replan Event"
  - "pauses scheduling"
  - "updates the visible task list"
  - "hard constraints apply immediately"
negative_constraints:
  - Do not silently mutate a running goal for material scope or constraint changes.
  - Do not queue hard constraints until the current phase finishes.
owner_hints:
  - Plans/Goal_Runtime_System.md
  - Plans/assistant-chat-design.md
```

### GRS-008 - Objective Attachments And Phase-Bound Snapshots

```yaml
plan_unit_id: GRS-008
unit_type: requirement
status: accepted
owner_doc: Plans/Goal_Runtime_System.md
canonical_text: >-
  Goal Runtime preserves oversized objectives, large pasted blocks, image attachments, and remote-session attachments as runtime-readable objective attachment bundles. Objective attachment bundles include goal-objective.md, pasted-text-N.txt, and attachments/manifest.json; local images and remote image URLs must resolve to runtime-readable paths or artifact IDs for local and remote app-server sessions. Objective bundles and referenced attachments freeze at goal creation; read/evaluation inputs freeze at certification or phase boundaries; active editing uses live state while recording start state, checkpoints, diffs, hashes, VCS identity, and test-state identity for replayable evidence.
gui_related: false
gui_classification_reason: Attachment preservation and snapshot identity are runtime/evidence behavior, not visual presentation.
depends_on:
  - GRS-005
unblocks: []
acceptance_criteria:
  - Attachments are materialized to paths or artifact IDs that workers and verifiers can read.
  - Attachment bundles preserve goal-objective.md, pasted-text-N.txt, attachments/manifest.json, runtime-readable paths, local images, and remote image URLs where applicable.
  - Evidence records identify the source state used for each judgment.
  - Coding goals do not pretend the entire repo is static, but certification does not rely on unspecified latest state.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - future attachment preservation tests
risk_class: evidence_reproducibility
reasoning_tier: high
context_scope: goal_inputs_and_evidence
implementation_surfaces:
  - future Goal Mode service
  - future runtime artifact storage
  - Plans/Planning_Ledger_System.md
  - Plans/Plan_Document_System.md
node_compile_hint:
  mode: attachment_snapshot_contract
  create_worknodes: false
source_lineage:
  - pldg-20260616-001-goal-runtime-system:atom-0038
  - pldg-20260616-001-goal-runtime-system:atom-0039
  - pldg-20260616-001-goal-runtime-system:atom-0040
  - pldg-20260616-001-goal-runtime-system:atom-0099
  - pldg-20260616-001-goal-runtime-system:atom-0100
  - pldg-20260616-001-goal-runtime-system:dec-0010
  - pldg-20260616-001-goal-runtime-system:dec-0016
  - pldg-20260616-001-goal-runtime-system:corr-0005
preserved_exact_tokens:
  - "oversized text"
  - "large pasted blocks"
  - "image attachments"
  - "remote app-server sessions"
  - "objective attachment bundle"
  - "snapshotted at goal phase boundaries"
  - "Freeze the objective bundle"
  - "Freeze referenced attachments"
  - "Freeze read/evaluation inputs"
  - "VCS commit/diff identity"
  - "goal-objective.md"
  - "pasted-text-N.txt"
  - "attachments/manifest.json"
  - "runtime-readable paths"
  - "local images"
  - "remote image URLs"
negative_constraints:
  - Do not lose attachments when a goal runs in a remote session.
  - Do not truncate or lose large pasted goal content or image inputs.
  - Do not preserve only placeholder tokens for images, large pasted text, or oversized objectives.
  - Do not base certification on an unspecified latest file state.
  - Do not let stale snapshots cause the agent to ignore legitimate current changes.
owner_hints:
  - Plans/Goal_Runtime_System.md
  - Plans/Planning_Ledger_System.md
  - Plans/Plan_Document_System.md
```

### GRS-009 - Worker Role Separation And Bounded Authority

```yaml
plan_unit_id: GRS-009
unit_type: requirement
status: accepted
owner_doc: Plans/Goal_Runtime_System.md
canonical_text: >-
  Goal Runtime separates worker, planner, evaluator, reducer, verifier, adjudicator, and runtime controller roles. Workers have bounded authority, and weak-worker outputs are proposal only until stronger or deterministic layers verify, merge, route, or complete them. A low quality agent over massive documents may miss a lot, hallucinate issues, or claim no issues, and must never make global completion judgment. Material worker claims carry source_spans, target_spans, and evidence_refs; no-material claims use no_material_items_found with source_span_checked and reason duplicate, nonmaterial, already_covered, or context_only. Unsupported content cannot become canonical plan content or completion evidence. Workers cannot certify global or parent completion by themselves. Risk-triggered verification escalates when worker capability, confidence, scope, evidence, or validation status is insufficient.
gui_related: false
gui_classification_reason: Runtime role separation and safety policy are backend/control-plane behavior.
depends_on:
  - GRS-006
unblocks: []
acceptance_criteria:
  - Worker roles cannot unilaterally mark a goal complete.
  - Runtime policy can route stronger evaluation or adjudication when evidence or risk demands it.
  - No-op or low-change completion claims require coverage evidence.
  - Material and no-material worker claims preserve source_spans, target_spans, evidence_refs, no_material_items_found, source_span_checked, and duplicate/nonmaterial/already_covered/context_only reasons.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - future verifier/escalation policy tests
risk_class: weak_worker_false_completion
reasoning_tier: high
context_scope: goal_runtime_safety
implementation_surfaces:
  - future Goal Mode service
  - future model/provider policy layer
node_compile_hint:
  mode: role_separation_policy
  create_worknodes: false
source_lineage:
  - pldg-20260616-001-goal-runtime-system:atom-0041
  - pldg-20260616-001-goal-runtime-system:atom-0042
  - pldg-20260616-001-goal-runtime-system:atom-0043
  - pldg-20260616-001-goal-runtime-system:atom-0044
  - pldg-20260616-001-goal-runtime-system:atom-0045
  - pldg-20260616-001-goal-runtime-system:atom-0046
  - pldg-20260616-001-goal-runtime-system:dec-0006
preserved_exact_tokens:
  - "Low-quality agents cannot certify global completion"
  - "low quality agent"
  - "massive documents"
  - "misses a lot"
  - "hallucinates issues"
  - "no issues"
  - "must never make global completion judgment"
  - "Model role separation"
  - "Workers have bounded authority"
  - "Evidence-backed claims"
  - "Coverage evidence for no-op results"
  - "Risk-triggered verification escalation"
  - "reducer"
  - "runtime controller"
  - "proposal only"
  - "source_spans"
  - "target_spans"
  - "evidence_refs"
  - "no_material_items_found"
  - "source_span_checked"
  - "duplicate"
  - "nonmaterial"
  - "already_covered"
  - "context_only"
  - "unsupported content"
  - "canonical plan content"
negative_constraints:
  - Do not let weak agents certify global completion.
  - Do not rely on worker confidence alone when escalation triggers are present.
  - Do not accept unsupported invented requirements.
owner_hints:
  - Plans/Goal_Runtime_System.md
```

### GRS-010 - Model Role Policy And Certification-Tier Verifier Requirements

```yaml
plan_unit_id: GRS-010
unit_type: requirement
status: accepted
owner_doc: Plans/Goal_Runtime_System.md
canonical_text: >-
  Goal Runtime persists separate model-role policy for worker execution and verifier/adjudicator authority. The role-policy record names worker_default, planner, evaluator, adjudicator, and verifier roles, and escalation inputs include risk_class, failure_count, task type, and provider constraints. Goal Mode must provide native goal support for users will be using other models; lower quality agent paths require stronger evidence gates/escalation and must not assume the newest/biggest/highest quality model. The verifier/adjudicator model may inherit the worker model only when the inherited model satisfies the required policy for the goal's certification tier. Low-risk goals can inherit by default; standard and strong-certification goals use policy-derived verifier/adjudicator requirements; strong-certification goals block, not merely warn, when the requirement cannot be met. Exact provider-specific default tier mappings remain deferred.
gui_related: false
gui_classification_reason: This unit defines runtime/provider model-role policy, not the Settings GUI control.
depends_on:
  - GRS-009
unblocks: []
acceptance_criteria:
  - Runtime configuration supports independent worker and verifier/adjudicator role settings.
  - Role-policy records preserve worker_default, planner, evaluator, adjudicator, verifier, risk_class, failure_count, and provider constraints.
  - Strong-certification goals cannot proceed with an underqualified verifier/adjudicator model.
  - Provider-specific default mappings can be added later without changing the role-policy contract.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - future model-role policy tests
risk_class: model_role_policy_drift
reasoning_tier: high
context_scope: goal_runtime_model_policy
implementation_surfaces:
  - future Goal Mode service
  - future Settings model policy storage
  - Plans/FinalGUISpec.md
  - Plans/Models_System.md
  - Plans/Multi-Account.md
node_compile_hint:
  mode: verifier_adjudicator_policy
  create_worknodes: false
source_lineage:
  - pldg-20260616-001-goal-runtime-system:atom-0075
  - pldg-20260616-001-goal-runtime-system:atom-0076
  - pldg-20260616-001-goal-runtime-system:atom-0104
  - pldg-20260616-001-goal-runtime-system:atom-0105
  - pldg-20260616-001-goal-runtime-system:dec-0018
  - pldg-20260616-001-goal-runtime-system:dec-0019
  - pldg-20260616-001-goal-runtime-system:q-0005
preserved_exact_tokens:
  - "Runtime-neutral model support"
  - "worker model"
  - "verifier/adjudicator model"
  - "inherit the worker only when"
  - "goal's certification tier"
  - "Low-risk goals can inherit by default"
  - "must block, not merely warn"
  - "worker_default"
  - "planner"
  - "evaluator"
  - "adjudicator"
  - "verifier"
  - "risk_class"
  - "failure_count"
  - "provider constraints"
  - "users will be using other models"
  - "native goal support"
  - "lower quality agent"
  - "newest/biggest/highest quality model"
negative_constraints:
  - Do not hard-code one provider/model as required for correctness.
  - Do not hard-code Goal Mode correctness to a single model/provider.
  - Do not force verifier/adjudicator work to use the same model setting as ordinary worker execution.
  - Do not treat inheritance as always valid for verifier/adjudicator roles.
owner_hints:
  - Plans/Goal_Runtime_System.md
  - Plans/Models_System.md
  - Plans/Multi-Account.md
```

### GRS-011 - Provider-Neutral Escalation Triggers

```yaml
plan_unit_id: GRS-011
unit_type: requirement
status: accepted
owner_doc: Plans/Goal_Runtime_System.md
canonical_text: >-
  Goal Runtime escalates to a stronger verifier, second-pass worker, adjudicator, or stronger policy handling when evidence is incomplete, stale, or non-replayable; child outputs conflict; retries or blockers repeat; strong-certification surfaces are touched; destructive or governance actions are proposed; worker confidence is low; high-density slice or high-signal input produces an empty/weak result; target conflict, large deletion/replacement, or failing tests appear; writes are out of scope; validators fail; or completion claims are unsupported.
gui_related: false
gui_classification_reason: Escalation policy is runtime safety behavior, not GUI implementation.
depends_on:
  - GRS-009
  - GRS-010
unblocks: []
acceptance_criteria:
  - Escalation triggers are evaluated independently of provider-specific model names.
  - Unsupported completion claims cannot pass certification merely because the worker says the goal is done.
  - Validator failures and out-of-scope writes escalate even when worker confidence is high.
  - High-density slices, target conflicts, large deletions/replacements, failing tests, and low-confidence worker output escalate to stronger review.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - future escalation policy tests
risk_class: unsupported_completion_claim
reasoning_tier: high
context_scope: goal_runtime_safety
implementation_surfaces:
  - future Goal Mode service
  - future verifier/adjudicator policy layer
node_compile_hint:
  mode: escalation_trigger_policy
  create_worknodes: false
source_lineage:
  - pldg-20260616-001-goal-runtime-system:atom-0046
  - pldg-20260616-001-goal-runtime-system:atom-0106
  - pldg-20260616-001-goal-runtime-system:dec-0020
preserved_exact_tokens:
  - "incomplete/stale/non-replayable evidence"
  - "conflicting child outputs"
  - "repeated retries/blockers"
  - "strong-certification surfaces"
  - "destructive/governance actions"
  - "low worker confidence"
  - "stronger verifier"
  - "second-pass worker"
  - "adjudicator"
  - "high-density slice"
  - "target conflict"
  - "large deletion"
  - "failing tests"
  - "out-of-scope writes"
  - "validator failures"
  - "unsupported completion claims"
negative_constraints:
  - Do not certify completion from unsupported claims.
  - Do not ignore failed validators or out-of-scope writes.
owner_hints:
  - Plans/Goal_Runtime_System.md
```

### GRS-012 - Goal Completion Receipt Authority

```yaml
plan_unit_id: GRS-012
unit_type: requirement
status: accepted
owner_doc: Plans/Goal_Runtime_System.md
canonical_text: >-
  Every goal produces a Goal Completion Receipt. Completion is a runtime-certified state, not a worker-model judgment. A worker can propose completion, but the controller/evaluator/certifier decides whether the goal is complete. Required inputs must be inventoried, required work represented or dispositioned, validations run or explicitly skipped with reason, acceptance criteria satisfied, unresolved items explicit, and no required source or target areas left unaccounted for. Ledger-to-Plans completion additionally requires material ledger content represented in live Plans or intentionally captured as open questions or unresolved decisions, conflicts preserved, unsupported inventions absent, and source-to-target evidence present. Receipts separate source evidence, canonical evidence, process evidence, governance evidence, unresolved items, changed artifacts, and validator outcomes.
gui_related: false
gui_classification_reason: Completion receipt authority and evidence classes are runtime/governance behavior.
depends_on:
  - GRS-009
  - GRS-011
unblocks: []
acceptance_criteria:
  - Every goal has a receipt or a stopped/blocked/degraded receipt explaining why completion is not certified normally.
  - Receipts distinguish worker claims from controller/evaluator/certifier decisions.
  - Evidence classes are recorded without treating ledger/source memory as canonical product truth.
  - Goal completion certification verifies that required inputs were inventoried, represented or dispositioned, validations ran, acceptance criteria are satisfied, unresolved items are explicit, and no required source/target areas are unaccounted for.
  - Ledger-to-Plans receipts prove material ledger content in live Plans or explicit open-question/unresolved-decision disposition, conflicts preserved, unsupported inventions absent, and source-to-target evidence.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - future completion receipt validators
risk_class: false_completion
reasoning_tier: high
context_scope: goal_completion
implementation_surfaces:
  - future Goal Mode service
  - future runtime evidence storage
node_compile_hint:
  mode: completion_receipt_authority
  create_worknodes: false
source_lineage:
  - pldg-20260616-001-goal-runtime-system:atom-0047
  - pldg-20260616-001-goal-runtime-system:atom-0048
  - pldg-20260616-001-goal-runtime-system:atom-0049
  - pldg-20260616-001-goal-runtime-system:atom-0093
  - pldg-20260616-001-goal-runtime-system:dec-0013
preserved_exact_tokens:
  - "Evidence-based completion certification"
  - "Goal Completion Receipt"
  - "source/canonical/process evidence separation"
  - "worker can propose completion"
  - "controller/evaluator/certifier decides"
  - "runtime-certified state"
  - "not a worker-model judgment"
  - "completion certification"
  - "inventoried"
  - "represented"
  - "dispositioned"
  - "acceptance criteria"
  - "unaccounted for"
  - "material ledger content"
  - "represented in Plans"
  - "open questions"
  - "unresolved decisions"
  - "conflicts preserved"
  - "unsupported inventions absent"
  - "source-to-target evidence"
negative_constraints:
  - Do not let done be only a worker-model judgment.
  - Do not allow a worker or child goal to certify global or parent completion by itself.
  - Do not count source ledger text, scaffold, or process artifacts as canonical live Plans evidence.
owner_hints:
  - Plans/Goal_Runtime_System.md
  - Plans/Planning_Ledger_System.md
  - Plans/Plan_Document_System.md
```

### GRS-013 - Risk-Tiered Completion Certification

```yaml
plan_unit_id: GRS-013
unit_type: validation_criterion
status: accepted
owner_doc: Plans/Goal_Runtime_System.md
canonical_text: >-
  Completion certification is tiered by risk and phase. Lightweight read-only or answer-only goals require final answer, addressed objective, known uncertainty, no file mutation, and no hidden blocker. Standard code/doc work requires changed files, task checklist disposition, relevant tests/checks run or skipped with reason, no known unresolved blockers, and respected user constraints. Strong-certification goals require replayable evidence, source-to-target mapping where applicable, independent verifier or verifier role, deterministic validators where available, changed artifact hashes, explicit unresolved/open items, and written completion certificate.
gui_related: false
gui_classification_reason: Certification tiers are runtime/validation policy, not GUI implementation.
depends_on:
  - GRS-012
unblocks: []
acceptance_criteria:
  - File-writing, Plan-writing, code-editing, test-running, migration, destructive, and governance-sensitive goals use stronger certification than read-only goals.
  - Strong-certification receipts include replayable evidence and independent/deterministic verification where available.
  - Standard receipts account for checks, changed files, constraints, and blockers.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - future receipt-tier validators
risk_class: certification_underfit
reasoning_tier: high
context_scope: goal_completion
implementation_surfaces:
  - future Goal Mode service
  - future verifier/adjudicator policy layer
node_compile_hint:
  mode: tiered_completion_certification
  create_worknodes: false
source_lineage:
  - pldg-20260616-001-goal-runtime-system:atom-0089
  - pldg-20260616-001-goal-runtime-system:atom-0090
  - pldg-20260616-001-goal-runtime-system:atom-0091
  - pldg-20260616-001-goal-runtime-system:atom-0092
  - pldg-20260616-001-goal-runtime-system:dec-0013
preserved_exact_tokens:
  - "Every goal requires a Goal Completion Receipt"
  - "Lightweight certification"
  - "Standard certification"
  - "Strong certification"
  - "changed files listed"
  - "task checklist completed"
  - "skipped with reason"
  - "replayable evidence"
  - "source-to-target mapping"
  - "deterministic validators"
  - "changed artifact hashes"
  - "completion certificate written"
negative_constraints:
  - Do not certify normal code/doc work without accounting for checks and constraints.
  - Do not mark governance-sensitive or mutation-heavy goals complete without stronger certification.
owner_hints:
  - Plans/Goal_Runtime_System.md
```

### GRS-014 - Verifier Unavailable And Evidence Retention Policy

```yaml
plan_unit_id: GRS-014
unit_type: requirement
status: accepted
owner_doc: Plans/Goal_Runtime_System.md
canonical_text: >-
  Verifier/adjudicator unavailable behavior is tiered: low-risk goals may finish with a degraded receipt; standard goals may degrade only when no mutation or required check is affected; strong-certification goals become blocked, not complete. Receipts retain hashes, summaries, changed files, command identities, validator outputs, child receipts, verifier/adjudicator decisions, and source-to-target mappings where relevant. Raw logs are capped, redacted, separately stored, and referenced by hash/path.
gui_related: false
gui_classification_reason: Degraded verification and evidence retention are runtime/evidence policy, not GUI implementation.
depends_on:
  - GRS-013
unblocks: []
acceptance_criteria:
  - Strong-certification goals do not complete when verifier/adjudicator requirements cannot be met.
  - Standard degraded receipts are allowed only when mutation and required checks are unaffected.
  - Raw logs are never stored uncapped or unredacted inside the receipt.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - future evidence retention/redaction validators
risk_class: evidence_retention_drift
reasoning_tier: high
context_scope: goal_completion_evidence
implementation_surfaces:
  - future Goal Mode service
  - future runtime artifact storage
  - Plans/Runtime_Artifacts_Panel.md
node_compile_hint:
  mode: verifier_degraded_mode_and_retention
  create_worknodes: false
source_lineage:
  - pldg-20260616-001-goal-runtime-system:atom-0107
  - pldg-20260616-001-goal-runtime-system:atom-0109
  - pldg-20260616-001-goal-runtime-system:dec-0021
  - pldg-20260616-001-goal-runtime-system:dec-0023
preserved_exact_tokens:
  - "low-risk goals may finish with a degraded receipt"
  - "standard goals may degrade only when no mutation or required check is affected"
  - "strong-certification goals become blocked, not complete"
  - "hashes"
  - "summaries"
  - "changed files"
  - "command identities"
  - "validator outputs"
  - "child receipts"
  - "verifier/adjudicator decisions"
  - "source-to-target mappings"
  - "Raw logs"
  - "capped"
  - "redacted"
  - "separately stored"
  - "referenced by hash/path"
negative_constraints:
  - Do not complete strong-certification goals in degraded verifier mode.
  - Do not retain secrets in logs or receipts.
  - Do not store uncapped raw logs inline in completion receipts.
owner_hints:
  - Plans/Goal_Runtime_System.md
  - Plans/Runtime_Artifacts_Panel.md
  - Plans/storage-plan.md
compatibility_only_notes:
  - Plans/Project_Output_Artifacts.md remains a boundary/distinction reference only; it does not own Goal Runtime evidence receipts.
```

### GRS-015 - Progress Fingerprints, Budgets, And Validators

```yaml
plan_unit_id: GRS-015
unit_type: requirement
status: accepted
owner_doc: Plans/Goal_Runtime_System.md
canonical_text: >-
  Goal Runtime uses progress_fingerprint records, blocker_signature, artifact hashes, retry/blocker detection, repeat_count, no-progress continuations, hard budgets, limit statuses, and deterministic validators as first-class gates. Budget and limit gates carry exact fields max_turns, max_tokens, max_wall_time_seconds, max_parallel_agents, budget_limited, and usage_limited. Repeated identical blockers without artifact change route to repair/adjudication rather than infinite retry, and a goal cannot hide repeated non-progress, validator failure, or budget exhaustion behind a normal completion claim.
gui_related: false
gui_classification_reason: Progress, budget, and validator gates are runtime control behavior, not GUI implementation.
depends_on:
  - GRS-012
unblocks: []
acceptance_criteria:
  - Repeated retries or blockers escalate instead of looping silently.
  - Budget and limit statuses are represented distinctly from successful completion.
  - Budget and limit gates expose max_turns, max_tokens, max_wall_time_seconds, max_parallel_agents, budget_limited, and usage_limited.
  - Validators are first-class gates for certification where available.
  - Progress records expose progress_fingerprint, blocker_signature, repeat_count, artifact hashes, and no-progress continuation detection.
  - Repeated identical blockers without artifact change route to repair/adjudication rather than indefinite retry.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - future progress-fingerprint and validator-gate tests
risk_class: loop_or_validator_false_completion
reasoning_tier: high
context_scope: goal_runtime_progress
implementation_surfaces:
  - future Goal Mode service
  - future validator registry
node_compile_hint:
  mode: progress_budget_validator_policy
  create_worknodes: false
source_lineage:
  - pldg-20260616-001-goal-runtime-system:atom-0050
  - pldg-20260616-001-goal-runtime-system:atom-0051
  - pldg-20260616-001-goal-runtime-system:atom-0052
preserved_exact_tokens:
  - "Progress fingerprints"
  - "progress_fingerprint"
  - "blocker_signature"
  - "repeat_count"
  - "loop detection"
  - "artifact hashes"
  - "no-progress"
  - "Hard budgets"
  - "limit statuses"
  - "Validators are first-class gates"
  - "max_turns"
  - "max_tokens"
  - "max_wall_time_seconds"
  - "max_parallel_agents"
  - "budget_limited"
  - "usage_limited"
negative_constraints:
  - Do not claim normal completion when validators fail.
  - Do not hide repeated non-progress behind repeated worker attempts.
owner_hints:
  - Plans/Goal_Runtime_System.md
  - Plans/Planning_Ledger_System.md
  - Plans/Plan_Document_System.md
```

### GRS-016 - Parallel Child Goals And Parent Completion Authority

```yaml
plan_unit_id: GRS-016
unit_type: requirement
status: accepted
owner_doc: Plans/Goal_Runtime_System.md
canonical_text: >-
  Parent goals may spawn parallel child goals/subagents with dedicated child_goal_id, parent_goal_id, agent_id, objectives, allowed scope, write policy, budgets, task lists, recovery state, stale/re-steer state, result artifacts, and local completion receipts. Subagents are preferred by default for bounded parallel work. "As many as needed" parallel child goals are capped by max_parallel_agents and budget, and remain bounded by write_scope_conflict_detection, worktree isolation, and parent synthesis requirements. Child goals may complete themselves locally, but they cannot complete the parent goal; parent goals own synthesis, merge, final verification, and parent completion certification.
gui_related: false
gui_classification_reason: Child-goal state and authority are runtime orchestration behavior; chat display is an Assistant Chat consumer surface.
depends_on:
  - GRS-006
  - GRS-012
unblocks: []
acceptance_criteria:
  - Child goals have first-class runtime identity and are not hidden implementation details.
  - Parent goal synthesis and completion authority cannot be delegated to a child goal.
  - Parallel execution is bounded by declared scope, budgets, and recovery state.
  - Parallel child goal spawning honors max_parallel_agents, write_scope_conflict_detection, worktree isolation, and parent synthesis requirements.
  - Child-goal state preserves child_goal_id, parent_goal_id, agent_id, allowed_scope, write_policy, result_artifacts, and stale/re-steer state.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - future child-goal orchestration tests
risk_class: child_goal_authority_drift
reasoning_tier: high
context_scope: parent_child_goal_runtime
implementation_surfaces:
  - future Goal Mode service
  - future subagent runtime
node_compile_hint:
  mode: parent_child_goal_runtime
  create_worknodes: false
source_lineage:
  - pldg-20260616-001-goal-runtime-system:atom-0053
  - pldg-20260616-001-goal-runtime-system:atom-0054
  - pldg-20260616-001-goal-runtime-system:atom-0055
  - pldg-20260616-001-goal-runtime-system:atom-0056
  - pldg-20260616-001-goal-runtime-system:atom-0057
  - pldg-20260616-001-goal-runtime-system:atom-0058
  - pldg-20260616-001-goal-runtime-system:atom-0096
  - pldg-20260616-001-goal-runtime-system:atom-0098
  - pldg-20260616-001-goal-runtime-system:dec-0009
  - pldg-20260616-001-goal-runtime-system:dec-0015
preserved_exact_tokens:
  - "parallel child goals"
  - "Subagents preferred by default"
  - "Parent/child goal tree"
  - "Parent-only synthesis and merge authority"
  - "first-class runtime objects"
  - "child_goal_id"
  - "parent_goal_id"
  - "agent_id"
  - "allowed_scope"
  - "write_policy"
  - "completion_receipt"
  - "stale/re-steer state"
  - "as many as needed"
  - "max_parallel_agents"
  - "write_scope_conflict_detection"
  - "worktree isolation"
  - "parent synthesis"
  - "Child goals may complete themselves locally"
  - "cannot complete the parent goal"
  - "For this task, write yourself a new goal and spawn agents in parallel - as many as needed to do it better and faster. Split the work into independent pieces, dispatch them concurrently, and synthesize the results as they return. Give each agent its own dedicated /goal."
negative_constraints:
  - Do not hide child agents as untracked implementation details.
  - Do not let a child goal certify, merge, or finish the parent goal independently.
  - Do not launch unlimited agents.
  - Do not allow multiple write agents to edit conflicting scopes without isolation/merge control.
owner_hints:
  - Plans/Goal_Runtime_System.md
  - Plans/assistant-chat-design.md
```

### GRS-017 - Child Goal Write Authority And Single-Writer Leases

```yaml
plan_unit_id: GRS-017
unit_type: constraint
status: accepted
owner_doc: Plans/Goal_Runtime_System.md
canonical_text: >-
  Child goals default to read_only or proposal_only. Direct writes require an isolated worktree, explicit non-overlapping scope, or a parent-granted single-writer lease. If two child goals need the same file, the parent goal serializes or isolates the work, and write_scope_conflict_detection runs before writes proceed.
gui_related: false
gui_classification_reason: Write authority and conflict policy are runtime/file orchestration behavior, not GUI implementation.
depends_on:
  - GRS-016
unblocks: []
acceptance_criteria:
  - Parallel child goals do not perform blind concurrent direct writes.
  - Write scopes are isolated, explicitly partitioned, or leased to a single writer by the parent.
  - Parent synthesis handles conflicting child outputs.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - future worktree/write-scope conflict tests
risk_class: concurrent_write_conflict
reasoning_tier: high
context_scope: parent_child_goal_runtime
implementation_surfaces:
  - future Goal Mode service
  - future worktree manager
node_compile_hint:
  mode: child_write_authority_policy
  create_worknodes: false
source_lineage:
  - pldg-20260616-001-goal-runtime-system:atom-0055
  - pldg-20260616-001-goal-runtime-system:atom-0101
  - pldg-20260616-001-goal-runtime-system:atom-0102
  - pldg-20260616-001-goal-runtime-system:atom-0110
  - pldg-20260616-001-goal-runtime-system:dec-0017
  - pldg-20260616-001-goal-runtime-system:dec-0024
preserved_exact_tokens:
  - "read_only"
  - "proposal_only"
  - "isolated_worktree"
  - "direct_write_single_owner"
  - "direct_write_partitioned"
  - "parent goal is the default merger/writer"
  - "No blind concurrent writes"
  - "parent-granted single-writer lease"
  - "write_scope_conflict_detection"
negative_constraints:
  - Do not allow blind concurrent direct writes from multiple child goals.
  - Do not default parallel child agents to direct file mutation.
  - Do not allow child direct writes without isolation, partitioning, or a parent-granted lease.
  - Do not allow multiple write agents to edit conflicting scopes without isolation/merge control.
owner_hints:
  - Plans/Goal_Runtime_System.md
```

### GRS-018 - Task Template Catalog And Goal-Type Completion Criteria

```yaml
plan_unit_id: GRS-018
unit_type: requirement
status: accepted
owner_doc: Plans/Goal_Runtime_System.md
canonical_text: >-
  Goal Runtime provides a task template catalog for common goal classes: bug_fix, feature_build, test_until_pass, doc_update, repo_research, refactor, migration, audit_and_repair, ledger_to_plan_transfer, governance seal, and future plan_graph_build only after the PlanUnit-to-NodeSeed-to-WorkNode compiler contract exists. Each template carries goal-type completion criteria, validator expectations, evidence requirements, and no-WorkNode boundary where applicable. Bug-fix goals require the bug reproduced or a reason recorded, fix applied, relevant tests pass, and changed files/evidence summarized. Feature-build goals require implementation done within scope, tests added/updated and passing, docs/plans updated when required, and acceptance criteria proved. Test-until-pass goals keep running until the command passes or external/blocking status is classified with logs captured. Doc-update goals require target docs reflect the request, unsupported content absent, source refs/lineage preserved where required, and validators or lint checks pass. Ledger-to-plan transfer goals load compact state and relevant records, inspect sharded source/target docs through runtime retrieval, update live Plans, verify coverage, repair missed/weak areas autonomously, and complete with evidence/certification.
gui_related: false
gui_classification_reason: Goal templates and completion criteria are runtime/task policy, not GUI implementation.
depends_on:
  - GRS-012
  - GRS-015
unblocks: []
acceptance_criteria:
  - Bug-fix, feature-build, test-until-pass, doc-update, audit/repair, and ledger-to-plan transfer goals have explicit completion criteria.
  - Plan graph build remains deferred until the compiler contract defines safe node artifacts.
  - Template metadata does not create executable queues by itself.
  - Bug-fix goals complete only after bug reproduced or reason recorded, fix applied, relevant tests pass, and changed files/evidence summarized.
  - Feature-build goals complete only after implementation done within scope, tests added/updated and pass, docs/plans updated when required, and acceptance criteria proved.
  - Test-until-pass goals continue until command passes or external/blocking condition is classified with logs captured.
  - Doc-update goals complete only when target docs reflect the request, unsupported content is absent, source refs/lineage are preserved where required, and validators or lint checks pass.
  - Ledger-to-plan transfer goals load compact state/relevant records, inspect sharded source/target docs, update live Plans, verify coverage, repair autonomously, and complete with completion certificate.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - future template catalog tests
risk_class: goal_template_ambiguity
reasoning_tier: standard
context_scope: goal_runtime_templates
implementation_surfaces:
  - future Goal Mode service
  - Plans/Plan_To_Node_Compilation.md
node_compile_hint:
  mode: goal_template_catalog
  create_worknodes: false
source_lineage:
  - pldg-20260616-001-goal-runtime-system:atom-0059
  - pldg-20260616-001-goal-runtime-system:atom-0060
  - pldg-20260616-001-goal-runtime-system:atom-0061
  - pldg-20260616-001-goal-runtime-system:atom-0062
  - pldg-20260616-001-goal-runtime-system:atom-0063
  - pldg-20260616-001-goal-runtime-system:atom-0064
  - pldg-20260616-001-goal-runtime-system:atom-0065
  - pldg-20260616-001-goal-runtime-system:dec-0005
  - pldg-20260616-001-goal-runtime-system:q-0002
preserved_exact_tokens:
  - "bug_fix"
  - "feature_build"
  - "test_until_pass"
  - "doc_update"
  - "repo_research"
  - "refactor"
  - "migration"
  - "audit_and_repair"
  - "ledger_to_plan_transfer"
  - "ledger-to-plan transfer"
  - "governance seal"
  - "plan_graph_build"
  - "Plan graph build goal deferred"
  - "PlanUnit-to-NodeSeed-to-WorkNode compiler contract"
  - "bug reproduced"
  - "fix applied"
  - "relevant tests pass"
  - "implementation done"
  - "tests added/updated"
  - "tests pass"
  - "docs/plans updated"
  - "test until pass"
  - "command passes"
  - "external/blocking"
  - "logs captured"
  - "source refs"
  - "lineage"
  - "validators"
  - "lint checks"
  - "compact state"
  - "relevant records"
  - "sharded source/target docs"
  - "update live Plans"
  - "verify coverage"
  - "repair autonomously"
  - "completion certificate"
negative_constraints:
  - Do not create NodeSeeds or WorkNodes until Plans/Plan_To_Node_Compilation.md defines the compiler contract.
  - Do not treat a task template as an executable queue.
owner_hints:
  - Plans/Goal_Runtime_System.md
  - Plans/Plan_To_Node_Compilation.md
```

### GRS-019 - Autonomous Recovery And Exact Blockers

```yaml
plan_unit_id: GRS-019
unit_type: requirement
status: accepted
owner_doc: Plans/Goal_Runtime_System.md
canonical_text: >-
  Goal Runtime handles ordinary ambiguity and large-work recovery autonomously by preserving open questions, conflicts, or unplaced requirements in appropriate docs/artifacts, selecting a safe canonical destination when policy is clear, retrying, inspecting, replanning, spawning verifier/subagents, escalating model tier, narrowing scope, running repair gates, rolling back isolated changes when appropriate, and recording precise blockers when it cannot proceed. Large, cross-referential, ambiguous-in-ordinary-ways, or many-shard tasks do not route to manual decision merely because they are large. Blocked status must store and display blocker_class, cause, affected scope, last attempted recovery, why autonomous recovery cannot continue safely, and next safe action rather than a generic failure label.
gui_related: true
gui_classification_reason: Exact blocker status is a user-visible goal status surface as well as runtime state.
depends_on:
  - GRS-006
  - GRS-015
unblocks: []
acceptance_criteria:
  - Ordinary large-work ambiguity does not become a manual decision request by default.
  - Recovery actions are recorded as goal events or receipt evidence.
  - Blocked states expose exact blocker causes for user and verifier review.
  - Ordinary ambiguity can be preserved as open questions, conflicts, or unplaced requirements with safe canonical destination evidence.
  - Recovery actions include retry, replan, spawn verifier/subagents, escalate model tier, narrow scope, repair gates, and isolated rollback where safe.
  - Blocked states record blocker_class, cause, affected scope, last attempted recovery, why autonomous recovery cannot continue safely, and next safe action.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - future recovery/blocker-state tests
risk_class: hidden_blocker
reasoning_tier: high
context_scope: goal_runtime_recovery
implementation_surfaces:
  - future Goal Mode service
  - Plans/assistant-chat-design.md
node_compile_hint:
  mode: autonomous_recovery_and_blockers
  create_worknodes: false
source_lineage:
  - pldg-20260616-001-goal-runtime-system:atom-0069
  - pldg-20260616-001-goal-runtime-system:atom-0070
  - pldg-20260616-001-goal-runtime-system:atom-0071
  - pldg-20260616-001-goal-runtime-system:atom-0072
preserved_exact_tokens:
  - "Autonomous ambiguity handling"
  - "ordinary ambiguity"
  - "open questions"
  - "conflicts"
  - "unplaced requirements"
  - "safe canonical destination"
  - "Autonomous recovery actions"
  - "retry"
  - "replan"
  - "spawn verifier"
  - "escalate model tier"
  - "repair gates"
  - "roll back"
  - "precise blockers"
  - "No manual decision for ordinary large work"
  - "do not route to manual decision just because the task count is large"
  - "large"
  - "cross-referential"
  - "many shards"
  - "Blocked status carries exact blocker"
  - "blocker_class"
  - "affected scope"
  - "last attempted recovery"
  - "next safe action"
negative_constraints:
  - Do not ask the user for ordinary invisible-goal ambiguity.
  - Do not hide an unresolved blocker behind a successful completion receipt.
owner_hints:
  - Plans/Goal_Runtime_System.md
  - Plans/assistant-chat-design.md
```

### GRS-020 - Approval Boundaries For High-Risk Goal Actions

```yaml
plan_unit_id: GRS-020
unit_type: constraint
status: accepted
owner_doc: Plans/Goal_Runtime_System.md
canonical_text: >-
  Goal Runtime requires explicit user approval for destructive actions, governance seal, broad writes outside declared scope, external paid/network side effects, production-affecting actions, data deletion/migration, dependency/license/security-policy changes, and credential/secrets touching. Invisible internal goals use predeclared authority and block when outside it.
gui_related: false
gui_classification_reason: Approval authority boundaries are runtime/permission policy, not GUI layout or presentation.
depends_on:
  - GRS-011
  - GRS-012
unblocks: []
acceptance_criteria:
  - High-risk goal actions request explicit user approval before execution.
  - Invisible/internal goals cannot exceed predeclared authority.
  - Approval boundaries are enforced even when a child goal or worker requests the action.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - future permission/approval policy tests
risk_class: authority_boundary_violation
reasoning_tier: high
context_scope: goal_runtime_permissions
implementation_surfaces:
  - future Goal Mode service
  - Plans/Permissions_System.md
node_compile_hint:
  mode: goal_approval_boundary_policy
  create_worknodes: false
source_lineage:
  - pldg-20260616-001-goal-runtime-system:atom-0108
  - pldg-20260616-001-goal-runtime-system:dec-0022
preserved_exact_tokens:
  - "explicit user approval"
  - "destructive actions"
  - "governance seal"
  - "broad writes outside declared scope"
  - "external paid/network side effects"
  - "production-affecting actions"
  - "data deletion/migration"
  - "dependency/license/security-policy changes"
  - "credential/secrets touching"
  - "Invisible internal goals"
  - "predeclared authority"
  - "block when outside it"
negative_constraints:
  - Do not proceed with high-risk operations without explicit approval.
  - Do not let invisible internal goals exceed predeclared authority.
owner_hints:
  - Plans/Goal_Runtime_System.md
  - Plans/Permissions_System.md
```

### GRS-021 - Goal Compile Acceptance And Governance Boundary

```yaml
plan_unit_id: GRS-021
unit_type: validation_criterion
status: accepted
owner_doc: Plans/Goal_Runtime_System.md
canonical_text: >-
  Goal Runtime compilation from this ledger creates a new Goal Runtime owner doc plus consumer PlanUnits only. During ordinary ledger planning, plan drafting, and ledger compile, agents must not update Plans/.plan_index, Spec Lock, generated shards, evidence bundles, plan_graph, auto_decisions, WorkNodes, NodeSeeds, executable queues, final node manifests, product implementation files, Rust/Slint app scaffolds, legacy Iced app files, production build tasks, or final node queues. A separate explicit PlanUnit index phase may regenerate allowed Plans/.plan_index/** outputs after live Plans docs are stable. If Plans or Plans/.plan_index change, governance_status remains pending_seal until a separate explicit governance seal phase; that seal may refresh governance artifacts without changing product behavior or creating node/build artifacts.
gui_related: false
gui_classification_reason: Compile and governance boundaries are planning/governance behavior, not GUI implementation.
depends_on:
  - GRS-001
unblocks: []
acceptance_criteria:
  - Canonical Goal Runtime behavior is represented in live non-pipeline Plans docs.
  - Ledger planning, plan drafting, and ledger compile do not update Plans/.plan_index, generated indexes, shards, evidence, Spec Lock, graph, or decisions.
  - Allowed PlanUnit index outputs may be regenerated only in a separate explicit PlanUnit index phase after live Plans docs are stable; seal-phase governance artifacts are not touched until explicit seal.
  - Compile reports changed files, PlanUnits, atom dispositions, validators, and pre-seal pending seal status.
validation_surfaces:
  - python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260616-001-goal-runtime-system
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plans-verify.py run-gates
  - python3 scripts/pm-shard-plans.py --check
  - python3 scripts/pm-plans-verify.py validate-auto-decisions
  - python3 scripts/pm-plans-verify.py verify-spec-lock
  - python3 scripts/pm-plans-verify.py validate-evidence
  - git diff --check
risk_class: governance_boundary
reasoning_tier: high
context_scope: ledger_to_plans_compile
implementation_surfaces:
  - Plans/Goal_Runtime_System.md
  - Plans/00-plans-index.md
  - Plans/.plan_index
node_compile_hint:
  mode: compile_governance_boundary
  create_worknodes: false
source_lineage:
  - pldg-20260616-001-goal-runtime-system:atom-0080
  - pldg-20260616-001-goal-runtime-system:atom-0082
  - pldg-20260616-001-goal-runtime-system:atom-0083
  - pldg-20260616-001-goal-runtime-system:atom-0084
  - pldg-20260616-001-goal-runtime-system:dec-0012
preserved_exact_tokens:
  - "Create new Goal Runtime System plan doc"
  - "Goal Runtime PlanUnit coverage areas"
  - "Do not create generated governance artifacts during ledger planning"
  - "Goal Mode compile acceptance"
  - "WorkNodes"
  - "NodeSeeds"
  - "Spec_Lock"
  - "shards"
  - "evidence bundles"
  - "plan_graph"
  - "auto_decisions"
negative_constraints:
  - Do not create WorkNodes, NodeSeeds, executable queues, final node manifests, implementation files, or production build tasks during this compile.
  - Do not update Spec_Lock, generated shards, evidence, plan_graph, or auto_decisions during the pre-seal compile phase.
owner_hints:
  - Plans/Goal_Runtime_System.md
```

### GRS-022 - Goal Runtime Risk Register

```yaml
plan_unit_id: GRS-022
unit_type: risk
status: accepted
owner_doc: Plans/Goal_Runtime_System.md
canonical_text: >-
  The primary Goal Runtime risks are false completion by weak agents, hidden work without user control, and invisible/internal flows interrupting the user for ordinary blockers. Runtime certification, visible control surfaces, exact blocker states, autonomous recovery, and explicit authority boundaries mitigate these risks.
gui_related: true
gui_classification_reason: This risk register includes hidden-work/user-control UX risk and visible control mitigation.
depends_on:
  - GRS-009
  - GRS-012
  - GRS-019
  - GRS-020
unblocks: []
acceptance_criteria:
  - False completion risk is mitigated through runtime-certified receipts and verifier/adjudicator policy.
  - Hidden work risk is mitigated through visible Assistant Chat controls and evidence disclosure.
  - Internal-flow interruption risk is mitigated through autonomous recovery and exact hard-stop boundaries.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - manual Goal Runtime risk review
risk_class: goal_runtime_product_risk
reasoning_tier: high
context_scope: goal_runtime_system
implementation_surfaces:
  - Plans/Goal_Runtime_System.md
  - Plans/assistant-chat-design.md
node_compile_hint:
  mode: goal_runtime_risk_register
  create_worknodes: false
source_lineage:
  - pldg-20260616-001-goal-runtime-system:atom-0085
  - pldg-20260616-001-goal-runtime-system:atom-0086
  - pldg-20260616-001-goal-runtime-system:atom-0087
preserved_exact_tokens:
  - "Main product risk: false completion by weak agents"
  - "Main UX risk: hidden work without control"
  - "Main internal-flow risk: user interruption for ordinary blockers"
negative_constraints:
  - Do not make invisible work impossible to inspect or stop when it affects the user.
  - Do not route ordinary invisible-goal ambiguity to the user by default.
owner_hints:
  - Plans/Goal_Runtime_System.md
  - Plans/assistant-chat-design.md
```

### GRS-023 - Reference Patterns Are Lineage, Not Canonical Owners

```yaml
plan_unit_id: GRS-023
unit_type: compatibility_disposition
status: accepted
owner_doc: Plans/Goal_Runtime_System.md
canonical_text: >-
  Codex implementation patterns, attachment behavior references, and competitor evaluator/judge-loop lessons are source-lineage and implementation research inputs only. Exact lineage tokens retained include /goal now preserves oversized text, large pasted blocks, and image attachments, rust-v0.140.0, #27508, #27509, #27510, runtime.rs, tool.rs, spec.rs, steering.rs, continuation.md, thread_goal.rs, goal_menu.rs, goal_status.rs, thread_goal_processor.rs, Codex, Claude Code, Hermes, OpenClaw, OpenCode, PI, separate evaluator, judge loop, and core-owned session goals. These tokens may guide Goal Runtime implementation, but they remain lineage/research and do not override Puppet Master-owned runtime, evidence, model-role, or completion contracts.
gui_related: false
gui_classification_reason: Research/source-lineage disposition is not GUI implementation.
depends_on:
  - GRS-001
unblocks: []
acceptance_criteria:
  - External or comparative references remain cited as lineage or implementation research.
  - Puppet Master-owned PlanUnits remain the canonical behavior source.
  - External file names, PR numbers, and competitor/runtime names remain source-lineage tokens rather than Puppet Master behavior.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - manual source-lineage review
risk_class: external_reference_overreach
reasoning_tier: standard
context_scope: goal_runtime_source_lineage
implementation_surfaces:
  - Plans/Goal_Runtime_System.md
node_compile_hint:
  mode: source_lineage_reference_disposition
  create_worknodes: false
source_lineage:
  - pldg-20260616-001-goal-runtime-system:atom-0040
  - pldg-20260616-001-goal-runtime-system:atom-0073
  - pldg-20260616-001-goal-runtime-system:atom-0074
preserved_exact_tokens:
  - "Codex v0.140 attachment behavior reference"
  - "Codex implementation patterns to inspect"
  - "Evaluator and judge-loop lessons"
  - "/goal now preserves oversized text, large pasted blocks, and image attachments"
  - "rust-v0.140.0"
  - "#27508"
  - "#27509"
  - "#27510"
  - "runtime.rs"
  - "tool.rs"
  - "spec.rs"
  - "steering.rs"
  - "continuation.md"
  - "thread_goal.rs"
  - "goal_menu.rs"
  - "goal_status.rs"
  - "thread_goal_processor.rs"
  - "Claude Code"
  - "Hermes"
  - "OpenClaw"
  - "OpenCode"
  - "PI"
  - "separate evaluator"
  - "judge loop"
  - "core-owned session goals"
negative_constraints:
  - Do not make competitor or external implementation references canonical Puppet Master behavior.
  - Do not rely only on marker-based completion or host-specific stop hooks.
owner_hints:
  - Plans/Goal_Runtime_System.md
```

### GRS-024 - Legacy Chain Wizard Compatibility And Plan Graph Runtime Boundary

```yaml
plan_unit_id: GRS-024
unit_type: compatibility_disposition
status: accepted
owner_doc: Plans/Goal_Runtime_System.md
canonical_text: >-
  Current Planning Wizard flow semantics are owned by Plans/Planning_Wizard.md, and legacy Chain Wizard compatibility remains source-lineage-only unless a separate compatibility owner explicitly implements an import/display bridge. Goal Runtime may define invisible ledger-to-Plans execution and a plan_graph_build template that consumes the accepted Plan_To_Node_Compilation compiler contract, but Goal Runtime plan/index/governance phases still must not create NodeSeeds, WorkNodes, executable queues, final node manifests, or production build tasks. Runtime PlanCompile may create runtime artifacts only through the Plan_To_Node_Compilation compiler, Executor intake, activation, and completion certification chain.
gui_related: false
gui_classification_reason: Legacy compatibility/source-lineage and runtime compiler boundary design is not a GUI implementation requirement.
depends_on:
  - GRS-003
  - GRS-018
  - PNC-007
unblocks: []
acceptance_criteria:
  - Current Planning Wizard flow semantics route to Plans/Planning_Wizard.md.
  - Legacy Chain Wizard compatibility is source-lineage-only and is not required by accepted runtime flow.
  - Plan graph build consumes the accepted Plan_To_Node_Compilation compiler contract without letting Goal Runtime bypass Executor intake.
  - No node artifacts are produced by Goal Runtime documentation, index, or governance phases.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - Plans/.plan_index/node_readiness_report.json
risk_class: legacy_compiler_boundary
reasoning_tier: high
context_scope: chain_wizard_and_compiler
implementation_surfaces:
  - Plans/Goal_Runtime_System.md
  - Plans/Plan_To_Node_Compilation.md
  - Plans/chain-wizard-flexibility.md
node_compile_hint:
  mode: legacy_chain_wizard_source_lineage_runtime_boundary
  create_worknodes: false
source_lineage:
  - pldg-20260616-001-goal-runtime-system:atom-0015
  - pldg-20260616-001-goal-runtime-system:atom-0016
  - pldg-20260616-001-goal-runtime-system:atom-0065
  - pldg-20260616-001-goal-runtime-system:q-0001
  - pldg-20260616-001-goal-runtime-system:q-0002
preserved_exact_tokens:
  - "Plan graph goals come after compiler contract"
  - "Plan graph build"
  - "exact redesigned Chain Wizard flow"
  - "PlanUnit-to-NodeSeed-to-WorkNode compiler contract"
negative_constraints:
  - Do not make legacy Chain Wizard compatibility a dependency for accepted runtime flow.
  - Do not let Goal Runtime bypass Plan_To_Node_Compilation, Executor intake, activation, or completion certification.
owner_hints:
  - Plans/Goal_Runtime_System.md
  - Plans/Plan_To_Node_Compilation.md
  - Plans/chain-wizard-flexibility.md
```

### GRS-025 - Goal UI Styling, Persistence Substrate, And Provider Defaults

```yaml
plan_unit_id: GRS-025
unit_type: requirement
status: accepted
owner_doc: Plans/Goal_Runtime_System.md
canonical_text: >-
  Goal chip/status/task-drawer styling, persistence substrate, and provider-specific model-role tier mappings are required implementation-bound decisions for the Goal Runtime product surface. The Goal implementation plan must bind each choice to named owner docs, durable state records, provider-policy records, validation surfaces, and acceptance evidence before production readiness can be certified. The accepted runtime contract requires functional Assistant Chat controls, durable goal state, separate worker and verifier/adjudicator policy surfaces, and certification-tier verifier requirements; unresolved styling, persistence, or provider defaults must block certification rather than remain as unbound implementation gaps.
gui_related: true
gui_classification_reason: This requirement includes final visual styling, iconography, and layout for Goal UI surfaces.
depends_on:
  - GRS-005
  - GRS-007
  - GRS-010
unblocks: []
acceptance_criteria:
- Goal visual styling binds to owner-doc UI contracts before certification.
- Persistence substrate selection binds to durable state and event-log contracts before certification.
- Provider defaults bind to separate worker/verifier-adjudicator policy and strong-certification blocking rules before certification.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - UI design, persistence, and provider-policy reviews
risk_class: implementation_binding_drift
reasoning_tier: standard
context_scope: goal_runtime_implementation_bindings
implementation_surfaces:
  - Plans/Goal_Runtime_System.md
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: goal_runtime_implementation_bindings
  create_worknodes: false
source_lineage:
  - pldg-20260616-001-goal-runtime-system:atom-0017
  - pldg-20260616-001-goal-runtime-system:atom-0031
  - pldg-20260616-001-goal-runtime-system:atom-0104
  - pldg-20260616-001-goal-runtime-system:atom-0105
  - pldg-20260616-001-goal-runtime-system:q-0003
  - pldg-20260616-001-goal-runtime-system:q-0004
  - pldg-20260616-001-goal-runtime-system:q-0005
preserved_exact_tokens:
  - "final visual styling, iconography, and exact layout"
  - "database tables, project files, or a hybrid"
  - "default model-role tier mappings"
  - "worker, planner, evaluator, verifier, and adjudicator"
negative_constraints:
  - Do not treat deferred styling as absence of required Goal controls.
  - Do not hard-code provider-specific model defaults as canonical correctness requirements in this compile.
owner_hints:
  - Plans/Goal_Runtime_System.md
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
```

## 3. Contracts, Schemas, Events, Or Data Shapes

Goal Runtime requires these data-shape families:

- Goal state: `goal_id`, `parent_goal_id`, `status`, `objective`, `acceptance_criteria`, `non_goals`, `allowed_scope`, constraints, budget, `work_queue`, task list, `model_policy`, attachment manifest, child goals, `evidence_index`, evidence references, completion receipt, `goal_revision`, and recovery state.
- Goal event log: append-only events using the Contracts_V0 registered names `goal.created`, `goal.scheduled`, `goal.progressed`, `goal.tool_check_recorded`, `goal.updated`, `goal.replanned`, `goal.child_status_changed`, `goal.evidence_captured`, `goal.verification_decided`, `goal.receipt_recorded`, `goal.completed`, `goal.degraded`, `goal.stopped`, `goal.blocked`, and `goal.cancelled`, plus Orchestrator GoalRun projections from `goal_run.started`, `goal_run.replanned`, `goal_run.blocked`, `goal_run.certified`, `goal_run.cancelled`, and `goal_run.stopped`.
- Goal update event fields: `goal_revision`, `previous_revision`, `objective_update`, `constraint_added`, `active_subgoals_notified`, and stale child goals.
- Goal Completion Receipt: tier, changed files/artifacts, checklist disposition, checks run/skipped, evidence refs, validator outputs, child receipts, verifier/adjudicator decision, unresolved/open items, degraded-mode reason, and source-to-target mapping when applicable.
- Child goal state: `child_goal_id`, `parent_goal_id`, `agent_id`, `status`, `objective`, `allowed_scope`, `write_policy`, `budget`, `task_list`, `result_artifacts`, `completion_receipt`, stale/re-steer state, and `recovery_state`.
- Progress state: `progress_fingerprint`, `blocker_signature`, artifact hashes, retry count, `repeat_count`, and no-progress continuation markers.
- Write authority: `read_only`, `proposal_only`, `isolated_worktree`, `direct_write_single_owner`, `direct_write_partitioned`, and parent-granted `single-writer lease`.

### Goal and GoalRun payload minima

Every persisted Goal Runtime event carries the shared runtime envelope from `Contracts_V0`: `event_name`, payload `schema_version`, `occurred_at_utc`, `project_id`, `thread_id?`, `goal_id`, `parent_goal_id?`, `goal_revision`, `expected_goal_revision?` when compare-and-swap applies, `actor_ref`, `execution_role`, requested/effective provider refs, requested/effective model refs, requested/effective account refs, `correlation_id`, `causation_event_ref?`, `idempotency_key?`, `evidence_refs[]`, `artifact_refs[]`, `approval_refs[]?`, and `block_refs[]?`.

Event-specific minima:

| Event | Additional minimum payload |
| --- | --- |
| `goal.created` | `objective`, `acceptance_criteria[]`, `non_goals[]`, `allowed_scope`, `constraints[]`, `budget`, `attachment_refs[]`, `model_policy`, `agent_control_envelope_ref`, `agent_control_envelope_hash` |
| `goal.scheduled` | `scheduler_reason`, `eligible_at_utc`, `queue_id?`, `priority`, `budget_snapshot_ref`, `next_action` |
| `goal.progressed` | `progress_fingerprint`, `task_delta`, `status_before`, `status_after`, `artifact_hashes[]`, `repeat_count?`, `no_progress_marker?` |
| `goal.tool_check_recorded` | `tool_call_id`, `tool_name`, `check_kind`, `check_result`, `policy_decision`, `output_ref?`, `log_ref?` |
| `goal.updated` | `previous_revision`, `new_revision`, `objective_delta?`, `scope_delta?`, `constraint_delta?`, `budget_delta?`, `active_child_goal_ids[]`, `stale_child_goal_ids[]` |
| `goal.replanned` | `interruption_class`, `impact_summary`, `affected_child_goal_ids[]`, `affected_worknode_refs[]`, `child_decisions[]`, `remaining_evidence_refs[]`, `new_revision`, `next_action` |
| `goal.child_status_changed` | `child_goal_id`, `child_agent_lease_id?`, `previous_status`, `next_status`, `result_ref?`, `receipt_ref?`, `parent_action_required?` |
| `goal.evidence_captured` | `evidence_ref`, `evidence_kind`, `source_spans[]`, `content_hash`, `snapshot_ref?`, `currentness_state`, `redaction_profile`, `retention_policy_ref?` |
| `goal.verification_decided` | `audit_cycle_id?`, `verification_cycle_id?`, `decision`, `verifier_ref`, `adjudicator_ref?`, `finding_refs[]`, `closure_refs[]`, `unresolved_risk_refs[]` |
| `goal.receipt_recorded` | `receipt_id`, `receipt_kind`, `certification_tier`, `validator_outputs[]`, `child_receipt_refs[]`, `worknode_receipt_refs[]`, `certifier_decision` |
| `goal.completed` | `completion_receipt_ref`, `acceptance_criteria_disposition[]`, `changed_artifact_refs[]`, `validator_outputs[]`, `final_certifier_decision` |
| `goal.degraded` | `degraded_reason`, `affected_scope`, `exception_refs[]?`, `approval_refs[]?`, `residual_risk_refs[]`, `allowed_actions[]` |
| `goal.stopped` | `stop_reason_code`, `safe_point_ref?`, `interruption_boundary`, `child_settlement_refs[]`, `tool_settlement_refs[]`, `resumable` |
| `goal.blocked` | `blocker_class`, `blocked_reason_code`, `cause`, `affected_scope`, `last_recovery_attempt_ref?`, `autonomous_recovery_stop_reason`, `next_safe_action`, `allowed_action_ids[]` |
| `goal.cancelled` | `cancel_reason`, `mutation_started`, `cancellation_scope`, `settlement_refs[]`, `rollback_refs[]?` |
| `goal_run.started` | `goal_run_id`, `workgraph_ref`, `activation_receipt_ref`, `active_worknode_request_refs[]`, `write_mode`, `certification_tier` |
| `goal_run.replanned` | `goal_run_id`, `previous_workgraph_ref`, `new_workgraph_ref`, `replan_generation`, `affected_worknode_refs[]`, `cancelled_or_resteered_refs[]`, `next_action` |
| `goal_run.blocked` | `goal_run_id`, `blocked_reason_code`, `blocked_scope`, `allowed_action_ids[]`, `preserved_work_refs[]`, `block_receipt_ref` |
| `goal_run.certified` | `goal_run_id`, `certification_receipt_ref`, `validator_outputs[]`, `worknode_receipt_refs[]`, `unresolved_risk_refs[]`, `final_certifier_decision` |
| `goal_run.cancelled` | `goal_run_id`, `cancel_reason`, `mutation_started`, `settlement_refs[]`, `rollback_refs[]?` |
| `goal_run.stopped` | `goal_run_id`, `stop_reason_code`, `safe_point_ref?`, `child_settlement_refs[]`, `resumable` |

Runtime records:

| Record | Spec-level minimum |
| --- | --- |
| `LoopBreakerRegistry` | `registry_id`, `schema_version`, families `identical_tool_failure`, `empty_assistant`, `no_tool_progress`, `repeated_edit_miss`, `compaction_no_gain`, `context_overflow_replay`, `MCP_resource_missing`, `first_event_timeout`, `transport_idle`, `reasoning_no_action`, `subagent_same_read`, and `spend_anomaly`; each family has `fingerprint_fields[]`, `max_count`, `observation_window`, `terminal_action`, and `user_facing_reason`. |
| `AgentControlEnvelope` | `envelope_id`, `schema_version`, `autonomy_mode`, `write_surface`, provider/model/effort policy refs, tool/MCP permission ceiling, context/token budgets, loop budgets, wall-clock budgets, terminal/browser/device authority, child-spawn policy, cancellation/steering policy, progress heartbeat policy, and receipt refs. |
| `CertificationReceipt` | `receipt_id`, `schema_version`, `goal_id`, `goal_run_id?`, `certification_tier`, acceptance-criteria disposition, changed artifact refs, validator outputs, child/worknode receipt refs, authority checks, unresolved risks, certifier identity, and final decision. |
| `ChildAgentLease` | `lease_id`, `schema_version`, `parent_goal_id`, `child_goal_id?`, `agent_id`, `allowed_phase`, `read_write_mode`, `max_depth`, `delegation_depth`, `cannot_resume_parent_goal`, `terminal_return_channel`, budget ceiling, and settlement requirement. |
| `WorkNodeRequests` | `request_set_id`, `schema_version`, `goal_run_id`, active required request refs, optional request refs, accepted/deferred/excluded disposition, readiness snapshot, activation transaction ref, and reason for any mixed result. |
| `AuditCycle` | `audit_cycle_id`, `schema_version`, `goal_id`, `target_ref`, `cycle_index`, auditor refs, scope refs, finding refs, closure refs, validator outputs, status, and next action. |
| `AuditFinding` | `finding_id`, `schema_version`, `audit_cycle_id`, `finding_family`, severity, target refs, evidence refs, root_cause_key?, repeated_signature_count?, proposed repair refs, status, and owner refs. |
| `AuditClosure` | `closure_id`, `schema_version`, `finding_id`, `audit_cycle_id`, repair evidence refs, validation outputs, residual risks, reopen conditions, closed_by_ref, and closure decision. |

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Permissions_System.md

These data-shape bullets are Goal Runtime feature-local constraints; adjacent owner docs carry the shared envelope, concrete event-name registry, persistence, replay, projection, retention, and approval-scope registration needed for cross-owner routing. Concrete cross-owner Goal event names and payload minima are registered in `Plans/Contracts_V0.md` and persisted/replayed through `Plans/storage-plan.md`. `Plans/Goal_Runtime_System.md` remains the semantic owner for Goal Runtime behavior.

## 4. Integration Surfaces

- Assistant Chat consumes Goal Runtime for visible activation, status, task tracker, pause/resume/stop/clear/update controls, evidence/activity display, completion reports, and child-goal expansion.
- Final GUI consumes Goal Runtime for Settings placement of worker and verifier/adjudicator model selectors.
- Planning Ledger and Plan Document systems provide source-lineage and PlanUnit contracts for ledger-to-Plans goals.
- Plan_To_Node_Compilation owns the accepted compiler boundary for plan graph build goals and prevents PlanUnit indexing from creating NodeSeed/WorkNode artifacts.
- Permissions_System resolves global approval policy; Goal Runtime invokes approval for high-risk goal actions.
- Runtime_Artifacts_Panel and storage owners consume Goal Runtime evidence and receipt identities for browsing, retention, and redaction.
- Models_System and Multi-Account own concrete requested/effective model and account resolution for Goal Runtime roles; provider-specific docs may contribute existing provider capability/model discovery surfaces, but exact Goal Runtime provider-default tier mappings remain deferred unless later promoted through a provider-specific hook.

## 5. Validation And Acceptance

Goal Runtime implementation is acceptable only when:

- all Goal Runtime PlanUnits include `gui_related: true|false`;
- invisible internal goals, visible Assistant Chat goals, and Orchestrator Goal runtime flows share one lifecycle/state model;
- every goal produces a completion, degraded, stopped, or blocked receipt;
- strong-certification goals block when verifier/adjudicator requirements cannot be met;
- material mid-goal changes produce Goal Replan Events;
- child goals are first-class runtime objects but cannot complete the parent;
- child direct writes require isolation, partitioning, or a parent-granted single-writer lease;
- evidence is replayable for standard/strong tiers and raw logs are capped/redacted;
- seal-phase governance validation uses the complete GRS-021 validator suite before accepting the sealed Goal Runtime packet;
- WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, and final node queues are absent from Goal Runtime plan/index/governance phases; runtime PlanCompile and Executor may materialize runtime artifacts only through the accepted compiler, intake, activation, and certification chain.

## 6. Plan-To-Node Readiness

Current readiness from Plans/.plan_index remains index-only. Goal Runtime PlanUnits expose runtime contracts, risk, validation surfaces, dependencies, and `gui_related` metadata for compiler analysis. They do not create executable build tasks during documentation, index generation, or governance repair.

Node-readiness depends on `Plans/Plan_To_Node_Compilation.md` for compiler completeness and on Executor/Goal Runtime receipts for runtime certification. Index generation still reports that no NodeSeeds, WorkNodes, executable queues, final node manifests, production build tasks, or final node queues were created by the index phase.

## 7. Deferred, Retired, Compatibility, And Non-Goals

Deferred:

- exact legacy Chain Wizard compatibility flow after native Goal Mode exists;
- final visual styling, iconography, and exact layout for Goal chip/status/task drawer;
- provider-specific default model-role tier mappings.

Retired or non-goal:

- old prompt-packet/D2 workflow as product foundation;
- a bootstrapped PM Goal Mode implementation for current bootstrap work;
- treating Goal Mode as only a prompt loop or planning-doc transfer tool;
- creating WorkNodes, NodeSeeds, executable queues, final node manifests, implementation files, or production build tasks in this compile;
- updating Spec Lock, generated shards, evidence bundles, plan_graph, or auto_decisions during the pre-seal compile phase.

Compatibility:

- current Chain Wizard docs are incomplete legacy/source-lineage context for this feature;
- Codex and competitor references are source-lineage/research inputs only.

## 8. Source Lineage And Governance

Primary source lineage:

- `Plans/ledgers/v2/pldg-20260616-001-goal-runtime-system/records/design_atoms.jsonl`
- `Plans/ledgers/v2/pldg-20260616-001-goal-runtime-system/records/decisions.jsonl`
- `Plans/ledgers/v2/pldg-20260616-001-goal-runtime-system/records/questions.jsonl`
- `Plans/ledgers/v2/pldg-20260616-001-goal-runtime-system/records/corrections.jsonl`
- `Plans/ledgers/v2/pldg-20260616-001-goal-runtime-system/state/current.json`
- `Plans/ledgers/v2/pldg-20260616-001-goal-runtime-system/state/open_items.json`

Owner adjudication:

- `Plans/Goal_Runtime_System.md` owns runtime/control-plane behavior and evidence/completion policy.
- `Plans/assistant-chat-design.md` owns chat-facing Goal UI and thread behavior.
- `Plans/FinalGUISpec.md` owns Settings GUI placement for model selectors.
- `Plans/Planning_Ledger_System.md`, `Plans/Plan_Document_System.md`, and `Plans/Plan_To_Node_Compilation.md` remain owners for ledger, PlanUnit, and node-readiness mechanics.

The pre-seal compile phase leaves live Plans and `Plans/.plan_index/**` changes at `pending_seal` until an explicit governance seal. This Goal Runtime ledger has since been sealed through that separate governance phase; future ordinary ledger writing, plan drafting, PlanUnit indexing, and pre-seal compile work still must not touch generated governance artifacts.

## Ledger Compile Addendum - pldg-20260616-002

### GRS-026 - Orchestrator GoalRun Runtime Envelope

```yaml
plan_unit_id: GRS-026
unit_type: requirement
status: accepted
owner_doc: Plans/Goal_Runtime_System.md
canonical_text: >-
  Goal Runtime is the durable objective, authority, child-work, evidence, repair, and certification envelope for Orchestrator GoalRuns. It governs GoalRun phase, scope, write authority, child goals and SubagentWaves, evidence expectations, completion criteria, replan events, blockers, receipts, and final certification while Orchestrator owns user-visible projections and Executor owns scheduler truth. The lifecycle sequence preserves GoalRun → WorkGraph → WorkNode execution → VerificationCycle → repair loop → receipt → certification without changing Executor dispatch ownership. Replan records preserve affected WorkNodes, cancelled or re-steered child work, remaining valid evidence, new revision, and next action without replacing the existing Goal Replan Event owner policy. GoalRun write authority consumes write_mode values read_only, proposal_only, patch_only, isolated_worktree, leased_writer, and parent_writer through Permissions and Worktree owners rather than re-owning permission enforcement.
gui_related: false
gui_classification_reason: Runtime authority, state, receipts, and certification behavior are orchestration/control-plane behavior, not visual presentation.
depends_on: [GRS-002, GRS-005, GRS-012, GRS-016, GRS-017, OP-020, EP-097]
unblocks: [OP-022, OSI-428, EP-098, CV-288]
acceptance_criteria:
  - Orchestrator GoalRuns use Goal Runtime as the control envelope without replacing Orchestrator projections.
  - The GoalRun lifecycle preserves GoalRun → WorkGraph → WorkNode execution → VerificationCycle → repair loop → receipt → certification.
  - Executor/runtime scheduler remains the canonical owner for readiness, blocked overlays, retry/backoff, capacity, wakeups, and dispatch.
  - GoalRun completion requires receipt-backed certification rather than worker, subagent, or WorkNode success alone.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260616-002-orchestrator-goal-runtime-flow
risk_class: orchestrator_runtime_authority_drift
reasoning_tier: high
context_scope: orchestrator_goal_runtime
implementation_surfaces: [Plans/Goal_Runtime_System.md, Plans/Orchestrator_Page.md, Plans/Executor_Protocol.md, Plans/Contracts_V0.md, Plans/storage-plan.md, Plans/Permissions_System.md, Plans/WorktreeGitImprovement.md]
node_compile_hint: {mode: orchestrator_goal_runtime_envelope, create_worknodes: false}
source_lineage:
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0002
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0003
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0006
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0008
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0009
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0011
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0013
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0021
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0022
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0036
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0039
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0040
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0047
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0048
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0089
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0095
  - pldg-20260616-002-orchestrator-goal-runtime-flow:dec-0001
  - pldg-20260616-002-orchestrator-goal-runtime-flow:dec-0006
  - pldg-20260616-002-orchestrator-goal-runtime-flow:dec-0007
preserved_exact_tokens:
  - "Goal Runtime"
  - "Orchestrator"
  - "control envelope"
  - "GoalRun"
  - "WorkGraph"
  - "WorkNode"
  - "SubagentWave"
  - "GoalCompletionReceipt"
  - "Completion requires receipt-backed certification"
  - "isolated_worktree"
  - "GoalRun → WorkGraph → WorkNode execution → VerificationCycle → repair loop → receipt → certification"
  - "affected WorkNodes"
  - "cancelled"
  - "re-steered"
  - "remaining valid evidence"
  - "new revision"
  - "next action"
negative_constraints:
  - Do not make Goal Runtime replace Orchestrator UI/projections or Executor scheduler truth.
  - Do not dispatch graph nodes directly from Goal Runtime when Executor scheduling truth exists.
  - Do not mark tasks or goals complete only because a worker reports success.
owner_hints: [Plans/Goal_Runtime_System.md, Plans/Orchestrator_Page.md, Plans/Executor_Protocol.md, Plans/Contracts_V0.md, Plans/storage-plan.md, Plans/Permissions_System.md, Plans/WorktreeGitImprovement.md]
```

### GRS-027 - Verification Repair Loop And Certification Policy

```yaml
plan_unit_id: GRS-027
unit_type: requirement
status: accepted
owner_doc: Plans/Goal_Runtime_System.md
canonical_text: >-
  Orchestrator GoalRuns treat execution success as provisional. VerificationCycle failures create typed VerificationFinding records, findings, and DefectBundles, repair WorkNodes or repair subgoals run under bounded authority, and verification reruns against the affected target plus regression scope until zero findings remain or a true blocker or authority boundary is reached. Runtime policy consumes the contract-owned VerificationCycle example shape with verification_cycle_id, target_ref, attempt, status failed | passed | blocked, findings, defect_signatures, finding type, failing check, affected artifact/path/span, root_cause_key, repeated_signature_count, prior repair strategies, repair_strategy, and next_required_action without re-owning the schema. VerificationReceipt records verifier identity, findings, defect signatures, passed/failed/skipped validator outputs, repair-cycle refs, and regression checks. WorkNodeReceipt records executor identity, input refs, output refs, changed artifacts, validators run, evidence refs, and unresolved risks. GoalCompletionReceipt records child receipts, WorkNode receipts, changed artifacts, validator outcomes, authority checks, and final certifier decision. Repair strategy values include patch, replan, split_node, merge_node, widen_context, rollback, escalate_capability_lane, assign_specialist_subagents, manual_decision, and authority_blocked. Acceptance checks require acceptance criteria, live evidence, tests, diffs, validator outputs, canonical evidence, source evidence, process evidence, and governance evidence. Controller, planner, executor, reviewer, verifier, adjudicator, certifier, root_cause, and replan roles remain distinct when verifying or certifying repair loops. Validator failure, verifier unavailable, and repair budget exhaustion produce blocked or degraded outcomes rather than certified complete. Two consecutive failed verification cycles with the same defect signature force strategy adjustment, and the third failed cycle escalates to a high-end adjudicator or root_cause replan.
gui_related: false
gui_classification_reason: Verification, repair, receipts, and certification policy are runtime/governance behavior, not GUI implementation.
depends_on: [GRS-010, GRS-012, GRS-013, GRS-014, GRS-019]
unblocks: [OP-022, EP-098, CV-288, RAP-027]
acceptance_criteria:
  - A failed VerificationCycle cannot become a done-with-issues completion state.
  - Verification reruns after every repair before a WorkNode, child goal, or GoalRun is certified.
  - Runtime verification policy consumes the contract-owned VerificationCycle example shape, preserving attempt, failed | passed | blocked, typed VerificationFinding details, finding type, failing check, affected artifact/path/span, root_cause_key, repeated_signature_count, prior repair strategies, next_required_action, and defect_signatures without re-owning schema.
  - Repeated defect signatures trigger strategy adjustment after two consecutive failed verification cycles and high-end adjudication/root_cause replan on the third failed cycle.
  - VerificationReceipt, WorkNodeReceipt, and GoalCompletionReceipt preserve verifier/executor/certifier identity, changed artifacts, validator outcomes, evidence refs, unresolved risks, authority checks, and repair-cycle refs.
  - Repair strategy and evidence taxonomy values remain explicit rather than compressed into generic retry language.
  - Cost controls may reduce exploratory fanout but cannot disable required verification, receipts, independent review, or certification gates.
  - Validator failure, verifier unavailable, and repair budget exhaustion cannot be certified complete as normal success.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - future Goal Runtime verification-loop tests
risk_class: false_completion
reasoning_tier: high
context_scope: orchestrator_verification_repair
implementation_surfaces: [Plans/Goal_Runtime_System.md, Plans/Executor_Protocol.md, Plans/Runtime_Artifacts_Panel.md, Plans/Contracts_V0.md, Plans/storage-plan.md, Plans/Permissions_System.md, Plans/WorktreeGitImprovement.md]
node_compile_hint: {mode: verification_repair_loop_policy, create_worknodes: false}
source_lineage:
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0019
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0020
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0021
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0022
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0035
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0036
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0038
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0043
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0044
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0045
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0046
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0049
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0050
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0051
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0052
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0053
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0054
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0055
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0065
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0066
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0067
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0090
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0092
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0094
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0100
  - pldg-20260616-002-orchestrator-goal-runtime-flow:dec-0008
  - pldg-20260616-002-orchestrator-goal-runtime-flow:dec-0024
preserved_exact_tokens:
  - "verify again"
  - "keep doing that flow until it stops finding issues"
  - "zero findings remain"
  - "VerificationReceipt"
  - "WorkNodeReceipt"
  - "GoalCompletionReceipt"
  - "passed/failed/skipped"
  - "repair-cycle refs"
  - "regression checks"
  - "executor identity"
  - "input refs"
  - "output refs"
  - "changed artifacts"
  - "validators run"
  - "evidence refs"
  - "unresolved risks"
  - "validator outcomes"
  - "authority checks"
  - "final certifier decision"
  - "VerificationFinding"
  - "DefectBundle"
  - "RepairWorkNode"
  - "finding type"
  - "failing check"
  - "affected artifact/path/span"
  - "root_cause_key"
  - "prior repair strategies"
  - "defect signature"
  - "two consecutive failed verification cycles"
  - "two repeats"
  - "third failed cycle"
  - "high-end adjudicator"
  - "root_cause"
  - "patch"
  - "replan"
  - "split_node"
  - "merge_node"
  - "widen_context"
  - "rollback"
  - "escalate_capability_lane"
  - "assign_specialist_subagents"
  - "manual_decision"
  - "authority_blocked"
  - "attempt"
  - "failed | passed | blocked"
  - "defect_signatures"
  - "controller"
  - "planner"
  - "reviewer"
  - "validator failure"
  - "verifier unavailable"
  - "budget exhaustion"
  - "blocked"
  - "degraded"
  - "certified complete"
negative_constraints:
  - Do not allow a failed verification to become a done-with-issues state.
  - Do not reduce audit/verification strictness to save cost.
  - Do not keep applying the same low-end patch indefinitely.
owner_hints: [Plans/Goal_Runtime_System.md, Plans/Executor_Protocol.md, Plans/Runtime_Artifacts_Panel.md, Plans/Contracts_V0.md, Plans/storage-plan.md, Plans/Permissions_System.md, Plans/WorktreeGitImprovement.md, Plans/Progression_Gates.md]
```

## Ledger Compile Addendum - pldg-20260617-001-plans-to-code-handoff

### GRS-028 - Planning Wizard Approval To PlanCompile Boundary

```yaml
plan_unit_id: GRS-028
unit_type: requirement
status: accepted
owner_doc: Plans/Goal_Runtime_System.md
canonical_text: >-
  Future native Planning Wizard approval may emit a PlanApproved event that invisibly starts native PlanCompile, creates a PlanCompileRun, and projects progress in Orchestrator only after a later enablement PlanUnit accepts that runtime launch. Until then, current bootstrap and design_only v1 PlanCompile records remain design-only and disabled; this disabled boundary does not disable the finished-product native_runtime branch once runtime_enablement_ref and runtime_policy_snapshot_ref exist. Planning Wizard, Plan Compiler supervision, PRD Builder structured conversion, and ledger-to-Plans conversion use Overseer Model semantics, while Auditor Model owns the Auditor audit-to-repair verification loop that repeats audit, bounded repair, and re-audit until completion is certified or a critical block or authority boundary stops the loop.
  Future native launch remains invisible to the user only after explicit enablement, and new records, prompts, and plan updates must use Planning Wizard terminology. Do not introduce new references or meta-comments using retired Chain Wizard or Plan Wizard names as active terminology.
gui_related: false
gui_classification_reason: Trigger and model-role boundary are runtime behavior; Orchestrator owns visible projection.
depends_on: [GRS-002, PNC-010, MS-110]
unblocks: [OP-023, F3-396]
acceptance_criteria:
  - Current bootstrap and design_only v1 PlanCompile launch remains disabled until explicit enablement.
  - Planning Wizard approval is the future trigger source, not this compile's runtime action.
  - Overseer and Auditor model roles are consumed from Models_System.
validation_surfaces:
  - python3 scripts/pm-plans-verify.py run-gates
  - future Goal Runtime PlanApproved integration review
risk_class: premature_runtime_launch
reasoning_tier: high
context_scope: planning_wizard_plancompile_trigger
implementation_surfaces: [Plans/Goal_Runtime_System.md, Plans/Plan_To_Node_Compilation.md, Plans/Models_System.md, Plans/Orchestrator_Page.md]
node_compile_hint: {mode: future_planning_wizard_plancompile_trigger, create_worknodes: false}
source_lineage:
  - pldg-20260617-001-plans-to-code-handoff:atom-0008
  - pldg-20260617-001-plans-to-code-handoff:atom-0009
  - pldg-20260617-001-plans-to-code-handoff:atom-0020
  - pldg-20260617-001-plans-to-code-handoff:atom-0022
  - pldg-20260617-001-plans-to-code-handoff:dec-0004
  - pldg-20260617-001-plans-to-code-handoff:dec-0008
  - pldg-20260617-001-plans-to-code-handoff:dec-0028
preserved_exact_tokens:
  - "Planning Wizard"
  - "Plan Wizard"
  - "PlanApproved event"
  - "PlanCompileRun"
  - "invisible to the user"
  - "Overseer Model"
  - "Auditor Model"
  - "Auditor audit-to-repair loop"
  - "critical block"
negative_constraints:
  - Do not enable this automatic launch yet.
  - Do not introduce new references using retired Chain Wizard or Plan Wizard names as active terminology.
compatibility_only_notes:
  - Pre-rename Plan Wizard tokens may remain in source_lineage, preserved_exact_tokens, historical migration notes, and compatibility aliases only.
stale_retired_dispositions:
  - Plan Wizard is retired as active product/runtime/compile terminology; current prose, PlanUnits, commands, events, prompts, and index rows use Planning Wizard.
owner_hints:
  - Plans/Goal_Runtime_System.md
  - Plans/Plan_To_Node_Compilation.md
  - Plans/Orchestrator_Page.md
```

### GRS-029 - Hands-Off Autonomy And HITL Boundary

```yaml
plan_unit_id: GRS-029
unit_type: requirement
status: accepted
owner_doc: Plans/Goal_Runtime_System.md
canonical_text: >-
  Plans-to-code execution defaults to hands-off autonomy. User escalation is last-resort for critical authority blockers: missing credentials or secrets, billing/payment/legal/license acceptance, unsafe destructive operation, irreversible external side effect, unrecoverable environment failure, true product decision with no inferable answer, or security-sensitive approval. HITL is an explicit setting or mode that can add configured package, seam, or critical checkpoints without becoming required for correctness. Default runtime repair routes ordinary uncertainty through Auditor, Overseer, graph/work/model/source-control/test-harness repair, and high-effort repair before asking the user.
  Configured checkpoints are HITL-only additions, while default escalation remains limited to credentials/secrets, billing/payment/legal/license acceptance, unsafe destructive operation, irreversible external side effect, and security-sensitive approval. Internal repair escalation uses Overseer review and High-Effort Worker routing before user escalation when evidence permits.
gui_related: false
gui_classification_reason: Autonomy, HITL, and escalation policy are runtime/permission behavior.
depends_on: [GRS-027, PS-116, HITL-036]
unblocks: [EP-102, GRS-030, OP-024]
acceptance_criteria:
  - Default mode is hands-off with critical-only user escalation.
  - HITL checkpoints are explicit opt-in behavior, not required correctness gates.
  - Ordinary row-level uncertainty is resolved internally when evidence allows.
validation_surfaces:
  - python3 scripts/pm-plans-verify.py run-gates
  - future autonomy and HITL mode review
risk_class: unnecessary_user_escalation
reasoning_tier: high
context_scope: plans_to_code_autonomy
implementation_surfaces: [Plans/Goal_Runtime_System.md, Plans/Permissions_System.md, Plans/human-in-the-loop.md, Plans/Executor_Protocol.md]
node_compile_hint: {mode: autonomy_hitl_policy, create_worknodes: false}
source_lineage:
  - pldg-20260617-001-plans-to-code-handoff:atom-0044
  - pldg-20260617-001-plans-to-code-handoff:atom-0045
  - pldg-20260617-001-plans-to-code-handoff:atom-0046
  - pldg-20260617-001-plans-to-code-handoff:dec-0019
  - pldg-20260617-001-plans-to-code-handoff:dec-0020
  - pldg-20260617-001-plans-to-code-handoff:corr-0009
preserved_exact_tokens:
  - "HITL"
  - "hands-off"
  - "critical authority blockers"
  - "configured checkpoints"
  - "Overseer review"
  - "High-Effort Worker"
  - "credentials/secrets"
  - "billing/payment/legal/license"
  - "unsafe destructive operation"
  - "irreversible external side effect"
  - "security-sensitive approval"
negative_constraints:
  - Do not ask the user for ordinary row-level uncertainty in default mode.
  - Do not route default failures to user decision before Overseer/Auditor/internal repair paths are exhausted.
owner_hints:
  - Plans/Goal_Runtime_System.md
  - Plans/Permissions_System.md
  - Plans/Executor_Protocol.md
```

### GRS-030 - Plans-To-Code Goal Completion Certification

```yaml
plan_unit_id: GRS-030
unit_type: requirement
status: accepted
owner_doc: Plans/Goal_Runtime_System.md
canonical_text: >-
  Plans-to-code completion requires a GoalCompletionReceipt. Code complete means all WorkNodes are terminal with valid receipts, all required automated tests passed or are explicitly dispositioned, all source-control receipts are valid, rollback and safe-point requirements are satisfied, Auditor passed, no active blockers remain, no stale Plan/WorkGraph/currentness mismatch remains, final source state is clean or intentionally preserved, and final summary/evidence is written. GoalCompletionReceipt fields include rollback_requirements_satisfied, safe_point_requirements_satisfied, no_stale_plan_workgraph_currentness_mismatch, final_source_state, final_summary_ref, child_receipt_refs, worknode_receipt_refs, changed_artifact_refs, validator_outcomes, authority_check_refs, source_control_receipt_refs, test_receipt_refs, model_resolution_receipt_refs, unresolved_risks, and evidence_layers. Worker says done is insufficient; completion must preserve source evidence, canonical Plan evidence, process evidence, governance evidence, test evidence, source-control evidence, and completion receipts as separate truth layers.
  GoalCompletionReceipt certification requires the exact code-complete evidence that all WorkNodes terminal, all automated tests passed or were dispositioned, and no active blockers remain. Plans to code completion is an artifact-backed handoff where Auditor verifies before final certification.
gui_related: false
gui_classification_reason: Completion certification and evidence truth-layer policy are runtime/governance behavior.
depends_on: [GRS-027, GRS-029, EP-103, ATS-004]
unblocks: [RAP-029, CV-289, OP-024]
acceptance_criteria:
  - GoalCompletionReceipt proves code-complete status from objective receipt criteria.
  - Test, source-control, Auditor, blocker, currentness, and final evidence states are checked before completion.
  - Evidence truth layers remain separate and auditable.
validation_surfaces:
  - python3 scripts/pm-plans-verify.py run-gates
  - python3 scripts/pm-plans-verify.py validate-plans-to-code-handoff-schema
risk_class: false_completion
reasoning_tier: high
context_scope: plans_to_code_completion
implementation_surfaces: [Plans/Goal_Runtime_System.md, Plans/Executor_Protocol.md, Plans/Project_Output_Artifacts.md, Plans/Runtime_Artifacts_Panel.md, Plans/plans_to_code_handoff.schema.json]
node_compile_hint: {mode: goal_completion_certification, create_worknodes: false}
source_lineage:
  - pldg-20260617-001-plans-to-code-handoff:atom-0043
  - pldg-20260617-001-plans-to-code-handoff:atom-0055
  - pldg-20260617-001-plans-to-code-handoff:atom-0060
  - pldg-20260617-001-plans-to-code-handoff:dec-0018
  - pldg-20260617-001-plans-to-code-handoff:dec-0023
preserved_exact_tokens:
  - "GoalCompletionReceipt"
  - "code complete"
  - "all WorkNodes terminal"
  - "all automated tests passed"
  - "no active blockers"
  - "source evidence"
  - "canonical evidence"
  - "process evidence"
  - "governance evidence"
  - "test evidence"
  - "source-control evidence"
  - "Plans to code completion"
  - "artifact-backed handoff"
  - "Auditor verifies"
  - "final certification"
negative_constraints:
  - Do not accept worker says done as code completion.
owner_hints:
  - Plans/Goal_Runtime_System.md
  - Plans/Executor_Protocol.md
  - Plans/Project_Output_Artifacts.md
```

ContractRef: ContractName:Plans/Goal_Runtime_System.md, ContractName:Plans/Plan_To_Node_Compilation.md, ContractName:Plans/Models_System.md, ContractName:Plans/Executor_Protocol.md, ContractName:Plans/Project_Output_Artifacts.md


## Ledger Compile Addendum - pldg-20260618-001-prd-planning-wizard

This addendum compiles source-lineage obligations from bootstrap ledger `pldg-20260618-001-prd-planning-wizard` into this existing owner or consumer doc. It does not create WorkNodes, NodeSeeds, executable queues, GoalRuns, implementation files, generated governance artifacts, or production build tasks.

### GRS-031 - Approve And Build Launch, Parallel Enforcement, And Atomic Activation

```yaml
plan_unit_id: GRS-031
unit_type: requirement
status: accepted
owner_doc: Plans/Goal_Runtime_System.md
canonical_text: 'Approve And Build first validates a compare-and-swap approval boundary over the PlanningRun revision, topic map version, immutable pack identity, pack version, pack hash, project-context snapshot hash, PlanUnit index hash, acceptance-unit index hash, testing policy hash, and final audit/closure hash shown in final review. It then atomically writes the immutable pack, approval_cas_receipt, user approval receipt, and PlanApproved transactional-outbox event so approval cannot be committed without a recoverable downstream trigger. PlanApproved uses a deterministic idempotency key derived from project_id, pack_id, pack version, pack hash, and approval CAS inputs; duplicate delivery returns the existing PlanCompileRun rather than creating another run. In the finished-product native runtime contract, ordinary Approve And Build flow immediately creates or resumes exactly one PlanCompileRun and returns its identity synchronously before projection reconciliation; optional HITL checkpoints are policy exceptions, not the default. During the current bootstrap ledger-to-Plans lane, this remains product-runtime canon and does not launch PlanCompile. For broad stages the controller computes a bounded worklist and mandatory minimum parallel assignments, launches read-only subagents, records assignment and completion receipts, and rejects certification when required parallel work is absent. A required broad stage may reduce scope or block with a typed runtime-capability
  error, but it may not silently substitute one broad agent for mandatory parallel analysis or review. Activation requires all required active-scope WorkNodeRequests to be accepted together; optional work must be explicitly excluded or deferred before activation, and a mixed result cannot silently start a partial build. After provisioning acceptance, one activation transaction creates or binds the GoalRun in activating state, installs the certified WorkGraph revision, materializes all WorkNodes, queues runnable entrypoints, records the activation receipt, and writes GoalRunStarted or BuildStarted through a transactional outbox. Orchestrator may show launch and provisioning progress before activation, but it marks the build running and exposes runnable WorkNodes only after the atomic activation commit and durable start receipt. Activation persists activation_pending, records_materialized, entrypoints_queued, start_event_pending, active, and cancelled_before_mutation
  states; retries resume idempotently, duplicate commands return the existing GoalRun, and cancellation routes according to whether mutation began. Planning Wizard uses current Goal Runtime and Auditor-based AuditCycle, AuditFinding, RepairAttempt, AuditClosure, and CertificationReceipt records rather than superseded experimental workflow machinery. The final audit controller must launch multiple bounded read-only specialist agents in parallel for distinct defect families, persist assignments and results, reduce findings, run bounded repairs, and re-audit until all findings are durably closed or a true typed blocker remains. Audit and repair subagents inspect, classify, compare, and propose; the Planning Run controller or assigned canonical artifact owner performs serialized writes, updates closures, and issues certification. Classify gaps as auto_resolvable, safe_default_with_assumption, defer_to_plan_compile, defer_to_worknode_system, requires_user_policy_decision,
  requires_user_risk_acceptance, requires_external_credential, or true infrastructure/runtime blocker.'
gui_related: true
gui_classification_reason: Includes user-visible GUI/workspace/command/projection behavior.
depends_on: []
unblocks: []
acceptance_criteria:
- The live owner doc preserves every source atom listed in source_atom_ids without treating the ledger as canonical product prose.
- Exact tokens, negative constraints, owner hints, and accepted corrections remain available to future audits through this PlanUnit.
- No WorkNodes, NodeSeeds, executable queues, GoalRuns, implementation files, generated governance artifacts, or production build tasks are created by this compile.
- Approve And Build records an approval CAS receipt and fails closed when final-review currentness inputs drift.
- The PlanCompileRun identity is created or returned synchronously; projection identity reconciliation cannot be the source of run identity truth.
- "`cmd.runtime.approve` consumes canonical approval/currentness inputs, records UICommandResponse and approval/dispatch receipt refs, and emits only canonical runtime events or explicit receipts, never `runtime.command_applied`."
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260618-001-prd-planning-wizard
risk_class: stale_or_forbidden_behavior
reasoning_tier: high
context_scope: ledger_to_plans_compile
implementation_surfaces:
- Plans/Goal_Runtime_System.md
- Plans/Contracts_V0.md
- Plans/Planning_Wizard.md
- Plans/Plan_To_Node_Compilation.md
- Plans/Executor_Protocol.md
- Plans/Orchestrator_Page.md
- Plans/human-in-the-loop.md
node_compile_hint:
  mode: canonical_planunit_from_bootstrap_ledger
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260618-001-prd-planning-wizard:atom-0104
- pldg-20260618-001-prd-planning-wizard:atom-0105
- pldg-20260618-001-prd-planning-wizard:atom-0106
- pldg-20260618-001-prd-planning-wizard:atom-0114
- pldg-20260618-001-prd-planning-wizard:atom-0115
- pldg-20260618-001-prd-planning-wizard:atom-0120
- pldg-20260618-001-prd-planning-wizard:atom-0125
- pldg-20260618-001-prd-planning-wizard:atom-0126
- pldg-20260618-001-prd-planning-wizard:atom-0127
- pldg-20260618-001-prd-planning-wizard:atom-0130
- pldg-20260618-001-prd-planning-wizard:atom-0133
- pldg-20260618-001-prd-planning-wizard:atom-0135
- pldg-20260618-001-prd-planning-wizard:atom-0143
- Plans/ledgers/v2/pldg-20260618-001-prd-planning-wizard/source_shards/06-approve-build-plan-compile-worknodes.md#SRC-COMPILE
- Plans/ledgers/v2/pldg-20260618-001-prd-planning-wizard/source_shards/07-audit-readiness-and-safety.md#SRC-AUDIT
source_atom_ids:
- atom-0104
- atom-0105
- atom-0106
- atom-0114
- atom-0115
- atom-0120
- atom-0125
- atom-0126
- atom-0127
- atom-0130
- atom-0133
- atom-0135
- atom-0143
decision_refs:
- dec-0021
- dec-0023
- dec-0025
- dec-0026
correction_refs:
- corr-0008
- corr-0009
preserved_exact_tokens:
- PlanApproved
- approval_cas_receipt
- transactional outbox
- idempotency_key
- project_id
- pack_hash
- PlanningRun revision
- topic map version
- project-context snapshot hash
- automatic_after_approval
- PlanCompileRun
- minimum_parallel_assignments
- assignment receipt
- completion receipt
- parallelism_required
- runtime-capability blocker
- all required active-scope
- mixed
- GoalRunStarted
- BuildStarted
- activation transaction
- activation commit
- running
- activation_pending
- records_materialized
- entrypoints_queued
- cancelled_before_mutation
- AuditCycle
- AuditFinding
- RepairAttempt
- AuditClosure
- CertificationReceipt
- multiple bounded read-only specialist agents in parallel
- durably closed
- sole writer
- serialized writes
- auto_resolvable
- safe_default_with_assumption
- requires_user_risk_acceptance
negative_constraints:
- Do not require a redundant ordinary Start Build confirmation after Approve And Build.
- Do not approve stale final-review inputs or defer PlanCompileRun identity creation to projection reconciliation.
- Do not accept agent self-report as proof that required parallel subagents were used.
- Do not silently degrade a mandatory parallel stage to one agent.
- Do not start a partially accepted required WorkGraph.
- Do not make superseded experimental pipeline artifacts part of the product audit architecture.
- Do not certify a broad final audit performed by one agent when parallel specialist review is required.
- Do not allow parallel repair subagents to race canonical Plan writes.
owner_hints:
- Plans/Contracts_V0.md
- Plans/Goal_Runtime_System.md
- Plans/Planning_Wizard.md
- Plans/Plan_To_Node_Compilation.md
- Plans/Executor_Protocol.md
- Plans/Orchestrator_Page.md
- Plans/human-in-the-loop.md
```

## Ledger Compile Addendum - pldg-20260703-001-feature-intake

This addendum compiles source-lineage obligations from bootstrap ledger `pldg-20260703-001-feature-intake` into this owner doc. The ledger remains source/planning memory; these PlanUnits are the live canonical evidence. This compile does not create WorkNodes, NodeSeeds, executable queues, implementation files, production build tasks, generated governance artifacts, or a governance seal.

### GRS-033 - P1-AGENT-FOCUS-WATCHDOG

```yaml
plan_unit_id: GRS-033
unit_type: requirement
status: accepted
owner_doc: Plans/Goal_Runtime_System.md
canonical_text: >-
  P1-AGENT-FOCUS-WATCHDOG (P1) is compiled as canonical Puppet Master intent for Agent focus/progress watchdog for GUI: Add AgentProgressHeartbeat event and Focus/Attention state for GoalRuns and terminal-bound agents. The preserved PM gap/delta is: Need GUI-visible per-agent watchdog: last action, last terminal snapshot, expected next check, stalled state, and user steering. The observed external-repo signal remains source-lineage evidence: Warp issue list includes agent loses focus/stops work; Codex goal docs recommend compact progress reports with current checkpoint/verified/remains/blocked; Cline has repeating tasks/stuck thinking reports.
gui_related: true
gui_classification_reason: User-visible GUI, built-in terminal, accessibility, visual, multimodal, or desktop surface is directly implicated.
depends_on:
- PDS-003
- PNC-001
unblocks: []
acceptance_criteria:
- Long-running shell command exposes next-check countdown and manual snapshot trigger.
- Agent stalled/no-heartbeat surfaces as attention_required without losing terminal session.
- No WorkNodes, NodeSeeds, executable queues, implementation files, production build tasks, generated governance artifacts, or governance seal outputs are created by this compile.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260703-001-feature-intake
- Long-running shell command exposes next-check countdown and manual snapshot trigger.
- Agent stalled/no-heartbeat surfaces as attention_required without losing terminal session.
risk_class: p1_agent_control_subagents_hardening
reasoning_tier: standard
context_scope: agent_control_subagents
implementation_surfaces:
- Plans/Goal_Runtime_System.md
- Plans/Runtime_Artifacts_Panel.md
- Plans/Section15_MVP_Promoted_Features_Spec.md
node_compile_hint:
  mode: p1_agent_focus_watchdog
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260703-001-feature-intake:atom-0021
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/records/design_atoms.jsonl:atom-0021
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0017/P1-AGENT-FOCUS-WATCHDOG@line=17
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0017/P1-AGENT-FOCUS-WATCHDOG
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/01_FULL_SOURCE_PACKET.md
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/04_EVIDENCE_REGISTRY.json
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/raw_source_artifacts/pm_external_repo_action_backlog_2026-07-03.jsonl:17
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/01_FULL_SOURCE_PACKET.md:833-1329
source_atom_ids:
- atom-0021
external_atom_id: extrepo-20260703-0017
source_row_id: P1-AGENT-FOCUS-WATCHDOG
priority: P1
finding_family: Agent focus/progress watchdog for GUI
source_repos:
- warpdotdev/warp
- cline/cline
- openai/codex
target_docs:
- Plans/Goal_Runtime_System.md
- Plans/Runtime_Artifacts_Panel.md
- Plans/Section15_MVP_Promoted_Features_Spec.md
owner_hints:
- Plans/Goal_Runtime_System.md
- Plans/Runtime_Artifacts_Panel.md
- Plans/Section15_MVP_Promoted_Features_Spec.md
preserved_exact_tokens:
- extrepo-20260703-0017
- P1-AGENT-FOCUS-WATCHDOG
- P1
- Agent focus/progress watchdog for GUI
- warpdotdev/warp
- cline/cline
- openai/codex
negative_constraints: []
observed_signal: Warp issue list includes agent loses focus/stops work; Codex goal docs recommend compact progress reports with current checkpoint/verified/remains/blocked; Cline has repeating tasks/stuck thinking reports.
pm_current_coverage: PM has Goal Runtime and closure registry concepts, but terminal/dev-loop progress integration can be stronger.
pm_gap_or_delta: 'Need GUI-visible per-agent watchdog: last action, last terminal snapshot, expected next check, stalled state, and user steering.'
proposal_or_recommendation: Add AgentProgressHeartbeat event and Focus/Attention state for GoalRuns and terminal-bound agents.
compile_disposition: create_new_planunit
```

### GRS-034 - P1-INTERRUPT-CANCEL-SETTLEMENT

```yaml
plan_unit_id: GRS-034
unit_type: requirement
status: accepted
owner_doc: Plans/Goal_Runtime_System.md
canonical_text: >-
  P1-INTERRUPT-CANCEL-SETTLEMENT (P1) is compiled as canonical Puppet Master intent for User stop/interrupt halts active agent and tools safely: Imported external-repo finding extrepo-20260703-0028 / P1-INTERRUPT-CANCEL-SETTLEMENT (P1). The preserved PM gap/delta is: Define cancellation propagation and settlement: provider stream, subprocess, MCP call, browser/device, child run; no conversion to success/failure; history interruption boundary. The observed external-repo signal remains source-lineage evidence: Agent Zero issue requests stop/interrupt for active chat/tool calls without container restart and with history preserved; OpenCode v2 includes sessions.interrupt and Effect interruption.
gui_related: true
gui_classification_reason: Target docs include GUI/UI command or user-visible surfaces; mixed work is conservatively GUI-related.
depends_on:
- PDS-003
- PNC-001
unblocks: []
acceptance_criteria:
- Stop active MCP call leaves partial/cancelled result
- Stop provider stream does not replay unfinished assistant/tool turn
- UI returns idle with preserved history
- No WorkNodes, NodeSeeds, executable queues, implementation files, production build tasks, generated governance artifacts, or governance seal outputs are created by this compile.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260703-001-feature-intake
- Stop active MCP call leaves partial/cancelled result
- Stop provider stream does not replay unfinished assistant/tool turn
- UI returns idle with preserved history
risk_class: p1_mcp_tools_and_tool_settlement_hardening
reasoning_tier: standard
context_scope: mcp_tools_and_tool_settlement
implementation_surfaces:
- Plans/Goal_Runtime_System.md
- Plans/Tools.md
- Plans/Executor_Protocol.md
- Plans/assistant-chat-design.md
node_compile_hint:
  mode: p1_interrupt_cancel_settlement
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260703-001-feature-intake:atom-0032
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/records/design_atoms.jsonl:atom-0032
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0028/P1-INTERRUPT-CANCEL-SETTLEMENT@line=28
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0028/P1-INTERRUPT-CANCEL-SETTLEMENT
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/01_FULL_SOURCE_PACKET.md
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/04_EVIDENCE_REGISTRY.json
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/raw_source_artifacts/pm_second_pass_delta_backlog_2026-07-03.jsonl:8
source_atom_ids:
- atom-0032
external_atom_id: extrepo-20260703-0028
source_row_id: P1-INTERRUPT-CANCEL-SETTLEMENT
priority: P1
finding_family: User stop/interrupt halts active agent and tools safely
source_repos:
- agent0ai/agent-zero
- anomalyco/opencode
target_docs:
- Plans/Goal_Runtime_System.md
- Plans/Tools.md
- Plans/Executor_Protocol.md
- Plans/assistant-chat-design.md
owner_hints:
- Plans/Goal_Runtime_System.md
- Plans/Tools.md
- Plans/Executor_Protocol.md
- Plans/assistant-chat-design.md
preserved_exact_tokens:
- extrepo-20260703-0028
- P1-INTERRUPT-CANCEL-SETTLEMENT
- P1
- User stop/interrupt halts active agent and tools safely
- agent0ai/agent-zero
- anomalyco/opencode
negative_constraints: []
observed_signal: Agent Zero issue requests stop/interrupt for active chat/tool calls without container restart and with history preserved; OpenCode v2 includes sessions.interrupt and Effect interruption.
pm_current_coverage: Tools has cancelled normalized outcome and terminal/session actions exist.
pm_gap_or_delta: 'Define cancellation propagation and settlement: provider stream, subprocess, MCP call, browser/device, child run; no conversion to success/failure; history interruption boundary.'
compile_disposition: create_new_planunit
```

### GRS-035 - P0-AGENT-CONTROL-PLANE-ENVELOPE

```yaml
plan_unit_id: GRS-035
unit_type: requirement
status: accepted
owner_doc: Plans/Goal_Runtime_System.md
canonical_text: >-
  P0-AGENT-CONTROL-PLANE-ENVELOPE (P0) is compiled as canonical Puppet Master intent for Agent control / autonomy / effort / resource envelope: Define AgentControlEnvelope with autonomy_mode, write_surface, provider/model/effort policy, tool/MCP permission ceiling, context/token budgets, loop budgets, wall-clock budgets, terminal/browser/device authority, child-spawn policy, cancellation/steering semantics, progress heartbeat, and receipt refs. The preserved PM gap/delta is: Controls are strong but scattered. PM needs one runtime envelope every main agent, subagent, delegated thread, background goal, terminal-bound task, browser/device session, and provider attempt must carry. The observed external-repo signal remains source-lineage evidence: Repeated failures cluster around agents/subagents inheriting wrong model or reasoning effort, running in circles, spending uncontrolled budget, or continuing after transport/tool failure. OpenCode and Codex show model/effort propagation confusion; Cline
  and Agent Zero show loop/spend/resource failures; Warp/Codex show UI/runtime stall modes.
gui_related: true
gui_classification_reason: User-visible GUI, built-in terminal, accessibility, visual, multimodal, or desktop surface is directly implicated.
depends_on:
- PDS-003
- PNC-001
unblocks: []
acceptance_criteria:
- Every child run persists AgentControlEnvelope before first provider/tool call.
- GUI can show requested/effective autonomy, model, effort, budgets, and authority.
- A child/subagent cannot exceed parent ceiling even if model/tool output requests it.
- Completion receipts include envelope hash and final budget state.
- No WorkNodes, NodeSeeds, executable queues, implementation files, production build tasks, generated governance artifacts, or governance seal outputs are created by this compile.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260703-001-feature-intake
- Every child run persists AgentControlEnvelope before first provider/tool call.
- GUI can show requested/effective autonomy, model, effort, budgets, and authority.
- A child/subagent cannot exceed parent ceiling even if model/tool output requests it.
- Completion receipts include envelope hash and final budget state.
risk_class: p0_agent_control_subagents_hardening
reasoning_tier: high
context_scope: agent_control_subagents
implementation_surfaces:
- Plans/Goal_Runtime_System.md
- Plans/Models_System.md
- Plans/Executor_Protocol.md
- Plans/Tools.md
- Plans/FinalGUISpec.md
- Plans/storage-plan.md
node_compile_hint:
  mode: p0_agent_control_plane_envelope
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260703-001-feature-intake:atom-0059
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/records/design_atoms.jsonl:atom-0059
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0055/P0-AGENT-CONTROL-PLANE-ENVELOPE@line=55
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0055/P0-AGENT-CONTROL-PLANE-ENVELOPE
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/01_FULL_SOURCE_PACKET.md
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/04_EVIDENCE_REGISTRY.json
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/raw_source_artifacts/pm_missed_domains_backlog_2026-07-03.jsonl:1
source_atom_ids:
- atom-0059
external_atom_id: extrepo-20260703-0055
source_row_id: P0-AGENT-CONTROL-PLANE-ENVELOPE
priority: P0
finding_family: Agent control / autonomy / effort / resource envelope
source_repos:
- OpenCode
- Cline
- Agent Zero
- Pi
- Codex
- Warp
target_docs:
- Plans/Goal_Runtime_System.md
- Plans/Models_System.md
- Plans/Executor_Protocol.md
- Plans/Tools.md
- Plans/FinalGUISpec.md
- Plans/storage-plan.md
owner_hints:
- Plans/Goal_Runtime_System.md
- Plans/Models_System.md
- Plans/Executor_Protocol.md
- Plans/Tools.md
- Plans/FinalGUISpec.md
- Plans/storage-plan.md
preserved_exact_tokens:
- extrepo-20260703-0055
- P0-AGENT-CONTROL-PLANE-ENVELOPE
- P0
- Agent control / autonomy / effort / resource envelope
- OpenCode
- Cline
- Agent Zero
- Pi
- Codex
- Warp
negative_constraints: []
observed_signal: Repeated failures cluster around agents/subagents inheriting wrong model or reasoning effort, running in circles, spending uncontrolled budget, or continuing after transport/tool failure. OpenCode and Codex show model/effort propagation confusion; Cline and Agent Zero show loop/spend/resource failures; Warp/Codex show UI/runtime stall modes.
pm_current_coverage: PM already has Goal Runtime role-policy, progress fingerprints, hard budgets, parent/child goals, verification repair loop, provider/model requested/effective identity, and approval boundaries.
pm_gap_or_delta: Controls are strong but scattered. PM needs one runtime envelope every main agent, subagent, delegated thread, background goal, terminal-bound task, browser/device session, and provider attempt must carry.
proposal_or_recommendation: Define AgentControlEnvelope with autonomy_mode, write_surface, provider/model/effort policy, tool/MCP permission ceiling, context/token budgets, loop budgets, wall-clock budgets, terminal/browser/device authority, child-spawn policy, cancellation/steering semantics, progress heartbeat, and receipt refs.
compile_disposition: create_new_planunit
```

### GRS-036 - P0-SUBAGENT-EXECUTION-CONTRACT

```yaml
plan_unit_id: GRS-036
unit_type: requirement
status: accepted
owner_doc: Plans/Goal_Runtime_System.md
canonical_text: >-
  P0-SUBAGENT-EXECUTION-CONTRACT (P0) is compiled as canonical Puppet Master intent for Subagent lifecycle, model/effort config, and result authority: Define SubagentExecutionContract and SubagentResultEnvelope. Child result is advisory unless marked allowed_to_write=false/true under parent policy; parent remains the only canonical writer where required. Include per-child model/effort settlement, context slice hash, tool ceiling, timeout, wait_agent/cancel semantics, and orphan reaper. The preserved PM gap/delta is: PM needs a single child execution lifecycle independent of prompt packets: spawn, admitted context, first event, heartbeat, partial result, await, cancellation, orphan reap, result settlement, and parent completion gating. The observed external-repo signal remains source-lineage evidence: Codex and OpenCode expose custom/subagent model and reasoning config gaps; Cline temporarily disabled/stabilized subagents in the SDK migration and has loop reports; Agent Zero release notes
  show child chats/parallel tools and non-destructive await timeouts.
gui_related: true
gui_classification_reason: User-visible GUI, built-in terminal, accessibility, visual, multimodal, or desktop surface is directly implicated.
depends_on:
- PDS-003
- PNC-001
unblocks: []
acceptance_criteria:
- A child can use a different allowed model/effort only if settlement proves it.
- Parent cannot certify complete until all required child results are settled or explicitly waived.
- Orphan helpers/processes are reaped on session close/crash/restart.
- Subagent loops trip per-child and aggregate budgets.
- No WorkNodes, NodeSeeds, executable queues, implementation files, production build tasks, generated governance artifacts, or governance seal outputs are created by this compile.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260703-001-feature-intake
- A child can use a different allowed model/effort only if settlement proves it.
- Parent cannot certify complete until all required child results are settled or explicitly waived.
- Orphan helpers/processes are reaped on session close/crash/restart.
- Subagent loops trip per-child and aggregate budgets.
risk_class: p0_provider_capability_and_metadata_hardening
reasoning_tier: high
context_scope: provider_capability_and_metadata
implementation_surfaces:
- Plans/Goal_Runtime_System.md
- Plans/Tools.md
- Plans/Executor_Protocol.md
- Plans/storage-plan.md
- Plans/FinalGUISpec.md
node_compile_hint:
  mode: p0_subagent_execution_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260703-001-feature-intake:atom-0061
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/records/design_atoms.jsonl:atom-0061
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0057/P0-SUBAGENT-EXECUTION-CONTRACT@line=57
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0057/P0-SUBAGENT-EXECUTION-CONTRACT
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/01_FULL_SOURCE_PACKET.md
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/04_EVIDENCE_REGISTRY.json
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/raw_source_artifacts/pm_missed_domains_backlog_2026-07-03.jsonl:3
source_atom_ids:
- atom-0061
external_atom_id: extrepo-20260703-0057
source_row_id: P0-SUBAGENT-EXECUTION-CONTRACT
priority: P0
finding_family: Subagent lifecycle, model/effort config, and result authority
source_repos:
- Codex
- OpenCode
- Cline
- Agent Zero
target_docs:
- Plans/Goal_Runtime_System.md
- Plans/Tools.md
- Plans/Executor_Protocol.md
- Plans/storage-plan.md
- Plans/FinalGUISpec.md
owner_hints:
- Plans/Goal_Runtime_System.md
- Plans/Tools.md
- Plans/Executor_Protocol.md
- Plans/storage-plan.md
- Plans/FinalGUISpec.md
preserved_exact_tokens:
- extrepo-20260703-0057
- P0-SUBAGENT-EXECUTION-CONTRACT
- P0
- Subagent lifecycle, model/effort config, and result authority
- Codex
- OpenCode
- Cline
- Agent Zero
negative_constraints: []
observed_signal: Codex and OpenCode expose custom/subagent model and reasoning config gaps; Cline temporarily disabled/stabilized subagents in the SDK migration and has loop reports; Agent Zero release notes show child chats/parallel tools and non-destructive await timeouts.
pm_current_coverage: PM has parent/child goal runtime policy, canonical child run identity for subagents, and prompt-packet subagent hard gates.
pm_gap_or_delta: 'PM needs a single child execution lifecycle independent of prompt packets: spawn, admitted context, first event, heartbeat, partial result, await, cancellation, orphan reap, result settlement, and parent completion gating.'
proposal_or_recommendation: Define SubagentExecutionContract and SubagentResultEnvelope. Child result is advisory unless marked allowed_to_write=false/true under parent policy; parent remains the only canonical writer where required. Include per-child model/effort settlement, context slice hash, tool ceiling, timeout, wait_agent/cancel semantics, and orphan reaper.
compile_disposition: create_new_planunit
```

### GRS-037 - P0-LOOP-BREAKER-TAXONOMY

```yaml
plan_unit_id: GRS-037
unit_type: requirement
status: accepted
owner_doc: Plans/Goal_Runtime_System.md
canonical_text: >-
  P0-LOOP-BREAKER-TAXONOMY (P0) is compiled as canonical Puppet Master intent for Looping / no-progress / spend control: Add LoopBreakerRegistry with typed families: identical_tool_failure, empty_assistant, no_tool_progress, repeated_edit_miss, compaction_no_gain, context_overflow_replay, MCP_resource_missing, first_event_timeout, transport_idle, reasoning_no_action, subagent_same_read, and spend_anomaly. Each family has fingerprint, max_count, required observation window, terminal action, and user-facing reason. The preserved PM gap/delta is: The same simple identical-failure triple will not catch compaction loops, empty assistant loops, tool-result loops, failed edit loops, prompt-cache churn, first-event hangs, no-progress reasoning, and repeated subagent file-read loops. The observed external-repo signal remains source-lineage evidence: OpenCode reports empty assistant loops, MCP resource-list spend loops, compaction loops, truncated tool-call repair loops, failed edit loops, and thinking-only
  loops. Cline reports truncated tool-call and no-match loops. Agent Zero reports monologue/tool loops. Pi reports hung tools/transport first-event hangs.
gui_related: true
gui_classification_reason: User-visible GUI, built-in terminal, accessibility, visual, multimodal, or desktop surface is directly implicated.
depends_on:
- PDS-003
- PNC-001
unblocks: []
acceptance_criteria:
- Fixtures for each loop family stop within bounded attempts.
- Spend/quota caps terminate even when model output appears syntactically successful.
- Compaction can run once or configured bounded times but cannot self-loop indefinitely.
- GUI shows stopped_for_loop with fingerprint and last safe point.
- No WorkNodes, NodeSeeds, executable queues, implementation files, production build tasks, generated governance artifacts, or governance seal outputs are created by this compile.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260703-001-feature-intake
- Fixtures for each loop family stop within bounded attempts.
- Spend/quota caps terminate even when model output appears syntactically successful.
- Compaction can run once or configured bounded times but cannot self-loop indefinitely.
- GUI shows stopped_for_loop with fingerprint and last safe point.
risk_class: p0_agent_control_subagents_hardening
reasoning_tier: high
context_scope: agent_control_subagents
implementation_surfaces:
- Plans/Goal_Runtime_System.md
- Plans/Executor_Protocol.md
- Plans/Tools.md
- Plans/Provider_OpenCode.md
- Plans/FinalGUISpec.md
node_compile_hint:
  mode: p0_loop_breaker_taxonomy
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260703-001-feature-intake:atom-0062
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/records/design_atoms.jsonl:atom-0062
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0058/P0-LOOP-BREAKER-TAXONOMY@line=58
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0058/P0-LOOP-BREAKER-TAXONOMY
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/01_FULL_SOURCE_PACKET.md
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/04_EVIDENCE_REGISTRY.json
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/raw_source_artifacts/pm_missed_domains_backlog_2026-07-03.jsonl:4
source_atom_ids:
- atom-0062
external_atom_id: extrepo-20260703-0058
source_row_id: P0-LOOP-BREAKER-TAXONOMY
priority: P0
finding_family: Looping / no-progress / spend control
source_repos:
- OpenCode
- Cline
- Agent Zero
- Pi
- Codex
target_docs:
- Plans/Executor_Protocol.md
- Plans/Goal_Runtime_System.md
- Plans/Tools.md
- Plans/Provider_OpenCode.md
- Plans/FinalGUISpec.md
owner_hints:
- Plans/Executor_Protocol.md
- Plans/Goal_Runtime_System.md
- Plans/Tools.md
- Plans/Provider_OpenCode.md
- Plans/FinalGUISpec.md
preserved_exact_tokens:
- extrepo-20260703-0058
- P0-LOOP-BREAKER-TAXONOMY
- P0
- Looping / no-progress / spend control
- OpenCode
- Cline
- Agent Zero
- Pi
- Codex
negative_constraints: []
observed_signal: OpenCode reports empty assistant loops, MCP resource-list spend loops, compaction loops, truncated tool-call repair loops, failed edit loops, and thinking-only loops. Cline reports truncated tool-call and no-match loops. Agent Zero reports monologue/tool loops. Pi reports hung tools/transport first-event hangs.
pm_current_coverage: Executor has doom-loop guard and Goal Runtime has progress fingerprints, budgets, and verification repair loop.
pm_gap_or_delta: The same simple identical-failure triple will not catch compaction loops, empty assistant loops, tool-result loops, failed edit loops, prompt-cache churn, first-event hangs, no-progress reasoning, and repeated subagent file-read loops.
proposal_or_recommendation: 'Add LoopBreakerRegistry with typed families: identical_tool_failure, empty_assistant, no_tool_progress, repeated_edit_miss, compaction_no_gain, context_overflow_replay, MCP_resource_missing, first_event_timeout, transport_idle, reasoning_no_action, subagent_same_read, and spend_anomaly. Each family has fingerprint, max_count, required observation window, terminal action, and user-facing reason.'
compile_disposition: create_new_planunit
```

### GRS-038 - P0-GOAL-SCOPE-SUBAGENT-ISOLATION

```yaml
plan_unit_id: GRS-038
unit_type: requirement
status: accepted
owner_doc: Plans/Goal_Runtime_System.md
canonical_text: >-
  P0-GOAL-SCOPE-SUBAGENT-ISOLATION (P0) is compiled as canonical Puppet Master intent for Goal/subagent identity leakage and rogue continuation: Imported external-repo finding extrepo-20260703-0075 / P0-GOAL-SCOPE-SUBAGENT-ISOLATION (P0). The preserved PM gap/delta is: AgentControlEnvelope covered authority, but not enough about inheritable goal identity, child-agent leases, or proving that a child cannot resume/advance the parent goal. The observed external-repo signal remains source-lineage evidence: Codex issue #25472 reports subagents reactivating a long-running goal and behaving like the main thread. | Codex changelog has multiple goal/subagent/session persistence and terminal-subagent error propagation fixes. | PM already has subagent hard gates, but needs runtime-level goal leases rather than prompt-only role instructions.
gui_related: true
gui_classification_reason: User-visible GUI, built-in terminal, accessibility, visual, multimodal, or desktop surface is directly implicated.
depends_on:
- PDS-003
- PNC-001
unblocks: []
acceptance_criteria:
- Every subagent receives a ChildAgentLease with parent_goal_id, allowed_phase, read/write mode, max_depth, cannot_resume_parent_goal=true, and terminal return channel.
- A child/subagent cannot spawn further agents unless its lease explicitly grants delegation_depth > 0.
- Parent sees child terminal errors as typed failed outcomes, never empty successful completion.
- Subagent cache/context lineage is separate from parent stable-prefix/cache lineage unless explicitly linked by a receipt.
- No WorkNodes, NodeSeeds, executable queues, implementation files, production build tasks, generated governance artifacts, or governance seal outputs are created by this compile.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260703-001-feature-intake
- Every subagent receives a ChildAgentLease with parent_goal_id, allowed_phase, read/write mode, max_depth, cannot_resume_parent_goal=true, and terminal return channel.
- A child/subagent cannot spawn further agents unless its lease explicitly grants delegation_depth > 0.
- Parent sees child terminal errors as typed failed outcomes, never empty successful completion.
- Subagent cache/context lineage is separate from parent stable-prefix/cache lineage unless explicitly linked by a receipt.
risk_class: p0_agent_control_subagents_hardening
reasoning_tier: high
context_scope: agent_control_subagents
implementation_surfaces:
- Plans/Goal_Runtime_System.md
node_compile_hint:
  mode: p0_goal_scope_subagent_isolation
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260703-001-feature-intake:atom-0079
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/records/design_atoms.jsonl:atom-0079
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0075/P0-GOAL-SCOPE-SUBAGENT-ISOLATION@line=75
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0075/P0-GOAL-SCOPE-SUBAGENT-ISOLATION
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/01_FULL_SOURCE_PACKET.md
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/04_EVIDENCE_REGISTRY.json
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/raw_source_artifacts/pm_final_external_repo_closure_backlog_2026-07-03.jsonl:2
source_atom_ids:
- atom-0079
external_atom_id: extrepo-20260703-0075
source_row_id: P0-GOAL-SCOPE-SUBAGENT-ISOLATION
priority: P0
finding_family: Goal/subagent identity leakage and rogue continuation
target_docs:
- Goal_Runtime_System.md
- orchestrator-subagent-integration.md
- Orchestrator_Page.md
- Contracts_V0.md
- FinalGUISpec.md
owner_hints:
- Goal_Runtime_System.md
- orchestrator-subagent-integration.md
- Orchestrator_Page.md
- Contracts_V0.md
- FinalGUISpec.md
preserved_exact_tokens:
- extrepo-20260703-0075
- P0-GOAL-SCOPE-SUBAGENT-ISOLATION
- P0
- Goal/subagent identity leakage and rogue continuation
negative_constraints: []
observed_signal: 'Codex issue #25472 reports subagents reactivating a long-running goal and behaving like the main thread. | Codex changelog has multiple goal/subagent/session persistence and terminal-subagent error propagation fixes. | PM already has subagent hard gates, but needs runtime-level goal leases rather than prompt-only role instructions.'
pm_gap_or_delta: AgentControlEnvelope covered authority, but not enough about inheritable goal identity, child-agent leases, or proving that a child cannot resume/advance the parent goal.
relationship_to_prior_reports: Sharpens AgentControlEnvelope and SubagentExecutionContract into an isolation primitive.
compile_disposition: create_new_planunit
```

### GRS-039 - P1-EXTERNAL-AGENT-HANDOFF-IMPORT

```yaml
plan_unit_id: GRS-039
unit_type: requirement
status: accepted
owner_doc: Plans/Goal_Runtime_System.md
canonical_text: >-
  P1-EXTERNAL-AGENT-HANDOFF-IMPORT (P1) is compiled as canonical Puppet Master intent for Third-party agent import, continuation, and session provenance: Imported external-repo finding extrepo-20260703-0085 / P1-EXTERNAL-AGENT-HANDOFF-IMPORT (P1). The preserved PM gap/delta is: MCP/import config provenance was covered, but PM should also treat external agent sessions as imported runtimes with provenance and continuation contracts. The observed external-repo signal remains source-lineage evidence: Warp supports third-party CLI agents, custom routers, local continuation when a cloud run is interrupted, and structured CLI-agent notifications. | Codex changelog records external agent import results and Claude Code import support. | Cline/OpenCode configs and MCP ecosystems encourage cross-tool state/config reuse.
gui_related: true
gui_classification_reason: User-visible GUI, built-in terminal, accessibility, visual, multimodal, or desktop surface is directly implicated.
depends_on:
- PDS-003
- PNC-001
unblocks: []
acceptance_criteria:
- Imported external-agent session has source tool/version, authority surface, context lineage, credential handling, cwd/worktree, terminal/session transcript, and continuation mode.
- Cloud-to-local or local-to-cloud continuation changes authority/cache/tool/session epoch and must be displayed.
- External agent output/tool requests enter PM as untrusted until settled by PM receipts.
- No WorkNodes, NodeSeeds, executable queues, implementation files, production build tasks, generated governance artifacts, or governance seal outputs are created by this compile.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260703-001-feature-intake
- Imported external-agent session has source tool/version, authority surface, context lineage, credential handling, cwd/worktree, terminal/session transcript, and continuation mode.
- Cloud-to-local or local-to-cloud continuation changes authority/cache/tool/session epoch and must be displayed.
- External agent output/tool requests enter PM as untrusted until settled by PM receipts.
risk_class: p1_agent_control_subagents_hardening
reasoning_tier: standard
context_scope: agent_control_subagents
implementation_surfaces:
- Plans/Goal_Runtime_System.md
node_compile_hint:
  mode: p1_external_agent_handoff_import
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260703-001-feature-intake:atom-0089
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/records/design_atoms.jsonl:atom-0089
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0085/P1-EXTERNAL-AGENT-HANDOFF-IMPORT@line=85
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0085/P1-EXTERNAL-AGENT-HANDOFF-IMPORT
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/01_FULL_SOURCE_PACKET.md
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/04_EVIDENCE_REGISTRY.json
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/raw_source_artifacts/pm_final_external_repo_closure_backlog_2026-07-03.jsonl:12
source_atom_ids:
- atom-0089
external_atom_id: extrepo-20260703-0085
source_row_id: P1-EXTERNAL-AGENT-HANDOFF-IMPORT
priority: P1
finding_family: Third-party agent import, continuation, and session provenance
target_docs:
- Goal_Runtime_System.md
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Provider_OpenCode.md
- MCP_Integration.md
- FinalGUISpec.md
owner_hints:
- Goal_Runtime_System.md
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Provider_OpenCode.md
- MCP_Integration.md
- FinalGUISpec.md
preserved_exact_tokens:
- extrepo-20260703-0085
- P1-EXTERNAL-AGENT-HANDOFF-IMPORT
- P1
- Third-party agent import, continuation, and session provenance
negative_constraints: []
observed_signal: Warp supports third-party CLI agents, custom routers, local continuation when a cloud run is interrupted, and structured CLI-agent notifications. | Codex changelog records external agent import results and Claude Code import support. | Cline/OpenCode configs and MCP ecosystems encourage cross-tool state/config reuse.
pm_gap_or_delta: MCP/import config provenance was covered, but PM should also treat external agent sessions as imported runtimes with provenance and continuation contracts.
relationship_to_prior_reports: Extends external config provenance into full session handoff.
compile_disposition: create_new_planunit
```

### GRS-040 - GRS-040

```yaml
plan_unit_id: GRS-040
unit_type: constraint
status: accepted
owner_doc: Plans/Goal_Runtime_System.md
canonical_text: >-
  External agent sessions, MCP config imports, and handoff packets enter PM as untrusted provenance/evidence until settled by PM receipts. Imported sessions do not become native PM authority or bypass Goal, Tool, or Permission ownership.
gui_related: false
gui_classification_reason: Backend/orchestration import guardrail; not itself GUI implementation work.
depends_on:
- PDS-003
- PNC-001
unblocks: []
acceptance_criteria:
- atom-0121 source details remain traceable through source_lineage and preserved source fields.
- No WorkNodes, NodeSeeds, executable queues, implementation files, production build tasks, generated governance artifacts, or governance seal outputs are created by this compile.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260703-001-feature-intake
risk_class: import_guardrail_compile
reasoning_tier: standard
context_scope: import_guardrail
implementation_surfaces:
- Plans/Goal_Runtime_System.md
node_compile_hint:
  mode: atom_0121
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260703-001-feature-intake:atom-0121
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/records/design_atoms.jsonl:atom-0121
- subagent:019f297e-fcd6-71f1-a6f2-e410e13a3c38
source_atom_ids:
- atom-0121
owner_hints:
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/parallel_agent_synthesis_20260703.json
preserved_exact_tokens:
- untrusted provenance/evidence
- Imported sessions do not become native PM authority
- External agent sessions enter as untrusted provenance
negative_constraints:
- Do not let imported external sessions bypass Goal/Tool/Permission ownership.
compile_disposition: create_new_planunit
```

### GRS-041 - FABLE Goal Runtime Event Payload Closure

```yaml
plan_unit_id: GRS-041
unit_type: schema_contract
status: accepted
owner_doc: Plans/Goal_Runtime_System.md
canonical_text: >-
  Goal Runtime enumerates the shared envelope and event-specific payload minima for
  all canonical goal and goal_run events, and defines the spec-level runtime
  records LoopBreakerRegistry, AgentControlEnvelope, CertificationReceipt,
  ChildAgentLease, WorkNodeRequests, AuditCycle, AuditFinding, and AuditClosure.
  The closure preserves Goal Runtime as the semantic owner while consuming
  Contracts_V0 for cross-surface field names, storage-plan for persistence and
  replay, Executor for WorkNode scheduling and safe-point behavior, and
  Permissions/Models/Multi-Account owners for authority and requested/effective
  identity.
gui_related: false
gui_classification_reason: This unit defines backend Goal Runtime event payload and record semantics, not visual presentation.
depends_on: [GRS-005, GRS-026, GRS-035, GRS-036, GRS-037, GRS-038, CV-287, CV-288, CV-313, EP-098, PNC-013]
unblocks: []
acceptance_criteria:
  - The common payload envelope includes event_name, schema_version, occurred_at_utc, project/thread/goal identity, revisions, actor/execution role, requested/effective provider/model/account refs, correlation/causation/idempotency, evidence/artifact refs, approval refs, and block refs.
  - All 15 goal events and all 6 goal_run events list event-specific payload minima.
  - LoopBreakerRegistry includes the required loop families with fingerprint, max count, observation window, terminal action, and user-facing reason.
  - AgentControlEnvelope, CertificationReceipt, ChildAgentLease, WorkNodeRequests, AuditCycle, AuditFinding, and AuditClosure define stable identities and required proof/authority fields.
  - Goal Runtime does not create WorkNodes, NodeSeeds, executable queues, final node manifests, implementation files, runtime launches, or production build tasks from this payload closure.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-plans-verify.py validate-implementation-readiness
  - python3 scripts/pm-plans-verify.py run-gates
risk_class: fable_goal_runtime_event_payload_drift
reasoning_tier: high
context_scope: contract_runtime_core_repair
implementation_surfaces:
  - Plans/Goal_Runtime_System.md
  - Plans/Contracts_V0.md
  - Plans/Executor_Protocol.md
  - Plans/storage-plan.md
node_compile_hint:
  mode: goal_runtime_event_payload_closure
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - fablereport.md
  - Plans/.audits/fable-20260706/P0_P1_REPAIR_PLAN.md
  - Plans/.audits/fable-20260706/buildability_repair_registry.jsonl
source_atom_ids: []
preserved_exact_tokens:
  - "`goal.created`"
  - "`goal.scheduled`"
  - "`goal.progressed`"
  - "`goal.tool_check_recorded`"
  - "`goal.updated`"
  - "`goal.replanned`"
  - "`goal.child_status_changed`"
  - "`goal.evidence_captured`"
  - "`goal.verification_decided`"
  - "`goal.receipt_recorded`"
  - "`goal.completed`"
  - "`goal.degraded`"
  - "`goal.stopped`"
  - "`goal.blocked`"
  - "`goal.cancelled`"
  - "`goal_run.started`"
  - "`goal_run.replanned`"
  - "`goal_run.blocked`"
  - "`goal_run.certified`"
  - "`goal_run.cancelled`"
  - "`goal_run.stopped`"
  - "`LoopBreakerRegistry`"
  - "`AgentControlEnvelope`"
  - "`CertificationReceipt`"
  - "`ChildAgentLease`"
  - "`WorkNodeRequests`"
  - "`AuditCycle`"
  - "`AuditFinding`"
  - "`AuditClosure`"
negative_constraints:
  - Do not treat event payload closure as runtime certification harness or implementation readiness proof.
  - Do not re-own Executor scheduling, storage replay, permission enforcement, or provider/model/account resolution.
owner_hints:
  - Plans/Goal_Runtime_System.md
  - Plans/Contracts_V0.md
  - Plans/Executor_Protocol.md
```

<!-- FABLE_REMAINING_ACTION_PLAN_REPAIR_20260708_BEGIN -->
## FABLE Remaining Action Plan Repair Notes (2026-07-08)

This owner note closes or dispositions non-runtime rows from `Plans/.audits/fable-20260706/fable_remaining_action_plan.jsonl` that route to this file. It is product prose/spec hygiene only: it creates no WorkNodes, NodeSeeds, queues, runtime artifacts, implementation files, production build tasks, final manifests, or PNC-019 receipts, and it does not mark `buildability_gate_passed` true.

- `registry_line 291` (repaired; source line 1013; `sfk-77c72e6b199c46f5035c68c4`): Owner-doc note records the canonical narrow repair/disposition for this FABLE row and retires the ambiguous or stale wording as implementation authority. Source summary: - [HIGH] L1064-1076 (GRS-015): budget fields (max_turns, max_tokens, max_wall_time_seconds, max_parallel_agents) have no default values or units anywhere.
- `registry_line 292` (repaired; source line 1014; `sfk-d42af8f8290bf76a2b1f438f`): Owner-doc note records the canonical narrow repair/disposition for this FABLE row and retires the ambiguous or stale wording as implementation authority. Source summary: - [HIGH] L1766 vs L1854 (GRS-026): two non-identical write-authority/write_mode enums for what appears to be the same concept (`direct_write_single_owner` vs `leased_writer` families) reconcile.

<!-- FABLE_REMAINING_ACTION_PLAN_REPAIR_20260708_END -->
