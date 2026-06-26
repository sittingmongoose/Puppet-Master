# MCP Integration


This document is the single-owner SSOT for PM MCP configuration, naming, availability, credential binding, and invalidation.

ContractRef: ContractName:Plans/Tools.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Permissions_System.md

## 1. Canonical naming

This section defines the canonical contract for this surface.

The packet-shape and `/retire` guard: `## 1. Canonical naming`, `## 2. Requested versus effective availability`, `## 3. Credential binding and invalidation`, and `## 4. Cross-surface responsibilities` are section-owned MCP canon. Regeneration must repair or replace those sections in place and must not keep an append-only file-creation packet beside the live owner sections. `/retire` applies to slash-form or dual-format naming residue and stale consumer wording; the stored naming, auth-state, and effective-availability enums remain the owner contract below.

Core rules:
- canonical naming uses underscore form `{server_slug}_{tool_name}`
- MCP tool identity is underscore-only in stored and permission-facing contracts. Slash-form or dual-format `_` / `/` naming canon is retired outside this owner contract; consumer surfaces may display friendly labels but must join back to `{server_slug}_{tool_name}`.
- Credential lifecycle still surfaces `LoggedIn | LoggedOut | AuthExpired | AuthFailed`, but that lifecycle vocabulary does not redefine the naming format.

Fields:
- {server_slug}_{tool_name}
- LoggedIn | LoggedOut | AuthExpired | AuthFailed

Labels and values:
- canonical naming
- underscore-only
## 2. Requested versus effective availability

This section defines the canonical contract for this surface.

Core rules:
- requested and effective MCP availability remain distinct disclosure surfaces
- Requested availability uses `authenticated | expired | not_authenticated`.
- Effective availability uses `connected | disabled | needs_auth | needs_client_registration | failed`.
- The individual auth-state tokens are `authenticated`, `expired`, and `not_authenticated`; the individual effective-state tokens are `connected`, `disabled`, `needs_auth`, `needs_client_registration`, and `failed`.
- requested vs effective MCP availability remains canonical across runtime and GUI surfaces.
- effective state depends on the enabled flag, auth state, server health, project context, and policy/permission state.
- Traceability label `/effective-state` maps to this requested-versus-effective availability owner section; consumer-style paraphrases must not replace the stored enum values.

Fields:
- authenticated | expired | not_authenticated
- connected | disabled | needs_auth | needs_client_registration | failed

Labels and values:
- requested availability
- effective availability
- /effective-state
## 3. Credential binding and invalidation

This section defines the canonical contract for this surface.

Core rules:
- credential binding or invalidation behavior remains MCP-owned canon
- persist tokens securely
- bind stored credentials to the effective remote server URL
- if the configured URL changes, previously stored credentials become invalid for that server binding
- Auth lifecycle outcomes surface as `LoggedIn | LoggedOut | AuthExpired | AuthFailed` for bound, missing, expired, or failed credentials.
- Traceability label `/invalidation` maps to credential invalidation here; `obl-065` is the MCP owner obligation for this auth/effective-state/naming contract family.

Labels and values:
- credential binding
- invalidation
- /invalidation
- obl-065

Rules:
- LoggedIn | LoggedOut | AuthExpired | AuthFailed
## 4. Cross-surface responsibilities

- `Plans/Tools.md` consumes MCP naming and tool-registry behavior.
- `Plans/storage-plan.md` consumes requested/effective availability and audit projection fields.
- `Plans/Permissions_System.md` consumes permission-key behavior, not a competing auth-state taxonomy.
- `Plans/newtools.md` and GUI summary surfaces reference this document as the live SSOT for MCP availability and credential vocabulary.
- Observability-first MCP bridges for Debug Mode expose read-only APM `/logs/metrics` connectors for production-like failures; their data-plane trust model is distinct from local probes and does not grant mutation authority.
- `Plans/interview-subagent-integration.md` / `/interview-subagent-integration.md` consumes MCP account visibility, canonical persona naming, stage-to-role mapping, and current role vocabulary when interview tooling resolves which account, persona, or provider context is effective.
- `Prompt_Pipeline` / `Prompt_Pipeline.md` remains the owner for effective-resolution schema; MCP integration must not duplicate a thinner subset of those fields directly on `TierContext`.
- MCP route and event consumers use canonical `/subject` vocabulary alongside blocked-action aliases, so command, tool, and integration events can route concerns without inventing another subject model.
- thread-level MCP surfacing exposes switch, `/concern/trust`, and trust state paths in provider/account views instead of leaving those states only to Orchestrator pages.

ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Models_System.md

## 5. Server config schema

MCP server config is implementation-facing canon, not a GUI-only convenience shape.

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/FinalGUISpec.md

Schema isolation and OAuth state are MCP-owned cross-runtime concerns. MCP schema handling tracks visited `$ref` values during resolution and breaks recursive schema cycles on revisit by substituting `{}` and logging a warning. Resolved schemas have a maximum depth of 32 and a size cap of 64 KiB; schemas larger than 64 KiB after resolution are rejected. Provider schema adapters preserve the compatibility facts needed by downstream tool validators, including Gemini rewrites from `anyOf` to `oneOf`, stripping unsupported `const`, and rejecting or mapping unsupported `contentEncoding` where the target provider cannot honor it.

MCP OAuth state is keyed by provider/scope/client semantics rather than only by server identity. Tokens live in the shared credential store, token sharing is keyed by provider+scope rather than MCP server, and refresh uses compare-and-swap before replacing the effective token/client binding. PM owns a shared local HTTP listener callback model, cross-referenced to GitHub_API_Auth_and_Flows.md, with explicit bind-address selection for non-default, remote, or `/containerized` environments; the selected listener address, callback path, client id, provider scope, and auth-state evidence remain stable across refresh/retry flows and must not be hidden in tool-specific state.

This owner text closes the prior shared-listener under-specification by making listener identity, bind address, client id, provider scope, retry, and OAuth/auth-state evidence explicit.

Canonical config fields include:
- `server_id`
- `enabled`
- `timeout_ms`
- local launch fields (`command`, `args[]`, `env?`, `working_directory?`)
- runtime handoff fields, including `working_directory`, let MCP tools/providers and `/providers` bridge launches auto-scope to the active worktree via cwd when a worktree is bound
- remote launch fields (`host_id`, `remote_command`, `remote_args[]`, `remote_env?`)
- auth binding fields, including OAuth-disabled / auth-state semantics
- per-tool enable/disable entries independent of connection state; slash-form trace/control label `/disable` maps to this enablement handling and does not replace effective availability

Server-entry config preserves the portable launch shape before projection into provider-specific records. Shared entries carry `enabled` and `timeout_ms`. Local entries use `type: "local"` with `command: string[]` and optional environment data. URL-based remote MCP entries use `type: "remote"` with `url`, optional `headers?`, and `oauth?: object | false`. Remote MCP servers may use automatic OAuth. `oauth: false` disables OAuth auto-detection for API-key/header-only (`/header-only`) servers. When OAuth is enabled, dynamic client registration is supported where the server supports it, and pre-registered client credentials remain allowed. Generated adapter config must stay derived/no-secrets (`/no-secrets`), so provider-facing adapter files are generated from PM-owned MCP records and secrets resolve through secret references or auth bindings instead of being serialized into projected config.

`/config/override/debug` is the read-only debug surface for final effective MCP config, override-layer provenance, auth/client-registration state, and provider projection sync. It closes the old FIX lineage for not-fully-packetized auth/config/override/debug coverage: it may show source layers and redacted derived values, but it does not mutate config, serialize secrets, or bypass policy.

Canonical MCP data records:
- `mcp_server_record` owns server definition fields: `server_id`, `label`, `description`, `transport_kind`, `endpoint_or_command`, `scope`, `ownership`, `secret_ref?`, `enabled`, `last_health_check_at?`, and `last_error?`.
- `transport_kind` is exactly `stdio | sse | http`.
- `scope` is exactly `global | project | profile | external`.
- `ownership` is exactly `pm_managed | external_managed`.
- `mcp_runtime_availability` owns per-runtime availability fields: `server_id`, `runtime_platform_id`, `provider_family_id`, `connection_profile_id?`, `account_id?`, `availability_state`, `reason_code?`, `last_verified_at?`, and `config_sync_state`.
- `availability_state` is exactly `working | not_configured | needs_auth | untrusted_folder | unhealthy | unsupported | external_not_managed`.
- `config_sync_state` is exactly `not_needed | in_sync | out_of_sync | sync_failed`.
- `mcp_tool_record` owns tool fields: `tool_ref`, `server_id`, `label`, `enabled`, and `permission_scope`.

