# Working Ledger

## Work Item
w-20260328-192850

## Mode
research

## Topic / Scope
1. Evaluate Google A2A protocol v1.0.0 for PM agent/subagent orchestration (COMPLETE — REJECTED)
2. Deep-dive OpenCode (anomalyco/opencode) GitHub issues to learn from their failures and strengthen PM's implementation (COMPLETE — 10 categories, 500+ issues analyzed)

## Objective
Phase 1: Determine whether A2A should be adopted for PM internal agent/subagent control. → REJECTED
Phase 2: Systematically catalog OpenCode's architectural failures across 10 categories and extract actionable lessons for PM's design to avoid the same mistakes.

## Constraints / Non-Goals
- Do NOT look at old code (puppet-master-rs/ etc) -- only Plans/ docs
- Research scope: A2A protocol spec, OpenCode repo issues/PRs, PM Plans/ architecture
- Non-goal: implementing A2A during this research phase
- Non-goal: external agent marketplace/discovery features (unless they emerge as the right use case)

## Key Facts and Findings

### A2A Protocol v1.0.0 Architecture
- Transport: JSON-RPC 2.0 over HTTP(S), with gRPC and HTTP+JSON/REST bindings
- Core primitives: AgentCard (discovery), Task (stateful work unit), Message (turn), Part (content), Artifact (output)
- Task states: submitted > working > input-required/auth-required > completed/canceled/rejected/failed
- Three delivery modes: request/response (polling), SSE streaming, push notifications (webhooks)
- Agent discovery via AgentCard JSON at well-known URL
- contextId groups related Tasks; Tasks immutable once terminal
- Extensions system: URI-identified, negotiated per-request via A2A-Extensions header
- Auth: API key, HTTP auth, OAuth 2.0, OpenID Connect, mTLS -- all transport-layer
- Designed for inter-organization agent communication (different vendors/services)

### A2A Critical Gaps (for PM use case)
- NO token/usage/billing tracking primitives -- no token count fields in responses, no cumulative usage per task/context
- NO cache control primitives -- no way to signal cache-friendly content separation
- Agents are opaque -- internal tool usage, LLM calls, token consumption NOT exposed
- NO budget enforcement -- no max_tokens, max_wall_time, kill conditions
- NO tool policy control -- cannot restrict what tools an A2A agent uses
- NO execution strategy control -- no HTE/DAE equivalent
- NO file-level coordination -- no mechanism to prevent concurrent file edits
- NO permission inheritance -- child agents do not inherit parent constraints (OpenCode proved this is broken)
- NO prompt pipeline integration -- messages are opaque text, no stage-based assembly
- Usage must be hacked in via custom metadata extensions (non-standard, unreliable)

### PM Architecture (from Plans/ docs)

#### Provider System
- Three transport types: CLI-bridged (Cursor, Claude Code), Server-bridged (OpenCode), Direct (Codex, Copilot, Gemini)
- Unified provider facade (INV-009) -- consumers MUST NOT branch on transport type
- Normalized event stream with usage tracking: text_delta, thinking_delta, tool_use, tool_result, usage, auth_state, diagnostic, error, done
- Every tool_use has exactly one matching tool_result (INV-001)
- Exactly one done event per run (terminal); seq strictly increasing per run_id

#### Execution Strategies
- HTE (Hosted Tool Execution): Provider is read-only reasoner, PM executes ALL tools -- default for ask/plan/regular
- DAE (Delegated Agent Execution): Provider executes tools in jailed workspace with mandatory end-of-run scans -- for yolo mode
- Kill conditions: hte_tool_observed, budget ceiling exceeded, write thrashing, consecutive failures

#### Subagent Orchestration
- Child-run identity: run_id, thread_id, parent_run_id, child_run_id -- PM-native, not provider-specific
- Dynamic subagent selection per tier based on language/framework/domain detection
- Frozen runtime snapshot per tier (immutable once execution starts)
- File-based message board for agent coordination (agent-messages.json)
- Crew coordination with broadcast + direct messaging, priority levels, message kinds
- Rate limiting: max 10 messages/agent/minute
- Orchestrator has FULL VISIBILITY into all subagent communication

#### Token/Usage Tracking
- UsageEvent: input_tokens, output_tokens, cache_read_input_tokens, cache_creation_input_tokens, total_tokens, cost_usd
- Seglog (SSOT) > analytics scan > redb rollups > UI consumption
- Per-run, per-platform, 5h/7d aggregation windows
- Billing entity attribution: account_id, billing_entity_id, entitlement_class
- No secrets in any persistent storage (INV-002)

#### Prompt Caching Strategy
- 9-stage deterministic prompt pipeline (same inputs > same prompt)
- Cache-friendly content separation: stable static content cached; dynamic not cached
- Role-specific context compiler cuts coordination overhead 40-60%
- Compaction-aware re-reads to avoid redundant full re-reads
- Skill bundling: once per phase, not repeated per task

