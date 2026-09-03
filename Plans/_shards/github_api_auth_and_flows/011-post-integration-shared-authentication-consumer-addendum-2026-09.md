# Shard 011: Post-Integration Shared Authentication Consumer Addendum - 2026-09-01

Source: `Plans/GitHub_API_Auth_and_Flows.md`

Source lines: L955-L1003

Source SHA256: `3109298d54ea966d7161ce851efa826bbb71ce09feba86cc2cc2b79fdaa307a2`

---

## Post-Integration Shared Authentication Consumer Addendum - 2026-09-01

GitHub device-code behavior remains GitHub-specific. Forgejo/Gitea instance authorization, Backup destination authorization, and hosted Tailscale/Headscale connector authorization consume the shared Authentication Broker, auth-profile commands, protected input channels, and `AuthBrowserSession` boundary; this document does not become their semantic owner. Selecting `repository_automation` or a provider binding never silently starts authentication, reuses a GitHub credential for another provider, or grants write authority.

Forgejo and Gitea default to a guided scoped PAT when an instance has no registered OAuth application and may use OAuth/PKCE only for an explicitly registered instance flow. Git transport and hosting API credentials remain separately attached; a read-only API profile blocks API mutation without declaring Git fetch/publish unavailable. Backup Drive/OneDrive uses only provider-supported production registrations, callbacks, and scopes; a missing approval/registration is `handler_unavailable`, not a fabricated working login. Hosted Tailscale authorization is connector-owner work and tailnet identity never authorizes GitHub, forge, Backup, or Puppet Master permissions.

Any permitted interactive fallback enters the protected human-only `AuthBrowserSession` for the exact operation and initiating active Client. It is non-recordable, non-inspectable, non-persistent, inaccessible to agents and adapters, and returns only a redacted lifecycle/currentness outcome. No raw URL, code, token, PAT, cookie, storage state, page representation, connector identity secret, or callback verifier is returned to `repository_automation`, a provider adapter, Backup, Remote Access, Chat, Usage, artifacts, or ordinary Browser tooling.

### GAAAF-015 - Shared Auth Consumers And Protected Handoff Boundary

```yaml
plan_unit_id: GAAAF-015
unit_type: security_contract
status: accepted
owner_doc: Plans/GitHub_API_Auth_and_Flows.md
canonical_text: >-
  GitHub retains its device-code owner contract while Forgejo/Gitea, Backup destinations, and the embedded Tailscale connector consume shared authentication and protected human handoff by exact owner reference. repository_automation never implies provider identity or auth authority; read-only and handler_unavailable states remain truthful; AuthBrowserSession content remains unavailable to agents, adapters, recording, inspection, persistence, and generic Browser navigation.
gui_related: true
gui_classification_reason: Provider setup, Data Backup and Retention, Remote Access, and Actions & Pipelines display exact protected, read-only, unavailable, resume, cancel, and return states.
depends_on: [GAAAF-002, GAAAF-003, GAAAF-004, GAAAF-012, GAAAF-014, SIR-033, PS-135]
unblocks: []
acceptance_criteria:
  - GitHub device-code auth stays GitHub-specific and no GitHub credential authorizes Forgejo, Gitea, Backup, connector, or repository_automation operations.
  - Forgejo/Gitea use guided scoped PAT by default or an explicitly registered instance OAuth/PKCE flow; Git and API credential roles remain separate.
  - Read-only hosting API state blocks API mutation without disabling independently ready Git transport.
  - Missing Backup OAuth registration/approval/callback evidence remains handler_unavailable and no synthetic login success is exposed.
  - Protected handoff binds Server, Host, resource, profile, continuation, requested-scope ref, operation generation, initiating Client/session generation, and exact return target while exposing no protected content.
  - AuthBrowserSession is human-only, non-recordable, non-inspectable, non-persistent, and inaccessible to agents and adapters for every consumer.
  - Static schemas and fixtures claim no real provider login, callback, secret-isolation, browser-process isolation, or runtime evidence.
validation_surfaces: [Plans/protected_auth_browser_contracts.schema.json, Plans/protected_auth_browser_contract_fixtures.json, python3 scripts/pm-protected-auth-browser-contracts.py validate, python3 scripts/pm-new-contracts-verify.py]
risk_class: cross_provider_credential_reuse_or_protected_auth_exposure
reasoning_tier: high
context_scope: shared_auth_consumer_and_protected_handoff
implementation_surfaces: [Plans/GitHub_API_Auth_and_Flows.md, Plans/protected_auth_browser_contracts.schema.json, Plans/protected_auth_browser_contract_fixtures.json]
node_compile_hint: {mode: static_auth_consumer_contract_only, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - source_ref:packet:PM_Forge_Backup_Tsnet_Post_Integration_Packet_2026-09-01/05_FORGE_CAPABILITY_AND_AUTH_MATRIX.md:23-45
  - source_ref:packet:PM_Forge_Backup_Tsnet_Post_Integration_Packet_2026-09-01/06_SOURCE_AUTHENTICATION_AND_INTERNAL_ROUTING.md:7-45
  - source_ref:packet:PM_Forge_Backup_Tsnet_Post_Integration_Packet_2026-09-01/08_CLOUD_DESTINATIONS_AND_SIGN_IN.md:31-61
  - source_ref:packet:PM_Forge_Backup_Tsnet_Post_Integration_Packet_2026-09-01/13_TSNET_INTEGRATION_AND_CROSS_DOMAIN_BOUNDARIES.md:31-45
  - source_ref:packet:PM_Forge_Backup_Tsnet_Post_Integration_Packet_2026-09-01/14_COMMAND_CONTRACTS.md:15-37
  - source_report:scratchpad/pm-forge-backup-tsnet-post-integration-2026-09-01/agent_reports/coverage_verification.md:84-93
preserved_exact_tokens: [Forgejo, Gitea, repository_automation, read-only, handler_unavailable, AuthBrowserSession, human-only, non-recordable, non-inspectable]
negative_constraints:
  - Do not make this GitHub document the semantic owner of Forgejo/Gitea, Backup, connector, or generic authentication.
  - Do not infer auth, identity, scope, or write authority from the selected shell, provider label, tailnet membership, or a cached capability.
  - Do not expose protected content to agents, adapters, Browser tools, artifacts, recordings, inspection, persistence, logs, Chat, or Usage.
  - Do not claim runtime authentication, provider approval, callback operation, or security isolation from static fixtures.
```