GUI lifecycle labels are derived from the canonical availability states without creating a second enum: `Working`, `Not Configured`, `Needs Auth`, `Untrusted Folder`, `Unhealthy`, `Install Failed`, `Unsupported`, and `External / Not Managed`. `Install Failed` is a setup/install diagnostic label that maps to `unhealthy` plus an install failure reason code, not a separate stored availability state.

MCP resilience is part of the owner contract: PM uses lazy-load startup for enabled servers, runs pre-validation before MCP tool dispatch or provider adapter handoff, keeps cached tool lists as degraded fallback evidence, retries transient startup/health failures before eviction, and preserves stable OAuth state across reconnects. Tool-list cache refresh runs on config change, explicit user action, and periodic TTL. A server is evicted from effective availability only after retry policy, cached tool metadata, TTL/refresh evidence, and OAuth/auth-state evidence show it cannot safely serve the current run.

MCP connection pooling is the default for managed server sessions. PM MUST NOT use a subprocess-per-call model for MCP servers except for explicitly disposable diagnostic probes; long-lived MCP sessions own lifecycle identity, refresh, health, and teardown state through `mcp_server_record` and `mcp_runtime_availability`. Historical OC labels such as `OC-EXEC-107` and `OC-PROV-006` are evidence labels for this pooling rule, not separate canonical schemas.

CLI-provider MCP reference facts:
- PM MCP architecture is host-managed at the central registry, health, permissions, and secrets layer; `/server` or provider-side adapter state is a projection/bridge surface rather than a competing MCP ownership model.
- Each MCP server has a three-level lifecycle: `Registered in PM`, `Configured for provider/runtime`, and `Operational`. `Registered in PM` means the central `mcp_server_record` exists; `Configured for provider/runtime` means the relevant per-provider/per-runtime adapter state is usable for the selected `/runtime`; `Operational` means auth, trust, health, and tool-list evidence pass for the active account/profile/workspace.
- PM owns one central MCP registry of configured servers. Provider-side derived config generation is optional and exists only where a provider transport requires it; `/per-runtime` adapter state proves usability for a concrete execution surface without treating provider config as the MCP source of truth.
- Claude Code CLI remains a CLI-provider surface with profile isolation, MCP support, structured usage evidence, and an explicit setup-state model.
- Gemini CLI MCP/home facts are retired/source-lineage only: auth, extensions, MCP OAuth tokens, history, temp chats, and project registry under `.gemini` must not be implemented as an active PM provider home.
- Cursor CLI MCP support is evaluated through `cursor-agent` under PM-owned home `/XDG` roots; PM records provider-native MCP output as availability evidence without replacing the account/root isolation contract.
- Consumer references include `Plans/Tools.md`, `Plans/newtools.md`, and `Plans/Section15_MVP_Promoted_Features_Spec.md`; slash-form trace labels may render these as `/Tools.md`, `/newtools.md`, or `/Section15_MVP_Promoted_Features_Spec.md`, but ownership stays here.
- Gemini CLI MCP docs/config/command facts (`geminicli.com/docs/tools/mcp-server/`, `mcpServers`, `settings.json`, `gemini mcp add`, enablement files, and redacted env/header diagnostics) remain exact source-lineage tokens only. Active MCP projection for current providers must be proven per provider/runtime.
- Cursor CLI provider-native MCP inspection includes `cursor-agent mcp list`; PM still treats the central MCP records as authoritative and maps provider-native output into those records.
- Cursor CLI MCP durable base lives in the PM-managed Cursor profile root. PM generates or `/refreshed` syncs `.cursor/mcp.json` / `cursor/mcp.json` only when workspace-local MCP visibility is required; this workspace adapter is derived from central records and is not the MCP source of truth.
- DirectApi providers (`Gemini`, `Codex`, `GitHub Copilot`, `Alibaba Coding Plan`, `MiniMax Coding Plan`, `Z.AI Coding Plan`) use PM-native MCP only; no provider-side MCP config files are canonical for `DirectApi` rows, including `MiniMax` and `Z.AI` coding-plan surfaces.
- CLI-provider bridge state is long-lived provider/profile configuration rather than per-call installation: PM maps each CLI's project-vs-user scope onto project-shared versus profile-local MCP records for all supported CLIs, and only creates per-run files when `/workspace` visibility requires an adapter in the active cwd.
- Cursor CLI evidence includes `cursor-agent` headless output modes such as `/stream-json`, auth status, MCP management, model listing, and about `/version` probing; those probes feed MCP availability instead of redefining the account boundary.
- Native CLI probes include `claude mcp list`, which returns server locations plus connection `/auth` status, and `gemini mcp list`, which reports configured-server state even when no MCP servers are present in the current profile.
- Generated provider-facing adapter files are config synchronization artifacts: PM may `/configure`, `/update`, or `/repair` them when provider profile/workspace state changes, while spawn-time regeneration is reserved for derived files that must exist in the exact run worktree.

## 6. Supported flows

Supported owner-level flows are exactly `auth`, `list/status`, `logout`, and `debug`.

ContractRef: ContractName:Plans/Tools.md, ContractName:Plans/newtools.md

Flow rules:
- `auth` resolves missing or expired auth without redefining tool permissions
- `list/status` surfaces requested/effective availability plus last-failure disclosure
- `logout` revokes the effective auth binding without deleting the server definition
- `debug` surfaces connection, handshake, and tool-registration diagnostics without minting a second status vocabulary

## 7. Effective tool availability and GUI surfacing

This section defines the canonical contract for this surface.

Core rules:
- The GUI-facing MCP owner contract preserves the auth-state and effective-availability enums used by downstream GUI consumers.

Fields:
- authenticated | expired | not_authenticated
- connected | disabled | needs_auth | needs_client_registration | failed

Labels and values:
- effective tool availability
- GUI surfacing

Rules:
- GUI summary surfaces reference the MCP SSOT instead of re-owning connection-state vocabulary
- Plans/FinalGUISpec.md#7.4.4 Settings (Unified) panel specification
- Plans/newtools.md#8.2 GUI/settings alignment

Transport-class GUI status labels:
- `DirectApi` providers have no provider-side MCP installation concept. PM-owned MCP tools are `PM Native` / `Directly Available` through the central tool registry, not `Installed on provider`.
- `CliBridge` providers may receive provider-facing adapter config generated at spawn time into the actual run cwd/profile root. GUI status is `Bridged` / `Configured for Provider`; the config is PM-projected, not hand-managed by the user as the default path.
- `ServerBridge` providers such as OpenCode distinguish `PM Managed Server` from `Attached External Server`. For a PM-managed profile, PM may project MCP config for the server profile; for an attached profile, PM may inspect or `/reflect` health and may update through server APIs only when the server contract supports it.

GUI and readiness rules:
- The MCP Configuration GUI lists known servers once and keeps the main row wording user-facing: primary `/status/reason` is `Working` when healthy, otherwise the row shows the concrete error/status/reason while provider-specific transport nuance remains secondary detail.
- Each MCP Configuration GUI row is driven by `mcp_server_record`: one row/card per configured server with server name, brief description, primary user-facing status (`Working` or a plain-language problem), one-line remediation text, scope `/ownership` hint (`PM managed`, `project only`, or `external`), and primary action. The expanded inspector and settings `/inspectors` read per-provider/runtime availability from `mcp_runtime_availability` and show command/transport/endpoint, required credentials `/auth` status, exposed tools, provider `/runtime` detail, last successful health check, logs or last error text, and install/config `/synced` state; the main row collapses to the worst actionable state for the current workspace/runtime instead of raw transport detail.
- Target/provider actions include `Install`, `Configure`, `Set up`, `Repair`, `Reconnect`, `Disable`, `Remove`, and `View logs`, with explicit pending and terminal labels such as `Installing...`, `Configuring...`, `Installed`, `Configured`, and `/success/failure`.
- Skill and tool readiness checks evaluate the effective MCP lifecycle stage; when a required MCP capability is `/unhealthy`, unavailable, or missing, the skill row surfaces `Missing Requirement` or degraded readiness in GUI instead of failing silently at run time.
- First-run provider readiness copy may distinguish credentials, trust, and MCP setup with labels such as `Credentials ready`, `Workspace trust required`, and `MCP configuration pending`.
- Account/profile isolation still applies to MCP bridges: provider-native state such as `auth_state`, `workspace_trust`, `project history`, `mcp approvals`, runtime caches, and MCP OAuth residue remains profile-local unless a PM-managed overlay explicitly projects a safe shared definition.

## Owner / Consumer Map

