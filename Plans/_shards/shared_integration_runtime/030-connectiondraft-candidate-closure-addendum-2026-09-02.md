# Shard 030: ConnectionDraft Candidate Closure Addendum - 2026-09-02

Source: `Plans/Shared_Integration_Runtime.md`

Source lines: L1791-L1852

Source SHA256: `f88fb4ba43e4f4ebe35d05fbcca41c262ca95ad1aff4b2ab2c7f8dfac59c2058`

---

## ConnectionDraft Candidate Closure Addendum - 2026-09-02

`IntegrationConnectionRegistry` remains the canonical persistence and lifecycle owner. Packet action candidates ACT-148 through ACT-153 are compatibility inputs, not a second command namespace:

| Packet action | Candidate spelling | Canonical disposition | Sole future target |
|---|---|---|---|
| ACT-148 | `cmd.connection.draft.create` | normalize before gates to `cmd.integration.connection.add`; add persists an inactive `ConnectionDraft` | `handlers::integration_connection::add` |
| ACT-149 | `cmd.connection.activate` | normalize before gates to `cmd.integration.connection.activate` | `handlers::integration_connection::activate` |
| ACT-150 | `cmd.connection.update` | normalize before gates to `cmd.integration.connection.update` | `handlers::integration_connection::update` |
| ACT-151 | `cmd.connection.test` | normalize before gates to `cmd.integration.connection.test` | `handlers::integration_connection::test` |
| ACT-152 | `cmd.connection.remove` | normalize before gates to `cmd.integration.connection.remove` | `handlers::integration_connection::remove` |
| ACT-153 | `cmd.connection.open_details` | normalize before gates to the existing persisted-connection command `cmd.integration.connection.open_details` | `handlers::integration_connection::open_details` |

The source spellings are unregistered, receive no peer handler, availability identity, persistence identity, or EventRecord, and normalize before schema, capability/currentness, permission, policy, and dispatch gates. Only the canonical target has a sole future handler. Every target remains `handler_unavailable` until source-hashed executable dispatcher and handler proof exists. Requests bind the shared non-secret `CommandContext` by `command_context_ref`; results settle the initiating return context and record only typed receipt/projection evidence; errors carry a closed reason code, safe message, effect state, retry truth, and typed `recovery_action_ref`. The family keeps `expected_event_types=[]`.

First-time Forge, repository-automation, or Backup setup does not require a preexisting authenticated connection. `cmd.integration.connection.add` accepts `connection_kind=forge|automation|backup`, a validated provider/instance identity, a typed non-secret configuration ref, and nullable profile/credential refs. It atomically persists a non-active `ConnectionDraft` before protected authentication begins and may return only an opaque `auth_continuation_ref`; auth codes, tokens, credential bytes, protected browser content, and raw provider errors never enter the record, command, receipt, projection, logs, capture, agents, or adapters. Cancellation or restart reconciles the persisted draft and removes only uncommitted draft attachments after safe cleanup; it preserves user-owned profiles and provider data.

Activation is a separate expected-generation mutation. It fails closed unless the exact draft, provider, topology, authenticated profile, permission snapshot, minimum non-destructive capability requirement, verification evidence, and required lease are current. Success atomically advances the registry generation and returns a non-secret active connection ref, capability snapshot, receipt, ObservableWork correlation, and exact return settlement. Test is a bounded read/projection with currentness and probe evidence and no write probe. Remove never deletes Backup or provider data by implication. FileSafe applies only if a provider-owned plan separately declares a filesystem mutation; these registry commands do not acquire ambient filesystem authority.

The non-packet draft-only spelling `cmd.connection.draft.open_details` is rejected as a domain command and is represented as `ui.integration.connection.draft.open_details`, a typed owner-local navigation action over the current non-secret draft projection. It has no command registration, semantic handler, persistence write, capability grant, ObservableWork mutation, or domain event; it returns a `navigation_receipt_ref` and restores the exact initiating focus/route. ACT-153 remains distinct because it names details for an already persisted connection and therefore continues to normalize to the existing bounded registry command.

Reverse consumers are exactly Settings integration/destination rows, Product Onboarding owner setup, Doctor deep links/remediation, connection managers, and palette/API where the canonical command is exposed. Repository automation remains a separate `AutomationBinding` consumer; Forge and Backup owners retain their provider, repository, scheduler, encryption, and data semantics. Static Plans, schemas, fixtures, catalog rows, and wiring targets prove no provider call, protected-auth execution, capability result, persistence implementation, native UI, dispatch, or runtime success.

### SIR-035 - ConnectionDraft Lifecycle And ACT-148..153 Reconciliation

