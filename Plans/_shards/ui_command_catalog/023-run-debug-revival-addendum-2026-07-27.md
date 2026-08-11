# Shard 023: Run & Debug Revival Addendum - 2026-07-27

Source: `Plans/UI_Command_Catalog.md`

Source lines: L10454-L10840

Source SHA256: `675341194e15f562897bd18f552ac6582a1198cc4095730f8d4ab219e0c87b88`

---

## Run & Debug Revival Addendum - 2026-07-27

This addendum registers, at row level, the `cmd.run_debug.*` classical DAP debugger dispatch family minted by `Plans/Commands_System.md` Run & Debug Revival Addendum §7.2 (39 ids, semantics, availability and confirmation classes, and the closed disabled-reason set owned there and consumed here by reference only), registers the `cmd.run.*` orchestrator run-control trio per §7.3, records the `cmd.debug.*` production wiring-location re-home into the assistant Debug Mode investigation surface, and fixes two stale ContractRef anchors in this document (the retired 5.2.8-era debug-family anchor now targets the §7.1 Debug Mode dispatch family anchor). Every token below is adjudicated in the reconciliation table; the new rows carry the catalog row-level metadata contract (`command_kind`, availability class, confirmation class, `disabled_reasons` subsets drawn only from the closed sets at §7.2/§7.3, and owner) while family semantics, preconditions, and the debug session state machine remain owned by `Plans/Commands_System.md` §7.2/§7.3 and `Plans/FinalGUISpec.md` Run & Debug Revival Addendum F3-482..F3-496 (referenced by unit id only, never restated). The CS-009 boundary stands: `cmd.debug.*` remains the assistant-investigation family (§7.1 owns its semantics, unchanged), and classical debugger dispatch uses only `cmd.run_debug.*`. No existing PlanUnit block, preserved exact token, canonical text, retired bridge, or wiring-matrix row is edited by this addendum. This addendum does not create WorkNodes, NodeSeeds, executable queues, final node manifests, implementation files, runtime artifacts, or production build tasks; `Concepts/**` materials remain source-lineage-only.

Metadata legend for the registration tables: availability classes are written cozy-style as `session_state (<precondition>)` (availability follows the debug session state machine per §7.2), `selection (<precondition>)` (requires a selected subject), and `always` (enabled whenever the owning surface is visible). Confirmation classes are `none`, `two_step`, and `strong` (destructive, dispatching only through the shared confirm surface per §7.2). `disabled_reasons` values come only from the closed sets at `Plans/Commands_System.md` §7.2 (`unsupported`, `not_configured`, `adapter_unavailable`, `session_state_mismatch`, `capability_absent`, `stale_projection`, `permission_required`) and §7.3 (`stale_projection`, `permission_required`, `unreachable`).

### Run & Debug command reconciliation

