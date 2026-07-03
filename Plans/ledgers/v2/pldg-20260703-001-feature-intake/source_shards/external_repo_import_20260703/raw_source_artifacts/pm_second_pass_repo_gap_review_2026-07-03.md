# Puppet Master Second-Pass External Repo Gap Review

Date: 2026-07-03  
Window: approximately 2026-01-03 through 2026-07-03, with a few adjacent late-December 2025 issues included when they were still active, still technically material, or repeatedly referenced inside the six-month window.

Repos covered again:

- `anomalyco/opencode`, including current V1/current release surface and the `beta/specs/v2` design set
- `cline/cline`
- `agent0ai/agent-zero`
- `earendil-works/pi`
- `openai/codex`
- `ghostty-org/ghostty`
- `warpdotdev/warp`
- `tmux/tmux`

## Honesty boundary

This was not a random spot check. I re-scanned the current live issue, PR, release, and specification surfaces, then opened targeted high-signal issue/PR bodies where titles, snippets, or previous pass gaps pointed to material PM risk. The largest upstream repos contain thousands of issues and pull requests, so I am not claiming every issue body was manually read line-by-line. The useful output is a second-pass failure-family audit, anchored to specific recent upstream signals and cross-checked against PM's current Plans docs, especially Tools and MCP.

## PM tool/MCP/terminal baseline actually read this pass

The biggest correction from the user's note is that PM already has a lot of the generic tool/MCP foundation. The second-pass deltas below intentionally avoid recommending generic "add MCP" or "add tool permissions" work.

### Tool and MCP current PM coverage

| PM doc evidence | What PM already covers |
|---|---|
| `Plans/Tools.md:6` | Tools is already the canonical plan for built-in tools, custom tools, MCP registry integration, permissions, provider routing, and how MCP fits in. |
| `Plans/Tools.md:23-27` | Built-in, custom, MCP, permission, and thin runtime tool contracts are in scope; MCP-discovered tools integrate with the central registry and policy. |
| `Plans/Tools.md:31-39` | GUI already exposes Settings > Advanced > MCP Configuration, Settings > Permissions, MCP-discovered tool rows, and usage rollups. |
| `Plans/Tools.md:47-63` | Permission action and precedence SSOT is `Plans/Permissions_System.md`; precedence is deterministic: mode override, session cache, persona, project, global, defaults. |
| `Plans/Tools.md:124-140` | Normalized tool results already distinguish success, runtime error, denied, declined, headless ask denied, FileSafe blocked, validation blocked, cancelled, timed out, and post-scan failure. |
| `Plans/Tools.md:6441-6500` | T-077/T-078 already require invalid tool args and truncated tool invocations to close with structured errors rather than synthesized empty/minimal/success-shaped results. |
| `Plans/Tools.md:6973-7090` | T-087/T-089 already define MCP underscore tool naming, wildcard layering, unavailable server structured errors, bounded reconnect, and degraded/unavailable user surfaces. |
| `Plans/MCP_Integration.md:1-7` | MCP Integration is the SSOT for MCP configuration, naming, availability, credential binding, and invalidation. |
| `Plans/MCP_Integration.md:14-37` | Canonical MCP identity is `{server_slug}_{tool_name}` and requested/effective availability are separate enums. |
| `Plans/MCP_Integration.md:87-89` | MCP schema handling already has `$ref` cycle handling, depth 32, 64 KiB cap, provider schema compatibility handling, and OAuth state keyed by provider/scope/client semantics. |
| `Plans/MCP_Integration.md:172-183` | Direct API, CLI bridge, and server bridge statuses are already distinguished in GUI; account/profile isolation applies to MCP bridges. |
| `Plans/MCP_Integration.md:905-953` | Portable entries and provider adapter configs are no-secrets projections; secrets resolve through refs or auth bindings. |
| `Plans/MCP_Integration.md:965-1008` | `/config/override/debug` already shows final effective MCP config/provenance/auth/sync read-only without mutating config, serializing secrets, or bypassing policy. |
| `Plans/MCP_Integration.md:1020-1074` | Canonical records/enums already exist: `mcp_server_record`, `mcp_runtime_availability`, `mcp_tool_record`, transport/scope/ownership/availability/config-sync fields. |
| `Plans/MCP_Integration.md:1205-1253` | MCP managed sessions are pooled by default; subprocess-per-call is prohibited except disposable diagnostic probes. |
| `Plans/MCP_Integration.md:1264-1313` | PM central registry/health/permissions/secrets layer is source of truth; provider-side adapter state is projection/bridge surface. |
| `Plans/MCP_Integration.md:1870-1914` | MCP account/profile isolation keeps auth state, workspace trust, history, approvals, runtime caches, and OAuth residue profile-local unless a safe PM overlay projects them. |
| `Plans/Permissions_System.md:108-120` | Permission system owns allow/ask/deny and policy must be applied before every dispatch, across nesting depth, child-run path, execution strategy, and provider surface. |
| `Plans/Permissions_System.md:124-136` | Mutable permission state requires locks; hooks that modify args/context trigger fresh permission evaluation; discovery is not execution approval. |
| `Plans/Permissions_System.md:1251-1281` | Target-bound approvals, preflight revalidation, provider exposure rules, remote-side-effect receipts, metadata minimization, and no-persist/no-echo rules are already defined. |

