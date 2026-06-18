# Run Graph View (Node Graph Display) -- Specification


## Canonical owner-section requirements

These requirements are canonical live specification text for this owner document and preserve the required product, runtime, storage, UI, and governance details in owner-section form.

### Concern linkage to adjacent families


### Focused run and historical routing contract


## 1. Scope and canonical role


Run Graph is the canonical graph/lineage inspection surface for orchestrated execution.

Rules:
- graph nodes are runtime nodes, not tiers
- graph lineage spans generations when graph patching occurs
- blocked/recovery/promotion/corroboration state belongs in graph detail when it pertains to the selected node or related lineage object

ContractRef: ContractName:Plans/Executor_Protocol.md, ContractName:Plans/Orchestrator_Page.md, ContractName:Plans/storage-plan.md

### P5 run-graph focus and identity recovery requirements

- GUI navigation must demote `Tiers` from a primary Orchestrator tab/page concept: `Seams` plus `Node Graph` are the rewrite primary surfaces, and tier labels survive only as derived view context.
- Run Graph distinguishes `active run truth` from `focused run context`: `active_run_id?` names live runtime truth, while `focused_run_id?` and `focus_mode = live | historical` name the page selection and first-class `Historical Run Mode` state.
- Page-level search and route selection must remain separate from `/tab-specific` `/filter`, `/sort`, and `/table` controls; graph node search/filter, Evidence local search/filter, Ledger filter/sort, and History list/table controls do not rewrite focused run state except through an explicit route.
- `Orchestrator / Graph inspector / run detail` is `/execution-axis` heavy: for each run or `/attempt`, the inspector answers what the run/attempt requested, what actually happened, and why.
- One shared `/deep-link` routing payload preserves target context for search results, command-palette results, widget `drill-downs`, recovery links, and cross-surface pivots; search and command-palette navigation must not restore a watered-down approximation.
- `Run_Graph_View.md` data-source joins retarget away from `tier_id` toward `node_id` and `attempt_id`; the remaining `follow-up` is whether any tier display survives as presentation `/grouping`, never as `/execution` authority or the primary Usage, Output, or Run Graph join key.
- Evidence, terminal, usage, and output routing must not remain `tier-keyed` once attempts, blocked episodes, and graph generations are first-class routing objects.
- Deep links generally do not preserve `non-stable` UI layout state such as transient panel widths, `/split` ratios, ephemeral local widget state, or every possible inspector subsection detail.
- Concern merge, `/split/supersession`, and supersession logic remain `discussion-only` until the concern identity/routing rules become `contract-level`; Run Graph may link candidate concern operations but must not invent canonical merge authority.
- `projection-trust` failures and `weak-integration` findings may both mint real concerns, but they remain different concern categories with distinct evidence, routing, and remediation semantics.
- `Node Graph` keeps culling, caching, and `throttled-update` behavior; old generations stay in the data model, while generation visibility controls, focus mode, and `density-aware` overlays keep historical branches available without rendering every path at full fidelity.
- Graph detail uses reusable `detail-pane` and `drill-in` patterns shared across Orchestrator, graph detail, history `/ledger` pivots, and evidence `/artifact` surfaces.
- `field-name` modernization is insufficient without canonical scope modernization: renamed graph fields must also retarget to run, node, attempt, blocked-episode, generation, lane, and artifact identity scopes.
- The graph `view-model` MUST NOT keep `hitl_request_id` as the durable action identity once the blocked/recovery model moves to `blocked-episode` identity; any legacy HITL field is compatibility lineage only.
- `live-status` source tables in Run Graph and Orchestrator consume canonical runtime records and `/projections` first, then disclose stale/degraded projection trust before showing live claims.
- Route/open auditing stays focused on refinement omissions, not `re-claiming` absence of primitives that already landed; `/open` checks verify payload fidelity, owner routing, and missing context only.
- Graph `/search/focus-to-object` supports seam, package, node, lane, and generation focus; focus pans and applies `/zoom` to target regions while preserving `full-graph` context rather than replacing the graph with a `local-only` view, and branch `/rejoin` overlays, minimap, and search remain `generation-aware`.
- `active_run_id` is the currently running, `/paused/interrupted`, or otherwise active run for the project; `focused_run_id` is the run shown by Orchestrator tabs, `focus_mode = live` when `focused_run_id == active_run_id`, and `focus_mode = historical` when the user inspects a non-active run.
- The shared destination payload spans search results, command palette entries, widget `drill-downs`, deep links, resume `URLs`, cross-surface "Show in ..." pivots, preview restore, artifact opens, and `subject-open` semantics through the same identity model.
- Run Graph command/routing cleanup disposition: earlier `cmd.graph.approve_hitl` / `deny_hitl`, `request_id`, graph-local recovery IDs, unbound cross-surface open commands, and missing projection-trust payload notes are stale lineage. Live Run Graph actions consume `UI_Command_Catalog.md`, blocked/runtime approval identity, `blocked_sequence`, `allowed_action_ids[] -> cmd.runtime.*`, shared route/open payloads, and projection-trust payloads before mutating stale/degraded projections.
- Node Graph tab direction was extended beyond lineage: - graph canvas + right-side detail inspector - detail inspector should expose: - requested/effective provider/model/effort/persona/account - usage/token/cost info - worker policy (agent/subagent, fresh/reused, spawn path) - retry/review/promotion state - lane/worktree/snapshot state - linked evidence/artifacts - clicking evidence/artifact links in graph detail should deep-link into the Evidence tab with target selection/filter applied
- Run Graph tier-era cleanup disposition: older worker/verifier activity filtered by `tier_id`, `View in Usage`, `worker_provider`, `worker_model`, `verifier_provider`, `verifier_model`, `hitl_request_id`, `Open that tier in the Tiers tab`, `View in Tiers`, and `Copy tier_id` are compatibility/source-lineage tokens only. Live Run Graph joins use node_id, attempt_id, blocked episode, graph generation, lane, artifact, provider platform identity, `scheduler_lane`, `allowed_action_ids[]`, `blocked_sequence`, and historical lineage preservation.
- Node Graph tab direction now includes: - graph canvas + right-side detail inspector - node click should expose: - requested/effective provider/model/effort/persona/account - usage/token/cost info - worker policy - retry/review/promotion state - lane/worktree/snapshot state - linked evidence/artifacts - clicking evidence/artifact links from node detail should navigate to the Evidence tab with the relevant evidence/artifact selected
- Multi-account history cleanup disposition: the stale claim that `Multi-Account.md` still has no durable `account.switched` / switch-episode family is retired because `Contracts_V0.md` defines `account_switch_event` and Multi-Account persists durable switch and pressure history through `account_switch_event` and `account_pressure_episode`. Remaining role-scoping concerns such as `policy_hash`, `actor_kind`, and `execution_role` stay routed to their owner docs.
- Default Progress-widget drill targets were made deterministic: - Run Status -> `History` - Current Activity -> `Node Graph` - Attention / Blockers -> `Node Graph` - Seam Health -> `Seams` - Package Activity -> `Seams` - Promotion Queue -> `Ledger` - Worktree Lanes -> `Node Graph` - Account / Usage Pressure -> `Usage` - Recent Major Events -> `History` - Overseer Activity -> `Seams` - Corroboration Queue -> `Evidence` - Recovery State -> `Evidence` - Throughput / Capacity -> `History`
- Likely good surface behavior: - `Progress`: show run-level trust banner or chip when projections are stale/degraded - `Seams`: allow browsing, but gate actions that depend on current promotion/blocker truth - `Node Graph`: keep historical graph and current selections visible, but flag when live node state may be stale - `Evidence`: artifact browsing can remain available; live verdict/action affordances may gate - `History` / `Ledger`: usually the fallback-safe surfaces because they are closest to canonical records
- `Plans/Orchestrator_Page.md` / `Plans/FinalGUISpec.md` - The rerun sharpened several misses that were previously grouped too broadly: - explicit `focus_mode = live | historical` - `orchestrator.project_state.{project_id}` persistence record - page-wide shared `focused_run_id` coherence across tabs - historical Progress behavior - default search scope = focused run, widening to project/all-runs, and required disclosure when search changes focused run - global-vs-local Orchestrator search distinction - explicit fallback hierarchy to History/Ledger under projection degradation
- Current GUI/orchestrator documentation has retired the older surface model: any source-lineage lists such as `Progress`, `Tiers`, `Node Graph Display`, `Evidence`, `History`, `Ledger` are compatibility evidence only; the active seven-tab shell is `Progress`, `Plan Compile`, `Seams`, `Node Graph`, `Evidence`, `History`, `Ledger`.
- Cross-tab navigation is now treated as a real contract: - object/event focus should deep-link across Progress / Plan Compile / Seams / Node Graph / Evidence / History / Ledger where the target is in that tab's scope - deep links should carry selection/filter/focus context, not merely switch tabs - `Seams` and `Node Graph` should share focus context without hyperactive live-sync
- This now conflicts with current rewrite direction: - `Progress` is the widget-hosting tab - `Seams`, `Node Graph`, `Evidence`, `History`, and `Ledger` are fixed-purpose tabs with stronger native layouts and interaction contracts - `Node Graph` is explicitly not a widget - `Evidence` has separate evidence/artifact panes - `History` and `Ledger` stay distinct for chronology vs exact record inspection
- Implications: - `History` selection changes the whole page's focused run - `Node Graph`, `Evidence`, and `Ledger` all pivot to the same `run_id` - `Progress` in historical mode must stop pretending to be a live dashboard and instead become a historical summary for that run, or show a reduced/locked state with a switch-back-to-live CTA
- Narrow the widget-hostable Orchestrator surface to `Progress` only. - `Seams`, `Node Graph`, `Evidence`, `History`, and `Ledger` become native surfaces with their own state contracts
- Examples: - seam/package -> `Seams` tab with correct hierarchy expanded - node -> `Node Graph` with node selected and inspector open - evidence/artifact -> `Evidence` with panes focused appropriately - promotion/review/corroboration/graph patch/recovery record -> likely `Ledger` or `History` depending on whether exact-record or story context is primary - run -> switch `focused_run_id` and open the relevant tab/context
- Separate page-level Orchestrator search from tab-local filtering. - Reuse the same routing contract for: - search results - command palette results - cross-tab deep links - `Show in ...` actions
- `hard_gate` - approve/reject HITL boundaries - graph patch application when it changes canonical graph generation - remote-side-effect actions with explicit non-bypassable policy - any approval path whose allowed actions are defined by runtime blocked/HITL contracts rather than generic UI choice
- `Node Graph` - focused inspection may survive mild staleness - live status claims, blocked action buttons, and generation overlays should disclose trust state explicitly
- concerns need durable identity and lineage, not just severity/status - `acknowledged` is a noise-control state, not a semantic resolution
- But wizard/attention flows already use exact deep links via `resume_url`, and Usage/artifact surfaces already imply identity-native jumps using `usage_event_ref` and related canonical refs.
- stale consumer cleanup - graph and Orchestrator command payloads - active-tier widgets and tier-targeted terminals - tier-keyed usage/evidence correlation - legacy `PuppetMasterEvent::*` source tables
- Remove `request_id` as the primary action target from graph command payloads. - Replace `hitl_request_id` in graph data requirements with blocked/runtime approval identity or explicit compatibility lineage-only fields.
- **Schema-level contradictions are active, not hypothetical.** is preserved as stale audit-lineage for the pre-cleanup state. Live scheduler ordering consumes the executor scored ready-set; graph-schema lexicographic ordering is not execution authority. Remaining base provider envelope/spec and acceptance/evidence/coverage identity gaps route to Contracts_V0, Executor Protocol, and schema owner docs before Run Graph consumes them.
- Recommended explicit mode: - `Historical Run Mode` - Required behavior: - all tabs clearly show the focused historical `run_id` - the page displays a persistent banner/chip that the user is viewing historical data - controls that only make sense for the active run are disabled or removed - actions route against the focused run only when they are historical-safe
- Candidate fields: - `focused_run_id?` - `focus_mode` - `last_live_run_id?` - `selected_tab` - per-tab view state refs - maybe `auto_return_to_live = false` by default
- Likely good direction: - in historical mode, `Progress` becomes a historical run summary surface - live-only widgets either: - switch to historical-summary rendering - or show disabled/live-unavailable state with explanation
- Add a canonical role enumeration and apply it consistently to role-scoped account policies, Persona resolution, permission scoping, and provider dispatch.
- Replace stale `Tiers` tab/page assumptions with the rewrite tab model: - `Progress` - `Plan Compile` - `Seams` - `Node Graph` - `Evidence` - `History` - `Ledger`
- `Plans/Run_Graph_View.md` - **Impacted surface:** Execution visualization. - **Likely issue:** Grouped-by-phase layouts are rigid. Needs a graph or swimlane view to show parallel work packages and dependencies.
- Existing wording is not enough yet: - `Orchestrator_Page.md` says the graph renders when a run is active or a historical run is selected - `History` rows can load a historical run into the graph/evidence - `Ledger` filters to the current/selected run - but there is no clear mode contract for what the whole page is in after a historical run is selected
- No explicit `historical-run mode` contract yet. - No obvious `orchestrator.project_state.{project_id}` for focused run persistence.
- Recommended concern envelope + payload core: - `concern_id` - `project_id` - `run_id?` - `scope_type` - `scope_id` - `status` - `severity` - `category` - `summary` - `description?` - `owner_kind?` - `origin_kind` - `created_at_utc` - `updated_at_utc` - `first_observed_at_utc` - `last_observed_at_utc` - `resolution_kind?` - `resolution_rationale?` - `acknowledged_by?` - `acknowledged_at_utc?` - `dismissed_by?` - `dismissed_at_utc?` - `source_refs[]` - `evidence_refs[]` - `related_record_refs[]` - `lineage_refs[]` - `blocked_episode_refs[]?` - `promotion_refs[]?` - `graph_patch_refs[]?` - `recovery_refs[]?`
- `Plans/usage-feature.md` still says: - Run Graph and Orchestrator aggregate by `tier_id` and `attempt_id?` - `usage.jsonl` aggregation is tier-based
- Graph-view direction is now materially clearer: - the graph should show the full lineage, including historical branches and patched fork/rejoin paths - the graph is expected to handle very large scale (thousands of nodes) - zoom + pan + minimap are expected to be primary navigation tools; full-graph visibility should not be replaced by default collapsing of history - seam and package boundaries should be visible as toggleable overlays - node visuals should carry execution/governance state - edge/path visuals should carry structure/lineage meaning - boundaries should carry grouping only, not duplicate state/severity semantics
- Additional projection/UI constraints from the user: - Source Control worktree area likely needs top-level partitioning: - `Orchestrator Owned` - `Other` - the `Orchestrator Owned` section likely needs further subdivision because of worktree volume; breaking by `feature seam` is a plausible direction - Orchestrator page is a very high-density information surface across many tabs, so projection design must assume very large detail volume rather than a small/simple inspector
- Background-run behavior exists, but it is still somewhat separate from Orchestrator run-focus semantics: - background runs have queue/state events - Dashboard has a Background Runs card - but Orchestrator does not yet clearly define how active background runs interact with a currently focused historical run
- When focused on the live run: - live cards/widgets are active - CTAs operate on current runtime truth - background events and live state changes update the focused tabs directly
- Add `resolution_kind` and rationale requirements for dismiss/resolve paths. - Define how nominated findings become canonical concerns.
- Example: - explicit search navigation to a historical run likely should update persisted Orchestrator focused-run state - hover previews or temporary compare pivots should not necessarily rewrite persistent state
- This makes the concern gap more concrete: - concerns need exact identity, lineage, source linking, status, and interaction rules - they should not just be badges, notes, or review leftovers
- Historical run-graph and Orchestrator page audit notes identified tier-bound drift: older `Run_Graph_View.md` text had near-zero awareness of concern/corroboration/promotion/graph-patch/lane/package object families, and older `Orchestrator_Page.md` text specified `Tiers` and widget/persistence contracts around that obsolete structure. Current active navigation consumes the seven-tab Orchestrator shell with `Plan Compile` and `Seams`, while `Tiers` remains compatibility lineage only.
- `effective_provider_identity` / `provider_identity` / `effective_project_id` are already treated as optional non-secret disclosure fields. That makes them the wrong place to encode actor role or side-effect target identity.
- `page_tab` - examples: Orchestrator tabs like Progress, Plan Compile, Seams, Node Graph, Evidence, History, Ledger; Tiers is a compatibility/search alias only.
- **Tiers-first UI is misleading historical lineage.** The retired Tiers tab, `widget.tier_tree`, phase-grouped graph layouts, and single-current-task widgets all assume execution authority still lives in the tier hierarchy instead of the node/package/seam graph.
- **Tiers are compatibility/search aliases, not productized active navigation.** GPT-5.4 repeatedly found historical `Tiers` references as a primary tab, navigation target, widget namespace, and telemetry dimension; current routing uses `Seams` and the seven-tab shell.
- Distinguish: - `historical run` - `related run` - `derived run` - `retry/recovery run` or continuation lineage if such a concept exists later
- Working interpretation: - `historical run` = any non-active/non-focused run retained for the project - `related run` = explicitly linked by user/system relationship metadata - `derived run` = intentionally spawned from or based on another run's outputs/graph/contracts
- graph patch - request patch may be `strong` - apply accepted patch should likely be `hard_gate` or runtime-controlled strong action because it changes canonical graph generation
- node graph detail: - `object_kind = node` or `attempt` - `object_id = <id>` - `inspector_target = evidence` / `history` / `reviews` / similar


