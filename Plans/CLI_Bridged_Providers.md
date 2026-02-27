# CLI-Bridged Providers (Provider Facade)

> **Compliance:** This document follows `Plans/DRY_Rules.md` and references SSOT contracts in `Plans/Contracts_V0.md`. Naming: “Puppet Master” only. No open questions; deterministic defaults per `Plans/Decision_Policy.md`.


## Purpose
Define the **Provider facade** used by Puppet Master to run **bridged providers** (CLI-bridged and server-bridged) with a single, uniform contract for:

- **Structured request envelopes** (deterministic, replayable runs)
- **Normalized streaming events** (one consumer; no UI special-casing)
- **Tool-call correlation + reconciliation** (CLI oddities tolerated)
- **Authentication / UX-state detection** (logged out, expired/invalid, rate limit, outage)

This document is architecture/contract focused. It defines *what must be true* at the Provider boundary.

## Provider routing policy (locked)
- **Cursor + Claude Code:** CLI-bridged only.
- **OpenCode:** server-bridged (HTTP REST + SSE).
- **Codex + Copilot + Gemini:** direct-provider auth/calls (OAuth/device/API key as applicable); these are outside this document's bridged transport mechanics.

ContractRef: SchemaID:Spec_Lock.json#locked_decisions.providers, ContractName:Plans/Contracts_V0.md

---

## Non-goals
- Defining the canonical persistent event model (SSOT: `Plans/storage-plan.md`).
- Defining tool schemas or the full permission table (SSOT: `Plans/Tools.md` + `Plans/FileSafe.md` + `Plans/human-in-the-loop.md`).
- UI design, widgets, or view-layer behavior.
- Execution plans / phase lists / build queues.

---

## SSOT references (DRY)
This document references only sources that exist in this repo checkout.

- **Protocol normalization + bounded buffers:** `Plans/newfeatures.md`
- **Provider CLI discovery + validation (Cursor Agent / Claude Code):** `Plans/BinaryLocator_Spec.md`
- **Persistent event log (seglog) + event envelope:** `Plans/storage-plan.md` (§2.2)
- **Tool permissions + tool events (`tool.invoked`, `tool.denied`):** `Plans/Tools.md` (§8.0, §8.2, §10.7)
- **FileSafe guards and blocking semantics:** `Plans/FileSafe.md`
- **HITL tier-boundary approvals (optional feature; default OFF for autonomous runs):** `Plans/human-in-the-loop.md`
- **Determinism + ambiguity resolution:** `Plans/Decision_Policy.md`
- **Locked provider decisions (anti-drift):** `Plans/Spec_Lock.json`
- **ContractRef coverage + drift gates:** `Plans/Progression_Gates.md` (`GATE-009`, `GATE-004`)
- **Evidence bundle schema (machine-checkable verification):** `Plans/evidence.schema.json`
- **Cross-cutting invariants:** `Plans/Architecture_Invariants.md`
- **Canonical terms:** `Plans/Glossary.md`
- **DRY + ContractRef rules:** `Plans/DRY_Rules.md`
- **Canonical contracts (events/tools/auth/UICommand):** `Plans/Contracts_V0.md`

Code anchors (current behavior / implementation baselines):
- Platform CLI data SSOT: `puppet-master-rs/src/platforms/platform_specs.rs`
- Cursor runner baseline: `puppet-master-rs/src/platforms/cursor.rs`
- Claude Code runner baseline: `puppet-master-rs/src/platforms/claude.rs`
- Auth checks baseline: `puppet-master-rs/src/platforms/auth_status.rs`
- Error categorization baseline: `puppet-master-rs/src/platforms/output_parser.rs`
- Process spawn/capture baseline: `puppet-master-rs/src/platforms/runner.rs`

> DRY note: platform-specific flags, CLI names, and capability details must remain SSOT in `platform_specs.rs`; this plan only states *contract requirements* at the Provider boundary.

---

## Canonical terminology (local index)
Canonical terminology is defined in `Plans/Glossary.md`. This section adds only provider-facade terms not currently defined there.
ContractRef: ContractName:Plans/Glossary.md, PolicyRule:Decision_Policy.md§1

