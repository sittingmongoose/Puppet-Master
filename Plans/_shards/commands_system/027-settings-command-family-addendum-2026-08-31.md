# Shard 027: Settings Command Family Addendum - 2026-08-31

Source: `Plans/Commands_System.md`

Source lines: L4919-L4977

Source SHA256: `fda89aac8b3d6c391f15e7011082e08ccbe2db214c3b73b2dab1bf16d0f6194b`

---

## Settings Command Family Addendum - 2026-08-31

The Settings family contains exactly five canonical command IDs. `Plans/Settings_System.md` owns their semantics and `Plans/settings_system_contracts.schema.json` owns their machine request/result shapes; this document owns central family registration. A registered contract is not evidence that a native handler, dispatcher, persistence path, production GUI, or runtime result exists. Until the sole handler and dispatcher are observed, availability resolves through the Settings projection and may remain disabled with `handler_unavailable` or another exact Settings-owned reason.

| command_id | request_schema_ref | result_schema_ref | effect and owner boundary | executable status |
|---|---|---|---|---|
| `cmd.settings.open` | `Plans/settings_system_contracts.schema.json#/$defs/settings_route_request` (`pm.settings_route_request.v1`) | `Plans/settings_system_contracts.schema.json#/$defs/settings_route_return` (`pm.settings_route_return.v1`) | Opens exactly one stable setting or manager/detail target and preserves the Settings-owned exact return; writes no setting value. | Canonical command contract registered; `handlers::settings::open_route` is the sole declared destination, not a handler-existence claim. |
| `cmd.settings.transaction.preview` | `Plans/settings_system_contracts.schema.json#/$defs/settings_transaction_preview_request` (`pm.settings_transaction_preview_request.v1`) | `Plans/settings_system_contracts.schema.json#/$defs/settings_transaction_preview` (`pm.settings_transaction_preview.v1`) | Resolves one immutable exact-ID proposal under owner/currentness/permission checks and writes nothing. | Canonical command contract registered; `handlers::settings::transaction_preview` remains unproven until executable evidence exists. |
| `cmd.settings.transaction.apply` | `Plans/settings_system_contracts.schema.json#/$defs/settings_transaction_apply_request` (`pm.settings_transaction_apply_request.v1`) | `Plans/settings_system_contracts.schema.json#/$defs/settings_transaction_result` (`pm.settings_transaction_result.v1`) | Applies only the matching current preview under CAS/idempotency, owner readback, and rollback/recovery rules. | Canonical command contract registered; `handlers::settings::transaction_apply` remains unproven until executable evidence exists. |
| `cmd.settings.transaction.rollback` | `Plans/settings_system_contracts.schema.json#/$defs/settings_transaction_rollback_request` (`pm.settings_transaction_rollback_request.v1`) | `Plans/settings_system_contracts.schema.json#/$defs/settings_transaction_result` (`pm.settings_transaction_result.v1`) | Targets one eligible transaction/rollback token and reports recovery truth without fabricating restoration. | Canonical command contract registered; `handlers::settings::transaction_rollback` remains unproven until executable evidence exists. |
| `cmd.settings.export` | `Plans/settings_system_contracts.schema.json#/$defs/settings_export_request` (`pm.settings_export_request.v1`) | `Plans/settings_system_contracts.schema.json#/$defs/settings_export_manifest` (`pm.settings_export_manifest.v1`) | Produces a detached exact-ID non-secret export manifest; changes no Settings value and includes no credential material. | Canonical command contract registered; `handlers::settings::export` remains unproven until executable evidence exists. |

All five commands use the shared command identity, actor/permission, exact Project/topology context, expected revision or generation, idempotency, availability, disabled-reason, acknowledgement, and result boundaries required by their Settings schemas. `accepted` or `acknowledged` is not transaction completion. Settings registers no EventRecord family here; current wiring uses a bounded receipt/route/result disposition and must reject unexpected persisted events until Event Authority independently admits an owner family.

