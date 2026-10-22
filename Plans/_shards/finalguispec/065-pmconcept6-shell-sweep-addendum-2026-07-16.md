# Shard 065: PMConcept6 Shell Sweep Addendum - 2026-07-16

Source: `Plans/FinalGUISpec.md`

Source lines: L32464-L33088

Source SHA256: `38b5a5837d67aacf53f7cc0677b84df0ca93aeb1d117d9f137eac572048db716`

---

## PMConcept6 Shell Sweep Addendum - 2026-07-16

This addendum promotes user-approved PMConcept6 shell behaviors (tabstrip recipe, hover micro-interactions, toast stack, status bar chips, terminal customization and split guard, and the testing, agents, and notifications side panels) into canonical PlanUnits. `Concepts/pm6-build/**` remains illustrative source-lineage only per `Plans/usage-feature.md`. This addendum creates no WorkNodes, NodeSeeds, executable queues, implementation files, runtime artifacts, generated wiring rows, production build tasks, final manifests, or PNC-019 receipts. The PMConcept7 Concept Promotion Addendum (2026-07-23) supersedes the toast-stack, status-bar chip, hover-jiggle, and notifications-bell/side-panel portions of this addendum; F3-446, F3-447, F3-448, and F3-453 below are amended in place and F3-460, F3-461, and F3-465 carry the successor canon.

### F3-445 - Unified Non-Editor Tabstrip Recipe

```yaml
plan_unit_id: F3-445
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Non-editor tab systems, including page tabs, side-panel occupant tabs, and bottom-panel
  tabs, share one tabstrip recipe: tabs lay out on a single non-wrapping row, the strip
  scrolls horizontally when tabs overflow its width, and tab labels truncate with an
  ellipsis. Tabs shrink flexibly between a 56px minimum and a 180px maximum width. Editor
  tabs are explicitly excluded from this recipe and keep the width-aware "+N more" overflow
  chip specified by F3-421. The recovered PMConcept7 title-bar page strip may use its existing
  bounded page-overflow picker when physical width cannot keep every named page visible. While
  that in-tree picker is opening, open, or closing, the strip's decorative edge-fade mask is
  disabled so the picker stays painted above and hit-testable instead of exposing page controls
  beneath it; the mask returns immediately after the picker closes. Amended 2026-10-09 (DL-162): the
  left rail's segmented sub-view strips neither scroll nor truncate a label with an ellipsis; they fit
  as F3-620 says, full labels, then the active tab's label with icons for the rest, then icons only.
  Amended 2026-10-09 (DL-180): bottom-panel tabs no longer exist. Every home panel's strip, the dashboard's included,
  follows F3-631 and F3-633 (the width cascade and "+N", never scrolling sideways); this recipe keeps page tabs and the
  side-panel occupant tabs F3-620 does not cover.
gui_related: true
gui_classification_reason: This unit defines visible tabstrip layout, scrolling, and label truncation for non-editor tab systems.
split_recommended: false
depends_on: [F3-421, DL-180]
unblocks: []
acceptance_criteria:
- "Page tabs, side-panel occupant tabs, and bottom-panel tabs render on one non-wrapping row that scrolls horizontally on overflow with ellipsized labels; when the PMConcept7 title-bar page overflow picker is present, every hidden page remains reachable, the picker stays above and owns hit testing across its full painted rectangle, the ancestor edge-fade mask is disabled only for its opening/open/closing lifecycle, and no click falls through to an underlying page control."
- "Tabs in these systems shrink no narrower than 56px and grow no wider than 180px."
- "Editor tabs keep the F3-421 +N more overflow chip and do not adopt the scroll-and-ellipsis recipe."
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
  mode: unified_non_editor_tabstrip_recipe
  create_worknodes: false
source_lineage:
- "Plans/FinalGUISpec.md:27497"
- "Concepts/pm6-build (PMConcept6 demo; source-lineage-only per Plans/usage-feature.md)"
- "Plans/Decision_Log.md#DL-162 (owner decision 2026-10-09; the left rail's segmented strips fit by F3-620)"
preserved_exact_tokens:
- "56px"
- "180px"
- "+N more"
negative_constraints:
- "Editor tabs keep the +N more overflow chip; the scroll-and-ellipsis recipe must not replace editor tab overflow behavior."
- "Do not leave the title-bar edge-fade mask active over an open in-tree page picker or disable that mask after the picker closes."
compatibility_only_notes:
- "Slint portability: the tabstrip renders as an opaque horizontally scrollable row of precomputed surfaces; no arbitrary-content backdrop blur, no SVG filters, and color math is precomputed rather than runtime-mixed."
stale_retired_dispositions:
- "Amended 2026-10-09 (DL-180): bottom-panel tabs and every home strip leave this recipe for F3-631 and F3-633."
owner_boundary_notes: []
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-446 - Shell Hover Micro-Interactions

```yaml
plan_unit_id: F3-446
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Shell elements carrying the sheen treatment, approximately 40 shell elements, keep their place as hover
  targets: the sheen class marks them into the F3-465 merged hover system, which owns their whole hover look
  and motion. The former sheen hover-lift and its glow (the base, Friendly and Glass `.pm-sheen:hover` lift,
  border and glow) are retired in favour of F3-465 (DL-171), and no sheen element carries a hover-lift or
  glow of its own. Hover is driven by event delegation from a shared pointer handler and executed through
  compositor-friendly writes rather than per-frame style writes. Amended 2026-10-16 (SSYS-054/SP-333): the
  former glass depth background mode and its pointer parallax obligation are retired compatibility/source
  lineage; no current Wallpaper selection enables that old mode or revives its sampler. All active
  document-level pointer-move work, including the F3-465 hover driver, remains merged into a single shared
  document pointer-move handler (`window.PM7_PMOVE` in the concept) that every consumer hooks into rather
  than listening itself. The retired parallax sampler stays inactive under every motion preference; F3-465
  sets the active hover's reduced-motion form.
