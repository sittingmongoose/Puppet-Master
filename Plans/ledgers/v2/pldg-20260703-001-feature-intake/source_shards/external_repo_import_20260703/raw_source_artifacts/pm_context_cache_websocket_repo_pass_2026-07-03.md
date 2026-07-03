# PM External Repo Pass — Context, Token Caching, and WebSocket/Streaming Transport

Date: 2026-07-03  
Scope window: approximately 2026-01-03 through 2026-07-03, with adjacent late-2025 issues included only when they remained active or directly informed the six-month findings.

Repos and surfaces re-reviewed:

- `anomalyco/opencode`, including v1/current issue and PR surfaces plus v2/runtime/context specs
- `cline/cline`, including VS Code extension changelog, CLI/SDK changelog, provider/model/cache fixes, and recent issue/PR surfaces
- `agent0ai/agent-zero`, especially prompt assembly, lazy tools, memory/concurrency, WebSocket/session reliability, and local-model context handling
- `earendil-works/pi`, especially OpenAI Responses/Codex transport, prompt caching, WebSocket retry/timeout, stream admission, usage accounting, and context windows
- `openai/codex`, especially app-server, config, skills, usage, compaction, WebSocket transport, and streaming/session issues
- `ghostty-org/ghostty`, `warpdotdev/warp`, and `tmux/tmux`, only where they inform PM’s GUI terminal stream/backpressure/session model and not as LLM provider models

## Honesty boundary

This is a targeted second/third-pass research audit, not a random spot check. I re-read PM’s own current context/cache/tool/MCP/runtime coverage first, then re-scanned upstream issue/PR/release/spec surfaces for the context-token-cache and WebSocket/streaming layers. The largest upstream repos contain thousands of open and closed issues; I am not claiming every issue body was individually hand-read line by line. The output below is a systematic failure-family and plan-delta pass focused on the specific underweighted topics the user flagged.

## Executive conclusion

PM should treat **context efficiency** as a first-class runtime subsystem, not as “some provider prompt caching.” The repo pass shows at least five different concerns that must not be collapsed:

1. **Provider prompt/prefix cache** — provider-side reuse of a stable request prefix, with provider-specific request markers, routing keys, retention, cache-read/write usage fields, and unsupported/unknown states.
2. **PM context assembly cache** — deterministic construction of the model-visible baseline, stable context-source ordering, context epoch identity, and safe admission of changing environment/config/tool facts.
3. **Tool/skill/MCP catalog cache** — progressive disclosure, lazy schema materialization, searchable L2 catalogs, plugin descriptor caches, and permission-filtered materialization.
4. **Durable history/context cache** — compaction, session history projection, model/provider-switch replay policy, and avoiding duplicate/partial stream persistence.
5. **Artifact/output cache** — large tool result/object storage, rich result retention, terminal scrollback, browser/device snapshots, and redaction-before-write.

PM already has good pieces: requested/effective provider identity, usage/ledger thinking, OpenCode SSE bridge policy, MCP schema caps, tool result failure enums, compaction acceptance tests, Firecrawl cache-state lineage, and runtime artifact lineage. The missing piece is a **unified Context + Cache + Transport contract** that makes cache scope, cache epoch, cache hit/miss evidence, stream durability, and WebSocket/SSE fallback visible and testable.

For WebSockets: use them aggressively where they fit PM’s GUI architecture, but not blindly. WebSockets are the right default for **PM GUI ⇄ local runtime/app-server bidirectional control**, terminal/browser/device/control streams, approvals, steering, cancellation, and live run events. They are not automatically the right provider transport when an upstream bridge is explicitly SSE/HTTP or when replay/cursor semantics are missing. WebSocket is a fast duplex pipe, but it still needs bounded queues, origin/auth controls, backpressure strategy, retry/idle timeout, terminal event validation, and a durable event cursor separate from live paint frames.

## PM current coverage that should not be duplicated

These are the PM plan details I re-checked locally before proposing deltas.

