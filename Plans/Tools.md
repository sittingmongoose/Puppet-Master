# Adding Tool Support -- Research & Plan

> **Compliance:** This document follows `Plans/DRY_Rules.md` and references SSOT contracts in `Plans/Contracts_V0.md`. Naming: “Puppet Master” only. No open questions; deterministic defaults per `Plans/Decision_Policy.md`.

**Scope:** This document lives in `Plans/` only. It is the **canonical plan for tool support**: built-in tools, custom tools, **MCP** (integration with the registry and permission model), and the permission model (allow/deny/ask), aligned with [OpenCode's Tools model](https://opencode.ai/docs/tools/). Per-platform MCP config paths and framework-specific testing tools are detailed in **Plans/newtools.md** and AGENTS.md, while live MCP naming/availability/auth-state canon is owned by **Plans/MCP_Integration.md**; this doc defines the tool set, permissions, provider routing, and how MCP fits in.

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
- **MCP** -- MCP tools are **in scope**: they are first-class tools in the central registry; same permission model (including wildcards); naming and precedence with built-in/custom. MCP server config and per-platform config paths are specified in **newtools.md**; live MCP naming, availability, credential, and invalidation vocabulary is specified in **MCP_Integration.md**; here we define how MCP-discovered tools integrate with the registry and policy.
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
- **ask** — User must approve (`deny` / `once` / `for session` / `always`). In headless runs, maps to `deny` unless HITL is enabled.

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
| **assistant-chat-design.md** | YOLO/Regular (§3); canonical approval ladder alignment; bash audit trail and FileSafe. |
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

This section consumes the linked owner contract and stays aligned with it.

Core rules:
- LSP canon must preserve the exact MVP operation inventory, normalized parameter shapes, and result envelope; `workspaceSymbol` must carry `query`, position-based operations use `path` + `position`, and `rename` requires `path` + `position` + `newName` with approval gating.

Fields:
- operation
- query
- path
- position
- newName
- status

Labels and values:
- goToDefinition
- findReferences
- hover
- documentSymbol
- workspaceSymbol
- rename

Rules:
- goToImplementation
- prepareCallHierarchy
- incomingCalls
- outgoingCalls
- ok | partial | unavailable | error
- `workspaceSymbol` requires `query`
- Position-based operations use `path` + `position`.
- `rename` requires `path` + `position` + `newName`.
- `rename` is approval-gated because it applies edits.
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

This section consumes the linked owner contract and stays aligned with it.

Core rules:
- Skill runtime and permission behavior is locked to a structured skill tool envelope, discovery versus auto-invoke readiness rules, dynamic runtime tool descriptions, FileSafe-constrained resource access, and Agent Config ownership.

Fields:
- skill_id
- arguments?
- context?
- content
- source_type
- resource_base_dir?
- resource_entries_sample?
- metadata?
- ready_with_warnings
### 3.5B `question` tool runtime contract

This section consumes the linked owner contract and stays aligned with it.

Core rules:
- Question schema canonical names and enums are locked, including QuestionItem fields, canonical freeform and multi-select field names, and answer source metadata.
- The question tool contract is locked to a multi-question envelope, normalized output statuses, object-array options, included answer source, and top-level orchestrator ownership of user questioning.

Fields:
- mode: "single_question" | "questionnaire"
- questions: Array<QuestionItem>
- status: "answered" | "submitted" | "dismissed" | "timed_out" | "unavailable"
- answers: Array<{question_id, values: string[]}>
- answer_text?
- source?: "option" | "other" | "freeform"
- Headless/HITL-unavailable = `status = "unavailable"`
- Subagent question tool access is DENIED by default

Labels and values:
- questionnaire
- single_question
- unavailable
- dismissed

Rules:
- question_id
- question
- allow_freeform
- multi_select
- default_values?: string[]
- draft_value?: string
- response_kind
- validation_state
### 3.5C `todowrite` and `todoread` runtime contract

This section defines the canonical contract for this surface.

Core rules:
- Plan and Deep Plan must both project to a normalized TODO list, with a named Q&A loop before Deep Plan execution and a locked TODO item schema/status set.
- Plan/TODO persistence is locked to explicit revision states, structural-edit gating after approval, bounded revision history, and emission of `chat.plan_todo_updated` for durable TODO mutations.
- TODO tool behavior is locked so todowrite and todoread use the normalized TODO schema, todowrite is not blanket auto-denied in ask/plan mode, and Deep Plan edits must resync the TODO projection before execution.
- `chat.plan_todo_updated` must have an explicit owner-contract definition for durable normalized TODO mutation, and `todoread` must not survive as a `source_surface` mutation source.

Fields:
- Q&A loop
- todo_id
- title
- summary
- status
- dependencies[]
- owner_hint
- verification_hint
- pending | in_progress | completed | blocked | skipped
- superseded
- draft
- approved
- executing
- completed
- blocked
- Structural edits = adding / removing / reordering TODO items
- chat.plan_todo_updated
- todowrite
- todoread
- todowrite can create, reorder, update statuses/notes
- todoread returns current normalized list for active thread/run
- Remove `todowrite` from blanket `ask/plan` mode auto-deny
- editing Deep Plan markdown (the rich artifact) MUST update the normalized TODO projection BEFORE execution begins
ContractRef: ContractName:Plans/assistant-chat-design.md#8.1 Canonical planning model, ContractName:Plans/storage-plan.md#4.3 Plan and TODO state, ContractName:Plans/Contracts_V0.md#1.1 Assistant worktree seglog events

Labels and values:
- Plan
- Deep Plan
### 3.5D Web operation family runtime contract

This section defines the canonical contract for this surface.

Core rules:
- WebAction is a locked typed interface with an exact action enum, required and optional fields, hard timing limits, sequential execution, and invalid_input on unknown action types.

Fields:
- `type: "click" | "scroll" | "type" | "press_key" | "wait_for" | "navigate" | "screenshot" | "set_viewport" | "fill_form" | "select_option" | "back" | "reload" | "snapshot" | "console" | "network";`
- `selector?: string`
- `value?: string`
- `timeout_ms?: number`
- `description?: string`
- `timeout_ms` defaults to 5000ms; max 30000ms; total across all actions capped at 30s
- Unknown `type` values → `invalid_input` error
- Actions are executed sequentially in array order

Labels and values:
- Firecrawl
- websearch
- webfetch
- webextract
- webresearch
- webcrawl
- webmap

#### `webfetch`

This section defines the canonical contract for this surface.

Core rules:
- webfetch URL handling is locked: reject non-HTTP(S) schemes, normalize before routing, default bare domains to https://, reject malformed URLs with invalid_input, and enforce a default 5 MB max_content_length unless configured otherwise.

Rules:
- reject non-HTTP(S) schemes
- invalid_input
- normalize URL before routing
- default to `https://` if bare domain
- reject malformed URLs
- `max_content_length`
- 5 MB default
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

MCP canon is owned by `Plans/MCP_Integration.md`. This section is a consumer cross-reference for tool-registry and permission integration only.

ContractRef: ContractName:Plans/MCP_Integration.md, ContractName:Plans/Permissions_System.md, ContractName:Plans/storage-plan.md

Consumer rules:
- requested versus effective MCP availability is resolved through the owner document; this section does not redefine it
- credential binding and invalidation semantics are owner-defined in `Plans/MCP_Integration.md`
- tool names use the underscore-only form `{server_slug}_{tool_name}`
- slash-separated aliases are not canonical and must not remain live examples
## 6. Ways to add tools (implementation angles)

| Mechanism | What it adds | Where it's configured | Notes |
|-----------|--------------|------------------------|-------|
| **MCP server** | New tools/resources/prompts from one server | Per-platform MCP config (see §7) | Single MCP server can expose many tools. Context7 and GUI automation remain representative examples; search/provider canon stays in the owner docs. |
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
- **Cited web search:** Prefer one MCP server (e.g. server slug `websearch-cited`, default tool name `websearch_cited`) registered centrally like Context7 when this historical integration path is still enabled. Derived adapters for `CliBridge` providers only. Tool results MUST normalize to the live web/provenance contracts owned by `Plans/Tools.md`, `Plans/Contracts_V0.md`, `Plans/storage-plan.md`, and `Plans/assistant-chat-design.md` before reaching chat/interview/orchestrator consumers.

---

## 8. Implementation details and technical notes

### 8.0 Event payloads (seglog)
Blocked and denied tool packets expose the shared runtime-facing blocked payload.

Required fields:
- `blocked_sequence`
- `approval_scope_key`
- `action_available`
- `escalation_level`

Canonical events:
- `tool.invoked`
- `tool.denied`

Escalation ladder:
- `info`
- `warning`
- `attention_required`
- `blocked`
- `system_notification`

Rules:
- Tool payloads keep blocked identity and action availability discoverable.
- The same escalation ladder is reused across tools, approvals, and blocked runtime surfaces.
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

MCP tool names use the owner-defined underscore-only format `{server_slug}_{tool_name}`.

ContractRef: ContractName:Plans/MCP_Integration.md

Rules:
- wildcard rules match the underscore form, for example `context7_*`
- slash variants and mixed `_` / `/` examples are retired
- server-level permission rules still apply before per-tool wildcard expansion
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
| **webfetch / websearch abuse** | Agent could request excessive or sensitive URLs/queries. | FileSafe URL allowlist/denylist; optional query rate limit; don't log full query/URL in plaintext; keep audit/provenance disclosure aligned with the shared web contracts instead of ad hoc cited-search wording. |
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

Canonical defaults are owned by `Plans/Permissions_System.md` §7. This consumer summary keeps the tool-registry view aligned to that owner table.

ContractRef: ContractName:Plans/Permissions_System.md

| Tool family | Default |
|---|---|
| `skill` | `allow` |
| `question` | `allow` only when HITL is available; otherwise `ask` |
| `websearch`, `webfetch`, `webextract`, `webresearch`, `webcrawl`, `webmap` | `ask` |
| `batch_webfetch`, `batch_webextract` | `ask` |
| `todoread`, `todowrite` | `allow` |
| child-agent `question` | `deny` |
### 10.3 Resolution algorithm

Canonical algorithm: `Plans/Permissions_System.md` §8. Summary: Mode override → Session cache → Persona overrides → Project rules → Global rules → Defaults → Special guards. Post-resolution, FileSafe applies (§10.6).

### 10.4 Presets → config mapping

Preset semantics are owned by `Plans/Permissions_System.md` §10.4. This section preserves the tool-registry mapping without restating conflicting policy.

ContractRef: ContractName:Plans/Permissions_System.md

| Preset | Tool-facing effect |
|---|---|
| `read_only` | read/search/list style tools stay available; mutation stays denied |
| `plan` | planning helpers stay available, read-only web tools remain `ask`, and no preset silently auto-denies the whole web family |
| `full` | broad availability with explicit asks on mutation-capable tools |

Child-agent denial of `question` is architectural and remains in force even when the parent preset is broader.
### 10.5 GUI ↔ config serialization

The Permissions GUI is specified in `Plans/Permissions_System.md` §10 and `Plans/FinalGUISpec.md` §7.4.10. The tool registry supplies the list of known tool names (built-in + MCP-discovered) to populate the GUI's per-tool list.

### 10.6 FileSafe integration order and API

- **Canonical order owner:** `§8.2` is the authoritative dispatch sequence. This subsection is an API summary only and MUST NOT be read as a competing order definition.
ContractRef: ContractName:Plans/Permissions_System.md, ContractName:Plans/FileSafe.md, ContractName:Plans/Executor_Protocol.md
- **Single API (recommended):** `policy.may_execute_tool(tool_name, invocation_context) -> Result<Allow | Deny(reason) | Ask, Error>` remains the permission entrypoint within that sequence. Runner code calls it before any underlying tool implementation is invoked.
- **FileSafe contract:** FileSafe exposes e.g. `check_bash_command(cmd)`, `check_write_path(path)`, `check_read_path(path)`. For file-affecting or shell-affecting tools, FileSafe runs on normalized arguments inside the canonical `§8.2` flow; hook-mutated arguments trigger the required re-checks before dispatch.

### 10.7 Ask-flow runner notes

Ask-flow semantics (`deny`/`once`/`for session`/`always`) are defined in `Plans/Permissions_System.md` §6. Implementation notes for the runner:

- **Assistant (interactive):** When policy returns **ask**, surface a **pending approval** to the UI with `{ tool_name, invocation_summary, options: deny | once | for session | always }`. See `Plans/Permissions_System.md` §6 for response semantics.
- **Orchestrator / Interview (headless):** Map `ask` → `deny`, or to **pending-HITL** if HITL is enabled (`Plans/human-in-the-loop.md`).

### 10.7A Web-operation approval summary rules

Runner and UI integrations MUST preserve the owner semantics from `Plans/Permissions_System.md#3.4A Web-operation permission-key derivation`.

- `websearch summary shows tool name + query preview`
- `webfetch/webextract summary shows tool name + target host/URL`
- `webresearch summary shows tool name + task summary + estimated source count when available`
- `webcrawl/webmap summary shows tool name + root URL + page/depth caps`
- `Approving webcrawl For Session auto-approves crawl/map/extract/fetch for the same host pattern`
- `Approving webresearch For Session does NOT create broad allow for unrelated tools`
- `MVP uses wildcard session approval for search/research; advanced query-pattern support is future only`

ContractRef: ContractName:Plans/Permissions_System.md#3.4A Web-operation permission-key derivation, ContractName:Plans/FinalGUISpec.md

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
- question default `allow` only when HITL is available

ContractRef: ContractName:Plans/Permissions_System.md
## 11. Relationship to other plans

| Plan | How tool support relates |
|------|---------------------------|
| **rewrite-tie-in-memo.md** | Central tool registry + policy engine; no per-provider special cases; tool results in unified event model → seglog → projections. |
| **newtools.md** | GUI testing tools catalog, per-platform MCP config paths, and non-owning GUI/settings alignment notes. Tool support, routing, and provenance canon stay here and in the owner docs. |
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
- [Model Context Protocol -- Specification (latest)](https://modelcontextprotocol.io/specification/latest) -- MCP spec; PM naming/availability/auth-state canon is captured in `Plans/MCP_Integration.md`.
- AGENTS.md -- Platform CLI commands, MCP/config notes, DRY (platform_specs, widget catalog).
- REQUIREMENTS.md -- Platform tool flags, MCP probe, verification adapters, tooling rules.
- Plans/newtools.md -- GUI testing tools, per-platform MCP config paths, and non-owning GUI/settings alignment notes.
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

## 10. Firecrawl provider integration

Firecrawl is a distinct provider in PM's web stack. This owner section covers configuration, endpoint mapping, async behavior, interact-session flow, credit disclosure, change-tracking behavior, and Firecrawl-specific routing rules. Consumer summaries in other docs defer to this section and to the contract-owned payload fields in `Plans/Contracts_V0.md`.

ContractRef: ContractName:Plans/CLI_Bridged_Providers.md, ContractName:Plans/Models_System.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Contracts_V0.md

### 10.1 Provider configuration

This section defines the canonical contract for this surface.

Core rules:
- The Firecrawl configuration field set must preserve proxy_mode with the exact supported enum values and the self-hosted Fire Engine limitation note.
- The Firecrawl owner section must preserve the base configuration fields and default-disabled state already restored in the live owner doc.
- Firecrawl provider identity canon includes exact provider ID firecrawl, display name Firecrawl, default priority below Exa and Tavily and above DuckDuckGo, user-adjustable ordering, default-disabled state until API key or self-hosted URL is configured, and retirement of exact stale residue "stale cited-search framing and older `newtools` wording" from owner/provider canon.

Fields:
- proxy_mode
- basic
- enhanced
- auto
- Fire Engine
- enabled
- api_key
- base_url
- timeout_ms
- cache_enabled
- Firecrawl is disabled by default until explicitly enabled in Settings

Labels and values:
- Firecrawl
- websearch
- webfetch
- webextract
- webresearch
- webcrawl
- webmap

Rules:
- Provider ID
- `firecrawl`
- Display name
- `Firecrawl`
- Default priority
- below Exa, Tavily; above DDG (user-adjustable)
- Default state
- disabled (requires API key or self-hosted URL)
### 10.2 Endpoint inventory

This section defines the canonical contract for this surface.

Core rules:
- The Firecrawl owner section must preserve the exact endpoint inventory.

Labels and values:
- Firecrawl
- websearch
- webfetch
- webextract
- webresearch
- webcrawl
- webmap

Rules:
- /v2/scrape
- /v2/crawl
- /v2/map
- /v2/search
- /v2/extract
- /v2/batch/scrape
- /v2/agent

### 10.3 PM-to-Firecrawl mapping

This section defines the canonical contract for this surface.

Core rules:
- The Firecrawl webextract mapping must preserve structured extraction modes and option surface, not a thin single-URL summary.
- The Firecrawl webresearch mapping must preserve provider-native no-URL research behavior, navigation/forms/pagination capability, and structured extraction during agent-led research.
- The Firecrawl websearch mapping must preserve provider-specific search behavior and option surface.
- The Firecrawl owner section must either preserve `changeTracking` with its structured output shape or explicitly retire it as out of scope; it must not disappear silently.
- The Firecrawl mapping table must preserve all PM operation rows, including the exact batch_webextract mapping POST /v2/extract with urls[].
- Firecrawl search responses must be transformed into PM's unified search result shape by flattening source-partitioned results into one results array and tagging each item with source_type in a fixed merge order.

Fields:
- webextract
- JSON Schema support
- prompt-driven extraction behavior
- URL wildcards
- enableWebSearch
- webresearch
- no-URL natural-language research
- navigation/forms/pagination capability
- structured extraction behavior during provider-native research
- Serper-backed Google-result behavior
- sources
- categories
- optional result scraping behavior in Firecrawl `websearch`
- changeTracking.status
- changeTracking.previous_content_ref
- changeTracking.diff_summary_ref
- changeTracking.checked_at_utc
- Response transformation
- Adapter MUST flatten into PM's unified `results` array
ContractRef: ContractName:Plans/Contracts_V0.md#3.4 Tool-specific payload extensions, ContractName:Plans/storage-plan.md#4.4 Activity transparency payloads
- tagging each item with `source_type`
- Merge order: web results first, then news, then images

Labels and values:
- Firecrawl
- websearch
- webfetch
- webcrawl
- webmap

Rules:
- changeTracking { status: changed | unchanged | no_previous_version, previous_content_ref?, diff_summary_ref?, checked_at_utc }
- change_status: 'new' | 'same' | 'changed' | 'removed'
- pages[].change_status
- change_summary
- explicit out-of-scope retirement if `changeTracking` is not MVP
- no silent disappearance of the capability
- batch_webfetch
- batch_webextract
- POST /v2/extract
- urls[]
### 10.4 Async jobs and status contract

This section defines the canonical contract for this surface.

Core rules:
- The Firecrawl async contract must preserve timeout behavior tied to timeout_ms and partial-result survival on timeout.
- Long-running web operations must preserve the structured progress_event payload and cancellation-with-partial-results contract.
- The Firecrawl async contract must preserve the exact poll ladder and status family already restored in the owner section.

Fields:
- timeout_ms
- timeout when polling exceeds `timeout_ms`
- partial results survive timeout if already materialized
- progress_event
- tool_use_id
- operation
- phase
- detail
- pages_completed
- pages_total
- elapsed_ms
- estimated_remaining_ms
- cancelled: true
- 2s, 4s, 8s, 15s, 30s
- scraping
- processing
- completed
- failed
- cancelled

Labels and values:
- Firecrawl
- websearch
- webfetch
- webextract
- webresearch
- webcrawl
- webmap
### 10.5 Credit and cost contract

This section defines the canonical contract for this surface.

Core rules:
- Routing must remain cost-aware when multiple providers offer similar capability; static priority alone is insufficient, and the >100 credits warning plus 500 credits cap must remain aligned with routing.
- The Firecrawl credit and disclosure contract must preserve the warning threshold, hard cap, and self-hosted billing exception already restored in the owner section.

Labels and values:
- Firecrawl
- websearch
- webfetch
- webextract
- webresearch
- webcrawl
- webmap

Rules:
- cost-aware selection when providers offer similar capability
- >100 credits
- 500 credits
- cost-aware selection
- static priority alone is insufficient
- self-hosted Firecrawl does not use credit billing
### 10.6 Interact-session contract

Firecrawl supports a stateful browser session built on `/v2/scrape/{scrapeId}/interact`.

Session flow:
1. `POST /v2/scrape { url }` returns a `scrapeId` in metadata.
2. `POST /v2/scrape/{scrapeId}/interact { prompt | code }` resumes the same browser session.
3. Multiple interact calls reuse session state including DOM, cookies, and scroll position.
4. `DELETE /v2/scrape/{scrapeId}/interact` terminates the session and releases provider resources.

Interaction modes and session properties:
- prompt-based interaction is natural-language driven and maps well to PM's higher-level action intent.
- code-based interaction is an adapter-internal precision path; PM does not expose raw provider code execution as a first-class user tool surface.
- sessions default to a 10-minute TTL with a 5-minute inactivity timeout.
- responses may include `liveViewUrl` and `interactiveLiveViewUrl`.
- PM does not surface those URLs as first-class MVP UI because PM owns the browser surface directly.

ContractRef: ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md, ContractName:Plans/Tools.md#3.5D-web-operation-family-runtime-contract

### 10.7 Audit, error, and self-hosted rules

This section defines the canonical contract for this surface.

ContractRef: Plans/FinalGUISpec.md#15.7 Permission approval card widget, Plans/Contracts_V0.md#3.4 Tool-specific payload extensions, Plans/storage-plan.md#4.4 Activity transparency payloads, Plans/Permissions_System.md#3.4A Web-operation permission-key derivation, Plans/Contracts_V0.md#3.4A Web error taxonomy and applicability

Core rules:
- Preserve the Firecrawl-specific audit payload keys as exact contract-owned fields.
- PM must not silently switch between self-hosted Firecrawl and hosted/cloud Firecrawl, and deployment-mode disclosure must remain visible.
- The Firecrawl owner section must preserve shared routing/audit disclosure for requested/effective provider selection, fallback visibility, denied-web projection, and canonical web error taxonomy linkage.
- Web tool permission keys, approval-card summary templates, session-approval semantics, and their exact approval-card cross-reference target remain canonical in Permissions_System and must not be re-invented from thin tool descriptions or stale Ask UI links.
- The per-contract web error applicability table remains required canon and must stay aligned with provider-to-PM error mapping.
- Activity transparency payloads must preserve adapter-selection and projection fields used for routing and audit disclosure.
- Permission canon must preserve the four-tier approval ladder, question default allow only when HITL is available, keep the six web tools ask-gated in read_only and plan presets, and carry the blocked/unavailable payload fields through to permission-card consumers.
- Firecrawl-specific HTTP and provider errors must map to PM canonical error codes exactly as specified.

Fields:
- firecrawl_credits_used
- firecrawl_cache_state
- firecrawl_scrape_id
- requested_adapter_id
- effective_adapter_id
- adapter_selection_reason
- provider_fallback_summary
- warnings_count
- error_code
- projection_freshness
- projection_health
- HTTP 401/403 → `adapter_unavailable`
- HTTP 429 → `rate_limited`
- HTTP 402 → `rate_limited`
- HTTP 500/502/503 → `adapter_unavailable`
- Timeout → `timeout`
- HTTP 404 → `content_not_found`
- HTTP 400 → `invalid_input`
- "Blocked by robots.txt" → `crawl_robots_blocked` or `content_blocked`
- "Content too large" → `content_too_large`

Labels and values:
- Firecrawl
- websearch
- webfetch
- webextract
- webresearch
- webcrawl
- webmap

Rules:
- PM MUST NOT silently switch between self-hosted Firecrawl and hosted/cloud Firecrawl
ContractRef: Plans/Permissions_System.md#3.4A Web-operation permission-key derivation
ContractRef: ContractName:Plans/FinalGUISpec.md#15.7 Permission approval card widget, ContractName:Plans/Contracts_V0.md#3.4 Tool-specific payload extensions, ContractName:Plans/storage-plan.md#4.4 Activity transparency payloads, ContractName:Plans/Contracts_V0.md#3.4A Web error taxonomy and applicability
- no silent switch between self-hosted Firecrawl and hosted/cloud Firecrawl
- deployment-mode disclosure remains visible
- self-hosted Firecrawl does not use hosted credit billing
- tool.denied
- tool.invoked
- websearch summary shows tool name + query preview
- webfetch/webextract summary shows tool name + target host/URL
- webresearch summary shows tool name + task summary + estimated source count when available
- webcrawl/webmap summary shows tool name + root URL + page/depth caps
- Approving webcrawl For Session auto-approves crawl/map/extract/fetch for the same host pattern
- Approving webresearch For Session does NOT create broad allow for unrelated tools
- MVP uses wildcard session approval for search/research; advanced query-pattern support is future only
- adapter_unavailable
- unsupported_operation
- content_blocked
- content_not_found
- unsupported_source
- extraction_schema_mismatch
- autonomous_budget_exceeded
- no_previous_version
- deny
- once
- for session
- always
- question default `allow` only when HITL is available
- read_only
- plan
- blocked_reason_code
- allowed_action_ids[]
- status: "unavailable"
## 11. Provider capability matrix

### 11.1 Provider classes, defaults, and fallback disclosure

This section defines the canonical contract for this surface.

Core rules:
- The global provider stack is user-changeable in Settings, while per-operation priority reordering is not MVP and the MVP priority order must not be treated as immutable product policy.
- The provider capability matrix must preserve capability tier separately from routing posture: Firecrawl, Tavily, and Exa retain real webfetch capability and must not be flattened to fallback-only merely because Site Reader is preferred.
- Anthropic and OpenAI websearch support must remain labeled native (model) / model-native, not pm-composed.
- DuckDuckGo capability rows must preserve native-ish search, PM-composed research/fetch/extract, and partial crawl behavior instead of flattening those cells to unsupported.
- Google must remain a pluggable adapter slot with display label Google, and its ledger support semantics must not be collapsed away.
- GUI/help canon must preserve row-level health/error disclosure, last-failure messaging, inline contextual help, and availability/support-tier visibility in Settings and /web help/autocomplete.
- Retire stale cited-search ownership residue from reference sections; provider-capability and web-routing canon is owned by Plans/Tools.md sections 11-12, while Plans/newtools.md#8.2.1 is non-normative consumer guidance only.
- Firecrawl provider identity canon includes exact provider ID firecrawl, display name Firecrawl, default priority below Exa and Tavily and above DuckDuckGo, user-adjustable ordering, default-disabled state until API key or self-hosted URL is configured, and retirement of exact stale residue "stale cited-search framing and older `newtools` wording" from owner/provider canon.

Labels and values:
- Firecrawl
- websearch
- webfetch
- webextract
- webresearch
- webcrawl
- webmap

Rules:
- global provider stack is user-changeable in Settings
- per-operation priority reordering is NOT MVP
- global MVP provider priority is not immutable product policy
- Firecrawl `webfetch` capability is not erased by Site Reader primacy
- Tavily `webfetch` capability is not erased by Site Reader primacy
- Exa `webfetch` capability is not erased by Site Reader primacy
- fallback-only
- Anthropic/OpenAI `websearch` support is `native (model)` / model-native, not `pm-composed`
- native (model)
- pm-composed
- DuckDuckGo `websearch` is `native-ish`
- DuckDuckGo `webresearch` is `pm-composed`
- DuckDuckGo `webfetch` / `webextract` remain PM-composed or partial rather than flattened to `unsupported`
- DuckDuckGo partial crawl behavior must not disappear
- display label `Google`
- Google is a pluggable adapter slot
- Google official search is not a strategic backend
- Google `webfetch` keeps the pm-composed support semantics from the ledger
- row-level health/error disclosure
- last-failure messaging
- contextual help text
- availability plus support-tier visibility in Settings
- availability plus support-tier visibility in `/web` help/autocomplete
- Provider ID
- `firecrawl`
- Display name
- `Firecrawl`
- Default priority
- below Exa, Tavily; above DDG (user-adjustable)
- Default state
- disabled (requires API key or self-hosted URL)
### 11.2 Support-tier vocabulary

Support tiers are:
- `native` - provider exposes the operation as a first-class path that PM can map directly.
- `native (model)` - the selected model/provider already exposes the capability and PM reuses the same account/auth surface.
- `native-ish` - provider has a near-equivalent path but PM still normalizes or supplements it.
- `pm-composed` - PM assembles the behavior from lower-level provider/search/fetch capabilities.
- `fallback-only` - provider path exists only as backup and is not the preferred posture.
- `partial` - provider supports only a reduced subset of the operation family.
- `unsupported` - no supported path exists in MVP.

Capability tier and routing posture are separate dimensions. Site Reader primacy for `webfetch` is a routing rule, not a capability erasure.

ContractRef: ContractName:Plans/Models_System.md, ContractName:Plans/assistant-chat-design.md

### 11.3 Capability matrix

| Operation | Exa | Tavily | Firecrawl | Anthropic / OpenAI | Google | DuckDuckGo |
|---|---|---|---|---|---|---|
| `websearch` | `native` | `native` | `native` | `native (model)` | `native` | `native-ish` |
| `webfetch` | `native-ish` | `native-ish` | `native-ish` | `fallback-only` | `pm-composed` | `pm-composed` |
| `webextract` | `native-ish` | `native` | `native` | `pm-composed` | `unsupported` | `pm-composed` |
| `webresearch` | `native-ish` | `native` | `native` | `pm-composed` | `pm-composed` | `pm-composed` |
| `webcrawl` | `native` | `native` | `native` | `unsupported` | `unsupported` | `partial` |
| `webmap` | `unsupported` | `native` | `native` | `unsupported` | `unsupported` | `unsupported` |

Matrix interpretation:
- Firecrawl `webfetch` capability is not erased by Site Reader primacy.
- Tavily `webfetch` capability is not erased by Site Reader primacy.
- Exa `webfetch` capability is not erased by Site Reader primacy.
- Anthropic/OpenAI `websearch` support is `native (model)` / model-native, not `pm-composed`.
- DuckDuckGo `websearch` is `native-ish`; DuckDuckGo `webresearch` is `pm-composed`; DuckDuckGo `webfetch` / `webextract` remain PM-composed rather than flattened to `unsupported`; DuckDuckGo partial crawl behavior remains visible.
- the display label is `Google`; it is a pluggable adapter slot, not a strategic backend requirement, and Google `webfetch` keeps the `pm-composed` support semantics.
- `fallback-only` is reserved for true backup-only paths and must not replace real fetch capability where the provider has a real fetch path.
- model-native rows reuse the already-selected model account/auth when that provider exposes search or browse capability; PM does not create a second auth silo for the same model account.

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/FinalGUISpec.md
## 12. Web tool routing algorithm

This section defines the canonical contract for this surface.

ContractRef: ContractName:Plans/storage-plan.md#4.4 Activity transparency payloads, ContractName:Plans/Contracts_V0.md#3.4 Tool-specific payload extensions, ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md#3.18 Built-in Browser and Click-to-Context

Core rules:
- The web routing algorithm must include a capability-unavailable terminal branch with clear setup guidance when no provider supports the requested operation.
- Site Reader canon must require real browser interaction, reserve `Reading Site` for the PM-native Site Reader path, and prevent provider-routed fetch from reusing that reserved identity.
- Answer construction must preserve search-then-read behavior, final citations must come from the actual read path rather than raw search snippets alone, and web activity/provenance docs must use the exact storage/contracts/browser ContractRef targets instead of malformed generic anchors.
- Routing must remain cost-aware when multiple providers offer similar capability; static priority alone is insufficient, and the >100 credits warning plus 500 credits cap must remain aligned with routing.
- Retire stale cited-search ownership residue from reference sections; provider-capability and web-routing canon is owned by Plans/Tools.md sections 11-12, while Plans/newtools.md#8.2.1 is non-normative consumer guidance only.
- Natural-language web intents must hit the same dispatcher as slash commands, and site or page reading intents must resolve to webfetch rather than websearch or provider extract.

Fields:
- intent phrase
- resolved tool key

Labels and values:
- Firecrawl
- websearch
- webfetch
- webextract
- webresearch
- webcrawl
- webmap

Rules:
- capability-unavailable terminal branch
- clear setup guidance when no provider supports the requested operation
- Site Reader v1 requires real browser-interaction capability, not static HTTP fetch only
- Reading Site
- provider-routed fetch must not reuse the reserved native Site Reader identity
- search-then-read behavior
- final citations come from the actual read path
- raw search snippets alone are not enough provenance for the final answer
- cost-aware selection when providers offer similar capability
- >100 credits
- 500 credits
- cost-aware selection
- static priority alone is insufficient
- NL intents and slash commands hit the same dispatcher
- "search the web for X" → `websearch`
- "extract this page" → `webextract`
- "read this URL" → `webfetch`
- "research topic" → `webresearch`
- Reading intents MUST resolve to `webfetch`, not `websearch`
ContractRef: ContractName:Plans/storage-plan.md#4.4 Activity transparency payloads, ContractName:Plans/Contracts_V0.md#3.4 Tool-specific payload extensions, ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md#3.18 Built-in Browser and Click-to-Context
- chat may shortlist with search but must read chosen pages before citing them as final evidence
- site/page reading is not search
- dispatcher parity applies to slash and NL paths
- command tables and routing docs must mirror the same mappings
## 13. Batch operations

This section defines the canonical contract for this surface.

Core rules:
- Batch semantics must preserve the explicit false branch for continue_on_error.
- Batch audit/event canon must preserve a parent audit event for the batch plus child audit events per URL.
- Batch approval and timeout behavior already restored in section 13 must survive unchanged.
- Batch webfetch canon includes exact batch inputs, concurrency limits, shared-host permission flow, and the locked batch timeout formula.

Fields:
- continue_on_error: false
- stop on the first failure
- return completed results plus failure detail
- parent audit event for the batch
- child audit events per URL
- tool.invoked
- continue_on_error

Labels and values:
- Firecrawl
- websearch
- webfetch
- webextract
- webresearch
- webcrawl
- webmap

Permission rules:
- single confirmation prompt showing all unique domains in the batch
- For Session grants all listed domains for that session

Rules:
- one approval prompt covers the full batch and lists all unique domains in scope
- For Session grants the listed domains for that session
- individual_timeout × min(url_count, 5)
- 600s
- `urls: string[]` (required; min 1, max 50)
- `concurrency?: number` (default 3; max 10
- `continue_on_error?: boolean` (default true
- "For Session" grants all listed domains for that session
- Batch-level timeout is LOCKED as `individual_timeout × min(url_count, 5)`, cap 600s (10 min)
## 14. Web content caching layer

This section defines the canonical contract for this surface.

ContractRef: Plans/storage-plan.md#4.4 Activity transparency payloads, Plans/storage-plan.md#8. Web content caching persistence

Core rules:
- The PM-owned web cache contract must preserve two-phase lookup, state vocabulary, and per-project cache sizing.
- Cache routing must skip read-time cache for requests with actions, may still store the post-action result, and must preserve PM-cache precedence over Firecrawl cache with diff-reuse audit states.

Fields:
- hit
- miss
- bypassed
- expired_used_for_diff
- normalized_url
- formats_hash
- adapter_id
- 500 MB

Labels and values:
- Firecrawl
- websearch
- webfetch
- webextract
- webresearch
- webcrawl
- webmap

Rules:
- If request includes `actions`, skip cache entirely (always fresh-execute)
- Cache STORE still applies to the final result after actions execute
- PM cache takes precedence for serving cached content
- Firecrawl cache serves as provider-side optimization only
- `cache_state: "hit" | "miss" | "bypassed" | "expired_used_for_diff"`
