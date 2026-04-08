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
| **websearch** | Search the web (discovery) | `websearch` | When enabled (env or config); may use Exa or an optional cited-search MCP bridge when that integration path is configured. |
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
**Tool name:** `lsp`. The tool is available when the project has an active LSP session; there is no separate experimental flag.

**Parameters**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `operation` | string | yes | One of the canonical LSP operations: `goToDefinition`, `findReferences`, `hover`, `documentSymbol`, `workspaceSymbol`, `goToImplementation`, `prepareCallHierarchy`, `incomingCalls`, `outgoingCalls`, or approval-gated `rename`. |
| `query` | string | yes for `workspaceSymbol` | `workspaceSymbol` requires `query`. |
| `path` | string | yes | File path bound to the active project/root identity. Position-based operations use `path` + `position`. |
| `position` | object | yes for position-based operations | `{ "line": number, "character": number }` using 0-based coordinates. Position-based operations use `path` + `position`. |
| `newName` | string | yes for `rename` | `rename` requires `path` + `position` + `newName`. |

**Permission and approval**

- Read/navigation operations use permission key `lsp` and return a normalized read result directly.
- `rename` remains approval-gated because it applies edits.
- `rename` requires `path` + `position` + `newName`.

**Normalized result contract**

- Normalized result `status` is `ok | partial | unavailable | error`.
- Navigation operations normalize to `locations[]`.
- Symbol operations normalize to `symbols[]`.
- `hover` returns `hover_markdown` plus optional `range`.
- Call-hierarchy operations normalize to `call_hierarchy_items[]` / `call_edges[]`.
- `rename` returns a previewable `workspace_edit`, `change_count`, and `file_count` before any apply step.
- Missing server/session returns `status: 'unavailable'`; timeouts and rejected rename applies return structured `error.code` values rather than provider-native wire errors.

**Method mapping**

- `goToDefinition` → `textDocument/definition`
- `findReferences` → `textDocument/references`
- `hover` → `textDocument/hover`
- `documentSymbol` → `textDocument/documentSymbol`
- `workspaceSymbol` → `workspace/symbol`
- `goToImplementation` → `textDocument/implementation`
- `prepareCallHierarchy` → `textDocument/prepareCallHierarchy`
- `incomingCalls` → `callHierarchy/incomingCalls`
- `outgoingCalls` → `callHierarchy/outgoingCalls`
- `rename` → `textDocument/prepareRename` then `textDocument/rename`, with user approval before apply

ContractRef: ContractName:Plans/LSPSupport.md, ContractName:Plans/Permissions_System.md, ContractName:Plans/FinalGUISpec.md

Rules:
- permission for lsp follows allow/deny/ask with separate approval for lsp.rename
- `workspaceSymbol` requires `query`
- Keep this tool contract consuming Plans/LSPSupport.md#9. MVP LSP features (summary) as the owner of operation inventory and result semantics
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

The `skill` tool is the runtime consumer of `Plans/Skills_System.md`. Public invocation stays structured and does not expose archive-format or source-local implementation details.

ContractRef: ContractName:Plans/Skills_System.md, ContractName:Plans/FinalGUISpec.md

#### Input

| Field | Type | Required | Notes |
|---|---|---|---|
| `skill_id` | `string` | yes | Canonical skill identifier. |
| `arguments?` | `object` | no | Structured user or agent arguments passed to the skill. |
| `context?` | `object` | no | Additional runtime context such as refs, selection, or thread-local data. |

#### Output

| Field | Type | Notes |
|---|---|---|
| `skill_id` | `string` | Echoed canonical id. |
| `title` | `string` | User-facing result title. |
| `content` | `string` | Primary markdown or text payload. |
| `source_type` | `bundled | pm_enhanced | catalog_installed | manual_import | project_local | global_local | shadowed` | Discovery/source vocabulary. |
| `resource_base_dir?` | `string` | FileSafe-scoped base path for disclosed resources. |
| `resource_entries_sample?` | `array` | FileSafe-safe sample entries only. |
| `metadata?` | `object` | Additional structured result metadata. |

