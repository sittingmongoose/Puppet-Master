# To-Do Runtime

> **Compliance:** This document follows `Plans/DRY_Rules.md` and references SSOT contracts in `Plans/Contracts_V0.md`. Naming: "Puppet Master" only. No open questions; deterministic defaults per `Plans/Decision_Policy.md`.
> **PlanProfile:** New Plan Authoring Profile
> **Authority:** Canonical sole owner of the thread-local To-Do list: item identity, hierarchy, bounded leaf outcomes, dependencies, parallel groups, the five-value status enum, the `ToDoController` admission and transition semantics, work bindings, individually receipted item transitions, parent rollup, recovery and replay, provider-native To-Do reconciliation, and the Activity projection semantics. It does not own work execution, Plans, Goals, PlanUnits, WorkNodes, scheduling, artifacts, or physical storage.

## 0. Scope

### Scope and product model

The product label is **To-Dos**. A To-Do is the user-visible, thread-local representation of current work. Exactly one current To-Do list exists per thread. The list may be restructured as the active task evolves, and it is never grouped by Goal, by Plan, by request, by Crew, by source, or across threads.

This document exists because To-Do accuracy was the failure mode of the previous model. A model that replaced the whole list and declared several items complete produced a list that looked authoritative and was wrong. The correction is structural: a To-Do's status is a consequence of admitted work and accepted outcome evidence, recorded one item at a time, and a model can only ever propose.

To-Do Runtime owns:

- stable `todo_id` identity, thread membership, and display order;
- parent and child structure, where parents are rollups and leaves are bounded executable outcomes;
- `depends_on[]` admission control and `parallel_group_id` intended concurrency;
- the exact status enum `pending | in_progress | completed | blocked | skipped`;
- the `ToDoController` as the sole writer of item state;
- `TodoWorkBinding` records that tie a leaf to admitted work;
- `TodoTransition` records that make every status change individually receipted;
- derived parent rollup, recovery, and replay;
- reconciliation of provider-native whole-list proposals;
- the semantics the Activity hover and Activity Detail projections render.

It does not own:

- execution of the work itself (`Plans/Executor_Protocol.md`, `Plans/Tools.md`, `Plans/orchestrator-subagent-integration.md`);
- Assistant Plan documents, versions, or Build state (`Plans/Assistant_Plan_Runtime.md`);
- Goal objective or continuation (`Plans/Goal_Runtime_System.md`);
- canonical repository PlanUnits or WorkNodes (`Plans/Plan_Document_System.md`, `Plans/Plan_To_Node_Compilation.md`);
- collaborative participant assignment (`Plans/Collaborative_Workflows.md`);
- schedules, execution windows, or quota resume (`Plans/Scheduling_and_Quota_Resume.md`);
- artifacts, versions, or retention (`Plans/Runtime_Artifacts_Panel.md`, `Plans/Project_Output_Artifacts.md`);
- permission grants (`Plans/Permissions_System.md`);
- storage keys, replay, retention, indexes, or projector checkpoints (`Plans/storage-plan.md`).

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Assistant_Plan_Runtime.md, ContractName:Plans/Goal_Runtime_System.md, ContractName:Plans/Tools.md

## 1. Ownership And Consumers

### Explicit rejections

The following are rejected outright. An active To-Do record, projection, event, command, or GUI surface carrying any of them is a defect.

- **Whole-list model authority.** A model may not replace the list and thereby set statuses. Whole-list replacement exists only as an import-compatibility path with per-item reconciliation, never as normal live authority.
- **Verification status.** There is no `verifying` status and no `verification_state` field. Verification is not a To-Do property. When validation is needed it becomes its own explicit To-Do — run the tests, inspect the output, confirm the rollback, compare the expected state.
- **Source grouping.** No `source_group_label`, no "From Plan" or "From Goal" or "From Crew" headers, and no cross-source sections. Goal, Plan, and PlanUnit refs are internal lineage only and never produce a visible group.
- **A separate Done section.** No `done_category`. Completed items remain inline, in place, with a filled dot and strike-through.
- **Cross-thread aggregation.** The list is thread-local. There is no global To-Do view assembled from several threads.
- **One-in-progress-only assumptions.** Several leaves may be `in_progress` at once, and display order is not execution authority.
- **Retired statuses.** There is no `verifying`, `replanned`, `canceled`, or `superseded` To-Do status in this scope.

ContractRef: ContractName:Plans/DRY_Rules.md

## 2. Canonical PlanUnits

### TDR-001 - One Thread-Local Current To-Do List

