# Widget System -- Cross-Cutting Specification


## Canonical owner-section requirements

These requirements are canonical live specification text for this owner document and preserve the required product, runtime, storage, UI, and governance details in owner-section form.

Owner-section marker list:
- Progress-only widget hostability


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

<a id="ws-progress-only-widget-hostability"></a>
## 2. Hostability and data contracts
Amended 2026-10-09 (DL-180): the Dashboard is now a tab kind in the home centre, and several dashboard tabs may be open, each showing one board with its own widget layout under `widget_layout:v1:dashboard:<board_id>`; any Usage widget can be placed on a board (`Plans/usage-feature.md#UF-062`). WS-030 owns the boards, their namespaces and the catalogue. The two rules below that named one Dashboard namespace and "some" Usage widgets are amended in place.

Amended 2026-10-10 (DL-186): every dashboard tab's board is a board of the Usage board engine, the engine the Usage page runs, and each board's contents are kept per project under `widget_layout:v1:<project_id>:<board_id>`; the 2026-10-09 form `widget_layout:v1:dashboard:<board_id>` was never written. Boards and their catalogue are built for several widget sources: Usage today, the Orchestrator after its own redesign, others later. Until then the old Home widgets and the curated `Progress` subset are on no dashboard. WS-030 owns all of this.

Widgets consume stable projections and canonical records. They do not define page semantics.

Rules:
- widget config changes presentation, local filtering, and layout only
- widget-level filters inherit page/project/focused-run context and do not invent independent run scope
- Route vocabulary is cross-cutting, not page-local; widget reconciliation starts from owner docs before surface docs so widgets consume the route/open contract instead of recreating route terms locally.
- `tab-level` filters live in tab scope, `widget-level` filters are safe subfilters, and `page-native` actions stay with route/open or page owner docs; `/package` hostability consumes package/seam projections without turning widgets into page owners.
- a widget action routes through canonical commands and route/open contracts rather than bypassing them
- widget surfaces consume cross-cutting `/state` and `/runtime` owner contracts rather than reopening already-locked seams: SSH retry-budget/reconnect behavior is owned by GitHub Integration, and stale cross-references must point to the owning contract before widget drill-downs are implementation-ready
- Widget_System consumes, but does not own, the FinalGUISpec anchors `#### 7.4.4 Settings (Unified) panel specification`, `#### 7.4.7 Agent-Config panel specification`, and `## 15. Promoted widget catalog (web tools, planning, question, operation cards)`: those anchors own provider class/settings disclosure, web/plan/question/approval widget ownership, and the inline visual/web-tool rendering split.
- Widget hostability treats `/settings/widget`, `/plan/question/approval`, and `/web-tool` as routed GUI consumer paths over FinalGUISpec and UI command owners; Widget_System owns only whether those widgets can be hosted by Dashboard, Usage, or Orchestrator `Progress`, plus layout and projection inheritance.
- Stale or incomplete widget summaries are `/retire` or `/incomplete` instead of being reintroduced as live catalog entries; the older source shorthand `### 15.1` through `### 15.9` is source-lineage only, with active promoted widget sections resolved by named FinalGUISpec headings rather than by minting a missing `### 15.9` section.
- Legacy Orchestrator widget inputs such as `/Tiers`, `Orch/Tiers`, `widget.tier_tree`, `PuppetMasterEvent`, `PuppetMasterEvent::TierChanged`, and `TierChanged` are compatibility evidence only. Live hostability does not restore `Dashboard, Usage, Orchestrator widget tabs`; non-Progress Orchestrator surfaces use native views, while `Progress` may host widgets over canonical projections.
- Layout migration SSOT keeps `dashboard_layout:v1` only as an import source or rollback backup; canonical Dashboard writes go to `widget_layout:v1:dashboard` (amended 2026-10-09, DL-180: each dashboard board writes `widget_layout:v1:dashboard:<board_id>`, and `widget_layout:v1:dashboard` itself becomes a read-only migration input into the Home board, WS-030; amended 2026-10-10, DL-186: a board writes `widget_layout:v1:<project_id>:<board_id>`, and `widget_layout:v1:dashboard`, which holds the old Home widgets, is converted into no board and stays a read-only record and rollback backup, WS-030), and the legacy `dashboard_layout` / `dashboard_layout:v1` keys are not updated or retained as peer layout state after migration completes. Retired Orchestrator layout namespaces `widget_layout:v1:orchestrator:tiers`, `widget_layout:v1:orchestrator:evidence`, `widget_layout:v1:orchestrator:history`, and `widget_layout:v1:orchestrator:ledger` remain compatibility-only import evidence, not live widget layout targets.
- `Plans/GUI_Rebuild_Requirements_Checklist.md` / `/GUI_Rebuild_Requirements_Checklist.md` is a follower, not a source. Any `PASS` for `/open`, cross-cutting widget coverage, or `Tiers` is valid only after current owner docs pass the Progress-only, route/open, and runtime-recovery model.
- `Plans/Widget_System.md` / `/Widget_System.md` removal remains lightweight and locally undoable, but canonical concern actions and `/governance` records do not inherit Widget_System / `Widget_System.md` removal policy.
- Settings scope follows this hierarchy: `App / Global` owns broad product defaults and `/catalogs/capabilities`; `Project` owns primary execution policy; `Seam` carries meaningful feature-level overrides; `Package` carries local `/recovery` overrides; `Node` is rare and targeted; `Actor / Role` covers cross-cutting `/account/persona/worker` policy; `Runtime only` is computed truth, not user configuration.
- The older six-tab `Progress / Tiers / Node Graph / Evidence / History / Ledger` page list, plus `tier_id`, tier-scoped data-source rows, and `/task/subtask` framing, is compatibility lineage that omitted `Plan Compile`. Widget_System consumes `Orchestrator_Page` / `Orchestrator_Page.md` for the active `Progress`, `Plan Compile`, `Seams`, `Node Graph`, `Evidence`, `History`, `Ledger` page model and does not treat `Tiers` as a live widget tab.
- Orchestrator `/Widget` hostability gaps such as missing `TOC` sections, split `widget.terminal_output` versus `widget.agent_terminal`, `/partition` and owner run/tier row metadata, under-owned project-heavy surfaces, `/page` and `/tier` filters, `/Evidence/History/Ledger` legacy layout claims, and implicit global layouts resolve through project-scoped layout keys and owner-doc routes.
- Performance and fallback rules cover `Plan Compile`, `Seams`, `Node Graph`, `Evidence`, `History`, `Ledger`, Progress widgets, and cross-tab inspectors. A projection-derived inspector falls back to `Ledger` / `History` or an exact record view via `detail_ref`.
- The Progress widget catalog keeps `/core` candidates visible while allowing users to `/hide` optional widgets; candidate families include run status, current activity, blockers, seam health, package activity, promotion queue, worktree lanes, account pressure, recent major events, overseer activity, corroboration queue, recovery state, and throughput/capacity.
- Widgets consume stable orchestrator projections and canonical record `/query` contracts. They must not define meaning by subscribing directly to legacy event names or tier-specific objects, and `Progress` remains the only widget-composed Orchestrator tab.
- `historical-run` rendering follows the active `/page` route context: `Progress` widgets render against the current `focused_run_id`, and moving between live and historical mode must not require per-widget manual retargeting or preserve stale per-widget scope.
- Canonical Orchestrator route vocabulary uses lower-case object names: `progress`, `plan_compile`, `seams`, `node_graph`, `evidence`, `history`, and `ledger`. These are high-value route targets and do not make Widget_System / `Widget_System.md` a tier-era Orchestrator owner.
- Widget data contracts retire `PuppetMasterEvent`, `PuppetMasterEvent::TierChanged`, `PuppetMasterEvent::UserInteractionRequired`, `TierChanged`, `UserInteractionRequired`, tier-targeted filters, and PTY filtering as live data roots; widgets consume canonical runtime and attention projections instead.
- `Plans/Orchestrator_Page.md` / `/Orchestrator_Page.md` and `Plans/Widget_System.md` / `/Widget_System.md` share the 13-widget Progress catalog and its default drill-target mappings. Widget_System owns hostability and layout, not the target page behavior behind each drill action.
- `/tab` filters stay separate from `page/tab filters` and `widget presentation config`: widget config may adjust presentation and local emphasis only, and it cannot diverge from the tab's canonical projection rules.
- The native-tab versus widget-heavy boundary is explicit: `Progress` is widget-heavy, while `Plan Compile`, `Seams`, `Evidence`, `History`, `Ledger`, and `Node Graph` remain native-tab surfaces owned with `Orchestrator_Page` / `Orchestrator_Page.md`.
- Widget scope has three layers: `router/page scope` carries `project_id`, `focused_run_id`, `/live` or historical mode, `/scope`, and deep-link targets; `tab scope` owns tab-native filters and pivots; `widget config` owns presentation settings, safe subfilters, and widget-local `/filter` state only.
- Widget trust chrome uses shared projection-trust `/freshness` semantics. Individual widgets must not invent stale-state copy or local stale-state categories outside the common projection-trust model.
- The GUI widget appendix must follow the same boundary: `Progress` is widget-composed, while `Plan Compile`, `Seams`, `Node Graph`, `Evidence`, `History`, and `Ledger` are native views; broad Orchestrator widget tabs in GUI prose are compatibility signals only.
- Progress widgets are reconciled away from active-tier-first semantics and bind to active work objects, `/attention` items, lane `/worktree` state, and record-backed summaries.
- `widget.tier_tree` is retired as a first-class Orchestrator widget in favor of native `Seams` and native graph `/history/evidence/ledger` tabs.
- Widget shell data-contract fields are widget identity `/type`, scope, filter `/sort/display` config, and projection ref; widgets consume shared projections instead of raw event streams or bespoke queries.
- `Dashboard` may host a curated subset of `Progress` widgets and some `Usage` widgets, while deep inspection surfaces remain non-hostable native tabs. Amended 2026-10-09 (DL-180): every dashboard tab may host every `Usage` widget, not only some (`Plans/usage-feature.md#UF-062`, WS-030); the curated `Progress` subset stands until the Orchestrator page's own redesign. Amended 2026-10-10 (DL-186): dashboards run on the Usage board engine, whose only widget source today is Usage, so the curated `Progress` subset and the old Home widgets are on no dashboard until the Orchestrator redesign brings its widgets to the engine as a source (WS-030).
- As a cross-cutting owner, Widget_System must prevent stale hostability drift into `/Usage`, `FinalGUISpec.md`, `Orchestrator_Page`, and `Orchestrator_Page.md` reconciliation.
- `Source Control` is a constrained side-panel and `/small` surface, not a broad widget canvas; widget usage stays focused on wider surfaces such as `Dashboard` and `Orchestrator / Progress`.
- `Progress` widgets consume compact projections rather than live-scan huge record sets per widget, and dense detail uses a deep-link to the native tab.
- GUI deep-link compatibility treats `resume_url`, `Tiers`, `/tab`, and broad Orchestrator widget tabs as legacy navigation inputs; active behavior routes through `Progress` and current route/deep-link contracts.
- Tier-era operator surfaces in Widget_System / `Widget_System.md`, Orchestrator_Page / `Orchestrator_Page.md`, and Run_Graph_View / `Run_Graph_View.md` must not preserve multi-tab widget composition, weak hostability, or missing `/effective` governance-object identity as live canon.

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/Contracts_V0.md

## 3. Layout persistence
Layout persistence uses app-default with project override.

Amended 2026-10-09 (DL-180): the "page/surface" a layout key belongs to is, for dashboards, one board: each board has its own key `widget_layout:v1:dashboard:<board_id>` with its own app default and project override (WS-030).

Amended 2026-10-10 (DL-186): a board's key is per project, `widget_layout:v1:<project_id>:<board_id>`. Each project keeps its own copy of each board, and a board with no saved copy in a project starts from the board's own default set, the app default (WS-030).

Rules:
- the default layout key remains stable per page/surface
- project-specific overrides may diverge from the app default
- run-level layout persistence is not canonical for Orchestrator `Progress`
- migration from legacy `dashboard_layout:v1` must retire stale orchestration-hostability assumptions rather than preserve them as peer canon

ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Decision_Policy.md, ContractName:Plans/Orchestrator_Page.md

## 4. Orchestrator Progress widget scope and catalog linkage


### Progress-only widget hostability

Only the Orchestrator `Progress` surface is widget-composed. `Plan Compile`, `Seams`, `Node Graph`, `Evidence`, `History`, and `Ledger` remain native views, and no other Orchestrator tab may opt into widget composition.

Tier-first widget catalog assumptions are compatibility-only; Widget_System hostability follows the Orchestrator Progress-only rule and must not broaden widgetization across native Orchestrator tabs.

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

## Owner / Consumer Map

This source-preserving standardization keeps the owner and consumer boundaries stated in the original document body. During this batch, `Plans/Widget_System.md` remains the owner doc for the behavior described by its preserved sections, while cross-doc ownership follows the ContractRefs and boundary notes already present in the original text.

ContractRef: ContractName:Plans/Plan_Document_System.md, ContractName:Plans/Bootstrap_Planning_Migration.md

## PlanUnits

### WS-002 - Widget Hostability Scope

```yaml
plan_unit_id: WS-002
unit_type: requirement
status: accepted
owner_doc: Plans/Widget_System.md
canonical_text: 'Widget composition is in scope only for Dashboard widgets, Usage widgets, and Orchestrator Progress widgets. Plan Compile, Seams, Node Graph, Evidence, History, and Ledger are not widget canvases.'
gui_related: true
gui_classification_reason: 'The unit defines user-visible widget hostability by surface.'
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- WS-002 remains addressable as a fine-grained Widget System PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: widget_system_drift
reasoning_tier: standard
context_scope: widget_system_batch_198
implementation_surfaces:
- Plans/Widget_System.md
node_compile_hint:
  mode: surface_scope
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Widget_System-S0001
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Widget_System-S0004
preserved_exact_tokens:
- 'Widget System -- Cross-Cutting Specification'
- 'Dashboard widgets'
- 'Usage widgets'
- 'Orchestrator `Progress` widgets'
- 'Seams as a widget canvas'
- 'Node Graph as a widget canvas'
- 'Evidence as a widget canvas'
- 'History as a widget canvas'
- 'Ledger as a widget canvas'
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Orchestrator_Page.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Crosswalk.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- 'Plans/Widget_System.md'
- 'Plans/Orchestrator_Page.md'
- 'Plans/FinalGUISpec.md'
- 'Plans/Crosswalk.md'
- 'Plans/usage-feature.md'
```

### WS-003 - Widget Owner Consumer Boundary

```yaml
plan_unit_id: WS-003
unit_type: constraint
status: accepted
owner_doc: Plans/Widget_System.md
canonical_text: 'Widget_System owns widget hostability, layout, and projection inheritance for Dashboard, Usage, and Orchestrator Progress; widgets consume stable projections and canonical records and do not define page semantics.'
gui_related: true
gui_classification_reason: 'The unit defines GUI widget owner/consumer boundaries and route ownership.'
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- PDS-004
- BPM-004
unblocks: []
acceptance_criteria:
- WS-003 remains addressable as a fine-grained Widget System PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: widget_system_drift
reasoning_tier: standard
context_scope: widget_system_batch_198
implementation_surfaces:
- Plans/Widget_System.md
node_compile_hint:
  mode: owner_route_metadata
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Widget_System-S0002
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Widget_System-S0005
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Widget_System-S0010
preserved_exact_tokens:
- 'Canonical owner-section requirements'
- 'canonical live specification text'
- 'Widgets consume stable projections and canonical records'
- 'They do not define page semantics'
- 'Route vocabulary is cross-cutting, not page-local'
- 'Widget_System owns only whether those widgets can be hosted by Dashboard, Usage, or Orchestrator `Progress`'
- 'owner doc'
- 'cross-doc ownership'
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Plan_Document_System.md, ContractName:Plans/Bootstrap_Planning_Migration.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- 'Plans/Widget_System.md'
- 'Plans/FinalGUISpec.md'
- 'Plans/UI_Command_Catalog.md'
- 'Plans/Orchestrator_Page.md'
- 'Plans/usage-feature.md'
```

### WS-004 - Widget Configuration Scope And Filters