Runtime rules:
- discovery lists `ready` and `ready_with_warnings` skills; auto-invoke is limited to `ready`
- resource disclosure stays FileSafe-constrained and never exposes unrestricted directory traversal
- import and install shape are owned by `Plans/Skills_System.md`; this section consumes that owner contract instead of redefining it locally

ContractRef: ContractName:Plans/Skills_System.md, ContractName:Plans/storage-plan.md
#### Convergence rules

- GUI panel, `/skill`, and Natural language all converge on the same `invoke_skill` runtime contract.
- `/skill <skill_name> [args]` resolves directly to `invoke_skill`.
- `/skill with no args lists available skills` or opens the same discovery/help surface used by the Skills panel.
- No subcommand family for MVP.
- `ready_with_warnings` remains discoverable but is not auto-invoked.

ContractRef: ContractName:Plans/Skills_System.md, ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/assistant-chat-design.md
### 3.5B `question` tool runtime contract
The `question` tool is the shared runtime contract for clarification requests, questionnaires, and pause/resume answer collection. Assistant Chat, Interview, wizard clarification, and approval-adjacent follow-up flows consume this contract rather than inventing surface-local payloads.

ContractRef: ContractName:Plans/Contracts_V0.md#3.4 Tool-specific payload extensions, ContractName:Plans/assistant-chat-design.md, ContractName:Plans/storage-plan.md, ContractName:Plans/interview-subagent-integration.md

#### Request shape

| Field | Type | Required | Notes |
|---|---|---|---|
| `mode` | `"single_question" | "questionnaire"` | yes | `mode: "single_question" | "questionnaire"` is the canonical presentation hint. |
| `header` | `string` | no | Short UI title for the card or modal. |
| `prompt` | `string` | yes | Shared explanatory copy for the whole request. |
| `questions` | `Array<QuestionItem>` | yes | `questions: Array<QuestionItem>` is the canonical question set. |
| `context_ref?` | `string` | no | Optional evidence or artifact reference shown alongside the questionnaire. |
| `visual_ref?` | `string` | no | Optional PM-managed visual payload shown on the card. Question cards may include a visual. |

#### `QuestionItem`

`QuestionItem{question_id, question, options[], required, multi_select, allow_freeform, default_values?}`

| Field | Type | Required | Notes |
|---|---|---|---|
| `question_id` | `string` | yes | Stable identifier used across chat, storage, and resumption. |
| `question` | `string` | yes | User-facing question text. |
| `options[]` | `Array<{id, label, description?}>` | no | Canonical option shape. |
| `required` | `boolean` | no | Defaults to `false`. |
| `multi_select` | `boolean` | no | Defaults to `false`. |
| `allow_freeform` | `boolean` | no | Allows typed input in addition to or instead of options. |
| `allow_other?` | `boolean` | no | Deprecated compatibility alias; `allow_other is a deprecated alias` and is normalized to `allow_freeform` before persistence or rendering. |
| `default_values?` | `string[]` | no | Caller-supplied initial seed values. |
| `response_kind?` | `selection | freeform | mixed` | no | Optional modality hint preserved for UI and downstream consumers. |
| `validation_state?` | `valid | invalid | pending` | no | Optional validation state when the caller needs it preserved. |

`default_values?: string[]` = pre-selected option ids when the question is first shown. `draft_value?: string` = saved freeform draft text restored by PM. These are distinct fields, not aliases.

#### Result and draft shape

