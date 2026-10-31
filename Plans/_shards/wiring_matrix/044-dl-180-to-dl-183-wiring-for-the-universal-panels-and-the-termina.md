# Shard 044: DL-180 to DL-183 — Wiring For The Universal Panels And The Terminal Tab (2026-10-09)

Source: `Plans/Wiring_Matrix.md`

Source lines: L5779-L6557

Source SHA256: `75ffbc19271aa1f882ab1a31d00597beeb35ac6271a0cfa8f2d2f86d5a835a46`

---

## DL-180 to DL-183 — Wiring For The Universal Panels And The Terminal Tab (2026-10-09)

Jared's home redesign (`Plans/Decision_Log.md#DL-180` to `#DL-183`) replaces Home's four fixed editor panels, its singleton dashboard, its movable chat and its docked terminal sections with one universal panel system, and rebuilds the terminal as one session per tab. He called the wiring for it "hyper critical". This addendum gives every control the redesign adds one wiring row: a production entry in `Plans/Wiring_Matrix.production.json` when the control dispatches a command, or a typed local action or "dispatches nothing" when it does not; it retires every row whose control is gone, and it makes each row name the one event set its command emits. Command ids, arguments, availability and disabled reasons are `Plans/UI_Command_Catalog.md#UCC-200` to `#UCC-203` and `Plans/Commands_System.md#CS-100` and `#CS-101`; this addendum does not restate them. The census rules are `Plans/UI_Wiring_Rules.md#UIW-040` to `#UIW-042`.

It adds WM-090 (Home panels), WM-091 (the terminal tab) and WM-092 (event sets corrected). It retires 51 `home.*` production entries (the `home.editor_panel_N.*`, `home.file_manager.open_panel_N`, `home.more_options.open_panel_N` and `open_browser_panel_N`, `home.drop_target.*`, `home.dashboard.*`, `home.chat.grab`, `home.terminal_section.*`, `home.more_options.collapse_bottom` and the fixed resizers) and 8 catalog entries whose commands retired or became aliases, and adds 103 `home.*` and 36 `terminal.*` entries (108 `home.*` entries in all with the five kept ones); the five kept `home.*` entries are rebuilt on the v2 model, and the open routes carry the placement fields of `Plans/Contracts_V0.md#CV-360`. The retired entries are listed in `Plans/PMConcept7_Home_Workspace_Control_Reconciliation.json` (`control_census.retired_rows_2026_10_09`), the file's own record of retired rows. It amends WM-021, WM-022, WM-041 and WM-045, the runtime-recovery terminal table and the PM7 settled interaction table with dated notes. It does not edit WM-065 to WM-075.

