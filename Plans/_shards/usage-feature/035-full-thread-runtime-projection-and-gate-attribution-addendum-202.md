# Shard 035: Full-Thread Runtime Projection And Gate Attribution Addendum - 2026-08-31

Source: `Plans/usage-feature.md`

Source lines: L6531-L6880

Source SHA256: `b992d366f78133b51691900eac1e8a6e32e7b48648348bd6984c1acc2ab781d1`

---

## Full-Thread Runtime Projection And Gate Attribution Addendum - 2026-08-31

Usage consumes `SchemaID:pm.full_thread_runtime.contracts.v1` and the owner records in `Plans/Shared_Integration_Runtime.md` without becoming a resource governor, command-outcome owner, work-lifecycle owner, connection supervisor, public-ingress gate, or domain scheduler. Usage remains the sole owner of provider-attempt accounting and human usage/cost/quota presentation.

### Accounting identity across command and runtime continuity

One real provider attempt still creates one immutable `UsageRecord`. `OperationId`, command instance, `AttemptId`, provider-attempt ref, UsageRecord identity, owner generation, topology generation, and dedupe key remain joinable but non-interchangeable. Reconnect, process restart, operating-system sleep/wake, external-return navigation, projector retry, and replay/live overlap preserve the logical operation and do not create a second billed attempt. A genuinely new retry, fallback, or provider attempt receives a new `AttemptId` and UsageRecord linked to the parent operation.

The runtime axes remain visibly separate in Usage:

- a `RuntimeResourceGovernor` decision explains admission or resource wait but never creates token, cost, quota, or settlement facts;
- a command `accepted` or `acknowledged` outcome explains that the request entered its durable lineage but never means provider execution or billing completed;
- `ObservableWork` explains the current work lifecycle and time partitions but is not billing or settlement authority.

Usage preserves all shared work states: `accepted`, `queued`, `starting`, `running`, `waiting`, `retrying`, `reconnecting`, `backgrounded`, `degraded`, `stalled`, `committing`, `verifying`, `testing-route`, `migrating-route`, `rolling-back`, `completed`, `failed`, `cancelled`, and `recovery-required`. Normal copy maps these values to precise human labels and reasons rather than displaying raw enums. `testing-route` and `migrating-route` never render as a passed test or completed migration.

Provider-active time, local compute, resource wait, permission/approval wait, offline/outbox wait, reconnect/sync/replay/snapshot time, maintenance, and total elapsed remain distinguishable. Install, authentication, repair, update, rollback, public-ingress rejection, local probe, and non-model plugin work are operational attribution only. If one invokes a model, that attempt receives a separate linked UsageRecord.

### Same-frame acknowledgement, bounded lists, and hidden surfaces

Usage controls reuse their existing canonical command IDs. When an action obtains durable acceptance in the dispatch frame, its pending shell renders from the shared `CommandOutcomeRecord`; a same-frame acknowledgement is never shown as provider success, settled cost, or completed work. Later owner failure rolls the shell back and retains the failed/recovery-required attempt or operational row when canon requires it.

Ledger rows, attempts, provider/account lists, alerts, resets, and long widget detail collections use stable record IDs, bounded virtualized windows, bounded overscan, narrow deltas, and collection/projection generations. Scope, room, disclosure, time range, filter, search, refresh, and selected-detail requests are latest-request-wins for projection work. A response whose generation no longer matches is rejected and cannot replace the current list, total, selection, or inspector. De-duplication occurs by immutable UsageRecord/provider-attempt identity, never by similar copy, timestamps, display name, or price.

When the Usage page, room, widget, rail, inspector, or undocked view is hidden/off-screen/collapsed, it suppresses paint, animation clocks, chart/layout work, eager raw-payload dereference, and high-volume hydration. Durable provider work, operational work, UsageRecord settlement, owner subscriptions, receipts, alerts, and terminal transitions continue. Returning visibility rehydrates the current generation; it does not replay every hidden paint frame or mint new Usage/operational records.

Under the shared low-resource profile, Usage stops prefetch, reduces background refresh concurrency, shrinks bounded chart/detail caches, closes idle raw-payload readers, and keeps compact summaries. It does not drop failed/superseded attempts, hide spend or quota risk, change settlement, omit required provider attempts, fabricate zeroes, or weaken refresh currentness.

### Authentication, provider-rate, quota, and public-ingress separation

Authentication readiness, provider rate-limit/cooldown state, plan allowance/quota state, runtime resource admission, and public endpoint admission are separate axes. A provider `authentication_required` state cannot be relabeled `rate_limited`; a provider rate reset cannot be inferred from plan quota; and an application public-ingress rate rejection cannot be projected as provider quota or billed Usage.

Rejected unauthenticated or rate-limited public ingress receives only the bounded redacted operational attribution ref from `PublicIngressGateDecision`. Usage exposes no raw endpoint, credential, cookie, secret-store key, internal socket, private path, or protected `AuthBrowserSession` detail. It never creates a UsageRecord for traffic rejected before model dispatch.

### Forward and reverse coverage