This source-preserving standardization keeps the owner and consumer boundaries stated in the original document body. During this batch, `Plans/MCP_Integration.md` remains the owner doc for the behavior described by its preserved sections, while cross-doc ownership follows the ContractRefs and boundary notes already present in the original text.

ContractRef: ContractName:Plans/Plan_Document_System.md, ContractName:Plans/Bootstrap_Planning_Migration.md

## PlanUnits

### MI-002 - MCP Owner Scope And ContractRefs

```yaml
plan_unit_id: MI-002
unit_type: requirement
status: accepted
owner_doc: Plans/MCP_Integration.md
canonical_text: MCP_Integration is the single-owner SSOT for Puppet Master MCP configuration, naming, availability, credential binding, and invalidation, with Tools, storage-plan, and Permissions_System as named consumers.
gui_related: false
gui_classification_reason: The unit defines MCP runtime, identity, config, auth, provider, storage, or ownership behavior rather than direct GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through MI-002 instead of broad MI-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: mcp_contract_drift
reasoning_tier: standard
context_scope: mcp_integration_standardization
implementation_surfaces:
- Plans/MCP_Integration.md
node_compile_hint:
  mode: mcp_owner_scope_and_contractrefs
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MCP_Integration-S0001
preserved_exact_tokens:
- MCP Integration
- single-owner SSOT
- PM MCP configuration
- naming
- availability
- credential binding
- invalidation
- 'ContractRef: ContractName:Plans/Tools.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Permissions_System.md'
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/MCP_Integration.md owns MCP configuration, naming, availability, credential binding, invalidation, and GUI surfacing boundaries while referenced owner docs retain their SSOTs.
owner_hints:
- Plans/MCP_Integration.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Tools.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Permissions_System.md'
```

### MI-003 - Underscore Only MCP Tool Identity

```yaml
plan_unit_id: MI-003
unit_type: requirement
status: accepted
owner_doc: Plans/MCP_Integration.md
canonical_text: Canonical MCP tool identity uses underscore form {server_slug}_{tool_name}; slash-form or dual underscore/slash naming canon is retired outside this owner contract, and stored plus permission-facing contracts remain underscore-only.
gui_related: false
gui_classification_reason: The unit defines MCP runtime, identity, config, auth, provider, storage, or ownership behavior rather than direct GUI presentation.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through MI-003 instead of broad MI-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: mcp_contract_drift
reasoning_tier: standard
context_scope: mcp_integration_standardization
implementation_surfaces:
- Plans/MCP_Integration.md
node_compile_hint:
  mode: underscore_only_mcp_tool_identity
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MCP_Integration-S0002
preserved_exact_tokens:
- Canonical naming
- /retire
- '{server_slug}_{tool_name}'
- underscore-only
- stored and permission-facing contracts
- Slash-form or dual-format `_` / `/` naming canon is retired
- LoggedIn | LoggedOut | AuthExpired | AuthFailed
negative_constraints:
- Slash-form or dual-format `_` / `/` naming canon is retired outside this owner contract.
compatibility_only_notes: []
stale_retired_dispositions:
- Slash-form or dual-format naming residue is retired outside MCP_Integration.
owner_boundary_notes:
- Plans/MCP_Integration.md owns MCP configuration, naming, availability, credential binding, invalidation, and GUI surfacing boundaries while referenced owner docs retain their SSOTs.
owner_hints:
- Plans/MCP_Integration.md
preserved_contractrefs: []
split_recommendation_reason: The source span contains multiple separable MCP concerns; repeated source lineage preserves exact provenance without inventing subspans.
```

### MI-004 - Friendly Label Join Back Boundary

```yaml
plan_unit_id: MI-004
unit_type: requirement
status: accepted
owner_doc: Plans/MCP_Integration.md
canonical_text: Consumer surfaces may display friendly MCP tool labels, but they must join back to the canonical {server_slug}_{tool_name} identity and must not preserve append-only packet or stale consumer wording beside the live owner sections.
gui_related: true
gui_classification_reason: The unit defines user-visible GUI, settings, readiness, account, status, or presentation behavior.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through MI-004 instead of broad MI-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: mcp_contract_drift
reasoning_tier: standard
context_scope: mcp_integration_standardization
implementation_surfaces:
- Plans/MCP_Integration.md
node_compile_hint:
  mode: friendly_label_join_back_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MCP_Integration-S0002
preserved_exact_tokens:
- consumer surfaces may display friendly labels
- must join back to `{server_slug}_{tool_name}`
- Regeneration must repair or replace those sections in place
- must not keep an append-only file-creation packet
- Credential lifecycle still surfaces
negative_constraints:
- Regeneration must not keep an append-only file-creation packet beside the live owner sections.
compatibility_only_notes: []
stale_retired_dispositions:
- Append-only packet and stale consumer wording are retired.
owner_boundary_notes:
- Plans/MCP_Integration.md owns MCP configuration, naming, availability, credential binding, invalidation, and GUI surfacing boundaries while referenced owner docs retain their SSOTs.
owner_hints:
- Plans/MCP_Integration.md
preserved_contractrefs: []
split_recommendation_reason: The source span contains multiple separable MCP concerns; repeated source lineage preserves exact provenance without inventing subspans.
```

### MI-005 - Requested Effective Availability Enums

```yaml
plan_unit_id: MI-005
unit_type: requirement
status: accepted
owner_doc: Plans/MCP_Integration.md
canonical_text: Requested and effective MCP availability remain distinct with requested states authenticated, expired, and not_authenticated and effective states connected, disabled, needs_auth, needs_client_registration, and failed.
gui_related: false
gui_classification_reason: The unit defines MCP runtime, identity, config, auth, provider, storage, or ownership behavior rather than direct GUI presentation.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through MI-005 instead of broad MI-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: mcp_contract_drift
reasoning_tier: standard
context_scope: mcp_integration_standardization
implementation_surfaces:
- Plans/MCP_Integration.md
node_compile_hint:
  mode: requested_effective_availability_enums
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MCP_Integration-S0003
preserved_exact_tokens:
- requested and effective MCP availability
- authenticated | expired | not_authenticated
- connected | disabled | needs_auth | needs_client_registration | failed
- auth-state tokens
- effective-state tokens
- enabled flag
- auth state
- server health
- project context
- policy/permission state
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/MCP_Integration.md owns MCP configuration, naming, availability, credential binding, invalidation, and GUI surfacing boundaries while referenced owner docs retain their SSOTs.
owner_hints:
- Plans/MCP_Integration.md
preserved_contractrefs: []
split_recommendation_reason: The source span contains multiple separable MCP concerns; repeated source lineage preserves exact provenance without inventing subspans.
```

### MI-006 - Effective State Disclosure Boundary

```yaml
plan_unit_id: MI-006
unit_type: requirement
status: accepted
owner_doc: Plans/MCP_Integration.md
canonical_text: The traceability label /effective-state maps to the requested-versus-effective owner section across runtime and GUI surfaces, and consumer-style paraphrases must not replace stored enum values.
gui_related: true
gui_classification_reason: The unit defines user-visible GUI, settings, readiness, account, status, or presentation behavior.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through MI-006 instead of broad MI-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: mcp_contract_drift
reasoning_tier: standard
context_scope: mcp_integration_standardization
implementation_surfaces:
- Plans/MCP_Integration.md
node_compile_hint:
  mode: effective_state_disclosure_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MCP_Integration-S0003
preserved_exact_tokens:
- requested vs effective MCP availability
- runtime and GUI surfaces
- Traceability label `/effective-state`
- consumer-style paraphrases must not replace the stored enum values
- requested availability
- effective availability
negative_constraints:
- Consumer-style paraphrases must not replace the stored enum values.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/MCP_Integration.md owns MCP configuration, naming, availability, credential binding, invalidation, and GUI surfacing boundaries while referenced owner docs retain their SSOTs.
owner_hints:
- Plans/MCP_Integration.md
preserved_contractrefs: []
split_recommendation_reason: The source span contains multiple separable MCP concerns; repeated source lineage preserves exact provenance without inventing subspans.
```

### MI-007 - Credential Binding And Invalidation

