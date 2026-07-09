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

This addendum repairs non-runtime widget rows without creating WorkNodes, implementation files, runtime artifacts, or PNC-019 evidence.

- Repairs `sfk-27612d81432b8c866dbb6e76`: `widget-custom-metrics` is the canonical id for custom metric widgets. Fields are `widget_id`, `metric_id`, `query_ref`, `unit`, `refresh_interval_seconds`, `empty_state_copy_id`, and `owner_doc_ref`.
- Repairs `sfk-243d9819162bc839409ce15b`: external usage-feature references to Widget_System `§2`, `§3`, `§4`, or `§7` resolve to named widget hostability, projection trust, layout namespace, and Progress catalog anchors. New citations must use names instead of numeric section aliases.
- Repairs `sfk-7d2d295617efe72e4e966b52`: external references to Widget_System `§7` map to the named `Progress catalog and hostability` section. New citations must use named anchors because this file's live headings are not numbered as §7.
- Repairs `sfk-cdbe4e263b71df9ea3cb1655`: example widget-shell payload: `{\"widget_id\":\"widget.orchestrator_status\",\"widget_kind\":\"progress\",\"host_surface\":\"dashboard\",\"data_ref\":\"projection.widget.orchestrator_status\",\"refresh_interval_seconds\":30,\"empty_state\":\"no_active_run\",\"schema_version\":\"1.0.0\"}`.