- **Provider facade:** A single logical interface that accepts a request envelope and produces a normalized stream plus a terminal outcome.
- **Transport:** The concrete mechanism used to communicate with a Provider implementation (CLI subprocess, ACP, HTTP/SSE, or direct provider endpoint calls). Transport must be invisible to consumers.
- **CLI-bridged transport:** Spawn a local CLI process and normalize emitted events (`stream-json` plus optional hooks/transcript reconciliation).
- **Server-bridged transport:** Use HTTP REST + SSE against a local server process (OpenCode).
- **Direct-provider transport:** Call provider endpoints directly (no local CLI bridge in the request path).
- **Run:** One provider invocation, correlated by `run_id`.
- **Auth method taxonomy:** See `ProviderAuthMethod` in `Plans/Contracts_V0.md` (SSOT). OpenCode server-level credentials are stored in the OS credential store and used only for the OpenCode server connection.
- **Observation sources:** Inputs the Reconciler may use to build the normalized stream (stdout JSONL, stderr text, optional hooks, optional transcript).

---

## Direct-provider companion requirements

This document primarily defines bridged transports. For decision completeness, direct-provider integrations MUST follow this companion matrix:

| Provider | Transport class | Required auth paths | Notes |
|---|---|---|---|
| Codex | `DirectApi` | browser OAuth, headless device-code, API key | No SDK install flow in Puppet Master |
| GitHub Copilot | `DirectApi` | GitHub device flow (`/login/device/code` + `/login/oauth/access_token`) | Polling + auth state updates required |
| Gemini/Google | `DirectApi` | OAuth, API key, Google credential-based mode | Not a CLI subprocess path for auth/runtime |

Direct-provider integrations MUST emit the same normalized provider stream schema as bridged transports.

Direct-provider integrations MUST NOT rely on per-platform experimental feature switches in Puppet Master (GUI, config keys, or provider invocation) — experimental CLI flags and settings (for example Copilot `--experimental` or Gemini `experimental.plan` in `~/.gemini/settings.json`) are treated as legacy implementation details and MUST NOT be surfaced as experimental toggles in the Slint rewrite.

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/newtools.md, ContractName:Plans/Architecture_Invariants.md#INV-009, ContractName:Plans/rewrite-tie-in-memo.md

---

## Provider facade

### Contract shape (facade)
The Provider facade MUST be expressible as a single logical interface, regardless of Transport.
ContractRef: SchemaID:Spec_Lock.json#locked_decisions.providers, ContractName:Plans/Architecture_Invariants.md#INV-009, Gate:GATE-009

**Interface requirements (conceptual):**
- **Input:** `ProviderRequestEnvelope` (defined below).
- **Output:**
   - A **stream** of normalized provider events (defined below).
   - A **terminal outcome** represented by exactly one terminal `done` event.

**Integration requirement:**
- Callers MUST NOT branch on transport type (stream-json, ACP, or HTTP). They only consume the normalized provider stream.
ContractRef: ContractName:Plans/Architecture_Invariants.md#INV-009, SchemaID:Spec_Lock.json#locked_decisions.providers, Gate:GATE-009

### Deterministic defaults (autonomous)
To keep the system autonomous and avoid "ask humans later" drift, Puppet Master MUST adopt the following defaults whenever a caller does not specify a stricter option:
ContractRef: SchemaID:Spec_Lock.json#locked_decisions.testing_and_verification, PolicyRule:Decision_Policy.md§4, Gate:GATE-009

1. **Cursor transports under one facade:** `stream-json` and `acp`.
2. **Claude Code transport:** `stream-json`.
3. **Headless approval fallback:** If tool policy resolution is `ask` and HITL is disabled (default for autonomous runs), treat it as `deny` and emit `tool.denied` (persisted) plus a normalized `tool_result(ok=false, error="permission_denied")` before `done`.
4. **Cursor incremental output:** If the caller requests incremental text, the adapter MUST emit `text_delta` events during the run (not only at the end).
5. **Large prompt handling (Cursor):** If the fully rendered prompt exceeds 32 KiB (32768) bytes, pass the prompt via stdin (not as a CLI argument) to avoid OS argument-length and quoting drift.
ContractRef: PolicyRule:Decision_Policy.md§4, SchemaID:Spec_Lock.json#locked_decisions.testing_and_verification, ContractName:Plans/Tools.md§8.2, ContractName:Plans/Contracts_V0.md#EventRecord, CodePath:puppet-master-rs/src/platforms/cursor.rs#LARGE_PROMPT_THRESHOLD