```yaml
plan_unit_id: MI-007
unit_type: requirement
status: accepted
owner_doc: Plans/MCP_Integration.md
canonical_text: MCP credential binding persists tokens securely, binds stored credentials to the effective remote server URL, invalidates credentials when the configured URL changes, surfaces the four auth lifecycle outcomes, and maps /invalidation plus obl-065 to this owner obligation.
gui_related: false
gui_classification_reason: The unit defines MCP runtime, identity, config, auth, provider, storage, or ownership behavior rather than direct GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through MI-007 instead of broad MI-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: mcp_contract_drift
reasoning_tier: standard
context_scope: mcp_integration_standardization
implementation_surfaces:
- Plans/MCP_Integration.md
node_compile_hint:
  mode: credential_binding_and_invalidation
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MCP_Integration-S0004
preserved_exact_tokens:
- credential binding
- invalidation
- persist tokens securely
- effective remote server URL
- configured URL changes
- previously stored credentials become invalid
- LoggedIn | LoggedOut | AuthExpired | AuthFailed
- /invalidation
- obl-065
negative_constraints:
- Changing the configured URL invalidates previously stored credentials for that server binding.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/MCP_Integration.md owns MCP configuration, naming, availability, credential binding, invalidation, and GUI surfacing boundaries while referenced owner docs retain their SSOTs.
owner_hints:
- Plans/MCP_Integration.md
preserved_contractrefs: []
```

### MI-008 - MCP Owner Consumer Boundaries

```yaml
plan_unit_id: MI-008
unit_type: requirement
status: accepted
owner_doc: Plans/MCP_Integration.md
canonical_text: MCP_Integration defines how Tools, storage-plan, Permissions_System, newtools, interview integration, Prompt_Pipeline, route/event consumers, and provider/account surfaces consume MCP naming, availability, auth, effective-resolution, subject, and trust vocabulary without redefining it.
gui_related: false
gui_classification_reason: The unit defines MCP runtime, identity, config, auth, provider, storage, or ownership behavior rather than direct GUI presentation.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through MI-008 instead of broad MI-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: mcp_contract_drift
reasoning_tier: standard
context_scope: mcp_integration_standardization
implementation_surfaces:
- Plans/MCP_Integration.md
node_compile_hint:
  mode: mcp_owner_consumer_boundaries
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MCP_Integration-S0005
preserved_exact_tokens:
- Plans/Tools.md
- Plans/storage-plan.md
- Plans/Permissions_System.md
- Plans/newtools.md
- GUI summary surfaces
- Plans/interview-subagent-integration.md
- Prompt_Pipeline.md
- TierContext
- canonical `/subject` vocabulary
- blocked-action aliases
negative_constraints:
- MCP integration must not duplicate a thinner subset of Prompt_Pipeline effective-resolution fields directly on TierContext.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/MCP_Integration.md owns MCP configuration, naming, availability, credential binding, invalidation, and GUI surfacing boundaries while referenced owner docs retain their SSOTs.
owner_hints:
- Plans/MCP_Integration.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Models_System.md'
split_recommendation_reason: The source span contains multiple separable MCP concerns; repeated source lineage preserves exact provenance without inventing subspans.
```

### MI-009 - Read Only Debug APM Bridge Trust

```yaml
plan_unit_id: MI-009
unit_type: requirement
status: accepted
owner_doc: Plans/MCP_Integration.md
canonical_text: Observability-first MCP bridges for Debug Mode expose read-only APM logs and metrics connectors for production-like failures while keeping that trust model distinct from local probes and without granting mutation authority.
gui_related: false
gui_classification_reason: The unit defines MCP runtime, identity, config, auth, provider, storage, or ownership behavior rather than direct GUI presentation.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through MI-009 instead of broad MI-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: mcp_contract_drift
reasoning_tier: standard
context_scope: mcp_integration_standardization
implementation_surfaces:
- Plans/MCP_Integration.md
node_compile_hint:
  mode: read_only_debug_apm_bridge_trust
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MCP_Integration-S0005
preserved_exact_tokens:
- Observability-first MCP bridges
- Debug Mode
- read-only APM `/logs/metrics` connectors
- production-like failures
- data-plane trust model
- distinct from local probes
- does not grant mutation authority
negative_constraints:
- Read-only APM/logs/metrics MCP bridges do not grant mutation authority.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/MCP_Integration.md owns MCP configuration, naming, availability, credential binding, invalidation, and GUI surfacing boundaries while referenced owner docs retain their SSOTs.
owner_hints:
- Plans/MCP_Integration.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Models_System.md'
split_recommendation_reason: The source span contains multiple separable MCP concerns; repeated source lineage preserves exact provenance without inventing subspans.
```

### MI-010 - Thread Level Provider Account Surfacing

```yaml
plan_unit_id: MI-010
unit_type: requirement
status: accepted
owner_doc: Plans/MCP_Integration.md
canonical_text: Thread-level MCP surfacing exposes switch, concern trust, and trust state paths in provider/account views so account visibility, persona naming, stage-to-role mapping, and effective provider context remain visible outside Orchestrator pages.
gui_related: true
gui_classification_reason: The unit defines user-visible GUI, settings, readiness, account, status, or presentation behavior.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through MI-010 instead of broad MI-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: mcp_contract_drift
reasoning_tier: standard
context_scope: mcp_integration_standardization
implementation_surfaces:
- Plans/MCP_Integration.md
node_compile_hint:
  mode: thread_level_provider_account_surfacing
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MCP_Integration-S0005
preserved_exact_tokens:
- thread-level MCP surfacing
- switch
- /concern/trust
- trust state paths
- provider/account views
- MCP account visibility
- canonical persona naming
- stage-to-role mapping
- current role vocabulary
- provider context is effective
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/MCP_Integration.md owns MCP configuration, naming, availability, credential binding, invalidation, and GUI surfacing boundaries while referenced owner docs retain their SSOTs.
owner_hints:
- Plans/MCP_Integration.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Models_System.md'
split_recommendation_reason: The source span contains multiple separable MCP concerns; repeated source lineage preserves exact provenance without inventing subspans.
```

### MI-011 - MCP Config Fields

```yaml
plan_unit_id: MI-011
unit_type: requirement
status: accepted
owner_doc: Plans/MCP_Integration.md
canonical_text: Canonical MCP server config includes server_id, enabled, timeout_ms, local launch fields, runtime handoff working_directory, remote launch fields, auth binding fields, per-tool enablement independent of connection state, and the /disable trace label for enablement handling.
gui_related: false
gui_classification_reason: The unit defines MCP runtime, identity, config, auth, provider, storage, or ownership behavior rather than direct GUI presentation.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through MI-011 instead of broad MI-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: mcp_contract_drift
reasoning_tier: standard
context_scope: mcp_integration_standardization
implementation_surfaces:
- Plans/MCP_Integration.md
node_compile_hint:
  mode: mcp_config_fields
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MCP_Integration-S0006
preserved_exact_tokens:
- Server config schema
- implementation-facing canon
- server_id
- enabled
- timeout_ms
- command
- args[]
- env?
- working_directory?
- host_id
- remote_command
- remote_args[]
- remote_env?
- OAuth-disabled / auth-state semantics
- per-tool enable/disable entries
- /disable
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/MCP_Integration.md owns MCP configuration, naming, availability, credential binding, invalidation, and GUI surfacing boundaries while referenced owner docs retain their SSOTs.
owner_hints:
- Plans/MCP_Integration.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/FinalGUISpec.md'
split_recommendation_reason: The source span contains multiple separable MCP concerns; repeated source lineage preserves exact provenance without inventing subspans.
```

### MI-012 - Schema Adapter Compatibility

```yaml
plan_unit_id: MI-012
unit_type: requirement
status: accepted
owner_doc: Plans/MCP_Integration.md
canonical_text: MCP schema handling tracks visited $ref values, breaks recursive cycles with {}, logs warnings, enforces maximum depth 32 and 64 KiB size cap, and preserves provider adapter compatibility facts such as Gemini anyOf-to-oneOf rewrites and unsupported const/contentEncoding handling.
gui_related: false
gui_classification_reason: The unit defines MCP runtime, identity, config, auth, provider, storage, or ownership behavior rather than direct GUI presentation.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through MI-012 instead of broad MI-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: mcp_contract_drift
reasoning_tier: standard
context_scope: mcp_integration_standardization
implementation_surfaces:
- Plans/MCP_Integration.md
node_compile_hint:
  mode: schema_adapter_compatibility
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MCP_Integration-S0006
preserved_exact_tokens:
- Schema isolation
- OAuth state
- visited `$ref` values
- substituting `{}`
- logging a warning
- maximum depth of 32
- 64 KiB
- anyOf
- oneOf
- const
- contentEncoding
- Provider schema adapters
- Gemini rewrites
negative_constraints:
- Schemas larger than 64 KiB after resolution are rejected.
compatibility_only_notes:
- Provider schema adapters preserve compatibility facts needed by downstream tool validators.
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/MCP_Integration.md owns MCP configuration, naming, availability, credential binding, invalidation, and GUI surfacing boundaries while referenced owner docs retain their SSOTs.
owner_hints:
- Plans/MCP_Integration.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/FinalGUISpec.md'
split_recommendation_reason: The source span contains multiple separable MCP concerns; repeated source lineage preserves exact provenance without inventing subspans.
```

