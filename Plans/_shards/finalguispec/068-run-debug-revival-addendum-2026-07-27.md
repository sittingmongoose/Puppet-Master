# Shard 068: Run & Debug Revival Addendum - 2026-07-27

Source: `Plans/FinalGUISpec.md`

Source lines: L33173-L34209

Source SHA256: `75353a8d3278f32136ccd84b1d3526d638c05770acdf4b1c617783ed59ac85de`

---

## Run & Debug Revival Addendum - 2026-07-27

This addendum reactivates the classical DAP Run & Debug rail panel as canonical GUI spec per ratified user decisions 2026-07-27: the panel returns to the left rail with activity-bar icon label "Debug" and open-panel title "Debug & Run"; multi-session debugging is permitted with a status-dot session picker and per-session sub-tabs in the bottom Debug tab; the gear button opens the project's launch config file in the editor surface while "Add Configuration" opens an inline form in the panel; and the bottom-zone Debug tab is the debug session runtime surface (program stdout/stderr, adapter console, session chrome) while the rail panel is the control GUI (launch configs, transport, breakpoints, variables/watch, call stack). The design adapts research lineage from microsoft/vscode `src/vs/workbench/contrib/debug`, zed-industries/zed `crates/debugger_ui`, Lapce, Theia, and nvim-dap-ui; these remain research lineage only, and `Concepts/rail-concepts/**` and `Concepts/pm6-build/**` remain illustrative source-lineage only per Plans/usage-feature.md — concept HTML, CSS, colors, class names, and demo data are never copied into spec or implementation. Command semantics for the new `cmd.run_debug.*` family live in Plans/Commands_System.md Run & Debug Revival Addendum §7.2 with registration in Plans/UI_Command_Catalog.md Run & Debug Revival Addendum; both are referenced here, never restated. This addendum creates no WorkNodes, NodeSeeds, executable queues, implementation files, runtime artifacts, generated wiring rows, production build tasks, final manifests, or PNC-019 receipts.

### F3-482 - Run & Debug Panel Identity and Activity Bar Placement

```yaml
plan_unit_id: F3-482
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  The classical DAP Run & Debug rail panel is reactivated in the left rail per user
  decision 2026-07-27. The activity-bar icon label reads "Debug"; the open panel is
  titled "Debug & Run". The icon sits directly below the Tests icon as its own
  activity-bar entry. Activity-bar icons and shortcuts remain user-adjustable and
  sortable under the existing customization contract, so canonical docs never pin a
  fixed ordinal or Ctrl+N index for this icon. `run_debug` remains the
  cmd.panel.switch destination id for this panel per the Plans/UI_Command_Catalog.md
  closed vocabulary (referenced, not restated). This placement fixes the gap where
  `run_debug` appeared in the ten-id side-panel inventory (F3-042) but in no
  activity-bar group.
gui_related: true
gui_classification_reason: This unit defines the visible activity-bar icon label, panel title, and placement of the Run & Debug rail entry.
split_recommended: false
depends_on: [F3-042]
unblocks: []
acceptance_criteria:
- "The activity-bar icon for the run_debug panel reads \"Debug\" and the open panel is titled \"Debug & Run\"."
- "The Debug icon sits directly below the Tests icon as its own activity-bar entry, with no fixed ordinal or Ctrl+N index pinned anywhere in canonical docs."
- "cmd.panel.switch resolves the run_debug destination id per the UI_Command_Catalog closed vocabulary."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: run_debug_revival
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: run_debug_panel_identity_and_activity_bar_placement
  create_worknodes: false
source_lineage:
- "user-decision:2026-07-27-run-debug-revival"
- "microsoft/vscode src/vs/workbench/contrib/debug (research lineage)"
- "zed-industries/zed crates/debugger_ui (research lineage)"
- "Plans/FinalGUISpec.md:683 (run_debug panel inventory row)"
- "Plans/FinalGUISpec.md:27670 (Activity Bar Groups And Shortcut Binding addendum; run_debug previously ungrouped)"
preserved_exact_tokens:
- "Debug"
- "Debug & Run"
- "run_debug"
- "Tests"
negative_constraints:
- "Do not pin a fixed activity-bar ordinal or Ctrl+N index for the Debug icon; icons and shortcuts remain user-adjustable and sortable under the existing customization contract."
- "Do not restate the cmd.panel.switch closed vocabulary; reference Plans/UI_Command_Catalog.md."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
compatibility_only_notes:
- "Slint portability: the activity-bar entry is a standard rail icon button with a text tooltip; no web-only primitives are required."
stale_retired_dispositions:
- "The Activity Bar Groups And Shortcut Binding addendum's ungrouped run_debug gap is resolved by this placement; the four-group list there remains otherwise unchanged."
owner_boundary_notes:
- "F3-042 owns the side-panel inventory; this unit owns only the run_debug entry's presentation and placement."
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-483 - Debug Session State Machine

```yaml
plan_unit_id: F3-483
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Debug session states are none, initializing, running, paused, terminated, and
  adapter_crashed; transitions flow none to initializing to running, running and
  paused interchange, and any active state to terminated. DAP event-to-UI mapping:
  stopped moves the session to paused and populates inspection surfaces; continued
  moves the session to running and CLEARS inspection values so no stale variables
  show while running; terminated and exited move the session to terminated with the
  exit code retained; output routes to stream surfaces only; thread refreshes the
  thread list. initializing shows progress and disables Start. adapter_crashed
  surfaces an explicit error state with a Restart Adapter action and auto-restarts
  once per the reliability mitigation in F3-259 (referenced). A single
  debug-session store fed by DAP events is the sole truth: every surface (rail
  chip, transport enablement, bottom-tab chrome, status-bar color) derives from it,
  and no surface polls another. Transport enablement law: Continue is shown when
  paused, Pause when running; step commands are enabled only while paused; Stop and
  Disconnect are enabled whenever a session exists; Disconnect replaces Stop for
  attach sessions.
