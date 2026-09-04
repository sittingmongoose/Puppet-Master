# Shard 070: PMConcept7 User-Polished Runtime Contract Addendum - 2026-08-27

Source: `Plans/FinalGUISpec.md`

Source lines: L34457-L34885

Source SHA256: `d5dd0b8f0f130cf3a4834576d4ac87136d579819ec48bf6b3f165ac4874adc2b`

---

## PMConcept7 User-Polished Runtime Contract Addendum - 2026-08-27

This addendum makes the recovered, source-owned PMConcept7 behavior canonical without treating the generated HTML or concept-only storage and command aliases as production authorities. It covers the complete application surface, not Usage alone, and delegates data, command, storage, event, and testing ownership to their existing canonical owners.

Final successor evidence is report-owned. When `audit_report.json` records `status = pass_with_named_residuals`
and `verdict = successor_scope_verified_with_named_residuals`, the `evidence_ref` entries below prove only their
named exact-hash PMConcept7 concept/demo slices. They grant no native Slint, production-runtime, PNC-019,
certification, completeness, or product-readiness credit; every blocked, failed, uncaptured, or residual lane
retains that classification.

Build8 browser receipts do not establish an all-visuals pass. The protected Settings actual-pixel review retains
`IVR-T41-B8-XPAGE-001`: the rightmost Settings card column is visibly cropped at 1180, 980, 860, and 680 in all
eight themes even though the cross-page runner reports root-level containment. The P2 narrow page-overflow menu
keyboard-focus and Arrow-key-navigation defect also remains open, and PNC-019 remains outside this evidence.

### F3-513 - User-Polished PMConcept7 Whole-Application Authority

```yaml
plan_unit_id: F3-513
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  The user-polished PMConcept7 is the visual and interaction authority for the recovered concept across the
  global shell, title bar, primary pages, side panels, Cozy Shelves, Home workspace, Dashboard, Usage,
  shared Assistant and Context surfaces, bottom/status surfaces, menus, hover states, and motion. The current
  pinned PM7 base plus source-owned T33-T43 transforms owns the current build path; generated PMConcept7.html
  is a product and comparison input, never the sole authored source or product canon. The eight built-in themes remain Basic Dark,
  Basic Light, Friendly Dark, Friendly Light, Retro Dark, Retro Light, Glass Dark, and Glass Light, with the
  recovered family-specific typography, palette, shape, contrast, and motion behavior.
gui_related: true
gui_classification_reason: This unit establishes the complete user-visible PMConcept7 authority and source-owned build boundary.
split_recommended: false
depends_on: [F3-425, F3-426, F3-500]
unblocks: [F3-514, F3-516, F3-517, ATS-037, ATS-038]
acceptance_criteria:
  - "A clean build from the pinned PM7 base through source-owned T33-T43 produces PMConcept7.html; repo-local audit-20260830-001 must record two-build byte equality and any residual before a successor-scope verdict, and no new required behavior may exist only as a hand edit in generated HTML."
  - "All primary pages, shell chrome, global panels, Cozy Shelves, Home, Dashboard, Usage, Assistant/context, bottom panel, and status bar retain the recovered semantic and presentation contract."
  - "All eight theme families preserve their intended font, palette, shape, inactive-state contrast, first-paint background, and family-specific composition."
  - "Initial paint and transitions never expose white or blank controls until hover and never introduce black-screen or uniform-frame flashes."
  - "This contract creates no WorkNodes, NodeSeeds, executable queues, implementation tasks, production code, or accessibility acceptance expansion."
validation_surfaces:
  - "python3 scripts/pm-plan-index.py validate"
  - "python3 scripts/pm-validate-pm7-gui-fixtures.py validate"
  - "python3 scripts/pm-plans-verify.py validate-pm7-gui-fixtures"
risk_class: pm7_whole_application_fidelity_drift
reasoning_tier: high
context_scope: pm7_whole_application_authority
implementation_surfaces:
  - Plans/FinalGUISpec.md
  - Concepts/pm7-tools/base/PM7-base.html
  - Concepts/pm7-tools/build_pm7.py
  - Concepts/PMConcept7.html
node_compile_hint:
  mode: pm7_whole_application_contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Concepts/pm7-tools/base/PM7-base.html (current pinned PM7 input; base_sha256=9dcde2a8862de0cdd28a0d540cb4976396ea0556e6ff15a5c9c8fc14bd121090)"
  - Concepts/pm7-tools/build_pm7.py#T33-T43 (source-owned transforms)
  - Concepts/PMConcept7.html (generated artifact; terminal bytes and hash are audit-owned)
  - Plans/.audits/audit-20260830-001-pmconcept7-live-resize-preview/audit_report.json (current repo-local successor audit status; verdict remains report-owned)
preserved_exact_tokens: [T33, T34, T38, T39, T40, T41, Basic Dark, Basic Light, Friendly Dark, Friendly Light, Retro Dark, Retro Light, Glass Dark, Glass Light]
negative_constraints:
  - "Do not treat generated PMConcept7.html as an authored source."
  - "Do not narrow the recovered authority to Usage-only behavior."
  - "Do not add accessibility bootstrap acceptance work; preserve already-useful keyboard behavior without expanding scope."
owner_hints: [Plans/FinalGUISpec.md]
```

