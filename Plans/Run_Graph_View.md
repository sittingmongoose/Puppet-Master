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
- Run Graph still has concrete command/routing contract drift: - `cmd.graph.approve_hitl` / `deny_hitl` arguments do not match `UI_Command_Catalog.md` (`request_id` mismatch) - graph-local recovery IDs still conflict with the canonical `allowed_action_ids[] -> cmd.runtime.*` model - cross-surface open commands are required in prose but not bound in the Run Graph command section - no projection-trust payload exists for mutating or cross-surface actions on stale/degraded graph projections
- Node Graph tab direction was extended beyond lineage: - graph canvas + right-side detail inspector - detail inspector should expose: - requested/effective provider/model/effort/persona/account - usage/token/cost info - worker policy (agent/subagent, fresh/reused, spawn path) - retry/review/promotion state - lane/worktree/snapshot state - linked evidence/artifacts - clicking evidence/artifact links in graph detail should deep-link into the Evidence tab with target selection/filter applied
- `Plans/Run_Graph_View.md` is still strongly tier-era in its core surface contract: - worker activity requires `PuppetMasterEvent::Output` filtered by `tier_id` - verifier activity is scoped to node `tier_id` - `View in Usage` still filters by `tier_id` - base data model still includes: - `worker_provider` - `worker_model` - `verifier_provider` - `verifier_model` - `hitl_request_id` - graph interactions still include: - `Open that tier in the Tiers tab` - `View in Tiers` - `Copy tier_id` - lower addenda are more aligned: - `scheduler_lane` - `allowed_action_ids[]` - `blocked_sequence` - historical lineage preservation
- Node Graph tab direction now includes: - graph canvas + right-side detail inspector - node click should expose: - requested/effective provider/model/effort/persona/account - usage/token/cost info - worker policy - retry/review/promotion state - lane/worktree/snapshot state - linked evidence/artifacts - clicking evidence/artifact links from node detail should navigate to the Evidence tab with the relevant evidence/artifact selected
- Multi-account history and role scoping remain structurally under-modeled: - `Multi-Account.md` still has no durable `account.switched` / switch-episode family - `provider_accounts.run_snapshot` still stores only an opaque `policy_hash` rather than a queryable policy version/ref - no canonical role enum or `actor_kind` / `execution_role` field exists to support role-by-provider and role-by-account overrides consistently across docs
- Default Progress-widget drill targets were made deterministic: - Run Status -> `History` - Current Activity -> `Node Graph` - Attention / Blockers -> `Node Graph` - Seam Health -> `Seams` - Package Activity -> `Seams` - Promotion Queue -> `Ledger` - Worktree Lanes -> `Node Graph` - Account / Usage Pressure -> `Usage` - Recent Major Events -> `History` - Overseer Activity -> `Seams` - Corroboration Queue -> `Evidence` - Recovery State -> `Evidence` - Throughput / Capacity -> `History`
- Likely good surface behavior: - `Progress`: show run-level trust banner or chip when projections are stale/degraded - `Seams`: allow browsing, but gate actions that depend on current promotion/blocker truth - `Node Graph`: keep historical graph and current selections visible, but flag when live node state may be stale - `Evidence`: artifact browsing can remain available; live verdict/action affordances may gate - `History` / `Ledger`: usually the fallback-safe surfaces because they are closest to canonical records
- `Plans/Orchestrator_Page.md` / `Plans/FinalGUISpec.md` - The rerun sharpened several misses that were previously grouped too broadly: - explicit `focus_mode = live | historical` - `orchestrator.project_state.{project_id}` persistence record - page-wide shared `focused_run_id` coherence across tabs - historical Progress behavior - default search scope = focused run, widening to project/all-runs, and required disclosure when search changes focused run - global-vs-local Orchestrator search distinction - explicit fallback hierarchy to History/Ledger under projection degradation
- Current GUI/orchestrator documentation remains oriented around the older surface model: - `Plans/Orchestrator_Page.md` still defines tabs `Progress`, `Tiers`, `Node Graph Display`, `Evidence`, `History`, `Ledger` - `Plans/Orchestrator_Page.md` still explicitly says runs and tier checks are driven by the `Overseer` - `Plans/Run_Graph_View.md` describes the graph as live DAG execution, but node rendering still includes tier-type iconography and tier-oriented vocabulary - `Plans/FinalGUISpec.md` still references `phase/task/subtask` progress and mapping editors rather than package/seam governance surfaces
- Cross-tab navigation is now treated as a real contract: - object/event focus should deep-link across Progress / Seams / Node Graph / Evidence / History / Ledger - deep links should carry selection/filter/focus context, not merely switch tabs - `Seams` and `Node Graph` should share focus context without hyperactive live-sync
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
- **Schema-level contradictions are active, not hypothetical.** - Graph schemas still hard-code lexicographic node ordering while runtime addenda describe scored scheduler tuples. - Base provider envelope/spec tables omit node/attempt/safe-point fields that later addenda require. - Acceptance/evidence/coverage schemas cannot yet express work-package/seam/promotion/account/lane identity cleanly.
- Recommended explicit mode: - `Historical Run Mode` - Required behavior: - all tabs clearly show the focused historical `run_id` - the page displays a persistent banner/chip that the user is viewing historical data - controls that only make sense for the active run are disabled or removed - actions route against the focused run only when they are historical-safe
- Candidate fields: - `focused_run_id?` - `focus_mode` - `last_live_run_id?` - `selected_tab` - per-tab view state refs - maybe `auto_return_to_live = false` by default
- Likely good direction: - in historical mode, `Progress` becomes a historical run summary surface - live-only widgets either: - switch to historical-summary rendering - or show disabled/live-unavailable state with explanation
- Add a canonical role enumeration and apply it consistently to role-scoped account policies, Persona resolution, permission scoping, and provider dispatch.
- Replace stale `Tiers` tab/page assumptions with the rewrite tab model: - `Progress` - `Seams` - `Node Graph` - `Evidence` - `History` - `Ledger`
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
- Run graph and Orchestrator page docs remain structurally tier-bound: - `Run_Graph_View.md` has near-zero awareness of concern/corroboration/promotion/graph-patch/lane/package object families - `Orchestrator_Page.md` still specifies `Tiers` and widget/persistence contracts around that obsolete structure
- `effective_provider_identity` / `provider_identity` / `effective_project_id` are already treated as optional non-secret disclosure fields. That makes them the wrong place to encode actor role or side-effect target identity.
- `page_tab` - examples: Orchestrator tabs like Progress, Seams/Tiers, Node Graph, Evidence, History, Ledger
- **Tiers-first UI is now misleading.** The Tiers tab, `widget.tier_tree`, phase-grouped graph layouts, and single-current-task widgets all assume execution authority still lives in the tier hierarchy instead of the node/package/seam graph.
- **Tiers are still productized even where node graph is supposed to be canonical.** GPT-5.4 repeatedly found `Tiers` as a primary tab, navigation target, widget namespace, and telemetry dimension.
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
- The Run Graph and Orchestrator lineage view carries concise requested-vs-effective SCM state for mutation-capable attempts, including repo/worktree/branch `/head`, `/branches/commit`, safe-point relation, and partial receipt availability. `Tiers`, `Node Graph`, `History`, `Evidence`, and `Ledger` all show enough SCM identity to distinguish runs by worktree, branch, commit range, and receipt lineage; the `Ledger` may stay usage-focused only when a parallel receipt/lineage surface is available.

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