gui_related: true
gui_classification_reason: This unit defines the visible session-state chips, transport enablement, and inspection clear/populate behavior driven by DAP events.
split_recommended: false
depends_on: [F3-259]
unblocks: []
acceptance_criteria:
- "All six states (none, initializing, running, paused, terminated, adapter_crashed) and the stated DAP event-to-UI mapping hold on every debug surface."
- "A continued event clears inspection values; no stale variables render while running."
- "Transport enablement follows the stated law, including the Disconnect-for-attach swap and steps enabled only while paused."
- "Every surface derives from the single debug-session store; no surface polls another surface."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: run_debug_revival
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: debug_session_state_machine
  create_worknodes: false
source_lineage:
- "user-decision:2026-07-27-run-debug-revival"
- "microsoft/vscode src/vs/workbench/contrib/debug (research lineage)"
- "zed-industries/zed crates/debugger_ui (research lineage)"
- "nvim-dap-ui (research lineage)"
- "Plans/FinalGUISpec.md:17921 (F3-259 DAP debugger reliability risk row)"
preserved_exact_tokens:
- "none"
- "initializing"
- "running"
- "paused"
- "terminated"
- "adapter_crashed"
- "stopped"
- "continued"
- "output"
- "thread"
- "Restart Adapter"
- "Continue"
- "Pause"
- "Stop"
- "Disconnect"
negative_constraints:
- "Do not render stale inspection values while a session is running; continued clears them."
- "Do not let any surface derive session state from another surface; the single debug-session store is the sole truth."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
compatibility_only_notes:
- "Slint portability: session state maps to a single observable model with derived bindings per surface; state chips and transport enablement are plain property bindings."
stale_retired_dispositions: []
owner_boundary_notes:
- "This unit owns the session state machine and transport enablement law; F3-259 owns the reliability risk row (timeouts, single auto-restart) it references."
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-484 - Multi-Session Debug Policy

