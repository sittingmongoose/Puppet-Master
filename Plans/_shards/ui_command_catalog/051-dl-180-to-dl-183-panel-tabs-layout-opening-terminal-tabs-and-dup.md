# Shard 051: DL-180 to DL-183 — Panel Tabs, Layout, Opening, Terminal Tabs And Duplicate Ids (2026-10-09)

Source: `Plans/UI_Command_Catalog.md`

Source lines: L14969-L16028

Source SHA256: `a73d1353dd61dcd51375eabb573495c0a9437bf2f3dffb86e0b8b7240046102a`

---

## DL-180 to DL-183 — Panel Tabs, Layout, Opening, Terminal Tabs And Duplicate Ids (2026-10-09)

Jared's home redesign (`Plans/Decision_Log.md#DL-180` to `Plans/Decision_Log.md#DL-183`) replaces Home's four fixed editor panels, its singleton dashboard, its movable chat and its docked terminal sections with one universal panel system, and rebuilds the terminal as one session per tab. Jared called the commands for this "hyper critical", so this addendum gives every control the redesign adds exactly one command row or one typed local action, and leaves no action with two ids. It adds UCC-200 (panel tabs, layout, the "+" menu, the "+N" list, panel and tab menus, the open routes and the dashboard tab), UCC-201 (terminal commands re-scoped to one session per tab), UCC-202 (four duplicate pairs settled) and UCC-203 (the chat column's commands and the retired chat docking rows). It supersedes UCC-144 whole: its four editor panels, Panel 1 through Panel 4 routing, singleton Dashboard, chat grab and in-canvas float, terminal workgroup move and Collapse Bottom Terminal all retire, while its leaf semantics (a menu opens view-locally and each leaf dispatches exactly one command, with revision, idempotency, a typed `no_change` and disabled reasons) carry forward into UCC-200. It amends UCC-013, UCC-019, UCC-025, UCC-036, UCC-060, UCC-061, UCC-063, UCC-066, UCC-067, UCC-068, UCC-108, UCC-115, UCC-135, UCC-138, UCC-147, UCC-156 and UCC-158 in place, and the core terminal and browser tables of section 2.6A and the 2026-07-17 terminal rule-4.2 rows with dated notes. It does not edit UCC-176 to UCC-188. Central registration, the reserved prefixes and the view-state ruling are `Plans/Commands_System.md#CS-100`; the alias and retired-id register is `Plans/Commands_System.md#CS-101`.

Every row below that commits a structural change (an open that adds a tab, close, move, keep, pin, unpin, rename, split, move a panel, resize, collapse, close a panel, lock, apply, save or restore a layout) emits the one existing event `workspace.layout_changed`, with the v2 payload that names the change (`Plans/Contracts_V0.md#CV-361`); an open that only reveals an existing tab emits nothing, and no new event family is added. Typed local actions (`ui.panel_tab.*`, `ui.workspace_layout.*`, `ui.terminal.*`) are view state: no catalog command, no receipt, no event (`Plans/Commands_System.md#CS-100`). Opening a menu, the "+" menu, the "+N" list or a picker, hovering, and dragging dispatch nothing; a changed release commits once; a cancelled or unchanged release dispatches nothing; a failed commit rolls back and emits nothing.

Amended 2026-10-10 (DL-186, DL-187, DL-188): Jared's answers of 2026-10-10 change these tables in place, each change dated where it stands. Dashboards (`Plans/Decision_Log.md#DL-186`; D10 P1 to P13 and D35): every dashboard tab is its own board on the Usage board engine; the "+" menu's Dashboard sub-row lists Home, Metrics, Monitoring, Agents, this project's custom dashboards and New dashboard; a dashboard tab's Add widget, Board menu, Start from, presets, rename and delete map as "Dashboard tab controls" below says. Widget commands name the board in their existing `room` field (`Plans/Widget_System.md#WS-030`), never in a `board_id` field; `cmd.widget.reset_layout` gains the optional field `set_id` naming the set a board starts from; a board's range and scope (`ui.widget_board.set_view`, lead ruling F1) and saving, renaming and deleting a preset (`ui.widget_preset.save`, `ui.widget_preset.rename`, `ui.widget_preset.delete`, lead ruling F2) are typed local actions; renaming and deleting a custom dashboard reuse `cmd.panel_tab.rename` and `cmd.panel_tab.close`, so no command family is added. The chat, the Debug Console and the terminal (`Plans/Decision_Log.md#DL-187`; D32 to D40): the left rail's Chat entry shows or hides the column with `cmd.panel.switch` on every page (D40); a popped-out chat is never saved and starts in its column after a restart (D32); Keep the chat open in narrow windows is the chat's own preference, the typed local action `ui.chat_column.keep_open`, and no longer a Settings write (the planning thread's ruling under D4); the Debug Console is one tab, `debug-console`, whose session sub-tab is view state that dispatches nothing (D33, lead ruling F6); the "+" menu lists every installed shell and SSH hosts in their own submenu (D39); a terminal's Mute notifications is the typed local action `ui.terminal.mute_notifications` (D38, lead ruling F5); terminal tabs have no colour or icon control (D34). Open routes (lead ruling F8): `cmd.chat.plan.open_details` and `cmd.chat.plan.open_version` (DL-157) join the open-routes table, and the event every route that adds a tab emits, `workspace.layout_changed`, is admitted at family revision 2.0.0 with its v2 payload (`Plans/Decision_Log.md#DL-188`).

Metadata used in the tables. Every `cmd.panel_tab.*` and `cmd.workspace_layout.*` row also carries `project_id`, `workspace_tab_id`, `expected_layout_revision` and `idempotency_key`, as UCC-144's rows did. A panel tab is named by `panel_tab_id` (opaque and stable, its prefix naming its kind, `Plans/FinalGUISpec.md#F3-635`), never by route `tab_id`, which stays page-tab focus (UCC-013), and never by `workspace_tab_id`, which stays the project tab. A home panel is named by `panel_id`, which is not the rail's `cmd.panel.switch` vocabulary (CS-061). Availability classes are the Cozy Shelves legend (`always`, `selection`, `live_subject`, `record_only`, `capability`); disabled reasons come only from the closed set (`unsupported`, `not_configured`, `unauthorized`, `unreachable`, `degraded`, `partial_capability`, `blocked_state_required`, `stale_projection`, `permission_required`), with the owner's detail in the typed response: `narrow_centre` (the centre is in its one-column narrow state, `Plans/FinalGUISpec.md#F3-636`), `no_room` (the fit rule offers no split, `Plans/FinalGUISpec.md#F3-630`), `only_panel`, `only_tab`, `no_closed_tab`. The visible wording of each reason is FinalGUISpec's. Keys are listed native first, then the web client's stand-in where the browser owns the native chord (`Plans/FinalGUISpec.md#F3-630`, DL-180).

### Panel tab commands