```yaml
plan_unit_id: TDR-001
unit_type: requirement
status: accepted
owner_doc: Plans/ToDo_Runtime.md
canonical_text: >-
  Exactly one current To-Do list exists per thread. The list may be restructured as the active task evolves but is never grouped by Goal, Plan, request, Crew, source, or other threads, and is never aggregated across threads. Goal, Plan, plan-step, and PlanUnit refs on an item are internal lineage that enable navigation and audit only; they must not produce a visible source group, section header, or origin filter that partitions the list.
gui_related: true
gui_classification_reason: This unit decides the structure of the To-Do Activity hover and Activity Detail list.
depends_on: []
unblocks: [TDR-002, TDR-007]
acceptance_criteria:
  - Only the active thread's items are shown, and no cross-thread view exists.
  - No source group label, section header, or origin filter appears in any To-Do surface.
  - Lineage refs remain available for navigation and audit without producing grouping.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - node tests/todo-verify.mjs
risk_class: cross_source_or_cross_thread_todo_grouping
reasoning_tier: standard
context_scope: todo_runtime_list_scope
implementation_surfaces:
  - Plans/ToDo_Runtime.md
  - Plans/assistant-chat-design.md
  - Concepts/chat-assistant-concepts/5.6 Pro/todos.js
node_compile_hint:
  mode: todo_list_scope_contract
  create_worknodes: false
source_lineage:
  - pm-assistant-implementation-2026-09-02-recovered:TODO-001
  - pm-assistant-implementation-2026-09-02-recovered:01_IMPLEMENTATION_SPEC.md#6.1
preserved_exact_tokens:
  - "To-Dos"
  - "one current list per thread"
negative_constraints:
  - Do not group To-Dos by Goal, Plan, request, Crew, or source.
  - Do not build a cross-thread To-Do view.
owner_hints:
  - Plans/ToDo_Runtime.md
```

### TDR-002 - Hierarchy With Bounded Leaf Outcomes

```yaml
plan_unit_id: TDR-002
unit_type: requirement
status: accepted
owner_doc: Plans/ToDo_Runtime.md
canonical_text: >-
  Parent To-Dos are rollups carrying no independent work binding or outcome; leaves are executable outcomes and the only items work binds to. A leaf must be split when it contains multiple independent outcomes, when parts can succeed or fail independently, when parts can run concurrently, when different agents or tools suit different parts, when one part depends on another, when it spans major unrelated systems, or when it hides multi-day work. A well-formed leaf has one independently observable result, one principal assignment, one coherent tool and mutation scope, and one retry or block boundary, stated in expected_outcome. Sub-To-Dos are ordinary To-Dos with parent_todo_id set; a cycle in parent_todo_id or depends_on is rejected at write time.
gui_related: true
gui_classification_reason: Hierarchy and leaf granularity determine the rendered tree and its expansion behavior.
depends_on: [TDR-001]
unblocks: [TDR-003]
acceptance_criteria:
  - A parent carries no work binding and no independent outcome.
  - expected_outcome states one independently observable result for every leaf.
  - A parent or dependency cycle is rejected with a typed error.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - node tests/todo-verify.mjs
risk_class: unbounded_todo_leaf_or_cyclic_graph
reasoning_tier: standard
context_scope: todo_runtime_hierarchy
implementation_surfaces:
  - Plans/ToDo_Runtime.md
node_compile_hint:
  mode: todo_hierarchy_contract
  create_worknodes: false
source_lineage:
  - pm-assistant-implementation-2026-09-02-recovered:TODO-002
  - pm-assistant-implementation-2026-09-02-recovered:01_IMPLEMENTATION_SPEC.md#6.2
preserved_exact_tokens:
  - "parent_todo_id"
  - "expected_outcome"
negative_constraints:
  - Do not bind work to a parent To-Do.
  - Do not accept a cyclic parent or dependency graph.
owner_hints:
  - Plans/ToDo_Runtime.md
```

### TDR-003 - Dependencies, Parallel Execution, And Out-Of-Order Admission

```yaml
plan_unit_id: TDR-003
unit_type: requirement
status: accepted
owner_doc: Plans/ToDo_Runtime.md
canonical_text: >-
  depends_on controls admission: a leaf is runnable when every dependency is completed or skipped. parallel_group_id describes intended concurrency and grants no authority. Several leaves may be in_progress simultaneously and may start out of display order when dependencies permit; display order is never execution authority. Waiting on another To-Do is pending with a dependency, never blocked. Parent status derives from children -- any child in_progress makes the parent in_progress, all children completed or skipped with at least one completed makes the parent completed, all skipped makes the parent skipped, any blocked child with nothing running makes the parent blocked, otherwise the parent is pending -- and a parent is never completed by direct assertion while a child is unfinished.
gui_related: true
gui_classification_reason: Concurrent in-progress items must be individually indicated rather than collapsed into one current item.
depends_on: [TDR-002]
unblocks: [TDR-004]
acceptance_criteria:
  - Multiple leaves run concurrently and each updates independently.
  - A leaf admitted out of display order behaves correctly.
  - Waiting on a dependency renders as pending, not blocked.
  - A parent cannot complete while a child is unfinished.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - node tests/todo-verify.mjs
risk_class: single_current_item_assumption
reasoning_tier: high
context_scope: todo_runtime_concurrency
implementation_surfaces:
  - Plans/ToDo_Runtime.md
  - Plans/Executor_Protocol.md
node_compile_hint:
  mode: todo_dependency_and_concurrency
  create_worknodes: false
source_lineage:
  - pm-assistant-implementation-2026-09-02-recovered:TODO-003
  - pm-assistant-implementation-2026-09-02-recovered:01_IMPLEMENTATION_SPEC.md#6.3
preserved_exact_tokens:
  - "depends_on"
  - "parallel_group_id"
negative_constraints:
  - Do not assume one in-progress item.
  - Do not treat display order as execution order.
  - Do not mark a dependency wait as blocked.
owner_hints:
  - Plans/ToDo_Runtime.md
```

