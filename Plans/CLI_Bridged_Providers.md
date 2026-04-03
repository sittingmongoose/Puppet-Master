# CLI-Bridged Providers (Provider Facade)

> **Compliance:** This document follows `Plans/DRY_Rules.md` and references SSOT contracts in `Plans/Contracts_V0.md`. Naming: “Puppet Master” only. No open questions; deterministic defaults per `Plans/Decision_Policy.md`.


## Purpose
Define the **Provider facade** used by Puppet Master to run **bridged providers** (CLI-bridged and server-bridged) with a single, uniform contract for:

- **Structured request envelopes** (deterministic, replayable runs)
- **Normalized streaming events** (one consumer; no UI special-casing)
- **Tool-call correlation + reconciliation** (CLI oddities tolerated)
- **Authentication / UX-state detection** (logged out, expired or invalid, rate limit, outage)
- **Stream resilience** (bounded retry, replay safety, and circuit breaking)

ContractRef: ContractName:Plans/Executor_Protocol.md, ContractName:Plans/Contracts_V0.md

This document owns bridged-provider transport normalization only. PM-internal child orchestration, crew control, runtime ceilings, and parent/child lineage remain owned by `Plans/orchestrator-subagent-integration.md` and `Plans/Contracts_V0.md`.

ContractRef: ContractName:Plans/orchestrator-subagent-integration.md, ContractName:Plans/Contracts_V0.md

Canonical mapping SSOT for upstream external-framework and A2A bridge concepts is `Plans/Provider_Stream_Mapping_External_Reference_A2A.md`. That document is external-reference guidance for adapter implementors. It MUST NOT be interpreted as approval to move PM-internal orchestration or child-run control onto A2A semantics.

ContractRef: ContractName:Plans/Provider_Stream_Mapping_External_Reference_A2A.md, ContractName:Plans/orchestrator-subagent-integration.md
## Provider routing policy (locked)

Provider routing must preserve PM child-run canon while making surface-specific behavior explicit.

ContractRef: ContractName:Plans/Models_System.md, ContractName:Plans/Tools.md, ContractName:Plans/Run_Modes.md

Routing rules:
- explicit user or command requests for a child runtime surface do not silently fallback.
- implicit orchestrator-selected child surfaces may fallback to another compatible surface.
- requested versus effective runtime surface must remain visible in metadata.
- `gemini` direct and `gemini-cli` are separate runtime surfaces.
- Copilot-native child routing is a special exception governed by PM policy rather than generic provider compatibility logic.

ContractRef: ContractName:Plans/Provider_OpenCode.md, ContractName:Plans/assistant-chat-design.md, ContractName:Plans/FinalGUISpec.md
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
This doc owns the CLI-bridged provider surfaces only. Direct-provider canon lives in the companion owner docs, but every bridged provider section here must preserve the same requested/effective runtime vocabulary and additive runtime fields.

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/Multi-Account.md

Companion split rules:
- `Gemini` direct and `Gemini CLI` are separate provider entries.
- `Codex` and `GitHub Copilot` are direct providers and MUST NOT be reintroduced here as CLI runtime rows.
- `provider_family_id` groups related surfaces but does not replace the concrete provider entry id.
- bridged providers must surface the same canonical requested/effective base fields plus the additive runtime-platform, billing/entity, and connection-profile fields when they apply.

ContractRef: ContractName:Plans/Models_System.md, ContractName:Plans/usage-feature.md, ContractName:Plans/Provider_OpenCode.md
## Provider facade

### Contract shape (facade)
The Provider facade MUST be expressible as a single logical interface, regardless of Transport.

ContractRef: SchemaID:Spec_Lock.json#locked_decisions.providers, ContractName:Plans/Architecture_Invariants.md#INV-009, Gate:GATE-009

**Interface requirements (conceptual):**
- **Input:** `ProviderRequestEnvelope` (defined below).
- **Output:**
  - a **stream** of normalized provider events
  - exactly one terminal `done` event
- callers MUST NOT branch on transport type (`stream-json`, ACP, HTTP, or future bridged surfaces). They consume the normalized provider stream plus the canonical capability contract below.

ContractRef: ContractName:Plans/Architecture_Invariants.md#INV-009, ContractName:Plans/Contracts_V0.md, Gate:GATE-009

