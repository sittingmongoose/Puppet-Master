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
- **Provider/model capability SSOT:** `Plans/Models_System.md`, `Plans/Contracts_V0.md`, `Plans/CLI_Bridged_Providers.md`, and `Plans/Media_Generation_and_Capabilities.md`. Legacy `puppet-master-rs/src/platforms/platform_specs.rs` references are source-lineage only.
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

## Ledger Compile Addendum - pldg-20260624-001-provider-updates

This addendum compiles accepted provider-update ledger atoms into OpenCode provider/source-lineage boundaries. It does not create WorkNodes, NodeSeeds, executable queues, implementation files, generated governance artifacts, or production build tasks.

### PO-048 - OpenCode Coding-Plan Source-Lineage Boundary

```yaml
plan_unit_id: PO-048
unit_type: compatibility_disposition
status: accepted
owner_doc: Plans/Provider_OpenCode.md
canonical_text: >-
  OpenCode server routes, OpenCode/Models.dev provider catalogs, `opencode-cursor`, `opencode-gpt-imagegen`, and current OpenCode coding-plan config are source-lineage or OpenCode-provider evidence unless the target provider route is explicitly OpenCode server. PM may use current OpenCode commit `753d312c28519b0c060a56e69e8cde971b3719bb` and Models.dev as mapping source-lineage for provider ids, model defaults, and transform caveats, but direct-provider implementation readiness still requires PM-owned route contracts and local end-to-end proof.
gui_related: false
gui_classification_reason: Provider/source-lineage evidence boundary rather than visual presentation.
depends_on: [MS-113, CV-292]
unblocks: [MS-114, MS-115]
acceptance_criteria:
  - OpenCode server support remains its own provider route.
  - OpenCode-routed GitHub Copilot, Cursor, and other upstream providers are not direct-provider closure evidence.
  - Current OpenCode/Models.dev coding-plan config can seed PM-owned mappings with preserved source refs.
  - Unofficial OpenCode image or Cursor plugins are not imported as PM backend canon.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260624-001-provider-updates
risk_class: opencode_source_lineage_overclaim
reasoning_tier: high
context_scope: opencode_provider_boundary
implementation_surfaces: [Plans/Provider_OpenCode.md, Plans/Models_System.md, Plans/Contracts_V0.md, Plans/Media_Generation_and_Capabilities.md]
node_compile_hint: {mode: opencode_source_lineage_boundary, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - pldg-20260624-001-provider-updates:atom-0051
  - pldg-20260624-001-provider-updates:atom-0091
  - pldg-20260624-001-provider-updates:atom-0136
  - pldg-20260624-001-provider-updates:atom-0140
source_atom_ids: [atom-0051, atom-0072, atom-0076, atom-0077, atom-0091, atom-0092, atom-0093, atom-0104, atom-0136, atom-0139, atom-0140]
preserved_exact_tokens: ["OpenCode", "Models.dev", "opencode-cursor", "opencode-gpt-imagegen", "753d312c28519b0c060a56e69e8cde971b3719bb", "OpenCode Go", "source-lineage", "not closure evidence", "alibaba-coding-plan", "minimax-coding-plan", "zai-coding-plan", "zhipuai-coding-plan"]
negative_constraints:
  - Do not use OpenCode server or OpenCode-routed providers as direct-provider closure evidence.
  - Do not require `opencode-cursor` when PM has native Cursor support.
  - Do not import unofficial plugin backend/auth behavior as canonical PM backend support.
owner_hints: [Plans/Provider_OpenCode.md, Plans/Models_System.md, Plans/Contracts_V0.md, Plans/Media_Generation_and_Capabilities.md]
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

ContractRef: ContractName:Plans/CLI_Bridged_Providers.md, ContractName:Plans/Models_System.md, ContractName:Plans/Contracts_V0.md

### 7.3 Fallback Models

If dynamic model discovery fails (server unreachable), Puppet Master MUST NOT hardcode fallback models for OpenCode. Instead, surface an error: "Cannot discover models — OpenCode server unreachable."

ContractRef: ContractName:Plans/DRY_Rules.md#2-dont-duplicate-canonical-contracts, PolicyRule:Decision_Policy.md§4

**Rationale:** Unlike CLI-bridged providers where Puppet Master knows the platform's model catalog, OpenCode's available models depend entirely on the user's OpenCode configuration and authenticated providers. Hardcoding would be incorrect.

---

## 8. Capability flags

Capability flags are owned by the shared provider/model contracts, not by legacy `platform_specs.rs`. This plan does not redefine the provider catalog; it only constrains OpenCode server transport and OpenCode-specific normalization.

OpenCode-specific capability requirements (normative):
- Transport remains `http` (server-bridged).
- **Plan mode:** When `mode=plan`, Puppet Master MUST use the OpenCode `plan` agent (read-only). When `mode=execute`, use the `build` agent.
- **Provider-tool capability reporting:** OpenCode-discovered tools (from `GET /provider` and session tool lists) MUST be reported through `capabilities.get` with `category: "provider_tool"`. Each tool entry includes the same `enabled` / `disabled_reason` / `setup_hint` shape defined in `Plans/Media_Generation_and_Capabilities.md` [§1.2](Plans/Media_Generation_and_Capabilities.md#CAPABILITY-SYSTEM). This enables agents and users to discover all available OpenCode tools via capability introspection.
- **Provider capability aliases:** OpenCode-native declarations such as `supportsParallelTools`, `supportsAssistantMessagePrefill`, and `maxPayloadSize` normalize into the shared provider capability fields before PM routing, request shaping, or model-effort UI decisions consume them.
- **Media tools are NOT OpenCode-provided:** Media generation (`media.image`, `media.video`, `media.tts`, `media.music`) remains a Puppet Master internal capability backed by route-specific provider/model generated-media routes such as OpenAI/Codex, OpenAI API-key image routes, MiniMax Image-01, Gemini Direct where verified, or future verified routes. OpenCode MUST NOT expose or proxy media-generation tools. The media capability picker dropdown does not include OpenCode tools; see `Plans/Media_Generation_and_Capabilities.md` [§4](Plans/Media_Generation_and_Capabilities.md#CAPABILITY-PICKER).

ContractRef: ContractName:Plans/CLI_Bridged_Providers.md, ContractName:Plans/Models_System.md, ContractName:Plans/Contracts_V0.md, PolicyRule:Decision_Policy.md§4, ToolID:capabilities.get, ContractName:Plans/Media_Generation_and_Capabilities.md#CAPABILITY-SYSTEM

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

## 11. Legacy platform_specs lineage and current metadata ownership

Legacy OpenCode references to `puppet-master-rs/src/platforms/platform_specs.rs` are preserved only as source-lineage from the removed Rust/Iced implementation. Active OpenCode metadata ownership lives in the provider/model contracts and OpenCode server profile setup metadata.

Minimum active OpenCode constraints:
- Transport: `http` (server-bridged)
- Default server port: `4096`
- CLI path is **optional** and used only for launcher/discovery fallback (not as runtime transport)
- No hardcoded fallback models (dynamic discovery only)

ContractRef: ContractName:Plans/DRY_Rules.md#2-dont-duplicate-canonical-contracts, ContractName:Plans/Models_System.md, ContractName:Plans/Contracts_V0.md

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
- `puppet-master-rs/src/platforms/platform_specs.rs` (retired/source-lineage only; not active provider capability SSOT)
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

## Owner / Consumer Map

This source-preserving standardization keeps the owner and consumer boundaries stated in the original document body. During this batch, `Plans/Provider_OpenCode.md` remains the owner doc for the behavior described by its preserved sections, while cross-doc ownership follows the ContractRefs and boundary notes already present in the original text.

ContractRef: ContractName:Plans/Plan_Document_System.md, ContractName:Plans/Bootstrap_Planning_Migration.md

## PlanUnits

### PO-002 - Server-Bridged Transport Authority

```yaml
plan_unit_id: PO-002
unit_type: constraint
status: accepted
owner_doc: Plans/Provider_OpenCode.md
canonical_text: >-
  OpenCode is server-bridged only: Puppet Master communicates through HTTP REST plus SSE via the unified Provider facade and must not run OpenCode as a CLI-bridged runtime transport.
gui_related: false
gui_classification_reason: This unit defines provider transport authority rather than visual presentation.
split_recommended: false
depends_on:
  - "CV-090"
  - "CBP-003"
unblocks: []
acceptance_criteria:
  - "Server-Bridged Transport Authority remains addressable as a fine-grained Provider OpenCode PlanUnit."
  - "ContractRefs, anchors, exact tokens, negative constraints, compatibility-only notes, stale/retired dispositions, owner/consumer boundaries, and source lineage from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: opencode_provider_drift
reasoning_tier: standard
context_scope: provider_opencode
implementation_surfaces:
  - "Plans/Provider_OpenCode.md"
node_compile_hint:
  mode: opencode_server_bridge_transport
  create_worknodes: false
source_lineage:
  - "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Provider_OpenCode-S0003"
  - "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Provider_OpenCode-S0004"
preserved_exact_tokens:
  - "OpenCode"
  - "server-bridged only"
  - "HTTP REST + SSE"
  - "unified Provider facade"
  - "MUST NOT run OpenCode as a CLI-bridged runtime transport"
  - "ProviderTransport = ServerBridge"
  - "transport = \"http\""
  - "server_credentials"
  - "/provider/auth"
negative_constraints:
  - "OpenCode runtime transport is not optional when OpenCode is enabled; PM must not use OpenCode as a CLI-bridged runtime transport."
preserved_contractrefs:
  - "ContractRef: ContractName:Plans/Contracts_V0.md#21-provider-transport-taxonomy, ContractName:Plans/CLI_Bridged_Providers.md"
owner_hints:
  - "Plans/Provider_OpenCode.md"
  - "Plans/Contracts_V0.md"
  - "Plans/CLI_Bridged_Providers.md"
```

### PO-003 - PM Native Terminology Boundary

```yaml
plan_unit_id: PO-003
unit_type: constraint
status: accepted
owner_doc: Plans/Provider_OpenCode.md
canonical_text: >-
  PM keeps PM-native terminology for tools, runtime identity, and provider routing; OpenCode terms may be referenced for alignment or external context but cannot replace PM canonical owner vocabulary or provider-capability ownership.
gui_related: false
gui_classification_reason: This unit defines terminology and ownership boundaries rather than visual presentation.
split_recommended: false
depends_on:
  - "PO-002"
unblocks: []
acceptance_criteria:
  - "PM Native Terminology Boundary remains addressable as a fine-grained Provider OpenCode PlanUnit."
  - "ContractRefs, anchors, exact tokens, negative constraints, compatibility-only notes, stale/retired dispositions, owner/consumer boundaries, and source lineage from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: opencode_provider_drift
reasoning_tier: standard
context_scope: provider_opencode
implementation_surfaces:
  - "Plans/Provider_OpenCode.md"
node_compile_hint:
  mode: opencode_terminology_boundary
  create_worknodes: false
source_lineage:
  - "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Provider_OpenCode-S0006"
preserved_exact_tokens:
  - "websearch"
  - "webfetch"
  - "requested_persona"
  - "effective_persona"
  - "/web-tool"
  - "native for all"
negative_constraints:
  - "OpenCode consumer text must not flatten provider capability differentiation to native for all or replace PM-native ownership boundaries."
preserved_contractrefs:
  - "ContractRef: ContractName:Plans/Tools.md, ContractName:Plans/Contracts_V0.md"
owner_hints:
  - "Plans/Provider_OpenCode.md"
  - "Plans/Tools.md"
  - "Plans/Contracts_V0.md"
```

### PO-004 - Runtime Identity Recovery And Approval Scope Key

```yaml
plan_unit_id: PO-004
unit_type: requirement
status: accepted
owner_doc: Plans/Provider_OpenCode.md
canonical_text: >-
  OpenCode runtime identity recovery keeps OpenCode session IDs in provider-native correlation fields, preserves canonical thread_id, defines approval_scope_key across actor/lane/run/account or server-profile context, and carries runtime identity through shared attempt, blocked-state, usage, and handoff records.
gui_related: false
gui_classification_reason: This unit defines runtime identity and approval-scope data shape rather than visual presentation.
split_recommended: true
depends_on:
  - "PO-002"
  - "CBP-005"
unblocks: []
acceptance_criteria:
  - "Runtime Identity Recovery And Approval Scope Key remains addressable as a fine-grained Provider OpenCode PlanUnit."
  - "ContractRefs, anchors, exact tokens, negative constraints, compatibility-only notes, stale/retired dispositions, owner/consumer boundaries, and source lineage from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: opencode_identity_recovery_gap
reasoning_tier: standard
context_scope: provider_opencode_identity_recovery
implementation_surfaces:
  - "Plans/Provider_OpenCode.md"
node_compile_hint:
  mode: opencode_identity_recovery
  create_worknodes: false
source_lineage:
  - "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Provider_OpenCode-S0008"
  - "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Provider_OpenCode-S0009"
  - "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Provider_OpenCode-S0010"
  - "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Provider_OpenCode-S0011"
preserved_exact_tokens:
  - "approval_scope_key"
  - "actor"
  - "lane/package/run"
  - "account/server-profile context"
  - "thread_id"
  - "run_id"
  - "message_id"
  - "event_id"
  - "attempt_id"
  - "blocked_reason_code"
  - "allowed_action_ids[]"
  - "safe_point_id"
  - "replan_generation"
  - "OpenCode thread_id collision"
  - "provider-native correlation"
negative_constraints:
  - "OpenCode session IDs must live in provider-native correlation fields and never replace canonical thread_id."
preserved_contractrefs: []
compatibility_only_notes:
  - "Compatibility-era fields such as resume_url? remain drift evidence rather than canonical OpenCode runtime identity."
owner_hints:
  - "Plans/Provider_OpenCode.md"
  - "Plans/Contracts_V0.md"
  - "Plans/Prompt_Pipeline.md"
  - "Plans/storage-plan.md"
