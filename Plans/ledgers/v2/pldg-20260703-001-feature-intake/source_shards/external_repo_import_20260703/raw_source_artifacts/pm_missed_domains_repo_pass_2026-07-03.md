# PM Fourth External Repo Pass — Missed Domains: Agent Control, Effort, Providers, Multimodal, Subagents, Logging, Looping, Memory, Resources

Date: 2026-07-03  
Scope window: approximately 2026-01-03 through 2026-07-03, with adjacent active late-2025 issues included only when they remain relevant.

## Scope

This pass re-reviewed the same external surfaces as the prior OpenCode/OpenCode v2, Cline, Agent Zero, Pi, OpenAI Codex, Ghostty, Warp, and tmux passes, but with a different lens:

- controlling agents and autonomy
- effort / reasoning / thinking controls
- provider capability and model selection
- vision and multimodal input routing
- subagent lifecycle and result authority
- context management and token efficiency
- tool-call admission and settlement
- logging, telemetry, and trace privacy
- looping / no-progress / quota protection
- agent memory and system memory management
- GUI terminal resource behavior when terminal apps are agentic

This is intentionally not another generic MCP/tools pass. PM already has extensive Tools/MCP plans. The deltas below are the sharper adapter/runtime boundaries that remain easy to miss.

## Method and honesty boundary

I treated upstream repositories as failure-family evidence, not as code to copy. Large public repos contain thousands of open and closed issues; I am not claiming that every individual issue body in every repo was manually read line by line. This pass re-scanned current issue, PR, docs, changelog, and release surfaces for the domain families above, then compared them against the PM Plans repo locally. The output is a set of concrete PM plan deltas with acceptance tests.

## PM current coverage re-checked before proposing deltas

PM is already strong in several of these areas:

| Area | Existing PM coverage observed locally |
|---|---|
| Goal/subagent runtime | `Plans/Goal_Runtime_System.md:732-805` defines model-role policy and provider-neutral escalation; `1056-1137` defines progress fingerprints, hard budgets, max_turns/max_tokens/max_parallel_agents, and parent/child goal scope/budgets; `1917-1938` defines verification repair loops and receipt authority. |
| Provider/model/effort | `Plans/Models_System.md:32-80` owns provider/model precedence across run/seam/package/node/overseer/delegated-subagent scope and requested/effective values; `382-398` records requested effort and effective provider wire values; `4551-4612` covers runtime-qualified effort and GUI disclosure. |
| Tools/MCP | `Plans/Tools.md:1009-1230` and `Plans/MCP_Integration.md` define MCP integration, naming, availability, OAuth/auth state, schema caps, degraded states, and permissions. `Plans/Tools.md:7938-8005` has tool outcome taxonomy. |
| Subagent identity | `Plans/Tools.md:2541-2595` has canonical child run identity for subagents; Goal Runtime has parent/child goal constraints. |
| Vision/media | `Plans/Media_Generation_and_Capabilities.md` has provider media taxonomy, capability telemetry, and Vision Bridge eligibility; `Plans/Models_System.md:7793-7865` has Vision Bridge requested/effective route resolution. |
| Usage/logging/storage | `Plans/usage-feature.md` and `Plans/storage-plan.md` cover seglog, usage records, context breakdown, provider/attempt joins, redb/projectors, CRC/replay, and terminal persistence. |
| Memory | `Plans/assistant-memory-subsystem.md` defines assistant-only memory, scope separation, MemoryGist records, retrieval injection, scoring, maintenance, and storage boundaries. |
| Terminal GUI | `Plans/FinalGUISpec.md` has terminal tab/pane identity, context management, terminal projection throttling/ring buffers, crash recovery, usage projections, and memory/resource risks. |

So the pass does **not** say PM lacks these concepts. It says some concepts need a unified runtime contract so the GUI/runtime can prove what happened instead of relying on scattered prose or provider behavior.

## Cross-repo findings by missed domain

### 1. Agent control must be one runtime envelope, not scattered settings

OpenCode, Cline, Agent Zero, Pi, Codex, and Warp all show the same failure class: the agent may appear to be under control, but one of the child paths, tool paths, provider paths, or UI transport paths escapes the intended limits. External signals include subagent model/effort config not being honored, subagents looping, agents spending budget on no-progress paths, and terminal-bound agents flooding UI/logs.

PM already has the right ingredients: Goal Runtime budgets, provider/model role policy, permission ceilings, and child goal IDs. The missing object is **AgentControlEnvelope**. Every agentic execution unit should carry one envelope from birth to settlement.

### 2. Effort/reasoning controls are now a correctness surface

Reasoning effort is not a cosmetic dropdown. It affects provider payloads, thinking signatures, first-token latency, cost, tool-call quality, and replay compatibility. OpenCode reports subagent reasoning-effort and Anthropic thinking-signature failures. Codex reports effort resets/ignored settings and xhigh stalls. Cline and Pi show model/provider-specific thinking setting hazards.

PM already records requested/effective effort. The delta is **EffortSettlementReceipt**: prove the requested effort, policy effort, effective wire field, provider support, display label, fallback/clamp/ignore state, and reset detection for every attempt and child/subagent.

### 3. Provider capability must be epoch-scoped and multimodal-aware

Provider catalogs are not stable truth. The repos show wrong context windows, route-specific limits, custom provider modality gaps, ghost/incorrect model metadata, prompt-cache marker differences, and usage-field differences. PM’s requested/effective provider system is good; it now needs the next object: **ProviderCapabilityEpoch**.

The epoch should cover account/profile, provider endpoint, route, model, context limit, modalities, reasoning effort support, cache policy, tool support, usage reporting, transport, source confidence, and replay policy.

### 4. Vision/multimodal input is an admission problem

