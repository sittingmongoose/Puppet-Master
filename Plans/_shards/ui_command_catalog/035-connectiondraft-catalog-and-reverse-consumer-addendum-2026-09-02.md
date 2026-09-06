# Shard 035: ConnectionDraft Catalog And Reverse-Consumer Addendum - 2026-09-02

Source: `Plans/UI_Command_Catalog.md`

Source lines: L12234-L12287

Source SHA256: `48f2f431bc886525e5510bb8e41fad60dbbf4147bb6d4ee78cee4261da7f608d`

---

## ConnectionDraft Catalog And Reverse-Consumer Addendum - 2026-09-02

| Canonical command | Label | Owner | Sole future target | Exact contracts | Complete intended consumers and return |
|---|---|---|---|---|---|
| `cmd.integration.connection.activate` | Activate Verified Connection Draft | `Plans/Shared_Integration_Runtime.md#SIR-035` / `IntegrationConnectionRegistry` | `handlers::integration_connection::activate` | `Plans/shared_integration_runtime.schema.json#/$defs/IntegrationConnectionCommandRequest` -> `#/$defs/IntegrationConnectionCommandResult`; error `#/$defs/IntegrationConnectionCommandError`; availability `#/$defs/IntegrationConnectionAvailability`; permission `#/$defs/SharedIntegrationPermissionDecision` | Settings > Integrations connection/destination row; Product Onboarding owner setup; Doctor deep link/remediation; connection managers; palette/API. Return to the exact initiating route/focus/continuation with activation receipt or typed safe error. |

The activation control reads `state.commands.integration_connection_activate.availability` and `.disabled_reason` before dispatch, announces the exact disabled reason including `handler_unavailable`, uses identical keyboard and pointer dispatch, retains initiating focus while pending, and settles back to the exact initiating route. It never displays secret material or treats dispatch acceptance as activation.

The existing add/update/test/remove/open-details catalog rows retain their current reverse consumers. Add now explicitly labels its first-time outcome as an inactive saved draft with protected-auth continuation when needed. Test reports separate currentness, reachability, authentication, capability, and readiness evidence and does not imply a write probe. Remove copy states that provider and Backup data are retained unless a separate owner-approved operation says otherwise.

| Packet/source spelling | Exact disposition | GUI behavior |
|---|---|---|
| `cmd.connection.draft.create` | normalize to `cmd.integration.connection.add` before gates | Same control and disabled state; inactive draft persists before protected auth |
| `cmd.connection.activate` | normalize to `cmd.integration.connection.activate` before gates | Same activation control, currentness, permission, and return behavior |
| `cmd.connection.update` | normalize to `cmd.integration.connection.update` before gates | Same edit control and expected-generation gate |
| `cmd.connection.test` | normalize to `cmd.integration.connection.test` before gates | Same bounded test control and freshness projection |
| `cmd.connection.remove` | normalize to `cmd.integration.connection.remove` before gates | Same confirmation and data-retention copy |
| `cmd.connection.open_details` | normalize to `cmd.integration.connection.open_details` before gates | Same bounded redacted persisted-connection details projection |
| `cmd.connection.draft.open_details` | not a command; use `ui.integration.connection.draft.open_details` | Owner-local current draft projection, navigation receipt, and exact focus/route return; no dispatch or production-wiring command row |

Every canonical command remains `handler_unavailable` pending source-hashed executable evidence. The catalog is static reverse-coverage intent and proves no rendered control, dispatcher, handler, persistence, authentication, capability, provider effect, or runtime success.

### UCC-153 - ConnectionDraft Activation Catalog And Reverse Coverage

```yaml
plan_unit_id: UCC-153
unit_type: gui_command_catalog
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: >-
  cmd.integration.connection.activate has one catalog row over the SIR-035 contracts and sole future handler, with Settings, Onboarding, Doctor, connection-manager, and palette/API reverse consumers; ACT-148..153 spellings remain pre-gate compatibility inputs and draft-only details remain owner-local navigation.
gui_related: true
gui_classification_reason: This unit specifies visible connection-draft activation, unavailable-state, accessibility, focus-return, and source-normalization behavior.
depends_on: [UCC-151, CS-075, SIR-035]
unblocks: []
acceptance_criteria:
  - The activation row names the exact owner, schema refs, sole future handler, availability selectors, intended consumers, and exact route/focus/continuation return.
  - Existing add/update/test/remove/open-details controls preserve their owner contracts while exposing inactive-draft, currentness, capability, safety, and data-retention truth.
  - All six packet source spellings normalize before gates and have no peer visible control, handler, availability, persistence, or EventRecord identity.
  - ui.integration.connection.draft.open_details uses the owner-local request/result contract and receives no command row or domain dispatch.
  - handler_unavailable, disabled announcements, keyboard-pointer parity, focus management, safe result/error copy, and zero unregistered events require future render/control evidence.
validation_surfaces: [Plans/shared_integration_runtime_fixtures.json, Plans/Wiring_Matrix.production.json, python3 scripts/pm-plans-verify.py validate-wiring-matrix]
risk_class: missing_connection_activation_reverse_consumer_or_local_action_promotion
reasoning_tier: high
context_scope: connection_draft_catalog_and_reverse_consumers
implementation_surfaces: [Plans/UI_Command_Catalog.md, Plans/Wiring_Matrix.production.json, future Slint Settings Onboarding and Doctor controls]
node_compile_hint: {mode: static_reverse_gui_catalog_only, create_worknodes: false, create_nodeseeds: false}
source_lineage: [Plans/Shared_Integration_Runtime.md#SIR-035, Plans/Commands_System.md#CS-075, "source_ref:packet:PM_Forge_Backup_Tsnet_Post_Integration_Packet_2026-09-01/14_COMMAND_CONTRACTS.md:192-197"]
preserved_exact_tokens: [cmd.integration.connection.activate, state.commands.integration_connection_activate.availability, state.commands.integration_connection_activate.disabled_reason, ui.integration.connection.draft.open_details, handler_unavailable, "expected_event_types=[]"]
negative_constraints:
  - Do not invent duplicate source-spelling controls, a draft-details domain command, or a false active/success state.
  - Do not expose credentials, auth codes, tokens, protected browser content, raw provider errors, or provider/Backup data.
  - Do not claim rendered, dispatched, persisted, authenticated, capability-verified, or runtime evidence from this static catalog.
```
