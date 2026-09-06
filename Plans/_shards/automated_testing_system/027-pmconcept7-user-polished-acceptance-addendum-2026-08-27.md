# Shard 027: PMConcept7 User-Polished Acceptance Addendum - 2026-08-27

Source: `Plans/Automated_Testing_System.md`

Source lines: L3376-L4002

Source SHA256: `92a37e73a67b4a820fc5be5ef5b1033682608005a6cf09da37b46ab2455ba2e7`

---

## PMConcept7 User-Polished Acceptance Addendum - 2026-08-27

The following PlanUnits own the canonical fixture and audit requirements for the recovered PMConcept7. They do not create implementation work, and they do not substitute fixture presence or machine checks for actual visual and motion review.

Final successor evidence is report-owned. When `audit_report.json` records `status = pass_with_named_residuals`
and `verdict = successor_scope_verified_with_named_residuals`, the `evidence_ref` entries below prove only their
named exact-hash PMConcept7 concept/demo slices. They grant no native Slint, production-runtime, PNC-019,
certification, completeness, or product-readiness credit; every blocked, failed, uncaptured, or residual lane
retains that classification.

Build8 browser receipts do not establish an all-visuals pass. The protected Settings actual-pixel review retains
`IVR-T41-B8-XPAGE-001`: the rightmost Settings card column is visibly cropped at 1180, 980, 860, and 680 in all
eight themes even though the cross-page runner reports root-level containment. The P2 narrow page-overflow menu
keyboard-focus and Arrow-key-navigation defect also remains open, and PNC-019 remains outside this evidence.

### ATS-036 - Canonical Usage GUI Fixture Suite

```yaml
plan_unit_id: ATS-036
unit_type: acceptance_contract
status: accepted
owner_doc: Plans/Automated_Testing_System.md
canonical_text: >-
  The canonical Usage GUI fixture suite is rooted at tests/fixtures/usage_gui. Its golden matrix preserves the
  thirteen UF-088 fixture identities, and companion cases plus room/disclosure, curated-size, content-tier,
  theme/width, persistence-migration, and interaction-transaction matrices statically represent the recovered
  Usage contract without treating concept demo reports as test authority. Fixtures preserve owner PlanUnits and
  source lineage and fail closed for unknown, hidden, disabled, unsupported, partial, redacted, and missing data.
  Fixture presence and `must`/`must_not` lists grant static representation only; runtime, visual, motion, and
  migration behavior require fresh browser execution, raw receipts, and independent review.
gui_related: true
gui_classification_reason: This unit owns the canonical fixtures for visible Usage behavior across PM surfaces.
depends_on: [UF-088, F3-514, WS-017, WS-018, WS-019, WS-020]
unblocks: [ATS-038]
acceptance_criteria:
  - "The golden matrix contains exactly GUI-USG-001 through GUI-USG-008, GUI-CBP-001, GUI-CBP-002, GUI-ROUTE-001, GUI-RAW-001, and GUI-RAP-001 with no duplicate or unexpected fixture identity."
  - "Each golden row has surfaces, source_lineage, must, and must_not assertions, and each identity has a matching standalone case fixture."
  - "Companion matrices cover all thirteen rooms, At a glance/Detailed/Diagnostics, curated semantic sizes, complete-or-hidden tiers, measured physical content/placeholder footprints, stable identity-based insertion intent, Usage live occupied-neighbor pointer-resize preview with accepted-settlement topology parity, and the recovered width families; chart fixture expectations preserve the full ordered accessible series while checking exactly one visible in-plot label for every painted vertical bar, including zero bars, measured direct or vertical-lane placement keeps each label horizontally associated with its own bar, inside the plot, and pairwise non-overlapping without suppression, declared-unit formatting includes exactly two currency decimals for attempt-charge integer cents, and title/Latest/distinct-peak composition remains complete."
  - "Fresh, migrated, invalid-reference, and prototype-key fixtures encode expected current defaults, settled restore, and preview-state exclusion without claiming that those behaviors executed."
  - "Fixture expectations forbid unknown, hidden, disabled, unsupported, partial, missing, and redacted values from being represented as zero, success, settled, or authoritative; live rendering remains browser-audit work."
  - "python3 scripts/pm-plans-verify.py validate-usage-gui-fixtures and python3 scripts/pm-validate-pm7-gui-fixtures.py validate both pass for static fixture representation; runtime, visual, motion, and migration acceptance still requires fresh browser execution, raw receipts, and independent review."
validation_surfaces:
  - "python3 scripts/pm-plans-verify.py validate-usage-gui-fixtures"
  - "python3 scripts/pm-validate-pm7-gui-fixtures.py validate"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: missing_or_noncanonical_usage_gui_fixture_suite
reasoning_tier: high
context_scope: pm7_usage_fixture_suite
implementation_surfaces: [Plans/Automated_Testing_System.md, tests/fixtures/usage_gui]
node_compile_hint: {mode: usage_gui_fixture_contract_only, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - Plans/usage-feature.md#uf-088---gui-usage-acceptance-fixture-matrix
  - Concepts/pm7-tools/base/PM7-base.html (current pinned PM7 input; source-lineage-only)
  - Concepts/pm7-tools/build_pm7.py#T33-T43 (source-owned transforms)
  - Concepts/pm7-tools/widget_live_resize_preview_source.py (authored T43 Usage-only live resize-preview transform)
  - Plans/.audits/audit-20260829-001-pmconcept7-widget-followup/audit_report.json (current repo-local follow-up audit status; verdict remains report-owned)
preserved_exact_tokens: [GUI-USG-001, GUI-USG-008, GUI-CBP-001, GUI-CBP-002, GUI-ROUTE-001, GUI-RAW-001, GUI-RAP-001]
negative_constraints:
  - "Do not use Concepts/usage-concepts reports as the canonical fixture root."
  - "Do not let missing or unknown data satisfy a zero-value assertion."
owner_hints: [Plans/Automated_Testing_System.md, Plans/usage-feature.md]
```

### ATS-037 - Shared PM7 Surface Interaction And Event Fixtures

