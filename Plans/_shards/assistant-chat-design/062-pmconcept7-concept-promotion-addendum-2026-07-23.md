# Shard 062: PMConcept7 Concept Promotion Addendum - 2026-07-23

Source: `Plans/assistant-chat-design.md`

Source lines: L24155-L24521

Source SHA256: `3a7c8066cfd8103cbc605111d917224c61ae3d7ee19f2e6e354076306c67919e`

---

## PMConcept7 Concept Promotion Addendum - 2026-07-23

This addendum promotes user-approved PMConcept7 chat behaviors (ChatGuiUpdates2 workstreams, revs 4-9.2) into canonical PlanUnits: the corner-origin sprout popout motion family, the effort/thoroughness option-count resize in place, the context ring click sprout and glow, the header chrome menu sprouts with theme-matched popout chrome, the chat more-options kebab menu, and the Chats rail cleanup with resize-driven collapse. `Concepts/PMConcept7.html` and `Concepts/ChatGuiUpdates2.md` remain illustrative source-lineage only. This addendum creates no WorkNodes, NodeSeeds, executable queues, implementation files, runtime artifacts, generated wiring rows, production build tasks, final manifests, or PNC-019 receipts.

### ACD-439 - Corner-Origin Sprout Popout Motion Contract

```yaml
plan_unit_id: ACD-439
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  Chat transient popouts - the model, mode, persona, effort, and thoroughness selector
  popouts, the header chrome menus, and the context status module - share one corner-origin
  sprout motion contract: each popout sprouts from and collapses into the corner or edge
  nearest its trigger, opening in roughly 300ms with overshoot easing from a non-uniform
  closed scale and closing in roughly 220ms with opacity held until late followed by a short
  fade. Search-driven size changes in the model and persona popouts spring the height with
  overshoot and a brief size-bounce. The modes popout opens directly on its Ask, Agent,
  Debug, Plan, and Deep Plan options with no search field, while model and persona popouts
  keep search. Under reduced motion, open and close render as instant show/hide. The
  single-overlay invariant of ACD-438 is preserved.
gui_related: true
gui_classification_reason: Defines visible open/close motion and search behavior for chat popouts.
split_recommended: false
depends_on: [ACD-438]
unblocks: [ACD-440, ACD-441, ACD-442]
acceptance_criteria:
  - "Model, mode, persona, effort, and thoroughness popouts sprout from and collapse into the corner or edge nearest their trigger, with an overshoot open and a late-fade close."
  - "Search-driven size changes in the model and persona popouts spring the height with overshoot and a brief size-bounce."
  - "The modes popout opens directly on Ask, Agent, Debug, Plan, and Deep Plan options with no search field, while model and persona popouts keep search."
  - "At most one popout, flyout, or fan-out is open at a time per ACD-438, and reduced motion renders open and close as instant show/hide."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: chat_header_contract_drift
reasoning_tier: standard
context_scope: assistant_chat_header
implementation_surfaces:
  - Plans/assistant-chat-design.md
node_compile_hint:
  mode: corner_origin_sprout_popout_motion_contract
  create_worknodes: false
source_lineage:
  - "Concepts/PMConcept7.html (PMConcept7 demo rev 9.2; source-lineage-only per Plans/usage-feature.md)"
  - "Concepts/ChatGuiUpdates2.md (PM8 workstream and rev 4-9.2 ship notes; source-lineage-only)"
preserved_exact_tokens:
  - "corner-origin"
  - "sprout"
  - "Deep Plan"
negative_constraints:
  - "Popouts must not open from a fixed origin unrelated to their trigger, and the modes popout must not re-introduce a search field."
compatibility_only_notes:
  - "Slint portability: sprout popouts render as opaque precomputed popup surfaces with translate/opacity/height animations via Slint property animations; no arbitrary-content backdrop blur, no SVG filters, and color math is precomputed rather than runtime-mixed."
stale_retired_dispositions:
  - "Fixed-origin popout open/close motion retired; all chat transient popouts use the nearest-corner sprout family."
owner_boundary_notes: []
owner_hints:
  - Plans/assistant-chat-design.md
```

