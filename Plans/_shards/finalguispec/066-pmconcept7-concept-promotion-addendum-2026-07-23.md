# Shard 066: PMConcept7 Concept Promotion Addendum - 2026-07-23

Source: `Plans/FinalGUISpec.md`

Source lines: L33090-L33929

Source SHA256: `d68896987d2a5a6766fb3645ae693791c11ebac6675060550adef852e94d9f92`

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
  The title-bar bell and unread stack sit between page tabs and search, centered in that gap, and
  are the sole in-app notification affordance. F3-447 owns staging and F3-453 the shared alert
  state. With no waiting notice the bell stands alone; otherwise the newest title and at most two
  peeking cards form the stack, fanning on hover, with a rectangular unread badge. The inbox and
  each card share glyph, source/time, title, body, actions and timer anatomy. Basic is a neutral
  hairline plate with a restrained arrival and join. Friendly is a speech bubble pointing to the
  bell, an app-icon glyph tile, soft pressed keys, dot timer, hopping join and mail light; its inbox
  is a dotted tray with white/plum cards, not the old unsupported free-floating heading. Retro is a
  console window with reverse-video severity, typed title, stepped block timer and CRT
  opening/closing; Light uses perforated paper and no glow. Glass uses F3-652's menu material, with
  condensation/stack-origin opening. NieR uses parchment/ink, the existing parts for headers,
  glyphs, blocks, ground, cursor and brackets, stepped motion and no glow/blur. Arrivals,
  warning/error, join and inbox open/close use the existing family sound kit only when notifications
  and sound are enabled. Reduced Motion removes flights, springs, slides, typing, cursor blink,
  twinkles and condensation while retaining meaning, timer/count and permitted sound. Terminal and
  panel inline notices consume the same material but retain their own owner's placement and
  dismissal; the restored-terminal notice does not gain the proposed eight-second auto-dismiss.
  Setup-prompt arrival and joining follow F3-447, and the resulting entry belongs to F3-453's shared
  inbox. The unread badge includes the owner-linked setup entry under F3-453; its Continue control
  reuses that original prompt's action.
  Amended 2026-10-17 (DL-228): while a blocking item is unresolved the stack keeps F3-453's attention ring,
  drawn in each look's own form with no pill and no stripe; reading or filing never clears it. The arrival,
  join and inbox open and close sounds are the notification category of F3-405's routing matrix, not the
  onboarding and Guided Tour cue category. The empty inbox shows the look's caught-up line ("You're all caught
  up" in Basic and Glass, "All caught up!" in Friendly, "NO NEW MESSAGES" in Retro, "No new reports" in NieR)
  over "Finished work, warnings and anything that needs you will land here." The bell's accessible name is
  "Notifications: nothing new", "Notifications: N, all read" or "Notifications: N unread". Each card and inbox
  row carries its kind's mark before its title, beside it and never in its place (success complete, warning
  warning, error failed, info info; F3-658), lit and still; the dismiss is the close glyph in the same button
  and keeps its name Dismiss; the empty stack shows the bell glyph; marks hold 3:1 on severity-tinted cards.
gui_related: true
gui_classification_reason: This unit defines the visible title-bar notification stack, staging, join, and count badge behavior.
split_recommended: false
depends_on: [F3-453]
unblocks: []
acceptance_criteria:
- The title bar renders the rightward notification stack and count badge between the title-bar page tabs
  and the title-bar search, exactly centred in that gap (|center(stack) - midpoint(pageTabs.right, search.left)|
  <= 2 px, including stacked-width animation and page-tab overflow modes), and no other in-app surface
  offers a standing notification affordance.
- Ephemeral toasts stage beneath the stack per the F3-447 contract and never join the stack or leave an
  alert store entry.
- Durable notifications join the collapsed stack with a join animation, and the count badge renders the
  unread count from the shared alert store.
- Each look follows this unit's material; Friendly cards float on the dotted tray, Glass uses F3-652's
  readable menu material since the 2026-10-15 publication, and Reduced Motion removes spatial/typing effects.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
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
- Concepts/PMConcept7.html (PMConcept7 demo rev 9.2; source-lineage-only per Plans/usage-feature.md)
- Concepts/ChatGuiUpdates2.md (PM8 workstream and rev 4-9.2 ship notes; source-lineage-only)
- /mnt/Cursor/share/puppet-master/2026-10-13-notifications/NOTES.md, SHA-256 f09d2b8856652950762b6580b8ebab43022bdf053272738f52720de25922a895
  (approved campaign source lineage; not native implementation evidence)