```

### PO-005 - OpenCode Server Model And Runtime Boundary

```yaml
plan_unit_id: PO-005
unit_type: requirement
status: accepted
owner_doc: Plans/Provider_OpenCode.md
canonical_text: >-
  Puppet Master connects to OpenCode as a client of its local OpenAPI 3.1 HTTP API and SSE stream, treats OpenCode as provider-agnostic upstream configuration, and keeps CLI path input as launcher/discovery fallback rather than runtime transport.
gui_related: false
gui_classification_reason: This unit defines server architecture and runtime boundary rather than visual presentation.
split_recommended: false
depends_on:
  - "PO-002"
unblocks: []
acceptance_criteria:
  - "OpenCode Server Model And Runtime Boundary remains addressable as a fine-grained Provider OpenCode PlanUnit."
  - "ContractRefs, anchors, exact tokens, negative constraints, compatibility-only notes, stale/retired dispositions, owner/consumer boundaries, and source lineage from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: opencode_provider_drift
reasoning_tier: standard
context_scope: provider_opencode
implementation_surfaces:
  - "Plans/Provider_OpenCode.md"
node_compile_hint:
  mode: opencode_server_model
  create_worknodes: false
source_lineage:
  - "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Provider_OpenCode-S0012"
  - "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Provider_OpenCode-S0013"
  - "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Provider_OpenCode-S0014"
  - "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Provider_OpenCode-S0015"
preserved_exact_tokens:
  - "opencode serve"
  - "OpenAPI 3.1"
  - "http://127.0.0.1:4096"
  - "/doc"
  - "REST endpoints"
  - "SSE event stream"
  - "Puppet Master connects to OpenCode as a client"
  - "launcher/discovery fallback only"
  - "run transport remains HTTP/SSE"
negative_constraints:
  - "Puppet Master does not use SDK launch flows or CLI run transport for OpenCode runtime calls."
preserved_contractrefs: []
owner_hints:
  - "Plans/Provider_OpenCode.md"
```

### PO-006 - Server Profile Connection Contract

```yaml
plan_unit_id: PO-006
unit_type: requirement
status: accepted
owner_doc: Plans/Provider_OpenCode.md
canonical_text: >-
  OpenCode connection is profile-driven with Managed Server and Attach to Existing Server modes, one-or-many connection_profile_id runtime surfaces, per-profile sidecar state, frozen profile selection before execution, and distinct PM ownership rules for launch versus attached endpoints.
gui_related: false
gui_classification_reason: This unit defines server profile connection data and ownership rather than visual presentation.
split_recommended: false
depends_on:
  - "PO-005"
unblocks: []
acceptance_criteria:
  - "Server Profile Connection Contract remains addressable as a fine-grained Provider OpenCode PlanUnit."
  - "ContractRefs, anchors, exact tokens, negative constraints, compatibility-only notes, stale/retired dispositions, owner/consumer boundaries, and source lineage from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: opencode_provider_drift
reasoning_tier: standard
context_scope: provider_opencode
implementation_surfaces:
  - "Plans/Provider_OpenCode.md"
node_compile_hint:
  mode: opencode_server_profile_connection
  create_worknodes: false
source_lineage:
  - "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Provider_OpenCode-S0016"
  - "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Provider_OpenCode-S0017"
preserved_exact_tokens:
  - "Server Profile"
  - "Managed Server"
  - "Attach to Existing Server"
  - "connection_profile_id"
  - "/profiles/<connection_profile_id>/"
  - "pm/state.json"
  - "pm/logs/"
  - "pm/projections/"
  - "pm/backups/"
  - "OPENCODE_CONFIG_DIR"
  - "long-lived"
  - "last-mile"
  - "attached-server"
  - "External / Not Managed"
negative_constraints:
  - "All runtime calls remain HTTP/SSE server-bridge calls regardless of whether PM launched the process."
preserved_contractrefs:
  - "ContractRef: ContractName:Plans/Multi-Account.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/storage-plan.md"
  - "ContractRef: ContractName:Plans/CLI_Bridged_Providers.md, ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/FinalGUISpec.md"
owner_hints:
  - "Plans/Provider_OpenCode.md"
  - "Plans/Multi-Account.md"
  - "Plans/Contracts_V0.md"
  - "Plans/storage-plan.md"
  - "Plans/FinalGUISpec.md"
```

### PO-007 - Health Discovery State Machine

```yaml
plan_unit_id: PO-007
unit_type: requirement
status: accepted
owner_doc: Plans/Provider_OpenCode.md
canonical_text: >-
  OpenCode profile readiness evaluates connection or launch state, health check result, then discovery refresh result; profiles become Ready only after health and discovery succeed, degraded connected states preserve last-known provider/model/auth facts, and attached profiles may remain externally managed.
gui_related: false
gui_classification_reason: This unit defines backend health/discovery state semantics rather than visual presentation.
split_recommended: false
depends_on:
  - "PO-006"
  - "CV-125"
unblocks: []
acceptance_criteria:
  - "Health Discovery State Machine remains addressable as a fine-grained Provider OpenCode PlanUnit."
  - "ContractRefs, anchors, exact tokens, negative constraints, compatibility-only notes, stale/retired dispositions, owner/consumer boundaries, and source lineage from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: opencode_provider_drift
reasoning_tier: standard
context_scope: provider_opencode
implementation_surfaces:
  - "Plans/Provider_OpenCode.md"
node_compile_hint:
  mode: opencode_health_discovery_state
  create_worknodes: false
source_lineage:
  - "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Provider_OpenCode-S0018"
preserved_exact_tokens:
  - "Configured"
  - "Launching"
  - "Connecting"
  - "Connected"
  - "Discovering"
  - "Ready"
  - "Connected (stale discovery)"
  - "Connected (discovery failed)"
  - "Disconnected"
  - "Launch failed"
  - "ExternalNotManaged"
  - "Connected in OpenCode"
  - "stale-state"
negative_constraints: []
preserved_contractrefs:
  - "ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Multi-Account.md, ContractName:Plans/CLI_Bridged_Providers.md"
stale_retired_dispositions:
  - "Connected (stale discovery) and explicit stale-state labels preserve last-known provider/model/auth facts after failed refresh."
owner_hints:
  - "Plans/Provider_OpenCode.md"
```

### PO-008 - Health Status Projection

```yaml
plan_unit_id: PO-008
unit_type: requirement
status: accepted
owner_doc: Plans/Provider_OpenCode.md
canonical_text: >-
  GUI/status projections may label grouped provider/model/auth readiness as /models/auth or /discovery/auth and must keep explicit /stale labeling when cached discovery snapshots are reused after failed refresh.
gui_related: true
gui_classification_reason: This unit preserves GUI/status projection and stale-state labels for OpenCode profiles.
split_recommended: false
depends_on:
  - "PO-007"
unblocks: []
acceptance_criteria:
  - "Health Status Projection remains addressable as a fine-grained Provider OpenCode PlanUnit."
  - "ContractRefs, anchors, exact tokens, negative constraints, compatibility-only notes, stale/retired dispositions, owner/consumer boundaries, and source lineage from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: opencode_provider_drift
reasoning_tier: standard
context_scope: provider_opencode
implementation_surfaces:
  - "Plans/Provider_OpenCode.md"
node_compile_hint:
  mode: opencode_health_status_projection
  create_worknodes: false
source_lineage:
  - "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Provider_OpenCode-S0018"
preserved_exact_tokens:
  - "/models/auth"
  - "/discovery/auth"
  - "/stale"
  - "GUI/status projections"
  - "last-known provider/model/auth facts"
negative_constraints: []
preserved_contractrefs:
  - "ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/storage-plan.md, ContractName:Plans/usage-feature.md"
owner_hints:
  - "Plans/Provider_OpenCode.md"
  - "Plans/FinalGUISpec.md"
  - "Plans/storage-plan.md"
  - "Plans/usage-feature.md"
```

### PO-009 - Server Provider Auth Realm Mapping

```yaml
plan_unit_id: PO-009
unit_type: requirement
status: accepted
owner_doc: Plans/Provider_OpenCode.md
canonical_text: >-
  OpenCode has separate server-level auth and provider-level auth realms: PM sends configured server credentials to OpenCode endpoints and treats upstream provider auth as OpenCode-managed provider-native auth exposed by /provider/auth and callback endpoints.
gui_related: false
gui_classification_reason: This unit defines auth realm mapping rather than visual presentation.
split_recommended: false
depends_on:
  - "PO-006"
  - "CV-125"
unblocks: []
acceptance_criteria:
  - "Server Provider Auth Realm Mapping remains addressable as a fine-grained Provider OpenCode PlanUnit."
  - "ContractRefs, anchors, exact tokens, negative constraints, compatibility-only notes, stale/retired dispositions, owner/consumer boundaries, and source lineage from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: opencode_provider_drift
reasoning_tier: standard
context_scope: provider_opencode
implementation_surfaces:
  - "Plans/Provider_OpenCode.md"
node_compile_hint:
  mode: opencode_auth_realm_mapping
  create_worknodes: false
source_lineage:
  - "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Provider_OpenCode-S0019"
preserved_exact_tokens:
  - "Server-level auth"
  - "OPENCODE_SERVER_PASSWORD"
  - "username/password"
  - "Provider-level auth"
  - "/provider/auth"
  - "OAuth/callback endpoints"
negative_constraints: []
preserved_contractrefs: []
owner_hints:
  - "Plans/Provider_OpenCode.md"
  - "Plans/CLI_Bridged_Providers.md"
  - "Plans/Multi-Account.md"
```

### PO-010 - Sign-In Refresh And Version Diagnostics

```yaml
plan_unit_id: PO-010
unit_type: requirement
status: accepted
owner_doc: Plans/Provider_OpenCode.md
canonical_text: >-
  When a user chooses Sign in for an unconnected OpenCode provider, PM deep-links or opens OpenCode provider auth flows, refreshes provider/model discovery through GET /provider, records server version from health checks, and emits version_mismatch diagnostics when required while continuing best-effort operation.
gui_related: true
gui_classification_reason: This unit includes user-visible Sign in flow handling and diagnostics.
split_recommended: false
depends_on:
  - "PO-009"
unblocks: []
acceptance_criteria:
  - "Sign-In Refresh And Version Diagnostics remains addressable as a fine-grained Provider OpenCode PlanUnit."
  - "ContractRefs, anchors, exact tokens, negative constraints, compatibility-only notes, stale/retired dispositions, owner/consumer boundaries, and source lineage from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: opencode_provider_drift
reasoning_tier: standard
context_scope: provider_opencode
implementation_surfaces:
  - "Plans/Provider_OpenCode.md"
node_compile_hint:
  mode: opencode_signin_version_diagnostics
  create_worknodes: false
source_lineage:
  - "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Provider_OpenCode-S0019"
  - "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Provider_OpenCode-S0020"
preserved_exact_tokens:
  - "Sign in"
  - "GET /provider"
  - "OpenCode server version"
  - "diagnostic(category=\"version_mismatch\")"
  - "best-effort operation"
negative_constraints: []
preserved_contractrefs: []
owner_hints:
  - "Plans/Provider_OpenCode.md"
```

### PO-011 - Provider Envelope Identity Correlation

```yaml
plan_unit_id: PO-011
unit_type: requirement
status: accepted
owner_doc: Plans/Provider_OpenCode.md
canonical_text: >-
  OpenCode maps into the unified Provider facade while preserving PM lineage fields and expanded ProviderRequestEnvelope identity, including run/thread/parent/child lineage, attempt identity, execution role, requested/effective runtime descriptors, permission refs, working-directory/worktree identity, prompt parts, retry/approval context, normalized output/correlation IDs, and additive provider-native session IDs.
gui_related: false
gui_classification_reason: This unit defines provider envelope identity and correlation fields rather than visual presentation.
split_recommended: false
depends_on:
  - "PO-002"
  - "PO-004"
  - "CBP-005"
  - "CV-090"
unblocks: []
acceptance_criteria:
  - "Provider Envelope Identity Correlation remains addressable as a fine-grained Provider OpenCode PlanUnit."
  - "ContractRefs, anchors, exact tokens, negative constraints, compatibility-only notes, stale/retired dispositions, owner/consumer boundaries, and source lineage from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: opencode_provider_drift
reasoning_tier: standard
context_scope: provider_opencode
implementation_surfaces:
  - "Plans/Provider_OpenCode.md"
node_compile_hint:
  mode: opencode_envelope_identity_correlation
  create_worknodes: false
source_lineage:
  - "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Provider_OpenCode-S0021"
  - "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Provider_OpenCode-S0022"
preserved_exact_tokens:
  - "ProviderRequestEnvelope"
  - "thread_id"
  - "run_id"
  - "parent_run_id"
  - "child_run_id"
  - "attempt_id"
  - "execution role"
  - "requested/effective runtime/provider/model/account descriptors"
  - "permission/tool-policy snapshot refs"
  - "working-directory or worktree identity"
  - "provider-native session ids"
  - "setCacheKey"
negative_constraints:
  - "PM must not rewrite thread_id into an OpenCode session id."
  - "OpenCode provider-session identifiers remain provider-native correlation metadata; they never replace PM thread_id, run_id, parent_run_id, child_run_id, or attempt lineage."
preserved_contractrefs:
  - "ContractRef: ContractName:Plans/CLI_Bridged_Providers.md, ContractName:Plans/Architecture_Invariants.md#INV-009"
  - "ContractRef: ContractName:Plans/CLI_Bridged_Providers.md, ContractName:Plans/Tools.md, ContractName:Plans/storage-plan.md"
  - "ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/Models_System.md"
owner_hints:
  - "Plans/Provider_OpenCode.md"
  - "Plans/Contracts_V0.md"
  - "Plans/Prompt_Pipeline.md"
  - "Plans/Models_System.md"
  - "Plans/storage-plan.md"