### F3-514 - Usage Rooms Curated Sizes And Complete-Or-Hidden Presentation

```yaml
plan_unit_id: F3-514
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  PMConcept7 Usage projects the thirteen canonical rooms and the exact At a glance, Detailed, and Diagnostics
  disclosure ladder from the Usage owner into a balanced twelve-track widget workspace. Curated defaults,
  provider-heavy narrow-and-tall cards, partial-row alignment, semantic size identities, complete-or-hidden
  content tiers, chart and meter lanes, source-confidence copy, Raw versus Curated views, Context details, and
  humanized Ledger labels must remain readable at supported sizes. Wider or taller widgets earn their footprint
  with additional columns, facts, or rows; routine internal body scrolling, clipped labels, partial next-tier
  content, and empty decorative width are not accepted product states. Content tiers respond to the widget body's
  measured rendered width rather than nominal grid spans, and reorder placeholders use the measured physical
  width and height without persisting those preview spans. Vertical charts reserve a measured in-plot label
  region and paint exactly one visible value for every painted bar, including zero bars, while keeping every
  label inside the plot and collision-free. Labels remain horizontally associated with their own bars and may
  use measured vertical lanes when direct-above placement would collide; no datum is suppressed. Tiny charts
  retain the complete ordered series in accessible text. Chart values use the metric's declared
  display unit and formatter, including currency formatting for attempt-charge integer cents, and the chart title
  plus Latest and distinct peak facts remain complete in one row or a narrow two-row composition. An active
  reorder ghost stays visibly above the workspace until cleanup.
  Every room remains reachable at every supported width, and Source authority mounts exactly 4/6/8 panels for
  At a glance/Detailed/Diagnostics. A route blocked on provider setup renders
  the exact `Provider Setup Required` state with explicit `Host/Environment`, preserves operation and continuation
  identity, and reuses `cmd.settings.open` with the typed Settings target
  `target_type=setting`, `setting_id=ai.accounts.provider-connections`; UF-090, UF-092, and CBP-028 retain policy ownership, so installation and
  authentication remain separate and the GUI starts no automatic acquisition or silent reroute.
  PMConcept7 Ledger attempt controls dispatch `cmd.nav.open_usage_subject` only with stable `attempt_id` and
  `usage_event_ref`, normalize to `route_target.object_kind = usage_attempt` plus `object_id = attempt_id`, keep
  the event/provider/account/runtime identities as correlation, and carry no `OpenSubject`. Event-primary callers
  retain usage_event/usage_event_ref. Aggregate provider, account, and panel cards open their existing local
  inspector with no route command, receipt, or domain event.
gui_related: true
gui_classification_reason: This unit governs the visible Usage room, widget, chart, meter, Context, and Ledger presentation.
split_recommended: false
depends_on: [F3-513, UF-093, UF-094, UF-096, WS-017, WS-018, WS-020]
unblocks: [F3-515, F3-518, ATS-036, ATS-038]
acceptance_criteria:
  - "Overview, Plans & limits, Costs, Accounts, Free models, Context, Analytics, Ledger, Attention, Prompt cache, Tools, Signals, and Source authority are all addressable, in that order and at every supported physical width, with only At a glance, Detailed, and Diagnostics as user-facing disclosure labels; Source authority mounts exactly 4/6/8 panels, and provider setup absence renders exact Provider Setup Required copy, explicit Host/Environment, preserved operation/continuation identity, and a cmd.settings.open CTA with target_type setting and setting_id ai.accounts.provider-connections."
  - "Every room has a non-empty curated default; partial final rows retain intentional widths and provider-heavy boards prefer narrower, taller, information-dense cards."
  - "Each semantic size presents a complete tier or hides the tier entirely, chooses that tier from measured rendered width, and larger sizes reveal additional useful facts, rows, columns, or plots rather than blank area; reorder placeholders use measured rendered width and height rather than stale nominal spans, preview spans do not become settled layout fields, and supported curated sizes have no routine widget-body scrolling, clipped corners, value collisions, partial bars, bottom-content peeking, or partially exposed next-tier content."
  - "Every painted vertical bar, including a zero bar, has exactly one visible label inside the plot; labels remain horizontally associated with their own bars, measured direct or vertical-lane placement prevents clipping and pair overlap without suppressing data, accessible text retains the complete ordered series, values use the declared metric formatter and display unit, attempt-charge integer cents render with exactly two currency decimals rather than raw cents, and the title plus Latest and distinct peak remain complete in one row or a narrow two-row composition; reorder ghosts remain above cards until cleanup."
  - "Source authority/confidence, unknown versus zero, Raw/Curated redaction, Context composition, and humanized Ledger attempt labels remain semantically truthful and visually legible; a PMConcept7 Ledger attempt routes by attempt_id as object_kind usage_attempt, preserves usage_event_ref plus provider/account/runtime correlation, and carries no OpenSubject, while provider/account/panel aggregate detail cards remain local inspectors and leave route-command, command-receipt, and domain-event counts unchanged."
validation_surfaces:
  - "python3 scripts/pm-plan-index.py validate"
  - "python3 scripts/pm-plans-verify.py validate-usage-gui-fixtures"
  - "python3 scripts/pm-plans-verify.py validate-pm7-gui-fixtures"
risk_class: pm7_usage_visual_semantic_false_pass
reasoning_tier: high
context_scope: pm7_usage_curated_presentation
implementation_surfaces:
  - Plans/FinalGUISpec.md
  - Plans/usage-feature.md
  - Plans/Widget_System.md
  - tests/fixtures/usage_gui
node_compile_hint:
  mode: pm7_usage_presentation_contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - Concepts/pm7-tools/base/PM7-base.html (current pinned PM7 input; source-lineage-only)
  - Concepts/pm7-tools/build_pm7.py#T33-T43 (source-owned transforms)
  - Concepts/pm7-tools/widget_live_resize_preview_source.py (authored T43 Usage-only live resize-preview transform)
  - Concepts/PMConcept7.html (generated artifact; terminal bytes and hash are audit-owned)
  - Plans/.audits/audit-20260829-001-pmconcept7-widget-followup/audit_report.json (current repo-local follow-up audit status; verdict remains report-owned)
  - Plans/usage-feature.md#uf-093---usage-rooms-disclosure-and-local-projection-state
  - Plans/Widget_System.md#ws-017---kind-aware-curated-size-and-adaptive-content-contract
preserved_exact_tokens: [Overview, Plans & limits, Costs, Accounts, Free models, Context, Analytics, Ledger, Attention, Prompt cache, Tools, Signals, Source authority, At a glance, Detailed, Diagnostics, Provider Setup Required, Host/Environment, cmd.settings.open, ai, ai.accounts.provider-connections, twelve-track, complete-or-hidden, Raw, Curated]
negative_constraints:
  - "Do not revive Essen, Std, Adv, essentials, standard, or advanced as user-facing disclosure labels."
  - "Do not stretch lone cards across a row or preserve wide empty space merely because the grid permits it."
  - "Do not render missing, hidden, disabled, unsupported, or unknown values as zero."
  - "Do not bundle installation with authentication, start automatic acquisition, or silently reroute from Provider Setup Required."
  - "Do not route a provider/account/panel presentation ID, use usage_event_ref as the PMConcept7 Ledger attempt object_id, invent an unregistered aggregate-card object kind, or attach OpenSubject to either cmd.nav.open_usage_subject selector branch."
owner_hints: [Plans/FinalGUISpec.md, Plans/usage-feature.md, Plans/Widget_System.md]
```

