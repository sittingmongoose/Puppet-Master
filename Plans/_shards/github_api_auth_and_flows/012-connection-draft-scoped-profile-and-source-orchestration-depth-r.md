# Shard 012: Connection Draft, Scoped Profile, And Source-Orchestration Depth Repair - 2026-09-02

Source: `Plans/GitHub_API_Auth_and_Flows.md`

Source lines: L1020-L1310

Source SHA256: `fd52a7262fec3af2cb9c01bc9c9e37eb643c4a1d146bd05617d04107cdd8c5e5`

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
  The selected account readiness list is shared by New Project, onboarding and detached copy, resolved on the exact work Computer/Host/Environment. Same-Computer reuse requires that explicit account choice; cross-Computer selection creates only refs/intention until the destination owner verifies readiness or prompts protected sign-in. N15 Later uses explicit application-scope AI/auth binding, not a fake Project-bound Connection.
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
- /mnt/Cursor/share/puppet-master/2026-11-02-projects-pass2/README.md (accepted cards P1-P12, S1-S16, N15/N25 and
  Y1/O1-O3 as applicable)
- 'Jared, 2026-11-03 (verbatim): I approve the outstanding questions with their recommended settings.'
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
  All Forge/SCM publication phases consume PS-146/147/148 authority. Requested YOLO create/push/publish and listed Plan-bound grant actions run without another ordinary yes; task policy, exact target, provider capability, FileSafe, secret handling and Stop/revocation still revalidate at dispatch. No Orchestrator grant authorizes Azure human team-project administration, paid signups or secret export.
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
- /mnt/Cursor/share/puppet-master/2026-11-02-projects-pass2/README.md (accepted cards P1-P12, S1-S16, N15/N25 and
  Y1/O1-O3 as applicable)
- 'Jared, 2026-11-03 (verbatim): I approve the outstanding questions with their recommended settings.'
preserved_exact_tokens: [Git/JJ, Worktree Manager, ForgeAdapter, AutomationAdapter, ordered suboperations, shared governor leases, initiating Client]
negative_constraints:
  - Do not chain untracked shell effects or put local edits, forge effects, and CI effects behind one ambient working-directory assumption.
  - Do not treat lineage as authority, fall back to another Host/account, or duplicate a semantic handler inside a GUI panel.
  - Do not emit unredacted output/network errors to events, Usage, Chat, logs, or receipts.
  - Do not claim runtime dispatch, handler implementation, external effects, or security proof from static Plans/schema/fixtures.
```


<a id="GAAAF-077"></a>
### GAAAF-077 - auth.github.authenticated prepared event contract

```yaml
plan_unit_id: GAAAF-077
unit_type: contract
status: accepted
owner_doc: Plans/GitHub_API_Auth_and_Flows.md
canonical_text: >-
  auth.github.authenticated prepared event contract. This is a newly authored owner contract under DL-045, prepared without admission.
gui_related: false
gui_classification_reason: Defines persisted contract behavior and no visual presentation.
depends_on: [DL-045, SP-670]
unblocks: []
acceptance_criteria:
- Exact-family schema and semantic checks pass; no event is emitted before separate admission.
validation_surfaces: [scripts/pm-dg6b-event-contracts.py]
risk_class: event_authority
reasoning_tier: high
context_scope: event_authority_dg6b
source_lineage:
- Plans/Decision_Log.md#DL-045
- reports/event-authority-20261104/DG6B.md
implementation_surfaces: [Plans/GitHub_API_Auth_and_Flows.md, Plans/dg6b_event_contracts.schema.json]
node_compile_hint: {mode: contract_only, create_worknodes: false}
```

**Newly authored owner contract for `auth.github.authenticated` at payload version `1.0.0`.** Search: exact token in live top-level Plans Markdown/JSON/JSONL, then this owner, Contracts EventRecord/AuthEvent, Storage SP-278/SP-286/SP-291/SP-336 and storage_value_registry. Existing semantic condition is retained; no exact closed payload, producer receipt binding, identity recipe or named operating consumer was found. Reuse the generic index and first-receipt custody. Per-family search matches and source hashes are pinned in the DG6B report. This draft admits nothing; `auth.github.authenticated` remains non-emitting until separate registration and retention resolution.

Producer: **github_api OAuth token-success handler**. Pending auth reaches authenticated only after the OS credential store confirms the token write; no token is copied into event storage. The payload is exactly `Plans/dg6b_event_contracts.schema.json#/$defs/auth_github_authenticated` (closed root; no extension map). Storage `SP-670` below is this family's own persistence contract. `subject_ref` identifies the original pending auth flow/account binding or plugin operation subject, never a display login or mutable plugin label. The `revision` is the observed operation revision; it cannot be advanced by retry. Actor identity comes from authenticated command/runtime custody, not a payload assertion.

