# Shard 040: Post-Integration Forge, Backup, And Connector Permission Addendum - 2026-09-01

Source: `Plans/Permissions_System.md`

Source lines: L9351-L9435

Source SHA256: `65f8cfc8efb2bacf69961629152d9bdba0f2c626c8121147d3ec11b2985f1c53`

---

## Post-Integration Forge, Backup, And Connector Permission Addendum - 2026-09-01

Provider capability discovery is not authorization. Forgejo/Gitea API reads may remain usable when mutation is `read_only`; `handler_unavailable`, insufficient token scope, unsupported API, and denied PM permission remain distinct. `repository_automation` has its own explicit AutomationBinding and does not inherit provider identity, Git credentials, an enabled CI surface, or a user's interactive authority. Repository/branch-policy mutation, force-push, release-asset publication, runner registration/removal, secret/variable submission, and organization administration bind the exact provider instance, repository/environment/runner target, credential scope, permission snapshot, confirmation/currentness tier, and operation generation. Secret values are protected write-only/reference-only inputs and never become inspectable merely because their metadata is readable.

Backup authorization is separately layered: destination login does not unlock encrypted repositories; browse does not grant Recovery Key export; retrieve does not grant restore; ordinary upload credentials do not imply prune/delete/object-lock authority; and tailnet membership does not grant any Backup or PM authority. Recovery material, destination secrets, Headscale pre-auth keys, connector state, and `AuthBrowserSession` content use human-only protected channels unavailable to agents and adapters. In-place Project restore, Full Server replacement, high-risk delete-all/prune, costly archival retrieval, recovery-kit export, connector identity reset, and public Funnel enablement require current explicit target-bound approval. A protected/read-only/unavailable state fails closed and emits only its owner's bounded receipt/projection; it never fabricates an EventRecord or runtime success.

### PS-138 - Forge And Repository Automation Effect Authorization

```yaml
plan_unit_id: PS-138
unit_type: security_contract
status: accepted
owner_doc: Plans/Permissions_System.md
canonical_text: >-
  Forgejo/Gitea hosting effects and repository_automation effects require current target-bound PM permission plus the exact independent provider or AutomationBinding capability. Readable metadata does not grant mutation, repository_automation never inherits interactive credentials or authority, protected secret values remain human-only write/reference inputs, and read_only or handler_unavailable states fail closed without disabling an independently ready Git transport.
gui_related: true
gui_classification_reason: Source Control, Actions & Pipelines, provider administration, and protected secret forms expose capability, permission, read-only, unsupported, confirmation, and unavailable states.
depends_on: [PS-123, PS-125, PS-135, SIR-032, GAAAF-015]
unblocks: []
acceptance_criteria:
  - Git transport credentials, hosting API credentials, and repository_automation AutomationBinding remain independent and cannot authorize one another by provider selection or cached capability.
  - Repository/branch policy, force-push, release assets, runner registration/removal, secrets/variables, and organization administration bind the exact instance, repository/environment/runner target, credential scope, permission/currentness snapshot, risk tier, confirmation, and operation generation.
  - Read-only API capability permits bounded reads only; it does not dispatch mutation and does not mark an independently ready Git transport unavailable.
  - Unsupported API, insufficient token scope, denied PM permission, stale capability/currentness, and handler_unavailable remain distinct denied outcomes.
  - Secret values enter only through the protected human channel, are write-only/reference-only where providers prohibit readback, and remain unavailable to agents, adapters, Chat, Usage, logs, receipts, and recordings.
  - Static permission fixtures and owner projections claim no provider mutation, secret isolation, runner registration, release upload, Git transport, or runtime evidence.
validation_surfaces: [Plans/shared_integration_runtime.schema.json, Plans/shared_integration_runtime_fixtures.json, Plans/protected_auth_browser_contracts.schema.json, Plans/protected_auth_browser_contract_fixtures.json, future provider authorization/effect matrix]
risk_class: provider_capability_or_automation_binding_authority_escalation
reasoning_tier: high
context_scope: post_integration_forge_and_repository_automation_permissions
implementation_surfaces: [Plans/Permissions_System.md, Plans/shared_integration_runtime.schema.json, Plans/protected_auth_browser_contracts.schema.json]
node_compile_hint: {mode: permission_static_contract_only, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - source_ref:packet:PM_Forge_Backup_Tsnet_Post_Integration_Packet_2026-09-01/05_FORGE_CAPABILITY_AND_AUTH_MATRIX.md:23-45
  - source_ref:packet:PM_Forge_Backup_Tsnet_Post_Integration_Packet_2026-09-01/06_SOURCE_AUTHENTICATION_AND_INTERNAL_ROUTING.md:23-37
  - source_ref:packet:PM_Forge_Backup_Tsnet_Post_Integration_Packet_2026-09-01/14_COMMAND_CONTRACTS.md:124-131
  - source_report:scratchpad/pm-forge-backup-tsnet-post-integration-2026-09-01/agent_reports/live_forge_reconciliation.md
preserved_exact_tokens: [Forgejo, Gitea, repository_automation, AutomationBinding, read_only, handler_unavailable, human-only]
negative_constraints:
  - Do not infer provider identity, Git/API credential role, CI authority, secret authority, or mutation permission from a shell, provider label, selected repository, or discovered capability.
  - Do not expose provider secret values or protected auth content to agents or adapters.
  - Do not treat a static capability/permission row as execution or runtime authorization evidence.
```