| PM document evidence | Existing PM coverage |
|---|---|
| `Plans/Provider_OpenCode.md:16-24` | OpenCode is already defined as a server-bridged provider using local HTTP REST plus SSE. PM currently MUST use HTTP REST + SSE through the provider facade, not CLI bridging or ad hoc WebSocket. |
| `Plans/Provider_OpenCode.md:248-252` | PM already treats OpenCode `setCacheKey`, `store=false`, stripped OpenAI item IDs, and provider-specific cache markers as adapter evidence, not PM storage canon. |
| `Plans/Provider_OpenCode.md:297-303` | PM already has an SSE mapping for OpenCode async/streaming events and emits `done` on completed/failed session status. |
| `Plans/Provider_OpenCode.md:328-332` | PM already notes prompt-cache-friendly separation between stable static agent/provider prompt content and dynamic environment/instruction material. |
| `Plans/Automated_Testing_System.md:1311-1327` | PM already has compaction acceptance tests for context-circle usage/tokens/cost UI, Compact Now, `/compact` parity, compaction event statuses, failure/degraded state, and manual compaction not creating new cache lineage unless logical run lineage changes. |
| `Plans/MCP_Integration.md:87-89` | PM already has MCP `$ref` cycle handling, resolved schema depth cap 32, 64 KiB size cap, provider schema compatibility facts, and OAuth state keyed by provider/scope/client semantics. |
| `Plans/Tools.md:1837-1838` | PM already records Firecrawl cache and usage lineage via `creditsUsed` and `metadata.cacheState` as `firecrawl_credits_used` and `firecrawl_cache_state`. |
| `Plans/Tools.md:2224-2226` | PM already assigns Tools ownership for explicit tool-level cache routing and provider capability decisions while usage, storage, prompt-cache, and provider bridge owners keep narrower contracts. |
| `Plans/Models_System.md:42-80` | PM already distinguishes source/request/execution axes and requires requested/effective provider, model, variant, effort, auth mode, and account identity. |
| `Plans/usage-feature.md` and `Plans/storage-plan.md` | PM already has a usage/seglog direction and shared lineage anchors such as `usage_event_ref`, `provider_attempt_ref`, attempt identity, and rollup/projection separation. |

The new deltas below therefore focus on exact cache/transport contracts rather than repeating generic tool/MCP or usage-visibility recommendations.

## Cross-repo findings

### 1. Provider prompt caching is exact-prefix infrastructure, not a semantic memory feature

OpenAI’s current prompt caching docs say cache hits require exact prefix matches; static content should be placed at the start and dynamic/user-specific content at the end. The same docs state prompts of 1024+ tokens are eligible, expose `cached_tokens` in usage, and can be influenced with `prompt_cache_key` for common prefixes. The Cookbook goes further: repeated system instructions, tool definitions, schemas, and messages are cacheable, but even small early-token changes can break cache hits.

OpenCode’s cache issues show what goes wrong when agent runtimes treat system prompt assembly casually. Issue #29672 argues that `AGENTS.md`, environment info, skill list ordering, workspace root, git status, and the current date change cache hit rate; issue #5224 says fetching 200 files into the environment prompt causes file churn to invalidate context and raise API costs. OpenCode issue #27692 shows explicit-cache providers may need request markers such as `cache_control: { type: "ephemeral" }`; issue #20265 shows Vertex Anthropic and Gemini require different cache telemetry paths and explicit provider checks.

**PM delta.** PM needs a provider-neutral `PromptCachePolicy` and provider-specific `PromptCacheAdapter` layer. It must not treat “cache supported” as boolean. Required statuses:

- `supported_automatic_exact_prefix`
- `supported_explicit_marker`
- `supported_prompt_cache_key`
- `supported_implicit_server_side`
- `supported_but_not_reported`
- `unsupported`
- `unknown`
- `disabled_by_policy`

Required usage fields:

- `prompt_cache_key_requested?`
- `prompt_cache_key_effective?`
- `cache_scope_hash`
- `cache_prefix_hash`
- `context_epoch_id`
- `baseline_context_hash`
- `cached_input_tokens?`
- `cache_read_tokens?`
- `cache_write_tokens?`
- `cache_creation_tokens?`
- `cache_hit_ratio?`
- `cache_miss_reason?`
- `cache_provider_metadata_raw_ref?`
- `cache_reporting_state = reported | not_reported | unsupported | adapter_parse_failed`

