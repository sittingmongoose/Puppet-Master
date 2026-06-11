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
- Gemini CLI remains the heaviest managed home: auth, extensions, MCP OAuth tokens, history, temp chats, and project registry can all sit under one `.gemini` tree, so PM treats those as profile-local runtime state unless a later owner contract promotes a safe overlay.
- Cursor CLI MCP support is evaluated through `cursor-agent` under PM-owned home `/XDG` roots; PM records provider-native MCP output as availability evidence without replacing the account/root isolation contract.
- Consumer references include `Plans/Tools.md`, `Plans/newtools.md`, and `Plans/Section15_MVP_Promoted_Features_Spec.md`; slash-form trace labels may render these as `/Tools.md`, `/newtools.md`, or `/Section15_MVP_Promoted_Features_Spec.md`, but ownership stays here.
- Gemini CLI MCP docs live at `geminicli.com/docs/tools/mcp-server/` and `/docs/tools/mcp-server/`.
- Gemini CLI MCP config lives under `mcpServers` in `settings.json` at user `~/.gemini/settings.json` and workspace `/.gemini/settings.json`; the path family may also be rendered as `gemini/settings.json`.
- `gemini mcp add` supports `--scope user|project` with effective precedence `project -> global -> nested`, `--transport stdio|sse|http`, `--env`, `--header`, `--timeout`, `--trust`, `--include-tools`, and `--exclude-tools`; built-in commands include `list-tools`, list, remove, enable, and disable.
- Gemini enablement state may persist separately in `~/.gemini/mcp-server-enablement.json` or `/.gemini/mcp-server-enablement.json`; env and header handling must preserve `/redaction` semantics in diagnostics.
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

### MI-001 - MCP Integration Source-Preserving PlanUnit

