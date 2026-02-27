## 3. Built-in tools (target set)

The following built-in tools are the **target set** for the central tool registry. Semantics align with [OpenCode's built-in tools](https://opencode.ai/docs/tools/#built-in). Mapping to each platform's native tools (Read/Edit/Bash, etc.) is a Provider/runner concern; the registry holds canonical names and the policy layer applies regardless of provider.

### 3.1 Tool table

| Tool | Purpose | Permission key | Limits / notes |
|------|----------|----------------|----------------|
| **bash** | Execute shell commands in project environment | `bash` | FileSafe applies (blocklist, path guards). CWD = project/workspace. Consider timeout and output size limits. |
| **edit** | Modify existing files via exact string replacements | `edit` | Primary code-edit path. FileSafe write scope can restrict which files. |
| **write** | Create new files or overwrite existing ones | (same as `edit`) | Same permission as edit; overwrites if file exists. |
| **read** | Read file contents; supports line ranges | `read` | FileSafe security filter can block sensitive paths (.env, keys). Large files: line-range or size cap. |
| **grep** | Search file contents with regex; file pattern filtering | `grep` | ripgrep under the hood; respect .gitignore unless .ignore overrides. |
| **glob** | Find files by glob pattern (e.g. `**/*.ts`) | `glob` | Returns paths sorted by modification time. Same ignore rules as grep. |
| **list** | List files and directories; accepts glob filters | `list` | Same ignore rules. Depth/result limits to avoid huge listings. |
| **patch** | Apply patch files to the codebase | (same as `edit`) | Unified diff; same write scope as edit. |
| **multiedit** | Multiple edits in one operation (batch string replacements) | (same as `edit`) | OpenCode: edit permission covers edit, write, patch, multiedit. |
| **webfetch** | Fetch web content from a URL | `webfetch` | URL allowlist/denylist (FileSafe); timeout; size cap. Document which domains are contacted. |
| **websearch** | Search the web (discovery) | `websearch` | When enabled (env or config); may use Exa or cited-search MCP (newtools §8.2.1). |
| **question** | Ask the user questions during execution | `question` | Header, text, options + freeform. Only meaningful when HITL/UI can show prompt. |
| **skill** | Load a skill (e.g. SKILL.md) into the conversation | `skill` | Path or name → content; validate path is under allowed roots. |
| **todowrite** | Create/update task lists during the session | `todowrite` | Subagent default: disabled (OpenCode). Single todo state per run/session. |
| **todoread** | Read current todo list state | `todoread` | Subagent default: disabled. |
| **lsp** (MVP) | LSP operations: definition, hover, references; rename (with user approval) | `lsp` | No feature flag; available when LSP client is enabled. See §3.4.1 LSP tool (MVP). |
| **task** | Launch subagents (matches subagent type) | `task` | **subagent_type** must be one of the **canonical 41 subagents** documented in Plans (orchestrator-subagent-integration.md §4, interview-subagent-integration.md). Validate with subagent_registry; see §3.6. |
| **codesearch** | Code search (matches the query); when LSP available, symbol-aware via workspace/symbol (§3.4) | `codesearch` | Default allow (§10.2). Enabled when config or platform provides search backend. Fallback order: text-based search → LSP workspace/symbol when available → MCP or platform-native if configured. Result and timeout limits per §3.5. |
| **capabilities.get** | Return all available capabilities (media + provider-tool) with enablement status, disabled reasons, and setup hints | `capabilities.get` | Internal tool; not forwarded to providers. Default allow (§10.2). Full contract: `Plans/Media_Generation_and_Capabilities.md` [§1](Plans/Media_Generation_and_Capabilities.md#CAPABILITY-SYSTEM). |
| **media.generate** | Generate media (image / video / tts / music) via structured request envelope with optional per-request model override | `media.generate` | Internal tool; backed by Gemini API key (or Cursor-native for images). Default ask (§10.2). Full contract: `Plans/Media_Generation_and_Capabilities.md` [§2](Plans/Media_Generation_and_Capabilities.md#MEDIA-GENERATE). |

ContractRef: ToolID:capabilities.get, ToolID:media.generate, ContractName:Plans/Media_Generation_and_Capabilities.md

> **Internal tools vs provider-exposed tools:** `capabilities.get` and `media.generate` are **Puppet Master internal tools** — they execute inside the Puppet Master process and are never forwarded to a provider CLI or server. In `capabilities.get` output, the `provider_tool` category is the umbrella non-media bucket and includes both provider-exposed tools (e.g., OpenCode tools discovered via `GET /provider`) and existing internal tool capabilities (e.g., read/grep/write/task). These non-media tool capabilities are **not** part of the media capability picker dropdown (§4.1 of `Plans/Media_Generation_and_Capabilities.md`), which shows only the four `media.*` capabilities. Permission and policy for all tool categories (internal, built-in, provider-exposed, MCP, custom) use the same model defined in `Plans/Permissions_System.md`.

ContractRef: ToolID:capabilities.get, ContractName:Plans/Media_Generation_and_Capabilities.md#CAPABILITY-PICKER, ContractName:Plans/Permissions_System.md

### 3.2 Edit group and ignore patterns

- **Edit group:** `edit`, `write`, `patch`, and `multiedit` share one **edit** permission so that "allow file changes" is a single knob ([OpenCode](https://opencode.ai/docs/tools/): "The edit permission covers all file modifications (edit, write, patch, multiedit)").
- **Ignore patterns:** grep, glob, list respect `.gitignore` by default. A project **`.ignore`** file can explicitly allow paths (e.g. `!node_modules/`) for search/list. See [OpenCode -- Ignore patterns](https://opencode.ai/docs/tools/#ignore-patterns).

### 3.3 Platform mapping (registry → CLI)

Providers map canonical tool names to platform-native equivalents (e.g. `edit` → Claude "Edit", Cursor edit tool, etc.). The registry and permission engine use **canonical names only**; platform_specs or runner code holds the mapping so that adding a new provider does not require changing permission config.

### 3.4 LSP and built-in tools (MVP)

With **LSP MVP** (Plans/LSPSupport.md), the following tools are **enhanced or newly available** to agents:

| Tool | Effect of LSP MVP |
|------|-------------------|
| **lsp** | **Promoted to MVP** (no longer experimental/feature-flagged). Agents can invoke `lsp.references`, `lsp.definition`, `lsp.hover` (and optionally `lsp.rename` with user approval) so they can reason about code ("find all usages," "what type is this," "rename with confirm"). Requires a running LSP server for the project language. When no server is available, the lsp tool returns no results or a clear "LSP unavailable" response. See Plans/LSPSupport.md §9.1 (Promote lsp tool to MVP). |
| **codesearch** | **Enhanced** when LSP is available: can use LSP `workspace/symbol` (and optionally `documentSymbol`) for **symbol-aware search** (find by symbol name, kind, and location) in addition to text-based search. Fallback: text-based or indexed search when LSP is disabled or no server for the language. |
| **read** / **grep** / **edit** (context) | **Context enrichment:** Assistant/Interview context can include a **summary of current LSP diagnostics** for @'d or open files (errors/warnings with file, line, message, severity). Agents then see linter/type errors when using read/grep/edit and can suggest fixes. Not a new tool; the context passed to the agent is enhanced (Plans/LSPSupport.md §5.1). |

**Implementation note:** The lsp tool should be implemented to call the same LSP client used by the editor and Chat (diagnostics, hover, definition, references, rename). Permission for `lsp` follows the same allow/deny/ask model; default allow (or ask for `lsp.rename`).

#### 3.4.1 LSP tool (MVP) -- parameters, permission, rename approval

**Tool name:** `lsp`. No feature flag (e.g. no `OPENCODE_EXPERIMENTAL_LSP_TOOL`); the tool is available when the LSP client is enabled for the project.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `operation` | string | yes | One of: `"references"`, `"definition"`, `"hover"`, `"rename"`. |
| `path` | string | yes | File path (project-relative or absolute) containing the symbol. |
| `position` | object | yes for definition, hover, references | `{ "line": number (0-based), "character": number (0-based) }`. |
| `newName` | string | yes for rename | New symbol name when `operation` is `"rename"`. |

**LSP methods:** `textDocument/references`, `textDocument/definition`, `textDocument/hover`; for rename: call `textDocument/prepareRename` first when supported -- if it fails or is unsupported, do not call `textDocument/rename` (return structured error to agent); otherwise `textDocument/rename`.

**Permission:** Read-only operations (`references`, `definition`, `hover`) use permission key `lsp`; default **allow**. The **rename** operation applies workspace edits; require **user approval** before applying (see below).

**Rename approval (HITL):** When `operation` is `"rename"`:
1. Call LSP `textDocument/prepareRename` then `textDocument/rename` to obtain the list of edits.
2. Return to the agent a result **pending approval**: e.g. `{ "status": "pending_approval", "operation": "rename", "edits": [...], "summary": "Rename 'foo' to 'bar' in N locations" }`.
3. Assistant approval flow (or HITL at tier boundary in Orchestrator) presents "Apply rename?"; on approve, apply via `workspace/applyEdit` (FileSafe). On reject, return `{ "status": "rejected" }` to the agent.

So: **definition**, **hover**, **references** return results directly; **rename** returns `pending_approval` and actual apply is only after user approval.

**Integration with LSP client:** Tool implementation calls the same LSP client as the editor (e.g. `src/lsp/client.rs`). Client must expose: `get_definition(uri, position)`, `get_hover(uri, position)`, `get_references(uri, position)`, `get_rename_edits(uri, position, new_name)`. Apply **request timeout** (default 10s; config key e.g. `lsp.toolTimeoutMs` in implementation). On timeout or error, return a structured error to the agent.

**Optional LSP sub-operations (post-MVP):** `lsp.format` (textDocument/formatting, rangeFormatting) and `lsp.code_action` (textDocument/codeAction → workspace/applyEdit) can be added so agents can "format file X" or "apply quick fix"; both write buffers and should require **ask** (or user approval). See Plans/LSPSupport.md §9.1.

### 3.5 Per-tool semantics (I/O, errors, limits)

Canonical input/output shapes align with [OpenCode built-in tools](https://opencode.ai/docs/tools/#built-in); platform runners normalize to/from these. Error conditions and limits are enforced by the adapter/runner before or after calling the platform.

| Tool | Canonical input (key params) | Canonical output / result shape | Error conditions | Limits |
|------|-----------------------------|----------------------------------|------------------|--------|
| **bash** | `command: string`, `cwd?: string` | `stdout: string`, `stderr: string`, `exit_code: number` | Permission denied (tool or FileSafe), command blocklist, timeout, non-zero exit | Timeout (e.g. 120s default); output size cap (e.g. 512 KiB); CWD = project/workspace |
| **edit** | `path: string`, `old_string: string`, `new_string: string` | `path: string`, `updated: boolean` | File not found, path not in write scope (FileSafe), permission denied | Single replacement per call; file size cap (e.g. 2 MiB) |
| **write** | `path: string`, `contents: string` | `path: string`, `created: boolean` | Path not in write scope, permission denied | File size cap (e.g. 2 MiB) |
| **read** | `path: string`, `offset?: number`, `limit?: number` (line range) | `contents: string`, `path: string` | File not found, path in sensitive list (.env etc.), permission denied | Line range or size cap (e.g. 10_000 lines or 1 MiB); offset/limit 0-based |
| **grep** | `pattern: string`, `path?: string`, `glob?: string` | `matches: Array<{ path, line_number, line }>` | Invalid regex, permission denied | Result limit (e.g. 1000 matches); timeout (e.g. 30s); respect .gitignore unless .ignore overrides |
| **glob** | `pattern: string` (e.g. `**/*.ts`) | `paths: string[]` | Permission denied | Result limit (e.g. 2000 paths); timeout (e.g. 15s); sorted by mtime |
| **list** | `path: string`, `glob?: string` | `entries: Array<{ name, type: "file"\|"dir" }>` | Path not found, permission denied | Depth limit (e.g. 1 for shallow); result limit (e.g. 500) |
| **patch** | `patch: string` (unified diff) | `applied: string[]` (paths) | Malformed patch, path not in write scope, patch reject | Single patch; paths must be in write scope |
| **multiedit** | `edits: Array<{ path, old_string, new_string }>` | `results: Array<{ path, updated }>` | Same as edit per item; first failure fails batch | Max edits per call (e.g. 50); same file size cap as edit |
| **webfetch** | `url: string` | `content: string`, `status?: number` | URL not in allowlist / in denylist (FileSafe), timeout, HTTP error | Timeout (e.g. 30s); response size cap (e.g. 1 MiB); document domains in audit |
| **websearch** | `query: string` | `results: Array<{ title, url, snippet }>` | Provider disabled or unavailable, rate limit, permission denied | Result limit (e.g. 10); optional query rate limit |
| **question** | `header?: string`, `text: string`, `options?: string[]` | `answer: string` | HITL unavailable (headless) → return "HITL unavailable" or default | N/A (blocking until user responds or timeout) |
| **skill** | `path_or_name: string` | `content: string`, `name: string` | Path outside allowed roots, file not found, permission denied | Size cap (e.g. 64 KiB); path under allowed roots only |
| **todowrite** | `todos: Array<{ id?, content, status? }>` | `ack: boolean` | Subagent default deny; permission denied | Single todo list per run/session |
| **todoread** | -- | `todos: Array<{ id, content, status }>` | Subagent default deny; permission denied | N/A |
| **lsp** | `operation: "references"\|"definition"\|"hover"\|"rename"`, `path: string`, `position: { line, character }`, `newName?` (rename only) | references/definition: `locations: Array<{ path, range }>`; hover: `contents: string`; rename: `pending_approval` + edits or `rejected` | LSP unavailable, no server for language, timeout, invalid path/position, server crash mid-call | Timeout per request (e.g. 10s); return "LSP unavailable" or "LSP server error" on disconnect/crash |
| **task** | `subagent_type: string`, `prompt: string`, ... | `result: object` (subagent output) | Tool denied, subagent type unknown (not in canonical 41), launch failure | Per run config (max concurrent subagents etc.); validate subagent_type with subagent_registry (§3.6) |
| **codesearch** | `query: string`, `path?: string` | `results: Array<{ path, line, snippet }>` or symbol results when LSP available | Permission denied, search backend unavailable | Result limit (e.g. 100); timeout (e.g. 15s) |

**LSP sub-operations:** For `lsp`, `operation` determines the LSP method and return shape: `references` → `textDocument/references`; `definition` → `textDocument/definition`; `hover` → `textDocument/hover`; `rename` → `textDocument/prepareRename` + `textDocument/rename`, result pending user approval (§3.4.1). When the LSP server crashes or disconnects mid-call, return a structured error (e.g. `{ "error": "lsp_unavailable", "message": "LSP server closed or timed out" }`) so the agent can retry or fall back.

### 3.6 Task tool and the 41 subagents (Plans)

The **task** tool launches a subagent by type. The **subagent_type** parameter must be one of the **canonical 41 subagents** documented in the Plans folder:

- **Plans/orchestrator-subagent-integration.md §4** -- Known subagent names (DRY:DATA:subagent_registry): Phase (3), Task language (9), Task domain (8), Task framework (4), Subtask (8), Iteration (2), Cross-phase/Interview (7, including `explore`) = **41 total**. Used for orchestrator tier selection, GUI validation, and task-tool validation.
- **Plans/interview-subagent-integration.md** -- Phase assignments (e.g. Scope & Goals → product-manager, Architecture → architect-reviewer, Product/UX → ux-researcher); cross-phase roles (technical-writer, knowledge-synthesizer, context-manager, etc.).

**Implementation:** The central registry (e.g. `subagent_registry::is_valid_subagent_name(subagent_type)`) must be the single source of truth. When the **task** tool is invoked, validate `subagent_type` against the registry; if invalid, return a structured error (e.g. "Subagent type 'X' not in canonical list; see Plans/orchestrator-subagent-integration.md §4"). Persona content (SKILL.md) lives in `.github/agents/` and `.claude/agents/` (41 files); the runner loads the matching persona for the requested type.

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