### ACD-440 - Effort And Thoroughness Option-Count Resize In Place

```yaml
plan_unit_id: ACD-440
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  The effort/thoroughness side flyout resizes in place: when the flyout is already open and
  the hovered row changes to one whose available option count differs, the open flyout
  spring-resizes its height with overshoot and a brief size-bounce instead of re-running the
  sprout open. First open uses the corner-origin sprout of ACD-439, and hovering the same row
  again only repositions and refreshes content. This applies to the model-effort flyout and
  to the mode Plan/Deep Plan thoroughness flyout, which share the same flyout portal.
gui_related: true
gui_classification_reason: Defines visible side-flyout resize behavior when option counts change.
split_recommended: false
depends_on: [ACD-438, ACD-439]
unblocks: []
acceptance_criteria:
  - "With the flyout open, hovering a row with a different available option count spring-resizes the flyout height in place with overshoot and a brief size-bounce, without re-running the sprout open."
  - "First open uses the corner-origin sprout; same-row hover repositions and refreshes content only."
  - "The behavior applies to model-effort and to mode Plan/Deep Plan thoroughness through the same flyout portal."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: chat_header_contract_drift
reasoning_tier: standard
context_scope: assistant_chat_header
implementation_surfaces:
  - Plans/assistant-chat-design.md
node_compile_hint:
  mode: effort_thoroughness_option_count_resize_in_place
  create_worknodes: false
source_lineage:
  - "Concepts/PMConcept7.html (PMConcept7 demo rev 9.2; source-lineage-only per Plans/usage-feature.md)"
  - "Concepts/ChatGuiUpdates2.md (PM8 workstream and rev 4-9.2 ship notes; source-lineage-only)"
preserved_exact_tokens:
  - "size-bounce"
  - "Plan"
  - "Deep Plan"
negative_constraints:
  - "An option-count change while the flyout is open must not re-sprout the flyout from its origin."
compatibility_only_notes:
  - "Slint portability: the side flyout renders as an opaque precomputed popup surface whose height change animates via Slint property animations with overshoot easing; no arbitrary-content backdrop blur, no SVG filters, and color math is precomputed rather than runtime-mixed."
stale_retired_dispositions: []
owner_boundary_notes:
  - "Effort/thoroughness option semantics and label distinctness stay owned by ACD-438; this unit owns the resize-in-place presentation behavior."
owner_hints:
  - Plans/assistant-chat-design.md
```

### ACD-441 - Context Ring Click Sprout And Glow

```yaml
plan_unit_id: ACD-441
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  The chat header context ring is a click-to-open trigger for the context status module:
  clicking the ring, or pressing Enter or Space while the ring is focused, toggles the module
  as a corner-origin sprout popout anchored to the ring, and `aria-expanded` tracks the open
  state. Hovering the ring shows only a soft accent glow affordance and never opens the
  module; the glow holds while the module is open. The ring renders at 15px display size and
  no numeric token label renders beside the ring; usage figures render inside the module.
  This applies to both the docked and floating chat mounts.
gui_related: true
gui_classification_reason: Defines visible context ring trigger, glow, size, and module open behavior.
split_recommended: false
depends_on: [ACD-089, ACD-434, ACD-439]
unblocks: []
acceptance_criteria:
  - "Clicking the context ring, or pressing Enter or Space while it is focused, toggles the context status module as a corner-origin sprout anchored to the ring, with aria-expanded tracked."
  - "Hovering the ring shows only a soft accent glow and does not open the module; the glow holds while the module is open."
  - "The ring renders at 15px display size with no adjacent numeric token label; usage figures render inside the module."
  - "The behavior is identical in the docked and floating chat mounts."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: chat_header_contract_drift
reasoning_tier: standard
context_scope: assistant_chat_header
implementation_surfaces:
  - Plans/assistant-chat-design.md
node_compile_hint:
  mode: context_ring_click_sprout_and_glow
  create_worknodes: false
source_lineage:
  - "Concepts/PMConcept7.html (PMConcept7 demo rev 9.2; source-lineage-only per Plans/usage-feature.md)"
  - "Concepts/ChatGuiUpdates2.md (PM8 workstream and rev 4-9.2 ship notes; source-lineage-only)"
preserved_exact_tokens:
  - "15px"
  - "aria-expanded"
negative_constraints:
  - "Hover alone must not open the context status module, and no token label renders beside the ring."
  - "The module is an anchored transient popout; it must not re-introduce the retired detached usage pop-out (ACD-252)."
compatibility_only_notes:
  - "Slint portability: the ring glow renders as a precomputed halo/drop-shadow surface and the module as an opaque precomputed popup surface with translate/opacity/height animations via Slint property animations; no arbitrary-content backdrop blur, no SVG filters, and color math is precomputed rather than runtime-mixed."
stale_retired_dispositions:
  - "Hover-opened context module retired (see ACD-434 dispositions); click is the sole module-open gesture."
  - "Beside-ring numeric token label retired; usage figures render inside the module."
owner_boundary_notes:
  - "ACD-434 owns the module's UsageRecord projection content and data contract; this unit owns the trigger, glow, size, and open/close presentation."
owner_hints:
  - Plans/assistant-chat-design.md
```