| Token | Disposition | Canonical target and notes |
|---|---|---|
| **Session lifecycle and stepping** | | |
| `cmd.run_debug.start` | newly registered | registered below; Plans/Commands_System.md §7.2 owns semantics |
| `cmd.run_debug.start_no_debug` | newly registered | registered below; Plans/Commands_System.md §7.2 owns semantics |
| `cmd.run_debug.stop` | newly registered | registered below; Plans/Commands_System.md §7.2 owns semantics |
| `cmd.run_debug.disconnect` | newly registered | registered below; Plans/Commands_System.md §7.2 owns semantics |
| `cmd.run_debug.restart` | newly registered | registered below; Plans/Commands_System.md §7.2 owns semantics |
| `cmd.run_debug.attach` | newly registered | registered below; Plans/Commands_System.md §7.2 owns semantics |
| `cmd.run_debug.pause` | newly registered | registered below; Plans/Commands_System.md §7.2 owns semantics |
| `cmd.run_debug.continue` | newly registered | registered below; Plans/Commands_System.md §7.2 owns semantics |
| `cmd.run_debug.step_over` | newly registered | registered below; Plans/Commands_System.md §7.2 owns semantics |
| `cmd.run_debug.step_into` | newly registered | registered below; Plans/Commands_System.md §7.2 owns semantics |
| `cmd.run_debug.step_out` | newly registered | registered below; Plans/Commands_System.md §7.2 owns semantics |
| `cmd.run_debug.session.select` | newly registered | registered below; Plans/Commands_System.md §7.2 owns semantics |
| **Launch configuration** | | |
| `cmd.run_debug.config.select` | newly registered | registered below; Plans/Commands_System.md §7.2 owns semantics |
| `cmd.run_debug.config.add` | newly registered | registered below; Plans/Commands_System.md §7.2 owns semantics |
| `cmd.run_debug.config.edit` | newly registered | registered below; Plans/Commands_System.md §7.2 owns semantics |
| `cmd.run_debug.config.delete` | newly registered | destructive, `strong`; registered below; Plans/Commands_System.md §7.2 owns semantics |
| `cmd.run_debug.config.open_file` | newly registered | registered below; Plans/Commands_System.md §7.2 owns semantics |
| **Breakpoints** | | |
| `cmd.run_debug.breakpoint.toggle` | newly registered | registered below; Plans/Commands_System.md §7.2 owns semantics |
| `cmd.run_debug.breakpoint.edit` | newly registered | registered below; Plans/Commands_System.md §7.2 owns semantics |
| `cmd.run_debug.breakpoint.add_function` | newly registered | registered below; Plans/Commands_System.md §7.2 owns semantics |
| `cmd.run_debug.breakpoint.remove_all` | newly registered | destructive, `strong`; registered below; Plans/Commands_System.md §7.2 owns semantics |
| `cmd.run_debug.breakpoint.toggle_activation` | newly registered | registered below; Plans/Commands_System.md §7.2 owns semantics |
| `cmd.run_debug.breakpoint.goto_source` | newly registered | registered below; Plans/Commands_System.md §7.2 owns semantics |
| `cmd.run_debug.breakpoint.set_exception_filters` | newly registered | registered below; Plans/Commands_System.md §7.2 owns semantics |
| **Watch and variables** | | |
| `cmd.run_debug.watch.add` | newly registered | registered below; Plans/Commands_System.md §7.2 owns semantics |
| `cmd.run_debug.watch.edit` | newly registered | registered below; Plans/Commands_System.md §7.2 owns semantics |
| `cmd.run_debug.watch.remove` | newly registered | registered below; Plans/Commands_System.md §7.2 owns semantics |
| `cmd.run_debug.watch.remove_all` | newly registered | registered below; Plans/Commands_System.md §7.2 owns semantics |
| `cmd.run_debug.variables.set_value` | newly registered | registered below; Plans/Commands_System.md §7.2 owns semantics |
| `cmd.run_debug.variables.copy_value` | newly registered | registered below; Plans/Commands_System.md §7.2 owns semantics |
| `cmd.run_debug.variables.copy_expression` | newly registered | registered below; Plans/Commands_System.md §7.2 owns semantics |
| `cmd.run_debug.variables.add_to_watch` | newly registered | registered below; Plans/Commands_System.md §7.2 owns semantics |
| **Call stack, console, and process pane** | | |
| `cmd.run_debug.callstack.select_frame` | newly registered | registered below; Plans/Commands_System.md §7.2 owns semantics |
| `cmd.run_debug.callstack.restart_frame` | newly registered | registered below; Plans/Commands_System.md §7.2 owns semantics |
| `cmd.run_debug.callstack.show_execution_point` | newly registered | registered below; Plans/Commands_System.md §7.2 owns semantics |
| `cmd.run_debug.console.evaluate` | newly registered | registered below; Plans/Commands_System.md §7.2 owns semantics |
| `cmd.run_debug.console.clear` | newly registered | registered below; Plans/Commands_System.md §7.2 owns semantics |
| `cmd.run_debug.console.reveal` | newly registered | registered below; Plans/Commands_System.md §7.2 owns semantics |
| `cmd.run_debug.terminal.reveal` | newly registered | registered below; Plans/Commands_System.md §7.2 owns semantics |
| **Orchestrator run-control trio** | | |
| `cmd.run.resume` | newly registered | registered below; Plans/Commands_System.md §7.3 owns semantics |
| `cmd.run.view_log` | newly registered | registered below; Plans/Commands_System.md §7.3 owns semantics |
| `cmd.run.stop` | newly registered | `two_step`; registered below; Plans/Commands_System.md §7.3 owns semantics |
| **Debug investigation verification and cleanup** | | |
| `cmd.debug.record_verification` | newly registered | registered below; Plans/Commands_System.md §7.4 owns semantics; closes the §1.0B verification hole |
| `cmd.debug.run_cleanup` | newly registered | `two_step`; registered below; Plans/Commands_System.md §7.4 owns semantics; closes the §1.0B cleanup hole |

