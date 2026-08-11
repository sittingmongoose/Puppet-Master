# Shard 023: Run & Debug Revival Addendum - 2026-07-27

Source: `Plans/Commands_System.md`

Source lines: L4361-L4613

Source SHA256: `75c2c8b8c75bf5eecbcc516272f7bdd944f0ff29b3c66b913a1c2f19adc0d3d0`

---

## Run & Debug Revival Addendum - 2026-07-27

This addendum mints the `cmd.run_debug.*` dispatch family for the classical DAP debugger (§7.2), reaffirms the `cmd.debug.*` assistant-investigation boundary (CS-009, §7.1), and registers the `cmd.run.*` orchestrator run-control trio (§7.3) referenced by the `run_interrupted` CTA card (`Plans/FinalGUISpec.md`). Bottom-zone Debug tab and rail "Debug & Run" panel layout and state-machine canon lives in `Plans/FinalGUISpec.md` Run & Debug Revival Addendum (F3-482..F3-496) and is consumed here by unit id only, never restated. `Concepts/**` materials remain source-lineage-only. Row-level command registration remains owned by `Plans/UI_Command_Catalog.md`; this addendum states family semantics, availability and confirmation classes, and the closed disabled-reason set exactly once and does not mint catalog rows. It does not edit existing PlanUnits, retired bridges, `preserved_exact_tokens`, or canonical_text, and it does not create WorkNodes, NodeSeeds, executable queues, final node manifests, implementation files, or production build tasks.

### 7.2 Run & Debug dispatch family (cmd.run_debug.*)

Run & Debug actions use a dedicated canonical UICommand family, `cmd.run_debug.*`, for classical DAP debugger dispatch. These dispatch IDs are internal wiring identifiers for the classical debugger surfaces — the rail "Debug & Run" panel and the bottom-zone Debug tab per `Plans/FinalGUISpec.md` F3-482/F3-485/F3-490 (referenced) — not User Commands. They are distinct from the assistant-investigation `cmd.debug.*` family (§7.1) per the CS-009 boundary: `cmd.debug.*` remains scoped to assistant-thread investigation control, and classical debugger dispatch uses only `cmd.run_debug.*`.

