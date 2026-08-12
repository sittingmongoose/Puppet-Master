# Shard 067: PMConcept7 Cozy Shelves Integration Addendum - 2026-07-28

Source: `Plans/FinalGUISpec.md`

Source lines: L33264-L33507

Source SHA256: `dc51354b20dad6d8cf56051b7dcb649ab91d723ecfcf4a9dbbb2ab8a74341032`

---

## PMConcept7 Cozy Shelves Integration Addendum - 2026-07-28

This addendum records the integration of the ratified Cozy Shelves rail concepts (`Concepts/rail-concepts/QwenRailConcepts/c2-cozy-shelves.html` and `c2-cozy-shelves-files.html`, both source-lineage-only per `Plans/usage-feature.md`) into the `Concepts/PMConcept7.html` build via the `Concepts/pm6-build` parts pipeline, the retirement of three superseded panel views, and the application of the F3-471 width envelope to the PM7 shell. It creates no WorkNodes, NodeSeeds, executable queues, implementation files, runtime artifacts, generated wiring rows, production build tasks, final manifests, or PNC-019 receipts.

### F3-497 - Cozy Shelves PM7 Panel Integration

```yaml
plan_unit_id: F3-497
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  The eight Cozy Shelves rail panels (File Manager, Search, Source Control, GitHub
  Actions, Docker, Testing, Agents, Runtime Artifacts) are integrated into
  Concepts/PMConcept7.html through Concepts/pm6-build parts: panel markup in
  12-html-side-panels.part.html, the pm6-css-cozy-shelves style part, and the
  pm6-js-cozy-shelves behavior part. The c2 panel ids carry over verbatim
  (panel-files/search/source/git/docker/artifacts/testing/agents); the retired
  pm6-panel-testing and pm6-panel-agents ids migrate to panel-testing and
  panel-agents everywhere (activity bar data-targets, panels.show, hook census).
  Shared behaviors run on the integrated layer: the spring accordion with
  keyboard/aria per F3-472, body-portaled rail menus per F3-480, measure-based
  data-fit label shortening driven by a ResizeObserver on the side-panel slot,
  one-shot panel enter per F3-480 (the slideInLeft animation on .side-panel-view
  is removed), the --cat-* category palette per F3-474, and the File Manager
  context menu keeping its hook id fileContextMenu. The File Manager keeps its
  c2 explorer/changed/open segmented tabs, measured tree animator, hover quick
  actions, multi-select, filter, hide-ignored, and worktree root menu.
gui_related: true
gui_classification_reason: This unit records the user-visible integration of the winning rail panels into the PMConcept7 concept build.
split_recommended: false
depends_on: [F3-471, F3-472, F3-474, F3-480]
unblocks: []
acceptance_criteria:
- "All eight panels open from the activity bar in the built Concepts/PMConcept7.html with every expander collapsed by default except the c2-sanctioned open shelves (File Manager MODIFIED/ADDED/UNTRACKED/OPEN EDITORS and the Artifacts INVESTIGATION shelf)."
- "Accordion expand/collapse works by click and Enter/Space with aria-expanded syncing; rail menus paint above shelves and restore their home node on close."
- "The slideInLeft animation no longer appears on .side-panel-view; panel entrance runs once per activation via .pm-panel-enter."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: pm7_cozy_shelves_integration
implementation_surfaces:
- "Concepts/pm6-build/parts/12-html-side-panels.part.html"
- "Concepts/pm6-build/parts/10x-pm6-css-cozy-shelves.part.html"
- "Concepts/pm6-build/parts/29x-pm6-js-cozy-shelves.part.html"
node_compile_hint:
  mode: pm7_cozy_shelves_integration_record
  create_worknodes: false
source_lineage:
- "Concepts/rail-concepts/QwenRailConcepts/c2-cozy-shelves.html (winning concept; source-lineage-only)"
- "Concepts/rail-concepts/QwenRailConcepts/c2-cozy-shelves-files.html (winning files concept; source-lineage-only)"
- "Concepts/ChatGuiUpdates2.md (Cozy Shelves rail concepts 2026-07-27 contracts; source-lineage-only)"
preserved_exact_tokens:
- "fileContextMenu"
- "panel-testing"
- "panel-agents"
- "slideInLeft"
negative_constraints:
- "Do not hand-edit Concepts/PMConcept7.html or Concepts/pm6-build/PMConcept6.assembled.html; all changes flow through the parts pipeline."
- "Do not treat Concepts/pm6-build/** as implementation authority; it remains illustrative source-lineage only."
compatibility_only_notes:
- "Slint portability follows F3-473: only transform/opacity/height animations, portal menus map to PopupWindow, label fitting by measure never by width class."
stale_retired_dispositions: []
owner_boundary_notes:
- "F3-472 owns the shelf-expander contract and F3-480 owns the presentation repairs; this unit records their application to the PM7 build and owns no new presentation rules."
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
  the PM7 shell: --files-panel-w defaults to 280px, the narrow-range 220px floors
  become 240px (220 remains the adversarial test-only width and is not a product
  floor), the side-panel-slot clamp becomes min-width 240px and max-width
  min(480px, 50vw), the drag resizer caps at 480px, and the former !important
  220px narrow-viewport override now resolves through the 240px floor. The
  data-wtier attribute is computed on the slot by measure (min under 250px, mid
  through 400px, wide above) and gates layout chrome only, never label text per
  F3-480's measure-based fitting rule.
gui_related: true
gui_classification_reason: This unit pins the user-visible side panel width behavior of the PM7 shell to the ratified envelope.
split_recommended: false
depends_on: [F3-471, F3-497]
unblocks: []
acceptance_criteria:
- "The side panel defaults to 280px, clamps between 240px and 480px (viewport permitting), and no 220px product floor remains in the shell."
- "data-wtier on the slot reflects the measured width and gates only layout chrome."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: pm7_cozy_shelves_integration
implementation_surfaces:
- "Concepts/pm6-build/parts/02-css-tokens.part.html"
- "Concepts/pm6-build/parts/09-css-bento-themes.part.html"
- "Concepts/pm6-build/parts/10x-pm6-css-global.part.html"
node_compile_hint:
  mode: pm7_width_envelope_record
  create_worknodes: false
source_lineage:
- "Plans/FinalGUISpec.md (F3-471 width envelope pin)"
preserved_exact_tokens:
- "240"
- "280"
- "480"
- "data-wtier"
negative_constraints:
- "Do not reintroduce a 220px product floor; 220 remains adversarial test-only."
- "Do not gate label text on data-wtier; labels shorten by measure only (F3-480)."
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
  The activity bar carries a Debug icon directly below the Tests icon as its own
  entry (rail label "Debug", opening the Debug & Run panel per F3-482), wired
  with data-target="panel-run", making the cmd.panel.switch run_debug
  destination resolve to a real, reachable panel for the first time in the PM7
  build. The Testing and Agents panel ids are canonical as panel-testing and
  panel-agents (the retired pm6-panel-testing and pm6-panel-agents ids are gone
  from markup, data-targets, and the hook census). Icon order and Ctrl+number
  bindings remain user-adjustable per the existing customization contract; the
  hotkey handler live-queries icon order and never hardcodes this icon's index.
gui_related: true
gui_classification_reason: This unit defines the user-visible activity bar entry and panel id canon for the reactivated Debug & Run panel.
split_recommended: false
depends_on: [F3-482, F3-497]
unblocks: []
acceptance_criteria:
- "The Debug icon appears below Tests and opens the Debug & Run panel; cmd.panel.switch with panel_id run_debug resolves to the same view."
- "No pm6-panel-testing or pm6-panel-agents id remains in the built document."
- "Reordering icons by drag changes Ctrl+number assignment without code changes."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: pm7_cozy_shelves_integration
implementation_surfaces:
- "Concepts/pm6-build/parts/11-html-shell-open.part.html"
- "Concepts/pm6-build/parts/29x-pm6-js-panels.part.html"
node_compile_hint:
  mode: activity_bar_debug_entry_record
  create_worknodes: false
source_lineage:
- "user-decision:2026-07-27-run-debug-revival"
preserved_exact_tokens:
- "Debug"
- "panel-run"
- "run_debug"
negative_constraints:
- "Do not pin a fixed ordinal or Ctrl+N index for the Debug icon in canonical docs."
- "Do not resurrect the pm6-panel-testing or pm6-panel-agents ids."
compatibility_only_notes:
- "Slint: the activity bar model carries the same entries; hotkey assignment follows the model order, not a constant table."
stale_retired_dispositions: []
owner_boundary_notes:
- "F3-482 owns the Debug & Run panel identity and placement canon; this unit owns the PM7 build realization and the panel id cleanup."
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
  Two superseded side-panel views are removed from the PM7 build: panel-unraid
  (a self-declared redirect stub whose destination lives in the Docker panel's
  Publish view) and pm6-panel-notify (the Notifications side panel, retired when
  the title-bar notification stack became the sole in-app notification
  affordance per the 2026-07-23 promotion). Their hook-census rows, dead render
  wiring, and prototype action registrations (panels.ack, panels.snooze,
  panels.test_run, panels.debug_start, panels.git_commit, panels.docker_view,
  panels.art_filter) are removed with them; ack/snooze lifecycle semantics
  continue unchanged on the title-bar stack per F3-447/F3-460.
gui_related: true
gui_classification_reason: This unit records the removal of user-visible panel views that canon already retired or redirected.
split_recommended: false
depends_on: [F3-497]
unblocks: []
acceptance_criteria:
- "No panel-unraid or pm6-panel-notify view remains in the built document, and no activity-bar icon references them."
- "The named prototype action registrations no longer exist in the demo engine registry."
- "Notifications remain available exclusively through the title-bar stack."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: pm7_cozy_shelves_integration
implementation_surfaces:
- "Concepts/pm6-build/parts/12-html-side-panels.part.html"
- "Concepts/pm6-build/parts/29x-pm6-js-panels.part.html"
- "Concepts/pm6-build/contracts/HOOKS.md"
node_compile_hint:
  mode: retired_panel_view_removals_record
  create_worknodes: false
source_lineage:
- "Plans/FinalGUISpec.md (F3-447/F3-460 title-bar notification canon)"
preserved_exact_tokens:
- "panel-unraid"
- "pm6-panel-notify"
negative_constraints:
- "Do not reintroduce a Notifications side panel; the title-bar stack is the sole notification affordance."
- "Do not resurrect the removed prototype action ids as canonical commands."
compatibility_only_notes:
- "None."
stale_retired_dispositions:
- "The old Run & Debug demo view (panel-run markup with a launch-config dropdown and static session cards) is replaced by the Debug & Run panel per F3-485/F3-496."
owner_boundary_notes:
- "F3-447/F3-460 own the notification affordance decision; this unit records only the view removal mechanics."
owner_hints:
- "Plans/FinalGUISpec.md"
```