**Capability advertisement (minimum canonical fields):**
- `dae_allowed`
- `cache_with_oauth`
- `supports_incremental_text`
- `supports_parallel_tools`
- `supports_assistant_message_prefill`
- `supports_reasoning_stream`
- `supports_resume_cursor`
- `max_payload_bytes?`
- `system_role_name?`
- `requires_developer_role_channel?`

ContractRef: ContractName:Plans/Models_System.md, ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/Tools.md

Rules:
- callers and prompt assembly MUST consume these capability fields instead of branching on provider-family strings
- absence of a boolean capability means `false`
- `max_payload_bytes` is the canonical upper bound for rendered request payload before stdin / file indirection / segmentation rules apply
- `system_role_name` and `requires_developer_role_channel` define how PM maps system and developer instructions on that surface without surface-specific caller logic
- capability advertisement is immutable for the effective `(provider_id, effective_surface, model family)` during a run attempt

ContractRef: ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/Models_System.md, ContractName:Plans/Architecture_Invariants.md

#### Adapter-owned normalization and payload-preflight contract

The facade owns the compatibility pipeline needed to make those capabilities operational:
- adapters normalize provider-specific message shapes before downstream policy consumes them
- adapters own tool-call parsing and malformed-tool diagnostics before runtime/tool policy decides whether a call is executable
- adapters own schema sanitization and payload-limit preflight decisions rather than pushing surface quirks into callers
- if rendered payload size would exceed `max_payload_bytes`, the adapter chooses the canonical fallback (stdin, file indirection, segmentation, or fail-closed rejection) and emits a structured diagnostic describing the chosen path

ContractRef: ContractName:Plans/Tools.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/Architecture_Invariants.md

Provider-specific compatibility logic is explicit, not implicit. Consumers rely on the normalized facade contract rather than branching on provider-family quirks such as message-role mapping, tool-call wrapper syntax, or payload-shape cleanup.

ContractRef: ContractName:Plans/Models_System.md, ContractName:Plans/Provider_Stream_Mapping_External_Reference_A2A.md, ContractName:Plans/CLI_Bridged_Providers.md

### Deterministic defaults (autonomous)
To keep the system autonomous and avoid "ask humans later" drift, Puppet Master MUST adopt the following defaults whenever a caller does not specify a stricter option:

ContractRef: SchemaID:Spec_Lock.json#locked_decisions.testing_and_verification, PolicyRule:Decision_Policy.md§4, Gate:GATE-009

1. **Cursor transports under one facade:** `stream-json` and `acp`.
2. **Claude Code transport:** `stream-json`.
3. **Headless approval fallback:** If tool policy resolution is `ask` and HITL is disabled, treat it as `deny` and emit `tool.denied` plus a normalized `tool_result(ok=false, error="permission_denied")` before `done`.
4. **Cursor incremental output:** If the caller requests incremental text, the adapter MUST emit `text_delta` events during the run.
5. **Large prompt handling (Cursor):** If the fully rendered prompt exceeds 32 KiB, pass the prompt via stdin rather than a CLI argument.
6. **Developer-role fallback:** If a surface lacks a dedicated developer-role channel, PM maps developer instructions through the advertised `system_role_name` or equivalent system-role path for that surface and records the effective mapping in diagnostics.

ContractRef: ContractName:Plans/Tools.md, ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/Contracts_V0.md

### Credential source precedence
Credential resolution MUST prefer explicit runtime configuration over stored login state:
- explicit config, environment, or launch-supplied credentials for the requested provider/surface win over stored OAuth state
- stored OAuth or credential-store state MAY satisfy missing credentials only for the same provider, scope, and account identity
- interactive login is the fallback only when neither explicit config nor valid stored state can satisfy the request
- adapters MUST emit diagnostics when explicit config shadows stored state, and they MUST NOT silently replace the requested account with a different stored account

ContractRef: ContractName:Plans/GitHub_API_Auth_and_Flows.md, ContractName:Plans/Multi-Account.md, ContractName:Plans/Architecture_Invariants.md

## Structured request envelope

### Why an envelope (vs. raw prompt)
The existing execution request in code is the baseline (`puppet-master-rs/src/types/execution.rs`), but bridged providers require additional reproducibility-critical fields:

- Stable correlation IDs (run/thread/tool)
- Explicit tool policy snapshot (by tool IDs, not schemas)
- Explicit workspace roots/allowed directories
- Explicit prompt parts (text blocks + file references)

### ProviderRequestEnvelope (V0)

The ProviderRequestEnvelope must carry enough child-run identity to keep PM lineage canonical across bridged providers.

Required fields for child-run execution:
- `run_id`
- `thread_id`
- `parent_run_id?`
- `child_run_id?`
- `attempt_id?`
- requested/effective Persona fields
- requested/effective runtime surface fields
- requested/effective model and effort fields
- capability and permission snapshot refs
- lineage-preserving prompt parts and attachment refs

ContractRef: ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/storage-plan.md

The bridged-provider envelope must not collapse PM lineage into provider-native session identity.

ContractRef: ContractName:Plans/Provider_OpenCode.md, ContractName:Plans/Tools.md, ContractName:Plans/Contracts_V0.md
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
| `tool_result` | Tool invocation end/result | `tool_use_id`, `tool_name`, `ok` (bool), `result` (JSON value or string), optional `error`, optional `mutated_paths` |
| `usage` | Usage updates | provider-specific usage fields (at least `input_tokens`, `output_tokens` when available) |
| `auth_state` | Auth/availability state changes | `state` (see auth state machine) |
| `diagnostic` | Non-fatal parse/adapter diagnostics | `category`, `message`, optional `details` |
| `error` | Fatal or near-fatal adapter error | `category`, `message`, optional `details` |
| `done` | Terminal event | `status` = `success` \| `cancelled` \| `failed`, `outcome` = `done.ok` \| `done.failed` \| `done.deferred` \| `done.rotated` \| `done.gutter`, optional `stop_reason` |

### Mapping principles (normative)
- **No UI special-casing:** a consumer MUST NOT need to know whether the Provider used stream-json or ACP.
- **Monotonic correlation:** every emitted event MUST include `run_id` and, where applicable, a stable `tool_use_id`.
- **Lossless where possible:** if a transport provides richer information (e.g., token usage), the adapter SHOULD emit it via `usage` events rather than dropping it.
- **Tolerant parsing:** malformed/partial lines MUST NOT crash the run; they MUST be handled by the Reconciler and surfaced as diagnostics.
ContractRef: ContractName:Plans/Architecture_Invariants.md#INV-009, ContractName:Plans/Architecture_Invariants.md#INV-001, ContractName:Plans/newfeatures.md, Gate:GATE-009

### Extended mapping semantics (normative)

- **HITL pause semantics:** When a Provider signals `input_required`, the adapter emits a `diagnostic` event (category `input_required`). This is a non-terminal pause: no `done` event is emitted, and the `seq` counter continues from the pause point when input is provided.
- **Artifact identity and chunk semantics:** Artifact identity (`artifact_id`), append/last-chunk flags, and part kind MUST be preserved in `diagnostic.details` so that consumers can reconstruct artifact assembly without transport-specific knowledge.
- **Chat-log projection:** A chat-log view MAY be derived from the normalized stream by filtering `text_delta` events. This projection exists as a debug-only view and MUST NOT be treated as the canonical event history.
- **HTE breach handling:** When `execution_strategy = hte`, any provider-originated `tool_use` is a policy breach. The adapter MUST finalize the run with `done.status = failed`, `done.outcome = done.failed`, and `done.stop_reason = kill.hte_tool_observed`.
- **Live mutation metadata:** DAE-eligible providers MUST surface enough live mutation data for write-thrash accounting. When path-level mutation information is available, mutating `tool_result` events SHOULD populate `mutated_paths[]`.

Canonical mapping SSOT for upstream external-framework and A2A bridge concepts: `Plans/Provider_Stream_Mapping_External_Reference_A2A.md`.

### Strategy signaling and DAE eligibility (normative)
- Every provider request MUST carry `run_mode`, `execution_strategy`, `strategy_resolution_reason`, and `budget`.
- HTE adapters MUST select the provider's most restrictive available **no-tools / no-side-effect** posture for the chosen transport.
- Providers MUST expose a policy/capability snapshot field `dae_allowed: bool`. Absence means `false`.
- `dae_allowed = true` is valid only when the provider supports deterministic pre-spawn restriction, jailed working-directory injection, and enough mutation observation for DAE audit/reconciliation. Providers lacking those guarantees MUST advertise `dae_allowed = false`.