**Pitfall to avoid.** Do not display zero cached tokens as “provider did not cache” unless the provider reports a supported cache metric and the adapter parsed it successfully. Several upstream failures are telemetry failures, not actual cache failures.

### 2. ContextEpoch is the missing PM primitive

OpenCode v2’s `CONTEXT.md` is the cleanest external design signal in this pass. It defines Context Source, System Context Registry, Context Epoch, Baseline System Context, Context Snapshot, and Safe Provider-Turn Boundary. It also separates System Context from Session History, states that context changes are admitted lazily at safe provider-turn boundaries, and makes the baseline immutable for provider-cache purposes until compaction/session movement/incompatible context transition.

**PM delta.** Add a first-class `ContextEpoch` object with at least:

```json
{
  "context_epoch_id": "ctxep-...",
  "session_id": "...",
  "run_id": "...",
  "provider_profile_id": "...",
  "model_id": "...",
  "account_id": "...",
  "baseline_system_context_hash": "sha256:...",
  "context_source_registry_hash": "sha256:...",
  "tool_schema_set_hash": "sha256:...",
  "mcp_catalog_snapshot_hash": "sha256:...",
  "skill_list_hash": "sha256:...",
  "provider_capability_epoch_id": "...",
  "compaction_boundary_ref": null,
  "created_reason": "session_start | compaction_completed | incompatible_context_transition | provider_switch | model_switch | policy_switch | manual_reset",
  "prompt_cache_key_requested": null,
  "prompt_cache_key_effective": null,
  "cache_retention_policy": "provider_default | in_memory | extended_24h | ephemeral | none",
  "volatile_sources_excluded_from_baseline": [],
  "admitted_context_update_ids": []
}
```

`ContextEpoch` should sit beside PM’s existing runtime/session/run lineage, not inside a generic prompt string. It is the bridge between context assembly, compaction, provider cache, model switch, usage accounting, and replay policy.

### 3. Stable context sources must be separated from volatile observations

OpenCode and OpenAI both point to the same rule: stable prefix first, dynamic facts later. OpenCode users directly identified today’s date, workspace root, git flag, and generated file lists as cache breakers. OpenAI’s docs warn that small changes in early tokens invalidate exact prefix caching and that dynamic values should go to the end or metadata.

**PM delta.** Define a `ContextSource` registry with source types and cache roles:

- `stable_baseline`: PM identity, immutable product/system instructions, static tools, stable permission ceiling grammar
- `stable_per_project`: project rules, AGENTS-equivalent instructions, stable selected skills
- `stable_per_run`: run mode and requested/effective provider/model where stable for the epoch
- `volatile_turn_update`: cwd changes, git state, time/date, terminal active pane, selected file, workspace file list, browser/device state
- `model_hidden_snapshot`: state used to decide whether a source changed, not sent to provider
- `metadata_only`: timestamps, diagnostics, route refs, tracing IDs that must not touch cacheable prompt text

Admissions happen only at safe provider-turn boundaries after durable input promotion and tool settlement.

**Acceptance test.** A session that crosses midnight, creates `.git`, or adds files must not mutate the baseline prefix. It should either emit a mid-conversation context update or keep the fact discoverable through tools/metadata. The cache prefix hash should stay stable unless a declared baseline source changed.

### 4. Tool, skill, and MCP catalogs need progressive disclosure and cache-aware gating

Cline’s CLI changelog explicitly records plugin descriptor caching per plugin/provider/model, global settings reads keyed by file mtime, and skill visibility behavior. Cline also moved system prompts through a dedicated system option instead of embedding them in message history, added manual/auto compaction, and preserves model output token limits for context math. Codex Skills use progressive disclosure: the initial skills list includes only names/descriptions/paths, full instructions load when selected, and the initial list is capped at 2% of the context window or 8,000 characters when unknown. Agent Zero issue #1328 reports full system prompt rebuilds, all tool descriptions loaded on every iteration, no prompt cache layer, all 14 tools loaded even if only one or two are used, and approximately 1M tokens/hour in moderate usage.

OpenCode issue #15256 proposes an L1/L2 tool/skill cache because long-running agents can carry full tool and skill catalogs every step. The issue was closed as not planned, but the failure mode is real and applies to PM.