gui_related: true
gui_classification_reason: This unit defines the shell hover targets and single merged pointer-move handler; retired Glass depth parallax is compatibility/source lineage only.
split_recommended: false
depends_on: [F3-428]
unblocks: [F3-465]
acceptance_criteria:
- Sheen-treated shell elements are F3-465 hover targets and show F3-465's hover; no `.pm-sheen:hover` lift, border
  or glow of their own remains in any family.
- The retired glass depth mode activates no pointer parallax; exactly one merged document pointer-move handler
  services active delegated hover effects and the F3-465 hover driver.
- With reduced motion active, the sheen elements show F3-465's reduced-motion hover; the retired parallax sampler
  remains inactive.
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
  mode: shell_hover_micro_interactions
  create_worknodes: false
source_lineage:
- "Plans/FinalGUISpec.md:5482"
- "Concepts/pm6-build (PMConcept6 demo; source-lineage-only per Plans/usage-feature.md)"
- "Concepts/onboarding/opus-5.5/tools/build.py, the `pmh:` PATCHES that keep the dispatcher and retire the sheen hover (concept lineage only)"
preserved_exact_tokens:
- "sheen"
- "parallax"
- "depth"
negative_constraints:
- Do not attach per-control pointer-move listeners or multiple document pointer-move handlers for these effects.
- Do not reactivate the retired glass depth mode or its pointer parallax sampler through a Wallpaper selection.
- Do not restore a sheen hover-lift or glow beside the F3-465 hover.
compatibility_only_notes:
- "Slint portability: the sheen elements' hover follows F3-465's Slint notes; parallax maps to a translate on opaque precomputed background layers with no per-frame style writes; no arbitrary-content backdrop blur, no SVG filters, and color math is precomputed rather than runtime-mixed."
stale_retired_dispositions:
- "The one-shot hover jiggle wobble on designated shell controls is retired per PMConcept7 rev 7, superseded by the F3-465 magnet spotlight hover system on the same selector set; glass depth parallax remains live and stays reduced-motion-disabled."
- "Retired 2026-10-10 by DL-171: the sheen hover-lift and its glow (`.pm-sheen:hover` in the base, Friendly and Glass), in favour of the F3-465 merged hover system."
owner_boundary_notes:
- "F3-465 owns the hover look and motion of every sheen element; this unit owns the targets' placement and single merged document pointer-move handler. Retired Glass depth parallax is compatibility/source lineage only."
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-447 - Toast Stack Contract