```yaml
plan_unit_id: WS-004
unit_type: requirement
status: accepted
owner_doc: Plans/Widget_System.md
canonical_text: 'Widget config changes presentation, local filtering, and layout only. Widget-level filters inherit page, project, and focused-run context; `/tab` filters, page/tab filters, and widget presentation config remain separate.'
gui_related: true
gui_classification_reason: 'The unit defines user-visible widget configuration and filter behavior.'
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- WS-002
- WS-003
unblocks: []
acceptance_criteria:
- WS-004 remains addressable as a fine-grained Widget System PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: widget_system_drift
reasoning_tier: standard
context_scope: widget_system_batch_198
implementation_surfaces:
- Plans/Widget_System.md
node_compile_hint:
  mode: gui_surface_config
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Widget_System-S0005
preserved_exact_tokens:
- 'widget config changes presentation, local filtering, and layout only'
- 'widget-level filters inherit page/project/focused-run context'
- 'tab-level'
- 'widget-level'
- 'page-native'
- '/tab filters'
- 'page/tab filters'
- 'widget presentation config'
- 'router/page scope'
- 'tab scope'
- 'widget config'
- 'widget-local `/filter` state'
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- 'Plans/Widget_System.md'
- 'Plans/Orchestrator_Page.md'
- 'Plans/usage-feature.md'
```

### WS-005 - Command Routing And Routed GUI Consumer Paths

```yaml
plan_unit_id: WS-005
unit_type: constraint
status: accepted
owner_doc: Plans/Widget_System.md
canonical_text: 'Widget actions route through canonical commands and route/open contracts. `/settings/widget`, `/plan/question/approval`, `/web-tool`, and `/package` hostability are routed GUI consumer paths, not local widget-owned route definitions.'
gui_related: true
gui_classification_reason: 'The unit defines GUI command routing and routed consumer paths for widgets.'
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- WS-003
unblocks: []
acceptance_criteria:
- WS-005 remains addressable as a fine-grained Widget System PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: widget_system_drift
reasoning_tier: standard
context_scope: widget_system_batch_198
implementation_surfaces:
- Plans/Widget_System.md
node_compile_hint:
  mode: route_open_consumer
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Widget_System-S0005
preserved_exact_tokens:
- 'widget action routes through canonical commands'
- 'route/open contracts'
- '/settings/widget'
- '/plan/question/approval'
- '/web-tool'
- '/package'
- 'routed GUI consumer paths'
- 'page-native actions stay with route/open or page owner docs'
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/Contracts_V0.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- 'Plans/Widget_System.md'
- 'Plans/UI_Command_Catalog.md'
- 'Plans/Contracts_V0.md'
- 'Plans/FinalGUISpec.md'
```

### WS-006 - Stable Projection Data Contract

```yaml
plan_unit_id: WS-006
unit_type: requirement
status: accepted
owner_doc: Plans/Widget_System.md
canonical_text: 'Widgets consume stable orchestrator projections, canonical record `/query` contracts, widget identity `/type`, scope, filter `/sort/display` config, and projection refs; they do not subscribe to raw event streams or bespoke queries.'
gui_related: false
gui_classification_reason: 'The unit defines backend projection and data-contract semantics consumed by widgets rather than visual presentation.'
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- WS-003
unblocks: []
acceptance_criteria:
- WS-006 remains addressable as a fine-grained Widget System PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: widget_system_drift
reasoning_tier: standard
context_scope: widget_system_batch_198
implementation_surfaces:
- Plans/Widget_System.md
node_compile_hint:
  mode: projection_data_contract
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Widget_System-S0005
preserved_exact_tokens:
- 'stable orchestrator projections'
- 'canonical record `/query` contracts'
- 'widget identity `/type`'
- 'scope'
- 'filter `/sort/display` config'
- 'projection ref'
- 'shared projections'
- 'raw event streams'
- 'bespoke queries'
- 'compact projections'
- 'deep-link to the native tab'
negative_constraints:
- 'Widgets must not define meaning by subscribing directly to legacy event names or tier-specific objects.'
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- 'Plans/Widget_System.md'
- 'Plans/storage-plan.md'
- 'Plans/Contracts_V0.md'
- 'Plans/Orchestrator_Page.md'
```

### WS-007 - Projection Trust And Historical Run Scope

```yaml
plan_unit_id: WS-007
unit_type: constraint
status: accepted
owner_doc: Plans/Widget_System.md
canonical_text: '`historical-run` rendering follows active `/page` route context and `focused_run_id`; live or historical moves must not require manual per-widget retargeting. Widget trust chrome uses shared projection-trust `/freshness` semantics.'
gui_related: true
gui_classification_reason: 'The unit defines user-visible historical run scope and trust chrome behavior.'
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- WS-004
- WS-006
unblocks: []
acceptance_criteria:
- WS-007 remains addressable as a fine-grained Widget System PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: widget_system_drift
reasoning_tier: standard
context_scope: widget_system_batch_198
implementation_surfaces:
- Plans/Widget_System.md
node_compile_hint:
  mode: projection_trust_scope
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Widget_System-S0005
preserved_exact_tokens:
- 'historical-run'
- 'active `/page` route context'
- 'focused_run_id'
- 'live and historical mode'
- 'per-widget manual retargeting'
- 'projection-trust `/freshness`'
- 'stale-state copy'
- 'local stale-state categories'
negative_constraints:
- 'Moving between live and historical mode must not require per-widget manual retargeting or preserve stale per-widget scope.'
- 'Individual widgets must not invent stale-state copy or local stale-state categories outside the common projection-trust model.'
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions:
- 'Widget trust chrome uses shared projection-trust `/freshness` semantics rather than widget-local stale-state categories.'
owner_hints:
- 'Plans/Widget_System.md'
- 'Plans/Orchestrator_Page.md'
- 'Plans/Run_Graph_View.md'
- 'Plans/FinalGUISpec.md'
```

### WS-008 - Legacy Tier And Event Compatibility Retirements

```yaml
plan_unit_id: WS-008
unit_type: compatibility_disposition
status: accepted
owner_doc: Plans/Widget_System.md
canonical_text: '`/Tiers`, `Orch/Tiers`, `widget.tier_tree`, `PuppetMasterEvent`, `PuppetMasterEvent::TierChanged`, `PuppetMasterEvent::UserInteractionRequired`, `TierChanged`, `UserInteractionRequired`, tier-targeted filters, PTY filtering, and the older six-tab `Progress / Tiers / Node Graph / Evidence / History / Ledger` list are compatibility lineage only; the active Orchestrator shell is `Progress`, `Plan Compile`, `Seams`, `Node Graph`, `Evidence`, `History`, `Ledger`.'
gui_related: true
gui_classification_reason: 'The unit preserves GUI-era compatibility terms and retired widget tabs as non-live lineage.'
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- WS-002
- WS-010
unblocks: []
acceptance_criteria:
- WS-008 remains addressable as a fine-grained Widget System PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: widget_system_drift
reasoning_tier: standard
context_scope: widget_system_batch_198
implementation_surfaces:
- Plans/Widget_System.md
node_compile_hint:
  mode: stale_lineage_only
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Widget_System-S0005
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Widget_System-S0008
preserved_exact_tokens:
- '/Tiers'
- 'Orch/Tiers'
- 'widget.tier_tree'
- 'PuppetMasterEvent'
- 'PuppetMasterEvent::TierChanged'
- 'PuppetMasterEvent::UserInteractionRequired'
- 'TierChanged'
- 'UserInteractionRequired'
- 'tier-targeted filters'
- 'PTY filtering'
- 'older six-tab Progress / Tiers / Node Graph / Evidence / History / Ledger list'
- 'Progress, Plan Compile, Seams, Node Graph, Evidence, History, Ledger'
- 'Dashboard, Usage, Orchestrator widget tabs'
- '### 15.1'
- '### 15.9'
negative_constraints:
- 'Live hostability does not restore Dashboard, Usage, Orchestrator widget tabs.'
- 'Tier-first widget catalog assumptions are compatibility-only; Widget_System hostability follows the Orchestrator Progress-only rule and must not broaden widgetization across native Orchestrator tabs.'
preserved_contractrefs: []
compatibility_only_notes:
- 'Legacy Orchestrator widget inputs and older tier/page lists are compatibility evidence only.'
stale_retired_dispositions:
- '`widget.tier_tree` is retired as a first-class Orchestrator widget in favor of native Seams and native graph/history/evidence/ledger tabs.'
owner_hints:
- 'Plans/Widget_System.md'
- 'Plans/Orchestrator_Page.md'
- 'Plans/Run_Graph_View.md'
- 'Plans/FinalGUISpec.md'
```

### WS-009 - Layout Namespace And Migration

```yaml
plan_unit_id: WS-009
unit_type: requirement
status: accepted
owner_doc: Plans/Widget_System.md
canonical_text: 'Layout persistence uses app-default with project override. `dashboard_layout:v1` is import or rollback only; Dashboard writes use `widget_layout:v1:dashboard`; retired Orchestrator layout namespaces remain compatibility-only; `orchestrator:progress` has its own namespace. Amended 2026-10-09 (DL-180): each dashboard board writes its own namespace `widget_layout:v1:dashboard:<board_id>`, with the app default and project override applied per board; `widget_layout:v1:dashboard` converts into `widget_layout:v1:dashboard:home` on first read, is never reset, and stays only as a read-only migration input and rollback backup, like `dashboard_layout:v1` (WS-030). Amended 2026-10-10 (DL-186): board contents are kept per project, so each dashboard board writes `widget_layout:v1:<project_id>:<board_id>`, and a project with no saved copy of a board starts from that board''s own default set; `widget_layout:v1:dashboard` holds the old Home widgets, which leave Home, so it is converted into no board and stays only a read-only record and rollback backup; the 2026-10-09 `widget_layout:v1:dashboard:<board_id>` was never written (WS-030).'
gui_related: true
gui_classification_reason: 'The unit defines user-visible layout persistence and migration behavior.'
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- WS-002
- WS-010
- DL-180
- DL-186
unblocks: []
acceptance_criteria:
- 'Amended 2026-10-10 (DL-186): every dashboard board restores from and writes to its project''s own `widget_layout:v1:<project_id>:<board_id>`, and no write goes to `widget_layout:v1:dashboard` or to the never-written `widget_layout:v1:dashboard:<board_id>` (WS-030).'
- WS-009 remains addressable as a fine-grained Widget System PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: widget_system_drift
reasoning_tier: standard
context_scope: widget_system_batch_198
implementation_surfaces:
- Plans/Widget_System.md
node_compile_hint:
  mode: layout_persistence
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Widget_System-S0005
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Widget_System-S0006
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Widget_System-S0008
preserved_exact_tokens:
- 'Layout persistence'
- 'app-default with project override'
- 'default layout key'
- 'project-specific overrides'
- 'run-level layout persistence is not canonical'
- 'dashboard_layout:v1'
- 'widget_layout:v1:dashboard'
- 'dashboard_layout'
- 'widget_layout:v1:orchestrator:tiers'
- 'widget_layout:v1:orchestrator:evidence'
- 'widget_layout:v1:orchestrator:history'
- 'widget_layout:v1:orchestrator:ledger'
- 'orchestrator:progress'
- 'widget_layout:v1:<project_id>:<board_id>'
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Decision_Policy.md, ContractName:Plans/Orchestrator_Page.md'
compatibility_only_notes:
- 'Retired Orchestrator layout namespaces remain compatibility-only import evidence, not live widget layout targets.'
- 'Retired 2026-10-10 (DL-186), 2026-10-09 acceptance criterion kept verbatim for lineage: Amended 2026-10-09 (DL-180): every dashboard board restores from and writes to its own `widget_layout:v1:dashboard:<board_id>`, and no write after migration goes to `widget_layout:v1:dashboard` (WS-030).'
stale_retired_dispositions:
- 'Migration from legacy `dashboard_layout:v1` must retire stale orchestration-hostability assumptions rather than preserve them as peer canon.'
- 'Amended 2026-10-09 (DL-180): the single Dashboard namespace becomes one namespace per dashboard board, and `widget_layout:v1:dashboard` becomes a read-only migration input into the Home board (WS-030).'
- 'Amended 2026-10-10 (DL-186): board keys are per project (`widget_layout:v1:<project_id>:<board_id>`), and `widget_layout:v1:dashboard` is no longer converted into the Home board; the 2026-10-09 criterion naming `widget_layout:v1:dashboard:<board_id>` is replaced.'
owner_hints:
- 'Plans/Widget_System.md'
- 'Plans/storage-plan.md'
- 'Plans/FinalGUISpec.md'
- 'Plans/Decision_Policy.md'
- 'Plans/Orchestrator_Page.md'
```

### WS-010 - Orchestrator Progress Only Composition

```yaml
plan_unit_id: WS-010
unit_type: constraint
status: accepted
owner_doc: Plans/Widget_System.md
canonical_text: 'Only Orchestrator `Progress` is widget-composed. `Plan Compile`, `Seams`, `Node Graph`, `Evidence`, `History`, and `Ledger` remain native views. The Orchestrator UI composes exactly one consumer widget, `widget-orchestrator-progress`.'
gui_related: true
gui_classification_reason: 'The unit defines user-visible Orchestrator widget composition boundaries.'
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- WS-002
unblocks: []
acceptance_criteria:
- WS-010 remains addressable as a fine-grained Widget System PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: widget_system_drift
reasoning_tier: standard
context_scope: widget_system_batch_198
implementation_surfaces:
- Plans/Widget_System.md
node_compile_hint:
  mode: progress_widget_hostability
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Widget_System-S0003
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Widget_System-S0004
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Widget_System-S0007
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Widget_System-S0008
preserved_exact_tokens:
- 'Progress-only widget hostability'
- 'Only the Orchestrator `Progress` surface is widget-composed'
- 'Seams'
- 'Node Graph'
- 'Evidence'
- 'History'
- 'Ledger'
- 'native views'
- 'no other Orchestrator tab may opt into widget composition'
- 'widget-orchestrator-progress'
- 'Progress is widget-heavy'
negative_constraints:
- 'No other Orchestrator tab may opt into widget composition.'
- 'Tier-era operator surfaces must not preserve multi-tab widget composition, weak hostability, or missing `/effective` governance-object identity as live canon.'
preserved_contractrefs: []
compatibility_only_notes:
- 'Broad Orchestrator widget tabs in GUI prose are compatibility signals only.'
stale_retired_dispositions: []
owner_hints:
- 'Plans/Widget_System.md'
- 'Plans/Orchestrator_Page.md'
- 'Plans/FinalGUISpec.md'
```

### WS-011 - Promoted Progress Catalog Source And Drill Targets

```yaml
plan_unit_id: WS-011
unit_type: requirement
status: accepted
owner_doc: Plans/Widget_System.md
canonical_text: 'The Progress catalog source is `Plans/FinalGUISpec.md` Appendix C. Widget_System consumes the named catalog and preserves the 13 Progress IDs and their default drill targets without inventing an independent catalog.'
gui_related: true
gui_classification_reason: 'The unit defines user-visible Progress widget catalog linkage and drill targets.'
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- WS-010
unblocks: []
acceptance_criteria:
- WS-011 remains addressable as a fine-grained Widget System PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: widget_system_drift
reasoning_tier: standard
context_scope: widget_system_batch_198
implementation_surfaces:
- Plans/Widget_System.md
node_compile_hint:
  mode: catalog_consumer
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Widget_System-S0005
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Widget_System-S0007
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Widget_System-S0009
preserved_exact_tokens:
- 'Plans/FinalGUISpec.md'
- 'Appendix C'
- 'C.2'
- 'C.4'
- '13-widget Progress catalog'
- 'progress.run-overview'
- 'progress.current-task'
- 'progress.lane-health'
- 'progress.node-throughput'
- 'progress.blocked-concerns'
- 'progress.approval-queue'
- 'progress.recovery-status'
- 'progress.artifact-receipts'
- 'progress.worktree-state'
- 'progress.account-pressure'
- 'progress.account-switches'
- 'progress.escalation-stack'
- 'progress.attention-summary'
- 'drill targets'
- 'progress -> node'
- 'progress -> lane'
- 'progress -> evidence'
negative_constraints:
- 'Widget_System consumes that named catalog source directly and does not invent an independent catalog or additional widget cards.'
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- 'Plans/Widget_System.md'
- 'Plans/FinalGUISpec.md'
- 'Plans/Orchestrator_Page.md'
```

### WS-012 - Progress Labels Taxonomy And Condition Aging

