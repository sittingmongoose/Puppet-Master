# Shard 025: Server/WAN exact-command owner closure addendum

Source: `Plans/Shared_Integration_Runtime.md`

Source lines: L1236-L1495

Source SHA256: `68f490730360190a462e589a2e83adc0276929bc4a170d5a69b7be7d9f502852`

---

## Server/WAN exact-command owner closure addendum

This addendum supersedes the retained-candidate disposition table above for the exact 91 packet rows enumerated here. It closes the Shared Integration Runtime owner side only: 44 exact commands, 14 typed local UI actions, and 33 packet aliases. Central registration, shared wiring, Touch Closure, PM7/native GUI wiring, and executable native handlers remain separate owner work and are not implied by these static contracts.

`Plans/shared_integration_runtime_expansion_contracts.schema.json` is the single DRY typed source for the four semantic command families. Each family has one request, result, error, availability, and permission-decision contract. `Plans/shared_integration_runtime_expansion_fixtures.json` preserves the packet source line, intended semantics, exact owner component, sole handler, and complete GUI-consumer set for every row. Every new command starts as `handler_unavailable` with no native-handler evidence. Results settle the initiating return context exactly; asynchronous work uses `ObservableWork`; restart reconciliation and current generation are mandatory before success; raw secret material, authority widening, stale-success, conflicting-generation success, duplicate handlers, and inferred runtime success are forbidden. Receipts and projections are the only admitted evidence until Event Authority separately admits an exact domain-event family.

### Exact 44-command inventory

