# Shard 026: Shared Connection Central-Route Binding Addendum - 2026-09-01

Source: `Plans/Shared_Integration_Runtime.md`

Source lines: L1497-L1527

Source SHA256: `68f490730360190a462e589a2e83adc0276929bc4a170d5a69b7be7d9f502852`

---

## Shared Connection Central-Route Binding Addendum - 2026-09-01

The central command/wiring closure assigns the six exact shared connection commands to one future `SharedConnectionProfileSupervisor` route each: `cmd.integration.connection.add` -> `handlers::integration_connection::add`, `.activate` -> `handlers::integration_connection::activate`, `.update` -> `handlers::integration_connection::update`, `.test` -> `handlers::integration_connection::test`, `.remove` -> `handlers::integration_connection::remove`, and `.open_details` -> `handlers::integration_connection::open_details`. Each consumes the existing `IntegrationConnectionCommandRequest|IntegrationConnectionCommandResult|IntegrationConnectionCommandError|IntegrationConnectionAvailability|SharedIntegrationPermissionDecision` family from `Plans/shared_integration_runtime.schema.json`. Provider-specific values remain typed data and no provider-specific peer handler is created. These are planned targets only; all six remain `handler_unavailable`, receipt-only/no-new-EventRecord, and unsupported by native execution evidence.

### SIR-029 - Shared Connection Sole Future Handlers

```yaml
plan_unit_id: SIR-029
unit_type: command_binding
status: accepted
owner_doc: Plans/Shared_Integration_Runtime.md
canonical_text: The six exact cmd.integration.connection commands each have one planned SharedConnectionProfileSupervisor handler target over the existing owner-DRY connection command family; provider-specific values remain typed data and static binding creates no native implementation.
gui_related: true
gui_classification_reason: Settings Integrations, Product Onboarding owner setup, Doctor, connection managers, detail views, and palette/API consumers expose these commands and their exact disabled reasons.
depends_on: [SIR-019, SIR-024, SIR-025, SIR-026]
unblocks: []
acceptance_criteria:
  - Central catalog and production-intent wiring use exactly handlers::integration_connection::add, activate, update, test, remove, and open_details with the existing request/result schema pointers.
  - Draft-create/add, activate, update, test, remove, and details retain their distinct closed mutations, permissions, generation fences, receipt/ObservableWork rules, and exact return settlement.
  - Missing executable Rust and provider-owner evidence keeps every command handler_unavailable and emits no unregistered EventRecord.
validation_surfaces: [Plans/shared_integration_runtime.schema.json, Plans/shared_integration_runtime_fixtures.json, Plans/Wiring_Matrix.production.json, Plans/touch_closure.json]
risk_class: shared_connection_route_split_or_phantom_handler
reasoning_tier: high
context_scope: shared_connection_central_binding
implementation_surfaces: [Plans/Shared_Integration_Runtime.md, Plans/Commands_System.md, Plans/UI_Command_Catalog.md, Plans/Wiring_Matrix.production.json]
node_compile_hint: {mode: command_binding_contract_only, create_worknodes: false, create_nodeseeds: false}
source_lineage: [source_ref:packet:PKT-04/04_COMMAND_EVENT_WIRING_REGISTER.md:387-391, source_ref:server-command-gap-adjudication:rows-23-30, source_ref:server-command-gap-adjudication:row-76, source_ref:server-command-gap-adjudication:rows-136-141, source_ref:server-command-gap-adjudication:rows-143-149, source_ref:server-command-gap-adjudication:row-153, source_report:scratchpad/pm-integration-20260831/authority-repairs/server-gap-adjudication/production-wiring-manifest/production-wiring-exact-map.json#repair_targets:cmd.integration.connection.*]
negative_constraints:
  - Do not create provider-specific peer common commands or handlers.
  - Do not treat planned handler paths as native, provider, network, authentication, or runtime proof.
```