```yaml
plan_unit_id: WS-012
unit_type: requirement
status: accepted
owner_doc: Plans/Widget_System.md
canonical_text: 'Progress preserves transferred state labels, action labels, alert taxonomy, event taxonomy, and condition-aging policy, including `queued`, `running`, `attention_required`, `blocked`, `recovering`, `degraded`, `complete`, and the rule that `blocked` and `escalated` never auto-quiet.'
gui_related: true
gui_classification_reason: 'The unit defines user-visible Progress labels, actions, alerts, events, and aging behavior.'
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- WS-011
unblocks: []
acceptance_criteria:
- WS-012 remains addressable as a fine-grained Widget System PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: widget_system_drift
reasoning_tier: standard
context_scope: widget_system_batch_198
implementation_surfaces:
- Plans/Widget_System.md
node_compile_hint:
  mode: user_visible_taxonomy
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Widget_System-S0009
preserved_exact_tokens:
- 'queued'
- 'running'
- 'attention_required'
- 'blocked'
- 'recovering'
- 'degraded'
- 'complete'
- 'Inspect'
- 'Focus run'
- 'Open evidence'
- 'Request approval'
- 'Acknowledge'
- 'Dismiss'
- 'Resolve'
- 'Retry recovery'
- 'advisory'
- 'escalated'
- 'degraded_projection'
- 'run_started'
- 'node_started'
- 'node_completed'
- 'concern_opened'
- 'approval_requested'
- 'approval_decided'
- 'recovery_started'
- 'recovery_completed'
- 'artifact_published'
- 'account_switched'
- 'blocked and escalated never auto-quiet'
negative_constraints:
- '`blocked` and `escalated` never auto-quiet.'
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- 'Plans/Widget_System.md'
- 'Plans/Orchestrator_Page.md'
- 'Plans/FinalGUISpec.md'
```

### WS-013 - Dashboard Usage And Source Control Hostability

```yaml
plan_unit_id: WS-013
unit_type: requirement
status: accepted
owner_doc: Plans/Widget_System.md
canonical_text: 'Dashboard may host a curated subset of Progress widgets and some Usage widgets, while deep inspection surfaces remain non-hostable native tabs. Source Control is a constrained side-panel and `/small` surface, not a broad widget canvas. Amended 2026-10-09 (DL-180): every dashboard tab may host every Usage widget, not only some (`Plans/usage-feature.md#UF-062`, which wins over the four-widget catalogue of `Plans/FinalGUISpec.md#F3-279`); the curated Progress subset stands, and further Orchestrator widgets join after the Orchestrator page has its own redesign (WS-030). Amended 2026-10-10 (DL-186): every dashboard board runs on the Usage board engine, whose only widget source today is Usage; the curated Progress subset and the old Home widgets (run progress, lanes, results and custom metrics) are on no dashboard until the Orchestrator redesign brings its widgets to the engine as a source, under the same kind contract (WS-030).'
gui_related: true
gui_classification_reason: 'The unit defines user-visible cross-surface widget hostability boundaries.'
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- WS-002
- WS-010
- DL-180
- DL-186
unblocks: []
acceptance_criteria:
- 'Amended 2026-10-09 (DL-180): the Add widget flow of every dashboard tab offers every Usage widget, and no four-widget limit applies (WS-030).'
- 'Amended 2026-10-10 (DL-186): no dashboard offers a Progress widget or an old Home widget until the Orchestrator redesign adds its widgets to the board engine as a source.'
- WS-013 remains addressable as a fine-grained Widget System PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: widget_system_drift
reasoning_tier: standard
context_scope: widget_system_batch_198
implementation_surfaces:
- Plans/Widget_System.md
node_compile_hint:
  mode: cross_surface_hostability
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Widget_System-S0004
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Widget_System-S0005
preserved_exact_tokens:
- 'Dashboard may host a curated subset of `Progress` widgets and some `Usage` widgets'
- 'deep inspection surfaces remain non-hostable native tabs'
- 'Source Control'
- 'constrained side-panel'
- '/small'
- 'not a broad widget canvas'
- 'Dashboard'
- 'Usage'
- 'wider surfaces'
negative_constraints:
- 'Deep inspection surfaces remain non-hostable native tabs.'
- 'Source Control is a constrained side-panel and `/small` surface, not a broad widget canvas.'
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions:
- 'Amended 2026-10-09 (DL-180): "some Usage widgets" now reads every Usage widget, on every dashboard tab (WS-030).'
- 'Amended 2026-10-10 (DL-186): the curated Progress subset leaves dashboards with the old Home widgets until Orchestrator widgets join the board engine as a source.'
owner_hints:
- 'Plans/Widget_System.md'
- 'Plans/FinalGUISpec.md'
- 'Plans/usage-feature.md'
- 'Plans/WorktreeGitImprovement.md'
```

### WS-014 - Settings Hierarchy And Runtime Only Scope

```yaml
plan_unit_id: WS-014
unit_type: constraint
status: accepted
owner_doc: Plans/Widget_System.md
canonical_text: 'Settings scope follows App / Global, Project, Seam, Package, rare targeted Node, Actor / Role, and Runtime only; Runtime only is computed truth, not user configuration.'
gui_related: true
gui_classification_reason: 'The unit defines user-visible settings scope and runtime-only configuration boundaries.'
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
- WS-003
unblocks: []
acceptance_criteria:
- WS-014 remains addressable as a fine-grained Widget System PlanUnit with source-span coverage.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: widget_system_drift
reasoning_tier: standard
context_scope: widget_system_batch_198
implementation_surfaces:
- Plans/Widget_System.md
node_compile_hint:
  mode: settings_scope_hierarchy
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Widget_System-S0005
preserved_exact_tokens:
- 'App / Global'
- 'Project'
- 'Seam'
- 'Package'
- 'Node'
- 'Actor / Role'
- 'Runtime only'
- 'computed truth'
- 'not user configuration'
- '/catalogs/capabilities'
- '/recovery'
- '/account/persona/worker'
negative_constraints:
- 'Runtime only is computed truth, not user configuration.'
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- 'Plans/Widget_System.md'
- 'Plans/FinalGUISpec.md'
- 'Plans/Decision_Policy.md'
- 'Plans/Multi-Account.md'
```
### WS-001 - Widget System Source-Preserving Bridge Retired

```yaml
plan_unit_id: WS-001
unit_type: generated_artifact_residual
status: accepted
owner_doc: Plans/Widget_System.md
canonical_text: 'WS-001 is retired to migration-lineage-only compatibility disposition after Phase 2B batch 198 because Widget_System-S0001 through S0009 are covered by fine-grained WS-002 through WS-014, Widget_System-S0010 and S0011 are generated structural metadata, Widget_System-S0012 is the generated source-preserving bridge itself, and Widget_System-S0013 is generated Migration Coverage. WS-001 no longer carries source_preserving_planunit compile mode and must not own product coverage.'
gui_related: false
gui_classification_reason: 'The retired bridge is generated migration lineage rather than implementation-facing GUI behavior, even though its retired source lineage preserved earlier GUI-related widget product tokens.'
split_recommended: false
depends_on:
- WS-002
- WS-003
- WS-004
- WS-005
- WS-006
- WS-007
- WS-008
- WS-009
- WS-010
- WS-011
- WS-012
- WS-013
- WS-014
unblocks: []
acceptance_criteria:
- Widget_System-S0001 through S0009 remain mapped to fine-grained Widget System PlanUnits rather than WS-001.
- Widget_System-S0010 through S0013 are structural migration material or retired bridge lineage, not product implementation coverage.
- WS-001 no longer uses source_preserving_planunit mode and creates no WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: residual_bridge_overreach
reasoning_tier: standard
context_scope: widget_system_generated_tail_batch_198
implementation_surfaces:
- Plans/Widget_System.md
node_compile_hint:
  mode: source_preserving_bridge_retired
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Widget_System-S0010
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Widget_System-S0011
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Widget_System-S0012
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Widget_System-S0013
preserved_exact_tokens:
- source_preserving_planunit
- Widget System -- Cross-Cutting Specification
- Widget_System-S0010
- Widget_System-S0013
- Migration Coverage
- PlanUnits
- Owner / Consumer Map
negative_constraints:
- WS-001 must not provide product implementation coverage for Widget_System-S0001 through S0013 after Phase 2B batch 198.
- WS-001 must not override WS-002 through WS-014 or later fine-grained Widget System PlanUnits.
- Do not rely on one coarse source_preserving_planunit as the final implementation standard for Widget_System.md.
preserved_contractrefs:
- 'ContractRef lineage remains preserved in span_map and coverage_map; malformed trailing apostrophes from the generated WS-001 bridge are lineage only and are not promoted as active ContractRefs.'
compatibility_only_notes:
- The retired bridge is compatibility lineage for generated Owner / Consumer Map, generated PlanUnits, former WS-001 bridge, and Migration Coverage tail spans only.
stale_retired_dispositions:
- Former generated source-preserving bridge material is retired as migration lineage only.
owner_hints:
- Plans/Widget_System.md
```

## Usage GUI Propagation Addendum - 2026-07-09

This addendum constrains Dashboard-hosted Usage widgets without expanding the Dashboard catalog beyond owner-approved widgets. It creates no WorkNodes, NodeSeeds, executable queues, implementation files, runtime artifacts, generated wiring rows, production build tasks, final manifests, or PNC-019 receipts.

### WS-015 - Usage Widget Value-State Contract

```yaml
plan_unit_id: WS-015
unit_type: requirement
status: accepted
owner_doc: Plans/Widget_System.md
canonical_text: >-
  Dashboard-hosted Usage widgets are consumers of the canonical UsageRecord projection and FinalGUISpec value-state matrix. A Usage widget may summarize token, context, cost, quota, cache, reasoning, provider_total, context_estimate, Antigravity credits, or provider pressure only when it carries value_state, source_class, source_confidence, settlement_status, projection_freshness, and reason for degraded/unknown/hidden/disabled values. If the Dashboard does not promote a Usage widget in a given build, the Add Widget catalog shows Usage unavailable rather than silently substituting a simplified spend widget.
gui_related: true
gui_classification_reason: Dashboard widgets and Add Widget catalog behavior are visible GUI surfaces.
depends_on: [WS-013, F3-418, UF-087]
unblocks: []
acceptance_criteria:
  - Any Usage widget row renders disabled, not_exposed, unknown, stale, estimated, hidden_byok, hidden_subscription, streaming_partial, adjusted, failed, provider-reported zero, cache zero, and cache unsupported as distinct display states.
  - Usage widget fixtures cover no-double-count behavior for cache and reasoning inclusive/exclusive semantics.
  - Add Widget catalog either exposes a named Usage widget with this contract or marks Usage widget hostability unavailable with a reason; it must not expose an unowned placeholder widget.
  - Dashboard widget rollups use usage_event_ref or UsageRecord aggregation refs and never timestamp/run/thread/tier-only joins for accounting identity.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-plans-verify.py run-gates
  - future Dashboard Usage widget fixture suite
risk_class: dashboard_usage_widget_false_zero
reasoning_tier: high
context_scope: widget_usage_projection
implementation_surfaces:
  - Plans/Widget_System.md
  - Plans/FinalGUISpec.md
  - Plans/usage-feature.md
node_compile_hint:
  mode: widget_usage_value_state_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Plans/Widget_System.md:65-70"
  - "Plans/Widget_System.md:830-889"
  - "Plans/FinalGUISpec.md:1265-1293"
  - "Plans/FinalGUISpec.md:18585-18680"
  - "Plans/usage-feature.md:5412-5605"
preserved_exact_tokens:
  - Dashboard
  - Usage widget
  - Add Widget
  - value_state
  - source_confidence
  - usage_event_ref
  - cache zero
  - unsupported
negative_constraints:
  - Do not add a Dashboard Usage widget that bypasses UF-085/UF-087 projections.
  - Do not render unavailable Usage widget hostability as an empty zero widget.
  - Do not let Dashboard rollups become the canonical Usage schema owner.
owner_hints:
  - Plans/Widget_System.md
  - Plans/FinalGUISpec.md
  - Plans/usage-feature.md
```

## Migration Coverage

Original hash: `54df502ef51f5567df1d7d30a617130d3a869c86434886652c4a0434c1c61cfe`.

Run-scoped proof artifacts:
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/original_hashes.json`
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl`
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/coverage_map.jsonl`
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/anchor_aliases.json`

Phase 2B batch 198 atomized `Widget_System-S0001` through `Widget_System-S0009` into fine-grained PlanUnits `WS-002` through `WS-014`, while preserving hostability scope, owner/consumer boundaries, routed GUI consumer paths, projection contracts, projection trust, compatibility retirements, layout namespaces, Progress-only composition, promoted Progress catalog IDs, Progress label taxonomy, Dashboard/Usage/Source Control hostability, and settings hierarchy. Generated Owner / Consumer Map and PlanUnits heading spans `Widget_System-S0010` and `Widget_System-S0011` were structurally dispositioned, generated bridge span `Widget_System-S0012` was retired through `WS-001` as migration-lineage-only compatibility residue, and generated Migration Coverage span `Widget_System-S0013` was structurally dispositioned. `WS-001` no longer uses `source_preserving_planunit` mode and must not own product coverage. Batch 198 did not update Spec Lock, generated shards, evidence bundles, auto_decisions, or plan_graph, and it did not create WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code.

## FABLE Deferred Action Concrete Repair Addendum - 2026-07-08

## PMConcept7 Home Workspace boundary clarification — 2026-08-04

Amended 2026-10-10 (DL-186) — dashboards run on the Usage board engine. Each dashboard tab's board is one board of
the engine the Usage page runs, and its widget layout is kept per project under
`widget_layout:v1:<project_id>:<board_id>` (WS-030), never in the Home layout record. The owner of a dashboard
widget's move, resize, gravity and Tidy is that board, exactly as on the Usage page (WS-019); the panel that holds the
tab is the outer frame that never owns a widget mutation. A widget operation inside the tab names its board in the
widget command's existing `room` field, with no new field. The ownership split below stands and now names the
per-project key; the 2026-10-09 `widget_layout:v1:dashboard:<board_id>` it named was never written, and its
"addressed by `board_id`" now reads as the board id carried in `room`.

Amended 2026-10-09 (DL-180) — panels, dashboard tabs and one gesture kit. Home's centre is now one universal panel
system (`Plans/FinalGUISpec.md#F3-630`): its panels, their tabs and the fixed chat column are shell presentation
surfaces, and a dashboard is a tab kind that may be open in several tabs, each showing one board (WS-030). The
ownership split below stands with new names: the Home layout record is `home_workspace_layout.v2`
(`Plans/storage-plan.md#SP-330`), which owns panels and tabs and never a widget, and each board's widget layout is
`widget_layout:v1:<project_id>:<board_id>` (amended 2026-10-10, DL-186), which owns widget placement and never a
panel or tab. Panels and the widget
board now move with one gesture kit (`Plans/DRY_Rules.md#DR-066`), which replaces the earlier "shared interaction
vocabulary" and "may reuse U10 interaction semantics" sentences; the kit carries no layout model, so sharing it
merges no ownership. Moving or resizing a dashboard tab, or the panel that holds it, is a panel operation
(`cmd.panel_tab.*`, `cmd.workspace_layout.*`); a widget operation inside the tab is a `cmd.widget.*` row that names
its board in the existing `room` field (WS-030, amended 2026-10-10, DL-186). The sentences below that named `editor_panel_*`, the singleton `dashboard`, terminal sections,
`home_workspace_layout.v1` and the one `widget_layout:v1:dashboard` are amended in place; the 2026-08-13 notes on the
Home surface grip are lineage, because panels are now moved by their own grip (F3-630).

Amended 2026-08-12 — shared interaction vocabulary, separate layout ownership. Dashboard
widget reorder and resize adopt the same direct-manipulation vocabulary as Home surface
movement: a lifted item that tracks the pointer one-to-one, a real in-flow placeholder in
the vacated cell carrying that item's grid span, neighbour reflow animated from pre-move
rects, a top-left grab handle, corner resize that snaps to grid tracks live and re-renders
the widget body once on release, and Escape / pointer-cancel / blur as the cancellation
contract. Sharing that vocabulary is a presentation decision and does not merge ownership:
Home layout continues to own surface placement under `home_workspace_layout.v2` (amended
2026-10-09; `home_workspace_layout.v1` is a read-only migration input), while widget layout
continues to own widget placement under each board's `widget_layout:v1:<project_id>:<board_id>`
(amended 2026-10-09 and 2026-10-10, WS-030). A widget drag never writes the Home record and a panel or tab
drag never writes a widget record.

Amended 2026-08-13 — grab-handle presentation update on the Home side: the Home surface
grab handle became a 28 by 28 folded-corner triangle filling the surface's top-left corner.
Re-amended 2026-08-13 (tweak wave): that triangle is itself retired — the Home surface grip
is now a small lines-only glyph (two diagonal strokes, no filled plate) over an 18 px hit
triangle at the surface's TOP-RIGHT corner (clip-path hit-testing still lets the empty half
fall through; in-glyph focus treatment; ARIA and keyboard grammar unchanged). The
"top-left grab handle" in the shared vocabulary above continues to describe Dashboard
WIDGETS, whose handle position and glyph are unchanged; the Home surface grip's position
and glyph are owned by F3-HOME-003, and this presentation note changes no ownership
boundary.

