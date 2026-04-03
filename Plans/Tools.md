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
- **Permission system (allow/ask/deny semantics, precedence, granular rules, defaults):** `Plans/Permissions_System.md` (canonical SSOT)

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

- **Settings > Permissions** -- **Required:** Per-tool (and optional wildcard) allow/deny/ask; **presets are in scope for MVP** (Read-only, Plan mode, Full) per §10.4 -- user may choose not to apply a preset, but the preset feature must be implemented; list of built-in + MCP-discovered tools with permission dropdown per row. Bound to the same config that the run uses for the central tool registry. Spec: FinalGUISpec §7.4.10, §7.8 (Usage view).

**Usage page:** Tool usage widget is specified in FinalGUISpec §7.8 (Usage view): tool name, invocation count, latency p50/p95, error rate; data from seglog rollups via analytics scan. See §9.2 enhancement list for context.

**Optional (enhancements):** Tool description in run summary or Config ("which tools are available and their permission for this run"). See §9.2.

---

## 2. Permission model

> **SSOT:** The canonical specification for permission actions (`allow`/`ask`/`deny`), precedence layers, granular rules, wildcard syntax, special guards, ask-flow semantics, deterministic defaults, and resolution algorithm is **`Plans/Permissions_System.md`**. This section provides a summary for tool-registry context; do not duplicate normative detail here.

ContractRef: ContractName:Plans/Permissions_System.md, Primitive:DRYRules

### 2.1 Values and semantics (summary)

- **allow** — Tool may run without prompting. FileSafe guards still apply after permission.
- **deny** — Tool is blocked; `tool.denied` event emitted.
- **ask** — User must approve (`once` / `always` / `reject`). In headless runs, maps to `deny` unless HITL is enabled.

Full definitions: `Plans/Permissions_System.md` §2.

### 2.2 Config and precedence (summary)

Permission rules are evaluated in a deterministic precedence order: Mode override > Session cache > Persona overrides > Project-level > Global-level > Defaults. Within a single ruleset, last-match-wins. Full precedence table: `Plans/Permissions_System.md` §2.4.

Config is stored in TOML files at deterministic paths (global: `~/.config/puppet-master/permissions.toml`, project: `<project_root>/.puppet-master/permissions.toml`). A `tool_permissions` key in redb `config:v1` is a projection of the merged ruleset. Full schema: `Plans/Permissions_System.md` §9.

### 2.3 Session vs run; subagents

A PM subagent is a child run. It is not a special-case provider-local actor and it is not defined by provider-native agent-file syntax.

ContractRef: ContractName:Plans/Personas.md, ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Contracts_V0.md

Canonical child-run identity fields:
- `child_run_id`
- `parent_run_id`
- `thread_id`
- `batch_id?`
- `subgroup_id?`
- `attempt_id?`
- requested/effective Persona and runtime fields
- effective provider invocation kind as additive adapter metadata

Provider behavior may still differ. A canonical child run may map to:
- a native provider subagent path
- a native provider child-session path
- a plain provider run

That adapter-level difference does not change the PM child-run canon.

ContractRef: ContractName:Plans/CLI_Bridged_Providers.md, ContractName:Plans/Provider_OpenCode.md, ContractName:Plans/Models_System.md

Subagents are disposable by default. Completion, cancellation, or failure normally ends that child. Follow-up work should usually spawn a new child rather than reopen an old one.

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/assistant-memory-subsystem.md, ContractName:Plans/orchestrator-subagent-integration.md
### 2.4 Interaction with FileSafe

FileSafe runs **in addition to** tool permissions. A tool may be **allowed** by permission but still **blocked** by FileSafe. Tool permission = "may the agent call this tool?"; FileSafe = "may this specific invocation proceed?". See `Plans/FileSafe.md`. The policy engine applies both layers in order: permission first, then FileSafe. Full integration order: §10.6.

### 2.4.1 Central policy engine contract
Every agent-usable tool attempt MUST pass through one canonical policy engine that resolves permission, approval/HITL, FileSafe, execution, terminal binding when relevant, and result normalization.
ContractRef: ContractName:Plans/FileSafe.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md


