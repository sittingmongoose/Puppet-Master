# Shard 046: Ledger Compile Addendum - pldg-20260616-001

Source: `Plans/assistant-chat-design.md`

Source lines: L21878-L22095

Source SHA256: `eb1674cb8bd438ed5f6d3f619cefa6c0e8d6d9219f8028d0b5ff53ed64534170`

---

## Ledger Compile Addendum - pldg-20260616-001

### ACD-416 - Goal Mode Activation Status And Thread Controls

```yaml
plan_unit_id: ACD-416
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  Assistant Chat must expose visible Goal Mode activation and control paths without re-owning Goal Runtime policy. Users can start goals through a button, chip, icon, `/goal`, or natural-language activation. A visible active-goal indicator shows goal state, and thread controls support pause, resume, stop, clear, edit, and update. The Goal chip is separate from chat mode so Ask/Plan/Agent mode and a running goal remain distinct concepts.
gui_related: true
gui_classification_reason: This unit defines user-visible chat activation paths, chips, indicators, and thread controls.
depends_on:
  - GRS-002
unblocks: []
acceptance_criteria:
  - Assistant Chat exposes button/chip/icon, `/goal`, and natural-language activation paths.
  - Running goals have a visible indicator and do not disappear into ordinary chat mode state.
  - Pause/resume/stop/clear/edit/update controls project canonical Goal Runtime state.
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
  - "Pause and resume controls"
  - "Stop and clear controls"
  - "Goal update entry points"
  - "Goal chip is separate from chat mode"
  - "Goal menu actions"
  - "PMConcept alignment"
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
  Assistant Chat projects Goal Runtime task state through a goal task/TODO tracker with item states, update entry points, and visible replan feedback. Material mid-goal changes produce Goal Replan Event feedback in the visible task list. Blocked goal status must show the exact blocker instead of a generic failure label.
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
  - "updates the visible task list"
  - "Goal Replan Event"
  - "Blocked status carries exact blocker"
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
  Assistant Chat displays goal evidence and activity disclosure through runtime popovers, metadata, activity cards, message blocks, thread-sidebar goal summaries, and final goal completion reports. These displays summarize Goal Runtime receipts and evidence without becoming the canonical evidence store.
gui_related: true
gui_classification_reason: This unit defines user-visible evidence, activity, metadata, thread summary, and completion-report displays.
depends_on:
  - GRS-012
  - GRS-014
unblocks: []
acceptance_criteria:
  - Users can inspect goal activity and evidence summaries from the chat surface.
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
  - "Visible goal evidence and activity disclosure"
  - "Runtime popovers and metadata"
  - "Goal activity cards/message blocks"
  - "Goal completion reports"
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
  Assistant Chat shows the parent goal by default and summarizes child goals by default. Child goals are expandable when the user wants details or when a child is blocked or failed. The compact summary may present states like "Goal running", "8/14 tasks", and "3 child goals active", with expanded child-goal status rows that preserve parent/child runtime authority.
gui_related: true
gui_classification_reason: This unit defines collapsible user-visible child-goal and subgoal tree displays.
depends_on:
  - GRS-016
unblocks: []
acceptance_criteria:
  - Child goals are visible as summaries without forcing all detail into the default chat view.
  - Blocked or failed child goals can be expanded and inspected.
  - Chat display does not allow a child goal to complete the parent goal.
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
negative_constraints:
  - Do not force all child-goal detail into the default chat view.
  - Do not hide blocked or failed child goals from the user-facing status surface.
  - Do not let chat UI imply a child can complete the parent goal.
owner_hints:
  - Plans/assistant-chat-design.md
  - Plans/Goal_Runtime_System.md
```