### RGV-001 - Run Graph View (Node Graph Display) -- Specification Source-Preserving PlanUnit

```yaml
plan_unit_id: RGV-001
unit_type: requirement
status: accepted
owner_doc: Plans/Run_Graph_View.md
canonical_text: Plans/Run_Graph_View.md keeps its pre-migration canonical source content losslessly in place while exposing a source-preserving PlanUnit for Plan Document System indexing. Fine-grained requirement splitting may occur in a later controlled batch using the recorded span_map and coverage_map.
gui_related: true
gui_classification_reason: The preserved source spans include GUI/UI/user-visible presentation or interactive control requirements.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- Original source spans remain available for exact-text audit.
- Every original span for this doc has one coverage_map disposition.
- ContractRefs, anchors or aliases, negative constraints, compatibility-only notes, stale/retired dispositions, owner/consumer boundaries, and source lineage are preserved by span_map and coverage_map.
- No WorkNodes, NodeSeeds, or executable build tasks are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-001-standardize-plans
- python3 scripts/pm-plans-verify.py run-gates
- python3 scripts/pm-shard-plans.py --check
risk_class: source_preservation
reasoning_tier: standard
context_scope: single_plan_doc
implementation_surfaces:
- Plans/Run_Graph_View.md
node_compile_hint:
  mode: source_preserving_planunit
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Run_Graph_View-S0001
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Run_Graph_View-S0002
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Run_Graph_View-S0003
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Run_Graph_View-S0004
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Run_Graph_View-S0005
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Run_Graph_View-S0006
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Run_Graph_View-S0007
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Run_Graph_View-S0008
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Run_Graph_View-S0009
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Run_Graph_View-S0010
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Run_Graph_View-S0011
preserved_exact_tokens:
- Run Graph View (Node Graph Display) -- Specification
- Canonical owner-section requirements
- Concern linkage to adjacent families
- Focused run and historical routing contract
- 1. Scope and canonical role
- 'ContractRef: ContractName:Plans/Executor_Protocol.md, ContractName:Plans/Orchestrator_Page.md, ContractName:Plans/storage-plan.md'
- P5 run-graph focus and identity recovery requirements
- 2. Layout
- 'ContractRef: ContractName:Plans/Decision_Policy.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Contracts_V0.md'
- 3. Node detail inspector
- 'ContractRef: ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/FileManager.md'
- Acceptance carry-through
- 4. Data model and identity
negative_constraints:
- '- One shared `/deep-link` routing payload preserves target context for search results, command-palette results, widget `drill-downs`, recovery links, and cross-surface pivots; search and command-palette navigation must not restore a watered-down approximation.'
- '- Evidence, terminal, usage, and output routing must not remain `tier-keyed` once attempts, blocked episodes, and graph generations are first-class routing objects.'
- '- Concern merge, `/split/supersession`, and supersession logic remain `discussion-only` until the concern identity/routing rules become `contract-level`; Run Graph may link candidate concern operations but must not invent canonical merge authority.'
- '- The graph `view-model` MUST NOT keep `hitl_request_id` as the durable action identity once the blocked/recovery model moves to `blocked-episode` identity; any legacy HITL field is compatibility lineage only.'
compatibility_only_notes:
- '- The graph `view-model` MUST NOT keep `hitl_request_id` as the durable action identity once the blocked/recovery model moves to `blocked-episode` identity; any legacy HITL field is compatibility lineage only.'
- '- stale consumer cleanup - graph and Orchestrator command payloads - active-tier widgets and tier-targeted terminals - tier-keyed usage/evidence correlation - legacy `PuppetMasterEvent::*` source tables'
- '- Remove `request_id` as the primary action target from graph command payloads. - Replace `hitl_request_id` in graph data requirements with blocked/runtime approval identity or explicit compatibility lineage-only fields.'
- '- `Run_Graph_View` treats `by-phase` grouping as a compatibility layout only; canonical layouts include package-group swimlanes, seam boundaries, and parallel lane visualization so work packages and dependencies remain visible without collapsing into phase order.'
stale_retired_dispositions:
- '- `live-status` source tables in Run Graph and Orchestrator consume canonical runtime records and `/projections` first, then disclose stale/degraded projection trust before showing live claims.'
- '- Run Graph still has concrete command/routing contract drift: - `cmd.graph.approve_hitl` / `deny_hitl` arguments do not match `UI_Command_Catalog.md` (`request_id` mismatch) - graph-local recovery IDs still conflict with the canonical `allowed_action_ids[] -> cmd.runtime.*` model - cross-surface op'
- '- Likely good surface behavior: - `Progress`: show run-level trust banner or chip when projections are stale/degraded - `Seams`: allow browsing, but gate actions that depend on current promotion/blocker truth - `Node Graph`: keep historical graph and current selections visible, but flag when live no'
- '- `Node Graph` - focused inspection may survive mild staleness - live status claims, blocked action buttons, and generation overlays should disclose trust state explicitly'
- '- stale consumer cleanup - graph and Orchestrator command payloads - active-tier widgets and tier-targeted terminals - tier-keyed usage/evidence correlation - legacy `PuppetMasterEvent::*` source tables'
- '- Replace stale `Tiers` tab/page assumptions with the rewrite tab model: - `Progress` - `Seams` - `Node Graph` - `Evidence` - `History` - `Ledger`'
owner_boundary_notes:
- '## Canonical owner-section requirements'
- These requirements are canonical live specification text for this owner document and preserve the required product, runtime, storage, UI, and governance details in owner-section form.
- '## 1. Scope and canonical role'
- Run Graph is the canonical graph/lineage inspection surface for orchestrated execution.
- '- Concern merge, `/split/supersession`, and supersession logic remain `discussion-only` until the concern identity/routing rules become `contract-level`; Run Graph may link candidate concern operations but must not invent canonical merge authority.'
- '- `field-name` modernization is insufficient without canonical scope modernization: renamed graph fields must also retarget to run, node, attempt, blocked-episode, generation, lane, and artifact identity scopes.'
- '- `live-status` source tables in Run Graph and Orchestrator consume canonical runtime records and `/projections` first, then disclose stale/degraded projection trust before showing live claims.'
- '- Route/open auditing stays focused on refinement omissions, not `re-claiming` absence of primitives that already landed; `/open` checks verify payload fidelity, owner routing, and missing context only.'
- '- Run Graph still has concrete command/routing contract drift: - `cmd.graph.approve_hitl` / `deny_hitl` arguments do not match `UI_Command_Catalog.md` (`request_id` mismatch) - graph-local recovery IDs still conflict with the canonical `allowed_action_ids[] -> cmd.runtime.*` model - cross-surface op'
- '- Multi-account history and role scoping remain structurally under-modeled: - `Multi-Account.md` still has no durable `account.switched` / switch-episode family - `provider_accounts.run_snapshot` still stores only an opaque `policy_hash` rather than a queryable policy version/ref - no canonical role'
- '- Likely good surface behavior: - `Progress`: show run-level trust banner or chip when projections are stale/degraded - `Seams`: allow browsing, but gate actions that depend on current promotion/blocker truth - `Node Graph`: keep historical graph and current selections visible, but flag when live no'
- '- `hard_gate` - approve/reject HITL boundaries - graph patch application when it changes canonical graph generation - remote-side-effect actions with explicit non-bypassable policy - any approval path whose allowed actions are defined by runtime blocked/HITL contracts rather than generic UI choice'
- '- But wizard/attention flows already use exact deep links via `resume_url`, and Usage/artifact surfaces already imply identity-native jumps using `usage_event_ref` and related canonical refs.'
- '- stale consumer cleanup - graph and Orchestrator command payloads - active-tier widgets and tier-targeted terminals - tier-keyed usage/evidence correlation - legacy `PuppetMasterEvent::*` source tables'
- '- Add a canonical role enumeration and apply it consistently to role-scoped account policies, Persona resolution, permission scoping, and provider dispatch.'
- '- Add `resolution_kind` and rationale requirements for dismiss/resolve paths. - Define how nominated findings become canonical concerns.'
- '- **Tiers are still productized even where node graph is supposed to be canonical.** GPT-5.4 repeatedly found `Tiers` as a primary tab, navigation target, widget namespace, and telemetry dimension.'
- '- graph patch - request patch may be `strong` - apply accepted patch should likely be `hard_gate` or runtime-controlled strong action because it changes canonical graph generation'
- '- `Run_Graph_View` treats `by-phase` grouping as a compatibility layout only; canonical layouts include package-group swimlanes, seam boundaries, and parallel lane visualization so work packages and dependencies remain visible without collapsing into phase order.'
- 'SCM recovery and lineage actions in graph/node detail use exact command-catalog pivots: `cmd.orchestrator.open_receipt`, `cmd.orchestrator.compare_run_output`, `cmd.orchestrator.open_source_control`, `cmd.orchestrator.open_github_actions`, `cmd.orchestrator.open_docker_manager`, `cmd.orchestrator.op'
- '- Source Control `Graph` integration is a consumer projection of Source Control graph state, not a separate graph authority. When a run commit belongs to a known worktree or receipt, Run Graph links to Source Control graph focus; when graph parsing fails, it degrades to branch/history pivots with an'
owner_hints:
- Plans/Run_Graph_View.md
split_recommendation_reason: The doc-level source-preserving unit covers both GUI-related and non-GUI spans; future fine-grained PlanUnits should split those surfaces when safe.
```

## Migration Coverage

Original hash: `ae46a77348397a81370e97493b38f8997311c540607466ad3571d87c62785bef`.

Run-scoped proof artifacts:
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/original_hashes.json`
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl`
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/coverage_map.jsonl`
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/anchor_aliases.json`

All original spans from `Run_Graph_View-S0001` through `Run_Graph_View-S0011` are preserved in place and mapped in `coverage_map.jsonl` to `RGV-001`. This batch did not update Spec Lock, generated shards, evidence bundles, auto_decisions, or plan_graph, and it did not create WorkNodes, NodeSeeds, or executable build tasks.