- /mnt/Cursor/share/puppet-master/2026-10-14-plans-canon/sources/COORDINATOR-LOG.md, SHA-256 82267ce22bcc9c7d17d9f19ad806902718e1978555ada3559d24558baabbdd4f
  (approved campaign source lineage; not native implementation evidence)
- /mnt/Cursor/share/puppet-master/2026-10-16-plans-pass2/sources/2026-10-14-glass-review--JARED-FEEDBACK.md,
  SHA-256 8fe51092727cd7d2a319228114448e4bf8ac42e673461aff6968ac46ecf53d5a (source lineage; not native
  certification)
preserved_exact_tokens:
- "count badge"
- "rgba(0,0,0,.72)"
- "4%"
negative_constraints:
- Do not reintroduce a bottom-right standing toast stack, a status-bar notifications bell, an activity-bar
  notifications shortcut or unread dot, or a dedicated Notifications side panel affordance.
- Do not keep private alert state on the stack; stacked items render from the F3-453 shared alert store.
compatibility_only_notes:
- "Slint portability: the collapsed stack, staged toasts, and count badge render as opaque precomputed surfaces with translate/opacity/height animations via Slint property animations; no arbitrary-content backdrop blur, no SVG filters, and color math is precomputed rather than runtime-mixed."
stale_retired_dispositions:
- 'Re-amended 2026-08-13: the 2026-08-12 after-search placement (centred before the theme/settings cluster) is retired
  as stale — in the built artifact it drifted the stack far right of the search field and left the tabs-to-search
  gap empty. The between-page-tabs-and-search placement is un-retired and is canon again, now exactly centred by two
  auto margins on the notification slot; the slot''s right auto margin pins the search and theme/settings cluster.
  Staging, join, count-badge and alert-store semantics are unchanged.'
- 'Superseded lineage (2026-08-12, itself retired 2026-08-13, kept findable): the stack briefly moved after the title-bar
  search on the crowding rationale; that supersede is reversed by the dated disposition above.'
- The bottom-right standing toast stack surface is retired; ephemeral toasts stage beneath the title-bar notification
  stack per the amended F3-447 contract.
- The status-bar notifications bell and its popover are retired per the amended F3-448 inventory; the unread affordance
  is this unit's count badge.