## 2. Layout
The graph view has three primary regions:
- top header for run scope, generation scope, and trust state
- main graph canvas with minimap/search/overlays
- right-side inspector and table region

Rules:
- current generation is emphasized by default
- superseded and historical branches remain visible and clickable
- large-graph modes use virtualization, level-of-detail reduction, and lineage-focused defaults rather than hiding historical truth
- `Run_Graph_View` treats `by-phase` grouping as a compatibility layout only; canonical layouts include package-group swimlanes, seam boundaries, and parallel lane visualization so work packages and dependencies remain visible without collapsing into phase order.
- The Run Graph and Orchestrator lineage view carries concise requested-vs-effective SCM state for mutation-capable attempts, including repo/worktree/branch `/head`, `/branches/commit`, safe-point relation, and partial receipt availability. `Seams`, `Node Graph`, `History`, `Evidence`, and `Ledger` all show enough SCM identity to distinguish runs by worktree, branch, commit range, and receipt lineage, while `Plan Compile` shows only design-only compile/handoff readiness status; the `Ledger` may stay usage-focused only when a parallel receipt/lineage surface is available.

ContractRef: ContractName:Plans/Decision_Policy.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Contracts_V0.md

## 3. Node detail inspector

Diff cards cap previews at 50 lines; diffs above that cap show a truncation marker such as `… N lines omitted` and a `View Full Diff` action resolving to `cmd.file.open_with` with target `diff_review`.