```yaml
plan_unit_id: F3-484
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Multiple concurrent debug sessions per project are permitted; this supersedes the
  F3-259 one-session-per-project cap, whose amendment is recorded there via stale
  disposition. Sessions include child sessions nested under their parents. The
  session picker is a compact dropdown with status dots (starting shows a spinner,
  running green, paused yellow, terminated red with a strikethrough label) and a
  per-row close action on hover. Exactly one session is focused at a time, and ALL
  controls (transport, variables, watch, call stack, console input) act on the
  focused session. Starting a configuration that is already running prompts a
  duplicate-session confirm. The bottom Debug tab shows one sub-tab per session,
  and closing a sub-tab offers terminate.
gui_related: true
gui_classification_reason: This unit defines the visible session picker, focus model, and per-session sub-tab behavior.
split_recommended: false
depends_on: [F3-483]
unblocks: []
acceptance_criteria:
- "Multiple concurrent sessions per project run simultaneously, with child sessions nested under parents in the picker."
- "The picker shows the stated status-dot vocabulary and per-row close on hover."
- "Exactly one focused session exists at a time and every control acts on it."
- "Starting an already-running configuration prompts a duplicate-session confirm; closing a bottom-tab sub-tab offers terminate."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: run_debug_revival
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: multi_session_debug_policy
  create_worknodes: false
source_lineage:
- "user-decision:2026-07-27-run-debug-revival"
- "zed-industries/zed crates/debugger_ui (research lineage; status-dot session picker)"
- "microsoft/vscode src/vs/workbench/contrib/debug (research lineage)"
preserved_exact_tokens:
- "starting"
- "running"
- "paused"
- "terminated"
negative_constraints:
- "Do not enforce a one-session-per-project cap; that cap is retired and recorded as a stale disposition on F3-259."
- "Do not let controls act on any session other than the focused session."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
compatibility_only_notes:
- "Slint portability: the picker dropdown renders via PopupWindow; status dots are precomputed color glyphs with no runtime color mixing."
stale_retired_dispositions: []
owner_boundary_notes:
- "This unit owns session multiplicity, nesting, picking, and focus; session states themselves are owned by F3-483."
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-485 - Run & Debug Panel Layout Canon

```yaml
plan_unit_id: F3-485
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  The Run & Debug rail panel lays out in fixed shelf order: (1) LAUNCH ROW: a
  config dropdown (portal menu listing launch configs grouped with recents first,
  an "Add Configuration…" item, and an "Edit configurations file" item), a primary
  Start Debugging split button with a Run Without Debugging secondary action, and a
  gear button that opens the launch config file in the editor surface; (2) SESSION
  shelf: session rows with status dots and a focused-session highlight, a transport
  strip (Continue/Pause toggle, Step Over, Step Into, Step Out, Restart,
  Stop/Disconnect), the session picker per F3-484, and a Reveal Output action;
  (3) VARIABLES & WATCH unified shelf whose content rules F3-486 owns; (4) CALL
  STACK shelf per F3-487; (5) BREAKPOINTS shelf per F3-488. Shelf order is fixed as
  listed; shelves use the unified shelf-expander contract (F3-472, referenced, not
  restated), and collapse state persists per the F3-475 persistence-key discipline.
  EMPTY STATES: no-config (a welcome state with a "Run and Debug" primary button, a
  "create a configuration" inline form entry, and the gear hidden), configured-idle
  (full launch row, inspection shelves present but empty), running (inspection
  shelves dimmed and emptied per F3-483's cleared-on-continued rule), paused
  (shelves populated), and terminated (a banner with the exit code and a Restart
  action). Panel width, motion, and fitting follow F3-471, F3-473, and F3-480
  (referenced).
gui_related: true
gui_classification_reason: This unit defines the visible section-by-section layout and empty-state vocabulary of the Run & Debug rail panel.
split_recommended: false
depends_on: [F3-472, F3-475]
unblocks: []
acceptance_criteria:
- "The panel renders the five sections in the fixed order LAUNCH ROW, SESSION, VARIABLES & WATCH, CALL STACK, BREAKPOINTS."
- "The launch row carries the config dropdown with recents-first grouping, \"Add Configuration…\", and \"Edit configurations file\" items, the Start Debugging split button with Run Without Debugging, and the gear button opening the config file in the editor surface."
- "All five empty/running/paused/terminated states render exactly as specified, including the hidden gear in no-config and the exit-code banner with Restart in terminated."
- "Shelves follow the F3-472 expander contract and persist collapse state per F3-475."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: run_debug_revival
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: run_debug_panel_layout_canon
  create_worknodes: false
source_lineage:
- "user-decision:2026-07-27-run-debug-revival"
- "microsoft/vscode src/vs/workbench/contrib/debug (research lineage)"
- "zed-industries/zed crates/debugger_ui (research lineage)"
- "eclipse-theia/theia debug plugin (research lineage)"
preserved_exact_tokens:
- "Add Configuration…"
- "Edit configurations file"
- "Start Debugging"
- "Run Without Debugging"
- "Run and Debug"
- "create a configuration"
- "Reveal Output"
- "Restart"
negative_constraints:
- "Do not reorder the five shelves; shelf order is fixed as listed."
- "Do not restate the unified shelf-expander contract; reference F3-472."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
compatibility_only_notes:
- "Slint portability: portal menus render via PopupWindow; shelf collapse is the F3-472/F3-473 animated-height idiom; all surfaces are opaque precomputed rects."
stale_retired_dispositions: []
owner_boundary_notes:
- "This unit owns panel section order and empty states; shelf content rules are owned by F3-486, F3-487, and F3-488; expander mechanics are owned by F3-472; width envelope by F3-471."
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-486 - Unified Variables and Watch Shelf

```yaml
plan_unit_id: F3-486
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Watches live INSIDE the variables shelf as a pinned watch group above the scopes
  (the Zed one-shelf pattern, not two sections). Add-watch is a shelf-header action
  that opens an inline input row. Watch expressions re-evaluate on each pause with
  the DAP evaluate context 'watch', and only the affected expression re-evaluates
  when one is added. Scopes render as a lazy tree with locals first, auto-expanding
  the first non-expensive scope on pause. Variable rows offer context actions: Set
  Value (inline input via DAP setVariable, capability-gated), Copy Value, Copy as
  Expression, and Add to Watch. All values are relative to the selected stack frame
  per F3-487, and all values clear on continue per F3-483.
gui_related: true
gui_classification_reason: This unit defines the visible variables/watch shelf structure, inline inputs, and row context actions.
split_recommended: false
depends_on: [F3-485]
unblocks: []
acceptance_criteria:
- "Watches render as a pinned group above scopes inside the single variables shelf; no separate watch section exists."
- "Watch re-evaluation uses DAP evaluate context 'watch' on each pause, and adding one watch re-evaluates only that expression."
- "Scopes render lazily with locals first and auto-expand of the first non-expensive scope on pause."
- "The four context actions (Set Value, Copy Value, Copy as Expression, Add to Watch) are present, with Set Value capability-gated."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: run_debug_revival
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: unified_variables_and_watch_shelf
  create_worknodes: false
source_lineage:
- "user-decision:2026-07-27-run-debug-revival"
- "zed-industries/zed crates/debugger_ui (research lineage; unified variables/watch shelf)"
- "microsoft/vscode src/vs/workbench/contrib/debug (research lineage)"
preserved_exact_tokens:
- "watch"
- "Set Value"
- "Copy Value"
- "Copy as Expression"
- "Add to Watch"
negative_constraints:
- "Do not split watches into a separate shelf section; the pinned watch group lives inside the variables shelf."
- "Do not duplicate session state-machine semantics; F3-483 owns clear-on-continue and this unit references it."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
compatibility_only_notes:
- "Slint portability: the lazy scope tree renders via Slint model views with on-demand row population; inline input rows are standard line edits."
stale_retired_dispositions: []
owner_boundary_notes:
- "This unit owns variables/watch content rules; the shelf's placement and expander mechanics are owned by F3-485 and F3-472; frame selection is owned by F3-487."
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-487 - Call Stack Shelf

```yaml
plan_unit_id: F3-487
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  The call stack shelf renders a thread-grouped frame list with the main thread
  first. Each frame row shows the frame name plus file:line. Clicking a frame
  selects it (variables and watch re-scope per F3-486) and opens the file in the
  editor surface. Library or otherwise de-emphasized frames collapse into a "Show N
  more frames" row. A Restart Frame inline action appears when the adapter
  capability exists and is hidden otherwise (capability-gated). A shelf-header Show
  Execution Point action returns the editor to the pause location. Thread rows show
  "Paused on {reason}" labels.
gui_related: true
gui_classification_reason: This unit defines the visible call-stack frame list, frame selection, and execution-point affordances.
split_recommended: false
depends_on: [F3-485]
unblocks: []
acceptance_criteria:
- "Frames group by thread with the main thread first, and each frame row shows name plus file:line."
- "Frame click re-scopes variables/watch and opens the file in the editor surface."
- "De-emphasized frames collapse into a \"Show N more frames\" row; Restart Frame is capability-gated and hidden when unsupported."
- "The shelf-header Show Execution Point action returns the editor to the pause location, and thread rows show \"Paused on {reason}\"."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: run_debug_revival
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: call_stack_shelf
  create_worknodes: false
source_lineage:
- "user-decision:2026-07-27-run-debug-revival"
- "microsoft/vscode src/vs/workbench/contrib/debug (research lineage)"
- "zed-industries/zed crates/debugger_ui (research lineage)"
preserved_exact_tokens:
- "Show N more frames"
- "Restart Frame"
- "Show Execution Point"
- "Paused on {reason}"
negative_constraints:
- "Do not render Restart Frame when the adapter lacks the capability; capability-gated controls are hidden, never disabled-empty."
- "Do not duplicate session state-machine semantics; F3-483 owns pause/populate behavior and this unit references it."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
compatibility_only_notes:
- "Slint portability: the thread-grouped frame list renders via Slint model views; file:line labels use the standard editor-open navigation path."
stale_retired_dispositions: []
owner_boundary_notes:
- "This unit owns the call-stack shelf content; frame-driven re-scoping of values is owned by F3-486; shelf placement is owned by F3-485."
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-488 - Breakpoint Canon

```yaml
plan_unit_id: F3-488
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Breakpoint types are line, conditional (expression and/or hit-count), logpoint (a
  log message with {} interpolation that does not pause), function breakpoint, and
  exception breakpoints (adapter-provided filters rendered as checkbox rows). The
  breakpoints shelf lists all breakpoints with an activation toggle per row, a type
  glyph (logpoint diamond, conditional badge showing the condition), a file:line
  label that opens the source in the editor on click, and an inline edit strip
  (mode selector: Expression / Hit Count / Log Message, plus a single-line input;
  Enter commits, Esc cancels) reachable from a per-row edit action. Header actions:
  Add Function Breakpoint, Toggle All Activations, Remove All. Breakpoint states
  are enabled, disabled (dimmed), and unverified (hollow, adapter-rejected at
  session time, with the reason on hover). Breakpoints are project state that
  persists across sessions and app restarts; storage keys are referenced from
  Plans/storage-plan.md, not restated. Editor-gutter sync: the gutter marker and
  the shelf row are two renderers of the same breakpoint record; the record is the
  truth with a single owner, and toggling either renderer updates both.
gui_related: true
gui_classification_reason: This unit defines the visible breakpoint shelf rows, glyphs, edit strip, and gutter-sync rendering contract.
split_recommended: false
depends_on: [F3-485]
unblocks: []
acceptance_criteria:
- "All five breakpoint types (line, conditional, logpoint, function, exception) are representable with the stated glyphs and checkbox filter rows."
- "Each row carries an activation toggle, type glyph, file:line open-source label, and per-row edit action opening the inline edit strip with Enter-commit and Esc-cancel."
- "Header actions are exactly Add Function Breakpoint, Toggle All Activations, and Remove All."
- "Enabled, disabled (dimmed), and unverified (hollow with hover reason) states render distinctly; breakpoints persist across sessions and restarts."
- "Gutter marker and shelf row render one shared breakpoint record; toggling either updates both."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: run_debug_spec_drift
reasoning_tier: standard
context_scope: run_debug_revival
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: breakpoint_canon
  create_worknodes: false
source_lineage:
- "user-decision:2026-07-27-run-debug-revival"
- "microsoft/vscode src/vs/workbench/contrib/debug (research lineage)"
- "nvim-dap-ui (research lineage)"
preserved_exact_tokens:
- "Expression"
- "Hit Count"
- "Log Message"
- "Add Function Breakpoint"
- "Toggle All Activations"
- "Remove All"
- "enabled"
- "disabled"
- "unverified"
negative_constraints:
- "Do not own or restate breakpoint storage keys; Plans/storage-plan.md owns them and this unit references them."
- "Do not render two independent breakpoint truths; gutter and shelf are renderers of one record."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
compatibility_only_notes:
- "Slint portability: shelf rows and the gutter marker bind to one shared model; type glyphs are precomputed assets with no runtime color mixing."
stale_retired_dispositions: []
owner_boundary_notes:
- "This unit owns breakpoint types, row anatomy, states, and gutter sync; shelf placement is owned by F3-485; persistence keys are owned by Plans/storage-plan.md."
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-489 - Launch Profile Schema

```yaml
plan_unit_id: F3-489
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  The project-scoped launch profile record carries the fields: id, label, adapter
  (debug adapter id from the registry per F3-494), request (launch | attach),
  program, args[], env{}, cwd, pre_launch_task (optional task ref), console routing
  (internal_console | integrated_terminal | external_terminal — adapter messages
  always go to the Debug Console surface; program stdout/stderr go to the Debug
  Console only under internal_console, to the Process pane TTY under
  integrated_terminal, and to an OS terminal under external_terminal, per the DAP
  OutputEvent category versus RunInTerminal reverse-request split), stop_on_entry,
  and presentation (group, order, recent flag). Storage is project-scoped with
  storage keys owned by the Plans/storage-plan.md addendum (referenced, not
  restated). The canonical file format is a `.pm/launch.json`-compatible JSON
  document so existing launch.json muscle memory applies. The settings inventory
  row `code.execution.debug-configurations` (Plans/settings_inventory.json)
  surfaces this list under Code & Execution > Execution Environment. This unit
  supersedes the "Settings > Debug" placement prose in the §18 MVP row and the
  "subsections under Settings > Advanced" placement prose in the activity-bar
  settings-registry addendum; both supersessions are recorded here and the old
  blocks are NOT modified.
gui_related: true
gui_classification_reason: This unit defines the launch configuration surface, its editor-file format, and where the configuration list appears in settings.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The launch profile record carries exactly the stated fields, including the three-value console routing enum with the stated OutputEvent versus RunInTerminal semantics."
- "The canonical file is `.pm/launch.json`-compatible JSON; storage is project-scoped with keys referenced from Plans/storage-plan.md."
- "`code.execution.debug-configurations` surfaces the list under Code & Execution > Execution Environment."
- "Both supersessions (Settings > Debug row; Settings > Advanced subsection prose) are recorded in this unit's canonical_text with the old blocks left unmodified."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: run_debug_spec_drift
reasoning_tier: standard
context_scope: run_debug_revival
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: launch_profile_schema
  create_worknodes: false
source_lineage:
- "user-decision:2026-07-27-run-debug-revival"
- "microsoft/vscode src/vs/workbench/contrib/debug (research lineage; launch.json format)"
- "eclipse-theia/theia debug plugin (research lineage)"
- "Plans/FinalGUISpec.md:2991 (Settings > Debug row; superseded placement lineage)"
- "Plans/FinalGUISpec.md:27689 (Settings > Advanced subsection prose; superseded placement lineage)"
preserved_exact_tokens:
- "id"
- "label"
- "adapter"
- "request"
- "launch"
- "attach"
- "program"
- "args[]"
- "env{}"
- "cwd"
- "pre_launch_task"
- "internal_console"
- "integrated_terminal"
- "external_terminal"
- "stop_on_entry"
- ".pm/launch.json"
- "code.execution.debug-configurations"
negative_constraints:
- "Do not own or restate launch-profile storage keys; Plans/storage-plan.md owns them and this unit references them."
- "Do not modify the superseded Settings > Debug or Settings > Advanced placement blocks; the supersessions live only in this unit."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
compatibility_only_notes:
- "Slint portability: the inline add-configuration form and dropdown rows are standard form controls; JSON file editing reuses the existing editor surface."
stale_retired_dispositions:
- "The §18 MVP row placement 'Run & Debug side-panel surface + Settings > Debug' is superseded: the configuration list now surfaces under Code & Execution > Execution Environment via the settings inventory row; the old row stays findable as lineage."
- "The activity-bar settings-registry addendum's 'subsections under Settings > Advanced' placement prose is superseded for debug configurations by the same Code & Execution > Execution Environment placement; the old prose stays findable as lineage."
owner_boundary_notes:
- "This unit owns the launch profile record shape and settings placement; adapter ids come from the F3-494 registry; storage keys are owned by Plans/storage-plan.md; the settings inventory row itself is owned by Plans/settings_inventory.json."
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-490 - Bottom Debug Tab Canon

```yaml
plan_unit_id: F3-490
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  The bottom-zone Debug tab is the debug session runtime surface with three states.
  EMPTY (no session ever): a config picker, a Start Debugging action, and a hint
  that output appears here; this state must not reference any rail panel by name.
  ATTACHED: per-session sub-tabs when more than one session exists per F3-484; a
  session chrome row with adapter identity, a mirrored state chip per F3-483,
  elapsed time, and Terminate/Disconnect actions; a CONSOLE pane that is the
  OutputEvent sink rendering adapter/console messages distinctly from program
  stdout/stderr with stream tags, plus an evaluate-expression REPL input row at the
  bottom that is enabled only while a session exists and keeps per-session input
  history; and a PROCESS pane hosting the debuggee TTY when the launch profile's
  console routing is integrated_terminal per F3-489, absent otherwise. TERMINATED:
  the chrome row shows the exit code plus a Restart action, and console scrollback
  is retained, never destroyed on session end. The Console pane is the Debug
  Console pane whose ownership boundaries (REPL/evaluation versus stdout
  separation) are owned by Plans/Section15_MVP_Promoted_Features_Spec.md —
  referenced, not restated. This unit resolves the bottom-zone enumeration
  inconsistency: the bottom zone's debugger occupant IS this Debug tab, hosting the
  Debug Console pane plus session chrome and the conditional Process pane; the
  §7.20.2 pane list's "Debug Console" entry and the locked-decision "classical
  debugger surface" entry both resolve here. Reveal and focus behavior follows
  F3-491.
gui_related: true
gui_classification_reason: This unit defines the visible bottom-zone Debug tab states, session chrome, console, and conditional process pane.
split_recommended: false
depends_on: [F3-483, F3-489]
unblocks: []
acceptance_criteria:
- "The tab renders EMPTY, ATTACHED, and TERMINATED states exactly as specified; EMPTY names no rail panel."
- "ATTACHED shows per-session sub-tabs per F3-484, the session chrome row (adapter identity, mirrored state chip, elapsed time, Terminate/Disconnect), the CONSOLE pane with stream tags and session-gated REPL input with per-session history, and the PROCESS pane only under integrated_terminal routing."
- "TERMINATED shows exit code plus Restart and retains console scrollback."
- "The §7.20.2 'Debug Console' entry and the locked-decision 'classical debugger surface' entry both resolve to this tab."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: run_debug_spec_drift
reasoning_tier: standard
context_scope: run_debug_revival
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: bottom_debug_tab_canon
  create_worknodes: false
source_lineage:
- "user-decision:2026-07-27-run-debug-revival"
- "microsoft/vscode src/vs/workbench/contrib/debug (research lineage)"
- "zed-industries/zed crates/debugger_ui (research lineage)"
- "Plans/FinalGUISpec.md:1787 (§7.20.2 Debug, Problems, Output, and Ports pane list)"
- "Plans/Section15_MVP_Promoted_Features_Spec.md (Debug Console pane ownership; referenced)"
preserved_exact_tokens:
- "Start Debugging"
- "Terminate"
- "Disconnect"
- "Restart"
- "integrated_terminal"
- "Debug Console"
negative_constraints:
- "Do not re-own Debug Console REPL/evaluation versus stdout separation semantics; Plans/Section15_MVP_Promoted_Features_Spec.md owns them and this unit references them."
- "Do not destroy console scrollback on session end."
- "The EMPTY state must not reference any rail panel by name."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
compatibility_only_notes:
- "Slint portability: the PROCESS pane reuses the existing terminal widget; the CONSOLE pane is a virtualized scrollback view with a bottom input row."
stale_retired_dispositions:
- "The bottom-zone enumeration inconsistency between the §7.20.2 pane list's 'Debug Console' entry and the locked-decision 'classical debugger surface' entry is resolved: both resolve to this Debug tab."
owner_boundary_notes:
- "This unit owns the Debug tab's states, chrome, and pane composition; Debug Console REPL semantics are owned by Plans/Section15_MVP_Promoted_Features_Spec.md; reveal/focus handoff is owned by F3-491."
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-491 - Panel-to-Bottom-Tab Handoff Contract

```yaml
plan_unit_id: F3-491
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Cross-surface handoff uses named actions only: Reveal Output (rail to bottom:
  focuses the bottom Debug tab, un-collapsing the bottom zone if needed), Show in
  Run & Debug (bottom tab to rail: focuses the rail panel), and frame/breakpoint
  click, which performs editor navigation only and never steals panel or tab focus.
  On session start, the bottom Debug tab reveals itself if the bottom zone is
  collapsed but does NOT steal keyboard focus. On pause (a stopped event without
  preserveFocusHint), the editor reveals the top frame and the rail inspection
  shelves populate, and when new output arrives the bottom tab shows an
  unread-output badge instead of stealing focus. Honoring preserveFocusHint
  suppresses the editor reveal. This unit extends the F3-044 reveal/focus owner
  boundary (referenced) and names the command ids that perform reveals:
  cmd.run_debug.console.reveal and cmd.run_debug.terminal.reveal, whose semantics
  are referenced from Plans/Commands_System.md §7.2, not restated.
gui_related: true
gui_classification_reason: This unit defines the visible focus, reveal, and unread-badge behavior across the rail panel, bottom tab, and editor.
split_recommended: false
depends_on: [F3-483]
unblocks: []
acceptance_criteria:
- "Reveal Output and Show in Run & Debug perform the stated focus moves, including bottom-zone un-collapse."
- "Session start reveals the bottom Debug tab without stealing keyboard focus; pause reveals the top frame in the editor unless preserveFocusHint is set."
- "New output produces an unread-output badge on the bottom tab rather than a focus steal; frame/breakpoint clicks navigate the editor only."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: high
context_scope: run_debug_revival
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: panel_to_bottom_tab_handoff_contract
  create_worknodes: false
source_lineage:
- "user-decision:2026-07-27-run-debug-revival"
- "microsoft/vscode src/vs/workbench/contrib/debug (research lineage; preserveFocusHint semantics)"
- "Plans/FinalGUISpec.md:691 (F3-044 Run & Debug side-panel owner boundary; extended)"
- "Plans/Commands_System.md (Run & Debug Revival Addendum §7.2; referenced)"
preserved_exact_tokens:
- "Reveal Output"
- "Show in Run & Debug"
- "preserveFocusHint"
- "cmd.run_debug.console.reveal"
- "cmd.run_debug.terminal.reveal"
negative_constraints:
- "Do not steal keyboard focus on session start or on new output; use reveal-without-focus and the unread-output badge."
- "Do not restate cmd.run_debug.* semantics; reference Plans/Commands_System.md §7.2."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
compatibility_only_notes:
- "Slint portability: reveal-without-focus is a visibility/tab-selection change decoupled from focus transfer; the unread badge is a precomputed dot plus count on the tab header."
stale_retired_dispositions: []
owner_boundary_notes:
- "This unit extends the F3-044 reveal/focus owner boundary for debug surfaces; F3-044 retains the general run_debug owner boundary; command semantics stay owned by Plans/Commands_System.md."
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-492 - Debug Hotkey Bindings

```yaml
plan_unit_id: F3-492
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Debug hotkeys bind through the Rust-side registry per the existing shortcut
  registry rule (referenced): F5 maps to cmd.run_debug.start when no session exists
  and to cmd.run_debug.continue when paused; Ctrl+F5 maps to
  cmd.run_debug.start_no_debug; F10 maps to cmd.run_debug.step_over; F11 maps to
  cmd.run_debug.step_into; Shift+F11 maps to cmd.run_debug.step_out; Shift+F5 maps
  to cmd.run_debug.stop (or disconnect for attach sessions per F3-483's
  Stop/Disconnect swap). Keys are scoped so they dispatch only when the editor,
  rail, or bottom zone has focus, and never inside text inputs. On macOS, F-key
  normalization accounts for the fn-layer so the same bindings hold whether the
  hardware row sends function keys or media keys.
gui_related: true
gui_classification_reason: This unit defines the keyboard-facing debug command bindings and their dispatch scoping.
split_recommended: false
depends_on: [F3-483, F3-059]
unblocks: []
acceptance_criteria:
- "The six bindings (F5, Ctrl+F5, F10, F11, Shift+F11, Shift+F5) map to the stated cmd.run_debug.* commands, including the F5 start-versus-continue split and the attach-session disconnect swap."
- "Bindings dispatch only from editor, rail, or bottom-zone focus and never inside text inputs."
- "macOS F-key normalization preserves the bindings across fn-layer hardware modes."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: run_debug_revival
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: debug_hotkey_bindings
  create_worknodes: false
source_lineage:
- "user-decision:2026-07-27-run-debug-revival"
- "microsoft/vscode src/vs/workbench/contrib/debug (research lineage)"
- "Plans/FinalGUISpec.md:806 (F-key label table)"
- "Plans/FinalGUISpec.md:814 (Rust-side shortcut registry rule)"
preserved_exact_tokens:
- "F5"
- "Ctrl+F5"
- "F10"
- "F11"
- "Shift+F11"
- "Shift+F5"
- "cmd.run_debug.start"
- "cmd.run_debug.continue"
- "cmd.run_debug.start_no_debug"
- "cmd.run_debug.step_over"
- "cmd.run_debug.step_into"
- "cmd.run_debug.step_out"
- "cmd.run_debug.stop"
negative_constraints:
- "Do not redefine the key label list; F3-059 owns shortcut tiers and labels and this unit owns only the command bindings."
- "Do not dispatch debug hotkeys inside text inputs."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
compatibility_only_notes:
- "Slint portability: key dispatch scopes map to focused-surface checks in the Rust-side registry; no platform-specific key handling leaks into Slint view code."
stale_retired_dispositions: []
owner_boundary_notes:
- "F3-059 owns the shortcut tiers and key labels; this unit owns only the debug command bindings; command semantics are owned by Plans/Commands_System.md §7.2."
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-493 - Run & Debug Accessibility Contract

```yaml
plan_unit_id: F3-493
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  The variables/watch and call-stack trees use treegrid semantics (role=treegrid,
  rows role=row, expandable rows exposing aria-expanded). The breakpoint shelf
  exposes each row as a labeled control group (activation toggle, source link,
  edit) with screen-reader labels naming type and state, e.g. "conditional
  breakpoint, enabled, import.rs line 58". Session-state transitions (paused,
  running, terminated, adapter_crashed) are announced via a polite live region. On
  pause, focus is offered to the call stack's top frame without yanking it; the
  user can dismiss the offer. Transport controls carry keybinding hints in their
  tooltips and aria-labels. All shelf expanders follow the unified shelf-expander
  contract's keyboard and aria rules (F3-472, referenced, not restated).
