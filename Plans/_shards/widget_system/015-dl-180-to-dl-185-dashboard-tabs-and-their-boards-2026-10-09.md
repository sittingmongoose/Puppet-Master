# Shard 015: DL-180 to DL-185 — Dashboard Tabs And Their Boards (2026-10-09)

Source: `Plans/Widget_System.md`

Source lines: L1577-L1712

Source SHA256: `eebd5a262134f0eb53a61d2efaaa2b1fbc9902feff63aede08087b296f174eff`

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

### WS-030 - Dashboard Tabs, Their Boards And One Widget Layout Per Board

```yaml
plan_unit_id: WS-030
unit_type: requirement
status: accepted
owner_doc: Plans/Widget_System.md
canonical_text: >-
  A dashboard is a tab kind in the home centre (Plans/FinalGUISpec.md#F3-635, #F3-638), and each dashboard tab shows
  one board (DL-180, D10). A board is a project's widget board with a stable board_id; its tab id is
  `dashboard:<board_id>`, and one board is at most one tab in the workspace: opening a board that is already open
  reveals its tab where it is (F3-634). The board_id, never the tab id, is the domain reference a dashboard tab keeps
  in the Home layout record (Plans/storage-plan.md#SP-330). `dashboard:home` is the default board, the pinned Home
  dashboard of the default layout (F3-630). A project starts with four boards, Home, Metrics, Monitoring and Agents,
  after the panels concept; the "+" menu's Dashboard row lists the project's boards in its sub-row, each opening or
  revealing that board's tab, and its row body opens or reveals `dashboard:home`, as the panels concept does
  (Plans/UI_Command_Catalog.md#UCC-200). Closing a dashboard tab
  closes the tab only: its board and widget layout stay and can be opened again from that row. The Home board starts
  with the Dashboard's existing default set, `widget-orchestrator-progress`, `widget-active-lanes`,
  `widget-recent-results` and `widget-custom-metrics`, which the concept's Home board also shows. Each board keeps its
  own widget layout in the one widget-layout schema family (WS-020) under `widget_layout:v1:dashboard:<board_id>`,
  whose envelope's `host_id` names the board as `dashboard:<board_id>`, as Usage's names `usage`; WS-009's app default
  with project override applies per board. A board's widget layout is never written into the Home layout record, and
  the Home layout record is never written by a widget operation (DR-066). Today's single Dashboard layout
  `widget_layout:v1:dashboard` converts into `widget_layout:v1:dashboard:home` on first read and is never reset: the
  user's widgets, their sizes, order, visibility and configuration carry over, and the old key stays only as a
  read-only migration input and rollback backup, like `dashboard_layout:v1`. Catalogue: any Usage widget can be placed
  on any board (Plans/usage-feature.md#UF-062 wins over the four-widget catalogue of F3-279, which F3-638 supersedes),
  together with the Dashboard widgets canon already admits; Orchestrator widgets beyond WS-013's curated Progress
  subset join after the Orchestrator page has its own redesign, and that redesign's widgets follow this same kind
  contract. Inside the tab the board is the Usage widget board: its snapping widget grid, its Add widget flow, its
  widget gestures under WS-019 (one transaction owns one board at a time), its curated sizes under WS-017 and WS-018,
  and its track count chosen from the board's own measured width, never the window (F3-638). The Usage board engine
  becomes the dashboard engine once it runs several boards at once; this thread family does that refactor after the
  Usage port lands, and until then the panels concept's stand-in board is lineage only. The per-kind preset table
  tested at 400, 550 and 700 px of board width comes from the Usage thread in wave 2. Add widget sits inside the
  dashboard tab, in its header row (F3-635), and adds to that board only. Every `cmd.widget.*` row inside a dashboard
  tab is addressed by board_id (UCC-200), commits only to that board's namespace, and emits no
  `workspace.layout_changed`, which stays the Home layout's event (Plans/Contracts_V0.md#CV-361). Home's panels, tabs
  and chat column are not widgets: no panel or tab command reaches a board, no `cmd.widget.*` row reaches a panel or
  tab, and a widget gesture never moves or sizes a panel (DR-066). This supersedes WS-009's one Dashboard namespace and
  WS-013's limit to some Usage widgets, both amended in place, and amends the Home Workspace boundary addendum's
  sentences that assume one dashboard.
  Within a dashboard tab, the grid column correction applies at widths 700-1060 px, with 8 px gaps and at
  least 200 px per column at four columns. It uses 3 columns if any visible widget spans an odd number of
  tracks, else 4 if (width minus 3 gaps) / 4 is at least 200 px, else 2. Below that range the page's grid
  rules give 2 columns. Source measurements in Focus or maximized at windows 1920, 1680 and 1470 px give
  grid widths 1005, 924 and 924 px: Home/Monitoring use 4 columns and Metrics 3. Home layout grids measure
  437-488 px and Build 294-332 px, both 2 columns. Reset captures each board's starting widget set at load
  and saves 240 ms after reset: Home's orchestrator progress is 2 × 2, active lanes/recent results/custom
  metrics 2 × 1; Metrics has quota summary 2 × 1 and budget donuts/analytics chart 1 × 1; Monitoring has
  lane health and containers 2 × 1. These board measurements do not settle the separate per-kind Usage
  widget preset table.
gui_related: true
gui_classification_reason: Defines which boards a person can open as dashboard tabs, what each can show, and how each board's widget layout is kept and restored.
split_recommended: false
depends_on: [DL-180, F3-635, F3-638, WS-009, WS-013, WS-019, WS-020, UF-062]
unblocks: [ATS-075, GRRC-040]
acceptance_criteria:
  - "Several dashboard tabs can be open at once, each showing a different board, and opening a board that is already open reveals its tab instead of opening a second one."
  - "A new project shows the boards Home, Metrics, Monitoring and Agents in the \"+\" menu's Dashboard row, `dashboard:home` is pinned in the default layout, each sub-row opens or reveals its board's tab, and the row body opens or reveals `dashboard:home`."
  - "Closing a dashboard tab keeps its board and widget layout, and the board opens again from the Dashboard row as it was."
  - "Each board restores from and writes to its own `widget_layout:v1:dashboard:<board_id>` with `host_id` `dashboard:<board_id>`, and no dashboard widget state appears in the Home layout record."
  - "On first read after upgrade a saved `widget_layout:v1:dashboard` becomes the Home board's layout with every widget, size, order, visibility and configuration kept, nothing is reset, and later writes never touch the old key."
  - "The Add widget flow of every board offers every Usage widget; no four-widget limit applies."
  - "Every `cmd.widget.*` dispatch inside a dashboard tab carries board_id, changes only that board, and emits no `workspace.layout_changed`; a panel or tab command changes no board."
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
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/canon-inputs/panels-NUMBERS-6026fa8432.md, SHA-256 27ddd358f2c98848e424d7802e753435e09568a9555330884a84c725a844f2c7 (concept lineage only)"
  - "Plans/Decision_Log.md#DL-180"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/DECISIONS.md, SHA-256 0d2b45466c91734e15fd8659e9a8e3b17b70d92be785421e57e084dc8daf6b64 (D1, D10)"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/canon-inputs/panels-CONTRACT-v1-778c8494e6.md, SHA-256 aa16fc080f44f6824b0ef32a2b568bfcae81277b6962caaba1b441015d68dae9 (section 2, dashboard tab ids; concept lineage only)"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/canon-inputs/panels-NUMBERS-407e6fb6fe.md, SHA-256 019721f5215d95c80b999d5b61e1ee4bf79b29afc5b229a12bccde6f738c5162 (the \"+\" menu's Dashboard sub-row and the Home named layout; concept lineage only)"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/widgets-and-coordination.md, SHA-256 631c28a9198c9f550514c856ade138627410b94c48fe5f96a67450b14f407a90 (part A, A1 to A7; research lineage only)"
  - "Concepts/home-redesign/src/panels/kinds/30-dashboard.js on concept/home-panels-20261009 (the four boards and the Home board's widgets; concept lineage only)"
preserved_exact_tokens:
  - "dashboard:home"
  - "dashboard:<board_id>"
  - "widget_layout:v1:dashboard:<board_id>"
  - "widget_layout:v1:dashboard:home"
  - "widget_layout:v1:dashboard"
  - "host_id"
  - "board_id"
  - "UF-062"
negative_constraints:
  - "Do not limit a board to the four widgets of F3-279."
  - "Do not write a board's widget layout into the Home layout record, or write the Home layout record from a widget operation."
  - "Do not open a second tab for a board that is already open."
  - "Do not reset a saved Dashboard layout on upgrade, or keep writing the old `widget_layout:v1:dashboard` key after migration."
  - "Do not let a widget gesture move or size a panel, or a panel or tab command change a board."
  - "Do not size a board's tracks from the window."
compatibility_only_notes:
  - "The panels concept moves the page's one dashboard node between dashboard tabs and keeps the Main, Metrics and Monitoring grids behind it; that stand-in is concept lineage, not the product's board model."
stale_retired_dispositions:
  - "Amended 2026-10-10 (R35, panels NUMBERS 6026fa8432): Adds dashboard grid columns, board reset spans, measured widths and reset-save delay."
  - "Superseded 2026-10-09 (DL-180): the one Dashboard widget-layout namespace and the singleton Dashboard surface."
owner_boundary_notes:
  - "F3-638 owns how a dashboard tab looks in its panel; WS-017, WS-018, WS-019 and WS-020 keep the widget sizes, gestures and record fields the Usage thread amends; usage-feature.md owns the Usage widgets themselves."
owner_hints:
  - Plans/Widget_System.md
  - Plans/FinalGUISpec.md
  - Plans/usage-feature.md
  - Plans/storage-plan.md
  - Plans/UI_Command_Catalog.md
```

ContractRef: ContractName:Plans/Decision_Log.md#DL-180, ContractName:Plans/FinalGUISpec.md#F3-638, ContractName:Plans/FinalGUISpec.md#F3-635, ContractName:Plans/usage-feature.md#UF-062, ContractName:Plans/Widget_System.md#WS-020, ContractName:Plans/DRY_Rules.md#DR-066