#### PM7 floating-mount clarification — 2026-08-13

The PMConcept7 base full-screen chat overlay mount (fixed panel plus viewport
scrim) is retired; every non-docked chat mode routes to the single in-canvas Home
float-layer surface (no scrim, never covers the title bar, no docked/floating
double-render). The "floating chat mount" referenced by ACD-440 and ACD-441 is
that in-canvas float surface, and the ACD-439 corner-origin sprout family still
animates the pop-out. The ACD-440/ACD-441 behavior contracts are unchanged —
docked and floating mounts stay behaviorally identical; only the mount for the
floating case is re-pointed. This note creates no WorkNodes, NodeSeeds, executable
queues, implementation files, runtime artifacts, generated wiring rows, production
build tasks, final manifests, or PNC-019 receipts.

### ACD-442 - Header Chrome Menu Sprouts And Theme-Matched Popout Chrome

```yaml
plan_unit_id: ACD-442
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  The chat header worktree menu, Context Lens popover, context status module, and
  more-options menu are click-to-open corner-origin sprout popouts: click toggles, click
  outside or picking an item closes with the same collapse, opening one header menu closes
  the others, and `aria-expanded` is tracked on each trigger. Their popout chrome uses the
  same surface contract as the model/mode selector popouts - surface-elevated fill, border
  edge, radius-md corner, and elev-3 shadow - with glass themes sharing one plate rule with
  the selector portals and retro zeroing the radius. The worktree trigger color is applied
  through stylesheet rules only, with no inline style pinning, and worktree trigger hover
  matches the Context Lens trigger hover in all themes.
gui_related: true
gui_classification_reason: Defines visible header menu open behavior and shared popout chrome.
split_recommended: false
depends_on: [ACD-439]
unblocks: [ACD-443]
acceptance_criteria:
  - "Worktree menu, Context Lens popover, context status module, and more-options menu open on click as corner-origin sprouts; click outside or item pick closes; opening one header menu closes the others; aria-expanded is tracked on each trigger."
  - "Header menu chrome uses the selector-popout surface contract (surface-elevated fill, border edge, radius-md corner, elev-3 shadow); glass themes share one plate rule with the selector portals and retro zeroes radius."
  - "The worktree trigger color is CSS-only with no inline style pinning, and worktree trigger hover matches Context Lens trigger hover in all themes."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: chat_header_contract_drift
reasoning_tier: standard
context_scope: assistant_chat_header
implementation_surfaces:
  - Plans/assistant-chat-design.md
node_compile_hint:
  mode: header_chrome_menu_sprouts_and_theme_matched_popout_chrome
  create_worknodes: false
source_lineage:
  - "Concepts/PMConcept7.html (PMConcept7 demo rev 9.2; source-lineage-only per Plans/usage-feature.md)"
  - "Concepts/ChatGuiUpdates2.md (PM8 workstream and rev 4-9.2 ship notes; source-lineage-only)"
preserved_exact_tokens:
  - "surface-elevated"
  - "radius-md"
  - "elev-3"
  - "aria-expanded"
negative_constraints:
  - "Header menus must not open on hover, must not carry hardcoded radii or raw shadow values outside the shared chrome tokens, and must not pin trigger colors via inline styles."
compatibility_only_notes:
  - "Slint portability: header menus render as opaque precomputed popup surfaces sharing one precomputed chrome (fill, edge, corner radius, shadow) with the selector popouts, animated with translate/opacity/height Slint property animations; no arbitrary-content backdrop blur, no SVG filters, and color math is precomputed rather than runtime-mixed."
stale_retired_dispositions:
  - "Hover-opened header menus and hardcoded per-menu radii/shadows retired; all header menus share the click-to-open sprout and the selector-popout chrome contract."
owner_boundary_notes:
  - "Plans/FinalGUISpec.md owns app-wide theme tokens and glass plate recipes; this unit binds the chat header menus to those shared contracts."
owner_hints:
  - Plans/assistant-chat-design.md
```

