# Shard 043: DL-180 to DL-183 — Wiring For The Universal Panels And The Terminal Tab (2026-10-09)

Source: `Plans/Wiring_Matrix.md`

Source lines: L5454-L5989

Source SHA256: `3c0e5c94343cffc51ae2cd06c8693bdd23d6862e22a03ad99cc4778ba99ec40d`

---

## DL-180 to DL-183 — Wiring For The Universal Panels And The Terminal Tab (2026-10-09)

Jared's home redesign (`Plans/Decision_Log.md#DL-180` to `#DL-183`) replaces Home's four fixed editor panels, its singleton dashboard, its movable chat and its docked terminal sections with one universal panel system, and rebuilds the terminal as one session per tab. He called the wiring for it "hyper critical". This addendum gives every control the redesign adds one wiring row: a production entry in `Plans/Wiring_Matrix.production.json` when the control dispatches a command, or a typed local action or "dispatches nothing" when it does not; it retires every row whose control is gone, and it makes each row name the one event set its command emits. Command ids, arguments, availability and disabled reasons are `Plans/UI_Command_Catalog.md#UCC-200` to `#UCC-203` and `Plans/Commands_System.md#CS-100` and `#CS-101`; this addendum does not restate them. The census rules are `Plans/UI_Wiring_Rules.md#UIW-040` to `#UIW-042`.

It adds WM-090 (Home panels), WM-091 (the terminal tab) and WM-092 (event sets corrected). It retires 51 `home.*` production entries (the `home.editor_panel_N.*`, `home.file_manager.open_panel_N`, `home.more_options.open_panel_N` and `open_browser_panel_N`, `home.drop_target.*`, `home.dashboard.*`, `home.chat.grab`, `home.terminal_section.*`, `home.more_options.collapse_bottom` and the fixed resizers) and 8 catalog entries whose commands retired or became aliases, and adds 103 `home.*` and 36 `terminal.*` entries (108 `home.*` entries in all with the five kept ones); the five kept `home.*` entries are rebuilt on the v2 model, and the open routes carry the placement fields of `Plans/Contracts_V0.md#CV-360`. The retired entries are listed in `Plans/PMConcept7_Home_Workspace_Control_Reconciliation.json` (`control_census.retired_rows_2026_10_09`), the file's own record of retired rows. It amends WM-021, WM-022, WM-041 and WM-045, the runtime-recovery terminal table and the PM7 settled interaction table with dated notes. It does not edit WM-065 to WM-075.

### Home controls and their wiring

Every control below commits through the gesture transaction of `Plans/UI_Wiring_Rules.md#UIW-012`: opening a menu, a list, a picker or a prompt, hovering and every drag preview dispatch nothing; a changed release or activation dispatches one command; an unchanged or cancelled gesture (Escape, a pointer cancel, a lost window, a drop past the workspace) dispatches nothing and restores the earlier picture; a failed commit rolls back and emits nothing. Every committed structural change emits the one existing event `workspace.layout_changed` with the v2 payload that names the change (`Plans/Contracts_V0.md#CV-361`), and an open that only reveals a tab that is already open emits nothing. Typed local actions (`ui.panel_tab.*`, `ui.workspace_layout.*`) have no production entry, no receipt and no event (`Plans/Commands_System.md#CS-100`).

**Tab strip** (`Plans/FinalGUISpec.md#F3-631`, `#F3-633`)

