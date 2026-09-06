# Shard 018: Settings command and route-only action wiring addendum - 2026-08-31

Source: `Plans/UI_Wiring_Rules.md`

Source lines: L893-L958

Source SHA256: `b0c77ecbeb53ef195661544a2bf03d3adc352ca3524d3ccee5e53c5d101ce5d8`

---

## Settings command and route-only action wiring addendum - 2026-08-31

Settings wiring has exactly five canonical commands and five specialized route-only UI actions. `Plans/Settings_System.md` owns target, mutation, export, and exact-return semantics; `Plans/Commands_System.md` owns central command-family registration; this document owns the UI action-to-command boundary. A handler-location string is a required sole destination, not evidence that the dispatcher or handler exists. Until native executable evidence observes that path, the action remains unavailable with `handler_unavailable` or another exact Settings-owned disabled reason.

| canonical command | Settings semantic owner | UI action boundary | result/return boundary |
|---|---|---|---|
| `cmd.settings.open` | `Plans/Settings_System.md` SSYS-018/SSYS-019 | Dispatch exactly once for one stable `setting_id` or one `manager_id` plus optional `detail_id`; never route by label, search text, or presentation selector. | `pm.settings_route_request.v1` -> `pm.settings_route_return.v1`; restores the opener only when route, continuation, context, and generations remain current; writes no setting value. |
| `cmd.settings.transaction.preview` | `Plans/Settings_System.md` SSYS-007/SSYS-009/SSYS-018 | Resolve one immutable exact-ID proposal. Preview/cancel is not apply and dispatches no owner mutation. | `pm.settings_transaction_preview_request.v1` -> `pm.settings_transaction_preview.v1`; no write and no domain event. |
| `cmd.settings.transaction.apply` | `Plans/Settings_System.md` SSYS-009/SSYS-018 | Dispatch only from the matching current preview with expected Project revision, preview generation/hash, permission, and idempotency identity. | `pm.settings_transaction_apply_request.v1` -> `pm.settings_transaction_result.v1`; terminal UI requires owner readback/receipt, not acknowledgement. |
| `cmd.settings.transaction.rollback` | `Plans/Settings_System.md` SSYS-009/SSYS-018 | Dispatch only for one eligible transaction and rollback token after required confirmation; stale, expired, or already-used recovery dispatches nothing. | `pm.settings_transaction_rollback_request.v1` -> `pm.settings_transaction_result.v1`; failed readback remains failed or recovery-required. |
| `cmd.settings.export` | `Plans/Settings_System.md` SSYS-008/SSYS-018/SSYS-021 | Dispatch one detached exact-ID export under FileSafe/permission policy; credential and protected-session bytes are excluded. | `pm.settings_export_request.v1` -> `pm.settings_export_manifest.v1`; changes no setting value and returns only non-secret artifact/receipt identity. |

| route-only ui_action_id | exact `cmd.settings.open` target | retained owner/action boundary | exact return boundary |
|---|---|---|---|
| `settings.onboarding.open` | `manager_id=onboarding-guided-tour`, `detail_id=overview` | Opens the Settings dependency/entry projection. Product Onboarding remains owned by Planning Wizard/its retained owners; this action starts no onboarding run. | `pm.settings_route_return.v1`; current origin context/focus only. |
| `settings.onboarding.run_again` | `manager_id=onboarding-guided-tour`, `detail_id=run-onboarding-again` | Opens the owner-routed run-again choice. It does not itself restart, reset, or mutate Onboarding. | `pm.settings_route_return.v1`; current origin context/focus only. |
| `settings.guided_tour.replay` | `manager_id=onboarding-guided-tour`, `detail_id=replay-guided-tour` | Opens the retained Guided Tour owner route. It does not itself replay or persist tour state. | `pm.settings_route_return.v1`; current origin context/focus only. |
| `settings.doctor.open` | `manager_id=doctor`, `detail_id=overview` | Opens the cached/currentness-labelled Doctor projection. Doctor and domain owners retain checks; no probe runs. | `pm.settings_route_return.v1`; current origin context/focus only. |
| `settings.doctor.remediation.open` | `manager_id=doctor`, `detail_id=check:{check_id}` | Opens one exact owner remediation route. It does not execute a probe, repair, permission change, install, or mutation. | `pm.settings_route_return.v1`; current origin context/focus only. |

