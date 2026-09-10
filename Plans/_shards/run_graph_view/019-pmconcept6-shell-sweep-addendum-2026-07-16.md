# Shard 019: PMConcept6 Shell Sweep Addendum - 2026-07-16

Source: `Plans/Run_Graph_View.md`

Source lines: L1149-L1275

Source SHA256: `49143f47ebcde1b9235b6a7cf99b532bf9bb96979480752e85df92b2447d6341`

---

## PMConcept6 Shell Sweep Addendum - 2026-07-16

This addendum promotes user-approved PMConcept6 graph canvas interactions and the seven-state node legend into canonical PlanUnits. `Concepts/pm6-build/**` remains illustrative source-lineage only per `Plans/usage-feature.md`. This addendum creates no WorkNodes, NodeSeeds, executable queues, implementation files, runtime artifacts, generated wiring rows, production build tasks, final manifests, or PNC-019 receipts.

### RGV-017 - Graph Canvas Interaction Contract

```yaml
plan_unit_id: RGV-017
unit_type: requirement
status: accepted
owner_doc: Plans/Run_Graph_View.md
canonical_text: >-
  The Run Graph canvas interaction contract covers a zoom percent chip that displays the current zoom level, a Fit action that fits the full graph into the viewport, canvas pointer pan, minimap click-to-navigate plus minimap drag-scrub, and graph text search with visible match highlighting. Pointer interactions bind to the established command set cmd.run_graph.pan, cmd.run_graph.zoom, and cmd.run_graph.open_minimap_target with the established disabled reasons graph_unloaded, modal_capture, read_only_layout, selection_locked, and permission_denied, and controls render disabled states with a reason rather than disappearing. Graph text search highlights matches in place, preserves full-graph context, and does not rewrite focused run state except through an explicit route. This unit does not lift the explicitly deferred keyboard-navigation interaction row; keyboard-navigation interaction detail remains explicitly deferred in this document.
gui_related: true
gui_classification_reason: Run Graph canvas pan/zoom/Fit controls, minimap navigation, and search match highlighting are visible GUI.
depends_on: [RGV-004]
unblocks: []
acceptance_criteria:
  - The zoom percent chip reflects the current zoom level and the Fit action fits the whole graph into the viewport.
  - Canvas pointer pan, minimap click-to-navigate, and minimap drag-scrub move the viewport without replacing full-graph context.
  - Graph text search highlights matches in place, and navigating to a match uses an explicit route payload rather than rewriting focused run state.
  - Interactions surface graph_unloaded, modal_capture, read_only_layout, selection_locked, and permission_denied as rendered disabled states.
  - The explicitly deferred keyboard-navigation interaction row remains deferred and is not claimed closed by this unit.
  - No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-plans-verify.py run-gates
  - future Run Graph canvas interaction fixture suite
risk_class: run_graph_canvas_interaction_drift
reasoning_tier: standard
context_scope: run_graph_canvas_interaction
implementation_surfaces:
  - Plans/Run_Graph_View.md
  - Plans/UI_Command_Catalog.md
  - future Run Graph canvas
node_compile_hint:
  mode: run_graph_canvas_interaction_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Concepts/pm6-build (PMConcept6 demo; source-lineage-only per Plans/usage-feature.md)"
  - "Concepts/pm6-build/parts/17-page-orchestrator.part.html"
  - "Concepts/pm6-build/parts/29x-pm6-js-orchestrator.part.html"
  - "Plans/Run_Graph_View.md:44"
  - "Plans/Run_Graph_View.md:79"
  - "Plans/Run_Graph_View.md:381-383"
  - "Plans/Run_Graph_View.md:1073"
  - "Plans/Run_Graph_View.md:1080"
preserved_exact_tokens:
  - zoom percent chip
  - Fit
  - minimap
  - drag-scrub
  - cmd.run_graph.pan
  - cmd.run_graph.zoom
  - cmd.run_graph.open_minimap_target
negative_constraints:
  - Do not treat this unit as closing the explicitly deferred keyboard-navigation interaction row; that deferral stands.
  - Do not let graph search or minimap navigation rewrite focused run state except through an explicit route.
  - Do not hide unavailable interactions; render disabled state with the applicable disabled reason.
compatibility_only_notes:
  - "Slint compatibility: pan, zoom, Fit, and minimap interactions drive retained-scene transforms rather than per-frame style writes; no arbitrary-content backdrop blur, no SVG filters, color math precomputed."
owner_hints:
  - Plans/Run_Graph_View.md
  - Plans/UI_Command_Catalog.md
  - Plans/Orchestrator_Page.md
```

### RGV-018 - Seven-State Node Legend

```yaml
plan_unit_id: RGV-018
unit_type: requirement
status: accepted
owner_doc: Plans/Run_Graph_View.md
canonical_text: >-
  The Run Graph node state legend enumerates exactly seven visible node states: queued, running, attention_required, blocked, recovering, degraded, and complete. Legend swatches and node state visuals use the per-theme graph-state colors supplied by the theme token contract (Plans/FinalGUISpec.md F3-426); every built-in theme variant ships a complete precomputed graph-state color set, and the graph performs no runtime color derivation. Legend labels match the canonical state-label taxonomy shared with Orchestrator Progress surfaces, and node state visuals carry execution/governance state while boundary visuals carry grouping only.
gui_related: true
gui_classification_reason: The node state legend, its labels, and its per-theme state colors are visible GUI.
depends_on: [F3-426]
unblocks: []
acceptance_criteria:
  - The legend enumerates exactly queued, running, attention_required, blocked, recovering, degraded, and complete.
  - Legend swatches and node state colors resolve from the per-theme graph-state tokens of the theme token contract in every built-in theme variant.
  - No graph-state color is derived at runtime; values are precomputed per theme variant.
  - Legend labels match the canonical state-label taxonomy shared with Orchestrator Progress surfaces.
  - No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-plans-verify.py run-gates
  - future Run Graph node state legend theme fixture suite
risk_class: run_graph_node_state_legend_drift
reasoning_tier: standard
context_scope: run_graph_node_state_legend
implementation_surfaces:
  - Plans/Run_Graph_View.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: run_graph_node_state_legend
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Concepts/pm6-build (PMConcept6 demo; source-lineage-only per Plans/usage-feature.md)"
  - "Concepts/pm6-build/parts/10x-pm6-css-orchestrator.part.html"
  - "Concepts/pm6-build/parts/29x-pm6-js-orchestrator.part.html"
  - "Plans/Run_Graph_View.md:79"
  - "Plans/Orchestrator_Page.md:228"
  - "Plans/FinalGUISpec.md:7504-7513"
preserved_exact_tokens:
  - queued
  - running
  - attention_required
  - blocked
  - recovering
  - degraded
  - complete
negative_constraints:
  - Do not add, remove, or rename legend states without revising this owner doc and the shared state-label taxonomy.
  - Do not derive graph-state colors at runtime or substitute non-graph accent tokens for node state colors.
  - Do not overload seam or package boundary visuals with state or severity semantics; boundaries carry grouping only.
compatibility_only_notes:
  - "Slint compatibility: per-variant graph-state colors are precomputed token values; no runtime color mixing, no SVG filters, no arbitrary-content backdrop blur."
owner_hints:
  - Plans/Run_Graph_View.md
  - Plans/FinalGUISpec.md
  - Plans/Orchestrator_Page.md
```