| Command ID | Label | Description | Preconditions |
|---|---|---|---|
| `cmd.run_debug.start` | Start Debugging | Launches the selected launch profile with the debugger | `config_selected && !session_initializing` |
| `cmd.run_debug.start_no_debug` | Run Without Debugging | Launches the selected profile without attaching the debugger | `config_selected` |
| `cmd.run_debug.stop` | Stop Session | Terminates the focused debug session | `session_active` |
| `cmd.run_debug.disconnect` | Disconnect | Detaches from the focused attach-type session | `session_active && session_is_attach` |
| `cmd.run_debug.restart` | Restart Session | Restarts the focused session with the same profile | `session_active or session_terminated` |
| `cmd.run_debug.attach` | Attach to Process | Opens the attach flow and attaches the debugger to the chosen process | `adapter_available` |
| `cmd.run_debug.pause` | Pause | Pauses the focused running session | `session_running` |
| `cmd.run_debug.continue` | Continue | Resumes the focused paused session | `session_paused` |
| `cmd.run_debug.step_over` | Step Over | Steps over the current line | `session_paused` |
| `cmd.run_debug.step_into` | Step Into | Steps into the current call | `session_paused` |
| `cmd.run_debug.step_out` | Step Out | Steps out of the current frame | `session_paused` |
| `cmd.run_debug.session.select` | Select Session | Focuses a session; all debug controls retarget per F3-484 (referenced) | `session_count > 0` |
| `cmd.run_debug.config.select` | Select Configuration | Chooses the active launch profile | `config_count > 0` |
| `cmd.run_debug.config.add` | Add Configuration | Opens the inline add-configuration form | `panel_visible` |
| `cmd.run_debug.config.edit` | Edit Configuration | Opens the inline edit form for a launch profile | `config_selected` |
| `cmd.run_debug.config.delete` | Delete Configuration | Deletes a launch profile (confirmation class below) | `config_selected && !config_in_use_by_active_session` |
| `cmd.run_debug.config.open_file` | Open Configurations File | Opens the project's launch config file in the editor surface | always |
| `cmd.run_debug.breakpoint.toggle` | Toggle Breakpoint | Toggles activation of a breakpoint record | `breakpoint_selected` |
| `cmd.run_debug.breakpoint.edit` | Edit Breakpoint | Opens the inline edit strip (Expression / Hit Count / Log Message) | `breakpoint_selected` |
| `cmd.run_debug.breakpoint.add_function` | Add Function Breakpoint | Adds a function breakpoint via inline name input | always |
| `cmd.run_debug.breakpoint.remove_all` | Remove All Breakpoints | Removes every breakpoint (confirmation class below) | `has_breakpoints` |
| `cmd.run_debug.breakpoint.toggle_activation` | Toggle All Activations | Enables or disables all breakpoints at once | `has_breakpoints` |
| `cmd.run_debug.breakpoint.goto_source` | Go to Breakpoint Source | Opens the breakpoint's file:line in the editor | `breakpoint_selected` |
| `cmd.run_debug.breakpoint.set_exception_filters` | Set Exception Filters | Updates exception breakpoint filter checkboxes | `adapter_supports_exception_filters` |
| `cmd.run_debug.watch.add` | Add Watch | Adds a watch expression via inline input (allowed pre-session; evaluates on next pause) | `session_exists_or_panel_visible` |
| `cmd.run_debug.watch.edit` | Edit Watch | Edits a watch expression inline | `watch_selected` |
| `cmd.run_debug.watch.remove` | Remove Watch | Removes one watch expression | `watch_selected` |
| `cmd.run_debug.watch.remove_all` | Remove All Watches | Clears all watch expressions | `has_watches` |
| `cmd.run_debug.variables.set_value` | Set Variable Value | Sets a variable's value via inline input (capability-gated per F3-494, referenced) | `session_paused && variable_writable` |
| `cmd.run_debug.variables.copy_value` | Copy Value | Copies the variable's display value | `variable_selected` |
| `cmd.run_debug.variables.copy_expression` | Copy as Expression | Copies the variable's evaluate path for watch paste | `variable_selected` |
| `cmd.run_debug.variables.add_to_watch` | Add to Watch | Adds the variable's evaluate path to watches | `variable_selected` |
| `cmd.run_debug.callstack.select_frame` | Select Frame | Selects a frame; variables/watch re-scope and the editor opens the location per F3-491 (referenced) | `session_paused && frame_present` |
| `cmd.run_debug.callstack.restart_frame` | Restart Frame | Restarts the selected frame (capability-gated) | `session_paused && adapter_supports_restart_frame` |
| `cmd.run_debug.callstack.show_execution_point` | Show Execution Point | Returns the editor to the pause location | `session_paused` |
| `cmd.run_debug.console.evaluate` | Evaluate Expression | Evaluates the REPL input against the selected frame with context 'repl' | `session_active` |
| `cmd.run_debug.console.clear` | Clear Console | Clears the Debug Console pane scrollback | always |
| `cmd.run_debug.console.reveal` | Reveal Debug Tab | Focuses/un-collapses the bottom-zone Debug tab per F3-491 (referenced) | always |
| `cmd.run_debug.terminal.reveal` | Reveal Process Pane | Focuses the Debug tab's Process pane when present per F3-490 (referenced) | `session_active && console_routing == integrated_terminal` |

The three stepping commands are enabled only while the focused session is paused, per the `Plans/FinalGUISpec.md` F3-483 debug session state machine (referenced, not restated).

Availability and confirmation classes mirror the CS-062 pattern; every row declares exactly one availability class before palette, shortcut, or route dispatch, and class-less dispatch refuses:

- **Session-state gated** (availability follows the F3-483 state machine: continue is paused-only, pause is running-only, steps are paused-only, stop/disconnect are any-active): the eight session-lifecycle rows, the three stepping rows, the three call-stack rows, `cmd.run_debug.console.evaluate`, and `cmd.run_debug.terminal.reveal`.
- **Selection** (requires a selected subject): `cmd.run_debug.session.select`, the four config CRUD rows (`config.select`, `config.add`, `config.edit`, `config.delete`), the breakpoint rows `breakpoint.toggle`, `breakpoint.edit`, `breakpoint.remove_all`, `breakpoint.toggle_activation`, `breakpoint.goto_source`, and `breakpoint.set_exception_filters`, all four watch rows, and the variables rows `variables.copy_value`, `variables.copy_expression`, and `variables.add_to_watch`.
- **Session-paused** as tabled: `cmd.run_debug.variables.set_value` (`session_paused && variable_writable`, capability-gated per F3-494, referenced).
- **Always**: `cmd.run_debug.config.open_file`, `cmd.run_debug.breakpoint.add_function`, `cmd.run_debug.console.clear`, and `cmd.run_debug.console.reveal`.

