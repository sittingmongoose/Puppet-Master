  - concern severity + blocking effect + owner + persistence decide escalation
- Example:
  - minor advisory concern -> local/in-app only
  - seam-blocking weak integration concern with no progress for hours -> blocked surfaces + possible system notification

### Contradictions / gaps surfaced
- There is no one explicit cross-surface escalation contract yet.
- Existing banners/cards/toasts/badges are good pieces but not yet tied to a shared cadence model.
- Rate-limit warning suppression exists conceptually, but comparable suppression/resurfacing rules are less clear for other condition classes.

### Candidate fixes to carry forward
- Define one escalation ladder shared across Orchestrator, Dashboard, thread badges, and notifications.
- Add resurfacing rules based on change/persistence thresholds rather than repeated identical events.
- Reserve system notifications for sparse, high-value events.
- Keep blocked-state persistence semantically stronger than dismissible warning surfaces.

### Do-not-forget details
- `attention_required` and `blocked` must remain distinct everywhere
- resurfacing should respond to meaningful change, not spam the user on every scheduler tick
- the system should not silently demote a persistent blocker into history just because time passed

## Research Progress - 2026-03-16 - Scale / Performance Model

### Targeted docs read
- `Plans/Run_Graph_View.md`
- `Plans/FinalGUISpec.md`
- `Plans/storage-plan.md`
- `Plans/Orchestrator_Page.md`

### Key findings
- The graph tab already has the strongest explicit scale contract in the current docs.
- `Run_Graph_View.md` defines concrete targets:
  - render target: 500 nodes, stretch 1000
  - 60 fps pan/zoom
  - layout under 500ms at 500 nodes
  - initial load under 1s at 500 nodes
- The graph spec also already defines the right implementation direction:
  - viewport culling with overscan
  - table virtualization
  - per-generation layout caching
  - incremental row/item updates instead of full replacement
  - burst throttling at frame cadence
  - optional canvas-style fallback if rectangle-based rendering drops below target performance
- `storage-plan.md` already supports the broader pattern the rewrite needs:
  - projections are disposable
  - UI can fetch slices
  - backend pages from redb projections or seglog-derived views
- `FinalGUISpec.md` has scattered virtualization/pagination language for other surfaces, but not an Orchestrator-wide large-run policy.

### Recommended scaling stance
- Strong recommendation:
  - treat scale as a cross-tab contract, not just a graph-tab concern
- The rewrite is already assuming:
  - thousands of nodes
  - multiple graph generations retained visibly
  - many concerns, reviews, promotions, patches, recovery records, and usage records
  - many retained/historical lanes and worktrees
- That means the performance model must explicitly cover:
  - `Seams`
  - `Node Graph`
  - `Evidence`
  - `History`
  - `Ledger`
  - Progress widgets and cross-tab inspectors

### Tab-by-tab direction
- `Node Graph`
  - keep the current culling + caching + throttled-update model
  - preserve old generations in the data model, but do not render every historical path at full fidelity all the time
  - use generation visibility controls, focus mode, and density-aware overlays so historical branches stay available without overwhelming the live path
- `Seams`
  - must use progressive disclosure rather than fully expanded seam/package/node trees
  - top-level seam rows should load compact rollups first
  - package lists and node problem lists should expand lazily
- `Evidence`
  - evidence records and artifacts need independent virtualization/paging
  - heavy artifacts should stay metadata-first until opened
  - artifact previews should be demand-loaded, not pre-rendered for long lists
- `History`
  - should be chronological but windowed
  - initial load should show a recent slice, with explicit load-older / jump controls
  - dense event bursts should be summarized when collapsed, not force every low-level record into the initial viewport
- `Ledger`
  - must be exact, but exact does not mean fully materialized at once
  - filtered query + paging + stable sort are required
  - export can retrieve more than the viewport, but normal browsing should stay slice-based
- `Progress`
  - widgets should consume compact projections, not live-scan huge record sets per widget
  - a widget should deep-link to the native tab when the user wants dense detail

### Generation-heavy graph direction
- The graph patch model makes scale harder than the current graph spec assumes.
- Important rule:
  - generations should remain historically visible and clickable, but the UI should default to a focused generation plus nearby lineage context, not a fully expanded all-generations wall
- Good default behavior:
  - current generation emphasized
  - superseded branches visually muted
  - branch/rejoin overlays available on demand
  - minimap/search/focus-to-object remain generation-aware

### Concern / lane / record density implication
- Non-graph density may become the larger real-world problem.
- In large runs, users may accumulate:
  - many active and historical concerns
  - many corroboration/review/promotion/recovery records
  - many retained or cleanup-eligible lanes/worktrees
