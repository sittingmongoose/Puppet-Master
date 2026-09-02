# Shard 034: PMConcept7 Recovery Canonical Integration Addendum - 2026-08-27

Source: `Plans/usage-feature.md`

Source lines: L6419-L6761

Source SHA256: `4dea9175dadfaebb338bcd2957d53fed33cd25c26d350a63f5169c643f8e78c0`

---

## PMConcept7 Recovery Canonical Integration Addendum - 2026-08-27

This addendum integrates the recovered PMConcept7 Usage workspace into the current Usage owner without
disturbing the 2026-08-18 Usage accounting, disclosure, or policy-boundary canon above. Current source lineage
is the pinned `Concepts/pm7-tools/base/PM7-base.html` plus the assertion-guarded T33-T41 pipeline in
`Concepts/pm7-tools/build_pm7.py`; `Concepts/PMConcept7.html` is the protected generated output and is never an
authored product or command owner. The current repo-local audit status is
`Plans/.audits/audit-20260829-001-pmconcept7-widget-followup/audit_report.json`; incomplete or failed runtime,
visual, interaction, motion, or accessibility rows remain `verification_pending`, and static source presence or
this Plans compile grants none of that audit credit. This addendum creates no WorkNodes, NodeSeeds, executable queues, implementation tasks,
production implementation code, or generated governance artifacts.

Final successor evidence is report-owned. When `audit_report.json` records `status = pass_with_named_residuals`
and `verdict = successor_scope_verified_with_named_residuals`, the `evidence_ref` entries below prove only their
named exact-hash PMConcept7 concept/demo slices. They grant no native Slint, production-runtime, PNC-019,
certification, completeness, or product-readiness credit; every blocked, failed, uncaptured, or residual lane
retains that classification.

### UF-093 - Usage Rooms Disclosure And Local Projection State