```

### PO-012 - Discovered Upstream Provider Identity Facts

```yaml
plan_unit_id: PO-012
unit_type: requirement
status: accepted
owner_doc: Plans/Provider_OpenCode.md
canonical_text: >-
  OpenCode provider discovery records upstream provider entries as discovered OpenCode facts, keeps runtime platform opencode distinct from upstream provider/model namespaces, treats Alibaba-family, MiniMax, Z.AI, Codex, and Copilot observations as data, and does not invent provider entries absent discovery or owner contract evidence.
gui_related: false
gui_classification_reason: This unit defines provider discovery identity facts rather than visual presentation.
split_recommended: false
depends_on:
  - "PO-011"
unblocks: []
acceptance_criteria:
  - "Discovered Upstream Provider Identity Facts remains addressable as a fine-grained Provider OpenCode PlanUnit."
  - "ContractRefs, anchors, exact tokens, negative constraints, compatibility-only notes, stale/retired dispositions, owner/consumer boundaries, and source lineage from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: opencode_provider_drift
reasoning_tier: standard
context_scope: provider_opencode
implementation_surfaces:
  - "Plans/Provider_OpenCode.md"
node_compile_hint:
  mode: opencode_provider_discovery_identity
  create_worknodes: false
source_lineage:
  - "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Provider_OpenCode-S0022"
preserved_exact_tokens:
  - "opencode"
  - "anthropic/..."
  - "google/..."
  - "anthropic/claude-sonnet-*"
  - "/claude-sonnet-"
  - "alibaba"
  - "alibaba-cn"
  - "DASHSCOPE_API_KEY"
  - "MiniMax"
  - "Z.AI"
  - "https://docs.bigmodel.cn/cn/coding-plan/overview"
  - "OpenCode-native skill tool behavior"
negative_constraints:
  - "PM must not invent a separate alibaba-coding-plan OpenCode provider entry unless discovery or an owner contract later proves it exists."
preserved_contractrefs: []
owner_hints:
  - "Plans/Provider_OpenCode.md"
```

### PO-013 - Boot Refresh Discovery Status Surface

```yaml
plan_unit_id: PO-013
unit_type: requirement
status: accepted
owner_doc: Plans/Provider_OpenCode.md
canonical_text: >-
  On app boot-refresh, PM refreshes OpenCode provider/model discovery in the background, keeps last-known connected upstream models visible until refresh finishes, and reports progress or per-provider failure in the shell /status-bar without blocking runtime selection.
gui_related: true
gui_classification_reason: This unit defines visible status-bar progress and failure reporting.
split_recommended: false
depends_on:
  - "PO-012"
unblocks: []
acceptance_criteria:
  - "Boot Refresh Discovery Status Surface remains addressable as a fine-grained Provider OpenCode PlanUnit."
  - "ContractRefs, anchors, exact tokens, negative constraints, compatibility-only notes, stale/retired dispositions, owner/consumer boundaries, and source lineage from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: opencode_provider_drift
reasoning_tier: standard
context_scope: provider_opencode
implementation_surfaces:
  - "Plans/Provider_OpenCode.md"
node_compile_hint:
  mode: opencode_boot_refresh_status_surface
  create_worknodes: false
source_lineage:
  - "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Provider_OpenCode-S0022"
preserved_exact_tokens:
  - "boot-refresh"
  - "last-known connected upstream models"
  - "shell /status-bar"
  - "per-provider failure"
  - "runtime selection"
negative_constraints: []
preserved_contractrefs: []
owner_hints:
  - "Plans/Provider_OpenCode.md"
  - "Plans/FinalGUISpec.md"
```

### PO-014 - Provider Cache Metadata Boundary

```yaml
plan_unit_id: PO-014
unit_type: constraint
status: accepted
owner_doc: Plans/Provider_OpenCode.md
canonical_text: >-
  OpenCode cache/request metadata is adapter evidence, not PM storage canon: setCacheKey and options.setCacheKey remain session-scoped provider cache metadata, store=false does not imply durable PM storage, provider.ts request-shape behavior does not imply transcript deletion, and provider-specific cache markers remain provider evidence.
gui_related: false
gui_classification_reason: This unit defines cache/storage boundary constraints rather than visual presentation.
split_recommended: false
depends_on:
  - "PO-011"
unblocks: []
acceptance_criteria:
  - "Provider Cache Metadata Boundary remains addressable as a fine-grained Provider OpenCode PlanUnit."
  - "ContractRefs, anchors, exact tokens, negative constraints, compatibility-only notes, stale/retired dispositions, owner/consumer boundaries, and source lineage from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: opencode_provider_drift
reasoning_tier: standard
context_scope: provider_opencode
implementation_surfaces:
  - "Plans/Provider_OpenCode.md"
node_compile_hint:
  mode: opencode_cache_metadata_boundary
  create_worknodes: false
source_lineage:
  - "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Provider_OpenCode-S0022"
preserved_exact_tokens:
  - "setCacheKey"
  - "options.setCacheKey"
  - "session-scoped provider-side cache metadata"
  - "store = false"
  - "provider.ts"
  - "Azure"
  - "store=true"
  - "/content-level"
  - "#9803"
negative_constraints:
  - "PM must not infer durable PM storage from OpenCode store=false or provider request metadata."
preserved_contractrefs: []
owner_hints:
  - "Plans/Provider_OpenCode.md"
  - "Plans/storage-plan.md"
  - "Plans/Prompt_Pipeline.md"
  - "Plans/Contracts_V0.md"
```

### PO-015 - Session To Run Lifecycle Constraint

```yaml
plan_unit_id: PO-015
unit_type: constraint
status: accepted
owner_doc: Plans/Provider_OpenCode.md
canonical_text: >-
  OpenCode child sessions map to PM child runs without replacing them; provider task_id and parentID remain additive provider handles, adapter shorthands normalize into canonical task-tool launch paths, parent-mediated question/HITL handling stays PM-owned, and retry/reroute/resume/replacement semantics remain PM-owned.
gui_related: false
gui_classification_reason: This unit defines lifecycle ownership constraints rather than visual presentation.
split_recommended: false
depends_on:
  - "PO-011"
unblocks: []
acceptance_criteria:
  - "Session To Run Lifecycle Constraint remains addressable as a fine-grained Provider OpenCode PlanUnit."
  - "ContractRefs, anchors, exact tokens, negative constraints, compatibility-only notes, stale/retired dispositions, owner/consumer boundaries, and source lineage from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: opencode_provider_drift
reasoning_tier: standard
context_scope: provider_opencode
implementation_surfaces:
  - "Plans/Provider_OpenCode.md"
node_compile_hint:
  mode: opencode_session_to_run_lifecycle
  create_worknodes: false
source_lineage:
  - "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Provider_OpenCode-S0023"
preserved_exact_tokens:
  - "task_id"
  - "parentID"
  - "@agent-name"
  - "agent-name"
  - "parent-mediated question/HITL handling"
  - "/message-board"
  - "retry, reroute, resume, and replacement semantics"
  - "completed disposable children"
negative_constraints:
  - "OpenCode child-session behavior is not evidence for native peer-to-peer subagent messaging or PM message-board behavior."
  - "Completed disposable children are not durable reusable actors merely because OpenCode can reopen session history."
preserved_contractrefs:
  - "ContractRef: ContractName:Plans/Tools.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Contracts_V0.md"
  - "ContractRef: ContractName:Plans/assistant-memory-subsystem.md, ContractName:Plans/orchestrator-subagent-integration.md, ContractName:Plans/assistant-chat-design.md"
owner_hints:
  - "Plans/Provider_OpenCode.md"
```

### PO-016 - Normalized Event SSE Stream Mapping

```yaml
plan_unit_id: PO-016
unit_type: requirement
status: accepted
owner_doc: Plans/Provider_OpenCode.md
canonical_text: >-
  OpenCode response parts and SSE bus events map into PM normalized provider events for text_delta, thinking_delta, tool_use, tool_result, usage, error, and done, with PM subscribing to GET /event after prompt_async and emitting done when the session reaches completed or failed.
gui_related: false
gui_classification_reason: This unit defines event normalization rather than visual presentation.
split_recommended: false
depends_on:
  - "PO-011"
  - "CBP-003"
  - "CV-090"
unblocks: []
acceptance_criteria:
  - "Normalized Event SSE Stream Mapping remains addressable as a fine-grained Provider OpenCode PlanUnit."
  - "ContractRefs, anchors, exact tokens, negative constraints, compatibility-only notes, stale/retired dispositions, owner/consumer boundaries, and source lineage from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: opencode_provider_drift
reasoning_tier: standard
context_scope: provider_opencode
implementation_surfaces:
  - "Plans/Provider_OpenCode.md"
node_compile_hint:
  mode: opencode_sse_event_mapping
  create_worknodes: false
source_lineage:
  - "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Provider_OpenCode-S0024"
preserved_exact_tokens:
  - "text_delta"
  - "thinking_delta"
  - "tool_use"
  - "tool_result"
  - "usage"
  - "input_tokens"
  - "output_tokens"
  - "error"
  - "done"
  - "success"
  - "failed"
  - "GET /event"
  - "prompt_async"
negative_constraints: []
preserved_contractrefs:
  - "ContractRef: ContractName:Plans/CLI_Bridged_Providers.md, ContractName:Plans/Architecture_Invariants.md#INV-009"
owner_hints:
  - "Plans/Provider_OpenCode.md"
```

### PO-017 - Auth State Failover Mapping

```yaml
plan_unit_id: PO-017
unit_type: requirement
status: accepted
owner_doc: Plans/Provider_OpenCode.md
canonical_text: >-
  OpenCode emits canonical auth_state events from server and provider auth realms, maps health and provider auth failures to LoggedOut, LoggedIn, AuthFailed, or AuthExpired as appropriate, and uses PM failover reason codes without expanding the auth state enum.
gui_related: false
gui_classification_reason: This unit defines auth state and failover mappings rather than visual presentation.
split_recommended: false
depends_on:
  - "PO-009"
  - "CV-125"
unblocks: []
acceptance_criteria:
  - "Auth State Failover Mapping remains addressable as a fine-grained Provider OpenCode PlanUnit."
  - "ContractRefs, anchors, exact tokens, negative constraints, compatibility-only notes, stale/retired dispositions, owner/consumer boundaries, and source lineage from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: opencode_provider_drift
reasoning_tier: standard
context_scope: provider_opencode
implementation_surfaces:
  - "Plans/Provider_OpenCode.md"
node_compile_hint:
  mode: opencode_auth_state_failover_mapping
  create_worknodes: false
source_lineage:
  - "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Provider_OpenCode-S0025"
preserved_exact_tokens:
  - "auth_state"
  - "LoggedOut"
  - "LoggedIn"
  - "AuthFailed"
  - "AuthExpired"
  - "GET /global/health"
  - "ProviderAuthError"
  - "rate_limited"
  - "provider_outage_or_network"
  - "hard_exhaustion_failover"
  - "rate_limit_failover"
  - "auth_failure_failover"
  - "provider_outage_failover"
  - "transport_failure_failover"
negative_constraints:
  - "Upstream rate-limit/outage errors must not expand the auth state enum."
preserved_contractrefs:
  - "ContractRef: ContractName:Plans/CLI_Bridged_Providers.md, ContractName:Plans/Contracts_V0.md#AuthState"
owner_hints:
  - "Plans/Provider_OpenCode.md"
```

### PO-018 - Adapter Policy And Copilot Constraints

```yaml
plan_unit_id: PO-018
unit_type: constraint
status: accepted
owner_doc: Plans/Provider_OpenCode.md
canonical_text: >-
  OpenCode-specific adapter behavior preserves PM requested/effective runtime and capability disclosure, keeps provider-native agent files and invocation syntax in the interoperability lane, supports additive provider correlation, preserves prompt-cache separation, avoids fake-user replay continuity, and keeps Copilot-sensitive billing/classification metadata from weakening PM strict-deny policy.
gui_related: false
gui_classification_reason: This unit defines adapter policy and routing constraints rather than visual presentation.
split_recommended: false
depends_on:
  - "PO-011"
  - "PO-014"
unblocks: []
acceptance_criteria:
  - "Adapter Policy And Copilot Constraints remains addressable as a fine-grained Provider OpenCode PlanUnit."
  - "ContractRefs, anchors, exact tokens, negative constraints, compatibility-only notes, stale/retired dispositions, owner/consumer boundaries, and source lineage from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: opencode_provider_drift
reasoning_tier: standard
context_scope: provider_opencode
implementation_surfaces:
  - "Plans/Provider_OpenCode.md"
node_compile_hint:
  mode: opencode_adapter_policy_constraints
  create_worknodes: false
source_lineage:
  - "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Provider_OpenCode-S0026"
preserved_exact_tokens:
  - "provider-native agent files"
  - "provider-native invocation syntax"
  - "interoperability lane"
  - "prompt-cache-friendly separation"
  - "OpenCode PR #14203"
  - "x-initiator"
  - "Copilot-sensitive requests"
  - "strict-deny rule"
  - "Copilot-compatible"
negative_constraints:
  - "Adapter-specific billing or caching evidence from OpenCode does not satisfy the Copilot TOS constraint."
  - "OpenCode-specific behavior must preserve PM policy constraints rather than silently overriding them."
preserved_contractrefs:
  - "ContractRef: ContractName:Plans/Models_System.md, ContractName:Plans/Permissions_System.md, ContractName:Plans/CLI_Bridged_Providers.md"
  - "ContractRef: ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/Tools.md, ContractName:Plans/Contracts_V0.md"
owner_hints:
  - "Plans/Provider_OpenCode.md"
```

### PO-019 - Dynamic Model Discovery Source

```yaml
plan_unit_id: PO-019
unit_type: requirement
status: accepted
owner_doc: Plans/Provider_OpenCode.md
canonical_text: >-
  Puppet Master discovers OpenCode models through GET /provider, including all/default/connected provider data, and preserves OpenCode compound model IDs in providerID/modelID format as the source for dynamic model discovery.
gui_related: false
gui_classification_reason: This unit defines model discovery source data rather than visual presentation.
split_recommended: false
depends_on:
  - "PO-006"
