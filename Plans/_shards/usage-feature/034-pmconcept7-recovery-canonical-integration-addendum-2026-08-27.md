# Shard 034: PMConcept7 Recovery Canonical Integration Addendum - 2026-08-27

Source: `Plans/usage-feature.md`

Source lines: L6420-L6529

Source SHA256: `b992d366f78133b51691900eac1e8a6e32e7b48648348bd6984c1acc2ab781d1`

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
  `Host/Environment`, preserves operation and continuation identity, and reuses `cmd.settings.open` with
  `target_type=setting` and `setting_id=ai.accounts.provider-connections`. UF-090, UF-092, and CBP-028 remain the policy
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
  - Provider setup absence renders the exact `Provider Setup Required` state with explicit `Host/Environment` and preserved operation and continuation identity; its CTA reuses `cmd.settings.open` with `target_type=setting` and `setting_id=ai.accounts.provider-connections`, mints no new setup command, keeps installation and authentication separate, performs no automatic acquisition or silent reroute, and leaves UF-090, UF-092, and CBP-028 as the underlying policy owners.
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
  - cmd.settings.open
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