| Control | Dispatch | Production entry | Effect |
|---|---|---|---|
| A tab: click; arrows, Home, End, Enter or Space in a focused strip | `ui.panel_tab.activate` | none | typed local action, no receipt, no event |
| Ctrl+PgDn / Ctrl+PgUp; Alt+1..8 and Alt+9 (last tab) | `ui.panel_tab.activate` | none | typed local action, no receipt, no event |
| Ctrl+Tab / Ctrl+Shift+Tab, hold, step, release (web client Alt+\` / Alt+Shift+\`) | `ui.panel_tab.activate` on release | none | typed local action, no receipt, no event |
| A tab's close target (24 x 24 px), a middle click, Delete on the focused tab | `cmd.panel_tab.close` with this tab, after the kind's close check | `home.tab.close` | `workspace.layout_changed` |
| Double click on a preview tab; the first edit in a preview tab | `cmd.panel_tab.keep` | `home.tab.keep` | `workspace.layout_changed` |
| Alt+click on a tab | `cmd.panel_tab.move` with `split` by the fit rule (Move to new panel) | `home.tab.alt_click` | `workspace.layout_changed` |
| Drag a tab within its strip | `cmd.panel_tab.move` with the new `index`, one commit on a changed release | `home.tab.drag_reorder` | `workspace.layout_changed` |
| Drag a tab onto another panel's strip | `cmd.panel_tab.move` with `panel_id` and `index` | `home.tab.drag_to_panel` | `workspace.layout_changed` |
| Drag a tab onto a panel's edge band or the centre's outer edge band | `cmd.panel_tab.move` with `split: { panel_id, edge }` | `home.tab.drag_to_edge` | `workspace.layout_changed` |
| Drop a carried tab on "+N" | `cmd.panel_tab.move` into that panel | `home.tab.drag_to_overflow` | `workspace.layout_changed` |
| Tear-off: the pointer leaves the strip band by 14 px vertically or 40 px horizontally | nothing: a preview until the release lands as one of the three drag rows above | none | none |
| Double click on a strip's empty space | `ui.workspace_layout.maximize` | none | typed local action, no receipt, no event |
| The "+" after the last tab; Ctrl+Shift+Space | opens the "+" menu | none | view-local, dispatches nothing |
| "+N" | opens the "+N" list | none | view-local, dispatches nothing |
| A "+N" list row: click or Enter | `ui.panel_tab.activate` | none | typed local action, no receipt, no event |
| A "+N" list row's close target, or Delete on a row; the same in the every-tab list | `cmd.panel_tab.close` | `home.overflow_list.close` | `workspace.layout_changed` |
| Ctrl+Shift+A (every tab, searchable); typing in a list's search field | opens or filters the list | none | view-local, dispatches nothing |
| A tab's menu: right click, or Shift+F10 on the focused tab | opens the tab menu | none | view-local, dispatches nothing |
| Tab menu > Close | `cmd.panel_tab.close` | `home.tab_menu.close` | `workspace.layout_changed` |
| Tab menu > Close others | `cmd.panel_tab.close` with the panel's other unpinned tabs, one commit | `home.tab_menu.close_others` | `workspace.layout_changed` |
| Tab menu > Close to the right | `cmd.panel_tab.close` with the unpinned tabs to the right, one commit | `home.tab_menu.close_to_right` | `workspace.layout_changed` |
| Tab menu > Keep open (preview tabs only) | `cmd.panel_tab.keep` | `home.tab_menu.keep` | `workspace.layout_changed` |
| Tab menu > Pin | `cmd.panel_tab.pin` | `home.tab_menu.pin` | `workspace.layout_changed` |
| Tab menu > Unpin | `cmd.panel_tab.unpin` | `home.tab_menu.unpin` | `workspace.layout_changed` |
| Tab menu > Rename... (the prompt is view-local), then Rename | `cmd.panel_tab.rename` | `home.tab_menu.rename` | `workspace.layout_changed` |
| Tab menu > Move to new panel | `cmd.panel_tab.move` with `split` by the fit rule | `home.tab_menu.move_to_new_panel` | `workspace.layout_changed` |
| Tab menu > Move to panel > a panel | `cmd.panel_tab.move` with `panel_id` | `home.tab_menu.move_to_panel` | `workspace.layout_changed` |
| Tab menu > Split right with this tab | `cmd.panel_tab.move` with `split: { panel_id, edge: right }` | `home.tab_menu.split_right_with_tab` | `workspace.layout_changed` |
| Tab menu > Split down with this tab | `cmd.panel_tab.move` with `split: { panel_id, edge: bottom }` | `home.tab_menu.split_down_with_tab` | `workspace.layout_changed` |

**The "+" menu, Quick Open and the empty-panel launcher** (`Plans/FinalGUISpec.md#F3-632`, `#F3-634`). A row's body opens its item as a new tab in this panel (`where: tab`); its 34 x 34 px trailing cell, Alt+click or Alt+Enter opens it as a new panel by the fit rule (`where: panel`).

| Control | Dispatch | Production entry | Effect |
|---|---|---|---|
| The filter field "Open anything: kinds, files, URLs": typing | filters the menu; a kind it finds behaves as that kind's row | none | view-local, dispatches nothing |
| The filter field: a file it found | `cmd.file.open` with `mode: keep` | `home.plus_menu.filter_file` | `workspace.layout_changed` when a tab is added; none on a reveal |
| The filter field: an address it recognised | `cmd.browser.open_workspace_preview` | `home.plus_menu.filter_address` | the browser event set; `workspace.layout_changed` only when a tab is added |
| "+" > Terminal: the row's body | `cmd.panel_tab.open` with `{ kind: terminal }` and the default profile, `where: tab` | `home.plus_menu.terminal` | `workspace.layout_changed` when a tab is added; none on a reveal |
| "+" > Terminal: the trailing cell, Alt+click, Alt+Enter | `cmd.panel_tab.open` with `{ kind: terminal }` and the default profile, `where: panel` | `home.plus_menu.terminal_new_panel` | `workspace.layout_changed` when a tab is added; none on a reveal |
| "+" > Terminal > a shell profile or SSH host: the row's body | `cmd.panel_tab.open` with `{ kind: terminal, profile }`, `where: tab` | `home.plus_menu.terminal_profile` | `workspace.layout_changed` when a tab is added; none on a reveal |
| "+" > Terminal > a shell profile or SSH host: the trailing cell, Alt+click, Alt+Enter | `cmd.panel_tab.open` with `{ kind: terminal, profile }`, `where: panel` | `home.plus_menu.terminal_profile_new_panel` | `workspace.layout_changed` when a tab is added; none on a reveal |
| "+" > Browser: the row's body | `cmd.panel_tab.open` with `{ kind: browser }` (a blank browser), `where: tab` | `home.plus_menu.browser` | `workspace.layout_changed` when a tab is added; none on a reveal |
| "+" > Browser: the trailing cell, Alt+click, Alt+Enter | `cmd.panel_tab.open` with `{ kind: browser }` (a blank browser), `where: panel` | `home.plus_menu.browser_new_panel` | `workspace.layout_changed` when a tab is added; none on a reveal |
| "+" > Browser > a recent address: the row's body | `cmd.browser.open_workspace_preview`, `where: tab` | `home.plus_menu.browser_recent` | the browser event set; `workspace.layout_changed` only when a tab is added |
| "+" > Browser > a recent address: the trailing cell, Alt+click, Alt+Enter | `cmd.browser.open_workspace_preview`, `where: panel` | `home.plus_menu.browser_recent_new_panel` | the browser event set; `workspace.layout_changed` only when a tab is added |
| "+" > File... > one of the three recent files: the row's body | `cmd.file.open` with `mode: keep`, `where: tab` | `home.plus_menu.recent_file` | `workspace.layout_changed` when a tab is added; none on a reveal |
| "+" > File... > one of the three recent files: the trailing cell, Alt+click, Alt+Enter | `cmd.file.open` with `mode: keep`, `where: panel` | `home.plus_menu.recent_file_new_panel` | `workspace.layout_changed` when a tab is added; none on a reveal |
| "+" > Dashboard: the row's body | `cmd.panel_tab.open` with `{ kind: dashboard }` and no `board_id` (a new board), `where: tab` | `home.plus_menu.dashboard` | `workspace.layout_changed` when a tab is added; none on a reveal |
| "+" > Dashboard: the trailing cell, Alt+click, Alt+Enter | `cmd.panel_tab.open` with `{ kind: dashboard }` and no `board_id` (a new board), `where: panel` | `home.plus_menu.dashboard_new_panel` | `workspace.layout_changed` when a tab is added; none on a reveal |
| "+" > Dashboard > a board: the row's body | `cmd.panel_tab.open` with `{ kind: dashboard, board_id }`, `where: tab` | `home.plus_menu.dashboard_board` | `workspace.layout_changed` when a tab is added; none on a reveal |
| "+" > Dashboard > a board: the trailing cell, Alt+click, Alt+Enter | `cmd.panel_tab.open` with `{ kind: dashboard, board_id }`, `where: panel` | `home.plus_menu.dashboard_board_new_panel` | `workspace.layout_changed` when a tab is added; none on a reveal |
| "+" > Plan or document... > a choice in its picker: the row's body | `cmd.nav.open_subject`, `where: tab` | `home.plus_menu.plan_or_document` | `workspace.layout_changed` when a tab is added; none on a reveal |
| "+" > Plan or document... > a choice in its picker: the trailing cell, Alt+click, Alt+Enter | `cmd.nav.open_subject`, `where: panel` | `home.plus_menu.plan_or_document_new_panel` | `workspace.layout_changed` when a tab is added; none on a reveal |
| "+" > Artifact... > a choice in its picker: the row's body | `cmd.nav.open_subject` with the artifact subject, `where: tab` | `home.plus_menu.artifact` | `workspace.layout_changed` when a tab is added; none on a reveal |
| "+" > Artifact... > a choice in its picker: the trailing cell, Alt+click, Alt+Enter | `cmd.nav.open_subject` with the artifact subject, `where: panel` | `home.plus_menu.artifact_new_panel` | `workspace.layout_changed` when a tab is added; none on a reveal |
| "+" > Output, Problems, Ports, Debug Console > Output: the row's body | `cmd.panel_tab.open` with `{ kind: output }`, `where: tab` | `home.plus_menu.output` | `workspace.layout_changed` when a tab is added; none on a reveal |
| "+" > Output, Problems, Ports, Debug Console > Output: the trailing cell, Alt+click, Alt+Enter | `cmd.panel_tab.open` with `{ kind: output }`, `where: panel` | `home.plus_menu.output_new_panel` | `workspace.layout_changed` when a tab is added; none on a reveal |
| "+" > Output, Problems, Ports, Debug Console > Problems: the row's body | `cmd.panel_tab.open` with `{ kind: problems }`, `where: tab` | `home.plus_menu.problems` | `workspace.layout_changed` when a tab is added; none on a reveal |
| "+" > Output, Problems, Ports, Debug Console > Problems: the trailing cell, Alt+click, Alt+Enter | `cmd.panel_tab.open` with `{ kind: problems }`, `where: panel` | `home.plus_menu.problems_new_panel` | `workspace.layout_changed` when a tab is added; none on a reveal |
| "+" > Output, Problems, Ports, Debug Console > Ports: the row's body | `cmd.panel_tab.open` with `{ kind: ports }`, `where: tab` | `home.plus_menu.ports` | `workspace.layout_changed` when a tab is added; none on a reveal |
| "+" > Output, Problems, Ports, Debug Console > Ports: the trailing cell, Alt+click, Alt+Enter | `cmd.panel_tab.open` with `{ kind: ports }`, `where: panel` | `home.plus_menu.ports_new_panel` | `workspace.layout_changed` when a tab is added; none on a reveal |
| "+" > Output, Problems, Ports, Debug Console > Debug Console: the row's body | `cmd.panel_tab.open` with `{ kind: debug_console }`, `where: tab` | `home.plus_menu.debug_console` | `workspace.layout_changed` when a tab is added; none on a reveal |
| "+" > Output, Problems, Ports, Debug Console > Debug Console: the trailing cell, Alt+click, Alt+Enter | `cmd.panel_tab.open` with `{ kind: debug_console }`, `where: panel` | `home.plus_menu.debug_console_new_panel` | `workspace.layout_changed` when a tab is added; none on a reveal |
| "+" > File... (the row's body); "+" > Plan or document... and Artifact... (opening the picker); "+" > the tool row (opening its submenu) | opens Quick Open, a picker or a submenu | none | view-local, dispatches nothing |
| "+" > File...: the trailing cell, Alt+click, Alt+Enter | opens Quick Open for a new panel; its Enter dispatches `cmd.file.open` with `mode: keep`, `where: panel` through `home.quick_open.open` | none | view-local, dispatches nothing |
| "+" > Split right | `cmd.workspace_layout.split` with `direction: right` | `home.plus_menu.split_right` | `workspace.layout_changed` |
| "+" > Split down | `cmd.workspace_layout.split` with `direction: down` | `home.plus_menu.split_down` | `workspace.layout_changed` |
| "+" > Reopen closed tab | `cmd.panel_tab.reopen_closed` | `home.plus_menu.reopen_closed` | `workspace.layout_changed` |
| Quick Open (Ctrl+P, or a File... row): Enter on a file; Alt+Enter as a new panel | `cmd.file.open` with `mode: keep` | `home.quick_open.open` | `workspace.layout_changed` when a tab is added; none on a reveal |
| Empty-panel launcher > Terminal: the row's body | `cmd.panel_tab.open` with `{ kind: terminal }`, `where: tab` | `home.launcher.terminal` | `workspace.layout_changed` when a tab is added; none on a reveal |
| Empty-panel launcher > Terminal: the trailing cell, Alt+click, Alt+Enter | `cmd.panel_tab.open` with `{ kind: terminal }`, `where: panel` | `home.launcher.terminal_new_panel` | `workspace.layout_changed` when a tab is added; none on a reveal |
| Empty-panel launcher > Browser: the row's body | `cmd.panel_tab.open` with `{ kind: browser }`, `where: tab` | `home.launcher.browser` | `workspace.layout_changed` when a tab is added; none on a reveal |
| Empty-panel launcher > Browser: the trailing cell, Alt+click, Alt+Enter | `cmd.panel_tab.open` with `{ kind: browser }`, `where: panel` | `home.launcher.browser_new_panel` | `workspace.layout_changed` when a tab is added; none on a reveal |
| Empty-panel launcher > Dashboard: the row's body | `cmd.panel_tab.open` with `{ kind: dashboard }` (a new board), `where: tab` | `home.launcher.dashboard` | `workspace.layout_changed` when a tab is added; none on a reveal |
| Empty-panel launcher > Dashboard: the trailing cell, Alt+click, Alt+Enter | `cmd.panel_tab.open` with `{ kind: dashboard }` (a new board), `where: panel` | `home.launcher.dashboard_new_panel` | `workspace.layout_changed` when a tab is added; none on a reveal |
| Empty-panel launcher > Plan or document... > a choice in its picker: the row's body | `cmd.nav.open_subject`, `where: tab` | `home.launcher.plan_or_document` | `workspace.layout_changed` when a tab is added; none on a reveal |
| Empty-panel launcher > Plan or document... > a choice in its picker: the trailing cell, Alt+click, Alt+Enter | `cmd.nav.open_subject`, `where: panel` | `home.launcher.plan_or_document_new_panel` | `workspace.layout_changed` when a tab is added; none on a reveal |
| Empty-panel launcher > Artifact... > a choice in its picker: the row's body | `cmd.nav.open_subject` with the artifact subject, `where: tab` | `home.launcher.artifact` | `workspace.layout_changed` when a tab is added; none on a reveal |
| Empty-panel launcher > Artifact... > a choice in its picker: the trailing cell, Alt+click, Alt+Enter | `cmd.nav.open_subject` with the artifact subject, `where: panel` | `home.launcher.artifact_new_panel` | `workspace.layout_changed` when a tab is added; none on a reveal |
| Empty-panel launcher > Output: the row's body | `cmd.panel_tab.open` with `{ kind: output }`, `where: tab` | `home.launcher.output` | `workspace.layout_changed` when a tab is added; none on a reveal |
| Empty-panel launcher > Output: the trailing cell, Alt+click, Alt+Enter | `cmd.panel_tab.open` with `{ kind: output }`, `where: panel` | `home.launcher.output_new_panel` | `workspace.layout_changed` when a tab is added; none on a reveal |
| Empty-panel launcher > Problems: the row's body | `cmd.panel_tab.open` with `{ kind: problems }`, `where: tab` | `home.launcher.problems` | `workspace.layout_changed` when a tab is added; none on a reveal |
| Empty-panel launcher > Problems: the trailing cell, Alt+click, Alt+Enter | `cmd.panel_tab.open` with `{ kind: problems }`, `where: panel` | `home.launcher.problems_new_panel` | `workspace.layout_changed` when a tab is added; none on a reveal |
| Empty-panel launcher > Ports: the row's body | `cmd.panel_tab.open` with `{ kind: ports }`, `where: tab` | `home.launcher.ports` | `workspace.layout_changed` when a tab is added; none on a reveal |
| Empty-panel launcher > Ports: the trailing cell, Alt+click, Alt+Enter | `cmd.panel_tab.open` with `{ kind: ports }`, `where: panel` | `home.launcher.ports_new_panel` | `workspace.layout_changed` when a tab is added; none on a reveal |
| Empty-panel launcher > Debug Console: the row's body | `cmd.panel_tab.open` with `{ kind: debug_console }`, `where: tab` | `home.launcher.debug_console` | `workspace.layout_changed` when a tab is added; none on a reveal |
| Empty-panel launcher > Debug Console: the trailing cell, Alt+click, Alt+Enter | `cmd.panel_tab.open` with `{ kind: debug_console }`, `where: panel` | `home.launcher.debug_console_new_panel` | `workspace.layout_changed` when a tab is added; none on a reveal |
| Empty-panel launcher > Split right | `cmd.workspace_layout.split` with `direction: right` | `home.launcher.split_right` | `workspace.layout_changed` |
| Empty-panel launcher > Split down | `cmd.workspace_layout.split` with `direction: down` | `home.launcher.split_down` | `workspace.layout_changed` |
| Empty-panel launcher > Reopen closed tab | `cmd.panel_tab.reopen_closed` | `home.launcher.reopen_closed` | `workspace.layout_changed` |
| Empty-panel launcher > one of the five recent files | `cmd.file.open` with `mode: keep` | `home.launcher.recent_file` | `workspace.layout_changed` when a tab is added; none on a reveal |
| Empty-panel launcher > File...; the hint line | opens Quick Open; the hint dispatches nothing | none | view-local, dispatches nothing |
| Empty-panel launcher > File...: the trailing cell, Alt+click, Alt+Enter | opens Quick Open for a new panel; its Enter dispatches `cmd.file.open` with `mode: keep`, `where: panel` through `home.quick_open.open` | none | view-local, dispatches nothing |

**Panels: grip, Move panel, dividers, panel menu, named layouts** (`Plans/FinalGUISpec.md#F3-630`, `#F3-502`)

| Control | Dispatch | Production entry | Effect |
|---|---|---|---|
| A panel's corner grip: drag the whole panel | `cmd.workspace_layout.move_surface` with `target: { panel_id, edge }` or `{ centre_edge }` | `home.panel.grip` | `workspace.layout_changed` |
| Enter on a panel's grip | opens Move panel | none | view-local, dispatches nothing |
| Move panel > a side of another panel, or the centre's outer edge | `cmd.workspace_layout.move_surface` | `home.panel_menu.move_panel` | `workspace.layout_changed` |
| Move panel > Into another panel (as tabs) | `cmd.workspace_layout.move_surface` with `edge: center` | `home.panel_menu.move_into` | `workspace.layout_changed` |
| A divider: drag, or double click to even the two sides | `cmd.workspace_layout.resize_surface` with `split_id` and `sizes`, one commit on release | `home.panel.divider` | `workspace.layout_changed` |
| A focused divider: arrows 8 px, Shift+arrows 48 px, Home or End, Enter evens | `cmd.workspace_layout.resize_surface`, one commit per changed key press | `home.panel.divider_keys` | `workspace.layout_changed` |
| A divider drag that leaves a panel below half its minimum, or pulls a folded panel open | `cmd.workspace_layout.set_collapsed`, instead of a resize on that release | `home.panel.divider_collapse` | `workspace.layout_changed` |
| The panel menu (the options button at the end of a strip) | opens the panel menu | none | view-local, dispatches nothing |
| Panel menu > Split right | `cmd.workspace_layout.split` with `direction: right` | `home.panel_menu.split_right` | `workspace.layout_changed` |
| Panel menu > Split down | `cmd.workspace_layout.split` with `direction: down` | `home.panel_menu.split_down` | `workspace.layout_changed` |
| Panel menu > Maximize / Restore panels; Shift+Escape; Escape while focus is in a strip | `ui.workspace_layout.maximize` | none | typed local action, no receipt, no event |
| Panel menu > Collapse to tabs / Expand | `cmd.workspace_layout.set_collapsed` | `home.panel_menu.collapse` | `workspace.layout_changed` |
| Panel menu > Lock panel / Unlock panel | `cmd.workspace_layout.lock` | `home.panel_menu.lock` | `workspace.layout_changed` |
| Panel menu > Show all tabs in this panel | opens the "+N" list with every tab | none | view-local, dispatches nothing |
| Panel menu > Layouts > a named or saved layout | `cmd.workspace_layout.apply_named` | `home.panel_menu.apply_layout` | `workspace.layout_changed` |
| Panel menu > Layouts > Save this layout... (the prompt is view-local), then Save | `cmd.workspace_layout.save_named` | `home.panel_menu.save_layout` | `workspace.layout_changed` |
| Panel menu > Layouts > Restore home layout | `cmd.workspace_layout.reset` | `home.panel_menu.restore_home_layout` | `workspace.layout_changed` |
| Panel menu > Close other tabs | `cmd.panel_tab.close` with the panel's other unpinned tabs | `home.panel_menu.close_other_tabs` | `workspace.layout_changed` |
| Panel menu > Close panel | `cmd.workspace_layout.close_panel` | `home.panel_menu.close_panel` | `workspace.layout_changed` |
| Title bar > Home options menu (the trigger) | opens the menu | none | view-local, dispatches nothing |
| Home options menu > a named or saved layout | `cmd.workspace_layout.apply_named` | `home.more_options.apply_layout` | `workspace.layout_changed` |
| Home options menu > Save this layout..., then Save | `cmd.workspace_layout.save_named` | `home.more_options.save_layout` | `workspace.layout_changed` |
| Home options menu > Restore home layout | `cmd.workspace_layout.reset` | `home.more_options.reset_layout` | `workspace.layout_changed` |
| Settings > General & Appearance > Startup & Recovery > Restore home layout | `cmd.workspace_layout.reset` after one confirmation (its row is `general.startup.reset-home-layout`, `Plans/Settings_System.md#SSYS-050`) | `home.settings.reset_layout` | `workspace.layout_changed` |
| Home options menu > Run setup wizard | `ui.onboarding.start` (UCC-106, WM-041) | none | typed local action, no receipt, no event |

**The chat column** (`Plans/FinalGUISpec.md#F3-637`, `Plans/UI_Command_Catalog.md#UCC-203`)

| Control | Dispatch | Production entry | Effect |
|---|---|---|---|
| Activity bar > Chat | `cmd.panel.switch` with `chat` | `home.chat.activity_toggle` | receipt, no event |
| Home options menu > Show the chat / Hide the chat | `cmd.panel.switch` with `chat` | `home.more_options.chat_visibility` | receipt, no event |
| The chat column's inner edge: drag | `cmd.workspace_layout.resize_surface` with `{ surface: chat, width }`, one commit on release | `home.resizer.chat` | `workspace.layout_changed` |
| The chat header menu > Pop out (desktop app) | `cmd.panel.undock` with `chat` | `home.chat.pop_out` | `panel.undocked` |
| Home options menu > Pop out the chat (desktop app) | `cmd.panel.undock` with `chat` | `home.more_options.chat_pop_out` | `panel.undocked` |
| The popped-out chat window > Dock back (return) | `cmd.panel.redock` with `chat` | `home.chat.dock_back` | `panel.redocked` |
| Home options menu > Dock the chat back | `cmd.panel.redock` with `chat` | `home.more_options.chat_dock_back` | `panel.redocked` |
| Home options menu > Keep the chat open in narrow windows | `cmd.settings.transaction.preview` then `cmd.settings.transaction.apply` over its SSYS-050 row | none | the existing `catalog.settings_transaction_preview` and `catalog.settings_transaction_apply` rows; receipt, no event |
| The History list's pin (5.6 Pro History flyout) | id pending: no command or local action id is settled yet; its value is History pinned in the Home record's chat column (`Plans/storage-plan.md#SP-330`); ACD-500 owns the control | none | no row until the id is ruled (UIW-040's pending exception) |
| The chat's 32 px edge strip in a narrow window: opening the chat from it | nothing: a narrow-ladder state, never saved (F3-636) | none | none |

**The narrow switcher** (`Plans/FinalGUISpec.md#F3-636`)

| Control | Dispatch | Production entry | Effect |
|---|---|---|---|
| The panel switcher ("2/3") in the one-column strip: choosing a panel, or its previous and next | `ui.workspace_layout.focus_panel` | none | typed local action, no receipt, no event |
| "New panel", trailing cells and splits while the centre is one column | the same rows as above; the item opens in the next panel of the switcher and the announcement says so; nothing new is created | none | as the row it came from |

**Keys** (`Plans/FinalGUISpec.md#F3-635`, `Plans/UI_Command_Catalog.md#UCC-200`). In a web browser the four chords the browser owns are answered as Alt+T, Alt+W, Alt+Shift+T and Alt+\`, and every label shows the key that works where the app runs. The shell keeps Ctrl+1..9 and Ctrl+K: there are no Ctrl+K chords, and no bare letter or digit is a panel key.

| Control | Dispatch | Production entry | Effect |
|---|---|---|---|
| Ctrl+T (web client Alt+T) | `cmd.panel_tab.open`, a new tab of the panel's usual kind | `home.keys.new_tab` | `workspace.layout_changed` when a tab is added; none on a reveal |
| Ctrl+W (web client Alt+W) | `cmd.panel_tab.close` with the focused tab | `home.keys.close_tab` | `workspace.layout_changed` |
| Ctrl+Shift+T (web client Alt+Shift+T) | `cmd.panel_tab.reopen_closed` | `home.keys.reopen_closed` | `workspace.layout_changed` |
| Ctrl+Shift+\` | `cmd.panel_tab.open` with `{ kind: terminal }` | `home.keys.new_terminal` | `workspace.layout_changed` when a tab is added; none on a reveal |
| Ctrl+Shift+B | `cmd.panel_tab.open` with `{ kind: browser }` | `home.keys.new_browser` | `workspace.layout_changed` when a tab is added; none on a reveal |
| Ctrl+Shift+PgUp / Ctrl+Shift+PgDn | `cmd.panel_tab.move` one step left or right | `home.keys.move_tab` | `workspace.layout_changed` |
| Alt+Shift+arrows | `cmd.panel_tab.move` to the panel in that direction, or a split that way when there is none and it fits | `home.keys.move_tab_to_panel` | `workspace.layout_changed` |
| Ctrl+\ | `cmd.workspace_layout.split` with `direction: right` | `home.keys.split_right` | `workspace.layout_changed` |
| Ctrl+Shift+\ | `cmd.workspace_layout.split` with `direction: down` | `home.keys.split_down` | `workspace.layout_changed` |
| Ctrl+P; Ctrl+Shift+A; Ctrl+Shift+Space; Shift+F10 on a tab; Enter on a grip | open Quick Open, the every-tab list, the "+" menu, the tab menu, Move panel | none | view-local, dispatches nothing |
| Ctrl+Tab, Ctrl+PgDn / PgUp, Alt+1..9 | `ui.panel_tab.activate` | none | typed local action, no receipt, no event |
| Alt+arrows; Alt+Shift+1..9 | `ui.workspace_layout.focus_panel` | none | typed local action, no receipt, no event |
| Shift+Escape | `ui.workspace_layout.maximize` | none | typed local action, no receipt, no event |
| F6 / Shift+F6 (rail, panels, chat) | keyboard focus movement owned by FinalGUISpec's keyboard rules; no action id | none | none |
| Tab to a divider, then the divider keys | see `home.panel.divider_keys` above | none | as that row |

### WM-090 - Home Panels Wiring

```yaml
plan_unit_id: WM-090
unit_type: integration_contract
status: accepted
owner_doc: Plans/Wiring_Matrix.md
canonical_text: >-
  Every Home control of the universal panel system (DL-180) has exactly one wiring row: a production entry in
  Plans/Wiring_Matrix.production.json when it dispatches a command, otherwise a typed local action or a view-local
  disposition with no entry, as this addendum's tables list them. The tab strip, the tab menu, the "+" menu with each
  row's body (where tab) and its trailing cell, Alt+click or Alt+Enter (where panel), Quick Open, the empty-panel
  launcher, the "+N" list and the every-tab list, the panel grip and Move panel, dividers with their keys, the panel
  menu, the named layouts and Restore home layout, the title bar's Home options menu, the chat column (show and hide,
  width, Pop out, Dock back, keep open in narrow windows), the narrow switcher and the keyboard map with its web-client
  mapping are covered. Tabs commit through cmd.panel_tab.open, cmd.panel_tab.close, cmd.panel_tab.move and the rest
  of the cmd.panel_tab.* family, and panels through cmd.workspace_layout.split, cmd.workspace_layout.move_surface,
  cmd.workspace_layout.resize_surface, cmd.workspace_layout.set_collapsed, cmd.workspace_layout.reset and the rest of
  the cmd.workspace_layout.* family (UCC-200). Commits run the gesture transaction of UIW-012: previews, menus, lists and hovering dispatch
  nothing, a changed release dispatches one command, a cancelled or unchanged gesture restores the earlier picture
  with no dispatch, and a failed commit rolls back. Every committed structural change emits the one existing event
  workspace.layout_changed with its v2 payload (CV-361) and writes pm.home_workspace_layout.v2 once (SP-330); an open
  that only reveals a tab emits nothing; cmd.panel.switch is receipt only; cmd.panel.undock and cmd.panel.redock emit
  panel.undocked and panel.redocked for the chat only. ui.panel_tab.activate, ui.workspace_layout.maximize and
  ui.workspace_layout.focus_panel are typed local actions with no entry. Fifty-one home.* entries of the fixed-zone
  model retire and are recorded in the reconciliation file; five are rebuilt on the v2 model. The History list's pin
  has no row until its id is ruled (UIW-040's pending exception).
gui_related: true
gui_classification_reason: "Binds every visible control of the universal panels, the chat column and the Home keys to exactly one command or typed local action."
split_recommended: false
depends_on: [DL-180, UCC-200, UCC-202, UCC-203, CS-100, CS-101, F3-630, F3-631, F3-632, F3-633, F3-634, F3-635, F3-636, F3-637, F3-502, CV-360, CV-361, SP-330, UIW-012, UIW-040, UIW-041, WM-045]
unblocks: [ATS-075]
acceptance_criteria:
  - "Every control in the Home tables maps to exactly one production entry, typed local action or view-local disposition, and every home.* production entry appears in the tables."
  - "No production entry exists for ui.panel_tab.activate, ui.workspace_layout.maximize, ui.workspace_layout.focus_panel, a menu or list opening, a hover or a drag preview."
  - "Every entry of a cmd.panel_tab.* or cmd.workspace_layout.* command declares exactly workspace.layout_changed; every cmd.panel_tab.open and open-route entry declares workspace.layout_changed for an added tab and nothing for a reveal."
  - "No production entry names editor_panel_1 to editor_panel_4, a dock host, the floating host, a terminal section, a workgroup, Collapse Bottom Terminal or a chat grab."
  - "In the web client the four browser-owned chords are answered as Alt+T, Alt+W, Alt+Shift+T and Alt+`, and the key entries say so."
  - "All rows sharing a command name one handler."
validation_surfaces:
  - python3 scripts/pm-plans-verify.py validate-wiring-matrix
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
risk_class: home_panels_terminal_redesign_drift
reasoning_tier: high
context_scope: home_panels_terminal
implementation_surfaces:
  - Plans/Wiring_Matrix.md
  - Plans/Wiring_Matrix.production.json
  - Plans/PMConcept7_Home_Workspace_Control_Reconciliation.json
node_compile_hint:
  mode: static_wiring_intent_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Plans/Decision_Log.md#DL-180"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/DECISIONS.md (SHA-256 0d2b45466c91734e15fd8659e9a8e3b17b70d92be785421e57e084dc8daf6b64)"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/canon-inputs/panels-CONTRACT-v1-778c8494e6.md (SHA-256 aa16fc080f44f6824b0ef32a2b568bfcae81277b6962caaba1b441015d68dae9; sections 6 to 9 and 13; concept lineage only)"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/canon-inputs/panels-NUMBERS-407e6fb6fe.md (SHA-256 019721f5215d95c80b999d5b61e1ee4bf79b29afc5b229a12bccde6f738c5162; the \"+\" menu, Commands and keys; concept lineage only)"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/plans-home-audit.md (SHA-256 f8e65fd64028014e3ee9bebf68594356d40eb5c831975645da6a3406cef2e3e8; section 6.2 items 2, 7 and 10)"
preserved_exact_tokens:
  - "cmd.panel_tab.open"
  - "cmd.panel_tab.close"
  - "cmd.panel_tab.move"
  - "cmd.workspace_layout.split"
  - "cmd.workspace_layout.move_surface"
  - "cmd.workspace_layout.resize_surface"
  - "cmd.workspace_layout.set_collapsed"
  - "cmd.workspace_layout.reset"
  - "ui.panel_tab.activate"
  - "ui.workspace_layout.maximize"
  - "ui.workspace_layout.focus_panel"
  - "workspace.layout_changed"
  - "pm.home_workspace_layout.v2"
negative_constraints:
  - "Do not add a production entry for a typed local action, a menu or list opening, a hover or a drag preview."
  - "Do not wire a chat move, dock or in-window float, or a pop-out of any panel, tab or dashboard."
  - "Do not emit workspace.layout_changed for a reveal, a cancelled or unchanged gesture, or a failed commit."
  - "Do not use Ctrl+1..9, a Ctrl+K chord, or a bare letter or digit as a panel key."
compatibility_only_notes:
  - "cmd.workspace_layout.size_surface still normalizes to cmd.workspace_layout.resize_surface and has no entry."
stale_retired_dispositions:
  - "Retired 2026-10-09 (DL-180): 51 home.* entries of the fixed-zone model; the list is control_census.retired_rows_2026_10_09 in Plans/PMConcept7_Home_Workspace_Control_Reconciliation.json."
owner_hints:
  - Plans/Wiring_Matrix.md
  - Plans/Wiring_Matrix.production.json
```

ContractRef: ContractName:Plans/Decision_Log.md#DL-180, ContractName:Plans/UI_Command_Catalog.md#UCC-200, ContractName:Plans/UI_Command_Catalog.md#UCC-203, ContractName:Plans/FinalGUISpec.md#F3-630, ContractName:Plans/Contracts_V0.md#CV-361, ContractName:Plans/UI_Wiring_Rules.md#UIW-040

### Terminal tab controls and their wiring

A terminal is one tab kind with one session per tab (`Plans/Section15_MVP_Promoted_Features_Spec.md#SMPFS-180`). Its tab is moved, closed, renamed and pinned by the Home rows above like every tab; the rows below are the controls inside the tab, as `Plans/FinalGUISpec.md#F3-640` to `#F3-646` draw them and `Plans/UI_Command_Catalog.md#UCC-201` registers them. Terminal session commands emit no event and no `workspace.layout_changed`; the agent commands' receipts carry the fields of `Plans/Contracts_V0.md#CV-362`. A focused terminal keeps the shell's keys and gives back to the host the keys of the revised terminal SPEC's section 3 (UCC-201); `ui.terminal.*` actions have no production entry.

**Header row** (`Plans/FinalGUISpec.md#F3-640`)

| Control | Dispatch | Production entry | Effect |
|---|---|---|---|
| Find (Ctrl+Shift+F, Cmd+F) | `ui.terminal.find` | none | typed local action, no receipt, no event |
| Split (Ctrl+Shift+5, Cmd+D) | `cmd.workspace_layout.split` with `{ kind: terminal, profile, cwd }`, `direction: auto` | `terminal.header.split` | `workspace.layout_changed` |
| Maximize / Restore | `ui.workspace_layout.maximize` | none | typed local action, no receipt, no event |
| More (the ⋮ menu) | opens the More menu | none | view-local, dispatches nothing |

**More menu**, in SPEC section 2's order

| Control | Dispatch | Production entry | Effect |
|---|---|---|---|
| New terminal > a shell profile or SSH host | `cmd.panel_tab.open` with `{ kind: terminal, profile }`, `where: tab` | `terminal.more.new_terminal` | `workspace.layout_changed` when a tab is added; none on a reveal |
| Split down | `cmd.workspace_layout.split` with the terminal spec, `direction: down` | `terminal.more.split_down` | `workspace.layout_changed` |
| Appearance... | opens the Appearance popover | none | view-local, dispatches nothing |
| Text size > Bigger, Smaller, Reset (Ctrl+=, Ctrl+-, Ctrl+0) | `ui.terminal.zoom` | none | typed local action, no receipt, no event |
| Copy mode (Ctrl+Shift+X) | `ui.terminal.copy_mode` | none | typed local action, no receipt, no event |
| Quick select (Ctrl+Shift+E) | `ui.terminal.quick_select` | none | typed local action, no receipt, no event |
| Select all (Cmd+A on macOS) | `ui.terminal.select_all` | none | typed local action, no receipt, no event |
| Clear (Ctrl+Shift+K, Cmd+K) | `cmd.terminal.clear` | `terminal.more.clear` | receipt, no event |
| Clear scrollback | `cmd.terminal.clear_scrollback` | `terminal.more.clear_scrollback` | receipt, no event |
| Plain-text buffer (Alt+F2) | `ui.terminal.a11y_buffer` | none | typed local action, no receipt, no event |
| Agent input > Ask each time | nothing: a state row | none | none |
| Agent input > an agent allowed in this terminal | `cmd.terminal.revoke_agent_input` | `terminal.more.revoke_agent_input` | receipt, no event |
| Send signal > Interrupt (SIGINT) | `cmd.terminal.interrupt` | `terminal.more.signal_interrupt` | receipt, no event |
| Send signal > Terminate (SIGTERM) | `cmd.terminal.send_signal` with `SIGTERM` | `terminal.more.signal_terminate` | receipt, no event |
| Send signal > Kill (SIGKILL) | `cmd.terminal.send_signal` with `SIGKILL` | `terminal.more.signal_kill` | receipt, no event |
| Restart session | `cmd.terminal.restart_replace` | `terminal.more.restart_session` | receipt, no event |

**Context menu** (right click; Shift+right click while a program reports the mouse) **and command-mark menu** (a click on a gutter glyph)

| Control | Dispatch | Production entry | Effect |
|---|---|---|---|
| Context menu > Open in editor (on a file reference) | `cmd.file.open` with the path, line and column | `terminal.context.open_in_editor` | `workspace.layout_changed` when a tab is added; none on a reveal |
| Context menu > Open link (on a URL) | `cmd.browser.open_workspace_preview` | `terminal.context.open_link` | the browser event set; `workspace.layout_changed` only when a tab is added |
| Context menu > Copy path, Copy link, Copy (Ctrl+Shift+C, Cmd+C) | `ui.terminal.copy` | none | typed local action, no receipt, no event |
| Context menu > Paste (Ctrl+Shift+V, Cmd+V) | `ui.terminal.paste`, through the same input path and guard as typing | none | typed local action, no receipt, no event |
| Context menu > Select all; Find | `ui.terminal.select_all`; `ui.terminal.find` | none | typed local action, no receipt, no event |
| Context menu > Clear | `cmd.terminal.clear` | `terminal.context.clear` | receipt, no event |
| Command-mark menu > its header row (command, state, duration, who typed it) | nothing | none | none |
| Command-mark menu > Copy command; Copy output; Select output | `ui.terminal.mark.copy_command`; `ui.terminal.mark.copy_output`; `ui.terminal.mark.select_output` | none | typed local action, no receipt, no event |
| Command-mark menu > Rerun | `ui.terminal.mark.rerun`, which dispatches `cmd.terminal.rerun` | `terminal.mark_menu.rerun` | receipt, no event |
| Command-mark menu > Insert command (without Enter) | `ui.terminal.mark.insert`, which would dispatch the DL-035 candidate `cmd.terminal.insert_command`; disabled with `command_not_registered` until UCC-160 admits it | none | no row while the candidate is excluded |
| Command-mark menu > Open output in an editor tab | `ui.terminal.mark.open_output`, which dispatches `cmd.panel_tab.open` with an editor buffer, `mode: keep` | `terminal.mark_menu.open_output` | `workspace.layout_changed` when a tab is added; none on a reveal |
| The sticky command header: a click; Ctrl+Up / Ctrl+Down | `ui.terminal.jump_to_command` | none | typed local action, no receipt, no event |
| Scrolling: Shift+PageUp / Shift+PageDown, Ctrl+Shift+Home / Ctrl+Shift+End, the wheel and the scrollbar | nothing: view-local scrolling | none | view-local, dispatches nothing |

**Find, copy mode, quick select and links** (`Plans/FinalGUISpec.md#F3-641`; revised SPEC section 3)

| Control | Dispatch | Production entry | Effect |
|---|---|---|---|
| The find bar: Enter (previous), Shift+Enter (next), Alt+C, Alt+W, Alt+R, Esc | inside `ui.terminal.find` | none | typed local action, no receipt, no event |
| Copy mode's own keys (h j k l, w b e, v, V, Ctrl+V, y or Enter, /, Esc or q) | inside `ui.terminal.copy_mode` | none | typed local action, no receipt, no event |
| Quick select: a hint (copies); Shift+hint (inserts at the prompt) | inside `ui.terminal.quick_select` | none | typed local action, no receipt, no event |
| Quick select: Alt+hint on a path | `cmd.file.open` | `terminal.quick_select.open_file` | `workspace.layout_changed` when a tab is added; none on a reveal |
| Quick select: Alt+hint on a URL | `cmd.browser.open_workspace_preview` | `terminal.quick_select.open_url` | the browser event set; `workspace.layout_changed` only when a tab is added |
| A plain click on a link | nothing: it selects text, as in every terminal | none | none |
| Ctrl+click (Cmd+click) on a file reference | `cmd.file.open` with `mode: preview` | `terminal.link.open_preview` | `workspace.layout_changed` when a tab is added; none on a reveal |
| Ctrl+double-click on a file reference | `cmd.file.open` with `mode: keep` | `terminal.link.open_keep` | `workspace.layout_changed` when a tab is added; none on a reveal |
| Ctrl+Alt+click on a file reference | `cmd.file.open` with `where: panel` | `terminal.link.open_new_panel` | `workspace.layout_changed` when a tab is added; none on a reveal |
| Ctrl+click (Cmd+click) on a URL | `cmd.browser.open_workspace_preview` (a Browser tab) | `terminal.link.open_url` | the browser event set; `workspace.layout_changed` only when a tab is added |

**Notice rows: agents, an ended session, closing a running terminal, restore and images** (`Plans/FinalGUISpec.md#F3-640`, `#F3-645`, `#F3-646`)

| Control | Dispatch | Production entry | Effect |
|---|---|---|---|
| Driving row > Take over | `cmd.terminal.take_over` | `terminal.agent_row.take_over` | receipt, no event |
| Driving row > Interrupt | `cmd.terminal.interrupt` | `terminal.agent_row.interrupt` | receipt, no event |
| Driving row > Stop | `cmd.terminal.stop_agent` | `terminal.agent_row.stop` | receipt, no event |
| Any keystroke from the person in a terminal an agent is driving | `cmd.terminal.take_over` with `origin: keystroke` | `terminal.screen.keystroke_take_over` | receipt, no event |
| Paused row > Hand back | `cmd.terminal.hand_back` | `terminal.agent_row.hand_back` | receipt, no event |
| Paused row > Stop <agent> | `cmd.terminal.stop_agent` | `terminal.agent_row.stop_paused` | receipt, no event |
| Permission row > Allow once | `cmd.terminal.allow_agent_input` with `grant: once` | `terminal.agent_row.allow_once` | receipt, no event |
| Permission row > Allow in this terminal | `cmd.terminal.allow_agent_input` with `grant: this_terminal` | `terminal.agent_row.allow_in_this_terminal` | receipt, no event |
| Permission row > Deny | `cmd.terminal.deny_agent_input` | `terminal.agent_row.deny` | receipt, no event |
| Secret input row > Type it | `ui.panel_tab.activate` with `focus: true` on this terminal | none | typed local action, no receipt, no event |
| Session ended row > Restart | `cmd.terminal.restart_replace` | `terminal.ended_row.restart` | receipt, no event |
| Enter in an ended terminal | `cmd.terminal.restart_replace` | `terminal.ended_row.enter_restarts` | receipt, no event |
| Session ended row > Close tab | `cmd.panel_tab.close` | `terminal.ended_row.close_tab` | `workspace.layout_changed` |
| Closing a running terminal: "Close this terminal? <process> is still running and will be stopped." > Close terminal | `cmd.panel_tab.close`, the confirmed two-step close that ends the session | `terminal.close_row.close_terminal` | `workspace.layout_changed` |
| The same row > Keep it open | nothing: the close is cancelled | none | none |
| The restored notice and the could-not-load-scrollback notice | nothing: text only; no control dispatches | none | none |
| An image a limit, a quota or a transfer rule refuses | nothing: the image is not drawn and the program receives SMPFS-181's fixed reply; no notice control exists | none | none |

**Appearance popover** (`Plans/FinalGUISpec.md#F3-642`, `#F3-643`)

| Control | Dispatch | Production entry | Effect |
|---|---|---|---|
| This terminal / All terminals switch; scheme search; hovering a scheme (a live preview that Escape reverts); Close | nothing | none | view-local, dispatches nothing |
| Any field with This terminal selected | `cmd.terminal.appearance.set` with `panel_tab_id` and the changed fields | `terminal.appearance.field` | receipt, no event |
| Any field with All terminals selected | `cmd.settings.transaction.preview` then `cmd.settings.transaction.apply` over SSYS-051's rows | none | the existing `catalog.settings_transaction_preview` and `catalog.settings_transaction_apply` rows; receipt, no event |
| Import scheme... | `cmd.terminal.appearance.import_scheme` | `terminal.appearance.import_scheme` | receipt, no event |
| Background image > Choose... | a file picker (view-local); the chosen image is written like any field | none | as the field row |
| Degauss (Retro) | `ui.terminal.degauss` | none | typed local action, no receipt, no event |

### WM-091 - Terminal Tab Wiring

```yaml
plan_unit_id: WM-091
unit_type: integration_contract
status: accepted
owner_doc: Plans/Wiring_Matrix.md
canonical_text: >-
  Every control inside a terminal tab (DL-181) has exactly one wiring row as this addendum's terminal tables list
  them: the header row (Find, Split, Maximize or Restore, More), every More menu leaf, the screen's context menu, the
  command-mark menu, find, copy mode, quick select, links (Ctrl+click opens the panel's preview tab, Ctrl+double-click
  keeps it, Ctrl+Alt+click opens a new panel, a URL opens a Browser tab, a plain click selects), the agent rows
  (Take over, Interrupt, Stop, Hand back, Stop <agent>, Allow once, Allow in this terminal, Deny, Type it), a person's
  keystroke take-over, the Session ended row (Restart, Close tab, Enter), the close-a-running-terminal row (Close
  terminal, Keep it open), the restored and image notices, and the Appearance popover (This terminal writes
  cmd.terminal.appearance.set; All terminals composes the Settings transaction pair over SSYS-051's rows; Import
  scheme...). The agent rows dispatch cmd.terminal.take_over (a person's keystroke is the same command with
  origin: keystroke, never a second id), cmd.terminal.hand_back, cmd.terminal.interrupt, cmd.terminal.stop_agent,
  cmd.terminal.allow_agent_input (grant once or this_terminal) and cmd.terminal.deny_agent_input; the More menu's
  Agent input rows dispatch cmd.terminal.revoke_agent_input, Clear dispatches cmd.terminal.clear, Send signal's
  Terminate and Kill dispatch cmd.terminal.send_signal, and Import scheme... dispatches
  cmd.terminal.appearance.import_scheme. Thirty-six terminal.* production entries carry the command-bearing controls; ui.terminal.* actions,
  the Ask each time row, the command-mark header, Keep it open and the notices have no entry. Terminal session
  commands emit no event and no workspace.layout_changed; a Split, a new terminal or a closed tab is the Home
  structural command it dispatches. The fourteen terminal ids that existed only in this document's runtime-recovery
  table, and cmd.terminal.split_pane, move_pane, close_pane, detach, reattach_section, move_workgroup and the
  restart_session spelling, have no row; cmd.terminal.focus_session is alias metadata of cmd.terminal.focus.
gui_related: true
gui_classification_reason: "Binds every control of the terminal tab, its menus, links, notices, agent rows and Appearance popover to exactly one command or typed local action."
split_recommended: false
depends_on: [DL-181, DL-183, UCC-201, UCC-202, CS-101, F3-640, F3-641, F3-642, F3-645, F3-646, SMPFS-180, SMPFS-182, CV-362, SSYS-051, UIW-042, WM-090]
unblocks: [ATS-076]
acceptance_criteria:
  - "Every control in the terminal tables maps to exactly one production entry, typed local action or no-dispatch disposition, and every terminal.* production entry appears in the tables."
  - "No production entry dispatches a retired terminal id, cmd.terminal.restart_session or cmd.terminal.focus_session."
  - "The Permission row offers Allow once, Allow in this terminal and Deny; Allow in this terminal dispatches cmd.terminal.allow_agent_input with grant this_terminal and the label Always allow here appears nowhere."
  - "A person's keystroke in an agent-driven terminal is recorded as cmd.terminal.take_over with origin keystroke, never as a second id."
  - "Ctrl+click on a file reference dispatches cmd.file.open with mode preview, Ctrl+double-click with mode keep, Ctrl+Alt+click with where panel, and a plain click dispatches nothing."
  - "No terminal session command entry declares an event."
validation_surfaces:
  - python3 scripts/pm-plans-verify.py validate-wiring-matrix
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
risk_class: home_panels_terminal_redesign_drift
reasoning_tier: high
context_scope: home_panels_terminal
implementation_surfaces:
  - Plans/Wiring_Matrix.md
  - Plans/Wiring_Matrix.production.json
node_compile_hint:
  mode: static_wiring_intent_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Plans/Decision_Log.md#DL-181"
  - "Plans/Decision_Log.md#DL-183"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/DECISIONS.md (SHA-256 0d2b45466c91734e15fd8659e9a8e3b17b70d92be785421e57e084dc8daf6b64)"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/canon-inputs/terminal-SPEC-ac63b1f467.md (SHA-256 4e3b5aabb4e41fed43d338a1b8c852b752b5860277f2058332575ba3953dbc8b; sections 1 to 3 and 8; concept lineage only)"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/plans-terminal-audit.md (SHA-256 12f95fa6f79b1c0a1f9f34b1eee004cac9edacfd8e0a7f4e6495fe1af23aabe3; E.3, the fourteen Wiring_Matrix-only terminal ids)"
preserved_exact_tokens:
  - "cmd.terminal.take_over"
  - "cmd.terminal.hand_back"
  - "cmd.terminal.interrupt"
  - "cmd.terminal.stop_agent"
  - "cmd.terminal.allow_agent_input"
  - "cmd.terminal.deny_agent_input"
  - "cmd.terminal.revoke_agent_input"
  - "cmd.terminal.clear"
  - "cmd.terminal.send_signal"
  - "cmd.terminal.appearance.set"
  - "cmd.terminal.appearance.import_scheme"
  - "Allow in this terminal"
  - "origin: keystroke"
negative_constraints:
  - "Do not wire a split inside a terminal, a section, a workgroup, a sub-tab or a terminal pop-out."
  - "Do not let an agent's input reach a terminal a person opened without Allow once or Allow in this terminal, or a secret prompt at all."
  - "Do not add AI controls to the terminal."
stale_retired_dispositions:
  - "Retired 2026-10-09 (DL-181): catalog.terminal_split_pane, catalog.terminal_move_pane, catalog.terminal_close_pane, catalog.terminal_detach, catalog.terminal_reattach_section and catalog.terminal_focus_session lose their production entries."
owner_hints:
  - Plans/Wiring_Matrix.md
  - Plans/Wiring_Matrix.production.json
```

ContractRef: ContractName:Plans/Decision_Log.md#DL-181, ContractName:Plans/UI_Command_Catalog.md#UCC-201, ContractName:Plans/FinalGUISpec.md#F3-640, ContractName:Plans/FinalGUISpec.md#F3-646, ContractName:Plans/Contracts_V0.md#CV-362, ContractName:Plans/UI_Wiring_Rules.md#UIW-042

### Event sets corrected

The home audit found commands whose production rows named different event sets (one row with an event, a sibling without). Each command now names the one event set it emits, in every row:

| Command | Rows before | Before | After (every row) |
|---|---|---|---|
| `cmd.panel.switch` | `catalog.panel_switch`, `home.chat.activity_toggle` | `[]` and `[workspace.layout_changed]` | `[]`: showing or hiding the chat is a receipt (UCC-138, UCC-203) |
| `cmd.panel.undock` | `catalog.panel_undock`, `home.chat.pop_out`, `home.dashboard.pop_out`, `home.editor_panel_1.pop_out` to `_4` | `[panel.undocked]` and `[workspace.layout_changed, panel.undocked]` | `[panel.undocked]`; the dashboard and editor panel pop-outs retire (UCC-203) |
| `cmd.file.open` | `catalog.file_open`, `home.file_manager.open_panel_1` to `_4` | `[]` and `[workspace.layout_changed]` | `[workspace.layout_changed]`, emitted only when a tab is added; a reveal emits nothing. The Panel 1 to 4 rows retire |
| `cmd.terminal.move_workgroup` | `home.terminal_section.move_workgroup`, `home.terminal_section.new_section` | `[workspace.layout_changed, terminal.workgroup_moved]` | no row: the command retires and `terminal.workgroup_moved` is withdrawn (UCC-201, CS-101) |
| `cmd.terminal.split_pane` | `catalog.terminal_split_pane`, `home.terminal_section.split_pane` | `[]` and `[workspace.layout_changed]` | no row: Split is `cmd.workspace_layout.split` with a terminal spec (`terminal.header.split`) |
| `cmd.dashboard.add_widget` | `catalog.dashboard_add_widget` | `[dashboard.widget_added]`, beside `catalog.widget_add` with `[]` | no row: an alias of `cmd.widget.add`, whose rows emit no event; `dashboard.widget_added` is withdrawn (UCC-202) |
| `cmd.browser.devtools.open` | `assistant.redesign.cmd.browser_devtools_open` beside `catalog.browser_open_devtools` | two ids and two handlers for one action | the Assistant toolbar row dispatches `cmd.browser.open_devtools`; both rows name `handlers::browser_runtime::devtools_open` (UCC-202) |
| Open routes that can add a tab: `cmd.file.open_with`, `cmd.git.diff_open`, `cmd.source_control.open_merge_editor`, `cmd.docker.compose.open_file`, `cmd.run_debug.config.open_file`, `cmd.search.open_result`, `cmd.nav.open_subject`, `cmd.collaboration.open`, `cmd.agents.open_thread`, `cmd.chat.open_thread_context_details`, `cmd.chat.close_thread_context_details`, `cmd.terminal.open`, `cmd.dev.show_output`, `cmd.dev.show_problems`, `cmd.dev.show_ports`, `cmd.run_debug.console.reveal`, `cmd.chat.plan.open_details`, `cmd.chat.attachment.open` | their one catalog or Assistant row each | `[]`, while `cmd.browser.open_workspace_preview` already declared `workspace.layout_changed` for the same kind of open | `[workspace.layout_changed]`, emitted only when the route adds (or, for the context close, removes) a tab; a reveal emits nothing (`Plans/Contracts_V0.md#CV-361`, UCC-200) |

`cmd.browser.open_workspace_preview` keeps its canonical event set exactly (`workspace.layout_changed`, `browser.session.created`, `browser.session.state_changed`), the set `scripts/pm-plans-verify.py` pins. The four alias tokens (`cmd.editor.close_tab`, `cmd.dashboard.add_widget`, `cmd.browser.devtools.open`, `cmd.terminal.focus_session`) and the retired command ids keep no production entry; the exact exclusions they need in `Plans/Wiring_Matrix.production.exclusions.json` are a companion edit of that file.

### WM-092 - One Event Set Per Command

```yaml
plan_unit_id: WM-092
unit_type: integration_contract
status: accepted
owner_doc: Plans/Wiring_Matrix.md
canonical_text: >-
  Every production entry of one command names that command's one event set. cmd.panel.switch is receipt only in every
  row, so home.chat.activity_toggle no longer declares workspace.layout_changed. cmd.panel.undock declares
  panel.undocked only, so home.chat.pop_out drops workspace.layout_changed, and the dashboard and editor panel
  pop-outs retire. cmd.file.open declares workspace.layout_changed in every row, emitted only when an open adds a tab,
  and so does every open route that can add a tab (file open-with, diffs, merge editor, compose and launch files,
  search results, subjects, collaboration runs, agent transcripts, the thread context tab and its close, Open in
  Terminal, Show Output, Show Problems, Show Ports, the Debug Console reveal, the chat's plan details and attachments);
  a reveal of an open tab emits nothing. cmd.browser.open_workspace_preview keeps its pinned set exactly.
  cmd.terminal.move_workgroup and cmd.terminal.split_pane lose their rows with their commands, and
  terminal.workgroup_moved is withdrawn. cmd.dashboard.add_widget is an alias of cmd.widget.add with no row, and
  dashboard.widget_added is withdrawn. The Assistant toolbar's DevTools row dispatches the canonical
  cmd.browser.open_devtools with its one handler. No new event family is added.
gui_related: true
gui_classification_reason: "Makes each visible control's declared effect the one event set its command emits."
split_recommended: false
depends_on: [DL-180, DL-181, UCC-200, UCC-201, UCC-202, UCC-203, CV-361, WM-090, WM-091]
unblocks: []
acceptance_criteria:
  - "For every command, all production entries that dispatch it declare the same expected_event_types and name one handler."
  - "home.chat.activity_toggle declares no event; home.chat.pop_out declares panel.undocked only."
  - "Every cmd.file.open entry, and every open-route entry listed in this unit, declares workspace.layout_changed and its effect contract says the event follows an added tab only."
  - "No entry declares terminal.workgroup_moved or dashboard.widget_added."
validation_surfaces:
  - python3 scripts/pm-plans-verify.py validate-wiring-matrix
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
risk_class: home_panels_terminal_redesign_drift
reasoning_tier: high
context_scope: home_panels_terminal
implementation_surfaces:
  - Plans/Wiring_Matrix.md
  - Plans/Wiring_Matrix.production.json
node_compile_hint:
  mode: static_wiring_intent_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Plans/Decision_Log.md#DL-180"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/plans-home-audit.md (SHA-256 f8e65fd64028014e3ee9bebf68594356d40eb5c831975645da6a3406cef2e3e8; section 6.2 items 2, 7 and 10)"
preserved_exact_tokens:
  - "workspace.layout_changed"
  - "panel.undocked"
  - "terminal.workgroup_moved"
  - "dashboard.widget_added"
negative_constraints:
  - "Do not let two rows of one command declare different event sets."
  - "Do not add an event family for panels, tabs or layouts."
stale_retired_dispositions:
  - "Corrected 2026-10-09 (DL-180): the per-row event mismatches the home audit listed (section 6.2, item 7)."
owner_hints:
  - Plans/Wiring_Matrix.md
  - Plans/Wiring_Matrix.production.json
```

ContractRef: ContractName:Plans/UI_Command_Catalog.md#UCC-200, ContractName:Plans/UI_Command_Catalog.md#UCC-202, ContractName:Plans/UI_Command_Catalog.md#UCC-203, ContractName:Plans/Contracts_V0.md#CV-361
