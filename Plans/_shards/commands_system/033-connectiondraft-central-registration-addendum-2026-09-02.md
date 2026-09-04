# Shard 033: ConnectionDraft Central Registration Addendum - 2026-09-02

Source: `Plans/Commands_System.md`

Source lines: L5710-L5762

Source SHA256: `fda89aac8b3d6c391f15e7011082e08ccbe2db214c3b73b2dab1bf16d0f6194b`

---

## ConnectionDraft Central Registration Addendum - 2026-09-02

`cmd.integration.connection.activate` is the one new primary command needed to close the packet ConnectionDraft lifecycle. It joins the existing `cmd.integration.connection.add|update|test|remove|open_details` family and maps only to `handlers::integration_connection::activate`. Its exact request, result, error, availability, and permission contracts are `Plans/shared_integration_runtime.schema.json#/$defs/IntegrationConnectionCommandRequest`, `#/$defs/IntegrationConnectionCommandResult`, `#/$defs/IntegrationConnectionCommandError`, `#/$defs/IntegrationConnectionAvailability`, and `#/$defs/SharedIntegrationPermissionDecision`. The owner is `Plans/Shared_Integration_Runtime.md#SIR-035`; the persistence owner is `IntegrationConnectionRegistry`.

The six packet candidates normalize before schema, capability/currentness, permission, policy, dispatch, receipt, event, or persistence handling:

| Source candidate | Canonical command | Sole future target | Source disposition |
|---|---|---|---|
| `cmd.connection.draft.create` | `cmd.integration.connection.add` | `handlers::integration_connection::add` | ACT-148 compatibility input; source unregistered; canonical add persists inactive draft |
| `cmd.connection.activate` | `cmd.integration.connection.activate` | `handlers::integration_connection::activate` | ACT-149 compatibility input; source unregistered |
| `cmd.connection.update` | `cmd.integration.connection.update` | `handlers::integration_connection::update` | ACT-150 compatibility input; source unregistered |
| `cmd.connection.test` | `cmd.integration.connection.test` | `handlers::integration_connection::test` | ACT-151 compatibility input; source unregistered |
| `cmd.connection.remove` | `cmd.integration.connection.remove` | `handlers::integration_connection::remove` | ACT-152 compatibility input; source unregistered |
| `cmd.connection.open_details` | `cmd.integration.connection.open_details` | `handlers::integration_connection::open_details` | ACT-153 compatibility input for persisted connection; source unregistered |

`cmd.connection.draft.open_details` is not a command or alias. Its current identity is the owner-local `ui.integration.connection.draft.open_details` action from SIR-035, with no domain handler, command registration, persistence mutation, EventRecord, or production-wiring command row.

All six canonical command targets remain `handler_unavailable`. Static owner contracts, registration prose, catalog metadata, and production-intent wiring are not dispatcher or native handler proof. Effects remain owner result/receipt/projection only with `expected_event_types=[]`; no protected-auth material, capability success, persistence success, provider call, or runtime readiness is inferred.

### CS-075 - ConnectionDraft Activation Registration And Candidate Normalization

```yaml
plan_unit_id: CS-075
unit_type: command_registry
status: accepted
owner_doc: Plans/Commands_System.md
canonical_text: >-
  The central registry adds only cmd.integration.connection.activate to the existing six-command IntegrationConnectionRegistry family; ACT-148..153 source spellings normalize before all gates to the six canonical commands, receive no peer handler or persistence identity, and draft-only details remain a typed owner-local action.
gui_related: true
gui_classification_reason: Settings integration/destination rows, Product Onboarding, Doctor, connection managers, and palette/API expose activation and the existing lifecycle commands through typed availability.
depends_on: [CS-073, SIR-035]
unblocks: [UCC-153]
acceptance_criteria:
  - cmd.integration.connection.activate appears once as a primary command and maps only to handlers::integration_connection::activate with the SIR-035 request/result/error/availability/permission family.
  - ACT-148..153 source spellings normalize one-to-one before capability/currentness, permission, policy, validation, dispatch, receipt, event, or persistence handling and never receive peer handlers.
  - cmd.integration.connection.add is the canonical inactive-draft creation route; activation remains a separate expected-generation mutation with verified capability evidence.
  - cmd.connection.draft.open_details and ui.integration.connection.draft.open_details receive no command registration or domain handler.
  - All six canonical routes remain handler_unavailable and event-silent with "expected_event_types=[]" until executable proof and Event Authority exist.
validation_surfaces: [Plans/shared_integration_runtime.schema.json, Plans/shared_integration_runtime_fixtures.json, Plans/UI_Command_Catalog.md, Plans/Wiring_Matrix.production.json, python3 scripts/pm-new-contracts-verify.py, python3 scripts/pm-plans-verify.py validate-wiring-matrix]
risk_class: duplicate_connection_command_namespace_or_false_registration
reasoning_tier: high
context_scope: connection_draft_central_registration
implementation_surfaces: [Plans/Commands_System.md, Plans/UI_Command_Catalog.md, Plans/Wiring_Matrix.production.json]
node_compile_hint: {mode: static_command_registry_and_alias_normalization_only, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - Plans/Shared_Integration_Runtime.md#SIR-035
  - "source_ref:packet:PM_Forge_Backup_Tsnet_Post_Integration_Packet_2026-09-01/14_COMMAND_CONTRACTS.md:192-197"
preserved_exact_tokens: [ACT-148, ACT-149, ACT-150, ACT-151, ACT-152, ACT-153, cmd.integration.connection.activate, handlers::integration_connection::activate, handler_unavailable, "expected_event_types=[]"]
negative_constraints:
  - Do not register any cmd.connection.* source spelling or create a peer availability, handler, persistence identity, EventRecord, or provider namespace.
  - Do not promote ui.integration.connection.draft.open_details into a command.
  - Do not claim native dispatcher, handler, persistence, provider, authentication, capability, or runtime evidence.
```