OpenCode and Cline issues show images being sent to text-only models, images rejected by OpenAI-compatible adapters, wrong MIME types, model capability misclassification, and fallback-captioning pressure. PM’s media system is strong on media generation/capability, but model input needs a discrete **MultimodalInputSettlement** before the artifact enters context.

The critical rule: never silently inject unsupported images as base64 or fake text. If a non-vision route uses a caption/transcription/OCR fallback, the GUI and receipt must say that the selected model saw the caption, not the original image.

### 5. Subagents need lifecycle and result settlement, not just invocation

Subagents are useful only when their scope, model/effort, context slice, tool ceiling, timeout, progress heartbeat, result authority, and parent completion policy are explicit. Codex official docs support specialized agents and custom model configs conceptually, but issue surfaces show config and visibility gaps. Cline’s SDK migration explicitly stabilized shared task/session/subagent behavior. Agent Zero release notes show child chats, parallel tools, and await timeouts.

PM has parent/child goals and subagent hard gates in prompts. Add a runtime **SubagentExecutionContract** so the GUI/runtime can tell whether a child is running, stalled, cancelled, settled, orphaned, or authoritative.

### 6. Loop control needs a taxonomy

A single identical-tool-failure guard is not enough. The external repos show at least these loop families:

- empty assistant message loop
- no-tool/no-action reasoning loop
- repeated failed edit loop
- truncated tool-call repair loop
- MCP missing resource/list loop
- compaction no-gain loop
- first-event/transport wait loop
- subagent repeated read/search loop
- search/no-match loop
- spend/quota anomaly loop

PM already has doom-loop guards and progress fingerprints. The delta is a **LoopBreakerRegistry** keyed by loop family, fingerprint, budget, terminal action, and GUI explanation.

### 7. Tool-call settlement must happen before durable history

PM already handles invalid args and truncated tool invocations. The sharper issue from Pi/OpenCode/Cline/Agent Zero is history poisoning: malformed deltas, partial JSON/XML, duplicate/empty tool calls, nullable reasoning/content, or stringified MCP params can enter replayable conversation state if admission happens too early.

Add **ProviderToolTurnAdmissionGate** before tool execution and before durable history writes. Only settled turns should be replayable.

### 8. Logging and telemetry need redaction-before-write and quotas

Codex issues show local logs can contain paths, env vars, account identifiers, and token-like data; another issue shows heavy idle I/O. Warp shows per-character terminal logging can create floods. Pi exposes OpenTelemetry-style hooks. OpenCode integrates with external monitoring headers.

PM has seglog and usage. The delta is **TracePersistencePolicy**: classify/redact before disk, enforce log-volume quotas, prevent terminal per-character info floods, and export only redacted projections to optional OTLP/analytics adapters.

### 9. Agent memory and system memory are different systems

Agent memory failures include huge chat files, slow memory search/consolidation, and stale/superseded facts. System memory failures include GUI renderers, terminal buffers, helper processes, MCP transports, browser/device sessions, file watchers, and logs exhausting memory/CPU.

PM has assistant memory and storage plans. It should add:

- **MemoryTierContract** for transcript, goal state, project/spec ledger, assistant preference memory, artifact/tool memory, and ephemeral working set.
- **RuntimeResourceGovernor** for process/memory/queue/log/file-watcher/terminal/browser/device limits and cleanup.

## Backlog matrix