```yaml
plan_unit_id: F3-447
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  All staged notices appear beneath the title-bar bell/stack on every page, including Usage. Four
  urgency levels share this staging owner: Quiet confirmations last 3.4 s and leave no alert-store
  entry; Notice lasts 3.4 s, Attention 5.2 s and Blocking 6.8 s before joining F3-453's lasting
  inbox. Reading timers are not shortened by Animation speed; hovering any toast or focusing within
  one holds every staged timer, with a visible remaining-time line. Newest is on top and at most
  five stage together; overflow retires the oldest quiet notice or moves the oldest lasting notice
  to the inbox immediately. Repeated words count on one card, and duplicate delivery of one event
  produces one notice. Closing or swiping a staged lasting notice moves it to the inbox and never
  resolves the underlying work; quiet dismissal removes it. Reduced Motion shows/removes end states
  immediately and joins the inbox without flight. Settings Notifications off suppresses popup and
  sound delivery but preserves lasting inbox items. How Alerts Appear selects Toast, Banner under
  the title bar, or System Tray with no in-page popup; platform delivery retains its own
  capability/permission rules. Setup/continue-tour prompts arrive under the bell, with new toasts
  above; after 4.5 s of reading or the first press, key or wheel elsewhere they join the shared bell
  inbox with their existing resume action. A newly presented prompt may arrive again. Tour page
  notes use the quiet staging route. Placement is re-evaluated on page changes and relevant geometry
  changes, with Home staging below its panel strip and the inbox leaving room for staged notices
  beneath it. Keep notice content clear of nearby controls. When space runs out, older lasting
  notices join the bell first; if still crowded, a new lasting toast joins it directly and its
  unread badge counts it. A quiet note uses a shortened bounded reading interval rather than
  becoming a lasting alert. The bell remains anchored in its title-bar gap; notices never retain
  another page's coordinates. F3-460 owns material and F3-453 the lasting store. Activating a
  toast’s body opens what it is about through the existing source action and marks that notice read.
  Activating its action button runs that owner action and files any lasting notice quietly; it never
  also invokes the body’s source-opening action. Read and filing do not acknowledge or resolve
  underlying work by implication. Collision avoidance tries the nearest clear position downward,
  then sideways, and recomputes on scroll; the stage avoids buttons, fields, links, tabs and
  switches. Placement moves ease for 180 ms, immediate under Reduced Motion. If no position clears,
  lasting cards join the bell; a crowded quiet note's reading interval is min(normal interval,
  max(1800 ms, half the normal interval rounded to ms)). This tuning never changes the owner
  operation.
  Amended 2026-10-17 (DL-228): in Banner mode one banner shows under the title bar at a time and the rest wait
  in arrival order. Its Show action opens the inbox at that notice. It keeps the staged reading time with the
  same hover and focus hold; a Blocking banner is announced as an alert and the others as status. It enters in
  the look's motion, Retro and NieR wiping in and the others sliding, and appears at once under Reduced
  Motion. Closing a lasting banner files it in the inbox like a toast, so nothing is lost, and banners take
  F3-460's arrival sounds; the concept's banner, which discards on close and plays no sound, is not adopted
  there. A page's own quiet confirmation, Home's panel notes and Usage's notes included, is a Quiet notice
  through this one staging under the bell (DL-193: Usage notices appear under the bell like every other page);
  no page keeps a toast line of its own.
gui_related: true
gui_classification_reason: This unit defines visible ephemeral toast staging, lifetime, and dismissal behavior.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- At most 5 staged toasts render concurrently beneath the title-bar notification stack; a new toast beyond
  the cap evicts the oldest.
- Each urgency uses F3-447's specified lifetime; hover/focus holds every reading timer and Reduced Motion
  changes only motion.
- The newest toast stages on top of the staged set.
- Ephemeral toasts never archive to the shared alert store and leave no store entry.
- Under reduced motion, dismissal is instant with no exit animation.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
- Usage has no bottom-right staging exception; every page routes notices beneath the bell.
- Hover/focus pauses reading time; a sixth lasting notice is retained, never lost.
- Toast body activation opens its source and marks it read; action activation dispatches only its own
  action and quietly files a lasting notice, without resolving the source by dismissal.
- Optional setup joins the existing inbox after its reading interval or interaction elsewhere, and its
  resume action remains reachable there.
- Page changes, crowded controls and an open inbox preserve the shared bell anchor and lasting notices,
  without inventing a page-private store.
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: toast_stack_contract
  create_worknodes: false
source_lineage:
- Plans/FinalGUISpec.md:1484
- Plans/FinalGUISpec.md:1918
- Concepts/pm6-build (PMConcept6 demo; source-lineage-only per Plans/usage-feature.md)
- /mnt/Cursor/share/puppet-master/2026-10-13-notifications/NOTES.md, SHA-256 f09d2b8856652950762b6580b8ebab43022bdf053272738f52720de25922a895
  (approved campaign source lineage; not native implementation evidence)
- /mnt/Cursor/share/puppet-master/2026-10-14-plans-canon/sources/COORDINATOR-LOG.md, SHA-256 82267ce22bcc9c7d17d9f19ad806902718e1978555ada3559d24558baabbdd4f
  (approved campaign source lineage; not native implementation evidence)
- /mnt/Cursor/share/puppet-master/2026-10-16-plans-pass2/sources/2026-10-14-glass-review--JARED-FEEDBACK.md,
  SHA-256 8fe51092727cd7d2a319228114448e4bf8ac42e673461aff6968ac46ecf53d5a (source lineage; not native
  certification)
- /mnt/Cursor/share/puppet-master/2026-10-16-plans-pass2/sources/2026-10-14-glass-review--LANDING.md,
  SHA-256 4585c89ab98c4ee6c88f0683ac8d00244725047fe2637fe657371ec42cff17bd (source lineage; not native
  certification)
- /mnt/Cursor/share/puppet-master/2026-10-16-plans-pass2/sources/opus-5.5--src--js--19-notify.js, SHA-256
  80f415f7e4ef676748322cdf8ce40ea25b4a0adfa5897d4002e83f2ae327f667 (source lineage; not native certification)
- /mnt/Cursor/share/puppet-master/2026-10-16-plans-pass2/sources/src--panels--js--50-pageshell.js, SHA-256
  340bc0a7ca9b5ec1fb883fe0758d6c731fea8dc2318a5622817ffb93af733d0c (source lineage; not native certification)
preserved_exact_tokens:
- "5"
- "3.4s"
negative_constraints:
- Do not render more than 5 concurrent staged toasts or discard a lasting notice on overflow; reading holds suspend
  the lifetime.
- Do not archive an ephemeral toast to the shared alert store or leave any store entry for it.
compatibility_only_notes:
- "Slint portability: staged toasts render as opaque precomputed surfaces with translate/opacity/height animations via Slint property animations; no arbitrary-content backdrop blur, no SVG filters, and color math is precomputed rather than runtime-mixed."
stale_retired_dispositions:
- The bottom-right standing toast stack surface is retired per PMConcept7 title-bar notifications; ephemeral
  toasts now stage beneath the title-bar notification stack owned by F3-460, with the sprout inbox panel
  owned by F3-461.
- 'Amended 2026-10-14: The uniform 3.4 s lifetime for all urgency levels and the Usage bottom-right exception
  are superseded.'
- 'Amended 2026-10-16 (PM7 pass 2): The indefinitely pinned setup card is superseded by a bounded arrival
  followed by the shared inbox.'
owner_boundary_notes:
- "F3-460 owns the title-bar notification stack and count badge that hosts this staging area; this unit owns the ephemeral staging cap, ordering, time to live, and exit behavior."
owner_hints:
- "Plans/FinalGUISpec.md"

```