**PM delta.** Add `ToolCatalogCache` / `SkillCatalogCache` / `MCPToolCatalogIndex` with:

- small always-visible summaries
- stable deterministic ordering
- permission-filtered visibility
- model/provider-specific descriptor cache
- full schema materialization only when needed
- rich result path shared with eager tools
- LRU or explicit pinning for active tools
- `allowed_tools`/tool-choice style gating that does not reorder or mutate the full tools array when preserving cache prefix matters

**Important distinction.** Lazy catalog loading is not just token optimization. It is a correctness risk: if eager and lazy tool paths use different result parsers, rich outputs such as images, binary artifacts, or MCP resources can be flattened or lost. PM must require all paths to converge through the same tool settlement layer.

### 5. Cache accounting must be provider-native, not estimated from generic token totals

OpenCode issues around Vertex Anthropic, Gemini implicit caching, Alibaba explicit caching, and DeepSeek cache telemetry show that each provider exposes cache data differently or not at all. Cline changelogs show repeated fixes to prompt-cache support, provider cache controls, inflated token counts, context-window limits, and cache support detection from cache-write pricing.

**PM delta.** Usage/Ledger should store a normalized cache envelope with source-specific raw refs. A usable shape:

```json
{
  "usage_event_ref": "usage-...",
  "provider_attempt_ref": "...",
  "provider_id": "...",
  "model_id": "...",
  "context_epoch_id": "...",
  "input_tokens": 0,
  "output_tokens": 0,
  "reasoning_tokens": null,
  "cached_input_tokens": null,
  "cache_write_tokens": null,
  "cache_creation_tokens": null,
  "cache_read_tokens": null,
  "cache_cost_savings_estimate": null,
  "cache_reporting_state": "reported | unsupported | not_reported | parser_failed | estimated",
  "cache_support_state": "automatic | explicit_marker | implicit_server_side | key_routed | unsupported | unknown",
  "provider_cache_metadata_ref": "artifact/ref-or-seglog-ref",
  "cache_miss_reason": null
}
```

**UI rule.** The context circle / usage hover should show: `Cached: 42k read / 8k write` only when measured; otherwise show `Cache: unsupported`, `not reported`, or `unknown`, not `0`.

### 6. Compaction is cache-sensitive and must be lineage-aware

Cline, Codex, Pi, and OpenCode all surface compaction/context-window issues: auto compaction to stay within context windows, manual compaction, history truncation, context window exceeded handling, and all-zero usage after aborted/truncated responses. PM already has compaction acceptance tests, but the cache implication should be more explicit.

**PM delta.** Add `CompactionCacheEffect`:

- compaction normally ends one `ContextEpoch` and starts another
- manual Compact Now does not create new cache lineage unless logical context changes
- compaction summaries must carry source/history hashes and cache invalidation reason
- UI should explain when compaction improves context fit but breaks prior provider cache prefix
- compacted histories must not include transient partial stream frames or raw full tool outputs

### 7. Durable history must not persist streaming partials as cumulative messages

Codex issue #30072 reports cumulative streaming snapshots being persisted as duplicate assistant messages, inflating context to hundreds of thousands of tokens. Cline had duplicate/partial UI and token count fixes. Pi issue #4345 says streams ending before a terminal chunk must be treated as interruption/error, not conversation success; Pi’s later release notes fixed inherited OpenAI Responses streams to fail before missing terminal events.

**PM delta.** Add `StreamHistoryCoalescer`:

- live stream frames are UI/progress only
- durable assistant message is written once, after terminal event and validation
- missing terminal event = retryable transport/provider error
- zero-usage aborted turn is not admitted as normal assistant content
- cumulative snapshot format must be normalized into final content or discarded before durable history
- stream deltas may create activity/progress records, but not replayable model history until settlement

### 8. WebSockets are right for PM’s GUI runtime, but SSE remains correct for some provider bridges

PM is a GUI product with a built-in terminal, browser/device surfaces, testing panes, approvals, run graph, and runtime artifact panels. Those are naturally bidirectional and live. WebSockets are useful because they provide two-way browser/server communication without polling. But browser WebSocket has no built-in backpressure, so incoming messages can fill memory or burn CPU if PM receives terminal output, logs, screenshots, or model events faster than it can process them.