```yaml
plan_unit_id: ATS-037
unit_type: acceptance_contract
status: accepted
owner_doc: Plans/Automated_Testing_System.md
canonical_text: >-
  The shared PM7 fixture suite is rooted at tests/fixtures/pm7_shared and contains the stable surface inventory,
  Assistant/context continuity, Home transaction, status-bar, theme/surface, motion-frame, and
  workspace-layout-event fixture families. The suite statically records expected single-node Assistant re-seating;
  thread, transcript, draft, attachment, activity, detail-drawer, and focus continuity; failed/stale re-seat rollback;
  open-detail-drawer compaction preservation; settled-only Home and widget operations; no-preview effects; status
  layout; all-theme inventory; frame health; Dashboard wrapper/host ownership; pointer and keyboard widget
  manipulation parity; stable identity-based insertion intent; Usage pointer-only live occupied-neighbor resize-preview
  displacement, Dashboard frozen resize peers, and live reorder-peer displacement; last-painted-intent commit
  without release retarget; cancellation/no-op cleanup; and the exact
  workspace.layout_changed payload contract. It is a canonical fixture root; audit-harness and
  concept-runner artifacts remain additional evidence, not replacement owners. Fixture lists and
  `must`/`must_not` assertions are not runtime, visual, motion, or migration proof; those require fresh browser
  execution, raw receipts, and independent review.
gui_related: true
gui_classification_reason: This unit owns cross-page visible and interaction fixtures shared by PMConcept7 surfaces.
depends_on: [F3-513, F3-515, F3-516, F3-517]
unblocks: [ATS-038, ATS-039, ATS-040]
acceptance_criteria:
  - "The shared fixture root contains exactly the seven named fixture families and each names owner PlanUnits, surfaces, must assertions, and must-not assertions."
  - "Assistant/context fixtures statically encode one node/store identity, Home/global re-seating, active thread and transcript, draft, attachments, activity, detail-drawer identity/tab/scroll, focus continuity, failed/stale re-seat rollback, context metrics, Compact Now, More Details, and zero context.compaction.* events; the open-detail-drawer Compact Now fixture requires one existing cmd.chat.compact_context result and one receipt, zero domain events, a coherent ring/detail revision update, and preservation of drawer identity, selected tab, scroll position, and focus."
  - "Home transaction fixtures statically encode Dashboard wrapper/host ownership rather than outer-grid mutation ownership, preview-spy emptiness, stable before/after insertion intent, measured placeholder footprint, pointer/keyboard move parity, frozen resize peers, live reorder displacement, last-painted-intent changed-only one-command commit without pointer-up retarget, Escape/pointercancel/lostpointercapture/blur/invalid/no-change rollback, settled persistence, and cleanup."
  - "Usage interaction and motion fixtures statically encode a real target footprint, live deterministic displacement of only obstructed peers during held pointer resize, stable peer node/paint/DOM-order/entrance state, preview-spy emptiness, exact preview-to-accepted-settlement topology parity, and exact rollback after cancellation, rejection, or adapter failure; Dashboard resize remains frozen-peer."
  - "Status and theme fixtures statically encode full-width non-overlapping status with no bell plus stable functional inventory in all eight themes and supported desktop widths."
  - "Motion fixtures statically enumerate blank, black, white-until-hover, clipped, torn, or uniform transition frames and missing final settlement as conditions that fresh browser execution and independent review must reject."
  - "Workspace event fixtures validate against the current workspace_layout_changed schema and reject preview-bearing, non-persisted, or incomplete events; none of the seven fixture files or their must/must_not lists proves runtime, visual, motion, or migration behavior without fresh browser execution, raw receipts, and independent review."
validation_surfaces:
  - "python3 scripts/pm-validate-pm7-gui-fixtures.py validate"
  - "python3 scripts/pm-plans-verify.py validate-pm7-gui-fixtures"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: missing_shared_pm7_fixture_authority
reasoning_tier: high
context_scope: pm7_shared_fixture_suite
implementation_surfaces: [Plans/Automated_Testing_System.md, tests/fixtures/pm7_shared, Plans/event_payloads/workspace_layout_changed.schema.json]
node_compile_hint: {mode: shared_pm7_fixture_contract_only, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - Plans/FinalGUISpec.md#f3-518---pmconcept7-fixture-evidence-and-bootstrap-scope-boundary
  - Concepts/pm7-tools/verify/home_workspace_matrix.mjs
  - Concepts/pm7-tools/build_pm7.py#T33-T43 (source-owned transforms)
  - Concepts/pm7-tools/widget_live_resize_preview_source.py (authored T43 Usage-only live resize-preview transform)
  - Plans/.audits/audit-20260829-001-pmconcept7-widget-followup/audit_report.json (current repo-local follow-up audit status; verdict remains report-owned)
preserved_exact_tokens: [surface_inventory, assistant_context_continuity, home_workspace_transaction, status_bar_contract, theme_surface_matrix, motion_frame_matrix, workspace_layout_event_fixtures]
negative_constraints:
  - "Do not treat audit evidence under Plans/.audits as the canonical root test suite."
  - "Do not add a second Assistant, layout store, command family, or event family for fixture convenience."
owner_hints: [Plans/Automated_Testing_System.md, Plans/FinalGUISpec.md]
```

### ATS-038 - Exhaustive PM7 Static Visual Matrix