### F3-448 - Status Bar Chip Inventory And Click Behaviors

```yaml
plan_unit_id: F3-448
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  The status bar carries a canonical chip inventory: a workspace status menu; an
  orchestrator status chip; a semantic index ticker; a ports chip; a branch chip; and a
  sync chip. No platform picker, model picker, chat mode chip, context meter, or
  notifications bell renders in the status bar; the assistant chat surface owns requested
  platform, model, and mode with their applies-next-turn registration, the chat context
  ring owns context usage display, and the title-bar notification stack and count badge
  own the notification affordance.
  Amended 2026-10-17 (DL-228): each status-bar item's hover tag (F3-523) names what the item shows or does,
  with a plain detail, for example System status, "Everything Puppet Master needs is running. Click to see
  each service." An item without words of its own takes the button default ("Click to see the details.") or
  the readout default ("Shows the latest known state."), never the generic "Choose this option."
gui_related: true
gui_classification_reason: This unit defines visible status bar chips and their click behaviors.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- "The status bar renders exactly the workspace status menu, orchestrator status chip, semantic index ticker, ports, branch, and sync chips."
- "No platform picker, model picker, chat mode chip, context meter, or notifications bell renders in the status bar."
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
  mode: status_bar_chip_inventory_and_click_behaviors
  create_worknodes: false
source_lineage:
- "Plans/FinalGUISpec.md:545"
- "Plans/FinalGUISpec.md:553"
- "Concepts/pm6-build (PMConcept6 demo; source-lineage-only per Plans/usage-feature.md)"
preserved_exact_tokens:
- "workspace status menu"
- "semantic index ticker"
negative_constraints:
- "Do not reintroduce platform, model, mode, context, or notification chips into the status bar; those affordances are owned by the assistant chat surface, the chat context ring, and the title-bar notification stack."
compatibility_only_notes:
- "Slint portability: chips render as opaque precomputed surfaces; no arbitrary-content backdrop blur, no SVG filters, and color math is precomputed rather than runtime-mixed."
stale_retired_dispositions:
- "The status-bar platform picker chip and model picker chip are retired per PMConcept7 status-bar trim; the assistant chat surface owns requested platform and model, and the applies-next-turn semantics move with that chat-side platform/model registration (ACD-437 lineage)."
- "The status-bar chat mode chip is retired; the assistant chat surface owns requested chat mode with the same applies-next-turn registration."
- "The status-bar context bar chip, including its context-window fill meter and 75% warning presentation, is retired; the chat context ring owns context usage display."
- "The status-bar notifications bell and its popover are retired per PMConcept7 title-bar notifications; the unread affordance is the title-bar notification stack count badge (F3-460) and the inbox surface is the sprout inbox panel (F3-461)."
owner_boundary_notes:
- "Plans/assistant-chat-design.md owns requested platform, model, and mode registration and their applies-next-turn semantics; the title-bar notification stack and inbox are owned by F3-460 and F3-461; this unit records the trimmed status-bar chip inventory."
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-449 - Terminal Tab Customization

```yaml
plan_unit_id: F3-449
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Renaming a terminal is the panel tab rename (`cmd.panel_tab.rename`, F3-631): from the tab's menu the user sets a
  label that replaces the terminal's own label (F3-640) until it is cleared. Workgroups retire, and workgroup rename
  with them (DL-181). The 8-color accent swatch and the 20-icon catalog are not drawn on the redesigned strip, which
  marks a tab only with its silhouette and the one mark set (F3-631, DL-141), and no colour is ever drawn on a tab as
  a coloured border or stripe (DR-069).
  Amended 2026-10-10 (DL-187, D34): Jared confirmed this: terminal tab colours and icons stay off the strip for now
  ("redesign them"), and they will be redesigned as part of Puppet Master's neon glyph system. Amended 2026-10-17 (DL-228): that
  redesign is F3-658's terminal family, an uncoloured terminal kind glyph lit on hover with state only through the
  shared mark slot; no person-chosen tab colour or icon returns.