unblocks: []
acceptance_criteria:
  - "Dynamic Model Discovery Source remains addressable as a fine-grained Provider OpenCode PlanUnit."
  - "ContractRefs, anchors, exact tokens, negative constraints, compatibility-only notes, stale/retired dispositions, owner/consumer boundaries, and source lineage from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: opencode_provider_drift
reasoning_tier: standard
context_scope: provider_opencode
implementation_surfaces:
  - "Plans/Provider_OpenCode.md"
node_compile_hint:
  mode: opencode_dynamic_model_discovery
  create_worknodes: false
source_lineage:
  - "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Provider_OpenCode-S0027"
  - "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Provider_OpenCode-S0028"
preserved_exact_tokens:
  - "GET /provider"
  - "all"
  - "default"
  - "connected"
  - "anthropic"
  - "openai"
  - "providerID/modelID"
  - "anthropic/claude-sonnet-4-5-20250514"
negative_constraints: []
preserved_contractrefs: []
owner_hints:
  - "Plans/Provider_OpenCode.md"
```

### PO-020 - OpenCode Model Picker Behavior

```yaml
plan_unit_id: PO-020
unit_type: requirement
status: accepted
owner_doc: Plans/Provider_OpenCode.md
canonical_text: >-
  The OpenCode model picker fetches models on provider enable and refresh, displays only models from connected providers, groups by OpenCode provider, caches with a configurable five-minute default TTL, and uses the shared Provider-contract model selection UI without OpenCode-specific picker logic beyond the discovered source.
gui_related: true
gui_classification_reason: This unit defines GUI model picker behavior.
split_recommended: false
depends_on:
  - "PO-019"
unblocks: []
acceptance_criteria:
  - "OpenCode Model Picker Behavior remains addressable as a fine-grained Provider OpenCode PlanUnit."
  - "ContractRefs, anchors, exact tokens, negative constraints, compatibility-only notes, stale/retired dispositions, owner/consumer boundaries, and source lineage from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: opencode_provider_drift
reasoning_tier: standard
context_scope: provider_opencode
implementation_surfaces:
  - "Plans/Provider_OpenCode.md"
node_compile_hint:
  mode: opencode_model_picker
  create_worknodes: false
source_lineage:
  - "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Provider_OpenCode-S0029"
preserved_exact_tokens:
  - "model picker"
  - "GET /provider"
  - "connected"
  - "Group models by OpenCode provider"
  - "default: 5 minutes"
  - "Provider-contract model selection UI surface"
negative_constraints: []
preserved_contractrefs:
  - "ContractRef: ContractName:Plans/CLI_Bridged_Providers.md, CodePath:puppet-master-rs/src/platforms/platform_specs.rs"
owner_hints:
  - "Plans/Provider_OpenCode.md"
```

### PO-021 - ACP Effort Capability Gate

```yaml
plan_unit_id: PO-021
unit_type: requirement
status: accepted
owner_doc: Plans/Provider_OpenCode.md
canonical_text: >-
  ACP model listings may supply IDs, names, and descriptions, but PM must obtain or infer effort capability from the shared provider capability matrix before presenting effort controls as supported.
gui_related: true
gui_classification_reason: This unit governs visible effort-control eligibility.
split_recommended: false
depends_on:
  - "PO-020"
unblocks: []
acceptance_criteria:
  - "ACP Effort Capability Gate remains addressable as a fine-grained Provider OpenCode PlanUnit."
  - "ContractRefs, anchors, exact tokens, negative constraints, compatibility-only notes, stale/retired dispositions, owner/consumer boundaries, and source lineage from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: opencode_provider_drift
reasoning_tier: standard
context_scope: provider_opencode
implementation_surfaces:
  - "Plans/Provider_OpenCode.md"
node_compile_hint:
  mode: opencode_effort_capability_gate
  create_worknodes: false
source_lineage:
  - "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Provider_OpenCode-S0029"
preserved_exact_tokens:
  - "ACP model listing"
  - "IDs/names/descriptions"
  - "effort-capability"
  - "shared provider capability matrix"
  - "effort controls"
negative_constraints: []
preserved_contractrefs: []
owner_hints:
  - "Plans/Provider_OpenCode.md"
```

### PO-022 - ACP Usage Update Mapping

```yaml
plan_unit_id: PO-022
unit_type: requirement
status: accepted
owner_doc: Plans/Provider_OpenCode.md
canonical_text: >-
  When ACP agent streams emit usage_update, PM maps it into the shared provider usage event shape with input/output/reasoning/cache token breakdown plus cost while preserving ACP as the source protocol rather than an OpenCode-only GUI counter.
gui_related: false
gui_classification_reason: This unit defines usage event normalization rather than visual presentation.
split_recommended: false
depends_on:
  - "PO-020"
unblocks: []
acceptance_criteria:
  - "ACP Usage Update Mapping remains addressable as a fine-grained Provider OpenCode PlanUnit."
  - "ContractRefs, anchors, exact tokens, negative constraints, compatibility-only notes, stale/retired dispositions, owner/consumer boundaries, and source lineage from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: opencode_provider_drift
reasoning_tier: standard
context_scope: provider_opencode
implementation_surfaces:
  - "Plans/Provider_OpenCode.md"
node_compile_hint:
  mode: opencode_acp_usage_mapping
  create_worknodes: false
source_lineage:
  - "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Provider_OpenCode-S0029"
preserved_exact_tokens:
  - "usage_update"
  - "input/output/reasoning/cache"
  - "cost"
  - "shared provider usage event shape"
  - "OpenCode-only GUI counter"
negative_constraints: []
preserved_contractrefs: []
owner_hints:
  - "Plans/Provider_OpenCode.md"
  - "Plans/usage-feature.md"
  - "Plans/storage-plan.md"
  - "Plans/Contracts_V0.md"
```

### PO-023 - No Hardcoded Fallback Models

```yaml
plan_unit_id: PO-023
unit_type: constraint
status: accepted
owner_doc: Plans/Provider_OpenCode.md
canonical_text: >-
  If dynamic OpenCode model discovery fails because the server is unreachable, PM must not hardcode fallback OpenCode models and instead surfaces the configured discovery error because available models depend entirely on user OpenCode configuration and authenticated providers.
gui_related: false
gui_classification_reason: This unit defines discovery failure behavior rather than visual presentation.
split_recommended: false
depends_on:
  - "PO-019"
unblocks: []
acceptance_criteria:
  - "No Hardcoded Fallback Models remains addressable as a fine-grained Provider OpenCode PlanUnit."
  - "ContractRefs, anchors, exact tokens, negative constraints, compatibility-only notes, stale/retired dispositions, owner/consumer boundaries, and source lineage from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: opencode_provider_drift
reasoning_tier: standard
context_scope: provider_opencode
implementation_surfaces:
  - "Plans/Provider_OpenCode.md"
node_compile_hint:
  mode: opencode_no_fallback_models
  create_worknodes: false
source_lineage:
  - "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Provider_OpenCode-S0030"
preserved_exact_tokens:
  - "Cannot discover models — OpenCode server unreachable."
  - "DRY_Rules.md#2-dont-duplicate-canonical-contracts"
  - "Decision_Policy.md§4"
negative_constraints:
  - "Puppet Master MUST NOT hardcode fallback models for OpenCode."
preserved_contractrefs:
  - "ContractRef: ContractName:Plans/DRY_Rules.md#2-dont-duplicate-canonical-contracts, PolicyRule:Decision_Policy.md§4"
owner_hints:
  - "Plans/Provider_OpenCode.md"
```

### PO-024 - Capability SSOT And Mode Agent Mapping

```yaml
plan_unit_id: PO-024
unit_type: requirement
status: accepted
owner_doc: Plans/Provider_OpenCode.md
canonical_text: >-
  OpenCode capability flags are consumed from shared provider/model contracts rather than legacy platform_specs; transport remains HTTP server-bridged, plan mode uses the read-only OpenCode plan agent, execute mode uses the build agent, and OpenCode-native capability aliases normalize into shared provider capability fields before routing or model-effort UI consumption.
gui_related: false
gui_classification_reason: This unit defines capability metadata and mode-agent mapping rather than visual presentation.
split_recommended: false
depends_on:
  - "PO-002"
unblocks: []
acceptance_criteria:
  - "Capability SSOT And Mode Agent Mapping remains addressable as a fine-grained Provider OpenCode PlanUnit."
  - "ContractRefs, anchors, exact tokens, negative constraints, compatibility-only notes, stale/retired dispositions, owner/consumer boundaries, and source lineage from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: opencode_provider_drift
reasoning_tier: standard
context_scope: provider_opencode
implementation_surfaces:
  - "Plans/Provider_OpenCode.md"
node_compile_hint:
  mode: opencode_capability_mode_mapping
  create_worknodes: false
source_lineage:
  - "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Provider_OpenCode-S0031"
preserved_exact_tokens:
  - "platform_specs.rs"
  - "transport remains http"
  - "mode=plan"
  - "plan agent"
  - "mode=execute"
  - "build agent"
  - "supportsParallelTools"
  - "supportsAssistantMessagePrefill"
  - "maxPayloadSize"
negative_constraints:
  - "Do not treat legacy platform_specs.rs as the active provider capability SSOT."
compatibility_only_notes:
  - "platform_specs.rs is preserved only as source-lineage from the removed Rust/Iced implementation."
preserved_contractrefs:
  - "ContractRef: ContractName:Plans/CLI_Bridged_Providers.md, CodePath:puppet-master-rs/src/platforms/platform_specs.rs, PolicyRule:Decision_Policy.md§4, ToolID:capabilities.get, ContractName:Plans/Media_Generation_and_Capabilities.md#CAPABILITY-SYSTEM"
owner_hints:
  - "Plans/Provider_OpenCode.md"
```

### PO-025 - Provider Tool Capability Reporting

```yaml
plan_unit_id: PO-025
unit_type: requirement
status: accepted
owner_doc: Plans/Provider_OpenCode.md
canonical_text: >-
  OpenCode-discovered tools from GET /provider and session tool lists report through capabilities.get with category provider_tool and the shared enabled/disabled_reason/setup_hint shape so agents and users can inspect OpenCode tools through capability introspection.
gui_related: false
gui_classification_reason: This unit defines provider-tool capability reporting rather than visual presentation.
split_recommended: false
depends_on:
  - "PO-024"
  - "MGAC-004"
  - "MGAC-005"
  - "MGAC-011"
  - "MGAC-084"
unblocks: []
acceptance_criteria:
  - "Provider Tool Capability Reporting remains addressable as a fine-grained Provider OpenCode PlanUnit."
  - "ContractRefs, anchors, exact tokens, negative constraints, compatibility-only notes, stale/retired dispositions, owner/consumer boundaries, and source lineage from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: opencode_provider_drift
reasoning_tier: standard
context_scope: provider_opencode
implementation_surfaces:
  - "Plans/Provider_OpenCode.md"
node_compile_hint:
  mode: opencode_provider_tool_capabilities
  create_worknodes: false
source_lineage:
  - "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Provider_OpenCode-S0031"
preserved_exact_tokens:
  - "GET /provider"
  - "session tool lists"
  - "capabilities.get"
  - "category: \"provider_tool\""
  - "enabled"
  - "disabled_reason"
  - "setup_hint"
  - "capability introspection"
negative_constraints: []
preserved_contractrefs: []
owner_hints:
  - "Plans/Provider_OpenCode.md"
```

### PO-026 - Media Capability Boundary And Picker Exclusion

```yaml
plan_unit_id: PO-026
unit_type: constraint
status: accepted
owner_doc: Plans/Provider_OpenCode.md
canonical_text: >-
  Media generation tools remain Puppet Master internal capabilities backed by route-specific provider/model generated-media routes, not by OpenCode. OpenCode must not expose or proxy media-generation tools, and the media capability picker dropdown excludes OpenCode tools.
gui_related: true
gui_classification_reason: This unit includes media capability picker behavior and visible tool exclusion.
split_recommended: false
depends_on:
  - "PO-024"
  - "MGAC-004"
unblocks: []
acceptance_criteria:
  - "Media Capability Boundary And Picker Exclusion remains addressable as a fine-grained Provider OpenCode PlanUnit."
  - "ContractRefs, anchors, exact tokens, negative constraints, compatibility-only notes, stale/retired dispositions, owner/consumer boundaries, and source lineage from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: opencode_provider_drift
reasoning_tier: standard
context_scope: provider_opencode
implementation_surfaces:
  - "Plans/Provider_OpenCode.md"
node_compile_hint:
  mode: opencode_media_boundary
  create_worknodes: false
source_lineage:
  - "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Provider_OpenCode-S0031"
preserved_exact_tokens:
  - "media.image"
  - "media.video"
  - "media.tts"
  - "media.music"
  - "Gemini API key"
  - "Cursor-native"
  - "OpenCode MUST NOT expose or proxy media-generation tools"
  - "media capability picker dropdown"
negative_constraints:
  - "OpenCode MUST NOT expose or proxy media-generation tools."
preserved_contractrefs: []
owner_hints:
  - "Plans/Provider_OpenCode.md"
  - "Plans/Media_Generation_and_Capabilities.md"
  - "Plans/FinalGUISpec.md"
```

### PO-027 - Failure Taxonomy Detection And Event Mapping

```yaml
plan_unit_id: PO-027
unit_type: requirement
status: accepted
owner_doc: Plans/Provider_OpenCode.md
canonical_text: >-
  OpenCode failure detection maps install, server reachability, server-auth, upstream provider-auth, version,
  provider-discovery, and session-message failures into the canonical health/auth diagnostics and normalized
  provider error/done event flow.
gui_related: false
gui_classification_reason: "This unit defines backend failure detection and normalized provider-event mapping rather than visual presentation."
split_recommended: true
depends_on:
  - "PO-007"
  - "PO-016"
  - "PO-017"
  - "PO-023"
unblocks: []
acceptance_criteria:
  - "Failure Taxonomy Detection And Event Mapping remains addressable as a fine-grained Provider OpenCode PlanUnit."
  - "ContractRefs, anchors, exact tokens, negative constraints, compatibility-only notes, stale/retired dispositions, owner/consumer boundaries, and source lineage from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: opencode_provider_drift