```yaml
plan_unit_id: ATS-038
unit_type: validation_criterion
status: accepted
owner_doc: Plans/Automated_Testing_System.md
canonical_text: >-
  Final PMConcept7 static certification renders every primary page in every built-in theme, every Usage room and
  disclosure state, every widget kind at every curated semantic size, Home movable surfaces and Dashboard
  widgets, the shared Assistant/context surfaces, status, panels, menus, and relevant hover/open states at
  the exact 1440, 1180, 980, 860, and 680 CSS-pixel widths. Geometry, state, and DOM assertions are necessary but not
  sufficient: reviewers inspect actual pixels and contact sheets, including loaded-font and fallback-font states,
  fresh persistence, and migrated persistence. The matrix also proves Source authority's exact 4/6/8 disclosure
  counts, measured physical-width content tiers and reorder placeholder footprints, complete-series ARIA with
  exactly one visible tiny-chart label for every painted bar including zero bars, measured collision-free
  in-plot placement horizontally associated with each bar, declared-unit value formatting, complete chart facts,
  Planning Wizard/Home/Orchestrator/Projects narrow composition, reorder-ghost visibility, and component-scoped
  contrast without altering Settings or Chat. It also captures the narrow title-bar page-overflow picker open and
  closed, proving that the picker remains above and hit-testable, the edge-fade mask is removed only through its
  visible lifecycle, and underlying page controls do not receive the click. Application page and console errors
  fail the matrix.
gui_related: true
gui_classification_reason: This unit defines the comprehensive still-image review of user-visible PMConcept7 surfaces.
depends_on: [ATS-036, ATS-037, F3-518]
unblocks: []
acceptance_criteria:
  - "Every primary page is rendered in Basic Dark/Light, Friendly Dark/Light, Retro Dark/Light, and Glass Dark/Light."
  - "Every Usage room, disclosure state, widget type, curated size, hidden/expanded state, and room-specific default board is represented or dynamically enumerated from the current fixture catalog; Source authority is exactly 4/6/8 and all thirteen rooms remain reachable at every matrix width."
  - "Every required matrix slice runs at exactly 1440, 1180, 980, 860, and 680 CSS pixels; measured physical card width selects content tiers and reorder placeholder spans, preview spans do not become settled layout fields, Planning Wizard, Home, Orchestrator, and Projects have no empty-track or horizontal-overflow narrow failure, and font-ready, fallback-font, fresh-persistence, and migrated older-namespace runs complete without clipping, collisions, hidden required content, stale-layout override, underlaid reorder ghosts, or component-scoped contrast below the applicable threshold while Settings and Chat bytes remain protected; at every width that activates the title-bar page overflow picker, open/closing/closed screenshots and hit-test probes prove the picker is above underlying controls, its complete painted rectangle is interactive, the ancestor edge-fade mask is absent only during the visible lifecycle, and the same click cannot activate a page control beneath it."
  - "Tiny vertical charts retain the complete ordered accessible series while painting exactly one visible label for every painted bar, including zero bars; measured direct or vertical-lane placement keeps labels horizontally associated with their bars, inside the plot, and pairwise non-overlapping without suppression, attempt-charge integer cents render with exactly two currency decimals, and the title plus Latest and distinct peak remain complete."
  - "Review evidence includes actual screenshots/contact sheets and reviewer dispositions, not only overflow, bounding-box, or computed-style metrics."
  - "Application exceptions, attributable console errors, duplicate critical ids, viewport escape, blank/uniform frames, and unreviewed matrix cells fail certification."
validation_surfaces:
  - "python3 scripts/pm-validate-pm7-gui-fixtures.py validate"
  - "evidence_ref: Plans/.audits/audit-20260829-001-pmconcept7-widget-followup/browser/runs/t41-build8-all-charts/report.json (SHA-256 673e3c9a033a101b41a28dbc0dffc59397515e2c91ae88abac8970414c722b66; exact Build8 concept/browser chart slice; readiness_claim=false)"
  - "evidence_ref: Plans/.audits/audit-20260829-001-pmconcept7-widget-followup/browser/runs/t41-build8-checked-in-width-matrix/report.json (SHA-256 54895af4fb7c7245bbc8c7d5772cd46dace251bfdfa023513fef490aa37e4dd0; exact checked-in Build8 concept/browser width slice; readiness_claim=false)"
  - "evidence_ref: Plans/.audits/audit-20260829-001-pmconcept7-widget-followup/browser/runs/t41-build8-cross-page-matrix-clean-tmp/report.json (SHA-256 d310b6ccbe900c4f7845b15e79e92de6ac89487ac258ed82f0116992efc1104b; exact Build8 cross-page concept/browser geometry and state slice; readiness_claim=false)"
  - "evidence_ref: Plans/.audits/audit-20260829-001-pmconcept7-widget-followup/browser/runs/t41-build8-cross-page-matrix-clean-tmp/independent_visual_review.json (SHA-256 daac899e74e5e74727ac8ba545441c5a593a3b7a55e39e4be4c2d1c430af2b7c; status=completed_with_visual_finding; IVR-T41-B8-XPAGE-001 retains protected Settings card crop at 1180/980/860/680; readiness_claim=false)"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: incomplete_pm7_static_visual_coverage
reasoning_tier: high
context_scope: pm7_static_visual_matrix
implementation_surfaces: [Plans/Automated_Testing_System.md, tests/fixtures/usage_gui, tests/fixtures/pm7_shared]
node_compile_hint: {mode: pm7_static_visual_matrix_only, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - Plans/FinalGUISpec.md#f3-518---pmconcept7-fixture-evidence-and-bootstrap-scope-boundary
  - Concepts/pm7-tools/base/PM7-base.html (current pinned PM7 input; source-lineage-only)
  - Concepts/pm7-tools/build_pm7.py#T33-T43 (source-owned transforms)
  - Plans/.audits/audit-20260829-001-pmconcept7-widget-followup/audit_report.json (current repo-local follow-up audit status; verdict remains report-owned)
preserved_exact_tokens: [1440, 1180, 980, 860, 680, actual pixels, contact sheets, font fallback, local persistence]
negative_constraints:
  - "Do not certify a surface solely because its geometry is in bounds."
  - "Do not omit a state because it was inconvenient to reach manually."
owner_hints: [Plans/Automated_Testing_System.md]
```

### ATS-039 - Frame-By-Frame PM7 Motion And Transaction Audit