gui_related: true
gui_classification_reason: This unit defines visible terminal tab rename, color, and icon customization controls.
split_recommended: false
depends_on: [DL-181, DL-187, F3-640, F3-631]
unblocks: []
acceptance_criteria:
- "A terminal tab can be renamed from its tab menu through cmd.panel_tab.rename, and clearing the label restores the terminal's own label."
- "No workgroup rename, accent swatch or icon catalog is drawn for terminal tabs, and no tab colour is drawn as a coloured border or stripe."
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
  mode: terminal_tab_customization
  create_worknodes: false
source_lineage:
- "Plans/FinalGUISpec.md:6892"
- "Plans/FinalGUISpec.md:6945"
- "Concepts/pm6-build (PMConcept6 demo; source-lineage-only per Plans/usage-feature.md)"
- "/mnt/Cursor/PuppetMaster-Evidence/scratch/home-panels-terminal-20261009/canon-inputs/followup/DECISIONS-ADDENDUM-3.md, SHA-256 ecd18c2f2d8ac8f714f9578170d321584fb871e3d19601a68061898ffd6759a9 (D34)"
preserved_exact_tokens:
- "8"
- "20"
negative_constraints:
- "Do not expose customization through hidden gestures only; the tab context or customize menu is the canonical entry point."
compatibility_only_notes:
- "Slint portability: context and customize menus render as opaque precomputed surfaces; no arbitrary-content backdrop blur, no SVG filters, and color math is precomputed rather than runtime-mixed."
- "Earlier text, lineage only: Terminal workgroups and individual terminals support user customization from terminal tab context and customize menus: per-workgroup rename, per-terminal rename, an accent color chosen from an 8-color swatch, and an icon chosen from a 20-icon catalog. Chosen names, colors, and icons render on the corresponding workgroup and terminal tabs."
stale_retired_dispositions:
- "Amended 2026-10-09 (DL-181): workgroup rename retires, terminal rename becomes the panel tab rename, and the accent swatch and icon catalog are not drawn on the strip."
- "Amended 2026-10-10 (DL-187, D34): Jared kept terminal tab colours and icons off the strip until the neon glyph system redesigns them."
owner_boundary_notes: []
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-450 - Terminal Pane Split Guard

