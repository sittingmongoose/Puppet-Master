  - redb/Tantivy/JSONL are disposable projections
  - replay/rebuild targets a deterministic `target_seq`
  - UI freshness notifications should derive from committed projection state, not ad-hoc polling
- Usage already names the user-trust problem clearly:
  - stale values surprise users
  - trust drops when the UI presents old numbers as if they are current
  - current mitigation pattern is `Last updated` plus an explicit `Refresh`
- FinalGUISpec already has compatible safety rules:
  - event/projection streams are the correctness source
  - the GUI must not imply hidden fallback or hidden retry behavior
  - blocked/recovery actions bind to canonical projections/records
- What is still missing is an explicit shared trust policy for all projection-backed surfaces, especially Orchestrator tabs.

### Recommended trust-state model
- Recommended projection trust states:
  - `current`
  - `refreshing`
  - `stale`
  - `degraded`
  - `unavailable`
- Working interpretation:
  - `current`: projection is caught up enough for normal use
  - `refreshing`: old committed projection still visible while refresh/rebuild runs
  - `stale`: projection is usable for context but may not reflect current runtime truth
  - `degraded`: projector/scan partially failed or a dependency signal is missing; some fields/sections are less trustworthy
  - `unavailable`: projection cannot currently answer the surface contract

### Action-gating direction
- Strong recommendation:
  - read-only navigation may continue on `stale` and some `degraded` projections if the UI says so clearly
  - live mutating / decision-bearing actions must tighten on trust state
- Suggested policy:
  - `current`: all normal actions allowed
  - `refreshing`: allow normal read actions; mutating actions may continue if backed by runtime truth rather than stale page cache
  - `stale`: allow inspection and historical navigation; require refresh or direct runtime revalidation before sensitive live actions
  - `degraded`: restrict to safe inspection and canonical recovery paths; do not allow ambiguous live actions
  - `unavailable`: route to record-backed fallback views or explicit recovery/refresh actions
- Important rule:
  - page state must not silently stand in for runtime state when freshness/trust is insufficient

### Fallback-view direction
- Recommended fallback hierarchy:
  - prefer native projection-backed surface when trust is `current`
  - if trust drops, keep the surface open but show:
    - trust badge
    - last-updated time
    - degraded reason
    - refresh / recover action
  - when necessary, fall back to canonical record-backed views:
    - `History`
    - `Ledger`
    - direct evidence/record inspectors
- This fits the existing split:
  - `History` = chronological durable story
  - `Ledger` = exact record inspection
  - projection-backed operational views can degrade without erasing auditability

### UI contract direction
- Every projection-backed operational surface should expose at least:
  - trust state
  - last updated time
  - degraded/stale reason when not current
  - whether actions are partially gated
- Likely good surface behavior:
  - `Progress`: show run-level trust banner or chip when projections are stale/degraded
  - `Seams`: allow browsing, but gate actions that depend on current promotion/blocker truth
  - `Node Graph`: keep historical graph and current selections visible, but flag when live node state may be stale
  - `Evidence`: artifact browsing can remain available; live verdict/action affordances may gate
  - `History` / `Ledger`: usually the fallback-safe surfaces because they are closest to canonical records

### Contradictions / gaps surfaced
- No shared projection freshness schema is currently obvious across Usage, Orchestrator, Source Control, and other projection-backed surfaces.
- Usage has concrete stale-data mitigations, but Orchestrator currently lacks equally explicit stale/degraded trust copy and action rules.
- FinalGUISpec has good safety language, but it does not yet appear to define one reusable trust-state UI contract for projection-backed tabs/widgets/panels.

### Candidate fixes to carry forward
- Add a shared projection health/trust contract used by:
  - Orchestrator
  - Usage
  - Source Control
  - other projection-backed surfaces
- Make `trust state` and `last updated` first-class UI fields for projection-backed surfaces.
- Define which commands require:
  - current projection
  - direct runtime confirmation
  - or are safe from stale views because they operate on durable records only
- Define explicit record-backed fallback behavior when projections are stale/degraded/unavailable.

### Do-not-forget details
- `refreshing` should continue showing the last committed projection rather than blanking the page.
- stale/degraded trust must be visible without making the UI feel broken or unusable.
- the system should never quietly present stale operational truth as if it were live truth.