```yaml
plan_unit_id: UF-093
unit_type: requirement
status: accepted
owner_doc: Plans/usage-feature.md
canonical_text: >-
  Usage is one widget-composed workspace with the exact user-facing rooms `Overview`, `Plans & limits`,
  `Costs`, `Accounts`, `Free models`, `Context`, `Analytics`, `Ledger`, `Attention`, `Prompt cache`, `Tools`,
  `Signals`, and `Source authority`. Its user-facing disclosure ladder is exactly `At a glance`, `Detailed`,
  and `Diagnostics`. Disclosure changes the mounted panel set and the useful facts inside eligible panels; it
  is not decorative copy and it never deletes a widget instance or stored layout. Source authority mounts exactly
  4, 6, and 8 panels at those three disclosure levels, and all thirteen rooms remain reachable at every supported
  physical viewport width even when the secondary rail collapses into an overflow surface. Active room, scope, date
  range, disclosure level, and the expanded-room rail state are local view projections unless an existing
  canonical command owner explicitly requires a command; changing them does not justify a new command family.
  Usage refresh and object-backed Usage/Ledger drill-through continue through their existing authorities. A
  PMConcept7 Ledger attempt row dispatches `cmd.nav.open_usage_subject` only with stable `attempt_id` and
  `usage_event_ref`, normalizes to `route_target.object_kind = usage_attempt` plus `object_id = attempt_id`, keeps
  the event/provider/account/runtime refs as correlation, and carries no `OpenSubject`; event-primary callers
  retain `usage_event` plus `usage_event_ref`, while aggregate provider/account/panel details remain local inspectors and dispatch no
  command, receipt, or domain event. When a selected provider
  route cannot run because setup is absent, the exact state is `Provider Setup Required`; it shows explicit
  `Host/Environment`, preserves operation and continuation identity, and reuses `cmd.settings.bloom.open` with
  category `ai` and focus `ai.accounts.provider-connections`. UF-090, UF-092, and CBP-028 remain the policy
  owners: installation and authentication stay separate, and Usage neither starts an automatic acquisition nor
  silently reroutes the request.
gui_related: true
gui_classification_reason: This unit defines the visible Usage room taxonomy, disclosure labels, and view-state behavior.
depends_on: [CBP-028, UF-044, UF-055, UF-090, UF-092, WS-016]
unblocks: [UF-094, UF-095, UF-096]
acceptance_criteria:
  - All thirteen named rooms are addressable in the Usage workspace at every supported physical viewport width, including through the secondary-room overflow surface when required, and each renders its room-specific panel catalog at the current disclosure level.
  - The only user-facing disclosure labels are At a glance, Detailed, and Diagnostics; Essen, Std, Adv, essentials, standard, and advanced are not disclosure labels.
  - Switching disclosure materially changes mounted panel types or content facts, Source authority mounts exactly 4/6/8 panels for At a glance/Detailed/Diagnostics, and no disclosure switch deletes an existing widget instance or stored layout.
  - Active room, scope, date range, disclosure, and expanded-room rail state remain local projection actions unless an existing owner requires otherwise; no duplicate command family is introduced, Usage refresh retains its authority, and a PMConcept7 Ledger attempt row dispatches cmd.nav.open_usage_subject as a usage_attempt/attempt_id object route without OpenSubject while retaining usage_event_ref as correlation; event-primary callers retain usage_event/usage_event_ref, and aggregate provider, account, and panel cards open local inspectors without a route command, command receipt, or domain event.
  - Provider setup absence renders the exact `Provider Setup Required` state with explicit `Host/Environment` and preserved operation and continuation identity; its CTA reuses `cmd.settings.bloom.open` with category `ai` and focus `ai.accounts.provider-connections`, mints no new setup command, keeps installation and authentication separate, performs no automatic acquisition or silent reroute, and leaves UF-090, UF-092, and CBP-028 as the underlying policy owners.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - tests/fixtures/usage_gui/presentation/room_disclosure_matrix.json (static contract fixture only)
  - "evidence_ref: Plans/.audits/audit-20260828-001-pmconcept7-usage-successor/browser/runs/run-002/raw-results.json#/room_disclosure_width_observations"
  - "evidence_ref: Plans/.audits/audit-20260828-001-pmconcept7-usage-successor/browser/runs/run-002/t35-t37-focused-verification.json"
  - "evidence_ref: Plans/.audits/audit-20260828-001-pmconcept7-usage-successor/browser/runs/run-002/interaction-visual-supplement-verification.json"
  - "evidence_ref: Plans/.audits/audit-20260828-001-pmconcept7-usage-successor/browser/runs/run-002/browser-verification-report.json"
risk_class: usage_room_or_disclosure_drift
reasoning_tier: high
context_scope: usage_rooms_disclosure_projection
implementation_surfaces:
  - Plans/usage-feature.md
  - Plans/Widget_System.md
  - Plans/storage-plan.md
node_compile_hint:
  mode: usage_rooms_disclosure_projection
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Concepts/pm7-tools/base/PM7-base.html (current recovered PMConcept7 source base; source-lineage-only)"
  - "Concepts/pm7-tools/build_pm7.py (current assertion-guarded T33-T41 pipeline)"
  - "Concepts/PMConcept7.html (protected generated output; verification input only; never hand-edit)"
preserved_exact_tokens:
  - Overview
  - "Plans & limits"
  - Costs
  - Accounts
  - "Free models"
  - Context
  - Analytics
  - Ledger
  - Attention
  - "Prompt cache"
  - Tools
  - Signals
  - "Source authority"
  - "Provider Setup Required"
  - "Host/Environment"
  - cmd.settings.bloom.open
  - ai
  - ai.accounts.provider-connections
  - "At a glance"
  - Detailed
  - Diagnostics
negative_constraints:
  - Do not expose Essen, Std, Adv, essentials, standard, or advanced as user-facing disclosure labels.
  - Do not mint commands merely to persist local room, scope, date-range, disclosure, or expanded-rail projection state.
  - Do not route aggregate provider/account/panel cards, copy a presentation card ID into route_target.object_id, attach OpenSubject to either typed cmd.nav.open_usage_subject selector branch, or use usage_event_ref as the primary object_id of a PMConcept7 Ledger attempt row.
  - Do not treat the protected generated artifact or in-progress audit work as passed executable acceptance evidence.
  - Do not bundle installation with authentication, start automatic acquisition, or silently reroute a setup-blocked request.
owner_hints:
  - Plans/usage-feature.md
  - Plans/Widget_System.md
```

### UF-094 - Curated Room Defaults And Saved-Layout Migration

