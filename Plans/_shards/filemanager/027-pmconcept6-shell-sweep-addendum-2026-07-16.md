# Shard 027: PMConcept6 Shell Sweep Addendum - 2026-07-16

Source: `Plans/FileManager.md`

Source lines: L4518-L4567

Source SHA256: `97e57f4d228363a02b686b62bbf28caa177fb5bde9f17e0898a4fabec6fb96d6`

---

## PMConcept6 Shell Sweep Addendum - 2026-07-16

This addendum promotes user-approved PMConcept6 editor viewer renderer mechanics into canonical PlanUnits. `Concepts/pm6-build/**` remains illustrative source-lineage only per `Plans/usage-feature.md`. This addendum creates no WorkNodes, NodeSeeds, executable queues, implementation files, runtime artifacts, generated wiring rows, production build tasks, final manifests, or PNC-019 receipts.

### F-073 - Editor Viewer Renderer Mechanics

```yaml
plan_unit_id: F-073
unit_type: requirement
status: accepted
owner_doc: Plans/FileManager.md
canonical_text: >-
  The rich file and editor viewer renderer reveals newly opened viewer content with a staggered content reveal, and reduced motion disables the stagger so content renders immediately in final position. Long documents expose a canvas-style minimap with a viewport thumb that tracks the visible region during ordinary scrolling; clicking the minimap navigates to the clicked region, and pointer drag-scrub on the minimap scrolls the document continuously while the thumb follows the pointer until release. The document scroll position remains the single scroll authority: minimap interactions issue scroll intents against the shared editor buffer view rather than owning a second scroll state.
gui_related: true
gui_classification_reason: This is visible editor viewer reveal motion, minimap rendering, and scroll interaction behavior.
depends_on: [F-043]
unblocks: []
acceptance_criteria:
  - Opening a rich file or editor viewer staggers content reveal, and reduced motion renders content immediately without stagger.
  - Long documents show a canvas-style minimap whose viewport thumb tracks the visible region during ordinary scrolling.
  - Minimap click navigates to the target region, and pointer drag-scrub scrolls continuously until pointer release.
  - Minimap interactions never fork scroll state away from the shared editor buffer view.
  - No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - Future editor viewer staggered-reveal and reduced-motion tests.
  - Future editor viewer minimap drag-scrub and thumb-tracking tests.
risk_class: filemanager_viewer_renderer_drift
reasoning_tier: standard
context_scope: file_manager_viewer_renderer
implementation_surfaces: [Plans/FileManager.md, future editor viewer renderer]
node_compile_hint: {mode: filemanager_viewer_renderer, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - Concepts/pm6-build (PMConcept6 demo; source-lineage-only per Plans/usage-feature.md)
  - Concepts/pm6-build/parts/24-js-main.part.html
  - Concepts/pm6-build/parts/10x-pm6-css-global.part.html
  - Plans/FileManager.md:24
  - Plans/FileManager.md:262
  - Plans/FileManager.md:448-450
source_atom_ids: []
preserved_exact_tokens: ["staggered content reveal", "reduced motion", "minimap", "viewport thumb", "drag-scrub"]
negative_constraints:
  - Do not create a second scroll authority; minimap interactions issue scroll intents against the shared editor buffer view.
  - Do not block editing, input, or save authority while the staggered reveal runs.
compatibility_only_notes:
  - "Slint compatibility: the minimap renders as a retained canvas-style element with transform-driven thumb and scroll updates rather than per-frame style writes; no arbitrary-content backdrop blur, no SVG filters, color math precomputed; any glass treatment uses a single blur over a known wallpaper as a pre-blurred asset."
owner_boundary_notes:
  - "The RGV-004 minimap precedent is graph-scoped (Run Graph canvas minimap); this unit owns the editor viewer minimap variant inside FileManager viewer surfaces."
owner_hints: [Plans/FileManager.md, Plans/FinalGUISpec.md]
```
