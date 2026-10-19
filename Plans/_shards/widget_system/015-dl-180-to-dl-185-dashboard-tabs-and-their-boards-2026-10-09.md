# Shard 015: DL-180 to DL-185 — Dashboard Tabs And Their Boards (2026-10-09)

Source: `Plans/Widget_System.md`

Source lines: L1759-L2065

Source SHA256: `db30f1ae130c83d289a9fb65d96b33a32fa853b3bcd321c3d0d1334857432214`

---

## DL-180 to DL-185 — Dashboard Tabs And Their Boards (2026-10-09)

Jared's home redesign (`Plans/Decision_Log.md#DL-180`, decision D10) makes the dashboard a tab kind in the universal
panels: several dashboard tabs may be open, each showing one board with its own widget layout, and a board can show
every Usage widget. This addendum adds WS-030, which owns the boards, their widget-layout namespaces, the catalogue and
the move of today's one Dashboard layout into the Home board. How a dashboard tab looks in its panel is
`Plans/FinalGUISpec.md#F3-638`; the tab kind is `#F3-635`; the open rules are `#F3-634`. It amends WS-009 (one
namespace per board), WS-013 (every Usage widget) and the PMConcept7 Home Workspace boundary addendum (panels, dashboard
tabs and one gesture kit) with dated notes, and the section 2 and 3 rules that named one Dashboard namespace. It cites
and does not edit WS-017 and WS-019, which the Usage thread is amending (`Plans/Decision_Log.md#DL-176`), and adds only
one dated sentence at the end of WS-020's canonical text for the per-board namespace and the v2 Home record. It
creates no WorkNodes, NodeSeeds, executable queues, implementation files or production build tasks.

Amended 2026-10-10 (DL-186): Jared answered the dashboard questions (D10 P1 to P13) and let people make, rename and
delete their own dashboards with presets they can save (D35). WS-030 is rewritten to the boards as the panels thread
built them: one Usage board engine for every board, per-project keys, several widget sources, Reset and Start from
with `set_id`, per-user presets, custom dashboards, the reopen-list rule and named-layout snapshots. At the Usage
thread's request this addendum also amends WS-019 (gravity, Tidy and the live previews on every board; the Dashboard
line that kept its own settlement and its frozen-peer resize retire) and WS-020 (the dashboard record's `host_id` and
`room_id`), and adds dated notes to WS-009, WS-013, sections 2 and 3, the closed record above WS-020 and the Home
Workspace boundary addendum. `Plans/usage-feature.md#UF-107` carries the one line that runs live readings on
dashboards.

### WS-030 - Dashboard Tabs, Their Boards And One Widget Layout Per Board