```yaml
plan_unit_id: ATS-039
unit_type: validation_criterion
status: accepted
owner_doc: Plans/Automated_Testing_System.md
canonical_text: >-
  PMConcept7 motion certification records and reviews drag, resize, reorder, reflow, page-tab, editor-tab,
  Usage-nav, menu, drawer, Context, hover, panel, and theme transition frame sequences. The audit watches the
  complete start-to-settle lifecycle, including pointer capture, measured-footprint placeholders, ghosts,
  Usage pointer-only live occupied-neighbor resize-peer displacement, Dashboard frozen resize peers, live interruptible reorder-peer displacement, stable two-dimensional Usage candidates
  including empty same-footprint cavities and lower rows, ghost-anchor targeting with geometric hysteresis,
  stable before/after correlation, last-painted-intent commit without pointer-up retarget, clip paths, spring/velocity effects, target
  reconciliation, rollback, and cleanup. Usage reorder films also verify that preview retains the same mounted
  peer nodes at nonzero opacity, never restarts their entrance animation, and reconciles DOM order only once after
  an accepted move. Usage pointer-resize films verify that affected occupied peers visibly repack from each supported
  held target footprint through exact accepted settlement while peer nodes, opacity, entrance state, child list,
  and scroll stay stable; cancellation and failed settlement restore the baseline exactly. Resize films cover the
  far right as the primary edge case plus far-left and middle positions, pointer and keyboard expansion/contraction;
  obstructing-peer held-preview and exact preview-to-settlement parity are pointer-only, while keyboard resize is
  verified as atomic changed-only settlement. The matrix also covers same-direction overshoot and edge-limited one-step
  intent. Direct and displaced move/resize-control approaches cover fast and slow magnetic acquisition, pointer-
  specific rescue, false-positive guards, and complete lease reset. Usage and Home Dashboard pointer and keyboard films exercise the same
  movement semantics while preserving Dashboard wrapper/host ownership. Transaction spies remain empty during
  preview and cancellation and show one existing command plus the applicable single result, receipt, event, and
  settled write only after a changed accepted commit. Hover motion evidence separately exercises startup census,
  settled live observation, and same-frame pointer/focus acknowledgement; it rejects repeated tag work for exact
  old/current attribute reassertions while proving real text, state, insertion, removal, and subtree changes remain live.
  When Product Onboarding is the active modal overlay, the hover campaign first proves a bound, visible tag on an
  actionable modal control, then closes the modal through its typed local action before exercising underlay fixtures;
  the harness never bypasses or misreports the modal's intentional pointer-event interception.
gui_related: true
gui_classification_reason: This unit governs the visible temporal behavior and transactional correctness of PMConcept7 interactions.
depends_on: [ATS-037, F3-515, F3-517]
unblocks: []
acceptance_criteria:
  - "Drag, resize, reorder, reflow, page, editor tab, Usage nav, menu, drawer, Context, hover, panel, and theme motion are sampled from start through stable settlement."
  - "Hover startup and settled-live pacing are measured independently; one frame-bounded startup pass completes, pointer/focus still acknowledges in the same frame, exact old/current attribute reassertions create zero tag invalidation work, and genuine dynamic changes refresh descriptions and visual tags."
  - "The hover matrix proves an actionable Product Onboarding modal control while that modal legitimately owns pointer input, then releases the modal through its typed close action before underlay fixture checks; force-clicks, synthetic pointer bypasses, and click-through claims are forbidden."
  - "Frame health rejects black, blank, uniform, white-until-hover, clipped plate, torn layer, one-frame teardown, or excessively accelerated transition states."
  - "Usage and Home Dashboard pointer and keyboard films show measured pointer placeholder/ghost position, above-workspace ghost visibility, truthful keyboard pickup outline and aria-grabbed state, stable two-dimensional candidate choice including empty same-footprint cavities and lower rows, ghost-anchor targeting with geometric hysteresis, stable before/after correlation, live reorder-peer displacement, Usage pointer-only live occupied-neighbor resize displacement versus Dashboard frozen resize peers, clip path, target animation, and commit of the last painted intent without pointer-up re-hit-testing or retargeting; Usage resize treats the far-right edge as primary and also covers far-left/middle pointer and keyboard expand/contract with requested-axis advance and minimum companion drift, while obstructing-peer held preview, exact held-preview-to-settlement topology parity, stable peer node/opacity/entrance/child-list/scroll state, and cancel/rejection/adapter-failure preview rollback are pointer-only and keyboard resize remains atomic; edge-limited one-step travel and an in-viewport last-painted maximum after same-direction overshoot remain covered; repeated reorder preview retains identical peer nodes on a fully painted board with nonzero opacity, no empty peer rectangle, no entrance-animation restart, no preview child-list churn, and only one post-acceptance DOM-order reconciliation."
  - "Fast and slow direct or displaced approaches to both Usage move and resize controls preserve body magnetism away from the corner, acquire the intended existing controller with pointer capture, clear the pointer-specific lease on activation, and reject other interactives, foreign pointer ids, expired leases, and points outside the corridor; a pointer-events-auto top-layer occluder receives pointerdown above a remembered control, clears that stale lease, and starts no widget operation, while an active resize/reorder rejects every second pointer, touch, pen, or keyboard controller before mutation and retains sole ownership until cleanup."
  - "Preview, Escape, pointercancel, lostpointercapture, blur, invalid target, stale revision, no-change release/drop, and popup dismissal produce zero command, result, receipt, event, and persistence deltas; an owner-rejected command or post-dispatch persistence-adapter failure restores authoritative layout and cleanup, retains exactly one attempted command and one rejected/failed receipt, produces zero settled events or successful owner-store writes, and reports attempted adapter calls separately from successful writes."
  - "A changed owner-accepted release produces exactly one existing command and no duplicate result, receipt, applicable event, or settled write; after commit, cancellation, or no-op there is no leaked capture, preview class, portal, ghost, placeholder, pending animation frame, transient listener, preview-only board minimum height, blank scroll tail, NotFound exception, stuck move state, or mutation through an outer presentation grid instead of the owning Dashboard wrapper/host, and repeated committed reorders do not compound scroll extent."
validation_surfaces:
  - "python3 scripts/pm-validate-pm7-gui-fixtures.py validate"
  - "evidence_ref: Plans/.audits/audit-20260829-001-pmconcept7-widget-followup/browser/runs/t41-build8-focused-regression-rerun-2/report.json (SHA-256 4de0320f73010440560c5fed357df8b67f02188b6ca0a07c1ff3875de31485c0; historical Build8 predecessor interaction slice only, superseded for Usage pointer-resize preview timing; readiness_claim=false)"
  - "evidence_ref: Plans/.audits/audit-20260829-001-pmconcept7-widget-followup/browser/films/build8/t41-final/independent_visual_review.json (SHA-256 b669c7588b87ecd757addb6cdd0b59b473d9de89e0bd9e53a916ecc484ff559b; historical Build8 predecessor Usage/Home film review only, superseded for Usage pointer-resize preview timing; readiness_claim=false)"
  - "verification_pending: fresh exact-T43 Usage pointer live-resize preview and settlement film evidence under Plans/.audits/audit-20260830-001-pmconcept7-live-resize-preview/; readiness_claim=false"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: pm7_motion_blackout_or_transaction_leak
reasoning_tier: high
context_scope: pm7_motion_transaction_audit
implementation_surfaces: [Plans/Automated_Testing_System.md, tests/fixtures/pm7_shared, Concepts/pm7-tools/global_hover_tags_source.py, Concepts/pm7-tools/verify/hover_tags.mjs, Concepts/pm7-tools/verify/full_thread_performance.mjs]
node_compile_hint: {mode: pm7_motion_transaction_matrix_only, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - Plans/FinalGUISpec.md#f3-515---settled-interaction-event-and-persistence-boundary
  - Concepts/pm7-tools/base/PM7-base.html (current pinned PM7 input; source-lineage-only)
  - Concepts/pm7-tools/build_pm7.py#T33-T43 (source-owned transforms)
  - Concepts/pm7-tools/widget_live_resize_preview_source.py (authored T43 Usage-only live resize-preview transform)
  - Plans/.audits/audit-20260829-001-pmconcept7-widget-followup/audit_report.json (current repo-local follow-up audit status; verdict remains report-owned)
preserved_exact_tokens: [pointercancel, lostpointercapture, no-change release, frame-by-frame, final-coordinate, last painted intent, transaction spy]
negative_constraints:
  - "Do not infer motion quality from the final frame alone."
  - "Do not allow fixture code to emit a command or event during preview merely to make the test observable."
  - "Do not let pointer-up retarget a reorder away from its last painted stable intent or let an outer presentation grid become Dashboard widget mutation owner."
  - "The exact Build8 focused and film evidence binds only captured Chromium concept transactions and reviewed Usage/Home frames; uncaptured transitions, touch, pen, multi-touch, non-Chromium, assistive-technology, native Slint, and production-runtime behavior remain outside the claim, and it does not waive the protected Settings crop, P2 narrow overflow-menu keyboard residual, or PNC-019."
owner_hints: [Plans/Automated_Testing_System.md, Plans/FinalGUISpec.md]
```

### ATS-040 - Settled Command Event Receipt And Context Compaction Fixtures

