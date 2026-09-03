# Shard 023: Command Contract Closure Addendum - Connection Profiles And Installation Selection

Source: `Plans/Shared_Integration_Runtime.md`

Source lines: L1037-L1127

Source SHA256: `f88fb4ba43e4f4ebe35d05fbcca41c262ca95ad1aff4b2ab2c7f8dfac59c2058`

---

## Command Contract Closure Addendum - Connection Profiles And Installation Selection

This addendum closes only the owner-side machine contracts for six exact shared connection-profile commands and the exact installation-selection command retained by Touch Closure. It preserves the `EnvironmentConnectionSupervisor`, `IntegrationConnectionRegistry`, `InstallationResolver`, and `InstallationLifecycleManager` boundaries above and creates no parallel connection, provider, credential, installation, or authentication runtime.

The closed schema pointers are:

- connection request: `Plans/shared_integration_runtime.schema.json#/$defs/IntegrationConnectionCommandRequest`;
- connection result: `Plans/shared_integration_runtime.schema.json#/$defs/IntegrationConnectionCommandResult`;
- connection availability: `Plans/shared_integration_runtime.schema.json#/$defs/IntegrationConnectionAvailability`;
- shared permission: `Plans/shared_integration_runtime.schema.json#/$defs/SharedIntegrationPermissionDecision`;
- connection error: `Plans/shared_integration_runtime.schema.json#/$defs/IntegrationConnectionCommandError`;
- installation-selection request/result/availability/error: `Plans/shared_integration_runtime.schema.json#/$defs/InstallationSelectCommandRequest`, `#/$defs/InstallationSelectCommandResult`, `#/$defs/InstallationSelectAvailability`, and `#/$defs/InstallationSelectCommandError`.

`cmd.integration.connection.add`, `.activate`, `.update`, `.test`, `.remove`, and `.open_details` carry exact provider/variant/connection/Project/route/Home Server/Host/Environment identity, expected connection and topology generations, permission snapshot, work and return context, and one closed `ConnectionMutation`. Add is the canonical inactive-draft creation route: it accepts typed non-secret configuration and optional broker/profile references, persists the draft in `IntegrationConnectionRegistry`, and can return a protected `auth_continuation_ref` without requiring a preexisting authenticated profile. Activate is separately CAS-fenced and requires the authenticated profile ref, minimum-capability requirement, and non-destructive verification evidence before an atomic registry transition to ready or ready-with-limits. Update requires a bounded patch ref. Test requires probe-policy and capability-requirement refs, returns currentness/freshness through availability plus probe evidence, and performs no write probe. Remove requires explicit confirmation plus credential and remote-data dispositions and never silently deletes provider or Backup data. Open Details for a persisted connection is read-only, bounded, redacted, and carries no `ObservableWork` mutation.

Provider-specific values remain data behind the `connection_kind`, `provider_id`, `provider_variant`, and non-secret setup/profile refs. This contract does not create provider command namespaces or provider-specific handlers. The semantic route remains Shared Integration Runtime connection supervision plus the named provider owner; the native handler route for these exact IDs is not materialized here.

`cmd.installation.select` selects one already discovered, verified, compatible installation for the exact product, Host, and Environment under inventory, installation, and topology generations. Its request fixes `acquisition_allowed=false` and `authentication_allowed=false`. Selection is not install, verify, update, repair, rollback, acquisition, or authentication and cannot silently continue either lifecycle. Initial provider-CLI acquisition remains explicit and separate.

Availability is separately typed. The central catalog and production-intent rows now exist, but all six exact connection IDs remain `handler_unavailable` until native dispatcher/handler registration and evidence exist; installation selection follows its own current central state. Permission decisions assert `credential_material_exposed=false` and `authority_widening=false`. Effects are receipt-only with `event_effect_policy=receipt_only_no_eventrecord_pending_event_authority`; no connection or installation EventRecord family, executable handler, provider effect, or runtime proof is inferred.

GUI consumers are Settings Integrations, setup/onboarding connection rows, installation pickers, palette, and bounded detail views. Headless owner reconciliation may test current connections only under exact scopes and policy; it cannot add, update, remove, open human details, acquire software, authenticate, or select an installation for the user. Reverse coverage must resolve exact control -> command ID -> typed contracts -> central catalog row -> production wiring row -> one native owner -> receipt before enablement.

`Plans/shared_integration_runtime_fixtures.json` covers all seven command request shapes and all seven return-settling results, the persisted first-time inactive draft/auth continuation, ACT-148 through ACT-153 normalization, draft-local details navigation, and negative command/action, configuration, capability, verification, patch/probe/confirmation, successful activation/test evidence, raw-token reference, details-work, acquisition/authentication, return settlement, credential exposure, and authority widening. Static validation is contract evidence only; stale-generation, restart/reconnect, provider failure, credential broker, destructive disposition, immutable-image, native-platform, and recovery behavior remain future runtime evidence.

