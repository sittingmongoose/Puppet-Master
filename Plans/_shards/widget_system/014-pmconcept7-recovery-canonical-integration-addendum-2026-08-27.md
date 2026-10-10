# Shard 014: PMConcept7 Recovery Canonical Integration Addendum - 2026-08-27

Source: `Plans/Widget_System.md`

Source lines: L1204-L1657

Source SHA256: `c662bd5004ee1856b3c78260dfcd1919a2fe8ff8f1c0751a561ba1c0e853e755`

---

## PMConcept7 Recovery Canonical Integration Addendum - 2026-08-27

This addendum integrates the recovered PMConcept7 Usage and Dashboard widget behavior into the current Widget
System owner. Current source lineage is the pinned `Concepts/pm7-tools/base/PM7-base.html` plus the
assertion-guarded T33-T43 pipeline in `Concepts/pm7-tools/build_pm7.py`; `Concepts/PMConcept7.html` is the
protected generated output and is never an authored owner. The current repo-local audit status is
`Plans/.audits/audit-20260829-001-pmconcept7-widget-followup/audit_report.json`; incomplete or failed runtime,
visual, interaction, motion, or accessibility rows remain `verification_pending`, so this addendum grants no such audit
credit. It reuses the existing `cmd.widget.*` family and current widget-layout namespaces; it creates no
second layout store, PM7-only command family, WorkNode, NodeSeed, executable queue, implementation task,
production implementation code, or generated governance artifact.

Final successor evidence is report-owned. When `audit_report.json` records `status = pass_with_named_residuals`
and `verdict = successor_scope_verified_with_named_residuals`, the `evidence_ref` entries below prove only their
named exact-hash PMConcept7 concept/demo slices. They grant no native Slint, production-runtime, PNC-019,
certification, completeness, or product-readiness credit; every blocked, failed, uncaptured, or residual lane
retains that classification.

Build8 browser receipts do not establish an all-visuals pass. The protected Settings actual-pixel review retains
`IVR-T41-B8-XPAGE-001`: the rightmost Settings card column is visibly cropped at 1180, 980, 860, and 680 in all
eight themes even though the cross-page runner reports root-level containment. The P2 narrow page-overflow menu
keyboard-focus and Arrow-key-navigation defect also remains open, and PNC-019 remains outside this evidence.

### WS-017 - Kind-Aware Curated Size And Adaptive Content Contract

