# Shard 047: Ledger Compile Addendum - pldg-20260616-002

Source: `Plans/assistant-chat-design.md`

Source lines: L21990-L22249

Source SHA256: `7278e680667f873b62665cc05bff06dc7cf59f60db60f87cb1c65eeda216b594`

---

## Ledger Compile Addendum - pldg-20260616-002

### ACD-420 - Visible Chat Goal Boundary And Doc Builder Exclusion

```yaml
plan_unit_id: ACD-420
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  Assistant Chat owns visible Goal mode controls and completion presentation for user-directed goals, including pause, resume, stop, status, child-goal summaries, and completion reports. Chat may expose Orchestrator Goal handoff status, but Doc Builder's conversational ledger capture and invisible Requirements Doc Builder conversion remain ledger and Goal Runtime flows, not ordinary chat-owned WorkNodes.
gui_related: true
gui_classification_reason: Assistant Chat goal controls, status, and completion reports are user-visible chat UI.
depends_on:
  - ACD-416
  - ACD-418
  - GRS-002
unblocks: []
acceptance_criteria:
  - Assistant Chat continues to expose visible Goal mode control actions and completion report status.
  - Chat can show Orchestrator Goal handoff status without owning GoalRun scheduler or receipt authority.
  - Requirements Doc Builder conversational ledger capture is not represented as a default chat-owned WorkNode.
  - Invisible Doc Builder conversion remains a Goal Runtime integration with ledger lineage.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - future Assistant Chat Goal UI review
risk_class: chat_goal_boundary_drift
reasoning_tier: standard
context_scope: assistant_chat_goal_mode
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/Goal_Runtime_System.md
  - Plans/chain-wizard-flexibility.md
node_compile_hint:
  mode: assistant_chat_goal_boundary
  create_worknodes: false
source_lineage:
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0003
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0005
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0008
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0079
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0103
preserved_exact_tokens:
  - "Goal mode exposed to the user in chat assistant"
  - "pause"
  - "resume"
  - "stop"
  - "completion report"
  - "Requirements Doc Builder"
  - "invisible Goal Mode"
negative_constraints:
  - Do not let chat presentation replace Goal Runtime receipt authority.
  - Do not treat Doc Builder invisible goals as default Orchestrator WorkNodes.
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/Goal_Runtime_System.md
  - Plans/chain-wizard-flexibility.md
```

### ACD-417 - Goal Task Tracker Replan And Blocked State Projection

```yaml
plan_unit_id: ACD-417
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  Assistant Chat projects Goal Runtime task state through a goal task/TODO tracker with item states, update entry points, and visible replan feedback. Material mid-goal changes produce Goal Replan Event feedback in the visible task list. Blocked goal status must show the exact blocker instead of a generic failure label, including blocker_class, cause, affected scope, last attempted recovery, why autonomous recovery cannot continue safely, and next safe action when available.
gui_related: true
gui_classification_reason: This unit defines visible task tracker, TODO state, replan feedback, and blocked-state presentation.
depends_on:
  - GRS-007
  - GRS-019
unblocks: []
acceptance_criteria:
  - Goal task items show current state and remain stable while updates occur.
  - Replan events visibly update the task list after impact analysis.
  - Blocked goals name the exact blocker in the chat surface.
  - Blocked goal projections expose blocker_class, cause, affected scope, last attempted recovery, why autonomous recovery cannot continue safely, and next safe action when available.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - future Assistant Chat task tracker review
risk_class: task_status_visibility_drift
reasoning_tier: standard
context_scope: assistant_chat_goal_mode
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/Goal_Runtime_System.md
node_compile_hint:
  mode: assistant_chat_goal_task_tracker
  create_worknodes: false
source_lineage:
  - pldg-20260616-001-goal-runtime-system:atom-0022
  - pldg-20260616-001-goal-runtime-system:atom-0023
  - pldg-20260616-001-goal-runtime-system:atom-0036
  - pldg-20260616-001-goal-runtime-system:atom-0072
  - pldg-20260616-001-goal-runtime-system:atom-0095
  - pldg-20260616-001-goal-runtime-system:dec-0014
preserved_exact_tokens:
  - "Goal task / todo tracker"
  - "Goal task item states"
  - "pending"
  - "running"
  - "verifying"
  - "completed"
  - "blocked"
  - "failed"
  - "skipped"
  - "cancelled"
  - "stale"
  - "replanned"
  - "updates the visible task list"
  - "Goal Replan Event"
  - "Blocked status carries exact blocker"
  - "blocker_class"
  - "cause"
  - "affected scope"
  - "last attempted recovery"
  - "why autonomous recovery cannot continue safely"
  - "next safe action"
negative_constraints:
  - Do not hide material replan impact from the task tracker.
  - Do not render blocked goal state as a generic failure without the blocker reason.
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/Goal_Runtime_System.md
```

### ACD-418 - Goal Evidence Activity And Completion Reports