Canonical order:
1. resolve tool identity and permission
2. evaluate `allow` / `ask` / `deny`
3. if `ask`, resolve approval or headless fallback
4. apply FileSafe and other invocation validation
5. resolve terminal or shell binding for shell-capable actions
6. execute or reject
7. normalize the terminal outcome for persistence, analytics, and reveal-linkback behavior

ContractRef: ContractName:Plans/FileSafe.md, ContractName:Plans/storage-plan.md, ContractName:Plans/CLI_Bridged_Providers.md

Shell-binding rules:
- `bash` and any canonical shell-backed execution path resolve through the terminal process-host contract when they create or bind shell state
- non-interactive or hidden shell execution may suppress opening the terminal UI, but it still binds to canonical terminal-session state when execution actually occurs
- denied or blocked shell calls do not mint fake live terminal sessions
- chat command cards and other preview surfaces consume normalized terminal state rather than replacing terminal ownership

ContractRef: ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md, ContractName:Plans/assistant-chat-design.md, ContractName:Plans/FinalGUISpec.md

At minimum, the normalized tool-result taxonomy MUST distinguish:
ContractRef: ContractName:Plans/Run_Modes.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Contracts_V0.md

- `allowed_succeeded`
- `allowed_runtime_error`
- `permission_denied`
- `user_declined`
- `headless_ask_denied`
- `filesafe_blocked`
- `validation_blocked`
- `cancelled`
- `timed_out`
- `post_scan_failure`

ContractRef: ContractName:Plans/Run_Modes.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Contracts_V0.md

This document owns the normalized tool-result taxonomy and policy order. Provider docs emit observations; storage docs persist normalized results.

ContractRef: ContractName:Plans/Run_Modes.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Contracts_V0.md
### 2.5 Cross-plan references

| Plan | Relation to tool permissions |
|------|------------------------------|
| **Permissions_System.md** | Canonical SSOT for allow/ask/deny semantics, precedence, granular rules, defaults, resolution algorithm, GUI, and persistence. |
| **FileSafe.md** | Command blocklist ≈ bash deny; write scope ≈ edit path allowlist; security filter ≈ read path deny (.env). Central policy engine; permission + FileSafe both apply. |
| **FileManager.md** | Workspace roots, open paths; external_directory and path rules may affect File Manager/editor exposure. |
| **assistant-chat-design.md** | YOLO/Regular (§3); approve for session ≈ always; bash audit trail and FileSafe. |
| **orchestrator-subagent-integration.md** | Run config snapshot includes tool permissions; headless ask → deny or HITL; node/subagent overrides. |
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

MCP tools enter the central tool registry and permission model. MCP server lifecycle is PM-owned.

ContractRef: ContractName:Plans/Permissions_System.md, ContractName:Plans/Executor_Protocol.md

### Spawn policy (lazy-load)

MCP servers MUST be spawned on the first tool call that requires them, never at PM startup. A startup timeout does not mark the server permanently broken; it marks the server `degraded` and starts a background readiness probe.

ContractRef: ContractName:Plans/Architecture_Invariants.md, ContractName:Plans/Executor_Protocol.md

### Startup, listTools, and stale-list behavior

- `startup_timeout_ms`: `10000` by default.
- On timeout, the server becomes `degraded`; PM retries one readiness probe in the background before treating the server as `unavailable` until user action.
- `listTools()` retries 3 times with 1-second backoff.
- If retries fail and a prior tool list exists, PM keeps the last-known tool list marked `stale`; a transient list failure MUST NOT permanently delete the server from the registry.
- Refresh triggers: explicit user refresh, config change, or periodic TTL refresh every 5 minutes.

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/storage-plan.md

### Connection model

Each stdio server uses one persistent subprocess connection pool per configured server. PM MUST NOT spawn a new subprocess per tool call. HTTP/SSE MCP servers use a persistent client/session per endpoint.

ContractRef: ContractName:Plans/Architecture_Invariants.md, ContractName:Plans/Executor_Protocol.md

