# Shard 032: DL-180 to DL-183 — Wiring Rules For The Universal Panels And The Terminal Tab (2026-10-09)

Source: `Plans/UI_Wiring_Rules.md`

Source lines: L2096-L2511

Source SHA256: `30d28b77d9f30c24fb4779c8a45c45fa3ff080601cfcd729abaaa21bc6783bf6`

---

## DL-180 to DL-183 — Wiring Rules For The Universal Panels And The Terminal Tab (2026-10-09)

Jared's home redesign (`Plans/Decision_Log.md#DL-180` to `#DL-183`) replaces Home's four fixed editor panels, its singleton dashboard, its movable chat and its docked terminal sections with one universal panel system, and makes the terminal one session per tab. This addendum gives the rules the wiring follows. UIW-040 is the closed census of Home controls and supersedes the fixed-zone rows of the 2026-08-04 Home rules and of UIW-010's amendments; UIW-041 says how a tab is opened, kept, closed, reopened, moved and pinned and what each step emits; UIW-042 is the closed census of controls inside a terminal tab. The one wiring row per control is `Plans/Wiring_Matrix.md#WM-090` and `#WM-091`; the command ids are `Plans/UI_Command_Catalog.md#UCC-200` to `#UCC-203`. UIW-010 and UIW-012 are amended in place: the census rule and the transaction rule stand, the chat no longer re-seats inside the window, and the terminal caps and Collapse Bottom Terminal leave the census. This addendum does not edit UIW-026 to UIW-031.

Amended 2026-10-10 (DL-186, DL-187): Jared's answers of 2026-10-10 add to the censuses. UIW-040 gains the dashboard tab's controls (Add widget, the Board menu with Start from, presets, Tidy, Reset widgets, Rename and Delete dashboard, the Undo notice, an Agents card), the "+" menu's SSH hosts row and New dashboard, the launcher's sub-row links, the Debug Console's session sub-tabs and the chat header's Keep the chat open in narrow windows, and the rail's Chat entry works on every page. UIW-041 says how a custom dashboard is renamed, deleted and forgotten. UIW-042 gains Mute notifications, a notification's click and the notification permission notice.

### UIW-040 - The Home Census: One Closed List Of Home Controls

The Home census is this closed list. A control not on it has no wiring row and is a census failure; a control on it has exactly one row in WM-090's tables.

