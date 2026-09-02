# Shard 027: PMConcept7 User-Polished Acceptance Addendum - 2026-08-27

Source: `Plans/Automated_Testing_System.md`

Source lines: L3225-L3514

Source SHA256: `b25fb1aa2371456e671d9f1b4f5ae98200727a5497af258069de595ce5aa4ee9`

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
  - "Companion matrices cover all thirteen rooms, At a glance/Detailed/Diagnostics, curated semantic sizes, complete-or-hidden tiers, measured physical content/placeholder footprints, stable identity-based insertion intent, and the recovered width families; chart fixture expectations preserve the full ordered accessible series while checking exactly one visible in-plot label for every painted vertical bar, including zero bars, measured direct or vertical-lane placement keeps each label horizontally associated with its own bar, inside the plot, and pairwise non-overlapping without suppression, declared-unit formatting includes exactly two currency decimals for attempt-charge integer cents, and title/Latest/distinct-peak composition remains complete."
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
  - Concepts/pm7-tools/build_pm7.py#T33-T41 (source-owned transforms)
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
  manipulation parity; stable identity-based insertion intent; frozen resize peers versus live reorder-peer
  displacement; last-painted-intent commit without release retarget; cancellation/no-op cleanup; and the exact
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
  - Concepts/pm7-tools/build_pm7.py#T33-T41 (source-owned transforms)
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
  - Concepts/pm7-tools/build_pm7.py#T33-T41 (source-owned transforms)
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
  frozen resize peers, live interruptible reorder-peer displacement, stable two-dimensional Usage candidates
  including empty same-footprint cavities and lower rows, ghost-anchor targeting with geometric hysteresis,
  stable before/after correlation, last-painted-intent commit without pointer-up retarget, clip paths, spring/velocity effects, target
  reconciliation, rollback, and cleanup. Usage reorder films also verify that preview retains the same mounted
  peer nodes at nonzero opacity, never restarts their entrance animation, and reconciles DOM order only once after
  an accepted move. Resize films cover the far right as the primary edge case plus far-left and middle positions,
  pointer and keyboard expansion/contraction, obstructing peers, same-direction overshoot, and edge-limited one-step
  intent. Direct and displaced move/resize-control approaches cover fast and slow magnetic acquisition, pointer-
  specific rescue, false-positive guards, and complete lease reset. Usage and Home Dashboard pointer and keyboard films exercise the same
  movement semantics while preserving Dashboard wrapper/host ownership. Transaction spies remain empty during
  preview and cancellation and show one existing command plus the applicable single result, receipt, event, and
  settled write only after a changed accepted commit.
gui_related: true
gui_classification_reason: This unit governs the visible temporal behavior and transactional correctness of PMConcept7 interactions.
depends_on: [ATS-037, F3-515, F3-517]
unblocks: []
acceptance_criteria:
  - "Drag, resize, reorder, reflow, page, editor tab, Usage nav, menu, drawer, Context, hover, panel, and theme motion are sampled from start through stable settlement."
  - "Frame health rejects black, blank, uniform, white-until-hover, clipped plate, torn layer, one-frame teardown, or excessively accelerated transition states."
  - "Usage and Home Dashboard pointer and keyboard films show measured pointer placeholder/ghost position, above-workspace ghost visibility, truthful keyboard pickup outline and aria-grabbed state, stable two-dimensional candidate choice including empty same-footprint cavities and lower rows, ghost-anchor targeting with geometric hysteresis, stable before/after correlation, live reorder-peer displacement, frozen resize peers, clip path, target animation, and commit of the last painted intent without pointer-up re-hit-testing or retargeting; Usage resize treats the far-right edge as primary and also covers far-left/middle pointer and keyboard expand/contract with obstructing peers, requested-axis advance with minimum companion drift, edge-limited one-step travel, and an in-viewport last-painted maximum after same-direction overshoot; repeated reorder preview retains identical peer nodes on a fully painted board with nonzero opacity, no empty peer rectangle, no entrance-animation restart, no preview child-list churn, and only one post-acceptance DOM-order reconciliation."
  - "Fast and slow direct or displaced approaches to both Usage move and resize controls preserve body magnetism away from the corner, acquire the intended existing controller with pointer capture, clear the pointer-specific lease on activation, and reject other interactives, foreign pointer ids, expired leases, and points outside the corridor; a pointer-events-auto top-layer occluder receives pointerdown above a remembered control, clears that stale lease, and starts no widget operation, while an active resize/reorder rejects every second pointer, touch, pen, or keyboard controller before mutation and retains sole ownership until cleanup."
  - "Preview, Escape, pointercancel, lostpointercapture, blur, invalid target, stale revision, no-change release/drop, and popup dismissal produce zero command, result, receipt, event, and persistence deltas; an owner-rejected command or post-dispatch persistence-adapter failure restores authoritative layout and cleanup, retains exactly one attempted command and one rejected/failed receipt, produces zero settled events or successful owner-store writes, and reports attempted adapter calls separately from successful writes."
  - "A changed owner-accepted release produces exactly one existing command and no duplicate result, receipt, applicable event, or settled write; after commit, cancellation, or no-op there is no leaked capture, preview class, portal, ghost, placeholder, pending animation frame, transient listener, preview-only board minimum height, blank scroll tail, NotFound exception, stuck move state, or mutation through an outer presentation grid instead of the owning Dashboard wrapper/host, and repeated committed reorders do not compound scroll extent."