| command_id | Label | Arguments | Availability and disabled reasons | command_kind | Event | Keys |
|---|---|---|---|---|---|---|
| `cmd.panel_tab.open` | Open tab | An open spec: `kind`, `panel_tab_id?`, the kind's own fields (a buffer's `text` and `title`; a terminal's `profile` and `cwd`; a browser's `url`; a dashboard's `board_id`), and the placement fields `where`, `mode`, `by`, `background` whose contract is `Plans/Contracts_V0.md#CV-360` | `always`; `unsupported` for an unknown kind. In the narrow centre a new panel is not created: the tab opens in the next panel of the switcher and the announcement says so (`Plans/FinalGUISpec.md#F3-636`). A dashboard spec without `board_id` makes a new, empty custom dashboard (`dashboard:dash-<n>`, "Dashboard <n>"; amended 2026-10-10, DL-186, D35) | `shell_view` | `workspace.layout_changed` when a tab is added; nothing when an existing tab is only revealed | Ctrl+T new tab of the panel's usual kind (web client Alt+T); Ctrl+Shift+\` new terminal; Ctrl+Shift+B new browser |
| `cmd.panel_tab.close` | Close tab | `panel_tab_ids` (one or more, all from one panel). Close others and Close to the right resolve the set when dispatched and leave pinned tabs out | `selection`. Each kind's close check answers first (a dirty buffer, a running terminal: confirmation class `two_step`, inline, `Plans/FinalGUISpec.md#F3-635`); a tab whose check declines stays open and the rest close in the same commit. Closing a panel's last tab follows `Plans/FinalGUISpec.md#F3-630`'s panel lifecycle | `shell_view` | `workspace.layout_changed` | Ctrl+W (web client Alt+W); Delete on a focused tab; middle click |
| `cmd.panel_tab.rename` | Rename tab | `panel_tab_id`, `label` (an empty label restores the kind's own label) | `selection` | `shell_view` | `workspace.layout_changed` | none (tab menu Rename...) |
| `cmd.panel_tab.move` | Move tab | `panel_tab_id`, then either `panel_id` and `index` (reorder, move to another panel, drop on "+N") or `split: { panel_id, edge }` (drop on a panel edge, Move to new panel, Split right or down with this tab) | `selection`; `blocked_state_required` with `narrow_centre` or `no_room` for a split, `only_tab` for Move to new panel on a panel's only tab. Moving a preview tab also keeps it, in the same commit | `shell_view` | `workspace.layout_changed` | Ctrl+Shift+PgUp / Ctrl+Shift+PgDn move left or right; Alt+Shift+arrows move to the panel in that direction (a split that way when there is none and it fits) |
| `cmd.panel_tab.keep` | Keep open | `panel_tab_id` | `selection`; a tab that is already kept returns `no_change` | `shell_view` | `workspace.layout_changed` | none (double click on a preview tab; tab menu Keep open; the first edit in a preview tab) |
| `cmd.panel_tab.pin` | Pin | `panel_tab_id` | `selection` | `shell_view` | `workspace.layout_changed` | none (tab menu only) |
| `cmd.panel_tab.unpin` | Unpin | `panel_tab_id` | `selection` | `shell_view` | `workspace.layout_changed` | none (tab menu only) |
| `cmd.panel_tab.reopen_closed` | Reopen closed tab | none: the top of the bounded closed-tab stack (`Plans/storage-plan.md#SP-330`) | `blocked_state_required` with `no_closed_tab`. A reopened terminal opens a new session in the same folder and profile (`Plans/Section15_MVP_Promoted_Features_Spec.md#SMPFS-180`) | `shell_view` | `workspace.layout_changed` | Ctrl+Shift+T (web client Alt+Shift+T) |

### Layout commands

| command_id | Label | Arguments | Availability and disabled reasons | command_kind | Event | Keys |
|---|---|---|---|---|---|---|
| `cmd.workspace_layout.split` | Split right / Split down | `panel_id`, `direction` (`right`, `down`, or `auto` for the fit rule), `spec?` (the new panel's first tab; absent means a new tab of the panel's usual kind; a terminal's Split passes `{ kind: terminal, profile, cwd }`) | `always`; `blocked_state_required` with `narrow_centre` or `no_room` | `shell_view` | `workspace.layout_changed` | Ctrl+\\ split right; Ctrl+Shift+\\ split down |
| `cmd.workspace_layout.move_surface` | Move panel | `panel_id`, `target: { panel_id, edge }` with `edge` one of `left`, `right`, `top`, `bottom` or `center` (`center` moves the panel's tabs into the target panel as tabs), or `target: { centre_edge }` for the centre's outer edge | `blocked_state_required` with `only_panel` | `shell_view` | `workspace.layout_changed` | Enter on a panel grip opens Move panel |
| `cmd.workspace_layout.resize_surface` | Resize | `split_id` and `sizes` (proportions), or `{ surface: chat, width }` for the chat column (UCC-203) | `always` | `shell_view` | `workspace.layout_changed` | Tab to a divider, then arrows 8 px, Shift+arrows 48 px, Home or End to a neighbour's minimum, Enter evens; each changed key press is one commit, like one release |
| `cmd.workspace_layout.set_collapsed` | Collapse to tabs / Expand | `panel_id`, `collapsed` | `blocked_state_required` with `only_panel`. A panel dragged below half its minimum commits `collapsed: true` on release | `shell_view` | `workspace.layout_changed` | none |
| `cmd.workspace_layout.close_panel` | Close panel | `panel_id` | `always`. Its tabs close with it, each kind's close check answering first; the only panel in the centre keeps its place and shows the empty-panel launcher (`Plans/FinalGUISpec.md#F3-630`) | `shell_view` | `workspace.layout_changed` | none |
| `cmd.workspace_layout.lock` | Lock panel / Unlock panel | `panel_id`, `locked` | `always` | `shell_view` | `workspace.layout_changed` | none |
| `cmd.workspace_layout.apply_named` | Apply a layout | `name` (Home, Build, Terminals 2x2, Focus, or a name the user saved) | `always`; the layout already applied returns `no_change`. Applying keeps every open tab, ends no terminal and drops no unsaved buffer (`Plans/FinalGUISpec.md#F3-630`) | `shell_view` | `workspace.layout_changed` | none |
| `cmd.workspace_layout.save_named` | Save this layout... | `name` | `always`. Amended 2026-10-10 (DL-186, P6; lead ruling F3): the saved layout also keeps the boards of the dashboard tabs it holds, at most 64 KB of them per named layout; a larger save keeps the layout without its boards and says so; `cmd.workspace_layout.apply_named` puts back the boards a layout kept (`Plans/Widget_System.md#WS-030`, `Plans/storage-plan.md#SP-330`). No argument is added | `shell_view` | `workspace.layout_changed` | none |
| `cmd.workspace_layout.reset` | Restore home layout | none | `always`; open tabs stay open | `shell_view` | `workspace.layout_changed` | none |

`cmd.workspace_layout.reset` keeps its two producers, the title-bar Home menu row and the Settings Startup & Recovery row `general.startup.reset-home-layout`, both dispatching the same command. The concept token `cmd.workspace_layout.size_surface` still normalizes to `cmd.workspace_layout.resize_surface` (CS-068) and is not a row.

### View actions (typed local actions: no receipt, no event)

| Action id | Arguments | Effect | Producers and keys |
|---|---|---|---|
| `ui.panel_tab.activate` | `panel_tab_id`, `focus?` | Makes the tab its panel's active tab, pulls it out of "+N" when it was hidden there, and updates the recent-tab order; written with the layout's view state, never a receipt or event | A click on a tab; a row chosen in the "+N" list, the every-tab list or the recent-tab list; Ctrl+Tab / Ctrl+Shift+Tab (web client Alt+\` / Alt+Shift+\`); Ctrl+PgDn / Ctrl+PgUp; Alt+1..8 and Alt+9 for the last tab; the arrow keys, Home, End, Enter and Space in a focused strip |
| `ui.workspace_layout.maximize` | `panel_id`, or none to restore | Sets or clears the maximized flag outside the split tree (`Plans/FinalGUISpec.md#F3-630`) | Shift+Escape; Escape while focus is in a strip restores; double click on a strip's empty space; panel menu Maximize or Restore panels; a terminal header row's Maximize or Restore |
| `ui.workspace_layout.focus_panel` | `panel_id`, or `direction` | Moves focus to a panel | Alt+arrows; Alt+Shift+1..9; a panel chosen in the narrow panel switcher |
| `ui.output.select_channel` | `channel` | Switches the channel shown in `output`; channel is view state, never part of its tab id, with no receipt or event | Output channel picker; channel opened from elsewhere follows F3-634 |
| `ui.widget_board.set_view` | the board (`room`, its board id) and the changed `range` or `scope`, with the Usage page's own values (`Plans/FinalGUISpec.md#F3-638`) | Sets one dashboard's own range or scope, independent of the Usage page's and of every other board; view state kept in that board's record, with no receipt and no event (DL-186, P2; lead ruling F1) | A dashboard tab's Board menu > This dashboard > Range or Scope |
| `ui.widget_preset.save` | the board (`room`) and `name?` (trimmed, spaces collapsed, at most 80 characters; "Preset <n>" when none) | Saves the board's widgets as one of the person's own presets, kept across projects (`Plans/Widget_System.md#WS-030`); no receipt, no event (lead ruling F2) | Board menu > Save as preset...; Start from > Your presets > Save this dashboard as a preset... |
| `ui.widget_preset.rename` | `preset_id`, `name` | Renames one of the person's presets; no receipt, no event (lead ruling F2) | Start from > Your presets > Rename or delete presets > a preset > Rename preset... |
| `ui.widget_preset.delete` | `preset_id` | Deletes one of the person's presets after its confirm; a dashboard that started from it keeps its widgets; no receipt, no event (lead ruling F2) | Start from > Your presets > Rename or delete presets > a preset > Delete preset... > Delete preset |

Amended 2026-10-10 (DL-186): the last four rows are the dashboard tab's typed local actions. Using a preset is not one of them: it is `cmd.widget.reset_layout` with `set_id: user:<preset_id>` (the dashboard tab section below). The Debug Console's session sub-tab is view state that dispatches nothing, not a typed local action (DL-187, D33; lead ruling F6).

### Aliases and the open routes that keep their ids

| Token | Disposition | Canonical target | normalization.kind | normalizes_to_contract | alias_of_command_id | Reason |
|---|---|---|---|---|---|---|
| `cmd.editor.close_tab` | alias | `cmd.panel_tab.close` | `alias` | UCC-200 | `cmd.panel_tab.close` | It already closed non-file tabs (the run view, UCC-170); one close serves every kind. |
| `cmd.file.open` | kept id, open route | itself | `wrapper` | `OpenFile` route with CV-360's placement fields, resolved by the one opening module | null | The file domain's open; FileManager (`Plans/FileManager.md#F-090`) and the chat (`Plans/assistant-chat-design.md#ACD-500`) dispatch it. |
| `cmd.nav.open_subject` | kept id, open route | itself | `wrapper` | `route_target` plus `OpenSubject` with CV-360's placement fields | null | Plans, documents and artifacts open as their tab kinds through it. |
| `cmd.browser.open_workspace_preview` | kept id, open route | itself | `wrapper` | browser session `target` with CV-360's placement fields | null | Any open of an address in a browser tab. |
| `cmd.terminal.open` | kept id, open route | itself | `wrapper` | exact `terminal_session_id` with CV-360's placement fields | null | Open in Terminal reveals the session's tab (UCC-201). |
| `cmd.editor.open_panel` | retired | `cmd.workspace_layout.split`, or any open with `where: panel` | `none` | none | null | There are no fixed editor panels and no empty editor panel is opened on its own. |
| `cmd.editor.close_panel` | retired | `cmd.workspace_layout.close_panel` | `none` | none | null | The old row hid a panel and kept its tabs; the new close closes them, so it is not an alias. |
| `cmd.artifacts.open_panel` | retired (it was never registered, UCC-120) | `cmd.nav.open_subject` with an artifact subject | `none` | none | null | The artifact viewer is a tab kind (`Plans/Runtime_Artifacts_Panel.md#RAP-065`); a second opener would be a second id. |

The rule that decides which id an open uses: where a domain id exists for the thing opened, the caller dispatches that id (`cmd.file.open` for a file, `cmd.nav.open_subject` for a plan, document or artifact subject, `cmd.browser.open_workspace_preview` for an address, `cmd.terminal.open` for an existing terminal session, and the rows in the next table); `cmd.panel_tab.open` is dispatched directly only for opens with no domain id: a new terminal, a blank browser, a dashboard tab, an editor buffer, and the tool tabs Output, Problems, Ports and Debug Console. Every one of them resolves through the one opening module (`Plans/FinalGUISpec.md#F3-634`, kept single by `Plans/DRY_Rules.md#DR-071`), so there is one handler and one rule set: one id is one tab, an id already open anywhere is revealed where it is and never moved, a person's single click on a file opens the panel's preview tab, `by: user` takes focus, and an agent's open lands as a background tab that never takes focus.

### Every route that opens or reveals a tab

| Command | Tab kind it lands in | What changes |
|---|---|---|
| `cmd.panel_tab.open` | any kind | the module's own command |
| `cmd.file.open` | `editor` | `target_editor_panel_id`, `target_editor_group_id` and `target_group` retire: they never select a home panel; placement is CV-360's fields |
| `cmd.file.open_with` | the viewer the enum names | its five-value enum (`source_editor`, `image_viewer`, `workspace_preview`, `detached_preview`, `diff_review`) is unchanged and carries no placement value; placement is CV-360's fields |
| `cmd.git.diff_open`, `cmd.source_control.open_merge_editor`, `cmd.docker.compose.open_file`, `cmd.run_debug.config.open_file` | `editor` (diff mode for diffs) | placement through CV-360's fields only, never private arguments |
| `cmd.search.open_result` | the result's kind | its `disposition?` resolves to CV-360's placement fields |
| `cmd.nav.open_subject` | `plan`, `document`, `artifact` | placement fields added |
| `cmd.chat.plan.open_details`, `cmd.chat.plan.open_version` | `plan` | placement fields added (amended 2026-10-10, lead ruling F8). `cmd.chat.plan.open_version` opens the exact version its surface names: the Plan's own tab, revealed rather than duplicated, while that version is current, otherwise that version's retained read-only document, never Plan Details and never a newer version (`Plans/Decision_Log.md#DL-157`, `Plans/UI_Command_Catalog.md#UCC-176`) |
| `cmd.chat.attachment.open` | the attachment's `document` or `artifact` tab | opens the attachment's document or artifact tab through the one opening module; an open that adds a tab emits `workspace.layout_changed` (`Plans/Contracts_V0.md#CV-361`), a reveal of a tab already open emits nothing (added 2026-10-10, lead ruling: the table now matches CV-361 and its production wiring row, which declares the event) |
| `cmd.collaboration.open` | `run` | the run view is a `run` tab |
| `cmd.agents.open_thread`, when it opens a read-only live transcript | `transcript` | unchanged identity (UCC-188); the transcript is a tab |
| `cmd.chat.open_thread_context_details`, `cmd.chat.focus_thread_context_details`, `cmd.chat.close_thread_context_details` | `context` | open adds or reveals the thread's context tab, focus reveals it, close closes it (UCC-060) |
| `cmd.chat.open_working_notebook` | `document` | stays a candidate with UCC-158's disposition; placement fields when admitted |
| `cmd.browser.open_workspace_preview`, `cmd.browser.focus_browser_tab` | `browser` | the editor-panel targets retire; focus reveals the tab that hosts the session. `cmd.browser.focus_browser_tab` is layout-only and declares no event; when the tab it focuses sits in a collapsed panel, the host expands that panel through `cmd.workspace_layout.set_collapsed`, which records the `panel_expanded` under its own id (amended 2026-10-10, lead ruling) |
| `cmd.terminal.open`, `cmd.terminal.show`, `cmd.terminal.focus`, `cmd.terminal.reveal` | `terminal` | UCC-201 |
| `cmd.terminal.open_retained_output` | `editor` (a buffer) | stays a DL-035 candidate (UCC-160); UCC-201 says how the command mark's Open output relates to it |
| `cmd.dev.show_output`, `cmd.dev.show_problems`, `cmd.dev.show_ports` | `output`, `problems`, `ports` | reveal or open the tool tab by its kind affinity |
| `cmd.run_debug.console.reveal`, `cmd.run_debug.terminal.reveal` | `debug_console`, `terminal` | `Plans/Commands_System.md#CS-101` amends their placement wording; the Debug Console reveal opens or reveals the one `debug-console` tab with that session's sub-tab shown (amended 2026-10-10, DL-187, D33) |

### The "+" menu and the empty-panel launcher

The "+" opens the menu and never creates a tab by itself; opening the menu, typing in its filter field and opening a submenu dispatch nothing. A row's body opens its item as a new tab in this panel (`where: tab`); the row's trailing cell, Alt+click or Alt+Enter opens it as a new panel by the fit rule (`where: panel`). The empty-panel launcher shows the same rows and dispatches the same ids.

Amended 2026-10-10 (DL-186, DL-187; D35, D39): the Terminal row lists every installed shell, uncapped, and the SSH hosts move to their own row with a submenu; the Dashboard sub-row lists the custom dashboards and New dashboard; the empty-panel launcher shows each row's sub-row as links under it, each link dispatching exactly what that sub-row dispatches in the menu as a new tab in this panel (`where: tab`), and the SSH hosts row opens its submenu from the launcher row (`Plans/FinalGUISpec.md#F3-632`).

| Row | Body (`where: tab`) and trailing cell (`where: panel`) | Sub-rows |
|---|---|---|
| Filter field "Open anything: kinds, files, URLs" | typing is view-local; a kind it finds behaves as that kind's row | a file found: `cmd.file.open` with `mode: keep`; an address: `cmd.browser.open_workspace_preview` |
| Terminal | `cmd.panel_tab.open` with `{ kind: terminal }` and the default profile | each installed shell: the same with its `profile` (amended 2026-10-10, D39: every installed shell, uncapped; SSH hosts moved to the next row) |
| SSH hosts (only when the terminal kind knows SSH hosts; added 2026-10-10, D39) | opens its submenu (view-local) | each host: `cmd.panel_tab.open` with `{ kind: terminal }` and that host's `profile`, its body here and its trailing cell in a new panel; a host found by typing in the menu's filter field is the same row |
| Browser | `cmd.panel_tab.open` with `{ kind: browser }`, a blank browser | each recent address: `cmd.browser.open_workspace_preview` |
| File... | opens Quick Open (view-local); Enter there dispatches `cmd.file.open` with `mode: keep` | each of the three recent files: `cmd.file.open` with `mode: keep` |
| Dashboard | `cmd.panel_tab.open` opens or reveals `dashboard:home` | Home, Metrics, Monitoring, Agents and each of this project's custom dashboards: `cmd.panel_tab.open` with its `board_id`, opening or revealing it; New dashboard: `cmd.panel_tab.open` with `{ kind: dashboard }` and no `board_id`, which makes a new, empty custom dashboard (amended 2026-10-10, DL-186, D35: wave 1's "no board is created, renamed or deleted" is answered) |
| Plan or document... | opens a picker (view-local); a choice dispatches `cmd.nav.open_subject` | none |
| Artifact... | opens a picker (view-local); a choice dispatches `cmd.nav.open_subject` with the artifact subject | none |
| Output, Problems, Ports, Debug Console | opens the submenu (view-local) | each: `cmd.panel_tab.open` with `kind` `output`, `problems`, `ports` or `debug_console` (Output opens or reveals `output`; Problems and Ports reveal their one tab; Debug Console opens or reveals its one tab, `debug-console`, amended 2026-10-10, DL-187, D33) |
| Split right | `cmd.workspace_layout.split` with `direction: right` | none |
| Split down | `cmd.workspace_layout.split` with `direction: down` | none |
| Reopen closed tab | `cmd.panel_tab.reopen_closed` | none |
| Launcher only: five recent files | `cmd.file.open` with `mode: keep` | none |
| Launcher only: the hint line | dispatches nothing | none |

The "+" menu itself also opens from Ctrl+Shift+Space.

### The "+N" list, the every-tab list and the recent-tab list

Opening any of them (a click on "+N", Ctrl+Shift+A for every tab, the panel menu's Show all tabs in this panel, holding Ctrl+Tab) and typing in its filter dispatch nothing. Choosing a row is `ui.panel_tab.activate`. Dropping a dragged tab on "+N" is `cmd.panel_tab.move` into that panel.

### Panel menu (the strip's options button)

| Leaf | Dispatch |
|---|---|
| Split right / Split down | `cmd.workspace_layout.split` |
| Maximize / Restore panels | `ui.workspace_layout.maximize` |
| Collapse to tabs / Expand | `cmd.workspace_layout.set_collapsed` |
| Move panel, then a side of another panel, the centre's outer edge, or Into another panel (as tabs) | `cmd.workspace_layout.move_surface` (`edge: center` for Into) |
| Lock panel / Unlock panel | `cmd.workspace_layout.lock` |
| Show all tabs in this panel | view-local (the "+N" list with every tab) |
| Layouts, then a named or saved layout | `cmd.workspace_layout.apply_named` |
| Layouts, then Save this layout... | the name prompt is view-local; Save dispatches `cmd.workspace_layout.save_named` |
| Layouts, then Restore home layout | `cmd.workspace_layout.reset` |
| Close other tabs | `cmd.panel_tab.close` with the panel's other unpinned tabs |
| Close panel | `cmd.workspace_layout.close_panel` |

### Tab menu (right click, or Shift+F10 on a focused tab)

A kind's own rows come first and dispatch that kind's own commands (UCC-201 lists the terminal's). Then:

Amended 2026-10-10 (DL-187, D38; `Plans/FinalGUISpec.md#F3-631` as amended): a kind's own rows now sit at the end of the tab menu, after a hairline, and do what that kind registers for them, which need not be a command: the terminal's one row is Mute notifications, the typed local action `ui.terminal.mute_notifications` (UCC-201). On a custom dashboard's tab, Rename... also renames the dashboard, and clearing the label gives back "Dashboard <n>"; on Home, Metrics, Monitoring and Agents a label names that tab only (DL-186, D35).

| Leaf | Dispatch |
|---|---|
| Close | `cmd.panel_tab.close` |
| Close others / Close to the right | `cmd.panel_tab.close` with the resolved set |
| Keep open (preview tabs only) | `cmd.panel_tab.keep` |
| Pin / Unpin | `cmd.panel_tab.pin` / `cmd.panel_tab.unpin` |
| Rename... | the prompt is view-local; Rename dispatches `cmd.panel_tab.rename` |
| Move to new panel | `cmd.panel_tab.move` with `split` by the fit rule (also Alt+click on a tab) |
| Move to panel, then a panel | `cmd.panel_tab.move` with `panel_id` |
| Split right with this tab / Split down with this tab | `cmd.panel_tab.move` with `split: { panel_id, edge }` |

### Strip, divider and drag gestures

A click on a tab is `ui.panel_tab.activate`; a double click on a preview tab is `cmd.panel_tab.keep`; the close target and a middle click are `cmd.panel_tab.close`; dragging a tab within a strip, to another panel, onto a panel edge or onto "+N" is one `cmd.panel_tab.move` on release; dragging a panel by its grip is one `cmd.workspace_layout.move_surface` on release; dragging a divider is one `cmd.workspace_layout.resize_surface` on release, and a double click on it evens the sizes in one; dragging a panel below half its minimum is one `cmd.workspace_layout.set_collapsed` on release; a double click on a strip's empty space is `ui.workspace_layout.maximize`. The drag ghost, landing previews, edge bands and dwell are previews and dispatch nothing.

### The title bar's Home menu

| Leaf | Dispatch |
|---|---|
| A named or saved layout | `cmd.workspace_layout.apply_named` |
| Show the chat / Hide the chat | `cmd.panel.switch` with `chat` (UCC-203) |
| Pop out the chat / Dock the chat back | `cmd.panel.undock` / `cmd.panel.redock` with `chat` (UCC-203) |
| Keep the chat open in narrow windows | `ui.chat_column.keep_open` (UCC-203), the chat's own preference (amended 2026-10-10, DL-187: the planning thread's ruling under D4 makes it no Settings row, so the Settings transaction over `general.interaction.chat-keep-open` retires; `Plans/Settings_System.md#SSYS-050`) |
| Save this layout... | the prompt is view-local; Save dispatches `cmd.workspace_layout.save_named` |
| Restore home layout | `cmd.workspace_layout.reset` |
| Run Onboarding Again | `ui.onboarding.start` (unchanged, UCC-106) |

### Keys

| Action | Native app | Web client | Dispatch |
|---|---|---|---|
| New tab of the panel's usual kind | Ctrl+T | Alt+T | `cmd.panel_tab.open` |
| Close tab | Ctrl+W | Alt+W | `cmd.panel_tab.close` |
| Reopen closed tab | Ctrl+Shift+T | Alt+Shift+T | `cmd.panel_tab.reopen_closed` |
| Recent tabs across panels and kinds | Ctrl+Tab / Ctrl+Shift+Tab | Alt+\` / Alt+Shift+\` | `ui.panel_tab.activate` on release |
| "+" menu | Ctrl+Shift+Space | same | view-local |
| New terminal / New browser | Ctrl+Shift+\` / Ctrl+Shift+B | same | `cmd.panel_tab.open` |
| Open a file (Quick Open) | Ctrl+P | same | view-local; Enter dispatches `cmd.file.open` with `mode: keep` |
| Every tab, searchable | Ctrl+Shift+A | same | view-local; a choice is `ui.panel_tab.activate` |
| Next / previous tab in the panel | Ctrl+PgDn / Ctrl+PgUp | same | `ui.panel_tab.activate` |
| Tab 1 to 8 / last tab | Alt+1..8 / Alt+9 | same | `ui.panel_tab.activate` |
| Move tab left / right | Ctrl+Shift+PgUp / Ctrl+Shift+PgDn | same | `cmd.panel_tab.move` |
| Focus the panel in a direction / panel N | Alt+arrows / Alt+Shift+1..9 | same | `ui.workspace_layout.focus_panel` |
| Move the tab to the panel in a direction | Alt+Shift+arrows | same | `cmd.panel_tab.move` |
| Cycle regions: rail, panels, chat composer | F6 / Shift+F6 | same | keyboard focus movement owned by FinalGUISpec's keyboard rules; no action id |
| Split right / down | Ctrl+\\ / Ctrl+Shift+\\ | same | `cmd.workspace_layout.split` |
| Maximize / restore | Shift+Escape (Escape restores while focus is in a strip) | same | `ui.workspace_layout.maximize` |
| Resize | Tab to a divider, then the divider keys | same | `cmd.workspace_layout.resize_surface` |
| Tab menu / Move panel | Shift+F10 on a tab / Enter on a panel grip | same | view-local; a leaf dispatches as above |

Amended 2026-10-10 (DL-186, D35): in a panel whose usual kind is the dashboard, Ctrl+T and a split make a new, empty custom dashboard (`cmd.panel_tab.open` or `cmd.workspace_layout.split` with a dashboard spec and no `board_id`; `Plans/FinalGUISpec.md#F3-638`).

The shell keeps Ctrl+1..9 (pages) and Ctrl+K (the command palette), so the panels use neither and there are no Ctrl+K chords. There are no bare letters or digits, pin is in the tab menu only, and Escape stays scoped to the innermost open thing. Every label shows the key that works where the app runs. A focused terminal keeps the shell's keys and gives back the host keys UCC-201 lists.

### The dashboard tab

Amended 2026-10-10 (lead ruling L10): The Dashboard row and sub-rows open or reveal the starting boards; wave 1 creates, renames and deletes no board.

Amended 2026-10-10 (DL-186; D10 P1 to P13, D35): L10's interim rule is answered. Every dashboard tab is its own board on the Usage board engine (`Plans/FinalGUISpec.md#F3-638`, `Plans/Widget_System.md#WS-030`): the built-in boards Home (`dashboard:home`), Metrics (`dashboard:metrics`), Monitoring (`dashboard:monitoring`) and Agents (`dashboard:agents`, drawn by the dashboard kind with no board record, lead ruling F7), and the custom dashboards a person makes (`dashboard:dash-<n>`). New dashboard makes a custom one, which starts empty; Rename dashboard... and Delete dashboard... rename and delete a custom one; Home, Metrics, Monitoring and Agents can be reset but never renamed through the Board menu or deleted. The widget command payloads do not change: inside a dashboard tab the widget commands name the board in their existing `room` field, whose value is the board id (which never equals a Usage room id), and there is no `board_id` payload field. The only field added is `set_id` on `cmd.widget.reset_layout` (section 2.3). The table below maps every control of a dashboard tab. The sentences of the next paragraph that said no board is created, renamed or deleted, and that the widget commands are addressed by `board_id`, are amended in place.

A dashboard tab is opened by `cmd.panel_tab.open` with `{ kind: dashboard, board_id }`; `dashboard:home` is the pinned Home dashboard of the default layout, and the "+" menu's Dashboard row body opens or reveals `dashboard:home`, while its sub-rows open or reveal the other boards, and its New dashboard sub-row makes a new custom dashboard (amended 2026-10-10, DL-186; it read: no board is created, renamed or deleted in wave 1). Several dashboard tabs may be open, each with its own board and widget layout. Inside a dashboard tab the widget commands stay `cmd.widget.add`, `cmd.widget.remove`, `cmd.widget.resize`, `cmd.widget.configure`, `cmd.widget.move` and `cmd.widget.reset_layout`, naming the board in their existing `room` field (`Plans/Widget_System.md#WS-030`; amended 2026-10-10, DL-186, P3; it read: addressed by `board_id`), with `page` kept for the Usage page; the Add widget picker reads `cmd.dashboard.catalog`. A widget-layout change is a change to that board, not to the Home layout, so it emits no `workspace.layout_changed`. UCC-144's criterion "No Home surface uses cmd.widget.*" retires with UCC-144.

#### Dashboard tab controls

Added 2026-10-10 (DL-186; lead rulings F1, F2 and F7). The controls are `Plans/FinalGUISpec.md#F3-638`'s; the boards, sets, presets and their records are `Plans/Widget_System.md#WS-030`'s. Opening the Add widget list, the Board menu, Start from, a submenu, a name prompt or a confirm dispatches nothing.

| Control | Dispatch |
|---|---|
| Header row > Add widget; the empty board's Add widget | opens the "Find a widget" list (view-local) |
| Add widget list > a widget | `cmd.widget.add` with the board in `room` and the `widget_id`; a widget already on the board is disabled with "Already on this dashboard" |
| Header row > Board | opens the Board menu (view-local) |
| Header row > Maximize / Restore | `ui.workspace_layout.maximize` |
| Board > Dashboards > a dashboard | `cmd.panel_tab.open` with `{ kind: dashboard, board_id }`, opening or revealing it |
| Board > Dashboards > New dashboard | `cmd.panel_tab.open` with `{ kind: dashboard }` and no `board_id`: a new, empty custom dashboard |
| Board > This dashboard > Range > a range; Scope > a scope | `ui.widget_board.set_view` (lead ruling F1) |
| Board > This dashboard > Start from > a set (This dashboard, Dashboard starter, a Usage room, a preset); the empty board's Start from... | the list is view-local; a set dispatches one `cmd.widget.reset_layout` with `{ scope: room, room: <board_id>, set_id }` |
| Board > This dashboard > Save as preset...; Start from > Your presets > Save this dashboard as a preset... | the name prompt is view-local; Save is `ui.widget_preset.save` (lead ruling F2) |
| Start from > Your presets > Rename or delete presets > a preset > Start from this preset | `cmd.widget.reset_layout` with `{ scope: room, room: <board_id>, set_id: user:<preset_id> }` |
| ... > Rename preset... | the prompt is view-local; Rename is `ui.widget_preset.rename` |
| ... > Delete preset... | the confirm is view-local; Delete preset is `ui.widget_preset.delete`; Keep it dispatches nothing |
| Board > This dashboard > Tidy | one `cmd.widget.move` carrying `arrange { mode: tidy, detail: diagnostics }` (`Plans/Widget_System.md#WS-019`: on a dashboard every placed widget shows at `diagnostics`); disabled on an empty board ("Nothing to tidy yet") |
| Board > This dashboard > Reset widgets | `cmd.widget.reset_layout` with `{ scope: room, room: <board_id> }` and no `set_id`: Home, Metrics and Monitoring go back to their default sets, a custom dashboard to empty |
| Board > Live > Live readings | the Usage page's one Live / Paused choice, view state with no command (`Plans/usage-feature.md#UF-107`) |
| Board > Rename dashboard... (custom dashboards only) | the name prompt is view-local; Rename is `cmd.panel_tab.rename` on that dashboard's tab with the name, which is kept per project with the board (WS-030); an empty name gives back "Dashboard <n>" |
| Board > Delete dashboard... (custom dashboards only) | the confirm ("Delete <name>?") is view-local; Delete dashboard is `cmd.panel_tab.close` on that tab, after which the dashboard leaves the reopen list and its board, its quarantine and its name are forgotten (WS-030); Keep it dispatches nothing |
| The Undo notice after Start from > Undo | one `cmd.widget.reset_layout` with `{ scope: room, room: <board_id>, restore_revision }`, `restore_revision` being the board's committed layout revision just before that Start from; one receipt, no `workspace.layout_changed`; offered only while the notice is up (8 s, held while the pointer or focus is on it, F3-638); never with `set_id`; refused with a disabled reason when that revision is no longer the board's previous one (amended 2026-10-10, lead ruling; it read: no id yet: open for the lead's ruling (as built the concept writes the board's earlier record back with no command); not certified until ruled) |
| A widget card's gestures, size picker, card menu and gear | the Usage board's own `cmd.widget.*` rows (UCC-036, `Plans/Widget_System.md#WS-019`), naming the board in `room` |
| A widget card > Details | the Usage page opens at that widget's room with its inspector (P8): a page change and the Usage page's own inspector, view state with no command |
| Agents > Show > a filter | that tab's own view state, with no command (lead ruling F7) |
| Agents > an agent's card; Alt+click | `cmd.agents.open_thread` (the open-routes table) as a kept transcript tab; Alt+click with `where: panel` |

Play the next hour, Back to now and the Demo time, which the concept also runs on dashboards, are the lab-only demo controls of `Plans/usage-feature.md#UF-107` in the one Demo Studio (`Plans/FinalGUISpec.md#F3-649`): no row. A custom dashboard closed as a tab keeps its board while it is in the reopen list and is forgotten when it leaves it unless it is open (P6); that forgetting is storage housekeeping that dispatches nothing (WS-030). Renaming a custom dashboard's tab from the tab menu is the same `cmd.panel_tab.rename` and renames the dashboard too.

### Home producer dispositions (for the wiring owner)

| Producer (production wiring id) | Disposition |
|---|---|
| `home.editor_panel_1.*` to `home.editor_panel_4.*` (close, grab, open_browser, pop_out), `home.more_options.open_panel_1` to `_4`, `home.more_options.open_browser_panel_1` to `_4`, `home.file_manager.open_panel_1` to `_4`, `home.resizer.editor_panel_1` to `_4` | retired with the four fixed editor panels; their actions are the panel menu, tab menu, "+" menu, grip and divider rows above |
| `home.dashboard.grab`, `home.resizer.dashboard` | retired as dashboard-only producers; a dashboard tab's panel moves and resizes like every panel |
| `home.dashboard.pop_out` | retired: no panel, tab or dashboard pops out |
| `home.drop_target.left`, `.right`, `.top`, `.bottom`, `.main`, `.floating`, `home.resizer.dock_track`, `home.resizer.floating_corner` | retired: there are no docks and no in-window float; tab and panel drops are the `cmd.panel_tab.move` and `cmd.workspace_layout.move_surface` gestures above |
| `home.chat.grab`, `home.chat.pop_out`, `home.resizer.chat`, `home.chat.activity_toggle` | UCC-203 |
| `home.terminal_section.grab`, `.move_workgroup`, `.new_section`, `.split_pane`, `.bottom_toggle`, `home.resizer.terminal_section`, `home.more_options.collapse_bottom` | retired with terminal sections and the bottom terminal (UCC-201) |
| `home.more_options.reset_layout`, `home.settings.reset_layout` | kept: `cmd.workspace_layout.reset` |

ContractRef: ContractName:Plans/Decision_Log.md#DL-180, ContractName:Plans/FinalGUISpec.md#F3-630, ContractName:Plans/FinalGUISpec.md#F3-632, ContractName:Plans/FinalGUISpec.md#F3-633, ContractName:Plans/FinalGUISpec.md#F3-634, ContractName:Plans/Contracts_V0.md#CV-360, ContractName:Plans/Contracts_V0.md#CV-361, ContractName:Plans/DRY_Rules.md#DR-071, ContractName:Plans/Widget_System.md#WS-030, ContractName:Plans/Commands_System.md#CS-100

### UCC-200 - Panel Tab And Layout Commands, Menus, Lists And Open Routes

```yaml
plan_unit_id: UCC-200
unit_type: command_contract
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: >-
  Home's universal panels (DL-180) have one command family for tabs and one for layout. Tab
  operations are cmd.panel_tab.open, cmd.panel_tab.close, cmd.panel_tab.rename, cmd.panel_tab.move,
  cmd.panel_tab.keep, cmd.panel_tab.pin, cmd.panel_tab.unpin and cmd.panel_tab.reopen_closed. Layout
  operations extend cmd.workspace_layout.*: split, move_surface (a whole panel; edge center moves
  its tabs into another panel), resize_surface (one commit on release, or per changed divider key
  press), set_collapsed (any panel), close_panel, lock, apply_named, save_named and reset (Restore
  home layout, also the Settings row general.startup.reset-home-layout). Every row carries
  project_id, workspace_tab_id, expected_layout_revision and idempotency_key; a tab is named by
  panel_tab_id, never by route tab_id or workspace_tab_id, and a home panel by panel_id. Every
  committed structural change emits the one existing event workspace.layout_changed with its v2
  payload (CV-361); an open that only reveals an existing tab emits nothing, and a failed commit
  rolls back and emits nothing. View state is typed local actions with no receipt and no event:
  ui.panel_tab.activate, ui.workspace_layout.maximize, ui.workspace_layout.focus_panel and
  ui.output.select_channel. Opening the "+" menu, the "+N" list, the every-tab and recent-tab lists,
  a panel menu, a tab menu, a picker or a prompt, hovering and dragging dispatch nothing, and each
  leaf dispatches exactly one command or typed local action as this addendum's tables map it, with a
  typed no_change for an already-done target and a disabled reason from the closed set otherwise. A
  "+" row's body opens a new tab in this panel (where tab) and its trailing cell, Alt+click or
  Alt+Enter a new panel (where panel); the empty-panel launcher dispatches the same ids. Where a
  domain id exists for the thing opened the caller dispatches it: cmd.file.open,
  cmd.nav.open_subject, cmd.browser.open_workspace_preview and cmd.terminal.open keep their ids,
  carry the placement fields where, mode, by and background whose contract is CV-360, and resolve
  through the one opening module (F3-634, DR-071) like every other route in the open-routes table;
  cmd.panel_tab.open is dispatched directly only for a new terminal, a blank browser, a dashboard
  tab, an editor buffer and the tool tabs. cmd.editor.close_tab is an alias of cmd.panel_tab.close.
  cmd.editor.open_panel, cmd.editor.close_panel and the never-registered cmd.artifacts.open_panel
  retire, and target_editor_panel_id, target_editor_group_id and target_group never select a home
  panel. A dashboard tab opens or reveals with cmd.panel_tab.open and a board_id; the Dashboard row
  body opens or reveals dashboard:home and its sub-rows open or reveal the other boards, and New
  dashboard makes a custom one (amended 2026-10-10, DL-186; it read: no board is created, renamed or
  deleted in wave 1); widget commands inside it stay cmd.widget.* naming the board in their existing
  room field (WS-030; amended 2026-10-10, DL-186; it read: addressed by board_id) and emit no
  workspace.layout_changed. The shell keeps Ctrl+1..9 and Ctrl+K, so tab N is Alt+N and there are no
  Ctrl+K chords; in the web client Ctrl+T, Ctrl+W, Ctrl+Shift+T and Ctrl+Tab are answered as Alt+T,
  Alt+W, Alt+Shift+T and Alt+`. This unit supersedes UCC-144. Output opens or reveals `output`; its
  channel picker switches the channel with `ui.output.select_channel`, a view action with no
  command, receipt or event. "Open in new tab" dispatches `cmd.panel_tab.open` with
  `output:<channel>` and shows only that channel. Other channel opens follow F3-634. Amended
  2026-10-10 (DL-186; D10 P1 to P13, D35; lead rulings F1, F2, F3 and F7): every dashboard tab is
  its own board on the Usage board engine. The "+" menu's Dashboard sub-row lists Home, Metrics,
  Monitoring, Agents, this project's custom dashboards and New dashboard; New dashboard, and Ctrl+T
  or a split in a panel whose usual kind is the dashboard, dispatch cmd.panel_tab.open (or
  cmd.workspace_layout.split) with a dashboard spec and no board_id, which makes a new, empty custom
  dashboard. A dashboard tab's controls map as the Dashboard tab controls table says: Add widget is
  cmd.widget.add; Start from, a preset's Start from this preset and Reset widgets are one
  cmd.widget.reset_layout with scope room and the board in room, Start from naming its set in the
  new optional set_id (default, room:<room_id>, host:dashboard or user:<preset_id>) and Reset
  widgets naming none; Tidy is one cmd.widget.move carrying arrange with detail diagnostics
  (WS-019); Range and Scope are the typed local action ui.widget_board.set_view, and saving,
  renaming and deleting a preset are ui.widget_preset.save, ui.widget_preset.rename and
  ui.widget_preset.delete, each with no receipt and no event; Live readings is the Usage page's Live
  / Paused view state; Rename dashboard... is cmd.panel_tab.rename and Delete dashboard..., after
  its confirm, cmd.panel_tab.close, both for custom dashboards only, so no command family is added;
  Agents is drawn by the kind, its Show filter view state. Widget payloads do not change: a
  dashboard board is named in their existing room field, never in a board_id field. A named layout's
  save keeps the boards of its dashboard tabs up to 64 KB, and its apply puts them back, with no
  argument added. The Undo in the notice that follows Start from dispatches one
  cmd.widget.reset_layout with { scope: room, room: <board_id>, restore_revision }, restore_revision
  being the board's committed layout revision just before that Start from, with one receipt and only
  while the notice is up (8 s, held on pointer or focus, F3-638); restore_revision and set_id never
  travel together; the owner puts back exactly that revision's records, and a restore is refused
  without dispatch and disabled with a reason when any other board change was committed since,
  excluding the preset hold's settling resizes; like every widget command it emits no
  workspace.layout_changed (CV-361) (amended 2026-10-10, lead ruling; it read: The Undo that follows
  Start from has no id yet and waits for the lead's ruling.) Amended 2026-10-10 (DL-187; D33, D38,
  D39, D40, lead rulings F5 and F6): the Terminal row lists every installed shell, uncapped, and an
  SSH hosts row opens a submenu of hosts that dispatch cmd.panel_tab.open with that host's profile;
  the empty-panel launcher's sub-row links dispatch what the menu's sub-rows dispatch; the Debug
  Console row opens or reveals the one debug-console tab, whose session sub-tab is view state that
  dispatches nothing; a kind's own tab-menu rows sit at the end after a hairline and do what the
  kind registers, the terminal's Mute notifications being ui.terminal.mute_notifications; the title
  bar's Keep the chat open in narrow windows is the typed local action ui.chat_column.keep_open, no
  longer a Settings write. Amended 2026-10-10 (lead ruling F8; DL-188): cmd.chat.plan.open_details
  and cmd.chat.plan.open_version join the open routes as plan tabs carrying the placement fields,
  open_version opening the exact version (DL-157); every route that adds a tab emits
  workspace.layout_changed, admitted at family revision 2.0.0. Amended 2026-10-10 (lead ruling):
  cmd.chat.attachment.open joins the table of routes that open or reveal a tab; it opens the
  attachment's document or artifact tab through the one opening module, and an open that adds a tab
  emits workspace.layout_changed (CV-361). cmd.browser.focus_browser_tab is layout-only with no
  event, and a collapsed host panel expands through cmd.workspace_layout.set_collapsed. The same
  dashboard Undo notice and existing Undo route serve Start from and a Reset widgets that changed
  anything: one cmd.widget.reset_layout { scope: 'room', room: <board_id>, restore_revision }, one
  receipt and no workspace.layout_changed, never set_id with restore_revision. The revision and its
  envelope are captured before that operation and written back and read by the board owner after
  acceptance. Any other committed board change disables Undo without dispatch, except the preset
  hold's settling resizes; eligibility is rechecked while the notice is up on commit, pointer or
  focus entering and click (WS-030, F3-638). Picker Back and its keyboard equivalents are
  ui.panel_tab.picker_back under CS-100, consuming F3-632; no Back cmd.* is minted. Restoring a
  level never opens an item or changes the layout.
gui_related: true
gui_classification_reason: "Owns the command ids, arguments, availability, disabled reasons, events and keys of every control the universal panels add."
split_recommended: false
depends_on: [DL-180, DL-186, DL-187, DL-188, F3-630, F3-631, F3-632, F3-633, F3-634, F3-635, F3-636, F3-638, CV-360, CV-361, DR-071, WS-030, UCC-013, UCC-108, UCC-135, UCC-147]
unblocks: [WM-090, WM-092, UIW-040, UIW-041, ATS-075]
acceptance_criteria:
  - "Every control of the universal panels (strip, tab, \"+\" menu row and trailing cell, empty-panel launcher row, \"+N\" list, panel menu, tab menu, grip, divider, title-bar Home menu and key) maps to exactly one command or typed local action in this addendum's tables, and no action has two ids."
  - "Each committed structural command emits exactly one workspace.layout_changed with the v2 payload; an open that only reveals an existing tab, a ui.* action, a menu or list opening, a hover, a drag preview, a cancelled or unchanged release and a failed commit emit none."
  - "ui.panel_tab.activate, ui.workspace_layout.maximize and ui.workspace_layout.focus_panel have no catalog row, no receipt and no event."
  - "cmd.panel_tab.close closes a set from one panel in one commit after each kind's close check; a declined check leaves only that tab open."
  - "cmd.file.open, cmd.nav.open_subject, cmd.browser.open_workspace_preview and cmd.terminal.open carry where, mode, by and background and reach the same opening module as cmd.panel_tab.open; an id already open anywhere is revealed where it is and never opened twice or moved."
  - "No row or route selects a home panel through target_editor_panel_id, target_editor_group_id or target_group, and cmd.file.open_with keeps exactly its five values."
  - "A dashboard tab's widget commands are cmd.widget.* naming the board in their existing room field (amended 2026-10-10, DL-186; it read: addressed by board_id) and emit no workspace.layout_changed; cmd.dashboard.add_widget dispatches only as UCC-202's alias."
  - "Every control of a dashboard tab maps as the Dashboard tab controls table says: Start from and Start from this preset dispatch one cmd.widget.reset_layout with set_id, the Undo after Start from one cmd.widget.reset_layout with restore_revision and no set_id while its notice is up, refused without dispatch and disabled with a reason when any other board change was committed since, excluding the preset hold's settling resizes, Reset widgets one without set_id, Tidy one cmd.widget.move with arrange, and Range, Scope and the preset save, rename and delete dispatch only their typed local actions with no receipt and no event (amended 2026-10-10, lead ruling; it read: Every control of a dashboard tab maps as the Dashboard tab controls table says, except the Undo after Start from, which has no id until the lead rules: Start from and Start from this preset dispatch one cmd.widget.reset_layout with set_id, Reset widgets one without set_id, Tidy one cmd.widget.move with arrange, and Range, Scope and the preset save, rename and delete dispatch only their typed local actions with no receipt and no event)."
  - "New dashboard, and Ctrl+T or a split in a dashboard panel, make a new empty custom dashboard through cmd.panel_tab.open or cmd.workspace_layout.split with no board_id; Rename dashboard... and Delete dashboard... appear only on a custom dashboard and dispatch cmd.panel_tab.rename and, after the confirm, cmd.panel_tab.close; no other command family exists for dashboards."
  - "The Terminal row lists every installed shell and the SSH hosts row opens their submenu; the empty-panel launcher's sub-row links dispatch exactly what the menu's sub-rows dispatch."
  - "The Debug Console row opens or reveals the one debug-console tab, and choosing its session sub-tab dispatches nothing."
  - "The terminal's tab-menu row Mute notifications dispatches ui.terminal.mute_notifications, and the title bar's Keep the chat open in narrow windows dispatches ui.chat_column.keep_open; neither writes a Settings row."
  - "cmd.chat.plan.open_details and cmd.chat.plan.open_version resolve through the one opening module with the placement fields and emit workspace.layout_changed only when they add a tab."
  - "cmd.chat.attachment.open is a row of the table of routes that open or reveal a tab and emits workspace.layout_changed only when it adds a tab; cmd.browser.focus_browser_tab emits nothing, and its collapsed host panel expands through cmd.workspace_layout.set_collapsed (amended 2026-10-10, lead ruling)."
  - "In the web client the four browser-owned chords are answered as Alt+T, Alt+W, Alt+Shift+T and Alt+`, and every label shows the key that works where the app runs."
  - "The channel picker switches output with ui.output.select_channel as view state, with no command, receipt or event; Open in new tab dispatches cmd.panel_tab.open with output:<channel>."
  - "F6 and Shift+F6 cycle the rail, panels and chat composer from every region, as Plans/FinalGUISpec.md#F3-635 requires."
validation_surfaces:
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-plans-verify.py validate-wiring-matrix
risk_class: home_panels_terminal_redesign_drift
reasoning_tier: high
context_scope: home_panels_terminal
implementation_surfaces:
  - Plans/UI_Command_Catalog.md
  - Plans/Commands_System.md
  - Plans/Wiring_Matrix.md
  - Plans/Wiring_Matrix.production.json
node_compile_hint:
  mode: gui_promotion_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- /mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/canon-inputs/panels-NUMBERS-6026fa8432.md,
  SHA-256 27ddd358f2c98848e424d7802e753435e09568a9555330884a84c725a844f2c7 (concept lineage only)
- /mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/canon-inputs/followup/DECISIONS-ADDENDUM-2.md,
  SHA-256 1eecc96b03a1a774f52d06420c913553d5f5d1917e1bd5705e2f6e0bbc11fad6 (D31)
- Plans/Decision_Log.md#DL-180
- /mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/DECISIONS.md (SHA-256 0d2b45466c91734e15fd8659e9a8e3b17b70d92be785421e57e084dc8daf6b64;
  D1, D2, D5 to D10)
- /mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/canon-inputs/panels-CONTRACT-v1-778c8494e6.md
  (SHA-256 aa16fc080f44f6824b0ef32a2b568bfcae81277b6962caaba1b441015d68dae9; sections 6 to 9; concept
  lineage only)
- /mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/canon-inputs/panels-NUMBERS-407e6fb6fe.md
  (SHA-256 019721f5215d95c80b999d5b61e1ee4bf79b29afc5b229a12bccde6f738c5162; Commands and keys; concept
  lineage only)
- Plans/Decision_Log.md#DL-186
- Plans/Decision_Log.md#DL-187
- Plans/Decision_Log.md#DL-188
- /mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/canon-inputs/followup/DECISIONS-ADDENDUM-3.md,
  SHA-256 ecd18c2f2d8ac8f714f9578170d321584fb871e3d19601a68061898ffd6759a9 (D33, D35, D38, D39, D40, D42)
- /mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/canon-inputs/followup/D10-DESIGN-per-instance-boards.md,
  SHA-256 927d0ed893c513f2f20efa3ff678f19ba785ac43cf84d690412038daa5d41796 (P1-P13; design lineage only)
- /mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/canon-inputs/followup/panels-NUMBERS-339203bd76.md,
  SHA-256 2e2c2a95819842cd5cbcc108ed302460ddea3ed0a98be7dfe4f1b78507660ce6 (the "+" menu's shells and
  SSH hosts, the launcher links, the Debug Console; concept lineage only)
- 'The panels thread''s build facts, pm-mail 1010221905-e13e and 1010223444-a10e (2026-10-10): set_id
  and its set ids, presets, rename and delete through the tab commands'
- /mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/canon-inputs/small-round/panels-CONTRACT-2926ad987e.md,
  SHA-256 c579d0dfef41fd1fc7327d14c2adb9e2b101c24b216ff64a9db5fc19895ad989 (small-round concept lineage
  only)
- /mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/canon-inputs/small-round/panels-NUMBERS-51c316e18b.md,
  SHA-256 a9c42b88e5cb50706ff1716a254cb68e026a538bb7a0c840905779a9a482cff2 (small-round concept lineage
  only)
- /mnt/Cursor/share/puppet-master/2026-10-16-plans-pass2/sources/2026-10-15-panels-picker-back--NOTES.md,
  SHA-256 29bac44f166cb8e0e67f4f00634cb15d0a3be576eb2f68e7e19606f3a4a1a71c (source lineage; not native
  certification)
preserved_exact_tokens:
  - "set_id"
  - "restore_revision"
  - "cmd.chat.attachment.open"
  - "ui.widget_board.set_view"
  - "ui.widget_preset.save"
  - "ui.widget_preset.rename"
  - "ui.widget_preset.delete"
  - "ui.terminal.mute_notifications"
  - "ui.chat_column.keep_open"
  - "New dashboard"
  - "SSH hosts"
  - "debug-console"
  - "cmd.chat.plan.open_version"
  - "Open in new tab"
  - "output:<channel>"
  - "output"
  - "ui.output.select_channel"
  - "cmd.panel_tab.open"
  - "cmd.panel_tab.close"
  - "cmd.panel_tab.rename"
  - "cmd.panel_tab.move"
  - "cmd.panel_tab.keep"
  - "cmd.panel_tab.pin"
  - "cmd.panel_tab.unpin"
  - "cmd.panel_tab.reopen_closed"
  - "cmd.workspace_layout.*"
  - "ui.panel_tab.activate"
  - "ui.workspace_layout.maximize"
  - "ui.workspace_layout.focus_panel"
  - "workspace.layout_changed"
  - "panel_tab_id"
  - "general.startup.reset-home-layout"
  - "cmd.editor.close_tab"
  - "cmd.file.open"
  - "cmd.nav.open_subject"
  - "cmd.browser.open_workspace_preview"
  - "cmd.terminal.open"
  - "no_change"
negative_constraints:
  - "Do not dispatch on a menu, list, picker or prompt opening, a hover, a drag preview, or a cancelled or unchanged release."
  - "Do not give an action two ids: a domain open uses its domain id and resolves through the one opening module; a ui.* action never also has a cmd.* row."
  - "Do not add an event family; workspace.layout_changed is the only layout event."
  - "Do not name a panel tab with route tab_id or workspace_tab_id, and do not extend cmd.panel.switch's vocabulary with home panels."
  - "Do not select a home panel through target_editor_panel_id, target_editor_group_id or target_group, and do not add placement values to cmd.file.open_with."
  - "Do not use Ctrl+1..9, Ctrl+K chords, bare letters or digits for panel actions."
compatibility_only_notes:
  - "cmd.editor.close_tab is recorded alias metadata of cmd.panel_tab.close with no handler of its own."
  - "cmd.workspace_layout.size_surface still normalizes to cmd.workspace_layout.resize_surface (CS-068)."
stale_retired_dispositions:
  - "Amended 2026-10-10 (R35, panels NUMBERS 6026fa8432): Names the chat composer in the F6 region cycle table."
  - "Amended 2026-10-10 (D31, DL-180): Output uses one tab with its channel as view state; only an explicit channel split-off uses output:<channel>."
  - "Amended 2026-10-10 (lead ruling L10): The Dashboard row opens or reveals dashboard:home and its sub-rows the other starting boards, without board creation, rename or deletion."
  - "Amended 2026-10-10 (DL-186, D35): L10's interim rule is answered: New dashboard makes custom dashboards, Rename dashboard... and Delete dashboard... reuse cmd.panel_tab.rename and cmd.panel_tab.close, and the dashboard tab's controls are mapped."
  - "Amended 2026-10-10 (DL-186, P3 and P4; lead rulings F1 and F2): widget commands name a dashboard board in their existing room field, not board_id; cmd.widget.reset_layout gains set_id; range, scope and the preset save, rename and delete are typed local actions."
  - "Amended 2026-10-10 (DL-187; D33, D38, D39; lead rulings F5 and F6): installed shells and an SSH hosts submenu in the \"+\" menu, launcher sub-row links, one debug-console tab, a kind's tab-menu rows at the end, Mute notifications and Keep the chat open in narrow windows as typed local actions."
  - "Amended 2026-10-10 (lead ruling F8; DL-188): cmd.chat.plan.open_details and cmd.chat.plan.open_version join the open-routes table; workspace.layout_changed is admitted at 2.0.0."
  - "Amended 2026-10-10 (lead ruling on the Undo after Start from): the Undo dispatches cmd.widget.reset_layout with restore_revision; the dashboard tab controls table, this unit's text and its criterion no longer hold it open."
  - "Amended 2026-10-10 (lead ruling): cmd.chat.attachment.open joins the open-routes table, and cmd.browser.focus_browser_tab's row records that it is layout-only with no event."
  - "Supersedes UCC-144 (2026-10-09, DL-180): four editor panels, Panel 1 to 4 routing, the singleton Dashboard, chat grab and in-canvas float, cmd.terminal.move_workgroup and Collapse Bottom Terminal retire; its leaf semantics carry forward here."
  - "Retired 2026-10-09 (DL-180): cmd.editor.open_panel, cmd.editor.close_panel and cmd.artifacts.open_panel, with their replacements in CS-101."
  - "Amended 2026-10-11 (wave 2, panels NUMBERS 51c316e18b): The existing dashboard Undo restores the captured revision after Start from or a changed Reset with the same command and guard."
owner_hints:
  - Plans/UI_Command_Catalog.md
  - Plans/Commands_System.md
  - Plans/Wiring_Matrix.md
```

ContractRef: ContractName:Plans/Decision_Log.md#DL-180, ContractName:Plans/FinalGUISpec.md#F3-630, ContractName:Plans/FinalGUISpec.md#F3-634, ContractName:Plans/Contracts_V0.md#CV-360, ContractName:Plans/Contracts_V0.md#CV-361, ContractName:Plans/Commands_System.md#CS-100

### Terminal commands for one session per tab

The terminal is now an ordinary tab kind with one session per tab (`Plans/Section15_MVP_Promoted_Features_Spec.md#SMPFS-180`, `Plans/Decision_Log.md#DL-181`). Moving, collapsing, maximizing or hiding a terminal tab never touches its session; a terminal is moved, closed, renamed and pinned by the `cmd.panel_tab.*` commands like every tab, and Split makes a new panel. So every command that addressed a section, a workgroup, a sub-tab, a pane or the editor's terminal stack retires, and the commands that act on the session keep their ids. The terminal's row texts and menus are `Plans/FinalGUISpec.md#F3-640` and `Plans/FinalGUISpec.md#F3-646`; its engine is `Plans/Section15_MVP_Promoted_Features_Spec.md#SMPFS-183`; the agent rules are `Plans/Section15_MVP_Promoted_Features_Spec.md#SMPFS-182`. No terminal command emits `workspace.layout_changed` unless it adds, closes or moves a tab, and none adds an event family.

#### Kept terminal commands, with what changes

| command_id | Label | What it does now | command_kind | Event |
|---|---|---|---|---|
| `cmd.terminal.open` | Open in Terminal | Reveals the tab of the exact `terminal_session_id` wherever it is; a session with no tab yet (an agent's background session) gets its tab through the one opening module, as a background tab when an agent opened it. Carries CV-360's placement fields | `navigation_wrapper` | `workspace.layout_changed` only when a tab is added |
| `cmd.terminal.show` | Show Terminal | Focuses the same live session's tab; it never collapses into `open` (UCC-138) | `shell_view` | none |
| `cmd.terminal.focus` | Focus Terminal | `terminal_session_id?` or `dev_session_id?`, else the most recently focused terminal tab; the `terminal_pane_id?` argument retires with panes | `shell_view` | none |
| `cmd.terminal.reveal` | Reveal Terminal Session | Reveals the session's tab wherever it is: activates it, pulls it out of "+N", expands its collapsed panel; never "the bottom panel", never a duplicate shell | `shell_view` | none |
| `cmd.terminal.rerun` | Rerun in Terminal | Unchanged: same-session rerun is a new invocation in the bound session; a new session only on explicit request | `domain_action` | unchanged |
| `cmd.terminal.restart_replace` | Restart session | A new session in the same tab, same folder and profile: the More menu's Restart session, the Session ended row's Restart, and Enter in an ended terminal | `domain_action` | unchanged (terminal session replaced) |
| `cmd.terminal.terminate_session` | Terminate Terminal Session | Graceful end of the session; the tab stays and shows the Session ended row | `domain_action` | unchanged |
| `cmd.terminal.kill_session` | Kill Terminal Session | Forced end of the session; the tab stays and shows the Session ended row | `domain_action` | unchanged |
| `cmd.terminal.clear_scrollback` | Clear scrollback | Empties the lines above the screen and keeps the screen and the session; the saved copy empties at the next save (`Plans/storage-plan.md#SP-332`). Its catalog row was missing although the 2026-07-17 rows called it covered; this is the row | `domain_action` | none |

`cmd.terminal.remote_compatibility_setup`, `cmd.terminal.insert_command`, `cmd.terminal.open_retained_output`, `cmd.terminal.environment_provenance`, `cmd.terminal.input_protection.enable` and `cmd.terminal.input_protection.disable` stay DL-035's six candidates exactly as UCC-160 registers them (`candidate_not_registered` until admitted). The command mark's Open output in an editor tab is `ui.terminal.mark.open_output`, which dispatches `cmd.panel_tab.open` with an editor buffer spec and works while the candidate is unregistered; `cmd.terminal.open_retained_output` stays the candidate for opening a retained output subject with its source identity and completeness labels (SMPFS-163), and when admitted it resolves through the same opening module as an editor buffer, never through a second opener.

#### New terminal command rows

| command_id | Label | Arguments | Preconditions and disabled reasons | command_kind | normalization.kind | normalizes_to_contract | alias_of_command_id | Event |
|---|---|---|---|---|---|---|---|---|
| `cmd.terminal.take_over` | Take over | `terminal_session_id` | `live_subject`: an agent is driving the terminal. A human keystroke in an agent-driven terminal is the same transition, recorded under this id with `origin: keystroke` | `domain_action` | `none` | `SMPFS-182` | null | none; the receipt carries CV-362's agent-control fields |
| `cmd.terminal.hand_back` | Hand back | `terminal_session_id` | `live_subject`: the human took over and the paused agent's run is still going. Restores the write grant the agent held there for the rest of that run (DL-181) | `domain_action` | `none` | `SMPFS-182` | null | none; CV-362 fields |
| `cmd.terminal.interrupt` | Interrupt | `terminal_session_id` | `live_subject`: a foreground job runs. Sends SIGINT to the foreground job, from the agent row and from Send signal | `domain_action` | `none` | `SMPFS-182` | null | none |
| `cmd.terminal.stop_agent` | Stop / Stop <agent> | `terminal_session_id`, `agent` | `live_subject`: an agent drives or is paused here. Ends that agent's run in this terminal and returns the lease to the human; the session keeps running | `domain_action` | `none` | `SMPFS-182` | null | none; CV-362 fields |
| `cmd.terminal.allow_agent_input` | Allow once / Allow in this terminal | `terminal_session_id`, `agent`, `grant` (`once` or `this_terminal`) | `live_subject`: the agent's write request is pending. `once` lasts one command; `this_terminal` lasts until the terminal closes, the human takes over or the agent's run ends, held in memory only. It decides who may type, never what may run: each command still passes the Tools policy engine with its own approval (`SMPFS-024`, `Plans/Permissions_System.md#PS-041`); a secret prompt still refuses agent input (`secret_input`) | `domain_action` | `none` | `SMPFS-182` | null | none; CV-362 fields |
| `cmd.terminal.deny_agent_input` | Deny | `terminal_session_id`, `agent` | `live_subject`: the agent's write request is pending. The agent gets an explicit refusal, never silence | `domain_action` | `none` | `SMPFS-182` | null | none; CV-362 fields |
| `cmd.terminal.revoke_agent_input` | Revoke (Agent input, one row per allowed agent) | `terminal_session_id`, `agent` | `selection`: the agent holds a grant here | `domain_action` | `none` | `SMPFS-182` | null | none; CV-362 fields |
| `cmd.terminal.clear` | Clear | `terminal_session_id` | `always`. Erases the screen and the scrollback and redraws the prompt; the session and its program are untouched; the saved copy empties at the next save | `domain_action` | `none` | `SMPFS-183` | null | none |
| `cmd.terminal.send_signal` | Send signal: Terminate, Kill | `terminal_session_id`, `signal` (`SIGTERM` or `SIGKILL`) | `live_subject`: a foreground job runs; Kill is confirmation class `none` with a danger tone. SIGINT is `cmd.terminal.interrupt`, never this command | `domain_action` | `none` | `SMPFS-183` | null | none |
| `cmd.terminal.appearance.set` | Appearance (This terminal) | `panel_tab_id`, `fields` (the appearance fields of `Plans/FinalGUISpec.md#F3-642`; an unset field falls through to the next layer) | `always`; applies live, never a restart. Writes the tab's own layer, kept in the terminal tab's serialized state (`Plans/storage-plan.md#SP-331`). "All terminals" is not this command: it composes `cmd.settings.transaction.preview` then `cmd.settings.transaction.apply` over the rows of `Plans/Settings_System.md#SSYS-051`; only the Settings transaction writes the project layer | `shell_view` | `none` | `F3-642` | null | none (not a structural change) |
| `cmd.terminal.appearance.import_scheme` | Import scheme... | `file_ref` (one iTerm2, Windows Terminal, kitty, Ghostty, Alacritty, base16 or base24, or Xresources file, at most 256 KB) | `always`; parsed, never evaluated; a failure returns a fixed message that never echoes the file. Adds the scheme to the user's schemes (`SP-331`); choosing it is then `cmd.terminal.appearance.set` or the Settings pair | `domain_action` | `none` | `F3-642` | null | none |

#### Typed local actions of the terminal (no receipt, no event)

| Action id | What it does | Producers |
|---|---|---|
| `ui.terminal.find` | Opens the find bar (regular expressions, case, whole word, highlight all); moving between matches and its toggles stay inside it | header row Find; context menu Find; Ctrl+Shift+F (Cmd+F) |
| `ui.terminal.copy_mode` | Keyboard copy mode | More menu; Ctrl+Shift+X (Cmd+Shift+X) |
| `ui.terminal.quick_select` | Quick-select hints over URLs, paths, hashes and addresses. A hint copies; Shift+hint inserts its text at the prompt through the same input path as typing; Alt+hint opens it through `cmd.file.open` or, for a URL, `cmd.browser.open_workspace_preview` | More menu; Ctrl+Shift+E (Cmd+Shift+E) |
| `ui.terminal.select_all` | Selects the whole buffer | More menu; context menu; Cmd+A on macOS |
| `ui.terminal.copy` | Copies the selection, or a link's path or address | context menu Copy, Copy path, Copy link; Ctrl+Shift+C (Cmd+C) |
| `ui.terminal.paste` | Pastes into the session through the same input path and guard as typing (DL-038, `SMPFS-165`) | context menu Paste; Ctrl+Shift+V (Cmd+V) |
| `ui.terminal.jump_to_command` | Scrolls to the previous or next command, or to the command a sticky header or a scrollbar mark names | Ctrl+Up / Ctrl+Down (Cmd+Up / Cmd+Down); a click on the sticky command header |
| `ui.terminal.mark.copy_command` | Copies the command's text | command-mark menu |
| `ui.terminal.mark.copy_output` | Copies the command's output | command-mark menu |
| `ui.terminal.mark.select_output` | Selects the command's output | command-mark menu |
| `ui.terminal.mark.rerun` | Dispatches `cmd.terminal.rerun` for that command record in the bound session | command-mark menu Rerun |
| `ui.terminal.mark.insert` | Dispatches `cmd.terminal.insert_command` (no Enter), which stays disabled with `command_not_registered` until UCC-160 admits it | command-mark menu Insert command |
| `ui.terminal.mark.open_output` | Dispatches `cmd.panel_tab.open` with an editor buffer spec (`kind: editor`, the command's output as `text`, its command line as `title`, read-only, `mode: keep`); never a preview | command-mark menu Open output in an editor tab |
| `ui.terminal.a11y_buffer` | Opens the plain-text buffer for screen readers | More menu Plain-text buffer; Alt+F2 |
| `ui.terminal.zoom` | Text size Bigger, Smaller or Reset for this terminal, a view zoom over the appearance size; Reset returns to the appearance size | More menu Text size; Ctrl+= / Ctrl+- / Ctrl+0 (Cmd+= / Cmd+- / Cmd+0) |
| `ui.terminal.degauss` | Runs the on-demand Retro degauss once (`Plans/FinalGUISpec.md#F3-643`); nothing under Reduced Motion | Customize screen (F3-650) Degauss, Retro only |
| `ui.terminal.mute_notifications` | Turns this terminal's notifications off or on: that tab's own state, saved with the tab (`Plans/FinalGUISpec.md#F3-641`); a muted terminal raises no system notification. Absent where the platform has no system notifications (added 2026-10-10, DL-187, D38; lead ruling F5) | More menu Mute notifications (a check); the tab menu's Mute notifications, after a hairline; the notification permission notice's Mute this terminal |

Scrolling a page, to the top or to the bottom (Shift+PageUp / Shift+PageDown, Ctrl+Shift+Home / Ctrl+Shift+End) and the find bar's own keys are scrolling and input inside the terminal (SMPFS-183), not actions.

#### Every terminal control, mapped

| Where | Control | Dispatch |
|---|---|---|
| Header row | Find | `ui.terminal.find` |
| Header row | Split | `cmd.workspace_layout.split` with `{ kind: terminal, profile, cwd }` and `direction: auto`; Ctrl+Shift+5 (Cmd+D) |
| Header row | Maximize / Restore | `ui.workspace_layout.maximize` |
| Header row | More (the ⋮ menu) | view-local |
| More menu | New terminal, then a profile (zsh, bash, pwsh, an SSH host) | `cmd.panel_tab.open` with `{ kind: terminal, profile }` and `where: tab` (amended 2026-10-10, DL-187, D39: the submenu lists every installed shell, then, after a hairline, an SSH hosts submenu whose hosts dispatch the same with that host's `profile`) |
| More menu | Split down | `cmd.workspace_layout.split` with the terminal spec and `direction: down` |
| More menu | Appearance... | opens the Customize screen (F3-650; view-local) |
| More menu | Text size: Bigger, Smaller, Reset | `ui.terminal.zoom` |
| More menu | Copy mode / Quick select / Select all | `ui.terminal.copy_mode` / `ui.terminal.quick_select` / `ui.terminal.select_all` |
| More menu | Clear | `cmd.terminal.clear`; Ctrl+Shift+K (Cmd+K) |
| More menu | Clear scrollback | `cmd.terminal.clear_scrollback` |
| More menu | Plain-text buffer | `ui.terminal.a11y_buffer` |
| More menu | Agent input: Ask each time | a state row; dispatches nothing |
| More menu | Agent input: an allowed agent's row | `cmd.terminal.revoke_agent_input` |
| More menu | Mute notifications (a check, between Agent input and Send signal; absent where the platform has no system notifications) | `ui.terminal.mute_notifications` (added 2026-10-10, DL-187, D38) |
| Tab menu | Mute notifications, the terminal kind's row after a hairline | `ui.terminal.mute_notifications` (added 2026-10-10, DL-187, D38) |
| A system notification a program raised (OSC 9, OSC 777 `notify`, OSC 99) | a click | brings the app and that terminal forward: `ui.panel_tab.activate` with `focus: true` on that terminal (added 2026-10-10, DL-187, D38) |
| The notification permission notice (where the platform asks, once, after a notification arrived) | Allow / Mute this terminal / Not now | Allow asks the platform's own permission and dispatches no command; Mute this terminal is `ui.terminal.mute_notifications`; Not now dispatches nothing (added 2026-10-10, DL-187, D38) |
| More menu | Send signal: Interrupt (SIGINT) | `cmd.terminal.interrupt` |
| More menu | Send signal: Terminate (SIGTERM), Kill (SIGKILL) | `cmd.terminal.send_signal` |
| More menu | Restart session | `cmd.terminal.restart_replace` |
| Context menu | Open in editor (a file reference) / Open link (a URL) | `cmd.file.open` / `cmd.browser.open_workspace_preview` |
| Context menu | Copy path, Copy link, Copy | `ui.terminal.copy` |
| Context menu | Paste / Select all / Find | `ui.terminal.paste` / `ui.terminal.select_all` / `ui.terminal.find` |
| Context menu | Clear | `cmd.terminal.clear` |
| Command-mark menu | Header row (the command, its state, duration and who typed it) | dispatches nothing |
| Command-mark menu | Copy command / Copy output / Rerun / Insert command / Open output in an editor tab / Select output | the six `ui.terminal.mark.*` actions above |
| Sticky command header | a click | `ui.terminal.jump_to_command` |
| Links | Ctrl+click (Cmd+click) a file reference | `cmd.file.open` with `mode: preview` |
| Links | Ctrl+double-click | `cmd.file.open` with `mode: keep` |
| Links | Ctrl+Alt+click | `cmd.file.open` with `where: panel` |
| Links | a URL | `cmd.browser.open_workspace_preview`; a plain click only selects text |
| Agent row, Driving | Take over / Interrupt / Stop | `cmd.terminal.take_over` / `cmd.terminal.interrupt` / `cmd.terminal.stop_agent` |
| Agent row, Paused | Hand back / Stop <agent> | `cmd.terminal.hand_back` / `cmd.terminal.stop_agent` |
| Agent row, Permission | Allow once / Allow in this terminal / Deny | `cmd.terminal.allow_agent_input` (`grant: once` / `grant: this_terminal`) / `cmd.terminal.deny_agent_input` |
| Agent row, Secret input | Type it | `ui.panel_tab.activate` with `focus: true` on this terminal |
| Session ended row | Restart / Close tab | `cmd.terminal.restart_replace` / `cmd.panel_tab.close` |
| Close-a-running-terminal row | Close terminal / Keep it open | completes the pending `cmd.panel_tab.close` (its `two_step` confirmation) / cancels it, dispatching nothing |
| Customize screen (F3-650) | This terminal / All terminals switch, scheme search, hovering a scheme (a live preview that Escape reverts), Close | view-local |
| Customize screen (F3-650) | any field, with This terminal | `cmd.terminal.appearance.set` |
| Customize screen (F3-650) | any field, with All terminals | `cmd.settings.transaction.preview` then `cmd.settings.transaction.apply` over SSYS-051's rows |
| Customize screen (F3-650) | Import scheme... | `cmd.terminal.appearance.import_scheme` |
| Customize screen (F3-650) | Background image Choose... | a file picker (view-local); the chosen image is a background value written like any field |
| Customize screen (F3-650) | Degauss (Retro) | `ui.terminal.degauss` |

Keys a focused terminal gives back to the host (the revised terminal SPEC section 3, re-pinned at e741dfbc6c): Alt+1..9, Alt+Shift+1..9, Alt+arrows, Alt+Shift+arrows, Ctrl+PgUp / Ctrl+PgDn, Ctrl+Shift+PgUp / Ctrl+Shift+PgDn, Alt+PgUp / Alt+PgDn (next and previous tab in a browser, where Chrome keeps Ctrl+PgUp / Ctrl+PgDn), Ctrl+\\ and Ctrl+Shift+\\ (Ctrl+\\ is SIGQUIT in shells; a program that needs it gets it from Send signal), Shift+Escape, Ctrl+Shift+Space, Ctrl+Shift+\`, Ctrl+Tab, and the web client's stand-ins Alt+T, Alt+W, Alt+Shift+T and Alt+\`. Every other Ctrl+key belongs to the shell (Ctrl+W, Ctrl+K, Ctrl+T and the rest). The host takes F6 and Shift+F6 before the terminal sees them (the region cycle above), and ignores keys during IME composition (terminal SPEC e741dfbc6c). The shell loses zsh's Alt+digit arguments, Alt+arrow word moves (Ctrl+Left and Ctrl+Right still move by word) and Alt+T / Alt+W; that is the accepted cost.

#### Retired terminal ids

| Retired id | Replacement | Reason |
|---|---|---|
| `cmd.terminal.move_workgroup` | `cmd.panel_tab.move` | no workgroups or sections (DL-181) |
| `cmd.terminal.reattach_section` | none | no detached sections; a terminal tab moves with `cmd.panel_tab.move` |
| `cmd.terminal.detach_section` | none | the same |
| `cmd.terminal.detach` | none; `cmd.panel_tab.move` moves the tab | no tab pops out of the window in this redesign (only the chat does, UCC-203); the concept bars terminal pop-out |
| `cmd.terminal.split_pane` | `cmd.workspace_layout.split` with `{ kind: terminal, profile, cwd }` | no splits inside a terminal |
| `cmd.terminal.add_leaf` | `cmd.workspace_layout.split` with the terminal spec | the same |
| `cmd.terminal.move_pane` | `cmd.panel_tab.move` | no panes |
| `cmd.terminal.close_pane` | `cmd.panel_tab.close` (closing a terminal tab ends its session after its close check) | no panes |
| `cmd.terminal.new_tab` | `cmd.panel_tab.open` with `{ kind: terminal, profile? }` | the "+" menu, Ctrl+Shift+\` and the More menu's New terminal |
| `cmd.terminal.activate_workgroup`, `cmd.terminal.activate_subtab` | `ui.panel_tab.activate` | no workgroups or sub-tabs |
| `cmd.terminal.reorder_workgroup`, `cmd.terminal.reorder_subtab` | `cmd.panel_tab.move` | the same |
| `cmd.terminal.move_tab_to_section` | `cmd.panel_tab.move` | no sections |
| `cmd.terminal.embed_in_editor`, `cmd.terminal.remove_from_editor`, `cmd.terminal.undock_all_from_editor` | `cmd.panel_tab.move` | no editor terminal stack: a terminal is a tab in any panel |
| `cmd.terminal.rename_tab` | `cmd.panel_tab.rename` | one rename for every kind |
| `cmd.terminal.pin_tab` | `cmd.panel_tab.pin` / `cmd.panel_tab.unpin` | one pin for every kind |
| `cmd.terminal.close_tab` | `cmd.panel_tab.close` | one close for every kind |
| `cmd.terminal.restart_session` | `cmd.terminal.restart_replace` | UCC-202 |
| `cmd.terminal.focus_session` | alias of `cmd.terminal.focus` | UCC-202 |

The Home producers `home.terminal_section.new_section` (which dispatched `cmd.terminal.move_workgroup`), `home.terminal_section.move_workgroup`, `home.terminal_section.split_pane`, `home.terminal_section.bottom_toggle` and `home.more_options.collapse_bottom` retire with sections and the bottom terminal; `cmd.workspace_layout.set_collapsed` survives as Collapse to tabs on any panel. The fourteen terminal ids that exist only in `Plans/Wiring_Matrix.md`'s terminal table (`new_tab`, `activate_workgroup`, `activate_subtab`, `reorder_workgroup`, `reorder_subtab`, `add_leaf`, `embed_in_editor`, `remove_from_editor`, `undock_all_from_editor`, `move_tab_to_section`, `rename_tab`, `pin_tab`, `close_tab`, `detach_section`, each under `cmd.terminal.`) are all retired here with the replacements above; none is promoted to a catalog row.

ContractRef: ContractName:Plans/Decision_Log.md#DL-181, ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md#SMPFS-180, ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md#SMPFS-182, ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md#SMPFS-183, ContractName:Plans/FinalGUISpec.md#F3-640, ContractName:Plans/FinalGUISpec.md#F3-646, ContractName:Plans/Contracts_V0.md#CV-362

### UCC-201 - Terminal Commands Re-Scoped To One Session Per Tab

```yaml
plan_unit_id: UCC-201
unit_type: command_contract
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: >-
  The terminal is one session per tab (DL-181, SMPFS-180), so a terminal tab is opened, moved, closed,
  renamed and pinned by the cmd.panel_tab.* commands and split by cmd.workspace_layout.split with a
  terminal spec, and every command that addressed a section, workgroup, sub-tab, pane or the editor's
  terminal stack retires: cmd.terminal.move_workgroup, cmd.terminal.reattach_section,
  cmd.terminal.detach_section, cmd.terminal.detach, cmd.terminal.split_pane, cmd.terminal.add_leaf,
  cmd.terminal.move_pane, cmd.terminal.close_pane, cmd.terminal.new_tab, the workgroup and sub-tab
  activate and reorder ids, cmd.terminal.move_tab_to_section, the editor terminal stack trio,
  cmd.terminal.rename_tab, cmd.terminal.pin_tab and cmd.terminal.close_tab, each with the replacement this
  addendum names; none of the fourteen ids that existed only in the Wiring_Matrix terminal table is
  promoted. The Home producers new_section, move_workgroup, split_pane, bottom_toggle and collapse_bottom
  retire. Kept: cmd.terminal.open (reveals the exact session's tab, or opens it through the one opening
  module), cmd.terminal.show, cmd.terminal.focus (no pane argument), cmd.terminal.rerun,
  cmd.terminal.restart_replace, cmd.terminal.terminate_session, cmd.terminal.kill_session,
  cmd.terminal.clear_scrollback (now with its row) and DL-035's six candidates. cmd.terminal.reveal
  reveals the session's tab wherever it is, never the bottom panel. New rows: cmd.terminal.take_over (a
  human keystroke is the same transition), cmd.terminal.hand_back, cmd.terminal.interrupt (SIGINT to the
  foreground job), cmd.terminal.stop_agent, cmd.terminal.allow_agent_input (grant once or this_terminal),
  cmd.terminal.deny_agent_input, cmd.terminal.revoke_agent_input, cmd.terminal.clear,
  cmd.terminal.send_signal (SIGTERM or SIGKILL), cmd.terminal.appearance.set (This terminal; All terminals
  composes cmd.settings.transaction.preview then cmd.settings.transaction.apply over SSYS-051's rows) and
  cmd.terminal.appearance.import_scheme. Allow in this terminal decides who may type, never what may run.
  Typed local actions: ui.terminal.find, ui.terminal.copy_mode, ui.terminal.quick_select,
  ui.terminal.select_all, ui.terminal.copy, ui.terminal.paste, ui.terminal.jump_to_command,
  ui.terminal.mark.copy_command, ui.terminal.mark.copy_output, ui.terminal.mark.select_output,
  ui.terminal.mark.rerun (dispatches cmd.terminal.rerun), ui.terminal.mark.insert (dispatches
  cmd.terminal.insert_command), ui.terminal.mark.open_output (dispatches cmd.panel_tab.open with an editor
  buffer spec), ui.terminal.a11y_buffer, ui.terminal.zoom and ui.terminal.degauss. Every control of the
  header row, the More menu, the context menu, the command-mark menu, the agent row, the ended and closing
  rows, links and the Customize screen (F3-650) maps to one of these as the mapping table says, and a
  focused terminal gives the host keys back as that table lists. Amended 2026-10-10 (DL-187; D34, D38,
  D39; lead ruling F5): Mute notifications, in the More menu and at the end of the tab's menu, is the
  typed local action ui.terminal.mute_notifications, that tab's own state saved with the tab, absent where
  the platform has no system notifications; the permission notice's Mute this terminal dispatches it too,
  its Allow asks the platform and Not now dispatches nothing; a click on a system notification brings the
  terminal forward with ui.panel_tab.activate. New terminal lists every installed shell, then an SSH hosts
  submenu, each a cmd.panel_tab.open with its profile. No command sets a terminal tab's colour or icon
  (D34).
gui_related: true
gui_classification_reason: "Owns the command ids and local actions of every terminal tab control and retires the section, workgroup and pane commands."
split_recommended: false
depends_on: [DL-181, DL-183, DL-187, SMPFS-180, SMPFS-182, SMPFS-183, F3-640, F3-641, F3-642, F3-646, CV-362, UCC-160, UCC-200]
unblocks: [WM-091, UIW-042, ATS-076]
acceptance_criteria:
- No catalog row, wiring row or producer addresses a terminal section, workgroup, sub-tab, pane or editor terminal
  stack; each retired id resolves to the replacement in the retired-id table.
- cmd.terminal.reveal, cmd.terminal.open, cmd.terminal.show and cmd.terminal.focus find the session's tab wherever
  it is and never spawn a duplicate shell or assume a bottom panel.
- Every More menu, context menu, command-mark menu, agent row, ended row, closing row, link and Customize screen
  (F3-650) control maps to exactly one command or typed local action in the mapping table.
- Send signal's Interrupt and the agent row's Interrupt both dispatch cmd.terminal.interrupt; cmd.terminal.send_signal
  carries only SIGTERM or SIGKILL.
- cmd.terminal.allow_agent_input never bypasses the Tools policy engine or a secret prompt, and an agent's write
  after a human keystroke is refused as preempted.
- The appearance All terminals choice composes the Settings transaction pair and never dispatches cmd.terminal.appearance.set.
- No terminal command adds an event family; only commands that add, close or move a tab emit workspace.layout_changed.
- Mute notifications in the More menu, the tab menu and the permission notice dispatches only ui.terminal.mute_notifications,
  with no command, receipt or event, and is absent where the platform has no system notifications.
- No command or control sets a terminal tab's colour or icon.
validation_surfaces:
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-plans-verify.py validate-wiring-matrix
risk_class: home_panels_terminal_redesign_drift
reasoning_tier: high
context_scope: home_panels_terminal
implementation_surfaces:
  - Plans/UI_Command_Catalog.md
  - Plans/Commands_System.md
  - Plans/Wiring_Matrix.md
  - Plans/Wiring_Matrix.production.json
  - Plans/Wiring_Matrix.production.exclusions.json
node_compile_hint:
  mode: gui_promotion_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Plans/Decision_Log.md#DL-181"
  - "Plans/Decision_Log.md#DL-183"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/DECISIONS.md (SHA-256 0d2b45466c91734e15fd8659e9a8e3b17b70d92be785421e57e084dc8daf6b64; D11 to D13, D15, D18, D19)"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/canon-inputs/terminal-SPEC-ac63b1f467.md (SHA-256 4e3b5aabb4e41fed43d338a1b8c852b752b5860277f2058332575ba3953dbc8b; sections 1 to 3 and 8; concept lineage only)"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/plans-terminal-audit.md (SHA-256 12f95fa6f79b1c0a1f9f34b1eee004cac9edacfd8e0a7f4e6495fe1af23aabe3; Catalog vs wiring)"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/canon-inputs/terminal-SPEC-e741dfbc6c.md (SHA-256 5fe7d1e04e5e54c47013c503254527265b94420239772ac711f760f43f96674d; R36; concept lineage only)"
  - "Plans/Decision_Log.md#DL-187"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/canon-inputs/followup/terminal-SPEC-01c5e78c42.md, SHA-256 a0723f6663990723fc8bd879610c8dedcf2ef6b19a467a2d5c1e1c6d183aabfc (sections 1 and 2: notifications, the More menu, the \"+\" menu's shells; concept lineage only)"
preserved_exact_tokens:
  - "ui.terminal.mute_notifications"
  - "Mute notifications"
  - "cmd.terminal.take_over"
  - "cmd.terminal.hand_back"
  - "cmd.terminal.interrupt"
  - "cmd.terminal.stop_agent"
  - "cmd.terminal.allow_agent_input"
  - "cmd.terminal.deny_agent_input"
  - "cmd.terminal.revoke_agent_input"
  - "cmd.terminal.clear"
  - "cmd.terminal.clear_scrollback"
  - "cmd.terminal.send_signal"
  - "cmd.terminal.appearance.set"
  - "cmd.terminal.appearance.import_scheme"
  - "cmd.terminal.reveal"
  - "ui.terminal.find"
  - "ui.terminal.copy_mode"
  - "ui.terminal.quick_select"
  - "ui.terminal.mark.rerun"
  - "ui.terminal.mark.open_output"
  - "ui.terminal.a11y_buffer"
  - "ui.terminal.zoom"
negative_constraints:
  - "Do not re-add a command that addresses a terminal section, workgroup, sub-tab, pane, the bottom panel or the editor terminal stack."
  - "Do not give a terminal tab its own move, close, rename, pin or activate id; those are cmd.panel_tab.* and ui.panel_tab.activate."
  - "Do not add any AI command to the terminal (DL-181): no explain, fix, suggest or ask."
  - "Do not let a write grant decide what may run, or reach a secret prompt."
  - "Do not mint a second SIGINT id or a second restart id."
compatibility_only_notes:
  - "cmd.terminal.focus_session is recorded alias metadata of cmd.terminal.focus (UCC-202)."
stale_retired_dispositions:
  - "Amended 2026-10-10 (R36, terminal SPEC e741dfbc6c): The given-back key list this addendum records adds Alt+PageUp and Alt+PageDown, and says the host takes F6 and Shift+F6 before the terminal sees them and ignores keys during IME composition."
  - "Retired 2026-10-09 (DL-181): the section, workgroup, sub-tab, pane, detach and editor-terminal-stack ids and the five Home terminal producers, each with the replacement in this addendum's retired-id table."
  - "Amended 2026-10-09 (DL-181): cmd.terminal.reveal reveals the session's tab wherever it is, replacing UCC-115's bottom panel."
  - "Amended 2026-10-10 (lead ruling L16): the popover's All terminals is enabled and writes the project layer through the Settings transaction, so the cmd.terminal.appearance.set row says only the Settings transaction writes the project layer (it said only Settings)."
  - "Amended 2026-10-10 (DL-187; D34, D38, D39; lead ruling F5): Mute notifications is the typed local action ui.terminal.mute_notifications in the More menu, the tab menu and the permission notice; a notification's click brings its terminal forward; New terminal lists every installed shell and an SSH hosts submenu; no terminal tab colour or icon control exists."
owner_hints:
  - Plans/UI_Command_Catalog.md
  - Plans/Commands_System.md
  - Plans/Wiring_Matrix.md
  - Plans/Section15_MVP_Promoted_Features_Spec.md
```

ContractRef: ContractName:Plans/Decision_Log.md#DL-181, ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md#SMPFS-180, ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md#SMPFS-182, ContractName:Plans/FinalGUISpec.md#F3-640, ContractName:Plans/UI_Command_Catalog.md#UCC-160

### Duplicate ids settled

Four pairs of ids named one action each. Each pair now has one canonical id; the other is recorded alias metadata (no handler, row semantics or event of its own) or a retired spelling (no handler and no alias; a caller dispatches the canonical id).

| Pair | Canonical | The other | Reason |
|---|---|---|---|
| `cmd.dashboard.add_widget` / `cmd.widget.add` | `cmd.widget.add`, naming the board in its existing `room` field inside a dashboard tab (WS-030; amended 2026-10-10, DL-186; it read: addressed by `board_id`) and by `page` on the Usage page | `cmd.dashboard.add_widget`: alias of `cmd.widget.add` (`normalization.kind` `alias`, its `dashboard_id` read as the board id carried in `room`; amended 2026-10-10, DL-186) | The dashboard tab runs on the Usage board engine (DL-180), whose family is `cmd.widget.*`; one add serves every board. The alias emits nothing of its own: the production row's `dashboard.widget_added` is withdrawn, and the add is a change to that board's widget layout. |
| `cmd.browser.devtools.open` / `cmd.browser.open_devtools` | `cmd.browser.open_devtools` | `cmd.browser.devtools.open`: alias of `cmd.browser.open_devtools` | The older id is the one Section15, the Wiring_Matrix and UCC-063 use, and UCC-156's alias census missed the pair. The canonical row takes the UCC-156 row's preconditions (`browser_runtime_available && !protected_auth_browser && devtools_policy_allows`: the protected authentication browser is excluded), its `BrowserDevToolsOpenRequest` to `RouteResult` contract and its sole handler `handlers::browser_runtime::devtools_open`. |
| `cmd.terminal.restart_session` / `cmd.terminal.restart_replace` | `cmd.terminal.restart_replace` | `cmd.terminal.restart_session`: retired spelling, not an alias | UCC-115 already called it owner-doc lineage and the production exclusions already exclude it; the Wiring_Matrix toolbar row that dispatched it must dispatch `cmd.terminal.restart_replace` instead (the wiring owner makes that change, WM-092). |
| `cmd.terminal.focus_session` / `cmd.terminal.focus` | `cmd.terminal.focus` | `cmd.terminal.focus_session`: alias of `cmd.terminal.focus` | The 2026-07-02 aliases table allowed exactly this normalization through explicit alias metadata; the Output, Problems and Ports "Show Terminal" link that dispatched it must carry the alias record (the wiring owner makes that change, WM-092). |

ContractRef: ContractName:Plans/Decision_Log.md#DL-180, ContractName:Plans/Decision_Log.md#DL-181, ContractName:Plans/Widget_System.md#WS-030, ContractName:Plans/Commands_System.md#CS-101

### UCC-202 - Duplicate Command Ids Settled

```yaml
plan_unit_id: UCC-202
unit_type: command_disposition
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: >-
  Four duplicate pairs each keep one canonical id. cmd.widget.add is canonical and cmd.dashboard.add_widget is its
  alias (dashboard_id read as the board id; amended 2026-10-10, DL-186); the add names the board in its existing room
  field inside a dashboard tab (WS-030; amended 2026-10-10, DL-186; it read: is addressed by board_id) and uses page
  on the Usage page, and the alias's dashboard.widget_added event is withdrawn. cmd.browser.open_devtools is
  canonical and cmd.browser.devtools.open is its alias; the canonical row takes UCC-156's preconditions (the
  protected authentication browser is excluded), its request and result contract and its sole handler.
  cmd.terminal.restart_replace is canonical and cmd.terminal.restart_session is a retired spelling with no handler
  and no alias. cmd.terminal.focus is canonical and cmd.terminal.focus_session is its alias. An alias is recorded
  metadata only, with no handler, row semantics or event of its own.
gui_related: true
gui_classification_reason: "Settles which id a visible control dispatches where two ids named one action."
split_recommended: false
depends_on: [DL-180, DL-181, DL-186, UCC-036, UCC-063, UCC-108, UCC-115, UCC-156, WS-030]
unblocks: [WM-092]
acceptance_criteria:
  - "Each of the four actions has exactly one handler, under its canonical id."
  - "No production wiring row dispatches cmd.terminal.restart_session; cmd.dashboard.add_widget, cmd.browser.devtools.open and cmd.terminal.focus_session appear only as alias records of their canonical ids."
  - "cmd.browser.open_devtools refuses the protected authentication browser."
  - "No event named dashboard.widget_added is emitted."
validation_surfaces:
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-plans-verify.py validate-wiring-matrix
risk_class: home_panels_terminal_redesign_drift
reasoning_tier: high
context_scope: home_panels_terminal
implementation_surfaces:
  - Plans/UI_Command_Catalog.md
  - Plans/Commands_System.md
  - Plans/Wiring_Matrix.md
  - Plans/Wiring_Matrix.production.json
node_compile_hint:
  mode: gui_promotion_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Plans/Decision_Log.md#DL-180"
  - "Plans/Decision_Log.md#DL-181"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/plans-home-audit.md (SHA-256 f8e65fd64028014e3ee9bebf68594356d40eb5c831975645da6a3406cef2e3e8; section 6.1 findings a.7)"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/plans-terminal-audit.md (SHA-256 12f95fa6f79b1c0a1f9f34b1eee004cac9edacfd8e0a7f4e6495fe1af23aabe3; Catalog vs wiring)"
preserved_exact_tokens:
  - "cmd.widget.add"
  - "cmd.dashboard.add_widget"
  - "cmd.browser.open_devtools"
  - "cmd.browser.devtools.open"
  - "cmd.terminal.restart_replace"
  - "cmd.terminal.restart_session"
  - "cmd.terminal.focus"
  - "cmd.terminal.focus_session"
  - "dashboard.widget_added"
negative_constraints:
  - "Do not give an alias a handler, a production row of its own, or an event."
  - "Do not reintroduce cmd.terminal.restart_session as an alias."
compatibility_only_notes:
  - "cmd.dashboard.add_widget, cmd.browser.devtools.open and cmd.terminal.focus_session are compatibility aliases only."
stale_retired_dispositions:
  - "Amended 2026-10-09 (DL-180): UCC-108's cmd.dashboard.add_widget row and UCC-156's cmd.browser.devtools.open row become aliases; UCC-115's restart_session lineage becomes a retired spelling."
  - "Amended 2026-10-10 (DL-186): the add names a dashboard board in its existing room field, and the alias's dashboard_id is read as that board id; there is no board_id payload field."
owner_hints:
  - Plans/UI_Command_Catalog.md
  - Plans/Commands_System.md
  - Plans/Wiring_Matrix.md
```

ContractRef: ContractName:Plans/UI_Command_Catalog.md#UCC-108, ContractName:Plans/UI_Command_Catalog.md#UCC-156, ContractName:Plans/UI_Command_Catalog.md#UCC-115, ContractName:Plans/Commands_System.md#CS-101

### The chat column's commands

The chat is fixed on the right, from the title bar to the status bar; it is never a tab, never in the split tree and never moved inside the window (`Plans/FinalGUISpec.md#F3-637`). Its commands:

| command_id | Label | Arguments | Availability and disabled reasons | command_kind | Event |
|---|---|---|---|---|---|
| `cmd.panel.switch` | Show the chat / Hide the chat | `panel_id: chat` (the rail's closed vocabulary, unchanged) | `always` | `shell_view` | none (unchanged, UCC-138) |
| `cmd.panel.undock` | Pop out the chat | `panel_id: chat`, `current_host`, `target_window`, `expected_layout_revision`, `idempotency_key` | `capability`: the desktop app only; the web client has no second window, so the row is not offered there (`unsupported`) | `shell_view` | `panel.undocked` |
| `cmd.panel.redock` | Dock the chat back | `panel_id: chat`, `window_id`, `target_host` (the chat column), `expected_layout_revision`, `idempotency_key` | `selection`: the chat is popped out | `shell_view` | `panel.redocked` |
| `cmd.workspace_layout.resize_surface` | Resize the chat | `{ surface: chat, width }`, one commit on release, within the drag range F3-637 sets | `always` | `shell_view` | `workspace.layout_changed` |

Amended 2026-10-10 (DL-187; D32, D40, the planning thread's ruling under D4): the left rail's Chat entry shows or hides the column with `cmd.panel.switch` on every page, never changing the page in front (`Plans/FinalGUISpec.md#F3-042`); a popped-out chat lasts only while the app runs: it is never saved, and after a restart the chat starts in its column, so no `cmd.panel.redock` is dispatched at start; Keep the chat open in narrow windows is the chat's own preference, in the chat header's menu and the title bar's Home options menu, the typed local action `ui.chat_column.keep_open` below, and no longer a Settings write.

Pop out is the chat's only way to move, and it returns to its column. `panel.undocked` and `panel.redocked` stay for the chat's pop-out only. From the home layout `cmd.panel.undock` is dispatched with `chat` and nothing else: no panel, tab or dashboard pops out. The chat is never a `cmd.panel_tab.*` target and never a `cmd.workspace_layout.move_surface`, `split` or `set_collapsed` target; such a dispatch refuses with `invalid_target`. Folding the chat to its edge strip in a narrow window and opening it from there are narrow-ladder states that are never saved (`Plans/FinalGUISpec.md#F3-636`) and dispatch nothing. "Keep the chat open in narrow windows" is a Settings write (UCC-200's Home menu table). Amended 2026-10-10 (DL-187): it is the typed local action `ui.chat_column.keep_open` instead.

Amended 2026-10-10 (lead ruling L9): the History pin is the typed local action below.

| Action id | Arguments | Effect | Producers and keys |
|---|---|---|---|
| `ui.chat_column.pin_history` | `history_pinned` | Saves the v2 record's chat column `history_pinned` as view state with no `workspace.layout_changed` event, like `ui.workspace_layout.maximize` | The History list's pin |
| `ui.chat_column.keep_open` | `keep_open` (on or off) | Keeps the chat open below a centre width of 480 px instead of folding it to its edge strip (`Plans/FinalGUISpec.md#F3-636`, `#F3-637`); the chat's own preference, view state with no receipt, no event and no Settings row; where it is kept is `Plans/storage-plan.md`'s (added 2026-10-10, DL-187) | The chat header's menu; the title bar's Home options menu > Keep the chat open in narrow windows |

Retired chat rows: the chat grab (`home.chat.grab`), dragging the chat into a dock, the dock-left, dock-right, dock-top and dock-bottom targets, the in-canvas float and its corner resize (`home.drop_target.*`, `home.resizer.floating_corner`), and UCC-144's Pop Out into the in-canvas float layer. `home.chat.pop_out` stays as the Pop out producer of `cmd.panel.undock` with `chat`, into a window; `home.resizer.chat` stays as the width producer of `cmd.workspace_layout.resize_surface` with `{ surface: chat, width }`; `home.chat.activity_toggle` stays `cmd.panel.switch` with `chat`.

ContractRef: ContractName:Plans/Decision_Log.md#DL-180, ContractName:Plans/FinalGUISpec.md#F3-637, ContractName:Plans/UI_Command_Catalog.md#UCC-138, ContractName:Plans/Commands_System.md#CS-061

### UCC-203 - The Chat Column's Commands And The Retired Chat Docking Rows

```yaml
plan_unit_id: UCC-203
unit_type: command_contract
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: >-
  The chat column (F3-637) has four commands. Show and hide stay cmd.panel.switch with chat. Pop out is
  cmd.panel.undock with chat into its own window (desktop app only; not offered in the web client) and Dock the chat
  back is cmd.panel.redock with chat, which returns it to its column; panel.undocked and panel.redocked stay for the
  chat's pop-out only. A width drag commits once on release as cmd.workspace_layout.resize_surface with surface chat
  and width, emitting workspace.layout_changed. Pop out is the chat's only way to move. The chat is never a
  cmd.panel_tab.* target and never a move_surface, split or set_collapsed target (invalid_target). From the home
  layout cmd.panel.undock is dispatched with chat only: no panel, tab or dashboard pops out. The chat grab, dragging
  it into a dock, the dock-left, dock-right, dock-top and dock-bottom targets, the in-canvas float and its corner
  resize, and UCC-144's Pop Out into the in-canvas float layer retire. Folding the chat to its narrow edge strip and
  opening it from there dispatch nothing and are never saved.
  ui.chat_column.pin_history is a typed local action (view state); its value is saved in the v2 record's chat column as history_pinned, with no workspace.layout_changed event, revision advance or receipt, like ui.workspace_layout.maximize.
  Amended 2026-10-10 (DL-187; D32, D40, the planning thread's ruling under D4): the left rail's Chat entry shows or
  hides the column with cmd.panel.switch on every page without changing the page; the pop-out is never saved, so
  after a restart the chat starts in its column and nothing is redocked at start; Keep the chat open in narrow
  windows, in the chat header's menu and the title bar's Home options menu, is the typed local action
  ui.chat_column.keep_open, view state with no receipt, no event and no Settings row.
gui_related: true
gui_classification_reason: "Owns the chat column's visible commands and retires the chat docking and floating controls."
split_recommended: false
depends_on: [DL-180, DL-187, F3-637, F3-636, UCC-108, UCC-138, CS-061, UCC-200]
unblocks: [WM-090, UIW-040, PWIZ-035]
acceptance_criteria:
  - "The chat's show and hide dispatch cmd.panel.switch with chat; Pop out and Dock back dispatch cmd.panel.undock and cmd.panel.redock with chat; a width drag dispatches one cmd.workspace_layout.resize_surface with surface chat on release."
  - "No producer moves the chat inside the window, docks it to another side or floats it inside the window."
  - "A cmd.panel_tab.*, move_surface, split or set_collapsed dispatch that names the chat refuses with invalid_target."
  - "No home panel, tab or dashboard dispatches cmd.panel.undock."
  - "The left rail's Chat entry dispatches one cmd.panel.switch with chat on every page and never changes the page; after a restart the chat shows in its column and no pop-out state is restored."
  - "Keep the chat open in narrow windows dispatches only ui.chat_column.keep_open from the chat header's menu and the Home options menu, with no receipt, no event and no Settings transaction."
validation_surfaces:
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-plans-verify.py validate-wiring-matrix
risk_class: home_panels_terminal_redesign_drift
reasoning_tier: high
context_scope: home_panels_terminal
implementation_surfaces:
  - Plans/UI_Command_Catalog.md
  - Plans/Wiring_Matrix.md
  - Plans/Wiring_Matrix.production.json
node_compile_hint:
  mode: gui_promotion_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/canon-inputs/panels-NUMBERS-6026fa8432.md, SHA-256 27ddd358f2c98848e424d7802e753435e09568a9555330884a84c725a844f2c7 (concept lineage only)"
  - "Plans/Decision_Log.md#DL-180"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/DECISIONS.md (SHA-256 0d2b45466c91734e15fd8659e9a8e3b17b70d92be785421e57e084dc8daf6b64; D3)"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/canon-inputs/panels-NUMBERS-407e6fb6fe.md (SHA-256 019721f5215d95c80b999d5b61e1ee4bf79b29afc5b229a12bccde6f738c5162; Commands and keys, Chat; concept lineage only)"
  - "Plans/Decision_Log.md#DL-187"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/canon-inputs/followup/DECISIONS-ADDENDUM-3.md, SHA-256 ecd18c2f2d8ac8f714f9578170d321584fb871e3d19601a68061898ffd6759a9 (D32, D40)"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/canon-inputs/followup/panels-NUMBERS-339203bd76.md, SHA-256 2e2c2a95819842cd5cbcc108ed302460ddea3ed0a98be7dfe4f1b78507660ce6 (the rail's Chat entry; concept lineage only)"
  - "The planning thread's ruling of 2026-10-10 (pm-mail 1010211322-7b6c): the narrow-window pin lives on the chat's header menu, not in Settings"
preserved_exact_tokens:
  - "ui.chat_column.keep_open"
  - "ui.chat_column.pin_history"
  - "history_pinned"
  - "workspace.layout_changed"
  - "cmd.panel.switch"
  - "cmd.panel.undock"
  - "cmd.panel.redock"
  - "panel.undocked"
  - "panel.redocked"
  - "invalid_target"
negative_constraints:
  - "Do not add a chat move, dock or in-window float command or producer."
  - "Do not make the chat a panel tab or a split-tree surface."
  - "Do not dispatch cmd.panel.undock for a home panel, tab or dashboard."
compatibility_only_notes: []
stale_retired_dispositions:
  - "Amended 2026-10-10 (R35, panels NUMBERS 6026fa8432): Saves History pin as view state with no layout event, revision advance or receipt."
  - "Amended 2026-10-10 (lead ruling L9): Registers the History pin as ui.chat_column.pin_history, writing history_pinned as view state without a workspace.layout_changed event."
  - "Amended 2026-10-10 (DL-187; D32, D40, the planning thread's ruling under D4): the rail's Chat entry toggles the column on every page, the pop-out is never saved, and Keep the chat open in narrow windows becomes the typed local action ui.chat_column.keep_open instead of a Settings write."
  - "Retired 2026-10-09 (DL-180): the chat grab, the dock drop targets, the in-canvas float and its corner resize, and UCC-144's Pop Out generalization to editor panels, Chat and Dashboard."
owner_hints:
  - Plans/UI_Command_Catalog.md
  - Plans/Wiring_Matrix.md
  - Plans/FinalGUISpec.md
```

ContractRef: ContractName:Plans/Decision_Log.md#DL-180, ContractName:Plans/FinalGUISpec.md#F3-637, ContractName:Plans/UI_Command_Catalog.md#UCC-138, ContractName:Plans/Commands_System.md#CS-061

### UCC-204 - Editor Appearance And Shared Control Dispatch

```yaml
plan_unit_id: UCC-204
unit_type: requirement
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: >-
  cmd.editor.appearance.set is a shell_view command with normalization.kind none,
  normalizes_to_contract F3-651 and no alias. Its typed request/result are
  Plans/editor_appearance.schema.json; it changes only an existing editor tab's sparse appearance
  fields under the Project/workspace context and owner-state guard. A null field clears its
  override; a token-map null entry clears that key, revealing the next layer. Reset and quick sets
  are one atomic patch, never one dispatch per field. The result is a bounded
  applied/no_change/refused/failed receipt with owner readback, no domain event and no
  workspace.layout_changed. No Project returns no_project_context and no write. All editors and All
  terminals, Settings fields, wallpaper selection and resetting those Project values compose the
  existing cmd.settings.transaction.preview and cmd.settings.transaction.apply with exact inventory
  ids; the same CAS/permission/readback rules apply and no app-global fallback is admitted. This
  terminal retains cmd.terminal.appearance.set and import retains
  cmd.terminal.appearance.import_scheme. CS-102 and WM-093 enumerate typed local affordances and
  producer bindings; local previews never run a shell command or modify a real file. No new shortcut
  is added for Customize: More, Open Customize and Indentation are keyboard-reachable entry points.
  Panel split/move keys retain UCC-200's Alt+Shift+arrows; the earlier concept Ctrl+Alt claim is
  retired. Notification toast dismissal is view-local and moves a lasting notice into the inbox
  without resolving it; inbox dismissal uses cmd.alert.dismiss, and Clear all composes that existing
  command for the captured eligible ids/revisions, preserving truthful per-item refusals and keeping
  arrivals after the capture. Existing notice action commands retain domain approval semantics. This
  unit creates no bulk resolve or dismiss-all command. The retired visible app-theme preview has no
  producer: cmd.theme.preview is retired, not an alias of cmd.settings.transaction.preview. Legacy
  requests cannot open a timed theme trial or create a preview receipt. Activated theme changes
  retain SSYS-010’s internal Settings transaction; code-scheme previews remain CS-102’s typed local
  actions. Saved terminal preset Apply reuses cmd.terminal.appearance.set for This terminal and the
  existing Settings preview/apply pair for All terminals. Its replacement adapter takes the complete
  terminal reset_ids from Plans/appearance_quick_sets.json: This sends saved values plus null for
  omitted ids; All sends saved values plus inventory defaults for omitted ids in one set preview. It
  never runs reset and apply as two commits. Save, Rename, Delete and Undo are
  ui.terminal.preset.save, ui.terminal.preset.rename, ui.terminal.preset.delete and
  ui.terminal.preset.undo, local library actions owned by F3-650/SP-331. There is no cmd.* preset
  family, per-preset command, new event or shortcut. Picker Back remains CS-100's local navigation.
gui_related: true
gui_classification_reason: Editor appearance and shared control dispatch.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- A This editor patch cannot change another tab, Project setting, file or structural layout revision.
- Each durable producer maps to the one writer for its selected scope; no local action also has a catalog command
  row.
- Clear all cannot resolve a domain condition, clear new arrivals or hide a refused dismissal.
validation_surfaces:
- python3 scripts/pm-shard-plans.py --check
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-plans-verify.py run-gates
risk_class: owner_drift
reasoning_tier: high
context_scope: editor_appearance_and_shared_control_dispatch
implementation_surfaces:
- Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: doc_standardized_planunit
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- /mnt/Cursor/share/puppet-master/2026-10-14-editor-customizer/PROPOSAL-canon.md, SHA-256 8b8f3179c3970cb165e4fb4722eb02381f0456faad235c4330207d2bec5f5431
  (approved campaign source lineage; not native implementation evidence)
- /mnt/Cursor/share/puppet-master/2026-10-13-notifications/NOTES.md, SHA-256 f09d2b8856652950762b6580b8ebab43022bdf053272738f52720de25922a895
  (approved campaign source lineage; not native implementation evidence)
- /mnt/Cursor/share/puppet-master/2026-10-13-panel-dnd-resize/NOTES.md, SHA-256 03a80f0dea3235ea637149bbec63626c4a4be8521078f9dd601f2b691f03d2d6
  (approved campaign source lineage; not native implementation evidence)
- Plans/Commands_System.md#CS-102
- Plans/Wiring_Matrix.md#WM-093
- Plans/Settings_System.md#SSYS-009
- Plans/storage-plan.md#SP-333
- /mnt/Cursor/share/puppet-master/2026-10-16-plans-pass2/sources/2026-10-14-terminal-round3--LANDING.md,
  SHA-256 4d6556ff98168f22719c5d401c4e677d5d380d2ef370b67a838cb3aa45301c2d (source lineage; not native
  certification)
- /mnt/Cursor/share/puppet-master/2026-10-16-plans-pass2/sources/2026-10-15-panels-picker-back--NOTES.md,
  SHA-256 29bac44f166cb8e0e67f4f00634cb15d0a3be576eb2f68e7e19606f3a4a1a71c (source lineage; not native
  certification)
preserved_exact_tokens:
- cmd.editor.appearance.set
negative_constraints: []
owner_hints:
- Plans/UI_Command_Catalog.md
```

ContractRef: ContractName:Plans/Commands_System.md#CS-102, ContractName:Plans/Wiring_Matrix.md#WM-093, ContractName:Plans/Settings_System.md#SSYS-009, ContractName:Plans/storage-plan.md#SP-333

| command_id | Label | Arguments | Preconditions | command_kind | normalization.kind | normalizes_to_contract | alias_of_command_id | Event |
|---|---|---|---|---|---|---|---|---|
| `cmd.editor.appearance.set` | Customize this editor | `project_id`, `workspace_tab_id`, `panel_tab_id`, `expected_state_hash`, `idempotency_key`, `fields` (strict field patch; null clears) | Current Project and existing editor tab, matching saved-state hash, permitted write, serialized state within SP-330 bound; schema `Plans/editor_appearance.schema.json#/$defs/request` | `shell_view` | `none` | `F3-651` | null | none; nonstructural receipt |