```yaml
plan_unit_id: ATS-040
unit_type: acceptance_contract
status: accepted
owner_doc: Plans/Automated_Testing_System.md
canonical_text: >-
  Shared runtime command-contract fixtures include PM7 interaction traces for preview, changed commit,
  cancellation, no-change release, post-dispatch owner rejection, persistence-adapter failure, duplicate commit
  rejection, and Context compaction. The traces use existing command identities and distinguish local projection,
  owner-accepted settlement, owner rejection, an attempted adapter call, and a successful owner-store write. The current
  workspace.layout_changed schema is version 1.1.0, is settled-only and persisted, references the accepted
  command result and exactly one dispatch receipt, carries interaction/command/correlation identities, prior/new layout
  revisions, mutation and final-target data, the required nullable semantic-size preset, and no preview state. Context
  compaction is represented by cmd.chat.compact_context result, receipt, revision, and compaction-history
  projection with an empty event list. A changed owner-accepted settled commit has exactly one dispatch receipt
  and may emit only `workspace.layout_changed`; post-dispatch owner rejection or adapter failure retains exactly
  one command result and receipt, rolls back, records zero successful owner-store writes, and emits no settled event.
  Preview, cancellation, no-change, and local Assistant compaction are event-silent. The event-family registry contains exactly one workspace.layout_changed family and no
  context.compaction.started, context.compaction.completed, or context.compaction.failed family.
gui_related: true
gui_classification_reason: This unit validates the command/event/receipt traces that drive visible PM7 settlement and context feedback.
depends_on: [ATS-037, F3-515, F3-516, CS-068, UCC-147, WM-045]
unblocks: []
acceptance_criteria:
  - "The shared schema admits PM7 settled-interaction and Context-compaction trace definitions without adding either trace-only command ids to the canonical 26-command shared-runtime census."
  - "Preview, cancellation, and no-change fixtures require null command identity, result_outcome=not_dispatched, dispatch_accepted=null, zero dispatch/result/receipt/event/write-attempt/successful-write counts, prior-state preservation, and completed cleanup."
  - "A changed settled commit fixture requires one existing command, one owner result, exactly one dispatch receipt, exactly one settled write, no duplicate dispatch, and an event list containing either the single applicable workspace.layout_changed event or no event when that family is not applicable; a post-dispatch owner-rejected fixture instead requires one existing command, one rejected result and receipt, dispatch_accepted=false, zero adapter attempts, zero successful writes, authoritative rollback, complete cleanup, and no event, while a persistence-adapter-failed fixture requires one existing command, one failed result and receipt, dispatch_accepted=true, one adapter attempt, zero successful writes, authoritative rollback, complete cleanup, and no event."
  - "workspace.layout_changed is the only allowed event type for a changed settled commit; valid fixtures satisfy schema_version 1.1.0, settled_only=true, preview_state_included=false, persisted=true, interaction/command/correlation identities, accepted command_result_ref, exactly one receipt_ref, prior/new revisions, mutation, final source/target/slot and settled-layout data, and required nullable semantic_size_preset_id."
  - "The currently supplied invalid workspace-event fixtures cover exactly 13 cases: preview_state_included=true; settled_only=false; persisted=false; missing command_result_ref; empty receipt_refs; missing project_id; missing new_layout_revision; an out-of-set mutation_kind; an out-of-set target_host; an out-of-set semantic_size_preset_id; a new_layout_revision that does not advance; a non-workspace command family; and more than one receipt_ref."
  - "Preview, cancellation, and no-change traces contain no event; Context compaction requires cmd.chat.compact_context result and receipt projection but remains event-silent with no context.compaction.* type or new event-family registration."
  - "Fixture validation establishes static representation only, so fresh browser execution, raw receipts, and independent review remain required for runtime behavior; the event registry, shared runtime command validator, PM7 GUI fixture validator, JSON syntax gate, and PlanUnit validation must also pass together."
  - "The shared runtime command validator resolves the reviewed Shared Integration Runtime expansion schema only from its exact repository path and canonical schema ID; an unknown external reference or any attempted network fallback fails closed, so PM7 fixture validation remains deterministic and offline."
validation_surfaces:
  - "python3 scripts/pm-shared-runtime-command-contracts.py validate"
  - "python3 scripts/pm-validate-pm7-gui-fixtures.py validate"
  - "python3 scripts/pm-plans-verify.py validate-pm7-gui-fixtures"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: preview_event_or_compaction_event_authority_drift
reasoning_tier: high
context_scope: pm7_settled_command_event_receipt_fixtures
implementation_surfaces:
  - Plans/Automated_Testing_System.md
  - Plans/shared_runtime_command_contracts.schema.json
  - Plans/shared_runtime_command_contract_fixtures.json
  - Plans/shared_integration_runtime_expansion_contracts.schema.json
  - scripts/pm-shared-runtime-command-contracts.py
  - Plans/event_payloads/workspace_layout_changed.schema.json
  - Plans/event_family_registry.json
  - tests/fixtures/pm7_shared/workspace_layout_event_fixtures.json
node_compile_hint: {mode: pm7_command_event_receipt_fixture_contract_only, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - Plans/Commands_System.md#cs-068---pmconcept7-settled-interaction-command-reuse-and-local-preview-boundary
  - Plans/assistant-chat-design.md#acd-448---one-shared-assistant-seat-and-coherent-context-ring-detail-contract
  - Concepts/pm7-tools/build_pm7.py#T33-T43 (source-owned transforms)
  - Concepts/pm7-tools/widget_live_resize_preview_source.py (T43 Usage pointer-resize preview transform)
  - Plans/.audits/audit-20260829-001-pmconcept7-widget-followup/audit_report.json (current repo-local follow-up audit status; verdict remains report-owned)
preserved_exact_tokens: [pm.event.workspace_layout_changed.v1, schema_version, 1.1.0, settled_only, preview_state_included, persisted, command_result_ref, receipt_refs, semantic_size_preset_id, result_outcome, dispatch_accepted, persistence_write_attempt_count, persistence_write_count, owner_rejected, persistence_adapter_failed, cmd.chat.compact_context, context.compaction.started, context.compaction.completed, context.compaction.failed]
negative_constraints:
  - "Do not add a persisted event for pointer-preview or local working-animation frames."
  - "Do not register Context compaction lifecycle events when the command result and receipt already own the durable outcome."
  - "Do not expand the canonical shared-runtime command census for PM7 trace-only fixture definitions."
owner_hints: [Plans/Automated_Testing_System.md, Plans/Commands_System.md, Plans/event_family_registry.json]
```

### ATS-041 - New Contract Owner-Wave Schema And Fixture Gate

