  - `History` selection changes the whole page's focused run
  - `Node Graph`, `Evidence`, and `Ledger` all pivot to the same `run_id`
  - `Progress` in historical mode must stop pretending to be a live dashboard and instead become a historical summary for that run, or show a reduced/locked state with a switch-back-to-live CTA
- This is important:
  - otherwise each tab can drift into a different run context and the page becomes incoherent

### Progress-tab implication
- Current `Progress` tab language is heavily live-run oriented.
- If Orchestrator shares one focused run across all tabs, then `Progress` needs an explicit historical behavior.
- Likely good direction:
  - in historical mode, `Progress` becomes a historical run summary surface
  - live-only widgets either:
    - switch to historical-summary rendering
    - or show disabled/live-unavailable state with explanation
- This needs a sharper contract later.

### Contradictions / gaps surfaced
- No explicit `historical-run mode` contract yet.
- No obvious `orchestrator.project_state.{project_id}` for focused run persistence.
- `History` currently includes `Delete Run`, which may conflict with durable historical/audit expectations unless delete semantics are defined carefully.
- `Progress` is described as a live dashboard, but the shared run-focus model implies it may also need to represent historical runs coherently.
- Background runs exist in Dashboard, but Orchestrator focus rules for live-vs-historical switching are not yet specified.

### Candidate fixes to carry forward
- Add explicit `active_run_id` vs `focused_run_id` semantics.
- Add a first-class `Historical Run Mode` UI contract for Orchestrator.
- Add `orchestrator.project_state.{project_id}` with focused run and per-tab state.
- Define which commands are:
  - live-run only
  - historical-safe
  - record-only/export-only
- Define how `Progress` behaves when the focused run is historical.

### Do-not-forget details
- The page must not auto-switch focus away from a historical run just because live activity appears.
- The user should always know whether they are looking at the active run or a historical run.
- Cross-tab deep links must preserve focused `run_id` so History -> Graph -> Evidence -> Ledger stays coherent.

## Research Progress - 2026-03-16 - Search Across Orchestrator Tabs

### Targeted docs read
- `Plans/Orchestrator_Page.md`
- `Plans/Run_Graph_View.md`
- `Plans/storage-plan.md`
- `Plans/FinalGUISpec.md`
- `Plans/Widget_System.md`

### Key findings
- Existing docs mostly define local/tab-specific search and filtering:
  - Run Graph has node search/filter
  - Evidence has local search/filter
  - Ledger has local filter/sort
  - History is currently a list/table view
- Cross-surface navigation exists in fragments:
  - graph detail can open Evidence
  - graph can open Usage
  - History rows can open Graph/Evidence
  - Ledger can open Usage
- Storage already provides the right backend ingredients:
  - seglog is canonical
  - Tantivy is the intended full-text/search layer
  - project-scoped indices are already part of the storage model
- What is still missing is a unified Orchestrator search contract that is object-first rather than page-first.

### Recommended search model
- Strong recommendation:
  - distinguish `global object search` from `tab-local filtering`
- Proposed split:
  - `Orchestrator search`
    - object-first, run-aware, cross-tab routing
  - `tab-local search`
    - local narrowing/filtering within the active tab/view
- Object-first search targets should include at minimum:
  - run
  - seam
  - package
  - node
  - lane / worktree
  - concern
  - promotion
  - review
  - corroboration
  - graph patch
  - recovery / safe-point object where applicable
  - evidence/artifact when directly addressable

### Routing contract direction
- Search results should not merely highlight text.
- Each result should carry a canonical route target:
  - `focused_run_id`
  - destination tab
  - selected object id
  - optional filter payload
  - optional inspector/detail target
- Examples:
  - seam/package -> `Seams` tab with correct hierarchy expanded
  - node -> `Node Graph` with node selected and inspector open
  - evidence/artifact -> `Evidence` with panes focused appropriately
  - promotion/review/corroboration/graph patch/recovery record -> likely `Ledger` or `History` depending on whether exact-record or story context is primary
  - run -> switch `focused_run_id` and open the relevant tab/context

### Focused-run interaction
- Orchestrator search must be run-aware.
- Recommended behavior:
  - default scope = current focused run for quick local relevance
  - user can widen to project-wide / all runs within the project
  - when a result belongs to another run, selecting it should explicitly switch the focused run
  - the UI should disclose that the focused run changed because of the search result
- This pairs directly with the multi-run seam:
  - search result routing must preserve or intentionally change `focused_run_id`
  - it must never do so silently

### Global vs local search distinction
- Recommended user model:
  - `Search in this tab`
    - local filter / text match / list narrowing
  - `Search Orchestrator`
    - object-first, cross-tab, route-aware
- Good fit:
  - tab-local search stays embedded in tabs like Graph/Evidence/Ledger
  - Orchestrator search can be:
    - a page-level search box
    - and/or command-palette integrated

### Command palette integration direction
- `FinalGUISpec.md` already defines a global command palette.
- Recommended contract:
  - command palette can expose Orchestrator object results, not just commands/pages
  - selecting an object result should route through the same deep-link contract as Orchestrator search
- This avoids building two incompatible navigation systems.

### Indexing / backend direction
- Likely backend split:
  - exact structured object lookup from redb projections / record indices
  - text search from Tantivy where summaries/descriptions/content matter
- Good rule:
  - search should prefer stable object identity matches first
  - text/full-text results come after exact object hits
- This matters for:
  - object ids
  - canonical names/titles
  - historical records with long textual payloads

### Search-result presentation direction
- Good result row fields:
  - object type
  - label/title
  - run context
  - parent context
  - current state / severity when relevant
  - target tab
- Example parent context:
  - seam > package > node
  - package > lane
  - run > graph patch
  - node > concern

### Contradictions / gaps surfaced
- Current docs define many local filters but not a unified Orchestrator search object model.
- There is no current canonical routing payload shared across search, deep links, and cross-tab navigation.
- Search scope behavior across current focused run vs all project runs is not yet defined.
- `Tantivy` is clearly intended for search, but the object/record side of Orchestrator search is not yet specified enough to rely on full-text alone.

### Candidate fixes to carry forward
- Define a canonical Orchestrator search result contract with:
  - object identity
  - object type
  - focused-run implications
  - destination tab
  - selection/filter payload
- Separate page-level Orchestrator search from tab-local filtering.
- Reuse the same routing contract for:
  - search results
  - command palette results
  - cross-tab deep links
  - `Show in ...` actions
- Make search object-first and run-aware, not just text-match-first.

### Do-not-forget details
- Search should help the user find the right object, not force them to know which tab owns it first.
- A narrow Source Control panel reinforces that richer cross-object search belongs more naturally in Orchestrator / command-palette flows than in side-panel SCM UI.
- Historical results must preserve run context clearly so search does not create silent run-focus jumps.

## Research Progress - 2026-03-16 - Historical vs Current Record Semantics

### Targeted docs read
- `Plans/storage-plan.md`
- `Plans/Contracts_V0.md`
- `Plans/Run_Graph_View.md`
- `Plans/Orchestrator_Page.md`
- `Plans/FinalGUISpec.md`

### Key findings
- The storage/runtime model already contains some strong historical semantics:
  - attempts from older generations can become `stale_historical`
  - blocked projections remain historical after resolution
  - historical lineage must remain visible even when live targets disappear
  - remediation resolution already includes `fixed`, `superseded`, `abandoned`, `replan_required`
- The problem is uneven application:
  - attempts have relatively explicit historical semantics
