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

### FULLY COVERED (16 items — no action needed)
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
16. **Undo/revert system** — Extensively specified: cmd.chat.revert (assistant-chat-design §9, UI_Command_Catalog, FileManager §2.2) reverts all file mutations from one assistant turn. cmd.chat.rewind for conversation-only. Per-buffer undo/redo in FileManager §2.6. Safe-point rollback pipeline in FileSafe + WorktreeGitImprovement. restore_safe_point_then_retry gate in Commands_System. All MVP-adopted.

### PARTIALLY COVERED — RESOLVED (26 items — resolutions decided)

#### Cluster A: Permissions & Recursion Control
- **#16 Permission inheritance granularity** → In Permissions_System §8 step 4, add that tool-specific argument pattern rules propagate downward — child inherits both action AND restricting patterns from parent.
- **#17 Merge-not-replace semantics** → Add clarifying sentence in §2.4: "Higher-precedence layers shadow lower layers on a per-rule basis; they do not replace the entire ruleset."
- **#18 Max concurrent subagents** → Three-level concurrency: max_concurrent_crews_per_platform (default 4), max_concurrent_agents_per_crew (default 8), max_total_active_agents (default 32). These 4/8/32 defaults are the sole ledger SSOT; any 5-crews / 10-agents wording elsewhere is stale doc drift to retire. All configurable.

#### Cluster B: Execution Safety & Doom Loops
- **#22 Tool argument pre-validation** → Add pre-dispatch validation gate in Tools.md §10.6: schema.validate_tool_args() after policy check. Provider-specific normalizers (GLM unquoting, Qwen XML stripping) run before schema validation. Invalid args → diagnostic + structured error, no execution.
- **#23 Doom loop / per-error retry limits** → Per-class retry matrix in Executor_Protocol.md §7: provider_transient=3 (exp backoff 1s/2s/4s), structured_output_invalid=2 (no backoff), auth_expired=1 (after refresh), permission_denied=0, filesafe_blocked=0, storage_io=1. Exact-match detection: same (tool_name, args_hash, error_message) twice consecutively → kill.identical_failure. Backoff base 1s, max 8s.
- **#24 Truncation handling (finishReason)** → Reconciler rule: finishReason=length with incomplete tool_use → close with tool_result(ok=false, error=truncated_by_length), do NOT synthesize/execute. Empty/minimal args rejected via #22 pre-validation. Add finishReason mapping to normalized event stream in CLI_Bridged_Providers.md.
- **#33 Large tool output in context budget** → Post-execution truncation with model-visible marker (already 512 KiB). Add context budget accounting — if remaining context <15% of window after tool output, emit diagnostic warning. No pre-flight prediction.
- **#21 Tool dispatch-time isolation** → Two-tier defense-in-depth: (1) Pre-dispatch: extend policy.may_execute_tool() to check path args against FileSafe write-scope before execution. (2) Post-hoc: keep end-of-run scans as safety net.

#### Cluster C: Workspace & File Safety
- **#20 Workspace isolation (per-subagent)** → Resolved by existing design. HTE inherits parent write-scope; DAE has jail. Add clarifying note.
- **#29 Atomic writes** → [Validated by OpenCode research: OC uses naive os.WriteFile() for all non-DB files] All FileSafe-managed replacement writes MUST use same-directory atomic write: write to `<target>.tmp.<random>` in the target's own directory → fsync(temp) → rename over target. Never stage replacement writes in per-session temp dirs because cross-filesystem rename breaks atomicity. Applies to seglog segment files, redb sidecar/state files, config/state, and any non-append file rewrite.
- **#30 Snapshot integrity (git exit codes)** → Every git subprocess invocation MUST check exit code. Non-zero on git add/commit/stash/checkout = hard error. After git add, verify with git status --porcelain. Silent failures MUST NOT propagate stale state. Target: WorktreeGitImprovement.md or FileSafe.
- **#31 Concurrent edit safety** → Optimistic concurrency: every mutable file read captures `read_revision={mtime_ns, content_sha256}`. Before rename, PM MUST re-check current target against `read_revision`; mismatch → `error.concurrent_edit_conflict` and abort the write. No file locking. Applies to user-visible rewrites and state/config replacements; append-only seglog writes are exempt. DAE reconciliation already diffs against canonical workspace.

#### Cluster D: Process Lifecycle & Signals
- **#19 Per-task timeout override** → Add `timeout_ms` field to the subagent task envelope in orchestrator-subagent-integration.md. Default: inherit parent remaining budget. Override: clamp to parent remaining budget. Internal kill reason: `kill.task_timeout`; terminal run outcome: `done.task_timeout`. After timeout elapses, providers get 5s graceful termination and MCP/LSP surfaces get 3s before forcible teardown.
- **#41 Resource bounding (unified)** → Lightweight invariant in storage-plan.md: every persistent/long-lived collection MUST declare max cardinality OR TTL (or both). Key collections: seglog=TTL, sessions=max_total_active_agents, MCP handles=registered count, LSP=open project count.
- **#34 Multi-instance coordination** → On startup, PM acquires flock on `<project>/.puppet-master/pm.lock`. If held, start read-only/viewer mode or prompt user.

#### Cluster E: MCP Resilience
- **#38 MCP startup timeout / lazy-load** → startup_timeout_ms default 10s, mark degraded on timeout. Lazy-load: spawn on first tool call, not PM startup. Background readiness probe, retry once, then unavailable.
- **#39 MCP tool list resilience** → listTools() retry 3x with 1s backoff. If all fail, use last-known tool list (stale). Periodic refresh every 5min. Never permanent-kill: failed → degraded, not unavailable.
- **#40 MCP invalid data isolation** → Same pattern as LSP: malformed → structured error + diagnostic, no crash. Schema violation → mcp_schema_mismatch envelope. Per-tool timeout 30s default, configurable per-server.

#### Cluster F: Provider & Streaming
- **#25 Streaming resilience** → Stream disconnect → reconnect/resume, max 3 retries. Exp backoff 1s→2s→4s, jittered ±25%. Circuit breaker: 5 consecutive failures in 2min → open 30s → half-open → close/reopen. Constants configurable per-provider.
- **#26 Error differentiation** → Classification matrix in CLI_Bridged_Providers.md: 401=auth_expired (refresh+1), 403=permission_denied (0), 429=rate_limited (Retry-After/30s), 402=quota_exceeded (0, upgrade prompt), 5xx=provider_transient (per #23 matrix).
- **#27 Provider capability schema** → [Validated by OpenCode research: OC has only 2 booleans + scattered if-else, Gemini disableCache never wired] Formal capability schema in Models_System.md (§10.4.3 references but doesn't define): streaming, tool_use, thinking_blocks, cache_control (key variant), assistant_prefill, max_payload_bytes, image_input, parallel_tool_calls, cache_with_oauth. NOTE: PM has TWO Gemini providers (Direct=API only, CLI=OAuth+API wrapped) — separate entries with distinct capabilities.
- **#32 Windows path safety** → All paths to shell commands MUST be shell-escaped for target platform. On Windows: quote, double backslashes, or convert to forward slashes. Tool dispatch layer handles escaping — tools MUST NOT do their own.

#### Cluster G: Billing & Caching
- **#28 Token type segregation** → [Validated by OpenCode: OC has 4 fields at provider level but AGGREGATES to 2 in DB — breakdown lost, reasoning_tokens untracked] Lock segregated schema in Contracts_V0.md: input_tokens, output_tokens, cache_read_input_tokens, cache_creation_input_tokens, reasoning_tokens, total_tokens, cost_microdollars. `cost_usd` is derived presentation-only (`cost_microdollars / 1_000_000`) and is NOT the canonical persisted field. All token buckets plus `cost_microdollars` persist separately in seglog; NEVER aggregate them away at storage layer.

#### Cluster H: Prompt & Session
- **#35 Compaction context preservation** → Invariant in Prompt_Pipeline.md: system prompt, persona instructions, active tool schemas, user-pinned context, blocks tagged compaction_immune:true MUST survive all compaction passes unchanged. Compaction operates ONLY on conversation history and tool output blocks.
- **#36 Large instruction file cap** → Guard: `max_compaction_immune_pct` defaults to 30% of effective context window and is overridable per model. Untouchable set: system prompt, persona, active tool schemas. Truncatable set: remaining pinned/immune blocks ordered lowest-priority first, FIFO within priority. If immune content exceeds cap, truncate only the truncatable set until under cap; if the untouchable set alone exceeds cap, keep it intact and emit `diag.compaction_immune_overflow`. System prompt and persona are NEVER truncated.
- **#37 Storage migration versioning** → Schema version: integer, monotonic, in seglog header. Migration runner: forward-only, no downgrades. Path detection: config > $PUPPET_MASTER_DATA_DIR > project dir > global dir. Backup seglog+redb before any migration.

### CRITICAL GAPS — RESOLVED (14 items — resolutions decided)

#### Cluster A: Permissions & Recursion Control
- **#42 Recursion depth limits** → Add max_nesting_depth=4 and max_total_spawned_agents=99 as run-envelope budget fields in Run_Modes.md §4. Kill conditions: kill.recursion_depth, kill.agent_count. Overridable per-run.
- **#43 Hook/policy enforcement all agents** → Explicit invariant in Permissions_System.md §1.2: policy.may_execute_tool() MUST be called before every tool dispatch regardless of nesting depth, execution strategy, or invocation path. Includes all child/subagent/crew contexts.

#### Cluster D: Process Lifecycle
- **#44 Signal handling (SIGTERM/SIGHUP)** → New section in Run_Modes.md: (1) SIGTERM/SIGINT → graceful shutdown: cancel runs (done.cancelled), terminate child process groups (SIGTERM→5s→SIGKILL providers, 3s MCP/LSP), flush seglog. (2) Process groups: setsid for CLI providers and MCP servers, signal group not PIDs. (3) SIGHUP → reload config without killing runs. (4) Crash recovery: detect incomplete seglog entries on startup, mark done.crashed.

#### Cluster E: MCP Resilience
- **#45 MCP OAuth lifecycle** → New subsection in Tools.md §8.7, cross-ref GitHub_API_Auth_and_Flows.md. Tokens in shared credential store. Atomic refresh via compare-and-swap. Token sharing keyed by provider+scope, not MCP server. Shared local HTTP listener for callbacks.
- **#46 MCP schema cycle detection** → Track visited $refs, break on revisit → replace with {}, log warning. Max depth 32. Provider schema adapters: Gemini rewrites anyOf→oneOf, strips const. Schema size cap: reject >64 KiB after resolution.
- **#47 Windows MCP subsystem** → CREATE_NEW_PROCESS_GROUP instead of setsid. Graceful: CTRL_BREAK_EVENT→3s→TerminateProcess. Path normalization with \\?\ for long paths.
- **#48 Windows OAuth callbacks** → Bind 127.0.0.1 only (no firewall prompt). Try configured port, fall back ephemeral. Fallback: manual copy-paste auth code flow. Universal approach.