---

## Structured request envelope

### Why an envelope (vs. raw prompt)
The existing execution request in code is the baseline (`puppet-master-rs/src/types/execution.rs`), but bridged providers require additional reproducibility-critical fields:

- Stable correlation IDs (run/thread/tool)
- Explicit tool policy snapshot (by tool IDs, not schemas)
- Explicit workspace roots/allowed directories
- Explicit prompt parts (text blocks + file references)

### ProviderRequestEnvelope (V0)
This envelope is transport-agnostic: a stream-json CLI transport and an ACP transport MUST accept the same envelope.
ContractRef: SchemaID:Spec_Lock.json#locked_decisions.providers, PolicyRule:Decision_Policy.md§2, Gate:GATE-009

| Field | Required | Description |
|---|---:|---|
| `run_id` | ✅ | Stable run correlation ID (caller-provided). |
| `thread_id` | ✅ | Stable thread correlation ID for persistence/seglog linkage (see `Plans/storage-plan.md`). |
| `platform` | ✅ | Platform selector for bridged providers covered here (Cursor, Claude Code, OpenCode). |
| `transport` | ✅ | `stream-json`, `acp`, or `http`. |
| `model_id` | ✅ | Model identifier passed through to the underlying transport runtime (CLI args for Cursor/Claude; HTTP body fields for OpenCode). |
| `mode` | ✅ | `plan` or `execute` (high-level). |
| `working_directory` | ✅ | CWD/primary workspace directory. |
| `workspace_roots` | ✅ | Ordered list of roots the provider is allowed to reference. |
| `prompt_parts` | ✅ | Ordered prompt parts: text blocks plus file references (paths/URIs). |
| `context_files` | ✅ | Explicit file attachments list for CLIs that support file attachment prompts; also used by reconciliation when available. |
| `tool_policy` | ✅ | Snapshot of tool permissions keyed by Tool ID (allow/deny/ask semantics SSOT: `Plans/Tools.md`). |
| `env` | ✅ | Environment variables to set for the provider process. |
| `timeout` | ✅ | `{ soft_ms, hard_ms }`. |
| `client_hints` | ⛔️ | Optional opaque map for transport-specific hints; see constraints below. |
| `origin` | ✅ | Identifies request source (e.g., orchestrator vs ACP client); see constraints below. |
| `provider_native_ids` | ⛔️ | Optional correlation bundle for provider-native IDs (e.g., conversation id). |

**Normative constraints:**
- The envelope MUST be sufficient to replay the provider run (modulo model nondeterminism) without referring to UI state.
- The envelope MUST be stable across transports: ACP requests MUST be convertible into the same envelope.
- The envelope MUST NOT embed tool schemas; only tool IDs and policy decisions.
- `client_hints` MUST NOT change normalized semantics (it may only affect transport mechanics).
- Behavior MUST NOT branch on `origin` (audit-only).
ContractRef: ContractName:Plans/DRY_Rules.md#2, ContractName:Plans/Tools.md, PolicyRule:Decision_Policy.md§4, Gate:GATE-009

---

## Normalized provider stream schema (V0)

### Source-of-truth
The normalized stream schema in this document is the minimal contract needed for protocol normalization (see `Plans/newfeatures.md`). Persistent storage remains SSOT in `Plans/storage-plan.md`.

### Event envelope
Each normalized event MUST use this minimal envelope:
ContractRef: ContractName:Plans/Architecture_Invariants.md#INV-001, ContractName:Plans/DRY_Rules.md#7, Gate:GATE-009

```json
{
  "run_id": "PM-2026-02-23-00-00-00-001",
  "seq": 1,
  "type": "text_delta",
  "payload": { "text": "hello" }
}
```

