# Widget System -- Cross-Cutting Specification

<!--
PUPPET MASTER -- WIDGET SYSTEM SSOT

Purpose:
- This file is the single source of truth for the portable widget catalog,
  grid-based layout system, add-widget flow, and widget layout persistence.
- All widget-composed pages (Dashboard, Usage, Orchestrator tabs) reference
  this document for widget mechanics.
- Keep it DRY: widget data source contracts are defined in their respective
  SSOTs; this document references them.

ABSOLUTE NAMING RULE:
- Platform name is "Puppet Master" only.
- If older naming exists, refer to it only as "legacy naming" (do not quote it).
-->

**Date:** 2026-02-23
**Status:** Plan document -- defines the portable widget system for the Slint rewrite
**Depends on:** Plans/FinalGUISpec.md, Plans/Contracts_V0.md, Plans/storage-plan.md

---

## Table of Contents

1. [Scope and Non-Scope](#1-scope-and-non-scope)
2. [Widget Catalog (Canonical Registry)](#2-widget-catalog)
3. [Grid Layout System](#3-grid-layout-system)
4. [Add-Widget Flow](#4-add-widget-flow)
5. [Widget Configuration](#5-widget-configuration)
6. [Preconfigured Defaults](#6-preconfigured-defaults)
7. [Layout Persistence](#7-layout-persistence)
8. [Widget Data Contracts](#8-widget-data-contracts)
9. [Theming Integration](#9-theming-integration)
10. [Accessibility](#10-accessibility)
11. [UICommand IDs](#11-uicommand-ids)
12. [Acceptance Criteria](#12-acceptance-criteria)
13. [References](#13-references)

---

<a id="1-scope-and-non-scope"></a>
## 1. Scope and Non-Scope

### In Scope

- **Widget catalog**: canonical registry of all portable page widgets, their stable IDs, data sources, and hosting rules.
- **Grid layout system**: responsive column/row grid with grid-based resizing (column-span and row-span).
- **Add-widget flow**: how users add widgets to any widget-composed page.
- **Remove-widget**: how users remove widgets from a page.
- **Widget configuration**: per-widget settings (gear icon).
- **Layout persistence**: how widget positions, sizes, and configs are stored in redb.
- **Preconfigured defaults**: default layouts for each widget-composed page.

### NOT in Scope

- **Node Graph Display**: The Run Graph View (Plans/Run_Graph_View.md) is a full-page tab on the Orchestrator page. It is NOT a portable widget and is NOT in this catalog.
- **Atomic UI components**: Buttons, inputs, badges, and other primitives remain defined in Plans/FinalGUISpec.md section 8. This document covers **composed page widgets** built from those primitives.
- **Data source internals**: This document references data source SSOTs but does not redefine event schemas or redb key formats.

ContractRef: Primitive:UICommand (Plans/Contracts_V0.md), ContractName:Plans/FinalGUISpec.md

---

<a id="2-widget-catalog"></a>
## 2. Widget Catalog (Canonical Registry)

Each widget in the catalog has:
- **Widget ID**: stable string identifier (format: `widget.{name}`)
- **Display Name**: human-readable name shown in the catalog overlay
- **Description**: one-line description of what the widget shows
- **Data Source**: SSOT reference for the data this widget displays
- **Update Mechanism**: `push` (live event stream via `invoke_from_event_loop`) or `pull` (redb rollup read on timer/demand)
- **Default Size**: `col_span x row_span` when first placed
- **Min/Max Size**: minimum and maximum `col_span x row_span`
- **Hostable Pages**: which pages can host this widget
- **Slint Component**: name of the `.slint` component that renders this widget

### 2.1 Dashboard & Progress Widgets

| Widget ID | Display Name | Description | Data Source | Update | Default | Min | Max | Pages |
|-----------|-------------|-------------|-------------|--------|---------|-----|-----|-------|
| `widget.orchestrator_status` | Orchestrator Status | Current orchestrator state badge with run controls | `PuppetMasterEvent::StateChanged` | push | 2x1 | 1x1 | 4x1 | Dashboard, Orch/Progress |
| `widget.current_task` | Current Task | Active tier title, objective, and elapsed time | `PuppetMasterEvent::TierChanged`, `IterationStart` | push | 2x1 | 1x1 | 4x2 | Dashboard, Orch/Progress |
| `widget.progress_bars` | Progress Bars | Phase/task/subtask completion bars | `PuppetMasterEvent::Progress` | push | 2x1 | 2x1 | 4x2 | Dashboard, Orch/Progress |
| `widget.cta_stack` | Calls to Action | HITL approvals, run interrupted, rate limits, warnings | `PuppetMasterEvent::UserInteractionRequired` + alerts | push | 2x2 | 1x1 | 4x3 | Dashboard, Orch/Progress |
| `widget.terminal_output` | Terminal Output | Live PTY output from current agent | PTY stdout/stderr stream | push | 2x2 | 1x1 | 4x4 | Dashboard, Orch/Progress |
| `widget.interview_panel` | Interview Panel | Current interview Q&A and progress | Interview event stream | push | 1x2 | 1x1 | 2x3 | Dashboard |
| `widget.error_display` | Error Display | Recent errors with severity and context | `PuppetMasterEvent::Error` | push | 2x1 | 1x1 | 4x2 | Dashboard, Orch/Progress |
| `widget.agent_terminal` | Agent Terminal | Per-subagent PTY stream (worker/verifier) | Per-subagent PTY stream, filtered by tier_id | push | 2x2 | 1x1 | 4x4 | Orch/Progress |
| `widget.completed_prose` | Completed Work | Prose summaries of finished phases/tasks | Evidence summaries + tier descriptions | pull | 2x2 | 2x1 | 4x4 | Orch/Progress |

ContractRef: ContractName:Plans/orchestrator-subagent-integration.md, ContractName:Plans/FinalGUISpec.md#7.2

### 2.2 Usage & Budget Widgets

| Widget ID | Display Name | Description | Data Source | Update | Default | Min | Max | Pages |
|-----------|-------------|-------------|-------------|--------|---------|-----|-----|-------|
| `widget.quota_summary` | Quota Summary | 5h/7d usage bars per platform with plan type | `redb:rollups/usage_5h.*`, `usage_7d.*` + platform APIs | pull | 2x1 | 1x1 | 4x2 | Usage, Dashboard |
| `widget.budget_donuts` | Budget Donuts | Donut charts for budget consumption per platform | `redb:rollups/usage_5h.*`, `usage_7d.*` | pull | 2x2 | 1x1 | 4x3 | Usage, Dashboard |
| `widget.alert_thresholds` | Alert Thresholds | Approaching-limit warnings and threshold status | `redb:rollups`, config thresholds | pull | 2x1 | 1x1 | 4x1 | Usage, Dashboard |
| `widget.ledger_table` | Ledger Table | Event-level usage/token/cost ledger with filtering | seglog events (type: `usage.event`, `run.completed`) | pull | 4x3 | 2x2 | 4x6 | Usage, Orch/Ledger |
| `widget.analytics_chart` | Analytics Chart | Aggregate usage over time (bar/line/area) | `redb:rollups` aggregates | pull | 2x2 | 1x1 | 4x4 | Usage |
| `widget.tool_usage` | Tool Usage | Tool invocation count, latency (p50/p95), error rate | `redb:rollups/tool_usage.*`, `tool_latency.*` | pull | 2x2 | 1x1 | 4x3 | Usage, Dashboard |
| `widget.platform_quota` | Platform Quota | Per-platform detailed quota with reset timers | `redb:rollups/usage_5h.*` + platform APIs | pull | 2x1 | 1x1 | 4x2 | Dashboard, Usage |
| `widget.reset_countdown` | Reset Countdown | Countdown to next quota reset per platform | Platform API or rate-limit error parsing | pull | 1x1 | 1x1 | 2x1 | Usage, Dashboard |
| `widget.multi_account` | Multi-Account Status | Per-platform account list, active account, cooldown | `redb:settings/multi_account.*` + platform APIs | pull | 2x1 | 1x1 | 4x2 | Usage, Dashboard |

ContractRef: ContractName:Plans/usage-feature.md, ContractName:Plans/Multi-Account.md, ContractName:Plans/storage-plan.md

### 2.3 Orchestrator Tab Widgets

| Widget ID | Display Name | Description | Data Source | Update | Default | Min | Max | Pages |
|-----------|-------------|-------------|-------------|--------|---------|-----|-----|-------|
| `widget.tier_tree` | Tier Tree | Phase/task/subtask tree with states | `TierTree` arena + `PuppetMasterEvent::TierChanged` | push | 4x3 | 2x2 | 4x6 | Orch/Tiers |
| `widget.evidence_browser` | Evidence Browser | Evidence list with type filters, search, detail preview | `evidence/<node_id>.json` + seglog | pull | 4x3 | 2x2 | 4x6 | Orch/Evidence |
| `widget.history_list` | History List | Past run list with status, duration, link to detail | `redb:runs/*` | pull | 4x2 | 2x1 | 4x4 | Orch/History |

ContractRef: ContractName:Plans/orchestrator-subagent-integration.md

---

<a id="3-grid-layout-system"></a>
## 3. Grid Layout System

### 3.1 Grid Model

All widget-composed pages use a CSS-Grid-style layout model implemented in Slint:

- **Columns**: responsive count based on window width (per Plans/FinalGUISpec.md section 12.3):
  - < 1200px: 2 columns
  - 1200-1600px: 3 columns
  - > 1600px: 4 columns
- **Rows**: variable count, auto-extending as widgets are added
- **Row height**: fixed unit of 80px per row unit; widgets span 1 or more row units
- **Column width**: equal division of available width (e.g., at 4 columns, each column is 25% of content area width minus gutters)
- **Gutters**: 8px (MD spacing token) between columns and rows

ContractRef: ContractName:Plans/FinalGUISpec.md#12.3

### 3.2 Widget Sizing

Each widget declares:
- `min_col_span` / `min_row_span`: minimum grid cells (cannot resize smaller)
- `max_col_span` / `max_row_span`: maximum grid cells (cannot resize larger)
- `default_col_span` / `default_row_span`: size when first placed

All resizing is **grid-based**. There is no free-form pixel-level resizing. When a user drags a widget edge, the widget snaps to the nearest grid boundary.

ContractRef: ContractName:Plans/FinalGUISpec.md#12.3

### 3.3 Resize Interaction

- **Drag edge**: cursor changes to resize handle at widget edges (4px hit zone). Drag to change col_span or row_span.
- **Grid snapping**: during drag, a ghost outline shows the target size snapped to grid. On release, widget resizes to the snapped size.
- **Constraint enforcement**: resize is clamped to min/max col_span and row_span.
- **Reflow**: when a widget grows, adjacent widgets shift to accommodate. When column count changes (window resize), widgets reflow: widgets that exceed available columns collapse to max available columns.

### 3.4 Widget Placement

- Widgets occupy rectangular grid cells: `(col, row, col_span, row_span)`.
- No overlapping: if a widget would overlap another, the displaced widget shifts down to the next available row.
- Auto-placement: when a new widget is added, it is placed at the first available position scanning left-to-right, top-to-bottom.

---

<a id="4-add-widget-flow"></a>
## 4. Add-Widget Flow

### 4.1 Entry Point

Every widget-composed page (Dashboard, Usage, Orchestrator widget-based tabs) has an **"Add Widget"** control:
- **Location**: floating action button in the bottom-right corner of the widget grid area, or a toolbar button if the page has a toolbar.
- **Icon**: plus icon with "Add Widget" label on hover.
- **Keyboard shortcut**: Ctrl+Shift+W (when focused on a widget page).

### 4.2 Catalog Overlay

Clicking "Add Widget" opens a catalog overlay:
- **Layout**: modal overlay centered on the page, 600x400px default.
- **Content**: list of all widgets from the catalog (section 2) filtered to those whose "Hostable Pages" includes the current page.
- **Each entry shows**: widget display name, description, default size preview (e.g., "2x2"), "Add" button.
- **Search**: text input at top filters by widget name or description.
- **Close**: Escape key or click outside overlay.

### 4.3 On Add

- Widget is placed at the next available grid position with its default size.
- If the page has reached its widget cap, show a toast: "Maximum widgets reached. Remove a widget first."
- Per-page widget caps (configurable in settings):
  - Dashboard: 12 widgets (default)
  - Usage: 8 widgets (default)
  - Orchestrator tabs: 6 widgets per tab (default)

### 4.4 Remove Widget

- **Right-click context menu**: "Remove Widget" option on any widget.
- **X button**: small close button in widget header (visible on hover).
- **Confirmation**: none required (undo available via Ctrl+Z within 10 seconds).
- **On remove**: widget disappears, remaining widgets reflow to fill the gap. Layout persisted immediately.

ContractRef: Primitive:UICommand (Plans/Contracts_V0.md#UICommand)

---

<a id="5-widget-configuration"></a>
## 5. Widget Configuration

### 5.1 Per-Widget Config

Each widget has a **gear icon** in its header bar (visible on hover, always visible when config panel is open).

Clicking the gear opens a **config panel** (inline dropdown below the widget header):
- Config fields vary by widget type.
- Common fields: display title (editable), refresh interval (for pull-based widgets).
- Widget-specific fields:

| Widget | Config Fields |
|--------|--------------|
| `widget.quota_summary` | Time window (5h/7d), platforms to show |
| `widget.budget_donuts` | Time window, chart style (donut/bar) |
| `widget.analytics_chart` | Time window (5h/7d/24h/custom), chart type (bar/line/area), platforms |
| `widget.tool_usage` | Time window, sort by (count/latency/errors) |
| `widget.ledger_table` | Columns visible, page size, default sort, event type filter |
| `widget.multi_account` | Platforms to show, show cooldown timers (on/off) |
| `widget.agent_terminal` | Buffer size (lines), auto-scroll (on/off), word wrap (on/off) |
| `widget.completed_prose` | Show duration (on/off), show file counts (on/off), collapse after N items |
| `widget.tier_tree` | Expand depth (1/2/3/all), show states (filter by state) |

### 5.2 Config Persistence

Widget configuration is stored as a JSON object alongside the widget's layout entry (see section 7). When the user changes a config field, the layout entry is updated and persisted (debounced 300ms).

---

<a id="6-preconfigured-defaults"></a>
## 6. Preconfigured Defaults

Every widget-composed page MUST ship with a default layout. No page starts empty.

### 6.1 Default Layout Loading

On first load (no persisted layout found in redb for this page):
1. Load the default layout defined below for the page.
2. Persist the default layout to redb immediately.
3. User can then customize (add/remove/move/resize/configure).

### 6.2 "Reset Layout" Command

- UICommand: `cmd.widget.reset_layout` with args `{ page }`.
- Behavior: replaces the current layout with the page's default layout.
- Confirmation dialog: "Reset layout to defaults? Your current layout will be lost."
- Persist the reset layout to redb.

### 6.3 Default Layouts by Page

#### Dashboard (default, 4-column grid)

| Col | Row | Widget | Size |
|-----|-----|--------|------|
| 0 | 0 | `widget.orchestrator_status` | 2x1 |
| 2 | 0 | `widget.current_task` | 2x1 |
| 0 | 1 | `widget.progress_bars` | 4x1 |
| 0 | 2 | `widget.cta_stack` | 2x2 |
| 2 | 2 | `widget.terminal_output` | 2x2 |
| 0 | 4 | `widget.interview_panel` | 1x2 |
| 1 | 4 | `widget.error_display` | 1x2 |
| 2 | 4 | `widget.budget_donuts` | 2x2 |

This matches the current Iced dashboard card set (Plans/FinalGUISpec.md section 7.2): Orchestrator Status, Current Task, Progress, Budgets, CtAs, Terminal Output, Interview Panel, Error Display.

#### Usage Page (default, 4-column grid)

| Col | Row | Widget | Size |
|-----|-----|--------|------|
| 0 | 0 | `widget.quota_summary` | 2x1 |
| 2 | 0 | `widget.alert_thresholds` | 2x1 |
| 0 | 1 | `widget.analytics_chart` | 2x2 |
| 2 | 1 | `widget.budget_donuts` | 2x2 |
| 0 | 3 | `widget.tool_usage` | 2x2 |
| 2 | 3 | `widget.multi_account` | 2x2 |
| 0 | 5 | `widget.ledger_table` | 4x3 |

#### Orchestrator Tab Defaults

See Plans/Orchestrator_Page.md for per-tab default layouts.

ContractRef: ContractName:Plans/FinalGUISpec.md#7.2, ContractName:Plans/Orchestrator_Page.md

---

<a id="7-layout-persistence"></a>
## 7. Layout Persistence

### 7.1 redb Key Pattern

Widget layouts are stored in redb under a generalized key pattern:

| Key | Content | Write Frequency |
|-----|---------|----------------|
| `widget_layout:v1:dashboard` | Array of `WidgetLayoutEntry` | On change (debounced 300ms) |
| `widget_layout:v1:usage` | Array of `WidgetLayoutEntry` | On change (debounced 300ms) |
| `widget_layout:v1:orchestrator:progress` | Array of `WidgetLayoutEntry` | On change (debounced 300ms) |
| `widget_layout:v1:orchestrator:tiers` | Array of `WidgetLayoutEntry` | On change (debounced 300ms) |
| `widget_layout:v1:orchestrator:evidence` | Array of `WidgetLayoutEntry` | On change (debounced 300ms) |
| `widget_layout:v1:orchestrator:history` | Array of `WidgetLayoutEntry` | On change (debounced 300ms) |
| `widget_layout:v1:orchestrator:ledger` | Array of `WidgetLayoutEntry` | On change (debounced 300ms) |

### 7.2 WidgetLayoutEntry Schema

```json
{
  "instance_id": "wli-xxxx-xxxx",
  "widget_id": "widget.orchestrator_status",
  "col": 0,
  "row": 0,
  "col_span": 2,
  "row_span": 1,
  "config": { }
}
```

Fields:
- `instance_id` (string): unique identifier for this widget placement (UUID). Required because the same widget_id can appear multiple times on one page.
- `widget_id` (string): references the catalog entry (section 2).
- `col`, `row` (integer): grid position (0-indexed).
- `col_span`, `row_span` (integer): size in grid units.
- `config` (object): per-widget configuration (section 5).

### 7.3 Migration from `dashboard_layout:v1`

The existing `dashboard_layout:v1` redb key (Plans/FinalGUISpec.md section 15.1) stores a simple card-order list. On first load after the widget system upgrade:

1. If `dashboard_layout:v1` exists and `widget_layout:v1:dashboard` does NOT exist:
   - Read card ID list from `dashboard_layout:v1`.
   - Map each card ID to its corresponding Widget Catalog ID (section 2).
   - Assign default grid positions and sizes.
   - Write the result as `widget_layout:v1:dashboard`.
   - Keep `dashboard_layout:v1` as backup (do NOT delete).
2. Future reads use `widget_layout:v1:dashboard` only.
3. If both keys exist, `widget_layout:v1:dashboard` takes precedence.

**Widget Layout Key Precedence (SSOT):**
`widget_layout:v1:{page}` takes precedence over any legacy `dashboard_layout:v1` keys. On first load after migration, legacy keys are converted to the new format and the legacy key is deleted. This section is the single source of truth for widget layout key precedence. Cross-reference from FinalGUISpec.md and Crosswalk.md §3.12.

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/FinalGUISpec.md#15.1

---

<a id="8-widget-data-contracts"></a>
## 8. Widget Data Contracts

Each widget reads from a data source contract defined in its respective SSOT document. This section provides the mapping for implementers.

### 8.1 Push-Based Widgets (live event stream)

These widgets receive data via `invoke_from_event_loop` when events arrive on the Rust backend:

| Widget ID | Event Types Consumed | SSOT |
|-----------|---------------------|------|
| `widget.orchestrator_status` | `StateChanged` | Plans/orchestrator-subagent-integration.md |
| `widget.current_task` | `TierChanged`, `IterationStart` | Plans/orchestrator-subagent-integration.md |
| `widget.progress_bars` | `Progress` | Plans/orchestrator-subagent-integration.md |
| `widget.cta_stack` | `UserInteractionRequired`, alert events | Plans/human-in-the-loop.md |
| `widget.terminal_output` | `Output` (PTY stream) | Plans/orchestrator-subagent-integration.md |
| `widget.error_display` | `Error` | Plans/orchestrator-subagent-integration.md |
| `widget.agent_terminal` | `Output` (per-subagent, filtered by tier_id) | Plans/orchestrator-subagent-integration.md |
| `widget.interview_panel` | Interview event stream | Plans/interview-subagent-integration.md |
| `widget.tier_tree` | `TierChanged` + TierTree snapshot | Plans/orchestrator-subagent-integration.md |

### 8.2 Pull-Based Widgets (redb rollups)

These widgets read pre-computed rollups from redb (produced by analytics scan jobs per Plans/storage-plan.md):

| Widget ID | redb Key(s) | SSOT |
|-----------|------------|------|
| `widget.quota_summary` | `rollups/usage_5h.*`, `rollups/usage_7d.*` | Plans/usage-feature.md, Plans/storage-plan.md |
| `widget.budget_donuts` | `rollups/usage_5h.*`, `rollups/usage_7d.*` | Plans/usage-feature.md |
| `widget.alert_thresholds` | `rollups/usage_*`, config thresholds | Plans/usage-feature.md |
| `widget.analytics_chart` | `rollups/usage_*` (aggregated) | Plans/usage-feature.md |
| `widget.tool_usage` | `rollups/tool_usage.*`, `rollups/tool_latency.*` | Plans/storage-plan.md |
| `widget.platform_quota` | `rollups/usage_5h.*` + platform APIs | Plans/usage-feature.md |
| `widget.reset_countdown` | Platform API response or rate-limit event | Plans/Multi-Account.md |
| `widget.multi_account` | `settings/multi_account.*` + platform APIs | Plans/Multi-Account.md |
| `widget.ledger_table` | seglog query (type filter) | Plans/storage-plan.md |
| `widget.evidence_browser` | `evidence/<node_id>.json` + seglog | Plans/orchestrator-subagent-integration.md |
| `widget.history_list` | `redb:runs/*` | Plans/storage-plan.md |
| `widget.completed_prose` | Evidence summaries + tier descriptions | Plans/orchestrator-subagent-integration.md |

ContractRef: ContractName:Plans/Contracts_V0.md#EventRecord, ContractName:Plans/storage-plan.md

---

<a id="9-theming-integration"></a>
## 9. Theming Integration

All widgets MUST use `Theme.*` globals for colors, spacing, fonts, and effects (per Plans/FinalGUISpec.md section 6). No widget may hard-code colors or font sizes.

### 9.1 Widget Chrome

Every widget has a standard chrome (header bar + content area):
- **Header bar**: background `Theme.surface`, text `Theme.text-primary`, height 32px.
  - Left: drag handle (4px crosshatch, same as Plans/FinalGUISpec.md section 7.2).
  - Center: widget display name (editable via config).
  - Right: gear icon (config), close button (X, visible on hover).
- **Content area**: background `Theme.background`, border 1px `Theme.border`, border-radius per theme family.
- **Retro themes**: paper texture overlay and scanline effect applied to widget content area at theme-specified opacity.

### 9.2 Slint Component Naming

Each widget is a Slint component named `{WidgetName}Widget` in a file at `src/gui/slint/widgets/{widget_name}.slint`. Example: `OrchestratorStatusWidget` in `orchestrator_status.slint`.

All widget components accept a `config` property (JSON-decoded struct) and expose a `configure-requested` callback for the gear icon.

ContractRef: ContractName:Plans/FinalGUISpec.md#6, ContractName:Plans/FinalGUISpec.md#14

---

<a id="10-accessibility"></a>
## 10. Accessibility

### 10.1 Keyboard Navigation

- All widgets MUST be reachable via Tab key. Tab order follows grid position: left-to-right, top-to-bottom.
- Within a widget, standard keyboard navigation applies (arrows for lists, Enter for actions).
- Widget resize handles MUST be keyboard-accessible: focus the widget, then Ctrl+Arrow keys to change span (Ctrl+Right = grow col_span, Ctrl+Left = shrink col_span, Ctrl+Down = grow row_span, Ctrl+Up = shrink row_span).

### 10.2 Accessible Properties

- Each widget container has `accessible-role: "group"` and `accessible-label: "{widget display name}"`.
- The drag handle has `accessible-role: "button"` and `accessible-label: "Move {widget name}"`.
- The config gear has `accessible-role: "button"` and `accessible-label: "Configure {widget name}"`.
- The close button has `accessible-role: "button"` and `accessible-label: "Remove {widget name}"`.

### 10.3 Screen Reader

- When a widget's data updates (push-based), an `accessible-live: "polite"` region announces significant changes (e.g., state change from Running to Failed).
- The "Add Widget" button has `accessible-label: "Add widget to {page name}"`.

ContractRef: ContractName:Plans/FinalGUISpec.md#13

---

<a id="11-uicommand-ids"></a>
## 11. UICommand IDs

The following stable UICommand IDs are registered for the widget system:

| Command ID | Args | Behavior |
|-----------|------|----------|
| `cmd.widget.add` | `{ page: string, widget_id: string }` | Add widget to page at next available position |
| `cmd.widget.remove` | `{ page: string, instance_id: string }` | Remove widget instance from page |
| `cmd.widget.resize` | `{ page: string, instance_id: string, col_span: int, row_span: int }` | Resize widget to specified spans |
| `cmd.widget.configure` | `{ page: string, instance_id: string, config: object }` | Update widget configuration |
| `cmd.widget.move` | `{ page: string, instance_id: string, col: int, row: int }` | Move widget to new grid position |
| `cmd.widget.reset_layout` | `{ page: string }` | Reset page layout to defaults |

All commands MUST be dispatchable via the Command Palette (Ctrl+K) and programmatically from Rust code.

ContractRef: Primitive:UICommand (Plans/Contracts_V0.md#UICommand), ContractName:Plans/UI_Command_Catalog.md

---

<a id="12-acceptance-criteria"></a>
## 12. Acceptance Criteria

1. **Catalog completeness**: All widgets listed in section 2 exist as Slint components and render correctly with mock data.
2. **Grid layout**: Widgets snap to grid; no free-form resizing; responsive column changes at 1200px and 1600px breakpoints.
3. **Add/remove**: Widget catalog overlay opens, filtered by page; adding places widget correctly; removing triggers reflow.
4. **Configuration**: Gear icon opens inline config; changes persist immediately (debounced).
5. **Defaults**: First load of each page shows the default layout from section 6.3.
6. **Persistence**: Layout changes survive app restart (redb round-trip verified).
7. **Migration**: Old `dashboard_layout:v1` migrates to `widget_layout:v1:dashboard` on first load.
8. **Theming**: All widgets render correctly in all 4 built-in themes; no hard-coded colors.
9. **Accessibility**: All widgets reachable by keyboard; screen reader announces widget names and state changes.
10. **Performance**: Adding/removing/resizing widgets completes in < 100ms (no layout jank).

---

<a id="13-references"></a>
## 13. References

| Document | What It Provides |
|----------|-----------------|
| Plans/FinalGUISpec.md | Master layout (section 3), responsive grid (section 12.3), dashboard cards (section 7.2), widget primitives (section 8), persistence (section 15), accessibility (section 13), theme system (section 6) |
| Plans/Contracts_V0.md | EventRecord envelope, UICommand contract |
| Plans/storage-plan.md | redb namespaces, seglog schema, rollup keys, analytics scan |
| Plans/UI_Command_Catalog.md | UICommand registry and command palette integration |
| Plans/orchestrator-subagent-integration.md | PuppetMasterEvent variants, tier hierarchy, evidence bundles |
| Plans/interview-subagent-integration.md | Interview event stream |
| Plans/usage-feature.md | Usage data sources, rollup keys, per-thread usage |
| Plans/Multi-Account.md | Account registry, cooldown state, auto-rotation |
| Plans/human-in-the-loop.md | HITL approval events and policy |
| Plans/Run_Graph_View.md | Node Graph Display (NOT a widget) |
| Plans/Orchestrator_Page.md | Orchestrator 6-tab structure, per-tab default layouts |
