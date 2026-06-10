# Provider: OpenCode (Server-Bridged)


> **Compliance:** This document follows `Plans/DRY_Rules.md` and references SSOT contracts in `Plans/Contracts_V0.md`. Naming: "Puppet Master" only. No open questions; deterministic defaults per `Plans/Decision_Policy.md`.

## Change Summary

- 2026-02-26: Clarified that OpenCode provider capability/tool reporting feeds `capabilities.get` (category `provider_tool`); media tools remain Puppet Master internal (not OpenCode-provided).
- 2026-02-24: Clarified OpenCode UX/contract details: server-bridged provider status, connection method selection (direct server vs CLI launcher/discovery fallback), auth/sign-in endpoints, model selection through shared Provider contract, and required failure-state mappings.
- 2026-02-24: Initial creation. Defines OpenCode as a server-bridged provider for Puppet Master.

---

## 1. Purpose

Define the integration contract for **OpenCode** as a **server-bridged provider** in Puppet Master. Unlike CLI-bridged providers (Cursor, Claude Code), OpenCode uses a **local HTTP server** with an OpenAPI 3.1 REST API and SSE event stream. Codex, Copilot, and Gemini follow direct-provider auth/calls rather than this server-bridged transport.

**Key distinction (locked):** OpenCode is **server-bridged only**. Puppet Master MUST communicate via HTTP REST + SSE through the unified Provider facade; it MUST NOT run OpenCode as a CLI-bridged runtime transport. If OpenCode is enabled, this transport is not optional.

### 1.1 Transport + auth taxonomy (normative)

- **Transport taxonomy (SSOT):** `Plans/Contracts_V0.md` (§2.1 Provider transport taxonomy) and the Provider routing policy in `Plans/CLI_Bridged_Providers.md`.
- **OpenCode (this plan):**
  - **Transport class:** server-bridged (`ProviderTransport = ServerBridge`; request envelope `transport = "http"`; streaming via SSE).
  - **Auth realms (split):**
    - **Server auth realm:** `server_credentials` (HTTP basic auth to the OpenCode server).
    - **Provider auth realm:** provider-native auth for upstream AI providers, managed inside OpenCode and exposed via `/provider/auth` + callback endpoints.

ContractRef: ContractName:Plans/Contracts_V0.md#21-provider-transport-taxonomy, ContractName:Plans/CLI_Bridged_Providers.md

---

## 2. Non-goals


### 2.1 PM-native vs OpenCode terminology boundary

PM keeps PM-native terminology for tools, runtime identity, and provider routing even when OpenCode exposes related concepts.

ContractRef: ContractName:Plans/Tools.md, ContractName:Plans/Contracts_V0.md

Rules:
- PM terms such as `websearch`, `webfetch`, `requested_persona`, and `effective_persona` remain canonical
- OpenCode terms may be referenced for alignment, adoption notes, or external context, but not as PM's canonical owner vocabulary
- PM-native `/web-tool` and provider-capability ownership language stays aligned to `Plans/Tools.md`; OpenCode consumer text must not flatten provider capability differentiation to `native for all` or replace PM-native ownership boundaries.
## 3. SSOT References (DRY)

- **Provider facade contract:** `Plans/CLI_Bridged_Providers.md` (extended for server transport)
- **Canonical contracts (events/tools/auth/UICommand):** `Plans/Contracts_V0.md`
- **Locked decisions:** `Plans/Spec_Lock.json`
- **Platform CLI data SSOT:** `puppet-master-rs/src/platforms/platform_specs.rs`
- **Deterministic defaults:** `Plans/Decision_Policy.md`
- **DRY + ContractRef rules:** `Plans/DRY_Rules.md`
- **Architecture invariants:** `Plans/Architecture_Invariants.md`
- **Canonical terms:** `Plans/Glossary.md`
- **Wizard/Interview flows:** `Plans/chain-wizard-flexibility.md`
- **OpenCode server docs:** https://opencode.ai/docs/server/
- **OpenCode repository:** https://github.com/anomalyco/opencode

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/CLI_Bridged_Providers.md, PolicyRule:Decision_Policy.md§1

---

## Canonical data-shape reconciliation
### Required data shape

#### Acceptance carry-through
- Move OpenCode session IDs to provider-native correlation fields instead of canonical thread_id
- Define Approval Scope Key across actor/lane/run/account context and reuse it across permissions, HITL, doom-loop, and session approval caching
- In `## Canonical data-shape reconciliation` -> `### Required data shape`, require OpenCode session IDs to live in provider-native correlation fields and never replace canonical `thread_id`.
- Describe approval reuse through one `approval_scope_key` shared with permissions, HITL, doom-loop protection, and session approval caching.
- Define `approval_scope_key` over actor, lane/package/run, and account/server-profile context rather than provider session identity.

#### P5 OpenCode provider identity recovery requirements

