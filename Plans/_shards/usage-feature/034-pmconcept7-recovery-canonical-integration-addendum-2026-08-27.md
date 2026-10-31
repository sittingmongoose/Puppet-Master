# Shard 034: PMConcept7 Recovery Canonical Integration Addendum - 2026-08-27

Source: `Plans/usage-feature.md`

Source lines: L6438-L6570

Source SHA256: `4011108e61761eeefb30d658440e0a7b416d84499acdb8888bce75a60fd45471`

---

## PMConcept7 Recovery Canonical Integration Addendum - 2026-08-27

This addendum integrates the recovered PMConcept7 Usage workspace into the current Usage owner without
disturbing the 2026-08-18 Usage accounting, disclosure, or policy-boundary canon above.
`Concepts/PMConcept7.html` illustrates this behavior and is never an authored product or command owner.
The current repo-local audit status is
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
  and `Diagnostics`. Disclosure changes the mounted card set and the useful facts inside eligible cards; it
  is not decorative copy and it never deletes a widget instance or stored layout. Source authority mounts 7, 8 and 9
  cards at those three disclosure levels in the redesign's default boards, each deeper level mounting at least the
  shallower set (amended 2026-10-17, DL-228; it read: exactly 4, 6, and 8, the replaced page's count), and all thirteen
  rooms remain reachable at every supported physical viewport width by scrolling the rail of rooms, which keeps no
  overflow surface (amended 2026-10-17, DL-228; it read: even when the secondary rail collapses into an overflow
  surface). Active room, scope, date
  range, disclosure level, the expanded-room rail state, and the Live / Paused choice (UF-107) are local view
  projections unless an existing canonical command owner explicitly requires a command; changing them does not
  justify a new command family.
  Usage refresh and object-backed Usage/Ledger drill-through continue through their existing authorities. A
  PMConcept7 Ledger attempt row dispatches `cmd.nav.open_usage_subject` only with stable `attempt_id` and
  `usage_event_ref`, normalizes to `route_target.object_kind = usage_attempt` plus `object_id = attempt_id`, keeps
  the event/provider/account/runtime refs as correlation, and carries no `OpenSubject`; event-primary callers
  retain `usage_event` plus `usage_event_ref`, while aggregate provider/account/panel details remain local inspectors and dispatch no
  command, receipt, or domain event. The Accounts room acts in place through explicit controls on its cards, never
  through the card itself (UF-107, DL-174): an account's "Use this account" control dispatches the existing
  `cmd.account.select_profile` as a labelled override and shows only where the provider's capability
  `supports_manual_set_active` is true, a provider's Auto-switch toggle and switch level are bound Settings
  controls that commit through `cmd.settings.transaction.preview` and `cmd.settings.transaction.apply` with
  `scope=provider`, and each account's own switch level is one that commits through the same pair with
  `scope=account` (D43, 2026-10-10). Opening a card's Details stays a local inspector. When a selected provider
  route cannot run because setup is absent, the exact state is `Provider Setup Required`; it shows explicit
  `Host/Environment`, preserves operation and continuation identity, and reuses `cmd.settings.open` with
  `target_type=setting` and `setting_id=ai.accounts.provider-connections`. UF-090, UF-092, and CBP-028 remain the policy
  owners: installation and authentication stay separate, and Usage neither starts an automatic acquisition nor
  silently reroutes the request.
  Amended 2026-10-17 (DL-228): the expanded-room rail state is retired with the overflow surface: the
  redesigned rail scrolls and nothing sets `more`, so a stored value is ignored on read (UF-095, SP-248).
  Details opens Curated by default and Raw shows every field as recorded, credential handles masked ("Every
  field as recorded. Credential handles are masked."; F3-514's Raw and Curated redaction); the choice is view
  state; focus moves into Details on opening and returns to the opening control on Close details or Escape;
  its Ledger attempt drill-through stays as above.
  Amended 2026-10-17 (DL-230, Jared): a Usage widget is a card everywhere, so this unit's mounted card set,
  eligible cards and the cards each level mounts read "panel" before (G-030).
gui_related: true
gui_classification_reason: This unit defines the visible Usage room taxonomy, disclosure labels, and view-state behavior.
depends_on: [CBP-028, UF-044, UF-055, UF-090, UF-092, WS-016]
unblocks: [UF-094, UF-095, UF-096, UF-107]
acceptance_criteria:
  - All thirteen named rooms are addressable in the Usage workspace at every supported physical viewport width by scrolling the rail of rooms (amended 2026-10-17, DL-228: no overflow surface), and each renders its room-specific card catalog at the current disclosure level (amended 2026-10-17, DL-230, a Usage widget is a card; earlier panel catalog).
  - The only user-facing disclosure labels are At a glance, Detailed, and Diagnostics; Essen, Std, Adv, essentials, standard, and advanced are not disclosure labels.
  - Switching disclosure materially changes mounted card types or content facts, Source authority mounts 7/8/9 cards for At a glance/Detailed/Diagnostics (amended 2026-10-17, DL-228; earlier 4/6/8; DL-230, earlier panels), a room whose cards are all At a glance (Attention, Prompt cache, Signals) changes content facts rather than the mounted set, and no disclosure switch deletes an existing widget instance or stored layout.
  - Active room, scope, date range, disclosure, expanded-room rail state, and the Live / Paused choice remain local projection actions unless an existing owner requires otherwise; no duplicate command family is introduced, Usage refresh retains its authority, and a PMConcept7 Ledger attempt row dispatches cmd.nav.open_usage_subject as a usage_attempt/attempt_id object route without OpenSubject while retaining usage_event_ref as correlation; event-primary callers retain usage_event/usage_event_ref, and aggregate provider, account, and panel cards open local inspectors without a route command, command receipt, or domain event.
  - In the Accounts room, "Use this account" dispatches cmd.account.select_profile only where supports_manual_set_active is true, and a provider's Auto-switch toggle and switch level (scope=provider) and each account's own switch level (scope=account, D43 2026-10-10) dispatch cmd.settings.transaction.preview then cmd.settings.transaction.apply on the Settings rows, show the same value Settings shows, and keep no Usage copy; opening a card or its Details still dispatches no command.
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
  - "Concepts/pm7-tools/base/PM7-base.html (historical PM7 prototype lineage only)"
  - "Concepts/pm7-tools/build_pm7.py (historical PM7 prototype lineage only)"
  - "Concepts/PMConcept7.html (look-and-behaviour reference only)"
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
  - "Use this account"
  - cmd.account.select_profile
  - supports_manual_set_active
  - scope=provider
negative_constraints:
  - Do not expose Essen, Std, Adv, essentials, standard, or advanced as user-facing disclosure labels.
  - Do not mint commands merely to persist local room, scope, date-range, disclosure, expanded-rail, or Live / Paused projection state.
  - Do not give an Accounts card a Usage-local copy of an auto-switch value or a Usage-only switch command; the card's in-place controls are the existing account command and the Settings owner's transaction.
  - Do not route aggregate provider/account/panel cards, copy a presentation card ID into route_target.object_id, attach OpenSubject to either typed cmd.nav.open_usage_subject selector branch, or use usage_event_ref as the primary object_id of a PMConcept7 Ledger attempt row.
  - Do not treat the protected generated artifact or in-progress audit work as passed executable acceptance evidence.
  - Do not bundle installation with authentication, start automatic acquisition, or silently reroute a setup-blocked request.
owner_hints:
  - Plans/usage-feature.md
  - Plans/Widget_System.md
```