```yaml
plan_unit_id: ACD-418
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  Assistant Chat displays goal evidence and activity disclosure through runtime popovers, metadata, activity cards, message blocks, thread-sidebar goal summaries, and final goal completion reports. Thread-sidebar goal summaries preserve exact formats such as Running · 8/14 tasks · 3 subgoals active and equivalent subagent-count wording. Runtime popovers/metadata preserve labels Mode, Provider, Model, Effort, Subagents, Tokens, Context, Est. Cost, Worktree, Merge Status, and takeover_state. Activity cards/message blocks preserve examples such as Automation, Starting login flow verification, Agent took control, and user_paused -> resumed. These displays summarize Goal Runtime receipts and evidence without becoming the canonical evidence store.
gui_related: true
gui_classification_reason: This unit defines user-visible evidence, activity, metadata, thread summary, and completion-report displays.
depends_on:
  - GRS-012
  - GRS-014
unblocks: []
acceptance_criteria:
  - Users can inspect goal activity and evidence summaries from the chat surface.
  - Thread-sidebar goal summaries can show exact progress and child/subagent counts such as Running · 8/14 tasks · 3 subgoals active.
  - Runtime metadata labels include Mode, Provider, Model, Effort, Subagents, Tokens, Context, Est. Cost, Worktree, Merge Status, and takeover_state.
  - Activity cards or message blocks can represent Automation, Starting login flow verification, Agent took control, and user_paused -> resumed examples.
  - Completion reports disclose checks, changed artifacts, blockers, skipped checks, degraded status, and evidence references where relevant.
  - Chat presentation links to runtime evidence instead of duplicating raw uncapped logs.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - future Assistant Chat evidence display review
risk_class: evidence_visibility_drift
reasoning_tier: standard
context_scope: assistant_chat_goal_mode
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/Goal_Runtime_System.md
  - Plans/Runtime_Artifacts_Panel.md
node_compile_hint:
  mode: assistant_chat_goal_evidence_display
  create_worknodes: false
source_lineage:
  - pldg-20260616-001-goal-runtime-system:atom-0028
  - pldg-20260616-001-goal-runtime-system:atom-0029
  - pldg-20260616-001-goal-runtime-system:atom-0077
  - pldg-20260616-001-goal-runtime-system:atom-0078
  - pldg-20260616-001-goal-runtime-system:atom-0088
preserved_exact_tokens:
  - "Thread sidebar goal summaries"
  - "Running · 8/14 tasks · 3 subgoals active"
  - "subagents"
  - "Visible goal evidence and activity disclosure"
  - "Runtime popovers and metadata"
  - "Goal activity cards/message blocks"
  - "Goal completion reports"
  - "Mode"
  - "Provider"
  - "Model"
  - "Effort"
  - "Subagents"
  - "Tokens"
  - "Context"
  - "Est. Cost"
  - "Worktree"
  - "Merge Status"
  - "takeover_state"
  - "Automation"
  - "Starting login flow verification"
  - "Agent took control"
  - "user_paused -> resumed"
  - "activity card"
  - "message block"
negative_constraints:
  - Do not store uncapped raw logs inline in chat completion reports.
  - Do not let chat presentation replace Goal Runtime receipt authority.
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/Goal_Runtime_System.md
```

### ACD-419 - Collapsible Child Goal Display

```yaml
plan_unit_id: ACD-419
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  Assistant Chat shows the parent goal by default and summarizes child goals by default. Child goals are expandable when the user wants details or when a child is blocked or failed. The compact summary may present states like "Goal running", "8/14 tasks", and "3 child goals active", with expanded child-goal status rows that preserve child status, assigned agent/persona/model, current task, blockers, result availability, and result artifacts without weakening parent/child runtime authority.
gui_related: true
gui_classification_reason: This unit defines collapsible user-visible child-goal and subgoal tree displays.
depends_on:
  - GRS-016
unblocks: []
acceptance_criteria:
  - Child goals are visible as summaries without forcing all detail into the default chat view.
  - Blocked or failed child goals can be expanded and inspected.
  - Chat display does not allow a child goal to complete the parent goal.
  - Expanded child-goal rows show child status, assigned agent/persona/model, current task, blockers, result availability, and result artifacts when available.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - future Assistant Chat child-goal display review
risk_class: child_goal_visibility_drift
reasoning_tier: standard
context_scope: assistant_chat_goal_mode
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/Goal_Runtime_System.md
node_compile_hint:
  mode: assistant_chat_child_goal_display
  create_worknodes: false
source_lineage:
  - pldg-20260616-001-goal-runtime-system:atom-0058
  - pldg-20260616-001-goal-runtime-system:atom-0079
  - pldg-20260616-001-goal-runtime-system:atom-0097
  - pldg-20260616-001-goal-runtime-system:dec-0015
preserved_exact_tokens:
  - "Subgoal tree display"
  - "Child goals summarized by default"
  - "Child goals expandable"
  - "Goal running"
  - "8/14 tasks"
  - "3 child goals active"
  - "Child Goal"
  - "blocked"
  - "agent/persona/model"
  - "current task"
  - "blockers"
  - "result availability"
  - "result artifacts"
negative_constraints:
  - Do not force all child-goal detail into the default chat view.
  - Do not hide blocked or failed child goals from the user-facing status surface.
  - Do not let chat UI imply a child can complete the parent goal.
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/Goal_Runtime_System.md
```
