# Shard 008: PlanUnits

Source: `Plans/Widget_System.md`

Source lines: L130-L236

Source SHA256: `87ebb933f2415c333d7ad4923c41ef1ab01731b9d27a51485636e3800ee50120`

---

## PlanUnits

### WS-001 - Widget System -- Cross-Cutting Specification Source-Preserving PlanUnit

```yaml
plan_unit_id: WS-001
unit_type: requirement
status: accepted
owner_doc: Plans/Widget_System.md
canonical_text: Plans/Widget_System.md keeps its pre-migration canonical source content losslessly in place while exposing a source-preserving PlanUnit for Plan Document System indexing. Fine-grained requirement splitting may occur in a later controlled batch using the recorded span_map and coverage_map.
gui_related: true
gui_classification_reason: The preserved source spans include GUI/UI/user-visible presentation or interactive control requirements.
split_recommended: false
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
- Plans/Widget_System.md
node_compile_hint:
  mode: source_preserving_planunit
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Widget_System-S0001
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Widget_System-S0002
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Widget_System-S0003
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Widget_System-S0004
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Widget_System-S0005
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Widget_System-S0006
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Widget_System-S0007
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Widget_System-S0008
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:Widget_System-S0009
preserved_exact_tokens:
- Widget System -- Cross-Cutting Specification
- Canonical owner-section requirements
- Progress-only widget hostability
- 1. Scope and non-scope
- 'ContractRef: ContractName:Plans/Orchestrator_Page.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Crosswalk.md'
- 2. Hostability and data contracts
- 'ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/Contracts_V0.md'
- 3. Layout persistence
- 'ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Decision_Policy.md, ContractName:Plans/Orchestrator_Page.md'
- 4. Orchestrator Progress widget scope and catalog linkage
- Catalog source and drill linkage
negative_constraints:
- '- Widgets consume stable orchestrator projections and canonical record `/query` contracts. They must not define meaning by subscribing directly to legacy event names or tier-specific objects, and `Progress` remains the only widget-composed Orchestrator tab.'
- '- `historical-run` rendering follows the active `/page` route context: `Progress` widgets render against the current `focused_run_id`, and moving between live and historical mode must not require per-widget manual retargeting or preserve stale per-widget scope.'
- '- Widget trust chrome uses shared projection-trust `/freshness` semantics. Individual widgets must not invent stale-state copy or local stale-state categories outside the common projection-trust model.'
- '- Tier-era operator surfaces in Widget_System / `Widget_System.md`, Orchestrator_Page / `Orchestrator_Page.md`, and Run_Graph_View / `Run_Graph_View.md` must not preserve multi-tab widget composition, weak hostability, or missing `/effective` governance-object identity as live canon.'
- Tier-first widget catalog assumptions are compatibility-only; Widget_System hostability follows the Orchestrator Progress-only rule and must not broaden widgetization across native Orchestrator tabs.
compatibility_only_notes:
- '- Legacy Orchestrator widget inputs such as `/Tiers`, `Orch/Tiers`, `widget.tier_tree`, `PuppetMasterEvent`, `PuppetMasterEvent::TierChanged`, and `TierChanged` are compatibility evidence only. Live hostability does not restore `Dashboard, Usage, Orchestrator widget tabs`; non-Progress Orchestrator '
- '- Layout migration SSOT keeps `dashboard_layout:v1` only as an import source or rollback backup; canonical Dashboard writes go to `widget_layout:v1:dashboard`, and the legacy `dashboard_layout` / `dashboard_layout:v1` keys are not updated or retained as peer layout state after migration completes. R'
- '- The older `Progress / Tiers / Node Graph / Evidence / History / Ledger` page list, plus `tier_id`, tier-scoped data-source rows, and `/task/subtask` framing, is compatibility lineage. Widget_System consumes `Orchestrator_Page` / `Orchestrator_Page.md` for the page model and does not treat `Tiers` '
- '- Orchestrator `/Widget` hostability gaps such as missing `TOC` sections, split `widget.terminal_output` versus `widget.agent_terminal`, `/partition` and owner run/tier row metadata, under-owned project-heavy surfaces, `/page` and `/tier` filters, `/Evidence/History/Ledger` legacy layout claims, and'
- '- Widgets consume stable orchestrator projections and canonical record `/query` contracts. They must not define meaning by subscribing directly to legacy event names or tier-specific objects, and `Progress` remains the only widget-composed Orchestrator tab.'
- '- The GUI widget appendix must follow the same boundary: `Progress` is widget-composed, while `Seams`, `Node Graph`, `Evidence`, `History`, and `Ledger` are native views; broad Orchestrator widget tabs in GUI prose are compatibility signals only.'
- '- GUI deep-link compatibility treats `resume_url`, `Tiers`, `/tab`, and broad Orchestrator widget tabs as legacy navigation inputs; active behavior routes through `Progress` and current route/deep-link contracts.'
- '- migration from legacy `dashboard_layout:v1` must retire stale orchestration-hostability assumptions rather than preserve them as peer canon'
- Tier-first widget catalog assumptions are compatibility-only; Widget_System hostability follows the Orchestrator Progress-only rule and must not broaden widgetization across native Orchestrator tabs.
stale_retired_dispositions:
- '- widget surfaces consume cross-cutting `/state` and `/runtime` owner contracts rather than reopening already-locked seams: SSH retry-budget/reconnect behavior is owned by GitHub Integration, and stale cross-references must point to the owning contract before widget drill-downs are implementation-re'
- '- Stale or incomplete widget summaries are `/retire` or `/incomplete` instead of being reintroduced as live catalog entries; the older source shorthand `### 15.1` through `### 15.9` is source-lineage only, with active promoted widget sections resolved by named FinalGUISpec headings rather than by mi'
- '- Layout migration SSOT keeps `dashboard_layout:v1` only as an import source or rollback backup; canonical Dashboard writes go to `widget_layout:v1:dashboard`, and the legacy `dashboard_layout` / `dashboard_layout:v1` keys are not updated or retained as peer layout state after migration completes. R'
- '- `historical-run` rendering follows the active `/page` route context: `Progress` widgets render against the current `focused_run_id`, and moving between live and historical mode must not require per-widget manual retargeting or preserve stale per-widget scope.'
- '- Widget trust chrome uses shared projection-trust `/freshness` semantics. Individual widgets must not invent stale-state copy or local stale-state categories outside the common projection-trust model.'
- '- `widget.tier_tree` is retired as a first-class Orchestrator widget in favor of native `Seams` and native graph `/history/evidence/ledger` tabs.'
- '- As a cross-cutting owner, Widget_System must prevent stale hostability drift into `/Usage`, `FinalGUISpec.md`, `Orchestrator_Page`, and `Orchestrator_Page.md` reconciliation.'
- '- migration from legacy `dashboard_layout:v1` must retire stale orchestration-hostability assumptions rather than preserve them as peer canon'
owner_boundary_notes:
- '## Canonical owner-section requirements'
- These requirements are canonical live specification text for this owner document and preserve the required product, runtime, storage, UI, and governance details in owner-section form.
- Widgets consume stable projections and canonical records. They do not define page semantics.
- '- Route vocabulary is cross-cutting, not page-local; widget reconciliation starts from owner docs before surface docs so widgets consume the route/open contract instead of recreating route terms locally.'
- '- `tab-level` filters live in tab scope, `widget-level` filters are safe subfilters, and `page-native` actions stay with route/open or page owner docs; `/package` hostability consumes package/seam projections without turning widgets into page owners.'
- '- a widget action routes through canonical commands and route/open contracts rather than bypassing them'
- '- widget surfaces consume cross-cutting `/state` and `/runtime` owner contracts rather than reopening already-locked seams: SSH retry-budget/reconnect behavior is owned by GitHub Integration, and stale cross-references must point to the owning contract before widget drill-downs are implementation-re'
- '- Widget hostability treats `/settings/widget`, `/plan/question/approval`, and `/web-tool` as routed GUI consumer paths over FinalGUISpec and UI command owners; Widget_System owns only whether those widgets can be hosted by Dashboard, Usage, or Orchestrator `Progress`, plus layout and projection inh'
- '- Legacy Orchestrator widget inputs such as `/Tiers`, `Orch/Tiers`, `widget.tier_tree`, `PuppetMasterEvent`, `PuppetMasterEvent::TierChanged`, and `TierChanged` are compatibility evidence only. Live hostability does not restore `Dashboard, Usage, Orchestrator widget tabs`; non-Progress Orchestrator '
- '- Layout migration SSOT keeps `dashboard_layout:v1` only as an import source or rollback backup; canonical Dashboard writes go to `widget_layout:v1:dashboard`, and the legacy `dashboard_layout` / `dashboard_layout:v1` keys are not updated or retained as peer layout state after migration completes. R'
- '- `Plans/GUI_Rebuild_Requirements_Checklist.md` / `/GUI_Rebuild_Requirements_Checklist.md` is a follower, not a source. Any `PASS` for `/open`, cross-cutting widget coverage, or `Tiers` is valid only after current owner docs pass the Progress-only, route/open, and runtime-recovery model.'
- '- `Plans/Widget_System.md` / `/Widget_System.md` removal remains lightweight and locally undoable, but canonical concern actions and `/governance` records do not inherit Widget_System / `Widget_System.md` removal policy.'
- '- Orchestrator `/Widget` hostability gaps such as missing `TOC` sections, split `widget.terminal_output` versus `widget.agent_terminal`, `/partition` and owner run/tier row metadata, under-owned project-heavy surfaces, `/page` and `/tier` filters, `/Evidence/History/Ledger` legacy layout claims, and'
- '- Widgets consume stable orchestrator projections and canonical record `/query` contracts. They must not define meaning by subscribing directly to legacy event names or tier-specific objects, and `Progress` remains the only widget-composed Orchestrator tab.'
- '- Canonical Orchestrator route vocabulary uses lower-case object names: `progress`, `seams`, `node_graph`, `evidence`, `history`, and `ledger`. These are high-value route targets and do not make Widget_System / `Widget_System.md` a tier-era Orchestrator owner.'
- '- Widget data contracts retire `PuppetMasterEvent`, `PuppetMasterEvent::TierChanged`, `PuppetMasterEvent::UserInteractionRequired`, `TierChanged`, `UserInteractionRequired`, tier-targeted filters, and PTY filtering as live data roots; widgets consume canonical runtime and attention projections inste'
- '- `/tab` filters stay separate from `page/tab filters` and `widget presentation config`: widget config may adjust presentation and local emphasis only, and it cannot diverge from the tab''s canonical projection rules.'
- '- The native-tab versus widget-heavy boundary is explicit: `Progress` is widget-heavy, while `Seams`, `Evidence`, `History`, `Ledger`, and `Node Graph` remain native-tab surfaces owned with `Orchestrator_Page` / `Orchestrator_Page.md`.'
- '- The GUI widget appendix must follow the same boundary: `Progress` is widget-composed, while `Seams`, `Node Graph`, `Evidence`, `History`, and `Ledger` are native views; broad Orchestrator widget tabs in GUI prose are compatibility signals only.'
- '- As a cross-cutting owner, Widget_System must prevent stale hostability drift into `/Usage`, `FinalGUISpec.md`, `Orchestrator_Page`, and `Orchestrator_Page.md` reconciliation.'
- '- run-level layout persistence is not canonical for Orchestrator `Progress`'
- 'The Orchestrator UI composes exactly one consumer widget: the `Progress` widget with ID `widget-orchestrator-progress`. This widget occupies a dedicated layout space within the Orchestrator UI and receives orchestrator-native runtime events, progress markers, and node-level state.'
- Drill-through and linkage semantics (`progress` → node, `progress` → lane, `progress` → evidence) are owned by the Orchestrator UI and by the FinalGUISpec consumer contract, not by Widget_System hostability rules.
owner_hints:
- Plans/Widget_System.md
```