Amended 2026-10-10 (DL-186, DL-187, DL-188; lead rulings F1, F2, F5, F6, F7 and F8): Jared's answers of 2026-10-10 add 20 `home.*` production entries and change others in place, each change dated where it stands. Added: the "+" menu's SSH hosts row (`home.plus_menu.ssh_host`, `home.plus_menu.ssh_host_new_panel`) and New dashboard (`home.plus_menu.new_dashboard`, `home.plus_menu.new_dashboard_new_panel`); the empty-panel launcher's sub-row links (`home.launcher.terminal_shell`, `home.launcher.ssh_host`, `home.launcher.browser_recent`, `home.launcher.recent_file_link`, `home.launcher.dashboard_board`, `home.launcher.new_dashboard`); and the dashboard tab's command-bearing controls (`home.dashboard_tab.add_widget`, `.open_dashboard`, `.new_dashboard`, `.start_from`, `.preset_start_from`, `.tidy`, `.reset_widgets`, `.rename_dashboard`, `.delete_dashboard` and `.agent_card`). So `Plans/Wiring_Matrix.production.json` holds 128 `home.*` entries and 1256 in all. Amended 2026-10-10 (lead ruling on the Undo after Start from): `home.dashboard_tab.undo_start_from` (`cmd.widget.reset_layout` with `restore_revision`) is added too, so the file holds 129 `home.*` entries and 1257 in all (it read: 128 `home.*` entries and 1256 in all). Changed in place: the "+" menu's and the launcher's Dashboard row bodies open or reveal `dashboard:home` (wave 1's table said a new board, against UCC-200's L10 rule); the Terminal rows name installed shells; the Debug Console rows open or reveal the one `debug-console` tab; the rail's Chat entry works on every page; the six `catalog.widget_*` entries and `catalog.dashboard_catalog` name a dashboard board in `room` and the per-project key, and `catalog.widget_reset_layout` carries `set_id`; the Debug Console reveal lands in `debug-console`; the terminal's New terminal names installed shells and SSH hosts; and `assistant.redesign.cmd.chat_plan_open_version` declares `workspace.layout_changed` (WM-092, lead ruling F8). No entry is retired. The typed local actions the answers add (`ui.widget_board.set_view`, `ui.widget_preset.save`, `.rename` and `.delete`, `ui.terminal.mute_notifications`, `ui.chat_column.keep_open`) have no entry, like every typed local action.

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
| "+" > Terminal > an installed shell: the row's body (amended 2026-10-10, D39: every installed shell, uncapped; SSH hosts have their own row below) | `cmd.panel_tab.open` with `{ kind: terminal, profile }`, `where: tab` | `home.plus_menu.terminal_profile` | `workspace.layout_changed` when a tab is added; none on a reveal |
| "+" > Terminal > an installed shell: the trailing cell, Alt+click, Alt+Enter | `cmd.panel_tab.open` with `{ kind: terminal, profile }`, `where: panel` | `home.plus_menu.terminal_profile_new_panel` | `workspace.layout_changed` when a tab is added; none on a reveal |
| "+" > SSH hosts (only when the terminal kind knows SSH hosts) | opens its submenu | none | view-local, dispatches nothing |
| "+" > SSH hosts > a host: the row's body; the same host found by typing in the menu's filter field (added 2026-10-10, D39) | `cmd.panel_tab.open` with `{ kind: terminal }` and that host's `profile`, `where: tab` | `home.plus_menu.ssh_host` | `workspace.layout_changed` when a tab is added; none on a reveal |
| "+" > SSH hosts > a host: the trailing cell, Alt+click, Alt+Enter (added 2026-10-10, D39) | `cmd.panel_tab.open` with `{ kind: terminal }` and that host's `profile`, `where: panel` | `home.plus_menu.ssh_host_new_panel` | `workspace.layout_changed` when a tab is added; none on a reveal |
| "+" > Browser: the row's body | `cmd.panel_tab.open` with `{ kind: browser }` (a blank browser), `where: tab` | `home.plus_menu.browser` | `workspace.layout_changed` when a tab is added; none on a reveal |
| "+" > Browser: the trailing cell, Alt+click, Alt+Enter | `cmd.panel_tab.open` with `{ kind: browser }` (a blank browser), `where: panel` | `home.plus_menu.browser_new_panel` | `workspace.layout_changed` when a tab is added; none on a reveal |
| "+" > Browser > a recent address: the row's body | `cmd.browser.open_workspace_preview`, `where: tab` | `home.plus_menu.browser_recent` | the browser event set; `workspace.layout_changed` only when a tab is added |
| "+" > Browser > a recent address: the trailing cell, Alt+click, Alt+Enter | `cmd.browser.open_workspace_preview`, `where: panel` | `home.plus_menu.browser_recent_new_panel` | the browser event set; `workspace.layout_changed` only when a tab is added |
| "+" > File... > one of the three recent files: the row's body | `cmd.file.open` with `mode: keep`, `where: tab` | `home.plus_menu.recent_file` | `workspace.layout_changed` when a tab is added; none on a reveal |
| "+" > File... > one of the three recent files: the trailing cell, Alt+click, Alt+Enter | `cmd.file.open` with `mode: keep`, `where: panel` | `home.plus_menu.recent_file_new_panel` | `workspace.layout_changed` when a tab is added; none on a reveal |
| "+" > Dashboard: the row's body | `cmd.panel_tab.open` with `{ kind: dashboard, board_id: home }`, opening or revealing `dashboard:home`, `where: tab` (amended 2026-10-10, DL-186: it read with no `board_id` (a new board), against UCC-200's L10 rule; New dashboard is its own sub-row below) | `home.plus_menu.dashboard` | `workspace.layout_changed` when a tab is added; none on a reveal |
| "+" > Dashboard: the trailing cell, Alt+click, Alt+Enter | `cmd.panel_tab.open` with `{ kind: dashboard, board_id: home }`, `where: panel` (amended 2026-10-10, DL-186, as the row above) | `home.plus_menu.dashboard_new_panel` | `workspace.layout_changed` when a tab is added; none on a reveal |
| "+" > Dashboard > a board (Home, Metrics, Monitoring, Agents, or one of this project's custom dashboards by name; amended 2026-10-10, DL-186): the row's body | `cmd.panel_tab.open` with `{ kind: dashboard, board_id }`, `where: tab` | `home.plus_menu.dashboard_board` | `workspace.layout_changed` when a tab is added; none on a reveal |
| "+" > Dashboard > a board: the trailing cell, Alt+click, Alt+Enter | `cmd.panel_tab.open` with `{ kind: dashboard, board_id }`, `where: panel` | `home.plus_menu.dashboard_board_new_panel` | `workspace.layout_changed` when a tab is added; none on a reveal |
| "+" > Dashboard > New dashboard: the row's body (added 2026-10-10, DL-186, D35) | `cmd.panel_tab.open` with `{ kind: dashboard }` and no `board_id`: a new, empty custom dashboard `dashboard:dash-<n>`, `where: tab` | `home.plus_menu.new_dashboard` | `workspace.layout_changed` |
| "+" > Dashboard > New dashboard: the trailing cell, Alt+click, Alt+Enter (added 2026-10-10, DL-186, D35) | `cmd.panel_tab.open` with `{ kind: dashboard }` and no `board_id`, `where: panel` | `home.plus_menu.new_dashboard_new_panel` | `workspace.layout_changed` |
| "+" > Plan or document... > a choice in its picker: the row's body | `cmd.nav.open_subject`, `where: tab` | `home.plus_menu.plan_or_document` | `workspace.layout_changed` when a tab is added; none on a reveal |
| "+" > Plan or document... > a choice in its picker: the trailing cell, Alt+click, Alt+Enter | `cmd.nav.open_subject`, `where: panel` | `home.plus_menu.plan_or_document_new_panel` | `workspace.layout_changed` when a tab is added; none on a reveal |
| "+" > Artifact... > a choice in its picker: the row's body | `cmd.nav.open_subject` with the artifact subject, `where: tab` | `home.plus_menu.artifact` | `workspace.layout_changed` when a tab is added; none on a reveal |
| "+" > Artifact... > a choice in its picker: the trailing cell, Alt+click, Alt+Enter | `cmd.nav.open_subject` with the artifact subject, `where: panel` | `home.plus_menu.artifact_new_panel` | `workspace.layout_changed` when a tab is added; none on a reveal |
| "+" > Output, Problems, Ports, Debug Console > Output: the row's body | `cmd.panel_tab.open` with `{ kind: output }`, tab id `output`, `where: tab` | `home.plus_menu.output` | `workspace.layout_changed` when a tab is added; none on a reveal |
| Output channel picker > switch channel | `ui.output.select_channel` with `channel`, view state of `output` | none | typed local action, no receipt, no event |
| Output channel picker > Open in new tab | `cmd.panel_tab.open` with `output:<channel>` | same `cmd.panel_tab.open` wiring (UCC-200) | `workspace.layout_changed` when a tab is added; none on a reveal |
| "+" > Output, Problems, Ports, Debug Console > Output: the trailing cell, Alt+click, Alt+Enter | `cmd.panel_tab.open` with `{ kind: output }`, tab id `output`, `where: panel` | `home.plus_menu.output_new_panel` | `workspace.layout_changed` when a tab is added; none on a reveal |
| "+" > Output, Problems, Ports, Debug Console > Problems: the row's body | `cmd.panel_tab.open` with `{ kind: problems }`, `where: tab` | `home.plus_menu.problems` | `workspace.layout_changed` when a tab is added; none on a reveal |
| "+" > Output, Problems, Ports, Debug Console > Problems: the trailing cell, Alt+click, Alt+Enter | `cmd.panel_tab.open` with `{ kind: problems }`, `where: panel` | `home.plus_menu.problems_new_panel` | `workspace.layout_changed` when a tab is added; none on a reveal |
| "+" > Output, Problems, Ports, Debug Console > Ports: the row's body | `cmd.panel_tab.open` with `{ kind: ports }`, `where: tab` | `home.plus_menu.ports` | `workspace.layout_changed` when a tab is added; none on a reveal |
| "+" > Output, Problems, Ports, Debug Console > Ports: the trailing cell, Alt+click, Alt+Enter | `cmd.panel_tab.open` with `{ kind: ports }`, `where: panel` | `home.plus_menu.ports_new_panel` | `workspace.layout_changed` when a tab is added; none on a reveal |
| "+" > Output, Problems, Ports, Debug Console > Debug Console: the row's body | `cmd.panel_tab.open` with `{ kind: debug_console }`, opening or revealing the one tab `debug-console` (amended 2026-10-10, DL-187, D33), `where: tab` | `home.plus_menu.debug_console` | `workspace.layout_changed` when a tab is added; none on a reveal |
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
| Empty-panel launcher > Dashboard: the row's body | `cmd.panel_tab.open` with `{ kind: dashboard, board_id: home }`, opening or revealing `dashboard:home`, `where: tab` (amended 2026-10-10, DL-186: it read a new board) | `home.launcher.dashboard` | `workspace.layout_changed` when a tab is added; none on a reveal |
| Empty-panel launcher > Dashboard: the trailing cell, Alt+click, Alt+Enter | `cmd.panel_tab.open` with `{ kind: dashboard, board_id: home }`, `where: panel` (amended 2026-10-10, DL-186, as the row above) | `home.launcher.dashboard_new_panel` | `workspace.layout_changed` when a tab is added; none on a reveal |
| Empty-panel launcher > Plan or document... > a choice in its picker: the row's body | `cmd.nav.open_subject`, `where: tab` | `home.launcher.plan_or_document` | `workspace.layout_changed` when a tab is added; none on a reveal |
| Empty-panel launcher > Plan or document... > a choice in its picker: the trailing cell, Alt+click, Alt+Enter | `cmd.nav.open_subject`, `where: panel` | `home.launcher.plan_or_document_new_panel` | `workspace.layout_changed` when a tab is added; none on a reveal |
| Empty-panel launcher > Artifact... > a choice in its picker: the row's body | `cmd.nav.open_subject` with the artifact subject, `where: tab` | `home.launcher.artifact` | `workspace.layout_changed` when a tab is added; none on a reveal |
| Empty-panel launcher > Artifact... > a choice in its picker: the trailing cell, Alt+click, Alt+Enter | `cmd.nav.open_subject` with the artifact subject, `where: panel` | `home.launcher.artifact_new_panel` | `workspace.layout_changed` when a tab is added; none on a reveal |
| Empty-panel launcher > Output: the row's body | `cmd.panel_tab.open` with `{ kind: output }`, tab id `output`, `where: tab` | `home.launcher.output` | `workspace.layout_changed` when a tab is added; none on a reveal |
| Empty-panel launcher > Output: the trailing cell, Alt+click, Alt+Enter | `cmd.panel_tab.open` with `{ kind: output }`, tab id `output`, `where: panel` | `home.launcher.output_new_panel` | `workspace.layout_changed` when a tab is added; none on a reveal |
| Empty-panel launcher > Problems: the row's body | `cmd.panel_tab.open` with `{ kind: problems }`, `where: tab` | `home.launcher.problems` | `workspace.layout_changed` when a tab is added; none on a reveal |
| Empty-panel launcher > Problems: the trailing cell, Alt+click, Alt+Enter | `cmd.panel_tab.open` with `{ kind: problems }`, `where: panel` | `home.launcher.problems_new_panel` | `workspace.layout_changed` when a tab is added; none on a reveal |
| Empty-panel launcher > Ports: the row's body | `cmd.panel_tab.open` with `{ kind: ports }`, `where: tab` | `home.launcher.ports` | `workspace.layout_changed` when a tab is added; none on a reveal |
| Empty-panel launcher > Ports: the trailing cell, Alt+click, Alt+Enter | `cmd.panel_tab.open` with `{ kind: ports }`, `where: panel` | `home.launcher.ports_new_panel` | `workspace.layout_changed` when a tab is added; none on a reveal |
| Empty-panel launcher > Debug Console: the row's body | `cmd.panel_tab.open` with `{ kind: debug_console }`, opening or revealing the one tab `debug-console` (amended 2026-10-10, DL-187, D33), `where: tab` | `home.launcher.debug_console` | `workspace.layout_changed` when a tab is added; none on a reveal |
| Empty-panel launcher > Debug Console: the trailing cell, Alt+click, Alt+Enter | `cmd.panel_tab.open` with `{ kind: debug_console }`, `where: panel` | `home.launcher.debug_console_new_panel` | `workspace.layout_changed` when a tab is added; none on a reveal |
| Empty-panel launcher > Split right | `cmd.workspace_layout.split` with `direction: right` | `home.launcher.split_right` | `workspace.layout_changed` |
| Empty-panel launcher > Split down | `cmd.workspace_layout.split` with `direction: down` | `home.launcher.split_down` | `workspace.layout_changed` |
| Empty-panel launcher > Reopen closed tab | `cmd.panel_tab.reopen_closed` | `home.launcher.reopen_closed` | `workspace.layout_changed` |
| Empty-panel launcher > one of the five recent files | `cmd.file.open` with `mode: keep` | `home.launcher.recent_file` | `workspace.layout_changed` when a tab is added; none on a reveal |
| Empty-panel launcher > Terminal's sub-row link: an installed shell (added 2026-10-10, D39; the launcher shows each row's sub-row as links, hidden in a panel under 360 px) | `cmd.panel_tab.open` with `{ kind: terminal, profile }`, `where: tab` | `home.launcher.terminal_shell` | `workspace.layout_changed` when a tab is added; none on a reveal |
| Empty-panel launcher > SSH hosts (opens its submenu from the row) > a host (added 2026-10-10, D39) | `cmd.panel_tab.open` with `{ kind: terminal }` and that host's `profile`, `where: tab` | `home.launcher.ssh_host` | `workspace.layout_changed` when a tab is added; none on a reveal |
| Empty-panel launcher > Browser's sub-row link: a recent address (added 2026-10-10) | `cmd.browser.open_workspace_preview`, `where: tab` | `home.launcher.browser_recent` | the browser event set; `workspace.layout_changed` only when a tab is added |
| Empty-panel launcher > File...'s sub-row link: one of the three recent files (added 2026-10-10) | `cmd.file.open` with `mode: keep`, `where: tab` | `home.launcher.recent_file_link` | `workspace.layout_changed` when a tab is added; none on a reveal |
| Empty-panel launcher > Dashboard's sub-row link: a board (added 2026-10-10, DL-186) | `cmd.panel_tab.open` with `{ kind: dashboard, board_id }`, `where: tab` | `home.launcher.dashboard_board` | `workspace.layout_changed` when a tab is added; none on a reveal |
| Empty-panel launcher > Dashboard's sub-row link: New dashboard (added 2026-10-10, DL-186, D35) | `cmd.panel_tab.open` with `{ kind: dashboard }` and no `board_id`, `where: tab` | `home.launcher.new_dashboard` | `workspace.layout_changed` |
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
| Home options menu > Run Onboarding Again (formerly Run setup wizard; amended 2026-10-17, DL-228) | `ui.onboarding.start` (UCC-106, WM-041) | none | typed local action, no receipt, no event |

