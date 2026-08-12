# Shard 006: PMConcept7 Home Workspace Control Reconciliation — 2026-08-04

Source: `Plans/FinalGUISpec.md`

Source lines: L262-L653

Source SHA256: `dc51354b20dad6d8cf56051b7dcb649ab91d723ecfcf4a9dbbb2ab8a74341032`

---

## PMConcept7 Home Workspace Control Reconciliation — 2026-08-04

This addendum is the GUI/shell behavior owner for the model-driven Home workspace. The
canonical record shape, migration rules, and persistence key live in
`Plans/home_workspace_layout.schema.json` and `Plans/storage-plan.md`; consumers cite
those owners instead of copying field definitions.

### F3-HOME-001 — Home composition and stable surface identity

Home is one shell workspace with a flexible `home_main` center and five in-app host
registries: `dock_left`, `dock_right`, `dock_top`, `dock_bottom`, and `floating`.
The desktop `floating` host is a native Slint window; the guaranteed web fallback is
an in-canvas floating presentation. The shell presents four stable editor surface
identities, `editor_panel_1` through `editor_panel_4`, plus the stable `dashboard`,
`chat`, and `terminal_section:<terminal_section_id>` surface identities. Panel labels
are presentation text and never become persisted identity. Panel 1 and Panel 2 are
open in the default layout; Panel 3 and Panel 4 are closed but reopenable without
minting a new identity. Dashboard widget placement, editor buffers, terminal
sessions/PTYs, browser sessions, and chat messages remain domain-owned projections;
the Home layout stores references and presentation state only.

### F3-HOME-002 — Model-first movement and resize behavior

Surface movement and resize use a committed layout plus a local draft layout. Pointer
offset, lift, placeholder, neighbor reflow, edge-zone detection, cancellation, and
reduced-motion behavior follow the approved U10 interaction semantics. DOM/Slint
items are projections, not layout authority. A changed semantic drop or resize end
validates the expected layout revision, dispatches one typed command, increments the
revision, and persists once. Cancellation, invalid targets, Escape, blur, and pointer
cancellation restore the exact pre-gesture snapshot. The target
priority is explicit inner insertion/split, outer edge dock, floating, then invalid
revert. All resize endpoints use the shared resizer glow/recovery contract and all
new scrollports register with the four-edge scroll dissolve system.

Amended 2026-08-12 — direct manipulation is the movement model. Movement is a
direct-manipulation gesture from a grab handle, not a target picker. While a surface
is held, the held surface tracks the pointer one-to-one, the slot it vacated becomes
a real in-flow placeholder carrying that surface's footprint inside the prospective
host, and the remaining surfaces animate to their new positions from their pre-move
rects. Preview never re-renders a surface subtree, so editor buffers, terminal
sessions, browser sessions, and chat history survive a gesture untouched. Drop
targeting resolves in this order: a surface under the pointer resolves to that
surface's host and an insertion index; otherwise an outer edge band resolves to that
dock, which is the only way to reach a dock that currently holds nothing and is
therefore zero-sized; otherwise the host under the pointer; otherwise `home_main`.
Leaving the window resolves to `floating`.

Loss of pointer capture is explicitly NOT a cancellation vector: live neighbor reflow
re-parents projected items, which drops capture, so treating capture loss as a cancel
ends every gesture on its first frame. Escape, pointer cancellation, and window blur
remain the cancellation contract.

Resize writes only the dragged surface's geometry during the gesture. A full layout
re-projection per pointer frame is prohibited: it can destroy the very endpoint
holding pointer capture, and it makes a resize that commits a new size while moving
zero pixels indistinguishable from a working one. Resize endpoints sit on the
boundary the gesture actually moves, not on the surface's outer edge, and the drag
clamp band and the host track clamp band must agree so the reachable range is the
committed range. Movement and resize gestures are independent: a stranded gesture of
one kind must not disable the other.

Keyboard movement is a first-class path on the same grab handle and is the accessible
equivalent of the pointer gesture: activating the handle picks the surface up, arrow
keys move it between slots and across host boundaries, activation drops it, Escape
cancels, and each state change is announced through a polite live region. Host
adjacency for the keyboard path is `home_main` at the centre with each edge dock
adjacent to it, so a dock-to-dock move is two steps (back to `home_main`, then out to
the target dock); an arrow that would leave the current host only does so once the
surface is already at that end of the host's slot order, so the same key first
reorders within the host and then crosses out of it.

### F3-HOME-003 — Shell controls and capability envelope