reasoning_tier: standard
context_scope: provider_opencode_failure_mapping
implementation_surfaces:
  - "Plans/Provider_OpenCode.md"
node_compile_hint:
  mode: opencode_failure_taxonomy_mapping
  create_worknodes: false
source_lineage:
  - "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Provider_OpenCode-S0032"
  - "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Provider_OpenCode-S0033"
preserved_exact_tokens:
  - "OpenCode not installed"
  - "`opencode` binary not found on PATH"
  - "Server not running"
  - "Health check connection refused"
  - "Server unreachable"
  - "Health check 401"
  - "ProviderAuthError"
  - "Version mismatch"
  - "diagnostic(category=\"version_mismatch\")"
  - "Provider not connected"
  - "GET /provider"
  - "Session error"
  - "normalized `error` event"
  - "done(status=failed)"
negative_constraints:
  - "Session/message API errors must map to normalized error events and done(status=failed), not an untyped provider failure."
preserved_contractrefs: []
owner_hints:
  - "Plans/Provider_OpenCode.md"
  - "Plans/Contracts_V0.md"
  - "Plans/CLI_Bridged_Providers.md"
```

### PO-028 - Recovery Messages And Doctor Checks

```yaml
plan_unit_id: PO-028
unit_type: requirement
status: accepted
owner_doc: Plans/Provider_OpenCode.md
canonical_text: >-
  When opencode_enabled is true, Puppet Master surfaces the specified OpenCode recovery messages and Doctor
  checks for binary presence, GET /global/health reachability, 401 auth, connected providers from GET
  /provider, and minimum server version.
gui_related: true
gui_classification_reason: "This unit preserves user-facing recovery copy and Doctor page checks for OpenCode."
split_recommended: true
depends_on:
  - "PO-027"
  - "PO-008"
  - "PO-010"
  - "PO-017"
unblocks: []
acceptance_criteria:
  - "Recovery Messages And Doctor Checks remains addressable as a fine-grained Provider OpenCode PlanUnit."
  - "ContractRefs, anchors, exact tokens, negative constraints, compatibility-only notes, stale/retired dispositions, owner/consumer boundaries, and source lineage from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: opencode_provider_drift
reasoning_tier: standard
context_scope: provider_opencode_doctor_surface
implementation_surfaces:
  - "Plans/Provider_OpenCode.md"
node_compile_hint:
  mode: opencode_doctor_recovery_surface
  create_worknodes: false
source_lineage:
  - "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Provider_OpenCode-S0033"
  - "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Provider_OpenCode-S0034"
preserved_exact_tokens:
  - "OpenCode not installed. Install from https://opencode.ai"
  - "OpenCode server not running. Start with: `opencode serve`"
  - "Cannot reach OpenCode server at {host}:{port}"
  - "OpenCode server requires authentication. Configure credentials in Settings."
  - "OpenCode provider auth error: {message}. Re-authenticate in OpenCode."
  - "No AI providers configured in OpenCode. Configure providers in OpenCode settings."
  - "Doctor page"
  - "opencode_enabled"
  - "Binary check"
  - "GET /global/health"
  - "Auth check"
  - "Provider check"
  - "GET /provider"
  - "connected"
  - "Version check"
negative_constraints: []
preserved_contractrefs:
  - "ContractRef: ContractName:Plans/Architecture_Invariants.md#INV-002, ContractName:Plans/Contracts_V0.md#AuthState"
owner_hints:
  - "Plans/Provider_OpenCode.md"
  - "Plans/Architecture_Invariants.md"
  - "Plans/Contracts_V0.md"
```

### PO-029 - Provider Settings Profile Controls

```yaml
plan_unit_id: PO-029
unit_type: requirement
status: accepted
owner_doc: Plans/Provider_OpenCode.md
canonical_text: >-
  OpenCode appears in Agent-Config and provider settings as a server-profile-driven provider with enable,
  managed/attached profile creation, endpoint/auth inputs, reconnect/restart/refresh/detach actions, and
  status badges for connection, health, discovery, and stale-cache state.
gui_related: true
gui_classification_reason: "This unit defines visible Agent-Config and provider settings controls."
split_recommended: false
depends_on:
  - "PO-006"
  - "PO-007"
  - "PO-008"
unblocks: []
acceptance_criteria:
  - "Provider Settings Profile Controls remains addressable as a fine-grained Provider OpenCode PlanUnit."
  - "ContractRefs, anchors, exact tokens, negative constraints, compatibility-only notes, stale/retired dispositions, owner/consumer boundaries, and source lineage from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: opencode_provider_drift
reasoning_tier: standard
context_scope: provider_opencode_settings_gui
implementation_surfaces:
  - "Plans/Provider_OpenCode.md"
node_compile_hint:
  mode: opencode_provider_settings_controls
  create_worknodes: false
source_lineage:
  - "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Provider_OpenCode-S0035"
  - "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Provider_OpenCode-S0036"
preserved_exact_tokens:
  - "Agent-Config"
  - "provider settings"
  - "server-profile-driven provider"
  - "Enable OpenCode"
  - "Add Managed Server"
  - "Add Attached Server"
  - "endpoint/base URL inputs"
  - "optional auth inputs"
  - "Reconnect"
  - "Restart Server"
  - "Refresh Discovery"
  - "Detach from PM control"
  - "status badges"
  - "connection, health, discovery, and stale-cache state"
negative_constraints: []
preserved_contractrefs:
  - "ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Multi-Account.md, ContractName:Plans/storage-plan.md"
owner_hints:
  - "Plans/Provider_OpenCode.md"
  - "Plans/FinalGUISpec.md"
  - "Plans/Multi-Account.md"
  - "Plans/storage-plan.md"
```

### PO-030 - Settings Ownership And Reflected State Boundary

```yaml
plan_unit_id: PO-030
unit_type: constraint
status: accepted
owner_doc: Plans/Provider_OpenCode.md
canonical_text: >-
  OpenCode settings must label profiles rather than implied account identity, expose connection and discovery
  details, hide lifecycle actions that imply PM owns attached remote processes, and keep PM-owned
  skills/tools/runtime state separate from OpenCode-reflected server and upstream-provider state.
gui_related: true
gui_classification_reason: "This unit defines visible settings ownership labels and GUI state boundaries."
split_recommended: true
depends_on:
  - "PO-006"
  - "PO-014"
  - "PO-025"
unblocks: []
acceptance_criteria:
  - "Settings Ownership And Reflected State Boundary remains addressable as a fine-grained Provider OpenCode PlanUnit."
  - "ContractRefs, anchors, exact tokens, negative constraints, compatibility-only notes, stale/retired dispositions, owner/consumer boundaries, and source lineage from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: opencode_provider_drift
reasoning_tier: standard
context_scope: provider_opencode_settings_boundary
implementation_surfaces:
  - "Plans/Provider_OpenCode.md"
node_compile_hint:
  mode: opencode_settings_state_ownership_boundary
  create_worknodes: false
source_lineage:
  - "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Provider_OpenCode-S0036"
preserved_exact_tokens:
  - "profile label"
  - "not an implied account identity"
  - "connection mode"
  - "endpoint summary"
  - "discovery freshness"
  - "PM ownership mode"
  - "PM-owned canon"
  - "OpenCode-reflected state"
  - "attached profiles"
  - "lifecycle actions"
  - "PM owns the remote process"
  - "/runtime"
  - "server auth"
  - "discovered upstream auth/runtime state"
  - "server-side session residue"
  - "OpenCode skill discovery is global to the selected server-profile"
  - "OPENCODE_DISABLE_CLAUDE_CODE_SKILLS"
  - "PM still routes canonical skills/tools through the PM skill and tool contracts"
negative_constraints:
  - "Attached profiles must not expose lifecycle actions that imply PM owns the remote process."
  - "OpenCode-reflected state must not replace PM-owned canonical runtime, skills, or tool state."
preserved_contractrefs:
  - "ContractRef: ContractName:Plans/OpenCode_Deep_Extraction.md, ContractName:Plans/Skills_System.md, ContractName:Plans/Tools.md"
owner_hints:
  - "Plans/Provider_OpenCode.md"
  - "Plans/OpenCode_Deep_Extraction.md"
  - "Plans/Skills_System.md"
  - "Plans/Tools.md"
```

### PO-031 - Tier Config Dropdown And Shared Card Layout

```yaml
plan_unit_id: PO-031
unit_type: requirement
status: accepted
owner_doc: Plans/Provider_OpenCode.md
canonical_text: >-
  When OpenCode is enabled, it appears in the tier platform dropdown and uses the same tier config card layout
  as other providers; its only UI difference is that model selection is sourced from OpenCode HTTP discovery
  and grouped by underlying provider.
gui_related: true
gui_classification_reason: "This unit defines tier configuration UI behavior and model-list presentation."
split_recommended: false
depends_on:
  - "PO-019"
  - "PO-020"
unblocks: []
acceptance_criteria:
  - "Tier Config Dropdown And Shared Card Layout remains addressable as a fine-grained Provider OpenCode PlanUnit."
  - "ContractRefs, anchors, exact tokens, negative constraints, compatibility-only notes, stale/retired dispositions, owner/consumer boundaries, and source lineage from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: opencode_provider_drift
reasoning_tier: standard
context_scope: provider_opencode_tier_ui
implementation_surfaces:
  - "Plans/Provider_OpenCode.md"
node_compile_hint:
  mode: opencode_tier_config_ui
  create_worknodes: false
source_lineage:
  - "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Provider_OpenCode-S0037"
preserved_exact_tokens:
  - "platform dropdown"
  - "any tier"
  - "Model selection"
  - "models discovered from the OpenCode server"
  - "grouped by underlying provider"
  - "No special-casing in UI"
  - "same tier config card layout"
  - "HTTP API vs CLI command"
negative_constraints:
  - "OpenCode must not receive a special tier config card layout distinct from other providers."
preserved_contractrefs: []
owner_hints:
  - "Plans/Provider_OpenCode.md"
  - "Plans/FinalGUISpec.md"
```

### PO-032 - CLI Path Fallback Scope

```yaml
plan_unit_id: PO-032
unit_type: constraint
status: accepted
owner_doc: Plans/Provider_OpenCode.md
canonical_text: >-
  OpenCode does not require CLI path input for normal runtime operation; if provided, the opencode CLI path is
  limited to local launcher/discovery fallback and installation diagnostics while run transport remains
  HTTP/SSE.
gui_related: false
gui_classification_reason: "This unit constrains launcher/discovery fallback behavior rather than visual presentation."
split_recommended: false
depends_on:
  - "PO-002"
  - "PO-005"
  - "PO-006"
unblocks: []
acceptance_criteria:
  - "CLI Path Fallback Scope remains addressable as a fine-grained Provider OpenCode PlanUnit."
  - "ContractRefs, anchors, exact tokens, negative constraints, compatibility-only notes, stale/retired dispositions, owner/consumer boundaries, and source lineage from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: opencode_provider_drift
reasoning_tier: standard
context_scope: provider_opencode_cli_fallback
implementation_surfaces:
  - "Plans/Provider_OpenCode.md"
node_compile_hint:
  mode: opencode_cli_path_fallback_scope
  create_worknodes: false
source_lineage:
  - "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Provider_OpenCode-S0038"
preserved_exact_tokens:
  - "does NOT require CLI path input"
  - "normal runtime operation"
  - "opencode CLI path"
  - "local launcher/discovery fallback"
  - "installation diagnostics"
  - "OpenCode run transport remains HTTP/SSE"
negative_constraints:
  - "OpenCode CLI path input must not become normal runtime transport."
preserved_contractrefs: []
owner_hints:
  - "Plans/Provider_OpenCode.md"
  - "Plans/CLI_Bridged_Providers.md"
```

### PO-033 - Retired platform_specs SSOT Constraints

```yaml
plan_unit_id: PO-033
unit_type: compatibility_disposition
status: accepted
owner_doc: Plans/Provider_OpenCode.md
canonical_text: >-
  Legacy platform_specs.rs OpenCode SSOT wording is retired/source-lineage only. Active OpenCode constraints are
  server-bridged http transport, default port 4096, optional CLI path only for launcher/discovery fallback, dynamic model
  discovery without hardcoded fallback models, and provider/model capability ownership through current contracts.
gui_related: false
gui_classification_reason: "This unit defines provider metadata SSOT constraints rather than visual presentation."
split_recommended: false
depends_on:
  - "PO-002"
  - "PO-023"
  - "PO-024"
  - "PO-032"
unblocks: []
acceptance_criteria:
  - "platform_specs SSOT Constraints remains addressable as a fine-grained Provider OpenCode PlanUnit."
  - "ContractRefs, anchors, exact tokens, negative constraints, compatibility-only notes, stale/retired dispositions, owner/consumer boundaries, and source lineage from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: opencode_provider_drift
reasoning_tier: standard
context_scope: provider_opencode_platform_specs
implementation_surfaces:
  - "Plans/Provider_OpenCode.md"
node_compile_hint:
  mode: retired_opencode_platform_specs_ssot
  create_worknodes: false
source_lineage:
  - "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Provider_OpenCode-S0039"
preserved_exact_tokens:
  - "platform_specs.rs"
  - "SSOT"
  - "Platform variant: `OpenCode`"
  - "Transport: `http`"
  - "Default server port: `4096`"
  - "CLI path is **optional**"
  - "launcher/discovery fallback"
  - "No hardcoded fallback models"
  - "dynamic discovery only"
negative_constraints:
  - "Do not use platform_specs.rs as active implementation authority."
  - "Do not encode hardcoded fallback OpenCode models."
compatibility_only_notes:
  - "platform_specs.rs is retained only as source-lineage."
preserved_contractrefs:
  - "ContractRef: ContractName:Plans/DRY_Rules.md#2-dont-duplicate-canonical-contracts, CodePath:puppet-master-rs/src/platforms/platform_specs.rs"