**The chat column** (`Plans/FinalGUISpec.md#F3-637`, `Plans/UI_Command_Catalog.md#UCC-203`)

| Control | Dispatch | Production entry | Effect |
|---|---|---|---|
| Activity bar > Chat, on every page (amended 2026-10-10, DL-187, D40: it shows or hides the column without changing the page in front; a press that moves 4 px or more is the rail's reorder and toggles nothing) | `cmd.panel.switch` with `chat` | `home.chat.activity_toggle` | receipt, no event |
| Home options menu > Show the chat / Hide the chat | `cmd.panel.switch` with `chat` | `home.more_options.chat_visibility` | receipt, no event |
| The chat column's inner edge: drag | `cmd.workspace_layout.resize_surface` with `{ surface: chat, width }`, one commit on release | `home.resizer.chat` | `workspace.layout_changed` |
| The chat header menu > Pop out (desktop app) | `cmd.panel.undock` with `chat` | `home.chat.pop_out` | `panel.undocked` |
| Home options menu > Pop out the chat (desktop app) | `cmd.panel.undock` with `chat` | `home.more_options.chat_pop_out` | `panel.undocked` |
| The popped-out chat window > Dock back (return) | `cmd.panel.redock` with `chat` | `home.chat.dock_back` | `panel.redocked` |
| Home options menu > Dock the chat back | `cmd.panel.redock` with `chat` | `home.more_options.chat_dock_back` | `panel.redocked` |
| Home options menu > Keep the chat open in narrow windows | `ui.chat_column.keep_open` (amended 2026-10-10, DL-187: the planning thread's ruling under D4 makes it the chat's own preference, not a Settings row; it read: the Settings transaction pair over its SSYS-050 row) | none | typed local action, no receipt, no event |
| The chat header's menu > Keep the chat open in narrow windows (added 2026-10-10, DL-187) | `ui.chat_column.keep_open` | none | typed local action, no receipt, no event |
| The History list's pin (5.6 Pro History flyout) | `ui.chat_column.pin_history` with `history_pinned` | none | typed local action (view state); the v2 chat column's `history_pinned` is saved as view state in the v2 record's chat column, with no `workspace.layout_changed` event, revision advance or receipt, like `ui.workspace_layout.maximize` |
| The chat's 32 px edge strip in a narrow window: opening the chat from it | nothing: a narrow-ladder state, never saved (F3-636) | none | none |

Amended 2026-10-10 (DL-187, D32): a popped-out chat lasts only while the app runs. Its pop-out is never saved, so after a restart the chat starts in its column and nothing dispatches `cmd.panel.redock` at start; a stored Chat Layout value (`general.visual.chat-layout-mode`, retired) never pops it out (`Plans/Settings_System.md#SSYS-050`).

**The narrow switcher** (`Plans/FinalGUISpec.md#F3-636`)

| Control | Dispatch | Production entry | Effect |
|---|---|---|---|
| The panel switcher ("2/3") in the one-column strip: choosing a panel, or its previous and next | `ui.workspace_layout.focus_panel` | none | typed local action, no receipt, no event |
| "New panel", trailing cells and splits while the centre is one column | the same rows as above; the item opens in the next panel of the switcher and the announcement says so; nothing new is created | none | as the row it came from |

**The dashboard tab** (`Plans/FinalGUISpec.md#F3-638`; `Plans/UI_Command_Catalog.md#UCC-200`'s Dashboard tab controls). Added 2026-10-10 (DL-186; D10 P1 to P13, D35; lead rulings F1, F2 and F7). Every dashboard tab is its own board on the Usage board engine; widget commands name the board in their existing `room` field and emit no `workspace.layout_changed` (a board's widgets are not the Home layout); opening the Add widget list, the Board menu, Start from, a submenu, a name prompt or a confirm dispatches nothing.

| Control | Dispatch | Production entry | Effect |
|---|---|---|---|
| Header row > Add widget; the empty board's Add widget | opens the "Find a widget" list | none | view-local, dispatches nothing |
| Add widget list > a widget | `cmd.widget.add` with the board in `room` and the `widget_id` | `home.dashboard_tab.add_widget` | receipt, no event |
| Header row > Board | opens the Board menu | none | view-local, dispatches nothing |
| Header row > Maximize / Restore | `ui.workspace_layout.maximize` | none | typed local action, no receipt, no event |
| Board > Dashboards > a dashboard | `cmd.panel_tab.open` with `{ kind: dashboard, board_id }` | `home.dashboard_tab.open_dashboard` | `workspace.layout_changed` when a tab is added; none on a reveal |
| Board > Dashboards > New dashboard | `cmd.panel_tab.open` with `{ kind: dashboard }` and no `board_id`: a new, empty custom dashboard | `home.dashboard_tab.new_dashboard` | `workspace.layout_changed` |
| Board > This dashboard > Range > a range; Scope > a scope | `ui.widget_board.set_view` (lead ruling F1) | none | typed local action, no receipt, no event |
| Board > This dashboard > Start from > a set; the empty board's Start from... > a set | `cmd.widget.reset_layout` with `{ scope: room, room: <board_id>, set_id }` | `home.dashboard_tab.start_from` | receipt, no event |
| Board > This dashboard > Save as preset...; Start from > Your presets > Save this dashboard as a preset..., then Save | `ui.widget_preset.save` (lead ruling F2) | none | typed local action, no receipt, no event |
| Start from > Your presets > Rename or delete presets > a preset > Start from this preset | `cmd.widget.reset_layout` with `set_id: user:<preset_id>` | `home.dashboard_tab.preset_start_from` | receipt, no event |
| ... > Rename preset..., then Rename | `ui.widget_preset.rename` | none | typed local action, no receipt, no event |
| ... > Delete preset..., then Delete preset; Keep it | `ui.widget_preset.delete`; Keep it dispatches nothing | none | typed local action, no receipt, no event |
| Board > This dashboard > Tidy | one `cmd.widget.move` carrying `arrange { mode: tidy, detail: diagnostics }` (`Plans/Widget_System.md#WS-019`) | `home.dashboard_tab.tidy` | receipt, no event |
| Board > This dashboard > Reset widgets | `cmd.widget.reset_layout` with `{ scope: room, room: <board_id> }` and no `set_id` | `home.dashboard_tab.reset_widgets` | receipt, no event |
| Board > Live > Live readings | the Usage page's one Live / Paused choice (`Plans/usage-feature.md#UF-107`) | none | view_only, as the PM7 table's Live / Paused row |
| Board > Rename dashboard... (custom dashboards only), then Rename | `cmd.panel_tab.rename` on that dashboard's tab with the name | `home.dashboard_tab.rename_dashboard` | `workspace.layout_changed` |
| Board > Delete dashboard... (custom dashboards only), then Delete dashboard; Keep it | `cmd.panel_tab.close` on that tab, after which its board, quarantine and name are forgotten (`Plans/Widget_System.md#WS-030`); Keep it dispatches nothing | `home.dashboard_tab.delete_dashboard` | `workspace.layout_changed` |
| The Undo notice after Start from > Undo; Escape | Undo: one `cmd.widget.reset_layout` with `{ scope: room, room: <board_id>, restore_revision }`, the board's committed layout revision just before that Start from, only while the notice is up (8 s, held on pointer or focus), never with `set_id`, refused with a disabled reason when that revision is no longer the board's previous one; Escape dismisses the notice (amended 2026-10-10, lead ruling; it read: Undo: no id yet, open for the lead's ruling (the concept writes the board's earlier record back with no command); Escape dismisses the notice) | `home.dashboard_tab.undo_start_from` (added 2026-10-10, lead ruling; it read: none) | receipt, no event; Escape dispatches nothing (amended 2026-10-10, lead ruling; it read: not certified until ruled; Escape dispatches nothing) |
| A widget card's gestures, size picker, card menu and gear | the Usage board's own `cmd.widget.*` rows, naming the board in `room` | the `catalog.widget_*` entries | receipt, no event |
| A widget card > Details | the Usage page opens at that widget's room with its inspector (P8) | none | view state: a page change and the Usage page's own inspector, no command |
| Agents > Show > a filter | that tab's own view state (lead ruling F7) | none | view-local, dispatches nothing |
| Agents > an agent's card; Alt+click | `cmd.agents.open_thread` as a kept transcript tab; Alt+click with `where: panel` | `home.dashboard_tab.agent_card` | `workspace.layout_changed` when a tab is added; none on a reveal |

