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
- Layout migration SSOT keeps `dashboard_layout:v1` only as an import source or rollback backup; canonical Dashboard writes go to `widget_layout:v1:dashboard`, and the legacy `dashboard_layout` / `dashboard_layout:v1` keys are not updated or retained as peer layout state after migration completes. Retired Orchestrator layout namespaces `widget_layout:v1:orchestrator:tiers`, `widget_layout:v1:orchestrator:evidence`, `widget_layout:v1:orchestrator:history`, and `widget_layout:v1:orchestrator:ledger` remain compatibility-only import evidence, not live widget layout targets.
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
- `Dashboard` may host a curated subset of `Progress` widgets and some `Usage` widgets, while deep inspection surfaces remain non-hostable native tabs.
- As a cross-cutting owner, Widget_System must prevent stale hostability drift into `/Usage`, `FinalGUISpec.md`, `Orchestrator_Page`, and `Orchestrator_Page.md` reconciliation.
- `Source Control` is a constrained side-panel and `/small` surface, not a broad widget canvas; widget usage stays focused on wider surfaces such as `Dashboard` and `Orchestrator / Progress`.
- `Progress` widgets consume compact projections rather than live-scan huge record sets per widget, and dense detail uses a deep-link to the native tab.
- GUI deep-link compatibility treats `resume_url`, `Tiers`, `/tab`, and broad Orchestrator widget tabs as legacy navigation inputs; active behavior routes through `Progress` and current route/deep-link contracts.
- Tier-era operator surfaces in Widget_System / `Widget_System.md`, Orchestrator_Page / `Orchestrator_Page.md`, and Run_Graph_View / `Run_Graph_View.md` must not preserve multi-tab widget composition, weak hostability, or missing `/effective` governance-object identity as live canon.

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
canonical_text: 'Layout persistence uses app-default with project override. `dashboard_layout:v1` is import or rollback only; Dashboard writes use `widget_layout:v1:dashboard`; retired Orchestrator layout namespaces remain compatibility-only; `orchestrator:progress` has its own namespace.'
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
unblocks: []
acceptance_criteria:
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
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Decision_Policy.md, ContractName:Plans/Orchestrator_Page.md'
compatibility_only_notes:
- 'Retired Orchestrator layout namespaces remain compatibility-only import evidence, not live widget layout targets.'
stale_retired_dispositions:
- 'Migration from legacy `dashboard_layout:v1` must retire stale orchestration-hostability assumptions rather than preserve them as peer canon.'
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
canonical_text: 'Dashboard may host a curated subset of Progress widgets and some Usage widgets, while deep inspection surfaces remain non-hostable native tabs. Source Control is a constrained side-panel and `/small` surface, not a broad widget canvas.'
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
unblocks: []
acceptance_criteria:
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
stale_retired_dispositions: []
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

Amended 2026-08-12 — shared interaction vocabulary, separate layout ownership. Dashboard
widget reorder and resize adopt the same direct-manipulation vocabulary as Home surface
movement: a lifted item that tracks the pointer one-to-one, a real in-flow placeholder in
the vacated cell carrying that item's grid span, neighbour reflow animated from pre-move
rects, a top-left grab handle, corner resize that snaps to grid tracks live and re-renders
the widget body once on release, and Escape / pointer-cancel / blur as the cancellation
contract. Sharing that vocabulary is a presentation decision and does not merge ownership:
Home layout continues to own surface placement under `home_workspace_layout.v1`, while
widget layout continues to own widget placement under `widget_layout:v1:dashboard`. A
widget drag never writes the Home record and a surface drag never writes the widget record.

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

Home Workspace surfaces (`editor_panel_*`, `dashboard`, `chat`, and terminal
sections) are shell presentation surfaces, not Dashboard widgets. The Home layout
may reuse U10 interaction semantics such as lift, placeholder, reflow, edge zones,
cancellation, and save-on-drop, but it does not import Widget System hostability,
DOM order as canonical state, Dashboard widget layout, or any `cmd.widget.*`
command. Dashboard widget movement remains owned by this document and its existing
projection contract; moving the Dashboard surface itself is owned by the Home
workspace owner.

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
System owner. Current source lineage is the pinned `Concepts/pm7-tools/base/PM7-base.html` plus the
assertion-guarded T33-T43 pipeline in `Concepts/pm7-tools/build_pm7.py`; `Concepts/PMConcept7.html` is the
protected generated output and is never an authored owner. The current repo-local audit status is
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
  exposes only supported curated shapes equivalent to Strip, Compact, Standard, Expanded, and Maximum or
  tall variants where that kind can use them. Increasing a widget's supported size must increase useful
  information density: wide instruments and summaries use balanced internal columns; lists, accounts,
  providers, ledgers, and event cards reveal more complete rows; charts spend the extra area on plot and
  legible facts; context and authority cards reveal additional source, route, confidence, history, forecast,
  reset, or settlement facts. A compact tier mounts complete content groups only, so the next tier never
  peeks, clips, or appears as a partial row, bar, label, legend, or footer.
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
  - "Concepts/pm7-tools/base/PM7-base.html (current recovered PMConcept7 source base; source-lineage-only)"
  - "Concepts/pm7-tools/build_pm7.py (current assertion-guarded T33-T43 pipeline)"
  - "Concepts/PMConcept7.html (protected generated output; verification input only; never hand-edit)"
