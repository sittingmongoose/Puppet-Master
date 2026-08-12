# Shard 006: PMConcept7 Home Workspace Control Reconciliation — 2026-08-04

Source: `Plans/FinalGUISpec.md`

Source lines: L262-L524

Source SHA256: `62b38f0b20ec5ffd6300105382188f64d70f5c26b8a41eb6761addafbf8d9360`

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
revision, and persists once. Cancellation, invalid targets, lost capture, Escape,
blur, and pointer cancellation restore the exact pre-gesture snapshot. The target
priority is explicit inner insertion/split, outer edge dock, floating, then invalid
revert. All resize endpoints use the shared resizer glow/recovery contract and all
new scrollports register with the four-edge scroll dissolve system.

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
presentation only. Move/Dock remains in each eligible surface's options menu;
File Manager targets remain in File Manager; terminal limits remain in
terminal-local controls. Each eligible editor, Dashboard, Chat, and terminal
section menu exposes Main, Dock Left, Dock Right, Dock Top, Dock Bottom, and Float.
Editor menus additionally expose Open Browser, Pop Out, and Close Panel.

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