Confirmation classes: `cmd.run_debug.config.delete` and `cmd.run_debug.breakpoint.remove_all` carry destructive confirmation class `strong` and dispatch only through the shared confirm surface referenced by the unified expander contract (referenced, not restated); all other rows are confirmation `none`.

Disabled reasons come only from the closed set `unsupported`, `not_configured`, `adapter_unavailable`, `session_state_mismatch`, `capability_absent`, `stale_projection`, `permission_required`:

| disabled_reason | Raised by |
|---|---|
| `unsupported` | `cmd.run_debug.terminal.reveal` when `console_routing != integrated_terminal`; `cmd.run_debug.config.open_file`, `cmd.run_debug.console.clear`, and `cmd.run_debug.console.reveal` when the owning surface is unavailable |
| `not_configured` | `cmd.run_debug.start` and `cmd.run_debug.start_no_debug` (no launch profile); config CRUD rows; `cmd.run_debug.breakpoint.remove_all` and `breakpoint.toggle_activation` (no breakpoints); `cmd.run_debug.watch.add` and `watch.remove_all` (no watches) |
| `adapter_unavailable` | `cmd.run_debug.start` and `cmd.run_debug.attach` when the debug adapter is absent or disconnected |
| `session_state_mismatch` | every session-state gated row when the F3-483 state does not match the row's required state (e.g. continue while running, pause while paused, steps while running, disconnect on a launch-type session) |
| `capability_absent` | `cmd.run_debug.variables.set_value` (non-writable variable), `cmd.run_debug.callstack.restart_frame`, `cmd.run_debug.breakpoint.set_exception_filters` |
| `stale_projection` | any row whose precondition reads session, config, breakpoint, watch, or variable projection state |
| `permission_required` | `cmd.run_debug.start`, `cmd.run_debug.attach`, and any row routed through the central permission/capability gate per CS-009 |

ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/Glossary.md

### 7.3 Orchestrator run-control trio (cmd.run.*)