| Field | Type | Notes |
|---|---|---|
| `status` | `"answered" | "submitted" | "dismissed" | "timed_out" | "unavailable"` | `status: "answered" | "submitted" | "dismissed" | "timed_out" | "unavailable"` is the canonical request-level outcome set. |
| `answers` | `Array<{question_id, values: string[]}>` | `answers: Array<{question_id, values: string[]}>` is the normalized answer envelope. |
| `answer_text?` | `string` | `answer_text?` carries freeform content when present. |
| `source?` | `"option" | "other" | "freeform"` | `source?: "option" | "other" | "freeform"` records how the answer was entered. |
| `response_kind?` | `selection | freeform | mixed` | Actual answer modality after normalization. |
| `validation_state?` | `valid | invalid | pending` | Validation state for draft or submitted answers when preserved. |
| `draft_value?` | `string` | PM-managed in-progress draft restored on resume. |
| `unanswered_question_ids[]?` | `string[]` | Present when a questionnaire remains incomplete. |
| `reason_code?` | `string` | Used for `timed_out` or `unavailable` outcomes. |

Runtime rules:
- Headless/HITL-unavailable = `status = "unavailable"`.
- Subagent question tool access is DENIED by default; child agents surface clarification through the parent.
- Users can answer out of order and revise before submit.
- Dismissing pauses conversation until resume; dismissing does not fabricate a submitted result.
- Visuals on question cards bind to PM-managed state and NOT via `sendPrompt`.

ContractRef: ContractName:Plans/Contracts_V0.md#3.4 Tool-specific payload extensions, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/assistant-chat-design.md

Rules:
- Something else
- users can answer out of order and revise before submit
- dismissing pauses conversation until resume
- visuals on question cards bind to PM-managed state and NOT via sendPrompt
- question default allow only when HITL is available
- subagent question tool access is denied by default
- Keep this tool contract consuming Plans/Contracts_V0.md#3.4 Tool-specific payload extensions as the schema owner
### 3.5C `todowrite` and `todoread` runtime contract
`todoread` and `todowrite` expose one normalized planning/TODO schema shared by Assistant Chat, planning widgets, storage, and delegated execution.

ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Run_Modes.md

#### Canonical TODO item

| Field | Type | Required | Notes |
|---|---|---|---|
| `todo_id` | `string` | yes | Stable identifier. |
| `title` | `string` | yes | Short actionable label. |
| `summary` | `string` | no | Optional user-facing detail. |
| `notes?` | `string` | no | Optional operator note or progress detail persisted with the item. |
| `status` | `pending | in_progress | completed | blocked | skipped` | yes | Canonical status set. |
| `dependencies[]` | `string[]` | no | Upstream `todo_id` values. |
| `owner_hint` | `string` | no | Optional surface or worker hint. |
| `verification_hint` | `string` | no | Optional verification reminder. |

#### Operation rules

- `todoread` returns current normalized list for active thread/run.
- `todowrite` can create, reorder, update statuses/notes.
- `todoread` returns the ordered normalized list plus dependency metadata and current plan lifecycle context.
- editing Deep Plan markdown (the rich artifact) MUST update the normalized TODO projection BEFORE execution begins.
- Remove `todowrite` from blanket `ask/plan` mode auto-deny; PM-managed planning-state mutation follows planning approval rules rather than generic read-only web posture.
- every durable mutation emits `chat.plan_todo_updated` as defined by `Plans/Contracts_V0.md#1.1 Assistant worktree seglog events`.

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Contracts_V0.md#1.1 Assistant worktree seglog events

#### Plan lifecycle and structural-edit rule

- Plan-level lifecycle remains `draft`, `approved`, `executing`, `completed`, `blocked`, and `superseded`.
- Structural edits = adding / removing / reordering TODO items.
- Structural edits are gated once the plan reaches `approved` and execution begins; status and note updates remain allowed against the normalized TODO projection.

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/assistant-chat-design.md