### Run & Debug registration rows

The tables below supply catalog row-level registration only. Labels and preconditions mirror `Plans/Commands_System.md` §7.2/§7.3 verbatim by reference; availability classes, confirmation classes, and disabled-reason subsets map the §7.2/§7.3 class lists without restating family semantics.

Session lifecycle, stepping, and session selection:

| Command ID | Label | command_kind | Availability | Confirmation | disabled_reasons | Owner |
|---|---|---|---|---|---|---|
| `cmd.run_debug.start` | Start Debugging | `domain_action` | session_state (`config_selected && !session_initializing`) | none | `not_configured`, `adapter_unavailable`, `session_state_mismatch`, `stale_projection`, `permission_required` | run_debug |
| `cmd.run_debug.start_no_debug` | Run Without Debugging | `domain_action` | session_state (`config_selected`) | none | `not_configured`, `session_state_mismatch`, `stale_projection` | run_debug |
| `cmd.run_debug.stop` | Stop Session | `domain_action` | session_state (`session_active`) | none | `session_state_mismatch`, `stale_projection` | run_debug |
| `cmd.run_debug.disconnect` | Disconnect | `domain_action` | session_state (`session_active && session_is_attach`) | none | `session_state_mismatch`, `stale_projection` | run_debug |
| `cmd.run_debug.restart` | Restart Session | `domain_action` | session_state (`session_active or session_terminated`) | none | `session_state_mismatch`, `stale_projection` | run_debug |
| `cmd.run_debug.attach` | Attach to Process | `domain_action` | session_state (`adapter_available`) | none | `adapter_unavailable`, `session_state_mismatch`, `permission_required` | run_debug |
| `cmd.run_debug.pause` | Pause | `domain_action` | session_state (`session_running`) | none | `session_state_mismatch`, `stale_projection` | run_debug |
| `cmd.run_debug.continue` | Continue | `domain_action` | session_state (`session_paused`) | none | `session_state_mismatch`, `stale_projection` | run_debug |
| `cmd.run_debug.step_over` | Step Over | `domain_action` | session_state (`session_paused`) | none | `session_state_mismatch`, `stale_projection` | run_debug |
| `cmd.run_debug.step_into` | Step Into | `domain_action` | session_state (`session_paused`) | none | `session_state_mismatch`, `stale_projection` | run_debug |
| `cmd.run_debug.step_out` | Step Out | `domain_action` | session_state (`session_paused`) | none | `session_state_mismatch`, `stale_projection` | run_debug |
| `cmd.run_debug.session.select` | Select Session | `domain_action` | selection (`session_count > 0`) | none | `stale_projection` | run_debug |

Launch configuration:

| Command ID | Label | command_kind | Availability | Confirmation | disabled_reasons | Owner |
|---|---|---|---|---|---|---|
| `cmd.run_debug.config.select` | Select Configuration | `domain_action` | selection (`config_count > 0`) | none | `not_configured`, `stale_projection` | run_debug |
| `cmd.run_debug.config.add` | Add Configuration | `domain_action` | selection (`panel_visible`) | none | `not_configured` | run_debug |
| `cmd.run_debug.config.edit` | Edit Configuration | `domain_action` | selection (`config_selected`) | none | `not_configured`, `stale_projection` | run_debug |
| `cmd.run_debug.config.delete` | Delete Configuration | `domain_action` | selection (`config_selected && !config_in_use_by_active_session`) | strong | `not_configured`, `stale_projection` | run_debug |
| `cmd.run_debug.config.open_file` | Open Configurations File | `navigation_wrapper` | always | none | `unsupported` | run_debug |

Breakpoints:

| Command ID | Label | command_kind | Availability | Confirmation | disabled_reasons | Owner |
|---|---|---|---|---|---|---|
| `cmd.run_debug.breakpoint.toggle` | Toggle Breakpoint | `domain_action` | selection (`breakpoint_selected`) | none | `stale_projection` | run_debug |
| `cmd.run_debug.breakpoint.edit` | Edit Breakpoint | `domain_action` | selection (`breakpoint_selected`) | none | `stale_projection` | run_debug |
| `cmd.run_debug.breakpoint.add_function` | Add Function Breakpoint | `domain_action` | always | none | `capability_absent` | run_debug |
| `cmd.run_debug.breakpoint.remove_all` | Remove All Breakpoints | `domain_action` | selection (`has_breakpoints`) | strong | `not_configured`, `stale_projection` | run_debug |
| `cmd.run_debug.breakpoint.toggle_activation` | Toggle All Activations | `domain_action` | selection (`has_breakpoints`) | none | `not_configured`, `stale_projection` | run_debug |
| `cmd.run_debug.breakpoint.goto_source` | Go to Breakpoint Source | `navigation_wrapper` | selection (`breakpoint_selected`) | none | `stale_projection` | run_debug |
| `cmd.run_debug.breakpoint.set_exception_filters` | Set Exception Filters | `domain_action` | selection (`adapter_supports_exception_filters`) | none | `capability_absent` | run_debug |

Watch and variables:

| Command ID | Label | command_kind | Availability | Confirmation | disabled_reasons | Owner |
|---|---|---|---|---|---|---|
| `cmd.run_debug.watch.add` | Add Watch | `domain_action` | selection (`session_exists_or_panel_visible`) | none | `not_configured`, `stale_projection` | run_debug |
| `cmd.run_debug.watch.edit` | Edit Watch | `domain_action` | selection (`watch_selected`) | none | `stale_projection` | run_debug |
| `cmd.run_debug.watch.remove` | Remove Watch | `domain_action` | selection (`watch_selected`) | none | `stale_projection` | run_debug |
| `cmd.run_debug.watch.remove_all` | Remove All Watches | `domain_action` | selection (`has_watches`) | none | `not_configured`, `stale_projection` | run_debug |
| `cmd.run_debug.variables.set_value` | Set Variable Value | `domain_action` | session_state (`session_paused && variable_writable`) | none | `capability_absent`, `session_state_mismatch`, `stale_projection` | run_debug |
| `cmd.run_debug.variables.copy_value` | Copy Value | `domain_action` | selection (`variable_selected`) | none | `stale_projection` | run_debug |
| `cmd.run_debug.variables.copy_expression` | Copy as Expression | `domain_action` | selection (`variable_selected`) | none | `stale_projection` | run_debug |
| `cmd.run_debug.variables.add_to_watch` | Add to Watch | `domain_action` | selection (`variable_selected`) | none | `stale_projection` | run_debug |

Call stack, console, and process pane:

| Command ID | Label | command_kind | Availability | Confirmation | disabled_reasons | Owner |
|---|---|---|---|---|---|---|
| `cmd.run_debug.callstack.select_frame` | Select Frame | `domain_action` | session_state (`session_paused && frame_present`) | none | `session_state_mismatch`, `stale_projection` | run_debug |
| `cmd.run_debug.callstack.restart_frame` | Restart Frame | `domain_action` | session_state (`session_paused && adapter_supports_restart_frame`) | none | `capability_absent`, `session_state_mismatch`, `stale_projection` | run_debug |
| `cmd.run_debug.callstack.show_execution_point` | Show Execution Point | `navigation_wrapper` | session_state (`session_paused`) | none | `session_state_mismatch`, `stale_projection` | run_debug |
| `cmd.run_debug.console.evaluate` | Evaluate Expression | `domain_action` | session_state (`session_active`) | none | `session_state_mismatch`, `stale_projection` | run_debug |
| `cmd.run_debug.console.clear` | Clear Console | `domain_action` | always | none | `unsupported` | run_debug |
| `cmd.run_debug.console.reveal` | Reveal Debug Tab | `navigation_wrapper` | always | none | `unsupported` | run_debug |
| `cmd.run_debug.terminal.reveal` | Reveal Process Pane | `navigation_wrapper` | session_state (`session_active && console_routing == integrated_terminal`) | none | `unsupported`, `session_state_mismatch`, `stale_projection` | run_debug |

Orchestrator run-control trio:

| Command ID | Label | command_kind | Availability | Confirmation | disabled_reasons | Owner |
|---|---|---|---|---|---|---|
| `cmd.run.resume` | Resume Run | `domain_action` | selection (`run_interrupted`) | none | `stale_projection`, `permission_required`, `unreachable` | orchestrator_runs |
| `cmd.run.view_log` | View Run Log | `navigation_wrapper` | selection (`run_selected`) | none | `stale_projection` | orchestrator_runs |
| `cmd.run.stop` | Stop Run | `domain_action` | selection (`run_active`) | two_step | `stale_projection`, `permission_required`, `unreachable` | orchestrator_runs |

ContractRef: ContractName:Plans/Commands_System.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Orchestrator_Page.md, ContractName:Plans/Run_Graph_View.md, ContractName:Plans/Wiring_Matrix.md

### Debug investigation verification and cleanup rows

These two rows extend the §7.1 `cmd.debug.*` investigation family per `Plans/Commands_System.md` §7.4, closing the verification-recording and cleanup-dispatch holes in the `Plans/assistant-chat-design.md` §1.0B closed phase model. Neither row re-scopes the family: `cmd.debug.*` remains assistant-investigation only (CS-009), and classical DAP dispatch uses `cmd.run_debug.*`.

| Command ID | Label | command_kind | Availability | Confirmation | disabled_reasons | Owner |
|---|---|---|---|---|---|---|
| `cmd.debug.record_verification` | Record Verification Result | `domain_action` | selection (`investigation_active && at_verification_phase`) | none | `stale_projection`, `phase_not_reached` | assistant_debug |
| `cmd.debug.run_cleanup` | Run Investigation Cleanup | `domain_action` | selection (`investigation_active && verification_recorded`) | two_step | `stale_projection`, `phase_not_reached`, `preservation_hold_active` | assistant_debug |

ContractRef: ContractName:Plans/Commands_System.md, ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Wiring_Matrix.md

### Debug family re-home and terminology note

The ten `cmd.debug.*` production wiring rows (`catalog.debug_start` through `catalog.debug_view_evidence`) are re-homed in `Plans/Wiring_Matrix.production.json` from the `Run & Debug > Debug controls` location to the assistant Debug Mode investigation surface, in the same wave as this addendum. `cmd.debug.*` semantics are unchanged and remain owned by `Plans/Commands_System.md` §7.1; classical debugger dispatch uses only `cmd.run_debug.*` per the CS-009 boundary. Terminology follows `Plans/FinalGUISpec.md` F3-495 (referenced).

### UCC-139 - Run & Debug Family Catalog Registration

```yaml
plan_unit_id: UCC-139
unit_type: requirement
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: >-
  All 39 cmd.run_debug.* ids minted by Plans/Commands_System.md Run & Debug Revival
  Addendum §7.2 are registered in this catalog with per-row availability class,
  confirmation class, disabled-reason subset, command_kind, and owner metadata per
  the registration tables above. Plans/Commands_System.md §7.2 owns family
  semantics, preconditions, and the closed disabled-reason set (referenced, never
  restated); the catalog remains the row-level metadata owner per the existing
  catalog/Commands boundary.
gui_related: true
gui_classification_reason: Registers row-level metadata for the visible classical debugger controls, their enabled/disabled states, and destructive confirmation surfaces.
depends_on: [UCC-138]
unblocks: [UCC-140, UCC-141]
acceptance_criteria:
  - Every cmd.run_debug.* id from Plans/Commands_System.md §7.2 appears exactly once in the adjudication table and exactly once in the registration tables above.
  - Each registration row declares exactly one availability class, one confirmation class, a disabled-reason subset drawn only from the §7.2 closed set, a command_kind, and owner run_debug.
  - cmd.run_debug.config.delete and cmd.run_debug.breakpoint.remove_all carry confirmation class strong; all other cmd.run_debug.* rows carry none.
  - No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-plans-verify.py validate-wiring-matrix
risk_class: shell_command_catalog_drift
reasoning_tier: high
context_scope: run_debug_revival
implementation_surfaces:
  - Plans/UI_Command_Catalog.md
  - Plans/Commands_System.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: run_debug_family_catalog_registration
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - user-decision:2026-07-27-run-debug-revival
  - "Plans/Commands_System.md (Run & Debug Revival Addendum §7.2, CS-063; referenced)"
  - "Plans/FinalGUISpec.md (Run & Debug Revival Addendum F3-482..F3-496; referenced)"
preserved_exact_tokens:
  - cmd.run_debug.*
  - cmd.run_debug.start
  - cmd.run_debug.breakpoint.edit
  - cmd.run_debug.console.reveal
negative_constraints:
  - No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit.
  - Do not restate Commands_System §7.2 semantics in this unit or its tables beyond row-level metadata fields.
  - Do not restate the Debug tab or rail panel layout or the debug session state machine here; Plans/FinalGUISpec.md F3-482..F3-496 owns that canon and is referenced by unit id only.
  - Do not re-scope or restate cmd.debug.* semantics; the assistant-investigation boundary per CS-009 and §7.1 stands unchanged.
owner_hints:
  - Plans/UI_Command_Catalog.md
  - Plans/Commands_System.md
```

