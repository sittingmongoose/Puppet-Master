# Widget System -- Cross-Cutting Specification

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum
  - Highest-Impact Docs
  - GUI / UX Impacts
  - Cleanup Priorities

#### Source target target-0533
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
  - Highest-Impact Docs
  - GUI / UX Impacts
  - Cleanup Priorities
- Exact required items represented:
  - Replace tier-rooted execution with package/seam/lane model
  - Define package overseer + seam overseer roles
  - Add node/package/seam/lane/attempt/effective_identity fields to contracts and storage
  - Redefine gates to package-complete / seam-complete
  - Rename or retire Tiers UI/tab and tier_tree/progress bars
  - Replace Tiers-first navigation
  - Define Dashboard→Orchestrator→thread routing contract
  - Add package/seam/lane visualization widgets
  - Define which overseer's thread opens on click
  - Make worktree/lane state visible and navigable
  - Replace or demote [retired-token-13] widgets and layouts.
  - Add package/seam/lane-aware identity, worktree, and attention surfaces.
  - Define Dashboard → Orchestrator → chat-thread routing using canonical runtime objects rather than [retired-token-17].
  - `Plans/[retired-token-18]`
  - Plans/[retired-token-18]
  - `Plans/Orchestrator_Page.md`, `Plans/Run_Graph_View.md`, `Plans/[retired-token-18]`, `Plans/GUI_Rebuild_Requirements_Checklist.md`
  - Plans/Orchestrator_Page.md
  - Plans/Run_Graph_View.md
  - Plans/GUI_Rebuild_Requirements_Checklist.md
  - `Orchestrator_Page.md` still keeps `Tiers` and multi-tab widget composition
  - Orchestrator_Page.md
  - Tiers
  - `Plans/[retired-token-18]` is still heavily aligned to the older orchestrator model:
  - `[retired-token-6]` is still canonical for `Orch/Tiers`
  - [retired-token-6]
  - Orch/Tiers
  - `widget.[retired-token-12]`, `widget.completed_prose`, and `widget.agent_terminal` all read as tier/task/subtask oriented
  - widget.[retired-token-12]
  - widget.completed_prose
  - widget.agent_terminal
  - those non-Progress tabs may internally use reusable view components, but they should not expose general add/remove/move/resize widget behavior
  - This matters because the widget layer should not have to relearn seam/package/node/lane semantics independently.
  - distinguish `page/tab filters` from `widget presentation config`
  - page/tab filters
  - widget presentation config
  - `Plans/[retired-token-18]` currently defines layout keys for multiple Orchestrator tabs.
  - widgets should consume compact projections, not live-scan huge record sets per widget
  - `[retired-token-18]` implies broader widget portability
  - [retired-token-18]
  - `Orchestrator_Page.md` still treats multiple tabs as widget containers
  - Sonnet reinforces that historical-run rendering, idle widget rendering, and degraded projection gating are still missing from the surface-level specs rather than only from storage docs
  - The current widget contract mixes three different things that now need to stay separate:
  - `widget config`: presentation settings and safe subfilters only
  - widget config
  - widget actions should route through the same command/deep-link payload model as search, inspectors, and palette actions
  - Usage and widget surfaces are still incomplete for requested-vs-effective and trust semantics:
  - `Plans/usage-feature.md` + `Plans/[retired-token-18]`
  - Plans/usage-feature.md
  - `[retired-token-18]` still splits terminal widgets between `widget.terminal_output` and `widget.agent_terminal`
  - widget.terminal_output
  - widget layouts still need project-scoped keys rather than implicit global layouts for project-heavy surfaces
  - Live widget and page contracts still need attempt-/lane-/session-aware attribution rather than tier-only routing:
  - Normalize terminal widget IDs/hostability and explicitly decide how Orchestrator-owned worktree state is grouped in Source Control.
  - `widget.multi_account` still binds to `settings/multi_account.*` instead of the canonical `provider_accounts.*` storage family
  - widget.multi_account
  - settings/multi_account.*
  - provider_accounts.*
  - Widget multi-account data sourcing still points at pre-rewrite namespaces.
  - Rebind widget multi-account/account-pressure contracts to canonical `provider_accounts.*` projections and require trust/scope inheritance from the host surface.
  - `cmd.widget.*` still uses a generic `page: string`, which now conflicts with the move toward stronger native-surface vocabulary and typed routing.
  - cmd.widget.*
  - page: string
  - The key remaining question is breadth: how many authored `Plans/*.md` docs are still only Gemini or otherwise below full requested model coverage.
  - Plans/*.md
  - widget layout slot positions
  - widget layout
  - `tier`, `[retired-token-4]`, raw widget ids, panel ids, and serialization tokens do not belong in `object_kind`.
  - tier
  - [retired-token-4]
  - object_kind
  - If reconciliation starts from surface docs first instead of owner docs, drift will reappear immediately because the route vocabulary is now cross-cutting rather than page-local.
  - `FinalGUISpec.md` is still a major drift amplifier because it combines shell, page taxonomy, widget, and deep-link language in one doc.
  - FinalGUISpec.md
  - `widget.[retired-token-12]` = active tier title/objective/platform/model
  - `[retired-token-7]` = [retired-token-8] completion bars
  - [retired-token-7]
  - `widget.agent_terminal` = current worker output
  - `widget.completed_prose` = completed tier summaries
  - `widget.completed_prose` is also still described as completed tier summaries even though evidence and summary records are moving toward stronger object-backed surfaces.
  - `Plans/[retired-token-18]` is still carrying a broad pre-rewrite Orchestrator widget model.
  - `widget.[retired-token-12]` = active tier title/objective/elapsed
  - `widget.cta_stack` sourced from `PuppetMasterEvent::UserInteractionRequired`
  - widget.cta_stack
  - PuppetMasterEvent::UserInteractionRequired
  - `widget.agent_terminal` filtered by `[retired-token-4]`
  - `widget.completed_prose` = finished phases/tasks
  - `[retired-token-6]` hosted on `Orch/Tiers`
  - The widget data contract section is also still sourced from:
  - The widget layout migration contract now has an exact persistence-rule contradiction.
  - `Plans/[retired-token-18]` says in section 7.3:
  - widget layout takes precedence
  - Because `[retired-token-18]` claims SSOT precedence for widget layout key handling, this contradiction is more than editorial drift.
  - It sits in a cross-cutting SSOT and should be cleaned up during the same widget reconciliation tranche.
  - Coverage has been re-audited after the merge: `39` top-level `Plans/*.md` docs are full six-pass complete and the remaining `22` docs are now uniformly at five passes.
  - 39
  - 22
  - After this merge, the authored top-level `Plans/*.md` surface is fully covered: all `61` docs now have all six requested model passes.
  - 61
  - still makes `Tiers` the second tab and centers `[retired-token-6]`
  - still defines Evidence, History, and Ledger as widget tabs rather than native tabs
  - `widget.[retired-token-12]`
  - `[retired-token-7]`
  - `Plans/[retired-token-18]` remains a major stale hostability owner:
  - still includes `[retired-token-6]` for `Orch/Tiers`
  - widget data-source language updated away from `TierChanged` / `[retired-token-4]` assumptions
  - TierChanged
  - it explicitly says it is not the storage, command, permission, or widget SSOT
  - `[retired-token-6]`
  - `[retired-token-7]` as [retired-token-8] bars
  - `widget.[retired-token-12]` as active tier
  - The **default widget drill-target mappings** are also absent.
- Legacy token retirement handling:
  - Retired token #1 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #2 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #3 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #4 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #5 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #6 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #7 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #8 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #9 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #10 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #11 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #12 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #13 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #14 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #15 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #16 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #17 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #18 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #19 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
  - All exact_stale_tokens_to_retire are removed, reframed as explicitly deprecated, or preserved only as documented legacy aliases.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.

## Fidelity recovery addendum

This addendum is an ordered parent-writer recovery container. It preserves the row-level fidelity repairs below without requiring multiple same-anchor packet writes.

### Fidelity recovery cov-048: Progress-only widget hostability

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0536
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - Add explicit hostability rules so `Dashboard` and `Progress` can share summary widgets without turning deep inspection tabs into widget canvases.
  - Dashboard
  - Progress
  - Define one shared routing/deep-link payload for search, command palette, widget drill-downs, recovery links, and cross-surface pivots.
  - its hostability, layout keys, widget caps, and catalog all still include `Orch/Tiers`, `Orch/Evidence`, `Orch/History`, and `Orch/Ledger`
  - Orch/Tiers
  - Orch/Evidence
  - Orch/History
  - Orch/Ledger
  - `Widget_System.md` and `Orchestrator_Page.md` still disagree on terminal widget identity and broader Progress/Dashboard hostability details.
  - Widget_System.md
  - Orchestrator_Page.md
  - terminal widget hostability remains split between `widget.terminal_output` and `widget.agent_terminal`
  - widget.terminal_output
  - widget.agent_terminal
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.
- Coverage rows: cov-048
- Fidelity gap refs: cov-048
- Required fidelity items:
- Exact required item: Restrict widget-composed Orchestrator surface to Progress
- Exact required item: Persist orchestrator:progress layout separately from Dashboard and Usage
- Acceptance checks represented:
- Exact acceptance check: The heading `### Fidelity recovery cov-048: Progress-only widget hostability` exists in `Plans/Widget_System.md`.
- Exact acceptance check: The `cov-048` repair states the exact requirement: Restrict widget-composed Orchestrator surface to Progress
- Exact acceptance check: The `cov-048` repair states the exact requirement: Persist orchestrator:progress layout separately from Dashboard and Usage
- Exact acceptance check: The `cov-048` repair includes an explicit consumer cross-reference to the owning canonical contract for the same requirement.

## 1. Scope and non-scope
Widget composition remains important, but it is no longer a blanket page-model for every major surface.

In scope:
- Dashboard widgets
- Usage widgets
- Orchestrator `Progress` widgets

Not in scope:
- `Seams` as a widget canvas
- `Node Graph` as a widget canvas
- `Evidence` as a widget canvas
- `History` as a widget canvas
- `Ledger` as a widget canvas

ContractRef: ContractName:Plans/Orchestrator_Page.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Crosswalk.md

## 2. Hostability and data contracts
Widgets consume stable projections and canonical records. They do not define page semantics.

Rules:
- widget config changes presentation, local filtering, and layout only
- widget-level filters inherit page/project/focused-run context and do not invent independent run scope
- a widget action routes through canonical commands and route/open contracts rather than bypassing them

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/Contracts_V0.md

## 3. Layout persistence
Layout persistence uses app-default with project override.

Rules:
- the default layout key remains stable per page/surface
- project-specific overrides may diverge from the app default
- run-level layout persistence is not canonical for Orchestrator `Progress`
- migration from legacy `dashboard_layout:v1` must retire stale orchestration-hostability assumptions rather than preserve them as peer canon

ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Decision_Policy.md, ContractName:Plans/Orchestrator_Page.md

## 4. Orchestrator Progress widget scope and catalog linkage

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0535
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - Research Progress - 2026-03-16 - Widget System Contract
  - Source Control being a narrow panel reinforces the need to keep widget usage focused on wider surfaces like `Dashboard` and `Orchestrator / Progress`, not as a universal composition strategy everywhere.
  - Dashboard
  - Orchestrator / Progress
  - page-global widget layout keys may be too coarse for project/run-centric Orchestrator usage
  - but there is no explicit decision yet on app-global vs project-scoped widget layouts for Orchestrator `Progress`
  - Progress
  - compact widget headers are not a good place to explain semantic scope; that needs page-level context and deep-link clarity
  - Orchestrator ledger widget semantics still center tier-era filters rather than attempt/account/receipt-aware routing
  - Orchestrator `Progress` widget layout persistence should use **app-default with project override**.
  - effective `Progress` widget layout should be computed as:
  - Add one shared degraded-trust / projection-health / concern bridge that provider, permissions, Orchestrator, Usage, and widget surfaces can all consume.
  - the 12-widget rewrite-era Progress set still has no concrete home in `FinalGUISpec.md`
  - FinalGUISpec.md
  - Add a real Orchestrator section to `FinalGUISpec.md`, make Progress the only widget canvas, and bind all projection-state UX to `projection_freshness` + `projection_health` rather than overloaded trust language.
  - projection_freshness
  - projection_health
  - Orchestrator widget tabs broadly enough to conflict with the newer `Progress`-only widget composition rule
  - Keep Progress widget composition, but bind widgets to canonical runtime and orchestration objects:
  - `Widget_System.md` is still acting as if multiple Orchestrator tabs are widget canvases.
  - Widget_System.md
  - Narrow Orchestrator widget hostability to `Progress` only.
  - Retire `[retired-token-2]` as a first-class Orchestrator widget in favor of native `[retired-token-1]` and native graph/history/evidence/ledger tabs.
  - [retired-token-2]
  - [retired-token-1]
  - Research Progress - 2026-03-17 - Widget layout migration contract is internally inconsistent
  - `Primitive:WidgetCatalog` still says `Orchestrator widget tabs`
  - Primitive:WidgetCatalog
  - Orchestrator widget tabs
  - widget commands still say `Orchestrator widget tabs`, which conflicts with the rewrite direction that only `Progress` remains widget-composed in Orchestrator
  - still defines `Dashboard, Usage, Orchestrator widget tabs`
  - Dashboard, Usage, Orchestrator widget tabs
  - `Widget_System.md` and `Orchestrator_Page.md` still reinforce each other through the old “all Orchestrator tabs are widget canvases” model.
  - Orchestrator_Page.md
  - non-Progress Orchestrator tabs removed from widget layout persistence
- Legacy token retirement handling:
  - Retired token #1 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #2 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
  - All exact_stale_tokens_to_retire are removed, reframed as explicitly deprecated, or preserved only as documented legacy aliases.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.

Only the Orchestrator `Progress` surface is widget-composed. `Seams`, `Node Graph`, `Evidence`, `History`, and `Ledger` remain native views, and no other Orchestrator tab may opt into widget composition.

The Orchestrator UI composes exactly one consumer widget: the `Progress` widget with ID `widget-orchestrator-progress`. This widget occupies a dedicated layout space within the Orchestrator UI and receives orchestrator-native runtime events, progress markers, and node-level state.

`orchestrator:progress` persists in its own layout namespace and does not share layout keys with Dashboard or Usage. Layout resets, imports, and overrides for Dashboard or Usage do not rewrite Orchestrator Progress placement.

### Catalog source and drill linkage

The Progress widget ID (`widget-orchestrator-progress`) is defined in the current promoted widget catalog in `Plans/FinalGUISpec.md` Appendix C (§ C.2, § C.4). Widget_System consumes that named catalog source directly and does not invent an independent catalog or additional widget cards.

The full 13-widget Progress catalog and default drill targets are:
1. `progress.run-overview` → Execution unit tree scoped to `focused_run_id`
2. `progress.current-task` → Node inspector for the active execution unit
3. `progress.lane-health` → Lane row filtered to the selected lane or worktree
4. `progress.node-throughput` → Dense node list filtered to slow or blocked nodes
5. `progress.blocked-concerns` → Concern lane filtered to `blocked` or `attention_required`
6. `progress.approval-queue` → Concern inspector showing pending approvals
7. `progress.recovery-status` → Recovery timeline for the selected concern or blocked episode
8. `progress.artifact-receipts` → Artifact browser filtered to receipt-linked runtime artifacts
9. `progress.worktree-state` → Source Control worktree row with lane, package, and run refs
10. `progress.account-pressure` → Historical `account_pressure_episode` list
11. `progress.account-switches` → Historical `account_switch_event` list
12. `progress.escalation-stack` → Project attention view focused on the shared escalation ladder
13. `progress.attention-summary` → `project_attention_item.primary_route_payload` list

Drill-through and linkage semantics (`progress` → node, `progress` → lane, `progress` → evidence) are owned by the Orchestrator UI and by the FinalGUISpec consumer contract, not by Widget_System hostability rules.

Transferred Progress labels and taxonomy:
- State labels: `queued`, `running`, `attention_required`, `blocked`, `recovering`, `degraded`, `complete`
- Action labels: `Inspect`, `Focus run`, `Open evidence`, `Request approval`, `Acknowledge`, `Dismiss`, `Resolve`, `Retry recovery`
- Alert taxonomy: `advisory`, `attention_required`, `blocked`, `escalated`, `degraded_projection`
- Event taxonomy: `run_started`, `node_started`, `node_completed`, `concern_opened`, `approval_requested`, `approval_decided`, `recovery_started`, `recovery_completed`, `artifact_published`, `account_switched`
- Condition-aging policy: advisory warnings may quiet after one stable refresh window; `attention_required` resurfaces on meaningful change or persistence; `blocked` and `escalated` never auto-quiet