SCM recovery and lineage actions in graph/node detail use exact command-catalog pivots: `cmd.orchestrator.open_receipt`, `cmd.orchestrator.compare_run_output`, `cmd.orchestrator.open_source_control`, `cmd.orchestrator.open_github_actions`, `cmd.orchestrator.open_docker_manager`, `cmd.orchestrator.open_kubernetes`, `cmd.orchestrator.open_conflict_assistant`, and `cmd.orchestrator.restore_safe_point_then_retry`. `restore_safe_point_then_retry` must carry exact worktree/baseline targeting rather than implied reuse. These commands open owner surfaces with stable route context after restart and label missing lineage as partial rather than synthesizing a repo, worktree, `/head`, receipt, or recovery target.

ContractRef: ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/FileManager.md


#### Acceptance carry-through
- Expose review_refs, corroboration_refs, graph_patch_refs, recovery_refs, blocked_episode_refs, and promotion_refs on concerns
- Allow blocked episodes to reference concerns without replacing concern identity

## 4. Data model and identity

The Run Graph data model includes a persistent effective-runtime inspector for every attempt that resolved through provider routing. It records `provider_entry`, `provider_family`, `requested_platform`, and `effective_platform` mappings back to Orchestrator vocabulary: `requested_platform` and `effective_platform` identify the concrete provider entry/runtime surface that was requested or executed, while `provider_family_id` remains additive grouping metadata and never replaces platform identity.


#### Acceptance carry-through
- Use active_run_id/focused_run_id with focus_mode = live | historical
- Keep cross-tab deep links and search pivots coherent on the focused run
- Source Control `Graph` integration is a consumer projection of Source Control graph state, not a separate graph authority. When a run commit belongs to a known worktree or receipt, Run Graph links to Source Control graph focus; when graph parsing fails, it degrades to branch/history pivots with an explicit disabled reason.

## Owner / Consumer Map

This source-preserving standardization keeps the owner and consumer boundaries stated in the original document body. During this batch, `Plans/Run_Graph_View.md` remains the owner doc for the behavior described by its preserved sections, while cross-doc ownership follows the ContractRefs and boundary notes already present in the original text.

ContractRef: ContractName:Plans/Plan_Document_System.md, ContractName:Plans/Bootstrap_Planning_Migration.md

## PlanUnits

### RGV-001 - Run Graph Canonical Scope