### F3-515 - Settled Interaction Event And Persistence Boundary

```yaml
plan_unit_id: F3-515
unit_type: interaction_contract
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  PMConcept7 widget and Home direct manipulation is transactional. Pointer movement, keyboard reorder preview,
  placeholders, ghosts, target animation, Usage pointer-only live resize-peer displacement, Dashboard frozen resize-peer geometry, live reorder-peer displacement, popup
  disclosure, and hover are view-local. Widget pickup snapshots stable widget identity, committed order, measured
  physical footprint, and stable before/after correlation. Usage derives a stable two-dimensional candidate set
  from the frozen grid, including empty same-footprint cavities and lower rows; pointer selection aligns the
  ghost's anchored top-left with a candidate origin under real geometric hysteresis, so overlapping multi-span
  candidate rectangles cannot redirect the visible placeholder. Pointer and keyboard reorder use the same
  candidate model with live interruptible peer displacement while peer nodes remain mounted and fully painted;
  entrance animations do not restart and the accepted settlement reconciles DOM order once. Usage pointer resize
  advances its real target footprint through the same deterministic slot projection, visibly repacks only
  obstructed peers during the held preview, and retains that last-painted topology on acceptance without remounting
  peers; Usage keyboard resize remains an atomic changed-only settlement per supported directional key intent, and Dashboard resize keeps peer rectangles frozen. Horizontal pointer or keyboard intent advances strictly on the requested supported curated
  axis at the far right, far left, and middle while minimizing companion-axis drift; an edge-constrained deliberate
  drag can express one step, and an in-viewport release commits the last painted supported size even after
  same-direction overshoot. A changed reorder
  release/drop commits the last intent actually painted without a new pointer-up hit test or release-time retarget;
  other changed releases or semantic activations resolve their final coordinate and target. The accepted action
  dispatches exactly one existing command, reconciles one owner result and its dispatch receipt, emits the existing
  workspace.layout_changed event only when that event is applicable, and persists one settled state. Escape,
  pointercancel, `lostpointercapture`, blur, invalid target, stale revision, no-change release/drop, and popup
  dismissal restore committed state, clear capture and transient state, and produce no command, receipt, persisted
  event, or storage write. An owner-rejected command or post-dispatch persistence-adapter failure restores the
  authoritative state and emits no settled event or successful owner-store write while retaining exactly one
  attempted command and its typed rejected/failed result and dispatch receipt. Commit and rollback both restore any
  temporary preview board extent, and one active pointer or keyboard widget transaction excludes every competing
  operation before focus, capture, class, or DOM mutation. The compatibility-only
  cmd.workspace_layout.size_surface token resolves a semantic preset to dimensions and dispatches
  cmd.workspace_layout.resize_surface; it is not a second registered command.
gui_related: true
gui_classification_reason: This unit governs visible drag, resize, reorder, preset, cancellation, and cleanup behavior.
split_recommended: false
depends_on: [F3-514, WS-019, CS-068, UCC-147, WM-045, UIW-012]
unblocks: [ATS-037, ATS-039, ATS-040]
acceptance_criteria:
  - "While a pointer or keyboard preview is active, command, result, receipt, persisted-event, and storage-write spies remain empty; Usage pointer resize advances the target footprint and visibly displaces only obstructed peers while Dashboard resize peers remain frozen, and reorder peers visibly displace around the same stable two-dimensional candidate, including empty same-footprint cavities and lower rows, without peer-node remount, opacity loss, board blackout, child-list churn, or entrance-animation replay; Usage pointer targeting aligns the ghost's anchored top-left with one stable candidate origin under a geometric hysteresis margin so overlapping multi-span rectangles cannot steal the target, and keyboard pickup exposes truthful aria-grabbed plus a visible picked-card outline while traversing the same candidate set."
  - "A changed reorder release/drop commits the last painted intent without pointer-up re-hit-testing or retargeting; horizontal-only resize advances strictly along the requested supported curated axis at right/left/middle positions, minimizes companion-axis drift, admits an edge-limited one-step gesture, and commits an in-viewport last-painted maximum despite same-direction overshoot; it and every other changed final-coordinate release or semantic activation dispatch exactly one existing command and reconcile exactly one settled owner outcome without duplicate effects."
  - "Escape, pointercancel, lostpointercapture, blur, invalid target, stale revision, no-change release/drop, popup dismissal, and pre-dispatch validation failure restore the prior authoritative state with no command or receipt and clear capture, ghosts, placeholders, portals, classes, animation frames, and transient listeners; an owner-rejected or post-dispatch adapter-failed attempt retains exactly one command and one rejected/failed receipt but no settled event or successful owner-store write; changed pointer and keyboard reorder restore the exact pre-transaction inline board minimum height, leave scroll extent bounded to settled card geometry without a compounding blank tail, and exclude concurrent resize/reorder acquisition until the sole owner terminates."
  - "The current workspace.layout_changed 1.1.0 payload is emitted only for an applicable changed committed layout, requires settled_only=true, preview_state_included=false, persisted=true, interaction/command/correlation identities, accepted result and receipt references, prior/new revisions, mutation, final target and settled-layout data, and the required nullable semantic_size_preset_id through its closed schema."
  - "No PM7-only command family, preview-frame event family, second layout store, or registered cmd.workspace_layout.size_surface command is introduced."
validation_surfaces:
  - "python3 scripts/pm-plan-index.py validate"
  - "python3 scripts/pm-shared-runtime-command-contracts.py validate"
  - "python3 scripts/pm-validate-pm7-gui-fixtures.py validate"
risk_class: pm7_preview_commit_or_duplicate_effect_drift
reasoning_tier: high
context_scope: pm7_transactional_direct_manipulation
implementation_surfaces:
  - Plans/FinalGUISpec.md
  - Plans/event_payloads/workspace_layout_changed.schema.json
  - Plans/event_family_registry.json
  - Plans/shared_runtime_command_contracts.schema.json
  - Plans/shared_runtime_command_contract_fixtures.json
node_compile_hint:
  mode: pm7_transaction_contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - Plans/Commands_System.md#cs-068---pmconcept7-settled-interaction-command-reuse-and-local-preview-boundary
  - Plans/UI_Wiring_Rules.md#uiw-012---transactional-preview-commit-cancel-cleanup-and-shared-assistant-re-seating
  - Concepts/pm7-tools/base/PM7-base.html (current pinned PM7 input; source-lineage-only)
  - Concepts/pm7-tools/build_pm7.py#T33-T43 (source-owned transforms)
  - Concepts/pm7-tools/widget_live_resize_preview_source.py (authored T43 Usage-only live resize-preview transform)
  - Plans/.audits/audit-20260829-001-pmconcept7-widget-followup/audit_report.json (current repo-local follow-up audit status; verdict remains report-owned)
preserved_exact_tokens: [workspace.layout_changed, cmd.workspace_layout.size_surface, cmd.workspace_layout.resize_surface, Escape, pointercancel, lostpointercapture, no-change release, last painted intent]
negative_constraints:
  - "Do not persist or emit pointer-preview frames."
  - "Do not dispatch a command merely because a pointer moved, a hover changed, or a popup opened."
  - "Do not re-hit-test or retarget a reorder at pointer-up after a different stable intent was last painted."
  - "Do not treat cancellation acknowledgement as successful cleanup without rollback evidence."
owner_hints: [Plans/FinalGUISpec.md, Plans/Commands_System.md, Plans/UI_Command_Catalog.md, Plans/UI_Wiring_Rules.md]
```

