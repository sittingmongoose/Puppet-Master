# Orchestrator Page -- Single-Page 6-Tab Specification

> **Compliance:** This document follows `Plans/DRY_Rules.md` and references SSOT contracts in `Plans/Contracts_V0.md`. Naming: “Puppet Master” only. No open questions; deterministic defaults per `Plans/Decision_Policy.md`.


<!--
PUPPET MASTER -- ORCHESTRATOR PAGE SSOT

Purpose:
- This file is the single source of truth for the Orchestrator page structure:
  a single top-level page with 6 tabs (Progress, Tiers, Node Graph Display,
  Evidence, History, Ledger).
- It replaces the former separate Tiers, Evidence, Metrics, History views
  and the Ledger as a separate top-level page.
- Widget-based tabs reference Plans/Widget_System.md for grid layout and
  widget mechanics.
- The Node Graph Display tab references Plans/Run_Graph_View.md.

ABSOLUTE NAMING RULE:
- Platform name is "Puppet Master" only.
- If older naming exists, refer to it only as "legacy naming" (do not quote it).
-->

**Date:** 2026-02-23
**Status:** Plan document -- defines the Orchestrator page for the Slint rewrite
**Depends on:** Plans/Widget_System.md, Plans/Run_Graph_View.md, Plans/orchestrator-subagent-integration.md, Plans/FinalGUISpec.md

---

## Table of Contents