```yaml
plan_unit_id: RGV-001
unit_type: requirement
status: accepted
owner_doc: Plans/Run_Graph_View.md
canonical_text: Run Graph is the canonical graph and lineage inspection surface for orchestrated execution. Graph nodes are runtime nodes rather than tiers; lineage spans graph generations; blocked, recovery, promotion, and corroboration state appears in graph detail when it belongs to the selected node or related lineage object.
gui_related: true
gui_classification_reason: The unit defines the user-visible Run Graph inspection surface.
depends_on: []
unblocks: [RGV-002, RGV-003, RGV-004, RGV-005, RGV-006]
acceptance_criteria:
- Graph nodes are modeled as runtime nodes, not tiers.
- Graph lineage remains generation-aware when graph patching occurs.
- Node detail can expose blocked, recovery, promotion, and corroboration state for selected or related lineage objects.
validation_surfaces:
- Manual review of Plans/Run_Graph_View.md section 1.
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-plans-verify.py run-gates
risk_class: route_owner_drift
reasoning_tier: standard
context_scope: run_graph_owner_surface
implementation_surfaces:
- Plans/Run_Graph_View.md
- future Run Graph UI
node_compile_hint:
  mode: future_compiler_input
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Run_Graph_View-S0001
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Run_Graph_View-S0002
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Run_Graph_View-S0005
- Plans/Run_Graph_View.md:1-24
preserved_exact_tokens:
- Run Graph View (Node Graph Display) -- Specification
- Canonical owner-section requirements
- 1. Scope and canonical role
negative_constraints:
- Do not treat tiers as runtime graph nodes.
owner_hints:
- Plans/Run_Graph_View.md
```

ContractRef: ContractName:Plans/Run_Graph_View.md, ContractName:Plans/Executor_Protocol.md

### RGV-002 - Focused Run And Historical Mode

```yaml
plan_unit_id: RGV-002
unit_type: requirement
status: accepted
owner_doc: Plans/Run_Graph_View.md
canonical_text: Run Graph distinguishes active run truth from focused run context. active_run_id names live runtime truth; focused_run_id and focus_mode = live | historical name the selected run, page state, and Historical Run Mode behavior across Orchestrator tabs.
gui_related: true
gui_classification_reason: This unit defines visible run focus, historical-mode indicators, tab behavior, and user-facing controls.
depends_on: [RGV-001]
unblocks: [RGV-003, RGV-005, RGV-010]
acceptance_criteria:
- active_run_id and focused_run_id are distinct concepts.
- focus_mode is live only when focused_run_id equals active_run_id; historical mode applies when the user inspects a non-active run.
- Historical mode clearly identifies the focused historical run and disables, removes, or reroutes live-only actions.
- Progress, Node Graph, Evidence, History, and Ledger remain coherent against the focused run.
validation_surfaces:
- Manual focus-mode review across Run Graph and Orchestrator docs.
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-plans-verify.py run-gates
risk_class: historical_run_focus
reasoning_tier: standard
context_scope: run_focus_state
implementation_surfaces:
- Plans/Run_Graph_View.md
- Plans/Orchestrator_Page.md
- Plans/storage-plan.md
- future Orchestrator project state projection
node_compile_hint:
  mode: focused_run_state_requirement
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Run_Graph_View-S0004
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Run_Graph_View-S0006
- Plans/Run_Graph_View.md:29-31
- Plans/Run_Graph_View.md:45-46
- Plans/Run_Graph_View.md:58-61
- Plans/Run_Graph_View.md:69-71
- Plans/Run_Graph_View.md:75-76
- Plans/Run_Graph_View.md:81-84
preserved_exact_tokens:
- active_run_id?
- focused_run_id?
- focus_mode = live | historical
- Historical Run Mode
- orchestrator.project_state.{project_id}
negative_constraints:
- Tab-local filters, sorts, tables, graph node search, Evidence local search/filter, Ledger filter/sort, and History list/table controls do not rewrite focused run state except through an explicit route.
owner_hints:
- Plans/Run_Graph_View.md
- Plans/Orchestrator_Page.md
- Plans/storage-plan.md
```

ContractRef: ContractName:Plans/Run_Graph_View.md, ContractName:Plans/Orchestrator_Page.md, ContractName:Plans/storage-plan.md

### RGV-003 - Shared Deep-Link And Search Routing

```yaml
plan_unit_id: RGV-003
unit_type: constraint
status: accepted
owner_doc: Plans/Run_Graph_View.md
canonical_text: Run Graph uses one shared destination payload for search results, command-palette results, widget drill-downs, recovery links, resume URLs, artifact opens, subject-open semantics, and cross-surface pivots. Navigation preserves target identity and context instead of switching tabs with an approximate target.
gui_related: true
gui_classification_reason: The unit governs user-visible navigation, deep links, command-palette results, and search focus behavior.
depends_on: [RGV-001, RGV-002]
unblocks: [RGV-005, RGV-010]
acceptance_criteria:
- Page-level Orchestrator search remains separate from tab-local filtering controls.
- Search, command-palette, widget drill-down, recovery, resume URL, artifact open, and Show-in pivots reuse the same identity model.
- Graph focus-to-object can target seam, package, node, lane, and generation objects while preserving full-graph context.
- Deep links avoid preserving non-stable layout state such as transient panel widths, split ratios, and ephemeral widget state.
validation_surfaces:
- Route/open payload audit.
- Manual cross-surface deep-link review.
- python3 scripts/pm-plan-index.py validate
risk_class: route_fidelity
reasoning_tier: high
context_scope: cross_surface_navigation
implementation_surfaces:
- Plans/Run_Graph_View.md
- Plans/UI_Command_Catalog.md
- Plans/Orchestrator_Page.md
- Plans/Contracts_V0.md
node_compile_hint:
  mode: routing_contract
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Run_Graph_View-S0006
- Plans/Run_Graph_View.md:30-35
- Plans/Run_Graph_View.md:43-46
- Plans/Run_Graph_View.md:56-61
- Plans/Run_Graph_View.md:84
- Plans/Run_Graph_View.md:94
preserved_exact_tokens:
- /deep-link
- /search/focus-to-object
- full-graph
- local-only
- Show in ...
negative_constraints:
- Search and command-palette navigation must not restore a watered-down approximation.
- Deep links generally do not preserve non-stable UI layout state.
owner_hints:
- Plans/Run_Graph_View.md
- Plans/UI_Command_Catalog.md
- Plans/Contracts_V0.md
```

ContractRef: ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/Contracts_V0.md

### RGV-004 - Graph Layout, Scale, And Generation Visibility

```yaml
plan_unit_id: RGV-004
unit_type: requirement
status: accepted
owner_doc: Plans/Run_Graph_View.md
canonical_text: The Run Graph layout has a run/generation/trust header, a main graph canvas with minimap, search, and overlays, and a right-side inspector/table region. It keeps historical and superseded branches available through generation-aware controls, culling, caching, virtualization, level-of-detail reduction, and density-aware overlays.
gui_related: true
gui_classification_reason: This unit defines visible layout regions, graph canvas behavior, overlays, minimap, zoom, pan, and inspector placement.
depends_on: [RGV-001]
unblocks: [RGV-005]
acceptance_criteria:
- Current generation is emphasized by default without hiding historical truth.
- Superseded and historical branches remain visible and clickable.
- Large graphs use virtualization, culling, caching, throttled updates, level-of-detail reduction, and lineage-focused defaults.
- Canonical layouts include package-group swimlanes, seam boundaries, and parallel lane visualization rather than phase-only grouping.
validation_surfaces:
- Manual Run Graph layout review.
- Large-graph interaction and projection review.
- python3 scripts/pm-plan-index.py validate
risk_class: large_graph_usability
reasoning_tier: high
context_scope: run_graph_layout
implementation_surfaces:
- Plans/Run_Graph_View.md
- Plans/FinalGUISpec.md
- future Run Graph canvas
node_compile_hint:
  mode: gui_surface_requirement
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Run_Graph_View-S0006
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Run_Graph_View-S0007
- Plans/Run_Graph_View.md:38-39
- Plans/Run_Graph_View.md:44
- Plans/Run_Graph_View.md:79-80
- Plans/Run_Graph_View.md:97-110
preserved_exact_tokens:
- minimap
- overlays
- throttled-update
- density-aware
- package-group swimlanes
- seam boundaries
- parallel lane visualization
compatibility_only_notes:
- by-phase grouping is a compatibility layout only.
owner_hints:
- Plans/Run_Graph_View.md
- Plans/FinalGUISpec.md
```

ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Decision_Policy.md