The Home title bar exposes one 28 by 28 inline-SVG `Home more options` button
immediately left of Theme. Its compact body-portaled popup has exactly three
top-level rows, in order: `Open Panel` with a Panel 1 through Panel 4 side flyout,
`Open Browser in Panel` with the same four-target side flyout, a divider, and
`Collapse Bottom Terminal`. It follows the Chat model/mode popup and effort-flyout
interaction language: restrained elevation, corner-sprout opening, viewport
flipping, hover bridge, roving keyboard focus, Enter/Right Arrow to enter a
flyout, Left Arrow to return, Escape/outside dismissal, reduced-motion parity,
and focus restoration to the invoker. `Collapse Bottom Terminal` is disabled
with an accessible reason when no eligible bottom terminal exists or the eligible
terminal is already collapsed; its label never changes into an Expand action.

Reset, File Manager, Move/Dock, pop-out, close, counts, recovery diagnostics, and
layout revision/debug data are forbidden in this popup. `Reset Home Layout` lives
under Settings -> General & Appearance -> Startup & Recovery and resets shell
presentation only. File Manager targets remain in File Manager; terminal limits
remain in terminal-local controls. Editor menus expose Open Browser, Pop Out, and
Close Panel.

Amended 2026-08-12 — every eligible editor, Dashboard, Chat, and terminal section
carries one grab handle at the top-left of its own head row: a small, always-visible
inline-SVG grip with a grab cursor, a stable accessible name, a focus ring, and a
grabbed state. That handle is the only movement affordance. The per-surface
`Main / Dock Left / Dock Right / Dock Top / Dock Bottom / Float` menu rows are
retired; a surface options menu states the current placement and points at the handle
instead of offering targets. Movement semantics, commands, receipts, and events are
unchanged — only the affordance changed — and keyboard movement on the handle
(F3-HOME-002) carries the accessibility contract the retired rows used to hold.

The bottom terminal's own collapse control is a toggle: an inline-SVG chevron at the
right end of the terminal bar that collapses the section and, from the collapsed
strip, expands it again. The collapsed strip keeps that control visible and
hit-testable — it is the expand affordance — and the control reports post-commit
state. This does not weaken the rule above that the top-bar menu row
`Collapse Bottom Terminal` is one-way and never relabels to Expand.

Browser access from any editor panel, File Manager `Open in Panel`, Dashboard/Chat
movement, terminal section/workgroup movement, explicit empty-section state, and
reset route through the command and production-wiring owners; disclosure-only menu
and flyout opening is view-local, while every selected leaf action dispatches
exactly one semantic command or a typed no-change receipt. Opening an already-open
panel focuses its existing view, and Browser routing reparents or focuses one
stable Browser session without duplicating it.

Web guarantees all four in-app docks and in-canvas floating. `window.open()` is
optional, is attempted only from direct user activation, and can never be the sole
path; a blocked or unavailable popup discloses the fallback and retains in-canvas
floating. Native Slint 1.17.1 multi-window behavior remains the desktop authority.
All eight themes and Light/Dark/Auto remain supported, and no new control may use
emoji or non-inline image assets.

### F3-HOME-004 — Transactional persistence and identity

`HomeWorkspaceLayoutV1` is the only Home shell layout authority. A candidate
mutation is validated, written to the canonical record, read back byte-for-byte,
and only then becomes committed state, advances `layout_revision`, updates success
counters, or emits a success EventRecord with `persisted=true`. Write/readback
failure restores the exact prior model and focus sequence, emits a failure receipt,
and emits no success event. Corrupt, duplicate-identity, future-version, malformed,
or off-screen records are quarantined, normalized to a safe canonical record,
written forward, and disclosed through the existing recovery status treatment;
the next reload must be clean. Layout movement/reload never mints editor panel,
editor group, worktree, buffer, dirty-buffer, terminal section, workgroup, pane,
PTY/session, Browser, Dashboard, or Chat identity.

### F3-HOME-005 — Native Slint portability contract

The native Rust implementation owns the committed/draft layout model, command
transaction, identity registry, persistence, and multi-window registry. Slint
1.17.1 reusable surface components render inline while docked and in separate
`Window` instances while detached, using `TouchArea`, `DragArea`, `DropArea`, or
equivalent typed input surfaces only as projections over the Rust model.
Cross-window drag and OS snap orchestration remain Rust/window-layer concerns.
Window size and position may be persisted, but exact position restoration on
Wayland is best effort; an unprovable placement falls back to the last valid dock
or `home_main`. DOM clone/FLIP mechanics remain prototype-only and cannot become
native layout authority.

