# Shard 045: DL-180 to DL-183 — Panel Tab And Layout Families, View State, Aliases And Retired Ids (2026-10-09)

Source: `Plans/Commands_System.md`

Source lines: L7543-L7748

Source SHA256: `675134f8f3a9b0f190562f18a68e18437407e488fd3b9f0bfad155729112a3b3`

---

## DL-180 to DL-183 — Panel Tab And Layout Families, View State, Aliases And Retired Ids (2026-10-09)

Jared's home redesign (`Plans/Decision_Log.md#DL-180` to `#DL-183`) gives Home one universal panel system and the terminal one session per tab. The catalog rows are `Plans/UI_Command_Catalog.md#UCC-200` to `#UCC-203`; this addendum is their central registration. CS-100 reserves the `cmd.panel_tab.` and `cmd.workspace_layout.` prefixes, registers the `ui.panel_tab.`, `ui.workspace_layout.` and `ui.terminal.` typed local action prefixes, and rules which panel actions are view state. CS-101 is the register of aliases and retired ids with their replacements, and amends the Run & Debug reveal rows that assumed a bottom Debug tab. It amends CS-060, CS-061 and CS-068 in place; it does not edit CS-088 to CS-093.

### CS-100 - Panel Tab And Layout Command Families, Local Action Prefixes And The View-State Ruling

**Reserved command prefixes.** `cmd.panel_tab.` joins the reserved registry of CS-060, and so does `cmd.workspace_layout.`, which UCC-144 used without a reservation and UCC-200 extends. Plans/UI_Command_Catalog.md stays the only minter. The two families are:

- `cmd.panel_tab.`: `open`, `close`, `rename`, `move`, `keep`, `pin`, `unpin`, `reopen_closed`.
- `cmd.workspace_layout.`: `split`, `move_surface`, `resize_surface`, `set_collapsed`, `close_panel`, `lock`, `apply_named`, `save_named`, `reset`.

The name `panel_tab` keeps panel tabs apart from `workspace_tab_id` (project tabs), from route `tab_id` (page-tab focus) and from the rail's `cmd.panel.switch`, whose closed vocabulary (CS-061) home panels never join. Layout keeps the existing `cmd.workspace_layout.` family and its one-commit gesture rule (CS-068).

**Typed local action prefixes.** `ui.panel_tab.`, `ui.workspace_layout.` and `ui.terminal.` are typed local action prefixes in the pattern of `ui.guided_tour.focus_route` (CS-072): an action under them has no catalog command row, no central registration, no handler of the command bus, no receipt and no event, and is never also a `cmd.*` id. Their members are UCC-200's and UCC-201's tables: `ui.panel_tab.activate`, `ui.workspace_layout.maximize`, `ui.workspace_layout.focus_panel`, and the `ui.terminal.*` actions. A `ui.terminal.mark.*` action that runs a command (Rerun, Insert command, Open output in an editor tab) dispatches that catalog command, which carries its own receipt.

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
  The reserved command-prefix registry of CS-060 extends to cmd.panel_tab. (open, close, rename, move, keep, pin,
  unpin, reopen_closed) and cmd.workspace_layout. (split, move_surface, resize_surface, set_collapsed, close_panel,
  lock, apply_named, save_named, reset), with Plans/UI_Command_Catalog.md the only minter. panel_tab is kept apart
  from workspace_tab_id, from route tab_id and from cmd.panel.switch, whose closed vocabulary home panels never
  join. ui.panel_tab., ui.workspace_layout. and ui.terminal. are typed local action prefixes in the pattern of
  ui.guided_tour.focus_route: no catalog command row, no central registration, no receipt, no event, and never also
  a cmd.* id; a ui.terminal.mark.* action that runs a command dispatches that catalog command. View state is ruled:
  choosing a tab, maximizing or restoring a panel and focusing a panel are ui.panel_tab.activate,
  ui.workspace_layout.maximize and ui.workspace_layout.focus_panel, written with the layout record's view state;
  opening any menu, list, picker or prompt, hovering, drag previews and the narrow ladder's states dispatch nothing
  and are never saved. Every committed structural change is one shell_view catalog command with a receipt that emits
  workspace.layout_changed; an open that only reveals emits nothing; a failed commit rolls back; no event family is
  added. Open routes that keep their domain ids stay navigation_wrapper and resolve through the one opening module.