### RGV-005 - Node Detail Inspector Content And Actions

```yaml
plan_unit_id: RGV-005
unit_type: requirement
status: accepted
owner_doc: Plans/Run_Graph_View.md
canonical_text: Node detail exposes requested/effective provider, model, effort, persona, account, usage, cost, worker policy, retry/review/promotion state, lane, worktree, snapshot, linked evidence, artifacts, review refs, corroboration refs, graph patch refs, recovery refs, blocked episode refs, and promotion refs. Evidence and artifact links deep-link to Evidence with target selection or filtering applied.
gui_related: true
gui_classification_reason: This unit defines the visible right-side detail inspector, diff cards, action affordances, and Evidence pivots.
depends_on: [RGV-001, RGV-002, RGV-003, RGV-004]
unblocks: [RGV-010]
acceptance_criteria:
- Node click opens detail with runtime identity, usage/cost, worker policy, retry/review/promotion, lane/worktree/snapshot, and evidence/artifact linkage.
- Diff previews cap at 50 lines and expose a View Full Diff action targeting diff_review.
- SCM recovery and lineage actions use exact UI Command Catalog pivots and stable route context after restart.
- Missing lineage is labeled partial rather than synthesized.
validation_surfaces:
- Manual node detail and action payload review.
- UI Command Catalog cross-check.
- python3 scripts/pm-plan-index.py validate
risk_class: inspector_fidelity
reasoning_tier: standard
context_scope: node_detail_surface
implementation_surfaces:
- Plans/Run_Graph_View.md
- Plans/UI_Command_Catalog.md
- Plans/FileManager.md
- future Run Graph inspector
node_compile_hint:
  mode: gui_surface_requirement
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Run_Graph_View-S0006
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Run_Graph_View-S0008
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Run_Graph_View-S0009
- Plans/Run_Graph_View.md:48-50
- Plans/Run_Graph_View.md:94
- Plans/Run_Graph_View.md:112-123
preserved_exact_tokens:
- requested/effective provider/model/effort/persona/account
- View Full Diff
- cmd.orchestrator.restore_safe_point_then_retry
- review_refs
- blocked_episode_refs
negative_constraints:
- restore_safe_point_then_retry must carry exact worktree/baseline targeting rather than implied reuse.
owner_hints:
- Plans/Run_Graph_View.md
- Plans/UI_Command_Catalog.md
- Plans/FileManager.md
```

ContractRef: ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/FileManager.md

### RGV-006 - Data Model Identity Modernization

```yaml
plan_unit_id: RGV-006
unit_type: requirement
status: accepted
owner_doc: Plans/Run_Graph_View.md
canonical_text: Run Graph data-source joins retarget away from tier_id and toward node_id, attempt_id, blocked episode, generation, lane, artifact, and provider platform identity. Field-name modernization is insufficient unless scope is also modernized to the runtime identities that own execution truth.
gui_related: false
gui_classification_reason: This unit defines runtime/data identity and join semantics rather than visual presentation.
depends_on: [RGV-001]
unblocks: [RGV-007, RGV-010]
acceptance_criteria:
- Usage, evidence, terminal, and output routing no longer rely on tier-keyed joins once attempts, blocked episodes, and graph generations are first-class.
- provider_entry, provider_family, requested_platform, and effective_platform map back to Orchestrator vocabulary.
- provider_family_id remains additive grouping metadata and never replaces concrete platform identity.
- effective_provider_identity, provider_identity, and effective_project_id are not used to encode actor role or side-effect target identity.
validation_surfaces:
- Manual data-model identity review.
- Cross-check against Contracts, Executor Protocol, storage, and usage docs.
- python3 scripts/pm-plan-index.py validate
risk_class: identity_model_drift
reasoning_tier: high
context_scope: run_graph_data_model
implementation_surfaces:
- Plans/Run_Graph_View.md
- Plans/Contracts_V0.md
- Plans/Executor_Protocol.md
- Plans/storage-plan.md
- Plans/usage-feature.md
node_compile_hint:
  mode: runtime_identity_requirement
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Run_Graph_View-S0006
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Run_Graph_View-S0010
- Plans/Run_Graph_View.md:33-34
- Plans/Run_Graph_View.md:40
- Plans/Run_Graph_View.md:78
- Plans/Run_Graph_View.md:87
- Plans/Run_Graph_View.md:125-127
preserved_exact_tokens:
- tier_id
- node_id
- attempt_id
- blocked-episode
- provider_entry
- provider_family
- requested_platform
- effective_platform
negative_constraints:
- Evidence, terminal, usage, and output routing must not remain tier-keyed once attempts, blocked episodes, and graph generations are first-class routing objects.
owner_hints:
- Plans/Run_Graph_View.md
- Plans/Contracts_V0.md
- Plans/Executor_Protocol.md
- Plans/storage-plan.md
```

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Executor_Protocol.md, ContractName:Plans/storage-plan.md

### RGV-007 - Tier-Era And HITL Compatibility Disposition

