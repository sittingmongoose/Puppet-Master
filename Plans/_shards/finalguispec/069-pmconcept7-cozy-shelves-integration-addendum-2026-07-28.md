# Shard 069: PMConcept7 Cozy Shelves Integration Addendum - 2026-07-28

Source: `Plans/FinalGUISpec.md`

Source lines: L35568-L35773

Source SHA256: `302ef7221bcf2b481489ee362be695188bb4c66bd03188e9641b3f50c836b51b`

---

## PMConcept7 Cozy Shelves Integration Addendum - 2026-07-28

This addendum records the integration of the ratified Cozy Shelves rail concepts (`Concepts/rail-concepts/QwenRailConcepts/c2-cozy-shelves.html` and `c2-cozy-shelves-files.html`, both source-lineage-only per `Plans/usage-feature.md`) in the `Concepts/PMConcept7.html` appearance and interaction reference, the retirement of three superseded panel views, and the application of the F3-471 width envelope to the PM7 shell. It creates no WorkNodes, NodeSeeds, executable queues, implementation files, runtime artifacts, generated wiring rows, production build tasks, final manifests, or PNC-019 receipts.

### F3-497 - Cozy Shelves PM7 Panel Integration

```yaml
plan_unit_id: F3-497
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  The eight Cozy Shelves rail panels (File Manager, Search, Source Control, GitHub Actions, Docker,
  Testing, Agents, Runtime Artifacts) use their existing production panel destinations and command routes.
  Prototype DOM identifiers and hook migrations are source lineage only.
  The rail uses F3-472 shelf keyboard/accessibility behavior, F3-480 menus, measure-based label fitting
  and one entry animation per activation, and F3-474 category colors.
  File Manager behavior remains with its owner.
gui_related: true
gui_classification_reason: This unit records the user-visible integration of the winning rail panels in the application shell.
split_recommended: false
depends_on: [F3-471, F3-472, F3-474, F3-480]
unblocks: []
acceptance_criteria:
- "All eight panels open from the activity bar in the application with every expander collapsed by default except the c2-sanctioned open shelves (File Manager MODIFIED/ADDED/UNTRACKED/OPEN EDITORS and the Artifacts INVESTIGATION shelf)."
- "Accordion expand/collapse works by click and Enter/Space with aria-expanded syncing; rail menus paint above shelves and close through the shared menu owner."
- "Panel entrance runs once per activation under F3-480; competing entrance animations do not replay."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: pm7_cozy_shelves_integration
implementation_surfaces: []
node_compile_hint:
  mode: pm7_cozy_shelves_integration_record
  create_worknodes: false
source_lineage:
- "Concepts/rail-concepts/QwenRailConcepts/c2-cozy-shelves.html (winning concept; source-lineage-only)"
- "Concepts/rail-concepts/QwenRailConcepts/c2-cozy-shelves-files.html (winning files concept; source-lineage-only)"
- "Concepts/ChatGuiUpdates2.md (Cozy Shelves rail concepts 2026-07-27 contracts; source-lineage-only)"
preserved_exact_tokens: []
negative_constraints:
- "Do not treat Concepts/pm6-build/** as implementation authority; it remains illustrative source-lineage only."
compatibility_only_notes:
- "Slint portability follows F3-473: only transform/opacity/height animations, portal menus map to PopupWindow, label fitting by measure never by width class."
stale_retired_dispositions: []
owner_boundary_notes:
- "F3-472 owns the shelf-expander contract and F3-480 owns the presentation repairs; this unit records their appearance in the application and owns no new presentation rules."
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-498 - Width Envelope Applied to PM7 Shell

```yaml
plan_unit_id: F3-498
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  The F3-471 width envelope (240 minimum, 280 default, 480 maximum) is applied to
  the product shell's panel host: its default width is 280px, its minimum is
  240px and its maximum is the lesser of 480px and half the viewport width,
  with the same bounds on drag resize and narrow viewports. The 220px width
  remains an adversarial test-only case and is never a product floor. The
  panel presentation owner derives layout tiers from measured host width
  (min under 250px, mid from 250px through 400px, wide above 400px). Tiers gate
  layout chrome only. Labels fit by measurement under F3-480, with the later
  F3-620 amendment controlling left-rail fitting.
gui_related: true
gui_classification_reason: This unit pins the user-visible side panel width behavior of the PM7 shell to the ratified envelope.
split_recommended: false
depends_on: [F3-471, F3-497]
unblocks: []
acceptance_criteria:
- "The side panel defaults to 280px, clamps between 240px and 480px (viewport permitting), and no 220px product floor remains in the shell."
- "The panel host's measured width selects min below 250px, mid from 250px through 400px and wide above 400px; these tiers gate layout chrome only."
- "The viewport clamp is the lesser of 480px and half the viewport width; label fitting remains measurement-based under F3-480 and F3-620."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
- "scripts/pm-plan-migration.py"
- "scripts/pm-plan-index.py"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: pm7_cozy_shelves_integration
implementation_surfaces: []
node_compile_hint:
  mode: pm7_width_envelope_record
  create_worknodes: false