Rules:
- todowrite can create, reorder, update statuses/notes
- todoread returns current normalized list for active thread/run
- todoread returns ordered normalized list plus dependency metadata and plan lifecycle context
- structural edits gate once plan reaches approved and execution begins
- todoread/todowrite remain allowed in read_only and plan presets; blanket ask/plan auto-deny is retired for todowrite
- Keep event refs pointed at Plans/Contracts_V0.md#1.1 Assistant worktree seglog events
### 3.5D Web operation family runtime contract
The canonical web tool family comprises six first-class built-in tools: `websearch`, `webfetch`, `webextract`, `webresearch`, `webcrawl`, and `webmap`. All six share provider routing, provenance disclosure, blocked-payload projection, and audit storage.

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Contracts_V0.md

Common request families such as `adapter_hint`, `include_domains[]`, `exclude_domains[]`, and `cache_policy` apply only where the individual tool contract below says they do. `provenance_badge` and `execution_path` are shared output fields across the web family whenever evidence is returned.

#### Shared output and audit fields

| Field | Notes |
|---|---|
| `tool_use_id` | Stable correlation id for one web invocation. |
| `adapter_id` | Effective adapter/provider identity for the executed path. |
| `adapter_selection_reason` | Why the effective provider/path was selected. |
| `requested_adapter_id?` | Requested provider or adapter before routing resolution. |
| `effective_adapter_id?` | Effective provider or adapter after routing resolution. |
| `provider_fallback_summary?` | User-visible explanation when fallback occurred. |
| `web_operation` | Canonical operation name. |
| `web_input` | Structured normalized request snapshot. |
| `duration_ms` | Elapsed execution duration. |
| `timestamp` | Stable event timestamp. |
| `cached` | Boolean cache hit indicator for the served result. |
| `cache_state` | `cache_state: "hit" | "miss" | "bypassed" | "expired_used_for_diff"` where caching applies. |
| `warnings_count` | Count of surfaced warnings. |
| `warnings?` | User-visible warnings array when present. |
| `error_code?` | Canonical PM error code when the operation failed or degraded. |
| `error_message?` | Canonical user-visible error text when present. |
| `projection_freshness` | Requested/effective freshness state (`current | refreshing | stale`). |
| `projection_health` | Requested/effective health state (`healthy | degraded | unavailable`). |
| `sources_ref?` / `content_ref?` / `map_ref?` / `answer_summary_ref?` | Durable evidence references projected by storage. |
| `provenance_badge?` | Citation/source-quality badge consumed by chat and storage. |
| `execution_path?` | Effective runtime path such as `pm_site_reader`, `provider_firecrawl_scrape`, or `pm_research_composed`. |

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Contracts_V0.md

#### `WebAction`

```ts
{
  type: "click" | "scroll" | "type" | "press_key" | "wait_for" | "navigate" | "screenshot" | "set_viewport" | "fill_form" | "select_option" | "back" | "reload" | "snapshot" | "console" | "network";
  selector?: string;
  value?: string;
  timeout_ms?: number;
  description?: string;
}
```

Runtime rules:
- Actions are executed sequentially in array order.
- `timeout_ms` defaults to 5000ms; max 30000ms; total across all actions capped at 30s.
- Unknown `type` values → `invalid_input` error.
- One request may carry at most 10 actions.
- `type: "click" | "scroll" | "type" | "press_key" | "wait_for" | "navigate" | "screenshot" | "set_viewport" | "fill_form" | "select_option" | "back" | "reload" | "snapshot" | "console" | "network";`
- `selector?: string`
- `value?: string`
- `timeout_ms?: number`
- `description?: string`
- When request includes `actions`, skip cache entirely (always fresh-execute); Cache STORE still applies to the final result after actions execute.

ContractRef: ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md, ContractName:Plans/storage-plan.md

#### `websearch`

**Input**
- `query: string` (required)
- `max_results?: number` (default `8`)
- `adapter_hint?: string`
- `include_domains?: string[]`
- `exclude_domains?: string[]`
- `time_range?: string`
- `sources?: string[]` (default `['web']`; options `web`, `news`, `images`, `code`, `academic`)
- `categories?: string[]` (optional; options `github`, `research`, `pdf`)
- `cache_policy?: { max_age_seconds?: number, store?: boolean }` (default `{ max_age_seconds: 3600, store: true }`)

**Behavior**
- `sources` controls which result families are requested; provider support remains per-source and per-category
- `categories` is an additional filter applied during search when supported or post-search when not
- when multiple sources are requested, each result is tagged with `source_type`
- the global search-then-read heuristic still applies: PM reads the top candidate pages before final synthesis whenever later steps need grounded citations

ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Tools.md#12-web-tool-routing-algorithm

**Output**
- `results: Array<{ title, url, snippet?, score?, source_type?: string }>`
- `provenance_badge?`
- `execution_path?`
- `cache_state?: 'hit' | 'miss' | 'bypassed'`

**Error additions**
- `unsupported_source`

#### `webfetch`
**Input**
- `url: string` (required)
- URL validation rejects non-HTTP(S) schemes, normalizes bare domains to `https://`, and rejects malformed URLs as `invalid_input`
- `formats?: string[]` (default `['markdown']`; allowed values `markdown`, `html`, `rawHtml`, `screenshot`, `pdf`, `summary`, `links`, `images`)
- `actions?: WebAction[]`
- `cache_policy?: { max_age_seconds?: number, store?: boolean }` (default `{ max_age_seconds: 14400, store: true }`)
- `changeTracking?: boolean` (default `false`)
- `pdf_mode?: 'fast' | 'auto' | 'ocr'` (default `'auto'`)
- `max_content_length?: number` (default `5 MB`)

**Behavior**
- Site Reader is the default and primary `webfetch` path; provider fetch paths are fallback or explicitly selected alternatives
- actions run before content capture so the final extraction sees the interacted page state
- `screenshot` and `pdf` formats require browser runtime and elevated approval consistent with the browser-action model
- `changeTracking` compares the normalized URL against the most recent cached version and returns the structured `changeTracking { status: changed | unchanged | no_previous_version, previous_content_ref?, diff_summary_ref?, checked_at_utc }` payload when comparison data is available
- binary image responses are returned as attachments instead of being forced through HTML-to-Markdown conversion

ContractRef: ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md, ContractName:Plans/storage-plan.md

**Output**
- `content: string`
- `status?: number`
- `formats_returned: string[]`
- `summary?: string`
- `links?: Array<{ url: string, text?: string, rel?: string }>`
- `images?: Array<{ url: string, alt?: string, dimensions?: { width: number, height: number } }>`
- `pdf_artifact?: { ref: string, page_count: number }`
- `action_results?: Array<{ action: string, status: 'success' | 'error', error?: string }>`
- `provenance_badge?`
- `execution_path?`
- `cache_state?: 'hit' | 'miss' | 'bypassed'`
- `changeTracking?: { status: 'changed' | 'unchanged' | 'no_previous_version', previous_content_ref?: string, diff_summary_ref?: string, checked_at_utc: string }`

**Error additions**
- `content_too_large`
- `content_blocked`
- `content_not_found`
- `no_previous_version` is a warning-style informational code when change tracking has no prior fetch

Additional canonical rules:
- changeTracking compares the normalized URL against the most recent cached version
- actions execute before capture so the final extraction sees interacted page state
- browser-interaction formats and action execution remain approval-gated under the browser/web permission model
- Keep this section consuming Plans/Contracts_V0.md#3.4 Tool-specific payload extensions for WebAction and shared output fields
#### `webextract`

**Input**
- `url: string` (required; one URL per invocation)
- `adapter_hint?: string`
- `detail_hint?: 'fast' | 'balanced' | 'deep'`
- `schema?: object`
- `schema_mode?: 'strict' | 'lenient'` (default `'lenient'`)
- `actions?: WebAction[]`
- `prompt?: string`
- `cache_policy?: { max_age_seconds?: number, store?: boolean }` (default `{ max_age_seconds: 14400, store: true }`)

**Behavior**
- `schema` is validated as JSON Schema draft-07 before execution
- strict mode returns `extraction_schema_mismatch` when required fields are missing or the output cannot conform
- lenient mode preserves best-effort extraction, returns `schema_conformance`, and lists `schema_violations[]` instead of failing outright
- `prompt` complements `schema`: the prompt explains what to extract while `schema` defines the shape
- provider-native schema support is used when available; otherwise PM post-validates the extraction result

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/CLI_Bridged_Providers.md

**Output**
- `content_ref?`
- `content_preview?`
- `content_format?: 'text' | 'markdown' | 'structured'`
- `extracted_data?: object`
- `schema_conformance?: 'full' | 'partial' | 'none'`
- `schema_violations?: Array<{ path: string, message: string }>`
- `action_results?: Array<{ action: string, status: 'success' | 'error', error?: string }>`
- `provenance_badge?`
- `execution_path?`
- `cache_state?: 'hit' | 'miss' | 'bypassed'`

**Error additions**
- `extraction_schema_mismatch`
- `schema_too_large`
- `schema_invalid`
- `extraction_empty`
- `content_not_found`

#### `webresearch`

**Input**
- `task: string` (required)
- `max_sources?: number` (default `6`)
- `adapter_hint?: string`
- `depth_hint?: 'fast' | 'balanced' | 'deep'`
- `autonomous?: boolean` (default `false`)
- `auto_read_cap?: number` (default `4`)
- `schema?: object`
- `schema_mode?: 'strict' | 'lenient'`
- `starting_urls?: string[]` (max `5`)

**Behavior**
- default behavior is PM-composed: search, read top pages, then synthesize with citations from the read path
- autonomous mode may delegate to a provider-native agent when supported or use an enhanced PM-composed search/read/refine loop
- autonomous execution is bounded to three search iterations, a finite page-read budget, and a 120s wall-clock ceiling
- `starting_urls` seeds the first read phase before new search queries are issued
- research results are not cached; `webresearch` remains task-specific and the TTL table treats it as `Not cached`

ContractRef: ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md, ContractName:Plans/storage-plan.md

**Output**
- `answer_summary?`
- `evidence_refs?: string[]`
- `sources_used_count?: number`
- `research_steps?: Array<{ step: 'search' | 'read' | 'refine', detail: string, timestamp: string }>`
- `extracted_data?: object`
- `iterations_used?: number`
- `provenance_badge?`
- `execution_path?`

**Error additions**
- `autonomous_budget_exceeded` is a soft error: the tool still returns partial `answer_summary`, `sources_used_count`, and `research_steps` when the budget is exhausted
- `autonomous_unavailable`

#### `webcrawl`
**Input**
- `root_url: string` (required)
- `max_pages?: number` (default `25`)
- `max_depth?: number` (default `2`)
- `same_origin_only?: boolean` (default `true`)
- `adapter_hint?: string`
- `changeTracking?: boolean` (default `false`)
- `dedup?: boolean` (default `true`)
- `include_paths?: string[]`
- `exclude_paths?: string[]`
- `respect_robots?: boolean` (default `true`)
- `formats?: string[]` (default `['markdown']`)
- `cache_policy?: { max_age_seconds?: number, store?: boolean }` (default `{ max_age_seconds: 86400, store: true }`)

**Behavior**
- per-page change tracking compares the crawl against the previous crawl of the same root
- `dedup` skips already-seen content-equivalent pages within the same crawl run
- `include_paths[]` is applied before `exclude_paths[]`
- host-scoped approval and same-operation routing still apply even when the crawl fans out to many pages

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Permissions_System.md

**Output**
- `pages_visited_count?`
- `pages_returned_count?`
- `scope_summary?`
- `pages: Array<{ url: string, title?: string, content_ref?: string, changeTracking?: { status: 'changed' | 'unchanged' | 'no_previous_version', previous_content_ref?: string, diff_summary_ref?: string, checked_at_utc: string } }>`
- `dedup_skipped?: number`
- `provenance_badge?`
- `execution_path?`
- `cache_state?: 'hit' | 'miss' | 'bypassed'`