Rules:
- `seq` MUST be monotonically increasing per `run_id` starting at 1.
- Exactly one `done` event MUST be emitted, and it MUST be the final event.
ContractRef: ContractName:Plans/Architecture_Invariants.md#INV-001, ContractName:Plans/Progression_Gates.md#GATE-009, Gate:GATE-009

### Event types
| type | Purpose | Required payload fields |
|---|---|---|
| `text_delta` | Incremental assistant output | `text` |
| `thinking_delta` | Incremental "thinking/reasoning" output (if provider exposes it) | `text` |
| `tool_use` | Tool invocation start | `tool_use_id`, `tool_name`, `arguments` (JSON value), optional `invocation_summary` |
| `tool_result` | Tool invocation end/result | `tool_use_id`, `tool_name`, `ok` (bool), `result` (JSON value or string), optional `error` |
| `usage` | Usage updates | provider-specific usage fields (at least `input_tokens`, `output_tokens` when available) |
| `auth_state` | Auth/availability state changes | `state` (see auth state machine) |
| `diagnostic` | Non-fatal parse/adapter diagnostics | `category`, `message`, optional `details` |
| `error` | Fatal or near-fatal adapter error | `category`, `message`, optional `details` |
| `done` | Terminal event | `status` = `success` \| `cancelled` \| `failed`, optional `stop_reason` |

### Mapping principles (normative)
- **No UI special-casing:** a consumer MUST NOT need to know whether the Provider used stream-json or ACP.
- **Monotonic correlation:** every emitted event MUST include `run_id` and, where applicable, a stable `tool_use_id`.
- **Lossless where possible:** if a transport provides richer information (e.g., token usage), the adapter SHOULD emit it via `usage` events rather than dropping it.
- **Tolerant parsing:** malformed/partial lines MUST NOT crash the run; they MUST be handled by the Reconciler and surfaced as diagnostics.
ContractRef: ContractName:Plans/Architecture_Invariants.md#INV-009, ContractName:Plans/Architecture_Invariants.md#INV-001, ContractName:Plans/newfeatures.md, Gate:GATE-009

---

## Transport ingestion + mapping rules

### Common ingestion rules (normative)
- Treat provider output as untrusted input.
- Malformed/partial lines MUST NOT crash the run; surface as `diagnostic` events and continue when safe.
- Output buffering MUST be bounded (see `Plans/newfeatures.md`):
  - Cap max line length.
  - Cap total buffered bytes for "unparsed remainder".
  - Use a ring buffer for stderr diagnostics.
ContractRef: ContractName:Plans/newfeatures.md, PolicyRule:Decision_Policy.md§2, Gate:GATE-009

### stream-json ingestion (Cursor + Claude Code)
When `stream-json` is enabled, stdout MUST be treated as JSONL (one JSON object per line).
ContractRef: SchemaID:Spec_Lock.json#locked_decisions.providers, Gate:GATE-009

**Normative ingestion rules:**
- Parse each JSON object as an untrusted structure.
- Map recognized shapes into normalized events.
- If a CLI emits human text lines under stream-json, treat them as stderr-equivalent observations and emit a `diagnostic(category="mixed_mode_output")`.

> Do not standardize the raw stream-json schema here; it is CLI-owned. Only define mapping behavior.

### ACP ingestion (Cursor)
ACP transport is an alternate frontend for the same Provider semantics.

**Normative behavior:**
- ACP session lifecycle MUST map into a single `run_id`.
- ACP notifications MUST map into the same normalized stream event types.
- Consumers MUST NOT branch on whether the run used ACP or stream-json.
ContractRef: SchemaID:Spec_Lock.json#locked_decisions.providers, ContractName:Plans/Architecture_Invariants.md#INV-009, Gate:GATE-009

---

## Cursor provider

### Transports under one facade
Cursor MUST support both transports:
1. **stream-json transport**: spawn Cursor CLI and parse JSONL stdout.
2. **ACP transport**: expose an ACP agent endpoint whose internal execution engine is the same Cursor stream-json path.
ContractRef: SchemaID:Spec_Lock.json#locked_decisions.providers, ContractName:Plans/Architecture_Invariants.md#INV-009, Gate:GATE-009