Home Workspace surfaces (amended 2026-10-09: the panels, their tabs of every kind,
dashboard tabs and terminal tabs included, and the chat column) are shell presentation
surfaces, not Dashboard widgets. The Home layout shares one gesture kit with the widget
board (DR-066), but it does not import Widget System hostability, DOM order as canonical
state, Dashboard widget layout, or any `cmd.widget.*` command. Dashboard widget movement
remains owned by this document and its existing projection contract; moving a dashboard
tab or its panel is owned by the Home panel owner (F3-630, F3-631).

This addendum repairs non-runtime widget rows without creating WorkNodes, implementation files, runtime artifacts, or PNC-019 evidence.

- Repairs `sfk-27612d81432b8c866dbb6e76`: `widget-custom-metrics` is the canonical id for custom metric widgets. Fields are `widget_id`, `metric_id`, `query_ref`, `unit`, `refresh_interval_seconds`, `empty_state_copy_id`, and `owner_doc_ref`.
- Repairs `sfk-243d9819162bc839409ce15b`: external usage-feature references to Widget_System `§2`, `§3`, `§4`, or `§7` resolve to named widget hostability, projection trust, layout namespace, and Progress catalog anchors. New citations must use names instead of numeric section aliases.
- Repairs `sfk-7d2d295617efe72e4e966b52`: external references to Widget_System `§7` map to the named `Progress catalog and hostability` section. New citations must use named anchors because this file's live headings are not numbered as §7.
- Repairs `sfk-cdbe4e263b71df9ea3cb1655`: example widget-shell payload: `{\"widget_id\":\"widget.orchestrator_status\",\"widget_kind\":\"progress\",\"host_surface\":\"dashboard\",\"data_ref\":\"projection.widget.orchestrator_status\",\"refresh_interval_seconds\":30,\"empty_state\":\"no_active_run\",\"schema_version\":\"1.0.0\"}`.

## u11 Prism II Usage Widget Disclosure Addendum - 2026-08-18

This addendum binds the Usage page's disclosure ladder to widget hostability that WS-002 and WS-003 already
grant this owner. It creates no WorkNodes, NodeSeeds, executable queues, implementation files, runtime
artifacts, generated wiring rows, production build tasks, final manifests, or PNC-019 receipts.

### WS-016 - Usage Widget Disclosure And Empty-Room Contract

```yaml
plan_unit_id: WS-016
unit_type: requirement
status: accepted
owner_doc: Plans/Widget_System.md
canonical_text: >-
  Usage widget disclosure is a mount filter, not a deletion. The Usage page exposes the user-facing levels
  `At a glance`, `Detailed`, and `Diagnostics`; each level determines which widget types a room may mount and
  which the Add Widget affordance may offer, and a level change never deletes an existing widget instance or
  rewrites a stored layout.
  A room whose widget types all sit above the current level renders an explicit empty state that names the
  level actually holding that room and offers the switch to it, and its Add affordance is suppressed so it
  cannot open an empty menu. Such a room states that it is empty; it must not mount an out-of-level widget,
  a placeholder widget, or a simplified substitute in order to look populated. Usage widget layout persists
  in its own namespace under the WS-009 layout namespace rule and inherits the WS-015 value-state contract
  for every cell, so an out-of-level or unavailable widget is a named absence rather than a zero.
gui_related: true
gui_classification_reason: Disclosure level decides which widgets are visible, what the Add Widget affordance offers, and what an empty room says.
depends_on: [WS-002, WS-003, WS-009, WS-015, UF-092]
unblocks: []
acceptance_criteria:
  - Raising or lowering the disclosure level changes only which widget types may mount or be added; every existing widget instance and its stored layout survive the change.
  - A room with no widget type at the current level renders a named empty state that identifies the level holding it and offers the switch, and its Add affordance is suppressed.
  - No room substitutes an out-of-level widget, a placeholder widget, or a simplified widget to avoid rendering an empty state.
  - Usage widget layout persists in its own namespace under the WS-009 rule and never writes the Dashboard or Orchestrator Progress namespace.
  - Every Usage widget cell satisfies the WS-015 value-state contract, so unavailable and out-of-level content render as named absences rather than zeroes.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-plans-verify.py run-gates
  - future Usage widget disclosure and empty-room fixture suite
risk_class: usage_widget_disclosure_false_population
reasoning_tier: high
context_scope: usage_widget_disclosure
implementation_surfaces:
  - Plans/Widget_System.md
  - Plans/usage-feature.md
  - Plans/storage-plan.md
node_compile_hint:
  mode: usage_widget_disclosure_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Concepts/usage-concepts/QwenUsageConcept/u11-prism.html (u11 Prism II Usage concept; source-lineage-only)"
  - Concepts/usage-concepts/QwenUsageConcept/u11-widgets.js
  - Concepts/usage-concepts/PM_Usage_Independent_Audit_2026-08-17/handoff/PORT_HANDOFF_PLANS_ROUTE.md
preserved_exact_tokens:
  - "At a glance"
  - Detailed
  - Diagnostics
  - "Add Widget"
  - "widget_layout:v1:usage"
negative_constraints:
  - Do not expose `essentials`, `standard`, `advanced`, `Essen`, `Std`, or `Adv` as user-facing Usage disclosure labels.
  - Do not delete or rewrite an existing widget instance when the disclosure level changes.
  - Do not mount an out-of-level, placeholder, or simplified widget so a room looks populated.
  - Do not leave an Add affordance that opens an empty menu in an out-of-level room.
  - Do not write Usage widget layout into the Dashboard or Orchestrator Progress namespace.
owner_hints:
  - Plans/Widget_System.md
  - Plans/usage-feature.md
  - Plans/FinalGUISpec.md
```

## PMConcept7 Recovery Canonical Integration Addendum - 2026-08-27

This addendum integrates the recovered PMConcept7 Usage and Dashboard widget behavior into the current Widget
System owner. `Concepts/PMConcept7.html` illustrates this behavior and is never an authored owner.
The current repo-local audit status is
`Plans/.audits/audit-20260829-001-pmconcept7-widget-followup/audit_report.json`; incomplete or failed runtime,
visual, interaction, motion, or accessibility rows remain `verification_pending`, so this addendum grants no such audit
credit. It reuses the existing `cmd.widget.*` family and current widget-layout namespaces; it creates no
second layout store, PM7-only command family, WorkNode, NodeSeed, executable queue, implementation task,
production implementation code, or generated governance artifact.

Final successor evidence is report-owned. When `audit_report.json` records `status = pass_with_named_residuals`
and `verdict = successor_scope_verified_with_named_residuals`, the `evidence_ref` entries below prove only their
named exact-hash PMConcept7 concept/demo slices. They grant no native Slint, production-runtime, PNC-019,
certification, completeness, or product-readiness credit; every blocked, failed, uncaptured, or residual lane
retains that classification.

Build8 browser receipts do not establish an all-visuals pass. The protected Settings actual-pixel review retains
`IVR-T41-B8-XPAGE-001`: the rightmost Settings card column is visibly cropped at 1180, 980, 860, and 680 in all
eight themes even though the cross-page runner reports root-level containment. The P2 narrow page-overflow menu
keyboard-focus and Arrow-key-navigation defect also remains open, and PNC-019 remains outside this evidence.

### WS-017 - Kind-Aware Curated Size And Adaptive Content Contract

```yaml
plan_unit_id: WS-017
unit_type: requirement
status: accepted
owner_doc: Plans/Widget_System.md
canonical_text: >-
  Widget sizing is a kind-aware semantic contract rather than arbitrary empty geometry. Each widget kind
  exposes only supported curated shapes, named Strip, Compact, Standard, and Expanded, or Wide, Full width,
  Panel, Ladder, and Band where the shape is the point; Maximum and Tall are retired names, because they promised
  more than the size showed. Increasing a widget's supported size must increase useful
  information density: wide instruments and summaries use balanced internal columns; lists, accounts,
  providers, ledgers, and event cards reveal more complete rows; charts spend the extra area on plot and
  legible facts; context and authority cards reveal additional source, route, confidence, history, forecast,
  reset, or settlement facts. A compact tier mounts complete content groups only, so the next tier never
  peeks, clips, or appears as a partial row, bar, label, legend, or footer.
  Size presets (rethought 2026-10-09, Plans/Decision_Log.md#DL-176) are the named sizes a widget kind offers in
  its card menu's size picker. The Usage board measures its own width and lays cards on 12 tracks below 880 px,
  20 tracks from 880 px, 24 tracks from 1100 px, and 30 tracks from 1460 px of board width; a board keeps its
  class until its width falls 24 px below that class's threshold (a 20-track board holds down to 856 px), so a
  20-track board never runs under a pitch of about 43 px and widgets can be much narrower than before. Each kind
  offers few presets (two or three for most kinds, four for trend and columns, one for the group heading), and each
  preset is one complete content tier that adds a named content step over the kind's preset before it. A preset resolves to pixels: its
  width is authored in tracks at the nominal 47 px pitch, per board class where a class should offer a wider card,
  and the board resolves it at the live pitch to the same card width on every board, never more than 2 % narrower
  and never wider than the board, except that a board-wide preset takes the class's whole track count (12, 20, 24, or
  30). Its height follows one of three rules: a fixed number of rows, for content that stretches into its card
  (charts, rings, tiles); fit N, the smallest height that shows N complete items of the kind (accounts, rows,
  resets, models, families), which shows every item and says so when the kind has fewer; or fit all, the smallest
  height at which the kind folds nothing. A fit height is measured by rendering the real kind at the preset's pixel
  width in the current look, range, scope, and configuration, is capped at the kind's maximum height, and uses the
  table's fallback rows until a measure exists. A preset that would only repeat another at a board class, or whose
  form needs more card width than the board gives, is not offered there, and two presets that come to the same size
  on the current board are one row, kept by the larger tier. Every kind's smallest preset shows its complete tier,
  in every look, on any board down to 400 px wide. A preset never makes a card so small that it shows fragments, a
  chart without readable axes or values, a list cut mid-row, or numbers without the label that explains them. Facts a
  preset cannot show stay reachable: the head's "+N" count and an "N more" line each with its hover list, and
  Details. The card head's size tool opens the size picker, and the card menu's Size row drills into the same picker.
  The picker shows a preview stage and then one row per preset: a footprint glyph drawn to one scale for every row
  (the card's share of the board's width, and its height), the preset's name, one plain line saying what the card
  shows at that size, and its width x height in tracks and rows, the current preset checked; every row shows without
  the menu scrolling. The stage holds a faithful miniature, the real card rendered by its own kind in the current look
  at the preset's pixel size and scaled over a faint track grid, captioned with the name, width x height, pixel size,
  and what the miniature actually shows (every row, "6 of 9 rows, 3 in Details", every fact). Hovering a row, focusing
  it, or moving with the arrow keys previews that preset in the stage and dispatches nothing; choosing a preset
  commits one resize through the board's own resize path (WS-019). The per-kind preset table is kept once, in
  the curated-size matrix this unit validates against, and the size picker, keyboard resize, pointer snapping, and
  saved layouts read that one table.
gui_related: true
gui_classification_reason: This unit defines visible widget geometry, information-density tiers, and complete-or-hidden content behavior.
depends_on: [WS-002, WS-003, WS-015, WS-016]
unblocks: [WS-018, WS-019, WS-020]
acceptance_criteria:
  - A maintained tier matrix covers instrument, summary, list, chart, context, ledger, account, and provider kinds and identifies the supported curated shapes for each kind.
  - Every successive supported tier has a deterministic content delta; a larger card that only adds empty space fails.
  - Wide cards use internal columns or expanded plot/fact regions instead of leaving avoidable empty middle space.
  - Taller list, account, provider, ledger, and event cards reveal additional complete records without routine internal body scrolling.
  - Compact cards expose only complete groups; no lower-tier fragment, clipped label, partial row, hidden value, or peeking footer is visible.
  - The Free usage card and every named Usage width-coverage card earn each supported default and larger size with additional useful content.
  - Every size preset of every Usage widget kind, in every room that hosts that kind, at each of the 12, 20, 24, and 30 track counts where it is offered, renders a complete tier that reads sensibly on its own, and every kind's smallest preset does so in every look on boards 400, 550, and 700 px wide; a preset that shows a fragment, an unreadable chart, a cut row, or a value without its label is removed from the kind's preset set rather than kept.
  - The board takes 12 tracks below 880 px, 20 from 880 px, 24 from 1100 px, and 30 from 1460 px, holding each class until its width falls 24 px below that class's threshold; a preset resolves to the same pixel width on every board (never more than 2 % narrower, never wider than the board) except that a board-wide preset takes the class's track count.
  - Each preset's height is fixed rows, fit N (the smallest height showing N complete items, or every item when there are fewer), or fit all (the smallest height that folds nothing), measured from the real kind at the preset's pixel width in the current look, range, scope, and configuration and capped at the kind's maximum height; folded facts stay reachable through the head's "+N" count, an "N more" line with its hover list, and Details.
  - The size picker opens from the card head's size tool and from the card menu's Size row, shows a preview stage and one row per offered preset with a footprint glyph, its name, one plain line of what it shows, and its width x height, every row visible without scrolling; hover, focus, or arrow keys preview the preset in the stage as the real card at that pixel size without dispatch, choosing it commits exactly one resize, a preset not offered at the board's class or width is absent, and two presets of the same size on the board show as one row.
  - The size picker, keyboard resize, pointer snapping, and saved-layout restore read one per-kind preset table; no surface keeps its own preset list.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - tests/fixtures/usage_gui/presentation/curated_size_matrix.json (static contract fixture only)
  - tests/fixtures/usage_gui/presentation/widget_content_tiers.json (static contract fixture only)
  - "evidence_ref: Plans/.audits/audit-20260829-001-pmconcept7-widget-followup/browser/runs/t41-build8-focused-regression-rerun-2/report.json (SHA-256 4de0320f73010440560c5fed357df8b67f02188b6ca0a07c1ff3875de31485c0; exact Build8 concept/browser slice; readiness_claim=false)"
  - "evidence_ref: Plans/.audits/audit-20260829-001-pmconcept7-widget-followup/browser/runs/t41-build8-all-charts/report.json (SHA-256 673e3c9a033a101b41a28dbc0dffc59397515e2c91ae88abac8970414c722b66; exact Build8 concept/browser slice; readiness_claim=false)"
  - "evidence_ref: Plans/.audits/audit-20260829-001-pmconcept7-widget-followup/browser/runs/t41-build8-checked-in-width-matrix/report.json (SHA-256 54895af4fb7c7245bbc8c7d5772cd46dace251bfdfa023513fef490aa37e4dd0; exact checked-in Build8 concept/browser slice; readiness_claim=false)"
risk_class: widget_geometry_without_semantic_content
reasoning_tier: high
context_scope: widget_kind_aware_adaptive_content
implementation_surfaces:
  - Plans/Widget_System.md
  - Plans/usage-feature.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: widget_kind_aware_adaptive_content
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Concepts/pm7-tools/base/PM7-base.html (historical PM7 prototype lineage only)"
  - "Concepts/pm7-tools/build_pm7.py (historical PM7 prototype lineage only)"
  - "Concepts/PMConcept7.html (look-and-behaviour reference only)"
  - "Concepts/usage-redesign/src/js/42-cards.js (Usage redesign card menu and size picker; source-lineage-only)"
  - "Concepts/usage-redesign/src/js/40-board.js (Usage redesign board track ladder; source-lineage-only)"
  - "Concepts/usage-redesign/tools/boards.py (the per-kind preset table as built, branch concept/usage-pm7-c-presets-20261009 at 21ca626731; source-lineage-only)"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/usage-mockups-20261001/lane-reports-20261010/c-presets-REPORT.md, SHA-256 505de34e60acd8d9efce08e5ec392f58c574db75cbadf5846a34c42424567a3e (preset rules, per-kind table, GPU-tested table at 1440, 1920, 400, 550, and 700 px boards, the 880 px class threshold)"
  - Plans/Decision_Log.md#DL-176
preserved_exact_tokens:
  - Strip
  - Compact
  - Standard
  - Expanded
  - Maximum
  - complete-or-hidden
  - size picker
negative_constraints:
  - Do not treat a larger rectangle with unchanged mounted content as a larger semantic size.
  - Do not use routine internal widget scrolling to conceal content that a curated size claims to contain.
  - Do not reveal fragments of a lower content tier.
  - Do not treat static source inspection or an in-progress audit as executable acceptance evidence.
  - Do not offer a size preset whose content tier is a fragment or does not make sense on its own, and do not keep a second preset list outside the one per-kind table.
  - Do not name a preset Maximum or Tall, and do not drop a fact a preset cannot show instead of folding it behind a reachable count, list, or Details.
owner_hints:
  - Plans/Widget_System.md
  - Plans/usage-feature.md
```

