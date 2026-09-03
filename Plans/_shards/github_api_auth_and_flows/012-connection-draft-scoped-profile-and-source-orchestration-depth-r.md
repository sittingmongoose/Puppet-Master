# Shard 012: Connection Draft, Scoped Profile, And Source-Orchestration Depth Repair - 2026-09-02

Source: `Plans/GitHub_API_Auth_and_Flows.md`

Source lines: L1005-L1113

Source SHA256: `3109298d54ea966d7161ce851efa826bbb71ce09feba86cc2cc2b79fdaa307a2`

---

## Connection Draft, Scoped Profile, And Source-Orchestration Depth Repair - 2026-09-02

### GAAAF-016 - Shared AuthSession And ConnectionDraft Lifecycle

```yaml
plan_unit_id: GAAAF-016
unit_type: security_contract
status: accepted
owner_doc: Plans/GitHub_API_Auth_and_Flows.md
canonical_text: >-
  Shared authentication persists non-secret AuthSession metadata for exact session, initiating Client/session
  generation, owning Server/Host/Environment, provider instance, connection/profile, requested method/scopes,
  continuation and return context, expiry, and nonce/PKCE references while token, verifier, code, cookie, and
  private browser content remain in the secret channel. The active Client opens supported official system
  browser, authorization-code-with-PKCE, provider-approved device, paste-code/official CLI, scoped-token entry,
  registered web callback, or isolated human AuthBrowser flows only when the named provider/app supports them.
  Native callback bridges admit one authenticated transaction to the owning Server; web-only/headless paths do
  not fabricate OOB, device, embedded-browser, localhost, or arbitrary-domain support. Forge, automation, and
  cloud setup begins with a typed inactive ConnectionDraft carrying connection kind, provider/instance/target
  intent, requested scope set, and exact return context. A preexisting authenticated Connection is not required.
  The fixed lifecycle is create inactive draft, start shared AuthSession, select the permitted repository or
  storage path, verify minimum non-destructive capabilities, then atomically activate one Connection. Cancel or
  expiry invalidates callbacks and removes only uncommitted draft attachments after safe cleanup while
  preserving user-owned profiles; restart resumes through a new fenced session. Edit/remove/test/details use
  shared lifecycle commands, global provider configuration is unchanged, and removing a Backup connection
  never deletes Backup data. Connection UI renders service, account, instance, and readable requested
  permissions; extra scope is just-in-time. Refreshable state lives in the owning Server/Environment vault or
  an external secret reference, survives container replacement, and serializes refresh writes per profile.
  Sign Out previews dependencies and detaches/revokes only the exact connection/profile; it never globally
  deletes CLI profiles. Copy Project settings reuses a binding rather than copying a token, and general
  build/test processes never inherit all credentials. Git transport and forge API credential roles remain separate.
gui_related: true
gui_classification_reason: The contract defines first-time connection setup, readable scopes, protected browser handoff, cancellation/restart, activation, reconnect, sign-out, and return behavior.
depends_on: [GAAAF-002, GAAAF-003, GAAAF-004, GAAAF-014, GAAAF-015, SIR-033]
unblocks: [FGI-015, F3-529]
acceptance_criteria:
  - Native, web-only, SSH, container, device, PKCE, official CLI, and scoped-token fixtures bind one exact session/profile/return and reject replay, mismatch, unsupported methods, and laptop-versus-container localhost confusion.
  - First-time no-profile setup has a complete ConnectionDraft create/auth/select/verify/activate path plus cancel and restart without global provider configuration changes.
  - Activation is atomic and requires current non-destructive capability evidence; inactive/cancelled/expired drafts never claim a live Connection.
  - Cancellation expires callbacks and removes only uncommitted draft attachments; user-owned external/CLI profiles and existing Connections survive.
  - Expiry, concurrent refresh, redeployed container, sign-out shared by other Projects, external profile, copy-settings, and general-process isolation fixtures preserve exact profile boundaries and no secret bytes.
validation_surfaces: [Plans/protected_auth_browser_contracts.schema.json, Plans/protected_auth_browser_contract_fixtures.json, python3 scripts/pm-protected-auth-browser-contracts.py validate, future AuthSession callback and ConnectionDraft lifecycle fixtures]
risk_class: auth_session_replay_connection_activation_or_credential_scope_escape
reasoning_tier: high
context_scope: shared_auth_session_connection_draft_and_profile_lifecycle
implementation_surfaces: [Plans/GitHub_API_Auth_and_Flows.md, Plans/protected_auth_browser_contracts.schema.json, Plans/protected_auth_browser_contract_fixtures.json, future auth broker and connection lifecycle coordinator]
node_compile_hint: {mode: static_auth_lifecycle_contract_only, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - source_ref:packet:PM_Forge_Backup_Tsnet_Post_Integration_Packet_2026-09-01/06_SOURCE_AUTHENTICATION_AND_INTERNAL_ROUTING.md:7-13
  - source_ref:packet:PM_Forge_Backup_Tsnet_Post_Integration_Packet_2026-09-01/06_SOURCE_AUTHENTICATION_AND_INTERNAL_ROUTING.md:15-21
  - source_ref:packet:PM_Forge_Backup_Tsnet_Post_Integration_Packet_2026-09-01/06_SOURCE_AUTHENTICATION_AND_INTERNAL_ROUTING.md:23-29
  - source_ref:packet:PM_Forge_Backup_Tsnet_Post_Integration_Packet_2026-09-01/06_SOURCE_AUTHENTICATION_AND_INTERNAL_ROUTING.md:31-37
  - source_ref:packet:PM_Forge_Backup_Tsnet_Post_Integration_Packet_2026-09-01/06_SOURCE_AUTHENTICATION_AND_INTERNAL_ROUTING.md:39-45
  - source_ref:packet:PM_Forge_Backup_Tsnet_Post_Integration_Packet_2026-09-01/05_FORGE_CAPABILITY_AND_AUTH_MATRIX.md:23-29
  - source_ref:corrected-slice:machine__requirements.json__part-005__lines-000801-001020.txt:197-220
  - source_ref:corrected-slice:machine__requirements.json__part-006__lines-001001-001220.txt:13-29
  - source_ref:corrected-slice:machine__requirements.json__part-011__lines-002001-002196.txt:125-141
preserved_exact_tokens: [AuthSession, ConnectionDraft, authorization code with PKCE, device authorization, official CLI, guided scoped PAT, initiating Client, owning Server, return context, inactive, atomic activation, Sign Out]
negative_constraints:
  - Do not store tokens, verifiers, authorization codes, PATs, passwords, cookies, or protected browser content in AuthSession, ConnectionDraft, events, Usage, Chat, or ordinary artifacts.
  - Do not fabricate provider auth methods, assume a laptop localhost reaches a container, or use AuthBrowser to bypass embedded-browser restrictions.
  - Do not require a preexisting Connection to create a draft or mutate global provider configuration during draft activation.
  - Do not delete user-owned CLI profiles or Backup data when cancelling/removing one connection.
  - Do not copy tokens with Project settings or expose all credentials to general build/test processes.
  - Do not claim live authentication, callback, browser isolation, vault durability, or runtime activation from static contracts.
```