| Usage projection | Owner input | Reverse proof |
|---|---|---|
| pending action shell | exact command ID and `CommandOutcomeRecord` | one dispatch, same-frame IDs when claimed, stable command instance, rollback/result receipt |
| attempt/work state | `ObservableWorkRecord` plus immutable UsageRecord | separate lifecycle and accounting axes, typed wait reason, freshness, provider-attempt dedupe |
| resource wait | `GovernorDecisionRecord` | requested/effective budget refs, decision/reason, reevaluation, no token/cost fabrication |
| long list/widget detail | `FullThreadProjectionRecord` | stable IDs, bounded window/overscan, generation, stale-result rejection, accessible retained labels |
| reconnect/restart/sleep/external return | `ContinuityRecord` and UsageRecord identity | same logical operation, new attempt only when real, no replay/projector double count |
| public auth/rate rejection | `PublicIngressGateDecision` | pre-hydration owner gate, bounded redaction, operational-only attribution, null UsageRecord ref |

ContractRef: ContractName:Plans/Shared_Integration_Runtime.md, SchemaID:pm.full_thread_runtime.contracts.v1, SchemaID:pm.usage_record.v1

### UF-097 - Full-Thread Usage Projection And Attempt Continuity

```yaml
plan_unit_id: UF-097
unit_type: requirement
status: accepted
owner_doc: Plans/usage-feature.md
canonical_text: >-
  Usage consumes separate governor, command-outcome, and ObservableWork axes, preserves every retained
  work state, virtualizes bounded stable-ID projections, rejects stale generations, suppresses hidden-surface
  paint without cancelling durable work, and deduplicates reconnect/restart/sleep/external-return continuity
  by immutable operation and provider-attempt identity.
gui_related: true
gui_classification_reason: Pending shells, work states, waits, lists, hidden widgets, and continuity are visible Usage behavior.
depends_on: [SIR-015, UF-085, UF-090, UF-091, UF-092, UF-093]
unblocks: [UF-098]
acceptance_criteria:
  - Admission, command acknowledgement, work lifecycle, provider attempt, and settlement remain independently visible and joinable.
  - All retained work states render precise human copy, and testing-route or migrating-route never implies successful proof.
  - Usage long lists are stable-ID, bounded, virtualized, narrow-delta projections with stale-generation rejection.
  - Hidden paint and hydration suppression never cancels work, loses accounting/alerts/receipts, or changes settlement.
  - Reconnect, restart, sleep, external return, replay, and projector overlap cannot double-count one provider attempt.
validation_surfaces: [Plans/full_thread_runtime_contract_fixtures.json, future Usage virtualization, acknowledgement rollback, stale-generation, continuity, and low-resource fixtures]
risk_class: usage_runtime_axis_or_attempt_double_count
reasoning_tier: high
context_scope: usage_full_thread_projection_continuity
implementation_surfaces: [Plans/usage-feature.md]
node_compile_hint: {mode: usage_full_thread_projection_continuity, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - PM_Full_Thread_Performance_Plans_PMConcept_Implementation_Packet_2026-08-08/02_FINAL_DECISION_REGISTER.md
  - PM_Full_Thread_Performance_Plans_PMConcept_Implementation_Packet_2026-08-08/04_DATA_CONTRACTS_AND_STATE_MACHINES.md
  - PM_Full_Thread_Performance_Plans_PMConcept_Implementation_Packet_2026-08-08/08_ACCEPTANCE_TEST_AND_FAILURE_MATRIX.md
preserved_exact_tokens: [accepted, queued, starting, running, waiting, retrying, reconnecting, backgrounded, degraded, stalled, committing, verifying, testing-route, migrating-route, rolling-back, completed, failed, cancelled, recovery-required]
negative_constraints:
  - Do not treat RuntimeResourceGovernor, command acknowledgement, or ObservableWork as token, cost, quota, or settlement authority.
  - Do not cancel durable work because a Usage surface is hidden or a projection request is superseded.
  - Do not deduplicate genuinely distinct provider attempts or double-count replay/projector duplicates.
```

### UF-098 - Public Gate, Authentication, Rate, And Quota Separation

```yaml
plan_unit_id: UF-098
unit_type: security_contract
status: accepted
owner_doc: Plans/usage-feature.md
canonical_text: >-
  Usage keeps provider authentication, provider rate/cooldown, plan quota/allowance, runtime admission,
  and application public-ingress admission separate; pre-dispatch public rejection is redacted operational
  attribution only and never creates billed Usage.
gui_related: true
gui_classification_reason: Authentication, rate, quota, and blocked-operation explanations are user-visible Usage and limits states.
depends_on: [SIR-016, UF-083, UF-085, UF-092, UF-097]
unblocks: []
acceptance_criteria:
  - Provider authentication is not rendered as rate limiting and provider rate evidence is not inferred from plan quota.
  - Public-ingress rate/auth rejection is never rendered as provider quota, provider attempt, token usage, or billed cost.
  - Rejection detail is bounded and redacted and exposes no protected browser, credential, cookie, internal socket, private path, or raw endpoint secret.
validation_surfaces: [Plans/full_thread_runtime_contract_fixtures.json, future auth/rate/quota axis and pre-dispatch rejection Usage fixtures]
risk_class: usage_auth_rate_quota_conflation
reasoning_tier: high
context_scope: usage_public_gate_auth_rate_quota
implementation_surfaces: [Plans/usage-feature.md]
node_compile_hint: {mode: usage_public_gate_auth_rate_quota, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - PM_Full_Thread_Performance_Plans_PMConcept_Implementation_Packet_2026-08-08/02_FINAL_DECISION_REGISTER.md
negative_constraints:
  - Do not create UsageRecord rows for traffic rejected before model dispatch.
  - Do not expose AuthBrowserSession or secret-bearing public-ingress evidence.
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