### WS-018 - Curated Geometry Auto-Growth And Default Composition

```yaml
plan_unit_id: WS-018
unit_type: requirement
status: accepted
owner_doc: Plans/Widget_System.md
canonical_text: >-
  Widget geometry resolves through a curated per-kind size catalog. Pointer, keyboard, restore, and migration
  inputs that do not name or resolve to a supported size snap deterministically to the nearest valid geometry.
  Eligible widgets expose explicit tall choices, and content-heavy list, account, provider, ledger, and event
  widgets may auto-grow their initial settled height to a curated cap based on complete record count. Default
  boards remain intentionally balanced: partial rows retain their curated width and alignment rather than
  stretching a lone card across the board, provider-heavy boards prefer narrower taller cards, and a mixed-size
  stress or demonstration layout is never the product default.
gui_related: true
gui_classification_reason: This unit defines supported geometry, auto-growth, and visible default-board composition.
depends_on: [WS-009, WS-017]
unblocks: [WS-019, WS-020]
acceptance_criteria:
  - Every widget kind has a finite supported-size catalog with deterministic snapping for unsupported arbitrary geometry.
  - Eligible kinds expose curated tall sizes and content-heavy kinds may auto-grow only to a declared cap using complete-row thresholds.
  - Auto-growth and user-selected sizes persist the resolved supported geometry and semantic size identity, not transient pointer dimensions.
  - Partial default rows keep curated card widths and deliberate alignment; no lone card stretches to full width merely to fill the row.
  - Provider-heavy default boards use narrower, taller cards and complete rows rather than long low-density horizontal cards.
  - No routine curated size depends on an internal body scrollbar to reveal its promised content.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - tests/fixtures/usage_gui/presentation/curated_size_matrix.json (static contract fixture only)
  - tests/fixtures/usage_gui/presentation/room_disclosure_matrix.json (static contract fixture only)
  - "evidence_ref: Plans/.audits/audit-20260829-001-pmconcept7-widget-followup/browser/runs/t41-build8-focused-regression-rerun-2/report.json (SHA-256 4de0320f73010440560c5fed357df8b67f02188b6ca0a07c1ff3875de31485c0; exact Build8 concept/browser slice; readiness_claim=false)"
  - "evidence_ref: Plans/.audits/audit-20260829-001-pmconcept7-widget-followup/browser/runs/t41-build8-checked-in-width-matrix/report.json (SHA-256 54895af4fb7c7245bbc8c7d5772cd46dace251bfdfa023513fef490aa37e4dd0; exact checked-in Build8 concept/browser slice; readiness_claim=false)"
risk_class: arbitrary_widget_geometry_or_bad_defaults
reasoning_tier: high
context_scope: widget_curated_geometry_defaults
implementation_surfaces:
  - Plans/Widget_System.md
  - Plans/usage-feature.md
  - Plans/storage-plan.md
node_compile_hint:
  mode: widget_curated_geometry_defaults
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Concepts/pm7-tools/base/PM7-base.html (historical PM7 prototype lineage only)"
  - "Concepts/pm7-tools/build_pm7.py (historical PM7 prototype lineage only)"
  - "Concepts/PMConcept7.html (look-and-behaviour reference only)"
preserved_exact_tokens:
  - curated size
  - auto-grow
  - curated cap
  - partial rows
  - provider-heavy
negative_constraints:
  - Do not accept unsupported free-form geometry as settled canonical widget state.
  - Do not let a stale saved layout replace corrected defaults without explicit migration and validation.
owner_hints:
  - Plans/Widget_System.md
  - Plans/usage-feature.md
  - Plans/storage-plan.md
```

### WS-019 - Transactional Grid Resize And Reorder

```yaml
plan_unit_id: WS-019
unit_type: interaction_contract
status: accepted
owner_doc: Plans/Widget_System.md
canonical_text: >-
  Usage and Dashboard widgets share one transactional direct-manipulation contract. Amended 2026-10-10 (DL-186):
  every dashboard board is a board of the Usage board engine (WS-030), so wherever this unit says Usage board, Usage
  move, Usage resize, Usage board gravity or the current Usage room, it holds alike on the Usage page's board and on
  every dashboard board, whose one room is the board itself; the Dashboard-only rules below, its frozen-peer resize
  and its own settlement, are retired. Pickup snapshots the
  stable widget identity, committed order, and measured painted physical column/row footprint. Usage pointer resize
  installs a real in-flow placeholder initialized from that footprint, lifts a fixed-position preview, and then
  advances both the placeholder and lifted card to each last-painted supported footprint while visibly and
  deterministically repacking only obstructed peers. Unobstructed peers retain their rectangles during the held
  preview, and every peer remains mounted, painted, and free of entrance-animation replay. Usage board gravity
  (2026-10-09, Plans/Decision_Log.md#DL-176) applies once the gesture settles, never during the held preview, and
  inside the gesture's own single command rather than as a later step: the settled layout is the last-painted
  layout with gravity applied to it, in which each displaced peer takes the highest free place above where the
  resolver put it (preferring a place that overlaps the region the active card left, then the highest free place,
  then the column nearest its own) and every card except the active one floats straight up into any hole above
  it, in reading order, so the order is kept. The active card keeps the place and size the preview showed. Only
  cards shown at the current disclosure level float; cards of deeper levels and hidden cards keep their places
  unless a floated card lands on them, and then they step down. A Usage move lifts the card, which follows the
  pointer one to one, and shows a landing placeholder in the exact target slot while obstructed peers slide live;
  a Usage resize from its right, left or bottom edge or any corner (its top edge is the card's head and never
  resizes; amended 2026-10-17, DL-228, it read: from any edge or corner) shows a live outline of the snapped target size labelled with its preset
  name, or custom size, and its width x height in tracks and rows, while obstructed peers reflow live; on release
  the card morphs into place without overshoot and the cards gravity moves then float up into their settled
  places; every cancel path glides the card and its peers back to the snapshot. Under reduced
  motion each of these moves is instant. Dashboard resize retained its measured-footprint
  placeholder and frozen peers until 2026-10-10, when DL-186 retired it: a dashboard board resizes as the Usage
  board does. Reorder starts only from the dedicated widget handle, uses a fixed ghost plus a
  measured-footprint in-flow placeholder, and derives stable two-dimensional slot candidates from the frozen
  grid plus the stable before/after widget identities in the committed-order snapshot. Candidate coverage includes
  empty same-footprint cavities and lower rows rather than only positions adjacent in DOM order. Pointer targeting
  aligns the ghost's anchored top-left with a candidate origin, applies a real geometric hysteresis margin, and
  never lets overlapping multi-span candidate rectangles redirect the visible placeholder. Pointer and keyboard
  reorder use the same candidate model and visibly displace affected peers with interruptible motion while keeping
  those peer DOM nodes mounted; preview never replays their entrance animation or drops board/card opacity, and
  only one accepted settlement reconciles DOM order. A horizontal-only resize advances
  strictly to a supported curated size in the requested horizontal direction while minimizing companion-axis drift;
  the same rule applies at the far right, far left, and middle, including when peers must repack. A deliberate
  edge-limited drag may quantize one step, and an in-viewport pointer-up commits the last painted supported size
  even after same-direction overshoot beyond that size. Preview state is local and transient: no command, receipt,
  persisted event, layout write, or board
  settlement occurs before release, and no measured preview footprint becomes durable layout state. A changed
  pointer release commits the last painted pointer resize or reorder intent without a new pointer-up hit test or
  release-time retarget; a changed keyboard reorder drop commits its selected insertion intent; and each supported
  keyboard-resize activation settles its directional size intent atomically. Each changed terminal path dispatches
  exactly one existing `cmd.widget.resize` or
  `cmd.widget.move`, persists the settled state once, settles the board once, and emits no persisted domain event,
  including no `workspace.layout_changed`. On Usage that one command's settled result is the whole settled layout
  of the room: the last-painted layout plus gravity, that is the active card plus every peer the resolver or
  gravity moved, written once under its one receipt, with no per-peer command and no second gravity commit. Every Usage commit path applies the same
  gravity inside its own single command: pointer and keyboard move and resize, a size-picker preset (WS-017), and
  hiding or showing a card through `cmd.widget.remove` or `cmd.widget.add`. Tidy, chosen from a card's menu or the
  Customize panel, is the explicit full repack of the current Usage room (on a dashboard, its board, where every
  widget placed is shown at the deepest level, `diagnostics`): the cards shown at the current disclosure
  level take their first-fit places upward in reading order (their columns may change), then the cards of other
  levels and hidden cards take places below them. Tidy commits as one settled layout transaction through exactly
  one existing `cmd.widget.move` that carries the optional typed `arrange` field `{ mode: "tidy", detail }`
  (Plans/UI_Command_Catalog.md section 2.3), where `detail` is the disclosure level whose shown cards go first. Its
  `instance_id` names the card whose menu chose Tidy, or the room's first card in reading order when Tidy is chosen
  from Customize, and its `col` and `row` repeat that card's committed place, so the request names the room and the
  level and dictates no layout: the owner computes the repack itself, deterministically, from that room's committed
  layout, and rejects as stale a request whose place differs from the committed one. A `cmd.widget.move` without
  `arrange` is an ordinary move. The settled result carries every card Tidy moved, under one receipt, one settled
  write, and one board settlement; there is no per-card move command and no Tidy command. A Tidy that would move
  nothing, which the surface knows by computing the same deterministic repack, dispatches nothing, and an owner
  rejection leaves the pre-Tidy layout in place. Gravity and Tidy are Usage board behaviour, and since 2026-10-10
  (DL-186) every dashboard board is a Usage board, so gravity and Tidy apply on every board, the Usage page's and
  each dashboard's, each in one settled transaction as stated above; the earlier line that Dashboard keeps its own
  settlement is retired. Escape, pointer cancellation, `lostpointercapture`, blur, an invalid
  target, a pre-dispatch validation failure, or an unchanged release/drop restores the committed state and
  dispatches nothing. Once a changed action has dispatched, owner rejection or persistence-adapter failure retains
  exactly that one attempted command and its rejected/failed receipt, restores the authoritative visual state, and
  emits no settled event or successful owner-store write.
  Keyboard reorder uses explicit pickup, move, drop, Escape, and blur paths, with truthful `aria-grabbed` state,
  a visible picked-card outline, the shared two-dimensional candidate model, peer displacement, commit, rollback,
  and cleanup; it does not need to clone the pointer ghost or placeholder. Every path releases
  pointer capture and removes listeners, transient classes, ghost, placeholder, lifted state, preview styles,
  temporary board extent, and pending animation work without moving the document scroll position or leaving a
  blank scroll tail. Only one pointer or keyboard widget transaction may own the board at a time; every competing
  resize, pointer reorder, or keyboard pickup is rejected before focus, capture, class, or DOM mutation and cannot
  clear the first owner's active-operation state. A Dashboard widget remains owned by
  its Home Dashboard wrapper/host even when that wrapper participates presentation-only in an outer grid; the
  outer presentation grid never becomes the widget mutation owner. Amended 2026-10-10 (DL-186): that owner is the
  widget's board in its dashboard tab, and the panel holding the tab is the outer frame that never owns a widget
  mutation; one widget transaction at a time holds across every board on the page, so starting a gesture on one
  board first cancels any gesture still running on another.
  Amended 2026-10-17 (DL-228): on a focused card M starts a keyboard move and R a keyboard resize, and Enter
  or Space on the grip starts a move; arrows step one track or row, Shift+arrows four tracks while moving and
  the next preset while resizing; Enter or Space drops, and Escape, Tab or blur cancels. These keys are local
  and dispatch nothing until the drop. Each step and outcome is announced: "Picked up <name>. Arrows move it,
  Enter drops it, Escape puts it back.", "Resizing <name>. Arrows change the size, Shift steps through the
  presets, Enter keeps it, Escape cancels.", "Moved to column X, row Y", "Resized to <preset>, W by H",
  "<name> is back where it was" and, on an owner rejection, "The layout change was not accepted, so the card
  went back" (DL-230: a Usage widget is a card; the concept's copy says panel).
gui_related: true
gui_classification_reason: This unit defines the complete pointer and keyboard lifecycle for visible widget resize and reorder.
depends_on: [WS-004, WS-005, WS-009, WS-017, WS-018, DL-186]
unblocks: [WS-020]
acceptance_criteria:
  - "Pickup records the stable widget identity, committed order, and measured painted physical column/row footprint; Usage pointer resize initializes a real placeholder from that footprint, then paints each supported target footprint and visibly repacks only obstructed peers while the peer nodes, unobstructed peer rectangles, DOM order, opacity, entrance-animation state, and document scroll position remain stable. Usage keyboard resize remains one atomic changed-only settlement per supported directional key intent rather than a held live-preview mode. Amended 2026-10-10 (DL-186): a dashboard board's resize is the Usage board's, live preview included; no board keeps a frozen-peer resize."
  - Command, receipt, event, and persistence spies remain empty until a changed pointer release, keyboard reorder drop, or atomic keyboard-resize activation.
  - "Reorder begins only from the dedicated handle, uses a fixed ghost and measured-footprint in-flow placeholder for pointer operation, resolves stable two-dimensional candidates including empty same-footprint cavities and lower rows, binds pointer choice to the ghost's anchored top-left with geometric hysteresis, resolves before/after identities against the committed-order snapshot, and visibly displaces affected peers during pointer and keyboard preview while keeping their DOM nodes mounted, their opacity nonzero, and their entrance animations stopped; Usage pointer resize uses the same target-first deterministic slot projection so obstructed peers move during the held preview and the accepted settlement matches the last painted topology with Usage board gravity applied at settle, while Usage keyboard resize remains atomic (amended 2026-10-10, DL-186: on every board alike; no dashboard board keeps frozen resize peers). Horizontal-only pointer and keyboard input advances strictly along the requested supported curated axis with minimum companion-axis drift at far-right, far-left, and middle positions, an edge-constrained deliberate drag can express one step, and an in-viewport pointer release after same-direction overshoot commits the last painted supported intent."
  - A changed pointer release commits the last painted pointer intent without pointer-up re-hit-testing or retargeting, a changed keyboard reorder drop commits its selected insertion intent, and each supported keyboard-resize activation settles atomically; each changed terminal path emits exactly one existing `cmd.widget.resize` or `cmd.widget.move`, writes settled state once, triggers one board settlement, and emits no persisted domain event, including no `workspace.layout_changed`.
  - Escape, pointercancel, `lostpointercapture`, blur, invalid target, pre-dispatch validation failure, and unchanged release/drop restore the original state, emit no command, receipt, event, or persistence write, release capture, and remove every listener, class, ghost, placeholder, lifted state, preview style, and pending animation frame; an owner-rejected command or post-dispatch persistence-adapter failure instead retains exactly one attempted command and one rejected/failed receipt, restores authoritative geometry/order, emits no settled event or successful owner-store write, and performs the same complete transient cleanup.
  - Successful pointer and keyboard reorder restore the board's pre-transaction inline minimum-height value and leave scroll extent bounded to settled card geometry so repeated moves do not accumulate a blank tail; while one pointer or keyboard resize/reorder owns the board, every competing pointer, touch, pen, or keyboard acquisition is rejected before focus, capture, transient DOM, or class mutation, and cancelling the owner clears exactly that owner without leaving an operation flag.
  - Keyboard reorder supports pickup, directional move, drop, Escape, and blur; `aria-grabbed` is true only while pickup is active and returns to false after drop or cancellation, the picked card has a visible focus/outline state, and its two-dimensional candidate choice, live peer displacement, changed-only commit, rollback, and cleanup match pointer reorder without requiring a cloned pointer ghost or placeholder.
  - "The contract applies to Usage widgets and widgets owned by the Home Dashboard wrapper/host, even when that wrapper participates presentation-only in an outer grid; the outer grid does not own widget mutations, and moving or resizing the Dashboard surface itself remains Home workspace authority. Amended 2026-10-10 (DL-186): the owner is the widget's board in its dashboard tab, the panel never owns a widget mutation, and moving or sizing the tab or its panel is the home panels' (F3-630)."
  - "Amended 2026-10-10 (DL-186): on every dashboard board gravity, Tidy and the live move and resize previews behave exactly as on the Usage page, each changed action committing one settled transaction under one receipt; no dashboard board keeps its own settlement or a frozen-peer resize, and a gesture started on one board cancels a gesture still running on another."
  - "Usage board gravity: after any changed Usage move, resize, preset, hide, or show, no shown card other than the one the action placed has an empty hole directly above it that it could float into, reading order is unchanged among the cards gravity moved, cards of deeper disclosure levels and hidden cards move only to step down from a floated card, no unobstructed peer moves during the held preview, the active card settles where the preview showed it, the committed layout equals the last-painted layout with gravity applied, and exactly one command and one receipt carry the whole settled room."
  - "Usage move and resize previews: a move lifts the card and follows the pointer one to one with a landing placeholder in the exact target slot; a resize from every edge and corner shows a live snapped outline labelled with the preset name or custom size and its width x height; only obstructed peers slide or reflow live; release morphs into place without overshoot and the cards gravity moves then float up; every cancel path glides card and peers back to the snapshot; reduced motion makes each of these instant; and none of it dispatches or writes before release."
  - "Tidy repacks the current Usage room first-fit upward in reading order, shown cards first, and commits through exactly one existing cmd.widget.move carrying arrange { mode: tidy, detail }, whose instance_id is the card Tidy was chosen from (or the room's first card from Customize) at its committed place, whose repack the owner computes from the committed layout, and whose settled result carries every moved card, with one receipt, one settled write, and one board settlement; a Tidy that moves nothing dispatches nothing, and command, receipt, and persistence spies show no per-card move and no other command."
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - tests/fixtures/usage_gui/presentation/interaction_transaction_matrix.json (static contract fixture only)
  - Plans/shared_runtime_command_contract_fixtures.json (static command/receipt/event-count fixture only)
  - "evidence_ref: Plans/.audits/audit-20260829-001-pmconcept7-widget-followup/browser/runs/t41-build8-focused-regression-rerun-2/report.json (SHA-256 4de0320f73010440560c5fed357df8b67f02188b6ca0a07c1ff3875de31485c0; historical predecessor evidence only; superseded for Usage resize-preview timing; readiness_claim=false)"
  - "verification_pending: fresh artifact-bound live occupied-neighbor preview, settlement-parity, cancellation, failure, and motion evidence; readiness_claim=false"
risk_class: widget_preview_leaks_or_multi_commit
reasoning_tier: high
context_scope: widget_transactional_resize_reorder
implementation_surfaces:
  - Plans/Widget_System.md
  - Plans/usage-feature.md
  - Plans/UI_Command_Catalog.md
  - Plans/UI_Wiring_Rules.md
node_compile_hint:
  mode: widget_transactional_resize_reorder
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Concepts/pm7-tools/base/PM7-base.html (historical PM7 prototype lineage only)"
  - "Concepts/pm7-tools/build_pm7.py (historical PM7 prototype lineage only)"
  - "Concepts/pm7-tools/widget_live_resize_preview_source.py (historical Usage live resize-preview prototype lineage)"
  - "Concepts/PMConcept7.html (look-and-behaviour reference only)"
  - "Concepts/usage-redesign/src/js/40-board.js (Usage redesign board: resolver, gravity, Tidy, move and resize previews; source-lineage-only)"
  - Plans/Decision_Log.md#DL-176
preserved_exact_tokens:
  - cmd.widget.resize
  - cmd.widget.move
  - placeholder
  - fixed-position
  - pointercancel
  - lostpointercapture
  - last painted intent
  - persisted=false
  - aria-grabbed
  - pickup
  - drop
  - Usage board gravity
  - Tidy
  - arrange
negative_constraints:
  - Do not dispatch a command, receipt, persisted event, or storage write for pointer-preview frames.
  - Do not mint PM7-only resize or move commands.
  - Do not commit Usage board gravity or Tidy as per-card commands, as a second commit after the gesture's own, or through a new command.
  - Do not let gravity change the reading order of the cards it moves or float a card of a deeper disclosure level or a hidden card into view.
  - Do not move an unobstructed peer during a held Usage preview, and do not let a Tidy request carry or dictate the repacked layout; the owner computes it.
  - Do not persist or treat live Usage preview repack as settlement, reconcile DOM order, or remount peers during preview.
  - Do not keep a dashboard-only settlement, gravity rule, Tidy rule or frozen-peer resize beside the Usage board's (DL-186).
  - Do not remount reorder peers, replay their entrance animation, or black out the board during preview.
  - Do not retain preview-only board minimum height after either commit or rollback, or allow simultaneous widget-operation controllers.
  - Do not derive reorder placement from stale nominal spans, persist a measured preview footprint, or re-hit-test and retarget at pointer-up.
  - Do not let an outer presentation grid replace the Home Dashboard wrapper as widget mutation owner.
  - Do not claim the protected generated artifact passes this interaction contract without fresh browser execution and raw receipts.
compatibility_only_notes:
  - "Retired 2026-10-10 (DL-186), kept verbatim for lineage (canonical text): Dashboard resize retains its measured-footprint placeholder and frozen peers."
  - "Retired 2026-10-10 (DL-186), kept verbatim for lineage (canonical text): Gravity and Tidy are Usage board behaviour; Dashboard keeps its own settlement."
  - "Retired 2026-10-10 (DL-186), kept verbatim for lineage (end of the first acceptance criterion): Dashboard resize retains its measured placeholder and frozen peers."
  - "Retired 2026-10-10 (DL-186), kept verbatim for lineage (end of the reorder acceptance criterion): while Usage keyboard resize remains atomic and Dashboard resize peers remain frozen."
  - "Retired 2026-10-10 (DL-186), kept verbatim for lineage (negative constraint): Do not persist or treat live Usage preview repack as settlement, reconcile DOM order, or remount peers during preview; do not generalize Usage live resize repack to Dashboard resize."
stale_retired_dispositions:
  - "Amended 2026-10-10 (DL-186): dashboard boards run the Usage board engine, so gravity, Tidy and the live previews apply on every board; the line that Dashboard keeps its own settlement, the frozen-peer Dashboard resize and the negative constraint against generalizing the Usage live resize to Dashboard resize are retired."
owner_hints:
  - Plans/Widget_System.md
  - Plans/UI_Command_Catalog.md
  - Plans/UI_Wiring_Rules.md
```