ContractRef: ContractName:Plans/CLI_Bridged_Providers.md, ContractName:Plans/human-in-the-loop.md, ContractName:Plans/Provider_Stream_Mapping_External_Reference_A2A.md, Gate:GATE-009

---

## Transport ingestion + mapping rules

### Common ingestion rules (normative)
- Treat provider output as untrusted input.
- Malformed or partial lines MUST NOT crash the run; surface them as `diagnostic` events and continue when safe.
- Output buffering MUST be bounded:
  - cap max line length
  - cap total buffered bytes for unparsed remainder
  - use a ring buffer for stderr diagnostics

ContractRef: ContractName:Plans/newfeatures.md, PolicyRule:Decision_Policy.md§2, Gate:GATE-009

- Adapters MUST buffer partial provider chunks until a stable parse or text boundary exists; they MUST NOT emit torn UTF-8, torn JSON tokens, or duplicate already committed normalized events.
- If provider fragments arrive out of order and deterministic reordering is possible within a bounded local buffer, the adapter MAY reorder by provider sequence or part identity before emission.
- If deterministic reordering is impossible, the adapter MUST emit a diagnostic describing the gap and either preserve arrival order or terminate the attempt when replay safety would otherwise be violated; it MUST NOT invent missing content.

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Architecture_Invariants.md

- Buffer overflow, mixed-mode output, or unparseable tail data MUST surface as diagnostics with enough metadata for replay and debugging.
- Bounded buffering applies equally to stdout fragments, stderr observations, and reasoning-only substreams.
- Provider-specific chunk-boundary buffering MAY coalesce partial fragments, but it MUST preserve monotonic event correlation and MUST NOT hide dropped bytes behind success-shaped output.

ContractRef: ContractName:Plans/Executor_Protocol.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/Run_Modes.md

- If a provider stops with `finishReason=length` or an equivalent truncation signal while a correlated tool call is incomplete, the adapter MUST close that tool correlation with a structured truncation failure and MUST NOT dispatch or synthesize the missing invocation.
- Empty, whitespace-only, or bounds-invalid arguments discovered after truncation remain validation failures; adapters MUST surface them as structured errors instead of retrying malformed input.

ContractRef: ContractName:Plans/Tools.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/Run_Modes.md

- Bridged adapters MUST map provider finish reasons into the normalized stream before retry, compaction, or synthetic-continue logic so downstream runtime policy can distinguish truncation, content filtering, safety stops, auth failures, and normal completion.

ContractRef: ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/Executor_Protocol.md, ContractName:Plans/Contracts_V0.md

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

`cursor-agent` is the runtime target for PM's Cursor CLI integration.

PM-owned account isolation for Cursor CLI is defined by a managed home/config/data/cache root for the child runtime, not by editor-style `--user-data-dir` launch tricks.

ContractRef: ContractName:Plans/Multi-Account.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/storage-plan.md

### stream-json / ACP requirements

Cursor runtime rules:
- PM may ingest Cursor stream output and ACP output under one facade, but the account boundary is still the managed `cursor-agent` profile root.
- `cursor-agent login` is the default browser-auth entry path.
- top-level API key usage remains an advanced, non-default setup path.
- trust is an operational state, not a hidden implementation detail; a row may be authenticated yet still not operational for a given workspace until trust or runtime validation is complete.

ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/usage-feature.md, ContractName:Plans/Prompt_Pipeline.md

### MCP and instruction projection requirements

MCP and instruction ownership rules for Cursor:
- PM owns the canonical MCP registry and canonical shared instructions.
- durable Cursor-facing MCP config is generated into the PM-managed Cursor profile root.
- project-local `.cursor/mcp.json` or `.cursor/rules/*.mdc` projections are generated only when the active workspace actually needs them.
- `.cursor/rules/*.mdc` is the primary Cursor rules surface; `.cursorrules` is compatibility only.
- PM repairs only PM-owned generated files and must surface drift instead of silently overwriting user-managed files.

ContractRef: ContractName:Plans/Tools.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/storage-plan.md
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