gui_related: true
gui_classification_reason: "Registers the command families and local action prefixes behind every universal panel and terminal control and rules which of them are view state."
split_recommended: false
depends_on: [DL-180, DL-181, CS-060, CS-061, CS-062, CS-068, CS-072, UCC-200, UCC-201]
unblocks: [WM-090, WM-091, UIW-040, UIW-041]
acceptance_criteria:
  - "The reserved-prefix registry names cmd.panel_tab. and cmd.workspace_layout. with Plans/UI_Command_Catalog.md as the only minter, and no User Command can be created under them."
  - "No id under ui.panel_tab., ui.workspace_layout. or ui.terminal. has a catalog command row, a receipt or an event, and none is also a cmd.* id."
  - "Choosing a tab, maximizing or restoring and focusing a panel emit no receipt and no event; every committed structural change emits exactly one workspace.layout_changed."
  - "Menu, list, picker and prompt openings, hover, drag previews and narrow-ladder states dispatch nothing and write nothing."
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
  - "Plans/Commands_System.md CDRY-006 What stays view state (a prose heading with no PlanUnit; cited, not a dependency (lead ruling L22, 2026-10-10))"
  - "Plans/Decision_Log.md#DL-180"
  - "Plans/Decision_Log.md#DL-181"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/DECISIONS.md (SHA-256 0d2b45466c91734e15fd8659e9a8e3b17b70d92be785421e57e084dc8daf6b64)"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/canon-inputs/panels-CONTRACT-v1-778c8494e6.md (SHA-256 aa16fc080f44f6824b0ef32a2b568bfcae81277b6962caaba1b441015d68dae9; section 8; concept lineage only)"
preserved_exact_tokens:
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
  - "Amended 2026-10-09 (DL-180): CDRY-006's local-tab rule now covers panel tab activation explicitly; CS-060's registry gains two prefixes."
owner_hints:
  - Plans/Commands_System.md
  - Plans/UI_Command_Catalog.md
```

ContractRef: ContractName:Plans/Decision_Log.md#DL-180, ContractName:Plans/UI_Command_Catalog.md#UCC-200, ContractName:Plans/UI_Command_Catalog.md#UCC-201, ContractName:Plans/Commands_System.md#CS-060, ContractName:Plans/Commands_System.md#CDRY-006, ContractName:Plans/Contracts_V0.md#CV-361

### CS-101 - Aliases And Retired Ids Of The Panel And Terminal Redesign

**Aliases** (recorded metadata only: no handler, row semantics or event of their own):

| Alias | Canonical id | Source |
|---|---|---|
| `cmd.editor.close_tab` | `cmd.panel_tab.close` | UCC-200 |
| `cmd.dashboard.add_widget` (its `dashboard_id` read as `board_id`) | `cmd.widget.add` | UCC-202 |
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

**The Run & Debug reveal rows.** `cmd.run_debug.console.reveal` and `cmd.run_debug.terminal.reveal` (section 7.2's table) keep their ids, labels and availability, but no longer assume a bottom-zone Debug tab: Reveal Debug Tab reveals the Debug Console tab (`debug_console`) wherever it is, and Reveal Process Pane reveals the tab that hosts the debuggee's integrated terminal wherever it is, each by the one opening module's reveal rule (activate it, pull it out of "+N", expand its collapsed panel). Neither opens a second tab for the same id.

**Shortcuts.** Close tab stays Ctrl+W in the native app and is answered as Alt+W in the web client, dispatching `cmd.panel_tab.close`; CS-086's text-field clash with Ctrl+W is unchanged and still the Commands and Shortcuts owner's to decide.

```yaml
plan_unit_id: CS-101
unit_type: command_disposition
status: accepted
owner_doc: Plans/Commands_System.md
canonical_text: >-
  The redesign's aliases are recorded metadata only: cmd.editor.close_tab to cmd.panel_tab.close,
  cmd.dashboard.add_widget to cmd.widget.add (dashboard_id read as board_id), cmd.browser.devtools.open to
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
  natively and Alt+W in the web client; CS-086's text-field clash is unchanged.
gui_related: true
gui_classification_reason: "Names, for every caller, the one id each retired or aliased panel and terminal action now dispatches."
split_recommended: false
depends_on: [DL-180, DL-181, CS-100, CS-061, CS-063, CS-068, CS-086, UCC-200, UCC-201, UCC-202, UCC-203]
unblocks: [WM-090, WM-091, WM-092]
acceptance_criteria:
  - "Every alias resolves to one canonical id with no handler, production row of its own or event."
  - "No production wiring row dispatches a retired id; each caller dispatches the replacement this unit names."
  - "cmd.run_debug.console.reveal and cmd.run_debug.terminal.reveal never assume a bottom-zone Debug tab and never open a second tab for an id already open."
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
preserved_exact_tokens:
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
owner_hints:
  - Plans/Commands_System.md
  - Plans/UI_Command_Catalog.md
  - Plans/Wiring_Matrix.md
```

ContractRef: ContractName:Plans/UI_Command_Catalog.md#UCC-200, ContractName:Plans/UI_Command_Catalog.md#UCC-201, ContractName:Plans/UI_Command_Catalog.md#UCC-202, ContractName:Plans/UI_Command_Catalog.md#UCC-203, ContractName:Plans/Commands_System.md#CS-100