Consumers MUST NOT branch on transport type.
ContractRef: ContractName:Plans/Architecture_Invariants.md#INV-009, Gate:GATE-009

### stream-json transport requirements
**CLI resolution**
- CLI resolution MUST use `platform_specs.rs` as the single source of truth for binary names and invocation flags.
ContractRef: ContractName:Plans/DRY_Rules.md#2, SchemaID:Spec_Lock.json#locked_decisions.providers, Gate:GATE-009

**Invocation shape (normative)**
- Output format MUST be `stream-json` for event-stream consumers.
ContractRef: SchemaID:Spec_Lock.json#locked_decisions.providers, Gate:GATE-009

- When incremental text is required, the adapter MUST emit `text_delta` events during the run (not only at the end).
ContractRef: ContractName:Plans/Architecture_Invariants.md#INV-009, Gate:GATE-009

**Large prompt handling**
- If the fully rendered prompt exceeds 32 KiB (32768) bytes, the adapter MUST pass the prompt via stdin (not as a CLI argument).
ContractRef: CodePath:puppet-master-rs/src/platforms/cursor.rs#LARGE_PROMPT_THRESHOLD, Gate:GATE-009

**Correlation**
- If Cursor-native correlation IDs are available, attach them to `provider_native_ids` and copy into emitted diagnostics (do not invent new normalized fields).

### ACP transport requirements
ACP transport is an alternate frontend for the same Provider.

**Normative behavior**
- ACP transport MUST:
  - accept ACP sessions and prompts,
  - convert each prompt into a `ProviderRequestEnvelope` (same contract),
  - execute via the Cursor stream-json transport internally,
  - forward normalized events back to the ACP client as ACP session updates.
ContractRef: SchemaID:Spec_Lock.json#locked_decisions.providers, ContractName:Plans/Architecture_Invariants.md#INV-009, Gate:GATE-009

---

## Claude Code provider

### Required capabilities
Claude Code MUST support:
- **stream-json transport** (CLI spawn)
- **hooks ingestion** (optional out-of-band observations)
- **transcript parsing** (optional JSONL reconciliation for usage/tool events)
ContractRef: SchemaID:Spec_Lock.json#locked_decisions.providers, PolicyRule:Decision_Policy.md§2, Gate:GATE-009

### stream-json transport requirements
**CLI resolution**
- CLI resolution MUST use `platform_specs.rs` as the single source of truth for binary names and invocation flags.
ContractRef: ContractName:Plans/DRY_Rules.md#2, Gate:GATE-009

**Invocation shape (normative)**
- The invocation MUST include `--no-session-persistence` and `--output-format stream-json`.
- If `mode=plan`, `--permission-mode` MUST be `plan` (no tool execution side effects).
- If `mode=execute`, `--permission-mode` MUST NOT require a human approval mid-run; host-side tool policy remains authoritative (SSOT: `Plans/Tools.md`).
- Working directory and allowed directories MUST be set from `working_directory`/`workspace_roots` without implicit expansion.
ContractRef: PolicyRule:Decision_Policy.md§4, ContractName:Plans/Tools.md, ContractName:Plans/DRY_Rules.md#7, Gate:GATE-009

### Hooks ingestion requirements
**Normative requirements**
- Puppet Master MUST provide a stable hook receiver command (a CLI entrypoint) that can accept hook payload JSON via stdin.
- Hook payloads MUST be ingested as observation sources for the Reconciler, not as a separate UI-only channel.
- The Provider MUST tolerate missing hooks (hooks are optional).
- If hook payloads are absent but a transcript path is available, transcript parsing MUST be used.
ContractRef: PolicyRule:Decision_Policy.md§2, Gate:GATE-009

### Transcript parsing requirements
The transcript is a JSONL file when available.

**Normative parsing behavior (strategy)**
- Parse transcript JSONL lines and extract when present:
   - model id
   - token usage
   - tool calls (`tool_use`-like objects)