| Exact command | Sole handler target | Intended GUI consumers |
|---|---|---|
| `cmd.credential_attachment.revoke` | `handlers::credential_broker::attachment_revoke` | Settings > Integrations/Credentials; Project copy/move readiness; Doctor remediation; connection managers |
| `cmd.credential_attachment.revoke_active` | `handlers::credential_broker::attachment_revoke_active` | Settings > Integrations/Credentials; Project copy/move readiness; Doctor remediation; connection managers |
| `cmd.credential_attachment.test` | `handlers::credential_broker::attachment_test` | Settings > Integrations/Credentials; Project copy/move readiness; Doctor remediation; connection managers |
| `cmd.credential_attachment.transfer.apply` | `handlers::credential_broker::attachment_transfer_apply` | Settings > Integrations/Credentials; Project copy/move readiness; Doctor remediation; connection managers |
| `cmd.credential_attachment.transfer.preview` | `handlers::credential_broker::attachment_transfer_preview` | Settings > Integrations/Credentials; Project copy/move readiness; Doctor remediation; connection managers |
| `cmd.credential_source.add` | `handlers::credential_broker::source_add` | Settings > Integrations/Credentials; Project copy/move readiness; Doctor remediation; connection managers |
| `cmd.credential_source.remove` | `handlers::credential_broker::source_remove` | Settings > Integrations/Credentials; Project copy/move readiness; Doctor remediation; connection managers |
| `cmd.credential_source.test` | `handlers::credential_broker::source_test` | Settings > Integrations/Credentials; Project copy/move readiness; Doctor remediation; connection managers |
| `cmd.execution_environment.attach` | `handlers::execution_topology::environment_attach` | Settings > Hosting & Files; Server/Execution manager; Add Project; Goal handoff; Doctor; palette/API |
| `cmd.execution_environment.discover` | `handlers::execution_topology::environment_discover` | Settings > Hosting & Files; Server/Execution manager; Add Project; Goal handoff; Doctor; palette/API |
| `cmd.execution_environment.provision` | `handlers::execution_topology::environment_provision` | Settings > Hosting & Files; Server/Execution manager; Add Project; Goal handoff; Doctor; palette/API |
| `cmd.execution_environment.remove` | `handlers::execution_topology::environment_remove` | Settings > Hosting & Files; Server/Execution manager; Add Project; Goal handoff; Doctor; palette/API |
| `cmd.execution_environment.repair` | `handlers::execution_topology::environment_repair` | Settings > Hosting & Files; Server/Execution manager; Add Project; Goal handoff; Doctor; palette/API |
| `cmd.execution_environment.resource_policy.apply` | `handlers::execution_topology::environment_resource_policy_apply` | Settings > Hosting & Files; Server/Execution manager; Add Project; Goal handoff; Doctor; palette/API |
| `cmd.execution_environment.resource_policy.preview` | `handlers::execution_topology::environment_resource_policy_preview` | Settings > Hosting & Files; Server/Execution manager; Add Project; Goal handoff; Doctor; palette/API |
| `cmd.execution_environment.restart` | `handlers::execution_topology::environment_restart` | Settings > Hosting & Files; Server/Execution manager; Add Project; Goal handoff; Doctor; palette/API |
| `cmd.execution_environment.rollback` | `handlers::execution_topology::environment_rollback` | Settings > Hosting & Files; Server/Execution manager; Add Project; Goal handoff; Doctor; palette/API |
| `cmd.execution_environment.select` | `handlers::execution_topology::environment_select` | Settings > Hosting & Files; Server/Execution manager; Add Project; Goal handoff; Doctor; palette/API |
| `cmd.execution_environment.start` | `handlers::execution_topology::environment_start` | Settings > Hosting & Files; Server/Execution manager; Add Project; Goal handoff; Doctor; palette/API |
| `cmd.execution_environment.stop` | `handlers::execution_topology::environment_stop` | Settings > Hosting & Files; Server/Execution manager; Add Project; Goal handoff; Doctor; palette/API |
| `cmd.execution_environment.update` | `handlers::execution_topology::environment_update` | Settings > Hosting & Files; Server/Execution manager; Add Project; Goal handoff; Doctor; palette/API |
| `cmd.execution_environment.verify` | `handlers::execution_topology::environment_verify` | Settings > Hosting & Files; Server/Execution manager; Add Project; Goal handoff; Doctor; palette/API |
| `cmd.execution_host.capabilities.refresh` | `handlers::execution_topology::host_capabilities_refresh` | Settings > Hosting & Files; Server/Execution manager; Add Project; Goal handoff; Doctor; palette/API |
| `cmd.execution_host.disable` | `handlers::execution_topology::host_disable` | Settings > Hosting & Files; Server/Execution manager; Add Project; Goal handoff; Doctor; palette/API |
| `cmd.execution_host.drain` | `handlers::execution_topology::host_drain` | Settings > Hosting & Files; Server/Execution manager; Add Project; Goal handoff; Doctor; palette/API |
| `cmd.execution_host.enable` | `handlers::execution_topology::host_enable` | Settings > Hosting & Files; Server/Execution manager; Add Project; Goal handoff; Doctor; palette/API |
| `cmd.execution_host.register` | `handlers::execution_topology::host_register` | Settings > Hosting & Files; Server/Execution manager; Add Project; Goal handoff; Doctor; palette/API |
| `cmd.execution_host.remove` | `handlers::execution_topology::host_remove` | Settings > Hosting & Files; Server/Execution manager; Add Project; Goal handoff; Doctor; palette/API |
| `cmd.execution_host.set_default` | `handlers::execution_topology::host_set_default` | Settings > Hosting & Files; Server/Execution manager; Add Project; Goal handoff; Doctor; palette/API |
| `cmd.execution_host.test` | `handlers::execution_topology::host_test` | Settings > Hosting & Files; Server/Execution manager; Add Project; Goal handoff; Doctor; palette/API |
| `cmd.installation.attach_external` | `handlers::installation::attach_external` | K3 Toolchain/Integrations managers; Product Onboarding owner setup; Doctor remediation; palette/API |
| `cmd.installation.detach_external` | `handlers::installation::detach_external` | K3 Toolchain/Integrations managers; Product Onboarding owner setup; Doctor remediation; palette/API |
| `cmd.installation.remove` | `handlers::installation::remove` | K3 Toolchain/Integrations managers; Product Onboarding owner setup; Doctor remediation; palette/API |
| `cmd.project.execution_host.select` | `handlers::execution_topology::execution_host_select` | Settings > Hosting & Files; Projects hosting/source manager; Product Onboarding; Doctor |
| `cmd.project.execution_policy.set` | `handlers::execution_topology::execution_policy_set` | Settings > Hosting & Files; Projects hosting/source manager; Product Onboarding; Doctor |
| `cmd.project.home_server.set` | `handlers::execution_topology::home_server_set` | Settings > Hosting & Files; Projects hosting/source manager; Product Onboarding; Doctor |
| `cmd.project.source_location.add` | `handlers::execution_topology::source_location_add` | Settings > Hosting & Files; Projects hosting/source manager; Product Onboarding; Doctor |
| `cmd.project.source_location.remove` | `handlers::execution_topology::source_location_remove` | Settings > Hosting & Files; Projects hosting/source manager; Product Onboarding; Doctor |
| `cmd.project.source_location.set_primary` | `handlers::execution_topology::source_location_set_primary` | Settings > Hosting & Files; Projects hosting/source manager; Product Onboarding; Doctor |
| `cmd.project.source_location.test` | `handlers::execution_topology::source_location_test` | Settings > Hosting & Files; Projects hosting/source manager; Product Onboarding; Doctor |
| `cmd.project.source_location.update` | `handlers::execution_topology::source_location_update` | Settings > Hosting & Files; Projects hosting/source manager; Product Onboarding; Doctor |
| `cmd.provider_binding.copy` | `handlers::credential_broker::binding_copy` | Settings > Integrations/Credentials; Project copy/move readiness; Doctor remediation; connection managers |
| `cmd.provider_binding.resolve_on_destination` | `handlers::credential_broker::binding_resolve_on_destination` | Settings > Integrations/Credentials; Project copy/move readiness; Doctor remediation; connection managers |
| `cmd.tool_package.approve_license` | `handlers::installation::package_approve_license` | K3 Toolchain/Integrations managers; Product Onboarding owner setup; Doctor remediation; palette/API |