### UCC-140 - Orchestrator Run-Control Trio Catalog Registration

```yaml
plan_unit_id: UCC-140
unit_type: requirement
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: >-
  cmd.run.resume, cmd.run.view_log, and cmd.run.stop are registered in this
  catalog per Plans/Commands_System.md §7.3 with availability class selection,
  confirmation two_step on cmd.run.stop and none on the other two rows, and
  disabled-reason subsets drawn only from the §7.3 closed set. The registration
  resolves the dangling cmd.run.* references from Plans/FinalGUISpec.md's
  run_interrupted CTA card. Run lifecycle semantics remain owned by
  Plans/Orchestrator_Page.md and Plans/Run_Graph_View.md (referenced, never
  restated).
gui_related: true
gui_classification_reason: The trio backs the visible run_interrupted CTA card primary and secondary actions and the run log reveal.
depends_on: [UCC-139]
unblocks: []
acceptance_criteria:
  - cmd.run.resume, cmd.run.view_log, and cmd.run.stop each appear exactly once in the adjudication table and exactly once in the registration tables above, with owner orchestrator_runs.
  - All three rows declare availability class selection; cmd.run.stop carries confirmation class two_step and the other two carry none.
  - Disabled reasons on the three rows come only from the closed set stale_projection, permission_required, unreachable.
  - No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-plans-verify.py validate-wiring-matrix
risk_class: shell_command_catalog_drift
reasoning_tier: standard
context_scope: run_debug_revival
implementation_surfaces:
  - Plans/UI_Command_Catalog.md
  - Plans/Commands_System.md
  - Plans/Orchestrator_Page.md
  - Plans/Run_Graph_View.md
node_compile_hint:
  mode: orchestrator_run_control_trio_catalog_registration
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - user-decision:2026-07-27-run-debug-revival
  - "Plans/Commands_System.md (Run & Debug Revival Addendum §7.3, CS-064; referenced)"
  - "Plans/FinalGUISpec.md (run_interrupted CTA card contract row; referenced)"
preserved_exact_tokens:
  - cmd.run.resume
  - cmd.run.view_log
  - cmd.run.stop
  - run_interrupted
negative_constraints:
  - No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit.
  - Do not restate run lifecycle semantics here; Plans/Orchestrator_Page.md and Plans/Run_Graph_View.md own run lifecycle canon.
  - Do not mint additional cmd.run.* ids in this unit or its tables.
owner_hints:
  - Plans/UI_Command_Catalog.md
  - Plans/Orchestrator_Page.md
```

### UCC-141 - Debug Family Wiring Re-Home Record

