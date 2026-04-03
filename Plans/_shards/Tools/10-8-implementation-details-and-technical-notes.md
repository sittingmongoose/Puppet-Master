## 8. Implementation details and technical notes

### 8.0 Event payloads (seglog)

Subagent, crew, and context-shaping events must project from a single canonical family.

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/storage-plan.md, ContractName:Plans/assistant-chat-design.md

Required child lifecycle event families:
- `subagent.spawn_requested`
- `subagent.spawned`
- `subagent.started`
- `subagent.progress`
- `subagent.work_delta`
- `subagent.thought_delta`
- `subagent.awaiting_parent`
- `subagent.blocked`
- `subagent.context_expansion_requested`
- `subagent.user_input_requested`
- `subagent.completed`
- `subagent.failed`
- `subagent.cancel_requested`
- `subagent.cancelled`
- `subagent.superseded`
- `subagent.retry_requested`
- `subagent.retried`
- `subagent.rerouted`
- `subagent.resumed`
- `subagent.context_shrunk`
- `subagent.context_rehydrated`

Required crew event families:
- `crew.created`
- `crew.member_started`
- `crew.member_completed`
- `crew.message_posted`
- `crew.completed`

Minimum event payload identity fields:
- `thread_id`
- `parent_run_id`
- `child_run_id?`
- `batch_id?`
- `subgroup_id?`
- `attempt_id?`
- requested/effective Persona and runtime fields where relevant
- timestamp

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/Provider_OpenCode.md

Tool invocation events:

The `tool.invoked` event for `grep` MUST include an optional `index_used: boolean` field indicating whether the sparse n-gram index was used to accelerate the query. When `true`, the index narrowed the candidate file set before ripgrep verification. When `false` or absent, raw ripgrep was used on all files (fallback path).

ContractRef: ContractName:Plans/usage-feature.md, ContractName:Plans/Contracts_V0.md

### 8.1 Config persistence

- **Where:** Tool permissions live in the same config as the rest of Settings (e.g. `GuiConfig` in memory, persisted to redb as `config:v1` per FinalGUISpec §15.1). Use the key **`tool_permissions`** (object: tool name or wildcard → `"allow"` | `"deny"` | `"ask"`, or per-tool object for granular rules per §10.1).
- **Scope:** Tool permissions support app-level defaults plus project-scoped overrides for the active project context. Project switching recalculates the effective permission set from the current scope layers.
- **Mid-run:** Run config is an immutable snapshot at start (FinalGUISpec §9.7). Changing Settings (including tool permissions) mid-run does **not** affect the active run; next run picks up the new config.

### 8.2 Policy application order and invocation flow

Tool dispatch follows one canonical order. No tool implementation is invoked directly outside this flow.

ContractRef: ContractName:Plans/Permissions_System.md, ContractName:Plans/Architecture_Invariants.md

Required order:
1. Normalize the invocation context and expand relevant paths.
2. Evaluate `policy.may_execute_tool()` on the invocation.
3. For file-affecting tools, run FileSafe/write-scope checks on the normalized path arguments.
4. Apply provider-specific argument normalizers where the tool surface explicitly allows them, including concrete compatibility fixes such as GLM quoted-JSON unquoting and Qwen XML-wrapper stripping before schema validation.
5. Run `schema.validate_tool_args()` on the post-normalization argument set.
6. Run arg-touching hooks.
7. Re-run permission and schema validation if hook output changed arguments.
8. Dispatch only if all checks pass.

ContractRef: ContractName:Plans/FileSafe.md, ContractName:Plans/Plugins_System.md, ContractName:Plans/Contracts_V0.md

Failure behavior:
- invalid arguments MUST produce a structured tool result with `is_error=true`; PM MUST NOT execute the tool and then "best effort" repair the failure afterwards
- provider-specific retry decisions MUST use structured error classes or status codes, never substring matching on error text

ContractRef: ContractName:Plans/Executor_Protocol.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/CLI_Bridged_Providers.md

Truncation gate:
- if upstream provider output ends with `finishReason=length` or equivalent truncation while a tool invocation is incomplete, PM closes the invocation with a structured truncation error and MUST NOT dispatch the tool
- PM MUST reject empty or structurally incomplete tool arguments produced by truncation before any permission or execution path is reached

ContractRef: ContractName:Plans/CLI_Bridged_Providers.md, ContractName:Plans/Run_Modes.md, ContractName:Plans/Contracts_V0.md