Do not add UI, auth providers, hooks, permissions or command behavior from this draft. Original bodies stay with the existing credential/plugin owner. Evidence refs are resolved only through current owner authorization. Event text contains metadata and refs, never raw prompts, hook output, token/device_code secrets or credential values. This contract does not assign retention or deletion policy.



<a id="GAAAF-078"></a>
### GAAAF-078 - auth.github.device_code.issued prepared event contract

```yaml
plan_unit_id: GAAAF-078
unit_type: contract
status: accepted
owner_doc: Plans/GitHub_API_Auth_and_Flows.md
canonical_text: >-
  auth.github.device_code.issued prepared event contract. This is a newly authored owner contract under DL-045, prepared without admission.
gui_related: false
gui_classification_reason: Defines persisted contract behavior and no visual presentation.
depends_on: [DL-045, SP-670]
unblocks: []
acceptance_criteria:
- Exact-family schema and semantic checks pass; no event is emitted before separate admission.
validation_surfaces: [scripts/pm-dg6b-event-contracts.py]
risk_class: event_authority
reasoning_tier: high
context_scope: event_authority_dg6b
source_lineage:
- Plans/Decision_Log.md#DL-045
- reports/event-authority-20261104/DG6B.md
implementation_surfaces: [Plans/GitHub_API_Auth_and_Flows.md, Plans/dg6b_event_contracts.schema.json]
node_compile_hint: {mode: contract_only, create_worknodes: false}
```

**Newly authored owner contract for `auth.github.device_code.issued` at payload version `1.0.0`.** Search: exact token in live top-level Plans Markdown/JSON/JSONL, then this owner, Contracts EventRecord/AuthEvent, Storage SP-278/SP-286/SP-291/SP-336 and storage_value_registry. Existing semantic condition is retained; no exact closed payload, producer receipt binding, identity recipe or named operating consumer was found. Reuse the generic index and first-receipt custody. Per-family search matches and source hashes are pinned in the DG6B report. This draft admits nothing; `auth.github.device_code.issued` remains non-emitting until separate registration and retention resolution.

Producer: **github_api device-code response handler**. A successful device-code response creates the non-secret pending auth record before presentation. Keep device_code in credential custody; the event carries only its ref, never user_code or verification content. The payload is exactly `Plans/dg6b_event_contracts.schema.json#/$defs/auth_github_device_code_issued` (closed root; no extension map). Storage `SP-670` below is this family's own persistence contract. `subject_ref` identifies the original pending auth flow/account binding or plugin operation subject, never a display login or mutable plugin label. The `revision` is the observed operation revision; it cannot be advanced by retry. Actor identity comes from authenticated command/runtime custody, not a payload assertion.

Do not add UI, auth providers, hooks, permissions or command behavior from this draft. Original bodies stay with the existing credential/plugin owner. Evidence refs are resolved only through current owner authorization. Event text contains metadata and refs, never raw prompts, hook output, token/device_code secrets or credential values. This contract does not assign retention or deletion policy.



<a id="GAAAF-079"></a>
### GAAAF-079 - auth.github.disconnected prepared event contract

