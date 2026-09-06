# Shard 066: PMConcept7 Concept Promotion Addendum - 2026-07-23

Source: `Plans/FinalGUISpec.md`

Source lines: L31861-L32500

Source SHA256: `342462919f6e41f5f85d7c9e4eaf265d109a277d8ac29b0b7343a69abd20694c`

---

## PMConcept7 Concept Promotion Addendum - 2026-07-23

This addendum promotes user-approved PMConcept7 title-bar notification, page-chrome, tab-motion, hover-system, boot-paint, chat-rail, and wizard-runhead behaviors (ChatGuiUpdates2 workstreams, revs 4-9.2) into canonical PlanUnits. `Concepts/PMConcept7.html` and `Concepts/ChatGuiUpdates2.md` remain illustrative source-lineage only. This addendum creates no WorkNodes, NodeSeeds, executable queues, implementation files, runtime artifacts, generated wiring rows, production build tasks, final manifests, or PNC-019 receipts.

### F3-460 - Title-Bar Notification Stack And Count Badge

```yaml
plan_unit_id: F3-460
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  The title bar hosts a rightward notification stack with a count badge, sitting between
  the title-bar page tabs and the title-bar search, exactly centred in that gap by two
  auto margins on the notification slot (re-amended 2026-08-13), and this stack is the sole in-app
  notification affordance. Ephemeral toasts stage beneath the stack per the F3-447 staging
  contract and never join the stack or the alert store. Durable or important notifications
  stage and then join the collapsed stack with a join animation; the unread count renders
  on the count badge, and stacked items render from the shared alert store owned by F3-453
  with no private alert state on any surface. Theme chrome: glass renders the collapsed
  stack with the glass plate family and a mild left-mask peek from rgba(0,0,0,.72) to
  solid by 4%; retro renders a hard offset shadow; friendly renders free-floating cozy
  solid cards on the cozy card base fill with the stack and panel above page content.
  OS/system-tray notifications are a separate delivery layer and are unchanged.
gui_related: true
gui_classification_reason: This unit defines the visible title-bar notification stack, staging, join, and count badge behavior.
split_recommended: false
depends_on: [F3-453]
unblocks: []
acceptance_criteria:
- "The title bar renders the rightward notification stack and count badge between the title-bar page tabs and the title-bar search, exactly centred in that gap (|center(stack) - midpoint(pageTabs.right, search.left)| <= 2 px, including stacked-width animation and page-tab overflow modes), and no other in-app surface offers a standing notification affordance."
- "Ephemeral toasts stage beneath the stack per the F3-447 contract and never join the stack or leave an alert store entry."
- "Durable notifications join the collapsed stack with a join animation, and the count badge renders the unread count from the shared alert store."
- "Glass renders the collapsed-stack left mask as a mild peek from rgba(0,0,0,.72) to solid by 4%, retro renders a hard offset shadow, and friendly renders free-floating cozy solid cards above page content."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: title_bar_notification_stack_and_count_badge
  create_worknodes: false
source_lineage:
- "Concepts/PMConcept7.html (PMConcept7 demo rev 9.2; source-lineage-only per Plans/usage-feature.md)"
- "Concepts/ChatGuiUpdates2.md (PM8 workstream and rev 4-9.2 ship notes; source-lineage-only)"
preserved_exact_tokens:
- "count badge"
- "rgba(0,0,0,.72)"
- "4%"
negative_constraints:
- "Do not reintroduce a bottom-right standing toast stack, a status-bar notifications bell, an activity-bar notifications shortcut or unread dot, or a dedicated Notifications side panel affordance."
- "Do not keep private alert state on the stack; stacked items render from the F3-453 shared alert store."
compatibility_only_notes:
- "Slint portability: the collapsed stack, staged toasts, and count badge render as opaque precomputed surfaces with translate/opacity/height animations via Slint property animations; no arbitrary-content backdrop blur, no SVG filters, and color math is precomputed rather than runtime-mixed."
stale_retired_dispositions:
- "Re-amended 2026-08-13: the 2026-08-12 after-search placement (centred before the theme/settings cluster) is retired as stale — in the built artifact it drifted the stack far right of the search field and left the tabs-to-search gap empty. The between-page-tabs-and-search placement is un-retired and is canon again, now exactly centred by two auto margins on the notification slot; the slot's right auto margin pins the search and theme/settings cluster. Staging, join, count-badge and alert-store semantics are unchanged."
- "Superseded lineage (2026-08-12, itself retired 2026-08-13, kept findable): the stack briefly moved after the title-bar search on the crowding rationale; that supersede is reversed by the dated disposition above."
- "The bottom-right standing toast stack surface is retired; ephemeral toasts stage beneath the title-bar notification stack per the amended F3-447 contract."
- "The status-bar notifications bell and its popover are retired per the amended F3-448 inventory; the unread affordance is this unit's count badge."
owner_boundary_notes:
- "F3-453 owns the shared alert store and ack/snooze lifecycle; F3-447 owns the ephemeral staging cap, ordering, time to live, and exit; F3-461 owns the sprout inbox panel and kind-specific action rows."
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-461 - Notification Inbox Sprout Panel And Kind Action Rows

```yaml
plan_unit_id: F3-461
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Clicking the title-bar notification stack expands a sprout inbox panel using the same
  corner-origin sprout motion family as the chat popouts. Single-item dismiss animates a
  height spring with a size-bounce while the panel is open; Clear all runs a bottom-to-top
  collapse-up and then the panel sprout-closes with no empty flash; Esc and outside-click
  close the panel. Cards render kind-specific compact action rows: HITL cards offer
  Approve, Decline, Details, and Explain with Explain read-only; Permission cards offer
  Deny, Once, Session, and Always with pattern edit on Always per the Permissions ladder;
  FileSafe cards follow the FileSafe ladder with its 60s TTL; Concern cards require
  rationale for dismiss, resolve, or acknowledge per the Contracts rationale rules; Usage
  and Wizard cards carry their compact rows. Full questionnaire forms stay on owner
  surfaces; title-bar cards expose compact action rows plus optional rationale or Explain
  only. Details is the click-through label, and click-through routes via
  primary_route_payload / cmd.alert.open_source with the Contracts route_kind enumeration
  including toast. Dismissing a card never resolves the underlying blocker, and ephemeral
  cards are X-dismiss only. The inbox list bottom fade starts at 96% with bottom padding
  so card bottoms are not clipped.