ContractRef: SchemaID:pm.shared_integration_runtime.command_contracts.v1, ContractName:Plans/Shared_Integration_Runtime.md#4, ContractName:Plans/Release_Supply_Chain.md

### SIR-019 - Shared Connection-Profile Command Contracts

```yaml
plan_unit_id: SIR-019
unit_type: schema_contract
status: accepted
owner_doc: Plans/Shared_Integration_Runtime.md
canonical_text: >-
  Six exact cmd.integration.connection commands share a closed request, result, availability, permission,
  disabled-reason, and error contract with exact provider, connection, Project, route, Server, Host,
  Environment, connection-generation, and topology-generation fencing; provider-specific values remain typed
  data and owner schema closure does not register a command, handler, event, or runtime path.
gui_related: true
gui_classification_reason: Draft creation, activation, update, test, remove, and details are visible integration-profile controls.
depends_on: [SIR-005, SIR-006, SIR-010]
unblocks: []
acceptance_criteria:
  - All six exact IDs have one positive request and result fixture and share the exact schema pointers in this addendum.
  - Add persists an inactive draft and can return a protected authentication continuation without a preexisting profile; activate requires current authenticated-profile, capability-requirement, and verification-evidence refs.
  - Remove requires confirmation and explicit credential/remote-data dispositions; details has no mutation work.
  - Raw credentials, provider-specific command namespaces, undeclared handlers, and event producers are absent.
validation_surfaces: [Plans/shared_integration_runtime_fixtures.json, future central catalog/wiring and native connection fixtures]
risk_class: shared_connection_command_phantom_closure
reasoning_tier: high
context_scope: shared_connection_profile_commands
implementation_surfaces: [Plans/Shared_Integration_Runtime.md, Plans/shared_integration_runtime.schema.json]
node_compile_hint: {mode: shared_connection_profile_commands, create_worknodes: false, create_nodeseeds: false}
source_lineage: [source_ref:egolite-requirement:IRT-001, source_ref:egolite-requirement:IRT-011, source_ref:egolite-requirement:IRT-012, source_ref:egolite-requirement:IRT-013, source_ref:egolite-requirement:IRT-014, source_ref:egolite-requirement:IRT-015, source_ref:packet:PKT-04/04_COMMAND_EVENT_WIRING_REGISTER.md:387-412]
negative_constraints:
  - Do not register or enable an exact command from owner prose or schema alone.
  - Do not copy raw credentials, silently delete provider data, or create a provider-local connection runtime.
```

### SIR-020 - Verified Installation Selection Contract

```yaml
plan_unit_id: SIR-020
unit_type: schema_contract
status: accepted
owner_doc: Plans/Shared_Integration_Runtime.md
canonical_text: >-
  cmd.installation.select binds one already discovered, verified, compatible installation to the exact product,
  Host, Environment, inventory generation, installation generation, topology generation, provenance, and
  compatibility proof while explicitly forbidding acquisition and authentication.
gui_related: true
gui_classification_reason: Installation selection is a visible setup and provider-row choice.
depends_on: [SIR-003, SIR-004]
unblocks: []
acceptance_criteria:
  - The request fixes acquisition_allowed=false and authentication_allowed=false.
  - Successful selection returns non-null activation proof, the exact continuation, and a caller return settlement.
  - Ambiguous, unverified, incompatible, stale, wrong-topology, or policy-denied candidates fail closed with typed availability/error state.
  - Selection has no undeclared alias, native handler, EventRecord producer, or runtime-success claim.
validation_surfaces: [Plans/shared_integration_runtime_fixtures.json, future inventory-generation, topology, immutable-image, activation, and recovery fixtures]
risk_class: installation_selection_acquisition_or_auth_conflation
reasoning_tier: high
context_scope: verified_installation_selection
implementation_surfaces: [Plans/Shared_Integration_Runtime.md, Plans/shared_integration_runtime.schema.json]
node_compile_hint: {mode: verified_installation_selection, create_worknodes: false, create_nodeseeds: false}
source_lineage: [source_ref:egolite-requirement:IRT-003, source_ref:egolite-requirement:IRT-005, source_ref:egolite-requirement:IRT-006, source_ref:egolite-requirement:IRT-007, source_ref:egolite-requirement:IRT-008, source_ref:egolite-requirement:IRT-009, source_ref:egolite-requirement:IRT-010, source_ref:egolite-requirement:IRT-013, source_ref:packet:PKT-04/04_COMMAND_EVENT_WIRING_REGISTER.md:361-376]
negative_constraints:
  - Do not acquire, verify, update, repair, rollback, or authenticate as a side effect of selection.
  - Do not infer native activation success from static contract validation.
```