```yaml
plan_unit_id: GAAAF-079
unit_type: contract
status: accepted
owner_doc: Plans/GitHub_API_Auth_and_Flows.md
canonical_text: >-
  auth.github.disconnected prepared event contract. This is a newly authored owner contract under DL-045, prepared without admission.
gui_related: false
gui_classification_reason: Defines persisted contract behavior and no visual presentation.
depends_on: [DL-045, SP-670]
unblocks: []
acceptance_criteria:
- Exact-family schema and semantic checks pass; no event is emitted before separate admission.
validation_surfaces: [scripts/pm-dg6b-event-contracts.py]
risk_class: event_authority
reasoning_tier: high
context_scope: event_authority_dg6b
source_lineage:
- Plans/Decision_Log.md#DL-045
- reports/event-authority-20261104/DG6B.md
implementation_surfaces: [Plans/GitHub_API_Auth_and_Flows.md, Plans/dg6b_event_contracts.schema.json]
node_compile_hint: {mode: contract_only, create_worknodes: false}
```

**Newly authored owner contract for `auth.github.disconnected` at payload version `1.0.0`.** Search: exact token in live top-level Plans Markdown/JSON/JSONL, then this owner, Contracts EventRecord/AuthEvent, Storage SP-278/SP-286/SP-291/SP-336 and storage_value_registry. Existing semantic condition is retained; no exact closed payload, producer receipt binding, identity recipe or named operating consumer was found. Reuse the generic index and first-receipt custody. Per-family search matches and source hashes are pinned in the DG6B report. This draft admits nothing; `auth.github.disconnected` remains non-emitting until separate registration and retention resolution.

Producer: **github_api disconnect handler**. An authenticated account is disconnected only after the existing credential-owner disconnect result is durable. This event records that result; it does not define token deletion, remote revocation, or new account removal policy. The payload is exactly `Plans/dg6b_event_contracts.schema.json#/$defs/auth_github_disconnected` (closed root; no extension map). Storage `SP-670` below is this family's own persistence contract. `subject_ref` identifies the original pending auth flow/account binding or plugin operation subject, never a display login or mutable plugin label. The `revision` is the observed operation revision; it cannot be advanced by retry. Actor identity comes from authenticated command/runtime custody, not a payload assertion.

Do not add UI, auth providers, hooks, permissions or command behavior from this draft. Original bodies stay with the existing credential/plugin owner. Evidence refs are resolved only through current owner authorization. Event text contains metadata and refs, never raw prompts, hook output, token/device_code secrets or credential values. This contract does not assign retention or deletion policy.



<a id="GAAAF-080"></a>
### GAAAF-080 - auth.github.failed prepared event contract

```yaml
plan_unit_id: GAAAF-080
unit_type: contract
status: accepted
owner_doc: Plans/GitHub_API_Auth_and_Flows.md
canonical_text: >-
  auth.github.failed prepared event contract. This is a newly authored owner contract under DL-045, prepared without admission.
gui_related: false
gui_classification_reason: Defines persisted contract behavior and no visual presentation.
depends_on: [DL-045, SP-670]
unblocks: []
acceptance_criteria:
- Exact-family schema and semantic checks pass; no event is emitted before separate admission.
validation_surfaces: [scripts/pm-dg6b-event-contracts.py]
risk_class: event_authority
reasoning_tier: high
context_scope: event_authority_dg6b
source_lineage:
- Plans/Decision_Log.md#DL-045
- reports/event-authority-20261104/DG6B.md
implementation_surfaces: [Plans/GitHub_API_Auth_and_Flows.md, Plans/dg6b_event_contracts.schema.json]
node_compile_hint: {mode: contract_only, create_worknodes: false}
```

**Newly authored owner contract for `auth.github.failed` at payload version `1.0.0`.** Search: exact token in live top-level Plans Markdown/JSON/JSONL, then this owner, Contracts EventRecord/AuthEvent, Storage SP-278/SP-286/SP-291/SP-336 and storage_value_registry. Existing semantic condition is retained; no exact closed payload, producer receipt binding, identity recipe or named operating consumer was found. Reuse the generic index and first-receipt custody. Per-family search matches and source hashes are pinned in the DG6B report. This draft admits nothing; `auth.github.failed` remains non-emitting until separate registration and retention resolution.