```yaml
plan_unit_id: ATS-041
unit_type: validation_criterion
status: accepted
owner_doc: Plans/Automated_Testing_System.md
canonical_text: >-
  The centrally invoked validate-new-contracts gate fail-closes the authored 23-pair contract manifest plus one
  shared-integration expansion fixture pack for the
  Settings, Onboarding, Guided Tour, Doctor, retained Egolite requirement closure, Project, Named Plan, Full Thread Runtime, Server, Remote Access,
  Backup/Restore, protected AuthBrowserSession, Browser Program, test capture and motion evidence, source control,
  forge, plugins, shared-runtime command, and Final GUI interaction owner wave. It validates every schema against
  the JSON Schema Draft 2020-12 metaschema, selects an exact closed definition for every fixture record, accepts
  every positive, rejects every expected negative, rejects unknown definitions and invalid mutation recipes,
  rejects fixture-pack IDs used as runtime values, stale aggregate owner IDs, duplicate primary runtime record
  identities within a closed definition, and mixed puppetmaster.local/puppet-master.local schema hosts. An
  aggregate runtime schema identity is permitted only when the schema explicitly declares
  x-runtime-schema-id-policy=aggregate_plus_record_kind and each selected definition supplies the matching unique
  record_kind discriminator. The gate proves static schema and fixture consistency only.
gui_related: false
gui_classification_reason: This unit owns a static contract-validation gate; it does not own or certify a visible GUI implementation.
depends_on: [ATS-001, SIR-031]
unblocks: []
acceptance_criteria:
  - "python3 scripts/pm-new-contracts-verify.py validates exactly 23 authored schema/fixture pairs plus one shared-integration expansion fixture pack and reports its complete input manifest and counts."
  - "The current closed corpus accepts 708 positive fixtures, rejects 2606 negative fixtures, accepts 264 expansion command records, 240 owner-compatibility command records, 28 local records, 28 owner-local aliases, and 33 normalizations, and passes all 12 internal negative tests."
  - "python3 scripts/pm-plans-verify.py run-gates invokes one named validate-new-contracts subcheck and propagates its failures."
  - "Every positive fixture resolves to exactly one explicit or discriminator-selected definition, and every negative is rejected by that same intended definition or its explicitly authored cross-record invariant."
  - "Unknown definitions, malformed negative recipes, fixture-pack IDs in runtime records, stale owner identities, duplicate runtime record identities, undocumented aggregate schema identities, and mixed local schema hosts fail closed."
  - "A passing gate is static schema/fixture evidence only and is never promoted into handler, runtime, native Slint, browser, WAN, restore, security, performance, accessibility, readiness, or certification evidence."
validation_surfaces:
  - "python3 scripts/pm-new-contracts-verify.py"
  - "python3 scripts/pm-plans-verify.py validate-new-contracts"
  - "python3 scripts/pm-plans-verify.py run-gates"
risk_class: contract_fixture_drift_or_false_runtime_claim
reasoning_tier: high
context_scope: new_contract_owner_wave_static_validation
implementation_surfaces:
  - Plans/Automated_Testing_System.md
  - scripts/pm-new-contracts-verify.py
  - scripts/pm-plans-verify.py
node_compile_hint: {mode: static_contract_fixture_gate_only, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - Plans/Settings_System.md
  - Plans/Planning_Wizard.md
  - Plans/Server_System.md
  - Plans/Remote_Access_System.md
  - Plans/Backup_Restore_System.md
  - Plans/Section15_MVP_Promoted_Features_Spec.md
  - Plans/Test_Capture_and_Motion_Evidence.md
  - Plans/Source_Control_System.md
  - Plans/Forge_Integrations.md
  - Plans/egolite_retained_requirement_contracts.schema.json
  - Plans/egolite_retained_requirement_contract_fixtures.json
preserved_exact_tokens: [validate-new-contracts, 23, shared-integration expansion fixture pack, Draft 2020-12, aggregate_plus_record_kind, static_schema_and_fixture_consistency_only]
negative_constraints:
  - "Do not add schemas or fixture pairs to the gate through an ambient glob."
  - "Do not weaken a failing invariant merely to make current fixtures pass."
  - "Do not treat gate success as runtime, visual, motion, recovery, security, performance, or readiness proof."
owner_hints: [Plans/Automated_Testing_System.md]
```

### ATS-042 - Touch And Server Command Gap Aggregate Gates

```yaml
plan_unit_id: ATS-042
unit_type: validation_criterion
status: accepted
owner_doc: Plans/Automated_Testing_System.md
canonical_text: >-
  pm-server-command-gap-verify.py and pm-touch-closure-verify.py are independent,
  fail-closed governance checks with separately callable pm-plans-verify wrappers.
  Both wrappers run as named, timeout-bounded subchecks in run-gates and
  audit-governance; neither is buried inside Wiring Matrix validation. The
  server-gap check freezes the 171-row custody partition, resolves every
  schema-bearing pointer, and runs negative self-tests. The Touch Closure check
  verifies exact inventory and denominator coverage, one future handler per
  actionable primary command, no peer alias wiring, real reverse consumers, and
  explicit blocked/excluded dispositions. Both checks prove static canonical
  consistency only.
gui_related: true
gui_classification_reason: Touch Closure validates visible control actions, disabled reasons, return routes, and reverse GUI reachability, while the test owner itself remains non-visual.
split_recommended: false
depends_on: [ATS-041, C-051, DR-041, CV-326, CS-074, WM-051, UIW-017, SIR-031]
unblocks: [0PI-068]
acceptance_criteria:
  - "python3 scripts/pm-plans-verify.py validate-server-command-gap invokes the dedicated validator with JSON output and propagates timeout, signal, malformed-output, self-test, and contract failures."
  - "python3 scripts/pm-plans-verify.py validate-touch-closure normalizes valid=true to aggregate status=pass and fail-closes every other result."
  - "run-gates and audit-governance each report both checks under distinct names with the standard per-subcheck timeout."
  - "The server check resolves 168 schema-bearing plus 3 rejected rows and runs all 11 negative self-tests; both unresolved reference counts remain zero."
  - "The Touch check freezes 560 rows, 87 profiles, 55 excluded tokens, 51 alias bindings, and 1041 production-intent entries; all 400 actionable primary commands have wiring and one handler identity while the one blocked primary command has none."
  - "A passing static gate is not promoted into native runtime, browser, visual, motion, accessibility, performance, recovery, security, readiness, or Slint evidence."
validation_surfaces:
  - python3 scripts/pm-server-command-gap-verify.py --json
  - python3 scripts/pm-touch-closure-verify.py --json
  - python3 scripts/pm-plans-verify.py validate-server-command-gap
  - python3 scripts/pm-plans-verify.py validate-touch-closure
  - python3 scripts/pm-plans-verify.py run-gates
  - python3 scripts/pm-plans-verify.py audit-governance
  - python3 scripts/pm-plan-index.py validate
risk_class: aggregate_gate_omission_or_false_static_certification
reasoning_tier: high
context_scope: touch_and_server_gap_aggregate_gate_registration
implementation_surfaces:
  - Plans/Automated_Testing_System.md
  - scripts/pm-plans-verify.py
  - scripts/pm-server-command-gap-verify.py
  - scripts/pm-touch-closure-verify.py
  - Plans/server_command_gap_adjudication.json
  - Plans/touch_closure.json
node_compile_hint: {mode: named_timeout_bounded_static_governance_gates, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - Plans/Automated_Testing_System.md#ats-041---new-contract-owner-wave-schema-and-fixture-gate
  - Plans/Crosswalk.md#c-051---touch-closure-authority-and-consumer-routing
  - Plans/Contracts_V0.md#cv-326---touch-closure-registry-and-static-production-intent-boundary
preserved_exact_tokens: [validate-server-command-gap, validate-touch-closure, run-gates, audit-governance, valid, status, subcheck_timeout_seconds]
negative_constraints:
  - "Do not fold either dedicated check into validate-wiring-matrix or validate-new-contracts."
  - "Do not accept a killed, timed-out, empty, malformed, or nonzero validator process as a pass."
  - "Do not claim runtime or readiness from static governance closure."
owner_hints: [Plans/Automated_Testing_System.md, Plans/Commands_System.md, Plans/Wiring_Matrix.md, Plans/DRY_Rules.md]
```

### ATS-043 - Forgejo/Gitea, Independent Automation, And Event-Silent Forge Acceptance Matrix