preserved_exact_tokens:
  - Strip
  - Compact
  - Standard
  - Expanded
  - Maximum
  - complete-or-hidden
negative_constraints:
  - Do not treat a larger rectangle with unchanged mounted content as a larger semantic size.
  - Do not use routine internal widget scrolling to conceal content that a curated size claims to contain.
  - Do not reveal fragments of a lower content tier.
  - Do not treat static source inspection or an in-progress audit as executable acceptance evidence.
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
  - "Concepts/pm7-tools/base/PM7-base.html (current recovered PMConcept7 source base; source-lineage-only)"
  - "Concepts/pm7-tools/build_pm7.py (current assertion-guarded T33-T43 pipeline)"
  - "Concepts/PMConcept7.html (protected generated output; verification input only; never hand-edit)"
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
  Usage and Dashboard widgets share one transactional direct-manipulation contract. Pickup snapshots the
  stable widget identity, committed order, and measured painted physical column/row footprint. Usage pointer resize
  installs a real in-flow placeholder initialized from that footprint, lifts a fixed-position preview, and then
  advances both the placeholder and lifted card to each last-painted supported footprint while visibly and
  deterministically repacking only obstructed peers. Unobstructed peers retain their rectangles, and every peer
  remains mounted, painted, and free of entrance-animation replay. Dashboard resize retains its measured-footprint
  placeholder and frozen peers. Reorder starts only from the dedicated widget handle, uses a fixed ghost plus a
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
  including no `workspace.layout_changed`. Escape, pointer cancellation, `lostpointercapture`, blur, an invalid
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
  outer presentation grid never becomes the widget mutation owner.