### Built-in GUI terminal current PM coverage

| PM doc evidence | What PM already covers |
|---|---|
| `Plans/Section15_MVP_Promoted_Features_Spec.md:175-191` | Terminal is shell-first and session-oriented; chat/output/problems/debug/ports consume terminal/dev-session state instead of owning PTY state. |
| `Plans/Section15_MVP_Promoted_Features_Spec.md:195-214` | Terminal section, tab, pane, session, and dev-session identity are distinct; UI movement/labels never mint runtime identity. |
| `Plans/Section15_MVP_Promoted_Features_Spec.md:729-745` | UI command catalog already exposes show/focus/new-tab/split/move/rename/clear/restart/terminate/kill/detach/reattach and reveals by canonical IDs. |
| `Plans/Section15_MVP_Promoted_Features_Spec.md:760-779` | PM distinguishes guaranteed durable terminal presentation state, best-effort transcript/command metadata, and transient live PTY/TUI/selections/search. |
| `Plans/FinalGUISpec.md:13799-13845` | Terminal core is native screen/buffer state, diff-based painting, off-UI-thread PTY/buffer ingestion; DOM/React/webview terminal cores are non-ship. |
| `Plans/FinalGUISpec.md:13853-13864` | Terminal projections use bounded row windows, max 30fps throttling, 33ms batching, Rust ring buffers, and virtualized high-volume output. |
| `Plans/FinalGUISpec.md:22922-22975` | Terminal cards distinguish Open, Show, Rerun, Detach; Open/Show focus the same live session while Rerun creates a new card. |
| `Plans/FinalGUISpec.md:22978-23021` | Terminal preview cards are bounded, read-only, ref/blob-backed for large payloads, and must not mint pseudo-terminals. |

## What the second pass adds or changes

### 1. MCP lazy catalog/search must be specified as a shared-result-path feature, not just a context-budget optimization

**Upstream signals.** OpenCode has a repeated issue family around MCP tool schemas consuming too much context: several issues ask for lazy/dynamic loading, on-demand search, filtering, and tool/skill cache. OpenCode issue #8277 states that multiple MCP servers can add 50k+ tokens before the user sends a message; #7399 gives a Chrome DevTools MCP example where all 26 tools cost about 17k tokens while a focused agent may need only four; #17480/#17482 ask for dynamic/lazy schema loading; PR #12520 references tool-search requests including #9350, #8625, #8277, #7399, and #9461. Cline issue #9398 reports 20k+ token usage for a simple "hi" when multiple MCP servers are enabled.

**PM current state.** PM has central MCP registry, schema caps, effective availability, managed sessions, and permission rows. It does not yet appear to have an explicit lazy MCP catalog/search/materialization contract.

**Missed/underweighted delta.** Add a first-class `MCPToolCatalogIndex` / `ToolCatalogSearch` contract. It should separate:

- small always-visible tool summaries
- searchable catalog entries
- on-demand full schema materialization
- permission-filtered catalog visibility
- per-context budget receipts
- exact reason why a tool was omitted, hidden, deferred, or materialized

The most important caution from OpenCode PR #12520 is that a lazy path can accidentally bypass the normal MCP result-processing path and flatten images/resources/attachments into text. PM should require all MCP invocation paths — eager, lazy, search-selected, CLI-projected, server-bridge-projected — to converge through the same result settlement parser and rich-output retention contract.

**Target docs.** `Plans/Tools.md`, `Plans/MCP_Integration.md`, `Plans/Prompt_Pipeline.md`, `Plans/usage-feature.md`, `Plans/Runtime_Artifacts_Panel.md`.

**Acceptance tests.** Fixture with 5 MCP servers and 100 tools must keep initial tool context below budget; selecting a tool materializes schema with permission receipt; rich image/resource/blob result from a lazy-selected tool must produce the same normalized result as eager invocation; unavailable/degraded servers still show searchable but non-callable entries with structured reasons.

### 2. Tool/history admission needs a quarantine layer before malformed provider-native tool turns become durable history

**Upstream signals.** Pi issue #3108 showed malformed empty-name tool calls poisoning the session in the prior pass; the second pass found more parser/history variants: Pi issue #952 reports reasoning text appended after tool-call JSON causing `JSON.parse()` crash; Pi issue #4228 says streaming deltas may contain content, reasoning_content, and tool_calls in the same JSON object with no ordering; Pi issue #4226 reports MCP params being converted to strings instead of preserving booleans/numbers; OpenCode issue #8137 shows OpenAI-compatible typed validation failures with a tool call; Agent Zero issue list currently includes truncated tool-call turns treated as successful and v2 tool-call parser regressions.

**PM current state.** PM already has T-077/T-078 for invalid args and truncated invocations. That is strong at dispatch/result level.

**Missed/underweighted delta.** Add a `HistoryAdmissionGate` before session persistence and replay. A tool call or assistant message should not become durable provider replay material until it passes:

- tool name validity
- tool call ID validity
- JSON argument parse and bounded recovery policy
- native type preservation
- no duplicate/empty tool call block
- reasoning/content/tool delta normalization
- provider-specific role-order and reasoning replay requirements

Bad entries should be quarantined as `provider_turn_rejected` or `history_replay_blocked`, not silently repaired into durable history and not replayed forever.

**Target docs.** `Plans/Prompt_Pipeline.md`, `Plans/storage-plan.md`, `Plans/Tools.md`, `Plans/CLI_Bridged_Providers.md`, `Plans/Models_System.md`.

**Acceptance tests.** Store/replay fixtures for empty tool name, duplicate tool ID, JSON-with-trailing-reasoning, same-delta content+reasoning+tool_calls, stringified MCP booleans, and length-truncated tool call. None may produce `allowed_succeeded` or poison future turns.

### 3. Provider capability epochs must cover model-switch sanitization, route-specific limits, and stale/ghost catalog entries

**Upstream signals.** Cline PR #10007 corrected MiniMax context window values and notes that other provider sections impose different route-specific limits; Cline PR #11119 intentionally added a static model catalog for a new provider and left dynamic refresh out of scope. Pi issues #2029, #3061, #6206, and #6259 expose hardcoded/stale context windows, impossible `maxTokens > contextWindow`, ghost models, and conflation of context-window clamping with maxTokens. OpenCode PR #27554 auto-discovers local OpenAI-compatible models and limits from `/models` when available.

**PM current state.** Previous OpenCode pass already recommended `ContextEpoch`. PM has model/provider/account requested/effective concepts, but this second pass shows the epoch also needs catalog provenance and route-specific limit identity.

**Missed/underweighted delta.** Extend `ContextEpoch` or add `ProviderCapabilityEpoch` with:

- source of model metadata: static, provider `/models`, user override, local/LAN probe, bridge-provided, cached
- freshness and last validation
- route-imposed context window and max output distinct from provider-native model capability
- account/profile scope
- model-switch sanitizer for images, reasoning blocks, tool histories, max-token params, and system/developer role differences
- ghost/deprecated model handling

