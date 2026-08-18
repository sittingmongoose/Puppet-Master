# Shard 025: u11 Prism II Usage Command Family Addendum - 2026-08-18

Source: `Plans/Commands_System.md`

Source lines: L4729-L4802

Source SHA256: `f1c8531358918d5788c18d3a0f0c407701b78f97c679da3fbbaa5dbbf2cd9aa9`

---

## u11 Prism II Usage Command Family Addendum - 2026-08-18

This addendum records the family semantics for the one new Usage command the u11 Prism II concept
establishes, and the boundary that keeps the rest of the page command-free. Catalog registration is owned by
`Plans/UI_Command_Catalog.md` (UCC-146) and wiring obligations by `Plans/Wiring_Matrix.md` (WM-044). It
creates no WorkNodes, NodeSeeds, executable queues, implementation files, runtime artifacts, generated
wiring rows, production build tasks, final manifests, or PNC-019 receipts.

### CS-067 - Usage Forecast Command Family And View-Local Boundary

```yaml
plan_unit_id: CS-067
unit_type: requirement
status: accepted
owner_doc: Plans/Commands_System.md
canonical_text: >-
  cmd.usage.forecast.request is one new canonical Usage command carried by the CS-066 shared command
  envelope: typed request and typed result, CAS and idempotency with restart-safe replay, projected
  availability, a closed disabled-reason set, and an effect that stays receipt or projection only with
  event_effect none_pending_event_authority while the Event Authority denominator remains UNKNOWN_OPEN. It
  requests a labelled projection for the current scope and window and returns neither a quota run-out date
  nor a countdown. Everything else on the Usage page either stays view-local or reuses an existing owner's
  command: disclosure level, page scope, date range, and per-widget filters are view state and dispatch no
  command; a page-scope pick is never an account switch and must not dispatch the account profile selection
  command; every persisted widget layout mutation dispatches the existing widget command family rather than
  writing layout storage directly; a usage-subject open dispatches the existing usage-subject navigation
  command; and a Settings change dispatches cmd.settings.bloom.open against the canonical Settings
  destination identity.
gui_related: true
gui_classification_reason: The family decides which Usage affordances dispatch a command, what their disabled and busy announcements say, and which affordances are view-local.
depends_on: [CS-066, UF-092]
unblocks: []
acceptance_criteria:
  - cmd.usage.forecast.request carries a typed request and result reference, a state selector, a closed disabled-reason set, one sole handler, CAS and idempotency, and restart-safe replay under the CS-066 envelope.
  - Its effect is receipt or projection only and carries the missing-event-registration disposition; it names no event family while the Event Authority denominator remains UNKNOWN_OPEN.
  - A forecast result is a labelled projection and is never presented as a quota run-out date or a countdown.
  - Disclosure, scope, range, and filter selections dispatch no command, and a page-scope pick never dispatches the account profile selection command.
  - A persisted Usage widget layout mutation dispatches the existing widget command family with a layout revision expectation and an idempotency key rather than writing layout storage directly.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-plans-verify.py validate-wiring-matrix
  - future Usage command dispatcher, replay, and disabled-reason fixtures
risk_class: usage_command_surface_drift
reasoning_tier: high
context_scope: usage_command_family
implementation_surfaces:
  - Plans/Commands_System.md
  - Plans/UI_Command_Catalog.md
  - Plans/Wiring_Matrix.md
  - Plans/usage-feature.md
node_compile_hint:
  mode: usage_forecast_command_family
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Concepts/usage-concepts/QwenUsageConcept/u11-prism.html (u11 Prism II Usage concept; source-lineage-only)"
  - Concepts/usage-concepts/PM_Usage_Independent_Audit_2026-08-17/handoff/PORT_HANDOFF_PLANS_ROUTE.md
  - Concepts/usage-concepts/PM_Usage_Independent_Audit_2026-08-17/handoff/HANDOFF_CORRECTIONS.md
preserved_exact_tokens:
  - cmd.usage.forecast.request
  - cmd.settings.bloom.open
  - none_pending_event_authority
  - missing_event_registration
  - UNKNOWN_OPEN
negative_constraints:
  - Do not name or emit an event family for this command while the Event Authority denominator remains UNKNOWN_OPEN.
  - Do not present a forecast as a quota run-out date or a countdown.
  - Do not promote a view-local disclosure, scope, range, or filter selection into a command.
  - Do not dispatch the account profile selection command for a read-only view-scope change.
owner_hints:
  - Plans/Commands_System.md
  - Plans/UI_Command_Catalog.md
  - Plans/usage-feature.md
```