## Research Progress - 2026-03-16 - Multi-Run Behavior Inside One Project

### Targeted docs read
- `Plans/Orchestrator_Page.md`
- `Plans/Run_Graph_View.md`
- `Plans/storage-plan.md`
- `Plans/FinalGUISpec.md`
- `Plans/Widget_System.md`

### Key findings
- Current docs already imply that Orchestrator can focus either:
  - an active run
  - or a selected historical run
- Existing wording is not enough yet:
  - `Orchestrator_Page.md` says the graph renders when a run is active or a historical run is selected
  - `History` rows can load a historical run into the graph/evidence
  - `Ledger` filters to the current/selected run
  - but there is no clear mode contract for what the whole page is in after a historical run is selected
- Storage/project-state support appears incomplete for this seam:
  - `storage-plan.md` defines project state for Source Control, GitHub Actions, and Docker Manager
  - there is no obvious equivalent `orchestrator.project_state.{project_id}` with focused/selected run state
  - this means run focus persistence and restore rules are currently underspecified
- Background-run behavior exists, but it is still somewhat separate from Orchestrator run-focus semantics:
  - background runs have queue/state events
  - Dashboard has a Background Runs card
  - but Orchestrator does not yet clearly define how active background runs interact with a currently focused historical run

### Recommended run-focus model
- Strong recommendation:
  - distinguish `active run truth` from `focused run context`
- Proposed fields conceptually:
  - `active_run_id?`
  - `focused_run_id?`
  - `focus_mode = live | historical`
- Working interpretation:
  - `active_run_id` = currently running/paused/interrupted run for the project, if any
  - `focused_run_id` = the run whose data the Orchestrator tabs are currently showing
  - `focus_mode = live` when `focused_run_id == active_run_id`
  - `focus_mode = historical` when the user is inspecting any non-active run
- Benefit:
  - avoids blending "what is running now" with "what the user is currently inspecting"

### Historical-run mode direction
- Recommended explicit mode:
  - `Historical Run Mode`
- Required behavior:
  - all tabs clearly show the focused historical `run_id`
  - the page displays a persistent banner/chip that the user is viewing historical data
  - controls that only make sense for the active run are disabled or removed
  - actions route against the focused run only when they are historical-safe
- Historical-safe actions likely include:
  - inspect graph
  - inspect evidence
  - inspect ledger
  - export
  - view lineage
  - open related Source Control / GitHub / Docker context in historical mode where possible
- Actions that should generally be disabled in historical mode:
  - pause / resume / cancel active execution
  - live retry / remediation commands
  - approval/recovery actions that require current runtime state
  - any command that implies mutating the current live run context

### Current-run mode direction
- When focused on the live run:
  - live cards/widgets are active
  - CTAs operate on current runtime truth
  - background events and live state changes update the focused tabs directly
- If a new run becomes active while the user is viewing history:
  - do not forcibly yank focus away from the historical run
  - instead show a clear notice such as:
    - active run exists
    - switch to live run
    - background runs count / status
- This avoids the page feeling unstable.

### Background-runs interaction
- Recommended rule:
  - background run presence is global project state
  - focused run is local Orchestrator viewing state
- Implication:
  - a user may be viewing one historical run while another run is actively progressing in the background
  - Orchestrator should surface that without silently replacing the focused context
- Good model:
  - background/live-run strip or compact banner remains visible even in historical mode
  - user can explicitly switch focus to the active run

### Persistence direction
- Likely missing project-state record:
  - `orchestrator.project_state.{project_id}`
- Candidate fields:
  - `focused_run_id?`
  - `focus_mode`
  - `last_live_run_id?`
  - `selected_tab`
  - per-tab view state refs
  - maybe `auto_return_to_live = false` by default
- Working recommendation:
  - persist the last focused run per project
  - on restart/project reopen:
    - if that run still exists and is historical, restore historical focus
    - if there is also an active run, show a clear live-run notice rather than overriding focus silently

### Cross-tab behavior direction
- Strong recommendation:
  - all Orchestrator tabs share the same focused `run_id`
- Implications:
