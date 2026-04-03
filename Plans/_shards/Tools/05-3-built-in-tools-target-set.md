## 3. Built-in tools (target set)

The following built-in tools are the **target set** for the central tool registry. Semantics align with [OpenCode's built-in tools](https://opencode.ai/docs/tools/#built-in). Mapping to each platform's native tools (Read/Edit/Bash, etc.) is a Provider/runner concern; the registry holds canonical names and the policy layer applies regardless of provider.

### 3.1 Tool table

| Tool | Purpose | Permission key | Limits / notes |
|------|----------|----------------|----------------|
| **bash** | Execute shell commands in project environment | `bash` | FileSafe applies (blocklist, path guards). CWD = project/workspace. Consider timeout and output size limits. |
| **edit** | Modify existing files via exact string replacements | `edit` | Primary code-edit path. FileSafe write scope can restrict which files. |
| **write** | Create new files or overwrite existing ones | (same as `edit`) | Same permission as edit; overwrites if file exists. |
| **read** | Read file contents; supports line ranges | `read` | FileSafe security filter can block sensitive paths (.env, keys). Large files: line-range or size cap. |
| **grep** | Search file contents with regex; file pattern filtering. Transparently accelerated by the per-project sparse n-gram index when available; the same backend also serves Search-panel regex mode | `grep` | Same limits and permission posture as existing grep. Respect .gitignore unless .ignore overrides. Stale snapshots remain queryable; fallback to raw ripgrep only when the index is missing, building without a valid snapshot, corrupted, disabled, or the query cannot be narrowed |
| **glob** | Find files by glob pattern (e.g. `**/*.ts`) | `glob` | Returns paths sorted by modification time. Same ignore rules as grep. |
| **list** | List files and directories; accepts glob filters | `list` | Same ignore rules. Depth/result limits to avoid huge listings. |
| **patch** | Apply patch files to the codebase | (same as `edit`) | Unified diff; same write scope as edit. |
| **multiedit** | Multiple edits in one operation (batch string replacements) | (same as `edit`) | OpenCode: edit permission covers edit, write, patch, multiedit. |
| **webfetch** | Fetch web content from a URL | `webfetch` | URL allowlist/denylist (FileSafe); timeout; size cap. Document which domains are contacted. |
| **websearch** | Search the web (discovery) | `websearch` | When enabled (env or config); may use Exa or cited-search MCP (newtools §8.2.1). |
| **webextract** | Extract a target page/site | `webextract` | Targeted site/page extraction with audit visibility. |
| **webresearch** | Run multi-source web research | `webresearch` | Research synthesis with explicit provenance and support-lane disclosure. |
| **webcrawl** | Crawl a site or section | `webcrawl` | Multi-page crawl; bounded by permission and fan-out limits. |
| **webmap** | Map site structure | `webmap` | Site-structure discovery with bounded traversal. |
| **question** | Ask the user structured questions during execution | `question` | Supports both single-question and multi-question questionnaire flows. Only meaningful when HITL/UI can show prompts. |

ContractRef: ContractName:Plans/Permissions_System.md, ContractName:Plans/FileSafe.md, ContractName:Plans/storage-plan.md

### 3.1A Debug-capable tool classification

The tool registry must classify **debug-capable** tools as a cross-surface capability family rather than as an Assistant-only silo.

Required registry rules:
- `debug_capable` is metadata on a tool or capability, not a new tool ID
- tools and capabilities may also carry usage tags such as `debug`, `evidence_capture`, `instrumentation`, `reproduction`, and `verification`
- built-in tools commonly participating in this family include `read`, `grep`, `glob`, `list`, `bash`, the edit group, `logsearch`, `logread`, `lsp`, and `task`
- browser automation capabilities, DAP controls, runtime-artifact export helpers, eligible MCP tools, and eligible custom tools may also join the family when the registry metadata says they are debug-capable

ContractRef: ContractName:Plans/Permissions_System.md, ContractName:Plans/Runtime_Artifacts_Panel.md, ContractName:Plans/newtools.md

Cross-surface rules:
- Assistant Debug Mode is the chat entrypoint that most aggressively prefers this family
- Orchestrator, Interview, and delegated runs may use the same debug-capable tools under the same permission, artifact, and visibility contracts
- tool availability, denials, and degraded capability state continue to flow through the same requested/effective policy system and persisted event stream
- classifying a tool as debug-capable does not authorize hidden evidence ingress or bypass the normal permission model

ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Run_Modes.md, ContractName:Plans/Contracts_V0.md

### 3.2 Edit group and ignore patterns

- **Edit group:** `edit`, `write`, `patch`, and `multiedit` share one **edit** permission so that "allow file changes" is a single knob ([OpenCode](https://opencode.ai/docs/tools/): "The edit permission covers all file modifications (edit, write, patch, multiedit)").
- **Ignore patterns:** grep, glob, list respect `.gitignore` by default. A project **`.ignore`** file can explicitly allow paths (e.g. `!node_modules/`) for search/list. See [OpenCode -- Ignore patterns](https://opencode.ai/docs/tools/#ignore-patterns).

### 3.3 Platform mapping (registry → CLI)

Providers map canonical tool names to platform-native equivalents (e.g. `edit` → Claude "Edit", Cursor edit tool, etc.). The registry and permission engine use **canonical names only**; platform_specs or runner code holds the mapping so that adding a new provider does not require changing permission config.

### 3.4 LSP and built-in tools (MVP)

With **LSP MVP** (Plans/LSPSupport.md), the following tools are **enhanced or newly available** to agents:

| Tool | Effect of LSP MVP |
|------|-------------------|
| **lsp** | **Promoted to MVP** (no longer experimental/feature-flagged). Agents can invoke canonical read/navigation operations including definition, references, hover, document/workspace symbols, implementation, and call hierarchy. `lsp.rename` remains approval-gated. Requires a running LSP server for the project language. When no server is available, the lsp tool returns no results or a clear "LSP unavailable" response. See Plans/LSPSupport.md §9.1. |
| **codesearch** | **Enhanced** when LSP is available: can use LSP `workspace/symbol` (and optionally `documentSymbol`) for **symbol-aware search** (find by symbol name, kind, and location) in addition to text-based search. Fallback: text-based or indexed search when LSP is disabled or no server for the language. |
| **read** / **grep** / **edit** (context) | **Context enrichment:** Assistant/Interview context can include a **summary of current LSP diagnostics** for @'d or open files (errors/warnings with file, line, message, severity). Agents then see linter/type errors when using read/grep/edit and can suggest fixes. Not a new tool; the context passed to the agent is enhanced (Plans/LSPSupport.md §5.1). |

**Implementation note:** The lsp tool should be implemented to call the same LSP client used by the editor and Chat (diagnostics, hover, definition, references, symbols, implementation, call hierarchy, rename). Permission for `lsp` follows the same allow/deny/ask model; default allow for read/navigation operations, with separate approval for `lsp.rename`.

#### 3.4.1 LSP tool (MVP) -- parameters, permission, rename approval

**Tool name:** `lsp`. No feature flag (e.g. no `OPENCODE_EXPERIMENTAL_LSP_TOOL`); the tool is available when the LSP client is enabled for the project.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `operation` | string | yes | One of the canonical LSP operations from §3.5E. MVP read/navigation operations include `"references"`, `"definition"`, `"hover"`, `"documentSymbol"`, `"workspaceSymbol"`, `"implementation"`, `"prepareCallHierarchy"`, `"incomingCalls"`, `"outgoingCalls"`, plus approval-gated `"rename"`. |
| `path` | string | yes | File path (project-relative or absolute) containing the symbol. |
| `position` | object | yes for definition, hover, references | `{ "line": number (0-based), "character": number (0-based) }`. |
| `newName` | string | yes for rename | New symbol name when `operation` is `"rename"`. |

**LSP methods:** `textDocument/references`, `textDocument/definition`, `textDocument/hover`, `textDocument/documentSymbol`, `workspace/symbol`, `textDocument/implementation`, `textDocument/prepareCallHierarchy`, `callHierarchy/incomingCalls`, and `callHierarchy/outgoingCalls`; for rename: call `textDocument/prepareRename` first when supported -- if it fails or is unsupported, do not call `textDocument/rename` (return structured error to agent); otherwise `textDocument/rename`.

**Permission:** Read/navigation operations use permission key `lsp`; default **allow**. The **rename** operation applies workspace edits; require **user approval** before applying (see below).

**Rename approval (HITL):** When `operation` is `"rename"`:
1. Call LSP `textDocument/prepareRename` then `textDocument/rename` to obtain the list of edits.
2. Return to the agent a result **pending approval**: e.g. `{ "status": "pending_approval", "operation": "rename", "edits": [...], "summary": "Rename 'foo' to 'bar' in N locations" }`.
3. Assistant approval flow (or HITL at seam boundary in Orchestrator) presents "Apply rename?"; on approve, apply via `workspace/applyEdit` (FileSafe). On reject, return `{ "status": "rejected" }` to the agent.

So: read/navigation operations return results directly; **rename** returns `pending_approval` and actual apply is only after user approval.

**Integration with LSP client:** Tool implementation calls the same LSP client as the editor (e.g. `src/lsp/client.rs`). Client must expose the canonical read/navigation calls plus `get_rename_edits(uri, position, new_name)`. Apply **request timeout** (default 10s; config key e.g. `lsp.toolTimeoutMs` in implementation). On timeout or error, return a structured error to the agent.

**Optional LSP sub-operations (post-MVP):** `lsp.format` (textDocument/formatting, rangeFormatting) and `lsp.code_action` (textDocument/codeAction → workspace/applyEdit) can be added so agents can "format file X" or "apply quick fix"; both write buffers and should require **ask** (or user approval). See Plans/LSPSupport.md §9.1.

### 3.5 Per-tool semantics (I/O, errors, limits)

The following contracts define the minimum runtime envelopes for the core built-in tools. Provider-native names may differ, but the registry must normalize them to these contracts before persistence, analytics, or agent-visible result handling.

#### 3.5.1 `bash` contract

**Input parameters**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `command` | string | yes | Shell command text to execute in the project/workspace environment. |
| `mode` | enum (`"sync"` \| `"async"`) | no | Execution mode. Default `sync`. `sync` waits through `initial_wait`; `async` returns immediately with a live shell handle. |
| `initial_wait` | integer seconds | no | Sync-mode wait window before returning partial output and a running shell handle. Default `30`; must stay within the runtime's accepted range. |
| `shellId` | string | no | Existing shell/session binding to reuse for stateful commands; omitted to create a new shell binding. |
| `detach` | boolean | no | Async-only. When `true`, the process is fully detached and survives client shutdown; when `false`, it remains attached to the shell session. |

**Successful output**

- Completed sync result: `{ shellId, status: "completed", stdout, stderr, exit_code }`
- Sync still running after `initial_wait`: `{ shellId, status: "running", stdout, stderr, exit_code: null }`
- Async launch: `{ shellId, status: "running", detach, pid? }`

`stdout` and `stderr` are strings; `exit_code` is an integer on completion and `null` while still running.

**Error cases**

| Code | Meaning |
|------|---------|
| `validation_error` | Invalid parameter combination, such as `detach` without `mode: "async"` or malformed `initial_wait`. |
| `permission_denied` | Tool blocked by tool policy before execution. |
| `filesafe_blocked` | Shell command rejected by FileSafe, command blocklist, or path guard. |
| `shell_not_found` | Referenced `shellId` does not exist or is no longer active. |
| `spawn_failed` | Runtime could not start the shell or child process. |
| `output_limit_exceeded` | Output exceeded cap and was truncated or the command was aborted per runtime policy. |
| `timeout` | Hard execution ceiling expired before process completion. |

**Timeout behavior**

- Default sync wait window: `30s` via `initial_wait`.
- Recommended hard execution ceiling: `30m` per shell command unless a stricter runner limit is configured.
- If `initial_wait` expires first, the command remains live and returns `status: "running"` with partial `stdout` / `stderr`.
- If the hard execution ceiling expires, the runtime terminates the process and returns `{ shellId, status: "timed_out", stdout, stderr, exit_code: null, error: { code: "timeout" } }`.

#### 3.5.2 `edit` contract

**Input parameters**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `path` | string | yes | Target file path. Must resolve inside an allowed workspace root. |
| `old_str` | string | yes | Exact text to locate before replacement. |
| `new_str` | string | yes | Replacement text to write atomically in place of `old_str`. |

**Successful output**

`{ status: "success", path, replacements: [{ start_line, end_line }], line_count_changed, bytes_changed }`

The runtime should report the affected line span(s) so reveal, diff, and audit surfaces can link directly to the mutation.

**Error cases**

| Code | Meaning |
|------|---------|
| `validation_error` | Missing parameter, invalid path, or empty replacement contract. |
| `permission_denied` | `edit` denied by tool policy. |
| `filesafe_blocked` | Path or write scope rejected by FileSafe. |
| `path_not_found` | Target file does not exist. |
| `replace_miss` | `old_str` was not found exactly once as required by the tool contract. |
| `replace_conflict` | Multiple ambiguous matches or file changed during validation. |
| `encoding_error` | File content could not be decoded/rewritten under supported encoding rules. |
| `timeout` | Atomic edit did not complete before the runner ceiling. |

**Timeout behavior**

- Recommended default timeout: `10s` per edit request.
- On timeout, the operation must fail atomically: no partial file rewrite, and the response is `{ status: "timed_out", path, error: { code: "timeout" } }`.

#### 3.5.3 `view` contract (canonical `read`)

Provider-native `view` maps to the canonical registry tool `read`.

**Input parameters**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `path` | string | yes | File or directory path to inspect. |
| `view_range` | array `[start_line, end_line]` | no | Inclusive 1-based line range. `-1` as `end_line` means "to end of file". |

**Successful output**

- File read: `{ path, kind: "file", content, lines: [{ line_number, text }], truncated? }`
- Directory read: `{ path, kind: "directory", entries: string[] }`

For file reads, `content` preserves line numbering in the agent-visible rendering, and `lines[]` is the structured equivalent used by downstream tooling.

**Error cases**

| Code | Meaning |
|------|---------|
| `validation_error` | Invalid path or malformed `view_range`. |
| `permission_denied` | `read` / `view` denied by tool policy. |
| `filesafe_blocked` | Sensitive-path or read guard rejected the request. |
| `path_not_found` | Target path does not exist. |
| `binary_unsupported` | File is binary and cannot be rendered as numbered text. |
| `too_large` | File exceeds the read cap without an allowed ranged request. |
| `timeout` | Read did not complete before the runner ceiling. |

**Timeout behavior**

- Recommended default timeout: `10s` per read request.
- On timeout, return `{ path, status: "timed_out", error: { code: "timeout" } }`; do not fabricate missing lines.

#### 3.5.4 `grep` contract

**Input parameters**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `pattern` | string | yes | Regex or literal search expression. |
| `path` | string | no | Root directory or file to search within. Default = current workspace root. |
| `glob` | string | no | Optional file-pattern filter such as `*.rs` or `src/**/*.ts`. |
| `output_mode` | enum (`"content"` \| `"files_with_matches"` \| `"count"`) | no | Result shape selector. Default `files_with_matches`. |
| `flags` | object | no | Search modifiers such as `case_insensitive`, `multiline`, `line_numbers`, `before_context`, `after_context`, or `head_limit`. |

**Successful output**

`{ pattern, path, output_mode, matches }`

Where `matches` is:
- `content`: array of `{ path, line_number?, line_text, context_before?, context_after? }`
- `files_with_matches`: array of `{ path }`
- `count`: array of `{ path, count }`

**Error cases**

| Code | Meaning |
|------|---------|
| `validation_error` | Invalid regex, incompatible flags, or malformed glob. |
| `permission_denied` | `grep` denied by tool policy. |
| `filesafe_blocked` | Search scope includes blocked or sensitive paths. |
| `path_not_found` | Requested search root does not exist. |
| `backend_unavailable` | Search backend (indexed or raw) could not be initialized. |
| `result_limit_exceeded` | Match set exceeded the capped response window and was truncated. |
| `timeout` | Search did not complete before the query ceiling. |

**Timeout behavior**

- Default timeout: `30s`.
- On timeout, return `{ pattern, path, status: "timed_out", error: { code: "timeout" } }`. Implementations may include `partial: true` only when the runtime can prove returned hits were fully verified.

#### 3.5.5 `glob` contract

**Input parameters**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `pattern` | string | yes | Glob expression such as `**/*.md`. |
| `path` | string | no | Search root. Default = current workspace root. |

**Successful output**

`{ pattern, path, paths: string[] }`

The returned `paths` array contains normalized file paths in deterministic order after ignore-rule filtering.

**Error cases**

| Code | Meaning |
|------|---------|
| `validation_error` | Malformed glob expression or invalid root path. |
| `permission_denied` | `glob` denied by tool policy. |
| `filesafe_blocked` | Requested scope includes blocked paths. |
| `path_not_found` | Root path does not exist. |
| `timeout` | Enumeration exceeded the runtime ceiling. |

**Timeout behavior**

- Recommended default timeout: `10s`.
- On timeout, return `{ pattern, path, status: "timed_out", error: { code: "timeout" } }`.

#### 3.5.6 `create` contract (canonical `write`)

Provider-native `create` maps to the canonical registry tool `write`.

**Input parameters**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `path` | string | yes | Target file path to create or overwrite, subject to write-scope policy. |
| `file_text` | string | yes | Full text payload to persist. |

**Successful output**

`{ status: "success", path, created: boolean, bytes_written, line_count }`

`created = true` when the path did not previously exist; `false` when the tool overwrote an existing file under an allowed policy.

**Error cases**

| Code | Meaning |
|------|---------|
| `validation_error` | Missing parameters, invalid path, or disallowed text encoding. |
| `permission_denied` | `write` / `create` denied by tool policy. |
| `filesafe_blocked` | Write path rejected by FileSafe or out of allowed scope. |
| `parent_missing` | Parent directory does not exist and auto-create is disabled. |
| `already_exists` | Policy forbids overwriting an existing file. |
| `io_error` | Underlying filesystem write failed. |
| `timeout` | File write did not complete before the runner ceiling. |

**Timeout behavior**

- Recommended default timeout: `10s`.
- On timeout, the write must fail atomically and return `{ status: "timed_out", path, error: { code: "timeout" } }`.

### 3.5A `skill` tool runtime contract

The `skill` tool is the canonical on-demand runtime skill access mechanism.

**Input schema**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `skill` | string | yes | Canonical skill name to invoke, e.g. `frontend-design`, `audit`, or another registered skill id. |

**Capability check**

- Before invocation, the runtime must resolve `skill` against the currently available skill registry (project skills, user-installed skills, or built-in skill manifests exposed to the conversation).
- Availability check is structural, not fuzzy: exact canonical skill id match first; aliases may be supported only if the registry explicitly defines them.
- Permission and mode gates still apply after lookup; a present skill may still be denied by policy or by run-mode constraints.

**Sandboxing model**

- Skills run in the main conversation context rather than an isolated child-run context.
- A skill shares the active conversation history, active tool set, and current permission envelope.
- Invoking a skill does **not** mint a separate task/agent runtime unless the skill itself chooses to call `task` as part of its implementation.

**Output contract**

- Successful skill execution returns its output as part of the normal conversation flow.
- Any tool calls made while the skill is active are attributed to the same main conversation/tool stream unless a downstream child agent is explicitly spawned.
- The registry should expose `{ skill, status: "completed", summary? }` metadata internally for audit and replay, even if the user-facing surface only shows the resulting conversation turn.

**Error semantics**

| Code | Meaning |
|------|---------|
| `skill_not_found` | Requested skill name is not present in the available skill registry. |
| `permission_denied` | Skill invocation blocked by tool policy or run mode. |
| `already_running` | The same skill is already active and the runtime rejects re-entry. |
| `skill_failed` | Skill started but failed internally; include causal context and any underlying tool error summary. |

The user-facing error text should be explicit: not found → "skill not found"; already running → rejection without re-entry; internal failure → error plus context sufficient for debugging.

### 3.5B `question` tool runtime contract
The simplified single-string `question` contract is superseded by a two-mode contract.

Canonical modes:
- `single_question`
- `questionnaire`

Recommended input envelope:
- `mode`
- `header?`
- `prompt?`
- `questions: Array<QuestionItem>`

`QuestionItem` minimum fields:
- `question_id`
- `question`
- `description?`
- `options?`
- `required?` (default `true`)
- `multi_select?` (default `false`)
- `allow_freeform?` / `allow_other?` (default `true`)
- `placeholder?`
- `default_values?`

Recommended output envelope:
- `status: "answered" | "submitted" | "dismissed" | "timed_out" | "unavailable"`
- `answers: Array<{ question_id, values: string[], source?: "option" | "other" | "freeform" }>`
- `answer_text?` only as backward-compatible sugar for true single-question callers

Rules:
- multi-question flows are first-class, not an edge case
- users may answer in any order
- required questions block final submit
- headless / HITL-unavailable paths return `unavailable` rather than fabricated answers

ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Contracts_V0.md

### 3.5C `todowrite` and `todoread` runtime contract
The simplified checklist-only todo tool shapes are superseded by the normalized TODO schema used by planning outputs.

Canonical TODO item fields:
- `todo_id`
- `title`
- `summary`
- `status`
- `dependencies[]`
- `owner_hint`
- `verification_hint`
- `notes?`
- `order_index?`

Canonical status set:
- `pending`
- `in_progress`
- `completed`
- `blocked`
- `skipped`

Rules:
- `todowrite` may create, reorder, and update statuses or notes
- `todoread` returns the current normalized list for the active thread/run
- the same schema must survive single-agent, subagent, and crew execution
- subagent default remains deny unless explicitly re-enabled by run config

ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Permissions_System.md

### 3.5D Web operation family runtime contract
The canonical web tool family is expanded beyond `websearch` and `webfetch`.

Canonical operations:
- `websearch`
- `webfetch`
- `webextract`
- `webresearch`
- `webcrawl`
- `webmap`

Rules:
- `Reading Site` remains the PM-native Site Reader path rather than a provider-local synonym
- provider support is disclosed as `native`, `pm_composed`, or `unsupported`
- natural-language requests and `/web` subcommands route to the same dispatcher
- provider fallback and evidence provenance remain visible in activity/audit surfaces

ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Permissions_System.md, ContractName:Plans/storage-plan.md

### 3.5E LSP tool runtime reconciliation
The `lsp` tool surface is widened beyond the minimal MVP read trio.

Recommended read operations:
- `goToDefinition`
- `findReferences`
- `hover`
- `documentSymbol`
- `workspaceSymbol`
- `goToImplementation`
- `prepareCallHierarchy`
- `incomingCalls`
- `outgoingCalls`

Write-like operation retained:
- `rename` with explicit approval before apply

ContractRef: ContractName:Plans/LSPSupport.md, ContractName:Plans/Permissions_System.md, ContractName:Plans/FinalGUISpec.md

Additional rules:
- it complements, but does not replace, context bundling performed by the context compiler
- it does not require provider-native skill installation to function in MVP

ContractRef: ContractName:Plans/Skills_System.md, ContractName:Plans/FileSafe.md, ContractName:Plans/Prompt_Pipeline.md

#### 3.5.A Additional semantics: chatsearch / logs / repo import and codesearch multi-lane (MVP)

This subsection supplements the per-tool table below with required behavior for new MVP tools and multi-lane search backends.

**chatsearch (project chat index)**
- **Input:** `query: string`, optional `filters: { thread_id?, time_range? }`, `k?: number`.
- **Output:** hits with `{ thread_id, message_id, ts, role, snippet, score }`.
- **Scope rule:** MUST be project-scoped (per-project Tantivy index directory).
- **Secrets policy:** Persisted chat index content MUST comply with PolicyRule:no_secrets_in_storage / INV-002 (mandatory strict secrets scrubbing before persistence).
- **Context Lens integration:** When Context Lens mutes messages, chatsearch MUST exclude muted message_ids from results returned to the agent (or annotate them as excluded so the context packer can drop them).

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Permissions_System.md

**codesearch (project workspace code search; MVP multi-lane)**
- **Primary backend:** Tantivy code index (filesystem watcher + chunked documents; see Plans/storage-plan.md).
- **Secondary backend:** LSP `workspace/symbol` and/or `documentSymbol` for symbol-aware search when LSP is active (Plans/LSPSupport.md).
- **Fallback backend:** text grep (`grep` tool, index-accelerated when sparse n-gram index is available) when Tantivy index is unavailable or query requires regex semantics.
- **Output:** Return best-effort results with stable `{ path, line_or_range, snippet, kind? }`.
- **Ignore + sensitive guards:** Respect `.gitignore` by default; exclude `.env` and `.env.*` (allow `.env.example`) consistent with FileSafe + Permissions defaults.
- **Secrets policy:** Any indexed/stored snippet text MUST be secrets-scrubbed before persistence to Tantivy.

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/LSPSupport.md, ContractName:Plans/FileSafe.md

**grep (index-accelerated regex search; MVP)**

The `grep` tool keeps its existing interface and transparently uses a per-project sparse n-gram regex index when that index can narrow the query.

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/GitHub_Integration.md

- **External contract:** Same signature (`pattern`, `path?`, `glob?`), same project scoping, same result limit (1000), same timeout (30s), and same read-only permission posture as today's `grep`. Search-panel regex mode uses the same backend; there is no new user-facing or agent-facing tool name.
- **Correctness model:** The index is only a candidate reducer. Final results always come from ripgrep verification on authoritative file content. Hash collisions, stale base snapshots, and broad dirty-layer candidate inclusion may increase candidate count, but MUST NOT change final correctness.
ContractRef: ContractName:Plans/Permissions_System.md, ContractName:Plans/assistant-chat-design.md, Invariant:INV-002

- **Sparse n-gram model:** This is not a classic fixed-trigram index. Build time extracts **all** sparse n-grams from normalized file content. Query time extracts only a **minimal covering set** from normalized literals. That asymmetric build/query contract is the core selectivity/performance property.
- **Frequency table contract:** Boundary weighting uses a shipped 256x256 `u16` base table derived from The Stack Smol, counted on ASCII-lowercased bytes, blended with per-project frequencies using `effective[a][b] = 0.5 * base[a][b] + 0.5 * project[a][b]`. The blended table is stored per project in `frequency_table.bin` and is shared by both build and query logic. It is recomputed only on full rebuilds.
- **Boundary-failure fallback:** When weighting cannot place sparse boundaries for a segment of length >= 3, extraction falls back to fixed-width 3-gram boundaries so the segment remains discoverable.
- **Byte-level operation rule:** N-gram extraction and frequency counting operate on raw bytes. Implementers MUST NOT decode content to Unicode at any point in the indexing or query pipeline. ASCII-only lowercasing (`u8::to_ascii_lowercase`) is the only transformation; non-ASCII bytes pass through unchanged.
ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Architecture_Invariants.md

- **Query flow:** Parse regex with `regex-syntax` -> extract literals -> strip `\r` -> ASCII-lowercase -> classify conjunction vs alternation -> compute a minimal covering n-gram set -> hash with xxh3 -> binary-search `lookup.bin` -> load Roaring Bitmap postings -> intersect within required-literal groups -> union across alternations -> resolve file IDs via `file_map.bin` -> apply path/glob filters -> add dirty-layer paths -> run ripgrep only on candidate files.
- **Alternation rule:** Alternation uses union-of-intersections, not pure intersection. `foo|bar` means files containing foo OR bar, not files containing both.
- **Query skip rules:** Skip the index and run raw ripgrep when no literals can be extracted, when a case-insensitive query contains non-ASCII literals, or when the covering set exceeds 64 n-grams.
ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/GitHub_Integration.md

- **Freshness model:** PM-mediated writes update the dirty layer synchronously before returning success. Dirty entries are generation-aware path records, not a second canonical search index. All dirty paths are unconditionally included in candidate verification, and deleted dirty paths suppress stale base-index hits.
- **Stale-index rule:** There is no stale-threshold cutoff. When an index snapshot exists, it remains queryable while background refresh or re-anchor work runs. Raw ripgrep fallback is reserved for missing, building-without-valid-snapshot, corrupted, disabled, or query-skip conditions.
- **Verification fault tolerance:** Per-file verification races (`ENOENT`, permission denied, deleted-between-candidate-and-verify, transient I/O errors) are skip-and-continue conditions, not whole-query failures.
ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/GitHub_Integration.md

- **Filtering rules:** The index respects the same `.gitignore` / `.ignore` baseline as `grep`, applies mandatory secret-path exclusions, excludes binary files using ripgrep-style null-byte detection, honors the per-project large-file threshold (default 10 MB), and applies separate index-exclusion patterns for low-value or generated content.
- **User-facing search:** When the Search panel regex toggle is ON, the same sparse n-gram path accelerates find-in-files. Search inherits the same dirty-layer freshness guarantee and the same fallback causes as agent `grep`.
ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/storage-plan.md

- **Performance / acceptance targets:** Indexed query latency target is <20 ms across repository sizes. Full-build targets are <2 minutes for <=500 MB, <10 minutes for <=5 GB, and <30 minutes for <=50 GB on SSD-class storage. Incremental rebuilds may temporarily use roughly 1.5x index size in RAM because extraction is incremental but serialization is full-snapshot rewrite. SSD storage is the supported baseline for repositories above 5 GB. Steady-state memory: peak RSS contribution typically <500 MB (only the lookup table is mmap'd; postings are streamed via offset). Dirty-layer insert: <1 ms per path (synchronous HashMap update). Typical index size: 1-10% of source code size. Build threads run at low priority (`thread-priority` crate, `ThreadPriority::Min`; macOS Apple Silicon additionally uses `QOS_CLASS_UTILITY`) to avoid editor starvation.
ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/GitHub_Integration.md

**logsearch / logread (project logs)**
- **logsearch input:** `query: string`, optional `filters: { time_range?, run_id?, thread_id?, tool_name?, level? }`, `k?: number`.
- **logsearch output:** hits with `{ ts, summary, run_id?, thread_id?, tool_name?, level?, ref: { event_id? | blob_ref? } }`.
- **logread input:** `{ event_id? | blob_ref? }`.
- **logread output:** `{ content, truncated?: boolean, truncation_reason? }` (bounded by size caps).
- **Index rule:** Tantivy logs index stores summaries/snippets only; full payload remains out-of-index and is fetched via logread.
- **Secrets policy:** Log summaries/snippets and any persisted payload returned by logread MUST comply with PolicyRule:no_secrets_in_storage / INV-002 (mandatory strict secrets scrubbing before persistence).
- **Blob resolution:** `blob_ref` resolves to `storage/blobs/projects/{project_id}/logs/...` (see Plans/storage-plan.md).

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Contracts_V0.md

**repo.import (external repo import; separate from workspace search)**
- **Input:** `{ source: string (URL or owner/repo), dest_path?, mode?: "new_project"|"add_workspace_root"|"temporary_mount" }`.

### 3.6 Task tool and the 42 subagents (Plans)

The `task` tool launches a specialized agent and returns either an immediate result (`sync`) or a live background handle (`background`).

**Input schema**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `name` | string | yes | Short agent label used to derive a human-readable runtime handle. |
| `prompt` | string | yes | Full task instructions delivered to the selected agent. |
| `agent_type` | enum | yes | Selected agent family from the allowed registry below. |
| `description` | string | yes | 3-5 word UI/telemetry summary of the launch purpose. |
| `mode` | enum (`"sync"` \| `"background"`) | no | Execution delivery mode. Default `sync`. |
| `model` | string | no | Optional model override when the selected agent runtime supports multiple models. |

**Agent type enum**

Built-in agent families:
- `explore`
- `task`
- `general-purpose`
- `code-review`
- `configure-copilot`

Custom agent families currently recognized by the runtime:
- `accessibility-tester`
- `api-designer`
- `architect-reviewer`
- `backend-developer`
- `code-reviewer`
- `compliance-auditor`
- `context-manager`
- `csharp-developer`
- `database-administrator`
- `debugger`
- `deployment-engineer`
- `devops-engineer`
- `frontend-developer`
- `fullstack-developer`
- `java-architect`
- `javascript-pro`
- `knowledge-synthesizer`
- `laravel-specialist`
- `mobile-developer`
- `nextjs-developer`
- `performance-engineer`
- `php-pro`
- `product-manager`
- `project-manager`
- `prompt-engineer`
- `python-pro`
- `qa-expert`
- `react-specialist`
- `rust-engineer`
- `security-auditor`
- `security-engineer`
- `sql-pro`
- `swift-expert`
- `technical-writer`
- `test-automator`
- `typescript-pro`
- `ui-designer`
- `ux-researcher`
- `vue-expert`
- `websocket-engineer`

The runtime may maintain a broader PM persona/subagent registry, but `task.agent_type` must validate against the active agent registry exposed to the launch path. Where PM package/node routing also applies, the runtime must map the chosen agent type into that registry without silently changing the requested role.

**Dispatch contract**

- `task` snapshots the current working directory, relevant conversation context, permission ceiling, write scope, requested/effective runtime and account restrictions, remaining-budget snapshot, and tool availability, then routes the request to the selected agent runtime.
- The child agent is context-isolated from the parent turn buffer except for the prompt payload and explicit runtime metadata supplied at launch.
- Child execution cannot mutate the parent conversation state directly; it returns results through the `task` result channel or, in background mode, through `read_agent` / `write_agent`.
- Sync mode blocks until completion or failure and returns the terminal result in the same tool response.
- Background mode returns immediately after the child is enqueued or started, then delivers further results through the agent handle.

ContractRef: ContractName:Plans/orchestrator-subagent-integration.md, ContractName:Plans/Run_Modes.md, ContractName:Plans/storage-plan.md

**Successful output**

- Sync: `{ task_id, status: "completed" | "failed", agent_type, name, result, summary? }`
- Background launch: `{ task_id, agent_id, status: "running" | "idle", agent_type, name }`

`result` may contain agent-produced text, structured findings, or abbreviated command output depending on agent type.

**`task_id` and `agent_id` contract**

- `task_id` is the unique identifier for a single `task` invocation. It should be generated as an opaque string with per-invocation uniqueness (for example `task-<timestamp>-<nonce>`), persisted in telemetry, and never reused.
- `agent_id` is the live handle for a background-capable child agent. It should be unique across active agents in the session and treated as opaque even if rendered as a human-readable slug derived from `name`.
- Use `agent_id` with `read_agent(agent_id, ...)` to fetch status/results and `write_agent(agent_id, message)` to deliver follow-up turns. `task_id` is for audit, correlation, and persistence; `agent_id` is for live interaction.

**Error cases**

| Code | Meaning |
|------|---------|
| `validation_error` | Missing required fields or invalid `mode` / `model` combination. |
| `unknown_agent_type` | `agent_type` is not in the allowed enum for the current runtime. |
| `permission_denied` | `task` launch blocked by tool policy or child-run ceiling. |
| `dispatch_failed` | Runtime could not enqueue or start the selected agent. |
| `model_unavailable` | Requested model override is not supported for the chosen agent. |
| `timeout` | Sync execution exceeded the runner ceiling before terminal completion. |

**Timeout behavior**

- Resolved child timeout defaults to the parent run's remaining budget. A caller-supplied or agent-specific ceiling MAY narrow that timeout, but it MUST NOT exceed the inherited remaining-budget snapshot for the child launch.
- If the parent has no finite remaining-budget snapshot, the runtime resolves `task_timeout_ms` from the canonical child-run envelope and persists the resolved value in child metadata.
- On sync timeout, return `{ task_id, status: "timed_out", error: { code: "timeout" } }`.
- Background mode does not time out at launch; the spawned agent keeps its own lifecycle and may later report `timed_out`, `failed`, `cancelled`, or `completed` through `read_agent`.

ContractRef: ContractName:Plans/orchestrator-subagent-integration.md, ContractName:Plans/Run_Modes.md, ContractName:Plans/Contracts_V0.md

### 3.6A Task runtime addendum

The `task` tool launches canonical child runs.

ContractRef: ContractName:Plans/Personas.md, ContractName:Plans/Run_Modes.md, ContractName:Plans/Permissions_System.md, ContractName:Plans/Models_System.md

Required task-tool launch contract:
- validate the requested child against `subagent_registry` when the launch path names a subagent type.
- resolve requested and effective Persona separately from requested and effective runtime surface.
- classify each child as `required` or `optional` for parent progress.
- inherit the parent permission ceiling, write scope, requested/effective runtime and account restrictions, and remaining budget as hard upper bounds; the child MAY narrow them further but MUST NOT widen them.
- preserve requested versus effective runtime surface, effective account/billing context, effort, capability state, write scope, and resolved `task_timeout_ms` in metadata.
- when the caller omits an explicit child timeout, default to the inherited parent remaining budget; when the caller requests a broader timeout, clamp it to the parent's remaining budget and emit a structured diagnostic.

No-silent-fallback rules:
- explicit user or command requests for child runtime surface must fail clearly or ask for a new choice if unavailable.
- implicit orchestrator-selected runtime surfaces may fallback to another compatible surface.
- fallback reason must be recorded in metadata.

ContractRef: ContractName:Plans/CLI_Bridged_Providers.md, ContractName:Plans/Commands_System.md, ContractName:Plans/storage-plan.md

Copilot-native routing rule:
- only a Copilot-rooted parent may launch a Copilot-native subagent path.
- a non-Copilot parent must not route into Copilot-native subagent semantics.
- the correct outcome is strict deny, not silent downgrade.

ContractRef: ContractName:Plans/Provider_OpenCode.md, ContractName:Plans/Models_System.md, ContractName:Plans/Permissions_System.md

Child lifecycle semantics exposed by `task`:
- retry = same logical child with a new attempt.
- reroute = same logical child task under a different effective runtime surface.
- replacement = a new child run because the role or task shape changed materially.
- cancellation is parent-controlled and explicit.
- resume applies only to non-terminal interrupted or waiting children.

The `task` tool must not treat command subtasks, interview children, crew members, or orchestrator children as different runtime classes. They all enter the same canonical child-run model.

ContractRef: ContractName:Plans/orchestrator-subagent-integration.md, ContractName:Plans/interview-subagent-integration.md, ContractName:Plans/Commands_System.md
### 3.6B Delegated debug investigations

Delegated runs launched through `task` may participate in an existing investigation.

Required rules:
- a delegated run launched inside an investigation inherits `investigation_id` plus a narrowed-or-equal permission snapshot
- delegated runs may add evidence, instrumentation updates, and verification results to the shared investigation, but they must do so through the canonical investigation and runtime-artifact contracts
- delegated runs must not create a second mutation-capable investigation against the same project/worktree unless a higher-level owner flow explicitly isolates the work in another worktree or host context
- any delegated run that installs or mutates temporary instrumentation must also carry the cleanup contract for its own `instrumentation_id`

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/MiscPlan.md, ContractName:Plans/orchestrator-subagent-integration.md

### GitHubApiTool

**ToolID:** `GitHubApiTool`

**Purpose:** The sole permitted interface for GitHub HTTPS API calls. All GitHub operations (repository, fork, PR, issue, status) MUST route through this tool.

**Rules:**
- GitHub CLI (`gh`) is forbidden for auth/status/repo/fork/PR operations (see Spec_Lock.json#github_operations).
- Auth flows are owned by Plans/GitHub_API_Auth_and_Flows.md.
- API version: configurable via `github.api_version` (default: `"2022-11-28"`).

**Owner:** Crosswalk.md §3.1 (Tooling domain).

ContractRef: ToolID:GitHubApiTool, SchemaID:Spec_Lock.json#github_operations, Primitive:Tool

---