- `Plans/assistant-chat-design.md` is healthier than the other three: - thread blocked-state addenda already align to blocked/runtime actions - per-thread usage is already one canonical detail surface - search/log APIs already key to `thread_id`, `run_id`, `message_id`, and `event_id` - remaining drift is concentrated around compatibility-era fields like `resume_url?` in blocked-notice persistence rather than broad ontology problems
- Codex confirmed the sharpest provider-side contract bug is still the **OpenCode `thread_id` collision**: - canonical `thread_id` remains PM correlation - OpenCode session ID is still being treated as if it were that canonical field - this must move into provider-native correlation before shared-runtime event joins become trustworthy
- The cross-cutting canonical runtime fields already exist elsewhere: - `Contracts_V0.md` and `Prompt_Pipeline.md` already own the requested/effective persona/platform/model/auth/account snapshot contract - `storage-plan.md` already owns canonical runnable identity through `run_id`, `node_id`, `attempt_id`, blocked projections, and attempt/runtime records - newer scheduler addenda already expect runnable-unit fields like `replan_generation`, `scheduler_lane`, and queue-analysis refs
- `Plans/Permissions_System.md` + `Plans/Provider_OpenCode.md` - still encode single-session/single-actor assumptions that break under shared provider runtime, multi-lane orchestration, and server-bridged transport
- Provider/runtime identity findings are still active: - `BinaryLocator_Spec.md` now has a sharper ownership gap around OpenCode launcher discovery and an explicitly dangling `Spec_Lock` naming-rule claim. - `Media_Generation_and_Capabilities.md`, `agent-rules-context.md`, and `Skills_System.md` all still under-specify caller scope, execution-role capture, identity disclosure, or currently-usable-vs-instance-enabled capability semantics. - `OpenCode_Coverage_Matrix.md` and `OpenCode_Deep_Extraction.md` now pin more exact OpenCode limits: session identity must stay provider-native, SSE correlation fields remain under-specified, and requested/effective identity parity is still weaker for server-bridged providers than for direct providers.
- Later addenda already require the stronger model: - `attempt_id` - `blocked_reason_code` - `allowed_action_ids[]` - `safe_point_id` - remediation lineage identifiers - `replan_generation` - queue-analysis and blocked-state rendering rules keyed to canonical runtime records
- `Provider_OpenCode.md` contains a direct identity-mapping bug at the contract level: - it maps canonical `thread_id` to an OpenCode session ID - while `CLI_Bridged_Providers.md` treats `thread_id` as the stable PM correlation id and separately allows provider-native identifiers - GPT-5.2 sharpened that OpenCode session IDs belong in provider-native correlation, not in canonical `thread_id`
- OpenCode limitations are now source-verified enough that they should be treated as hard architectural constraints unless the bridge changes: - `OpenCode_Deep_Extraction.md` sharpens the server-global SSE / fixed working-directory / session-scoped compaction and approvals / ephemeral session identity issues into direct PM obligations. - `Media_Generation_and_Capabilities.md` and `OpenCode_Coverage_Matrix.md` both show that caller-scoped identity and transient runtime capability state still lack proper request/event surfaces.
- `Plans/storage-plan.md` - `Plans/Glossary.md` - `Plans/Contracts_V0.md` - `Plans/FinalGUISpec.md`
- `Plans/GUI_Rebuild_Requirements_Checklist.md` - `Plans/LSPSupport.md` - `Plans/Media_Generation_and_Capabilities.md`
- `Plans/GUI_Rebuild_Requirements_Checklist.md` - `Plans/LSPSupport.md` - `Plans/Media_Generation_and_Capabilities.md`
- `Plans/GUI_Rebuild_Requirements_Checklist.md` - `Plans/LSPSupport.md` - `Plans/Media_Generation_and_Capabilities.md`
- `Plans/GUI_Rebuild_Requirements_Checklist.md` - `Plans/LSPSupport.md` - `Plans/Media_Generation_and_Capabilities.md`
- `Plans/Orchestrator_Page.md` + `Plans/Run_Graph_View.md` - still cannot faithfully render the runtime identity bundle or pivot by the newer attempt/receipt/usage anchors
- `Runtime_Artifacts_Panel.md` calls `artifact_id`, `run_id`, `thread_id`, `task_id`, `linked_artifact_id`, and `logical_artifact_id` the canonical ID set, but that set is still missing the attempt-native/runtime attribution fields the rest of the rewrite now depends on.
- The docs imply multiple identity families that must stay distinct: - conversation identity: - `thread_id` - wizard/builder identity: - `wizard_id` - builder stage/run ids - bundle/review ids - orchestration identity: - `run_id` - package/seam/node ids - attempt ids
- `thread_id`, `wizard_id`, bundle/review ids, and orchestration `run_id`/attempt ids must remain linkable but distinct
- Add `actor_kind` / `execution_role` and actor-scoped refs to the shared runtime identity bundle, snapshots, and handoff objects.
- `Runtime_Artifacts_Panel.md` is stronger about canonical runtime identity, but its canonical ID set is still artifact-centric: - `artifact_id` - `run_id` - `thread_id` - `task_id` - `linked_artifact_id` - `logical_artifact_id`
- `chain-wizard-flexibility.md` already carries `project_id` in the assistant-to-wizard payload, but `interview-subagent-integration.md` still shows `thread_id: None` in concrete orchestration/crew paths that should likely preserve thread correlation.
- OpenCode still exposes transport platform/model without clear ownership of upstream provider/account identity.


## 4. Architecture Overview

### 4.1 OpenCode Server Model

OpenCode uses a **client/server architecture**:

1. The user runs `opencode serve` (or the TUI, which starts a server internally).
2. The server exposes an **OpenAPI 3.1** HTTP API on `http://<hostname>:<port>` (default: `http://127.0.0.1:4096`), and serves interactive API docs at `/doc`.
3. Clients interact via REST endpoints and an SSE event stream.
4. OpenCode is **provider-agnostic**: it supports Anthropic, OpenAI, Google, Azure, AWS Bedrock, OpenRouter, XAI, Mistral, Groq, DeepInfra, Venice, ZAI, Alibaba-compatible transports, and more — all configured through its own config.

**Puppet Master connects to OpenCode as a client**, sending prompts and receiving responses through the HTTP API.

**Runtime boundary (scope clarification):** Puppet Master does not use SDK launch flows for OpenCode runtime transport. CLI path input is launcher/discovery fallback only; run transport remains HTTP/SSE.

### 4.2 Transport: HTTP + SSE (Server-Bridged)

| Aspect | CLI-Bridged (existing) | Server-Bridged (OpenCode) |
|--------|----------------------|--------------------------|
| **Communication** | Spawn subprocess, parse stdout/stderr | HTTP REST requests + SSE event stream |
| **Lifecycle** | Process per run (fresh spawn) | Session per run (HTTP session lifecycle) |
| **Model discovery** | CLI command (`agent models`, etc.) | `GET /provider` API endpoint |
| **Auth detection** | Preflight CLI check + exit codes | `GET /global/health` + HTTP status codes |
| **Event stream** | JSONL on stdout | SSE on `GET /event` or synchronous response |
| **Tool calls** | Embedded in JSONL stream | Embedded in message response parts |

### 4.3 Why Server-Bridged (not CLI)