#### Retry classification and bounded recovery

Automatic retries are classed and capped per invocation:
- transient transport, server-warming, and recoverable bootstrap failures MAY retry automatically, but the total automatic attempts are capped at 3 per invocation
- default backoff is `1000ms`, `2000ms`, then `4000ms` with `+/-25%` jitter unless a stricter `Retry-After` or provider minimum delay applies
- helper/client recreation is allowed only for failures explicitly classified as recoverable, and the recreated attempt still counts toward the same retry cap
- auth-required, permission-denied, schema-mismatch, validation-failed, content-filter, and safety-stop classes are terminal for that invocation and MUST NOT be retried automatically

ContractRef: ContractName:Plans/CLI_Bridged_Providers.md, ContractName:Plans/Executor_Protocol.md, ContractName:Plans/Contracts_V0.md

#### Deadline propagation and loop suppression

Nested tool work inherits a parent deadline rather than minting a fresh timeout window:
- every tool/helper invocation receives the parent's current absolute deadline or remaining-budget snapshot
- retries, helper restarts, and nested tool work MUST clamp to the remaining budget and MUST NOT extend the parent deadline
- if the remaining budget is exhausted before a retry starts, PM emits a structured timeout or budget result without dispatching the new attempt
- automatic retry suppression compares normalized tool fingerprint, canonical target, error class/status, and near-match argument or stderr signatures; same or substantially equivalent failures without progress MUST stop further retries and emit a diagnostic instead of looping indefinitely

ContractRef: ContractName:Plans/Run_Modes.md, ContractName:Plans/orchestrator-subagent-integration.md, ContractName:Plans/storage-plan.md

#### Shell-runtime rules

Shell-dispatch rules are part of the canonical tool flow:
- banned-command checks scan the full rendered command string, including metacharacter and control forms such as `;`, `&&`, `||`, `|`, subshell/grouping constructs, command substitution (`$()` and backticks), and redirection operators where relevant to the shell family
- implementations SHOULD prefer structured parsing or AST-aware validation where the shell family makes it practical; fallback scanning still MUST evaluate the full rendered command rather than only the first token
- dispatch occurs through exactly one shell interpretation layer; `eval` and equivalent second-pass command construction are prohibited
- shell selection is platform-aware (`/bin/bash` or equivalent on Unix; `cmd.exe` / PowerShell family on Windows based on configured tool semantics)
- shell instances are isolated per agent tree so environment variables do not leak across session/agent boundaries
- shell lifecycle is mutex-guarded; work queues MUST be non-blocking, and writes to a dead shell return a structured error instead of hanging forever

ContractRef: ContractName:Plans/Run_Modes.md, ContractName:Plans/orchestrator-subagent-integration.md, ContractName:Plans/Permissions_System.md

### 8.3 Registry → platform CLI flag derivation

The runner (or a dedicated module) derives platform-specific CLI flags from the **canonical** permission set so the platform only sees tools we allow. Example mapping (implement in platform_specs or runner):

- **Claude:** `--allowedTools "Read,Edit,Bash"` → build list from registry "allow" + "ask" (ask still requires approval at runtime); if edit is deny, omit Edit.
- **Copilot:** `--allow-tool 'shell(git)'` etc., or `--allow-all-tools` when policy is permissive; `--deny-tool` for denied tools. Build allow/deny lists from registry.
- **Gemini:** N/A (Direct-provider; tool gating is enforced by Puppet Master policy, not provider CLI flags).

**Single source of truth:** Registry + policy (from config) → derive flags per platform; no hardcoding in runner. Document the derivation rules in platform_specs or a single "tool policy → CLI args" function.

### 8.4 Redb keys for tool rollups (Usage widget)

Analytics scan writes rollups for the Usage page (FinalGUISpec §7.8). For the **tool usage widget** (per-tool count, latency, error rate):