### TDR-004 - Five-Value Status Enum Without Verification

```yaml
plan_unit_id: TDR-004
unit_type: constraint
status: accepted
owner_doc: Plans/ToDo_Runtime.md
canonical_text: >-
  The To-Do status enum is exactly pending, in_progress, completed, blocked, and skipped. There is no verifying, replanned, canceled, or superseded status, and no verification_state field, in this scope. Verification is not a To-Do property: when validation is needed it becomes its own explicit validation To-Do such as run the tests, inspect the output, confirm the rollback, or compare the expected state. blocked is reserved for genuine external, user, permission, authentication, resource, or failure conditions and always carries blocked_reason_ref.
gui_related: true
gui_classification_reason: This unit forbids a verification column or badge in every To-Do surface.
depends_on: [TDR-003]
unblocks: [TDR-005]
acceptance_criteria:
  - Only the five statuses exist in records, events, and projections.
  - No verification state or field appears in any user-visible surface.
  - A validation need produces its own To-Do rather than a status.
  - blocked always names its owner condition.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - node tests/todo-verify.mjs
risk_class: verification_status_reintroduced
reasoning_tier: high
context_scope: todo_runtime_status_enum
implementation_surfaces:
  - Plans/ToDo_Runtime.md
  - Plans/assistant-chat-design.md
node_compile_hint:
  mode: todo_status_enum
  create_worknodes: false
source_lineage:
  - pm-assistant-implementation-2026-09-02-recovered:TODO-004
  - pm-assistant-implementation-2026-09-02-recovered:TODO-005
  - pm-assistant-implementation-2026-09-02-recovered:01_IMPLEMENTATION_SPEC.md#6.4
preserved_exact_tokens:
  - "pending | in_progress | completed | blocked | skipped"
  - "verification_state"
negative_constraints:
  - Do not add a verification status or field.
  - Do not add canceled, replanned, or superseded statuses.
owner_hints:
  - Plans/ToDo_Runtime.md
```

### TDR-005 - ToDoController Is The Sole Writer And Models Only Propose

```yaml
plan_unit_id: TDR-005
unit_type: requirement
status: accepted
owner_doc: Plans/ToDo_Runtime.md
canonical_text: >-
  ToDoController is the sole writer of To-Do state and the only component permitted to change status. It owns stable item creation and update, parent/child and dependency validation, work-admission binding, transactional state changes, derived rollups, recovery and replay, and the thread projection. A model -- assistant, subagent, Crew participant, or provider-native tool -- may propose add, split, reorder, dependency, skip, and reopen actions; the controller validates each proposal against the current graph and applies exact item changes or rejects with a typed error. A proposal never carries a status assertion the controller has not independently derived from a work binding and an accepted outcome receipt. Bulk completion without per-item evidence fails and applies nothing; a batch commits every validated change or none.
gui_related: false
gui_classification_reason: This unit defines runtime write authority; its GUI effect is only that displayed status is trustworthy.
depends_on: [TDR-004]
unblocks: [TDR-006]
acceptance_criteria:
  - No component other than ToDoController writes status.
  - A model proposal asserting completion without a receipt is rejected and leaves the item unchanged.
  - Bulk completion without item evidence fails and applies no partial change.
  - Every accepted change validates against the current graph.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - node tests/todo-verify.mjs
risk_class: whole_list_model_authority
reasoning_tier: high
context_scope: todo_runtime_controller
implementation_surfaces:
  - Plans/ToDo_Runtime.md
  - Plans/Tools.md
node_compile_hint:
  mode: todo_controller_authority
  create_worknodes: false
source_lineage:
  - pm-assistant-implementation-2026-09-02-recovered:TODO-006
  - pm-assistant-implementation-2026-09-02-recovered:01_IMPLEMENTATION_SPEC.md#6.6
preserved_exact_tokens:
  - "ToDoController"
negative_constraints:
  - Do not let a model replace the list and thereby set statuses.
  - Do not partially apply a rejected batch.
owner_hints:
  - Plans/ToDo_Runtime.md
```

### TDR-006 - Individually Receipted Transitions And Outcome-Gated Completion

```yaml
plan_unit_id: TDR-006
unit_type: requirement
status: accepted
owner_doc: Plans/ToDo_Runtime.md
canonical_text: >-
  Every status change writes one TodoTransition record carrying from_status, to_status, cause_kind, cause_ref, expected_revision, and committed_revision, and a transition whose expected_revision does not match the item's current revision is rejected. Admission of a durable assignment or tool batch moves an item to in_progress; only an accepted outcome receipt satisfying the item's expected_outcome or output contract moves it to completed. A tool call returning successfully is evidence about the tool and not about the outcome. There is no bulk status event: changing five items emits five todo.status_changed records so an audit can see which receipt justified each one.
gui_related: false
gui_classification_reason: This unit defines transition receipts; the GUI consequence is only that a completed item is genuinely complete.
depends_on: [TDR-005]
unblocks: []
acceptance_criteria:
  - Each status change has exactly one transition record with expected and committed revisions.
  - A stale expected_revision is rejected.
  - A successful tool call without outcome satisfaction does not complete an item.
  - Five item changes emit five separate status events.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - node tests/todo-verify.mjs
risk_class: unreceipted_or_bulk_completion
reasoning_tier: high
context_scope: todo_runtime_transitions
implementation_surfaces:
  - Plans/ToDo_Runtime.md
  - Plans/storage-plan.md
node_compile_hint:
  mode: todo_transition_receipts
  create_worknodes: false
source_lineage:
  - pm-assistant-implementation-2026-09-02-recovered:TODO-007
  - pm-assistant-implementation-2026-09-02-recovered:02_RUNTIME_AND_STORAGE_CONTRACTS.md#6.3
preserved_exact_tokens:
  - "pm.chat.todo_transition.v1"
  - "cause_kind"
negative_constraints:
  - Do not emit a bulk status event.
  - Do not complete an item from tool success alone.
owner_hints:
  - Plans/ToDo_Runtime.md
```