OpenCode remains a bridged provider under this facade, but PM canon stays child-run-based.

ContractRef: ContractName:Plans/Provider_OpenCode.md, ContractName:Plans/Models_System.md, ContractName:Plans/Tools.md

Rules:
- OpenCode child-session or task-session behavior is additive correlation data for PM child runs.
- PM thread and run identity are not remapped to OpenCode session ids.
- OpenCode-specific cache, billing, and correlation behavior belongs in the OpenCode adapter, not in generic bridged-provider routing.
- provider-native agent definitions remain interoperability inputs rather than PM runtime canon.
## Tool-call correlation + reconciliation

Tool-call correlation and provider reconciliation are UUID-first, failure-class-aware, and transport-independent. The same rules apply to CLI-bridged, server-bridged, and direct provider adapters.

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Executor_Protocol.md

### Tool call identity invariants

- Every normalized tool call MUST have a UUID `tool_use_id`.
- Name+input deduplication MUST NOT be used as a substitute for identity.
- If a provider emits a non-UUID identifier, PM wraps it with a UUID and preserves the provider ID separately as diagnostic correlation metadata.
- Duplicate IDs in the same logical response are a protocol error and MUST be surfaced as diagnostics.

ContractRef: ContractName:Plans/Tools.md, ContractName:Plans/Architecture_Invariants.md

### Normalized usage event minimum fields

The normalized `usage` event MUST preserve the canonical billing/token fields when known:

ContractRef: ContractName:Plans/usage-feature.md, ContractName:Plans/Models_System.md

| Field | Requirement |
|---|---|
| `input_tokens` | required when provider exposes usage |
| `output_tokens` | required when provider exposes usage |
| `cache_read_input_tokens` | preserve separately; do not fold into output |
| `cache_creation_input_tokens` | preserve separately |
| `reasoning_tokens` | preserve separately |
| `total_tokens` | MAY be derived, but never as a replacement for the individual buckets |
| `cost_microdollars` | integer microdollars only |
| `pricing_version` | include when pricing metadata is versioned |
| `provider_id`, `model_id` | preserve provider/model identity when known |
| `account_id`, `billing_entity_id`, `entitlement_class` | preserve account, billing, and entitlement identity when known; bridge adapters MUST NOT collapse this tuple to billing entity alone |

ContractRef: ContractName:Plans/usage-feature.md, ContractName:Plans/Models_System.md, ContractName:Plans/Contracts_V0.md

### FinishReason mapping

| Provider finish state | Normalized handling |
|---|---|
| `FinishReasonUnknown` + empty content + no tool calls | error; map to `failure_class=provider_transient` |
| `FinishReasonUnknown` + non-empty content | complete with warning diagnostic |
| `FinishReasonContentFilter` | terminal `done.failed` with explicit content-filter reason |
| `FinishReasonSafety` | terminal `done.failed` with explicit safety reason |
| `length` with incomplete `tool_use` | synthesize `tool_result(ok=false, error=truncated_by_length)` and DO NOT dispatch the tool |
| missing finish reason | treat as `FinishReasonUnknown` |

ContractRef: ContractName:Plans/Run_Modes.md, ContractName:Plans/Contracts_V0.md

### HTTP/status to failure-class mapping
| Condition | Normalized `failure_class` | Retry posture |
|---|---|---|
| 401 / expired credential | `auth_expired` | refresh once, rebuild client, retry once |
| 403 / explicit denial | `permission_denied` | no auto-retry |
| 402 / quota exceeded | `quota_exceeded` | no auto-retry; surface upgrade or entitlement-remediation guidance |
| 429 / rate limit | `rate_limited` | retry using `Retry-After` when present; otherwise wait 30 seconds before bounded retry continues |
| 5xx / transport transient | `provider_transient` | retry per bounded transient matrix |
| malformed structured output | `structured_output_invalid` | retry up to class limit without mutating request semantics |

ContractRef: ContractName:Plans/Executor_Protocol.md, ContractName:Plans/GitHub_API_Auth_and_Flows.md, ContractName:Plans/Run_Modes.md