Producer: **github_api device-flow failure handler**. The pending flow stops on expired_token, unsupported_grant_type, incorrect_client_credentials, incorrect_device_code or access_denied. authorization_pending and slow_down are polling outcomes, not terminal failures. Network/rate-limited recovery follows the existing auth owner. The payload is exactly `Plans/dg6b_event_contracts.schema.json#/$defs/auth_github_failed` (closed root; no extension map). Storage `SP-670` below is this family's own persistence contract. `subject_ref` identifies the original pending auth flow/account binding or plugin operation subject, never a display login or mutable plugin label. The `revision` is the observed operation revision; it cannot be advanced by retry. Actor identity comes from authenticated command/runtime custody, not a payload assertion.

Do not add UI, auth providers, hooks, permissions or command behavior from this draft. Original bodies stay with the existing credential/plugin owner. Evidence refs are resolved only through current owner authorization. Event text contains metadata and refs, never raw prompts, hook output, token/device_code secrets or credential values. This contract does not assign retention or deletion policy.



<a id="GAAAF-081"></a>
### GAAAF-081 - auth.github.token.polling prepared event contract

```yaml
plan_unit_id: GAAAF-081
unit_type: contract
status: accepted
owner_doc: Plans/GitHub_API_Auth_and_Flows.md
canonical_text: >-
  auth.github.token.polling prepared event contract. This is a newly authored owner contract under DL-045, prepared without admission.
gui_related: false
gui_classification_reason: Defines persisted contract behavior and no visual presentation.
depends_on: [DL-045, SP-670]
unblocks: []
acceptance_criteria:
- Exact-family schema and semantic checks pass; no event is emitted before separate admission.
validation_surfaces: [scripts/pm-dg6b-event-contracts.py]
risk_class: event_authority
reasoning_tier: high
context_scope: event_authority_dg6b
source_lineage:
- Plans/Decision_Log.md#DL-045
- reports/event-authority-20261104/DG6B.md
implementation_surfaces: [Plans/GitHub_API_Auth_and_Flows.md, Plans/dg6b_event_contracts.schema.json]
node_compile_hint: {mode: contract_only, create_worknodes: false}
```

**Newly authored owner contract for `auth.github.token.polling` at payload version `1.0.0`.** Search: exact token in live top-level Plans Markdown/JSON/JSONL, then this owner, Contracts EventRecord/AuthEvent, Storage SP-278/SP-286/SP-291/SP-336 and storage_value_registry. Existing semantic condition is retained; no exact closed payload, producer receipt binding, identity recipe or named operating consumer was found. Reuse the generic index and first-receipt custody. Per-family search matches and source hashes are pinned in the DG6B report. This draft admits nothing; `auth.github.token.polling` remains non-emitting until separate registration and retention resolution.

Producer: **github_api device-flow poll response handler**. Only a live unexpired pending flow may poll. authorization_pending preserves cadence; slow_down increases it by exactly five seconds before the next request. This history records a completed polling observation, never instructs replay to send a request. The payload is exactly `Plans/dg6b_event_contracts.schema.json#/$defs/auth_github_token_polling` (closed root; no extension map). Storage `SP-670` below is this family's own persistence contract. `subject_ref` identifies the original pending auth flow/account binding or plugin operation subject, never a display login or mutable plugin label. The `revision` is the observed operation revision; it cannot be advanced by retry. Actor identity comes from authenticated command/runtime custody, not a payload assertion.

Do not add UI, auth providers, hooks, permissions or command behavior from this draft. Original bodies stay with the existing credential/plugin owner. Evidence refs are resolved only through current owner authorization. Event text contains metadata and refs, never raw prompts, hook output, token/device_code secrets or credential values. This contract does not assign retention or deletion policy.