### ACD-443 - Chat More-Options Kebab Menu

```yaml
plan_unit_id: ACD-443
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  The docked chat header consolidates its standalone thread-management icon buttons into one
  more-options kebab: a vertical-ellipsis inline-SVG button whose click sprout-opens a menu
  listing Duplicate thread, Archive thread, Pop out, and Close chat as full-width rows with
  icon plus label. The floating chat header kebab menu lists Cycle layout and Close chat. Of
  these actions only Archive dispatches a cataloged command (`cmd.chat.archive`); Duplicate,
  Pop out, Cycle layout, and Close remain surface affordances without new command
  registrations. The kebab follows the header chrome menu sprout and chrome contract
  (ACD-442) and tracks `aria-expanded`.
gui_related: true
gui_classification_reason: Defines the visible more-options kebab and its menu contents.
split_recommended: false
depends_on: [ACD-071, ACD-442]
unblocks: []
acceptance_criteria:
  - "The docked chat header shows one vertical-ellipsis kebab instead of a row of standalone Duplicate/Archive/Pop out/Close icon buttons; its menu lists Duplicate thread, Archive thread, Pop out, and Close chat as full-width rows with icon plus label."
  - "The floating chat header kebab menu lists Cycle layout and Close chat."
  - "Archive dispatches `cmd.chat.archive`; Duplicate, Pop out, Cycle layout, and Close remain surface affordances with no new command registrations."
  - "The kebab menu opens and closes per the ACD-442 sprout and chrome contract with aria-expanded tracked."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: chat_header_contract_drift
reasoning_tier: standard
context_scope: assistant_chat_header
implementation_surfaces:
  - Plans/assistant-chat-design.md
node_compile_hint:
  mode: chat_more_options_kebab_menu
  create_worknodes: false
source_lineage:
  - "Concepts/PMConcept7.html (PMConcept7 demo rev 9.2; source-lineage-only per Plans/usage-feature.md)"
  - "Concepts/ChatGuiUpdates2.md (PM8 workstream and rev 4-9.2 ship notes; source-lineage-only)"
preserved_exact_tokens:
  - "Duplicate thread"
  - "Archive thread"
  - "Pop out"
  - "Close chat"
  - "Cycle layout"
  - "cmd.chat.archive"
negative_constraints:
  - "Do not register new commands for Duplicate, Pop out, Cycle layout, or Close in this pass; only `cmd.chat.archive` is cataloged among the menu actions."
  - "The kebab glyph is an inline SVG, not an emoji glyph."
compatibility_only_notes:
  - "Slint portability: the kebab menu renders as an opaque precomputed popup surface with translate/opacity/height animations via Slint property animations; no arbitrary-content backdrop blur, no SVG filters, and color math is precomputed rather than runtime-mixed."
stale_retired_dispositions:
  - "Docked chat header row of four standalone icon buttons (Duplicate thread, Archive thread, Pop out, Close chat) retired; the actions are hosted in the more-options kebab menu."
owner_boundary_notes: []
owner_hints:
  - Plans/assistant-chat-design.md
```