owner_hints:
  - "Plans/Provider_OpenCode.md"
  - "Plans/DRY_Rules.md"
```

### PO-034 - Per-Iteration Session Isolation

```yaml
plan_unit_id: PO-034
unit_type: constraint
status: accepted
owner_doc: Plans/Provider_OpenCode.md
canonical_text: >-
  Each Puppet Master iteration creates a new OpenCode session with POST /session, sends the prompt, waits for
  completion, deletes the session with DELETE /session/:id, and never reuses sessions across iterations.
gui_related: false
gui_classification_reason: "This unit defines runtime session lifecycle isolation rather than visual presentation."
split_recommended: false
depends_on:
  - "PO-015"
  - "PO-002"
unblocks: []
acceptance_criteria:
  - "Per-Iteration Session Isolation remains addressable as a fine-grained Provider OpenCode PlanUnit."
  - "ContractRefs, anchors, exact tokens, negative constraints, compatibility-only notes, stale/retired dispositions, owner/consumer boundaries, and source lineage from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: opencode_session_reuse_drift
reasoning_tier: standard
context_scope: provider_opencode_session_isolation
implementation_surfaces:
  - "Plans/Provider_OpenCode.md"
node_compile_hint:
  mode: opencode_session_isolation
  create_worknodes: false
source_lineage:
  - "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Provider_OpenCode-S0040"
preserved_exact_tokens:
  - "Each Puppet Master iteration"
  - "new OpenCode session"
  - "POST /session"
  - "sends the prompt"
  - "waits for completion"
  - "deletes the session"
  - "DELETE /session/:id"
  - "No session reuse across iterations"
  - "fresh-process-per-iteration guarantee"
  - "session abstraction"
negative_constraints:
  - "OpenCode sessions must not be reused across Puppet Master iterations."
preserved_contractrefs:
  - "ContractRef: PolicyRule:CU-P2-T12"
owner_hints:
  - "Plans/Provider_OpenCode.md"
  - "Plans/Executor_Protocol.md"
```

### PO-035 - Synchronous Invocation Sequence

```yaml
plan_unit_id: PO-035
unit_type: requirement
status: accepted
owner_doc: Plans/Provider_OpenCode.md
canonical_text: >-
  The synchronous OpenCode run sequence performs GET /global/health, POST /session, POST /session/{id}/message
  with providerID/modelID, build agent, and text parts, parses response parts into normalized events, and
  deletes the session.
gui_related: false
gui_classification_reason: "This unit defines HTTP invocation sequencing rather than visual presentation."
split_recommended: false
depends_on:
  - "PO-016"
  - "PO-019"
  - "PO-024"
  - "PO-034"
unblocks: []
acceptance_criteria:
  - "Synchronous Invocation Sequence remains addressable as a fine-grained Provider OpenCode PlanUnit."
  - "ContractRefs, anchors, exact tokens, negative constraints, compatibility-only notes, stale/retired dispositions, owner/consumer boundaries, and source lineage from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: opencode_provider_drift
reasoning_tier: standard
context_scope: provider_opencode_sync_invocation
implementation_surfaces:
  - "Plans/Provider_OpenCode.md"
node_compile_hint:
  mode: opencode_sync_invocation_sequence
  create_worknodes: false
source_lineage:
  - "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Provider_OpenCode-S0041"
  - "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Provider_OpenCode-S0042"
preserved_exact_tokens:
  - "Invocation Shape (Normative)"
  - "Synchronous Run"
  - "GET /global/health"
  - "healthy: true"
  - "version"
  - "POST /session"
  - "PM-2026-02-24-19-30-00-001"
  - "session-uuid"
  - "POST /session/{id}/message"
  - "providerID"
  - "modelID"
  - "claude-sonnet-4-5-20250514"
  - "agent"
  - "build"
  - "parts"
  - "Parse response parts"
  - "normalized events"
  - "DELETE /session/{id}"
negative_constraints: []
preserved_contractrefs: []
owner_hints:
  - "Plans/Provider_OpenCode.md"
  - "Plans/Contracts_V0.md"
  - "Plans/Executor_Protocol.md"
```

### PO-036 - Asynchronous SSE Invocation Sequence

```yaml
plan_unit_id: PO-036
unit_type: requirement
status: accepted
owner_doc: Plans/Provider_OpenCode.md
canonical_text: >-
  The asynchronous OpenCode run sequence subscribes to GET /event, sends POST /session/{id}/prompt_async with
  the same request body as the synchronous path, maps SSE events to normalized events, emits done on
  completion, and deletes the session.
gui_related: false
gui_classification_reason: "This unit defines asynchronous transport sequencing rather than visual presentation."
split_recommended: false
depends_on:
  - "PO-016"
  - "PO-035"
unblocks: []
acceptance_criteria:
  - "Asynchronous SSE Invocation Sequence remains addressable as a fine-grained Provider OpenCode PlanUnit."
  - "ContractRefs, anchors, exact tokens, negative constraints, compatibility-only notes, stale/retired dispositions, owner/consumer boundaries, and source lineage from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: opencode_provider_drift
reasoning_tier: standard
context_scope: provider_opencode_async_sse
implementation_surfaces:
  - "Plans/Provider_OpenCode.md"
node_compile_hint:
  mode: opencode_async_sse_invocation_sequence
  create_worknodes: false
source_lineage:
  - "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Provider_OpenCode-S0041"
  - "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Provider_OpenCode-S0043"
preserved_exact_tokens:
  - "Asynchronous Run (SSE)"
  - "GET /event"
  - "SSE stream"
  - "POST /session/{id}/prompt_async"
  - "same as sync"
  - "204 No Content"
  - "Receive SSE events"
  - "map to normalized events"
  - "emit done"
  - "delete session"
negative_constraints: []
preserved_contractrefs: []
owner_hints:
  - "Plans/Provider_OpenCode.md"
  - "Plans/Provider_Stream_Mapping_External_Reference_A2A.md"
  - "Plans/Contracts_V0.md"
```

### PO-037 - Cancellation And Abort Contract

```yaml
plan_unit_id: PO-037
unit_type: requirement
status: accepted
owner_doc: Plans/Provider_OpenCode.md
canonical_text: >-
  OpenCode cancellation is a first-class provider control distinct from ordinary failure: PM cancels the
  active transport, retains received partial tokens, marks completion_reason cancelled, distinguishes timeout
  from user cancel, manages connection-pool health, and emits provider.request_cancelled.
gui_related: false
gui_classification_reason: "This unit defines runtime cancellation semantics rather than visual presentation."
split_recommended: false
depends_on:
  - "PO-016"
  - "PO-034"
unblocks: []
acceptance_criteria:
  - "Cancellation And Abort Contract remains addressable as a fine-grained Provider OpenCode PlanUnit."
  - "ContractRefs, anchors, exact tokens, negative constraints, compatibility-only notes, stale/retired dispositions, owner/consumer boundaries, and source lineage from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: opencode_provider_drift
reasoning_tier: standard
context_scope: provider_opencode_cancellation
implementation_surfaces:
  - "Plans/Provider_OpenCode.md"
node_compile_hint:
  mode: opencode_cancel_abort_contract
  create_worknodes: false
source_lineage:
  - "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Provider_OpenCode-S0044"
preserved_exact_tokens:
  - "Cancellation and abort contract"
  - "first-class provider control"
  - "distinct from ordinary request failure"
  - "closing the HTTP stream"
  - "canceling the SSE subscription"
  - "abort signal"
  - "partial output tokens"
  - "completion_reason: cancelled"
  - "timeout and cancel are distinct"
  - "request_timeout_ms"
  - "connection pool"
  - "provider.request_cancelled"
  - "tokens_received"
  - "reason: \"user\" | \"timeout\" | \"budget\" | \"error\""
negative_constraints:
  - "Timeout and cancel must remain distinct runtime outcomes."
preserved_contractrefs:
  - "ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Executor_Protocol.md, ContractName:Plans/storage-plan.md"
owner_hints:
  - "Plans/Provider_OpenCode.md"
  - "Plans/Contracts_V0.md"
  - "Plans/Executor_Protocol.md"
  - "Plans/storage-plan.md"
```

### PO-038 - Provider-Account Scoped Concurrency

```yaml
plan_unit_id: PO-038
unit_type: requirement
status: accepted
owner_doc: Plans/Provider_OpenCode.md
canonical_text: >-
  OpenCode dispatch is queue-backed and provider-account scoped: sequential by default, parallel only when
  explicitly enabled, configurable per-account concurrency, FIFO queueing, queue_timeout_ms expiry,
  independent account queues, and provider.request_queued emission.
gui_related: false
gui_classification_reason: "This unit defines provider dispatch and queueing semantics rather than visual presentation."
split_recommended: false
depends_on:
  - "PO-006"
  - "PO-012"
unblocks: []
acceptance_criteria:
  - "Provider-Account Scoped Concurrency remains addressable as a fine-grained Provider OpenCode PlanUnit."
  - "ContractRefs, anchors, exact tokens, negative constraints, compatibility-only notes, stale/retired dispositions, owner/consumer boundaries, and source lineage from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: opencode_provider_drift
reasoning_tier: standard
context_scope: provider_opencode_concurrency
implementation_surfaces:
  - "Plans/Provider_OpenCode.md"
node_compile_hint:
  mode: opencode_provider_account_queueing
  create_worknodes: false
source_lineage:
  - "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Provider_OpenCode-S0045"
preserved_exact_tokens:
  - "Concurrency model"
  - "queue-backed"
  - "provider-account scoped"
  - "default mode is sequential"
  - "parallel mode is allowed only when explicitly enabled"
  - "subagent execution"
  - "orchestrator-controlled fan-out flows"
  - "concurrency limit"
  - "default = `1`"
  - "FIFO queue"
  - "queue_timeout_ms"
  - "default `30000ms`"
  - "different accounts"
  - "independent concurrency limits"
  - "provider.request_queued"
  - "queue_position"
  - "queue_depth"
negative_constraints:
  - "Parallel OpenCode dispatch must not be enabled implicitly."
preserved_contractrefs:
  - "ContractRef: ContractName:Plans/Multi-Account.md, ContractName:Plans/Executor_Protocol.md, ContractName:Plans/Contracts_V0.md"
owner_hints:
  - "Plans/Provider_OpenCode.md"
  - "Plans/Multi-Account.md"
  - "Plans/Executor_Protocol.md"
  - "Plans/Contracts_V0.md"
```

### PO-039 - Streaming Error Recovery And Budget Handling

```yaml
plan_unit_id: PO-039
unit_type: requirement
status: accepted
owner_doc: Plans/Provider_OpenCode.md
canonical_text: >-
  OpenCode streaming recovery retains already-received output, marks stream errors, optionally reconnects with
  partial_response context, avoids fabricated seamless continuation when unsupported, handles HTTP 429
  retry/backoff, and records length or budget_exceeded completion reasons.
gui_related: false
gui_classification_reason: "This unit defines streaming recovery policy rather than visual presentation."
split_recommended: false
depends_on:
  - "PO-016"
  - "PO-037"
  - "PO-038"
unblocks: []
acceptance_criteria:
  - "Streaming Error Recovery And Budget Handling remains addressable as a fine-grained Provider OpenCode PlanUnit."
  - "ContractRefs, anchors, exact tokens, negative constraints, compatibility-only notes, stale/retired dispositions, owner/consumer boundaries, and source lineage from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: opencode_provider_drift
reasoning_tier: standard
context_scope: provider_opencode_streaming_recovery
implementation_surfaces:
  - "Plans/Provider_OpenCode.md"
node_compile_hint:
  mode: opencode_streaming_recovery_policy
  create_worknodes: false
source_lineage:
  - "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Provider_OpenCode-S0046"
preserved_exact_tokens:
  - "Streaming error recovery"
  - "retain all tokens received so far"
  - "completion_reason: stream_error"
  - "auto_retry_stream: true"
  - "partial_response"
  - "provider supports continuation from partial output"
  - "without fabricating a seamless continuation"
  - "HTTP `429`"
  - "Retry-After"
  - "exponential backoff `1s -> 2s -> 4s`"
  - "maximum rate-limit retries = `3`"
  - "failure_class: rate_limited"
  - "completion_reason: length"
  - "budget_exceeded"
negative_constraints:
  - "PM must not fabricate a seamless continuation when the provider does not support continuation from partial output."
preserved_contractrefs:
  - "ContractRef: ContractName:Plans/Executor_Protocol.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/storage-plan.md"
owner_hints:
  - "Plans/Provider_OpenCode.md"
  - "Plans/Executor_Protocol.md"
  - "Plans/Contracts_V0.md"
  - "Plans/storage-plan.md"
```

### PO-040 - Seglog Event Persistence Mapping

```yaml
plan_unit_id: PO-040
unit_type: requirement
status: accepted
owner_doc: Plans/Provider_OpenCode.md
canonical_text: >-
  OpenCode runs persist to seglog using the shared provider event types: run.started with run_id, thread_id,
  platform opencode, mode, and http transport; tool.invoked/tool.denied from response parts; usage.event from
  message metadata; and run.completed on session completion.
gui_related: false
gui_classification_reason: "This unit defines persistence event mapping rather than visual presentation."
split_recommended: true
depends_on:
  - "PO-016"
  - "PO-022"
  - "PO-034"
unblocks: []
acceptance_criteria:
  - "Seglog Event Persistence Mapping remains addressable as a fine-grained Provider OpenCode PlanUnit."
  - "ContractRefs, anchors, exact tokens, negative constraints, compatibility-only notes, stale/retired dispositions, owner/consumer boundaries, and source lineage from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: opencode_provider_drift
reasoning_tier: standard
context_scope: provider_opencode_seglog_mapping
implementation_surfaces:
  - "Plans/Provider_OpenCode.md"
node_compile_hint:
  mode: opencode_seglog_event_mapping
  create_worknodes: false
source_lineage:
  - "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Provider_OpenCode-S0047"