Codex app-server offers JSON-RPC over stdio, experimental WebSocket, Unix-socket WebSocket, and off. Its docs explicitly warn that non-loopback WebSocket listeners are unauthenticated by default during rollout unless auth is configured, and it uses bounded queues that reject ingress when full with `-32001 "Server overloaded; retry later."` Pi’s OpenAI Responses issue argues WebSocket support can reduce per-turn overhead for long-running, tool-heavy workflows while retaining SSE fallback. Pi’s connection-reliability issue shows the opposite failure mode: WebSocket/auto transport waiting indefinitely before the first event, producing zero usage and no UI output until manual abort.

**PM delta.** Define `TransportPolicy` rather than “use WebSockets everywhere.” Decision inputs:

- locality: same-process, local process, local WebView, SSH tunnel, LAN, internet
- directionality: one-way event stream vs bidirectional steering/control
- replay: durable cursor/resume available or live-only
- auth: local-only, origin check, CSRF/runtime ID, capability token, signed bearer, mTLS
- backpressure: bounded queues, ack/resume, drop policy, overload code
- event volume: terminal bytes, screenshots, browser snapshots, model deltas, logs
- provider support: SSE-only, WebSocket supported, WebSocket experimental, SDK-only
- security realm: trusted local app, project server, remote workspace, untrusted browser

**Recommended PM transport defaults.**

| Surface | Recommended transport | Reason |
|---|---|---|
| PM GUI ⇄ PM local runtime event bus | WebSocket over loopback or app-local IPC; Unix socket where native stack supports it | Bidirectional steering, approvals, cancellation, progress, terminal/browser control. |
| PM GUI ⇄ PM runtime over remote tunnel | WebSocket only with origin validation + capability token/signed bearer + TLS/SSH tunnel policy | Fast live UI, but needs security hardening. |
| OpenCode bridge | Keep HTTP REST + SSE as current PM contract | PM plan already locks OpenCode as HTTP/SSE server bridge; changing to WebSocket would be speculative unless OpenCode exposes a stable WS API. |
| OpenAI Responses/Codex direct provider path | Use provider WebSocket where official/SDK-supported and semantically tested; keep SSE fallback | Pi and Codex show WebSocket value for long tool-heavy flows but also stall/reconnect risks. |
| Terminal pane local PTY bytes | Native PTY ingestion in Rust/native process; WebSocket only as UI transport if the renderer is remote/web-based | Preserve byte ordering, terminal parser state, and backpressure; do not make WebSocket the terminal engine abstraction. |
| Browser/device testing stream | WebSocket/WebRTC/CDP as appropriate, with snapshot refs and bounded frame queues | Bidirectional control + visible evidence; use refs for large artifacts. |
| Durable event replay | Cursor-based durable stream; can be SSE or WebSocket protocol above event store | Transport is less important than replay cursor and durable sequence. |

### 9. WebSocket transport requires explicit state machines, not a single reconnect loop

Agent Zero issue #1485 reports long streaming/tool-call-heavy conversations silently dying under concurrent sessions due to exceptions, O(n²) parsing per chunk, and a shared event loop. Cline fixed hub WebSocket idle reconnects. Codex issue #28579 reports fallback from WebSockets to HTTPS after idle timeouts. Pi issue #4945 reports working UI stuck with zero usage when a WebSocket/auto transport waits before first event. Codex’s app-server docs specify bounded queues and retry with exponential delay/jitter.

**PM delta.** Add `WebSocketStreamStateMachine`:

States:

- `connecting`
- `initialized`
- `subscribed_live`
- `subscribed_durable`
- `waiting_first_event`
- `streaming`
- `idle_heartbeat`
- `backpressured`
- `reconnecting`
- `fallback_active`
- `closing`
- `closed_clean`
- `closed_missing_terminal`
- `failed_auth`
- `failed_origin`
- `failed_overloaded`
- `failed_timeout`

Every stream must expose:

- `transport_attempt_id`
- `runtime_attempt_id`
- `provider_attempt_ref?`
- `last_durable_seq?`
- `last_live_frame_seq?`
- `first_event_deadline_at`
- `idle_deadline_at`
- `backpressure_state`
- `fallback_reason?`
- `user_visible_status`

### 10. Terminal repos reinforce byte-stream/backpressure/protocol correctness, not token-cache policy

Ghostty, tmux, and Warp do not add much to provider token caching. Their value is terminal-stream correctness. Ghostty 1.3.0 added scrollback search implemented by a dedicated search thread that locks in small slices to minimize impact on terminal I/O/rendering; it also fixed a paste/drag command-execution CVE. Warp’s 2026 changelog includes context-window crashes, restored agent conversations, streaming memory/CPU improvements, long-running shell-command countdowns, remote SSH reconnect noise reduction, terminal output crashes with long zero-width runs, MCP parameter serialization issues, and TUI redraw problems. tmux/terminal issue surfaces reinforce OSC 52/9;4/133/633, prompt movement, clipboard, and terminal capability edge cases.

**PM delta.** Do not route terminal correctness through provider context/cache design. Add a terminal-specific byte stream contract:

- local PTY byte ingestion off UI thread
- terminal parser preserves escape state across arbitrary chunks
- bounded scrollback storage independent of model context
- accessible text mirror/range APIs independent of renderer
- terminal output may create model-visible snippets only through explicit user/agent selection or bounded summarization receipts
- WebSocket is a transport for remote UI/runtime links, not the authoritative terminal state

## Proposed PM architecture changes

### A. `ContextEpoch` and `ContextSourceRegistry`

Add to `Plans/Prompt_Pipeline.md`, `Plans/storage-plan.md`, `Plans/Models_System.md`, and `Plans/usage-feature.md`.

Core rule:

> Every provider turn is assembled from a declared `ContextEpoch`. The baseline system context is stable, hashable, ordered, and replayable. Dynamic observations enter as chronological admitted updates only at safe provider-turn boundaries.

Acceptance fixtures:

- date changes do not mutate baseline prefix
- git init/delete does not mutate baseline prefix mid-epoch
- file list churn does not mutate baseline prefix
- skill/tool toggle either changes declared catalog epoch or emits mid-conversation update
- compaction creates a new epoch with source-history hashes
- model switch preserves/ends epoch according to compatibility matrix

### B. `PromptCachePolicy` and provider adapters

Add to `Plans/Models_System.md`, `Plans/Provider_OpenCode.md`, `Plans/CLI_Bridged_Providers.md`, `Plans/usage-feature.md`.

Core rule:

> Cache support is provider/model/route/account scoped and must be represented as a capability with source/freshness, request knobs, measurement state, and fallback behavior.

Provider examples to encode:

- OpenAI: exact-prefix caching, `prompt_cache_key`, `prompt_cache_retention`, `cached_tokens`
- Anthropic/Bedrock/Vertex Anthropic: explicit cache-control markers and cache creation/read token metadata
- Gemini/Vertex Gemini: implicit server-side cached content counts when reported
- Alibaba/Qwen/DashScope: explicit `cache_control` markers where required
- OpenAI-compatible routes: default unknown unless adapter proves support
- OpenCode bridge: PM records upstream evidence from OpenCode without treating it as PM-native storage

### C. `ToolCatalogCache` / `MCPToolCatalogIndex`

Add to `Plans/Tools.md`, `Plans/MCP_Integration.md`, `Plans/Prompt_Pipeline.md`.

Core rule:

> Initial model context receives a bounded tool/skill/MCP summary. Full schemas and instructions materialize lazily or by active set, but all materialized paths share the same tool-result settlement and rich-output retention logic.

Acceptance fixtures:

- 100 MCP tools do not exceed initial context budget
- materializing tool schema does not reorder stable baseline tool list unless epoch changes
- disabled/denied/unavailable tools are searchable but not callable, with structured reasons
- rich MCP result from lazy selected tool equals eager-path normalized result
- plugin descriptor cache invalidates by provider/model/plugin hash

### D. `UsageCacheEnvelope`

Add to `Plans/usage-feature.md` and `Plans/storage-plan.md`.

Core rule:

> Usage events record cache metrics as measured provider facts, not generic estimates. Unknown/not-reported/unsupported are distinct states.