```yaml
plan_unit_id: UF-094
unit_type: requirement
status: accepted
owner_doc: Plans/usage-feature.md
canonical_text: >-
  Every Usage room starts from a non-empty, room-specific, balanced curated board on the current twelve-track
  layout. Default rows preserve intentional card widths and alignment; a partial final row does not stretch a
  lone card to full width, provider-heavy rooms prefer narrower taller cards, and the mixed-size stress/demo
  arrangement is not a product default. The seven-widget four-column table retained by UF-058 is legacy source
  lineage and migration compatibility, not the current default-board authority. A saved layout may override
  current defaults only after its schema and default-set version migrate and its widget identities and supported
  geometry validate; otherwise the room falls back to the corrected current default with an explicit migration
  or reset disposition.
gui_related: true
gui_classification_reason: This unit defines the visible default composition and safe restoration of every Usage room.
depends_on: [UF-056, UF-058, UF-059, WS-017, WS-018]
unblocks: [UF-095, UF-096]
acceptance_criteria:
  - Every room has an intentional non-empty default board and the default catalog is room-specific rather than one stress/demo layout copied everywhere.
  - Partial rows retain curated widths and deliberate alignment; All signals and comparable lone cards do not stretch across the full board.
  - Provider-heavy default boards use narrower taller cards and reveal complete additional rows rather than low-density horizontal space.
  - The legacy UF-058 seven-widget four-column table is accepted only as migration/source lineage and cannot replace the current twelve-track room defaults.
  - Saved layout restore requires a current or successfully migrated schema/default-set version, valid widget identities, and supported geometry; failed validation falls back to the current curated default.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - tests/fixtures/usage_gui/presentation/curated_size_matrix.json (static contract fixture only)
  - tests/fixtures/usage_gui/presentation/persistence_migration_matrix.json (static contract fixture only)
  - "evidence_ref: Plans/.audits/audit-20260828-001-pmconcept7-usage-successor/browser/runs/run-002/raw-results.json#/runtime_size_render_observations"
  - "evidence_ref: Plans/.audits/audit-20260828-001-pmconcept7-usage-successor/browser/runs/run-002/raw-results.json#/migration_observations"
  - "evidence_ref: Plans/.audits/audit-20260828-001-pmconcept7-usage-successor/browser/runs/run-002/independent-visual-review.json"
risk_class: usage_bad_default_or_stale_layout_override
reasoning_tier: high
context_scope: usage_curated_defaults_migration
implementation_surfaces:
  - Plans/usage-feature.md
  - Plans/Widget_System.md
  - Plans/storage-plan.md
node_compile_hint:
  mode: usage_curated_defaults_migration
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Concepts/pm7-tools/base/PM7-base.html (current recovered PMConcept7 source base; source-lineage-only)"
  - "Concepts/pm7-tools/build_pm7.py (current assertion-guarded T33-T41 pipeline)"
  - "Concepts/PMConcept7.html (protected generated output; verification input only; never hand-edit)"
preserved_exact_tokens:
  - twelve-track
  - balanced curated board
  - partial final row
  - default-set version
  - widget identity
negative_constraints:
  - Do not use a mixed-size stress or demonstration layout as the product default.
  - Do not let an unversioned or invalid saved layout override corrected defaults.
owner_hints:
  - Plans/usage-feature.md
  - Plans/Widget_System.md
  - Plans/storage-plan.md
```

### UF-095 - Usage Workspace Settled-State Persistence Consumer Contract