OpenCode's CLI (`opencode`) can launch a TUI/server and also supports non-interactive execution via `opencode run`. Puppet Master still standardizes this provider on the HTTP server API for runtime calls so health/auth checks, model discovery, and event normalization stay transport-consistent with the unified Provider contract. This matches OpenCode's client/server architecture where multiple clients (TUI, IDE plugins, and external integrations) talk to the same server.

---

## 5. Connection Contract

### 5.1 Server Discovery and Connection
OpenCode connection is profile-driven.

Each OpenCode row in PM is a `Server Profile` with one of two modes:
- `Managed Server`
- `Attach to Existing Server`

This profile model replaces the older single-instance connection assumption. PM may track multiple OpenCode server profiles at once, and every request freezes the chosen `connection_profile_id` before execution.

Profile roots may be represented as `/profiles/<connection_profile_id>/` or a concrete provider-root `.../profiles/<connection_profile_id>/`; each profile is a per-unit runtime surface with PM sidecar state under `pm/state.json`, `pm/logs/`, `pm/projections/`, and `pm/backups/`.

ContractRef: ContractName:Plans/Multi-Account.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/storage-plan.md

Required profile fields:
- `connection_profile_id`
- `label`
- `profile_mode`
- endpoint summary (`host`, `port`, or explicit base URL)
- `endpoint`
- `server_auth_ref`
- `config_root`
- `enabled`
- `priority`
- `discovered_upstream_provider_ids[]`
- optional credential refs for HTTP auth
- health state
- discovery state
- last discovery snapshot metadata
- PM ownership mode

Connection rules:
- `Managed Server` means PM owns launch command, environment/config selection, reconnect attempts, and shutdown behavior.
- `Attach to Existing Server` means PM owns endpoint/auth configuration and health/discovery polling only.
- all runtime calls remain HTTP/SSE server-bridge calls regardless of whether PM launched the process.
- profile selection freezes into `connection_profile_id` in the requested/effective runtime snapshot before execution.
- The `managed-vs-attached` split is part of the OpenCode `/transport` contract: PM supports one-or-many OpenCode server-profile and `/config` profiles instead of a single global connection record.
- For `Managed Server`, PM may launch OpenCode with a PM-selected `OPENCODE_CONFIG_DIR` and owns the `long-lived` MCP configuration state in the provider-profile config root where the provider requires local config files; run start may perform only a lightweight `last-mile` worktree-specific sync rather than a full install/`/setup` on every call.
- For `Attach to Existing Server`, the selected endpoint is an `attached-server`. PM reflects server-side MCP and tool configuration as `External / Not Managed` unless the OpenCode server API exposes a deliberate PM-managed `/config` path.

ContractRef: ContractName:Plans/CLI_Bridged_Providers.md, ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/FinalGUISpec.md
### 5.2 Health Check
Health and discovery are separate states.

PM must evaluate OpenCode profiles in this order:
1. connection / launch state
2. health check result
3. discovery refresh result

ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/storage-plan.md, ContractName:Plans/usage-feature.md

Canonical profile states:
- `Configured`
- `Launching` or `Connecting`
- `Connected`
- `Discovering`
- `Ready`
- `Connected (stale discovery)`
- `Connected (discovery failed)`
- `Disconnected`
- `Launch failed`

Rules:
- a profile is not fully `Ready` until health succeeds and discovery completes.
- if health succeeds but discovery fails, the profile remains connected but degraded.
- if a previously ready profile disconnects, PM preserves the last-known discovery snapshot and marks it stale rather than blanking the provider/model surface.
- attached profiles may be healthy while still `ExternalNotManaged` for some management affordances.
- discovery state covers provider, model, and auth refresh together. GUI/status projections may label that grouped readiness as `/models/auth` or `/discovery/auth`; if a cached discovery snapshot is reused after a failed refresh, the row must keep explicit `/stale` labeling alongside the last-known provider/model/auth facts.
- Upstream auth exposed by OpenCode is labeled `Connected in OpenCode`; it is not converted into a PM-owned account row. When a profile is disconnected or unhealthy, PM preserves last-known `/providers`, models, and auth facts with explicit `stale-state` labeling rather than blanking the upstream surface.

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Multi-Account.md, ContractName:Plans/CLI_Bridged_Providers.md
### 5.3 Auth realms and sign-in surfaces

OpenCode has two auth realms that Puppet Master MUST represent in UX (terminology per `Plans/CLI_Bridged_Providers.md`):

1. **Server-level auth (OpenCode server):**
   - Server can require password auth via `OPENCODE_SERVER_PASSWORD` and optional username.
   - Puppet Master sends configured username/password when connecting to server endpoints.

2. **Provider-level auth (inside OpenCode):**
   - OpenCode exposes provider auth/sign-in surfaces at `/provider/auth` and OAuth/callback endpoints.
   - Puppet Master SHOULD deep-link/open these flows when the user chooses "Sign in" for an unconnected provider, then refresh provider/model discovery via `GET /provider`.

### 5.4 Version Compatibility

Puppet Master SHOULD record the OpenCode server version from the health check response. If a minimum version is required for specific features, emit `diagnostic(category="version_mismatch")` and continue with best-effort operation.

---

## 6. Provider Facade Mapping

OpenCode MUST map into the unified Provider facade defined in `Plans/CLI_Bridged_Providers.md`.

ContractRef: ContractName:Plans/CLI_Bridged_Providers.md, ContractName:Plans/Architecture_Invariants.md#INV-009

### 6.1 ProviderRequestEnvelope → OpenCode API

OpenCode is a server-bridged adapter over the PM child-run model.

ContractRef: ContractName:Plans/CLI_Bridged_Providers.md, ContractName:Plans/Tools.md, ContractName:Plans/storage-plan.md