Acceptance fixtures:

- provider cache unsupported displays unsupported, not zero
- parser failure produces diagnostic and raw metadata ref
- provider reports cached tokens but PM misses parser -> audit failure
- cache hit rate visible per run/session/model/provider/account/profile
- rollups separate total input, uncached input, cached input, cache write, cache read, output, reasoning

### E. `StreamHistoryCoalescer`

Add to `Plans/Executor_Protocol.md`, `Plans/Prompt_Pipeline.md`, `Plans/storage-plan.md`, `Plans/assistant-chat-design.md`.

Core rule:

> Live stream fragments are not replayable conversation history. Only settled turns become durable model history.

Acceptance fixtures:

- cumulative assistant snapshots persist once
- missing terminal event -> transport error, no assistant success
- zero-usage aborted turn remains aborted metadata, not replayable assistant content
- reconnection does not duplicate partial deltas
- SSE and WebSocket produce identical durable message objects for same provider payload

### F. `TransportPolicy` and `WebSocketStreamStateMachine`

Add to `Plans/Executor_Protocol.md`, `Plans/Runtime_Artifacts_Panel.md`, `Plans/FinalGUISpec.md`, `Plans/Provider_OpenCode.md`, `Plans/CLI_Bridged_Providers.md`.

Core rule:

> PM uses WebSockets for bidirectional GUI/runtime and remote-control streams where authenticated, bounded, and observable; PM uses SSE/HTTP/stdout/unix-socket/provider SDKs where those are the provider’s stable surface. The selected transport is a policy outcome with receipts.

Acceptance fixtures:

- WS origin rejected when wrong origin
- remote/tunnel WS requires capability token or signed bearer before initialize
- inbound queue overflow emits structured overload and retry-after/jitter guidance
- first-event timeout surfaces user-visible transport stall
- idle timeout reconnects or falls back without corrupting history
- live stream and durable cursor stream are separate
- OpenCode remains HTTP/SSE unless upstream contract changes
- terminal PTY high-output stream is bounded and does not freeze GUI or poison model history

## Prioritized backlog

### P0

1. `P0-CONTEXT-EPOCH-BASELINE` — Add `ContextEpoch`, `ContextSourceRegistry`, `BaselineSystemContext`, `ContextSnapshot`, and safe provider-turn admission.
2. `P0-PROMPT-CACHE-POLICY` — Add provider-neutral prompt cache policy plus provider adapters for OpenAI, Anthropic/Bedrock/Vertex, Gemini, Alibaba/Qwen, OpenCode bridge, and OpenAI-compatible unknown routes.
3. `P0-CACHE-USAGE-ENVELOPE` — Normalize cache usage/read/write/creation/hit/miss metrics and preserve raw provider metadata refs.
4. `P0-VOLATILE-CONTEXT-QUARANTINE` — Move time/date/git/file-list/workspace-root/active-pane and similar facts out of baseline prompt unless declared stable.
5. `P0-STREAM-HISTORY-COALESCER` — Ensure stream partials are live-only until terminal event; no duplicate/cumulative assistant persistence.
6. `P0-WEBSOCKET-TRANSPORT-POLICY` — Define WebSocket/SSE/stdout/unix-socket/HTTP selection, fallback, auth, origin, queue, and retry receipts.
7. `P0-WEBSOCKET-SECURITY-BOUNDARIES` — Add origin/CSRF/runtime-ID/capability-token/signed-bearer rules for GUI/runtime and remote/tunnel WebSockets.

### P1

8. `P1-MCP-TOOL-CATALOG-CACHE` — Add tool/skill/MCP L1/L2/progressive disclosure with rich result path parity.
9. `P1-COMPACTION-CACHE-EFFECT` — Make compaction’s cache impact visible in lineage, UI, usage, and acceptance tests.
10. `P1-PROVIDER-CAPABILITY-EPOCH-CACHE` — Extend provider/model capability epoch with catalog source/freshness, route limits, and cache support.
11. `P1-MODEL-SWITCH-REPLAY-SANITIZER` — Drop/retain reasoning, item IDs, cache keys, tool history, and images per provider/model compatibility.
12. `P1-LOCAL-LLM-CONTEXT-CAPS` — Enforce context caps on utility/memory/subagent models, not only the main provider call.
13. `P1-WEBSOCKET-BACKPRESSURE-DIAGNOSTICS` — Add queue pressure, frame drops/defer, overload codes, and UI status.
14. `P1-TERMINAL-PTY-STREAM-CONTRACT` — Separate PTY byte stream, terminal parser state, scrollback cache, accessible mirror, and model-visible excerpts.