A custom dashboard leaving the reopen list is forgotten by storage housekeeping that dispatches nothing (WS-030). In a panel whose usual kind is the dashboard, Ctrl+T (`home.keys.new_tab`) and a split make a new custom dashboard.

**Tool tabs** (`Plans/FinalGUISpec.md#F3-635`, `#F3-490`). Added 2026-10-10 (DL-187, D33; lead ruling F6).

| Control | Dispatch | Production entry | Effect |
|---|---|---|---|
| The Debug Console's session sub-tabs in its header row: a click; Left, Right, Home, End, Enter or Space | nothing: the session shown is view state of the one `debug-console` tab | none | view-local, dispatches nothing |

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
  Every Home control of the universal panel system (DL-180) has exactly one wiring row: a production
  entry in Plans/Wiring_Matrix.production.json when it dispatches a command, otherwise a typed local
  action or a view-local disposition with no entry, as this addendum's tables list them. The tab
  strip, the tab menu, the "+" menu with each row's body (where tab) and its trailing cell,
  Alt+click or Alt+Enter (where panel), Quick Open, the empty-panel launcher, the "+N" list and the
  every-tab list, the panel grip and Move panel, dividers with their keys, the panel menu, the named
  layouts and Restore home layout, the title bar's Home options menu, the chat column (show and
  hide, width, Pop out, Dock back, keep open in narrow windows), the narrow switcher and the
  keyboard map with its web-client mapping are covered. Tabs commit through cmd.panel_tab.open,
  cmd.panel_tab.close, cmd.panel_tab.move and the rest of the cmd.panel_tab.* family, and panels
  through cmd.workspace_layout.split, cmd.workspace_layout.move_surface,
  cmd.workspace_layout.resize_surface, cmd.workspace_layout.set_collapsed,
  cmd.workspace_layout.reset and the rest of the cmd.workspace_layout.* family (UCC-200). Commits
  run the gesture transaction of UIW-012: previews, menus, lists and hovering dispatch nothing, a
  changed release dispatches one command, a cancelled or unchanged gesture restores the earlier
  picture with no dispatch, and a failed commit rolls back. Every committed structural change emits
  the one existing event workspace.layout_changed with its v2 payload (CV-361) and writes
  pm.home_workspace_layout.v2 once (SP-330); an open that only reveals a tab emits nothing;
  cmd.panel.switch is receipt only; cmd.panel.undock and cmd.panel.redock emit panel.undocked and
  panel.redocked for the chat only. ui.panel_tab.activate, ui.workspace_layout.maximize and
  ui.workspace_layout.focus_panel are typed local actions with no entry. Fifty-one home.* entries of
  the fixed-zone model retire and are recorded in the reconciliation file; five are rebuilt on the
  v2 model. ui.chat_column.pin_history is a typed local action (view state); its value is the v2
  record's chat column history_pinned, saved as view state in the v2 record's chat column, with no
  workspace.layout_changed event, revision advance or receipt, like ui.workspace_layout.maximize. It
  has no production entry, like the other typed local actions. Output opens or reveals `output`. The
  channel picker switches its channel with `ui.output.select_channel`, a typed local action with no
  production entry, receipt or event. "Open in new tab" uses `cmd.panel_tab.open` with
  `output:<channel>`; it emits workspace.layout_changed only when it adds a tab (UCC-200, F3-635).
  Amended 2026-10-10 (DL-186, DL-187; lead rulings F1, F2, F6 and F7): the census grows by the
  answers of 2026-10-10, with 21 new home.* entries (129 in all; amended 2026-10-10, lead ruling,
  for the Undo after Start from; it read: with 20 new home.* entries (128 in all)). The "+" menu's
  SSH hosts row and New dashboard, and the empty-panel launcher's sub-row links, each have an entry;
  the "+" menu's and the launcher's Dashboard row bodies open or reveal dashboard:home; the Terminal
  rows list installed shells; the Debug Console rows open or reveal the one debug-console tab, whose
  session sub-tab dispatches nothing. A dashboard tab's command-bearing controls have
  home.dashboard_tab.* entries: Add widget (cmd.widget.add), a dashboard and New dashboard in its
  Board menu (cmd.panel_tab.open), Start from and Start from this preset (cmd.widget.reset_layout
  with set_id), Tidy (cmd.widget.move with arrange), Reset widgets (cmd.widget.reset_layout), Rename
  dashboard... (cmd.panel_tab.rename), Delete dashboard... (cmd.panel_tab.close, after its confirm),
  the Undo after Start from (cmd.widget.reset_layout with restore_revision; added 2026-10-10, lead
  ruling) and an Agents card (cmd.agents.open_thread); the widget commands name the board in their
  existing room field and emit no workspace.layout_changed. Range and Scope
  (ui.widget_board.set_view) and the preset save, rename and delete (ui.widget_preset.*) are typed
  local actions with no entry; Live readings is the Usage page's view_only Live / Paused; the Undo
  in the notice that follows Start from is home.dashboard_tab.undo_start_from, one
  cmd.widget.reset_layout with { scope: room, room: <board_id>, restore_revision } while the notice
  is up, never with set_id, refused without dispatch and disabled with a reason when any other board
  change was committed since, excluding the preset hold's settling resizes, with a receipt and no
  event (amended 2026-10-10, lead ruling; it read: the Undo after Start from has no entry until the
  lead rules). The rail's Chat entry dispatches cmd.panel.switch on every page; Keep the chat open
  in narrow windows, in the Home options menu and the chat header's menu, is the typed local action
  ui.chat_column.keep_open with no entry; the chat's pop-out is never saved. The same dashboard Undo
  notice and existing Undo route serve Start from and a Reset widgets that changed anything: one
  cmd.widget.reset_layout { scope: 'room', room: <board_id>, restore_revision }, one receipt and no
  workspace.layout_changed, never set_id with restore_revision. The revision and its envelope are
  captured before that operation and written back and read by the board owner after acceptance. Any
  other committed board change disables Undo without dispatch, except the preset hold's settling
  resizes; eligibility is rechecked while the notice is up on commit, pointer or focus entering and
  click (WS-030, F3-638). The census includes F3-632's Back and equivalent level-navigation keys in
  + pickers, launcher pickers, Move panel, Layouts, Move to panel, Show all tabs and kind submenus.
  They resolve to ui.panel_tab.picker_back, a typed local navigation action with no production
  entry, Settings write, receipt or event; final row selection alone uses its existing command.
  F3-647 owns drawing, F3-635 keys, and the exact controls are listed in pm7_control_bindings.json.