**Target docs.** `Plans/Models_System.md`, `Plans/Provider_OpenCode.md`, `Plans/CLI_Bridged_Providers.md`, `Plans/Prompt_Pipeline.md`, `Plans/usage-feature.md`.

**Acceptance tests.** Model catalog fixture where direct provider reports 204800 context but route reports 80000; `maxTokens > contextWindow`; static provider catalog stale; local `/models` lacks limits; user switches from vision model to text-only model with image history; thinking model to non-thinking model with reasoning metadata. The effective request must show what was dropped, transformed, or blocked.

### 4. Reasoning/thinking metadata is not one provider quirk; it is now a cross-provider replay contract

**Upstream signals.** OpenCode issues #24722, #25758, #23830, #24190, #10996, #13002, and others repeatedly show `reasoning_content`/`reasoning_details` replay problems across DeepSeek, Kimi, HuggingFace/OpenAI-compatible paths, and GLM. Pi issues #3635/#3636, #3668, #4251, #4505/#4507, and #5309 show the same class across DeepSeek, Kimi, MiMo/Xiaomi, and OpenRouter. Agent Zero issue list currently includes reasoning dropped by a LiteLLM transport.

**PM current state.** Prior pass already recommended provider-native metadata policy. This pass upgrades that to a must-have compatibility matrix and history-admission/replay gate.

**Missed/underweighted delta.** Add a `ProviderNativeReplayMatrix` with explicit fields:

- `requires_reasoning_content_on_assistant_messages`
- `requires_empty_reasoning_content_even_when_absent`
- `forbids_reasoning_details_replay`
- `requires_thinking_signature`
- `requires_user_first_after_system`
- `allows_assistant_first_greeting`
- `allows_images_in_history`
- `tool_call_delta_ordering`
- `system_vs_developer_role_mapping`
- `tool_result_role_mapping`

**Target docs.** `Plans/Models_System.md`, `Plans/Prompt_Pipeline.md`, `Plans/CLI_Bridged_Providers.md`, `Plans/Provider_OpenCode.md`.

**Acceptance tests.** Multi-turn replay tests for DeepSeek/Kimi/MiMo/OpenRouter/Claude-compatible/OpenAI-compatible with tool calls and reasoning enabled; model switch from thinking to non-thinking; provider route through generic OpenAI-compatible proxy to Claude requiring user-first order.

### 5. MCP parameter fidelity needs explicit native JSON typing tests

**Upstream signals.** Pi issue #4226 reports MCP parameters converted to strings before `tools/call`, causing standards-compliant servers to reject booleans/numbers. This is not covered by generic schema validation if PM validates pre-dispatch but then serializes through a lossy adapter.

**PM current state.** PM has MCP schema caps and provider schema adapter compatibility, plus invalid args pre-dispatch.

**Missed/underweighted delta.** Add adapter round-trip tests for MCP `tools/call` payload fidelity:

- boolean remains boolean
- integer/number remains number
- array/object remains structured
- null handling is explicit
- no stringification in CLI bridge, HTTP/SSE/streamable HTTP, server bridge, plugin hook, or persisted replay paths

**Target docs.** `Plans/MCP_Integration.md`, `Plans/Tools.md`, `Plans/CLI_Bridged_Providers.md`, `Plans/Executor_Protocol.md`.

### 6. MCP credential/header resolution hooks are needed, but must be permission- and secret-safe

**Upstream signals.** Agent Zero PR #1469 adds `resolve_mcp_server_headers` at both streamable HTTP and SSE transport paths and adds settings extension hooks for credential scanning. This is a useful pattern, but also a danger point: plugins must not monkey-patch or read raw secrets casually.

**PM current state.** MCP no-secrets adapter projection and OAuth/token sharing are well specified; plugin hooks and permissions require fresh evaluation after mutation.

**Missed/underweighted delta.** Add an explicit `MCPHeaderResolutionHook` contract:

- secret placeholders resolve only at call/connection construction time
- resolved secrets never enter catalog, model context, debug config, logs, or persisted adapter config
- hook identity is receipted
- hook output is redacted and has a data-class label
- permission policy re-runs after hook mutation
- hook can narrow but not widen scope