```yaml
plan_unit_id: MI-001
unit_type: requirement
status: accepted
owner_doc: Plans/MCP_Integration.md
canonical_text: Plans/MCP_Integration.md keeps its pre-migration canonical source content losslessly in place while exposing a source-preserving PlanUnit for Plan Document System indexing. Fine-grained requirement splitting may occur in a later controlled batch using the recorded span_map and coverage_map.
gui_related: true
gui_classification_reason: The preserved source spans include GUI/UI/user-visible presentation or interactive control requirements.
split_recommended: true
depends_on: []
unblocks: []
acceptance_criteria:
- Original source spans remain available for exact-text audit.
- Every original span for this doc has one coverage_map disposition.
- ContractRefs, anchors or aliases, negative constraints, compatibility-only notes, stale/retired dispositions, owner/consumer boundaries, and source lineage are preserved by span_map and coverage_map.
- No WorkNodes, NodeSeeds, or executable build tasks are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-001-standardize-plans
- python3 scripts/pm-plans-verify.py run-gates
- python3 scripts/pm-shard-plans.py --check
risk_class: source_preservation
reasoning_tier: standard
context_scope: single_plan_doc
implementation_surfaces:
- Plans/MCP_Integration.md
node_compile_hint:
  mode: source_preserving_planunit
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:MCP_Integration-S0001
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:MCP_Integration-S0002
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:MCP_Integration-S0003
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:MCP_Integration-S0004
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:MCP_Integration-S0005
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:MCP_Integration-S0006
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:MCP_Integration-S0007
- Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl:MCP_Integration-S0008
preserved_exact_tokens:
- MCP Integration
- 'ContractRef: ContractName:Plans/Tools.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Permissions_System.md'
- 1. Canonical naming
- 2. Requested versus effective availability
- 3. Credential binding and invalidation
- 4. Cross-surface responsibilities
- 'ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Models_System.md'
- 5. Server config schema
- 'ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/FinalGUISpec.md'
- 6. Supported flows
- 'ContractRef: ContractName:Plans/Tools.md, ContractName:Plans/newtools.md'
- 7. Effective tool availability and GUI surfacing
negative_constraints:
- 'The packet-shape and `/retire` guard: `## 1. Canonical naming`, `## 2. Requested versus effective availability`, `## 3. Credential binding and invalidation`, and `## 4. Cross-surface responsibilities` are section-owned MCP canon. Regeneration must repair or replace those sections in place and must n'
- '- Traceability label `/effective-state` maps to this requested-versus-effective availability owner section; consumer-style paraphrases must not replace the stored enum values.'
- '- `Prompt_Pipeline` / `Prompt_Pipeline.md` remains the owner for effective-resolution schema; MCP integration must not duplicate a thinner subset of those fields directly on `TierContext`.'
- MCP OAuth state is keyed by provider/scope/client semantics rather than only by server identity. Tokens live in the shared credential store, token sharing is keyed by provider+scope rather than MCP server, and refresh uses compare-and-swap before replacing the effective token/client binding. PM owns
- MCP connection pooling is the default for managed server sessions. PM MUST NOT use a subprocess-per-call model for MCP servers except for explicitly disposable diagnostic probes; long-lived MCP sessions own lifecycle identity, refresh, health, and teardown state through `mcp_server_record` and `mcp_
compatibility_only_notes:
- Schema isolation and OAuth state are MCP-owned cross-runtime concerns. MCP schema handling tracks visited `$ref` values during resolution and breaks recursive schema cycles on revisit by substituting `{}` and logging a warning. Resolved schemas have a maximum depth of 32 and a size cap of 64 KiB; sc
stale_retired_dispositions:
- 'The packet-shape and `/retire` guard: `## 1. Canonical naming`, `## 2. Requested versus effective availability`, `## 3. Credential binding and invalidation`, and `## 4. Cross-surface responsibilities` are section-owned MCP canon. Regeneration must repair or replace those sections in place and must n'
- '- MCP tool identity is underscore-only in stored and permission-facing contracts. Slash-form or dual-format `_` / `/` naming canon is retired outside this owner contract; consumer surfaces may display friendly labels but must join back to `{server_slug}_{tool_name}`.'
owner_boundary_notes:
- This document is the single-owner SSOT for PM MCP configuration, naming, availability, credential binding, and invalidation.
- '## 1. Canonical naming'
- This section defines the canonical contract for this surface.
- 'The packet-shape and `/retire` guard: `## 1. Canonical naming`, `## 2. Requested versus effective availability`, `## 3. Credential binding and invalidation`, and `## 4. Cross-surface responsibilities` are section-owned MCP canon. Regeneration must repair or replace those sections in place and must n'
- '- canonical naming uses underscore form `{server_slug}_{tool_name}`'
- '- MCP tool identity is underscore-only in stored and permission-facing contracts. Slash-form or dual-format `_` / `/` naming canon is retired outside this owner contract; consumer surfaces may display friendly labels but must join back to `{server_slug}_{tool_name}`.'
- '- canonical naming'
- '- requested vs effective MCP availability remains canonical across runtime and GUI surfaces.'
- '- Traceability label `/effective-state` maps to this requested-versus-effective availability owner section; consumer-style paraphrases must not replace the stored enum values.'
- '- Traceability label `/invalidation` maps to credential invalidation here; `obl-065` is the MCP owner obligation for this auth/effective-state/naming contract family.'
- '- `Plans/newtools.md` and GUI summary surfaces reference this document as the live SSOT for MCP availability and credential vocabulary.'
- '- `Plans/interview-subagent-integration.md` / `/interview-subagent-integration.md` consumes MCP account visibility, canonical persona naming, stage-to-role mapping, and current role vocabulary when interview tooling resolves which account, persona, or provider context is effective.'
- '- `Prompt_Pipeline` / `Prompt_Pipeline.md` remains the owner for effective-resolution schema; MCP integration must not duplicate a thinner subset of those fields directly on `TierContext`.'
- '- MCP route and event consumers use canonical `/subject` vocabulary alongside blocked-action aliases, so command, tool, and integration events can route concerns without inventing another subject model.'
- This owner text closes the prior shared-listener under-specification by making listener identity, bind address, client id, provider scope, retry, and OAuth/auth-state evidence explicit.
- 'Canonical config fields include:'
- 'Canonical MCP data records:'
- 'GUI lifecycle labels are derived from the canonical availability states without creating a second enum: `Working`, `Not Configured`, `Needs Auth`, `Untrusted Folder`, `Unhealthy`, `Install Failed`, `Unsupported`, and `External / Not Managed`. `Install Failed` is a setup/install diagnostic label that'
- 'MCP resilience is part of the owner contract: PM uses lazy-load startup for enabled servers, runs pre-validation before MCP tool dispatch or provider adapter handoff, keeps cached tool lists as degraded fallback evidence, retries transient startup/health failures before eviction, and preserves stabl'
- MCP connection pooling is the default for managed server sessions. PM MUST NOT use a subprocess-per-call model for MCP servers except for explicitly disposable diagnostic probes; long-lived MCP sessions own lifecycle identity, refresh, health, and teardown state through `mcp_server_record` and `mcp_
- '- Gemini CLI remains the heaviest managed home: auth, extensions, MCP OAuth tokens, history, temp chats, and project registry can all sit under one `.gemini` tree, so PM treats those as profile-local runtime state unless a later owner contract promotes a safe overlay.'
- '- Consumer references include `Plans/Tools.md`, `Plans/newtools.md`, and `Plans/Section15_MVP_Promoted_Features_Spec.md`; slash-form trace labels may render these as `/Tools.md`, `/newtools.md`, or `/Section15_MVP_Promoted_Features_Spec.md`, but ownership stays here.'
- '- DirectApi providers (`Gemini`, `Codex`, `GitHub Copilot`, `Alibaba Coding Plan`, `MiniMax Coding Plan`, `Z.AI Coding Plan`) use PM-native MCP only; no provider-side MCP config files are canonical for `DirectApi` rows, including `MiniMax` and `Z.AI` coding-plan surfaces.'
- '- Cursor CLI evidence includes `cursor-agent` headless output modes such as `/stream-json`, auth status, MCP management, model listing, and about `/version` probing; those probes feed MCP availability instead of redefining the account boundary.'
owner_hints:
- Plans/MCP_Integration.md
split_recommendation_reason: The doc-level source-preserving unit covers both GUI-related and non-GUI spans; future fine-grained PlanUnits should split those surfaces when safe.
```

## Migration Coverage

Original hash: `47c5bc2c1c6dc0199dd175d4f2a6a2ada76f0c7bd904280cbb3a9e7ff66a2d3f`.

Run-scoped proof artifacts:
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/original_hashes.json`
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl`
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/coverage_map.jsonl`
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/anchor_aliases.json`

All original spans from `MCP_Integration-S0001` through `MCP_Integration-S0008` are preserved in place and mapped in `coverage_map.jsonl` to `MI-001`. This batch did not update Spec Lock, generated shards, evidence bundles, auto_decisions, or plan_graph, and it did not create WorkNodes, NodeSeeds, or executable build tasks.