```yaml
plan_unit_id: RGV-007
unit_type: compatibility_disposition
status: accepted
owner_doc: Plans/Run_Graph_View.md
canonical_text: Tiers are demoted from primary Orchestrator tab/page authority in favor of Progress, Plan Compile, Seams, Node Graph, Evidence, History, and Ledger. Tier labels may survive only as derived presentation context or compatibility lineage. request_id and hitl_request_id are not durable graph action identity; blocked runtime approval identity, blocked_sequence, and allowed_action_ids-backed runtime actions own that role.
gui_related: true
gui_classification_reason: This disposition retires or constrains user-visible Tiers tab/page assumptions and graph layout vocabulary.
depends_on: [RGV-001, RGV-006]
unblocks: [RGV-010]
acceptance_criteria:
- GUI navigation demotes Tiers from primary Orchestrator tab/page authority.
- Plan Compile, Node Graph, Seams, Evidence, History, and Ledger use the rewrite tab model; Run Graph does not own Plan Compile scope.
- hitl_request_id and request_id remain compatibility lineage only where they appear.
- Graph command payloads use blocked/runtime approval identity and allowed_action_ids-backed runtime command targets.
validation_surfaces:
- Manual stale tier/HITL cleanup review.
- UI Command Catalog payload review.
- python3 scripts/pm-plan-index.py validate
risk_class: stale_tier_cleanup
reasoning_tier: standard
context_scope: compatibility_and_stale_disposition
implementation_surfaces:
- Plans/Run_Graph_View.md
- Plans/Orchestrator_Page.md
- Plans/UI_Command_Catalog.md
- Plans/Contracts_V0.md
node_compile_hint:
  mode: compatibility_disposition
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Run_Graph_View-S0006
- Plans/Run_Graph_View.md:28
- Plans/Run_Graph_View.md:41
- Plans/Run_Graph_View.md:47
- Plans/Run_Graph_View.md:49
- Plans/Run_Graph_View.md:55
- Plans/Run_Graph_View.md:57
- Plans/Run_Graph_View.md:66-67
- Plans/Run_Graph_View.md:73
- Plans/Run_Graph_View.md:86
- Plans/Run_Graph_View.md:89-90
- Plans/ledgers/v2/pldg-20260613-001-cleanup-fable-audit/records/design_atoms.jsonl:7
- Plans/ledgers/v2/pldg-20260613-001-cleanup-fable-audit/records/design_atoms.jsonl:9
- Plans/ledgers/v2/pldg-20260613-001-cleanup-fable-audit/records/decisions.jsonl:7
- Plans/ledgers/v2/pldg-20260613-001-cleanup-fable-audit/source_shards/section-a-conflicting-canon.md:10
- Plans/ledgers/v2/pldg-20260613-001-cleanup-fable-audit/source_shards/section-a-conflicting-canon.md:16
preserved_exact_tokens:
- Tiers
- Node Graph
- Progress/Seams/Node Graph/Evidence/History/Ledger
- hitl_request_id
- request_id
- blocked_sequence
- allowed_action_ids[]
- cmd.graph.approve_hitl/deny_hitl
- request_id vs blocked_sequence
- allowed_action_ids[] → cmd.runtime.*
negative_constraints:
- The graph view-model MUST NOT keep hitl_request_id as the durable action identity once the blocked/recovery model moves to blocked-episode identity.
- Graph and Orchestrator command payloads must not keep request_id as the primary action target.
compatibility_only_notes:
- Tier labels survive only as derived view context.
- Legacy HITL/request fields are compatibility lineage only.
stale_retired_dispositions:
- Tier-keyed usage/evidence correlation and legacy PuppetMasterEvent source tables are cleanup inputs, not active implementation targets.
owner_hints:
- Plans/Run_Graph_View.md
- Plans/Orchestrator_Page.md
- Plans/UI_Command_Catalog.md
- Plans/Contracts_V0.md
```

ContractRef: ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/Contracts_V0.md

### RGV-008 - Projection Trust, Concern Identity, And Action Gating

```yaml
plan_unit_id: RGV-008
unit_type: constraint
status: accepted
owner_doc: Plans/Run_Graph_View.md
canonical_text: Run Graph discloses stale or degraded projection trust before showing live claims, treats projection-trust failures and weak-integration findings as distinct concern categories, and gates actions that depend on current promotion, blocker, graph-generation, remote-side-effect truth, or cross-surface mutation payloads.
gui_related: false
gui_classification_reason: The unit primarily defines runtime trust, concern identity, and action-gating policy.
depends_on: [RGV-001, RGV-006]
unblocks: [RGV-010]
acceptance_criteria:
- Live-status tables consume canonical runtime records and projections first.
- Stale or degraded projection trust is disclosed before live claims or live action affordances.
- Concern merge, split, and supersession remain discussion-only until concern identity/routing rules become contract-level.
- Concerns have durable identity, lineage, source links, status, resolution_kind, and rationale fields rather than only badges or notes.
- Graph patch application that changes canonical graph generation is hard-gated or runtime-controlled.
- Mutating Run Graph commands carry projection-trust payloads and route through allowed_action_ids-backed runtime actions when blocked/recovery action identity is involved.
validation_surfaces:
- Projection trust/manual action-gating review.
- Concern schema owner review.
- python3 scripts/pm-plan-index.py validate
risk_class: projection_trust
reasoning_tier: high
context_scope: projection_trust_and_concerns
implementation_surfaces:
- Plans/Run_Graph_View.md
- Plans/Contracts_V0.md
- Plans/Executor_Protocol.md
- future concern identity contract
node_compile_hint:
  mode: trust_and_gate_constraint
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Run_Graph_View-S0003
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Run_Graph_View-S0006
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Run_Graph_View-S0009
- Plans/Run_Graph_View.md:36-37
- Plans/Run_Graph_View.md:42
- Plans/Run_Graph_View.md:53
- Plans/Run_Graph_View.md:62-64
- Plans/Run_Graph_View.md:77
- Plans/Run_Graph_View.md:83-85
- Plans/Run_Graph_View.md:93
- Plans/Run_Graph_View.md:121-123
- Plans/ledgers/v2/pldg-20260613-001-cleanup-fable-audit/records/design_atoms.jsonl:9
- Plans/ledgers/v2/pldg-20260613-001-cleanup-fable-audit/source_shards/section-a-conflicting-canon.md:16
preserved_exact_tokens:
- projection-trust
- projection-trust payload
- weak-integration
- hard_gate
- concern_id
- resolution_kind
- blocked_episode_refs
- allowed_action_ids[] → cmd.runtime.*
negative_constraints:
- Run Graph may link candidate concern operations but must not invent canonical merge authority.
owner_hints:
- Plans/Run_Graph_View.md
- Plans/Contracts_V0.md
- Plans/Executor_Protocol.md
owner_adjudication:
  candidate_owners: [Plans/Run_Graph_View.md, Plans/Contracts_V0.md, Plans/Executor_Protocol.md]
  evidence: Concern identity and graph projection trust are consumed by Run Graph, while event/runtime schema authority remains in Contracts and Executor owner docs.
```

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Executor_Protocol.md

### RGV-009 - Adjacent Owner Gaps And Non-Local Decisions

```yaml
plan_unit_id: RGV-009
unit_type: constraint
status: accepted
owner_doc: Plans/Run_Graph_View.md
canonical_text: Run Graph records adjacent owner gaps without claiming non-local authority. Durable account switch history is already owned through account_switch_event and account_pressure_episode, while role enums, provider account policy references, acceptance/evidence/coverage schema extensions, and runtime scheduler ordering belong to their owner docs before Run Graph consumes them.
gui_related: false
gui_classification_reason: This unit is owner-routing and schema-boundary metadata, not GUI implementation work.
depends_on: [RGV-001, RGV-006, RGV-008]
unblocks: [RGV-010]
acceptance_criteria:
- Multi-account switch history consumes account_switch_event and account_pressure_episode rather than the stale no-durable-family claim.
- Schema contradictions are tracked as active owner-doc gaps rather than solved locally in Run Graph.
- Concern, corroboration, promotion, graph-patch, lane, package, and account object families are preserved as node-relevant hints without becoming final WorkNodes.
validation_surfaces:
- Owner adjudication review.
- DRY Rules/ContractRef review.
- python3 scripts/pm-plan-index.py validate
risk_class: owner_adjudication
reasoning_tier: high
context_scope: cross_owner_routing
implementation_surfaces:
- Plans/Run_Graph_View.md
- Plans/Multi-Account.md
- Plans/Contracts_V0.md
- Plans/Executor_Protocol.md
- Plans/usage-feature.md
node_compile_hint:
  mode: owner_route_metadata
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Run_Graph_View-S0006
- Plans/Run_Graph_View.md:51
- Plans/Run_Graph_View.md:68
- Plans/Run_Graph_View.md:72
- Plans/Run_Graph_View.md:78
- Plans/Run_Graph_View.md:86-87
- Plans/Run_Graph_View.md:91-92
- Plans/ledgers/v2/pldg-20260613-001-cleanup-fable-audit/records/design_atoms.jsonl:9
- Plans/ledgers/v2/pldg-20260613-001-cleanup-fable-audit/records/design_atoms.jsonl:15
- Plans/ledgers/v2/pldg-20260613-001-cleanup-fable-audit/source_shards/section-a-conflicting-canon.md:16
- Plans/ledgers/v2/pldg-20260613-001-cleanup-fable-audit/source_shards/section-a-conflicting-canon.md:20
preserved_exact_tokens:
- account.switched
- account_switch_event
- Contracts_V0 now defines account_switch_event
- policy_hash
- actor_kind
- execution_role
- Schema-level contradictions are active, not hypothetical.
- lexicographic ordering
- scored ready-set
negative_constraints:
- Run Graph must not encode actor role or side-effect target identity into effective_provider_identity, provider_identity, or effective_project_id.
owner_hints:
- Plans/Run_Graph_View.md
- Plans/Multi-Account.md
- Plans/Contracts_V0.md
- Plans/Executor_Protocol.md
- Plans/usage-feature.md
owner_adjudication:
  candidate_owners: [Plans/Multi-Account.md, Plans/Contracts_V0.md, Plans/Executor_Protocol.md, Plans/usage-feature.md, Plans/Run_Graph_View.md]
  evidence: The source spans explicitly name missing account, role, schema, usage, and runtime scheduler authority that Run Graph can consume only after owner-doc repair.
```