```yaml
plan_unit_id: UCC-141
unit_type: requirement
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: >-
  The ten cmd.debug.* production wiring rows (catalog.debug_start,
  catalog.debug_stop, catalog.debug_pause, catalog.debug_resume,
  catalog.debug_add_breakpoint, catalog.debug_remove_breakpoint,
  catalog.debug_clear_breakpoints, catalog.debug_view_evidence, catalog.debug_step,
  catalog.debug_collect_snapshot) are re-homed in Plans/Wiring_Matrix.production.json
  from the Run & Debug > Debug controls location to the assistant Debug Mode
  investigation surface, with the matrix edited in the same wave as this addendum.
  cmd.debug.* semantics are unchanged and remain owned by Plans/Commands_System.md
  §7.1; the CS-009 boundary is satisfied because classical debugger dispatch uses
  only cmd.run_debug.*. Terminology follows Plans/FinalGUISpec.md F3-495
  (referenced).
gui_related: true
gui_classification_reason: Records which user-visible surface the assistant Debug Mode investigation controls are wired to.
depends_on: [UCC-139, UCC-077]
unblocks: []
acceptance_criteria:
  - All ten catalog.debug_* wiring rows are recorded as re-homed to the assistant Debug Mode investigation surface; no row changes its ui_command_id or handler contract.
  - cmd.debug.* remains scoped to assistant-thread investigation control per CS-009 and Commands_System §7.1; no cmd.debug.* id is re-registered as a classical debugger dispatch id.
  - No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-plans-verify.py validate-wiring-matrix
risk_class: shell_command_catalog_drift
reasoning_tier: standard
context_scope: run_debug_revival
implementation_surfaces:
  - Plans/UI_Command_Catalog.md
  - Plans/Wiring_Matrix.production.json
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: debug_family_wiring_rehome_record
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - user-decision:2026-07-27-run-debug-revival
  - "Plans/Commands_System.md (§7.1 debug dispatch family, CS-009 boundary; referenced)"
  - "Plans/FinalGUISpec.md (F3-495 terminology; referenced)"
preserved_exact_tokens:
  - cmd.debug.*
  - catalog.debug_start
  - catalog.debug_view_evidence
  - cmd.run_debug.*
negative_constraints:
  - No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit.
  - Do not restate or re-scope cmd.debug.* semantics; Plans/Commands_System.md §7.1 owns them unchanged.
  - Do not edit Wiring_Matrix.production.json or Wiring_Matrix.md from this unit; the matrix re-home is recorded here and owned by the wiring matrix editors.
owner_hints:
  - Plans/UI_Command_Catalog.md
  - Plans/Wiring_Matrix.md
```

### UCC-142 - Debug Investigation Verification and Cleanup Catalog Registration

```yaml
plan_unit_id: UCC-142
unit_type: requirement
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: >-
  cmd.debug.record_verification and cmd.debug.run_cleanup are registered with the
  per-row availability, confirmation, and disabled-reason metadata in the table above,
  extending the cmd.debug.* investigation family per Plans/Commands_System.md §7.4 and
  closing the §1.0B verification-recording and cleanup-dispatch holes found in the
  2026-07-27 assistant Debug Mode gap audit. Plans/Commands_System.md §7.4 owns family
  semantics (referenced); the catalog remains the row-level metadata owner per the
  existing catalog/Commands boundary.
gui_related: true
gui_classification_reason: Verification recording and cleanup dispatch surface as investigation banner/header controls in Assistant Chat's Debug Mode overlay.
split_recommended: false
depends_on: [UCC-141, UCC-077]
unblocks: []
acceptance_criteria:
  - Both rows resolve in this catalog with command_kind, availability, confirmation, disabled_reasons, and owner metadata matching Plans/Commands_System.md §7.4.
  - cmd.debug.run_cleanup carries confirmation class two_step and dispatches only through the shared confirm surface.
  - Disabled reasons for both rows come only from the closed set: stale_projection, phase_not_reached, preservation_hold_active.
  - No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-plans-verify.py validate-wiring-matrix
risk_class: shell_command_catalog_drift
reasoning_tier: standard
context_scope: run_debug_revival
implementation_surfaces:
  - Plans/UI_Command_Catalog.md
  - Plans/Commands_System.md
  - Plans/Wiring_Matrix.production.json
node_compile_hint:
  mode: debug_investigation_verification_cleanup_catalog
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - user-decision:2026-07-27-run-debug-revival
  - "Plans/assistant-chat-design.md (§1.0B closed debug phase model; verification/cleanup phases)"
preserved_exact_tokens:
  - cmd.debug.record_verification
  - cmd.debug.run_cleanup
  - verification_recorded
  - preservation_hold_active
negative_constraints:
  - No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit.
  - Do not restate Plans/Commands_System.md §7.4 semantics beyond row-level metadata fields.
  - Do not re-scope these ids to classical DAP debugging; cmd.run_debug.* remains the sole classical namespace (CS-009).
stale_retired_dispositions: []
owner_boundary_notes:
  - "Plans/Commands_System.md §7.1/§7.4 own cmd.debug.* family semantics; this unit owns only catalog row metadata for the verification/cleanup pair."
owner_hints:
  - Plans/UI_Command_Catalog.md
  - Plans/Commands_System.md
```
