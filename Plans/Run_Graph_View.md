# Run Graph View (Node Graph Display) -- Specification

> **Compliance:** This document follows `Plans/DRY_Rules.md` and references SSOT contracts in `Plans/Contracts_V0.md`. Naming: “Puppet Master” only. No open questions; deterministic defaults per `Plans/Decision_Policy.md`.


<!--
PUPPET MASTER -- RUN GRAPH VIEW SSOT

Purpose:
- This file is the single source of truth for the Node Graph Display tab
  within the Orchestrator page.
- It defines the Airflow-inspired DAG visualization, node table, node detail
  panel, data model contract, layout algorithms, and performance requirements.
- The Node Graph Display is a full-page tab, NOT a portable widget.

ABSOLUTE NAMING RULE:
- Platform name is "Puppet Master" only.
- If older naming exists, refer to it only as "legacy naming" (do not quote it).

REFERENCE IMAGES:
- Concepts/dag_run_graph.png (dark theme)
- Concepts/dag_run_graph1.png (light theme)
- These Airflow-style screenshots define the layout pattern: graph left, node
  list + details right, minimap bottom-left, status colors, top bar with run
  metadata. Visual style MUST match Puppet Master theme tokens, not Airflow colors.
-->

**Date:** 2026-02-23
**Status:** Plan document -- defines the Node Graph Display for the Slint rewrite
**Depends on:** Plans/Orchestrator_Page.md, Plans/orchestrator-subagent-integration.md, Plans/FinalGUISpec.md

---

## Table of Contents