### TDR-007 - Inline Completed Items And No Done Section

```yaml
plan_unit_id: TDR-007
unit_type: requirement
status: accepted
owner_doc: Plans/ToDo_Runtime.md
canonical_text: >-
  To-Dos are Activity-only and are never rendered as transcript cards. The Activity hover preview shows completed over total, the currently in_progress items, the next runnable items, and a blocked count when nonzero. Activity Detail renders one hierarchical list in display order within each parent, with completed items remaining inline and in place with a filled dot and strike-through. There is no Done category, no source header, no verification column, no per-item progress percentage, and no single-current-item stepper. Parent expansion and collapse is local view state that writes no transition, concurrent in_progress items are indicated individually, and a blocked item shows its blocker detail.
gui_related: true
gui_classification_reason: This unit is the complete rendering contract for the To-Do Activity hover and detail surfaces.
depends_on: [TDR-001, TDR-004]
unblocks: []
acceptance_criteria:
  - Completed items remain inline with a filled dot and strike-through.
  - No Done section, source header, or verification column is rendered.
  - Parent toggle writes no transition and changes no status.
  - Concurrent in-progress items are individually visible.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - node tests/todo-verify.mjs
  - node tests/activity-detail-verify.mjs
risk_class: done_section_or_transcript_todo_card
reasoning_tier: standard
context_scope: todo_runtime_activity_projection
implementation_surfaces:
  - Plans/ToDo_Runtime.md
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
  - Concepts/chat-assistant-concepts/5.6 Pro/todos.js
node_compile_hint:
  mode: todo_activity_projection
  create_worknodes: false
source_lineage:
  - pm-assistant-implementation-2026-09-02-recovered:TODO-008
  - pm-assistant-implementation-2026-09-02-recovered:04_GUI_IMPACTS.md#9
preserved_exact_tokens:
  - "strike-through"
  - "filled dot"
negative_constraints:
  - Do not add a Done section or move completed items.
  - Do not render To-Dos as transcript cards.
owner_hints:
  - Plans/ToDo_Runtime.md
```

### TDR-008 - Provider-Native To-Do Reconciliation Without Authority Transfer

```yaml
plan_unit_id: TDR-008
unit_type: requirement
status: accepted
owner_doc: Plans/ToDo_Runtime.md
canonical_text: >-
  A provider-native whole-list to-do tool is translated into a proposal, never into authority. Reconciliation matches proposed entries to existing items by stable identity first and then by a bounded title and position heuristic; matched items may receive title, order, dependency, and structure changes, unmatched entries become new pending items, and existing items absent from the proposal are retained and reported rather than deleted or completed. A proposed status change is accepted only where the controller can independently justify it from a work binding and an accepted outcome receipt; a proposal asserting completion without a receipt leaves the item unchanged and records a rejected-proposal entry. Where an adapter genuinely cannot express the canonical model the constraint is disclosed and the provider-native surface is disabled, redirected, or marked noncanonical.
gui_related: false
gui_classification_reason: Reconciliation is an adapter boundary; its GUI effect is that provider behavior cannot corrupt the visible list.
depends_on: [TDR-005]
unblocks: []
acceptance_criteria:
  - A provider proposal cannot delete or complete an existing item.
  - Items missing from a proposal are retained and reported.
  - A constrained adapter is disclosed as constrained, never as full control.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - node tests/todo-verify.mjs
risk_class: provider_native_todo_authority_transfer
reasoning_tier: high
context_scope: todo_runtime_provider_reconciliation
implementation_surfaces:
  - Plans/ToDo_Runtime.md
  - Plans/Tools.md
  - Plans/CLI_Bridged_Providers.md
node_compile_hint:
  mode: todo_provider_reconciliation
  create_worknodes: false
source_lineage:
  - pm-assistant-implementation-2026-09-02-recovered:TODO-009
  - pm-assistant-implementation-2026-09-02-recovered:07_DRY_OWNERSHIP_MAP.md#6
preserved_exact_tokens:
  - "TodoWrite"
  - "noncanonical"
negative_constraints:
  - Do not let a provider whole-list call delete or complete canonical items.
  - Do not claim full control for a constrained adapter.
owner_hints:
  - Plans/ToDo_Runtime.md
```

### TDR-009 - Recovery, Replay, And Legacy To-Do Migration