### F3-516 - One Shared Assistant Context And Status Continuity

```yaml
plan_unit_id: F3-516
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  PMConcept7 uses one shared Assistant node, controller, transcript/thread store, draft/attachment state,
  context state, and Context Detail Pane. Home seats that identity in its saved dock; other pages re-seat the
  same identity in the right-side global host without remounting or losing state, and failed re-seating restores
  the prior seat. The context ring exposes current-window use, effective window and loaded tokens, cache hit,
  and source composition. Its compact menu offers Compact Now and More Details. Compact Now dispatches
  cmd.chat.compact_context and projects the existing result, receipt, and compaction history; it does not invent
  context.compaction.started, context.compaction.completed, or context.compaction.failed EventRecord families.
  The full-width status bar participates in layout, never covers content, and contains no notification or bell item.
gui_related: true
gui_classification_reason: This unit governs the visible shared Assistant, Context ring/detail surfaces, and status bar continuity.
split_recommended: false
depends_on: [F3-513, ACD-448, WM-045, UIW-012]
unblocks: [F3-517, F3-518, ATS-037, ATS-038, ATS-040]
acceptance_criteria:
  - "Exactly one Assistant node/controller/store identity exists and is re-seated across pages without transcript, draft, attachment, thread, or context loss."
  - "A failed or stale re-seat restores the prior host and preserves the saved Home dock rather than creating a second Assistant or blank seat."
  - "The context ring and detail pane expose current-window percentage, effective context window, loaded tokens, cache hit, source composition, Curated/Raw details, routing/fallback, limits, and compaction history."
  - "Compact Now uses cmd.chat.compact_context result and receipt projection with zero registered context.compaction.* event families; More Details reuses the existing Context Detail Pane commands."
  - "The status bar spans the application layout, does not cover content, and has no notifications or bell affordance."
validation_surfaces:
  - "python3 scripts/pm-plan-index.py validate"
  - "python3 scripts/pm-validate-pm7-gui-fixtures.py validate"
  - "python3 scripts/pm-plans-verify.py validate-pm7-gui-fixtures"
risk_class: duplicate_assistant_or_context_authority
reasoning_tier: high
context_scope: pm7_shared_assistant_context_status
implementation_surfaces:
  - Plans/FinalGUISpec.md
  - Plans/assistant-chat-design.md
  - Plans/event_family_registry.json
  - tests/fixtures/pm7_shared
node_compile_hint:
  mode: pm7_shared_assistant_context_status_contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - Plans/assistant-chat-design.md#acd-448---one-shared-assistant-seat-and-coherent-context-ring-detail-contract
  - Concepts/pm7-tools/base/PM7-base.html (current pinned PM7 input; source-lineage-only)
  - Concepts/pm7-tools/build_pm7.py#T33-T43 (source-owned transforms)
  - Concepts/PMConcept7.html (generated artifact; terminal bytes and hash are audit-owned)
  - Plans/.audits/audit-20260829-001-pmconcept7-widget-followup/audit_report.json (current repo-local follow-up audit status; verdict remains report-owned)
preserved_exact_tokens: [Compact Now, More Details, Curated, Raw, cmd.chat.compact_context, context.compaction.started, context.compaction.completed, context.compaction.failed]
negative_constraints:
  - "Do not create a second Assistant, transcript store, context store, or Context Detail Pane."
  - "Do not register context compaction lifecycle events merely to mirror a local working animation."
  - "Do not put notifications or a bell in the status bar."
owner_hints: [Plans/FinalGUISpec.md, Plans/assistant-chat-design.md]
```

