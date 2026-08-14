# Shard 006: PMConcept7 Home Workspace Control Reconciliation — 2026-08-04

Source: `Plans/FinalGUISpec.md`

Source lines: L262-L928

Source SHA256: `b4ba9c4395d25651bfdd6e0a0258ad6f4f830247dbe4af008acbde9348d09684`

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

Amended 2026-08-13 — floating is never a boot state. Every surface record carries
`last_docked_host`; at boot any persisted `floating` surface is demoted to its
`last_docked_host` (floating bounds preserved for a later re-float) and the
demotion persists with a `storage.boot_demote_floating` receipt. A reload
therefore always opens fully docked.

Amended 2026-08-13 (tweak wave) — `dock_right` spans the full workspace height.
The Home grid template is `"top top right" / "left main right" /
"bottom bottom right"`: the right dock runs from the top of the workspace to the
bottom (a chat docked right is full-height), while the top and bottom docks end
where the right column begins. Host identities, caps, and persistence are
unchanged.

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

Amended 2026-08-13 — floating is explicit-only. Dragging a surface out of the
window no longer floats it: a pointer past the workspace root resolves to the
`invalid_target` disposition (no-drop cursor, revert on release). The 2026-08-12
sentence above, "Leaving the window resolves to `floating`", is retired as stale
with this dated disposition; the only routes to the floating host are the explicit
Pop Out menu row (editor panels, Chat, and Dashboard) and the keyboard float key
on the grab handle. Drop preview is footprint-true and change-gated: the
placeholder always carries the dragged surface's pickup-time footprint clamped to
the target host band, sits at the correct flex order, and re-seats only when the
resolved host or insertion index actually changes (one FLIP reflow per change with
a 16 ms per-item stagger), so mid-drag frames are stable instead of churning. An
empty dock's track opens to the incoming footprint while it is targeted. Hosts
carry visible-surface caps — three per left/right dock, two per top/bottom dock,
four floating, `home_main` uncapped — enforced with an announced `host_full`
refusal at gesture level and softly at normalization, which spills overflow to
`home_main` and never quarantines.

Amended 2026-08-13 — resize is adjacent-pair pixel transfer. At gesture start
every visible sibling's basis is frozen to its measured pixels, and the divider
moves pixels between the two adjacent surfaces only: a 200 px drag is exactly
+200/-200 on that pair with non-adjacent surfaces untouched. Commit skips the full
re-render (the DOM already equals the model), so there is no settle flash.
Effective minimums degrade to fair share (container divided by visible surfaces,
against nominal minimums of editor 220 px, chat 260 px, dashboard 240 px,
terminal 150 px) so a divider can always move and every boundary stays reachable.
Dock track clamp bands are unified in one host-band table (left/right 220-520 px,
top/bottom 150-380 px). Floating surfaces carry a bottom-right corner handle that
drives width and height in one gesture. Resizer visuals are unchanged — only
mechanics and minimums changed. A no-dead-space invariant holds at render, boot,
and window resize: visible `home_main` bases are re-summed to the host width, so a
degenerate persisted layout self-heals instead of rendering an unclaimable void,
and any stray drop placeholder outside an active gesture is swept at render.

Amended 2026-08-13 (tweak wave) — the drop preview projects the TARGET geometry,
not the source footprint. The earlier same-day rule that the placeholder carries
the dragged surface's pickup-time footprint is retired with this dated
disposition: the placeholder now renders the geometry the surface would actually
receive at the destination — its fair share of the destination host for column
hosts, and full width plus the dock's track thickness for row-axis docks — so
the preview is an honest picture of the commit. Two drag guards ship with it: a
pointer pickup that never left the source surface's own rect resolves to the
source placement (no accidental first-frame retarget), and a host whose track was
expanded only by the preview never captures the hit-test for that expansion
(preview growth cannot attract the drop it is previewing). Change-gating, the
16 ms FLIP stagger, host caps, and the invalid_target window-exit rule are
unchanged.