- 'Amended 2026-10-14: Friendly''s tray and the four-urgency staging owner replace the older free-floating material
  and uniform notice handling.'
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
  Amended 2026-10-17 (DL-228): the inbox header shows "N new" and offers Mark all read beside Clear all: the
  typed local read projection ui.notifications.mark_all_read (CS-102), which marks every retained item read
  and never acknowledges or resolves its work. Opening the inbox still marks only the items shown (F3-453);
  the concept's dwell, which marks everything read, is not adopted. Keyboard: ArrowDown on the bell opens the
  inbox and focuses the first row; the rows are one tab stop, ArrowUp and ArrowDown move, Home and End reach
  the ends, and ArrowUp on the first row returns to the bell; Delete or Backspace dismisses the row and moves
  focus to the next; Enter activates the row's body (F3-447); Escape closes from anywhere and returns focus to
  the bell. A timed item shows its countdown ("Expires in N s", FileSafe's 60 s hold), a folded group offers
  "N more" and "Show less", and an action that opens a page reads "Open <page>".
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
  Amended 2026-10-09 (DL-184): Friendly's cozy pill bar and mint pill tabs and Glass's rounded frosted bar become
  rectangles with the look's inner radius, never capsules (F3-648); the tab set, the active fill and the bottom margin
  stand.
  Amended 2026-10-16 (DL-214): the Orchestrator's view strip is F3-652's switcher in each look's material;
  the legacy underline strip in Retro and Basic and Friendly's capsule are retired.
gui_related: true
gui_classification_reason: This unit defines visible Orchestrator tab-strip theme skins and the content gap beneath the strip.
split_recommended: false
depends_on: [DL-184]
unblocks: []
acceptance_criteria:
- "The Orchestrator tab set (Progress, Plan Compile, Seams, Node Graph, Evidence, History, Ledger) is unchanged by this unit; only presentation changes."
- "The active view is F3-652's switcher in each look's material, on the frosted step-2 bar in Glass, never an underline or a capsule; it read: mint active pills, a step-3 Glass tab and the legacy underline strip in Retro and Basic (superseded 2026-10-16, DL-214)."
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
stale_retired_dispositions:
- "Amended 2026-10-09 (DL-184): the Orchestrator strip's pill skins are retired (F3-648)."
- 'Amended 2026-10-16 (DL-214): the legacy underline strip in Retro and Basic and the remaining pill
  wording retire into F3-652''s per-look switcher.'
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
  Amended 2026-10-09 (DL-184): Glass's step-3 frost pill and Friendly's mint-mix pill become ink slabs with the look's
  inner radius, never capsules (F3-648); the shared spring, the directional page transitions and the reduced-motion
  rules stand.
  Amended 2026-10-16 (DL-214, DL-215): the per-theme ink skins above are superseded by F3-652's switcher
  in each look's material, Retro's lime slab becoming its reverse-video block and Basic's accent slab its
  tinted chip. In NieR Mode a page change erases the leaving page and wipes the entering one in; the empty
  beat between the erase and the wipe-in is at most 50 ms, and the wipe-in may start as the erase ends
  (Jared, 2026-10-16). Reduced Motion still skips the page animation.
  Amended 2026-10-17 (DL-222): the page-change hold is ACD-475's, and this unit does not keep a second
  one. While a hold waits, in Basic, Friendly and Glass the leaving page's click fade keeps moving and
  never stands on a still frame; the exit fade starts from the opacity that fade has reached, not from
  full opacity. Retro steps through the same shape. NieR and Reduce Animations make no fade. NieR's
  acknowledgement during a hold is the tab ink, and NieR's page-wipe band goes up at the release, never
  during the hold, so the leaving page stays whole until then. The empty beat of at most 50 ms is
  measured from the erase to the wipe-in, not from the click, and the hold does not relax it.
gui_related: true
gui_classification_reason: This unit defines visible page-tab active chrome motion and directional page transitions.
split_recommended: false
depends_on: [F3-034, DL-184]
unblocks: []
acceptance_criteria:
- "A single shared ink element animates position and width between page tabs with spring stiffness 500 and damping 35, and the active tab keeps only text color and weight."
- "Page changes slide directionally from tab order: exit 50px against direction with a 150ms linear fade, enter from 50px over 300ms with a cubic-bezier(.25,1,.5,1) crossfade, with no blank gap and no full-page blur."
- "The ink snap-resyncs on theme or motion change, window resize, and fonts-ready; reduced motion snaps the ink and skips the panel animation entirely."
- "First paint never runs an enter animation and transitions gate until after boot."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
- In NieR Mode no page change shows more than 50 ms of empty ground between the erase and the wipe-in.
- In NieR Mode a held page change keeps the leaving page until release, the tab ink answers the click,
  and the wipe band covers at that release. The 50 ms empty beat is erase to wipe-in.
- While a page change is held, the leaving page's fade keeps moving, and the exit starts from the opacity
  that fade has reached.
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
- /mnt/Cursor/share/puppet-master/2026-10-17-plans-f6/sources/Concepts--onboarding--opus-5.5--tools--shell_motion.py,
  SHA-256 e245b03ddc951281dc20463422fc9dddf3c5299c7f3ca3421f41b9da399ab625 (main 6a3ee2fe90; NieR's wipe
  is held with the page change and covers at the release; source lineage; not native certification)
- /mnt/Cursor/share/puppet-master/2026-10-17-plans-f6/sources/2026-10-16-motion-pass--PART2.md,
  SHA-256 1a61d195f6542a182596e531781b696927b2900248e5155b9abe134786bc0f3f (Q22 report; source lineage;
  not native certification)
preserved_exact_tokens:
- "500"
- "35"
- "50px"
- "150ms"
- "300ms"
- "cubic-bezier(.25,1,.5,1)"
negative_constraints:
- "Do not insert a blank gap between the leaving and entering pages and do not blur the full page during transitions."
- "Do not cover with NieR's page-wipe band while a page change is still held."
compatibility_only_notes:
- "Slint portability: the ink and page panels render as opaque precomputed surfaces with translate/opacity/width animations via Slint property animations; no arbitrary-content backdrop blur, no SVG filters, and color math is precomputed rather than runtime-mixed."
stale_retired_dispositions:
- "Amended 2026-10-09 (DL-184): the Glass and Friendly page-tab ink pills are retired (F3-648)."
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
  Every hoverable card, row, tile and icon in PMConcept7, the Usage plates included, runs one merged
  magnet and spotlight hover system (PMH, DL-171). It replaces both the PM8 magnet, ring, wash and bloom
  and the Usage page's own plate lift and pointer sheen, and DR-072 makes it the single owner of the hover
  grammar. One shared self-suspending animation driver rides the single merged document pointer-move
  handler that F3-446 owns (`window.PM7_PMOVE` in the concept); no element has a pointer-move listener of
  its own. The driver runs only while a spring is unsettled, the NieR reticle travels, or a pointer or
  scroll change is pending, so it stops once a pointer resting on a box has settled, and nothing animates
  at idle except the explicitly approved Friendly breathing ring while a control is hovered. Box rects are
  read when the hover enters a scope and after a scroll, a resize or a change inside that scope, never for
  every box on every frame. Targets are the outermost match of the set: markup that opts in with
  `data-pmh` (its value names the kind, card, row, tile or icon, and an empty value means card), every
  sheen-treated element, and the listed card, row, tile and icon classes. `data-pmh="off"` takes an
  element out of the set even when its class matches, and nothing inside `[data-pm-hover-exempt]` is a
  target or hovers one. Nested targets resolve to the outer box, and overlaying panels do not light boxes
  beneath them (occlusion). Intensity is one continuous field: 0 at the bleed distance outside a box,
  partial at its edge and full a short ramp inside, with no snap at edges, so a neighbour inside the bleed
  catches the light on its near edge and gets no magnet and no plate. In Basic, Friendly and Glass the
  hovered box leans toward the pointer by a small magnet, 2 to 2.5 px at an edge, on a spring that writes
  the standalone translate channel only, never transform-matrix composition that fights entrance
  animations; tiles lean less, rows by a token amount, and icons and the Usage plates get no magnet. The
  spotlight is a small soft pointer light, a radius of about 90 to 100 px with a Gaussian roll-off
  (smaller on tiles and rows), that reveals a pre-painted sheen tint and a hairline along the border,
  under the box's content; only the light's centre moves with the pointer. The emitted glow is restrained (the current PMH reference) and
  pre-painted with a short elevation shadow on a plate that stays at the box's rest rect,
  never moving with the magnet, and animates by opacity only. The family voices stay: Basic crisp with no
  overshoot, Friendly a warm pool and a soft band with a gentle settle, Glass a slow drift and a bright
  specular hairline, the accent riding the theme accent. Retro and NieR use no soft light, glow, blur,
  lean or neighbour light, and nothing follows the pointer inside a box. Retro's form is Raise: the
  hovered card's plate rises 2 px up and to the left in one hard cut while its own hard offset shadow
  grows from 3 to 5 px, so the shadow's far edge stays where it was; one 33 ms tick later a 1 px phosphor
  rule in the accent appears 1 px inside the border; on leaving, the rule goes first and the plate drops
  one tick later; tiles rise 1 px with no rule, rows take the left rail's stepped row fill, and a 2 px
  edge hold keeps the raise from toggling at the edge it moved off. NieR's form is Lock-on: one page-level
  reticle of four 8 px ink corner brackets is placed on the card's rest rect in whole device pixels, opens
  4 px outside the border and steps closed to 3 px in two steps over 90 ms, then a 1 px ink line at .6
  lands over the card's own border; between cards the reticle cuts and never glides, and the card itself
  never changes. The corners are NieR's brackets part (Target brackets); with brackets off the lock is the
  ink line alone on the same beat. NieR tiles and rows take the left rail's NieR row ink fill. Under
  Reduced Motion there is no magnet, no travel, no pointer-following light and no neighbour light, and the
  hovered box shows its hover state instantly: a static half-strength hairline and the plate in Basic,
  Friendly and Glass, the raised shadow and rule without the rise in Retro, the closed lock in NieR. On a
  software-rendered path the field, the light and the plate are off and the magnet stops, and the hovered
  box shows the same static hairline. A gesture rest (a resize, a tab or panel drag, a Usage board
  operation or moment) drops the hover and settles the magnet to 0, and a held pointer button keeps the
  hover state but calms the magnet. A hover writes no inherited property and restyles no subtree: the
  continuous values are registered non-inherited properties that the host's own pseudo-elements read,
  effects are pre-painted layers whose opacity changes plus the translate, and no box-shadow or filter
  animates on a large element. The boundary keeps editor/terminal text and drag surfaces out of card
  magnet effects. Small controls, including strip/header buttons, use the control marker described here,
  never card movement; resize bars use F3-657 instead. Glass controls use F3-652's own single optical
  marker. For small controls Basic uses a faint precise plate travelling in about 120 ms without
  overshoot, pressing to 95%; Friendly uses a springing bubble, a dot aura outside its labels and an
  approved slow breathing ring while hovered, with squish/ripple feedback; Retro uses stepped inverse
  video, a 33 ms cursor tick and a three-tick afterimage, never glow/blur; NieR uses ink/paper inversion
  through its existing parts. Reduced Motion shows all marker/press states without travel, pop, breathing,
  ripple, raise or afterimage. Overlay scaling remains centered; an already filled button keeps its fill.
  Hover recovers under an unmoved pointer after returning to a page, filtering, scroll or layout change
  and never sticks to hidden targets. The active mark follows the currently visible hit target and never
  lights content behind an occluding surface. All resting hover text meets F3-654. Jared’s 2026-10-14
  direction reduces the central spotlight immediately beneath the pointer while retaining the approved
  surface-edge glow. This applies wherever that spotlight is drawn, including Glass; exact tuning remains
  with the hover owner, with settled readability governed by F3-654.
  Amended 2026-10-17 (DL-228): that tuning landed on 2026-10-14: only the pool of light under the pointer is
  turned down, to 0.6 of its earlier strength in Basic, Friendly and Glass, dark and light, with the edge
  catch, size, falloff, lift and timings unchanged, and Glass Dark's own shine is lowered by the same ratio.
  Retro, NieR and Reduced Motion are unaffected. The factor is a concept token, not an acceptance number.
gui_related: true
gui_classification_reason: This unit defines the visible magnet lean, pointer light, emitted glow and the Retro and NieR hover forms on PMConcept7's cards, rows, tiles and icons.
split_recommended: false
depends_on: [F3-446, DL-171]
unblocks: [DR-072]
acceptance_criteria:
- Every card, row, tile and icon target in PMConcept7, the Usage plates included, takes its hover from this one system;
  no surface keeps a second hover engine, a `.pm-sheen:hover` lift or glow, or a pointer sheen of its own.
- One shared driver services every target through the single merged document pointer-move handler and adds no pointer-move
  listener; two seconds after the pointer leaves there is no hover-owned animation frame or running hover animation,
  and a pointer resting still adds no hover work after settling except the approved Friendly control ring, which stops
  on leave or hide.
- In Basic, Friendly and Glass the magnet moves a hovered card at most about 2.5 px at an edge, through the standalone
  translate channel only; icons and the Usage plates never move.
- The pointer light is a small soft pool, about 90 to 100 px in radius on cards, revealing a pre-painted sheen and
  hairline under the content; the emitted glow is restrained as in the current PMH reference, pre-painted, opacity-only, and stays at the
  box's rest rect while the box leans.
- Intensity ramps continuously from the bleed distance outside the box with no snap at edges; neighbours inside the
  bleed light only their near edge; overlaying panels do not light boxes beneath them, and nested targets resolve
  to the outer box.
- Retro shows Raise (a 2 px hard-cut rise on a 3 to 5 px hard shadow whose far edge stays put, then a 1 px phosphor
  rule one 33 ms tick later, released in the reverse order) and NieR shows Lock-on (four 8 px ink corners stepping
  closed in two steps over 90 ms, then an ink line at .6, cutting between cards), gated by the brackets part with
  the ink-line fallback; neither shows a soft light, glow, blur, lean or neighbour light.
- Under Reduced Motion there is no magnet, travel, pointer-following light or neighbour light, and every family shows
  its hover state instantly; on a software-rendered path the field, light and plate are off and the magnet stops.
- A hover writes no inherited custom property and restyles no subtree beyond the hovered box and its lit neighbours,
  and no box-shadow or filter animates on a large element.
- '`data-pmh` opts markup in with a kind, `data-pmh="off"` opts it out, nothing inside `[data-pm-hover-exempt]` hovers,
  and editor/terminal text has no card magnet; strip/header small controls use the shared control marker and resize
  dividers use F3-657.'
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
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
- Concepts/PMConcept7.html (PMConcept7 demo rev 9.2; source-lineage-only per Plans/usage-feature.md)
- Concepts/ChatGuiUpdates2.md (PM8 workstream and rev 4-9.2 ship notes; source-lineage-only)
- Concepts/onboarding/opus-5.5/src/js/18-hover.js and src/css/22-hover.css (the PMH engine and its look; concept
  lineage only)
- /mnt/Cursor/PuppetMaster-Evidence/scratch/pm7-hover-20261009/ENGINE.md, SHA-256 bd3480ac65c053210ebc6d9193480acc3c04c6592276607332817615fd76de5e
- /mnt/Cursor/PuppetMaster-Evidence/scratch/pm7-hover-20261009/FAMILY-SPEC.md, SHA-256 d66b09a302226c0682a59786d92c74d703cbdf7fc28f9bc63ffb509a07f321e8
- /mnt/Cursor/PuppetMaster-Evidence/scratch/pm7-hover-20261009/RETRO-FINAL.md, SHA-256 49546103ce230dc1db08440e01bb7dc21b02d153c74138b7618cc491b4ddba81
- /mnt/Cursor/PuppetMaster-Evidence/scratch/pm7-hover-20261009/NIER-FINAL.md, SHA-256 e647d369534c83251d9d8ba904765491db2338154f80a91ca12759a771c8e233
- /mnt/Cursor/share/puppet-master/2026-10-13-hover-polish-all-looks/NOTES.md, SHA-256 6a86e56a9edc818c4a6c812e484e40c377cf7657180d652457de64ab82fdb12c
  (approved campaign source lineage; not native implementation evidence)
- /mnt/Cursor/share/puppet-master/2026-10-14-plans-canon/sources/JARED-FEEDBACK-20261014.md, SHA-256 47218ab2d7bfdbb58e983f9e4b489f3c29cedfc7b54bcf77788d06ced0ef10e6
  (decision/source lineage; not native implementation evidence)
preserved_exact_tokens:
- "magnet"
- "spotlight"
- "bleed"
- "translate"
negative_constraints:
- Do not compose the magnet through transform-matrix writes that fight entrance animations; use the standalone translate
  channel.
- Do not attach per-element pointer-move listeners; one shared driver services every target through the merged document
  pointer-move handler.
- Do not give icons or the Usage plates a magnet, and do not let the emitted glow move with the magnet.
- Do not animate box-shadow or filter on a large element or write an inherited custom property on hover. The only
  settled-hover loop is this owner's approved Friendly control ring; after leave or hide no hover driver keeps running.
- Do not draw a soft light, glow or blur under Retro or NieR.
- Do not give tab strips, resize dividers or editor and terminal text surfaces a card magnet. Small controls use this
  owner's control hover, dividers use F3-657, and editor/terminal text itself stays outside card hover.
compatibility_only_notes:
- "Slint portability: the magnet maps to translate plus an animated spring, and pointer tracking maps to TouchArea.mouse-cursor-position. The concept draws the pointer light as one radial mask over a pre-painted sheen and hairline; Slint has no mask, so the hairline renders as a radial-gradient Rectangle centred on the pointer with an inner cover rectangle over it, inset by the line width and filled with the box's own fill, so that only the border band shows, and the sheen is a second, fainter radial-gradient Rectangle under the content; both are clipped to the box and take the field intensity as opacity. The plate is a drop-shadow on a sibling Rectangle at the rest geometry whose opacity animates (ScrollView clips automatically, with no fixed proxy needed). Retro's Raise is a translate plus a hard offset Rectangle and a 1 px inner border Rectangle; NieR's Lock-on is four corner Rectangles and a 1 px border Rectangle on stepped animations. No blend modes, filters, canvas or arbitrary-content backdrop blur."
stale_retired_dispositions:
- The F3-446 one-shot hover jiggle wobble is retired on its entire selector set and superseded by this magnet and
  spotlight system.
- 'Retired 2026-10-10 by DL-171: the PM8 accent ring, interior wash and offset bloom proxy, the F3-446 sheen hover-lift
  and glow, the Usage page''s own plate lift and 280 px pointer sheen, and the per-theme knobs that gave retro a stiff
  small hard ring and glass a wide soft ring with a stronger magnet.'
- 'Retired 2026-10-10: the Usage `.pm7u-card` corner-zone magnet attenuation and the pointer-scoped acquisition lease
  to the drag/resize controller; those cards no longer exist after the Usage port, and the Usage `.pmu-card` plates
  carry no magnet, so no lease is needed.'
- 'Amended 2026-10-14: The static-tint-only small-control restriction is superseded by the approved control-marker
  polish; card hover is unchanged.'
owner_boundary_notes:
- "F3-446 owns the single merged document pointer-move handler this system uses; its former Glass depth parallax is compatibility/source lineage only. DR-072 makes this unit the single owner of the hover grammar."
- "Tab silhouettes and tab hover belong to their tab owners (F3-505, F3-466); the resizers keep their own grab glow; the left rail's rows and icons keep their owner's hover."
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
  Amended 2026-10-09 (DL-180): Friendly's editor tabs are F3-631's one strip with the Friendly crown, shoulder and flare
  (16, 16 and 25 px); the active tab takes its body's own fill and is never a pill.
gui_related: true
gui_classification_reason: This unit defines the visible friendly-theme editor file tab shape and active fill.
split_recommended: false
depends_on: [DL-180]
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
stale_retired_dispositions:
- "Amended 2026-10-09 (DL-180): the Friendly editor tab shape is now F3-631's per-look silhouette."
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
  Amended 2026-10-09 (DL-184): Friendly's pill controls and pill-shaped fields are retired: they take the look's rounded
  rectangle, never a radius of half their height or more (F3-648); the inline padding rule (glyphs clear the corners,
  the focus glow is not clipped) stands.
gui_related: true
gui_classification_reason: This unit defines visible friendly-theme pill field padding and focus glow clearance.
split_recommended: false
depends_on: [DL-184]
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
stale_retired_dispositions:
- "Amended 2026-10-09 (DL-184): Friendly's pill field and control skins are retired (F3-648)."
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
  never runs an opacity-zero enter animation or a double flash. The persisted theme is the look
  stored in the Settings of the Project the application opens on, NieR Mode included (its
  ground, and while NieR's boot log is coming the page waits under the log's own paper), so
  the first frame is already that look and no default look shows before it. The pre-paint only
  reads it: it stores no theme of its own, and the Project's Settings stay the one owner and the
  one store of the theme (DL-153). A new install's onboarding paints Basic Dark instead (F3-520).
gui_related: true
gui_classification_reason: This unit defines visible boot paint, font loading, and first-paint transition gating behavior.
split_recommended: false
depends_on: [DL-153]
unblocks: []
acceptance_criteria:
- "Boot stamps the persisted theme's solid background and color-scheme on a pre-paint layer before heavy styles and assets settle."
- "The first frame of an ordinary open is the look stored for the Project the application opens on, in each of the eight family variants and in NieR Mode light and dark; no default look shows before it, and with NieR's boot log coming the page shows only the log's paper before the log (DL-153)."
- "The pre-paint reads the Project's stored Settings and writes no theme anywhere: no global or cross-Project theme key exists (DL-153)."
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
stale_retired_dispositions:
- "Amended 2026-10-09 (DL-153): the persisted theme the pre-paint stamps is the look stored for the Project the application opens on, read from its Settings, NieR Mode included; the concept's fixed Basic Dark boot paint is retired, and no global theme key is added."
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
  Amended 2026-10-09 (DL-184): the 3 px inset left accent bar on the selected thread and the left accent bar on active
  collapsed rows are retired; selection is the tinted fill, the hairline ring and the bolder title (F3-648).
  PMConcept7's Chats rail retires when the 5.6 Pro chat is ported (ACD-444), not now.
gui_related: true
gui_classification_reason: This unit defines visible chats rail labeling, collapse geometry, row chrome, and selection presentation.
split_recommended: false
depends_on: [DL-184]
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
- "Amended 2026-10-10 (lead ruling L12): The Chats rail stays until the 5.6 Pro chat port (ACD-444)."
- "The HISTORY rail label, the chevron collapse control, and the stream provenance banner are retired per PMConcept7 chats rail cleanup; resize-driven collapse and the Chats label supersede them."
- "Amended 2026-10-09 (DL-184): the inset left accent bar and the collapsed rows' left accent bar are retired as coloured side bars (F3-648)."
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