### Typed local UI actions

These packet command-shaped tokens are not domain commands. The `ui.*` identity is the typed owner-local action; it has current projection/focus/accessibility/return state, no semantic-domain handler, no command registration, and no domain-event emission.

| Packet token | Typed local action | Intended GUI consumers |
|---|---|---|
| `cmd.auth_session.close_secure_browser` | `ui.auth_session.close_secure_browser` | authentication handoff surface; Product Onboarding owner handoff; Settings > Integrations; Doctor remediation |
| `cmd.auth_session.copy_device_code` | `ui.auth_session.copy_device_code` | authentication handoff surface; Product Onboarding owner handoff; Settings > Integrations; Doctor remediation |
| `cmd.auth_session.open_details` | `ui.auth_session.open_details` | authentication handoff surface; Product Onboarding owner handoff; Settings > Integrations; Doctor remediation |
| `cmd.credential_attachment.open_consumers` | `ui.credential_attachment.open_consumers` | Settings > Integrations/Credentials; Project copy/move readiness; Doctor remediation; connection managers |
| `cmd.credential_attachment.open_details` | `ui.credential_attachment.open_details` | Settings > Integrations/Credentials; Project copy/move readiness; Doctor remediation; connection managers |
| `cmd.credential_source.open_details` | `ui.credential_source.open_details` | Settings > Integrations/Credentials; Project copy/move readiness; Doctor remediation; connection managers |
| `cmd.execution_environment.open_details` | `ui.execution_environment.open_details` | Settings > Hosting & Files; Server/Execution manager; Add Project; Goal handoff; Doctor; palette/API |
| `cmd.execution_environment.open_logs` | `ui.execution_environment.open_logs` | Settings > Hosting & Files; Server/Execution manager; Add Project; Goal handoff; Doctor; palette/API |
| `cmd.execution_host.open_details` | `ui.execution_host.open_details` | Settings > Hosting & Files; Server/Execution manager; Add Project; Goal handoff; Doctor; palette/API |
| `cmd.installation.open_details` | `ui.installation.open_details` | K3 Toolchain/Integrations managers; Product Onboarding owner setup; Doctor remediation; palette/API |
| `cmd.installation.open_logs` | `ui.installation.open_logs` | K3 Toolchain/Integrations managers; Product Onboarding owner setup; Doctor remediation; palette/API |
| `cmd.project.source_location.open_details` | `ui.project.source_location.open_details` | Settings > Hosting & Files; Projects hosting/source manager; Product Onboarding; Doctor |
| `cmd.tool_package.open_provenance` | `ui.tool_package.open_provenance` | K3 Toolchain/Integrations managers; Product Onboarding owner setup; Doctor remediation; palette/API |
| `cmd.tool_package.review_license` | `ui.tool_package.review_license` | K3 Toolchain/Integrations managers; Product Onboarding owner setup; Doctor remediation; palette/API |