- Transcript-derived tool calls and token usage MUST be reconciled against stream-json and hook-derived data:
   - If stream-json omitted usage, transcript is authoritative.
   - If stream-json omitted tool calls, transcript is authoritative.
   - If stream-json provided tool calls but lacks arguments/results, hooks/transcript MAY enrich.
ContractRef: ContractName:Plans/Architecture_Invariants.md#INV-001, Gate:GATE-009

---

## OpenCode provider

### Transport: HTTP (server-bridged)
OpenCode is a server-bridged provider backend: Puppet Master communicates via HTTP REST requests and SSE event streams with a locally-running OpenCode server, rather than spawning a CLI subprocess.

### HTTP transport requirements
- Puppet Master MUST connect to the OpenCode server at the configured `host:port` (default `127.0.0.1:4096`).
- Health checks MUST use `GET /global/health` before each run.
- Model discovery MUST use `GET /provider` (no hardcoded fallback models).
- OpenCode server docs endpoint `/doc` SHOULD be used for local diagnostics/manual verification.

### Connection method contract (OpenCode)
- **Direct server (default):** connect to configured server URL/port and run via HTTP/SSE.
- **CLI launcher/discovery fallback (optional):** use `opencode` path (or PATH lookup) only to launch/discover local server, then continue with HTTP/SSE transport.
- Consumers MUST NOT branch on direct-server vs launcher fallback; both paths emit the same normalized provider stream.

### Session lifecycle → run lifecycle
Each Puppet Master run maps to one OpenCode session:
1. **Create session:** `POST /session` → returns session `id`.
2. **Send prompt:** `POST /session/:id/message` (sync) or `POST /session/:id/prompt_async` + `GET /event` SSE (async).
3. **Receive response:** Parse response parts into normalized events.
4. **Delete session:** `DELETE /session/:id` after run completes.

Process isolation policy: each iteration creates a new session and deletes it after completion (no session reuse).

> Full integration details: `Plans/Provider_OpenCode.md`

### Acceptance criteria (OpenCode-specific)
1. When the OpenCode server is reachable, Puppet Master can create a session, prompt, receive normalized events, and delete the session through the unified Provider facade.
2. OpenCode runs produce the same normalized event types (`text_delta`, `tool_use`, `tool_result`, `usage`, `done`) as CLI-bridged provider runs — consumers do not branch on transport.
3. Health/version/auth failures map to canonical states and diagnostics: not installed, server unreachable, auth required/expired, and version mismatch.
4. OpenCode provider auth/sign-in actions use OpenCode auth surfaces (`/provider/auth` + callback endpoints) while preserving the same provider-agnostic UI command flow.

ContractRef: ContractName:Plans/Provider_OpenCode.md, ContractName:Plans/Architecture_Invariants.md#INV-009, Gate:GATE-009

---

## Tool-call correlation + reconciliation

### Correlation requirements (normative)
- Every tool call MUST have a stable `tool_use_id` for the lifetime of `run_id`.
- The tool call MUST reference:
  - a Tool ID or stable tool name,
  - timestamps for start/end when available,
  - a status lifecycle mapped into `tool_use`/`tool_result`.
ContractRef: ContractName:Plans/Architecture_Invariants.md#INV-001, ContractName:Plans/Tools.md, Gate:GATE-009

### Reconciler responsibilities (normative)
The Reconciler is a logical component that merges multi-source observations into a single normalized stream.

**Inputs (minimum):**
- stream-json stdout events
- stderr lines + exit status
- optional hooks events
- optional transcript JSONL

**Minimum oddities the Reconciler MUST handle**
1. **Malformed JSON lines / partial lines**
   - Strategy: line-buffer with recovery; when a line fails JSON parse, attempt limited concatenation with subsequent lines; otherwise emit `diagnostic(category="malformed_jsonl")` and continue.

2. **Out-of-order tool events**
   - Strategy: if a tool result appears without a captured start event, synthesize a `tool_use` immediately before the `tool_result` (arguments = null).

3. **Missing tool result**
    - Strategy: on run completion, any open tool call MUST be closed by synthesizing `tool_result(ok=false, error="missing_tool_result")` before `done`.

