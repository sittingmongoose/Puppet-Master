# Adding Tool Support -- Research & Plan

> **Compliance:** This document follows `Plans/DRY_Rules.md` and references SSOT contracts in `Plans/Contracts_V0.md`. Naming: “Puppet Master” only. No open questions; deterministic defaults per `Plans/Decision_Policy.md`.


**Scope:** This document lives in `Plans/` only. It is the **canonical plan for tool support**: built-in tools, custom tools, **MCP** (integration with the registry and permission model), and the permission model (allow/deny/ask), aligned with [OpenCode's Tools model](https://opencode.ai/docs/tools/). Per-platform MCP config paths, GUI MCP settings (Context7, cited web search), and framework-specific testing tools are detailed in **Plans/newtools.md** and AGENTS.md; this doc defines the tool set, permissions, and how MCP fits in.

## SSOT references (DRY)
- Locked decisions: `Plans/Spec_Lock.json`
- Canonical contracts (events/tools/UI commands): `Plans/Contracts_V0.md`
- DRY + ContractRef rule: `Plans/DRY_Rules.md`
- Canonical terms: `Plans/Glossary.md`
- Deterministic ambiguity handling: `Plans/Decision_Policy.md` + `Plans/auto_decisions.jsonl`
- Evidence + verifier gates: `Plans/evidence.schema.json`, `Plans/Progression_Gates.md`

---

## 1. Purpose and scope

**Goal:** Define and configure the **tools** an LLM can use during runs (Assistant, Interview, Orchestrator). Tools let the agent perform actions in the codebase and environment. This doc is canonical for:

- **Built-in tools** -- A standard set of tools (bash, edit, read, grep, webfetch, websearch, etc.) with clear semantics, limits, and a unified permission model.
- **Custom tools** -- User- or project-defined tools (config-defined functions the LLM can call), including schema and how they plug into the registry.
- **MCP** -- MCP tools are **in scope**: they are first-class tools in the central registry; same permission model (including wildcards); naming and precedence with built-in/custom. MCP server config, GUI (Context7, cited web search), and per-platform config paths are specified in **newtools.md**; here we define how MCP-discovered tools integrate with the registry and policy.
- **Permission model** -- Per-tool (or wildcard) control: **allow**, **deny**, or **ask** (require approval before running); defaults, precedence, granular rules (pattern-based), and interaction with FileSafe.

**Secondary references:** Framework-specific testing tools (Playwright, headless runners) and their catalog are in **newtools.md** (GUI tool catalog). FileSafe (command blocklist, write scope, sensitive files) is in **FileSafe.md** and must align with the central tool policy. Permission semantics and granular rules align with [OpenCode Permissions](https://opencode.ai/docs/permissions/); cross-plan alignment with FileSafe, FileManager, assistant-chat-design, orchestrator, and interview is in §2.5 and §10.

### 1.1 GUI requirements

The GUI must expose tool support in two places (see **Plans/FinalGUISpec.md**):

- **Settings > Advanced > MCP Configuration** -- Already specified: per-platform MCP toggles, MCP server list, Context7 API key, web search provider. MCP-discovered tools then feed into the central registry and permission model (§5).

- **Settings > Advanced > Tool permissions** -- **Required:** Per-tool (and optional wildcard) allow/deny/ask; **presets are in scope for MVP** (Read-only, Plan mode, Full) per §10.4 -- user may choose not to apply a preset, but the preset feature must be implemented; list of built-in + MCP-discovered tools with permission dropdown per row. Bound to the same config that the run uses for the central tool registry. Spec: FinalGUISpec §7.4.1, §7.8 (Usage view).

**Usage page:** Tool usage widget is specified in FinalGUISpec §7.8 (Usage view): tool name, invocation count, latency p50/p95, error rate; data from seglog rollups via analytics scan. See §9.2 enhancement list for context.

**Optional (enhancements):** Tool description in run summary or Config ("which tools are available and their permission for this run"). See §9.2.

---

## 2. Permission model

By default, tools can be **enabled** without per-call approval. Behavior is controlled by a **permission** per tool (or wildcard): **allow**, **deny**, or **ask** (require user approval before running).

### 2.1 Values and semantics

- **allow** -- Tool may run without prompting. Use for read-only or low-risk tools (read, grep, glob, list) or when the user has opted into full automation (e.g. YOLO mode).
- **deny** -- Tool is disabled for the run. The agent cannot invoke it; attempts are blocked and optionally logged.
- **ask** -- User must approve each use, or "approve for session" (per assistant-chat-design). Applies to bash, edit, webfetch, websearch, and any MCP/custom tool where approval is desired.

### 2.2 Config and precedence

Config key: **`tool_permissions`** in the same config blob as the rest of Settings (e.g. GuiConfig; persisted to redb as part of `config:v1`). Full schema: §10.1.

Example:

```json
{
  "tool_permissions": {
    "edit": "deny",
    "bash": "ask",
    "webfetch": "allow",
    "mymcp_*": "ask"
  }
}
```

- **Wildcards:** e.g. `mymcp_*` applies one permission to all tools from an MCP server or namespace. Enables "ask for all tools from server X" without listing each tool.
- **Precedence:** **deny** overrides allow/ask when multiple rules match (e.g. `edit: deny` and `*: allow` → edit is denied). Resolution order: §10.3.
- **Default:** If a tool has no explicit permission, use the default policy table (§10.2). Pattern matching: `*` = zero or more chars, `?` = one char ([OpenCode Permissions -- Wildcards](https://opencode.ai/docs/permissions/#wildcards)). With granular rules (object syntax), last matching rule wins ([OpenCode Permissions](https://opencode.ai/docs/permissions/)).

### 2.3 Session vs run; subagents

- **Session (Assistant):** "Approve for session" can persist allow for that chat session only; do not persist across restarts (per assistant-chat-design).
- **Run (Orchestrator/Interview):** Permissions are fixed from run config at start; no interactive ask unless HITL is enabled at tier boundaries (human-in-the-loop.md).
- **Subagents:** todowrite and todoread default to **deny** for subagent runs to avoid conflicting task state. Run config may override via e.g. `subagent_tool_overrides: { "todowrite": "allow", "todoread": "allow" }` (exact key and schema in implementation plan; document in orchestrator-subagent-integration.md). All other tools use the same default table (§10.2) unless run config specifies otherwise.

### 2.4 Interaction with FileSafe

FileSafe (command blocklist, write scope, sensitive files) runs **in addition to** tool permissions. A tool may be **allowed** by permission but still **blocked** by FileSafe (e.g. bash allowed, but command `rm -rf /` blocked). Tool permission = "may the agent call this tool?"; FileSafe = "may this specific invocation proceed?". See **FileSafe.md**; ensure policy engine applies both layers.

### 2.5 OpenCode Permissions alignment and cross-plan references

Permission semantics and optional **granular rules** align with [OpenCode Permissions](https://opencode.ai/docs/permissions/). Summary and cross-plan ties:

**Granular rules (object syntax):** Per-tool, permission can be an **object** with pattern-based rules ([OpenCode -- Granular Rules](https://opencode.ai/docs/permissions/#granular-rules-object-syntax)): **bash** -- command pattern (`"git *": "allow"`, `"rm *": "deny"`); **edit** -- file path; **read**, **glob**, **grep**, **list** -- path/pattern; **webfetch** -- URL. **Last matching rule wins.** FileSafe-style: bash blocklist ≈ bash deny patterns, write scope ≈ edit path allowlist, sensitive files ≈ read path deny.

**Special permissions:** **external_directory** -- paths outside project cwd; default ask; `~`/`$HOME` expansion ([OpenCode -- External Directories](https://opencode.ai/docs/permissions/#external-directories)). **doom_loop** -- same tool 3× identical input; default ask. **Defaults:** read allows except `.env` denied (`*.env`, `*.env.*`; `*.env.example` allowed) ([OpenCode -- Defaults](https://opencode.ai/docs/permissions/#defaults)). **What "Ask" does:** once, always, reject ([OpenCode](https://opencode.ai/docs/permissions/#what-ask-does)); our "approve for session" ≈ always. **Per-agent overrides:** [OpenCode -- Agents](https://opencode.ai/docs/permissions/#agents); relevant for orchestrator/interview tier config.

| Plan | Relation to tool permissions |
|------|------------------------------|
| **FileSafe.md** | Command blocklist ≈ bash deny; write scope ≈ edit path allowlist; security filter ≈ read path deny (.env). Central policy engine; permission + FileSafe both apply. |
| **FileManager.md** | Workspace roots, open paths; external_directory and path rules may affect File Manager/editor exposure. |
| **assistant-chat-design.md** | YOLO/Regular (§3); approve for session ≈ always; bash audit trail and FileSafe. |
| **orchestrator-subagent-integration.md** | Run config snapshot includes tool permissions; headless ask → deny or HITL; tier/subagent overrides. |
| **interview-subagent-integration.md** | Same run config and permission snapshot for interview runs. |

---

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

## 4. Custom tools

**Custom tools** are user- or project-defined functions the LLM can call. They are defined in config (or a linked module) and can execute arbitrary code.

### 4.1 Registry requirements

The central tool registry should support:

- **Registration:** Name, description, and input schema (parameters, types) so the model knows when and how to call the tool.
- **Permission model:** Same allow/deny/ask and wildcards (e.g. `myproject_*: ask`). Custom tools are not exempt from policy.
- **Events:** Invocations and results normalized into the unified event model (seglog) for analytics, audit, and replay.

### 4.2 Schema and discovery

- **Schema:** JSON Schema or equivalent for parameters; description for model prompt. Stored in config or a dedicated tools manifest (e.g. project-level or user-level).
- **Discovery:** Registry must know which custom tools are available for a run (project config, enabled list, or scan). Avoid loading arbitrary code from disk without explicit enablement.

### 4.3 Sandboxing and safety

- **Execution:** Custom tools run arbitrary code. **MVP:** Execute in a **subprocess** with a configurable timeout (e.g. 60s default) and optional output size cap (e.g. 1 MiB). No network or filesystem sandbox for MVP; document in implementation plan. Future: optional resource limits or allowlist-based sandbox.
- **FileSafe:** Custom tools that read/write files or run shell commands are subject to the same FileSafe guards (write scope, sensitive paths, command blocklist) where the invocation can be classified (e.g. if the tool forwards to bash or edit, apply FileSafe).
- **Naming:** Prefer a prefix or namespace (e.g. `custom_*`, `myproject_*`) so permission wildcards and analytics can group them.

See [OpenCode -- Custom tools](https://opencode.ai/docs/tools/#custom-tools) for reference.

---

## 5. MCP integration (in scope)

MCP is **in scope** for this document: MCP-discovered tools are first-class entries in the central tool registry and subject to the same permission model. Per-platform MCP config paths, GUI (Context7, cited web search), and server lifecycle are in **newtools.md** (§8) and AGENTS.md; here we define integration with the registry and policy.

### 5.1 Registry and policy

- **Discovery:** When a run starts, the runner (or Provider) discovers MCP tools from the platform's MCP config (injected from GUI/config per newtools §8). Each MCP tool is **registered** in the central registry with a stable name (e.g. server name + tool name, or a normalized id).
- **Permission model:** MCP tools use the same allow/deny/ask. Wildcards apply: e.g. `context7_*: allow`, `websearch_cited: ask`. Deny takes precedence.
- **Normalization:** MCP tool invocations and results are normalized into the same event model as built-in tools (seglog), so analytics (latency, error rate) and dashboard rollups include MCP tools.

### 5.2 Naming and precedence

- **Name collisions:** If an MCP tool has the same name as a built-in (e.g. `read`), policy must define precedence (e.g. built-in wins, or namespace: `mcp_context7_read`). Prefer namespacing MCP tools by server so that `mymcp_*` wildcards work.
- **Visibility:** Only tools from **enabled** MCP servers (per run config) appear in the registry for that run. Disabling Context7 in GUI should remove Context7 tools from the set the agent can see.

### 5.3 Where MCP is specified elsewhere

- **Config paths, GUI, Context7, cited web search:** newtools.md §8, §8.1, §8.2, §8.2.1.
- **Platform CLI flags and config format:** AGENTS.md; §7 below (compact table).

---

## 6. Ways to add tools (implementation angles)

| Mechanism | What it adds | Where it's configured | Notes |
|-----------|--------------|------------------------|-------|
| **MCP server** | New tools/resources/prompts from one server | Per-platform MCP config (see §7) | Single MCP server can expose many tools. Context7, cited web search, GUI automation; see newtools.md. |
| **Platform CLI flags** | Allow/deny built-in tools (shell, write, MCP by name) | Run config / runner args | Copilot: `--allow-tool` / `--deny-tool`. Claude: `--allowedTools`. Gemini: `--approval-mode`. |
| **Central tool registry** | All tools (MCP + native) registered and gated by policy | Puppet Master core (rewrite) | Permissions, validation, normalized results; events in seglog; analytics on latency/errors. |
| **GUI tool catalog** | Framework-specific tools (e.g. Playwright, headless runners) offered in Interview | DRY:DATA:gui_tool_catalog; interview config | newtools.md: discovery, user choice, test strategy and PRD wiring. |
| **GUI MCP settings** | Enable/disable MCP servers, API keys (e.g. Context7) | Config → MCP (or Advanced → MCP / Tools) | newtools §8.1; MCP tools then integrated per §5 above. |

Implementations should:

- Use **platform_specs** (and future central registry) as single source of truth; avoid hardcoding platform tool/MCP details.
- Inject MCP config (and optional API keys) into each platform's config at run time so all five platforms can use the same MCP servers when enabled.
- Align with **storage-plan.md**: tool-related events in seglog, rollups in redb, and any search index in Tantivy.

---

## 7. Per-platform MCP and tool config (reference)

Snapshot for implementation; re-verify with Doctor or platform docs at implementation time.

| Platform     | Project / workspace config       | User config                | Format | Tool-related CLI flags |
|-------------|-----------------------------------|----------------------------|--------|-------------------------|
| Cursor      | `.cursor/mcp.json`                | `~/.cursor/mcp.json`       | JSON   | MCP via config; non-interactive via `-p`, `--output-format` |
| Claude Code | `.mcp.json` (cwd)                 | `~/.claude.json`           | JSON   | `--allowedTools`, `--permission-mode`, `--max-turns` |
| Codex       | `.codex/config.toml`              | `~/.codex/config.toml`     | TOML   | MCP in config; `codex mcp-server` for MCP server mode |
| Gemini      | `.gemini/settings.json`           | `~/.gemini/settings.json`  | JSON   | `--approval-mode yolo` \| `auto_edit` \| `plan` |
| Copilot     | `.copilot/mcp-config.json`, `.vscode/mcp.json` (workspace) | `~/.copilot/mcp-config.json` | JSON   | `--allow-all-tools`, `--allow-tool`, `--deny-tool` |

- **Context7:** API key as `Authorization: Bearer <key>`; store in config (e.g. `mcp.context7.api_key`); do not commit; inject when generating platform MCP config.
- **Cited web search:** Prefer one MCP server (e.g. `websearch_cited`) registered like Context7; same injection path for all platforms (newtools §8.2.1).

---

## 8. Implementation details and technical notes

### 8.0 Event payloads (seglog)

Tool events feed analytics and the Usage tool widget. Align with **storage-plan.md** §2.2.

- **`tool.invoked`:** Emitted when a tool call is allowed and execution completes. Payload: `tool_name` (string, required), `run_id` (string, required), `thread_id` (string, optional), `latency_ms` (number, required), `success` (boolean, required), `error` (string, optional when success is false). See storage-plan.md §2.2.
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
- **Gemini:** `--approval-mode yolo` when all tools are allow; `auto_edit` or more restrictive when some are ask/deny.

**Single source of truth:** Registry + policy (from config) → derive flags per platform; no hardcoding in runner. Document the derivation rules in platform_specs or a single "tool policy → CLI args" function.

### 8.4 Redb keys for tool rollups (Usage widget)

Analytics scan writes rollups for the Usage page (FinalGUISpec §7.8). For the **tool usage widget** (per-tool count, latency, error rate):

- **Namespace:** `rollups`
- **Key:** `tool_usage.{window}` where **window** is one of the **canonical** values: `5h`, `7d`, `24h` (and optionally `1h`). The definitive list of window values is in storage-plan.md; Analytics scan and Usage widget must use the same set.
- **Value shape:** JSON or bincode: `{ [tool_name: string]: { count: number, p50_ms: number, p95_ms: number, error_count: number } }`. Example: `{ "bash": { "count": 42, "p50_ms": 120, "p95_ms": 500, "error_count": 2 }, "read": { ... } }`. Analytics scan aggregates `tool.invoked` events (fields: tool_name, latency_ms, success, error) into this structure so the Usage page can render the table without scanning seglog. See §8.0 for event payload and storage-plan.md §2.3.

### 8.5 YOLO and tool permissions

When the user enables **YOLO** (Assistant), treat all tools as **allow** for that session for the purpose of prompting (no "ask" prompts). **FileSafe** still applies: destructive commands and write-scope/sensitive-file guards are still enforced. So: YOLO = "don't ask for tool approval"; it does **not** disable FileSafe.

### 8.6 MCP tool name format and wildcard rule

- **Namespacing:** Use a stable format for MCP tool names in the registry, e.g. **`{server_slug}_{tool_name}`** (e.g. `context7_query_docs`) or **`{server_slug}/{tool_name}`**. Server slug is a short id for the MCP server (from config or derived). Enables wildcards like `context7_*`.
- **Wildcard matching:** **Prefix match.** A rule `mymcp_*` matches any tool name that **starts with** `mymcp_`. More general globs (e.g. `*_read`) can be added later if needed; document the rule in the registry spec.

### 8.7 MCP server unavailable

If an MCP server is enabled in config but fails to start or connect at run start, either (a) **hide** its tools from the registry for that run (agent doesn't see them), or (b) **register** them as "unavailable" and return a clear error if the agent tries to call one. Prefer (a) to avoid failed tool calls; document in Doctor so the user sees "Context7 unavailable (connection failed)."

---

## 9. Gaps, potential problems, and enhancements

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
| **All five platforms in MCP GUI** | FinalGUISpec listed only Cursor, Claude, Gemini for MCP toggles. | Ensure **Codex** and **Copilot** are included in Settings > Advanced > MCP Configuration (all five platforms). |
| **Policy application point** | Where in the stack we enforce allow/deny/ask. | In Provider/runner when processing tool call from platform stream; before executing or forwarding (§8.2). |
| **LSP server crash mid-call** | LSP server crashes or disconnects while handling lsp.references / definition / hover / rename. | lsp adapter returns `{ "error": "lsp_unavailable", "message": "LSP server closed or timed out" }` (§3.5); enforce request timeout (e.g. 10s). |

### 9.2 Enhancements (all optional; not MVP)

The following are **optional** improvements. MVP is defined by §3 built-in tools, §10 permission model, §8 events/rollups, and GUI Tool permissions (FinalGUISpec §7.4.1).

| Enhancement | Description | Priority / notes |
|------------|-------------|-------------------|
| **Per-tool rate limits** | Limit invocations per tool per run/session (e.g. max 100 grep calls). | Reduces runaway tool use; configurable per tool or global. |
| **Tool usage dashboard** | Dashboard widget: most-used tools, latency p50/p95, error rate by tool (from seglog rollups). | storage-plan + usage-feature; already implied by analytics scan. |
| **Permission presets** | Presets: "Read-only" (deny edit, bash, webfetch, websearch), "Plan mode" (allow read/grep/glob/list only), "Full" (allow all with ask for bash/edit). | Simplifies config; maps to assistant modes (Ask, Plan, Agent). |
| **Custom tool templates** | Project or org templates for common custom tools (e.g. "run tests", "deploy staging") with schema and default permission. | Encourages reuse; catalog in docs or GUI. |
| **MCP tool allowlist** | Option to allow only specific MCP tools by name (e.g. only `context7_query_docs`) even if server is enabled. | Finer control than server-level enable; complements wildcards. |
| **Audit log for denied/ask** | Explicit audit event when a tool is denied or when user declines an "ask". | Helps compliance and debugging; store in seglog with tool name, reason, timestamp. |
| **Tool description in UI** | In Config or run summary, show which tools are available and their permission (allow/deny/ask) for the current run. | Transparency; can be generated from registry + run config. |
| **Bash command allowlist** | Beyond FileSafe blocklist: allowlist of permitted commands (e.g. `npm test`, `cargo build`) when bash is "allow". | Stricter than blocklist-only; optional; align with FileSafe. |

---

## 10. Implementation plan: permissions (spec for implementers)

This section gives enough detail for someone to write an **implementation plan** or implement the permission layer without inferring schema or order. It locks config shape, resolution steps, and integration points.

### 10.1 Config schema (exact)

- **Config key:** `tool_permissions` in the same config blob as the rest of Settings (e.g. `GuiConfig`; persisted to redb as part of `config:v1`).
- **Simple form (MVP):** A single object: keys = tool name or wildcard pattern (e.g. `mymcp_*`), values = `"allow"` | `"deny"` | `"ask"`.

```json
{
  "tool_permissions": {
    "edit": "deny",
    "bash": "ask",
    "read": "allow",
    "webfetch": "allow",
    "context7_*": "ask"
  }
}
```

- **Granular form (optional, post-MVP):** A key can map to an **object** of pattern → action (for that tool only). Pattern matching: last matching rule wins; `*` = zero or more chars, `?` = one char. Example (OpenCode-style):

```json
{
  "tool_permissions": {
    "bash": {
      "*": "ask",
      "git *": "allow",
      "npm *": "allow",
      "rm *": "deny"
    },
    "edit": {
      "*": "deny",
      "src/**/*.rs": "allow"
    }
  }
}
```

- **Scope:** MVP = app-level only (one `tool_permissions` object). Per-project overrides (e.g. `project.{id}.tool_permissions`) are an enhancement; document in registry spec when added.
- **Validation:** Keys may be built-in canonical names (§3.1), discovered MCP/custom names, or wildcard patterns. Wildcard syntax for MVP: **prefix only** (e.g. `mymcp_*`); pattern must end with `*` and match by prefix. Invalid wildcards (e.g. `*only`, empty `*`) are ignored at load or treated as literal tool names; document in registry spec. Unknown tool names at resolution time fall through to default (§10.3).

### 10.2 Default policy table

When no rule matches (no exact tool name, no matching wildcard, no matching granular pattern), use this default. Implement as a **single source of truth** (e.g. constant table or function in code). Every built-in tool and special key must have exactly one row.

| Tool or key | Default | Notes |
|-------------|---------|-------|
| read | allow | Read-only; path-based deny for .env via §10.3 special guards |
| grep | allow | Read-only; low risk |
| glob | allow | Read-only; low risk |
| list | allow | Read-only; low risk |
| edit | ask | File modifications; require approval unless overridden |
| write | ask | Same permission as edit (§3.2) |
| patch | ask | Same permission as edit |
| multiedit | ask | Same permission as edit |
| bash | ask | Shell execution; FileSafe applies after permission |
| webfetch | ask | Network; optional allow per config |
| websearch | ask | Network; optional allow per config |
| question | allow | Session/UX; only meaningful when HITL/UI available |
| skill | allow | Load skill content; path under allowed roots |
| todowrite | allow | Subagent runs: default **deny** (run config may override) |
| todoread | allow | Subagent runs: default **deny** (run config may override) |
| lsp | allow | Read-only ops (references, definition, hover); rename requires approval (§3.4.1) |
| task | ask | Subagent launch; can override to allow/deny |
| codesearch | allow | Code/symbol search; low risk |
| external_directory | ask | Paths outside project cwd ([OpenCode](https://opencode.ai/docs/permissions/#external-directories)) |
| doom_loop | ask | Same tool 3× identical input ([OpenCode](https://opencode.ai/docs/permissions/)) |
| **Any unknown tool** (e.g. new MCP tool) | ask | Safe default until user sets explicit rule |

Document this table in the central registry or policy module so all callers use the same defaults.

### 10.3 Resolution algorithm (steps)

Use this order when deciding allow/deny/ask for a single tool invocation. Steps are deterministic; run them in order and return as soon as a step yields a result.

1. **YOLO override (Assistant only):** If session is YOLO, return **allow** (no prompt). **FileSafe still applies after permission:** the runner must then run FileSafe checks before executing (bash blocklist, write scope, sensitive paths). So: permission = allow; then if FileSafe blocks, do not execute and return a "Blocked by FileSafe" result to the agent; do not emit `tool.denied` for FileSafe blocks (emit only for permission deny or user-declined ask).
2. **Session "approve for session" cache (Assistant only):** If this tool (or matching pattern) was approved for session, return **allow**.
3. **Unknown tool name:** If `tool_name` is empty or not in the known set (built-in names §3.1, or discovered MCP/custom names for this run), skip to step 7 and use default **"Any unknown tool"** (ask).
4. **Exact tool name:** If `tool_permissions[tool_name]` exists and is a string (`"allow"` | `"deny"` | `"ask"`), use it and stop.
5. **Wildcard rules:** If not found by exact name, evaluate wildcard rules. MVP: only **prefix** wildcards (key ends with `*`). For each key that ends with `*`, let prefix = key with `*` removed; if `tool_name` starts with prefix, that rule matches. Use **longest matching prefix** (e.g. `mymcp_*` and `mymcp_foo_*` both match `mymcp_foo_bar` → use `mymcp_foo_*` if present). If multiple wildcards match with the same length, **deny** overrides allow/ask; else allow overrides ask. Invalid wildcards (e.g. `*only`, key that is just `*`) are skipped (do not match).
6. **Granular rules (if present):** If `tool_permissions[tool_name]` is an object, get **invocation context** (e.g. for bash: command string; for edit/read: path; for webfetch: URL). Evaluate pattern keys in **defined/iteration order**; **last matching pattern** wins. If **no pattern matches** the invocation context, fall through to step 7 (default for this tool name).
7. **Default:** Use the default from §10.2 for this tool (or "Any unknown tool" if tool was unknown). For subagent runs, apply subagent overrides (todowrite/todoread → deny unless run config overrides).
8. **Special guards:** If tool is `read` and invocation path matches sensitive pattern (e.g. `.env`, `*.env`, or FileSafe-configured sensitive list), return **deny** regardless of permission (align with FileSafe security filter). Apply after steps 1-7.

Result: **allow** | **deny** | **ask**. After result: if **deny**, emit `tool.denied` and do not execute. If **ask**, surface to UI; on user decline, emit `tool.denied` and do not execute. If **allow** (or ask approved), run FileSafe check if applicable; if FileSafe blocks, do not execute and return block reason to agent; then if actually executed, emit `tool.invoked` on completion.

### 10.4 Presets → config mapping

So the GUI "Apply preset" button can write a concrete `tool_permissions` object:

| Preset | Effect on tool_permissions |
|--------|----------------------------|
| **Read-only** | `edit`, `bash`, `webfetch`, `websearch` → deny; all others allow (or leave unset to use defaults). |
| **Plan mode** | Only `read`, `grep`, `glob`, `list` → allow; everything else → deny. |
| **Full** | **Default:** all built-in → allow except `bash` and `edit` → ask. User may then change bash/edit to allow. Alternative "Allow all" (no ask) may be a separate preset or GUI toggle; document in FinalGUISpec if implemented. |

Store as the same `tool_permissions` object; presets are just a shortcut to set multiple keys at once.

### 10.5 GUI ↔ config serialization

- **Save:** Per-tool list (tool name + dropdown Allow/Deny/Ask) → object `{ tool_name: "allow"|"deny"|"ask", ... }`. Wildcard rules (e.g. "Add rule: `context7_*` = Ask") → add key `context7_*` to same object. Preset button overwrites or merges (document: overwrite is simpler for MVP).
- **Load:** Read `tool_permissions`; for each key, if it's a string, show in per-tool list (or in wildcard list if key contains `*`). If it's an object (granular), show in "Advanced" or "Granular rules" UI if that exists; otherwise treat as "custom" and show tool name with badge "Custom rules."
- **MVP:** Simple form only (no granular object in GUI); advanced users can edit config or YAML. Full granular editing in GUI is an enhancement.

### 10.6 FileSafe integration order and API

- **Order:** (1) **Tool permission** (allow/deny/ask) -- if deny, stop and return "Tool disabled." (2) If **ask**, surface to user; on approve, continue. (3) **FileSafe** -- for bash: command blocklist; for edit/write: write scope; for read: sensitive-file filter. If FileSafe blocks, return "Blocked by FileSafe: &lt;reason&gt;" and do not execute.
- **Single API (recommended):** `policy.may_execute_tool(tool_name, invocation_context) -> Result<Allow | Deny(reason) | Ask, Error>`. Internally: resolve permission (allow/deny/ask); if allow (or ask and approved), then run FileSafe check; return Allow only if both pass. Runner calls this once per tool call before executing or forwarding.
- **FileSafe contract:** FileSafe exposes e.g. `check_bash_command(cmd)`, `check_write_path(path)`, `check_read_path(path)`. Policy engine calls these after permission resolves to allow (or ask-approved).

### 10.7 Ask UI contract

- **Assistant (interactive):** When policy returns **ask**, the runner must **not** execute the tool. It must surface a **pending approval** to the UI (e.g. event on a channel, or callback with `{ tool_name, invocation_summary, options: once | always }`). UI shows approval dialog (e.g. "Allow `bash: git status`?" with buttons Once / For session / Deny). On "Once" or "For session," runner proceeds with this invocation (and optionally caches "for session" for that tool/pattern). On "Deny," return error to agent and optionally emit `tool.denied`.
- **Orchestrator / Interview (headless):** When policy returns **ask**, no UI is available. **Map ask → deny** (recommended), or to **pending-HITL** if HITL is enabled at that tier (human-in-the-loop.md): pause run and surface "Approval required" to Dashboard; when user approves, resume. Document chosen behavior in human-in-the-loop.md and in the implementation plan.

### 10.8 Registry → CLI derivation (per platform)

Implement a single function or table that, given the **resolved** permission set (which tools are allow/deny/ask for this run), returns the **platform-specific CLI args** so the runner can invoke the CLI correctly. Example (expand per platform in implementation plan):

| Platform | Derivation rule |
|----------|------------------|
| Claude | Build `--allowedTools "Read,Edit,Bash"` from tools that are allow or ask (ask still needs runtime approval). Omit any tool that is deny. |
| Copilot | Build `--allow-tool '...'` list from allow+ask; build `--deny-tool '...'` from deny. If all allow, can use `--allow-all-tools` and only pass `--deny-tool` for denied. |
| Gemini | `--approval-mode yolo` if all tools allow; else `auto_edit` or more restrictive; document mapping in implementation plan. |
| Cursor, Codex | No single CLI flag for tool allowlist. Tool set is determined by MCP config and platform behavior. Runner **filters** tool calls against policy before forwarding: allow → forward; deny → return "Tool disabled" to agent; ask → map to deny or HITL in headless. Document in implementation plan. |

No hardcoded tool names in runner; all names come from registry + policy.

---

## 11. Relationship to other plans

| Plan | How tool support relates |
|------|---------------------------|
| **rewrite-tie-in-memo.md** | Central tool registry + policy engine; no per-provider special cases; tool results in unified event model → seglog → projections. |
| **newtools.md** | GUI testing tools catalog, **MCP settings in GUI** (Context7, others), MCP config for all five platforms, cited web search (MCP option). Tool support here; MCP config/GUI there. |
| **storage-plan.md** | Tool invocation/completion events in seglog; tool latency/errors in analytics scan → redb; dashboard/usage rollups. |
| **agent-rules-context.md** | Rules and context injected into every run; tool policy and safe-edit (FileSafe) align with central policy. |
| **orchestrator-subagent-integration.md** | Run config and tier wiring; **41 subagents** canonical list (§4, subagent_registry); task tool validates subagent_type against this list. MCP and tool flags passed to platform runner from same run-config build. |
| **interview-subagent-integration.md** | Interview phase assignments use the same **41 subagents**; config (framework tools, MCP enabled) drives test strategy and PRD; same MCP/tool config available to interview runs. |
| **FileSafe.md** | Safe-edit and path/URL guards; runs in addition to tool permissions; map to central tool policy and patch/apply/verify pipeline. |
| **usage-feature.md** | Tool usage and cost can be reflected in usage rollups (from seglog/analytics). |
| **LSPSupport.md** | LSP MVP; lsp tool promoted (§3.4, §3.5); diagnostics in context; §9.1. |
| **human-in-the-loop.md** | "Ask" permission and tier-boundary approval; orchestrator ask vs HITL behavior. |

---

## 12. Implementation checklist (ordered for implementation plan)

Use this list in order to derive a step-by-step implementation plan. Dependencies flow top to bottom.

1. **Config schema** -- Add `tool_permissions` to app config (GuiConfig / redb `config:v1`) per §10.1; validate keys (built-in, MCP/custom, prefix wildcards only).
2. **Default policy table as code** -- Implement §10.2 as single source of truth; subagent overrides (todowrite/todoread deny for subagent runs).
3. **Resolution function** -- Implement §10.3 in order: YOLO → session cache → unknown → exact → wildcard (longest prefix) → granular → default → special guards; deterministic.
4. **FileSafe and YOLO order** -- After allow (or ask approved), run FileSafe before executing; do not emit `tool.denied` for FileSafe blocks (§10.6).
5. **Per-tool adapters** -- Input/output, errors, limits per §3.5; LSP tool with timeout and crash/disconnect handling (§3.5).
6. **Event emission** -- `tool.invoked` (tool_name, run_id, thread_id, latency_ms, success, error) and `tool.denied` (tool_name, run_id, thread_id, reason) per §8.0.
7. **GUI Tool permissions** -- Settings > Advanced > Tool permissions (FinalGUISpec §7.4.1); presets per §10.4; load/save `tool_permissions` (§10.5).
8. **Usage widget and rollups** -- Analytics scan → redb `rollups` / `tool_usage.{window}` (§8.4); Usage view §7.8; empty state message.
9. **Central registry and policy engine** -- Registry + policy; single API e.g. `policy.may_execute_tool` (§10.6).
10. **Registry → CLI derivation** -- Single function per platform (§8.3, §10.8).
11. **MCP integration** -- Discovery, namespacing, hide if server fails (§8.7); all five platforms in GUI.
12. **Ask UI and headless** -- Assistant: Once / For session / Deny; headless: ask → deny or HITL (§10.7).
13. **LSP tool promotion** -- MVP when LSP is MVP (Plans/LSPSupport.md §9.1); no feature flag; rename requires approval.
14. **Doctor and docs** -- MCP/LSP checks; document default table and resolution.
15. **Subagent tool overrides** -- Document `subagent_tool_overrides` schema (e.g. `{ "todowrite": "allow" }`) and config location in orchestrator-subagent-integration.md so run config can override todowrite/todoread for subagent runs.


---

## 13. References

- [OpenCode -- Tools](https://opencode.ai/docs/tools/) -- Built-in tools, permission model (allow/deny/ask), custom tools, MCP servers, ignore patterns (primary reference for §2-§4).
- [OpenCode -- Permissions](https://opencode.ai/docs/permissions/) -- Granular rules (object syntax), external_directory, doom_loop, defaults (.env for read), "What Ask Does" (once/always/reject), per-agent overrides; cross-plan alignment §2.5.
- [Model Context Protocol -- Specification (latest)](https://modelcontextprotocol.io/specification/latest) -- MCP spec; MCP config and GUI covered in newtools.md.
- AGENTS.md -- Platform CLI commands, MCP/config notes, DRY (platform_specs, widget catalog).
- REQUIREMENTS.md -- Platform tool flags, MCP probe, verification adapters, tooling rules.
- Plans/newtools.md -- GUI testing tools, **MCP support and GUI settings**, per-platform MCP table, cited web search.
- Plans/rewrite-tie-in-memo.md -- Central tool registry, policy engine, event model, storage.
- Plans/storage-plan.md -- seglog, redb, Tantivy, analytics scan, rollups.
- Plans/00-plans-index.md -- Plan map and rewrite tie-in.

---

*This file is a plan document only. Implementation must follow AGENTS.md (including DRY, platform_specs, Pre-Completion Verification Checklist) and the canonical plans referenced above.*
