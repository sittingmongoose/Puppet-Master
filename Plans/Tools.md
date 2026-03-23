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

- **Session (Assistant):** `always` approval inserts a session-scoped allow rule; does not persist across restarts. See `Plans/Permissions_System.md` §6.2.
- **Run (Orchestrator/Interview):** Permissions are fixed from run config at start; no interactive ask unless HITL is enabled at tier boundaries (`Plans/human-in-the-loop.md`).
- **Subagents:** `todowrite` and `todoread` default to **deny** for subagent runs. Run config may override. All other tools use the default table (`Plans/Permissions_System.md` §7).

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
| **webextract** | Extract a target page/site | `webextract` | Targeted site/page extraction with audit visibility. |
| **webresearch** | Run multi-source web research | `webresearch` | Research synthesis with explicit provenance and support-tier disclosure. |
| **webcrawl** | Crawl a site or section | `webcrawl` | Multi-page crawl; bounded by permission and fan-out limits. |
| **webmap** | Map site structure | `webmap` | Site-structure discovery with bounded traversal. |
| **question** | Ask the user structured questions during execution | `question` | Supports both single-question and multi-question questionnaire flows. Only meaningful when HITL/UI can show prompts. |
| **skill** | Load a skill (e.g. SKILL.md) into the conversation | `skill` | Path or name → content; validate path is under allowed roots. |
| **todowrite** | Create/update normalized plan TODO state during the session | `todowrite` | Uses the canonical normalized TODO schema. Subagent default: deny unless explicitly re-enabled. |
| **todoread** | Read current normalized plan TODO state | `todoread` | Returns the canonical normalized TODO schema. Subagent default: deny unless explicitly re-enabled. |
| **lsp** (MVP) | LSP read/navigation operations plus approval-gated rename | `lsp` | No feature flag; available when LSP client is enabled. Canonical read operations include definition, references, hover, document/workspace symbol, implementation, and call hierarchy. See §3.4.1 and §3.5E. |
| **task** | Launch subagents (matches subagent type) | `task` | **subagent_type** must be one of the **canonical 42 subagents** documented in Plans (orchestrator-subagent-integration.md §4, interview-subagent-integration.md). Validate with subagent_registry; see §3.6. |
| **chatsearch** | Search project chat history (threads/messages) via Tantivy chat index | `chatsearch` | Project-only scope; supports filters (thread_id/time); result/hit limits per §3.5. Used for agent search + auto retrieval. |
| **codesearch** | Code search within the **project workspace / project root** | `codesearch` | MVP backend is multi-tier: Tantivy code index + LSP workspace/symbol + ripgrep fallback. Result and timeout limits per §3.5. |
| **logsearch** | Search project log summaries (runs/tools/bash) via Tantivy logs index | `logsearch` | Project-only; returns summaries + refs (event_id/blob_ref). Use `logread` for full payload. |
| **logread** | Read full log payload referenced by `logsearch` | `logread` | Subject to stricter permissions + size caps; prefer summaries in-chat; full payload is expandable/collapsible. |
| **repo.import** | Import an external repo into the project workspace (e.g. GitHub) | `repo.import` | Requires explicit user intent; governed by network + external_directory + GitHub auth rules; produces audit entry. See assistant-chat-design.md §7.4. |
| **capabilities.get** | Return all available capabilities (media + provider-tool) with enablement status, disabled reasons, and setup hints | `capabilities.get` | Internal tool; not forwarded to providers. Default allow (§10.2). Full contract: `Plans/Media_Generation_and_Capabilities.md` [§1](Plans/Media_Generation_and_Capabilities.md#CAPABILITY-SYSTEM). |
| **media.generate** | Generate media (image / video / tts / music) via structured request envelope with optional per-request model override | `media.generate` | Internal tool; backed by Gemini API key (or Cursor-native for images). Default ask (§10.2). Full contract: `Plans/Media_Generation_and_Capabilities.md` [§2](Plans/Media_Generation_and_Capabilities.md#MEDIA-GENERATE). |

ContractRef: ToolID:capabilities.get, ToolID:media.generate, ContractName:Plans/Media_Generation_and_Capabilities.md

> **Internal tools vs provider-exposed tools:** `capabilities.get` and `media.generate` are **Puppet Master internal tools** — they execute inside the Puppet Master process and are never forwarded to a provider CLI or server. In `capabilities.get` output, the `provider_tool` category is the umbrella non-media bucket and includes both provider-exposed tools (e.g., OpenCode tools discovered via `GET /provider`) and existing internal tool capabilities (e.g., read/grep/write/task). These non-media tool capabilities are **not** part of the media capability picker dropdown (§4.1 of `Plans/Media_Generation_and_Capabilities.md`), which shows only the four `media.*` capabilities. Permission and policy for all tool categories (internal, built-in, provider-exposed, MCP, custom) use the same model defined in `Plans/Permissions_System.md`.

ContractRef: ToolID:capabilities.get, ContractName:Plans/Media_Generation_and_Capabilities.md#CAPABILITY-PICKER, ContractName:Plans/Permissions_System.md

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
3. Assistant approval flow (or HITL at tier boundary in Orchestrator) presents "Apply rename?"; on approve, apply via `workspace/applyEdit` (FileSafe). On reject, return `{ "status": "rejected" }` to the agent.

So: read/navigation operations return results directly; **rename** returns `pending_approval` and actual apply is only after user approval.

**Integration with LSP client:** Tool implementation calls the same LSP client as the editor (e.g. `src/lsp/client.rs`). Client must expose the canonical read/navigation calls plus `get_rename_edits(uri, position, new_name)`. Apply **request timeout** (default 10s; config key e.g. `lsp.toolTimeoutMs` in implementation). On timeout or error, return a structured error to the agent.

**Optional LSP sub-operations (post-MVP):** `lsp.format` (textDocument/formatting, rangeFormatting) and `lsp.code_action` (textDocument/codeAction → workspace/applyEdit) can be added so agents can "format file X" or "apply quick fix"; both write buffers and should require **ask** (or user approval). See Plans/LSPSupport.md §9.1.

### 3.5 Per-tool semantics (I/O, errors, limits)
### 3.5A `skill` tool runtime contract

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

The `skill` tool is the canonical on-demand runtime skill access mechanism.

Rules:
- it resolves skills by canonical skill id from the registry
- permission checks apply before returning skill content
- it complements, but does not replace, context bundling performed by the context compiler
- it does not require provider-native skill installation to function in MVP

ContractRef: ContractName:Plans/Skills_System.md, ContractName:Plans/FileSafe.md, ContractName:Plans/Prompt_Pipeline.md

#### 3.5.A Additional semantics: chatsearch / logs / repo import and codesearch multi-tier (MVP)

This subsection supplements the per-tool table below with required behavior for new MVP tools and multi-tier search backends.

**chatsearch (project chat index)**
- **Input:** `query: string`, optional `filters: { thread_id?, time_range? }`, `k?: number`.
- **Output:** hits with `{ thread_id, message_id, ts, role, snippet, score }`.
- **Scope rule:** MUST be project-scoped (per-project Tantivy index directory).
- **Secrets policy:** Persisted chat index content MUST comply with PolicyRule:no_secrets_in_storage / INV-002 (mandatory strict secrets scrubbing before persistence).
- **Context Lens integration:** When Context Lens mutes messages, chatsearch MUST exclude muted message_ids from results returned to the agent (or annotate them as excluded so the context packer can drop them).

**codesearch (project workspace code search; MVP multi-tier)**
- **Primary backend:** Tantivy code index (filesystem watcher + chunked documents; see Plans/storage-plan.md).
- **Secondary backend:** LSP `workspace/symbol` and/or `documentSymbol` for symbol-aware search when LSP is active (Plans/LSPSupport.md).
- **Fallback backend:** text grep/ripgrep (`grep` tool) when index is unavailable or query requires regex semantics.
- **Output:** Return best-effort results with stable `{ path, line_or_range, snippet, kind? }`.
- **Ignore + sensitive guards:** Respect `.gitignore` by default; exclude `.env` and `.env.*` (allow `.env.example`) consistent with FileSafe + Permissions defaults.
- **Secrets policy:** Any indexed/stored snippet text MUST be secrets-scrubbed before persistence to Tantivy.

**logsearch / logread (project logs)**
- **logsearch input:** `query: string`, optional `filters: { time_range?, run_id?, thread_id?, tool_name?, level? }`, `k?: number`.
- **logsearch output:** hits with `{ ts, summary, run_id?, thread_id?, tool_name?, level?, ref: { event_id? | blob_ref? } }`.
- **logread input:** `{ event_id? | blob_ref? }`.
- **logread output:** `{ content, truncated?: boolean, truncation_reason? }` (bounded by size caps).
- **Index rule:** Tantivy logs index stores summaries/snippets only; full payload remains out-of-index and is fetched via logread.
- **Secrets policy:** Log summaries/snippets and any persisted payload returned by logread MUST comply with PolicyRule:no_secrets_in_storage / INV-002 (mandatory strict secrets scrubbing before persistence).
- **Blob resolution:** `blob_ref` resolves to `storage/blobs/projects/{project_id}/logs/...` (see Plans/storage-plan.md).

**repo.import (external repo import; separate from workspace search)**
- **Input:** `{ source: string (URL or owner/repo), dest_path?, mode?: "new_project"|"add_workspace_root"|"temporary_mount" }`.
- **Behavior:** Resolve auth/clone URLs (GitHub via GitHubApiTool when applicable), then acquire repo via clone/download. Must not overwrite existing directories without explicit user confirmation.
- **Audit:** Always emit an audit entry in the thread (assistant-chat-design.md §13).
- **Permissions:** Default `ask` + respect network allow/deny rules and `external_directory` constraints.

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Permissions_System.md, PolicyRule:no_secrets_in_storage, ContractName:Plans/Architecture_Invariants.md#INV-002
Canonical input/output shapes align with [OpenCode built-in tools](https://opencode.ai/docs/tools/#built-in); platform runners normalize to/from these. Error conditions and limits are enforced by the adapter/runner before or after calling the platform.

**bash execution limits (required):**
- **Timeout:** default `120s` per bash invocation. On timeout, the adapter terminates the process, returns collected stdout/stderr up to that point, and marks the tool result as timed out.
- **Output cap:** default `512 KiB` per stream (`stdout`, `stderr`). If a stream exceeds the cap, the adapter truncates the in-thread payload, marks the result as truncated, and preserves the full payload in the persisted log/seglog record when available.
- **CWD resolution:** default to the active project/workspace root. In multi-root projects, use the root containing the active file when one exists; otherwise use the first configured workspace root. Explicit `cwd` overrides are allowed only within the permitted workspace scope.
- **User-visible behavior:** thread/audit rendering must disclose timeouts and truncation explicitly; it must not present partial output as complete output.

| Tool | Canonical input (key params) | Canonical output / result shape | Error conditions | Limits |
|------|-----------------------------|----------------------------------|------------------|--------|
| **bash** | `command: string`, `cwd?: string` | `stdout: string`, `stderr: string`, `exit_code: number`, `timed_out?: boolean`, `truncated?: boolean` | Permission denied (tool or FileSafe), command blocklist, timeout, non-zero exit | Timeout `120s` default; output cap `512 KiB` per stream by default; CWD = project/workspace per §3.5 bash limits |
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
| **webextract** | `url: string` | extracted page/site content + provenance refs | Permission denied, target unavailable, timeout | Same bounded network and response-size constraints as web tools generally |
| **webresearch** | `task: string` | multi-source research result + sources/provenance | Provider disabled or unavailable, rate limit, permission denied | Result count and research-budget limits |
| **webcrawl** | `url: string` | crawl results + traversed-source refs | Permission denied, timeout, crawl fan-out capped | Traversal/fan-out limit plus timeout |
| **webmap** | `url: string` | site map / structure summary + source refs | Permission denied, timeout | Traversal/fan-out limit plus timeout |
| **question** | `mode`, `header?`, `prompt?`, `questions[]` | `status`, `answers[]`, optional backward-compatible `answer_text?` | HITL unavailable (headless) → `unavailable`; dismiss/time-out are explicit outcomes | Blocking until user responds, dismisses, times out, or HITL is unavailable |
| **skill** | `path_or_name: string` | `content: string`, `name: string` | Path outside allowed roots, file not found, permission denied | Size cap (e.g. 64 KiB); path under allowed roots only |
| **todowrite** | `todos: Array<{ todo_id, title, summary, status, dependencies[]?, owner_hint?, verification_hint?, notes?, order_index? }>` | normalized todo-state acknowledgment / updated state | Subagent default deny; permission denied | Single normalized todo list per run/session/thread |
| **todoread** | -- | `todos: Array<{ todo_id, title, summary, status, dependencies[]?, owner_hint?, verification_hint?, notes?, order_index? }>` | Subagent default deny; permission denied | N/A |
| **lsp** | canonical `operation`, `path`, operation-specific params, `newName?` (rename only) | operation-specific read/navigation result; rename: `pending_approval` + edits or `rejected` | LSP unavailable, no server for language, timeout, invalid path/position, server crash mid-call | Timeout per request (e.g. 10s); return "LSP unavailable" or "LSP server error" on disconnect/crash |
| **task** | `subagent_type: string`, `prompt: string`, ... | `result: object` (subagent output) | Tool denied, subagent type unknown (not in canonical 42), launch failure | Per run config (max concurrent subagents etc.); validate subagent_type with subagent_registry (§3.6) |
| **codesearch** | `query: string`, `path?: string` | `results: Array<{ path, line, snippet }>` or symbol results when LSP available | Permission denied, search backend unavailable | Result limit (e.g. 100); timeout (e.g. 15s) |

**LSP sub-operations:** For `lsp`, `operation` determines the LSP method and return shape: `references` → `textDocument/references`; `definition` → `textDocument/definition`; `hover` → `textDocument/hover`; `rename` → `textDocument/prepareRename` + `textDocument/rename`, result pending user approval (§3.4.1). When the LSP server crashes or disconnects mid-call, return a structured error (e.g. `{ "error": "lsp_unavailable", "message": "LSP server closed or timed out" }`) so the agent can retry or fall back.

### 3.6 Task tool and the 42 subagents (Plans)

### 3.6A Task runtime addendum

The `task` tool launches resumable delegated runs rather than opaque fire-and-forget work.

Rules:
- task invocations should preserve a stable delegated run/task identity so later history and UI surfaces can correlate follow-ups and results
- task runs inherit a narrowed-or-equal permission snapshot rather than inventing a looser child policy
- top-level assistant flows remain the owner of direct user questionnaire prompting unless runtime explicitly delegates that boundary
- subagent assumptions about `todowrite` / `todoread` availability must honor the subagent-default deny policy unless run config explicitly overrides it

ContractRef: ContractName:Plans/orchestrator-subagent-integration.md, ContractName:Plans/Permissions_System.md, ContractName:Plans/storage-plan.md

The **task** tool launches a subagent by type. The **subagent_type** parameter must be one of the **canonical 42 subagents** documented in the Plans folder:

- **Plans/orchestrator-subagent-integration.md §4** -- Known subagent names (DRY:DATA:subagent_registry): Phase (3), Task language (9), Task domain (8), Task framework (4), Subtask (8), Iteration (2), Cross-phase/Interview (8, including `explorer` and `requirements-quality-reviewer`) = **42 total**. Used for orchestrator tier selection, GUI validation, and task-tool validation.
- **Plans/interview-subagent-integration.md** -- Phase assignments (e.g. Scope & Goals → product-manager, Architecture → architect-reviewer, Product/UX → ux-researcher); cross-phase roles (technical-writer, knowledge-synthesizer, context-manager, etc.).

**Implementation:** The central registry (e.g. `subagent_registry::is_valid_subagent_name(subagent_type)`) must be the single source of truth. When the **task** tool is invoked, validate `subagent_type` against the registry; if invalid, return a structured error (e.g. "Subagent type 'X' not in canonical list; see Plans/orchestrator-subagent-integration.md §4"). Persona content (SKILL.md) lives in `.github/agents/` and `.claude/agents/` (42 files); the runner loads the matching persona for the requested type.

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
ContractRef: ContractName:Plans/newtools.md, ContractName:Plans/Permissions_System.md, ContractName:Plans/Personas.md, ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md

MCP-discovered tools are first-class tools in the central registry and participate in the same requested-vs-effective resolution model as built-in, provider, custom, and skill-backed tools.

Rules:
- enabling an MCP server expresses requested availability, not guaranteed effective availability
- effective availability is recalculated from server health, provider/platform support, project scope, Persona/permission state, and policy at runtime
- project switching recalculates effective MCP availability for the new project context
- app-level-only permission scope is not sufficient for the promoted shell/project-switch model
- namespacing and wildcarding remain mandatory for policy resolution and diagnostics
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

Tool events feed analytics and the Usage tool widget. Align with **storage-plan.md** §2.2.

- **`tool.invoked`:** Emitted when a tool call is allowed and execution completes. Payload: `tool_name` (string, required), `run_id` (string, required), `thread_id` (string, optional), `latency_ms` (number, required; wall-clock execution time in milliseconds), `success` (boolean, required), `error` (string, optional when success is false). See storage-plan.md §2.2.
- **`tool.denied`:** Emitted when policy blocks (deny) or user declines ask. Payload: `tool_name`, `run_id`, `thread_id` (optional), `reason` (required: `permission_denied` or `user_declined`). Do not emit for FileSafe blocks. redb: `tool_permissions` in app config (`config:v1`); rollups key `rollups` / `tool_usage.{window}` per §8.4.

### 8.1 Config persistence

- **Where:** Tool permissions live in the same config as the rest of Settings (e.g. `GuiConfig` in memory, persisted to redb as `config:v1` per FinalGUISpec §15.1). Use the key **`tool_permissions`** (object: tool name or wildcard → `"allow"` | `"deny"` | `"ask"`, or per-tool object for granular rules per §10.1).
- **Scope:** Tool permissions support app-level defaults plus project-scoped overrides for the active project context. Project switching recalculates the effective permission set from the current scope layers.
- **Mid-run:** Run config is an immutable snapshot at start (FinalGUISpec §9.7). Changing Settings (including tool permissions) mid-run does **not** affect the active run; next run picks up the new config.

### 8.2 Policy application order and invocation flow
1. **When:** Policy is evaluated when a tool is about to be invoked. For CLI-based platforms, the provider or runner may observe tool calls in the stream, but Puppet Master remains authoritative for policy, terminal binding, and normalized outcome recording.
2. **Resolve binding:** For shell-capable calls, determine project, workspace tab, cwd, requested shell profile, and whether the call should bind to an existing terminal session or create a new one.
3. **Allow:** Pass through to platform (or execute built-in); emit `tool.invoked`; when shell execution occurs, write transcript and command-block observations into the canonical terminal model.
4. **Deny:** Do not pass to platform; return a structured error to the agent; emit `tool.denied` when supported.
5. **Ask:** In Assistant, show approval UI; on approve, treat as allow for that call (or session approval). In Orchestrator/Interview, if no UI exists, map to **deny** or a **pending-HITL** state when HITL is enabled.
6. **FileSafe:** After permission allows the tool, FileSafe still applies (for example bash blocklists, write scope, sensitive-path guards).
7. **Completion:** Normalize the executed outcome and persist enough data for later same-session reveal, history, analytics, and runtime reconciliation.

ContractRef: ContractName:Plans/Permissions_System.md, ContractName:Plans/FileSafe.md, ContractName:Plans/storage-plan.md

Shell-specific rules:
- `Open in Terminal` later resolves to the same bound terminal session when that session still exists
- a shell call blocked by permission or FileSafe does not create a success-shaped fallback terminal session
- provider CLIs may stream shell observations, but Puppet Master records canonical `terminal_session_id`, normalized command identity, cwd, and outcome state
- derived surfaces such as Output, Problems, and Ports consume these normalized records rather than inventing their own shell ownership

ContractRef: ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md, ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Run_Modes.md
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
If an MCP server is enabled but unavailable, the user sees deterministic degraded behavior.

Rules:
- the UI must show the server as unavailable with reason when that state is knowable
- tool visibility and invocation behavior follow one canonical policy rather than ad hoc hiding in one surface and disabled-state display in another
- when the tools are omitted from invocation surfaces, the unavailability still remains visible in settings/health diagnostics
- when a tool is shown but unavailable, the disabled reason and remediation path must be explicit
- no success-shaped fallback is allowed
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
| **Permission presets** | Presets: "Read-only" (deny edit, bash, webfetch, websearch), "Plan mode" (allow read/grep/glob/list only), "Full" (allow all with ask for bash/edit). | Simplifies config; maps to assistant modes (Ask, Plan, Agent). |
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
| **Plan mode** | Only `read`, `grep`, `glob`, `list`, `codesearch`, `chatsearch`, `logsearch` → allow; everything else → deny. |
| **Full** | All tools → allow except `bash`, `edit`, `repo.import` → ask. |

Store as the same TOML config; presets are a GUI shortcut to set multiple keys at once.
### 10.5 GUI ↔ config serialization

The Permissions GUI is specified in `Plans/Permissions_System.md` §10 and `Plans/FinalGUISpec.md` §7.4.10. The tool registry supplies the list of known tool names (built-in + MCP-discovered) to populate the GUI's per-tool list.

### 10.6 FileSafe integration order and API

- **Order:** (1) **Tool permission** (allow/deny/ask per `Plans/Permissions_System.md` §8) — if deny, stop and return "Tool disabled." (2) If **ask**, surface to user; on approve, continue. (3) **FileSafe** — for bash: command blocklist; for edit/write: write scope; for read: sensitive-file filter. If FileSafe blocks, return "Blocked by FileSafe: &lt;reason&gt;" and do not execute.
- **Single API (recommended):** `policy.may_execute_tool(tool_name, invocation_context) -> Result<Allow | Deny(reason) | Ask, Error>`. Internally: resolve permission (allow/deny/ask); if allow (or ask and approved), then run FileSafe check; return Allow only if both pass. Runner calls this once per tool call before executing or forwarding.
- **FileSafe contract:** FileSafe exposes e.g. `check_bash_command(cmd)`, `check_write_path(path)`, `check_read_path(path)`. Policy engine calls these after permission resolves to allow (or ask-approved).

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
| **orchestrator-subagent-integration.md** | Run config and tier wiring; **42 subagents** canonical list (§4, subagent_registry); task tool validates subagent_type against this list. MCP and tool flags passed to platform runner from same run-config build. |
| **interview-subagent-integration.md** | Interview phase assignments use the same **42 subagents**; config (framework tools, MCP enabled) drives test strategy and PRD; same MCP/tool config available to interview runs. |
| **FileSafe.md** | Safe-edit and path/URL guards; runs in addition to tool permissions; map to central tool policy and patch/apply/verify pipeline. |
| **usage-feature.md** | Tool usage and cost can be reflected in usage rollups (from seglog/analytics). |
| **LSPSupport.md** | LSP MVP; lsp tool promoted (§3.4, §3.5); diagnostics in context; §9.1. |
| **human-in-the-loop.md** | "Ask" permission and tier-boundary approval; orchestrator ask vs HITL behavior. |
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