The orchestrator run-control trio registers the canonical dispatch IDs referenced by the `run_interrupted` CTA card (`Plans/FinalGUISpec.md` CTA Card Contracts): `cmd.run.resume` (Resume Run — resumes an interrupted orchestrator run; precondition `run_interrupted`), `cmd.run.view_log` (View Run Log — reveals the run's log surface; precondition `run_selected`), and `cmd.run.stop` (Stop Run — requests run stop; precondition `run_active`). Run lifecycle semantics are consumed by reference from `Plans/Orchestrator_Page.md` ("Current vs historical run behavior", including the focused-run/historical routing contract, and "Owner-surface command routing") and `Plans/Run_Graph_View.md` ("Focused run and historical routing contract", RGV-002, and §4 data model and identity); this section does not restate them. Availability class is `selection` for all three rows. Confirmation: `cmd.run.stop` is `two_step`; `cmd.run.resume` and `cmd.run.view_log` are `none`. Disabled reasons come only from the closed set `stale_projection`, `permission_required`, `unreachable`: `cmd.run.resume` and `cmd.run.stop` may raise all three; `cmd.run.view_log` may raise `stale_projection`.

ContractRef: ContractName:Plans/Orchestrator_Page.md, ContractName:Plans/Run_Graph_View.md, ContractName:Plans/FinalGUISpec.md

### CS-063 - Run & Debug Command Family Registration

```yaml
plan_unit_id: CS-063
unit_type: requirement
status: accepted
owner_doc: Plans/Commands_System.md
canonical_text: >-
  The cmd.run_debug.* family (39 ids) is the sole minting namespace for classical
  DAP debugger dispatch, registered per §7.2 with availability classes derived
  from the debug session state machine (Plans/FinalGUISpec.md F3-483, referenced)
  and the closed disabled-reason set; class-less dispatch refuses palette,
  shortcut, and route dispatch per the existing dispatch-gate canon. The family
  is distinct from cmd.debug.* (assistant investigation) per CS-009.
gui_related: true
gui_classification_reason: Run & Debug dispatch commands drive visible debugger controls, their enabled/disabled states, and destructive confirmation surfaces.
split_recommended: false
depends_on: [CS-009, CS-062]
unblocks: [CS-064]
acceptance_criteria:
  - Every §7.2 row declares exactly one availability class before palette, shortcut, or route dispatch; class-less dispatch refuses.
  - Destructive rows cmd.run_debug.config.delete and cmd.run_debug.breakpoint.remove_all route the shared confirm surface with confirmation class strong.
  - Disabled reasons come only from the closed set unsupported, not_configured, adapter_unavailable, session_state_mismatch, capability_absent, stale_projection, permission_required.
  - No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - future availability-class and destructive-confirmation dispatch fixtures
risk_class: command_family_drift
reasoning_tier: medium
context_scope: run_debug_revival
implementation_surfaces: [Plans/Commands_System.md, Plans/UI_Command_Catalog.md, Plans/FinalGUISpec.md]
node_compile_hint:
  mode: run_debug_command_family_registration
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - user-decision:2026-07-27-run-debug-revival
  - Plans/FinalGUISpec.md (Run & Debug Revival Addendum F3-482..F3-496; referenced)
preserved_exact_tokens:
  - cmd.run_debug.*
  - cmd.run_debug.start
  - cmd.run_debug.breakpoint.edit
  - cmd.run_debug.console.reveal
  - unsupported
  - not_configured
  - adapter_unavailable
  - session_state_mismatch
  - capability_absent
  - stale_projection
  - permission_required
negative_constraints:
  - No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit.
  - Do not restate the Debug tab or rail panel layout or the debug session state machine here; Plans/FinalGUISpec.md F3-482..F3-496 owns that canon and is referenced by unit id only.
  - Do not re-scope or restate cmd.debug.* semantics; the assistant-investigation boundary per CS-009 and §7.1 stands unchanged.
  - Do not mint catalog rows here; Plans/UI_Command_Catalog.md owns row-level registration.
owner_hints: [Plans/Commands_System.md, Plans/UI_Command_Catalog.md, Plans/FinalGUISpec.md]
```

### CS-064 - Orchestrator Run-Control Trio Registration

```yaml
plan_unit_id: CS-064
unit_type: requirement
status: accepted
owner_doc: Plans/Commands_System.md
canonical_text: >-
  cmd.run.resume, cmd.run.view_log, and cmd.run.stop are registered per §7.3
  with run lifecycle semantics owned by Plans/Orchestrator_Page.md and
  Plans/Run_Graph_View.md; the run_interrupted CTA card's action references
  (Plans/FinalGUISpec.md CTA Card Contracts) now resolve to canonical
  dispatch ids.
gui_related: true
gui_classification_reason: Run-control commands back the visible run_interrupted CTA card primary and secondary actions.
split_recommended: false
depends_on: [CS-063]
unblocks: []
acceptance_criteria:
  - All three cmd.run.* rows declare availability class selection before palette, shortcut, or route dispatch.
  - cmd.run.stop carries confirmation class two_step; cmd.run.resume and cmd.run.view_log carry none.
  - Disabled reasons come only from the closed set stale_projection, permission_required, unreachable.
  - The run_interrupted CTA card primary and secondary action ids resolve to the registered cmd.run.* ids.
  - No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
risk_class: run_control_command_drift
reasoning_tier: medium
context_scope: run_debug_revival
implementation_surfaces: [Plans/Commands_System.md, Plans/UI_Command_Catalog.md, Plans/Orchestrator_Page.md, Plans/Run_Graph_View.md]
node_compile_hint:
  mode: orchestrator_run_control_trio_registration
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - user-decision:2026-07-27-run-debug-revival
  - Plans/FinalGUISpec.md (run_interrupted CTA card contract row)
preserved_exact_tokens:
  - cmd.run.resume
  - cmd.run.view_log
  - cmd.run.stop
  - run_interrupted
negative_constraints:
  - No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit.
  - Do not restate run lifecycle semantics here; Plans/Orchestrator_Page.md and Plans/Run_Graph_View.md own run lifecycle canon.
  - Do not mint additional cmd.run.* ids in this addendum.
owner_hints: [Plans/Orchestrator_Page.md, Plans/Run_Graph_View.md, Plans/UI_Command_Catalog.md]
```

### 7.4 Debug investigation verification and cleanup rows

The §1.0B closed debug phase model (`Plans/assistant-chat-design.md`) makes `verification` mandatory — a fix attempt without a recorded verification result remains `attention_required` or `failed_cleanup`, never `resolved` — and names `cleanup` the terminal mutation-capable phase. The 2026-07-27 gap audit found no command id covering either phase; this section closes both holes inside the existing `cmd.debug.*` investigation family (§7.1 owns the family; these two rows extend it). They are internal wiring identifiers, not User Commands, and they do not alter the classical-debugger boundary (CS-009): `cmd.run_debug.*` remains the sole classical DAP namespace.

| command_id | label | description | precondition |
|---|---|---|---|
| `cmd.debug.record_verification` | Record Verification Result | Records the investigation's verification outcome (resolved or still failing, with evidence refs) so the investigation may leave `attention_required` | `investigation_active && at_verification_phase` |
| `cmd.debug.run_cleanup` | Run Investigation Cleanup | Dispatches removal of temporary instrumentation, temporary env/config, and debug-only runtime state, honoring explicit preservation/hold rules | `investigation_active && verification_recorded` |

Availability class: both rows are `selection` on their tabled preconditions. `cmd.debug.run_cleanup` is mutation-capable (it reverts system state) and carries confirmation class `two_step`; `cmd.debug.record_verification` carries confirmation class `none`. Disabled reasons come only from the closed set: `stale_projection`, `phase_not_reached`, `preservation_hold_active`. Revalidation-gate semantics (target-identity drift, evidence expiry) are owned by `Plans/assistant-chat-design.md` §1.0B and consumed by reference; this section adds no revalidation rules.

### CS-065 - Debug Investigation Verification and Cleanup Registration

```yaml
plan_unit_id: CS-065
unit_type: requirement
status: accepted
owner_doc: Plans/Commands_System.md
canonical_text: >-
  cmd.debug.record_verification and cmd.debug.run_cleanup are registered per §7.4 as
  the investigation family's verification-recording and cleanup-dispatch commands,
  closing the two §1.0B phase-model holes found in the 2026-07-27 gap audit.
  cmd.debug.run_cleanup is mutation-capable and dispatches only behind confirmation
  class two_step; cmd.debug.record_verification records the verification outcome that
  lets an investigation leave attention_required; both draw disabled reasons only from
  the closed §7.4 set, and revalidation-gate semantics remain owned by
  Plans/assistant-chat-design.md §1.0B by reference.
gui_related: true
gui_classification_reason: Verification recording and cleanup dispatch surface as investigation banner/header controls in Assistant Chat's Debug Mode overlay.
split_recommended: false
depends_on: [CS-042, CS-063]
unblocks: []
acceptance_criteria:
  - cmd.debug.record_verification refuses dispatch unless the investigation is active and at the verification phase, and records a resolved or still-failing outcome with evidence refs.
  - cmd.debug.run_cleanup refuses dispatch unless a verification result is recorded, routes confirmation class two_step through the shared confirm surface, and honors explicit preservation/hold rules for temporary instrumentation.
  - Disabled reasons for both rows come only from the closed set: stale_projection, phase_not_reached, preservation_hold_active.
  - No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: command_family_drift
reasoning_tier: standard
context_scope: run_debug_revival
implementation_surfaces: [Plans/Commands_System.md, Plans/UI_Command_Catalog.md, Plans/assistant-chat-design.md]
node_compile_hint:
  mode: debug_investigation_verification_cleanup_registration
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - user-decision:2026-07-27-run-debug-revival
  - Plans/assistant-chat-design.md (§1.0B closed debug phase model; verification/cleanup phases)
preserved_exact_tokens:
  - cmd.debug.record_verification
  - cmd.debug.run_cleanup
  - verification
  - cleanup
negative_constraints:
  - No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit.
  - Do not restate §1.0B revalidation rules here; Plans/assistant-chat-design.md owns them.
  - Do not re-scope these ids to classical DAP debugging; cmd.run_debug.* remains the sole classical namespace (CS-009).
stale_retired_dispositions: []
owner_boundary_notes:
  - "Plans/Commands_System.md §7.1 owns the cmd.debug.* family; this unit registers only the verification/cleanup pair that closes the §1.0B phase-model holes."
owner_hints: [Plans/Commands_System.md, Plans/UI_Command_Catalog.md, Plans/assistant-chat-design.md]
```