### ACD-444 - Chats Rail Cleanup And Resize Collapse

```yaml
plan_unit_id: ACD-444
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  The chat thread sidebar is labeled `Chats`, with the label rendered at the same size in
  expanded and collapsed states so the title does not jump, and a compact vertically centered
  new-thread control in the header row. The stream provenance banner is removed from thread
  first paint, so the first painted row is the first user message; thread provenance remains
  available through thread metadata and audit surfaces. Rail collapse is resize-driven, not a
  button: there is no chevron collapse control, crossing the collapse width threshold toggles
  collapsed chrome only, and the collapsed state neither locks the rail width nor disables
  resize. Collapsed rows show a truncated title and hide status, timestamp, and summary,
  while row border and glow take the thread-status color (role accent for working/unread,
  muted for read/draft); active collapsed rows keep the glow plus a left accent bar. Expanded
  selected threads show a tinted fill, an inset left accent bar, a hairline outer ring, and a
  bolder title, with role colors carried to the bar and border. The docked and pop-out chat
  mounts share the sidebar builder and behave identically.
gui_related: true
gui_classification_reason: Defines visible thread sidebar labeling, provenance, collapse, and selection behavior.
split_recommended: false
depends_on: [ACD-071]
unblocks: []
acceptance_criteria:
  - "The thread sidebar label reads Chats at an unchanged size across expanded and collapsed states, with a compact vertically centered new-thread control."
  - "No stream provenance banner renders in the thread; first paint is the first user message, and provenance stays reachable through thread metadata/audit surfaces."
  - "There is no chevron collapse control; crossing the collapse width threshold toggles collapsed chrome only, without locking width or disabling resize."
  - "Collapsed rows truncate the title, hide status/timestamp/summary, and carry the thread-status color on border and glow; active collapsed rows keep glow plus a left accent bar."
  - "Expanded selected threads show tinted fill, inset left accent bar, hairline outer ring, and bolder title with role colors on bar and border, identically in docked and pop-out mounts."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: thread_selector_ui
reasoning_tier: standard
context_scope: threads
implementation_surfaces:
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: chats_rail_cleanup_and_resize_collapse
  create_worknodes: false
source_lineage:
  - "Concepts/PMConcept7.html (PMConcept7 demo rev 9.2; source-lineage-only per Plans/usage-feature.md)"
  - "Concepts/ChatGuiUpdates2.md (PM8 workstream and rev 4-9.2 ship notes; source-lineage-only)"
preserved_exact_tokens:
  - "Chats"
  - "thread-status"
negative_constraints:
  - "Do not render a provenance banner as thread content, and do not re-introduce a collapse button or a collapsed state that locks rail width or disables resize."
compatibility_only_notes:
  - "Slint portability: rail rows, accent bars, and glows render as opaque precomputed surfaces with translate/opacity/height animations via Slint property animations, and collapse chrome toggles on an observed width property; no arbitrary-content backdrop blur, no SVG filters, and color math is precomputed rather than runtime-mixed."
stale_retired_dispositions:
  - "Sidebar HISTORY label retired; the rail is labeled Chats."
  - "Chevron collapse button retired; collapse is resize-driven content-chrome toggling."
  - "Stream provenance banner (Thread created from ... injected context) retired from thread first paint; provenance remains in thread metadata and audit surfaces."
owner_boundary_notes:
  - "Plans/FinalGUISpec.md F3-469 owns chats-rail geometry, pixel thresholds, and per-theme presentation skins; this unit owns the chat-behavior semantics (label, provenance removal, resize-driven collapse, selection and status disclosure)."
owner_hints:
  - Plans/assistant-chat-design.md
```