### P2

15. `P2-CACHE-OBSERVABILITY-DASHBOARD` — Add per-provider cache hit/miss/cost-savings views with unknown/unsupported states.
16. `P2-CACHEABLE-TOOL-OUTPUT-REFS` — Hash-addressed object refs for stable large tool outputs, with redaction-before-write and no secret cache.
17. `P2-TRANSPORT-SOAK-TESTS` — Long-running terminal/agent/browser/device WS/SSE soak tests with reconnect, sleep/wake, large-output, and terminal-protocol fixtures.
18. `P2-CACHE-PRIVACY-POLICY` — Make provider cache retention and org/account boundary visible; avoid promising manual cache clearing when provider does not support it.

## Practical design notes

### Do not overfit to WebSocket

“Use WebSockets where applicable” is right, but applicability is specific. For PM, WebSockets are a GUI/runtime transport and provider option, not a universal abstraction. The safest framing is:

- PM internal runtime live control: WebSocket-first.
- Provider SDK/Responses where WebSocket is officially supported and tested: WebSocket-preferred with SSE fallback.
- OpenCode server bridge: keep HTTP/SSE until OpenCode exposes a stable WS provider surface.
- Durable replay: cursor/sequence first; transport second.
- Terminal: PTY/parser state first; WebSocket only as one possible UI transport.

### Do not confuse context cache and memory

Prompt caching reuses provider compute for repeated prefixes. It does not store semantic PM memory, it does not prove storage, and it does not replace PM’s durable ledger/state. The provider cache key and PM context epoch should be linked, but they are not the same object.

### Do not hide cache misses

A cache miss should be inspectable. Useful `cache_miss_reason` values:

- `below_provider_threshold`
- `prefix_changed`
- `tool_schema_changed`
- `skill_list_changed`
- `context_epoch_changed`
- `compaction_epoch_changed`
- `provider_model_changed`
- `account_or_org_changed`
- `cache_retention_expired`
- `provider_overflow_or_reroute`
- `provider_does_not_report`
- `adapter_not_supported`
- `disabled_by_policy`

### Do not let streaming transport corrupt model history

The model-visible history must be derived from settled turns and tool settlements. WebSocket/SSE deltas should feed live UI and progress records; they should not become replayed messages until terminal success.

## Target PM docs for the eventual Plan pass

Recommended owner split:

- `Plans/Prompt_Pipeline.md` — ContextEpoch, ContextSourceRegistry, baseline/admission, StreamHistoryCoalescer, compaction cache effect.
- `Plans/Models_System.md` — provider/model/cache capability epoch, requested/effective cache support, model-switch replay sanitizer.
- `Plans/usage-feature.md` — UsageCacheEnvelope, cache rollups, UI copy, cache hit/miss/unsupported states.
- `Plans/storage-plan.md` — durable context epoch records, cache metadata refs, stream/history coalescing storage, redaction-before-write.
- `Plans/Tools.md` — tool cache routing, tool output cache refs, rich result settlement parity.
- `Plans/MCP_Integration.md` — MCPToolCatalogIndex, lazy schema materialization, provider/model descriptor caches.
- `Plans/Provider_OpenCode.md` — keep SSE/HTTP bridge; enrich OpenCode cache evidence normalization and clarify no WebSocket unless upstream contract exists.
- `Plans/CLI_Bridged_Providers.md` / `Plans/Executor_Protocol.md` — TransportPolicy, WebSocket state machine, fallback receipts.
- `Plans/FinalGUISpec.md` / `Plans/Runtime_Artifacts_Panel.md` — GUI transport indicators, context/cache details, terminal/browser/device stream states.
- `Plans/Automated_Testing_System.md` — cache and WebSocket fixture suite.