```yaml
plan_unit_id: ATS-043
unit_type: validation_criterion
status: accepted
owner_doc: Plans/Automated_Testing_System.md
canonical_text: >-
  Automated Testing consumes the Forge, Source Control, and Product Onboarding contracts for distinct Forgejo
  and Gitea identities, independent RepositoryForgeBinding and AutomationBinding authority, and the sole
  repository_automation / Actions & Pipelines shell. Static schema and fixture validation covers closed types and
  negative constraints. Runtime integration acceptance separately requires authorized provider instances/accounts,
  exact versions and capability evidence, direct execution-time currentness and security checks, native owner
  handlers/receipts, accessibility and visual evidence, and honest NOT_RUN status where those environments do not
  exist. The nine newly admitted Forge commands remain handler_unavailable and event-silent with
  expected_event_types=[] until their native and Event Authority evidence exists.
gui_related: true
gui_classification_reason: The matrix validates visible Source Control and Actions & Pipelines provider projection, migration, capability, disabled-reason, accessibility, and recovery behavior as well as non-GUI contract/security boundaries.
depends_on: [ATS-020, ATS-041, FGI-012, FGI-013, SCS-013]
unblocks: []
acceptance_criteria:
  - Distinct Forgejo and Gitea adapter/profile fixtures cover old and new product versions, supported API-schema variance, multiple instances with identical repository names, API disabled while Git transport remains available, read-only credentials, SSH-only transport, custom SSH ports, and instance-scoped private CA.
  - Provider capability fixtures distinguish API, Git transport, and Actions state; Actions disabled, no runner, no workflow, insufficient permission, unsupported, and unknown never collapse into one unavailable state or disable proven fetch/publish.
  - RepositoryContext tests cover Git plus Gitea, Jujutsu plus Forgejo, no automation binding, same-forge automation, and automation on a different provider/instance/account/host; AutomationBinding is never inferred from RepositoryForgeBinding, remote origin, repository name, or display label.
  - The one canonical repository_automation occupant is labeled Actions & Pipelines. github_actions migrates only as route/bookmark/deep-link input; GitHub Actions, GitLab Pipelines, Forgejo Actions, and Gitea Actions remain provider-native headings, Bitbucket Data Center without CI says Connect automation service, and no fixture fabricates Origin Actions.
  - Security negatives cover certificate bytes or local paths instead of scoped CA refs, missing or mismatched known-host proof, invalid SSH ports, raw credentials/secrets, Authorization forwarded across redirect-origin change, unapproved localhost/metadata targets, stale provider/binding/catalog/currentness generations, denied permission, and missing FileSafe decision for local writes or downloads.
  - Product Onboarding fixtures admit forge_forgejo and forge_gitea separately, preserve typed self-host inputs and cached owner refs without probing, and prove all pre-Review choices are draft-only. Only a person-confirmed current Review may dispatch each deduplicated canonical owner action; owner return advances without a second confirmation, and the plan never claims account creation, adapter execution, trust, readiness, or success.
  - Each of the exact nine admissions cmd.forge.repository.fork, cmd.forge.pipeline.approve, cmd.forge.review.checks, cmd.forge.repository.policy.preview, cmd.forge.repository.policy.apply, cmd.forge.runner.registration.apply, cmd.forge.runner.remove, cmd.forge.release.list, and cmd.forge.release.asset.download receives one valid request plus a rejected permission, guard, or currentness case as required by its owner contract.
  - Every newly admitted Forge command starts handler_unavailable, has expected_event_types=[], returns only its owner-typed result/receipt/projection, and emits no unregistered forge.* EventRecord. Operation receipts and ObservableWork correlation never count as EventRecord admission.
  - Repository fork, pipeline-gate approval, review checks, policy preview/apply, runner administration, release list, and release-asset download retain distinct targets, permissions, confirmations, digest/FileSafe/currentness/idempotency guards and cannot pass through aliases or generic settings/connection/pipeline-artifact substitutes.
  - Static JSON parse, Draft 2020-12 metaschema, fixture, catalog, touch-closure, or planned-handler success is reported only as static contract evidence. Native adapter/runtime, network, provider behavior, security isolation, accessibility, motion, visual, Slint, persistence/recovery, event, readiness, and certification lanes require their own receipts and remain NOT_RUN when absent.
validation_surfaces:
  - Plans/forge_integration_contracts.schema.json
  - Plans/forge_integration_contract_fixtures.json
  - Plans/source_control_contracts.schema.json
  - Plans/source_control_contract_fixtures.json
  - Plans/product_onboarding_contracts.schema.json
  - Plans/product_onboarding_contract_fixtures.json
  - python3 scripts/pm-new-contracts-verify.py
  - python3 scripts/pm-touch-closure-verify.py --json
  - python3 scripts/pm-plans-verify.py validate-wiring-matrix
  - future authorized Forgejo/Gitea old/new/API-disabled/read-only/SSH-only/private-CA integration matrix
  - future native repository_automation migration/accessibility/visual acceptance matrix
risk_class: forge_provider_automation_security_or_evidence_layer_false_pass
reasoning_tier: high
context_scope: forgejo_gitea_source_control_onboarding_and_automation_acceptance
implementation_surfaces: [Plans/Automated_Testing_System.md, future Forge and Source Control contract/integration/security/GUI test harnesses]
node_compile_hint: {mode: acceptance_contract_only, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - Plans/Forge_Integrations.md#FGI-012
  - Plans/Forge_Integrations.md#FGI-013
  - Plans/Source_Control_System.md#SCS-013
  - source_report:scratchpad/pm-forge-backup-tsnet-post-integration-2026-09-01/agent_reports/live_forge_reconciliation.md
preserved_exact_tokens: [forgejo, gitea, RepositoryForgeBinding, AutomationBinding, repository_automation, "Actions & Pipelines", github_actions, handler_unavailable, "expected_event_types=[]", FileSafe, NOT_RUN]
negative_constraints:
  - Do not collapse Forgejo and Gitea, Git/API/Actions state, repository and automation authority, operation receipts and EventRecords, or static and runtime evidence layers.
  - Do not use real user secrets in fixtures or broaden CA, redirect, localhost, metadata, SSH, permission, FileSafe, or currentness policy to make a test pass.
  - Do not represent mocks, schemas, fixtures, planned handlers, concept simulations, screenshots, or documentation inspection as native/runtime/provider/security/visual/readiness proof.
owner_hints: [Plans/Automated_Testing_System.md, Plans/Forge_Integrations.md, Plans/Source_Control_System.md]
```

### ATS-044 - Exact Forge Backup And Connector Acceptance Custody