`UsageWidgetLayoutRecord` is a closed public record. Its required serialized
field set is exactly `layout_schema_version`, `default_set_version`, `host_id`,
`room_id`, `widget_id`, `visible`, `order_index`, `slot_id`, `geometry_id`,
`semantic_tier_id`, `preset_id`, `configuration_refs`, and
`committed_revision`. `layout_schema_version` is an integer greater than or
equal to 1; `default_set_version` is a non-empty string; `host_id` is the exact
string `usage`; `room_id`, `widget_id`, `geometry_id`, and
`semantic_tier_id` are non-empty stable strings; `visible` is boolean;
`order_index` is a non-negative integer; `slot_id` is a non-empty stable string
or null; `preset_id` is a non-empty supported-preset string or null;
`configuration_refs` is a sorted unique array of non-empty non-secret strings;
and `committed_revision` is a non-negative integer. No field other than
`slot_id` and `preset_id` is nullable. The record is versioned before this
closed field set changes.

Amended 2026-10-10 (DL-186): a dashboard board writes the same closed record,
field for field. On the Usage page `host_id` is `usage`; on a dashboard board it
is `home.dashboard`, and `room_id` is the board id, which never equals a Usage
room id (WS-030). The field set is unchanged, so the record keeps its version.

### WS-020 - Widget Layout Namespace And Semantic Size Identity

```yaml
plan_unit_id: WS-020
unit_type: data_contract
status: accepted
owner_doc: Plans/Widget_System.md
canonical_text: >-
  Widget layout has one schema family with separate canonical namespaces per host. Usage writes
  `widget_layout:v1:usage`; Dashboard writes `widget_layout:v1:dashboard`; Home shell surfaces remain under
  `home_workspace_layout.v1`. The named public Usage contract is `UsageWidgetLayoutRecord`. Its required closed
  fields are `layout_schema_version`, `default_set_version`, `host_id`, `room_id`, `widget_id`, `visible`,
  `order_index`, `slot_id`, `geometry_id`, `semantic_tier_id`, `preset_id`, `configuration_refs`, and
  `committed_revision`, with the exact types and nullability defined immediately above this unit. Each
  `configuration_ref` resolves to an existing stable, non-secret widget-configuration identity governed by WS-004
  and UF-060; filter payloads remain in that configuration record and are not copied into the layout record. Preview
  rectangles, pointers or pointer coordinates, ghosts,
  placeholders, animation state, and drafts or per-frame drafts are forbidden. A widget operation cannot write
  the Home surface record, and a Home surface operation cannot write a widget-layout record.
  `preset_id` names the widget kind's size preset (WS-017) whenever the settled geometry equals one of that kind's
  presets, whether the size came from the size picker or from a pointer or keyboard resize, and is null for any size
  in between; a "custom size" label is presentation only and is never stored as a `preset_id`. A `preset_id` is the
  preset's stable id in the kind's preset table (`compact`, `standard`, `expanded`, `wide`, `full`, `strip`,
  `panel`, `ladder`, or `band`), never its display name. Choosing a preset in
  the size picker dispatches one `cmd.widget.resize` carrying that preset's geometry and `preset_id`, and the settled
  record stores the `preset_id` together with the `semantic_tier_id` of the content tier the size shows. A chosen
  preset survives reload and look change: the card restores with its stored `preset_id`, and when a look change moves
  the board's pitch or a fit preset's measured height, the card keeps that `preset_id` and takes the preset's newly
  resolved geometry instead of becoming a custom size; a keyboard resize that lands on a preset stores it the same
  way. On restore, a saved
  `preset_id` that the kind's current preset table no longer lists maps to the current preset with the same geometry,
  or else to null with the geometry snapped by WS-018; a stored `preset_id` never brings back a retired preset. When
  the default boards or a kind's preset table change, `default_set_version` changes, and a saved Usage layout from an
  older set keeps its visibility and configuration and takes the new default geometry once.
  Amended 2026-10-09 (DL-180): Dashboard writes one namespace per board, `widget_layout:v1:dashboard:<board_id>`
  with `host_id` `dashboard:<board_id>`, Home shell surfaces live in `home_workspace_layout.v2`
  (Plans/storage-plan.md#SP-330), and `widget_layout:v1:dashboard` and `home_workspace_layout.v1` are read only as
  migration inputs (WS-030).
  Amended 2026-10-10 (DL-186): a dashboard board is a board of the Usage board engine and writes this record family
  per project under `widget_layout:v1:<project_id>:<board_id>`; its envelope's `host_id` is `home.dashboard`, its
  `project_id` is the board's real project, and each record's `room_id` is the board id. The 2026-10-09
  `widget_layout:v1:dashboard:<board_id>` with `host_id` `dashboard:<board_id>` was never written, and
  `widget_layout:v1:dashboard` is converted into no board (WS-030).
  Amended 2026-10-17 (DL-228): Reset this room and Reset every room, from the head's Cards menu (DL-230), put back the
  curated default set of that room or of every room: its positions, sizes and which cards show; a card's
  configuration stays as WS-004 keeps it. Each is one cmd.widget.reset_layout with scope room or all
  (UI_Command_Catalog section 2.3), writing every affected record of that board once under one receipt; on a
  dashboard the board is its one room.
gui_related: true
gui_classification_reason: The record determines restored widget placement, semantic size, and cross-surface ownership.
depends_on: [UF-060, WS-004, WS-009, WS-018, WS-019, DL-186]
unblocks: []
acceptance_criteria:
  - "Usage and Dashboard restore from their own namespaces while Home surfaces restore only from home_workspace_layout.v2 (amended 2026-10-09, DL-180: Plans/storage-plan.md#SP-330 reads home_workspace_layout.v1 only as a migration input)."
  - "UsageWidgetLayoutRecord is the named public contract for a settled Usage widget layout and has exactly the required fields layout_schema_version, default_set_version, host_id, room_id, widget_id, visible, order_index, slot_id, geometry_id, semantic_tier_id, preset_id, configuration_refs, and committed_revision, including semantic size or preset identity in addition to supported geometry so adaptive content restores deterministically; every configuration_ref resolves to an existing stable, non-secret widget-configuration identity governed by WS-004 and UF-060, and filter payloads remain in the configuration record rather than becoming new UsageWidgetLayoutRecord fields."
  - "No preview rectangle, pointer or pointer coordinate, ghost, placeholder, animation state, draft, or per-frame draft appears in UsageWidgetLayoutRecord."
  - A widget mutation never writes Home surface placement and a Home surface mutation never writes Usage or Dashboard widget placement.
  - Migration rejects, quarantines, or deterministically maps unsupported old geometry before it can override corrected current defaults.
  - "A settled size equal to one of the kind's presets stores that preset_id whatever path produced it, any other size stores null, a size-picker choice commits one cmd.widget.resize with the preset's geometry, a retired saved preset_id restores to the same-geometry preset or to null with snapped geometry, and a default_set_version change resets saved Usage geometry once while keeping visibility and configuration."
  - "A stored preset_id is the preset's table id, never its display name; a chosen preset, including one a keyboard resize landed on, keeps its preset_id after a reload and after a look change that moves the pitch or a fit height, re-resolving to that preset's current geometry rather than to a custom size."
  - "Amended 2026-10-10 (DL-186): a dashboard board's records have the same closed field set, host_id home.dashboard and room_id the board id, under its project's widget_layout:v1:<project_id>:<board_id>; the Usage page's records keep host_id usage under widget_layout:v1:usage."
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - tests/fixtures/usage_gui/presentation/persistence_migration_matrix.json (static contract fixture only)
  - tests/fixtures/pm7_shared/home_workspace_transaction.json (static owner-boundary fixture only)
  - "evidence_ref: Plans/.audits/audit-20260829-001-pmconcept7-widget-followup/browser/runs/t41-build8-focused-regression-rerun-2/report.json (SHA-256 4de0320f73010440560c5fed357df8b67f02188b6ca0a07c1ff3875de31485c0; exact Build8 concept/browser slice; readiness_claim=false)"
  - "evidence_ref: Plans/.audits/audit-20260829-001-pmconcept7-widget-followup/browser/runs/t41-build8-checked-in-width-matrix/report.json (SHA-256 54895af4fb7c7245bbc8c7d5772cd46dace251bfdfa023513fef490aa37e4dd0; exact checked-in Build8 concept/browser slice; readiness_claim=false)"
risk_class: widget_layout_namespace_or_semantic_size_drift
reasoning_tier: high
context_scope: widget_layout_namespace_semantic_size
implementation_surfaces:
  - Plans/Widget_System.md
  - Plans/storage-plan.md
  - Plans/home_workspace_layout.schema.json
node_compile_hint:
  mode: widget_layout_namespace_semantic_size
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Concepts/pm7-tools/base/PM7-base.html (historical PM7 prototype lineage only)"
  - "Concepts/pm7-tools/build_pm7.py (historical PM7 prototype lineage only)"
  - "Concepts/PMConcept7.html (look-and-behaviour reference only)"
  - "Concepts/usage-redesign/src/js/42-cards.js and 40-board.js (preset ids, the chosen preset kept over reload; branch concept/usage-pm7-c-presets-20261009; source-lineage-only)"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/usage-mockups-20261001/lane-reports-20261010/c-presets-REPORT.md, SHA-256 505de34e60acd8d9efce08e5ec392f58c574db75cbadf5846a34c42424567a3e (fix cycles 1 and 2: preset names kept over reload, keyboard resize, and look change)"
  - Plans/Decision_Log.md#DL-176
preserved_exact_tokens:
  - widget_layout:v1:usage
  - widget_layout:v1:dashboard
  - home_workspace_layout.v1
  - UsageWidgetLayoutRecord
  - committed revision
  - semantic tier
  - preset
  - widget_layout:v1:<project_id>:<board_id>
  - home.dashboard
negative_constraints:
  - Do not create a second Widget layout store or a PM7-only persistence namespace.
  - Do not serialize transient interaction state.
  - Do not admit preview rectangles, pointers, ghosts, placeholders, animation, or drafts into UsageWidgetLayoutRecord.
  - Do not store a presentation label such as custom, or a preset's display name, as a preset_id, or restore a preset the kind no longer offers.
stale_retired_dispositions:
  - "Amended 2026-10-10 (DL-186): a dashboard board writes widget_layout:v1:<project_id>:<board_id> with host_id home.dashboard and room_id the board id; the 2026-10-09 per-board key and host_id were never written."
owner_hints:
  - Plans/Widget_System.md
  - Plans/storage-plan.md
```


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

