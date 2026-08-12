# Shard 008: PlanUnits

Source: `Plans/Widget_System.md`

Source lines: L132-L1015

Source SHA256: `4c3b870ad93bb8af380bcc86e47e6857f8f71946e59e620c00b51dc0d66d44ad`

---

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