```yaml
plan_unit_id: WS-017
unit_type: requirement
status: accepted
owner_doc: Plans/Widget_System.md
canonical_text: >-
  Widget sizing is a kind-aware semantic contract rather than arbitrary empty geometry. Each widget kind
  exposes only supported curated shapes, named Strip, Compact, Standard, and Expanded, or Wide, Full width,
  Panel, Ladder, and Band where the shape is the point; Maximum and Tall are retired names, because they promised
  more than the size showed. Increasing a widget's supported size must increase useful
  information density: wide instruments and summaries use balanced internal columns; lists, accounts,
  providers, ledgers, and event cards reveal more complete rows; charts spend the extra area on plot and
  legible facts; context and authority cards reveal additional source, route, confidence, history, forecast,
  reset, or settlement facts. A compact tier mounts complete content groups only, so the next tier never
  peeks, clips, or appears as a partial row, bar, label, legend, or footer.
  Size presets (rethought 2026-10-09, Plans/Decision_Log.md#DL-176) are the named sizes a widget kind offers in
  its card menu's size picker. The Usage board measures its own width and lays cards on 12 tracks below 880 px,
  20 tracks from 880 px, 24 tracks from 1100 px, and 30 tracks from 1460 px of board width; a board keeps its
  class until its width falls 24 px below that class's threshold (a 20-track board holds down to 856 px), so a
  20-track board never runs under a pitch of about 43 px and widgets can be much narrower than before. Each kind
  offers few presets (two or three for most kinds, four for trend and columns, one for the group heading), and each
  preset is one complete content tier that adds a named content step over the kind's preset before it. A preset resolves to pixels: its
  width is authored in tracks at the nominal 47 px pitch, per board class where a class should offer a wider card,
  and the board resolves it at the live pitch to the same card width on every board, never more than 2 % narrower
  and never wider than the board, except that a board-wide preset takes the class's whole track count (12, 20, 24, or
  30). Its height follows one of three rules: a fixed number of rows, for content that stretches into its card
  (charts, rings, tiles); fit N, the smallest height that shows N complete items of the kind (accounts, rows,
  resets, models, families), which shows every item and says so when the kind has fewer; or fit all, the smallest
  height at which the kind folds nothing. A fit height is measured by rendering the real kind at the preset's pixel
  width in the current look, range, scope, and configuration, is capped at the kind's maximum height, and uses the
  table's fallback rows until a measure exists. A preset that would only repeat another at a board class, or whose
  form needs more card width than the board gives, is not offered there, and two presets that come to the same size
  on the current board are one row, kept by the larger tier. Every kind's smallest preset shows its complete tier,
  in every look, on any board down to 400 px wide. A preset never makes a card so small that it shows fragments, a
  chart without readable axes or values, a list cut mid-row, or numbers without the label that explains them. Facts a
  preset cannot show stay reachable: the head's "+N" count and an "N more" line each with its hover list, and
  Details. The card head's size tool opens the size picker, and the card menu's Size row drills into the same picker.
  The picker shows a preview stage and then one row per preset: a footprint glyph drawn to one scale for every row
  (the card's share of the board's width, and its height), the preset's name, one plain line saying what the card
  shows at that size, and its width x height in tracks and rows, the current preset checked; every row shows without
  the menu scrolling. The stage holds a faithful miniature, the real card rendered by its own kind in the current look
  at the preset's pixel size and scaled over a faint track grid, captioned with the name, width x height, pixel size,
  and what the miniature actually shows (every row, "6 of 9 rows, 3 in Details", every fact). Hovering a row, focusing
  it, or moving with the arrow keys previews that preset in the stage and dispatches nothing; choosing a preset
  commits one resize through the board's own resize path (WS-019). The per-kind preset table is kept once, in
  the curated-size matrix this unit validates against, and the size picker, keyboard resize, pointer snapping, and
  saved layouts read that one table.
gui_related: true
gui_classification_reason: This unit defines visible widget geometry, information-density tiers, and complete-or-hidden content behavior.
depends_on: [WS-002, WS-003, WS-015, WS-016]
unblocks: [WS-018, WS-019, WS-020]
acceptance_criteria:
  - A maintained tier matrix covers instrument, summary, list, chart, context, ledger, account, and provider kinds and identifies the supported curated shapes for each kind.
  - Every successive supported tier has a deterministic content delta; a larger card that only adds empty space fails.
  - Wide cards use internal columns or expanded plot/fact regions instead of leaving avoidable empty middle space.
  - Taller list, account, provider, ledger, and event cards reveal additional complete records without routine internal body scrolling.
  - Compact cards expose only complete groups; no lower-tier fragment, clipped label, partial row, hidden value, or peeking footer is visible.
  - The Free usage card and every named Usage width-coverage card earn each supported default and larger size with additional useful content.
  - Every size preset of every Usage widget kind, in every room that hosts that kind, at each of the 12, 20, 24, and 30 track counts where it is offered, renders a complete tier that reads sensibly on its own, and every kind's smallest preset does so in every look on boards 400, 550, and 700 px wide; a preset that shows a fragment, an unreadable chart, a cut row, or a value without its label is removed from the kind's preset set rather than kept.
  - The board takes 12 tracks below 880 px, 20 from 880 px, 24 from 1100 px, and 30 from 1460 px, holding each class until its width falls 24 px below that class's threshold; a preset resolves to the same pixel width on every board (never more than 2 % narrower, never wider than the board) except that a board-wide preset takes the class's track count.
  - Each preset's height is fixed rows, fit N (the smallest height showing N complete items, or every item when there are fewer), or fit all (the smallest height that folds nothing), measured from the real kind at the preset's pixel width in the current look, range, scope, and configuration and capped at the kind's maximum height; folded facts stay reachable through the head's "+N" count, an "N more" line with its hover list, and Details.
  - The size picker opens from the card head's size tool and from the card menu's Size row, shows a preview stage and one row per offered preset with a footprint glyph, its name, one plain line of what it shows, and its width x height, every row visible without scrolling; hover, focus, or arrow keys preview the preset in the stage as the real card at that pixel size without dispatch, choosing it commits exactly one resize, a preset not offered at the board's class or width is absent, and two presets of the same size on the board show as one row.
  - The size picker, keyboard resize, pointer snapping, and saved-layout restore read one per-kind preset table; no surface keeps its own preset list.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - tests/fixtures/usage_gui/presentation/curated_size_matrix.json (static contract fixture only)
  - tests/fixtures/usage_gui/presentation/widget_content_tiers.json (static contract fixture only)
  - "evidence_ref: Plans/.audits/audit-20260829-001-pmconcept7-widget-followup/browser/runs/t41-build8-focused-regression-rerun-2/report.json (SHA-256 4de0320f73010440560c5fed357df8b67f02188b6ca0a07c1ff3875de31485c0; exact Build8 concept/browser slice; readiness_claim=false)"
  - "evidence_ref: Plans/.audits/audit-20260829-001-pmconcept7-widget-followup/browser/runs/t41-build8-all-charts/report.json (SHA-256 673e3c9a033a101b41a28dbc0dffc59397515e2c91ae88abac8970414c722b66; exact Build8 concept/browser slice; readiness_claim=false)"
  - "evidence_ref: Plans/.audits/audit-20260829-001-pmconcept7-widget-followup/browser/runs/t41-build8-checked-in-width-matrix/report.json (SHA-256 54895af4fb7c7245bbc8c7d5772cd46dace251bfdfa023513fef490aa37e4dd0; exact checked-in Build8 concept/browser slice; readiness_claim=false)"
risk_class: widget_geometry_without_semantic_content
reasoning_tier: high
context_scope: widget_kind_aware_adaptive_content
implementation_surfaces:
  - Plans/Widget_System.md
  - Plans/usage-feature.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: widget_kind_aware_adaptive_content
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Concepts/pm7-tools/base/PM7-base.html (current recovered PMConcept7 source base; source-lineage-only)"
  - "Concepts/pm7-tools/build_pm7.py (current assertion-guarded T33-T43 pipeline)"
  - "Concepts/PMConcept7.html (protected generated output; verification input only; never hand-edit)"
  - "Concepts/usage-redesign/src/js/42-cards.js (Usage redesign card menu and size picker; source-lineage-only)"
  - "Concepts/usage-redesign/src/js/40-board.js (Usage redesign board track ladder; source-lineage-only)"
  - "Concepts/usage-redesign/tools/boards.py (the per-kind preset table as built, branch concept/usage-pm7-c-presets-20261009 at 21ca626731; source-lineage-only)"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/usage-mockups-20261001/lane-reports-20261010/c-presets-REPORT.md, SHA-256 505de34e60acd8d9efce08e5ec392f58c574db75cbadf5846a34c42424567a3e (preset rules, per-kind table, GPU-tested table at 1440, 1920, 400, 550, and 700 px boards, the 880 px class threshold)"
  - Plans/Decision_Log.md#DL-176
preserved_exact_tokens:
  - Strip
  - Compact
  - Standard
  - Expanded
  - Maximum
  - complete-or-hidden
  - size picker
negative_constraints:
  - Do not treat a larger rectangle with unchanged mounted content as a larger semantic size.
  - Do not use routine internal widget scrolling to conceal content that a curated size claims to contain.
  - Do not reveal fragments of a lower content tier.
  - Do not treat static source inspection or an in-progress audit as executable acceptance evidence.
  - Do not offer a size preset whose content tier is a fragment or does not make sense on its own, and do not keep a second preset list outside the one per-kind table.
  - Do not name a preset Maximum or Tall, and do not drop a fact a preset cannot show instead of folding it behind a reachable count, list, or Details.
owner_hints:
  - Plans/Widget_System.md
  - Plans/usage-feature.md
```

### WS-018 - Curated Geometry Auto-Growth And Default Composition

```yaml
plan_unit_id: WS-018
unit_type: requirement
status: accepted
owner_doc: Plans/Widget_System.md
canonical_text: >-
  Widget geometry resolves through a curated per-kind size catalog. Pointer, keyboard, restore, and migration
  inputs that do not name or resolve to a supported size snap deterministically to the nearest valid geometry.
  Eligible widgets expose explicit tall choices, and content-heavy list, account, provider, ledger, and event
  widgets may auto-grow their initial settled height to a curated cap based on complete record count. Default
  boards remain intentionally balanced: partial rows retain their curated width and alignment rather than
  stretching a lone card across the board, provider-heavy boards prefer narrower taller cards, and a mixed-size
  stress or demonstration layout is never the product default.
gui_related: true
gui_classification_reason: This unit defines supported geometry, auto-growth, and visible default-board composition.
depends_on: [WS-009, WS-017]
unblocks: [WS-019, WS-020]
acceptance_criteria:
  - Every widget kind has a finite supported-size catalog with deterministic snapping for unsupported arbitrary geometry.
  - Eligible kinds expose curated tall sizes and content-heavy kinds may auto-grow only to a declared cap using complete-row thresholds.
  - Auto-growth and user-selected sizes persist the resolved supported geometry and semantic size identity, not transient pointer dimensions.
  - Partial default rows keep curated card widths and deliberate alignment; no lone card stretches to full width merely to fill the row.
  - Provider-heavy default boards use narrower, taller cards and complete rows rather than long low-density horizontal cards.
  - No routine curated size depends on an internal body scrollbar to reveal its promised content.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - tests/fixtures/usage_gui/presentation/curated_size_matrix.json (static contract fixture only)
  - tests/fixtures/usage_gui/presentation/room_disclosure_matrix.json (static contract fixture only)
  - "evidence_ref: Plans/.audits/audit-20260829-001-pmconcept7-widget-followup/browser/runs/t41-build8-focused-regression-rerun-2/report.json (SHA-256 4de0320f73010440560c5fed357df8b67f02188b6ca0a07c1ff3875de31485c0; exact Build8 concept/browser slice; readiness_claim=false)"
  - "evidence_ref: Plans/.audits/audit-20260829-001-pmconcept7-widget-followup/browser/runs/t41-build8-checked-in-width-matrix/report.json (SHA-256 54895af4fb7c7245bbc8c7d5772cd46dace251bfdfa023513fef490aa37e4dd0; exact checked-in Build8 concept/browser slice; readiness_claim=false)"
risk_class: arbitrary_widget_geometry_or_bad_defaults
reasoning_tier: high
context_scope: widget_curated_geometry_defaults
implementation_surfaces:
  - Plans/Widget_System.md
  - Plans/usage-feature.md
  - Plans/storage-plan.md
node_compile_hint:
  mode: widget_curated_geometry_defaults
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Concepts/pm7-tools/base/PM7-base.html (current recovered PMConcept7 source base; source-lineage-only)"
  - "Concepts/pm7-tools/build_pm7.py (current assertion-guarded T33-T43 pipeline)"
  - "Concepts/PMConcept7.html (protected generated output; verification input only; never hand-edit)"
preserved_exact_tokens:
  - curated size
  - auto-grow
  - curated cap
  - partial rows
  - provider-heavy
negative_constraints:
  - Do not accept unsupported free-form geometry as settled canonical widget state.
  - Do not let a stale saved layout replace corrected defaults without explicit migration and validation.
owner_hints:
  - Plans/Widget_System.md
  - Plans/usage-feature.md
  - Plans/storage-plan.md
```

### WS-019 - Transactional Grid Resize And Reorder

```yaml
plan_unit_id: WS-019
unit_type: interaction_contract
status: accepted
owner_doc: Plans/Widget_System.md
canonical_text: >-
  Usage and Dashboard widgets share one transactional direct-manipulation contract. Pickup snapshots the
  stable widget identity, committed order, and measured painted physical column/row footprint. Usage pointer resize
  installs a real in-flow placeholder initialized from that footprint, lifts a fixed-position preview, and then
  advances both the placeholder and lifted card to each last-painted supported footprint while visibly and
  deterministically repacking only obstructed peers. Unobstructed peers retain their rectangles during the held
  preview, and every peer remains mounted, painted, and free of entrance-animation replay. Usage board gravity
  (2026-10-09, Plans/Decision_Log.md#DL-176) applies once the gesture settles, never during the held preview, and
  inside the gesture's own single command rather than as a later step: the settled layout is the last-painted
  layout with gravity applied to it, in which each displaced peer takes the highest free place above where the
  resolver put it (preferring a place that overlaps the region the active card left, then the highest free place,
  then the column nearest its own) and every card except the active one floats straight up into any hole above
  it, in reading order, so the order is kept. The active card keeps the place and size the preview showed. Only
  cards shown at the current disclosure level float; cards of deeper levels and hidden cards keep their places
  unless a floated card lands on them, and then they step down. A Usage move lifts the card, which follows the
  pointer one to one, and shows a landing placeholder in the exact target slot while obstructed peers slide live;
  a Usage resize from any edge or corner shows a live outline of the snapped target size labelled with its preset
  name, or custom size, and its width x height in tracks and rows, while obstructed peers reflow live; on release
  the card morphs into place without overshoot and the cards gravity moves then float up into their settled
  places; every cancel path glides the card and its peers back to the snapshot. Under reduced
  motion each of these moves is instant. Dashboard resize retains its measured-footprint
  placeholder and frozen peers. Reorder starts only from the dedicated widget handle, uses a fixed ghost plus a
  measured-footprint in-flow placeholder, and derives stable two-dimensional slot candidates from the frozen
  grid plus the stable before/after widget identities in the committed-order snapshot. Candidate coverage includes
  empty same-footprint cavities and lower rows rather than only positions adjacent in DOM order. Pointer targeting
  aligns the ghost's anchored top-left with a candidate origin, applies a real geometric hysteresis margin, and
  never lets overlapping multi-span candidate rectangles redirect the visible placeholder. Pointer and keyboard
  reorder use the same candidate model and visibly displace affected peers with interruptible motion while keeping
  those peer DOM nodes mounted; preview never replays their entrance animation or drops board/card opacity, and
  only one accepted settlement reconciles DOM order. A horizontal-only resize advances
  strictly to a supported curated size in the requested horizontal direction while minimizing companion-axis drift;
  the same rule applies at the far right, far left, and middle, including when peers must repack. A deliberate
  edge-limited drag may quantize one step, and an in-viewport pointer-up commits the last painted supported size
  even after same-direction overshoot beyond that size. Preview state is local and transient: no command, receipt,
  persisted event, layout write, or board
  settlement occurs before release, and no measured preview footprint becomes durable layout state. A changed
  pointer release commits the last painted pointer resize or reorder intent without a new pointer-up hit test or
  release-time retarget; a changed keyboard reorder drop commits its selected insertion intent; and each supported
  keyboard-resize activation settles its directional size intent atomically. Each changed terminal path dispatches
  exactly one existing `cmd.widget.resize` or
  `cmd.widget.move`, persists the settled state once, settles the board once, and emits no persisted domain event,
  including no `workspace.layout_changed`. On Usage that one command's settled result is the whole settled layout
  of the room: the last-painted layout plus gravity, that is the active card plus every peer the resolver or
  gravity moved, written once under its one receipt, with no per-peer command and no second gravity commit. Every Usage commit path applies the same
  gravity inside its own single command: pointer and keyboard move and resize, a size-picker preset (WS-017), and
  hiding or showing a card through `cmd.widget.remove` or `cmd.widget.add`. Tidy, chosen from a card's menu or the
  Customize panel, is the explicit full repack of the current Usage room: the cards shown at the current disclosure
  level take their first-fit places upward in reading order (their columns may change), then the cards of other
  levels and hidden cards take places below them. Tidy commits as one settled layout transaction through exactly
  one existing `cmd.widget.move` that carries the optional typed `arrange` field `{ mode: "tidy", detail }`
  (Plans/UI_Command_Catalog.md section 2.3), where `detail` is the disclosure level whose shown cards go first. Its
  `instance_id` names the card whose menu chose Tidy, or the room's first card in reading order when Tidy is chosen
  from Customize, and its `col` and `row` repeat that card's committed place, so the request names the room and the
  level and dictates no layout: the owner computes the repack itself, deterministically, from that room's committed
  layout, and rejects as stale a request whose place differs from the committed one. A `cmd.widget.move` without
  `arrange` is an ordinary move. The settled result carries every card Tidy moved, under one receipt, one settled
  write, and one board settlement; there is no per-card move command and no Tidy command. A Tidy that would move
  nothing, which the surface knows by computing the same deterministic repack, dispatches nothing, and an owner
  rejection leaves the pre-Tidy layout in place. Gravity and Tidy are Usage board behaviour; Dashboard keeps its
  own settlement. Escape, pointer cancellation, `lostpointercapture`, blur, an invalid
  target, a pre-dispatch validation failure, or an unchanged release/drop restores the committed state and
  dispatches nothing. Once a changed action has dispatched, owner rejection or persistence-adapter failure retains
  exactly that one attempted command and its rejected/failed receipt, restores the authoritative visual state, and
  emits no settled event or successful owner-store write.
  Keyboard reorder uses explicit pickup, move, drop, Escape, and blur paths, with truthful `aria-grabbed` state,
  a visible picked-card outline, the shared two-dimensional candidate model, peer displacement, commit, rollback,
  and cleanup; it does not need to clone the pointer ghost or placeholder. Every path releases
  pointer capture and removes listeners, transient classes, ghost, placeholder, lifted state, preview styles,
  temporary board extent, and pending animation work without moving the document scroll position or leaving a
  blank scroll tail. Only one pointer or keyboard widget transaction may own the board at a time; every competing
  resize, pointer reorder, or keyboard pickup is rejected before focus, capture, class, or DOM mutation and cannot
  clear the first owner's active-operation state. A Dashboard widget remains owned by
  its Home Dashboard wrapper/host even when that wrapper participates presentation-only in an outer grid; the
  outer presentation grid never becomes the widget mutation owner.
gui_related: true
gui_classification_reason: This unit defines the complete pointer and keyboard lifecycle for visible widget resize and reorder.
depends_on: [WS-004, WS-005, WS-009, WS-017, WS-018]
unblocks: [WS-020]
acceptance_criteria:
  - Pickup records the stable widget identity, committed order, and measured painted physical column/row footprint; Usage pointer resize initializes a real placeholder from that footprint, then paints each supported target footprint and visibly repacks only obstructed peers while the peer nodes, unobstructed peer rectangles, DOM order, opacity, entrance-animation state, and document scroll position remain stable. Usage keyboard resize remains one atomic changed-only settlement per supported directional key intent rather than a held live-preview mode. Dashboard resize retains its measured placeholder and frozen peers.
  - Command, receipt, event, and persistence spies remain empty until a changed pointer release, keyboard reorder drop, or atomic keyboard-resize activation.
  - Reorder begins only from the dedicated handle, uses a fixed ghost and measured-footprint in-flow placeholder for pointer operation, resolves stable two-dimensional candidates including empty same-footprint cavities and lower rows, binds pointer choice to the ghost's anchored top-left with geometric hysteresis, resolves before/after identities against the committed-order snapshot, and visibly displaces affected peers during pointer and keyboard preview while keeping their DOM nodes mounted, their opacity nonzero, and their entrance animations stopped; Usage pointer resize uses the same target-first deterministic slot projection so obstructed peers move during the held preview and the accepted settlement matches the last painted topology with Usage board gravity applied at settle, while Usage keyboard resize remains atomic and Dashboard resize peers remain frozen. Horizontal-only pointer and keyboard input advances strictly along the requested supported curated axis with minimum companion-axis drift at far-right, far-left, and middle positions, an edge-constrained deliberate drag can express one step, and an in-viewport pointer release after same-direction overshoot commits the last painted supported intent.
  - A changed pointer release commits the last painted pointer intent without pointer-up re-hit-testing or retargeting, a changed keyboard reorder drop commits its selected insertion intent, and each supported keyboard-resize activation settles atomically; each changed terminal path emits exactly one existing `cmd.widget.resize` or `cmd.widget.move`, writes settled state once, triggers one board settlement, and emits no persisted domain event, including no `workspace.layout_changed`.
  - Escape, pointercancel, `lostpointercapture`, blur, invalid target, pre-dispatch validation failure, and unchanged release/drop restore the original state, emit no command, receipt, event, or persistence write, release capture, and remove every listener, class, ghost, placeholder, lifted state, preview style, and pending animation frame; an owner-rejected command or post-dispatch persistence-adapter failure instead retains exactly one attempted command and one rejected/failed receipt, restores authoritative geometry/order, emits no settled event or successful owner-store write, and performs the same complete transient cleanup.
  - Successful pointer and keyboard reorder restore the board's pre-transaction inline minimum-height value and leave scroll extent bounded to settled card geometry so repeated moves do not accumulate a blank tail; while one pointer or keyboard resize/reorder owns the board, every competing pointer, touch, pen, or keyboard acquisition is rejected before focus, capture, transient DOM, or class mutation, and cancelling the owner clears exactly that owner without leaving an operation flag.
  - Keyboard reorder supports pickup, directional move, drop, Escape, and blur; `aria-grabbed` is true only while pickup is active and returns to false after drop or cancellation, the picked card has a visible focus/outline state, and its two-dimensional candidate choice, live peer displacement, changed-only commit, rollback, and cleanup match pointer reorder without requiring a cloned pointer ghost or placeholder.
  - The contract applies to Usage widgets and widgets owned by the Home Dashboard wrapper/host, even when that wrapper participates presentation-only in an outer grid; the outer grid does not own widget mutations, and moving or resizing the Dashboard surface itself remains Home workspace authority.
  - "Usage board gravity: after any changed Usage move, resize, preset, hide, or show, no shown card other than the one the action placed has an empty hole directly above it that it could float into, reading order is unchanged among the cards gravity moved, cards of deeper disclosure levels and hidden cards move only to step down from a floated card, no unobstructed peer moves during the held preview, the active card settles where the preview showed it, the committed layout equals the last-painted layout with gravity applied, and exactly one command and one receipt carry the whole settled room."
  - "Usage move and resize previews: a move lifts the card and follows the pointer one to one with a landing placeholder in the exact target slot; a resize from every edge and corner shows a live snapped outline labelled with the preset name or custom size and its width x height; only obstructed peers slide or reflow live; release morphs into place without overshoot and the cards gravity moves then float up; every cancel path glides card and peers back to the snapshot; reduced motion makes each of these instant; and none of it dispatches or writes before release."
  - "Tidy repacks the current Usage room first-fit upward in reading order, shown cards first, and commits through exactly one existing cmd.widget.move carrying arrange { mode: tidy, detail }, whose instance_id is the card Tidy was chosen from (or the room's first card from Customize) at its committed place, whose repack the owner computes from the committed layout, and whose settled result carries every moved card, with one receipt, one settled write, and one board settlement; a Tidy that moves nothing dispatches nothing, and command, receipt, and persistence spies show no per-card move and no other command."
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - tests/fixtures/usage_gui/presentation/interaction_transaction_matrix.json (static contract fixture only)
  - Plans/shared_runtime_command_contract_fixtures.json (static command/receipt/event-count fixture only)
  - "evidence_ref: Plans/.audits/audit-20260829-001-pmconcept7-widget-followup/browser/runs/t41-build8-focused-regression-rerun-2/report.json (SHA-256 4de0320f73010440560c5fed357df8b67f02188b6ca0a07c1ff3875de31485c0; historical predecessor evidence only; superseded for Usage resize-preview timing; readiness_claim=false)"
  - "verification_pending: fresh exact-T43 live occupied-neighbor preview, settlement-parity, cancellation, failure, and film receipts under Plans/.audits/audit-20260830-001-pmconcept7-live-resize-preview/; readiness_claim=false"
risk_class: widget_preview_leaks_or_multi_commit
reasoning_tier: high
context_scope: widget_transactional_resize_reorder
implementation_surfaces:
  - Plans/Widget_System.md
  - Plans/usage-feature.md
  - Plans/UI_Command_Catalog.md
  - Plans/UI_Wiring_Rules.md
node_compile_hint:
  mode: widget_transactional_resize_reorder
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Concepts/pm7-tools/base/PM7-base.html (current recovered PMConcept7 source base; source-lineage-only)"
  - "Concepts/pm7-tools/build_pm7.py (current assertion-guarded T33-T43 pipeline)"
  - "Concepts/pm7-tools/widget_live_resize_preview_source.py (authored T43 Usage-only live resize-preview transform)"
  - "Concepts/PMConcept7.html (protected generated output; verification input only; never hand-edit)"
  - "Concepts/usage-redesign/src/js/40-board.js (Usage redesign board: resolver, gravity, Tidy, move and resize previews; source-lineage-only)"
  - Plans/Decision_Log.md#DL-176
preserved_exact_tokens:
  - cmd.widget.resize
  - cmd.widget.move
  - placeholder
  - fixed-position
  - pointercancel
  - lostpointercapture
  - last painted intent
  - persisted=false
  - aria-grabbed
  - pickup
  - drop
  - Usage board gravity
  - Tidy
  - arrange
negative_constraints:
  - Do not dispatch a command, receipt, persisted event, or storage write for pointer-preview frames.
  - Do not mint PM7-only resize or move commands.
  - Do not commit Usage board gravity or Tidy as per-card commands, as a second commit after the gesture's own, or through a new command.
  - Do not let gravity change the reading order of the cards it moves or float a card of a deeper disclosure level or a hidden card into view.
  - Do not move an unobstructed peer during a held Usage preview, and do not let a Tidy request carry or dictate the repacked layout; the owner computes it.
  - Do not persist or treat live Usage preview repack as settlement, reconcile DOM order, or remount peers during preview; do not generalize Usage live resize repack to Dashboard resize.
  - Do not remount reorder peers, replay their entrance animation, or black out the board during preview.
  - Do not retain preview-only board minimum height after either commit or rollback, or allow simultaneous widget-operation controllers.
  - Do not derive reorder placement from stale nominal spans, persist a measured preview footprint, or re-hit-test and retarget at pointer-up.
  - Do not let an outer presentation grid replace the Home Dashboard wrapper as widget mutation owner.
  - Do not claim the protected generated artifact passes this interaction contract without fresh browser execution and raw receipts.
owner_hints:
  - Plans/Widget_System.md
  - Plans/UI_Command_Catalog.md
  - Plans/UI_Wiring_Rules.md
```

`UsageWidgetLayoutRecord` is a closed public record. Its required serialized
field set is exactly `layout_schema_version`, `default_set_version`, `host_id`,
`room_id`, `widget_id`, `visible`, `order_index`, `slot_id`, `geometry_id`,
`semantic_tier_id`, `preset_id`, `configuration_refs`, and
`committed_revision`. `layout_schema_version` is an integer greater than or
equal to 1; `default_set_version` is a non-empty string; `host_id` is the exact
string `usage`; `room_id`, `widget_id`, `geometry_id`, and
`semantic_tier_id` are non-empty stable strings; `visible` is boolean;
`order_index` is a non-negative integer; `slot_id` is a non-empty stable string
or null; `preset_id` is a non-empty supported-preset string or null;
`configuration_refs` is a sorted unique array of non-empty non-secret strings;
and `committed_revision` is a non-negative integer. No field other than
`slot_id` and `preset_id` is nullable. The record is versioned before this
closed field set changes.

### WS-020 - Widget Layout Namespace And Semantic Size Identity

```yaml
plan_unit_id: WS-020
unit_type: data_contract
status: accepted
owner_doc: Plans/Widget_System.md
canonical_text: >-
  Widget layout has one schema family with separate canonical namespaces per host. Usage writes
  `widget_layout:v1:usage`; Dashboard writes `widget_layout:v1:dashboard`; Home shell surfaces remain under
  `home_workspace_layout.v1`. The named public Usage contract is `UsageWidgetLayoutRecord`. Its required closed
  fields are `layout_schema_version`, `default_set_version`, `host_id`, `room_id`, `widget_id`, `visible`,
  `order_index`, `slot_id`, `geometry_id`, `semantic_tier_id`, `preset_id`, `configuration_refs`, and
  `committed_revision`, with the exact types and nullability defined immediately above this unit. Each
  `configuration_ref` resolves to an existing stable, non-secret widget-configuration identity governed by WS-004
  and UF-060; filter payloads remain in that configuration record and are not copied into the layout record. Preview
  rectangles, pointers or pointer coordinates, ghosts,
  placeholders, animation state, and drafts or per-frame drafts are forbidden. A widget operation cannot write
  the Home surface record, and a Home surface operation cannot write a widget-layout record.
  `preset_id` names the widget kind's size preset (WS-017) whenever the settled geometry equals one of that kind's
  presets, whether the size came from the size picker or from a pointer or keyboard resize, and is null for any size
  in between; a "custom size" label is presentation only and is never stored as a `preset_id`. A `preset_id` is the
  preset's stable id in the kind's preset table (`compact`, `standard`, `expanded`, `wide`, `full`, `strip`,
  `panel`, `ladder`, or `band`), never its display name. Choosing a preset in
  the size picker dispatches one `cmd.widget.resize` carrying that preset's geometry and `preset_id`, and the settled
  record stores the `preset_id` together with the `semantic_tier_id` of the content tier the size shows. A chosen
  preset survives reload and look change: the card restores with its stored `preset_id`, and when a look change moves
  the board's pitch or a fit preset's measured height, the card keeps that `preset_id` and takes the preset's newly
  resolved geometry instead of becoming a custom size; a keyboard resize that lands on a preset stores it the same
  way. On restore, a saved
  `preset_id` that the kind's current preset table no longer lists maps to the current preset with the same geometry,
  or else to null with the geometry snapped by WS-018; a stored `preset_id` never brings back a retired preset. When
  the default boards or a kind's preset table change, `default_set_version` changes, and a saved Usage layout from an
  older set keeps its visibility and configuration and takes the new default geometry once.
gui_related: true
gui_classification_reason: The record determines restored widget placement, semantic size, and cross-surface ownership.
depends_on: [UF-060, WS-004, WS-009, WS-018, WS-019]
unblocks: []
acceptance_criteria:
  - Usage and Dashboard restore from their own namespaces while Home surfaces restore only from home_workspace_layout.v1.
  - "UsageWidgetLayoutRecord is the named public contract for a settled Usage widget layout and has exactly the required fields layout_schema_version, default_set_version, host_id, room_id, widget_id, visible, order_index, slot_id, geometry_id, semantic_tier_id, preset_id, configuration_refs, and committed_revision, including semantic size or preset identity in addition to supported geometry so adaptive content restores deterministically; every configuration_ref resolves to an existing stable, non-secret widget-configuration identity governed by WS-004 and UF-060, and filter payloads remain in the configuration record rather than becoming new UsageWidgetLayoutRecord fields."
  - "No preview rectangle, pointer or pointer coordinate, ghost, placeholder, animation state, draft, or per-frame draft appears in UsageWidgetLayoutRecord."
  - A widget mutation never writes Home surface placement and a Home surface mutation never writes Usage or Dashboard widget placement.
  - Migration rejects, quarantines, or deterministically maps unsupported old geometry before it can override corrected current defaults.
  - "A settled size equal to one of the kind's presets stores that preset_id whatever path produced it, any other size stores null, a size-picker choice commits one cmd.widget.resize with the preset's geometry, a retired saved preset_id restores to the same-geometry preset or to null with snapped geometry, and a default_set_version change resets saved Usage geometry once while keeping visibility and configuration."
  - "A stored preset_id is the preset's table id, never its display name; a chosen preset, including one a keyboard resize landed on, keeps its preset_id after a reload and after a look change that moves the pitch or a fit height, re-resolving to that preset's current geometry rather than to a custom size."
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - tests/fixtures/usage_gui/presentation/persistence_migration_matrix.json (static contract fixture only)
  - tests/fixtures/pm7_shared/home_workspace_transaction.json (static owner-boundary fixture only)
  - "evidence_ref: Plans/.audits/audit-20260829-001-pmconcept7-widget-followup/browser/runs/t41-build8-focused-regression-rerun-2/report.json (SHA-256 4de0320f73010440560c5fed357df8b67f02188b6ca0a07c1ff3875de31485c0; exact Build8 concept/browser slice; readiness_claim=false)"
  - "evidence_ref: Plans/.audits/audit-20260829-001-pmconcept7-widget-followup/browser/runs/t41-build8-checked-in-width-matrix/report.json (SHA-256 54895af4fb7c7245bbc8c7d5772cd46dace251bfdfa023513fef490aa37e4dd0; exact checked-in Build8 concept/browser slice; readiness_claim=false)"
risk_class: widget_layout_namespace_or_semantic_size_drift
reasoning_tier: high
context_scope: widget_layout_namespace_semantic_size
implementation_surfaces:
  - Plans/Widget_System.md
  - Plans/storage-plan.md
  - Plans/home_workspace_layout.schema.json
node_compile_hint:
  mode: widget_layout_namespace_semantic_size
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Concepts/pm7-tools/base/PM7-base.html (current recovered PMConcept7 source base; source-lineage-only)"
  - "Concepts/pm7-tools/build_pm7.py (current assertion-guarded T33-T43 pipeline)"
  - "Concepts/PMConcept7.html (protected generated output; verification input only; never hand-edit)"
  - "Concepts/usage-redesign/src/js/42-cards.js and 40-board.js (preset ids, the chosen preset kept over reload; branch concept/usage-pm7-c-presets-20261009; source-lineage-only)"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/usage-mockups-20261001/lane-reports-20261010/c-presets-REPORT.md, SHA-256 505de34e60acd8d9efce08e5ec392f58c574db75cbadf5846a34c42424567a3e (fix cycles 1 and 2: preset names kept over reload, keyboard resize, and look change)"
  - Plans/Decision_Log.md#DL-176
preserved_exact_tokens:
  - widget_layout:v1:usage
  - widget_layout:v1:dashboard
  - home_workspace_layout.v1
  - UsageWidgetLayoutRecord
  - committed revision
  - semantic tier
  - preset
negative_constraints:
  - Do not create a second Widget layout store or a PM7-only persistence namespace.
  - Do not serialize transient interaction state.
  - Do not admit preview rectangles, pointers, ghosts, placeholders, animation, or drafts into UsageWidgetLayoutRecord.
  - Do not store a presentation label such as custom, or a preset's display name, as a preset_id, or restore a preset the kind no longer offers.
owner_hints:
  - Plans/Widget_System.md
  - Plans/storage-plan.md
```