**Target docs.** `Plans/MCP_Integration.md`, `Plans/Permissions_System.md`, `Plans/Plugins_System.md`, `Plans/Tools.md`.

### 7. Context-budget accounting must distinguish tool schema, skill instructions, MCP schemas, git/PR instructions, document memory, and retrieved blobs

**Upstream signals.** OpenCode issue #26661 asks to reduce initial system prompt token overhead and links MCP schema bloat and moving git/PR instructions out of bash tool description. OpenCode's repeated MCP lazy-loading issues make the same point. Agent Zero release v1.19 moved long tool instructions into a document-query skill with compact stubs, and Codex Skills official docs use progressive disclosure so only skill names/descriptions/paths are initially loaded while full SKILL.md loads on demand.

**PM current state.** PM has usage, context, tools, and skills concepts; prior pass already added skill/context budgets. The second pass says budgets must be per-source and receipted, not just aggregate.

**Missed/underweighted delta.** Add `ContextBudgetReceipt` source families:

- user prompt
- durable conversation/history
- system/developer instructions
- PM policy/invariants
- tool descriptions
- MCP tool schemas
- skill summaries
- loaded skill bodies
- retrieved files/docs/memory
- terminal/tool outputs
- images/resources/blobs
- provider-native replay metadata

**Target docs.** `Plans/usage-feature.md`, `Plans/Prompt_Pipeline.md`, `Plans/Tools.md`, `Plans/MCP_Integration.md`, `Plans/assistant-memory-subsystem.md`.

### 8. Agent interrupt/cancel semantics must halt tool calls without wiping state or converting cancellation into tool failure

**Upstream signals.** Agent Zero issue #1208 says the only way to stop a looping/stuck agent was restarting the Docker container, and asks for a stop button that halts the active response and tool calls, returns UI to idle, and preserves history up to interruption. OpenCode v2 specs include `sessions.interrupt` and effect interruption in tool invocation context.

**PM current state.** PM has `cancelled` as a normalized tool result and terminal/session lifecycle actions.

**Missed/underweighted delta.** Ensure cancellation is a first-class run/tool settlement state:

- user stop vs timeout vs provider disconnect vs policy denial vs tool self-error are distinct
- cancellation attempts propagate to provider stream, tool subprocess, MCP call, browser/device session, and child run
- partial outputs are retained as partial/cancelled, not success
- history records an interruption boundary and does not replay unfinished tool turns as normal assistant state

**Target docs.** `Plans/Goal_Runtime_System.md`, `Plans/Tools.md`, `Plans/Executor_Protocol.md`, `Plans/assistant-chat-design.md`, `Plans/storage-plan.md`.

### 9. Terminal semantic prompt markers require a region- and pane-aware parser, not just a command-block heuristic

**Upstream signals.** tmux issue #5237 explains why OSC 133 forwarding through tmux needs native parsing, active-pane scoping, visibility scoping, or allowlists rather than raw DCS passthrough; Ghostty issue #10379 shows OSC 133 parser fragility when Claude Code emits a bare key without `=`; Ghostty issue #11138/#12996 family shows shell-native click-to-move and OSC 133 click events interactions; tmux issue #4918 covers overly clearing OSC133 flags; Ghostty issue #5932 calls out row-based vs region-based semantic prompt handling.

**PM current state.** PM's terminal identity and UI state model is strong; the prior report already recommended a broad protocol matrix.

**Missed/underweighted delta.** Specify `TerminalSemanticMarkerParser`:

- markers are regions, not only rows
- markers are scoped by terminal_session_id + pane + alternate-screen state + tmux/ssh/remote mediator path
- malformed/bare-key OSC params are tolerated and classified
- confidence tiers are explicit: native, shell-integrated, tmux-forwarded, passthrough-unverified, heuristic-only
- clearing/repaint operations cannot erase metadata incorrectly without a repair rule

**Target docs.** `Plans/Section15_MVP_Promoted_Features_Spec.md`, `Plans/FinalGUISpec.md`, `Plans/storage-plan.md`, `Plans/Contracts_V0.md`.

### 10. Terminal byte-stream parsing must be stateful across read chunks