gui_related: true
gui_classification_reason: "Binds every visible control of the universal panels, the chat column and the Home keys to exactly one command or typed local action."
split_recommended: false
depends_on: [DL-180, DL-186, DL-187, UCC-200, UCC-202, UCC-203, CS-100, CS-101, F3-630, F3-631, F3-632, F3-633, F3-634, F3-635, F3-636, F3-637, F3-638, F3-502, CV-360, CV-361, SP-330, UIW-012, UIW-040, UIW-041, WM-045]
unblocks: [ATS-075]
acceptance_criteria:
  - "Every control in the Home tables maps to exactly one production entry, typed local action or view-local disposition, and every home.* production entry appears in the tables."
  - "No production entry exists for ui.panel_tab.activate, ui.workspace_layout.maximize, ui.workspace_layout.focus_panel, a menu or list opening, a hover or a drag preview."
  - "Every entry of a cmd.panel_tab.* or cmd.workspace_layout.* command declares exactly workspace.layout_changed; every cmd.panel_tab.open and open-route entry declares workspace.layout_changed for an added tab and nothing for a reveal."
  - "No production entry names editor_panel_1 to editor_panel_4, a dock host, the floating host, a terminal section, a workgroup, Collapse Bottom Terminal or a chat grab."
  - "In the web client the four browser-owned chords are answered as Alt+T, Alt+W, Alt+Shift+T and Alt+`, and the key entries say so."
  - "All rows sharing a command name one handler."
  - "Output opens or reveals output; its picker switch is ui.output.select_channel without a production entry, and Open in new tab dispatches cmd.panel_tab.open with output:<channel>."
  - "Every dashboard tab control in the dashboard tab table maps to its one entry, typed local action or view-local disposition, the Undo after Start from to home.dashboard_tab.undo_start_from (cmd.widget.reset_layout with restore_revision and no set_id; amended 2026-10-10, lead ruling; it read: except the Undo after Start from, which waits for the lead's ruling); the home.dashboard_tab.* entries of a cmd.widget.* command declare no event and those of a cmd.panel_tab.* or cmd.agents.open_thread command declare workspace.layout_changed."
  - "The \"+\" menu's and the launcher's Dashboard row bodies open or reveal dashboard:home, New dashboard makes a custom dashboard, and every launcher sub-row link dispatches what its menu sub-row dispatches, as a new tab in this panel."
  - "The rail's Chat entry dispatches cmd.panel.switch on every page; Keep the chat open in narrow windows and the Debug Console's session sub-tab have no production entry and no Settings transaction."
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
  - Plans/PMConcept7_Home_Workspace_Control_Reconciliation.json (superseded fixed-model Home reconciliation; control_census.retired_rows_2026_10_09 retains the retired rows)
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/canon-inputs/followup/DECISIONS-ADDENDUM-2.md, SHA-256 1eecc96b03a1a774f52d06420c913553d5f5d1917e1bd5705e2f6e0bbc11fad6 (D31)"
  - "Plans/Decision_Log.md#DL-180"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/DECISIONS.md (SHA-256 0d2b45466c91734e15fd8659e9a8e3b17b70d92be785421e57e084dc8daf6b64)"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/canon-inputs/panels-CONTRACT-v1-778c8494e6.md (SHA-256 aa16fc080f44f6824b0ef32a2b568bfcae81277b6962caaba1b441015d68dae9; sections 6 to 9 and 13; concept lineage only)"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/canon-inputs/panels-NUMBERS-407e6fb6fe.md (SHA-256 019721f5215d95c80b999d5b61e1ee4bf79b29afc5b229a12bccde6f738c5162; the \"+\" menu, Commands and keys; concept lineage only)"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/plans-home-audit.md (SHA-256 f8e65fd64028014e3ee9bebf68594356d40eb5c831975645da6a3406cef2e3e8; section 6.2 items 2, 7 and 10)"
  - "Plans/Decision_Log.md#DL-186"
  - "Plans/Decision_Log.md#DL-187"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/canon-inputs/followup/DECISIONS-ADDENDUM-3.md, SHA-256 ecd18c2f2d8ac8f714f9578170d321584fb871e3d19601a68061898ffd6759a9 (D32, D33, D35, D39, D40)"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/canon-inputs/followup/panels-NUMBERS-339203bd76.md, SHA-256 2e2c2a95819842cd5cbcc108ed302460ddea3ed0a98be7dfe4f1b78507660ce6 (the \"+\" menu's shells and SSH hosts, the launcher links, the Debug Console sub-tabs, the rail's Chat entry; concept lineage only)"
  - "The panels thread's build facts, pm-mail 1010221905-e13e and 1010223444-a10e (2026-10-10): set_id, presets, rename and delete through the tab commands"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/canon-inputs/small-round/panels-CONTRACT-2926ad987e.md, SHA-256 c579d0dfef41fd1fc7327d14c2adb9e2b101c24b216ff64a9db5fc19895ad989 (small-round concept lineage only)"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/canon-inputs/small-round/panels-NUMBERS-51c316e18b.md, SHA-256 a9c42b88e5cb50706ff1716a254cb68e026a538bb7a0c840905779a9a482cff2 (small-round concept lineage only)"
preserved_exact_tokens:
  - "home.dashboard_tab.start_from"
  - "home.dashboard_tab.undo_start_from"
  - "restore_revision"
  - "home.plus_menu.new_dashboard"
  - "home.plus_menu.ssh_host"
  - "ui.chat_column.keep_open"
  - "Open in new tab"
  - "output:<channel>"
  - "output"
  - "ui.output.select_channel"
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
  - "Amended 2026-10-10 (D31, DL-180): Output uses one tab with its channel as view state; only an explicit channel split-off uses output:<channel>."
  - "Amended 2026-10-10 (lead ruling L9): The History pin is wired as ui.chat_column.pin_history with no production entry."
  - "Amended 2026-10-10 (lead ruling L9, corrected to view state with no event): The History pin is saved as view state with no workspace.layout_changed event; it is no longer committed with chat_column_changed (CV-361 binds chat_column_changed to a width drag only)."
  - "Retired 2026-10-09 (DL-180): 51 home.* entries of the fixed-zone model; the list is control_census.retired_rows_2026_10_09 in Plans/PMConcept7_Home_Workspace_Control_Reconciliation.json."
  - "Amended 2026-10-10 (DL-186; D35; lead rulings F1, F2 and F7): 14 home.* entries added for the dashboard tab's controls, New dashboard and the launcher's dashboard links; the Dashboard row bodies open or reveal dashboard:home; range, scope and presets are typed local actions without entries."
  - "Amended 2026-10-10 (DL-187; D32, D33, D39, D40): 6 home.* entries added for SSH hosts and the launcher's sub-row links (shells, a host, a recent address, a recent file); installed shells in the Terminal rows; one debug-console tab whose sub-tab dispatches nothing; the rail's Chat entry on every page; Keep the chat open in narrow windows is ui.chat_column.keep_open, no longer a Settings transaction; the pop-out is never saved."
  - "Amended 2026-10-10 (lead ruling on the Undo after Start from): 1 home.* entry added, home.dashboard_tab.undo_start_from for cmd.widget.reset_layout with restore_revision (129 home.* entries); the Undo is no longer an open item."
  - "Amended 2026-10-11 (wave 2, panels NUMBERS 51c316e18b): The existing dashboard Undo restores the captured revision after Start from or a changed Reset with the same command and guard."
owner_hints:
  - Plans/Wiring_Matrix.md
  - Plans/Wiring_Matrix.production.json
```

ContractRef: ContractName:Plans/Decision_Log.md#DL-180, ContractName:Plans/Decision_Log.md#DL-186, ContractName:Plans/Decision_Log.md#DL-187, ContractName:Plans/UI_Command_Catalog.md#UCC-200, ContractName:Plans/UI_Command_Catalog.md#UCC-203, ContractName:Plans/FinalGUISpec.md#F3-630, ContractName:Plans/FinalGUISpec.md#F3-638, ContractName:Plans/Contracts_V0.md#CV-361, ContractName:Plans/UI_Wiring_Rules.md#UIW-040

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
| New terminal > an installed shell, or SSH hosts > a host (amended 2026-10-10, DL-187, D39: every installed shell, then after a hairline an SSH hosts submenu) | `cmd.panel_tab.open` with `{ kind: terminal, profile }`, `where: tab` | `terminal.more.new_terminal` | `workspace.layout_changed` when a tab is added; none on a reveal |
| Split down | `cmd.workspace_layout.split` with the terminal spec, `direction: down` | `terminal.more.split_down` | `workspace.layout_changed` |
| Appearance... | opens the Customize screen (F3-650) | none | view-local, dispatches nothing |
| Text size > Bigger, Smaller, Reset (Ctrl+=, Ctrl+-, Ctrl+0) | `ui.terminal.zoom` | none | typed local action, no receipt, no event |
| Copy mode (Ctrl+Shift+X) | `ui.terminal.copy_mode` | none | typed local action, no receipt, no event |
| Quick select (Ctrl+Shift+E) | `ui.terminal.quick_select` | none | typed local action, no receipt, no event |
| Select all (Cmd+A on macOS) | `ui.terminal.select_all` | none | typed local action, no receipt, no event |
| Clear (Ctrl+Shift+K, Cmd+K) | `cmd.terminal.clear` | `terminal.more.clear` | receipt, no event |
| Clear scrollback | `cmd.terminal.clear_scrollback` | `terminal.more.clear_scrollback` | receipt, no event |
| Plain-text buffer (Alt+F2) | `ui.terminal.a11y_buffer` | none | typed local action, no receipt, no event |
| Agent input > Ask each time | nothing: a state row | none | none |
| Agent input > an agent allowed in this terminal | `cmd.terminal.revoke_agent_input` | `terminal.more.revoke_agent_input` | receipt, no event |
| Mute notifications (a check, between Agent input and Send signal; absent where the platform has no system notifications; added 2026-10-10, DL-187, D38) | `ui.terminal.mute_notifications` (lead ruling F5) | none | typed local action, no receipt, no event; that tab's own state, saved with the tab |
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
| The tab's menu > Mute notifications, the terminal kind's row after a hairline (added 2026-10-10, DL-187, D38) | `ui.terminal.mute_notifications` | none | typed local action, no receipt, no event |
| A system notification a program raised (OSC 9, OSC 777 `notify`, OSC 99) while Puppet Master is in the background: a click (added 2026-10-10, DL-187, D38) | brings the app and that terminal forward: `ui.panel_tab.activate` with `focus: true` | none | typed local action, no receipt, no event |
| The notification permission notice (where the platform asks, once, after a notification arrived) > Allow; Mute this terminal; Not now (added 2026-10-10, DL-187, D38) | Allow asks the platform's own permission; Mute this terminal is `ui.terminal.mute_notifications`; Not now dispatches nothing | none | no command, receipt or event |
| An image a limit, a quota or a transfer rule refuses | nothing: the image is not drawn and the program receives SMPFS-181's fixed reply; no notice control exists | none | none |

**Customize screen (F3-650)** (`Plans/FinalGUISpec.md#F3-642`, `#F3-643`)

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
  Every control inside a terminal tab (DL-181) has exactly one wiring row as this addendum's terminal
  tables list them: the header row (Find, Split, Maximize or Restore, More), every More menu leaf, the
  screen's context menu, the command-mark menu, find, copy mode, quick select, links (Ctrl+click opens the
  panel's preview tab, Ctrl+double-click keeps it, Ctrl+Alt+click opens a new panel, a URL opens a Browser
  tab, a plain click selects), the agent rows (Take over, Interrupt, Stop, Hand back, Stop <agent>, Allow
  once, Allow in this terminal, Deny, Type it), a person's keystroke take-over, the Session ended row
  (Restart, Close tab, Enter), the close-a-running-terminal row (Close terminal, Keep it open), the
  restored and image notices, and the Customize screen (F3-650) (This terminal writes
  cmd.terminal.appearance.set; All terminals composes the Settings transaction pair over SSYS-051's rows;
  Import scheme...). The agent rows dispatch cmd.terminal.take_over (a person's keystroke is the same
  command with origin: keystroke, never a second id), cmd.terminal.hand_back, cmd.terminal.interrupt,
  cmd.terminal.stop_agent, cmd.terminal.allow_agent_input (grant once or this_terminal) and
  cmd.terminal.deny_agent_input; the More menu's Agent input rows dispatch
  cmd.terminal.revoke_agent_input, Clear dispatches cmd.terminal.clear, Send signal's Terminate and Kill
  dispatch cmd.terminal.send_signal, and Import scheme... dispatches
  cmd.terminal.appearance.import_scheme. Thirty-six terminal.* production entries carry the
  command-bearing controls; ui.terminal.* actions, the Ask each time row, the command-mark header, Keep it
  open and the notices have no entry. Terminal session commands emit no event and no
  workspace.layout_changed; a Split, a new terminal or a closed tab is the Home structural command it
  dispatches. The fourteen terminal ids that existed only in this document's runtime-recovery table, and
  cmd.terminal.split_pane, move_pane, close_pane, detach, reattach_section, move_workgroup and the
  restart_session spelling, have no row; cmd.terminal.focus_session is alias metadata of
  cmd.terminal.focus. Amended 2026-10-10 (DL-187; D34, D38, D39; lead ruling F5): Mute notifications, in
  the More menu and at the end of the tab's menu, and the permission notice's Mute this terminal are the
  typed local action ui.terminal.mute_notifications with no entry; the notice's Allow asks the platform
  and Not now dispatches nothing; a click on a system notification brings the terminal forward with
  ui.panel_tab.activate; New terminal's entry covers every installed shell and the SSH hosts submenu. No
  control sets a terminal tab's colour or icon (D34), and no terminal.* entry is added.