### MI-013 - OAuth State Listener And Token Sharing

```yaml
plan_unit_id: MI-013
unit_type: requirement
status: accepted
owner_doc: Plans/MCP_Integration.md
canonical_text: MCP OAuth state is keyed by provider, scope, and client semantics; tokens live in the shared credential store, token sharing uses provider+scope, refresh uses compare-and-swap, and PM owns the shared local HTTP listener callback model with explicit bind-address evidence for non-default remote or containerized environments.
gui_related: false
gui_classification_reason: The unit defines MCP runtime, identity, config, auth, provider, storage, or ownership behavior rather than direct GUI presentation.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through MI-013 instead of broad MI-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: mcp_contract_drift
reasoning_tier: standard
context_scope: mcp_integration_standardization
implementation_surfaces:
- Plans/MCP_Integration.md
node_compile_hint:
  mode: oauth_state_listener_and_token_sharing
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MCP_Integration-S0006
preserved_exact_tokens:
- MCP OAuth state
- provider/scope/client semantics
- shared credential store
- provider+scope
- compare-and-swap
- shared local HTTP listener callback model
- GitHub_API_Auth_and_Flows.md
- bind-address selection
- non-default, remote, or `/containerized` environments
- callback path
- client id
- provider scope
- auth-state evidence
negative_constraints:
- OAuth state is not keyed only by MCP server identity.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/MCP_Integration.md owns MCP configuration, naming, availability, credential binding, invalidation, and GUI surfacing boundaries while referenced owner docs retain their SSOTs.
owner_hints:
- Plans/MCP_Integration.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/FinalGUISpec.md'
split_recommendation_reason: The source span contains multiple separable MCP concerns; repeated source lineage preserves exact provenance without inventing subspans.
```

### MI-014 - Portable Entries No Secrets Adapters

```yaml
plan_unit_id: MI-014
unit_type: requirement
status: accepted
owner_doc: Plans/MCP_Integration.md
canonical_text: Server-entry config preserves local and remote portable launch shapes, supports OAuth-disabled header-only servers and dynamic client registration, and keeps generated provider adapter config derived and no-secrets by resolving secrets through secret references or auth bindings.
gui_related: false
gui_classification_reason: The unit defines MCP runtime, identity, config, auth, provider, storage, or ownership behavior rather than direct GUI presentation.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through MI-014 instead of broad MI-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: mcp_contract_drift
reasoning_tier: standard
context_scope: mcp_integration_standardization
implementation_surfaces:
- Plans/MCP_Integration.md
node_compile_hint:
  mode: portable_entries_no_secrets_adapters
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MCP_Integration-S0006
preserved_exact_tokens:
- portable launch shape
- 'type: "local"'
- 'command: string[]'
- 'type: "remote"'
- url
- headers?
- 'oauth?: object | false'
- /header-only
- dynamic client registration
- pre-registered client credentials
- Generated adapter config
- derived/no-secrets
- /no-secrets
- secret references
- auth bindings
negative_constraints:
- Provider-facing adapter files are generated and must not serialize secrets.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/MCP_Integration.md owns MCP configuration, naming, availability, credential binding, invalidation, and GUI surfacing boundaries while referenced owner docs retain their SSOTs.
owner_hints:
- Plans/MCP_Integration.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/FinalGUISpec.md'
split_recommendation_reason: The source span contains multiple separable MCP concerns; repeated source lineage preserves exact provenance without inventing subspans.
```

### MI-015 - Config Override Debug Surface

```yaml
plan_unit_id: MI-015
unit_type: requirement
status: accepted
owner_doc: Plans/MCP_Integration.md
canonical_text: The /config/override/debug surface is read-only and shows final effective MCP config, override provenance, auth/client-registration state, and provider projection sync without mutating config, serializing secrets, or bypassing policy.
gui_related: false
gui_classification_reason: The unit defines MCP runtime, identity, config, auth, provider, storage, or ownership behavior rather than direct GUI presentation.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through MI-015 instead of broad MI-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: mcp_contract_drift
reasoning_tier: standard
context_scope: mcp_integration_standardization
implementation_surfaces:
- Plans/MCP_Integration.md
node_compile_hint:
  mode: config_override_debug_surface
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MCP_Integration-S0006
preserved_exact_tokens:
- /config/override/debug
- read-only debug surface
- final effective MCP config
- override-layer provenance
- auth/client-registration state
- provider projection sync
- redacted derived values
- does not mutate config
- serialize secrets
- bypass policy
negative_constraints:
- /config/override/debug does not mutate config, serialize secrets, or bypass policy.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/MCP_Integration.md owns MCP configuration, naming, availability, credential binding, invalidation, and GUI surfacing boundaries while referenced owner docs retain their SSOTs.
owner_hints:
- Plans/MCP_Integration.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/FinalGUISpec.md'
split_recommendation_reason: The source span contains multiple separable MCP concerns; repeated source lineage preserves exact provenance without inventing subspans.
```

### MI-016 - Canonical MCP Records And Enums

```yaml
plan_unit_id: MI-016
unit_type: requirement
status: accepted
owner_doc: Plans/MCP_Integration.md
canonical_text: Canonical MCP data records are mcp_server_record, mcp_runtime_availability, and mcp_tool_record with exact fields and enum values for transport_kind, scope, ownership, availability_state, and config_sync_state.
gui_related: false
gui_classification_reason: The unit defines MCP runtime, identity, config, auth, provider, storage, or ownership behavior rather than direct GUI presentation.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through MI-016 instead of broad MI-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: mcp_contract_drift
reasoning_tier: standard
context_scope: mcp_integration_standardization
implementation_surfaces:
- Plans/MCP_Integration.md
node_compile_hint:
  mode: canonical_mcp_records_and_enums
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MCP_Integration-S0006
preserved_exact_tokens:
- mcp_server_record
- server_id
- label
- description
- transport_kind
- endpoint_or_command
- scope
- ownership
- secret_ref?
- last_health_check_at?
- last_error?
- stdio | sse | http
- global | project | profile | external
- pm_managed | external_managed
- mcp_runtime_availability
- availability_state
- working | not_configured | needs_auth | untrusted_folder | unhealthy | unsupported | external_not_managed
- config_sync_state
- not_needed | in_sync | out_of_sync | sync_failed
- mcp_tool_record
- tool_ref
- permission_scope
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/MCP_Integration.md owns MCP configuration, naming, availability, credential binding, invalidation, and GUI surfacing boundaries while referenced owner docs retain their SSOTs.
owner_hints:
- Plans/MCP_Integration.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/FinalGUISpec.md'
split_recommendation_reason: The source span contains multiple separable MCP concerns; repeated source lineage preserves exact provenance without inventing subspans.
```

### MI-017 - GUI Lifecycle Label Derivation

```yaml
plan_unit_id: MI-017
unit_type: requirement
status: accepted
owner_doc: Plans/MCP_Integration.md
canonical_text: GUI lifecycle labels derive from canonical availability states without creating a second enum, including Working, Not Configured, Needs Auth, Untrusted Folder, Unhealthy, Install Failed, Unsupported, and External / Not Managed.
gui_related: true
gui_classification_reason: The unit defines user-visible GUI, settings, readiness, account, status, or presentation behavior.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through MI-017 instead of broad MI-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: mcp_contract_drift
reasoning_tier: standard
context_scope: mcp_integration_standardization
implementation_surfaces:
- Plans/MCP_Integration.md
node_compile_hint:
  mode: gui_lifecycle_label_derivation
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MCP_Integration-S0006
preserved_exact_tokens:
- GUI lifecycle labels
- canonical availability states
- without creating a second enum
- Working
- Not Configured
- Needs Auth
- Untrusted Folder
- Unhealthy
- Install Failed
- Unsupported
- External / Not Managed
- Install Failed
- unhealthy
- install failure reason code
negative_constraints:
- GUI lifecycle labels must not create a second stored availability enum.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/MCP_Integration.md owns MCP configuration, naming, availability, credential binding, invalidation, and GUI surfacing boundaries while referenced owner docs retain their SSOTs.
owner_hints:
- Plans/MCP_Integration.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/FinalGUISpec.md'
split_recommendation_reason: The source span contains multiple separable MCP concerns; repeated source lineage preserves exact provenance without inventing subspans.
```

### MI-018 - MCP Resilience Cache And Eviction