| ID | Priority | Theme | Proposal |
|---|---:|---|---|
| P0-AGENT-CONTROL-PLANE-ENVELOPE | P0 | Agent control / autonomy / effort / resource envelope | Define AgentControlEnvelope with autonomy_mode, write_surface, provider/model/effort policy, tool/MCP permission ceiling, context/token budgets, loop budgets, wall-clock budgets, terminal/browser/device authority, child-spawn policy, cancellation/steering semantics, progress heartbeat, and receipt refs. |
| P0-EFFORT-POLICY-SETTLEMENT | P0 | Reasoning/thinking/effort requested-vs-effective | Add EffortSettlementReceipt with requested_effort, policy_effort, effective_wire_effort, provider_native_field, display_label, support_source, transform_version, fallback_reason, reset_detection, first_response_latency_bucket, and model-switch replay rule. |
| P0-SUBAGENT-EXECUTION-CONTRACT | P0 | Subagent lifecycle, model/effort config, and result authority | Define SubagentExecutionContract and SubagentResultEnvelope. Child result is advisory unless marked allowed_to_write=false/true under parent policy; parent remains the only canonical writer where required. Include per-child model/effort settlement, context slice hash, tool ceiling, timeout, wait_agent/cancel semantics, and orphan reaper. |
| P0-LOOP-BREAKER-TAXONOMY | P0 | Looping / no-progress / spend control | Add LoopBreakerRegistry with typed families: identical_tool_failure, empty_assistant, no_tool_progress, repeated_edit_miss, compaction_no_gain, context_overflow_replay, MCP_resource_missing, first_event_timeout, transport_idle, reasoning_no_action, subagent_same_read, and spend_anomaly. Each family has fingerprint, max_count, required observation window, terminal action, and user-facing reason. |
| P0-MULTIMODAL-INPUT-SETTLEMENT | P0 | Vision/multimodal input admission and fallback | Add MultimodalInputSettlement: source_surface, media_type, MIME, byte_size, redaction_state, artifact_ref, model_modality_support, requested_route, effective_route, fallback_caption_route, original_retention, provider_payload_shape, and denied_reason. Never silently base64/text-inject unsupported images. |
| P0-PROVIDER-CAPABILITY-EPOCH-2 | P0 | Provider/model capability freshness and route-specific support | Define ProviderCapabilityEpoch with source, fetched_at, account/profile scope, route scope, provider endpoint, cache policy, modalities, tool capability, reasoning support, context limits, usage fields, transport support, evidence state, and invalidation triggers. |
| P0-TOOL-CALL-MALFORMATION-GATE | P0 | Malformed/truncated/partial tool-turn admission | Add ProviderToolTurnAdmissionGate. Only settled tool calls with valid schema, args, IDs, provider-native metadata, and truncation state can enter replayable history. Rejected turns become provider_turn_malformed records with raw-redacted reference and loop policy. |
| P0-LOG-REDACTION-BEFORE-WRITE | P0 | Logging, traces, diagnostics, and privacy | Add ObservabilityEnvelope and TracePersistencePolicy: sensitivity classification before persistence, bounded per-run log quotas, log sampling levels, per-character terminal log suppression, OTLP export adapter as optional, support-bundle redaction, and trace-to-usage correlation IDs. |
| P0-SYSTEM-RESOURCE-GOVERNOR | P0 | System memory/process/file-watcher/resource management | Define RuntimeResourceGovernor: memory budgets, queue budgets, process pools, stale helper reaper, file-watcher caps, terminal scrollback/transcript retention, MCP transport cleanup, crash snapshot budget, low-memory degradation mode, and GUI-visible resource alerts. |
| P1-MODEL-SELECTION-ROUTER | P1 | Model selection per role/skill/tool/subagent | Add ModelSelectionRouter with task_kind, risk_class, context_size, modalities, tool_need, verification_tier, cost_policy, latency_policy, provider availability, and fallback chain. Do not hardcode model names; use capability tiers. |
| P1-USAGE-ANOMALY-QUOTA-GUARD | P1 | Token/cost anomalies and quota protection | Add UsageAnomalyGuard: provider_usage_null, cached_tokens_unknown, token_spike, output_spike, tool_result_spike, cache_miss_churn, spend_rate_exceeded, repeated_no_progress_cost, and budget_source attribution. |
| P1-MEMORY-TIERING-CONTRACT | P1 | Agent memory, goal memory, project memory, conversation history | Add MemoryTierContract: scope, writer authority, TTL, compaction policy, retrieval trigger, injection budget, causality/supersession link, stale/retired status, consolidation timeout, and failure semantics. |
| P1-PROMPT-CACHE-STABILITY-LINTER | P1 | Prompt/cache/token efficiency hygiene | Add PromptCacheStabilityLinter: stable_prefix_hash, volatile_context_hashes, tool/schema ordering hash, skill catalog slice hash, file-list volatility, date/time/cwd injection warnings, provider cache marker support, and cache hit expectation. |
| P1-PROGRESSIVE-DISCLOSURE-TOOLS-SKILLS | P1 | Token efficiency for tools, skills, MCP, and docs | Define CapabilityCatalogMaterialization: L0 names/descriptions, L1 selected metadata, L2 full schema/instructions, L3 runtime docs/examples; all permission-filtered and cache-stable. |
| P1-TERMINAL-AGENT-OUTPUT-STORM-CONTROLS | P1 | Terminal-bound agent output storms and UI safety | Add TerminalAgentSessionMode with command detection, output-rate class, semantic prompt marker support, pasted-command safety, scrollback/token extraction budgets, detached continuation state, and per-agent log suppression. |
| P1-MULTIMODAL-FALLBACK-TRANSCRIPTION-POLICY | P1 | Fallback captioning/OCR/transcription as explicit route | Define MediaFallbackCaptionPolicy: fallback model/provider, cost/latency, user permission, original artifact retention, caption confidence, redaction, provider payload, and GUI disclosure. |
| P1-STREAM-HISTORY-COALESCER-REPLAY | P1 | Streaming/admission/replay boundary | Add StreamHistoryCoalescer with partial_delta, cumulative_snapshot, reasoning_delta, tool_call_fragment, provider_item_id, provider_error, final_assistant_turn, and durable_history_write phases. |
| P2-OTEL-EXPORT-OPTIONAL-ADAPTER | P2 | Observability export interoperability | Add OptionalObservabilityExporter: OTLP/Helicone-style adapters consume redacted seglog projections, not raw canonical logs. Export backpressure, retry, and failure never block PM execution unless policy says so. |
| P2-MODEL-CATALOG-CONFIDENCE-UI | P2 | Provider/catalog confidence and user explanation | Add ModelCapabilityConfidence UI: verified_live, provider_reported, inferred, configured_static, stale, unknown, unsupported, with last_refresh and route/account scope. |


## Detailed backlog rows

### P0-AGENT-CONTROL-PLANE-ENVELOPE — Agent control / autonomy / effort / resource envelope

**Priority:** P0

**Source Repos:** OpenCode; Cline; Agent Zero; Pi; Codex; Warp

**Observed Signal:** Repeated failures cluster around agents/subagents inheriting wrong model or reasoning effort, running in circles, spending uncontrolled budget, or continuing after transport/tool failure. OpenCode and Codex show model/effort propagation confusion; Cline and Agent Zero show loop/spend/resource failures; Warp/Codex show UI/runtime stall modes.

**Pm Current Coverage:** PM already has Goal Runtime role-policy, progress fingerprints, hard budgets, parent/child goals, verification repair loop, provider/model requested/effective identity, and approval boundaries.

**Gap:** Controls are strong but scattered. PM needs one runtime envelope every main agent, subagent, delegated thread, background goal, terminal-bound task, browser/device session, and provider attempt must carry.

**Proposal:** Define AgentControlEnvelope with autonomy_mode, write_surface, provider/model/effort policy, tool/MCP permission ceiling, context/token budgets, loop budgets, wall-clock budgets, terminal/browser/device authority, child-spawn policy, cancellation/steering semantics, progress heartbeat, and receipt refs.

**Target Docs:** Plans/Goal_Runtime_System.md; Plans/Models_System.md; Plans/Executor_Protocol.md; Plans/Tools.md; Plans/FinalGUISpec.md; Plans/storage-plan.md