#### Cluster G: Billing & Caching
- **#50 Spending limit enforcement** → [Validated by OpenCode: OC has ZERO spending limit enforcement — no config, no logic, only server-side Gemini 429 parsing] PM: (1) Pre-request estimate via input tokens × model pricing; if the request would exceed budget, block with `kill.budget_exceeded`. (2) Post-response actual cost check; if cumulative spend crosses budget after the response, terminate with `done.budget_exceeded`. (3) Warning threshold is configurable via `warn_budget_pct` (default 80). (4) Enforce both per-run and per-session budgets. Target: usage-feature.md.
- **#51 Thinking block preservation** → [Validated by OpenCode: OC only tracks for Anthropic, no preservation rule, reasoning_tokens uncosted] Invariant in Prompt_Pipeline.md: thinking/reasoning blocks MUST be preserved through compaction/replay. May summarize but MUST NOT silently strip. If provider doesn't support thinking in replay, adapter converts to compatible format. reasoning_tokens tracked in UsageEvent.
- **#52 Per-model compaction threshold** → Fields: pressure_start_pct (default 70), pressure_aggressive_pct (default 85), large_block_threshold (default 1200), max_compaction_immune_pct (default 30). Defaults in Models_System.md, overridable per-model. Exposed in user settings GUI under advanced model settings.
- **#53 Google cachePoint annotations** → [Validated by OpenCode: ONLY Anthropic has active markers; Google/OpenAI/Copilot/Bedrock passive] KEY INSIGHT: Google caching is fundamentally different — server-side cachedContent API, not per-message markers. PM: per-provider cache strategy in Prompt_Pipeline.md: Anthropic=ephemeral markers, Google=cachedContent API adapter, OpenAI=cache_control metadata, Bedrock=currently unsupported. NOTE: TWO Gemini providers (Direct + CLI) with distinct capabilities.
- **#54 OAuth + cache_control HTTP 400** → Guard in CLI_Bridged_Providers.md: when OAuth AND provider rejects cache_control with OAuth, adapter strips markers before sending. Capability matrix includes cache_with_oauth:true|false per provider.

#### Cluster I: Remaining
- **#55 Proactive token refresh** → Pre-expiry check before each provider call: if token within 20% of expiry → refresh first. No background timer — check-before-use. Fallback: reactive refresh after 401. Target: GitHub_API_Auth_and_Flows.md.
- **#56 Cost sign-flip on model switch** → Invariant in usage-feature.md: persisted `cost_microdollars` per UsageEvent MUST always be >= 0, and session cumulative cost MUST be monotonically non-decreasing across model switches. `cost_usd` is derived presentation-only from `cost_microdollars`; it is not the canonical stored field. Model switches do NOT reset historical costs. Negative raw provider cost clamps to zero plus diagnostic.

## Phase 4: Resolved Decisions

### Decisions Already Resolved (all phases)
- A2A spec v1.0.0 is the evaluation target (latest stable)
- Research restricted to Plans/ docs (not old code)
- A2A REJECTED for internal orchestration (Phase 1 conclusion, user agreed)
- Phase 2 pivot: learn from OpenCode's mistakes to strengthen PM implementation
- All 10 deep-dive categories completed with 500+ issues analyzed
- Phase 3 gap analysis: 8 parallel agents, all Plans/ docs reviewed
- Phase 4 resolution: all 41 items discussed and decided with user
- #49 (undo/revert) reclassified from CRITICAL GAP to COVERED after finding extensive specs
- PM has TWO Gemini providers: Gemini Direct (API only) and Gemini CLI (OAuth + API, CLI-wrapped) — separate capability entries required