gui_related: true
gui_classification_reason: This unit defines the assistive-technology semantics, announcements, and focus offers for all debug surfaces.
split_recommended: false
depends_on: [F3-483, F3-472]
unblocks: []
acceptance_criteria:
- "Variables/watch and call-stack trees expose treegrid roles with aria-expanded on expandable rows."
- "Breakpoint rows announce type and state in screen-reader labels (e.g. \"conditional breakpoint, enabled, import.rs line 58\")."
- "Session-state transitions announce via a polite live region; pause offers focus to the top frame without taking it, and the offer is dismissible."
- "Transport control tooltips and aria-labels carry keybinding hints; shelf expanders follow F3-472 keyboard/aria rules."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: run_debug_revival
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: run_debug_accessibility_contract
  create_worknodes: false
source_lineage:
- "user-decision:2026-07-27-run-debug-revival"
- "microsoft/vscode src/vs/workbench/contrib/debug (research lineage; debug accessibility patterns)"
preserved_exact_tokens:
- "role=treegrid"
- "role=row"
- "aria-expanded"
- "conditional breakpoint, enabled, import.rs line 58"
negative_constraints:
- "Do not yank focus to the call stack on pause; focus is offered and dismissible."
- "Do not restate shelf-expander keyboard/aria mechanics; reference F3-472."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
compatibility_only_notes:
- "Slint portability: treegrid and live-region semantics map to Slint accessible-role and accessible-label properties; announcements use the platform accessibility bridge."
stale_retired_dispositions: []
owner_boundary_notes:
- "This unit owns debug-surface accessibility semantics; the generic shelf-expander keyboard/aria rules remain owned by F3-472."
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-494 - Debug Adapter Registry and Portability