### Pre-policy alias normalization

The 33 packet aliases normalize to their exact target before availability, permission, policy, or dispatch. The source spelling is never registered, has no peer handler or peer availability, and may be preserved only as compatibility/source receipt identity.

| Packet alias | Exact canonical target | Intended GUI consumers |
|---|---|---|
| `cmd.auth_session.cancel` | `cmd.authentication.cancel` | authentication handoff surface; Product Onboarding owner handoff; Settings > Integrations; Doctor remediation |
| `cmd.auth_session.open_official_page` | `cmd.auth_profile.open_official_page` | authentication handoff surface; Product Onboarding owner handoff; Settings > Integrations; Doctor remediation |
| `cmd.auth_session.open_secure_browser` | `cmd.authentication.start` | authentication handoff surface; Product Onboarding owner handoff; Settings > Integrations; Doctor remediation |
| `cmd.auth_session.open_secure_cli` | `cmd.authentication.start` | authentication handoff surface; Product Onboarding owner handoff; Settings > Integrations; Doctor remediation |
| `cmd.auth_session.resume_callback` | `cmd.authentication.resume` | authentication handoff surface; Product Onboarding owner handoff; Settings > Integrations; Doctor remediation |
| `cmd.auth_session.retry` | `cmd.authentication.resume` | authentication handoff surface; Product Onboarding owner handoff; Settings > Integrations; Doctor remediation |
| `cmd.auth_session.start` | `cmd.authentication.start` | authentication handoff surface; Product Onboarding owner handoff; Settings > Integrations; Doctor remediation |
| `cmd.auth_session.submit_redirect` | `cmd.authentication.resume` | authentication handoff surface; Product Onboarding owner handoff; Settings > Integrations; Doctor remediation |
| `cmd.auth_session.submit_returned_code` | `cmd.authentication.resume` | authentication handoff surface; Product Onboarding owner handoff; Settings > Integrations; Doctor remediation |
| `cmd.cluster_connection.add` | `cmd.integration.connection.add` | Settings > Integrations; Product Onboarding owner setup; Doctor; palette/API |
| `cmd.cluster_connection.disable` | `cmd.integration.connection.update` | Settings > Integrations; Product Onboarding owner setup; Doctor; palette/API |
| `cmd.cluster_connection.edit` | `cmd.integration.connection.update` | Settings > Integrations; Product Onboarding owner setup; Doctor; palette/API |
| `cmd.cluster_connection.open_details` | `cmd.integration.connection.open_details` | Settings > Integrations; Product Onboarding owner setup; Doctor; palette/API |
| `cmd.cluster_connection.refresh_capabilities` | `cmd.integration.connection.test` | Settings > Integrations; Product Onboarding owner setup; Doctor; palette/API |
| `cmd.cluster_connection.remove` | `cmd.integration.connection.remove` | Settings > Integrations; Product Onboarding owner setup; Doctor; palette/API |
| `cmd.cluster_connection.select` | `cmd.integration.connection.update` | Settings > Integrations; Product Onboarding owner setup; Doctor; palette/API |
| `cmd.cluster_connection.test` | `cmd.integration.connection.test` | Settings > Integrations; Product Onboarding owner setup; Doctor; palette/API |
| `cmd.git_credential_binding.test` | `cmd.integration.connection.test` | Settings > Integrations/Credentials; Project copy/move readiness; Doctor remediation; connection managers |
| `cmd.installation.rescan` | `cmd.tool.discover` | K3 Toolchain/Integrations managers; Product Onboarding owner setup; Doctor remediation; palette/API |
| `cmd.registry_connection.add` | `cmd.integration.connection.add` | Settings > Integrations; Product Onboarding owner setup; Doctor; palette/API |
| `cmd.registry_connection.edit` | `cmd.integration.connection.update` | Settings > Integrations; Product Onboarding owner setup; Doctor; palette/API |
| `cmd.registry_connection.open_details` | `cmd.integration.connection.open_details` | Settings > Integrations; Product Onboarding owner setup; Doctor; palette/API |
| `cmd.registry_connection.remove` | `cmd.integration.connection.remove` | Settings > Integrations; Product Onboarding owner setup; Doctor; palette/API |
| `cmd.registry_connection.test` | `cmd.integration.connection.test` | Settings > Integrations; Product Onboarding owner setup; Doctor; palette/API |
| `cmd.registry_credential_binding.test` | `cmd.integration.connection.test` | Settings > Integrations/Credentials; Project copy/move readiness; Doctor remediation; connection managers |
| `cmd.runtime_connection.add` | `cmd.integration.connection.add` | Settings > Integrations; Product Onboarding owner setup; Doctor; palette/API |
| `cmd.runtime_connection.disable` | `cmd.integration.connection.update` | Settings > Integrations; Product Onboarding owner setup; Doctor; palette/API |
| `cmd.runtime_connection.edit` | `cmd.integration.connection.update` | Settings > Integrations; Product Onboarding owner setup; Doctor; palette/API |
| `cmd.runtime_connection.open_details` | `cmd.integration.connection.open_details` | Settings > Integrations; Product Onboarding owner setup; Doctor; palette/API |
| `cmd.runtime_connection.remove` | `cmd.integration.connection.remove` | Settings > Integrations; Product Onboarding owner setup; Doctor; palette/API |
| `cmd.runtime_connection.select` | `cmd.integration.connection.update` | Settings > Integrations; Product Onboarding owner setup; Doctor; palette/API |
| `cmd.runtime_connection.test` | `cmd.integration.connection.test` | Settings > Integrations; Product Onboarding owner setup; Doctor; palette/API |
| `cmd.ssh_credential_binding.test` | `cmd.integration.connection.test` | Settings > Integrations/Credentials; Project copy/move readiness; Doctor remediation; connection managers |