Mapping rules:
- PM `thread_id`, `run_id`, `parent_run_id`, and `child_run_id` remain canonical PM lineage fields.
- The server-bridged OpenCode projection mirrors the expanded correlation `/identity` bundle from `ProviderRequestEnvelope`, including run/thread/parent/child lineage, attempt identity, execution role, requested/effective runtime/provider/model/account descriptors, permission/tool-policy snapshot refs, working-directory or worktree identity, prompt parts, retry/approval context, normalized output/correlation ids, and provider-native session ids as additive metadata only.
- OpenCode session ids are additive provider correlation fields only.
- PM must not rewrite `thread_id` into an OpenCode session id.
- PM preserves requested versus effective runtime/model/effort state even when OpenCode internally uses agent/session configuration.
- PM records the runtime platform as `opencode` while model IDs preserve upstream provider namespaces such as `anthropic/...`; the transport host and upstream provider identity must remain distinct in requested/effective runtime disclosure.
- OpenCode's provider-entry mapping participates in PM's provider-first and transport-aware `/transport` model, which distinguishes `cli-bridged`, `direct-provider`, and `server-bridged` lanes; OpenCode itself remains `server-bridged`, and the `/backend` effective-state owner remains the OpenCode runtime, while model IDs and `IDs` preserve upstream provider identity such as `anthropic/...`, `google/...`, `anthropic/claude-sonnet-*`, and the model-family fragment `/claude-sonnet-`.
- OpenCode provider discovery may expose Alibaba provider entries as `alibaba` and `alibaba-cn`; both use `DASHSCOPE_API_KEY` and OpenAI-compatible DashScope endpoints. PM records those entries as OpenCode-discovered provider facts and does not invent a separate `alibaba-coding-plan` OpenCode provider entry unless discovery or an owner contract later proves it exists.
- OpenCode is a concrete near-term implementation-reference path for long-tail provider coverage because its provider docs and transforms cover MiniMax and Z.AI explicitly and handle Alibaba/DashScope quirks, but PM must still evaluate discovered provider entries as data. PM cannot assume OpenCode already split Alibaba Coding Plan into a separate OpenCode provider entry the same way MiniMax Coding Plan, MiniMax, or Z.AI may be represented in provider docs, transforms, or direct-provider plans. Zhipu AI Coding Plan external evidence is tracked at `https://docs.bigmodel.cn/cn/coding-plan/overview`; the historical source spelling `//docs.bigmodel.cn/cn/coding-plan/overview` normalizes to that HTTPS URL.
- OpenCode-native skill tool behavior appears shared across OpenCode-discovered MiniMax, Z.AI, Alibaba-family provider entries, Codex, and GitHub Copilot where the OpenCode server exposes the same tool surface; PM still treats that as OpenCode server-profile behavior rather than direct-provider skill canon.
- OpenCode's aggregator/bridge role covers upstream vendors PM may not support natively; on app `boot-refresh`, PM refreshes OpenCode provider/model discovery in the background, keeps last-known connected upstream models visible until refresh finishes, and reports progress or per-provider failure in the shell `/status-bar` without blocking runtime selection.
- `OPENCODE_CONFIG_DIR` can point to a custom config directory that overrides OpenCode agent/command/plugin discovery. PM treats that `/command/plugin` discovery effect as OpenCode provider configuration, not as PM User Command ownership.
- OpenCode provider-session identifiers remain provider-native correlation metadata; they never replace PM `thread_id`, `run_id`, `parent_run_id`, `child_run_id`, or attempt lineage.

OpenCode cache/request metadata is adapter evidence, not PM storage canon:
- When OpenCode config exposes `options.setCacheKey`, PM records `setCacheKey` / `options.setCacheKey` as session-scoped provider-side cache metadata and keeps the prompt-cache key tied to the OpenCode session correlation handle.
- OpenCode may set `store = false` for OpenAI and GitHub Copilot SDK paths; PM preserves that as provider request metadata and must not infer durable PM storage from it.
- OpenCode `provider.ts` strips OpenAI item ids from request bodies by default and keeps them only for Azure when `store=true`; PM treats this as Codex-style provider request-shape evidence, not as PM transcript deletion or durable storage policy.
- OpenCode cache markers may be message-level or `/content-level` and provider-specific; Anthropic/Bedrock enablement must preserve `/Anthropic` detection evidence such as `#9803` when it affects cache behavior.

Required preserved envelope fields:
- `run_id`
- `thread_id`
- `parent_run_id?`
- `child_run_id?`
- `attempt_id?`
- mode and execution strategy
- working directory and workspace roots
- prompt parts
- tool policy and permission snapshot refs
- requested/effective runtime fields

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/Models_System.md
### 6.2 Session Lifecycle → Run Lifecycle

OpenCode child sessions map to PM child runs; they do not replace them.

ContractRef: ContractName:Plans/Tools.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Contracts_V0.md

Mapping rules:
- OpenCode `task_id` is a resumable provider correlation handle for the PM child run.
- OpenCode `parentID` is additive provider lineage, not PM’s only parent-child truth.
- OpenCode `@agent-name` shorthand is adapter input only: PM translates `@agent-name` / `agent-name` mentions into the canonical task-tool launch path and does not treat them as a special runtime bus.
- OpenCode TUI/root-session aggregation of child permissions or `/questions` normalizes into PM parent-mediated question/HITL handling and does not create child-local user-question authority.
- OpenCode child-session behavior is not evidence for native peer-to-peer subagent messaging or PM `/message-board` behavior; PM crew coordination remains owned by the canonical orchestrator message-board contract.
- PM retry, reroute, resume, and replacement semantics remain PM-owned regardless of how OpenCode resumes a child session.
- completed disposable children are not treated as durable reusable actors merely because OpenCode can reopen session history.

ContractRef: ContractName:Plans/assistant-memory-subsystem.md, ContractName:Plans/orchestrator-subagent-integration.md, ContractName:Plans/assistant-chat-design.md
### 6.3 Normalized Event Stream Mapping

OpenCode response parts map to Puppet Master normalized events:

| OpenCode Part Type | Puppet Master Event | Notes |
|---|---|---|
| `text` part in assistant message | `text_delta` | Incremental text output |
| `thinking` part (if present) | `thinking_delta` | Reasoning/thinking output |
| Tool call in parts | `tool_use` | `tool_use_id` from part, `tool_name`, `arguments` |
| Tool result in parts | `tool_result` | `tool_use_id`, `ok`, `result` |
| Usage info in message | `usage` | `input_tokens`, `output_tokens` from message metadata |
| Error in message | `error` | Map OpenCode error types to normalized categories |
| Final message received | `done` | `status` = `success` or `failed` based on error presence |