### Schema isolation and OAuth state
MCP schema handling is fail-safe:
- detect `$ref` cycles with a visited-set
- when a cycle edge is encountered, substitute `{}` at that edge, emit a structured warning that includes the ref path, and continue loading the registry entry
- maximum traversal depth: 32
- reject resolved schemas above 64 KiB
- provider-specific rewrites are deterministic and explicit. At minimum, compatibility bridges rewrite Gemini-family `anyOf` unions to `oneOf` when the target dialect rejects `anyOf`, strip `const` when the target surface does not permit it, and emit a structured warning that records each rewrite path and rewrite class.
- malformed or rejected schema output becomes a structured `mcp_schema_mismatch` diagnostic; it MUST NOT crash the registry

ContractRef: ContractName:Plans/CLI_Bridged_Providers.md, ContractName:Plans/Architecture_Invariants.md, ContractName:Plans/storage-plan.md

Cycle handling is intentionally lossy-but-safe: PM preserves registry availability and explicit warning visibility rather than recursing indefinitely or silently omitting the affected tool.

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Executor_Protocol.md, ContractName:Plans/Decision_Policy.md

OAuth and client state is keyed by provider plus scope, not by a transient per-call or per-server instance. Refresh and token-write paths use compare-and-swap or other atomic update semantics so successful callbacks are not immediately clobbered by a second writer.

ContractRef: ContractName:Plans/GitHub_API_Auth_and_Flows.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Architecture_Invariants.md

OAuth callback listeners for MCP and other local callback flows bind only to `127.0.0.1`. If the configured callback port is unavailable, PM retries with an ephemeral loopback port. If loopback binding cannot be started, PM falls back to manual copy-paste or device-code flow rather than widening the bind host.

ContractRef: ContractName:Plans/GitHub_API_Auth_and_Flows.md, ContractName:Plans/Executor_Protocol.md, ContractName:Plans/Run_Modes.md

Stable OAuth client identity is mandatory for MCP and other locally registered callback flows:
- dynamic client registrations or local OAuth client identifiers are keyed by `(provider_id, scope_set)` and reused across refresh/login attempts for that logical provider surface
- one shared local HTTP listener services callback flows for the same local auth environment; MCP servers that use the same provider/scope tuple MUST reuse that listener instead of minting parallel per-server listeners
- concurrent auth attempts share the same stored registration under file locking or equivalent compare-and-swap protection; PM MUST NOT mint a new client identifier on every callback attempt
- callback listeners may rebind ports when necessary, but listener replacement MUST NOT change client identity, token ownership, or provider/scope keying

ContractRef: ContractName:Plans/GitHub_API_Auth_and_Flows.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Architecture_Invariants.md
### Windows MCP subprocess behavior

Windows stdio MCP processes MUST be started with `CREATE_NEW_PROCESS_GROUP`. Graceful stop uses `CTRL_BREAK_EVENT`; if the process does not exit within 3 seconds, PM escalates to force termination.

ContractRef: ContractName:Plans/Executor_Protocol.md, ContractName:Plans/Run_Modes.md

## 6. Ways to add tools (implementation angles)

| Mechanism | What it adds | Where it's configured | Notes |
|-----------|--------------|------------------------|-------|
| **MCP server** | New tools/resources/prompts from one server | Per-platform MCP config (see §7) | Single MCP server can expose many tools. Context7, cited web search, GUI automation; see newtools.md. |
| **Platform CLI flags** | Allow/deny built-in tools (shell, write, MCP by name) | Run config / runner args | Copilot: `--allow-tool` / `--deny-tool`. Claude: `--allowedTools`. Gemini: N/A (Direct-provider; enforced by Puppet Master). |
| **Central tool registry** | All tools (MCP + native) registered and gated by policy | Puppet Master core (rewrite) | Permissions, validation, normalized results; events in seglog; analytics on latency/errors. |
| **GUI tool catalog** | Framework-specific tools (e.g. Playwright, headless runners) offered in Interview | DRY:DATA:gui_tool_catalog; interview config | newtools.md: discovery, user choice, test strategy and PRD wiring. |
| **GUI MCP settings** | Enable/disable MCP servers, API keys (e.g. Context7) | Settings → Advanced → MCP Configuration | newtools §8.1; MCP tools then integrated per §5 above. |

