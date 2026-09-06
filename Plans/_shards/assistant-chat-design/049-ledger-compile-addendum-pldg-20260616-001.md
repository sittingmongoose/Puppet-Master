# Shard 049: Ledger Compile Addendum - pldg-20260616-001

Source: `Plans/assistant-chat-design.md`

Source lines: L22417-L22729

Source SHA256: `6042b076a4835fecf4c2297bc51de70c98e5f604a4552c5ef425289124ebb4b7`

---

## Ledger Compile Addendum - pldg-20260616-001

### ACD-416 - Goal Mode Activation Status And Thread Controls

```yaml
plan_unit_id: ACD-416
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  Assistant Chat must expose visible Goal Mode activation and control paths without re-owning Goal Runtime policy. Users can start goals through a button, chip, icon, `/goal`, or natural-language activation. Assistant Chat supports a pre-goal shaping flow where the assistant helps create a goal prompt, acceptance criteria, constraints, and stop conditions before the user switches to Goal Mode. A visible active-goal indicator shows goal state labels including Running, Stopped, Paused, Blocked, and Complete, with Blocked carrying the precise blocker reason when available. Thread controls support pause, resume, stop, clear, edit, and update; stopped_by_user and cleared_from_thread remain distinct runtime states. The active Goal chip/status opens a menu or drawer with View goal, Edit goal, Pause, Resume, Stop, Clear, Show tasks, Show subgoals, and Show evidence/logs. Active-goal updates can be initiated with `/goal again`, asking for an update, or clicking a little icon next to the goal status. The Goal chip is separate from chat mode so Ask, Agent, Debug, Plan, Deep Plan, Agent + Goal, Debug + Goal, Plan + Goal, and Crew + Goal remain compatible presentation concepts. Goal UI reuses PMConcept cues including chat mode dropdown, slash command menu, sticky plan tracker, thread working pulse, context usage, active subagent indicator, files touched, message blocks, and hover/runtime popovers.
gui_related: true
gui_classification_reason: This unit defines user-visible chat activation paths, chips, indicators, and thread controls.
depends_on:
  - GRS-002
unblocks: []
acceptance_criteria:
  - Assistant Chat exposes button/chip/icon, `/goal`, and natural-language activation paths.
  - Running goals have a visible indicator and do not disappear into ordinary chat mode state.
  - Pause/resume/stop/clear/edit/update controls project canonical Goal Runtime state.
  - Goal status labels include Running, Stopped, Paused, Blocked, and Complete, with Blocked preserving a precise blocker reason when known.
  - Goal menu or drawer actions include View goal, Edit goal, Pause, Resume, Stop, Clear, Show tasks, Show subgoals, and Show evidence/logs.
  - Pre-goal shaping can turn a rough request into a goal prompt, acceptance criteria, constraints, and stop conditions before switching to Goal Mode.
  - Goal remains an additive wrapper compatible with Ask, Agent, Debug, Plan, Deep Plan, Agent + Goal, Debug + Goal, Plan + Goal, and Crew + Goal.
  - stopped_by_user and cleared_from_thread remain distinct states in visible controls and runtime projection.
  - Goal UI alignment preserves PMConcept cues for chat mode dropdown, slash command menu, sticky plan tracker, thread working pulse, context usage, active subagent indicator, files touched, message blocks, and hover/runtime popovers.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - future Assistant Chat Goal UI review
risk_class: hidden_goal_control
reasoning_tier: standard
context_scope: assistant_chat_goal_mode
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/Goal_Runtime_System.md
node_compile_hint:
  mode: assistant_chat_goal_controls
  create_worknodes: false
source_lineage:
  - pldg-20260616-001-goal-runtime-system:atom-0017
  - pldg-20260616-001-goal-runtime-system:atom-0018
  - pldg-20260616-001-goal-runtime-system:atom-0019
  - pldg-20260616-001-goal-runtime-system:atom-0020
  - pldg-20260616-001-goal-runtime-system:atom-0021
  - pldg-20260616-001-goal-runtime-system:atom-0024
  - pldg-20260616-001-goal-runtime-system:atom-0025
  - pldg-20260616-001-goal-runtime-system:atom-0026
  - pldg-20260616-001-goal-runtime-system:atom-0027
  - pldg-20260616-001-goal-runtime-system:atom-0030
  - pldg-20260616-001-goal-runtime-system:dec-0008
preserved_exact_tokens:
  - "button/chip/icon"
  - "/goal"
  - "Visible active goal indicator"
  - "Goal: Running"
  - "Pause and resume controls"
  - "Stop and clear controls"
  - "stopped_by_user"
  - "cleared_from_thread"
  - "Goal update entry points"
  - "Running"
  - "Stopped"
  - "Paused"
  - "Blocked"
  - "Complete"
  - "/goal again"
  - "asking for an update"
  - "clicking a little icon next to the goal status"
  - "View goal"
  - "Edit goal"
  - "Pause"
  - "Resume"
  - "Stop"
  - "Clear"
  - "Show tasks"
  - "Show subgoals"
  - "Show evidence"
  - "logs"
  - "Goal chip is separate from chat mode"
  - "Ask"
  - "Agent"
  - "Debug"
  - "Plan"
  - "Deep Plan"
  - "Agent + Goal"
  - "Debug + Goal"
  - "Plan + Goal"
  - "Crew + Goal"
  - "Goal menu actions"
  - "PMConcept alignment"
  - "help create a goal"
  - "switch to goal mode"
  - "goal prompt"
  - "acceptance criteria"
  - "stop conditions"
  - "chat mode dropdown"
  - "slash command menu"
  - "sticky plan tracker"
  - "thread working pulse"
  - "context usage"
  - "active subagent indicator"
  - "files touched"
  - "message blocks"
  - "hover/runtime popovers"
negative_constraints:
  - Do not make a running goal indistinguishable from ordinary chat mode.
  - Do not let Assistant Chat invent a lifecycle that diverges from Goal Runtime state.
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/Goal_Runtime_System.md
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