### PS-139 - Backup Recovery And Connector Protected Effects

```yaml
plan_unit_id: PS-139
unit_type: security_contract
status: accepted
owner_doc: Plans/Permissions_System.md
canonical_text: >-
  Backup destination authorization, repository unlock, browse, retrieve, restore, destructive maintenance, recovery-material export, connector identity reset, and public Funnel enablement are separate effects with separate target-bound permissions and protected human approvals. Tailnet identity is audit context only; AuthBrowserSession, Recovery Key, destination, and connector secrets are non-recordable, non-inspectable, and unavailable to agents/adapters, while protected, read_only, and handler_unavailable states fail closed.
gui_related: true
gui_classification_reason: Backup setup/restore, recovery-kit handoff, Remote Access, Funnel, and destructive confirmation surfaces display these distinct protected permission states.
depends_on: [PS-075, PS-082, PS-095, PS-136, SIR-032, GAAAF-015]
unblocks: []
acceptance_criteria:
  - Destination authentication does not unlock encrypted backup repositories; list/browse, retrieve/export, restore, key export, prune/delete, object-lock maintenance, and costly archival retrieval use separate applicable permissions.
  - Recovery Key/kit export is owner-step-up, audience-bound, short-lived, exact-Client, no-store, and human-only; ordinary agents/adapters and snapshot browsers cannot reveal or redeem recovery material.
  - In-place Project restore and Full Server replacement bind immutable snapshot/capture identity, exact target, permission/currentness generation, pre-restore recovery or explicit emergency consent, and destructive confirmation.
  - Routine Backup credentials lack unnecessary prune/delete authority; protected prune/delete-all, retention-lock change, and billable archival retrieval require distinct current approval and keep the last known good recovery point unless explicitly overridden.
  - Tailnet membership, connector WhoIs identity, or route reachability never grants PM, Backup, restore, forge, repository_automation, or administrator authority.
  - Connector identity reset is distinct from disable/signout and destructive; Funnel enablement requires explicit public-exposure consent and all PM ingress security gates, while handler_unavailable/read_only/protected states cannot dispatch.
  - AuthBrowserSession and connector/recovery/destination secret content remain human-only, non-recordable, non-inspectable, non-persistent in ordinary state, and unavailable to agents/adapters; static contracts claim no runtime isolation or successful effect.
validation_surfaces: [Plans/protected_auth_browser_contracts.schema.json, Plans/protected_auth_browser_contract_fixtures.json, Plans/shared_integration_runtime.schema.json, Plans/shared_integration_runtime_fixtures.json, future Backup/restore/connector permission and secret-exclusion matrices]
risk_class: recovery_or_connector_protected_effect_authority_escalation
reasoning_tier: high
context_scope: post_integration_backup_recovery_and_connector_permissions
implementation_surfaces: [Plans/Permissions_System.md, Plans/protected_auth_browser_contracts.schema.json, Plans/shared_integration_runtime.schema.json]
node_compile_hint: {mode: permission_static_contract_only, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - source_ref:packet:PM_Forge_Backup_Tsnet_Post_Integration_Packet_2026-09-01/08_CLOUD_DESTINATIONS_AND_SIGN_IN.md:55-61
  - source_ref:packet:PM_Forge_Backup_Tsnet_Post_Integration_Packet_2026-09-01/09_ENCRYPTION_RECOVERY_KEY_AND_DELIVERY.md:23-61
  - source_ref:packet:PM_Forge_Backup_Tsnet_Post_Integration_Packet_2026-09-01/10_RESTORE_BROWSE_RETRIEVE_GUI_AND_SAFETY.md:15-69
  - source_ref:packet:PM_Forge_Backup_Tsnet_Post_Integration_Packet_2026-09-01/11_BACKUP_AUTOMATION_RETENTION_AND_OPERATIONS.md:23-37
  - source_ref:packet:PM_Forge_Backup_Tsnet_Post_Integration_Packet_2026-09-01/13_TSNET_INTEGRATION_AND_CROSS_DOMAIN_BOUNDARIES.md:31-45
  - source_ref:packet:PM_Forge_Backup_Tsnet_Post_Integration_Packet_2026-09-01/tsnet/07_SECURITY_BACKUP_UPDATE_BOUNDARIES.md:3-64
  - source_report:scratchpad/pm-forge-backup-tsnet-post-integration-2026-09-01/agent_reports/backup_cross_owner_patch_map.md
preserved_exact_tokens: [Backup Recovery Key, AuthBrowserSession, human-only, non-recordable, non-inspectable, handler_unavailable, read_only, Funnel, WhoIs]
negative_constraints:
  - Do not let tailnet membership, destination login, repository browse, or a capability projection substitute for effect-specific PM authorization.
  - Do not expose Recovery Key, recovery kit, destination credential, connector state, authorization URL, pre-auth key, or AuthBrowserSession content to agents, adapters, logs, recordings, screenshots, receipts, Chat, or Usage.
  - Do not claim restore, prune, archival retrieval, identity reset, Funnel exposure, secret isolation, or runtime authorization from static fixtures.
```