**Acceptance Tests:** Every child run persists AgentControlEnvelope before first provider/tool call. | GUI can show requested/effective autonomy, model, effort, budgets, and authority. | A child/subagent cannot exceed parent ceiling even if model/tool output requests it. | Completion receipts include envelope hash and final budget state.

### P0-EFFORT-POLICY-SETTLEMENT — Reasoning/thinking/effort requested-vs-effective

**Priority:** P0

**Source Repos:** OpenCode; Codex; Cline; Pi

**Observed Signal:** OpenCode issues report subagent reasoning-effort config gaps, Anthropic thinking signature failures, and TUI display mismatches; Codex issues report reasoning resetting, ignored custom model slugs, xhigh stalls, and model/effort change failures; Pi and Cline show provider-specific thinking controls causing errors or stale settings.

**Pm Current Coverage:** Models_System already requires requested effort, effective provider wire value, unsupported/clamped effort disclosure, and runtime-qualified effort capability.

**Gap:** PM needs a settlement object that proves whether effort was honored, clamped, ignored, transformed, blocked, reset during continuation, or unsupported per provider attempt and per child/subagent.

**Proposal:** Add EffortSettlementReceipt with requested_effort, policy_effort, effective_wire_effort, provider_native_field, display_label, support_source, transform_version, fallback_reason, reset_detection, first_response_latency_bucket, and model-switch replay rule.

**Target Docs:** Plans/Models_System.md; Plans/Provider_OpenCode.md; Plans/Goal_Runtime_System.md; Plans/usage-feature.md

**Acceptance Tests:** A model switch, compaction, resume, or subagent spawn emits a fresh effort settlement. | Unsupported xhigh/high cannot display as honored. | If provider accepts request but GUI label lags, diagnostic flags display_mismatch. | Stalls before first token/reasoning item are typed separately from ordinary thinking time.

### P0-SUBAGENT-EXECUTION-CONTRACT — Subagent lifecycle, model/effort config, and result authority

**Priority:** P0

**Source Repos:** Codex; OpenCode; Cline; Agent Zero

**Observed Signal:** Codex and OpenCode expose custom/subagent model and reasoning config gaps; Cline temporarily disabled/stabilized subagents in the SDK migration and has loop reports; Agent Zero release notes show child chats/parallel tools and non-destructive await timeouts.

**Pm Current Coverage:** PM has parent/child goal runtime policy, canonical child run identity for subagents, and prompt-packet subagent hard gates.

**Gap:** PM needs a single child execution lifecycle independent of prompt packets: spawn, admitted context, first event, heartbeat, partial result, await, cancellation, orphan reap, result settlement, and parent completion gating.

**Proposal:** Define SubagentExecutionContract and SubagentResultEnvelope. Child result is advisory unless marked allowed_to_write=false/true under parent policy; parent remains the only canonical writer where required. Include per-child model/effort settlement, context slice hash, tool ceiling, timeout, wait_agent/cancel semantics, and orphan reaper.

**Target Docs:** Plans/Goal_Runtime_System.md; Plans/Tools.md; Plans/Executor_Protocol.md; Plans/storage-plan.md; Plans/FinalGUISpec.md

**Acceptance Tests:** A child can use a different allowed model/effort only if settlement proves it. | Parent cannot certify complete until all required child results are settled or explicitly waived. | Orphan helpers/processes are reaped on session close/crash/restart. | Subagent loops trip per-child and aggregate budgets.

### P0-LOOP-BREAKER-TAXONOMY — Looping / no-progress / spend control

**Priority:** P0

**Source Repos:** OpenCode; Cline; Agent Zero; Pi; Codex

**Observed Signal:** OpenCode reports empty assistant loops, MCP resource-list spend loops, compaction loops, truncated tool-call repair loops, failed edit loops, and thinking-only loops. Cline reports truncated tool-call and no-match loops. Agent Zero reports monologue/tool loops. Pi reports hung tools/transport first-event hangs.

**Pm Current Coverage:** Executor has doom-loop guard and Goal Runtime has progress fingerprints, budgets, and verification repair loop.

**Gap:** The same simple identical-failure triple will not catch compaction loops, empty assistant loops, tool-result loops, failed edit loops, prompt-cache churn, first-event hangs, no-progress reasoning, and repeated subagent file-read loops.

**Proposal:** Add LoopBreakerRegistry with typed families: identical_tool_failure, empty_assistant, no_tool_progress, repeated_edit_miss, compaction_no_gain, context_overflow_replay, MCP_resource_missing, first_event_timeout, transport_idle, reasoning_no_action, subagent_same_read, and spend_anomaly. Each family has fingerprint, max_count, required observation window, terminal action, and user-facing reason.

**Target Docs:** Plans/Executor_Protocol.md; Plans/Goal_Runtime_System.md; Plans/Tools.md; Plans/Provider_OpenCode.md; Plans/FinalGUISpec.md

**Acceptance Tests:** Fixtures for each loop family stop within bounded attempts. | Spend/quota caps terminate even when model output appears syntactically successful. | Compaction can run once or configured bounded times but cannot self-loop indefinitely. | GUI shows stopped_for_loop with fingerprint and last safe point.

### P0-MULTIMODAL-INPUT-SETTLEMENT — Vision/multimodal input admission and fallback

**Priority:** P0

**Source Repos:** OpenCode; Cline; Codex; Pi

**Observed Signal:** OpenCode issues show image attachments going to text-only models, custom OpenAI-compatible providers rejecting images, wrong MIME types, vision-enabled read failures, and auto image-to-text fallback requests. Cline reports CLI/browser automation image-format gaps. Codex IDE officially supports image generation/editing and model/context surfaces.