```yaml
plan_unit_id: F3-450
unit_type: constraint
status: superseded
owner_doc: Plans/FinalGUISpec.md
superseded_by: F3-640
canonical_text: >-
  COMPATIBILITY AND SOURCE-LINEAGE ONLY -- NOT ACTIVE CURRENT-PRODUCT TRUTH. The four-pane cap and the 2x2 grid inside
  a terminal workgroup section retire: a terminal tab holds one session and no panes, Split opens a new panel by the
  panels' split fit rule, and four terminals side by side are the Terminals 2x2 named layout of four panels (F3-630,
  SMPFS-180). The text below is retained verbatim for lineage and audit and must not be accepted or indexed as
  active current-product truth. Superseded by F3-640 (DL-181).
  A terminal workgroup section holds at most 4 leaf panes, arranged in a 2x2 grid at
  capacity. When a section is at the 4-pane cap, split affordances render disabled with a
  visible reason instead of disappearing or failing silently.
gui_related: true
gui_classification_reason: This unit constrains visible terminal split layout and split affordance states.
split_recommended: false
depends_on: [F3-063, DL-181]
unblocks: []
acceptance_criteria:
- "No split action can create a fifth pane in a terminal workgroup section."
- "Four panes in a section lay out as a 2x2 grid."
- "At the cap, split affordances are disabled with a visible reason rather than hidden or silently inert."
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
  mode: terminal_pane_split_guard
  create_worknodes: false
source_lineage:
- "Plans/FinalGUISpec.md:6945"
- "Concepts/pm6-build (PMConcept6 demo; source-lineage-only per Plans/usage-feature.md)"
preserved_exact_tokens:
- "4"
- "2x2"
negative_constraints:
- "Split affordances must not silently no-op or disappear at the pane cap; they disable with a reason."
compatibility_only_notes:
- "Slint portability: disabled split affordances and their reason presentation render as opaque precomputed surfaces; no arbitrary-content backdrop blur, no SVG filters, and color math is precomputed rather than runtime-mixed."
stale_retired_dispositions:
- "Superseded 2026-10-09 (DL-181): one session per tab and no splits inside a terminal; the four-section and four-pane caps retire, and Terminals 2x2 is a named layout of four panels."
owner_boundary_notes: []
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-451 - Testing Side Panel

```yaml
plan_unit_id: F3-451
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  The Testing side panel joins the canonical side-panel inventory. The occupant displays
  the project's test policy, the last test run status and results, and a run-tests control
  wired to the test runner subsystem so runs started from the panel execute through the
  canonical test execution path.
gui_related: true
gui_classification_reason: This unit defines a visible side panel and its displayed testing surface.
split_recommended: false
depends_on: [F3-042, F3-035]
unblocks: []
acceptance_criteria:
- "Testing appears in the canonical side-panel inventory and opens as a side-panel occupant."
- "The occupant displays the test policy and the last run status and results."
- "The run-tests control invokes the test runner subsystem's canonical execution path."
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
  mode: testing_side_panel
  create_worknodes: false