### SIR-024 - Credential Attachment And Provider Binding Commands

```yaml
plan_unit_id: SIR-024
unit_type: command_contract
status: accepted
owner_doc: Plans/Shared_Integration_Runtime.md
canonical_text: >-
  CredentialBroker owns the ten exact credential-attachment, credential-source, and provider-binding operations in
  the 44-command inventory. Requests carry references only, exact owner/topology generations, idempotency,
  permission and return context; results report requested/effective state, currentness, receipt refs, and exact return.
gui_related: true
depends_on: [SIR-003, SIR-006, SIR-019, SIR-021]
unblocks: []
acceptance_criteria:
  - All ten commands use IntegrationCredential request/result/error/availability/permission contracts and the sole handlers listed above.
  - Transfer never copies secret bytes; it uses compatible references or a separately encrypted user-controlled recovery-envelope reference.
  - Attachment test remains distinct from connection reachability, and revoke-active never deletes the attachment definition.
  - Every command remains handler_unavailable until its exact native handler has evidence.
validation_surfaces: [Plans/shared_integration_runtime_expansion_contracts.schema.json, Plans/shared_integration_runtime_expansion_fixtures.json, focused SIR expansion validator]
risk_class: credential_scope_or_secret_material_leak
reasoning_tier: high
context_scope: integration_credential_commands
implementation_surfaces: [Plans/Shared_Integration_Runtime.md, future AuthenticationBroker and CredentialBroker]
node_compile_hint: {mode: shared_runtime_static_contract_only, create_worknodes: false, create_nodeseeds: false}
source_lineage: [server-command-gap-adjudication rows 33-41 and 134-135]
negative_constraints: [No raw secret bytes., No connection-test substitution., No implicit authority widening.]
```