```yaml
plan_unit_id: F3-494
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  A debug adapter registry, analogous to the LSPSupport server catalog
  (referenced), maps languages to debug adapters with bundle/install policy and
  integrates with Plans/BinaryLocator_Spec.md for adapter binary discovery
  (referenced). This unit closes the deferred "debug adapter model" contract noted
  in the Plans/Runtime_Artifacts_Panel.md consume-list: Runtime_Artifacts consumes
  this registry by reference. DAP capability-gated UI law: any control whose DAP
  capability is absent (restart frame, set value, data breakpoints, terminate
  threads, completions) is hidden, never rendered disabled-empty. Portability:
  under native builds the adapter is a spawned local process; under web/WASM builds
  debugging is web_supported_via_trusted_local_daemon, with the trusted daemon
  owning the adapter subprocess per the §2.4 daemon contract (referenced).
  High-frequency projections (variables, output) throttle repaints per the terminal
  30fps precedent (referenced). Per-request timeouts (10s evaluate, 30s launch) and
  one auto-restart apply per F3-259 (referenced).
gui_related: true
gui_classification_reason: This unit defines how adapter availability and capabilities shape visible debug controls across native and web builds.
split_recommended: false
depends_on: [F3-259]
unblocks: []
acceptance_criteria:
- "The registry maps languages to adapters with bundle/install policy and BinaryLocator-based discovery; Runtime_Artifacts consumes it by reference, closing the deferred debug-adapter-model contract."
- "Every capability-gated control is hidden when its DAP capability is absent; no disabled-empty controls render."
- "Native builds spawn local adapter processes; web/WASM builds run web_supported_via_trusted_local_daemon per the §2.4 daemon contract."
- "High-frequency projections throttle repaints per the terminal 30fps precedent; timeouts and single auto-restart follow F3-259."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: high
context_scope: run_debug_revival
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: debug_adapter_registry_and_portability
  create_worknodes: false
source_lineage:
- "user-decision:2026-07-27-run-debug-revival"
- "microsoft/vscode src/vs/workbench/contrib/debug (research lineage)"
- "lapce/lapce DAP integration (research lineage)"
- "Plans/LSPSupport.md (server catalog analogue; referenced)"
- "Plans/BinaryLocator_Spec.md (adapter binary discovery; referenced)"
- "Plans/Runtime_Artifacts_Panel.md (deferred debug adapter model consume-list entry; closed here)"
preserved_exact_tokens:
- "debug adapter model"
- "web_supported_via_trusted_local_daemon"
- "10s evaluate"
- "30s launch"
negative_constraints:
- "Do not render capability-gated controls as disabled-empty; absent capabilities hide the control."
- "Do not spawn adapter subprocesses in the web/WASM renderer; the trusted daemon owns them."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
compatibility_only_notes:
- "Slint portability: repaint throttling uses the same frame-coalescing idiom as the terminal 30fps precedent; adapter process and daemon transport stay in Rust, never in Slint view code."
stale_retired_dispositions:
- "The deferred 'debug adapter model' contract in Plans/Runtime_Artifacts_Panel.md is closed by this registry; Runtime_Artifacts consumes it by reference."
owner_boundary_notes:
- "This unit owns the adapter registry, capability-gated UI law, and portability policy; reliability timeouts and auto-restart remain owned by F3-259; binary discovery semantics remain owned by Plans/BinaryLocator_Spec.md."
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-495 - Debug Terminology Boundary

```yaml
plan_unit_id: F3-495
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Debug terminology is fixed: the rail icon reads "Debug" and the open panel is
  titled "Debug & Run" (the classical DAP debugger); "Assistant Debug Mode" is the
  chat investigation overlay owned by Plans/assistant-chat-design.md §1.0B
  (referenced); "Debug Console" is the bottom-zone REPL/evaluation pane per
  Plans/Section15_MVP_Promoted_Features_Spec.md (referenced); and the
  `system.advanced.debug-mode` settings row is an app-diagnostics toggle unrelated
  to debugging user code. Docs, palettes, labels, and help text must use these
  names exactly and never collapse them. This unit satisfies the CS-009
  terminology-boundary constraint (referenced). The cmd.debug.* family remains
  assistant-investigation scoped (Plans/Commands_System.md §7.1, referenced) and
  the classical debugger family is cmd.run_debug.* (Plans/Commands_System.md §7.2,
  referenced).
