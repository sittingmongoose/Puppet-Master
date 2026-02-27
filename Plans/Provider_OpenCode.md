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

- Replacing or deprecating any existing provider integration mode (CLI-bridged, direct-provider, or server-bridged).
- Bundling or auto-installing OpenCode (user must install it themselves).
- Importing OpenCode's internal architecture into Puppet Master (OpenCode is an external dependency).
- Introducing SDK-driven runtime launch or install flows; Puppet Master uses OpenCode HTTP endpoints directly.

---

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

## 4. Architecture Overview

### 4.1 OpenCode Server Model

OpenCode uses a **client/server architecture**:

1. The user runs `opencode serve` (or the TUI, which starts a server internally).
2. The server exposes an **OpenAPI 3.1** HTTP API on `http://<hostname>:<port>` (default: `http://127.0.0.1:4096`), and serves interactive API docs at `/doc`.
3. Clients interact via REST endpoints and an SSE event stream.
4. OpenCode is **provider-agnostic**: it supports Anthropic, OpenAI, Google, Azure, AWS Bedrock, OpenRouter, xAI, Mistral, Groq, and more — all configured through its own config.

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

Puppet Master MUST support connecting to an OpenCode server via explicit configuration:

| Config Field | Type | Default | Description |
|---|---|---|---|
| `opencode_enabled` | `bool` | `false` | Enable/disable OpenCode provider |
| `opencode_connection_method` | `enum` | `"server"` | `server` (direct HTTP to configured host/port) or `cli_launcher` (attempt local launch/discovery via `opencode`, then connect via HTTP) |
| `opencode_host` | `string` | `"127.0.0.1"` | OpenCode server hostname |
| `opencode_port` | `u16` | `4096` | OpenCode server port |
| `opencode_cli_path` | `string` | `""` | Optional CLI launcher/discovery fallback path; if empty, resolve `opencode` from PATH |
| `opencode_username` | `string` | `"opencode"` | HTTP basic auth username |
| `opencode_password` | `string` | `""` | HTTP basic auth password (from credential store) |

**Server URL derivation:** `http://{opencode_host}:{opencode_port}`

**Connection method semantics (normative):**
- `server` is the primary and recommended mode: Puppet Master connects directly to the configured OpenCode server URL/port.
- `cli_launcher` is fallback-only behavior: Puppet Master may use `opencode` (configured path or PATH lookup) to launch/discover a local server, then all runtime calls still use HTTP/SSE.

**Non-optional transport constraint:** Regardless of connection method, OpenCode runtime transport remains **server-bridged HTTP/SSE**. Puppet Master MUST NOT treat OpenCode as a CLI-bridged provider transport.

**Secrets policy:** The password MUST NOT be stored in plain text config files. It MUST be stored in the OS credential store (same policy as other provider secrets).

ContractRef: ContractName:Plans/Architecture_Invariants.md#INV-002, PolicyRule:no_secrets_in_storage

### 5.2 Health Check

Before any run, Puppet Master MUST perform a health check:

ContractRef: ContractName:Plans/CLI_Bridged_Providers.md, ContractName:Plans/Contracts_V0.md#AuthState

```
GET /global/health
→ { "healthy": true, "version": "<version>" }
```

**Failure states from health check:**
- **Connection refused / timeout:** OpenCode server not running → emit diagnostic `provider_outage_or_network`; surface server-realm auth state as `AuthFailed` until reachable.
- **401 Unauthorized:** Auth required/credentials wrong → `LoggedOut`.
- **200 with `healthy: false`:** Server unhealthy → emit diagnostic `provider_outage_or_network`; surface server-realm auth state as `AuthFailed`.
- **200 with `healthy: true`:** Server reachable/auth OK → `LoggedIn` (OpenCode server realm).

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

The `ProviderRequestEnvelope` fields map to OpenCode API calls as follows:

| Envelope Field | OpenCode Mapping |
|---|---|
| `run_id` | Puppet Master internal correlation; not sent to OpenCode |
| `thread_id` | Maps to OpenCode session ID (create via `POST /session`) |
| `platform` | `"opencode"` |
| `transport` | `"http"` (new transport type) |
| `model_id` | `body.model.providerID` + `body.model.modelID` in prompt request |
| `mode` | `plan` → use OpenCode `plan` agent; `execute` → use OpenCode `build` agent |
| `working_directory` | Set via OpenCode project config (server runs in a specific directory) |
| `prompt_parts` | Maps to `body.parts` array in `POST /session/:id/message` |
| `tool_policy` | Maps to `body.tools` map in prompt request (tool enable/disable) |
| `timeout` | Client-side HTTP timeout |

### 6.2 Session Lifecycle → Run Lifecycle