### OpenCode Issues -- Critical Findings

#### Billing/Token Accuracy Problems (SEVERE)
- Token counts 40x+ off vs actual provider billing (#5951)
- Cache write tokens not tracked for OpenRouter (#18440)
- Spending limits ignored -- 5 EUR limit hit 43 EUR (#11208)
- Cost always $0 for Copilot provider (#2891)
- Session title/summary token costs NOT tracked (#7175)
- AWS Bedrock pricing off by 5x (#16763)
- Estimated waste: $155-800/user/month

#### Prompt Caching Issues (CRITICAL)
- Google Vertex AI/Google AI missing cachePoint annotations -- 5-15K tokens RE-BILLED per request (#17568)
- Thinking blocks stripped from history > KV cache invalidation on replay (#19081)
- Token counting shows 2x actual > premature compaction at 64k instead of 128k (#3314)
- Compaction threshold hardcoded to 200k instead of actual 1M > 6x premature compaction (#15871)
- OAuth + cache_control causes HTTP 400 on Claude (#17910)

#### Subagent Architecture Problems (CRITICAL)
- Infinite recursion: 47 sessions, 20 nesting depth, 18 layers of explore>explore -- exponential cost (#18100)
- Plan mode security bypass: subagents ignore parent read-only restrictions (#6527)
- Truncated tool calls > doom loop hang 20-30 minutes (#18108)
- 20+ concurrent subagents cause deadlock (#18386)
- Subagent sessions NEVER deallocated > GB-scale memory growth (#16697)
- Wrong agent dispatch in nested sessions (#16303)

#### A2A Community Interest
- Agent Teams design proposal: parallel agents, named messaging, multi-model (#12711)
- Configurable A2A delegation with call limits (#7296)
- Feature requests for async/background delegation (#5887)
- Current model: single synchronous task tool, no parallel execution

## Gaps / Problems Identified

### Gap 1: A2A Adds Opacity Where PM Needs Transparency
- PM orchestrator requires full visibility into token usage, tool calls, reasoning
- A2A treats agents as opaque black boxes by design
- PM already has superior internal observability via normalized event stream

### Gap 2: A2A Would Destroy Prompt Caching
- Each A2A task creates a new HTTP session with fresh context
- Provider prompt caching relies on STABLE PREFIXES across turns within a session
- PM 9-stage prompt pipeline carefully separates stable/dynamic content for cache hits
- A2A messages do not preserve provider-native cache control signals
- OpenCode already loses $155-800/user/month to caching bugs -- A2A would make this worse

### Gap 3: A2A Cannot Track Billing/Usage
- No standard token count fields -- must use custom metadata (non-standard)
- OpenCode already has 40x billing accuracy problems
- Adding A2A as intermediary adds ANOTHER layer where usage data can be lost
- PM normalized usage event is superior: tracks input_tokens, output_tokens, cache_read, cache_creation, cost

### Gap 4: A2A Cannot Enforce Execution Policy
- No HTE/DAE equivalent -- cannot control whether agents use tools or just reason
- No budget enforcement (max_tokens, max_wall_time, kill conditions)
- No permission inheritance -- OpenCode proved subagents bypass parent restrictions (#6527)
- No tool policy snapshot -- cannot restrict what an A2A agent does internally
- No write thrashing detection, no concurrent edit prevention

### Gap 5: A2A Adds HTTP Overhead to In-Process Communication
- Current PM subagent communication is in-process (file-based message board)
- A2A requires HTTP round-trips for every message exchange
- SSE connection setup overhead per task
- AgentCard discovery adds latency before first message
- No benefit for internal orchestration where PM already controls both sides

### Gap 6: Provider Support Is Misleading
- Providers support A2A means providers can ACT AS A2A agents (external-facing)
- But PM does not need providers to be A2A agents -- PM orchestrates them directly via CLI/server/direct transports
- A2A support means providers can RECEIVE A2A tasks, not that A2A improves how PM talks to them
- The transport PM uses (CLI subprocess, HTTP server, direct API) is orthogonal to A2A

## Candidate Fixes / Design Directions

### Direction 1: REJECT A2A for Internal Orchestration (RECOMMENDED)
- PM existing architecture is significantly more capable than A2A for internal use
- PM already has: usage tracking, cache-friendly prompting, execution strategies, budget enforcement, tool policy, full observability
- A2A would require PM to LOSE capabilities to gain protocol compliance
- Net assessment: A2A adds overhead and opacity with no compensating internal benefit

### Direction 2: ADOPT A2A for External Interop Only (FUTURE FEATURE)
- Expose PM as an A2A-compatible agent to external callers
- Connect to external A2A agents as additional tool/service sources
- This is ADDITIVE -- does not replace internal orchestration
- Would require an A2A gateway/adapter layer that translates between PM internals and A2A protocol
- Scope: not MVP, not current priority

### Direction 3: BORROW Selectively from A2A Concepts
- AgentCard pattern could inspire PM subagent capability advertisement
- Task state machine maps loosely to PM tier states
- contextId grouping concept already exists in PM as thread_id
- Extensions system could inspire PM provider capability negotiation
- But PM already has all these concepts in more capable form

### Direction 4: Strengthen PM Existing Orchestration (BIGGEST WIN)
Instead of A2A, fix the real problems OpenCode exposed:
- Implement recursion depth limits for subagent spawning
- Implement proper permission inheritance (parent constraints > child)
- Implement subagent session cleanup / deallocation
- Implement accurate token counting across all providers
- Implement cachePoint annotations for all providers
- Fix thinking block handling for KV cache preservation
- These are the problems that actually cost money and break workflows

## Impacted Docs
- Plans/orchestrator-subagent-integration.md -- would need A2A adapter if adopted
- Plans/CLI_Bridged_Providers.md -- transport normalization layer
- Plans/Provider_OpenCode.md -- server-bridged transport
- Plans/Contracts_V0.md -- event schema would need A2A mapping
- Plans/Run_Modes.md -- execution strategy enforcement
- Plans/Prompt_Pipeline.md -- cache-friendly prompt assembly
- Plans/Provider_Stream_Mapping_External_Reference_A2A.md -- already has V0-to-A2A event mapping

## Decisions Already Resolved
- A2A spec v1.0.0 is the evaluation target (latest stable)
- Research restricted to Plans/ docs (not old code)
- Three-way comparison: A2A vs OpenCode patterns vs PM architecture
- All six PM providers must be assessed: Cursor, Claude Code, OpenCode, Codex, Copilot, Gemini

## Open Questions / Uncertainties
- Is the user considering A2A for internal orchestration (PM-to-PM subagents) or external interop (PM-to-third-party agents)?
- Would the user accept A2A for external interop only as a future feature rather than current adoption?
- Are there specific A2A concepts the user wants to borrow without adopting the full protocol?
- Should PM expose itself as an A2A-compatible agent to allow external orchestrators to invoke it?
- Does the user statement most/all providers support it refer to A2A agent support or something else?

## Packetization Notes
- This research strongly recommends AGAINST A2A for internal orchestration
- If user agrees, packetization would focus on strengthen existing orchestration direction
- If user wants external interop, that is a separate work item (A2A gateway/adapter)
- Key evidence: OpenCode billing/caching problems prove that adding abstraction layers makes tracking HARDER, not easier

## Phase 2: OpenCode Deep-Dive — 10 Category Analysis (500+ issues)

### Category 1: Streaming/Connection Failures
- SSE setup failures: missing Accept headers (#834), 401 hangs without OAuth flow (#1492)
- Silent stream hangs: CPU spikes, deadlocks in stream processing (#2940, 11 reactions)
- JSON/NDJSON parsing: chunk boundary violations with Chinese LLM providers (GLM-4.7, GLM-5, Kimi)
- Tool argument corruption: truncated JSON, parameter duplication, 80-90% failure rate on some models
- No recovery mechanisms: no exponential backoff, no circuit breaker, no partial response handling
- Thinking/reasoning blocks: out-of-order delivery via proxies (LiteLLM/Bedrock) crashes state machine
- **PM LESSON**: Smart buffering, provider-specific transport adapters, flexible state machine tolerating reordering, circuit breaker after N retries

### Category 2: Cost/Billing Tracking
- Token counting 40x off (#5951): subagent costs NOT included in parent display (13x underreporting)
- Cache token miscounting (#11170): cache reads counted toward input tokens, 10-15x overcharge display
- Cost goes NEGATIVE on model switch (#7387, #6989): sign-flip bug in multi-model cost aggregation
- Spending limits completely ignored (#11208): €5 limit → €43 actual (8.6x over)
- Hidden operations: title generation, message summaries use Claude Haiku BY DEFAULT, billed silently (#10272)
- Every message sent to BOTH main model AND hidden small_model (privacy + cost issue)
- Long sessions (100+ messages): cost calculated from only last ~100 messages (#7767)
- **PM LESSON**: Segregate ALL token types (input, output, cache_read, cache_write, reasoning). Track ALL LLM calls including background ops. Client-side spending limit enforcement. Per-message model attribution. Subagent costs MUST aggregate to parent.

### Category 3: Auth/Credential Management
- Token refresh is REACTIVE only — fails mid-session when tokens expire (#9711, #9111)
- Anthropic OAuth refresh tokens have short lifetime; usage-limit resets invalidate them (#15562)
- Stored OAuth silently overrides explicit config (#10950) — opposite of user expectation
- Secret leakage: .env files exposed to LLM via read tool bypassing .gitignore (#12196)
- Error messages hide real cause: 401 vs 429 vs quota-exceeded all collapse to "Token refresh failed"
- Windows OAuth callback failures (#18362, 31 reactions)
- No session-to-request auth binding: can't track which account used for which request
- **PM LESSON**: Proactive token refresh (heartbeat), explicit precedence order (config > stored), strict secret scrubbing, differentiate 401/429/quota errors, platform-specific OAuth testing

### Category 4: Orchestration/Agent Control
- Permission inheritance COMPLETELY BROKEN: subagents don't inherit parent restrictions (#12566, #6527)
- Plan mode bypass: model explicitly spawns subagent to escape read-only mode (#6527, CRITICAL)
- Permission replacement instead of merge: prompt.ts replaces session.permission instead of merging (#6527 — 3 distinct bugs)
- MCP tools blocked in subagents: permissions don't cascade (#16491)
- Infinite recursion: 47 sessions, 20 depth, 18 layers explore→explore (#18100)
- Task tool wrong agent dispatch in nested sessions (#16303)
- Plugin hooks bypassed by subagents (#5894): security policies circumventable via delegation
- Task tool ignores per-target deny rules / self-dispatch (#11324)
- Task tool timeouts: tasks >60s return session_id, then subagent dies (#6792)
- Subagent sessions can't be re-entered for multi-turn workflows (#11012)
- No inter-agent messaging, no shared state, no task queue (#19215, #19506, #17374)
- **PM LESSON**: Permissions MUST be additive-downward (child only MORE restrictive). Never REPLACE, always MERGE. Recursion depth limits mandatory. Permission chain: Parent Agent → Parent Session → Child Session → Child Agent. Hooks/policies must apply to ALL tool execution regardless of agent type.

### Category 5: Tool Execution
- 598+ tool call error issues — tool validation is the #1 failure bottleneck
- Doom loops (39 issues): exact-match detection fails on variable truncation points (#12234, #18108)
- Truncation misclassified as invalid tool (#18108): OUTPUT_TOKEN_MAX=32k caps Opus at 25%, thinking budget competes with output, finishReason "length" not in exit list
- Sub-agent hangs: doom loop → PermissionNext.ask() → Deferred.await() has no timeout → 20-30 min blocks
- Tool argument validation absent: unquoted values (GLM), XML tags (Qwen), stringified JSON, duplicate params
- Bash tool timeouts (518 issues): no configurable timeout, interactive commands block, no watchdog
- Tool result correlation broken: tool_use IDs without matching tool_result blocks (#10616) — protocol violation
- Empty tool_result crashes Anthropic API (#15371)
- **PM LESSON**: Pre-execution validation layer (JSON schema + provider-specific normalization). Max retry limits PER error type. Tolerant doom loop detection (similar, not exact). finishReason="length" MUST block tool execution. Hierarchical timeouts with deadline propagation. Headless mode: default "deny" not hang.

### Category 6: Memory Leaks/Resource Management
- 111GB virtual memory / 21GB RSS causing kernel soft lockups (#13230) — 7/8 CPUs locked 356s
- 50GB disk swell + macOS kernel panics — daily forced restarts (#12687)
- 19GB orphaned zombie processes from missing SIGHUP handlers (#10563, #12913)
- SYSTEMIC "create but never cleanup" pattern in EVERY subsystem
- AsyncQueue never terminates (util/queue.ts) — infinite iterator
- Bash tool O(n²) string concatenation: output += chunk → 244MB → 1.5GB in 35 min
- LSP diagnostics Map never cleared — monotonic growth
- Bus subscription leaks — listeners accumulate on every re-render
- NO signal handlers at all (SIGTERM, SIGINT, SIGHUP all unimplemented)
- Child processes spawned with detached:true, no lifecycle management
- 23 community PRs fixing leaks, 0 merged in 63 days (#16697)
- **PM LESSON**: Mandatory dispose pattern for ALL resources from day 1. Bounded collections with LRU/TTL eviction. Ring buffers (10MB max) for output instead of string +=. Signal handlers registered BEFORE event loop. Process group management (setpgid + kill -pgid). Self-monitoring: RSS tracking every 60s, alert if >100MB/min growth.

### Category 7: MCP/Protocol Issues (216 issues)
- Startup timeout = hard fail instead of lazy-load (#13672): 10s default not configurable
- Runtime tool list failure permanently deletes MCP client from singleton state (#17099, CRITICAL): one transient listTools() failure → tools vanish forever, no retry, no reconnect
- OAuth token immediately overwritten after successful browser callback (#17822, CRITICAL): race condition, new clientId registered every call
- OAuth flow never re-initiated after token loss (#16893, #18130): browser flow only triggered once
- Circular JSON Schema $ref causes RecursionError (#16899): crashes tool registration for DataHub, Supabase etc.
- Tool wrapper sends extra _placeholder param causing ZodError (#15041)
- Windows MCP subsystem entirely unresponsive (#16449)
- WSL/container OAuth callback unreachable (#9081): hardcoded 127.0.0.1
- Process orphaning: missing SIGHUP → 66GB RAM from 14 orphaned processes (#14504)
- Configuration format diverges from MCP spec standard (#15790)
- Gemini schema incompatibility: rejects anyOf, const, $ref, contentEncoding (#15408, #12295)
- **PM LESSON**: Lazy-load pattern for MCP startup (timeout = "still loading" not "broken"). Cache tool list between LLM steps (TTL-based), not re-fetch every prompt. Retry 2-3x with backoff before evicting client. Stable clientId singleton with file locking for OAuth. Cycle detection in schema resolver. Model-specific schema sanitizers. Configurable callback bind address for containers.

### Category 8: Provider Compatibility
- Azure AI Claude rejects assistant message prefill (#19517): works on direct Anthropic, fails through Azure/LiteLLM
- MiniMax M2.7 crashes on concurrent tool calls (#19463): different JSON structure for parallel tools → hard TUI crash
- Stale assistant history replayed into new prompts (#19548): model gets confused about current task
- Large image payloads cause permanent session breakage (#19525): oversized image persists in history
- Gemini rejects schemas with anyOf/const/$ref/contentEncoding (#15408, #12295, #12908, #14509)
- HuggingFace mirror ignores HF_ENDPOINT env var (#19504): ECONNRESET in restricted networks
- Each provider formats tool calls differently (OpenAI vs Anthropic vs MiniMax vs Gemini vs Bedrock)
- **PM LESSON**: Provider capability declarations (supportsAssistantMessagePrefill, supportsParallelTools, maxPayloadSize, etc.). Provider-specific message normalizers. Provider-specific tool call parsers. Provider-specific schema sanitizers. Pre-flight validation for payload limits. PM's INV-009 unified facade is exactly right — OpenCode proves what happens without it.

### Category 9: File Editing/Data Safety
- Silent git add failures → stale snapshot hashes → /undo reverts to weeks-old state (#10589, #12719, CRITICAL): .nothrow() swallows fatal errors, ALL subsequent snapshots poisoned
- Unrevert from subdirectory overwrites files in OTHER directories (#7775): shared snapshot index across sessions
- /undo and /redo don't revert file edits on first use (#4704, 10 upvotes): snapshot not initialized
- Disk space exhaustion → file truncation to 0 bytes (#7607): non-atomic writes
- SQLite database corruption on NFS (#14970): WAL mode + NFS shared memory = immediate corruption, 45MB→191MB growth
- Concurrency bug: session's own edits trigger "file modified since last read" false positives (#4079)
- Windows bash tool: path corruption (C:\\Users → C:Users) from escape sequence interpretation (#15810)
- EXPERIMENTAL_MARKDOWN silently drops last table row (#15244)
- **PM LESSON**: FileSafe MUST use atomic writes (temp + fsync + rename). Pre-write backups. Explicit exit code checks on ALL git/shell operations (never .nothrow() without validation). Per-session snapshot trees (not shared). NFS detection + local fallback for SQLite. Modification token tracking (not mtime-based). User-facing warnings for degraded states. Self-healing recovery tools.

### Category 10: Session/State Management
- Compaction strips instruction context (#16960): post-compaction agents lose AGENTS.md/CLAUDE.md behavioral rules — empty system prompt to compaction LLM
- Infinite compaction loop (#19410, #15533): synthetic "Continue..." injected when assistant already finished → disk fills in minutes
- Large AGENTS.md triggers immediate compaction (#18037): 331KB file = 81% of 128K context on first turn → loop before doing anything useful
- Stale assistant progress text replayed into new prompts (#19548): historical assistant turns serialize ALL intermediate progress
- Synthetic [SYSTEM] text leaks into user messages (#19405): model misattributes synthetic instructions to user
- Multi-instance state corruption (#19436, #19536): kv.json, prompt-history.jsonl overwritten by concurrent instances — last-write-wins, no locking
- Database locked under multi-terminal use (#19521): SQLite concurrency not handled
- Snapshot path migration breaks pre-existing sessions (#19437): v1.3.3 changed gitdir path, no migration for old objects
- Context budget invisible to agents (#19471): agents can't make informed decisions about research depth or when to summarize
- No task-based checkpoints (#19384): long sessions vulnerable to total loss
- **PM LESSON**: Compaction MUST preserve instruction context. Smart synthetic continue (check finish state, don't inject blindly). Cap instruction file injection with on-demand reading. Selective history serialization (last step only for historical turns). Strict message boundary markers (user/assistant/system/synthetic). Atomic writes + file locking for all shared state files. Storage versioning with migration pipeline. Expose context budget to agents. Checkpoint markers in seglog for recovery.

## Gaps / Problems Identified

### Gap 1–6: A2A Protocol Gaps (unchanged from Phase 1)
(See above — A2A adds opacity, destroys caching, can't track billing, can't enforce execution policy, adds HTTP overhead, provider support is misleading)

### Gap 7: Tool Execution Validation Layer
- OpenCode has NO pre-execution validation — 598+ tool call errors
- PM Plans/ docs define tool correlation (INV-001) but don't specify pre-execution schema validation
- Need: JSON schema validation + provider-specific normalization BEFORE tool dispatch

### Gap 8: Doom Loop / Retry Strategy
- OpenCode has unlimited retries with exact-match doom detection (fails on variable truncation)
- PM Plans/ docs define kill conditions (consecutive failures) but don't specify per-error-type retry limits
- Need: Error classification (retryable/fatal/recoverable) with category-specific max attempts

### Gap 9: Resource Lifecycle / Disposal Pattern
- OpenCode has systemic "create but never cleanup" across ALL subsystems
- PM Plans/ docs don't yet define mandatory disposal patterns or self-monitoring
- Need: Disposal checklist for every resource type, RSS self-monitoring, bounded collections

### Gap 10: MCP Resilience
- OpenCode's MCP subsystem permanently fails on any transient error
- PM Plans/Tools.md defines central registry but doesn't specify retry/reconnect for MCP lifecycle
- Need: Lazy-load startup, cached tool lists, retry before eviction, stable OAuth state

### Gap 11: Compaction Context Preservation
- OpenCode strips ALL instruction context during compaction — agents lose personality/rules
- PM Plans/Prompt_Pipeline.md has 9-stage pipeline but compaction behavior not fully specified
- Need: Instruction preservation through compaction, smart synthetic continue logic

### Gap 12: File Safety Under Concurrent/Adverse Conditions
- OpenCode has non-atomic writes, shared snapshot indexes, NFS-incompatible SQLite
- PM Plans/FileSafe.md exists but should validate it covers: atomic writes, NFS detection, per-session isolation
- Need: Verify FileSafe design covers all 8 failure modes discovered

## Impacted Docs
- Plans/orchestrator-subagent-integration.md — permission inheritance, recursion limits, lifecycle, coordination
- Plans/CLI_Bridged_Providers.md — streaming resilience, transport adapters, error normalization
- Plans/Provider_OpenCode.md — server-bridged transport, auth handling
- Plans/Contracts_V0.md — event schema, usage tracking, tool correlation enforcement
- Plans/Run_Modes.md — execution strategy enforcement, permission chain
- Plans/Prompt_Pipeline.md — compaction context preservation, instruction capping
- Plans/Tools.md — tool registry resilience, MCP lifecycle, schema validation
- Plans/FileSafe.md — atomic writes, NFS detection, per-session isolation, concurrent safety
- Plans/storage-plan.md — seglog checkpoints, migration versioning, multi-instance coordination
- Plans/Permissions_System.md — additive-downward inheritance, merge-not-replace semantics
- Plans/Provider_Stream_Mapping_External_Reference_A2A.md — existing A2A mapping reference

## Decisions Already Resolved
- A2A spec v1.0.0 is the evaluation target (latest stable)
- Research restricted to Plans/ docs (not old code)
- A2A REJECTED for internal orchestration (Phase 1 conclusion, user agreed)
- Phase 2 pivot: learn from OpenCode's mistakes to strengthen PM implementation
- All 10 deep-dive categories completed with 500+ issues analyzed

## Phase 3: Gap Analysis — PM Plans/ Docs vs OpenCode Failures

### FULLY COVERED (PM design already handles these — no action needed)
1. **Tool result correlation (INV-001)** — Every tool_use gets matching tool_result or synthetic one; orphaned IDs impossible. Contracts_V0 + CLI_Bridged_Providers reconciler.
2. **Kill conditions** — 9 named kill conditions (token ceiling, wall-clock, filesafe violation, shell_failure, write_thrash, post_scan_failure, etc.). Run_Modes §5.
3. **Tool timeouts** — Per-tool defaults (bash 120s, web 30s, LSP 10s, glob 15s), configurable per-run, wall-clock budget. Tools §3.5.
4. **Plan/ask mode bypass prevention** — AC-04, AC-13 explicitly prevent read-only parent widening into execution child. Run_Modes §9.1-9.2.
5. **Permission chain** — 7-step resolution algorithm: parent ceiling → child narrowing → persona → project → global → defaults. Permissions_System §8.
6. **Subagent cost aggregation** — Child→parent cost aggregation mandatory via canonical runtime records. usage-feature.md §344-358.
7. **Per-model cost breakdown** — UsageSummaryEvent includes model field, per-model attribution in details. Provider_Stream_Mapping + usage-feature.
8. **Secret safety (.env protection)** — Comprehensive: FileSafe security filter, INV-002 no-secrets-in-storage, path-based sensitive patterns, mandatory scrub pipeline.
9. **Auth precedence order** — Config > stored explicit. Multi-Account.md locked.
10. **Infinite compaction loop prevention** — Synthetic "Continue..." replay explicitly forbidden. Prompt_Pipeline §2.3.
11. **Context budget visibility** — Full visibility: per-thread token counts, context-usage bar, truncation reason, injected-context breakdown. assistant-chat-design §12.
12. **Checkpoints & crash recovery** — Seglog checkpoint model, projector restart from last checkpoint, no-duplicate guarantee. storage-plan §2.4.
13. **History serialization boundaries** — Deterministic message boundaries, frozen runtime snapshots, no stale replay. Prompt_Pipeline §1.2-1.3.
14. **Database safety (SQLite avoidance)** — PM uses seglog + redb, not SQLite. Single-writer guarantee. storage-plan §2.3.
15. **Hidden operations tracking** — Normalized event stream captures ALL provider events; no silent background calls by architecture.

### PARTIALLY COVERED (Foundation exists, specific gaps remain)
16. **Permission inheritance granularity** — Framework exists (parent ceiling, child narrowing), but per-tool pattern inheritance not detailed. Permissions_System §8.
17. **Merge-not-replace semantics** — Precedence layers defined, but explicit "never replace" rule implicit not explicit.
18. **Max concurrent subagents** — Crew-level limits specified, but per-agent concurrency and defaults are gaps. orchestrator-subagent §Gap #40.
19. **Per-task timeout override** — Per-run budgets exist, per-subagent/per-task not specified.
20. **Workspace isolation** — DAE jail + external_directory guard exist, but no per-subagent path filtering in HTE. Permissions §3.3-3.4, Run_Modes §2.2.
21. **Tool dispatch isolation enforcement** — End-of-run scans specified (post-hoc), but pre-dispatch path validation is a gap.
22. **Tool argument validation** — Malformed JSON recovery exists in reconciler, but no PRE-execution schema validation layer. CLI_Bridged_Providers §3.
23. **Doom loop / retry strategy** — Error classification mandatory + max_retryable_errors=3 ceiling, but no per-error-type limits, no variable-truncation detection. Executor_Protocol §7, Run_Modes §5.
24. **Truncation handling** — Token ceiling + output caps exist, but finishReason="length" not explicitly handled; truncated empty {} not blocked. Run_Modes §4.
25. **Streaming resilience** — Retry/backoff mentioned as "runtime policy", circuit breaker in lessons, but no algorithm/constants specified. Provider_OpenCode §13.
26. **Error differentiation (401/429/quota)** — 401 and rate-limit separated in Provider_OpenCode, but quota-exceeded handling vague.
27. **Provider capability declarations** — Lesson documented (supportsAssistantMessagePrefill, maxPayloadSize), but NO schema defined anywhere.
28. **Token type segregation** — Architecture aware of cache_read/cache_write/reasoning, but storage schema not locked in reviewed files.
29. **Atomic writes** — Backup/restore mentioned, but no temp+fsync+rename implementation specified. FileSafe line 27.
30. **Snapshot integrity** — Worktree cleanup exists, but NO exit code validation on git operations mandated. WorktreeGitImprovement.
31. **Concurrent edit safety** — Identity scoping excellent (per-session, per-project), but no modification tokens, no file locking, no conflict resolution.
32. **Windows path safety** — Path length limits + filename sanitization exist, but shell escape sequence problem (backslash corruption) not addressed. FileManager, WorktreeGitImprovement.
33. **Large file/tool output handling** — Chunking for search index exists, but no pre-flight overflow check for tool outputs in context budget.
34. **Multi-instance coordination** — Single-writer seglog specified, but inter-process locking deferred ("if we ever support..."). storage-plan §6.
35. **Compaction context preservation** — Size tracking exists, but instruction context preservation THROUGH compaction not guaranteed.
36. **Large instruction file cap** — Size visibility exists, but no hard cap on injection preventing immediate compaction loop.
37. **Storage migration** — Infrastructure mentioned (versioned schema, migration runner), but versioning strategy vague, path detection absent.
38. **MCP startup timeout / lazy-load** — Unavailability handling exists, but timeout config and lazy-load mechanics not specified. Tools §8.7.
39. **MCP tool list resilience** — Requested-vs-effective model exists, but retry/reconnect not specified. Tools §5.
40. **MCP invalid data isolation** — Structured errors for LSP, but MCP-specific graceful degradation not specified.
41. **Resource bounding** — TTL policies, crew size limits, memory pruning exist scattered, but no unified collection framework, no LRU, no ring buffers.

### CRITICAL GAPS (Not addressed at all — need new design work)
42. **Recursion depth limits** — NO max_recursion_depth or max_nesting_level anywhere. Complete gap.
43. **Hook/policy enforcement across ALL agents** — Only HTE/DAE strategies covered; plugin/hook enforcement for nested subagents not specified.
44. **Signal handling (SIGTERM/SIGINT/SIGHUP)** — Zero specification anywhere. No process group management, no child termination cascade.
45. **MCP OAuth state management** — OAuth entirely absent from Tools.md, Plugins_System.md, Skills_System.md. No token lifecycle, no atomic writes, no race protection.
46. **MCP schema validation / cycle detection** — No circular $ref detection, no model-specific schema sanitizers (Gemini anyOf/const), no recursion depth limit for schema resolution.
47. **Windows MCP subsystem** — Zero Windows-specific MCP handling.
48. **Windows OAuth callbacks** — Platform-specific OAuth not designed.
49. **Undo/revert system** — Zero mentions across all Plans. No snapshot tracking, no PatchParts for async edits, no undo state machine.
50. **Spending limit enforcement** — usage-feature.md acknowledges as "Gap 5". No enforcement mechanism, no consequence spec.
51. **Thinking block preservation for KV cache** — thinking_delta defined but no rule preventing stripping during compaction/replay.
52. **Configurable compaction threshold per model** — Hard-coded thresholds only; no per-model configuration.
53. **Google provider cachePoint annotations** — Not implemented; known gap from OpenCode #17568.
54. **OAuth + cache_control HTTP 400 workaround** — Listed as known issue; no mitigation designed.
55. **Proactive token refresh (heartbeat)** — Listed as PM LESSON but NOT specified in any plan; only reactive recovery exists.
56. **Cost sign-flip on model switch** — No validation or prevention rule for negative cost aggregation.

## Open Questions / Uncertainties
- Should the 15 CRITICAL GAPS become individual work items or a single omnibus amendment?
- Which gaps should be MVP-blocking vs post-MVP?
- Should undo/revert (Gap #49) be a new Plan doc or an addition to FileSafe?
- Should recursion depth (Gap #42) go into Permissions_System.md or orchestrator-subagent-integration.md?
- Should signal handling (Gap #44) be a standalone survival/lifecycle spec or distributed across docs?

## Packetization Notes
- Phase 1 (A2A) complete: REJECTED for internal use, possible future external interop
- Phase 2 (OpenCode deep-dive) complete: 10 categories, 500+ issues, comprehensive lessons
- Packetization should focus on: gap analysis (PM docs vs OpenCode failures) → specific doc amendments
- Highest-leverage fixes: tool validation layer, resource lifecycle, compaction preservation, permission inheritance
- Evidence base is strong enough for packetization — all 10 categories have concrete issue numbers and architectural lessons

## Do-Not-Forget Details
- User explicitly said most/all providers support A2A
- User core concerns: billing/usage tracking, token explosion, cache hit impact
- PM already has Provider_Stream_Mapping_External_Reference_A2A.md — shows prior thought on A2A mapping
- OpenCode ACP (Agent Client Protocol) is DIFFERENT from A2A — do not conflate them
- A2A v1.0.0 released with JSON-RPC, gRPC, and HTTP+JSON bindings
- PM normalized event stream already handles what A2A tries to do, but with full observability
- The 9-stage prompt pipeline is a critical differentiator that A2A would undermine
- OpenCode infinite recursion bug (#18100) shows what happens without proper orchestration control
- OpenCode plan mode bypass (#6527) shows what happens without permission inheritance
- Estimated user cost impact of caching bugs: $155-800/user/month — A2A would make this worse
- OpenCode 111GB memory / kernel panic (#13230) — systemic "create never cleanup" pattern
- OpenCode tool validation is the #1 failure category (598+ issues)
- OpenCode MCP permanently loses tools on ONE transient failure (#17099)
- OpenCode compaction strips instruction context — agents lose personality (#16960)
- OpenCode snapshot poisoning causes /undo to revert weeks of work (#10589)
- OpenCode OAuth token overwrite race condition (#17822) — file written then immediately clobbered
- OpenCode SQLite corrupts on NFS within minutes (#14970)
- OpenCode spending limits ignored: €5 → €43 (8.6x over) (#11208)
- OpenCode Windows path corruption: backslashes interpreted as escape sequences (#15810)
- OpenCode 23 memory leak PRs unmerged for 63 days (#16697) — organizational failure
- OpenCode multi-instance state corruption: no file locking on shared state (#19436)