validation_surfaces:
  - "python3 scripts/pm-validate-pm7-gui-fixtures.py validate"
  - "evidence_ref: Plans/.audits/audit-20260829-001-pmconcept7-widget-followup/browser/runs/t41-build8-focused-regression-rerun-2/report.json (SHA-256 4de0320f73010440560c5fed357df8b67f02188b6ca0a07c1ff3875de31485c0; exact Build8 concept/browser interaction slice; readiness_claim=false)"
  - "evidence_ref: Plans/.audits/audit-20260829-001-pmconcept7-widget-followup/browser/films/build8/t41-final/independent_visual_review.json (SHA-256 b669c7588b87ecd757addb6cdd0b59b473d9de89e0bd9e53a916ecc484ff559b; credited Build8 Usage/Home lossless-film review only; readiness_claim=false)"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: pm7_motion_blackout_or_transaction_leak
reasoning_tier: high
context_scope: pm7_motion_transaction_audit
implementation_surfaces: [Plans/Automated_Testing_System.md, tests/fixtures/pm7_shared]
node_compile_hint: {mode: pm7_motion_transaction_matrix_only, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - Plans/FinalGUISpec.md#f3-515---settled-interaction-event-and-persistence-boundary
  - Concepts/pm7-tools/base/PM7-base.html (current pinned PM7 input; source-lineage-only)
  - Concepts/pm7-tools/build_pm7.py#T33-T41 (source-owned transforms)
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
  - Plans/event_payloads/workspace_layout_changed.schema.json
  - Plans/event_family_registry.json
  - tests/fixtures/pm7_shared/workspace_layout_event_fixtures.json
node_compile_hint: {mode: pm7_command_event_receipt_fixture_contract_only, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - Plans/Commands_System.md#cs-068---pmconcept7-settled-interaction-command-reuse-and-local-preview-boundary
  - Plans/assistant-chat-design.md#acd-448---one-shared-assistant-seat-and-coherent-context-ring-detail-contract
  - Concepts/pm7-tools/build_pm7.py#T33-T41 (source-owned transforms)
  - Plans/.audits/audit-20260829-001-pmconcept7-widget-followup/audit_report.json (current repo-local follow-up audit status; verdict remains report-owned)
preserved_exact_tokens: [pm.event.workspace_layout_changed.v1, schema_version, 1.1.0, settled_only, preview_state_included, persisted, command_result_ref, receipt_refs, semantic_size_preset_id, result_outcome, dispatch_accepted, persistence_write_attempt_count, persistence_write_count, owner_rejected, persistence_adapter_failed, cmd.chat.compact_context, context.compaction.started, context.compaction.completed, context.compaction.failed]
negative_constraints:
  - "Do not add a persisted event for pointer-preview or local working-animation frames."
  - "Do not register Context compaction lifecycle events when the command result and receipt already own the durable outcome."
  - "Do not expand the canonical shared-runtime command census for PM7 trace-only fixture definitions."
owner_hints: [Plans/Automated_Testing_System.md, Plans/Commands_System.md, Plans/event_family_registry.json]
```