source_lineage:
- "Plans/FinalGUISpec.md:5854"
- "Plans/FinalGUISpec.md:5482"
- "Concepts/pm6-build (PMConcept6 demo; source-lineage-only per Plans/usage-feature.md)"
preserved_exact_tokens:
- "Testing"
- "test policy"
negative_constraints:
- "The panel must not define or duplicate test execution semantics; it displays and wires to the test runner subsystem."
compatibility_only_notes:
- "Slint portability: the panel occupant renders as opaque precomputed surfaces; no arbitrary-content backdrop blur, no SVG filters, and color math is precomputed rather than runtime-mixed."
stale_retired_dispositions: []
owner_boundary_notes:
- "Plans/Automated_Testing_System.md owns test execution behavior, policy semantics, runner selection, and result production; this unit records only the Testing panel's presence in the side-panel inventory and its display and wiring surface."
- "The F3-042 inventory edit (8 panels to 11) lands in the same seal; this unit references plain F3-042."
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-452 - Agents Side Panel

```yaml
plan_unit_id: F3-452
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  The Agents side panel joins the canonical side-panel inventory. The occupant mirrors the
  subagent registry, listing active and available subagents, and provides lineage
  entrypoints that navigate to the corresponding agent lineage views.
gui_related: true
gui_classification_reason: This unit defines a visible side panel and its displayed subagent surface.
split_recommended: false
depends_on: [F3-042]
unblocks: []
acceptance_criteria:
- "Agents appears in the canonical side-panel inventory and opens as a side-panel occupant."
- "The occupant lists active and available subagents mirrored from the subagent registry."
- "Lineage entrypoints navigate to the corresponding agent lineage views."
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
  mode: agents_side_panel
  create_worknodes: false
source_lineage:
- "Plans/FinalGUISpec.md:5854"
- "Concepts/pm6-build (PMConcept6 demo; source-lineage-only per Plans/usage-feature.md)"
preserved_exact_tokens:
- "Agents"
- "subagent registry"
negative_constraints:
- "The panel must not maintain its own subagent state; it mirrors the subagent registry."
compatibility_only_notes:
- "Slint portability: the panel occupant renders as opaque precomputed surfaces; no arbitrary-content backdrop blur, no SVG filters, and color math is precomputed rather than runtime-mixed."
stale_retired_dispositions: []
owner_boundary_notes:
- "The subagent registry and lineage semantics are owned by their existing planning documents; this unit records the panel's presence in the inventory and its mirror and entrypoint surface."
owner_hints:
- "Plans/FinalGUISpec.md"
```

### F3-453 - Notifications Side Panel And Alert Lifecycle