```yaml
plan_unit_id: UIW-040
unit_type: wiring_rule
status: accepted
owner_doc: Plans/UI_Wiring_Rules.md
canonical_text: >-
  The Home census is a closed list, and every control on it resolves to exactly one wiring row in
  WM-090's tables: a production entry, a typed local action or a view-local disposition. The tab
  strip of every panel: a tab (activate, its close target, middle click, Delete, double click to
  keep, Alt+click, drag within the strip, drag to another strip, drag to a panel edge or the
  centre's outer edge, drop on "+N", tear-off), a double click on the strip's empty space, the "+"
  button, the "+N" button, and the tab menu (Close, Close others, Close to the right, Keep open, Pin
  or Unpin, Rename..., Move to new panel, Move to panel, Split right with this tab, Split down with
  this tab). The "+" menu: its filter field, the Terminal row with each shell profile and SSH host,
  Browser with its recent addresses, File... with its three recent files, Dashboard with its boards,
  Plan or document..., Artifact..., the Output, Problems, Ports, Debug Console row with its submenu,
  Split right, Split down and Reopen closed tab, each item's body (a new tab in this panel) and its
  trailing cell, Alt+click or Alt+Enter (a new panel). Quick Open. The empty-panel launcher's rows,
  each row's body (a new tab in this panel) and its trailing cell, Alt+click or Alt+Enter (a new
  panel), its five recent files and its hint. The "+N" list and the every-tab list (a row, its close
  target, the search field). A panel's grip and Move panel, its dividers (drag, double click, the
  divider keys), and its panel menu (Split right, Split down, Maximize or Restore panels, Collapse
  to tabs or Expand, Lock or Unlock panel, Show all tabs in this panel, Layouts with the named and
  saved layouts, Save this layout... and Restore home layout, Close other tabs, Close panel). The
  title bar's Home options menu (F3-502: the named and saved layouts, Show or Hide the chat, Pop out
  the chat or Dock the chat back, Keep the chat open in narrow windows, Save this layout..., Restore
  home layout, Run setup wizard) and Settings' Restore home layout row. The chat column: the
  activity bar's Chat toggle, its inner edge (width), its header menu's Pop out, the popped-out
  window's Dock back and the 32 px edge strip of a narrow window. The narrow switcher. The Home keys
  of the keyboard map in `Plans/FinalGUISpec.md#F3-635` and `Plans/UI_Command_Catalog.md#UCC-200`
  (the rows of WM-090's Keys table) with the web-client mapping (Ctrl+T, Ctrl+W, Ctrl+Shift+T and
  Ctrl+Tab answered as Alt+T, Alt+W, Alt+Shift+T and Alt+` in a browser). Retired, with no row: the
  four editor panels' grab, close, pop-out, Open Browser and resizers; Open Panel and Open Browser
  in Panel with Panel 1 to Panel 4; File Manager's Open in Panel 1 to 4; the host drop targets, the
  dock track and the floating corner resizer; the dashboard's grab, pop-out and resizer; the chat's
  grab; the terminal sections (grab, bottom toggle, new section, split pane, move workgroup,
  resizer); and Collapse Bottom Terminal. A disabled control projects its owner's reason (UCC-200)
  and dispatches nothing. Amended 2026-10-10 (DL-186, DL-187): the list adds the "+" menu's SSH
  hosts row with its hosts and the Dashboard sub-row's custom dashboards and New dashboard; the
  empty-panel launcher's sub-row links (a shell, a host, a recent address, a recent file, a board,
  New dashboard); the Terminal row lists installed shells. A dashboard tab: its header row (Add
  widget with its list, Board, Maximize or Restore), the Board menu (Dashboards with each dashboard
  and New dashboard; This dashboard with Range, Scope, Start from and its sets, Save as preset...,
  Tidy and Reset widgets; Live readings; and on a custom dashboard only Rename dashboard... and
  Delete dashboard... with its confirm), Start from's Your presets (Save this dashboard as a
  preset..., Start from this preset, Rename preset..., Delete preset... with its confirm), the Undo
  notice after Start from, the empty board's Add widget and Start from..., a widget card's Details
  (its gestures, size picker and menus are the Usage board's own controls), and on Agents the Show
  filters and each agent's card. The Debug Console's session sub-tabs. The chat header's Keep the
  chat open in narrow windows beside the Home options menu's, both the typed local action
  ui.chat_column.keep_open, and the activity bar's Chat on every page. The Undo in the notice that
  follows Start from maps to its WM-090 row, home.dashboard_tab.undo_start_from: one
  cmd.widget.reset_layout with restore_revision (UCC-200), so the census has no open item (amended
  2026-10-10, lead ruling; it read: The Undo after Start from has a WM-090 row with no id until the
  lead rules on its id; it is the census's one open item; and before that, amended 2026-10-10,
  DL-186: The Undo after Start from has no wiring row until the lead rules on its id).
  ui.chat_column.pin_history is a typed local action (view state); its value is saved in the v2
  record's chat column as history_pinned, with no workspace.layout_changed event, revision advance
  or receipt, like ui.workspace_layout.maximize. WM-090 lists it as a typed local action with no
  production entry; ACD-500 owns the control. The census reports unresolved_count=0 (amended
  2026-10-10, lead ruling: the Undo after Start from has its id; it read: The census reports
  unresolved_count=1, the Undo's missing id, until the lead rules, and 0 after; and before that,
  amended 2026-10-10, DL-186: The census reports unresolved_count=0). This census supersedes the
  fixed-zone rows that UIW-010's amendments and the 2026-08-04 Home rules list. The census includes
  F3-632's Back and equivalent level-navigation keys in + pickers, launcher pickers, Move panel,
  Layouts, Move to panel, Show all tabs and kind submenus. They resolve to ui.panel_tab.picker_back,
  a typed local navigation action with no production entry, Settings write, receipt or event; final
  row selection alone uses its existing command. F3-647 owns drawing, F3-635 keys, and the exact
  controls are listed in pm7_control_bindings.json.
gui_related: true
gui_classification_reason: "The closed list of visible Home controls that the wiring must cover, one row each."
split_recommended: false
depends_on: [DL-180, DL-186, DL-187, UIW-010, UIW-012, UCC-200, UCC-203, F3-502, F3-630, F3-631, F3-632, F3-633, F3-636, F3-637, F3-638]
unblocks: [ATS-075]
acceptance_criteria:
  - "Every control on the list maps to exactly one WM-090 row, and every home.* production entry maps to a control on the list; every row names its id, the Undo after Start from's being home.dashboard_tab.undo_start_from, and the census reports unresolved_count=0 (amended 2026-10-10, lead ruling; it read: every row but the Undo after Start from's names its id, and the census reports unresolved_count=1 (that Undo's id) until the lead rules, and 0 after; and before that, amended 2026-10-10, DL-186: Every control on the list maps to exactly one WM-090 row, and every home.* production entry maps to a control on the list: the census reports unresolved_count=0.)"
  - "The History list pin has exactly one WM-090 row for ui.chat_column.pin_history; history_pinned is saved as view state with no workspace.layout_changed event, revision advance or receipt, and no pending exception remains."
  - "No row exists for a retired control on the list's retired part, and Plans/PMConcept7_Home_Workspace_Control_Reconciliation.json records those rows as retired."
  - "A disabled control (for example Split right when the centre is too narrow to split, Reopen closed tab when no tab has been closed) shows its owner's reason and dispatches nothing."
  - "Every key label on the list shows the key that works where the app runs; a browser shows Alt+T, Alt+W, Alt+Shift+T and Alt+` for the four browser-owned chords."
  - "Every dashboard tab control, the SSH hosts row and its hosts, New dashboard, each launcher sub-row link, the Debug Console's sub-tabs, both Keep the chat open in narrow windows items and the Undo after Start from map to exactly one WM-090 row, and no item is open (amended 2026-10-10, lead ruling; it read: Every dashboard tab control, the SSH hosts row and its hosts, New dashboard, each launcher sub-row link, the Debug Console's sub-tabs and both Keep the chat open in narrow windows items map to exactly one WM-090 row; the Undo after Start from is reported as the one open item until the lead rules on its id)."
  - "Rename dashboard... and Delete dashboard... appear only on a custom dashboard; Home, Metrics, Monitoring and Agents show neither."
validation_surfaces:
  - python3 scripts/pm-plans-verify.py validate-wiring-matrix
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
risk_class: home_panels_terminal_redesign_drift
reasoning_tier: high
context_scope: home_panels_terminal
implementation_surfaces:
  - Plans/UI_Wiring_Rules.md
  - Plans/Wiring_Matrix.md
  - Plans/Wiring_Matrix.production.json
  - Plans/PMConcept7_Home_Workspace_Control_Reconciliation.json
node_compile_hint:
  mode: wiring_rule
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Plans/Decision_Log.md#DL-180"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/DECISIONS.md (SHA-256 0d2b45466c91734e15fd8659e9a8e3b17b70d92be785421e57e084dc8daf6b64)"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/canon-inputs/panels-CONTRACT-v1-778c8494e6.md (SHA-256 aa16fc080f44f6824b0ef32a2b568bfcae81277b6962caaba1b441015d68dae9; sections 6 to 9; concept lineage only)"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/plans-home-audit.md (SHA-256 f8e65fd64028014e3ee9bebf68594356d40eb5c831975645da6a3406cef2e3e8; section 6.2)"
  - "Plans/Decision_Log.md#DL-186"
  - "Plans/Decision_Log.md#DL-187"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/canon-inputs/followup/panels-NUMBERS-339203bd76.md, SHA-256 2e2c2a95819842cd5cbcc108ed302460ddea3ed0a98be7dfe4f1b78507660ce6 (the \"+\" menu, the launcher links, the Debug Console sub-tabs, the rail's Chat entry; concept lineage only)"
preserved_exact_tokens:
  - "Rename dashboard..."
  - "Delete dashboard..."
  - "New dashboard"
  - "unresolved_count"
  - "Collapse Bottom Terminal"
  - "Restore home layout"
  - "Keep the chat open in narrow windows"
negative_constraints:
  - "Do not wire a control that is not on the list, or leave a control on the list without a row."
  - "Do not keep a row for a fixed editor panel, a dock or floating host, a terminal section, a chat grab or Collapse Bottom Terminal."
stale_retired_dispositions:
  - "Amended 2026-10-10 (lead ruling L9, corrected to view state with no event): Saves History pin as view state with no layout event, revision advance or receipt."
  - "Amended 2026-10-10 (lead ruling L9): Replaces the pending History pin exception with ui.chat_column.pin_history in the closed census."
  - "Amended 2026-10-10 (DL-186, DL-187): adds the dashboard tab's controls, SSH hosts, New dashboard, the launcher's sub-row links, the Debug Console's sub-tabs, the chat header's Keep the chat open in narrow windows and the rail's Chat entry on every page; the Undo after Start from waits for the lead's ruling."
  - "Amended 2026-10-10 (lead ruling on the Undo after Start from): the Undo maps to home.dashboard_tab.undo_start_from (cmd.widget.reset_layout with restore_revision), and the census reports unresolved_count=0."
  - "Superseded 2026-10-09 (DL-180): the fixed-zone census rows of the 2026-08-04 Home rules and UIW-010's 2026-08-13 amendments (Panel 1 to Panel 4, Chat and Dashboard Pop Out, the floating corner and dock track resizers, terminal add and split leaves, terminal caps, Collapse Bottom Terminal)."
owner_hints:
  - Plans/UI_Wiring_Rules.md
  - Plans/Wiring_Matrix.md
```

ContractRef: ContractName:Plans/Decision_Log.md#DL-180, ContractName:Plans/Wiring_Matrix.md#WM-090, ContractName:Plans/UI_Command_Catalog.md#UCC-200, ContractName:Plans/FinalGUISpec.md#F3-630

### UIW-041 - Tab Lifecycle: Open, Keep, Close, Reopen, Move And Pin

Every tab of every kind goes through the same steps, and each step that changes the layout is one commit with one event. This supersedes the editor-only tab lifecycle and the fixed-panel open targets (Panel 1 to Panel 4).

```yaml
plan_unit_id: UIW-041
unit_type: wiring_rule
status: accepted
owner_doc: Plans/UI_Wiring_Rules.md
canonical_text: >-
  Every open goes through the one opening module (F3-634) with CV-360's placement fields. One id is one tab: an id
  already open anywhere is revealed where it is (activated, pulled out of "+N", its folded panel expanded), never
  opened twice and never moved, and a reveal returns its receipt and emits nothing. An open that adds a tab is one
  commit that emits workspace.layout_changed once. A file reference a person single-clicks opens the panel's one
  preview tab, and the next single click replaces it in one commit; a double click, the first edit
  (cmd.panel_tab.keep, dispatched once) or dragging the tab (the same cmd.panel_tab.move commit) keeps it. Quick Open
  with Enter and the "+" menu's recent files open kept tabs. What a person opens takes focus; what an agent opens by
  itself lands as a background tab with the hollow-square mark and a polite announcement, opens kept, never takes
  keyboard focus and never changes the active tab of a panel the person is typing in. Closing is cmd.panel_tab.close
  after the kind's close check: a tab with unsaved work or a running terminal asks inline first and stays open if the
  person keeps it; Close others and Close to the right are one commit over a set of the panel's unpinned tabs, and a
  tab whose check declines stays open while the rest close. Closing the last tab of a panel closes the panel and its
  neighbour takes the space, unless it is the only panel in the centre or locked, which then shows the empty-panel
  launcher. A closed tab goes onto the layout record's bounded closed-tab stack (SP-330); cmd.panel_tab.reopen_closed
  reopens the newest one in its former panel when that panel still exists, else by the placement rule, and a terminal
  comes back as a new session in the same folder and profile (SMPFS-180). A move (cmd.panel_tab.move: reorder, another
  panel, a panel edge, "+N", the tab menu, the keys) is one commit on a changed release, never changes the tab's
  domain identity (its file, session, board or browser session), and leaves the tab in exactly one panel; moving the
  last tab out of a panel follows the last-tab rule. Pin and Unpin are in the tab menu only; pinned tabs sit first and
  never hide. Rename sets a user label; an empty label restores the kind's. Every committed step emits
  workspace.layout_changed once with its v2 payload (CV-361) and writes pm.home_workspace_layout.v2 once (SP-330);
  activating a tab is ui.panel_tab.activate with no receipt and no event; a cancelled, unchanged or failed step emits
  nothing and puts the layout back.
  Amended 2026-10-10 (DL-186, D35; DL-187, D33): a custom dashboard follows the same steps. New dashboard (and Ctrl+T
  or a split in a dashboard panel) adds a new, empty custom dashboard tab in one commit; Rename dashboard... and
  renaming its tab are the one cmd.panel_tab.rename, which renames the dashboard too, and clearing the label gives
  back "Dashboard <n>"; Delete dashboard..., after its confirm, is the one cmd.panel_tab.close, after which the
  dashboard leaves the reopen list and its board and name are forgotten. Closing a custom dashboard's tab in any other
  way keeps its board while it can be reopened; when it leaves the closed-tab stack and is not open as a tab, its
  board is forgotten, with no command (WS-030). The built-in dashboards keep their boards and are never deleted. The
  Debug Console is one tab, debug-console: opening or revealing it shows the session asked for in its sub-tabs, and an
  older debug-console:<session> id folds into it wherever it appears (an open, a restore or Reopen closed tab).
gui_related: true
gui_classification_reason: "The visible life of a tab: how it opens, becomes kept, closes, comes back, moves and pins."
split_recommended: false
depends_on: [DL-180, DL-181, DL-186, DL-187, UIW-012, UIW-040, UCC-200, F3-630, F3-631, F3-634, F3-638, CV-360, CV-361, SP-330, SMPFS-180]
unblocks: [ATS-075]
acceptance_criteria:
  - "Opening an id that is already open anywhere activates it where it is, emits no workspace.layout_changed and opens no second tab."
  - "A single click on a file reference replaces the panel's preview tab in one commit; a double click, the first edit or a drag keeps it, and a panel never holds two preview tabs."
  - "An agent's open lands in the background with the hollow-square mark and an announcement, and focus and the active tab of the panel the person is typing in do not change."
  - "Close others closes the panel's unpinned tabs in one commit; a tab whose close check declines stays open."
  - "Closing the last tab closes the panel unless it is the only centre panel or locked; then the empty-panel launcher shows."
  - "Reopen closed tab restores the newest closed tab; a reopened terminal is a new session in the same folder and profile and says so."
  - "Every committed step emits exactly one workspace.layout_changed; activation, a reveal, a cancelled or failed step emit none."
  - "Deleting a custom dashboard is one cmd.panel_tab.close after its confirm and forgets its board and name; a closed custom dashboard reopens with its board while it is on the closed-tab stack and is forgotten when it leaves it unless it is open; a built-in dashboard is never deleted."
  - "An older debug-console:<session> id opens, restores or reopens as the one debug-console tab with that session shown, never as a second tab."
validation_surfaces:
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
risk_class: home_panels_terminal_redesign_drift
reasoning_tier: high
context_scope: home_panels_terminal
implementation_surfaces:
  - Plans/UI_Wiring_Rules.md
  - Plans/Wiring_Matrix.md
  - Plans/Wiring_Matrix.production.json
node_compile_hint:
  mode: wiring_rule
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Plans/Decision_Log.md#DL-180"
  - "Plans/Decision_Log.md#DL-181"
  - "Plans/Decision_Log.md#DL-186"
  - "Plans/Decision_Log.md#DL-187"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/DECISIONS.md (SHA-256 0d2b45466c91734e15fd8659e9a8e3b17b70d92be785421e57e084dc8daf6b64)"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/canon-inputs/panels-CONTRACT-v1-778c8494e6.md (SHA-256 aa16fc080f44f6824b0ef32a2b568bfcae81277b6962caaba1b441015d68dae9; sections 6 to 9; concept lineage only)"
preserved_exact_tokens:
  - "debug-console"
  - "cmd.panel_tab.keep"
  - "cmd.panel_tab.close"
  - "cmd.panel_tab.reopen_closed"
  - "cmd.panel_tab.move"
  - "ui.panel_tab.activate"
  - "workspace.layout_changed"
  - "pm.home_workspace_layout.v2"
negative_constraints:
  - "Do not open a second tab for an id that is already open, and do not move a tab to reveal it."
  - "Do not let an agent's open take keyboard focus or change the active tab of a panel the person is typing in."
  - "Do not end a terminal session or drop unsaved work without the kind's close check."
  - "Do not emit workspace.layout_changed for a reveal, an activation, or a cancelled, unchanged or failed step."
stale_retired_dispositions:
  - "Superseded 2026-10-09 (DL-180): the editor-only tab lifecycle of catalog.editor_close_tab (cmd.editor.close_tab is now an alias of cmd.panel_tab.close, which serves tabs of every kind) and the fixed-panel open targets Panel 1 to Panel 4."
  - "Amended 2026-10-10 (DL-186, D35; DL-187, D33): custom dashboards are made, renamed and deleted through the tab commands and forgotten when they leave the closed-tab stack; the Debug Console is one debug-console tab into which older per-session ids fold."
owner_hints:
  - Plans/UI_Wiring_Rules.md
  - Plans/Wiring_Matrix.md
```

ContractRef: ContractName:Plans/FinalGUISpec.md#F3-634, ContractName:Plans/UI_Command_Catalog.md#UCC-200, ContractName:Plans/Contracts_V0.md#CV-361, ContractName:Plans/storage-plan.md#SP-330

### UIW-042 - The Terminal Tab Census

The controls inside a terminal tab are this closed list. Its tab in the strip is a Home control (UIW-040).

```yaml
plan_unit_id: UIW-042
unit_type: wiring_rule
status: accepted
owner_doc: Plans/UI_Wiring_Rules.md
canonical_text: >-
  The terminal tab's census is a closed list, and every control on it resolves to exactly one wiring row
  in WM-091's tables. The header row: Find, Split, Maximize or Restore, and More. The More menu in the
  revised terminal SPEC's order: New terminal with each shell profile and SSH host, Split down,
  Appearance..., Text size (Bigger, Smaller, Reset), Copy mode, Quick select, Select all, Clear, Clear
  scrollback, Plain-text buffer, Agent input (Ask each time, and one row per agent allowed in this
  terminal, each of which revokes), Send signal (Interrupt, Terminate, Kill) and Restart session. The
  screen's context menu: Open in editor or Open link, Copy path or Copy link, Copy, Paste, Select all,
  Find, Clear. The command-mark menu: its header row (the command, its state, duration and who typed it),
  Copy command, Copy output, Rerun, Insert command, Open output in an editor tab, Select output; and the
  sticky command header. The find bar, copy mode and quick select with their keys; links (a plain click
  selects, Ctrl+click or Cmd+click opens a file reference in the panel's preview tab, Ctrl+double-click
  keeps it, Ctrl+Alt+click opens it in a new panel, a URL opens a Browser tab). The agent rows: Driving
  (Take over, Interrupt, Stop), Paused after a take-over (Hand back, Stop <agent>), Permission (Allow
  once, Allow in this terminal, Deny), Secret input (Type it), and a person's keystroke in a terminal an
  agent is driving. The Session ended row (Restart, Close tab) and Enter in an ended terminal; the
  close-a-running-terminal row (Close terminal, Keep it open); the restored notice and the notice that
  saved scrollback could not load. The Customize screen (F3-650): the This terminal or All terminals
  switch, the scheme list and its search, each field of F3-642 (scheme, font family, size, weight, line
  height, letter spacing, ligatures, cursor shape, blink and trail, background, padding, minimum contrast,
  effects), Import scheme... and, in Retro, Degauss. A refused image has no control: the program gets
  SMPFS-181's fixed reply. Not on the list, and never wired: a split inside a terminal, a section,
  workgroup or sub-tab control, a terminal pop-out, the per-tab role setting and any AI control in the
  terminal (Explain What Commands Do leaves for the chat's Teacher). Amended 2026-10-10 (DL-187; D34, D38,
  D39): New terminal lists every installed shell, then an SSH hosts submenu with each host; Mute
  notifications sits in the More menu between Agent input and Send signal and at the end of the tab's menu
  after a hairline (absent where the platform has no system notifications); a click on a system
  notification a program raised; the notification permission notice (Allow, Mute this terminal, Not now).
  Not on the list: any control that gives a terminal tab a colour or icon (D34).
gui_related: true
gui_classification_reason: "The closed list of visible controls inside a terminal tab that the wiring must cover, one row each."
split_recommended: false
depends_on: [DL-181, DL-182, DL-183, DL-187, UIW-040, UCC-201, F3-640, F3-641, F3-642, F3-645, F3-646, SMPFS-180, SMPFS-181, SMPFS-182]
unblocks: [ATS-076]
acceptance_criteria:
  - "Every control on the list maps to exactly one WM-091 row, and every terminal.* production entry maps to a control on the list."
  - "The Permission row offers exactly Allow once, Allow in this terminal and Deny."
  - "No control on a terminal tab splits inside the terminal, moves a section or workgroup, pops the terminal out or asks an AI to explain a command."
  - "A plain click on a link only selects text."
  - "Mute notifications in the More menu and the tab menu, a notification's click and the permission notice's three answers each map to one WM-091 row, and no control sets a terminal tab's colour or icon."
validation_surfaces:
  - python3 scripts/pm-plans-verify.py validate-wiring-matrix
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
risk_class: home_panels_terminal_redesign_drift
reasoning_tier: high
context_scope: home_panels_terminal
implementation_surfaces:
  - Plans/UI_Wiring_Rules.md
  - Plans/Wiring_Matrix.md
  - Plans/Wiring_Matrix.production.json
node_compile_hint:
  mode: wiring_rule
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Plans/Decision_Log.md#DL-181"
  - "Plans/Decision_Log.md#DL-182"
  - "Plans/Decision_Log.md#DL-183"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/DECISIONS.md (SHA-256 0d2b45466c91734e15fd8659e9a8e3b17b70d92be785421e57e084dc8daf6b64)"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/canon-inputs/terminal-SPEC-ac63b1f467.md (SHA-256 4e3b5aabb4e41fed43d338a1b8c852b752b5860277f2058332575ba3953dbc8b; sections 1 to 3 and 8; concept lineage only)"
  - "Plans/Decision_Log.md#DL-187"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/canon-inputs/followup/terminal-SPEC-01c5e78c42.md, SHA-256 a0723f6663990723fc8bd879610c8dedcf2ef6b19a467a2d5c1e1c6d183aabfc (sections 1 and 2; concept lineage only)"
preserved_exact_tokens:
  - "Mute notifications"
  - "Allow in this terminal"
  - "Keep it open"
  - "Open output in an editor tab"
  - "Restart session"
negative_constraints:
  - "Do not wire a terminal control that is not on the list, or leave a control on the list without a row."
  - "Do not add an AI control, a split inside a terminal, a section, a workgroup, a sub-tab or a terminal pop-out."
stale_retired_dispositions:
  - "Superseded 2026-10-09 (DL-181): the terminal add and split leaves, the four-section and four-pane cap states and the bottom terminal rows of the earlier Home census."
  - "Amended 2026-10-10 (DL-187; D34, D38, D39): adds Mute notifications, a notification's click, the permission notice and the installed shells and SSH hosts under New terminal; no tab colour or icon control."
owner_hints:
  - Plans/UI_Wiring_Rules.md
  - Plans/Wiring_Matrix.md
```

ContractRef: ContractName:Plans/Decision_Log.md#DL-181, ContractName:Plans/Wiring_Matrix.md#WM-091, ContractName:Plans/UI_Command_Catalog.md#UCC-201, ContractName:Plans/FinalGUISpec.md#F3-640

### UIW-043 - Appearance And Shell Control Census

```yaml
plan_unit_id: UIW-043
unit_type: requirement
status: accepted
owner_doc: Plans/UI_Wiring_Rules.md
canonical_text: >-
  Plans/pm7_control_bindings.json is the finite appearance and shell producer census, extending UIW-040
  through UIW-042. Each row names the visible control, owner unit, setting/field payload, exact command path
  or typed local action/non-dispatch disposition, and the corresponding production entry or reason it has
  none. Each admitted editor setting and every retained customizer field has its own row; aliases and
  view-local affordances never become invented cmd.* ids. Plans/Wiring_Matrix.production.json remains the
  runtime command wiring inventory; a producer binding can reuse its canonical command entry only when the
  census names that entry and exact argument mapping. Its schema is not relaxed for local controls: local
  exclusions are explicit in the census and the production exclusions notes. Required evidence includes the
  rendered pointer/keyboard path, projected availability and disabled reason, request/result, readback,
  receipt/event delta, focus and accessible names. Static source declarations certify neither native
  handlers nor the complete rendered census. Every PM7 control must be classified, including Settings
  entry/scope/reset, token color channels/hex/reset, preview/sample actions, wallpaper keys/default,
  notifications, DnD and each resize surface. Demo-only controls and preview harnesses are outside the
  product census. Composite quick-set rows reference the one exact field/value patch in
  Plans/appearance_quick_sets.json, list only its affected setting ids in either scope, and adapt it
  atomically to the existing writer. Reset/restore-default operations have an explicit exact id set distinct
  from value patches. A binding cannot substitute all editor or terminal fields for a smaller quick set. The
  round-3 bezel/background/mask fields and saved terminal preset controls are now enumerated. Local library
  actions explicitly declare their SP-331-only persistence; picker Back explicitly declares no persistence.
  Terminal round 5 (DL-213) retires the Flicker Amount bindings and narrows Bell to Follow look and Off; the
  consistency pass (DL-214) adds no binding, command or stored state. F6 (DL-221) adds no binding, command, production entry or stored state. The page-change hold and a Customize pick's acknowledgement order are ACD-475's; this census adds no row for them. The two bell Continue controls are separate local census rows forwarding the original prompt's
  own typed action. Setup retains PWIZ-021/UCC-106's ui.onboarding.start and closed
  pm.product_onboarding.action_request.v2 resume context; Guided Tour retains PWIZ-023's
  ui.guided_tour.resume and pm.guided_tour.action_request.v3 session/checkpoint/currentness context. They
  create no command, event or new action id.
gui_related: true
gui_classification_reason: Appearance And Shell Control Census.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- No new visible product control lacks a census row and exact owner/action route.
- The census validates against its schema and references only existing inventory ids, catalog commands and production
  rows.
validation_surfaces:
- python3 scripts/pm-shard-plans.py --check
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-plans-verify.py run-gates
risk_class: owner_drift
reasoning_tier: high
context_scope: appearance_and_shell_control_census
implementation_surfaces:
- Plans/UI_Wiring_Rules.md
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
- /mnt/Cursor/share/puppet-master/2026-10-13-wallpapers/OWNER-PROPOSAL.md, SHA-256 07778e16e4bc6082aa1d56435a826692662718069ceaaa2f20e37ae56984ba2d
  (approved campaign source lineage; not native implementation evidence)
- /mnt/Cursor/share/puppet-master/2026-10-13-panel-dnd-resize/NOTES.md, SHA-256 03a80f0dea3235ea637149bbec63626c4a4be8521078f9dd601f2b691f03d2d6
  (approved campaign source lineage; not native implementation evidence)
- Plans/Wiring_Matrix.md#WM-093
- Plans/UI_Command_Catalog.md#UCC-204
- Plans/Commands_System.md#CS-102
- /mnt/Cursor/share/puppet-master/2026-10-16-plans-pass2/sources/2026-10-14-terminal-round3--LANDING.md,
  SHA-256 4d6556ff98168f22719c5d401c4e677d5d380d2ef370b67a838cb3aa45301c2d (source lineage; not native
  certification)
- /mnt/Cursor/share/puppet-master/2026-10-16-plans-pass2/sources/2026-10-15-panels-picker-back--NOTES.md,
  SHA-256 29bac44f166cb8e0e67f4f00634cb15d0a3be576eb2f68e7e19606f3a4a1a71c (source lineage; not native
  certification)
preserved_exact_tokens: []
negative_constraints: []
owner_hints:
- Plans/UI_Wiring_Rules.md
```

ContractRef: ContractName:Plans/Wiring_Matrix.md#WM-093, ContractName:Plans/UI_Command_Catalog.md#UCC-204, ContractName:Plans/Commands_System.md#CS-102