**Pm Current Coverage:** Media_Generation_and_Capabilities has media route taxonomy, capability telemetry, Vision Bridge eligibility, media tool contracts, and no-stale capability cache. Models_System also has Vision Bridge requested/effective route resolution.

**Gap:** PM’s media/vision coverage should be tied to provider request admission: image/PDF/audio/screenshot/file attachments need a settlement record before they can enter model-visible context.

**Proposal:** Add MultimodalInputSettlement: source_surface, media_type, MIME, byte_size, redaction_state, artifact_ref, model_modality_support, requested_route, effective_route, fallback_caption_route, original_retention, provider_payload_shape, and denied_reason. Never silently base64/text-inject unsupported images.

**Target Docs:** Plans/Media_Generation_and_Capabilities.md; Plans/Models_System.md; Plans/Tools.md; Plans/FinalGUISpec.md; Plans/Provider_OpenCode.md

**Acceptance Tests:** Text-only model + image file yields denied_or_captioned, never hidden prompt bloat. | Wrong MIME is blocked before provider request. | Vision-capable custom provider must prove modality support or fall back. | GUI can show original artifact and caption/fallback provenance.

### P0-PROVIDER-CAPABILITY-EPOCH-2 — Provider/model capability freshness and route-specific support

**Priority:** P0

**Source Repos:** OpenCode; Cline; Pi; Codex

**Observed Signal:** Repos show stale/wrong context-window metadata, route-specific limits, ghost models, model variant quirks, modality gaps, effort support uncertainty, and provider-native reasoning/tool replay drift.

**Pm Current Coverage:** Models_System has provider-owned catalogs, capability/cost gating, requested/effective identity, provider capability matrix application gate, and Vision Bridge route resolution.

**Gap:** Capabilities need epoch identity and source confidence across model catalog, context window, cache support, tool-calling, vision/media, reasoning effort, usage accounting, transport, and provider-native replay.

**Proposal:** Define ProviderCapabilityEpoch with source, fetched_at, account/profile scope, route scope, provider endpoint, cache policy, modalities, tool capability, reasoning support, context limits, usage fields, transport support, evidence state, and invalidation triggers.

**Target Docs:** Plans/Models_System.md; Plans/Provider_OpenCode.md; Plans/MCP_Integration.md; Plans/usage-feature.md

**Acceptance Tests:** Changing account/profile/route/model invalidates capability epoch. | Unknown or stale capabilities cannot present controls as supported. | Model limit and cached-token accounting show measured/provider_reported/estimated/unknown. | Provider-native replay rules are keyed by epoch.

### P0-TOOL-CALL-MALFORMATION-GATE — Malformed/truncated/partial tool-turn admission

**Priority:** P0

**Source Repos:** OpenCode; Cline; Agent Zero; Pi

**Observed Signal:** OpenCode, Cline, Agent Zero, and Pi all show broken tool-call deltas, XML/JSON fragments, nullable reasoning/content, stringified MCP params, truncation, empty tool calls, and loops when malformed turns reach history or repair logic.

**Pm Current Coverage:** Tools already has invalid arg/truncated invocation structured failures and a rich tool outcome taxonomy.

**Gap:** Malformed provider output must be stopped before durable history admission, not only before actual tool execution.

**Proposal:** Add ProviderToolTurnAdmissionGate. Only settled tool calls with valid schema, args, IDs, provider-native metadata, and truncation state can enter replayable history. Rejected turns become provider_turn_malformed records with raw-redacted reference and loop policy.

**Target Docs:** Plans/Tools.md; Plans/Prompt_Pipeline.md; Plans/Provider_OpenCode.md; Plans/storage-plan.md

**Acceptance Tests:** Partial streamed JSON/tool XML never becomes replayable assistant history. | A length finishReason on tool-call deltas blocks/retries under typed policy, not as ordinary no-tool response. | Replayed history never includes malformed or duplicate tool_call IDs.

### P0-LOG-REDACTION-BEFORE-WRITE — Logging, traces, diagnostics, and privacy

**Priority:** P0

**Source Repos:** Codex; OpenCode; Warp; Pi; Agent Zero

**Observed Signal:** Codex issues show raw logs with paths/env/account/token-like data, heavy idle I/O, and stale helper processes; Pi exposes OpenTelemetry hooks; OpenCode supports Helicone/monitoring headers; Warp issue logs show per-character terminal event floods.

**Pm Current Coverage:** PM has seglog, usage records, provider/usage join fields, terminal persistence, and runtime artifact identity.

**Gap:** Observability needs a redaction-before-write and log-volume contract shared by provider traces, WebSockets/SSE, terminal streams, subagents, tools, MCP, memory, and support bundles.

**Proposal:** Add ObservabilityEnvelope and TracePersistencePolicy: sensitivity classification before persistence, bounded per-run log quotas, log sampling levels, per-character terminal log suppression, OTLP export adapter as optional, support-bundle redaction, and trace-to-usage correlation IDs.

**Target Docs:** Plans/storage-plan.md; Plans/usage-feature.md; Plans/FinalGUISpec.md; Plans/Executor_Protocol.md; Plans/Provider_OpenCode.md

**Acceptance Tests:** Raw provider requests/WS payloads are scrubbed before disk. | Terminal huge-output fixture cannot create unbounded per-character logs. | Support bundle validator rejects secrets/env/token-like fields. | Usage/cost/log traces join by attempt_id without exposing hidden content.

### P0-SYSTEM-RESOURCE-GOVERNOR — System memory/process/file-watcher/resource management

**Priority:** P0

**Source Repos:** Ghostty; Warp; Codex; Agent Zero; Cline

**Observed Signal:** Ghostty reports major memory leaks under long-running Claude Code sessions; Warp reports CPU hangs and large-output TUI crashes; Codex reports stale Computer Use/MCP/app-server helper accumulation; Agent Zero reports large chat.json/memory scalability issues.