**SSE event mapping (for async/streaming):**
When using `GET /event` SSE stream, OpenCode emits bus events. Puppet Master MUST:
- Subscribe to the SSE stream after sending `prompt_async`
- Map session-scoped events to normalized provider events
- Emit `done` when the session status transitions to completed/failed

ContractRef: ContractName:Plans/CLI_Bridged_Providers.md, ContractName:Plans/Architecture_Invariants.md#INV-009

### 6.4 Auth state machine mapping

OpenCode MUST emit `auth_state` events and follow the canonical bridged-provider auth/UX detection state machine (SSOT: `Plans/CLI_Bridged_Providers.md` → “Login/auth UX detection state machine”). This section only specifies **OpenCode-specific signals**.

**OpenCode signal mapping (normative):**
- Initial (before preflight): `LoggedOut` (conservative default; updated after first preflight).
- Preflight (`GET /global/health`) — **OpenCode server realm**:
  - `200` + `healthy: true` → `LoggedIn`
  - `401` → `LoggedOut` (wrong/missing server credentials)
  - connection refused / timeout / `healthy: false` → `AuthFailed` + emit diagnostic `provider_outage_or_network`
- In-run — **provider auth realm (inside OpenCode)**:
  - `ProviderAuthError` (from upstream provider inside OpenCode) → `AuthExpired`
  - upstream rate-limit/outage errors → emit diagnostics (e.g. `rate_limited`, `provider_outage_or_network`) and/or `done.stop_reason`; MUST NOT expand the auth state enum.
  - in-run failover uses PM reason codes in the requested/effective runtime snapshot: `hard_exhaustion_failover`, `rate_limit_failover`, `auth_failure_failover`, `provider_outage_failover`, and `transport_failure_failover`.

ContractRef: ContractName:Plans/CLI_Bridged_Providers.md, ContractName:Plans/Contracts_V0.md#AuthState

### 6.5 Unified Provider Trait / Capability / Policy Constraints

OpenCode-specific behavior must preserve PM policy constraints rather than silently overriding them.

ContractRef: ContractName:Plans/Models_System.md, ContractName:Plans/Permissions_System.md, ContractName:Plans/CLI_Bridged_Providers.md

Required adapter behaviors:
- preserve PM requested/effective runtime and capability disclosure.
- keep provider-native agent files and provider-native invocation syntax in the interoperability lane only.
- support additive provider correlation for child-session mapping and billing-sensitive behaviors.
- preserve prompt-cache-friendly separation between stable static agent/provider prompt content and dynamic environment or instruction content; OpenCode PR `#14203` is implementation-reference evidence for avoiding prompt-cache misses when agent/provider prompt text is concatenated with dynamic `/instruction` material.
- avoid synthetic fake-user replay messages as PM’s continuity mechanism.

OpenCode/Copilot-specific notes:
- OpenCode uses `x-initiator` classification for Copilot-sensitive requests.
- PM may use equivalent additive provider metadata where billing classification depends on whether a call is user- or agent-initiated.
- that adapter-specific behavior does not weaken the PM strict-deny rule for non-Copilot parents attempting Copilot-native child routing.
- Adapter-specific billing or `/caching` evidence from OpenCode does not satisfy the Copilot TOS constraint; Copilot-native child routing remains available only when the active provider/root path is Copilot-compatible under PM policy.

ContractRef: ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/Tools.md, ContractName:Plans/Contracts_V0.md
## 7. Model Discovery

### 7.1 Dynamic Model List

Puppet Master discovers available models via the OpenCode provider API:

```
GET /provider
→ {
    "all": [ { "id": "anthropic", "name": "Anthropic", "models": [...] }, ... ],
    "default": { "anthropic": "claude-sonnet-4-5-20250514", ... },
    "connected": ["anthropic", "openai"]
  }
```

**Model ID format:** OpenCode uses compound model IDs: `{providerID}/{modelID}` (e.g., `anthropic/claude-sonnet-4-5-20250514`).

### 7.2 Model Selection in GUI

The model picker for OpenCode MUST:
1. Fetch models from `GET /provider` on provider enable and on refresh
2. Display only models from **connected** providers (providers the user has authenticated in OpenCode)
3. Group models by OpenCode provider (Anthropic, OpenAI, etc.)
4. Cache the model list with a configurable TTL (default: 5 minutes)
5. Use the same Provider-contract model selection UI surface used by all providers (no OpenCode-specific model-picker logic beyond the discovered model source)

ACP model listing can supply model IDs, names, and descriptions (`IDs/names/descriptions`), but that response is not by itself a rich effort-capability contract. PM must obtain or infer effort-capability from the shared provider capability matrix before presenting effort controls as supported.

ACP agent streams may emit `usage_update`. When available, PM maps that usage into the shared provider usage event shape with input/output/reasoning/cache token breakdown (`/output/reasoning/cache`) plus cost, preserving ACP as the source protocol rather than treating the update as an OpenCode-only GUI counter.

ContractRef: ContractName:Plans/CLI_Bridged_Providers.md, CodePath:puppet-master-rs/src/platforms/platform_specs.rs

### 7.3 Fallback Models

If dynamic model discovery fails (server unreachable), Puppet Master MUST NOT hardcode fallback models for OpenCode. Instead, surface an error: "Cannot discover models — OpenCode server unreachable."

ContractRef: ContractName:Plans/DRY_Rules.md#2-dont-duplicate-canonical-contracts, PolicyRule:Decision_Policy.md§4

**Rationale:** Unlike CLI-bridged providers where Puppet Master knows the platform's model catalog, OpenCode's available models depend entirely on the user's OpenCode configuration and authenticated providers. Hardcoding would be incorrect.

---

## 8. Capability flags

Capability flags are **SSOT in** `puppet-master-rs/src/platforms/platform_specs.rs`. This plan does not redefine them.