Implementations should:

- Use **platform_specs** (and future central registry) as single source of truth; avoid hardcoding platform tool/MCP details.
- Own MCP centrally (tool registry + policy engine); generate derived adapter config for `CliBridge` providers only where required. `DirectApi` providers use the central registry directly. Resolve secrets via env/credential store only (no secrets in config files).
- Align with **storage-plan.md**: tool-related events in seglog, rollups in redb, and any search index in Tantivy.

---

## 7. Per-platform MCP and tool config (reference)

Snapshot for implementation; re-verify with Doctor or platform docs at implementation time.

| Platform     | Project / workspace config       | User config                | Format | Tool-related CLI flags |
|-------------|-----------------------------------|----------------------------|--------|-------------------------|
| Cursor      | `.cursor/mcp.json`                | `~/.cursor/mcp.json`       | JSON   | MCP via config; non-interactive via `-p`, `--output-format` |
| Claude Code | `.mcp.json` (cwd)                 | `~/.claude.json`           | JSON   | `--allowedTools`, `--permission-mode`, `--max-turns` |
| Codex       | N/A (DirectApi; central MCP registry) | N/A                  | N/A    | (provider/tool boundary) |
| Gemini      | N/A (DirectApi; central MCP registry) | N/A                  | N/A    | (provider/tool boundary) |
| Copilot     | N/A (DirectApi; central MCP registry) | N/A                  | N/A    | (provider/tool boundary) |

- **Context7:** API key as `Authorization: Bearer <key>`; resolve via env/credential store and inject in-memory. Derived adapter config MUST contain no secrets.
- **Cited web search:** Prefer one MCP server (e.g. server slug `websearch-cited`, default tool name `websearch_cited`) registered centrally like Context7; derived adapters for `CliBridge` providers only (newtools §8.2.1). Tool results MUST normalize to the cited-search contract in `Plans/newtools.md` §8.2.1 before reaching chat/interview/orchestrator consumers.

---

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

## 10. Implementation plan: permissions (spec for implementers)

> **SSOT:** The canonical permission specification (actions, precedence, granular rules, wildcards, special guards, ask-flow, defaults, resolution algorithm, persistence, and GUI) is **`Plans/Permissions_System.md`**. This section provides implementation-oriented guidance for the tool registry and policy engine integration. It references the SSOT for normative definitions and adds tool-registry-specific details (FileSafe integration, CLI derivation, presets) that are scoped to this document.

ContractRef: ContractName:Plans/Permissions_System.md, Primitive:DRYRules

### 10.1 Config schema

The durable permission config uses TOML files at `~/.config/puppet-master/permissions.toml` (global) and `<project_root>/.puppet-master/permissions.toml` (project). Full schema: `Plans/Permissions_System.md` §9.1.

For backward compatibility, the merged permission set is also projected to redb as `tool_permissions` in `config:v1`.

### 10.2 Default policy table

Canonical default table: `Plans/Permissions_System.md` §7. Tool-to-default mapping includes `read` → allow (with §7.1 `.env` deny), `edit`/`bash`/`media.generate` → ask, `glob`/`grep`/`list`/`codesearch`/`chatsearch`/`logsearch`/`skill`/`lsp`/`capabilities.get` → allow, `webfetch`/`websearch`/`task`/`logread`/`repo.import` → ask, `todoread`/`todowrite` → allow (subagent: deny), `external_directory`/`doom_loop` → ask, unknown tools → ask.
### 10.3 Resolution algorithm

Canonical algorithm: `Plans/Permissions_System.md` §8. Summary: Mode override → Session cache → Persona overrides → Project rules → Global rules → Defaults → Special guards. Post-resolution, FileSafe applies (§10.6).

### 10.4 Presets → config mapping

Presets apply batch permission rules. Canonical preset definitions: `Plans/Permissions_System.md` §10.4.