Amended 2026-08-13 (tweak wave) — row-axis dock resize gains a second axis. The
top and bottom docks support both within-row pair width transfer (column
dividers between siblings, same adjacent-pair pixel mechanics) and a full-width
track handle that drives the dock's thickness through a new persisted
`size.cross_basis_px` field with host-max semantics (the rendered track is the
maximum cross basis among the dock's visible surfaces), clamped by the shared
host-band table; layouts persisted before the field existed migrate it from
`basis_px`.

Amended 2026-08-13 (wave 3) — drag stability refinements. Target adoption carries
a two-frame hysteresis (a candidate host/index must survive two consecutive
resolved frames before the placeholder re-seats), surfaces that are mid-FLIP are
excluded from hit-testing via `data-pm-home-flip` (an animating surface cannot
steal the target), and drag auto-scroll re-applies only on actual scroll or
pointer movement. The placeholder previews the dragged surface's PROPORTIONAL
projected width, mirroring the `normalizeMainRowBases` re-sum the commit will
run, so the preview and the committed layout agree. The PM_EDGE band geometry
defers during ALL Home gestures — move and workgroup drags participate in the
`pm-resizing`/`PM_DRAGEND` deferral alongside resize.

### F3-HOME-003 — Shell controls and capability envelope

The Home title bar exposes one 28 by 28 inline-SVG `Home more options` button
immediately left of Theme. Its compact body-portaled popup has exactly four
top-level rows (amended 2026-08-13; the three-row inventory is retired below), in
order: `Open Panel` with a Panel 1 through Panel 4 side flyout,
`Open Browser in Panel` with the same four-target side flyout, a divider,
`Collapse Bottom Terminal`, and `Reset Layout`. It follows the Chat model/mode popup and effort-flyout
interaction language: restrained elevation, corner-sprout opening, viewport
flipping, hover bridge, roving keyboard focus, Enter/Right Arrow to enter a
flyout, Left Arrow to return, Escape/outside dismissal, reduced-motion parity,
and focus restoration to the invoker. `Collapse Bottom Terminal` is disabled
with an accessible reason when no eligible bottom terminal exists. Amended
2026-08-13 (tweak wave) — the row is now a TOGGLE: while the bottom terminal is
collapsed the row relabels at runtime to `Expand Bottom Terminal` and expands it
(the authored markup label stays `Collapse Bottom Terminal`; the relabel is a
runtime projection). The earlier one-way rule ("its label never changes into an
Expand action") is retired with this dated disposition.

File Manager, Move/Dock, pop-out, close, counts, recovery diagnostics, and
layout revision/debug data are forbidden in this popup. Amended 2026-08-13 — the
prior reset prohibition in this popup is retired with a dated disposition below:
`Reset Layout` is now dual-surface. The top-bar Home menu carries the fourth row
`Reset Layout` (`data-pm-home-top-action="reset-layout"`) after
`Collapse Bottom Terminal`, and `Reset Home Layout` under
Settings -> General & Appearance -> Startup & Recovery keeps working; both
dispatch the same `cmd.workspace_layout.reset` and no new command ID is minted.
In the concept demo the top-bar row additionally closes any legacy chat overlay
state and reloads the page so the demo flow restarts pristine; that reload
semantic is concept-demo behavior only and is NOT promoted into the typed command
contract. File Manager targets remain in File Manager; terminal limits
remain in terminal-local controls. Editor menus expose Open Browser, Pop Out, and
Close Panel; Pop Out also appears on the Chat and Dashboard menus (amended
2026-08-13), and an explicit action is the only route to floating.

Amended 2026-08-12 — every eligible editor, Dashboard, Chat, and terminal section
carries one grab handle at the top-left of its own head row: a small, always-visible
inline-SVG grip with a grab cursor, a stable accessible name, a focus ring, and a
grabbed state. That handle is the only movement affordance. The per-surface
`Main / Dock Left / Dock Right / Dock Top / Dock Bottom / Float` menu rows are
retired; a surface options menu states the current placement and points at the handle
instead of offering targets. Movement semantics, commands, receipts, and events are
unchanged — only the affordance changed — and keyboard movement on the handle
(F3-HOME-002) carries the accessibility contract the retired rows used to hold.

Amended 2026-08-13 — the grab handle is a 28 by 28 folded-corner triangle filling
the surface's top-left corner (`clip-path: polygon(0 0, 100% 0, 0 100%)`). It is
the surface element's own absolutely positioned first child rather than a head-row
flex item; clip-path hit-testing lets the empty half of the square fall through to
the content beneath, z-index 40 keeps it above surface chrome and below the
resizers, and because outlines are clipped the focus ring renders in-glyph. The
accessible name, grabbed state, ARIA grammar, and the keyboard movement contract
are unchanged. The 2026-08-12 head-row six-dot grip presentation is retired as
stale with this dated disposition.

Amended 2026-08-13 (tweak wave) — the grab handle is now a SMALL LINES-ONLY
glyph at each surface's TOP-RIGHT corner: two diagonal grooves (stroked paths,
no filled plate) over an 18 px corner hit triangle. The same-day 28 px
folded-corner triangle filling the top-left corner is retired with this dated
disposition. The accessible name, grabbed state, ARIA grammar, keyboard movement
contract, in-glyph focus treatment, and clip-path hit-testing (the empty half
still falls through) are unchanged; head-row chrome clears the grip with
right-edge margin instead of left padding. The surface kebab menus no longer
carry a Placement section or placement hint — the grip is the sole movement
affordance and the menus no longer restate it.

Amended 2026-08-13 (wave 3) — the surface options button (kebab) is a vertical
three-dot 16 by 20 control absolutely positioned at the surface's right edge,
directly below the grip, uniform across editor panels, Dashboard, terminal
sections, and Chat. It no longer lives in the surfaces' head rows — moving it
out of the terminal head row also removed the stray control strip that rendered
at the bottom of the terminal panel. Workspace spacing re-tunes to 2 px vertical
padding through the new `--pm-home-pad-y` and `--pm-home-gap-y` tokens with 4 px
sides; the tweak-wave uniform 4 px value is superseded for the vertical axis
with this dated disposition.

The bottom terminal's own collapse control is a toggle: an inline-SVG chevron at the
right end of the terminal bar that collapses the section and, from the collapsed
strip, expands it again. The collapsed strip keeps that control visible and
hit-testable — it is the expand affordance — and the control reports post-commit
state. Amended 2026-08-13 (tweak wave): the top-bar menu row is now also a
toggle (runtime relabel to `Expand Bottom Terminal` while collapsed); the prior
sentence here that the top-bar row is one-way and never relabels is retired with
the dated disposition above.

Amended 2026-08-13 (tweak wave) — terminal workgroup movement never strands a
section. `Move Workgroup to New Section` reseeds the vacated source section with
a fresh workgroup in the same commit, so both sections stay usable; at the
four-pane cap the source instead stays empty with a tidy guidance state rather
than a broken shell. Reset reconstitutes a live workgroup: it prefers a section
that still owns one and falls back to the pristine seed when none does. The
move command payload records `source_reseeded`, and cancellation discards any
reseeded workgroup with the rest of the draft. Amended 2026-08-13 (wave 3) — the
empty-section guidance state is truth-gated: it renders only while
`#bottomPanel[data-pm-term-empty]` is stamped by the terminal runtime
projection, so the guidance can never cover a live workgroup, and
`restoreOwnerRefs` repairs paneless pristine workgroup references at boot
instead of dropping them — section records are never discarded. Wave-3
follow-up (2026-08-13): the repair generalizes to ANY paneless live-workgroup
reference — a live workgroup that has lost its panes reconstitutes a minimal
pane rather than being nulled, and the empty-section block never renders over a
live workgroup. Extended (final wave-3 build): when NO terminal section holds a
live workgroup id at all (persisted-null corruption), `restoreOwnerRefs` reseeds
section 1 from the pristine terminal seed and heals the persisted domain-ref
CSVs in the same pass — the empty-guidance block never renders over a
recoverable state.

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

Superseded 2026-08-13: drag-to-window-exit floating is retired — a pointer past
the workspace root is `invalid_target` and floating is reached only through the
explicit Pop Out rows (editor panels, Chat, Dashboard) or the keyboard float key;
persisted floating surfaces demote to `last_docked_host` at boot with a
`storage.boot_demote_floating` receipt. The PM6 base full-screen chat overlay
(`.pm6-chat-overlay` fixed panel plus viewport scrim) is retired in PM7 in favour
of the single in-canvas float system. The three-row top-bar Home menu inventory
and its reset prohibition are superseded by the four-row inventory including
`Reset Layout` (dual-surface with the Settings row). The head-row six-dot grip is
superseded by the top-left corner triangle grip. Single-basis flex resize and the
full re-render on resize commit are superseded by adjacent-pair pixel transfer
with fair-share minimum degradation and the render-time no-dead-space invariant.

Superseded 2026-08-13 (tweak wave): the same-day 28 px folded-corner top-left
triangle grip is superseded by the small lines-only top-right glyph (18 px hit
triangle); the pickup-footprint drop preview is superseded by target-geometry
projection with the pickup-band and preview-capture guards; the one-way top-bar
`Collapse Bottom Terminal` contract is superseded by the runtime toggle relabel;
the kebab Placement section/hint is retired; the equal-height three-column grid
is superseded by the full-height `dock_right` template; the dedicated editor
pane-close glyph is retired in favour of the kebab `Close Panel` row; and the
app status bar is removed from the PM7 shell.

Superseded 2026-08-13 (wave 3): the head-row kebab placement is superseded by
the vertical-dots 16 by 20 control at the surface's right edge below the grip
(removing the stray terminal control strip); instant single-frame drop-target
adoption is superseded by the two-frame hysteresis with mid-FLIP hit-test
exclusion; the uniform 4 px workspace padding is superseded on the vertical
axis by 2 px (`--pm-home-pad-y`/`--pm-home-gap-y`); the wave-2 glass rail alpha
of 88 percent and the scrollbar-track-margin exclusion are superseded by 84
percent and the minimap-only code-pane scrollbar; and unconditional
empty-section guidance is superseded by the truth-gated
`data-pm-term-empty` projection.

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
canonical_text: "The 28 by 28 Home more-options trigger immediately left of Theme opens one compact body-portaled four-row popup (amended 2026-08-13): Open Panel, Open Browser in Panel, divider, Collapse Bottom Terminal, and Reset Layout; the first two rows expose Panel 1 through Panel 4 side flyouts, Reset Layout dispatches cmd.workspace_layout.reset as a dual surface with the Settings Startup & Recovery row, and all other Home actions live at their owner surfaces. Amended 2026-08-13 (tweak wave) - the Collapse row is a toggle: it relabels at runtime to Expand Bottom Terminal while the terminal is collapsed and expands it, dispatching cmd.workspace_layout.set_collapsed with the negated current value; the authored markup label stays Collapse Bottom Terminal."
gui_related: true
gui_classification_reason: This unit owns the visible title-bar menu inventory, placement, keyboard behavior, and disabled treatment.
split_recommended: false
depends_on: [F3-501, UCC-144, UIW-010]
unblocks: []
acceptance_criteria:
- The popup has exactly the four ordered top-level actions (Open Panel, Open Browser in Panel, Collapse Bottom Terminal, Reset Layout) and no File Manager, Move/Dock, pop-out, close, count, recovery, revision, or debug row.
- Flyouts support hover bridge, Enter/Right Arrow, Left Arrow, roving focus, Escape/outside dismissal, viewport flipping, reduced motion, and trigger focus restoration.
- The Collapse row toggles; it reads Expand Bottom Terminal at runtime while the terminal is collapsed, round-trips collapse and expand with one cmd.workspace_layout.set_collapsed per activation, and exposes the canonical disabled reason when no eligible bottom terminal exists.
- Reset is dual-surface; the top-bar Reset Layout row and Settings -> General & Appearance -> Startup & Recovery both dispatch cmd.workspace_layout.reset, no new command ID is minted, and the concept demo's post-reset page reload is demo behavior only, not part of the typed command contract.
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
preserved_exact_tokens: [Open Panel, Open Browser in Panel, Collapse Bottom Terminal, Reset Layout, Reset Home Layout]
negative_constraints:
- Do not restore the Home control-center menu.
- Do not place disclosure-only actions on the command bus.
compatibility_only_notes: []
stale_retired_dispositions:
- Diagnostics, File Manager, Move/Dock, pop-out, close, count, recovery, and revision rows in the title-bar Home menu remain retired.
- "Amended 2026-08-13: the 2026-08-04 reset prohibition in the title-bar Home menu is itself retired — Reset Layout is a required fourth row, dual-surface with the Settings Startup & Recovery row, both dispatching cmd.workspace_layout.reset. The three-row inventory is retired with it."
- "Amended 2026-08-13 (tweak wave): the one-way Collapse contract (Collapse stays Collapse, never an Expand alias) is retired — the row is a toggle with a runtime Expand Bottom Terminal relabel while collapsed."
owner_hints: [Plans/FinalGUISpec.md, Plans/UI_Command_Catalog.md]
```

### F3-503 - Home Gestures Resizers And Scroll Dissolve

```yaml
plan_unit_id: F3-503
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Home surface drag, drop, insertion, reflow, float, dock, and resize use one draft-model
  Pointer Events transaction, shared diamond resizers, and shared four-edge scroll dissolve;
  pointermove is preview-only and one changed end commits once. Amended 2026-08-13 - drop
  preview is footprint-true and change-gated (the placeholder carries the pickup-time
  footprint at the correct flex order and re-seats only on a host or insertion-index change,
  one FLIP reflow wave per change with a 16 ms stagger); window exit is invalid_target and
  floating is explicit-only; hosts carry visible-surface caps (left/right 3, top/bottom 2,
  floating 4, home_main uncapped) with overflow spilling to home_main; resize is
  adjacent-pair pixel transfer against pixel-frozen sibling bases with fair-share minimum
  degradation (effective min = min(nominal, container/visibleCount)), unified host clamp
  bands, a floating bottom-right corner handle driving both axes, commit without a full
  re-render (no settle flash), and a render-time no-dead-space invariant that re-sums
  visible home_main bases to the host width so degenerate persisted layouts self-heal.
  Amended 2026-08-13 (tweak wave) - the drop preview projects the TARGET geometry (fair
  share of the destination host; full width plus track thickness for row-axis docks),
  retiring the same-day pickup-footprint preview; a pickup that never left the source
  surface's rect resolves to the source placement and a preview-expanded host never
  captures the hit-test for its preview growth. Row-axis docks add a full-width track
  handle driving the dock's thickness through the persisted size.cross_basis_px field
  (host-max semantics, host-band clamped, migrated from basis_px), alongside within-row
  pair width transfer on the column dividers. Amended 2026-08-13 (wave 3) - target
  adoption has a two-frame hysteresis, mid-FLIP surfaces are excluded from hit-testing
  (data-pm-home-flip), drag auto-scroll re-applies only on actual scroll or pointer
  movement, the placeholder previews the dragged surface's proportional projected width
  (mirroring the normalizeMainRowBases re-sum), and the PM_EDGE band geometry defers
  during all Home gestures (move and workgroup join resize in the
  pm-resizing/PM_DRAGEND deferral).
gui_related: true
gui_classification_reason: This unit owns visible layout gestures, previews, resize feedback, scrolling-edge treatment, and recovery.
split_recommended: false
depends_on: [F3-501, UIW-010]
unblocks: []
acceptance_criteria:
- Pickup retains pointer offset and shows landing placeholder, neighbor reflow, and narrow theme-aware edge previews.
- Escape, pointercancel, blur, invalid targets, and unchanged drops restore the exact committed model with no command, persistence, or success event; loss of pointer capture alone is not a cancellation vector.
- Every eligible boundary uses the shared theme-aware diamond glow/recovery controller and commits once on changed pointer-up only.
- Every new vertical or horizontal scrollport enrolls in the shared four-edge dissolve system with no-overflow and reduced-motion handling.
- The drag placeholder projects the target geometry (fair share of the destination host; full width plus the dock's track thickness in a row-axis dock), sits at the correct flex order, and re-seats only when the resolved host or insertion index changes; a pickup still inside the source surface's rect resolves to the source placement, a host expanded only by the preview never captures the hit-test for that expansion, and dragging past the workspace root shows the invalid_target no-drop state and never floats the surface.
- The top and bottom docks resize on both axes; column dividers transfer width between the adjacent pair inside the row, and the full-width track handle changes the dock's rendered thickness by writing size.cross_basis_px (host-max semantics, host-band clamped), with pre-field layouts migrating cross_basis_px from basis_px.
- A candidate drop target must survive two consecutive resolved frames before the placeholder re-seats; a surface carrying data-pm-home-flip is invisible to the drag hit-test; auto-scroll does not re-apply without actual scroll or pointer movement; and the placeholder's previewed width equals the proportional share the post-commit normalizeMainRowBases re-sum would grant (wave 3, 2026-08-13).
- A divider drag transfers pixels between the adjacent pair only (+N/-N exactly), non-adjacent surfaces are untouched, and commit produces no settle flash; effective minimums degrade to fair share so every boundary stays reachable, and floating surfaces resize on both axes from the bottom-right corner handle.
- At render, boot, and window resize the visible home_main bases re-sum to the host width; a degenerate persisted layout self-heals with no host background band wider than the gap token, and a full host refuses an incoming drop with an announced host_full disposition while normalization spills overflow to home_main.
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
- Do not re-render a surface subtree or restart the reflow animation on a pointermove that does not change the resolved drop target.
compatibility_only_notes: []
stale_retired_dispositions:
- "Amended 2026-08-13: single-basis flex resize (which diluted a divider drag across non-adjacent siblings) and the full re-render on resize commit (settle flash) are retired; hard fixed minimums that could make a boundary unreachable are retired in favour of fair-share degradation; drag-to-window-exit floating is retired as invalid_target (see F3-HOME-002); treating loss of pointer capture alone as a cancellation vector was retired 2026-08-12 and this unit's criteria now reflect it."
- "Amended 2026-08-13 (tweak wave): the same-day pickup-footprint drop preview is retired in favour of target-geometry projection with the pickup-band and preview-capture guards; single-axis row-dock sizing is retired in favour of the cross_basis_px track handle plus within-row pair transfer."
- "Amended 2026-08-13 (wave 3): instant single-frame target adoption is retired in favour of the two-frame hysteresis; mid-FLIP surfaces are excluded from hit-testing; per-frame auto-scroll re-application is retired (actual movement only); the fair-share placeholder width is refined to the proportional projected width mirroring normalizeMainRowBases; PM_EDGE deferral widens from resize-only to all Home gestures."
owner_hints: [Plans/FinalGUISpec.md, Plans/UI_Wiring_Rules.md]
```

### F3-504 - Home Web And Native Capability Boundary

```yaml
plan_unit_id: F3-504
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Native Slint 1.17.1 is Rust-model-first and multi-window capable; web guarantees in-app
  docks and in-canvas floating only, treats popup presentation as direct-user-activation
  optional degradation, and falls back honestly when blocked. Amended 2026-08-13 - PM7
  retires the base full-screen chat overlay; every non-docked chat mode routes to the
  single in-canvas float system (PM_HOME_WORKSPACE.popOutChat), which shows no scrim,
  cannot cover the title bar, and cannot produce a second chat surface. Floating is never
  a boot state; persisted floating surfaces demote to last_docked_host at boot with a
  storage.boot_demote_floating receipt.
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
- The chat pop-out floats in-canvas in the Home float layer with no full-viewport scrim, the title bar stays visible above it, and no re-render while it is open yields a second chat surface.
- A reload never restores a floating surface; each persisted floating surface demotes to its last_docked_host and the demotion persists with a storage.boot_demote_floating receipt.
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
- Do not reintroduce a full-viewport chat overlay or any scrim that can cover the title bar.
compatibility_only_notes: []
stale_retired_dispositions:
- "Amended 2026-08-13: the PM6 base full-screen chat overlay (.pm6-chat-overlay fixed panel plus viewport scrim) is retired in PM7 via a T20-anchored guard on the base applyLayout; its scrim CSS remains dead code in the base for census stability but no code path can show it."
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
  immediate state changes. Amended 2026-08-13 - the tab rail is a translucent plate
  (--ed-rail-solid split from --ed-rail-bg at 72 percent alpha) over the existing
  backdrop blur so scrolled code ghosts under the strip; the concave shoulders are
  masked cutouts through which the frosted rail shows while the active tab and the
  canvas keep the shared opaque fill; the silhouette layer mounts only after a
  successful measure and mounts as the strip's last child (slot 0 is uncontested:
  the grip moved out of the strip to the surface corner); fitters are mutation-free
  in steady state. Amended 2026-08-13 (tweak wave) - the silhouette geometry is
  redesigned: the strip is 40 px tall (36 px on the dashboard) with a near-full-height
  active tab, a 13 px squircle crown that is theme-tunable through --ed-top-radius
  (friendly 16, glass 14, retro 6), and shoulder and canvas radii of 12 px, retiring
  the 10 px canvas / 8 px cutout maxima; the JS now writes only the contact PROGRESS
  custom properties --ed-lp and --ed-rp (0..1 per side, same 20 px threshold) and the
  CSS derives the per-theme radii from them; corner caps render the canvas-corner
  morph at the visible rail boundary; tabs start flush at the panel's left edge;
  per-theme skins apply (friendly mint canvas with lime active label, glass plate
  with edge highlight, retro sharp corners with lime). The dashboard tab strip
  (Main/Metrics/Monitoring) enrolls in the same connected-surface system - EDSHAPE
  syncs .dashboard-tabs and the dashboard header plate uses the shared rail recipe at
  the same alpha - while the title-bar page tabs keep their sliding ink (the F3-464
  boundary is unchanged). The editor scrollbar is excluded from the frosted rail band
  via a scrollbar-track margin. Amended 2026-08-13 (wave 3) - the silhouette gains
  theme skin tokens: --ed-shape-outline, --ed-shape-crown with --ed-shape-crown-h, and
  --ed-tab-inactive-ring with its ring radius. Retro draws its signature hard outline
  with square inactive-tab rings; basic draws a 2 px
  accent-blue crown over a 9 px top radius; glass draws a three-edge glass-edge bevel
  and re-tunes the rail alpha to 84 percent (the wave-2 88 percent value is retired
  with this dated disposition). Wave-3 follow-up (2026-08-13): the retro outline lives
  on the ACTIVE TAB as a three-edge inset ring that snaps on arrival, not on the
  travelling connected shape - the outline-on-the-travelling-shape rendering is retired
  with this dated disposition. The editor minimap is the ONLY code-pane scrollbar -
  native scrollbars are suppressed - and the minimap band aligns with the frosted rail
  via margin rather than padding, retiring the wave-2 scrollbar-track-margin exclusion
  with this dated disposition.
gui_related: true
gui_classification_reason: This unit defines the visible active-editor-tab chrome, its joined-surface geometry, and its motion.
split_recommended: false
depends_on: [F3-421, F3-466]
unblocks: []
acceptance_criteria:
- "The active tab, its corner helpers and the code canvas resolve to one fill token, the rail resolves darker, and no border or seam separates the active tab from the canvas at any frame."
- "leftProgress and rightProgress are computed independently against a 20 px threshold; a flush side renders canvasRx 0 and cutoutRx 0 while the opposite side keeps its corner."
- "Only the horizontal extent of a corner animates, driven by the per-side progress custom properties --ed-lp/--ed-rp; as of the 2026-08-13 tweak wave the CSS derives the radii from that progress against the 12 px shoulder/canvas maxima and the theme's --ed-top-radius crown (13 px default; friendly 16, glass 14, retro 6)."
- "The dashboard tab strip participates in the same connected-surface system with the shared rail recipe at the same alpha, and tabs start flush at the panel's left edge."
- "Per-theme silhouette skins resolve through --ed-shape-outline, --ed-shape-crown/--ed-shape-crown-h, and --ed-tab-inactive-ring: retro renders its hard outline with square inactive rings, basic renders the 2 px accent-blue crown at a 9 px radius, and glass renders the three-edge bevel at 84 percent rail alpha (wave 3, 2026-08-13)."
- "The editor minimap is the only code-pane scrollbar; native scrollbars are suppressed and the minimap band aligns with the frosted rail via margin, not padding."
- "Dragging tracks the pointer one-to-one with corner values derived in the same frame; selection by click, snap or keyboard produces the identical transition."
- "No dark pinhole at a join, no one-frame square or round pop at the start or end of a transition, and no shrinking circular dimple near a collision boundary."
- "Resizing the window or changing tab widths recomputes stable target bounds; reduced motion snaps without spring travel."
- "The rail band ghosts scrolled content beneath it in non-glass themes (pixels change when the code canvas scrolls under the strip); glass themes composite by alpha without blur per their documented budget; the active tab and canvas keep the shared opaque fill so the join stays seamless."
- "The silhouette never renders half-dressed: chrome classes apply only after a successful measure, so --ed-shape-x/--ed-shape-w are never stuck at zero while the strip is in the shape-on state, and the shape layer mounts as the strip's last child without contending for slot 0."
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
preserved_exact_tokens: ["20", "10", "8", "13", "12", "clamp", "squircle", "--ed-lp", "--ed-rp"]
negative_constraints:
- "Do not render the active-editor-tab treatment as a pill or an underline sliding between labels."
- "Do not retain a decorative notch where the tab and the canvas are flush."
- "Do not ease the corner values independently of the tab position during a drag."
- "Do not crossfade the whole surface between tabs."
compatibility_only_notes:
- "Slint portability: reproduce the silhouette with layered shapes or custom paths and preserve the geometry and motion rules rather than the CSS mechanism; corner-shape squircle or superellipse is progressive enhancement on the web with elliptical border-radius as the fallback."
stale_retired_dispositions:
- "The prior active editor file tab treatment (surface-tinted tab plus a 2 px accent underline, with per-theme underline recolours) is retired for this surface; the silhouette is the active-tab chrome."
- "Amended 2026-08-13: the opaque rail fill introduced with the silhouette is retired — it defeated the editor scroll-under frost; the rail is a translucent plate over backdrop blur. The ensure-before-measure mount order (which produced a dead, collapsed silhouette in the built artifact) and the strip-firstChild mount slot (which contended with the T20 grip) are retired."
- "Amended 2026-08-13 (tweak wave): the 10 px canvas / 8 px cutout radius maxima and the JS-written per-corner radius properties are retired — the JS writes contact progress (--ed-lp/--ed-rp) and the CSS derives 12 px shoulder/canvas radii plus the theme-tunable --ed-top-radius crown; the editor-file-tabs-only scope is widened to include the dashboard tab strip."
- "Amended 2026-08-13 (wave 3): the glass rail alpha of 88 percent is re-tuned to 84 percent, and the wave-2 scrollbar-track-margin exclusion is retired — the minimap is the only code-pane scrollbar (native bars suppressed), aligned with the frosted rail via margin."
- "Wave-3 follow-up (2026-08-13): the retro hard outline on the travelling connected shape is retired — the outline renders on the active tab as a three-edge inset ring that snaps on arrival."
owner_boundary_notes:
- "F3-421 owns editor tab close, pane close and the width-aware +N more overflow chip; F3-466 owns the friendly-theme editor tab shape; F3-464 owns the title-bar page-tab sliding ink and is unaffected by this unit. As of the 2026-08-13 tweak wave this unit covers editor file tabs AND the dashboard tab strip (Main/Metrics/Monitoring); title-bar page tabs remain out of scope."
owner_hints: [Plans/FinalGUISpec.md]
```