ContractRef: ContractName:Plans/Multi-Account.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/Executor_Protocol.md

### RGV-010 - Run Graph Validation And Coverage

```yaml
plan_unit_id: RGV-010
unit_type: validation_rule
status: accepted
owner_doc: Plans/Run_Graph_View.md
canonical_text: Run Graph validation checks payload fidelity, owner routing, missing context, projection trust disclosure, stale tier cleanup, focused-run coherence, and command-catalog alignment. Phase 2A coverage keeps original spans mapped without creating WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks.
gui_related: false
gui_classification_reason: This unit defines validation and migration proof rules rather than GUI implementation work.
depends_on: [RGV-002, RGV-003, RGV-004, RGV-005, RGV-006, RGV-007, RGV-008, RGV-009]
unblocks: []
acceptance_criteria:
- Route/open checks verify payload fidelity, owner routing, and missing context.
- Focused-run, historical-mode, and cross-tab coherence are validation targets.
- Projection trust and live-action affordances disclose stale/degraded state before claiming live truth.
- Phase 2A coverage artifacts map every pre-edit Run Graph span to fine-grained PlanUnits, preserved source, or explicit disposition.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py generate
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-plans-verify.py run-gates
risk_class: validation_coverage
reasoning_tier: standard
context_scope: migration_and_run_graph_validation
implementation_surfaces:
- Plans/Run_Graph_View.md
- Plans/.plan_migration/pds-20260611-002-atomize-planunits
- Plans/.plan_index
node_compile_hint:
  mode: validation_metadata
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Run_Graph_View-S0006
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Run_Graph_View-S0011
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Run_Graph_View-S0012
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Run_Graph_View-S0013
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Run_Graph_View-S0014
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Run_Graph_View-S0015
- Plans/Run_Graph_View.md:43
- Plans/Run_Graph_View.md:130-139
- Plans/Run_Graph_View.md:141-253
preserved_exact_tokens:
- Route/open auditing
- Acceptance carry-through
- Owner / Consumer Map
- Migration Coverage
negative_constraints:
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this phase.
owner_hints:
- Plans/Run_Graph_View.md
- Plans/Plan_Document_System.md
- Plans/Bootstrap_Planning_Migration.md
```

ContractRef: ContractName:Plans/Plan_Document_System.md, ContractName:Plans/Bootstrap_Planning_Migration.md

## Migration Coverage

Original hash: `ae46a77348397a81370e97493b38f8997311c540607466ad3571d87c62785bef`.

Run-scoped proof artifacts:
- Phase 1 source-preserving bridge: `Plans/.plan_migration/pds-20260611-001-standardize-plans/original_hashes.json`
- Phase 1 source-preserving bridge: `Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl`
- Phase 1 source-preserving bridge: `Plans/.plan_migration/pds-20260611-001-standardize-plans/coverage_map.jsonl`
- Phase 2A atomization: `Plans/.plan_migration/pds-20260611-002-atomize-planunits/original_hashes.json`
- Phase 2A atomization: `Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl`
- Phase 2A atomization: `Plans/.plan_migration/pds-20260611-002-atomize-planunits/coverage_map.jsonl`
- Phase 2A atomization: `Plans/.plan_migration/pds-20260611-002-atomize-planunits/anchor_aliases.json`

Phase 1 original spans from `Run_Graph_View-S0001` through `Run_Graph_View-S0011` remain preserved by `pds-20260611-001-standardize-plans`. Phase 2A pre-edit spans from `Run_Graph_View-S0001` through `Run_Graph_View-S0015`, including the former coarse source-preserving bridge PlanUnit, are preserved by `pds-20260611-002-atomize-planunits` and mapped in that run's coverage map to fine-grained PlanUnits, preserved source sections, or explicit replacement disposition. This batch did not update Spec Lock, generated shards, evidence bundles, auto_decisions, or plan_graph, and it did not create WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks.

## Ledger Compile Addendum - pldg-20260614-002

### RGV-011 - Historical Run Focus Mode Persistence

```yaml
plan_unit_id: RGV-011
unit_type: requirement
status: accepted
owner_doc: Plans/Run_Graph_View.md
canonical_text: >-
  Selecting a historical run puts Run Graph into explicit `historical_run` focus mode rather than
  reusing live-run mode implicitly. Focus state persists as `orchestrator.project_state.{project_id}`
  with focused_run_ref, mode, selected node/attempt refs, run_id, run snapshot/version, project/run
  identity, route object, live-vs-historical indicator, trust/freshness disclosure, allowed actions,
  read-only replay/inspection boundary, comparison target, restore/return-to-live path,
  restore/back-stack metadata, and stale-data warning semantics. Historical mode blocks live mutation
  actions unless an explicit route/action revalidates against current runtime state.
gui_related: true
gui_classification_reason: Historical run focus mode, available actions, and restore behavior are user-visible Run Graph page behavior.
depends_on: [RGV-002, RGV-010, CV-283]
unblocks: []
acceptance_criteria:
  - Historical run selection creates explicit `historical_run` mode with focused_run_ref persistence.
  - Historical focus discloses run snapshot/version, live-vs-historical indicator, comparison target, stale-data warnings, and trust/freshness.
  - Restore/back-stack behavior uses the shared route object and project state key.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260614-002-part-3-fable-cleanup
risk_class: historical_run_mode_ambiguity
reasoning_tier: high
context_scope: run_graph_historical_focus_mode
implementation_surfaces: [Plans/Run_Graph_View.md, Plans/FinalGUISpec.md, Plans/orchestrator-subagent-integration.md, Plans/Orchestrator_Page.md, Plans/storage-plan.md]
node_compile_hint: {mode: run_graph_historical_focus_mode, create_worknodes: false}
source_lineage:
  - pldg-20260614-002-part-3-fable-cleanup:atom-0094
  - pldg-20260614-002-part-3-fable-cleanup:atom-0095
preserved_exact_tokens: ["Orchestrator Historical Run Mode", "Run_Graph_View.md:75-76", "orchestrator.project_state.{project_id}", "focused_run_ref", "historical_run", "run_id", "run snapshot/version", "live-vs-historical indicator", "allowed actions", "read-only replay/inspection boundary", "comparison target", "restore/return-to-live path", "stale-data warning semantics", "historical-run UI/state", "historical selection display", "restore/return-to-live controls", "stale-data warning presentation"]
negative_constraints:
  - Do not treat a selected historical run as the live current run.
  - Do not enable live mutation actions from historical focus without revalidation.
  - Do not hide stale-data warnings or restore/return-to-live controls outside the persisted focus-mode model.
owner_hints: [Plans/Run_Graph_View.md, Plans/FinalGUISpec.md, Plans/orchestrator-subagent-integration.md, Plans/Orchestrator_Page.md, Plans/storage-plan.md]
```