### Explicit superseded dispositions

The old single-floating-editor limit is superseded by the four stable editor panel
model above. The old two-terminal-section/editor-area exclusion is superseded by
four terminal sections and Home target participation while retaining the default
bottom placement. Historical HTML5/CSS-order panel swapping is prototype lineage,
not GUI canon; the implementation must use the model-first Pointer Events
transaction described above. Existing Dashboard widget hostability and widget
layout remain separate contracts and are not expanded by Home surface movement.

Superseded 2026-08-12: the per-surface `Move or dock` menu inventory (Main, Dock
Left, Dock Right, Dock Top, Dock Bottom, Float on every eligible surface menu) is
retired in favour of the grab handle plus its keyboard path. The retired rows are
compatibility lineage only; `cmd.workspace_layout.move_surface` and its payload are
unchanged and are now dispatched from the handle and the live drop targets. A
target-picker overlay presented during a gesture is likewise retired: it occluded the
canvas and consumed the hit-test that positional drops depend on. Dashboard widget
reorder and resize adopt the same direct-manipulation vocabulary (lifted item,
in-flow placeholder, neighbor reflow) while remaining a separate layout contract.

### F3-501 - Home Workspace Model And Stable Identity

```yaml
plan_unit_id: F3-501
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: Home is rendered from one Rust-owned HomeWorkspaceLayoutV1 across home_main, four outer docks, and a floating host; four editors, Dashboard, Chat, and up to four terminal sections retain stable domain-owner identities across move, close, reopen, float, re-dock, persistence, and reload.
gui_related: true
gui_classification_reason: This unit owns the user-visible Home shell composition and stable surface behavior.
split_recommended: false
depends_on: [F3-500]
unblocks: [SP-245, UCC-144, CV-323, F3-502, F3-503, F3-504]
acceptance_criteria:
- Exactly four editor panel identities exist; Panels 1 and 2 default open and Panels 3 and 4 default closed.
- Dashboard and Chat are singleton surfaces; terminal sections are bounded at four.
- Layout projections reparent existing owner-backed views and never duplicate editor, terminal, Browser, Dashboard, or Chat authority.
- Old HTML5/CSS-order swapping is retired as Home authority.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
- node Concepts/pm7-tools/verify/home_workspace_matrix.mjs
risk_class: home_workspace_identity_drift
reasoning_tier: standard
context_scope: pmconcept7_home_workspace
implementation_surfaces: [Plans/FinalGUISpec.md, Concepts/pm7-tools/home_workspace_source.py]
node_compile_hint:
  mode: home_workspace_shell
  create_worknodes: false
source_lineage:
- PMConcept7_Home_Workspace_Audit_Packet_v1/shared/01_REQUIREMENTS.jsonl
preserved_exact_tokens: [HomeWorkspaceLayoutV1, editor_panel_1, editor_panel_2, editor_panel_3, editor_panel_4]
negative_constraints:
- Do not make DOM order, CSS order, or generated PMConcept7 output the layout authority.
- Do not mint domain identities during shell movement.
compatibility_only_notes: []
stale_retired_dispositions:
- The HTML5/CSS-order Home swap demo is retired source lineage only.
owner_hints: [Plans/FinalGUISpec.md, Plans/storage-plan.md]
```

### F3-502 - Compact Home More Options Menu