1. [Scope and Placement](#1-scope-and-placement)
2. [Layout (Three Regions)](#2-layout)
3. [TOP BAR: Run Header](#3-top-bar)
4. [LEFT: DAG Graph Panel](#4-dag-graph)
5. [RIGHT: Node Table](#5-node-table)
6. [RIGHT: Selected-Node Detail Panel](#6-node-detail)
7. [Data Model Contract (Rust Structs)](#7-data-model)
8. [State-to-Color Mapping (Theme Tokens)](#8-state-colors)
9. [DAG Layout Algorithms (5 Presets)](#9-layout-algorithms)
10. [Interactions](#10-interactions)
11. [Performance Requirements](#11-performance)
12. [Real-Time Update Strategy](#12-update-strategy)
13. [Theme Integration](#13-theme-integration)
14. [Slint Implementation Guide](#14-slint-implementation)
15. [Accessibility](#15-accessibility)
16. [Persistence](#16-persistence)
17. [UICommand IDs](#17-uicommand-ids)
18. [Acceptance Criteria](#18-acceptance-criteria)
19. [References](#19-references)

---

<a id="1-scope-and-placement"></a>
## 1. Scope and Placement

### 1.1 What This Is

This is the specification for the **Node Graph Display** tab on the Orchestrator page. It provides a non-editable, live-updating DAG visualization of Puppet Master plan_graph execution (self-build runs and user-project runs), inspired by Apache Airflow's Graph view.

### 1.2 Placement

- **Location**: Tab 3 ("Node Graph Display") on the Orchestrator page (Plans/Orchestrator_Page.md).
- **Full-page**: occupies the entire tab content area (below the tab bar).
- **NOT a widget**: this view is NOT in the widget catalog (Plans/Widget_System.md). It cannot be moved to the Dashboard or other pages.

### 1.3 Non-Editable

The graph is **read-only**. Users CANNOT:
- Move nodes, change dependencies, or rename nodes from this view.
- Edit the plan graph structure.

Users CAN:
- Control display: layout presets, zoom/pan/fit-to-screen.
- Filter and search nodes.
- Select nodes to see details.
- Approve/deny HITL requests from the detail panel.

ContractRef: ContractName:Plans/Orchestrator_Page.md, ContractName:Plans/orchestrator-subagent-integration.md

---

<a id="2-layout"></a>
## 2. Layout (Three Regions)

The view is divided into three regions matching the Airflow reference layout:

```
+---------------------------------------------------------------------+
| TOP BAR (60px): Run ID | Status | Duration | Counts | Controls      |
+---------------------------------------------------------------------+
|                           |                                         |
|  LEFT: DAG Graph          |  RIGHT: Node Table (top, resizable)     |
|  (60% default width)      |  --------------------------------       |
|                           |  RIGHT: Node Detail (bottom, expandable)|
|  [minimap, bottom-left]   |  (40% default width)                   |
|                           |                                         |
+---------------------------------------------------------------------+
```

- **Horizontal split**: LEFT and RIGHT separated by a draggable split bar. Default 60/40. Minimum widths: LEFT 400px, RIGHT 300px.
- **Vertical split** (RIGHT panel): Node Table and Node Detail separated by a draggable horizontal split bar. Default 40/60 (table gets less, detail gets more). User can collapse either section.

ContractRef: ContractName:Plans/FinalGUISpec.md#12

---

<a id="3-top-bar"></a>
## 3. TOP BAR: Run Header

Fixed-height bar (60px) at the top of the view. Contains:

| Element | Content | Behavior |
|---------|---------|----------|
| Run ID | `run_meta.run_id` | Selectable, copyable (Ctrl+C) |
| Run date | `run_meta.run_date` formatted | Static text |
| Status badge | `run_meta.status` (OrchestratorState) | Color-coded per section 8 |
| Start time | `run_meta.ts_start` formatted | Static text |
| End time | `run_meta.ts_end` formatted (or "--" if running) | Updates live |
| Elapsed | Wall-clock elapsed time | Live ticker (updates every second) |
| Status counts | Per-state counts (e.g., "5 passed, 2 running, 1 failed") | Color-coded badges, live-updated |
| Layout preset | Dropdown selector (5 presets, section 9) | Changes DAG layout |
| Zoom controls | Zoom in (+), Zoom out (-), Fit to screen | Buttons |
| Filter | Dropdown + search input | Filters visible nodes |
| Toggles | Hide completed, Show critical path only, Show blocked only | Toggle buttons |

ContractRef: ContractName:Plans/FinalGUISpec.md#7.2

---

<a id="4-dag-graph"></a>
## 4. LEFT: DAG Graph Panel

### 4.1 Node Rendering

Each node is a **rectangle** rendered in the graph canvas:
- **Width**: 160px (at 100% zoom)
- **Height**: 48px (at 100% zoom)
- **Background**: status color from section 8 (theme token)
- **Border**: 2px solid, darker shade of status color; **4px** when selected (accent color)
- **Content**:
  - Row 1: Tier type icon (phase/task/subtask) + title (truncated to ~18 chars with ellipsis)
  - Row 2: Status text + optional badges

### 4.2 Node Badges

Badges appear as small indicators on the node rectangle when the relevant data exists:

| Badge | Condition | Display |
|-------|-----------|---------|
| Attempt count | `attempts > 1` | Small circle with number (e.g., "3") at top-right |
| Duration | `elapsed_ms` available | "1m 23s" text below status |
| HITL waiting | `hitl_pending == true` | Pulsing dot at top-left, colored `Theme.graph-running` |
| Blocked | `blocked_reason` is set | Lock icon at top-left, colored `Theme.graph-failed` |

### 4.3 Edge Rendering

Dependency edges are drawn as lines/arrows from dependency node to dependent node:
- **Arrow direction**: from upstream (dependency) to downstream (dependent)
- **Color**: based on upstream node state:
  - Pending/Planning: `Theme.graph-pending` (gray)
  - Passed: `Theme.graph-passed` (green)
  - Failed: `Theme.graph-failed` (red)
  - Other: `Theme.border` (neutral)
- **Style**: solid line, 2px width, arrowhead at destination
- **Routing**: orthogonal routing (horizontal and vertical segments only) to avoid crossing through nodes

### 4.4 Minimap

- **Location**: bottom-left corner of the graph panel
- **Size**: 150x100px (fixed)
- **Content**: scaled-down view of the entire graph with colored node dots
- **Viewport rectangle**: semi-transparent overlay showing the currently visible portion
- **Interaction**: click on minimap to jump to that position; drag viewport rectangle to pan

### 4.5 Zoom and Pan

- **Zoom**: mouse wheel (Ctrl+wheel on trackpad). Range: 25% to 400%. Default: fit-to-screen.
- **Pan**: click-and-drag on empty canvas area, or middle-mouse-button drag anywhere.
- **Fit to screen**: button in top bar (also Ctrl+0). Adjusts zoom and pan so all nodes are visible with 20px padding.
- **Zoom indicator**: small text in bottom-right of graph panel showing current zoom % (e.g., "75%").

---

<a id="5-node-table"></a>
## 5. RIGHT: Node Table

### 5.1 Columns

| Column | Source Field | Sortable | Default Sort | Default Visible |
|--------|------------|----------|-------------|-----------------|
| Name | `id` + `title` | Yes | -- | Yes |
| Type | `tier_type` (Phase/Task/Subtask) | Yes | -- | Yes |
| State | `state` (color-coded badge) | Yes | Primary (by state priority) | Yes |
| Start | `start_ts` (formatted) | Yes | -- | Yes |
| End | `end_ts` (formatted, or "--") | Yes | -- | Yes |
| Duration | `elapsed_ms` (formatted) | Yes | -- | Yes |
| Tries | `attempts` | Yes | -- | Yes |
| Verification | `verifier_state` (badge) | Yes | -- | Yes |
| V. Start | `verifier_start_ts` (formatted) | Yes | -- | No (expandable) |
| V. End | `verifier_end_ts` (formatted, or "--") | Yes | -- | No (expandable) |
| V. Duration | `verifier_elapsed_ms` (formatted) | Yes | -- | No (expandable) |
| Blocked | `blocked_reason` (truncated) | Yes | -- | Yes |

**State sort priority** (highest to lowest): Failed > Escalated > Retrying > Running > Gating > Planning > Pending > Reopened > Skipped > Passed. On ties within the same state, sort by `start_ts` ascending (oldest first). For disconnected-state ties, sort by `node.id` lexicographically.

### 5.2 Filtering

- **Search**: text input searches across id and title fields.
- **State filter**: multi-select dropdown of TierState values.
- **Quick filters** (toggle buttons):
  - "Failed" -- show only Failed nodes
  - "Blocked" -- show only nodes with blocked_reason
  - "Running" -- show only Running/Gating nodes
  - "Needs Approval" -- show only nodes with hitl_pending
  - "Upstream Failed" -- show only nodes whose dependencies failed

### 5.3 Two-Way Selection Sync

- **Table -> Graph**: clicking a row in the table highlights and centers the corresponding node in the DAG graph.
- **Graph -> Table**: clicking a node in the graph scrolls the table to show and highlight the corresponding row.
- **Multi-select**: Ctrl+click in either panel adds to selection. Shift+click in table selects range.

### 5.4 Virtualization

The node table MUST be virtualized (render only visible rows + overscan buffer) to handle 500+ nodes without performance degradation.

---

<a id="6-node-detail"></a>
## 6. RIGHT: Selected-Node Detail Panel

When a node is selected, the detail panel shows comprehensive information organized into 8 collapsible sections. The panel updates **live** as events arrive for the selected node.

### C1. Node Summary

| Field | Source |
|-------|--------|
| Node ID | `GraphNode.id` |
| Title | `GraphNode.title` |
| Objective | `GraphNode.objective` |
| Tier Type | `GraphNode.tier_type` (Phase/Task/Subtask/Iteration) |
| State | `GraphNode.state` (color-coded badge) |
| Run Date | `RunGraphMeta.run_date` |
| Start / End / Elapsed | `GraphNode.start_ts` / `end_ts` / `elapsed_ms` |
| Attempts | `GraphNode.attempts` (with retry count) |
| Blocked Reason | `GraphNode.blocked_reason` (if set) |
| HITL Status | "Pending approval" or "No HITL request" |

### C2. Plan Mapping

Shows where this node maps to the human-readable plan (plan.md):

| Field | Source | Behavior |
|-------|--------|----------|
| Breadcrumb | `GraphNode.plan_mapping.plan_breadcrumb` | E.g., "Phase 1 > Task 2 > Subtask 3" |
| Section heading | `GraphNode.plan_mapping.plan_section_anchor` | Plan section title |
| Excerpt | `GraphNode.plan_mapping.plan_excerpt` | 1-3 lines of plan text (read-only) |
| "Open plan at section" | Action button | Navigate to plan view or open plan artifact in File Editor, scrolled to the relevant section |
| "Copy plan reference" | Action button | Copy breadcrumb + anchor to clipboard |

Data source: plan_mapping fields are populated from canonical project artifacts defined in `Plans/Project_Output_Artifacts.md` (canonical graph entrypoint `.puppet-master/project/plan_graph/index.json`, referenced `plan_graph/nodes/<node_id>.json`, and human-readable `.puppet-master/project/plan.md`) and extracted by node hierarchy position.

ContractRef: ContractName:Plans/orchestrator-subagent-integration.md

### C3. Worker Activity (Real-Time)

Live stream of what the worker agent is doing for this node:

| Element | Content | Behavior |
|---------|---------|----------|
| Worker identity | Subagent persona name (e.g., "rust-engineer") | Static per iteration |
| Provider / Model | Platform and model used (e.g., "Claude Code / claude-opus-4-6") | Static per iteration |
| Progress stream | Live text output from worker | Auto-scroll, monospace font |
| Tool calls | Collapsible list of tool invocations | Each entry: tool name, args summary (collapsed), result summary, duration, error (if any). Expand for full args/result. |
| Files changed | List of files modified by this node's worker | Each entry: file path, +N -M counts. Click to open diff in File Editor. |
| Evidence produced | Links to evidence artifacts | Each entry: evidence type, description. Click to open in Evidence view. |

Data source: `PuppetMasterEvent::Output` (filtered by tier_id), `PuppetMasterEvent::EvidenceStored`, tool call events from the worker's session. **Backend requirement**: `Output` events MUST carry a `tier_id` field to enable per-node filtering; if the current event schema lacks this field, it must be added before this view can be implemented.

ContractRef: ContractName:Plans/orchestrator-subagent-integration.md

### C4. Verifier Activity (Real-Time)

Live stream of the verification process for this node:

| Element | Content | Behavior |
|---------|---------|----------|
| Verifier identity | Verifier agent name / persona | Static per verification |
| Provider / Model | Platform and model used | Static per verification |
| Verification timing | Start / End / Elapsed | Updates live until complete |
| Acceptance checks | List of checks from acceptance_criteria | Each: check description, pass/fail badge, detail (collapsible) |
| Invariants checked | List of invariant checks | Each: invariant name, pass/fail badge |
| Evidence validation | Results of evidence validation | Pass/fail per evidence item |
| Final verdict | "PASS" or "FAIL" badge | With reason text |

Data source: `PuppetMasterEvent::GateStart`, `GateComplete`, verification events scoped to this node's tier_id.

ContractRef: ContractName:Plans/orchestrator-subagent-integration.md

### C5. Model, Reasoning, Tokens, and Usage Link

Shows the AI model details and resource consumption for both worker and verifier:

| Field | Worker | Verifier |
|-------|--------|----------|
| Model | `GraphNode.worker_model` | `GraphNode.verifier_model` |
| Reasoning effort | `GraphNode.worker_reasoning_effort` | (if applicable) |
| Input tokens | `GraphNode.worker_tokens.input` | `GraphNode.verifier_tokens.input` |
| Output tokens | `GraphNode.worker_tokens.output` | `GraphNode.verifier_tokens.output` |
| Reasoning tokens | `GraphNode.worker_tokens.reasoning` | `GraphNode.verifier_tokens.reasoning` |
| Cost | `GraphNode.worker_tokens.cost_usd` | `GraphNode.verifier_tokens.cost_usd` |
| Total cost | Sum of worker + verifier cost | -- |

**Usage link**: "View in Usage" button/link that navigates to the Usage page with a filter applied to show only events for this node (filter by `tier_id`). If the Usage page supports per-node breakdown, this link focuses on that node's row.

Data source: Token usage fields populated from `UsageRecord` entries (Plans/usage-feature.md) correlated by `tier_id`.

ContractRef: ContractName:Plans/usage-feature.md

### C6. HITL Controls

When the selected node has a pending HITL request (`hitl_pending == true`):

| Element | Behavior |
|---------|----------|
| Request description | Shows the HITL request message (from `UserInteractionRequired.message`) |
| Policy mode | Displays current policy mode: "auto", "ask", or "deny" |
| Escalation rationale | If escalated, shows why the system escalated to HITL approval |
| **Approve** button | Green button; click approves the request. Updates node state immediately. |
| **Deny** button | Red button; click denies the request. |
| Rationale text field | Optional text input for the user to explain their decision |
| Status after action | Shows "Approved at {time}" or "Denied at {time}" with rationale |

When no HITL request is pending: section shows "No pending approvals for this node."

Actions wire to the existing HITL approval pathway (Plans/human-in-the-loop.md). After approval/denial:
- Node state updates immediately in the graph and table.
- Orchestrator scheduler re-evaluates runnable nodes (non-blocked continuation).

ContractRef: ContractName:Plans/human-in-the-loop.md

### C7. Dependencies

Two sub-sections:

**Upstream (dependencies this node waits on):**
| Node ID | Title | State | Action |
|---------|-------|-------|--------|
| Listed from `deps_up` | Title text | Color-coded badge | Click to select (navigates graph + table) |

**Downstream (nodes waiting on this node):**
| Node ID | Title | State | Action |
|---------|-------|-------|--------|
| Listed from `deps_down` | Title text | Color-coded badge | Click to select (navigates graph + table) |

### C8. Logs & Events

| Element | Content | Behavior |
|---------|---------|----------|
| Event IDs | List of `event_refs` for this node | Each: event type, timestamp, sequence number |
| Correlation IDs | `run_id`, `tier_id` | Copyable |
| Raw log pointer | Link to raw log file/artifact | Click to open in File Editor or external viewer |
| Event timeline | Expandable chronological list of all events for this node | Filterable by event type |

Data source: seglog events filtered by `tier_id` and `run_id`.

---

<a id="7-data-model"></a>
## 7. Data Model Contract (Rust Structs)

These are the GUI-facing projection structs. They are computed from the backend's `TierTree` + event stream and exposed to the Slint UI layer.

### 7.1 RunGraphMeta

```rust
/// Metadata for the entire run, displayed in the top bar.
/// Computed from OrchestratorState + event stream.
pub struct RunGraphMeta {
    pub run_id: String,
    pub run_date: DateTime<Utc>,
    pub ts_start: DateTime<Utc>,
    pub ts_end: Option<DateTime<Utc>>,
    pub elapsed_ms: u64,
    pub status: OrchestratorState,
    pub counters_by_state: HashMap<TierState, u32>,
}
```

### 7.2 GraphNode

```rust
/// Projection of a single node for the Run Graph View.
/// One instance per tier node in the plan graph.
pub struct GraphNode {
    pub id: String,
    pub title: String,
    pub objective: Option<String>,
    pub state: TierState,
    pub tier_type: TierType,
    pub deps_up: Vec<String>,
    pub deps_down: Vec<String>,
    pub run_date: DateTime<Utc>,
    pub start_ts: Option<DateTime<Utc>>,
    pub end_ts: Option<DateTime<Utc>>,
    pub elapsed_ms: Option<u64>,
    pub attempts: u32,
    pub retry_count: u32,
    pub blocked_reason: Option<String>,
    pub evidence_refs: Vec<String>,
    pub event_refs: Vec<String>,
    pub worker_activity_refs: Vec<String>,
    pub worker_identity: Option<String>,
    pub worker_provider: Option<String>,
    pub worker_model: Option<String>,
    pub worker_reasoning_effort: Option<String>,
    pub worker_tokens: TokenUsage,
    pub verifier_state: Option<VerificationState>,
    pub verifier_identity: Option<String>,
    pub verifier_provider: Option<String>,
    pub verifier_model: Option<String>,
    pub verifier_start_ts: Option<DateTime<Utc>>,
    pub verifier_end_ts: Option<DateTime<Utc>>,
    pub verifier_elapsed_ms: Option<u64>,
    pub verifier_refs: Vec<String>,
    pub verifier_tokens: TokenUsage,
    pub hitl_pending: bool,
    pub hitl_request_id: Option<String>,
    pub plan_mapping: PlanMapping,
}
```

### 7.3 Supporting Structs

```rust
/// Token usage for a single agent (worker or verifier).
/// Projected from UsageRecord entries (Plans/usage-feature.md) correlated by tier_id.
/// Backend requirement: UsageRecord MUST provide per-tier worker/verifier
/// breakdowns with input/output/reasoning splits. If the current UsageRecord
/// only has aggregate `tokens: Option<u64>`, it must be extended.
pub struct TokenUsage {
    pub input: u64,
    pub output: u64,
    pub reasoning: u64,
    pub cost_usd: Option<f64>,
}

/// Maps a node to its position in the human-readable plan.
pub struct PlanMapping {
    pub plan_breadcrumb: String,         // "Phase 1 > Task 2 > Subtask 3"
    pub plan_section_anchor: Option<String>,  // Heading or anchor ID in plan.md
    pub plan_excerpt: Option<String>,    // 1-3 lines of relevant plan text
}

/// A single edge in the DAG.
pub struct GraphEdge {
    pub from: String,  // upstream node id
    pub to: String,    // downstream node id
}

/// Verification state for a node.
/// NOTE: This is a new projection enum introduced by this spec.
/// It MUST be added to puppet-master-rs/src/types/state.rs alongside TierState.
/// If a backend VerificationState already exists, use that instead.
pub enum VerificationState {
    Pending,
    InProgress,
    Passed,
    Failed,
}

/// Layout position computed by the layout engine.
pub struct NodePosition {
    pub node_id: String,
    pub x: f64,
    pub y: f64,
    pub width: f64,
    pub height: f64,
}
```

### 7.4 Relationship to Existing Structs

These projection structs are **computed from** existing backend structs:
- `TierNode` (puppet-master-rs/src/core/tier_node.rs): provides id, tier_type, title, description, dependencies, state_machine.
- `TierTree` (same file): arena-based storage; used to build the full graph.
- `TierState` (puppet-master-rs/src/types/state.rs): enum values map directly to `GraphNode.state`.
- `PuppetMasterEvent` variants (puppet-master-rs/src/types/events.rs): `TierChanged`, `IterationStart/Complete`, `GateStart/Complete`, `Progress`, `Output`, `Error`, `UserInteractionRequired`, `EvidenceStored`.
- `UsageRecord` (puppet-master-rs/src/types/budget.rs): provides token counts and cost.
- `StoredEvidence` (puppet-master-rs/src/types/evidence.rs): evidence type and file path.

The view-model layer converts backend structs to `GraphNode` projections on initial load, then applies incremental updates as events arrive.

ContractRef: DRY:DATA:TierTree, DRY:DATA:TierState, DRY:DATA:PuppetMasterEvent

---

<a id="8-state-colors"></a>
## 8. State-to-Color Mapping (Theme Tokens)

All colors use theme tokens. No hard-coded hex values in Slint components.

| TierState | Theme Token | Retro Dark | Retro Light | Basic Dark | Basic Light |
|-----------|------------|------------|-------------|------------|-------------|
| Pending | `Theme.graph-pending` | #6C757D | #ADB5BD | #6C757D | #ADB5BD |
| Planning | `Theme.graph-planning` | #FFC107 | #FFD54F | #FFC107 | #FFD54F |
| Running | `Theme.graph-running` | #FF9800 | #FFB74D | #FF9800 | #FFB74D |
| Gating | `Theme.graph-gating` | #E040FB | #CE93D8 | #AB47BC | #CE93D8 |
| Passed | `Theme.graph-passed` | #4CAF50 | #66BB6A | #4CAF50 | #66BB6A |
| Failed | `Theme.graph-failed` | #F44336 | #EF5350 | #F44336 | #EF5350 |
| Escalated | `Theme.graph-escalated` | #FF5722 | #FF8A65 | #FF5722 | #FF8A65 |
| Retrying | `Theme.graph-retrying` | #FFEB3B | #FFF176 | #FFEB3B | #FFF176 |
| Skipped | `Theme.graph-skipped` | #607D8B | #90A4AE | #607D8B | #90A4AE |
| Reopened | `Theme.graph-reopened` | #00BCD4 | #4DD0E1 | #00BCD4 | #4DD0E1 |

**Edge colors** derive from the upstream node's state color (same token, but at 60% opacity for the line).

**Selected node border**: `Theme.accent` color (4px border).

These tokens MUST be added to the theme system (Plans/FinalGUISpec.md section 6) as new `Theme.graph-*` properties. Custom themes can override these.

ContractRef: ContractName:Plans/FinalGUISpec.md#6

---

<a id="9-layout-algorithms"></a>
## 9. DAG Layout Algorithms (5 Presets)

All layout algorithms are **deterministic**: same graph + same preset = same layout every time.

Layout computation runs on a **background thread** (tokio::spawn_blocking). The UI shows a skeleton/shimmer during layout computation. Layout positions are cached per `(run_id, preset)` tuple.

### 9.1 Preset Table

| # | Preset Name | Algorithm | Direction | Best For |
|---|------------|-----------|-----------|----------|
| 1 | **Layered L-R** (default) | Sugiyama layered | Left to Right | Dependency flow visualization |
| 2 | Layered T-B | Sugiyama layered | Top to Bottom | Vertical hierarchy view |
| 3 | Compact | Minimize edge crossings + spacing | Left to Right | Maximizing node visibility in small space |
| 4 | Grouped by Phase | Phase containers with internal layout | Left to Right | Phase-level overview with grouped tasks |
| 5 | Critical Path | Same as Layered L-R but with critical path highlighted | Left to Right | Identifying bottleneck chain |

### 9.2 Sugiyama Algorithm Steps (Presets 1, 2)

1. **Layer assignment**: assign each node to a layer based on longest path from entry points.
2. **Crossing reduction**: Barycenter heuristic to minimize edge crossings within each layer.
3. **Coordinate assignment**: Brandes-Kopf for compact horizontal/vertical positioning.
4. **Edge routing**: orthogonal routing with bend minimization.

**Deterministic tie-break rules** (to guarantee same graph → same layout):
- Layer assignment ties: break by `node.id` lexicographic order.
- Barycenter ties in crossing reduction: break by `node.id` lexicographic order.
- Node ordering within a layer: after crossing reduction, stable-sort by `node.id` for equal barycenters.
- Disconnected subgraphs: order subgraphs by the lexicographically smallest `node.id` in each subgraph.
- All traversals use a deterministic iteration order (sorted `node.id`).

### 9.3 Grouped by Phase (Preset 4)

- Phase nodes become **containers** (larger rectangles with a header showing phase title).
- Task/subtask nodes are laid out inside their parent phase container.
- Phase containers are laid out left-to-right based on phase dependencies.
- Within a container: Sugiyama layout for tasks/subtasks.

### 9.4 Critical Path (Preset 5)

- Same layout as Layered L-R.
- **Critical path** = longest path from start to current frontier (or end if complete).
- Critical path nodes: thicker border (4px vs 2px), brighter status color.
- Critical path edges: thicker (3px vs 2px), fully opaque.
- Non-critical nodes and edges: reduced opacity (50%).

### 9.5 Large-Graph Fallback

When node count exceeds a threshold (default: 200 nodes):
- **Label simplification**: truncate node titles to 12 chars.
- **Edge simplification**: straight lines instead of orthogonal routing.
- **Optional group collapse**: phases with all children in same state (e.g., all Passed) collapse to a single summary node showing "{N} tasks passed". Click to expand.

When node count exceeds 500:
- Additionally: reduce node rectangle size (120x36px at 100% zoom).
- Enable level-of-detail: at zoom < 50%, nodes render as colored dots only (no text).

---

<a id="10-interactions"></a>
## 10. Interactions

### 10.1 Mouse Interactions

| Action | Target | Behavior |
|--------|--------|----------|
| Click | Node | Select node; show details in panel; highlight row in table |
| Ctrl+Click | Node | Add/remove from multi-selection |
| Double-click | Node | Open that tier in the Tiers tab (Orchestrator_Page.md tab 2) |
| Right-click | Node | Context menu: "View Evidence", "View in Tiers", "Retry", "Replan", "Reopen" (per tier state) |
| Hover | Node | Tooltip: id, title, state, start/end time, elapsed, attempts |
| Click-drag | Empty area | Pan the graph |
| Scroll wheel | Anywhere | Zoom in/out |
| Click | Minimap | Jump to that position |
| Drag | Minimap viewport | Pan the graph |
| Click | Table row | Select node; highlight in graph; show details |

### 10.2 Keyboard Interactions

| Key | Behavior |
|-----|----------|
| Arrow keys | Move selection to connected node (Up/Down = upstream/downstream for L-R; Left/Right for T-B) |
| Tab | Cycle focus between regions: Top Bar -> Graph -> Table -> Detail |
| Enter | On selected node: expand/collapse detail section |
| Escape | Deselect all; close context menu |
| Ctrl+0 | Fit to screen |
| Ctrl++ / Ctrl+- | Zoom in / out |
| Ctrl+F | Focus search/filter input |
| F5 | Refresh graph data |
| Space | On node with HITL pending: open HITL approve/deny dialog |

### 10.3 Context Menu Actions

When right-clicking a node, available actions depend on node state:

| Action | Available When | Behavior |
|--------|---------------|----------|
| View Evidence | `evidence_refs` not empty | Navigate to Evidence tab filtered to this node |
| View in Tiers | Always | Switch to Tiers tab, expand tree to this node |
| Retry | State is Failed | Trigger retry for this node (dispatches UICommand) |
| Replan | State is Failed or Escalated | Trigger replanning for this node |
| Reopen | State is Passed or Skipped | Reopen this node for re-execution |
| Copy Node ID | Always | Copy tier_id to clipboard |
| View Usage | Always | Navigate to Usage page filtered by this node |

ContractRef: ContractName:Plans/FinalGUISpec.md#7.2, ContractName:Plans/FinalGUISpec.md#13

---

<a id="11-performance"></a>
## 11. Performance Requirements

| Metric | Target | Stretch |
|--------|--------|---------|
| Max nodes rendered | 500 | 1000 |
| Frame rate during pan/zoom | 60 fps | 60 fps |
| Layout computation (500 nodes) | < 500ms | < 200ms |
| Initial load (500 nodes) | < 1s | < 500ms |
| Node state update (single node) | < 16ms (1 frame) | < 8ms |
| Table scroll (500 rows) | 60 fps | 60 fps |

### 11.1 Optimization Strategies

- **Graph viewport culling**: only render nodes and edges within the visible viewport (+ 200px overscan buffer).
- **Table virtualization**: only render visible rows in the node table (+ 10 row overscan).
- **Incremental updates**: state changes update single node color/badge without re-layout.
- **Layout caching**: computed positions cached per `(run_id, preset)`. Re-layout only on: initial load, structural change (new nodes added), or preset change.
- **Memory**: hold `Vec<GraphNode>` (lightweight projections), NOT full `TierNode` objects.
- **Debounce rapid events**: batch event processing at 16ms intervals (one frame) during burst updates.

---

<a id="12-update-strategy"></a>
## 12. Real-Time Update Strategy

### 12.1 Initial Load

1. Load `TierTree` from backend (or redb checkpoint).
2. Convert all `TierNode` entries to `GraphNode` projections.
3. Build `Vec<GraphEdge>` from dependency lists.
4. Compute layout positions for the active preset.
5. Render graph, populate table, show "Select a node" placeholder in detail panel.

### 12.2 Incremental Updates

When events arrive via `invoke_from_event_loop`:

| Event Type | Update Action |
|------------|--------------|
| `TierChanged` | Update `GraphNode.state` for affected node. Update color in graph. Update badge in table. If selected, update detail panel. |
| `IterationStart` | Update `GraphNode.start_ts`, `attempts`. Show "Running" state. |
| `IterationComplete` | Update `GraphNode.end_ts`, `elapsed_ms`. Compute duration. |
| `GateStart` | Update `GraphNode.verifier_state` to InProgress. |
| `GateComplete` | Update `GraphNode.verifier_state` to Passed/Failed. Update verdict in C4. |
| `Progress` | Update `RunGraphMeta.counters_by_state`. Update top bar counts. |
| `Output` | If selected node matches tier_id: append to C3 worker activity stream. |
| `Error` | If selected node matches: append to C3 or show error in C1. |
| `UserInteractionRequired` | Set `hitl_pending = true` on matching node. Show HITL badge. If selected, show C6 controls. |
| `EvidenceStored` | Add to `evidence_refs` on matching node. If selected, update C3 evidence list. |

### 12.3 Structural Changes

When new nodes are added to the graph (rare, only during replanning):
1. Add new `GraphNode` projections.
2. Update `Vec<GraphEdge>`.
3. Re-compute layout positions (full re-layout on background thread).
4. Animate transition (nodes slide to new positions over 200ms).

### 12.4 Throttling

During rapid event bursts (e.g., parallel execution completing many subtasks):
- Batch visual updates at 60fps (16ms intervals).
- Accumulate state changes and apply as a single batch per frame.
- Top bar counters update at most once per frame.

---

<a id="13-theme-integration"></a>
## 13. Theme Integration

- All colors via `Theme.graph-*` tokens (section 8) plus existing `Theme.*` tokens.
- Graph background: `Theme.background`.
- Node text: `Theme.text-primary` (on dark status colors use white override for contrast).
- Table: standard FinalGUISpec table styling (section 8).
- Detail panel: standard FinalGUISpec panel styling.
- Minimap background: `Theme.surface` at 80% opacity.
- Retro themes: scanline effect applies to the graph panel at theme-specified opacity.

ContractRef: ContractName:Plans/FinalGUISpec.md#6

---

<a id="14-slint-implementation"></a>
## 14. Slint Implementation Guide

This section specifies the implementation details for the `RunGraphView.slint` component and its Rust backing.

### 14.1 Component Structure (`RunGraphView.slint`)

The component MUST expose properties for data model injection and callbacks for interactions.

```slint
import { Button, VerticalBox, HorizontalBox, ScrollView, ListView } from "std-widgets.slint";
import { Theme } from "../theme.slint";

export struct GraphNodeUI {
    id: string,
    title: string,
    x: length,
    y: length,
    width: length,
    height: length,
    state: string, // "pending", "running", "passed", etc.
    selected: bool,
    state_color: color,     // pre-resolved from state via Rust
    border_color: color,    // pre-resolved darker shade or accent if selected
    attempts: int,
    hitl_pending: bool,
    blocked: bool,
    duration_text: string,  // pre-formatted "1m 23s" or ""
    tier_type: string,      // "phase", "task", "subtask"
}

export struct EdgeUI {
    path_data: string, // SVG path command
    stroke_color: color, // pre-resolved from upstream node state via Rust
}

export component RunGraphView {
    // Data Properties
    // NOTE: nodes and edges contain ONLY visible items (viewport-culled by Rust).
    // The Rust view-model filters the full node/edge lists to those intersecting
    // the current viewport (with 200px overscan) before updating these models.
    in property <[GraphNodeUI]> nodes;
    in property <[EdgeUI]> edges;
    in property <string> run_id;
    in property <string> run_status;
    in property <string> selected_node_id;
    in property <float> zoom_level: 1.0;
    in property <{x: length, y: length}> pan_offset;

    // Interaction Callbacks
    callback node_clicked(string); // node_id
    callback background_clicked();
    callback pan_delta(length, length); // dx, dy
    callback zoom_delta(float); // factor
    callback layout_preset_selected(int);
    callback hitl_action(string, string, string); // node_id, action (approve/deny), rationale

    // Layout
    VerticalBox {
        // Top Bar
        HorizontalBox { height: 60px; /* ... run header ... */ }

        HorizontalBox {
            // Left: Graph Canvas
            Rectangle {
                clip: true;
                background: Theme.base-background;
                // Event handler for pan/zoom
                TouchArea {
                    moved => { root.pan_delta(self.mouse-x - self.pressed-x, self.mouse-y - self.pressed-y); }
                    scroll-event(event) => { /* handle zoom via zoom_delta callback */ }
                }

                // Canvas content (translated; zoom is applied by Rust to node x/y/w/h)
                // NOTE: Slint Rectangle does not have a `scale` property.
                // Zoom is implemented by the Rust view-model multiplying all
                // NodePosition x/y/width/height by zoom_level before passing
                // to the Slint model. This avoids Slint transform limitations.
                Rectangle {
                    x: root.pan_offset.x;
                    y: root.pan_offset.y;

                    // Edges (bottom layer)
                    // NOTE: width/height set to 0px to disable Slint's default
                    // scale-to-fit behavior (Path defaults to 100% parent size).
                    // With 0px dimensions, SVG path commands render in native
                    // graph coordinates (already zoom-adjusted by Rust).
                    for edge in root.edges : Path {
                        width: 0px;
                        height: 0px;
                        commands: edge.path_data;
                        stroke: edge.stroke_color;
                        stroke-width: 2px;
                    }

                    // Nodes (top layer)
                    for node in root.nodes : Rectangle {
                        x: node.x;
                        y: node.y;
                        width: node.width;
                        height: node.height;
                        background: node.state_color;
                        border-width: node.selected ? 4px : 2px;
                        border-color: node.border_color;

                        TouchArea { clicked => { root.node_clicked(node.id); } }

                        // Node content...
                        Text { text: node.title; /* ... */ }
                    }
                }

                // Minimap overlay (bottom-left)
                Rectangle { /* ... */ }
            }

            // Right: Split Panel (List + Details)
            VerticalBox {
                width: 400px; // Default width, resizable in real impl
                
                // Node Table
                ListView { /* ... */ }

                // Node Details
                ScrollView {
                    visible: root.selected_node_id != "";
                    // ... detail sections ...
                }
            }
        }
    }
}
```

ContractRef: ContractName:Plans/FinalGUISpec.md#14, ContractName:Plans/Contracts_V0.md

### 14.2 Rust View-Model Integration

The Rust backend MUST implement a view-model struct that holds the state and handles Slint callbacks.

```rust
struct RunGraphViewModel {
    // State
    run_meta: RunGraphMeta,
    nodes: Vec<GraphNode>,
    edges: Vec<GraphEdge>,
    layout_cache: HashMap<(String, LayoutPreset), Vec<NodePosition>>,
    view_state: ViewState, // zoom, pan, selection, viewport bounds
    visible_nodes: Vec<usize>, // indices into `nodes` that intersect the viewport
    visible_edges: Vec<usize>, // indices into `edges` with at least one endpoint visible

    // Slint Handle
    ui_handle: Weak<RunGraphView>,
}

impl RunGraphViewModel {
    fn new(ui_handle: Weak<RunGraphView>, initial_tree: &TierTree) -> Self {
        // 1. Convert TierTree nodes to Vec<GraphNode> projections
        // 2. Build Vec<GraphEdge> from dependency lists
        // 3. Compute initial layout (Layered L-R preset)
        // 4. Compute initial viewport-visible subset
        // 5. Push initial data to Slint model
        // Return initialized struct
        todo!()
    }

    /// Called when new events arrive via invoke_from_event_loop.
    /// Events are batched at 16ms intervals by a timer; this processes the batch.
    fn on_event_batch(&mut self, events: &[PuppetMasterEvent]) {
        let mut structural_change = false;
        for event in events {
            match event {
                // Update the specific GraphNode fields per section 12.2 mapping
                // Set structural_change = true if new nodes/edges added
                _ => { /* per-event-type update logic */ }
            }
        }
        if structural_change {
            self.recompute_layout_async(); // spawn_blocking
        }
        self.update_visible_set(); // re-filter nodes/edges by viewport
        self.push_to_slint(); // ModelRc row-level updates, not full replacement
    }

    fn compute_layout(&self, preset: LayoutPreset) -> Vec<NodePosition> {
        // Runs on spawn_blocking thread.
        // Implements Sugiyama (section 9.2) with deterministic tie-break rules.
        // Returns calculated x/y/w/h for all nodes.
        todo!()
    }

    /// Filters nodes/edges to those intersecting the current viewport.
    /// Viewport = visible screen area in graph coordinates (accounting for zoom/pan).
    /// Overscan buffer: 200px on each side.
    fn update_visible_set(&mut self) {
        // Recompute visible_nodes and visible_edges from view_state viewport bounds
        // Push filtered model to Slint (only visible items in the repeater models)
    }

    /// Resolves state-to-color mapping using theme tokens.
    /// Called when building GraphNodeUI items for Slint.
    fn resolve_node_color(&self, state: &TierState) -> (Color, Color) {
        // Returns (state_color, border_color) from theme token lookup
        todo!()
    }
}
```

### 14.3 Performance Optimization in Slint

1. **Viewport Culling**: The Rust view-model maintains the visible viewport bounds (in graph coordinates, accounting for zoom and pan). Only nodes whose bounding rectangles intersect the viewport (+ 200px overscan) are included in the `nodes` model passed to Slint. Similarly, only edges with at least one endpoint in the visible set are included in the `edges` model. When the user pans or zooms, the Rust view-model recomputes the visible set and updates the Slint models via `ModelRc` row-level mutations.
2. **Zoom via Coordinate Multiplication**: Since Slint `Rectangle` does not have a `scale` property, the Rust view-model multiplies all `NodePosition` coordinates (`x`, `y`, `width`, `height`) by `zoom_level` before passing them to the `GraphNodeUI` Slint struct. Edge SVG path data is similarly recomputed at the current zoom level.
3. **Color Pre-Resolution**: State-to-color mapping is resolved in Rust (not Slint) because Slint properties are static bindings, not callable functions. The Rust view-model looks up `Theme.graph-*` token values and writes pre-resolved `state_color` and `border_color` into each `GraphNodeUI`. Similarly, edge `stroke_color` is pre-resolved from the upstream node's state.
4. **Canvas Rendering Fallback**: For 500+ nodes, standard `Rectangle` widgets may have overhead. If performance drops < 60fps, switch to a custom `Canvas` widget (Slint's `Image` populated by a Rust software renderer or custom shader) for the graph background, using `TouchArea` overlay for interaction.
5. **ListView Virtualization**: The node table MUST use `ListView` which supports virtualization natively.
6. **Change Tracking**: Only update properties that change. Do not replace the entire `nodes` model vector on every status change; use `ModelRc` in Slint to update specific row/item data.

---

<a id="15-accessibility"></a>
## 15. Accessibility

- **Graph panel**: `accessible-role: "application"`, `accessible-label: "Node graph for run {run_id}"`.
- **Each node**: `accessible-role: "button"`, `accessible-label: "{title}, {state}"`.
- **Node table**: standard table accessibility (column headers, row labels).
- **Detail panel sections**: each section is a collapsible group with `accessible-role: "region"`, `accessible-label: "{section name}"`.
- **HITL controls**: Approve/Deny buttons are focus-trapped when HITL pending; Enter activates focused button.
- **Keyboard-only navigation**: all interactions achievable without mouse (section 10.2).
- **Color contrast**: all status colors meet WCAG AA contrast ratio against their background (at minimum; Basic themes target AAA).
- **Live region announcements** (WCAG 4.1.3): top-bar status counts and overall run status use `accessible-role: "status"` (live region, polite) so screen readers announce changes without stealing focus. Node state transitions are NOT individually announced (too noisy); users query state via node selection.
- **Reduced motion**: when the OS prefers-reduced-motion setting is active, structural re-layout animations (section 12.3, 200ms transition) are replaced with instant repositioning. Pulsing HITL badge is replaced with a static badge.

ContractRef: ContractName:Plans/FinalGUISpec.md#13

---

<a id="16-persistence"></a>
## 16. Persistence

| Key | Content | Write Frequency |
|-----|---------|----------------|
| `graph_view_state:v1:{run_id}` | `{ preset, zoom, pan_x, pan_y, selected_node_id }` | On change (debounced 500ms) |
| `graph_layout_cache:v1:{run_id}:{preset}` | `Vec<NodePosition>` (cached layout) | After layout computation |

On view load: restore preset, zoom, pan, and selection from redb. If no persisted state, use defaults (Layered L-R preset, fit-to-screen, no selection).

ContractRef: ContractName:Plans/storage-plan.md

---

<a id="17-uicommand-ids"></a>
## 17. UICommand IDs

| Command ID | Args | Behavior |
|-----------|------|----------|
| `cmd.graph.select_node` | `{ node_id: string }` | Select node in graph + table |
| `cmd.graph.deselect` | `{}` | Deselect all |
| `cmd.graph.zoom` | `{ level: float }` | Set zoom level (0.25 to 4.0) |
| `cmd.graph.fit_to_screen` | `{}` | Fit all nodes in viewport |
| `cmd.graph.layout_preset` | `{ preset: string }` | Switch layout preset |
| `cmd.graph.focus_node` | `{ node_id: string }` | Center viewport on node |
| `cmd.graph.filter` | `{ states: string[], search: string }` | Apply filters |
| `cmd.graph.retry_node` | `{ node_id: string }` | Retry a failed node |
| `cmd.graph.replan_node` | `{ node_id: string }` | Replan a failed/escalated node |
| `cmd.graph.reopen_node` | `{ node_id: string }` | Reopen a passed/skipped node |
| `cmd.graph.approve_hitl` | `{ node_id: string, rationale: string }` | Approve HITL request |
| `cmd.graph.deny_hitl` | `{ node_id: string, rationale: string }` | Deny HITL request |

ContractRef: Primitive:UICommand (Plans/Contracts_V0.md#UICommand), ContractName:Plans/UI_Command_Catalog.md

---

<a id="18-acceptance-criteria"></a>
## 18. Acceptance Criteria

With a plan_graph and simulated run events:

1. **Rendering**: Nodes and edges render correctly; status colors match TierState values per section 8.
2. **Selection sync**: Selecting a node in the graph highlights the corresponding table row and populates the detail panel. Selecting a table row highlights the graph node.
3. **Detail panel completeness**: All 8 sections (C1-C8) display correct data for the selected node.
4. **Worker + verifier activity**: C3 and C4 update live as events arrive for the selected node.
5. **Plan mapping**: C2 shows correct breadcrumb, section anchor, and excerpt for the selected node.
6. **Model and tokens**: C5 shows model, reasoning effort, and token usage for both worker and verifier. "View in Usage" link navigates to Usage page.
7. **HITL**: C6 shows pending approvals; Approve/Deny actions (with rationale text) update node state immediately in the graph, table, and detail panel.
8. **Layout presets**: Switching presets produces deterministic layouts. Critical path preset highlights the longest chain.
9. **Filtering and search**: State filters and search work correctly. Quick filters toggle as expected.
10. **Performance**: 500 nodes renders and pans at 60fps. Table scrolls smoothly. Layout computation < 500ms.
11. **Minimap**: Shows correct overview. Click-to-jump and viewport drag work.
12. **Zoom/pan**: Smooth zoom from 25% to 400%. Pan via drag works. Fit-to-screen works.
13. **Keyboard**: All interactions achievable via keyboard (section 10.2).
14. **Theming**: Correct rendering in all 4 built-in themes. No hard-coded colors.
15. **Persistence**: Layout preset, zoom, pan, and selection restored on view re-open.
16. **Hover tooltip**: Hovering a node shows tooltip with id, title, state, start/end time, elapsed, attempts.
17. **Context menu**: Right-clicking a node shows context menu with state-appropriate actions (section 10.3).
18. **Node badges**: Attempt count badge appears when attempts > 1. Duration badge shows formatted time. HITL pulsing badge appears when hitl_pending. Blocked lock icon appears when blocked_reason is set.
19. **Large-graph fallback (200+ nodes)**: At 200+ nodes, node titles truncate to 12 chars and edges switch to straight lines. Phase group collapse activates for phases with uniform state.
20. **Large-graph fallback (500+ nodes)**: At 500+ nodes, node rectangles reduce to 120x36px. At zoom < 50%, nodes render as colored dots only (no text).
21. **Verification columns**: Table shows verification start, end, and elapsed columns. Sorting by verification duration works correctly.
22. **Deterministic layout**: Same graph with same preset produces identical node positions across multiple layout computations.

---

<a id="19-references"></a>
## 19. References

| Document | What It Provides |
|----------|-----------------|
| Plans/Orchestrator_Page.md | Parent page structure (tab 3 is this view) |
| Plans/orchestrator-subagent-integration.md | Plan graph structure, tier hierarchy, event types, HITL semantics |
| Plans/FinalGUISpec.md | Master layout (section 3), theme system (section 6), views (section 7), responsive (section 12), accessibility (section 13), persistence (section 15) |
| Plans/Widget_System.md | Widget catalog (this view is NOT in the catalog but references it for context) |
| Plans/Contracts_V0.md | EventRecord envelope |
| Plans/storage-plan.md | redb namespaces, seglog schema |
| Plans/usage-feature.md | Usage page (for "View in Usage" link) |
| Plans/human-in-the-loop.md | HITL approval pathway |
| Plans/evidence.schema.json | Evidence bundle format |
| Concepts/dag_run_graph.png | Reference image (dark theme) |
| Concepts/dag_run_graph1.png | Reference image (light theme) |
| puppet-master-rs/src/core/tier_node.rs | TierNode, TierTree Rust structs |
| puppet-master-rs/src/core/orchestrator.rs | OrchestratorState enum |
| puppet-master-rs/src/types/state.rs | TierState enum |
| puppet-master-rs/src/types/events.rs | PuppetMasterEvent enum |
| puppet-master-rs/src/types/budget.rs | UsageRecord, BudgetInfo structs |
| puppet-master-rs/src/types/evidence.rs | StoredEvidence, EvidenceType |