```yaml
plan_unit_id: WS-030
unit_type: requirement
status: accepted
owner_doc: Plans/Widget_System.md
canonical_text: >-
  A dashboard is a tab kind in the home centre (Plans/FinalGUISpec.md#F3-635, #F3-638), and each dashboard tab shows
  one board (DL-180, D10). Rewritten 2026-10-10 (DL-186): Jared's answers to the dashboard questions P1 to P13 and
  D35 settle the boards as the panels thread built them. One engine: every board except Agents is a board of the
  Usage board engine, the engine the Usage page runs, one board per tab; there is no second dashboard engine, board
  model or settlement. Boards: home, metrics and monitoring are built-in engine boards; agents is the fourth built-in
  board, drawn by the dashboard kind itself with no widget store, no catalogue and no widget command, its Show filter
  (all, working, needs, waiting, done) saved with its tab (P9, lead ruling F7); the dashboards a person makes are
  dash-<n>. A board is a project's widget board with a stable board_id; its tab id is `dashboard:<board_id>`, and one
  board is at most one tab in the workspace: opening a board that is already open reveals its tab where it is
  (F3-634). The board id, never the tab id, is the domain
  reference a dashboard tab keeps in the Home layout record (Plans/storage-plan.md#SP-330); the tab saves only that, and
  Agents its Show filter too. No board takes the id usage (the Usage page's own board), the id dashboard or a Usage room id,
  so a board id in a widget command is never read as a Usage room. `dashboard:home` is the default board, the pinned
  Home dashboard of the default layout (F3-630). The "+" menu's Dashboard row body opens or reveals `dashboard:home`, and its sub-row
  lists Home, Metrics, Monitoring, Agents, this project's own dashboards by name and New dashboard, with no cap
  (Plans/UI_Command_Catalog.md#UCC-200).
  Custom dashboards (D35): a person can make, rename and delete their own dashboards. New dashboard, in that sub-row
  and in the tab's Board menu, opens a new board in a new tab through the one opening module (UCC-200); the board
  takes the next unused number and starts empty (P13). Its name is "Dashboard <n>" until the person renames it. The
  name is kept per project with the board, trimmed, with runs of white space made one, at most 80 characters, and the
  default name is not stored. Rename dashboard... in the Board menu sets the name and renames the tab through
  cmd.panel_tab.rename; renaming the tab sets the name too, and clearing that rename clears it. Delete dashboard...,
  after a confirm, closes the tab (cmd.panel_tab.close), drops it from the reopen list and forgets the board: its
  stored widgets, the set-aside copy of an unreadable envelope and its name; the dashboard also leaves the "+" menu
  and the page's catalogue. Rename and delete add no command family. Home, Metrics, Monitoring and Agents are never
  renamed as boards and never deleted: Home, Metrics and Monitoring offer Reset widgets, and Agents, which has no
  widgets, resets only its filter.
  Storage (P5): board contents are kept per project. Each engine board's widgets, their sizes, order, visibility and
  configuration, its view (range and scope) and the set it was started from are one envelope of the one widget-layout
  record family (WS-020) under `widget_layout:v1:<project_id>:<board_id>`, and an envelope that cannot be read is set
  aside under that key with `:quarantine` added. The project_id is one to 64 characters with no white space and no
  colon. The envelope's `host_id` is `home.dashboard`, its project_id is the board's real project and each record's
  `room_id` is the board id; the Usage page keeps its own `widget_layout:v1:usage`, untouched. A project switch
  writes the open boards to the old project's keys and loads them from the new project's. A board saved by the
  concept's first build of these boards under the unscoped `widget_layout:v1:<board_id>` is adopted once, by the
  first project that shows that board while its own key is missing, and the old key is removed. Plans/storage-plan.md
  registers both families and the adoption. The 2026-10-09 form
  `widget_layout:v1:dashboard:<board_id>`, with `host_id` `dashboard:<board_id>`, was never written, so nothing
  migrates from it. Today's single Dashboard layout `widget_layout:v1:dashboard` holds the old Home widgets, which
  leave Home (P1); it is converted into no board and stays only a read-only record and rollback backup, like
  `dashboard_layout:v1`. A board's widget layout is never written into the Home layout record, and the Home layout
  record is never written by a widget operation (DR-066).
  Commands and sources (P3): widget command payloads are unchanged. Every cmd.widget.* row inside a dashboard tab
  names its board in the payload's existing `room` field (for example cmd.widget.add { room, widget_id } with room the
  board id), changes only that board, commits only to its key and emits no `workspace.layout_changed`, which stays the
  Home layout's event (Plans/Contracts_V0.md#CV-361). Home's panels, tabs and chat column are not widgets: no panel or
  tab command reaches a board, no cmd.widget.* row reaches a panel or tab, and a widget gesture never moves or sizes a
  panel (DR-066). Boards, their catalogue and the layout record are built for several widget sources: a widget's
  source is the prefix of its id (`<source>:<id>`), Usage widgets keep their bare ids, and the engine keeps one
  registry of sources, each with its label, its catalogue and the way its widgets are built. Usage is the one source
  today; Orchestrator widgets join as a source after the Orchestrator page's own redesign and follow this same kind
  contract, and other sources may follow.
  Catalogue: Add widget sits in the tab's header row (F3-635) and offers every widget the board can be given: one
  section per Usage room in room order, then the Usage widgets of no room, then one section per other source under its
  label. A widget already on the board shows checked and cannot be added again; a pick adds it to that board only
  (cmd.widget.add). Any Usage widget can be placed on any board (Plans/usage-feature.md#UF-062 wins over the
  four-widget catalogue of F3-279, which F3-638 supersedes). The old Home widgets, `widget-orchestrator-progress`,
  `widget-active-lanes`, `widget-recent-results` and `widget-custom-metrics`, leave Home (P1, option B): no board
  offers them and no Home (current) board keeps them until Orchestrator widgets join as a source.
  Reset and Start from (P4): Reset widgets returns a board to its own default set through cmd.widget.reset_layout
  { scope: 'room', room: <board_id> }. Start from replaces a board's widgets with a chosen set through the same command
  with the field `set_id` naming it: { scope: 'room', room: <board_id>, set_id }. The sets, in the order the board
  lists them: `default`, the board's own set (for Home, Metrics and Monitoring the set built for that board, P13, and
  empty for a dashboard a person made); the 13 Usage room sets, `room:<room_id>` in Usage room order (overview,
  plans, costs, accounts, free, context, analytics, ledger, attention, cache, tools, signals, authority);
  `host:dashboard`, the dashboard starter; then `user:<preset_id>` for each preset the person saved. Start from shows
  them in four groups, in this order: This dashboard (`default`), Dashboard starter (`host:dashboard`), Usage rooms
  (the 13 room sets in room order) and Your presets (Plans/FinalGUISpec.md#F3-638). Which Usage widgets Home's,
  Metrics' and Monitoring's own sets hold is Usage content that usage-feature.md owns; no Usage unit lists them yet,
  so the sets as built are concept lineage only and naming them is an open question for Usage. A reset with no
  set_id is the default set. The envelope keeps the set_id of any set other than default. Choosing a set that no
  longer exists changes nothing and says so.
  Amended 2026-10-10 (lead ruling on the Undo after Start from): the Undo in the notice that follows Start from
  (Plans/FinalGUISpec.md#F3-638) dispatches cmd.widget.reset_layout { scope: 'room', room: <board_id>,
  restore_revision }, restore_revision being the board's committed layout revision (its committed_revision, WS-020)
  just before that Start from: one receipt, offered only while the notice is up (8 s, held on pointer or focus).
  restore_revision and set_id never travel together. The owner puts back exactly that revision's records, and a restore is refused without dispatch when any other change was committed on the board since, except the preset hold's settling resizes, and Undo is disabled with its reason. Like every widget
  command it emits no workspace.layout_changed (Plans/Contracts_V0.md#CV-361).
  Presets (D35, Jared: "With savable presets."): a person can save a board's arrangement as their own preset, rename
  it and delete it. Presets belong to the person, not the project: they are kept in the per-user family
  `widget_presets:v1` and shown in Start from on every dashboard of every project. A preset holds its id, its name,
  when it was saved, the board it was saved from, the layout of the widgets shown at each board class (S, M, L and XL,
  WS-017), each widget's size preset and each widget's configuration; it never holds the board's view. A name is
  trimmed, with runs of white space made one, at most 80 characters; the save offers the dashboard's name made
  unique, and a preset with no name is called "Preset <n>". Saving, renaming and deleting a preset are typed local
  actions with no command, receipt or event (ui.widget_preset.save, ui.widget_preset.rename, ui.widget_preset.delete;
  lead ruling F2); applying one is Start from with set_id `user:<preset_id>`. A board that started from a preset keeps
  its widgets when the preset is deleted.
  View (P2): each board has its own range (5 hours, 24 hours, 7 days or 30 days) and scope (all accounts, work,
  personal, or one provider with accounts), kept in its envelope and set from its Board menu. Changing them is view
  state, the typed local action ui.widget_board.set_view with no receipt and no event (lead ruling F1), like the Usage
  page's remembered Live / Paused. A widget that follows its board reads the board's range and scope; a range or scope
  set in a widget's own configuration still wins, as it does over the page's on the Usage page
  (Plans/usage-feature.md#UF-060; D10 design section 3.5). A board has no rooms and no room change, and it shows every
  widget placed on it at every disclosure level.
  Behaviour: inside the tab the board is the Usage widget board, the same on every board as on the Usage page: its
  snapping grid and its track count from the board's own measured width, never the window (F3-638); its curated sizes
  and size presets (WS-017, WS-018); its gestures, gravity and Tidy, each one settled transaction (WS-019, which DL-186
  amends so that no dashboard keeps its own settlement). The per-kind preset table tested at 400, 550 and 700 px of
  board width is WS-017's one per-kind preset table (DL-176). One widget transaction at a time holds across every
  board on the page. A board's first show plays the Usage board's calm
  reading-order entrance, instant under Reduced Motion (P7); a board has no room film. Boards sit on Home's own tab
  surface, not the Usage page's ground, and every look's widget plates are drawn for that surface (P11, F3-638). Live
  readings run on dashboards too, per board, under the Usage page's idle rule, and the Live choice is the Usage
  page's one switch (P12, Plans/usage-feature.md#UF-107). The lab-only Play the next hour, which P12 also runs on
  dashboards, stays a demo control as UF-107 classifies it, never a product behaviour, so no criterion of this unit
  gates it. A board that is not shown does no work,
  live beats included, and catches up when it is shown again. Details on a dashboard card opens the Usage page at the
  widget's home room with that widget's inspector open (P8), and a card's rows that lead into a Usage room open the
  Usage page at that room; neither changes the Usage page out of sight.
  Closing and named layouts (P6): closing a dashboard tab closes the tab only, and its board keeps its key while the
  tab can be reopened. When a dashboard a person made leaves the reopen list and is not open as a tab, its key, its
  set-aside copy and its name are deleted; the built-in boards keep theirs. A named layout keeps the boards of the
  dashboard tabs it holds: saving it snapshots each board's envelope, or none, and applying it restores them, while a
  named layout saved before this applies as it did. The snapshot is capped at 64 KB per named layout (lead ruling F3):
  a bigger save keeps the layout without its boards, records how many bytes it left out and says so;
  Plans/storage-plan.md#SP-330 owns that record. The Guided Tour's snapshots take the Home board's widgets with the
  panels, per project (Plans/Planning_Wizard.md#PWIZ-035).
  This supersedes WS-009's one Dashboard namespace and WS-013's limit to some Usage widgets, both amended in place,
  and amends the Home Workspace boundary addendum's sentences that assume one dashboard. DL-186 retires the panels
  concept's stand-in board with its grid numbers and reset spans, and the conversion of `widget_layout:v1:dashboard`
  into the Home board; their 2026-10-09 and 2026-10-10 text is kept below for lineage only.
  The Dashboard plus sub-row keeps Home, Metrics, Monitoring, Agents and New dashboard inline; one Your
  dashboards row opens this project's custom dashboards by name with their widget counts and search above 7.
  Custom ids run from dash-1 to dash-9999: the next number is one above the largest across open tabs, the
  reopen list, this project's stored boards, still-unadopted unscoped stores, names and live boards; beyond
  9999 the open resolves to Home. An unknown board opens Home, dashboard:new creates one and
  dashboard:current resolves to dashboard:home. Dashboard names are unique against built-ins and the
  project's custom dashboards, and preset names against the person's presets, using suffixes 2, 3 and so on;
  an empty or default dashboard name drops its stored entry. A project switch rebinds every mounted engine
  board whose tab survives, hidden boards too, reloads custom names and refreshes the catalog; a board
  unmounted by the switch writes to its prior project. Add widget groups the 13 Usage rooms in order, then
  More widgets for Usage widgets without a room, then other sources under their labels, with no second
  catalogue. A Reset widgets that changed anything offers the same Undo as Start from. It retains the
  envelope and committed revision just before that operation, writes that exact envelope back in this
  project after acceptance and reads it, with one cmd.widget.reset_layout { scope: 'room', room: <board_id>,
  restore_revision }, one receipt and no workspace.layout_changed; restore_revision never travels with
  set_id. Any other committed board change makes Undo unavailable; the preset hold's settling resizes do
  not. The notice ends on later widget change or commit other than those resizes, Escape, project switch or
  unmount, or after its 8 s offer, held on pointer or focus then 3 s after. Eligibility is checked on each
  commit that leaves it up, pointer or focus entering, and click; stale revision, invalid envelope or a gone
  board dispatches nothing and disables Undo with its reason. A named layout applies a captured board
  envelope only to the project it was saved for, skips another project's envelope and leaves a custom board
  not held by that layout unchanged. F3-638 owns the header facts, Live mark, Board and Start from menu
  rows, empty-board invitation, focus return and measured sizes.
gui_related: true
gui_classification_reason: Defines which boards a person can open, make, rename and delete as dashboard tabs, what each can show, and how each board's widget layout, view and presets are kept and restored.
split_recommended: false
depends_on: [DL-180, DL-186, F3-635, F3-638, WS-009, WS-013, WS-017, WS-019, WS-020, UF-062, UF-107]
unblocks: [ATS-075, GRRC-040, PWIZ-035]
acceptance_criteria:
  - "Several dashboard tabs can be open at once, each showing a different board, and opening a board that is already open reveals its tab instead of opening a second one."
  - "A new project shows Home, Metrics, Monitoring, Agents and New dashboard in the \"+\" menu's Dashboard sub-row, `dashboard:home` is pinned in the default layout, each sub-row opens or reveals its board's tab, and the row body opens or reveals `dashboard:home`."
  - "Every board but Agents runs on the Usage board engine: its grid, sizes, size presets, gestures, gravity, Tidy, entrance, live readings and idle rule match the Usage page's, and no dashboard keeps its own settlement."
  - "Each engine board restores from and writes to its project's `widget_layout:v1:<project_id>:<board_id>` with `host_id` `home.dashboard` and `room_id` the board id, a project switch re-keys every open board, an unreadable envelope is set aside under `:quarantine`, and no dashboard widget state appears in the Home layout record."
  - "Nothing is converted from or written to `widget_layout:v1:dashboard`, nothing is read from or written to `widget_layout:v1:dashboard:<board_id>`, and an unscoped `widget_layout:v1:<board_id>` is adopted once, by the first project that shows that board, and then removed."
  - "New dashboard opens an empty board with the next unused number, named \"Dashboard <n>\"; Rename dashboard... and renaming its tab set the stored name through cmd.panel_tab.rename; Delete dashboard... asks first, closes the tab, drops it from the reopen list and forgets its key, set-aside copy and name; Home, Metrics, Monitoring and Agents offer neither Rename dashboard... nor Delete dashboard...."
  - "Reset widgets dispatches one cmd.widget.reset_layout { scope: 'room', room } that returns the board to its default set; each Start from row dispatches one cmd.widget.reset_layout with its set_id; Start from shows the sets in F3-638's four groups, This dashboard (default), Dashboard starter (host:dashboard), the 13 Usage room sets in room order, then the person's presets; the envelope stores every set_id but default."
  - "The Undo after Start from dispatches one cmd.widget.reset_layout { scope: 'room', room, restore_revision } with the board's committed layout revision just before that Start from and no set_id, only while its notice is up; the owner puts back exactly that revision's records, a restore is refused without dispatch when any other change was committed on the board since, except the preset hold's settling resizes, and Undo is disabled with its reason, and no workspace.layout_changed is emitted (amended 2026-10-10, lead ruling)."
  - "Saving, renaming and deleting a preset dispatch no command and write only `widget_presets:v1`; a preset holds no view, appears in Start from on every dashboard of every project, and applying it dispatches cmd.widget.reset_layout with set_id user:<preset_id>."
  - "Changing a board's range or scope runs ui.widget_board.set_view, writes only that board's envelope and dispatches no command, receipt or event; each board keeps its own range and scope."
  - "Add widget offers every Usage widget grouped by Usage room, and any other registered source's widgets under that source; a widget on the board cannot be added twice; no board offers an old Home widget; every widget command inside a dashboard tab names its board in `room`, changes only that board and emits no `workspace.layout_changed`; a panel or tab command changes no board."
  - "A board's first show plays the reading-order entrance, instant under Reduced Motion; a hidden board does no work; live readings run per board; boards are drawn on Home's tab surface in every look; Details opens the Usage page at the widget's home room with its inspector open."
  - "Agents has no widget store, catalogue or widget command, and its Show filter is saved with its tab."
  - "Closing a dashboard tab keeps its board; a dashboard a person made that leaves the reopen list while not open loses its key, set-aside copy and name; a named layout restores its dashboard boards, and a save over 64 KB keeps the layout without its boards and says how many bytes it left out."
  - "A board's track count follows the dashboard tab's own width when the panel is resized, the window size alone changes nothing, and no widget gesture moves or sizes a panel."
  - "No WorkNodes, NodeSeeds, executable queues, implementation files, runtime launches, or production build tasks are created by this unit."
validation_surfaces:
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
risk_class: home_panels_terminal_redesign_drift
reasoning_tier: high
context_scope: home_panels_terminal
implementation_surfaces:
  - Plans/Widget_System.md
  - Plans/FinalGUISpec.md
  - Plans/usage-feature.md
  - Plans/storage-plan.md
node_compile_hint:
  mode: gui_promotion_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Plans/Decision_Log.md#DL-186"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/canon-inputs/followup/DECISIONS-ADDENDUM-3.md, SHA-256 ecd18c2f2d8ac8f714f9578170d321584fb871e3d19601a68061898ffd6759a9 (D35)"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/canon-inputs/followup/D10-DESIGN-per-instance-boards.md, SHA-256 927d0ed893c513f2f20efa3ff678f19ba785ac43cf84d690412038daa5d41796 (sections 2.4 to 2.9, 3.2, 3.5, 4 and 5; questions P1 to P13, answered by Jared and relayed by the planning thread, pm-mail 1010191613-9ce1; design lineage only)"
  - "home-panels build facts, pm-mail 1010221905-e13e and 1010223444-a10e (engine 66d676cc66, Home track 33d696950c, dashboard kind 54f08139ac; build lineage only)"
  - "Concepts/home-redesign/CONTRACT.md section 3.1 at 54f08139ac on concept/home-panels-20261009, SHA-256 40d3883c90912124773d5f8cb72128de6bde31a76a9223872ba48e05a7a512fc (concept lineage only)"
  - "Concepts/home-redesign/NUMBERS.md at 54f08139ac on concept/home-panels-20261009, SHA-256 945ce104ae275d1d37de02ef0608acd49c21890bd372dac3dcf07b24d36b4a7b (the Dashboard section; concept lineage only)"
  - "Concepts/usage-redesign/src/js/40-board.js at 54f08139ac on concept/home-panels-20261009, SHA-256 f3f1ab41fb650f7a09b65e44d4ebe8c2afdbcae753e2512ac2137e964dae3f8c (the order a board lists its sets; concept lineage only)"
  - "Concepts/usage-redesign/tools/boards.py at 54f08139ac on concept/home-panels-20261009, SHA-256 6b17a5c2da788daaa522c2e4cc6db0780a09da4f31cc49d6b693160b10526790 (the built-in boards' sets as built, Usage content; concept lineage only)"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/canon-inputs/panels-NUMBERS-6026fa8432.md, SHA-256 27ddd358f2c98848e424d7802e753435e09568a9555330884a84c725a844f2c7 (the retired stand-in grid numbers; concept lineage only)"
  - "Plans/Decision_Log.md#DL-180"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/DECISIONS.md, SHA-256 0d2b45466c91734e15fd8659e9a8e3b17b70d92be785421e57e084dc8daf6b64 (D1, D10)"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/canon-inputs/panels-CONTRACT-v1-778c8494e6.md, SHA-256 aa16fc080f44f6824b0ef32a2b568bfcae81277b6962caaba1b441015d68dae9 (section 2, dashboard tab ids; concept lineage only)"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/canon-inputs/panels-NUMBERS-407e6fb6fe.md, SHA-256 019721f5215d95c80b999d5b61e1ee4bf79b29afc5b229a12bccde6f738c5162 (the \"+\" menu's Dashboard sub-row and the Home named layout; concept lineage only)"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/widgets-and-coordination.md, SHA-256 631c28a9198c9f550514c856ade138627410b94c48fe5f96a67450b14f407a90 (part A, A1 to A7; research lineage only)"
  - "Concepts/home-redesign/src/panels/kinds/30-dashboard.js on concept/home-panels-20261009 (the boards, the Details route and the entrance; concept lineage only)"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/canon-inputs/small-round/panels-NUMBERS-51c316e18b.md, SHA-256 a9c42b88e5cb50706ff1716a254cb68e026a538bb7a0c840905779a9a482cff2 (small-round concept lineage only)"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/canon-inputs/small-round/panels-CONTRACT-2926ad987e.md, SHA-256 c579d0dfef41fd1fc7327d14c2adb9e2b101c24b216ff64a9db5fc19895ad989 (small-round concept lineage only)"
preserved_exact_tokens:
  - "dashboard:home"
  - "dashboard:<board_id>"
  - "restore_revision"
  - "widget_layout:v1:dashboard:<board_id>"
  - "widget_layout:v1:dashboard:home"
  - "widget_layout:v1:dashboard"
  - "host_id"
  - "board_id"
  - "UF-062"
  - "widget_layout:v1:<project_id>:<board_id>"
  - ":quarantine"
  - "home.dashboard"
  - "dash-<n>"
  - "set_id"
  - "host:dashboard"
  - "user:<preset_id>"
  - "widget_presets:v1"
  - "Start from"
  - "Rename dashboard..."
  - "Delete dashboard..."
  - "ui.widget_board.set_view"
  - "ui.widget_preset.save"
  - "ui.widget_preset.rename"
  - "ui.widget_preset.delete"
negative_constraints:
  - "Do not limit a board to the four widgets of F3-279."
  - "Do not write a board's widget layout into the Home layout record, or write the Home layout record from a widget operation."
  - "Do not open a second tab for a board that is already open."
  - "Do not write, reset or delete the old `widget_layout:v1:dashboard` key, or convert it into a board."
  - "Do not let a widget gesture move or size a panel, or a panel or tab command change a board."
  - "Do not size a board's tracks from the window."
  - "Do not run a second dashboard engine, board model or settlement beside the Usage board engine."
  - "Do not add a board_id field to a widget command payload, or a command family for dashboards, presets, range or scope."
  - "Do not keep presets per project or put a board's view in a preset."
  - "Do not delete Home, Metrics, Monitoring or Agents, or offer Rename dashboard... or Delete dashboard... on them."
  - "Do not keep the old Home widgets on any board or as a Home (current) board."
  - "Do not gate the lab-only Play the next hour as a dashboard behaviour (UF-107)."
compatibility_only_notes:
  - "The panels concept moves the page's one dashboard node between dashboard tabs and keeps the Main, Metrics and Monitoring grids behind it; that stand-in is concept lineage, not the product's board model."
  - "The concept keeps a custom dashboard's name under its own key and its presets under its own schema id; those are concept names, not product names (the product's families are the board envelope and widget_presets:v1, which storage-plan registers)."
  - "Retired 2026-10-10 (DL-186), kept verbatim for lineage: The Home board starts with the Dashboard's existing default set, `widget-orchestrator-progress`, `widget-active-lanes`, `widget-recent-results` and `widget-custom-metrics`, which the concept's Home board also shows."
  - "Retired 2026-10-10 (DL-186), kept verbatim for lineage: Each board keeps its own widget layout in the one widget-layout schema family (WS-020) under `widget_layout:v1:dashboard:<board_id>`, whose envelope's `host_id` names the board as `dashboard:<board_id>`, as Usage's names `usage`; WS-009's app default with project override applies per board."
  - "Retired 2026-10-10 (DL-186), kept verbatim for lineage: Today's single Dashboard layout `widget_layout:v1:dashboard` converts into `widget_layout:v1:dashboard:home` on first read and is never reset: the user's widgets, their sizes, order, visibility and configuration carry over, and the old key stays only as a read-only migration input and rollback backup, like `dashboard_layout:v1`."
  - "Retired 2026-10-10 (DL-186), kept verbatim for lineage: The Usage board engine becomes the dashboard engine once it runs several boards at once; this thread family does that refactor after the Usage port lands, and until then the panels concept's stand-in board is lineage only."
  - "Retired 2026-10-10 (DL-186), kept verbatim for lineage: A project starts with four boards, Home, Metrics, Monitoring and Agents, after the panels concept; the \"+\" menu's Dashboard row lists the project's boards in its sub-row, each opening or revealing that board's tab, and its row body opens or reveals `dashboard:home`, as the panels concept does (Plans/UI_Command_Catalog.md#UCC-200). Closing a dashboard tab closes the tab only: its board and widget layout stay and can be opened again from that row."
  - "Retired 2026-10-10 (DL-186), kept verbatim for lineage: Catalogue: any Usage widget can be placed on any board (Plans/usage-feature.md#UF-062 wins over the four-widget catalogue of F3-279, which F3-638 supersedes), together with the Dashboard widgets canon already admits; Orchestrator widgets beyond WS-013's curated Progress subset join after the Orchestrator page has its own redesign, and that redesign's widgets follow this same kind contract."
  - "Retired 2026-10-10 (DL-186), kept verbatim for lineage: Inside the tab the board is the Usage widget board: its snapping widget grid, its Add widget flow, its widget gestures under WS-019 (one transaction owns one board at a time), its curated sizes under WS-017 and WS-018, and its track count chosen from the board's own measured width, never the window (F3-638)."
  - "Retired 2026-10-10 (DL-186), kept verbatim for lineage: Add widget sits inside the dashboard tab, in its header row (F3-635), and adds to that board only. Every `cmd.widget.*` row inside a dashboard tab is addressed by board_id (UCC-200), commits only to that board's namespace, and emits no `workspace.layout_changed`, which stays the Home layout's event (Plans/Contracts_V0.md#CV-361)."
  - "Retired 2026-10-10 (DL-186), 2026-10-09 acceptance criterion kept verbatim for lineage: A new project shows the boards Home, Metrics, Monitoring and Agents in the \"+\" menu's Dashboard row, `dashboard:home` is pinned in the default layout, each sub-row opens or reveals its board's tab, and the row body opens or reveals `dashboard:home`."
  - "Retired 2026-10-10 (DL-186), 2026-10-09 acceptance criterion kept verbatim for lineage: Closing a dashboard tab keeps its board and widget layout, and the board opens again from the Dashboard row as it was."
  - "Retired 2026-10-10 (DL-186), 2026-10-09 acceptance criterion kept verbatim for lineage: Each board restores from and writes to its own `widget_layout:v1:dashboard:<board_id>` with `host_id` `dashboard:<board_id>`, and no dashboard widget state appears in the Home layout record."
  - "Retired 2026-10-10 (DL-186), 2026-10-09 acceptance criterion kept verbatim for lineage: On first read after upgrade a saved `widget_layout:v1:dashboard` becomes the Home board's layout with every widget, size, order, visibility and configuration kept, nothing is reset, and later writes never touch the old key."
  - "Retired 2026-10-10 (DL-186), 2026-10-09 acceptance criterion kept verbatim for lineage: The Add widget flow of every board offers every Usage widget; no four-widget limit applies."
  - "Retired 2026-10-10 (DL-186), 2026-10-09 acceptance criterion kept verbatim for lineage: Every `cmd.widget.*` dispatch inside a dashboard tab carries board_id, changes only that board, and emits no `workspace.layout_changed`; a panel or tab command changes no board."
  - "Retired 2026-10-10 (DL-186), 2026-10-09 negative constraint kept verbatim for lineage: Do not reset a saved Dashboard layout on upgrade, or keep writing the old `widget_layout:v1:dashboard` key after migration."
  - "Retired 2026-10-10 (DL-186), kept verbatim for lineage (R35, the stand-in board's numbers): Within a dashboard tab, the grid column correction applies at widths 700-1060 px, with 8 px gaps and at least 200 px per column at four columns. It uses 3 columns if any visible widget spans an odd number of tracks, else 4 if (width minus 3 gaps) / 4 is at least 200 px, else 2. Below that range the page's grid rules give 2 columns. Source measurements in Focus or maximized at windows 1920, 1680 and 1470 px give grid widths 1005, 924 and 924 px: Home/Monitoring use 4 columns and Metrics 3. Home layout grids measure 437-488 px and Build 294-332 px, both 2 columns. Reset captures each board's starting widget set at load and saves 240 ms after reset: Home's orchestrator progress is 2 × 2, active lanes/recent results/custom metrics 2 × 1; Metrics has quota summary 2 × 1 and budget donuts/analytics chart 1 × 1; Monitoring has lane health and containers 2 × 1. These board measurements do not settle the separate per-kind Usage widget preset table."
stale_retired_dispositions:
  - "Rewritten 2026-10-10 (DL-186): dashboards run on the Usage board engine with per-project keys, host_id home.dashboard, multi-source boards and catalogue, Reset and Start from with set_id, per-user presets, custom dashboards made, renamed and deleted, the reopen-list rule, named-layout board snapshots capped at 64 KB, per-board range and scope, the reading-order entrance, Details on the Usage page, Agents drawn by the kind, Home's tab surface, live readings per board and empty new dashboards; the old Home widgets leave Home."
  - "Superseded 2026-10-10 (DL-186): the 2026-10-09 per-board key widget_layout:v1:dashboard:<board_id> and host_id dashboard:<board_id>, the conversion of widget_layout:v1:dashboard into the Home board, the Home board's default set of four old Home widgets, the stand-in board's R35 grid numbers and reset spans, and the phrase addressed by board_id, which now reads as the board id carried in the existing room field."
  - "Amended 2026-10-10 (R35, panels NUMBERS 6026fa8432): Adds dashboard grid columns, board reset spans, measured widths and reset-save delay."
  - "Superseded 2026-10-09 (DL-180): the one Dashboard widget-layout namespace and the singleton Dashboard surface."
  - "Amended 2026-10-10 (DL-186): Start from shows the sets in F3-638's group order, the lab-only Play the next hour is no criterion of this unit, and the built-in boards' own sets stay an open question for Usage until a Usage unit lists them."
  - "Amended 2026-10-10 (lead ruling on the Undo after Start from): the Undo dispatches cmd.widget.reset_layout with restore_revision, the board's committed layout revision just before the Start from, never with set_id."
  - "Amended 2026-10-11 (wave 2, panels NUMBERS 51c316e18b): Round-two dashboard names, grouping, project rebinding, picker sections and guarded Reset Undo use the board owner."
owner_boundary_notes:
  - "F3-638 owns how a dashboard tab looks in its panel; WS-017, WS-018, WS-019 and WS-020 keep the widget sizes, gestures and record fields; usage-feature.md owns the Usage widgets themselves, their default sets and the live readings; storage-plan registers the board and preset families; UI_Command_Catalog owns the commands and typed local actions named here."
owner_hints:
  - Plans/Widget_System.md
  - Plans/FinalGUISpec.md
  - Plans/usage-feature.md
  - Plans/storage-plan.md
  - Plans/UI_Command_Catalog.md
```

ContractRef: ContractName:Plans/Decision_Log.md#DL-180, ContractName:Plans/Decision_Log.md#DL-186, ContractName:Plans/FinalGUISpec.md#F3-638, ContractName:Plans/FinalGUISpec.md#F3-635, ContractName:Plans/usage-feature.md#UF-062, ContractName:Plans/usage-feature.md#UF-107, ContractName:Plans/Widget_System.md#WS-019, ContractName:Plans/Widget_System.md#WS-020, ContractName:Plans/DRY_Rules.md#DR-066