The route-only UI actions `settings.onboarding.open`, `settings.onboarding.run_again`, `settings.guided_tour.replay`, `settings.doctor.open`, and `settings.doctor.remediation.open` are not additional commands or aliases. They dispatch `cmd.settings.open` with the exact target frozen by Settings and cannot start Onboarding, replay a tour, run a Doctor probe, or perform remediation.

ContractRef: ContractName:Plans/Settings_System.md#SSYS-018, ContractName:Plans/Settings_System.md#SSYS-019, ContractName:Plans/settings_system_contracts.schema.json, ContractName:Plans/settings_system_contract_fixtures.json, ContractName:Plans/UI_Wiring_Rules.md

### CS-069 - Settings Command Family Registration

```yaml
plan_unit_id: CS-069
unit_type: command_contract
status: accepted
owner_doc: Plans/Commands_System.md
canonical_text: >-
  Exactly five canonical cmd.settings commands are centrally registered with the Settings-owned request/result,
  availability, disabled-reason, idempotency/currentness, receipt, and no-unregistered-event boundaries. The five
  Onboarding, Guided Tour, and Doctor UI actions remain route-only cmd.settings.open consumers. Declared handler
  destinations are contract targets and do not prove that a dispatcher or runtime handler exists.
gui_related: true
gui_classification_reason: The family governs Settings route, preview, apply, rollback, and export activation, disabled state, outcome, and exact return.
depends_on: [CS-066, SSYS-018, SSYS-019]
unblocks: [UIW-014]
acceptance_criteria:
  - The registered set is exactly cmd.settings.open, cmd.settings.transaction.preview, cmd.settings.transaction.apply, cmd.settings.transaction.rollback, and cmd.settings.export.
  - Every command preserves the exact request_schema_ref and result_schema_ref owned by Plans/settings_system_contracts.schema.json; cmd.settings.open returns pm.settings_route_return.v1.
  - Preview and open write no setting value; apply and rollback settle only through pm.settings_transaction_result.v1 with owner readback; export returns a non-secret pm.settings_export_manifest.v1.
  - The five route-only UI actions dispatch cmd.settings.open and authorize no Onboarding, Guided Tour, Doctor probe, or remediation operation.
  - Registration, a declared handler location, static wiring, schema validation, or a concept simulation is not runtime-handler evidence; handler_unavailable remains truthful until executable proof exists.
  - No unregistered EventRecord is emitted or inferred.
validation_surfaces: [Plans/settings_system_contract_fixtures.json, Plans/Wiring_Matrix.production.json, future Settings dispatcher, handler-absence, CAS, idempotency, restart, redaction, accessibility, and no-unregistered-event fixtures]
risk_class: settings_command_family_or_handler_claim_drift
reasoning_tier: high
context_scope: settings_command_family
implementation_surfaces: [Plans/Commands_System.md, Plans/Settings_System.md, Plans/settings_system_contracts.schema.json, Plans/settings_system_contract_fixtures.json, Plans/UI_Wiring_Rules.md, Plans/Wiring_Matrix.production.json]
node_compile_hint: {mode: settings_command_family_registration, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - Plans/Settings_System.md#SSYS-018
  - Plans/Settings_System.md#SSYS-019
  - source_ref:chat:settings-reference-review-canon-closure-2026-08-31
preserved_exact_tokens: [cmd.settings.open, cmd.settings.transaction.preview, cmd.settings.transaction.apply, cmd.settings.transaction.rollback, cmd.settings.export, pm.settings_route_return.v1, handler_unavailable]
negative_constraints:
  - Do not resurrect cmd.settings.bloom.open or mint route-only UI action commands.
  - Do not treat registration, a handler-location string, static wiring, or concept behavior as an executable handler claim.
  - Do not infer transaction completion from acceptance or acknowledgement.
  - Do not invent an EventRecord family.
owner_hints: [Plans/Commands_System.md, Plans/Settings_System.md, Plans/UI_Wiring_Rules.md, Plans/Wiring_Matrix.production.json]
```