| Preset | Effect on tool_permissions |
|--------|----------------------------|
| **Read-only** | `edit`, `bash`, `webfetch`, `websearch`, `task`, `repo.import` → deny; all others allow (or leave unset to use defaults). |
| **Plan mode** | Allow `read`, `grep`, `glob`, `list`, `codesearch`, `chatsearch`, `logsearch`, `question`, `skill`, `todoread`, `todowrite`, `capabilities.get`, read-only `lsp` operations, `webextract`, and `webresearch`; deny `create` / `write`, `edit`, `patch`, `multiedit`, `repo.import`, deployment-capable tools, and any `bash` invocation classified as write-capable or deployment-oriented (MVP-safe preset: deny `bash` entirely). |
| **Full** | All tools → allow except `bash`, `edit`, `repo.import` → ask. |

Store as the same TOML config; presets are a GUI shortcut to set multiple keys at once. Plan mode allows information gathering but not state mutation.
### 10.5 GUI ↔ config serialization

The Permissions GUI is specified in `Plans/Permissions_System.md` §10 and `Plans/FinalGUISpec.md` §7.4.10. The tool registry supplies the list of known tool names (built-in + MCP-discovered) to populate the GUI's per-tool list.

### 10.6 FileSafe integration order and API

- **Canonical order owner:** `§8.2` is the authoritative dispatch sequence. This subsection is an API summary only and MUST NOT be read as a competing order definition.
- **Single API (recommended):** `policy.may_execute_tool(tool_name, invocation_context) -> Result<Allow | Deny(reason) | Ask, Error>` remains the permission entrypoint within that sequence. Runner code calls it before any underlying tool implementation is invoked.
- **FileSafe contract:** FileSafe exposes e.g. `check_bash_command(cmd)`, `check_write_path(path)`, `check_read_path(path)`. For file-affecting or shell-affecting tools, FileSafe runs on normalized arguments inside the canonical `§8.2` flow; hook-mutated arguments trigger the required re-checks before dispatch.

### 10.7 Ask UI contract

Ask-flow semantics (`once`/`always`/`reject`) are defined in `Plans/Permissions_System.md` §6. Implementation notes for the runner:

- **Assistant (interactive):** When policy returns **ask**, surface a **pending approval** to the UI with `{ tool_name, invocation_summary, options: once | always | reject }`. See `Plans/Permissions_System.md` §6 for response semantics.
- **Orchestrator / Interview (headless):** Map `ask` → `deny`, or to **pending-HITL** if HITL is enabled (`Plans/human-in-the-loop.md`).

### 10.8 Registry → CLI derivation (per platform)

Implement a single function or table that, given the **resolved** permission set (which tools are allow/deny/ask for this run), returns the **platform-specific CLI args** so the runner can invoke the CLI correctly. Example (expand per platform in implementation plan):

| Platform | Derivation rule |
|----------|------------------|
| Claude | Build `--allowedTools "Read,Edit,Bash"` from tools that are allow or ask (ask still needs runtime approval). Omit any tool that is deny. |
| Copilot | Build `--allow-tool '...'` list from allow+ask; build `--deny-tool '...'` from deny. If all allow, can use `--allow-all-tools` and only pass `--deny-tool` for denied. |
| Gemini | N/A (Direct-provider; tool gating is enforced by Puppet Master policy, not provider CLI flags). |
| Cursor, Codex | No single CLI flag for tool allowlist. Tool set is determined by MCP config and platform behavior. Runner **filters** tool calls against policy before forwarding: allow → forward; deny → return "Tool disabled" to agent; ask → map to deny or HITL in headless. Document in implementation plan. |

HTE / DAE split (canonical): the "before forwarding" wording above applies to **HTE** only, where Puppet Master remains the tool executor. In **DAE**, the provider executes tools inside a jail, so enforcement relies on deterministic pre-spawn restriction + post-run reconciliation. Providers that cannot support that restriction path MUST NOT advertise `dae_allowed = true`.

No hardcoded tool names in runner; all names come from registry + policy.

---

## 11. Relationship to other plans