```yaml
plan_unit_id: UF-095
unit_type: data_contract
status: accepted
owner_doc: Plans/usage-feature.md
canonical_text: >-
  Usage restores the current workspace from eight view/layout state families: active `room`, disclosure
  `detail`, date `range`, account/provider `scope`, expanded-room rail `more`, per-room widget `hidden` state,
  per-room settled widget `layout`, and per-room widget `order`. The product implementation stores these
  through the current storage and widget-layout owners, not through the PMConcept7 prototype localStorage
  keys. The current `pm7:usage:prototype:workspace:v12` envelope is demo-only, noncanonical prototype lineage.
  It validates and considers the prior v11 envelope once when v12 is absent, while `pm7:usage:v10:*` may be
  considered only by the bounded legacy import when neither valid current nor prior envelope is admitted; none
  is a canonical product storage key. Visibility, order, supported geometry, and semantic size persist only after a committed widget
  operation; pointer-preview rectangles, ghosts, placeholders, animation state, and per-frame drafts never
  become durable state. Missing rooms, widgets, scopes, or unsupported geometry migrate or evict to the
  documented safe current default rather than leaving a dangling identity.
gui_related: true
gui_classification_reason: These fields determine what Usage shows after reload and how committed widgets are restored.
depends_on: [UF-060, UF-093, UF-094, WS-019, WS-020, SP-248]
unblocks: []
acceptance_criteria:
  - Reload restores room, disclosure, date range, scope, expanded-room rail state, per-room visibility, per-room order, and committed size/layout according to the current model.
  - Visibility, order, supported geometry, and semantic size are written only for settled operations through existing widget-layout authorities.
  - No pointer-preview rectangle, ghost, placeholder, animation state, or per-frame draft is persisted.
  - Missing or retired room, widget, scope, or geometry references migrate or evict to a named safe current default.
  - PMConcept7 prototype keys remain source-lineage/migration shims rather than canonical storage keys; the v12 envelope remains demo-only and noncanonical, v11 is considered only as its prior one-time import source, and v10 import is bounded rather than becoming a continuing dual-read path.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - tests/fixtures/usage_gui/presentation/persistence_migration_matrix.json (static contract fixture only)
  - "evidence_ref: Plans/.audits/audit-20260828-001-pmconcept7-usage-successor/browser/runs/run-002/raw-results.json#/migration_observations"
  - "evidence_ref: Plans/.audits/audit-20260828-001-pmconcept7-usage-successor/browser/runs/run-002/raw-results.json#/transaction_interaction_observations"
  - "evidence_ref: Plans/.audits/audit-20260828-001-pmconcept7-usage-successor/browser/runs/run-002/browser-verification-report.json"
risk_class: usage_workspace_state_orphan_or_preview_persistence
reasoning_tier: high
context_scope: usage_workspace_settled_state
implementation_surfaces:
  - Plans/usage-feature.md
  - Plans/Widget_System.md
  - Plans/storage-plan.md
node_compile_hint:
  mode: usage_workspace_settled_state
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Concepts/pm7-tools/base/PM7-base.html (current recovered PMConcept7 source base; source-lineage-only)"
  - "Concepts/pm7-tools/build_pm7.py (current assertion-guarded T33-T41 pipeline)"
  - "Concepts/PMConcept7.html (protected generated output; verification input only; never hand-edit)"
preserved_exact_tokens:
  - room
  - detail
  - range
  - scope
  - more
  - hidden
  - layout
  - order
  - widget_layout:v1:usage
  - pm7:usage:prototype:workspace:v12
  - pm7:usage:prototype:workspace:v11
  - pm7:usage:v10:*
negative_constraints:
  - Do not make a pointer move, held resize preview, ghost, placeholder, or animation frame durable.
  - Do not promote `pm7:usage:v10:*` prototype keys to canonical key names.
  - Do not promote v12, v11, or `pm7:usage:v10:*` prototype lineage to a canonical key or maintain a continuing dual-read path.
owner_hints:
  - Plans/usage-feature.md
  - Plans/storage-plan.md
  - Plans/Widget_System.md
```

### UF-096 - Polished Usage Widget Width Coverage Set