## Ledger Compile Addendum - pldg-20260616-002

### RGV-012 - Orchestrator WorkGraph And Verification Overlays

```yaml
plan_unit_id: RGV-012
unit_type: requirement
status: accepted
owner_doc: Plans/Run_Graph_View.md
canonical_text: >-
  Run Graph must display GoalRun WorkGraph structure, WorkNode status, SubagentWave membership, VerificationCycle overlays, repair/retry markers, blocked/replan-required states, receipt refs, and evidence refs. For Plan/PlanUnit-originated graph preparation, the Node Graph and Run Graph views may show readiness, blockers, gui_related, receipt status, and compiler contract state only as projections. The view remains a projection over Goal Runtime, Executor, Contracts, storage, Plan_Document_System, and Plan_To_Node_Compilation records; it must not decide WorkNode readiness, capacity, compiler artifact creation, or completion authority.
gui_related: true
gui_classification_reason: WorkGraph nodes, verification overlays, repair markers, and evidence refs are visible Run Graph UI.
depends_on:
  - RGV-011
  - OP-022
  - GRS-026
  - GRS-027
  - CV-288
  - SP-215
  - PDS-006
  - PNC-009
unblocks: []
acceptance_criteria:
  - Run Graph can render GoalRun WorkGraph, WorkNode status, SubagentWave membership, and VerificationCycle overlays.
  - Repair/retry, blocked, and replan-required states are visible in the graph view.
  - Receipt and evidence refs are drillable through owner projections.
  - Plan/PlanUnit graph-preparation overlays show readiness, blockers, gui_related, receipt status, and compiler contract state without creating executable artifacts.
  - The view does not replace Executor readiness, capacity, dispatch, or Goal Runtime completion authority.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - future Run Graph GoalRun overlay review
risk_class: run_graph_runtime_projection_drift
reasoning_tier: high
context_scope: goalrun_workgraph_view
implementation_surfaces:
  - Plans/Run_Graph_View.md
  - Plans/Orchestrator_Page.md
  - Plans/Goal_Runtime_System.md
  - Plans/Executor_Protocol.md
  - Plans/Contracts_V0.md
  - Plans/storage-plan.md
  - Plans/Plan_Document_System.md
  - Plans/Plan_To_Node_Compilation.md
node_compile_hint:
  mode: goalrun_workgraph_overlay
  create_worknodes: false
source_lineage:
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0016
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0056
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0058
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0070
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0074
  - pldg-20260616-002-orchestrator-goal-runtime-flow:atom-0077
preserved_exact_tokens:
  - "WorkGraph"
  - "WorkNode"
  - "SubagentWave"
  - "VerificationCycle"
  - "repair"
  - "retry"
  - "blocked"
  - "replan-required"
  - "PlanUnit"
  - "Node Graph"
  - "Run Graph"
  - "readiness"
  - "blockers"
  - "gui_related"
  - "receipt status"
  - "compiler contract"
negative_constraints:
  - Do not let Run Graph decide dispatch or completion authority.
  - Do not hide failed verification cycles or repair markers.
owner_hints:
  - Plans/Run_Graph_View.md
  - Plans/Orchestrator_Page.md
  - Plans/Goal_Runtime_System.md
  - Plans/Executor_Protocol.md
  - Plans/Contracts_V0.md
  - Plans/storage-plan.md
  - Plans/Plan_Document_System.md
  - Plans/Plan_To_Node_Compilation.md
```

## Ledger Compile Addendum - pldg-20260617-001-plans-to-code-handoff

### RGV-013 - Plans-To-Code Execution Progress Projection

```yaml
plan_unit_id: RGV-013
unit_type: requirement
status: accepted
owner_doc: Plans/Run_Graph_View.md
canonical_text: >-
  Run Graph consumes plans-to-code execution progress after Executor intake by projecting queued WorkNodes, active WorkNodes, blocked WorkNodes, completed WorkNodes, dependency edges, model lanes, worktrees, safe points, test runs, browser/device sessions, repair loops, Auditor status, GitHub PR/Actions when configured, receipt refs, and final certification progress. The Run Graph remains an execution projection and does not own Plan Compile tab progress, PlanCompile state, Executor dispatch authority, or GoalCompletionReceipt certification authority.
  Run Graph shows Executor execution progress only after intake and does not replace Plan Compile tab scope.
gui_related: true
gui_classification_reason: Execution graph nodes, model lanes, worktrees, safe points, tests, repairs, GitHub status, and certification progress are visible graph UI.
depends_on: [RGV-012, OP-024, EP-103, GRS-030, RAP-029]
unblocks: []
acceptance_criteria:
  - Run Graph projects WorkNode execution progress after Executor intake.
  - It shows source-control, test, repair, Auditor, GitHub, receipt, and certification progress where records exist.
  - It does not replace Plan Compile tab or runtime/certification authority.
validation_surfaces:
  - python3 scripts/pm-plans-verify.py run-gates
  - future Run Graph plans-to-code execution projection review
risk_class: execution_projection_authority_drift
reasoning_tier: standard
context_scope: plans_to_code_run_graph
implementation_surfaces: [Plans/Run_Graph_View.md, Plans/Orchestrator_Page.md, Plans/Executor_Protocol.md, Plans/Runtime_Artifacts_Panel.md]
node_compile_hint: {mode: plans_to_code_execution_projection, create_worknodes: false}
source_lineage:
  - pldg-20260617-001-plans-to-code-handoff:atom-0052
  - pldg-20260617-001-plans-to-code-handoff:atom-0053
  - pldg-20260617-001-plans-to-code-handoff:dec-0022
  - pldg-20260617-001-plans-to-code-handoff:corr-0007
preserved_exact_tokens:
  - "queued WorkNodes"
  - "active WorkNodes"
  - "worktrees"
  - "safe points"
  - "test runs"
  - "repair loops"
  - "final certification"
negative_constraints:
  - Do not let Run Graph own PlanCompile state, Executor dispatch, or completion certification.
owner_hints:
  - Plans/Run_Graph_View.md
  - Plans/Orchestrator_Page.md
  - Plans/Executor_Protocol.md
  - Plans/Runtime_Artifacts_Panel.md
```

ContractRef: ContractName:Plans/Run_Graph_View.md, ContractName:Plans/Orchestrator_Page.md, ContractName:Plans/Executor_Protocol.md, ContractName:Plans/Runtime_Artifacts_Panel.md