**Pm Current Coverage:** FinalGUISpec and storage-plan include terminal projection throttling/ring buffers, memory-bounds risks, file watcher risk, persistence, and crash recovery.

**Gap:** PM needs a cross-runtime resource governor with explicit limits and cleanup for GUI renderer, PTY terminal, agents, MCP, browser/device sessions, file watchers, logs, memory stores, and helper processes.

**Proposal:** Define RuntimeResourceGovernor: memory budgets, queue budgets, process pools, stale helper reaper, file-watcher caps, terminal scrollback/transcript retention, MCP transport cleanup, crash snapshot budget, low-memory degradation mode, and GUI-visible resource alerts.

**Target Docs:** Plans/FinalGUISpec.md; Plans/storage-plan.md; Plans/Goal_Runtime_System.md; Plans/MCP_Integration.md; Plans/Tools.md

**Acceptance Tests:** Closing/crashing PM reaps child helpers or marks them orphaned for cleanup. | Huge terminal output applies backpressure without GUI freeze. | Memory store and chat/session files have size/compaction policies. | Low-memory mode disables optional previews/agents before core runtime fails.

### P1-MODEL-SELECTION-ROUTER — Model selection per role/skill/tool/subagent

**Priority:** P1

**Source Repos:** Codex; OpenCode; Cline

**Observed Signal:** Codex discussions request per-skill model selection and issues show custom subagent model config not honored; OpenCode issues request model variants and subagent model/effort selection; Cline SDK centralizes session/Plan/Act coordination and provider migration.

**Pm Current Coverage:** PM already has provider/model precedence by scope and Goal Runtime model-role policy.

**Gap:** PM should map tasks to model/effort through a scored router instead of static defaults while preserving user policy and certification-tier rules.

**Proposal:** Add ModelSelectionRouter with task_kind, risk_class, context_size, modalities, tool_need, verification_tier, cost_policy, latency_policy, provider availability, and fallback chain. Do not hardcode model names; use capability tiers.

**Target Docs:** Plans/Models_System.md; Plans/Goal_Runtime_System.md; Plans/Plan_To_Node_Compilation.md

**Acceptance Tests:** Low-risk summarization can select cheaper model only when certification policy allows. | Verifier/adjudicator model cannot downgrade below risk tier. | Router output is requested/effective and auditable. | User can pin or forbid providers per project/account.

### P1-USAGE-ANOMALY-QUOTA-GUARD — Token/cost anomalies and quota protection

**Priority:** P1

**Source Repos:** OpenCode; Cline; Codex; Agent Zero

**Observed Signal:** OpenCode had token accounting loss with multi-step tool calls; Cline reports usage null and huge token spikes; Codex reports quota/budget anomalies; Agent Zero warns of unbounded loops/tool arguments and memory/history bloat.

**Pm Current Coverage:** usage-feature has UsageRecord and context breakdown surfaces; Provider_OpenCode maps usage_update into normalized usage events; Goal Runtime exposes max_tokens and usage_limited.

**Gap:** PM needs anomaly detection separate from ordinary usage collection.

**Proposal:** Add UsageAnomalyGuard: provider_usage_null, cached_tokens_unknown, token_spike, output_spike, tool_result_spike, cache_miss_churn, spend_rate_exceeded, repeated_no_progress_cost, and budget_source attribution.

**Target Docs:** Plans/usage-feature.md; Plans/Models_System.md; Plans/Goal_Runtime_System.md; Plans/Provider_OpenCode.md

**Acceptance Tests:** Provider usage null uses estimator and marks confidence. | Sudden token/cost jump pauses or confirms under policy. | User sees why cost was blocked/allowed. | Cache-miss churn on stable tasks is reported as optimization warning.

### P1-MEMORY-TIERING-CONTRACT — Agent memory, goal memory, project memory, conversation history

**Priority:** P1

**Source Repos:** Agent Zero; Pi; Codex; Cline

**Observed Signal:** Agent Zero reports chat history bloat and memory-search/consolidation timeouts; Pi documents context persistence and handoff to other models; Codex Goals/skills show durable objective and progressive disclosure; Cline SDK moves task history/session handling into shared runtime.

**Pm Current Coverage:** assistant-memory-subsystem is strong on assistant-only memory, scopes, gists, prompt injection, retrieval, scoring, and maintenance. PM bootstrap ledgers also capture durable design memory.

**Gap:** PM should explicitly separate memory tiers: transcript/history, operational goal state, project/spec ledger, assistant preference memory, tool/artifact memory, and ephemeral context working set.

**Proposal:** Add MemoryTierContract: scope, writer authority, TTL, compaction policy, retrieval trigger, injection budget, causality/supersession link, stale/retired status, consolidation timeout, and failure semantics.

**Target Docs:** Plans/assistant-memory-subsystem.md; Plans/Goal_Runtime_System.md; Plans/storage-plan.md; Plans/Planning_Ledger_System.md

**Acceptance Tests:** A giant chat/session file is compacted or paged before app crash. | Memory search timeout returns degraded result, not hung turn. | Project ledger facts are not injected as personal memory. | Superseded/stale memory cannot silently override current Plan canon.

### P1-PROMPT-CACHE-STABILITY-LINTER — Prompt/cache/token efficiency hygiene

**Priority:** P1

**Source Repos:** OpenCode; Cline; Pi; Codex

**Observed Signal:** OpenCode reports system-environment prompt cache invalidation and provider cache-marker gaps; Pi changelog includes prompt caching and cached-token accounting; Codex skills use progressive disclosure; Cline fixes prompt-cache detection and compaction routing.

**Pm Current Coverage:** Previous pass recommended ContextEpoch/PromptCachePolicy; PM has provider cache metadata boundaries and compaction metadata.

**Gap:** PM should add a linter/diagnostic that explains why cache hit rate is low, not only record usage.