```yaml
plan_unit_id: UF-096
unit_type: requirement
status: accepted
owner_doc: Plans/usage-feature.md
canonical_text: >-
  The current Usage catalog applies the smaller polished minimum/default width family and content-earning
  larger tiers to Plans & limits instruments, Token analytics, Usage ledger widgets, Recent events, Analytics
  widgets, Model mix, Anomaly comparison, Savings trend, Reporting state, every Context widget except Current
  window, Source mix, Model limits, Maintenance history, Fallback order, Account routing, Fallback reasons,
  Pricing confidence, Provider charges, Allowance authority, Pressure order, Upcoming resets, Settlement mix,
  Route pressure, Tool details, Current sources, All signals, Cache economics, Routing trace, and Free usage.
  Each named card still follows its kind-specific supported geometry; this list is coverage, not a mandate to
  force unrelated widgets to one numeric width. Content-tier selection and reorder placeholder footprint follow
  the card body's measured rendered width and height rather than a stale nominal grid-span or breakpoint
  assumption; preview-only physical spans never become settled layout fields. A vertical chart reserves a
  measured in-plot label region and paints exactly one visible value for every painted bar, including zero bars,
  while keeping every label inside the plot and collision-free. Labels remain horizontally associated with their
  own bar and may use measured vertical lanes when direct-above placement would collide; no datum is suppressed.
  Tiny charts retain the complete ordered point sequence in accessible text. Chart
  values use the metric's declared display unit and formatter, including rendering attempt-charge integer cents
  as currency rather than raw cents. The chart title plus Latest and distinct peak facts remain complete in one
  row or a narrow two-row composition, and an active reorder ghost remains visibly above the workspace until
  commit or rollback.
gui_related: true
gui_classification_reason: This unit names the visible cards whose polished minimum/default and wider adaptive tiers must be retained.
depends_on: [UF-094, WS-017, WS-018]
unblocks: []
acceptance_criteria:
  - Every named card has a smaller polished minimum/default variant that remains composed without clipped values or avoidable empty width, with content tiers and reorder placeholder footprints chosen from measured rendered geometry rather than nominal spans, while every larger supported variant reveals additional useful content or plot area rather than blank space.
  - Current window retains its separately approved Context default while the other Context widgets use the smaller polished family.
  - The coverage list does not override kind-specific min/max constraints or force all cards to identical numeric spans; preview physical spans do not become settled layout fields.
  - Every painted vertical bar, including a zero bar, has exactly one visible label inside the plot; labels remain horizontally associated with their own bars, measured direct or vertical-lane placement prevents clipping and pair overlap without suppressing data, accessible text retains the complete ordered series, values use the declared metric formatter and unit, attempt-charge integer cents render with exactly two currency decimals rather than raw cents, the title plus Latest and distinct peak remain complete in one row or a narrow two-row composition, and reorder ghosts remain visibly above card/content layers until cleanup.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - tests/fixtures/usage_gui/presentation/curated_size_matrix.json (static contract fixture only)
  - tests/fixtures/usage_gui/presentation/widget_content_tiers.json (static contract fixture only)
  - "evidence_ref: Plans/.audits/audit-20260828-001-pmconcept7-usage-successor/browser/runs/run-002/raw-results.json#/runtime_size_render_observations"
  - "evidence_ref: Plans/.audits/audit-20260828-001-pmconcept7-usage-successor/browser/runs/run-002/t35-t37-focused-verification.json"
  - "evidence_ref: Plans/.audits/audit-20260828-001-pmconcept7-usage-successor/browser/runs/run-002/visual-census.json"
  - "evidence_ref: Plans/.audits/audit-20260828-001-pmconcept7-usage-successor/browser/runs/run-002/independent-visual-review.json"
risk_class: usage_named_widget_width_regression
reasoning_tier: high
context_scope: usage_polished_widget_width_coverage
implementation_surfaces:
  - Plans/usage-feature.md
  - Plans/Widget_System.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: usage_polished_widget_width_coverage
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Concepts/pm7-tools/base/PM7-base.html (current recovered PMConcept7 source base; source-lineage-only)"
  - "Concepts/pm7-tools/build_pm7.py (current assertion-guarded T33-T41 pipeline)"
  - "Concepts/PMConcept7.html (protected generated output; verification input only; never hand-edit)"
preserved_exact_tokens:
  - "Plans & limits"
  - "Token analytics"
  - "Recent events"
  - "Model mix"
  - "Anomaly comparison"
  - "Savings trend"
  - "Reporting state"
  - "Current window"
  - "Source mix"
  - "Model limits"
  - "Maintenance history"
  - "Fallback order"
  - "Account routing"
  - "Fallback reasons"
  - "Pricing confidence"
  - "Provider charges"
  - "Allowance authority"
  - "Pressure order"
  - "Upcoming resets"
  - "Settlement mix"
  - "Route pressure"
  - "Tool details"
  - "Current sources"
  - "All signals"
  - "Cache economics"
  - "Routing trace"
  - "Free usage"
negative_constraints:
  - Do not interpret the coverage set as one universal fixed width for every widget kind.
  - Do not let a larger tier earn its size with empty space alone.
  - Do not drop chart points from accessible text, suppress a painted bar's label, or let an active reorder ghost render under workspace cards.
  - Do not position a value label outside the plot, detach it horizontally from its own bar, permit label overlap, or display attempt-charge cents without exactly two currency decimals.
  - Do not persist preview-only measured physical spans or use stale nominal spans as rendered-width authority.
owner_hints:
  - Plans/usage-feature.md
  - Plans/Widget_System.md
```
