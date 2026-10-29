# Shard 046: DL-180 to DL-183 — Panel Tab And Layout Families, View State, Aliases And Retired Ids (2026-10-09)

Source: `Plans/Commands_System.md`

Source lines: L7648-L7997

Source SHA256: `72bd14aef5e2b5936e8837401f4bf5be6f3b57863dd29ba8ec9d9c4333b7b8fb`

---

## DL-180 to DL-183 — Panel Tab And Layout Families, View State, Aliases And Retired Ids (2026-10-09)

Jared's home redesign (`Plans/Decision_Log.md#DL-180` to `#DL-183`) gives Home one universal panel system and the terminal one session per tab. The catalog rows are `Plans/UI_Command_Catalog.md#UCC-200` to `#UCC-203`; this addendum is their central registration. CS-100 reserves the `cmd.panel_tab.` and `cmd.workspace_layout.` prefixes, registers the `ui.panel_tab.`, `ui.workspace_layout.` and `ui.terminal.` typed local action prefixes, and rules which panel actions are view state. CS-101 is the register of aliases and retired ids with their replacements, and amends the Run & Debug reveal rows that assumed a bottom Debug tab. It amends CS-060, CS-061 and CS-068 in place; it does not edit CS-088 to CS-093.

Amended 2026-10-10 (DL-186, DL-187; lead rulings F1, F2, F5 and F6): Jared's answers of 2026-10-10 add two typed local action prefixes, `ui.widget_board.` and `ui.widget_preset.`, and four members to the view-state list (a dashboard board's range and scope, a person's presets, a terminal's notification mute and the chat's narrow-window pin); the Debug Console becomes one tab whose session sub-tab dispatches nothing; `cmd.dashboard.add_widget`'s board is the one `cmd.widget.add` carries in its existing `room` field. Renaming and deleting a custom dashboard reuse `cmd.panel_tab.rename` and `cmd.panel_tab.close`, so no command prefix is reserved for dashboards.

### CS-100 - Panel Tab And Layout Command Families, Local Action Prefixes And The View-State Ruling

**Reserved command prefixes.** `cmd.panel_tab.` joins the reserved registry of CS-060, and so does `cmd.workspace_layout.`, which UCC-144 used without a reservation and UCC-200 extends. Plans/UI_Command_Catalog.md stays the only minter. The two families are:

- `cmd.panel_tab.`: `open`, `close`, `rename`, `move`, `keep`, `pin`, `unpin`, `reopen_closed`.
- `cmd.workspace_layout.`: `split`, `move_surface`, `resize_surface`, `set_collapsed`, `close_panel`, `lock`, `apply_named`, `save_named`, `reset`.

The name `panel_tab` keeps panel tabs apart from `workspace_tab_id` (project tabs), from route `tab_id` (page-tab focus) and from the rail's `cmd.panel.switch`, whose closed vocabulary (CS-061) home panels never join. Layout keeps the existing `cmd.workspace_layout.` family and its one-commit gesture rule (CS-068).

**Typed local action prefixes.** `ui.panel_tab.`, `ui.workspace_layout.` and `ui.terminal.` are typed local action prefixes in the pattern of `ui.guided_tour.focus_route` (CS-072): an action under them has no catalog command row, no central registration, no handler of the command bus, no receipt and no event, and is never also a `cmd.*` id. Their members are UCC-200's and UCC-201's tables: `ui.panel_tab.activate`, `ui.workspace_layout.maximize`, `ui.workspace_layout.focus_panel`, and the `ui.terminal.*` actions. A `ui.terminal.mark.*` action that runs a command (Rerun, Insert command, Open output in an editor tab) dispatches that catalog command, which carries its own receipt.

