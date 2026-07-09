# Shard 005: Ledger Compile Addendum - pldg-20260630-001-feature-intake

Source: `Plans/Goal_Runtime_System.md`

Source lines: L94-L1759

Source SHA256: `93074bc367a76d2b977006d394c063fd7ce21bd1bdcae4138bd6944bebb72785`

---

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
  - "Default budget values are explicit: max_turns=25, max_tokens=null (provider/model policy owns the concrete token ceiling), max_wall_time_seconds=7200, and max_parallel_agents=0 unless a parent Goal or user-supplied run policy narrows them."
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