1. [Scope and Relationship](#1-scope-and-relationship)
2. [Page Layout](#2-page-layout)
3. [Tab Bar](#3-tab-bar)
4. [Tab 1: Progress](#4-tab-progress)
5. [Tab 2: Tiers](#5-tab-tiers)
6. [Tab 3: Node Graph Display](#6-tab-node-graph)
7. [Tab 4: Evidence](#7-tab-evidence)
8. [Tab 5: History](#8-tab-history)
9. [Tab 6: Ledger](#9-tab-ledger)
10. [Terminal Widgets for Agent Output](#10-terminal-widgets)
11. [Completed Work as Prose Summaries](#11-completed-prose)
12. [Data Sources for Live Status](#12-data-sources)
13. [Persistence](#13-persistence)
14. [UICommand IDs](#14-uicommand-ids)
15. [Accessibility](#15-accessibility)
16. [Acceptance Criteria](#16-acceptance-criteria)
17. [References](#17-references)

---

<a id="1-scope-and-relationship"></a>
## 1. Scope and Relationship

### 1.1 What This Is

The Orchestrator page is a **single top-level page** accessible from the Activity Bar "Run" group (Plans/FinalGUISpec.md section 4). It consolidates what were previously separate views into a unified tabbed interface.

### 1.2 What It Replaces

| Former View | Now Located |
|------------|-------------|
| Tiers view (FinalGUISpec section 7.7) | Tab 2: Tiers |
| Evidence view (FinalGUISpec section 7.12) | Tab 4: Evidence |
| History view (FinalGUISpec section 7.13) | Tab 5: History |
| Ledger view (FinalGUISpec section 7.14) | Tab 6: Ledger |
| (New) Run Graph | Tab 3: Node Graph Display |
| (New) Live Progress | Tab 1: Progress |

### 1.3 Relationship to Other Documents

- **Plans/Widget_System.md**: Tabs 1, 2, 4, 5, 6 are widget-based and use the Widget System for grid layout, add-widget flow, and persistence.
- **Plans/Run_Graph_View.md**: Tab 3 is the full-page Node Graph Display (NOT widget-based).
- **Plans/orchestrator-subagent-integration.md**: Defines the backend tier hierarchy, event types, and plan_graph semantics that drive all tabs.
- **Plans/FinalGUISpec.md**: Master layout, theme system, and general UI patterns.

Orchestration runs and tier checks are driven by the **Overseer** (see Plans/Glossary.md), the AI foreman role inside the Orchestrator.

ContractRef: ContractName:Plans/FinalGUISpec.md#4, ContractName:Plans/Widget_System.md, ContractName:Plans/Run_Graph_View.md

---

<a id="2-page-layout"></a>
## 2. Page Layout

The Orchestrator page occupies the Primary Content Area of the IDE shell (Plans/FinalGUISpec.md section 3).

```
+-----------------------------------------------------------+
| Page Header: "Orchestrator" + run status indicator        |
+-----------------------------------------------------------+
| Tab Bar: [Progress] [Tiers] [Node Graph] [Evidence] ...  |
+-----------------------------------------------------------+
|                                                           |
|  Selected Tab Content                                     |
|  (fills remaining vertical space)                         |
|                                                           |
+-----------------------------------------------------------+
```

- **Page header** (32px): "Orchestrator" title, plus a compact run status indicator (state badge + elapsed time).
- **Tab bar** (36px): horizontal tab strip. Active tab underlined with `Theme.accent` color.
- **Tab content**: fills the rest of the vertical space. Content varies by tab.

---

<a id="3-tab-bar"></a>
## 3. Tab Bar

### 3.1 Tab Names and Order

| Position | Label | Internal ID | Widget-Based? |
|----------|-------|-------------|---------------|
| 1 | Progress | `orchestrator:progress` | Yes |
| 2 | Tiers | `orchestrator:tiers` | Yes |
| 3 | Node Graph Display | `orchestrator:node_graph` | **No** (full-page) |
| 4 | Evidence | `orchestrator:evidence` | Yes |
| 5 | History | `orchestrator:history` | Yes |
| 6 | Ledger | `orchestrator:ledger` | Yes |

### 3.2 Tab Behavior

- Clicking a tab switches the content area to that tab's content.
- Active tab is visually distinguished (underline + bold text).
- Tab order is fixed (not user-rearrangeable).
- Badge indicators on tabs:
  - Progress: shows running node count when > 0 (e.g., "(3)")
  - Evidence: shows new evidence count since last visit
  - Node Graph: shows HITL pending count when > 0 (orange dot)

### 3.3 Keyboard

- Ctrl+Tab / Ctrl+Shift+Tab: cycle tabs forward / backward.
- Alt+1 through Alt+6: jump directly to tab by position.

---

<a id="4-tab-progress"></a>
## 4. Tab 1: Progress

### 4.1 Purpose

Live status dashboard for the current run: what the orchestrator is doing right now, which plan graph node is active, what the current worker is doing, and a summary of completed work.

### 4.2 Widget-Based

This tab is composed of widgets from Plans/Widget_System.md. Users can add, remove, move, resize, and configure widgets.

### 4.3 Default Layout (4-column grid)

| Col | Row | Widget ID | Size | What It Shows |
|-----|-----|-----------|------|---------------|
| 0 | 0 | `widget.orchestrator_status` | 2x1 | Current orchestrator state (Idle/Planning/Executing/Paused/Error/Complete) with run controls (start/pause/resume/stop) plus Preview/Build actions and latest artifact/session summary |
| 2 | 0 | `widget.current_task` | 2x1 | Active tier: title, objective, elapsed time, platform, model |
| 0 | 1 | `widget.progress_bars` | 4x1 | Phase/task/subtask completion bars with counts |
| 0 | 2 | `widget.cta_stack` | 2x2 | Calls to action: HITL approvals, run interrupted, rate limits, warnings |
| 2 | 2 | `widget.agent_terminal` | 2x2 | Live PTY output from the current worker (see section 10) |
| 0 | 4 | `widget.completed_prose` | 4x2 | Prose summaries of completed work (see section 11) |

### 4.4 Dashboard Portability

All widgets in the Progress tab are also hostable on the Dashboard (Plans/Widget_System.md section 2). Users can add any Progress widget to the Dashboard via the add-widget flow.

ContractRef: ContractName:Plans/Widget_System.md#6.3

<a id="45-preview-build-actions"></a>
### 4.5 Preview and Build actions in `widget.orchestrator_status`

The orchestrator status widget is the canonical in-page control surface for run operations and developer feedback loops.

- **Preview action**:
  - Starts a visible or headless preview session depending on run config.
  - Shows current preview state (`running`, `stopped`, `degraded`) and latest media timestamp.
  - Exposes quick action to open the most recent preview artifact.
- **Build action**:
  - Runs project build profile selected in settings or inferred from stack.
  - Displays latest build status and a compact artifact list (path + kind).
  - Exposes quick action to open/copy artifact path.

These controls are also hostable on Dashboard via the same widget portability contract.

ContractRef: ContractName:Plans/newtools.md#146-preview-build-docker-and-actions-contracts, ContractName:Plans/FinalGUISpec.md#7.2, ContractName:Plans/Widget_System.md#6.3

---

<a id="5-tab-tiers"></a>
## 5. Tab 2: Tiers

### 5.1 Purpose

Displays the tier hierarchy (Phase > Task > Subtask) as an interactive tree view, replacing the former standalone Tiers view (FinalGUISpec section 7.7).

### 5.2 Widget-Based

Single widget fills the tab by default, but users can add additional widgets.

### 5.3 Default Layout

| Col | Row | Widget ID | Size | What It Shows |
|-----|-----|-----------|------|---------------|
| 0 | 0 | `widget.tier_tree` | 4x6 | Full tier tree with expand/collapse, state badges, acceptance criteria |

### 5.4 Tier Tree Widget Details

The `widget.tier_tree` widget renders an interactive tree:
- **Root nodes**: Phases (top-level).
- **Children**: Tasks under phases, Subtasks under tasks.
- **Each node shows**: tier_id, title, state badge (color-coded), progress indicator, iteration count.
- **Expand/collapse**: click arrow icon or double-click node.
- **Click node**: shows a detail flyout with: description, acceptance criteria, evidence links, iteration history.
- **Keyboard**: arrow keys navigate tree, Enter toggles expand/collapse, Space shows detail.

Config options (gear icon):
- Default expand depth: 1/2/3/All.
- Filter by state: show only specific TierState values.

ContractRef: ContractName:Plans/orchestrator-subagent-integration.md

---

<a id="6-tab-node-graph"></a>
## 6. Tab 3: Node Graph Display

### 6.1 Full-Page Tab

This tab renders the Run Graph View as specified in **Plans/Run_Graph_View.md**. The entire tab content area is occupied by the graph view (top bar + DAG graph + node table + detail panel).

### 6.2 NOT Widget-Based

This tab is NOT composed of widgets. It is a fixed, full-page view. Users cannot add/remove/move/resize sections. The internal layout (graph/table/detail split) is controlled by the Run Graph View's own split bars.

### 6.3 Activation

When no run is active: show a placeholder message "No active run. Start an orchestrator run to see the graph." with a "Start Run" button.

When a run is active or a historical run is selected: render the full Run Graph View.

ContractRef: ContractName:Plans/Run_Graph_View.md

---

<a id="7-tab-evidence"></a>
## 7. Tab 4: Evidence

### 7.1 Purpose

Browse and inspect evidence produced by the orchestrator (test logs, screenshots, metrics, gate reports, file snapshots).

### 7.2 Widget-Based

Single widget fills the tab by default.

### 7.3 Default Layout

| Col | Row | Widget ID | Size | What It Shows |
|-----|-----|-----------|------|---------------|
| 0 | 0 | `widget.evidence_browser` | 4x6 | Evidence list with filters, search, detail preview |

### 7.4 Evidence Browser Widget Details

- **List view**: table of evidence items: type icon, tier_id (which node produced it), timestamp, description.
- **Filters**: by evidence type (TestLog, Screenshot, BrowserTrace, FileSnapshot, Metric, GateReport, CommandOutput), by tier_id, by time range.
- **Search**: full-text search across evidence descriptions and content.
- **Detail preview**: selecting an evidence item shows a preview panel:
  - Text evidence: rendered content.
  - Screenshots: image display.
  - File snapshots: diff view.
  - Gate reports: pass/fail checklist.
- **Actions**: "Open in Editor" (for file-based evidence), "Copy" (for text), "Export" (download artifact).

ContractRef: ContractName:Plans/orchestrator-subagent-integration.md

---

<a id="8-tab-history"></a>
## 8. Tab 5: History

### 8.1 Purpose

List of past orchestrator runs with status, duration, and links to detailed views.

### 8.2 Widget-Based

Single widget fills the tab by default.

### 8.3 Default Layout

| Col | Row | Widget ID | Size | What It Shows |
|-----|-----|-----------|------|---------------|
| 0 | 0 | `widget.history_list` | 4x4 | Run history table |

### 8.4 History List Widget Details

- **Columns**: Run ID, PRD name, Status (badge), Start time, End time, Duration, Node count, Pass/Fail counts.
- **Sortable**: by any column. Default: most recent first.
- **Click a row**: loads that run's data into the Node Graph Display tab (switch to tab 3 with historical run).
- **Actions**: "View Graph" (switch to tab 3), "View Evidence" (switch to tab 4 filtered), "Delete Run" (with confirmation).

ContractRef: ContractName:Plans/storage-plan.md

---

<a id="9-tab-ledger"></a>
## 9. Tab 6: Ledger

### 9.1 Purpose

Event-level usage and cost ledger scoped to the current (or selected) orchestrator run. Shows per-event token usage, cost, platform, model for the run.

### 9.2 Relationship to Usage Page

The Ledger tab shows **run-scoped** data: only events from the current orchestrator run.
The Usage page (Plans/usage-feature.md) shows **app-wide** data: all usage across all runs and chat sessions.

The Ledger tab includes a "View in Usage" link that opens the Usage page filtered to the current run's `run_id`.

### 9.3 Widget-Based

Single widget fills the tab by default.

### 9.4 Default Layout

| Col | Row | Widget ID | Size | What It Shows |
|-----|-----|-----------|------|---------------|
| 0 | 0 | `widget.ledger_table` | 4x6 | Run-scoped event ledger |

### 9.5 Ledger Table Widget Details

- **Columns**: Timestamp, Event type, Tier ID, Platform, Model, Input tokens, Output tokens, Reasoning tokens, Cost ($), Duration (ms).
- **Filters**: by event type, by tier_id, by platform, by time range within the run.
- **Sorting**: by any column.
- **Aggregation row**: bottom of table shows totals: total tokens (in/out/reasoning), total cost, total duration.
- **Export**: CSV/JSON export of the filtered ledger.

When configured for the Orchestrator Ledger tab: automatically filters to `run_id` of the current/selected run.
When configured for the Usage page: shows all events (app-wide) with run_id as a visible/filterable column.

ContractRef: ContractName:Plans/usage-feature.md, ContractName:Plans/storage-plan.md

---

<a id="10-terminal-widgets"></a>
## 10. Terminal Widgets for Agent Output

### 10.1 Agent Terminal Widget

The `widget.agent_terminal` widget shows live PTY output from the current iteration's subagent (worker or verifier).

### 10.2 Display

- **Content**: streaming text output from the subagent's PTY.
- **Colors**: stdout in `Theme.text-primary` (lime tint in retro themes), stderr in `Theme.accent-magenta`, info/status in `Theme.accent-orange`.
- **Font**: monospace, same as Bottom Panel terminal (Plans/FinalGUISpec.md section 7.15).
- **Auto-scroll**: ON by default (follows latest output). User can scroll up to pause auto-scroll; scrolling to bottom re-enables it.
- **Word wrap**: configurable (on/off, default on).

### 10.3 Buffer

- **Ring buffer**: 10,000 lines per terminal widget.
- **Overflow**: oldest lines discarded when buffer is full.
- **Clear**: "Clear" button in widget header clears the buffer.

### 10.4 Parallel Execution

When the orchestrator runs multiple subtasks in parallel:
- The Progress tab can contain multiple `widget.agent_terminal` instances (one per active worker).
- The user can add more terminal widgets via the add-widget flow.
- Each terminal widget can be configured (gear icon) to show output from a specific tier_id or "auto" (follows the most recently started worker).
- When more than 4 agents are active simultaneously: the terminal widget in "auto" mode cycles through agents (showing the most recently active one), with a dropdown to manually select an agent.

### 10.5 Rendering

- **Virtualized**: only render visible lines + 50-line overscan.
- **ANSI escape codes**: basic ANSI color support (16 colors + bold/dim/underline). Full 256-color optional.
- **Selection**: click-drag to select text. Ctrl+C copies selection.

ContractRef: ContractName:Plans/FinalGUISpec.md#7.15, ContractName:Plans/orchestrator-subagent-integration.md

---

<a id="11-completed-prose"></a>
## 11. Completed Work as Prose Summaries

### 11.1 Purpose

Completed phases, tasks, and subtasks are presented as **readable prose summaries**, NOT raw markdown plan text or log dumps. This gives users an easily scannable overview of what has been accomplished.

### 11.2 Completed Prose Widget

The `widget.completed_prose` widget renders a vertical list of completed tier summaries.

### 11.3 Summary Format

Each completed tier summary block contains:

```
[State Badge] Phase 1: Project Setup                    [2m 34s]
Completed the initial project scaffolding. Created the Cargo workspace
with three crates (core, cli, gui). Set up CI configuration and
installed dependencies. 4 files created, 2 files modified.
```

| Element | Source | Behavior |
|---------|--------|----------|
| State badge | `TierState::Passed` (green check) or `TierState::Failed` (red X) | Color-coded |
| Title | `TierNode.title` | Tier type prefix + title |
| Duration | `GraphNode.elapsed_ms` | Formatted human-readable |
| Prose body | Generated from evidence summary + tier description | 2-4 sentences summarizing key outcomes |
| File counts | Aggregated from worker tool calls | "N files created, M files modified" |

### 11.4 Prose Generation

The prose summary is generated from:
1. **Evidence summary field**: if `evidence/<node_id>.json` contains a `summary` field, use it as the primary content.
2. **Tier description**: `TierNode.description` provides objective context.
3. **Aggregated metrics**: file change counts, test results, verification verdict.
4. **Fallback**: if no evidence summary exists, use: "{title} completed in {duration}."

Prose is NOT generated by an LLM at display time. It is pre-computed during the orchestrator run (evidence bundles include summaries) or aggregated from structured data.

### 11.4.1 Parent Summary (handoff; used for Iteration context injection)
### 11.4.2 Evidence summary ownership

`widget.completed_prose` and the Completed Work tab consume precomputed evidence summaries. The UI does not synthesize these summaries from raw logs at render time.

Canonical rule:
- every completed evidence bundle that is intended for prose display MUST expose `summary`
- `summary` is a concise 2-4 sentence human-readable explanation of what was completed, why it matters, and any notable caveats or outcomes
- parent-summary handoff text and evidence `summary` are related but distinct artifacts; parent-summary is for downstream context injection, while evidence `summary` is for UI display and navigation
- if multiple evidence entries exist for the same tier, the Completed Prose widget displays them in completion order and prefers the tier-final summary as the default expanded item

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Widget_System.md, ContractName:Plans/Contracts_V0.md

Rule: When Parent Summary injection is enabled, the orchestrator MUST maintain a short `parent_summary` artifact (hard-capped) for Iteration handoffs and MUST include it in the per-run “Injected Context” breakdown so users can see exactly what was injected.

ContractRef: ContractName:Plans/Contracts_V0.md#ParentSummary, ContractName:Plans/Contracts_V0.md#ContextInjectionToggles, ContractName:Plans/agent-rules-context.md#FeatureSpecVerbatim

### 11.5 Display Order

- Most recently completed tiers appear first (reverse chronological).
- Collapsible: latest 3 expanded by default, older ones collapsed (click to expand).
- "Show all" / "Show recent" toggle at the top.
- Tier type grouping: optionally group by Phase (configurable via gear icon).

ContractRef: ContractName:Plans/orchestrator-subagent-integration.md

---

<a id="12-data-sources"></a>
## 12. Data Sources for Live Status

This section documents exactly where the UI gets the live data displayed on the Orchestrator page. Implementers should wire UI bindings to these sources.

### 12.1 Live Status Data

| Data Point | Source | How UI Gets It | SSOT Document |
|------------|--------|----------------|---------------|
| Orchestrator state (Idle/Planning/Executing/...) | `PuppetMasterEvent::StateChanged` | Push via `invoke_from_event_loop`; Rust backend emits on state transition | Plans/orchestrator-subagent-integration.md |
| Current plan graph node (which node is active) | `PuppetMasterEvent::TierChanged` (to Running) + `PuppetMasterEvent::IterationStart` | Push; UI tracks the most recently received `TierChanged(Running)` event's `tier_id` | Plans/orchestrator-subagent-integration.md |
| Current worker (what the active agent is doing) | `PuppetMasterEvent::Output` filtered by active `tier_id` + `session_id` | Push (PTY stream); UI shows in terminal widget | Plans/orchestrator-subagent-integration.md |
| Tier states (all tiers) | `PuppetMasterEvent::TierChanged` | Push; UI maintains a `HashMap<String, TierState>` updated incrementally | Plans/orchestrator-subagent-integration.md |
| Progress counts | `PuppetMasterEvent::Progress` | Push; UI updates progress bars | Plans/orchestrator-subagent-integration.md |
| HITL requests | `PuppetMasterEvent::UserInteractionRequired` + persisted `hitl.*` events keyed by `request_id` | Push; UI shows in CTA stack widget and Node Graph HITL controls | Plans/human-in-the-loop.md |
| Evidence stored | `PuppetMasterEvent::EvidenceStored` | Push; UI updates evidence browser and node detail C3 | Plans/orchestrator-subagent-integration.md |
| Gate results | `PuppetMasterEvent::GateStart`, `GateComplete` | Push; UI updates node detail C4 | Plans/orchestrator-subagent-integration.md |
| Background runs | `run.background_enqueued`, `run.background_state_changed` projections | Pull on load + push on state change; UI updates background runs card | Plans/storage-plan.md |
| Crew state / member activity | `crew.*` projections keyed by `crew_id` | Pull on load + push on lifecycle change; UI updates crew indicators and detail panels | Plans/orchestrator-subagent-integration.md |
| Budget/usage | `redb:rollups/usage_5h.*`, `usage_7d.*` | Pull (timer-based, 30s interval) | Plans/storage-plan.md |
| Run metadata | `redb:runs/run.{run_id}` | Pull on load; push-updated on run state change | Plans/storage-plan.md |

### 12.2 Gaps
This section is now the canonical ownership map for the remaining live-status data dependencies. The Orchestrator page is complete only when each surface below is satisfied by its named owner contract.

| UI surface / dependency | Canonical owner | Required fields | Notes |
|---|---|---|---|
| Plan mapping fields | plan graph / `TierNode` contract | `breadcrumb`, `section_anchor`, `excerpt` | Required for plan mapping links in Tiers, Graph, and Completed Prose surfaces. |
| Per-node model/token tracking | `UsageRecord` | `run_id`, `tier_id`, `attempt_id?`, `effective_platform`, `effective_model`, `input_tokens`, `output_tokens`, `total_tokens`, `estimated_cost?` | Required for Ledger, Run Graph `C5`, and cross-linking to Usage. |
| Evidence prose summary | evidence contract | `summary`, `summary_kind?`, `evidence_ref` | Required for `widget.completed_prose` and Evidence summaries. |
| Worker identity | runtime attempt / output events | `requested_persona_id`, `effective_persona_id`, `provider`, `model`, `attempt_id`, `session_id?` | Required for worker terminal widgets and per-node worker cards. |
| Verifier identity | reviewer / gate events | `requested_persona_id`, `effective_persona_id`, `provider`, `model`, `attempt_id?`, `gate_id?` | Required for gate/result visibility and node verifier activity. |
| Blocked/recovery state | blocked projection / HITL request contract | `blocked_reason_code`, ordered `allowed_action_ids[]`, `blocked_sequence`, `preserved_local_work`, `requires_safe_point_restore?`, prerequisite metadata | Required for queue analysis, blocked CTA cards, and recovery controls. |
| Queue analysis / remediation lineage | scheduler pass and remediation lineage records | `scheduler_pass_id`, score breakdown, `remediation_root_id`, child lineage refs | Required for queue-analysis panels and lineage navigation. |

Rules:
- the Orchestrator page MUST bind to these upstream owners rather than creating local compatibility fields
- when a dependency is absent, the owning contract above must be updated; the UI doc should not create a shadow schema
- requested vs effective runtime identity MUST remain visible whenever provider filtering or fallback changed the requested selection

ContractRef: ContractName:Plans/Run_Graph_View.md, ContractName:Plans/storage-plan.md, ContractName:Plans/usage-feature.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/Personas.md
### 1. Queue analysis summary card

The Orchestrator page must add a live queue/scheduler summary card.

Required fields:
- ready count
- running count
- blocked count
- backoff count
- remediation-active count
- available slots
- last wake reason
- last scheduler-analysis timestamp
- selected next nodes summary

### 2. Blocked state handling

Blocked nodes/actions must present exact recovery options instead of generic failure copy.

Required examples:
- `Approve` / `Reject` for HITL
- `Resume Wizard` / `View report` for clarification-driven wizard states
- `Re-authenticate` for `auth_expired`
- `Approve once` / `Approve & add to list` where FileSafe allows recovery
- `Apply replan patch` / `Open replan diff` for `replan_required`

### 3. Retry and remediation controls

Manual retry controls must expose retry posture clearly.

Required options when allowed:
- `Retry from safe point`
- `Start fresh attempt`
- `Open remediation details`

The page must not imply that all retry buttons mean the same thing.

### 4. Event-driven updates

Scheduler and remediation widgets update from event/projection streams. Do not rely on polling loops for correctness.

### 5. Acceptance criteria

- The page exposes current queue pressure and wake reason.
- Recovery options are specific to the blocked/failure class.
- Retry UI distinguishes safe-point retry from fresh attempt.
- Scheduler/remediation widgets update without timer-driven correctness assumptions.
## Runtime Recovery Surface Ownership Addendum (2026-03-09)

The Orchestrator page owns the page-level recovery, queue-analysis, and remediation views that complement the node-level run graph.

### Required surfaces
- queue-analysis summary card for the latest scheduler pass
- blocked work list grouped by `blocked_reason_code`
- remediation lineage list showing parent attempt, child attempts, and resolution
- safe-point restore history for the active run
- quick filters for `blocked`, `attention_required`, `retrying`, and `remediation`

### Surface boundaries
- the run graph owns node-specific diagnostics
- the Orchestrator page owns run-wide summaries, grouped queues, and bulk navigation between affected nodes/attempts
- history/evidence tabs must be able to pivot by `attempt_id`

### Fallback rule
If the graph cannot yet render a full queue-analysis visualization, the page MUST still show a textual queue-analysis summary with wake reason, selected nodes, ready-but-unselected nodes, and capacity status. The packet does not allow queue-analysis to become UI-invisible.
## Queue Analysis and Blocked Work Surface Reconciliation Addendum (2026-03-09)

The Orchestrator page owns run-wide scheduler and recovery summaries.

### Required surfaces
- queue-analysis summary for the latest scheduler pass
- scheduler pass history keyed by `scheduler_pass_id`
- blocked work list grouped by `blocked_reason_code`
- newly-ready-in-this-pass list showing direct cascade effects
- remediation lineage list showing parent attempt, child attempts, and resolution
- safe-point restore history for the active run

### Interaction rules
- clicking a queue-analysis row opens the corresponding node or attempt detail
- ready-but-unselected rows MUST show `non_selected_reason` and score breakdown
- blocked rows MUST show only the currently valid `allowed_action_ids[]`
- newly-ready rows MUST identify the wake reason and, when applicable, the directly satisfied dependency
## Runtime Recovery Surface Layout and Navigation Reconciliation Addendum (2026-03-09)

The Orchestrator page is a consumer of canonical runtime contracts.

Rules:
- queue-analysis navigation uses `scheduler_pass_id`
- blocked rows show only currently valid `allowed_action_ids[]`; unavailable actions are explained rather than silently omitted
- newly-ready rows may show direct prerequisite/source context only when canonical `scheduler.pass` data includes it
- recovery actions use canonical `cmd.runtime.*` commands
- node surfaces use canonical blocked reasons; `attention_required` is not a node runtime state
- pre-attempt blocked episodes bind recovery to `blocked_sequence`
- remediation, safe-point, and queue-analysis pivots open by canonical identity (`remediation_root_id`, `safe_point_id`, `scheduler_pass_id`)
## Orchestrator Runtime Recovery Contract

The Orchestrator page is a consumer of canonical runtime contracts.

Rules:
- queue-analysis navigation uses `scheduler_pass_id`
- blocked rows show only currently valid `allowed_action_ids[]`; unavailable actions are explained rather than silently omitted
- newly-ready rows may show direct prerequisite/source context only when canonical `scheduler.pass` data includes it
- recovery actions use canonical `cmd.runtime.*` commands
- node surfaces use canonical blocked reasons; `attention_required` is not a node runtime state
- pre-attempt blocked episodes bind recovery to `blocked_sequence`
- remediation, safe-point, and queue-analysis pivots open by canonical identity (`remediation_root_id`, `safe_point_id`, `scheduler_pass_id`)