| Plan | How tool support relates |
|------|---------------------------|
| **rewrite-tie-in-memo.md** | Central tool registry + policy engine; no per-provider special cases; tool results in unified event model → seglog → projections. |
| **newtools.md** | GUI testing tools catalog, **MCP settings in GUI** (Context7, others), MCP config for all providers, cited web search (MCP option). Tool support here; MCP config/GUI there. |
| **storage-plan.md** | Tool invocation/completion events in seglog; tool latency/errors in analytics scan → redb; dashboard/usage rollups. |
| **agent-rules-context.md** | Rules and context injected into every run; tool policy and safe-edit (FileSafe) align with central policy. |
| **orchestrator-subagent-integration.md** | Run config and node/package wiring; **42 subagents** canonical list (§4, subagent_registry); task tool validates subagent_type against this list. MCP and tool flags passed to platform runner from same run-config build. |
| **interview-subagent-integration.md** | Interview phase assignments use the same **42 subagents**; config (framework tools, MCP enabled) drives test strategy and PRD; same MCP/tool config available to interview runs. |
| **FileSafe.md** | Safe-edit and path/URL guards; runs in addition to tool permissions; map to central tool policy and patch/apply/verify pipeline. |
| **usage-feature.md** | Tool usage and cost can be reflected in usage rollups (from seglog/analytics). |
| **LSPSupport.md** | LSP MVP; lsp tool promoted (§3.4, §3.5); diagnostics in context; §9.1. |
| **human-in-the-loop.md** | "Ask" permission and seam-boundary approval; orchestrator ask vs HITL behavior. |
| **Media_Generation_and_Capabilities.md** | SSOT for `capabilities.get` and `media.generate` internal tools (§3.1); response shape, disabled reasons, slot extraction grammar, capability picker dropdown, backend routing, and UI copy. This doc registers the tools; that doc defines their full contracts. |

---

## 12. Implementation checklist (ordered for implementation plan)

Use this list in order to derive a step-by-step implementation plan. Dependencies flow top to bottom.

1. **Config schema** -- Add `tool_permissions` to app config (GuiConfig / redb `config:v1`) per §10.1; validate keys (built-in, MCP/custom, prefix wildcards only).
2. **Default policy table as code** -- Implement §10.2 as single source of truth; subagent overrides (todowrite/todoread deny for subagent runs).
3. **Resolution function** -- Implement §10.3 in order: YOLO → session cache → unknown → exact → wildcard (longest prefix) → granular → default → special guards; deterministic.
4. **FileSafe and YOLO order** -- After allow (or ask approved), run FileSafe before executing; do not emit `tool.denied` for FileSafe blocks (§10.6).
5. **Per-tool adapters** -- Input/output, errors, limits per §3.5; LSP tool with timeout and crash/disconnect handling (§3.5).
6. **Event emission** -- `tool.invoked` (tool_name, run_id, thread_id, latency_ms, success, error) and `tool.denied` (tool_name, run_id, thread_id, reason) per §8.0.
7. **GUI Tool permissions** -- Settings > Permissions (FinalGUISpec §7.4.10); presets per §10.4; load/save `tool_permissions` (§10.5).
8. **Usage widget and rollups** -- Analytics scan → redb `rollups` / `tool_usage.{window}` (§8.4); Usage view §7.8; empty state message.
9. **Central registry and policy engine** -- Registry + policy; single API e.g. `policy.may_execute_tool` (§10.6).
10. **Registry → CLI derivation** -- Single function per platform (§8.3, §10.8).
11. **MCP integration** -- Discovery, namespacing, hide if server fails (§8.7); all providers in GUI.
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
- Plans/OpenCode_Deep_Extraction.md -- Provenance: category → SSOT mapping for upstream OpenCode pattern extraction.
- Plans/00-plans-index.md -- Plan map and rewrite tie-in.

---

*This file is a plan document only. Implementation must follow AGENTS.md (including DRY, platform_specs, Pre-Completion Verification Checklist) and the canonical plans referenced above.*

## Tool Policy Outcome Taxonomy Addendum (2026-03-08)

### 1. Tool-layer outcomes must map into runtime blocked/failure classes

The tool system remains the canonical source of immediate tool-policy decisions, but those decisions must map cleanly into the shared runtime taxonomy.