- **Namespace:** `rollups`
- **Key:** `tool_usage.{window}` where **window** is one of the **canonical** values: `5h`, `7d`, `24h` (and optionally `1h`). The definitive list of window values is in storage-plan.md; Analytics scan and Usage widget must use the same set.
- **Value shape:** JSON or bincode: `{ [tool_name: string]: { count: number, p50_ms: number, p95_ms: number, error_count: number } }`. Example: `{ "bash": { "count": 42, "p50_ms": 120, "p95_ms": 500, "error_count": 2 }, "read": { ... } }`. Analytics scan aggregates `tool.invoked` events (fields: tool_name, latency_ms, success, error) into this structure so the Usage page can render the table without scanning seglog. See §8.0 for event payload and storage-plan.md §2.3.
- **Error-count semantics:** `error_count` is the number of `tool.invoked` events in the window where `success = false`. `tool.denied` events and FileSafe blocks are excluded from `tool_usage.{window}` rollups so the widget reflects executed tool calls only.
- **Freshness signal:** Analytics scan SHOULD also persist `tool_usage_meta.{window}` with `computed_at`, `window_started_at`, and `window_ended_at` so the Usage page can show a "Last updated" timestamp without opening seglog.

### 8.5 YOLO and tool permissions

When the user enables **YOLO** (Assistant), treat all tools as **allow** for that session for the purpose of prompting (no "ask" prompts). **FileSafe** still applies: destructive commands and write-scope/sensitive-file guards are still enforced. So: YOLO = "don't ask for tool approval"; it does **not** disable FileSafe.

### 8.6 MCP tool name format and wildcard rule

- **Namespacing:** Use a stable format for MCP tool names in the registry, e.g. **`{server_slug}_{tool_name}`** (e.g. `context7_query_docs`) or **`{server_slug}/{tool_name}`**. Server slug is a short id for the MCP server (from config or derived). Enables wildcards like `context7_*`.
- **Wildcard matching:** **Prefix match.** A rule `mymcp_*` matches any tool name that **starts with** `mymcp_`. More general globs (e.g. `*_read`) can be added later if needed; document the rule in the registry spec.

### 8.7 MCP server unavailable

When an MCP server is unavailable because of startup timeout, transport failure, auth loss, schema mismatch, or repeated health-check failure, PM treats this as a structured degraded-state condition.

ContractRef: ContractName:Plans/Executor_Protocol.md, ContractName:Plans/Contracts_V0.md

Required behavior:
- Tools from that server are marked `unavailable` in the registry.
- Calls to those tools fail immediately with a structured error and `failure_class=provider_transient` (or a stricter class when the error is known-fatal).
- Per-tool MCP invocation timeout defaults to 30 seconds and MAY be overridden per server with a configured timeout. This timeout is independent of startup-timeout and reconnect cool-down settings.
- PM emits a structured diagnostic containing `server_id`, `reason`, `last_healthy_at`, and whether a stale list is still available.
- One automatic reconnect attempt MAY occur after the configured cool-down (default 60 seconds); after that, recovery requires user action or config change.
- User surfaces show the server as `degraded` or `unavailable`; PM MUST NOT silently hide the server after a single transient failure.

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/FinalGUISpec.md

### 9.1 Gaps and potential problems

