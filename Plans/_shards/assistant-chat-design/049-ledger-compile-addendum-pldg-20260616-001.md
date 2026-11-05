# Shard 049: Ledger Compile Addendum - pldg-20260616-001

Source: `Plans/assistant-chat-design.md`

Source lines: L22847-L23172

Source SHA256: `ab006cda7b94ec971f4175168bf411568e158efcf12d5201e1fb066daaff77e7`

---

## Ledger Compile Addendum - pldg-20260616-001

### ACD-416 - Goal Mode Activation Status And Thread Controls

```yaml
plan_unit_id: ACD-416
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  Goal activation and controls consume GRS-048/050/051/054/055/086 in Project and app threads. An explicit
  request starts one concise Goal; Activity/Goal Detail shows its objective, four-state lifecycle, exact
  direct Save or approved proposal and revision History. Pause/Resume/Cancel/Stop keep their actual owner
  semantics and currentness. No title, phase, tranche, child Goal, task drawer, budget field, extra Goal
  tab/card or implicit long-task Goal is restored. App context names the real Computer and working roots;
  conversion uses GRS-087.
gui_related: true
gui_classification_reason: This unit defines user-visible chat activation paths, chips, indicators, and thread controls.
depends_on:
  - GRS-002
  - DL-180
  - ACD-500
unblocks: []
acceptance_criteria:
  - "An explicit request creates one concise Goal in app or Project scope."
  - "Activity/Goal Detail uses the exact four states and direct Save/approved-update owner routes."
  - "No child Goal/title/phase/budget/drawer or alternate stopped/cleared lifecycle is revived."
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
  - "pldg-20260616-001-goal-runtime-system:atom-0017"
  - "pldg-20260616-001-goal-runtime-system:atom-0018"
  - "pldg-20260616-001-goal-runtime-system:atom-0019"
  - "pldg-20260616-001-goal-runtime-system:atom-0020"
  - "pldg-20260616-001-goal-runtime-system:atom-0021"
  - "pldg-20260616-001-goal-runtime-system:atom-0024"
  - "pldg-20260616-001-goal-runtime-system:atom-0025"
  - "pldg-20260616-001-goal-runtime-system:atom-0026"
  - "pldg-20260616-001-goal-runtime-system:atom-0027"
  - "pldg-20260616-001-goal-runtime-system:atom-0030"
  - "pldg-20260616-001-goal-runtime-system:dec-0008"
  - "projects-refresh-20261030/pass2/PLANS-EDIT-PLAN.md#lane-c"
  - "projects-refresh-20261030/pass2/NOPROJECT-PROPOSAL.md#approved-2026-11-03"
  - "Jared, 2026-11-03: Plan mode and scheduled tasks are also available in no project. It's only planning wizard/prd builder/orchestrator that isn't."
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
stale_retired_dispositions:
  - "Amended 2026-10-09 (DL-180): View goal shows the Goal panel of Activity Detail; the chat's Goal tab is gone (DL-147)."
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
  Goal progress uses the one thread-local To-Do list and actual outcome receipts, never Goal-owned
  child-task state or an invented percentage. Goal Activity Detail and ordinary transcript show owner
  blockers/current state for Project and app threads; scope changes are GRS-087 owner operations, never
  automatic replan metadata.
gui_related: true
gui_classification_reason: This unit defines visible task tracker, TODO state, replan feedback, and blocked-state presentation.
depends_on:
  - GRS-007
  - GRS-019
unblocks: []
acceptance_criteria:
  - "The thread-local To-Do controller owns progress and per-item accepted outcomes."
  - "App/Project Goal blockers and history use exact owner state without child Goal replans or copied completion."
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
  - "pldg-20260616-001-goal-runtime-system:atom-0022"
  - "pldg-20260616-001-goal-runtime-system:atom-0023"
  - "pldg-20260616-001-goal-runtime-system:atom-0036"
  - "pldg-20260616-001-goal-runtime-system:atom-0072"
  - "pldg-20260616-001-goal-runtime-system:atom-0095"
  - "pldg-20260616-001-goal-runtime-system:dec-0014"
  - "projects-refresh-20261030/pass2/PLANS-EDIT-PLAN.md#lane-c"
  - "projects-refresh-20261030/pass2/NOPROJECT-PROPOSAL.md#approved-2026-11-03"
  - "Jared, 2026-11-03: Plan mode and scheduled tasks are also available in no project. It's only planning wizard/prd builder/orchestrator that isn't."
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
  Goal evidence/activity and exact revision/continuation/Stop receipts are projected through
  Activity/History/ordinary transcript and shared agent/work surfaces. App scope/Computer is explicit and
  missing evidence stays unavailable. No child-goal counts, subgoal summaries or noncanonical
  Running/Stopped lifecycle fields are introduced; completion follows authentic owner evidence, never a
  model report.
gui_related: true
gui_classification_reason: This unit defines user-visible evidence, activity, metadata, thread summary, and completion-report displays.
depends_on:
  - GRS-012
  - GRS-014
unblocks: []
acceptance_criteria:
  - "Evidence and completion come from authentic owner refs and remain scoped to the real thread/Computer."
  - "Retired child-goal counts and Goal-owned progress/status fields are not rendered."
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
  - "pldg-20260616-001-goal-runtime-system:atom-0028"
  - "pldg-20260616-001-goal-runtime-system:atom-0029"
  - "pldg-20260616-001-goal-runtime-system:atom-0077"
  - "pldg-20260616-001-goal-runtime-system:atom-0078"
  - "pldg-20260616-001-goal-runtime-system:atom-0088"
  - "projects-refresh-20261030/pass2/PLANS-EDIT-PLAN.md#lane-c"
  - "projects-refresh-20261030/pass2/NOPROJECT-PROPOSAL.md#approved-2026-11-03"
  - "Jared, 2026-11-03: Plan mode and scheduled tasks are also available in no project. It's only planning wizard/prd builder/orchestrator that isn't."
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