### F3-517 - Global Shell Home Dashboard Panels Themes And Motion Compatibility

```yaml
plan_unit_id: F3-517
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  The recovered global shell composes title/search/toolbars, page tabs, side panels, Cozy Shelves, Home editor
  and terminal surfaces, Dashboard widgets, bottom surfaces, status, hover layers, menus, portals, and liquid-ink
  or editor-tab motion without clipping or incompatible ownership. Home and Dashboard preserve their distinct
  tab models while using the shared Usage visual grammar for move, options, resize, and settled sizing. Dashboard
  cards remain children of and are mutated through their owning Dashboard tab/category wrapper or host even when
  that wrapper participates presentation-only in an outer grid; the outer presentation grid is never the widget
  mutation owner. Pointer and keyboard Dashboard manipulation share the same dedicated handle, truthful
  `aria-grabbed` state, measured-footprint placeholder, fixed ghost, stable before/after insertion intent, live
  reorder-peer displacement, Dashboard-frozen resize peers, last-painted-intent commit, changed-only existing widget command
  and persistence boundary, and silent cancellation/no-op cleanup. Reorder preview keeps peer nodes mounted and
  fully painted, does not restart entrance animation, and reserves DOM-order reconciliation for the accepted
  settlement. Theme
  overlays may change palette, typography, radius, opacity, texture, and silhouette, but they do not reorder,
  rename, hide, or resize functional surfaces. Motion is slow enough to read, continuously visible, and free of
  black frames, white-until-hover artifacts, clipped transition plates, or independent tab-layer easing.
  Physical container width, not a nominal breakpoint token alone, drives narrow composition: Planning Wizard,
  Home, Orchestrator, and Projects collapse to viable single-column/scrollable arrangements without empty grid
  tracks or page overflow. Contrast repairs are component-scoped to the affected non-Settings/non-Chat surface
  and must not rewrite global theme tokens, Settings, or the protected Chat design. The title-bar page-overflow
  picker remains above and hit-testable at narrow widths; its ancestor edge-fade mask is disabled only while the
  picker is opening, open, or closing, so clicks cannot fall through to page controls beneath it.
gui_related: true
gui_classification_reason: This unit governs visible compatibility across shell, Home, Dashboard, panels, themes, and motion.
split_recommended: false
depends_on: [F3-513, F3-514, F3-516]
unblocks: [F3-518, ATS-037, ATS-038, ATS-039]
acceptance_criteria:
  - "Basic, Friendly, Retro, and Glass dark/light variants preserve the recovered font, palette, tab, panel, and inactive-state behavior without changing functional inventory; component-scoped contrast repairs do not mutate global theme tokens, Settings, or protected Chat surfaces."
  - "Home editor/terminal surfaces and Dashboard widgets preserve stable identities, tabs, move/options/resize affordances, semantic sizes, and settled-state continuity; Panel 1 retains the Browser Preview and Automation owner sessions without duplication in the stable `Preview -> Automation -> overflow/actions anchor` group order, owner refresh is idempotent and produces no recurring child-list reseat loop once that group is settled, only the active session participates in layout or focus order, and legacy overflow fitting cannot reveal inactive Automation; Dashboard cards remain owned by their tab/category wrapper or host even when that wrapper participates presentation-only in the outer grid, and pointer/keyboard move and resize have parity for the dedicated handle, truthful aria-grabbed state, measured placeholder and ghost, stable before/after insertion intent, live reorder-peer displacement versus Dashboard-frozen resize peers, last-painted-intent changed-only commit, rollback, and complete cancellation/no-op cleanup without NotFound or a stuck move state."
  - "Search, Source Control, Artifacts, Tests, Actions, Agents, Debug & Run, Docker, Files, and related Cozy Shelves panels retain recovered spacing, indentation, readable rows, and working controls."
  - "Title bar, page tabs, theme picker, left rail, menus, portals, bottom surfaces, and status remain inside viewport bounds at supported desktop widths; Planning Wizard, Home, Orchestrator, and Projects use physical-width-aware one-column or scrollable narrow composition with no empty tracks or application/page horizontal overflow; a narrow title-bar page overflow picker remains visually above and owns hit testing across its painted rectangle, disables the ancestor edge-fade mask only through opening/open/closing, restores the mask afterward, and never exposes an underlying page control to the same click."
  - "Page, tab, menu, drawer, hover, drag, resize, and reflow motion has no black, blank, white-until-hover, clipped, or one-frame teardown state; Usage reorder and pointer-only live resize-repack preview keep every peer mounted and nonzero-opacity with no restarted entrance animation, while Dashboard resize retains frozen peers."
validation_surfaces:
  - "python3 scripts/pm-plan-index.py validate"
  - "python3 scripts/pm-validate-pm7-gui-fixtures.py validate"
  - "evidence_ref: Plans/.audits/audit-20260829-001-pmconcept7-widget-followup/browser/runs/t41-build8-focused-regression-rerun-2/report.json (SHA-256 4de0320f73010440560c5fed357df8b67f02188b6ca0a07c1ff3875de31485c0; historical predecessor concept/browser slice; superseded for Usage pointer-resize timing; readiness_claim=false)"
  - "evidence_ref: Plans/.audits/audit-20260829-001-pmconcept7-widget-followup/browser/films/build8/t41-final/independent_visual_review.json (SHA-256 b669c7588b87ecd757addb6cdd0b59b473d9de89e0bd9e53a916ecc484ff559b; credited Build8 Usage/Home lossless-film review only; readiness_claim=false)"
  - "evidence_ref: Plans/.audits/audit-20260829-001-pmconcept7-widget-followup/browser/runs/t41-build8-cross-page-matrix-clean-tmp/report.json (SHA-256 d310b6ccbe900c4f7845b15e79e92de6ac89487ac258ed82f0116992efc1104b; exact Build8 cross-page concept/browser geometry and state slice; readiness_claim=false)"
  - "evidence_ref: Plans/.audits/audit-20260829-001-pmconcept7-widget-followup/browser/runs/t41-build8-cross-page-matrix-clean-tmp/independent_visual_review.json (SHA-256 daac899e74e5e74727ac8ba545441c5a593a3b7a55e39e4be4c2d1c430af2b7c; status=completed_with_visual_finding; IVR-T41-B8-XPAGE-001 retains protected Settings card crop at 1180/980/860/680; readiness_claim=false)"
risk_class: pm7_cross_surface_theme_or_motion_regression
reasoning_tier: high
context_scope: pm7_shell_home_dashboard_panels_themes_motion
implementation_surfaces:
  - Plans/FinalGUISpec.md
  - Concepts/pm7-tools/base/PM7-base.html
  - Concepts/pm7-tools/build_pm7.py
  - Concepts/pm7-tools/home_workspace_source.py
  - tests/fixtures/pm7_shared
node_compile_hint:
  mode: pm7_cross_surface_compatibility_contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - Concepts/pm7-tools/base/PM7-base.html (current pinned PM7 input; source-lineage-only)
  - Concepts/pm7-tools/build_pm7.py#T33-T43 (source-owned transforms)
  - Concepts/pm7-tools/widget_live_resize_preview_source.py (authored T43 Usage-only live resize-preview transform; Dashboard behavior unchanged)
  - Concepts/pm7-tools/home_workspace_source.py (authored Home owner projection; Browser Preview and Automation inactive-state repair)
  - Concepts/PMConcept7.html (generated artifact; terminal bytes and hash are audit-owned)
  - Plans/.audits/audit-20260829-001-pmconcept7-widget-followup/audit_report.json (current repo-local follow-up audit status; verdict remains report-owned)
preserved_exact_tokens: [Basic, Friendly, Retro, Glass, liquid-ink, Home, Dashboard, Cozy Shelves, aria-grabbed]
negative_constraints:
  - "Do not let theme overlays alter functional ownership or control identity."
  - "Do not replace the custom Home editor or Dashboard tab models with a generic tab implementation."
  - "Do not let the outer presentation grid directly own or mutate Dashboard cards, and do not give pointer and keyboard movement different commit semantics."
  - "Do not accept geometry-only checks as proof that pixels and motion are correct."
  - "Do not use this repair lane to change Settings or Chat GUI bytes or to rewrite global theme tokens."
owner_hints: [Plans/FinalGUISpec.md]
```