OpenCode-specific capability requirements (normative):
- Transport remains `http` (server-bridged).
- **Plan mode:** When `mode=plan`, Puppet Master MUST use the OpenCode `plan` agent (read-only). When `mode=execute`, use the `build` agent.
- **Provider-tool capability reporting:** OpenCode-discovered tools (from `GET /provider` and session tool lists) MUST be reported through `capabilities.get` with `category: "provider_tool"`. Each tool entry includes the same `enabled` / `disabled_reason` / `setup_hint` shape defined in `Plans/Media_Generation_and_Capabilities.md` [§1.2](Plans/Media_Generation_and_Capabilities.md#CAPABILITY-SYSTEM). This enables agents and users to discover all available OpenCode tools via capability introspection.
- **Provider capability aliases:** OpenCode-native declarations such as `supportsParallelTools`, `supportsAssistantMessagePrefill`, and `maxPayloadSize` normalize into the shared provider capability fields before PM routing, request shaping, or model-effort UI decisions consume them.
- **Media tools are NOT OpenCode-provided:** Media generation (`media.image`, `media.video`, `media.tts`, `media.music`) remains a Puppet Master internal capability backed by the Gemini API key (or Cursor-native for images). OpenCode MUST NOT expose or proxy media-generation tools. The media capability picker dropdown does not include OpenCode tools; see `Plans/Media_Generation_and_Capabilities.md` [§4](Plans/Media_Generation_and_Capabilities.md#CAPABILITY-PICKER).

ContractRef: ContractName:Plans/CLI_Bridged_Providers.md, CodePath:puppet-master-rs/src/platforms/platform_specs.rs, PolicyRule:Decision_Policy.md§4, ToolID:capabilities.get, ContractName:Plans/Media_Generation_and_Capabilities.md#CAPABILITY-SYSTEM

---

## 9. Failure States and Recovery

### 9.1 Failure Taxonomy

| Failure | Detection | Puppet Master Response |
|---|---|---|
| OpenCode not installed | `opencode` binary not found on PATH | Surface in Doctor page: "OpenCode not installed. Install from https://opencode.ai" |
| Server not running | Health check connection refused | Surface: "OpenCode server not running. Start with: `opencode serve`" |
| Server unreachable | Health check timeout or network error | Surface: "Cannot reach OpenCode server at {host}:{port}" |
| Auth required | Health check 401 | Surface: "OpenCode server requires authentication. Configure credentials in Settings." |
| Auth expired/invalid | ProviderAuthError during prompt | Surface: "OpenCode provider auth error: {message}. Re-authenticate in OpenCode." |
| Version mismatch | Version check against minimum | Emit `diagnostic(category="version_mismatch")`, continue best-effort |
| Provider not connected | No connected providers in `GET /provider` | Surface: "No AI providers configured in OpenCode. Configure providers in OpenCode settings." |
| Session error | Error response from session/message API | Map to normalized `error` event, emit `done(status=failed)` |

### 9.2 Doctor Page Integration

The Doctor page MUST include OpenCode checks when `opencode_enabled` is true:

ContractRef: ContractName:Plans/Architecture_Invariants.md#INV-002, ContractName:Plans/Contracts_V0.md#AuthState

1. **Binary check:** Is `opencode` on PATH? (informational; server may be started by other means)
2. **Server reachability:** Can we reach `GET /global/health`?
3. **Auth check:** Does the health check succeed without 401?
4. **Provider check:** Are any AI providers connected? (`GET /provider` → `connected` array non-empty)
5. **Version check:** Is the server version ≥ minimum supported version?

---

## 10. GUI Configuration

### 10.1 Provider Settings (Settings Page)
OpenCode appears in Agent-Config and provider settings as a server-profile-driven provider.

Required fields and actions:

| Field / action | Purpose |
|---|---|
| `Enable OpenCode` | Master provider toggle |
| `Add Managed Server` | Create a profile that PM launches and supervises |
| `Add Attached Server` | Create a profile for an already-running external server |
| endpoint/base URL inputs | Configure the server address |
| optional auth inputs | Configure HTTP auth via credential refs |
| `Reconnect` | Retry connection for the selected profile |
| `Restart Server` | Restart a managed profile |
| `Refresh Discovery` | Re-run provider/model discovery |
| `Detach from PM control` | Convert a managed/controlled projection target to external/manual control where supported |
| status badges | Show connection, health, discovery, and stale-cache state |

ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Multi-Account.md, ContractName:Plans/storage-plan.md

UI rules:
- the primary row label is the profile label, not an implied account identity.
- the inspector shows connection mode, endpoint summary, discovery freshness, and PM ownership mode.
- skills and MCP settings shown under an OpenCode profile must preserve the distinction between PM-owned canon and OpenCode-reflected state.
- attached profiles must not expose lifecycle actions that imply PM owns the remote process.
- for `opencode`, PM may share PM instructions/skills through OpenCode-native projection, but it isolates `/runtime` state, server auth, discovered upstream auth/runtime state, and server-side session residue from PM-native canonical state.
- OpenCode skill discovery is global to the selected server-profile, not attached to only one upstream provider. The environment toggle `OPENCODE_DISABLE_CLAUDE_CODE_SKILLS` is recorded as OpenCode server behavior evidence, and PM still routes canonical skills/tools through the PM skill and tool contracts.

ContractRef: ContractName:Plans/OpenCode_Deep_Extraction.md, ContractName:Plans/Skills_System.md, ContractName:Plans/Tools.md
### 10.2 Tier Configuration

When OpenCode is enabled, it appears in the platform dropdown for any tier. Model selection shows models discovered from the OpenCode server, grouped by underlying provider.

**No special-casing in UI:** OpenCode uses the same tier config card layout as other providers. The only difference is the model list source (HTTP API vs CLI command).

### 10.3 CLI Path Scope (Fallback-Only)

Unlike CLI-bridged providers, OpenCode does NOT require CLI path input for normal runtime operation. If provided, `opencode` CLI path is used only for local launcher/discovery fallback and installation diagnostics; OpenCode run transport remains HTTP/SSE.

---

## 11. platform_specs integration (SSOT)

OpenCode MUST be represented in `puppet-master-rs/src/platforms/platform_specs.rs` (SSOT). This plan does not duplicate the full spec table.

Minimum OpenCode constraints the spec MUST encode (normative):
- Platform variant: `OpenCode`
- Transport: `http` (server-bridged)
- Default server port: `4096`
- CLI path is **optional** and used only for launcher/discovery fallback (not as runtime transport)
- No hardcoded fallback models (dynamic discovery only)

ContractRef: ContractName:Plans/DRY_Rules.md#2-dont-duplicate-canonical-contracts, CodePath:puppet-master-rs/src/platforms/platform_specs.rs

---

## 12. Process Isolation

**Policy:** Each Puppet Master iteration creates a **new OpenCode session** (`POST /session`), sends the prompt, waits for completion, and then **deletes the session** (`DELETE /session/:id`). No session reuse across iterations.

**Rationale:** Maintains the same fresh-process-per-iteration guarantee as CLI-bridged providers, applied to the session abstraction.

ContractRef: PolicyRule:CU-P2-T12

---

## 13. Invocation Shape (Normative)

### 13.1 Synchronous Run

```
1. Health check:
   GET /global/health → 200 { healthy: true, version: "..." }

2. Create session:
   POST /session
   Body: { "title": "PM-2026-02-24-19-30-00-001" }
   → { "id": "session-uuid", ... }

3. Send prompt:
   POST /session/{id}/message
   Body: {
     "model": { "providerID": "anthropic", "modelID": "claude-sonnet-4-5-20250514" },
     "agent": "build",
     "parts": [{ "type": "text", "text": "<prompt>" }]
   }
   → { "info": { ... }, "parts": [ ... ] }

4. Parse response parts → normalized events

5. Delete session:
   DELETE /session/{id}
```

### 13.2 Asynchronous Run (SSE)

```
1-2. Same as synchronous

3. Subscribe to events:
   GET /event → SSE stream

4. Send prompt async:
   POST /session/{id}/prompt_async
   Body: { ... same as sync ... }
   → 204 No Content

5. Receive SSE events → map to normalized events

6. On session complete → emit done, delete session
```

### 13.3 Cancellation and abort contract

Cancellation is a first-class provider control and is distinct from ordinary request failure.

Rules:
- canceling an in-flight request means Puppet Master sends a provider-specific cancellation action for the active OpenCode transport, such as closing the HTTP stream, canceling the SSE subscription, or triggering an abort signal on the request handle
- if partial output tokens have already been received, those tokens are retained and the normalized response is marked `completion_reason: cancelled`
- timeout and cancel are distinct: timeout is automatic after `request_timeout_ms`, while cancel is a user-initiated action
- after cancellation, the provider connection is returned to the connection pool when healthy, or closed and discarded when the transport is suspected to be corrupted
- PM MUST emit `provider.request_cancelled { provider_id, request_id, tokens_received, reason: "user" | "timeout" | "budget" | "error" }`

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Executor_Protocol.md, ContractName:Plans/storage-plan.md

### 13.4 Concurrency model

OpenCode request dispatch is queue-backed and provider-account scoped.

Rules:
- default mode is sequential: one active request at a time per provider account
- parallel mode is allowed only when explicitly enabled, such as subagent execution or other orchestrator-controlled fan-out flows
- concurrency limit is configurable per provider account; default = `1`; upper bound is provider-specific and MUST respect upstream rate-limit constraints
- when the concurrency limit is reached, new requests enter a FIFO queue
- queued requests time out after `queue_timeout_ms` (default `30000ms`) if they have not started execution
- different accounts for the same provider have independent concurrency limits and independent queues
- PM MUST emit `provider.request_queued { provider_id, request_id, queue_position, queue_depth }` whenever a request is queued instead of starting immediately

ContractRef: ContractName:Plans/Multi-Account.md, ContractName:Plans/Executor_Protocol.md, ContractName:Plans/Contracts_V0.md

### 13.5 Streaming error recovery

Streaming recovery preserves already-received output while keeping retry ownership aligned with PM runtime policy.

Rules:
- if the connection breaks mid-stream, PM MUST:
  1. retain all tokens received so far
  2. mark the partial response as `completion_reason: stream_error`
  3. attempt reconnect when `auto_retry_stream: true` (default)
  4. include `partial_response` context in the retry so the model can continue when the provider supports continuation from partial output
- provider support for continuation from partial output is not universal; when unsupported, PM preserves the partial output and surfaces the stream error without fabricating a seamless continuation

Rate-limit handling:
- on HTTP `429`, read `Retry-After` when present; otherwise use exponential backoff `1s → 2s → 4s`
- maximum rate-limit retries = `3`
- after the retry limit is exceeded, fail the attempt with `failure_class: rate_limited`

Token/budget handling:
- if the model hits its output token limit during streaming, the response ends normally with `completion_reason: length`
- if PM budget enforcement triggers mid-stream, PM terminates the stream, keeps the partial response, and marks `completion_reason: budget_exceeded`

ContractRef: ContractName:Plans/Executor_Protocol.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/storage-plan.md

---

## 14. Persistence Mapping (seglog)

OpenCode runs persist to seglog using the same event types as other providers:

- `run.started` at run begin with `{ run_id, thread_id, platform: "opencode", mode, transport: "http" }`
- Tool events (`tool.invoked`, `tool.denied`) extracted from OpenCode response parts
- `usage.event` from message metadata (input/output tokens)
- `run.completed` with `{ run_id, status }` on session completion

Do not copy OpenCode visuals directly or overclaim OpenCode-derived cost certainty. OpenCode cost handling carries provider-cache and provider-normalization caveats, so PM surfaces OpenCode-style cost as `estimated-cost` unless provider-authoritative pricing is available, and raw/debug evidence preserves the upstream cache/input reporting caveat.

OpenCode persistence is provider-local reference state, not PM canonical state: non-atomic writes, shared snapshot indexes, SQLite stores, and NFS-incompatible filesystem assumptions MUST NOT be used as the authoritative PM ledger, event log, or recovery source.

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Contracts_V0.md#EventRecord

---

## 15. Acceptance Criteria (Testable)

1. When `opencode_enabled` is true and the server is reachable, Puppet Master can create a session, send a prompt, receive a response, and delete the session.
2. Model discovery via `GET /provider` returns models grouped by connected providers; the GUI model picker displays them.
3. Health check failures produce appropriate auth state changes and user-facing error messages.
4. OpenCode runs produce normalized events (`text_delta`, `tool_use`, `tool_result`, `usage`, `done`) identical in shape to CLI-bridged provider runs.
5. Each iteration creates a new session and deletes it after completion (no session reuse).
6. OpenCode appears in tier config platform dropdown only when enabled.
7. Doctor page shows OpenCode health checks when enabled.
8. Secrets (password) are stored in OS credential store, not in config files.
9. The provider functions identically through the unified Provider facade — consumers do not branch on OpenCode vs CLI providers.

---

## 16. References

- `Plans/CLI_Bridged_Providers.md` (Provider facade contract, extended for HTTP transport)
- `Plans/Contracts_V0.md` (canonical event/auth/UICommand contracts)
- `Plans/storage-plan.md` (seglog persistence)
- `Plans/chain-wizard-flexibility.md` (wizard/interview provider selection)
- `Plans/Architecture_Invariants.md` (invariants)
- `Plans/Decision_Policy.md` (deterministic defaults)
- `Plans/DRY_Rules.md` (DRY + ContractRef)
- `Plans/Glossary.md` (canonical terms)
- `puppet-master-rs/src/platforms/platform_specs.rs` (platform specs SSOT)
- OpenCode server docs: https://opencode.ai/docs/server/
- OpenCode repository: https://github.com/anomalyco/opencode

## OpenCode Runtime Retry / Blocked-State / Packet Canonical Alignment (2026-03-09)


OpenCode-specific runtime behavior must remain aligned with the canonical runtime scheduler, retry taxonomy, safe-point contract, remediation lineage, runtime packet, and usage pipeline.

### Required OpenCode runtime fields

Each OpenCode-backed attempt MUST preserve the shared runtime identity and correlation bundle:
- `run_id`
- `thread_id`
- `node_id`
- `attempt_id`
- `retry_count` when present
- requested/effective model identifiers
- requested/effective permission snapshot identifiers when relevant
- `replan_generation`
- `mutation_capable`
- `safe_point_id?`
- `remediation_root_id?`
- `remediation_parent_attempt_id?`
- `remediation_generation?`

If a field is not transmitted directly to an OpenCode HTTP endpoint, the adapter MUST still preserve it in local correlation state and attach it to normalized provider events, storage records, and retry/recovery decisions.

### Required rules
- preserve canonical runtime identity (`run_id`, `thread_id`, `node_id`, `attempt_id`, generation, snapshot ids, safe point, and remediation lineage) across the request/stream lifecycle
- OpenCode transport reconnect logic may reconnect only to observe an existing attempt; it MUST NOT silently resubmit prompts, reset attempt identity, or invent provider-local fallback loops
- once a prompt/request has been accepted for execution, any retry decision MUST round-trip through the canonical runtime scheduler and failure taxonomy
- OpenCode-specific auth, transient, structured-output, and tool-denial signals MUST normalize into canonical `blocked_reason_code` / `failure_class` values before orchestration or UI consumes them
- prerequisite resolution after auth or permission recovery MUST surface a canonical scheduler wake and create a new attempt snapshot rather than mutating the blocked attempt in place
- a `safe_point_id` created before a mutation-capable OpenCode attempt remains attached across the entire request/stream lifecycle
- recovery restores that rerun work use a new `attempt_id` while preserving lineage references to the restored parent context
- replan invalidation MUST be checked before rerunning a blocked or retried OpenCode attempt; stale attempts from an older `replan_generation` must not resume silently
- any OpenCode-local retry wording is superseded by canonical runtime retry ownership

### Canonical failure and blocked mapping

OpenCode-specific signals MUST collapse into the shared runtime taxonomy before they reach orchestration or UI layers.

| OpenCode / server condition | Canonical runtime classification | Required behavior |
|---|---|---|
| `401` / invalid server credentials / server auth expiry for the OpenCode server realm | `blocked_reason_code = auth_expired` (server realm) | Surface blocked recovery; require credential refresh before explicit retry |
| Upstream provider auth challenge or expired provider session reported by OpenCode | `blocked_reason_code = auth_expired` (provider realm) | Preserve blocked node/thread state and wait for auth recovery |
| Timeout, connection refused, transient SSE disconnect after submission, HTTP 5xx, provider outage, or rate limiting | `failure_class = provider_transient` | Runtime retry/backoff policy applies; no OpenCode-local retry policy may override it |
| Malformed structured output, missing required JSON shape, or incomplete normalized tool payload | `failure_class = structured_output_invalid` | Route into structured-output remediation / retry policy |
| Tool-policy refusal, permission denial, FileSafe denial, or external side-effect approval block surfaced through OpenCode-mediated work | Preserve the already-determined canonical runtime class (`permission_denied`, `filesafe_blocked`, `external_side_effect_blocked`, etc.) | The adapter MUST NOT collapse these to generic `error` or `provider_failed` |

### Capability and usage alignment

OpenCode capability reporting MUST stay consistent with the shared provider contract.

Required declarations:
- transport class = server-bridged HTTP/SSE
- supports streaming normalized events
- supports tool use only through the canonical tool-policy snapshot
- uses split auth realms (server credentials vs upstream provider auth)
- performs no hidden runtime retries

If OpenCode or the selected upstream model does not support a requested runtime control, Puppet Master MUST record the control as unsupported/skipped in effective runtime state rather than silently ignoring it.

**Usage and Ledger alignment:** OpenCode server returns message-level usage; the adapter maps it to normalized usage (same shape as `usage.event`). Persistence and Ledger/Usage consumption follow `Plans/storage-plan.md` and `Plans/usage-feature.md`. For implementers, the OpenCode product pipeline (`Session.getUsage`, processor finish-step) is the reference for how message metadata becomes stored usage; terminology should not drift.

ContractRef: ContractName:Plans/CLI_Bridged_Providers.md, ContractName:Plans/Provider_Stream_Mapping_External_Reference_A2A.md, ContractName:Plans/Models_System.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/storage-plan.md, ContractName:Plans/usage-feature.md
