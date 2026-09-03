# Shard 045: Touch Closure Registry Boundary Addendum - 2026-09-01

Source: `Plans/Contracts_V0.md`

Source lines: L21109-L21167

Source SHA256: `a3be47f5e955848bc80a0e5e520138bac0c9a225986aba2f30e79c0b74641810`

---

## Touch Closure Registry Boundary Addendum - 2026-09-01

### CV-326 - Touch Closure Registry And Static Production-Intent Boundary

```yaml
plan_unit_id: CV-326
unit_type: schema_contract
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  Plans/touch_closure.json with Plans/touch_closure.schema.json is the exact-key
  machine crosswalk for touched requirements, owners, PlanUnits, commands or typed
  local actions, contracts, sole future handlers, static production-intent wiring,
  reverse GUI consumers, persistence, tests, evidence classes, dispositions, and
  residual risks. Plans/server_command_gap_adjudication.json with its schema is the
  frozen 171-row compatibility and materialization registry that feeds that
  crosswalk. These registries consume owner contracts; they do not own payloads,
  create handlers, register commands, admit EventRecord families, or prove running
  production behavior. expected_event_types=[] and receipt/projection-only rows are
  explicit non-admission of event types, not incomplete event declarations.
gui_related: true
gui_classification_reason: The registry records GUI trigger, disabled-state, return-route, and reverse-consumer contract pointers without owning their presentation.
split_recommended: false
depends_on: [CV-325, C-051, DR-041, CS-074, WM-051, SIR-031, RAS-013]
unblocks: [0PI-068, ATS-042]
acceptance_criteria:
  - "Both registries validate against closed Draft 2020-12 schemas and retain exact content-addressed custody where frozen."
  - "Every schema_ref resolves to an owner definition; compatibility aliases use owner $ref composition rather than copied state machines."
  - "expected_event_types=[] means the action is event-silent under current Event Authority, and no receipt or projection name is promoted into an EventRecord family."
  - "A production-intent or future-handler row remains static canonical planning data and cannot be cited as native handler, running service, browser, visual, motion, accessibility, performance, security, recovery, readiness, or Slint proof."
  - "The dedicated server-gap and Touch Closure validators remain separately callable and part of both aggregate governance gates."
validation_surfaces:
  - python3 scripts/pm-server-command-gap-verify.py --json
  - python3 scripts/pm-touch-closure-verify.py --json
  - python3 scripts/pm-plans-verify.py validate-server-command-gap
  - python3 scripts/pm-plans-verify.py validate-touch-closure
  - python3 scripts/pm-plan-index.py validate
risk_class: static_registry_promoted_to_runtime_or_event_authority
reasoning_tier: high
context_scope: touch_closure_registry_contract_boundary
implementation_surfaces:
  - Plans/Contracts_V0.md
  - Plans/touch_closure.json
  - Plans/touch_closure.schema.json
  - Plans/server_command_gap_adjudication.json
  - Plans/server_command_gap_adjudication.schema.json
  - Plans/Wiring_Matrix.production.json
node_compile_hint: {mode: static_registry_contract_only, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - Plans/Crosswalk.md#c-051---touch-closure-authority-and-consumer-routing
  - Plans/DRY_Rules.md#dr-041---touch-closure-exact-key-and-no-peer-dry-rule
  - Plans/Commands_System.md#cs-074---remaining-packet-command-production-intent-and-sole-future-handler-closure
preserved_exact_tokens: [touch_closure.json, server_command_gap_adjudication.json, expected_event_types, production-intent, future-handler, static]
negative_constraints:
  - "Do not treat either registry as a payload, runtime, command, handler, persistence, evidence, or Event Authority owner."
  - "Do not infer an EventRecord family from a receipt, projection, status, or ObservableWork field."
  - "Do not replace owner schemas with copied definitions inside either registry."
owner_hints: [Plans/Contracts_V0.md, Plans/Crosswalk.md, Plans/DRY_Rules.md, Plans/Commands_System.md, Plans/Wiring_Matrix.md]
```