```yaml
plan_unit_id: SIR-035
unit_type: command_contract
status: accepted
owner_doc: Plans/Shared_Integration_Runtime.md
canonical_text: >-
  IntegrationConnectionRegistry owns one persisted inactive ConnectionDraft lifecycle. ACT-148..153 normalize to the six canonical cmd.integration.connection add/activate/update/test/remove/open_details commands before every gate, source spellings gain no peer route, first-time setup may continue through an opaque protected-auth reference, activation requires current authenticated-profile, capability, verification, permission, and generation proof, and draft-only details remain typed owner-local navigation.
gui_related: true
gui_classification_reason: Settings integration/destination rows, Product Onboarding, Doctor deep links, connection managers, and palette/API expose the draft lifecycle, disabled reasons, progress, and exact return behavior.
depends_on: [SIR-019, SIR-029, SIR-032, SIR-034]
unblocks: []
acceptance_criteria:
  - ACT-148 through ACT-153 each have exactly one machine-validated resolution to an existing canonical command except the newly admitted canonical activation command; no source spelling is registered or receives a peer handler.
  - Draft creation persists an inactive IntegrationConnectionRegistry record before protected authentication and supports a first-time opaque auth continuation without requiring a preexisting profile.
  - Activation requires expected generation, exact identity/topology, current permission, authenticated profile, minimum capability requirement, non-destructive verification evidence, and any required lease before atomic registry activation.
  - Update, test, remove, and persisted-connection details retain their exact current owner contracts; test is a bounded no-write read, and remove never implies provider or Backup data deletion.
  - cmd.connection.draft.open_details is not registered; ui.integration.connection.draft.open_details is presentation-only, currentness- and permission-bound, non-persistent, event-silent navigation with deterministic focus/route return.
  - The six canonical commands have one sole future integration_connection handler each, remain handler_unavailable, use receipt/projection-only effects with "expected_event_types=[]", and claim no runtime evidence.
validation_surfaces: [Plans/shared_integration_runtime.schema.json, Plans/shared_integration_runtime_fixtures.json, Plans/Commands_System.md, Plans/UI_Command_Catalog.md, Plans/Wiring_Matrix.production.json, python3 scripts/pm-new-contracts-verify.py, python3 scripts/pm-plans-verify.py validate-wiring-matrix]
risk_class: duplicate_connection_registry_or_premature_activation
reasoning_tier: high
context_scope: connection_draft_candidate_and_canonical_lifecycle
implementation_surfaces: [Plans/Shared_Integration_Runtime.md, Plans/shared_integration_runtime.schema.json, Plans/shared_integration_runtime_fixtures.json, Plans/Commands_System.md, Plans/UI_Command_Catalog.md, Plans/Wiring_Matrix.production.json, future IntegrationConnectionRegistry and SharedConnectionProfileSupervisor]
node_compile_hint: {mode: static_connection_draft_contract_and_binding_only, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - "source_ref:packet:PM_Forge_Backup_Tsnet_Post_Integration_Packet_2026-09-01/14_COMMAND_CONTRACTS.md:192-197"
  - "source_ref:packet:PM_Forge_Backup_Tsnet_Post_Integration_Packet_2026-09-01/machine/command_census.json:8624-8978"
  - "source_ref:packet:2026-09-01:SAUTH-005"
  - "source_ref:packet:2026-09-01:CLOUD-002"
preserved_exact_tokens: [ConnectionDraft, IntegrationConnectionRegistry, ACT-148, ACT-149, ACT-150, ACT-151, ACT-152, ACT-153, cmd.connection.draft.create, cmd.connection.activate, cmd.connection.update, cmd.connection.test, cmd.connection.remove, cmd.connection.open_details, cmd.connection.draft.open_details, ui.integration.connection.draft.open_details, handler_unavailable, "expected_event_types=[]"]
negative_constraints:
  - Do not create a second connection registry, provider namespace, auth broker, capability owner, persistence identity, peer handler, or EventRecord family.
  - Do not activate from request acceptance, stale cache, missing auth/profile proof, a destructive test, or static schema/catalog/wiring evidence.
  - Do not expose auth codes, tokens, credentials, protected browser content, raw provider errors, or unrelated provider/Backup data.
  - Do not claim native dispatch, handler execution, persistence, provider effects, protected-auth completion, capability verification, GUI execution, or runtime readiness.
owner_hints: [Plans/Shared_Integration_Runtime.md, Plans/Multi-Account.md, Plans/Forge_Integrations.md, Plans/Repository_Automation.md, Plans/Backup_Restore_System.md]
```