Each Puppet Master "run" maps to one OpenCode session:

1. **Create session:** `POST /session` → `{ "title": "<run_id>" }` → returns session with `id`
2. **Send prompt:** `POST /session/:id/message` with prompt parts, model, and agent
3. **Receive response:** Synchronous response with `{ info: Message, parts: Part[] }`
4. **Or async:** `POST /session/:id/prompt_async` + listen on `GET /event` SSE stream
5. **Abort if needed:** `POST /session/:id/abort`
6. **Delete session:** `DELETE /session/:id` (cleanup after run completes)

**Process isolation policy:** Each Puppet Master iteration creates a **new OpenCode session** and deletes it after completion. No session reuse across iterations.

ContractRef: PolicyRule:CU-P2-T12 (fresh process/session per iteration)

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

ContractRef: ContractName:Plans/CLI_Bridged_Providers.md, ContractName:Plans/Contracts_V0.md#AuthState

### 6.5 Unified Provider Trait / Capability / Policy Constraints

OpenCode integration MUST satisfy the same Provider boundary rules as other providers:

- Conform to the unified Provider trait/facade contract (request envelope in, normalized event stream out).
- Publish capability flags through the shared provider capability mechanism (no OpenCode-only capability plumbing).
- Consume the same tool-policy snapshot semantics as other providers.
- Avoid UI special-casing beyond provider configuration and discovered model/auth state.
- Normalize OpenCode events/tool calls into canonical provider stream events before UI/persistence consumers.

ContractRef: ContractName:Plans/CLI_Bridged_Providers.md, ContractName:Plans/Contracts_V0.md

---

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

ContractRef: ContractName:Plans/CLI_Bridged_Providers.md, CodePath:puppet-master-rs/src/platforms/platform_specs.rs

### 7.3 Fallback Models

If dynamic model discovery fails (server unreachable), Puppet Master MUST NOT hardcode fallback models for OpenCode. Instead, surface an error: "Cannot discover models — OpenCode server unreachable."

ContractRef: ContractName:Plans/DRY_Rules.md#2, PolicyRule:Decision_Policy.md§4

**Rationale:** Unlike CLI-bridged providers where Puppet Master knows the platform's model catalog, OpenCode's available models depend entirely on the user's OpenCode configuration and authenticated providers. Hardcoding would be incorrect.

---

## 8. Capability flags

Capability flags are **SSOT in** `puppet-master-rs/src/platforms/platform_specs.rs`. This plan does not redefine them.

OpenCode-specific capability requirements (normative):
- Transport remains `http` (server-bridged).
- **Plan mode:** When `mode=plan`, Puppet Master MUST use the OpenCode `plan` agent (read-only). When `mode=execute`, use the `build` agent.
- **Provider-tool capability reporting:** OpenCode-discovered tools (from `GET /provider` and session tool lists) MUST be reported through `capabilities.get` with `category: "provider_tool"`. Each tool entry includes the same `enabled` / `disabled_reason` / `setup_hint` shape defined in `Plans/Media_Generation_and_Capabilities.md` [§1.2](Plans/Media_Generation_and_Capabilities.md#CAPABILITY-SYSTEM). This enables agents and users to discover all available OpenCode tools via capability introspection.
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

OpenCode appears in the provider list with these configuration fields:

| Field | Widget | Description |
|---|---|---|
| **Enable OpenCode** | Toggle switch | Master enable/disable |
| **Connection Method** | Segmented control / dropdown | `Direct server` or `CLI launcher/discovery fallback` |
| **Server Host** | Text input | Default: `127.0.0.1` |
| **Server Port** | Number input | Default: `4096` |
| **CLI Path (optional)** | File path input | Optional fallback path to `opencode`; used only when connection method is `CLI launcher/discovery fallback` |
| **Username** | Text input | Default: `opencode` |
| **Password** | Password input (stored in credential store) | For HTTP basic auth |
| **Sign in to Provider** | Button/link | Opens OpenCode provider auth flow (`/provider/auth` + callback path) |
| **Test Connection** | Button | Runs health check and reports status |
| **Connection Status** | Status badge | Shows `Connected`, `Disconnected`, `Auth Required`, etc. |

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

ContractRef: ContractName:Plans/DRY_Rules.md#2, CodePath:puppet-master-rs/src/platforms/platform_specs.rs

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

---

## 14. Persistence Mapping (seglog)

OpenCode runs persist to seglog using the same event types as other providers:

- `run.started` at run begin with `{ run_id, thread_id, platform: "opencode", mode, transport: "http" }`
- Tool events (`tool.invoked`, `tool.denied`) extracted from OpenCode response parts
- `usage.event` from message metadata (input/output tokens)
- `run.completed` with `{ run_id, status }` on session completion

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