Failure-class rules:
- `auth_expired` retry is allowed only after token refresh and transport rebuild
- `rate_limited` remains distinct from `provider_transient`; consumer policy MUST preserve that distinction when deciding backoff, surfacing status, or opening breakers
- `permission_denied`, `quota_exceeded`, user cancellation, and content-filter outcomes never auto-retry
- retry posture is keyed from canonical `failure_class`, never from substring matching on raw error text

ContractRef: ContractName:Plans/Architecture_Invariants.md, ContractName:Plans/Run_Modes.md, ContractName:Plans/Contracts_V0.md
### Stream cancellation and replay safety
`ctx.Err() != nil` means the request context was cancelled or timed out. Cancellation is terminal for that attempt and is never retried. Reversing this check creates indefinite retry loops on cancelled streams.

ContractRef: ContractName:Plans/Executor_Protocol.md, ContractName:Plans/Run_Modes.md

Reconnect and resume contract:
- automatic reconnect or resume is allowed only for `provider_transient` failures while request budget remains
- retry count is capped at 3 attempts per request
- backoff uses `Retry-After` when present; otherwise the default transient schedule is 1s, 2s, then 4s with +/-25% jitter
- retries caused by `rate_limited` outcomes honor `Retry-After` when present; otherwise they wait 30 seconds before the bounded retry policy continues
- retry MUST preserve the same `run_id`, `thread_id`, request envelope hash, tool-policy snapshot, and attachment lineage
- retry MUST NOT silently rewrite the prompt, swap runtime surfaces, or drop previously authorized tool context
- cancellation emits an explicit structured diagnostic or terminal record that preserves the cancellation reason before teardown

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Models_System.md, ContractName:Plans/Architecture_Invariants.md

Replay safety:
- if the provider exposes a resume cursor or equivalent checkpoint, PM resumes from that cursor instead of resubmitting from the beginning
- if resume is unavailable, PM may replay only after de-duplicating already committed normalized events by canonical sequence and payload identity
- terminal `done`, committed `tool_use`, and committed `tool_result` events MUST NOT be emitted twice during replay
- partial stream fragments that cannot be replayed without duplication escalate to terminal failure instead of silent best-effort merging

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Contracts_V0.md

Circuit breaker:
- breaker key is `(provider_id, effective_surface, model_id)`
- 5 `provider_transient` failures within 120 seconds open the breaker
- while open, new requests fail fast with an explicit degraded-state diagnostic rather than hammering the provider
- breaker moves to half-open after 30 seconds and allows one probe request
- a successful probe closes the breaker; a failed probe reopens it
- `auth_expired`, `permission_denied`, `quota_exceeded`, `rate_limited`, and explicit user cancellation do not count toward the breaker

ContractRef: ContractName:Plans/Architecture_Invariants.md, ContractName:Plans/GitHub_API_Auth_and_Flows.md, ContractName:Plans/Run_Modes.md
### Provider guard rails
Providers and adapters MUST fail safely on malformed or partial input:
- guard `choices.len() == 0` before indexing provider output
- fail fast when client construction returns nil / invalid transport handles
- validate malformed tool-call JSON at storage time, not only at replay time
- bounds-check MIME and other parser splits before indexing into tokens
- emit required fields in tool schemas; omitting provider-required fields is an adapter bug
- retry decisions use structured codes or status classes, never substring matching on raw error text

ContractRef: ContractName:Plans/Tools.md, ContractName:Plans/Architecture_Invariants.md

Payload and parser safety rules:
- adapter-owned message normalizers, tool-call parsers, schema sanitizers, and payload-limit preflight checks are part of the owner contract, not optional implementation detail
- payload preflight MUST fail closed when no canonical fallback keeps the request within the advertised surface limits
- parser recovery MAY salvage partial output only when causal ordering and replay safety remain intact; otherwise the adapter emits a structured diagnostic and terminates the attempt
- compatibility rewrites MUST preserve a warning trail describing which provider-specific cleanup path ran and whether semantics changed

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/Tools.md

### Credential refresh and cache markers

Credential refresh and cache-marker behavior is proactive rather than reactive:
- when a token has 20% or less of its original TTL remaining, or a provider-specific safety window is stricter, the adapter refreshes before the next request rather than waiting for a mid-run auth failure
- a successful refresh MUST rebuild the HTTP client or equivalent transport object before the next request is sent
- refresh failure preserves explicit auth diagnostics and MUST NOT silently downgrade to stale-token execution