gui_related: true
gui_classification_reason: This unit defines the complete pointer and keyboard lifecycle for visible widget resize and reorder.
depends_on: [WS-004, WS-005, WS-009, WS-017, WS-018]
unblocks: [WS-020]
acceptance_criteria:
  - Pickup records the stable widget identity, committed order, and measured painted physical column/row footprint; Usage pointer resize initializes a real placeholder from that footprint, then paints each supported target footprint and visibly repacks only obstructed peers while the peer nodes, unobstructed peer rectangles, DOM order, opacity, entrance-animation state, and document scroll position remain stable. Usage keyboard resize remains one atomic changed-only settlement per supported directional key intent rather than a held live-preview mode. Dashboard resize retains its measured placeholder and frozen peers.
  - Command, receipt, event, and persistence spies remain empty until a changed pointer release, keyboard reorder drop, or atomic keyboard-resize activation.
  - Reorder begins only from the dedicated handle, uses a fixed ghost and measured-footprint in-flow placeholder for pointer operation, resolves stable two-dimensional candidates including empty same-footprint cavities and lower rows, binds pointer choice to the ghost's anchored top-left with geometric hysteresis, resolves before/after identities against the committed-order snapshot, and visibly displaces affected peers during pointer and keyboard preview while keeping their DOM nodes mounted, their opacity nonzero, and their entrance animations stopped; Usage pointer resize uses the same target-first deterministic slot projection so obstructed peers move during the held preview and the accepted settlement matches the last painted topology, while Usage keyboard resize remains atomic and Dashboard resize peers remain frozen. Horizontal-only pointer and keyboard input advances strictly along the requested supported curated axis with minimum companion-axis drift at far-right, far-left, and middle positions, an edge-constrained deliberate drag can express one step, and an in-viewport pointer release after same-direction overshoot commits the last painted supported intent.
  - A changed pointer release commits the last painted pointer intent without pointer-up re-hit-testing or retargeting, a changed keyboard reorder drop commits its selected insertion intent, and each supported keyboard-resize activation settles atomically; each changed terminal path emits exactly one existing `cmd.widget.resize` or `cmd.widget.move`, writes settled state once, triggers one board settlement, and emits no persisted domain event, including no `workspace.layout_changed`.
  - Escape, pointercancel, `lostpointercapture`, blur, invalid target, pre-dispatch validation failure, and unchanged release/drop restore the original state, emit no command, receipt, event, or persistence write, release capture, and remove every listener, class, ghost, placeholder, lifted state, preview style, and pending animation frame; an owner-rejected command or post-dispatch persistence-adapter failure instead retains exactly one attempted command and one rejected/failed receipt, restores authoritative geometry/order, emits no settled event or successful owner-store write, and performs the same complete transient cleanup.
  - Successful pointer and keyboard reorder restore the board's pre-transaction inline minimum-height value and leave scroll extent bounded to settled card geometry so repeated moves do not accumulate a blank tail; while one pointer or keyboard resize/reorder owns the board, every competing pointer, touch, pen, or keyboard acquisition is rejected before focus, capture, transient DOM, or class mutation, and cancelling the owner clears exactly that owner without leaving an operation flag.
  - Keyboard reorder supports pickup, directional move, drop, Escape, and blur; `aria-grabbed` is true only while pickup is active and returns to false after drop or cancellation, the picked card has a visible focus/outline state, and its two-dimensional candidate choice, live peer displacement, changed-only commit, rollback, and cleanup match pointer reorder without requiring a cloned pointer ghost or placeholder.
  - The contract applies to Usage widgets and widgets owned by the Home Dashboard wrapper/host, even when that wrapper participates presentation-only in an outer grid; the outer grid does not own widget mutations, and moving or resizing the Dashboard surface itself remains Home workspace authority.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - tests/fixtures/usage_gui/presentation/interaction_transaction_matrix.json (static contract fixture only)
  - Plans/shared_runtime_command_contract_fixtures.json (static command/receipt/event-count fixture only)
  - "evidence_ref: Plans/.audits/audit-20260829-001-pmconcept7-widget-followup/browser/runs/t41-build8-focused-regression-rerun-2/report.json (SHA-256 4de0320f73010440560c5fed357df8b67f02188b6ca0a07c1ff3875de31485c0; historical predecessor evidence only; superseded for Usage resize-preview timing; readiness_claim=false)"
  - "verification_pending: fresh exact-T43 live occupied-neighbor preview, settlement-parity, cancellation, failure, and film receipts under Plans/.audits/audit-20260830-001-pmconcept7-live-resize-preview/; readiness_claim=false"
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
  - "Concepts/pm7-tools/base/PM7-base.html (current recovered PMConcept7 source base; source-lineage-only)"
  - "Concepts/pm7-tools/build_pm7.py (current assertion-guarded T33-T43 pipeline)"
  - "Concepts/pm7-tools/widget_live_resize_preview_source.py (authored T43 Usage-only live resize-preview transform)"
  - "Concepts/PMConcept7.html (protected generated output; verification input only; never hand-edit)"
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
negative_constraints:
  - Do not dispatch a command, receipt, persisted event, or storage write for pointer-preview frames.
  - Do not mint PM7-only resize or move commands.
  - Do not persist or treat live Usage preview repack as settlement, reconcile DOM order, or remount peers during preview; do not generalize Usage live resize repack to Dashboard resize.
  - Do not remount reorder peers, replay their entrance animation, or black out the board during preview.
  - Do not retain preview-only board minimum height after either commit or rollback, or allow simultaneous widget-operation controllers.
  - Do not derive reorder placement from stale nominal spans, persist a measured preview footprint, or re-hit-test and retarget at pointer-up.
  - Do not let an outer presentation grid replace the Home Dashboard wrapper as widget mutation owner.
  - Do not claim the protected generated artifact passes this interaction contract without fresh browser execution and raw receipts.
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
gui_related: true
gui_classification_reason: The record determines restored widget placement, semantic size, and cross-surface ownership.
depends_on: [UF-060, WS-004, WS-009, WS-018, WS-019]
unblocks: []
acceptance_criteria:
  - Usage and Dashboard restore from their own namespaces while Home surfaces restore only from home_workspace_layout.v1.
  - "UsageWidgetLayoutRecord is the named public contract for a settled Usage widget layout and has exactly the required fields layout_schema_version, default_set_version, host_id, room_id, widget_id, visible, order_index, slot_id, geometry_id, semantic_tier_id, preset_id, configuration_refs, and committed_revision, including semantic size or preset identity in addition to supported geometry so adaptive content restores deterministically; every configuration_ref resolves to an existing stable, non-secret widget-configuration identity governed by WS-004 and UF-060, and filter payloads remain in the configuration record rather than becoming new UsageWidgetLayoutRecord fields."
  - "No preview rectangle, pointer or pointer coordinate, ghost, placeholder, animation state, draft, or per-frame draft appears in UsageWidgetLayoutRecord."
  - A widget mutation never writes Home surface placement and a Home surface mutation never writes Usage or Dashboard widget placement.
  - Migration rejects, quarantines, or deterministically maps unsupported old geometry before it can override corrected current defaults.
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
  - "Concepts/pm7-tools/base/PM7-base.html (current recovered PMConcept7 source base; source-lineage-only)"
  - "Concepts/pm7-tools/build_pm7.py (current assertion-guarded T33-T43 pipeline)"
  - "Concepts/PMConcept7.html (protected generated output; verification input only; never hand-edit)"
preserved_exact_tokens:
  - widget_layout:v1:usage
  - widget_layout:v1:dashboard
  - home_workspace_layout.v1
  - UsageWidgetLayoutRecord
  - committed revision
  - semantic tier
  - preset
negative_constraints:
  - Do not create a second Widget layout store or a PM7-only persistence namespace.
  - Do not serialize transient interaction state.
  - Do not admit preview rectangles, pointers, ghosts, placeholders, animation, or drafts into UsageWidgetLayoutRecord.
owner_hints:
  - Plans/Widget_System.md
  - Plans/storage-plan.md
```