```yaml
plan_unit_id: F3-502
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: "The 28 by 28 Home more-options trigger immediately left of Theme opens one compact body-portaled three-row popup: Open Panel, Open Browser in Panel, divider, and Collapse Bottom Terminal; the first two rows expose Panel 1 through Panel 4 side flyouts and all other Home actions live at their owner surfaces."
gui_related: true
gui_classification_reason: This unit owns the visible title-bar menu inventory, placement, keyboard behavior, and disabled treatment.
split_recommended: false
depends_on: [F3-501, UCC-144, UIW-010]
unblocks: []
acceptance_criteria:
- The popup has exactly the three ordered top-level actions and no reset, File Manager, Move/Dock, pop-out, close, count, recovery, revision, or debug row.
- Flyouts support hover bridge, Enter/Right Arrow, Left Arrow, roving focus, Escape/outside dismissal, viewport flipping, reduced motion, and trigger focus restoration.
- Collapse stays Collapse, is never an Expand alias, and exposes the canonical disabled reason.
- Reset Home Layout is visible only under Settings -> General & Appearance -> Startup & Recovery.
validation_surfaces:
- node Concepts/pm7-tools/verify/home_workspace_matrix.mjs
- python3 Concepts/pm7-tools/build_pm7.py
risk_class: home_menu_regression
reasoning_tier: standard
context_scope: pmconcept7_home_menu
implementation_surfaces: [Plans/FinalGUISpec.md, Concepts/pm7-tools/home_workspace_source.py, Concepts/pm7-tools/build_pm7.py]
node_compile_hint:
  mode: compact_home_menu
  create_worknodes: false
source_lineage:
- PMConcept7_Home_Workspace_Audit_Packet_v1/shared/01_REQUIREMENTS.jsonl
preserved_exact_tokens: [Open Panel, Open Browser in Panel, Collapse Bottom Terminal, Reset Home Layout]
negative_constraints:
- Do not restore the Home control-center menu.
- Do not place disclosure-only actions on the command bus.
compatibility_only_notes: []
stale_retired_dispositions:
- Reset and diagnostics in the title-bar Home menu are retired.
owner_hints: [Plans/FinalGUISpec.md, Plans/UI_Command_Catalog.md]
```

### F3-503 - Home Gestures Resizers And Scroll Dissolve

```yaml
plan_unit_id: F3-503
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: Home surface drag, drop, insertion, reflow, float, dock, and resize use one draft-model Pointer Events transaction, shared diamond resizers, and shared four-edge scroll dissolve; pointermove is preview-only and one changed end commits once.
gui_related: true
gui_classification_reason: This unit owns visible layout gestures, previews, resize feedback, scrolling-edge treatment, and recovery.
split_recommended: false
depends_on: [F3-501, UIW-010]
unblocks: []
acceptance_criteria:
- Pickup retains pointer offset and shows landing placeholder, neighbor reflow, and narrow theme-aware edge previews.
- Escape, pointercancel, lost capture, blur, invalid targets, and unchanged drops restore the exact committed model with no command, persistence, or success event.
- Every eligible boundary uses the shared theme-aware diamond glow/recovery controller and commits once on changed pointer-up only.
- Every new vertical or horizontal scrollport enrolls in the shared four-edge dissolve system with no-overflow and reduced-motion handling.
validation_surfaces:
- node Concepts/pm7-tools/verify/home_workspace_matrix.mjs
risk_class: home_gesture_regression
reasoning_tier: standard
context_scope: pmconcept7_home_gestures
implementation_surfaces: [Plans/FinalGUISpec.md, Concepts/pm7-tools/home_workspace_source.py]
node_compile_hint:
  mode: home_gesture_transaction
  create_worknodes: false
source_lineage:
- PMConcept7_Home_Workspace_Audit_Packet_v1/shared/01_REQUIREMENTS.jsonl
preserved_exact_tokens: [pointercancel, lostpointercapture, four-edge scroll dissolve]
negative_constraints:
- Do not dispatch commands, events, or persistence writes on pointermove.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints: [Plans/FinalGUISpec.md, Plans/UI_Wiring_Rules.md]
```

### F3-504 - Home Web And Native Capability Boundary

```yaml
plan_unit_id: F3-504
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: Native Slint 1.17.1 is Rust-model-first and multi-window capable; web guarantees in-app docks and in-canvas floating only, treats popup presentation as direct-user-activation optional degradation, and falls back honestly when blocked.
gui_related: true
gui_classification_reason: This unit owns visible native/web capability behavior and degradation disclosure.
split_recommended: false
depends_on: [F3-501]
unblocks: []
acceptance_criteria:
- Native reusable surfaces are backed by shared Rust models and a multi-window registry; Slint input areas do not own layout identity.
- Wayland window position restoration is best effort with a valid in-app fallback.
- window.open is never the only path, is attempted only under direct user activation, and blocked popup state falls back to in-canvas floating.
- Reduced motion disables interpolation but retains target and state cues.
validation_surfaces:
- node Concepts/pm7-tools/verify/home_workspace_matrix.mjs
- python3 scripts/pm-plan-index.py validate
risk_class: home_platform_claim_drift
reasoning_tier: standard
context_scope: pmconcept7_home_platform
implementation_surfaces: [Plans/FinalGUISpec.md]
node_compile_hint:
  mode: home_platform_boundary
  create_worknodes: false
source_lineage:
- PMConcept7_Home_Workspace_Audit_Packet_v1/shared/06_WEB_SLINT_FEASIBILITY.md
preserved_exact_tokens: [Slint 1.17.1, Wayland, direct user activation, in-canvas floating]
negative_constraints:
- Do not claim OS docking or unrestricted popup placement as a web guarantee.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints: [Plans/FinalGUISpec.md]
```

### F3-505 - Contact-Aware Editor Tab Silhouette

```yaml
plan_unit_id: F3-505
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  The active editor file tab and the code canvas below it render as one continuous
  surface. A single shared silhouette travels between tabs on a darker tab rail: it
  carries squircle top corners, no bottom border against the canvas, and concave
  shoulders at its lower left and lower right, and the silhouette, its corner helpers
  and the canvas share exactly one fill token while unselected tabs stay visually
  independent in the rail. Corner geometry is a function of geometric contact and the
  left and right sides are independent: with a local morph threshold of 20 px,
  leftProgress = clamp(leftGap / 20, 0, 1) and rightProgress = clamp(rightGap / 20, 0, 1)
  drive canvasRx = progress * 10 against a fixed canvasRy of 10, and cutoutRx =
  progress * 8 against a fixed cutoutRy of 8, so a corner flattens sideways rather than
  shrinking into a circular dimple, and a side that is flush against its boundary
  flattens completely with no residual notch. Direct dragging is one-to-one with the
  pointer and corner values are derived from the tab position in the same frame with no
  independent easing, no momentum and no elastic overshoot; click, snap and keyboard
  selection animate x and width with a firm low-bounce spring while the canvas stays
  stationary and the connected shape visibly travels rather than crossfading. The shape
  recomputes stable target bounds on window resize, tab-width change, theme or motion
  change, and fonts-ready. Reduced motion removes the spring travel and retains
  immediate state changes.
gui_related: true
gui_classification_reason: This unit defines the visible active-editor-tab chrome, its joined-surface geometry, and its motion.
split_recommended: false
depends_on: [F3-421, F3-466]
unblocks: []
acceptance_criteria:
- "The active tab, its corner helpers and the code canvas resolve to one fill token, the rail resolves darker, and no border or seam separates the active tab from the canvas at any frame."
- "leftProgress and rightProgress are computed independently against a 20 px threshold; a flush side renders canvasRx 0 and cutoutRx 0 while the opposite side keeps its corner."
- "Only the horizontal radius animates; canvasRy stays 10 px and cutoutRy stays 8 px throughout the morph."
- "Dragging tracks the pointer one-to-one with corner values derived in the same frame; selection by click, snap or keyboard produces the identical transition."
- "No dark pinhole at a join, no one-frame square or round pop at the start or end of a transition, and no shrinking circular dimple near a collision boundary."
- "Resizing the window or changing tab widths recomputes stable target bounds; reduced motion snaps without spring travel."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created."
validation_surfaces:
- node Concepts/pm7-tools/verify/home_workspace_matrix.mjs
- python3 scripts/pm-plan-index.py validate
risk_class: finalgui_drift
reasoning_tier: standard
context_scope: finalgui_standardization
implementation_surfaces: [Plans/FinalGUISpec.md]
node_compile_hint:
  mode: contact_aware_editor_tab_silhouette
  create_worknodes: false
source_lineage:
- "Concepts/PMConcept7.html (source-lineage-only per Plans/usage-feature.md)"
preserved_exact_tokens: ["20", "10", "8", "clamp", "squircle"]
negative_constraints:
- "Do not render the active-editor-tab treatment as a pill or an underline sliding between labels."
- "Do not retain a decorative notch where the tab and the canvas are flush."
- "Do not ease the corner values independently of the tab position during a drag."
- "Do not crossfade the whole surface between tabs."
compatibility_only_notes:
- "Slint portability: reproduce the silhouette with layered shapes or custom paths and preserve the geometry and motion rules rather than the CSS mechanism; corner-shape squircle or superellipse is progressive enhancement on the web with elliptical border-radius as the fallback."
stale_retired_dispositions:
- "The prior active editor file tab treatment (surface-tinted tab plus a 2 px accent underline, with per-theme underline recolours) is retired for this surface; the silhouette is the active-tab chrome."
owner_boundary_notes:
- "F3-421 owns editor tab close, pane close and the width-aware +N more overflow chip; F3-466 owns the friendly-theme editor tab shape; F3-464 owns the title-bar page-tab sliding ink and is unaffected by this unit, which is scoped to editor file tabs only."
owner_hints: [Plans/FinalGUISpec.md]
```