preserved_exact_tokens:
  - "Persistence Mapping (seglog)"
  - "seglog"
  - "run.started"
  - "run_id"
  - "thread_id"
  - "platform: \"opencode\""
  - "mode"
  - "transport: \"http\""
  - "tool.invoked"
  - "tool.denied"
  - "OpenCode response parts"
  - "usage.event"
  - "message metadata"
  - "input/output tokens"
  - "run.completed"
  - "status"
negative_constraints: []
preserved_contractrefs:
  - "ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Contracts_V0.md#EventRecord"
owner_hints:
  - "Plans/Provider_OpenCode.md"
  - "Plans/storage-plan.md"
  - "Plans/Contracts_V0.md"
```

### PO-041 - Cost Certainty And Provider-Local Persistence Boundary

```yaml
plan_unit_id: PO-041
unit_type: constraint
status: accepted
owner_doc: Plans/Provider_OpenCode.md
canonical_text: >-
  OpenCode cost and persistence evidence remains provider-local reference state: PM must not copy OpenCode
  visuals, overclaim cost certainty, treat estimated-cost as provider-authoritative pricing without evidence,
  or use OpenCode SQLite/snapshot/NFS-incompatible state as PM canonical ledger, event log, or recovery
  source.
gui_related: false
gui_classification_reason: "This unit defines cost and persistence authority boundaries rather than visual presentation."
split_recommended: true
depends_on:
  - "PO-014"
  - "PO-040"
unblocks: []
acceptance_criteria:
  - "Cost Certainty And Provider-Local Persistence Boundary remains addressable as a fine-grained Provider OpenCode PlanUnit."
  - "ContractRefs, anchors, exact tokens, negative constraints, compatibility-only notes, stale/retired dispositions, owner/consumer boundaries, and source lineage from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: opencode_persistence_authority_drift
reasoning_tier: standard
context_scope: provider_opencode_persistence_boundary
implementation_surfaces:
  - "Plans/Provider_OpenCode.md"
node_compile_hint:
  mode: opencode_persistence_boundary
  create_worknodes: false
source_lineage:
  - "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Provider_OpenCode-S0047"
preserved_exact_tokens:
  - "Do not copy OpenCode visuals directly"
  - "overclaim OpenCode-derived cost certainty"
  - "provider-cache and provider-normalization caveats"
  - "estimated-cost"
  - "provider-authoritative pricing"
  - "raw/debug evidence"
  - "upstream cache/input reporting caveat"
  - "provider-local reference state"
  - "not PM canonical state"
  - "non-atomic writes"
  - "shared snapshot indexes"
  - "SQLite stores"
  - "NFS-incompatible filesystem assumptions"
  - "authoritative PM ledger, event log, or recovery source"
negative_constraints:
  - "OpenCode visuals must not be copied directly into PM canonical surfaces."
  - "OpenCode SQLite, snapshot, and NFS-incompatible provider-local state must not become the authoritative PM ledger, event log, or recovery source."
preserved_contractrefs:
  - "ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Contracts_V0.md#EventRecord"
owner_hints:
  - "Plans/Provider_OpenCode.md"
  - "Plans/storage-plan.md"
  - "Plans/Contracts_V0.md"
```

### PO-042 - Testable Acceptance Bundle

```yaml
plan_unit_id: PO-042
unit_type: acceptance
status: accepted
owner_doc: Plans/Provider_OpenCode.md
canonical_text: >-
  OpenCode acceptance requires reachable enabled sessions, provider/model discovery and GUI model picker
  display, health/auth user-facing errors, normalized provider events, per-iteration session deletion,
  enabled-only tier visibility, Doctor checks, credential-store secrets, and unified Provider facade behavior
  without consumer branching.
gui_related: true
gui_classification_reason: "This unit includes GUI model picker, tier dropdown, Doctor page, and user-facing auth/error acceptance surfaces."
split_recommended: false
depends_on:
  - "PO-027"
  - "PO-028"
  - "PO-029"
  - "PO-030"
  - "PO-031"
  - "PO-032"
  - "PO-033"
  - "PO-034"
  - "PO-035"
  - "PO-036"
  - "PO-037"
  - "PO-038"
  - "PO-039"
  - "PO-040"
  - "PO-041"
unblocks: []
acceptance_criteria:
  - "Testable Acceptance Bundle remains addressable as a fine-grained Provider OpenCode PlanUnit."
  - "ContractRefs, anchors, exact tokens, negative constraints, compatibility-only notes, stale/retired dispositions, owner/consumer boundaries, and source lineage from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: opencode_provider_drift
reasoning_tier: standard
context_scope: provider_opencode_acceptance
implementation_surfaces:
  - "Plans/Provider_OpenCode.md"
node_compile_hint:
  mode: opencode_acceptance_matrix
  create_worknodes: false
source_lineage:
  - "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Provider_OpenCode-S0048"
preserved_exact_tokens:
  - "Acceptance Criteria (Testable)"
  - "opencode_enabled"
  - "create a session"
  - "send a prompt"
  - "receive a response"
  - "delete the session"
  - "Model discovery via `GET /provider`"
  - "GUI model picker"
  - "Health check failures"
  - "auth state changes"
  - "user-facing error messages"
  - "normalized events"
  - "text_delta"
  - "tool_use"
  - "tool_result"
  - "usage"
  - "done"
  - "no session reuse"
  - "tier config platform dropdown"
  - "Doctor page"
  - "Secrets (password)"
  - "OS credential store"
  - "unified Provider facade"
  - "consumers do not branch on OpenCode vs CLI providers"
negative_constraints:
  - "Consumers must not branch on OpenCode vs CLI providers for accepted Provider facade behavior."
preserved_contractrefs: []
owner_hints:
  - "Plans/Provider_OpenCode.md"
  - "Plans/FinalGUISpec.md"
  - "Plans/Contracts_V0.md"
```

### PO-043 - Runtime Identity Correlation Bundle

```yaml
plan_unit_id: PO-043
unit_type: requirement
status: accepted
owner_doc: Plans/Provider_OpenCode.md
canonical_text: >-
  Each OpenCode-backed attempt preserves the shared runtime identity and correlation bundle in local
  correlation state and attaches it to normalized provider events, storage records, and retry/recovery
  decisions even when fields are not transmitted to OpenCode HTTP endpoints.
gui_related: false
gui_classification_reason: "This unit defines runtime identity and local correlation fields rather than visual presentation."
split_recommended: false
depends_on:
  - "PO-004"
  - "PO-011"
  - "PO-034"
unblocks: []
acceptance_criteria:
  - "Runtime Identity Correlation Bundle remains addressable as a fine-grained Provider OpenCode PlanUnit."
  - "ContractRefs, anchors, exact tokens, negative constraints, compatibility-only notes, stale/retired dispositions, owner/consumer boundaries, and source lineage from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: opencode_provider_drift
reasoning_tier: standard
context_scope: provider_opencode_runtime_identity
implementation_surfaces:
  - "Plans/Provider_OpenCode.md"
node_compile_hint:
  mode: opencode_runtime_identity_bundle
  create_worknodes: false
source_lineage:
  - "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Provider_OpenCode-S0050"
  - "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Provider_OpenCode-S0051"
preserved_exact_tokens:
  - "OpenCode Runtime Retry / Blocked-State / Packet Canonical Alignment (2026-03-09)"
  - "canonical runtime scheduler"
  - "retry taxonomy"
  - "safe-point contract"
  - "remediation lineage"
  - "runtime packet"
  - "usage pipeline"
  - "run_id"
  - "thread_id"
  - "node_id"
  - "attempt_id"
  - "retry_count"
  - "requested/effective model identifiers"
  - "requested/effective permission snapshot identifiers"
  - "replan_generation"
  - "mutation_capable"
  - "safe_point_id?"
  - "remediation_root_id?"
  - "remediation_parent_attempt_id?"
  - "remediation_generation?"
  - "local correlation state"
  - "normalized provider events"
  - "storage records"
  - "retry/recovery decisions"
negative_constraints:
  - "OpenCode HTTP endpoint shape must not be used as an excuse to drop canonical runtime identity fields from local correlation and normalized records."
preserved_contractrefs: []
owner_hints:
  - "Plans/Provider_OpenCode.md"
  - "Plans/Contracts_V0.md"
  - "Plans/Prompt_Pipeline.md"
  - "Plans/storage-plan.md"
```

### PO-044 - Retry Ownership And Attempt Lineage

```yaml
plan_unit_id: PO-044
unit_type: constraint
status: accepted
owner_doc: Plans/Provider_OpenCode.md
canonical_text: >-
  OpenCode reconnect and retry behavior must preserve canonical attempt identity: reconnect only observes an
  existing attempt, accepted requests retry only through the canonical runtime scheduler and failure taxonomy,
  recovery creates a new attempt snapshot, safe_point_id persists across mutation-capable attempts, restore
  reruns use new attempt_id lineage, and stale replan_generation attempts do not resume silently.
gui_related: false
gui_classification_reason: "This unit defines scheduler retry ownership and attempt lineage rather than visual presentation."
split_recommended: true
depends_on:
  - "PO-039"
  - "PO-043"
unblocks: []
acceptance_criteria:
  - "Retry Ownership And Attempt Lineage remains addressable as a fine-grained Provider OpenCode PlanUnit."
  - "ContractRefs, anchors, exact tokens, negative constraints, compatibility-only notes, stale/retired dispositions, owner/consumer boundaries, and source lineage from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: opencode_retry_ownership_drift
reasoning_tier: standard
context_scope: provider_opencode_retry_lineage
implementation_surfaces:
  - "Plans/Provider_OpenCode.md"
node_compile_hint:
  mode: opencode_retry_lineage_scheduler
  create_worknodes: false
source_lineage:
  - "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Provider_OpenCode-S0052"
preserved_exact_tokens:
  - "OpenCode transport reconnect logic"
  - "reconnect only to observe an existing attempt"
  - "MUST NOT silently resubmit prompts"
  - "reset attempt identity"
  - "invent provider-local fallback loops"
  - "canonical runtime scheduler"
  - "failure taxonomy"
  - "canonical scheduler wake"
  - "new attempt snapshot"
  - "safe_point_id"
  - "mutation-capable OpenCode attempt"
  - "new `attempt_id`"
  - "lineage references"
  - "replan invalidation"
  - "replan_generation"
  - "stale attempts"
  - "OpenCode-local retry wording is superseded by canonical runtime retry ownership"
negative_constraints:
  - "OpenCode reconnect logic must not silently resubmit prompts, reset attempt identity, or invent provider-local fallback loops."
  - "Stale attempts from an older replan_generation must not resume silently."
  - "Any OpenCode-local retry wording is superseded by canonical runtime retry ownership."
preserved_contractrefs: []
stale_retired_dispositions:
  - "Stale attempts from an older `replan_generation` must not resume silently."
owner_hints:
  - "Plans/Provider_OpenCode.md"
  - "Plans/Executor_Protocol.md"
  - "Plans/Contracts_V0.md"
```

### PO-045 - Canonical Blocked Signal Normalization For UI And Orchestration

```yaml
plan_unit_id: PO-045
unit_type: requirement
status: accepted
owner_doc: Plans/Provider_OpenCode.md
canonical_text: >-
  OpenCode auth, transient, structured-output, and tool-denial signals must normalize into canonical
  blocked_reason_code or failure_class values before orchestration or UI consumes them, preserving
  server-vs-provider auth realms and refusing to collapse permission, FileSafe, or external-side-effect blocks
  into generic provider errors.
gui_related: true
gui_classification_reason: "This unit includes blocked-state classifications consumed by orchestration and UI recovery surfaces."
split_recommended: true
depends_on:
  - "PO-017"
  - "PO-027"
  - "PO-043"
  - "PO-044"
unblocks: []
acceptance_criteria:
  - "Canonical Blocked Signal Normalization For UI And Orchestration remains addressable as a fine-grained Provider OpenCode PlanUnit."
  - "ContractRefs, anchors, exact tokens, negative constraints, compatibility-only notes, stale/retired dispositions, owner/consumer boundaries, and source lineage from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: opencode_blocked_signal_drift
reasoning_tier: standard
context_scope: provider_opencode_blocked_signal_normalization
implementation_surfaces:
  - "Plans/Provider_OpenCode.md"
node_compile_hint:
  mode: opencode_blocked_failure_ui_boundary
  create_worknodes: false
source_lineage:
  - "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Provider_OpenCode-S0052"
  - "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Provider_OpenCode-S0053"
preserved_exact_tokens:
  - "blocked_reason_code"
  - "failure_class"
  - "before orchestration or UI consumes them"
  - "auth_expired"
  - "server realm"
  - "provider realm"
  - "provider_transient"
  - "structured_output_invalid"
  - "permission_denied"
  - "filesafe_blocked"
  - "external_side_effect_blocked"
  - "generic `error`"
  - "provider_failed"
  - "canonical failure and blocked mapping"
  - "Surface blocked recovery"
  - "wait for auth recovery"
  - "Runtime retry/backoff policy applies"
  - "structured-output remediation / retry policy"
negative_constraints:
  - "The adapter MUST NOT collapse permission_denied, filesafe_blocked, external_side_effect_blocked, or other already-determined canonical runtime classes to generic error or provider_failed."
preserved_contractrefs: []
owner_hints:
  - "Plans/Provider_OpenCode.md"
  - "Plans/Contracts_V0.md"
  - "Plans/FinalGUISpec.md"
  - "Plans/FileSafe.md"
```

### PO-046 - Capability And Usage Runtime Alignment

```yaml
plan_unit_id: PO-046
unit_type: requirement
status: accepted
owner_doc: Plans/Provider_OpenCode.md
canonical_text: >-
  OpenCode capability reporting declares server-bridged HTTP/SSE transport, normalized streaming support,
  canonical tool-policy snapshot use, split server/upstream auth realms, and no hidden retries; unsupported
  runtime controls are recorded as unsupported/skipped, and Session.getUsage message usage maps to normalized
  usage.event persistence and Ledger/Usage consumption.