Amended 2026-10-10 (D31; lead ruling L9, corrected to view state with no event): `ui.output.` and `ui.chat_column.` are typed local action prefixes too, under the same rule. Their members are `ui.output.select_channel` (UCC-200: the Output tab's channel, view state of the one `output` tab) and `ui.chat_column.pin_history` (UCC-203: the History list's pin, saved as the v2 record's chat column `history_pinned` with no `workspace.layout_changed` event, revision advance or receipt).

Amended 2026-10-10 (DL-186, DL-187; lead rulings F1, F2, F5 and F6): `ui.widget_board.` and `ui.widget_preset.` are typed local action prefixes too, under the same rule, and six members join: four under the two new prefixes and two under the registered `ui.terminal.` and `ui.chat_column.` prefixes. `ui.widget_board.set_view` sets one dashboard board's own range or scope, view state kept in that board's record (UCC-200). `ui.widget_preset.save`, `ui.widget_preset.rename` and `ui.widget_preset.delete` save, rename and delete one of the person's own presets, which are kept per person across projects (UCC-200, `Plans/Widget_System.md#WS-030`); using a preset is not a typed local action but the catalog command `cmd.widget.reset_layout` with `set_id: user:<preset_id>`. `ui.terminal.mute_notifications` turns one terminal's notifications off or on, that tab's own state (UCC-201). `ui.chat_column.keep_open` keeps the chat open in narrow windows, the chat's own preference that is no Settings row (UCC-203). Choosing the Debug Console's session sub-tab dispatches nothing and has no action id: the session shown is view state of the one `debug-console` tab (DL-187, D33).

**The view-state ruling** (the decision CDRY-006 left open for panel tabs):
- Choosing a tab (a click, the "+N" list, the every-tab and recent-tab lists, the tab keys), maximizing or restoring a panel, and focusing a panel are view state: `ui.panel_tab.activate`, `ui.workspace_layout.maximize`, `ui.workspace_layout.focus_panel`. They are written with the layout record's view state (active tab, focused panel, maximized panel, recent-tab order, `Plans/storage-plan.md#SP-330`) and emit no receipt and no event.
- Opening the "+" menu, the "+N" list, the every-tab and recent-tab lists, a panel menu, a tab menu, a picker or a name prompt, hovering, the drag ghost and landing previews, and the narrow ladder's own states (the rail overlay, the folded chat strip, the panel switcher) dispatch nothing and are never saved.
- Every committed structural change is one catalog command with a receipt that emits the one existing event `workspace.layout_changed` (`Plans/Contracts_V0.md#CV-361`): an open that adds a tab, close, move, keep, pin, unpin, rename, split, move a panel, resize, collapse, close a panel, lock, apply, save or restore a layout. An open that only reveals an existing tab emits nothing. A failed commit rolls back and emits nothing. No event family is added.
- These structural rows are `shell_view` in the three-way taxonomy: they change what the layout holds and persist the layout record, and they own no domain identity. The open routes that keep their domain ids (`cmd.file.open`, `cmd.nav.open_subject`, `cmd.browser.open_workspace_preview`, `cmd.terminal.open`) stay `navigation_wrapper` and resolve through the one opening module (`Plans/FinalGUISpec.md#F3-634`, `Plans/DRY_Rules.md#DR-071`).
- Every new row declares one availability class and its confirmation class as CS-062 requires; a close whose kind asks first (a dirty buffer, a running terminal) is `two_step`, answered inline.

```yaml
plan_unit_id: CS-100
unit_type: constraint
status: accepted
owner_doc: Plans/Commands_System.md
canonical_text: >-
  The reserved command-prefix registry of CS-060 extends to cmd.panel_tab. (open, close, rename,
  move, keep, pin, unpin, reopen_closed) and cmd.workspace_layout. (split, move_surface,
  resize_surface, set_collapsed, close_panel, lock, apply_named, save_named, reset), with
  Plans/UI_Command_Catalog.md the only minter. panel_tab is kept apart from workspace_tab_id, from
  route tab_id and from cmd.panel.switch, whose closed vocabulary home panels never join.
  ui.panel_tab., ui.workspace_layout., ui.terminal., ui.output. and ui.chat_column. are typed local
  action prefixes in the pattern of ui.guided_tour.focus_route: no catalog command row, no central
  registration, no receipt, no event, and never also a cmd.* id; a ui.terminal.mark.* action that
  runs a command dispatches that catalog command. View state is ruled: choosing a tab, maximizing or
  restoring a panel and focusing a panel are ui.panel_tab.activate, ui.workspace_layout.maximize and
  ui.workspace_layout.focus_panel, written with the layout record's view state; selecting Output's
  channel is ui.output.select_channel, view state of the one output tab, never part of its id;
  pinning the chat's History list is ui.chat_column.pin_history, view state saved in the layout
  record's chat column; amended 2026-10-10 (DL-186, DL-187; lead rulings F1, F2, F5 and F6):
  ui.widget_board. and ui.widget_preset. are typed local action prefixes too; a dashboard board's
  range and scope are ui.widget_board.set_view, saving, renaming and deleting a preset are
  ui.widget_preset.save, ui.widget_preset.rename and ui.widget_preset.delete, a terminal's mute is
  ui.terminal.mute_notifications and the chat's narrow-window pin is ui.chat_column.keep_open, each
  with no receipt and no event; using a preset stays the catalog command cmd.widget.reset_layout
  with set_id; choosing the Debug Console's session sub-tab dispatches nothing; opening any menu,
  list, picker or prompt, hovering, drag previews and the narrow ladder's states dispatch nothing
  and are never saved. Every committed structural change is one shell_view catalog command with a
  receipt that emits workspace.layout_changed; an open that only reveals emits nothing; a failed
  commit rolls back; no event family is added. Open routes that keep their domain ids stay
  navigation_wrapper and resolve through the one opening module. F3-632's picker Back,
  Escape/Left/empty-query Backspace and level restoration are typed local navigation
  ui.panel_tab.picker_back, with no catalog primary, receipt, event or persisted menu stack. A final
  picked item still uses its existing owner command.
gui_related: true
gui_classification_reason: "Registers the command families and local action prefixes behind every universal panel and terminal control and rules which of them are view state."
split_recommended: false
depends_on: [DL-180, DL-181, DL-186, DL-187, CS-060, CS-061, CS-062, CS-068, CS-072, UCC-200, UCC-201]
unblocks: [WM-090, WM-091, UIW-040, UIW-041]
acceptance_criteria:
  - "The reserved-prefix registry names cmd.panel_tab. and cmd.workspace_layout. with Plans/UI_Command_Catalog.md as the only minter, and no User Command can be created under them."
  - "No id under ui.panel_tab., ui.workspace_layout., ui.terminal., ui.output. or ui.chat_column. has a catalog command row, a receipt or an event, and none is also a cmd.* id."
  - "Choosing a tab, maximizing or restoring and focusing a panel emit no receipt and no event; every committed structural change emits exactly one workspace.layout_changed."
  - "Menu, list, picker and prompt openings, hover, drag previews and narrow-ladder states dispatch nothing and write nothing."
  - "Selecting the Output channel uses ui.output.select_channel with no command, receipt or event and never changes the output tab id."
  - "ui.widget_board.set_view, ui.widget_preset.save, ui.widget_preset.rename, ui.widget_preset.delete, ui.terminal.mute_notifications and ui.chat_column.keep_open have no catalog row, receipt or event, and applying a preset dispatches cmd.widget.reset_layout with set_id."
  - "Choosing the Debug Console's session sub-tab dispatches nothing."
validation_surfaces:
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
risk_class: home_panels_terminal_redesign_drift
reasoning_tier: high
context_scope: home_panels_terminal
implementation_surfaces:
  - Plans/Commands_System.md
  - Plans/UI_Command_Catalog.md
  - Plans/Wiring_Matrix.md
node_compile_hint:
  mode: reserved_prefix_registry_extension
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- /mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/canon-inputs/followup/DECISIONS-ADDENDUM-2.md,
  SHA-256 1eecc96b03a1a774f52d06420c913553d5f5d1917e1bd5705e2f6e0bbc11fad6 (D31)
- Plans/Commands_System.md CDRY-006 What stays view state (a prose heading with no PlanUnit; cited, not
  a dependency (lead ruling L22, 2026-10-10))
- Plans/Decision_Log.md#DL-180
- Plans/Decision_Log.md#DL-181
- /mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/DECISIONS.md (SHA-256 0d2b45466c91734e15fd8659e9a8e3b17b70d92be785421e57e084dc8daf6b64)
- /mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/canon-inputs/panels-CONTRACT-v1-778c8494e6.md
  (SHA-256 aa16fc080f44f6824b0ef32a2b568bfcae81277b6962caaba1b441015d68dae9; section 8; concept lineage
  only)
- Plans/Decision_Log.md#DL-186
- Plans/Decision_Log.md#DL-187
- /mnt/Cursor/share/puppet-master/2026-10-16-plans-pass2/sources/2026-10-15-panels-picker-back--NOTES.md,
  SHA-256 29bac44f166cb8e0e67f4f00634cb15d0a3be576eb2f68e7e19606f3a4a1a71c (source lineage; not native
  certification)
preserved_exact_tokens:
  - "ui.widget_board."
  - "ui.widget_preset."
  - "ui.widget_board.set_view"
  - "ui.terminal.mute_notifications"
  - "ui.chat_column.keep_open"
  - "output"
  - "ui.output.select_channel"
  - "cmd.panel_tab."
  - "cmd.workspace_layout."
  - "ui.panel_tab."
  - "ui.workspace_layout."
  - "ui.terminal."
  - "ui.panel_tab.activate"
  - "ui.workspace_layout.maximize"
  - "ui.workspace_layout.focus_panel"
  - "workspace.layout_changed"
negative_constraints:
  - "Do not mint commands here; Plans/UI_Command_Catalog.md mints every id under the reserved prefixes."
  - "Do not register a ui.* action as a command, give it a receipt or an event, or let it share an action with a cmd.* id."
  - "Do not add an event family for panel or tab changes."
compatibility_only_notes: []
stale_retired_dispositions:
  - "Amended 2026-10-10 (D31, DL-180): Output uses one tab with its channel as view state; only an explicit channel split-off uses output:<channel>."
  - "Amended 2026-10-10 (D31; lead ruling L9, corrected to view state with no event): Registers ui.output. and ui.chat_column. as typed local action prefixes and adds the History pin, ui.chat_column.pin_history, to the view-state list."
  - "Amended 2026-10-09 (DL-180): CDRY-006's local-tab rule now covers panel tab activation explicitly; CS-060's registry gains two prefixes."
  - "Amended 2026-10-10 (DL-186, DL-187; lead rulings F1, F2, F5 and F6): ui.widget_board. and ui.widget_preset. become typed local action prefixes; ui.widget_board.set_view, the three preset actions, ui.terminal.mute_notifications and ui.chat_column.keep_open join the view-state list; the Debug Console's session sub-tab dispatches nothing."
owner_hints:
  - Plans/Commands_System.md
  - Plans/UI_Command_Catalog.md
```

ContractRef: ContractName:Plans/Decision_Log.md#DL-180, ContractName:Plans/UI_Command_Catalog.md#UCC-200, ContractName:Plans/UI_Command_Catalog.md#UCC-201, ContractName:Plans/Commands_System.md#CS-060, ContractName:Plans/Contracts_V0.md#CV-361

### CS-101 - Aliases And Retired Ids Of The Panel And Terminal Redesign

**Aliases** (recorded metadata only: no handler, row semantics or event of their own):

| Alias | Canonical id | Source |
|---|---|---|
| `cmd.editor.close_tab` | `cmd.panel_tab.close` | UCC-200 |
| `cmd.dashboard.add_widget` (its `dashboard_id` read as the board id `cmd.widget.add` carries in `room`; amended 2026-10-10, DL-186) | `cmd.widget.add` | UCC-202 |
| `cmd.browser.devtools.open` | `cmd.browser.open_devtools` | UCC-202 |
| `cmd.terminal.focus_session` | `cmd.terminal.focus` | UCC-202 |
| `cmd.panel.detach` | `cmd.panel.undock` | CS-061, unchanged |
| `cmd.workspace_layout.size_surface` (concept token, not a row) | `cmd.workspace_layout.resize_surface` | CS-068, unchanged |

`cmd.file.open`, `cmd.nav.open_subject`, `cmd.browser.open_workspace_preview` and `cmd.terminal.open` are not aliases: they keep their ids and handlers' contracts as domain open routes and resolve through the one opening module with CV-360's placement fields (UCC-200).

**Retired ids** (no handler, no alias; a caller dispatches the replacement):

| Retired id | Replacement |
|---|---|
| `cmd.editor.open_panel` | `cmd.workspace_layout.split`, or an open with `where: panel` |
| `cmd.editor.close_panel` | `cmd.workspace_layout.close_panel` (it closes the panel's tabs, so it is not an alias) |
| `cmd.artifacts.open_panel` (never registered) | `cmd.nav.open_subject` with an artifact subject |
| `cmd.terminal.restart_session` | `cmd.terminal.restart_replace` |
| `cmd.terminal.move_workgroup`, `cmd.terminal.move_pane`, `cmd.terminal.move_tab_to_section`, `cmd.terminal.reorder_workgroup`, `cmd.terminal.reorder_subtab`, `cmd.terminal.embed_in_editor`, `cmd.terminal.remove_from_editor`, `cmd.terminal.undock_all_from_editor` | `cmd.panel_tab.move` |
| `cmd.terminal.split_pane`, `cmd.terminal.add_leaf` | `cmd.workspace_layout.split` with `{ kind: terminal, profile, cwd }` |
| `cmd.terminal.close_pane`, `cmd.terminal.close_tab` | `cmd.panel_tab.close` |
| `cmd.terminal.new_tab` | `cmd.panel_tab.open` with `{ kind: terminal, profile? }` |
| `cmd.terminal.activate_workgroup`, `cmd.terminal.activate_subtab` | `ui.panel_tab.activate` |
| `cmd.terminal.rename_tab` | `cmd.panel_tab.rename` |
| `cmd.terminal.pin_tab` | `cmd.panel_tab.pin` / `cmd.panel_tab.unpin` |
| `cmd.terminal.reattach_section`, `cmd.terminal.detach_section`, `cmd.terminal.detach` | none: no tab pops out (only the chat does, UCC-203); a terminal tab moves with `cmd.panel_tab.move` |

**The Run & Debug reveal rows.** `cmd.run_debug.console.reveal` and `cmd.run_debug.terminal.reveal` (section 7.2's table) keep their ids, labels and availability, but no longer assume a bottom-zone Debug tab: Reveal Debug Tab reveals the Debug Console tab (`debug_console`) wherever it is, and Reveal Process Pane reveals the tab that hosts the debuggee's integrated terminal wherever it is, each by the one opening module's reveal rule (activate it, pull it out of "+N", expand its collapsed panel). Neither opens a second tab for the same id. Amended 2026-10-10 (DL-187, D33): the Debug Console is one tab, `debug-console`, with a sub-tab per debug session, so Reveal Debug Tab opens or reveals that one tab with the session's sub-tab shown; a tab id `debug-console:<session>` from before folds into `debug-console` with that session shown (`Plans/FinalGUISpec.md#F3-635`) and is never a second tab.

**Shortcuts.** Close tab stays Ctrl+W in the native app and is answered as Alt+W in the web client, dispatching `cmd.panel_tab.close`; CS-086's text-field clash with Ctrl+W is unchanged and still the Commands and Shortcuts owner's to decide.

```yaml
plan_unit_id: CS-101
unit_type: command_disposition
status: accepted
owner_doc: Plans/Commands_System.md
canonical_text: >-
  The redesign's aliases are recorded metadata only: cmd.editor.close_tab to cmd.panel_tab.close,
  cmd.dashboard.add_widget to cmd.widget.add (dashboard_id read as the board id carried in room; amended 2026-10-10,
  DL-186), cmd.browser.devtools.open to
  cmd.browser.open_devtools and cmd.terminal.focus_session to cmd.terminal.focus, beside the unchanged
  cmd.panel.detach and cmd.workspace_layout.size_surface. cmd.file.open, cmd.nav.open_subject,
  cmd.browser.open_workspace_preview and cmd.terminal.open are not aliases: they keep their ids as domain open routes
  through the one opening module. Retired with replacements: cmd.editor.open_panel (cmd.workspace_layout.split or an
  open with where panel), cmd.editor.close_panel (cmd.workspace_layout.close_panel), cmd.artifacts.open_panel
  (cmd.nav.open_subject), cmd.terminal.restart_session (cmd.terminal.restart_replace), the terminal section,
  workgroup, sub-tab, pane and editor-stack ids (cmd.panel_tab.move, cmd.workspace_layout.split with a terminal spec,
  cmd.panel_tab.close, cmd.panel_tab.open, ui.panel_tab.activate, cmd.panel_tab.rename, cmd.panel_tab.pin), and
  cmd.terminal.reattach_section, cmd.terminal.detach_section and cmd.terminal.detach with no replacement because no
  tab pops out. cmd.run_debug.console.reveal and cmd.run_debug.terminal.reveal keep their ids and reveal the Debug
  Console tab and the debuggee's terminal tab wherever they are, never a bottom-zone Debug tab. Close tab is Ctrl+W
  natively and Alt+W in the web client; CS-086's text-field clash is unchanged. Amended 2026-10-10 (DL-187, D33): the
  Debug Console reveal opens or reveals the one debug-console tab with that session's sub-tab shown, and an older
  debug-console:<session> tab id folds into it.
gui_related: true
gui_classification_reason: "Names, for every caller, the one id each retired or aliased panel and terminal action now dispatches."
split_recommended: false
depends_on: [DL-180, DL-181, DL-186, DL-187, CS-100, CS-061, CS-063, CS-068, CS-086, UCC-200, UCC-201, UCC-202, UCC-203]
unblocks: [WM-090, WM-091, WM-092]
acceptance_criteria:
  - "Every alias resolves to one canonical id with no handler, production row of its own or event."
  - "No production wiring row dispatches a retired id; each caller dispatches the replacement this unit names."
  - "cmd.run_debug.console.reveal and cmd.run_debug.terminal.reveal never assume a bottom-zone Debug tab and never open a second tab for an id already open."
  - "The Debug Console reveal lands in the one debug-console tab with the session's sub-tab shown, and no debug-console:<session> tab is ever opened beside it."
validation_surfaces:
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-plans-verify.py validate-wiring-matrix
risk_class: home_panels_terminal_redesign_drift
reasoning_tier: high
context_scope: home_panels_terminal
implementation_surfaces:
  - Plans/Commands_System.md
  - Plans/UI_Command_Catalog.md
  - Plans/Wiring_Matrix.md
  - Plans/Wiring_Matrix.production.json
node_compile_hint:
  mode: static_command_disposition_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Plans/Decision_Log.md#DL-180"
  - "Plans/Decision_Log.md#DL-181"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/plans-terminal-audit.md (SHA-256 12f95fa6f79b1c0a1f9f34b1eee004cac9edacfd8e0a7f4e6495fe1af23aabe3; the Commands_System section 7.2 reveal row)"
  - "Plans/Decision_Log.md#DL-186"
  - "Plans/Decision_Log.md#DL-187"
preserved_exact_tokens:
  - "debug-console"
  - "cmd.editor.close_tab"
  - "cmd.dashboard.add_widget"
  - "cmd.browser.devtools.open"
  - "cmd.terminal.focus_session"
  - "cmd.terminal.restart_session"
  - "cmd.editor.open_panel"
  - "cmd.editor.close_panel"
  - "cmd.artifacts.open_panel"
  - "cmd.run_debug.console.reveal"
  - "cmd.run_debug.terminal.reveal"
negative_constraints:
  - "Do not give an alias a handler, a production row of its own or an event."
  - "Do not revive a retired id as an alias."
  - "Do not let a reveal command assume a fixed bottom zone or open a duplicate tab."
compatibility_only_notes:
  - "The four aliases are compatibility metadata for callers that still name them."
stale_retired_dispositions:
  - "Amended 2026-10-09 (DL-180): section 7.2's Reveal Debug Tab and Reveal Process Pane rows lose their bottom-zone wording."
  - "Amended 2026-10-10 (DL-186): cmd.dashboard.add_widget's dashboard_id is read as the board id that cmd.widget.add carries in room."
  - "Amended 2026-10-10 (DL-187, D33): the Debug Console reveal opens or reveals the one debug-console tab with the session shown; debug-console:<session> folds into it."
owner_hints:
  - Plans/Commands_System.md
  - Plans/UI_Command_Catalog.md
  - Plans/Wiring_Matrix.md
```

ContractRef: ContractName:Plans/UI_Command_Catalog.md#UCC-200, ContractName:Plans/UI_Command_Catalog.md#UCC-201, ContractName:Plans/UI_Command_Catalog.md#UCC-202, ContractName:Plans/UI_Command_Catalog.md#UCC-203, ContractName:Plans/Commands_System.md#CS-100

### CS-102 - Customize And Notification Local Actions

```yaml
plan_unit_id: CS-102
unit_type: requirement
status: accepted
owner_doc: Plans/Commands_System.md
canonical_text: >-
  UCC-204 mints cmd.editor.appearance.set under the existing reserved cmd.editor. prefix. Its
  expected_state_hash guards the editor tab's saved nonstructural state; a mismatch refuses as
  stale_projection, a replay with the same idempotency key returns the existing receipt, and
  conflicting reuse refuses. Validation/permission, bounded serialization, write and readback
  complete before applied is returned; failure retains or restores the earlier state.
  Plans/editor_appearance.schema.json closes fields and fixed failure reasons; no arbitrary code,
  path payload or unknown field is accepted. UI_Command_Catalog remains the only command minter.
  ui.appearance.open, close, set_scope, search, preview_scheme, cancel_preview, select_token and
  try_sample are typed local actions, parameterized by editor/terminal and target tab where
  available; Indentation opens the same editor screen at its indentation group. Scope selection is
  saved tab view state only when invoked from that tab; Settings' All entry is temporary.
  ui.notifications.open, close, expand_group, mark_visible_read, mark_all_read (the inbox header's Mark all read,
  marking every retained item read; added 2026-10-17, DL-228), dismiss_toast and explain_state
  operate the one shared inbox's presentation/read projection and never resolve its source.
  Mark_visible_read names only notices actually shown for the F3-453 dwell. No catalog row,
  dispatcher receipt or domain event belongs to these ui.* ids. Picker/menu openings, hover,
  keyboard gallery navigation before selection, change-meter display, drag previews, glow and timer
  suspension dispatch nothing and write nothing. Choosing a background file returns a validated
  owner asset reference then uses the selected scope's writer; importing a scheme uses the existing
  import command. Sample cursor/caret, bell, typing, problem and Step back trials affect only
  isolated sample state. Committed quick sets, reset, fields and token edits always use UCC-204's
  writers, never a view-local bypass. The production/exclusion census is WM-093/UIW-043 and
  Plans/pm7_control_bindings.json. SSYS-010 retires the visible app-theme preview and
  cmd.theme.preview; it is not normalized to the internal Settings preview command. The retained
  scheme-preview local actions belong only to the editor/terminal Customize screens.
  ui.terminal.preset.save, ui.terminal.preset.rename, ui.terminal.preset.delete and
  ui.terminal.preset.undo are typed local library actions under the existing ui.terminal. prefix.
  Unlike a transient preview, they persist only SP-331's computer-local preset library, with its
  validation/readback and no dispatcher receipt or event. Naming/selection/search remain view-local.
  Applying a preset always uses UCC-204's existing This or All writer and never writes appearance
  through a local action.
  Amended 2026-10-17 (DL-228): background design tiles preview through the same ui.appearance.preview_scheme
  and cancel_preview as scheme tiles, after the same 110 ms rest (F3-642). ui.terminal.degauss is the Retro
  Try it action, a local one-shot with no receipt (F3-643). Alt+Shift+1..5, the left rail review copy's
  concept switcher, is not a product shortcut; Alt+Shift+1..9 stays UCC-200's focus panel N, and no
  rebuild or fixture inherits the collision. Alt+Shift+L, the former Liquid Glass demonstration
  toggle, is retired with ?lg=off and Demo Studio's material on/off control (Jared, 2026-10-19,
  option 1). Neither a local action nor a command may select a material off state or old Glass
  fallback; F3-652 always supplies the Glass look's Liquid Glass material.
gui_related: true
gui_classification_reason: Customize and notification local actions.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Every named local action has no command row/event; committed appearance edits have a guarded receipt.
- Cancel/hover/trial never stores an appearance field, starts a terminal or changes buffer contents.
validation_surfaces:
- python3 scripts/pm-shard-plans.py --check
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-plans-verify.py run-gates
risk_class: owner_drift
reasoning_tier: high
context_scope: customize_and_notification_local_actions
implementation_surfaces:
- Plans/Commands_System.md
node_compile_hint:
  mode: doc_standardized_planunit
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- /mnt/Cursor/share/puppet-master/2026-10-14-editor-customizer/PROPOSAL-canon.md, SHA-256 8b8f3179c3970cb165e4fb4722eb02381f0456faad235c4330207d2bec5f5431
  (approved campaign source lineage; not native implementation evidence)
- /mnt/Cursor/share/puppet-master/2026-10-13-terminal-customizer/PROPOSAL-canon-followups.md, SHA-256
  1e0739b70d9b0f8c55f8df4747d80ff099baae6d40caf6ae784dc13864d580b0 (approved campaign source lineage;
  not native implementation evidence)
- /mnt/Cursor/share/puppet-master/2026-10-13-notifications/NOTES.md, SHA-256 f09d2b8856652950762b6580b8ebab43022bdf053272738f52720de25922a895
  (approved campaign source lineage; not native implementation evidence)
- Plans/UI_Command_Catalog.md#UCC-204
- Plans/UI_Wiring_Rules.md#UIW-043
- Plans/Wiring_Matrix.md#WM-093
- /mnt/Cursor/share/puppet-master/2026-10-16-plans-pass2/sources/2026-10-14-terminal-round3--LANDING.md,
  SHA-256 4d6556ff98168f22719c5d401c4e677d5d380d2ef370b67a838cb3aa45301c2d (source lineage; not native
  certification)
preserved_exact_tokens: []
negative_constraints: []
owner_hints:
- Plans/Commands_System.md

```

ContractRef: ContractName:Plans/UI_Command_Catalog.md#UCC-204, ContractName:Plans/UI_Wiring_Rules.md#UIW-043, ContractName:Plans/Wiring_Matrix.md#WM-093