```yaml
plan_unit_id: MI-018
unit_type: requirement
status: accepted
owner_doc: Plans/MCP_Integration.md
canonical_text: MCP resilience uses lazy-load startup, pre-validation before tool dispatch or adapter handoff, cached tool lists as degraded fallback evidence, retries transient failures before eviction, stable OAuth state across reconnects, and refresh triggers from config change, user action, and periodic TTL.
gui_related: false
gui_classification_reason: The unit defines MCP runtime, identity, config, auth, provider, storage, or ownership behavior rather than direct GUI presentation.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through MI-018 instead of broad MI-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: mcp_contract_drift
reasoning_tier: standard
context_scope: mcp_integration_standardization
implementation_surfaces:
- Plans/MCP_Integration.md
node_compile_hint:
  mode: mcp_resilience_cache_and_eviction
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MCP_Integration-S0006
preserved_exact_tokens:
- MCP resilience
- lazy-load startup
- pre-validation
- MCP tool dispatch
- provider adapter handoff
- cached tool lists
- degraded fallback evidence
- retries transient startup/health failures before eviction
- stable OAuth state
- reconnects
- Tool-list cache refresh
- config change
- explicit user action
- periodic TTL
- retry policy
- TTL/refresh evidence
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/MCP_Integration.md owns MCP configuration, naming, availability, credential binding, invalidation, and GUI surfacing boundaries while referenced owner docs retain their SSOTs.
owner_hints:
- Plans/MCP_Integration.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/FinalGUISpec.md'
split_recommendation_reason: The source span contains multiple separable MCP concerns; repeated source lineage preserves exact provenance without inventing subspans.
```

### MI-019 - Managed Session Pooling

```yaml
plan_unit_id: MI-019
unit_type: requirement
status: accepted
owner_doc: Plans/MCP_Integration.md
canonical_text: MCP connection pooling is the default for managed server sessions; PM must not use subprocess-per-call for MCP servers except disposable diagnostic probes, and long-lived sessions own lifecycle identity, refresh, health, and teardown state through MCP records.
gui_related: false
gui_classification_reason: The unit defines MCP runtime, identity, config, auth, provider, storage, or ownership behavior rather than direct GUI presentation.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through MI-019 instead of broad MI-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: mcp_contract_drift
reasoning_tier: standard
context_scope: mcp_integration_standardization
implementation_surfaces:
- Plans/MCP_Integration.md
node_compile_hint:
  mode: managed_session_pooling
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MCP_Integration-S0006
preserved_exact_tokens:
- MCP connection pooling
- default for managed server sessions
- MUST NOT use a subprocess-per-call model
- explicitly disposable diagnostic probes
- long-lived MCP sessions
- lifecycle identity
- refresh
- health
- teardown state
- mcp_server_record
- mcp_runtime_availability
- OC-EXEC-107
- OC-PROV-006
negative_constraints:
- PM MUST NOT use a subprocess-per-call model for MCP servers except explicitly disposable diagnostic probes.
compatibility_only_notes:
- OC-EXEC-107 and OC-PROV-006 are evidence labels, not separate canonical schemas.
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/MCP_Integration.md owns MCP configuration, naming, availability, credential binding, invalidation, and GUI surfacing boundaries while referenced owner docs retain their SSOTs.
owner_hints:
- Plans/MCP_Integration.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/FinalGUISpec.md'
split_recommendation_reason: The source span contains multiple separable MCP concerns; repeated source lineage preserves exact provenance without inventing subspans.
```

### MI-020 - Central Registry Lifecycle Projection

```yaml
plan_unit_id: MI-020
unit_type: requirement
status: accepted
owner_doc: Plans/MCP_Integration.md
canonical_text: PM MCP architecture is host-managed at the central registry, health, permissions, and secrets layer, with provider-side adapter state as projection or bridge surface and a three-level lifecycle of Registered in PM, Configured for provider/runtime, and Operational.
gui_related: false
gui_classification_reason: The unit defines MCP runtime, identity, config, auth, provider, storage, or ownership behavior rather than direct GUI presentation.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through MI-020 instead of broad MI-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: mcp_contract_drift
reasoning_tier: standard
context_scope: mcp_integration_standardization
implementation_surfaces:
- Plans/MCP_Integration.md
node_compile_hint:
  mode: central_registry_lifecycle_projection
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MCP_Integration-S0006
preserved_exact_tokens:
- host-managed
- central registry
- health
- permissions
- secrets layer
- /server
- provider-side adapter state
- projection/bridge surface
- Registered in PM
- Configured for provider/runtime
- Operational
- central MCP registry
- provider config as the MCP source of truth
- /per-runtime
- execution surface
negative_constraints:
- Provider-side config is not the MCP source of truth.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/MCP_Integration.md owns MCP configuration, naming, availability, credential binding, invalidation, and GUI surfacing boundaries while referenced owner docs retain their SSOTs.
owner_hints:
- Plans/MCP_Integration.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/FinalGUISpec.md'
split_recommendation_reason: The source span contains multiple separable MCP concerns; repeated source lineage preserves exact provenance without inventing subspans.
```

### MI-021 - CLI Provider Profile State

```yaml
plan_unit_id: MI-021
unit_type: requirement
status: accepted
owner_doc: Plans/MCP_Integration.md
canonical_text: CLI provider MCP state remains provider/profile-local for active Claude Code and Cursor CLI surfaces, with profile isolation, structured usage evidence, setup-state models, and PM-managed roots preserving account/root isolation. Gemini CLI MCP/home facts are retired/source-lineage only.
gui_related: false
gui_classification_reason: The unit defines MCP runtime, identity, config, auth, provider, storage, or ownership behavior rather than direct GUI presentation.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through MI-021 instead of broad MI-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: mcp_contract_drift
reasoning_tier: standard
context_scope: mcp_integration_standardization
implementation_surfaces:
- Plans/MCP_Integration.md
node_compile_hint:
  mode: cli_provider_profile_state
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MCP_Integration-S0006
preserved_exact_tokens:
- Claude Code CLI
- CLI-provider surface
- profile isolation
- MCP support
- structured usage evidence
- setup-state model
- Gemini CLI remains the heaviest managed home
- .gemini
- profile-local runtime state
- Cursor CLI MCP support
- cursor-agent
- PM-owned home `/XDG` roots
- account/root isolation contract
negative_constraints: []
compatibility_only_notes:
- Gemini CLI MCP/home facts are retained only as source-lineage.
stale_retired_dispositions:
- Active Gemini CLI MCP provider-home management is retired by provider-update ledger pldg-20260624-001-provider-updates.
owner_boundary_notes:
- Plans/MCP_Integration.md owns MCP configuration, naming, availability, credential binding, invalidation, and GUI surfacing boundaries while referenced owner docs retain their SSOTs.
owner_hints:
- Plans/MCP_Integration.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/FinalGUISpec.md'
split_recommendation_reason: The source span contains multiple separable MCP concerns; repeated source lineage preserves exact provenance without inventing subspans.
```

### MI-022 - Retired Gemini CLI MCP Config Commands

```yaml
plan_unit_id: MI-022
unit_type: compatibility_disposition
status: accepted
owner_doc: Plans/MCP_Integration.md
canonical_text: Gemini CLI MCP config and command vocabulary is retired/source-lineage only. PM must not implement Gemini CLI MCP config generation or `gemini mcp add` management as an active provider path; current MCP projection must be proven per active provider/runtime.
gui_related: false
gui_classification_reason: The unit defines MCP runtime, identity, config, auth, provider, storage, or ownership behavior rather than direct GUI presentation.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through MI-022 instead of broad MI-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: mcp_contract_drift
reasoning_tier: standard
context_scope: mcp_integration_standardization
implementation_surfaces:
- Plans/MCP_Integration.md
node_compile_hint:
  mode: retired_gemini_cli_mcp_config_commands
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MCP_Integration-S0006
preserved_exact_tokens:
- geminicli.com/docs/tools/mcp-server/
- mcpServers
- settings.json
- ~/.gemini/settings.json
- /.gemini/settings.json
- gemini/settings.json
- gemini mcp add
- --scope user|project
- project -> global -> nested
- --transport stdio|sse|http
- --env
- --header
- --timeout
- --trust
- --include-tools
- --exclude-tools
- list-tools
- ~/.gemini/mcp-server-enablement.json
- /.gemini/mcp-server-enablement.json
- /redaction
negative_constraints:
- Env and header diagnostics must preserve redaction semantics.
- Do not generate active Gemini CLI MCP config.
- Do not run `gemini mcp add` as active PM setup.
compatibility_only_notes:
- Gemini CLI MCP paths and commands are preserved only for source-lineage.
stale_retired_dispositions:
- Gemini CLI MCP config commands are retired by provider-update ledger pldg-20260624-001-provider-updates.
owner_boundary_notes:
- Plans/MCP_Integration.md owns MCP configuration, naming, availability, credential binding, invalidation, and GUI surfacing boundaries while referenced owner docs retain their SSOTs.
owner_hints:
- Plans/MCP_Integration.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/FinalGUISpec.md'
split_recommendation_reason: The source span contains multiple separable MCP concerns; repeated source lineage preserves exact provenance without inventing subspans.
```