gui_related: false
gui_classification_reason: "This unit defines runtime capability and usage mapping rather than visual presentation."
split_recommended: false
depends_on:
  - "PO-016"
  - "PO-017"
  - "PO-022"
  - "PO-024"
  - "PO-025"
  - "PO-040"
unblocks: []
acceptance_criteria:
  - "Capability And Usage Runtime Alignment remains addressable as a fine-grained Provider OpenCode PlanUnit."
  - "ContractRefs, anchors, exact tokens, negative constraints, compatibility-only notes, stale/retired dispositions, owner/consumer boundaries, and source lineage from the source spans remain preserved."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: opencode_provider_drift
reasoning_tier: standard
context_scope: provider_opencode_capability_usage
implementation_surfaces:
  - "Plans/Provider_OpenCode.md"
node_compile_hint:
  mode: opencode_capability_usage_alignment
  create_worknodes: false
source_lineage:
  - "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Provider_OpenCode-S0054"
preserved_exact_tokens:
  - "server-bridged HTTP/SSE"
  - "supports streaming normalized events"
  - "canonical tool-policy snapshot"
  - "split auth realms"
  - "server credentials vs upstream provider auth"
  - "performs no hidden runtime retries"
  - "unsupported/skipped"
  - "effective runtime state"
  - "OpenCode server returns message-level usage"
  - "usage.event"
  - "Persistence and Ledger/Usage consumption"
  - "storage-plan.md"
  - "usage-feature.md"
  - "Session.getUsage"
  - "processor finish-step"
  - "terminology should not drift"
negative_constraints:
  - "OpenCode must not perform hidden runtime retries."
  - "Unsupported runtime controls must be recorded as unsupported/skipped rather than silently ignored."
preserved_contractrefs:
  - "ContractRef: ContractName:Plans/CLI_Bridged_Providers.md, ContractName:Plans/Provider_Stream_Mapping_External_Reference_A2A.md, ContractName:Plans/Models_System.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/storage-plan.md, ContractName:Plans/usage-feature.md"
owner_hints:
  - "Plans/Provider_OpenCode.md"
  - "Plans/CLI_Bridged_Providers.md"
  - "Plans/Provider_Stream_Mapping_External_Reference_A2A.md"
  - "Plans/Models_System.md"
  - "Plans/Contracts_V0.md"
  - "Plans/storage-plan.md"
  - "Plans/usage-feature.md"
```

### PO-001 - Provider OpenCode Retired Source-Preserving Bridge

```yaml
plan_unit_id: PO-001
unit_type: compatibility_disposition
status: retired
owner_doc: Plans/Provider_OpenCode.md
canonical_text: >-
  PO-001 is retired to migration-lineage-only compatibility disposition after Phase 2B batch 158.
  Provider_OpenCode-S0001 through Provider_OpenCode-S0031 are covered by PO-002 through PO-026 or structural
  dispositions, Provider_OpenCode-S0032 through Provider_OpenCode-S0054 are covered by PO-027 through PO-046
  or structural/reference dispositions, and Provider_OpenCode-S0055 through Provider_OpenCode-S0058 are
  generated structural/audit dispositions. PO-001 must not re-own or override implementation-facing PlanUnits
  and must not use source_preserving_planunit compile mode.
gui_related: false
gui_classification_reason: "The live retired bridge is migration/audit metadata only; historical GUI-related bridge tokens remain preserved by span_map and coverage_map."
split_recommended: false
depends_on:
  - "PO-002"
  - "PO-003"
  - "PO-004"
  - "PO-005"
  - "PO-006"
  - "PO-007"
  - "PO-008"
  - "PO-009"
  - "PO-010"
  - "PO-011"
  - "PO-012"
  - "PO-013"
  - "PO-014"
  - "PO-015"
  - "PO-016"
  - "PO-017"
  - "PO-018"
  - "PO-019"
  - "PO-020"
  - "PO-021"
  - "PO-022"
  - "PO-023"
  - "PO-024"
  - "PO-025"
  - "PO-026"
  - "PO-027"
  - "PO-028"
  - "PO-029"
  - "PO-030"
  - "PO-031"
  - "PO-032"
  - "PO-033"
  - "PO-034"
  - "PO-035"
  - "PO-036"
  - "PO-037"
  - "PO-038"
  - "PO-039"
  - "PO-040"
  - "PO-041"
  - "PO-042"
  - "PO-043"
  - "PO-044"
  - "PO-045"
  - "PO-046"
unblocks: []
acceptance_criteria:
  - "Generated-tail structural and audit spans remain available for exact-text audit."
  - "Provider_OpenCode-S0001 through Provider_OpenCode-S0054 remain mapped to PO-002 through PO-046 or explicit structural/reference dispositions rather than PO-001."
  - "Provider_OpenCode-S0055 through Provider_OpenCode-S0058 are structurally dispositioned as generated tail/audit material."
  - "PO-001 no longer uses node_compile_hint.mode=source_preserving_planunit."
  - "No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit."
validation_surfaces:
  - "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
  - "python3 scripts/pm-plan-index.py validate"
risk_class: residual_bridge_overreach
reasoning_tier: standard
context_scope: provider_opencode_retired_bridge
implementation_surfaces:
  - "Plans/Provider_OpenCode.md"
node_compile_hint:
  mode: retired_source_preserving_bridge
  create_worknodes: false
source_lineage:
  - "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Provider_OpenCode-S0055"
  - "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Provider_OpenCode-S0056"
  - "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Provider_OpenCode-S0057"
  - "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Provider_OpenCode-S0058"
preserved_exact_tokens:
  - "source_preserving_planunit"
  - "retired_source_preserving_bridge"
  - "Owner / Consumer Map"
  - "PlanUnits"
  - "Provider OpenCode Residual Source-Preserving Bridge"
  - "Provider OpenCode Residual Generated-Tail Bridge"
  - "Provider OpenCode Retired Source-Preserving Bridge"
  - "Migration Coverage"
  - "Provider_OpenCode-S0055"
  - "Provider_OpenCode-S0058"
negative_constraints:
  - "PO-001 must not provide product implementation coverage for Provider_OpenCode-S0001 through Provider_OpenCode-S0054."
  - "PO-001 must not override PO-002 through PO-046 or structural/reference dispositions."
  - "PO-001 must not use source_preserving_planunit compile mode after Phase 2B batch 158."
preserved_contractrefs:
  - "ContractRef: ContractName:Plans/Plan_Document_System.md, ContractName:Plans/Bootstrap_Planning_Migration.md"
compatibility_only_notes:
  - "The retired bridge remains only as migration-lineage compatibility metadata."
stale_retired_dispositions:
  - "source_preserving_bridge_retired"
owner_hints:
  - "Plans/Provider_OpenCode.md"
```

## Migration Coverage

Original hash: `e0d27c1494bf01c5a72ca17abb7f28b8f6a1045f19aa2ef941b87d7c9ab6d2e9`.

Run-scoped proof artifacts:
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/original_hashes.json`
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl`
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/coverage_map.jsonl`
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/anchor_aliases.json`

Original spans from `Provider_OpenCode-S0001` through `Provider_OpenCode-S0054` are preserved in place and atomized into fine-grained PlanUnits `PO-002` through `PO-046` or explicit structural/reference dispositions. Generated tail spans `Provider_OpenCode-S0055` through `Provider_OpenCode-S0058` are structurally dispositioned, and `PO-001` is retired to migration-lineage-only compatibility disposition with `node_compile_hint.mode=retired_source_preserving_bridge`. No residual source-preserving product bridge remains for `Plans/Provider_OpenCode.md`. This batch did not update Spec Lock, generated shards, evidence bundles, auto_decisions, or plan_graph, and it did not create WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code.

## Ledger Compile Addendum - pldg-20260614-002

### PO-047 - Requested Effective Provider Attempt Identity

```yaml
plan_unit_id: PO-047
unit_type: requirement
status: accepted
owner_doc: Plans/Provider_OpenCode.md
canonical_text: >-
  OpenCode server-bridged attempts must preserve requested and effective PM runtime identity while keeping
  OpenCode session ids and SSE ids in provider-native correlation fields. Each provider attempt records
  `provider_attempt_ref`, PM attempt_id, requested provider/profile/model/account, effective
  provider/profile/model/account, server profile, transport/session correlation, continuity/reconnect
  fields, and parity gaps when server-bridged identity cannot match direct-provider disclosure.
gui_related: false
gui_classification_reason: Provider attempt identity and SSE correlation fields are runtime/provider contracts, not visual presentation.
depends_on: [CV-281]
unblocks: []
acceptance_criteria:
  - OpenCode session identity never replaces canonical `thread_id`, `run_id`, or `attempt_id`.
  - "`provider_attempt_ref` and continuity/reconnect fields have a stable schema slot for replay and usage correlation."
  - Requested/effective identity parity gaps are explicit for server-bridged providers.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260614-002-part-3-fable-cleanup
risk_class: provider_identity_correlation_drift
reasoning_tier: high
context_scope: opencode_provider_attempt_identity
implementation_surfaces: [Plans/Provider_OpenCode.md, Plans/Provider_Stream_Mapping_External_Reference_A2A.md, Plans/usage-feature.md]
node_compile_hint: {mode: provider_attempt_identity_contract, create_worknodes: false}
source_lineage:
  - pldg-20260614-002-part-3-fable-cleanup:atom-0035
  - pldg-20260614-002-part-3-fable-cleanup:atom-0049
preserved_exact_tokens: ["provider_attempt_ref?", "SSE correlation fields", "requested/effective identity parity", "server-bridged providers", "usage-feature.md:74"]
negative_constraints:
  - Do not map OpenCode session id into canonical `thread_id`.
  - Do not treat server-bridged identity parity as equal to direct providers unless evidence proves it.
owner_hints: [Plans/Provider_OpenCode.md, Plans/Provider_Stream_Mapping_External_Reference_A2A.md, Plans/usage-feature.md]
```


## Ledger Compile Addendum - pldg-20260626-001-feature-name

This addendum compiles accepted source-lineage obligations from bootstrap ledger `pldg-20260626-001-feature-name` into this existing owner/consumer doc. It creates canonical PlanUnits only; it does not create WorkNodes, NodeSeeds, executable queues, final node manifests, implementation files, generated governance artifacts, or production build tasks.

### PO-049 - opencode-see-image Source Lineage Boundary

```yaml
plan_unit_id: PO-049
unit_type: constraint
status: accepted
owner_doc: Plans/Provider_OpenCode.md
canonical_text: 'https://github.com/alfaoz/opencode-see-image is preserved as source-lineage for the PM-native vision
  bridge shape: a see_image tool, prompt guidance to avoid guessing, image/screenshot resolution, and a vision-capable
  route returning text. PM must not inherit OpenCode-specific plugin APIs, auth.json, SQLite DB layout, Bun runtime,
  opencode run, --dangerously-skip-permissions behavior, or hardcoded opencode-go/minimax-m3/mimo-v2.5-free defaults
  as product requirements.'
gui_related: false
gui_classification_reason: Provider lineage and dependency boundaries are provider integration semantics, not GUI.
depends_on:
- T-165
unblocks:
- MGAC-099
acceptance_criteria:
- Live PlanUnit exists in the adjudicated owner doc with reciprocal ledger source_lineage.
- Exact source tokens, negative constraints, owner hints, and user corrections are preserved in PlanUnit metadata.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, implementation files, or production build tasks
  are created by this compile.
validation_surfaces:
- python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260626-001-feature-name
- python3 scripts/pm-plan-index.py validate
- git diff --check
risk_class: opencode_dependency_leak
reasoning_tier: standard
context_scope: opencode_see_image_lineage
implementation_surfaces:
- Plans/Provider_OpenCode.md
- future provider docs
node_compile_hint:
  mode: source_lineage_boundary
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260626-001-feature-name:atom-0070
- pldg-20260626-001-feature-name:atom-0071
- pldg-20260626-001-feature-name:atom-0072
- external:github.com/alfaoz/opencode-see-image@cde1615f6dfc9039c58da6813112ee53391b5b49
- local:/tmp/pm-ext-opencode-see-image
- chat:opencode-see-image-request
- Plans/Provider_OpenCode.md
source_atom_ids:
- atom-0070
- atom-0071
- atom-0072
decision_refs:
- dec-0014
preserved_exact_tokens:
- https://github.com/alfaoz/opencode-see-image
- cde1615f6dfc9039c58da6813112ee53391b5b49
- 1.1.0
- MIT
- bun
- /tmp/pm-ext-opencode-see-image
- see_image
- experimental.chat.system.transform
- OpenCode SQLite
- part
- screenshotSearchDirs
- SEE_IMAGE_MODEL
- SEE_IMAGE_PROVIDER
- minimax-m3
- opencode-go
- mimo-v2.5-free
- never guess image contents
- adopt it to PM
- that is for Opencode
- OpenCode plugin APIs
- auth.json
- opencode.db
- Bun
- opencode run
- --dangerously-skip-permissions
negative_constraints:
- Do not vendor or import the external repo into PM as canonical code during this ledger-only planning thread.
- Do not assume the repo's OpenCode-specific runtime dependencies are PM requirements.
- Do not claim local selftests passed because `bun` was unavailable.
- Do not copy OpenCode's SQLite/session model as PM's source of truth.
- Do not hardcode `opencode-go`, `minimax-m3`, or `mimo-v2.5-free` as PM defaults without an explicit provider-routing
  decision.
- Do not carry over OpenCode-specific prompt injection unchanged.
- Do not make OpenCode the owner of PM media tools.
- Do not use OpenCode provider capability reporting as a substitute for PM-native media capability records.
- Do not introduce a provider-specific dependency where a PM-native tool/capability can serve all provider routes.
owner_hints:
- Plans/Media_Generation_and_Capabilities.md
- Plans/Provider_OpenCode.md
- Plans/Tools.md
- Plans/Prompt_Pipeline.md
- Plans/Models_System.md
- Plans/MCP_Integration.md
compatibility_only_notes:
- Concept/source-lineage references are preserved for routing and audit only; they do not make external plugins
  or PMConcept.html canonical implementation source.
```