### SIR-025 - Execution Host And Environment Commands

```yaml
plan_unit_id: SIR-025
unit_type: command_contract
status: accepted
owner_doc: Plans/Shared_Integration_Runtime.md
canonical_text: >-
  ExecutionTopologyRegistry owns the 22 exact Host and Environment operations in the inventory, preserves immutable
  identity and generation fences, routes resource policy through RuntimeResourceGovernor, and reconciles restart,
  rollback, drain, removal, and active-work races before reporting effective state.
gui_related: true
depends_on: [SIR-004, SIR-005, SIR-007, SIR-015, SIR-017]
unblocks: []
acceptance_criteria:
  - All 22 commands use ExecutionTopology request/result/error/availability/permission contracts and the sole handlers listed above.
  - Success cannot survive stale owner, topology, or operation generations; restart success requires reconciliation evidence.
  - Remove, stop, drain, rollback, and default selection return explicit active-work and data dispositions.
  - Every command remains handler_unavailable until its exact native handler has evidence.
validation_surfaces: [Plans/shared_integration_runtime_expansion_contracts.schema.json, Plans/shared_integration_runtime_expansion_fixtures.json, focused SIR expansion validator]
risk_class: topology_identity_race_or_unsettled_work
reasoning_tier: high
context_scope: execution_topology_commands
implementation_surfaces: [Plans/Shared_Integration_Runtime.md, future ExecutionTopologyRegistry]
node_compile_hint: {mode: shared_runtime_static_contract_only, create_worknodes: false, create_nodeseeds: false}
source_lineage: [server-command-gap-adjudication rows 51-75]
negative_constraints: [No inferred success., No implicit Project Home Server change., No hidden work cancellation.]
```

### SIR-026 - Project Host And Source Location Commands

```yaml
plan_unit_id: SIR-026
unit_type: command_contract
status: accepted
owner_doc: Plans/Shared_Integration_Runtime.md
canonical_text: >-
  ProjectHostBinding and SourceLocationRegistry own the eight exact Project topology operations in the inventory.
  Home Server, execution Host, execution policy, and Source Location are separate typed bindings; changing one does
  not silently change routes, move a Project, delete external source payloads, or select another binding.
gui_related: true
depends_on: [SIR-004, SIR-015, SIR-025]
unblocks: []
acceptance_criteria:
  - All eight commands use ProjectTopology request/result/error/availability/permission contracts and the sole handlers listed above.
  - Add/update/remove/set-primary/test settle exact Project and Source Location identities under current generations.
  - Removing a binding never implies deletion of the external source payload.
  - Every command remains handler_unavailable until its exact native handler has evidence.
validation_surfaces: [Plans/shared_integration_runtime_expansion_contracts.schema.json, Plans/shared_integration_runtime_expansion_fixtures.json, focused SIR expansion validator]
risk_class: project_topology_binding_or_external_data_loss
reasoning_tier: high
context_scope: project_topology_commands
implementation_surfaces: [Plans/Shared_Integration_Runtime.md, future ProjectHostBinding and SourceLocationRegistry]
node_compile_hint: {mode: shared_runtime_static_contract_only, create_worknodes: false, create_nodeseeds: false}
source_lineage: [server-command-gap-adjudication rows 106-108 and 122-127]
negative_constraints: [No implicit Project Move., No implicit route change., No external payload deletion.]
```