### MI-023 - Cursor CLI MCP Evidence Adapter

```yaml
plan_unit_id: MI-023
unit_type: requirement
status: accepted
owner_doc: Plans/MCP_Integration.md
canonical_text: Cursor CLI provider-native MCP inspection uses cursor-agent output as availability evidence while central MCP records stay authoritative; PM may generate or refresh .cursor/mcp.json or cursor/mcp.json only when workspace-local MCP visibility is required.
gui_related: false
gui_classification_reason: The unit defines MCP runtime, identity, config, auth, provider, storage, or ownership behavior rather than direct GUI presentation.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through MI-023 instead of broad MI-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: mcp_contract_drift
reasoning_tier: standard
context_scope: mcp_integration_standardization
implementation_surfaces:
- Plans/MCP_Integration.md
node_compile_hint:
  mode: cursor_cli_mcp_evidence_adapter
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MCP_Integration-S0006
preserved_exact_tokens:
- Cursor CLI provider-native MCP inspection
- cursor-agent mcp list
- central MCP records as authoritative
- .cursor/mcp.json
- cursor/mcp.json
- workspace-local MCP visibility
- derived from central records
- not the MCP source of truth
- /stream-json
- auth status
- MCP management
- model listing
- about `/version` probing
negative_constraints:
- Cursor workspace adapter config is derived and is not the MCP source of truth.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/MCP_Integration.md owns MCP configuration, naming, availability, credential binding, invalidation, and GUI surfacing boundaries while referenced owner docs retain their SSOTs.
owner_hints:
- Plans/MCP_Integration.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/FinalGUISpec.md'
split_recommendation_reason: The source span contains multiple separable MCP concerns; repeated source lineage preserves exact provenance without inventing subspans.
```

### MI-024 - DirectApi CLI Bridge Sync

```yaml
plan_unit_id: MI-024
unit_type: requirement
status: accepted
owner_doc: Plans/MCP_Integration.md
canonical_text: DirectApi providers use PM-native MCP only, while CLI-provider bridge state is long-lived provider/profile configuration mapped into project-shared or profile-local MCP records; PM may configure, update, repair, or spawn-time regenerate derived provider files only where workspace visibility requires it.
gui_related: false
gui_classification_reason: The unit defines MCP runtime, identity, config, auth, provider, storage, or ownership behavior rather than direct GUI presentation.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through MI-024 instead of broad MI-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: mcp_contract_drift
reasoning_tier: standard
context_scope: mcp_integration_standardization
implementation_surfaces:
- Plans/MCP_Integration.md
node_compile_hint:
  mode: directapi_cli_bridge_sync
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MCP_Integration-S0006
preserved_exact_tokens:
- DirectApi providers
- Gemini
- Codex
- GitHub Copilot
- Alibaba Coding Plan
- MiniMax Coding Plan
- Z.AI Coding Plan
- PM-native MCP only
- provider-side MCP config files
- CLI-provider bridge state
- long-lived provider/profile configuration
- project-shared versus profile-local MCP records
- per-run files
- /workspace
- /configure
- /update
- /repair
- spawn-time regeneration
negative_constraints:
- No provider-side MCP config files are canonical for DirectApi rows.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/MCP_Integration.md owns MCP configuration, naming, availability, credential binding, invalidation, and GUI surfacing boundaries while referenced owner docs retain their SSOTs.
owner_hints:
- Plans/MCP_Integration.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/FinalGUISpec.md'
split_recommendation_reason: The source span contains multiple separable MCP concerns; repeated source lineage preserves exact provenance without inventing subspans.
```

### MI-025 - Supported Owner Level Flows

```yaml
plan_unit_id: MI-025
unit_type: requirement
status: accepted
owner_doc: Plans/MCP_Integration.md
canonical_text: MCP owner-level flows are exactly auth, list/status, logout, and debug, with auth resolving missing or expired auth, list/status surfacing availability and failures, logout revoking auth binding without deleting server definition, and debug surfacing diagnostics without minting a second status vocabulary.
gui_related: false
gui_classification_reason: The unit defines MCP runtime, identity, config, auth, provider, storage, or ownership behavior rather than direct GUI presentation.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through MI-025 instead of broad MI-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: mcp_contract_drift
reasoning_tier: standard
context_scope: mcp_integration_standardization
implementation_surfaces:
- Plans/MCP_Integration.md
node_compile_hint:
  mode: supported_owner_level_flows
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MCP_Integration-S0007
preserved_exact_tokens:
- Supported flows
- auth
- list/status
- logout
- debug
- resolves missing or expired auth
- without redefining tool permissions
- requested/effective availability
- last-failure disclosure
- revokes the effective auth binding
- without deleting the server definition
- connection, handshake, and tool-registration diagnostics
- without minting a second status vocabulary
negative_constraints:
- Debug must not mint a second status vocabulary.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/MCP_Integration.md owns MCP configuration, naming, availability, credential binding, invalidation, and GUI surfacing boundaries while referenced owner docs retain their SSOTs.
owner_hints:
- Plans/MCP_Integration.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Tools.md, ContractName:Plans/newtools.md'
```

### MI-026 - GUI Enum Reuse

```yaml
plan_unit_id: MI-026
unit_type: requirement
status: accepted
owner_doc: Plans/MCP_Integration.md
canonical_text: GUI-facing MCP owner contract reuses auth-state and effective-availability enums for effective tool availability and GUI surfacing, and GUI summary surfaces reference the MCP SSOT instead of re-owning connection-state vocabulary.
gui_related: true
gui_classification_reason: The unit defines user-visible GUI, settings, readiness, account, status, or presentation behavior.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through MI-026 instead of broad MI-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: mcp_contract_drift
reasoning_tier: standard
context_scope: mcp_integration_standardization
implementation_surfaces:
- Plans/MCP_Integration.md
node_compile_hint:
  mode: gui_enum_reuse
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MCP_Integration-S0008
preserved_exact_tokens:
- Effective tool availability and GUI surfacing
- auth-state
- effective-availability enums
- authenticated | expired | not_authenticated
- connected | disabled | needs_auth | needs_client_registration | failed
- GUI summary surfaces
- MCP SSOT
- connection-state vocabulary
negative_constraints:
- GUI summary surfaces must not re-own connection-state vocabulary.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/MCP_Integration.md owns MCP configuration, naming, availability, credential binding, invalidation, and GUI surfacing boundaries while referenced owner docs retain their SSOTs.
owner_hints:
- Plans/MCP_Integration.md
preserved_contractrefs: []
split_recommendation_reason: The source span contains multiple separable MCP concerns; repeated source lineage preserves exact provenance without inventing subspans.
```

### MI-027 - Transport Class GUI Labels

```yaml
plan_unit_id: MI-027
unit_type: requirement
status: accepted
owner_doc: Plans/MCP_Integration.md
canonical_text: Transport-class GUI status labels distinguish DirectApi PM Native/Directly Available, CliBridge Bridged/Configured for Provider, and ServerBridge PM Managed Server versus Attached External Server without treating provider-side installation or projected config as hand-managed source truth.
gui_related: true
gui_classification_reason: The unit defines user-visible GUI, settings, readiness, account, status, or presentation behavior.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through MI-027 instead of broad MI-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: mcp_contract_drift
reasoning_tier: standard
context_scope: mcp_integration_standardization
implementation_surfaces:
- Plans/MCP_Integration.md
node_compile_hint:
  mode: transport_class_gui_labels
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MCP_Integration-S0008
preserved_exact_tokens:
- Transport-class GUI status labels
- DirectApi
- PM Native
- Directly Available
- Installed on provider
- CliBridge
- Bridged
- Configured for Provider
- ServerBridge
- PM Managed Server
- Attached External Server
- /reflect
negative_constraints:
- DirectApi providers have no provider-side MCP installation concept.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/MCP_Integration.md owns MCP configuration, naming, availability, credential binding, invalidation, and GUI surfacing boundaries while referenced owner docs retain their SSOTs.
owner_hints:
- Plans/MCP_Integration.md
preserved_contractrefs: []
split_recommendation_reason: The source span contains multiple separable MCP concerns; repeated source lineage preserves exact provenance without inventing subspans.
```

### MI-028 - MCP Configuration GUI Rows Inspectors Actions