gui_related: true
gui_classification_reason: This unit fixes the user-visible names and labels that distinguish the four debug-adjacent surfaces.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The four names (\"Debug\" icon, \"Debug & Run\" panel, \"Assistant Debug Mode\", \"Debug Console\") and the `system.advanced.debug-mode` row are used exactly and never collapsed across docs, palettes, labels, and help text."
- "cmd.debug.* stays assistant-investigation scoped and cmd.run_debug.* stays classical-debugger scoped."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: run_debug_revival
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: debug_terminology_boundary
  create_worknodes: false
source_lineage:
- "user-decision:2026-07-27-run-debug-revival"
- "Plans/assistant-chat-design.md (§1.0B Assistant Debug Mode; referenced)"
- "Plans/Section15_MVP_Promoted_Features_Spec.md (Debug Console pane; referenced)"
- "Plans/Commands_System.md (§7.1 cmd.debug.* and §7.2 cmd.run_debug.*; referenced)"
preserved_exact_tokens:
- "Debug"
- "Debug & Run"
- "Assistant Debug Mode"
- "Debug Console"
- "system.advanced.debug-mode"
- "cmd.debug.*"
- "cmd.run_debug.*"
negative_constraints:
- "Do not collapse the four debug-adjacent names into one term in any doc, palette, label, or help text."
- "Do not use cmd.debug.* for classical debugger actions or cmd.run_debug.* for assistant-investigation actions."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- "This unit owns only the terminology boundary; Assistant Debug Mode semantics stay owned by Plans/assistant-chat-design.md and Debug Console pane semantics by Plans/Section15_MVP_Promoted_Features_Spec.md."
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-496 - Run & Debug Demo Concept Integration

```yaml
plan_unit_id: F3-496
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  The Concepts/pm6-build PMConcept7 demo carries a `panel-run` view implementing
  F3-485 through F3-488 with fixture data: two sessions (a paused parent
  "tastebook-api — cargo run" and a running child attach session), a populated
  locals scope, two watches, a four-frame main thread, and line, conditional,
  logpoint, and disabled breakpoints plus exception filter rows. The bottom Debug
  tab in the demo implements F3-490's empty and attached states. The demo session
  store mirrors F3-483's state machine so demo actions (start, stop, select,
  reveal) drive both surfaces. Concepts/pm6-build/** remains illustrative
  source-lineage only per Plans/usage-feature.md.
gui_related: true
gui_classification_reason: This unit defines the demo-renderable fixture composition of the run/debug rail panel and bottom tab.
split_recommended: false
depends_on: [F3-485, F3-490]
unblocks: []
acceptance_criteria:
- "The PMConcept7 demo `panel-run` view renders F3-485..F3-488 with the stated fixture data (two sessions, populated locals, two watches, four-frame main thread, four breakpoint kinds plus exception filters)."
- "The demo bottom Debug tab renders F3-490's empty and attached states."
- "Demo actions (start, stop, select, reveal) drive both surfaces through a demo store mirroring F3-483's state machine."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: run_debug_revival
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: run_debug_demo_concept_integration
  create_worknodes: false
source_lineage:
- "user-decision:2026-07-27-run-debug-revival"
- "Concepts/pm6-build (PMConcept7 demo; source-lineage-only per Plans/usage-feature.md)"
- "zed-industries/zed crates/debugger_ui (research lineage)"
preserved_exact_tokens:
- "panel-run"
- "tastebook-api — cargo run"
negative_constraints:
- "Do not treat Concepts/pm6-build/** demo data, HTML, CSS, or class names as spec or implementation input; it stays illustrative source-lineage only per Plans/usage-feature.md."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
compatibility_only_notes:
- "Slint portability: demo fixtures map to static model data behind the same Slint model views used by the live surfaces."
stale_retired_dispositions: []
owner_boundary_notes:
- "This unit owns only demo fixture composition; live panel, tab, and state-machine semantics stay owned by F3-483 through F3-491."
owner_hints:
- "Plans/FinalGUISpec.md"
```