```yaml
plan_unit_id: TDR-009
unit_type: requirement
status: accepted
owner_doc: Plans/ToDo_Runtime.md
canonical_text: >-
  Recovery recomputes item status from durable TodoWorkBinding and TodoTransition records rather than from conversation context; a restart mid-run leaves an item in_progress with its binding intact and the controller transitions it exactly once when the executing owner reports the terminal result. Replay of a committed transition is idempotent on transition_id, and a binding reporting recovery_required leaves the item in_progress and surfaces the condition rather than silently completing or reverting. Migration drops verification state and creates an explicit validation To-Do where the verification was real work, maps replanned to pending or skipped with a recorded cause, maps canceled to skipped with a reason, drops source-group and done-category membership into the receipt, converts whole-list snapshots to per-item records with import-marked transitions, and splits cross-thread aggregations back to their owning threads, quarantining any item whose thread edge cannot validate. Migration never marks an item completed on the strength of a legacy snapshot alone.
gui_related: false
gui_classification_reason: Recovery and migration are storage and controller operations with no surface of their own.
depends_on: [TDR-006]
unblocks: []
acceptance_criteria:
  - Status after restart is recomputed from bindings and transitions, not from context.
  - Replaying a committed transition changes nothing.
  - Migration creates explicit validation To-Dos rather than preserving a verification state.
  - Migration never completes an item from a whole-list snapshot.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py
  - python3 scripts/pm-plan-index.py validate
risk_class: fabricated_todo_completion_on_recovery_or_migration
reasoning_tier: high
context_scope: todo_runtime_recovery_and_migration
implementation_surfaces:
  - Plans/ToDo_Runtime.md
  - Plans/storage-plan.md
node_compile_hint:
  mode: todo_recovery_and_migration
  create_worknodes: false
source_lineage:
  - pm-assistant-implementation-2026-09-02-recovered:TODO-010
  - pm-assistant-implementation-2026-09-02-recovered:02_RUNTIME_AND_STORAGE_CONTRACTS.md#12.2
  - pm-assistant-implementation-2026-09-02-recovered:02_RUNTIME_AND_STORAGE_CONTRACTS.md#13
preserved_exact_tokens:
  - "recovery_required"
  - "transition_id"
negative_constraints:
  - Do not recompute status from conversation context.
  - Do not complete an item during migration without item evidence.
owner_hints:
  - Plans/ToDo_Runtime.md
```

## 3. Contracts, Schemas, Events, Or Data Shapes

### Hierarchy and granularity

Parent To-Dos are rollups; they carry no independent work binding and no independent outcome. Leaves are executable outcomes and are the only items work binds to.

A leaf must be split when any of the following is true: it contains multiple independent outcomes; its parts can succeed or fail independently; its parts can run concurrently; different agents or tools suit different parts; one part depends on another; it spans major unrelated systems; or it hides multi-day work.

A well-formed leaf has exactly one independently observable result, one principal assignment, one coherent tool and mutation scope, and one retry or block boundary. `expected_outcome` states that observable result in the user's terms, because it is the thing completion is checked against.

Sub-To-Dos are ordinary To-Dos with `parent_todo_id` set. Nesting depth is bounded by product policy rather than by structure, and a parent may itself be a child. A cycle in `parent_todo_id` or in `depends_on[]` is rejected at write time with a typed error; the controller never accepts a graph it cannot admit.

ContractRef: ContractName:Plans/Contracts_V0.md

### Dependencies, concurrency, and admission

`depends_on[]` controls admission: a leaf is runnable when every dependency is `completed` or `skipped`. `parallel_group_id` describes intended concurrency for display and for the executor's benefit; it grants no authority of its own.

Several leaves may be `in_progress` simultaneously, and they may start out of display order when dependencies permit. The Activity list therefore shows more than one live item routinely, and a projection that assumes a single current item is wrong.

Waiting on another To-Do is `pending` with a dependency. It is **not** `blocked`. `blocked` is reserved for genuine external conditions — a user decision, a permission or authentication requirement, a missing resource, an unrecoverable failure — and always carries `blocked_reason_ref` naming the owner condition.

Parent status derives from children: any child `in_progress` makes the parent `in_progress`; all children `completed` or `skipped` with at least one `completed` makes the parent `completed`; all children `skipped` makes the parent `skipped`; any child `blocked` with no child running makes the parent `blocked`; otherwise the parent is `pending`. An explicit policy skip of a parent skips its remaining children with a recorded reason. A parent is never completed by direct assertion while a child is unfinished.

ContractRef: ContractName:Plans/Executor_Protocol.md

### Statuses

The status enum is exactly:

```text
pending | in_progress | completed | blocked | skipped
```

`pending` means not yet admitted, including waiting on a dependency. `in_progress` means work has been durably admitted for this item. `completed` means the item's expected outcome or output contract has been satisfied and an outcome receipt was accepted. `blocked` means an external condition named by `blocked_reason_ref` prevents progress. `skipped` means the item is no longer required, with a recorded reason.

Completion is not implied by a tool call returning successfully. A tool succeeding is evidence about the tool, not about the outcome. Completion requires that the item's `expected_outcome` or declared output contract be satisfied, and the controller records which receipt satisfied it.

### ToDoController

`ToDoController` is the sole writer of To-Do state. Every mutation goes through it, and it is the only component permitted to change `status`.

It owns stable item creation and update, parent/child and dependency validation, work-admission binding, transactional state changes, derived rollups, recovery and replay, and the thread projection.