**Proposal:** Add PromptCacheStabilityLinter: stable_prefix_hash, volatile_context_hashes, tool/schema ordering hash, skill catalog slice hash, file-list volatility, date/time/cwd injection warnings, provider cache marker support, and cache hit expectation.

**Target Docs:** Plans/Models_System.md; Plans/Prompt_Pipeline.md; Plans/usage-feature.md; Plans/Tools.md

**Acceptance Tests:** Two identical tasks show stable prefix preserved. | Moving cwd/date/git status to late volatile block improves cache expectation. | Dynamic tool result not placed before stable instructions. | GUI explains cache miss source.

### P1-PROGRESSIVE-DISCLOSURE-TOOLS-SKILLS — Token efficiency for tools, skills, MCP, and docs

**Priority:** P1

**Source Repos:** Codex; OpenCode; Cline; Agent Zero

**Observed Signal:** Codex Skills use progressive disclosure; OpenCode/Cline show tool/MCP schema bloat; Agent Zero issue notes full tool descriptions repeated into prompts.

**Pm Current Coverage:** PM has MCP schema caps, tool registry, skill/tool GUI surfaces, and tool usage rollups.

**Gap:** PM needs an explicit L0/L1/L2 materialization policy for tool, skill, MCP, media, terminal, browser, and memory capabilities.

**Proposal:** Define CapabilityCatalogMaterialization: L0 names/descriptions, L1 selected metadata, L2 full schema/instructions, L3 runtime docs/examples; all permission-filtered and cache-stable.

**Target Docs:** Plans/Tools.md; Plans/MCP_Integration.md; Plans/Models_System.md; Plans/Prompt_Pipeline.md

**Acceptance Tests:** Default context never includes all full MCP schemas. | Tool search can materialize a selected tool without losing rich-result parser path. | Permission changes invalidate catalog slice. | Token budget reports catalog materialization cost.

### P1-TERMINAL-AGENT-OUTPUT-STORM-CONTROLS — Terminal-bound agent output storms and UI safety

**Priority:** P1

**Source Repos:** Warp; Ghostty; tmux; Codex

**Observed Signal:** Warp reports TUI agent output/CPU/log floods; Ghostty reports memory leaks in long coding-agent terminal sessions; tmux prompt-marker handling shows semantic terminal metadata can be corrupted by middle layers.

**Pm Current Coverage:** PM has terminal protocol, persistence, projection throttling, ring buffers, and output retention honesty.

**Gap:** PM should add agent-specific terminal storm controls: when the terminal runs Claude Code/Codex/OpenCode/etc., PM should know it is agentic output with special backpressure and semantic-marker needs.

**Proposal:** Add TerminalAgentSessionMode with command detection, output-rate class, semantic prompt marker support, pasted-command safety, scrollback/token extraction budgets, detached continuation state, and per-agent log suppression.

**Target Docs:** Plans/FinalGUISpec.md; Plans/storage-plan.md; Plans/Executor_Protocol.md

**Acceptance Tests:** Running a high-output TUI agent does not freeze GUI or explode logs. | OSC 133/633 marker loss/degradation is visible. | PM never interprets terminal agent text as PM-native tool receipt without adapter proof.

### P1-MULTIMODAL-FALLBACK-TRANSCRIPTION-POLICY — Fallback captioning/OCR/transcription as explicit route

**Priority:** P1

**Source Repos:** OpenCode; Cline; Codex

**Observed Signal:** OpenCode requested auto image-to-text fallback for non-multimodal providers, while other issues show unsupported images causing context bloat/errors.

**Pm Current Coverage:** Vision Bridge/media routes exist, but fallback captioning should be governed separately from native vision.

**Gap:** Captioning fallback must be opt-in/visible and produce a separate artifact; it must not pretend the selected model saw the original image.

**Proposal:** Define MediaFallbackCaptionPolicy: fallback model/provider, cost/latency, user permission, original artifact retention, caption confidence, redaction, provider payload, and GUI disclosure.

**Target Docs:** Plans/Media_Generation_and_Capabilities.md; Plans/Models_System.md; Plans/usage-feature.md

**Acceptance Tests:** Non-vision model with image shows “caption fallback used,” with caption artifact and cost. | User can disable fallback. | Provider request receipt says selected model saw text caption only.

### P1-STREAM-HISTORY-COALESCER-REPLAY — Streaming/admission/replay boundary

**Priority:** P1

**Source Repos:** OpenCode v2; Pi; Codex; Cline

**Observed Signal:** OpenCode v2 separates context/source/snapshot/session history and recent releases add event streams and paged durable history. Pi reports WS/SSE first-event stalls; Cline/Codex SDKs centralize session events/history.

**Pm Current Coverage:** Prior pass recommended StreamHistoryCoalescer; storage-plan has seglog replay/checkpoints and context ownership.

**Gap:** Make settled history admission mandatory for all providers, not just context/cache pass.

**Proposal:** Add StreamHistoryCoalescer with partial_delta, cumulative_snapshot, reasoning_delta, tool_call_fragment, provider_item_id, provider_error, final_assistant_turn, and durable_history_write phases.

**Target Docs:** Plans/storage-plan.md; Plans/Prompt_Pipeline.md; Plans/Provider_OpenCode.md; Plans/Models_System.md

**Acceptance Tests:** No partial stream fragment is replayed as a full assistant turn. | Provider native item IDs are kept only where allowed by replay policy. | First-event timeout is a transport failure, not empty assistant success.

### P2-OTEL-EXPORT-OPTIONAL-ADAPTER — Observability export interoperability

**Priority:** P2

**Source Repos:** Pi; OpenCode; Codex

**Observed Signal:** Pi discussion points to OpenTelemetry event streaming; OpenCode docs support external logging/analytics integrations; Codex logs/issues show trace handling problems.