4. **Duplicate emissions (retries / replays)**
   - Strategy: idempotency by `(run_id, tool_use_id, phase)`; duplicate identical events are dropped; conflicting duplicates are emitted as `diagnostic(category="conflicting_duplicate")`.

5. **Mixed-mode output**
    - Strategy: non-JSON lines under stream-json are treated as stderr-equivalent observations and mapped into `diagnostic(category="mixed_mode_output")`.
ContractRef: ContractName:Plans/newfeatures.md, ContractName:Plans/Architecture_Invariants.md#INV-001, Gate:GATE-009

---

## Login/auth UX detection state machine

### State model (normative)
Bridged providers MUST expose an auth/availability state machine. This is not UI logic; it is a normalized signal for consumers.
ContractRef: ContractName:Plans/Contracts_V0.md#AuthState, ContractName:Plans/Architecture_Invariants.md#INV-002, Gate:GATE-009

**Auth lifecycle states (canonical):**
- `LoggedOut`
- `LoggingIn`
- `LoggedIn`
- `LoggingOut`
- `AuthExpired`
- `AuthFailed`

**Non-auth signals (do not extend the auth state enum):**
- Rate limiting and provider/network outages MUST be surfaced via `diagnostic(...)` events and/or terminal `done.stop_reason` (e.g. `rate_limited`, `provider_outage_or_network`).

### Detection signals (normative)
Providers MUST use a layered approach:
ContractRef: PolicyRule:Decision_Policy.md§2, Gate:GATE-009

1. **Preflight auth check (authoritative when available)**
   - Cursor and Claude Code: the adapter MUST run a preflight auth check before spawning the CLI when the provider supports it (SSOT implementation anchor: `puppet-master-rs/src/platforms/auth_status.rs`).

2. **In-run error classification**
    - Use the existing error categorization baseline over stderr + emitted error payloads to classify rate limit vs auth vs outage.

3. **Exit-code + known CLI UX strings**
    - If the CLI exits non-zero and output contains known "login required" signals, treat as `LoggedOut`.
    - If output indicates token expired / refresh needed, treat as `AuthExpired`.

4. **HTTP status + health endpoints (server-bridged)**
   - OpenCode: `GET /global/health` with HTTP 401 MUST map to `LoggedOut`.
   - OpenCode: connection refused/timeout/unhealthy responses MUST emit `diagnostic(category="provider_outage_or_network")` and MUST NOT redefine the auth lifecycle state set.

### Transition rules (minimum)
- Initial (no cached state) → `LoggedOut` until proven otherwise.
- Any state → `LoggedIn` if preflight says authenticated.
- Any state → `LoggedOut` if preflight says not authenticated / login required.
- `LoggedIn` → `AuthExpired` if auth failure occurs during run.
- `LoggingIn` / `LoggingOut` are used only while an explicit login/logout action is in progress.

**Output requirement**
- Auth state changes MUST be emitted as `auth_state` events.
- If the run must abort due to auth/rate limit, the terminal `done` event MUST include `stop_reason` set to `auth_required`, `rate_limited`, or `provider_outage_or_network`.
ContractRef: ContractName:Plans/Contracts_V0.md#EventRecord, ContractName:Plans/Architecture_Invariants.md#INV-002, Gate:GATE-009

---

## Call flows

### Stream-json run (Cursor / Claude Code)
1. Caller constructs `ProviderRequestEnvelope`.
2. Provider selects stream-json Transport.
3. Provider spawns CLI process.
4. Provider reads stdout as JSONL and stderr as text.
5. Reconciler merges observations into normalized events.
6. Provider emits terminal `done` and ensures all open tool calls are closed.

### Cursor ACP session
1. ACP client connects and performs initialize/capability negotiation.
2. Provider creates an ACP session mapping to `run_id`.
3. ACP client sends prompt; Provider converts to `ProviderRequestEnvelope`.
4. Provider executes internal Cursor stream-json run.
5. Provider maps normalized events back to ACP session update notifications.
6. Provider closes session with terminal `done`.

### Claude Code hooks + transcript
1. Provider launches Claude Code stream-json run.
2. If hooks are installed, Claude emits hook events carrying session metadata and transcript path.
3. Provider ingests hook payloads as observations.
4. Provider parses transcript JSONL as observations (token usage + tool calls).
5. Reconciler produces one normalized event stream.