A model — the assistant, a subagent, a Crew participant, or a provider-native To-Do tool — may **propose** add, split, reorder, dependency, skip, and reopen actions. The controller validates each proposal against the current graph and applies exact item changes, or rejects the proposal with a typed error. A proposal never carries a status assertion that the controller has not independently derived from work and receipts.

Transitions the controller admits, and their causes:

| Cause | Effect |
|---|---|
| assignment or tool batch durably admitted | `pending` → `in_progress` |
| required outcome receipt or evidence accepted | `in_progress` → `completed` |
| recoverable failed attempt | stays `in_progress`, or returns to `pending` under an explicit retry policy |
| genuine external block | any non-terminal status → `blocked` with `blocked_reason_ref` |
| block cleared | `blocked` → `pending` |
| no longer required | any non-terminal status → `skipped` with reason |
| child rollup | parent status derived per section 3 |
| explicit reopen | `completed` or `skipped` → `pending`, recorded with cause |

Every transition writes a `TodoTransition` record carrying `expected_revision` and `committed_revision`. A transition whose `expected_revision` does not match the item's current revision is rejected; the controller never applies a change computed against a stale view.

Bulk completion is refused. A request that would mark several items `completed` without a corresponding accepted outcome receipt for each item fails with a typed error and applies none of the changes. Partial application is not permitted: a batch either commits every validated item change or commits nothing.

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Tools.md

### Records

`TodoItemV2` is the item record:

```yaml
schema_id: pm.chat.todo_item.v2
fields:
  todo_id: string
  project_id: string
  thread_id: string
  parent_todo_id: string|null
  title: string
  status: pending|in_progress|completed|blocked|skipped
  display_order: integer
  depends_on: [string]
  parallel_group_id: string|null
  plan_id: string|null
  plan_version: integer|null
  plan_step_ids: [string]
  planunit_ids: [string]
  goal_id: string|null
  expected_outcome: string|null
  active_work_ids: [string]
  blocked_reason_ref: string|null
  created_at: timestamp
  started_at: timestamp|null
  completed_at: timestamp|null
  revision: integer
negative_fields:
  - verification_state
  - source_group_label
  - done_category
```

`plan_id`, `plan_version`, `plan_step_ids`, `planunit_ids`, and `goal_id` are internal lineage. They enable "open the work" and "open the Plan step" navigation and audit. They must not produce a visible source group, a section header, or a filter chip that partitions the list by origin.

`TodoWorkBinding` ties a leaf to admitted work:

```yaml
schema_id: pm.chat.todo_work_binding.v1
fields:
  binding_id: string
  todo_id: string
  work_kind: primary_segment|subagent_assignment|crew_assignment|tool_batch|research|validation|artifact_generation
  work_id: string
  attempt_id: string
  expected_outcome: string|null
  admitted_at: timestamp
  terminal_result_ref: string|null
  state: admitted|running|succeeded|failed|cancelled|recovery_required
```

`TodoTransition` makes each status change individually receipted:

```yaml
schema_id: pm.chat.todo_transition.v1
fields:
  transition_id: string
  todo_id: string
  from_status: string
  to_status: string
  cause_kind: work_admitted|outcome_satisfied|dependency_changed|external_block|explicit_skip|retry|reopen|child_rollup
  cause_ref: string
  expected_revision: integer
  committed_revision: integer
  created_at: timestamp
```

A To-Do may aggregate several tightly related tool operations, and a Plan step or scoped PlanUnit may map to several To-Dos. Raw WorkNodes and PlanUnits are never rendered as To-Dos, and the To-Do list is never the scheduler database.

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Plan_Document_System.md

### Exact commands and required result boundaries

| Command ID | Meaning | Required result boundary |
|---|---|---|
| `cmd.chat.todos.open` | Open the thread's To-Do Activity domain or detail panel | Navigation only; opening never changes an item status or revision. |
| `cmd.chat.todos.toggle_parent` | Expand or collapse a parent To-Do | Local view state only; it is never a status change and writes no transition. |
| `cmd.chat.todos.open_work` | Open the admitted work record bound to a leaf | Navigation only; returns the exact `work_id` and `attempt_id` under the executing owner. |

Item mutation itself is not a user-facing command in this scope: the user's list changes as a consequence of admitted work, model proposals validated by the controller, and Plan or Review promotion commands owned elsewhere. Where a future direct-edit surface is admitted, it must route through `ToDoController` with expected-revision checking and per-item transitions on the same terms as every other writer.

Every request carries `schema_id`, `schema_version`, command ID, command instance ID, `project_id`, `thread_id`, `todo_id` where applicable, expected item revision, actor, permission snapshot, idempotency key, source surface, and return route. Typed errors are `invalid_request`, `todo_not_found`, `stale_todo_revision`, `dependency_cycle`, `parent_cycle`, `outcome_evidence_required`, `bulk_completion_refused`, `command_not_registered`, `permission_denied`, `owner_unavailable`, or `cancelled`.

Until the central command catalog, Event Authority, and production wiring rows close for a given ID, its controls render disabled with `command_not_registered`. No page-local handler, alias, fixture, or toast may simulate success.

ContractRef: ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/Commands_System.md

### Events