### GAAAF-017 - Owner-Routed Source Mutation And API Orchestration

```yaml
plan_unit_id: GAAAF-017
unit_type: integration_contract
status: accepted
owner_doc: Plans/GitHub_API_Auth_and_Flows.md
canonical_text: >-
  Repository edits route through local Git or Jujutsu plus Worktree/Workspace Manager on the Source Location's
  authorized Environment; hosted repository/review changes route through ForgeAdapter on the exact authorized
  egress Host; CI changes route through the independently bound AutomationAdapter. Composite publish-and-review
  records ordered suboperations, preconditions, targets, and receipts instead of shell chaining. Shared governor
  leases fence directory, branch, path, and revision. Named Plan, Goal, thread, Source Location, Environment,
  account, and initiating Client lineage travels when present but never becomes identity or authority. GUI,
  command palette, and automation use the same semantic handler; no panel-private implementation or silent
  cross-host/account fallback exists. Output and network errors are scrubbed before EventRecord, Usage, or Chat.
gui_related: true
gui_classification_reason: GUI, palette, and automation share one visible progress/receipt/error path with exact return context.
depends_on: [GAAAF-016, SCS-015, SCS-016, FGI-014]
unblocks: [F3-529]
acceptance_criteria:
  - One GUI action, palette invocation, and automation request produce the same ordered semantic suboperations and owner receipts.
  - Local source, forge API, and automation phases remain on their captured Environments, Hosts, accounts, bindings, revisions, and credentials without silent fallback.
  - Shared governor lease loss or revision change invalidates pending approval before any effect.
  - Events, Usage, Chat, logs, and receipts contain scrubbed typed errors rather than URLs with credentials, tokens, headers, or private paths.
validation_surfaces: [Plans/protected_auth_browser_contracts.schema.json, Plans/protected_auth_browser_contract_fixtures.json, Plans/source_control_contracts.schema.json, Plans/source_control_contract_fixtures.json, Plans/forge_integration_contracts.schema.json, Plans/forge_integration_contract_fixtures.json]
risk_class: duplicated_semantic_handler_cross_host_fallback_or_error_secret_leak
reasoning_tier: high
context_scope: source_mutation_and_hosted_api_orchestration
implementation_surfaces: [Plans/GitHub_API_Auth_and_Flows.md, Plans/protected_auth_browser_contracts.schema.json, Plans/protected_auth_browser_contract_fixtures.json, future semantic orchestration handler]
node_compile_hint: {mode: static_orchestration_contract_only, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - source_ref:packet:PM_Forge_Backup_Tsnet_Post_Integration_Packet_2026-09-01/06_SOURCE_AUTHENTICATION_AND_INTERNAL_ROUTING.md:31-37
  - source_ref:corrected-slice:machine__requirements.json__part-005__lines-000801-001020.txt:213-220
  - source_ref:corrected-slice:machine__requirements.json__part-006__lines-001001-001220.txt:13-29
preserved_exact_tokens: [Git/JJ, Worktree Manager, ForgeAdapter, AutomationAdapter, ordered suboperations, shared governor leases, initiating Client]
negative_constraints:
  - Do not chain untracked shell effects or put local edits, forge effects, and CI effects behind one ambient working-directory assumption.
  - Do not treat lineage as authority, fall back to another Host/account, or duplicate a semantic handler inside a GUI panel.
  - Do not emit unredacted output/network errors to events, Usage, Chat, logs, or receipts.
  - Do not claim runtime dispatch, handler implementation, external effects, or security proof from static Plans/schema/fixtures.
```