Each route-only action carries `effect=route_only` and `owner_operation_authorized=false`. All ten rows require stable role/name, keyboard and pointer parity, current availability and disabled-reason projection, one dispatch at most, deterministic focus return, stale-generation rejection, and a bounded receipt/result assertion with no unexpected persisted EventRecord. A disabled action dispatches zero commands. Concept simulation remains simulation and earns no handler or native-wiring credit.

ContractRef: ContractName:Plans/Settings_System.md#SSYS-018, ContractName:Plans/Settings_System.md#SSYS-019, ContractName:Plans/Commands_System.md#CS-069, ContractName:Plans/settings_system_contract_fixtures.json, ContractName:Plans/Wiring_Matrix.production.json

### UIW-014 - Complete Settings Command And Route-Only Wiring Family

```yaml
plan_unit_id: UIW-014
unit_type: wiring_contract
status: accepted
owner_doc: Plans/UI_Wiring_Rules.md
canonical_text: >-
  The Settings UI exposes exactly five canonical command boundaries and five route-only Onboarding, Guided Tour,
  and Doctor actions. Every row binds one Settings-owned target, one central command, one request/result or exact-return
  contract, one availability/disabled projection, deterministic focus return, and no fabricated owner operation,
  EventRecord, dispatcher, or handler claim.
gui_related: true
gui_classification_reason: The unit governs visible Settings activation, disabled state, route destinations, transaction outcomes, accessibility, and exact focus return.
depends_on: [CS-069, SSYS-018, SSYS-019, SSYS-022, UIW-013]
unblocks: []
acceptance_criteria:
  - The command census is exactly cmd.settings.open, cmd.settings.transaction.preview, cmd.settings.transaction.apply, cmd.settings.transaction.rollback, and cmd.settings.export with their Settings-owned request/result pairs.
  - The route-only census is exactly settings.onboarding.open, settings.onboarding.run_again, settings.guided_tour.replay, settings.doctor.open, and settings.doctor.remediation.open, each dispatching cmd.settings.open with its frozen manager/detail target.
  - All open and specialized route actions return through the one canonical pm.settings_route_return.v1 contract.
  - Route-only actions authorize no Onboarding run, Guided Tour replay, Doctor probe, or remediation operation; disabled actions dispatch nothing.
  - Declared handler destinations, schemas, production-intent rows, and concept simulation do not prove executable handlers or native wiring.
  - Pointer/keyboard parity, accessibility, focus return, stale rejection, exact dispatch count, receipt/result, and no-unregistered-event behavior are required before production credit.
validation_surfaces: [Plans/settings_system_contract_fixtures.json, Plans/Wiring_Matrix.production.json, future Settings ten-row command/action census, handler-absence, stale-return, accessibility, and no-unregistered-event fixtures]
risk_class: settings_ui_action_owner_or_return_drift
reasoning_tier: high
context_scope: settings_commands_and_route_only_actions
implementation_surfaces: [Plans/UI_Wiring_Rules.md, Plans/Commands_System.md, Plans/Settings_System.md, Plans/settings_system_contract_fixtures.json, Plans/Wiring_Matrix.production.json]
node_compile_hint: {mode: settings_command_and_route_only_wiring, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - Plans/Settings_System.md#SSYS-018
  - Plans/Settings_System.md#SSYS-019
  - Plans/Settings_System.md#SSYS-022
  - source_ref:chat:settings-reference-review-canon-closure-2026-08-31
preserved_exact_tokens: [cmd.settings.open, cmd.settings.transaction.preview, cmd.settings.transaction.apply, cmd.settings.transaction.rollback, cmd.settings.export, settings.onboarding.open, settings.onboarding.run_again, settings.guided_tour.replay, settings.doctor.open, settings.doctor.remediation.open, pm.settings_route_return.v1, owner_operation_authorized=false]
negative_constraints:
  - Do not mint a command or alias for a route-only UI action.
  - Do not execute Onboarding, Guided Tour, Doctor probe, or remediation work from a Settings route action.
  - Do not claim a runtime handler from a declared handler path, schema, static wiring row, or concept simulation.
  - Do not emit or infer an unregistered EventRecord.
owner_hints: [Plans/UI_Wiring_Rules.md, Plans/Commands_System.md, Plans/Settings_System.md, Plans/Wiring_Matrix.production.json]
```