The required semantic event names are `todo.created`, `todo.updated`, `todo.work_bound`, `todo.status_changed`, `todo.dependency_changed`, `todo.reordered`, and `todo.removed_from_current_list`. All seven require central EventRecord registration and payload schemas before emission; until then the controller records only its typed result, receipt, and projection.

`todo.status_changed` carries `from_status`, `to_status`, `cause_kind`, `cause_ref`, `expected_revision`, and `committed_revision`. There is deliberately no bulk status event: a change to five items emits five `todo.status_changed` records, so an audit can see which receipt justified each one.

`todo.removed_from_current_list` records that an item left the current list without being completed or skipped — for example when a restructure supersedes it. It is not a deletion of history.

No event carries a verification state, a source group label, or a done category, because registering one would reintroduce a retired concept through the event catalog.

ContractRef: ContractName:Plans/Commands_System.md, ContractName:Plans/storage-plan.md

## 4. Integration Surfaces

### Provider-native To-Do reconciliation

Several providers expose a native to-do or task tool that replaces the whole list on every call. Puppet Master owns the canonical list. A provider-native call is translated into a **proposal**, never into authority.

Reconciliation matches proposed entries to existing items by stable identity first, then by a bounded title and position heuristic. Matched items may receive title, order, dependency, and structure changes. Unmatched proposed entries become new `pending` items. Existing items absent from the proposal are **not** deleted and **not** completed; they are retained and reported, because a provider that forgets an item must not be able to erase it.

A proposed status change is accepted only where the controller can independently justify it from a work binding and an accepted outcome receipt. A proposal that asserts `completed` with no receipt leaves the item as it was and records a rejected-proposal entry.

Where the adapter genuinely cannot express the canonical model, the constraint is disclosed rather than hidden, and the provider-native surface is disabled, redirected, or marked noncanonical per `Plans/CLI_Bridged_Providers.md`. No adapter is described as having full control when it does not.

ContractRef: ContractName:Plans/Tools.md, ContractName:Plans/CLI_Bridged_Providers.md, ContractName:Plans/Provider_OpenCode.md

### Activity projection

To-Dos are Activity-only. They are never rendered as transcript cards.

The Activity bar hover preview shows the completed-over-total summary, the currently `in_progress` items, the next runnable items, and a blocked count when it is nonzero. It shows no verification state and no source grouping.

Activity Detail renders one hierarchical list in `display_order` within each parent. Completed items remain **inline**, in place, with a filled dot and strike-through — there is no Done section and no reordering of completed work to the bottom. Parents expand and collapse as local view state. Concurrent `in_progress` items are individually indicated rather than collapsed into one "current" item. A `blocked` item shows its blocker detail from `blocked_reason_ref`. Where useful, a leaf links to its active work, subagent, or artifact through `cmd.chat.todos.open_work`.

The panel must not show a Done category, source headers, a verification column, a per-item progress percentage, or a single-current-item stepper.

ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/FinalGUISpec.md

## 5. Validation And Acceptance

### Verification

Structural tests validate the schema and fixtures, the absence of every negative field, the five-value status enum, dependency and parent cycle rejection, expected-revision rejection, and the parent rollup derivation table.

Behavioral tests must prove that several leaves can be `in_progress` at once and update immediately from admitted work; that a leaf starting out of display order is admitted correctly; that a tool call succeeding without the expected outcome does not complete an item; that a bulk completion without per-item evidence fails and applies nothing; that a provider-native whole-list proposal cannot delete or complete an existing item; that a restart recovers status from bindings and transitions rather than conversation context; and that replaying a committed transition changes nothing.

Negative tests must prove that no surface shows a Done section, a source group, or a verification state; that waiting on a dependency renders as `pending` and not `blocked`; and that a parent cannot complete while a child is unfinished.

ContractRef: ContractName:Plans/Automated_Testing_System.md, ContractName:Plans/Progression_Gates.md

## 6. Plan-To-Node Readiness

This document authorizes no WorkNodes, NodeSeeds, executable queues, runtime dispatch, or implementation files. A To-Do is user-visible current work and is never the scheduler database; raw WorkNodes and PlanUnits are never rendered as To-Dos. Every command in this document remains `handler_unavailable` until the central catalog, Event Authority, storage registration, and production wiring close.

## 7. Deferred, Retired, Compatibility, And Non-Goals

### Recovery, replay, and migration

Recovery recomputes item status from durable `TodoWorkBinding` and `TodoTransition` records rather than from conversation context. A restart mid-run leaves an item `in_progress` with its binding intact; the executing owner reports the attempt's terminal result and the controller then transitions the item exactly once. Replay of an already-committed transition is idempotent on `transition_id`.

A binding whose work owner reports `recovery_required` leaves the item `in_progress` and surfaces the recovery condition; it never silently completes and never silently reverts.

Migration from the previous model:

- items carrying a verification state are migrated with that field dropped and, where the verification was real work, a separate explicit validation To-Do is created with a recorded lineage ref;
- items carrying a `replanned` status map to `pending` with a recorded cause, or to `skipped` where the item is genuinely no longer required;
- items carrying `canceled` map to `skipped` with a recorded reason;
- source-group labels and done-category membership are dropped and recorded in the migration receipt;
- whole-list snapshots are converted to per-item records with synthesized transitions whose `cause_kind` is recorded as an import, never as `outcome_satisfied`;
- cross-thread aggregations are split back to their owning threads, and an item whose thread edge cannot validate quarantines rather than being assigned to a guess.