### F3-518 - PMConcept7 Fixture Evidence And Bootstrap Scope Boundary

```yaml
plan_unit_id: F3-518
unit_type: acceptance_contract
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  PMConcept7 acceptance evidence is rooted in canonical repository fixtures and reports, not in concept-only
  demo reports. Usage fixtures live under tests/fixtures/usage_gui, shared PM7 surface and interaction fixtures
  live under tests/fixtures/pm7_shared, and the current authored concept runners may produce execution evidence
  for their owned slices. Every fixture names its owner PlanUnits, source lineage, positive assertions, negative
  assertions, and intended visual or interaction surface. Fixture presence and `must`/`must_not` lists establish
  static representation only and never prove runtime, visual, motion, or migration behavior; those require fresh
  browser execution, raw receipts, and independent review. Final certification combines deterministic build
  proof, machine-readable geometry and state assertions, actual-pixel review, and frame-by-frame motion review.
  The widget interaction slice binds the exact generated artifact hash and covers repeated right-edge (primary),
  left-edge, and middle pointer/keyboard resize settlement plus pointer-only live occupied-peer preview repack with accepted-settlement parity,
  direct and rescued magnetic-control
  acquisition, cancellation/no-op cleanup, stable mounted reorder peers, and black/empty-frame detection.
  The acquisition evidence includes a real top-layer occluder and transaction reentrancy probes, while settled
  reorder evidence proves preview-only board extent does not survive or compound after commit.
  Accessibility remains outside this bootstrap expansion; existing keyboard behavior may be preserved, but this
  recovery does not create new accessibility PlanUnits, acceptance matrices, or implementation work.
gui_related: true
gui_classification_reason: This unit defines how visible PMConcept7 acceptance evidence is owned and reviewed.
split_recommended: false
depends_on: [F3-514, F3-515, F3-516, F3-517]
unblocks: [ATS-036, ATS-037, ATS-038, ATS-039, ATS-040]
acceptance_criteria:
  - "The canonical Usage and shared PM7 fixture trees exist in the repository and concept demo reports are not used as substitutes for them."
  - "Every fixture records stable identity, owner PlanUnits, source lineage, affected surfaces, must assertions, and must-not assertions."
  - "Fixture files and their must/must_not lists grant static representation only and do not prove runtime, visual, motion, or migration behavior; visual certification requires fresh browser execution, raw receipts, screenshots/contact sheets, and independent actual-pixel review in addition to DOM, state, and geometry assertions."
  - "Motion certification requires fresh frame-sequence capture, raw receipts, and independent review for drag, resize, reorder, reflow, page, menu, drawer, hover, context, and tab movement rather than sampling only the final frame; widget interaction evidence binds one exact generated artifact and includes primary far-right plus far-left/middle horizontal pointer and keyboard resize, Usage occupied-peer displacement during held pointer preview, exact preview-to-accepted-settlement topology parity, Dashboard-frozen resize peers, direct and displaced-handle acquisition, exact command/receipt/event/write counts, preview node/opacity/animation/child-list continuity, cancellation/no-op cleanup, and decoded frame review for black or empty intervals."
  - "No accessibility acceptance expansion, WorkNode, NodeSeed, executable queue, implementation task, or production code is created by this evidence contract."
validation_surfaces:
  - "python3 scripts/pm-plan-index.py validate"
  - "python3 scripts/pm-validate-pm7-gui-fixtures.py validate"
  - "python3 scripts/pm-plans-verify.py run-gates"
risk_class: pm7_fixture_or_visual_evidence_false_completion
reasoning_tier: high
context_scope: pm7_fixture_evidence_boundary
implementation_surfaces:
  - Plans/FinalGUISpec.md
  - Plans/Automated_Testing_System.md
  - tests/fixtures/usage_gui
  - tests/fixtures/pm7_shared
node_compile_hint:
  mode: pm7_fixture_evidence_contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - Concepts/pm7-tools/base/PM7-base.html (current pinned PM7 input; source-lineage-only)
  - Concepts/pm7-tools/build_pm7.py#T33-T43 (source-owned transforms)
  - Concepts/pm7-tools/widget_live_resize_preview_source.py (authored T43 Usage-only live resize-preview transform)
  - Concepts/PMConcept7.html (generated artifact; terminal bytes and hash are audit-owned)
  - Plans/.audits/audit-20260829-001-pmconcept7-widget-followup/audit_report.json (current repo-local follow-up audit status; verdict remains report-owned)
  - Plans/Automated_Testing_System.md
preserved_exact_tokens: [tests/fixtures/usage_gui, tests/fixtures/pm7_shared, actual pixels, frame-by-frame, accessibility]
negative_constraints:
  - "Do not call concept reports or screenshots alone a canonical fixture suite."
  - "Do not claim final visual completion from geometry-only checks."
  - "Do not add accessibility bootstrap acceptance work."
owner_hints: [Plans/FinalGUISpec.md, Plans/Automated_Testing_System.md]
```