Required mappings:
- `permission_denied` -> blocked / `permission_denied`
- `user_declined` -> blocked / `user_declined`
- `headless_ask_denied` -> blocked / `headless_ask_denied`
- `filesafe_blocked` -> blocked / `filesafe_blocked`
- `validation_blocked` -> blocked / implementation-specific reason code, not generic failure

### 2. blocked vs failed

If the tool call never executed because policy blocked it, the outcome is blocked/denied, not execution failure.

### 3. Runtime integration

Tool outcomes must carry enough information for runtime recovery UI:
- guard / policy source
- reason code
- recovery options where applicable
- whether the action executed at all

### 4. Acceptance criteria

- Tool-layer policy outcomes map deterministically into the shared runtime taxonomy.
- Non-executed tool calls are not mislabeled as execution failures.
- Recovery-capable blocked outcomes carry enough information for UI/assistant/orchestrator surfaces.
## Tool Denial / Runtime Taxonomy Alignment Addendum (2026-03-09)

Tool-layer refusals that affect execution must collapse into the canonical runtime taxonomy before they reach UI or scheduling layers.

### `tool.denied` requirements
When a denial blocks progress, the tool event MUST include or map to:
- `blocked_reason_code`
- `failure_class` when applicable
- effective permission snapshot identifier
- `allowed_action_ids[]`
- `headless_denied` flag when the denial was caused by mode limitations
- side-effect metadata when the denial concerns remote mutation

### No silent fallback rule
Tools MUST NOT return success-shaped fallbacks for denied work. The denial must remain inspectable as a blocked outcome so the scheduler, chat, and GUI can offer the correct recovery path.
## Tool Denial and Runtime Action Reconciliation Addendum (2026-03-09)

Tool-layer refusals that affect execution MUST collapse into canonical runtime blocked semantics before reaching orchestration or UI layers.

Runtime-facing blocked payloads from tool denials MUST expose:
- `blocked_reason_code`
- `failure_class?`
- `allowed_action_ids[]`
- guard/rule metadata needed to bind the exact UI command
- `executed_at_all` boolean

Runtime-facing tool-denial paths MUST NOT publish a parallel `recovery_options[]` schema.
## Tool Denial Runtime Blocked Payload Consolidation Addendum (2026-03-09)

Tool-layer refusals that affect execution MUST normalize into canonical runtime blocked semantics before UI or scheduler layers consume them.

### Canonical runtime-facing payload
Runtime-facing denial paths MUST expose:
- `blocked_reason_code`
- `allowed_action_ids[]`
- `executed_at_all`
- prerequisite metadata needed to bind the exact recovery command
- `failure_class?` only when the denial followed a classified attempt outcome

### Source mapping rules
- permission-layer denial -> `permission_denied`
- headless interactive denial -> `headless_ask_denied`
- user refusal -> `user_declined`
- FileSafe denial that stops execution -> `filesafe_blocked`
- plugin/tool hook denial that stops execution -> `plugin_hook_blocked`

### No success-shaped fallback rule
Tools MUST NOT convert denied work into success-shaped or generic-failure fallbacks. The blocked state must remain inspectable so scheduler, chat, and GUI surfaces can render the correct recovery path.

## Tool Field Name and Taxonomy Alignment
Tool-originated blocked and denial paths align with the canonical runtime contract.

### Field name correction
Tool-originated blocked payloads use `allowed_action_ids[]` only. Deprecated names MUST NOT appear in new tool contracts.

### Canonical blocked reasons
Tool-denial or post-validation paths use the shared `blocked_reason_code` family, including `validation_blocked` when post-execution validation fails.

### Mutation capability ownership
Each tool definition MUST include `mutation_capable: bool` (default `false`). This remains the source of truth propagated into planning, safe-point, and recovery decisions.

### Recovery contract
Tool-originated blocked paths:
- MUST NOT invent tool-private action arrays outside the canonical runtime action family
- MUST preserve the blocked state rather than converting it into success-shaped fallback output
- MUST carry prerequisite metadata needed to bind the exact recovery command

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/FileSafe.md