gui_related: true
gui_classification_reason: >-
  Binds every control of the terminal tab, its menus, links, notices, agent rows and Customize screen
  (F3-650) to exactly one command or typed local action.
split_recommended: false
depends_on: [DL-181, DL-183, DL-187, UCC-201, UCC-202, CS-101, F3-640, F3-641, F3-642, F3-645, F3-646, SMPFS-180, SMPFS-182, CV-362, SSYS-051, UIW-042, WM-090]
unblocks: [ATS-076]
acceptance_criteria:
  - "Every control in the terminal tables maps to exactly one production entry, typed local action or no-dispatch disposition, and every terminal.* production entry appears in the tables."
  - "No production entry dispatches a retired terminal id, cmd.terminal.restart_session or cmd.terminal.focus_session."
  - "The Permission row offers Allow once, Allow in this terminal and Deny; Allow in this terminal dispatches cmd.terminal.allow_agent_input with grant this_terminal and the label Always allow here appears nowhere."
  - "A person's keystroke in an agent-driven terminal is recorded as cmd.terminal.take_over with origin keystroke, never as a second id."
  - "Ctrl+click on a file reference dispatches cmd.file.open with mode preview, Ctrl+double-click with mode keep, Ctrl+Alt+click with where panel, and a plain click dispatches nothing."
  - "No terminal session command entry declares an event."
  - "Mute notifications in the More menu and the tab menu, the permission notice's three answers and a notification's click have no production entry, and Mute notifications is absent where the platform has no system notifications."
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
  - "Plans/Decision_Log.md#DL-187"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/canon-inputs/followup/terminal-SPEC-01c5e78c42.md, SHA-256 a0723f6663990723fc8bd879610c8dedcf2ef6b19a467a2d5c1e1c6d183aabfc (sections 1 and 2: notifications, the More menu; concept lineage only)"