source_lineage:
- "Plans/FinalGUISpec.md (F3-471 width envelope pin)"
- "DL-260/DL-280 source lineage only (no product DOM, CSS or exact-token obligation): --files-panel-w, the side-panel-slot CSS clamp and !important narrow-viewport repair, and data-wtier were concept implementations of the retained panel width and chrome-tier rules."
preserved_exact_tokens:
- "240"
- "280"
- "480"
negative_constraints:
- "Do not reintroduce a 220px product floor; 220 remains adversarial test-only."
- "Do not gate label text on layout tiers; labels fit by measure under F3-480 and the later F3-620 left-rail amendment."
compatibility_only_notes:
- "Slint: the same clamp constants apply to the Slint panel host; measure-based fitting maps to layout re-evaluation, not width-class breakpoints."
stale_retired_dispositions: []
owner_boundary_notes:
- "F3-471 owns the envelope values; this unit owns only their application to the PM7 shell surfaces."
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-499 - Activity Bar Debug Entry and Panel Id Canon

```yaml
plan_unit_id: F3-499
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  The Debug activity-bar entry below Tests opens the Debug & Run panel through cmd.panel.switch
  with panel_id run_debug (F3-482). Panel identities and shortcuts follow the shared production model.
  Icon order and Ctrl+number bindings remain user-adjustable; shortcut assignment follows current icon order.
  The Debug Console tool tab (debug_console, F3-635) is placed by F3-634 tool affinity, usually beside
  terminals in the default Home layout (F3-630).
gui_related: true
gui_classification_reason: This unit defines the user-visible activity bar entry and panel id canon for the reactivated Debug & Run panel.
split_recommended: false
depends_on: [F3-482, F3-497]
unblocks: []
acceptance_criteria:
- "The Debug icon appears below Tests and opens the Debug & Run panel; cmd.panel.switch with panel_id run_debug resolves to the same view."
- "Testing and Agents open their existing production destinations; retired prototype DOM identifiers grant no alternate route."
- "Reordering icons by drag changes Ctrl+number assignment without code changes."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: pm7_cozy_shelves_integration
implementation_surfaces: []
node_compile_hint:
  mode: activity_bar_debug_entry_record
  create_worknodes: false
source_lineage:
- "user-decision:2026-07-27-run-debug-revival"
preserved_exact_tokens:
- "Debug"
- "run_debug"
negative_constraints:
- "Do not pin a fixed ordinal or Ctrl+N index for the Debug icon in canonical docs."
- "Prototype DOM identifiers grant no alternate production route."
compatibility_only_notes:
- "Slint: the activity bar model carries the same entries; hotkey assignment follows the model order, not a constant table."
stale_retired_dispositions: []
owner_boundary_notes:
- "F3-482 owns the Debug & Run panel identity and placement canon; this unit consumes that identity through the activity bar."
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-500 - Retired Panel View Removals

```yaml
plan_unit_id: F3-500
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  The title-bar stack remains the sole in-app notification affordance, with ack/snooze lifecycle
  semantics owned by F3-447/F3-460. Docker Publish uses its existing product owner route.
  Prototype hook-census and engine registrations are source lineage only.
gui_related: true
gui_classification_reason: This unit records the removal of user-visible panel views that canon already retired or redirected.
split_recommended: false
depends_on: [F3-497]
unblocks: []
acceptance_criteria:
- "Notifications use only the title-bar stack. Docker Publish uses its existing product owner route."

- "Notifications remain available exclusively through the title-bar stack."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: pm7_cozy_shelves_integration
implementation_surfaces: []
node_compile_hint:
  mode: retired_panel_view_removals_record
  create_worknodes: false
source_lineage:
- "Plans/FinalGUISpec.md (F3-447/F3-460 title-bar notification canon)"
preserved_exact_tokens: []
negative_constraints:
- "Do not reintroduce a Notifications side panel; the title-bar stack is the sole notification affordance."
- "Do not resurrect the removed prototype action ids as canonical commands."
compatibility_only_notes:
- "None."
stale_retired_dispositions:
- "Prototype views create no product obligations under DL-260; Debug & Run follows F3-485."
owner_boundary_notes:
- "F3-447/F3-460 own the notification affordance decision; this unit records only the view removal mechanics."
owner_hints:
- "Plans/FinalGUISpec.md"
```