```yaml
plan_unit_id: ATS-044
unit_type: validation_criterion
status: accepted
owner_doc: Plans/Automated_Testing_System.md
canonical_text: >-
  Plans/forge_backup_tsnet_acceptance.json retains the September 1 packet's
  exact E2E-001 through E2E-067 scenario identities, setup, ordered steps,
  expected outcomes, requirement references, and required evidence. It also
  retains all 132 requirement-to-test mappings, including empty scenario lists
  and their additional owner-test obligations. This is the Automated Testing
  owner's acceptance inventory; domain semantics remain with the referenced
  owner PlanUnits. The schema and standalone validator enforce exact source
  custody, unique identifiers, resolved owner references, and truthful NOT_RUN
  execution state. Retaining or validating a scenario never means executing it.
gui_related: true
gui_classification_reason: The retained scenarios include Source Control, repository automation, Backup, restore, onboarding, Doctor, theme, and motion acceptance alongside non-GUI provider and recovery behavior.
split_recommended: false
depends_on: [ATS-043]
unblocks: []
acceptance_criteria:
  - The 67 scenario IDs are unique and exactly E2E-001 through E2E-067; original setup, steps, expected outcome, requirement references, and evidence requirements survive without summarization.
  - All 132 requirement-to-test mappings remain present, including mappings with no E2E scenario; the per-owner acceptance obligation is never replaced by the E2E denominator.
  - Every scenario requirement resolves to a retained requirement and its current owner PlanUnit references; every referenced PlanUnit is present in its named live owner document.
  - Source hashes and the exact packet identity are retained; missing sources, changed bodies, unresolved references, duplicate IDs, dropped mappings, and fabricated execution evidence fail the static custody check.
  - Every unexecuted scenario remains NOT_RUN with no execution evidence; static custody success cannot promote native, provider, security, recovery, performance, accessibility, visual, motion, or readiness status.
  - The standalone verifier is available through validate-forge-backup-acceptance and is a distinct timeout-bounded subcheck in run-gates and audit-governance.
validation_surfaces:
  - Plans/forge_backup_tsnet_acceptance.schema.json
  - Plans/forge_backup_tsnet_acceptance.json
  - python3 scripts/pm-forge-backup-acceptance-verify.py
  - python3 scripts/pm-plans-verify.py validate-forge-backup-acceptance
  - python3 scripts/pm-plans-verify.py run-gates
  - tests/test_pm_forge_backup_acceptance.py
  - tests/test_pm_plans_verify_subprocess.py
risk_class: dropped_packet_acceptance_or_false_execution_claim
reasoning_tier: high
context_scope: forge_backup_tsnet_exact_acceptance_inventory
implementation_surfaces:
  - Plans/Automated_Testing_System.md
  - Plans/forge_backup_tsnet_acceptance.schema.json
  - Plans/forge_backup_tsnet_acceptance.json
  - scripts/pm-forge-backup-acceptance-verify.py
  - scripts/pm-plans-verify.py
node_compile_hint: {mode: static_acceptance_custody, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - source_packet:PM_Forge_Backup_Tsnet_Post_Integration_Packet_2026-09-01.zip
  - source_report:scratchpad/pm-forge-backup-tsnet-post-integration-2026-09-01/independent_audit_rerun/REPORT.md
preserved_exact_tokens: [E2E-001, E2E-067, NOT_RUN, 67, 132, validate-forge-backup-acceptance]
negative_constraints:
  - Do not infer complete per-requirement testing from the 67-scenario count.
  - Do not execute external mutations or use user credentials to populate the custody inventory.
  - Do not convert static schema or reference validation into execution evidence.
owner_hints: [Plans/Automated_Testing_System.md]
```

### ATS-045 - Source-Bound Packet Suite Verdicts

```yaml
plan_unit_id: ATS-045
unit_type: validation_criterion
status: accepted
owner_doc: Plans/Automated_Testing_System.md
canonical_text: >-
  Packet audit suite verdicts must be validated against source-manifest case
  identities, not selected by the result row's editable suite label. The combined
  onboarding_doctor source suite has separate onboarding, guided_tour, doctor,
  and onboarding_doctor_overall verdicts. Source areas onboarding, tour, and
  doctor constrain their respective product verdict; shared, impact, testing,
  performance, remote_access, and server_discovery constrain all three
  conservatively. The combined verdict covers every combined-packet case and
  overall covers every manifest case. Both chunk-metadata validation and final
  report validation consume one shared scope implementation. This is a
  fail-closed coverage rule, not an automatic review or a product pass.
  Historical pm.integration_packet_audit_manifest.v1 workbooks retain their
  exact 8252-case denominator and original review evidence. Fresh
  pm.integration_packet_audit_manifest.v2 workbooks carry a versioned,
  source-hashed census contract: all extracted packet groups plus the exact
  Cartesian product of every frozen Touch Closure ID and every extraction-spec
  review dimension. Preparation, chunk union, result counts, merge, and final
  validation consume that same source-bound denominator. Fresh review work
  re-extracts the current custody corpus before accepting a manifest; changing
  row lists, dimensions, counts, or self-reported hashes cannot admit omitted
  source cases. A changed source freeze requires a new workbook, not silently
  migrated results. Source-census inspection may run without creating a review
  workbook or asserting an implementation freeze.
gui_related: false
gui_classification_reason: This unit owns audit-result validation only and adds no product control or presentation behavior.
split_recommended: false
depends_on: [ATS-044]
unblocks: []
acceptance_criteria:
  - Every required verdict has nonempty source case coverage; unknown source areas, missing suite routes, or uncovered verdicts fail validation even when every supplied verdict is blocked.
  - A supplied pass is rejected when any relevant source case is missing, duplicated, relabelled, partial, failed, blocked, or unreviewed.
  - Product-specific failures affect their own product verdict and both rollups; cross-cutting failures affect all three product verdicts and both rollups.
  - Not-applicable case acceptance remains restricted by the existing independent applicability and authority-evidence validator; this scope rule grants no new exemption.
  - Result rows, original custody manifests, reviewer identities, evidence, and historical findings remain unchanged by the scope check.
  - Fresh census validation rejects missing or duplicate groups, rows, dimensions, or row-by-dimension pairs; packet case edits and source/spec hash drift fail comparison with independently re-extracted custody.
  - All chunk and report count checks derive from the validated manifest; the historical 8252 constant applies only to v1 snapshots and cannot cap a fresh review.
  - Fresh preparation refuses a stale source freeze, and incomplete results remain incomplete regardless of the denominator version; synthetic blocked regression results are never promoted to implementation passes.
  - Completed-review structure, implementation verdict, static custody, browser simulation, native runtime, and readiness remain distinct claims.
validation_surfaces:
  - scripts/pm_packet_audit_verdicts.py
  - scripts/pm_packet_audit_census.py
  - scripts/pm-integration-packet-audit-work.py
  - scripts/pm-integration-packet-audit.py
  - tests/test_pm_packet_audit_verdicts.py
  - tests/test_pm_packet_audit_census.py
  - python3 scripts/pm-integration-packet-audit.py census
risk_class: synthetic_suite_false_pass_or_unreviewed_case_omission
reasoning_tier: high
context_scope: exact_packet_case_to_product_and_aggregate_verdict_coverage
implementation_surfaces:
  - scripts/pm_packet_audit_verdicts.py
  - scripts/pm_packet_audit_census.py
  - scripts/pm-integration-packet-audit-work.py
  - scripts/pm-integration-packet-audit.py
node_compile_hint: {mode: static_audit_validation_only, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - source_packet:PM_Onboarding_Doctor_Concept_Bakeoff_Packet_2026-08-15.zip
  - source_report:scratchpad/pm-nonpreview-closure-20260905/packet_inventory/README.md
preserved_exact_tokens: [onboarding_doctor, onboarding, guided_tour, doctor, onboarding_doctor_overall, overall, case_ref, not_applicable]
negative_constraints:
  - Do not narrow the source scope with result-row labels or infer pass from an empty set.
  - Do not mutate retained reviews or replace independent case-by-case evidence with a generated verdict.
  - Do not convert the conservative shared-area rule into permission to omit per-product audit evidence.
owner_hints: [Plans/Automated_Testing_System.md]
```