gui_related: true
gui_classification_reason: This unit defines the visible sprout inbox panel, its dismiss and clear motions, and kind-specific compact action rows.
split_recommended: false
depends_on: [F3-460, F3-453]
unblocks: []
acceptance_criteria:
- "Clicking the stack opens the sprout inbox with the corner-origin sprout motion family; Esc and outside-click close it."
- "Single-item dismiss plays a height spring with size-bounce while the panel is open, and Clear all collapses items bottom-to-top before the panel sprout-closes with no empty flash."
- "Kind-specific compact action rows render per card kind (HITL, Permission, FileSafe, Concern, Usage, Wizard), and full questionnaire forms remain on owner surfaces."
- "Details click-through routes via primary_route_payload / cmd.alert.open_source, dismissing a card never resolves the underlying blocker, and ephemeral cards are X-dismiss only."
- "The inbox list bottom fade starts at 96% and bottom padding keeps card bottoms unclipped."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: notification_inbox_sprout_panel_and_kind_action_rows
  create_worknodes: false
source_lineage:
- "Concepts/PMConcept7.html (PMConcept7 demo rev 9.2; source-lineage-only per Plans/usage-feature.md)"
- "Concepts/ChatGuiUpdates2.md (PM8 workstream and rev 4-9.2 ship notes; source-lineage-only)"
preserved_exact_tokens:
- "Details"
- "primary_route_payload"
- "cmd.alert.open_source"
- "route_kind"
- "60s"
- "96%"
negative_constraints:
- "Do not embed full questionnaire forms in title-bar cards; compact action rows plus optional rationale or Explain only."
- "Do not let card dismissal resolve a blocking item; dismiss and resolve stay distinct."
compatibility_only_notes:
- "Slint portability: the sprout inbox panel and its cards render as opaque precomputed surfaces with translate/opacity/height animations via Slint property animations; no arbitrary-content backdrop blur, no SVG filters, and color math is precomputed rather than runtime-mixed."
stale_retired_dispositions:
- "The dedicated Notifications side panel rendering affordance is retired; the sprout inbox panel is the durable-alert rendering surface, while F3-453 continues to own the alert store and lifecycle."
owner_boundary_notes:
- "HITL, Permission, FileSafe, and Concern action semantics are owned by their existing planning documents (HITL blocked-sequence and allowed_action_ids, the Permissions ladder, the FileSafe ladder and TTL, and the Contracts rationale and route_kind rules); this unit owns the inbox presentation and compact-row surface only."
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-462 - Page Header Projects-Like Layout

```yaml
plan_unit_id: F3-462
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  On non-retro themes, the Orchestrator, Usage, and Planning Wizard workspace page headers
  match the Projects page top layout: title cluster left, actions and meta right, open
  flex, and no dense full-bleed IDE chrome bar. The friendly theme family renders rounded
  inset header boxes using radius-lg and the cozy card surface; the glass and basic
  families render the open Projects-like layout; the retro family keeps its existing
  chrome bars.
gui_related: true
gui_classification_reason: This unit defines visible page-header layout and theme box presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "Orchestrator, Usage, and Planning Wizard workspace headers on non-retro themes lay out title cluster left and actions/meta right with open flex and no full-bleed chrome bar."
- "Friendly renders rounded inset header boxes (radius-lg, cozy card surface); glass and basic render open Projects-like headers; retro keeps its chrome bars."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: page_header_projects_like_layout
  create_worknodes: false
source_lineage:
- "Concepts/PMConcept7.html (PMConcept7 demo rev 9.2; source-lineage-only per Plans/usage-feature.md)"
- "Concepts/ChatGuiUpdates2.md (PM8 workstream and rev 4-9.2 ship notes; source-lineage-only)"
preserved_exact_tokens:
- "radius-lg"
negative_constraints:
- "Do not render a dense full-bleed IDE chrome bar for these page headers on non-retro themes."
compatibility_only_notes:
- "Slint portability: header boxes render as opaque precomputed surfaces; no arbitrary-content backdrop blur, no SVG filters, and color math is precomputed rather than runtime-mixed."
stale_retired_dispositions: []
owner_boundary_notes:
- "Plans/Orchestrator_Page.md, Plans/usage-feature.md, and Plans/Planning_Wizard.md own their pages' content and data semantics; this unit owns top-of-page header layout presentation only."
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-463 - Orchestrator Tab Strip Theme Presentation

```yaml
plan_unit_id: F3-463
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  The Orchestrator tab strip keeps its tab set unchanged and restyles presentation per
  theme. Friendly renders a rounded cozy pill bar under the header pill with a visible
  gap, and active tabs are mint pills with no underline. Glass renders a rounded frosted
  bar matching the Projects sort-by toolbar, glass step-2 with hairline and inset edge,
  with the active tab at step-3. Retro and basic keep the legacy underline chrome strip.
  The strip carries bottom margin so the Node Graph pane and other panes do not sit flush
  beneath it.
gui_related: true
gui_classification_reason: This unit defines visible Orchestrator tab-strip theme skins and the content gap beneath the strip.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The Orchestrator tab set (Progress, Plan Compile, Seams, Node Graph, Evidence, History, Ledger) is unchanged by this unit; only presentation changes."
- "Friendly renders the rounded cozy pill bar with mint active pills and no underline; glass renders the frosted step-2 bar with hairline and inset edge and a step-3 active tab; retro and basic keep the legacy underline strip."
- "The strip has bottom margin so the Node Graph pane and other panes do not sit flush beneath it."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: orchestrator_tab_strip_theme_presentation
  create_worknodes: false
source_lineage:
- "Concepts/PMConcept7.html (PMConcept7 demo rev 9.2; source-lineage-only per Plans/usage-feature.md)"
- "Concepts/ChatGuiUpdates2.md (PM8 workstream and rev 4-9.2 ship notes; source-lineage-only)"
preserved_exact_tokens:
- "step-2"
- "step-3"
negative_constraints:
- "Do not change the Orchestrator tab set, tab order, or tab semantics from this unit; presentation only."
compatibility_only_notes:
- "Slint portability: the tab strip renders as opaque precomputed surfaces; no arbitrary-content backdrop blur, no SVG filters, and color math is precomputed rather than runtime-mixed."
stale_retired_dispositions: []
owner_boundary_notes:
- "The Orchestrator tab set and tab semantics are owned by Plans/Orchestrator_Page.md; this unit owns tab-strip theme presentation and the content gap only."
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-464 - Page Tab Sliding Ink And Directional Page Transitions

```yaml
plan_unit_id: F3-464
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  The active page-tab chrome is a single shared ink element that springs between tabs,
  animating position and width with spring stiffness 500 and damping 35, while the active
  tab itself keeps only its text color and weight. Per-theme ink skins: retro renders a
  lime slab with border, basic renders an accent slab, glass renders a step-3 frost pill
  with inset edge, and friendly renders a mint-mix pill with glow. Page changes animate
  directionally from tab order: the leaving page slides out 50px against the travel
  direction with a 150ms linear fade, and the entering page slides in from 50px over 300ms
  with a cubic-bezier(.25,1,.5,1) crossfade, with no blank gap and no full-page blur. The
  ink resyncs with a snap and no spring on theme or motion change, window resize, and
  fonts-ready. Under reduced motion the ink snaps and the panel animation is skipped
  entirely. First paint never runs an enter animation; page transitions gate until after
  boot.
gui_related: true
gui_classification_reason: This unit defines visible page-tab active chrome motion and directional page transitions.
split_recommended: false
depends_on: [F3-034]
unblocks: []
acceptance_criteria:
- "A single shared ink element animates position and width between page tabs with spring stiffness 500 and damping 35, and the active tab keeps only text color and weight."
- "Page changes slide directionally from tab order: exit 50px against direction with a 150ms linear fade, enter from 50px over 300ms with a cubic-bezier(.25,1,.5,1) crossfade, with no blank gap and no full-page blur."
- "The ink snap-resyncs on theme or motion change, window resize, and fonts-ready; reduced motion snaps the ink and skips the panel animation entirely."
- "First paint never runs an enter animation and transitions gate until after boot."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: page_tab_sliding_ink_and_directional_page_transitions
  create_worknodes: false
source_lineage:
- "Concepts/PMConcept7.html (PMConcept7 demo rev 9.2; source-lineage-only per Plans/usage-feature.md)"
- "Concepts/ChatGuiUpdates2.md (PM8 workstream and rev 4-9.2 ship notes; source-lineage-only)"
preserved_exact_tokens:
- "500"
- "35"
- "50px"
- "150ms"
- "300ms"
- "cubic-bezier(.25,1,.5,1)"
negative_constraints:
- "Do not insert a blank gap between the leaving and entering pages and do not blur the full page during transitions."
compatibility_only_notes:
- "Slint portability: the ink and page panels render as opaque precomputed surfaces with translate/opacity/width animations via Slint property animations; no arbitrary-content backdrop blur, no SVG filters, and color math is precomputed rather than runtime-mixed."
stale_retired_dispositions: []
owner_boundary_notes:
- "F3-445 owns the non-editor tabstrip layout recipe; F3-468 owns the boot paint and first-paint transition gate this unit consumes; this unit owns the shared ink and directional transition presentation."
- "Scope clarified 2026-08-12: this unit covers the title-bar PAGE tabs only. Editor file tabs are owned by F3-505 (contact-aware silhouette) and F3-466 (friendly tab shape); the sliding ink is not applied to editor file tabs."
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-465 - Magnet Spotlight Hover System

```yaml
plan_unit_id: F3-465
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  The selector set formerly covered by the one-shot hover jiggle runs a pointer-tracking
  magnet and spotlight hover system. The hovered box translates a few pixels toward the
  pointer via a spring using the standalone translate channel only, never transform-matrix
  composition that fights entrance animations. A continuous-intensity pointer-local accent
  ring renders as a border band with a soft interior wash and an outward bloom, and
  intensity ramps continuously from a bleed distance outside the box to full inside with
  no snap at edges. Overlaying panels must not light boxes beneath them, and nested
  targets resolve to the outer box. Per-theme feel knobs cover ring size and softness,
  magnet strength, and spring stiffness and damping: retro is stiff with a small hard
  ring, basic is restrained, glass has a wide soft ring and stronger magnet, and friendly
  is springy with micro-overshoot, with the accent color riding the theme accent. Reduced
  motion kills the entire system by clearing translate and glow and stopping the engine.
  One shared animation driver services the system, effect writes are compositor-friendly
  translate and opacity writes, and the driver self-suspends when nothing is hovered,
  settling, or glowing. On magnetic Usage cards, the painted move and resize controls define
  measured base-relative corner zones. Magnet translation attenuates continuously to zero as
  the pointer enters either zone, while body magnetism remains unchanged elsewhere. A short
  pointer-id-, time-, and bounds-scoped lease may hand an otherwise displaced corner control
  to the existing drag/resize controller from document capture; unrelated buttons, links,
  fields, pointer ids, expired leases, and points outside the corridor never activate it. Every
  direct or rescued transaction clears the lease before capture and resets latent magnet state
  on cleanup.
gui_related: true
gui_classification_reason: This unit defines visible magnet lean, spotlight ring, wash, and bloom hover behavior on shell boxes.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "Every box in the former jiggle selector set runs the magnet and spotlight hover system with spring translate toward the pointer and a continuous-intensity accent ring, interior wash, and outward bloom; Usage move/resize corner acquisition measures the painted controls in the card's base coordinates, continuously attenuates only card translation to zero near those controls, preserves body magnetism elsewhere, scopes rescue to one live pointer id plus a short time/bounds corridor, excludes other interactive controls, and clears the lease and latent magnet state on direct activation, rescued activation, commit, cancellation, and no-op cleanup."
- "Intensity ramps continuously from a bleed distance outside the box with no snap at edges; overlaying panels do not light boxes beneath them, and nested targets resolve to the outer box."
- "Per-theme knobs give retro a stiff small hard ring, basic restraint, glass a wide soft ring with stronger magnet, and friendly springy micro-overshoot, with the accent color riding the theme accent."
- "Reduced motion clears translate and glow and stops the engine; one shared self-suspending driver performs compositor-friendly translate and opacity writes."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: magnet_spotlight_hover_system
  create_worknodes: false
source_lineage:
- "Concepts/PMConcept7.html (PMConcept7 demo rev 9.2; source-lineage-only per Plans/usage-feature.md)"
- "Concepts/ChatGuiUpdates2.md (PM8 workstream and rev 4-9.2 ship notes; source-lineage-only)"
preserved_exact_tokens:
- "magnet"
- "spotlight"
- "bleed"
- "translate"
negative_constraints:
- "Do not compose the magnet through transform-matrix writes that fight entrance animations; use the standalone translate channel."
- "Do not attach per-element pointer-move listeners; one shared driver services the whole selector set through the merged document pointer-move handler."
- "Do not disable Usage card magnetism globally, synthesize a second pointerdown, or let a stale/foreign acquisition lease activate through another interactive control."
compatibility_only_notes:
- "Slint portability: the magnet maps to translate plus an animated spring, pointer tracking maps to TouchArea.mouse-cursor-position, the ring renders as a radial-gradient Rectangle with an inner cover instead of a mask, the wash is a second under-content Rectangle, and the bloom is a drop-shadow on the box (ScrollView clips automatically with no fixed proxy needed); no blend modes, filters, or canvas."
stale_retired_dispositions:
- "The F3-446 one-shot hover jiggle wobble is retired on its entire selector set and superseded by this magnet and spotlight system; the F3-446 sheen hover-lift and glass depth parallax remain live."
owner_boundary_notes:
- "F3-446 owns the sheen hover-lift, glass depth parallax, and the single merged document pointer-move handler this system rides on."
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-466 - Friendly Editor File Tab Shape

```yaml
plan_unit_id: F3-466
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  On the friendly theme family, editor file tabs render as top-rounded folder tabs with
  radius-md applied to the top corners only and a cozy mint active fill; they do not
  render as full pills on a bordered strip.
gui_related: true
gui_classification_reason: This unit defines the visible friendly-theme editor file tab shape and active fill.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "Friendly editor file tabs round only their top corners at radius-md and use the cozy mint active fill."
- "Friendly editor file tabs do not render as full pills on a bordered strip."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: friendly_editor_file_tab_shape
  create_worknodes: false
source_lineage:
- "Concepts/PMConcept7.html (PMConcept7 demo rev 9.2; source-lineage-only per Plans/usage-feature.md)"
- "Concepts/ChatGuiUpdates2.md (PM8 workstream and rev 4-9.2 ship notes; source-lineage-only)"
preserved_exact_tokens:
- "radius-md"
negative_constraints:
- "Do not render friendly editor file tabs as full pills on a bordered strip."
compatibility_only_notes:
- "Slint portability: editor tabs render as opaque precomputed surfaces with per-corner radii; no arbitrary-content backdrop blur, no SVG filters, and color math is precomputed rather than runtime-mixed."
stale_retired_dispositions: []
owner_boundary_notes:
- "F3-421 owns editor tab overflow behavior; this unit owns the friendly-theme tab shape and active fill only."
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-467 - Friendly Pill Field End Clearance

```yaml
plan_unit_id: F3-467
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  On the friendly theme family, pill-shaped chrome, including text, search, and select
  fields and pill controls, carries enough inline padding, roughly half the control height
  and 12-14px at default sizes, that glyphs clear the rounded ends, and overflow stays
  visible so the focus glow is not clipped.