**Upstream signals.** tmux issue #4983 reports DEC synchronized updates leaking structural commands when the begin/end pair spans multiple pane reads. This is a general parser warning: protocol state cannot be chunk-local.

**PM current state.** PM has off-UI-thread PTY/buffer ingestion, ring buffers, and high-output projection throttling.

**Missed/underweighted delta.** Add a terminal parser invariant: escape/control-sequence state spans arbitrary PTY read boundaries. Fixtures must split OSC, DCS, CSI, bracketed paste, synchronized update, hyperlink, and shell-marker sequences at every byte boundary and prove no structural control bytes leak into visible output.

**Target docs.** `Plans/FinalGUISpec.md`, `Plans/Section15_MVP_Promoted_Features_Spec.md`, `Plans/Executor_Protocol.md`.

### 11. Terminal accessibility mirror needs range/position APIs, not a whole-buffer text blob

**Upstream signals.** Ghostty issue #9932 says accessibility APIs returning the whole terminal blob caused a 3-second query and that screen readers/tools need visible range, range-for-position, and bounds-for-range behavior; Terminal.app returns only the viewport while Ghostty returned all scrollback.

**PM current state.** Prior report already called for an accessibility text mirror. This pass refines the acceptance criteria.

**Missed/underweighted delta.** Add `TerminalAccessibleTextProjection` with:

- visible-range query
- range-for-position query
- bounds-for-range query
- latest command-region query when known
- redaction-aware projection
- throttled updates
- no full scrollback on every accessibility query

**Target docs.** `Plans/FinalGUISpec.md`, `Plans/Accessibility.md` if present, `Plans/storage-plan.md`.

### 12. Terminal mediator/provenance diagnostics must cover tmux, SSH, mosh, ConPTY, warpification-like layers, and clipboard/OSC52 paths

**Upstream signals.** Warp issue #10516 shows selection-to-clipboard and OSC 52 failing across SSH+tmux and even after disabling warpification; tmux issue #5237 highlights mux passthrough scoping; Warp issue #11398 points to bundled ConPTY age breaking PowerShell 7.6.x on Windows; Codex issues in the previous pass exposed Windows sandbox helper fragility.

**PM current state.** PM has terminal session identity, restore outcomes, and GUI actions. It still needs a terminal-host/mediator diagnostic matrix.

**Missed/underweighted delta.** Add `TerminalHostProvenance`/doctor receipts:

- OS, shell, PTY backend, ConPTY/OpenConsole/conhost version, pty wrapper, tmux/mosh/ssh nesting, remote local/remote cwd, TERM, terminal feature negotiation
- OSC52 clipboard path: local selection, keyboard copy, OSC52 local, OSC52 remote, tmux passthrough, SSH policy
- user-visible degraded states: clipboard unsupported, prompt markers untrusted, bracketed paste unavailable, ConPTY incompatible

**Target docs.** `Plans/Section15_MVP_Promoted_Features_Spec.md`, `Plans/FinalGUISpec.md`, `Plans/Automated_Testing_System.md`, `Plans/Runtime_Artifacts_Panel.md`.

### 13. Terminal memory and resource ceilings should include AI-CLI/TUI workloads explicitly

**Upstream signals.** Ghostty issue #10289 reports a severe memory leak with multiple Claude Code CLI sessions, reaching 71.49 GB on a 16 GB system after 20-30 minutes. Pi issue #3148 says synchronous `find` over large roots can freeze the UI/event loop.

**PM current state.** PM has ring-buffered terminal projections and prior backlog included resource quotas. This pass adds concrete workload fixtures.

**Missed/underweighted delta.** Add stress fixtures for:

- multiple AI CLI/TUI sessions in four panes
- long shell-integrated sessions with MCP/tool output
- huge scrollback + accessibility queries
- synchronous file search over `$HOME`
- terminal + browser + subagent workloads concurrently

**Target docs.** `Plans/FinalGUISpec.md`, `Plans/Executor_Protocol.md`, `Plans/Automated_Testing_System.md`, `Plans/usage-feature.md`.

### 14. Trace/log redaction must happen before trace persistence, not only before provider transmission or UI export