ContractRef: ContractName:Plans/GitHub_API_Auth_and_Flows.md, ContractName:Plans/Models_System.md, ContractName:Plans/Architecture_Invariants.md

Credential precedence and cache rules:
- explicit config or environment credentials override stored OAuth state for the same surface
- stored OAuth state MUST NOT silently override the requested account, provider surface, or credential source
- when a provider/runtime surface advertises `cache_with_oauth=false`, the adapter strips or suppresses cache markers rather than sending a request known to fail
- when a provider family requires explicit cache-boundary annotations or cached-content handles to realize prompt caching, the adapter MUST emit the provider-specific marker or handle rather than passively assuming server defaults

ContractRef: ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/GitHub_API_Auth_and_Flows.md, ContractName:Plans/Contracts_V0.md

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
- Emit `run.started` at run begin with `{ run_id, thread_id, platform, node_id?, mode, strategy, strategy_resolution_reason }`.
- Emit `usage.event` for any usage updates that can be normalized.
- Emit tool analytics events per `Plans/Tools.md`:
  - `tool.invoked` when a tool completes (allowed and executed) with required payload fields.
  - `tool.denied` when policy blocks (deny) or user declines (ask) with required payload fields.
- Emit `run.completed` exactly once with `{ run_id, status, outcome, stop_reason?, budget_key?, budget_limit?, observed_value? }` and an optional usage summary.

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/Tools.md

---

**Usage on message/turn and cost_usage:** Usage may be stored on message/turn for per-thread display. The cost_usage runtime artifact (Plans/Runtime_Artifacts_Panel.md) reuses the same canonical schema as usage.event; there is no second canonical store.
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

## Bridged Provider Runtime Reconciliation Addendum (2026-03-09)

Bridged providers must preserve canonical runtime identity and taxonomy.

### Required correlation fields
For every bridged attempt preserve:
- `run_id`
- `thread_id`
- `node_id`
- `attempt_id`
- `retry_count`
- requested/effective provider-model identifiers
- `permission_snapshot_id`
- `failure_class` when classified
- `safe_point_id?`
- remediation lineage identifiers when present, including `remediation_root_id?`
- `replan_generation`

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Multi-Account.md, ContractName:Plans/Executor_Protocol.md

### Required signal mapping
Bridged providers must emit enough normalized output for the shared runtime taxonomy to classify outcomes while preserving canonical runtime identity.

**Concrete provider/runtime identity:**
- `requested_platform` / `effective_platform` identify the concrete runtime surface used for the attempt.
- Gemini remains split into two concrete platforms:
  - `gemini` — Gemini Direct
  - `gemini_cli` — Gemini CLI
- `provider_family_id = gemini` is additive grouping metadata only; it MUST NOT replace the concrete requested/effective platform fields.
ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Multi-Account.md, ContractName:Plans/Permissions_System.md

**Required taxonomy split:**
- provider auth challenge after dispatch -> `failure_class = auth_expired`, plus the relevant auth-state transition and stop reason
- interactive approval impossible in the current mode -> `blocked_reason_code = headless_ask_denied`, with no fabricated provider failure
- transient transport/provider outage -> `failure_class = provider_transient`
- provider-side malformed structured output -> `failure_class = structured_output_invalid`
- stale target / drift detected before dispatch -> shared runtime `blocked_reason_code`, not provider failure-class remapping

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Run_Modes.md

**Required correlation envelope:**
- preserve `run_id`, `thread_id`, `node_id`, `attempt_id`, `retry_count`, generation/snapshot ids, failure classification, and remediation lineage across normalized output
- transport reconnect logic may reconnect only to observe an already-submitted attempt; it MUST NOT silently resubmit prompts or mutate retry counters
- provider signals MUST normalize to canonical `failure_class` and `blocked_reason_code` values before orchestration or UI consumes them
- prerequisite resolution from provider/auth layers MUST surface a canonical scheduler wake rather than staying provider-local
- bridged-provider output MUST remain sufficient for runtime classification, and provider-local retry behavior MUST NOT bypass the shared runtime matrix

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Multi-Account.md, ContractName:Plans/Executor_Protocol.md, ContractName:Plans/Permissions_System.md