gui_related: true
gui_classification_reason: This unit defines visible friendly-theme pill field padding and focus glow clearance.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "Friendly pill fields and pill controls pad inline by roughly half the control height (12-14px at default sizes) so glyphs clear the rounded ends."
- "Focus glow renders unclipped on friendly pill chrome with overflow visible."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: friendly_pill_field_end_clearance
  create_worknodes: false
source_lineage:
- "Concepts/PMConcept7.html (PMConcept7 demo rev 9.2; source-lineage-only per Plans/usage-feature.md)"
- "Concepts/ChatGuiUpdates2.md (PM8 workstream and rev 4-9.2 ship notes; source-lineage-only)"
preserved_exact_tokens:
- "12-14px"
negative_constraints:
- "Do not clip the focus glow on friendly pill chrome and do not let glyphs enter the rounded ends."
compatibility_only_notes:
- "Slint portability: pill fields render as opaque precomputed surfaces with static padding values; no arbitrary-content backdrop blur, no SVG filters, and color math is precomputed rather than runtime-mixed."
stale_retired_dispositions: []
owner_boundary_notes: []
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-468 - Boot Paint And First-Paint Transition Gate

```yaml
plan_unit_id: F3-468
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Theme boot stamps a pre-paint layer with the persisted theme's solid background color
  and color-scheme before heavy styles and assets settle, fonts load non-blocking via
  preload then swap, and page-enter transitions are gated until after first paint so boot
  never runs an opacity-zero enter animation or a double flash.
gui_related: true
gui_classification_reason: This unit defines visible boot paint, font loading, and first-paint transition gating behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "Boot stamps the persisted theme's solid background and color-scheme on a pre-paint layer before heavy styles and assets settle."
- "Fonts load non-blocking via preload then swap."
- "Page-enter transitions gate until after first paint; boot never runs an opacity-zero enter animation or a double flash."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: boot_paint_and_first_paint_transition_gate
  create_worknodes: false
source_lineage:
- "Concepts/PMConcept7.html (PMConcept7 demo rev 9.2; source-lineage-only per Plans/usage-feature.md)"
- "Concepts/ChatGuiUpdates2.md (PM8 workstream and rev 4-9.2 ship notes; source-lineage-only)"
preserved_exact_tokens:
- "color-scheme"
negative_constraints:
- "Do not render-block first paint on font loading and do not run an enter animation on first paint."
compatibility_only_notes:
- "Slint portability: the pre-paint layer maps to painting the persisted theme's solid background at window creation before content loads; no arbitrary-content backdrop blur, no SVG filters, and color math is precomputed rather than runtime-mixed."
stale_retired_dispositions: []
owner_boundary_notes:
- "F3-464 consumes this gate for page transitions; this unit owns the boot paint and the gate itself."
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-469 - Chats Rail Presentation And Resize Collapse

```yaml
plan_unit_id: F3-469
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  The chat sidebar rail label is Chats and renders at 11.5px in both expanded and
  collapsed states with no size jump, and the compact new-thread plus control is 18x18
  and vertically centered. No stream provenance banner renders, so first paint of a
  thread is the first user message. Collapse is resize-driven with no chevron collapse
  control: a resize observer toggles collapsed chrome below a 148px width threshold, the
  rail minimum width is 72px, and the collapsed state changes content chrome only without
  locking width or disabling resize. Collapsed rows truncate the title at 10px, hide
  status, timestamp, and summary, and use the thread-status color for row border and
  glow, role accent for working or unread and muted for read or draft, with active
  collapsed rows keeping the glow plus a left accent bar. The expanded selected thread
  renders a tinted fill mixing the accent or role color into the surface, a 3px inset
  left accent bar, a hairline outer ring, and a bolder title, with role colors carried to
  bar and border and per-theme shadows: retro hard offset, glass soft glow, friendly
  cozy. The presentation applies to both the docked and pop-out chat mounts, which share
  the sidebar builder.