**Error additions**
- `crawl_depth_exceeded`
- `crawl_timeout`
- `crawl_robots_blocked`
- `crawl_rate_limited`

Additional canonical rules:
- `webcrawl`
- changeTracking remains explicit canon and MUST NOT disappear silently
- changeTracking { status: changed | unchanged | no_previous_version, previous_content_ref?, diff_summary_ref?, checked_at_utc }
ContractRef: ContractName:Plans/Permissions_System.md, ContractName:Plans/storage-plan.md
#### `webmap`

**Input**
- `root_url: string` (required)
- `max_pages?: number` (default `50`)
- `max_depth?: number` (default `3`)
- `same_origin_only?: boolean` (default `true`)
- `adapter_hint?: string`
- `include_paths?: string[]`
- `exclude_paths?: string[]`
- `search?: string`
- `use_sitemap?: 'include' | 'only' | 'skip'` (default `'include'`)
- `cache_policy?: { max_age_seconds?: number, store?: boolean }` (default `{ max_age_seconds: 86400, store: true }`)

**Behavior**
- `use_sitemap` controls whether sitemap discovery is included, required, or skipped
- `search` filters discovered URLs by path or title after discovery
- map discovery remains bounded and same-origin by default

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/assistant-chat-design.md

**Output**
- `nodes_count?`
- `edges_count?`
- `scope_summary?`
- `map_ref?`
- `links: Array<{ url: string, title?: string, description?: string }>`
- `sitemap_used?: boolean`
- `provenance_badge?`
- `execution_path?`
- `cache_state?: 'hit' | 'miss' | 'bypassed'`

**Error additions**
- `map_timeout`
- `map_no_sitemap`
- `map_robots_blocked`
- `sitemap_parse_error`

#### Error ownership

The canonical web error taxonomy lives in `Plans/Contracts_V0.md`. This section consumes that taxonomy and keeps the exact web-facing codes visible to implementers: `adapter_unavailable`, `unsupported_operation`, `content_blocked`, `content_not_found`, `unsupported_source`, `extraction_schema_mismatch`, `autonomous_budget_exceeded`, and `no_previous_version`.

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/storage-plan.md
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

The public `task` contract describes delegated work, not a user-curated agent catalog. Hidden, unavailable, or policy-blocked subagents stay out of public discovery and out of runtime success-shaped fallbacks.

ContractRef: ContractName:Plans/orchestrator-subagent-integration.md, ContractName:Plans/Permissions_System.md

#### Request shape

| Field | Type | Required | Notes |
|---|---|---|---|
| `goal` | `string` | yes | The delegated work to perform. |
| `context?` | `object` | no | Structured supporting context, refs, or constraints. |
| `owner_hint?` | `string` | no | Exact-match hint against `crew.roles`; on no match the current session remains the owner. |
| `resume?` | `{ delegated_session_id: string }` | no | Resume token for an existing delegated run. |
| `timeout_s?` | `number` | no | Caller-selected ceiling when policy allows. |

#### Runtime result shape

| Field | Type | Notes |
|---|---|---|
| `delegated_session_id` | `string` | Stable identity reused on resume. |
| `status` | `pending | running | completed | failed | cancelled | timed_out` | Child lifecycle. |
| `summary?` | `string` | Short user-facing result. |
| `artifacts[]?` | `array` | Optional refs emitted by the delegated run. |
| `failure_detail?` | `object` | Structured failure disclosure when not completed. |

Runtime rules:
- resume reuses the same `delegated_session_id`; it does not mint a fresh child identity
- nested `task` remains default-denied unless an explicit future policy opens it
- `owner_hint` maps to an exact available role or falls back to the current session; unavailable providers surface an error instead of silent rerouting
- the public contract does not expose `agent_type`, `name`, or optional `agent_id` as canonical user-facing inputs

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/assistant-chat-design.md

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