### SIR-027 - Installation Ownership Extension Commands

```yaml
plan_unit_id: SIR-027
unit_type: command_contract
status: accepted
owner_doc: Plans/Shared_Integration_Runtime.md
canonical_text: >-
  InstallationLifecycleManager owns attach-external, detach-external, remove, and tool-package license approval as
  distinct exact commands. External provenance and external data remain externally owned; destructive disposition,
  active dependencies, reviewed package/version/license identity, and exact return are explicit.
gui_related: true
depends_on: [SIR-010, SIR-020, SIR-021]
unblocks: []
acceptance_criteria:
  - All four commands use InstallationOwnership request/result/error/availability/permission contracts and the sole handlers listed above.
  - Detach does not delete external data, and remove requires explicit ownership/dependency/data disposition.
  - License approval is valid only for the exact reviewed package, version, provenance, and terms generation.
  - Every command remains handler_unavailable until its exact native handler has evidence.
validation_surfaces: [Plans/shared_integration_runtime_expansion_contracts.schema.json, Plans/shared_integration_runtime_expansion_fixtures.json, focused SIR expansion validator]
risk_class: installation_ownership_or_license_mismatch
reasoning_tier: high
context_scope: installation_ownership_commands
implementation_surfaces: [Plans/Shared_Integration_Runtime.md, future InstallationLifecycleManager]
node_compile_hint: {mode: shared_runtime_static_contract_only, create_worknodes: false, create_nodeseeds: false}
source_lineage: [server-command-gap-adjudication rows 84-88 and 154]
negative_constraints: [No silent external mutation., No implicit external data deletion., No stale license approval.]
```

### SIR-028 - Local Action And Compatibility Normalization Boundary

```yaml
plan_unit_id: SIR-028
unit_type: boundary_contract
status: accepted
owner_doc: Plans/Shared_Integration_Runtime.md
canonical_text: >-
  Fourteen presentation and projection behaviors remain typed owner-local UI actions, while 33 packet spellings are
  compatibility inputs that normalize to exact canonical commands before permission and dispatch. Neither group
  creates a peer semantic command, handler, availability owner, or domain event.
gui_related: true
depends_on: [SIR-006, SIR-019, SIR-020, SIR-024, SIR-025, SIR-026, SIR-027]
unblocks: []
acceptance_criteria:
  - Every local action preserves current projection, accessibility description, focus, and exact return settlement without command registration.
  - Protected-auth local actions remain human-only and never expose protected browser content to agents or adapters.
  - Every alias normalizes before availability, permission, policy, and handler dispatch and inherits only its exact target's behavior.
  - Fixtures cover all 47 rows and reject local peer handlers, local domain events, source registration, late normalization, and wrong targets.
validation_surfaces: [Plans/shared_integration_runtime_expansion_contracts.schema.json, Plans/shared_integration_runtime_expansion_fixtures.json, focused SIR expansion validator]
risk_class: duplicate_command_owner_or_protected_ui_boundary_bypass
reasoning_tier: high
context_scope: sir_local_action_and_alias_normalization
implementation_surfaces: [Plans/Shared_Integration_Runtime.md, future owner-local UI controllers, future compatibility normalizer]
node_compile_hint: {mode: shared_runtime_static_contract_only, create_worknodes: false, create_nodeseeds: false}
source_lineage: [server-command-gap-adjudication SIR-owned typed_local_ui_action and approved_alias_to_exact rows]
negative_constraints: [No source alias registration., No peer handler., No local domain event., No protected content inspection.]
```
