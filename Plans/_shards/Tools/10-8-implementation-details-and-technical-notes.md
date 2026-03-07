## 8. Implementation details and technical notes

### 8.0 Event payloads (seglog)

Tool events feed analytics and the Usage tool widget. Align with **storage-plan.md** §2.2.

- **`tool.invoked`:** Emitted when a tool call is allowed and execution completes. Payload: `tool_name` (string, required), `run_id` (string, required), `thread_id` (string, optional), `latency_ms` (number, required; wall-clock execution time in milliseconds), `success` (boolean, required), `error` (string, optional when success is false). See storage-plan.md §2.2.
- **`tool.denied`:** Emitted when policy blocks (deny) or user declines ask. Payload: `tool_name`, `run_id`, `thread_id` (optional), `reason` (required: `permission_denied` or `user_declined`). Do not emit for FileSafe blocks. redb: `tool_permissions` in app config (`config:v1`); rollups key `rollups` / `tool_usage.{window}` per §8.4.

### 8.1 Config persistence

- **Where:** Tool permissions live in the same config as the rest of Settings (e.g. `GuiConfig` in memory, persisted to redb as `config:v1` per FinalGUISpec §15.1). Use the key **`tool_permissions`** (object: tool name or wildcard → `"allow"` | `"deny"` | `"ask"`, or per-tool object for granular rules per §10.1).
- **Scope:** Can be app-level only for MVP; per-project overrides (e.g. `project.{project_id}.tool_permissions`) are an enhancement if needed.
- **Mid-run:** Run config is an immutable snapshot at start (FinalGUISpec §9.7). Changing Settings (including tool permissions) mid-run does **not** affect the active run; next run picks up the new config.

### 8.2 Policy application order and invocation flow

1. **When:** Policy is evaluated when a tool is about to be invoked. For CLI-based platforms, the Provider/runner typically sees tool calls in the stream; the **policy check** runs in the adapter/runner before executing or forwarding the tool call.
2. **Allow:** Pass through to platform (or execute built-in); emit `tool.invoked` (and on completion, latency, success/error).
3. **Deny:** Do not pass to platform; return a structured error to the agent (e.g. "Tool X is disabled for this run"); emit `tool.denied` if implemented.
4. **Ask:** In Assistant, show approval UI; on approve, treat as allow for that call (or "approve for session"). In Orchestrator/Interview, if no UI (headless): map to **deny** or to a **pending-HITL** state if HITL is enabled at that tier (human-in-the-loop.md).
5. **FileSafe:** After permission allows the tool, FileSafe still applies (e.g. bash command blocklist, write scope). Apply FileSafe in the same runner/adapter layer before actually executing.

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

If an MCP server is enabled in config but fails to start or connect at run start, either (a) **hide** its tools from the registry for that run (agent doesn't see them), or (b) **register** them as "unavailable" and return a clear error if the agent tries to call one. Prefer (a) to avoid failed tool calls; document in Doctor so the user sees "Context7 unavailable (connection failed)."

---

