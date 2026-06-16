# Shard 046: Ledger Compile Addendum - pldg-20260616-001

Source: `Plans/assistant-chat-design.md`

Source lines: L21878-L21988

Source SHA256: `7278e680667f873b62665cc05bff06dc7cf59f60db60f87cb1c65eeda216b594`

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