**Pm Current Coverage:** Seglog is PM’s canonical source; usage/analytics rollups exist.

**Gap:** External observability should be supported without making OTLP canonical or leaking sensitive content.

**Proposal:** Add OptionalObservabilityExporter: OTLP/Helicone-style adapters consume redacted seglog projections, not raw canonical logs. Export backpressure, retry, and failure never block PM execution unless policy says so.

**Target Docs:** Plans/storage-plan.md; Plans/usage-feature.md; Plans/Provider_OpenCode.md

**Acceptance Tests:** Exporter can be disabled globally/project. | Export failure produces degraded status only. | Redacted projection schema is documented and validated.

### P2-MODEL-CATALOG-CONFIDENCE-UI — Provider/catalog confidence and user explanation

**Priority:** P2

**Source Repos:** OpenCode; Cline; Pi

**Observed Signal:** Recent issues show model catalogs with wrong context windows, missing modalities, ghost models, static capability assumptions, and route-specific gaps.

**Pm Current Coverage:** Models_System has provider-owned catalogs and evidence states; GUI disclosure surfaces exist.

**Gap:** Expose capability source confidence in Settings/model picker so users understand why a model shows/hides vision, effort, cache, or context controls.

**Proposal:** Add ModelCapabilityConfidence UI: verified_live, provider_reported, inferred, configured_static, stale, unknown, unsupported, with last_refresh and route/account scope.

**Target Docs:** Plans/Models_System.md; Plans/FinalGUISpec.md; Plans/Provider_OpenCode.md

**Acceptance Tests:** A custom OpenAI-compatible model with unknown vision shows unknown/not supported until proven. | User can refresh/retest capability. | Hidden controls include reason.


## Repo signal matrix by domain

| Repo | Domain signals from this pass | PM lesson |
|---|---|---|
| OpenCode v1/current + v2 | Context/tool-output settlement, reasoning/effort quirks, image/modality routing, compaction loops, empty assistant/tool loops, usage/cache fields, SSE/runtime event changes. | Adopt v2-like context/tool settlement concepts but keep PM-owned contracts and use OpenCode bridge as adapter evidence. |
| Cline | SDK session layer, Plan/Act/tool coordination, compaction/mistake limits, task history, disabled/stabilized subagents, context/usage/null reporting, browser/image issues. | Centralize active session state; ensure Plan/Act/autonomy ceilings are runtime-enforced; normalize null/estimated usage. |
| Agent Zero | Chat history bloat, memory timeout/config, XML/tool parser regressions, parallel child chats, MCP/project/global config and wedged transport cleanup. | Memory and child/tool runtimes need timeouts, bounded history, and cleanup; no unbounded chat.json-style state. |
| Pi | Provider API, context persistence/handoff, prompt caching, OpenAI Responses/WebSocket/SSE first-event hangs, provider-scoped thinking controls, no built-in permission system. | Use explicit transport timeout and permission envelopes; track provider-specific cache/effort support by epoch. |
| OpenAI Codex | Goals, subagents, skills progressive disclosure, app/IDE reasoning controls, model selection, logs/privacy, stale helpers, effort reset/ignored, xhigh stalls. | PM Goal Mode should externalize state and receipts; subagent model/effort must settle; logs must be redacted before write. |
| Ghostty | Memory leaks under long-running coding-agent terminals, parser fuzzing/tripwire, terminal correctness under heavy output. | Terminal engine must have fuzz/replay fixtures, resource governor, and no silent output/log growth. |
| Warp | Terminal + agent modes, context-window UI, MCP auto-spawn, context blocks, output/log/CPU freezes, conversation restore. | PM terminal is GUI-native; treat terminal-bound agents as high-output, resumable, resource-governed sessions. |
| tmux | OSC 133/semantic prompt marker pass-through and terminal integration edge cases. | PM terminal should preserve/degrade semantic prompt markers explicitly, especially when nested through shells/multiplexers. |

## What not to duplicate

1. Do not add another generic MCP permission model. PM already has MCP identity, auth, availability, naming, schema caps, degraded states, and permissions. The new work is lazy materialization + settlement + resource governance.
2. Do not make WebSocket the default for every provider. Use WebSockets for PM-owned GUI/runtime control surfaces; provider transport remains adaptive to the provider’s official stable stream.
3. Do not copy CLI product shape from Codex, OpenCode, Warp, or tmux. PM is GUI-native. Borrow runtime contracts, not UX identity.
4. Do not rely on prompt instructions for Plan/Act safety, subagent limits, or loop control. The runtime must enforce ceilings and produce receipts.
5. Do not treat token/cache improvements as correctness. Correctness comes from context identity, durable history, tool settlement, and verification receipts. Cache only improves cost/latency.

## Highest-priority synthesis

The largest missed area is not a single topic from the user list. It is the need for a **unified runtime contract around agentic execution**. The repos show the same bug under many names:

- model/effort not actually honored
- child agent inherits wrong settings
- vision input accepted by wrong route
- tool-call fragment becomes durable history
- compaction or edit failure loops indefinitely
- token/cost usage is missing or wildly wrong
- logs or terminal output overwhelm the app
- helper processes survive after the run
- user sees “thinking” while nothing durable has happened

PM’s Plans already cover many individual pieces. The next improvement should be to bind them into three cross-cutting runtime objects:

1. **AgentControlEnvelope** — who/what may act, with which model/effort/tools/context/budgets/write surfaces.
2. **ProviderCapabilityEpoch** — what the provider/model/route/account actually supports at this moment.
3. **RuntimeSettlementReceipts** — what actually happened for effort, multimodal input, tool turns, streams, subagents, memory, logs, and resources.

If PM adds those three abstractions and the backlog above, it will avoid many failure classes the external repos are still working through.