gui_related: true
gui_classification_reason: This unit defines visible chats rail labeling, collapse geometry, row chrome, and selection presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The rail label reads Chats at 11.5px in both expanded and collapsed states, and the compact new-thread control is 18x18 and vertically centered."
- "No provenance banner renders; collapse is resize-driven below the 148px threshold with a 72px minimum width, no chevron control, and no width locking in the collapsed state."
- "Collapsed rows truncate titles at 10px, hide status, timestamp, and summary, and carry thread-status border and glow; active collapsed rows keep the glow and a left accent bar."
- "The expanded selected thread shows a tinted fill, a 3px inset left accent bar, a hairline outer ring, and a bolder title with per-theme shadows, on both docked and pop-out mounts."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: chats_rail_presentation_and_resize_collapse
  create_worknodes: false
source_lineage:
- "Concepts/PMConcept7.html (PMConcept7 demo rev 9.2; source-lineage-only per Plans/usage-feature.md)"
- "Concepts/ChatGuiUpdates2.md (PM8 workstream and rev 4-9.2 ship notes; source-lineage-only)"
preserved_exact_tokens:
- "Chats"
- "11.5px"
- "18x18"
- "148px"
- "72px"
- "10px"
- "3px"
negative_constraints:
- "Do not reintroduce a chevron collapse button and do not lock rail width or disable resize in the collapsed state."
- "Do not render a stream provenance banner ahead of the first user message."
compatibility_only_notes:
- "Slint portability: rail rows, glow, and accent bars render as opaque precomputed surfaces with width-threshold state switching; no arbitrary-content backdrop blur, no SVG filters, and color math is precomputed rather than runtime-mixed."
stale_retired_dispositions:
- "The HISTORY rail label, the chevron collapse control, and the stream provenance banner are retired per PMConcept7 chats rail cleanup; resize-driven collapse and the Chats label supersede them."
owner_boundary_notes:
- "Chat rail behavior, thread lifecycle, and rail data semantics are owned by Plans/assistant-chat-design.md (ACD-444 chats rail cleanup); this unit owns geometry, thresholds, and presentation."
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-470 - Planning Wizard Runhead One-Liner

```yaml
plan_unit_id: F3-470
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  The Planning Wizard workspace runhead is one line: the project title, a state/PRD chip,
  and the Replay control. The long PlanningRun / revision / seed meta line is removed
  from the header; PlanningRun identity, revision, and seed remain data-model canon and
  may surface in an inspector or rail, just not in the top one-liner.
gui_related: true
gui_classification_reason: This unit defines the visible Planning Wizard workspace runhead presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The wizard workspace runhead renders one line with the project title, a state/PRD chip, and the Replay control."
- "No PlanningRun / revision / seed meta line renders in the runhead; that identity remains available off-header through an inspector or rail surface."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: planning_wizard_runhead_one_liner
  create_worknodes: false
source_lineage:
- "Concepts/PMConcept7.html (PMConcept7 demo rev 9.2; source-lineage-only per Plans/usage-feature.md)"
- "Concepts/ChatGuiUpdates2.md (PM8 workstream and rev 4-9.2 ship notes; source-lineage-only)"
preserved_exact_tokens:
- "Replay"
negative_constraints:
- "Do not render the PlanningRun / revision / seed meta line in the runhead."
compatibility_only_notes:
- "Slint portability: the runhead renders as a single opaque precomputed row; no arbitrary-content backdrop blur, no SVG filters, and color math is precomputed rather than runtime-mixed."
stale_retired_dispositions:
- "The runhead PlanningRun / revision / seed meta line is retired as demo-fixture presentation; PlanningRun identity, revision, and seed remain data-model canon in Plans/Planning_Wizard.md, including approval CAS payloads."
owner_boundary_notes:
- "PlanningRun identity, revision, and seed data-model canon, including approval CAS payloads, stays in Plans/Planning_Wizard.md; this unit owns header presentation only."
owner_hints:
- "Plans/FinalGUISpec.md"
```