```yaml
plan_unit_id: F3-453
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  This unit owns the shared alert store. Alerts carry an acknowledge (ack) and snooze lifecycle:
  acknowledging clears an alert's unread state, snoozing hides the alert until its snooze window elapses,
  and unresolved alerts persist in the store and render in the title-bar sprout inbox list. Unread alerts
  drive the count badge on the title-bar notification stack (F3-460). The title-bar collapsed stack and the
  sprout inbox panel render from this one alert store; no surface keeps a private copy of alert state. The
  inbox sorts Needs you first, then groups by source (Usage, Runs, Planning, Agents, Settings, Projects); a
  group with at least three notices folds to a newest-first deck and opens without changing its underlying
  work. The badge counts unread, not all retained items. Opening the inbox marks the items actually shown
  read after about one second of reading; hidden/unshown items do not become read by implication.
  Dismiss/Delete and Clear all remove inbox presentation, never approve, deny or resolve domain work. After
  Clear all, later arrivals and a reopened inbox show their headings and rows normally. Existing approval,
  permission, FileSafe and concern actions keep their owner commands, reasons and holds. A blocking item's
  attention ring remains until its underlying need is resolved; dismissing a card alone is not that
  resolution. Read projection is CS-102's ui.notifications.mark_visible_read, distinct from an explicit
  domain acknowledge action. Dismiss/Delete and Clear all use UCC-204's existing alert-command composition;
  a refused item remains visible and arrivals after the captured Clear all set are retained. A setup or
  resume prompt that joins under F3-447 is an owner-linked entry in this same inbox and participates in its
  unread badge, not a private durable task or new approval. Continue forwards the original prompt's own
  typed action and owner context: the setup prompt uses ui.onboarding.start with admitted resume intent and
  the closed pm.product_onboarding.action_request.v2 context (PWIZ-021/UCC-106); the tour-resume prompt uses
  ui.guided_tour.resume with its session, safe checkpoint and currentness context under
  pm.guided_tour.action_request.v3 (PWIZ-023). Each route retains its owner's validation and effects. The
  owner removing that prompt removes its inbox projection. Dismissal/read/placement never completes setup,
  skips the tour or resolves its underlying need.
  Amended 2026-10-17 (DL-228): the inbox keeps a bounded number of items (the concept keeps 60). At the bound
  the oldest item that is read and needs nothing leaves first; an unresolved Needs you item is never dropped
  to make room.
gui_related: true
gui_classification_reason: This unit defines the shared alert store, alert lifecycle controls, and the unread indicator contract.
split_recommended: false
depends_on: [F3-042]
unblocks: []
acceptance_criteria:
- Alerts support acknowledge and snooze; ack clears unread state and snooze hides the alert until its snooze window
  elapses; unresolved alerts persist in the shared alert store.
- Unread alerts drive the count badge on the title-bar notification stack (F3-460).
- The title-bar collapsed stack and the sprout inbox panel render from one shared alert store; no surface keeps
  a private alert copy.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
- Setup and Guided Tour bell Continue entries retain their distinct existing typed actions and request schemas;
  neither routes to the other owner's flow.
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces:
- "Plans/FinalGUISpec.md"
node_compile_hint:
  mode: notifications_side_panel_and_alert_lifecycle
  create_worknodes: false
source_lineage:
- Plans/FinalGUISpec.md:72
- Plans/FinalGUISpec.md:5854
- Concepts/pm6-build (PMConcept6 demo; source-lineage-only per Plans/usage-feature.md)
- /mnt/Cursor/share/puppet-master/2026-10-13-notifications/NOTES.md, SHA-256 f09d2b8856652950762b6580b8ebab43022bdf053272738f52720de25922a895
  (approved campaign source lineage; not native implementation evidence)
- /mnt/Cursor/share/puppet-master/2026-10-14-plans-canon/sources/COORDINATOR-LOG.md, SHA-256 82267ce22bcc9c7d17d9f19ad806902718e1978555ada3559d24558baabbdd4f
  (approved campaign source lineage; not native implementation evidence)
- /mnt/Cursor/share/puppet-master/2026-10-16-plans-pass2/sources/opus-5.5--src--js--19-notify.js, SHA-256
  80f415f7e4ef676748322cdf8ce40ea25b4a0adfa5897d4002e83f2ae327f667 (source lineage; not native certification)
preserved_exact_tokens:
- ack
- snooze
- count badge
- ui.onboarding.start
- ui.guided_tour.resume
negative_constraints:
- "No surface may maintain a private alert copy; the title-bar collapsed stack and the sprout inbox panel consume the one shared alert store."
- "Alert severity, source, and owner-route data follow the shared notification model; the inbox panel must not invent local alert state."
compatibility_only_notes:
- "Slint portability: the inbox list, count badge, and lifecycle controls render as opaque precomputed surfaces; no arbitrary-content backdrop blur, no SVG filters, and color math is precomputed rather than runtime-mixed."
stale_retired_dispositions:
- "The dedicated Notifications side panel affordance is retired per PMConcept7 title-bar notifications; the alert store and ack/snooze lifecycle survive in this unit, and the rendering surfaces are the title-bar notification stack (F3-460) and the sprout inbox panel (F3-461)."
- "The activity-bar Notifications item and its rail unread dot are retired; the unread affordance is the title-bar notification stack count badge (F3-460)."
- "The status-bar notifications bell and its popover are retired; the amended F3-448 status-bar inventory no longer includes a bell."
owner_boundary_notes:
- "The design table listed F3-448 and F3-453 as mutually dependent; the cycle was resolved one-way and stays one-way after the PMConcept7 retarget: F3-453 owns the shared alert store and depends only on F3-042, while the title-bar stack and inbox presentation units (F3-460, F3-461) depend on F3-453."
- "The F3-042 inventory edit (8 panels to 11) landed in the 2026-07-16 seal; the 2026-07-23 PMConcept7 promotion retires the notifications panel from that inventory. This unit references plain F3-042."
owner_hints:
- "Plans/FinalGUISpec.md"

```