### OpenCode HTTP/SSE run
1. Provider runs `GET /global/health` preflight against configured OpenCode server.
2. Provider creates a session (`POST /session`) mapped to `run_id`.
3. Provider sends prompt (`POST /session/:id/message` or `POST /session/:id/prompt_async` + `GET /event` SSE).
4. Provider maps OpenCode parts/events into normalized provider events.
5. Provider deletes the session (`DELETE /session/:id`) and emits terminal `done`.

---

## Persistence mapping (seglog)
Persistent storage is SSOT in `Plans/storage-plan.md`. This section only states the required mapping from normalized provider runs to seglog event types that already exist in that plan.

Minimum required persistence:
- Emit `run.started` at run begin with `{ run_id, thread_id, platform, mode }`.
- Emit `usage.event` for any usage updates that can be normalized.
- Emit tool analytics events per `Plans/Tools.md`:
  - `tool.invoked` when a tool completes (allowed and executed) with required payload fields.
  - `tool.denied` when policy blocks (deny) or user declines (ask) with required payload fields.
- Emit `run.completed` exactly once with `{ run_id, status }` and an optional usage summary.

---

## Acceptance criteria (testable)
Acceptance criteria are written to be testable by an agent/verifier that can run a provider and inspect the resulting seglog (NDJSON) per `Plans/storage-plan.md`.

### Provider facade
1. A single Provider facade can be invoked for Cursor and Claude Code without consumer branching on transport.
2. A run produces a normalized stream with monotonically increasing `seq` and exactly one terminal `done` event.

### Cursor
3. Cursor stream-json transport uses `--output-format stream-json` and produces `text_delta` events when incremental output is available.
4. Cursor ACP transport produces the same normalized event types as stream-json for equivalent interactions.

### Claude Code
5. Claude Code stream-json transport runs with `--no-session-persistence`, `--permission-mode` derived from `mode`, and `--output-format stream-json`.
6. If hook payloads are present, tool usage and session metadata are ingested and reflected via normalized events and/or seglog tool events.
7. If a transcript JSONL exists, token usage and tool call counts derived from the transcript are used to fill missing stream-json usage/tool gaps.

### Reconciler
8. Malformed JSONL lines do not crash the run; `diagnostic(category="malformed_jsonl")` is emitted and the run continues.
9. Tool calls are always properly paired (`tool_use`/`tool_result`) after reconciliation, even if the CLI omitted an event.
10. Duplicate events are deduplicated idempotently by `(run_id, tool_use_id, phase)`.

### Auth/UX detection
11. Preflight auth checks match the existing auth status checker baselines for Cursor and Claude Code.
12. In-run errors categorized by the existing error categorization baseline cause the provider to emit `auth_state` changes and terminate with appropriate `stop_reason` when required.

### Persistence
13. For any run, seglog contains `run.started` followed by exactly one `run.completed` for the same `run_id`.
14. Tool activity results in `tool.invoked` and/or `tool.denied` events with the payload shapes defined in `Plans/Tools.md` §8.0.

---

## References
- `Plans/newfeatures.md`
- `Plans/storage-plan.md`
- `Plans/Tools.md`
- `Plans/FileSafe.md`
- `Plans/human-in-the-loop.md`
- `Plans/Decision_Policy.md`
- `Plans/Spec_Lock.json`
- `Plans/Progression_Gates.md`
- `Plans/evidence.schema.json`
- `Plans/Architecture_Invariants.md`
- `Plans/Glossary.md`
- `Plans/DRY_Rules.md`
- `Plans/Contracts_V0.md`
- `puppet-master-rs/src/platforms/platform_specs.rs`
- `puppet-master-rs/src/platforms/cursor.rs`
- `puppet-master-rs/src/platforms/claude.rs`
- `puppet-master-rs/src/platforms/auth_status.rs`
- `puppet-master-rs/src/platforms/output_parser.rs`
- `puppet-master-rs/src/platforms/runner.rs`
- `Plans/Provider_OpenCode.md`