### Impacted Docs (consolidated from all phases)
- `Plans/Run_Modes.md` — recursion depth budgets (#42), signal handling (#44), per-task timeout note
- `Plans/Permissions_System.md` — tool dispatch invariant (#43), pattern inheritance (#16), merge semantics (#17)
- `Plans/orchestrator-subagent-integration.md` — concurrency limits (#18), task timeout_ms (#19)
- `Plans/Tools.md` — pre-validation gate (#22), MCP lazy-load (#38), MCP retry (#39), MCP isolation (#40), MCP OAuth (#45), schema cycles (#46), Windows MCP (#47)
- `Plans/Executor_Protocol.md` — per-class retry matrix (#23)
- `Plans/CLI_Bridged_Providers.md` — finishReason mapping (#24), error classification (#26), OAuth+cache guard (#54), streaming resilience (#25)
- `Plans/Models_System.md` — provider capability matrix (#27), compaction thresholds (#52)
- `Plans/Contracts_V0.md` — token type segregation schema (#28)
- `Plans/usage-feature.md` — spending limits (#50), cost sign-flip invariant (#56)
- `Plans/Prompt_Pipeline.md` — compaction immunity (#35), instruction cap (#36), thinking block preservation (#51), per-provider cache strategy (#53)
- `Plans/FileSafe.md` — atomic writes (#29), git exit codes (#30), optimistic concurrency (#31)
- `Plans/FileManager.md` — Windows path escaping (#32)
- `Plans/storage-plan.md` — resource bounding contract (#41), multi-instance lock (#34), migration versioning (#37)
- `Plans/WorktreeGitImprovement.md` — git exit code invariant (#30)
- `Plans/GitHub_API_Auth_and_Flows.md` — proactive token refresh (#55), Windows OAuth callbacks (#48)
- `Plans/Provider_OpenCode.md` — streaming resilience constants (#25)

## Phase 5: Second-Pass Multi-Model Deep Sweep

### Method
5 models in parallel (Opus 4.6, Sonnet 4.6, GPT 5.4, GPT 5.3, GPT 5.2), each assigned a different focus area. All searched OpenCode source code + PM Plans docs. 59 total findings, 57 unique (2 cross-validated duplicates). All resolved cluster-by-cluster with user. ALL MVP-BLOCKING.

### Cluster A: Shell & Command Safety (3 findings — resolved)
- **OC-EXEC-101** 🔴 Banned-command bypass via shell metacharacters → PM must validate full command string (all metacharacter forms: ;, &&, ||, |, $(), backticks), not just first token. Shell parser AST preferred. Target: Tools.md.
- **OC-EXEC-108** ⚠️ Shell eval undoes shellQuote protection → Never use eval for command execution. Pass via exec.Command("bash","-c",command) — one interpretation layer only. Target: Tools.md.
- **OC-PROV-012** ⚠️ Shell tool defaults to /bin/bash on Windows → Platform-aware shell selection: cmd.exe/powershell on Windows. os.Process.Kill() instead of SIGTERM. Target: Tools.md.

### Cluster B: Permission & Isolation Safety (5 findings — resolved)
- **OC-EXEC-102** 🔴 Permission service race condition (unguarded slice append) → Permission state mutations MUST be protected by RWMutex. Target: Permissions_System.md.
- **OC-EXEC-110** 🔴 Global singleton shell leaks env cross-session → Per-agent-tree shell instances. Env MUST NOT leak across session/agent boundaries. Target: orchestrator-subagent-integration.md.
- **OC-PERM-101** ⚠️ Skill dirs auto-whitelisted can bypass scope via symlinks → Canonicalize skill roots, disallow symlinked roots. Target: Permissions_System.md.
- **OC-PERM-102** ⚠️ Plugin hooks can override permission/tool args → Re-run permission checks AFTER hooks modify args. Hooks cannot widen permissions. Signed plugins only for arg-touching hooks. Target: Permissions_System.md.
- **OC-PERM-103** 🟡 ~/$ HOME expansion mismatch → All request paths fully expanded/normalized before permission match. Reject unexpanded tildes. Target: Permissions_System.md.

### Cluster C: Tool Execution & Doom Loops (5 findings — resolved)
- **OC-EXEC-103** 🔴 Agent tool loop has zero iteration cap → Add max_tool_rounds (default 200) as run-envelope budget field. Kill: kill.tool_round_limit. Distinct from max_nesting_depth. Target: Run_Modes.md.
- **OC-EXEC-106** 🔴 Non-permission tool errors silently swallowed → Every tool error MUST surface as is_error=true with error message. Never return zero-value result on error. Target: Tools.md.
- **OC-EXEC-104** ⚠️ FinishReasonUnknown treated as normal completion → Enumerate handled finish reasons. Unknown+empty content = error. Add FinishReasonContentFilter and FinishReasonSafety to normalized event stream. Target: CLI_Bridged_Providers.md.
- **OC-EXEC-105** ⚠️ Gemini deduplicates tool calls by Name+Input → Tool call identity MUST use call IDs (UUIDs), never name+input dedup. Target: CLI_Bridged_Providers.md.
- **OC-EXEC-113** ⚠️ Gemini retry uses fragile substring matching → Use structured error codes/HTTP status for retry decisions, never substring matching. Default to NOT retrying unknown errors. Target: CLI_Bridged_Providers.md.

### Cluster D: File Safety & Symlinks (5 findings — resolved)
- **OC-FILE-201** ⚠️ canonicalize() fallback to unresolved path bypasses scope → Fail-closed on canonicalize errors. Never fall back to unresolved path. Target: FileSafe.md.
- **OC-FILE-202** ⚠️ Symlink escape from sandboxed directories → All file ops MUST resolve to realpath BEFORE scope check. Symlink writes disallowed unless target within scope. Target: FileSafe.md.
- **OC-FILE-203** ⚠️ Case-sensitivity mismatch FileSafe vs Permissions → FS-aware case folding consistently across all guards. Detect case-sensitivity at project root. Target: FileSafe.md + Permissions_System.md.
- **OC-EXEC-112** 🟡 File-record map grows unboundedly → LRU eviction cap (default 10K). Target: FileSafe.md.
- **OC-LIFE-007** 🟡 Shell temp artifacts no startup janitor → Per-session temp dir + boot-time sweep. Target: FileSafe.md.

### Cluster E: Provider Quirks & Streaming (10 findings — resolved)
- **OC-PROV-001** ⚠️ OpenAI reasoning models need developer role not system → Capability matrix needs system_role_name field. Target: Models_System.md + CLI_Bridged_Providers.md.
- **OC-PROV-002** ⚠️ Stream cancellation nil-check inverted (ctx.Err()==nil should be !=nil) → PM MUST emit EventError with cancellation reason. Target: CLI_Bridged_Providers.md.
- **OC-PROV-003** ⚠️ Gemini stream retry break only escapes select, not iterator → Retry MUST restart underlying connection/iterator. Retry loop must be OUTER loop. Target: CLI_Bridged_Providers.md.
- **OC-PROV-004** ⚠️ Empty Choices panic on content-filtered 200 → Guard choices.len()==0 before indexing. Empty → FinishReasonContentFilter. Target: CLI_Bridged_Providers.md.
- **OC-PROV-007** ⚠️ Gemini/VertexAI nil client stored as typed interface → Fail-fast: nil/error from client init MUST propagate immediately. Target: CLI_Bridged_Providers.md.
- **OC-PROV-009** ⚠️ Copilot token refresh doesn't recreate HTTP client → After credential refresh, MUST recreate/reconfigure HTTP client. Target: CLI_Bridged_Providers.md.
- **OC-PROV-010** 🟡 Anthropic tool schema omits required fields → All adapters MUST emit required fields in tool schemas. Target: CLI_Bridged_Providers.md.
- **OC-PROV-011** 🟡 Bedrock region prefix by [:2] string slice → Explicit region→prefix lookup table. Target: Models_System.md.
- **OC-PROV-008** 🟡 Gemini image MIME parsing panics on malformed → Bounds-check all string parsing. Malformed → fallback. Target: CLI_Bridged_Providers.md.
- **OC-EXEC-109** ⚠️ Malformed tool-call JSON silently dropped from Anthropic history → Validate tool call JSON at storage time, not re-serialization. Target: CLI_Bridged_Providers.md.

### Cluster F: Process Lifecycle & Crash Recovery (9 findings — resolved)
- **OC-LIFE-002** ⚠️ No explicit signal wiring → Reinforce #44: wire signal.NotifyContext at entrypoint. Target: Run_Modes.md.
- **OC-LIFE-008** ⚠️ Child termination shallow (pgrep -P only) → Kill process GROUPS not PIDs. All spawned via setsid/CREATE_NEW_PROCESS_GROUP. Target: Run_Modes.md.
- **OC-LIFE-009** ⚠️ LSP startup goroutines not lifecycle-tracked → All async init MUST register in lifecycle tracker BEFORE spawning. Target: LSPSupport.md.
- **OC-LIFE-010** ⚠️ No boot-time janitor for stale .tmp / lock artifacts → Mandatory boot sweep: remove stale .tmp.*, validate lock freshness, emit recovery event. Target: FileSafe.md + storage-plan.md.
- **OC-LIFE-004** ⚠️ Shell singleton racy re-init → Proper mutex-guarded lifecycle for per-session shells. Target: Tools.md.
- **OC-LIFE-006** ⚠️ Exec can send to closed queue / block forever → Non-blocking send with alive-check. Shell dead → structured error. Target: Tools.md.
- **OC-LIFE-001** 🟡 Shutdown can run twice → Guard with Once/idempotent. Target: Run_Modes.md.
- **OC-LIFE-005** 🟡 Double-close panic on channel → Single-owner close pattern. Target: Tools.md.
- **OC-LIFE-003** 🟡 DB handle never closed → Close in shutdown sequence. Target: storage-plan.md.

### Cluster G: Billing & Cost Accuracy (12 findings — resolved)
- **OC-BILL-001** ⚠️ Token totals overwritten not accumulated → Append-only events, never overwrite aggregates. Reinforces #28. Target: usage-feature.md.
- **OC-BILL-002** ⚠️ Cache-read tokens misclassified as output → Cache tokens are INPUT-side in cost calculations. Reinforces #28. Target: usage-feature.md.
- **OC-BILL-004** ⚠️ No per-turn usage persistence → Per-event UsageRecord in seglog. Reinforces #28+#50. No new action.
- **OC-BILL-005** ⚠️ Money in float64 → **NEW**: Store as integer microdollars (u64). Format only at presentation. Target: usage-feature.md + Contracts_V0.md.
- **OC-BILL-006** ⚠️ Non-atomic cost updates → Append-only seglog inherently avoids. Reinforces #28+#50. No new action.
- **OC-BILL-008** ⚠️ Pricing tables hardcoded → **NEW**: Version pricing metadata with pricing_version. Support user override. Stale pricing → Doctor warning. Target: Models_System.md.
- **OC-BILL-003** 🟡 Compaction destroys token totals → Append-only model preserves. Reinforces #28.
- **OC-BILL-007** 🟡 Tool/subagent cost attribution incomplete → Each tool invocation emits UsageEvent (even if tokens unknown). Attribution via parent_run_id. Target: usage-feature.md.
- **OC-BILL-009** 🟡 Runtime surface pricing flattened → **NEW**: Cost keyed by (model_id, provider_id, billing_entity). Free-tier shows $0 with billing_source label. Target: Models_System.md.
- **OC-BILL-010** 🟡 Reasoning tokens ignored → Already in #28 schema. Reinforces.
- **OC-BILL-011** 🟡 Cache provenance/TTL not persisted → Optional UsageEvent fields: cache_hit, cache_strategy. Recommended not mandatory for MVP. Target: usage-feature.md.
- **OC-BILL-012** 🟡 UI hardcodes USD, rounds to 2 decimals → Adaptive precision (<$0.01, 4 decimals sub-dollar, 2 decimals >$1). Currency label. Target: usage-feature.md.

### Cluster H: MCP, Compaction & Config (8 findings — resolved)
- **OC-PROV-005** ⚠️ MCP tools cache never invalidated → Support refresh on: config change, user action, periodic TTL. Extends #39. Target: Tools.md.
- **OC-PROV-006** 🟡 MCP stdio spawns new process per call → Per-server connection pool. Persistent subprocess for stdio, reuse across calls. Target: Tools.md §8.7.
- **OC-EXEC-114** ⚠️ Empty messages silently dropped, breaking role alternation → Validate role alternation after message filtering. Empty → warn + placeholder if needed. Target: Prompt_Pipeline.md.
- **OC-COMP-401** 🟡 Compaction thresholds hardcoded → Already resolved by #52. Reinforces.
- **OC-COMP-402** 🟡 Plugin transforms can corrupt message ordering → Transforms MUST NOT delete system/persona, reorder, break alternation, modify immune content. Validate post-execution. Target: Prompt_Pipeline.md + Permissions_System.md.
- **OC-STATE-301** ⚠️ Seglog checksums optional → **NEW**: Per-record CRC32 MUST be mandatory. Validate on every read. Corrupt → skip + recovery event. Target: storage-plan.md.
- **OC-STATE-302** 🟡 Multi-instance lock deferred → Already resolved by #34. Confirms urgency.
- **OC-CONFIG-501** ⚠️ Config plugins auto-load from npm/file:// → **NEW**: NO auto-load executable code from config. Explicit user approval required. Signed verification for arg-touching hooks. Target: Permissions_System.md.

### Cross-Model Validation (same bug found independently)
- Stream cancellation nil-check bug: found by Opus 4.6 (OC-EXEC-111) + Sonnet 4.6 (OC-PROV-002)
- MCP subprocess-per-call: found by Opus 4.6 (OC-EXEC-107) + Sonnet 4.6 (OC-PROV-006)

### New Substantive Items from Phase 5 (not just reinforcements of Phase 4)
1. **max_tool_rounds=200** — same-level iteration cap, distinct from nesting depth (OC-EXEC-103)
2. **Integer microdollars (u64)** — no float64 for money (OC-BILL-005)
3. **Pricing versioning** — version metadata, user override, stale warning (OC-BILL-008)
4. **Billing-entity keying** — cost by (model_id, provider_id, billing_entity) (OC-BILL-009)
5. **Mandatory seglog CRC32** — not optional (OC-STATE-301)
6. **No auto-load plugins** — explicit approval, signed verification (OC-CONFIG-501)
7. **system_role_name in capability matrix** — developer role for reasoning models (OC-PROV-001)
8. **Symlink policy** — realpath before scope check, fail-closed canonicalize (OC-FILE-201/202)
9. **Case-sensitivity detection** — FS-aware folding across FileSafe + Permissions (OC-FILE-203)
10. **Per-agent shell isolation** — env must not leak (OC-EXEC-110)
11. **MCP connection pooling** — persistent subprocess, reuse across calls (OC-PROV-006)
12. **Boot-time janitor** — sweep stale .tmp, validate locks (OC-LIFE-010)
13. **Role alternation validation** — after message filtering (OC-EXEC-114)
14. **Plugin transform constraints** — cannot delete system, reorder, break alternation (OC-COMP-402)
15. **Tool call JSON validation at storage time** — not re-serialization (OC-EXEC-109)
16. **FinishReasonUnknown handling** — enumerate handled reasons, unknown+empty=error (OC-EXEC-104)
17. **Banned-command full-string validation** — not first-token check (OC-EXEC-101)
18. **Credential refresh must rebuild client** — field update alone insufficient (OC-PROV-009)

### Additional Impacted Docs (from Phase 5, beyond Phase 4 list)
- `Plans/LSPSupport.md` — async init lifecycle tracking (OC-LIFE-009)
- `Plans/Prompt_Pipeline.md` — role alternation validation (OC-EXEC-114), plugin transform constraints (OC-COMP-402)
- `Plans/Permissions_System.md` — permission state thread safety (OC-EXEC-102), symlink roots (OC-PERM-101), plugin hook re-check (OC-PERM-102), path normalization (OC-PERM-103), no auto-load (OC-CONFIG-501)
- `Plans/orchestrator-subagent-integration.md` — per-agent shell isolation (OC-EXEC-110)
- `Plans/Tools.md` — shell command validation (OC-EXEC-101/108), Windows shell (OC-PROV-012), tool error surfacing (OC-EXEC-106), shell lifecycle (OC-LIFE-004/005/006), MCP connection pooling (OC-PROV-006), MCP refresh (OC-PROV-005)
- `Plans/Run_Modes.md` — max_tool_rounds (OC-EXEC-103), idempotent shutdown (OC-LIFE-001)
- `Plans/CLI_Bridged_Providers.md` — all provider adapter findings (OC-PROV-001 through OC-PROV-011, OC-EXEC-104/105/109/113)
- `Plans/Models_System.md` — system_role_name (OC-PROV-001), Bedrock prefix table (OC-PROV-011), pricing versioning (OC-BILL-008), billing-entity keying (OC-BILL-009)
- `Plans/usage-feature.md` — microdollars (OC-BILL-005), adaptive precision (OC-BILL-012), per-tool attribution (OC-BILL-007), cache provenance (OC-BILL-011)
- `Plans/storage-plan.md` — mandatory CRC32 (OC-STATE-301), boot janitor (OC-LIFE-010)
- `Plans/FileSafe.md` — symlink policy (OC-FILE-201/202), case folding (OC-FILE-203), file-record LRU (OC-EXEC-112), temp janitor (OC-LIFE-007), boot cleanup (OC-LIFE-010)

## Open Questions / Uncertainties
- All 41 Phase 4 gap resolutions decided — no open design questions remain
- All 57 Phase 5 second-pass findings resolved — no open design questions remain
- **ALL items are MVP-BLOCKING** — user decision, no post-MVP deferrals
- Packetization sequencing TBD: which docs to amend first?

## Phase 6: Reconciliation / Coverage Pass

### Reconciliation Summary
This pass reconciles the post-A2A/post-OpenCode design into a coherent packet set for the PM rewrite docs.

The design being reconciled is:
- A2A is REJECTED for internal PM orchestration.
- OpenCode’s failures are translated into concrete PM canon across run budgets, permissions, tool dispatch, provider adapters, billing, file safety, storage integrity, prompt/cache behavior, MCP lifecycle, and orchestrator ownership.
- Packetization must preserve implementation-grade detail in owner docs and keep nearby consumer docs from drifting into stale or misleading summaries.

Major drift risks after the fidelity audit:
- Provider/billing canon is still too thin in `CLI_Bridged_Providers.md`, `Models_System.md`, and `usage-feature.md`.
- Execution-safety canon is split across `Permissions_System.md`, `Tools.md`, and `orchestrator-subagent-integration.md`.
- `FileSafe.md` still mixes new fail-closed rules with stale fallback/TODO canon.
- Consumer docs can still misroute ownership or present stale status (`Crosswalk.md`, `interview-subagent-integration.md`, `OpenCode_Coverage_Matrix.md`, `FinalGUISpec.md`).
- A2A-facing references must remain clearly external-reference/future-interop scoped rather than implying approved internal adoption.

### Raw Coverage Ledger Summary
- **Total docs considered:** 31
- **Final impacted-doc set:** 27
- **Current packet candidate docs:** 21 (`Plans/.pipeline/research_packet.json`)

Coverage clusters:
1. **Clearly implicated owner docs (16)**  
   `Run_Modes.md`, `Permissions_System.md`, `Tools.md`, `CLI_Bridged_Providers.md`, `Models_System.md`, `usage-feature.md`, `Contracts_V0.md`, `FileSafe.md`, `storage-plan.md`, `Prompt_Pipeline.md`, `orchestrator-subagent-integration.md`, `GitHub_API_Auth_and_Flows.md`, `LSPSupport.md`, `Executor_Protocol.md`, `Architecture_Invariants.md`, `Plugins_System.md`
2. **Cross-doc reconciliation seams (5)**  
   `Crosswalk.md`, `interview-subagent-integration.md`, `OpenCode_Coverage_Matrix.md`, `WorktreeGitImprovement.md`, `FinalGUISpec.md`
3. **Verification-only drift watchers (6)**  
   `Section15_MVP_Promoted_Features_Spec.md`, `Runtime_Artifacts_Panel.md`, `Wiring_Matrix.md`, `MiscPlan.md`, `assistant-chat-design.md`, `Provider_Stream_Mapping_External_Reference_A2A.md`
4. **Adjacent docs considered but not bucketed (4)**  
   `Provider_OpenCode.md`, `GitHub_Integration.md`, `UI_Command_Catalog.md`, `FileManager.md`  
   Rationale: these docs are downstream consumers or already defer to the actual owner docs above; no new packet intent is needed unless a MUST VERIFY check fails.

Highest drift risk clusters:
- provider adapter/error-classification/billing metadata
- tool/path validation and shell-runtime ownership
- file/storage safety with stale canon retirement
- consumer summaries that can remain misleading after owner-doc changes

### Three-Bucket Register (final, mutually exclusive)

#### MUST CHANGE (16 docs — owner docs or docs with stale canon that must be retired)
1. `Plans/Run_Modes.md` — Add run-envelope budget fields (`max_nesting_depth=4`, `max_total_spawned_agents=99`, `max_tool_rounds=200`) and align them with kill conditions. Ensure signal/process-group shutdown semantics stay coherent and that the kill table is revised, not merely appended to.
2. `Plans/Permissions_System.md` — Add downward inheritance of restrictive argument-pattern rules, merge-not-replace clarification, universal `policy.may_execute_tool()` enforcement at every nesting depth, mutation locking, post-hook permission re-checks, symlink-root canonicalization, path normalization, and executable-config/plugin restrictions.
3. `Plans/Tools.md` — Add the owner-level pre-dispatch validation pipeline (`schema.validate_tool_args()` + provider normalizers + FileSafe/write-scope checks), mandatory `is_error=true` surfacing, shell-runtime safety (`never eval`, full-string validation, Windows shell selection, mutex/non-blocking queue), and the resolved MCP lifecycle/error-isolation details.
4. `Plans/CLI_Bridged_Providers.md` — Add full provider-adapter canon: `FinishReasonUnknown`, `FinishReasonContentFilter`, `FinishReasonSafety`, truncation/no-dispatch rule for `finishReason=length`, HTTP/status retry matrix, `cache_with_oauth` guard behavior, empty-choice/nil-client/JSON/bounds guards, and structured retry classification.
5. `Plans/Models_System.md` — Add the formal capability schema, Bedrock region→prefix lookup, compaction thresholds, `pricing_version`, user override / stale-pricing warning, billing key `(model_id, provider_id, billing_entity)`, and `cache_with_oauth`. Keep Gemini Direct and Gemini CLI as distinct entries.
6. `Plans/usage-feature.md` — Retire stale “Gap” framing, lock the canonical usage pipeline (`seglog -> analytics scan -> redb rollups -> UI`), add pre/post budget enforcement details, per-run and per-session tracking, monotonic/non-negative cost invariants, per-tool attribution via `parent_run_id`, and cache provenance fields (`cache_hit`, `cache_strategy`).
7. `Plans/Contracts_V0.md` — Tighten `UsageEvent` token buckets, integer microdollar canon, and `billing_entity` requirement when provider quota semantics depend on the entity bucket. Remove contradictory “optional additive” wording.
8. `Plans/FileSafe.md` — Replace stale symlink TODOs and fallback sketches with the fail-closed realpath/canonicalization contract, atomic-write contract (`temp -> fsync -> rename`), FS-aware case folding, file-record LRU cap, and per-session temp-dir/janitor rules.
9. `Plans/storage-plan.md` — Replace “optional checksum” / “if we ever support multiple processes” wording with mandatory CRC32 and startup `pm.lock` behavior. Add universal TTL/max-cardinality requirements, forward-only migration/backup semantics, shutdown close behavior, and stale-temp/lock recovery.
10. `Plans/Prompt_Pipeline.md` — Add role-specific context compilation, compaction-aware rereads, once-per-phase skill bundling, compaction-immune list and cap, thinking preservation, post-filter role alternation validation, plugin-transform constraints, provider-specific cache strategy table, and low-context warning semantics.
11. `Plans/orchestrator-subagent-integration.md` — Add explicit ownership of global concurrency, per-agent shell isolation, and `task timeout_ms` envelope semantics.
12. `Plans/GitHub_API_Auth_and_Flows.md` — Add proactive 20%-TTL refresh, Windows loopback/ephemeral/manual OAuth flow details, and explicit cross-ref that credential refresh requires HTTP client rebuild.
13. `Plans/LSPSupport.md` — Add lifecycle-tracker registration-before-spawn for async init paths.
14. `Plans/Executor_Protocol.md` — Replace generic retry language with per-class retry constants/backoff and lock the identical-failure doom-loop rule.
15. `Plans/Architecture_Invariants.md` — Add invariants for universal policy hook enforcement, locked permission mutation, microdollars, token-bucket persistence, atomic writes, and mandatory CRC32 recovery behavior.
16. `Plans/Plugins_System.md` — Add no-auto-load executable-code rule, signed/approved arg-touching hooks, and required permission re-check after hook argument mutation.

#### MUST RECONCILE (5 docs — not the owner docs, but must stay aligned so the planning set does not drift)
1. `Plans/Crosswalk.md` — Route concurrency ownership to `orchestrator-subagent-integration.md`; route shell-isolation ownership jointly to `orchestrator-subagent-integration.md` + `Tools.md`.
2. `Plans/interview-subagent-integration.md` — Replace the incomplete/incorrect `FinalGUISpec` concurrency reference with the orchestrator SSOT and distinguish reviewer-cap limits from global active-agent limits.
3. `Plans/OpenCode_Coverage_Matrix.md` — Update rows 28/29/32/34 and the summary so the coverage story does not continue to report those areas as merely “Partial” after packetization.
4. `Plans/WorktreeGitImprovement.md` — Strengthen the git subprocess invariant: non-zero exit is a hard error; `git status --porcelain` must verify post-add/commit-sensitive state.
5. `Plans/FinalGUISpec.md` — Align UI-facing cost precision, `pm.lock` / viewer-mode messaging, and MCP lazy-load/startup-time UX with the owner docs.

#### MUST VERIFY (6 docs — not packet doc intents, but must be checked before packet emission because they could become misleading)
1. `Plans/Section15_MVP_Promoted_Features_Spec.md` — verify `terminate_session` / graceful shutdown text defers to or matches `Run_Modes.md`.
2. `Plans/Runtime_Artifacts_Panel.md` — verify `cost_usage`/`reasoning_tokens` language stays compatible with microdollars and the rewritten usage canon.
3. `Plans/Wiring_Matrix.md` — verify terminal kill wiring and checksum-validation flows do not conflict with process-group kills or mandatory CRC recovery.
4. `Plans/MiscPlan.md` — verify SIGTERM, symlink, and multi-instance notes remain advisory and do not shadow the new SSOT.
5. `Plans/assistant-chat-design.md` — verify concurrent-thread UI defaults are not misread as global subagent concurrency limits.
6. `Plans/Provider_Stream_Mapping_External_Reference_A2A.md` — verify the doc still reads as an external-reference/future-interop mapping only, and does not imply A2A is approved for internal PM orchestration after `CLI_Bridged_Providers.md` is updated.

### Derived / Regen-Only Checks
- `Plans/_shards/**` — regenerate after all MUST CHANGE and MUST RECONCILE amendments land.
- `Plans/Spec_Lock.json` — verify/update any locked decisions referenced by new invariants.
- `Plans/.evidence/**` — re-generate only after verification/gates, not as packet doc intents.

### Stale Canon Summary (highest-risk supersession conflicts)
| Doc | Stale Canon To Retire | Replace With |
|---|---|---|
| `Plans/storage-plan.md` | “Optional: checksum per record” | Mandatory CRC32 per record; validate on every read; corrupt → skip + recovery event |
| `Plans/storage-plan.md` | “if we ever support multiple processes, use a lock file” | Startup flock on `<project>/.puppet-master/pm.lock`; if held, enter read-only/viewer mode |
| `Plans/usage-feature.md` | old “Gap 1–7” incomplete-billing framing and `usage.jsonl`-style aggregation phrasing | resolved spending-limit, microdollar, token-segregation, and rollup pipeline canon |
| `Plans/FileSafe.md` | unchecked symlink TODOs / unresolved-path fallback sketches | fail-closed realpath-before-scope-check, no unresolved fallback |
| `Plans/Executor_Protocol.md` | generic retry text without concrete limits | per-class retry matrix with explicit counts and backoff |
| `Plans/Contracts_V0.md` | `billing_entity` treated as merely optional additive metadata | `billing_entity` required when provider quota semantics depend on the entity bucket |

### Missing Coverage Warnings
- **Packet candidate coverage result:** the current 21-doc packet candidate already includes every MUST CHANGE and MUST RECONCILE doc. There are **no missing packet-intent docs** at this stage.
- **Outside-packet verification debt:** the six MUST VERIFY docs above are not packet doc intents, but they must be checked before packet emission. If any of them conflicts with the owner-doc amendments, promote it before packetization.
- **A2A seam warning:** `Plans/Provider_Stream_Mapping_External_Reference_A2A.md` is the highest-risk verify-only omission because `CLI_Bridged_Providers.md` references it directly. If its framing is not explicitly external-reference/future-interop scoped after packetization, it must be promoted out of MUST VERIFY.

### Packetization-Ready Doc Set
These are the docs that belong in the packet now (MUST CHANGE + MUST RECONCILE only):

| Path | Why it belongs | Likely anchor / section | Change needed | Change mode |
|---|---|---|---|---|
| `Plans/Run_Modes.md` | run-envelope budgets, kill reasons, shutdown semantics | `## 4. Budget defaults`, `## 5. Kill conditions and enforcement` | add explicit budget keys and align kill/shutdown behavior | replace stale/exhaustive table text where needed |
| `Plans/Permissions_System.md` | inheritance, merge semantics, policy hook, hook/plugin safety | `## 1`, `## 2.4`, `## 8` | add resolved permission invariants and post-hook checks | additive + retire simplified conflicting wording |
| `Plans/Tools.md` | validation gate, shell-runtime safety, MCP lifecycle/error handling | `## 5`, `### 8.2`, MCP sections | add full pre-dispatch and shell/MCP owner canon | additive |
| `Plans/CLI_Bridged_Providers.md` | finish reasons, retry matrix, truncation, provider guards | normalized stream schema / finish-reason sections | add missing per-provider/per-status behavior | additive / expand partial content |
| `Plans/Models_System.md` | capability matrix, pricing/version metadata, thresholds | capability matrix and provider metadata sections | add formal capability and pricing fields | additive |
| `Plans/usage-feature.md` | canonical usage pipeline, budgets, attribution, cache provenance | rewrite alignment, aggregation, usage schema sections | replace stale pipeline/gap text and extend schema | replace + additive |
| `Plans/Contracts_V0.md` | authoritative UsageEvent payload shape | usage/billing addendum | tighten token/cost/billing fields | replace contradictory wording |
| `Plans/FileSafe.md` | file mutation safety and symlink canon | symlink/path resolution + guarded mutation sections | retire stale TODOs/fallbacks; add atomic-write and case-fold rules | replace + additive |
| `Plans/storage-plan.md` | CRC/locking/storage bounds/migration contract | storage integrity / migration / startup recovery sections | harden mandatory storage invariants | replace + additive |
| `Plans/Prompt_Pipeline.md` | compaction/cache/preservation rules | skill/context delivery + compaction/cache sections | add missing cache strategy and preservation canon | additive |
| `Plans/orchestrator-subagent-integration.md` | global concurrency, shell isolation, timeout envelope | subagent configuration / parallel execution sections | add missing orchestrator-owned runtime limits | additive |
| `Plans/GitHub_API_Auth_and_Flows.md` | auth refresh + Windows OAuth flow details | token refresh / OAuth callback sections | add proactive refresh and fallback flow details | additive |
| `Plans/LSPSupport.md` | async init lifecycle safety | lifecycle / startup sections | add registration-before-spawn invariant | additive |
| `Plans/Executor_Protocol.md` | retry policy and identical-failure kill semantics | `§7` failure/retry section | replace generic retry with explicit matrix | replace |
| `Plans/Architecture_Invariants.md` | cross-cutting hard invariants | invariants section / new addendum | encode newly locked cross-doc rules | additive |
| `Plans/Plugins_System.md` | plugin approval and arg-mutation safety | plugin loading / hook semantics sections | add no-auto-load and re-check canon | additive |
| `Plans/Crosswalk.md` | route ownership correctly across doc set | subagent/tool ownership crosswalk | reconcile owner/consumer routing | additive |
| `Plans/interview-subagent-integration.md` | keep interview-mode limits from drifting | concurrency / reviewer-cap references | redirect to orchestrator SSOT and clarify reviewer-only cap | additive |
| `Plans/OpenCode_Coverage_Matrix.md` | keep coverage status honest after doc updates | rows 28/29/32/34 + summary | update resolved-status rows and summary | replace stale summary text |
| `Plans/WorktreeGitImprovement.md` | git integrity consumer seam | git subprocess handling sections | strengthen hard-error and verification rules | additive / strengthen existing text |
| `Plans/FinalGUISpec.md` | UI consumer alignment for cost, locks, and MCP startup UX | settings/inspectors + MCP settings areas | align UI-facing defaults/messages with owner docs | additive |

### Packetization Reminders
- Phase 1 conclusion remains unchanged: **A2A is rejected for internal orchestration**. Any external interop or gateway/adapter work is a separate future work item.
- PM has **two Gemini providers** (`Gemini Direct`, `Gemini CLI`) and they must stay separate in capability/billing/cache discussions.
- The canonical usage path is **seglog → analytics scan → redb rollups → UI**, not `usage.jsonl`.
- Google caching remains architecturally distinct (`cachedContent`-style strategy), and docs must not flatten it into Anthropic/OpenAI marker behavior.
- If any MUST VERIFY doc fails its check, promote it before packet emission rather than leaving the conflict for follow-up.

---

## Phase 7 — Second Reconciliation/Coverage Pass (post-fidelity-audit run-02)

### Context
Cycle 1 completed: 21 docs, 29 anchors, all applied and verified. Fidelity audit run-02 found 13 findings (3 claimed blockers, 5 high, 5 medium). A targeted verification of each finding against current doc state reveals the actual scope is narrower.

### Fidelity Audit Verification Results

| LF-ID | Claimed Severity | Verified Status | Real Work Needed? |
|-------|-----------------|-----------------|-------------------|
| LF-01 | blocker | ✅ ALL 8 items present in CLI_Bridged_Providers.md | NO — false positive |
| LF-02 | blocker | ✅ ALL 6 items present in Tools.md | NO — false positive |
| LF-03 | blocker | ⚠️ PARTIAL — stale code examples (L2031-2033 `unwrap_or_else`), stale TODOs (L1149, L2558, L2648), case-folding gap | YES |
| LF-04 | high | ⚠️ PARTIAL — auto-load prohibition missing from Permissions_System (delegated to Plugins_System but not owned) | YES — minor |
| LF-05 | high | ⚠️ PARTIAL — timeout_ms envelope informal; shell-isolation high-level only | YES |
| LF-06 | high | ✅ MOSTLY PRESENT — table exists; machine-readable JSON Schema absent | NO — table sufficient for planning docs |
| LF-07 | high | ❌ CONFIRMED — competing pipeline (seglog vs usage.jsonl) in usage-feature.md | YES |
| LF-08 | high | ⚠️ PARTIAL — parent_run_id/cache fields present; monotonic cost handling MISSING | YES — targeted |
| LF-09 | medium | ❌ CONFIRMED — billing_entity optional vs required contradiction | YES |
| LF-10 | medium | ⚠️ MOSTLY PRESENT — TTL rule stated; collection inventory missing | MINOR |
| LF-11 | medium | ⚠️ MOSTLY PRESENT — deferred items; Google cachedContent API detail thin | MINOR |
| LF-12 | high | ✅ MOSTLY PRESENT — hard-error + porcelain present; exit-code classification table missing | MINOR |
| LF-13 | medium | ⚠️ PARTIAL — coverage matrix rows already updated; adaptive sub-dollar precision missing | MINOR |

### Real Remaining Work Summary
Of 13 findings, 2 are false positives (LF-01, LF-02), 2 are already adequate (LF-06, verified as table-complete), and 1 collection-inventory gap (LF-10) is too minor to packetize. The real second cycle covers 8 doc changes.

### Three-Bucket Register (Cycle 2 — final, mutually exclusive)

#### MUST CHANGE (5 docs — owner docs with confirmed remaining gaps)

1. **`Plans/FileSafe.md`** (LF-03)
   - **Retire:** stale `unwrap_or_else` code example at ~L2031-2033 that contradicts §11.1.1
   - **Retire:** stale TODO checklist items at ~L1149, ~L2558, ~L2648 that reference unresolved symlink handling (now resolved by §11.1.1)
   - **Add:** case-folding detection contract — how FileSafe detects case sensitivity at project/worktree root and what normalization applies (lowercasing vs platform-native folding)
   - Change mode: replace stale + additive

2. **`Plans/usage-feature.md`** (LF-07 + LF-08)
   - **Retire:** legacy `usage.jsonl`-style aggregation text in the aggregation section that contradicts the canonical seglog→redb rollup pipeline
   - **Add:** monotonic/non-negative cost invariant for model-switch scenarios (cost must not decrease retroactively; overestimate correction is a separate adjustment event)
   - **Clarify:** migration timeline — when usage.jsonl compatibility shim is retired
   - Change mode: replace stale aggregation + additive monotonic rule

3. **`Plans/Contracts_V0.md`** (LF-09)
   - **Reconcile:** early §1.1 "additive disclosure fields" + §4.1 "optional" text with §5 "required when quota depends on entity" addendum
   - **Fix:** add explicit conditional-requirement caveat to early sections, or restructure so the conditionality is stated once and cross-referenced
   - Change mode: replace contradictory early text

4. **`Plans/Permissions_System.md`** (LF-04)
   - **Add:** auto-load executable-code prohibition as a permission-system-level requirement (not just delegation to Plugins_System)
   - This means: MCP servers, custom tools, and executable configs that auto-load must go through explicit user approval or signing before permission grants
   - Change mode: additive

5. **`Plans/orchestrator-subagent-integration.md`** (LF-05)
   - **Formalize:** timeout_ms envelope schema — define request/response structure, remaining-budget calculation/propagation semantics, and what happens when a child's timeout exceeds parent's remaining budget
   - **Strengthen:** shell-isolation rules from governance-level to contract-level (enforcement boundary, scope lifecycle, teardown)
   - Change mode: replace informal rules + additive

#### MUST RECONCILE (3 docs — alignment to prevent drift)

6. **`Plans/FinalGUISpec.md`** (LF-13)
   - **Add:** adaptive sub-dollar precision display rules (when to show $0.001 vs $0.00001 vs $1, rounding/truncation rules per model tier or magnitude)
   - Change mode: additive

7. **`Plans/WorktreeGitImprovement.md`** (LF-12)
   - **Add:** git exit-code classification table mapping common non-zero codes to recovery actions (retryable with backoff, fatal/fail-immediately, skip-silently-never)
   - Change mode: additive

8. **`Plans/Prompt_Pipeline.md`** (LF-11)
   - **Add:** Google `cachedContent` API behavior details — field name, TTL semantics, refresh behavior, token-savings calculation method
   - Change mode: additive

#### MUST VERIFY (3 docs — check only, no packet intent unless conflict found)

9. **`Plans/Models_System.md`** (LF-06) — Verify capability table completeness; no formal JSON Schema needed at planning-doc level.
10. **`Plans/storage-plan.md`** (LF-10) — Verify universal TTL/max-cardinality rule is clear enough without an explicit collection inventory.
11. **`Plans/CLI_Bridged_Providers.md`** (LF-01) — Verify no regressions; content confirmed present.

#### FALSE POSITIVES (excluded from packet)

- **LF-01** (`CLI_Bridged_Providers.md`): All 8 items (FinishReason mapping, HTTP retry matrix, cache-with-OAuth, empty-choices, nil-client, bounds, JSON validation) verified present.
- **LF-02** (`Tools.md`): All 6 items (validate_tool_args, normalizers, FileSafe checks, is_error, eval prohibition, shell lifecycle) verified present.

### Derived / Regen-Only Checks
- `Plans/_shards/**` — regenerate after cycle-2 amendments
- `Plans/Spec_Lock.json` — re-verify after SSOT files change
- `Plans/.evidence/**` — re-generate after verification

### Stale Canon Summary (cycle 2)
| Doc | Stale Canon To Retire | Replace With |
|---|---|---|
| `Plans/FileSafe.md` | `unwrap_or_else(\|_\| resolved_path)` code example (~L2031-2033) | Cross-ref to §11.1.1: `canonicalize()` failure is `GuardError`, not silent fallback |
| `Plans/FileSafe.md` | TODO items at ~L1149, ~L2558, ~L2648 re: unresolved symlink handling | Resolved: §11.1.1 realpath-before-scope-check invariant |
| `Plans/usage-feature.md` | `usage.jsonl`-style aggregation text and "full file scan" language | Canonical pipeline: seglog → analytics scan → redb rollups → UI |
| `Plans/Contracts_V0.md` | "additive disclosure fields" / "optional" for billing_entity | Conditional requirement: required when provider quota depends on entity bucket |
| `Plans/orchestrator-subagent-integration.md` | Informal timeout_ms rules without schema | Formal envelope schema with propagation semantics |

### Packetization-Ready Doc Set (Cycle 2)

| Path | Why | Likely anchor / section | Change needed | Mode |
|---|---|---|---|---|
| `Plans/FileSafe.md` | stale code + TODO contradictions; case-fold gap | ~L2031 code example, ~L1149/L2558/L2648 TODOs, new §11.1.x case-fold | retire stale, add case-fold | replace + additive |
| `Plans/usage-feature.md` | competing pipeline + missing monotonic rule | aggregation section, schema section | retire usage.jsonl text, add cost invariant | replace + additive |
| `Plans/Contracts_V0.md` | billing_entity contradiction | §1.1 + §4.1 vs §5 | reconcile conditional requirement | replace early text |
| `Plans/Permissions_System.md` | auto-load prohibition missing | §1 or new §1.x | add executable-code approval rule | additive |
| `Plans/orchestrator-subagent-integration.md` | timeout_ms informal, shell-isolation thin | §Subagent Configuration | formalize envelope + isolation | replace + additive |
| `Plans/FinalGUISpec.md` | adaptive sub-dollar precision missing | usage/cost display section | add precision rules | additive |
| `Plans/WorktreeGitImprovement.md` | exit-code classification missing | git subprocess section | add classification table | additive |
| `Plans/Prompt_Pipeline.md` | Google cachedContent detail thin | provider cache strategy section | add API-level detail | additive |

### Packetization Reminders (Cycle 2)
- LF-01 and LF-02 are verified false positives; do NOT re-packetize CLI_Bridged_Providers.md or Tools.md for these findings.
- FileSafe stale-code retirement is the most critical single fix — the `unwrap_or_else` example directly contradicts the §11.1.1 invariant that was just added in cycle 1.
- The usage-feature.md pipeline contradiction is a semantic issue, not just wording — the aggregation section must be rewritten, not merely annotated.
- Contracts_V0.md needs structural reconciliation (early vs late framing), not just an addendum.
- Cycle 2 packet should be ~8 doc intents, ~12-15 anchors — much smaller and more surgical than cycle 1.

## Phase 8 — Post-Fidelity Ledger Hardening

### Context
The fidelity audit showed that the main remaining problems were doc carry-through, not research thinness. However, a few ledger rules still needed tighter canonical wording so future packetization cannot soften or reinterpret them. This phase hardens ledger SSOT only. The previously emitted packet is now stale until regenerated from this hardened ledger.

### Canon Locks (supersede softer wording above)
1. **Concurrency SSOT**
   - Canonical defaults remain: `max_concurrent_crews_per_platform=4`, `max_concurrent_agents_per_crew=8`, `max_total_active_agents=32`.
   - Any 5-crews / 10-agents wording in downstream docs is stale drift to retire.

2. **Budget / timeout status naming**
   - Pre-dispatch budget block: `kill.budget_exceeded`
   - Post-response terminal budget overrun: `done.budget_exceeded`
   - Internal timeout kill reason: `kill.task_timeout`
   - Terminal timeout outcome: `done.task_timeout`
   - `stop.budget_exceeded` and `done.timeout` are stale aliases and MUST NOT be treated as canonical names.

3. **File replacement write path**
   - Replacement writes use same-directory temp files only: `<target>.tmp.<random>` in the target directory, `fsync(temp)`, then atomic rename over the target.
   - Per-session temp dirs are valid for scratch artifacts and janitor-managed temp state, but NOT for replacement writes that rely on same-filesystem atomic rename.
   - Optimistic concurrency is mandatory for mutable rewrites: capture `read_revision={mtime_ns, content_sha256}` on read, re-check before rename, and abort with `error.concurrent_edit_conflict` on mismatch.

4. **Compaction overflow algorithm**
   - `max_compaction_immune_pct` (default 30, overridable per model) is the hard cap for compaction-immune content.
   - Untouchable set: system prompt, persona, active tool schemas.
   - Truncatable set: remaining pinned / compaction-immune blocks, ordered lowest-priority first and FIFO within each priority.
   - Overflow handling: trim only the truncatable set until the immune total is within cap. If the untouchable set alone exceeds cap, keep it intact, emit `diag.compaction_immune_overflow`, and continue.

5. **Cost field / unit contract**
   - Canonical persisted cost field: `cost_microdollars` (`u64`-style integer semantics in planning terms).
   - Canonical presentation field: `cost_usd = cost_microdollars / 1_000_000`, derived only at display/export boundaries.
   - Token buckets (`input_tokens`, `output_tokens`, `cache_read_input_tokens`, `cache_creation_input_tokens`, `reasoning_tokens`, `total_tokens`) remain segregated persisted fields.
   - Negative raw provider cost is clamped to zero with diagnostic; cumulative session cost never decreases.

### Directionality Cleanup
- The following items are now fully locked in the ledger and are NOT directional anymore: `#18`, `#19`, `#28`, `#29`, `#31`, `#36`, `#50`, `#52`, `#56`.
- Items explicitly labeled `FUTURE FEATURE` or `OPEN QUESTION` elsewhere remain open by intent.
- Remaining work after this phase is doc / packet carry-through, not ledger-level canon discovery.

### Packet / Meta Note
- Because this hardening changed ledger SSOT after packetization, the work item returns to `active` until a new packet is emitted from the hardened ledger.

---

## Phase 9 — Cycle 3 Reconciliation / Coverage Pass (post-hardening)

### Context
Phase 8 hardened 5 Canon Locks in the ledger. This Cycle 3 pass determines whether those locks create new reconciliation needs beyond what the Phase 6 (Cycle 1, 21 docs) and Phase 7 (Cycle 2, 8 docs) registers already captured.

Method: six parallel doc-set searches covering each Canon Lock term plus the full stale-legacy-term set, followed by cross-referencing against existing register entries.

### Reconciliation Summary
The Phase 8 Canon Locks tighten specificity but do NOT invalidate the existing Cycle 1/2 packet intents. They do, however, reveal:
1. **One new doc** (`Media_Generation_and_Capabilities.md`) that was never in any register but contradicts Canon Lock 5 and INV-015.
2. **Five sets of stale-canon retirement targets** that the existing packet intents must carry as explicit retirement directives rather than leaving them to Scribe inference.
3. **Two verify-only checks** that remain advisory.

Major drift risks from Phase 8 hardening:
- Canon Lock 2 status names (`stop.budget_exceeded`, `stop.task_timeout`, `done.timeout`) survive in 3 owner docs — Run_Modes.md, usage-feature.md, orchestrator-subagent-integration.md.
- Canon Lock 1 concurrency stale values (5/10) survive in orchestrator-subagent-integration.md at lines 4435/4437.
- Canon Lock 3 same-directory-only temp rule is contradicted by FileSafe.md §11.1.2 line 1286; optimistic concurrency fields (`read_revision`, `concurrent_edit_conflict`) are completely absent from FileSafe.md.
- Canon Lock 4 formal algorithm (untouchable/truncatable sets, `diag.compaction_immune_overflow`) is absent from Prompt_Pipeline.md — only the 30% cap and immune categories exist.
- Canon Lock 5 stale `estimated_cost_usd: f64` survives in both usage-feature.md (L425) and Media_Generation_and_Capabilities.md (L281, L301).

### Raw Coverage Ledger Summary
- **Total docs re-checked:** 31 (all Plans/*.md)
- **Docs with confirmed Canon Lock violations:** 6 owner docs + 1 new doc
- **Docs with existing packet coverage for those violations:** 5 (Run_Modes.md, usage-feature.md, orchestrator-subagent-integration.md, FileSafe.md, Prompt_Pipeline.md)
- **Docs with NO prior packet coverage:** 1 (Media_Generation_and_Capabilities.md)
- **Docs needing re-verification:** 2 (assistant-chat-design.md, Architecture_Invariants.md)

### Three-Bucket Register (Cycle 3 — final, mutually exclusive)

#### MUST CHANGE (1 doc — new doc not in any prior register)

1. **`Plans/Media_Generation_and_Capabilities.md`** (Canon Lock 5 / INV-015)
   - **Retire:** `estimated_cost_usd: f64` at L281 (JSON example) and L301 (field doc) — contradicts Canon Lock 5 (`cost_microdollars: u64` is canonical persisted field) and Architecture_Invariants.md INV-015 (no float money fields).
   - **Replace with:** `cost_microdollars: u64` for persisted/canonical usage; if media cost is explicitly an estimate, add `cost_is_estimate: bool` metadata rather than using a stale float field name.
   - **Also update:** token bucket field names to match canonical segregation (`cache_read_input_tokens`, `cache_creation_input_tokens` rather than any abbreviated variants).
   - Change mode: replace stale field definitions

#### MUST RECONCILE (0 docs)
No additional reconciliation-only docs needed. All remaining needs are either already in Cycle 1/2 packet intents or are verify-only.

#### MUST VERIFY (2 docs — check only, no packet intent unless conflict found)

1. **`Plans/assistant-chat-design.md`** (Canon Lock 1)
   - Line 1612: "default 10 max concurrent runs" — verify this is a UI-level chat thread concurrency setting, NOT a global subagent concurrency cap. It must not conflict with `max_total_active_agents=32` from Canon Lock 1. If it does, promote to MUST CHANGE.

2. **`Plans/Architecture_Invariants.md`** (Canon Lock 3)
   - INV-017 (L156–163): covers atomic write (temp-fsync-rename) but omits optimistic concurrency (`read_revision`, `concurrent_edit_conflict`). Verify whether INV-017 needs a companion invariant for concurrent-edit safety, or whether FileSafe.md's updated §11.1.2 is sufficient as the sole owner. If INV-017 is the cross-cutting invariant home, promote to MUST CHANGE.

### Canon Lock Hardening Directives for Existing Packet Intents

These are NOT new packet docs — they are precision annotations that existing Cycle 1/2 packet intents MUST carry when the packet is regenerated from this hardened ledger.

#### Canon Lock 1 → orchestrator-subagent-integration.md (Cycle 1 #11 + Cycle 2 #5)
- **Retire:** L4435 "Maximum 10 subagents per crew" → align with `max_concurrent_agents_per_crew=8`
- **Retire:** L4437 "Maximum 5 active crews per platform" → align with `max_concurrent_crews_per_platform=4`
- **Retire:** L4442-4443 GUI quota examples using "2/5 crews" and "4/5 crews" → use "2/4" and "3/4"
- **Clarify:** crew SIZE limit (total agents assignable to a crew) vs concurrent agent CAP (max simultaneously active per crew) — these are distinct concerns and must not be conflated

#### Canon Lock 2 → Run_Modes.md (Cycle 1 #1)
- **Retire:** L221 `stop.task_timeout` → `kill.task_timeout`
- **Retire:** L222 `stop.budget_exceeded` → `kill.budget_exceeded`
- **Note:** The kill-conditions table must use the canonical two-family naming: `kill.*` for pre-dispatch/active-kill reasons and `done.*` for terminal outcomes

#### Canon Lock 2 → usage-feature.md (Cycle 1 #6 + Cycle 2 #2)
- **Retire:** L76 (approx) `stop.budget_exceeded` → `kill.budget_exceeded`
- **Note:** The pre/post budget enforcement text already references done.budget_exceeded correctly; only the pre-dispatch status name is stale

#### Canon Lock 2 → orchestrator-subagent-integration.md (Cycle 1 #11 + Cycle 2 #5)
- **Retire:** L794 `done.timeout` → `done.task_timeout`

#### Canon Lock 3 → FileSafe.md (Cycle 1 #8 + Cycle 2 #1)
- **Tighten:** L1286 "per-session temp directory or same-directory temp naming scheme" → "same-directory temp files only (`<target>.tmp.<random>` in the target directory) for replacement writes; per-session temp dirs are valid for scratch artifacts and janitor-managed state only"
- **Add:** optimistic concurrency contract to §11.1.2 or new §11.1.3: `read_revision={mtime_ns, content_sha256}` captured on read; re-check before rename; abort with `error.concurrent_edit_conflict` on mismatch
- **Note:** This was flagged as FID-003 (high) but the Cycle 2 register focused on code examples and TODOs, not the §11.1.2 wording itself. This hardening directive closes FID-003.

#### Canon Lock 4 → Prompt_Pipeline.md (Cycle 1 #10 + Cycle 2 #8)
- **Add:** formal untouchable/truncatable set terminology:
  - Untouchable set: system prompt, persona, active tool schemas (NEVER truncated)
  - Truncatable set: remaining pinned/compaction-immune blocks, ordered lowest-priority first, FIFO within each priority
- **Add:** `max_compaction_immune_pct` (default 30, overridable per model) as the named parameter
- **Add:** overflow diagnostic: if untouchable set alone exceeds cap, keep intact and emit `diag.compaction_immune_overflow`
- **Note:** The current §2.0 captures the 30% cap and immune categories but uses softer "surface an explicit sizing problem" wording — this must become deterministic algorithm language

#### Canon Lock 5 → usage-feature.md (Cycle 1 #6 + Cycle 2 #2)
- **Retire:** L425 `estimated_cost_usd: f64?` → `cost_microdollars: u64` in the UsageRecord struct definition
- **Add:** `cost_usd` derivation note: "`cost_usd = cost_microdollars / 1_000_000`, derived at display/export boundaries only; NOT a persisted field"
- **Verify:** token bucket field names match canonical segregation (`cache_read_input_tokens`, `cache_creation_input_tokens`, `reasoning_tokens` — not abbreviated variants)

### Derived / Regen-Only Checks
- `Plans/_shards/**` — regenerate after all Cycle 3 amendments land (stale concurrency values and status names also appear in shards)
- `Plans/Spec_Lock.json` — re-verify after Canon Lock status names change in owner docs
- `Plans/.evidence/**` — re-generate after verification/gates

### Stale Canon Summary (Cycle 3 — Canon Lock retirement targets)
| Doc | Stale Canon To Retire | Replace With | Canon Lock |
|---|---|---|---|
| `Plans/Run_Modes.md` | `stop.task_timeout` (L221) | `kill.task_timeout` | CL-2 |
| `Plans/Run_Modes.md` | `stop.budget_exceeded` (L222) | `kill.budget_exceeded` | CL-2 |
| `Plans/usage-feature.md` | `stop.budget_exceeded` (~L76) | `kill.budget_exceeded` | CL-2 |
| `Plans/usage-feature.md` | `estimated_cost_usd: f64?` (L425) | `cost_microdollars: u64` | CL-5 |
| `Plans/orchestrator-subagent-integration.md` | `done.timeout` (L794) | `done.task_timeout` | CL-2 |
| `Plans/orchestrator-subagent-integration.md` | "Maximum 10 subagents per crew" (L4435) | Align with `max_concurrent_agents_per_crew=8` | CL-1 |
| `Plans/orchestrator-subagent-integration.md` | "Maximum 5 active crews per platform" (L4437) | `max_concurrent_crews_per_platform=4` | CL-1 |
| `Plans/FileSafe.md` | "per-session temp directory or same-directory" (L1286) | same-directory only for replacement writes | CL-3 |
| `Plans/FileSafe.md` | (missing) optimistic concurrency contract | `read_revision={mtime_ns, content_sha256}`; `error.concurrent_edit_conflict` | CL-3 |
| `Plans/Prompt_Pipeline.md` | softened "sizing problem" compaction overflow | formal untouchable/truncatable algorithm + `diag.compaction_immune_overflow` | CL-4 |
| `Plans/Media_Generation_and_Capabilities.md` | `estimated_cost_usd: f64` (L281, L301) | `cost_microdollars: u64` | CL-5 |

### Missing Coverage Warnings
- **Media_Generation_and_Capabilities.md** was not in ANY prior bucket (Cycle 1, Cycle 2, or verify-only). It is now added to MUST CHANGE.
- **No other missing docs** — all remaining Canon Lock violations fall within existing Cycle 1/2 packet intents and are captured as hardening directives above.
- **Shard files** (`_shards/usage-feature/...`, `_shards/orchestrator-subagent-integration/...`) contain stale values but are derived/regen-only — they are NOT packet doc intents.

### Packetization-Ready Doc Set (Cycle 3)

| Path | Why | Likely anchor / section | Change needed | Mode |
|---|---|---|---|---|
| `Plans/Media_Generation_and_Capabilities.md` | stale `estimated_cost_usd: f64` contradicts CL-5 / INV-015 | usage object (L281), field doc (L301) | retire float cost field; add `cost_microdollars: u64` | replace stale field definitions |

### Packetization Reminders (Cycle 3)
- The hardening directives above are NOT separate packet doc intents — they are precision retirement targets that MUST be incorporated into the existing Cycle 1 and Cycle 2 packet intents when the packet is regenerated.
- The Scribe MUST read the full Canon Lock Hardening Directives section (Phase 9) alongside the Cycle 1/2 Packetization-Ready Doc Set tables when generating the next packet.
- Canon Lock specifics override any softer language in earlier phases of this ledger.
- If either MUST VERIFY doc (assistant-chat-design.md or Architecture_Invariants.md) is found to conflict during verification, promote it before packet emission.
- After packetization, regenerate all `Plans/_shards/**` to propagate Canon Lock retirement targets into derived artifacts.

### Cycle 3 Verdict
Cycle 3 adds 1 new MUST CHANGE doc, 0 new MUST RECONCILE docs, 2 MUST VERIFY docs, and 11 Canon Lock hardening directives across 5 existing packet intents. The combined Cycle 1 + Cycle 2 + Cycle 3 register now covers all known Canon Lock obligations. No further reconciliation cycles are needed before packetization.

## Phase 10 — Post-Fidelity Run-04 Reconciliation / Coverage Pass

### Reconciliation Summary
This pass reconciles the remaining doc set after the run-04 ledger fidelity audit. The feature/problem is no longer broad “OpenCode coverage” in general; it is now the smaller set of owner/consumer docs still carrying live canon loss or stale ownership after prior reconciliation cycles.

The design being reconciled here is:
- PM internal orchestration remains PM-native; A2A stays external-reference / future-interop only.
- Child-run lineage, timeout outcomes, and streaming resilience must be implementation-grade in owner docs.
- FileSafe must fully retire legacy fallback / TODO canon and present only rewrite-era fail-closed rules.
- Usage and billing docs must preserve canonical storage, monotonicity, and presentation rules together instead of splitting them between ledger and docs.
- Consumer docs must not overstate coverage or misroute ownership after the owner docs change.

Major drift risks after the run-04 fidelity audit:
- A2A framing can still read like active internal architecture because the provider bridge docs mention A2A without the owner docs explicitly scoping it out.
- FileSafe still mixes rewrite canon with legacy logging/fallback and unresolved checklist language.
- Usage/cost canon is structurally present but still drops critical precision / monotonicity / derived-field rules.
- The coverage matrix and chat consumer docs can remain misleading even if owner docs are corrected.
- The verifier support artifact is empty, so some Phase 9 MUST VERIFY obligations are not auditable yet.

### Raw Coverage Ledger Summary
- **Total planning docs considered in this pass:** 26
- **Current packet candidate docs:** 22 (`Plans/.pipeline/research_packet.json`)
- **Final impacted docs in this pass:** 16
- **Packet doc intents needed now:** 13 (`MUST CHANGE` + `MUST RECONCILE`)

Coverage clusters:
1. **Confirmed remaining owner-doc gaps (10)**  
   `Plans/orchestrator-subagent-integration.md`, `Plans/CLI_Bridged_Providers.md`, `Plans/Contracts_V0.md`, `Plans/FileSafe.md`, `Plans/Prompt_Pipeline.md`, `Plans/Permissions_System.md`, `Plans/usage-feature.md`, `Plans/Run_Modes.md`, `Plans/storage-plan.md`, `Plans/Tools.md`
2. **Consumer / mirror docs that will drift if not reconciled (3)**  
   `Plans/OpenCode_Coverage_Matrix.md`, `Plans/assistant-chat-design.md`, `Plans/Provider_Stream_Mapping_External_Reference_A2A.md`
3. **Verification watchers that should stay out of the packet unless a direct conflict is found (3)**  
   `Plans/FinalGUISpec.md`, `Plans/Architecture_Invariants.md`, `Plans/Media_Generation_and_Capabilities.md`
4. **Current packet docs rechecked and found not to need remaining packet-time changes (10)**  
   `Plans/Models_System.md`, `Plans/GitHub_API_Auth_and_Flows.md`, `Plans/LSPSupport.md`, `Plans/Executor_Protocol.md`, `Plans/Plugins_System.md`, `Plans/Crosswalk.md`, `Plans/interview-subagent-integration.md`, `Plans/WorktreeGitImprovement.md`, `Plans/FinalGUISpec.md`, `Plans/Media_Generation_and_Capabilities.md`

Highest drift-risk seams:
- internal-vs-external A2A framing
- child-run identity and timeout outcome naming
- FileSafe legacy-vs-rewrite canon
- compaction/continuation semantics vs matrix coverage claims
- usage/billing precision and monotonicity vs UI-facing summaries

### Three-Bucket Register (final, mutually exclusive)

#### MUST CHANGE (10 docs — owner docs with confirmed live canon loss or stale canonical text)
1. `Plans/orchestrator-subagent-integration.md`
   - Add explicit owner-level statement that PM internal orchestration is PM-native and A2A is not the internal control protocol.
   - Reconcile duplicated `#### Task-envelope timeout contract` blocks so the only terminal timeout outcome is `done.task_timeout`.
   - Keep the child timeout envelope contract singular and non-contradictory.
2. `Plans/CLI_Bridged_Providers.md`
   - Add explicit external-only A2A scoping near the bridge reference.
   - Add the missing streaming resilience canon: reconnect/resume, bounded retries, jittered backoff, and circuit-breaker thresholds.
3. `Plans/Contracts_V0.md`
   - Replace over-summarized subagent/crew event payloads that collapse to `agent_id` / `parent_thread_id`.
   - Ensure concrete event families explicitly preserve canonical lineage fields (`run_id`, `thread_id`, `parent_run_id`, `child_run_id`).
4. `Plans/FileSafe.md`
   - Retire legacy dual logging canon (`filesafe-events.jsonl` vs seglog) from normative sections.
   - Retire stale unresolved checklist/TODO phrasing around worktree symlinks and path normalization.
   - Keep only fail-closed rewrite canon in owner sections.
5. `Plans/Prompt_Pipeline.md`
   - Add the missing synthetic-continue / loop-prevention state machine so compaction canon is complete, not just immune-content preservation.
   - Keep the continuation guard implementation-grade enough for packetization.
6. `Plans/Permissions_System.md`
   - Add explicit canon for auto-loaded executable surfaces (MCP/custom-tool/plugin/executable config approval/signing restrictions).
   - Reconcile path matching with FileSafe’s filesystem-aware case-folding rule instead of OS-level heuristics.
7. `Plans/usage-feature.md`
   - Add monotonic/non-negative cost behavior, negative-cost clamp/adjustment handling, and the rule that `cost_usd` is presentation-only.
   - Restore the sub-cent adaptive display precision tier (`<$0.01 => 6 decimals`) and keep the owner doc aligned with UI consumers.
8. `Plans/Run_Modes.md`
   - Add the missing lifecycle canon for `done.cancelled`, `done.crashed`, seglog flush on shutdown, and startup recovery from incomplete seglog entries.
9. `Plans/storage-plan.md`
   - Add the storage-root detection order (`config > $PUPPET_MASTER_DATA_DIR > project dir > global dir`) so migration/path resolution is deterministic.
10. `Plans/Tools.md`
   - Tighten schema-cycle handling so the doc says what happens on `$ref` revisit (`{}` substitution + warning + safe continuation), not just that cycles are detected.

#### MUST RECONCILE (3 docs — nearby consumers/mirrors that will become misleading if left untouched)
1. `Plans/OpenCode_Coverage_Matrix.md`
   - Reconcile row 32 / compaction coverage so it does not claim full coverage while synthetic-continue canon is still missing from `Prompt_Pipeline.md`.
2. `Plans/assistant-chat-design.md`
   - Reconcile the “Concurrent threads” note so it stops routing ownership through `FinalGUISpec.md` and clearly distinguishes thread-level UI concurrency from global runtime subagent limits.
3. `Plans/Provider_Stream_Mapping_External_Reference_A2A.md`
   - Add explicit external-reference / future-interop framing so the document cannot be read as approval for internal PM orchestration after `CLI_Bridged_Providers.md` is updated.

#### MUST VERIFY (3 docs — likely to drift, but not yet confirmed packet intents)
1. `Plans/FinalGUISpec.md`
   - Verify it still matches the owner-doc precision, `pm.lock`/viewer-mode, and MCP readiness semantics after the owner-doc changes land.
2. `Plans/Architecture_Invariants.md`
   - Verify whether any of the new billing-integrity or concurrent-edit rules need promotion into cross-cutting invariant form, rather than remaining only in owner docs.
3. `Plans/Media_Generation_and_Capabilities.md`
   - Verify it continues to use `cost_microdollars` only; run-04 recheck indicates the earlier float-cost concern was a false positive and should not re-enter the packet unless a new conflict is found.

### Derived / Regen-Only Checks
- `Plans/_shards/**` — regenerate after the packeted owner/consumer docs are updated.
- `Plans/.pipeline/ledger_fidelity_report.txt` and `Plans/.pipeline/runs/r-20260328-192850-04/ledger_fidelity_report.txt` — evidence/support artifacts only; do not convert them into packet doc intents.
- `Plans/.pipeline/verifier_report.txt` — support artifact only, but it must be populated with explicit MUST VERIFY dispositions before final packet emission.
- `Plans/Spec_Lock.json` — verify only after the packet doc set is updated; do not treat it as a packet doc intent.

### Missing Coverage Warnings
- **Missing from current packet candidate but should be included:**  
  - `Plans/assistant-chat-design.md` — still carries the stale concurrency ownership reference.  
  - `Plans/Provider_Stream_Mapping_External_Reference_A2A.md` — still needs explicit external-only framing to avoid drift after A2A scoping is corrected in owner docs.
- **Current packet candidate is broader than the real remaining change set.** Do not blindly reuse all 22 packet docs; several prior-cycle docs now read as settled or verify-only rather than live packet intents.
- **Support-artifact warning:** `Plans/.pipeline/verifier_report.txt` is empty, so packet emission should not be treated as fully auditable until that verifier output is populated.

### Packetization-Ready Doc Set
These are the docs that belong in the next packet now (`MUST CHANGE` + `MUST RECONCILE` only):

| Path | Why it belongs | Likely anchor / section | Change needed | Change mode |
|---|---|---|---|---|
| `Plans/orchestrator-subagent-integration.md` | owner doc for internal orchestration scope and child timeout semantics | `## Executive Summary`, `#### Task-envelope timeout contract` | add PM-native/A2A scope statement; retire duplicate `done.timeout` canon | replace stale canonical text + additive |
| `Plans/CLI_Bridged_Providers.md` | provider bridge owner doc still under-specifies bridge scope and streaming resilience | A2A bridge reference; stream cancellation / failure-class sections | add external-only framing and full retry/backoff/breaker canon | additive |
| `Plans/Contracts_V0.md` | event/schema owner doc still over-summarizes child lineage | child-run lifecycle / stable subagent and crew event families | expand event payload canon to preserve full lineage fields | replace over-summarized table rows |
| `Plans/FileSafe.md` | owner doc still mixes rewrite canon with legacy logging/TODO material | event logging, key integration rules, implementation checklist | retire dual logging and resolved symlink/TODO text | replace stale canonical text |
| `Plans/Prompt_Pipeline.md` | compaction owner doc still misses continuation/loop-prevention half of canon | compaction and pruning / continuation behavior | add normative synthetic-continue gate/state machine | additive |
| `Plans/Permissions_System.md` | owner doc still lacks executable-surface governance and has case-sensitivity drift | definitions/scope; wildcard/path matching; special guards | add auto-load approval/signing canon; align case matching to FileSafe | additive + reconcile conflicting wording |
| `Plans/usage-feature.md` | owner doc still drops cost-integrity and sub-cent precision canon | spending limits and budget enforcement; UsageRecord schema; adaptive display precision | add monotonic/clamp/derived-field rules and restore 6-decimal sub-cent precision | additive + replace stale simplified precision text |
| `Plans/Run_Modes.md` | lifecycle owner doc still misses cancelled/crashed shutdown canon | signal handling and process lifecycle; run outcome taxonomy | add shutdown flush, incomplete-seglog recovery, `done.cancelled`, `done.crashed` | additive |
| `Plans/storage-plan.md` | migration/storage owner doc still lacks deterministic storage-root resolution | naming and migration rules / storage-root selection | add storage-root detection precedence | additive |
| `Plans/Tools.md` | schema-resolution owner doc still leaves cycle-break output implicit | schema isolation / MCP schema resolution | specify `{}` substitution, warning emission, and safe continuation on cycle hit | additive |
| `Plans/OpenCode_Coverage_Matrix.md` | coverage consumer must stop overstating compaction/context coverage | row 32 and related summary text | downgrade/clarify coverage until synthetic-continue canon lands | replace stale summary text |
| `Plans/assistant-chat-design.md` | consumer chat doc still misroutes concurrency ownership | `### 23.4 Adopted enhancements (all MVP)` item 22 | repoint ownership to orchestrator SSOT and distinguish thread vs global concurrency | additive / reconcile reference text |
| `Plans/Provider_Stream_Mapping_External_Reference_A2A.md` | referenced bridge doc needs framing protection against internal-adoption drift | intro / scope framing above mapping tables | add explicit external-reference/future-interop-only framing | additive |

### Stale Canon Notes (highest-risk retirement targets in this pass)
| Doc | Stale Canon To Retire | Replace With |
|---|---|---|
| `Plans/orchestrator-subagent-integration.md` | duplicated `done.timeout` timeout outcome | only `done.task_timeout` |
| `Plans/FileSafe.md` | normative dual-path logging (`filesafe-events.jsonl` or seglog) | seglog-era canonical logging only; legacy path moved out of normative owner text |
| `Plans/FileSafe.md` | unresolved symlink/path checklist phrasing | already-resolved fail-closed realpath canon |
| `Plans/usage-feature.md` | 2-tier precision only (`<$1 = 4dp`) | 3-tier precision with `<$0.01 = 6dp` |
| `Plans/Permissions_System.md` | OS-heuristic case-sensitivity rule | FileSafe-aligned filesystem-aware case-folding rule |
| `Plans/OpenCode_Coverage_Matrix.md` | row 32 “Covered” without continuation canon | honest coverage status until continuation canon lands |

### Packetization Reminders
- Do not mechanically reuse the broad 22-doc packet candidate from the current research packet. The remaining packet now needs the 13 docs above plus support-artifact verification.
- The packet must add the two currently-missing consumer docs (`assistant-chat-design.md`, `Provider_Stream_Mapping_External_Reference_A2A.md`) or the owner-doc corrections will still drift in nearby planning surfaces.
- `Plans/Media_Generation_and_Capabilities.md` was rechecked and should stay out of the packet unless a new direct contradiction is found; the earlier float-cost concern did not survive re-verification.
- `Plans/.pipeline/verifier_report.txt` must be populated before final emission, but it is a support artifact, not a packet doc intent.

### Phase 10 Verdict
The current packet candidate is not yet coverage-complete. The real remaining packet is narrower than earlier cycles but still missing two consumer docs and ten owner-doc fixes. After the 13-doc packet above is emitted and the verify-only/support artifacts are checked, this work item should remain in `ready_for_packetize`, not `packetized`.

<ready_for_packetize/>