preserved_exact_tokens:
  - "ui.terminal.mute_notifications"
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
  - "Amended 2026-10-10 (DL-187; D34, D38, D39; lead ruling F5): Mute notifications, the notification click and the permission notice are wired as typed local actions or no dispatch with no entry; New terminal lists installed shells and an SSH hosts submenu."
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
| `cmd.chat.plan.open_version` (added 2026-10-10, lead ruling F8) | `assistant.redesign.cmd.chat_plan_open_version` | `[]` (CS-088, WM-065, before DL-188 admitted the event) | `[workspace.layout_changed]`, emitted only when the route adds a tab; a reveal of the Plan's tab already open emits nothing; the entry declares the effect, placement and layout-event test exactly as `cmd.chat.plan.open_details`'s does |

Amended 2026-10-10 (lead ruling F8; DL-188): `cmd.chat.plan.open_version` (DL-157) is an open route of the one opening module like `cmd.chat.plan.open_details`, so its entry declares `workspace.layout_changed` with the same effect contract, placement fields and layout-event test. This amends the empty event set that `Plans/Commands_System.md#CS-088` and `#WM-065` gave the route while `workspace.layout_changed` 2.0.0 was not yet admitted; Jared admitted it on 2026-10-10 (D42, `Plans/Decision_Log.md#DL-188`), and CS-088 and WM-065 themselves are not edited here.

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
  Amended 2026-10-10 (lead ruling F8; DL-188): cmd.chat.plan.open_version joins the open routes: its entry declares
  workspace.layout_changed, emitted only when it adds a tab, with the effect contract, placement fields and
  layout-event test of cmd.chat.plan.open_details. This amends the empty event set CS-088 and WM-065 recorded for it
  before Jared admitted workspace.layout_changed 2.0.0 (D42).
  cmd.terminal.move_workgroup and cmd.terminal.split_pane lose their rows with their commands, and
  terminal.workgroup_moved is withdrawn. cmd.dashboard.add_widget is an alias of cmd.widget.add with no row, and
  dashboard.widget_added is withdrawn. The Assistant toolbar's DevTools row dispatches the canonical
  cmd.browser.open_devtools with its one handler. No new event family is added.
gui_related: true
gui_classification_reason: "Makes each visible control's declared effect the one event set its command emits."
split_recommended: false
depends_on: [DL-180, DL-181, DL-188, UCC-200, UCC-201, UCC-202, UCC-203, CV-361, WM-090, WM-091]
unblocks: []
acceptance_criteria:
  - "For every command, all production entries that dispatch it declare the same expected_event_types and name one handler."
  - "home.chat.activity_toggle declares no event; home.chat.pop_out declares panel.undocked only."
  - "Every cmd.file.open entry, and every open-route entry listed in this unit, declares workspace.layout_changed and its effect contract says the event follows an added tab only."
  - "No entry declares terminal.workgroup_moved or dashboard.widget_added."
  - "assistant.redesign.cmd.chat_plan_open_version declares workspace.layout_changed with a layout-event test, its effect contract saying the event follows an added tab only."
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
  - "Plans/Decision_Log.md#DL-188"
  - "Plans/Decision_Log.md#DL-157 (the exact-version open route; cited, not a dependency)"
  - "Plans/Commands_System.md#CS-088 and Plans/Wiring_Matrix.md#WM-065 (the route's earlier empty event set, amended here; cited, not dependencies)"
preserved_exact_tokens:
  - "cmd.chat.plan.open_version"
  - "workspace.layout_changed"
  - "panel.undocked"
  - "terminal.workgroup_moved"
  - "dashboard.widget_added"
negative_constraints:
  - "Do not let two rows of one command declare different event sets."
  - "Do not add an event family for panels, tabs or layouts."
stale_retired_dispositions:
  - "Corrected 2026-10-09 (DL-180): the per-row event mismatches the home audit listed (section 6.2, item 7)."
  - "Amended 2026-10-10 (lead ruling F8; DL-188): cmd.chat.plan.open_version's entry declares workspace.layout_changed like cmd.chat.plan.open_details; this amends CS-088's and WM-065's empty event set for the route, which predates the admission of workspace.layout_changed 2.0.0 (D42)."
owner_hints:
  - Plans/Wiring_Matrix.md
  - Plans/Wiring_Matrix.production.json
```

ContractRef: ContractName:Plans/UI_Command_Catalog.md#UCC-200, ContractName:Plans/UI_Command_Catalog.md#UCC-202, ContractName:Plans/UI_Command_Catalog.md#UCC-203, ContractName:Plans/Contracts_V0.md#CV-361

### WM-093 - Appearance Controls And Settings Bindings

```yaml
plan_unit_id: WM-093
unit_type: requirement
status: accepted
owner_doc: Plans/Wiring_Matrix.md
canonical_text: >-
  Plans/pm7_control_bindings.json is this unit's enumerated companion table; UIW-043 owns its completeness
  rule. This editor fields/reset/quick sets bind to production editor.appearance.field and
  cmd.editor.appearance.set. This terminal binds to terminal.appearance.field; import to
  terminal.appearance.import_scheme. All scopes, every corresponding Settings row and
  general.visual.wallpaper bind to catalog.settings_transaction_preview then
  catalog.settings_transaction_apply, over the exact ids named in each census row. Menu/Settings entry,
  scope, search, sample trial, token-kind selection and noncommitted previews are CS-102 local actions with
  no production dispatch row. The notification inbox's dismiss/Delete binds catalog.alert_dismiss; Clear
  all composes it per captured eligible item, while toast close/swipe remains local and domain actions
  reuse catalog.alert_acknowledge, catalog.alert_snooze and their existing owner commands. DnD commits
  reuse UCC-200's panel_tab.move/workspace_layout split or move_surface according to target; cancel/hover
  commit nothing. Divider/chat/rail/history resize controls keep their existing layout command/view-state
  ownership, with keyboard alternatives; F3-657 adds presentation only. A rendered control disabled for no
  Project, stale state, locked target or owner permission dispatches nothing and announces the projected
  reason. All new evidence is planned production evidence, never inferred from a concept callback or
  screenshot. Plans/appearance_quick_sets.json supplies the exact composite payloads consumed by the
  binding rows; each scope names precisely those affected ids. The extended background/bezel/mask controls
  have exact per-field bindings to those same writers. Saved-preset Apply uses their exact whole-scope
  replacement adapter; Save/Rename/Delete/Undo are CS-102 local library actions, excluded from production
  command rows but enumerated in the census. F3-632 picker Back is also enumerated as local navigation,
  with its keyboard equivalents and no layout mutation. The NieR background control consumes SSYS-054’s
  admitted two-setting patch through the existing Settings preview/apply pair, not a second wallpaper
  command. The existing rail Chat producer remains home.chat.activity_toggle; its selected state reflects
  visibility and the removed Dashboard button has no replacement producer. The retired cmd.theme.preview
  producer is removed from production wiring and its sole obsolete Touch Closure obligation/profile; its
  rejected packet token is retained and explicitly excluded as lineage under UCC-204; this does not exclude
  either Settings transaction command. PM7 B1/B2/B6, S5, D5/G4: extend the shell control census with the
  project box/row-key paths, Settings/wand/titlebar Pip editor and two status work items; decorative
  Pip/loader draw no controls. WM-097 lists the exact new bindings and owner routes.
gui_related: true
gui_classification_reason: Appearance controls and Settings bindings.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- Each census command route resolves a production entry with typed payload, owner state, accessibility and
  effect assertions.
- This/All, Clear all races, drop/cancel and no-Project paths have explicit planned fixtures.
validation_surfaces:
- python3 scripts/pm-shard-plans.py --check
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-plans-verify.py run-gates
risk_class: owner_drift
reasoning_tier: high
context_scope: appearance_controls_and_settings_bindings
implementation_surfaces:
- Plans/Wiring_Matrix.md
node_compile_hint:
  mode: doc_standardized_planunit
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- /mnt/Cursor/share/puppet-master/2026-10-14-editor-customizer/PROPOSAL-canon.md, SHA-256 8b8f3179c3970cb165e4fb4722eb02381f0456faad235c4330207d2bec5f5431
  (approved campaign source lineage; not native implementation evidence)
- /mnt/Cursor/share/puppet-master/2026-10-13-terminal-customizer/PROPOSAL-canon-followups.md, SHA-256 1e0739b70d9b0f8c55f8df4747d80ff099baae6d40caf6ae784dc13864d580b0
  (approved campaign source lineage; not native implementation evidence)
- /mnt/Cursor/share/puppet-master/2026-10-13-notifications/NOTES.md, SHA-256 f09d2b8856652950762b6580b8ebab43022bdf053272738f52720de25922a895
  (approved campaign source lineage; not native implementation evidence)
- /mnt/Cursor/share/puppet-master/2026-10-13-panel-dnd-resize/NOTES.md, SHA-256 03a80f0dea3235ea637149bbec63626c4a4be8521078f9dd601f2b691f03d2d6
  (approved campaign source lineage; not native implementation evidence)
- Plans/UI_Wiring_Rules.md#UIW-043
- Plans/UI_Command_Catalog.md#UCC-204
- Plans/Commands_System.md#CS-102
- /mnt/Cursor/share/puppet-master/2026-10-16-plans-pass2/sources/2026-10-14-terminal-round3--LANDING.md, SHA-256
  4d6556ff98168f22719c5d401c4e677d5d380d2ef370b67a838cb3aa45301c2d (source lineage; not native certification)
- /mnt/Cursor/share/puppet-master/2026-10-16-plans-pass2/sources/2026-10-15-panels-picker-back--NOTES.md, SHA-256
  29bac44f166cb8e0e67f4f00634cb15d0a3be576eb2f68e7e19606f3a4a1a71c (source lineage; not native certification)
preserved_exact_tokens: []
negative_constraints: []
owner_hints:
- Plans/Wiring_Matrix.md
```

ContractRef: ContractName:Plans/UI_Wiring_Rules.md#UIW-043, ContractName:Plans/UI_Command_Catalog.md#UCC-204, ContractName:Plans/Commands_System.md#CS-102