| Gap / risk | Description | Mitigation |
|------------|-------------|------------|
| **Platform tool semantics differ** | Built-in tools (edit, bash, read) behave differently per platform (e.g. partial vs full file edit, shell env). | Document per-platform behavior in platform_specs or Provider docs; registry stays canonical; acceptance tests per platform. |
| **MCP tool names unstable** | MCP servers can change tool names or add/remove tools between runs. | Namespace by server; wildcard permissions; Doctor or pre-run check to list discovered MCP tools. |
| **Permission default ambiguity** | New or unknown tools (e.g. new MCP server) may have no explicit permission. | Default table (§10.2): "Any unknown tool" → **ask**. Resolution (§10.3) step 3: unknown falls through to step 7. Implement default table as code. |
| **Custom tool sandboxing** | Custom tools run arbitrary code; weak sandbox can allow escape or abuse. | MVP: subprocess with timeout (e.g. 60s) and output size cap (e.g. 1 MiB) per §4.3. Document in implementation plan. |
| **Ask vs HITL in orchestrator** | Orchestrator runs are often headless; "ask" has no UI. | For orchestrator: map "ask" to deny, or to a pending-approval state (HITL) if enabled; document in human-in-the-loop.md. |
| **Edit permission vs write scope** | User allows "edit" but FileSafe write scope restricts to plan files. Agent may try to edit out-of-scope file. | Clear error message: "Edit allowed but file not in write scope." Ensure FileSafe and tool policy share same vocabulary in UI. |
| **Tool latency in seglog** | High volume of tool events can grow seglog quickly. | **Recommended for MVP:** retention -- keep last 90 days then prune; analytics scan only needs rollups. Alternatives: compaction (merge into rollups, drop raw after N days) or sampling; document chosen strategy in storage-plan.md. |
| **Subagent tool defaults** | todowrite/todoread disabled for subagents can confuse agents that expect task lists. | Document in agent-facing docs (AGENTS.md or generated context). Override via run config (e.g. `subagent_tool_overrides: { "todowrite": "allow" }`); schema and location in implementation plan and orchestrator-subagent-integration.md. |
| **LSP tool when no server** | lsp tool is MVP when LSP is MVP; when no LSP server is available for the language, lsp returns no results or "LSP unavailable." | lsp adapter returns structured error per §3.5; Doctor reports LSP server status. Plans/LSPSupport.md §9.1. |
| **webfetch / websearch abuse** | Agent could request excessive or sensitive URLs/queries. | FileSafe URL allowlist/denylist; optional query rate limit; don't log full query/URL in plaintext (newtools §8.2.1). |
| **Config key for tool permissions** | Where exactly in redb/GuiConfig tool_permissions lives. | **tool_permissions** in same config blob as rest of Settings; persisted as part of `config:v1` in redb (§8.1, §8.0). Single key only. |
| **Permission change mid-run** | User changes Settings while a run is active. | Run uses immutable snapshot at start; no change until next run (FinalGUISpec §9.7; §8.1). |
| **MCP server down** | Context7 (or other server) enabled but fails to start. | Hide that server's tools for the run or mark unavailable; Doctor shows "Context7 unavailable" (§8.7). |
| **Tool usage widget empty** | New install or no tool events yet. | Show "No tool data yet -- run a task to see tool usage" and short explanation; don't leave blank. |
| **All providers in MCP GUI** | FinalGUISpec listed only Cursor, Claude, Gemini for MCP toggles. | Ensure **Codex** and **Copilot** are included in Settings > Advanced > MCP Configuration (all providers). |
| **Policy application point** | Where in the stack we enforce allow/deny/ask. | In Provider/runner when processing tool call from platform stream; before executing or forwarding (§8.2). |
| **LSP server crash mid-call** | LSP server crashes or disconnects while handling lsp.references / definition / hover / rename. | lsp adapter returns `{ "error": "lsp_unavailable", "message": "LSP server closed or timed out" }` (§3.5); enforce request timeout (e.g. 10s). |

### 9.2 Enhancements (all optional; not MVP)

The following are **optional** improvements. MVP is defined by §3 built-in tools, §10 permission model, §8 events/rollups, and GUI Tool permissions (FinalGUISpec §7.4.10).

| Enhancement | Description | Priority / notes |
|------------|-------------|-------------------|
| **Per-tool rate limits** | Limit invocations per tool per run/session (e.g. max 100 grep calls). | Reduces runaway tool use; configurable per tool or global. |
| **Tool usage dashboard** | Dashboard widget: most-used tools, latency p50/p95, error rate by tool (from seglog rollups). | storage-plan + usage-feature; already implied by analytics scan. |
| **Permission presets** | Presets: "Read-only" (deny edit, bash, webfetch, websearch), "Plan mode" (allow information-gathering tools such as read/grep/glob/list/question/skill/todoread/todowrite/capabilities.get/read-only lsp/webextract/webresearch but deny state mutation), "Full" (allow all with ask for bash/edit). | Simplifies config; maps to assistant modes (Ask, Plan, Agent). Plan mode allows information gathering but not state mutation. |
| **Custom tool templates** | Project or org templates for common custom tools (e.g. "run tests", "deploy staging") with schema and default permission. | Encourages reuse; catalog in docs or GUI. |
| **MCP tool allowlist** | Option to allow only specific MCP tools by name (e.g. only `context7_query_docs`) even if server is enabled. | Finer control than server-level enable; complements wildcards. |
| **Audit log for denied/ask** | Explicit audit event when a tool is denied or when user declines an "ask". | Helps compliance and debugging; store in seglog with tool name, reason, timestamp. |
| **Tool description in UI** | In Config or run summary, show which tools are available and their permission (allow/deny/ask) for the current run. | Transparency; can be generated from registry + run config. |
| **Bash command allowlist** | Beyond FileSafe blocklist: allowlist of permitted commands (e.g. `npm test`, `cargo build`) when bash is "allow". | Stricter than blocklist-only; optional; align with FileSafe. |

---