**Upstream signals.** OpenAI Codex release 0.142.5 fixed a bug where full Responses WebSocket request payloads were written to trace logs.

**PM current state.** Permissions_System already says provider exposure requires data-class labeling and secret-scrub before provider transmission, and persisted/exported/screenshotted artifacts record redaction profile. This is strong but not necessarily specific to internal trace/debug logs.

**Missed/underweighted delta.** Add a `TraceRedactionBeforeWrite` invariant:

- full prompt/request/provider payloads must never be written to trace logs by default
- trace events get bounded summaries and content refs only after scrub policy
- raw local-only debug capture requires explicit opt-in, expiry, encryption, and export warning
- WebSocket/streaming frames are subject to the same rules as HTTP requests

**Target docs.** `Plans/Permissions_System.md`, `Plans/storage-plan.md`, `Plans/Runtime_Artifacts_Panel.md`, `Plans/Privacy_Security.md` if present.

### 15. Plugin/UI extension points should be typed and stable enough to avoid monkey-patching

**Upstream signals.** Agent Zero PR #1469 added per-row sidebar extension points because previous plugin authors had to use MutationObserver, DOM scanning, and monkey-patching internal store methods. The same PR added settings hooks for credential scanning.

**PM current state.** PM has Plugins_System and permission hook revalidation in Permissions_System.

**Missed/underweighted delta.** Add an extension-point compatibility matrix:

- typed UI slots for tool/MCP rows, chat/session rows, terminal/session rows, model/provider rows, runtime artifact rows
- stable context object fields and versioned schema
- forbidden DOM scraping / private-store monkey-patching for privileged surfaces
- mutation hooks must trigger post-hook permission recheck and produce receipts

**Target docs.** `Plans/Plugins_System.md`, `Plans/Permissions_System.md`, `Plans/MCP_Integration.md`, `Plans/FinalGUISpec.md`.

### 16. Rich GUI text rendering fidelity belongs in PM's test matrix, separate from terminal byte fidelity

**Upstream signals.** Warp issue #12923 reports rendered Markdown/rich UI glyph misrendering where source bytes are correct but displayed glyphs are wrong. This is not a terminal PTY issue; it is a GUI rich-text/rendering stack issue.

**PM current state.** PM has GUI and terminal plans but the previous terminal protocol matrix does not cover rendered Markdown/source byte fidelity.

**Missed/underweighted delta.** Add rendered-text fixtures for:

- ASCII ligature-looking sequences (`fi`, `fl`) rendered without source mutation
- bullets, arrows, box drawing, emoji, combining marks, CJK width, zero-width joiners
- raw/source view vs rendered view parity
- copy/paste from rendered views preserving source bytes

**Target docs.** `Plans/FinalGUISpec.md`, `Plans/Plan_Document_System.md`, `Plans/Automated_Testing_System.md`.

### 17. Config/schema migration gates should test accepted/retired config names across repo, app, CLI bridge, and server bridge

**Upstream signals.** OpenCode v2 config deliberately drops/reworks legacy fields and discovers `opencode.json`/`opencode.jsonc`; OpenCode issue #8868 reports agents/commands disappearing depending on `opencode.json` vs `opencode.jsonc`. Cline and Agent Zero release issues show upgrade/migration failure and missing tags.

**PM current state.** Previous pass covered release/migration gates. This pass adds concrete config compatibility fixtures.

**Missed/underweighted delta.** Add config-name and schema migration fixtures:

- accepted current names
- retired legacy names with explicit error/help
- JSON vs JSONC handling
- generated bridge config path and cwd/profile root
- server-attached vs PM-managed config projections
- migration dry run and rollback

**Target docs.** `Plans/MCP_Integration.md`, `Plans/Provider_OpenCode.md`, `Plans/CLI_Bridged_Providers.md`, `Plans/Release_Process.md` if present.

## Covered items that do not need new generic recommendations

These were re-confirmed as mostly covered by PM's current plans, though some test fixtures above should be added:

- Generic tool permission model: covered by Tools + Permissions.
- MCP central registry and GUI rows: covered by Tools + MCP Integration.
- MCP requested/effective availability and degraded/unavailable status: covered by MCP Integration + T-088/T-089.
- MCP no-secrets adapter projection and OAuth state: covered by MCP Integration.
- Subagent/child-run identity as PM-owned rather than provider-local actor: covered by Tools.
- Terminal shell-first GUI placement and session identity: covered by Section 15.
- Terminal native renderer/anti-flicker and ring-buffer projection: covered by FinalGUISpec.
- Terminal cards versus pseudo-terminal previews: covered by FinalGUISpec.
- Runtime permission hook revalidation: covered by Permissions_System.

## Priority backlog summary

| ID | Priority | New or adjusted? | Target |
|---|---:|---|---|
| P0-MCP-LAZY-CATALOG-SHARED-RESULT-PATH | P0 | New / sharper than prior MCP lazy exposure | Lazy catalog/search with shared rich-result settlement path |
| P0-HISTORY-ADMISSION-SANITIZATION | P0 | New | Quarantine malformed provider/tool turns before durable history |
| P0-PROVIDER-CAPABILITY-EPOCH | P0 | Extends previous ContextEpoch/provider metadata recommendations | Capability/source/freshness/route-specific limits/model-switch sanitizer |
| P0-REASONING-REPLAY-MATRIX | P0 | Stronger version of previous provider-native metadata policy | Cross-provider reasoning/thinking replay/drop matrix |
| P0-MCP-TYPED-PARAM-FIDELITY | P0 | New | Native JSON type round-trip for MCP calls |
| P1-MCP-HEADER-SECRET-HOOKS | P1 | New | Runtime-only credential/header resolution hooks with recheck receipts |
| P1-CONTEXT-BUDGET-RECEIPTS-BY-SOURCE | P1 | Stronger version of prior skill/context budget | Per-source context budget accounting and GUI receipts |
| P1-INTERRUPT-CANCEL-SETTLEMENT | P1 | Extends prior heartbeat/watchdog | Stop active agent/tool calls without wiping history or false success |
| P1-TERMINAL-SEMANTIC-MARKER-PARSER | P1 | Refines prior terminal protocol matrix | OSC133/633 region/pane-aware parser and confidence tiers |
| P1-TERMINAL-CHUNK-SPANNING-PARSER | P1 | New terminal parser invariant | Escape/control state spans arbitrary PTY reads |
| P1-TERMINAL-A11Y-RANGE-MIRROR | P1 | Refines prior accessibility mirror | Visible range/position/bounds APIs, no whole-buffer blob |
| P1-TERMINAL-HOST-PROVENANCE-DOCTOR | P1 | Refines prior terminal platform matrix | tmux/SSH/mosh/ConPTY/OSC52/clipboard diagnostics |
| P1-TRACE-REDACTION-BEFORE-WRITE | P1 | New | No full prompt/request/WebSocket payloads in trace logs |
| P1-PLUGIN-EXTENSION-POINT-CONTRACTS | P1 | New | Typed extension points; no monkey patching privileged UI/store surfaces |
| P2-RICH-TEXT-RENDERING-FIDELITY | P2 | New | GUI rendered Markdown/text glyph and copy/source-byte fidelity |
| P2-CONFIG-SCHEMA-MIGRATION-FIXTURES | P2 | Extends release/migration gate | Accepted/retired config names, JSON/JSONC, bridge projection paths |

## Bottom line

The second pass does not overturn the previous reports. It narrows them. PM already has a strong central tool/MCP and GUI-terminal base. The most valuable additional work is at the boundary where real upstream systems repeatedly failed:

1. lazy tool/MCP cataloging without lossy result handling,
2. malformed provider/tool turn quarantine before history persistence,
3. provider capability epochs and model-switch sanitizers,
4. native JSON/MCP parameter fidelity,
5. terminal protocol state machines and semantic prompt marker confidence,
6. trace redaction before any persistence,
7. typed plugin/config extension points to avoid monkey-patching,
8. rendered-text fidelity separate from terminal-core fidelity.

Those are the places where OpenCode, Cline, Agent Zero, Pi, Codex, Ghostty, Warp, and tmux expose repeat failure patterns that PM can avoid before implementation.