Migration never marks an item `completed` on the strength of a legacy whole-list snapshot alone.

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Bootstrap_Planning_Migration.md

## 8. Source Lineage And Governance

This document was compiled from the approved Puppet Master Assistant redesign packet `pm-assistant-implementation-2026-09-02-recovered`, whose captured conversation decisions are the controlling authority, followed by `Concepts/chat-assistant-concepts/5.6 Pro/Chat updates.md` and then older `Plans/**`. Registration is recorded in `Plans/00-plans-index.md` under the 2026-09-03 entry and routed in `Plans/Crosswalk.md`. Generated governance is refreshed by its owner scripts after live owner documents stabilize and is never hand-edited to make a gate pass.

## Additive Correction v4 — To-Do Graph And List-Replacement Integrity (2026-09-03)

This section applies `PM_Assistant_v2_Additive_Correction_v4` (`TDG-001..016`) to this owner.
It is additive: the accepted v2 design — one thread-local hierarchical list, bounded leaf
outcomes, sub-To-Dos, dependencies, parallel and out-of-order execution, individually receipted
transitions, inline completed strike-through, and **no** verification status, source groups, or
separate Done section — stays exactly as it is.

### TDG-001..005 — Graph validation fails closed

`ToDoController` validates a candidate graph **before** commit and rejects the whole mutation
on any of the following. Nothing partial is written, and nothing is silently repaired.

| Rejected condition | Typed result |
|---|---|
| An item names itself as parent | `invalid_graph` with `self_parent_ids` |
| A parent/child cycle of any length | `invalid_graph` with `parent_cycles` |
| A dependency cycle, including one spanning sibling branches | `invalid_graph` with `dependency_cycles` |
| A parent, dependency, or work binding in another thread | `invalid_graph` with `cross_thread_refs` |
| An unknown or duplicate item ID or reference | `invalid_graph` with `unknown_refs` |

```text
pm.todo.graph_validation_result.v1
  thread_id, candidate_revision, valid,
  self_parent_ids[], parent_cycles[], dependency_cycles[],
  unknown_refs[], cross_thread_refs[]
```

Cycle detection runs over the candidate graph itself, not over rendered nesting depth. A missing
referenced item is never auto-created. To-Dos stay current-thread local and thread identity is
exact; a title or a Plan name is never a scope.

### TDG-006 — Display order is not dependency

Reordering changes `display_order` and nothing else. Dependencies, parallel groups, and parent
links are untouched, out-of-order execution stays possible, and dependency is never inferred
from visible numbering.

### TDG-007..009 — Replacing the list is an owner transaction

Replacing the current thread list is one atomic owner operation, permitted only for initial
materialisation or an explicit validated restructuring. A provider `TodoWrite`-style whole-list
snapshot is a **proposal**: it cannot directly invoke replacement and is never runtime authority.

Before the new list commits, every active work reference is classified:

```text
pm.todo.list_replacement_disposition.v1
  thread_id, old_revision, new_revision,
  retained[]   item survives with identity intact
  rebound[]    work moves to a new item, exact work binding preserved
  canceled[]   work stopped at a safe boundary, cancellation receipted
  refused[]    replacement rejected because the work cannot be safely handled
  active_work_refs[]
```

No active work is orphaned, and an in-progress item's identity is never deleted while its work
continues. Retained and rebound work keeps its exact work binding and receives the new current
item and list revisions, so later events target the current revision. Binding is by identity,
never by matching titles.

### TDG-010..012 — Currentness beats timestamps

A late status event is applied only when the current list revision, item revision, work binding,
Plan version, and run epoch all still match. A stale event is retained as rejected evidence and
never applied; last-write-wins by timestamp is prohibited.

A historical child removed from the graph cannot later mutate the current parent's derived
state. Parent rollup reads current graph membership only, and no hidden stale edge stays active.

Parent status is derived from current required children. A parent cannot be bulk-completed while
a required leaf is unresolved, and a provider cannot mark a parent and its children complete in
one unsupported snapshot. Individual leaf outcomes stay auditable.

### TDG-013 — Large hierarchies are preserved, not capped

Large hierarchical lists use the existing virtualization and preserve every item. The compact
hover may summarise; full Activity may not truncate. Search and expand retain stable identities,
and the number of To-Dos is never capped to simplify rendering.

### TDG-014 — Validation stays an ordinary To-Do, and the name says so

Validation work remains an ordinary To-Do wherever it is needed. No verification field, status,
badge, group, or `todo-verify` product concept is introduced, and `verifying` is not revived.

The correction renames the ambiguous test label: what was `todo-verify` is `todo-runtime-verify`.
The rename is naming hygiene only. The old filename is not a licence to reintroduce a
verification status.

### TDG-015..016 — Leaf outcomes and quota waits

Every completed leaf retains one item-level outcome, cause, and evidence reference — including
purely conversational work that produced no tool receipt. Completion is never an untraceable
bulk mutation, and a test receipt is not required for a conversational outcome.

A quota or execution-window wait leaves an admitted in-progress item `in_progress` with the run
wait state attached. Resume continues the same binding. An item becomes `blocked` only when the
item itself has a genuine blocker; a Usage wait is not a blocker.