```yaml
plan_unit_id: MI-028
unit_type: requirement
status: accepted
owner_doc: Plans/MCP_Integration.md
canonical_text: The MCP Configuration GUI lists known servers once with user-facing status, remediation, ownership hint, and primary action, while expanded inspectors show runtime availability, auth, tools, logs, sync state, and actions with pending and terminal labels.
gui_related: true
gui_classification_reason: The unit defines user-visible GUI, settings, readiness, account, status, or presentation behavior.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through MI-028 instead of broad MI-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: mcp_contract_drift
reasoning_tier: standard
context_scope: mcp_integration_standardization
implementation_surfaces:
- Plans/MCP_Integration.md
node_compile_hint:
  mode: mcp_configuration_gui_rows_inspectors_actions
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MCP_Integration-S0008
preserved_exact_tokens:
- MCP Configuration GUI
- known servers once
- /status/reason
- Working
- concrete error/status/reason
- mcp_server_record
- one row/card per configured server
- one-line remediation text
- scope `/ownership` hint
- PM managed
- project only
- external
- primary action
- expanded inspector
- settings `/inspectors`
- mcp_runtime_availability
- /auth
- /runtime
- last successful health check
- logs or last error text
- /synced
- Install
- Configure
- Set up
- Repair
- Reconnect
- Disable
- Remove
- View logs
- Installing...
- Configuring...
- Installed
- Configured
- /success/failure
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/MCP_Integration.md owns MCP configuration, naming, availability, credential binding, invalidation, and GUI surfacing boundaries while referenced owner docs retain their SSOTs.
owner_hints:
- Plans/MCP_Integration.md
preserved_contractrefs: []
split_recommendation_reason: The source span contains multiple separable MCP concerns; repeated source lineage preserves exact provenance without inventing subspans.
```

### MI-029 - MCP Readiness First Run Copy

```yaml
plan_unit_id: MI-029
unit_type: requirement
status: accepted
owner_doc: Plans/MCP_Integration.md
canonical_text: Skill and tool readiness checks evaluate effective MCP lifecycle stage and surface Missing Requirement or degraded readiness in GUI, while first-run provider readiness copy distinguishes credentials, trust, and MCP setup.
gui_related: true
gui_classification_reason: The unit defines user-visible GUI, settings, readiness, account, status, or presentation behavior.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through MI-029 instead of broad MI-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: mcp_contract_drift
reasoning_tier: standard
context_scope: mcp_integration_standardization
implementation_surfaces:
- Plans/MCP_Integration.md
node_compile_hint:
  mode: mcp_readiness_first_run_copy
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MCP_Integration-S0008
preserved_exact_tokens:
- Skill and tool readiness checks
- effective MCP lifecycle stage
- /unhealthy
- unavailable
- missing
- Missing Requirement
- degraded readiness
- GUI
- First-run provider readiness copy
- Credentials ready
- Workspace trust required
- MCP configuration pending
negative_constraints: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/MCP_Integration.md owns MCP configuration, naming, availability, credential binding, invalidation, and GUI surfacing boundaries while referenced owner docs retain their SSOTs.
owner_hints:
- Plans/MCP_Integration.md
preserved_contractrefs: []
split_recommendation_reason: The source span contains multiple separable MCP concerns; repeated source lineage preserves exact provenance without inventing subspans.
```

### MI-030 - MCP Account Profile Isolation

```yaml
plan_unit_id: MI-030
unit_type: requirement
status: accepted
owner_doc: Plans/MCP_Integration.md
canonical_text: Account and profile isolation applies to MCP bridges, keeping provider-native auth_state, workspace_trust, project history, approvals, runtime caches, and OAuth residue profile-local unless a PM-managed overlay explicitly projects a safe shared definition.
gui_related: false
gui_classification_reason: The unit defines MCP runtime, identity, config, auth, provider, storage, or ownership behavior rather than direct GUI presentation.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- The covered source span remains losslessly available for exact-text audit.
- This behavior is addressable through MI-030 instead of broad MI-001 source-preserving coverage.
- ContractRefs, aliases, exact tokens, examples, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage remain traceable.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: mcp_contract_drift
reasoning_tier: standard
context_scope: mcp_integration_standardization
implementation_surfaces:
- Plans/MCP_Integration.md
node_compile_hint:
  mode: mcp_account_profile_isolation
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MCP_Integration-S0008
preserved_exact_tokens:
- Account/profile isolation
- provider-native state
- auth_state
- workspace_trust
- project history
- mcp approvals
- runtime caches
- MCP OAuth residue
- profile-local
- PM-managed overlay
- safe shared definition
negative_constraints:
- Provider-native MCP state remains profile-local unless a PM-managed overlay explicitly projects a safe shared definition.
compatibility_only_notes: []
stale_retired_dispositions: []
owner_boundary_notes:
- Plans/MCP_Integration.md owns MCP configuration, naming, availability, credential binding, invalidation, and GUI surfacing boundaries while referenced owner docs retain their SSOTs.
owner_hints:
- Plans/MCP_Integration.md
preserved_contractrefs: []
split_recommendation_reason: The source span contains multiple separable MCP concerns; repeated source lineage preserves exact provenance without inventing subspans.
```

### MI-001 - MCP Integration Retired Source-Preserving Bridge

```yaml
plan_unit_id: MI-001
unit_type: compatibility_disposition
status: accepted
owner_doc: Plans/MCP_Integration.md
canonical_text: The former MCP_Integration source-preserving bridge is retired after Phase 2B atomized MCP_Integration-S0001 through S0008 into MI-002 through MI-030 and structurally dispositioned S0009, S0010, and S0012. MI-001 remains only as migration lineage for MCP_Integration-S0011 and must not re-own atomized source coverage or use source_preserving_planunit compile mode.
gui_related: false
gui_classification_reason: This retired bridge records migration lineage only; product GUI coverage is owned by fine-grained MCP Integration PlanUnits MI-002 through MI-030.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- MI-001 no longer uses source_preserving_planunit compile mode.
- MI-002 through MI-030 own product coverage for atomized MCP_Integration spans.
- Structural spans are explicit coverage dispositions, not product coverage owned by MI-001.
- The retired bridge does not create WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: migration_lineage
reasoning_tier: standard
context_scope: residual_plan_standardization
implementation_surfaces:
- Plans/MCP_Integration.md
node_compile_hint:
  mode: source_preserving_bridge_retired
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:MCP_Integration-S0011
preserved_exact_tokens:
- MI-001
- MCP_Integration-S0011
- source_preserving_planunit
- source_preserving_bridge_retired
- MCP Integration
- Owner / Consumer Map
- PlanUnits
- Migration Coverage
negative_constraints:
- MI-001 must not re-own MCP_Integration product coverage.
- MI-001 must not use node_compile_hint.mode=source_preserving_planunit.
- Do not treat the retired bridge as implementation-ready product coverage.
- Do not create WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks from this retired bridge.
compatibility_only_notes:
- MI-001 remains only as a retired source-preserving bridge audit record for migration lineage.
- The token source_preserving_planunit is preserved for audit compatibility only and is not the node compile mode.
stale_retired_dispositions:
- The former MI-001 source-preserving bridge is retired by Phase 2B batch 087.
owner_boundary_notes:
- MI-002 through MI-030 own atomized MCP_Integration product coverage.
- MCP_Integration-S0011 is migration-lineage coverage only after bridge retirement.
owner_hints:
- Plans/MCP_Integration.md
```

## Migration Coverage

Original hash: `c7001ef3bf4b93c4763c60ee1373ba49a09ee331c8407410614db6c8f2498606`.

Run-scoped proof artifacts:
- `Plans/.plan_migration/pds-20260611-002-atomize-planunits/original_hashes.json`
- `Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl`
- `Plans/.plan_migration/pds-20260611-002-atomize-planunits/coverage_map.jsonl`
- `Plans/.plan_migration/pds-20260611-002-atomize-planunits/anchor_aliases.json`

Phase 2B batch 087 atomized `MCP_Integration-S0001` through `MCP_Integration-S0008` into `MI-002` through `MI-030`, with dense server-config, provider, and GUI surfacing spans split where safe. `MCP_Integration-S0009`, `MCP_Integration-S0010`, and `MCP_Integration-S0012` are structural/reporting dispositions. `MCP_Integration-S0011` maps only to retired bridge lineage `MI-001`; `MI-001` no longer uses source-preserving compile mode, and `Plans/MCP_Integration.md` has no remaining source-preserving product coverage. This batch did not update Spec Lock, generated shards, evidence bundles, auto_decisions, or plan_graph, and did not create WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks.