- So the rewrite should not assume the graph is the only heavy surface.
- A likely rule to carry forward:
  - every dense Orchestrator tab needs first-class summarization, filtering, and paging before it needs more visual chrome

### Projection trust implication
- Performance and trust are coupled.
- When projections are stale or degraded:
  - large surfaces should degrade toward smaller, record-backed slices instead of trying to fake full live fidelity
- Example:
  - stale graph projection might still support focused inspection of selected nodes/generations
  - stale ledger/history slices remain usable because they are closer to canonical records

### Contradictions / gaps surfaced
- Current graph-scale guidance is much stronger than the scale contract for `Seams`, `Evidence`, `History`, and `Ledger`.
- The current docs do not yet define how thousands-of-node runs with many generations should remain readable by default without collapsing history away.
- There is no explicit Orchestrator-wide rule yet for:
  - initial slice size
  - paging/search interplay
  - lazy expansion behavior
  - cross-tab inspector loading strategy
  - projection fallback behavior under large degraded datasets

### Candidate fixes to carry forward
- Add an Orchestrator-wide scale contract that sits above individual tab docs.
- Make slice-based loading, virtualization, lazy expansion, and demand-loaded inspectors mandatory across dense tabs.
- Define generation visibility defaults so historical branches stay available without default graph overload.
- Require widgets to use compact projections only, with deep links to native dense tabs.
- Tie scale behavior to projection-trust state so degraded projections fail gracefully instead of pretending to be fully current.

### Do-not-forget details
- exact record inspection in `Ledger` still needs paging; exactness does not require eager full materialization
- historical graph generations must stay accessible without becoming the default visual density
- non-graph tabs may become the actual scaling bottleneck sooner than the graph canvas

## Research Progress - 2026-03-16 - Command Palette / Shortcuts / Bulk Actions

### Targeted docs read
- `Plans/FinalGUISpec.md`
- `Plans/UI_Command_Catalog.md`
- `Plans/Orchestrator_Page.md`
- `Plans/Widget_System.md`
- `Plans/WorktreeGitImprovement.md`

### Key findings
- The platform already has a strong shared command foundation:
  - `Ctrl+K` / `Ctrl+P` command palette
  - command registry
  - shortcut registry
  - canonical `cmd.runtime.*` recovery command family
- `UI_Command_Catalog.md` already requires blocked-state actions to map from `allowed_action_ids[]` to canonical runtime commands rather than surface-local variants.
- `Orchestrator_Page.md` already distinguishes retry posture and recovery classes well enough to avoid a fake one-button retry model.
- What is still missing is a rewrite-specific action policy for:
  - palette exposure
  - keyboard shortcuts
  - context menus
  - multi-select / bulk actions
  - action safety at live runtime scope

### Recommended command-surface model
- Strong recommendation:
  - treat the command palette as a universal navigation and precise-action surface, not as a blanket permission to expose every dangerous runtime mutation as one keystroke away
- Good split:
  - palette-friendly:
    - open/focus tab
    - jump to run/seam/package/node/lane/concern/review/patch/recovery object
    - open inspector/detail/history/ledger/evidence context
    - run search routes
    - execute low-risk view and filter commands
  - palette-allowed but guarded:
    - recover / retry / approve / decline / replan / restore / cleanup actions that already have canonical runtime semantics and confirmation rules
  - palette-discouraged or hidden by default:
    - broad destructive bulk mutations with ambiguous target sets

### Bulk-action direction
- The current docs imply grouped navigation for affected nodes/attempts, but not a strong bulk mutation policy.
- Recommended rule:
  - bulk actions should default to navigation, triage, and low-risk state updates
  - live execution mutations should stay narrow unless the runtime has an explicit safe batch semantic for that exact action
- Good candidate bulk actions:
  - navigate to selected nodes/concerns
  - open selected items in `History`, `Evidence`, or `Ledger`
  - acknowledge multiple advisory concerns
  - archive/remove historical exports or retained views where policy clearly allows it
- Bad default bulk actions:
  - retry many nodes at once
  - apply graph patch to multiple scopes at once
  - approve multiple HITL/runtime blocked actions with one generic confirm
  - cleanup/remove many live lanes/worktrees without exact target preview

### Shortcut direction
- Keyboard shortcuts should stay useful but sparse.
- Strong recommendation:
  - shortcuts primarily target navigation, focus, search, inspector toggles, and common non-destructive actions
- Good shortcut candidates in Orchestrator:
