# Shard 014: PMConcept7 Recovery Canonical Integration Addendum - 2026-08-27

Source: `Plans/Widget_System.md`

Source lines: L1204-L1547

Source SHA256: `db711baae6304f4c31237a191c2082b2fa1927f0335f365800b690e34697555d`

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
  exposes only supported curated shapes equivalent to Strip, Compact, Standard, Expanded, and Maximum or
  tall variants where that kind can use them. Increasing a widget's supported size must increase useful
  information density: wide instruments and summaries use balanced internal columns; lists, accounts,
  providers, ledgers, and event cards reveal more complete rows; charts spend the extra area on plot and
  legible facts; context and authority cards reveal additional source, route, confidence, history, forecast,
  reset, or settlement facts. A compact tier mounts complete content groups only, so the next tier never
  peeks, clips, or appears as a partial row, bar, label, legend, or footer.
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
preserved_exact_tokens:
  - Strip
  - Compact
  - Standard
  - Expanded
  - Maximum
  - complete-or-hidden
negative_constraints:
  - Do not treat a larger rectangle with unchanged mounted content as a larger semantic size.
  - Do not use routine internal widget scrolling to conceal content that a curated size claims to contain.
  - Do not reveal fragments of a lower content tier.
  - Do not treat static source inspection or an in-progress audit as executable acceptance evidence.
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
  deterministically repacking only obstructed peers. Unobstructed peers retain their rectangles, and every peer
  remains mounted, painted, and free of entrance-animation replay. Dashboard resize retains its measured-footprint
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
  including no `workspace.layout_changed`. Escape, pointer cancellation, `lostpointercapture`, blur, an invalid
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
  - Reorder begins only from the dedicated handle, uses a fixed ghost and measured-footprint in-flow placeholder for pointer operation, resolves stable two-dimensional candidates including empty same-footprint cavities and lower rows, binds pointer choice to the ghost's anchored top-left with geometric hysteresis, resolves before/after identities against the committed-order snapshot, and visibly displaces affected peers during pointer and keyboard preview while keeping their DOM nodes mounted, their opacity nonzero, and their entrance animations stopped; Usage pointer resize uses the same target-first deterministic slot projection so obstructed peers move during the held preview and the accepted settlement matches the last painted topology, while Usage keyboard resize remains atomic and Dashboard resize peers remain frozen. Horizontal-only pointer and keyboard input advances strictly along the requested supported curated axis with minimum companion-axis drift at far-right, far-left, and middle positions, an edge-constrained deliberate drag can express one step, and an in-viewport pointer release after same-direction overshoot commits the last painted supported intent.
  - A changed pointer release commits the last painted pointer intent without pointer-up re-hit-testing or retargeting, a changed keyboard reorder drop commits its selected insertion intent, and each supported keyboard-resize activation settles atomically; each changed terminal path emits exactly one existing `cmd.widget.resize` or `cmd.widget.move`, writes settled state once, triggers one board settlement, and emits no persisted domain event, including no `workspace.layout_changed`.
  - Escape, pointercancel, `lostpointercapture`, blur, invalid target, pre-dispatch validation failure, and unchanged release/drop restore the original state, emit no command, receipt, event, or persistence write, release capture, and remove every listener, class, ghost, placeholder, lifted state, preview style, and pending animation frame; an owner-rejected command or post-dispatch persistence-adapter failure instead retains exactly one attempted command and one rejected/failed receipt, restores authoritative geometry/order, emits no settled event or successful owner-store write, and performs the same complete transient cleanup.
  - Successful pointer and keyboard reorder restore the board's pre-transaction inline minimum-height value and leave scroll extent bounded to settled card geometry so repeated moves do not accumulate a blank tail; while one pointer or keyboard resize/reorder owns the board, every competing pointer, touch, pen, or keyboard acquisition is rejected before focus, capture, transient DOM, or class mutation, and cancelling the owner clears exactly that owner without leaving an operation flag.
  - Keyboard reorder supports pickup, directional move, drop, Escape, and blur; `aria-grabbed` is true only while pickup is active and returns to false after drop or cancellation, the picked card has a visible focus/outline state, and its two-dimensional candidate choice, live peer displacement, changed-only commit, rollback, and cleanup match pointer reorder without requiring a cloned pointer ghost or placeholder.
  - The contract applies to Usage widgets and widgets owned by the Home Dashboard wrapper/host, even when that wrapper participates presentation-only in an outer grid; the outer grid does not own widget mutations, and moving or resizing the Dashboard surface itself remains Home workspace authority.
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
negative_constraints:
  - Do not dispatch a command, receipt, persisted event, or storage write for pointer-preview frames.
  - Do not mint PM7-only resize or move commands.
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
owner_hints:
  - Plans/Widget_System.md
  - Plans/storage-plan.md
```