Amended 2026-10-10 (DL-186): Jared answered the dashboard questions (D10 P1 to P13) and let people make, rename and
delete their own dashboards with presets they can save (D35). WS-030 is rewritten to the boards as the panels thread
built them: one Usage board engine for every board, per-project keys, several widget sources, Reset and Start from
with `set_id`, per-user presets, custom dashboards, the reopen-list rule and named-layout snapshots. At the Usage
thread's request this addendum also amends WS-019 (gravity, Tidy and the live previews on every board; the Dashboard
line that kept its own settlement and its frozen-peer resize retire) and WS-020 (the dashboard record's `host_id` and
`room_id`), and adds dated notes to WS-009, WS-013, sections 2 and 3, the closed record above WS-020 and the Home
Workspace boundary addendum. `Plans/usage-feature.md#UF-107` carries the one line that runs live readings on
dashboards.

### WS-030 - Dashboard Tabs, Their Boards And One Widget Layout Per Board

```yaml
plan_unit_id: WS-030
unit_type: requirement
status: accepted
owner_doc: Plans/Widget_System.md
canonical_text: >-
  A dashboard is a tab kind in the home centre (Plans/FinalGUISpec.md#F3-635, #F3-638), and each dashboard tab shows
  one board (DL-180, D10). Rewritten 2026-10-10 (DL-186): Jared's answers to the dashboard questions P1 to P13 and
  D35 settle the boards as the panels thread built them. One engine: every board except Agents is a board of the
  Usage board engine, the engine the Usage page runs, one board per tab; there is no second dashboard engine, board
  model or settlement. Boards: home, metrics and monitoring are built-in engine boards; agents is the fourth built-in
  board, drawn by the dashboard kind itself with no widget store, no catalogue and no widget command, its Show filter
  (all, working, needs, waiting, done) saved with its tab (P9, lead ruling F7); the dashboards a person makes are
  dash-<n>. A board is a project's widget board with a stable board_id; its tab id is `dashboard:<board_id>`, and one
  board is at most one tab in the workspace: opening a board that is already open reveals its tab where it is
  (F3-634). The board id, never the tab id, is the domain
  reference a dashboard tab keeps in the Home layout record (Plans/storage-plan.md#SP-330); the tab saves only that, and
  Agents its Show filter too. No board takes the id usage (the Usage page's own board), the id dashboard or a Usage room id,
  so a board id in a widget command is never read as a Usage room. `dashboard:home` is the default board, the pinned
  Home dashboard of the default layout (F3-630). The "+" menu's Dashboard row body opens or reveals `dashboard:home`, and its sub-row
  lists Home, Metrics, Monitoring, Agents, this project's own dashboards by name and New dashboard, with no cap
  (Plans/UI_Command_Catalog.md#UCC-200).
  Custom dashboards (D35): a person can make, rename and delete their own dashboards. New dashboard, in that sub-row
  and in the tab's Board menu, opens a new board in a new tab through the one opening module (UCC-200); the board
  takes the next unused number and starts empty (P13). Its name is "Dashboard <n>" until the person renames it. The
  name is kept per project with the board, trimmed, with runs of white space made one, at most 80 characters, and the
  default name is not stored. Rename dashboard... in the Board menu sets the name and renames the tab through
  cmd.panel_tab.rename; renaming the tab sets the name too, and clearing that rename clears it. Delete dashboard...,
  after a confirm, closes the tab (cmd.panel_tab.close), drops it from the reopen list and forgets the board: its
  stored widgets, the set-aside copy of an unreadable envelope and its name; the dashboard also leaves the "+" menu
  and the page's catalogue. Rename and delete add no command family. Home, Metrics, Monitoring and Agents are never
  renamed as boards and never deleted: Home, Metrics and Monitoring offer Reset widgets, and Agents, which has no
  widgets, resets only its filter.
  Storage (P5): board contents are kept per project. Each engine board's widgets, their sizes, order, visibility and
  configuration, its view (range and scope) and the set it was started from are one envelope of the one widget-layout
  record family (WS-020) under `widget_layout:v1:<project_id>:<board_id>`, and an envelope that cannot be read is set
  aside under that key with `:quarantine` added. The project_id is one to 64 characters with no white space and no
  colon. The envelope's `host_id` is `home.dashboard`, its project_id is the board's real project and each record's
  `room_id` is the board id; the Usage page keeps its own `widget_layout:v1:usage`, untouched. A project switch
  writes the open boards to the old project's keys and loads them from the new project's. A board saved by the
  concept's first build of these boards under the unscoped `widget_layout:v1:<board_id>` is adopted once, by the
  first project that shows that board while its own key is missing, and the old key is removed. Plans/storage-plan.md
  registers both families and the adoption. The 2026-10-09 form
  `widget_layout:v1:dashboard:<board_id>`, with `host_id` `dashboard:<board_id>`, was never written, so nothing
  migrates from it. Today's single Dashboard layout `widget_layout:v1:dashboard` holds the old Home widgets, which
  leave Home (P1); it is converted into no board and stays only a read-only record and rollback backup, like
  `dashboard_layout:v1`. A board's widget layout is never written into the Home layout record, and the Home layout
  record is never written by a widget operation (DR-066).
  Commands and sources (P3): widget command payloads are unchanged. Every cmd.widget.* row inside a dashboard tab
  names its board in the payload's existing `room` field (for example cmd.widget.add { room, widget_id } with room the
  board id), changes only that board, commits only to its key and emits no `workspace.layout_changed`, which stays the
  Home layout's event (Plans/Contracts_V0.md#CV-361). Home's panels, tabs and chat column are not widgets: no panel or
  tab command reaches a board, no cmd.widget.* row reaches a panel or tab, and a widget gesture never moves or sizes a
  panel (DR-066). Boards, their catalogue and the layout record are built for several widget sources: a widget's
  source is the prefix of its id (`<source>:<id>`), Usage widgets keep their bare ids, and the engine keeps one
  registry of sources, each with its label, its catalogue and the way its widgets are built. Usage is the one source
  today; Orchestrator widgets join as a source after the Orchestrator page's own redesign and follow this same kind
  contract, and other sources may follow.
  Catalogue: Add widget sits in the tab's header row (F3-635) and offers every widget the board can be given: one
  section per Usage room in room order, then the Usage widgets of no room, then one section per other source under its
  label. A widget already on the board shows checked and cannot be added again; a pick adds it to that board only
  (cmd.widget.add). Any Usage widget can be placed on any board (Plans/usage-feature.md#UF-062 wins over the
  four-widget catalogue of F3-279, which F3-638 supersedes). The old Home widgets, `widget-orchestrator-progress`,
  `widget-active-lanes`, `widget-recent-results` and `widget-custom-metrics`, leave Home (P1, option B): no board
  offers them and no Home (current) board keeps them until Orchestrator widgets join as a source.
  Reset and Start from (P4): Reset widgets returns a board to its own default set through cmd.widget.reset_layout
  { scope: 'room', room: <board_id> }. Start from replaces a board's widgets with a chosen set through the same command
  with the field `set_id` naming it: { scope: 'room', room: <board_id>, set_id }. The sets, in the order the board
  lists them: `default`, the board's own set (for Home, Metrics and Monitoring the set built for that board, P13, and
  empty for a dashboard a person made); the 13 Usage room sets, `room:<room_id>` in Usage room order (overview,
  plans, costs, accounts, free, context, analytics, ledger, attention, cache, tools, signals, authority);
  `host:dashboard`, the dashboard starter; then `user:<preset_id>` for each preset the person saved. Start from shows
  them in four groups, in this order: This dashboard (`default`), Dashboard starter (`host:dashboard`), Usage rooms
  (the 13 room sets in room order) and Your presets (Plans/FinalGUISpec.md#F3-638). Which Usage widgets Home's,
  Metrics' and Monitoring's own sets hold is Usage content that usage-feature.md owns; no Usage unit lists them yet,
  so the sets as built are concept lineage only and naming them is an open question for Usage. A reset with no
  set_id is the default set. The envelope keeps the set_id of any set other than default. Choosing a set that no
  longer exists changes nothing and says so.
  Amended 2026-10-10 (lead ruling on the Undo after Start from): the Undo in the notice that follows Start from
  (Plans/FinalGUISpec.md#F3-638) dispatches cmd.widget.reset_layout { scope: 'room', room: <board_id>,
  restore_revision }, restore_revision being the board's committed layout revision (its committed_revision, WS-020)
  just before that Start from: one receipt, offered only while the notice is up (8 s, held on pointer or focus).
  restore_revision and set_id never travel together. The owner puts back exactly that revision's records, and a restore is refused without dispatch when any other change was committed on the board since, except the preset hold's settling resizes, and Undo is disabled with its reason. Like every widget
  command it emits no workspace.layout_changed (Plans/Contracts_V0.md#CV-361).
  Presets (D35, Jared: "With savable presets."): a person can save a board's arrangement as their own preset, rename
  it and delete it. Presets belong to the person, not the project: they are kept in the per-user family
  `widget_presets:v1` and shown in Start from on every dashboard of every project. A preset holds its id, its name,
  when it was saved, the board it was saved from, the layout of the widgets shown at each board class (S, M, L and XL,
  WS-017), each widget's size preset and each widget's configuration; it never holds the board's view. A name is
  trimmed, with runs of white space made one, at most 80 characters; the save offers the dashboard's name made
  unique, and a preset with no name is called "Preset <n>". Saving, renaming and deleting a preset are typed local
  actions with no command, receipt or event (ui.widget_preset.save, ui.widget_preset.rename, ui.widget_preset.delete;
  lead ruling F2); applying one is Start from with set_id `user:<preset_id>`. A board that started from a preset keeps
  its widgets when the preset is deleted.
  View (P2): each board has its own range (5 hours, 24 hours, 7 days or 30 days) and scope (all accounts, work,
  personal, or one provider with accounts), kept in its envelope and set from its Board menu. Changing them is view
  state, the typed local action ui.widget_board.set_view with no receipt and no event (lead ruling F1), like the Usage
  page's remembered Live / Paused. A widget that follows its board reads the board's range and scope; a range or scope
  set in a widget's own configuration still wins, as it does over the page's on the Usage page
  (Plans/usage-feature.md#UF-060; D10 design section 3.5). A board has no rooms and no room change, and it shows every
  widget placed on it at every disclosure level.
  Behaviour: inside the tab the board is the Usage widget board, the same on every board as on the Usage page: its
  snapping grid and its track count from the board's own measured width, never the window (F3-638); its curated sizes
  and size presets (WS-017, WS-018); its gestures, gravity and Tidy, each one settled transaction (WS-019, which DL-186
  amends so that no dashboard keeps its own settlement). The per-kind preset table tested at 400, 550 and 700 px of
  board width is WS-017's one per-kind preset table (DL-176). One widget transaction at a time holds across every
  board on the page. A board's first show plays the Usage board's calm
  reading-order entrance, instant under Reduced Motion (P7); a board has no room film. Boards sit on Home's own tab
  surface, not the Usage page's ground, and every look's widget plates are drawn for that surface (P11, F3-638). Live
  readings run on dashboards too, per board, under the Usage page's idle rule, and the Live choice is the Usage
  page's one switch (P12, Plans/usage-feature.md#UF-107). The lab-only Play the next hour, which P12 also runs on
  dashboards, stays a demo control as UF-107 classifies it, never a product behaviour, so no criterion of this unit
  gates it. A board that is not shown does no work,
  live beats included, and catches up when it is shown again. Details on a dashboard card opens the Usage page at the
  widget's home room with that widget's inspector open (P8), and a card's rows that lead into a Usage room open the
  Usage page at that room; neither changes the Usage page out of sight.
  Closing and named layouts (P6): closing a dashboard tab closes the tab only, and its board keeps its key while the
  tab can be reopened. When a dashboard a person made leaves the reopen list and is not open as a tab, its key, its
  set-aside copy and its name are deleted; the built-in boards keep theirs. A named layout keeps the boards of the
  dashboard tabs it holds: saving it snapshots each board's envelope, or none, and applying it restores them, while a
  named layout saved before this applies as it did. The snapshot is capped at 64 KB per named layout (lead ruling F3):
  a bigger save keeps the layout without its boards, records how many bytes it left out and says so;
  Plans/storage-plan.md#SP-330 owns that record. The Guided Tour's snapshots take the Home board's widgets with the
  panels, per project (Plans/Planning_Wizard.md#PWIZ-035).
  This supersedes WS-009's one Dashboard namespace and WS-013's limit to some Usage widgets, both amended in place,
  and amends the Home Workspace boundary addendum's sentences that assume one dashboard. DL-186 retires the panels
  concept's stand-in board with its grid numbers and reset spans, and the conversion of `widget_layout:v1:dashboard`
  into the Home board; their 2026-10-09 and 2026-10-10 text is kept below for lineage only.
  The Dashboard plus sub-row keeps Home, Metrics, Monitoring, Agents and New dashboard inline; one Your
  dashboards row opens this project's custom dashboards by name with their widget counts and search above 7.
  Custom ids run from dash-1 to dash-9999: the next number is one above the largest across open tabs, the
  reopen list, this project's stored boards, still-unadopted unscoped stores, names and live boards; beyond
  9999 the open resolves to Home. An unknown board opens Home, dashboard:new creates one and
  dashboard:current resolves to dashboard:home. Dashboard names are unique against built-ins and the
  project's custom dashboards, and preset names against the person's presets, using suffixes 2, 3 and so on;
  an empty or default dashboard name drops its stored entry. A project switch rebinds every mounted engine
  board whose tab survives, hidden boards too, reloads custom names and refreshes the catalog; a board
  unmounted by the switch writes to its prior project. Add widget groups the 13 Usage rooms in order, then
  More widgets for Usage widgets without a room, then other sources under their labels, with no second
  catalogue. A Reset widgets that changed anything offers the same Undo as Start from. It retains the
  envelope and committed revision just before that operation, writes that exact envelope back in this
  project after acceptance and reads it, with one cmd.widget.reset_layout { scope: 'room', room: <board_id>,
  restore_revision }, one receipt and no workspace.layout_changed; restore_revision never travels with
  set_id. Any other committed board change makes Undo unavailable; the preset hold's settling resizes do
  not. The notice ends on later widget change or commit other than those resizes, Escape, project switch or
  unmount, or after its 8 s offer, held on pointer or focus then 3 s after. Eligibility is checked on each
  commit that leaves it up, pointer or focus entering, and click; stale revision, invalid envelope or a gone
  board dispatches nothing and disables Undo with its reason. A named layout applies a captured board
  envelope only to the project it was saved for, skips another project's envelope and leaves a custom board
  not held by that layout unchanged. F3-638 owns the header facts, Live mark, Board and Start from menu
  rows, empty-board invitation, focus return and measured sizes.
gui_related: true
gui_classification_reason: Defines which boards a person can open, make, rename and delete as dashboard tabs, what each can show, and how each board's widget layout, view and presets are kept and restored.
split_recommended: false
depends_on: [DL-180, DL-186, F3-635, F3-638, WS-009, WS-013, WS-017, WS-019, WS-020, UF-062, UF-107]
unblocks: [ATS-075, GRRC-040, PWIZ-035]
acceptance_criteria:
  - "Several dashboard tabs can be open at once, each showing a different board, and opening a board that is already open reveals its tab instead of opening a second one."
  - "A new project shows Home, Metrics, Monitoring, Agents and New dashboard in the \"+\" menu's Dashboard sub-row, `dashboard:home` is pinned in the default layout, each sub-row opens or reveals its board's tab, and the row body opens or reveals `dashboard:home`."
  - "Every board but Agents runs on the Usage board engine: its grid, sizes, size presets, gestures, gravity, Tidy, entrance, live readings and idle rule match the Usage page's, and no dashboard keeps its own settlement."
  - "Each engine board restores from and writes to its project's `widget_layout:v1:<project_id>:<board_id>` with `host_id` `home.dashboard` and `room_id` the board id, a project switch re-keys every open board, an unreadable envelope is set aside under `:quarantine`, and no dashboard widget state appears in the Home layout record."
  - "Nothing is converted from or written to `widget_layout:v1:dashboard`, nothing is read from or written to `widget_layout:v1:dashboard:<board_id>`, and an unscoped `widget_layout:v1:<board_id>` is adopted once, by the first project that shows that board, and then removed."
  - "New dashboard opens an empty board with the next unused number, named \"Dashboard <n>\"; Rename dashboard... and renaming its tab set the stored name through cmd.panel_tab.rename; Delete dashboard... asks first, closes the tab, drops it from the reopen list and forgets its key, set-aside copy and name; Home, Metrics, Monitoring and Agents offer neither Rename dashboard... nor Delete dashboard...."
  - "Reset widgets dispatches one cmd.widget.reset_layout { scope: 'room', room } that returns the board to its default set; each Start from row dispatches one cmd.widget.reset_layout with its set_id; Start from shows the sets in F3-638's four groups, This dashboard (default), Dashboard starter (host:dashboard), the 13 Usage room sets in room order, then the person's presets; the envelope stores every set_id but default."
  - "The Undo after Start from dispatches one cmd.widget.reset_layout { scope: 'room', room, restore_revision } with the board's committed layout revision just before that Start from and no set_id, only while its notice is up; the owner puts back exactly that revision's records, a restore is refused without dispatch when any other change was committed on the board since, except the preset hold's settling resizes, and Undo is disabled with its reason, and no workspace.layout_changed is emitted (amended 2026-10-10, lead ruling)."
  - "Saving, renaming and deleting a preset dispatch no command and write only `widget_presets:v1`; a preset holds no view, appears in Start from on every dashboard of every project, and applying it dispatches cmd.widget.reset_layout with set_id user:<preset_id>."
  - "Changing a board's range or scope runs ui.widget_board.set_view, writes only that board's envelope and dispatches no command, receipt or event; each board keeps its own range and scope."
  - "Add widget offers every Usage widget grouped by Usage room, and any other registered source's widgets under that source; a widget on the board cannot be added twice; no board offers an old Home widget; every widget command inside a dashboard tab names its board in `room`, changes only that board and emits no `workspace.layout_changed`; a panel or tab command changes no board."
  - "A board's first show plays the reading-order entrance, instant under Reduced Motion; a hidden board does no work; live readings run per board; boards are drawn on Home's tab surface in every look; Details opens the Usage page at the widget's home room with its inspector open."
  - "Agents has no widget store, catalogue or widget command, and its Show filter is saved with its tab."
  - "Closing a dashboard tab keeps its board; a dashboard a person made that leaves the reopen list while not open loses its key, set-aside copy and name; a named layout restores its dashboard boards, and a save over 64 KB keeps the layout without its boards and says how many bytes it left out."
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
  - "Plans/Decision_Log.md#DL-186"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/canon-inputs/followup/DECISIONS-ADDENDUM-3.md, SHA-256 ecd18c2f2d8ac8f714f9578170d321584fb871e3d19601a68061898ffd6759a9 (D35)"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/canon-inputs/followup/D10-DESIGN-per-instance-boards.md, SHA-256 927d0ed893c513f2f20efa3ff678f19ba785ac43cf84d690412038daa5d41796 (sections 2.4 to 2.9, 3.2, 3.5, 4 and 5; questions P1 to P13, answered by Jared and relayed by the planning thread, pm-mail 1010191613-9ce1; design lineage only)"
  - "home-panels build facts, pm-mail 1010221905-e13e and 1010223444-a10e (engine 66d676cc66, Home track 33d696950c, dashboard kind 54f08139ac; build lineage only)"
  - "Concepts/home-redesign/CONTRACT.md section 3.1 at 54f08139ac on concept/home-panels-20261009, SHA-256 40d3883c90912124773d5f8cb72128de6bde31a76a9223872ba48e05a7a512fc (concept lineage only)"
  - "Concepts/home-redesign/NUMBERS.md at 54f08139ac on concept/home-panels-20261009, SHA-256 945ce104ae275d1d37de02ef0608acd49c21890bd372dac3dcf07b24d36b4a7b (the Dashboard section; concept lineage only)"
  - "Concepts/usage-redesign/src/js/40-board.js at 54f08139ac on concept/home-panels-20261009, SHA-256 f3f1ab41fb650f7a09b65e44d4ebe8c2afdbcae753e2512ac2137e964dae3f8c (the order a board lists its sets; concept lineage only)"
  - "Concepts/usage-redesign/tools/boards.py at 54f08139ac on concept/home-panels-20261009, SHA-256 6b17a5c2da788daaa522c2e4cc6db0780a09da4f31cc49d6b693160b10526790 (the built-in boards' sets as built, Usage content; concept lineage only)"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/canon-inputs/panels-NUMBERS-6026fa8432.md, SHA-256 27ddd358f2c98848e424d7802e753435e09568a9555330884a84c725a844f2c7 (the retired stand-in grid numbers; concept lineage only)"
  - "Plans/Decision_Log.md#DL-180"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/DECISIONS.md, SHA-256 0d2b45466c91734e15fd8659e9a8e3b17b70d92be785421e57e084dc8daf6b64 (D1, D10)"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/canon-inputs/panels-CONTRACT-v1-778c8494e6.md, SHA-256 aa16fc080f44f6824b0ef32a2b568bfcae81277b6962caaba1b441015d68dae9 (section 2, dashboard tab ids; concept lineage only)"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/canon-inputs/panels-NUMBERS-407e6fb6fe.md, SHA-256 019721f5215d95c80b999d5b61e1ee4bf79b29afc5b229a12bccde6f738c5162 (the \"+\" menu's Dashboard sub-row and the Home named layout; concept lineage only)"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/widgets-and-coordination.md, SHA-256 631c28a9198c9f550514c856ade138627410b94c48fe5f96a67450b14f407a90 (part A, A1 to A7; research lineage only)"
  - "Concepts/home-redesign/src/panels/kinds/30-dashboard.js on concept/home-panels-20261009 (the boards, the Details route and the entrance; concept lineage only)"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/canon-inputs/small-round/panels-NUMBERS-51c316e18b.md, SHA-256 a9c42b88e5cb50706ff1716a254cb68e026a538bb7a0c840905779a9a482cff2 (small-round concept lineage only)"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/canon-inputs/small-round/panels-CONTRACT-2926ad987e.md, SHA-256 c579d0dfef41fd1fc7327d14c2adb9e2b101c24b216ff64a9db5fc19895ad989 (small-round concept lineage only)"
preserved_exact_tokens:
  - "dashboard:home"
  - "dashboard:<board_id>"
  - "restore_revision"
  - "widget_layout:v1:dashboard:<board_id>"
  - "widget_layout:v1:dashboard:home"
  - "widget_layout:v1:dashboard"
  - "host_id"
  - "board_id"
  - "UF-062"
  - "widget_layout:v1:<project_id>:<board_id>"
  - ":quarantine"
  - "home.dashboard"
  - "dash-<n>"
  - "set_id"
  - "host:dashboard"
  - "user:<preset_id>"
  - "widget_presets:v1"
  - "Start from"
  - "Rename dashboard..."
  - "Delete dashboard..."
  - "ui.widget_board.set_view"
  - "ui.widget_preset.save"
  - "ui.widget_preset.rename"
  - "ui.widget_preset.delete"
negative_constraints:
  - "Do not limit a board to the four widgets of F3-279."
  - "Do not write a board's widget layout into the Home layout record, or write the Home layout record from a widget operation."
  - "Do not open a second tab for a board that is already open."
  - "Do not write, reset or delete the old `widget_layout:v1:dashboard` key, or convert it into a board."
  - "Do not let a widget gesture move or size a panel, or a panel or tab command change a board."
  - "Do not size a board's tracks from the window."
  - "Do not run a second dashboard engine, board model or settlement beside the Usage board engine."
  - "Do not add a board_id field to a widget command payload, or a command family for dashboards, presets, range or scope."
  - "Do not keep presets per project or put a board's view in a preset."
  - "Do not delete Home, Metrics, Monitoring or Agents, or offer Rename dashboard... or Delete dashboard... on them."
  - "Do not keep the old Home widgets on any board or as a Home (current) board."
  - "Do not gate the lab-only Play the next hour as a dashboard behaviour (UF-107)."
compatibility_only_notes:
  - "The panels concept moves the page's one dashboard node between dashboard tabs and keeps the Main, Metrics and Monitoring grids behind it; that stand-in is concept lineage, not the product's board model."
  - "The concept keeps a custom dashboard's name under its own key and its presets under its own schema id; those are concept names, not product names (the product's families are the board envelope and widget_presets:v1, which storage-plan registers)."
  - "Retired 2026-10-10 (DL-186), kept verbatim for lineage: The Home board starts with the Dashboard's existing default set, `widget-orchestrator-progress`, `widget-active-lanes`, `widget-recent-results` and `widget-custom-metrics`, which the concept's Home board also shows."
  - "Retired 2026-10-10 (DL-186), kept verbatim for lineage: Each board keeps its own widget layout in the one widget-layout schema family (WS-020) under `widget_layout:v1:dashboard:<board_id>`, whose envelope's `host_id` names the board as `dashboard:<board_id>`, as Usage's names `usage`; WS-009's app default with project override applies per board."
  - "Retired 2026-10-10 (DL-186), kept verbatim for lineage: Today's single Dashboard layout `widget_layout:v1:dashboard` converts into `widget_layout:v1:dashboard:home` on first read and is never reset: the user's widgets, their sizes, order, visibility and configuration carry over, and the old key stays only as a read-only migration input and rollback backup, like `dashboard_layout:v1`."
  - "Retired 2026-10-10 (DL-186), kept verbatim for lineage: The Usage board engine becomes the dashboard engine once it runs several boards at once; this thread family does that refactor after the Usage port lands, and until then the panels concept's stand-in board is lineage only."
  - "Retired 2026-10-10 (DL-186), kept verbatim for lineage: A project starts with four boards, Home, Metrics, Monitoring and Agents, after the panels concept; the \"+\" menu's Dashboard row lists the project's boards in its sub-row, each opening or revealing that board's tab, and its row body opens or reveals `dashboard:home`, as the panels concept does (Plans/UI_Command_Catalog.md#UCC-200). Closing a dashboard tab closes the tab only: its board and widget layout stay and can be opened again from that row."
  - "Retired 2026-10-10 (DL-186), kept verbatim for lineage: Catalogue: any Usage widget can be placed on any board (Plans/usage-feature.md#UF-062 wins over the four-widget catalogue of F3-279, which F3-638 supersedes), together with the Dashboard widgets canon already admits; Orchestrator widgets beyond WS-013's curated Progress subset join after the Orchestrator page has its own redesign, and that redesign's widgets follow this same kind contract."
  - "Retired 2026-10-10 (DL-186), kept verbatim for lineage: Inside the tab the board is the Usage widget board: its snapping widget grid, its Add widget flow, its widget gestures under WS-019 (one transaction owns one board at a time), its curated sizes under WS-017 and WS-018, and its track count chosen from the board's own measured width, never the window (F3-638)."
  - "Retired 2026-10-10 (DL-186), kept verbatim for lineage: Add widget sits inside the dashboard tab, in its header row (F3-635), and adds to that board only. Every `cmd.widget.*` row inside a dashboard tab is addressed by board_id (UCC-200), commits only to that board's namespace, and emits no `workspace.layout_changed`, which stays the Home layout's event (Plans/Contracts_V0.md#CV-361)."
  - "Retired 2026-10-10 (DL-186), 2026-10-09 acceptance criterion kept verbatim for lineage: A new project shows the boards Home, Metrics, Monitoring and Agents in the \"+\" menu's Dashboard row, `dashboard:home` is pinned in the default layout, each sub-row opens or reveals its board's tab, and the row body opens or reveals `dashboard:home`."
  - "Retired 2026-10-10 (DL-186), 2026-10-09 acceptance criterion kept verbatim for lineage: Closing a dashboard tab keeps its board and widget layout, and the board opens again from the Dashboard row as it was."
  - "Retired 2026-10-10 (DL-186), 2026-10-09 acceptance criterion kept verbatim for lineage: Each board restores from and writes to its own `widget_layout:v1:dashboard:<board_id>` with `host_id` `dashboard:<board_id>`, and no dashboard widget state appears in the Home layout record."
  - "Retired 2026-10-10 (DL-186), 2026-10-09 acceptance criterion kept verbatim for lineage: On first read after upgrade a saved `widget_layout:v1:dashboard` becomes the Home board's layout with every widget, size, order, visibility and configuration kept, nothing is reset, and later writes never touch the old key."
  - "Retired 2026-10-10 (DL-186), 2026-10-09 acceptance criterion kept verbatim for lineage: The Add widget flow of every board offers every Usage widget; no four-widget limit applies."
  - "Retired 2026-10-10 (DL-186), 2026-10-09 acceptance criterion kept verbatim for lineage: Every `cmd.widget.*` dispatch inside a dashboard tab carries board_id, changes only that board, and emits no `workspace.layout_changed`; a panel or tab command changes no board."
  - "Retired 2026-10-10 (DL-186), 2026-10-09 negative constraint kept verbatim for lineage: Do not reset a saved Dashboard layout on upgrade, or keep writing the old `widget_layout:v1:dashboard` key after migration."
  - "Retired 2026-10-10 (DL-186), kept verbatim for lineage (R35, the stand-in board's numbers): Within a dashboard tab, the grid column correction applies at widths 700-1060 px, with 8 px gaps and at least 200 px per column at four columns. It uses 3 columns if any visible widget spans an odd number of tracks, else 4 if (width minus 3 gaps) / 4 is at least 200 px, else 2. Below that range the page's grid rules give 2 columns. Source measurements in Focus or maximized at windows 1920, 1680 and 1470 px give grid widths 1005, 924 and 924 px: Home/Monitoring use 4 columns and Metrics 3. Home layout grids measure 437-488 px and Build 294-332 px, both 2 columns. Reset captures each board's starting widget set at load and saves 240 ms after reset: Home's orchestrator progress is 2 × 2, active lanes/recent results/custom metrics 2 × 1; Metrics has quota summary 2 × 1 and budget donuts/analytics chart 1 × 1; Monitoring has lane health and containers 2 × 1. These board measurements do not settle the separate per-kind Usage widget preset table."
stale_retired_dispositions:
  - "Rewritten 2026-10-10 (DL-186): dashboards run on the Usage board engine with per-project keys, host_id home.dashboard, multi-source boards and catalogue, Reset and Start from with set_id, per-user presets, custom dashboards made, renamed and deleted, the reopen-list rule, named-layout board snapshots capped at 64 KB, per-board range and scope, the reading-order entrance, Details on the Usage page, Agents drawn by the kind, Home's tab surface, live readings per board and empty new dashboards; the old Home widgets leave Home."
  - "Superseded 2026-10-10 (DL-186): the 2026-10-09 per-board key widget_layout:v1:dashboard:<board_id> and host_id dashboard:<board_id>, the conversion of widget_layout:v1:dashboard into the Home board, the Home board's default set of four old Home widgets, the stand-in board's R35 grid numbers and reset spans, and the phrase addressed by board_id, which now reads as the board id carried in the existing room field."
  - "Amended 2026-10-10 (R35, panels NUMBERS 6026fa8432): Adds dashboard grid columns, board reset spans, measured widths and reset-save delay."
  - "Superseded 2026-10-09 (DL-180): the one Dashboard widget-layout namespace and the singleton Dashboard surface."
  - "Amended 2026-10-10 (DL-186): Start from shows the sets in F3-638's group order, the lab-only Play the next hour is no criterion of this unit, and the built-in boards' own sets stay an open question for Usage until a Usage unit lists them."
  - "Amended 2026-10-10 (lead ruling on the Undo after Start from): the Undo dispatches cmd.widget.reset_layout with restore_revision, the board's committed layout revision just before the Start from, never with set_id."
  - "Amended 2026-10-11 (wave 2, panels NUMBERS 51c316e18b): Round-two dashboard names, grouping, project rebinding, picker sections and guarded Reset Undo use the board owner."
owner_boundary_notes:
  - "F3-638 owns how a dashboard tab looks in its panel; WS-017, WS-018, WS-019 and WS-020 keep the widget sizes, gestures and record fields; usage-feature.md owns the Usage widgets themselves, their default sets and the live readings; storage-plan registers the board and preset families; UI_Command_Catalog owns the commands and typed local actions named here."
owner_hints:
  - Plans/Widget_System.md
  - Plans/FinalGUISpec.md
  - Plans/usage-feature.md
  - Plans/storage-plan.md
  - Plans/UI_Command_Catalog.md
```

ContractRef: ContractName:Plans/Decision_Log.md#DL-180, ContractName:Plans/Decision_Log.md#DL-186, ContractName:Plans/FinalGUISpec.md#F3-638, ContractName:Plans/FinalGUISpec.md#F3-635, ContractName:Plans/usage-feature.md#UF-062, ContractName:Plans/usage-feature.md#UF-107, ContractName:Plans/Widget_System.md#WS-019, ContractName:Plans/Widget_System.md#WS-020, ContractName:Plans/DRY_Rules.md#DR-066
